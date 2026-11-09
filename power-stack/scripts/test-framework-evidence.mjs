import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {FRAMEWORK_CONTRACT,validateFrameworkPacket,assessPeg,entryPathSummary,uniqueSourceObservations} from "../owner-framework-evidence.mjs";
import {validateTicket,materialSignature} from "../owner-decision-core.mjs";
const source={id:"issuer2026",url:"https://example.org/investors/quarterly-earnings",source_type:"ISSUER_RELEASE",published_date:"2026-11-04",underlying_source_id:"original-q3-release"};
const lens=(id,applicability="DIRECT",signal="MIXED")=>({
 id,applicability,signal,claim:"The economics require an evidence-based valuation review.",
 countercase:"Earnings or market conditions could deteriorate.",source_ids:["issuer2026"],materiality:"SUPPORTING"
});
const packet=(ticker,kind,operating_archetype,lenses)=>({
 contract_version:FRAMEWORK_CONTRACT,case_key:ticker+"|NEW_ENTRY|MANDATE",
 researched_at:"2026-11-10T06:00:00+08:00",
 instrument:{ticker,kind,currency:"USD"},primary_horizon:"MANDATE",
 operating_archetype,price_state:"NOT_EXECUTABLE",lenses,
 primary_variant_question:"What future fundamentals are already included in the current market price?",
 unresolved_gaps:["Source-dated market close and verified broker holdings"],promote_to_decision_ticket:false,
 source_ledger:[source]
});
const TSM=packet("TSM","ADR","CAPITAL_INTENSIVE_GROWTH",[
 lens("BUFFETT_QUALITY"),lens("LYNCH_GARP","ADAPTED","UNCERTAIN"),lens("GREENBLATT_STRICT","NOT_APPLICABLE","NOT_SCORED")
]);
const GRAB=packet("GRAB","EQUITY","PLATFORM_FINTECH",[
 lens("BUFFETT_QUALITY","ADAPTED","UNCERTAIN"),lens("GREENBLATT_STRICT","NOT_APPLICABLE","NOT_SCORED")
]);
GRAB.unresolved_gaps.push("Reconcile GAAP versus adjusted FCF and lending cash-flow treatment");
const CF=packet("CF","EQUITY","CYCLICAL_COMMODITY",[
 lens("BUFFETT_QUALITY","ADAPTED","MIXED"),lens("GREENBLATT_STRICT","NOT_APPLICABLE","NOT_SCORED"),
 lens("GREENBLATT_ADAPTED","ADAPTED","UNCERTAIN")
]);
CF.unresolved_gaps.push("Normalize fertilizer and gas cycles, one-off settlement and outages");
const RSP=packet("RSP","ETF","EQUITY_ETF",[
 lens("BUFFETT_QUALITY","NOT_APPLICABLE","NOT_SCORED"),
 lens("LYNCH_GARP","NOT_APPLICABLE","NOT_SCORED"),
 lens("GREENBLATT_STRICT","NOT_APPLICABLE","NOT_SCORED"),
 lens("BOGLE_ALTERNATIVE","DIRECT","MIXED")
]);
test("four distinct archetypes accept non-executable research packets",()=>{
 for(const [name,item] of Object.entries({TSM,GRAB,CF,RSP}))
  assert.deepEqual(validateFrameworkPacket(item,item.case_key),[],name);
});
test("strict Greenblatt cannot be assigned to TSM ADR or GRAB financial platform",()=>{
 for(const item of [TSM,GRAB]){
  const bad=structuredClone(item);
  bad.lenses.find(x=>x.id==="GREENBLATT_STRICT").applicability="DIRECT";
  assert(validateFrameworkPacket(bad,bad.case_key).includes("STRICT_GREENBLATT_EXCLUSION"));
 }
});
test("issuer PEG and Greenblatt economics cannot score the ETF",()=>{
 const bad=structuredClone(RSP);
 bad.lenses.find(x=>x.id==="LYNCH_GARP").applicability="DIRECT";
 assert(validateFrameworkPacket(bad,bad.case_key).includes("ETF_COMPANY_LENS_NOT_APPLICABLE"));
 assert.equal(assessPeg(null,"EQUITY_ETF","ETF").status,"NOT_APPLICABLE");
});
test("inapplicable lenses cannot secretly carry a positive signal",()=>{
 const bad=structuredClone(TSM);bad.lenses.at(-1).signal="SUPPORTIVE";
 assert(validateFrameworkPacket(bad,bad.case_key).includes("INAPPLICABLE_LENS_SCORED"));
});
test("PEG math enforces percentage point denominator and 2-5 year dated estimates",()=>{
 const valid={forward_pe:18.48,eps_growth_percent:42.41,growth_years:3,
  estimate_as_of:"2026-11-09",price_as_of:"2026-11-09",basis:"DILUTED_EPS",
  source_ids:["issuer2026"],growth_quality:"RECURRING_VERIFIED"};
 const result=assessPeg(valid,"CAPITAL_INTENSIVE_GROWTH","ADR");
 assert.equal(result.status,"REVIEW_REQUIRED");
 assert(Math.abs(result.value-0.43575)<.001);
 assert.equal(assessPeg({...valid,eps_growth_percent:.4241,growth_years:1},"CAPITAL_INTENSIVE_GROWTH","ADR").status,"UNVERIFIED");
});
test("CF and GRAB PEG remain low-confidence even with valid arithmetic",()=>{
 const v={forward_pe:10,eps_growth_percent:20,growth_years:3,estimate_as_of:"2026-11-09",
  price_as_of:"2026-11-09",basis:"DILUTED_EPS",source_ids:["issuer2026"],growth_quality:"RECURRING_VERIFIED"};
 assert.equal(assessPeg(v,"CYCLICAL_COMMODITY","EQUITY").status,"LOW_CONFIDENCE");
 assert.equal(assessPeg(v,"PLATFORM_FINTECH","EQUITY").status,"LOW_CONFIDENCE");
});
test("duplicate source references do not increase independent confirmation count",()=>{
 const copy=structuredClone(TSM);copy.source_ledger.push({...source,id:"bluebelly_reference",url:"https://example.org/dossier",underlying_source_id:"original-q3-release"});
 assert.equal(uniqueSourceObservations(copy),1);
});
test("entry paths display explicit unknowns, never invent net MYR return",()=>{
 const paths=entryPathSummary([{choice:"STAGE",comparison:"Stage only after confirmed valuation.",data_limit:"Broker FX missing"}]);
 assert.equal(paths.BUY_NOW,null);assert.equal(paths.WAIT,null);
 assert.match(paths.STAGE.limitation,/FX/);
});
test("packet cannot assert executable instruction, owner cash or a scores engine",()=>{
 for(const patch of [{promote_to_decision_ticket:true},{proposed_amount_myr:1500},{score:99}]){
  const bad={...TSM,...patch};
  assert(validateFrameworkPacket(bad,bad.case_key).includes("RESEARCH_NOT_NONEXECUTABLE")||validateFrameworkPacket(bad,bad.case_key).includes("TRADE_OR_SCORE_NOT_PERMITTED"));
 }
});
test("mismatched case packet is invalid for existing owner ticket",()=>{
 assert(validateFrameworkPacket(TSM,"GRAB|NEW_ENTRY|MANDATE").includes("CASE_KEY_MISMATCH"));
});
const v2={
 contract_version:"power-stack-decision-ticket/v2",as_of:"2026-11-10T06:00:00+08:00",
 subject:{instrument_id:"TSM",name:"TSM",case_type:"NEW_ENTRY"},horizon:{primary:"MANDATE",end_or_review_date:"2027-10-23"},
 baseline:{prior_action:"WAIT",source_ref:"https://example.org/previous"},
 delta:{classification:"NEW",checked_change:"A fresh review was completed.",materiality_reason:"Verified issuer release."},
 assessment:{thesis:"INTACT",valuation:"UNKNOWN",timing:"AWAIT_CONFIRMATION",portfolio_fit:"UNRECONCILED",strongest_counterargument:"Valuation embeds uncertain growth."},
 recommendation:{action:"WAIT",decision_state:"BLOCKED_BY_EVIDENCE",execution_state:"NOT_READY",funding_path:"HYPOTHETICAL",proposed_amount_myr:null,
  rationale:"Waiting for a defensible intrinsic-value study.",condition:"Review a completed price session and broker cash."},
 evidence:{source_status:"PARTIAL",broker_verified:false,source_refs:["https://example.org/issuer"],unresolved_gaps:["Broker holdings missing"],quote_as_of:null},
 review:{reopen_on:["Earnings results and valuation case"],thesis_invalidation:"Fundamentals fail growth assumptions.",risk_override:false,review_by:"2026-12-01",review_event:"Quarterly valuation refresh"},
 scenarios:Object.fromEntries(["bear","base","bull"].map(k=>[k,{driver:"Growth and margin scenario.",
 observable_condition:"Compare published quarterly guidance.",investment_implication:"Research status may change.",
 response:"Re-underwrite before capital deployment."}])),
 capital_alternatives:[{choice:"STAGE",comparison:"Evaluate smaller starter after valuation.",data_limit:"Funding unverified"}]
};
test("v2 continuity stays unchanged; optional valid packet does not create a new decision",()=>{
 assert.deepEqual(validateTicket(v2),[]);
 const enriched={...v2,framework_evidence:TSM};
 assert.deepEqual(validateTicket(enriched),[]);
 assert.equal(materialSignature(v2),materialSignature(enriched));
 const bad={...v2,framework_evidence:GRAB};
 assert(validateTicket(bad).some(x=>x.includes("CASE_KEY_MISMATCH")));
});
test("research-only fixtures are never embedded in publicly served owner pages",()=>{
 const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
 const auth=readFileSync(new URL("../auth-gate.mjs",import.meta.url),"utf8");
 const desk=readFileSync(new URL("../owner-decision-desk.mjs",import.meta.url),"utf8");
 assert(html.includes('id="private-main" hidden'));
 assert(auth.indexOf("const user=await authenticate()")<auth.indexOf('if(PAGE==="index")'));
 assert(desk.includes("renderFrameworkAppendix"));
 assert(!/owner_user_id\s*:\s*["']|sb_secret_|service_role/.test(html+desk));
});
