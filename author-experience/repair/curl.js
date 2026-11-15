import {wideLayout} from './responsive-layout.js?v=repair7';
import {requestArt} from './desktop-art.js?v=repair7';
import {isDesktopAuthor,desktopAuthorButton} from './desktop-author.js?v=repair7';
import {paintDesktopWelcome,desktopWelcomeButton} from './desktop-welcome.js?v=repair7';
import {prepareScene,paintScene,syncScenes,sceneVideo} from './scene-media.js?v=repair7';
import {prepareKlingAuthor,syncKlingAuthor,klingAuthorPoster,klingAuthorFormat} from './kling-author.js?v=repair7';
import {prepareAuthorMotion,paintAuthorMotion,pauseAuthorMotion} from './author-motion.js?v=repair7';
import {paintStaticWelcome} from './welcome-gold.js?v=repair7';
import {prepareAuthorInk} from './gold.js?v=repair7';
import * as THREE from '../vendor/three.module.js';

const stage=document.getElementById('stage'),turn=document.getElementById('turn'),replay=document.getElementById('replay'),status=document.getElementById('status'),loading=document.getElementById('loading');
const params=new URLSearchParams(location.search);
const staticWelcome=params.get('welcome')==='gold';
const klingAuthor=params.get('about')==='kling',embedded=params.get('embedded')==='1';let embeddedActive=!embedded;
const livingAuthor=params.get('about')==='live';let lastAboutPaint=-Infinity;
const frontCanvas=document.createElement('canvas'),backCanvas=document.createElement('canvas'),aboutCanvas=document.createElement('canvas');
const fc=frontCanvas.getContext('2d',{alpha:false}),bc=backCanvas.getContext('2d',{alpha:false}),ac=aboutCanvas.getContext('2d',{alpha:false});
const video=document.createElement('video');video.id='welcome-scene-video';video.hidden=true;document.body.append(video);video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='auto';
let pageCursor=0;const libraryPoster=new Image();libraryPoster.src='assets/approved/library.jpg';
const portraitPoster=new Image(),desktopPoster=new Image(),author=new Image();
portraitPoster.src='assets/welcome-portrait.jpg';desktopPoster.src='assets/welcome-portrait.jpg';author.src=klingAuthor?klingAuthorPoster():livingAuthor?'assets/about-author-v2.png':'assets/about.png';
let format='',width=innerWidth,height=innerHeight,ratio=1,progress=0,animation=null,drag=null,lastPaint=-Infinity,lastGeometry=-1,ready=false,geometry,front,back,edgeLines,underlay,shadowPlane;
const W=2;let H=W*height/width;
let renderer,software=false,foldState;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(error){software=true;renderer=softwareRenderer();}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));renderer.setSize(width,height);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
stage.append(renderer.domElement);document.body.dataset.renderer=software?'Canvas3D':'WebGL';
const scene=new THREE.Scene();scene.background=new THREE.Color('#061322');
const camera=new THREE.PerspectiveCamera(32,width/height,.02,40);
const fill=new THREE.AmbientLight(0xffffff,1.25);scene.add(fill);
const key=new THREE.DirectionalLight(0xfff5e6,2.1);key.position.set(-3,4,6);key.target.position.set(W*.45,0,0);key.castShadow=true;
key.shadow.mapSize.set(width<700?1024:2048,width<700?1024:2048);key.shadow.bias=-.00008;key.shadow.normalBias=.002;key.shadow.radius=4;
scene.add(key,key.target);
const frontTexture=new THREE.CanvasTexture(frontCanvas),backTexture=new THREE.CanvasTexture(backCanvas),aboutTexture=new THREE.CanvasTexture(aboutCanvas);
for(const tex of [frontTexture,backTexture,aboutTexture]){tex.colorSpace=THREE.SRGBColorSpace;tex.generateMipmaps=false;tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}
const frontMaterial=new THREE.MeshBasicMaterial({map:frontTexture,side:THREE.FrontSide});frontMaterial.shadowSide=THREE.DoubleSide;
frontMaterial.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 vPaperNormal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPaperNormal = normalize(normalMatrix * normal);');
  shader.fragmentShader='varying vec3 vPaperNormal;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('vec3 outgoingLight = reflectedLight.indirectDiffuse;',`vec3 paperN = normalize(vPaperNormal);\nfloat paperLight = 0.40 + 0.60 * max(dot(paperN, normalize(vec3(-0.35, 0.60, 1.0))), 0.0) / 0.823;\nvec3 outgoingLight = reflectedLight.indirectDiffuse * clamp(paperLight, 0.38, 1.09);`);
};
const backMaterial=new THREE.MeshStandardMaterial({map:backTexture,color:0xfff7e4,roughness:.96,metalness:0,side:THREE.BackSide});
const edgeMaterial=new THREE.LineBasicMaterial({color:0xffefc5,transparent:true,opacity:.75});
let originals,renderNeeded=true;
renderer.shadowMap.autoUpdate=false;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};

