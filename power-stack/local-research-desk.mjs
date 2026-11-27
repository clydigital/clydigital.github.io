import {readEdition,mountInvestmentIntelligence} from "./owner-investment-intelligence.mjs?v=20261127-industry1-dwm1";
export const LOCAL_KEY="ps-local-research-edition/1";
const node=(tag,txt)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;return n};
export function readLocalCopy(storage){try{return readEdition(storage.getItem(LOCAL_KEY));}catch{return null}}
export function offerLocalCopy(content,edition){
 const p=readEdition(edition);if(!p)return;const box=node("section");box.className="ps-local-copy-control";
 const title=node("h3","Use this research desk without signing in");const note=node("p","Optional: keep a read-only copy of this manual research edition on this browser. It may include private research judgments and is readable by anyone using this browser profile. No portfolio ledger, private page HTML or credentials are copied. Do not save on a shared device. The copy will not update until you save a newer edition.");
 const save=node("button","Save research edition on this browser");save.type="button";const status=node("p");status.setAttribute("role","status");
 save.addEventListener("click",()=>{try{localStorage.setItem(LOCAL_KEY,JSON.stringify(p));status.textContent="Saved "+p.asOf+". You can now open the research desk without signing in.";}catch{status.textContent="Local storage unavailable or full; no copy saved."}});
 const clear=node("button","Remove local copy");clear.type="button";clear.addEventListener("click",()=>{try{localStorage.removeItem(LOCAL_KEY);status.textContent="Local copy removed."}catch{status.textContent="Unable to remove local copy."}});
 box.append(title,note,save,clear,status);content.prepend(box);
}
export function mountLocalCopy(host,storage=localStorage){
 host.replaceChildren();const p=readLocalCopy(storage);
 if(!p){host.append(node("p","No saved research edition on this browser. The market desk below is available without sign-in. To keep the latest private research edition here, unlock protected records once and save a local copy."));const a=node("a","Unlock protected records / save a local copy →");a.href="index.html?unlock=1";host.append(a);return;}
 const notice=node("p","Browser-local read-only edition · "+p.asOf+" · not refreshed from the private database. Market data below is separate. Verify the date before acting.");host.append(notice);
 const clear=node("button","Remove this browser copy");clear.type="button";clear.addEventListener("click",()=>{try{storage.removeItem(LOCAL_KEY);mountLocalCopy(host,storage);}catch{notice.textContent="Unable to remove local copy."}});host.append(clear);
 const view=node("div");host.append(view);mountInvestmentIntelligence("index",view,p);
}
