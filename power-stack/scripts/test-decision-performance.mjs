import test from "node:test";
import assert from "node:assert/strict";
import {decisionReviewStats,portfolioReconciliationStatus} from "../owner-decision-performance.mjs";
const now=new Date("2026-11-10T02:00:00Z");
function row(caseKey="US:TEST|NEW_ENTRY|MANDATE",date="2026-11-09T11:00:00Z",changes={}){
 const t={
  assessment:{thesis:"INTACT"},subject:{case_type:"NEW_ENTRY"},
  recommendation:{action:"WAIT",decision_state:"WAITING_FOR_TRIGGER"},
  review:{review_by:"2026-11-12",risk_override:false},
  evidence:{source_status:"PARTIAL",source_refs:["https://issuer.test/filing"],unresolved_gaps:["Unverified valuation"],broker_verified:false}
 };
 for(const [k,v] of Object.entries(changes))t[k]={...t[k],...v};
 return {entry_id:caseKey+"@"+date,case_key:caseKey,created_at:date,ticket:t};
}
test("empty history shows no performance and no fabricated winners",()=>{
 const q=decisionReviewStats([],{now});
 assert.equal(q.caseCount,0);assert.equal(q.overdue,0);
 assert.equal(q.outcomeState,"NO_RECORDED_DECISIONS");
 assert.equal(q.realisedPnlMyr,null);assert.equal(q.investmentReturnPct,null);assert.equal(q.tradeSuccessPct,null);
});
test("historical revisions are not counted as fresh investment cases",()=>{
 const q=decisionReviewStats([row(),row("US:TEST|NEW_ENTRY|MANDATE","2026-11-10T01:00:00Z")],{now});
 assert.equal(q.caseCount,1);assert.equal(q.olderRevisions,1);assert.equal(q.totalSavedRevisions,2);
});
test("overdue and due-today reviews respect Asia/Kuala_Lumpur date",()=>{
 const q=decisionReviewStats([
  row("US:AA|NEW_ENTRY|MANDATE","2026-11-09T01:00:00Z",{review:{review_by:"2026-11-09"}}),
  row("US:BB|NEW_ENTRY|MANDATE","2026-11-09T02:00:00Z",{review:{review_by:"2026-11-10"}}),
  row("US:CC|NEW_ENTRY|MANDATE","2026-11-09T03:00:00Z",{review:{review_by:"2026-11-11"}})
 ],{now});
 assert.equal(q.overdue,1);assert.equal(q.dueToday,1);assert.equal(q.reviewDates,3);
});
test("verified SOURCE CLAIM requires original reference and is not an independently audited performance score",()=>{
 const q=decisionReviewStats([
  row("US:AA|NEW_ENTRY|MANDATE","2026-11-09T01:00:00Z",{evidence:{source_status:"VERIFIED",source_refs:["https://issuer.test/filing"],unresolved_gaps:[]}}),
  row("US:BB|NEW_ENTRY|MANDATE","2026-11-09T02:00:00Z",{evidence:{source_status:"VERIFIED",source_refs:[],unresolved_gaps:[]}}),
  row("US:CC|NEW_ENTRY|MANDATE","2026-11-09T03:00:00Z",{evidence:{source_status:"STALE",source_refs:["https://issuer.test/filing"],unresolved_gaps:["Missing quote"]}})
 ],{now});
 assert.equal(q.declaredVerified,1);assert.equal(q.invalidSources,1);assert.equal(q.withGaps,1);
});
test("hard risks remain visible, waits distinct, even if capital is unverified",()=>{
 const q=decisionReviewStats([
  row("US:AA|HELD_POSITION|MANDATE","2026-11-09T01:00:00Z",{review:{risk_override:true}}),
  row("US:BB|NEW_ENTRY|MANDATE","2026-11-09T03:00:00Z")
 ],{now});
 assert.equal(q.risk,1);assert.equal(q.awaiting,2);
});
test("a truncated 200-row page cannot pretend to audit full history",()=>{
 const q=decisionReviewStats([row()],{now,totalRows:345});
 assert.equal(q.totalSavedRevisions,345);assert.equal(q.loadedRevisions,1);assert.equal(q.historyTruncated,true);
});
test("broker ledger unknown or empty must not be treated as verified cash",()=>{
 for(const x of [portfolioReconciliationStatus({snapshotAsOf:"2026-10-23",ledgerCount:0}),
 portfolioReconciliationStatus({snapshotAsOf:"2026-10-23",ledgerCount:8}),
 portfolioReconciliationStatus({snapshotAsOf:"2026-10-23",ledgerCount:null,ledgerError:true})]){
  assert.equal(x.brokerVerified,false);assert.equal(x.cashVerified,false);assert.equal(x.pnlAvailable,false);
 }
});
test("no accidental grading of a decision from price direction alone",()=>{
 const q=decisionReviewStats([row("US:AA|NEW_ENTRY|MANDATE","2026-11-09T01:00:00Z",{evidence:{broker_verified:true}})],{now});
 assert.equal(q.brokerClaimed,1);assert.equal(q.realisedPnlMyr,null);
 assert.equal(q.outcomeState,"BASELINE_AND_EVENTS_NOT_VERIFIED");
});
