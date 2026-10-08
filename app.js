'use strict';
const config=window.INVITATION_CONFIG||{};
const story=document.getElementById('story'),cover=document.getElementById('cover'),backTop=document.getElementById('back-top');
const audio=document.getElementById('wedding-audio'),musicToggle=document.getElementById('music-toggle');
const decorativeRecord=document.getElementById('decorative-record'),musicSymbol=document.getElementById('music-symbol');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let opened=false,noticeTimer;
const musicUrl=String(config.musicUrl||'').trim();
function audioNotice(message){const notice=document.getElementById('audio-notice');notice.textContent=message;notice.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>notice.hidden=true,4500)}
if(musicUrl){audio.src=musicUrl;audio.volume=Math.max(0,Math.min(1,Number(config.musicVolume??0.6)));musicToggle.hidden=false;decorativeRecord.hidden=true;}
function syncMusic(){const playing=!audio.paused&&!audio.ended;musicToggle.classList.toggle('is-playing',playing);musicToggle.setAttribute('aria-label',playing?'Выключить музыку':'Включить музыку');musicToggle.setAttribute('aria-pressed',String(playing));musicSymbol.innerHTML=playing?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zm6 0h4v14h-4z" fill="currentColor"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14l11-7z" fill="currentColor"/></svg>' }
async function playMusic(){if(!musicUrl)return;try{await audio.play();syncMusic()}catch(error){syncMusic();audioNotice('Не удалось включить музыку. Нажмите на пластинку, чтобы попробовать ещё раз.')}}
musicToggle.addEventListener('click',()=>{if(audio.paused)playMusic();else{audio.pause();syncMusic()}});
['play','pause','ended'].forEach(name=>audio.addEventListener(name,syncMusic));
audio.addEventListener('error',()=>{if(opened&&musicUrl){syncMusic();audioNotice('Музыка временно недоступна.')}});
function openInvitation(){if(opened)return;opened=true;document.getElementById('open-invitation').disabled=true;
// play() вызывается именно в обработчике нажатия: это разрешает звук на телефонах.
playMusic();document.body.classList.add('opening');
setTimeout(()=>{cover.hidden=true;story.hidden=false;story.inert=false;document.body.classList.remove('is-closed');backTop.hidden=false;window.scrollTo(0,0);const heading=document.querySelector('#prologue h2');heading.tabIndex=-1;heading.focus({preventScroll:true});},reduceMotion?0:1100)}
document.getElementById('open-invitation').addEventListener('click',openInvitation);document.getElementById('medallion-open').addEventListener('click',openInvitation);
backTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduceMotion?'instant':'smooth'}));
const reveals=document.querySelectorAll('.reveal');if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{threshold:.12});reveals.forEach(el=>observer.observe(el))}else reveals.forEach(el=>el.classList.add('is-visible'));
// Повторяемые анимации: открытие при входе в экран и закрытие при выходе.
const envelope=document.getElementById('envelope');
function setEnvelope(open){envelope.classList.toggle('is-open',open);envelope.setAttribute('aria-expanded',String(open));envelope.setAttribute('aria-label',open?'Закрыть конверт с фотографиями':'Открыть конверт с фотографиями')}
envelope.addEventListener('click',()=>setEnvelope(!envelope.classList.contains('is-open')));
const locketScene=document.querySelector('.lace-composition');
function trackScene(element,change){let inside=false;if(!('IntersectionObserver' in window)){change(true);return}const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.target!==element)return;const ratio=entry.intersectionRatio;
if(!inside&&entry.isIntersecting&&ratio>=.24){inside=true;change(true)}
else if(inside&&(!entry.isIntersecting||ratio<=.05)){inside=false;change(false)}
})},{threshold:[0,.05,.24,.5,1]});observer.observe(element)}
trackScene(envelope,setEnvelope);
// Медальон появляется один раз и остаётся на месте.
function setLocketVisible(open){if(!open)return;locketScene.classList.add('is-in-view');locketScene.querySelector('.gold-locket').classList.add('is-open')}
trackScene(locketScene,setLocketVisible);
const calendar=document.getElementById('calendar-days');for(let n=0;n<3;n++){const blank=document.createElement('span');blank.setAttribute('aria-hidden','true');calendar.append(blank)}for(let n=1;n<=31;n++){const day=document.createElement('span');day.textContent=n;if(n===20){day.className='wedding-day';day.setAttribute('aria-label','20 октября — день свадьбы')}calendar.append(day)}
const weddingTime=new Date(config.weddingDate||'2026-10-20T18:00:00+05:00').getTime();function updateCountdown(){const seconds=Math.max(0,Math.floor((weddingTime-Date.now())/1000));const numbers=[Math.floor(seconds/86400),Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60];['days','hours','minutes','seconds'].forEach((name,i)=>document.getElementById('count-'+name).textContent=String(numbers[i]).padStart(2,'0'));if(seconds===0)document.getElementById('closing').textContent='Наша новая глава началась!'}updateCountdown();setInterval(updateCountdown,1000);
// Сторис: настоящий PNG 2250 × 4000 px, затем системное меню или скачивание.
const shareButton=document.getElementById('share');
function loadImage(url){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=url})}
async function makeStoryImage(){const canvas=document.createElement('canvas');canvas.width=2250;canvas.height=4000;const ctx=canvas.getContext('2d');const photo=await loadImage(window.location?.protocol==='file:'&&window.INVITATION_STORY_PHOTO?window.INVITATION_STORY_PHOTO:'assets/photo6.jpg');const scale=Math.max(canvas.width/photo.width,canvas.height/photo.height);const width=photo.width*scale,height=photo.height*scale;ctx.fillStyle='#49335e';ctx.fillRect(0,0,2250,4000);ctx.globalAlpha=Math.max(.20,Math.min(1,Number(getComputedStyle(document.documentElement).getPropertyValue('--final-photo-opacity'))||.48));ctx.drawImage(photo,(canvas.width-width)/2,(canvas.height-height)/2,width,height);ctx.globalAlpha=1;const shade=ctx.createLinearGradient(0,0,0,4000);shade.addColorStop(0,'rgba(34,20,48,.3)');shade.addColorStop(.35,'rgba(34,20,48,.02)');shade.addColorStop(.7,'rgba(34,20,48,.55)');shade.addColorStop(1,'rgba(34,20,48,.92)');ctx.fillStyle=shade;ctx.fillRect(0,0,2250,4000);ctx.fillStyle='#f1ece1';ctx.textAlign='center';ctx.font='100px Georgia';ctx.fillText('XX · X · MMXXVI',1125,320);ctx.font='italic 180px Georgia';ctx.fillText('Ýunus & Jennet',1125,3050);ctx.font='88px Georgia';ctx.fillText('20 октября 2026 · 18:00',1125,3280);ctx.font='italic 110px Georgia';ctx.fillText('Toý mekany',1125,3490);ctx.font='64px Georgia';ctx.fillText('Приглашаем разделить нашу радость',1125,3750);return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('export')),'image/png'))}
// Изображение готовится заранее: share() вызывается непосредственно по нажатию.
let storyFile=null,storyFileOpacity=null,storyPreparation=null,storyPreparationKey=null;
const shareStatus=document.getElementById('share-status'),shareFallback=document.getElementById('share-fallback');
function currentStoryOpacity(){return getComputedStyle(document.documentElement).getPropertyValue('--final-photo-opacity').trim()||'.48'}
function prepareStoryImage(){const key=currentStoryOpacity();if(storyFile&&key===storyFileOpacity)return Promise.resolve(storyFile);if(storyPreparation&&key===storyPreparationKey)return storyPreparation;storyPreparationKey=key;const preparation=makeStoryImage().then(blob=>{const file=new File([blob],'Yunus-Jennet-story-4000p.png',{type:'image/png'});if(storyPreparationKey===key){storyFile=file;storyFileOpacity=key}return file});storyPreparation=preparation;preparation.catch(()=>{if(storyPreparation===preparation)storyPreparation=null});return preparation}
window.prepareStoryImage=prepareStoryImage;
function downloadStory(file){const url=URL.createObjectURL(file),link=document.createElement('a');link.href=url;link.download=file.name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}
function showShareFallback(message){shareFallback.hidden=false;shareStatus.textContent=message}
shareButton.addEventListener('click',()=>{
 if(!storyFile||storyFileOpacity!==currentStoryOpacity()){shareButton.disabled=true;shareStatus.textContent='Готовим картинку…';prepareStoryImage().then(()=>{shareStatus.textContent='Картинка готова. Нажмите «Поделиться в сторис» ещё раз.'}).catch(()=>showShareFallback('Не удалось подготовить картинку. Обновите страницу и попробуйте ещё раз.')).finally(()=>shareButton.disabled=false);return}
 const file=storyFile;
 if(typeof navigator.share==='function'&&typeof navigator.canShare==='function'&&navigator.canShare({files:[file]})){
  shareButton.disabled=true;shareStatus.textContent='Выберите Instagram или другое приложение в меню отправки';
  try{navigator.share({files:[file]}).then(()=>{shareStatus.textContent=''}).catch(error=>{if(error.name==='AbortError')shareStatus.textContent='';else showShareFallback('Отправка недоступна. Скачайте картинку и добавьте её в сторис Instagram.')} ).finally(()=>shareButton.disabled=false)}catch(error){shareButton.disabled=false;showShareFallback('Отправка недоступна. Скачайте картинку и добавьте её в сторис Instagram.')}
 }else{downloadStory(file);showShareFallback('Картинка сохранена. Откройте Instagram и выберите её для сторис.')}
});
document.getElementById('share-download').addEventListener('click',()=>{if(storyFile&&storyFileOpacity===currentStoryOpacity())downloadStory(storyFile);else{shareStatus.textContent='Готовим картинку…';prepareStoryImage().then(()=>shareStatus.textContent='Готово. Нажмите «Скачать картинку» ещё раз.').catch(()=>shareStatus.textContent='Не удалось подготовить картинку. Обновите страницу.')}});
prepareStoryImage();
