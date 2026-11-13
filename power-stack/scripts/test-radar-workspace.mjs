import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 RADAR_CONTRACT,RESEARCH_ASOF,MARKET_THEMES,SCENARIOS,
 stockAssessment,combineImpacts,scenarioPair,summarizeTrackedCloses,summarizeRegionalCloses,THEME_ICON_NAMES,RADAR_WATCH,POINTS
} from "../owner-radar-workspace.mjs";
import {validateBluebellyStockCoverage} from "../owner-bluebelly-stocks.mjs";
const root=new URL("../",import.meta.url);
const read=file=>readFileSync(new URL(file,root),"utf8");
const now=new Date("2026-11-12T12:00:00Z");
function owner(action,mod={}){
 return {created_at:mod.created_at||"2026-11-12T01:00:00Z",
  ticket:{as_of:mod.as_of||"2026-11-12T00:00:00Z",
   subject:{instrument_id:mod.ticker||"GOOGL"},
   recommendation:{action,decision_state:mod.state||"READY_FOR_OWNER_REVIEW"},
   review:{review_by:mod.review_by||"2026-11-19",risk_override:mod.risk_override||false}
  }};
}
test("all research radar markers have safe and distinct coordinates",()=>{
 assert.equal(RADAR_WATCH.length,POINTS.length,"Every radar stock requires a position");
 assert.equal(new Set(RADAR_WATCH).size,RADAR_WATCH.length);
 assert.equal(new Set(POINTS.map(x=>x.join(","))).size,POINTS.length);
 for(const p of POINTS){
  assert.equal(p.length,2);
  assert(p.every(x=>Number.isFinite(x)&&x>=8&&x<=95),"Marker must fit radar");
 }
});

