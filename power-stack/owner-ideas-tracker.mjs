import {loadPriceFeed,quotes} from "./owner-portfolio-table.mjs";
import {assessIdea,sweepSignals,approvedEvidence} from "./owner-ideas-core.mjs";

const T="power_stack_idea_tracker";
const el=(tag,content,cls)=>{
 const node=document.createElement(tag);
 if(content!==undefined&&content!==null)node.textContent=String(content);
 if(cls)node.className=cls;
 return node;
};
const fmt=(v,c="USD")=>v===null||v===undefined?"—":c+" "+Number(v).toLocaleString("en-GB",{maximumFractionDigits:3});
const shortDate=v=>v||"Not reviewed";
const get=(form,name)=>String(form.elements.namedItem(name)?.value||"").trim();
const num=v=>v===""?null:Number(v);
const clean=(v,n=450)=>String(v||"").trim().slice(0,n);

export async function initIdeasTracker(db,main,user){
 if(!user?.id||!main)throw Error("Private owner access required");
 main.className="psi-shell";
 main.innerHTML=`
 <div class="psi-hero">
  <div><p class="eyebrow">POWER STACK / OPPORTUNITIES</p><h1>Investment ideas</h1>
  <p>Attractive valuations, macro conditions and the price worth paying.</p></div>
  <nav class="psi-shortcuts" aria-label="Investment tools"><a href="index.html">Overview</a><a href="portfolio.html#watchlist">Market watch</a><button type="button" id="psi-add">+ Track idea</button></nav>
 </div>
 <div id="psi-feed" class="psi-feed" role="status">Loading the dated market feed and private ideas…</div>
 <div id="psi-stats" class="psi-stats"></div>
 <section class="psi-tools"><label for="psi-search">Find an idea</label><input id="psi-search" type="search" placeholder="Search ticker or company" autocomplete="off">
 <label for="psi-filter">Signal</label><select id="psi-filter"><option value="ALL">All ideas</option><option value="ALIGNED">Aligned</option><option value="DIVERGENCE">Divergences</option><option value="WATCH">Watch</option><option value="RECHECK">Recheck</option></select></section>
 <div id="psi-cards" class="psi-cards" aria-live="polite"></div>
 <section id="psi-editor" class="psi-editor" hidden>
  <div class="psi-editor-top"><h2 id="psi-editor-title">Track investment idea</h2><button type="button" class="psi-secondary" id="psi-cancel">Cancel</button></div>
  <form id="psi-form"><div class="psi-form-grid">
   <label>Ticker<input name="ticker" required maxlength="20" placeholder="XOM" pattern="[A-Za-z0-9][A-Za-z0-9.:-]{0,19}"></label>
   <label>Company<input name="name" maxlength="120" placeholder="ExxonMobil"></label>
   <label>Idea type<select name="idea_type"><option value="INVESTMENT">Investment</option><option value="TRADE">Trade</option></select></label>
   <label>Currency<select name="currency"><option>USD</option><option>MYR</option><option>HKD</option><option>CNY</option></select></label>
   <label>PEG ratio<input name="peg" type="number" min=".001" max="99.99" step=".001" placeholder="0.75"></label>
   <label>PEG as-of<input name="peg_as_of" type="date"></label>
   <label>Watch price — low<input name="watch_low" type="number" min=".000001" step="any" placeholder="190"></label>
   <label>Watch price — high<input name="watch_high" type="number" min=".000001" step="any" placeholder="200"></label>
   <label>Macro assessment<select name="macro_state"><option value="UNKNOWN">Not assessed</option><option value="SUPPORTIVE">Supportive</option><option value="MIXED">Mixed</option><option value="ADVERSE">Adverse</option></select></label>
   <label>Macro as-of<input name="macro_as_of" type="date"></label>
   <label class="psi-span">PEG methodology / growth horizon<input name="peg_basis" maxlength="200" placeholder="5-year expected earnings growth; check unusual cyclicality"></label>
   <label class="psi-span">PEG source (HTTPS)<input name="peg_source_url" type="url" maxlength="1000" placeholder="https://..."></label>
   <label class="psi-span">Macro rationale<input name="macro_reason" maxlength="500" placeholder="What has improved or worsened for this company?"></label>
   <label class="psi-span">Macro evidence source (HTTPS)<input name="macro_source_url" type="url" maxlength="1000" placeholder="https://..."></label>
   <label class="psi-span">What to watch / invalidation<input name="note" maxlength="800" placeholder="Wait for crude stabilization; reassess if earnings estimates fall"></label>
  </div><div class="psi-submit"><button type="submit" id="psi-save">Save private idea</button><span id="psi-form-status" role="status"></span></div></form>
 </section>
 <p class="psi-disclaimer">Delayed prices. PEG and macro assessments use dated research; price zones and signals are for investment review, not orders.</p>`;
 const $=id=>main.querySelector("#"+id);
 const state={ideas:[],prices:new Map(),feedAt:null,editing:null};
 const form=$("psi-form");
 const setStatus=s=>{$("psi-feed").textContent=s;};
 const quote=id=>state.prices.get(id);
 function card(row){
  const q=quote(row.ticker),a=assessIdea(row,q),node=el("article",null,"psi-card psi-"+a.status.toLowerCase());
  const head=el("div",null,"psi-card-head"),left=el("div"),right=el("div",null,"psi-right");
  left.append(el("strong",row.ticker,"psi-ticker"),el("small",row.name||row.ticker));
  left.append(el("span",row.idea_type==="TRADE"?"Trade setup":"Investment idea","psi-type"));
  right.append(el("span",({ALIGNED:"Consider entry",DIVERGENCE:"Conflicting signals",WATCH:"On watch",RECHECK:"Review required"})[a.status]||"Review","psi-badge psi-"+a.status.toLowerCase()));
  head.append(left,right);node.append(head);
  const metrics=el("div",null,"psi-metrics");
  const values=[
   ["PEG",a.peg===null?"—":a.peg.toFixed(2),a.pegVerified?"As of "+row.peg_as_of:"Check valuation source"],
   ["Last close",fmt(q?.close,q?.currency||row.currency),q?.session?q.session:"Price unavailable"],
   ["Watch price",a.zoneVerified?fmt(a.low,row.currency)+" – "+fmt(a.high,row.currency):"Set a range",
    a.distance===null?"":a.distance>0?"Above zone "+a.distance.toFixed(1)+"%":a.distance<0?"Below zone "+Math.abs(a.distance).toFixed(1)+"%":"Inside zone"],
   ["Macro",row.macro_state==="UNKNOWN"?"Not reviewed":row.macro_state,
    a.macroVerified?"As of "+row.macro_as_of:"Review macro outlook"]
  ];
  for(const [label,val,sub] of values){const m=el("div",null,"psi-metric");m.append(el("small",label),el("strong",val),el("small",sub));metrics.append(m)}
  node.append(metrics,el("p",a.why,"psi-why"));
  const detail=el("details"),summary=el("summary","Investment case, assumptions & sources");detail.append(summary);
  const body=el("div",null,"psi-detail");
  body.append(el("p","PEG methodology: "+(row.peg_basis||"Not recorded")));
  body.append(el("p","Macro: "+(row.macro_reason||"Not reviewed")));
  body.append(el("p","What to watch: "+(row.note||"Not recorded")));
  for(const [url,label] of [[row.peg_source_url,"PEG source"],[row.macro_source_url,"Macro source"]]){
   if(approvedEvidence(url)){const anchor=el("a",label+" ↗");anchor.href=url;anchor.target="_blank";anchor.rel="noopener noreferrer";body.append(anchor)}
  }
  detail.append(body);node.append(detail);
  const actions=el("div",null,"psi-card-actions");
  const edit=el("button","Edit","psi-secondary");edit.type="button";edit.addEventListener("click",()=>openEditor(row));
  const del=el("button","Remove","psi-secondary");del.type="button";del.addEventListener("click",()=>removeIdea(row));
  actions.append(edit,del);node.append(actions);
  return node;
 }
 function render(){
  const signals=sweepSignals(state.ideas,state.prices),counts=Object.fromEntries(["ALIGNED","DIVERGENCE","WATCH","RECHECK"].map(k=>[k,signals.filter(x=>x.status===k).length]));
  $("psi-stats").replaceChildren();
  for(const [label,value] of [["Consider entry",counts.ALIGNED],["Conflicting signals",counts.DIVERGENCE],["On watch",counts.WATCH],["Research due",counts.RECHECK]]){
   const item=el("div",null,"psi-stat");item.append(el("strong",value),el("small",label));$("psi-stats").append(item);
  }
  const filter=$("psi-filter").value,search=$("psi-search").value.toUpperCase().trim(),results=$("psi-cards");
  results.replaceChildren();
  const lookup=new Map(signals.map(s=>[s.ticker+"|"+s.idea_type,s.status]));
  const order={ALIGNED:0,DIVERGENCE:1,WATCH:2,RECHECK:3};
  const filtered=state.ideas.filter(row=>(filter==="ALL"||lookup.get(row.ticker+"|"+row.idea_type)===filter)
   &&(!search||[row.ticker,row.name,row.note].join(" ").toUpperCase().includes(search)))
   .sort((a,b)=>(order[lookup.get(a.ticker+"|"+a.idea_type)]??4)-(order[lookup.get(b.ticker+"|"+b.idea_type)]??4)
    ||a.ticker.localeCompare(b.ticker));
  if(!filtered.length){results.append(el("p",state.ideas.length?"No matching ideas.":"No ideas tracked yet. Select + Add idea to begin.","psi-empty"));return;}
  for(const row of filtered)results.append(card(row));
 }
 function openEditor(row=null){
  state.editing=row?.id??null;
  $("psi-editor-title").textContent=row?"Update "+row.ticker:"Track an idea";
  form.reset();
  for(const key of ["ticker","name","idea_type","currency","peg","peg_as_of","watch_low","watch_high","macro_state","macro_as_of","peg_basis","peg_source_url","macro_reason","macro_source_url","note"]){
   const input=form.elements.namedItem(key);
   if(input&&row&&row[key]!==null&&row[key]!==undefined)input.value=String(row[key]);
  }
  form.elements.namedItem("ticker").readOnly=Boolean(row);
  form.elements.namedItem("idea_type").disabled=Boolean(row);
  $("psi-form-status").textContent="";
  $("psi-editor").hidden=false;$("psi-editor").scrollIntoView({behavior:"smooth",block:"start"});
 }
 async function removeIdea(row){
  if(!confirm("Remove "+row.ticker+" from private Ideas Tracker?"))return;
  const {data,error}=await db.from(T).delete().eq("id",row.id).eq("owner_user_id",user.id).select("id");
  if(error||!data?.length){setStatus("Could not remove idea. Owner permission or connection failed.");return;}
  await refresh();setStatus("Idea removed from private tracker.");
 }
 async function refresh(){
  const [response,feed]=await Promise.all([
   db.from(T).select("id,ticker,name,idea_type,currency,peg,peg_as_of,peg_source_url,peg_basis,macro_state,macro_as_of,macro_reason,macro_source_url,watch_low,watch_high,note,updated_at").eq("owner_user_id",user.id).order("updated_at",{ascending:false}).limit(150),
   loadPriceFeed()
  ]);
  if(response.error)throw Error("Private ideas unavailable: "+response.error.message);
  state.ideas=response.data||[];
  const age=Date.now()-Date.parse(feed?.generatedAt||"");
  const validAge=Number.isFinite(age)&&age>=0&&age<=72*3600000;
  const parsed=validAge?quotes(feed):null;
  state.prices=parsed?.watch||new Map();
  state.feedAt=validAge?feed.generatedAt:null;
  setStatus("Last price update · "+(state.feedAt||"unavailable")+" · Valuation and macro reviewed separately.");
  render();
 }
 $("psi-add").addEventListener("click",()=>openEditor());
 $("psi-cancel").addEventListener("click",()=>{$("psi-editor").hidden=true;state.editing=null;});
 $("psi-search").addEventListener("input",render);
 $("psi-filter").addEventListener("change",render);
 form.addEventListener("submit",async event=>{
  event.preventDefault();const btn=$("psi-save"),notice=$("psi-form-status");btn.disabled=true;notice.textContent="Saving…";
  try{
   const ticker=get(form,"ticker").toUpperCase();
   if(!/^[A-Z0-9][A-Z0-9.:-]{0,19}$/.test(ticker))throw Error("Ticker must be a valid market symbol");
   const peg=num(get(form,"peg")),watch_low=num(get(form,"watch_low")),watch_high=num(get(form,"watch_high"));
   if(peg!==null&&(!(peg>0)||peg>=100||!get(form,"peg_as_of")))throw Error("PEG needs a value above zero and an as-of date");
   if(watch_low!==null&&(!(watch_low>0)))throw Error("Watch low must be positive");
   if(watch_high!==null&&(!(watch_high>0)))throw Error("Watch high must be positive");
   if(watch_low!==null&&watch_high!==null&&watch_low>watch_high)throw Error("Watch low cannot exceed watch high");
   for(const key of ["peg_source_url","macro_source_url"]){const v=get(form,key);if(v&&!approvedEvidence(v))throw Error("Use a valid HTTPS evidence source");}
   const today=new Date().toISOString().slice(0,10);
   for(const key of ["peg_as_of","macro_as_of"]){const d=get(form,key);if(d&&d>today)throw Error("Evidence dates cannot be in the future");}
   const input={
    ticker,name:clean(get(form,"name"),120),idea_type:get(form,"idea_type"),currency:get(form,"currency"),
    peg,peg_as_of:get(form,"peg_as_of")||null,peg_source_url:clean(get(form,"peg_source_url"),1000),
    peg_basis:clean(get(form,"peg_basis"),200),macro_state:get(form,"macro_state"),
    macro_as_of:get(form,"macro_as_of")||null,macro_reason:clean(get(form,"macro_reason"),500),
    macro_source_url:clean(get(form,"macro_source_url"),1000),
    watch_low,watch_high,note:clean(get(form,"note"),800),updated_at:new Date().toISOString()
   };
   const query=state.editing===null
    ?db.from(T).insert({...input,owner_user_id:user.id}).select("id")
    :db.from(T).update(input).eq("id",state.editing).eq("owner_user_id",user.id).select("id");
   const {data,error}=await query;
   if(error||!data?.length)throw Error(error?.message||"No owner-authorized row was saved");
   $("psi-editor").hidden=true;state.editing=null;
   await refresh();setStatus("Private idea saved. Alignment recalculated using dated evidence and delayed market price.");
  }catch(error){notice.textContent="Not saved: "+String(error.message||error).slice(0,240);}
  finally{btn.disabled=false;}
 });
 try{await refresh()}catch(error){setStatus("Tracker data unavailable; no investment signal. "+String(error.message||error).slice(0,220));}
}