function cover(ctx,image,x,y,w,h,position=.5){
  const sw=image.videoWidth||image.naturalWidth,sh=image.videoHeight||image.naturalHeight;if(!sw||!sh)return;
  const scale=Math.max(w/sw,h/sh),dw=sw*scale,dh=sh*scale;ctx.drawImage(image,x-(dw-w)*position,y-(dh-h)*.5,dw,dh);
}
function fit(ctx,image,x,y,w,h){
  const sw=image.videoWidth||image.naturalWidth,sh=image.videoHeight||image.naturalHeight;if(!sw||!sh)return;
  const scale=Math.min(w/sw,h/sh),dw=sw*scale,dh=sh*scale;ctx.drawImage(image,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
}
function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function paintWelcomeOriginal(time){
  const c=frontCanvas,w=c.width,h=c.height,source=video.readyState>=2?video:(format==='desktop'?desktopPoster:portraitPoster);
  fc.fillStyle='#061322';fc.fillRect(0,0,w,h);
  if(format==='desktop'){
    paintDesktopWelcome(fc,w,h,source,ratio);
  }else{
    cover(fc,source,0,0,w,h,.30);
    fc.strokeStyle='#e5bf7180';fc.lineWidth=ratio;fc.strokeRect(12*ratio,12*ratio,w-24*ratio,h-24*ratio);
    fc.save();fc.textAlign='center';fc.textBaseline='top';fc.shadowColor='#000b';fc.shadowBlur=7*ratio;fc.shadowOffsetY=2*ratio;fc.fillStyle='#fff1d1';
    if(staticWelcome){paintStaticWelcome(fc,w,h,ratio);}else{
    fc.font=`${.026*w}px Georgia`;const name='ALIN ALEX CALUGARU';
    if('letterSpacing' in fc)fc.letterSpacing=`${.007*w}px`;fc.fillText(name,w*.5,h*.155);
    if('letterSpacing' in fc)fc.letterSpacing='0px';
    fc.font=`italic ${.073*w}px Georgia`;fc.fillText('Welcome to',w*.5,h*.256);
    const gleam=(Math.sin(time*.0005)+1)*.08,g=fc.createLinearGradient(w*(.05-gleam),0,w*(.95-gleam),0);
    g.addColorStop(0,'#e4b44c');g.addColorStop(.22,'#ffdf82');g.addColorStop(.34,'#fff7cf');g.addColorStop(.49,'#eac05b');g.addColorStop(.64,'#fff0b1');g.addColorStop(.82,'#efc35b');g.addColorStop(1,'#fff2b8');
    fc.font=`${.188*w}px AuthorScript`;fc.fillStyle=g;fc.shadowBlur=3*ratio;fc.fillText('my world',w*.5,h*.323);
    fc.fillStyle='#e7c172';fc.shadowBlur=0;fc.font=`${.04*w}px Georgia`;fc.fillText('✦',w*.5,h*.48);
    fc.strokeStyle='#e7c172b0';fc.lineWidth=ratio;fc.beginPath();fc.moveTo(w*.25,h*.5);fc.lineTo(w*.44,h*.5);fc.moveTo(w*.56,h*.5);fc.lineTo(w*.75,h*.5);fc.stroke();
    fc.fillStyle='#fff1d1';fc.font=`${.051*w}px Georgia`;fc.shadowBlur=7*ratio;fc.fillText('Where Books Never Die',w*.5,h*.53);}
    if(staticWelcome){fc.textAlign='center';fc.textBaseline='top';}
    fc.shadowBlur=0;rounded(fc,w*.14,h*.905,w*.72,h*.067,h*.0335);fc.fillStyle='#041a19ed';fc.fill();fc.strokeStyle='#e9cb86';fc.lineWidth=1.25*ratio;fc.stroke();
    fc.fillStyle='#fff0c5';fc.font=`${.0355*Math.min(w,h*.8)}px Georgia`;fc.textBaseline='middle';if('letterSpacing' in fc)fc.letterSpacing=`${.003*w}px`;fc.fillText('ENTER MY WORLD  →',w*.5,h*.9385);fc.restore();
  }
  frontTexture.needsUpdate=true;renderNeeded=true;
}
function paintWelcome(time){
 if(pageCursor===0)return paintWelcomeOriginal(time);
 paintScene(fc,frontCanvas.width,frontCanvas.height,'author',author);frontTexture.needsUpdate=true;renderNeeded=true;
}
function paintAbout(){
 prepareKlingAuthor();const name=pageCursor===0?'author':'library';paintScene(ac,aboutCanvas.width,aboutCanvas.height,name,pageCursor===0?author:libraryPoster);aboutTexture.needsUpdate=true;renderNeeded=true;
}
function currentPage(){return pageCursor===0?(progress>.999?'author':'welcome'):(progress>.999?'library':'author');}
function positionTurn(){
 if(!ready&&pageCursor===0&&progress<.001)return;
 if(currentPage()==='author'){
  if(isDesktopAuthor()){for(const[k,v]of Object.entries(desktopAuthorButton(width,height)))document.documentElement.style.setProperty('--button-'+k,v+'px');return}
  const sw=768,sh=1080,scale=Math.min(width/sw,height/sh),pw=sw*scale,ph=sh*scale;
  const values={left:(width-pw)/2+pw*.185,top:(height-ph)/2+ph*.883,width:pw*.63,height:Math.max(44,ph*.06)};
  for(const[k,v]of Object.entries(values))document.documentElement.style.setProperty('--button-'+k,v+'px');
 }else if(currentPage()==='welcome'){
  let x,y,w,h;if(format==='desktop'){const r=desktopWelcomeButton(width,height);x=r.left;y=r.top;w=r.width;h=r.height;}else{x=width*.14;y=height*.905;w=width*.72;h=height*.067;}
  for(const[k,v]of Object.entries({left:x,top:y,width:w,height:h}))document.documentElement.style.setProperty('--button-'+k,v+'px');
 }
}
function prepareStep(cursor,p){
 pageCursor=cursor;progress=p;drag=null;animation=null;paintWelcome(performance.now());paintAbout();paintBack();build();positionTurn();
}
function nextPage(){
 if(!ready||animation)return;
 if(pageCursor===0&&progress>.999)prepareStep(1,0);
 if(!(pageCursor===1&&progress>.999))animateTo(1);
}
function previousPage(){
 if(!ready||animation)return;
 if(pageCursor===1&&progress<.001)prepareStep(0,1);
 if(progress>.001)animateTo(0);
 else if(embedded)parent.postMessage({type:'book-pages-cover'},location.origin);
}
function paintBack(){
  const w=backCanvas.width,h=backCanvas.height;bc.fillStyle='#fbf4e3';bc.fillRect(0,0,w,h);
  let seed=91;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<18000;i++){bc.fillStyle=rand()>.5?'#6550340b':'#ffffff55';bc.fillRect(rand()*w,rand()*h,ratio,ratio);}
  bc.save();bc.translate(w,0);bc.scale(-1,1);bc.globalAlpha=.025;bc.drawImage(frontCanvas,0,0,w,h);bc.restore();
  bc.strokeStyle='#bfa47642';bc.lineWidth=Math.max(.5,ratio*.55);bc.strokeRect(1,1,w-2,h-2);backTexture.needsUpdate=true;
}
function build(){
  H=W*height/width;
  const distance=Math.max(W*3.5,H/(2*Math.tan(THREE.MathUtils.degToRad(32)/2)));camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(H/(2*distance)));camera.aspect=width/height;camera.position.set(W/2,0,distance);camera.lookAt(W/2,0,0);camera.far=Math.max(40,distance*3);camera.updateProjectionMatrix();
  key.shadow.camera.left=-W;key.shadow.camera.right=W*2;key.shadow.camera.top=Math.max(H,W);key.shadow.camera.bottom=-Math.max(H,W);key.shadow.camera.near=.1;key.shadow.camera.far=18;key.shadow.camera.updateProjectionMatrix();
  if(front){scene.remove(front,back,edgeLines,underlay,shadowPlane);geometry.dispose();edgeLines.geometry.dispose();underlay.geometry.dispose();shadowPlane.geometry.dispose();}
  geometry=new THREE.PlaneGeometry(W,H,160,48);geometry.translate(W/2,0,0);originals=Float32Array.from(geometry.attributes.position.array);
  geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);geometry.attributes.normal.setUsage(THREE.DynamicDrawUsage);
  front=new THREE.Mesh(geometry,frontMaterial);front.castShadow=true;front.frustumCulled=false;scene.add(front);
  back=new THREE.Mesh(geometry,backMaterial);back.frustumCulled=false;scene.add(back);
  const perimeter=[];const cols=161,rows=49;
  for(let i=0;i<cols-1;i++)perimeter.push(i,i+1,(rows-1)*cols+i,(rows-1)*cols+i+1);
  for(let j=0;j<rows-1;j++)perimeter.push(j*cols,(j+1)*cols,j*cols+cols-1,(j+1)*cols+cols-1);
  const edgeGeo=new THREE.BufferGeometry();edgeGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(perimeter.length*3),3).setUsage(THREE.DynamicDrawUsage));edgeGeo.userData.indices=perimeter;
  edgeLines=new THREE.LineSegments(edgeGeo,edgeMaterial);edgeLines.frustumCulled=false;scene.add(edgeLines);
  const underGeo=new THREE.PlaneGeometry(W,H);underGeo.translate(W/2,0,-.018);
  underlay=new THREE.Mesh(underGeo,new THREE.MeshBasicMaterial({map:aboutTexture}));scene.add(underlay);
  const sg=new THREE.PlaneGeometry(W,H);sg.translate(W/2,0,-.011);shadowPlane=new THREE.Mesh(sg,new THREE.ShadowMaterial({opacity:.38,depthWrite:false}));shadowPlane.receiveShadow=true;scene.add(shadowPlane);
  lastGeometry=-1;deform(progress);
}
function foldPoint(x,y,a,r,c,s){
  const u=x*c-y*s-a,v=x*s+y*c;if(u<=0)return [x,y,0,0,0,1];
  const theta=Math.min(u/r,Math.PI);let across=a+r*Math.sin(theta);const z=r*(1-Math.cos(theta));if(u>Math.PI*r)across=a-(u-Math.PI*r);
  return [across*c+v*s,-across*s+v*c,z,-Math.sin(theta)*c,Math.sin(theta)*s,Math.cos(theta)];
}
function deform(p){
  if(!geometry||Math.abs(lastGeometry-p)<.00002)return;lastGeometry=p;
  const angle=(.22+.045*Math.sin(Math.PI*p))*(1-smooth(.55,.96,p)),c=Math.cos(angle),s=Math.sin(angle);
  const r=W*(.016+.115*Math.sin(Math.PI*p));
  const max=W*c+H*.5*s,min=-H*.5*s;
  const a=(max+W*.045)*(1-p)+(min-Math.PI*r-W*.025)*p;
  const anchor=foldPoint(0,0,a,r,c,s);
  foldState={p,a,r,c,s,anchor,min,max};
  if(software){renderNeeded=true;document.body.dataset.progress=p.toFixed(3);return;}
  const pos=geometry.attributes.position.array,norm=geometry.attributes.normal.array;
  for(let i=0;i<pos.length;i+=3){
    const x=originals[i],y=originals[i+1],u=x*c-y*s-a;
    let px=x,py=y,pz=0,nx=0,ny=0,nz=1;
    if(u>0){
      const v=x*s+y*c,theta=Math.min(u/r,Math.PI),sn=Math.sin(theta),cn=Math.cos(theta);
      const across=u>Math.PI*r?a-(u-Math.PI*r):a+r*sn;
      px=across*c+v*s;py=-across*s+v*c;pz=r*(1-cn);nx=-sn*c;ny=sn*s;nz=cn;
    }
    pos[i]=px-anchor[0];pos[i+1]=py-anchor[1];pos[i+2]=Math.max(.001,pz-anchor[2]);
    norm[i]=nx;norm[i+1]=ny;norm[i+2]=nz;
  }
  renderNeeded=true;renderer.shadowMap.needsUpdate=true;
  geometry.attributes.position.needsUpdate=true;geometry.attributes.normal.needsUpdate=true;
  const ea=edgeLines.geometry.attributes.position.array,indices=edgeLines.geometry.userData.indices;
  for(let i=0;i<indices.length;i++){const j=indices[i]*3;ea[i*3]=pos[j];ea[i*3+1]=pos[j+1];ea[i*3+2]=pos[j+2]+.0007;}
  edgeLines.geometry.attributes.position.needsUpdate=true;
  front.visible=back.visible=edgeLines.visible=p<.9998;
  document.body.dataset.progress=p.toFixed(3);
}
function select(){
  width=innerWidth;height=innerHeight;
  if(klingAuthor){const poster=klingAuthorPoster();if(!author.src.endsWith(poster)){author.src=poster;author.decode().then(()=>{paintAbout();renderNeeded=true;}).catch(()=>{});}}
  ratio=Math.min(devicePixelRatio||1,1.7,1800/Math.max(width,height));
  for(const canvas of [frontCanvas,backCanvas,aboutCanvas]){canvas.width=Math.max(1,Math.round(width*ratio));canvas.height=Math.max(1,Math.round(height*ratio));}
  const next=wideLayout.matches?'desktop':'portrait';
  if(format!==next){format=next;video.src='assets/welcome-portrait.mp4';video.load();video.play().catch(()=>{});}
  document.body.dataset.format=format;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));renderer.setSize(width,height);
  if(author.complete&&author.naturalWidth)paintAbout();
  if(portraitPoster.complete&&desktopPoster.complete){paintWelcome(performance.now());paintBack();}
  build();
  let x,y,w,h;
  if(format==='desktop'){
    const r=desktopWelcomeButton(width,height);x=r.left;y=r.top;w=r.width;h=r.height;
  }else{x=width*.14;y=height*.905;w=width*.72;h=height*.067;}
  for(const [name,val] of Object.entries({left:x,top:y,width:w,height:h}))document.documentElement.style.setProperty('--button-'+name,val+'px');
}
function showState(){
 const page=currentPage();document.getElementById('welcome-invitation').hidden=page!=='welcome'||format==='desktop';document.body.dataset.state=page;document.body.dataset.pageCursor=String(pageCursor);
 turn.hidden=page==='library';turn.disabled=!ready||!!animation||page==='library';
 turn.setAttribute('aria-label',page==='author'?'Explore my library — turn page':'Enter my world — turn page');
 replay.hidden=embedded||page==='welcome';replay.textContent='←';replay.setAttribute('aria-label','Previous page');
 syncScenes(page,embeddedActive);positionTurn();status.textContent=page==='author'?'About the Author':page==='library'?'Library':'Welcome to my world. Where Books Never Die.';
 if(embedded)parent.postMessage({type:'book-pages-state',page},location.origin);
}
function animateTo(target){
  if(!ready)return;
  animation={from:progress,to:target,at:performance.now(),duration:Math.max(450,Math.abs(target-progress)*1650)};
  turn.disabled=true;turn.hidden=true;replay.hidden=true;document.body.dataset.state='turning';syncScenes('turning',embeddedActive,pageCursor===0?['author']:['author','library']);if(pageCursor===0)video.play().catch(()=>{});else video.pause();if(embedded)parent.postMessage({type:'book-pages-state',page:'turning'},location.origin);
}
function draw(time){
  requestAnimationFrame(draw);
  if(document.hidden||!embeddedActive)return;
  if(ready&&progress<.9999&&time-lastPaint>1000/24){paintWelcome(time);lastPaint=time;}
  if(animation){
    const t=clamp((time-animation.at)/animation.duration),e=t*t*(3-2*t);progress=animation.from+(animation.to-animation.from)*e;
    if(t>=1){progress=animation.to;animation=null;showState();if(progress>.999){video.pause();replay.focus({preventScroll:true});}}
  }
  if(ready&&(animation||drag)&&time-lastAboutPaint>=1000/24){paintAbout();lastAboutPaint=time;}
  deform(progress);if(renderNeeded){renderer.render(scene,camera);renderNeeded=false;}
}
turn.addEventListener('click',nextPage);replay.addEventListener('click',previousPage);
renderer.domElement.addEventListener('pointerdown',event=>{
  if(ready&&!animation&&pageCursor===0&&progress>.999&&event.clientX>=width*.58)prepareStep(1,0);
  if(!ready||animation||progress>.999||event.clientX<width*.58)return;
  syncScenes('turning',embeddedActive,pageCursor===0?['author']:['author','library']);if(embedded)parent.postMessage({type:'book-pages-state',page:'turning'},location.origin);
  drag={id:event.pointerId,x:event.clientX,p:progress,moved:0};renderer.domElement.setPointerCapture(event.pointerId);turn.hidden=true;event.preventDefault();
});
renderer.domElement.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;drag.moved=Math.abs(event.clientX-drag.x);progress=clamp(drag.p+(drag.x-event.clientX)/width*1.25);document.body.dataset.state='dragging';deform(progress);
});
function release(event){if(!drag||event.pointerId!==drag.id)return;const tap=drag.moved<7;drag=null;animateTo(tap?1:progress>.32?1:0);}
renderer.domElement.addEventListener('pointerup',release);renderer.domElement.addEventListener('pointercancel',()=>{if(drag){drag=null;animateTo(progress>.5?1:0);}});
window.addEventListener('resize',()=>{drag=null;animation=null;select();showState();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();syncScenes('inactive',false);}else{if(progress<1&&embeddedActive)video.play().catch(()=>{});syncScenes(currentPage(),embeddedActive,animation?(pageCursor===0?['author']:['author','library']):false);}});
async function start(){
  try{
    prepareKlingAuthor();
    if(wideLayout.matches)await Promise.all(['library'].map(requestArt));
    const font=new FontFace('AuthorScript',"url('assets/author-script.otf')");
    const fonts=[font];if(staticWelcome){fonts.push(new FontFace('WelcomeCalligraphy',"url('assets/welcome-calligraphy.ttf')"));document.body.dataset.welcomeLettering='static-gold'}
    await Promise.all([...fonts.map(f=>f.load().then(loaded=>document.fonts.add(loaded))),author.decode(),portraitPoster.decode(),desktopPoster.decode(),libraryPoster.decode()]);
    select();video.play().catch(()=>{});paintWelcome(performance.now());paintBack();paintAbout();ready=true;
    const hold=Number(params.get('hold'));if(hold>0&&hold<1)progress=hold;
    if(params.get('page')==='author'){progress=1;video.pause();}
    if(params.get('page')==='library'){prepareStep(1,1);video.pause();}
    deform(progress);showState();if(embedded&&!embeddedActive)video.pause();if(embedded)window.parent.postMessage({type:'book-pages-ready'},location.origin);loading.classList.add('ready');setTimeout(()=>loading.hidden=true,250);document.body.dataset.ready='true';
  }catch(error){document.body.dataset.error=String(error);loading.textContent='Materialele nu s-au încărcat. Reîncarcă demo-ul.';console.error(error);}
}
window.addEventListener('message',event=>{if(!embedded||event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='book-pages-active')return;embeddedActive=!!event.data.active;if(embeddedActive&&progress<1)video.play().catch(()=>{});else video.pause();syncScenes(currentPage(),embeddedActive);renderNeeded=true;});
select();requestAnimationFrame(draw);start();

