import test from "node:test";
import assert from "node:assert/strict";
import {CONTRACT,validateTicket,compareDecision,lane,latestByCase,caseKey,materialSignature,fingerprint,localDate} from "../owner-decision-core.mjs";
const now=new Date("2026-11-10T04:00:00.000Z");
function ticket(){
 const path=(name)=>({driver:name+" economic path",observable_condition:"A dated original source confirms the change",investment_implication:"Changes expected forward payoff",response:"Revisit the decision on fresh evidence",fair_value:null,gross_return_pct:null,net_myr_return_pct:null});
 return {
  contract_version:CONTRACT,as_of:"2026-11-10T01:00:00+08:00",decision_id:null,
  subject:{name:"Illustrative company",instrument_id:"US:TEST",case_type:"NEW_ENTRY"},
  horizon:{primary:"MANDATE",end_or_review_date:"2027-10-23",secondary_context:null},
  baseline:{prior_action:null,prior_as_of:null,source_ref:null},
  delta:{classification:"NEW",checked_change:"Initial source-reviewed test",materiality_reason:"New test case"},
  assessment:{thesis:"INTACT",valuation:"FAIR",timing:"AWAIT_CONFIRMATION",portfolio_fit:"UNRECONCILED",strongest_counterargument:"The valuation may be unattractive"},
  scenarios:{bear:path("Lower"),base:path("Stable"),bull:path("Higher")},
  capital_alternatives:[{choice:"MYR cash",comparison:"Cash avoids mark-to-market risk",data_limit:"No verified net return"}],
  recommendation:{action:"WAIT",decision_state:"WAITING_FOR_TRIGGER",execution_state:"BROKER_CHECK_REQUIRED",condition:"Await verified valuation support",proposed_amount_myr:null,funding_path:"HYPOTHETICAL",rationale:"Investment and timing must be verified"},
  review:{reopen_on:["Dated next issuer release"],review_by:"2026-11-20",review_event:"Next quarterly report",thesis_invalidation:"Cash economics materially deteriorate",risk_override:false},
  evidence:{source_status:"PARTIAL",source_refs:["https://example.org/original"],quote_as_of:null,broker_verified:false,unresolved_gaps:["Broker cash unavailable"]}
 };
}
const clone=x=>JSON.parse(JSON.stringify(x));
test("valid source-gated decision; one stable case identity",()=>{const t=ticket();assert.deepEqual(validateTicket(t),[]);assert.equal(caseKey(t),"US:TEST|NEW_ENTRY|MANDATE")});
test("timestamp and quote refresh do not create a new decision",()=>{
 const prev=ticket(),next=clone(prev);next.as_of="2026-11-11T01:00:00+08:00";next.evidence.quote_as_of="2026-11-10T22:00:00Z";
 assert.equal(materialSignature(prev),materialSignature(next));
 assert.equal(compareDecision(prev,next,now).status,"NO_CHANGE");
 assert.equal(compareDecision(prev,next,now).shouldSave,false);
});
test("new valuation regime reopens",()=>{const prev=ticket(),next=clone(prev);next.assessment.valuation="EXPENSIVE";assert.equal(compareDecision(prev,next,now).status,"MATERIAL_CHANGE")});
test("review expiry forces re-evaluation but does not invent a new decision",()=>{const prev=ticket();prev.review.review_by="2026-11-08";const result=compareDecision(prev,clone(prev),now);assert.equal(result.status,"REVIEW_EXPIRED");assert.equal(result.shouldSave,false)});
test("new risk override bypasses shortlist",()=>{const prev=ticket(),next=clone(prev);next.review.risk_override=true;assert.equal(compareDecision(prev,next,now).status,"RISK_OVERRIDE");assert.equal(lane({ticket:next},now),"risk")});
test("unavailable evidence is not NO_CHANGE",()=>{const prev=ticket(),next=clone(prev);next.evidence.source_status="UNAVAILABLE";assert.equal(compareDecision(prev,next,now).status,"EVIDENCE_GAP")});
test("broker-free cash cannot become an executable amount",()=>{const t=ticket();t.recommendation.proposed_amount_myr=1200;assert.ok(validateTicket(t).includes("UNVERIFIED_FUNDED_AMOUNT"));t.recommendation.execution_state="READY_FOR_OWNER_REVIEW";assert.ok(validateTicket(t).includes("UNVERIFIED_EXECUTION_READINESS"))});
test("trade setups retain trade horizon",()=>{const t=ticket();t.subject.case_type="TRADE_SETUP";assert.ok(validateTicket(t).includes("TRADE_HORIZON_MISMATCH"))});
test("case history keeps most recent version",()=>{const t=ticket(),rows=[{case_key:caseKey(t),created_at:"2026-11-01",entry_id:"old",ticket:t},{case_key:caseKey(t),created_at:"2026-11-10",entry_id:"new",ticket:t}];assert.equal(latestByCase(rows)[0].entry_id,"new")});
test("same decision fingerprint even when only quote time changes",async()=>{const t=ticket(),t2=clone(t);t2.as_of="2026-11-11T00:00:00Z";t2.evidence.quote_as_of="2026-11-10T00:00:00Z";assert.equal(await fingerprint(t),await fingerprint(t2))});
test("review dates are Malaysia-local ISO calendar strings",()=>{assert.equal(localDate(now),"2026-11-10")});
