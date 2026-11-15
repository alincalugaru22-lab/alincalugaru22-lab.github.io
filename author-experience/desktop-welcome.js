// Play the complete original 1920 × 1080 scene; its lettering and feather are embedded.
export function welcomeFrame(w,h){const scale=Math.min(w/1920,h/1080);return {x:(w-1920*scale)/2,y:(h-1080*scale)/2,w:1920*scale,h:1080*scale,scale}}
export function desktopWelcomeButton(w,h){const r=welcomeFrame(w,h);return {left:r.x+318*r.scale,top:r.y+922*r.scale,width:448*r.scale,height:Math.max(66*r.scale,44*h/innerHeight)}}
export function paintDesktopWelcome(ctx,w,h,source,ratio){
 const sw=source.videoWidth||source.naturalWidth,sh=source.videoHeight||source.naturalHeight;if(!sw||!sh)return;
 const r=welcomeFrame(w,h);ctx.fillStyle='#061322';ctx.fillRect(0,0,w,h);
 // Preserve the complete original frame and its proportions; never stretch the footage.
 ctx.drawImage(source,0,0,sw,sh,r.x,r.y,r.w,r.h);
 document.body.dataset.welcomeMotion='complete-original-1920x1080';
 // The approved invitation remains live text, in the original scene's empty right-hand sky.
 ctx.save();ctx.textAlign='center';ctx.textBaseline='top';ctx.lineJoin='round';const cx=r.x+1510*r.scale;
 function ink(text,y){const size=43*r.scale;ctx.font=`${size}px WelcomeCalligraphy`;const fit=Math.min(1,715*r.scale/ctx.measureText(text).width);ctx.save();ctx.translate(cx,r.y+y*r.scale);ctx.scale(fit,1);ctx.shadowColor='#03101de6';ctx.shadowBlur=4*ratio;ctx.shadowOffsetY=2*ratio;ctx.fillStyle='#70400e';ctx.fillText(text,0,1.5*ratio);ctx.shadowBlur=0;ctx.shadowOffsetY=0;const gold=ctx.createLinearGradient(0,0,0,size);for(const[a,c]of [[0,'#fff7d7'],[.18,'#ffe4a0'],[.36,'#c88c29'],[.49,'#fff1ba'],[.62,'#e5b34c'],[.78,'#ffdf83'],[1,'#a66a20']])gold.addColorStop(a,c);ctx.fillStyle=gold;ctx.fillText(text,0,0);ctx.restore()}
 ink('Every book opens a door.',155);ink('Which world will you enter?',218);
 const b=desktopWelcomeButton(w,h);ctx.beginPath();ctx.roundRect(b.left-2*r.scale,b.top-2*r.scale,b.width+4*r.scale,b.height+4*r.scale,b.height/2);ctx.fillStyle='#052422';ctx.fill();ctx.strokeStyle='#e7c57e';ctx.lineWidth=1.3*ratio;ctx.stroke();ctx.fillStyle='#ffedba';ctx.font=`${Math.max(24*r.scale,14*w/innerWidth)}px Georgia`;ctx.textBaseline='middle';ctx.fillText('ENTER MY WORLD   →',b.left+b.width/2,b.top+b.height/2);ctx.restore();
}
