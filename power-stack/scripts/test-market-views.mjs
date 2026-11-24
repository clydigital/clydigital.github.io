import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {BOND_ETFS,recordedHoldings,bondWatch,expandMarketRows,isBondEtf}
 from "../owner-market-views.mjs";
const read=name=>readFileSync(new URL("../"+name,import.meta.url),"utf8");
const tlt={ticker:"TLT",name:"20+ Year Treasury Bond ETF",currency:"USD",
 idea_type:"INVESTMENT",macro_state:"MIXED",macro_as_of:"2026-11-09",
 macro_reason:"Wait for CPI and auction supply",watch_low:null,watch_high:null};
const xom={ticker:"XOM",name:"ExxonMobil",position:{quantity:10,quantityAsOf:"2026-10-23",currency:"USD"}};
const snapshot={holdings:[xom],watchlist:[{ticker:"MU",name:"Micron Technology"}]};
const q=new Map([["TLT",{close:81.96,day:.049,threeDay:.245,fiveDay:.281,session:"2026-11-09",currency:"USD"}],
 ["XOM",{close:154,day:1.3,threeDay:2.4,fiveDay:4.5,session:"2026-11-09",currency:"USD"}]]);
const tape={rows:[{ticker:"TLT",currency:"USD"},{ticker:"XOM",currency:"USD"},
 {ticker:"MU",currency:"USD"},{ticker:"SGOV",currency:"USD"},{ticker:"SMH",currency:"USD"}]};
test("bond watch pins TLT first and explicitly does not infer it is owned",()=>{
 assert(isBondEtf("TLT"));
 assert(BOND_ETFS.has("IEF")&&BOND_ETFS.has("SGOV"));
 const b=bondWatch([{...tlt,ticker:"IEF"},{...tlt},{...tlt,ticker:"SGOV"}],q);
 assert.equal(b[0].ticker,"TLT");
 assert.equal(b[0].quote.close,81.96);
 assert.equal(b[0].watchLow,null);
 assert.equal(b[0].macroState,"MIXED");
 assert.equal(b.length,3);
});
test("all holdings remain visible independently from investment ideas",()=>{
 const holdings=recordedHoldings(snapshot,q);
 assert.deepEqual(holdings.map(x=>x.ticker),["XOM"]);
 assert.equal(holdings[0].quantity,10);
 assert.equal(holdings[0].quote.close,154);
 assert.equal(recordedHoldings({holdings:[]},q).length,0);
});
test("owner coverage includes holdings, saved watchlist, research bonds and 98-style market tape",()=>{
 const base=[
  {ticker:"XOM",name:"ExxonMobil",held:true,onWatchlist:false,quantity:10},
  {ticker:"MU",name:"Micron",held:false,onWatchlist:true,quantity:null}
 ];
 const output=expandMarketRows(base,[tlt],tape,q);
 const byTicker=new Map(output.map(x=>[x.ticker,x]));
 assert.equal(byTicker.get("XOM").held,true);
 assert.equal(byTicker.get("MU").onWatchlist,true);
 assert.equal(byTicker.get("TLT").ideaTracked,true);
 assert.equal(byTicker.get("TLT").held,false);
 assert.equal(byTicker.get("TLT").marketTracked,true);
 assert.equal(byTicker.get("TLT").marketOnly,false);
 assert.equal(byTicker.get("TLT").close,81.96);
 assert.equal(byTicker.get("SMH").marketOnly,true);
 assert.equal(byTicker.get("SMH").ideaTracked,false);
 assert.equal(output.filter(x=>x.marketTracked).length,tape.rows.length);
});
test("bond ETF names have no hardcoded buy signals or required PEG",()=>{
 const core=read("owner-market-views.mjs"),dashboard=read("owner-decision-desk.mjs");
 assert(!core.includes("ALIGNED")&&!core.includes("BUY"));
 assert(dashboard.includes('recordedHoldings(state.snapshot,state.priceMap)'));
 assert(dashboard.includes('bondWatch(state.ideaRows,state.priceMap)'));
 assert(dashboard.includes('psd-bond-priority')||dashboard.includes("psd-bond-priority"));
 assert(dashboard.includes('const companyIdeas=state.ideaRows.filter(item=>!isBondEtf(item.ticker))'));
 assert(dashboard.includes('Snapshot '));
 assert(dashboard.includes('Not broker-confirmed'));
 assert(dashboard.includes('ideas.html#bonds'));
 assert(dashboard.includes('portfolio.html#holdings'));
});
test("existing sortable market table exposes clear portfolio/market/bond categories",()=>{
 const code=read("owner-portfolio-table.mjs");
 for(const value of ['"holdings"','"watchlist"','"bonds"','"ideas"','"markets"','"My coverage"']){
  assert(code.includes(value),value);
 }
 assert(code.includes('r.onWatchlist||r.ideaTracked'));
 assert(code.includes('r.bond&&(r.ideaTracked||r.onWatchlist||r.held)'));
 assert(code.includes('r.marketTracked'));
 assert(code.includes('ps-sort'));
 assert(code.includes('threeDay')&&code.includes('fiveDay'));
});
test("Bonds tab opens from homepage and research without removing company ideas",()=>{
 const tracker=read("owner-ideas-tracker.mjs"),nav=read("owner-advisor-presentation.mjs");
 assert(tracker.includes('<option value="BONDS">Bond ETFs</option>'));
 assert(tracker.includes('isBondEtf(row.ticker)'));
 assert(tracker.includes('location.hash==="#bonds"'));
 assert(read('owner-portfolio-table.mjs').includes('["bonds","Bond ETFs"]'));
 assert(nav.includes('portfolio.html#holdings'));
});
test("owner-only status is preserved; no names or quantities are shipped publicly",()=>{
 const market=read("owner-market-views.mjs");
 assert(!/sb_secret_|service_role|owner_user_id=|@gmail\.com/i.test(market));
 const home=read("owner-decision-desk.mjs");
 assert(home.includes('db.from("power_stack_owner_snapshots")'));
 assert(home.includes('.eq("owner_user_id",user.id)'));
 assert(!home.includes('const hardcodedHoldings='));
});

