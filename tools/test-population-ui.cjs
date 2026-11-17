// Optional: NODE_PATH=<jsdom install>/node_modules node tools/test-population-ui.cjs
const assert=require('node:assert/strict'),fs=require('node:fs');const{JSDOM}=require('jsdom');const{vm,sandbox}=require('./audit-creatures.cjs');
const dom=new JSDOM('<div id="box"></div>');sandbox.document=dom.window.document;const doc=sandbox.document,run=s=>vm.runInContext(s,sandbox);const saved={};sandbox.localStorage={getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=String(v)};
run(`buildFiveCountPicker(document.getElementById('box'));`);
const doom=doc.querySelector('[data-five-count="dm"]'),doors=doc.querySelector('[data-five-count="dr"]');assert.equal(doom.value,'12');assert.equal(doors.value,'1');assert.equal(doors.disabled,true);
doom.value='24';doom.dispatchEvent(new dom.window.Event('change',{bubbles:true}));assert.equal(run('FIVE_COUNTS.dm'),24);assert.equal(saved.mw_doom_initial_total,'24');
doom.value='-1';doom.dispatchEvent(new dom.window.Event('change',{bubbles:true}));assert.equal(doom.value,'24');
// Isolated startup verifies that legacy per-species DOOM values do not become total budgets.
for(const [data,expected] of [[{mw_five_counts:'{"dm":8,"dr":9}'},12],[{mw_doom_initial_total:'24',mw_five_counts:'{"dr":0}'},24]]){
 const context=vm.createContext({localStorage:{getItem:k=>data[k]??null},Set,console});vm.runInContext(fs.readFileSync('tools/five-fidelity.js','utf8'),context);assert.equal(vm.runInContext("fiveCount('dm')",context),expected);assert.equal(vm.runInContext("fiveCount('dr')",context),1);
}
console.log('Population UI passed: total-budget label/input, fixed DOORS one, validation, persistence and migration from legacy per-species saves.');
