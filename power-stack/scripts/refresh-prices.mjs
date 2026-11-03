#!/usr/bin/env node
/** Independent Power Stack completed-session quote collector.
 * Runs only in the PUBLIC Pages repository's GitHub Actions runner.
 * No Bluebelly, private portfolio, Supabase access or provider credentials.
 * Yahoo charts are unofficial and delayed; Stooq is a US-only fallback.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import path from "node:path";
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
  sourceName:source.name,sourceUrl:source.url,refreshStatus:"OK"};
}
export function parseYahooChart(payload,spec,now=new Date(),sourceUrl=""){
 const data=payload?.chart?.result?.[0];
 if(!data||payload?.chart?.error)throw Error("No chart result");
 if(String(data.meta?.symbol||"").toUpperCase()!==spec.providerSymbol.toUpperCase())throw Error("Provider symbol mismatch");
 if(String(data.meta?.currency||"").toUpperCase()!==spec.currency)throw Error("Provider currency mismatch");
 const stamps=data.timestamp,closes=data.indicators?.quote?.[0]?.close;
 if(!Array.isArray(stamps)||!Array.isArray(closes))throw Error("Incomplete chart arrays");
 return fromBars(spec,stamps.map((stamp,i)=>({
  sessionDate:Number.isFinite(stamp)?localDay(dayParts(new Date(stamp*1000),spec.timeZone)):"",
  close:closes[i],
 })),{name:"Yahoo Finance daily chart (unofficial, delayed)",url:sourceUrl},now);
}
export function parseStooqCsv(csv,spec,now=new Date(),sourceUrl=""){
 if(spec.currency!=="USD"||!/^([A-Z]{1,5})$/.test(spec.ticker))throw Error("Stooq fallback is US-only");
 const lines=csv.trim().split(/\r?\n/);
 if(!/^Date,Open,High,Low,Close,Volume\s*$/i.test(lines[0]||""))throw Error("Invalid daily CSV columns");
 const bars=lines.slice(1).map(line=>{
  const parts=line.split(",");return {sessionDate:parts[0],close:Number(parts[4])};
 });
 return fromBars(spec,bars,{name:"Stooq historical daily bars (unofficial, delayed)",url:sourceUrl},now);
}
export function validateManifest(input){
 if(input?.contractVersion!=="power-stack-public-symbols/1"||!Array.isArray(input.symbols)
  ||input.symbols.length<1||input.symbols.length>100)throw Error("Invalid public research universe");
 const seen=new Set();
 return input.symbols.map(x=>{
  if(!x||!/^([A-Z0-9][A-Z0-9.\-]{0,17})$/.test(x.ticker||"")
   ||!/^([A-Z0-9][A-Z0-9.\-]{0,24})$/.test(x.providerSymbol||"")
   ||!["USD","MYR","HKD"].includes(x.currency)
   ||!["America/New_York","Asia/Kuala_Lumpur","Asia/Hong_Kong"].includes(x.timeZone)
   ||seen.has(x.ticker))throw Error("Duplicate or unqualified research symbol");
  seen.add(x.ticker);
  if((x.providerSymbol.endsWith(".KL")? "MYR":x.providerSymbol.endsWith(".HK")?"HKD":"USD")!==x.currency)
    throw Error("Unreviewed provider-market mapping for "+x.ticker);
  return x;
 });
}
function noQuote(spec,reason){
 return {ticker:spec.ticker,providerSymbol:spec.providerSymbol,currency:spec.currency,
  status:"UNAVAILABLE",sessionDate:null,close:null,previousClose:null,
  changePct:null,change3dPct:null,change5dPct:null,sourceName:null,sourceUrl:null,
  refreshStatus:"FETCH_FAILED",reason:reason.slice(0,140)};
}
async function getUrl(url,asText=false,fetcher=fetch,timeoutMs=8500){
 const response=await fetcher(url,{headers:{Accept:asText?"text/csv":"application/json",
  "User-Agent":"Mozilla/5.0 PowerStack-public-quote-check/1"},signal:AbortSignal.timeout(timeoutMs),cache:"no-store"});
 if(!response.ok)throw Error("HTTP "+response.status);
 return asText?response.text():response.json();
}
export async function fetchSymbol(spec,{now=new Date(),fetcher=fetch}={}){
 const errors=[];
 for(const host of HOSTS){
  const url=host+"/v8/finance/chart/"+encodeURIComponent(spec.providerSymbol)+"?interval=1d&range=1mo&includePrePost=false";
  try{return parseYahooChart(await getUrl(url,false,fetcher),spec,now,url);}
  catch(err){errors.push("Yahoo:"+String(err.message||err).slice(0,50));}
 }
 if(spec.currency==="USD"&&/^[A-Z]{1,5}$/.test(spec.ticker)){
  const d2=now.toISOString().slice(0,10).replaceAll("-","");
  const d1=new Date(now.getTime()-35*86400000).toISOString().slice(0,10).replaceAll("-","");
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
  description:"Completed exchange sessions only. Independent from Bluebelly and personal positions. Not executable quotes.",
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
  validateManifest(JSON.parse(readFileSync(path.join(ROOT,"market-symbols.json"),"utf8")));
  const data=JSON.parse(readFileSync(target,"utf8"));
  if(data.contractVersion!==CONTRACT||!Array.isArray(data.rows))throw Error("Invalid stored quote tape");
  console.log("Power Stack price feed format verified");return;
 }
 if(process.argv.includes("--assert-coverage")){
   const tape=JSON.parse(readFileSync(target,"utf8"));
   if(tape.coverage?.fresh<1)throw Error("ZERO_FRESH_MARKET_PRICES: provider unavailable or exchange tape stale");
   console.log("Fresh session quotes:",tape.coverage.fresh,"/",tape.coverage.tracked);return;
 }
 const tape=await collect();
 mkdirSync(path.dirname(target),{recursive:true});
 writeFileSync(target,JSON.stringify(tape,null,2)+"\n");
 console.log("Source-dated independent Power Stack quote coverage:",JSON.stringify(tape.coverage));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 main().catch(err=>{console.error("Power Stack price collector failure:",String(err.message||err));process.exitCode=1;});
}
