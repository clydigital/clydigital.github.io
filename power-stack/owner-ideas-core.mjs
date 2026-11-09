// Pure, dependency-free alignment logic. Research inputs are owner-private and dated.
export const IDEA_CONTRACT = "power-stack-idea-alignment/1";
const day = x => typeof x === "string" && /^20\d{2}-\d{2}-\d{2}$/.test(x)
  ? Date.parse(x+"T00:00:00Z") : NaN;
export function freshDate(value,maxDays,now=new Date()) {
  const stamp=day(value),today=Date.parse(now.toISOString().slice(0,10)+"T00:00:00Z");
  return Number.isFinite(stamp)&&stamp<=today&&today-stamp<=maxDays*86400000;
}
export const approvedEvidence = value => {
  try {
    const u=new URL(value);
    return u.protocol==="https:"&&!u.username&&!u.password&&u.href.length<2000;
  } catch {return false;}
};
// Non-authoritative, conservative pre-screen safeguards. Add issuer classification
// only from reviewed research; unknown instruments never get a buy-like green state.
const ETFS=new Set(["ARKK","DIA","GDX","GLD","GLDM","HYG","IEF","IGV","IWM","LQD","QQQ","RSP","SGOV","SMH","SOXX","SPY","SPYG","SPYV","TLT","VGIT","VOO","VTI","XLK","XLE","XLF","XLI","XLP","XLU","XLY","XLB","XLC","XLV","RSP","RSPT","VUG"]);
const CYCLICALS=new Set(["CF","NTR","XOM","CVX","MPC","PSX","SLB","BKR","HAL","FCX","BG","DAYANG","HIBISCS"]);
const FINTECH=new Set(["GRAB"]);
export function pegSuitability(idea){
 const ticker=String(idea?.ticker||"").trim().toUpperCase();
 const name=String(idea?.name||"");
 if(ETFS.has(ticker)||/(?:\\bETF\\b|exchange.traded fund|\\bindex fund\\b)/i.test(name)||
  ["ETF","FUND"].includes(String(idea?.instrument_kind||"").toUpperCase()))
  return {status:"NOT_APPLICABLE",reason:"Fund instrument: single-company PEG is not meaningful; use fund costs, exposures and benchmark valuation."};
 if(FINTECH.has(ticker))return {status:"LOW_CONFIDENCE",reason:"Platform/fintech: reconcile credit assets and GAAP versus adjusted cash-flow before valuing growth."};
 if(CYCLICALS.has(ticker))return {status:"LOW_CONFIDENCE",reason:"Cyclical issuer: normalize the commodity cycle and earnings base before relying on PEG."};
 if(ticker==="TSM")return {status:"FORECAST_SENSITIVE",reason:"Advanced-node growth could justify valuation, but projected EPS growth and capex cycles need underwriting."};
 return {status:"UNCLASSIFIED",reason:"Business model and projected diluted EPS growth have not been independently underwritten."};
}
const finite = x => x!==null&&x!==undefined&&x!==""&&Number.isFinite(Number(x))
  ? Number(x):null;
export function assessIdea(idea,quote,now=new Date()) {
  const peg=finite(idea?.peg),low=finite(idea?.watch_low),high=finite(idea?.watch_high);
  const price=finite(quote?.close);
  const suitability=pegSuitability(idea);
  const pegVerified=suitability.status!=="NOT_APPLICABLE"&&peg!==null&&peg>0&&peg<100
    &&freshDate(idea?.peg_as_of,45,now)
    &&approvedEvidence(idea?.peg_source_url)
    &&String(idea?.peg_basis||"").trim().length>=5;
  const macroVerified=["SUPPORTIVE","MIXED","ADVERSE"].includes(idea?.macro_state)
    &&freshDate(idea?.macro_as_of,14,now)
    &&approvedEvidence(idea?.macro_source_url)
    &&String(idea?.macro_reason||"").trim().length>=5;
  const zoneVerified=low!==null&&high!==null&&low>0&&high>=low;
  // loadPriceFeed/quotes upstream guarantees a source-qualified recent completed session.
  const priceVerified=price!==null&&price>0&&typeof quote?.session==="string"
    &&freshDate(quote.session,7,now);
  const distance=priceVerified&&zoneVerified
    ? price>high?100*(price-high)/high:price<low?-100*(low-price)/low:0:null;
  let status="RECHECK",why="PEG, macro evidence, price or watch zone needs verification.";
  if(suitability.status==="NOT_APPLICABLE")why=suitability.reason;
  else if(!pegVerified)why="PEG needs a current dated source and growth methodology.";
  else if(!macroVerified)why="Macro assessment needs fresh dated evidence.";
  else if(!zoneVerified)why="A numeric entry/watch price range has not been set.";
  else if(!priceVerified)why="A verified recent market-close price is unavailable.";
  else if(suitability.status==="LOW_CONFIDENCE") {
    status="WATCH";why="PEG, macro and watch-price inputs are only a research lead. "+suitability.reason;
  } else if(suitability.status==="UNCLASSIFIED") {
    status="WATCH";why="Inputs may match, but an investor-framework suitability review is required. "+suitability.reason;
  } else if(idea.macro_state==="ADVERSE"&&peg<1) {
    status="DIVERGENCE";why="Low PEG conflicts with adverse macro conditions: possible value trap.";
  } else if(idea.macro_state==="SUPPORTIVE"&&peg>=1) {
    status="DIVERGENCE";why="Supportive macro, but PEG does not clear the valuation gate.";
  } else if(idea.macro_state==="SUPPORTIVE"&&peg<1&&price>=low&&price<=high) {
    status="ALIGNED";why="PEG, macro and watch-price inputs match for further research, NOT a buy signal. "+suitability.reason;
  } else if(idea.macro_state==="SUPPORTIVE"&&peg<1&&price>high) {
    status="WATCH";why="PEG and macro align, but price remains above the entry/watch zone.";
  } else if(idea.macro_state==="SUPPORTIVE"&&peg<1&&price<low) {
    status="RECHECK";why="Price has broken below the watch zone; recheck the thesis before treating this as a bargain.";
  } else if(idea.macro_state==="MIXED"&&peg<1) {
    status="WATCH";why="PEG is attractive, but macro has not aligned.";
  } else {
    status="WATCH";why="Research inputs are current, but valuation and macro are not both supportive.";
  }
  return {status,why,pegVerified,macroVerified,zoneVerified,priceVerified,distance,price,low,high,peg,pegSuitability:suitability.status,pegSuitabilityReason:suitability.reason};
}
export function sweepSignals(ideas,quoteMap,now=new Date()) {
  return (Array.isArray(ideas)?ideas:[]).map(idea=>({
    ticker:idea.ticker,
    idea_type:idea.idea_type,
    ...assessIdea(idea,quoteMap?.get(idea.ticker),now),
  })).sort((a,b)=>({ALIGNED:0,DIVERGENCE:1,WATCH:2,RECHECK:3}[a.status]??4)
    -({ALIGNED:0,DIVERGENCE:1,WATCH:2,RECHECK:3}[b.status]??4)
    ||a.ticker.localeCompare(b.ticker));
}
