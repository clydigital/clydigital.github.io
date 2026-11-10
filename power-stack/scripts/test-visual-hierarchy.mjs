import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PS_ICON_SHAPES} from "../owner-visual-icons.mjs";
const read=name=>readFileSync(new URL("../"+name,import.meta.url),"utf8");

test("all icons are static outline SVG shapes; no network, secrets, or owner membership",()=>{
 assert(Object.keys(PS_ICON_SHAPES).length>=15);
 for(const [name,shapes] of Object.entries(PS_ICON_SHAPES)){
  assert(name.length>1);
  assert(shapes.length>0);
  for(const [tag,attrs] of shapes){
   assert(["path","circle","rect","line","polyline"].includes(tag),name);
   assert(!Object.keys(attrs).some(k=>/^on/i.test(k)||k==="href"||k==="src"),name);
  }
 }
 const js=read("owner-visual-icons.mjs");
 assert(js.includes('svg.setAttribute("aria-hidden","true")'));
 assert(js.includes('svg.setAttribute("focusable","false")'));
 assert(js.includes("document.createElementNS"));
 assert.doesNotMatch(js,/fetch\(|https:\/\/.*(?:google|supabase)|sb_secret_|owner_user_id|brokerQuantity|@gmail\.com/);
});
test("decision homepage icons reflect navigation, alerts, risk and catalyst",()=>{
 const page=read("owner-decision-desk.mjs");
 for(const text of ["addHeadingIcon(host","psv-radar-divider","psv-queue-icon",
  'p.status==="IN_ALERT"?"target"','"shield"','"calendar"',"psv-detail-line"])
  assert(page.includes(text),text);
 assert(page.includes("psd-ideas-expand"));
 assert(page.includes("showAllIdeas"));
});
test("ideas groups separate high-priority candidates from watch with accessible text",()=>{
 const tracker=read("owner-ideas-tracker.mjs");
 for(const s of ['"Priority research"','"Next candidates"','"Longer-term watch"',
   '"psv-idea-group"','"psv-group-cards"','"psv-plan-risk"','"psv-entry-emphasis"'])
  assert(tracker.includes(s),s);
 assert(tracker.includes('iconText("shield","NO-GO / INVALIDATION"')||
   tracker.includes('line("shield","NO-GO / INVALIDATION"'));
 assert(tracker.includes('if(approvedEvidence(url))'));
});
test("visual hierarchy is source-neutral and separates mobile card stages",()=>{
 const css=read("owner-visual-hierarchy.css");
 for(const s of [".psd-quick-queue",".psd-ideas-panel",".psv-radar-divider",
   ".psv-plan-line",".psv-idea-group-heading",".psv-queue-icon",
   "@media(max-width:760px)","grid-column:1/-1","prefers-reduced-motion"])
   if(s!=="prefers-reduced-motion")assert(css.includes(s),s);
 assert.doesNotMatch(css,/sb_secret_|service_role|@gmail\.com|brokerQuantity|owner_user_id|portfolio_entries/i);
 for(const filename of ["index.html","ideas.html"]){
  const html=read(filename);
  assert(html.includes('href="owner-visual-hierarchy.css?v=20261110-icons3"'));
  assert(html.indexOf('owner-angular-contrast.css')<html.indexOf('owner-visual-hierarchy.css'));
 }
});
