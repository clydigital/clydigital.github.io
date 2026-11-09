// Owner-only market presentation selectors. Never infer a current broker holding from research.
export const BOND_ETFS = new Set([
 "TLT","TLH","IEF","EDV","ZROZ","GOVT","SHY","SGOV","USFR","TIP","AGG","LQD","HYG"
]);
const validTicker = value => {
 const ticker=String(value||"").trim().toUpperCase();
 return /^[A-Z0-9][A-Z0-9.\-]{0,17}$/.test(ticker)?ticker:"";
};
const rows = value => Array.isArray(value)?value.filter(x=>x&&typeof x==="object"&&!Array.isArray(x)):[];
const number = value => typeof value==="number"&&Number.isFinite(value)?value:null;
export const isBondEtf = ticker => BOND_ETFS.has(validTicker(ticker));

/** Snapshot is historical; caller must show its date and a broker-unverified label. */
export function recordedHoldings(snapshot,quoteMap=new Map()){
 return rows(snapshot?.holdings).map(h=>{
  const ticker=validTicker(h.ticker);if(!ticker)return null;
  const p=h.position&&typeof h.position==="object"?h.position:{};
  return {ticker,name:String(h.name||ticker).slice(0,100),quantity:number(p.quantity),
   quantityAsOf:String(p.quantityAsOf||"").slice(0,30),
   currency:String(p.currency||"").slice(0,6),quote:quoteMap.get(ticker)||null};
 }).filter(Boolean);
}
/** Bond ETFs are analyzed as duration/credit instruments, not on company PEG. */
export function bondWatch(ideas,quoteMap=new Map()){
 return rows(ideas).filter(x=>isBondEtf(x.ticker)).map(x=>{
  const ticker=validTicker(x.ticker);
  return {ticker,name:String(x.name||ticker).slice(0,110),quote:quoteMap.get(ticker)||null,
   macroState:String(x.macro_state||"UNKNOWN"),macroAsOf:String(x.macro_as_of||""),
   macroReason:String(x.macro_reason||""),note:String(x.note||""),
   watchLow:number(x.watch_low),watchHigh:number(x.watch_high),
   currency:String(x.currency||"USD"),type:String(x.idea_type||"INVESTMENT")};
 }).sort((a,b)=> (a.ticker==="TLT"?-1:b.ticker==="TLT"?1:0)||a.ticker.localeCompare(b.ticker));
}
/** The quote universe is not the owner's portfolio. Keep each membership flag explicit. */
export function expandMarketRows(base,ideas,feed,quoteMap=new Map()){
 const combined=new Map();
 const marketTickers=new Set(rows(feed?.rows).slice(0,100).map(x=>validTicker(x.ticker)).filter(Boolean));
 for(const line of rows(base)){
  const ticker=validTicker(line.ticker);if(ticker)combined.set(ticker,{
   ...line,ticker,ideaTracked:false,bond:isBondEtf(ticker),marketOnly:false,
   marketTracked:marketTickers.has(ticker)
  });
 }
 for(const idea of rows(ideas)){
  const ticker=validTicker(idea.ticker);if(!ticker)continue;
  const old=combined.get(ticker),quote=quoteMap.get(ticker);
  combined.set(ticker,{
   ticker,name:old?.name||String(idea.name||ticker).slice(0,110),
   held:old?.held||false,onWatchlist:old?.onWatchlist||false,
   ideaTracked:true,bond:isBondEtf(ticker),marketOnly:false,
   marketTracked:marketTickers.has(ticker),
   quantity:old?.quantity??null,quantityAsOf:old?.quantityAsOf||"",
   currency:quote?.currency||old?.currency||String(idea.currency||""),
   close:quote?.close??old?.close??null,day:quote?.day??old?.day??null,
   threeDay:quote?.threeDay??old?.threeDay??null,fiveDay:quote?.fiveDay??old?.fiveDay??null,
   session:quote?.session||old?.session||null,basis:quote?.basis||old?.basis||"",
   action:old?.action||"",thesis:old?.thesis||String(idea.macro_reason||"").slice(0,250),
   entry:old?.entry||"",invalidation:old?.invalidation||""
  });
 }
 for(const raw of rows(feed?.rows).slice(0,100)){
  const ticker=validTicker(raw.ticker);if(!ticker||combined.has(ticker))continue;
  const quote=quoteMap.get(ticker);
  combined.set(ticker,{ticker,name:ticker,held:false,onWatchlist:false,
   ideaTracked:false,bond:isBondEtf(ticker),marketOnly:true,marketTracked:true,
   quantity:null,quantityAsOf:"",currency:quote?.currency||String(raw.currency||""),
   close:quote?.close??null,day:quote?.day??null,threeDay:quote?.threeDay??null,
   fiveDay:quote?.fiveDay??null,session:quote?.session||null,basis:quote?.basis||"",
   action:"",thesis:"",entry:"",invalidation:""});
 }
 return [...combined.values()];
}
