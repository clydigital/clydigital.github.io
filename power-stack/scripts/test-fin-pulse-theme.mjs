import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=name=>readFileSync(new URL("../"+name,import.meta.url),"utf8");

test("Fin Pulse CSS preloads while owner content stays hidden until final layout",()=>{
 const gate=read("auth-gate.mjs"),styles=read("owner-fin-pulse.css");
 const auth=gate.indexOf('const user=await authenticate()');
 const hidden=gate.indexOf('content.hidden=true');
 const present=gate.indexOf('presentClientView(PAGE,content)');
 const reveal=gate.indexOf('content.hidden=false');
 assert(auth>=0&&hidden>auth&&present>hidden&&reveal>present,"No intermediate unthemed owner content");
 assert(!gate.includes('document.head.append(pulse)'),"Do not inject the theme after rendering");
 assert(!gate.includes('document.head.append(link)'),"Advisor theme must also preload");
 assert(styles.includes('body:not(.ps-fin-pulse){background:#020617'));
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
 assert(dashboard.includes('sweepSignals(companyIdeas,state.priceMap)'));
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

test("each private page loads the final theme in head before auth script",()=>{
 for(const page of ["index","ideas","portfolio","research","sectors","decisions","archive"]){
  const html=read(page+".html");
  const advisor=html.indexOf('href="owner-advisor-theme.css?v=20261110-noflash1"');
  const pulse=html.indexOf('href="owner-fin-pulse.css?v=20261110-noflash1"');
  const auth=html.indexOf('src="auth-gate.mjs?v=20261110-coverage1"');
  assert(advisor>0&&pulse>advisor&&auth>pulse,page+" theme must precede auth script");
 }
});
