import {readerCaptions} from './reader-captions.js?v=l91-1';
// Original artwork stays intact. Only the screen layout is drawn here.
// The parchment's edges and blank texture come from the saved original LATITUDE page.
const parchment=new Image();parchment.src='assets/reader/parchment-original-source.png';
export const parchmentReady=parchment.decode();
export function captionFor(book,index){return index<0?'':readerCaptions[book.id]?.[index]||''}
function contain(g,im,x,y,w,h){const s=Math.min(w/im.width,h/im.height),dw=im.width*s,dh=im.height*s;g.drawImage(im,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
function background(g,im,w,h){const s=Math.max(w/im.width,h/im.height),dw=im.width*s,dh=im.height*s;g.save();g.filter='blur(22px)';g.drawImage(im,(w-dw)/2-25,(h-dh)/2-25,dw+50,dh+50);g.restore();g.fillStyle='#05131d9c';g.fillRect(0,0,w,h)}
function scroll(g,x,y,w,h){
 g.save();g.shadowColor='#0009';g.shadowBlur=15;g.shadowOffsetY=5;g.fillStyle='#e9c58f';
 g.beginPath();g.moveTo(x+12,y+9);g.quadraticCurveTo(x+w*.4,y+16,x+w-13,y+4);g.lineTo(x+w-4,y+32);g.lineTo(x+w-10,y+h*.58);g.lineTo(x+w-3,y+h-19);g.quadraticCurveTo(x+w*.55,y+h+3,x+9,y+h-7);g.lineTo(x+3,y+h-30);g.lineTo(x+10,y+h*.36);g.closePath();g.fill();g.shadowColor='transparent';g.clip();
 // Nine-slice layout: text-bearing center of the source is never used.
 const sx=14,sy=950,sw=995,sh=557,l=62,r=62,t=87,b=48,L=Math.min(24,w*.07),R=L,T=Math.min(31,h*.16),B=Math.min(20,h*.1);
 const tile=document.createElement('canvas');tile.width=100;tile.height=26;tile.getContext('2d').drawImage(parchment,350,1340,100,26,0,0,100,26);
 g.fillStyle=g.createPattern(tile,'repeat');g.fillRect(x,y,w,h);
 const xs=[sx,sx+l,sx+sw-r],ys=[sy,sy+t,sy+sh-b],ws=[l,sw-l-r,r],hs=[t,sh-t-b,b],dx=[x,x+L,x+w-R],dy=[y,y+T,y+h-B],dw=[L,w-L-R,R],dh=[T,h-T-B,B];
 for(let j=0;j<3;j++)for(let i=0;i<3;i++)if(i!==1||j!==1)g.drawImage(parchment,xs[i],ys[j],ws[i],hs[j],dx[i],dy[j],dw[i],dh[j]);
 g.restore();
}
function wrap(g,text,max){const lines=[];for(const p of text.split('\n')){if(!p){lines.push('');continue}let line='';for(const word of p.split(/\s+/)){const trial=line?line+' '+word:word;if(g.measureText(trial).width>max&&line){lines.push(line);line=word}else line=trial}lines.push(line)}return lines}
function copy(g,text,x,y,w,h,base){let size=base,lines;do{g.font=`italic ${size}px Georgia`;lines=wrap(g,text,w);if(lines.length*size*1.4<=h)break;size--}while(size>10);g.fillStyle='#291a10';g.textAlign='center';g.textBaseline='middle';const lineH=size*1.4,start=y+(h-lines.length*lineH)/2+lineH/2;lines.forEach((line,i)=>g.fillText(line,x+w/2,start+i*lineH))}
export function paintIllustratedPage(ctx,image){
 const W=ctx.canvas.width,H=ctx.canvas.height;if(!image)return;const scale=ctx.canvas._cssWidth?W/ctx.canvas._cssWidth:Math.min(devicePixelRatio||1,1.7,1800/Math.max(innerWidth,innerHeight));const w=W/scale,h=H/scale;
 ctx.save();ctx.setTransform(scale,0,0,scale,0,0);background(ctx,image,w,h);
 const caption=image.readerCaption;
 if(!caption||image.width<image.height){contain(ctx,image,0,0,w,h)}
 else if(w/h<.95){
  const artH=Math.min(w*image.height/image.width,h*.57),paperH=Math.min(h-artH-22,Math.max(170,h*.42)),total=artH+paperH+12,top=Math.max(3,(h-total)/2);
  contain(ctx,image,0,top,w,artH);scroll(ctx,8,top+artH+12,w-16,paperH);copy(ctx,caption,35,top+artH+39,w-70,paperH-56,Math.min(25,Math.max(18,w*.058)));
 }else{
  const gap=18,artW=w*.69,paperW=w-artW-gap-16,paperH=Math.min(h-24,paperW*1.35),py=(h-paperH)/2;
  contain(ctx,image,0,4,artW,h-8);scroll(ctx,artW+gap,py,paperW,paperH);copy(ctx,caption,artW+gap+30,py+35,paperW-60,paperH-70,Math.min(25,Math.max(17,w*.019)));
 }
 ctx.restore();
}
