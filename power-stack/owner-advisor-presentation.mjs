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
 document.body.classList.add("ps-fin-pulse");
 document.documentElement.dataset.psTheme="fin-pulse";
 const nav=document.querySelector("#site-header nav");
 if(nav){
  const owner=nav.querySelector("#owner-indicator");
  const signout=nav.querySelector("#logout-button");
  const links=[
   ["index.html","War Room","index"],
   ["index.html#warroom-team","Analyst desks","research"],
   ["index.html#desk-tools","Full market radar","sectors"],
   ["index.html#scenario-matrix","Scenarios","market"],
   ["portfolio.html#holdings","My holdings","portfolio"],
   ["portfolio.html#watchlist","Market watch","market"],
   ["portfolio.html#bonds","Bond ETFs","bonds"],
   ["ideas.html","Opportunities","ideas"],
   ["research.html","Research","research"]
  ];
  const fragment=document.createDocumentFragment();
  const label=document.createElement("p");label.textContent="YOUR WORKSPACE";label.className="ps-sidebar-label";fragment.append(label);
  for(const [href,label,slug] of links){
   const a=document.createElement("a");a.href=href;a.textContent=label;
   const portfolioTab=page==="portfolio"&&(
     slug==="market"&&location.hash==="#watchlist"||
     slug==="bonds"&&location.hash==="#bonds"||
     slug==="portfolio"&&!["#watchlist","#bonds"].includes(location.hash));
   if(page!=="portfolio"&&slug===page||portfolioTab)
     a.setAttribute("aria-current","page");
   a.dataset.slug=slug;
   a.prepend(navIcon(slug));fragment.append(a);
  }
  const more=document.createElement("details");more.className="ps-advisor-more";
  const summary=document.createElement("summary");summary.textContent="More";more.append(summary);
  const list=document.createElement("div");
  for(const [href,label] of [["sectors.html","Sector research"],["decisions.html","Company decisions"],["archive.html","Past editions"]]){
   const link=document.createElement("a");link.href=href;link.textContent=label;
   link.prepend(navIcon(label==="Sector research"?"sectors":label==="Company decisions"?"decisions":"archive"));
   list.append(link);
  }
  more.append(list);fragment.append(more);
  const spacer=document.createElement("div");spacer.className="ps-sidebar-spacer";fragment.append(spacer);
  if(owner){owner.textContent="PRIVATE CLIENT VIEW";fragment.append(owner)}
  if(signout)fragment.append(signout);
  nav.replaceChildren(fragment);nav.classList.add("ps-advisor-nav");
  if(page==="portfolio")window.addEventListener("hashchange",()=>{
   for(const a of nav.querySelectorAll("a[data-slug]")){
    const slug=a.dataset.slug,active=slug==="market"&&location.hash==="#watchlist"||
      slug==="bonds"&&location.hash==="#bonds"||
      slug==="portfolio"&&!["#watchlist","#bonds"].includes(location.hash);
    if(active)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");
   }
  });
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