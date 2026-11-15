// Desktop-only composition. Portrait and sea motion come from the approved video.
import {wideLayout as desktop} from './responsive-layout.js?v=original-wide-r4';
import {getArt,requestArt} from './desktop-art.js?v=original-wide-r4';
const portraitLayer=document.createElement('canvas');
function prepareArt(){if(desktop.matches)requestArt('author').then(()=>{document.documentElement.classList.add('desktop-author-ready');document.documentElement.dataset.authorBackdrop='bitmap'}).catch(()=>{})}
prepareArt();desktop.addEventListener('change',prepareArt);
export function isDesktopAuthor(){return desktop.matches}
export function desktopAuthorButton(w,h){return {left:w*.565,top:h*.87,width:w*.31,height:Math.max(h*.068,44*h/innerHeight)}}
export function paintDesktopAuthor(ctx,w,h,source){
 const panorama=getArt('author');if(!desktop.matches||!panorama)return false;
 ctx.drawImage(panorama,0,0,w,h);
 const sw=source?.videoWidth||source?.naturalWidth,sh=source?.videoHeight||source?.naturalHeight;
 if(sw&&sh){
  const dw=Math.min(h*.80,w*.53),dh=dw*320/500,x=w*.025,y=h*.235;
  if(portraitLayer.width!==Math.ceil(dw)||portraitLayer.height!==Math.ceil(dh)){portraitLayer.width=Math.ceil(dw);portraitLayer.height=Math.ceil(dh)}
  const b=portraitLayer.getContext('2d'),pw=portraitLayer.width,ph=portraitLayer.height;
  b.globalCompositeOperation='source-over';b.clearRect(0,0,pw,ph);b.drawImage(source,18,216,500,320,0,0,pw,ph);
  b.globalCompositeOperation='destination-in';const gx=b.createLinearGradient(0,0,pw,0);gx.addColorStop(0,'transparent');gx.addColorStop(.10,'black');gx.addColorStop(.68,'black');gx.addColorStop(1,'transparent');b.fillStyle=gx;b.fillRect(0,0,pw,ph);
  const gy=b.createLinearGradient(0,0,0,ph);gy.addColorStop(0,'transparent');gy.addColorStop(.14,'black');gy.addColorStop(.66,'black');gy.addColorStop(1,'transparent');b.fillStyle=gy;b.fillRect(0,0,pw,ph);b.globalCompositeOperation='source-over';ctx.drawImage(portraitLayer,x,y,dw,dh);
 }
 const shade=ctx.createLinearGradient(w*.40,0,w,0);shade.addColorStop(0,'transparent');shade.addColorStop(.4,'#04132266');shade.addColorStop(1,'#04132299');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
 ctx.save();ctx.textAlign='center';ctx.textBaseline='top';ctx.lineJoin='round';const cx=w*.72;
 function ink(text,size,y,maxWidth=w*.48){ctx.font=`${size}px LibraryCalligraphy`;const scale=Math.min(1,maxWidth/ctx.measureText(text).width);ctx.save();ctx.translate(cx,y);ctx.scale(scale,1);ctx.shadowColor='#02101de6';ctx.shadowBlur=5;ctx.shadowOffsetY=2;ctx.fillStyle='#704511';ctx.fillText(text,0,2);ctx.shadowBlur=0;ctx.shadowOffsetY=0;const gold=ctx.createLinearGradient(0,0,0,size);for(const[a,c]of [[0,'#fff7d7'],[.18,'#ffe4a0'],[.36,'#c88c29'],[.49,'#fff1ba'],[.62,'#e5b34c'],[.78,'#ffdf83'],[1,'#a66a20']])gold.addColorStop(a,c);ctx.fillStyle=gold;ctx.fillText(text,0,0);ctx.restore()}
 ctx.fillStyle='#fce4ae';ctx.font=`${h*.027}px Georgia`;ctx.fillText('ALIN ALEX CALUGARU',cx,h*.10);
 ink('About the Author',h*.106,h*.18,w*.50);
 ctx.fillStyle='#e5c37d';ctx.font=`${h*.026}px Georgia`;ctx.fillText('✦',cx,h*.31);
 ink('Every story begins with a question.',h*.050,h*.37);
 ink('Through mystery, adventure and imagination,',h*.048,h*.435);
 ink('I invite you to explore unfamiliar worlds',h*.048,h*.50);
 ink('and find something of yourself along the way.',h*.048,h*.565);
 ink('Alin Alex Calugaru',h*.080,h*.675,w*.46);
 const r=desktopAuthorButton(w,h);ctx.beginPath();ctx.roundRect(r.left,r.top,r.width,r.height,r.height/2);ctx.fillStyle='#052422ed';ctx.fill();ctx.strokeStyle='#e7c57e';ctx.lineWidth=Math.max(1,w/1500);ctx.stroke();ctx.font=`${Math.max(h*.021,14*w/innerWidth)}px Georgia`;ctx.textBaseline='middle';ctx.fillStyle='#ffedba';ctx.fillText('EXPLORE MY LIBRARY   →',cx,r.top+r.height/2);ctx.restore();
 ctx.save();ctx.strokeStyle='#e5bf7199';ctx.lineWidth=Math.max(1,w/1500);ctx.strokeRect(20*w/1365,20*h/936,w-40*w/1365,h-40*h/936);ctx.restore();return true;
}
export function prepareDesktopAuthor(host,video){
 const canvas=document.createElement('canvas');canvas.className='desktop-author-canvas';host.append(canvas);const ctx=canvas.getContext('2d',{alpha:false}),poster=new Image();poster.src=video.poster;let last=0;
 function frame(t){requestAnimationFrame(frame);if(!desktop.matches||document.hidden||host.hidden||host.style.display==='none'||t-last<1000/24)return;last=t;const ratio=Math.min(devicePixelRatio||1,1.5),w=Math.round(innerWidth*ratio),h=Math.round(innerHeight*ratio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}paintDesktopAuthor(ctx,w,h,video.readyState>=2?video:poster)}requestAnimationFrame(frame);
}