test("radar contracts link the entire defined market universe once and preserve market theme separation",()=>{
 assert.equal(RADAR_CONTRACT,"power-stack-radar-workspace/1");
 const manifest=JSON.parse(read("market-symbols.json"));
 const all=MARKET_THEMES.flatMap(theme=>theme.tickers);
 assert.equal(new Set(all).size,all.length,"No ticker should be shown in two mutually exclusive primary themes");
 for(const t of manifest.symbols)assert(all.includes(t.ticker),"Missing primary theme: "+t.ticker);
 assert(MARKET_THEMES.length>=8);
 assert(!read("owner-radar-workspace.mjs").includes("sb_secret_"));
});
test("scenario impact schema is complete and Bluebelly sourced without fake probabilities",()=>{
 assert.match(RESEARCH_ASOF,/^20\d\d-\d\d-\d\d$/);
 const known=new Set(["up","down","mixed","neutral","unknown"]);
 for(const s of SCENARIOS){
  assert(s.id&&s.name&&s.premise&&s.test&&s.falsifier);
  assert(s.source.startsWith("https://bluebelly-desk.vercel.app/"),s.id);
  assert.deepEqual(Object.keys(s.impact).sort(),MARKET_THEMES.map(x=>x.id).sort(),s.id);
  for(const effect of Object.values(s.impact))assert(known.has(effect),s.id);
  assert(!Object.hasOwn(s,"probability"),"Scenario must not claim probability");
 }
 assert(SCENARIOS.length>=9);
});
test("two scenarios combine only as qualitative directions, with conflicting families withheld",()=>{
 assert.equal(combineImpacts("up","up"),"up");
 assert.equal(combineImpacts("up","down"),"mixed");
 assert.equal(combineImpacts("neutral","down"),"down");
 assert.equal(combineImpacts(null,null),"unknown");
 assert.equal(scenarioPair("oil-escalation","oil-reopening").compatible,false);
 assert.equal(scenarioPair("hot-inflation","rates-relief").compatible,false);
 assert.equal(scenarioPair("equity-stress","equity-recovery").compatible,false);
 assert.equal(scenarioPair("ai-financing","ai-monetisation").compatible,false);
 assert.equal(scenarioPair("oil-escalation","hot-inflation").compatible,true);
 assert.equal(scenarioPair("missing","hot-inflation").compatible,false);
});
test("buy/sell considerations require an explicit current reviewed owner decision",()=>{
 assert.equal(stockAssessment("GOOGL",[],now).status,"WATCH");
 assert.equal(stockAssessment("GOOGL",[owner("BUY_STARTER")],now).status,"CONSIDER BUY");
 assert.equal(stockAssessment("GOOGL",[owner("ADD_IF_CONFIRMED")],now).status,"CONSIDER BUY");
 assert.equal(stockAssessment("GOOGL",[owner("TRIM")],now).status,"CONSIDER SELL");
 assert.equal(stockAssessment("GOOGL",[owner("SELL_REVIEW")],now).status,"CONSIDER SELL");
 assert.equal(stockAssessment("GOOGL",[owner("WAIT")],now).status,"WATCH");
 assert.equal(stockAssessment("GOOGL",[owner("BUY_STARTER",{state:"WAITING_FOR_TRIGGER"})],now).status,"WATCH");
 assert.equal(stockAssessment("GOOGL",[owner("BUY_STARTER",{review_by:"2026-11-01"})],now).status,"WATCH");
 assert.equal(stockAssessment("GOOGL",[owner("BUY_STARTER",{risk_override:true})],now).status,"WATCH");
 assert.equal(stockAssessment("GOOGL",[owner("BUY_STARTER",{as_of:"2026-09-01T00:00:00Z"})],now).status,"WATCH");
 assert.equal(stockAssessment("NVDA",[owner("BUY_STARTER")],now).status,"WATCH");
});
test("authenticated entry keeps existing private research and uses no modelled trading orders",()=>{
 const home=read("owner-decision-desk.mjs"),gate=read("auth-gate.mjs");
 const radar=read("owner-radar-workspace.mjs"),css=read("owner-radar-workspace.css"),html=read("index.html");
 assert(home.includes("installRadarWorkspace(main,()=>state)"));
 assert(gate.indexOf("const user=await authenticate()")<gate.indexOf('if(PAGE==="index")'));
 assert(html.includes('owner-radar-workspace.css?v=20261113-picks2'));
 assert(html.includes('owner-hybrid-ocean.css'));
 assert(radar.includes("ENTER THE RADAR")&&radar.includes("Scenario Matrix"));
 assert(radar.includes("VIEW TOP STOCK PICKS")&&radar.includes("picksEntry.addEventListener"));
 assert(radar.includes("threeDay")&&radar.includes("fiveDay")&&radar.includes("sourceDate"));
 assert(radar.includes("psr-legacy")&&radar.includes("originals"));
 assert(css.includes("psr-clockwise")&&css.includes("prefers-reduced-motion:reduce"));
 assert(css.includes("psr-landing-active"));
 assert(!/placeOrder|createOrder|borrowApproved|cash_delta|brokerQuantity|service_role|sb_secret_/i.test(radar+css));
});
test("main research cards do not display EMA band position or automatic technical trade verdict",()=>{
 const full=read("owner-opportunity-terminal.mjs");
 assert(!full.includes('make("section","pso-band")'));
 assert(!full.includes('DAILY 20 EMA ±1SD'));
 assert(!full.includes('state.status),make("span"'));
 assert(full.includes('WATCH — RESEARCH ONLY'));
});

