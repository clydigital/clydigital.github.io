import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {OPPORTUNITIES,OPPORTUNITY_CONTRACT,visibleOpportunities,opportunityState,CASH_QUALITY_PROFILES,stressValuation,TSLA_SPACEX_EVENT,illustrativeSpaceXRatio,SPCX_STANDALONE,spcxOwnerCashHurdle,validatePriorityCloses} from "../owner-opportunity-terminal.mjs";
const read=name=>readFileSync(new URL("../"+name,import.meta.url),"utf8");
const now=new Date("2026-11-12T02:00:00Z");
test("opportunities are explicit research candidates, not orders or fabricated price triggers",()=>{
 assert.equal(OPPORTUNITY_CONTRACT,"power-stack-guided-opportunities/1");
 assert.equal(visibleOpportunities("SHORT").length,3);
 assert(visibleOpportunities("SHORT").every(x=>x.direction==="SHORT"&&x.kind==="TRADE"));
 assert(visibleOpportunities("INVESTMENT").every(x=>x.kind==="INVESTMENT"));
 assert(visibleOpportunities("TRADE").every(x=>x.kind==="TRADE"));
 assert(OPPORTUNITIES.some(x=>x.ticker==="TLT"&&x.direction==="SHORT"));
 assert(OPPORTUNITIES.some(x=>x.ticker==="TLT"&&x.direction==="LONG"));
 for(const name of ["ADBE","CI","CVS","FLEX","JBL"]){
  const rows=OPPORTUNITIES.filter(x=>x.ticker===name&&x.direction==="LONG");
  assert.equal(rows.length,1,"one source-attributed long candidate for "+name);
  assert(rows[0].valuationNote.includes("11 Nov")||rows[0].valuationNote.includes("11 Nov close"),"dated issuer comparison "+name);
  assert(rows[0].source.startsWith("https://"));
  assert(!/BUY NOW|ORDER READY/i.test(rows[0].thesis+" "+rows[0].trigger));
 }
 for(const x of OPPORTUNITIES){
  for(const k of ["ticker","thesis","trigger","invalidation","risk","catalyst","reviewed","source"])assert(x[k],x.id+"/"+k);
  assert(x.source.startsWith("https://"));
  assert(!/guaranteed|ready to trade|buy now/i.test(x.thesis+" "+x.trigger));
 }
});
test("delayed prices never become a chart or borrow confirmation",()=>{
 const idea=OPPORTUNITIES[0],q={close:50,currency:"USD",session:"2026-11-11"};
 const state=opportunityState(idea,q,now);
 assert.equal(state.status,"WAIT FOR CONFIRMATION");
 assert.equal(state.price,50);
 assert.equal(opportunityState(idea,{...q,session:"2026-10-20"},now).price,null);
 assert.equal(opportunityState(idea,{...q,close:null},now).price,null);
 assert.equal(opportunityState(idea,{...q,session:"2026-11-14"},now).price,null);
});
test("short ideas expire quickly; old cards never imply a live actionable trade",()=>{
 const idea=OPPORTUNITIES[0];
 const out=opportunityState(idea,{close:50,session:"2026-11-19"},new Date("2026-11-20T02:00:00Z"));
 assert.equal(out.status,"REVIEW EXPIRED");
 assert.equal(out.price,null);
 assert.equal(opportunityState(OPPORTUNITIES.find(x=>x.id==="cf-long"),null,new Date("2026-11-20T02:00:00Z")).current,true);
});
test("the new terminal remains behind the existing owner gate and separates existing saved ideas",()=>{
 const home=read("owner-decision-desk.mjs"),tracker=read("owner-ideas-tracker.mjs"),gate=read("auth-gate.mjs");
 assert(home.includes('renderOpportunityTerminal(opportunityHost,state.priceMap,{mode:"home",ownerResearch:state.ideaRows})'));
 assert(tracker.includes('renderOpportunityTerminal($("psi-opportunity-mount"),state.prices,{mode:"ideas",ownerResearch:state.ideas})'));
 assert(tracker.includes('value="TRADE">Tracked trades'));
 assert(tracker.includes('value="INVESTMENT">Tracked investments'));
 assert(gate.indexOf('const user=await authenticate()')<gate.indexOf('if(PAGE==="index")'));
 for(const file of ["index.html","ideas.html"])assert(read(file).includes('owner-opportunity-terminal.css?v=20261112-tech2'));
 const module=read("owner-opportunity-terminal.mjs");
 assert(!/sb_secret_|service_role|@gmail\.com|owner_user_id|brokerQuantity|cash_delta/i.test(module));
 assert(module.includes('No trade tickets or broker orders are created'));
 assert(module.includes('scanMarketOpportunities(prices)'));
 assert(module.includes('Fresh macro / fundamental admission not verified'));
});

