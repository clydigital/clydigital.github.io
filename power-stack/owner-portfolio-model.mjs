/** Pure, offline Power Stack owner-ledger helpers. No browser/network/keys. */
export const ENTRY_TYPES=Object.freeze([
 "OPENING_POSITION","OPENING_CASH","BUY","SELL","DIVIDEND",
 "DEPOSIT","WITHDRAWAL","FEE","ADJUSTMENT"
]);
const SYMBOL=/^[A-Z0-9][A-Z0-9._:-]{0,19}$/;
const CCY=/^[A-Z]{3}$/;
const finite=x=>typeof x==="number"&&Number.isFinite(x);
const validDay=s=>typeof s==="string"&&/^\d{4}-\d\d-\d\d$/.test(s)&&
  !Number.isNaN(Date.parse(s+"T00:00:00Z"))&&new Date(s+"T00:00:00Z").toISOString().startsWith(s);
const round=(v,p)=>Number(v.toFixed(p));
export function normalizeEntry(source){
 if(!source||typeof source!=="object")throw Error("Entry missing");
 const kind=String(source.entry_type||"").trim();
 const symbol=String(source.symbol||"").trim().toUpperCase()||null;
 const currency=String(source.currency||"").trim().toUpperCase();
 const qty=Number(source.quantity_delta??0),cash=Number(source.cash_delta??0);
 const price=source.unit_price===""||source.unit_price==null?null:Number(source.unit_price);
 const note=String(source.note||"").trim()||null;
 const occurred=source.occurred_on;
 if(!ENTRY_TYPES.includes(kind)||!CCY.test(currency)||!validDay(occurred)||
   !finite(qty)||!finite(cash)||Math.abs(qty)>1e9||Math.abs(cash)>1e11||
   (price!==null&&(!finite(price)||price<=0||price>1e9))||
   (symbol&&!SYMBOL.test(symbol))||(note&&note.length>280))
   throw Error("Invalid type, date, currency, symbol or amount");
 if(kind==="OPENING_POSITION"&&!(symbol&&qty>0&&cash===0))throw Error("Opening position needs positive units and no cash movement");
 if(kind==="OPENING_CASH"&&!(symbol===null&&qty===0&&cash>0&&price===null))throw Error("Opening cash needs positive cash movement and no symbol");
 if(kind==="BUY"&&!(symbol&&qty>0&&cash<0&&price>0))throw Error("Buy needs positive units, negative settlement cash and unit price");
 if(kind==="SELL"&&!(symbol&&qty<0&&cash>0&&price>0))throw Error("Sell needs negative units, positive settlement cash and unit price");
 if(kind==="DIVIDEND"&&!(symbol&&qty===0&&cash>0&&price===null))throw Error("Dividend needs a symbol and positive cash");
 if(kind==="DEPOSIT"&&!(symbol===null&&qty===0&&cash>0&&price===null))throw Error("Deposit needs positive cash");
 if(kind==="WITHDRAWAL"&&!(symbol===null&&qty===0&&cash<0&&price===null))throw Error("Withdrawal needs negative cash");
 if(kind==="FEE"&&!(qty===0&&cash<0&&price===null))throw Error("Fee needs negative cash");
 if(kind==="ADJUSTMENT"&&!(qty!==0||cash!==0)||kind==="ADJUSTMENT"&&(!note||note.length<8||price!==null))
   throw Error("Adjustment requires a meaningful note and nonzero units or cash");
 if(!["BUY","SELL"].includes(kind)&&price!==null&&kind!=="OPENING_POSITION")
   throw Error("Only trades may record a unit price");
 if(kind==="OPENING_POSITION"&&price!==null)throw Error("Opening position price is not a verified cost basis");
 return {occurred_on:occurred,entry_type:kind,symbol,currency,
   quantity_delta:round(qty,8),cash_delta:round(cash,4),
   unit_price:price===null?null:round(price,8),
   note,source_kind:"MANUAL_SELF_REPORTED"};
}
/** Movement arithmetic only; a ledger is not broker reconciliation. */
export function ledgerSummary(rows){
 if(!Array.isArray(rows))throw Error("Ledger response invalid");
 const positions=new Map(),cash=new Map(),openingCcy=new Set(),openingPositions=new Set();
 const issues=[];
 for(const row of rows){
  let e;
  try{e=normalizeEntry(row)}catch {issues.push("INVALID_ENTRY_EXCLUDED");continue}
  if(e.symbol&&e.quantity_delta!==0){
   const k=e.symbol+"|"+e.currency;
   positions.set(k,round((positions.get(k)||0)+e.quantity_delta,8));
   if(e.entry_type==="OPENING_POSITION")openingPositions.add(k);
  }
  cash.set(e.currency,round((cash.get(e.currency)||0)+e.cash_delta,4));
  if(e.entry_type==="OPENING_CASH")openingCcy.add(e.currency);
 }
 const holdings=[...positions].map(([key,units])=>{
   const [symbol,currency]=key.split("|");
   if(units<0)issues.push("NEGATIVE_UNITS:"+symbol);
   return {symbol,currency,units,hasOpeningPosition:openingPositions.has(key),
     status:openingPositions.has(key)?"MANUAL_BASELINE_UNVERIFIED":"MOVEMENTS_ONLY_NOT_CURRENT_HOLDING"};
 }).sort((a,b)=>a.symbol.localeCompare(b.symbol));
 const cashByCurrency=[...cash].map(([currency,change])=>({
  currency,change,hasOpeningCash:openingCcy.has(currency),
  provisionalBalance:openingCcy.has(currency)?change:null,
  status:openingCcy.has(currency)?"MANUAL_BASELINE_UNVERIFIED":"MOVEMENTS_ONLY_NO_CASH_BALANCE"
 })).sort((a,b)=>a.currency.localeCompare(b.currency));
 return {entryCount:rows.length,holdings,cashByCurrency,issues:[...new Set(issues)],
   positionsBrokerVerified:false,cashBrokerVerified:false,
   buyingPowerMyr:null,navMyr:null,realisedPnlMyr:null};
}
const HORIZONS=["Q1_2027","END_2027","LONG_TERM"];
/** Client-side preview of a private, manually selected Step-5 report. Never persists. */
export function parsePrivateResearch(value){
 if(value?.contractVersion!=="power-stack-three-horizon-underwriting/v1"||
    typeof value.ticker!=="string"||!SYMBOL.test(value.ticker)||
    value.publicPagesEligible!==false||value.changesExistingScores!==false||
    value.placesOrders!==false||value.callsVercel!==false||
    !value.horizonAssessments||typeof value.horizonAssessments!=="object")
    throw Error("Not an eligible private Step-5 research ticket");
 return {
   ticker:value.ticker,createdAt:typeof value.createdAt==="string"?value.createdAt:null,
   state:"PRIVATE_RESEARCH_PREVIEW_ONLY",
   horizons:HORIZONS.map(key=>{
     const h=value.horizonAssessments[key];
     if(!h||typeof h!=="object")throw Error("Missing horizon "+key);
     const score=h.assessmentScore;
     if(score!==null&&(!finite(score)||score<0||score>100))
       throw Error("Invalid horizon score");
     return {key,label:key==="Q1_2027"?"Q1 2027":key==="END_2027"?"End-2027":"2–5+ years",
       score,reviewStatus:h.status==="READY_FOR_HUMAN_ALLOCATION_REVIEW"&&score!==null?
        "RESEARCH_READY_NOT_TRADE":"NOT_SCORED",
       gapCount:Array.isArray(h.gaps)?h.gaps.length:0,
       confirmation:typeof h.confirmation==="string"?h.confirmation.slice(0,250):null,
       invalidation:typeof h.invalidation==="string"?h.invalidation.slice(0,250):null};
   })
 };
}
