import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=name=>readFileSync(new URL("../"+name,import.meta.url),"utf8");
const pages=["index","ideas","portfolio","research","sectors","decisions","archive"];

test("angular high-contrast design loads before authenticated content on every page",()=>{
 for(const page of pages){
  const html=read(page+".html");
  const advisor=html.indexOf('href="owner-advisor-theme.css?v=20261110-noflash1"');
  const pulse=html.indexOf('href="owner-fin-pulse.css?v=20261110-noflash1"');
  const angular=html.indexOf('href="owner-angular-contrast.css?v=20261110-coverage1"');
  const auth=html.indexOf('src="auth-gate.mjs?v=20261110-coverage1"');
  assert(advisor>0&&pulse>advisor&&angular>pulse&&auth>angular,page+" asset load order");
 }
});

test("angular theme has stronger visible card, table and navigation hierarchy",()=>{
 const css=read("owner-angular-contrast.css");
 for(const selector of [
  "#site-header.site-header",".psd-executive-main",".psd-ideas-panel",
  ".psd-idea-price strong",".psd-idea-zone",".psi-card",".psi-metric strong",
  ".ps-table th",".ps-table tbody td",".ps-table td[data-direction=up]",
  ".ps-table td[data-direction=down]",".ps-sidebar-label",".psd-badge"
 ])assert(css.includes(selector),"Missing contrast target "+selector);
 assert(css.includes("--ps-rad:5px"),"The default geometry must be square/rectangular");
 assert(css.includes("border-left:4px"),"Priority cards need an obvious accent edge");
 assert(css.includes("nth-child(even)"),"Table stripes aid scanning");
 assert(css.includes("font-size:13px"),"Table data must be legible");
});

test("responsive geometry, focused inputs and hidden owner gate preserved",()=>{
 const css=read("owner-angular-contrast.css");
 const gate=read("auth-gate.mjs");
 assert(css.includes("@media(max-width:1020px)"));
 assert(css.includes("@media(max-width:760px)"));
 assert(css.includes('body.ps-fin-pulse #site-header.site-header[hidden]{display:none!important}'));
 assert(gate.indexOf('content.hidden=true')<gate.indexOf('content.hidden=false'));
 assert(!gate.includes('document.head.append(pulse)'));
});

test("CSS is a presentation-only change without secrets, private holdings or synthetic returns",()=>{
 const css=read("owner-angular-contrast.css");
 assert.doesNotMatch(css,/sb_secret_|service_role|@gmail\.com|brokerQuantity|portfolio_entries|power_stack_owner_snapshots/i);
 assert.doesNotMatch(css,/\$[0-9]{1,3},[0-9]{3}|Risk Score:|Growth Over Time/);
 const ideas=read("owner-ideas-core.mjs"),market=read("owner-portfolio-table.mjs");
 assert(ideas.includes('status="ALIGNED"'));
 assert(market.includes('"threeDay"')&&market.includes('"fiveDay"'));
});
