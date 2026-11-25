/* Evidence-first War Room. The stage voices are editorial. Findings are dated,
   sourced research snapshots; owner decisions and prices remain separately identified.
   No brokerage operations, auto-updates or invented confidence scores. */
import {BRIEFING_EDITION,VERIFIED_FINDINGS,DESK_ORDER,findingsForDesk,validateFinding} from "./owner-war-room-findings.mjs?v=20261124-findings1";
export const DESKS=Object.freeze([
 {id:"matt",name:"Matt",role:"HEAD OF THE DESK",icon:"M"},
 {id:"rates",name:"Jimmy",role:"RATES & INFLATION",icon:"%"},
 {id:"ai",name:"David",role:"AI & SEMICONDUCTORS",icon:"◈"},
 {id:"energy",name:"Mike",role:"OIL & HORMUZ",icon:"≈"},
 {id:"aviation",name:"Rachel",role:"AVIATION & INFRASTRUCTURE",icon:"✈"},
 {id:"selection",name:"Sarah",role:"VALUATION & STOCK SELECTION",icon:"◇"}
]);
const MATT_SAYS=Object.freeze({
 matt:"THE RELIEF RALLY IS REAL, BUT THE BROAD MARKET HAS NOT CONFIRMED IT! PUT FUNDED CASH FLOW, RETESTS AND THE PCE REACTION AHEAD OF ONE GREEN CANDLE!",
 rates:"JIMMY! A +0.3% OCTOBER PCE IS NOT A MISS. SHOW ME THE 2Y, DXY BAND REJECTION AND REAL YIELDS BEFORE TALKING ABOUT GOLD!",
 ai:"DAVID! A THIRTY-ONE-PERCENT NVIDIA REBOUND ISN'T A FREE-CASH-FLOW STATEMENT! CHECK WHO PAYS THE GPU BILL!",
 energy:"MIKE! CRUDE IS FALLING, BUT LNG CONTRACTS AND REFINERY CRACKS ARE DIFFERENT TRADES! GET ME THE PHYSICAL NUMBERS!",
 aviation:"RACHEL! THE FAA HAS NARROWED THE INVESTIGATION, NOT PROVEN THE ROOT CAUSE. SHOW ME REAL NEW CONTRACTS!",
 selection:"SARAH! BWXT, MWA, ETN, LNG FIRST FOR RESEARCH, NOT AUTO-BUYS. CHECK THE PRICE WE'RE PAYING!"
});
const $=(root,s)=>root.querySelector(s);
const el=(tag,cls,value)=>{
 const node=document.createElement(tag);if(cls)node.className=cls;
 if(value!==undefined&&value!==null)node.textContent=String(value);return node;
};
const pretty=x=>String(x||"UNKNOWN").replaceAll("_"," ");
function dateText(x){
 if(!x)return "Not verified";
 const d=new Date(x);
 return Number.isNaN(d.getTime())?"Not verified":d.toLocaleString("en-GB",{timeZone:"Asia/Kuala_Lumpur",dateStyle:"medium",timeStyle:"short"})+" MYT";
}
function safeSource(value){
 try{const url=new URL(value);return url.protocol==="https:"&&!url.username&&!url.password&&url.href.length<2048?url.href:null}
 catch{return null}
}
function readChanges(state){
 const rows=Array.isArray(state?.rows)?state.rows:[];
 const latest=new Map(),result=[];
 for(const row of rows){
  if(!row?.ticket||!row.case_key||latest.has(row.case_key))continue;
  latest.set(row.case_key,true);
  const previous=rows.find(other=>other.case_key===row.case_key&&other.entry_id!==row.entry_id);
  const current=pretty(row.ticket.recommendation?.action),former=previous?pretty(previous.ticket?.recommendation?.action):null;
  result.push({name:row.ticket.subject?.name||row.ticket.subject?.instrument_id||"Reviewed case",
   label:previous&&current!==former?"ACTION REVISED":previous?"REVIEWED / UNCHANGED":"FIRST REVIEW",
   change:previous&&current!==former?former+" → "+current:current,
   why:row.ticket.recommendation?.rationale||"Review the saved decision and its evidence.",
   date:row.created_at,
   source:(row.ticket.evidence?.source_refs||[]).map(safeSource).find(Boolean)||null
  });
  if(result.length>=4)break;
 }
 return result;
}
function latestOwnerCall(finding,rows){
 const id=String(finding?.symbol||"").split(/[^A-Z0-9.]+/).filter(Boolean);
 if(!Array.isArray(rows)||!id.length)return null;
 return rows.find(row=>id.includes(String(row.ticket?.subject?.instrument_id||"").toUpperCase())&&row.ticket?.recommendation?.action)||null;
}
function priceFor(finding,state){
 if(!(state?.priceMap instanceof Map)||!state.marketAsOf)return null;
 const ticker=String(finding.symbol||"").split("/")[0].trim();
 if(!/^[A-Z]{1,6}$/.test(ticker))return null;
 const q=state.priceMap.get(ticker);
 if(!Number.isFinite(q?.close)||!q?.session)return null;
 const pct=Number.isFinite(q.day)?(q.day>0?"+":"")+q.day.toFixed(2)+"%":null;
 return {ticker,close:q.close,currency:q.currency||"USD",session:q.session,pct};
}

