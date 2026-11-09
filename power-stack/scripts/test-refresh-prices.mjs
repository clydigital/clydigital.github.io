import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {quotes,recentSession,approvedQuoteSource} from "../owner-portfolio-table.mjs";
import {COVERAGE,RESEARCH_PRIORITIES,researchPriority} from "../research-cases.mjs";
import {
 parseYahooChart,parseStooqCsv,parseCoinGeckoBitcoin,validateManifest,recentBusinessSession,
 asPriceFeed,fetchSymbol,CONTRACT,
} from "./refresh-prices.mjs";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const usd={ticker:"XOM",providerSymbol:"XOM",currency:"USD",timeZone:"America/New_York"};
const myr={ticker:"DAYANG",providerSymbol:"5141.KL",currency:"MYR",timeZone:"Asia/Kuala_Lumpur"};
const now=new Date("2026-11-03T23:00:00Z");
function yahoo(spec,days=["2026-10-26","2026-10-27","2026-10-28","2026-10-29","2026-10-30","2026-11-02","2026-11-03"],closes=[80,82,83,84,85,86,90]){
 const hour=spec.currency==="USD"?"13:30:00Z":"01:30:00Z";
 return {chart:{result:[{meta:{symbol:spec.providerSymbol,currency:spec.currency},
 timestamp:days.map(d=>Date.parse(d+"T"+hour)/1000),indicators:{quote:[{close:closes}]}}],error:null}};
}
test("manifest uses a non-owner public research universe and no holdings quantities",()=>{
 const m=JSON.parse(readFileSync(path.join(ROOT,"market-symbols.json"),"utf8"));
 assert.equal(validateManifest(m).length,98);
 assert.ok(!JSON.stringify(m).includes("quantityAsOf"));
 assert.ok(!JSON.stringify(m).includes("owner_user_id"));
 assert.ok(!JSON.stringify(m.symbols).includes("holdings"));
 assert.deepEqual(validateManifest(m).find(x=>x.ticker==="DAYANG"),myr);
 assert.throws(()=>validateManifest({...m,symbols:[usd,usd]}),/Duplicate/);
});
test("source-dated Yahoo closes distinguish 1D, 3D and 5D completed sessions",()=>{
 const q=parseYahooChart(yahoo(usd),usd,now);
 assert.equal(q.status,"CLOSED");
 assert.equal(q.sessionDate,"2026-11-03");
 assert.equal(q.close,90);
 assert.equal(q.previousClose,86);
 assert.equal(q.changePct,4.651);
 assert.equal(q.change3dPct,7.143);
 assert.equal(q.change5dPct,9.756);
 assert.equal(q.currency,"USD");
});
test("uncompleted same-session bars remain excluded, and mismatched symbols/currencies fail",()=>{
 const before=new Date("2026-11-03T16:00:00Z");
 const q=parseYahooChart(yahoo(usd),usd,before);
 assert.equal(q.sessionDate,"2026-11-02");
 assert.throws(()=>parseYahooChart(yahoo({...usd,providerSymbol:"TSLA"}),usd,now),/symbol mismatch/);
 assert.throws(()=>parseYahooChart(yahoo({...usd,currency:"HKD"}),usd,now),/currency mismatch/);
 const m=parseYahooChart(yahoo(myr),myr,new Date("2026-11-03T12:00:00Z"));
 assert.equal(m.currency,"MYR");
 assert.equal(m.sessionDate,"2026-11-03");
});
test("Stooq fallback only accepts US historical CSV with completed session dates",()=>{
 const rows=["Date,Open,High,Low,Close,Volume"];
 for(let i=0;i<7;i++){let d=["2026-10-26","2026-10-27","2026-10-28","2026-10-29","2026-10-30","2026-11-02","2026-11-03"][i];rows.push(d+",20,23,19,"+(20+i)+",100");}
 const q=parseStooqCsv(rows.join("\n"),usd,now,"https://stooq.com/q/d/l/?s=xom.us");
 assert.equal(q.close,26);
 assert.equal(q.changePct,4);
 assert.match(q.sourceName,/Stooq/);
 assert.throws(()=>parseStooqCsv(rows.join("\n"),myr,now),/US-only/);
});
test("stale quotes are flagged and holiday/market closures do not invent dates",()=>{
 assert.equal(recentBusinessSession("2026-10-30",new Date("2026-11-03T23:00:00Z")),true);
 assert.equal(recentBusinessSession("2026-10-20",now),false);
 assert.equal(recentBusinessSession("2026-11-10",now),false);
 const q=parseYahooChart(yahoo(usd,["2026-10-15","2026-10-16"],[10,11]),usd,now);
 assert.equal(q.status,"STALE");
});
test("two Yahoo outages yield explicit no-quote record without fake price",async()=>{
 const q=await fetchSymbol(usd,{now,fetcher:async()=>new Response("unavailable",{status:429})});
 assert.equal(q.status,"UNAVAILABLE");assert.equal(q.close,null);
 assert.equal(q.changePct,null);assert.equal(q.sessionDate,null);
 assert.match(q.reason,/429/);
});
test("producer preserves per-symbol missingness and a zero-success coverage warning",()=>{
 const out=asPriceFeed([usd,myr],[{...usd,status:"CLOSED",close:22,sessionDate:"2026-11-03"}],now);
 assert.equal(out.contractVersion,CONTRACT);assert.equal(out.coverage.tracked,2);
 assert.equal(out.coverage.fresh,1);assert.equal(out.coverage.unavailable,1);
 assert.equal(out.rows[1].close,null);
 const js=readFileSync(path.join(ROOT,"owner-portfolio-table.mjs"),"utf8");
 assert.match(js,/market-prices\.json/);
 assert.doesNotMatch(js,/quoteScan|bluebelly-private-power-stack-scan/);
});

