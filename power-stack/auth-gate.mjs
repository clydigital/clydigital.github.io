import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from "./owner-portfolio-config.mjs";

// Identity is checked by Google Auth plus Supabase owner-only row-level policies.
const OAUTH_CALLBACK="https://clydigital.github.io/power-stack/portfolio.html";
const PAGE=document.documentElement.dataset.privatePage||"index";
const $=id=>document.getElementById(id);
let db=null, authorised=false, privateContent=null, ownerId=null, authEpoch=0;
const began=performance.now();
const mark=name=>document.documentElement.dataset[name]=String(Math.round(performance.now()-began));
function status(message){$("gate-status").textContent=message;}
function deny(message){
 authorised=false;ownerId=null;$("site-header").hidden=true;
 if(privateContent){privateContent.replaceChildren();privateContent.hidden=true;}
 $("private-main")?.replaceChildren();
 document.body.classList.remove("ps-fin-pulse","psr-landing-active");
 document.body.classList.add("ps-auth-pending");
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
// One verified Auth identity and one owner-only page lookup. The existing
// private-pages RLS policy checks the exact Google owner AND retired snapshot.
// No cached session, public fallback, or client-only identity can unlock a page.
const specialistPages=["portfolio","ideas","research","sectors","decisions"];
async function authenticateAndRead(){
 // The local session is only a request hint. It never authorizes content.
 const {data:{session}={},error:sessionError}=await db.auth.getSession();
 if(sessionError||!session?.access_token||!session.user?.id)return null;
 const keys=[...new Set([PAGE==="ideas"?"index":PAGE,...(specialistPages.includes(PAGE)?["index"]:[])])];
 const epoch=authEpoch;
 // Verify the token with Auth and perform the owner-only RLS read concurrently.
 // Both must succeed and the verified user must match the query owner.
 const [identity,response]=await Promise.all([
  db.auth.getUser(session.access_token),
  db.from("power_stack_private_pages").select("page_key,body_html").eq("owner_user_id",session.user.id).in("page_key",keys)
 ]);
 mark("psAuthReadMs");
 const user=identity.data?.user;
 if(epoch!==authEpoch||identity.error||!user||user.id!==session.user.id)return null;
 if(user.app_metadata?.provider!=="google"){await db.auth.signOut();return null;}
 return {user,pages:response.data,error:response.error};
}
function privateStyles(){
 // Start loading private theme CSS only as a non-blocking resource at first paint.
 // Before showing private content, activate it all, keeping the gate visible.
 return Promise.all([...document.querySelectorAll("link[data-private-style]")].map(link=>{
  // External fonts may swap in when ready; never hold the desk for them.
  const ready=link.sheet||link.href.startsWith("https://fonts.googleapis.com/")?Promise.resolve():new Promise(resolve=>{
   const finish=()=>{clearTimeout(timer);resolve();};
   const timer=setTimeout(finish,1800);
   link.addEventListener("load",finish,{once:true});
   link.addEventListener("error",finish,{once:true});
  });
  link.media="all";return ready;
 }));
}
// These modules contain presentation code only. Download in parallel with
// auth/RLS; constructors are called only after authorization succeeds.
const modules={
 advisor:()=>import("./owner-advisor-presentation.mjs?v=20261126-recapcards1"),
 supplement:()=>import("./owner-nov17-research.mjs?v=20261119-action2"),
 command:()=>import("./owner-command-rooms.mjs?v=20261119-dossier1"),
 index:()=>import("./owner-decision-desk.mjs?v=20261126-contrast1"),
 table:()=>import("./owner-portfolio-table.mjs?v=20261127-industry1"),
 ledger:()=>import("./owner-portfolio.js?v=20261120-one-gate1"),
 decisions:()=>import("./owner-decisions.mjs?v=20261120-stable-gate2"),
 ideas:()=>import("./owner-ideas-tracker.mjs?v=20261126-bbfirst"),
 research:()=>import("./owner-research-theses.mjs?v=20261114-ps1")
};
const warmed=new Map();
function prewarm(){
 const keys=["advisor","supplement",...(specialistPages.includes(PAGE)?["command"]:[]),...(
 PAGE==="portfolio"?["table","ledger"]:Object.hasOwn(modules,PAGE)?[PAGE]:[])];
 for(const key of keys)if(!warmed.has(key))warmed.set(key,modules[key]().then(value=>({value}),error=>({error})));
}
async function readyModule(key){
 const result=await(warmed.get(key)||modules[key]().then(value=>({value}),error=>({error})));
 if(result.error)throw result.error;return result.value;
}
async function load(styleReady){
 const access=await authenticateAndRead();
 if(!access){deny("Google sign-in required. Only the registered owner may enter.");return;}
 const {user,pages,error}=access;
 const page=pages?.find(row=>row.page_key===(PAGE==="ideas"?"index":PAGE));
 if(error||!page?.body_html){deny("Owner access could not be verified. Sign in with the registered Google account.");return;}
 const roomsPage=pages.find(row=>row.page_key==="index");
 // One authenticated manual edition read for both existing tools and new intelligence views.
 const editionPromise=PAGE==="dossiers"?Promise.resolve(null):Promise.resolve(db.from("power_stack_intelligence_editions").select("edition_as_of,payload").eq("owner_user_id",user.id).order("edition_as_of",{ascending:false}).limit(1).maybeSingle()).then(({data,error})=>error?null:data?.payload??null,()=>null);
 let content;
 if(PAGE==="ideas"){content=document.createElement("main");content.id="owner-ideas-content";}
 else{content=secureMain(page.body_html);}
 // Keep the authenticated view invisible until its final layout is ready.
 content.hidden=true;
 $("private-main").replaceWith(content);
 privateContent=content;ownerId=user.id;authorised=true;
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
   const {initDecisionDesk}=await readyModule("index");
   await initDecisionDesk(db,content,user,{deferInitial:true,edition:await editionPromise});
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
  const oldLogin=content.querySelector("#login-panel");
  if(oldLogin){oldLogin.hidden=true;oldLogin.before(slot);}else content.prepend(slot);
  try{
   const [{initPortfolioTable},{initOwnerPortfolio}]=await Promise.all([
    readyModule("table"),readyModule("ledger")
   ]);
   // Both use the single verified client/identity. These are data reads, not login gates.
   initPortfolioTable(db,slot,user,{edition:await editionPromise}).catch(e=>{slot.textContent="Private portfolio table unavailable.";console.error(e);});
   initOwnerPortfolio(db,user).catch(e=>console.error("Private ledger unavailable",e));
  }catch(e){slot.textContent="Private portfolio interface unavailable; no account data displayed.";console.error("Portfolio UI unavailable",e);}
 }
 if(PAGE==="decisions"){
  // Hide the retired nested sign-in even if its data module cannot load.
  for(const id of ["decisions-login","decisions-logout"])if($(id))$(id).hidden=true;
  try{
   const {initOwnerDecisions}=await readyModule("decisions");
   initOwnerDecisions(db,user).catch(e=>console.error("Private decisions unavailable",e));
  }catch(e){console.error("Private decisions unavailable",e);}
 }
 if(PAGE==="ideas"){
  try{
   const {initIdeasTracker}=await readyModule("ideas");
   await initIdeasTracker(db,content,user,{deferInitial:true,edition:await editionPromise});
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
  const {presentClientView}=await readyModule("advisor");
  presentClientView(PAGE,content);
 }catch(error){console.error("Advisor presentation unavailable",error);}
 if(PAGE==="research"){
  // Augment only a successfully authenticated and RLS-retrieved private research page.
  try{
   const {mountResearchTheses}=await readyModule("research");
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
   if(!roomsPage?.body_html)throw Error("Owner room data unavailable");
   const privateSource=secureMain(roomsPage.body_html);
   const raw=privateSource.querySelector("#ps-owner-command-rooms-data")?.textContent;
   if(!raw)throw Error("Owner room instructions missing");
   const privateRooms=JSON.parse(raw);
   const {mountCommandRoom}=await readyModule("command");
   mountCommandRoom(PAGE,content,privateRooms);
  }catch(error){console.error("Specialist decision room unavailable; original private tools remain.",error);}
 }
 try{const {mountNov17Research}=await readyModule("supplement");mountNov17Research(PAGE,content);}catch(error){console.error("Dated market supplement unavailable",error);}
 // Enhance only the owner-authenticated briefing; never replace its dialogue or evidence.
 if(PAGE==="index"){
  try{const {mountMattCarousel}=await import("./owner-matt-carousel.mjs?v=20261120-contrast2");mountMattCarousel(content);}
  catch(error){console.error("Matt carousel unavailable; full original briefing remains visible.",error);}
 }
 // Authorised public-market research; quote freshness is checked via owner RLS.
 try {
  const {mountNov23DecisionEdition}=await import("./owner-nov23-decision-edition.mjs?v=20261123-v1");
  await mountNov23DecisionEdition(PAGE,content,db,user);
  if(PAGE==="index"){const room=content.querySelector("#ps-war-archive"),edition=content.querySelector("#ps-nov23-edition");if(room&&edition)room.append(edition);}
 } catch(error) {
  console.error("Nov 23 private decision overlay unavailable",error);
 }
 if(PAGE==="index"){const room=content.querySelector("#ps-war-archive"),supplement=content.querySelector("#nov17-research");if(room&&supplement)room.append(supplement);}
 try{const {finalizeRecap}=await readyModule("advisor");finalizeRecap(PAGE,content);}catch(error){console.error("Recap layout unavailable",error);}
 // Read the latest immutable manual edition only after verified owner access.
 // Dossiers are not an input or a dependency; no public or cached fallback.
 if(PAGE!=="dossiers"){
  try{
   const edition=await editionPromise;
   const {mountInvestmentIntelligence}=await import("./owner-investment-intelligence.mjs?v=20261127-industry1");
   if(authorised&&ownerId===user.id)mountInvestmentIntelligence(PAGE,content,edition);
  }catch(error){console.error("Investment intelligence edition unavailable",error);}
 }
 await styleReady;
 if(!authorised)return;
 // Remove the overlay BEFORE enabling the desk theme in the same JS task.
 $("gate-panel").hidden=true;
 // Reveal everything together; no intermediate old-theme page is shown.
 document.body.classList.remove("ps-auth-pending");
 document.body.classList.add("ps-fin-pulse");
 content.hidden=false;
 $("site-header").hidden=false;
 mark("psReadyMs");
}
async function init(){
 $("login-button").addEventListener("click",async()=>{
  $("login-button").disabled=true;status("Opening Google sign-in…");
  try{
   sessionStorage.setItem("power-stack-target",PAGE+location.hash);
   const {error}=await db.auth.signInWithOAuth({provider:"google",options:{redirectTo:OAUTH_CALLBACK}});
   if(error)throw error;
  }catch(e){status("Google sign-in failed. Please retry.");}
  finally{$("login-button").disabled=false;}
 });
 $("logout-button").addEventListener("click",async()=>{
  deny("Signing out…");$("login-button").hidden=true;
  try{await db?.auth.signOut()}finally{sessionStorage.removeItem("power-stack-target");location.replace("index.html");}
 });
 try{
  if(location.protocol!=="https:"||location.hostname!=="clydigital.github.io"||
    !location.pathname.startsWith("/power-stack/"))throw Error("Unapproved host");
  if(!SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_"))throw Error("Missing browser key");
  // Start static assets and the SDK together, independent of the owner request.
  const styleReady=privateStyles();
  prewarm();
  const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm");
  db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
   auth:{flowType:"pkce",detectSessionInUrl:true,persistSession:true,autoRefreshToken:true},
   global:{headers:{"X-Client-Info":"power-stack-login-first/1"}}
  });
  // Let the SDK finish PKCE on the approved callback, then route BEFORE
  // auditing/assembling the wrong page. getSession is routing only, never authorization.
  const planned=sessionStorage.getItem("power-stack-target");
  if(PAGE==="portfolio"&&planned){
   sessionStorage.removeItem("power-stack-target");
   const match=/^(index|research|sectors|decisions|portfolio|archive|ideas|dossiers)(#[a-zA-Z0-9_-]+)?$/.exec(planned);
   if(match&&(match[1]!==PAGE||match[2])){
    const {data:{session}={}}=await db.auth.getSession();
    if(session){location.replace(match[1]+".html"+(match[2]||""));return;}
   }
  }
  db.auth.onAuthStateChange((event,session)=>{
   if(event==="SIGNED_OUT")authEpoch++;
   if(authorised&&(event==="SIGNED_OUT"||(session?.user?.id&&session.user.id!==ownerId))){
    deny("Google sign-in required. Only the registered owner may enter.");
    location.replace("index.html");
   }
  });
  await load(styleReady);
 }catch(e){deny("Authentication unavailable. The private site is locked.");}
}
await init();