test("cash-flow profiles use filing periods, do not invent missing capex, and show no issuer FCF for Cigna",()=>{
 const rows=CASH_QUALITY_PROFILES;
 assert.deepEqual(Object.keys(rows).sort(),["ADBE","CF","CI","CVS"].sort());
 assert.equal(rows.ADBE.cashFCFBN,Number((rows.ADBE.cfoBN-rows.ADBE.capexBN).toFixed(3)));
 assert.equal(rows.ADBE.economicFCFProxyBN,Number((rows.ADBE.cashFCFBN-rows.ADBE.sbcBN).toFixed(3)));
 assert.equal(rows.CVS.cashFCFBN,Number((rows.CVS.cfoBN-rows.CVS.capexBN).toFixed(3)));
 assert.equal(rows.CI.capexBN,null);
 assert.equal(rows.CI.cashFCFBN,null);
 assert.equal(rows.CI.fcfDefinition,"NOT_VERIFIED");
 assert.equal(rows.CF.fcfDefinition,"ISSUER_DEFINED_TTM_INCLUDES_JV");
 assert.equal(rows.CF.stress,undefined);
 for(const [ticker,x] of Object.entries(rows)){
  assert.match(x.filing,/^https:\/\//,ticker);
  assert(x.reject.length>30,ticker);
  assert(!Object.hasOwn(x,"positionQuantity"));
 }
});
test("static bear/baseline/bull stresses are fully transparent, dated and never an entry rule",()=>{
 const expected={ADBE:[156.64,244.75,349.99],CI:[220.32,306,403.92],CVS:[52.48,90.2,117.26]};
 for(const [ticker,prices] of Object.entries(expected)){
  const item=CASH_QUALITY_PROFILES[ticker],spec=item.stress;
  assert.equal(spec.referenceSession,"2026-11-11");
  const rows=stressValuation(spec);
  assert.deepEqual(rows.map(v=>v.impliedUSD),prices);
  assert(rows[0].changePct<0);
  assert(rows.every(x=>x.peMultiple>0));
  assert(spec.cases.every(x=>!x.some(v=>typeof v==="string"&&/probability|order|buy now/i.test(v))));
 }
 assert.deepEqual(stressValuation({referenceCloseUSD:0,baseEPS:12,cases:[["A",1,10],["B",1,11],["C",1,12]]}),[]);
 const module=read("owner-opportunity-terminal.mjs");
 assert(module.includes("not consensus, probabilities, fair values, trade targets or a live quote"));
 assert(module.includes("CASH_QUALITY_PROFILES[item.ticker]"));
});

test("Tesla SpaceX watch is verified company event, with no signed terms or invented probability",()=>{
 const e=TSLA_SPACEX_EVENT;
 assert.equal(e.status,"SPECIAL_COMMITTEES_AND_NEGOTIATIONS_NO_SIGNED_AGREEMENT");
 assert.equal(e.negotiatedExchangeRatio,null);assert.equal(e.dealProbability,null);
 assert.equal(e.closingDate,null);assert.equal(e.cashConsideration,null);
 assert.deepEqual(e.parties,["TSLA","SPCX"]);
 assert(e.filings.some(x=>x.url.includes("tsla-20260930.htm")));
 assert(e.filings.some(x=>x.url.includes("spcx-20260930.htm")));
 assert(!Object.hasOwn(e,"orderSignal"));assert(!Object.hasOwn(e,"brokerQuantity"));
 const module=read("owner-opportunity-terminal.mjs");
 assert(module.includes("renderMergerWatch(prices)"));
 assert(!module.includes("DEAL CONFIRMED"));
});
test("unnegotiated all-stock ratio examples require same-date USD closed prices",()=>{
 const a={close:390.84,session:"2026-11-11",currency:"USD"},b={close:139.75,session:"2026-11-11",currency:"USD"};
 const v=illustrativeSpaceXRatio(a,b);
 assert.equal(v.session,"2026-11-11");
 assert.deepEqual(v.cases.map(x=>x.assumedPremiumPct),[0,20,35]);
 assert.deepEqual(v.cases.map(x=>x.illustrativeSPCXSharesPerTSLAShare),[2.797,3.356,3.776]);
 assert.deepEqual(v.cases.map(x=>x.hypotheticalTeslaOfferValueUSD),[390.84,469.01,527.63]);
 assert.equal(illustrativeSpaceXRatio({...a,session:"2026-11-12"},b),null);
 assert.equal(illustrativeSpaceXRatio({...a,currency:"MYR"},b),null);
 assert.equal(illustrativeSpaceXRatio({...a,close:null},b),null);
 assert.equal(illustrativeSpaceXRatio(a,null),null);
 assert.equal(illustrativeSpaceXRatio({...a,session:"2026-12-99"},b),null);
});

test("SPCX standalone valuations show cash hurdle not buy triggers",()=>{
 const x=SPCX_STANDALONE,calc=spcxOwnerCashHurdle();
 assert.equal(x.quoteSession,"2026-11-11");
 assert.equal(x.historicalCloseUSD,139.75);
 assert.equal(calc.trailingEquitySales,59.3);
 assert.equal(calc.q3AnnualizedEquitySales,32.59);
 assert.equal(calc.connectivityOperatingIncomeSharePct,84.81);
 assert.equal(calc.nineMonthSimpleFCFBN,-34.972);
 assert.equal(calc.required5PctAnnualOwnerFCFBN,95);
 const row=OPPORTUNITIES.find(o=>o.id==="spcx-long");
 assert.equal(row?.ticker,"SPCX");
 assert.equal(row?.kind,"INVESTMENT");
 assert(!/buy now|order ready|trade ready/i.test(row.thesis+" "+row.trigger+" "+row.valuationNote));
 assert(row.source.startsWith("https://www.sec.gov/"));
 assert.equal(spcxOwnerCashHurdle({...x,equityMarketCapTrillionUSD:0}),null);
});
test("creator commentary is source attributed, no fabricated source completion or automatic merger terms",()=>{
 const views=SPCX_STANDALONE.creatorViews;
 assert(views.some(v=>v.who==="Meet Kevin"&&v.view.includes("$132")));
 assert(views.some(v=>v.who.includes("Wall Street Truth Bombs")&&v.proof.includes("DESCRIPTION ONLY")));
 assert(views.some(v=>v.who==="Stock Moe"&&v.proof.includes("EXTERNAL")));
 assert(views.some(v=>v.who==="Stocks with Josh"&&v.proof.includes("third-party")));
 assert(views.every(v=>/^https:\/\//.test(v.source)));
 assert(views.every(v=>!v.view.includes("MERGER SIGNED")));
 assert(views.every(v=>!v.view.includes("automatic buy")));
 const s=read("owner-opportunity-terminal.mjs");
 assert(s.includes("8 Dec nominal 180-day deadline is an eligibility review"));
 assert(s.includes("No new transcript credits or creator consumed-video ledger changes"));
 assert(s.includes("NEED_250_COMPLETED_SESSIONS")===false);
});

test("12 Nov close overlay is source-qualified and never reuses previous-day technical indicators",()=>{
 const raw=JSON.parse(read("market-close-overlay.json"));
 const v=validatePriorityCloses(raw,new Date("2026-11-13T00:00:00Z"));
 assert.equal(v?.session,"2026-11-12");
 assert(v.rows.length>=25);
 assert.equal(v.rows.find(x=>x.ticker==="SPCX")?.close,139.94);
 assert.equal(v.rows.find(x=>x.ticker==="TSLA")?.close,397.45);
 assert.equal(v.rows.find(x=>x.ticker==="NVDA")?.close,166.19);
 assert.equal(v.rows.find(x=>x.ticker==="ADBE")?.close,238.54);
 assert(v.rows.every(x=>x.currency==="USD"&&x.technicalStatus==="NOT_RECALCULATED_IN_THIS_OVERLAY"));
 assert.equal(validatePriorityCloses({...raw,session:"2026-11-11"},new Date("2026-11-13T00:00:00Z")),null);
 assert.equal(validatePriorityCloses({...raw,source:"not vetted"},new Date("2026-11-13T00:00:00Z")),null);
 assert.equal(validatePriorityCloses(raw,new Date("2026-11-20T00:00:00Z")),null);
 assert.equal(validatePriorityCloses({...raw,rows:[{...raw.rows[0],close:0},...raw.rows.slice(1)]},new Date("2026-11-13T00:00:00Z")),null);
 assert(!JSON.stringify(raw).match(/owner_user_id|holdingAmount|brokerQuantity|access_token|refresh_token/i));
 const file=read("owner-opportunity-terminal.mjs");
 assert(file.includes('fetch("./market-close-overlay.json",{cache:"no-store"})'));
 assert(file.includes('technical:null,basis:"Finnhub regular-session close'));
 assert(file.includes("mergerMount.replaceChildren(renderMergerWatch(cardPrices))"));
 assert(file.includes("node.dataset.kind=item.kind;node.dataset.direction=item.direction;"));
 const source=JSON.parse(read("market-prices.json"));
 assert.equal(source.rows.find(x=>x.ticker==="SPCX").sessionDate,"2026-11-11",
  "full-market technical producer must remain independently dated until the complete OHLC refresh");
});
test("readability layer loads last and keeps high contrast, larger fonts and mobile grid fallback",()=>{
 for(const name of ["index","ideas"]){
  const html=read(name+".html");
  assert(html.includes('owner-legibility-contrast.css?v=20261113-c1'));
  assert(html.indexOf("owner-legibility-contrast.css")>html.indexOf("owner-hybrid-ocean.css"));
 }
 const css=read("owner-legibility-contrast.css");
 assert(css.includes('pso-card[data-kind="TRADE"]'));
 assert(css.includes('pso-card[data-kind="INVESTMENT"]'));
 assert(css.includes("pso-merger-watch"));
 assert(css.includes("pso-spcx-creators"));
 assert(css.includes("pso-close-grid"));
 assert(css.includes("grid-template-columns:repeat(2,minmax(0,1fr))"));
 assert(css.includes("prefers-contrast:more"));
 assert(css.includes("forced-colors:active"));
 const schedule=read("../.github/workflows/power-stack-prices.yml");
 assert(schedule.includes("cron: '35 22 * * 1-5'"));
});
