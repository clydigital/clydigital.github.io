import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=n=>readFileSync(new URL("../"+n,import.meta.url),"utf8");
test("All eight owner pages load recap CSS after earlier styles and before auth",()=>{
 const css=read("owner-recap-sitewide.css");
 for(const page of ["index","portfolio","ideas","research","sectors","decisions","dossiers","archive"]){const html=read(page+".html");assert(html.includes('data-private-page="'+page+'"'));assert(html.indexOf("owner-recap-sitewide.css")>html.indexOf("owner-figtree-visuals.css"));assert(html.indexOf("owner-recap-sitewide.css")<html.indexOf('src="auth-gate.mjs'));assert(!html.includes("owner-tavern-sitewide.css"));}
 for(const token of ["#site-header.site-header",".psi-card",".ps-owner-table",".ps-recap-archive-drawer","@media(max-width:800px)","#fff9ef","#eee9ff","#ffeadc","#d4f5ea"])assert(css.includes(token),token);
 assert.doesNotMatch(css,/MARKET LIVE|fakeQuotes|service_role|sb_secret_|cash_delta|\.insert\(|\.upsert\(/);
});
test("Recap consolidates navigation without deleting archive records, ledger, or live research controls",()=>{const ui=read("owner-advisor-presentation.mjs"),gate=read("auth-gate.mjs"),radar=read("owner-radar-workspace.mjs");const nav=ui.slice(ui.indexOf("const links=["),ui.indexOf("const fragment="));for(const label of ["Today","Holdings","Watchlist","Ideas","Sectors","Research","War Room","Decisions","Dossiers","Archive"])assert(nav.includes('"'+label+'"'));assert.equal((nav.match(/\["/g)||[]).length,10);assert(nav.includes("portfolio.html#holdings"));assert(nav.includes("portfolio.html#watchlist"));assert(ui.includes("drawer.hidden=true"));assert(ui.includes("if(old&&past)past.append(old)"));assert(ui.includes("for(const n of original)drawer.append(n)"));assert(ui.includes("if(account)main.append(account)"));assert(ui.includes("tracked.open=true"));assert(gate.indexOf("finalizeRecap(PAGE,content)")<gate.indexOf("content.hidden=false"));assert(radar.includes("lane(row)===\"risk\"||"));assert(radar.includes("deskTools.append(legacy,pastWar)"));});

test("Archived public War Room assets contain no owner-specific portfolio snapshot or private file identifiers",()=>{
 const findings=read("owner-war-room-findings.mjs");
 assert.doesNotMatch(findings,/libfile_|api\/library\/files|6742UW|Power Stack's recorded eight holdings/);
 assert(findings.includes("https://clydigital.github.io/power-stack/dossiers.html"));
});

test("recap colours are semantic, dark ink is explicit, and empty instructions stay hidden",()=>{
 const css=read("owner-recap-sitewide.css"),radar=read("owner-radar-workspace.mjs"),intelligence=read("owner-investment-intelligence.mjs"),portfolio=read("owner-portfolio-table.mjs");
 assert(radar.includes("currentLog.hidden=true"));assert(radar.includes("currentLog.hidden=latest.length===0"));
 assert(!radar.includes("DAILY INVESTMENT BRIEF"));assert(!radar.includes("No current reviewed instruction. Research candidates below are not buy calls."));
 assert(radar.includes('logHistory.id="decision-history"'));assert(!intelligence.includes("Jump to saved Action Log instructions"));
 for(const section of ["01","02","03","04","05","strategy"])assert(css.includes('.ps-recap-panel[data-section="'+section+'"]'));
 for(const kind of ["holding","watchlist","research","coverage"])assert(css.includes('.ps-position-card[data-kind="'+kind+'"]'));
 assert(intelligence.includes("n.dataset.section="));assert(portfolio.includes("card.dataset.kind="));
 assert(css.includes("color:var(--recap-ink)!important"));assert(css.includes("background:#26334d!important;color:#fff!important"));
});
