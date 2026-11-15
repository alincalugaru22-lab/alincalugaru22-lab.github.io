// Isolated review layer. The approved Welcome video and page-turn renderer are untouched.
const enabled=new URLSearchParams(location.search).get('gold')==='1';
export function prepareAuthorInk(ctx,w,h,image){
 if(!enabled)return;
 const scale=Math.min(w/image.naturalWidth,h/image.naturalHeight),pw=image.naturalWidth*scale,ph=image.naturalHeight*scale,x=(w-pw)/2,y=(h-ph)/2;
 const fade=ctx.createLinearGradient(0,y+ph*.65,0,y+ph*.935);
 fade.addColorStop(0,'#061a2d00');fade.addColorStop(.16,'#061a2dfc');fade.addColorStop(.18,'#061a2d');fade.addColorStop(.91,'#061a2d');fade.addColorStop(1,'#061a2d00');
 ctx.fillStyle=fade;ctx.fillRect(x+pw*.025,y+ph*.65,pw*.975,ph*.285);ctx.strokeStyle="#c5a76a88";ctx.lineWidth=Math.max(.5,scale);ctx.beginPath();ctx.moveTo(x+pw*.985,y+ph*.70);ctx.lineTo(x+pw*.985,y+ph*.925);ctx.stroke();
}
if(enabled)boot().catch(error=>{document.body.dataset.inkError=String(error);});
async function boot(){
 const [glyphs,signatureGlyphs]=await Promise.all(['calligraphy','signature'].map(name=>fetch(`./assets/${name}.json`).then(r=>r.json())));
 const style=document.createElement('style');style.textContent=`
 #ink-page{position:fixed;z-index:4;pointer-events:none;opacity:0;transition:opacity .15s;overflow:visible}#ink-page.active{opacity:1}#ink-page svg{width:100%;height:100%;overflow:visible}#ink-replay{position:fixed;z-index:6;top:max(12px,env(safe-area-inset-top));right:12px;color:#ffe8ad;background:#061322d9;border:1px solid #e7c36b88;border-radius:30px;padding:10px 15px;font:14px Georgia;cursor:pointer}#ink-replay[hidden]{display:none}#ink-page .nib-star{transform-box:fill-box;transform-origin:center}#ink-page.finished .nib-star{animation:gold-star 3s ease-in-out infinite}@keyframes gold-star{50%{opacity:.72;filter:drop-shadow(0 0 6px #ffd46f)}}`;
 document.head.append(style);
 const host=document.createElement('div');host.id='ink-page';host.setAttribute('aria-label','Text caligrafic scris de pana de înger cu cerneală aurie');
 host.innerHTML=`<svg viewBox="0 0 941 1672" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
 <linearGradient id="liquid-gold" x1="0" y1="0" x2=".35" y2="1" objectBoundingBox="true"><stop stop-color="#fff6cf"/><stop offset=".16" stop-color="#f4c65f"/><stop offset=".33" stop-color="#fff7d0"/><stop offset=".48" stop-color="#d89c31"/><stop offset=".63" stop-color="#ffeaa3"/><stop offset=".8" stop-color="#e2ae45"/><stop offset="1" stop-color="#fff0b5"/><animate attributeName="x1" values="0;-.3;0" dur="7s" repeatCount="indefinite"/><animate attributeName="x2" values=".35;.65;.35" dur="7s" repeatCount="indefinite"/></linearGradient>
 <linearGradient id="feather-white" x1="0" y1="0" x2="1" y2=".3"><stop stop-color="#bda678"/><stop offset=".23" stop-color="#fff6df"/><stop offset=".56" stop-color="#fffdf6"/><stop offset=".8" stop-color="#e6d7b7"/><stop offset="1" stop-color="#fffdf0"/></linearGradient>
 <linearGradient id="shaft-gold"><stop stop-color="#9e641b"/><stop offset=".32" stop-color="#ffe9a1"/><stop offset=".57" stop-color="#fff9dc"/><stop offset="1" stop-color="#c88926"/></linearGradient>
 <filter id="gold-relief" x="-15%" y="-40%" width="140%" height="190%"><feGaussianBlur in="SourceAlpha" stdDeviation=".42" result="relief"/><feSpecularLighting in="relief" surfaceScale="2" specularConstant=".7" specularExponent="22" lighting-color="#fff5c4" result="light"><feDistantLight azimuth="230" elevation="52"/></feSpecularLighting><feComposite in="light" in2="SourceAlpha" operator="in" result="bevel"/><feComposite in="SourceGraphic" in2="bevel" operator="arithmetic" k1="0" k2="1" k3=".7" k4="0"/><feDropShadow dx=".3" dy="1.5" stdDeviation=".8" flood-color="#000d18" flood-opacity=".9"/></filter>
 <filter id="nib-glow" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur stdDeviation="3.5"/></filter></defs><g id="ink-letters" filter="url(#gold-relief)"></g><g id="quill"><ellipse cx="31" cy="-8" rx="35" ry="5" fill="#000" opacity=".15" transform="rotate(-35)"/>
 <g id="feather-shape" transform="rotate(29)">
 <path d="M0 0 C10 -66 4 -158 23 -227 C42 -292 82 -326 93 -341 C102 -286 111 -244 87 -191 C68 -146 31 -105 0 0Z" fill="url(#feather-white)" stroke="#ddcfae" stroke-width=".7"/>
 <path d="M0 0 C-4 -60 -33 -116 -29 -164 C-27 -219 25 -282 93 -341 C51 -258 32 -196 18 -127 C11 -85 5 -40 0 0Z" fill="url(#feather-white)" stroke="#e1ceaa" stroke-width=".7"/>
 <g id="barbs" fill="none" stroke-linecap="round"></g>
 <path d="M0 0 C10 -85 15 -164 40 -229 C55 -271 76 -309 93 -341" fill="none" stroke="#b8883e" stroke-width="3.4"/>
 <path d="M0 0 C10 -85 15 -164 40 -229 C55 -271 76 -309 93 -341" fill="none" stroke="#fff4cf" stroke-width="1.5"/>
 <path d="M0 0 L-4 -19 L7 -35 L11 -28 Z" fill="url(#shaft-gold)" stroke="#b17e30" stroke-width=".6"/><path d="M0 0 L5 -23" stroke="#7e521f" stroke-width=".6"/></g>
 <g class="nib-star"><circle r="9" fill="#ffcf66" opacity=".65" filter="url(#nib-glow)"/><path d="M-10 0Q-1 -1 0 -13Q1 -1 10 0Q1 1 0 13Q-1 1 -10 0Z" fill="#fff4bf"/><circle r="2.3" fill="#fff"/></g></g></svg>`;
 document.body.append(host);
 const svg=host.querySelector('svg'),defs=svg.querySelector('defs'),letters=host.querySelector('#ink-letters'),quill=host.querySelector('#quill'),barbs=host.querySelector('#barbs');
 const ns='http://www.w3.org/2000/svg';const el=(name,attrs,parent)=>{const e=document.createElementNS(ns,name);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);parent.append(e);return e;};
 // Fine individual feather fibres, following the curved rachis.
 for(let i=0;i<53;i++){
  const t=i/52,y=-44-t*271,cx=4+70*t*t;
  el('path',{d:`M${cx} ${y} Q${cx+30*(1-t)+16} ${y-6} ${cx+52*Math.sin(Math.PI*t*.85)+5} ${y-39}`,stroke:i%3?'#fdf8e9':'#c9b78f','stroke-width':i%3?'.75':'.45',opacity:'.86'},barbs);
  el('path',{d:`M${cx} ${y} Q${cx-21} ${y-10} ${cx-33*Math.sin(Math.PI*t)-3} ${y-45}`,stroke:i%3?'#fffaf0':'#bca77c','stroke-width':i%3?'.7':'.4',opacity:'.8'},barbs);
 }
 const textLines=[['Every story begins with a question.',1197,47],['Through mystery, adventure and imagination,',1249,45],['I invite you to explore unfamiliar worlds',1301,46],['and find something of yourself along the way.',1353,44],['Alin Alex Calugaru',1465,108]];
 const strokes=[];let total=0,id=0;
 for(let line=0;line<textLines.length;line++){
  const[text,y,size]=textLines[line],alphabet=line===4?signatureGlyphs:glyphs;let scale=size/128;const rawWidth=[...text].reduce((s,c)=>s+alphabet[c].advance,0);scale=Math.min(scale,790/rawWidth);let x=(941-rawWidth*scale)/2;
  for(const ch of text){
   const g=alphabet[ch];if(g.outline){
    const mask=el('mask',{id:`ink-mask-${id}`,maskUnits:'userSpaceOnUse',x:'-60',y:'-150',width:'300',height:'260','mask-type':'luminance'},defs);
    const group=el('g',{transform:`translate(${x},${y}) scale(${scale})`},letters);
    el('path',{d:g.outline,fill:'url(#liquid-gold)',stroke:'#bd8127','stroke-width':'.55','stroke-linejoin':'round',mask:`url(#ink-mask-${id})`},group);
    for(const stroke of g.strokes){
     const path=el('path',{d:stroke.d,fill:'none',stroke:'white','stroke-width':stroke.w+1,'stroke-linecap':'round','stroke-linejoin':'round'},mask),length=path.getTotalLength();
     if(length<=0){path.remove();continue;}path.style.strokeDasharray=`${length} ${length}`;path.style.strokeDashoffset=length;path.style.opacity='0';
     const duration=(length*scale)*(line===4?1.5:1);strokes.push({path,length,start:total,end:total+duration,x,y,scale,line});total+=duration;
    }
    total+=line===4?4:2;id++;
   }else total+=line===4?25:12;
   x+=g.advance*scale;
  }
  total+=line===4?0:100;
 }
 // A bespoke signature flourish, authored as a real writing trajectory.
 const flourish=el('path',{d:'M185 1504 C265 1444 604 1504 729 1482 C813 1468 785 1445 730 1467 C647 1500 421 1548 248 1526 C157 1514 213 1462 322 1484',fill:'none',stroke:'url(#liquid-gold)','stroke-width':'2.1','stroke-linecap':'round'},letters);
 const fl=flourish.getTotalLength();flourish.style.strokeDasharray=`${fl} ${fl}`;flourish.style.strokeDashoffset=fl;flourish.style.opacity='0';strokes.push({path:flourish,length:fl,start:total,end:total+fl*.65,x:0,y:0,scale:1,line:5});total+=fl*.65;
 const replay=document.createElement('button');replay.id='ink-replay';replay.textContent='↶ Scrisul';replay.setAttribute('aria-label','Reia scrierea cu pana');replay.hidden=true;document.body.append(replay);
 let started=0,active=false,lastIndex=0,raf=0;
 function resize(){const h=innerHeight,w=innerWidth,pw=Math.min(w,h*941/1672),ph=pw*1672/941;Object.assign(host.style,{width:pw+'px',height:ph+'px',left:(w-pw)/2+'px',top:(h-ph)/2+'px'});}
 resize();addEventListener('resize',resize);
 const duration=22000,rest={x:330,y:1507};
 function reset(){started=performance.now()-(new URLSearchParams(location.search).get("ink")==="finished"?24000:0);lastIndex=0;host.classList.remove('finished');for(const st of strokes){st.path.style.strokeDashoffset=st.length;st.path.style.opacity='0';}document.body.dataset.ink='writing';active=true;cancelAnimationFrame(raf);raf=requestAnimationFrame(draw);}
 function draw(now){
  if(!active)return;const elapsed=now-started,t=Math.min(elapsed/duration,1),distance=t*total;
  while(lastIndex<strokes.length&&distance>=strokes[lastIndex].end){strokes[lastIndex].path.style.strokeDashoffset=0;strokes[lastIndex].path.style.opacity='1';lastIndex++;}
  let px,py;
  if(lastIndex<strokes.length){const st=strokes[lastIndex],part=Math.max(0,Math.min(1,(distance-st.start)/(st.end-st.start))),p=st.path.getPointAtLength(st.length*part);st.path.style.strokeDashoffset=st.length*(1-part);st.path.style.opacity=part>0?'1':'0';px=st.x+p.x*st.scale;py=st.y+p.y*st.scale;quill.setAttribute('transform',`translate(${px} ${py}) rotate(${Math.sin(now*.002)*1.6}) scale(.66)`);}
  else{
   const p=strokes.at(-1).path.getPointAtLength(fl),settle=Math.min((elapsed-duration)/1200,1),e=settle*settle*(3-2*settle);px=p.x+(rest.x-p.x)*e;py=p.y+(rest.y-p.y)*e;
   quill.setAttribute('transform',`translate(${px} ${py}) rotate(${e*56}) scale(.66)`);
   if(settle>=1){host.classList.add('finished');document.body.dataset.ink='finished';active=false;return;}
  }
  document.body.dataset.inkProgress=t.toFixed(3);raf=requestAnimationFrame(draw);
 }
 function sync(){const visible=document.body.dataset.state==='author';host.classList.toggle('active',visible);replay.hidden=!visible;if(visible&&!active&&document.body.dataset.ink!=='finished')reset();if(!visible){active=false;cancelAnimationFrame(raf);document.body.dataset.ink='ready';host.classList.remove('finished');}}
 const observer=new MutationObserver(m=>{if(m.some(v=>v.attributeName==='data-state'))sync();});observer.observe(document.body,{attributes:true,attributeFilter:['data-state']});replay.addEventListener('click',reset);sync();
 document.body.dataset.inkReady='true';
}
