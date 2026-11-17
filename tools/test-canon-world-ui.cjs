// Optional: NODE_PATH=<jsdom install>/node_modules node tools/test-canon-world-ui.cjs
const assert=require('node:assert/strict'),fs=require('node:fs');const{JSDOM}=require('jsdom');const{vm,sandbox}=require('./audit-creatures.cjs');
const dom=new JSDOM(fs.readFileSync('mansion_war.html','utf8'));sandbox.document=dom.window.document;const doc=sandbox.document,run=s=>vm.runInContext(s,sandbox);
run(`G.units=[];G.corpses=[];G.map=genMansion(120,84,74538);G.map.walk.fill(1);G.map.propGrid.fill(0);G.cfg.invincibility=false;G.facOff={};G.time=100;fiveInitRules();globalThis.dupe=spawnUnit('dr_dupe_hotel',600,600,{force:true});globalThis.d=dupe.canonObject;globalThis.h=spawnUnit('human',d.x,d.y,{force:true});h.hp=h.mhp=1000;G.sel=h;canonInteractionPanel();`);
const label=run(`'扉 '+d.number+' を開く'`);const button=[...doc.querySelectorAll('#canonInteractions button')].find(b=>b.textContent===label);assert.ok(button);
run('canonInteractionPanel()');assert.ok(button.isConnected,'frame refresh must not replace a button under the pointer');button.click();assert.equal(run('h.hp'),960);assert.equal(run('d.numberBlurred'),true);assert.equal(button.isConnected,false);
run('G.sel=null;canonInteractionPanel()');assert.equal(doc.getElementById('canonInteractions').style.display,'none');
console.log('Canon interaction DOM passed: reachable button, stable DOM between frames, actual click event, one-shot consumption and selection cleanup (jsdom, not browser pixels).');
