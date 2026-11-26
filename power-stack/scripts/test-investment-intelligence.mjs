import test from "node:test";
import assert from "node:assert/strict";
import {readEdition,opportunityRows,recommendationState,safeUrl,activePages} from "../owner-investment-intelligence.mjs";
import {validateBluebellyStockCoverage} from "../owner-bluebelly-stocks.mjs";
const now=new Date("2026-11-26T00:00:00Z");
const row=(ticker,region="US",currency="USD",timeZone="America/New_York")=>({ticker,region,currency,timeZone,company:ticker,status:"SOURCE_DATED",price:10,asOf:"2026-11-25",sourceUrl:"https://finance.yahoo.com/quote/X",changePct:0,change3dPct:-2,change5dPct:4});
const packet=rows=>({contractVersion:"bluebelly-equity-coverage/1",source:"Bluebelly public market monitor",rows,coverage:{tracked:rows.length,US:rows.filter(x=>x.region==="US").length,EU:rows.filter(x=>x.region==="EU").length,ASIA:rows.filter(x=>x.region==="ASIA").length,sourceDated:rows.filter(x=>x.status==="SOURCE_DATED").length,unavailable:rows.filter(x=>x.status!=="SOURCE_DATED").length}});
test("dynamic expanded coverage, Asia and matched changes",()=>{const rows=Array.from({length:160},(_,i)=>row("X"+i));rows.push(row("0245.KL","ASIA","MYR","Asia/Kuala_Lumpur"));const p=validateBluebellyStockCoverage(packet(rows),now);assert.equal(p.rows.length,161);assert.equal(p.ASIA.tracked,1);assert.equal(p.rows[0].change3dPct,-2)});
test("one stale price does not erase whole universe",()=>{const p=validateBluebellyStockCoverage(packet([row("X"),{...row("Y"),asOf:"2026-10-01"}]),now);assert.equal(p.rows[1].price,null);assert.equal(p.rows[1].status,"MONITORED_UNAVAILABLE");assert.equal(p.rows[0].changePct,0)});
test("duplicate identity rejected",()=>assert.equal(validateBluebellyStockCoverage(packet([row("X"),row("X")]),now),null));
test("real estate excluded from technical scan",()=>{const r={...row("MAA"),theme:"REAL_ESTATE",emaScan:{asOf:"2026-11-25"}};assert.equal(validateBluebellyStockCoverage(packet([r]),now).rows[0].emaScan,null)});
test("edition and full universe including outside discoveries",()=>{const p=readEdition({contract:"ps-investment-intelligence/1",asOf:now.toISOString(),universe:Array.from({length:200},(_,i)=>({id:"X"+i,name:"Company "+i})),opportunities:[{id:"X0",name:"Updated",why:"Review"},{id:"NEW",name:"New discovery"}]});assert.equal(opportunityRows(p).length,201);assert.equal(opportunityRows(p)[0].name,"Updated");assert.equal(readEdition("bad"),null)});
test("missing evidence never promoted, dossier excluded",()=>{assert.equal(recommendationState({action:"BUY"}),"RESEARCH / RECHECK");assert.equal(activePages.has("dossiers"),false);assert.equal(safeUrl("javascript:alert(1)"),null)});