test("neutral research catalogue covers overseas and emerging-market tickers without guessing a warrant listing",()=>{
 const manifest=JSON.parse(readFileSync(path.join(ROOT,"market-symbols.json"),"utf8"));
 const names=new Map(validateManifest(manifest).map(x=>[x.ticker,x]));
 assert.deepEqual(names.get("688825"),{ticker:"688825",providerSymbol:"688825.SS",
    currency:"CNY",timeZone:"Asia/Shanghai"});
 assert.deepEqual(names.get("3191.HK"),{ticker:"3191.HK",providerSymbol:"3191.HK",
    currency:"HKD",timeZone:"Asia/Hong_Kong"});
 assert.equal(names.get("6742UW")?.marketType,"unresolved");
 assert.deepEqual(names.get("MNHLDG"),{ticker:"MNHLDG",providerSymbol:"0245.KL",
   currency:"MYR",timeZone:"Asia/Kuala_Lumpur"});
 assert.equal(names.get("BTC")?.marketType,"crypto");
 assert.throws(()=>validateManifest({...manifest,symbols:[{...names.get("6742UW"),providerSymbol:"6742.KL"}]}),
   /unsupported instrument mapping/);
 assert.throws(()=>validateManifest({...manifest,symbols:[{...names.get("688825"),currency:"USD"}]}),
   /mapping/);
});
test("24/7 BTC/USD uses completed UTC daily samples rather than US stock-session timestamps",async()=>{
 const spec={ticker:"BTC",providerSymbol:null,currency:"USD",timeZone:"UTC",marketType:"crypto"};
 const dates=["2026-10-25","2026-10-26","2026-10-27","2026-10-28","2026-10-29",
   "2026-10-30","2026-10-31","2026-11-01","2026-11-02","2026-11-03"];
 const data={prices:dates.map((d,i)=>[Date.parse(d+"T00:00:00Z"),100000+i*1000])};
 const parsed=parseCoinGeckoBitcoin(data,spec,new Date("2026-11-03T19:00:00Z"),
   "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30");
 assert.equal(parsed.sessionDate,"2026-11-02");
 assert.equal(parsed.close,108000);
 assert.equal(parsed.status,"CLOSED");
 assert.match(parsed.sourceName,/BTC\/USD UTC/);
 assert.match(parsed.marketBasis,/not exchange-listed shares/);
 const full=await fetchSymbol(spec,{now:new Date("2026-11-03T19:00:00Z"),
   fetcher:async()=>new Response(JSON.stringify(data),{status:200})});
 assert.equal(full.close,108000);
 assert.equal(full.currency,"USD");
 assert.match(full.sourceUrl,/api.coingecko.com/);
 const unavailable=await fetchSymbol(spec,{now,
   fetcher:async()=>new Response("429 rate-limited",{status:429})});
 assert.equal(unavailable.status,"UNAVAILABLE");
 assert.equal(unavailable.close,null);
});
test("unmapped instruments are retained as unavailable without requesting their underlying or guessed series",async()=>{
 const specs=[
  {ticker:"6742UW",providerSymbol:null,currency:null,timeZone:null,marketType:"unresolved",
   reason:"Series and strike unavailable; no proxy"},

 ];
 let requests=0;
 for(const spec of specs){
  const q=await fetchSymbol(spec,{now,fetcher:async()=>{requests++;throw Error("should not fetch")}});
  assert.equal(q.status,"UNAVAILABLE");assert.equal(q.refreshStatus,"UNMAPPED");
  assert.equal(q.close,null);assert.equal(q.sourceUrl,null);
 }
 assert.equal(requests,0);
});

