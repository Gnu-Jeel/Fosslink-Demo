/* Local authoring layer. Overrides are reapplied after the interactive demo renders. */
(()=>{
const key='fosslink-editor-v1',empty=()=>({version:1,rules:{},themes:{dark:{},light:{}},inventory:null});
let config=empty(),undo=[],redo=[],selected=null,enabled=false;
try{config=JSON.parse(localStorage.getItem(key))||empty()}catch{}
// Migrate existing local drafts without discarding other device customizations.
if(Array.isArray(config.inventory)&&!config.updatesCleanup){
config.inventory=config.inventory.filter(d=>!(d.room==='Updates'&&['Supervisor','Core'].includes(d.name))).map(d=>d.room==='Updates'&&d.name==='OS'?{...d,detailName:'Fosslink Operating System Update'}:d);
config.updatesCleanup=true;
try{localStorage.setItem(key,JSON.stringify(config))}catch{}
}
const originalRender=render;
const style=document.createElement('style');document.head.append(style);
const panel=document.createElement('aside');panel.id='site-editor';panel.hidden=true;
const launch=document.createElement('button');launch.id='editor-launch';launch.setAttribute('aria-label','Edit website');launch.title='Edit website';launch.textContent='✎ Edit website';launch.onclick=()=>{enabled=!enabled;panel.hidden=!enabled;launch.textContent=enabled?'Close editor':'✎ Edit website';document.body.classList.toggle('editing-site',enabled);if(enabled)draw()};
document.body.append(panel,launch);
function apply(){
style.textContent=Object.entries(config.themes).map(([mode,vars])=>`${mode==='light'?'body.light-theme':'body:not(.light-theme)'}{${Object.entries(vars).map(([k,v])=>`${k}:${v}`).join(';')}}`).join('');
for(const [selector,rule] of Object.entries(config.rules)){let nodes;try{nodes=document.querySelectorAll(selector)}catch{continue}for(const el of nodes){if(rule.text!==undefined&&el.children.length===0)el.textContent=rule.text;Object.assign(el.style,rule.style||{});if(rule.css)el.style.cssText+=rule.css;if(rule.hidden)el.style.display='none'}}
}
render=function(){originalRender();app.dataset.editorView=view;apply()};
function persist(){localStorage.setItem(key,JSON.stringify(config));apply()}
function checkpoint(){undo.push(JSON.stringify(config));if(undo.length>60)undo.shift();redo=[]}
function commit(){persist();draw()}
function selector(el){const parts=[];while(el&&el.id!=='app'&&el.id!=='modal'){if(el.dataset.card){parts.unshift(`[data-card="${el.dataset.card}"]`);break}const siblings=[...el.parentElement.children].filter(e=>e.tagName===el.tagName);parts.unshift(el.tagName.toLowerCase()+`:nth-of-type(${siblings.indexOf(el)+1})`);el=el.parentElement}return (el?.id==='modal'?'#modal ':`#app[data-editor-view="${view}"] `)+parts.join(' > ')}
function pick(el){selected=selector(el);draw()}
document.addEventListener('click',e=>{if(!enabled||!e.target.closest('#app, #modal')||e.altKey)return;e.preventDefault();e.stopImmediatePropagation();pick(e.target.closest('svg')?.parentElement||e.target)},true);
const field=(label,id,value,type='text')=>`<label>${label}<input id="ed-${id}" type="${type}" value="${esc(value??'')}"></label>`;
function draw(){
let el;try{el=selected&&document.querySelector(selected)}catch{}const rule=config.rules[selected]||{};
panel.innerHTML=`<header><strong>Fosslink Studio</strong><small>Local visual editor · Alt + click to use the demo</small></header><div class="editor-actions"><button id="ed-undo" ${undo.length?'':'disabled'}>Undo</button><button id="ed-redo" ${redo.length?'':'disabled'}>Redo</button><button id="ed-export">Export</button><label class="editor-import">Import<input id="ed-import" type="file" accept="application/json"></label></div><p class="editor-hint">Click any component to edit it. Changes save in this browser. Export a backup to transfer your edits.</p><details open><summary>Selected component</summary>${el?`<small>${esc(el.tagName.toLowerCase())} · ${esc(selected)}</small><button id="ed-parent">Select parent</button>${el.children.length===0?`<label>Text<textarea id="ed-text">${esc(rule.text??el.textContent)}</textarea></label>`:'<p>Select a text element to change its wording.</p>'}${field('Text color','color',rule.style?.color||'')}${field('Background (CSS color)','background',rule.style?.background||'')}${field('Font size (e.g. 16px)','fontSize',rule.style?.fontSize||'')}${field('Padding (e.g. 12px)','padding',rule.style?.padding||'')}${field('Corner radius','borderRadius',rule.style?.borderRadius||'')}${field('Width (e.g. 100%)','width',rule.style?.width||'')}${field('Grid columns spanned','gridColumn',rule.style?.gridColumn||'')}${field('Blur (e.g. blur(16px))','backdropFilter',rule.style?.backdropFilter||'')}<label>Advanced CSS declarations<textarea id="ed-css" placeholder="display: grid; gap: 16px;">${esc(rule.css||'')}</textarea></label><label><input id="ed-hidden" type="checkbox" ${rule.hidden?'checked':''}> Hide component</label><button id="ed-apply">Apply component changes</button><button id="ed-reset">Reset component</button>`:'<p>No component selected yet.</p>'}</details><details><summary>Theme palette</summary><label>Theme<select id="ed-theme"><option value="dark">Dark</option><option value="light">Light</option></select></label><div id="ed-tokens"></div></details><details><summary>Devices and rooms</summary><p>Edit the full device list as JSON. Keep IDs unique and retain required fields for each device type.</p><textarea id="ed-devices" spellcheck="false">${esc(JSON.stringify(config.inventory||initial,null,2))}</textarea><button id="ed-save-devices">Apply device list</button></details><p id="ed-status" role="status">Draft saved locally</p>`;
const on=(id,fn)=>{const e=panel.querySelector('#ed-'+id);if(e)e.onclick=fn};
on('parent',()=>{if(el.parentElement&&el.parentElement.id!=='app')pick(el.parentElement)});
on('apply',()=>{checkpoint();const r={style:{},css:panel.querySelector('#ed-css').value,hidden:panel.querySelector('#ed-hidden').checked};const t=panel.querySelector('#ed-text');if(t)r.text=t.value;for(const p of ['color','background','fontSize','padding','borderRadius','width','gridColumn','backdropFilter']){const v=panel.querySelector('#ed-'+p).value.trim();if(v)r.style[p]=v}config.rules[selected]=r;render();commit()});
on('reset',()=>{checkpoint();delete config.rules[selected];render();commit()});
on('undo',()=>{redo.push(JSON.stringify(config));config=JSON.parse(undo.pop());restore()});on('redo',()=>{undo.push(JSON.stringify(config));config=JSON.parse(redo.pop());restore()});
on('export',()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(config,null,2)],{type:'application/json'}));a.download='fosslink-design.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
panel.querySelector('#ed-import').onchange=async e=>{try{const c=JSON.parse(await e.target.files[0].text());if(c.version!==1||!c.rules||!c.themes)throw Error('Choose a Fosslink Studio export.');validate(c.inventory||initial);checkpoint();config=c;restore()}catch(err){status(err.message)}};
on('save-devices',()=>{try{const list=JSON.parse(panel.querySelector('#ed-devices').value);validate(list);checkpoint();config.inventory=list;restore()}catch(err){status(err.message)}});
const tokens=()=>{const mode=panel.querySelector('#ed-theme').value;panel.querySelector('#ed-tokens').innerHTML=['bg','surface','raised','sidebar','text','muted','line','accent','accent-bg','primary','primary-text','light','fan','climate','energy'].map(k=>field(k,k,config.themes[mode]?.['--'+k]||'')).join('')+'<button id="ed-palette-save">Apply palette</button>';on('palette-save',()=>{checkpoint();config.themes[mode]={};for(const input of panel.querySelectorAll('#ed-tokens input'))if(input.value.trim())config.themes[mode]['--'+input.id.slice(3)]=input.value.trim();commit()})};panel.querySelector('#ed-theme').onchange=tokens;tokens();
}
function status(message){panel.querySelector('#ed-status').textContent=message}
function validate(list){if(!Array.isArray(list)||!list.length)throw Error('Provide a non-empty array of devices.');const ids=new Set();for(const d of list){if(!Number.isInteger(d.id)||ids.has(d.id)||typeof d.name!=='string'||!DEMO_GROUPS.includes(d.room)||!['light','switch','media','cover','climate','sensor','binary','update','fan','plug','tablet'].includes(d.type))throw Error('Each device needs a unique integer ID, name, valid room and type.');if(['light','cover','climate','fan','tablet'].includes(d.type)&&!Number.isFinite(d.value))throw Error('Control devices need a numeric value.');if(d.type==='climate'&&!Number.isFinite(d.current))throw Error('Thermostats need a numeric current temperature.');ids.add(d.id)}}
function restore(){devices=structuredClone(config.inventory||initial);render();commit()}
if(config.inventory){try{validate(config.inventory);devices=structuredClone(config.inventory)}catch{config.inventory=null}}render();
})();
