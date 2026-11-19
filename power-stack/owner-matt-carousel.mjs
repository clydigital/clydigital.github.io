// Presentation only: enhance the already authenticated, original briefing DOM.
export function mountMattCarousel(main){
 const desk=main.querySelector('.matt-desk-tavern');
 const list=desk?.querySelector('.matt-topic-list');
 if(!list||list.dataset.carouselMounted)return;
 const slides=[...list.children].filter(node=>node.matches('.matt-topic'));
 if(slides.length<2)return;
 const doc=desk.ownerDocument;
 const nav=desk.querySelector('.matt-topic-nav');
 const controls=doc.createElement('div');controls.className='matt-carousel-controls';
 controls.setAttribute('role','group');controls.setAttribute('aria-label','Analyst briefing navigation');
 const makeButton=(label,text)=>{const button=doc.createElement('button');button.type='button';button.setAttribute('aria-label',label);button.textContent=text;return button;};
 const prev=makeButton('Previous analyst','←'),next=makeButton('Next analyst','→');
 const status=doc.createElement('span');status.className='matt-carousel-status';status.setAttribute('aria-live','polite');
 controls.append(prev,status,next);list.before(controls);
 list.dataset.carouselMounted='true';list.setAttribute('aria-label','Analyst briefings');
 let active=0;
 const character=slide=>slide.querySelector('.matt-name-bubble')?.textContent?.trim()||slide.querySelector('h3')?.textContent?.trim()||'Analyst';
 const links=nav?[...nav.querySelectorAll('a[href^="#"]')]:[];
 const target=href=>slides.findIndex(slide=>slide.id&&href==='#'+slide.id);
 for(const [i,slide] of slides.entries()){
  if(!slide.id)slide.id='matt-analyst-'+(i+1);
  slide.setAttribute('role','group');slide.setAttribute('aria-roledescription','slide');slide.setAttribute('aria-label',`${character(slide)}, ${i+1} of ${slides.length}`);
 }
 if(!list.id)list.id='matt-analyst-slides';
 for(const b of [prev,next])b.setAttribute('aria-controls',list.id);
 // Retain all existing links, including any links outside the analyst list.
 const selectors=nav||doc.createElement('nav');
 if(!nav){selectors.className='matt-topic-nav';selectors.setAttribute('aria-label','Choose analyst');controls.before(selectors);}
 const choices=slides.map((slide,i)=>{
  const matches=links.filter(link=>target(link.getAttribute('href'))===i);
  if(!matches.length){const link=doc.createElement('a');link.href='#'+slide.id;link.textContent=character(slide);selectors.append(link);matches.push(link);}
  for(const link of matches){
   const name=character(slide),label=link.textContent.trim();
   if(!label.toLowerCase().includes(name.toLowerCase()))link.textContent=name+' · '+label;
   link.setAttribute('aria-controls',slide.id);
   link.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();show(i);});
  }
  return matches;
 });
 function show(index){
  active=Math.max(0,Math.min(slides.length-1,index));
  slides.forEach((slide,i)=>{slide.hidden=i!==active;});
  choices.forEach((links,i)=>links.forEach(link=>{if(i===active)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');}));
  prev.disabled=active===0;next.disabled=active===slides.length-1;
  status.textContent=`${character(slides[active])} · ${active+1} / ${slides.length}`;
 }
 prev.addEventListener('click',()=>show(active-1));next.addEventListener('click',()=>show(active+1));
 for(const group of [controls,selectors])group.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();show(event.key==='Home'?0:event.key==='End'?slides.length-1:active+(event.key==='ArrowRight'?1:-1));
  if(event.target.matches('a'))choices[active][0]?.focus();
 });
 // Swipe on the character heading only, leaving tables and evidence scrollable.
 for(const slide of slides){
  const head=slide.querySelector('.matt-topic-head');if(!head)continue;
  let start=null;
  head.addEventListener('touchstart',event=>{const touch=event.touches[0];start=event.touches.length===1?{x:touch.clientX,y:touch.clientY}:null;},{passive:true});
  head.addEventListener('touchend',event=>{if(!start)return;const touch=event.changedTouches[0],dx=touch.clientX-start.x,dy=touch.clientY-start.y;start=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)show(active+(dx<0?1:-1));},{passive:true});
  head.addEventListener('touchcancel',()=>{start=null;},{passive:true});
 }
 const fromHash=()=>{const index=target(doc.defaultView?.location.hash);if(index>=0)show(index);};
 doc.defaultView?.addEventListener('hashchange',fromHash);
 show(0);fromHash();
}
