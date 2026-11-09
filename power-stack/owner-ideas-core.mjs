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
const finite = x => x!==null&&x!==undefined&&x!==""&&Number.isFinite(Number(x))
  ? Number(x):null;
export function assessIdea(idea,quote,now=new Date()) {
  const peg=finite(idea?.peg),low=finite(idea?.watch_low),high=finite(idea?.watch_high);
  const price=finite(quote?.close);
  const pegVerified=peg!==null&&peg>0&&peg<100
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
  if(!pegVerified)why="PEG needs a current dated source and growth methodology.";
  else if(!macroVerified)why="Macro assessment needs fresh dated evidence.";
  else if(!zoneVerified)why="A numeric entry/watch price range has not been set.";
  else if(!priceVerified)why="A verified recent market-close price is unavailable.";
  else if(idea.macro_state==="ADVERSE"&&peg<1) {
    status="DIVERGENCE";why="Low PEG conflicts with adverse macro conditions: possible value trap.";
  } else if(idea.macro_state==="SUPPORTIVE"&&peg>=1) {
    status="DIVERGENCE";why="Supportive macro, but PEG does not clear the valuation gate.";
  } else if(idea.macro_state==="SUPPORTIVE"&&peg<1&&price>=low&&price<=high) {
    status="ALIGNED";why="PEG below 1, supportive macro, and price inside the stated zone. Review company earnings and risk before any purchase.";
  } else if(idea.macro_state==="SUPPORTIVE"&&peg<1&&price>high) {
    status="WATCH";why="PEG and macro align, but price remains above the entry/watch zone.";
  } else if(idea.macro_state==="SUPPORTIVE"&&peg<1&&price<low) {
    status="RECHECK";why="Price has broken below the watch zone; recheck the thesis before treating this as a bargain.";
  } else if(idea.macro_state==="MIXED"&&peg<1) {
    status="WATCH";why="PEG is attractive, but macro has not aligned.";
  } else {
    status="WATCH";why="Research inputs are current, but valuation and macro are not both supportive.";
  }
  return {status,why,pegVerified,macroVerified,zoneVerified,priceVerified,distance,price,low,high,peg};
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
