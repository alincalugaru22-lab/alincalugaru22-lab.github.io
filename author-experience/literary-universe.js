export function attachUniverse(trigger){
 const books=[{title:'LATITUDE 91°',subtitle:'Inside or Outside?',volume:'BOOK I',file:'latitude-91-book-i.jpg'},{title:'NODIA',subtitle:'LATITUDE 91° COLLECTION',volume:'BOOK II',file:'nodia-book-ii.jpg'},{title:'VARETH',subtitle:'LATITUDE 91° COLLECTION',volume:'BOOK III',file:'vareth-book-iii.jpg'}];
 books.forEach((b,i)=>{const key=['latitude','nodia','vareth'][i];b.cover='assets/universe/'+b.file;b.pages=Array.from({length:5},(_,n)=>'assets/universe/'+key+'-page-'+(n+1)+'.png');b.universe=true;});
 const page=document.createElement('section');page.id='literary-universe';page.hidden=true;page.tabIndex=-1;page.setAttribute('role','dialog');page.setAttribute('aria-modal','true');page.setAttribute('aria-labelledby','universe-title');
 page.innerHTML=`<video class="universe-background-video" muted loop playsinline preload="none" poster="assets/universe/literary-universe-video-poster.jpg" aria-hidden="true" tabindex="-1"><source src="assets/universe/literary-universe-continuous.mp4" type="video/mp4"></video><div class="universe-frame" aria-hidden="true"></div><div class="universe-scroll"><header><p class="universe-eyebrow">ALIN ALEX CALUGARU</p><p class="universe-special">SPECIAL</p><h1 id="universe-title" class="biography-gold">Literary Universe</h1><p class="universe-collection">LATITUDE 91° COLLECTION</p><div class="genre-heading-ornament" aria-hidden="true">✦</div></header><div class="universe-books">${books.map((b,i)=>`<button class="universe-book" data-volume="${i}" aria-label="Open ${b.volume} — ${b.title} illustrated book"><span class="universe-volume">${b.volume}</span><img src="assets/universe/${b.file}" alt="${b.title} — ${b.subtitle}" loading="lazy"><strong>${b.title}</strong><span class="universe-subtitle">${b.subtitle}</span><span class="universe-view">OPEN THE BOOK ↗</span></button>`).join('')}</div><button class="universe-back">← Back to Library</button></div>`;document.body.append(page);
 const cards=[...page.querySelectorAll('.universe-book')];let open=false;
 const backgroundVideo=page.querySelector(".universe-background-video");backgroundVideo.muted=true;
 function syncVideo(){if(open&&!document.hidden&&document.body.dataset.readerOpen!=="true")backgroundVideo.play().catch(()=>{});else backgroundVideo.pause()}
 document.addEventListener("visibilitychange",syncVideo);new MutationObserver(syncVideo).observe(document.body,{attributes:true,attributeFilter:["data-reader-open"]});
 function notify(){syncVideo();if(parent!==window)parent.postMessage({type:'book-universe-state',open},location.origin)}
 function close(){open=false;page.hidden=true;document.body.classList.remove('universe-open');notify();trigger.focus({preventScroll:true})}
 trigger.onclick=()=>{open=true;page.hidden=false;document.body.classList.add('universe-open');page.querySelector('.universe-scroll').scrollTop=0;notify();page.focus({preventScroll:true})};
 page.querySelector('.universe-back').onclick=close;
 page.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){const f=[...page.querySelectorAll('button')],first=f[0],last=f.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===page)){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
 addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='book-universe-close')close()});
 let enterRequested=new URLSearchParams(location.search).get('universe')==='1';function syncEntry(){if(document.body.dataset.state==='library'&&enterRequested){enterRequested=false;trigger.click()}else if(document.body.dataset.state!=='library'&&open)close()}
 new MutationObserver(syncEntry).observe(document.body,{attributes:true,attributeFilter:['data-state']});
 syncEntry();
 return {books,cards};
}
