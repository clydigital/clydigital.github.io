// Generic, owner-only rendering. No private research or portfolio data in this asset.
export const CONTRACT="ps-investment-intelligence/1";
const list=x=>Array.isArray(x)?x:[];
const obj=x=>x&&typeof x==="object"&&!Array.isArray(x);
const str=x=>typeof x==="string"?x.trim():"";
const date=x=>typeof x==="string"&&Number.isFinite(Date.parse(x));
const validScore=x=>typeof x==="number"&&Number.isFinite(x)&&x>=0&&x<=10;
export const activePages=new Set(["index","ideas","sectors","research","portfolio","decisions","archive"]);
export function readEdition(raw){
 try{
 const p=typeof raw==="string"?JSON.parse(raw):raw;
 if(!obj(p)||p.contract!==CONTRACT||!date(p.asOf))return null;
 return p;
 }catch{return null}
}
export function opportunityRows(p){
 const map=new Map();
 for(const row of [...list(p?.universe),...list(p?.opportunities)]){
  if(!obj(row)||!str(row.id)||!str(row.name))continue;
  const id=str(row.id);map.set(id,{...map.get(id),...row,id});
 }
 return [...map.values()];
}
export function recommendationState(row){
 const action=str(row?.action).toUpperCase();
 const required=["why","business","valuation","downside","catalyst","invalidation","portfolioFit"];
 const complete=required.every(k=>str(row?.[k]))&&list(row?.evidence).some(x=>str(x?.claim)&&date(x?.asOf)&&safeUrl(x?.url))&&list(row?.scenarios).length>0&&list(row?.hedges).length>0;
 return complete&&row?.evidenceStatus==="VERIFIED"&&action?action:"RESEARCH / RECHECK";
}
export function safeUrl(v){try{const u=new URL(v);return u.protocol==="https:"&&!u.username&&!u.password?u.href:null}catch{return null}}
const el=(tag,value,cls)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n};
function line(root,label,value){if(!str(value))return;const p=el("p");p.append(el("strong",label+" · "),document.createTextNode(value));root.append(p)}
function details(root,title,open=false){const d=el("details",undefined,"ps-recap-archive-drawer");d.open=open;d.append(el("summary",title));root.append(d);return d}
function evidence(root,rows){if(!list(rows).length){line(root,"Evidence","Not supplied; requires verification.");return}const d=details(root,"Evidence and counterevidence");for(const x of list(rows)){if(!obj(x))continue;const p=el("p");p.append(el("strong",str(x.side)||"Evidence"),document.createTextNode(" · "+(str(x.asOf)||"Undated")+" · "+(str(x.claim)||"Unspecified")));const url=safeUrl(x.url);if(url){const a=el("a"," Original source");a.href=url;a.rel="noopener noreferrer";a.target="_blank";p.append(a)}d.append(p)}}
function records(root,rows,fields,empty){if(!list(rows).length){root.append(el("p",empty||"No reviewed entries in this edition."));return}for(const x of list(rows)){if(!obj(x))continue;const d=details(root,str(x.name)||str(x.title)||str(x.ticker)||"Research record");for(const [key,label] of fields)line(d,label,x[key]);if(x.evidence)evidence(d,x.evidence)}}
function section(root,title,sub){const n=el("section",undefined,"card");n.append(el("h2",title));if(sub)n.append(el("p",sub));root.append(n);return n}
function macro(root,p){const n=section(root,"01 / Is it a good time to buy? (Macros)");const m=p.macro||{};const score=validScore(m.score)&&m.evidenceStatus==="VERIFIED"?m.score:null;
 n.append(el("h3",score===null?"Not scored — evidence incomplete":score.toFixed(1)+" / 10 · "+(str(m.verdict)||"Analyst assessment")));if(score===null)line(n,"Prior view / context",m.verdict);
 if(score!==null){const meter=el("meter");meter.min=0;meter.max=10;meter.low=4;meter.high=6;meter.optimum=10;meter.value=score;meter.setAttribute("aria-label","Macro buying conditions out of ten");n.append(meter)}
 if(validScore(m.previousScore))line(n,"Previous reading",String(m.previousScore)+" / 10 · "+(str(m.previousAsOf)||"date unavailable"));
 for(const [k,l] of [["why","Why"],["opportunityCost","Opportunity cost"],["recession","Jobs and recession"],["credit","Credit"],["inflation","Inflation and rates"],["seasonality","Seasonality"],["deployment","Deployment pace"],["invalidation","What changes our view"]])line(n,l,m[k]);evidence(n,m.evidence)}
