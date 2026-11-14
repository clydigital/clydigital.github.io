// Research-only opportunity content shared between the private-home overview and detailed idea reader.
// Public source code contains no private positions, holdings, cash or authenticated decisions.
export const LENS_CONTRACT="power-stack-opportunity-lenses/1";
export const LENS_EDITION="2026-11-14";
export const OPPORTUNITY_LENSES=Object.freeze([
  {
    "id": "missing",
    "label": "Potential Missing Opportunities",
    "hint": "New candidates challenging the current shortlist"
  },
  {
    "id": "growth",
    "label": "Growth",
    "hint": "Fast sales and orders are not enough without owner cash"
  },
  {
    "id": "value",
    "label": "Undervalued / Value",
    "hint": "Durable earnings relative to a realistic purchase price"
  },
  {
    "id": "quality",
    "label": "Resilient / Quality",
    "hint": "Cross-scenario durability, not just a fashionable industry"
  },
  {
    "id": "catalyst",
    "label": "Turnaround / Catalysts",
    "hint": "A dated event or operating change creates a test"
  },
  {
    "id": "income",
    "label": "Income / Defensive",
    "hint": "Bonds, cash and hedges with distinct risks"
  },
  {
    "id": "spec",
    "label": "Speculative / High Upside",
    "hint": "Big possible outcomes, with material downside"
  }
]);
export const LENS_CASES=Object.freeze([
  {
    "ticker": "CSCO",
    "name": "Cisco",
    "lens": "value",
    "action": "INVESTIGATE",
    "why": "Q1 FY27 revenue rose 24% and non-GAAP EPS 40%; raised guidance versus an 11% 20-session share fall. RSI14 37.1, no daily band reclaim.",
    "test": "Reconcile FY27 EPS $5.47–5.53 against cash, margin mix, AI order growth and a $97.78 lower EMA20 band reclaim.",
    "reviewBy": "2026-11-20",
    "source": "https://investor.cisco.com/financials/quarterly-results/",
    "risk": "Hardware mix, gross-margin compression and slower order momentum",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "NBIS",
    "name": "Nebius",
    "lens": "spec",
    "action": "WAIT",
    "why": "Down 30.0% over 20 sessions; RSI14 35.8. Revenue/capacity delays and large capex complicate the bargain case.",
    "test": "Verify funded capacity, customer prepayments and diluted FCF; require lower EMA20 band (~$134.08) reclaim and retest.",
    "reviewBy": "2026-11-20",
    "source": "https://ir.nebius.com/",
    "risk": "Leverage, dilution, capex and operating delays",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "CRWV",
    "name": "CoreWeave",
    "lens": "spec",
    "action": "WAIT",
    "why": "Revenue growth faces a much larger interest/capex bill; RSI14 43.1 is not an oversold signal.",
    "test": "Reconcile debt interest, utilisation, capex, advance receipts and customer concentration before a buy case.",
    "reviewBy": "2026-11-20",
    "source": "https://investors.coreweave.com/",
    "risk": "Funding costs, collateral, customer concentration and dilution",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "DAL",
    "name": "Delta Air Lines",
    "lens": "catalyst",
    "action": "WATCH",
    "why": "FAA ground stop lifted; operating normalisation could aid sentiment. RSI14 53.9 and +14.4% 20-session return are not oversold.",
    "test": "Check 16 Nov flights, cancellations, fuel, FY26 FCF and debt before classifying an event rebound.",
    "reviewBy": "2026-11-16",
    "source": "https://ir.delta.com/",
    "risk": "Crew dislocation, fuel, weaker demand and flight costs",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "UAL",
    "name": "United Airlines",
    "lens": "catalyst",
    "action": "WATCH",
    "why": "Stronger operating momentum but FAA recovery is not a capitulation bargain; RSI14 49.8.",
    "test": "Compare Monday completion/cancellations with earnings and short-term flight cost; no automatic gap trade.",
    "reviewBy": "2026-11-16",
    "source": "https://ir.united.com/",
    "risk": "Disruption duration, fuel and high operating leverage",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "RTX",
    "name": "RTX",
    "lens": "quality",
    "action": "WATCH",
    "why": "FAA radar award predates outage. RSI14 54: no oversold condition; assess incremental economics instead.",
    "test": "Validate newly appropriated funds, contract modifications, margins and valuation versus existing backlog.",
    "reviewBy": "2026-12-01",
    "source": "https://www.faa.gov/newsroom/trumps-transportation-secretary-duffy-faa-administrator-bedford-announce-radar-contracts",
    "risk": "Valuation and procurement delivery timelines",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "LHX",
    "name": "L3Harris",
    "lens": "quality",
    "action": "WATCH",
    "why": "Existing FAA surveillance contract supports order evidence; RSI14 59.9 is not a dip.",
    "test": "Look for funded incremental FAA awards and cash conversion, not speculation about the failed network vendor.",
    "reviewBy": "2026-12-01",
    "source": "https://www.l3harris.com/newsroom/press-release/2026/07/faa-awards-l3harris-airspace-surveillance-modernization-contract",
    "risk": "Programme margins, procurement timing and elevated expectations",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "NVT",
    "name": "nVent",
    "lens": "missing",
    "action": "INVESTIGATE",
    "why": "Organic Q3 growth of 44% challenges Eaton's growth premium.",
    "test": "Reconcile post-Maverick debt and cash conversion versus ETN/HUBB.",
    "reviewBy": "2026-11-20",
    "source": "https://www.sec.gov/Archives/edgar/data/1720635/000162828026068391/q32026nvtpressrelease.htm",
    "risk": "Acquisition price, integration, debt",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "POWL",
    "name": "Powell Industries",
    "lens": "missing",
    "action": "WATCH",
    "why": "June backlog of $2.4bn includes major data-centre and LNG work.",
    "test": "16 Nov earnings: validate margin, cash and order concentration.",
    "reviewBy": "2026-11-16",
    "source": "https://powellindustriesinc.gcs-web.com/news-releases/news-release-details/powell-industries-announces-third-quarter-fiscal-2026-results",
    "risk": "Lumpy projects and cycle risk",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "BDX",
    "name": "Becton Dickinson",
    "lens": "missing",
    "action": "COMPARE",
    "why": "Medical technology cash generation is distinct from insurer/PBM economics.",
    "test": "Normalise continuing-business GAAP earnings after its separation.",
    "reviewBy": "2026-11-24",
    "source": "https://investors.bd.com/news-events/press-releases/detail/984/bd-reports-fourth-quarter-and-full-year-fiscal-2026-financial-results",
    "risk": "Low growth and adjusted-vs-GAAP gulf",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "VRT",
    "name": "Vertiv",
    "lens": "growth",
    "action": "COMPARE",
    "why": "Strong Q3 revenue growth with positive adjusted free cash flow.",
    "test": "Reconcile order quality and valuation versus MOD.",
    "reviewBy": "2026-11-24",
    "source": "https://investors.vertiv.com/news/news-details/2026/Vertiv-Reports-Strong-Third-Quarter-2026-with-Net-Sales-Growth-of-61-Organic-Orders-Growth-over-100-and-Diluted-EPS-Growth-of-91-Adjusted-Diluted-EPS-Growth-of-78-Raises-Full-Year-2026-Guidance-Across-All-Key-Metrics/default.aspx",
    "risk": "Data-centre capex could slow",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "MOD",
    "name": "Modine",
    "lens": "growth",
    "action": "WAIT",
    "why": "Data-centre growth reached 95% while six-month free cash flow was negative.",
    "test": "18 Nov Investor Day: verify post-spin margins and cash goals.",
    "reviewBy": "2026-11-18",
    "source": "https://investors.modine.com/news/news-details/2026/Modine-Reports-Second-Quarter-Fiscal-2027-Results/default.aspx",
    "risk": "Capacity spending and non-guaranteed agreement volume",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "GOOGL",
    "name": "Alphabet",
    "lens": "growth",
    "action": "WATCH",
    "why": "Profitable Cloud/Search growth meets expensive AI infrastructure spend.",
    "test": "Test Cloud profit, AI capex and sustainable owner cash.",
    "reviewBy": "2026-12-04",
    "source": "https://www.sec.gov/Archives/edgar/data/1652044/000165204426000080/googexhibit991q32026.htm",
    "risk": "Capex may keep absorbing FCF",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "ADBE",
    "name": "Adobe",
    "lens": "value",
    "action": "INVESTIGATE",
    "why": "Recurring software cash generation is priced with AI-disruption concerns.",
    "test": "Check GAAP earnings, stock compensation and paid AI retention.",
    "reviewBy": "2026-12-01",
    "source": "https://www.sec.gov/Archives/edgar/data/796343/000079634326000156/adbe-20260828.htm",
    "risk": "Core subscriptions may be cannibalised",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "CI",
    "name": "Cigna",
    "lens": "value",
    "action": "INVESTIGATE",
    "why": "Low forward P/E contrasts with uncertain PBM cash economics.",
    "test": "Reconcile cash conversion, payables and policy risks.",
    "reviewBy": "2026-11-27",
    "source": "https://www.sec.gov/Archives/edgar/data/1739940/000173994026000071/ci-20260930.htm",
    "risk": "Adjusted income may overstate owner cash",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "CF",
    "name": "CF Industries",
    "lens": "value",
    "action": "COMPARE",
    "why": "Strong trailing fertiliser cash may not represent midcycle economics.",
    "test": "Stress nitrogen spreads, gas costs and JV cash demands.",
    "reviewBy": "2026-12-04",
    "source": "https://ir.cfindustries.com/Investors/news/news-details/2026/CF-Industries-Holdings-Inc--Reports-First-Nine-Months-2026-Net-Earnings-of-1-78-Billion-Adjusted-EBITDA-of-3-01-Billion/default.aspx",
    "risk": "Commodity cycle and one-off income",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "ETN",
    "name": "Eaton",
    "lens": "quality",
    "action": "COMPARE",
    "why": "Broad electrical business is less dependent on one AI chip supplier.",
    "test": "Reconcile backlog cash and post-acquisition debt versus NVT.",
    "reviewBy": "2026-11-27",
    "source": "https://www.eaton.com/us/en-us/company/news-insights/news-releases/2026/eaton-reports-record-third-quarter-2026-results.html",
    "risk": "Premium valuation and AI capex overlap",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "HUBB",
    "name": "Hubbell",
    "lens": "quality",
    "action": "COMPARE",
    "why": "Grid and electrical-equipment demand offers differentiated growth.",
    "test": "Verify leverage and cash conversion after acquisitions.",
    "reviewBy": "2026-11-27",
    "source": "https://www.sec.gov/Archives/edgar/data/48898/000162828026067421/exhibit991_10272026.htm",
    "risk": "Debt and acquisition integration",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "BWXT",
    "name": "BWX Technologies",
    "lens": "quality",
    "action": "WATCH",
    "why": "Nuclear and defence programmes have different buyers from hyperscalers.",
    "test": "Validate funded contracts and free-cash conversion.",
    "reviewBy": "2026-12-04",
    "source": "https://bwxt.gcs-web.com/news-releases/news-release-details/bwx-technologies-reports-third-quarter-2026-results",
    "risk": "Premium price and award timing",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "CVS",
    "name": "CVS Health",
    "lens": "catalyst",
    "action": "INVESTIGATE",
    "why": "Improving medical claims metrics support a potential recovery.",
    "test": "Verify 2027 insurance pricing, cash accessibility and debt.",
    "reviewBy": "2026-11-27",
    "source": "https://www.sec.gov/Archives/edgar/data/64803/000006480326000108/cvs-20260930.htm",
    "risk": "Claims inflation and parent debt",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "FLEX",
    "name": "Flex",
    "lens": "catalyst",
    "action": "WATCH",
    "why": "Planned Axiom separation could reveal standalone infrastructure value.",
    "test": "Model post-spin debt, share allocation and comparable FCF.",
    "reviewBy": "2026-12-04",
    "source": "https://investors.flex.com/financials/quarterly-results/default.aspx",
    "risk": "Pre-spin adjusted EPS is not standalone profit",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "SGOV",
    "name": "Treasury bills ETF",
    "lens": "income",
    "action": "COMPARE",
    "why": "Short bills provide a benchmark for the cost of waiting.",
    "test": "Compare actual fund yield and USD/MYR risk to alternatives.",
    "reviewBy": "2026-11-20",
    "source": "https://www.ishares.com/us/products/314116/ishares-0-3-month-treasury-bond-etf",
    "risk": "FX and reinvestment yield",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "IEF",
    "name": "7–10Y Treasury ETF",
    "lens": "income",
    "action": "WATCH",
    "why": "Intermediate duration offers less rate sensitivity than TLT.",
    "test": "Verify real yields and term-premium trend before entry.",
    "reviewBy": "2026-11-20",
    "source": "https://www.ishares.com/us/products/239456/IEF",
    "risk": "Rates can rise even if short rates fall",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "CVX",
    "name": "Chevron",
    "lens": "income",
    "action": "WATCH",
    "why": "Oil earnings may offset some Hormuz-linked inflation exposure.",
    "test": "Stress dividends and cash under lower crude/refining spreads.",
    "reviewBy": "2026-12-04",
    "source": "https://www.chevron.com/newsroom/2026/q4/chevron-reports-third-quarter-2026-results",
    "risk": "Oil can fall in a recession",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "NVDA",
    "name": "Nvidia",
    "lens": "spec",
    "action": "EVENT VETO",
    "why": "AI sales strength is not proof the leadership transition is harmless.",
    "test": "17 Nov earnings: verify orders, margins and succession guidance.",
    "reviewBy": "2026-11-17",
    "source": "https://nvidianews.nvidia.com/news/nvidia-sets-conference-call-for-third-quarter-financial-results-6928873",
    "risk": "Governance and customer financing",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "MU",
    "name": "Micron",
    "lens": "spec",
    "action": "WAIT",
    "why": "Strong memory-cycle earnings can make forward P/E look misleadingly low.",
    "test": "Stress normalised HBM prices, margins and capex.",
    "reviewBy": "2026-12-04",
    "source": "https://www.sec.gov/Archives/edgar/data/723125/000072312526000018/a2026q4ex991-pressrelease.htm",
    "risk": "Memory-cycle reversal",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  },
  {
    "ticker": "AMD",
    "name": "AMD",
    "lens": "spec",
    "action": "WATCH",
    "why": "AI GPU competition may favour share gains, but valuation is demanding.",
    "test": "Check cash conversion versus growth and multiple compression.",
    "reviewBy": "2026-12-04",
    "source": "https://ir.amd.com/",
    "risk": "Very high earnings/cash multiples",
    "evidenceAsOf": "2026-11-13",
    "readiness": "RESEARCH_ONLY",
    "executionReady": false
  }
]);
export const LENS_ACTIONS=Object.freeze(["INVESTIGATE","COMPARE","WATCH","WAIT","EVENT VETO"]);
export function validOpportunityLenses(lenses=OPPORTUNITY_LENSES,rows=LENS_CASES){
 const ids=new Set(lenses.map(x=>x.id)),symbols=new Set();
 if(ids.size!==lenses.length||!ids.has("missing"))return false;
 return rows.every(x=>{
  const good=!symbols.has(x.ticker)&&ids.has(x.lens)&&LENS_ACTIONS.includes(x.action)&&
    x.readiness==="RESEARCH_ONLY"&&x.executionReady===false&&
    Date.parse(x.reviewBy+"T00:00:00Z")>=Date.parse(x.evidenceAsOf+"T00:00:00Z")&&
    x.source.startsWith("https://")&&Boolean(x.risk&&x.why&&x.test);
  symbols.add(x.ticker);return good;
 });
}
export function lensReviewState(x,now=new Date()){
 return now.getTime()>Date.parse(x.reviewBy+"T23:59:59Z")?"RECHECK REQUIRED":"SOURCE-DATED RESEARCH";
}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
export function renderOpportunityLensSummary({id="ps-opportunity-lenses",compact=true,now=new Date()}={}){
 const section=el("section","psl-shell");section.id=id;section.setAttribute("aria-label","Investment opportunity research categories");
 const header=el("div","psl-head"),copy=el("div");
 copy.append(el("p","psl-overline","OPPORTUNITY RESEARCH"),el("h2",null,"Where to look next"),
   el("p","psl-intro","Promising companies, their risks, and what must happen next."));
 header.append(copy,el("span","psl-vintage","14 Nov research · 13 Nov market close · not trade signals"));section.append(header);
 const tabs=el("div","psl-tabs");tabs.setAttribute("role","tablist");tabs.setAttribute("aria-label","Opportunity categories");
 const panel=el("div","psl-panel");panel.id=id+"-panel";panel.setAttribute("role","tabpanel");panel.tabIndex=0;
 const heading=el("div","psl-panel-head"),cards=el("div","psl-items");panel.append(heading,cards);
 let selected="missing";
 function activate(key,keyboard=false){
  selected=key;const info=OPPORTUNITY_LENSES.find(l=>l.id===key);
  tabs.querySelectorAll("button").forEach(button=>{
   const yes=button.dataset.lens===key;button.setAttribute("aria-selected",String(yes));button.tabIndex=yes?0:-1;
   if(keyboard&&yes)button.focus();
  });
  heading.replaceChildren(el("h3",null,info.label),el("p",null,info.hint));cards.replaceChildren();
  LENS_CASES.filter(x=>x.lens===key).slice(0,compact?3:5).forEach(x=>{
   const card=el("article","psl-item"),top=el("div","psl-item-top"),security=el("div","psl-security");
   security.append(el("strong",null,x.ticker),el("span",null,x.name));
   top.append(security,el("span","psl-status",lensReviewState(x,now)==="RECHECK REQUIRED"?"RECHECK":x.action));
   card.append(top,el("p","psl-thesis",x.why),el("p","psl-next","NEXT · "+x.test));
   const bottom=el("div","psl-source-row"),source=el("a",null,"Issuer evidence");
   source.href=x.source;source.target="_blank";source.rel="noopener noreferrer";
   bottom.append(el("span",null,lensReviewState(x,now)+" · "+x.evidenceAsOf),source);card.append(bottom);cards.append(card);
  });
 }
 OPPORTUNITY_LENSES.forEach(lens=>{
  const button=el("button","psl-tab",lens.label);button.type="button";button.id=id+"-"+lens.id;
  button.dataset.lens=lens.id;button.setAttribute("role","tab");button.setAttribute("aria-controls",panel.id);
  button.addEventListener("click",()=>activate(lens.id));
  button.addEventListener("keydown",event=>{
   if(!["ArrowRight","ArrowLeft","Home","End"].includes(event.key))return;
   event.preventDefault();const i=OPPORTUNITY_LENSES.findIndex(x=>x.id===selected);
   const j=event.key==="Home"?0:event.key==="End"?OPPORTUNITY_LENSES.length-1:
     (i+(event.key==="ArrowRight"?1:-1)+OPPORTUNITY_LENSES.length)%OPPORTUNITY_LENSES.length;
   activate(OPPORTUNITY_LENSES[j].id,true);
  });tabs.append(button);
 });
 section.append(tabs,panel);
 const footer=el("div","psl-foot");footer.append(el("p",null,"One primary role per ticker. Scenario detail remains in the full research."));
 const more=el("a",null,"Full investment ideas");more.href="ideas.html#investments";footer.append(more);
 section.append(footer);activate("missing");return section;
}
