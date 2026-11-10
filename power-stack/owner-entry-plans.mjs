// Generic owner-only research-note parser and entry alert states.
// Notes are authenticated Supabase data; public source contains NO private idea lists.
import {freshDate} from "./owner-ideas-core.mjs";
export const ENTRY_CONTRACT="power-stack-provisional-entry-research/1";
export function parseEntryPlan(note){
 const text=String(note||"").slice(0,800);
 const out={priority:"UNRANKED",thesis:"",entry:"",invalidation:"",catalyst:"",basis:""};
 for(const piece of text.split(/\s+\|\s+(?=(?:PRIORITY|THESIS|ENTRY|INVALIDATION|CATALYST|ZONE BASIS):)/i)){
  const match=piece.match(/^(PRIORITY|THESIS|ENTRY|INVALIDATION|CATALYST|ZONE BASIS):\s*(.*)$/i);
  if(!match)continue;
  const key=match[1].toUpperCase();
  const mapped={"PRIORITY":"priority","THESIS":"thesis","ENTRY":"entry","INVALIDATION":"invalidation","CATALYST":"catalyst","ZONE BASIS":"basis"}[key];
  if(mapped)out[mapped]=match[2].trim().slice(0,320);
 }
 if(!["HIGH","MEDIUM","WATCH"].includes(out.priority))out.priority="UNRANKED";
 return out;
}
const positive=n=>n!==null&&n!==undefined&&n!==""&&Number.isFinite(Number(n))&&Number(n)>0?Number(n):null;
export function entryAlert(idea,quote,now=new Date()){
 const plan=parseEntryPlan(idea?.note),price=positive(quote?.close),
  low=positive(idea?.watch_low),high=positive(idea?.watch_high);
 const zone=low!==null&&high!==null&&high>=low;
 let status="CATALYST_GATE",label="Await research catalyst",detail="An entry condition has not been price-confirmed.";
 let distance=null;
 if(!price||!quote?.session){status="PRICE_UNAVAILABLE";label="Verify latest close";detail="No source-qualified recent completed session."}
 else if(!freshDate(quote.session,7,now)){status="PRICE_STALE";label="Old close — refresh";detail="Source date is older than seven calendar days; no price-based alert can be trusted."}
 else if(quote.currency&&idea?.currency&&quote.currency!==idea.currency){
  status="PRICE_MISMATCH";label="Currency mismatch — verify";detail="Price feed currency and research-zone currency disagree; compare only after manual reconciliation.";
 }
 else if(!zone){status="CATALYST_GATE";label="Wait for confirmation";detail="No reviewed numeric alert range."}
 else if(price<low){status="BELOW_ALERT";label="Below range — recheck thesis";detail="Price weakness is not automatically a bargain.";distance=100*(price-low)/low}
 else if(price<=high){status="IN_ALERT";label="Alert range — review only";detail="An alert is NOT an approved entry; apply the thesis and catalyst gates.";distance=0}
 else{status="WAIT_RETRACE";label="Wait for price / catalyst";detail="Current price exceeds the provisional alert band.";distance=100*(price-high)/high}
 return {...plan,status,label,detail,price,low,high,hasZone:zone,distance,session:quote?.session||null,
  currency:quote?.currency||idea?.currency||"USD",day:quote?.day??null,fiveDay:quote?.fiveDay??null};
}
const priorityRank={HIGH:0,MEDIUM:1,WATCH:2,UNRANKED:3};
const statusRank={IN_ALERT:0,WAIT_RETRACE:1,CATALYST_GATE:2,BELOW_ALERT:3,PRICE_UNAVAILABLE:4,PRICE_STALE:5,PRICE_MISMATCH:6};
export function rankEntryIdeas(ideas,priceMap,now=new Date()){
 return (Array.isArray(ideas)?ideas:[]).map(idea=>({...idea,entryAlert:entryAlert(idea,priceMap?.get(idea.ticker),now)}))
 .sort((a,b)=>(priorityRank[a.entryAlert.priority]??3)-(priorityRank[b.entryAlert.priority]??3)
  ||(statusRank[a.entryAlert.status]??5)-(statusRank[b.entryAlert.status]??5)
  ||Math.abs(a.entryAlert.distance??999)-Math.abs(b.entryAlert.distance??999)
  ||a.ticker.localeCompare(b.ticker));
}