// The owner edition is the current research source. Fixed public findings are
// retained as an explicitly historical fallback, never silently redated.
export function currentDeskBrief(edition,desk){
 if(edition?.contract!=="ps-investment-intelligence/1"||!edition.teamBrief||!Number.isFinite(Date.parse(edition.asOf)))return null;
 const b=edition.teamBrief,m=edition.macro||{},ops=Array.isArray(edition.opportunities)?edition.opportunities:[],divs=Array.isArray(edition.divergences)?edition.divergences:[];
 const names={matt:"Matt",rates:"Jimmy",ai:"David",energy:"Mike",aviation:"Rachel",selection:"Sarah"};
 const name=names[desk],view=b.deskViews?.[name];if(typeof view!=="string"||!view.trim())return null;
 const cases=desk==="ai"?["NVDA","DELL","MU","CRWV","ORCL","NBIS","AVGO","MSFT","GOOGL"]:desk==="selection"?["CI","XYL","NVDA","BWXT","CF","TTWO","TSLA"]:desk==="energy"?["CF","XOM","DHT","FRO","CMBT","INSW"]:desk==="rates"?["SGOV","USFR","IEF","TLT","LQD","HYG"]:desk==="aviation"?["BWXT"]:["CI","XYL","NVDA","DELL","MU","TTWO","TSLA"];
 return {name,view,asOf:b.asOf||edition.asOf,status:b.status||"PARTIAL",note:b.coverageNote||"Source coverage not established",sources:(Array.isArray(b.sourceResearch)?b.sourceResearch:[]).map(safeSource).filter(Boolean),cases:cases.map(t=>ops.find(x=>x.ticker===t)).filter(Boolean),divergences:desk==="matt"?divs:divs.filter(x=>typeof x.name==="string"&&x.name.includes(name)),context:desk==="matt"?m.why:desk==="rates"?[m.credit,m.opportunityCost,m.inflation].filter(Boolean).join(" · "):desk==="selection"?m.deployment:desk==="energy"?divs.find(x=>String(x.name).includes("lower crude"))?.why:desk==="ai"?divs.find(x=>String(x.name).includes("Adoption"))?.why:null,next:desk==="matt"?m.invalidation:desk==="rates"?m.credit:desk==="aviation"?"Verify incremental awarded scope, actual funding, issuer cash conversion and operational recovery; no new aviation-specific evidence in this edition.":null};
}

