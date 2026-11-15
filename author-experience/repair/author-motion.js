// Ambient photo animation. Every moving pixel is confined to a background mask.
// Face, clothes, hands, typography, gold frame and feather never enter these masks.
const REFW=941,REFH=1672;
let base,regions=[],layout,frameCount=0,lastTime=0,fixedOverlay,media,nativeHost;
function surface(w,h){const c=document.createElement('canvas');c.width=Math.ceil(w);c.height=Math.ceil(h);return c;}
const definitions=[
 {name:'clouds-left',kind:'cloud',box:[22,222,245,250],path:'M22 222L253 222Q245 253 247 290L257 357L250 417L220 463L22 472Z',feather:9},
 {name:'clouds-right',kind:'cloud',box:[526,315,301,145],path:'M548 328Q672 344 817 362L827 414L785 454L535 458L526 395Z',feather:9},
 {name:'palm-crown',kind:'palm',box:[524,212,393,276],path:'M536 224Q657 210 843 213L916 253L914 401L871 486L828 440L784 408L709 389L643 352L561 331L524 284Z',feather:6},
 {name:'ocean-left',kind:'water',box:[23,491,248,75],path:'M23 491L271 491L263 517L245 535L211 548L160 565L23 562Z',feather:2.5},
 {name:'ocean-shore-right',kind:'water',box:[516,497,403,426],path:'M516 499L815 497L843 545L856 611L902 633L918 919L872 917L826 856L788 782L741 719L711 677L672 624L624 585L579 549L535 526Z',feather:3},
];
export function prepareAuthorMotion(ctx,w,h,image,options={}){
 base=surface(w,h);base.getContext('2d').drawImage(ctx.canvas,0,0);
 const scale=Math.min(w/image.naturalWidth,h/image.naturalHeight),pw=image.naturalWidth*scale,ph=image.naturalHeight*scale;
 layout={x:(w-pw)/2,y:(h-ph)/2,sx:pw/REFW,sy:ph/REFH};
 const source=surface(REFW,REFH);source.getContext('2d').drawImage(image,0,0,REFW,REFH);
 regions=definitions.map(d=>{
  const[x,y,rw,rh]=d.box,texture=surface(rw,rh),mask=surface(rw,rh),mc=mask.getContext('2d');
  mc.translate(-x,-y);mc.filter=`blur(${d.feather}px)`;mc.fillStyle='white';mc.fill(new Path2D(d.path));
  return {...d,source,texture,mask,ctx:texture.getContext('2d'),x,y,w:rw,h:rh};
 });
 fixedOverlay=surface(w,h);const fixed=fixedOverlay.getContext('2d');fixed.drawImage(base,0,0);fixed.globalCompositeOperation='destination-out';
 for(const r of regions)fixed.drawImage(r.mask,layout.x+r.x*layout.sx,layout.y+r.y*layout.sy,r.w*layout.sx,r.h*layout.sy);
 if(!options.offline&&!media){media=document.createElement('video');media.muted=true;media.defaultMuted=true;media.loop=true;media.playsInline=true;media.preload='auto';media.src='assets/about-author-motion-v2.mp4';document.addEventListener('visibilitychange',()=>{if(document.hidden)media.pause();else if(document.body.dataset.state==='author')media.play().catch(()=>{});});}
 if(!options.offline){
  if(!nativeHost){nativeHost=document.createElement('div');nativeHost.id='author-motion-native';nativeHost.setAttribute('aria-hidden','true');document.body.append(nativeHost);const css=document.createElement('style');css.textContent='#author-motion-native{position:fixed;inset:0;z-index:2;display:none;pointer-events:none;overflow:hidden}body[data-state="author"] #author-motion-native{display:block}#author-motion-native video{position:absolute;object-fit:fill}#author-motion-native canvas{position:absolute;inset:0;width:100%;height:100%}';document.head.append(css);}
  nativeHost.replaceChildren(media,fixedOverlay);const ratio=w/innerWidth;
  Object.assign(media.style,{left:layout.x/ratio+'px',top:layout.y/ratio+'px',width:REFW*layout.sx/ratio+'px',height:REFH*layout.sy/ratio+'px'});
 }
 document.body.dataset.authorMotion='ready';
}
export function paintAuthorMotionOffline(ctx,time){
 if(!base||!layout)return;
 const t=time*.001,phase=t*Math.PI*2/30;
 ctx.drawImage(base,0,0);
 for(const r of regions){
  const g=r.ctx;g.globalCompositeOperation='source-over';g.clearRect(0,0,r.w,r.h);
  if(r.kind==='cloud'){
   const dx=9*Math.sin(phase+(r.x>300?1.1:0)),dy=.7*Math.sin(phase);
   g.drawImage(r.source,r.x+dx,r.y+dy,r.w,r.h,0,0,r.w,r.h);
  }else{
   for(let j=0;j<r.h;j+=2){
    const y=r.y+j;let dx,dy;
    if(r.kind==='water'){
     const depth=Math.min(1,Math.max(.08,(y-489)/350));
     dx=(.7+depth*2.2)*Math.sin(y*.055-phase*7)+.5*Math.sin(y*.131+phase*4);
     dy=(.6+depth*4.5)*Math.sin(y*.043-phase*5)+.6*Math.sin(y*.11-phase*3);
    }else{
     const root=Math.max(0,1-(y-210)/350),strength=Math.sin(Math.min(1,(y-210)/55)*Math.PI/2)*root;
     dx=strength*(4.6*Math.sin(phase*3)+.85*Math.sin(phase*6+y*.036));dy=.65*root*Math.sin(phase*3+y*.019);
    }
    g.drawImage(r.source,r.x+dx,y+dy,r.w,2.15,0,j,r.w,2.15);
   }
  }
  g.globalCompositeOperation='destination-in';g.drawImage(r.mask,0,0);g.globalCompositeOperation='source-over';
  ctx.drawImage(r.texture,layout.x+r.x*layout.sx,layout.y+r.y*layout.sy,r.w*layout.sx,r.h*layout.sy);
 }
 frameCount++;document.body.dataset.authorMotion='playing';document.body.dataset.authorMotionFrames=String(frameCount);
 if(lastTime)document.body.dataset.authorMotionFrameMs=(time-lastTime).toFixed(1);lastTime=time;
}

export function paintAuthorMotion(ctx,time){
 if(!base||!layout)return;ctx.drawImage(base,0,0);
 if(media&&media.paused)media.play().catch(()=>{});
 if(media&&media.readyState>=2){if(document.body.dataset.state!=='author'){ctx.drawImage(media,layout.x,layout.y,REFW*layout.sx,REFH*layout.sy);ctx.drawImage(fixedOverlay,0,0);}frameCount++;document.body.dataset.authorMotion='playing';document.body.dataset.authorMotionFrames=String(frameCount);document.body.dataset.authorMotionVideoTime=media.currentTime.toFixed(2);if(lastTime)document.body.dataset.authorMotionFrameMs=(time-lastTime).toFixed(1);lastTime=time;}
}
export function getAuthorMotionMasks(){return regions.map(r=>({name:r.name,kind:r.kind,x:r.x,y:r.y,w:r.w,h:r.h,mask:r.mask}));}

export function pauseAuthorMotion(){if(media)media.pause();}
