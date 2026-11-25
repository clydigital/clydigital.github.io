/** Bluebelly's public, dynamic equity universe. No owner membership or orders.
 * Coverage is distinct from a completed investment case. Never write this into
 * the legacy independent feed; retire that feed only after parity verification.
 */
export const BB_STOCK_COVERAGE_URL="https://bluebelly-desk.vercel.app/api/markets/stocks";
const REGIONS=new Set(["US","EU","ASIA"]);
const MONEY=new Set(["USD","EUR","DKK","MYR","KRW","TWD","HKD","CNY","GBP","JPY","SGD","CHF","CAD","AUD","NOK","SEK","INR"]);
const STATES=new Set(["SOURCE_DATED","MONITORED_UNAVAILABLE"]);
const finite=x=>typeof x==="number"&&Number.isFinite(x);
function validZone(x){try{new Intl.DateTimeFormat("en",{timeZone:x});return typeof x==="string"&&!!x}catch{return false}}
function url(x){try{const u=new URL(x);return u.protocol==="https:"&&!u.username&&!u.password&&["finance.yahoo.com","www.nasdaq.com","massive.com","www.massive.com","polygon.io","www.polygon.io"].includes(u.hostname)?u.href:null}catch{return null}}
function date(x){if(typeof x!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(x))return null;const t=Date.parse(x+"T00:00:00Z");return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===x?t:null}
export function validateBluebellyStockCoverage(data,now=new Date()){
 if(data?.contractVersion!=="bluebelly-equity-coverage/1"||data?.source!=="Bluebelly public market monitor"||!Array.isArray(data.rows)||!data.rows.length||!data.coverage||data.coverage.tracked!==data.rows.length)return null;
 const seen=new Set(),rows=[],counts={US:0,EU:0,ASIA:0};let reportedDated=0;
 for(const r of data.rows){
  if(!r||typeof r.ticker!=="string"||!/^[A-Z0-9][A-Z0-9.:-]{0,29}$/.test(r.ticker)||seen.has(r.ticker)||!REGIONS.has(r.region)||!MONEY.has(r.currency)||!STATES.has(r.status)||typeof r.company!=="string"||!r.company.trim()||!validZone(r.timeZone))return null;
  if(r.region==="US"&&(r.currency!=="USD"||r.timeZone!=="America/New_York"))return null;
  if(r.region==="EU"&&(!["EUR","DKK","GBP","CHF","NOK","SEK"].includes(r.currency)||!r.timeZone.startsWith("Europe/")))return null;
  if(r.region==="ASIA"&&(!["MYR","KRW","TWD","HKD","CNY","JPY","SGD","INR","AUD"].includes(r.currency)||!(/^(Asia|Australia)\//.test(r.timeZone))))return null;
  seen.add(r.ticker);counts[r.region]++;
  const dated=r.status==="SOURCE_DATED";if(dated)reportedDated++;
  const stamp=date(r.asOf),source=url(r.sourceUrl);
  const fresh=dated&&stamp!==null&&now.getTime()-stamp>=0&&now.getTime()-stamp<=8*86400000&&finite(r.price)&&r.price>0&&!!source;
  // Invalid or expired observations are explicitly unavailable, not flat moves.
  const scan=fresh&&r.emaScan?.asOf===r.asOf&&r.theme!=="REAL_ESTATE"?r.emaScan:null;
  rows.push({ticker:r.ticker,company:r.company,region:r.region,exchange:r.exchange??null,timeZone:r.timeZone,currency:r.currency,theme:r.theme??null,priority:r.priority??null,status:fresh?"SOURCE_DATED":"MONITORED_UNAVAILABLE",asOf:fresh?r.asOf:null,price:fresh?r.price:null,changePct:fresh&&finite(r.changePct)?r.changePct:null,change3dPct:fresh&&finite(r.change3dPct)?r.change3dPct:null,change5dPct:fresh&&finite(r.change5dPct)?r.change5dPct:null,sourceUrl:fresh?source:null,sourceName:fresh?r.sourceName??null:null,emaScan:scan,unavailableReason:fresh?null:dated?"INVALID_OR_STALE_OBSERVATION":"PROVIDER_UNAVAILABLE"});
 }
 for(const k of REGIONS)if((data.coverage[k]??0)!==counts[k])return null;
 if(data.coverage.sourceDated!==reportedDated||data.coverage.unavailable!==rows.length-reportedDated)return null;
 const regions=Object.fromEntries([...REGIONS].map(k=>[k,{tracked:counts[k],dated:rows.filter(r=>r.region===k&&r.status==="SOURCE_DATED").length}]));
 const dated=rows.filter(r=>r.status==="SOURCE_DATED").length;
 return {source:"Bluebelly",rows,...regions,coverage:{tracked:rows.length,sourceDated:dated,unavailable:rows.length-dated},generatedAt:data.generatedAt};
}
export async function loadBluebellyStockCoverage(fetcher=fetch,now=new Date()){
 try{const r=await fetcher(BB_STOCK_COVERAGE_URL,{cache:"no-store",mode:"cors"});if(!r.ok)return null;return validateBluebellyStockCoverage(await r.json(),now)}catch{return null}
}
