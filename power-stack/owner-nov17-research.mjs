// General public-source market research only. No account, owner, or broker records.
// Rendered only after authenticated owner access; this is not a live trade or an owner decision.
export const EDITION="2026-11-17";
const SECTIONS={
  "index": [
    [
      "Matt · Head of the desk",
      "Physical scarcity is not a buy signal",
      "Urea pricing has weakened and Malaysian palm stocks are still building. Distinguish low-cost nitrogen production, palm operating leverage and grain inventory rather than assuming a universal food shortage.",
      "https://ausfertcorp.com/weekly-update-global-fertiliser-markets-w-e-13-11-2026/"
    ],
    [
      "Sarah · Valuation",
      "CF waits; HSPLANT and SOP merit separate comparison",
      "At the dated 16 Nov CF $119.85 and 10 Nov palm references, the illustrative stress cases show meaningful downside. Cash resilience does not establish a price floor.",
      "https://www.hapsengplantations.com.my/bursa-announcements.html"
    ],
    [
      "David · AI",
      "Recovery remains event-gated",
      "NVIDIA results scheduled 17 Nov US after close; successor, guidance and customer-funded cash conversion matter. No assumed QQQ reversal.",
      "https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Sets-Conference-Call-for-Third-Quarter-Financial-Results/"
    ]
  ],
  "prospects": [
    [
      "HSPLANT · Hap Seng Plantations (5138)",
      "WAIT",
      "H1 operating cash RM140.617m less capex RM33.895m = RM106.722m. Cash and money-market deposits less leases ≈ RM0.887/share; no bank debt reported. Balance-sheet resilience, not a price floor. Next: Require sequential MPOB inventory draw, realised B50 demand, current CPO, costs and normalised cash flow.",
      "https://www.hapsengplantations.com.my/bursa-announcements.html"
    ],
    [
      "CF · CF Industries",
      "WAIT",
      "9M CFO $2.544bn less capex $0.776bn = $1.768bn. Q3 realised urea $423/US short ton vs $450; cost $243 vs $223. Physical urea prices weakened; strong trailing FCF is not trough-cycle value. Next: Confirm actual India tender award, Chinese exports, natural-gas spread, normalised FCF and valuation.",
      "https://www.cfindustries.com/newsroom/2026/cf-9m-2026-earnings"
    ],
    [
      "SOP · Sarawak Oil Palms (5126)",
      "WAIT",
      "H1 attributable earnings RM218m vs RM205.7m; Q2 RM153.7m vs RM91.9m; palm-price operating leverage. RM4.75 reported net assets per share are not cash. Next: Require inventory draw, realised B50 demand, production, issuer debt and full cash flow bridge.",
      "https://www.klsescreener.com/v2/announcements/view/11657125"
    ],
    [
      "NTR · Nutrien",
      "WATCH",
      "9M raw CFO less capex −$133m (seasonal), trailing simple FCF $2.093bn; Q3 adjusted EBITDA down 8%. Next: Compare normalised cash, leverage and farmer affordability.",
      "https://www.nutrien.com/news/press-releases/nutrien-reports-third-quarter-2026-results-1761"
    ],
    [
      "MOS · Mosaic",
      "WATCH",
      "Q3 adjusted EBITDA $324m (−60%); 9M CFO less capex −$402.6m. Recovery requires improving phosphate margins. Next: Confirm falling sulphur input costs and cash conversion.",
      "https://investors.mosaicco.com/press-releases/news-details/2026/The-Mosaic-Company-Reports-Third-Quarter-2026-Results/default.aspx"
    ]
  ],
  "trades": [
    [
      "David · Tech",
      "AMZN / AMD / MU downside hypotheses only",
      "Bearish follow-through is conditional on independently verified 4H/1D EMA-band break and retest. Strong guidance, breadth or a reclaim invalidates it; earnings gaps and borrow costs matter.",
      "https://www.sec.gov/Archives/edgar/data/1769628/000176962826000465/crwv-20260930.htm"
    ],
    [
      "Matt · Reversal",
      "NVDA / AVGO recovery watch",
      "Require actual post-event guidance, cash conversion, improving semiconductor breadth and confirmed daily-band reclaim. No executable setup.",
      "https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Sets-Conference-Call-for-Third-Quarter-Financial-Results/"
    ]
  ],
  "research": [
    [
      "Mike · Nitrogen",
      "Physical price dislocation",
      "13 Nov China granular urea FOB $420/metric tonne; anticipated India CFR ~$375 is not an award. Different freight, grade and units versus issuer US short tons.",
      "https://ausfertcorp.com/weekly-update-global-fertiliser-markets-w-e-13-11-2026/"
    ],
    [
      "Sarah · Palm",
      "Stocks not yet drawing",
      "October MPOB stocks ~3.62Mt, +3.15% monthly despite stronger exports. Require two successive declines and actual B50 volumes.",
      "https://bepi.mpob.gov.my/stat/web_report1.php?val=202684"
    ],
    [
      "Tino · Grain",
      "Inventory tension, not universal shortage",
      "USDA world corn ending stocks forecast 281.94Mt versus prior-season 308.31Mt, but +1.5Mt versus October forecast.",
      "https://esmis.nal.usda.gov/sites/default/release-files/796142/wasde1126.pdf"
    ],
    [
      "David · AI finance",
      "Separate cash receipts from capex",
      "CoreWeave 9M CFO $5.638bn versus PP&E purchases $23.558bn; anticipated deposits not confirmed receipts.",
      "https://www.sec.gov/Archives/edgar/data/1769628/000176962826000465/crwv-20260930.htm"
    ]
  ],
  "bonds": [
    [
      "Jimmy · Rates",
      "Reinvestment is not easing",
      "The NY Fed scheduled approximately $14bn in reinvestment, not a QE or reserve-management purchase signal. Compare duration, actual yields, inflation and FX; no assumed long-bond rally.",
      "https://www.newyorkfed.org/markets/domestic-market-operations/monetary-policy-implementation/treasury-securities/treasury-securities-operational-details"
    ]
  ],
  "holdings": [
    [
      "Risk desk · General portfolio review",
      "Existing exposure is not a new entry",
      "Check real issuer cash generation, sector concentration and verified positions before any capital recycling. Public-company analysis does not establish actual account holdings or available cash.",
      "https://www.cfindustries.com/newsroom/2026/cf-9m-2026-earnings"
    ]
  ]
};
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
export function mountNov17Research(page,main){
 if(!main)return;
 const render=()=>{
  main.querySelector("#nov17-research")?.remove();
  const key=page==="ideas"?(location.hash==="#trades"?"trades":"prospects"):page==="portfolio"?(location.hash==="#bonds"?"bonds":"holdings"):page;
  const rows=SECTIONS[key];if(!rows)return;
  const box=el("section","pscr-root");box.id="nov17-research";box.setAttribute("aria-label","17 November market research");
  const upper=el("div","pscr-upper");
  upper.append(el("span","pscr-kicker","MATT'S TEAM · PUBLIC-SOURCE RESEARCH"),el("span","pscr-date","17 NOV 2026"));
  box.append(upper,el("h2","pscr-title",key==="prospects"?"Food and fertiliser: cash before scarcity":key==="trades"?"Trade watch · confirmation first":key==="bonds"?"Rates · no assumed easing":"New findings · 17 November"));
  const grid=el("div","pscr-grid");
  for(const [name,headline,body,source] of rows){const card=el("article","pscr-card");card.append(el("span","pscr-kicker",name),el("h3",null,headline),el("p","pscr-reason",body));const a=el("a","pscr-case-link","Original source ↗");a.href=source;a.target="_blank";a.rel="noopener noreferrer";card.append(a);grid.append(card);}
  box.append(grid,el("p","pscr-footnote","Dated research only. No broker data, current account decision, live quote or order. Existing private records are unchanged."));
  const anchor=page==="index"?main.querySelector("#war-room"):main.querySelector(".pscr-root");
  if(anchor)anchor.before(box);else main.prepend(box);
 };
 render();if(page==="ideas"||page==="portfolio")window.addEventListener("hashchange",render);
}
