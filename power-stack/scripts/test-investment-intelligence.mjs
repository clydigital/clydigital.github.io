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

import {mountInvestmentIntelligence} from "../owner-investment-intelligence.mjs";
class TestNode {
 constructor(tag){this.tagName=tag;this.childNodes=[];this.listeners={};this.attrs={};this.open=false;this.value="";this._text="";this.id="";}
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
