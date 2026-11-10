import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parseEntryPlan,entryAlert,rankEntryIdeas,ENTRY_CONTRACT} from "../owner-entry-plans.mjs";
const note="PRIORITY: HIGH | THESIS: Investor-quality cash conversion | ENTRY: Review on a source-dated pullback | INVALIDATION: Free cash flow falls | CATALYST: Quarterly earnings | ZONE BASIS: Provisional 9 Nov close";
const caseRow={ticker:"GRAB",name:"Research only",watch_low:3,watch_high:3.15,note,currency:"USD"};
const quote=(n)=>({close:n,currency:"USD",session:"2026-11-09",fiveDay:20.28});
test("parser turns authenticated notes into labelled research claims without guessing a buy",()=>{
 const p=parseEntryPlan(note);
 assert.equal(ENTRY_CONTRACT,"power-stack-provisional-entry-research/1");
 assert.equal(p.priority,"HIGH");
 assert.match(p.entry,/Review on/);
 assert.match(p.invalidation,/Free cash flow/);
 assert.match(p.catalyst,/Quarterly/);
 assert.equal(parseEntryPlan("Legacy unstructured note").priority,"UNRANKED");
});
test("price alerts distinguish waiting, inside, and below zone; none are orders",()=>{
 assert.equal(entryAlert(caseRow,quote(3.44)).status,"WAIT_RETRACE");
 assert.equal(entryAlert(caseRow,quote(3.05)).status,"IN_ALERT");
 assert.equal(entryAlert(caseRow,quote(2.90)).status,"BELOW_ALERT");
 assert.equal(entryAlert(caseRow,null).status,"PRICE_UNAVAILABLE");
 assert.equal(entryAlert({...caseRow,watch_low:null,watch_high:null},quote(3.44)).status,"CATALYST_GATE");
 assert.match(entryAlert(caseRow,quote(3.05)).detail,/NOT an approved entry/);
});
test("high-priority research sorts first, then near-price alerts; no PEG is required",()=>{
 const low={...caseRow,ticker:"LOW",note:note.replace("PRIORITY: HIGH","PRIORITY: WATCH")};
 const ranked=rankEntryIdeas([low,caseRow],new Map([["LOW",quote(3.03)],["GRAB",quote(3.44)]]));
 assert.equal(ranked[0].ticker,"GRAB");
 assert.equal(ranked[1].ticker,"LOW");
});
test("owner-only homepage shows at most nine initial plans and a real expand action",()=>{
 const dashboard=readFileSync(new URL("../owner-decision-desk.mjs",import.meta.url),"utf8");
 const tracker=readFileSync(new URL("../owner-ideas-tracker.mjs",import.meta.url),"utf8");
 assert.match(dashboard,/psd-queue-rows/);
 assert.match(dashboard,/state\.showAllIdeas\?ranked\.length:Math\.min\(9,ranked\.length\)/);
 assert.match(dashboard,/state\.showAllIdeas=!state\.showAllIdeas/);
 assert.match(dashboard,/rankEntryIdeas\(companyIdeas,state\.priceMap\)/);
 assert.match(tracker,/plan\.invalidation/);
 assert.match(tracker,/plan\.entry/);
 assert.doesNotMatch(dashboard+/n"+tracker,/brokerQuantity|sb_secret_|service_role|@gmail\.com/);
});
