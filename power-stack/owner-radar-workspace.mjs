/* Power Stack / Radar-first workspace v3.
   Authenticated-only DOM insertion. Research judgments never derive from oscillators.
   Bluebelly scenarios are dated conditional editorial hypotheses, not live forecasts.
*/
import {psIcon} from "./owner-visual-icons.mjs";
import {loadBluebellyStockCoverage} from "./owner-bluebelly-stocks.mjs";
export const RADAR_CONTRACT="power-stack-radar-workspace/1";
export const RESEARCH_ASOF="2026-11-11";
export const MARKET_THEMES=Object.freeze([
 {id:"ai",name:"AI & Semiconductors",symbol:"◈",description:"AI demand, chips, models and financing",tickers:["NVDA","AMD","AVGO","TSM","MU","INTC","SMH","SOXX","CRWV","CRDO","SNDK","AEM","DELL","FLEX","META","MSFT","GOOGL","AMZN","CRM","ADBE","CRWD","PLTR","JBL","IGV","VGT","XLK","VYX"]},
 {id:"equities",name:"Equity Breadth",symbol:"▥",description:"Major indexes, sectors and market participation",tickers:["SPY","QQQ","RSP","DIA","IWM","ARKK","XLF","XLI","XLB","XLC","XLP","XLRE","XLU","XLV","XLY","XBI","CI","CVS","TTWO"]},
 {id:"europe",name:"Europe Stocks",symbol:"✦",description:"Local EUR/DKK listed shares · Xetra, Paris, Amsterdam, Copenhagen",tickers:["ASML.AS","ADYEN.AS","SAP.DE","SIE.DE","RHM.DE","IFX.DE","AIR.PA","TTE.PA","MC.PA","SU.PA","OR.PA","NOVO-B.CO"]},
 {id:"energy",name:"Oil & Gas",symbol:"≈",description:"Crude, energy producers and supply risk",tickers:["XOM","CVX","BKR","SLB","LNG","DAYANG","HIBISCS","XLE"]},
 {id:"shipping",name:"Refining & Shipping",symbol:"≋",description:"Fuel bottlenecks, tanker flows and margins",tickers:["MPC","PSX","VLO","STNG","MISC"]},
 {id:"bonds",name:"Rates & Credit",symbol:"≡",description:"Treasuries, duration and financing",tickers:["TLT","EDV","ZROZ","IEF","VGIT","SGOV","HYG","LQD"]},
 {id:"metals",name:"Gold & Real Assets",symbol:"◇",description:"Gold, miners and industrial metals",tickers:["GLD","GLDM","GDX","WPM","FCX"]},
 {id:"power",name:"Power & Nuclear",symbol:"✧",description:"Electricity, grid supply and nuclear investment",tickers:["BWXT","CCJ","CEG","LEU","SMR","PWR","ETN","NVT","GEV","VST","TENAGA","YTLPOWR","1164.HK","1816.HK"]},
 {id:"china",name:"China & Asia Tech",symbol:"▣",description:"China compute, manufacturing and Hong Kong",tickers:["688825","9988.HK","3191.HK","3308.HK","6809.HK"]},
 {id:"agri",name:"Fertilisers & Agriculture",symbol:"✳",description:"Nutrients, food supply and natural resources",tickers:["CF","NTR","CTVA","BG","VMI"]},
 {id:"consumer",name:"Consumer & Industrials",symbol:"▤",description:"Consumer demand, mobility and industrials",tickers:["GRAB","TSLA","SPCX","AAPL","SYM","MNHLDG","FCFS","6742UW"]},
 {id:"crypto",name:"Crypto & High Beta",symbol:"◎",description:"Digital assets and high-beta exposures",tickers:["BTC","COIN","MSTR"]}
]);
export const THEME_ICON_NAMES=Object.freeze({
 ai:"cpu",equities:"bars",europe:"globe",energy:"fuel",shipping:"ship",
 bonds:"landmark",metals:"gem",power:"orbit",china:"building",agri:"sprout",
 consumer:"truck",crypto:"coins",
});
export const SCENARIOS=Object.freeze([
 {id:"oil-escalation",name:"Hormuz disruption worsens",family:"oil",kind:"Supply shock",
  premise:"Physical traffic disruption and insured-delivery costs worsen; crude and product pressure persist.",
  test:"Verify UKMTO incidents, complete vessel transits, Brent, distillate cracks, inventories and insurance.",
  falsifier:"Sustained safe commercial transit and narrowing delivered-product premiums.",
  source:"https://bluebelly-desk.vercel.app/hormuz",
  impact:{ai:"down",equities:"down",energy:"up",shipping:"mixed",bonds:"mixed",metals:"mixed",power:"mixed",china:"down",agri:"mixed",consumer:"down",crypto:"down",europe:"unknown"}},
 {id:"oil-reopening",name:"Hormuz routes normalise",family:"oil",kind:"Supply relief",
  premise:"Sustained safe shipping and fuel availability improve; war premia and freight costs ease.",
  test:"Require repeated complete vessel transits, fewer incidents, insured access and product restocking.",
  falsifier:"Renewed strikes, missing traffic evidence or persistent diesel/LNG tightness.",
  source:"https://bluebelly-desk.vercel.app/hormuz",
  impact:{ai:"up",equities:"up",energy:"down",shipping:"mixed",bonds:"mixed",metals:"mixed",power:"up",china:"up",agri:"mixed",consumer:"up",crypto:"mixed",europe:"unknown"}},
 {id:"fuel-scarcity",name:"Diesel stays tight, crude eases",family:"fuels",kind:"Product divergence",
  premise:"Crude falls while diesel/refining availability remains constrained.",
  test:"Compare matched diesel cracks, refinery utilisation, distillate inventories and freight rates.",
  falsifier:"Product stocks rebuild and crack spreads narrow alongside crude.",
  source:"https://bluebelly-desk.vercel.app/hormuz",
  impact:{ai:"mixed",equities:"down",energy:"mixed",shipping:"mixed",bonds:"mixed",metals:"mixed",power:"mixed",china:"mixed",agri:"down",consumer:"down",crypto:"mixed",europe:"unknown"}},
 {id:"hot-inflation",name:"Hot CPI / Treasury yields rise",family:"rates",kind:"Rate shock",
  premise:"Persistent inflation pushes real yields and expected funding costs higher.",
  test:"Confirm in BLS releases, matched 2Y/10Y/30Y nominal and real yields and credit spreads.",
  falsifier:"Cooling core inflation and lower real yields persist across matched sessions.",
  source:"https://bluebelly-desk.vercel.app/regime-watch",
  impact:{ai:"down",equities:"down",energy:"mixed",shipping:"mixed",bonds:"down",metals:"mixed",power:"mixed",china:"down",agri:"mixed",consumer:"down",crypto:"down",europe:"unknown"}},
 {id:"rates-relief",name:"Inflation eases / yields decline",family:"rates",kind:"Funding relief",
  premise:"Inflation moderates without an earnings collapse and real yields retreat.",
  test:"Confirm CPI/PCE composition, TIPS yields, Fed path, credit and issuer revisions.",
  falsifier:"Renewed energy inflation or higher long real yields undermines relief.",
  source:"https://bluebelly-desk.vercel.app/regime-watch",
  impact:{ai:"up",equities:"up",energy:"mixed",shipping:"mixed",bonds:"up",metals:"mixed",power:"up",china:"up",agri:"mixed",consumer:"up",crypto:"up",europe:"unknown"}},
 {id:"equity-stress",name:"Equities fall / credit tightens",family:"equities",kind:"Risk-off",
  premise:"Index selling broadens beyond megacaps and credit-market financing conditions deteriorate.",
  test:"Compare SPY/RSP breadth, HY and IG spreads, issuance, earnings revisions and bank provisions.",
  falsifier:"Breadth recovers, refinancing remains accessible and credit spreads stabilise.",
  source:"https://bluebelly-desk.vercel.app/crash-opportunity",
  impact:{ai:"down",equities:"down",energy:"down",shipping:"down",bonds:"mixed",metals:"mixed",power:"mixed",china:"down",agri:"down",consumer:"down",crypto:"down",europe:"unknown"}},
 {id:"equity-recovery",name:"Broader equity recovery",family:"equities",kind:"Breadth improvement",
  premise:"Equal-weight participation, earnings and credit conditions improve together.",
  test:"Use matched SPY/RSP returns, advance/decline breadth, sector participation and HY spreads.",
  falsifier:"Rally narrows, earnings guidance deteriorates or spreads widen materially.",
  source:"https://bluebelly-desk.vercel.app/crash-opportunity",
  impact:{ai:"up",equities:"up",energy:"mixed",shipping:"up",bonds:"mixed",metals:"mixed",power:"up",china:"up",agri:"up",consumer:"up",crypto:"up",europe:"unknown"}},
 {id:"ai-financing",name:"AI funding / cash-flow squeeze",family:"ai",kind:"Capital pressure",
  premise:"Debt service, leases and infrastructure capex outrun realised customer cash conversion.",
  test:"Compare original issuer filings, cash receipts, debt costs, utilisation and capex commitments.",
  falsifier:"Cash receipts, interest coverage and paid utilisation improve sustainably.",
  source:"https://bluebelly-desk.vercel.app/regime-watch/ai",
  impact:{ai:"down",equities:"down",energy:"mixed",shipping:"mixed",bonds:"mixed",metals:"mixed",power:"down",china:"mixed",agri:"mixed",consumer:"mixed",crypto:"down",europe:"unknown"}},
 {id:"ai-monetisation",name:"AI adoption converts to cash",family:"ai",kind:"Earnings confirmation",
  premise:"Paid utilisation, cloud margins and free cash conversion validate the AI investment cycle.",
  test:"Verify revenue quality, cash receipts, returns on invested capital and capital discipline.",
  falsifier:"Utilisation disappoints or recurring capex and debt service overwhelm collections.",
  source:"https://bluebelly-desk.vercel.app/regime-watch/ai",
  impact:{ai:"up",equities:"up",energy:"mixed",shipping:"mixed",bonds:"mixed",metals:"mixed",power:"up",china:"mixed",agri:"mixed",consumer:"up",crypto:"up",europe:"unknown"}},
 {id:"yen-unwind",name:"Yen carry unwind accelerates",family:"fx",kind:"Funding / FX",
  premise:"Yen strength is accompanied by verified deleveraging and dollar-funding spillovers.",
  test:"Match USDJPY, JGB-US rate spreads, cross-yen breadth and actual basis/funding stress.",
  falsifier:"Funding stays orderly and carry crosses stabilise despite yen strength.",
  source:"https://bluebelly-desk.vercel.app/regime-watch/yen",
  impact:{ai:"down",equities:"down",energy:"mixed",shipping:"mixed",bonds:"mixed",metals:"mixed",power:"mixed",china:"mixed",agri:"mixed",consumer:"down",crypto:"down",europe:"unknown"}},
 {id:"housing-credit",name:"Housing-led credit downturn",family:"housing",kind:"Household stress",
  premise:"Housing weakness broadens into delinquencies, lender losses and household consumption.",
  test:"Mortgage rates, new-home starts, delinquency transitions, bank provisions and HY spreads.",
  falsifier:"Affordability and housing activity recover without loan-quality deterioration.",
  source:"https://bluebelly-desk.vercel.app/regime-watch/housing",
  impact:{ai:"mixed",equities:"down",energy:"down",shipping:"down",bonds:"mixed",metals:"mixed",power:"mixed",china:"mixed",agri:"down",consumer:"down",crypto:"down",europe:"unknown"}}
]);
const IMPACT=Object.freeze({
 up:{symbol:"↑",label:"Tailwind",css:"up"},
 down:{symbol:"↓",label:"Headwind",css:"down"},
 mixed:{symbol:"↔",label:"Mixed",css:"mixed"},
 neutral:{symbol:"—",label:"Limited",css:"neutral"},
 unknown:{symbol:"?",label:"Unclear",css:"unknown"},
 conflict:{symbol:"!",label:"Conflicting",css:"conflict"}
});
const SCENARIO_BY_ID=new Map(SCENARIOS.map(s=>[s.id,s]));
const TICKER_THEMES=new Map(MARKET_THEMES.flatMap(theme=>theme.tickers.map(id=>[id,theme.id])));
const RADAR_WATCH=["NVDA","GOOGL","SMH","TLT","XOM","CF","CRWV","GRAB","BWXT","CVX","ADBE","CI","CVS","JBL"];
const POINTS=[[21,32],[68,21],[81,46],[62,67],[34,75],[14,57],[47,24],[74,81],[42,51],[88,28]];
function node(tag,cls,value){
 const element=document.createElement(tag);
 if(cls)element.className=cls;
 if(value!==undefined&&value!==null)element.textContent=String(value);
 return element;
}
function add(parent,child){parent.append(child);return child;}
function pct(value){return Number.isFinite(value)?(value>0?"+":"")+value.toFixed(2)+"%":"—"}
function quoteValue(q){return q?.close>0?(q.currency||"")+" "+Number(q.close).toLocaleString("en-GB",{maximumFractionDigits:3}):"—"}
function sourceDate(x){return /^\d{4}-\d{2}-\d{2}$/.test(String(x||""))?x:"Unknown";}
function recentlyReviewed(ticket,now=new Date()){
 const review=ticket?.review;
 if(review?.risk_override)return false;
 if(review?.review_by&&review.review_by<now.toISOString().slice(0,10))return false;
 const due=Date.parse(ticket?.as_of||"");
 if(!Number.isFinite(due)||due>now.getTime()+86400000||now.getTime()-due>45*86400000)return false;
 return ticket?.recommendation?.decision_state==="READY_FOR_OWNER_REVIEW";
}
export function stockAssessment(ticker,decisionRows=[],now=new Date()){
 const id=String(ticker||"").toUpperCase();
 const choices=(decisionRows||[]).filter(r=>String(r?.ticket?.subject?.instrument_id||"").toUpperCase()===id);
 choices.sort((a,b)=>String(b?.created_at||"").localeCompare(String(a?.created_at||"")));
 const ticket=choices[0]?.ticket;
 if(!ticket||!recentlyReviewed(ticket,now))return {status:"WATCH",note:"No current reviewed owner decision",source:"owner"};
 const action=ticket.recommendation.action;
 if(["BUY_STARTER","ADD_IF_CONFIRMED"].includes(action))
  return {status:"CONSIDER BUY",note:"Reviewed owner decision · conditions still apply",source:"owner"};
 if(["TRIM","SELL_REVIEW"].includes(action))
  return {status:"CONSIDER SELL",note:"Reviewed owner decision · risk review required",source:"owner"};
 return {status:"WATCH",note:"No current buy/sell consideration",source:"owner"};
}
export function combineImpacts(first,second){
 if(!first&&!second)return "unknown";
 if(!second)return first||"unknown";
 if(!first)return second||"unknown";
 if(first===second)return first;
 if(first==="neutral")return second;
 if(second==="neutral")return first;
 return "mixed";
}
export function scenarioPair(a,b){
 if(!a||!b)return {compatible:true,reason:"Single scenario"};
 const one=SCENARIO_BY_ID.get(a),two=SCENARIO_BY_ID.get(b);
 if(!one||!two)return {compatible:false,reason:"Unknown scenario"};
 if(one.id===two.id)return {compatible:false,reason:"Select different scenarios"};
 if(one.family===two.family&&["oil","rates","equities","ai"].includes(one.family))
  return {compatible:false,reason:"These describe opposing outcomes for the same driver. Compare them separately, not as simultaneous shocks."};
 return {compatible:true,reason:"Qualitative overlap, not a probability or forecast"};
}
function renderImpact(parent,key){
 const v=IMPACT[key]||IMPACT.unknown;
 const badge=node("span","psr-impact psr-impact-"+v.css);
 badge.append(node("strong",null,v.symbol),document.createTextNode(" "+v.label));
 parent.append(badge);
}
function decisionRows(state){return state?.rows||[]}
function allTracked(state){
 const combined=new Set([...TICKER_THEMES.keys(),...(state?.priceMap||new Map()).keys(),
  ...(state?.ideaRows||[]).map(r=>String(r.ticker||"").toUpperCase())]);
 return [...combined].filter(Boolean);
}
function themeFor(ticker){return TICKER_THEMES.get(ticker)||"other"}
function trackedInTheme(ticker,theme){return theme==="all"||themeFor(ticker)===theme}
function isValidQuote(q){return Boolean(q&&Number.isFinite(q.close)&&q.close>0&&q.session)}
function formatChange(v){return Number.isFinite(v)?pct(v):"—"}
function sortBy(a,b,key){
 if(key==="ticker")return a.ticker.localeCompare(b.ticker);
 if(key==="status")return a.assessment.status.localeCompare(b.assessment.status)||a.ticker.localeCompare(b.ticker);
 const av=a.quote?.[key],bv=b.quote?.[key];
 if(!Number.isFinite(av)&&!Number.isFinite(bv))return a.ticker.localeCompare(b.ticker);
 if(!Number.isFinite(av))return 1;
 if(!Number.isFinite(bv))return -1;
 return bv-av||a.ticker.localeCompare(b.ticker);
}
function styledDelta(el,v){el.className="psr-num"+(Number.isFinite(v)?v>0?" psr-num-up":v<0?" psr-num-down":"":"")}
/** Observed sign distribution within the user's research universe, not broad-market breadth. */
export function summarizeTrackedCloses(priceMap){
 const all=priceMap instanceof Map?[...priceMap.values()]:[];
 const eligible=all.filter(q=>q&&q.currency==="USD"&&q.basis==="Exchange close"&&
  Number.isFinite(q.close)&&q.close>0&&Number.isFinite(q.day)&&
  /^20\d{2}-\d{2}-\d{2}$/.test(String(q.session||"")));
 const session=eligible.reduce((last,q)=>q.session>last?q.session:last,"");
 const rows=eligible.filter(q=>q.session===session);
 const up=rows.filter(q=>q.day>0).length,down=rows.filter(q=>q.day<0).length,flat=rows.length-up-down;
 return {session:session||null,observed:rows.length,up,down,flat,
  missingOrDifferentSession:all.length-rows.length};
}
export function summarizeRegionalCloses(map,region="US"){
 const eu=new Set(MARKET_THEMES.find(t=>t.id==="europe")?.tickers||[]);
 const all=map instanceof Map?[...map.entries()]:[];
 const valid=all.filter(([id,q])=>Number.isFinite(q?.close)&&q.close>0&&Number.isFinite(q?.day)&&
 q.basis==="Exchange close"&&/^20\d{2}-\d{2}-\d{2}$/.test(q.session||"")&&
 (region==="EU"?eu.has(id)&&["EUR","DKK"].includes(q.currency):
  q.currency==="USD"&&!eu.has(id)&&id!=="BTC"));
 const session=valid.reduce((last,[,q])=>q.session>last?q.session:last,"");
 const list=valid.filter(([,q])=>q.session===session).map(([ticker,q])=>({ticker,changePct:q.day}))
 .sort((a,b)=>b.changePct-a.changePct);
 const up=list.filter(x=>x.changePct>0).length,down=list.filter(x=>x.changePct<0).length;
 return {session:session||null,observed:list.length,up,down,flat:list.length-up-down,
 leaders:list.slice(0,3),laggards:[...list].reverse().slice(0,3)};
}
export function installRadarWorkspace(main,getState){
 if(!main)return {render(){}};
 const originals=[...main.childNodes];
 // Keep the private, source-dated stock picks visible in the normal workspace.
 // They are fetched only after owner authentication; do not copy them into static assets.
 const topPicks=originals.find(node=>node.nodeType===1&&node.id==="ps-top-stock-picks-20261113")||null;
 const landing=node("section","psr-landing");
 landing.id="psr-landing";
 landing.setAttribute("aria-label","Power Stack market radar landing");
 const backdrop=add(landing,node("div","psr-water"));
 backdrop.setAttribute("aria-hidden","true");
 const landingHeader=add(landing,node("div","psr-landing-header"));
 landingHeader.append(node("span","psr-brand","POWER STACK"),node("span","psr-kicker","YOUR PRIVATE MARKET RADAR"));
 const intro=add(landing,node("div","psr-intro"));
 intro.append(node("p","psr-eyebrow","MARKET INTELLIGENCE / SOURCE-DATED WATCHES"));
 intro.append(node("h1",null,"See what matters. Before it moves."));
 intro.append(node("p","psr-intro-text","A moving map of what you track. Enter for market themes, price changes and possible scenarios."));
 const radarArea=add(landing,node("div","psr-radar-area"));
 const field=add(radarArea,node("div","psr-field"));
 field.setAttribute("aria-label","Decorative clockwise radar with interactive stock watch markers");
 const scope=add(field,node("div","psr-scope"));
 scope.setAttribute("aria-hidden","true");
 add(scope,node("div","psr-sweep"));
 const blips=add(field,node("div","psr-blips"));
 const helper=add(radarArea,node("div","psr-radar-side"));
 helper.append(node("p","psr-mini","RADAR SIGNALS"));
 const radarStatus=add(helper,node("p","psr-status","Loading reviewed market data…"));
 helper.append(node("p","psr-quiet","Clockwise beam and markers show watchlist discovery, not price forecasts or trading triggers."));
 const enter=add(helper,node("button","psr-enter","ENTER THE RADAR  →"));
 enter.type="button";
 const picksEntry=add(helper,node("button","psr-enter psr-enter-picks","VIEW TOP STOCK PICKS"));
 picksEntry.type="button";
 const landingFooter=add(landing,node("p","psr-landing-footer","Markets move. Evidence matters. Research only · delayed price observations."));
 const workspace=node("div","psr-workspace");workspace.id="workspace";workspace.hidden=true;
 const quick=add(workspace,node("section","psr-simple-header"));quick.setAttribute("aria-label","Power Stack quick navigation");
 quick.append(node("p","psr-simple-eyebrow","POWER STACK  /  RESEARCH DESK"),
  node("h1",null,"Your market, at a glance."),
  node("p","psr-simple-lead","Start with the evidence. Expand a market, investment thesis or scenario only when needed."));
 const nav=add(quick,node("nav","psr-simple-nav"));nav.setAttribute("aria-label","Research destinations");
 for(const [label,url,kind] of [["Explore trade & investment ideas","ideas.html","ideas"],
  ["Market watch & comparisons","portfolio.html#watchlist","market"],
  ["My portfolio","portfolio.html","portfolio"]]){
  const a=add(nav,node("a","psr-simple-link psr-simple-"+kind,label));a.href=url;
  a.prepend(psIcon(kind==="ideas"?"target":kind==="market"?"chart":"wallet","psr-nav-icon"));
 }
 const radarToggle=add(nav,node("button","psr-simple-link psr-simple-radar","Open animated radar"));radarToggle.type="button";
 radarToggle.prepend(psIcon("compass","psr-nav-icon"));
 const snapshot=add(workspace,node("section","psr-snapshot"));snapshot.id="market-snapshot";
 snapshot.setAttribute("aria-label","Tracked US equities and ETFs: source-dated daily direction");
 const snapshotHead=add(snapshot,node("div","psr-snapshot-head"));
 snapshotHead.append(node("div",null),node("div",null));
 snapshotHead.children[0].append(node("p","psr-simple-eyebrow","PRICE DIRECTION / OBSERVED"),
  node("h2",null,"US watchlist pulse"));
 const snapshotDate=add(snapshotHead.children[1],node("span","psr-snapshot-date","Checking completed daily sessions…"));
 const snapshotTotal=add(snapshot,node("div","psr-snapshot-total"));
 const snapshotBar=add(snapshot,node("div","psr-breadth-bar"));snapshotBar.setAttribute("role","img");
 const upBar=add(snapshotBar,node("span","psr-breadth-up"));
 const downBar=add(snapshotBar,node("span","psr-breadth-down"));
 const flatBar=add(snapshotBar,node("span","psr-breadth-flat"));
 const snapshotLegend=add(snapshot,node("div","psr-breadth-legend"));
 const note=add(snapshot,node("p","psr-snapshot-note","US-listed, USD-denominated tracked securities only—not S&P 500 breadth. Other markets, Bitcoin and earlier/missing sessions are excluded; bars show direction, not magnitude."));
 const section=node("section","psr-thematic");
 section.setAttribute("aria-label","Market themes and stock observations");
 const bar=add(section,node("div","psr-hero-strip"));
 bar.append(node("p","psr-eyebrow","EXPLORE / THEMES"),node("h2",null,"Market themes"));
 bar.append(node("p",null,"Stock assessments come only from current owner-reviewed decisions. Price changes are from the delayed feed; missing readings stay blank."));
 const themeGrid=add(section,node("div","psr-theme-grid"));
 const themeMore=add(section,node("button","psr-more-themes","Show more market themes"));themeMore.type="button";
 const tableDrawer=add(section,node("details","psr-collapse psr-stock-table-drawer"));tableDrawer.id="market-table";
 const tableSummary=add(tableDrawer,node("summary","psr-collapse-summary"));
 tableSummary.append(node("span","psr-collapse-heading","All stocks & ETFs · compare and sort"),
  node("span","psr-collapse-caption","Full 1D / 3D / 5D table, sector filters and ticker search"));
 const filterBar=add(tableDrawer,node("div","psr-grid-controls"));
 const filterTitle=add(filterBar,node("div","psr-filter-title"));
 filterTitle.append(node("h3",null,"All tracked stocks & ETFs"),node("p","psr-table-asof","Delayed feed not yet available"));
 const actions=add(filterBar,node("div","psr-grid-actions"));
 const search=add(actions,node("input","psr-search"));search.type="search";search.placeholder="Search ticker";search.setAttribute("aria-label","Search by ticker");
 const reset=add(actions,node("button","psr-reset","All themes"));reset.type="button";
 const tableScroll=add(tableDrawer,node("div","psr-table-scroll"));
 const table=add(tableScroll,node("table","psr-table"));
 table.setAttribute("aria-label","Theme-filtered stocks, current owner review and source-dated price changes");
 const thead=add(table,node("thead"));
 const headings=add(thead,node("tr"));
 for(const [k,label] of [["ticker","Stock"],["status","Assessment"],["close","Last close"],["day","1D"],["threeDay","3D"],["fiveDay","5D"]]){
  const th=add(headings,node("th"));const btn=add(th,node("button",null,label));btn.type="button";btn.dataset.sort=k;btn.setAttribute("aria-label","Sort by "+label);
 }
 const tbody=add(table,node("tbody"));
 const caption=add(tableDrawer,node("p","psr-disclaimer","WATCH means research is required, not buy. Consider Buy/Sell requires a dated owner-reviewed decision and is never an executable order."));
 const matrixDrawer=node("details","psr-collapse psr-scenario-drawer");matrixDrawer.id="scenario-panel";
 const matrixDrawerSummary=add(matrixDrawer,node("summary","psr-collapse-summary"));
 matrixDrawerSummary.append(node("span","psr-collapse-heading","Scenario Matrix · what changes if…"),
  node("span","psr-collapse-caption","Compare two macro shocks and conditional effects on eight themes"));
 const matrix=add(matrixDrawer,node("section","psr-scenario"));matrix.id="scenario-matrix";matrix.setAttribute("aria-label","Bluebelly-informed scenario impact matrix");
 const matrixHead=add(matrix,node("div","psr-hero-strip"));
 matrixHead.append(node("p","psr-eyebrow","02 / WHAT IF?"),node("h2",null,"Scenario Matrix"));
 matrixHead.append(node("p",null,"Choose two conditions to explore their potential effects across market themes. This is qualitative research, not calibrated probabilities."));
 const selectors=add(matrix,node("div","psr-scenario-pickers"));
 const selA=add(selectors,node("select","psr-select"));selA.setAttribute("aria-label","First scenario");
 const selB=add(selectors,node("select","psr-select"));selB.setAttribute("aria-label","Second scenario");
 for(const item of SCENARIOS){
  const a=add(selA,node("option",null,item.name));a.value=item.id;
  const b=add(selB,node("option",null,item.name));b.value=item.id;
 }
 selA.value="oil-escalation";selB.value="hot-inflation";
 const matrixNote=add(matrix,node("p","psr-matrix-note"));
 const scenarioCards=add(matrix,node("div","psr-scenario-cards"));
 const matScroll=add(matrix,node("div","psr-table-scroll"));
 const mat=add(matScroll,node("table","psr-mat"));
 mat.setAttribute("aria-label","Conditional directional pressure by market theme and scenario");
 const matHead=add(mat,node("thead")),matHeadRow=add(matHead,node("tr")),matBody=add(mat,node("tbody"));
 const matrixBottom=add(matrix,node("p","psr-disclaimer","Arrows describe plausible first-order effects; NOT observed stock returns, probabilities, allocation advice or automatic trading signals. Opposing drivers and heterogeneous stocks can invalidate a theme-level direction."));
 const featured=topPicks?node("details","psr-collapse psr-featured-drawer"):null;
 if(featured){
  featured.id="featured-picks";
  const summary=add(featured,node("summary","psr-collapse-summary"));
  summary.append(node("span","psr-collapse-heading","Featured investment research & valuation"),
   node("span","psr-collapse-caption","Owner-only picks, source-backed scenarios, risks and original evidence"));
  featured.append(topPicks);
 }
 const legacy=add(workspace,node("details","psr-legacy"));
 legacy.id="advanced-research";
 const legacySummary=add(legacy,node("summary",null,"Open the full research, portfolio checks & decision tools"));
 const legacyIntro=add(legacy,node("p",null,"All existing research, owner decision records, technical observations and portfolio tools remain available here."));
 for(const original of originals){if(original!==topPicks)legacy.append(original);}
 workspace.prepend(quick,snapshot,section,...(featured?[featured]:[]),matrixDrawer);
 main.replaceChildren(landing,workspace);
 // The research overview is the default; the decorative radar remains optional.
 if(location.hash==="#radar"){
  landing.hidden=false;workspace.hidden=true;document.body.classList.add("psr-landing-active");
 }else{
  landing.hidden=true;workspace.hidden=false;document.body.classList.remove("psr-landing-active");
 }
 let selectedTheme="all",sorting="ticker",showAllThemes=false;
 if(["#scenario-matrix","#advanced-research","#ps-top-stock-picks-20261113","#market-table"].includes(location.hash))openWorkspace(location.hash);
 function openWorkspace(target="#workspace"){
  landing.hidden=true;workspace.hidden=false;
  document.body.classList.remove("psr-landing-active");
  if(target==="#advanced-research")legacy.open=true;
  if(target==="#scenario-matrix"){matrixDrawer.open=true;matrixDrawer.scrollIntoView({block:"start"});}
  else if(target==="#ps-top-stock-picks-20261113"&&featured){featured.open=true;featured.scrollIntoView({block:"start"});}
  else if(target==="#market-table"){tableDrawer.open=true;tableDrawer.scrollIntoView({block:"start"});}
  else if(target==="#advanced-research")legacy.scrollIntoView({block:"start"});
  else workspace.scrollIntoView({block:"start"});
  if(location.hash!==target)history.replaceState(null,"",target);
 }
 enter.addEventListener("click",()=>openWorkspace());
 radarToggle.addEventListener("click",()=>{
  landing.hidden=false;workspace.hidden=true;document.body.classList.add("psr-landing-active");
  history.replaceState(null,"","#radar");landing.scrollIntoView({block:"start"});
 });
 picksEntry.addEventListener("click",()=>openWorkspace("#ps-top-stock-picks-20261113"));
 reset.addEventListener("click",()=>{selectedTheme="all";search.value="";renderThemes();renderGrid();});
 themeMore.addEventListener("click",()=>{showAllThemes=!showAllThemes;renderThemes();});
 search.addEventListener("input",()=>renderGrid());
 headings.addEventListener("click",e=>{
  const key=e.target.closest("button[data-sort]")?.dataset.sort;
  if(!key)return;sorting=key;renderGrid();
 });
 themeGrid.addEventListener("click",e=>{
  const btn=e.target.closest("button[data-theme]");if(!btn)return;
  selectedTheme=btn.dataset.theme;renderThemes();renderGrid();
  tableDrawer.open=true;tableDrawer.scrollIntoView({block:"nearest"});
 });
 selA.addEventListener("change",renderMatrix);
 selB.addEventListener("change",renderMatrix);
 function renderThemes(){
  const state=getState(),tickers=allTracked(state);
  themeGrid.replaceChildren();
  for(const theme of (showAllThemes?MARKET_THEMES:MARKET_THEMES.slice(0,6))){
   const button=add(themeGrid,node("button","psr-theme"));
   button.type="button";button.dataset.theme=theme.id;button.setAttribute("aria-pressed",String(selectedTheme===theme.id));
   button.append(psIcon(THEME_ICON_NAMES[theme.id]||"globe","psr-theme-icon"),node("strong",null,theme.name),
     node("small",null,theme.description),
     node("span","psr-theme-count",tickers.filter(id=>themeFor(id)===theme.id).length+" tracked"));
  }
  const extra=tickers.filter(id=>themeFor(id)==="other");
  themeMore.hidden=MARKET_THEMES.length<=6&&extra.length===0;
  themeMore.textContent=showAllThemes?"Show fewer market themes":"Show all "+(MARKET_THEMES.length+(extra.length?1:0))+" themes";
  themeMore.setAttribute("aria-expanded",String(showAllThemes));
  if(extra.length&&showAllThemes){
   const button=add(themeGrid,node("button","psr-theme"));button.type="button";button.dataset.theme="other";button.setAttribute("aria-pressed",String(selectedTheme==="other"));
   button.append(psIcon("layers","psr-theme-icon"),node("strong",null,"Other Markets"),node("small",null,"Unclassified symbols; no inferred theme"),node("span","psr-theme-count",extra.length+" tracked"));
  }
 }
 function renderGrid(){
  const state=getState(),term=search.value.trim().toUpperCase();
  const tickers=allTracked(state).filter(id=>trackedInTheme(id,selectedTheme)&&(!term||id.includes(term)));
  const rows=tickers.map(ticker=>({ticker,quote:state?.priceMap?.get(ticker),
    assessment:stockAssessment(ticker,decisionRows(state))}));
  rows.sort((a,b)=>sortBy(a,b,sorting));
  const theme=MARKET_THEMES.find(t=>t.id===selectedTheme);
  filterTitle.querySelector("h3").textContent=theme?.name||(selectedTheme==="other"?"Other markets":"All tracked stocks & ETFs");
  const asOf=state?.marketAsOf;
  filterTitle.querySelector("p").textContent=(asOf?"Feed generated "+asOf.slice(0,16).replace("T"," ")+" UTC":"Verified price feed unavailable")+" · "+rows.length+" symbols · completed sessions only";
  tbody.replaceChildren();
  for(const item of rows){
   const tr=add(tbody,node("tr")),tickerCell=add(tr,node("td"));
   const id=add(tickerCell,node("strong","psr-stock-symbol",item.ticker));
   tickerCell.append(node("small","psr-stock-theme",MARKET_THEMES.find(t=>t.id===themeFor(item.ticker))?.name||"Unclassified"));
   const action=add(tr,node("td"));
   const status=add(action,node("span","psr-action psr-action-"+item.assessment.status.toLowerCase().replaceAll(" ","-"),item.assessment.status));
   status.title=item.assessment.note;
   const q=isValidQuote(item.quote)?item.quote:null;
   const close=add(tr,node("td",""+(q?"psr-num":""),quoteValue(q)));
   close.title=q?"Session "+sourceDate(q.session)+" · "+q.basis:"No current verified quote";
   for(const k of ["day","threeDay","fiveDay"]){
    const n=add(tr,node("td",null,formatChange(q?.[k])));
    styledDelta(n,q?.[k]);n.title=q?"To completed session "+q.session:"Unavailable / stale";
   }
  }
  if(!rows.length){const tr=add(tbody,node("tr"));const td=add(tr,node("td",null,"No matching symbols."));td.colSpan=6;}
 }
 function renderSnapshot(){
  const stats=summarizeTrackedCloses(getState()?.priceMap);
  snapshotDate.textContent=stats.session?"Daily session "+stats.session:"No dated daily close";
  snapshotTotal.textContent=stats.observed?stats.observed+" US-listed names in the latest completed session":"No comparable session data yet";
  for(const [node,count] of [[upBar,stats.up],[downBar,stats.down],[flatBar,stats.flat]]){
   node.style.width=(stats.observed?100*count/stats.observed:0).toFixed(2)+"%";
  }
  snapshotBar.setAttribute("aria-label",stats.observed?
   stats.up+" rising, "+stats.down+" falling, "+stats.flat+" unchanged out of "+stats.observed+" tracked symbols":
   "No verified comparable session observations");
  snapshotLegend.replaceChildren();
  for(const [tag,count,label] of [["up",stats.up,"Rising"],["down",stats.down,"Falling"],["flat",stats.flat,"Unchanged"]]){
   const item=add(snapshotLegend,node("span","psr-legend-item psr-legend-"+tag));
   item.append(node("strong",null,String(count)),document.createTextNode(" "+label));
  }
 }
 function renderRadar(){
  const state=getState();
  blips.replaceChildren();
  const recent=Boolean(state?.marketAsOf);
  const statuses={buy:0,sell:0,watch:0};
  RADAR_WATCH.forEach((ticker,i)=>{
   const [x,y]=POINTS[i],dx=x-50,dy=y-50,angle=(Math.atan2(dx,-dy)*180/Math.PI+360)%360;
   const decision=stockAssessment(ticker,decisionRows(state));
   statuses[decision.status==="CONSIDER BUY"?"buy":decision.status==="CONSIDER SELL"?"sell":"watch"]++;
   const button=add(blips,node("button","psr-blip"));
   button.type="button";
   button.style.setProperty("--x",x+"%");
   button.style.setProperty("--y",y+"%");
   button.style.setProperty("--psr-delay",(-12*(1-angle/360)).toFixed(3)+"s");
   button.dataset.action=decision.status==="CONSIDER BUY"?"buy":decision.status==="CONSIDER SELL"?"sell":"watch";
   button.title=ticker+" · "+decision.status+" · "+quoteValue(state?.priceMap?.get(ticker));
   button.setAttribute("aria-label","Explore "+ticker+"; "+decision.status);
   button.append(node("span","psr-blip-dot"),node("span","psr-blip-label",ticker));
   button.addEventListener("click",()=>{selectedTheme=themeFor(ticker);showAllThemes=true;search.value=ticker;renderThemes();renderGrid();openWorkspace("#market-table")});
  });
  radarStatus.textContent=recent
   ?statuses.buy+" consider buy · "+statuses.sell+" consider sell · "+statuses.watch+" watch · Dated "+state.marketAsOf.slice(0,10)
   :"Watch universe only · price feed unavailable or stale";
 }
 function renderMatrix(){
  const a=SCENARIO_BY_ID.get(selA.value),b=SCENARIO_BY_ID.get(selB.value);
  const compat=scenarioPair(a?.id,b?.id);
  matrixNote.textContent=compat.compatible?
   "Source-dated Bluebelly scenarios · editorial mechanisms reviewed through "+RESEARCH_ASOF+" · Not live/regime verdicts.":
   compat.reason+" Combined result withheld.";
  scenarioCards.replaceChildren();
  for(const s of [a,b]){
   if(!s)continue;
   const card=add(scenarioCards,node("article","psr-scenario-card"));
   card.append(node("span","psr-scenario-kind",s.kind),node("h3",null,s.name),node("p",null,s.premise));
   const details=add(card,node("details"));
   details.append(node("summary",null,"Confirmation & invalidation"));
   const body=add(details,node("div","psr-scenario-evidence"));
   body.append(node("p",null,"Confirm: "+s.test),node("p",null,"Invalidation: "+s.falsifier));
   const link=add(body,node("a",null,"Open Bluebelly source ↗"));
   link.href=s.source;link.target="_blank";link.rel="noopener noreferrer";
  }
  matHeadRow.replaceChildren();
  for(const heading of ["Market theme",a?.name||"Scenario A",b?.name||"Scenario B","Combined pressure"])
   matHeadRow.append(node("th",null,heading));
  matBody.replaceChildren();
  for(const theme of MARKET_THEMES){
   const tr=add(matBody,node("tr"));
   const th=add(tr,node("th",null,theme.name));th.scope="row";
   for(const sc of [a,b]){
    const td=add(tr,node("td"));renderImpact(td,sc?.impact?.[theme.id]||"unknown");
   }
   const outcome=add(tr,node("td"));
   const impact=compat.compatible?combineImpacts(a?.impact?.[theme.id],b?.impact?.[theme.id]):"conflict";
   renderImpact(outcome,impact);
   outcome.title=compat.compatible?"Conditional overlap only · inspect each scenario's confirming tests":compat.reason;
  }
 }
 renderMatrix();renderThemes();renderGrid();renderRadar();renderSnapshot();
 return {render(){renderThemes();renderGrid();renderRadar();renderSnapshot()},openWorkspace};
}
