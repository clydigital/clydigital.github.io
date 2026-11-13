import {renderFrameworkAppendix,renderEntryComparison} from "./owner-framework-view.mjs";
import {CONTRACT,validateTicket,compareDecision,latestByCase,lane,caseKey,fingerprint,localDate} from "./owner-decision-core.mjs";
import {decisionReviewStats,portfolioReconciliationStatus} from "./owner-decision-performance.mjs";
import {loadPriceFeed,quotes} from "./owner-portfolio-table.mjs?v=20261112-tech1";
import {sweepSignals} from "./owner-ideas-core.mjs";
import {rankEntryIdeas,entryAlert} from "./owner-entry-plans.mjs";
import {renderOpportunityTerminal,scanMarketOpportunities,scanOscillatorExtremes} from "./owner-opportunity-terminal.mjs?v=20261113-guildlens1";
import {psIcon,iconText,addHeadingIcon} from "./owner-visual-icons.mjs?v=20261113-fg1";
import {recordedHoldings,bondWatch,isBondEtf} from "./owner-market-views.mjs";
import {installRadarWorkspace} from "./owner-radar-workspace.mjs?v=20261114-warroom1";
const $=(root,id)=>root.querySelector("#"+id);
const txt=(tag,value,cls)=>{
 const el=document.createElement(tag);
 if(value!==undefined&&value!==null)el.textContent=String(value);
 if(cls)el.className=cls;
 return el;
};
const safeUrl=x=>{
 try{const u=new URL(x);return u.protocol==="https:"&&!u.username&&!u.password&&u.href.length<2000?u.href:null}catch{return null}
};
const pretty=x=>String(x||"UNKNOWN").replaceAll("_"," ");
function renderEmpty(host,message){
 host.replaceChildren(txt("p",message,"psd-empty"));
}
function stamp(x){if(!x)return "Not dated";const d=new Date(x);return Number.isNaN(d.getTime())?String(x):d.toLocaleString("en-GB",{timeZone:"Asia/Kuala_Lumpur",dateStyle:"medium",timeStyle:"short"})+" MYT"}
function paragraph(host,heading,body){
 if(!body)return;const div=txt("div",null,"psd-detail-row");div.append(txt("span",heading,"psd-detail-label"),txt("p",body));host.append(div);
}
function makeCard(record,history=[]){
 const t=record.ticket,card=txt("article",null,"psd-card");
 const head=txt("div",null,"psd-card-head"),title=txt("div");
 title.append(txt("span",t.subject.instrument_id||t.subject.name,"psd-ticker"),txt("h3",t.subject.name));
 const badge=txt("span",pretty(t.recommendation.action),"psd-badge");
 head.append(title,badge);card.append(head);
 paragraph(card,"Recommendation",t.recommendation.rationale);
 paragraph(card,"Watch for",t.recommendation.condition);
 if(t.review.review_by)card.append(txt("small","Next review · "+t.review.review_by,"psd-review-date"));
 if(t.review.risk_override)card.append(txt("p","Risk override recorded — inspect promptly.","psd-warning"));
 const expand=txt("details");expand.append(txt("summary","Investment case & sources"));
 const detail=txt("div",null,"psd-details");
 paragraph(detail,"Strongest countercase",t.assessment.strongest_counterargument);
 for(const k of ["bear","base","bull"]){
  const s=t.scenarios?.[k];if(!s)continue;
  const d=txt("div",null,"psd-scenario");
  d.append(txt("strong",k.toUpperCase()),txt("p",s.driver),txt("small","Condition: "+s.observable_condition),txt("small","Response: "+s.response));
  detail.append(d);
 }
 const alternatives=t.capital_alternatives||[];
 const comparison=renderEntryComparison(t);
 if(comparison)detail.append(comparison);
 for(const v of alternatives.slice(0,6)){
  const choice=String(v.choice||"").toUpperCase().replace(/[\s-]+/g,"_");
  if(comparison&&["BUY_NOW","BUY","STAGE","STAGE_IN","DCA","WAIT","CASH"].includes(choice))continue;
  paragraph(detail,"Alternative: "+v.choice,v.comparison+(v.data_limit?" · Limit: "+v.data_limit:""));
 }
 if(t.evidence?.unresolved_gaps?.length)paragraph(detail,"Unresolved",t.evidence.unresolved_gaps.join("; "));
 const refs=txt("div",null,"psd-refs");
 for(const v of (t.evidence?.source_refs||[]).slice(0,8)){
  const url=safeUrl(v);if(!url)continue;
  const a=txt("a","Source "+(refs.children.length+1));a.href=url;a.rel="noopener noreferrer";a.target="_blank";refs.append(a);
 }
 if(refs.childElementCount)detail.append(refs);
 const frameworks=renderFrameworkAppendix(t);if(frameworks)detail.append(frameworks);
 paragraph(detail,"Reviewed",stamp(record.created_at));
 if(history.length){
  const hist=txt("details",null,"psd-history");hist.append(txt("summary",history.length+" previous revision(s)"));
  const list=txt("ul");
  for(const row of history.slice(0,12)){
   const li=txt("li",stamp(row.created_at)+" — "+pretty(row.ticket?.recommendation?.action)+" / "+pretty(row.ticket?.recommendation?.decision_state));
   list.append(li);
  }
  hist.append(list);detail.append(hist);
 }
 expand.append(detail);card.append(expand);return card;
}
function historicalRisk(snapshot){
 const names=new Set((snapshot?.holdings||[]).map(h=>String(h?.ticker||"").toUpperCase()));
 const items=[];
 if(names.has("6742UW"))items.push({name:"6742UW warrant",detail:"Recorded in an archived owner snapshot. Current strike, expiry, quantity and value are unverified. Confirm with your broker.",type:"Historical risk check"});
 if(names.has("YTLPOWR"))items.push({name:"YTL Power concentration",detail:"Earlier research raised parent/warrant exposure concerns. Current combined weight is unknown.",type:"Historical risk check"});
 return items;
}
export async function initDecisionDesk(db,main,user){
 if(!user?.id||!main)return;
 const host=document.createElement("section");host.id="ps-decision-desk";host.className="psd-root";
 host.innerHTML=`
 <section class="psd-top" aria-label="Investment brief">
  <div class="psd-hero-copy"><p class="psd-overline">POWER STACK / What to do next</p>
   <h1>Spot the opportunity.<span>Know the risk.</span></h1>
   <p>Market structure, macro research and investment decisions — clear enough to act on, detailed enough to scrutinise. Research only; no automatic trade approval.</p></div>
  <div class="psd-top-actions"><a class="psd-primary-link" href="ideas.html">Explore opportunities</a><a href="portfolio.html#watchlist">Market watch</a><a href="portfolio.html">My portfolio</a></div>
  <div class="psh-orbit-wrap" aria-hidden="true"><div class="psh-orbit"><div class="psh-orbit-core">MARKET<small>RADAR</small></div></div><div class="psh-orbit-tags"><span>EQUITIES</span><span>RATES</span><span>ENERGY</span></div><small class="psh-orbit-caption">Illustrative compass · not a market score</small></div>
 </section>
 <p id="psd-status" role="status" class="psd-status">Reviewing the latest saved decisions…</p>
 <section class="psd-quick-queue" aria-labelledby="psd-queue-title">
  <div class="psd-section-heading"><div><p class="psd-overline">01 / DO FIRST</p><h2 id="psd-queue-title">Action queue</h2></div>
   <span class="psd-queue-disclaimer">Research reviews only · broker cash unverified</span></div>
  <div id="psd-queue-rows" class="psd-queue-rows"></div>
 </section>
 <section class="psd-executive" aria-label="Portfolio briefing">
  <div class="psd-executive-main"><p class="psd-overline">THE CURRENT VIEW</p><h2 id="psd-thesis">Reviewing opportunities</h2>
   <p id="psd-thesis-context">Investment signals require valuation, macro and price confirmation.</p>
   <div class="ps-pulse-graph" hidden><div class="ps-pulse-heading"><strong>Opportunity distribution</strong><span>Company ideas · current evidence</span></div>
    <div id="psd-pulse-bars" class="ps-pulse-bars" role="img" aria-label="Distribution of tracked ideas by investment assessment"></div></div></div>
  <div id="psd-summary-metrics" class="psd-summary-metrics"></div>
 </section>
 <section class="psd-coverage-panel" aria-labelledby="psd-holdings-heading">
  <div class="psd-section-heading"><div><p class="psd-overline">MY PORTFOLIO / RECORDED</p><h2 id="psd-holdings-heading">My holdings</h2>
    <p id="psd-holdings-note" class="psd-coverage-note">Loading historical position records…</p></div>
    <a href="portfolio.html#holdings">View all holdings →</a></div>
  <div class="psd-coverage-scroll"><table class="psd-coverage-table" aria-label="Historically recorded holdings and recent delayed prices">
    <thead><tr><th>Recorded holding</th><th>Units (historic)</th><th>Last close</th><th>1D</th><th>3D</th><th>5D</th></tr></thead>
    <tbody id="psd-holdings-rows"></tbody></table></div>
 </section>
 <section class="psd-coverage-panel psd-bonds-panel" aria-labelledby="psd-bond-heading">
  <div class="psd-section-heading"><div><p class="psd-overline">TREASURIES & FIXED INCOME</p><h2 id="psd-bond-heading">Bond ETF watch <span class="psd-section-pill">TLT priority</span></h2>
    <p class="psd-coverage-note">Bond ideas, not holdings. PEG is not a meaningful ETF valuation measure.</p></div>
    <a href="ideas.html#bonds">Research all bond ETFs →</a></div>
  <div class="psd-coverage-scroll"><table class="psd-coverage-table" aria-label="Tracked bond ETFs with delayed prices and reviewed macro status">
    <thead><tr><th>Bond ETF</th><th>Last close</th><th>1D</th><th>3D</th><th>5D</th><th>Macro view</th></tr></thead>
    <tbody id="psd-bond-rows"></tbody></table></div>
  <div class="psd-coverage-foot"><span id="psd-bond-count">Loading bond watch…</span>
    <a href="portfolio.html#bonds">Compare bond ETFs in Market Watch →</a></div>
 </section>
 <section class="psd-ideas-panel" aria-labelledby="psd-ideas-heading">
  <div class="psd-section-heading"><div><p class="psd-overline">RESEARCH PRIORITIES / SOURCE-DATED CLOSES</p><h2 id="psd-ideas-heading">Ideas & entry levels</h2><p class="psd-coverage-note">Price zones are preliminary alerts, NOT confirmed support or an order. Every entry still needs issuer, macro and broker checks.</p><p id="psd-ideas-asof" class="psd-coverage-note">Checking market feed…</p></div>
   <a href="ideas.html">View all investment ideas →</a></div>
  <div id="psd-ideas-rows" class="psd-ideas-rows"></div>
  <button type="button" id="psd-ideas-expand" class="psd-ideas-expand" hidden>Show all research setups</button>
 </section>
 <div class="psd-grid">
  <section class="psd-lane psd-active"><div class="psd-lane-head"><div><p class="psd-overline">DECISION PRIORITY</p><h2>Recommended next move</h2></div></div><div id="psd-active-rows"></div></section>
  <section class="psd-lane psd-risk"><div class="psd-lane-head"><div><p class="psd-overline">RISK FIRST</p><h2>What needs attention</h2></div></div><div id="psd-risk-rows"></div></section>
  <section class="psd-lane psd-watch"><div class="psd-lane-head"><div><p class="psd-overline">WAIT FOR THE LEVEL</p><h2>Upcoming decision points</h2></div></div><div id="psd-watch-rows"></div></section>
 </div>
 <details class="psd-archive"><summary>Review history, portfolio checks & evidence</summary><p class="psd-archive-links"><a href="archive.html">Past market reports</a> · <a href="research.html">Full research library</a></p>
  <div class="psd-readiness-grid">
   <section class="psd-review-card" aria-labelledby="psd-review-heading"><h2 id="psd-review-heading">Review history</h2>
    <div id="psd-review-metrics" class="psd-review-metrics"></div><p id="psd-review-note" class="psd-review-note"></p></section>
   <section class="psd-review-card" aria-labelledby="psd-reconciliation-heading"><h2 id="psd-reconciliation-heading">Account verification</h2>
    <p id="psd-reconciliation-state" class="psd-reconcile-state">Not verified</p>
    <p id="psd-reconciliation-note" class="psd-review-note"></p><a class="psd-text-link" href="portfolio.html">Open account records</a></section>
  </div>
  <section class="psd-book"><div class="psd-book-head"><h2>Past investment decisions</h2><span id="psd-count"></span></div><div id="psd-book-rows"></div></section>
 </details>
 <section id="psd-import-panel" class="psd-import" hidden>
  <div class="psd-book-head"><div><h2>Save a reviewed recommendation</h2><p>Import a complete, reviewed decision ticket from Power Stack.</p></div><button type="button" id="psd-close-import">Close</button></div>
  <form id="psd-import-form"><label for="psd-ticket-file">Choose a decision ticket (.json)</label><input id="psd-ticket-file" type="file" accept=".json,application/json">
   <label for="psd-ticket-json">Or paste the ticket</label><textarea id="psd-ticket-json" rows="8" spellcheck="false" required placeholder="Paste a reviewed decision ticket"></textarea>
   <button type="submit" id="psd-save">Save reviewed decision</button></form><p id="psd-import-status" role="status"></p>
 </section>
 <footer class="psd-brief-footer"><span>Prices are delayed. A valuation or alignment signal prompts research, not an order.</span>
  <button type="button" id="psd-open-import">Save a decision</button></footer>`;
 main.prepend(host);
 // Move the owner-RLS-protected chart brief into the first decision position.
 // No private technical opinion or account-specific content is compiled into this public module.
 const weekly=main.querySelector("#ps-private-weekly-brief");
 if(weekly)host.querySelector(".psd-top")?.after(weekly);
 // A clear route to tactical shorts, investment cases and portfolio decisions.
 // Cards are conditional research, never owner-saved trade tickets.
 const opportunityHost=txt("div",null,"psd-opportunity-host");
 host.querySelector(".psd-top")?.after(opportunityHost);
 const overviewStrip=txt("section",null,"psh-overview");overviewStrip.id="psh-overview";overviewStrip.setAttribute("aria-label","Source-dated market scanner coverage");opportunityHost.before(overviewStrip);
 // Distinct section iconography (one icon per section, not decorative repeated badges).
 for(const [selector,shape] of [
  ["#psd-queue-title","compass"],["#psd-ideas-heading","target"],
  ["#psd-holdings-heading","wallet"],["#psd-bond-heading","landmark"],
  ["#psd-thesis","chart"],[".psd-active h2","check"],
  [".psd-risk h2","shield"],[".psd-watch h2","clock"]
 ])addHeadingIcon(host,selector,shape);
 for(const [selector,shape] of [
  [".psd-top-actions a:nth-child(1)","target"],
  [".psd-top-actions a:nth-child(2)","chart"],
  [".psd-top-actions a:nth-child(3)","wallet"]
 ]){
  const link=host.querySelector(selector);if(link)link.prepend(psIcon(shape));
 }
 // Prioritise actionable research and portfolio risk. Keep full tables lower.
 const q=host.querySelector(".psd-quick-queue"),ideas=host.querySelector(".psd-ideas-panel"),
  decisions=host.querySelector(".psd-grid"),overview=host.querySelector(".psd-executive"),
  statusLine=host.querySelector(".psd-status");
 statusLine.after(q);q.after(ideas);ideas.after(decisions);decisions.after(overview);
 // The dated creator research is served only after the existing Google owner
 // gate has fetched the RLS-protected index page. It is not public JS data.
 const creatorBrief=main.querySelector("#ps-bluebelly-brief");
 if(creatorBrief){
  const section=document.createElement("details");section.className="psd-creator-details";
  const summary=txt("summary");
  summary.append(psIcon("book"),document.createTextNode("Bluebelly creator outlooks & Treasury research"));
  section.append(summary);
  section.append(creatorBrief);
  host.querySelector(".psd-coverage-panel").before(section);
 }

 const state={rows:[],snapshot:null,snapshotDate:null,totalRows:0,ledgerCount:null,ledgerError:true,
  ideaRows:[],priceMap:new Map(),ideaError:false,marketAsOf:null,showAllIdeas:false,
  pageRows:null,pagesError:true,feedCoverage:null,dataReady:false};
 // Radar is the authenticated first screen; existing owner research is retained
 // below the theme grid and scenario matrix in an expandable detail drawer.
 const radarUI=installRadarWorkspace(main,()=>state);
 function status(s){$(host,"psd-status").textContent=s}
 function renderCoverage(){
  const numeric=(v,d=2)=>Number(v).toLocaleString("en-GB",{maximumFractionDigits:d});
  const percent=v=>typeof v==="number"&&Number.isFinite(v)?(v>0?"+":"")+v.toFixed(2)+"%":"—";
  const change=(tr,v)=>{
   const td=txt("td",percent(v));td.className="psd-delta";
   td.dataset.direction=typeof v!=="number"?"unknown":v>0?"up":v<0?"down":"flat";tr.append(td);
  };
  const positionHost=$(host,"psd-holdings-rows");positionHost.replaceChildren();
  const holdings=recordedHoldings(state.snapshot,state.priceMap);
  $(host,"psd-holdings-note").textContent=holdings.length+" recorded positions · Snapshot "+
    (state.snapshotDate||"unknown")+" · Not broker-confirmed";
  for(const item of holdings){
   const tr=txt("tr"),name=txt("td"),id=txt("strong",item.ticker),sub=txt("small",item.name);
   name.append(id,sub);tr.append(name);
   tr.append(txt("td",item.quantity===null?"—":numeric(item.quantity,8),"psd-number"));
   tr.append(txt("td",item.quote?.close?item.quote.currency+" "+numeric(item.quote.close,3):"—","psd-number"));
   for(const changeValue of [item.quote?.day,item.quote?.threeDay,item.quote?.fiveDay])change(tr,changeValue);
   positionHost.append(tr);
  }
  if(!holdings.length){const tr=txt("tr"),td=txt("td","No recorded holdings available.");td.colSpan=6;tr.append(td);positionHost.append(tr);}
  const bondHost=$(host,"psd-bond-rows");bondHost.replaceChildren();
  const bonds=bondWatch(state.ideaRows,state.priceMap);
  $(host,"psd-bond-count").textContent=state.ideaError?"Bond research unavailable":
    bonds.length+" bond funds tracked · Price feed "+(state.marketAsOf?"updated "+state.marketAsOf.slice(0,10):"unavailable");
  for(const item of bonds.slice(0,8)){
   const tr=txt("tr");if(item.ticker==="TLT")tr.className="psd-bond-priority";
   const td=txt("td"),link=txt("a",item.ticker);link.href="ideas.html#bonds";
   td.append(link,txt("small",item.name));tr.append(td);
   tr.append(txt("td",item.quote?.close?item.quote.currency+" "+numeric(item.quote.close,3):"—","psd-number"));
   for(const v of [item.quote?.day,item.quote?.threeDay,item.quote?.fiveDay])change(tr,v);
   const view=txt("td"),plan=entryAlert({
     ticker:item.ticker,watch_low:item.watchLow,watch_high:item.watchHigh,
     note:item.note,currency:item.currency},item.quote);
   view.append(txt("strong",plan.label,"psd-bond-macro"),
     txt("small",item.macroAsOf?"Macro reviewed "+item.macroAsOf:"Macro date missing"));
   const details=txt("details"),summary=txt("summary","Entry conditions & failure test");
   details.append(summary);
   if(plan.entry)details.append(txt("p","Entry: "+plan.entry));
   if(plan.invalidation)details.append(txt("p","No-go: "+plan.invalidation));
   if(plan.catalyst)details.append(txt("p","Next: "+plan.catalyst));
   if(!plan.entry&&item.note)details.append(txt("p",item.note));
   view.append(details);tr.append(view);bondHost.append(tr);
  }
  if(!bonds.length){const tr=txt("tr"),td=txt("td","No bond funds available in private research.");td.colSpan=6;tr.append(td);bondHost.append(tr);}
 }
 function renderIdeaBrief(){
  renderOpportunityTerminal(opportunityHost,state.priceMap,{mode:"home",ownerResearch:state.ideaRows});
  // Use only the vetted, fresh completed-session feed. Never substitute mockup values.
  const overview=$(host,"psh-overview");overview.replaceChildren();
  const valid=Boolean(state.marketAsOf);
  const observed=valid?[...state.priceMap.values()].filter(q=>q?.technical?.asOf===q?.session).length:0;
  const daily=valid?scanMarketOpportunities(state.priceMap):[];
  const extremes=valid?scanOscillatorExtremes(state.priceMap):[];
  const overviewData=[
   ["coverage","Delayed quotes",valid?state.priceMap.size:"—","Source-qualified · "+(valid?stamp(state.marketAsOf):"Unavailable / stale")],
   ["technicals","Daily technicals",valid?observed:"—","Completed bars · not intraday"],
   ["triggers","Daily price triggers",valid?daily.length:"—","Discovery only · 4H not verified"],
   ["momentum","Oscillator extremes",valid?extremes.length:"—","Stoch RSI context · not entry signals"]
  ];
  for(const [key,label,value,note] of overviewData){
   const tile=txt("div",null,"psh-stat");tile.dataset.key=key;
   tile.append(txt("small",label),txt("strong",value),txt("p",note));overview.append(tile);
  }
  const companyIdeas=state.ideaRows.filter(item=>!isBondEtf(item.ticker));
  const signals=sweepSignals(companyIdeas,state.priceMap);
  const ranked=rankEntryIdeas(companyIdeas,state.priceMap);
  const counts={ALIGNED:0,DIVERGENCE:0,WATCH:0,RECHECK:0};
  for(const v of signals)counts[v.status]=(counts[v.status]||0)+1;
  const statKeys={IN_ALERT:0,WAIT_RETRACE:0,BELOW_ALERT:0,CATALYST_GATE:0,PRICE_UNAVAILABLE:0,PRICE_STALE:0,PRICE_MISMATCH:0};
  for(const i of ranked)statKeys[i.entryAlert.status]++;
  $(host,"psd-ideas-asof").textContent=state.marketAsOf
    ?"Quote feed generated "+stamp(state.marketAsOf)+" · Session dates appear on each idea"
    :"Quote feed unavailable or overdue; do not act on old alerts";
  const title=$(host,"psd-thesis"),context=$(host,"psd-thesis-context");
  title.textContent=state.ideaError?"Research data unavailable":
    ranked.length+" ideas under review; no automatic buy signals";
  context.textContent=state.ideaError?"The private idea feed could not be read.":
    "Check broker exposure first. A price alert becomes a candidate for research only after the thesis, catalyst, valuation and portfolio risk are checked.";
  const bars=$(host,"psd-pulse-bars");
  if(bars){
   bars.replaceChildren();const max=Math.max(1,...Object.values(counts));
   for(const [key,label] of [["ALIGNED","PEG aligned"],["WATCH","PEG watch"],["DIVERGENCE","PEG divergence"],["RECHECK","PEG research due"]]){
    const item=txt("div",null,"ps-pulse-col"),plot=txt("div",null,"ps-pulse-track"),
     bar=txt("span",null,"ps-pulse-fill ps-pulse-"+key.toLowerCase());
    bar.style.height=(counts[key]?Math.max(9,counts[key]/max*100):0)+"%";
    plot.append(bar);item.append(txt("strong",counts[key]),plot,txt("small",label));bars.append(item);
   }
  }
  const metrics=$(host,"psd-summary-metrics");metrics.replaceChildren();
  for(const [value,label,shape] of [
   [statKeys.IN_ALERT,"In price-alert range","target"],
   [statKeys.WAIT_RETRACE,"Waiting for retrace","clock"],
   [statKeys.BELOW_ALERT,"Below zone — recheck","warning"],
   [statKeys.PRICE_UNAVAILABLE+statKeys.PRICE_STALE+statKeys.PRICE_MISMATCH+statKeys.CATALYST_GATE,"Source/catalyst required","book"]
  ]){
   const item=txt("div",null,"psd-summary-metric");
   item.append(psIcon(shape,"psv-stat-icon"),txt("strong",value),txt("span",label));metrics.append(item);
  }
  const fmt=(x)=>Number(x).toLocaleString("en-GB",{maximumFractionDigits:2});
  const board=$(host,"psd-ideas-rows");board.replaceChildren();
  const amount=state.showAllIdeas?ranked.length:Math.min(9,ranked.length);
  let lastPriority="";
  for(const item of ranked.slice(0,amount)){
   const priority=item.entryAlert.priority;
   if(priority!==lastPriority){
    lastPriority=priority;
    const heading=txt("div",null,"psv-radar-divider");
    heading.append(psIcon(priority==="HIGH"?"bolt":priority==="MEDIUM"?"layers":"eye"),
     txt("strong",priority==="HIGH"?"Priority research":priority==="MEDIUM"?"Next candidates":"Longer-term watch"));
    heading.append(txt("span","Entry alerts are conditional · no automatic orders"));
    board.append(heading);
   }
   const p=item.entryAlert,card=txt("article",null,"psd-setup-card");
   const top=txt("div",null,"psd-setup-top"),label=txt("div");
   label.append(txt("strong",item.ticker+" · "+(item.name||"Research idea")));
   label.append(txt("small",p.priority==="UNRANKED"?"Unranked research":p.priority+" PRIORITY · "+(item.idea_type==="TRADE"?"Tactical":"Investment")+" research"));
   const flag=iconText(p.status==="IN_ALERT"?"target":p.status==="BELOW_ALERT"?"warning":
    p.status==="PRICE_UNAVAILABLE"||p.status==="PRICE_STALE"?"refresh":p.status==="PRICE_MISMATCH"?"shield":p.status==="WAIT_RETRACE"?"clock":"calendar",
    p.label,"psd-setup-status psd-setup-"+p.status.toLowerCase());
   top.append(label,flag);card.append(top);
   const quote=txt("p",null,"psd-setup-quote");
   quote.append(txt("strong",p.price!==null?p.currency+" "+fmt(p.price):"Price unavailable"),
     txt("span"," · Session "+(p.session||"unknown")+" · 5D "+(typeof p.fiveDay==="number"?(p.fiveDay>0?"+":"")+p.fiveDay.toFixed(2)+"%":"—")));
   card.append(quote);
   if(p.thesis)card.append(iconText("compass",p.thesis,"psd-setup-thesis psv-icon-copy"));
   const next=txt("div",null,"psd-setup-next");next.append(iconText("target","NEXT ENTRY TEST","psv-setup-heading"),
    txt("p",p.entry||item.note||"Recheck issuer and macro evidence before establishing a trigger."));card.append(next);
   const zone=txt("div",null,"psd-setup-zone");
   zone.append(iconText("eye","PROVISIONAL ALERT","psv-setup-heading"),
    txt("span",p.hasZone?p.currency+" "+fmt(p.low)+"–"+fmt(p.high):"No numeric alert set"));
   card.append(zone);
   const deeper=txt("details",null,"psd-setup-details");
   const deeperLabel=txt("summary");deeperLabel.append(psIcon("shield"),document.createTextNode(" Risks, catalyst & evidence"));
   deeper.append(deeperLabel);
   const content=txt("div",null,"psd-setup-detail");
   if(p.invalidation)content.append(iconText("shield","Invalidation: "+p.invalidation,"psv-detail-line psv-risk"));
   if(p.catalyst)content.append(iconText("calendar","Next catalyst: "+p.catalyst,"psv-detail-line"));
   content.append(txt("p","Basis: "+(p.basis||"Dated source review required. This is research, not a position or an order.")));
   if(item.macro_reason)content.append(txt("p","Context: "+item.macro_reason));
   const link=safeUrl(item.macro_source_url);if(link){const a=txt("a","Research source ↗");a.href=link;a.target="_blank";a.rel="noopener noreferrer";content.append(a)}
   deeper.append(content);card.append(deeper);board.append(card);
  }
  if(!ranked.length)board.append(txt("p",state.ideaError?"Private ideas unavailable.":"No new company ideas recorded.","psd-empty"));
  const expand=$(host,"psd-ideas-expand");expand.hidden=ranked.length<=9;
  expand.textContent=state.showAllIdeas?"Show top 9 ideas":"Show all "+ranked.length+" ideas";
  const queue=$(host,"psd-queue-rows");queue.replaceChildren();
  const tasks=[];
  if(state.ledgerError||state.ledgerCount===0)tasks.push({
    n:"01",name:"Verify broker holdings and buying power",
    detail:"The Oct 23 position snapshot and old mandate do not establish today's cash. Confirm 6742UW and overlapping YTLPOWR exposure before sizing."});
  const positions=new Set((state.snapshot?.holdings||[]).map(x=>String(x.ticker||"").toUpperCase()));
  if(["DAYANG","HIBISCS","XOM"].filter(x=>positions.has(x)).length>=2)
   tasks.push({n:"02",name:"Review energy concentration before adding",
     detail:"Recorded XOM / HIBISCS / DAYANG overlap. Recheck current units, business cash flows, Brent sensitivity and the case for recycling capital."});
  const bond=state.ideaRows.some(x=>x.ticker==="TLT"||x.ticker==="IEF");
  if(bond)tasks.push({n:"03",name:"Wait for the inflation / yield response",
    detail:"Compare US 2Y/10Y/30Y yields and real yields after 10 Nov CPI before preferring TLT over lower-duration IEF/VGIT."});
  const next=ranked.find(x=>x.entryAlert.priority==="HIGH"&&["IN_ALERT","WAIT_RETRACE","CATALYST_GATE","BELOW_ALERT"].includes(x.entryAlert.status));
  if(next)tasks.push({n:String(tasks.length+1).padStart(2,"0"),name:"Prepare "+next.ticker+" conditional entry review",
    detail:(next.entryAlert.entry||next.entryAlert.detail).slice(0,260)});
  for(const task of tasks.slice(0,4)){
    const row=txt("div",null,"psd-queue-item");
    const glyph=task.name.includes("broker")?"wallet":task.name.includes("energy")?"shield":
      task.name.includes("inflation")?"landmark":"target";
    row.append(psIcon(glyph,"psv-queue-icon"),txt("span",task.n,"psd-queue-num"));
    const details=txt("div");details.append(txt("strong",task.name),txt("p",task.detail));row.append(details);queue.append(row);
  }
 }

 function draw(){
  renderCoverage();
  renderIdeaBrief();
  radarUI.render();
  const latest=latestByCase(state.rows),historyByKey=new Map();
  for(const row of state.rows){
   if(!historyByKey.has(row.case_key))historyByKey.set(row.case_key,[]);
   historyByKey.get(row.case_key).push(row);
  }
  host.querySelector(".psd-grid").hidden=latest.length===0;
  const groups={risk:[],decision:[],watch:[]};
  for(const row of latest)groups[lane(row)].push(row);
  const due=(r)=>r.ticket?.review?.review_by||"9999-12-31";
  groups.watch.sort((a,b)=>due(a).localeCompare(due(b)));
  groups.risk.sort((a,b)=>due(a).localeCompare(due(b)));
  for(const key of ["risk","active","watch"]){
   const slot=$(host,"psd-"+key+"-rows");slot.replaceChildren();
   const arr=groups[key==="active"?"decision":key];
   const limit=key==="active"?1:2;
   for(const row of arr.slice(0,limit))slot.append(makeCard(row,(historyByKey.get(row.case_key)||[]).filter(r=>r.entry_id!==row.entry_id)));
   if(!arr.length)renderEmpty(slot,key==="risk"?"No urgent decisions recorded.":key==="active"?"No funded recommendation approved yet.":"No upcoming trade triggers recorded.");
   if(arr.length>limit)slot.append(txt("p",+(arr.length-limit)+" more in decision history","psd-empty"));
  }
  const riskSlot=$(host,"psd-risk-rows");
  for(const item of historicalRisk(state.snapshot)){
   const node=txt("div",null,"psd-historical");
   node.append(txt("strong",item.name),txt("small",item.type+" · Snapshot "+(state.snapshotDate||"date unknown")),txt("p",item.detail));
   riskSlot.append(node);
  }
  const book=$(host,"psd-book-rows");book.replaceChildren();
  for(const row of latest.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))).slice(0,24))
   book.append(makeCard(row,(historyByKey.get(row.case_key)||[]).filter(r=>r.entry_id!==row.entry_id)));
  if(!latest.length)renderEmpty(book,"No reviewed decisions have been saved yet.");
  $(host,"psd-count").textContent=latest.length+" active cases · "+state.rows.length+" revisions";
  const review=decisionReviewStats(state.rows,{totalRows:state.totalRows});
  const met=$(host,"psd-review-metrics");met.replaceChildren();
  for(const [label,value] of [
   ["Reviewed ideas",review.caseCount],
   ["Reviews due",review.overdue],
   ["Waiting for trigger",review.awaiting]
  ]){
   const box=txt("div",null,"psd-review-metric");
   box.append(txt("strong",value),txt("span",label));met.append(box);
  }
  $(host,"psd-review-note").textContent=review.outcomeExplanation+
   (review.historyTruncated?" More history exists than the 200 revisions loaded; audit counts are partial.":"");
  const reconciliation=portfolioReconciliationStatus({
   snapshotAsOf:state.snapshotDate,ledgerCount:state.ledgerCount,ledgerError:state.ledgerError
  });
  $(host,"psd-reconciliation-state").textContent="NOT BROKER VERIFIED"+(
   reconciliation.ledgerEntries===null?" · ledger unavailable":" · "+reconciliation.ledgerEntries+" recorded transaction(s)"
  );
  $(host,"psd-reconciliation-note").textContent="Archived snapshot: "+(reconciliation.archivedAsOf||"unknown")+
   ". "+reconciliation.explanation+" Cash and order sizing remain blocked until verified.";
 }
 async function refresh(){
  const [saved,snapshot,ledger,ideas,feed,pages]=await Promise.all([
   db.from("power_stack_decision_revisions").select("entry_id,case_key,ticket,fingerprint,created_at",{count:"exact"}).order("created_at",{ascending:false}).limit(200),
   db.from("power_stack_owner_snapshots").select("snapshot_as_of,snapshot,legacy_source_retired").eq("owner_user_id",user.id).limit(1).maybeSingle(),
   db.from("power_stack_portfolio_entries").select("entry_id",{count:"exact",head:true}).eq("owner_user_id",user.id),
   db.from("power_stack_idea_tracker").select("ticker,name,idea_type,peg,peg_as_of,peg_basis,peg_source_url,macro_state,macro_as_of,macro_reason,macro_source_url,watch_low,watch_high,currency,note,updated_at")
    .eq("owner_user_id",user.id).order("updated_at",{ascending:false}).limit(100),
   loadPriceFeed(),
   db.from("power_stack_private_pages").select("page_key,updated_at")
    .eq("owner_user_id",user.id).in("page_key",["index","research","sectors","portfolio","decisions"])
  ]);
  if(saved.error)throw Error("Owner decision history unavailable: "+saved.error.message);
  if(snapshot.error||!snapshot.data?.legacy_source_retired)throw Error("Owner portfolio access not verified");
  state.rows=saved.data||[];state.snapshot=snapshot.data.snapshot;state.snapshotDate=snapshot.data.snapshot_as_of;
  state.totalRows=Number.isInteger(saved.count)?saved.count:state.rows.length;
  state.ledgerCount=ledger.error?null:ledger.count;
  state.ledgerError=Boolean(ledger.error);
  state.ideaError=Boolean(ideas.error);state.ideaRows=ideas.error?[]:(ideas.data||[]);
  state.pagesError=Boolean(pages.error);state.pageRows=pages.error?null:(pages.data||[]);
  const generated=Date.parse(feed?.generatedAt||"");
  const freshFeed=Number.isFinite(generated)&&Date.now()>=generated&&Date.now()-generated<=72*3600000;
  state.priceMap=freshFeed?quotes(feed).watch:new Map();
  state.marketAsOf=freshFeed?feed.generatedAt:null;
  state.feedCoverage=freshFeed?feed.coverage:null;
  state.dataReady=true;
  draw();$(host,"psd-status").hidden=true;
 }
 $(host,"psd-ideas-expand").addEventListener("click",()=>{state.showAllIdeas=!state.showAllIdeas;renderIdeaBrief();});
 $(host,"psd-open-import").addEventListener("click",()=>{$(host,"psd-import-panel").hidden=false;$(host,"psd-ticket-json").focus()});
 $(host,"psd-close-import").addEventListener("click",()=>{$(host,"psd-import-panel").hidden=true});
 $(host,"psd-ticket-file").addEventListener("change",async()=>{
  const pick=$(host,"psd-ticket-file"),file=pick.files?.[0],note=$(host,"psd-import-status");
  if(!file)return;
  try{
   if(file.size>60000)throw Error("Ticket exceeds 60 KB limit");
   if(!/\.json$/i.test(file.name))throw Error("Only .json decision tickets are accepted");
   const source=await file.text();
   const payload=JSON.parse(source),errors=validateTicket(payload);
   if(errors.length)throw Error("Ticket invalid: "+errors.join(", "));
   $(host,"psd-ticket-json").value=JSON.stringify(payload,null,2);
   note.textContent="File validated. Review the decision, then select Validate and save private revision.";
  }catch(e){note.textContent="File not loaded: "+String(e.message||e).slice(0,300)}
  finally{pick.value="";}
 });
 $(host,"psd-import-form").addEventListener("submit",async e=>{
  e.preventDefault();const button=$(host,"psd-save"),note=$(host,"psd-import-status");button.disabled=true;note.textContent="Validating…";
  try{
   const input=$(host,"psd-ticket-json").value;if(input.length>60000)throw Error("Ticket too large");
   const ticket=JSON.parse(input),errors=validateTicket(ticket);
   if(errors.length)throw Error("Decision contract invalid: "+errors.join(", "));
   const key=caseKey(ticket);
   if(Date.parse(ticket.as_of)>Date.now()+5*60000)throw Error("Ticket is dated in the future");
   if(ticket.review.review_by&&ticket.recommendation.action==="NO_ACTION"&&ticket.review.review_by<localDate())
    throw Error("Expired NO_ACTION needs a new review, not a new saved HOLD");
   const previous=latestByCase(state.rows).find(x=>x.case_key===key);
   const cmp=compareDecision(previous,ticket);
   if(!cmp.shouldSave)throw Error(cmp.reason+". No duplicate revision saved ("+cmp.status+").");
   const hash=await fingerprint(ticket);
   const {data,error}=await db.from("power_stack_decision_revisions")
    .insert({case_key:key,fingerprint:hash,ticket,previous_entry_id:previous?.entry_id||null})
    .select("entry_id").single();
   if(error)throw Error("Private save rejected: "+error.message);
   if(!data?.entry_id)throw Error("Save could not be verified");
   await refresh();$(host,"psd-ticket-json").value="";
   note.textContent="Saved verified private revision. No broker order or public publication occurred.";
  }catch(err){note.textContent=String(err?.message||err).slice(0,400)}
  finally{button.disabled=false}
 });
 try{await refresh()}catch(err){
  renderEmpty($(host,"psd-risk-rows"),"Owner data access unavailable");
  renderEmpty($(host,"psd-active-rows"),"No fallback to historical data as current recommendation");
  renderEmpty($(host,"psd-watch-rows"),"Triggers cannot be evaluated without private access");
  renderEmpty($(host,"psd-book-rows"),"Decision history unavailable");
  status(String(err.message||err).slice(0,250));
  $(host,"psd-open-import").disabled=true;
  radarUI.render();
 }
}
