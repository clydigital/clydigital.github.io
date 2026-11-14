import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";
import {REVIEW_FRESHNESS_CONTRACT,summarizeResearchReview} from "../owner-research-review.mjs";
import {RESEARCH_THESIS_CONTRACT,RESEARCH_THESIS_AS_OF,COMPARISONS,ADJACENT_CASES,SCENARIO_READTHROUGH,validateResearchCases} from "../owner-research-theses.mjs";
const BASE=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=name=>readFileSync(resolve(BASE,name),"utf8");
const now=new Date("2026-11-13T06:00:00Z");
const valid="https://example.com/dated-source";
const baseline=()=>({
 priceAsOf:"2026-11-12T22:25:09Z",qualifyingQuotes:118,
 pagesError:false,
 pages:[
  {page_key:"index",updated_at:"2026-11-12T19:07:10Z"},
  {page_key:"research",updated_at:"2026-11-04T22:59:22Z"},
  {page_key:"sectors",updated_at:"2026-11-04T22:59:22Z"},
  {page_key:"portfolio",updated_at:"2026-11-02T04:55:35Z"},
  {page_key:"decisions",updated_at:"2026-11-02T04:55:32Z"}
 ],
 ideaError:false,
 ideas:[
  {ticker:"ADBE",name:"Adobe",updated_at:"2026-11-11T01:00:00Z",
   macro_as_of:"2026-11-11",macro_state:"MIXED",macro_source_url:valid,
   peg_as_of:"2026-09-01",peg:1.2,peg_basis:"FY27 adjusted",peg_source_url:valid},
  {ticker:"CF",name:"CF Industries",updated_at:"2026-11-10T12:00:00Z",
   macro_as_of:"2026-10-15",macro_state:"SUPPORTIVE",macro_source_url:valid,
   peg_as_of:null,peg:null,peg_basis:null,peg_source_url:null},
  {ticker:"TLT",name:"Treasury bond ETF",updated_at:"2026-11-09T00:00:00Z",
   macro_as_of:"2026-10-10",macro_state:"MIXED",macro_source_url:valid,
   peg_as_of:null,peg:null,peg_basis:null,peg_source_url:null}
 ],
 decisionCount:0,ledgerCount:0,snapshotAsOf:"2026-10-23"
});
test("source-qualified Nov 12 price does not masquerade as Nov 13 research or decision freshness",()=>{
 const actual=summarizeResearchReview(baseline(),now);
 assert.equal(actual.contractVersion,REVIEW_FRESHNESS_CONTRACT);
 const status=Object.fromEntries(actual.sections.map(x=>[x.key,x.status]));
 assert.equal(status.prices,"CURRENT");
 assert.equal(status.research,"OLDER");
 assert.equal(status.ideas,"PARTIAL");
 assert.equal(status.decisions,"NONE");
 assert.equal(status.portfolio,"UNRECONCILED");
 assert(actual.queue.some(x=>x.title==="No reviewed decisions saved"));
 assert(actual.queue.some(x=>x.title==="Refresh the published research views"));
 assert(actual.queue.some(x=>x.title==="Recheck stock evidence before ranking"));
 assert(actual.unverifiedChange);
});
test("fund ETFs do not count as missing individual-company PEG research",()=>{
 const actual=summarizeResearchReview(baseline(),now);
 assert.equal(actual.sourceCounts.pegTotal,2);
 assert.equal(actual.sourceCounts.pegDated,0);
 assert.equal(actual.sourceCounts.macroTotal,3);
 assert.equal(actual.sourceCounts.macroDated,1);
 const task=actual.queue.find(x=>x.title==="Recheck stock evidence before ranking");
 assert.match(task.detail,/ADBE/);
 assert.match(task.detail,/not buy picks/);
});
test("missing RLS records or stale price feed fail closed instead of inventing live conviction",()=>{
 const empty={...baseline(),pages:null,pagesError:true,ideas:null,ideaError:true,
   decisionCount:null,ledgerCount:null,snapshotAsOf:null,
   priceAsOf:"2026-11-01T22:25:00Z",qualifyingQuotes:0};
 const actual=summarizeResearchReview(empty,now);
 const status=Object.fromEntries(actual.sections.map(x=>[x.key,x.status]));
 assert.equal(status.prices,"STALE");
 assert.equal(status.research,"UNAVAILABLE");
 assert.equal(status.ideas,"UNAVAILABLE");
 assert.equal(status.decisions,"UNAVAILABLE");
 assert.equal(status.portfolio,"UNAVAILABLE");
 assert(actual.queue.some(x=>x.title==="Decision history unavailable"));
 assert(actual.queue.some(x=>x.title==="Check delayed market feed"));
});
test("source dates that lie in the future cannot count as verified",()=>{
 const input=baseline();
 input.ideas[0].macro_as_of="2026-11-20";
 input.ideas[0].peg_as_of="2026-12-20";
 const actual=summarizeResearchReview(input,now);
 assert.equal(actual.sourceCounts.pegDated,0);
 assert.equal(actual.sourceCounts.macroDated,0);
});
test("first screen stays compact and research remains private and non-executable",()=>{
 const radar=read("owner-radar-workspace.mjs"),desk=read("owner-decision-desk.mjs"),
  module=read("owner-research-review.mjs");
 assert.match(radar,/renderResearchReview\(reviewStrip,/);
 assert.match(radar,/workspace\.prepend\(quick,hub,reviewStrip,snapshot/);
 assert.match(radar,/decisionCount:s\.dataReady\?s\.totalRows:null/);
 assert.match(desk,/power_stack_private_pages/);
 assert.match(desk,/page_key,updated_at/);
 assert.match(desk,/state\.pagesError=Boolean\(pages\.error\)/);
 assert.match(module,/review\.queue\.slice\(0,3\)/);
 assert.doesNotMatch(module,/\.insert\(|\.upsert\(|BUY_STARTER|service_role|sb_secret_/);
});


test("research page adds source-dated causal investment analysis after owner authentication",()=>{
 assert.equal(RESEARCH_THESIS_CONTRACT,"power-stack-research-theses/1");
 assert.equal(RESEARCH_THESIS_AS_OF,"2026-11-13");
 assert.equal(COMPARISONS.length,3);
 assert.equal(ADJACENT_CASES.length,6);
 assert.equal(SCENARIO_READTHROUGH.length,5);
 assert(validateResearchCases());
 const tickers=COMPARISONS.flatMap(c=>c.facts.map(x=>x.ticker));
 for(const ticker of ["NVT","ETN","HUBB","MOD","VRT","BDX","CI","CVS"])
   assert(tickers.includes(ticker));
 for(const name of ["NVT","CVS","VRT","POWL","ADBE","FLEX"])
   assert(read("owner-research-theses.mjs").includes(name));
 for(const c of COMPARISONS)assert(c.take&&c.reason&&c.counter&&c.upgrade&&c.asOf==="2026-11-13");
 const source=read("owner-research-theses.mjs");
 assert(source.includes("RESEARCH ONLY")&&source.includes("Next evidence required"));
 assert(!/sb_secret_|service_role|@gmail\\.com|owner_user_id|brokerQuantity|cash_delta/i.test(source));
 const auth=read("auth-gate.mjs");
 assert(auth.indexOf('const user=await authenticate()')<auth.indexOf('if(PAGE==="research")'));
 assert(auth.includes('await import("./owner-research-theses.mjs?v=20261114-ps1")'));
 const html=read("research.html");
 assert(html.includes("owner-research-theses.css?v=20261113-research1"));
 assert(html.includes("auth-gate.mjs?v=20261114-ps1"));
 assert(html.includes('data-private-page="research"'));
 assert(!html.includes("Source-dated investment reasoning"));
});
test("research presentation is compact and leaves original private database page untouched",()=>{
 const source=read("owner-research-theses.mjs");
 assert(source.includes('main.querySelector(".ps-legacy-note")'));
 assert(source.includes("legacy.after(section)"));
 assert(source.includes("details"));
 assert(source.includes("SCENARIO_READTHROUGH"));
 assert(source.includes("Next · "));
 const css=read("owner-research-theses.css");
 assert(css.includes(".psrt-summary"));
 assert(css.includes(".psrt-study"));
 assert(css.includes("@media(max-width:640px)"));
 assert(css.includes("prefers-reduced-motion"));
});