test("Top Stock Picks and full tables remain owner-gated but start collapsed",()=>{
 const radar=read("owner-radar-workspace.mjs"),gate=read("auth-gate.mjs"),
  html=read("index.html"),css=read("top-stock-picks.css");
 assert.match(radar,/node\.id==="ps-top-stock-picks-20261113"/);
 assert.match(radar,/if\(original!==topPicks\)legacy\.append\(original\)/);
 assert(radar.includes('featured.append(topPicks)'));
 assert(radar.includes('featured.id="featured-picks"'));
 assert(radar.includes('tableDrawer.id="market-table"'));
 assert(radar.includes('matrixDrawer.id="scenario-panel"'));
 assert(radar.includes("tableDrawer.open=true"));
 assert(radar.includes("matrixDrawer.open=true"));
 assert(gate.indexOf('const user=await authenticate()')<gate.indexOf('const {data,error}=await db.from("power_stack_private_pages")'));
 assert(html.includes("top-stock-picks.css?v=20261113-a1"));
 assert(css.includes('.ps-picks .ps-picks-grid'));
 assert(css.includes('@media(max-width:500px)'));
 assert(!radar.includes("cash_delta"));
});
test("market snapshot uses latest matching completed-session signs and counts missing separately",()=>{
 const cases=new Map([
  ["A",{close:120,day:1.2,session:"2026-11-12",currency:"USD",basis:"Exchange close"}],
  ["B",{close:85,day:-1.3,session:"2026-11-12",currency:"USD",basis:"Exchange close"}],
  ["C",{close:15,day:0,session:"2026-11-12",currency:"USD",basis:"Exchange close"}],
  ["D",{close:77,day:3.4,session:"2026-11-11",currency:"USD",basis:"Exchange close"}],
  ["E",{close:null,day:null,session:null}],
  ["F",{close:35,day:2,session:"2026-11-13",currency:"HKD",basis:"Exchange close"}],
  ["G",{close:90000,day:1,session:"2026-11-13",currency:"USD",basis:"BTC UTC daily sample"}]
 ]);
 const out=summarizeTrackedCloses(cases);
 assert.deepEqual(out,{session:"2026-11-12",observed:3,up:1,down:1,flat:1,missingOrDifferentSession:4});
 assert.deepEqual(summarizeTrackedCloses(new Map()),{session:null,observed:0,up:0,down:0,flat:0,missingOrDifferentSession:0});
 assert.equal(summarizeTrackedCloses(null).observed,0);
});
test("simple homepage defaults to direct overview and preserves optional radar and scenario deep links",()=>{
 const radar=read("owner-radar-workspace.mjs"),html=read("index.html"),css=read("owner-calm-layout.css");
 assert(radar.includes('node("h1",null,"Your market, at a glance.")'));
 assert(radar.includes('if(location.hash==="#radar")'));
 assert(radar.includes('landing.hidden=true;workspace.hidden=false;document.body.classList.remove("psr-landing-active")'));
 assert(radar.includes('if(target==="#scenario-matrix"){matrixDrawer.open=true;'));
 assert(radar.includes('if(target==="#market-table"){tableDrawer.open=true;'));
 assert(radar.includes('tableDrawer.open=true;tableDrawer.scrollIntoView'));
 assert(radar.includes('showAllThemes?MARKET_THEMES:MARKET_THEMES.slice(0,6)'));
 assert(radar.includes('summaryTrackedCloses')===false);
 assert(html.includes("owner-calm-layout.css?v=20261113-rh1"));
 assert(css.includes(".psr-breadth-bar")&&css.includes(".psr-scenario-drawer"));
 assert(css.includes("prefers-reduced-motion:reduce"));
});


test("Europe theme tracks 12 exact EUR/DKK listings without stealing a US ADR",()=>{
 const eu=MARKET_THEMES.find(x=>x.id==="europe");
 assert.equal(eu?.tickers.length,12);
 for(const t of ["ASML.AS","ADYEN.AS","SAP.DE","IFX.DE","AIR.PA","TTE.PA","MC.PA","SU.PA","NOVO-B.CO"])
  assert(eu.tickers.includes(t),t);
 assert(!eu.tickers.includes("ASML"));
 assert.equal(THEME_ICON_NAMES.europe,"globe");
 assert.equal(THEME_ICON_NAMES.ai,"cpu");
 for(const name of MARKET_THEMES.map(x=>x.id))assert(THEME_ICON_NAMES[name],name);
 for(const sc of SCENARIOS)assert.equal(sc.impact.europe,"unknown","Never fabricate macro pressure for unresearched EU sector");
});
test("regional data charts compare only same-session share changes and keep EUR/DKK separate from US",()=>{
 const map=new Map([
  ["ASML.AS",{close:1030,day:3.1,currency:"EUR",basis:"Exchange close",session:"2026-11-12"}],
  ["NOVO-B.CO",{close:350,day:-1.5,currency:"DKK",basis:"Exchange close",session:"2026-11-12"}],
  ["SAP.DE",{close:220,day:1,currency:"EUR",basis:"Exchange close",session:"2026-11-11"}],
  ["SPCX",{close:139.94,day:0.136,currency:"USD",basis:"Exchange close",session:"2026-11-12"}],
  ["TSLA",{close:397.45,day:1.69,currency:"USD",basis:"Exchange close",session:"2026-11-12"}],
  ["BTC",{close:99999,day:30,currency:"USD",basis:"BTC UTC daily sample",session:"2026-11-12"}],
 ]);
 const us=summarizeRegionalCloses(map,"US"),eu=summarizeRegionalCloses(map,"EU");
 assert.deepEqual([us.observed,us.up,us.down,us.flat],[2,2,0,0]);
 assert.deepEqual([eu.observed,eu.up,eu.down,eu.flat],[2,1,1,0]);
 assert.deepEqual(eu.leaders.map(x=>x.ticker),["ASML.AS","NOVO-B.CO"]);
 assert.equal(us.leaders[0].ticker,"TSLA");
 assert.equal(summarizeRegionalCloses(new Map(),"EU").session,null);
 const js=read("owner-radar-workspace.mjs");
 assert(js.includes('loadBluebellyStockCoverage().then'));
 assert(js.includes("renderSnapshot()"));
 assert(js.includes("psr-regional-data"));
 assert(js.includes("psr-movers-panel"));
});

