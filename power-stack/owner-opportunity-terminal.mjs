// Source-dated illustrative opportunity paths, not owner-saved decisions or execution signals.
// Public script contains no account data; authenticated pages render it only after owner access.
// Candidacy never means a verified EMA trigger, approved short locate or funded broker order.
export const OPPORTUNITY_CONTRACT="power-stack-guided-opportunities/1";
import {LENS_CASES,OPPORTUNITY_LENSES,renderOpportunityLensSummary} from "./owner-opportunity-lenses.mjs?v=20261113-lens2";
export const OPPORTUNITY_REVIEW_DATE="2026-11-13";
const LEGACY_OPPORTUNITIES=Object.freeze([
 {id:"crwv-short",ticker:"CRWV",name:"CoreWeave",kind:"TRADE",direction:"SHORT",
  horizon:"2–4 weeks",reviewed:"2026-11-12",
  thesis:"Large AI demand does not yet prove that financing and cash collection are self-sustaining.",
  trigger:"Consider bearish risk only if verified cash receipts and financing conditions weaken while the market rejects a rebound.",
  invalidation:"Materially improving cash conversion and cheaper refinancing undermine the bearish case.",
  risk:"Borrow availability, hard-to-borrow fees, earnings gaps and violent squeezes. A naked short has unbounded theoretical loss.",
  catalyst:"Next independently reported cash-flow, prepayment and interest-expense evidence.",
  source:"https://www.sec.gov/Archives/edgar/data/1769628/000176962826000461/coreweave3q26earningspress.htm"},
 {id:"smh-short",ticker:"SMH",name:"Semiconductor ETF",kind:"TRADE",direction:"SHORT",
  horizon:"3–15 sessions",reviewed:"2026-11-12",
  thesis:"A concentrated semiconductor rebound can fail even when headline indices stay firm; the 11 Nov bounce itself is a counterargument to immediate bearishness.",
  trigger:"Reassess if chip leadership, market breadth and forward earnings deteriorate together across comparable sessions.",
  invalidation:"Sustained chip leadership and improving broad-market participation undermine the bearish thesis.",
  risk:"Strong AI earnings or a squeeze can reverse a short abruptly; a single overbought oscillator is insufficient.",
  catalyst:"Follow-through after the 11 Nov recovery and upcoming semiconductor earnings.",
  source:"https://apnews.com/article/027cd5f4583d1a11c1795150bf065afb"},
 {id:"tlt-short",ticker:"TLT",name:"20+ Year Treasury ETF",kind:"TRADE",direction:"SHORT",
  horizon:"1–3 weeks",reviewed:"2026-11-12",
  thesis:"Hotter-than-expected CPI leaves a tactical bear case for long-duration bonds if actual long yields continue rising.",
  trigger:"Investigate only after confirming an open-session rise in long cash Treasury yields and real rates.",
  invalidation:"Sustained declines in real and nominal long yields undermine the short-duration thesis.",
  risk:"Flight-to-quality can squeeze bond shorts. Borrow, carry and distributions alter ETF short economics.",
  catalyst:"Next matched Treasury cash-session closes, real yields and credit spread readings.",
  source:"https://home.treasury.gov/resource-center/data-chart-center/interest-rates"},
 {id:"cf-long",ticker:"CF",name:"CF Industries",kind:"INVESTMENT",direction:"LONG",
  horizon:"6–18 months",reviewed:"2026-11-12",
  thesis:"Fertiliser cash generation offers an alternative to an AI-led portfolio, but trailing cash yields require cycle normalisation.",
  trigger:"Review normalised free cash flow, gas costs, nitrogen prices and current valuation margin of safety.",
  invalidation:"Lower nitrogen spreads, sustained gas input pressure or weaker adjusted free cash flow weaken the valuation case.",
  risk:"A cyclical stock is not automatically cheap because a backward-looking yield looks high.",
  catalyst:"Next issuer results, nitrogen pricing and gas spreads.",
  source:"https://www.cfindustries.com/newsroom/2026/cf-9m-2026-earnings"},
 {id:"adbe-long",ticker:"ADBE",name:"Adobe",horizon:"6–18 months",thesis:"FY26 Q3 revenue +13% to $6.76bn and CFO $2.52bn alongside concerns that AI may disrupt subscription pricing.",valuationNote:"$237.60 (11 Nov close) / FY26 issuer non-GAAP EPS midpoint $24.475 ≈ 9.7x; not the vendor FY27 forward P/E.",trigger:"Confirm ARR net retention, AI paid monetisation, FY27 estimates, normalized FCF, and the next completed daily EMA retest.",invalidation:"Pricing deterioration or slowing recurring-cash conversion despite stronger AI usage.",risk:"Acquisition effects, non-GAAP SBC addbacks, AI cannibalisation and a still-unverified entry price.",catalyst:"Next full-year results and FY27 earnings/ARR outlook.",source:"https://www.sec.gov/Archives/edgar/data/796343/000079634326000147/adbeex991q326.htm",kind:"INVESTMENT",direction:"LONG",reviewed:"2026-11-13"},
 {id:"ci-long",ticker:"CI",name:"The Cigna Group",horizon:"6–18 months",thesis:"Q3 2026 sales +6% to $73.7bn, but adjusted operating income was nearly flat; value case depends on policy risks being priced.",valuationNote:"$301.45 (11 Nov close) / issuer FY26 adjusted EPS guidance minimum $30.60 ≤ 9.9x if delivered.",trigger:"Verify PBM policy exposure, medical cost ratio, CFO vs adjusted EPS, buybacks and leverage.",invalidation:"Deteriorating claim costs or weaker cash despite higher adjusted EPS.",risk:"YTD CFO $3.28bn vs $3.45bn in prior year and regulatory PBM exposure.",catalyst:"Next segment cost-ratio disclosures and policy deadlines.",source:"https://newsroom.thecignagroup.com/2026-11-05-The-Cigna-Group-Reports-Strong-Third-Quarter-2026-Results%2C-Raises-2026-Outlook",kind:"INVESTMENT",direction:"LONG",reviewed:"2026-11-13"},
 {id:"cvs-long",ticker:"CVS",name:"CVS Health",horizon:"6–18 months",thesis:"Q3 health benefit ratio improved to 91.3% from 92.8%; issuer raised FY26 adjusted EPS guidance to at least $8.20.",valuationNote:"$89.52 (11 Nov close) / issuer FY26 adjusted EPS minimum $8.20 ≤ 10.9x if delivered; adjusted, not GAAP.",trigger:"Verify Aetna pricing and 2027 MBR, debt-adjusted FCF and a true 1D trend/retest.",invalidation:"Claims costs or bad insurance pricing erase margin recovery.",risk:"Prior 2025 GAAP had large goodwill impairment; do not mistake base effects for organic EPS growth.",catalyst:"Next Aetna medical cost, member and 2027 guidance updates.",source:"https://investors.cvshealth.com/news/news-details/2026/CVS-HEALTH-CORPORATION-REPORTS-THIRD-QUARTER-2026-RESULTS-AND-RAISES-FULL-YEAR-2026-GUIDANCE/default.aspx",kind:"INVESTMENT",direction:"LONG",reviewed:"2026-11-13"},
 {id:"flex-long",ticker:"FLEX",name:"Flex",horizon:"6–18 months",thesis:"FY27 Q2 revenue +25% to $8.5bn; quarterly operating cash $501m versus free cash flow $261m; Cloud & Power separation pending.",valuationNote:"$78.97 (11 Nov close) / FY27 pre-spin issuer adjusted EPS midpoint $5.00 ≈ 15.8x, not vendor's other-horizon ~12.5x.",trigger:"Model post-spin earnings, acquisition funding and FCF, plus daily 50/200 EMA recovery; do not chase oscillator extremes.",invalidation:"Separation terms, customer concentration or weaker cash generation undermine the growth valuation.",risk:"Fiscal 2027 guidance expressly excludes planned spin-off effects.",catalyst:"Spin filings and next operating margin/FCF update.",source:"https://investors.flex.com/news/news-details/2026/FLEX-REPORTS-SECOND-QUARTER-FISCAL-2027-RESULTS/default.aspx",kind:"INVESTMENT",direction:"LONG",reviewed:"2026-11-13"},
 {id:"jbl-long",ticker:"JBL",name:"Jabil",horizon:"6–18 months",thesis:"FY26 revenue grew 21% to $36bn with more than $1.5bn in adjusted free cash flow.",valuationNote:"$258.89 (11 Nov close) / FY26 historical core EPS $13.09 ≈ 19.8x; NOT a forward FY27 multiple.",trigger:"Reconcile adjusted-to-GAAP FCF, customer orders and fiscal 2027 EPS guidance; compare against Flex post-spin.",invalidation:"Higher customer concentration and weaker conversion make manufacturing earnings cyclical.",risk:"FY26 results were preliminary/unaudited; no fully sourced FY27 multiple yet.",catalyst:"Fiscal Q1 FY27 results, forecast and cash generation.",source:"https://investors.jabil.com/news/news-details/2026/Jabil-Posts-Fourth-Quarter-and-Fiscal-Year-2026-Results/default.aspx",kind:"INVESTMENT",direction:"LONG",reviewed:"2026-11-13"},
 {id:"spcx-long",ticker:"SPCX",name:"SpaceX Class A",kind:"INVESTMENT",direction:"LONG",
  horizon:"6–24 months",reviewed:"2026-11-13",
  thesis:"Starlink delivers 84.8% of group Q3 operating income while SpaceX SI leads group revenue and capital demand. A strong platform is not an inexpensive share: ~$1.90tn equity value versus $32.04bn vendor TTM sales.",
  valuationNote:"$139.75 (11 Nov close); ~$1.90tn vendor market cap / ~$32.04bn TTM revenue ≈ 59.3x trailing sales; 9M CFO $13.097bn minus capex $48.069bn = −$34.972bn simple cash after capex. Not current quote or a fair-value model.",
  trigger:"Require source-verified 2027 paid compute cash, normalized SI capital returns and Starlink cash margin, executed-versus-committed GPU lease terms and a meaningful entry-value cushion; a creator's $132 reference is not approval.",
  invalidation:"GPU utilisation/collections and AI cash margins undershoot while capex or finance leases compound; Starlink subscriber increases offset by structurally worse ARPU and terminal economics.",
  risk:"SpaceX GPU commitment letter (~$40bn) was not an executed lease in the original Oct 26 filing. AI segment acquisitions inflate growth comparisons; insufficient IPO history for validated EMA200 band. Merger remains unagreed.",
  catalyst:"Definitive GPU lease closing, Q4 and 2027 SI cash collections/Starlink margins, signed Tesla deal terms if any.",
  source:"https://www.sec.gov/Archives/edgar/data/1181412/000162828026066880/spcx-20260930.htm"},
 {id:"tlt-long",ticker:"TLT",name:"20+ Year Treasury ETF",kind:"INVESTMENT",direction:"LONG",
  horizon:"3–12 months",reviewed:"2026-11-12",
  thesis:"Long duration offers upside if inflation and long real yields genuinely decline; it is not an automatic buy after one hot CPI surprise.",
  trigger:"Review inflation, matched long real yields, Treasury prices and intermediate-duration alternatives IEF/VGIT.",
  invalidation:"Further long-yield increases and persistent inflation undermine the duration thesis.",
  risk:"High duration creates outsized capital losses when long yields rise, even with a sizeable distribution yield.",
  catalyst:"Fresh CPI and long-real-yield observations, plus the next Treasury cash sessions.",
  source:"https://www.ishares.com/us/products/239454/ishares-20-year-treasury-bond-etf"},
 {id:"googl-long",ticker:"GOOGL",name:"Alphabet",kind:"INVESTMENT",direction:"LONG",
  horizon:"6–24 months",reviewed:"2026-11-12",
  thesis:"Search and Cloud economics support long-run growth, but AI capex consumes cash and the share price must justify expected earnings.",
  trigger:"Review refreshed forward earnings, cash capex, free cash flow and the price paid for growth.",
  invalidation:"Weakening Cloud margins, sustained lower FCF conversion, or materially adverse estimate revisions challenge the thesis.",
  risk:"A strong business can still be an expensive investment when capital spending and expectations are high.",
  catalyst:"Next issuer earnings, capex guidance, FCF and EPS estimate revisions.",
  source:"https://www.sec.gov/Archives/edgar/data/1652044/000165204426000080/googexhibit991q32026.htm"}
]);
const ADDITIONAL_OPPORTUNITIES=LENS_CASES.filter(x=>
 !LEGACY_OPPORTUNITIES.some(existing=>existing.ticker===x.ticker)).map(x=>({
 id:"lens-"+x.ticker.toLowerCase(),ticker:x.ticker,name:x.name,
 kind:"INVESTMENT",direction:"LONG",horizon:"6–12 months",reviewed:x.evidenceAsOf,
 lens:x.lens,thesis:x.why,trigger:x.test,invalidation:x.risk,
 risk:x.risk,catalyst:"Review by "+x.reviewBy,source:x.source,
 decisionLabel:x.action,reviewBy:x.reviewBy
}));
export const OPPORTUNITIES=Object.freeze([...LEGACY_OPPORTUNITIES,...ADDITIONAL_OPPORTUNITIES]);
/** Dated issuer/public filing facts, never personal positions or trade readiness. */
export const CASH_QUALITY_PROFILES=Object.freeze({
 "ADBE": {
  "period": "9M FY26",
  "cfoBN": 7.646,
  "capexBN": 0.18,
  "sbcBN": 1.582,
  "cashFCFBN": 7.466,
 "fcfDefinition": "ANALYST_SIMPLE_CFO_MINUS_CAPEX",
  "economicFCFProxyBN": 5.884,
  "quality": "Operating cash flow less property/equipment purchases; SBC subtraction is a conservative analyst proxy, not GAAP nor issuer FCF. Semrush $1.56bn acquisition cash was excluded from simple FCF.",
  "reject": "Check paid AI ARR, renewal pricing, repurchase efficiency vs dilution, FY27 guide and multi-quarter cash durability.",
  "filing": "https://www.sec.gov/Archives/edgar/data/796343/000079634326000156/adbe-20260828.htm",
  "stress": {
   "referenceCloseUSD": 237.6,
   "referenceSession": "2026-11-11",
   "baseEPS": 24.475,
   "basis": "FY26 issuer non-GAAP EPS midpoint",
   "cases": [
    [
     "Bear",
     0.8,
     8
    ],
    [
     "Unchanged EPS",
     1,
     10
    ],
    [
     "Bull",
     1.1,
     13
    ]
   ]
  }
 },
 "CI": {
  "period": "9M FY26",
  "cfoBN": 3.281,
  "capexBN": null,
  "sbcBN": null,
  "cashFCFBN": null,
 "fcfDefinition": "NOT_VERIFIED",
  "quality": "CFO declined from $3.452bn in 9M FY25; 9M adjusted income $6.216bn, CFO/adjusted-income proxy ≈53% BEFORE capex. Cash outflows in PBM payables and receivables make timing significant; capex not sourced in this pass.",
  "reject": "Reconcile receivables, PBM pharmacy payables, actual capex and adjusted earnings to distributable cash; PBM rule sensitivity.",
  "filing": "https://www.sec.gov/Archives/edgar/data/1739940/000173994026000071/ci-20260930.htm",
  "stress": {
   "referenceCloseUSD": 301.45,
   "referenceSession": "2026-11-11",
   "baseEPS": 30.6,
   "basis": "FY26 issuer adjusted EPS minimum",
   "cases": [
    [
     "Bear",
     0.9,
     8
    ],
    [
     "Guidance floor",
     1,
     10
    ],
    [
     "Bull",
     1.1,
     12
    ]
   ]
  }
 },
 "CVS": {
  "period": "9M FY26",
  "cfoBN": 15.318,
  "capexBN": 2.357,
  "sbcBN": 0.61,
  "cashFCFBN": 12.961,
 "fcfDefinition": "ANALYST_SIMPLE_CFO_MINUS_CAPEX",
  "quality": "Simple CFO minus capex, not all distributable to parent. 9M CFO $15.318bn versus $7.249bn prior year includes timing of receipts/payments and favorable benefit trend; net operating-assets/liabilities +$3.556bn vs -$0.453bn prior year. FY26 guided capex $3.1bn–$3.3bn.",
  "reject": "Stress 2027 plan pricing, MBR, cash at restricted insurance entities, reserve developments and debt; refuse to annualize 9M CFO.",
  "filing": "https://www.sec.gov/Archives/edgar/data/64803/000006480326000108/cvs-20260930.htm",
  "stress": {
   "referenceCloseUSD": 89.52,
   "referenceSession": "2026-11-11",
   "baseEPS": 8.2,
   "basis": "FY26 issuer adjusted EPS minimum",
   "cases": [
    [
     "Bear",
     0.8,
     8
    ],
    [
     "Guidance floor",
     1,
     11
    ],
    [
     "Bull",
     1.1,
     13
    ]
   ]
  }
 },
 "CF": {
  "period": "TTM Sep FY26",
  "cfoBN": 3.08,
  "capexBN": null,
  "sbcBN": null,
  "cashFCFBN": 2.03,
 "fcfDefinition": "ISSUER_DEFINED_TTM_INCLUDES_JV",
  "quality": "Issuer-defined FCF includes Blue Point One JV cash flows. $170m litigation settlement boosts 9M earnings. TTM FCF must be stressed across nitrogen spreads, gas input, new JV capex and share count; not comparable to cash flow of healthcare issuers.",
  "reject": "Normalize 2027 nitrogen-price/gas conditions, strip one-off settlement and adjust JV construction flows before estimating margin of safety.",
  "filing": "https://www.cfindustries.com/newsroom/2026/cf-9m-2026-earnings"
 }
});
export function stressValuation(spec){
 if(!spec||!Number.isFinite(spec.referenceCloseUSD)||spec.referenceCloseUSD<=0||!Number.isFinite(spec.baseEPS)||spec.baseEPS<=0||!Array.isArray(spec.cases)||spec.cases.length!==3)return [];
 return spec.cases.map(([label,haircut,pe])=>{
  if(typeof label!=="string"||!Number.isFinite(haircut)||haircut<=0||!Number.isFinite(pe)||pe<=0)return null;
  const earnings=spec.baseEPS*haircut,implied=earnings*pe;
  return {label,epsUSD:Math.round(earnings*100)/100,peMultiple:pe,impliedUSD:Math.round(implied*100)/100,changePct:Math.round((implied/spec.referenceCloseUSD-1)*1000)/10};
 }).filter(Boolean);
}
/** Public dated event facts only; no model-approved deal terms or execution. */
export const TSLA_SPACEX_EVENT=Object.freeze({
 id:"tesla-spacex-merger",reviewed:"2026-11-13",
 status:"SPECIAL_COMMITTEES_AND_NEGOTIATIONS_NO_SIGNED_AGREEMENT",
 dealStructure:"NOT_DISCLOSED",cashConsideration:null,negotiatedExchangeRatio:null,dealProbability:null,closingDate:null,
 parties:["TSLA","SPCX"],announcementWindow:"REPORTED_POSSIBLE_DECEMBER_NOT_CONFIRMED",
 filingFacts:[
  "Tesla 2026 Q3 10-Q confirms an independent special committee; no assurance of a deal.",
  "Tesla invested $2.00bn for less than 1% SpaceX ownership and sold $626m of Megapack products to SpaceX in 9M 2026.",
  "9M 2026 cash operations less capex: Tesla $14.90bn−$13.01bn=+$1.89bn; SpaceX $13.097bn−$48.069bn=−$34.972bn."
 ],
 processRisks:[
  "Musk-affiliated companies: independent negotiation, fairness, voting rights and approval risk.",
  "A high-premium stock deal can dilute existing SPCX shareholders; zero-premium terms may fail the Tesla shareholder vote.",
  "SpaceX IPO liquidity does not prove that 2026 compute and infrastructure expenditure is self-funding.",
  "Existing Tesla SpaceX stake and Megapack related-party sales must be eliminated on consolidation."
 ],
 filings:[
  {label:"Tesla 2026 Q3 filing",url:"https://www.sec.gov/Archives/edgar/data/1318605/000162828026066775/tsla-20260930.htm"},
  {label:"SpaceX 2026 Q3 filing",url:"https://www.sec.gov/Archives/edgar/data/1181412/000162828026066880/spcx-20260930.htm"},
  {label:"12 Nov Reuters — Bloomberg talk progress",url:"https://www.reuters.com/legal/transactional/spacex-tesla-merger-talks-progress-bloomberg-news-reports-2026-11-12/"}
 ]
});
/** Independent SpaceX investment valuation and attributed creator views; never trade triggers. */
export const SPCX_STANDALONE=Object.freeze({
 reviewed:"2026-11-13",quoteSession:"2026-11-11",historicalCloseUSD:139.75,
 equityMarketCapTrillionUSD:1.90,ttmRevenueBN:32.04,q3RevenueBN:14.575,
 q3IncomeBN:2.791,connectivityQ3OperatingIncomeBN:2.367,
 nineMonthCfoBN:13.097,nineMonthCapexBN:48.069,
 leaseStatus:"BINDING_COMMITMENT_LETTER_NOT_EXECUTED_FULL_DRAW",
 issuer:"https://www.sec.gov/Archives/edgar/data/1181412/000162828026066880/spcx-20260930.htm",
 leaseSource:"https://www.sec.gov/Archives/edgar/data/1181412/000110465926118614/tm2628247d1_8k.htm",
 creatorViews:[
  {who:"Meet Kevin",date:"9 Nov",proof:"THIRD-PARTY EXCERPT — no full native transcript",
   view:"Bullish on SPCX and describes roughly $132 as an attractive entry; not an issuer valuation or Power Stack entry approval.",
   source:"https://www.tuberank.app/prediction/6b3b0e23-1b03-449f-b84f-51cf6ec809e5"},
  {who:"Meet Kevin",date:"4 Nov",proof:"THIRD-PARTY EXCERPT — conditional",
   view:"Favors a possible Tesla premium over SpaceX standalone only IF a merger occurs; no binding premium exists.",
   source:"https://www.tuberank.app/video/9853037a-b495-4f90-b073-aafe6cb1e4be"},
  {who:"Wall Street Truth Bombs / Mark Malek",date:"6 Jul",proof:"ORIGINAL VIDEO METADATA/DESCRIPTION ONLY",
   view:"Warns that index inclusion may occur after institutional front-running and raises starting-valuation risk; not a fresh merger claim.",
   source:"https://www.youtube.com/watch?v=CTrO20eqXQQ"},
  {who:"Stock Moe",date:"9 Nov",proof:"EXTERNAL discovery · third-party excerpt · not enrolled in creator sweep",
   view:"Conditional 2031 $690 bull thesis but near-term bearish chart; discussing December 8 lockup is not proof of 800m shares sold.",
   source:"https://www.tuberank.app/video/11b9938c-448d-4bbc-b424-b75ef2bc5ce4"},
  {who:"Stocks with Josh",date:"7 Nov",proof:"EXTERNAL discovery · third-party summary only",
   view:"Conditional ~$113 short-horizon technical downside; not a fair-value model and not 200 EMA history.",
   source:"https://stocktuber.com/stocks/spcx"},
  {who:"FX Evolution / TraderNick / Traders Reality",date:"9–11 Nov",proof:"MACRO-ONLY CONTEXT, not SPCX video confirmation",
   view:"Disagree about the tech rebound and interest-rate absorption; none provides a newly verified SpaceX entry or deal ratio.",
   source:"https://app.notion.com/p/416519b67a94812daf00d0afceda1fee"}
 ]
});
export function spcxOwnerCashHurdle(data=SPCX_STANDALONE){
 if(!(data.equityMarketCapTrillionUSD>0)||!(data.ttmRevenueBN>0)||!(data.q3RevenueBN>0)||!(data.q3IncomeBN>0))return null;
 return {trailingEquitySales:Math.round(data.equityMarketCapTrillionUSD*100000/data.ttmRevenueBN)/100,
  q3AnnualizedEquitySales:Math.round(data.equityMarketCapTrillionUSD*100000/(data.q3RevenueBN*4))/100,
  connectivityOperatingIncomeSharePct:Math.round(10000*data.connectivityQ3OperatingIncomeBN/data.q3IncomeBN)/100,
  required3PctAnnualOwnerFCFBN:Math.round(data.equityMarketCapTrillionUSD*1000*.03*100)/100,
  required5PctAnnualOwnerFCFBN:Math.round(data.equityMarketCapTrillionUSD*1000*.05*100)/100,
  nineMonthSimpleFCFBN:Math.round((data.nineMonthCfoBN-data.nineMonthCapexBN)*1000)/1000};
}
/** Illustrative parity/premium tender exchange ratio only if both vetted daily quotes share a session. */
export function illustrativeSpaceXRatio(tslaQuote,spcxQuote){
 const a=tslaQuote,b=spcxQuote;
 if(!a||!b||!Number.isFinite(a.close)||!Number.isFinite(b.close)||a.close<=0||b.close<=0||
   !/^20\d{2}-\d{2}-\d{2}$/.test(String(a.session||""))||a.session!==b.session||
   a.currency!=="USD"||b.currency!=="USD")return null;
 const parity=a.close/b.close;
 return {session:a.session,teslaClose:a.close,spaceXClose:b.close,
  cases:[0,0.2,0.35].map(premium=>({
   assumedPremiumPct:Math.round(premium*100),
   illustrativeSPCXSharesPerTSLAShare:Math.round(parity*(1+premium)*1000)/1000,
   hypotheticalTeslaOfferValueUSD:Math.round(a.close*(1+premium)*100)/100
  })),
  caution:"No merger terms have been announced. Share classes, cash consideration, fractional shares, deal repricing and closing risk are unmodeled; scenarios are NOT a trading spread or payoff."};
}
function renderMergerWatch(prices){
 const e=TSLA_SPACEX_EVENT,section=make("section","pso-merger-watch");
 section.id="ps-tsla-spacex-watch";section.setAttribute("aria-label","Tesla SpaceX merger research");
 section.append(make("p","pso-overline","SPECIAL SITUATION · NO AGREEMENT"));
 section.append(make("h3",null,"Tesla × SpaceX — terms, not rumours, decide the trade"));
 section.append(make("p","pso-merger-lead",
  "13 Nov watch: independent Tesla special committee documented; 12 Nov Bloomberg/Reuters reports talks progressing and a possible December announcement. No final consideration, share exchange ratio, premium, vote or completion date is confirmed."));
 const ratios=illustrativeSpaceXRatio(prices?.get("TSLA"),prices?.get("SPCX"));
 const status=make("p","pso-merger-quote",ratios?
  "Historical matching cash-equity closes · "+ratios.session+" · TSLA $"+ratios.teslaClose.toFixed(2)+
   " / SPCX $"+ratios.spaceXClose.toFixed(2)+". Neither is a live deal quotation.":
  "Both qualified, matching completed-session TSLA and SPCX equity quotes are required; no implied terms displayed.");
 section.append(status);
 if(ratios){
  const examples=make("div","pso-merger-ratios");
  for(const c of ratios.cases){
   const x=make("div","pso-merger-ratio");
   x.append(make("strong",null,c.assumedPremiumPct+"% hypothetical Tesla premium"));
   x.append(make("span",null,c.illustrativeSPCXSharesPerTSLAShare.toFixed(3)+" SPCX shares / TSLA share"));
   x.append(make("small",null,"$"+c.hypotheticalTeslaOfferValueUSD.toFixed(2)+" historic offer equivalent"));
   examples.append(x);
  }
  section.append(examples);
 }
 section.append(make("p","pso-merger-caution",
  "Illustrative all-stock ratios only, not negotiated terms, arbitrage signals or probability-weighted upside. SpaceX Class B voting rights mean economic exchange value is NOT voting-control equivalence."));
 const details=make("details","pso-details");
 details.append(make("summary",null,"Source evidence, cash-burn risk and first rejection"));
 for(const q of e.filingFacts)details.append(make("p",null,"Filed: "+q));
 for(const q of e.processRisks)details.append(make("p",null,"Risk: "+q));
 details.append(make("p",null,"Next proof: both special committees' definitive terms; exchange ratio/price; signed agreement; Tesla holder vote standard; fairness and Musk voting-control impact; cash budget / capex."));
 for(const q of e.filings){
  const a=make("a",null,q.label);a.href=q.url;a.target="_blank";a.rel="noopener noreferrer";
  details.append(a,make("span",null," · "));
 }
 section.append(details);
 const standalone=SPCX_STANDALONE,calc=spcxOwnerCashHurdle(),analysis=make("details","pso-details pso-spcx-research");
 analysis.append(make("summary",null,"SPCX standalone: why Starlink earnings are not yet free cash"));
 analysis.append(make("p",null,
  "Q3 Starlink/Connectivity supplies "+calc.connectivityOperatingIncomeSharePct.toFixed(1)+"% of SpaceX operating income; AI/Super Intelligence led revenue but remains capital intensive."));
 analysis.append(make("p",null,
  "$"+standalone.historicalCloseUSD.toFixed(2)+" at "+standalone.quoteSession+
  " · ~"+calc.trailingEquitySales.toFixed(1)+"x vendor trailing revenue · "+calc.q3AnnualizedEquitySales.toFixed(1)+"x Q3 annualised sales (NOT a forecast)."));
 analysis.append(make("p",null,
  "To earn an illustrative 5% annual equity-owner FCF yield at ~$1.90tn equity value would require +$"+
  calc.required5PctAnnualOwnerFCFBN.toFixed(0)+"bn cash/year, versus 9M 2026 CFO less capex −$"+
  Math.abs(calc.nineMonthSimpleFCFBN).toFixed(3)+"bn. This is a valuation hurdle, not issuer guidance."));
 analysis.append(make("p",null,
  "October's ~$40bn GPU finance lease is a binding commitment letter to enter a future lease; original 8-K does not prove an executed, fully drawn lease."));
 const lease=make("a",null,"Original GPU lease 8-K");lease.href=standalone.leaseSource;lease.target="_blank";lease.rel="noopener noreferrer";
 analysis.append(lease);
 const creators=make("div","pso-spcx-creators");
 creators.append(make("strong",null,"Creator counterviews · tracked vs external labeled · NOT verified market data"));
 for(const c of standalone.creatorViews){
  const p=make("p",null,c.who+" · "+c.date+" · "+c.proof+": "+c.view);
  const a=make("a",null,"Source");a.href=c.source;a.target="_blank";a.rel="noopener noreferrer";
  creators.append(p,a);
 }
 creators.append(make("p",null,
  "StockedUp: no verifiable direct recent SPCX thesis in this pass. No new transcript credits or creator consumed-video ledger changes; do not treat silence as bearish sentiment."));
 creators.append(make("p",null,
  "IPO lockup: 8 Dec nominal 180-day deadline is an eligibility review, not a forced sell. Public forecasts differ materially on remaining tradable shares after staggered releases."));
 const ipo=make("a",null,"Original SpaceX IPO staggered lockup terms");ipo.href="https://www.sec.gov/Archives/edgar/data/1181412/000162828026040610/spacexfwp.htm";
 ipo.target="_blank";ipo.rel="noopener noreferrer";creators.append(ipo);

 analysis.append(creators);
 section.append(analysis);
 return section;
}
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
 node.dataset.kind=item.kind;node.dataset.direction=item.direction;
 const head=make("div","pso-card-head");
 const intro=make("div");intro.append(make("strong","pso-ticker",item.ticker),make("span","pso-company",item.name));
 const direction=make("span","pso-direction pso-"+item.direction.toLowerCase(),item.direction==="SHORT"?"SHORT WATCH":"LONG WATCH");
 head.append(intro,direction);node.append(head);
 const meta=make("div","pso-meta");
 meta.append(make("span",null,item.kind==="TRADE"?"Tactical trade":"Investment"),make("span",null,item.horizon),make("span",null,item.reviewed+" review"));
 if(item.lens){
  const name=OPPORTUNITY_LENSES.find(x=>x.id===item.lens)?.label;
  if(name)meta.append(make("span",null,name));
 }
 node.append(meta);
 const thesis=make("p","pso-thesis",item.thesis);node.append(thesis);
 const status=make("div","pso-condition");
 const needsReview=Boolean(item.reviewBy&&Date.now()>Date.parse(item.reviewBy+"T23:59:59Z"));
 status.append(make("strong",null,needsReview||!state.current?"RECHECK — SOURCE EXPIRED":item.decisionLabel?item.decisionLabel+" · RESEARCH ONLY":state.price===null?"WATCH — VERIFY PRICE":"WATCH — RESEARCH ONLY"),make("span",null,state.price!==null?
  "Last eligible delayed close: "+state.currency+" "+state.price.toLocaleString("en-GB",{maximumFractionDigits:3})+" · "+state.session:
  "No eligible current price/confirmation; verify the market feed and chart"));
 node.append(status);
 if(item.valuationNote){const value=make("div","pso-research-status");
 value.append(make("strong",null,"Issuer-guidance comparison · 11 Nov"),make("p",null,item.valuationNote));node.append(value);}
 const evidence=make("div","pso-research-status");
 evidence.append(make("strong",null,"Research context · "+item.reviewed));
 evidence.append(make("p",null,state.researchFresh?
  "Saved macro research · "+state.researchState+" · "+state.researchAsOf+". "+state.researchReason:
  "Fresh macro / fundamental admission not verified; consult Bluebelly and original sources."));
 node.append(evidence);
 const steps=make("div","pso-steps");
 for(const [label,value] of [["Entry test",item.trigger],["No-go / cover",item.invalidation]]){
  const box=make("div","pso-step");box.append(make("strong",null,label),make("p",null,value));steps.append(box);
 }
 node.append(steps);
 const detail=make("details","pso-details"),summary=make("summary",null,"Risk, catalyst & original source");
 detail.append(summary,make("p",null,"Risk: "+item.risk),make("p",null,"Next: "+item.catalyst));
 const a=make("a",null,"Original evidence");a.href=item.source;a.target="_blank";a.rel="noopener noreferrer";
 detail.append(a);node.append(detail);
 const cash=CASH_QUALITY_PROFILES[item.ticker];
 if(cash){
  const block=make("details","pso-details pso-cash");
  block.append(make("summary",null,"Cash-flow quality & downside sensitivity (dated)"));
  const fcf=cash.cashFCFBN===null?"Unverified from this source pass":
   "$"+cash.cashFCFBN.toFixed(3)+"bn";
  block.append(make("p",null,cash.period+" · operating cash $"+cash.cfoBN.toFixed(3)+
   "bn · "+cash.fcfDefinition+" cash-flow measure: "+fcf+". "+cash.quality));
  block.append(make("p",null,"First rejection: "+cash.reject));
  if(cash.stress){
   const x=cash.stress;
   block.append(make("p","pso-stress-heading",
    "STATIC "+x.referenceSession+" · $"+x.referenceCloseUSD.toFixed(2)+" reference · "+x.basis));
   for(const line of stressValuation(x)){
    block.append(make("p","pso-stress-line",line.label+
     ": $"+line.epsUSD.toFixed(2)+" EPS × "+line.peMultiple+" P/E = $"+
     line.impliedUSD.toFixed(2)+" ("+(line.changePct>0?"+":"")+line.changePct.toFixed(1)+"%)"));
   }
   block.append(make("p","pso-stress-disclaimer",
    "Assumed EPS haircuts/multiples, not consensus, probabilities, fair values, trade targets or a live quote. Adjusted EPS is not GAAP, FCF or an actionable 4H entry."));
  }
  const original=make("a",null,"Original SEC 10-Q / issuer release");
  original.href=cash.filing;original.target="_blank";original.rel="noopener noreferrer";
  block.append(original);node.append(block);
 }
 return node;
}
/** Separate verified close tape: never pass an old EMA reading as a new-session indicator. */
export function validatePriorityCloses(data,now=new Date()){
 if(data?.contractVersion!=="power-stack-independent-close-overlay/1"||
  data?.source!=="Finnhub quote connector"||data?.session?.length!==10||
  !Array.isArray(data.rows)||data.rows.length<2||data.rows.length>120)return null;
 const mark=Date.parse(data.session+"T21:00:00Z");
 const age=now.getTime()-mark;
 if(!Number.isFinite(mark)||!Number.isFinite(age)||age<0||age>6*86400000||
  data.marketCloseTimestampUTC!==data.session+"T21:00:00.000Z")return null;
 const rows=[],seen=new Set();
 for(const q of data.rows){
  if(!q||!/^[A-Z0-9.]{1,10}$/.test(q.ticker||"")||seen.has(q.ticker)||
    q.session!==data.session||q.currency!=="USD"||q.provider!==data.source||
    q.closeTimestampUTC!==data.marketCloseTimestampUTC||
    !Number.isFinite(q.close)||q.close<=0||
    !Number.isFinite(q.previousClose)||q.previousClose<=0||
    !Number.isFinite(q.changePct)||q.technicalStatus!=="NOT_RECALCULATED_IN_THIS_OVERLAY"||
    Math.abs(100*(q.close/q.previousClose-1)-q.changePct)>.02)return null;
  seen.add(q.ticker);rows.push(q);
 }
 return {session:data.session,rows};
}
function renderClosePanel(target,tape){
 const header=make("div","pso-close-head");
 header.append(make("strong",null,"US market closes · "+tape.session),
  make("span",null,"Finnhub verified · 4:00 p.m. New York · USD"));
 const note=make("p","pso-close-notice",
  "Independent completed-session prices, not live quotes or trading signals. Daily EMA / Stoch RSI readings remain on their own validated historical session.");
 const prominent=["SPCX","TSLA","NVDA","QQQ","TLT","ADBE"];
 const map=new Map(tape.rows.map(x=>[x.ticker,x]));
 const main=make("div","pso-close-grid");
 function insertQuote(node,q){
  const card=make("div","pso-close-item");
  card.dataset.direction=q.changePct>0?"up":q.changePct<0?"down":"flat";
  card.append(make("strong","pso-close-symbol",q.ticker));
  card.append(make("span","pso-close-price","$"+q.close.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})));
  card.append(make("span","pso-close-change",(q.changePct>0?"+":"")+q.changePct.toFixed(2)+"%"));
  node.append(card);
 }
 for(const symbol of prominent){const q=map.get(symbol);if(q)insertQuote(main,q);}
 const more=make("details","pso-close-more");
 more.append(make("summary",null,"See all "+tape.rows.length+" verified priority closes"));
 const rest=make("div","pso-close-grid pso-close-grid-more");
 for(const q of tape.rows)if(!prominent.includes(q.ticker))insertQuote(rest,q);
 more.append(rest);
 target.replaceChildren(header,note,main,more);
}
export function renderOpportunityTerminal(target,prices=new Map(),options={}){
 if(!target)return;
 const home=options.mode==="home",initial=home?"ALL":
   location.hash==="#shorts"?"SHORT":location.hash==="#trades"?"TRADE":
   location.hash==="#investments"?"INVESTMENT":"ALL";
 let chosen=initial,cardPrices=prices,expanded=false;
 const shell=make("section","pso-shell");
 shell.id="ps-opportunities";shell.setAttribute("aria-label","Guided trade and investment ideas");
 const eyebrow=make("p","pso-overline","OPPORTUNITY TERMINAL · RESEARCH ONLY");
 const h=make("h2",null,home?"Find your next opportunity":"Find a trade or investment");
 const lead=make("p","pso-lead","Choose a horizon, review the research, then check sources, valuation, risks and catalysts. No automated buy or sell calls.");
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
 // Dated research lenses are presentation categories, never additional investment scores.
 // No private holdings, cash, owner notes or broker data in this source.
 // One common category/data contract powers the front-page overview and full research view.
 if(!home)shell.append(renderOpportunityLensSummary({id:"ps-ideas-opportunity-lenses",compact:false}));

 const closePanel=make("section","pso-close-panel");
 closePanel.setAttribute("aria-label","Verified recent US closing prices");
 closePanel.append(make("p","pso-close-loading","Verifying recent completed US closing prices…"));
 shell.append(closePanel);
 const mergerDrawer=make("details","pso-major-drawer pso-deal-drawer");
 const mergerSummary=make("summary","pso-major-summary");
 mergerSummary.append(make("strong",null,"Special situation · Tesla × SpaceX"),
  make("span",null,"No signed agreement · price-ratio scenarios and due diligence"));
 mergerDrawer.append(mergerSummary);
 const mergerMount=make("div","pso-merger-mount");
 mergerMount.append(renderMergerWatch(prices));mergerDrawer.append(mergerMount);shell.append(mergerDrawer);
 const head=make("div","pso-head");head.append(make("h3",null,home?"Ideas to investigate":"Research candidates"));
 const about=make("span",null,"Theses reviewed "+OPPORTUNITY_REVIEW_DATE+" · Latest qualified daily bars only");head.append(about);shell.append(head);
 const filters=make("div","pso-filters");filters.setAttribute("role","group");filters.setAttribute("aria-label","Opportunity type");
 if(!home)for(const [id,label] of [["ALL","All"],["TRADE","Tactical trades"],["SHORT","Short-side"],["INVESTMENT","Investments"]]){
  const b=make("button","pso-filter",label);b.type="button";b.dataset.filter=id;
  b.addEventListener("click",()=>select(id));filters.append(b);
 }
 if(!home)shell.append(filters);
 const cards=make("div","pso-cards");shell.append(cards);
 const showMore=make("button","pso-show-more","Show more research candidates");
 showMore.type="button";showMore.addEventListener("click",()=>{expanded=!expanded;select(chosen);});
 if(!home)shell.append(showMore);
 const footer=make("p","pso-footer","Every setup is WAIT / RECHECK until a fresh chart, invalidation, source and (for shorts) borrow/locate are verified. No trade tickets or broker orders are created.");
 shell.append(footer);
 if(home){const link=make("a","pso-open","See all short and long research candidates");link.href="ideas.html#shorts";shell.append(link);}
 function select(id){
  if(chosen!==(id||"ALL"))expanded=false;
  chosen=id||"ALL";
  for(const button of filters.querySelectorAll("button"))button.setAttribute("aria-pressed",String(button.dataset.filter===chosen));
  cards.replaceChildren();
  const selected=home?OPPORTUNITIES.filter(x=>["crwv-short","smh-short","cf-long"].includes(x.id)):visibleOpportunities(chosen);
  const preview=chosen==="ALL"
   ?[...selected.filter(x=>x.kind==="TRADE").slice(0,2),
     ...selected.filter(x=>x.kind==="INVESTMENT").slice(0,2)]
   :selected.slice(0,4);
  const visible=home||expanded?selected:preview;
  for(const item of visible)cards.append(card(item,cardPrices,options.ownerResearch||[]));
  if(!home){
   showMore.hidden=selected.length<=4;
   showMore.textContent=expanded?"Show fewer candidates":"Show "+(selected.length-4)+" more research candidates";
   showMore.setAttribute("aria-expanded",String(expanded));
  }
 }
 const scannerDrawer=make("details","pso-major-drawer pso-scanner-drawer");
 const scannerSummary=make("summary","pso-major-summary");
 scannerSummary.append(make("strong",null,"Open technical screeners"),
  make("span",null,"Daily Donchian signals, Stochastic RSI and original market context"));
 scannerDrawer.append(scannerSummary);
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
 scannerDrawer.append(radar);shell.append(scannerDrawer);
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
 // The owner gate mounts the terminal first. This secondary source has no account, order or positions data.
 fetch("./market-close-overlay.json",{cache:"no-store"}).then(response=>{
  if(!response.ok)throw Error("Close overlay unavailable");
  return response.json();
 }).then(input=>{
  if(!shell.isConnected)return;
  const verified=validatePriorityCloses(input);
  if(!verified)throw Error("Overlay stale or failed source contract");
  renderClosePanel(closePanel,verified);
  const updated=new Map(prices);
  for(const q of verified.rows){
   const prev=prices.get(q.ticker);
   if(prev?.session&&prev.session>q.session)continue;
   updated.set(q.ticker,{...prev,close:q.close,day:q.changePct,session:q.session,
    currency:q.currency,technical:null,basis:"Finnhub regular-session close · separate technical lineage"});
  }
  cardPrices=updated;select(chosen);
  mergerMount.replaceChildren(renderMergerWatch(cardPrices));
 }).catch(()=>{
  if(shell.isConnected)closePanel.replaceChildren(make("p","pso-close-unavailable",
    "Most recent independent close overlay unavailable; earlier source-dated daily bars remain visible below."));
 });
}
