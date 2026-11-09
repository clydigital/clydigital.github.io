import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=name=>readFileSync(new URL("../"+name,import.meta.url),"utf8");

test("Fin Pulse style is intentionally loaded only after owner authentication",()=>{
 const gate=read("auth-gate.mjs"),styles=read("owner-fin-pulse.css");
 const auth=gate.indexOf('const user=await authenticate()');
 const style=gate.indexOf('pulse.href="./owner-fin-pulse.css');
 assert(auth>=0&&style>auth,"Do not style owner shell before gate decision");
 assert(styles.includes("body.ps-fin-pulse"));
 assert(styles.includes("#site-header.site-header"));
 assert(styles.includes("position:fixed"));
 assert(styles.includes("padding-left:254px"));
 assert(styles.includes("@media(max-width:1020px)"));
 assert(styles.includes("@media(max-width:760px)"));
 assert(styles.includes("@media(prefers-reduced-motion:reduce)"));
});
test("no copied template assets or external design dependencies",()=>{
 const css=read("owner-fin-pulse.css"),js=read("owner-advisor-presentation.mjs");
 assert.doesNotMatch(css+js,/(?:freestacktemplates\.io|tailwindcss\.com|unpkg\.com|fonts\.googleapis\.com|data:image\/svg\+xml)/);
 assert.doesNotMatch(css+js,/sb_secret_|service_role|brokerQuantity|@gmail\.com/);
 assert(js.includes("document.createElementNS"));
 assert(js.includes("ps-pulse-wordmark"));
});
test("client sidebar links retain every major investment workflow",()=>{
 const ui=read("owner-advisor-presentation.mjs");
 for(const item of ["Overview","Opportunities","Market watch","Portfolio","Research","Sector research","Company decisions","Past editions"]){
  assert(ui.includes(item),item);
 }
 assert(ui.includes('fragment.append(signout)'),"Sign out control must remain reachable");
 assert(ui.includes('backoffice.before(details);details.append(backoffice)'),"Owner ledger must remain available");
});
test("dashboard chart is derived from tracked ideas, not fabricated performance",()=>{
 const dashboard=read("owner-decision-desk.mjs");
 assert(dashboard.includes('for(const v of signals)counts[v.status]'));
 assert(dashboard.includes('const max=Math.max(1,...Object.values(counts))'));
 assert(dashboard.includes('psd-pulse-bars'));
 assert(dashboard.includes('const bars=$(host,"psd-pulse-bars")'));
 assert(dashboard.includes('sweepSignals(state.ideaRows,state.priceMap)'));
 assert(dashboard.includes('loadPriceFeed()'));
 assert(dashboard.includes('power_stack_idea_tracker'));
 assert.doesNotMatch(dashboard,/Growth Over Time|Risk Score: 64|\$22,731\.60/);
});
test("market watch sorting and PEG gates are preserved",()=>{
 const portfolio=read("owner-portfolio-table.mjs");
 const ideas=read("owner-ideas-core.mjs");
 assert(portfolio.includes('"threeDay"')&&portfolio.includes('"fiveDay"'));
 assert(portfolio.includes('"watchlist"'));
 assert(portfolio.includes('ps-sort'));
 assert(ideas.includes('status="ALIGNED"')&&ideas.includes('status="DIVERGENCE"'));
 assert(ideas.includes('freshDate(idea?.peg_as_of,45,now)'));
 assert(ideas.includes('freshDate(idea?.macro_as_of,14,now)'));
});
test("login card matches the slate-blue palette before auth",()=>{
 const gate=read("private-gate.css");
 assert(gate.includes('background:#020617'));
 assert(gate.includes('background:#2563eb'));
 assert(gate.includes('.gate-wrap'));
});
