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
 ["score","Old score",true],["session","Session",false]
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
 * score, Google token, or Bluebelly-derived scan. No arbitrary ticker requests.
 */
export async function loadPriceFeed(fetcher=fetch) {
 try {
  const response=await fetcher("./market-prices.json",{cache:"no-store"});
  if(!response.ok)throw Error("public market quote feed "+response.status);
  const data=await response.json();
  if(data?.contractVersion!=="power-stack-public-prices/1"||!Array.isArray(data.rows)
    ||data.rows.length>100)return null;
  return data;
 } catch {return null;}
}
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
export function quotes(feed,now=new Date()){
 const result=new Map();
 for(const raw of list(feed?.rows,100)){
  const id=ticker(raw.ticker),price=num(raw.close);
  if(!id||raw.status!=="CLOSED"||!recentSession(raw.sessionDate,now)
    ||price===null||price<=0)continue;
  if(!["USD","HKD","MYR","CNY"].includes(raw.currency))continue;
  if(id==="BTC"&&(raw.currency!=="USD"||typeof raw.marketBasis!=="string"
    ||!raw.marketBasis.startsWith("BTC/USD daily UTC sample")))continue;
  if(typeof raw.sourceUrl!=="string"||!approvedQuoteSource(raw.sourceUrl,id))continue;
  result.set(id,{
   close:price,day:num(raw.changePct),threeDay:num(raw.change3dPct),
   fiveDay:num(raw.change5dPct),session:raw.sessionDate,currency:raw.currency,
   basis:id==="BTC"?"BTC UTC daily sample":"Exchange close",
  });
 }
 return {asOf:typeof feed?.generatedAt==="string"?feed.generatedAt:null,holding:result,watch:result,
  tracked:feed?.coverage?.tracked??0,fresh:feed?.coverage?.fresh??0};
}
function project(snapshot,priceFeed){
 const scan=quotes(priceFeed),result=new Map();
 for(const h of list(snapshot?.holdings,100)){
  const id=ticker(h.ticker);if(!id)continue;
  const p=h.position&&typeof h.position==="object"?h.position:{};
  const q=scan.holding.get(id)||{};
  result.set(id,{ticker:id,name:safe(h.name,100)||id,held:true,onWatchlist:false,
   quantity:num(p.quantity),currency:q.currency||safe(p.currency,8),quantityAsOf:safe(p.quantityAsOf,30),
   rank:null,score:num(h.score),close:q.close??null,day:q.day??null,threeDay:q.threeDay??null,
   fiveDay:q.fiveDay??null,session:q.session??null,basis:q.basis||"",action:safe(h.action,240),
   thesis:safe(h.verdict,240),entry:"",invalidation:safe(h.weakness,300)});
 }
 for(const w of list(snapshot?.watchlist,200)){
  const id=ticker(w.ticker);if(!id)continue;
  const old=result.get(id)||{},q=scan.watch.get(id)||scan.holding.get(id)||{};
  result.set(id,{ticker:id,name:old.name||safe(w.name,100)||id,
   held:old.held||false,onWatchlist:true,quantity:old.quantity??null,
   currency:old.currency||q.currency||"",quantityAsOf:old.quantityAsOf||"",rank:num(w.rank),
   score:num(w.score)??old.score??null,close:old.close??q.close??null,
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
 if(key==="group")return r.held?"Holding":r.onWatchlist?"Watchlist":"Research";
 if(key==="quantity")return r.held?r.quantity:null;
 return r[key]??null;
}
export async function initPortfolioTable(db,host){
 const {data:{user}={},error:authError}=await db.auth.getUser();
 if(authError||!user?.id){host.textContent="Owner session unavailable; no private portfolio displayed.";return;}
 const {data,error}=await db.from("power_stack_owner_snapshots")
  .select("snapshot_as_of,legacy_source_retired,snapshot").eq("owner_user_id",user.id)
  .order("snapshot_as_of",{ascending:false}).limit(1).maybeSingle();
 if(error||!data?.legacy_source_retired||!data.snapshot){host.textContent="No verified owner snapshot available.";return;}
 const priceFeed=await loadPriceFeed();
 const {lines,asOf}=project(data.snapshot,priceFeed);
 let sort="ticker",direction="asc",scope=location.hash==="#watchlist"?"watchlist":"all",search="",expanded=null;
 host.replaceChildren();
 const heading=el("div",null,"ps-table-head"),title=el("div");
 title.append(el("h2","Market watch & holdings"),
  el("p",lines.filter(r=>r.held).length+" recorded holdings · "+lines.filter(r=>r.onWatchlist).length+
   " watchlist names · Research snapshot "+data.snapshot_as_of+" (unverified)"));
 const feedGeneratedAt=asOf&&Number.isFinite(Date.parse(asOf))?Date.parse(asOf):null;
 const feedAgeHours=feedGeneratedAt===null?null:Math.max(0,Math.floor((Date.now()-feedGeneratedAt)/3600000));
 const eligibleNow=quotes(priceFeed).holding.size;
 const coverageLabel=priceFeed
  ?" · "+(priceFeed?.coverage?.fresh??0)+"/"+(priceFeed?.coverage?.tracked??0)+" fresh at generation"
  +" · "+eligibleNow+" valid now"+(feedAgeHours===null?"":" · generated "+feedAgeHours+"h ago")
  +(feedAgeHours!==null&&feedAgeHours>72?" · REFRESH OVERDUE":"")
  :" · FEED UNAVAILABLE";
 heading.append(title,el("span","Delayed prices · "+(asOf||"not available")+
  (feedAgeHours!==null&&feedAgeHours>72?" · update overdue":"")+
  (priceFeed?" · "+eligibleNow+" instruments available":""),"ps-table-note"));
 const opportunities=el("a","Review investment ideas →","ps-table-opportunities");
 opportunities.href="ideas.html";heading.append(opportunities);host.append(heading);
 const controls=el("div",null,"ps-table-controls"),input=el("input"),chips=el("div",null,"ps-table-chips");
 input.type="search";input.placeholder="Search ticker or company";input.setAttribute("aria-label","Find instrument");
 input.addEventListener("input",()=>{search=input.value.trim().toLowerCase();render();});
 controls.append(input,chips);host.append(controls);
 for(const [key,label] of [["all","All"],["holdings","Holdings"],["watchlist","Watchlist"]]){
  const b=el("button",label,"ps-chip");b.type="button";b.dataset.scope=key;
  b.addEventListener("click",()=>{scope=key;render();});chips.append(b);
 }
 const wrap=el("div",null,"table-wrap"),table=el("table",null,"ps-table"),
  thead=el("thead"),hrow=el("tr"),tbody=el("tbody");
 for(const [key,label,numeric] of columns){
  const th=el("th"),button=el("button",label+" ↕","ps-sort");button.type="button";
  button.addEventListener("click",()=>{if(sort===key)direction=direction==="asc"?"desc":"asc";
   else{sort=key;direction=numeric?"desc":"asc";}render();});
  th.append(button);hrow.append(th);
 }
 thead.append(hrow);table.append(thead,tbody);wrap.append(table);host.append(wrap);
 host.append(el("p","Prices are delayed. Recorded holdings and available cash require broker reconciliation; unavailable quotes show —.","ps-table-note"));
 function render(){
  for(const b of chips.children)b.setAttribute("aria-pressed",String(b.dataset.scope===scope));
  const selected=lines.filter(r=>(scope==="all"||scope==="holdings"&&r.held||scope==="watchlist"&&r.onWatchlist)
   &&(!search||[r.ticker,r.name,r.action,r.thesis].join(" ").toLowerCase().includes(search)));
  const mult=direction==="asc"?1:-1;
  selected.sort((a,b)=>{const av=rowValue(a,sort),bv=rowValue(b,sort);
   if(av===null&&bv===null)return a.ticker.localeCompare(b.ticker);
   if(av===null)return 1;if(bv===null)return -1;
   const v=typeof av==="number"&&typeof bv==="number"?av-bv:String(av).localeCompare(String(bv));
   return v*mult||a.ticker.localeCompare(b.ticker);
  });
  tbody.replaceChildren();
  if(!selected.length){const tr=el("tr");const td=cell(tr,"No matching instruments.");td.colSpan=9;tbody.append(tr);return;}
  for(const r of selected){
   const tr=el("tr"),th=el("th"),button=el("button",r.ticker+" · "+r.name,"ps-ticker");
   button.type="button";button.setAttribute("aria-expanded",String(expanded===r.ticker));
   button.addEventListener("click",()=>{expanded=expanded===r.ticker?null:r.ticker;render();});
   th.append(button);tr.append(th);
   cell(tr,r.held?"Holding"+(r.onWatchlist?" + watchlist":""):"Watchlist");
   cell(tr,r.held?fmt(r.quantity,8):"—");
   cell(tr,r.close===null?"—":(r.currency?r.currency+" ":"")+fmt(r.close,3));
   for(const v of [r.day,r.threeDay,r.fiveDay]){
    const td=cell(tr,pct(v));td.dataset.direction=v===null?"unknown":v>0?"up":v<0?"down":"flat";
   }
   cell(tr,r.score===null?"—":fmt(r.score,1)+" (archived)");
   cell(tr,r.session?(r.session+(r.basis==="BTC UTC daily sample"?" · BTC UTC sample":"")):"—");tbody.append(tr);
   if(expanded===r.ticker){
    const detail=el("tr"),td=el("td");td.colSpan=9;td.className="ps-row-details";
    for(const [label,val] of [["Research",r.action||r.thesis||"Pending"],["Entry / confirmation",r.entry||"Not recorded"],
      ["Invalidation",r.invalidation||"Not recorded"],["Quantity date",r.quantityAsOf||"Unknown"]]){
      const p=el("p");p.append(el("strong",label+": "),document.createTextNode(val));td.append(p);
    }
    detail.append(td);tbody.append(detail);
   }
  }
 }
 render();
}
