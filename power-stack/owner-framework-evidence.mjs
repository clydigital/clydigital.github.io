/**
 * Power Stack optional research lens packet. No scores, trades, portfolio access, or writes.
 * Imported exclusively by the existing Google/RLS-gated decision desk.
 */
export const FRAMEWORK_CONTRACT="ps-framework-evidence/v1";
const ARCHETYPES=new Set(["CAPITAL_INTENSIVE_GROWTH","PLATFORM_FINTECH","CYCLICAL_COMMODITY","EQUITY_ETF","UNCLASSIFIED"]);
const KINDS=new Set(["ADR","EQUITY","ETF","ORDINARY_SHARE"]);
const LENSES=new Set(["BUFFETT_QUALITY","LYNCH_GARP","GREENBLATT_STRICT","GREENBLATT_ADAPTED","MARKS_CYCLE","BOGLE_ALTERNATIVE"]);
const APPLICABILITY=new Set(["DIRECT","ADAPTED","NOT_APPLICABLE"]);
const SIGNALS=new Set(["SUPPORTIVE","CAUTION","MIXED","UNCERTAIN","NOT_SCORED"]);
const MATERIALITY=new Set(["MATERIAL","SUPPORTING","REDUNDANT"]);
const isObject=x=>!!x&&typeof x==="object"&&!Array.isArray(x);
const populated=x=>typeof x==="string"&&x.trim().length>=5;
const isoTime=x=>typeof x==="string"&&/^20\d\d-\d\d-\d\dT/.test(x)&&Number.isFinite(Date.parse(x));
const date=x=>typeof x==="string"&&/^20\d\d-\d\d-\d\d$/.test(x)&&!Number.isNaN(Date.parse(x+"T00:00:00Z"))&&new Date(x+"T00:00:00Z").toISOString().slice(0,10)===x;
export function safeSourceUrl(v){
 try{const u=new URL(v);return u.protocol==="https:"&&!u.username&&!u.password&&u.href.length<=2000}catch{return false}
}
export function uniqueSourceObservations(packet){
 const ids=new Set();
 for(const s of packet?.source_ledger||[]){
  if(!isObject(s))continue;
  const key=String(s.underlying_source_id||s.url||"").trim().toLowerCase().replace(/#.*$/,"");
  if(key)ids.add(key);
 }
 return ids.size;
}
export function assessPeg(input,archetype,kind){
 if(kind==="ETF"||archetype==="EQUITY_ETF")return {status:"NOT_APPLICABLE",reason:"A fund is not an issuer; use portfolio and fund metrics.",value:null};
 if(!isObject(input))return {status:"UNVERIFIED",reason:"No source-dated earnings-growth estimate supplied.",value:null};
 const {forward_pe,eps_growth_percent,growth_years,estimate_as_of,price_as_of,basis,source_ids}=input;
 if(!Number.isFinite(forward_pe)||forward_pe<=0||!Number.isFinite(eps_growth_percent)||eps_growth_percent<=0||
  !Number.isInteger(growth_years)||growth_years<2||growth_years>5||
  !date(estimate_as_of)||!date(price_as_of)||basis!=="DILUTED_EPS"||
  !Array.isArray(source_ids)||!source_ids.length)
  return {status:"UNVERIFIED",reason:"Forward P/E, diluted EPS growth in percentage points, 2–5Y horizon, dated price and estimates are required.",value:null};
 const value=forward_pe/eps_growth_percent;
 if(["CYCLICAL_COMMODITY","PLATFORM_FINTECH"].includes(archetype)||input.growth_quality!=="RECURRING_VERIFIED")
  return {status:"LOW_CONFIDENCE",reason:"PEG is forecast-sensitive or not a suitable primary valuation for this operating model.",value};
 return {status:"REVIEW_REQUIRED",reason:"Valid PEG arithmetic; still requires valuation, growth-durability and forecast-dispersion review.",value};
}
export function validateFrameworkPacket(packet,expectedKey=null){
 const errors=[];
 if(!isObject(packet))return ["PACKET_NOT_OBJECT"];
 if(packet.contract_version!==FRAMEWORK_CONTRACT)errors.push("CONTRACT_MISMATCH");
 if(!populated(packet.case_key)||!/^.{1,70}\|(NEW_ENTRY|HELD_POSITION|PORTFOLIO_ALLOCATION|TRADE_SETUP)\|(TRADE|TACTICAL|MANDATE|STRUCTURAL)$/.test(packet.case_key))errors.push("CASE_KEY_INVALID");
 if(expectedKey!==null&&packet.case_key!==expectedKey)errors.push("CASE_KEY_MISMATCH");
 if(!isoTime(packet.researched_at))errors.push("RESEARCH_TIME_INVALID");
 if(!isObject(packet.instrument)||!populated(packet.instrument.ticker)||!KINDS.has(packet.instrument.kind)||!populated(packet.instrument.currency))errors.push("INSTRUMENT_INVALID");
 if(!ARCHETYPES.has(packet.operating_archetype))errors.push("ARCHETYPE_INVALID");
 if(!["NOT_EXECUTABLE","COMPLETED_SESSION_VERIFIED","UNVERIFIED"].includes(packet.price_state))errors.push("PRICE_STATUS_INVALID");
 if(!populated(packet.primary_variant_question))errors.push("VARIANT_QUESTION_MISSING");
 if(!Array.isArray(packet.unresolved_gaps))errors.push("GAPS_INVALID");
 if(packet.promote_to_decision_ticket!==false)errors.push("RESEARCH_NOT_NONEXECUTABLE");
 if("recommendation" in packet||"proposed_amount_myr" in packet||"broker_verified" in packet||"score" in packet)errors.push("TRADE_OR_SCORE_NOT_PERMITTED");
 const sources=new Set();
 if(!Array.isArray(packet.source_ledger))errors.push("SOURCE_LEDGER_INVALID");
 else for(const s of packet.source_ledger){
  if(!isObject(s)||!populated(s.id)||!safeSourceUrl(s.url)||!date(s.published_date)||!populated(s.source_type))errors.push("SOURCE_ENTRY_INVALID");
  else sources.add(s.id);
 }
 if(!Array.isArray(packet.lenses)||packet.lenses.length===0)errors.push("LENSES_MISSING");
 else for(const lens of packet.lenses){
  if(!isObject(lens)||!LENSES.has(lens.id)||!APPLICABILITY.has(lens.applicability)||!SIGNALS.has(lens.signal)||
   !populated(lens.claim)||!populated(lens.countercase)||!Array.isArray(lens.source_ids)||
   !lens.source_ids.every(x=>sources.has(x))||
   lens.materiality!==undefined&&!MATERIALITY.has(lens.materiality)||
   "score" in lens||"weight" in lens)errors.push("LENS_INVALID");
  if(lens?.applicability==="NOT_APPLICABLE"&&lens.signal!=="NOT_SCORED")errors.push("INAPPLICABLE_LENS_SCORED");
  if(packet.instrument?.kind==="ETF"&&["BUFFETT_QUALITY","LYNCH_GARP","GREENBLATT_STRICT","GREENBLATT_ADAPTED"].includes(lens?.id)&&lens.applicability!=="NOT_APPLICABLE")errors.push("ETF_COMPANY_LENS_NOT_APPLICABLE");
  if((packet.instrument?.kind==="ADR"||packet.operating_archetype==="PLATFORM_FINTECH")&&lens?.id==="GREENBLATT_STRICT"&&lens.applicability!=="NOT_APPLICABLE")errors.push("STRICT_GREENBLATT_EXCLUSION");
 }
 if(packet.peg_input!==undefined){
  const peg=assessPeg(packet.peg_input,packet.operating_archetype,packet.instrument?.kind);
  if(packet.instrument?.kind==="ETF")errors.push("ETF_PEG_NOT_APPLICABLE");
  if(peg.status==="UNVERIFIED")errors.push("PEG_INPUT_UNVERIFIED");
  if(!packet.peg_input?.source_ids?.every(x=>sources.has(x)))errors.push("PEG_SOURCE_UNLINKED");
 }
 return [...new Set(errors)];
}
const LABELS={BUY_NOW:"Buy now",STAGE:"Stage entry",WAIT:"Wait"};
export function entryPathSummary(alternatives){
 const result={BUY_NOW:null,STAGE:null,WAIT:null};
 for(const row of Array.isArray(alternatives)?alternatives:[]){
  const key=String(row?.choice||"").toUpperCase().replace(/[\s-]+/g,"_");
  let match=key==="BUY_NOW"||key==="BUY"?"BUY_NOW":key==="STAGE"||key==="STAGE_IN"||key==="DCA"?"STAGE":key==="WAIT"||key==="CASH"?"WAIT":null;
  if(match&&!result[match]&&populated(row.comparison))result[match]={
   label:LABELS[match],detail:row.comparison,limitation:row.data_limit||null
  };
 }
 return result;
}
