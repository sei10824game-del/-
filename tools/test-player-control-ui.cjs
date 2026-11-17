const assert=require('node:assert/strict'),fs=require('node:fs');const{JSDOM}=require('jsdom');const{vm,sandbox}=require('./audit-creatures.cjs');const html=fs.readFileSync('mansion_war.html','utf8');const dom=new JSDOM(html,{url:'https://game.example/'});const doc=dom.window.document,run=s=>vm.runInContext(s,sandbox);sandbox.document=doc;sandbox.window=dom.window;sandbox.innerWidth=1280;sandbox.innerHeight=720;sandbox.devicePixelRatio=1;sandbox.CSS={escape:s=>String(s)};
dom.window.HTMLCanvasElement.prototype.getContext=()=>sandbox.canvasStub;
// The audit stops before startup; include the hoisted touch-HUD declarations too.
run(html.slice(html.indexOf('function ensureCtrlHud()'),html.lastIndexOf('</script>')));
run('initUI()');
run(`G.units=[];G.corpses=[];G.projs=[];G.time=100;G.started=true;G.paused=false;G.over=false;G.facOff={};G.cfg.sound=false;Sfx.on=false;G.map=genMansion(120,84,74538);G.map.walk.fill(1);G.map.propGrid.fill(0);PF.init();globalThis.u=spawnUnit('dm_imp_classic',600,600,{force:true});globalThis.h=spawnUnit('human',625,600,{force:true});h.hp=h.mhp=1000;G.sel=u;updateInspector();`);
doc.getElementById('ctrlBtn').click();assert.equal(run('G.ctrl===u'),true);
const dispatch=(type,key,code,extra={})=>{const e=new dom.window.KeyboardEvent(type,{key,code,bubbles:true,cancelable:true,...extra});dom.window.dispatchEvent(e);return e;};
const down=dispatch('keydown','d','KeyD');assert.equal(down.defaultPrevented,true);run('tickCtrl(.02)');assert.ok(run('u.dest&&u.dest.x>u.x'));
dispatch('keyup','d','KeyD');run('tickCtrl(.02)');assert.equal(run('u.dest'),null);
dispatch('keydown','j','KeyJ');run('Spatial.rebuild();tickCtrl(.02)');assert.ok(run('!!u.atk'));dispatch('keyup','j','KeyJ');
run('updateCtrlHud()');assert.match(doc.getElementById('ctrlInfo').textContent,/WASD/);assert.match(doc.getElementById('ctrlAtk').textContent,/Space/);assert.equal(doc.getElementById('ctrlHud').style.display,'block');
run('u.atk=null;u.state="idle";G.time+=10;for(const k in u.cds)u.cds[k]=0;');doc.getElementById('ctrlAtk').click();assert.ok(run('!!u.atk'),'actual attack button');
run('u.atk=null;u.state="idle";');dispatch('keydown','w','KeyW');run('tickCtrl(.02)');dom.window.dispatchEvent(new dom.window.Event('blur'));run('tickCtrl(.02)');assert.equal(run('u.dest'),null);assert.equal(run('Object.keys(G.keys).length'),0);
const input=doc.createElement('input');doc.body.appendChild(input);input.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'r',code:'KeyR',bubbles:true,cancelable:true}));assert.equal(run('G.ctrl===u'),true,'typing R must not restart');
dispatch('keydown','p','KeyP');assert.equal(run('G.paused'),true);run('u.atk=null;u.state="idle";G.time+=10;');doc.getElementById('ctrlAtk').click();assert.equal(run('u.atk'),null,'HUD cannot attack while paused');dispatch('keyup','p','KeyP');dispatch('keydown','p','KeyP');assert.equal(run('G.paused'),false);
doc.getElementById('ctrlRelease').click();assert.equal(run('G.ctrl'),null);assert.equal(doc.getElementById('ctrlHud').style.display,'none');
run('G.sel=u;');dispatch('keydown','c','KeyC');assert.equal(run('G.ctrl===u'),true);dispatch('keydown','Escape','Escape');assert.equal(run('G.ctrl'),null);assert.equal(run('G.sel'),null);
console.log('Player DOM passed: real initUI listeners, inspector possession click, WASD keydown/keyup, J attack, visible key HUD, attack/release buttons, blur, text-input isolation, pause safety, C/Escape. jsdom integration, not browser-pixel certification.');
