/* Evidence-first War Room. The stage voices are editorial. Findings are dated,
   sourced research snapshots; owner decisions and prices remain separately identified.
   No brokerage operations, auto-updates or invented confidence scores. */
import {BRIEFING_EDITION,VERIFIED_FINDINGS,DESK_ORDER,findingsForDesk,validateFinding} from "./owner-war-room-findings.mjs?v=20261114-evidence2";
export const DESKS=Object.freeze([
 {id:"matt",name:"Matt",role:"HEAD OF THE DESK",icon:"M"},
 {id:"rates",name:"Jimmy",role:"RATES & INFLATION",icon:"%"},
 {id:"ai",name:"David",role:"AI & SEMICONDUCTORS",icon:"◈"},
 {id:"energy",name:"Mike",role:"OIL & HORMUZ",icon:"≈"},
 {id:"aviation",name:"Rachel",role:"AVIATION & INFRASTRUCTURE",icon:"✈"},
 {id:"selection",name:"Sarah",role:"VALUATION & STOCK SELECTION",icon:"◇"}
]);
const MATT_SAYS=Object.freeze({
 matt:"THAT'S THE GODDAMN PICTURE! RATES ARE HIGH, THE AI STORY IS SPLITTING, OIL HAS ROLLED OVER, AND THE FAA JUST REMINDED US INFRASTRUCTURE MATTERS. DIFFERENT PROBLEMS. DIFFERENT TRADES!",
 rates:"JIMMY! MONTHLY INFLATION COOLED BUT THE TEN-YEAR IS STILL OVER FIVE! THAT MEANS OUR DURATION BUY BUTTON STAYS LOCKED UNTIL THE YIELD ACTUALLY TURNS!",
 ai:"DAVID! NVIDIA IS RSI-OVERSOLD AND BELOW ITS LOWER DAILY BAND. THAT IS NOT A BUY ORDER! COMPARE CISCO\'S GUIDANCE AND NEBIUS\'S FINANCING BEFORE WE RISK A SINGLE DOLLAR!",
 energy:"MIKE! OIL'S DOWN ON THE WEEK WHILE HORMUZ IS STILL RISKY! THAT'S THE CONTRADICTION. STOP BUYING EVERY PRODUCER ON A WAR HEADLINE!",
 aviation:"RACHEL! FRIDAY\'S GROUND STOP WAS LIFTED. THE NETWORK OVERLOAD IS THE PRELIMINARY FAILURE MECHANISM; THE TRIGGER IS NOT YET PROVEN. SHOW ME REAL NEW CONTRACTS, NOT OLD AWARDS!",
 selection:"SARAH! NVENT'S GROWTH LOOKS GOOD AGAINST EATON, BUT WHAT ABOUT ACQUISITION DEBT? SHOW ME THE FULL CASH ECONOMICS BEFORE CALLING IT CHEAP!"
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
export function mountWarRoom(workspace,getState,{asOf}={}){
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
  msg.append(el("strong",null,"MATT SAYS"),el("p",null,MATT_SAYS[desk.id]));
  matt.append(mark,msg);panel.append(matt);
  const set=findingsForDesk(desk.id).filter(validateFinding);
  const collection=el("div","psw-desk-findings");
  for(const item of set)collection.append(makeFindingCard(item,state));
  if(!set.length)collection.append(el("p","psw-empty","No verified dated findings for this desk."));
  panel.append(collection);
  const link=el("a","psw-desk-research",desk.id==="matt"?"Open all investment decisions ↗":"Read the detailed research ↗");
  link.href=desk.id==="matt"?"decisions.html":"research.html";panel.append(link);
 }
 function render(){
  const state=getState()||{};
  $(root,"#psw-edition").textContent="RESEARCH EDITION · "+BRIEFING_EDITION;
  $(root,"#psw-research-date").textContent=BRIEFING_EDITION+" · fixed edition";
  $(root,"#psw-price-date").textContent=state.marketAsOf?dateText(state.marketAsOf)+" · delayed":"Unavailable / too old";
  $(root,"#psw-decision-date").textContent=state.rows?.[0]?.created_at?dateText(state.rows[0].created_at):"No verified revision";
  const saved=readChanges(state),revised=saved.find(x=>x.label==="ACTION REVISED");
  $(root,"#psw-matt-lead").textContent=revised
    ?'"ALRIGHT! '+String(revised.name).toUpperCase()+' MOVED TO '+revised.change.toUpperCase()+'. BUT LOOK AT THE ACTUAL MARKET EVIDENCE BEFORE YOU CHANGE ANOTHER GODDAMN POSITION!"'
    :'"NVIDIA IS OVERSOLD, CISCO HAS AN EARNINGS-EXPECTATION GAP, THE FAA REOPENED AND CHIP BREADTH REMAINS WEAK! DIFFERENT SETUPS — NO BLIND DIP BUY!"';
  const summary=$(root,"#psw-chief-findings");summary.replaceChildren();
  for(const item of findingsForDesk("matt").filter(validateFinding))
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
