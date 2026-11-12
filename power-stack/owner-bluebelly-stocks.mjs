/** Public Bluebelly stock research status only. No accounts or investment orders.
 * Bluebelly owns macro/news context; Power Stack independently owns owner choices
 * and its exchange-close Yahoo research tape. Never insert these prices into that tape.
 */
export const BB_STOCK_COVERAGE_URL="https://bluebelly-desk.vercel.app/api/markets/stocks";
const REGIONS=new Set(["US","EU"]);
const SOURCES=new Set(["SOURCE_DATED","MONITORED_UNAVAILABLE"]);
const MONEY=new Set(["USD","EUR","DKK"]);
const VENUES={
 EU:{AS:["EUR","Europe/Amsterdam"],DE:["EUR","Europe/Berlin"],
  PA:["EUR","Europe/Paris"],CO:["DKK","Europe/Copenhagen"]},
};
export function validateBluebellyStockCoverage(data,now=new Date()){
 if(data?.contractVersion!=="bluebelly-equity-coverage/1"||
  data?.source!=="Bluebelly public market monitor"||
  !Array.isArray(data.rows)||data.rows.length!==37||
  !data.coverage||data.coverage.tracked!==37||
  data.coverage.US!==25||data.coverage.EU!==12)return null;
 const seen=new Set();const rows=[];
 for(const row of data.rows){
  if(!row||typeof row.ticker!=="string"||
   !/^[A-Z0-9-]{1,12}(?:\.(?:AS|DE|PA|CO))?$/.test(row.ticker)||
   seen.has(row.ticker)||!REGIONS.has(row.region)||!SOURCES.has(row.status)||
   !MONEY.has(row.currency)||typeof row.company!=="string"||
   row.company.length<1||row.company.length>110) return null;
  if(row.region==="EU"){
   const extension=row.ticker.split(".")[1];
   const expected=VENUES.EU[extension];
   if(!expected||row.currency!==expected[0]||row.timeZone!==expected[1])return null;
  }else if(row.currency!=="USD"||row.ticker.includes(".")||
   row.timeZone!=="America/New_York")return null;
  if(row.status==="SOURCE_DATED"){
   const stamp=Date.parse(row.asOf+"T00:00:00Z");
   const age=now.getTime()-stamp;
   if(!Number.isFinite(stamp)||age<0||age>8*86400000||
    !Number.isFinite(row.price)||row.price<=0||
    (row.changePct!==null&&!Number.isFinite(row.changePct))||
    typeof row.sourceUrl!=="string")return null;
   try{const u=new URL(row.sourceUrl);
    if(u.protocol!=="https:"||u.username||u.password||
      !["finance.yahoo.com","www.nasdaq.com"].includes(u.hostname))return null;
   }catch{return null;}
  }else if(row.price!==null||row.changePct!==null||row.asOf!==null||
    row.sourceUrl!==null)return null;
  seen.add(row.ticker);
  rows.push({ticker:row.ticker,company:row.company,region:row.region,
   currency:row.currency,status:row.status,asOf:row.asOf,price:row.price,
   changePct:row.changePct});
 }
 const us=rows.filter(x=>x.region==="US"),eu=rows.filter(x=>x.region==="EU");
 const sourceDated=rows.filter(x=>x.status==="SOURCE_DATED").length;
 if(us.length!==25||eu.length!==12||data.coverage.sourceDated!==sourceDated||
  data.coverage.unavailable!==37-sourceDated)return null;
 return {source:"Bluebelly",rows,US:{tracked:25,dated:us.filter(x=>x.status==="SOURCE_DATED").length},
  EU:{tracked:12,dated:eu.filter(x=>x.status==="SOURCE_DATED").length},
  generatedAt:data.generatedAt};
}
/** Source health must degrade to offline rather than masquerade as zero change. */
export async function loadBluebellyStockCoverage(fetcher=fetch,now=new Date()){
 try{
  const r=await fetcher(BB_STOCK_COVERAGE_URL,{cache:"no-store",mode:"cors"});
  if(!r.ok)return null;
  return validateBluebellyStockCoverage(await r.json(),now);
 }catch{return null;}
}
