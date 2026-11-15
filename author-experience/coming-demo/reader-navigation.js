// Illustration navigation cannot accidentally return to the cover.
export function navigationTarget(index,direction,count){
 const target=index+direction;
 return target>=0&&target<count?target:null;
}
export function gestureDirection(startX,endX,width,cancelled=false){
 if(cancelled)return 0;
 const dx=startX-endX;
 return Math.abs(dx)>=12?(dx>0?1:-1):(startX>=width/2?1:-1);
}
