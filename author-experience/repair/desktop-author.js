import {wideLayout as desktop} from './responsive-layout.js?v=repair7';
export function isDesktopAuthor(){return desktop.matches}
export function authorFrame(w,h){const s=Math.min(w/1920,h/1000);return {s,x:(w-1920*s)/2,y:(h-1000*s)/2}}
export function desktopAuthorButton(w,h){const {s,x,y}=authorFrame(w,h);return {left:x+990*s,top:y+917*s,width:568*s,height:Math.max(68*s,44*h/innerHeight)}}
export function paintDesktopAuthor(ctx,w,h,source){
 if(!desktop.matches)return false;const sw=source?.videoWidth||source?.naturalWidth,sh=source?.videoHeight||source?.naturalHeight;if(!sw||!sh)return false;
 const {s,x,y}=authorFrame(w,h);ctx.fillStyle='#061322';ctx.fillRect(0,0,w,h);ctx.drawImage(source,0,0,sw,sh,x,y,1920*s,1000*s);return true;
}
export function prepareDesktopAuthor(host,video){
 // Play the native video directly. No second animation loop can freeze the visible image.
 host.classList.add('desktop-author-native');
 video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');
}
