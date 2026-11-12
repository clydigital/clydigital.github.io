import {loadPriceFeed,quotes} from "./owner-portfolio-table.mjs?v=20261112-tech1";
import {assessIdea,sweepSignals,approvedEvidence} from "./owner-ideas-core.mjs";
import {isBondEtf} from "./owner-market-views.mjs";
import {entryAlert,rankEntryIdeas} from "./owner-entry-plans.mjs";
import {renderOpportunityTerminal} from "./owner-opportunity-terminal.mjs?v=20261113-lens1";
import {psIcon,iconText,addHeadingIcon} from "./owner-visual-icons.mjs?v=20261113-fg1";

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
  <div><p class="eyebrow">POWER STACK / RESEARCH RADAR</p><h1>Find your next opportunity</h1>
  <p>Tactical setups and longer-term investment theses, clearly separated. Explore the evidence, conditions and invalidation before acting; a price alert is not a buy order.</p></div>
  <nav class="psi-shortcuts" aria-label="Investment tools"><a href="index.html">Overview</a><a href="portfolio.html#watchlist">Market watch</a><button type="button" id="psi-add">+ Track idea</button></nav>
 </div>
 <div id="psi-opportunity-mount"></div>
 <details id="psi-tracked-drawer" class="psi-tracked-drawer">
  <summary class="psi-tracked-summary"><span>My tracked research ideas</span><small id="psi-tracked-count">Expand for saved ideas, PEG comparisons and entry ranges</small></summary>
  <div class="psi-tracked-body">
 <div id="psi-feed" class="psi-feed" role="status">Loading the dated market feed and private ideas…</div>
 <div id="psi-stats" class="psi-stats"></div>
 <section class="psi-tools"><label for="psi-search">Find an idea</label><input id="psi-search" type="search" placeholder="Search ticker or company" autocomplete="off">
 <label for="psi-filter">Category / signal</label><select id="psi-filter"><option value="ALL">All ideas</option><option value="TRADE">Tracked trades</option><option value="INVESTMENT">Tracked investments</option><option value="HIGH">High-priority research</option><option value="ALERT">Inside alert range</option><option value="WAIT_PRICE">Wait for price</option><option value="BONDS">Bond ETFs</option><option value="ALIGNED">Screen matches</option><option value="DIVERGENCE">Divergences</option><option value="WATCH">Watch</option><option value="RECHECK">Recheck</option></select></section>
 <div class="psv-research-key" role="note">
  <span>Entry bands are research alerts, not approved trades.</span>
  <span class="psv-key-item psv-key-ready">In alert range</span>
  <span class="psv-key-item psv-key-wait">Wait for retrace</span>
  <span class="psv-key-item psv-key-risk">Below range — recheck</span>
 </div>
 <div id="psi-cards" class="psi-cards" aria-live="polite"></div>
  </div>
 </details>
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
 <p class="psi-disclaimer">Delayed prices and research-only signals, not executable orders. ETFs have no issuer PEG; cyclicals and fintechs require midcycle or cash-flow normalization, and unclassified business models require further evidence.</p>`;
 const $=id=>main.querySelector("#"+id);
 addHeadingIcon(main,".psi-hero h1","layers");
 for(const [selector,shape] of [
  ['.psi-shortcuts a[href="index.html"]',"compass"],
  ['.psi-shortcuts a[href^="portfolio.html"]',"chart"],
  ["#psi-add","target"]
 ]){
  const link=main.querySelector(selector);if(link)link.prepend(psIcon(shape));
 }
 for(const [selector,shape] of [['label[for="psi-search"]',"search"],['label[for="psi-filter"]',"filter"]]){
  const label=main.querySelector(".psi-tools "+selector);if(label)label.prepend(psIcon(shape));
 }
 const state={ideas:[],prices:new Map(),feedAt:null,editing:null};
 const trackedDrawer=$("psi-tracked-drawer");
 const form=$("psi-form");
 const setStatus=s=>{$("psi-feed").textContent=s;};
 const quote=id=>state.prices.get(id);
 function card(row){
  const q=quote(row.ticker),a=assessIdea(row,q),plan=entryAlert(row,q),node=el("article",null,"psi-card psi-"+a.status.toLowerCase());
  const head=el("div",null,"psi-card-head"),left=el("div"),right=el("div",null,"psi-right");
  left.append(iconText(isBondEtf(row.ticker)?"landmark":"chart",row.ticker,"psv-ticker-mark psi-ticker"),
    el("small",row.name||row.ticker));
  left.append(el("span",row.idea_type==="TRADE"?"Trade setup":"Investment idea","psi-type"));
  right.append(iconText(plan.status==="IN_ALERT"?"target":plan.status==="WAIT_RETRACE"?"clock":
    plan.status==="BELOW_ALERT"?"warning":plan.status==="PRICE_UNAVAILABLE"||plan.status==="PRICE_STALE"?"refresh":plan.status==="PRICE_MISMATCH"?"shield":"calendar",
    plan.label,"psi-plan-label"+(plan.status==="BELOW_ALERT"?" psi-plan-missed":"")));
  head.append(left,right);node.append(head);
  const metrics=el("div",null,"psi-metrics");
  const values=[
   ["PEG",a.pegSuitability==="NOT_APPLICABLE"?"N/A":a.peg===null?"—":a.peg.toFixed(2),a.pegVerified?"Dated input "+row.peg_as_of:"Check valuation source"],
   ["Last close",fmt(q?.close,q?.currency||row.currency),q?.session?q.session:"Price unavailable"],
   ["Watch price",a.zoneVerified?fmt(a.low,row.currency)+" – "+fmt(a.high,row.currency):"Set a range",
    a.distance===null?"":a.distance>0?"Above zone "+a.distance.toFixed(1)+"%":a.distance<0?"Below zone "+Math.abs(a.distance).toFixed(1)+"%":"Inside zone"],
   ["Macro",row.macro_state==="UNKNOWN"?"Not reviewed":row.macro_state,
    a.macroVerified?"As of "+row.macro_as_of:"Review macro outlook"]
  ];
  for(const [label,val,sub] of values){const m=el("div",null,"psi-metric");m.append(el("small",label),el("strong",val),el("small",sub));metrics.append(m)}
  node.append(metrics);
  if(plan.entry||plan.thesis){
   const planbox=el("div",null,"psi-entry-plan");
   planbox.append(iconText("target",plan.priority==="UNRANKED"?"CONDITIONAL RESEARCH":
    plan.priority+" PRIORITY · CONDITIONAL ENTRY","psv-plan-title"));
   const line=(shape,title,value,kind="")=>{
    const item=el("div",null,"psv-plan-line"+(kind?" "+kind:""));
    item.append(psIcon(shape),el("span",title,"psv-plan-caption"),el("p",value));
    planbox.append(item);
   };
   if(plan.thesis)line("compass","WHY IT MATTERS",plan.thesis);
   if(plan.entry)line("target","WAIT FOR",plan.entry,"psv-entry-emphasis");
   if(plan.hasZone)planbox.append(iconText("eye","Provisional alert: "+fmt(plan.low,row.currency)+" – "+
    fmt(plan.high,row.currency)+" · Not tested technical support","psv-alert-zone"));
   if(plan.invalidation)line("shield","NO-GO / INVALIDATION",plan.invalidation,"psv-plan-risk");
   if(plan.catalyst)line("calendar","NEXT CATALYST",plan.catalyst);
   node.append(planbox);
  }
  if(!(plan.entry||plan.thesis))node.append(el("p","PEG / macro screen: "+a.why,"psi-why"));
  const detail=el("details"),summary=el("summary","Investment case, assumptions & sources");detail.append(summary);
  const body=el("div",null,"psi-detail");
  body.append(el("p","Screen / evidence: "+a.why));
  body.append(el("p","PEG suitability: "+a.pegSuitability+" — "+a.pegSuitabilityReason));
  body.append(el("p","PEG methodology: "+(row.peg_basis||"Not recorded")));
  body.append(el("p","Macro: "+(row.macro_reason||"Not reviewed")));
  if(!plan.entry)body.append(el("p","What to watch: "+(row.note||"Not recorded")));
  if(plan.basis)body.append(el("p","Alert basis: "+plan.basis));
  for(const [url,label] of [[row.peg_source_url,"PEG source"],[row.macro_source_url,"Macro source"]]){
   if(approvedEvidence(url)){const anchor=el("a",label+" ↗");anchor.href=url;anchor.target="_blank";anchor.rel="noopener noreferrer";body.append(anchor)}
  }
  detail.append(body);node.append(detail);
  const actions=el("div",null,"psi-card-actions");
  const edit=el("button",null,"psi-secondary");edit.append(psIcon("eye"),document.createTextNode(" Edit"));edit.type="button";edit.addEventListener("click",()=>openEditor(row));
  const del=el("button",null,"psi-secondary");del.append(psIcon("warning"),document.createTextNode(" Remove"));del.type="button";del.addEventListener("click",()=>removeIdea(row));
  actions.append(edit,del);node.append(actions);
  return node;
 }
 function render(){
  $("psi-tracked-count").textContent=state.ideas.length+
   " saved research ideas · expand for ticker filters, price zones, PEG and detailed decisions";
  const signals=sweepSignals(state.ideas,state.prices),
    counts=Object.fromEntries(["ALIGNED","DIVERGENCE","WATCH","RECHECK"].map(k=>[k,signals.filter(x=>x.status===k).length])),
    ranked=rankEntryIdeas(state.ideas,state.prices);
  $("psi-stats").replaceChildren();
  const high=ranked.filter(x=>x.entryAlert.priority==="HIGH").length,
    inAlert=ranked.filter(x=>x.entryAlert.status==="IN_ALERT").length,
    waiting=ranked.filter(x=>x.entryAlert.status==="WAIT_RETRACE").length;
  for(const [label,value,shape] of [
   ["High-priority research",high,"bolt"],["Inside alert range",inAlert,"target"],
   ["Wait for retrace",waiting,"clock"],["PEG/macro checks due",counts.RECHECK,"book"]
  ]){
   const item=el("div",null,"psi-stat");
   item.append(psIcon(shape,"psv-stat-icon"),el("strong",value),el("small",label));$("psi-stats").append(item);
  }
  const filter=$("psi-filter").value,search=$("psi-search").value.toUpperCase().trim(),results=$("psi-cards");
  results.replaceChildren();
  const lookup=new Map(signals.map(v=>[v.ticker+"|"+v.idea_type,v.status]));
  const filtered=ranked.filter(row=>(
    filter==="ALL"||
    filter==="TRADE"&&row.idea_type==="TRADE"||
    filter==="INVESTMENT"&&row.idea_type==="INVESTMENT"||
    filter==="HIGH"&&row.entryAlert.priority==="HIGH"||
    filter==="ALERT"&&row.entryAlert.status==="IN_ALERT"||
    filter==="WAIT_PRICE"&&row.entryAlert.status==="WAIT_RETRACE"||
    filter==="BONDS"&&isBondEtf(row.ticker)||
    lookup.get(row.ticker+"|"+row.idea_type)===filter)
   &&(!search||[row.ticker,row.name,row.note].join(" ").toUpperCase().includes(search)));
  if(!filtered.length){results.append(el("p",state.ideas.length?"No matching research entries.":"No ideas tracked yet. Select + Track idea to begin.","psi-empty"));return;}
  // Group by research priority to avoid a wall of otherwise identical cards.
  for(const [level,heading,shape] of [
    ["HIGH","Priority research","bolt"],["MEDIUM","Next candidates","layers"],
    ["WATCH","Longer-term watch","eye"],["UNRANKED","Further diligence","book"]
  ]){
   const members=filtered.filter(row=>row.entryAlert.priority===level);
   if(!members.length)continue;
   const section=el("section",null,"psv-idea-group");
   const header=el("div",null,"psv-idea-group-heading");
   header.append(iconText(shape,heading,"psv-group-title"),
    el("small",members.length+" "+(members.length===1?"research idea":"research ideas")));
   section.append(header);
   const list=el("div",null,"psv-group-cards");
   for(const row of members)list.append(card(row));
   section.append(list);results.append(section);
  }
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
  renderOpportunityTerminal($("psi-opportunity-mount"),state.prices,{mode:"ideas",ownerResearch:state.ideas});
  render();
 }
 $("psi-add").addEventListener("click",()=>openEditor());
 $("psi-cancel").addEventListener("click",()=>{$("psi-editor").hidden=true;state.editing=null;});
 $("psi-search").addEventListener("input",render);
 $("psi-filter").addEventListener("change",render);
 if(location.hash==="#bonds"){$("psi-filter").value="BONDS";trackedDrawer.open=true;}
 if(location.hash==="#tracked")trackedDrawer.open=true;
 window.addEventListener("hashchange",()=>{
  if(location.hash==="#bonds"){$("psi-filter").value="BONDS";trackedDrawer.open=true;render();}
  if(location.hash==="#tracked")trackedDrawer.open=true;
 });
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
