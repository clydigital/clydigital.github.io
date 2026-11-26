import {expandMarketRows} from "./owner-market-views.mjs";
// Static owner-only portfolio + independent public delayed quote tape.
// Holdings/watchlist membership remains RLS-protected; quotes are company-level only.
const safe=(v,max=250)=>typeof v==="string"?v.trim().slice(0,max):"";
const num=v=>typeof v==="number"&&Number.isFinite(v)?v:null;
const list=(v,n)=>Array.isArray(v)?v.slice(0,n).filter(x=>x&&typeof x==="object"&&!Array.isArray(x)):[];
const ticker=v=>/^[A-Z0-9][A-Z0-9.\-]{0,17}$/.test(safe(v,20).toUpperCase())?safe(v,20).toUpperCase():"";
const fmt=(v,d=2)=>v===null?"—":Number(v).toLocaleString("en-GB",{maximumFractionDigits:d});
const pct=v=>v===null?"—":(v>0?"+":"")+v.toFixed(2)+"%";
const columns=[
 ["ticker","Instrument",false],["group","Group",false],["quantity","Recorded units",true],
 ["close","Last close",true],["day","1D",true],["threeDay","3D",true],["fiveDay","5D",true],
 ["session","Session",false]
];
export function recentSession(date,now=new Date()){
 if(typeof date!=="string"||!/^20\d{2}-\d{2}-\d{2}$/.test(date))return false;
 const stamp=Date.parse(date+"T00:00:00Z");
 const today=Date.parse(now.toISOString().slice(0,10)+"T00:00:00Z");
 if(!Number.isFinite(stamp)||stamp>today)return false;
 let businessDays=0;
 for(let t=stamp+86400000;t<=today;t+=86400000){const day=new Date(t).getUTCDay();if(day&&day!==6)businessDays++;}
 return businessDays<=3; // Same business-day grace as producer.
}
/** Public, issuer-level daily quote tape is independent of private portfolio
 * membership. The market-prices.json endpoint has no account, holdings, size,
 * legacy scoring data, Google token, or Bluebelly-derived scan. No arbitrary ticker requests.
 */
export async function loadPriceFeed(fetcher=fetch,edition=null) {
 try {
  const response=await fetcher("./market-prices.json",{cache:"no-store"});
  if(!response.ok)throw Error("public market quote feed "+response.status);
  const data=await response.json();
  if(data?.contractVersion!=="power-stack-public-prices/1"||!Array.isArray(data.rows)
    ||data.rows.length>120)return mergeEditionQuotes(null,edition);
  return mergeEditionQuotes(data,edition);
 } catch {return mergeEditionQuotes(null,edition);}
}
// Canonical manually published BB observations. Legacy tape remains only for instruments
// not yet covered by BB; no new network call or schedule. Preserve listing identities.
export function mergeEditionQuotes(feed,edition,now=new Date()){
 const universe=edition?.contract==="ps-investment-intelligence/1"&&Array.isArray(edition.universe)?edition.universe:null;
 if(!universe)return feed;
 const aliases={"688825":"688825.SS","DAYANG":"5141.KL","HIBISCS":"5199.KL","MISC":"3816.KL","MNHLDG":"0245.KL","TENAGA":"5347.KL","YTLPOWR":"6742.KL"};
 const by=new Map();for(const item of universe){const id=ticker(item?.ticker);if(id&&!by.has(id))by.set(id,item);}
 const legacy=Array.isArray(feed?.rows)?feed.rows:[];
 const used=new Set(),rows=[];
 const bbRow=(id,item)=>{const q=item.marketObservation;const available=q?.status==="SOURCE_DATED"&&recentSession(q.asOf,now)&&Number.isFinite(q.price)&&q.price>0&&approvedBBSource(q.sourceUrl)&&["USD","EUR","DKK","MYR","KRW","TWD","HKD","CNY","GBP","JPY","SGD","CHF","CAD","AUD","NOK","SEK","INR"].includes(q.currency);
 return {ticker:id,name:item.name,currency:q?.currency||null,status:available?"CLOSED":"UNAVAILABLE",close:available?q.price:null,sessionDate:available?q.asOf:null,changePct:available?num(q.changePct):null,change3dPct:available?num(q.change3dPct):null,change5dPct:available?num(q.change5dPct):null,sourceUrl:available?q.sourceUrl:null,quoteAuthority:"BLUEBELLY",technicals:null};};
 const editionStamp=Date.parse(edition.asOf||"");const editionValid=Number.isFinite(editionStamp)&&editionStamp<=now.getTime()&&now.getTime()-editionStamp<=72*3600000;
 const legacyStamp=Date.parse(feed?.generatedAt||"");const legacyValid=Number.isFinite(legacyStamp)&&legacyStamp<=now.getTime()&&now.getTime()-legacyStamp<=72*3600000;
 for(const item of legacy){const id=ticker(item.ticker);if(!id)continue;const bb=by.get(aliases[id]||id);if(bb){const q=bbRow(id,bb);rows.push(editionValid?q:{...q,status:"UNAVAILABLE",close:null,sessionDate:null,changePct:null,change3dPct:null,change5dPct:null,sourceUrl:null});used.add(aliases[id]||id);}else{rows.push(legacyValid?{...item,quoteAuthority:"LEGACY_UNCOVERED"}:{...item,status:"UNAVAILABLE",close:null,sessionDate:null,changePct:null,change3dPct:null,change5dPct:null,technicals:null,quoteAuthority:"LEGACY_UNCOVERED"});}}
 for(const [id,item] of by){if(used.has(id))continue;const q=bbRow(id,item);rows.push(editionValid?q:{...q,status:"UNAVAILABLE",close:null,sessionDate:null,changePct:null,change3dPct:null,change5dPct:null,sourceUrl:null});}
 const generatedAt=editionValid&&(!legacyValid||editionStamp>=legacyStamp)?edition.asOf:legacyValid?feed.generatedAt:null;
 return {contractVersion:"power-stack-public-prices/1",generatedAt,rows,coverage:{tracked:rows.length,fresh:rows.filter(x=>x.status==="CLOSED"&&recentSession(x.sessionDate,now)).length},sourceMode:"BB_FIRST_MANUAL_EDITION"};
}
function approvedBBSource(value){try{const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password&&["www.nasdaq.com","finance.yahoo.com","massive.com","www.massive.com","polygon.io","www.polygon.io"].includes(u.hostname)}catch{return false}}

