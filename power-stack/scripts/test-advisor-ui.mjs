import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=name=>readFileSync(new URL("../"+name,import.meta.url),"utf8");
test("client overview prioritizes entry levels, recommendations and risks",()=>{
 const html=read("owner-decision-desk.mjs");
 for(const token of ['What to do next','Action queue','Ideas & entry levels','Recommended next move','What needs attention','Upcoming decision points',
  'psd-ideas-rows','psd-thesis','psd-summary-metrics','Review history, portfolio checks & evidence'])
   assert(html.includes(token),token);
 const top=html.indexOf("Ideas & entry levels");
 const history=html.indexOf("Review history, portfolio checks & evidence");
 assert(top>0&&history>top);
 assert(html.includes('href="archive.html"'),"Old reports must remain accessible");
});
test("valuation and price evidence stays owner-gated, date-stamped and distinct from broker balance",()=>{
 const brief=read("owner-decision-desk.mjs"),gate=read("auth-gate.mjs");
 assert(brief.includes('power_stack_idea_tracker'));
 assert(brief.includes('sweepSignals(companyIdeas,state.priceMap)'));
 assert(brief.includes('loadPriceFeed()'));
 assert(brief.includes('Date.now()-generated<=72*3600000'));
 assert(brief.includes('portfolioReconciliationStatus'));
 assert(gate.includes('const user=await authenticate()'));
 assert(gate.indexOf('const user=await authenticate()')<gate.indexOf('presentClientView(PAGE,content)'));
 assert(read("index.html").includes('owner-advisor-theme.css?v=20261110-noflash1'));
 assert(gate.indexOf('content.hidden=true')<gate.indexOf('content.hidden=false'));
});
test("client navigation keeps price watch, research and sign out reachable",()=>{
 const ui=read("owner-advisor-presentation.mjs");
 for(const item of ['Overview','Opportunities','Market watch','Portfolio','Research','Sector research','Company decisions','Past editions'])
  assert(ui.includes(item),item);
 assert(ui.includes('fragment.append(signout)'));
 assert(ui.includes('backoffice.before(details);details.append(backoffice)'));
 assert(ui.includes('details.className="ps-advisor-records"'));
});
test("sorting, market watch price changes and owner-only portfolio ledger are preserved",()=>{
 const price=read("owner-portfolio-table.mjs"),auth=read("auth-gate.mjs");
 for(const token of ['"threeDay"','"fiveDay"','"watchlist"','ps-sort','power_stack_owner_snapshots'])
  assert(price.includes(token),token);
 assert(auth.includes('await import("./owner-portfolio.js")'));
});
test("redundant research history notes are hidden behind archival access",()=>{
 const css=read("owner-advisor-theme.css");
 assert(css.includes('.psd-root~.ps-archive-pointer'));
 assert(css.includes('.psd-root~.disclaimer'));
 assert(css.includes('.ps-advisor-records'));
 assert(css.includes('.psi-metrics'));
});
test("public source does not contain owner portfolio data or private identifiers",()=>{
 const ui=read("owner-advisor-presentation.mjs"),css=read("owner-advisor-theme.css");
 assert.doesNotMatch(ui+css,/sb_secret_|service_role|@gmail\.com|\"owner_user_id\":/i);
});

test("legacy scores are absent from current owner views; old research remains compatible",async()=>{
 const table=read("owner-portfolio-table.mjs"),ui=read("owner-portfolio.js"),model=read("owner-portfolio-model.mjs");
 assert(!table.includes('"Old score"')&&!table.includes("r.score")&&!table.includes("w.score"));
 assert(!ui.includes("h.score")&&!ui.includes("/100"));
 assert(!model.includes("score,reviewStatus")&&!model.includes("const score=h.assessmentScore"));
 assert(table.includes('"threeDay"')&&table.includes('"fiveDay"')&&table.includes("ps-sort"),"Preserve sortable price table");
 const {parsePrivateResearch}=await import("../owner-portfolio-model.mjs");
 const sample={contractVersion:"power-stack-three-horizon-underwriting/v1",ticker:"CF",
  publicPagesEligible:false,changesExistingScores:false,placesOrders:false,callsVercel:false,
  horizonAssessments:Object.fromEntries(["Q1_2027","END_2027","LONG_TERM"].map(h=>[
   h,{assessmentScore:95,status:"READY_FOR_HUMAN_ALLOCATION_REVIEW",
    confirmation:"Recheck source-dated issuer cash flow.",invalidation:"Thesis failure",gaps:[]}
  ]))};
 const out=parsePrivateResearch(sample);
 assert.equal(out.horizons.length,3);
 assert(out.horizons.every(h=>h.reviewStatus==="ARCHIVED_UNDERWRITING"&&!Object.hasOwn(h,"score")));
 assert.equal(out.state,"PRIVATE_RESEARCH_PREVIEW_ONLY");
});