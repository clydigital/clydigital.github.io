import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(name)=>readFileSync(new URL("../"+name,import.meta.url),"utf8");
test("all six other private Power Stack pages load unified tavern design after prior styles",()=>{
 const css=read("owner-tavern-sitewide.css");
 assert(css.includes('html[data-private-page]:not([data-private-page="index"])'),
  "Never clobber the specialized radar-led homepage");
 const pages=["ideas","portfolio","research","sectors","decisions","archive"];
 for(const page of pages){
  const html=read(page+".html");
  assert(html.includes('data-private-page="'+page+'"'),page);
  assert(html.includes('owner-tavern-sitewide.css?v=20261113-sw2'),page);
  assert(html.indexOf("owner-tavern-sitewide.css")>html.indexOf("owner-figtree-visuals.css"),page);
  assert(html.indexOf('type="module"')>html.indexOf('owner-tavern-sitewide.css'),page);
 }
 for(const token of ["#site-header.site-header",".psi-hero",".pso-shell",
  ".psi-tracked-drawer",".psi-editor",".psd-root","tavern-room-guildhall-1400.webp",
  "walnut-wall-panel.svg","@media(max-width:850px)","@media(prefers-reduced-motion:reduce)",
  "@media(forced-colors:active)","outline:2px solid"]){
  assert(css.includes(token),"Missing private page theme/fallback: "+token);
 }
 assert(css.includes("Guildhall ledger table finish"));
 assert(css.includes("table:not(.psr-mat)"));
 assert(css.includes("tbody tr:nth-child(even)>td"));
 for(const bad of ["MARKET LIVE","Bullish Signals","fakeQuotes","service_role","sb_secret_","cash_delta",".insert(",".upsert("])assert(!css.includes(bad),"Unexpected CSS content: "+bad);
});