export function approvedQuoteSource(value,id){
 try{
  const url=new URL(value);
  if(url.protocol!=="https:"||url.username||url.password)return false;
  if(id==="BTC")return url.hostname==="api.coingecko.com"
   &&url.pathname==="/api/v3/coins/bitcoin/market_chart"
   &&url.searchParams.get("vs_currency")==="usd"&&url.searchParams.get("days")==="30"
   &&[...url.searchParams.keys()].length===2;
  return (["query1.finance.yahoo.com","query2.finance.yahoo.com"].includes(url.hostname)
    &&url.pathname.startsWith("/v8/finance/chart/"))
   ||(url.hostname==="stooq.com"&&url.pathname==="/q/d/l/");
 }catch{return false;}
}
/**
 * Only consume same-session, source-vetted technical *observations*.
 * Missing OHLC / older versions are unknown, never neutral or buy-ready.
 */
export function validatedDailyTechnical(raw,session,close){
 if(!raw||raw.contractVersion!=="power-stack-daily-technicals/1"||
   raw.status!=="OBSERVED"||raw.timeframe!=="1D"||raw.asOf!==session)return null;
 const band=raw.emaBands?.["20"],event=raw.band20Event;
 const events=new Set(["NONE","RECOVERED_LOWER_BAND","REJECTED_UPPER_BAND","BROKE_LOWER_BAND","BROKE_UPPER_BAND"]);
 const donchian=new Set(["CLOSE_ABOVE_PRIOR_20_HIGH","CLOSE_BELOW_PRIOR_20_LOW","INSIDE_PRIOR_20_RANGE","UNAVAILABLE_OHLC"]);
 if(!band||!events.has(event)||!donchian.has(raw.donchian20)||
   !["ABOVE_UPPER","INSIDE","BELOW_LOWER"].includes(band.state))return null;
 if([band.basis,band.lower,band.upper,close].some(x=>num(x)===null||x<=0)||
  band.lower>band.basis||band.basis>band.upper)return null;
 const k=num(raw.stochRsi14);
 if(k!==null&&(k<0||k>100))return null;
 const zone=k===null?"UNAVAILABLE":k>=80?"OVERBOUGHT":k<=20?"OVERSOLD":"NEUTRAL";
 if(raw.stochRsiZone!==zone)return null;
 return Object.freeze({asOf:session,band20Event:event,donchian20:raw.donchian20,
   stochRsi14:k,stochRsiZone:zone,ema20State:band.state,
   ema20:band.basis,ema20Lower:band.lower,ema20Upper:band.upper,
   rsi14:num(raw.rsi14),volumeToPrior20:num(raw.volumeToPrior20)});
}

