/**
 * Completed-session, deterministic technical observations for the existing
 * independent delayed price refresh. Never produces executable trade signals.
 * Bands use EMA(n) plus/minus population SD of the last n unadjusted closes.
 * A "retest" on 4H is NOT measured by daily bars.
 */
export const TECHNICAL_CONTRACT="power-stack-daily-technicals/1";
const finite=x=>typeof x==="number"&&Number.isFinite(x);
const round=(n,p=3)=>finite(n)?Number(n.toFixed(p)):null;
const periods=[{n:20,m:1},{n:50,m:1},{n:100,m:.5},{n:200,m:.25}];
const validDay=d=>typeof d==="string"&&/^20\d{2}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d+"T12:00:00Z"));
function emaSeries(values,n){
 const alpha=2/(n+1),out=[];
 for(let i=0;i<values.length;i++)out.push(i===0?values[0]:alpha*values[i]+(1-alpha)*out[i-1]);
 return out;
}
function std(values){
 const avg=values.reduce((s,v)=>s+v,0)/values.length;
 return Math.sqrt(values.reduce((s,v)=>s+(v-avg)**2,0)/values.length);
}
export function rsiSeries(closes,period=14){
 if(!Array.isArray(closes)||closes.length<period+1)return [];
 const out=Array(closes.length).fill(null);
 let gain=0,loss=0;
 for(let i=1;i<=period;i++){const diff=closes[i]-closes[i-1];gain+=Math.max(0,diff);loss+=Math.max(0,-diff);}
 gain/=period;loss/=period;
 const score=()=>loss===0?(gain===0?50:100):100-100/(1+gain/loss);
 out[period]=score();
 for(let i=period+1;i<closes.length;i++){
  const change=closes[i]-closes[i-1];
  gain=(gain*(period-1)+Math.max(change,0))/period;
  loss=(loss*(period-1)+Math.max(-change,0))/period;
  out[i]=score();
 }
 return out;
}
function bandAt(closes,ema,i,n,m){
 if(i<n-1)return null;
 const sd=std(closes.slice(i-n+1,i+1));
 return {basis:ema[i],lower:ema[i]-m*sd,upper:ema[i]+m*sd};
}
function bandSide(close,b){
 if(close>b.upper)return "ABOVE_UPPER";
 if(close<b.lower)return "BELOW_LOWER";
 return "INSIDE";
}
function noTechnical(sessionDate,reason){
 return {contractVersion:TECHNICAL_CONTRACT,status:"UNAVAILABLE",asOf:sessionDate||null,timeframe:"1D",
  reason,indicatorBasis:"Completed daily unadjusted OHLC; not 4H, intraday, broker or split-adjusted"};
}
export function calculateDailyTechnical(input,{sessionDate=null}={}){
 // The price collector already filters current/incomplete sessions and sorts by date.
 const bars=Array.isArray(input)?input:[];
 if(bars.length<250)return noTechnical(sessionDate,"NEED_250_COMPLETED_SESSIONS");
 if(!bars.every((b,i)=>validDay(b.sessionDate)&&finite(b.close)&&b.close>0&&
  (i===0||bars[i-1].sessionDate<b.sessionDate)))
  return noTechnical(sessionDate,"BAD_OR_UNSORTED_COMPLETED_BARS");
 const last=bars.at(-1);
 if(sessionDate!==last.sessionDate)return noTechnical(sessionDate,"AS_OF_MISMATCH");
 const closes=bars.map(b=>b.close),i=closes.length-1;
 // A split / bad candle during the longest EMA window renders unadjusted EMA
 // unreliable. Do not silently generate a trend following that discontinuity.
 for(let j=Math.max(1,i-249);j<=i;j++){
  const ratio=closes[j]/closes[j-1];
  if(ratio>1.8||ratio<.55)return noTechnical(sessionDate,"UNADJUSTED_PRICE_DISCONTINUITY_REVIEW");
 }
 const bands={};let last20=null,prior20=null;
 for(const {n,m} of periods){
  const e=emaSeries(closes,n),current=bandAt(closes,e,i,n,m);
  const previous=bandAt(closes,e,i-1,n,m);
  if(!current||!previous)return noTechnical(sessionDate,"BAND_HISTORY_MISSING");
  bands[String(n)]={basis:round(current.basis),lower:round(current.lower),upper:round(current.upper),
   sdMultiplier:m,state:bandSide(closes[i],current)};
  if(n===20){last20=current;prior20=previous;}
 }
 let event="NONE";
 const prev=closes[i-1];
 if(prev<prior20.lower&&last.close>=last20.lower&&last.close<=last20.upper)event="RECOVERED_LOWER_BAND";
 else if(prev>prior20.upper&&last.close<=last20.upper&&last.close>=last20.lower)event="REJECTED_UPPER_BAND";
 else if(prev>=prior20.lower&&last.close<last20.lower)event="BROKE_LOWER_BAND";
 else if(prev<=prior20.upper&&last.close>last20.upper)event="BROKE_UPPER_BAND";
 const rsis=rsiSeries(closes);
 const recentRsi=rsis.slice(-14).filter(finite);
 const high=Math.max(...recentRsi),low=Math.min(...recentRsi);
 const stoch=recentRsi.length===14?(high===low?50:100*(recentRsi.at(-1)-low)/(high-low)):null;
 const candleReliable=bars.slice(-21).every(b=>finite(b.high)&&finite(b.low)&&b.high>=b.low&&
  b.high>=b.close&&b.low<=b.close);
 const prior20Bars=bars.slice(-21,-1);
 const priorHigh=candleReliable?Math.max(...prior20Bars.map(b=>b.high)):null;
 const priorLow=candleReliable?Math.min(...prior20Bars.map(b=>b.low)):null;
 const donchian=candleReliable?
  (last.close>priorHigh?"CLOSE_ABOVE_PRIOR_20_HIGH":
    last.close<priorLow?"CLOSE_BELOW_PRIOR_20_LOW":"INSIDE_PRIOR_20_RANGE"):
  "UNAVAILABLE_OHLC";
 const volumeHistory=bars.slice(-21,-1).map(b=>b.volume);
 const volumeReady=finite(last.volume)&&volumeHistory.every(finite)&&volumeHistory.some(v=>v>0);
 const meanVolume=volumeReady?volumeHistory.reduce((s,v)=>s+v,0)/20:null;
 const volumeRatio=meanVolume>0?round(last.volume/meanVolume,2):null;
 return {contractVersion:TECHNICAL_CONTRACT,status:"OBSERVED",asOf:sessionDate,timeframe:"1D",
  indicatorBasis:"Completed daily unadjusted OHLC; EMA + rolling close SD; not 4H or corporate-action-adjusted",
  lookbackSessions:bars.length,
  emaBands:bands,band20Event:event,donchian20:donchian,
  stochRsi14:round(stoch,1),stochRsiZone:stoch===null?"UNAVAILABLE":
   stoch>=80?"OVERBOUGHT":stoch<=20?"OVERSOLD":"NEUTRAL",
  rsi14:round(rsis.at(-1),1),volumeToPrior20:volumeRatio};
}
