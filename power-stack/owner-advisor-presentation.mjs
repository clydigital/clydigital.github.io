/* Client-presentation layer. Data, investment calls and owner-only permissions are unchanged. */
const SVG_NS="http://www.w3.org/2000/svg";
function navIcon(kind){
 const svg=document.createElementNS(SVG_NS,"svg");
 svg.setAttribute("width","18");svg.setAttribute("height","18");svg.setAttribute("viewBox","0 0 24 24");
 svg.setAttribute("fill","none");svg.setAttribute("stroke","currentColor");
 svg.setAttribute("stroke-width","1.75");svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");
 svg.setAttribute("aria-hidden","true");
 const shapes={
  index:["rect:3,3,8,8,1.5","rect:13,3,8,5,1.5","rect:13,10,8,11,1.5","rect:3,13,8,8,1.5"],
  ideas:["path:M12 2v4","path:M7.4 6.4a7 7 0 0 1 9.2 10.7c-1 .8-1.6 1.9-1.6 3H9c0-1.1-.6-2.2-1.6-3A7 7 0 0 1 7.4 6.4Z","path:M9 22h6"],
  market:["path:M3 18l6-6 4 3 8-9","path:M16 6h5v5"],
  bonds:["path:M3 4h18","path:M3 10h18","path:M3 16h18","path:M3 21h18","path:M7 4v17"],
  portfolio:["rect:2.5,6,19,15,2","path:M2.5 10.5h19","path:M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2","path:M15 15h4"],
  research:["path:M4 19.5V4a2 2 0 0 1 2-2h13v20H6a2 2 0 0 1-2-2.5Z","path:M8 7h7","path:M8 11h7","path:M8 15h4"],
  sectors:["rect:3,3,7,7,1","rect:14,3,7,7,1","rect:3,14,7,7,1","rect:14,14,7,7,1"],
  decisions:["path:M9 12l2 2 4-4","path:M12 22c5.5-2.2 8-6 8-11V5l-8-3-8 3v6c0 5 2.5 8.8 8 11Z"],
  dossiers:["path:M5 3h14v18H5Z","path:M8 7h8","path:M8 11h8","path:M8 15h5"],
  archive:["rect:3,4,18,17,2","path:M3 9h18","path:M9 13h6"]
 };
 for(const raw of shapes[kind]||shapes.index){
  const [type,attrs]=raw.split(":");
  const node=document.createElementNS(SVG_NS,type);
  if(type==="rect"){
   const [x,y,width,height,rx]=attrs.split(",");
   for(const [attr,val] of Object.entries({x,y,width,height,rx}))node.setAttribute(attr,val);
  } else node.setAttribute("d",attrs);
  svg.append(node);
 }
 return svg;
}
export function presentClientView(page,main){
 // The shared auth gate applies the private theme atomically on reveal.
 if(!document.getElementById("gate-panel")||document.getElementById("gate-panel").hidden)document.body.classList.add("ps-fin-pulse");
 document.documentElement.dataset.psTheme="fin-pulse";
 const nav=document.querySelector("#site-header nav");
 if(nav){
  const owner=nav.querySelector("#owner-indicator");
  const signout=nav.querySelector("#logout-button");
  const links=[
   ["index.html#action-log","Today","index"],
   ["portfolio.html#holdings","Portfolio","portfolio"],
   ["ideas.html","Ideas","ideas"],
   ["index.html#war-room","War Room","warroom"],
   ["archive.html","Archive","archive"]
  ];
  const fragment=document.createDocumentFragment();
  const activeSlug=()=>page==="index"?(location.hash.startsWith("#war")?"warroom":location.hash==="#decision-history"||["#desk-tools","#advanced-research"].includes(location.hash)?"archive":"index"):["portfolio","ideas"].includes(page)?page:"archive";
  for(const [href,label,slug] of links){
   const a=document.createElement("a");a.href=href;a.textContent=label;a.dataset.slug=slug;
   if(activeSlug()===slug)a.setAttribute("aria-current","page");
   fragment.append(a);
  }
  const spacer=document.createElement("div");spacer.className="ps-sidebar-spacer";fragment.append(spacer);
  if(owner){owner.textContent="PRIVATE CLIENT VIEW";fragment.append(owner)}
  if(signout)fragment.append(signout);
  nav.replaceChildren(fragment);nav.classList.add("ps-advisor-nav");
  window.addEventListener("hashchange",()=>{for(const a of nav.querySelectorAll("a[data-slug]")){
    if(activeSlug()===a.dataset.slug)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");
  }});
 }
 const subtitle=document.querySelector("#site-header .brand small");
 if(subtitle)subtitle.textContent="Investment intelligence";
 const brand=document.querySelector("#site-header .brand");
 if(brand&&!brand.querySelector(".ps-pulse-mark")){
  const logo=document.createElement("span");logo.className="ps-pulse-mark";logo.textContent="P";logo.setAttribute("aria-hidden","true");
  const wordmark=document.createElement("span");wordmark.className="ps-pulse-wordmark";
  while(brand.firstChild)wordmark.append(brand.firstChild);
  brand.append(logo,wordmark);
 }
 if(page==="portfolio"){
  const hero=main.querySelector(".hero h1");
  const lead=main.querySelector(".hero p");
  if(hero)hero.textContent="Portfolio & market watch";
  if(lead)lead.textContent="Track price changes, review your watchlist and manage investment records.";
  const legacyStatus=main.querySelector(".topline");
  if(legacyStatus)legacyStatus.hidden=true;
  const backoffice=main.querySelector("#owner-content");
  if(backoffice&&backoffice.parentNode){
   const details=document.createElement("details");details.className="ps-advisor-records";
   const summary=document.createElement("summary");summary.textContent="Account records & transactions";
   const intro=document.createElement("p");intro.textContent="Transaction ledger, account reconciliation and supporting underwriting.";
   details.append(summary,intro);
   backoffice.before(details);details.append(backoffice);
  }
  const foot=main.querySelector("footer");
  if(foot)foot.textContent="Market prices are delayed. Portfolio balances and buying power require broker reconciliation.";
 }
 if(page==="research"||page==="sectors"||page==="decisions"){
  const note=main.querySelector(".ps-legacy-note");
  if(note){
   note.replaceChildren();
   const text=document.createElement("span");text.textContent="Research archive · dated original analysis. ";
   const link=document.createElement("a");link.href="index.html";link.textContent="Back to overview";
   note.append(text,link);
  }
 }
}
/** Owner-authenticated presentation only. Historical nodes are moved, never deleted. */
export function finalizeRecap(page,main){
 if(!main||page==="index")return;
 const make=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt)e.textContent=txt;return e;};
 const legacyPages=["research","sectors","decisions","dossiers","archive"];
 if(legacyPages.includes(page)){
  const intro=make("header","ps-recap-intro");
  intro.append(make("p","ps-recap-kicker","POWER STACK / ARCHIVE"),make("h1",null,({research:"Research evidence",sectors:"Sector research",decisions:"Decision records",dossiers:"Investment dossiers",archive:"Research archive"})[page]));
  if(page==="archive"){
   const links=make("nav","ps-recap-archive-links");links.setAttribute("aria-label","Archived research destinations");
   for(const [url,label] of [["index.html#decision-history","Decision history"],["index.html#desk-tools","Past War Room editions"],["dossiers.html","Investment dossiers"],["research.html","Research evidence"],["sectors.html","Sector analysis"],["decisions.html","Decision records"],["index.html#market-tools","Market tools"]]){
    const a=make("a",null,label);a.href=url;links.append(a);
   }
   intro.append(links);
  }else{const a=make("a",null,"Back to archive");a.href="archive.html";intro.append(a);}
  const drawer=make("details","ps-recap-archive-drawer");drawer.append(make("summary",null,page==="archive"?"Earlier market reports":"Open dated records and supporting research"));
  const original=[...main.childNodes];for(const n of original)drawer.append(n);
  main.append(intro,drawer);if(page!=="archive"||location.hash)drawer.open=true;
  window.addEventListener("hashchange",()=>{if(location.hash)drawer.open=true;});
  return;
 }
 const historical=[...main.querySelectorAll(".pscr-root,#nov17-research,#ps-nov23-edition")].filter(n=>!n.parentElement?.closest(".pscr-root,#nov17-research,#ps-nov23-edition"));
 if(historical.length){
  const archive=make("details","ps-recap-archive-drawer");archive.append(make("summary",null,"Earlier research (historical)"));
  for(const n of historical)archive.append(n);main.append(archive);
  const reveal=()=>{const id=location.hash.slice(1);if(id&&[...archive.querySelectorAll("[id]")].some(n=>n.id===id))archive.open=true;};reveal();window.addEventListener("hashchange",reveal);
 }
 if(page==="ideas"){
  const hero=main.querySelector(".psi-hero h1");if(hero)hero.textContent="Investment ideas";
  const tracked=main.querySelector("#psi-tracked-drawer"),extra=main.querySelector("#psi-opportunity-mount");
  if(tracked){tracked.open=true;if(extra){const drawer=make("details","ps-recap-archive-drawer");drawer.append(make("summary",null,"Additional screens and technical research"),extra);tracked.after(drawer);if(location.hash==="#trades")drawer.open=true;window.addEventListener("hashchange",()=>{if(location.hash==="#trades")drawer.open=true;});}}
 }
 if(page==="portfolio"){
  const intro=make("header","ps-recap-intro");intro.append(make("p","ps-recap-kicker","POWER STACK / PORTFOLIO"),make("h1",null,"Your portfolio"));
  const table=main.querySelector("#owner-sortable-portfolio"),account=main.querySelector(".ps-advisor-records");
  const earlier=make("details","ps-recap-archive-drawer");earlier.append(make("summary",null,"Earlier portfolio notes and research"));
  for(const n of [...main.children])if(n!==table&&n!==account&&!n.contains(table)&&!n.contains(account)&&!n.matches(".ps-recap-archive-drawer"))earlier.append(n);
  main.prepend(intro);if(table&&table.parentElement!==main)intro.after(table);
  if(earlier.childElementCount>1)main.append(earlier);
  const reveal=()=>{const id=location.hash.slice(1);if(id&&[...earlier.querySelectorAll("[id]")].some(n=>n.id===id))earlier.open=true;};reveal();window.addEventListener("hashchange",reveal);
 }
}
