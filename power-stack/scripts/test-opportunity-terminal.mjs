import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {OPPORTUNITIES,OPPORTUNITY_CONTRACT,visibleOpportunities,opportunityState} from "../owner-opportunity-terminal.mjs";
const read=name=>readFileSync(new URL("../"+name,import.meta.url),"utf8");
const now=new Date("2026-11-12T02:00:00Z");
test("opportunities are explicit research candidates, not orders or fabricated price triggers",()=>{
 assert.equal(OPPORTUNITY_CONTRACT,"power-stack-guided-opportunities/1");
 assert.equal(visibleOpportunities("SHORT").length,3);
 assert(visibleOpportunities("SHORT").every(x=>x.direction==="SHORT"&&x.kind==="TRADE"));
 assert(visibleOpportunities("INVESTMENT").every(x=>x.kind==="INVESTMENT"));
 assert(visibleOpportunities("TRADE").every(x=>x.kind==="TRADE"));
 assert(OPPORTUNITIES.some(x=>x.ticker==="TLT"&&x.direction==="SHORT"));
 assert(OPPORTUNITIES.some(x=>x.ticker==="TLT"&&x.direction==="LONG"));
 for(const x of OPPORTUNITIES){
  for(const k of ["ticker","thesis","trigger","invalidation","risk","catalyst","reviewed","source"])assert(x[k],x.id+"/"+k);
  assert(x.source.startsWith("https://"));
  assert(!/guaranteed|ready to trade|buy now/i.test(x.thesis+" "+x.trigger));
 }
});
test("delayed prices never become a chart or borrow confirmation",()=>{
 const idea=OPPORTUNITIES[0],q={close:50,currency:"USD",session:"2026-11-11"};
 const state=opportunityState(idea,q,now);
 assert.equal(state.status,"WAIT FOR CONFIRMATION");
 assert.equal(state.price,50);
 assert.equal(opportunityState(idea,{...q,session:"2026-10-20"},now).price,null);
 assert.equal(opportunityState(idea,{...q,close:null},now).price,null);
 assert.equal(opportunityState(idea,{...q,session:"2026-11-14"},now).price,null);
});
test("short ideas expire quickly; old cards never imply a live actionable trade",()=>{
 const idea=OPPORTUNITIES[0];
 const out=opportunityState(idea,{close:50,session:"2026-11-19"},new Date("2026-11-20T02:00:00Z"));
 assert.equal(out.status,"REVIEW EXPIRED");
 assert.equal(out.price,null);
 assert.equal(opportunityState(OPPORTUNITIES.find(x=>x.id==="cf-long"),null,new Date("2026-11-20T02:00:00Z")).current,true);
});
test("the new terminal remains behind the existing owner gate and separates existing saved ideas",()=>{
 const home=read("owner-decision-desk.mjs"),tracker=read("owner-ideas-tracker.mjs"),gate=read("auth-gate.mjs");
 assert(home.includes('renderOpportunityTerminal(opportunityHost,state.priceMap,{mode:"home",ownerResearch:state.ideaRows})'));
 assert(tracker.includes('renderOpportunityTerminal($("psi-opportunity-mount"),state.prices,{mode:"ideas",ownerResearch:state.ideas})'));
 assert(tracker.includes('value="TRADE">Tracked trades'));
 assert(tracker.includes('value="INVESTMENT">Tracked investments'));
 assert(gate.indexOf('const user=await authenticate()')<gate.indexOf('if(PAGE==="index")'));
 for(const file of ["index.html","ideas.html"])assert(read(file).includes('owner-opportunity-terminal.css?v=20261112-tech2'));
 const module=read("owner-opportunity-terminal.mjs");
 assert(!/sb_secret_|service_role|@gmail\.com|owner_user_id|brokerQuantity|cash_delta/i.test(module));
 assert(module.includes('No trade tickets or broker orders are created'));
 assert(module.includes('scanMarketOpportunities(prices)'));
 assert(module.includes('Bluebelly macro / fundamental admission not verified'));
});
