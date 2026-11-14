/* Power Stack decision rooms / 14 Nov 2026.
   Dated research instructions only. Never converts archived positions or
   watchlist ideas into verified broker holdings, current valuations or orders. */
export const ROOM_EDITION="2026-11-14";
const link=(href,label)=>({href,label});
// Specialist research instructions are stored ONLY in RLS-protected owner page data.
// This public JS asset intentionally contains no ticker-specific portfolio calls.

function elem(tag,cls,value){const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=value;return el;}
function where(page){
 if(page==="portfolio")return location.hash==="#bonds"?"bonds":location.hash==="#watchlist"?"watch":"holdings";
 if(page==="ideas")return location.hash==="#trades"?"trades":"prospects";
 return page;
}
export function mountCommandRoom(page,main,privateRooms){
 if(!main||!["portfolio","ideas","research","sectors","decisions"].includes(page))return null;
 const mount=elem("section","pscr-root");mount.setAttribute("aria-label","Specialist decision room");
 main.prepend(mount);
 function render(){
  const key=where(page),r=privateRooms?.[key]||null;
  if(!r){mount.replaceChildren(elem("p","pscr-footnote","Owner-only reviewed instructions unavailable. Use the existing records below and verify sources before making decisions."));return;}
  mount.id=r.id;mount.replaceChildren();
  const above=elem("div","pscr-upper");
  above.append(elem("span","pscr-kicker","POWER STACK / "+r.eyebrow),elem("span","pscr-date","RESEARCH EDITION · "+ROOM_EDITION));
  const title=elem("h1","pscr-title",r.title);
  const line=elem("p","pscr-lead",r.lead);
  const finding=elem("div","pscr-verdict");
  finding.append(elem("span","pscr-verdict-label","CURRENT RESEARCH INSTRUCTION"),
   elem("strong",null,r.call),elem("p",null,r.why));
  const nav=elem("nav","pscr-links");
  nav.setAttribute("aria-label","Command room navigation");
  const navLinks=[link("index.html","Market Radar"),link("index.html#war-room","Matt's War Room"),link("portfolio.html#holdings","Holdings Command"),link("ideas.html","Opportunity Command"),link("ideas.html#trades","Trade Setups"),link("index.html#scenario-matrix","Scenario Matrix"),link("research.html","Evidence Command")];
  for(const dest of navLinks){const a=elem("a",null,dest.label);a.href=dest.href;nav.append(a);}
  const heading=elem("div","pscr-list-heading");
  heading.append(elem("span","pscr-list-kicker","THE DESK'S SPECIFIC INSTRUCTIONS"),
   elem("h2",null,"Current calls and reversal conditions"));
  const cards=elem("div","pscr-grid");
  for(const [ticker,call,why,next,invalid,href] of r.instructions){
   const card=elem("article","pscr-card");
   const head=elem("div","pscr-card-head");
   head.append(elem("h3",null,ticker),elem("span","pscr-posture",call));
   card.append(head,elem("p","pscr-reason",why));
   const details=elem("details","pscr-details");
   details.append(elem("summary",null,"Why, what next, what reverses the call"));
   const body=elem("div","pscr-detail-body");
   for(const [label,value] of [["Next evidence / action",next],["Reversal / invalidation",invalid]]){
    const section=elem("div");section.append(elem("strong",null,label),elem("p",null,value));body.append(section);
   }
   const a=elem("a","pscr-case-link","Open supporting workspace →");a.href=href;body.append(a);
   details.append(body);card.append(details);cards.append(card);
  }
  const foot=elem("p","pscr-footnote","Research-only · Based on a dated 14 November 2026 review and existing source-led cases. No trades, broker reconciliations, live price guarantees or underlying model-score changes. Recheck primary sources before acting.");
  mount.append(above,title,line,finding,nav,heading,cards,foot);
 }
 render();
 window.addEventListener("hashchange",render);
 return mount;
}
