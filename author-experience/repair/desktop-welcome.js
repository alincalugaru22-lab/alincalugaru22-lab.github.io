// One continuous original video frame; the same uniform scale applies to both axes.
export function desktopWelcomeButton(w,h){return {left:w*.145,top:h*.855,width:w*.34,height:Math.max(h*.072,44*h/innerHeight)}}
export function paintDesktopWelcome(ctx,w,h,source,ratio){
 const sw=source.videoWidth||source.naturalWidth,sh=source.videoHeight||source.naturalHeight;if(!sw||!sh)return;
 const x=30*sw/816,cw=756*sw/816,ch=cw*h/w,bottom=980*sh/1080,y=Math.max(0,bottom-ch);
 ctx.drawImage(source,x,y,cw,ch,0,0,w,h);
 document.body.dataset.welcomeMotion='single-continuous-original-frame';
 // A subtle left-side shade supports lettering without blurring the scenery.
 const shade=ctx.createLinearGradient(0,0,w*.72,0);shade.addColorStop(0,'#021426b3');shade.addColorStop(.7,'#02142680');shade.addColorStop(1,'transparent');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
 ctx.save();ctx.textAlign='center';ctx.textBaseline='top';ctx.lineJoin='round';const cx=w*.315;
 function ink(text,size,y,maxWidth){ctx.font=`${size}px WelcomeCalligraphy`;const scale=Math.min(1,maxWidth/ctx.measureText(text).width);ctx.save();ctx.translate(cx,y);ctx.scale(scale,1);ctx.shadowColor='#03101de6';ctx.shadowBlur=5*ratio;ctx.shadowOffsetY=2*ratio;ctx.fillStyle='#69400f';ctx.fillText(text,0,2*ratio);ctx.shadowBlur=0;ctx.shadowOffsetY=0;const g=ctx.createLinearGradient(0,0,0,size);for(const[a,c]of [[0,'#fff7d7'],[.18,'#ffe4a0'],[.36,'#c88c29'],[.49,'#fff1ba'],[.62,'#e5b34c'],[.78,'#ffdf83'],[1,'#a66a20']])g.addColorStop(a,c);ctx.fillStyle=g;ctx.strokeStyle='#bc8c42';ctx.lineWidth=.5*ratio;ctx.strokeText(text,0,0);ctx.fillText(text,0,0);ctx.restore()}
 ink('Alin Alex Calugaru',h*.054,h*.12,w*.46);
 ink('Welcome to',h*.078,h*.245,w*.44);
 ink('my world',h*.17,h*.335,w*.50);
 ctx.fillStyle='#eac982';ctx.font=`${h*.028}px Georgia`;ctx.fillText('✦',cx,h*.527);ctx.strokeStyle='#d7b56eaa';ctx.lineWidth=ratio;ctx.beginPath();ctx.moveTo(w*.155,h*.543);ctx.lineTo(w*.275,h*.543);ctx.moveTo(w*.355,h*.543);ctx.lineTo(w*.475,h*.543);ctx.stroke();
 ink('Where Books Never Die',h*.063,h*.585,w*.49);
 ink('Every book opens a door.',h*.038,h*.705,w*.46);
 ink('Which world will you enter?',h*.038,h*.757,w*.48);
 const r=desktopWelcomeButton(w,h);ctx.shadowColor='#0008';ctx.shadowBlur=14*ratio;ctx.beginPath();ctx.roundRect(r.left,r.top,r.width,r.height,r.height/2);ctx.fillStyle='#052422ed';ctx.fill();ctx.shadowBlur=0;ctx.lineWidth=1.3*ratio;ctx.strokeStyle='#edcd88';ctx.stroke();ctx.fillStyle='#ffedba';ctx.font=`${Math.max(h*.021,14*w/innerWidth)}px Georgia`;ctx.textBaseline='middle';ctx.fillText('ENTER MY WORLD   →',cx,r.top+r.height/2);ctx.restore();
 // One outer frame, independent of the original portrait film's baked border.
 ctx.save();ctx.strokeStyle='#e5bf7199';ctx.lineWidth=ratio;ctx.strokeRect(20*ratio,20*ratio,w-40*ratio,h-40*ratio);ctx.restore();
}
