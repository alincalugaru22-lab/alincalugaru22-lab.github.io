import * as THREE from './vendor/three.module.js';
import {paintBookBackdrop,paintBookFrame} from './book-themes.js?v=original-wide-r4';
// Geometry, shading and Canvas3D fallback copied unchanged from the approved Welcome demo.
export function createDemoPaper(host){
let width=host.clientWidth,height=host.clientHeight,ratio=1,progress=0,animation=null,lastGeometry=-1,geometry,front,back,edgeLines,underlay,shadowPlane;
const W=2;let H=W*height/width;
const frontCanvas=document.createElement('canvas'),backCanvas=document.createElement('canvas'),aboutCanvas=document.createElement('canvas');
const fc=frontCanvas.getContext('2d',{alpha:false}),bc=backCanvas.getContext('2d',{alpha:false}),ac=aboutCanvas.getContext('2d',{alpha:false});
let renderer,software=false,foldState;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(error){software=true;renderer=softwareRenderer();}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));renderer.setSize(width,height);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
host.append(renderer.domElement);host.dataset.renderer=software?'Canvas3D':'WebGL';
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
  if(software){renderNeeded=true;host.dataset.progress=p.toFixed(3);return;}
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
  host.dataset.progress=p.toFixed(3);
}
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

let raf=0,disposed=false,resolveTurn=null,currentFront=null,currentUnder=null;
function paintImage(ctx,image){const w=ctx.canvas.width,h=ctx.canvas.height;paintBookBackdrop(ctx,w,h,host);if(!image)return;const sw=image.naturalWidth||image.width,sh=image.naturalHeight||image.height;if(!sw||!sh)return;const margin=12*ratio,scale=Math.min((w-margin*2)/sw,(h-margin*2)/sh),dw=sw*scale,dh=sh*scale,x=(w-dw)/2,y=(h-dh)/2;paintBookFrame(ctx,image,x,y,dw,dh,ratio);ctx.drawImage(image,x,y,dw,dh);}
function resize(){if(disposed)return;width=host.clientWidth;height=host.clientHeight;if(!width||!height)return;ratio=Math.min(devicePixelRatio||1,1.7,1800/Math.max(width,height));for(const c of [frontCanvas,backCanvas,aboutCanvas]){c.width=Math.round(width*ratio);c.height=Math.round(height*ratio);}renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));renderer.setSize(width,height);paintImage(fc,currentFront);paintImage(ac,currentUnder);frontTexture.needsUpdate=aboutTexture.needsUpdate=true;paintBack();build();renderNeeded=true;}
function setPages(a,b,p=0){currentFront=a;currentUnder=b;progress=p;paintImage(fc,a);paintImage(ac,b);paintBack();frontTexture.needsUpdate=aboutTexture.needsUpdate=true;lastGeometry=-1;deform(progress);renderNeeded=true;}
function frame(time){if(disposed)return;raf=requestAnimationFrame(frame);if(document.hidden)return;if(animation){const t=clamp((time-animation.at)/animation.duration),e=t*t*(3-2*t);progress=animation.from+(animation.to-animation.from)*e;if(t>=1){progress=animation.to;animation=null;host.dataset.state='read';const done=resolveTurn;resolveTurn=null;done?.(true);}}deform(progress);if(renderNeeded){renderer.render(scene,camera);renderNeeded=false;}}
function animateTo(target){host.dataset.state='turning';return new Promise(resolve=>{resolveTurn=resolve;animation={from:progress,to:target,at:performance.now(),duration:Math.max(450,Math.abs(target-progress)*1650)};});}
resize();raf=requestAnimationFrame(frame);
return {setPages,resize,animateTo,setProgress(p){progress=clamp(p);deform(progress);renderNeeded=true;},resizeIfNeeded(){if(host.clientWidth!==width||host.clientHeight!==height)resize();},get progress(){return progress},get busy(){return !!animation},dispose(){disposed=true;cancelAnimationFrame(raf);resolveTurn?.(false);resolveTurn=null;geometry?.dispose();frontMaterial.dispose();backMaterial.dispose();frontTexture.dispose();backTexture.dispose();aboutTexture.dispose();renderer.dispose?.();renderer.forceContextLoss?.();renderer.domElement.remove();}};
}