export function quotes(feed,now=new Date()){
 const result=new Map();
 for(const raw of (Array.isArray(feed?.rows)?feed.rows:[])){
  const id=ticker(raw.ticker),price=num(raw.close);
  if(!id||raw.status!=="CLOSED"||!recentSession(raw.sessionDate,now)
    ||price===null||price<=0)continue;
  if(!["USD","HKD","MYR","CNY","EUR","DKK","KRW","TWD","GBP","JPY","SGD","CHF","CAD","AUD","NOK","SEK","INR"].includes(raw.currency))continue;
  if(id==="BTC"&&(raw.currency!=="USD"||typeof raw.marketBasis!=="string"
    ||!raw.marketBasis.startsWith("BTC/USD daily UTC sample")))continue;
  if(typeof raw.sourceUrl!=="string"||!(raw.quoteAuthority==="BLUEBELLY"?approvedBBSource(raw.sourceUrl):approvedQuoteSource(raw.sourceUrl,id)))continue;
  result.set(id,{
   close:price,day:num(raw.changePct),threeDay:num(raw.change3dPct),
   fiveDay:num(raw.change5dPct),session:raw.sessionDate,currency:raw.currency,
   technical:validatedDailyTechnical(raw.technicals,raw.sessionDate,price),
   basis:raw.quoteAuthority==="BLUEBELLY"?"Bluebelly source-dated close":id==="BTC"?"BTC UTC daily sample":"Legacy exchange close (uncovered instrument)",
  });
 }
 return {asOf:typeof feed?.generatedAt==="string"?feed.generatedAt:null,holding:result,watch:result,
  tracked:feed?.coverage?.tracked??0,fresh:feed?.coverage?.fresh??0};
}

/** Merge only source-qualified regular-session closes for already-private instruments.
 * Do not carry return metrics from an older session into a newer close. */
export function applyOwnerCloseObservations(lines,observations,now=new Date(),canonicalTickers=new Set()) {
 const best=new Map();
 for(const row of Array.isArray(observations)?observations:[]){
  const id=ticker(row?.ticker),date=row?.observed_on,price=typeof row?.price==="number"?row.price:typeof row?.price==="string"&&/^\d+(?:\.\d+)?$/.test(row.price)?Number(row.price):NaN;
  if(!id||!recentSession(date,now)||!Number.isFinite(price)||price<=0||row.timestamp_basis!=="source_observation"||!["USD","HKD","MYR","CNY","EUR","DKK"].includes(row.currency))continue;
  let host;try{const u=new URL(row.source_url);if(u.protocol!=="https:"||u.username||u.password)continue;host=u.hostname;}catch{continue;}
  const source=String(row.source_name||"");
  const approved=(source==="Finnhub / US regular close"&&host==="finnhub.io"&&row.currency==="USD")
   ||(source==="Nasdaq official stocks history"&&host==="www.nasdaq.com"&&row.currency==="USD")
   ||(source==="Massive / regular session close"&&["massive.com","api.massive.com","polygon.io","api.polygon.io"].includes(host))
   ||(source==="Twelve Data / regular session close"&&["twelvedata.com","api.twelvedata.com"].includes(host));
  const recorded=Date.parse(row.source_recorded_at||row.ingested_at||"");
  if(!approved||!Number.isFinite(recorded)||recorded>now.getTime())continue;
  const old=best.get(id);if(!old||date>old.observed_on||date===old.observed_on&&recorded>old.recorded)best.set(id,{...row,price,recorded});
 }
 let count=0;
 const updated=lines.map(line=>{
  if(!line.held&&!line.onWatchlist&&!line.ideaTracked)return line;
  // Canonical BB membership wins even when its observation is missing or stale.
  // Do not conceal a canonical gap using the historical private quote ledger.
  if(canonicalTickers.has(line.ticker))return line;
  const q=best.get(line.ticker);if(!q||line.currency&&line.currency!==q.currency||line.session&&line.session>=q.observed_on)return line;
  count++;
  return {...line,close:q.price,currency:q.currency,session:q.observed_on,day:null,threeDay:null,fiveDay:null,basis:"Private verified exchange close",quoteSource:q.source_name};
 });
 return {lines:updated,count};
}