import {mergeEditionQuotes,quotes} from "../owner-portfolio-table.mjs";
import {expandMarketRows} from "../owner-market-views.mjs";
const bb=(ticker,currency="USD",status="SOURCE_DATED")=>({id:ticker,ticker,name:ticker,marketObservation:{status,currency,price:50,asOf:"2026-11-25",changePct:-2,change3dPct:0,change5dPct:3,sourceUrl:"https://www.nasdaq.com/market-activity/stocks/x/historical"}});
const edition=universe=>({contract:"ps-investment-intelligence/1",asOf:"2026-11-25T23:00:00Z",universe});
const legacyRow=(ticker,currency="USD")=>({ticker,status:"CLOSED",close:999,currency,sessionDate:"2026-11-25",sourceUrl:"https://query1.finance.yahoo.com/v8/finance/chart/"+ticker,changePct:1,change3dPct:2,change5dPct:3});
const legacy=rows=>({contractVersion:"power-stack-public-prices/1",generatedAt:"2026-11-25T23:00:00Z",rows});
test("covered equities use BB, uncovered bond ETF keeps dated legacy, aliases match local listing",()=>{const p=mergeEditionQuotes(legacy([legacyRow("NVDA"),legacyRow("TLT"),legacyRow("DAYANG","MYR")]),edition([bb("NVDA"),bb("5141.KL","MYR")]),now);const q=quotes(p,now).holding;assert.equal(q.get("NVDA").close,50);assert.equal(q.get("NVDA").day,-2);assert.equal(q.get("NVDA").technical,null);assert.equal(q.get("TLT").close,999);assert.equal(q.get("DAYANG").currency,"MYR");assert.equal(q.get("DAYANG").close,50);assert.equal(q.has("5141.KL"),false)});
test("unavailable BB observation cannot silently resurrect legacy equity price",()=>{const q=quotes(mergeEditionQuotes(legacy([legacyRow("NVDA")]),edition([bb("NVDA","USD","MONITORED_UNAVAILABLE")]),now),now).holding;assert.equal(q.has("NVDA"),false)});
test("new full universe is not truncated in holdings and market selectors",()=>{const p=mergeEditionQuotes(legacy([]),edition(Array.from({length:180},(_,i)=>bb("Z"+i))),now);const q=quotes(p,now).holding;assert.equal(q.size,180);assert.equal(expandMarketRows([],[],p,q).length,180)});
test("stale edition and old tape cannot invent a valid quote",()=>{const p=mergeEditionQuotes(legacy([legacyRow("TLT")]),edition([bb("NVDA")]),new Date("2026-12-10T00:00:00Z"));assert.equal(quotes(p,new Date("2026-12-10T00:00:00Z")).holding.size,0)});

import {mountInvestmentIntelligence,sectorDailyReturn,businessClassification,classificationGroups} from "../owner-investment-intelligence.mjs";
class TestNode {
 constructor(tag){this.tagName=tag;this.childNodes=[];this.listeners={};this.attrs={};this.dataset={};this.style={};this.open=false;this.value="";this._text="";this.id="";}
 set textContent(v){this._text=String(v);this.childNodes=[]}
 get textContent(){return this._text+this.childNodes.map(x=>x.textContent).join("")}
 append(...xs){this.childNodes.push(...xs)}
 prepend(...xs){this.childNodes.unshift(...xs)}
 replaceChildren(...xs){this.childNodes=xs}
 setAttribute(k,v){this.attrs[k]=String(v)}
 addEventListener(k,fn){this.listeners[k]=fn}
 querySelector(q){return this.all().find(n=>q.startsWith("#")&&n.id===q.slice(1))||null}
 all(){return [this,...this.childNodes.flatMap(x=>x.all())]}
}
test("sitewide mount preserves Action Log and shows historical gauge with full searchable universe",()=>{
 const prior=globalThis.document;globalThis.document={createElement:t=>new TestNode(t),createTextNode:t=>{const n=new TestNode("#text");n.textContent=t;return n}};
 try{
 const main=new TestNode("main"),log=new TestNode("section"),war=new TestNode("section"),old=new TestNode("p");log.id="action-log";war.id="war-room";old.textContent="Saved instructions";log.append(old);main.append(log,war);
 const p={...edition(Array.from({length:155},(_,i)=>bb("Z"+i))),macro:{score:null,previousScore:6.5,evidenceStatus:"PARTIAL",verdict:"Previous lean buy"},scenarios:[{name:"Recession",response:"Keep liquidity"}]};
 mountInvestmentIntelligence("index",main,p);
 const root=main.querySelector("#ps-investment-intelligence");
 assert.equal(log.childNodes[0],root);assert.equal(log.childNodes.includes(old),true);
 assert.match(root.textContent,/Not scored/);assert.match(root.textContent,/historical/);
 assert.equal(root.all().find(x=>x.tagName==="meter").value,6.5);
 assert.match(root.textContent,/Browse all 155 candidates/);
 const drawer=root.all().find(x=>x.tagName==="details"&&x.childNodes[0]?.textContent.startsWith("Browse all 155"));
 for(const s of drawer.all().filter(x=>x.tagName==="select"))s.value=s.childNodes[0].value;
 drawer.open=true;drawer.listeners.toggle();assert.match(drawer.textContent,/155 of 155 candidates/);
 const input=drawer.all().find(x=>x.tagName==="input");input.value="Z154";input.listeners.input();assert.match(drawer.textContent,/1 of 155 candidates/);
 assert.ok(war.querySelector("#ps-war-intelligence"));
 const dossier=new TestNode("main");mountInvestmentIntelligence("dossiers",dossier,p);assert.equal(dossier.childNodes.length,0);
 }finally{globalThis.document=prior;}
});

