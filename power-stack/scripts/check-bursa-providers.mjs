#!/usr/bin/env node
// Provider credentials are supplied only in the trusted Actions runner.
// No raw responses, prices, credentials, private membership or portfolio records are written to logs, artifacts or public files.
// The existing independently sourced public quote tape is deliberately unchanged.
import {readFileSync} from "node:fs";
import {setTimeout as sleep} from "node:timers/promises";
const ROOT=new URL("../",import.meta.url);
const manifest=JSON.parse(readFileSync(new URL("market-symbols.json",ROOT),"utf8"));
const stocks=manifest.symbols.filter(x=>x.currency==="MYR"&&/^\d{4}\.KL$/.test(x.providerSymbol)&&x.timeZone==="Asia/Kuala_Lumpur");
const dayParts=(stamp)=>Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kuala_Lumpur",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",hourCycle:"h23",weekday:"short"}).formatToParts(new Date(stamp)).map(x=>[x.type,x.value]));
const day=p=>p.year+"-"+p.month+"-"+p.day;
const now=dayParts(Date.now());
const complete=d=>d<day(now)||(d===day(now)&&Number(now.hour)>=18&&!["Sat","Sun"].includes(now.weekday));
async function json(url,headers){
 const r=await fetch(url,{headers:{Accept:"application/json",...headers},signal:AbortSignal.timeout(12000),redirect:"error"});
 if(!r.ok)return {status:r.status};
 try{return {status:r.status,data:await r.json()};}catch{return {status:r.status,invalid:true};}
}
async function cedar(){
 const key=process.env.DATACEDAR_API_KEY;
 if(!key){console.log("DataCedar: KEY_MISSING");return;}
 let authOK=0,verified=0,old=0,empty=0,failed=0;
 for(const spec of stocks){
  const sid="klse:"+spec.providerSymbol.slice(0,4);
  const url="https://api.datacedar.com/v3/stocks/"+encodeURIComponent(sid)+"/bars?timeframe=1d&adjustment=raw&order=desc&limit=30";
  try{
   const r=await json(url,{"X-API-Key":key});
   if(r.status===401||r.status===403||r.status===402||r.status===429){console.log("DataCedar: HTTP "+r.status+"; stopping bounded probe");failed++;break;}
   if(r.status!==200||r.invalid||!Array.isArray(r.data?.data)){failed++;}
   else{
    authOK++;
    if(r.data.data.length===0){empty++;}
    else if(r.data.meta?.sid?.toLowerCase()!==sid||r.data.meta?.currency!=="MYR"||r.data.meta?.timezone!=="Asia/Kuala_Lumpur"){failed++;}
    else{
     const bars=r.data.data.filter(b=>b.sid?.toLowerCase()===sid&&b.timeframe==="1Day"&&b.adjustment==="raw"&&Number.isFinite(Number(b.ts_ms))&&Number(b.ts_ms)>0&&Number.isFinite(b.close)&&b.close>0).map(b=>day(dayParts(Number(b.ts_ms)))).filter(complete).sort();
     const last=bars.at(-1);
     if(!last)empty++;
     else {let age=0;for(let t=Date.parse(last+"T00:00:00Z")+86400000;t<=Date.parse(day(now)+"T00:00:00Z");t+=86400000){const w=new Date(t).getUTCDay();if(w!==0&&w!==6)age++;}if(age<=1)verified++;else old++;}
    }
   }
  }catch{failed++;}
  await sleep(1250);
 }
 console.log("DataCedar: "+JSON.stringify({requested:stocks.length,authenticatedResponses:authOK,latestCompletedSessionWithinOneBusinessDay:verified,olderHistory:old,empty,failed}));
}
async function oanor(){
 const key=process.env.OANOR_API_KEY;
 if(!key){console.log("Oanor: KEY_MISSING");return;}
 // Public neutral catalogue only; never send account or private holdings metadata.
 const codes=stocks.map(x=>x.ticker);
 if(!codes.length){console.log("Oanor: EMPTY_PUBLIC_CATALOGUE");return;}
 try{
  const r=await json("https://api.oanor.com/klse-api/v1/kl/quote-csv?codes="+encodeURIComponent(codes.join(",")),{"x-oanor-key":key});
  if(r.status!==200||r.invalid){console.log("Oanor: HTTP "+r.status+" or invalid JSON");return;}
  const csv=r.data?.data?.csv;
  const header=typeof csv==="string"?csv.split(/\r?\n/,1)[0].toLowerCase():"";
  const count=r.data?.data?.rows;
  const valid=r.data?.success===true&&header.includes("ticker")&&header.includes("price")&&Number.isInteger(count)&&count>=0;
  console.log("Oanor: "+JSON.stringify({authenticatedResponse:valid,requested:codes.length,returned:valid?count:0,sessionDatePresent:false,eligibleAsClose:false}));
 }catch{console.log("Oanor: REQUEST_FAILED");}
}
await cedar();await oanor();
