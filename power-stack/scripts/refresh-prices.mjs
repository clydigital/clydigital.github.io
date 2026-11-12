#!/usr/bin/env node
/** Independent Power Stack completed-session quote collector.
 * Runs only in the PUBLIC Pages repository's GitHub Actions runner.
 * No Bluebelly, private portfolio, Supabase access or provider credentials.
 * Yahoo charts are unofficial and delayed; Stooq is a US-only fallback.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {calculateDailyTechnical,TECHNICAL_CONTRACT} from "./price-technicals.mjs";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
export const CONTRACT="power-stack-public-prices/1";
const HOSTS=["https://query2.finance.yahoo.com","https://query1.finance.yahoo.com"];
const round=(v,n=4)=>Number(Number(v).toFixed(n));
const validDay=v=>/^20\d{2}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+"T12:00:00Z"));
const dayParts=(date,tz)=>Object.fromEntries(new Intl.DateTimeFormat("en-US",{
 timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",
 hourCycle:"h23",weekday:"short",
}).formatToParts(date).map(x=>[x.type,x.value]));
const localDay=p=>p.year+"-"+p.month+"-"+p.day;
function completed(date,spec,now){
 const parts=dayParts(now,spec.timeZone),today=localDay(parts);
 if(date>today)return false;
 if(date!==today)return true;
 if(parts.weekday==="Sat"||parts.weekday==="Sun")return false;
 return Number(parts.hour)>=((spec.timeZone==="America/New_York")?17:18);
}
export function recentBusinessSession(date,now=new Date(),maxBusinessDays=3){
 if(!validDay(date)||!Number.isFinite(now.getTime()))return false;
 const d=Date.parse(date+"T12:00:00Z"),today=Date.parse(now.toISOString().slice(0,10)+"T12:00:00Z");
 if(d>today)return false;
 let count=0;for(let t=d+86400000;t<=today;t+=86400000){
   const w=new Date(t).getUTCDay();if(w!==0&&w!==6)count++;
 }
 return count<=maxBusinessDays;
}
function fromBars(spec,bars,source,now){
 const sessions=[...new Map(bars.filter(x=>validDay(x.sessionDate)&&Number.isFinite(x.close)
   &&x.close>0&&completed(x.sessionDate,spec,now)).map(x=>[x.sessionDate,x])).values()]
   .sort((a,b)=>a.sessionDate.localeCompare(b.sessionDate));
 if(sessions.length<2)throw Error("Fewer than two completed price sessions");
 const last=sessions.at(-1);
 const diff=n=>sessions.length>n&&sessions.at(-1-n)?.close>0
  ?round(100*(last.close/sessions.at(-1-n).close-1),3):null;
 return {ticker:spec.ticker,providerSymbol:spec.providerSymbol,currency:spec.currency,
  status:recentBusinessSession(last.sessionDate,now)?"CLOSED":"STALE",
  sessionDate:last.sessionDate,close:round(last.close),previousClose:round(sessions.at(-2).close),
  changePct:diff(1),change3dPct:diff(3),change5dPct:diff(5),
  technicals:calculateDailyTechnical(sessions,{sessionDate:last.sessionDate}),
  sourceName:source.name,sourceUrl:source.url,refreshStatus:"OK"};
}
export function parseYahooChart(payload,spec,now=new Date(),sourceUrl=""){
 const data=payload?.chart?.result?.[0];
 if(!data||payload?.chart?.error)throw Error("No chart result");
 if(String(data.meta?.symbol||"").toUpperCase()!==spec.providerSymbol.toUpperCase())throw Error("Provider symbol mismatch");
 if(String(data.meta?.currency||"").toUpperCase()!==spec.currency)throw Error("Provider currency mismatch");
 const stamps=data.timestamp,quote=data.indicators?.quote?.[0]||{},closes=quote.close;
 if(!Array.isArray(stamps)||!Array.isArray(closes))throw Error("Incomplete chart arrays");
 return fromBars(spec,stamps.map((stamp,i)=>({
  sessionDate:Number.isFinite(stamp)?localDay(dayParts(new Date(stamp*1000),spec.timeZone)):"",
  close:closes[i],high:quote.high?.[i]??null,low:quote.low?.[i]??null,
  volume:quote.volume?.[i]??null,
 })),{name:"Yahoo Finance daily chart (unofficial, delayed)",url:sourceUrl},now);
}
export function parseStooqCsv(csv,spec,now=new Date(),sourceUrl=""){
 if(spec.currency!=="USD"||!/^([A-Z]{1,5})$/.test(spec.ticker))throw Error("Stooq fallback is US-only");
 const lines=csv.trim().split(/\r?\n/);
 if(!/^Date,Open,High,Low,Close,Volume\s*$/i.test(lines[0]||""))throw Error("Invalid daily CSV columns");
 const bars=lines.slice(1).map(line=>{
  const parts=line.split(",");return {sessionDate:parts[0],close:Number(parts[4]),
    high:parts[2]?Number(parts[2]):null,low:parts[3]?Number(parts[3]):null,
    volume:parts[5]?Number(parts[5]):null};
 });
 return fromBars(spec,bars,{name:"Stooq historical daily bars (unofficial, delayed)",url:sourceUrl},now);
}
export function validateManifest(input){
 if(input?.contractVersion!=="power-stack-public-symbols/1"||!Array.isArray(input.symbols)
  ||input.symbols.length<1||input.symbols.length>120)throw Error("Invalid public research universe");
 const seen=new Set();
 return input.symbols.map(x=>{
  if(!x||!/^([A-Z0-9][A-Z0-9.\-]{0,17})$/.test(x.ticker||"")
   ||seen.has(x.ticker))throw Error("Duplicate or unqualified research symbol");
  seen.add(x.ticker);
  // Unmapped instruments remain present for gap visibility but NEVER receive
  // a guessed underlying share quote or invented tradable price.
  if(x.marketType==="unresolved"){
   if(x.ticker!=="6742UW"||x.providerSymbol!==null
     ||x.currency!==null||x.timeZone!==null
     ||typeof x.reason!=="string"||x.reason.length<12)
      throw Error("Unapproved unsupported instrument mapping");
   return x;
  }
  if(x.marketType==="crypto"){
   if(x.ticker!=="BTC"||x.providerSymbol!==null
     ||x.currency!=="USD"||x.timeZone!=="UTC")
      throw Error("Unapproved 24/7 crypto market mapping");
   return x;
  }
  if(x.marketType!==undefined
   ||!/^([A-Z0-9][A-Z0-9.\-]{0,24})$/.test(x.providerSymbol||"")
   ||!["USD","MYR","HKD","CNY","EUR","DKK"].includes(x.currency)
   ||!["America/New_York","Asia/Kuala_Lumpur","Asia/Hong_Kong","Asia/Shanghai","Europe/Amsterdam","Europe/Berlin","Europe/Paris","Europe/Copenhagen"].includes(x.timeZone))
    throw Error("Invalid public research ticker mapping");
  const expected=x.providerSymbol.endsWith(".KL")?["MYR","Asia/Kuala_Lumpur"]
   :x.providerSymbol.endsWith(".HK")?["HKD","Asia/Hong_Kong"]
   :x.providerSymbol.endsWith(".SS")||x.providerSymbol.endsWith(".SZ")?["CNY","Asia/Shanghai"]
   :x.providerSymbol.endsWith(".AS")?["EUR","Europe/Amsterdam"]
   :x.providerSymbol.endsWith(".DE")?["EUR","Europe/Berlin"]
   :x.providerSymbol.endsWith(".PA")?["EUR","Europe/Paris"]
   :x.providerSymbol.endsWith(".CO")?["DKK","Europe/Copenhagen"]
   :["USD","America/New_York"];
  if(x.currency!==expected[0]||x.timeZone!==expected[1])
    throw Error("Unreviewed provider-market mapping for "+x.ticker);
  return x;
 });
}
function noQuote(spec,reason){
 return {ticker:spec.ticker,providerSymbol:spec.providerSymbol,currency:spec.currency,
  status:"UNAVAILABLE",sessionDate:null,close:null,previousClose:null,
  changePct:null,change3dPct:null,change5dPct:null,technicals:null,sourceName:null,sourceUrl:null,
  refreshStatus:"FETCH_FAILED",reason:reason.slice(0,140)};
}
async function getUrl(url,asText=false,fetcher=fetch,timeoutMs=8500){
 const response=await fetcher(url,{headers:{Accept:asText?"text/csv":"application/json",
  "User-Agent":"Mozilla/5.0 PowerStack-public-quote-check/1"},signal:AbortSignal.timeout(timeoutMs),cache:"no-store"});
 if(!response.ok)throw Error("HTTP "+response.status);
 return asText?response.text():response.json();
}
/** CoinGecko aggregated BTC/USD UTC daily samples, NOT an exchange close.
 * The free keyless endpoint can be throttled. An optional GitHub Actions secret
 * enables a Demo key in request headers; never persist it in the source URL.
 */
