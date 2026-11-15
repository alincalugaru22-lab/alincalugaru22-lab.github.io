// Presentation layer only. Original illustrations and navigation are untouched.
export const bookThemes={
 spark:{kind:'sparks',label:'Golden and blue sparks',colors:['#030b20','#162442','#472e25']},
 happiness:{kind:'garden',label:'Rose garden',image:'assets/approved/biography-living-garden.png',colors:['#071b12','#203f25','#533621']},
 earth:{kind:'nature',label:'Earth wilderness and sunset',image:'assets/collection/earth-5.webp',colors:['#152714','#3d5838','#64482c']},
 genius:{kind:'circuit',label:'Artificial intelligence and technology',image:'assets/collection/genius-2.webp',colors:['#03182b','#163b56','#614126']},
 veritasis:{kind:'library',label:'Chess and the library',image:'assets/collection/veritasis-1.webp',colors:['#110e18','#343046','#654a2b']},
 ailo:{kind:'circuit',label:'AILO and the cafe',image:'assets/collection/ailo-1.webp',colors:['#061b23','#14404a','#695034']},
 zidarun:{kind:'temple',label:'Zidarun Duat original world',image:'assets/collection/zidarun-4.webp',colors:['#1c142b','#3d2d54','#745a2b']},
 laststep:{kind:'mist',label:'The First Trace original landscape',image:'assets/collection/laststep-1.webp',colors:['#112031','#354856','#8c6c42']},
 overpark:{kind:'city',label:'Urban parking and city architecture',image:'assets/collection/overpark-1.webp',colors:['#082d3c','#285763','#65755a']},
 utcn:{kind:'transit',label:'Container port and transport network',image:'assets/collection/utcn-1.webp',colors:['#06263a','#234c66','#697b82']},
 etincelle:{kind:'sparks',label:'Golden and blue sparks',colors:['#071329','#1c3553','#503b29']},
 moki:{kind:'garden',label:'Flower Hill and the rabbit garden',image:'assets/collection/moki-1.webp',colors:['#142b20','#426842','#9c7949']},
 thirteen:{kind:'circuit',label:'S-13 original mystery',image:'assets/collection/thirteen-1.webp',colors:['#04182c','#1b3a53','#50453e']},
 return:{kind:'mist',label:'Return to the First Age original scene',image:'assets/collection/return-1.webp',colors:['#1e1c1d','#514a3b','#b0874d']},
 mufilo:{kind:'meadow',label:'Mufilo, the farm and Mount Fuji',image:'assets/collection/mufilo-2.webp',colors:['#172b1a','#4b653c','#b38b57']},
 latitude:{kind:'aurora',label:'Antarctic ice wall and polar light',image:'assets/universe/latitude-page-2.png',colors:['#041c32','#175273','#9ac2c7']},
 nodia:{kind:'waterfall',label:'NODIA castles and waterfalls',image:'assets/universe/nodia-book-ii.jpg',colors:['#051c33','#28546b','#b39352']},
 vareth:{kind:'city',label:'VARETH mountain city',image:'assets/universe/vareth-book-iii.jpg',colors:['#08192e','#3f4e66','#bb8c43']},
 'my-angel':{kind:'garden',label:'The angel, flowers and the cafe',image:'assets/collection/my-angel/page-2.png',colors:['#08252c','#36584c','#b48451']}
};
const cache=new Map();let active=null;
function keyFor(book){if(book.id)return book.id;return ['latitude','nodia','vareth'].find(id=>book.cover.includes(id==='latitude'?'latitude-91':id))||'spark'}
function imageFor(url){if(!cache.has(url)){const image=new Image();image.src=url;cache.set(url,image.decode().then(()=>image).catch(()=>null));}return cache.get(url)}
function seedRandom(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
function makeBackdrop(state){
 const dpr=Math.min(devicePixelRatio||1,1.25),c=document.createElement('canvas');c.width=Math.ceil(innerWidth*dpr);c.height=Math.ceil(innerHeight*dpr);const g=c.getContext('2d'),w=c.width,h=c.height,t=state.theme;
 let gradient=g.createLinearGradient(0,0,w,h);t.colors.forEach((v,i)=>gradient.addColorStop(i/2,v));g.fillStyle=gradient;g.fillRect(0,0,w,h);
 if(state.image){const image=state.image,s=Math.max(w/image.width,h/image.height),dw=image.width*s,dh=image.height*s;g.drawImage(image,(w-dw)/2,(h-dh)/2,dw,dh);g.fillStyle=t.kind==='garden'?'#071a103d':'#04121d94';g.fillRect(0,0,w,h)}
 if(t.kind==='sparks'){
  gradient=g.createRadialGradient(w*.7,h*.28,0,w*.7,h*.28,w*.9);gradient.addColorStop(0,'#b4823444');gradient.addColorStop(.4,'#397ec52b');gradient.addColorStop(1,'#04091c00');g.fillStyle=gradient;g.fillRect(0,0,w,h);
  const random=seedRandom(910127);for(let i=0;i<160;i++){const x=random()*w,y=random()*h,r=(.7+random()*1.8)*dpr;g.fillStyle=i%4?'#ffdf9a':'#a1dbff';g.shadowColor=i%4?'#ffaf26':'#55adff';g.shadowBlur=r*7;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();if(i%13===0){g.lineWidth=.65*dpr;g.strokeStyle='#ffe7b4aa';g.beginPath();g.moveTo(x-r*5,y);g.lineTo(x+r*5,y);g.moveTo(x,y-r*5);g.lineTo(x,y+r*5);g.stroke()}}
  g.shadowBlur=0;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-w*.2,h*(.25+i*.22));g.bezierCurveTo(w*.9,h*(i*.23),w*.05,h*(.8-i*.1),w*1.2,h*(.42+i*.22));g.strokeStyle=i===1?'#70caff80':'#ffd7838c';g.lineWidth=dpr*(i===1?1:1.7);g.shadowColor=i===1?'#49a8ff':'#ffd06a';g.shadowBlur=12*dpr;g.stroke()}g.shadowBlur=0;
 }else if(t.kind==='circuit'||t.kind==='transit'){
  const random=seedRandom(12813);g.strokeStyle='#80cfff4a';g.lineWidth=dpr;for(let i=0;i<20;i++){const x=random()*w,y=random()*h;g.beginPath();g.moveTo(x,y);g.lineTo(x+w*.12,y);g.lineTo(x+w*.18,y-h*.05);g.stroke();g.fillStyle='#c2eaff8c';g.fillRect(x-2*dpr,y-2*dpr,4*dpr,4*dpr)}
 }
 gradient=g.createRadialGradient(w*.5,h*.45,w*.2,w*.5,h*.45,h*.85);gradient.addColorStop(0,'#02101800');gradient.addColorStop(1,'#020a18c2');g.fillStyle=gradient;g.fillRect(0,0,w,h);
 state.canvas=c;state.viewport=[innerWidth,innerHeight];const url=`url("${c.toDataURL('image/jpeg',.9)}")`;for(const node of state.nodes)node.style.setProperty('--book-backdrop',url);
}
export function activateBookTheme(book,reader,zoom,onReady){
 const id=keyFor(book),state={id,cover:book.cover,theme:bookThemes[id]||bookThemes.spark,nodes:[reader,zoom],image:null,canvas:null};active=state;
 for(const node of state.nodes){node.dataset.bookTheme=id;node.setAttribute('data-backdrop-description',state.theme.label)}makeBackdrop(state);
 if(state.theme.image)imageFor(state.theme.image).then(image=>{if(active!==state||!image)return;state.image=image;makeBackdrop(state);onReady?.()});
}
export function paintBookBackdrop(ctx,w,h,host){
 if(!active){ctx.fillStyle='#061322';ctx.fillRect(0,0,w,h);return}
 if(active.viewport[0]!==innerWidth||active.viewport[1]!==innerHeight)makeBackdrop(active);
 const c=active.canvas,r=host.getBoundingClientRect(),sx=c.width/innerWidth,sy=c.height/innerHeight;
 ctx.drawImage(c,r.left*sx,r.top*sy,r.width*sx,r.height*sy,0,0,w,h);
}
export function paintBookFrame(ctx,image,x,y,w,h,ratio){
 const cover=!!active&&image.src?.endsWith(active.cover),gap=5*ratio,edge=cover?8*ratio:6*ratio;
 ctx.save();ctx.shadowColor='#000c';ctx.shadowBlur=17*ratio;ctx.shadowOffsetY=7*ratio;ctx.fillStyle=cover?'#2a1a12':'#f0e1bd';ctx.fillRect(x-edge,y-edge,w+edge*2,h+edge*2);ctx.shadowColor='transparent';
 const gradient=ctx.createLinearGradient(x,y,x+w,y+h);gradient.addColorStop(0,'#fff2bb');gradient.addColorStop(.2,'#bb8330');gradient.addColorStop(.48,'#f5d991');gradient.addColorStop(.76,'#a56e22');gradient.addColorStop(1,'#ffe7a3');ctx.strokeStyle=gradient;ctx.lineWidth=1.5*ratio;ctx.strokeRect(x-edge+ratio,y-edge+ratio,w+(edge-ratio)*2,h+(edge-ratio)*2);
 ctx.lineWidth=.65*ratio;ctx.strokeRect(x-gap,y-gap,w+gap*2,h+gap*2);
 // The spine and page edges sit outside the original artwork.
 ctx.fillStyle=cover?'#160f0acf':'#d0bb8a';ctx.fillRect(x-edge+2*ratio,y-edge+2*ratio,2*ratio,h+edge*2-4*ratio);
 ctx.strokeStyle=cover?'#efd7a581':'#ac956773';ctx.lineWidth=.55*ratio;for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(x+w+i*ratio,y);ctx.lineTo(x+w+i*ratio,y+h);ctx.stroke()}
 ctx.restore();
}
