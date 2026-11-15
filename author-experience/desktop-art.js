// Desktop scenery decoded from bundled bytes, without image requests or data URLs.
const loaders={author:()=>import('./desktop-art-author.js?v=original-wide-r4'),welcome:()=>import('./desktop-art-welcome.js?v=original-wide-r4'),library:()=>import('./desktop-art-library.js?v=original-wide-r4')},states=new Map();
export function getArt(name){return states.get(name)?.image}
export function requestArt(name){
 if(states.has(name))return states.get(name).promise;
 const state={};states.set(name,state);
 state.promise=loaders[name]().then(async({encoded})=>{
  const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),blob=new Blob([bytes],{type:'image/webp'});
  let image;
  if(typeof createImageBitmap==='function')image=await createImageBitmap(blob);
  else{const url=URL.createObjectURL(blob);image=new Image();image.src=url;await image.decode();URL.revokeObjectURL(url)}
  state.image=image;document.documentElement.dataset[name+'Art']='bitmap';
  document.documentElement.classList.add(name+'-art-ready');
  dispatchEvent(new CustomEvent('desktop-art-ready',{detail:{name}}));return image;
 });
 state.promise.catch(()=>{document.documentElement.dataset[name+'Art']='error'});return state.promise;
}
