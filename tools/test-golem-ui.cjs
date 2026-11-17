// Optional DOM integration: NODE_PATH=<jsdom install>/node_modules node tools/test-golem-ui.cjs
const assert=require('node:assert/strict'),fs=require('node:fs');const {JSDOM}=require('jsdom');const{vm,sandbox}=require('./audit-creatures.cjs');
const dom=new JSDOM(fs.readFileSync('mansion_war.html','utf8'));sandbox.document=dom.window.document;const doc=sandbox.document,run=s=>vm.runInContext(s,sandbox);
run(`G.units=[];G.golemWorld=null;G.facOff={};G.time=0;globalThis.bench=spawnUnit('eg_crafting',600,600,{force:true});G.sel=bench;updateInspector();`);
const click=label=>{const btn=[...doc.querySelectorAll('button')].find(x=>x.textContent===label);assert.ok(btn,'missing button: '+label);btn.click();};
assert.ok(doc.querySelector('#restActions'));click('素材・環境操作／3×3作業台');assert.ok(doc.querySelector('#golemTools'));
let fields=doc.querySelectorAll('#golemTools input');fields[0].value='oak_log';fields[1].value='1';click('観戦用に素材を追加');assert.equal(run('golemWorld().bag.oak_log'),1);
let selects=doc.querySelectorAll('#golemTools select');assert.equal(selects.length,11);selects[2].value='oak_log';selects[2].dispatchEvent(new dom.window.Event('change'));
assert.ok(doc.querySelector('#golemTools').textContent.includes('minecraft:oak_planks'));click('クラフト');assert.equal(run('golemWorld().bag.oak_planks'),4);assert.equal(run('golemWorld().bag.oak_log'),0);assert.ok(doc.querySelector('#golemTools select:nth-child(1)')||doc.querySelector('#golemTools'));
click('クラフト');assert.equal(run('golemWorld().bag.oak_planks'),4);assert.ok(doc.querySelector('#golemTools').textContent.includes('素材不足'));click('閉じる');assert.equal(doc.querySelector('#golemTools'),null);
run(`globalThis.furnace=spawnUnit('eg_furnace',650,600,{force:true});G.sel=furnace;updateInspector();golemOpenTools(furnace);`);
fields=doc.querySelectorAll('#golemTools input');fields[0].value='coal';fields[1].value='2';click('観戦用に素材を追加');selects=doc.querySelectorAll('#golemTools select');selects[0].value='coal';selects[0].dispatchEvent(new dom.window.Event('change'));click('選んだ素材を対象に使用');assert.equal(run('furnace.restFuel'),1600);assert.equal(run('golemWorld().bag.coal'),1);click('閉じる');
run('updateInspector()');click('在庫の石炭1個を投入');assert.equal(run('furnace.restFuel'),3200);assert.equal(run('golemWorld().bag.coal'),0);click('在庫の石炭1個を投入');assert.equal(run('furnace.restFuel'),3200);
console.log('DOM integration passed: inspector, persistent modal, input/select events, 3x3 recipe/result, atomic crafting, depleted-material display, close, inventory fuel buttons and empty-inventory refusal. (jsdom, not browser pixels)');