function project(snapshot,priceFeed){
 const scan=quotes(priceFeed),result=new Map();
 for(const h of list(snapshot?.holdings,100)){
  const id=ticker(h.ticker);if(!id)continue;
  const p=h.position&&typeof h.position==="object"?h.position:{};
  const q=scan.holding.get(id)||{};
  result.set(id,{ticker:id,name:safe(h.name,100)||id,held:true,onWatchlist:false,
   quantity:num(p.quantity),currency:q.currency||safe(p.currency,8),quantityAsOf:safe(p.quantityAsOf,30),
   close:q.close??null,day:q.day??null,threeDay:q.threeDay??null,
   fiveDay:q.fiveDay??null,session:q.session??null,basis:q.basis||"",action:safe(h.action,240),
   thesis:safe(h.verdict,240),entry:"",invalidation:safe(h.weakness,300)});
 }
 for(const w of list(snapshot?.watchlist,200)){
  const id=ticker(w.ticker);if(!id)continue;
  const old=result.get(id)||{},q=scan.watch.get(id)||scan.holding.get(id)||{};
  result.set(id,{ticker:id,name:old.name||safe(w.name,100)||id,
   held:old.held||false,onWatchlist:true,quantity:old.quantity??null,
   currency:old.currency||q.currency||"",quantityAsOf:old.quantityAsOf||"",
   close:old.close??q.close??null,
   day:old.day??q.day??null,threeDay:old.threeDay??q.threeDay??null,
   fiveDay:old.fiveDay??q.fiveDay??null,session:old.session??q.session??null,
   basis:old.basis||q.basis||"",
   action:safe(w.latestDecision,240)||safe(w.action,240)||old.action||"",
   thesis:safe(w.thesis,260)||old.thesis||"",entry:safe(w.entry,320),
   invalidation:safe(w.invalidation,320)||old.invalidation||""});
 }
 return {lines:[...result.values()],asOf:scan.asOf};
}
function el(tag,value,cls){
 const n=document.createElement(tag);
 if(value!==undefined&&value!==null)n.textContent=String(value);
 if(cls)n.className=cls;
 return n;
}
function cell(tr,value,tag="td"){
 const n=el(tag,value);tr.append(n);return n;
}
function rowValue(r,key){
 if(key==="group")return r.held?"Holding":r.ideaTracked?"Research idea":r.onWatchlist?"Watchlist":"Market tape";
 if(key==="quantity")return r.held?r.quantity:null;
 return r[key]??null;
}

