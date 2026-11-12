import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 RADAR_CONTRACT,RESEARCH_ASOF,MARKET_THEMES,SCENARIOS,
 stockAssessment,combineImpacts,scenarioPair
} from "../owner-radar-workspace.mjs";
const root=new URL("../",import.meta.url);
const read=file=>readFileSync(new URL(file,root),"utf8");
const now=new Date("2026-11-12T12:00:00Z");
function owner(action,mod={}){
 return {created_at:mod.created_at||"2026-11-12T01:00:00Z",
  ticket:{as_of:mod.as_of||"2026-11-12T00:00:00Z",
   subject:{instrument_id:mod.ticker||"GOOGL"},
   recommendation:{action,decision_state:mod.state||"READY_FOR_OWNER_REVIEW"},
   review:{review_by:mod.review_by||"2026-11-19",risk_override:mod.risk_override||false}
  }};
}
test("radar contracts link the entire defined market universe once and preserve market theme separation",()=>{
 assert.equal(RADAR_CONTRACT,"power-stack-radar-workspace/1");
 const manifest=JSON.parse(read("market-symbols.json"));
 const all=MARKET_THEMES.flatMap(theme=>theme.tickers);
 assert.equal(new Set(all).size,all.length,"No ticker should be shown in two mutually exclusive primary themes");
 for(const t of manifest.symbols)assert(all.includes(t.ticker),"Missing primary theme: "+t.ticker);
 assert(MARKET_THEMES.length>=8);
 assert(!read("owner-radar-workspace.mjs").includes("sb_secret_"));
});
test("scenario impact schema is complete and Bluebelly sourced without fake probabilities",()=>{
 assert.match(RESEARCH_ASOF,/^20\d\d-\d\d-\d\d$/);
 const known=new Set(["up","down","mixed","neutral","unknown"]);
 for(const s of SCENARIOS){
  assert(s.id&&s.name&&s.premise&&s.test&&s.falsifier);
  assert(s.source.startsWith("https://bluebelly-desk.vercel.app/"),s.id);
  assert.deepEqual(Object.keys(s.impact).sort(),MARKET_THEMES.map(x=>x.id).sort(),s.id);
  for(const effect of Object.values(s.impact))assert(known.has(effect),s.id);
  assert(!Object.hasOwn(s,"probability"),"Scenario must not claim probability");
 }
 assert(SCENARIOS.length>=9);
});
test("two scenarios combine only as qualitative directions, with conflicting families withheld",()=>{
 assert.equal(combineImpacts("up","up"),"up");
 assert.equal(combineImpacts("up","down"),"mixed");
 assert.equal(combineImpacts("neutral","down"),"down");
 assert.equal(combineImpacts(null,null),"unknown");
 assert.equal(scenarioPair("oil-escalation","oil-reopening").compatible,false);
 assert.equal(scenarioPair("hot-inflation","rates-relief").compatible,false);
 assert.equal(scenarioPair("equity-stress","equity-recovery").compatible,false);
 assert.equal(scenarioPair("ai-financing","ai-monetisation").compatible,false);
 assert.equal(scenarioPair("oil-escalation","hot-inflation").compatible,true);
 assert.equal(scenarioPair("missing","hot-inflation").compatible,false);
});
test("buy/sell considerations require an explicit current reviewed owner decision",()=>{
 assert.equal(stockAssessment("GOOGL",[],now).status,"WATCH");
 assert.equal(stockAssessment("GOOGL",[owner("BUY_STARTER")],now).status,"CONSIDER BUY");
 assert.equal(stockAssessment("GOOGL",[owner("ADD_IF_CONFIRMED")],now).status,"CONSIDER BUY");
 assert.equal(stockAssessment("GOOGL",[owner("TRIM")],now).status,"CONSIDER SELL");
 assert.equal(stockAssessment("GOOGL",[owner("SELL_REVIEW")],now).status,"CONSIDER SELL");
 assert.equal(stockAssessment("GOOGL",[owner("WAIT")],now).status,"WATCH");
 assert.equal(stockAssessment("GOOGL",[owner("BUY_STARTER",{state:"WAITING_FOR_TRIGGER"})],now).status,"WATCH");
 assert.equal(stockAssessment("GOOGL",[owner("BUY_STARTER",{review_by:"2026-11-01"})],now).status,"WATCH");
 assert.equal(stockAssessment("GOOGL",[owner("BUY_STARTER",{risk_override:true})],now).status,"WATCH");
 assert.equal(stockAssessment("GOOGL",[owner("BUY_STARTER",{as_of:"2026-09-01T00:00:00Z"})],now).status,"WATCH");
 assert.equal(stockAssessment("NVDA",[owner("BUY_STARTER")],now).status,"WATCH");
});
test("authenticated entry keeps existing private research and uses no modelled trading orders",()=>{
 const home=read("owner-decision-desk.mjs"),gate=read("auth-gate.mjs");
 const radar=read("owner-radar-workspace.mjs"),css=read("owner-radar-workspace.css"),html=read("index.html");
 assert(home.includes("installRadarWorkspace(main,()=>state)"));
 assert(gate.indexOf("const user=await authenticate()")<gate.indexOf('if(PAGE==="index")'));
 assert(html.includes('owner-radar-workspace.css?v=20261112-rad1'));
 assert(html.includes('owner-hybrid-ocean.css'));
 assert(radar.includes("ENTER THE RADAR")&&radar.includes("Scenario Matrix"));
 assert(radar.includes("threeDay")&&radar.includes("fiveDay")&&radar.includes("sourceDate"));
 assert(radar.includes("psr-legacy")&&radar.includes("originals"));
 assert(css.includes("psr-clockwise")&&css.includes("prefers-reduced-motion:reduce"));
 assert(css.includes("psr-landing-active"));
 assert(!/placeOrder|createOrder|borrowApproved|cash_delta|brokerQuantity|service_role|sb_secret_/i.test(radar+css));
});
test("main research cards do not display EMA band position or automatic technical trade verdict",()=>{
 const full=read("owner-opportunity-terminal.mjs");
 assert(!full.includes('make("section","pso-band")'));
 assert(!full.includes('DAILY 20 EMA ±1SD'));
 assert(!full.includes('state.status),make("span"'));
 assert(full.includes('WATCH — RESEARCH ONLY'));
});
