/* Client-presentation layer. Private portfolio, evidence and actions remain unchanged. */
export function presentClientView(page,main){
 const nav=document.querySelector("#site-header nav");
 if(nav){
  const owner=nav.querySelector("#owner-indicator");
  const signout=nav.querySelector("#logout-button");
  const links=[
   ["index.html","Overview","index"],
   ["ideas.html","Opportunities","ideas"],
   ["portfolio.html#watchlist","Market watch","market"],
   ["portfolio.html","Portfolio","portfolio"],
   ["research.html","Research","research"]
  ];
  const fragment=document.createDocumentFragment();
  for(const [href,label,slug] of links){
   const a=document.createElement("a");a.href=href;a.textContent=label;
   if(slug===page||(slug==="market"&&page==="portfolio"&&location.hash==="#watchlist"))
     a.setAttribute("aria-current","page");
   fragment.append(a);
  }
  const more=document.createElement("details");more.className="ps-advisor-more";
  const summary=document.createElement("summary");summary.textContent="More";more.append(summary);
  const list=document.createElement("div");
  for(const [href,label] of [["sectors.html","Sector research"],["decisions.html","Company decisions"],["archive.html","Past editions"]]){
   const link=document.createElement("a");link.href=href;link.textContent=label;list.append(link);
  }
  more.append(list);fragment.append(more);
  if(owner){owner.textContent="Private";fragment.append(owner)}
  if(signout)fragment.append(signout);
  nav.replaceChildren(fragment);nav.classList.add("ps-advisor-nav");
 }
 const subtitle=document.querySelector("#site-header .brand small");
 if(subtitle)subtitle.textContent="INVESTMENT BRIEF";
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