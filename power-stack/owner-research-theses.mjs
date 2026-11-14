// Private research page presentation enhancement. Rendered ONLY after authenticated RLS page load.
// This script contains dated public company research and sources; no personal holdings, broker access or secrets.
export const RESEARCH_THESIS_CONTRACT="power-stack-research-theses/1";
export const RESEARCH_THESIS_AS_OF="2026-11-13";
export const COMPARISONS=Object.freeze([
  {
    "id": "electrical",
    "title": "Electrical infrastructure",
    "question": "Can nVent outperform Eaton without taking more hidden risk?",
    "take": "NVT leads the next valuation check; HUBB is an alternative and ETN remains the established quality benchmark.",
    "rank": "Research order: NVT → HUBB → ETN",
    "facts": [
      {
        "ticker": "NVT",
        "name": "nVent",
        "line": "12 Nov close $115.50 · provider forward P/E ~19.7× · Q3 organic growth +44% · quarterly FCF $268m.",
        "source": "https://www.sec.gov/Archives/edgar/data/1720635/000162828026068391/q32026nvtpressrelease.htm"
      },
      {
        "ticker": "HUBB",
        "name": "Hubbell",
        "line": "Close $437.98 · forward P/E ~18.7× · Q3 organic growth +11% · quarterly FCF ~$280m.",
        "source": "https://www.sec.gov/Archives/edgar/data/48898/000162828026067421/exhibit991_10272026.htm"
      },
      {
        "ticker": "ETN",
        "name": "Eaton",
        "line": "Close $359.04 · forward P/E ~23.6× · Q3 organic growth +19% · quarterly FCF ~$1.03bn.",
        "source": "https://www.eaton.com/us/en-us/company/news-insights/news-releases/2026/eaton-reports-record-third-quarter-2026-results.html"
      }
    ],
    "reason": "nVent appears to offer faster organic demand growth at a lower earnings multiple than Eaton. That is a reason to investigate a potential mispricing, not proof it is cheaper on normalised cash flow. Hubbell has grid/utility diversification and a lower quoted multiple, but acquisitions affect group growth and debt.",
    "counter": "Maverick Power was acquired after nVent's September balance-sheet date for $1.75bn plus potential contingent consideration; Hubbell's acquisition-driven leverage also matters. ETN may deserve its premium through diversification and steadier cash conversion.",
    "upgrade": "Update pro-forma cash, debt, return on acquired capital and segment FCF after acquisition. Buy-case only if the premium/discount survives those adjustments.",
    "asOf": "2026-11-13"
  },
  {
    "id": "cooling",
    "title": "AI cooling and thermal management",
    "question": "Is Modine growth more attractive than Vertiv cash generation?",
    "take": "VRT leads on demonstrated cash generation; MOD is a conditional high-growth candidate.",
    "rank": "Operating quality: VRT > MOD · Potential growth optionality: MOD (unproven)",
    "facts": [
      {
        "ticker": "MOD",
        "name": "Modine",
        "line": "Close $106.10 · forward P/E ~19.6× · data-centre sales +95% · six-month free cash flow −$145.6m.",
        "source": "https://investors.modine.com/news/news-details/2026/Modine-Reports-Second-Quarter-Fiscal-2027-Results/default.aspx"
      },
      {
        "ticker": "VRT",
        "name": "Vertiv",
        "line": "Close $209.64 · forward P/E ~26.9× · group Q3 sales +61% · adjusted quarterly FCF ~$652m.",
        "source": "https://investors.vertiv.com/"
      }
    ],
    "reason": "Modine's operating exposure is growing rapidly, and a $4bn data-centre cooling capacity agreement indicates material customer demand. But capacity reserved is not unconditional purchased revenue; expansion consumes working capital. Vertiv converts demand into cash more visibly, which can justify a valuation premium.",
    "counter": "VRT's cash metric is adjusted and period-specific; these companies do not have identical reporting bases. MOD's post-spin continuing-business valuation, required capex and customer concentration may make its apparently lower forward P/E misleading.",
    "upgrade": "16 Nov: check any cooling-order news; 18 Nov MOD Investor Day: re-underwrite margins, cash conversion, agreement terms and multi-year targets. Prefer no MOD buy case until continuing-business FCF path is credible.",
    "asOf": "2026-11-13"
  },
  {
    "id": "healthcare",
    "title": "Healthcare value versus resilience",
    "question": "Which discount is real: Cigna, CVS or Becton Dickinson?",
    "take": "CI offers the cheaper earnings screen; CVS has the clearer operating turnaround; BDX diversifies away from insurance.",
    "rank": "Value work: CI / CVS · Defensive alternative: BDX",
    "facts": [
      {
        "ticker": "CI",
        "name": "Cigna",
        "line": "Close $296.27 · FY26 adjusted EPS ≥$30.60 (~9.7×) · nine-month operating cash $3.28bn versus $3.45bn prior year.",
        "source": "https://www.sec.gov/Archives/edgar/data/1739940/000173994026000071/ci-20260930.htm"
      },
      {
        "ticker": "CVS",
        "name": "CVS Health",
        "line": "Close $89.79 · FY26 adjusted EPS ≥$8.20 (~10.9×) · Q3 medical benefit ratio 91.3% versus 92.8%.",
        "source": "https://www.sec.gov/Archives/edgar/data/64803/000006480326000108/cvs-20260930.htm"
      },
      {
        "ticker": "BDX",
        "name": "Becton Dickinson",
        "line": "Close $215.71 · FY27 adjusted EPS $13.10–13.30 (~16.3× midpoint) · FY26 continuing-operation FCF ~$2.9bn.",
        "source": "https://investors.bd.com/news-events/press-releases/detail/984/bd-reports-fourth-quarter-and-full-year-fiscal-2026-financial-results"
      }
    ],
    "reason": "A low earnings multiple isn't necessarily mispricing. Cigna's PBM cash timing and regulatory risks must be reconciled with earnings; CVS shows measurable benefit-cost recovery but has substantial debt. BDX's MedTech cash stream may diversify these exposures, though near-term guided growth is slower.",
    "counter": "Cigna's adjusted earnings exceed recent cash conversion; CVS has regulated insurer cash not automatically distributable to the parent; BDX has a significant gap between GAAP and adjusted earnings after separation. FY27 BDX and FY26 CI/CVS figures are NOT a like-for-like forward period.",
    "upgrade": "Require FCF-to-earnings reconciliation, net debt, medical claims, pharmacy policy and BDX continuing-operations bridge before promoting a value name to new-money candidacy.",
    "asOf": "2026-11-13"
  }
]);
export const ADJACENT_CASES=Object.freeze([
  {
    "ticker": "POWL",
    "lens": "Potential Missing Opportunities",
    "thesis": "$2.4bn June backlog including large data-centre and LNG orders; diverse industrial end-markets, but projects are lumpy.",
    "risk": "Margins and billing timing may be volatile; backlog is not guaranteed cash.",
    "test": "16 Nov FY26 earnings: orders, margins, backlog conversion",
    "source": "https://powellindustriesinc.gcs-web.com/news-releases/news-release-details/powell-industries-announces-third-quarter-fiscal-2026-results"
  },
  {
    "ticker": "ADBE",
    "lens": "Undervalued / Value",
    "thesis": "Recurring cash-generating software is heavily discounted while generative AI threatens seats and pricing.",
    "risk": "Stock compensation and adjusted-to-GAAP bridge; actual paid AI subscription retention unknown.",
    "test": "1 Dec CEO transition and FY27 monetisation outlook",
    "source": "https://www.sec.gov/Archives/edgar/data/796343/000079634326000156/adbe-20260828.htm"
  },
  {
    "ticker": "FLEX",
    "lens": "Turnaround / Catalysts",
    "thesis": "Axiom Cloud & Power separation could surface a different business valuation.",
    "risk": "Pre-spin adjusted EPS cannot be assigned uncritically to either resulting company.",
    "test": "Spin terms, cash/debt allocation and pro-forma FCF",
    "source": "https://investors.flex.com/financials/quarterly-results/default.aspx"
  },
  {
    "ticker": "CF",
    "lens": "Value / Inflation hedge candidate",
    "thesis": "Trailing fertiliser cash flows can offer non-AI exposure, especially in certain energy supply shocks.",
    "risk": "Nitrogen/gas spreads, litigation settlements and JV effects can inflate cycle earnings.",
    "test": "Normalise commodity economics at midcycle pricing",
    "source": "https://ir.cfindustries.com/Investors/news/news-details/2026/CF-Industries-Holdings-Inc--Reports-First-Nine-Months-2026-Net-Earnings-of-1-78-Billion-Adjusted-EBITDA-of-3-01-Billion/default.aspx"
  },
  {
    "ticker": "GOOGL",
    "lens": "Growth / Quality",
    "thesis": "Growing Cloud and Search earnings, but exceptionally high AI capex makes cash conversion a decisive check.",
    "risk": "Revenue and EPS multiples can look inexpensive while distributable FCF is absorbed by capex.",
    "test": "Paid AI demand, cash after depreciation and 2027 capital plan",
    "source": "https://www.sec.gov/Archives/edgar/data/1652044/000165204426000080/googexhibit991q32026.htm"
  },
  {
    "ticker": "NVDA",
    "lens": "Speculative / Event",
    "thesis": "AI demand may remain substantial even under governance volatility; share-price decline alone is not a bargain.",
    "risk": "CEO-transition execution, customer commitments, financing and forecast revisions.",
    "test": "17 Nov earnings: orders, outlook and succession details",
    "source": "https://nvidianews.nvidia.com/news/nvidia-sets-conference-call-for-third-quarter-financial-results-6928873"
  }
]);
export const SCENARIO_READTHROUGH=Object.freeze([
  [
    "AI capex keeps expanding",
    "NVT · VRT · MOD · POWL",
    "Demand benefits them, but higher-priced firms need conversion into margins and free cash."
  ],
  [
    "AI financing reset",
    "CI · CVS · BDX (relative)",
    "Electrical and cooling suppliers still share some capex-cycle exposure; resilience is relative, not absolute."
  ],
  [
    "Sticky inflation and expensive debt",
    "Cash-generating firms; short bills as comparator",
    "Re-evaluate acquisition-funded NVT/HUBB and cash-consuming MOD, and avoid treating TLT as cash."
  ],
  [
    "Hormuz-linked energy shock",
    "CVX and selected energy/fertiliser exposure",
    "Higher oil isn't uniformly positive if demand breaks, and fertiliser input costs can rise."
  ],
  [
    "Disinflation and declining yields",
    "ADBE · GOOGL · quality growth / duration",
    "Duration and long-growth multiples may improve, but a growth-driven crash can still hurt equities."
  ]
]);
export const validateResearchCases=(comparisons=COMPARISONS,adjacent=ADJACENT_CASES)=>{
 const known=new Set();
 return comparisons.length===3&&comparisons.every(x=>x.facts.length>=2&&x.take&&x.reason&&x.counter&&x.upgrade&&x.asOf===RESEARCH_THESIS_AS_OF&&x.facts.every(f=>{
  if(known.has(f.ticker)||!/^https:\/\//.test(f.source)||!f.line)return false;
  known.add(f.ticker);return true;
 }))&&adjacent.every(x=>!known.has(x.ticker)&&Boolean(x.test&&x.risk&&x.thesis)&&/^https:\/\//.test(x.source));
};
const el=(name,cls,value)=>{const item=document.createElement(name);if(cls)item.className=cls;if(value!==undefined)item.textContent=value;return item;};
const external=(label,url)=>{const a=el("a",null,label);a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a;};
function detailLine(label,value){
 const row=el("div","psrt-explain"),heading=el("strong",null,label),p=el("p",null,value);
 row.append(heading,p);return row;
}
function comparisonCard(c,open=false){
 const section=el("details","psrt-study");section.id="ps-research-"+c.id;section.open=open;
 const summary=el("summary","psrt-study-summary"),intro=el("div","psrt-summary-intro");
 intro.append(el("strong",null,c.title),el("span",null,c.question));summary.append(intro,el("span","psrt-expand-label","Compare"));section.append(summary);
 const body=el("div","psrt-study-body");
 body.append(el("p","psrt-verdict",c.take));
 const grid=el("div","psrt-facts");
 c.facts.forEach(f=>{
  const item=el("article","psrt-fact"),row=el("div","psrt-fact-head");
  row.append(el("strong",null,f.ticker),el("span",null,f.name));item.append(row,el("p",null,f.line));
  item.append(external("Original issuer / filing",f.source));grid.append(item);
 });
 body.append(grid);
 const reasoning=el("div","psrt-reasoning");
 reasoning.append(detailLine("Why we are interested",c.reason),detailLine("What could break the thesis",c.counter),detailLine("Next evidence required",c.upgrade));
 body.append(reasoning,el("p","psrt-ranking",c.rank));
 section.append(body);return section;
}
export function renderResearchTheses(){
 const shell=el("section","psrt-shell");shell.id="ps-research-theses";shell.setAttribute("aria-label","Source-dated investment reasoning");
 const intro=el("div","psrt-head"),head=el("div");
 head.append(el("p","psrt-kicker","INVESTMENT INTELLIGENCE / 13 NOV BASE CASES + 14 NOV EVENT REVIEW"),
  el("h1",null,"What looks worth investigating — and why"),
  el("p","psrt-lead","Nvidia, Cisco, AI financing and FAA conclusions have been added in Evidence Command above. The issuer comparisons below preserve the prior 13 Nov research; a price decline is not proof of value."));
 intro.append(head,el("span","psrt-research-only","RESEARCH ONLY · NO ORDERS"));shell.append(intro);
 const takeaway=el("div","psrt-summary");
 [["NVT","Best new electrical infrastructure challenger — pending post-acquisition cash and debt"],
  ["CI / CVS","The core healthcare value comparison — profits versus actual cash and claims"],
  ["VRT / MOD","Proven conversion versus faster growth — watch MOD's next cash targets"]].forEach(([symbol,reason])=>{
  const card=el("div","psrt-summary-card");card.append(el("strong",null,symbol),el("p",null,reason));takeaway.append(card);
 });
 shell.append(takeaway);
 shell.append(el("p","psrt-method-note","Continuing 13 Nov comparison edition using source-dated 12 Nov US closes and issuer reports; provider forward multiples and adjusted earnings are not interchangeable with GAAP or distributable free cash flow. Rankings indicate RESEARCH PRIORITY, not purchases."));
 const sectionHead=el("div","psrt-section-heading");
 sectionHead.append(el("h2",null,"Peer decisions"),el("span",null,"Open a case for the evidence, counterargument and next test"));shell.append(sectionHead);
 COMPARISONS.forEach((item,i)=>shell.append(comparisonCard(item,i===0)));
 const adjacent=el("details","psrt-study psrt-drawer");
 adjacent.id="ps-research-adjacent";
 const adjSummary=el("summary","psrt-study-summary");
 adjSummary.append(el("strong",null,"Other opportunities and catalysts"),el("span","psrt-expand-label","6 research watches"));adjacent.append(adjSummary);
 const adjGrid=el("div","psrt-adjacent-grid");
 ADJACENT_CASES.forEach(x=>{
  const c=el("article","psrt-adjacent"),top=el("div","psrt-adjacent-top");
  top.append(el("strong",null,x.ticker),el("span",null,x.lens));c.append(top,el("p",null,x.thesis));
  c.append(el("p","psrt-adjacent-risk","Risk · "+x.risk),el("p","psrt-adjacent-test","Next · "+x.test));
  c.append(external("Issuer evidence",x.source));adjGrid.append(c);
 });
 adjacent.append(adjGrid);shell.append(adjacent);
 const macro=el("details","psrt-study psrt-drawer");macro.id="ps-research-scenarios";
 const summary=el("summary","psrt-study-summary");
 summary.append(el("strong",null,"Scenario resilience and portfolio overlap"),el("span","psrt-expand-label","5 conditional worlds"));macro.append(summary);
 const list=el("div","psrt-scenario-list");
 SCENARIO_READTHROUGH.forEach(([world,exposure,logic])=>{
  const item=el("div","psrt-scenario");
  item.append(el("strong",null,world),el("span",null,exposure),el("p",null,logic));list.append(item);
 });
 macro.append(list,el("p","psrt-method-note","These worlds can overlap; no scenario probabilities, statistical backtest or expected returns are claimed. The Bluebelly macro research and original company filings must be rechecked before a decision."));
 shell.append(macro);
 const method=el("details","psrt-study psrt-drawer");method.id="ps-research-method";
 const mSummary=el("summary","psrt-study-summary");
 mSummary.append(el("strong",null,"How the investment judgment is reached"),el("span","psrt-expand-label","Research method"));method.append(mSummary);
 const methodBody=el("div","psrt-method-body");
 [["1 · Business thesis","What is happening to orders, end-market economics, margins, customer concentration and management?"],
  ["2 · Cash and valuation","Reconcile GAAP, adjusted earnings, working capital, capex, cash accessibility, debt and a realistic valuation denominator."],
  ["3 · Scenario and alternatives","Compare rates, energy disruption, AI capex reset and recession; ask what else the same risk capital could buy."],
  ["4 · Timing and decision","Require fresh price, technical setup, next catalyst and potential invalidation; do not promote a watch into an order automatically."]].forEach(([name,desc])=>methodBody.append(detailLine(name,desc)));
 method.append(methodBody);shell.append(method);
 const links=el("div","psrt-foot");
 links.append(el("p",null,"This is the current review overlay. The original private research library below remains unchanged."));
 links.append(external("Detailed source research on GitHub","https://github.com/clydigital/power-stack/pull/123"));
 shell.append(links);return shell;
}
export function mountResearchTheses(main){
 if(!main||main.querySelector("#ps-research-theses"))return false;
 const section=renderResearchTheses(),legacy=main.querySelector(".ps-legacy-note");
 if(legacy)legacy.after(section);else main.prepend(section);
 return true;
}
