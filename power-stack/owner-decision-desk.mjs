import {CONTRACT,validateTicket,compareDecision,latestByCase,lane,caseKey,fingerprint,localDate} from "./owner-decision-core.mjs";
const $=(root,id)=>root.querySelector("#"+id);
const txt=(tag,value,cls)=>{
 const el=document.createElement(tag);
 if(value!==undefined&&value!==null)el.textContent=String(value);
 if(cls)el.className=cls;
 return el;
};
const safeUrl=x=>{
 try{const u=new URL(x);return u.protocol==="https:"&&!u.username&&!u.password&&u.href.length<2000?u.href:null}catch{return null}
};
const pretty=x=>String(x||"UNKNOWN").replaceAll("_"," ");
function renderEmpty(host,message){
 host.replaceChildren(txt("p",message,"psd-empty"));
}
function stamp(x){if(!x)return "Not dated";const d=new Date(x);return Number.isNaN(d.getTime())?String(x):d.toLocaleString("en-GB",{timeZone:"Asia/Kuala_Lumpur",dateStyle:"medium",timeStyle:"short"})+" MYT"}
function paragraph(host,heading,body){
 if(!body)return;const div=txt("div",null,"psd-detail-row");div.append(txt("span",heading,"psd-detail-label"),txt("p",body));host.append(div);
}
function makeCard(record,history=[]){
 const t=record.ticket,card=txt("article",null,"psd-card");
 const head=txt("div",null,"psd-card-head"),title=txt("div");
 title.append(txt("span",t.subject.instrument_id||t.subject.name,"psd-ticker"),txt("h3",t.subject.name));
 const badge=txt("span",pretty(t.recommendation.action),"psd-badge");
 head.append(title,badge);card.append(head);
 const mini=txt("div",null,"psd-tags");
 for(const v of [t.horizon.primary,t.recommendation.decision_state,t.evidence.source_status])
  mini.append(txt("span",pretty(v)));
 card.append(mini);
 paragraph(card,"Current judgement",t.recommendation.rationale);
 paragraph(card,"Next condition",t.recommendation.condition);
 if(t.review.review_by)paragraph(card,"Review by",t.review.review_by+" (MYT) · No automatic alert");
 if(t.review.risk_override)card.append(txt("p","Risk override recorded — inspect promptly.","psd-warning"));
 const expand=txt("details");expand.append(txt("summary","Scenarios, countercase and evidence"));
 const detail=txt("div",null,"psd-details");
 paragraph(detail,"Strongest countercase",t.assessment.strongest_counterargument);
 for(const k of ["bear","base","bull"]){
  const s=t.scenarios?.[k];if(!s)continue;
  const d=txt("div",null,"psd-scenario");
  d.append(txt("strong",k.toUpperCase()),txt("p",s.driver),txt("small","Condition: "+s.observable_condition),txt("small","Response: "+s.response));
  detail.append(d);
 }
 const alternatives=t.capital_alternatives||[];
 for(const v of alternatives.slice(0,6))paragraph(detail,"Alternative: "+v.choice,v.comparison+(v.data_limit?" · Limit: "+v.data_limit:""));
 if(t.evidence?.unresolved_gaps?.length)paragraph(detail,"Unresolved",t.evidence.unresolved_gaps.join("; "));
 const refs=txt("div",null,"psd-refs");
 for(const v of (t.evidence?.source_refs||[]).slice(0,8)){
  const url=safeUrl(v);if(!url)continue;
  const a=txt("a","Source "+(refs.children.length+1));a.href=url;a.rel="noopener noreferrer";a.target="_blank";refs.append(a);
 }
 if(refs.childElementCount)detail.append(refs);
 paragraph(detail,"Saved",stamp(record.created_at)+" · Analytical ticket; not a broker order");
 if(history.length){
  const hist=txt("details",null,"psd-history");hist.append(txt("summary",history.length+" previous revision(s)"));
  const list=txt("ul");
  for(const row of history.slice(0,12)){
   const li=txt("li",stamp(row.created_at)+" — "+pretty(row.ticket?.recommendation?.action)+" / "+pretty(row.ticket?.recommendation?.decision_state));
   list.append(li);
  }
  hist.append(list);detail.append(hist);
 }
 expand.append(detail);card.append(expand);return card;
}
function historicalRisk(snapshot){
 const names=new Set((snapshot?.holdings||[]).map(h=>String(h?.ticker||"").toUpperCase()));
 const items=[];
 if(names.has("6742UW"))items.push({name:"6742UW warrant",detail:"Recorded in an archived owner snapshot. Current strike, expiry, quantity and value are unverified. Confirm with your broker.",type:"Historical risk check"});
 if(names.has("YTLPOWR"))items.push({name:"YTL Power concentration",detail:"Earlier research raised parent/warrant exposure concerns. Current combined weight is unknown.",type:"Historical risk check"});
 return items;
}
export async function initDecisionDesk(db,main,user){
 if(!user?.id||!main)return;
 const host=document.createElement("section");host.id="ps-decision-desk";host.className="psd-root";
 host.innerHTML=`
 <div class="psd-top"><div><p class="psd-overline">PRIVATE · POWER STACK / DECISION OS</p><h1>Make fewer, better decisions.</h1><p>Investment thesis, timing and capital readiness stay separate. Old research is not a fresh order.</p></div><div class="psd-top-actions"><a href="https://chatgpt.com/plugins/plugins_6ae6ad8f96448191be515675a7469951" target="_blank" rel="noopener noreferrer">Open Power Stack plugin</a><a href="portfolio.html">Portfolio</a><a href="decisions.html">Research cases</a><button type="button" id="psd-open-import">Import decision ticket</button></div></div>
 <p id="psd-status" role="status" class="psd-status">Checking owner decision history…</p>
 <div class="psd-grid">
 <section class="psd-lane psd-risk"><div class="psd-lane-head"><span class="psd-index">01</span><div><h2>Protect capital</h2><p>Risks and overdue decisions bypass the opportunity shortlist.</p></div></div><div id="psd-risk-rows"></div></section>
 <section class="psd-lane psd-active"><div class="psd-lane-head"><span class="psd-index">02</span><div><h2>Next capital decision</h2><p>One priority action, with its competing use of money.</p></div></div><div id="psd-active-rows"></div></section>
 <section class="psd-lane psd-watch"><div class="psd-lane-head"><span class="psd-index">03</span><div><h2>Waiting for a trigger</h2><p>Keep the thesis; revisit only on a trigger or due date.</p></div></div><div id="psd-watch-rows"></div></section>
 </div>
 <section class="psd-book"><div class="psd-book-head"><div><h2>Decision history</h2><p>Owner-saved revisions only. No hidden trades or background monitoring.</p></div><span id="psd-count"></span></div><div id="psd-book-rows"></div></section>
 <section id="psd-import-panel" class="psd-import" hidden><div class="psd-book-head"><div><h2>Import a decision</h2><p>Paste a complete <code>power-stack-decision-ticket/v2</code> from the Power Stack plugin. This saves a private, append-only review record, not an order.</p></div><button type="button" id="psd-close-import">Close</button></div><form id="psd-import-form"><label for="psd-ticket-file">Load a Power Stack decision ticket (.json)</label><input id="psd-ticket-file" type="file" accept=".json,application/json"><label for="psd-ticket-json">Or paste decision ticket JSON</label><textarea id="psd-ticket-json" rows="11" spellcheck="false" required placeholder="Load a .json file or paste the complete plugin decision ticket here"></textarea><p class="psd-disclaimer">Never treat an analyst report as broker-confirmed buying power. No existing portfolio rows will be edited.</p><button type="submit" id="psd-save">Validate and save private revision</button></form><p id="psd-import-status" role="status"></p></section>
 <p class="psd-footnote">The following archived editorial report is preserved for context. It may predate current market or account conditions.</p>`;
 main.prepend(host);
 const state={rows:[],snapshot:null,snapshotDate:null};
 function status(s){$(host,"psd-status").textContent=s}
 function draw(){
  const latest=latestByCase(state.rows),historyByKey=new Map();
  for(const row of state.rows){
   if(!historyByKey.has(row.case_key))historyByKey.set(row.case_key,[]);
   historyByKey.get(row.case_key).push(row);
  }
  const groups={risk:[],decision:[],watch:[]};
  for(const row of latest)groups[lane(row)].push(row);
  const due=(r)=>r.ticket?.review?.review_by||"9999-12-31";
  groups.watch.sort((a,b)=>due(a).localeCompare(due(b)));
  groups.risk.sort((a,b)=>due(a).localeCompare(due(b)));
  for(const key of ["risk","active","watch"]){
   const slot=$(host,"psd-"+key+"-rows");slot.replaceChildren();
   const arr=groups[key==="active"?"decision":key];
   const limit=key==="active"?1:key==="watch"?3:5;
   for(const row of arr.slice(0,limit))slot.append(makeCard(row,(historyByKey.get(row.case_key)||[]).filter(r=>r.entry_id!==row.entry_id)));
   if(!arr.length)renderEmpty(slot,key==="risk"?"No saved urgent decisions. Historical risks below are not confirmed current positions.":key==="active"?"No actionable capital decision saved. Holding cash is a valid outcome.":"No saved trigger-driven decisions yet.");
   if(arr.length>limit)slot.append(txt("p",+(arr.length-limit)+" more in decision history","psd-empty"));
  }
  const riskSlot=$(host,"psd-risk-rows");
  for(const item of historicalRisk(state.snapshot)){
   const node=txt("div",null,"psd-historical");
   node.append(txt("strong",item.name),txt("small",item.type+" · Snapshot "+(state.snapshotDate||"date unknown")),txt("p",item.detail));
   riskSlot.append(node);
  }
  const book=$(host,"psd-book-rows");book.replaceChildren();
  for(const row of latest.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))).slice(0,24))
   book.append(makeCard(row,(historyByKey.get(row.case_key)||[]).filter(r=>r.entry_id!==row.entry_id)));
  if(!latest.length)renderEmpty(book,"No owner-saved decisions yet. Your historical research has not been silently converted into a fresh investment recommendation. Import a reviewed ticket to start decision memory.");
  $(host,"psd-count").textContent=latest.length+" active cases · "+state.rows.length+" revisions";
 }
 async function refresh(){
  const [saved,snapshot]=await Promise.all([
   db.from("power_stack_decision_revisions").select("entry_id,case_key,ticket,fingerprint,created_at").order("created_at",{ascending:false}).limit(200),
   db.from("power_stack_owner_snapshots").select("snapshot_as_of,snapshot,legacy_source_retired").eq("owner_user_id",user.id).limit(1).maybeSingle()
  ]);
  if(saved.error)throw Error("Owner decision history unavailable: "+saved.error.message);
  if(snapshot.error||!snapshot.data?.legacy_source_retired)throw Error("Owner portfolio access not verified");
  state.rows=saved.data||[];state.snapshot=snapshot.data.snapshot;state.snapshotDate=snapshot.data.snapshot_as_of;
  draw();status("Owner-only decision records loaded · "+localDate()+" MYT · Historical holdings as of "+state.snapshotDate);
 }
 $(host,"psd-open-import").addEventListener("click",()=>{$(host,"psd-import-panel").hidden=false;$(host,"psd-ticket-json").focus()});
 $(host,"psd-close-import").addEventListener("click",()=>{$(host,"psd-import-panel").hidden=true});
 $(host,"psd-ticket-file").addEventListener("change",async()=>{
  const pick=$(host,"psd-ticket-file"),file=pick.files?.[0],note=$(host,"psd-import-status");
  if(!file)return;
  try{
   if(file.size>60000)throw Error("Ticket exceeds 60 KB limit");
   if(!/\.json$/i.test(file.name))throw Error("Only .json decision tickets are accepted");
   const source=await file.text();
   const payload=JSON.parse(source),errors=validateTicket(payload);
   if(errors.length)throw Error("Ticket invalid: "+errors.join(", "));
   $(host,"psd-ticket-json").value=JSON.stringify(payload,null,2);
   note.textContent="File validated. Review the decision, then select Validate and save private revision.";
  }catch(e){note.textContent="File not loaded: "+String(e.message||e).slice(0,300)}
  finally{pick.value="";}
 });
 $(host,"psd-import-form").addEventListener("submit",async e=>{
  e.preventDefault();const button=$(host,"psd-save"),note=$(host,"psd-import-status");button.disabled=true;note.textContent="Validating…";
  try{
   const input=$(host,"psd-ticket-json").value;if(input.length>60000)throw Error("Ticket too large");
   const ticket=JSON.parse(input),errors=validateTicket(ticket);
   if(errors.length)throw Error("Decision contract invalid: "+errors.join(", "));
   const key=caseKey(ticket);
   if(Date.parse(ticket.as_of)>Date.now()+5*60000)throw Error("Ticket is dated in the future");
   if(ticket.review.review_by&&ticket.recommendation.action==="NO_ACTION"&&ticket.review.review_by<localDate())
    throw Error("Expired NO_ACTION needs a new review, not a new saved HOLD");
   const previous=latestByCase(state.rows).find(x=>x.case_key===key);
   const cmp=compareDecision(previous,ticket);
   if(!cmp.shouldSave)throw Error(cmp.reason+". No duplicate revision saved ("+cmp.status+").");
   const hash=await fingerprint(ticket);
   const {data,error}=await db.from("power_stack_decision_revisions")
    .insert({case_key:key,fingerprint:hash,ticket,previous_entry_id:previous?.entry_id||null})
    .select("entry_id").single();
   if(error)throw Error("Private save rejected: "+error.message);
   if(!data?.entry_id)throw Error("Save could not be verified");
   await refresh();$(host,"psd-ticket-json").value="";
   note.textContent="Saved verified private revision. No broker order or public publication occurred.";
  }catch(err){note.textContent=String(err?.message||err).slice(0,400)}
  finally{button.disabled=false}
 });
 try{await refresh()}catch(err){
  renderEmpty($(host,"psd-risk-rows"),"Owner data access unavailable");
  renderEmpty($(host,"psd-active-rows"),"No fallback to historical data as current recommendation");
  renderEmpty($(host,"psd-watch-rows"),"Triggers cannot be evaluated without private access");
  renderEmpty($(host,"psd-book-rows"),"Decision history unavailable");
  status(String(err.message||err).slice(0,250));
  $(host,"psd-open-import").disabled=true;
 }
}
