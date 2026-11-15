import {wideLayout as desktopQuery} from './responsive-layout.js?v=l91-1';
import {getArt,requestArt} from './desktop-art.js?v=l91-1';
import {paintDesktopAuthor,prepareDesktopAuthor} from './desktop-author.js?v=l91-1';
// Native approved videos; a single canvas compositor is also used while paper turns.
const definitions={author:{src:desktopQuery.matches?'assets/approved/about-wide-clean.mp4':'assets/approved/author.mp4',poster:desktopQuery.matches?'assets/approved/about-wide-clean.jpg':'assets/approved/author.jpg'},library:{src:'assets/approved/library.mp4',poster:'assets/approved/library.jpg'}};
const scenes=new Map(),warmed=new Set();
const blend=document.createElement('canvas');
function preparePanorama(){if(desktopQuery.matches)requestArt('library').catch(()=>{})}
preparePanorama();desktopQuery.addEventListener('change',preparePanorama);
function paintDesktopLibrary(ctx,w,h,source){
 const panorama=getArt('library');if(!desktopQuery.matches||!panorama)return false;
 ctx.drawImage(panorama,0,0,w,h);
 const sw=source.videoWidth||source.naturalWidth,sh=source.videoHeight||source.naturalHeight,dw=h*sw/sh,x=(w-dw)/2;
 if(blend.width!==Math.ceil(dw)||blend.height!==h){blend.width=Math.ceil(dw);blend.height=h}
 const b=blend.getContext('2d');b.clearRect(0,0,blend.width,h);b.globalCompositeOperation='source-over';b.drawImage(source,0,0,blend.width,h);
 b.globalCompositeOperation='destination-in';const gx=b.createLinearGradient(0,0,blend.width,0);gx.addColorStop(0,'black');gx.addColorStop(1,'black');b.fillStyle=gx;b.fillRect(0,0,blend.width,h);
 const gy=b.createLinearGradient(0,0,0,h);gy.addColorStop(0,'transparent');gy.addColorStop(.15,'transparent');gy.addColorStop(.22,'black');gy.addColorStop(1,'black');b.fillStyle=gy;b.fillRect(0,0,blend.width,h);b.globalCompositeOperation='source-over';ctx.drawImage(blend,x,0,dw,h);
 ctx.save();ctx.textAlign='center';ctx.textBaseline='top';ctx.shadowColor='#412009';ctx.shadowBlur=4;ctx.shadowOffsetY=2;ctx.fillStyle='#ffe4a3';ctx.font=`${Math.min(66*h/innerHeight,Math.max(30*h/innerHeight,h*.056))}px Georgia`;ctx.fillText('BOOKS NEVER DIE',w/2,h*.034);
 ctx.fillStyle='#ffedc3';ctx.font=`${h*.025}px Georgia`;ctx.fillText('A L I N   A L E X   C A L U G A R U',w/2,h*.113);ctx.font=`${h*.013}px Georgia`;ctx.fillText('A U T H O R  ·  C R E A T O R  ·  D E V E L O P E R',w/2,h*.154);ctx.restore();return true;
}
export function sceneFit(name){return name==='library'&&innerWidth/innerHeight<.65?'cover':'contain';}
export function paintScene(ctx,w,h,name,fallback){
 const v=scenes.get(name)?.video,source=v?.readyState>=2?v:fallback;if(!source)return;
 const sw=source.videoWidth||source.naturalWidth,sh=source.videoHeight||source.naturalHeight;if(!sw||!sh)return;
 if(name==='library'&&paintDesktopLibrary(ctx,w,h,source))return;
 if(name==='author'&&paintDesktopAuthor(ctx,w,h,source))return;
 function draw(fit){const scale=(fit==='cover'?Math.max:Math.min)(w/sw,h/sh),dw=sw*scale,dh=sh*scale;ctx.drawImage(source,(w-dw)/2,(h-dh)/2,dw,dh);}
 ctx.fillStyle='#061322';ctx.fillRect(0,0,w,h);ctx.save();ctx.filter='blur(32px) brightness(.32) saturate(.75)';draw('cover');ctx.restore();draw(sceneFit(name));
}
export function prepareScene(name){
 if(scenes.has(name))return scenes.get(name).video;
 const d=definitions[name],host=document.createElement('div');host.className='native-scene';host.id=name+'-scene';host.setAttribute('aria-hidden','true');
 const ambience=document.createElement('div');ambience.className='scene-ambience';ambience.style.backgroundImage=`url('${d.poster}')`;host.append(ambience);
 const video=document.createElement('video');video.id=name+'-video';video.src=d.src;video.poster=d.poster;video.muted=true;video.defaultMuted=true;video.volume=0;video.loop=true;video.playsInline=true;video.preload='metadata';host.append(video);document.body.append(host);if(name==='author')prepareDesktopAuthor(host,video);
 if(name==='library'){
  const backdrop=document.createElement('canvas');backdrop.className='desktop-library-backdrop';host.insertBefore(backdrop,video);
  function drawBackdrop(){const art=getArt('library');if(!desktopQuery.matches||!art)return;backdrop.width=innerWidth;backdrop.height=innerHeight;backdrop.getContext('2d').drawImage(art,0,0,innerWidth,innerHeight)}
  addEventListener('resize',drawBackdrop);addEventListener('desktop-art-ready',drawBackdrop);drawBackdrop();
 }
 let previous=0,loops=0;video.addEventListener('timeupdate',()=>{if(video.currentTime<previous-1)loops++;previous=video.currentTime;document.body.dataset[name+'Loops']=String(loops);document.body.dataset[name+'Time']=video.currentTime.toFixed(2);});
 const scene={host,video,active:false};
 const resume=()=>{if(scene.active&&!document.hidden&&video.paused)video.play().catch(()=>{});};
 video.addEventListener('loadeddata',resume);video.addEventListener('canplay',resume);
 addEventListener('pageshow',resume);document.addEventListener('visibilitychange',resume);
 video.addEventListener('error',()=>document.body.dataset[name+'Error']='media');scenes.set(name,scene);return video;
}
// Fetch the real Library video while the visitor reads About, before the turn begins.
export function warmScene(name){const v=prepareScene(name);if(!warmed.has(name)){warmed.add(name);v.preload='auto';v.load()}return v}
export function syncScenes(page,enabled=true,turning=false){
 if(page==='welcome')warmScene('author');
 if(page==='author'||page==='library'||(Array.isArray(turning)&&turning.includes('library')))warmScene('library');
 for(const [name,s]of scenes){s.host.hidden=page!==name;s.host.style.display=page===name?'block':'none';s.video.style.objectFit=sceneFit(name);s.active=enabled&&(page===name||turning===true||(Array.isArray(turning)&&turning.includes(name)));if(s.active&&!document.hidden){if(s.video.paused)s.video.play().catch(()=>{});}else s.video.pause();}
}
export function sceneVideo(name){return scenes.get(name)?.video;}
const style=document.createElement('style');style.textContent='.native-scene{position:fixed;inset:0;z-index:2;display:none;pointer-events:none;overflow:hidden;background:#061322}.scene-ambience{position:absolute;inset:-6%;background-position:center;background-size:cover;filter:blur(40px) brightness(.32) saturate(.75)}.native-scene video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}';document.head.append(style);
