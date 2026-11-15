const video=document.getElementById('about-full-video'),turn=document.getElementById('turn'),music=document.getElementById('preview-music'),toggle=document.getElementById('preview-music-toggle');
function layout(){const s=Math.min(innerWidth/1920,innerHeight/1080),x=(innerWidth-1920*s)/2,y=(innerHeight-1080*s)/2;for(const[k,v]of Object.entries({'cta-x':x+990*s,'cta-y':y+917*s,'cta-w':568*s,'cta-h':Math.max(68*s,44),'more-x':x+1720*s,'more-y':y+936*s}))document.documentElement.style.setProperty('--preview-'+k,v+'px')}
layout();addEventListener('resize',layout);turn.onclick=()=>location.assign('desktop.html?library=1');
function syncMusic(){const active=!music.paused;toggle.textContent=active?'Music on':'Music off';toggle.setAttribute('aria-pressed',String(active))}
toggle.onclick=()=>{if(music.paused)music.play().catch(syncMusic);else music.pause()};music.addEventListener('play',syncMusic);music.addEventListener('pause',syncMusic);
video.play().catch(()=>{});document.addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();music.pause()}else video.play().catch(()=>{})});