test("portfolio quote consumer accepts CNY and BTC UTC samples but rejects malformed feeds",()=>{
 const btcUrl="https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30";
 const now=new Date("2026-11-04T12:00:00Z");
 assert.equal(recentSession("2026-10-30",now),true);
 assert.equal(recentSession("2026-10-30",new Date("2026-11-05T12:00:00Z")),false);
 assert.equal(recentSession("2026-11-10",now),false);
 assert.equal(approvedQuoteSource(btcUrl,"BTC"),true);
 assert.equal(approvedQuoteSource(btcUrl,"XOM"),false);
 assert.equal(approvedQuoteSource("http://api.coingecko.com/api/v3/coins/bitcoin/market_chart","BTC"),false);
 assert.equal(approvedQuoteSource("https://attacker.example/v8/finance/chart/XOM","XOM"),false);
 const feed={generatedAt:"2026-11-04T00:00:00Z",coverage:{tracked:6,fresh:4},rows:[
  {ticker:"688825",currency:"CNY",status:"CLOSED",sessionDate:"2026-11-03",close:62.3,
   sourceUrl:"https://query2.finance.yahoo.com/v8/finance/chart/688825.SS?interval=1d&range=1mo&includePrePost=false",changePct:2},
  {ticker:"BTC",currency:"USD",status:"CLOSED",sessionDate:"2026-11-03",close:71000,
   marketBasis:"BTC/USD daily UTC sample; not exchange-listed shares or a stock-market close",
   sourceUrl:btcUrl},
  {ticker:"XOM",currency:"USD",status:"CLOSED",sessionDate:"2026-11-03",close:200,
   sourceUrl:"https://attacker.example/v8/finance/chart/XOM"},
  {ticker:"6742UW",status:"UNAVAILABLE",sessionDate:null,close:null,sourceUrl:null},
  {ticker:"DAYANG",currency:"MYR",status:"STALE",sessionDate:"2026-10-20",close:3,
   sourceUrl:"https://query2.finance.yahoo.com/v8/finance/chart/5141.KL"},
  {ticker:"FUTURE",currency:"USD",status:"CLOSED",sessionDate:"2026-11-10",close:3,
   sourceUrl:"https://query2.finance.yahoo.com/v8/finance/chart/FUTURE"}
 ]};
 const scan=quotes(feed,now);
 assert.equal(scan.holding.get("688825")?.close,62.3);
 assert.equal(scan.holding.get("BTC")?.basis,"BTC UTC daily sample");
 for(const ticker of ["XOM","6742UW","DAYANG","FUTURE"])
  assert.equal(scan.holding.has(ticker),false,ticker);
});
test("all issuer research statuses have deterministic priority; refreshed Q3 cases retain source dates",()=>{
 for(const [ticker,item] of Object.entries(COVERAGE))
  assert.ok(Object.hasOwn(RESEARCH_PRIORITIES,item.posture),ticker+" "+item.posture);
 assert.equal(researchPriority("ADVANCE DILIGENCE / CREDIT GATE"),3);
 assert.equal(researchPriority("EVENT GATE"),1);
 assert.equal(researchPriority("UNKNOWN NEW STATUS"),8);
 assert.equal(COVERAGE.ETN.asOf,"2026-11-03");
 assert.equal(COVERAGE.GEV.asOf,"2026-10-28");
 assert.equal(COVERAGE.CF.posture,"ADVANCE / PRICE GATE");
 assert.ok(Date.parse(COVERAGE.CF.asOf+"T00:00:00Z")>=Date.parse("2026-11-04T00:00:00Z"),"CF Q3 source date");
 assert.match(COVERAGE.ETN.source,/sec\.gov/);
 assert.match(COVERAGE.GEV.source,/sec\.gov/);
});
test("Power Stack site modules parse and owner-only auth has no hardcoded email",()=>{
 for(const name of ["owner-portfolio-table.mjs","owner-decisions.mjs","research-cases.mjs","auth-gate.mjs"])
  assert.doesNotThrow(()=>execFileSync(process.execPath,["--check",path.join(ROOT,name)],{stdio:"pipe"}),name);
 const auth=readFileSync(path.join(ROOT,"auth-gate.mjs"),"utf8");
 assert.doesNotMatch(auth,/APPROVED_EMAIL|gmail\.com/);
 assert.match(auth,/app_metadata\?\.provider/);
 const portfolio=readFileSync(path.join(ROOT,"owner-portfolio-table.mjs"),"utf8");
 assert.match(portfolio,/\.eq\("owner_user_id",user.id\)/);
});

test("every private page and dynamic module uses the same versioned release assets",()=>{
 const version="20261110-d3";
 for(const page of ["index","research","sectors","decisions","portfolio"]){
  const shell=readFileSync(path.join(ROOT,page+".html"),"utf8");
  assert.ok(shell.includes('src="auth-gate.mjs?v='+version+'"'),page);
 }
 const gate=readFileSync(path.join(ROOT,"auth-gate.mjs"),"utf8");
 for(const name of ["owner-portfolio-table","owner-decisions","owner-decision-desk"]){
  assert.match(gate,new RegExp(name+"\\.mjs\\?v=[A-Za-z0-9-]+"),name);
 }
 const decisions=readFileSync(path.join(ROOT,"owner-decisions.mjs"),"utf8");
 assert.match(decisions,/research-cases\.mjs\?v=[A-Za-z0-9-]+/);
});
