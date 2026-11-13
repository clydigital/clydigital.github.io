/* Power Stack War Room — editorial presentation over owner-authenticated decisions.
   No orders, model probabilities, private data writes or unsourced real-time quotes.
   Analyst personas are explanatory roles, never autonomous background agents. */
const DESKS = [
  {id:"matt",name:"Matt",role:"HEAD OF THE DESK",label:"Matt's call",icon:"M",
   tickers:[],position:"What would make the whole market change its mind?",
   why:"Rates determine what future profits are worth. Earnings determine whether those profits arrive. Energy, geopolitics and credit can upset both. We need to see where those mechanisms agree — and where they fight.",
   view:"Run the full cross-asset decision tree. Maintain an existing thesis until verified evidence changes its assumptions, then update the decision and its risks.",
   orders:["JIMMY: Reconcile nominal and real yields with inflation and credit. Find the actual repricing driver.","DAVID AND MIKE: Compare earnings quality, AI spending, oil supply and the market's response to contradictory news.","RACHEL AND SARAH: Verify event damage, rank resilient opportunities and present a trade gate with an invalidation."],
   go:"A sourced change to the macro or issuer case, plus a defined entry, risk budget and verified price setup.",
   no:"Stale evidence, an unresolved event, weak cash-flow support, or no defensible invalidation.",
   source:null},
  {id:"rates",name:"Jimmy",role:"RATES & INFLATION",label:"Rates",icon:"%",tickers:["TLT","IEF","VGIT","SGOV","TIP"],position:"Is expensive money still suppressing risk assets?",
   why:"Higher real yields increase the discount rate on future cash flows and pressure long-duration bonds. A headline CPI number alone cannot explain the move.",
   view:"Track the interaction of inflation, nominal yields, real yields, DXY, the Fed path and credit rather than calling a yield top.",
   orders:["Compare same-session 2Y, 10Y and 30Y Treasury moves with TIPS yields.","Separate inflation compensation from real-rate increases.","Check whether TLT is reclaiming its trend only after yields confirm a reversal."],
   go:"Confirmed decline in long real and nominal yields with improving bond-price structure.",
   no:"New inflation pressure, rising real yields or a fresh long-yield breakout.",
   source:"https://home.treasury.gov/resource-center/data-chart-center/interest-rates"},
  {id:"ai",name:"David",role:"AI & SEMICONDUCTORS",label:"AI & chips",icon:"◈",tickers:["NVDA","AMD","AVGO","MU","GOOGL","MSFT","AMZN","META"],
   position:"Which AI businesses actually turn spending into cash?",
   why:"Strong chip shipments do not guarantee strong returns to every AI financier or application business. Financing and cash conversion can diverge from headline revenue.",
   view:"Separate hyperscalers, silicon suppliers, memory, power infrastructure and leveraged AI financing before ranking opportunities.",
   orders:["Compare guidance changes with capex, revenue and free-cash-flow conversion.","Compare semiconductor relative strength against broader Nasdaq participation.","Treat governance, earnings or financing surprises as event gates, not automatic buys."],
   go:"Issuer evidence, cash conversion and price structure agree with the thesis.",
   no:"Guidance deterioration, unreliable financing or failure to defend technical support.",
   source:"https://www.sec.gov/edgar/search/"},
  {id:"energy",name:"Mike",role:"OIL, FUEL & HORMUZ",label:"Energy",icon:"≈",tickers:["XOM","CVX","MPC","VLO","LNG","DAYANG"],
   position:"Is oil's inflation premium expanding or unwinding?",
   why:"Crude, diesel cracks, freight and insured shipping access can move differently. A diplomatic proposal is not proof of safe commercial navigation.",
   view:"Price the physical flow of energy, not just political headlines.",
   orders:["Verify completed vessel transits, insured access and supply conditions.","Compare crude prices against diesel and refinery spreads.","Stress-test producer positions under both escalation and sustained reopening."],
   go:"Confirmed supply constraint or relief together with consistent market-price reaction.",
   no:"Narrative changes unsupported by physical shipping or product-market evidence.",
   source:"https://www.eia.gov/petroleum/"},
  {id:"aviation",name:"Rachel",role:"AVIATION & INFRASTRUCTURE",label:"Aviation",icon:"✈",tickers:["DAL","UAL","AAL","LUV","LHX"],
   position:"Is an aviation disruption temporary or economically persistent?",
   why:"Ground stops can create crew and aircraft dislocation, but the market impact depends on duration. Public modernisation plans are not new contractor earnings.",
   view:"Treat an FAA incident as an event investigation until official recovery and contracts are verified.",
   orders:["Check official FAA notices and subsequent restoration status.","Measure actual airline cancellations and operational recovery.","Map awarded government contracts separately from proposed spending."],
   go:"Verified prolonged disruption or incremental awarded contracts with measurable earnings impact.",
   no:"Service normalises quickly or no causally linked revenue opportunity exists.",
   source:"https://www.faa.gov/"},
  {id:"selection",name:"Sarah",role:"STOCK SELECTION & VALUATION",label:"Stock picks",icon:"◇",tickers:["GOOGL","CF","BWXT","ADBE","CVS","CI","FLEX","GEV","VRT"],
   position:"Which names survive more than one market scenario?",
   why:"A low multiple can be a value trap when earnings are cyclical, adjusted or unusually financed. High-quality cash flows can still be overpriced.",
   view:"Prioritise valuation, issuer cash generation, downside resilience and a credible technical entry rather than popularity.",
   orders:["Reconcile normalised cash flow with management guidance and filings.","Compare upside and downside across explicit scenario assumptions.","Require a price/EMA retest, invalidation and portfolio concentration review."],
   go:"Adequate valuation margin, scenario resilience and a verified entry setup.",
   no:"Cash-flow deterioration, stretched valuation or missing risk/portfolio evidence.",
   source:"https://www.sec.gov/edgar/search/"}
];
const MATT_SAYS=Object.freeze({
  matt:"ALRIGHT, ALRIGHT! FIRST WE EXPLAIN THE WHY. THEN WE GIVE ORDERS. WE DON'T GET TO CALL A GUESS A GODDAMN TRADE!",
  rates:"JIMMY! DON'T JUST READ ME A YIELD! TELL ME WHAT MOVED IT — REAL RATES, INFLATION OR CREDIT — AND WHO GETS HURT!",
  ai:"DAVID! SHOW ME THE CASH! GPU SALES ARE ONE THING. WHO'S FUNDING THE COMPUTE, AND WHO'S ACTUALLY COLLECTING?",
  energy:"MIKE! I WANT SHIPS, INSURANCE, DIESEL SPREADS! A POLITICIAN'S PROMISE IS NOT A TANKER THROUGH HORMUZ!",
  aviation:"RACHEL! AN OUTAGE IS NOT A RECESSION! SHOW ME THE RESTORATION NOTICE, THE FLIGHTS, AND THE ACTUAL CONTRACTS!",
  selection:"SARAH! A LOW MULTIPLE IS NOT A BUY SIGNAL! GIVE ME NORMALISED CASH FLOW, A DOWNSIDE CASE AND A LEVEL WHERE WE'RE WRONG!"
});
const $=(root,selector)=>root.querySelector(selector);
const el=(tag,cls,text)=>{
  const n=document.createElement(tag);if(cls)n.className=cls;
  if(text!==undefined&&text!==null)n.textContent=String(text);return n;
};
function dateText(value){
  if(!value)return "Not verified";
  const d=new Date(value);
  return Number.isNaN(d.getTime())?"Not verified":d.toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Kuala_Lumpur"})+" MYT";
}
function cleanUrl(value){try{const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password?u.href:null}catch{return null}}
function action(x){return String(x||"UNKNOWN").replaceAll("_"," ")}
function readChanges(state){
  const rows=Array.isArray(state.rows)?state.rows:[];
  const seen=new Map(),result=[];
  for(const record of rows){
    if(!record.ticket||!record.case_key)continue;
    const prior=seen.get(record.case_key);
    if(prior)continue;
    const compare=rows.find(row=>row.case_key===record.case_key&&row.entry_id!==record.entry_id);
    const next=action(record.ticket.recommendation?.action);
    const prev=compare? action(compare.ticket?.recommendation?.action):null;
    const changed=Boolean(compare&&prev!==next);
    const source=record.ticket?.evidence?.source_refs?.find(cleanUrl);
    result.push({name:record.ticket.subject?.name||record.ticket.subject?.instrument_id||"Reviewed case",
      label:changed?"ACTION REVISED":compare?"LATEST REVIEW":"FIRST SAVED REVIEW",
      change:changed?prev+" → "+next:next,
      why:record.ticket.recommendation?.rationale||"Review the owner-saved decision for the full evidence.",
      date:record.created_at,source:cleanUrl(source)});
    seen.set(record.case_key,true);
    if(result.length>=4)break;
  }
  return result;
}
function mountWarRoom(workspace,getState,{asOf}={}){
  const root=el("section","psw-root");root.id="war-room";
  root.setAttribute("aria-label","Matt's War Room: guided investment research");
  root.innerHTML=`
  <div class="psw-topline"><span>POWER STACK / THE WAR ROOM</span><span>OWNER RESEARCH</span></div>
  <section class="psw-hero" aria-labelledby="psw-lead-heading">
   <div class="psw-hero-main">
    <div class="psw-matt-identity">
     <div class="psw-matt-portrait" aria-hidden="true"><span>M</span><i></i></div>
     <div><strong>MATT</strong><small>HEAD OF THE TRADING DESK</small></div>
    </div>
    <h1 id="psw-lead-heading">THE MARKET'S TALKING.<br><em>WE'RE LISTENING.</em></h1>
    <blockquote class="psw-matt-speech"><p id="psw-matt-lead" aria-live="polite">"ALRIGHT, ALRIGHT! I WANT THE WHY, THE EVIDENCE, AND WHAT WOULD CHANGE OUR GODDAMN MINDS!"</p></blockquote>
    <nav class="psw-hero-actions" aria-label="War Room destinations"><a class="psw-primary" href="#warroom-team">Hear Matt's call ↓</a><a href="#warroom-changes">What changed ↓</a><a href="ideas.html">Find opportunities ↗</a></nav>
   </div>
   <aside class="psw-situation" aria-label="Research timestamps">
    <p class="psw-eyebrow">RESEARCH CLOCK</p>
    <dl><div><dt>Price feed</dt><dd id="psw-price-date">Checking…</dd></div>
    <div><dt>Saved decision</dt><dd id="psw-decision-date">Checking…</dd></div>
    <div><dt>Scenario analysis</dt><dd id="psw-research-date">Checking…</dd></div></dl>
   </aside>
  </section>
  <section class="psw-team" id="warroom-team" aria-labelledby="psw-team-h">
   <div class="psw-section-heading"><div><p class="psw-eyebrow">01 / WAR ROOM RUNDOWN</p><h2 id="psw-team-h">Matt & the team</h2></div></div>
   <div class="psw-team-layout"><div id="psw-tabs" class="psw-tabs" role="tablist" aria-label="Choose a desk"></div><article id="psw-analyst-panel" class="psw-analyst-panel" role="tabpanel" tabindex="0"></article></div>
  </section>
  <section class="psw-changes" id="warroom-changes" aria-labelledby="psw-changes-h">
   <div class="psw-section-heading"><div><p class="psw-eyebrow">02 / SAVED DECISIONS</p><h2 id="psw-changes-h">What changed?</h2></div><a href="decisions.html">Full history ↗</a></div>
   <div id="psw-change-list" class="psw-change-list" aria-live="polite">Checking decisions…</div>
  </section>
  <section class="psw-actions" aria-labelledby="psw-actions-h"><div class="psw-section-heading"><div><p class="psw-eyebrow">03 / GO DEEPER</p><h2 id="psw-actions-h">Open the evidence</h2></div></div>
   <nav class="psw-links" aria-label="Research tools"><a href="ideas.html">Opportunities →</a><a href="portfolio.html#watchlist">Prices & watchlist →</a><a href="research.html">Research →</a><a href="#desk-tools">Radar & scenarios ↓</a></nav>
  </section>
  <p class="psw-footer">Matt and the analysts are editorial voices, not independent agents. Delayed research and price observations are not trade orders.</p>
  `;
  workspace.prepend(root);
  const tabs=$(root,"#psw-tabs"),panel=$(root,"#psw-analyst-panel");
  let chosen="matt";
  for(const desk of DESKS){
    const button=el("button","psw-tab");button.type="button";button.setAttribute("role","tab");
    button.id="psw-tab-"+desk.id;button.dataset.desk=desk.id;
    button.setAttribute("aria-controls","psw-analyst-panel");
    button.append(el("span","psw-tab-icon",desk.icon),el("span","psw-tab-title",desk.name),el("small",null,desk.role));
    button.addEventListener("click",()=>{chosen=desk.id;renderDesk();});
    button.addEventListener("keydown",event=>{
      if(!["ArrowDown","ArrowUp","ArrowLeft","ArrowRight"].includes(event.key))return;
      event.preventDefault();
      const index=DESKS.findIndex(item=>item.id===chosen);
      chosen=DESKS[(index+(event.key==="ArrowDown"||event.key==="ArrowRight"?1:DESKS.length-1))%DESKS.length].id;
      renderDesk();$(root,"#psw-tabs").querySelector('[data-desk="'+chosen+'"]').focus();
    });
    tabs.append(button);
  }
  function renderDesk(){
    const desk=DESKS.find(d=>d.id===chosen)||DESKS[0];
    for(const btn of tabs.querySelectorAll("[data-desk]")){
      const selected=btn.dataset.desk===desk.id;
      btn.setAttribute("aria-selected",String(selected));btn.tabIndex=selected?0:-1;
    }
    panel.setAttribute("aria-labelledby","psw-tab-"+desk.id);
    panel.replaceChildren();
    const top=el("div","psw-desk-head");
    const identity=el("div");
    identity.append(el("p","psw-eyebrow",desk.name.toUpperCase()+" / "+desk.role),el("h3",null,desk.position));
    top.append(identity);panel.append(top);
    const matt=el("aside","psw-matt-interrupt");
    const mattMark=el("span","psw-matt-mini","M");
    const mattWords=el("div");mattWords.append(el("strong",null,"MATT SAYS"),el("p",null,MATT_SAYS[desk.id]));
    matt.append(mattMark,mattWords);panel.append(matt);
    const frame=el("div","psw-explain");
    for(const [label,body] of [["WHY THIS MATTERS",desk.why],["OUR VIEW",desk.view]]){
      const group=el("div","psw-explain-item");
      group.append(el("strong",null,label),el("p",null,body));frame.append(group);
    }
    panel.append(frame);
    panel.append(el("h4",null,"YOUR ORDERS"));
    const list=el("ol","psw-order-list");
    for(const order of desk.orders)list.append(el("li",null,order));
    panel.append(list);
    const gates=el("div","psw-gates");
    const yes=el("div","psw-gate psw-gate-yes"),no=el("div","psw-gate psw-gate-no");
    yes.append(el("strong",null,"GO / CONFIRM"),el("p",null,desk.go));
    no.append(el("strong",null,"NO-GO / CHANGE MY MIND"),el("p",null,desk.no));
    gates.append(yes,no);panel.append(gates);
    const bottom=el("div","psw-desk-bottom");
    if(desk.source){
      const source=el("a",null,"Primary source ↗");source.href=desk.source;source.target="_blank";source.rel="noopener noreferrer";
      bottom.append(source);
    }
    const ideasLink=el("a",null,desk.id==="matt"?"Review saved calls ↗":"Research ideas ↗");
    ideasLink.href=desk.id==="matt"?"decisions.html":"ideas.html";bottom.append(ideasLink);
    panel.append(bottom);
    const state=getState()||{};
    const related=(state.ideaRows||[]).filter(row=>desk.tickers.includes(String(row.ticker||"").toUpperCase())).slice(0,3);
    if(related.length){
      const ideas=el("div","psw-desk-ideas");
      ideas.append(el("strong",null,"OWNER TRACKER · DATED RESEARCH"));
      for(const idea of related){
        const line=el("p");
        line.append(el("b",null,String(idea.ticker)+" · "));
        line.append(document.createTextNode(String(idea.macro_reason||idea.note||"No current research rationale recorded.").slice(0,220)));
        line.append(el("small",null,"Reviewed: "+(idea.macro_as_of||idea.updated_at||"Unknown")));
        ideas.append(line);
      }
      panel.append(ideas);
    }else{
      panel.append(el("p","psw-desk-empty","No matching reviewed ideas."));
    }
  }
  function render(){
    const state=getState()||{};
    $(root,"#psw-price-date").textContent=state.marketAsOf?dateText(state.marketAsOf)+" · delayed":"Unavailable or too old";
    $(root,"#psw-decision-date").textContent=state.rows?.[0]?.created_at?dateText(state.rows[0].created_at):"No verified revision";
    $(root,"#psw-research-date").textContent=asOf||"Not dated";
    const host=$(root,"#psw-change-list");host.replaceChildren();
    const changes=readChanges(state);
    const revised=changes.find(c=>c.label==="ACTION REVISED");
    const first=changes[0];
    const mattLead=$(root,"#psw-matt-lead");
    mattLead.textContent=revised
      ?'"ALRIGHT! OUR LAST SAVED REVIEW CHANGED '+String(revised.name).toUpperCase()+' FROM '+revised.change.toUpperCase()+'. CHECK THE DATE, READ THE EVIDENCE, AND TELL ME WHAT WOULD REVERSE IT!"'
      :first
      ?'"ALRIGHT! THE LAST SAVED CALL ON '+String(first.name).toUpperCase()+' IS '+first.change.toUpperCase()+'. NOBODY ACTS WITHOUT CHECKING THE DATE AND THE COUNTERCASE!"'
      :'"ALRIGHT, ALRIGHT! NO VERIFIED NEW CALLS? THEN WE DON\'T INVENT ONE! GET ME THE EVIDENCE BEFORE ANYBODY HITS THE BUY BUTTON!"';
    if(!changes.length){
      host.append(el("p","psw-empty","No saved decisions verified."));
    }else{
      for(const change of changes){
        const card=el("article","psw-change");
        const heading=el("div","psw-change-top");
        heading.append(el("strong",null,change.name),el("span",null,change.label));
        card.append(heading,el("p","psw-change-action",change.change),el("p",null,change.why),
          el("small",null,"Owner decision dated: "+dateText(change.date)));
        if(change.source){const link=el("a",null,"Evidence ↗");link.href=change.source;link.target="_blank";link.rel="noopener noreferrer";card.append(link);}
        host.append(card);
      }
    }
    renderDesk();
  }
  render();
  return {root,render,focusTeam(){root.querySelector("#warroom-team")?.scrollIntoView({block:"start"})}};
}
export {mountWarRoom,DESKS};
