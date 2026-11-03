import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from "./owner-portfolio-config.mjs";
import {RESEARCH_AS_OF,researchFor,researchPriority} from "./research-cases.mjs?v=20261104-ps8";
/** Owner identity and row-level security live in Supabase. No backend proxy or Vercel. */
const $=id=>document.getElementById(id);
const root="https://clydigital.github.io/power-stack/decisions.html";
let supabase=null,records=[],snapshotDate=null;
const clean=(value,max=150)=>typeof value==="string"?value.trim().slice(0,max):"";
const symbol=(value)=>{const v=clean(value,24).toUpperCase();return /^[A-Z0-9][A-Z0-9._:-]{0,19}$/.test(v)?v:null;};
function text(name,content,cls){
 const el=document.createElement(name);el.textContent=String(content??"");
 if(cls)el.className=cls;return el;
}
function link(url,label){const a=text("a",label);a.href=url;a.rel="noopener noreferrer";a.target="_blank";return a;}
function setStatus(s){$("decisions-status").textContent=s;}
function showOwner(yes){$("decisions-owner").hidden=!yes;$("decisions-login").hidden=yes;$("decisions-logout").hidden=!yes;}
function rows(v,limit){return Array.isArray(v)?v.slice(0,limit).filter(x=>x&&typeof x==="object"&&!Array.isArray(x)):[];}
// Research status ranking is centralised in research-cases.mjs.
function projection(snapshot){
 const map=new Map();
 for(const h of rows(snapshot?.holdings,100)){
  const ticker=symbol(h.ticker);if(!ticker)continue;
  map.set(ticker,{ticker,name:clean(h.name,120)||ticker,held:true,watch:false,quantityAsOf:clean(h.position?.quantityAsOf,30)||null});
 }
 for(const w of rows(snapshot?.watchlist,200)){
  const ticker=symbol(w.ticker);if(!ticker)continue;
  const prev=map.get(ticker);
  map.set(ticker,{ticker,name:prev?.name||clean(w.name,120)||ticker,
    held:prev?.held||false,watch:true,quantityAsOf:prev?.quantityAsOf||null});
 }
 return [...map.values()];
}
function render(){
 const needle=$("decision-search").value.trim().toLowerCase();
 const scope=$("decision-scope").value,order=$("decision-order").value;
 const shown=records.filter(r=>
  (scope==="all"||scope==="holdings"&&r.held||scope==="watchlist"&&r.watch
   ||scope==="gaps"&&researchFor(r.ticker).posture==="NOT YET UNDERWRITTEN")
  &&(!needle||[r.ticker,r.name,researchFor(r.ticker).sector,researchFor(r.ticker).signal]
   .join(" ").toLowerCase().includes(needle)));
 shown.sort((a,b)=>{
  if(order==="symbol")return a.ticker.localeCompare(b.ticker);
  if(order==="sector")return researchFor(a.ticker).sector.localeCompare(researchFor(b.ticker).sector)||a.ticker.localeCompare(b.ticker);
  if(order==="source")return researchFor(b.ticker).asOf.localeCompare(researchFor(a.ticker).asOf)||a.ticker.localeCompare(b.ticker);
  return researchPriority(researchFor(a.ticker).posture)-researchPriority(researchFor(b.ticker).posture)
   ||Number(b.held)-Number(a.held)||a.ticker.localeCompare(b.ticker);
 });
 const tbody=$("decision-body");tbody.replaceChildren();
 if(!shown.length){
  const tr=document.createElement("tr"),td=text("td","No matched names in this dated private snapshot.");
  td.colSpan=4;tr.append(td);tbody.append(tr);
 }
 for(const row of shown){
  const r=researchFor(row.ticker),tr=document.createElement("tr");
  const label=text("th",row.ticker);label.scope="row";
  label.append(text("small",row.name));
  label.append(text("small",row.held?"Recorded holding · archived":"Watchlist · archived","pending"));
  const posture=document.createElement("td");
  posture.append(text("strong",r.posture));
  posture.append(text("small",r.sector));
  const why=document.createElement("td");
  why.append(text("p",r.signal));
  why.append(text("small","Source dated "+r.asOf));
  if(r.source)why.append(link(r.source,"Original receipt ↗"));
  const next=document.createElement("td");
  next.append(text("strong","Next check"));
  next.append(text("p",r.next));
  next.append(text("strong","Review/kill condition"));
  next.append(text("p",r.kill));
  tr.append(label,posture,why,next);tbody.append(tr);
 }
 const numHeld=records.filter(x=>x.held).length;
 const numWatch=records.filter(x=>x.watch).length;
 const covered=records.filter(x=>researchFor(x.ticker).posture!=="NOT YET UNDERWRITTEN").length;
 $("decision-stats").replaceChildren(
  text("span",numHeld+" archived holding names"),
  text("span",numWatch+" archived watchlist names"),
  text("span",covered+"/"+records.length+" source-linked issuer cases"),
  text("span",shown.length+" displayed"),
  text("span","Research base "+RESEARCH_AS_OF+" · per-issuer source dates vary")
 );
}
async function refresh(){
 const u=await supabase.auth.getUser();
 if(u.error||!u.data?.user?.id){records=[];showOwner(false);setStatus("Locked · sign in with the owner account");return;}
 const {data,error}=await supabase.from("power_stack_owner_snapshots")
  .select("snapshot_as_of,legacy_source_retired,snapshot").eq("owner_user_id",u.data.user.id)
  .order("snapshot_as_of",{ascending:false}).limit(1).maybeSingle();
 if(error||!data?.legacy_source_retired){
  records=[];showOwner(false);setStatus("No eligible owner-private snapshot for this account");
  return;
 }
 snapshotDate=data.snapshot_as_of;
 records=projection(data.snapshot);
 if(!records.length){showOwner(true);setStatus("Owner verified · snapshot has no recorded securities");}
 else{showOwner(true);setStatus("Owner verified · private RLS records loaded");}
 $("decisions-provenance").textContent=
  "Owner snapshot as of "+snapshotDate+"; holding quantities may refer to older dates. "+
  "This is NOT a broker-confirmed current position list. Research base "+RESEARCH_AS_OF+
  "; each issuer has its own original source date. No verified cost basis, cash or transaction advice is inferred.";
 render();
}
async function signIn(){
 if(!supabase)return;
 $("decisions-login").disabled=true;
 try{
  const res=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:root}});
  if(res.error)throw res.error;
 }catch(e){setStatus("Google sign-in failed: "+String(e.message).slice(0,160))}
 finally{$("decisions-login").disabled=false}
}
async function signOut(){
 try{await supabase?.auth.signOut()}finally{
  records=[];snapshotDate=null;showOwner(false);
  $("decision-body").replaceChildren();
  $("decision-stats").replaceChildren();
  setStatus("Signed out · owner decision records cleared");
 }
}
function fallback(e){showOwner(false);setStatus("Owner authentication unavailable: "+String(e?.message||e).slice(0,180));}
$("decisions-login").addEventListener("click",signIn);
$("decisions-logout").addEventListener("click",signOut);
for(const id of ["decision-search","decision-scope","decision-order"]){
 $(id).addEventListener(id==="decision-search"?"input":"change",render);
}
showOwner(false);
if(location.protocol!=="https:"||location.hostname!=="clydigital.github.io"||
 location.pathname!=="/power-stack/decisions.html"){
 $("decisions-login").disabled=true;setStatus("Owner sign-in disabled outside canonical GitHub Pages"); 
}else{
 try{
  if(!SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_"))throw Error("Invalid public client configuration");
  const sdk=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm");
  supabase=sdk.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
   auth:{detectSessionInUrl:true,flowType:"pkce",persistSession:true,autoRefreshToken:true},
   global:{headers:{"X-Client-Info":"power-stack-private-decisions/1"}}
  });
  await refresh();
 }catch(e){fallback(e)}
}
