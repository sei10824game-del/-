const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);sandbox.innerWidth=1280;sandbox.innerHeight=720;
run(`G.units=[];G.corpses=[];G.projs=[];G.city17=null;G.time=100;G.facOff={};G.started=true;G.paused=false;G.over=false;G.cfg.invincibility=false;G.cfg.sound=false;Sfx.on=false;G.map=genMansion(120,84,74538);G.map.walk.fill(1);G.map.propGrid.fill(0);PF.init();G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,inf:0,conv:0};globalThis.u=spawnUnit('dm_imp_classic',600,600,{force:true});playerSetControl(u);globalThis.key=(key,code,extra={})=>({key,code,preventDefault(){this.prevented=true;},...extra});`);
for(const [key,code,axis,sign] of [['w','KeyW','y',-1],['a','KeyA','x',-1],['s','KeyS','y',1],['d','KeyD','x',1]]){
 run(`u.x=600;u.y=600;u.state='idle';u.atk=null;playerClearInput();globalThis.e=key('${key}','${code}');playerKeyDown(e);for(let i=0;i<20;i++){G.time+=.02;tickCtrl(.02);updateUnit(u,.02);}globalThis.moved=u.${axis};playerKeyUp(e);tickCtrl(.02);`);
 assert.ok((run('moved')-600)*sign>4,`${key}: real movement`);assert.equal(run('u.dest'),null,'key release must immediately cancel keyboard destination');assert.equal(run(`!!G.keys['${key}']`),false);
}
run(`playerKeyDown(key('d','KeyD'));tickCtrl(.02);globalThis.straight=dist(u.x,u.y,u.dest.x,u.dest.y);playerKeyDown(key('w','KeyW'));tickCtrl(.02);globalThis.diagonal=dist(u.x,u.y,u.dest.x,u.dest.y);`);assert.ok(Math.abs(run('straight-diagonal'))<.01,'diagonal normalization');
run('playerClearInput();setDest(u,800,600,true);tickCtrl(.02)');assert.ok(run('u.dest&&u.dest.x===800'),'click-style destination persists without held movement keys');
run("playerKeyDown(key('z','KeyW'));tickCtrl(.02)");assert.equal(run('G.keys.w'),true,'physical WASD works with different keyboard layouts');run('playerClearInput()');assert.equal(run('u.dest'),null);
// Attack keys use form/runtime attack lists rather than just sp.atks; no AI takeover.
run(`u.x=600;u.y=600;u.faceA=0;u.state='idle';u.dest=null;globalThis.h=spawnUnit('human',625,600,{force:true});h.hp=h.mhp=1000;u.atkList=[AT({n:'control first',dmg:20,reach:45,windup:.1,active:.15,rec:.1,cd:1,anim:'slash'}),AT({n:'control alternate',dmg:25,reach:45,windup:.1,active:.15,rec:.1,cd:1,anim:'heavy'})];Spatial.rebuild();playerKeyDown(key('j','KeyJ'));tickCtrl(.02);`);
assert.equal(run('u.atk.def.n'),'control first');run('globalThis.firstAttack=u.atk;tickCtrl(.02)');assert.equal(run('u.atk===firstAttack'),true,'held attack cannot restart active animations');
run('playerKeyUp(key("j","KeyJ"));for(let i=0;i<30;i++){G.time+=.02;updateUnit(u,.02);}');assert.ok(run('h.hp<1000'),'key-triggered attack actually deals damage');
run('G.time+=2;u.state="idle";u.atk=null;playerKeyDown(key("k","KeyK"));tickCtrl(.02)');assert.equal(run('u.atk.def.n'),'control alternate');
run('playerClearInput();u.state="idle";u.atk=null;G.time+=2;playerKeyDown(key(" ","Space"));tickCtrl(.02)');assert.ok(run('!!u.atk'));assert.equal(run('G.paused'),false,'Space attacks, not pause, during possession');
run('playerClearInput();u.atk=null;u.state="idle";G.time+=2;G.paused=true;');assert.equal(run('playerAttack()'),false);run('G.paused=false;u.stunT=1');assert.equal(run('playerAttack()'),false);run('u.stunT=0;u.state="transform"');assert.equal(run('playerAttack()'),false);
run('u.state="idle";playerSetControl(null);');assert.equal(run('G.ctrl'),null);assert.equal(run('u.dest'),null);
run('playerSetControl(u);u.gone=true;tickCtrl(.02)');assert.equal(run('G.ctrl'),null);
run('u.gone=false;playerSetControl(u);G.units=[];tickCtrl(.02)');assert.equal(run('G.ctrl'),null,'removed/replaced units cannot leave ghost possession');
run('playerClearInput();globalThis.inputKey=key("w","KeyW",{target:{closest(){return true;}}});playerKeyDown(inputKey)');assert.equal(run('!!G.keys.w'),false,'typing does not move a character/camera');
run('playerKeyDown(key("w","KeyW",{ctrlKey:true}))');assert.equal(run('!!G.keys.w'),false,'browser shortcuts ignored');
run('G.units=[u];u.gone=false;u.dead=false;u.state="idle";playerSetControl(u);playerKeyDown(key("d","KeyD"));tickCtrl(.02);playerClearInput()');assert.equal(run('u.dest'),null);assert.equal(run('Object.keys(G.keys).length'),0,'focus loss clears all held input');
run('FAC_SEL=new Set(["T","N"]);startGame({size:"s"})');assert.equal(run('G.ctrl'),null);assert.equal(run('Object.keys(G.keys).length'),0);
console.log('Player control passed: physical WASD/diagonals, actual movement, release stopping, click persistence, J/Space/K attacks and damage, form-aware lists, cooldown/animation protection, pause/stun/transformation, removal/death/restart, focus clearing and text/shortcut isolation.');