function sectors(root,p){const n=section(root,"02 / Risk-on or risk-off — which sectors?",str(p.rotation?.verdict));line(n,"Why",p.rotation?.why);records(n,p.sectors,[["performance","1D / 3D / 5D and relative breadth"],["drivers","Economic drivers"],["valuation","Valuation"],["scenarios","Scenario exposure"],["opportunities","Companies to compare"],["risks","Risks and catalysts"]]);}
function divergences(root,p){const n=section(root,"03 / Major divergences");records(n,p.divergences,[["why","Why it matters"],["countercase","Alternative explanation"],["assets","Affected assets"],["resolution","Resolving evidence / catalyst"]]);}
function technical(root,p){const n=section(root,"04 / Technical Watch","Verified observations only; no technical gate for valuation-led real-estate cases.");records(n,p.technicals,[["direction","1D / 3D / 5D direction"],["zone","Daily / weekly / monthly EMA and SD zone"],["position","Above / below, distance and cross"],["why","Why interesting"],["confirmation","Confirmation / invalidation"],["asOf","Observation date"]]);}
function caseView(root,row){const q=row.marketObservation;const price=q?.status==="SOURCE_DATED"&&Number.isFinite(q.price)?q.currency+" "+q.price.toLocaleString("en-GB",{maximumFractionDigits:3})+" · "+q.asOf:"Quote unavailable";const d=details(root,row.name+" · "+(str(row.ticker)||row.id)+" · "+price+" · "+recommendationState(row));
 if(q){line(d,"Price observation",price+" · not streaming");const pct=x=>Number.isFinite(x)?(x>0?"+":"")+x.toFixed(2)+"%":"—";line(d,"1D / 3D / 5D",pct(q.changePct)+" / "+pct(q.change3dPct)+" / "+pct(q.change5dPct));const url=safeUrl(q.sourceUrl);if(url){const a=el("a","Original market observation");a.href=url;a.rel="noopener noreferrer";a.target="_blank";d.append(a)}}for(const [k,l] of [["sector","Sector"],["industry","Industry"],["theme","Theme"],["business","Business and economic exposure"],["why","Why now"],["relationships","Customers, suppliers and peers"],["valuation","Normalised earnings and valuation"],["downside","Bear case and downside"],["upside","Base / bull case"],["entry","Entry conditions"],["technical","Technical context"],["horizon","Investment horizon"],["catalyst","Catalysts"],["invalidation","Invalidation"],["portfolioFit","Portfolio fit and alternatives"],["countercase","Counterargument"],["asOf","Reviewed as of"]])line(d,l,row[k]);
 records(details(d,"Scenario sensitivity"),row.scenarios,[["impact","Conditional impact"],["why","Mechanism"],["trigger","Trigger"],["failure","Failure condition"]]);
 records(details(d,"Hedges and diversification"),row.hedges,[["risk","Risk targeted"],["mechanism","Mechanism"],["cost","Cost / carry"],["failure","When it fails"]]);evidence(d,row.evidence);
 if(recommendationState(row)==="RESEARCH / RECHECK")line(d,"Status","Not a current actionable recommendation; missing or unverified underwriting.");
}
function opportunities(root,p){const n=section(root,"05 / Fundamental Watch & opportunity universe","All available candidates, including incomplete research and discoveries outside the monitored universe.");
 const rows=opportunityRows(p).sort((a,b)=>(Number.isFinite(a.rank)?a.rank:Infinity)-(Number.isFinite(b.rank)?b.rank:Infinity)||a.name.localeCompare(b.name));
 const label=el("label","Search companies, themes or sectors");const input=el("input");input.type="search";input.placeholder="Ticker, company, sector…";label.append(input);n.append(label);
 const region=el("select");const regions=["All regions",...new Set(rows.map(x=>str(x.region)).filter(Boolean))];for(const item of regions){const option=el("option",item);option.value=item;region.append(option)}const theme=el("select");for(const item of ["All themes",...new Set(rows.map(x=>str(x.theme)).filter(Boolean))]){const option=el("option",item);option.value=item;theme.append(option)}const order=el("select");for(const item of ["Research priority","Company A–Z","1D weakest","5D weakest","5D strongest"]){const option=el("option",item);option.value=item;order.append(option)}for(const [l,s] of [["Region",region],["Theme",theme],["Sort",order]]){const label=el("label",l+" ");label.append(s);n.append(label)}const status=el("p");status.setAttribute("role","status");const host=el("div");n.append(status,host);
 function render(){const q=input.value.toLowerCase().trim();const found=rows.filter(x=>[x.id,x.ticker,x.name,x.sector,x.industry,x.theme].map(str).join(" ").toLowerCase().includes(q)&&(region.value==="All regions"||x.region===region.value)&&(theme.value==="All themes"||x.theme===theme.value));const num=(x,k)=>Number.isFinite(x.marketObservation?.[k])?x.marketObservation[k]:null;const numeric=(a,b,k,sign)=>{const av=num(a,k),bv=num(b,k);return av===null?bv===null?0:1:bv===null?-1:sign*(av-bv)};if(order.value==="Company A–Z")found.sort((a,b)=>a.name.localeCompare(b.name));if(order.value==="1D weakest")found.sort((a,b)=>numeric(a,b,"changePct",1));if(order.value==="5D weakest")found.sort((a,b)=>numeric(a,b,"change5dPct",1));if(order.value==="5D strongest")found.sort((a,b)=>numeric(a,b,"change5dPct",-1));status.textContent=found.length+" of "+rows.length+" candidates · no display cap";host.replaceChildren();for(const r of found)caseView(host,r);if(!found.length)host.append(el("p","No matched candidates in the current edition."))}
 input.addEventListener("input",render);for(const select of [region,theme,order])select.addEventListener("change",render);render();
}
function scenarioRisk(root,p){const n=section(root,"Scenario playbook & portfolio risk");records(n,p.scenarios,[["mechanism","Causal chain"],["why","Supporting view"],["countercase","Counterevidence"],["triggers","Leading indicators"],["beneficiaries","Beneficiaries"],["vulnerable","Vulnerable sectors"],["response","Positioning"],["invalidation","Invalidation"]]);records(n,p.hedges,[["risk","Risk targeted"],["mechanism","Hedge mechanism"],["cost","Cost, carry and FX"],["failure","Failure condition"],["response","Portfolio response"]]);line(n,"Portfolio overlap",p.portfolio?.overlap);line(n,"Capital recycling",p.portfolio?.capitalRecycling);line(n,"Broker evidence",p.portfolio?.brokerStatus);}
export function mountInvestmentIntelligence(page,main,raw){
 if(!activePages.has(page)||!main||main.querySelector("#ps-investment-intelligence"))return;
 const source=main.querySelector("#ps-investment-intelligence-data");if(source)source.hidden=true;
 const p=readEdition(raw);const root=el("section",undefined,"ps-investment-intelligence");root.id="ps-investment-intelligence";
 const header=el("header",undefined,"ps-recap-intro");header.append(el("p","POWER STACK / INVESTMENT INTELLIGENCE","ps-recap-kicker"),el("h1",page==="index"?"Market conditions & investment opportunities":"Investment intelligence"));root.append(header);
 if(!p){root.append(el("p","No approved manual investment-intelligence edition available. Existing research and decision history remain accessible."));}
 else{header.append(el("p","Manual research edition · "+p.asOf+" · not streaming market data"));if(p.marketCoverage){const m=p.marketCoverage;line(header,"Bluebelly coverage",m.sourceDated+" / "+m.tracked+" source-dated; "+m.unavailable+" unavailable");line(header,"Observation sessions",Object.entries(m.sessionDates||{}).map(([d,n])=>d+": "+n).join(" · "));}
 if(page==="index"){macro(root,p);sectors(root,p);divergences(root,p);technical(root,p);opportunities(root,p);}
 if(page==="sectors"){sectors(root,p);opportunities(root,p);scenarioRisk(root,p)}
 if(page==="ideas"){opportunities(root,p);technical(root,p)}
 if(page==="portfolio"){scenarioRisk(root,p);opportunities(root,p)}
 if(page==="research"){divergences(root,p);scenarioRisk(root,p);opportunities(root,p)}
 if(page==="decisions"){opportunities(root,p);scenarioRisk(root,p)}
 if(page==="archive"){macro(root,p);records(root,p.history,[["asOf","Edition"],["verdict","Verdict"],["why","What changed"]]);}
 }
 const target=page==="index"?main.querySelector("#action-log")||main:main;
 target.prepend(root);
}
