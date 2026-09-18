/* Scene history is scoped to this visit. Every activation keeps its own restore point. */
(()=>{
const presets=[
{id:'dinner',name:'Dinner time',glyph:'light',tone:'climate',tag:'Gather around',desc:'Warm shared lighting, a softly lit kitchen and speakers paused for dinner.',lights:{'Living room/Floor lamp':45,'Living room/Spotlights':35,'Living room/Bar lamp':100,'Kitchen/Spotlights':50,'Kitchen/Worktop':30,'Outdoor/Door light':40},covers:0,temps:[21,20],temp:2700,color:'#ffd0a0'},
{id:'morning',name:'Good morning',glyph:'sun',tone:'light',tag:'Rise & shine',desc:'Open the shades, brighten the kitchen and ease into the day.',lights:{'Living room/Floor lamp':45,'Kitchen/Spotlights':70,'Kitchen/Worktop':85},covers:100,temps:[21,20],media:'Kitchen',volume:20,temp:3500,color:'#ffd9a0'},
{id:'work',name:'Work from home',glyph:'tablet',tone:'accent',tag:'Afternoon focus',desc:'Study lights up, shades half-open and meeting mode on. Music stays quiet.',lights:{'Study/Spotlights':90,'Kitchen/Worktop':35},covers:60,temps:[21,19],meeting:true,temp:4000,color:'#fff0d2'},
{id:'movie',name:'Movie night',glyph:'film',tone:'fan',tag:'Set the scene',desc:'Close the shades, dim the floor lamp and pause speakers for your movie.',lights:{'Living room/Floor lamp':15,'Outdoor/Door light':30},covers:0,temps:[22,20],temp:2700,color:'#ba9bea'},
{id:'relax',name:'Time to unwind',glyph:'leaf',tone:'energy',tag:'A softer pace',desc:'Warm living-room lights, low-volume music and a little privacy.',lights:{'Living room/Floor lamp':35,'Living room/Bar lamp':100,'Outdoor/Door light':40},covers:30,temps:[22,20],media:'Living room',volume:15,temp:2700,color:'#ffbc78'},
{id:'evening',name:'Good evening',glyph:'home',tone:'climate',tag:'Welcome the evening',desc:'Warm shared spaces, light the kitchen and close the shades.',lights:{'Living room/Floor lamp':65,'Living room/Spotlights':45,'Living room/Bar lamp':100,'Kitchen/Spotlights':55,'Kitchen/Worktop':75,'Outdoor/Door light':65},covers:0,temps:[22,21],temp:3000,color:'#ffc88d'},
{id:'night',name:'Good night',glyph:'moon',tone:'fan',tag:'Rest easy',desc:'Indoor lights and speakers off, shades closed and a soft porch light.',lights:{'Outdoor/Door light':20},covers:0,temps:[18,20],temp:2700,color:'#ffbc78'},
{id:'away',name:'Leaving home',glyph:'away',tone:'accent',tag:'Until you’re back',desc:'Lights and speakers off, shades closed and thermostats in an eco setback.',lights:{},covers:0,temps:[16,16],temp:2700,color:'#ffbc78'}
];
const history=[];
const controlled=d=>['light','cover','media','climate'].includes(d.type)||(d.room==='Study'&&d.name==='Meeting mode');
function applyPreset(p){devices.forEach(d=>{
if(d.type==='light'){const level=p.lights[d.room+'/'+d.name]||0;d.on=level>0;if(level)d.value=d.dim===false?100:level;if(d.colorCapable){d.temp=p.temp;d.color=p.color}}
if(d.type==='cover'){d.value=p.covers;d.target=null;d.moving=null}
if(d.type==='media'){d.on=d.room===p.media;d.playing=d.on;if(d.on){d.volume=p.volume;d.muted=false}}
if(d.type==='climate'){d.on=true;d.mode='Heat';d.preset=p.id==='away'?'Eco':'Comfort';d.value=p.temps[d.name==='Upstairs'?1:0]}
if(d.room==='Study'&&d.name==='Meeting mode')d.on=!!p.meeting;
if(controlled(d))d.until=null;
});}
scenes=function(){const active=history.at(-1),p=active&&presets.find(p=>p.id===active.id);return `<section class="mood-section" aria-labelledby="mood-title"><div class="mood-heading"><div><span class="mood-eyebrow">MAKE IT YOUR MOMENT</span><h2 id="mood-title">A mode for every mood</h2><p>One tap sets your home. Cancel to return to your previous settings.</p></div><span class="mood-count">${presets.length} scenes</span></div><div class="mood-grid">${presets.map(p=>`<button class="mood-card" data-mood="${p.id}" style="--mood:var(--${p.tone})" aria-pressed="${active?.id===p.id}" title="${esc(p.desc)}"><span class="mood-icon">${icon(p.glyph)}</span><span class="mood-name">${p.name}</span><small>${p.tag}</small><span class="mood-check">${icon('check')}</span></button>`).join('')}</div>${p?`<div class="mood-active" role="status"><span class="mood-active-icon">${icon(p.glyph)}</span><div><strong>${p.name}</strong><p>${p.desc}</p><small>Cancel restores ${history.length>1?esc(presets.find(p=>p.id===history.at(-2).id).name)+' and its saved adjustments':'your previous device settings'}.</small></div><button data-mood-cancel>Cancel mode ${icon('away')}</button></div>`:'<p class="mood-hint">You can still adjust individual devices while a mode is active. Sensors and system updates stay unchanged.</p>'}</section>`};
app.addEventListener('click',e=>{const b=e.target.closest('[data-mood],[data-mood-cancel]');if(!b)return;
let focus;
if(b.hasAttribute('data-mood-cancel')){const frame=history.pop();if(!frame)return;const saved=new Map(frame.before.map(d=>[d.id,d]));devices=devices.map(d=>saved.has(d.id)?structuredClone(saved.get(d.id)):d);scene=history.length?presets.find(p=>p.id===history.at(-1).id).name:'';focus=`[data-mood="${frame.id}"]`;log('Previous device settings restored');toast('Previous device settings restored')}
else{const p=presets.find(p=>p.id===b.dataset.mood);if(!p)return;if(history.at(-1)?.id===p.id){toast('This mode is active. Use Cancel mode to restore your previous settings.');return}history.push({id:p.id,before:structuredClone(devices.filter(controlled))});applyPreset(p);scene=p.name;focus=`[data-mood="${p.id}"]`;log(`${p.name} activated`);toast(`${p.name} applied`)}
render();app.querySelector(focus)?.focus({preventScroll:true});
});
})();
