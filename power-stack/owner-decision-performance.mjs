/**
 * Power Stack — private-owner decision quality and outcome-readiness checks.
 * Deterministic analysis of authenticated rows only; no trade, broker, or
 * independent source verification is implied by a saved analyst ticket.
 */
import {latestByCase,localDate} from "./owner-decision-core.mjs";
const dateOnly=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)?s:null;
const counted=(x,n=0)=>Number.isSafeInteger(x)&&x>=0?x:n;
function validRecord(record){
 return record&&typeof record==="object"&&record.ticket&&typeof record.ticket==="object"&&typeof record.case_key==="string";
}
/**
 * Counts assess a decision-making PROCESS, not investment return.
 * All declaration-based fields are explicitly labelled self-reported.
 */
export function decisionReviewStats(records=[],options={}){
 const now=options.now instanceof Date&&!Number.isNaN(+options.now)?options.now:new Date();
 const rows=(Array.isArray(records)?records:[]).filter(validRecord);
 const latest=latestByCase(rows);
 const today=localDate(now);
 let overdue=0,dueToday=0,awaiting=0,risk=0,declaredVerified=0,withGaps=0,invalidSources=0,reviewDates=0,brokerClaimed=0;
 for(const r of latest){
  const t=r.ticket,re=t.review||{},ev=t.evidence||{},act=t.recommendation||{};
  const when=dateOnly(re.review_by);
  if(when){reviewDates++;if(when<today)overdue++;else if(when===today)dueToday++;}
  if(re.risk_override||t.assessment?.thesis==="DAMAGED"&&t.subject?.case_type==="HELD_POSITION")risk++;
  if(act.decision_state==="WAITING_FOR_TRIGGER"||act.action==="WAIT")awaiting++;
  if(ev.source_status==="VERIFIED"&&Array.isArray(ev.source_refs)&&ev.source_refs.length>0)declaredVerified++;
  if(Array.isArray(ev.unresolved_gaps)&&ev.unresolved_gaps.length)withGaps++;
  if(!Array.isArray(ev.source_refs)||!ev.source_refs.length)invalidSources++;
  if(ev.broker_verified===true)brokerClaimed++;
 }
 const total=options.totalRows===undefined?rows.length:counted(options.totalRows,rows.length);
 return {
  totalSavedRevisions:total,loadedRevisions:rows.length,caseCount:latest.length,
  olderRevisions:rows.length-latest.length,overdue,dueToday,awaiting,risk,reviewDates,
  declaredVerified,withGaps,invalidSources,brokerClaimed,
  historyTruncated:total>rows.length,
  outcomeState:latest.length?"BASELINE_AND_EVENTS_NOT_VERIFIED":"NO_RECORDED_DECISIONS",
  realisedPnlMyr:null,investmentReturnPct:null,tradeSuccessPct:null,
  outcomeExplanation:latest.length
    ?"No independent price-at-decision baseline, matched exit/fill, FX and cost data have been verified. Scenario accuracy and investment returns are not scored."
    :"No owner-saved decisions yet. Outcome accuracy and actual returns are not measurable."
 };
}
/**
 * The owner portfolio ledger is self-reported: entries cannot prove brokerage
 * quantities, account cash, fills, cost basis or realised performance.
 */
export function portfolioReconciliationStatus({snapshotAsOf=null,ledgerCount=null,ledgerError=false}={}){
 const count=ledgerError||ledgerCount===null?null:counted(ledgerCount,null);
 return {
  archivedAsOf:dateOnly(snapshotAsOf),
  ledgerEntries:count,
  brokerVerified:false,
  cashVerified:false,
  pnlAvailable:false,
  state:count===null?"LEDGER_UNAVAILABLE":count===0?"NO_RECONCILED_LEDGER":"SELF_REPORTED_ONLY",
  explanation:count===null
    ?"The owner ledger could not be checked. No holdings, cash or performance inference is permitted."
    :count===0
    ?"No owner transaction-ledger entries are recorded. Historical holdings are not current broker positions."
    :"Transaction entries are self-reported, not a broker-reconciled statement. Cash, exact positions, cost basis and P&L remain unverified."
 };
}
