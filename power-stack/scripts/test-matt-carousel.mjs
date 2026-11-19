import assert from 'node:assert/strict';
import {mountMattCarousel} from '../owner-matt-carousel.mjs';
class Node {
 constructor(tag,cls='',text=''){this.tag=tag;this.className=cls;this.textContent=text;this.children=[];this.dataset={};this.attrs={};this.id='';this.hidden=false;this.listeners={};this.ownerDocument=doc;}
 append(...nodes){nodes.forEach(n=>{n.parent=this;this.children.push(n);});}
 before(node){node.parent=this.parent;this.parent.children.splice(this.parent.children.indexOf(this),0,node);}
 setAttribute(n,v){this.attrs[n]=v;} getAttribute(n){return this.attrs[n]??null;} removeAttribute(n){delete this.attrs[n];}
 set href(v){this.attrs.href=v;} get href(){return this.attrs.href;}
 matches(s){return s==='a[href^="#"]'?this.tag==='a'&&this.href?.startsWith('#'):s[0]==='.'?this.className.split(' ').includes(s.slice(1)):this.tag===s;}
 querySelectorAll(s){return this.children.flatMap(n=>[...(n.matches(s)?[n]:[]),...n.querySelectorAll(s)]);}
 querySelector(s){return this.querySelectorAll(s)[0]??null;}
 addEventListener(n,f){(this.listeners[n]??=[]).push(f);}
 emit(n,extra={}){for(const f of this.listeners[n]??[])f({target:this,preventDefault(){},...extra});}
 focus(){}
}
const doc={createElement:tag=>new Node(tag),defaultView:{location:{hash:''},listeners:{},addEventListener(n,f){this.listeners[n]=f;}}};
const main=new Node('main'),desk=new Node('section','matt-desk-tavern'),hero=new Node('div','matt-hero','Matt complete'),nav=new Node('nav','matt-topic-nav'),list=new Node('div','matt-topic-list'),action=new Node('section','matt-action','All decisions');
main.append(desk);desk.append(hero,nav,list,action);
const slides=['Jimmy','David','Mike'].map((name,i)=>{const s=new Node('article','matt-topic'),h=new Node('div','matt-topic-head'),p=new Node('p','','Entire briefing '+name),d=new Node('details','','Full evidence '+name),a=new Node('a','',name);s.id=name.toLowerCase();a.href='#'+s.id;nav.append(a);h.append(new Node('span','matt-name-bubble',name));s.append(h,p,d);list.append(s);return s;});
const content=slides.map(s=>s.children.slice());
const visible=()=>slides.filter(s=>!s.hidden);
mountMattCarousel(main);mountMattCarousel(main);assert.equal(main.querySelectorAll('.matt-carousel-controls').length,1);
const [prev,status,next]=main.querySelector('.matt-carousel-controls').children;
assert.equal(visible()[0],slides[0]);assert.equal(prev.disabled,true);assert.equal(hero.hidden,false);
next.emit('click');assert.deepEqual(visible(),[slides[1]]);assert.match(status.textContent,/David · 2 \/ 3/);
nav.children[2].emit('click');assert.deepEqual(visible(),[slides[2]]);assert.equal(next.disabled,true);assert.equal(nav.children[2].getAttribute('aria-current'),'true');
prev.emit('click');slides[1].children[2].open=true;prev.emit('click');next.emit('click');assert.equal(slides[1].children[2].open,true);
doc.defaultView.location.hash='#mike';doc.defaultView.listeners.hashchange();assert.deepEqual(visible(),[slides[2]]);
assert.equal(hero.hidden,false);assert.equal(action.hidden,false);assert.deepEqual(slides.map(s=>s.children),content);
console.log('PASS: manual navigation, direct selector/hash, fixed Matt, all original content and evidence state preserved, no duplicate carousel');
