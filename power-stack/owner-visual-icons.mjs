/* Neutral icon primitives. Inline, accessible, and free of remote dependencies.
 * These shapes encode UI semantics only; no investor membership or account data.
 */
const NS="http://www.w3.org/2000/svg";
export const PS_ICON_SHAPES=Object.freeze({
 compass:[["circle",{cx:12,cy:12,r:9}],["polyline",{points:"16.3 7.7 13.6 13.6 7.7 16.3 10.4 10.4 16.3 7.7"}]],
 target:[["circle",{cx:12,cy:12,r:9}],["circle",{cx:12,cy:12,r:5}],["circle",{cx:12,cy:12,r:1}]],
 shield:[["path",{d:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"}],["path",{d:"M12 8v4"}],["circle",{cx:12,cy:16,r:1}]],
 wallet:[["rect",{x:3,y:5,width:18,height:15,rx:2}],["path",{d:"M3 8V5a2 2 0 0 1 2-2h13"}],["path",{d:"M16 13h5"}]],
 landmark:[["path",{d:"m3 10 9-7 9 7M4 10h16M5 21h14M7 10v11M12 10v11M17 10v11"}]],
 clock:[["circle",{cx:12,cy:12,r:9}],["path",{d:"M12 7v5l3 2"}]],
 calendar:[["rect",{x:3,y:5,width:18,height:16,rx:2}],["path",{d:"M7 3v4M17 3v4M3 10h18M8 14h3"}]],
 chart:[["path",{d:"M3 20h18M5 17v-5M10 17V9M15 17V5M20 17V8"}]],
 layers:[["path",{d:"m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"}]],
 book:[["path",{d:"M12 7c-3-2-6-2-9-1v13c3-1 6-1 9 1 3-2 6-2 9-1V6c-3-1-6-1-9 1ZM12 7v13"}]],
 check:[["circle",{cx:12,cy:12,r:9}],["path",{d:"m8 12 3 3 5-6"}]],
 warning:[["path",{d:"m12 3 10 18H2L12 3Z"}],["path",{d:"M12 9v5"}],["circle",{cx:12,cy:18,r:0.8}]],
 trending:[["polyline",{points:"3 17 9 11 13 15 21 7"}],["path",{d:"M15 7h6v6"}]],
 search:[["circle",{cx:11,cy:11,r:7}],["path",{d:"m16 16 5 5"}]],
 filter:[["path",{d:"M3 5h18l-7 8v6l-4 2v-8L3 5Z"}]],
 info:[["circle",{cx:12,cy:12,r:9}],["path",{d:"M12 11v6"}],["circle",{cx:12,cy:7.5,r:.8}]],
 refresh:[["path",{d:"M20 7v5h-5M4 17v-5h5M5 9a8 8 0 0 1 14-2l1 5M4 12l1 5a8 8 0 0 0 14-2"}]],
 arrow:[["path",{d:"M5 12h14m-6-6 6 6-6 6"}]],
 eye:[["path",{d:"M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z"}],["circle",{cx:12,cy:12,r:3}]],
 bolt:[["path",{d:"m13 2-9 12h7l-1 8 10-12h-7l0-8Z"}]],
 scale:[["path",{d:"M12 3v18M5 21h14M4 7h16M5 7l-3 6h6L5 7ZM19 7l-3 6h6l-3-6Z"}]], 
 globe:[["circle",{cx:12,cy:12,r:9}],["path",{d:"M3 12h18M12 3c-5 5-5 13 0 18M12 3c5 5 5 13 0 18M5 7h14M5 17h14"}]],
 cpu:[["rect",{x:5,y:5,width:14,height:14,rx:2}],["rect",{x:9,y:9,width:6,height:6,rx:1}],["path",{d:"M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"}]],
 ship:[["path",{d:"M3 17h18l-3 5H6l-3-5ZM7 17V8h10v9M9 8V4h6v4M2 21c2-1 4-1 6 0s4 1 6 0 4-1 8 0"}]],
 fuel:[["rect",{x:4,y:3,width:11,height:18,rx:2}],["path",{d:"M6 8h7M15 8l4 4v6a2 2 0 0 0 4 0V9l-3-3M5 19h11"}]],
 orbit:[["circle",{cx:12,cy:12,r:2}],["path",{d:"M4 7c4-7 12 1 16 10M20 7C16 0 8 8 4 17M3 12c4 4 14 4 18 0"}]],
 sprout:[["path",{d:"M12 22V11M12 15c-5 0-8-2-8-7 5 0 8 2 8 7ZM12 13c0-5 3-8 8-8 0 5-3 8-8 8Z"}]],
 building:[["rect",{x:4,y:4,width:16,height:18,rx:1}],["path",{d:"M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2M10 22v-4h4v4"}]],
 gem:[["path",{d:"M7 4h10l5 7-10 11L2 11 7 4ZM2 11h20M7 4l5 7 5-7M12 11v11"}]],
 truck:[["rect",{x:2,y:7,width:13,height:11,rx:2}],["path",{d:"M15 10h4l3 4v4h-7M6 18v1M18 18v1"}],["circle",{cx:7,cy:19,r:2}],["circle",{cx:18,cy:19,r:2}]],
 coins:[["circle",{cx:9,cy:10,r:6}],["path",{d:"M5 6h8M5 10h8M12 15c4 0 7 1 7 4s-3 3-7 3-7 0-7-3c0-1 .5-2 2-2.5"}]],
 activity:[["polyline",{points:"2 12 6 12 9 5 14 19 17 12 22 12"}]],
 bars:[["rect",{x:3,y:12,width:4,height:9,rx:1}],["rect",{x:10,y:8,width:4,height:13,rx:1}],["rect",{x:17,y:3,width:4,height:18,rx:1}]],
 network:[["circle",{cx:12,cy:4,r:2}],["circle",{cx:5,cy:19,r:2}],["circle",{cx:19,cy:19,r:2}],["path",{d:"M11 6l-5 11M13 6l5 11M7 19h10"}]]
});
export function psIcon(name,extraClass=""){
 const svg=document.createElementNS(NS,"svg");
 svg.setAttribute("viewBox","0 0 24 24");
 svg.setAttribute("width","20");svg.setAttribute("height","20");
 svg.setAttribute("fill","none");svg.setAttribute("stroke","currentColor");
 svg.setAttribute("stroke-width","1.8");svg.setAttribute("stroke-linecap","round");
 svg.setAttribute("stroke-linejoin","round");
 svg.setAttribute("aria-hidden","true");svg.setAttribute("focusable","false");
 svg.setAttribute("class","psv-icon"+(extraClass?" "+extraClass:""));
 for(const [type,attrs] of PS_ICON_SHAPES[name]||PS_ICON_SHAPES.info){
  const node=document.createElementNS(NS,type);
  for(const [key,value] of Object.entries(attrs))node.setAttribute(key,String(value));
  svg.append(node);
 }
 return svg;
}
export function iconText(iconName,value,className=""){
 const span=document.createElement("span");
 span.className="psv-icon-text"+(className?" "+className:"");
 span.append(psIcon(iconName),document.createTextNode(String(value)));
 return span;
}
export function addHeadingIcon(root,selector,iconName){
 const heading=root.querySelector(selector);
 if(!heading||heading.querySelector(".psv-icon"))return;
 heading.prepend(psIcon(iconName,"psv-heading-icon"));
}
