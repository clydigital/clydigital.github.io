import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from "./owner-portfolio-config.mjs";

// Identity is checked by Google Auth plus Supabase owner-only row-level policies.
const OAUTH_CALLBACK="https://clydigital.github.io/power-stack/portfolio.html";
const PAGE=document.documentElement.dataset.privatePage||"index";
const $=id=>document.getElementById(id);
let db=null, authorised=false;
function status(message){$("gate-status").textContent=message;}
function deny(message){
 authorised=false;$("site-header").hidden=true;$("private-main").replaceChildren();$("private-main").hidden=true;
 $("gate-panel").hidden=false;$("login-button").hidden=false;$("logout-button").hidden=true;
 status(message);
}
function secureMain(html){
 const doc=new DOMParser().parseFromString(html,"text/html");
 const main=doc.querySelector("main");
 if(!main)throw Error("Invalid private page payload");
 for(const bad of main.querySelectorAll("script,iframe,object,embed,base,meta,link"))bad.remove();
 for(const node of main.querySelectorAll("*")){
  for(const attr of [...node.attributes]){
   if(/^on/i.test(attr.name)||attr.name==="srcdoc"||
     (["href","src","action","formaction"].includes(attr.name)&&/^(?:\s*javascript:|\s*data:text\/html)/i.test(attr.value)))node.removeAttribute(attr.name);
  }
 }
 return main;
}
async function authenticate(){
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user)return null;
 if(user.app_metadata?.provider!=="google"){
  await db.auth.signOut();return null;
 }
 const {data, error:ownerError}=await db.from("power_stack_owner_snapshots")
  .select("owner_user_id,legacy_source_retired,snapshot_as_of").eq("owner_user_id",user.id).limit(1).maybeSingle();
 if(ownerError||!data?.legacy_source_retired)return null;
 return user;
}
async function load(){
 status("Checking owner access…");
 const user=await authenticate();
 if(!user){deny("Google sign-in required. Only the registered owner may enter.");return;}
 let content;
 if(PAGE==="ideas"){
  // The shell is empty until owner authentication; ideas are fetched with RLS.
  content=document.createElement("main");
  content.id="owner-ideas-content";
 }else{
  const {data,error}=await db.from("power_stack_private_pages").select("body_html")
   .eq("page_key",PAGE).limit(1).maybeSingle();
  if(error||!data?.body_html){deny("Private research could not be retrieved. No public fallback is available.");return;}
  content=secureMain(data.body_html);
 }
 // Keep the authenticated view invisible until its final layout is ready.
 content.hidden=true;
 $("private-main").replaceWith(content);
 authorised=true;
 $("owner-indicator").textContent="Owner · "+user.email;
 const nav=$("site-header").querySelector("nav");
 if(PAGE!=="ideas"&&nav&&!nav.querySelector('a[href="ideas.html"]')){
  const link=document.createElement("a");link.href="ideas.html";link.textContent="Ideas tracker";
  nav.querySelector('a[href="portfolio.html"]')?.before(link);
 }
 if(["research","sectors","decisions"].includes(PAGE)){
  const notice=document.createElement("aside");
  notice.className="ps-legacy-note";
  notice.setAttribute("role","note");
  const message=document.createElement("span");
  message.textContent="Source-dated research library, not a current trade signal. Re-check original evidence, valuation and portfolio fit before deciding. ";
  const link=document.createElement("a");
  link.href="index.html";
  link.textContent="Open the War Room";
  notice.append(message,link);
  content.prepend(notice);
 }
 if(PAGE==="index"){
  try{
   const {initDecisionDesk}=await import("./owner-decision-desk.mjs?v=20261114-rooms1");
   await initDecisionDesk(db,content,user);
  }catch(error){
   const notice=document.createElement("p");
   notice.setAttribute("role","status");
   notice.textContent="Decision memory unavailable. Original private research remains accessible.";
   notice.className="psd-status";
   content.prepend(notice);
   console.error("Decision desk enhancement unavailable",error);
  }
 }
 if(PAGE==="portfolio"){
  const slot=document.createElement("section");
  slot.id="owner-sortable-portfolio";slot.className="card ps-owner-table";
  slot.setAttribute("aria-label","Holdings and watchlist");
  slot.textContent="Loading historical portfolio table…";
  content.querySelector("#login-panel")?.before(slot);
  try{
   const {initPortfolioTable}=await import("./owner-portfolio-table.mjs?v=20261110-coverage1");
   await initPortfolioTable(db,slot);
   await import("./owner-portfolio.js");
  }catch(e){slot.textContent="Private portfolio interface unavailable; no account data displayed.";console.error("Portfolio UI unavailable",e);}
 }
 if(PAGE==="decisions"){
  try{await import("./owner-decisions.mjs?v=20261106-riskoff1");}
  catch(e){console.error("Private decisions unavailable",e);}
 }
 if(PAGE==="ideas"){
  try{
   const {initIdeasTracker}=await import("./owner-ideas-tracker.mjs?v=20261114-rooms1");
   await initIdeasTracker(db,content,user);
  }catch(error){
   content.replaceChildren();
   const alert=document.createElement("p");
   alert.setAttribute("role","status");
   alert.textContent="Private Ideas Tracker unavailable. No purchase signal can be evaluated.";
   content.append(alert);console.error("Ideas Tracker unavailable",error);
  }
 }
 // Both presentation stylesheets are loaded by the HTML <head> before first paint.
 // Apply the complete layout while the authenticated view is still hidden.
 try{
  const {presentClientView}=await import("./owner-advisor-presentation.mjs?v=20261114-rooms1");
  presentClientView(PAGE,content);
 }catch(error){console.error("Advisor presentation unavailable",error);}
 if(PAGE==="research"){
  // Augment only a successfully authenticated and RLS-retrieved private research page.
  try{
   const {mountResearchTheses}=await import("./owner-research-theses.mjs?v=20261113-research1");
   mountResearchTheses(content);
  }catch(error){
   const fallback=document.createElement("p");
   fallback.className="ps-legacy-note";fallback.setAttribute("role","status");
   fallback.textContent="The updated investment reasoning is unavailable. The original private research archive remains accessible.";
   content.prepend(fallback);console.error("Research reasoning unavailable",error);
  }
 }
 // Apply a consistent findings-first decision room on authenticated specialist pages.
 // No static HTML includes private positions and no room alters owner decisions.
 if(["portfolio","ideas","research","sectors","decisions"].includes(PAGE)){
  try{
   // The public GitHub Pages asset contains presentation logic only. All specific
   // holding and prospect instructions are read from a separately RLS-protected
   // owner-only payload AFTER Google account authorization.
   const {data:roomPage,error:roomError}=await db.from("power_stack_private_pages")
    .select("body_html").eq("page_key","index").eq("owner_user_id",user.id).limit(1).maybeSingle();
   if(roomError||!roomPage?.body_html)throw Error("Owner room data unavailable");
   const privateSource=secureMain(roomPage.body_html);
   const raw=privateSource.querySelector("#ps-owner-command-rooms-data")?.textContent;
   if(!raw)throw Error("Owner room instructions missing");
   const privateRooms=JSON.parse(raw);
   const {mountCommandRoom}=await import("./owner-command-rooms.mjs?v=20261114-opportunity1");
   mountCommandRoom(PAGE,content,privateRooms);
  }catch(error){console.error("Specialist decision room unavailable; original private tools remain.",error);}
 }
 const planned=sessionStorage.getItem("power-stack-target");
 if(planned){
  sessionStorage.removeItem("power-stack-target");
  const safe=["index","research","sectors","decisions","portfolio","archive","ideas"].includes(planned)?planned:"index";
  if(safe!==PAGE){location.replace(safe+".html");return;}
 }
 // Reveal everything together; no intermediate old-theme page is shown.
 document.body.classList.add("ps-fin-pulse");
 content.hidden=false;
 $("site-header").hidden=false;
 $("gate-panel").hidden=true;
}
async function init(){
 $("login-button").addEventListener("click",async()=>{
  $("login-button").disabled=true;status("Opening Google sign-in…");
  try{
   sessionStorage.setItem("power-stack-target",PAGE);
   const {error}=await db.auth.signInWithOAuth({provider:"google",options:{redirectTo:OAUTH_CALLBACK}});
   if(error)throw error;
  }catch(e){status("Google sign-in failed. Please retry.");}
  finally{$("login-button").disabled=false;}
 });
 $("logout-button").addEventListener("click",async()=>{
  try{await db?.auth.signOut()}finally{sessionStorage.removeItem("power-stack-target");location.replace("index.html");}
 });
 try{
  if(location.protocol!=="https:"||location.hostname!=="clydigital.github.io"||
    !location.pathname.startsWith("/power-stack/"))throw Error("Unapproved host");
  if(!SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_"))throw Error("Missing browser key");
  const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm");
  db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
   auth:{flowType:"pkce",detectSessionInUrl:true,persistSession:true,autoRefreshToken:true},
   global:{headers:{"X-Client-Info":"power-stack-login-first/1"}}
  });
  await load();
 }catch(e){deny("Authentication unavailable. The private site is locked.");}
}
await init();
