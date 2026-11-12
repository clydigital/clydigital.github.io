// Source-dated illustrative opportunity paths, not owner-saved decisions or execution signals.
// Public script contains no account data; authenticated pages render it only after owner access.
// Candidacy never means a verified EMA trigger, approved short locate or funded broker order.
export const OPPORTUNITY_CONTRACT="power-stack-guided-opportunities/1";
export const OPPORTUNITY_REVIEW_DATE="2026-11-12";
export const OPPORTUNITIES=Object.freeze([
 {id:"crwv-short",ticker:"CRWV",name:"CoreWeave",kind:"TRADE",direction:"SHORT",
  horizon:"2–4 weeks",reviewed:"2026-11-12",
  thesis:"Large AI demand does not yet prove that financing and cash collection are self-sustaining.",
  trigger:"Wait for a daily loss of the 20 EMA (1SD) band, followed by a failed 4H retest. Recheck cash receipts and credit conditions before considering a short.",
  invalidation:"Do not pursue if price reclaims and holds its daily trend band, or audited customer cash receipts materially improve.",
  risk:"Borrow availability, hard-to-borrow fees, earnings gaps and violent squeezes. A naked short has unbounded theoretical loss.",
  catalyst:"Next independently reported cash-flow, prepayment and interest-expense evidence.",
  source:"https://www.sec.gov/Archives/edgar/data/1769628/000176962826000461/coreweave3q26earningspress.htm"},
 {id:"smh-short",ticker:"SMH",name:"Semiconductor ETF",kind:"TRADE",direction:"SHORT",
  horizon:"3–15 sessions",reviewed:"2026-11-12",
  thesis:"A concentrated semiconductor rebound can fail even when headline indices stay firm; the 11 Nov bounce itself is a counterargument to immediate bearishness.",
  trigger:"Only reconsider after the 4H 20/50 EMA support bands fail and a retest is rejected; check SOXX, RSP breadth and Treasury yields on matched sessions.",
  invalidation:"A daily reclaim with sustained semi and equal-weight breadth confirmation invalidates the bearish setup.",
  risk:"Strong AI earnings or a squeeze can reverse a short abruptly; a single overbought oscillator is insufficient.",
  catalyst:"Follow-through after the 11 Nov recovery and upcoming semiconductor earnings.",
  source:"https://apnews.com/article/027cd5f4583d1a11c1795150bf065afb"},
 {id:"tlt-short",ticker:"TLT",name:"20+ Year Treasury ETF",kind:"TRADE",direction:"SHORT",
  horizon:"1–3 weeks",reviewed:"2026-11-12",
  thesis:"Hotter-than-expected CPI leaves a tactical bear case for long-duration bonds if actual long yields continue rising.",
  trigger:"Wait for a fresh open-session 20Y/30Y Treasury yield increase and a TLT daily lower-band break with failed 4H retest. Do not infer this from the 11 Nov cash-bond holiday.",
  invalidation:"Sustained lower real and nominal long yields, or a TLT daily band reclaim, defeats the short-duration thesis.",
  risk:"Flight-to-quality can squeeze bond shorts. Borrow, carry and distributions alter ETF short economics.",
  catalyst:"Next matched Treasury cash-session closes, real yields and credit spread readings.",
  source:"https://home.treasury.gov/resource-center/data-chart-center/interest-rates"},
 {id:"cf-long",ticker:"CF",name:"CF Industries",kind:"INVESTMENT",direction:"LONG",
  horizon:"6–18 months",reviewed:"2026-11-12",
  thesis:"Fertiliser cash generation offers an alternative to an AI-led portfolio, but trailing cash yields require cycle normalisation.",
  trigger:"Recheck normalised free cash flow, North American gas costs and nitrogen prices. Identify a valuation margin of safety and a confirmed daily/weekly support retest.",
  invalidation:"Lower nitrogen spreads, sustained gas input pressure or weaker adjusted free cash flow weaken the valuation case.",
  risk:"A cyclical stock is not automatically cheap because a backward-looking yield looks high.",
  catalyst:"Next issuer results, nitrogen pricing and gas spreads.",
  source:"https://www.cfindustries.com/newsroom/2026/cf-9m-2026-earnings"},
 {id:"tlt-long",ticker:"TLT",name:"20+ Year Treasury ETF",kind:"INVESTMENT",direction:"LONG",
  horizon:"3–12 months",reviewed:"2026-11-12",
  thesis:"Long duration offers upside if inflation and long real yields genuinely decline; it is not an automatic buy after one hot CPI surprise.",
  trigger:"Require sustained lower matched cash Treasury long yields and TLT's daily trend-band recovery; compare intermediate alternatives IEF and VGIT before sizing.",
  invalidation:"Further long-yield increases, sticky inflation or a renewed daily price-band failure invalidate the entry.",
  risk:"High duration creates outsized capital losses when long yields rise, even with a sizeable distribution yield.",
  catalyst:"Fresh CPI and long-real-yield observations, plus the next Treasury cash sessions.",
  source:"https://www.ishares.com/us/products/239454/ishares-20-year-treasury-bond-etf"},
 {id:"googl-long",ticker:"GOOGL",name:"Alphabet",kind:"INVESTMENT",direction:"LONG",
  horizon:"6–24 months",reviewed:"2026-11-12",
  thesis:"Search and Cloud economics support long-run growth, but AI capex consumes cash and the share price must justify expected earnings.",
  trigger:"Compare refreshed forward estimates with cash capex and operating cash flow. Wait for an attractive valuation and confirmed higher-timeframe support.",
  invalidation:"Weakening Cloud margins, sustained lower FCF conversion, or materially adverse estimate revisions challenge the thesis.",
  risk:"A strong business can still be an expensive investment when capital spending and expectations are high.",
  catalyst:"Next issuer earnings, capex guidance, FCF and EPS estimate revisions.",
  source:"https://www.sec.gov/Archives/edgar/data/1652044/000165204426000080/googexhibit991q32026.htm"}
]);
const make=(tag,cls,value)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(value!==undefined)node.textContent=value;return node;};
function validDate(d){return /^20\d{2}-\d{2}-\d{2}$/.test(String(d||""))?Date.parse(d+"T00:00:00Z"):NaN;}
export function opportunityState(item,quote,now=new Date(),research=null){
 const asOf=validDate(item.reviewed),day=86400000;
 const age=Date.parse(now.toISOString().slice(0,10)+"T00:00:00Z")-asOf;
 const maxDays=item.kind==="TRADE"?7:45;
 const current=Number.isFinite(age)&&age>=0&&age<=maxDays*day;
 const quoteDate=validDate(quote?.session);
 const quoteAge=Date.parse(now.toISOString().slice(0,10)+"T00:00:00Z")-quoteDate;
 const priceValid=current&&Number.isFinite(quoteAge)&&quoteAge>=0&&quoteAge<=7*day&&
   typeof quote?.close==="number"&&Number.isFinite(quote.close)&&quote.close>0;
 const technical=priceValid&&quote?.technical?.asOf===quote.session?quote.technical:null;
 const signal=technical?directionalDailySignal(item.direction,technical):null;
 const researchAsOf=research?.macro_as_of;
 const researchAge=Date.parse(now.toISOString().slice(0,10)+"T00:00:00Z")-validDate(researchAsOf);
 const researchFresh=Number.isFinite(researchAge)&&researchAge>=0&&researchAge<=14*day&&
  ["SUPPORTIVE","MIXED","ADVERSE"].includes(research?.macro_state)&&
  typeof research?.macro_source_url==="string"&&/^https:\/\//.test(research.macro_source_url);
 return {status:!current?"REVIEW EXPIRED":!priceValid?"VERIFY MARKET DATA":
   signal?.grade==="DAILY_TRIGGER"?"DAILY WATCH — CHECK 4H":
   signal?.grade==="AGAINST"?"COUNTER-SIGNAL — WAIT":
   signal?.grade==="EXTENDED"?"EXTENDED — WAIT FOR RETEST":"WAIT FOR CONFIRMATION",
   current,price:priceValid?quote.close:null,
   currency:priceValid?String(quote.currency||"USD"):"",
   session:priceValid?quote.session:null,
   technical,signal,researchFresh,
   researchAsOf:researchFresh?researchAsOf:null,
   researchState:researchFresh?research.macro_state:null,
   researchReason:researchFresh?String(research.macro_reason||"").slice(0,220):null};
}
/**
 * Daily scans are research discovery only. A 4H retest and trade-specific
 * fundamentals/borrow (for shorts) remain unverified; no "READY" state.
 */