import {cardResearch,sleeveWeights,holdingCard} from "../owner-portfolio-table.mjs";
const level=(over={})=>({frame:"D",period:20,multiplier:1,asOf:"2026-11-25",ema:52,lower:48,upper:56,warmup:"READY",distancePct:-3.846,side:"below",band:"inside",windows:{"3":{approach:"up_to",emaCross:"none",upperCross:"none",lowerCross:"none"}},...over});
const marketRow=(ticker="XYL",over={})=>({ticker,name:ticker,held:true,quantity:2,quantityAsOf:"2026-10-02",currency:"USD",close:50,session:"2026-11-25",basis:"Bluebelly source-dated close",day:-2,threeDay:0,fiveDay:3,...over});
const cardEdition=(ticker="XYL",over={})=>({...edition([{...bb(ticker),emaScan:{asOf:"2026-11-25",method:"FIRST_CLOSE_EMA_ROLLING_CLOSE_POPULATION_SD",observations:[level(),level({frame:"W",warmup:"SHORT_WARMUP"}),level({period:200,multiplier:1})]},...over}]),opportunities:[]});
test("instrument level cards use only exact session, currency, price, method and ready observations",()=>{
 const ed=cardEdition();const row=marketRow();
 assert.equal(cardResearch(row,ed).levels.length,1);
 assert.equal(cardResearch({...row,session:"2026-11-24"},ed).levels.length,0);
 assert.equal(cardResearch({...row,currency:"EUR"},ed).levels.length,0);
 assert.equal(cardResearch({...row,close:51},ed).levels.length,0);
 assert.equal(cardResearch(marketRow("TOL"),cardEdition("TOL")).levels.length,0);
 const wrong=cardEdition();wrong.universe[0].emaScan.method="OTHER";
 assert.equal(cardResearch(row,wrong).levels.length,0);
});
test("sleeve weights never combine currencies or sessions and exclude the warrant",()=>{
 const lines=[marketRow("A"),marketRow("B"),marketRow("C",{currency:"MYR"}),marketRow("D",{session:"2026-11-24"}),marketRow("6742UW")];
 const w=sleeveWeights(lines);
 assert.equal(w.get("A").weight,50);assert.equal(w.get("C").weight,100);
 assert.equal(w.get("D").weight,100);assert(!w.has("6742UW"));
});
test("render individual holding with a visible level diagram, quantity date, and explicit stale session",()=>{
 const prior=globalThis.document;globalThis.document={createElement:t=>new TestNode(t),createTextNode:t=>{const n=new TestNode("#text");n.textContent=t;return n}};
 try{const row=marketRow();const card=holdingCard(row,cardEdition(),sleeveWeights([row]));assert.match(card.textContent,/RECORDED HOLDING/);assert.match(card.textContent,/2026-10-02/);assert.match(card.textContent,/D 20 EMA/);assert.match(card.textContent,/3D · approach up_to/);assert(card.all().some(x=>x.className==="ps-recap-band-marker"));const outdated=holdingCard({...row,session:"2026-11-24"},cardEdition(),new Map());assert.match(outdated.textContent,/No matching BB close/);assert(!outdated.all().some(x=>x.className==="ps-recap-band-marker"));}finally{globalThis.document=prior}
});

