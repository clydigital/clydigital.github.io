/* Reviewed event facts as of 14 Nov 2026, and already-published issuer evidence.
   This is a source-dated research edition, NOT a live news feed. Replace this
   snapshot with newly verified evidence rather than silently changing its date. */
import {LENS_CASES} from "./owner-opportunity-lenses.mjs?v=20261113-guildlens1";
import {COMPARISONS} from "./owner-research-theses.mjs?v=20261113-research1";
export const BRIEFING_EDITION="2026-11-14";
const lens=ticker=>LENS_CASES.find(x=>x.ticker===ticker);
const comparison=id=>COMPARISONS.find(x=>x.id===id);
const finding=(x)=>Object.freeze(x);
export const VERIFIED_FINDINGS=Object.freeze([
 finding({id:"rate-cpi",desk:"rates",symbol:"CPI / PPI",headline:"Monthly inflation eased — the inflation problem did not disappear",
  fact:"October CPI rose 0.4% after 0.6% in September; core CPI rose 0.3%. October PPI rose 0.3%, but annual PPI reached 6.5%.",
  why:"A sequential slowdown in prices and still-high annual inflation can coexist. One softer monthly PPI print does not establish a sustained disinflation trend.",
  call:"HOLD THE RATE-RISK CAUTION. Don't treat softer PPI as a confirmed TLT buy signal.",
  change:"Cooling core inflation plus a decline in long real yields across matched sessions would improve the duration case.",
  posture:"STICKY / MIXED",asOf:"2026-11-13",source:"https://www.bls.gov/news.release/cpi.nr0.htm",secondary:"https://www.bls.gov/news.release/ppi.nr0.htm",featured:true}),
 finding({id:"rate-yield",desk:"rates",symbol:"10Y / TLT",headline:"The long end is still imposing a high discount rate",
  fact:"Friday's 10-year Treasury yield was reported at 5.133%, while the 2-year yield was about 4.850%.",
  why:"Higher long yields raise the hurdle rate for distant corporate earnings and keep long-duration bond ETFs sensitive to further yield rises.",
  call:"TLT: WAIT for a verified yield and real-rate reversal; shorter duration remains the comparison.",
  change:"A sustained decline in the 10-year real and nominal yield, with TLT reclaiming trend structure.",
  posture:"WAIT / DURATION",asOf:"2026-11-13",source:"https://www.wsj.com/economy/central-banking/upward-pressure-remains-in-treasury-yields-even-as-two-year-yield-stabilizes-0c267082",featured:true}),
 finding({id:"ai-nvda",desk:"ai",symbol:"NVDA",headline:"Nvidia's CEO transition is confirmed; earnings remain the next test",
  fact:"Nvidia announced Jensen Huang's immediate resignation and named CFO Colette Kress interim CEO on 12 November. Third-quarter fiscal 2027 results are scheduled for 17 November.",
  why:"Succession and governance uncertainty alter the risk premium, but do not alone prove GPU demand, margins or customer orders have deteriorated.",
  call:"NVDA: KEEP THE NEW-ENTRY EVENT VETO until guidance and successor risk can be re-underwritten.",
  change:"Confirmed continuity in guidance, capex-backed demand, financing and post-results price acceptance would reopen the case.",
  posture:"EVENT VETO",asOf:"2026-11-12",source:"https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition/",featured:true}),
 finding({id:"ai-cooling",desk:"ai",symbol:"VRT / MOD",headline:"Vertiv's demonstrated cash generation leads the cooling pair",
  fact:comparison("cooling")?.facts?.map(x=>x.line).join(" · ")||"The 13 November issuer comparison places VRT ahead on demonstrated cash generation; MOD retains faster-growth optionality.",
  why:comparison("cooling")?.reason||"High order growth does not necessarily become free cash flow after expansion spending.",
  call:comparison("cooling")?.take||"VRT is the cash-quality leader; MOD remains conditional.",
  change:comparison("cooling")?.counter||"Normalised free cash flow and margins changing materially would alter the relative assessment.",
  posture:"PREFER CASH QUALITY",asOf:comparison("cooling")?.asOf||"2026-11-13",
  source:comparison("cooling")?.facts?.find(x=>x.ticker==="VRT")?.source||lens("VRT")?.source,featured:false}),
 finding({id:"ai-googl",desk:"ai",symbol:"GOOGL",headline:"Alphabet's profitable operations make it a stronger AI quality test",
  fact:lens("GOOGL")?.why||"Profitable cloud and search operations support cash generation despite rising AI infrastructure spend.",
  why:"Revenue is not the same as owner cash after capital expenditure. Hyperscalers can outperform leveraged AI operators even if GPU spending stays high.",
  call:"GOOGL: QUALITY WATCH — compare earnings, cash conversion and relative strength; not an automatic buy.",
  change:"Weakening cloud/search profitability or capex outgrowing sustainable cash conversion.",
  posture:"QUALITY WATCH",asOf:lens("GOOGL")?.evidenceAsOf||"2026-11-13",source:lens("GOOGL")?.source,featured:false}),
 finding({id:"energy-crude",desk:"energy",symbol:"BRENT / CVX",headline:"Crude lost about 2.5% this week despite Strait of Hormuz risks",
  fact:"Brent settled near $95.84 and WTI near $88.56 on 13 November; both benchmarks lost roughly 2.5% over the week. Shipping attacks remain a live supply risk.",
  why:"Supply-surplus and softer demand expectations are currently competing with war premia. A weaker oil price changes the case for automatically overweighting producers.",
  call:"CVX/XOM: CONDITIONAL WATCH, not a blanket energy buy. Track delivered-product shortages separately from crude.",
  change:"Persistent supply disruption, widening distillate cracks or sustained safe transit would change this balance.",
  posture:"REASSESS ENERGY",asOf:"2026-11-13",source:"https://www.reuters.com/business/energy/oil-prices-set-second-weekly-decline-trump-stay-with-iran-blockade-2026-11-13/",featured:true}),
 finding({id:"faa-disruption",desk:"aviation",symbol:"FAA / AIRLINES",headline:"Nationwide FAA ground stop is a real network shock, not yet a new macro regime",
  fact:"The FAA ordered a nationwide departure ground stop on 13 November after communications failures affected all 22 regional air-traffic control centres.",
  why:"Grounded departures displace aircraft and crews, but economic damage depends on disruption duration and the subsequent recovery. The outage cause and nationwide recovery status were not independently resolved in this edition.",
  call:"AIRLINES: EVENT-RISK WATCH. Do not extrapolate one incident into an economy-wide recession.",
  change:"A verified multi-day backlog or a documented rapid all-clear changes the operational exposure assessment.",
  posture:"INCIDENT / UNRESOLVED",asOf:"2026-11-13",source:"https://apnews.com/article/f81b0904331dafad6133f291e5f531a8",featured:true}),
 finding({id:"faa-contractor",desk:"aviation",symbol:"LHX",headline:"L3Harris already has an FAA modernisation contract — not a new windfall",
  fact:"L3Harris said its July 2026 contract covers upgrades to more than 700 aircraft-surveillance ground stations and continued operation of the tracking network through 2045.",
  why:"An awarded contract is real commercial evidence; Friday's outage is not proof the contractor received additional funding or that its earnings increased.",
  call:"LHX: INFRASTRUCTURE WATCH, not an outage-driven buy signal.",
  change:"An incremental awarded contract, disclosed order economics and a defensible valuation would strengthen the case.",
  posture:"AWARDED / NO NEW ORDER",asOf:"2026-07-01",source:"https://www.l3harris.com/newsroom/press-release/2026/07/faa-awards-l3harris-airspace-surveillance-modernization-contract",featured:false}),
 finding({id:"selection-nvt",desk:"selection",symbol:"NVT / ETN",headline:"nVent's growth challenges Eaton's valuation premium",
  fact:comparison("electrical")?.facts?.map(x=>x.line).join(" · ")||"The 13 November electrical infrastructure comparison reviews faster nVent organic growth against Eaton's earnings multiple.",
  why:comparison("electrical")?.reason||"Faster organic demand growth may produce a valuation opportunity, but debt and acquisition costs can erase the headline discount.",
  call:comparison("electrical")?.take||"NVT leads the next valuation comparison; ETN remains the quality benchmark.",
  change:comparison("electrical")?.counter||"Acquisition debt and normalised cash flow could invalidate the apparent discount.",
  posture:"VALUE COMPARISON",asOf:comparison("electrical")?.asOf||"2026-11-13",source:comparison("electrical")?.facts?.find(x=>x.ticker==="NVT")?.source||lens("NVT")?.source,featured:true}),
 finding({id:"selection-health",desk:"selection",symbol:"CI / CVS / BDX",headline:"Healthcare opportunities are not interchangeable",
  fact:comparison("healthcare")?.facts?.map(x=>x.line).join(" · ")||"Issuer evidence shows different economics across pharmacy benefits, insurance claims and medical technology.",
  why:comparison("healthcare")?.reason||"Cigna's low earnings multiple, CVS's claims recovery and BDX's medical-device cash differ in resilience and risks.",
  call:comparison("healthcare")?.take||"Compare CI value, CVS turnaround and BDX diversification separately.",
  change:comparison("healthcare")?.counter||"Changes to claims costs, policy exposure, debt and free cash flow.",
  posture:"SELECTIVE VALUE",asOf:comparison("healthcare")?.asOf||"2026-11-13",source:comparison("healthcare")?.facts?.find(x=>x.ticker==="CVS")?.source||lens("CVS")?.source,featured:false}),
 finding({id:"selection-cf",desk:"selection",symbol:"CF",headline:"Fertiliser cash generation is a non-AI alternative — but the cycle matters",
  fact:lens("CF")?.why||"CF's trailing cash generation is strong, but may not describe midcycle profitability.",
  why:"A cheap-looking cash yield can reverse when nitrogen prices normalise or natural gas costs rise.",
  call:"CF: COMPARE normalised cash flow and valuation before treating it as a defensive stock.",
  change:"Sustained deterioration in nitrogen spreads, gas input costs or adjusted free cash flow.",
  posture:"MIDCYCLE CHECK",asOf:lens("CF")?.evidenceAsOf||"2026-11-13",source:lens("CF")?.source,featured:false})
]);
export const DESK_ORDER=["matt","rates","ai","energy","aviation","selection"];
export function findingsForDesk(desk,records=VERIFIED_FINDINGS){
 return desk==="matt"?records.filter(x=>x.featured):records.filter(x=>x.desk===desk);
}
export function validateFinding(x){
 return Boolean(x?.id&&x?.desk&&x?.headline&&x?.fact&&x?.why&&x?.call&&x?.change&&/^20\d\d-\d\d-\d\d$/.test(x.asOf||"")
 && typeof x.source==="string"&&x.source.startsWith("https://")&&!x.source.includes("@"));
}