export function directionalDailySignal(direction,t){
 if(!t||!["LONG","SHORT"].includes(direction))return null;
 const long=direction==="LONG";
 const triggers=long?new Set(["RECOVERED_LOWER_BAND","BROKE_UPPER_BAND"]):
  new Set(["REJECTED_UPPER_BAND","BROKE_LOWER_BAND"]);
 const donchian=long?"CLOSE_ABOVE_PRIOR_20_HIGH":"CLOSE_BELOW_PRIOR_20_LOW";
 if(triggers.has(t.band20Event))return {grade:"DAILY_TRIGGER",label:t.band20Event.replaceAll("_"," ").toLowerCase(),
  observation:"20 EMA ± 1SD daily band"};
 if(t.donchian20===donchian)return {grade:"DAILY_TRIGGER",
  label:long?"Closed above prior 20-session high":"Closed below prior 20-session low",
  observation:"Donchian 20, daily close"};
 const against=long?new Set(["REJECTED_UPPER_BAND","BROKE_LOWER_BAND"]):
  new Set(["RECOVERED_LOWER_BAND","BROKE_UPPER_BAND"]);
 const contraDonchian=long?"CLOSE_BELOW_PRIOR_20_LOW":"CLOSE_ABOVE_PRIOR_20_HIGH";
 if(against.has(t.band20Event)||t.donchian20===contraDonchian)
  return {grade:"AGAINST",label:long?"Bearish daily price move opposes long entry":"Bullish daily price move opposes short entry",
   observation:"Daily counter-signal; confirm before any opposite-side setup"};
 if(long&&t.ema20State==="ABOVE_UPPER")
  return {grade:"EXTENDED",label:"Above upper EMA20 band — wait for a retest",
   observation:"Overextension is not a trend reversal"};
 if(t.stochRsiZone===(long?"OVERBOUGHT":"OVERSOLD"))
  return {grade:"CAUTION",label:"Stoch RSI "+t.stochRsiZone.toLowerCase()+" — unfavorable for chasing",
   observation:"Oscillator only; not a price entry"};
 if(t.stochRsiZone===(long?"OVERSOLD":"OVERBOUGHT"))
  return {grade:"OSCILLATOR_ONLY",label:"Stoch RSI "+t.stochRsiZone.toLowerCase(),
   observation:"Oscillator extreme; NOT a reversal trigger"};
 return {grade:"MONITOR",label:"Daily trigger not met",observation:"EMA, Donchian & Stoch RSI"};
}
export function scanMarketOpportunities(prices,now=new Date()){
 const found=[];
 if(!(prices instanceof Map))return found;
 for(const [ticker,quote] of prices){
  // Crypto UTC samples and derivative proxies are not the same daily OHLC basis.
  if(ticker==="BTC"||!quote?.technical||quote.technical.asOf!==quote.session)continue;
  if(!Number.isFinite(validDate(quote.session))||!quote.close||!Number.isFinite(quote.close))continue;
  const today=Date.parse(now.toISOString().slice(0,10)+"T00:00:00Z"),age=today-validDate(quote.session);
  if(age<0||age>7*86400000)continue;
  const t=quote.technical;
  const bull=directionalDailySignal("LONG",t),bear=directionalDailySignal("SHORT",t);
  // Oscillator extremes alone must never promote a directional candidate.
  const pick=bull?.grade==="DAILY_TRIGGER"?{direction:"LONG",signal:bull,grade:0}:
    bear?.grade==="DAILY_TRIGGER"?{direction:"SHORT",signal:bear,grade:0}:null;
  if(!pick)continue;
  found.push({ticker,direction:pick.direction,signal:pick.signal,grade:pick.grade,
   session:quote.session,close:quote.close,currency:quote.currency||"USD",technical:t});
 }
 return found.sort((a,b)=>a.grade-b.grade||b.session.localeCompare(a.session)||a.ticker.localeCompare(b.ticker));
}
export function scanOscillatorExtremes(prices,now=new Date()){
 if(!(prices instanceof Map))return [];
 const rows=[];
 for(const [ticker,q] of prices){
  const date=validDate(q?.session),age=Date.parse(now.toISOString().slice(0,10)+"T00:00:00Z")-date;
  const t=q?.technical;
  if(ticker==="BTC"||!t||t.asOf!==q.session||!Number.isFinite(age)||age<0||age>7*86400000)continue;
  if(!["OVERBOUGHT","OVERSOLD"].includes(t.stochRsiZone)||typeof t.stochRsi14!=="number")continue;
  rows.push({ticker,zone:t.stochRsiZone,k:t.stochRsi14,asOf:q.session});
 }
 return rows.sort((a,b)=>a.zone.localeCompare(b.zone)||a.k-b.k||a.ticker.localeCompare(b.ticker));
}
export function visibleOpportunities(mode="ALL"){
 return OPPORTUNITIES.filter(x=>mode==="ALL"||
  mode==="SHORT"&&x.kind==="TRADE"&&x.direction==="SHORT"||
  mode==="TRADE"&&x.kind==="TRADE"||
  mode==="INVESTMENT"&&x.kind==="INVESTMENT");
}
function card(item,prices,ownerResearch=[]){
 const research=ownerResearch.find(x=>x?.ticker===item.ticker)||null;
 const state=opportunityState(item,prices?.get(item.ticker),new Date(),research),node=make("article","pso-card");
 const head=make("div","pso-card-head");
 const intro=make("div");intro.append(make("strong","pso-ticker",item.ticker),make("span","pso-company",item.name));
 const direction=make("span","pso-direction pso-"+item.direction.toLowerCase(),item.direction==="SHORT"?"SHORT WATCH":"LONG WATCH");
 head.append(intro,direction);node.append(head);
 const meta=make("div","pso-meta");
 meta.append(make("span",null,item.kind==="TRADE"?"Tactical trade":"Investment"),make("span",null,item.horizon),make("span",null,item.reviewed+" review"));
 node.append(meta);
 const thesis=make("p","pso-thesis",item.thesis);node.append(thesis);
 const status=make("div","pso-condition");
 status.append(make("strong",null,state.status),make("span",null,state.price!==null?
  "Last eligible delayed close: "+state.currency+" "+state.price.toLocaleString("en-GB",{maximumFractionDigits:3})+" · "+state.session:
  "No eligible current price/confirmation; verify the market feed and chart"));
 node.append(status);
 const evidence=make("div","pso-research-status");
 evidence.append(make("strong",null,state.technical?"Daily scanner · "+state.technical.asOf:
   "Daily scanner · awaiting qualified OHLC"));
 if(state.technical){
  const parts=[
    "EMA20: "+state.technical.ema20State.replaceAll("_"," ").toLowerCase(),
    "Donchian: "+state.technical.donchian20.replaceAll("_"," ").toLowerCase(),
    "Stoch RSI: "+(state.technical.stochRsi14===null?"N/A":state.technical.stochRsi14)
  ];
  evidence.append(make("p",null,parts.join(" · ")));
  evidence.append(make("p",null,state.signal?.grade==="DAILY_TRIGGER"?
   "Daily observation: "+state.signal.label+". Entry still requires 4H, source and risk checks.":
   (state.signal?.grade==="AGAINST"?"Counter-signal: ":"Daily entry not confirmed: ")+(state.signal?.label||"")));
 }
 evidence.append(make("p",null,state.researchFresh?
   "Saved macro research · "+state.researchState+" · "+state.researchAsOf+". "+state.researchReason:
   "Bluebelly macro / fundamental admission not verified for this setup; check current evidence."));
 node.append(evidence);
 const steps=make("div","pso-steps");
 for(const [label,value] of [["Entry test",item.trigger],["No-go / cover",item.invalidation]]){
  const box=make("div","pso-step");box.append(make("strong",null,label),make("p",null,value));steps.append(box);
 }
 node.append(steps);
 const detail=make("details","pso-details"),summary=make("summary",null,"Risk, catalyst & original source");
 detail.append(summary,make("p",null,"Risk: "+item.risk),make("p",null,"Next: "+item.catalyst));
 const a=make("a",null,"Original evidence");a.href=item.source;a.target="_blank";a.rel="noopener noreferrer";
 detail.append(a);node.append(detail);return node;
}
export function renderOpportunityTerminal(target,prices=new Map(),options={}){
 if(!target)return;
 const home=options.mode==="home",initial=home?"ALL":
   location.hash==="#shorts"?"SHORT":location.hash==="#trades"?"TRADE":
   location.hash==="#investments"?"INVESTMENT":"ALL";
 let chosen=initial;
 const shell=make("section","pso-shell");
 shell.id="ps-opportunities";shell.setAttribute("aria-label","Guided trade and investment ideas");
 const eyebrow=make("p","pso-overline","OPPORTUNITY TERMINAL · RESEARCH ONLY");
 const h=make("h2",null,home?"Find your next opportunity":"Find a trade or investment");
 const lead=make("p","pso-lead","Choose a horizon first. A good thesis is not a valid entry until its chart, source, risk and catalyst checks pass.");
 shell.append(eyebrow,h,lead);
 const guide=make("div","pso-paths");
 for(const x of [
  {title:"01 · Tactical trades",desc:"Long or short · days to weeks",url:home?"ideas.html#trades":null,filter:"TRADE"},
  {title:"02 · Investments",desc:"Value, growth and duration · months+",url:home?"ideas.html#investments":null,filter:"INVESTMENT"},
  {title:"03 · My portfolio",desc:"Hold / add / trim / exit · account check",url:"portfolio.html",filter:null}
 ]){
  const node=x.url?make("a","pso-path"):make("button","pso-path");if(x.url)node.href=x.url;
  else{node.type="button";node.addEventListener("click",()=>select(x.filter));}
  node.append(make("strong",null,x.title),make("span",null,x.desc));guide.append(node);
 }
 shell.append(guide);
 const head=make("div","pso-head");head.append(make("h3",null,home?"Ideas to investigate":"Research candidates"));
 const about=make("span",null,"Theses reviewed "+OPPORTUNITY_REVIEW_DATE+" · Latest qualified daily bars only");head.append(about);shell.append(head);
 const filters=make("div","pso-filters");filters.setAttribute("role","group");filters.setAttribute("aria-label","Opportunity type");
 if(!home)for(const [id,label] of [["ALL","All"],["TRADE","Tactical trades"],["SHORT","Short-side"],["INVESTMENT","Investments"]]){
  const b=make("button","pso-filter",label);b.type="button";b.dataset.filter=id;
  b.addEventListener("click",()=>select(id));filters.append(b);
 }
 if(!home)shell.append(filters);
 const cards=make("div","pso-cards");shell.append(cards);
 const footer=make("p","pso-footer","Every setup is WAIT / RECHECK until a fresh chart, invalidation, source and (for shorts) borrow/locate are verified. No trade tickets or broker orders are created.");
 shell.append(footer);
 if(home){const link=make("a","pso-open","See all short and long research candidates");link.href="ideas.html#shorts";shell.append(link);}
 function select(id){
  chosen=id||"ALL";
  for(const button of filters.querySelectorAll("button"))button.setAttribute("aria-pressed",String(button.dataset.filter===chosen));
  cards.replaceChildren();
  const selected=home?OPPORTUNITIES.filter(x=>["crwv-short","smh-short","cf-long"].includes(x.id)):visibleOpportunities(chosen);
  for(const item of selected)cards.append(card(item,prices,options.ownerResearch||[]));
 }
 const radar=make("section","pso-radar");
 radar.append(make("h3",null,"Market discovery · completed daily bars"));
 const radarNote=make("p","pso-radar-note","Candidate discovery, not a trade recommendation. A single daily trigger does not verify a 4H retest, the Bluebelly regime, borrow or valuation.");
 radar.append(radarNote);
 radar.append(make("p","pso-radar-note","Stochastic RSI extremes are shown separately as momentum context, never as directional trading candidates."));
 const scan=make("div","pso-radar-list");
 radar.append(scan);
 const oscillators=make("section","pso-oscillator-panel");
 oscillators.append(make("h3",null,"Stochastic RSI extremes · not trade triggers"));
 const oscillatorRows=make("div","pso-radar-list");
 oscillators.append(oscillatorRows);
 radar.append(oscillators);
 const macroLink=make("a","pso-macro-link","Cross-check the latest Bluebelly market context");
 macroLink.href="https://bluebelly-desk.vercel.app/markets";
 macroLink.target="_blank";macroLink.rel="noopener noreferrer";radar.append(macroLink);
 shell.append(radar);
 function renderScan(){
  scan.replaceChildren();
  const market=scanMarketOpportunities(prices);
  if(!market.length)scan.append(make("p","pso-radar-empty",
   "No source-qualified daily price triggers. The completed-session feed may still contain oscillator extremes."));
  for(const item of market.slice(0,8)){
   const line=make("div","pso-radar-item");
   line.append(make("strong",null,item.ticker+" · "+item.direction+" watch"));
   line.append(make("span",null,item.signal.label+" · "+item.session+
    " · "+item.currency+" "+item.close.toLocaleString("en-GB",{maximumFractionDigits:3})));
   scan.append(line);
  }
  oscillatorRows.replaceChildren();
  const extremes=scanOscillatorExtremes(prices).slice(0,8);
  if(!extremes.length)oscillatorRows.append(make("p","pso-radar-empty","No current source-qualified oscillator extremes."));
  for(const item of extremes){
   const line=make("div","pso-radar-item");
   line.append(make("strong",null,item.ticker+" · "+item.zone.toLowerCase()));
   line.append(make("span",null,"Stoch RSI "+item.k+" · "+item.asOf+" · Context only; verify direction and risk"));
   oscillatorRows.append(line);
  }
 }
 select(chosen);renderScan();target.replaceChildren(shell);
}
