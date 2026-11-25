// Presentation only. No database calls, private data literals, or authentication changes.
const states={candidates:{mode:"cards",sort:"ticker",asc:true,search:""},tracked:{mode:"cards",sort:"ticker",asc:true,search:""}};
const make=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n;};
const val=(n,s)=>n.querySelector(s)?.textContent?.trim()||"—";
const root=()=>document.querySelector("main#owner-ideas-content.psi-shell");
const gateOpen=()=>document.getElementById("gate-panel")?.hidden===true;
const mounted=new WeakSet();
function comparison(list,kind){
 if(mounted.has(list))return;mounted.add(list);
 const state=states[kind], tracked=kind==="tracked";
 const selector=tracked?".psi-card":".pso-card";
 const tools=make("div","psx-toolbar");
 const count=make("span","psx-count");tools.append(count);
 const toggle=make("div","psx-toggle");toggle.setAttribute("role","group");toggle.setAttribute("aria-label","View mode");
 const buttons=["cards","table"].map(mode=>{const b=make("button","psx-view",mode==="cards"?"Cards":"Table");b.type="button";b.addEventListener("click",()=>{state.mode=mode;state.active=null;if(mode==="table"&&!tracked){const more=list.parentElement.querySelector(".pso-show-more");if(more&&!more.hidden&&more.getAttribute("aria-expanded")!=="true")more.click();}paint();});toggle.append(b);return b;});
 tools.append(toggle);
 const search=make("input","psx-search");search.type="search";search.placeholder="Filter ticker or company";search.setAttribute("aria-label","Filter research candidates");search.value=state.search;
 if(!tracked){tools.append(search);search.addEventListener("input",()=>{state.search=search.value;if(state.search&&!tracked){const more=list.parentElement.querySelector(".pso-show-more");if(more&&!more.hidden&&more.getAttribute("aria-expanded")!=="true")more.click();}paint();});}
 const wrap=make("div","psx-table-wrap");wrap.hidden=true;wrap.tabIndex=0;wrap.setAttribute("aria-label","Scrollable ideas comparison");
 list.before(tools,wrap);
 function rows(){return [...list.querySelectorAll(selector)].map(n=>{
 const ticker=val(n,tracked?".psi-ticker":".pso-ticker"),name=val(n,tracked?".psi-card-head>div:first-child>small":".pso-company");
 const status=val(n,tracked?".psi-plan-label":".pso-condition strong");
 const price=tracked?val(n,".psi-metric:nth-child(2) strong")+" · "+val(n,".psi-metric:nth-child(2) small:last-child"):val(n,".pso-condition span");
 const gate=tracked?val(n,".psv-entry-emphasis p"):val(n,".pso-step p");
 return {n,ticker,name,status,price,gate};
 });}
 function paint(){
 const all=rows(),q=state.search.trim().toLowerCase(),filtered=all.filter(r=>!q||(r.ticker+" "+r.name).toLowerCase().includes(q));
 count.textContent=filtered.length+" "+(tracked?"tracked":"research")+" "+(filtered.length===1?"idea":"ideas")+" shown";
 buttons.forEach((b,i)=>b.setAttribute("aria-pressed",String(state.mode===(i?"table":"cards"))));
 list.classList.toggle("psx-table-mode",state.mode==="table");
 all.forEach(r=>{r.n.classList.toggle("psx-filtered",!filtered.includes(r));r.n.toggleAttribute("data-psx-active",state.mode==="table"&&state.active===r.n);});
 wrap.hidden=state.mode!=="table";
 if(wrap.hidden)return;
 const table=make("table","psx-table"),thead=make("thead"),hr=make("tr"),tbody=make("tbody");
 for(const [key,label] of [["ticker","Company"],["status","Research status"],["price","Dated price"],["gate","Entry / decision gate"]]){
  const th=make("th");th.scope="col";const sortable=key==="ticker"||key==="status";
  if(sortable){th.setAttribute("aria-sort",state.sort===key?(state.asc?"ascending":"descending"):"none");const b=make("button","psx-sort",label+(state.sort===key?(state.asc?" ↑":" ↓"):" ↕"));b.type="button";b.addEventListener("click",()=>{state.asc=state.sort===key?!state.asc:true;state.sort=key;paint();});th.append(b);}else th.textContent=label;hr.append(th);
 }
 thead.append(hr);table.append(thead,tbody);
 const sorted=filtered.slice().sort((a,b)=>(state.asc?1:-1)*a[state.sort].localeCompare(b[state.sort],undefined,{numeric:true})||a.ticker.localeCompare(b.ticker));
 for(const r of sorted){
  const tr=make("tr"),company=make("td"),b=make("button","psx-row-open",r.ticker);b.type="button";b.setAttribute("aria-expanded",String(state.active===r.n));b.addEventListener("click",()=>{state.active=state.active===r.n?null:r.n;paint();if(state.active){r.n.tabIndex=-1;r.n.focus({preventScroll:true});r.n.scrollIntoView({block:"nearest"});}});company.append(b,make("small","psx-company",r.name));tr.append(company,make("td",null,r.status),make("td",null,r.price),make("td",null,r.gate));tbody.append(tr);
 }
 if(!sorted.length){const tr=make("tr"),td=make("td",null,"No matching ideas.");td.colSpan=4;tr.append(td);tbody.append(tr);}
 wrap.replaceChildren(table);
 }
 new MutationObserver(()=>paint()).observe(list,{childList:true,subtree:true});
 paint();
}
function enhance(main){
 const shell=main.querySelector(".pso-shell"),list=shell?.querySelector(".pso-cards");
 if(shell&&list&&!shell.classList.contains("psx-organized")){
  shell.classList.add("psx-organized");
  const head=shell.querySelector(".pso-head"),filters=shell.querySelector(".pso-filters"),more=shell.querySelector(".pso-show-more"),lead=shell.querySelector(".pso-lead");
  const secondary=make("details","psx-secondary"),summary=make("summary",null,"Research lenses, market closes & navigation");
  secondary.append(summary);
  for(const node of [shell.querySelector(".pso-paths"),shell.querySelector("#ps-ideas-opportunity-lenses"),shell.querySelector(".pso-close-panel")])if(node)secondary.append(node);
  if(lead&&head&&filters&&more)lead.after(head,filters,list,more);
  more?.after(secondary);
  comparison(list,"candidates");
 }
 const tracked=main.querySelector("#psi-cards");
 if(tracked)comparison(tracked,"tracked");
}
function start(){
 const main=root();if(!main||!gateOpen())return;
 if(!mounted.has(main)){
  mounted.add(main);
  const hero=main.querySelector(".psi-hero h1");if(hero){const svg=hero.querySelector("svg");hero.replaceChildren();if(svg)hero.append(svg);hero.append(document.createTextNode("Investment ideas"));}
  const nav=make("nav","psx-jumps");nav.setAttribute("aria-label","Ideas sections");
  for(const [label,id] of [["Research candidates","ps-opportunities"],["My tracked ideas","psi-tracked-drawer"]]){const b=make("button",null,label);b.type="button";b.addEventListener("click",()=>{const target=document.getElementById(id);if(target?.tagName==="DETAILS")target.open=true;target?.scrollIntoView({block:"start"});});nav.append(b);}
  main.querySelector(".psi-hero")?.after(nav);
  const mount=main.querySelector("#psi-opportunity-mount");
  if(mount)new MutationObserver(()=>enhance(main)).observe(mount,{childList:true});
 }
 enhance(main);
}
new MutationObserver(start).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden"]});
start();
