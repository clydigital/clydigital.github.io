/* Power Stack War Room — editorial presentation over owner-authenticated decisions.
   No orders, model probabilities, private data writes or unsourced real-time quotes.
   Analyst personas are explanatory roles, never autonomous background agents. */
const DESKS = [
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
  root.innerHTML=[
   '<div class="psw-topline"><span>POWER STACK / PRIVATE RESEARCH</span><span>THE WAR ROOM · GUIDED BRIEFING</span></div>',
   '<div class="psw-hero"><div class="psw-hero-main"><p class="psw-eyebrow">MATT · HEAD OF THE TRADING DESK</p>',
   '<h1>What changed?<br><em>What do we do about it?</em></h1>',
   '<p class="psw-quote">"GET ME THE EVIDENCE! I DON’T WANT ANOTHER DAMN HEADLINE. TELL ME WHAT CHANGED OUR THESIS, WHO BENEFITS, AND WHAT WOULD PROVE US WRONG!"</p>',
   '<p class="psw-hero-note">The personality is theatrical. The analysis is source-dated, conditional and review-only. No trade or independent research task is automatically executed.</p>',
   '<div class="psw-hero-actions"><a class="psw-primary" href="#warroom-team">Hear from the desks ↓</a><a href="#warroom-changes">What changed ↓</a><a href="ideas.html">Trade & investment ideas ↗</a></div></div>',
   '<aside class="psw-situation"><p class="psw-eyebrow">INTELLIGENCE CLOCK</p><h2>Before we trade, verify.</h2>',
   '<dl><div><dt>Price feed generated</dt><dd id="psw-price-date">Checking…</dd></div>',
   '<div><dt>Last saved decision</dt><dd id="psw-decision-date">Checking…</dd></div>',
   '<div><dt>Scenario methodology</dt><dd id="psw-research-date">Checking…</dd></div></dl>',
   '<p class="psw-caveat">A dated observation is not a live trade signal. Missing evidence stays missing.</p></aside></div>',
   '<section class="psw-priority" aria-labelledby="psw-priority-h"><div class="psw-section-heading"><div><p class="psw-eyebrow">01 / DIRECTIVE</p><h2 id="psw-priority-h">Start with the mechanism, not the headline.</h2></div></div>',
   '<div class="psw-pillars"><article><span>01 · RATES</span><h3>What is the cost of money?</h3><p>Confirm inflation, real yields and credit before choosing duration or growth exposure.</p></article>',
   '<article><span>02 · EARNINGS</span><h3>Who actually produces cash?</h3><p>Compare AI demand and capital spending against revenue, FCF and balance-sheet risk.</p></article>',
   '<article><span>03 · SUPPLY</span><h3>Where is the real bottleneck?</h3><p>Test oil, shipping and infrastructure stories using physical and contractual evidence.</p></article></div></section>',
   '<section class="psw-changes" id="warroom-changes" aria-labelledby="psw-changes-h"><div class="psw-section-heading"><div><p class="psw-eyebrow">02 / DID THE VIEW CHANGE?</p><h2 id="psw-changes-h">Latest saved decision reviews</h2></div><a href="decisions.html">Full decision history ↗</a></div>',
   '<p class="psw-section-lead">Only revisions in your owner-protected decision history appear here. A research date or fresh headline alone does not count as a changed view.</p>',
   '<div id="psw-change-list" class="psw-change-list" aria-live="polite">Checking owner decision history…</div></section>',
   '<section class="psw-team" id="warroom-team" aria-labelledby="psw-team-h"><div class="psw-section-heading"><div><p class="psw-eyebrow">03 / THE ANALYSTS</p><h2 id="psw-team-h">The team gives you the rundown.</h2></div></div>',
   '<p class="psw-section-lead">Choose a desk to see its reasoning, standing instructions, confirmation and no-go conditions. Desk names are presentation roles, not independent agents.</p>',
   '<div class="psw-team-layout"><div id="psw-tabs" class="psw-tabs" role="tablist" aria-label="Choose analyst desk"></div><article id="psw-analyst-panel" class="psw-analyst-panel" role="tabpanel" tabindex="0"></article></div></section>',
   '<section class="psw-orders" aria-labelledby="psw-orders-h"><div class="psw-section-heading"><div><p class="psw-eyebrow">04 / CURRENT DESK ORDERS</p><h2 id="psw-orders-h">From research to a decision.</h2></div></div>',
   '<div class="psw-orders-grid"><article><strong>VERIFY</strong><p>Check official data, source date and contradictions before repeating a story.</p></article>',
   '<article><strong>COMPARE</strong><p>Use rates, AI cash conversion, energy and breadth to update the scenario view.</p></article>',
   '<article><strong>WAIT FOR THE GATE</strong><p>Define the entry trigger, invalidation, position size and catalyst before a trade.</p></article>',
   '<article><strong>RECORD</strong><p>Save a reviewed decision only after sources and the strongest countercase are checked.</p></article></div>',
   '<div class="psw-links"><a href="ideas.html">Open opportunity terminal →</a><a href="portfolio.html#watchlist">Open price watch →</a><a href="research.html">Open research archive →</a><a href="#desk-tools">Full radar & scenario matrix ↓</a></div></section>',
   '<p class="psw-footer">Research presentation only · existing decision controls and portfolio permissions unchanged · no automated orders or implied live monitoring.</p>'
  ].join("");
  workspace.prepend(root);
  const tabs=$(root,"#psw-tabs"),panel=$(root,"#psw-analyst-panel");
  let chosen="rates";
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
    top.append(identity,el("span","psw-desk-tag","STANDING RESEARCH MANDATE"));panel.append(top);
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
    const source=el("a",null,"Primary-source starting point ↗");source.href=desk.source;source.target="_blank";source.rel="noopener noreferrer";
    bottom.append(source,el("a",null,"Related research ideas ↗"));bottom.lastChild.href="ideas.html";
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
      panel.append(el("p","psw-desk-empty","No matching owner-tracker research is verified for this desk. Its instructions describe investigation requirements, not a trading signal."));
    }
  }
  function render(){
    const state=getState()||{};
    $(root,"#psw-price-date").textContent=state.marketAsOf?dateText(state.marketAsOf)+" · delayed":"Unavailable or too old";
    $(root,"#psw-decision-date").textContent=state.rows?.[0]?.created_at?dateText(state.rows[0].created_at):"No verified revision";
    $(root,"#psw-research-date").textContent=asOf||"Not dated";
    const host=$(root,"#psw-change-list");host.replaceChildren();
    const changes=readChanges(state);
    if(!changes.length){
      host.append(el("p","psw-empty","No owner-saved decision revisions verified. Research and current price changes must not be presented as reviewed new calls."));
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