export function parseCoinGeckoBitcoin(data,spec,now=new Date(),sourceUrl=""){
 if(spec.marketType!=="crypto"||spec.ticker!=="BTC"||spec.currency!=="USD"
   ||!Array.isArray(data?.prices))throw Error("Unqualified aggregated BTC/USD source");
 const today=now.toISOString().slice(0,10);
 const observations=data.prices.map(x=>Array.isArray(x)&&x.length>=2?
  {stamp:Number(x[0]),close:Number(x[1])}:null)
  .filter(x=>x&&Number.isFinite(x.stamp)&&x.stamp>0
     &&Number.isFinite(x.close)&&x.close>0)
  .map(x=>({sessionDate:new Date(x.stamp).toISOString().slice(0,10),close:x.close}))
  .filter(x=>x.sessionDate<today);
 const base=fromBars({...spec,timeZone:"UTC"},observations,{
  name:"CoinGecko aggregated BTC/USD UTC daily sample (24/7, delayed)",
  url:sourceUrl,
 },now);
 const ageDays=(Date.parse(today+"T00:00:00Z")
  -Date.parse(base.sessionDate+"T00:00:00Z"))/86400000;
 return {...base,status:ageDays<=2?"CLOSED":"STALE",
  marketBasis:"BTC/USD daily UTC sample; not exchange-listed shares or a stock-market close"};
}
export async function fetchCryptoBitcoin(spec,{now=new Date(),fetcher=fetch}={}){
 const url="https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30";
 const apiKey=process.env.COINGECKO_DEMO_API_KEY;
 const headers={accept:"application/json",...(apiKey?{"x-cg-demo-api-key":apiKey}:{})};
 const response=await fetcher(url,{headers,signal:AbortSignal.timeout(9000),cache:"no-store"});
 if(!response.ok)throw Error("CoinGecko BTC/USD HTTP "+response.status);
 return parseCoinGeckoBitcoin(await response.json(),spec,now,url);
}
export async function fetchSymbol(spec,{now=new Date(),fetcher=fetch}={}){
 if(spec.marketType==="unresolved")return {...noQuote(spec,spec.reason),refreshStatus:"UNMAPPED"};
 if(spec.marketType==="crypto"){
  try{return await fetchCryptoBitcoin(spec,{now,fetcher});}
  catch(err){return noQuote(spec,"BTC/USD source unavailable: "+String(err.message||err));}
 }
 const errors=[];
 for(const host of HOSTS){
  const url=host+"/v8/finance/chart/"+encodeURIComponent(spec.providerSymbol)+"?interval=1d&range=2y&includePrePost=false";
  try{return parseYahooChart(await getUrl(url,false,fetcher),spec,now,url);}
  catch(err){errors.push("Yahoo:"+String(err.message||err).slice(0,50));}
 }
 if(spec.currency==="USD"&&/^[A-Z]{1,5}$/.test(spec.ticker)){
  const d2=now.toISOString().slice(0,10).replaceAll("-","");
  const d1=new Date(now.getTime()-740*86400000).toISOString().slice(0,10).replaceAll("-","");
  const url="https://stooq.com/q/d/l/?s="+spec.ticker.toLowerCase()+".us&i=d&d1="+d1+"&d2="+d2;
  try{return parseStooqCsv(await getUrl(url,true,fetcher),spec,now,url);}
  catch(err){errors.push("Stooq:"+String(err.message||err).slice(0,50));}
 }
 return noQuote(spec,errors.join("; ")||"Provider unavailable");
}
export function asPriceFeed(specs,quotes,now=new Date()){
 const rows=specs.map((s,i)=>quotes[i]||noQuote(s,"Collector did not return a row"));
 const fresh=rows.filter(r=>r.status==="CLOSED").length,stale=rows.filter(r=>r.status==="STALE").length;
 return {contractVersion:CONTRACT,generatedAt:now.toISOString(),isDelayed:true,
  description:"Completed sessions, delayed price changes and optional daily technical observations. Independent of Bluebelly and personal positions; not executable quotes.",
  technicalContract:TECHNICAL_CONTRACT,
  universeSource:"market-symbols.json",coverage:{tracked:rows.length,fresh,stale,unavailable:rows.length-fresh-stale},
  rows};
}
export async function collect({now=new Date(),fetcher=fetch,concurrency=5}={}){
 const source=JSON.parse(readFileSync(path.join(ROOT,"market-symbols.json"),"utf8"));
 const specs=validateManifest(source),rows=new Array(specs.length);
 let cursor=0;
 await Promise.all(Array.from({length:Math.min(concurrency,specs.length)},async()=>{
   for(;;){const i=cursor++;if(i>=specs.length)break;
     rows[i]=await fetchSymbol(specs[i],{now,fetcher});
   }
 }));
 return asPriceFeed(specs,rows,now);
}
async function main(){
 const target=path.join(ROOT,"market-prices.json");
 if(process.argv.includes("--check")){
  const specs=validateManifest(JSON.parse(readFileSync(path.join(ROOT,"market-symbols.json"),"utf8")));
  const data=JSON.parse(readFileSync(target,"utf8"));
  if(data.contractVersion!==CONTRACT||!Array.isArray(data.rows)||data.rows.length!==specs.length)
    throw Error("Invalid or incomplete public quote tape");
  for(let i=0;i<specs.length;i++){
   const row=data.rows[i],spec=specs[i];
   if(!row||row.ticker!==spec.ticker||row.currency!==spec.currency
     ||!["CLOSED","STALE","UNAVAILABLE"].includes(row.status)
     ||(spec.marketType==="unresolved"&&row.status!=="UNAVAILABLE"))
     throw Error("Public ticker identity, status or unsupported-mapping mismatch");
   if(row.technicals && (row.technicals.contractVersion!==TECHNICAL_CONTRACT ||
     row.technicals.asOf!==row.sessionDate || !["OBSERVED","UNAVAILABLE"].includes(row.technicals.status)))
      throw Error("Technical as-of, status or contract mismatch for "+spec.ticker);
  }
  console.log("Power Stack public quote tape verified for "+specs.length+" neutral research symbols");return;
 }
 if(process.argv.includes("--assert-coverage")){
   const tape=JSON.parse(readFileSync(target,"utf8"));
   const specs=validateManifest(JSON.parse(readFileSync(path.join(ROOT,"market-symbols.json"),"utf8")));
   const priceable=specs.filter(s=>s.marketType!=="unresolved").length;
   const minFresh=Math.ceil(priceable*0.75);
   if((tape.coverage?.fresh??0)<minFresh)
     throw Error("LOW_LIVE_MARKET_COVERAGE: only "+(tape.coverage?.fresh??0)+
      "/"+priceable+" supported sources fresh; minimum "+minFresh);
   console.log("Independent source-dated daily coverage:",tape.coverage.fresh,"/",priceable,
      "priceable; unsupported names stay unpriced");return;
 }
 const tape=await collect();
 mkdirSync(path.dirname(target),{recursive:true});
 writeFileSync(target,JSON.stringify(tape,null,2)+"\n");
 console.log("Source-dated independent Power Stack quote coverage:",JSON.stringify(tape.coverage));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 main().catch(err=>{console.error("Power Stack price collector failure:",String(err.message||err));process.exitCode=1;});
}
