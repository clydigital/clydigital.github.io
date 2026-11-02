import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from "./owner-portfolio-config.mjs";
import {normalizeEntry,ledgerSummary,parsePrivateResearch}
  from "./owner-portfolio-model.mjs";

/**
 * Static browser runtime. Auth/data access goes directly to Supabase under RLS.
 * No Vercel, Bluebelly API, proxy, SSR, broker API or investing-side mutation.
 */
const canonical="https://clydigital.github.io/power-stack/portfolio.html";
const $=id=>document.getElementById(id);
const msg=(id,text)=>{const node=$(id);if(node)node.textContent=text;};
const small=(txt)=>{const node=document.createElement("small");node.textContent=txt;return node;};
const txt=(tag,value,cls)=>{
 const node=document.createElement(tag);
 node.textContent=String(value??"");
 if(cls)node.className=cls;
 return node;
};
const fmt=(value,max=4)=>Number(value).toLocaleString("en-MY",{maximumFractionDigits:max});
let client=null,authed=false,entries=[],research=null;

function setAuthState(ok,status){
 authed=ok;
 $("owner-content").hidden=!ok;
 // The site-wide Google gate has identically named controls. Keep its
 // navigation sign-out independent of this nested private ledger.
 const panel=$("login-panel");
 if(panel)panel.hidden=ok;
 const localLogin=panel?.querySelector("#login-button");
 const localLogout=panel?.querySelector("#logout-button");
 if(localLogin)localLogin.hidden=ok;
 if(localLogout)localLogout.hidden=!ok;
 msg("private-status",status);
}
function clearLocal(){
 entries=[];research=null;setAuthState(false,"Locked");
 msg("ledger-count","No records loaded");
 msg("snapshot-status","Sign in to view the private historical snapshot date.");
 msg("research-message","No reviewed research ticket loaded.");
 msg("research-ticker","");
 $("research-file").value="";
 renderSummary();renderHistory();renderResearch();
}
function clearChildren(node){node.replaceChildren();}
function renderSummary(){
 const summary=ledgerSummary(entries);
 const positions=$("position-list"),cash=$("cash-list");
 clearChildren(positions);clearChildren(cash);
 if(!summary.holdings.length)positions.append(txt("p","No position entries. Not evidence of zero broker holdings.","muted"));
 for(const x of summary.holdings){
  const row=txt("div","","row-entry"),lhs=document.createElement("div");
  lhs.append(txt("strong",x.symbol),small(x.status==="MANUAL_BASELINE_UNVERIFIED"?
    "Manual opening position; not broker-confirmed":"No opening record; quantity is movements only"));
  row.append(lhs,txt("span",fmt(x.units,8)+" units · "+x.currency));
  positions.append(row);
 }
 if(!summary.cashByCurrency.length)cash.append(txt("p","No cash entries. Available cash remains unknown.","muted"));
 for(const x of summary.cashByCurrency){
  const row=txt("div","","row-entry"),lhs=document.createElement("div");
  lhs.append(txt("strong",x.currency),small(x.status==="MANUAL_BASELINE_UNVERIFIED"?
    "Manual opening balance; not confirmed buying power":"No opening cash balance recorded"));
  row.append(lhs,txt("span",x.provisionalBalance===null?
    "Δ "+fmt(x.change)+" movements":"Manual Δ "+fmt(x.change)));
  cash.append(row);
 }
 const warn=$("ledger-warnings");
 const warnings=[...summary.issues];
 if(entries.length>=500)warnings.push("500-row display limit reached; older entries may be omitted, so aggregates are incomplete");
 warn.hidden=warnings.length===0;
 warn.textContent=warnings.join(" · ");
 msg("ledger-count",entries.length+" manual records · No broker confirmation");
}
function renderHistory(){
 const tbody=$("entry-table");clearChildren(tbody);
 if(!entries.length){
  const tr=document.createElement("tr"),td=document.createElement("td");
  td.colSpan=7;td.textContent="No ledger entries yet. Historical holdings are not automatically imported.";
  tr.append(td);tbody.append(tr);return;
 }
 for(const e of entries){
  const tr=document.createElement("tr");
  const cells=[e.occurred_on,e.entry_type,e.symbol||"—",e.currency,
    fmt(e.quantity_delta,8),fmt(e.cash_delta),"Self-reported"];
  for(const value of cells)tr.append(txt("td",value));
  tbody.append(tr);
 }
}
function renderResearch(){
 const host=$("horizons");clearChildren(host);
 const data=research?.horizons||[
  {label:"Q1 2027",score:null,reviewStatus:"NOT_SCORED",gapCount:null},
  {label:"End-2027",score:null,reviewStatus:"NOT_SCORED",gapCount:null},
  {label:"2–5+ years",score:null,reviewStatus:"NOT_SCORED",gapCount:null}
 ];
 for(const h of data){
  const item=document.createElement("article");
  item.append(txt("h3",h.label),txt("strong",h.score===null?"NOT SCORED":fmt(h.score,1)+"/100"));
  item.append(txt("p",h.reviewStatus==="RESEARCH_READY_NOT_TRADE"?
    "Analyst research score only — not an order or portfolio recommendation":
    "Source or account evidence remains incomplete"));
  if(h.gapCount!==null)item.append(small(h.gapCount+" source / underwriting gaps"));
  if(h.confirmation)item.append(txt("p","Confirm: "+h.confirmation));
  if(h.invalidation)item.append(txt("p","Invalidate: "+h.invalidation));
  host.append(item);
 }
}
function todayLocal(){
 const date=new Date();
 return [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),
   String(date.getDate()).padStart(2,"0")].join("-");
}
async function refresh(){
 if(!authed)return;
 msg("ledger-count","Loading private ledger…");
 const [snap,ledger]=await Promise.all([
  client.from("power_stack_owner_snapshots")
    .select("snapshot_as_of,imported_at")
    .order("snapshot_as_of",{ascending:false}).limit(1),
  client.from("power_stack_portfolio_entries")
    .select("entry_id,occurred_on,entry_type,symbol,currency,quantity_delta,cash_delta,unit_price,note,source_kind,created_at")
    .order("occurred_on",{ascending:false})
    .order("created_at",{ascending:false}).limit(500)
 ]);
 if(snap.error)throw new Error("Historical owner snapshot access failed: "+snap.error.message);
 if(!snap.data?.length){
  clearLocal();msg("auth-message","Authenticated, but the account is not registered as the Power Stack owner. No private holdings are accessible.");
  await client.auth.signOut();return;
 }
 msg("snapshot-status","Existing private research snapshot: "+
   snap.data[0].snapshot_as_of+
   " · Historical research only; not current brokerage confirmation.");
 if(ledger.error)throw new Error("Private ledger access failed: "+ledger.error.message);
 entries=Array.isArray(ledger.data)?ledger.data:[];
 renderSummary();renderHistory();
}
async function verifyUser(){
 const response=await client.auth.getUser();
 if(response.error||!response.data?.user){clearLocal();return false;}
 setAuthState(true,"Owner session · RLS enforced");
 msg("auth-message","Authenticated Google account. Access to account records is checked by database owner policies.");
 await refresh();return authed;
}
async function signIn(){
 msg("auth-message","Starting Google sign-in…");
 $("login-button").disabled=true;
 try{
  // Exact callback must be in Supabase Auth's allowed redirects before launch.
  const response=await client.auth.signInWithOAuth({
   provider:"google",options:{redirectTo:canonical}
  });
  if(response.error)throw response.error;
 }catch(e){msg("auth-message","Google sign-in unavailable: "+String(e.message).slice(0,150))}
 finally{$("login-button").disabled=false}
}
async function signOut(){
 try{if(client)await client.auth.signOut()}finally{
  clearLocal();msg("auth-message","Signed out. Account details are no longer shown.");
 }
}
async function addEntry(ev){
 ev.preventDefault();if(!authed||!client)return;
 const button=$("add-entry");button.disabled=true;
 try{
  if(!$("manual-ack").checked)throw Error("Confirm this is self-reported.");
  const form=Object.fromEntries(new FormData($("entry-form")));
  const payload=normalizeEntry(form);
  if(payload.occurred_on>todayLocal())throw Error("Future transaction dates are not accepted.");
  const {error}=await client.from("power_stack_portfolio_entries").insert(payload);
  if(error)throw Error("Entry not saved: "+error.message);
  msg("entry-message","Entry appended; refreshing owner-only ledger.");
  $("entry-form").reset();
  $("entry-date").value=todayLocal();
  await refresh();
 }catch(e){msg("entry-message",String(e.message).slice(0,220))}
 finally{button.disabled=false}
}
async function previewPrivateFile(){
 research=null;renderResearch();msg("research-ticker","");
 const file=$("research-file").files?.[0];
 if(!file){msg("research-message","No reviewed research ticket loaded.");return}
 if(file.size>500000){msg("research-message","File too large. Maximum private preview: 500 KB.");return}
 try{
  const report=JSON.parse(await file.text());
  research=parsePrivateResearch(report);
  msg("research-ticker",research.ticker+" · "+(research.createdAt||"undated")+" · Private preview");
  msg("research-message","Viewed in browser memory only. No file was uploaded or saved; scores remain historical research, not portfolio actions.");
  renderResearch();
 }catch(e){research=null;renderResearch();msg("research-message","Research preview rejected: "+String(e.message).slice(0,150))}
}
async function initialize(){
 $("entry-date").value=todayLocal();
 $("login-panel")?.querySelector("#login-button")?.addEventListener("click",signIn);
 $("login-panel")?.querySelector("#logout-button")?.addEventListener("click",signOut);
 $("entry-form").addEventListener("submit",addEntry);
 $("research-file").addEventListener("change",previewPrivateFile);
 $("clear-research").addEventListener("click",()=>{
   research=null;$("research-file").value="";msg("research-message","Preview cleared; no data saved.");msg("research-ticker","");renderResearch();
 });
 clearLocal();
 if(location.protocol!=="https:"||location.hostname!=="clydigital.github.io"||
   location.pathname!=="/power-stack/portfolio.html"){
  msg("auth-message","Owner sign-in is disabled on previews. The approved GitHub Pages callback must be configured and the original site restored first.");
  $("login-button").disabled=true;return;
 }
 try{
  if(!SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_"))throw Error("Public client config invalid");
  // The SDK version is pinned; it does not route through Vercel.
  const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm");
  client=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
    auth:{detectSessionInUrl:true,flowType:"pkce",persistSession:true,autoRefreshToken:true},
    global:{headers:{"X-Client-Info":"power-stack-private-static/1"}}
  });
  await verifyUser();
  if(!authed)msg("auth-message","Sign in with the Google account already linked to the private Power Stack owner snapshot.");
 }catch(e){
  clearLocal();msg("auth-message","Authentication unavailable: "+String(e.message).slice(0,200));
  $("login-button").disabled=true;
 }
}
await initialize();
