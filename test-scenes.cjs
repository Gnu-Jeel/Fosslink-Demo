const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const c={structuredClone,console};vm.createContext(c);
vm.runInContext(fs.readFileSync('dist/inventory.js','utf8')+`;var devices=DEMO_ENTITIES.map((d,i)=>({id:i+1,...d}));var scene='',handler;var app={addEventListener:(n,f)=>handler=f,querySelector:()=>null};var render=()=>{},toast=()=>{},log=()=>{},icon=()=>'',esc=String;var scenes;`,c);
vm.runInContext(fs.readFileSync('dist/scenes.js','utf8'),c);
vm.runInContext(`var click=id=>handler({target:{closest:()=>({dataset:{mood:id},hasAttribute:()=>!id})}});devices[0].value=43;devices[0].color='#123456';var original=structuredClone(devices);click('morning');devices[0].value=57;var adjustedMorning=structuredClone(devices);click('movie');click();`,c);
assert.equal(JSON.stringify(c.devices),JSON.stringify(c.adjustedMorning));
vm.runInContext('click();',c);
assert.equal(JSON.stringify(c.devices),JSON.stringify(c.original));
for(const id of ['dinner','morning','work','movie','relax','evening','night','away']){
vm.runInContext(`click('${id}');`,c);
for(const d of c.devices.filter(d=>['sensor','binary','update'].includes(d.type)||d.room==='Updates'))assert.equal(JSON.stringify(d),JSON.stringify(c.original.find(x=>x.id===d.id)));
vm.runInContext('click();',c);assert.equal(JSON.stringify(c.devices),JSON.stringify(c.original));
}
console.log('Passed: all eight scenes restore exact manual state; nested cancellation restores prior adjusted scene; sensors and updates unchanged.');
