import test from "node:test";
import assert from "node:assert/strict";
import {calculateDailyTechnical,rsiSeries,TECHNICAL_CONTRACT} from "./price-technicals.mjs";
import {validatedDailyTechnical,quotes} from "../owner-portfolio-table.mjs";
import {opportunityState,OPPORTUNITIES,scanMarketOpportunities} from "../owner-opportunity-terminal.mjs";
function dailyBars(count=300){
 const out=[];let d=new Date("2025-07-01T12:00:00Z");
 for(let i=0;out.length<count;i++,d=new Date(d.getTime()+86400000)){
  if([0,6].includes(d.getUTCDay()))continue;
  const close=100+out.length*.07+Math.sin(out.length/5)*.4;
  out.push({sessionDate:d.toISOString().slice(0,10),close,
    high:close+1,low:close-1,volume:1000+out.length});
 }
 return out;
}
test("250-session minimum blocks synthetic EMA200 and signals remain unavailable",()=>{
 const bars=dailyBars(240),t=calculateDailyTechnical(bars,{sessionDate:bars.at(-1).sessionDate});
 assert.equal(t.status,"UNAVAILABLE");
 assert.equal(t.reason,"NEED_250_COMPLETED_SESSIONS");
 assert.equal(validatedDailyTechnical(t,t.asOf,100),null);
});
test("complete unadjusted OHLC creates four correct EMA+SD bands, RSI and Donchian",()=>{
 const bars=dailyBars();
 const last=bars.at(-1),t=calculateDailyTechnical(bars,{sessionDate:last.sessionDate});
 assert.equal(t.contractVersion,TECHNICAL_CONTRACT);assert.equal(t.status,"OBSERVED");
 assert.equal(t.asOf,last.sessionDate);
 for(const [n,m] of [[20,1],[50,1],[100,.5],[200,.25]]){
  const b=t.emaBands[n];assert.equal(b.sdMultiplier,m);
  assert(b.lower<=b.basis&&b.basis<=b.upper);
 }
 assert(["INSIDE_PRIOR_20_RANGE","CLOSE_ABOVE_PRIOR_20_HIGH","CLOSE_BELOW_PRIOR_20_LOW"].includes(t.donchian20));
 assert(t.stochRsi14>=0&&t.stochRsi14<=100);
 assert.notEqual(validatedDailyTechnical(t,last.sessionDate,last.close),null);
 assert.equal(validatedDailyTechnical(t,"2026-11-10",last.close),null);
});
test("Donchian uses PRIOR 20 days, not the current candle",()=>{
 const bars=dailyBars();bars.at(-1).close+=9;bars.at(-1).high=bars.at(-1).close+1;
 const t=calculateDailyTechnical(bars,{sessionDate:bars.at(-1).sessionDate});
 assert.equal(t.status,"OBSERVED");
 assert.equal(t.donchian20,"CLOSE_ABOVE_PRIOR_20_HIGH");
 assert(["BROKE_UPPER_BAND","NONE"].includes(t.band20Event));
});
test("recovery/rejection are previous-day transitions, no hindsight future daily bars",()=>{
 const bars=dailyBars();
 bars.at(-2).close-=12;bars.at(-2).high=bars.at(-2).close+1;bars.at(-2).low=bars.at(-2).close-1;
 const date=bars.at(-1).sessionDate;
 const t=calculateDailyTechnical(bars,{sessionDate:date});
 assert.equal(t.asOf,date);
 assert.equal(t.status,"OBSERVED");
 assert.notEqual(t.band20Event,"REJECTED_UPPER_BAND");
});
test("split-like discontinuities, missing OHLC and dates fail closed",()=>{
 const bars=dailyBars();
 const broken=bars.map(x=>({...x}));
 broken[220].close*=.4;
 assert.equal(calculateDailyTechnical(broken,{sessionDate:broken.at(-1).sessionDate}).status,"UNAVAILABLE");
 assert.equal(calculateDailyTechnical(bars,{sessionDate:"2026-11-09"}).reason,"AS_OF_MISMATCH");
 const thin=bars.map(x=>({...x,high:null,low:null}));
 const t=calculateDailyTechnical(thin,{sessionDate:thin.at(-1).sessionDate});
 assert.equal(t.donchian20,"UNAVAILABLE_OHLC");
});
test("consumer only sees technicals from same vetted source and same session",()=>{
 const bars=dailyBars(),last=bars.at(-1),technical=calculateDailyTechnical(bars,{sessionDate:last.sessionDate});
 const feed={rows:[{ticker:"XOM",status:"CLOSED",sessionDate:last.sessionDate,currency:"USD",close:last.close,
  sourceUrl:"https://query2.finance.yahoo.com/v8/finance/chart/XOM?interval=1d&range=2y&includePrePost=false",
  changePct:1,technicals:technical}]};
 const now=new Date(Date.parse(last.sessionDate+"T20:00:00Z"));
 const m=quotes(feed,now).watch;assert.equal(m.get("XOM")?.technical?.asOf,last.sessionDate);
 const bad=quotes({rows:[{...feed.rows[0],technicals:{...technical,asOf:"2026-10-01"}}]},now).watch;
 assert.equal(bad.get("XOM")?.technical,null);
});
test("technical radar is discovery-only; saved thesis and 4H/borrow never become executable",()=>{
 const t={asOf:"2026-11-11",band20Event:"BROKE_LOWER_BAND",donchian20:"CLOSE_BELOW_PRIOR_20_LOW",
   ema20State:"BELOW_LOWER",ema20:21,ema20Lower:20,ema20Upper:22,
   stochRsiZone:"OVERSOLD",stochRsi14:4};
 const q={close:19,session:"2026-11-11",currency:"USD",technical:t};
 const now=new Date("2026-11-12T06:00:00Z");
 const short=OPPORTUNITIES.find(x=>x.id==="crwv-short");
 const state=opportunityState(short,q,now);
 assert.equal(state.status,"DAILY WATCH — CHECK 4H");
 assert.equal(state.signal.grade,"DAILY_TRIGGER");
 assert(!/READY|EXECUTE|ORDER/i.test(state.status));
 const discovery=scanMarketOpportunities(new Map([["CRWV",q]]),now);
 assert.equal(discovery[0].direction,"SHORT");
 const out=opportunityState(short,q,new Date("2026-12-10T03:00:00Z"));
 assert.equal(out.status,"REVIEW EXPIRED");
});
test("RSI is 14-period Wilder and cannot use fewer than 15 closes",()=>{
 assert.deepEqual(rsiSeries(Array(14).fill(1)),[]);
 assert.equal(rsiSeries(Array(20).fill(1)).at(-1),50);
});