import {applyOwnerCloseObservations} from "../owner-portfolio-table.mjs";
test("Portfolio uses newer source-qualified private closes without mixing return dates or modifying holdings",()=>{
 const now=new Date("2026-11-24T04:00:00Z"),base=[{ticker:"EXAMPLE",held:true,quantity:12,currency:"USD",session:"2026-11-20",close:100,day:1,threeDay:2,fiveDay:3},{ticker:"PUBLIC",marketOnly:true,currency:"USD",session:"2026-11-20",close:50}];
 const q={ticker:"EXAMPLE",observed_on:"2026-11-23",price:105,currency:"USD",source_name:"Finnhub / US regular close",source_url:"https://finnhub.io/docs/api",timestamp_basis:"source_observation",ingested_at:"2026-11-23T22:00:00Z"};
 const out=applyOwnerCloseObservations(base,[q,{...q,ticker:"PUBLIC",price:60},{...q,price:999,currency:"EUR"}],now);
 assert.equal(out.count,1);assert.equal(out.lines[0].close,105);assert.equal(out.lines[0].quantity,12);assert.equal(out.lines[0].day,null);assert.equal(out.lines[0].threeDay,null);assert.equal(out.lines[0].session,"2026-11-23");assert.equal(out.lines[1].close,50);
 for(const bad of [{...q,source_url:"https://example.com/"},{...q,timestamp_basis:"retrieved_at"},{...q,observed_on:"2026-11-25"},{...q,observed_on:"2026-11-01"}])assert.equal(applyOwnerCloseObservations(base,[bad],now).count,0);
 assert(read("owner-portfolio-table.mjs").includes('db.from("power_stack_quote_observations")'));assert(read("owner-portfolio-table.mjs").includes('.eq("owner_user_id",user.id).gte("observed_on"'));
});
