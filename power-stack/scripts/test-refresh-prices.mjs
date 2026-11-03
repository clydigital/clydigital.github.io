import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {
 parseYahooChart,parseStooqCsv,validateManifest,recentBusinessSession,
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
 assert.equal(validateManifest(m).length,50);
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
