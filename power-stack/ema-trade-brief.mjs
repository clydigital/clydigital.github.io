// Power Stack: decision-ready explanation of canonical Bluebelly observations.
// No recalculation of market signals, owner data, broker access or execution.
import {loadBluebellyStockCoverage} from "./owner-bluebelly-stocks.mjs?v=20261127-ema1";
const widths={20:1,50:1,100:.5,200:.25};
const finite=Number.isFinite;
const list=x=>Array.isArray(x)?x:[];
const realEstate=new Set(["MAA","CPT","O","ESS","INVH","EXR","PLD","TOL","PHM","GRBK","JLL"]);
const day=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x+"T00:00:00Z"));
const days=(a,b)=>(Date.parse(a+"T00:00:00Z")-Date.parse(b+"T00:00:00Z"))/86400000;
const fmt=(n,c)=>c+" "+n.toLocaleString("en-GB",{maximumFractionDigits:3});
// Only source-reported crossing events and EMA approaches are used; proximity alone is not a crossing.
export function boundaryEvents(levels,q){
 const out=[];
 for(const o of levels.filter(v=>v.frame==="D")){
  const w=o.windows?.["1"];
  for(const e of list(w?.events)){
   if(e.session!==q.asOf||!["ema","lower","upper"].includes(e.boundary)||!["up","down"].includes(e.direction))continue;
   const level=o[e.boundary];if(e.direction==="up"?q.price<=level:q.price>=level)continue;
   out.push({kind:"CROSS",period:o.period,boundary:e.boundary,direction:e.direction,level,asOf:e.session});
  }
  for(const k of ["1","3","5"]){const a=o.windows?.[k]?.approach;if(!["up_to","down_to"].includes(a)||Math.abs(o.distancePct)>1)continue;out.push({kind:"APPROACH",period:o.period,boundary:"ema",direction:a==="up_to"?"up":"down",level:o.ema,asOf:q.asOf,window:k});break;}
 }
 return out.sort((a,b)=>(a.kind==="CROSS"?0:1)-(b.kind==="CROSS"?0:1)||Math.abs(q.price-a.level)-Math.abs(q.price-b.level));
}
export function interpretFourH(packet,t,now=new Date()){
 const o=packet?.observation,stamp=Date.parse(o?.asOf),age=+now-stamp;
 if(packet?.contract!=="bluebelly-owner-4h/1"||o?.symbol!==t.ticker||o.status!=="INDICATIVE"||!finite(stamp)||age<0||age>4*86400000||!finite(o.close)||o.close<=0)return {label:"4H unavailable or stale",note:"No alignment verdict."};
 const bands=list(o.bands).filter(b=>b.status==="READY"&&widths[b.period]===b.multiplier&&[b.lower,b.ema,b.upper].every(finite)&&b.lower>0&&b.lower<b.upper&&b.lower<=b.ema&&b.ema<=b.upper);
 const events=list(o.events).filter(e=>e.asOf===o.asOf&&["CROSS","HOLD","APPROACH"].includes(e.kind)&&["up","down"].includes(e.direction)&&["lower","upper","ema"].includes(e.boundary)&&bands.some(b=>b.period===e.period&&finite(e.level)&&Math.abs(b[e.boundary]-e.level)<=Math.max(1e-6,Math.abs(e.level)*1e-6))&&(e.kind!=="HOLD"||e.closes>=3));
 const holds=events.filter(e=>e.kind==="HOLD"&&((e.boundary==="upper"&&e.direction==="up"&&o.close>e.level)||(e.boundary==="lower"&&e.direction==="down"&&o.close<e.level)));
 const dirs=new Set(holds.map(e=>e.direction));const aligned=t.side&&dirs.size===1&&dirs.has(t.side==="LONG"?"up":"down");
 const label=!bands.length?"4H warm-up insufficient":dirs.size>1?"4H conflicting holds":aligned?"4H hold supports daily bias (indicative)":t.side&&dirs.size===1?"4H hold opposes daily bias (indicative)":"4H context only — no matched hold";
 return {label,note:"Completed window "+o.asOf+" · "+o.sampleCount+" bars · "+o.gapCount+" gaps reported · chart/provider parity unverified. No 30m/5m entry confirmation.",events,bands,close:o.close,asOf:o.asOf};
}
export function ownerFourHReader(db,user){
 return async ticker=>{
  const {data:{session}={}}=await db.auth.getSession();if(!session?.access_token||session.user?.id!==user.id)throw Error("Owner session unavailable");
  const url=new URL("https://bluebelly-desk.vercel.app/api/owner/power-stack-4h");url.searchParams.set("ticker",ticker);
  const response=await fetch(url,{headers:{Authorization:"Bearer "+session.access_token},cache:"no-store",credentials:"omit",redirect:"error",signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error("4H request unavailable");return response.json();
 };
}

export function tradeObservation(row,now=new Date()){
 const q=row.marketObservation||row,scan=row.emaScan||q.emaScan;
 const ticker=row.ticker||row.id;
 if(!ticker||realEstate.has(ticker)||String(row.theme||"").toUpperCase()==="REAL_ESTATE"||String(row.sector||"").toLowerCase()==="real estate")return null;
 if(q.status!=="SOURCE_DATED"||!day(q.asOf)||!finite(q.price)||q.price<=0||typeof q.currency!=="string"||!q.currency||scan?.asOf!==q.asOf||scan?.method!=="FIRST_CLOSE_EMA_ROLLING_CLOSE_POPULATION_SD")return null;
 const age=now.getTime()-Date.parse(q.asOf+"T00:00:00Z");
 if(age<0||age>8*86400000)return null;
 const levels=list(scan.observations).filter(o=>o?.warmup==="READY"&&o.asOf===q.asOf&&["D","W","M"].includes(o.frame)&&widths[o.period]===o.multiplier&&[o.lower,o.ema,o.upper,o.distancePct].every(finite)&&o.lower>0&&o.lower<o.upper&&o.lower<=o.ema&&o.ema<=o.upper);
 if(!levels.length)return null;
 const quality=scan.recentSessionQuality;
 const verified=age<=4*86400000&&quality?.status==="VERIFIED"&&quality.expectedSession===q.asOf&&list(quality.missingSessions).length===0&&list(quality.unexpectedSessions).length===0&&row.sessionFreshness!=="BEHIND_US_SESSION"&&q.sessionFreshness!=="BEHIND_US_SESSION";
 const daily=levels.filter(o=>o.frame==="D");
 const retests=daily.filter(o=>{const r=o.bandRespect?.lastRetest;return r&&day(r.session)&&days(q.asOf,r.session)>=0&&days(q.asOf,r.session)<=7&&finite(r.level)&&r.level>0&&((r.boundary==="lower"&&r.direction==="support")||(r.boundary==="upper"&&r.direction==="resistance"))}).sort((a,b)=>b.bandRespect.lastRetest.session.localeCompare(a.bandRespect.lastRetest.session)||a.period-b.period);
 const last=retests[0];let chosen=null,side=null,stage="LEVEL WATCH",eventDate=null,reason="No verified recent daily retest or hold. Proximity is not a signal.";
 if(verified&&last){
  const r=last.bandRespect.lastRetest,latest=retests.filter(o=>o.bandRespect.lastRetest.session===r.session);
  const contradictory=latest.some(o=>o.bandRespect.lastRetest.direction!==r.direction||o.bandRespect.status!==last.bandRespect.status);
  chosen=last;eventDate=r.session;
  if(contradictory){stage="CONFLICT / WAIT";reason="Recent daily bands disagree; do not infer a directional bias."}
  else if(last.bandRespect.status==="RESET"){stage="RESET / WAIT";reason="Prior respected band has reset after sustained closes outside; establish a new retest."}
  else if(last.bandRespect.status==="BREAK_PENDING"){stage="BREAK PENDING / WAIT";reason="Prior respected band is under pressure; the required three-close reset is not confirmed."}
  else if(last.bandRespect.status==="RESPECTED"){
   side=r.direction==="support"?"LONG":"SHORT";stage=side+" RETEST WATCH";
   reason="Last observed daily "+last.period+" EMA band "+r.direction+" retest on "+r.session+" at "+fmt(r.level,q.currency)+"; closed back inside the preceding band. This is a bias observation, not an execution trigger.";
  }
 }
 if(verified&&!last){
  const holds=daily.flatMap(o=>list(o.closeHolds).filter(h=>h.status==="HOLD_CONFIRMED"&&Number.isInteger(h.consecutiveCloses)&&h.consecutiveCloses>=3&&day(h.crossedOn)&&days(q.asOf,h.crossedOn)>=0&&days(q.asOf,h.crossedOn)<=7&&((h.boundary==="upper"&&h.direction==="up"&&q.price>o.upper)||(h.boundary==="lower"&&h.direction==="down"&&q.price<o.lower))).map(h=>({o,h}))).sort((a,b)=>b.h.crossedOn.localeCompare(a.h.crossedOn)||a.o.period-b.o.period);
  const h=holds[0];if(h){chosen=h.o;eventDate=h.h.crossedOn;const conflict=holds.some(x=>x.h.crossedOn===eventDate&&x.h.direction!==h.h.direction);if(conflict){stage="CONFLICT / WAIT";reason="Recent confirmed breaks point in opposing directions."}else{side=h.h.direction==="up"?"LONG":"SHORT";stage=side+" BREAK & HOLD WATCH";reason=h.h.consecutiveCloses+" completed daily closes held beyond the "+h.o.period+" EMA "+h.h.boundary+" SD band after "+eventDate+". Wait for a clean retest; do not chase.";}}
 }
 if(!chosen)chosen=[...levels].sort((a,b)=>Math.min(Math.abs(q.price-a.lower),Math.abs(q.price-a.upper))-Math.min(Math.abs(q.price-b.lower),Math.abs(q.price-b.upper)))[0];
 if(!verified){stage="DATED LEVELS / WAIT";side=null;reason="Completed-session continuity/latest-session proof is missing. Display levels only; no directional signal.";}
 const events=verified?boundaryEvents(levels,q):[];
 if(verified&&!side&&stage==="LEVEL WATCH"&&events.length){const e=events[0];chosen=levels.find(o=>o.frame==="D"&&o.period===e.period)||chosen;stage=e.kind==="CROSS"?"FRESH CROSS / WAIT":"EMA APPROACH / WATCH";reason=e.kind==="CROSS"?"A completed daily close crossed the "+e.period+" EMA "+e.boundary+" boundary "+e.direction+". Wait for a three-close hold or retest.":"Price is approaching the "+e.period+" EMA from "+(e.direction==="up"?"below":"above")+" across "+e.window+" sessions. Proximity is not an entry."}
 const isBreak=stage.includes("BREAK & HOLD");
 const boundary=side==="LONG"?(isBreak?chosen.upper:chosen.lower):side==="SHORT"?(isBreak?chosen.lower:chosen.upper):null;
 const next=side?levels.flatMap(x=>[x.ema,x.lower,x.upper]).filter(n=>side==="LONG"?n>Math.max(q.price,boundary):n<Math.min(q.price,boundary)).sort((a,b)=>side==="LONG"?a-b:b-a)[0]:null;
 const higher=levels.filter(x=>x.frame!=="D").sort((a,b)=>Math.abs(a.distancePct)-Math.abs(b.distancePct))[0];
 return {ticker,name:row.name||row.company||ticker,currency:q.currency,price:q.price,asOf:q.asOf,sourceUrl:q.sourceUrl,moves:[q.changePct,q.change3dPct,q.change5dPct],thesis:typeof row.why==="string"?row.why:null,theme:row.industry||row.theme||row.sector||"Market coverage",stage,side,reason,chosen,levels,verified,eventDate,higher,boundary,next,events,priority:side?0:events.length?1:verified?2:3};
}
export function rankedTrades(rows,now=new Date()){
 return list(rows).map(x=>tradeObservation(x,now)).filter(Boolean).sort((a,b)=>a.priority-b.priority||(b.eventDate||"").localeCompare(a.eventDate||"")||b.asOf.localeCompare(a.asOf)||Math.abs(a.chosen.distancePct)-Math.abs(b.chosen.distancePct)||a.ticker.localeCompare(b.ticker));
}
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
function fact(root,label,value){const p=node("p",undefined,"ps-recap-fact");p.append(node("strong",label+" · "),document.createTextNode(value));root.append(p)}
function source(root,url){try{const u=new URL(url);if(u.protocol==="https:"&&!u.username&&!u.password){const a=node("a","Original price source ↗");a.href=u.href;a.rel="noopener noreferrer";a.target="_blank";root.append(a)}}catch{}}
export function renderTradeCard(t,readFourH=null){
 const c=node("article",undefined,"ps-recap-visual-card ps-ema-trade-card"),o=t.chosen,frame={D:"Daily",W:"Weekly",M:"Monthly"}[o.frame],price=n=>fmt(n,t.currency);
 c.append(node("small",t.ticker+" · "+t.theme.replaceAll("_"," ")),node("h3",t.name),node("p",t.stage,"ps-ema-stage"));
 fact(c,"Price",price(t.price)+" · "+t.asOf+" completed-session observation");
 if(t.moves.some(finite))fact(c,"1D / 3D / 5D",t.moves.map(n=>finite(n)?(n>0?"+":"")+n.toFixed(2)+"%":"—").join(" / "));
 fact(c,"What / why",t.reason);
 if(t.thesis)fact(c,"Investment context",t.thesis);
 fact(c,"Key zone",frame+" "+o.period+" EMA "+price(o.ema)+" · ±"+o.multiplier+" SD "+price(o.lower)+" – "+price(o.upper));
 if(t.events.length)fact(c,"Recent EMA events",t.events.slice(0,3).map(e=>e.kind+" "+e.period+" "+e.boundary+" "+e.direction+" "+price(e.level)).join(" · "));
 if(t.higher)fact(c,"Higher timeframe",t.higher.frame+" "+t.higher.period+" EMA "+price(t.higher.ema)+" · "+t.higher.side+" EMA; context, not confirmation");
 if(t.side){
  fact(c,"Entry trigger","Recheck "+price(t.boundary)+" against fresh bands. "+(t.side==="LONG"?"Require support/reclaim and a close back inside/above the relevant band":"Require resistance/rejection and a close back inside/below the relevant band")+". Daily/4H bias must agree; use 30m/5m for execution. 4H not supplied.");
  fact(c,"Invalidation / stop","Failure of the retest or sustained break against the thesis. Actual stop beyond the retest swing with ATR buffer; no numeric stop without fresh execution bars.");
  fact(c,"Target / risk", (finite(t.next)?"Next observed EMA/SD reference "+price(t.next)+"; check whether it offers sufficient room. ":"No verified next level. ")+"Only consider a partial at 2R after actual entry and stop are known; no R:R claim yet.");
 }else{fact(c,"Next action","Wait for a verified directional retest or break-and-hold; recheck 4H and execution bars. No entry, stop or target established.")}
 const link=node("a","Check this instrument in Bluebelly technical terminal ↗");link.href="https://bluebelly-desk.vercel.app/market-tools?technical="+encodeURIComponent(t.ticker);link.target="_blank";link.rel="noopener noreferrer";c.append(link);
 if(readFourH){const button=node("button","Check 4H now");button.type="button";const result=node("div");result.setAttribute("role","status");c.append(button,result);button.addEventListener("click",async()=>{button.disabled=true;result.textContent="Checking the existing Bluebelly 4H reader…";try{const x=interpretFourH(await readFourH(t.ticker),t);result.replaceChildren();fact(result,"4H",x.label);fact(result,"Evidence",x.note);for(const e of list(x.events).slice(0,4))fact(result,e.kind,e.period+" EMA "+e.boundary+" "+e.direction+" · "+price(e.level));if(x.bands?.length){const more=node("details");more.append(node("summary","4H levels"));for(const b of x.bands)more.append(node("p",b.period+" EMA "+price(b.ema)+" · "+price(b.lower)+" – "+price(b.upper)));result.append(more);}}catch{result.textContent="4H read unavailable; use the Bluebelly terminal. No confirmation inferred."}finally{button.disabled=false;}});}
 const d=node("details");d.append(node("summary","All verified EMA bands & recent observations"));for(const v of t.levels){let note=v.frame+" "+v.period+" EMA "+price(v.ema)+" · "+price(v.lower)+" – "+price(v.upper)+" · "+v.side+" EMA";if(v.anchorDay)note+=" · anchor "+v.anchorDay;if(v.bandRespect?.status)note+=" · "+v.bandRespect.status;const h=list(v.closeHolds).filter(x=>x.status==="HOLD_CONFIRMED");if(h.length)note+=" · "+h.map(x=>x.boundary+" "+x.direction+" "+x.consecutiveCloses+" closes").join(", ");d.append(node("p",note));}source(d,t.sourceUrl);c.append(d);return c;
}
export function mountTradeBrief(host,rows,now=new Date(),readFourH=null){
 const ranked=rankedTrades(rows,now),active=ranked.filter(x=>x.side).length;
 host.append(node("p",ranked.length+" instruments with usable dated EMA levels · "+active+" conditional directional watches · no automatic trade signals.","ps-open-muted"));
 if(!ranked.length){host.append(node("p","No validated matching EMA observations available. Do not treat missing signals as neutral."));return;}
 const grid=node("div",undefined,"ps-open-grid ps-recap-technical-grid");for(const t of ranked.slice(0,3))grid.append(renderTradeCard(t,readFourH));host.append(grid);
 if(ranked.length>3){const d=node("details");d.append(node("summary","All "+ranked.length+" EMA observations"));let rendered=false;d.addEventListener("toggle",()=>{if(d.open&&!rendered){rendered=true;for(const t of ranked.slice(3))d.append(renderTradeCard(t,readFourH));}});host.append(d);}
}
export async function initOpenTradeBrief(host,loader=()=>loadBluebellyStockCoverage((url,opts)=>fetch(url,{...opts,signal:AbortSignal.timeout(12000)}))){
 const p=await loader();host.replaceChildren();
 if(!p){host.append(node("p","Bluebelly EMA feed unavailable or failed validation. Historical reference levels are below; no current signals."));return;}
 mountTradeBrief(host,p.rows);
}
