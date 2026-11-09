import {validateFrameworkPacket,assessPeg,uniqueSourceObservations,entryPathSummary,safeSourceUrl} from "./owner-framework-evidence.mjs";

/** Presentation only: authenticated owner ticket data is supplied by the decision desk. */
const el=(doc,tag,value,cls)=>{
 const node=doc.createElement(tag);
 if(value!==undefined&&value!==null)node.textContent=String(value);
 if(cls)node.className=cls;
 return node;
};
const nice=x=>String(x||"Unknown").replaceAll("_"," ").toLowerCase().replace(/^./,c=>c.toUpperCase());
export function renderFrameworkAppendix(ticket,doc=document){
 const packet=ticket?.framework_evidence;
 if(!packet)return null;
 const section=el(doc,"section",null,"psd-framework");
 const heading=el(doc,"strong","Investor framework research · not a trade signal");
 section.append(heading);
 const issues=validateFrameworkPacket(packet,[
  String(ticket?.subject?.instrument_id||ticket?.subject?.name||"").trim().toUpperCase(),
  ticket?.subject?.case_type,ticket?.horizon?.primary
 ].join("|"));
 if(issues.length){
  section.append(el(doc,"p","Framework appendix withheld: "+issues.join(", ")+". Review the source packet before use.","psd-warning"));
  return section;
 }
 section.append(el(doc,"p",nice(packet.operating_archetype)+" · Reviewed "+packet.researched_at+" · "+nice(packet.price_state)+". No automatic trade approval."));
 section.append(el(doc,"p","Core question: "+packet.primary_variant_question));
 const peg=assessPeg(packet.peg_input,packet.operating_archetype,packet.instrument.kind);
 section.append(el(doc,"p","PEG: "+(peg.value===null?"Not computed":peg.value.toFixed(2))+" · "+nice(peg.status)+" — "+peg.reason));
 const table=el(doc,"div",null,"psd-framework-lenses");
 for(const l of packet.lenses){
  const row=el(doc,"div",null,"psd-detail-row");
  row.append(el(doc,"span",nice(l.id)+" · "+nice(l.applicability)+" · "+nice(l.signal),"psd-detail-label"));
  row.append(el(doc,"p",l.claim));
  row.append(el(doc,"p","Countercase: "+l.countercase));
  if(l.materiality)row.append(el(doc,"small","Contribution: "+nice(l.materiality)));
  table.append(row);
 }
 section.append(table);
 section.append(el(doc,"p","Original-source observations: "+uniqueSourceObservations(packet)+
  " (duplicate references to the same document are not independent evidence)."));
 if(packet.unresolved_gaps.length)section.append(el(doc,"p","Still needed: "+packet.unresolved_gaps.join("; ")));
 const sources=el(doc,"div",null,"psd-refs");
 for(const source of packet.source_ledger.slice(0,8)){
  if(!safeSourceUrl(source.url))continue;
  const a=el(doc,"a",source.id+" · "+source.published_date);
  a.href=source.url;a.rel="noopener noreferrer";a.target="_blank";sources.append(a);
 }
 if(sources.childElementCount)section.append(sources);
 return section;
}
export function renderEntryComparison(ticket,doc=document){
 if(!["NEW_ENTRY","PORTFOLIO_ALLOCATION"].includes(ticket?.subject?.case_type))return null;
 const paths=entryPathSummary(ticket?.capital_alternatives);
 if(!Object.values(paths).some(Boolean))return null;
 const div=el(doc,"div",null,"psd-detail-row");
 div.append(el(doc,"span","Capital timing · matched-horizon alternatives","psd-detail-label"));
 for(const key of ["BUY_NOW","STAGE","WAIT"]){
  const path=paths[key],text=path?
   path.label+": "+path.detail+(path.limitation?" · Data gap: "+path.limitation:""):
   ({BUY_NOW:"Buy now",STAGE:"Stage entry",WAIT:"Wait"}[key])+": Not yet compared";
  div.append(el(doc,"p",text));
 }
 div.append(el(doc,"small","Qualitative comparison only. No fabricated cash carry, probabilities, FX, or verified buying power."));
 return div;
}
