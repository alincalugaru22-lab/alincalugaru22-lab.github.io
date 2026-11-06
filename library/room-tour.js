import {clamp,orientationView,continuousView,motionTarget,cameraSize} from './room-tour-math.mjs';
const library=document.querySelector('.library'),video=document.querySelector('.film'),trigger=document.querySelector('.room-overview');
const surface=document.createElement('section');surface.className='tour-surface';surface.hidden=true;surface.tabIndex=-1;surface.setAttribute('role','region');surface.setAttribute('aria-label','Look around the library');
surface.innerHTML=`<div class="tour-heading"><span>THE LIBRARY</span><p class="tour-status" role="status" aria-live="polite">Drag to look left, right, up or down.</p></div><div class="tour-crosshair" aria-hidden="true"></div><nav class="tour-controls" aria-label="Room view controls"><button class="tour-motion" type="button" aria-pressed="false">Enable phone motion</button><button class="tour-center" type="button">Recenter</button><button class="tour-done" type="button">Back to Library</button></nav>`;
document.body.append(surface);
const motionButton=surface.querySelector('.tour-motion'),status=surface.querySelector('.tour-status');
let active=false,sensors=false,received=false,lastReading=null,base=null,anchor={x:.5,y:.5},target={x:.5,y:.5},position={x:.5,y:.5},size={width:0,height:0},raf=0,lastFrame=0,drag=null,scrollBefore=0,timer=0,requestId=0;
function measure(){size=cameraSize(innerWidth,innerHeight,video.videoWidth||1920,video.videoHeight||1080);video.style.width=size.width+'px';video.style.height=size.height+'px';video.style.left='0';video.style.top='0';video.style.objectFit='fill';render()}
function render(){const x=(innerWidth-size.width)*position.x,y=(innerHeight-size.height)*position.y;video.style.transform=`translate3d(${x}px,${y}px,0)`;surface.dataset.viewX=position.x.toFixed(3);surface.dataset.viewY=position.y.toFixed(3)}
function animate(now){if(!active||document.hidden){raf=0;return}const dt=lastFrame?Math.min(80,now-lastFrame):16;lastFrame=now;const k=1-Math.exp(-dt/95);position.x+=(target.x-position.x)*k;position.y+=(target.y-position.y)*k;render();if(Math.abs(position.x-target.x)+Math.abs(position.y-target.y)>.0001)raf=requestAnimationFrame(animate);else{position={...target};render();raf=0}}
function wake(){if(active&&!document.hidden&&!raf){lastFrame=0;raf=requestAnimationFrame(animate)}}
function calibrate(){base=lastReading?{...lastReading}:null;anchor={...target}}
function reading(event){if(!active||!sensors||document.hidden)return;const raw=orientationView(event.alpha,event.beta,event.gamma);if(!raw)return;const r=continuousView(raw,lastReading);lastReading=r;if(!received){received=true;clearTimeout(timer);motionButton.textContent='Phone motion on';status.textContent='Move your phone to look around. Drag also works.'}if(drag)return;if(!base){base={...r};anchor={...target}}target=motionTarget(r,base,anchor);wake()}
function stopSensors(){sensors=false;requestId++;clearTimeout(timer);removeEventListener('deviceorientation',reading);motionButton.setAttribute('aria-pressed','false');motionButton.textContent='Enable phone motion';base=null;lastReading=null;received=false}
async function enableSensors(){
 if(sensors){stopSensors();status.textContent='Phone motion off. Drag to look around.';return}
 const ticket=++requestId;const api=window.DeviceOrientationEvent;
 if(!api||!window.isSecureContext){status.textContent='Phone motion is unavailable here. Drag to look around.';return}
 motionButton.disabled=true;
 try{
  if(typeof api.requestPermission==='function'){const permission=await api.requestPermission();if(permission!=='granted')throw new Error('not-granted')}
  if(!active||ticket!==requestId)return;
  sensors=true;received=false;base=null;lastReading=null;anchor={...target};motionButton.setAttribute('aria-pressed','true');motionButton.textContent='Waiting for phone motion';status.textContent='Hold your phone comfortably, then move it gently.';
  addEventListener('deviceorientation',reading,{passive:true});
  timer=setTimeout(()=>{if(active&&sensors&&!received){stopSensors();status.textContent='No motion signal. Drag to look around, or enable phone motion again.'}},4500);
 }catch(error){if(active&&ticket===requestId){stopSensors();status.textContent='Phone motion was not enabled. Drag to look around.'}}
 finally{motionButton.disabled=false}
}
function start(){if(active)return;active=true;scrollBefore=library.scrollTop;library.scrollTop=0;target={x:.5,y:.5};position={...target};library.classList.add('tour-active');surface.hidden=false;measure();surface.focus({preventScroll:true});status.textContent='Drag to look left, right, up or down. Use arrow keys on desktop.';if(matchMedia('(pointer:coarse)').matches)enableSensors()}
function finish(){if(!active)return;active=false;stopSensors();cancelAnimationFrame(raf);raf=0;drag=null;library.classList.remove('tour-active');surface.hidden=true;for(const name of ['width','height','left','top','object-fit','transform'])video.style.removeProperty(name);library.scrollTop=scrollBefore;trigger.focus({preventScroll:true})}
trigger.addEventListener('click',start);motionButton.addEventListener('click',enableSensors);surface.querySelector('.tour-done').addEventListener('click',finish);
surface.querySelector('.tour-center').addEventListener('click',()=>{target={x:.5,y:.5};calibrate();wake();status.textContent=sensors?'View centered. Move your phone to look around.':'View centered. Drag to look around.'});
surface.addEventListener('pointerdown',e=>{if(e.target.closest('button')||!e.isPrimary||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,view:{...target}};surface.setPointerCapture(e.pointerId);surface.classList.add('dragging')});
surface.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;target={x:clamp(drag.view.x-(e.clientX-drag.x)/Math.max(1,size.width-innerWidth)),y:clamp(drag.view.y-(e.clientY-drag.y)/Math.max(1,size.height-innerHeight))};wake()});
function release(e){if(drag?.id!==e.pointerId)return;drag=null;surface.classList.remove('dragging');calibrate()}
surface.addEventListener('pointerup',release);surface.addEventListener('pointercancel',release);surface.addEventListener('lostpointercapture',release);
surface.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();finish();return}if(e.target.closest('button'))return;const delta={ArrowLeft:[-.08,0],ArrowRight:[.08,0],ArrowUp:[0,-.12],ArrowDown:[0,.12]}[e.key];if(!delta)return;e.preventDefault();target={x:clamp(target.x+delta[0]),y:clamp(target.y+delta[1])};calibrate();wake()});
addEventListener('resize',()=>{if(active){measure();calibrate()}});video.addEventListener('loadedmetadata',()=>{if(active)measure()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;drag=null}else if(active){base=null;anchor={...target};wake()}});
addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data==='library-pause')finish()});addEventListener('pagehide',finish);

trigger.disabled=false;