function softwareRenderer(){
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{alpha:false});let pixelRatio=1;
  const rotatedFront=document.createElement('canvas'),rotatedBack=document.createElement('canvas');
  function rotate(source,target,c,s){
    const tw=Math.ceil(source.width*c+source.height*s),th=Math.ceil(source.width*s+source.height*c);
    if(target.width!==tw||target.height!==th){target.width=tw;target.height=th;}
    const g=target.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,tw,th);g.setTransform(c,-s,s,c,0,source.width*s);g.drawImage(source,0,0);
  }
  function project(x,y,z){const k=width/W*camera.position.z/(camera.position.z-z);return [width/2+(x-W/2)*k,height/2-y*k];}
  function point(u,v,f){
    const q=foldPoint(u*f.c+v*f.s,-u*f.s+v*f.c,f.a,f.r,f.c,f.s);
    return [q[0]-f.anchor[0],q[1]-f.anchor[1],Math.max(.001,q[2]-f.anchor[2])];
  }
  function triangle(tex,sx,sw,sh,p0,p1,p2,second){
    ctx.save();ctx.beginPath();const pts=[p0,p1,p2],area=(p1[0]-p0[0])*(p2[1]-p0[1])-(p1[1]-p0[1])*(p2[0]-p0[0]),sign=area>0?1:-1;pts.forEach((v,i)=>{const prev=pts[(i+2)%3],next=pts[(i+1)%3],dx1=v[0]-prev[0],dy1=v[1]-prev[1],dx2=next[0]-v[0],dy2=next[1]-v[1],l1=Math.hypot(dx1,dy1)||1,l2=Math.hypot(dx2,dy2)||1,n1=[sign*dy1/l1,-sign*dx1/l1],n2=[sign*dy2/l2,-sign*dx2/l2],den=Math.max(.002,1+n1[0]*n2[0]+n1[1]*n2[1]),q=[v[0]+.7*(n1[0]+n2[0])/den,v[1]+.7*(n1[1]+n2[1])/den];i?ctx.lineTo(...q):ctx.moveTo(...q);});ctx.closePath();ctx.clip();
    let a,b,c,d;if(!second){a=(p1[0]-p0[0])/sw;b=(p1[1]-p0[1])/sw;c=(p2[0]-p1[0])/sh;d=(p2[1]-p1[1])/sh;}
    else{a=(p1[0]-p2[0])/sw;b=(p1[1]-p2[1])/sw;c=(p2[0]-p0[0])/sh;d=(p2[1]-p0[1])/sh;}
    ctx.transform(a,b,c,d,p0[0],p0[1]);ctx.drawImage(tex,-sx,0);ctx.restore();
  }
  function render(){
    ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);ctx.filter='none';ctx.fillStyle='#061322';ctx.fillRect(0,0,width,height);
    if(progress<.0001){ctx.drawImage(frontCanvas,0,0,width,height);return;}
    ctx.drawImage(aboutCanvas,0,0,width,height);if(progress>.9998||!foldState)return;
    const f=foldState,ppu=frontCanvas.width/W,minV=-H/2*f.c,maxV=W*f.s+H/2*f.c;
    rotate(frontCanvas,rotatedFront,f.c,f.s);rotate(backCanvas,rotatedBack,f.c,f.s);
    const outline=[];
    for(let i=0;i<=48;i++)outline.push([W*i/48,H/2]);
    for(let i=1;i<=24;i++)outline.push([W,H/2-H*i/24]);
    for(let i=1;i<=48;i++)outline.push([W-W*i/48,-H/2]);
    for(let i=1;i<24;i++)outline.push([0,-H/2+H*i/24]);
    const boundary=outline.map(([x,y])=>{const q=foldPoint(x,y,f.a,f.r,f.c,f.s);return [q[0]-f.anchor[0],q[1]-f.anchor[1],Math.max(.001,q[2]-f.anchor[2])];});
    ctx.save();ctx.filter='blur(8px)';ctx.fillStyle='#0005';ctx.beginPath();boundary.forEach(([x,y,z],i)=>{const q=project(x+z*.5,y-z*.66,-.01);i?ctx.lineTo(...q):ctx.moveTo(...q);});ctx.closePath();ctx.fill();ctx.restore();
    const count=128,strips=[];
    for(let i=0;i<count;i++){
      const u0=f.min+(f.max-f.min)*i/count,u1=f.min+(f.max-f.min)*(i+1)/count;
      const q=[point(u0,maxV,f),point(u1,maxV,f),point(u1,minV,f),point(u0,minV,f)];
      const mid=point((u0+u1)/2,(minV+maxV)/2,f),theta=Math.min(Math.max(0,((u0+u1)/2-f.a)/f.r),Math.PI);
      const nx=-Math.sin(theta)*f.c,ny=Math.sin(theta)*f.s,nz=Math.cos(theta);
      const facing=nx*(W/2-mid[0])+ny*(-mid[1])+nz*(camera.position.z-mid[2]);
      strips.push({u0,u1,q,z:mid[2],front:facing>=0,shade:facing>=0?Math.max(.42,Math.min(1.04,.4+.6*Math.max(0,(-.35*nx+.6*ny+nz)/1.217)/.823)):.91});
    }
    strips.sort((a,b)=>a.z-b.z);
    for(const strip of strips){
      const tex=strip.front?rotatedFront:rotatedBack,sx=(strip.u0-f.min)*ppu,sw=(strip.u1-strip.u0)*ppu,sh=tex.height;
      const q=strip.q.map(v=>project(...v));
      // A slight overlap prevents hairline gaps between adjacent textured strips.
      const dx=(q[1][0]-q[0][0]),dy=q[1][1]-q[0][1],length=Math.hypot(dx,dy)||1,ex=dx/length*1.4,ey=dy/length*1.4;
      q[0][0]-=ex;q[0][1]-=ey;q[3][0]-=ex;q[3][1]-=ey;q[1][0]+=ex;q[1][1]+=ey;q[2][0]+=ex;q[2][1]+=ey;
      ctx.filter='none';
      if(!strip.front){const tone=Math.round(251*(.84+.14*Math.abs(Math.cos(Math.min(Math.max(0,((strip.u0+strip.u1)/2-f.a)/f.r),Math.PI)))));ctx.fillStyle=`rgb(${tone},${Math.round(tone*.973)},${Math.round(tone*.915)})`;ctx.beginPath();ctx.moveTo(...q[0]);for(let j=1;j<4;j++)ctx.lineTo(...q[j]);ctx.closePath();ctx.fill();continue;}
      triangle(tex,sx,sw,sh,q[0],q[1],q[2],false);triangle(tex,sx,sw,sh,q[0],q[2],q[3],true);
    }
    ctx.filter='none';ctx.strokeStyle='#f8e8bd99';ctx.lineWidth=.7;ctx.beginPath();boundary.forEach((q,i)=>{const v=project(...q);i?ctx.lineTo(...v):ctx.moveTo(...v);});ctx.closePath();ctx.stroke();
  }
  return {domElement:canvas,shadowMap:{},capabilities:{getMaxAnisotropy:()=>1},setPixelRatio(v){pixelRatio=Math.min(v,1.3);},setSize(w,h){canvas.width=Math.round(w*pixelRatio);canvas.height=Math.round(h*pixelRatio);canvas.style.width=w+'px';canvas.style.height=h+'px';},render};
}

window.addEventListener('message',event=>{
 if(!embedded||event.origin!==location.origin||event.source!==parent)return;
 if(event.data?.type==='book-pages-back')previousPage();
 if(event.data?.type==='book-pages-navigate'&&ready&&!animation){const name=event.data.page;if(['welcome','author','library'].includes(name)){prepareStep(name==='library'?1:0,name==='welcome'?0:1);showState();}}
 if(event.data?.type==='book-pages-reset'){prepareStep(0,0);showState();if(!embeddedActive)video.pause();}
});
