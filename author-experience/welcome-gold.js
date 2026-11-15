// Static embossed gold lettering. No timer, animated gradient or handwriting effect.
export function paintStaticWelcome(ctx,w,h,ratio){
 if(w/h>.85){const textWidth=h*.65;ctx.save();ctx.translate((w-textWidth)/2,0);paintStaticWelcome(ctx,textWidth,h,ratio);ctx.restore();return}
 ctx.save();ctx.textAlign='center';ctx.textBaseline='top';ctx.lineJoin='round';
 function ink(text,size,y,maxWidth){
  ctx.font=`${size}px WelcomeCalligraphy`;const measured=ctx.measureText(text).width,scale=Math.min(1,maxWidth/measured);
  ctx.save();ctx.translate(w/2,y);ctx.scale(scale,1);
  // Fine extrusion under the polished face creates depth without a bulky outline.
  ctx.shadowColor='#03101de6';ctx.shadowBlur=3.8*ratio;ctx.shadowOffsetX=.9*ratio;ctx.shadowOffsetY=2.1*ratio;
  ctx.fillStyle='#6d3e10';ctx.fillText(text,0,1.65*ratio);ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
  const gold=ctx.createLinearGradient(0,0,size*.20,size*.92);
  for(const[at,color]of [[0,'#fff7d7'],[.18,'#ffe4a0'],[.36,'#c88c29'],[.49,'#fff1ba'],[.62,'#e5b34c'],[.78,'#ffdf83'],[1,'#a66a20']])gold.addColorStop(at,color);
  ctx.strokeStyle='#b6812d';ctx.lineWidth=.42*ratio;ctx.strokeText(text,0,0);ctx.fillStyle=gold;ctx.fillText(text,0,0);
  ctx.globalAlpha=.48;ctx.strokeStyle='#fff2bd';ctx.lineWidth=.30*ratio;ctx.strokeText(text,-.28*ratio,-.32*ratio);ctx.restore();
 }
 ink('Alin Alex Calugaru',w*.073,h*.149,w*.79);
 ink('Welcome to',w*.105,h*.244,w*.80);
 ink('my world',w*.242,h*.308,w*.89);
 ctx.fillStyle='#e7c172';ctx.font=`${.04*w}px Georgia`;ctx.fillText('✦',w*.5,h*.48);
 ctx.strokeStyle='#e7c172b0';ctx.lineWidth=ratio;ctx.beginPath();ctx.moveTo(w*.25,h*.5);ctx.lineTo(w*.44,h*.5);ctx.moveTo(w*.56,h*.5);ctx.lineTo(w*.75,h*.5);ctx.stroke();
 ink('Where Books Never Die',w*.078,h*.522,w*.88);
 ink('Every book opens a door.',w*.055,h*.625,w*.77);
 ink('Which world will you enter?',w*.055,h*.667,w*.80);
 ctx.restore();
}
