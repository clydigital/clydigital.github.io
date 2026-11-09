/**
 * Public, dependency-free decision logic. Never contains owner records.
 * The site cannot infer trade readiness from research; only owner-saved tickets.
 */
export const CONTRACT = "power-stack-decision-ticket/v2";
const ACTIONS=new Set(["BUY_STARTER","ADD_IF_CONFIRMED","HOLD","TRIM","SELL_REVIEW","WAIT","PASS","NO_ACTION"]);
const STATES=new Set(["READY_FOR_OWNER_REVIEW","WAITING_FOR_TRIGGER","RECHECK_REQUIRED","BLOCKED_BY_EVIDENCE","REJECTED","NO_NEW_DECISION"]);
const HORIZONS=new Set(["TRADE","TACTICAL","MANDATE","STRUCTURAL"]);
const THESIS=new Set(["IMPROVING","INTACT","DAMAGED","UNKNOWN"]);
const VALUATION=new Set(["ATTRACTIVE","FAIR","EXPENSIVE","UNKNOWN"]);
const TIMING=new Set(["TRIGGER_MET","AWAIT_CONFIRMATION","INVALIDATED","NOT_APPLICABLE","UNKNOWN"]);
const FIT=new Set(["FITS","OVERLAP_OR_LIMIT","UNRECONCILED","NOT_APPLICABLE"]);
const EVIDENCE=new Set(["VERIFIED","PARTIAL","STALE","UNAVAILABLE"]);
const EXEC=new Set(["READY_FOR_OWNER_REVIEW","BROKER_CHECK_REQUIRED","NOT_READY"]);
const FUNDING=new Set(["VERIFIED_CASH","CONDITIONAL_PROCEEDS","HYPOTHETICAL","NOT_APPLICABLE"]);
const DELTA=new Set(["NEW","MATERIAL_CHANGE","NO_CHANGE","RESEARCH_GAP"]);
const CASES=new Set(["NEW_ENTRY","HELD_POSITION","PORTFOLIO_ALLOCATION","TRADE_SETUP"]);
const object=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const filled=x=>typeof x==="string"&&x.trim().length>=5;
const date=x=>typeof x==="string"&&/^20\d{2}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(x)&&new Date(x+"T00:00:00Z").toISOString().slice(0,10)===x;
const instant=x=>typeof x==="string"&&!Number.isNaN(Date.parse(x))&&/T/.test(x);
export function localDate(now=new Date()){
 return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kuala_Lumpur",year:"numeric",month:"2-digit",day:"2-digit"}).format(now);
}
export function caseKey(t){
 if(!object(t?.subject)||!object(t?.horizon))return null;
 const id=String(t.subject.instrument_id||t.subject.name||"").trim().toUpperCase();
 if(!id||id.length>70||!CASES.has(t.subject.case_type)||!HORIZONS.has(t.horizon.primary))return null;
 return [id,t.subject.case_type,t.horizon.primary].join("|");
}
export function validateTicket(t){
 const errors=[];
 if(!object(t))return ["TICKET_NOT_OBJECT"];
 if(t.contract_version!==CONTRACT)errors.push("CONTRACT_MISMATCH");
 if(!instant(t.as_of))errors.push("AS_OF_MISSING");
 if(!caseKey(t))errors.push("CASE_IDENTITY_INVALID");
 for(const k of ["baseline","delta","assessment","recommendation","review","evidence","scenarios","horizon"]){
  if(!object(t[k]))errors.push("MISSING_"+k.toUpperCase());
 }
 if(errors.length)return errors;
 const {assessment:a,recommendation:r,evidence:e,review:v,delta:d,baseline:b}=t;
 if(!THESIS.has(a.thesis)||!VALUATION.has(a.valuation)||!TIMING.has(a.timing)||!FIT.has(a.portfolio_fit)||!filled(a.strongest_counterargument))errors.push("ASSESSMENT_INVALID");
 if(!ACTIONS.has(r.action)||!STATES.has(r.decision_state)||!EXEC.has(r.execution_state)||!FUNDING.has(r.funding_path)||!filled(r.rationale)||!filled(r.condition))errors.push("RECOMMENDATION_INVALID");
 if(!EVIDENCE.has(e.source_status)||typeof e.broker_verified!=="boolean"||!Array.isArray(e.source_refs)||!Array.isArray(e.unresolved_gaps))errors.push("EVIDENCE_INVALID");
 if(!DELTA.has(d.classification)||!filled(d.checked_change))errors.push("DELTA_INVALID");
 if(!Array.isArray(v.reopen_on)||!v.reopen_on.some(filled)||!filled(v.thesis_invalidation)||typeof v.risk_override!=="boolean")errors.push("REVIEW_INVALID");
 if(v.review_by!==null&&!date(v.review_by))errors.push("REVIEW_DATE_INVALID");
 if(t.horizon.end_or_review_date!==null&&!date(t.horizon.end_or_review_date))errors.push("HORIZON_DATE_INVALID");
 if(r.proposed_amount_myr!==null&&(!Number.isFinite(r.proposed_amount_myr)||r.proposed_amount_myr<0||e.broker_verified!==true))errors.push("UNVERIFIED_FUNDED_AMOUNT");
 if(r.execution_state==="READY_FOR_OWNER_REVIEW"&&e.broker_verified!==true)errors.push("UNVERIFIED_EXECUTION_READINESS");
 if(r.action==="NO_ACTION"&&(!b.prior_action||!b.source_ref||d.classification!=="NO_CHANGE"))errors.push("INVALID_NO_ACTION_BASELINE");
 if(r.action==="NO_ACTION"&&!v.review_by)errors.push("UNDATED_NO_ACTION");
 if(r.action==="WAIT"&&!v.review_by&&!filled(v.review_event))errors.push("INDEFINITE_WAIT");
 if(["BUY_STARTER","ADD_IF_CONFIRMED"].includes(r.action)&&a.valuation==="UNKNOWN"&&r.decision_state==="READY_FOR_OWNER_REVIEW")errors.push("BUY_WITH_UNKNOWN_VALUATION");
 if(a.timing==="TRIGGER_MET"&&!instant(e.quote_as_of))errors.push("UNDATED_TRIGGER");
 if(t.subject.case_type==="TRADE_SETUP"&&t.horizon.primary!=="TRADE")errors.push("TRADE_HORIZON_MISMATCH");
 if(e.source_status==="UNAVAILABLE"&&d.classification==="NO_CHANGE")errors.push("UNVERIFIED_NO_CHANGE");
 if(v.risk_override&&r.decision_state==="NO_NEW_DECISION")errors.push("RISK_OVERRIDE_SUPPRESSED");
 if(!Array.isArray(t.capital_alternatives)||!t.capital_alternatives.length)errors.push("NO_CAPITAL_ALTERNATIVE");
 for(const type of ["bear","base","bull"]){
  const s=t.scenarios[type];
  if(!object(s)||!["driver","observable_condition","investment_implication","response"].every(k=>filled(s[k])))errors.push("SCENARIO_"+type.toUpperCase()+"_INCOMPLETE");
 }
 return [...new Set(errors)];
}
function stable(value){
 if(Array.isArray(value))return value.map(stable);
 if(object(value))return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])]));
 return value===undefined?null:value;
}
/** Exclude time-of-read and daily quote noise. Include decisions, assumptions and material evidence IDs. */
export function materialSignature(t){
 if(!t)return "";
 return JSON.stringify(stable({
  subject:t.subject,horizon:t.horizon,assessment:t.assessment,scenarios:t.scenarios,
  capital_alternatives:t.capital_alternatives,
  recommendation:t.recommendation,review:t.review,
  evidence_sources:t.evidence?.source_refs,
  evidence_gaps:t.evidence?.unresolved_gaps,
  materiality:t.delta?.materiality_reason
 }));
}
export async function fingerprint(t){
 const bytes=new TextEncoder().encode(materialSignature(t));
 const hash=await crypto.subtle.digest("SHA-256",bytes);
 return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
export function compareDecision(previous,candidate,now=new Date()){
 if(!previous)return {status:"NEW",shouldSave:true,reason:"No recorded decision"};
 const old=previous.ticket||previous;
 const due=old.review?.review_by;
 if(candidate?.review?.risk_override&&!old.review?.risk_override)
  return {status:"RISK_OVERRIDE",shouldSave:true,reason:"New risk override"};
 if(candidate?.assessment?.thesis==="DAMAGED"&&old.assessment?.thesis!=="DAMAGED")
  return {status:"RISK_OVERRIDE",shouldSave:true,reason:"Material thesis deterioration"};
 if(["UNAVAILABLE","STALE"].includes(candidate?.evidence?.source_status))
  return {status:"EVIDENCE_GAP",shouldSave:false,reason:"Fresh evidence unavailable"};
 if(due&&date(due)&&due<localDate(now))
  return {status:"REVIEW_EXPIRED",shouldSave:materialSignature(old)!==materialSignature(candidate),reason:"Review deadline passed: reassess before saving"};
 if(materialSignature(old)===materialSignature(candidate))
  return {status:"NO_CHANGE",shouldSave:false,reason:"Decision-bearing evidence and conditions unchanged"};
 return {status:"MATERIAL_CHANGE",shouldSave:true,reason:"Decision logic or material evidence changed"};
}
export function latestByCase(rows=[]){
 const result=new Map();
 for(const r of [...rows].sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)))){
  if(r?.case_key&&!result.has(r.case_key))result.set(r.case_key,r);
 }
 return [...result.values()];
}
export function lane(record,now=new Date()){
 const t=record?.ticket||record;
 if(!t)return "unknown";
 if(t.review?.risk_override||t.assessment?.thesis==="DAMAGED"&&t.subject?.case_type==="HELD_POSITION")return "risk";
 if(t.review?.review_by&&t.review.review_by<localDate(now))return "risk";
 if(["WAIT","NO_ACTION"].includes(t.recommendation?.action)||["WAITING_FOR_TRIGGER","NO_NEW_DECISION"].includes(t.recommendation?.decision_state))return "watch";
 if(t.recommendation?.decision_state==="BLOCKED_BY_EVIDENCE")return "watch";
 return "decision";
}
