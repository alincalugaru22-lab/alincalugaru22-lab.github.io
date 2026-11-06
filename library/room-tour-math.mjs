export const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
export const angleDelta=(angle,origin)=>((angle-origin+540)%360)-180;
export function orientationView(alpha,beta,gamma){
  if(![alpha,beta,gamma].every(Number.isFinite))return null;
  const a=alpha*Math.PI/180,b=beta*Math.PI/180,g=gamma*Math.PI/180;
  const x=-Math.cos(a)*Math.sin(g)+Math.sin(a)*Math.sin(b)*Math.cos(g);
  const y=-Math.sin(a)*Math.sin(g)-Math.cos(a)*Math.sin(b)*Math.cos(g);
  const z=-Math.cos(b)*Math.cos(g);
  return {yaw:Math.atan2(x,-y)*180/Math.PI,pitch:Math.asin(clamp(z,-1,1))*180/Math.PI};
}
export function continuousView(reading,previous){
  return {...reading,continuousYaw:previous?previous.continuousYaw+angleDelta(reading.yaw,previous.yaw):reading.yaw};
}
export function motionTarget(reading,base,anchor={x:.5,y:.5}){
  return {x:clamp(anchor.x-(Number.isFinite(reading.continuousYaw)&&Number.isFinite(base.continuousYaw)?reading.continuousYaw-base.continuousYaw:angleDelta(reading.yaw,base.yaw))/76),y:clamp(anchor.y-(reading.pitch-base.pitch)/48)};
}
export function cameraSize(width,height,sourceWidth=1920,sourceHeight=1080){
  const scale=Math.max(width/sourceWidth,height/sourceHeight)*1.18;
  return {width:sourceWidth*scale,height:sourceHeight*scale};
}