test("sector charts only use explicitly comparable dated secondary returns",()=>{
 assert.equal(sectorDailyReturn("Nov25 secondary close +2.05%; BB confirmation pending."),2.05);
 assert.equal(sectorDailyReturn("Nov25 secondary close -0.81%; BB confirmation pending."),-.81);
 assert.equal(sectorDailyReturn("Nov24 secondary close +3.00%"),null);
 assert.equal(sectorDailyReturn("BB matched tape pending."),null);
});
test("white editorial scenes show distinct compositions with retained source labels",()=>{
 const prior=globalThis.document;globalThis.document={createElement:t=>new TestNode(t),createTextNode:t=>{const n=new TestNode("#text");n.textContent=t;return n}};
 try{const main=new TestNode("main"),p={...edition([]),macro:{verdict:"Lean wait",score:null,previousScore:6.5,evidenceStatus:"PARTIAL"},rotation:{verdict:"Mixed"},sectors:[{name:"Materials (XLB)",performance:"Nov25 secondary close +2.05%"},{name:"Technology (XLK)",performance:"Nov25 secondary close -0.81%"},{name:"Other",performance:"Unavailable"}],divergences:[{name:"Divergence",why:"A",countercase:"B",resolution:"C"}]};
 mountInvestmentIntelligence("index",main,p);const all=main.all();
 assert(all.some(x=>x.className==="ps-recap-macro-scene"));
 assert(all.some(x=>x.className==="ps-recap-sector-scene"));
 const bars=all.filter(x=>x.className==="ps-recap-sector-fill");assert.equal(bars.length,2);assert.equal(bars[0].dataset.sign,"positive");assert.equal(bars[1].dataset.sign,"negative");
 assert(all.some(x=>x.className==="ps-recap-contrast-pair"));
 assert.match(main.textContent,/Dated secondary 1D returns/);
 const row=marketRow();const card=holdingCard(row,cardEdition(),sleeveWeights([row]));
 for(const cls of ["ps-recap-position-hero","ps-recap-position-price","ps-recap-allocation","ps-recap-position-valuation"])assert(card.all().some(x=>x.className===cls),cls);
 }finally{globalThis.document=prior}
});

test("classification respects curated sector, retained theme and unknown values",()=>{
 assert.deepEqual(businessClassification({researchSector:"Industrials",sector:"Energy / shipping",industry:"Tanker shipping",theme:"ENERGY"}),{sector:"Industrials",industry:"Tanker shipping",theme:"Energy"});
 assert.equal(businessClassification({}).industry,"Unclassified industry");
 assert.deepEqual(classificationGroups([{sector:"Technology"},{researchSector:"Technology"},{sector:"Healthcare"}],"sector"),[["Technology",2],["Healthcare",1]]);
});
test("industry labels, sector filters and grouped browsing work without altering recommendation status",()=>{
 const prior=globalThis.document;globalThis.document={createElement:t=>new TestNode(t),createTextNode:t=>{const n=new TestNode("#text");n.textContent=t;return n}};
 try{
 const main=new TestNode("main");
 const p={...edition([{...bb("X"),researchSector:"Technology",industry:"Memory",theme:"AI",rank:1,why:"Check earnings"},{...bb("Y"),researchSector:"Healthcare",industry:"Insurance",theme:"HEALTH"},{...bb("Z"),theme:"ENERGY"}]),classification:{kind:"CLASSIFICATION_ONLY",researchAsOf:"2026-11-25T23:00:00Z",basis:"Curated taxonomy"}};
 mountInvestmentIntelligence("ideas",main,p);
 assert.match(main.textContent,/Classification-only update/);
 assert.match(main.textContent,/Technology · Memory · AI/);
 assert.match(main.textContent,/Candidate counts, not portfolio weights/);
 const drawer=main.all().find(x=>x.tagName==="details"&&x.childNodes[0]?.textContent.startsWith("Browse all 3"));
 const selects=drawer.all().filter(x=>x.tagName==="select");for(const s of selects)s.value=s.childNodes[0].value;
 const sector=selects.find(x=>x.childNodes[0].value==="All sectors"),industry=selects.find(x=>x.childNodes[0].value==="All industries"),group=selects.find(x=>x.childNodes[0].value==="Ranked list");
 drawer.open=true;drawer.listeners.toggle();assert.match(drawer.textContent,/3 of 3 candidates/);
 sector.value="Technology";sector.listeners.change();assert.match(drawer.textContent,/1 of 3 candidates/);
 industry.value="Insurance";industry.listeners.change();assert.match(drawer.textContent,/0 of 3 candidates/);
 industry.value="All industries";sector.value="All sectors";group.value="Group by industry";group.listeners.change();
 assert.match(drawer.textContent,/Memory · 1/);assert.match(drawer.textContent,/Unclassified industry · 1/);assert.match(drawer.textContent,/RESEARCH \/ RECHECK/);
 }finally{globalThis.document=prior}
});
