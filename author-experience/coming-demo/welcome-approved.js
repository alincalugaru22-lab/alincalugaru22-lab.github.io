// Approved centered-feather composition. Lettering and feather stay still while water moves.
const artwork=new Image();artwork.src='assets/approved/welcome-centered-gold.png';
export const welcomeArtworkReady=artwork.decode();
export function welcomeArtRect(w,h){if(w/h<=.72)return {x:0,y:0,w,h};const scale=Math.min(w/artwork.naturalWidth,h/artwork.naturalHeight),dw=artwork.naturalWidth*scale,dh=artwork.naturalHeight*scale;return {x:(w-dw)/2,y:(h-dh)/2,w:dw,h:dh}}
export function welcomeButtonRect(w,h){const r=welcomeArtRect(w,h);return {left:r.x+r.w*.139,top:r.y+r.h*.895,width:r.w*.722,height:Math.max(44,r.h*.075)}}
export function paintApprovedWelcome(ctx,w,h,time){
 const r=welcomeArtRect(w,h);ctx.save();ctx.fillStyle='#061322';ctx.fillRect(0,0,w,h);
 if(r.x>0||r.y>0){ctx.save();ctx.filter='blur(28px) brightness(.35)';ctx.drawImage(artwork,-30,-30,w+60,h+60);ctx.restore()}
 ctx.drawImage(artwork,r.x,r.y,r.w,r.h);
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.hidden){
  ctx.save();ctx.translate(r.x,r.y);ctx.scale(r.w/1024,r.h/1536);
  // Even-odd clipping protects the border, every gold line, the full feather and the button.
  ctx.beginPath();ctx.rect(28,576,968,785);
  ctx.rect(135,622,754,96);ctx.rect(120,741,790,154);
  ctx.moveTo(250,1320);ctx.lineTo(250,1180);ctx.lineTo(400,1010);ctx.lineTo(620,895);ctx.lineTo(880,895);ctx.lineTo(885,1060);ctx.lineTo(640,1230);ctx.lineTo(430,1335);ctx.closePath();
  ctx.clip('evenodd');
  const phase=time*.00072;
  for(let sy=576;sy<1360;sy+=4){const shore=Math.max(0,Math.min(1,(sy-576)/500)),dx=Math.sin(phase+sy*.032)*(.7+shore*1.8),dy=Math.sin(phase*.72+sy*.018)*1.1;ctx.drawImage(artwork,15,sy-2,994,8,15+dx,sy-2+dy,994,8)}
  ctx.restore();
  // The existing star at the nib breathes very gently, without moving the feather.
  const glow=.035+.025*Math.sin(time*.0014);ctx.save();ctx.translate(r.x+r.w*.323,r.y+r.h*.837);const rad=Math.min(r.w,r.h)*.04,g=ctx.createRadialGradient(0,0,0,0,0,rad);g.addColorStop(0,`rgba(255,239,176,${glow})`);g.addColorStop(1,'rgba(255,197,86,0)');ctx.fillStyle=g;ctx.fillRect(-rad,-rad,rad*2,rad*2);ctx.restore();
 }
 ctx.restore();
}
