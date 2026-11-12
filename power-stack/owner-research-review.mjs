// Owner-only, read-only research-to-decision freshness presentation.
// This public module carries no private records, holdings, recommendations or credentials.
// Source modification times are NOT proof that a market thesis was reviewed.
import {pegSuitability} from "./owner-ideas-core.mjs";
export const REVIEW_FRESHNESS_CONTRACT="power-stack-research-review/1";
const DAY=86400000;
const dateAge=(value,now)=>{
 const t=Date.parse(value||"");
 return Number.isFinite(t)&&t<=now.getTime()+300000?Math.max(0,(now.getTime()-t)/DAY):null;
};
const validSource=value=>{
 try{const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password;}catch{return false;}
};
const dated=(value,maxDays,now)=>{
 const d=dateAge(typeof value==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(value)?value+"T23:59:59Z":value,now);
 return d!==null&&d<=maxDays;
};
const displayDay=value=>typeof value==="string"&&/^\d{4}-\d{2}-\d{2}/.test(value)?value.slice(0,10):"unknown";
const countStatus=(ok,label,note)=>({status:ok?"DATED":"REVIEW",label,note});
export function summarizeResearchReview(input,now=new Date()){
 const pages=Array.isArray(input?.pages)?input.pages:[],pageMap=new Map(
   pages.filter(p=>typeof p?.page_key==="string").map(p=>[p.page_key,p.updated_at]));
 const ideas=Array.isArray(input?.ideas)?input.ideas:[];
 const ideaReadable=input?.ideaError!==true&&Array.isArray(input?.ideas);
 const pageReadable=input?.pagesError!==true&&Array.isArray(input?.pages);
 const feedAt=input?.priceAsOf||null;
 const feedAge=dateAge(feedAt,now);
 const priceReady=feedAge!==null&&feedAge<=3&&Number(input?.qualifyingQuotes)>0;
 const researchDays=pageReadable?dateAge(pageMap.get("research"),now):null;
 const sectorDays=pageReadable?dateAge(pageMap.get("sectors"),now):null;
 const oldPages=pageReadable?["research","sectors","portfolio","decisions"].filter(
   key=>{const age=dateAge(pageMap.get(key),now);return age===null||age>7;}):[];
 const eligiblePeg=ideaReadable?ideas.filter(x=>pegSuitability(x).status!=="NOT_APPLICABLE"):[];
 const macroDated=ideaReadable?ideas.filter(x=>dated(x.macro_as_of,14,now)&&validSource(x.macro_source_url)
  &&["SUPPORTIVE","MIXED","ADVERSE"].includes(x.macro_state)).length:0;
 const pegDated=ideaReadable?eligiblePeg.filter(x=>dated(x.peg_as_of,45,now)
  &&validSource(x.peg_source_url)&&Number(x.peg)>0&&String(x.peg_basis||"").trim().length>=5).length:0;
 const snapshotDays=dateAge(input?.snapshotAsOf,now);
 const ledgerKnown=Number.isInteger(input?.ledgerCount)&&input.ledgerCount>=0;
 const decisionKnown=Number.isInteger(input?.decisionCount)&&input.decisionCount>=0;
 const sections=[
  {key:"prices",name:"Market closes",status:priceReady?"CURRENT":feedAt?"STALE":"UNAVAILABLE",
   detail:priceReady?displayDay(feedAt)+" delayed · "+input.qualifyingQuotes+" source-qualified"
     :"No current source-qualified exchange-close feed"},
  {key:"research",name:"Research pages",status:!pageReadable?"UNAVAILABLE":
    researchDays!==null&&sectorDays!==null&&researchDays<=7&&sectorDays<=7?"EDITED_RECENTLY":"OLDER",
   detail:pageReadable?"Research "+displayDay(pageMap.get("research"))+
    " · sectors "+displayDay(pageMap.get("sectors"))+" (page edits only)":"Private page metadata unavailable"},
  {key:"ideas",name:"Idea evidence",status:!ideaReadable?"UNAVAILABLE":
    macroDated===ideas.length&&pegDated===eligiblePeg.length?"DATED":"PARTIAL",
   detail:ideaReadable?macroDated+"/"+ideas.length+" macro dated ≤14d · "+
    pegDated+"/"+eligiblePeg.length+" PEG sourced ≤45d":"Private idea records unavailable"},
  {key:"decisions",name:"Owner decisions",status:!decisionKnown?"UNAVAILABLE":input.decisionCount?"RECORDED":"NONE",
   detail:decisionKnown?input.decisionCount+" saved revisions · not broker orders":"Decision history unavailable"},
  {key:"portfolio",name:"Portfolio baseline",status:!ledgerKnown?"UNAVAILABLE":"UNRECONCILED",
   detail:"Archived "+displayDay(input?.snapshotAsOf)+" · "+
    (ledgerKnown?input.ledgerCount+" recorded transactions":"transaction ledger unavailable")+
    " · broker confirmation missing"}
 ];
 const queue=[];
 if(!priceReady)queue.push({kind:"STALE",title:"Check delayed market feed",
  detail:"The latest completed-session price source is unavailable or overdue. Do not use old technical alerts.",
  href:"portfolio.html#watchlist"});
 if(snapshotDays===null||snapshotDays>7||!ledgerKnown||input.ledgerCount===0)
  queue.push({kind:"UNVERIFIED",title:"Confirm current portfolio before sizing",
   detail:"The saved holdings baseline is "+displayDay(input?.snapshotAsOf)+
    "; live cash, fills and account allocations have not been reconciled.",
   href:"portfolio.html"});
 if(ideaReadable&&(macroDated<ideas.length||pegDated<eligiblePeg.length)){
  const macroMissing=ideas.length-macroDated,pegMissing=eligiblePeg.length-pegDated;
  const recent=ideas.filter(x=>x?.ticker&&
   (!dated(x.macro_as_of,14,now)||!validSource(x.macro_source_url)||
    (pegSuitability(x).status!=="NOT_APPLICABLE"&&
    (!dated(x.peg_as_of,45,now)||!validSource(x.peg_source_url)))))
   .sort((a,b)=>String(b.updated_at||"").localeCompare(String(a.updated_at||"")))
   .slice(0,3).map(x=>String(x.ticker).slice(0,15)).join(", ");
  queue.push({kind:"RECHECK",title:"Recheck stock evidence before ranking",
   detail:macroMissing+" macro and "+pegMissing+" applicable PEG inputs lack sufficiently dated source fields."+
    (recent?" Recent saved ideas to examine: "+recent+".":"")+" These are not buy picks.",
   href:"ideas.html"});
 }else if(!ideaReadable)queue.push({kind:"UNAVAILABLE",title:"Private idea evidence not readable",
   detail:"Do not infer current valuation or macro alignment.",href:"ideas.html"});
 if(pageReadable&&oldPages.length)queue.push({kind:"OLDER",title:"Refresh the published research views",
  detail:oldPages.join(", ")+" last edited over seven days ago or have missing timestamps. New issuer research may not be reflected there.",
  href:"research.html"});
 if(decisionKnown&&input.decisionCount===0)queue.push({kind:"NOT_REVIEWED",title:"No reviewed decisions saved",
   detail:"New research and changed prices cannot be described as approved investments until a dated owner ticket is reviewed.",
   href:"decisions.html"});
 else if(!decisionKnown)queue.push({kind:"UNAVAILABLE",title:"Decision history unavailable",
   detail:"No action can be inferred without owner-only history.",href:"decisions.html"});
 return {contractVersion:REVIEW_FRESHNESS_CONTRACT,sections,queue,
  headline:priceReady?"Quotes updated; research and decisions checked separately":"Quotes not verified as current",
  updatedQuoteAt:feedAt,sourceCounts:{macroDated,macroTotal:ideaReadable?ideas.length:null,
   pegDated,pegTotal:ideaReadable?eligiblePeg.length:null},unverifiedChange:true};
}
const el=(tag,className,text)=>{
 const v=document.createElement(tag);
 if(className)v.className=className;
 if(text!==undefined)v.textContent=String(text);
 return v;
};
export function renderResearchReview(host,input,now=new Date()){
 if(!host)return;
 const review=summarizeResearchReview(input,now);
 host.replaceChildren();
 const lead=el("div","psr-review-lead");
 lead.append(el("div","psr-review-heading"));
 lead.firstChild.append(el("p","psr-simple-eyebrow","RESEARCH → DECISION / SOURCE HEALTH"),
  el("h2",null,"What needs reviewing"));
 lead.append(el("p","psr-review-headline",review.headline));
 host.append(lead);
 const items=el("div","psr-review-tasks");
 const visible=review.queue.slice(0,3);
 for(const item of visible){
  const line=el("div","psr-review-task");
  const body=el("div");
  body.append(el("strong",null,item.title),el("p",null,item.detail));
  const link=el("a",null,"Review");link.href=item.href;
  line.dataset.status=item.kind;line.append(body,link);items.append(line);
 }
 if(!visible.length)items.append(el("p","psr-review-clear",
   "No dated-record gap detected in this readout; evidence and entries still require independent checks."));
 host.append(items);
 const details=el("details","psr-review-detail");
 details.append(el("summary",null,"Source freshness & "+Math.max(0,review.queue.length-visible.length)+" additional reviews"));
 const grid=el("div","psr-review-sources");
 for(const s of review.sections){
  const card=el("div","psr-review-source");
  card.append(el("strong",null,s.name),el("span",null,s.status.replaceAll("_"," ")),
   el("small",null,s.detail));grid.append(card);
 }
 details.append(grid);
 for(const item of review.queue.slice(visible.length)){
  const row=el("p","psr-review-additional");
  const a=el("a",null,item.title);a.href=item.href;
  row.append(a,document.createTextNode(" · "+item.detail));details.append(row);
 }
 details.append(el("p","psr-review-disclaimer",
  "Page edit dates are not evidence of thesis changes. PEG suitability varies by business. "+
  "Bluebelly's source-coverage link does not verify a new canonical Regime. "+
  "No automatic rating, conviction or trading decision is produced."));
 host.append(details);
}
