import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=name=>readFileSync(new URL("../"+name,import.meta.url),"utf8");
test("client overview prioritizes entry levels, recommendations and risks",()=>{
 const html=read("owner-decision-desk.mjs");
 for(const token of ['Your investment outlook','Ideas & entry levels','Recommended next move','What needs attention','Upcoming decision points',
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
 assert(brief.includes('sweepSignals(state.ideaRows,state.priceMap)'));
 assert(brief.includes('loadPriceFeed()'));
 assert(brief.includes('Date.now()-generated<=72*3600000'));
 assert(brief.includes('portfolioReconciliationStatus'));
 assert(gate.includes('const user=await authenticate()'));
 assert(gate.indexOf('const user=await authenticate()')<gate.indexOf('presentClientView(PAGE,content)'));
 assert(gate.includes('owner-advisor-theme.css'));
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
