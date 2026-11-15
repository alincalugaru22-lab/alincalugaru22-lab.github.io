// Native lightweight animation over the original artwork; no generated video or altered pages.
export function animateUniverseStars(page){
 const canvas=document.createElement('canvas');canvas.className='universe-living-stars';canvas.setAttribute('aria-hidden','true');page.prepend(canvas);
 const ctx=canvas.getContext('2d',{alpha:true});const motion=matchMedia('(prefers-reduced-motion: reduce)');let raf=0,last=0,time=0,w=1,h=1,dpr=1,frames=0;
 let seed=9103;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 const stars=Array.from({length:95},()=>({x:random(),y:random(),r:.5+random()*1.3,p:random()*Math.PI*2,s:.35+random()*.6,v:3+random()*8,gold:random()>.45}));
 const dust=Array.from({length:52},()=>({p:random(),offset:(random()-.5)*.14,r:.6+random()*1.1,s:.013+random()*.015,phase:random()*6.28}));
 function resize(){w=page.clientWidth||innerWidth;h=page.clientHeight||innerHeight;dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
 function shine(x,y,r,a,gold){ctx.globalAlpha=a;ctx.fillStyle=gold?'#ffe0a0':'#d4edff';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();if(r>1.1){ctx.globalAlpha=a*.32;ctx.fillRect(x-r*3,y-.4,r*6,.8);ctx.fillRect(x-.4,y-r*3,.8,r*6)}}
 function draw(t){ctx.clearRect(0,0,w,h);ctx.globalCompositeOperation='lighter';
 for(const s of stars){const x=(s.x*w+Math.sin(t*.12+s.p)*6),y=(s.y*h-t*s.v*.5+h*50)%h;const a=.22+(Math.sin(t*s.s+s.p)+1)*.24;shine(x,y,s.r,a,s.gold)}
 for(const s of dust){const p=(s.p+t*s.s)%1;const y=(.84-p*.54)*h;const x=(.5+Math.sin(p*6.3+s.phase*.16)*.13+s.offset)*w;shine(x,y,s.r,(Math.sin(p*Math.PI)*.7+.1),true)}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';frames++;canvas.dataset.frame=String(frames)}
 function active(){return !page.hidden&&!document.hidden&&document.body.dataset.readerOpen!=='true'}
 function tick(now){raf=0;if(!active())return;if(!last)last=now;const delta=Math.min((now-last)/1000,.5);last=now;time+=delta;draw(time);if(!motion.matches)raf=requestAnimationFrame(tick)}
 function sync(){if(raf){cancelAnimationFrame(raf);raf=0}last=0;if(active()){resize();draw(time);if(!motion.matches)raf=requestAnimationFrame(tick)}}
 new MutationObserver(sync).observe(page,{attributes:true,attributeFilter:['hidden']});new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-reader-open']});addEventListener('resize',sync);document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);sync();
}
