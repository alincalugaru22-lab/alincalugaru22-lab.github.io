(()=>{'use strict';
const names=['opening','welcome','author','flight','library'];
const audio=document.createElement('audio');audio.id='site-music';audio.hidden=true;audio.loop=true;audio.preload='auto';audio.volume=.36;document.body.append(audio);
const button=document.querySelector('#sound'),frame=document.querySelector('#library-v2');let selected=-1,enabled=true,unlocked=false,generation=0,fade=0;
function announce(){const playing=enabled&&!audio.paused;button.textContent=playing?'♫ MUSIC ON':'♫ ENABLE MUSIC';button.setAttribute('aria-label',playing?'Mute music':'Enable music');button.setAttribute('aria-pressed',String(playing));audio.dataset.section=names[selected]||'opening';frame.contentWindow.postMessage({type:'bnd-music-state',enabled:playing},location.origin)}
function ramp(target,duration,ticket,done){cancelAnimationFrame(fade);const initial=audio.volume,start=performance.now();function tick(now){if(ticket!==generation)return;const t=Math.min(1,(now-start)/duration);audio.volume=initial+(target-initial)*t;if(t<1)fade=requestAnimationFrame(tick);else done?.()}fade=requestAnimationFrame(tick)}
function select(n){const section=Math.min(4,Math.max(0,n)),changed=section!==selected;selected=section;const ticket=++generation;cancelAnimationFrame(fade);
 const load=()=>{if(ticket!==generation)return;if(changed){audio.src='assets/audio/'+names[selected]+'.mp3';audio.volume=0}audio.dataset.section=names[selected];if(!enabled){audio.pause();announce();return}audio.play().then(()=>{if(ticket!==generation)return;unlocked=true;announce();ramp(.36,450,ticket)}).catch(()=>{if(ticket===generation)announce()})};
 if(changed&&!audio.paused&&audio.volume>.01)ramp(0,220,ticket,load);else load();}
function setEnabled(value){enabled=value;window.dispatchEvent(new CustomEvent('bnd-audio-state',{detail:enabled}));if(!enabled){generation++;cancelAnimationFrame(fade);audio.pause();announce()}else select(selected<0?0:selected)}
window.BNDMusic={select,setEnabled,getEnabled:()=>enabled};
button.addEventListener('click',()=>setEnabled(!(enabled&&!audio.paused)));
function unlock(e){if(enabled&&!unlocked&&!e.target.closest('#sound'))select(selected<0?0:selected)}
document.addEventListener('pointerdown',unlock,{capture:true});document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')unlock(e)},{capture:true});
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow)return;if(e.data?.type==='bnd-music-toggle')setEnabled(!(enabled&&!audio.paused));if(e.data?.type==='bnd-music-query')announce()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){generation++;cancelAnimationFrame(fade);audio.pause()}else if(enabled)select(selected)});
window.addEventListener('pagehide',()=>{generation++;cancelAnimationFrame(fade);audio.pause()});select(0);
})();