// Presentation-only: join the owner snapshot to the same manual BB edition by listing identity.
const cardAliases={"688825":"688825.SS","DAYANG":"5141.KL","HIBISCS":"5199.KL","MISC":"3816.KL","MNHLDG":"0245.KL","TENAGA":"5347.KL","YTLPOWR":"6742.KL"};
export function cardResearch(row,edition){
 const id=cardAliases[row.ticker]||row.ticker;
 const u=(edition?.universe||[]).find(x=>x.ticker===id);
 const a=(edition?.opportunities||[]).find(x=>x.ticker===id||x.ticker===row.ticker);
 const obs=u?.marketObservation;
 const same=obs?.status==="SOURCE_DATED"&&obs.asOf===row.session&&obs.currency===row.currency&&obs.price===row.close;
 const theme=String(a?.theme||u?.theme||"").toUpperCase();
 const realEstate=theme==="REAL_ESTATE"||String(a?.sector||"").toLowerCase()==="real estate"||["MAA","CPT","O","ESS","INVH","EXR","PLD","TOL","PHM","GRBK","JLL"].includes(id);
 const technical=(edition?.technicals||[]).find(x=>String(x.name||"").endsWith("("+id+")")&&x.asOf===row.session);
 const scan=u?.emaScan;
 const levels=same&&!realEstate&&scan?.method==="FIRST_CLOSE_EMA_ROLLING_CLOSE_POPULATION_SD"&&scan?.asOf===row.session?(scan.observations||[]).filter(x=>x.warmup==="READY"&&x.asOf===row.session&&["D","W","M"].includes(x.frame)&&[20,50,100,200].includes(x.period)&&[x.ema,x.lower,x.upper,x.distancePct].every(Number.isFinite)&&x.lower<=x.ema&&x.ema<=x.upper&&x.lower>0&&x.multiplier===({20:1,50:1,100:.5,200:.25})[x.period]):[];
 return {a,u,same,realEstate,technical:same&&!realEstate?technical:null,levels};
}
export function sleeveWeights(lines){
 const totals=new Map(),weights=new Map();
 for(const r of lines){if(!r.held||!r.currency||!r.session||!Number.isFinite(r.quantity)||r.quantity<=0||!Number.isFinite(r.close)||r.close<=0||r.ticker==="6742UW")continue;
 const key=r.currency+"|"+r.session;totals.set(key,(totals.get(key)||0)+r.quantity*r.close);}
 for(const r of lines){const key=r.currency+"|"+r.session;if(r.held&&r.ticker!=="6742UW"&&Number.isFinite(r.quantity)&&r.quantity>0&&Number.isFinite(r.close)&&r.close>0&&totals.has(key))weights.set(r.ticker,{value:r.quantity*r.close,total:totals.get(key),weight:100*r.quantity*r.close/totals.get(key),currency:r.currency,session:r.session});}
 return weights;
}
function fact(root,label,value){const p=el("p",null,"ps-recap-fact");p.append(el("strong",label),document.createTextNode(String(value||"Not recorded")));root.append(p);}
function detail(root,label){const d=el("details",null,"ps-recap-archive-drawer");d.append(el("summary",label));root.append(d);return d;}
export function holdingCard(row,edition,weights){
 const {a,u,same,realEstate,technical,levels}=cardResearch(row,edition),w=weights.get(row.ticker);
 const card=el("article",null,"ps-recap-visual-card ps-position-card");card.dataset.kind=row.held?"holding":row.onWatchlist?"watchlist":row.ideaTracked?"research":"coverage";
 const hero=el("div",null,"ps-recap-position-hero");const identity=el("div",null,"ps-recap-position-identity");const priceBox=el("div",null,"ps-recap-position-price");identity.append(el("span",row.ticker+" · "+(row.held?"RECORDED HOLDING":row.onWatchlist?"WATCHLIST":row.ideaTracked?"RESEARCH IDEA":"MARKET COVERAGE"),"ps-recap-section-label"),el("h3",row.name));
 priceBox.append(el("strong",row.close===null?"Price unavailable":row.currency+" "+fmt(row.close,3),"ps-recap-big-number"),el("small",row.session?"Dated close · "+row.session+" · "+(row.basis||"Source unavailable"):"No source-dated close"));
 hero.append(identity,priceBox);card.append(hero);const moves=el("div",null,"ps-recap-moves");for(const [label,value] of [["1D",row.day],["3D",row.threeDay],["5D",row.fiveDay]]){const box=el("div",null,"ps-recap-move");box.dataset.direction=value===null?"unknown":value>0?"up":value<0?"down":"flat";box.append(el("small",label),el("strong",pct(value)));moves.append(box);}card.append(moves);
 if(row.held){const allocation=el("div",null,"ps-recap-allocation");fact(allocation,"Recorded units",row.quantity===null?"Unknown":fmt(row.quantity,8)+" · quantity date "+(row.quantityAsOf||"unknown"));if(w){fact(allocation,"Indicative sleeve value",w.currency+" "+fmt(w.value)+" · "+w.weight.toFixed(1)+"% of valued "+w.currency+" sleeve · "+w.session);const m=el("meter");m.min=0;m.max=100;m.value=w.weight;m.setAttribute("aria-label","Share of same-currency same-session valued sleeve, not total portfolio");allocation.append(m);}else fact(allocation,"Indicative value","Not calculable from matched recorded quantity and price");card.append(allocation);}
 const thesis=el("div",null,"ps-recap-position-thesis");fact(thesis,"Research posture","RESEARCH / RECHECK · validate current underwriting before action");
 if(row.action)fact(thesis,"Saved owner decision",row.action+" · review date/evidence before acting");
 fact(thesis,"Why / thesis",a?.why||row.thesis||"Issuer underwriting pending");card.append(thesis);const valuation=el("div",null,"ps-recap-position-valuation");
 const ec=a?.entryCheck;
 if(same&&ec?.currency===row.currency&&ec.asOf===row.session&&ec.price===row.close&&Number.isFinite(ec.ceiling)&&ec.ceiling>0){fact(valuation,"Valuation ceiling",ec.currency+" "+fmt(ec.ceiling,3)+" · "+(row.close<=ec.ceiling?"Price-only pass":((1-ec.ceiling/row.close)*100).toFixed(2)+"% further decline required")+" · not a trade signal");}
 else fact(valuation,"Key valuation / entry levels",a?.entry||row.entry||"No verified private level recorded");
 if(a?.valuation)fact(valuation,"Normalised valuation",a.valuation);card.append(valuation);
 const tech=detail(card,"Technical levels · 20 / 50 / 100 / 200 EMA & SD");if(row.held)tech.open=true;
 if(realEstate)fact(tech,"Valuation only","Real estate exception: no EMA/SD entry gate.");
 else if(!same)fact(tech,"Technical status","No matching BB close and technical observation. Do not mix sessions.");
 else{
  fact(tech,"EMA framework","D / W / M · 20 and 50 ±1 SD; 100 ±0.5 SD; 200 ±0.25 SD. Completed-session observations only.");
  if(levels.length){const grid=el("div",null,"ps-recap-ema-grid");for(const v of levels){const b=el("div",null,"ps-recap-ema-cell");b.append(el("strong",v.frame+" "+v.period+" EMA"),el("span",row.currency+" "+fmt(v.ema,3)),el("small","SD "+fmt(v.lower,3)+" – "+fmt(v.upper,3)),el("small",v.side+" EMA · "+pct(v.distancePct)+" · "+String(v.band).replaceAll("_"," ")));const range=v.upper-v.lower;if(range>0&&Number.isFinite(row.close)){const track=el("div",null,"ps-recap-band");const marker=el("span",null,"ps-recap-band-marker");const position=Math.max(0,Math.min(100,100*(row.close-v.lower)/range));marker.style.left=position.toFixed(2)+"%";track.setAttribute("aria-label","Price relative to lower and upper SD boundaries; clipped if outside range");track.append(marker);b.append(track);}for(const day of ["1","3","5"]){const z=v.windows?.[day];if(z){const events=[z.approach&&z.approach!=="none"?"approach "+z.approach:null,z.emaCross&&z.emaCross!=="none"?"EMA "+z.emaCross:null,z.upperCross&&z.upperCross!=="none"?"upper SD "+z.upperCross:null,z.lowerCross&&z.lowerCross!=="none"?"lower SD "+z.lowerCross:null].filter(Boolean);if(events.length)b.append(el("small",day+"D · "+events.join(" · ")));}}grid.append(b);}tech.append(grid);fact(tech,"Coverage","Only verified READY observations appear; other timeframe/period levels unavailable.");}
  else if(technical){fact(tech,"Verified interesting zone",technical.zone);fact(tech,"Direction / band state",technical.position);}
  else fact(tech,"EMA / SD coverage","No verified structured levels in this manual edition; not a neutral signal.");
  if(a?.technical&&a?.entryCheck?.asOf===row.session)fact(tech,"Dated technical context",a.technical);
 }
 const more=detail(card,"Investment case, risk & evidence");for(const [label,val] of [["Business",a?.business],["Sector / theme",a?.sector||u?.theme],["Customers / suppliers",a?.relationships],["Downside",a?.downside],["Catalyst",a?.catalyst],["Invalidation",a?.invalidation||row.invalidation],["Portfolio fit",a?.portfolioFit]])if(val)fact(more,label,val);
 for(const v of a?.scenarios||[])fact(more,v.name||"Scenario",[v.impact,v.why,v.trigger,v.failure].filter(Boolean).join(" · "));
 for(const v of a?.hedges||[])fact(more,v.name||"Hedge",[v.mechanism,v.cost,v.failure].filter(Boolean).join(" · "));
 for(const ev of a?.evidence||[]){if(ev.claim)fact(more,ev.asOf||"Evidence",ev.claim);try{const url=new URL(ev.url);if(url.protocol==="https:"&&!url.username&&!url.password){const link=el("a","Original evidence");link.href=url.href;link.target="_blank";link.rel="noopener noreferrer";more.append(link);}}catch{}}
 return card;
}

