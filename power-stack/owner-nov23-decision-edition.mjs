/* Power Stack owner-gated 23 November decision overlay.
   Public file contains ONLY public-market research; user portfolio/quote data is
   fetched after authenticated allowlist gate by auth-gate.mjs.
   Not an order, private portfolio archive or canonical Bluebelly publication. */
const EDITION="2026-11-23";
const SOURCE={
 correction:"https://www.reuters.com/business/finance/correction-or-deeper-reckoning-investors-seek-signs-us-stock-selling-will-abate-2026-11-22/",
 volatility:"https://www.home.saxo/en-gb/content/articles/macro/market-quick-take---sentiment-bounces-after-friday-mayhem---23-november-2026-23112026",
 staples:"https://sg.finance.yahoo.com/news/consumer-staples-stocks-benefiting-from-a-powerful-rotation-as-tech-gets-slammed-173929452.html/",
 calendar:"https://www.morningstar.com/markets/whats-happening-markets-this-week-33",
 evidence:"https://app.notion.com/p/421519b67a9481148b11df2c2752011e"
};
const decisions=[
 {ticker:"SPY / SMH",posture:"TACTICAL REBOUND WATCH",desk:"David",finding:"Friday's 20 November close: SPY 689.81 (−3.64% session), SMH 400.06 (−10.60%); VIX closed 35.89. The S&P is 11.6% below its October peak. Powerful squeezes can occur in an unconfirmed downtrend.",action:"Do not buy Monday's opening spike. Require sustained daily/4H recovery, a respected-band retest and breadth confirmation before sizing a trade.",wrong:"SMH loses its 20 Nov $396.85 intraday low with breadth and credit still weakening.",source:SOURCE.correction},
 {ticker:"XLP / STAPLES",posture:"EXPENSIVE DEFENSIVE",desk:"Sarah",finding:"17 Nov third-party snapshot: staples forward P/E 24.2× versus technology 17.2×. Staples were showing relative strength, but the multiple itself is a risk. A legacy P/E divided by assumed growth is NOT a current comparable PEG.",action:"Do not chase XLP merely for safety. Prefer normalised FCF, debt, earnings revisions and matched-horizon PEG before adding any staple.",wrong:"Large sustainable upward revisions to staples' earnings growth justify more of the premium.",source:SOURCE.staples},
 {ticker:"RSP / PHO",posture:"RELATIVE ROTATION",desk:"Mike",finding:"On matched 20-session US price closes to 20 Nov: PHO +2.44%, RSP −4.20%, SPY −9.23%, SMH −24.12%. The stronger water trade is relative leadership, not proof of a buyable valuation.",action:"Underwrite MWA and DOV first; check RSP/SMH breadth and issuer FCF, then demand a daily/4H price retest.",wrong:"Water earnings weaken or the stock loses trend while tech-led market breadth repairs.",source:SOURCE.volatility},
 {ticker:"TLT / CREDIT",posture:"DEFENSIVE / INCOMPLETE",desk:"Jimmy",finding:"Treasury ETF TLT rose 1.37% Friday as risk assets fell; a bond rally does not establish healthy corporate credit or easier AI financing. The newest high-yield/CCC OAS comparison is still unverified.",action:"No automatic long-duration buy. Match 2Y/10Y/30Y nominal and real yields, HYG/OAS and credit funding before a regime upgrade.",wrong:"Rates stay elevated, term premium rises or credit spreads materially deteriorate.",source:SOURCE.correction},
 {ticker:"CF / LNG / ENERGY",posture:"SELECTIVE CASH-FLOW WATCH",desk:"Mike",finding:"Oil risk and oil oversupply can coexist. Tanker incidents, urea availability, refined-product cracks and upstream-service work orders are economically distinct. No verified cargo loss should be invented.",action:"Research cash generation and product spreads. CF remains a midcycle spread test; LNG requires price and cash conversion; do not buy every energy ticker on Hormuz headlines.",wrong:"Physical flows normalise, gas/input spreads squeeze margins or customer demand deteriorates.",source:SOURCE.evidence},
 {ticker:"AI / CASH CONVERSION",posture:"CASH QUALITY GATE",desk:"Rachel",finding:"Nvidia's strong reported demand did not prevent Friday's equity collapse. GPU orders are not proof that cloud customers earn adequate returns after financing, leases and capex.",action:"Separate profitable hardware suppliers from leveraged capacity operators. Review NVDA/GOOGL/VRT/NVT issuer cash, financing and guidance; no forced buy ranking without verified estimates.",wrong:"Issuer order revisions or debt/cash changes fail the investment thesis.",source:SOURCE.correction}
];
export {decisions as NOV23_DECISIONS};
const calendar=[
 ["Mon 23","US flash PMI; Bursa KLCI-50 ranking cut-off","Check growth/prices and local index-flow effects; no implied order"],
 ["Tue 24","US consumer confidence; Dell, Analog Devices, Workday results","Separate hardware demand, software spending and margins"],
 ["Wed 25 · 21:30 MYT","US PCE, Q3 GDP revision and durable goods","The main inflation/yield/tech multiple test"],
 ["Thu 26","US Thanksgiving; Beige Book Wed 25 14:00 ET (Thu 03:00 MYT)","US cash market closed; read Beige Book evidence"],
 ["Fri 27","MISC result watch; US early market close","Issuer-specific shipping/earnings and thin US liquidity"],
 ["Sun 29","OPEC+ output discussion","Physical supply, Brent curves, oil vs freight transmission"]
];
const pageCalls={
 index:"MATT: THE MARKET HAS EARNED A REBOUND WATCH, NOT AN ALL-CLEAR. PROTECT CAPITAL, DON'T CHASE A GAP-UP, AND DON'T BUY EXPENSIVE STAPLES JUST BECAUSE TECH IS BLEEDING.",
 portfolio:"JIMMY: RECONCILE ACTUAL OWNER POSITIONS AND CASH BEFORE ANY TRIM OR ADD. CONCENTRATION IS A DIFFERENT RISK FROM A BAD ONE-DAY CANDLE. NO BROKER ACTION IS IMPLIED.",
 ideas:"SARAH: PRIORITISE CASH-EARNING RESEARCH, NOT A SEA OF RED TICKERS. MWA / DOV / LDOS / CHKP / CF AND SELECT AI ARE SEPARATE THESIS CHECKS, NOT ORDERS.",
 research:"RACHEL: THE 23 NOV FACTS OVERRIDE OLD PRE-EARNINGS PREVIEWS; HISTORICAL ISSUER COMPARISONS REMAIN BELOW WITH THEIR ORIGINAL DATES.",
 sectors:"MIKE: WATER AND STAPLES BEAT THE TAPE; TECH AND CYBER DID NOT. RELATIVE STRENGTH IS NOT INTRINSIC VALUE. DON'T PAY AN UNLIMITED P/E FOR A DEFENSIVE LABEL.",
 decisions:"DAVID: VIX AND RSI CAN SIGNAL EXHAUSTION, NOT A GUARANTEED BOTTOM. ENTRIES STILL REQUIRE RETEST, INVALIDATION AND SOURCE-DATED CONFIRMATION."
};
const $=(tag,klass,copy)=>{const x=document.createElement(tag);if(klass)x.className=klass;if(copy!==undefined)x.textContent=copy;return x};
function link(text,url){const a=$("a",null,text);a.href=url;a.rel="noopener noreferrer";a.target="_blank";return a;}
function row(label,value){const d=$("div","ps-nov23-stat");d.append($("dt",null,label),$("dd",null,value));return d;}
async function quoteHealth(db,user){
 if(!db||!user?.id)return {text:"Not checked (owner data unavailable)",status:"gap"};
 try{
  const {data,error}=await db.from("power_stack_quote_observations")
   .select("ticker,observed_on").eq("owner_user_id",user.id)
   .order("observed_on",{ascending:false}).limit(2000);
  if(error)throw error;
  if(!data?.length)return {text:"No owner-scoped price observations; do not assume zero holdings",status:"gap"};
  const latest=data[0].observed_on;
  const covered=new Set(data.map(x=>x.ticker)).size;
  const fresh=new Set(data.filter(x=>x.observed_on>="2026-11-20").map(x=>x.ticker)).size;
  return {text:latest+" latest source date · "+fresh+"/"+covered+" historically observed tickers dated 20 Nov or later",status:fresh?"partial":"gap"};
 }catch(error){
  return {text:"Quote readback unavailable; freshness UNKNOWN",status:"gap"};
 }
}
export async function mountNov23DecisionEdition(page,main,db,user){
 if(!main||main.querySelector("#ps-nov23-edition"))return;
 const style=$("link");style.rel="stylesheet";style.href="owner-nov23-decision-edition.css?v=20261123-v1";document.head.append(style);
 const section=$("section","ps-nov23-edition");section.id="ps-nov23-edition";section.setAttribute("aria-label","23 November Power Stack findings-first investment briefing");
 const head=$("header","ps-nov23-head");
 const over=$("div","ps-nov23-over");over.append($("span",null,"POWER STACK / MATT'S WAR ROOM"),$("span",null,"RESEARCH EDITION · "+EDITION+" MYT"));
 head.append(over,$("h2",null,"THE DAMAGE IS REAL. SO IS THE REBOUND POSSIBILITY."),$("p","ps-nov23-matt",pageCalls[page]||pageCalls.index));
 const summary=$("div","ps-nov23-verdict");
 summary.append(row("Market regime","S&P correction, −11.6% from peak"),row("Defensive valuation","XLP ~24.2× forward P/E (17 Nov)"),row("Trade posture","Defensive / tactical rebound watch"));
 head.append(summary);
 const quote=$("p","ps-nov23-health","Quote coverage: checking authenticated observations…");head.append(quote);
 section.append(head);
 const deck=$("div","ps-nov23-deck");
 for(const item of decisions){
  const card=$("article","ps-nov23-card");
  const top=$("div","ps-nov23-top");
  top.append($("strong",null,item.ticker),$("span",null,item.posture));card.append(top);
  card.append($("p","ps-nov23-finding",item.finding));
  const action=$("p","ps-nov23-action");action.append($("strong",null,"THE CALL · "),document.createTextNode(item.action));card.append(action);
  const details=$("details","ps-nov23-detail");
  details.append($("summary",null,"Countercase and original evidence"));
  const d=$("p",null,"What would alter the view: "+item.wrong);details.append(d,link("Source / research context ↗",item.source));card.append(details);
  deck.append(card);
 }
 section.append($("h3","ps-nov23-subhead","CONFIRMED FINDINGS · DESK DECISIONS"),deck);
 const events=$("details","ps-nov23-events");events.append($("summary",null,"Week ahead · announced catalysts and decision tests"));
 const table=$("div","ps-nov23-eventgrid");
 for(const [when,what,why] of calendar){
  const item=$("div","ps-nov23-event");item.append($("strong",null,when),$("span",null,what),$("p",null,why));table.append(item);
 }
 events.append(table,link("Calendar cross-check ↗",SOURCE.calendar));section.append(events);
 const footer=$("p","ps-nov23-foot","Market prices: completed 20 Nov US session unless otherwise dated; source-dated research, not live orders. X-wire charts and VIX 37.8 episode claims remain unverified as backtests. Bluebelly X feed was 7/15 healthy at its 23 Nov 14:00 MYT checkpoint; AI 16-issuer fresh filing checks were 0/16. Those are dated coverage receipts, not perpetual status. Historic saved portfolio decisions are not overwritten.");
 section.append(footer);
 const anchor=page==="index"?main.querySelector(".psw-war-room-drawer"):main.querySelector(".pscr-root");
 if(anchor)anchor.before(section);else main.prepend(section);
 const status=await quoteHealth(db,user);quote.textContent="Private price ledger · "+status.text;quote.dataset.status=status.status;
}