export function mountWarRoom(workspace,getState,{asOf,edition=null}={}){
 const root=el("section","psw-root");root.id="war-room";
 root.setAttribute("aria-label","The War Room: findings and investment conclusions");
 root.innerHTML=`
  <div class="psw-topline"><span>POWER STACK / THE WAR ROOM</span><span id="psw-edition">SOURCED EDITION</span></div>
  <section class="psw-hero" aria-labelledby="psw-lead-heading">
   <div class="psw-hero-main">
    <div class="psw-matt-identity"><div class="psw-matt-portrait" aria-hidden="true"><span>M</span><i></i></div><div><strong>MATT</strong><small>HEAD OF THE TRADING DESK</small></div></div>
    <h1 id="psw-lead-heading">HERE'S WHAT WE <em>FOUND.</em></h1>
    <blockquote class="psw-matt-speech"><p id="psw-matt-lead" aria-live="polite">"THE MARKET'S GIVING US CONTRADICTORY SIGNALS. HERE'S WHAT THE EVIDENCE ACTUALLY SAYS!"</p></blockquote>
    <nav class="psw-hero-actions" aria-label="War Room sections"><a class="psw-primary" href="#warroom-findings">The findings ↓</a><a href="#warroom-team">Hear the analysts ↓</a><a href="#warroom-changes">Decision changes ↓</a></nav>
   </div>
   <aside class="psw-situation" aria-label="Evidence dates"><p class="psw-eyebrow">EVIDENCE CLOCK</p>
    <dl><div><dt>Editorial evidence</dt><dd id="psw-research-date">Dated research</dd></div>
    <div><dt>Latest verified price feed</dt><dd id="psw-price-date">Checking…</dd></div>
    <div><dt>Latest owner decision</dt><dd id="psw-decision-date">Checking…</dd></div></dl>
   </aside>
  </section>
  <section class="psw-priority psw-findings" id="warroom-findings" aria-labelledby="psw-findings-h">
   <div class="psw-section-heading"><div><p class="psw-eyebrow">01 / THE BRIEFING</p><h2 id="psw-findings-h">What the evidence says</h2></div></div>
   <div id="psw-chief-findings" class="psw-chief-findings" aria-live="polite"></div>
  </section>
  <section class="psw-team" id="warroom-team" aria-labelledby="psw-team-h">
   <div class="psw-section-heading"><div><p class="psw-eyebrow">02 / DESK FINDINGS</p><h2 id="psw-team-h">Matt & the analysts</h2></div></div>
   <div class="psw-team-layout"><div id="psw-tabs" class="psw-tabs" role="tablist" aria-label="Choose analyst desk"></div><article id="psw-analyst-panel" class="psw-analyst-panel" role="tabpanel" tabindex="0"></article></div>
  </section>
  <section class="psw-changes" id="warroom-changes" aria-labelledby="psw-changes-h">
   <div class="psw-section-heading"><div><p class="psw-eyebrow">03 / OWNER DECISION HISTORY</p><h2 id="psw-changes-h">Did the investment call change?</h2></div><a href="decisions.html">Full history ↗</a></div>
   <div id="psw-change-list" class="psw-change-list" aria-live="polite">Checking saved reviews…</div>
  </section>
  <section class="psw-actions" aria-labelledby="psw-actions-h"><div class="psw-section-heading"><div><p class="psw-eyebrow">04 / UNDERLYING DATA</p><h2 id="psw-actions-h">Inspect the evidence</h2></div></div>
   <nav class="psw-links" aria-label="Research tools"><a href="ideas.html">Investment ideas →</a><a href="portfolio.html#watchlist">Latest prices →</a><a href="research.html">Issuer comparisons →</a><a href="#desk-tools">Scenario matrix ↓</a></nav>
  </section>
  <p class="psw-footer">Analyst voices are editorial. This is a dated research edition, not a live news feed, broker order or automatic portfolio instruction.</p>
 `;
 workspace.prepend(root);
 const tabs=$(root,"#psw-tabs"),panel=$(root,"#psw-analyst-panel");
 const current=desk=>currentDeskBrief(edition,desk);
 let chosen="matt";
 for(const desk of DESKS){
  const button=el("button","psw-tab");button.type="button";
  button.dataset.desk=desk.id;button.id="psw-tab-"+desk.id;
  button.setAttribute("role","tab");button.setAttribute("aria-controls","psw-analyst-panel");
  button.append(el("span","psw-tab-icon",desk.icon),el("span","psw-tab-title",desk.name),el("small",null,desk.role));
  button.addEventListener("click",()=>{chosen=desk.id;renderDesk()});
  button.addEventListener("keydown",event=>{
   if(!["ArrowDown","ArrowUp","ArrowLeft","ArrowRight"].includes(event.key))return;
   event.preventDefault();
   const index=DESKS.findIndex(x=>x.id===chosen);
   chosen=DESKS[(index+(["ArrowDown","ArrowRight"].includes(event.key)?1:DESKS.length-1))%DESKS.length].id;
   renderDesk();$(root,"#psw-tab-"+chosen)?.focus();
  });
  tabs.append(button);
 }
 function makeFindingCard(f,state,{compact=false}={}){
  const card=el("article","psw-finding-card"+(compact?" psw-finding-compact":""));
  const top=el("div","psw-finding-top");
  top.append(el("span","psw-finding-symbol",f.symbol),el("span","psw-finding-posture",f.posture));
  card.append(top,el(compact?"h3":"h4",null,f.headline));
  const fact=el("p","psw-fact",f.fact);card.append(fact);
  const implication=el("div","psw-finding-call");
  implication.append(el("strong",null,"THE CALL"),el("p",null,f.call));card.append(implication);
  if(!compact){
   const why=el("p","psw-finding-why",f.why);
   why.prepend(el("strong",null,"WHY IT MATTERS · "));card.append(why);
   const change=el("details","psw-finding-details");
   change.append(el("summary",null,"What would change this view?"),el("p",null,f.change));card.append(change);
  }
  const quote=priceFor(f,state);
  if(quote){
   card.append(el("p","psw-price-foot",
     quote.ticker+" · "+quote.currency+" "+quote.close.toFixed(2)+" · "+(quote.pct||"change unavailable")+" · "+quote.session+" exchange close"));
  }
  const owner=latestOwnerCall(f,state?.rows);
  if(owner)card.append(el("p","psw-owner-call","SAVED OWNER CALL · "+pretty(owner.ticket.recommendation.action)+" · "+dateText(owner.created_at)));
  const meta=el("div","psw-finding-meta");
  meta.append(el("span",null,"Evidence "+f.asOf));
  for(const [url,label] of [[f.source,"Source ↗"],[f.secondary,"Second source ↗"]]){
   const safe=safeSource(url);if(!safe)continue;
   const link=el("a",null,label);link.href=safe;link.target="_blank";link.rel="noopener noreferrer";
   meta.append(link);
  }
  card.append(meta);return card;
 }
 function makeCurrentCard(brief){
 const card=el("article","psw-finding-card ps-recap-visual-card psw-current-brief");
 card.append(el("small",null,brief.name.toUpperCase()+" · "+brief.asOf+" · "+brief.status),el("h3",null,brief.view));
 if(brief.context)card.append(el("p",null,brief.context));
 if(brief.next){const next=el("div","psw-finding-call");next.append(el("strong",null,"NEXT TEST"),el("p",null,brief.next));card.append(next);}
 card.append(el("small",null,brief.note));
 for(const url of brief.sources){const link=el("a",null,"Saved research evidence");link.href=url;link.rel="noopener noreferrer";link.target="_blank";card.append(link);}
 return card;
 }
 function makeCaseCard(x){
 const card=el("article","psw-finding-card ps-recap-visual-card");
 card.append(el("small",null,"RESEARCH / RECHECK"),el("h3",null,x.ticker+" · "+x.name));
 const q=x.marketObservation;if(q?.status==="SOURCE_DATED"&&Number.isFinite(q.price)&&q.asOf)card.append(el("strong","ps-recap-big-number",q.currency+" "+q.price.toFixed(2)),el("small",null,"BB dated close · "+q.asOf));
 const ec=x.entryCheck;if(ec&&Number.isFinite(ec.ceiling)&&ec.currency===q?.currency&&ec.asOf===q?.asOf&&ec.price===q?.price)card.append(el("p",null,"Research ceiling "+ec.currency+" "+ec.ceiling.toFixed(2)+" · "+(q.price<=ec.ceiling?"Price-only pass; underwriting pending":Number.isFinite(ec.declineRequiredPct)?ec.declineRequiredPct.toFixed(2)+"% further decline required":"Recheck")));
 for(const [label,v] of [["Why",x.why],["Entry",x.entry],["Catalyst",x.catalyst],["Invalidation",x.invalidation]])if(typeof v==="string"&&v.trim()){const f=el("p","ps-recap-fact");f.append(el("strong",null,label),document.createTextNode(v));card.append(f);}
 return card;
 }
 function renderDesk(){
  const desk=DESKS.find(x=>x.id===chosen)||DESKS[0],state=getState()||{};
  for(const btn of tabs.querySelectorAll("[data-desk]")){
   const current=btn.dataset.desk===desk.id;btn.setAttribute("aria-selected",String(current));btn.tabIndex=current?0:-1;
  }
  panel.setAttribute("aria-labelledby","psw-tab-"+desk.id);
  panel.replaceChildren();
  const head=el("div","psw-desk-head");
  const title=el("div");
  title.append(el("p","psw-eyebrow",desk.name.toUpperCase()+" / "+desk.role),
   el("h3",null,desk.id==="matt"?"The cross-asset verdict":"What "+desk.name+" found"));
  head.append(title);panel.append(head);
  const matt=el("aside","psw-matt-interrupt");
  const mark=el("span","psw-matt-mini","M"),msg=el("div");
  const brief=current(desk.id);msg.append(el("strong",null,"MATT SAYS"),el("p",null,brief?brief.view:MATT_SAYS[desk.id]));
  matt.append(mark,msg);panel.append(matt);
  const set=findingsForDesk(desk.id).filter(validateFinding);
  if(brief){panel.append(makeCurrentCard(brief));const collection=el("div","psw-desk-findings");for(const x of brief.cases)collection.append(makeCaseCard(x));for(const d of brief.divergences){const card=el("article","psw-finding-card");card.append(el("h3",null,d.name),el("p",null,d.why),el("p",null,d.countercase),el("p",null,d.resolution));collection.append(card);}panel.append(collection);}
  const archive=el("details","ps-recap-archive-drawer");archive.open=!brief;archive.append(el("summary",null,"Historical desk findings · "+BRIEFING_EDITION));const collection=el("div","psw-desk-findings");for(const item of set)collection.append(makeFindingCard(item,state));if(!set.length)collection.append(el("p","psw-empty","No verified dated findings for this desk."));archive.append(collection);panel.append(archive);
  const link=el("a","psw-desk-research",desk.id==="matt"?"Open all investment decisions ↗":"Read the detailed research ↗");
  link.href=desk.id==="matt"?"decisions.html":"research.html";panel.append(link);
 }
 function render(){
  const state=getState()||{};
  const brief=current("matt");
  $(root,"#psw-edition").textContent=brief?"PRIVATE RESEARCH · "+brief.asOf+" · "+brief.status:"HISTORICAL EDITION · "+BRIEFING_EDITION;
  $(root,"#psw-research-date").textContent=brief?brief.asOf+" · manual research; mixed evidence dates":BRIEFING_EDITION+" · fixed historical edition";
  $(root,"#psw-price-date").textContent=state.marketAsOf?dateText(state.marketAsOf)+" · delayed":"Unavailable / too old";
  $(root,"#psw-decision-date").textContent=state.rows?.[0]?.created_at?dateText(state.rows[0].created_at):"No verified revision";
  const saved=readChanges(state),revised=saved.find(x=>x.label==="ACTION REVISED");
  $(root,"#psw-matt-lead").textContent=brief?brief.view:revised
    ?'"ALRIGHT! '+String(revised.name).toUpperCase()+' MOVED TO '+revised.change.toUpperCase()+'. BUT LOOK AT THE ACTUAL MARKET EVIDENCE BEFORE YOU CHANGE ANOTHER GODDAMN POSITION!"'
    :'"SMH JUST RIPPED WHILE EQUAL-WEIGHT BREADTH LAGGED. THAT IS A SETUP, NOT A NEW REGIME! THE NEXT PCE, REAL YIELDS AND CREDIT GET THE DECIDING VOTE!"';
  const summary=$(root,"#psw-chief-findings");summary.replaceChildren();
  if(brief){summary.append(makeCurrentCard(brief));for(const x of brief.cases.slice(0,3))summary.append(makeCaseCard(x));}else for(const item of findingsForDesk("matt").filter(validateFinding))
   summary.append(makeFindingCard(item,state,{compact:true}));
  const history=$(root,"#psw-change-list");history.replaceChildren();
  if(!saved.length)history.append(el("p","psw-empty","No saved decision revisions verified."));
  else for(const item of saved){
   const card=el("article","psw-change");
   const title=el("div","psw-change-top");title.append(el("strong",null,item.name),el("span",null,item.label));
   card.append(title,el("p","psw-change-action",item.change),el("p",null,item.why),
     el("small",null,"Saved "+dateText(item.date)));
   if(item.source){const link=el("a",null,"Evidence ↗");link.href=item.source;link.target="_blank";link.rel="noopener noreferrer";card.append(link);}
   history.append(card);
  }
  renderDesk();
 }
 render();
 return {root,render,focusTeam(){root.querySelector("#warroom-team")?.scrollIntoView({block:"start"})}};
}
export {readChanges,latestOwnerCall};