export async function initPortfolioTable(db,host,user,{edition=null}={}){
 if(!user?.id){host.textContent="Owner session unavailable; no private portfolio displayed.";return;}
 const {data,error}=await db.from("power_stack_owner_snapshots")
  .select("snapshot_as_of,legacy_source_retired,snapshot").eq("owner_user_id",user.id)
  .order("snapshot_as_of",{ascending:false}).limit(1).maybeSingle();
 if(error||!data?.legacy_source_retired||!data.snapshot){host.textContent="No verified owner snapshot available.";return;}
 const [priceFeed,ideaResult,privateQuotes]=await Promise.all([
  loadPriceFeed(fetch,edition),
  db.from("power_stack_idea_tracker")
   .select("ticker,name,idea_type,currency,macro_state,macro_reason")
   .eq("owner_user_id",user.id).limit(150),
  db.from("power_stack_quote_observations").select("ticker,observed_on,price,currency,source_name,source_url,timestamp_basis,source_recorded_at,ingested_at").eq("owner_user_id",user.id).gte("observed_on",new Date(Date.now()-14*86400000).toISOString().slice(0,10)).order("observed_on",{ascending:false}).limit(1000)
 ]);
 const feedAt=Date.parse(priceFeed?.generatedAt||"");
 const validFeed=Number.isFinite(feedAt)&&feedAt<=Date.now()
  &&Date.now()-feedAt<=72*3600000?priceFeed:null;
 const {lines:recorded,asOf}=project(data.snapshot,validFeed);
 const trackedIdeas=ideaResult.error?[]:(ideaResult.data||[]);
 const canonicalTickers=new Set((priceFeed?.rows??[]).filter(row=>row.quoteAuthority==="BLUEBELLY").map(row=>ticker(row.ticker)).filter(Boolean));
 const merged=applyOwnerCloseObservations(expandMarketRows(recorded,trackedIdeas,validFeed,quotes(validFeed).holding),privateQuotes.error?[]:privateQuotes.data,new Date(),canonicalTickers);
 const lines=merged.lines;const weights=sleeveWeights(lines);
 const scopeFromHash=hash=>({"#holdings":"holdings","#watchlist":"watchlist",
  "#bonds":"bonds","#research":"ideas","#markets":"markets"})[hash]||"all";
 let sort="ticker",direction="asc",scope=scopeFromHash(location.hash),search="",expanded=null;
 host.replaceChildren();
 const heading=el("div",null,"ps-table-head"),title=el("div");
 title.append(el("h2","Holdings & watchlist"),
  el("p",lines.filter(r=>r.held).length+" recorded holdings · "+lines.filter(r=>r.onWatchlist).length+
   " saved watchlist · "+lines.filter(r=>r.ideaTracked).length+" research ideas · "+
   lines.filter(r=>r.marketTracked).length+" market instruments · Snapshot "+data.snapshot_as_of+
   " (not broker-verified)"));
 const feedGeneratedAt=asOf&&Number.isFinite(Date.parse(asOf))?Date.parse(asOf):null;
 const feedAgeHours=feedGeneratedAt===null?null:Math.max(0,Math.floor((Date.now()-feedGeneratedAt)/3600000));
 const eligibleNow=quotes(validFeed).holding.size;
 const coverageLabel=priceFeed
  ?" · "+(priceFeed?.coverage?.fresh??0)+"/"+(priceFeed?.coverage?.tracked??0)+" fresh at generation"
  +" · "+eligibleNow+" valid now"+(feedAgeHours===null?"":" · generated "+feedAgeHours+"h ago")
  +(feedAgeHours!==null&&feedAgeHours>72?" · REFRESH OVERDUE":"")
  :" · FEED UNAVAILABLE";
 heading.append(title,el("span","Delayed closes · "+
  (validFeed?asOf:"feed unavailable or overdue")+
  (validFeed?" · "+eligibleNow+" source-qualified quotes":""),"ps-table-note"));
 heading.append(el("p",privateQuotes.error?"Private quote refresh unavailable; showing verified public observations only.":merged.count+" non-canonical instruments updated from newer private closes; Bluebelly-covered gaps remain visible; unavailable same-session returns show —.","ps-table-note"));
 const opportunities=el("a","Review investment ideas →","ps-table-opportunities");
 opportunities.href="ideas.html";heading.append(opportunities);host.append(heading);
 const controls=el("div",null,"ps-table-controls"),input=el("input"),chips=el("div",null,"ps-table-chips");
 input.type="search";input.placeholder="Search ticker or company";input.setAttribute("aria-label","Find instrument");
 input.addEventListener("input",()=>{search=input.value.trim().toLowerCase();render();});
 controls.append(input,chips);host.append(controls);
 for(const [key,label] of [["all","My coverage"],["holdings","Holdings"],["watchlist","Watchlist + BB coverage"],
    ["bonds","Bond ETFs"],["ideas","Research ideas"],["markets","All markets"]]){
  const b=el("button",label,"ps-chip");b.type="button";b.dataset.scope=key;
  b.addEventListener("click",()=>{scope=key;
   const hashes={all:"",holdings:"#holdings",watchlist:"#watchlist",
    bonds:"#bonds",ideas:"#research",markets:"#markets"};
   if(location.hash!==hashes[key])history.replaceState(null,"",location.pathname+hashes[key]);
   render();});chips.append(b);
 }
 const cards=el("div",null,"ps-recap-grid ps-position-grid");host.append(cards);const compare=el("details",null,"ps-recap-archive-drawer");compare.append(el("summary","Compact comparison table · sort by column"));host.append(compare);const wrap=el("div",null,"table-wrap"),table=el("table",null,"ps-table"),
  thead=el("thead"),hrow=el("tr"),tbody=el("tbody");
 for(const [key,label,numeric] of columns){
  const th=el("th"),button=el("button",label+" ↕","ps-sort");button.type="button";
  button.addEventListener("click",()=>{if(sort===key)direction=direction==="asc"?"desc":"asc";
   else{sort=key;direction=numeric?"desc":"asc";}render();});
  th.append(button);hrow.append(th);
 }
 thead.append(hrow);table.append(thead,tbody);wrap.append(table);compare.append(wrap);
 host.append(el("p","Prices are delayed. Recorded holdings and available cash require broker reconciliation; unavailable quotes show —.","ps-table-note"));
 function render(){
  for(const b of chips.children)b.setAttribute("aria-pressed",String(b.dataset.scope===scope));
  const selected=lines.filter(r=>
   (scope==="all"&&!r.marketOnly
    ||scope==="holdings"&&r.held
    ||scope==="watchlist"&&(r.onWatchlist||r.ideaTracked||r.marketTracked)
    ||scope==="bonds"&&r.bond&&(r.ideaTracked||r.onWatchlist||r.held)
    ||scope==="ideas"&&r.ideaTracked
    ||scope==="markets"&&r.marketTracked)
   &&(!search||[r.ticker,r.name,r.action,r.thesis].join(" ").toLowerCase().includes(search)));
  const mult=direction==="asc"?1:-1;
  selected.sort((a,b)=>{const av=rowValue(a,sort),bv=rowValue(b,sort);
   if(av===null&&bv===null)return a.ticker.localeCompare(b.ticker);
   if(av===null)return 1;if(bv===null)return -1;
   const v=typeof av==="number"&&typeof bv==="number"?av-bv:String(av).localeCompare(String(bv));
   return v*mult||a.ticker.localeCompare(b.ticker);
  });
  tbody.replaceChildren();cards.replaceChildren();
  const shown=selected.filter(r=>r.ticker!=="6742UW");for(const r of shown)cards.append(holdingCard(r,edition,weights));if(!shown.length)cards.append(el("p","No matching instruments."));
  if(!shown.length){const tr=el("tr");const td=cell(tr,"No matching instruments.");td.colSpan=8;tbody.append(tr);return;}
  for(const r of shown){
   const tr=el("tr"),th=el("th"),button=el("button",r.ticker+" · "+r.name,"ps-ticker");
   button.type="button";button.setAttribute("aria-expanded",String(expanded===r.ticker));
   button.addEventListener("click",()=>{expanded=expanded===r.ticker?null:r.ticker;render();});
   th.append(button);tr.append(th);
   cell(tr,r.held?"Recorded holding":r.ideaTracked?(r.onWatchlist?"Watch + research":"Research idea"):
     r.onWatchlist?"Watchlist":"Market tape");
   cell(tr,r.held?fmt(r.quantity,8):"—");
   cell(tr,r.close===null?"—":(r.currency?r.currency+" ":"")+fmt(r.close,3));
   for(const v of [r.day,r.threeDay,r.fiveDay]){
    const td=cell(tr,pct(v));td.dataset.direction=v===null?"unknown":v>0?"up":v<0?"down":"flat";
   }
   cell(tr,r.session?(r.session+(r.basis==="BTC UTC daily sample"?" · BTC UTC sample":"")):"—");tbody.append(tr);
   if(expanded===r.ticker){
    const detail=el("tr"),td=el("td");td.colSpan=8;td.className="ps-row-details";
    for(const [label,val] of [["Research",r.action||r.thesis||"Pending"],["Category",
      r.held?"Recorded holding":r.ideaTracked?"Research idea":r.onWatchlist?"Watchlist":"Market tape"],
      ["Entry / confirmation",r.entry||"Not recorded"],
      ["Invalidation",r.invalidation||"Not recorded"],["Quote source",r.quoteSource||r.basis||"Unavailable"],["Quantity date",r.quantityAsOf||"Unknown"]]){
      const p=el("p");p.append(el("strong",label+": "),document.createTextNode(val));td.append(p);
    }
    detail.append(td);tbody.append(detail);
   }
  }
 }
 window.addEventListener("hashchange",()=>{scope=scopeFromHash(location.hash);render();});
 render();
}
