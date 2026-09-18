(()=>{
const baseRender=render;
const dock=document.createElement('nav');dock.className='floating-dock';dock.setAttribute('aria-label','Main navigation');document.body.append(dock);
const tabs=[['Overview','grid','Overview'],['Energy','energy','Energy'],['System','home','System']];
function chrome(){
const header=app.querySelector('.topbar');
header.innerHTML=`<a class="header-brand" href="https://www.fosslink.in/" aria-label="Fosslink main website"><img src="favicon.svg" alt="" width="30" height="30"><span>Fosslink</span></a><div class="header-tools"><button data-theme class="theme-switch" aria-label="Switch to ${document.body.classList.contains('light-theme')?'dark':'light'} mode"><span class="theme-sun">${icon('sun')}</span><span class="theme-moon">${icon('moon')}</span></button><button data-add aria-label="Add device">${icon('plus')}</button><button data-customize aria-label="Customize layout">${icon('settings')}</button></div>`;
app.querySelector('.heading')?.remove();
if(view==='Overview'){
app.querySelector('.overview')?.remove();const scenes=app.querySelector('.scene-row');scenes?.previousElementSibling?.remove();scenes?.remove();
}
if(!dock.children.length)dock.innerHTML='<span class="dock-selection"></span>'+tabs.map(([v,i,label])=>`<button data-dock-view="${v}" aria-label="${label}">${icon(i)}<span>${label}</span></button>`).join('');
dock.querySelector('.dock-selection').style.setProperty('--tab',tabs.findIndex(t=>t[0]===view));
for(const button of dock.querySelectorAll('button')){if(button.dataset.dockView===view)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')}
}
render=function(){baseRender();chrome()};
let themeTimer;
app.addEventListener('click',e=>{if(!e.target.closest('[data-theme]'))return;clearTimeout(themeTimer);document.body.classList.add('theme-changing');themeTimer=setTimeout(()=>document.body.classList.remove('theme-changing'),500)},true);
app.addEventListener('click',e=>{if(!e.target.closest('[data-theme]'))return;app.querySelector('[data-theme]')?.setAttribute('aria-label',`Switch to ${document.body.classList.contains('light-theme')?'dark':'light'} mode`)});
dock.addEventListener('click',e=>{const button=e.target.closest('[data-dock-view]');if(!button)return;if(dock.classList.contains('dock-collapsed')){dock.classList.remove('dock-collapsed');return}view=button.dataset.dockView;render();window.scrollTo({top:0,behavior:'instant'})});
let lastY=window.scrollY,travel=0,direction=0;
window.addEventListener('scroll',()=>{const y=Math.max(0,window.scrollY),delta=y-lastY;lastY=y;if(Math.abs(delta)<2)return;const dir=Math.sign(delta);travel=dir===direction?travel+Math.abs(delta):Math.abs(delta);direction=dir;if(y<70||dir<0&&travel>12)dock.classList.remove('dock-collapsed');else if(dir>0&&travel>45&&!dock.querySelector(':focus-visible'))dock.classList.add('dock-collapsed')},{passive:true});
dock.addEventListener('focusin',()=>dock.classList.remove('dock-collapsed'));
render();
})();