test("Bluebelly cross-site stock feed accepts only fixed 25 US + 12 EU source-dated research identities",()=>{
 const us=["NVDA","AMD","AAPL","MSFT","AMZN","GOOGL","META","TSLA","AVGO","MU","ORCL","CRWV","SPCX",
  "ADBE","CI","CVS","CF","XOM","CVX","GRAB","BWXT","OKLO","SMR","PWR","ENPH"];
 const euro=["ASML.AS","ADYEN.AS","SAP.DE","SIE.DE","RHM.DE","IFX.DE","AIR.PA","TTE.PA","MC.PA","SU.PA","OR.PA","NOVO-B.CO"];
 const rows=[...us,...euro].map((ticker,i)=>{
  const region=i<25?"US":"EU",ext=ticker.split(".")[1];
  const currency=region==="US"?"USD":ext==="CO"?"DKK":"EUR";
  const timeZone=region==="US"?"America/New_York":ext==="CO"?"Europe/Copenhagen":
   ext==="DE"?"Europe/Berlin":ext==="PA"?"Europe/Paris":"Europe/Amsterdam";
  return {ticker,company:ticker,region,currency,timeZone,
   status:"MONITORED_UNAVAILABLE",price:null,changePct:null,asOf:null,sourceUrl:null};
 });
 const ready={...rows[0],status:"SOURCE_DATED",asOf:"2026-11-12",price:160,
  changePct:1.3,sourceUrl:"https://www.nasdaq.com/market-activity/stocks/nvda/historical"};
 rows[0]=ready;
 const doc={contractVersion:"bluebelly-equity-coverage/1",source:"Bluebelly public market monitor",
  coverage:{tracked:37,US:25,EU:12,sourceDated:1,unavailable:36},rows};
 const now=new Date("2026-11-13T03:00:00Z");
 const v=validateBluebellyStockCoverage(doc,now);
 assert(v);
 assert.equal(v.US.dated,1);
 assert.equal(v.EU.tracked,12);
 assert.equal(v.rows.find(x=>x.ticker==="NVDA").price,160);
 assert.equal(validateBluebellyStockCoverage({...doc,rows:rows.map(x=>x.ticker==="ASML.AS"?{...x,currency:"USD"}:x)},now),null);
 assert.equal(validateBluebellyStockCoverage({...doc,rows:[...rows,{...rows[0]}]},now),null);
 assert.equal(validateBluebellyStockCoverage({...doc,rows:rows.map(x=>x.ticker==="NVDA"?{...x,sourceUrl:"https://evil.invalid/foo"}:x)},now),null);
 assert.equal(validateBluebellyStockCoverage(doc,new Date("2026-12-01T03:00:00Z")),null);
 const js=read("owner-bluebelly-stocks.mjs");
 assert(!/brokerQuantity|service_role|sb_secret_|owner_user_id|\.insert\(|\.update\(/i.test(js));
});

test("opportunity research appears before the market pulse without expanding advanced research",()=>{
 const radar=read("owner-radar-workspace.mjs");
 const terminal=read("owner-opportunity-terminal.mjs");
 assert(radar.includes('renderOpportunityLensSummary({id:"ps-home-opportunity-lenses",compact:true})'));
 assert(radar.includes('workspace.prepend(quick,reviewStrip,opportunityOverview,snapshot,section'));
 assert(terminal.includes('if(!home)shell.append(renderOpportunityLensSummary({id:"ps-ideas-opportunity-lenses",compact:false}))'));
 assert(terminal.includes("ADDITIONAL_OPPORTUNITIES"));
 assert(radar.includes('for(const original of originals){if(original!==topPicks)legacy.append(original);}'));
});
