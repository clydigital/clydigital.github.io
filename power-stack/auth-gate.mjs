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
 const {data,error}=await db.from("power_stack_private_pages").select("body_html")
  .eq("page_key",PAGE).limit(1).maybeSingle();
 if(error||!data?.body_html){deny("Private research could not be retrieved. No public fallback is available.");return;}
 const content=secureMain(data.body_html);
 $("private-main").replaceWith(content);
 $("site-header").hidden=false;$("gate-panel").hidden=true;
 authorised=true;
 $("owner-indicator").textContent="Owner · "+user.email;
 if(PAGE==="portfolio"){
  const slot=document.createElement("section");
  slot.id="owner-sortable-portfolio";slot.className="card ps-owner-table";
  slot.setAttribute("aria-label","Holdings and watchlist");
  slot.textContent="Loading historical portfolio table…";
  content.querySelector("#login-panel")?.before(slot);
  try{
   const {initPortfolioTable}=await import("./owner-portfolio-table.mjs?v=20261104-ps8");
   await initPortfolioTable(db,slot);
   await import("./owner-portfolio.js");
  }catch(e){slot.textContent="Private portfolio interface unavailable; no account data displayed.";console.error("Portfolio UI unavailable",e);}
 }
 if(PAGE==="decisions"){
  try{await import("./owner-decisions.mjs?v=20261104-ps8");}
  catch(e){console.error("Private decisions unavailable",e);}
 }
 const planned=sessionStorage.getItem("power-stack-target");
 if(planned){
  sessionStorage.removeItem("power-stack-target");
  const safe=["index","research","sectors","decisions","portfolio"].includes(planned)?planned:"index";
  if(safe!==PAGE){location.replace(safe+".html");return;}
 }
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
