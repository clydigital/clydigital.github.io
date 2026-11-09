import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assessIdea,sweepSignals,freshDate} from "../owner-ideas-core.mjs";
const now=new Date("2026-11-10T05:00:00Z");
const evidence={
 ticker:"CVX",idea_type:"INVESTMENT",peg:.73,peg_as_of:"2026-11-06",
 peg_basis:"Five-year expected earnings growth",peg_source_url:"https://finance.yahoo.com/quote/CVX/key-statistics/",
 macro_state:"SUPPORTIVE",macro_as_of:"2026-11-09",macro_reason:"Verified demand and earnings regime improving",
 macro_source_url:"https://www.eia.gov/",watch_low:190,watch_high:200,currency:"USD",
};
const q={close:195,session:"2026-11-09",currency:"USD"};
test("alignment requires PEG + macro + price to align",()=>{
 const a=assessIdea(evidence,q,now);
 assert.equal(a.status,"ALIGNED");
 assert.equal(a.price,195);
 assert.equal(a.distance,0);
});
test("price above zone is wait, not an automatic purchase",()=>{
 const a=assessIdea(evidence,{...q,close:212},now);
 assert.equal(a.status,"WATCH");
 assert(a.distance>0);
});
test("price below watch support triggers re-underwriting, not a blind buy",()=>{
 assert.equal(assessIdea(evidence,{...q,close:170},now).status,"RECHECK");
});
test("cheap PEG during adverse macros is divergence",()=>{
 const a=assessIdea({...evidence,macro_state:"ADVERSE"},q,now);
 assert.equal(a.status,"DIVERGENCE");
 assert.match(a.why,/value trap/);
});
test("supportive macro but expensive growth valuation is divergence",()=>{
 assert.equal(assessIdea({...evidence,peg:1.4},q,now).status,"DIVERGENCE");
});
test("old or undocumented valuation cannot align",()=>{
 for(const patch of [{peg_as_of:"2026-05-01"},{peg_source_url:""},{peg_basis:""},{peg:null}]){
  assert.equal(assessIdea({...evidence,...patch},q,now).status,"RECHECK");
 }
});
test("missing or stale macro evidence cannot align",()=>{
 for(const patch of [{macro_as_of:"2026-10-01"},{macro_source_url:""},{macro_state:"UNKNOWN"}]){
  assert.equal(assessIdea({...evidence,...patch},q,now).status,"RECHECK");
 }
});
test("quote unavailable or outside fresh-session window blocks alignment",()=>{
 assert.equal(assessIdea(evidence,null,now).status,"RECHECK");
 assert.equal(assessIdea(evidence,{...q,session:"2026-10-28"},now).status,"RECHECK");
});
test("missing watch price level blocks alignment",()=>{
 assert.equal(assessIdea({...evidence,watch_low:null},q,now).status,"RECHECK");
});
test("sweep flags divergences alongside opportunities",()=>{
 const r=sweepSignals([evidence,{...evidence,ticker:"XOM",macro_state:"ADVERSE"}],
  new Map([["CVX",q],["XOM",q]]),now);
 assert.equal(r[0].status,"ALIGNED");assert.equal(r[1].status,"DIVERGENCE");
});
test("public static shell has no member quotes, holdings or private investment idea records",()=>{
 const html=readFileSync(new URL("../ideas.html",import.meta.url),"utf8");
 const gate=readFileSync(new URL("../auth-gate.mjs",import.meta.url),"utf8");
 const ui=readFileSync(new URL("../owner-ideas-tracker.mjs",import.meta.url),"utf8");
 assert(html.includes('data-private-page="ideas"'));
 assert(html.includes('id="private-main" hidden'));
 assert(gate.indexOf('const user=await authenticate()')<gate.indexOf('if(PAGE==="ideas")'));
 assert(!/sb_secret_|service_role|brokerQuantity|\"owner_user_id\":/.test(ui+html));
 assert(!/<main\b/i.test(html));
});
