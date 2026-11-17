const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);
sandbox.innerWidth=1280;sandbox.innerHeight=720;
run('G.cfg.invincibility=false');
run(`G.cfg.sound=false;Sfx.on=false;G.units=[];G.corpses=[];G.facOff={};G.time=0;G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,conv:0};G.map=genMansion(120,84,74538);PF.init();globalThis.p=randWalkIn(G.map.rooms[0]);globalThis.mk=spawnUnit('makima',p.x,p.y,{force:true});globalThis.h=spawnUnit('human',p.x,p.y,{force:true});dealDamage(mk,h,99999,{gib:1});`);
assert.equal(run('h.gone'),false);assert.equal(run('h.fac'),'mk');assert.equal(run('h.mkCtrl'),run('mk.id'));assert.equal(run('h.mkSacrifice'),true);
run('dealDamage(null,mk,999999,{})');assert.equal(run('h.gone'),true);assert.equal(run('mk.hp'),run('mk.mhp'));assert.equal(run('mk.gone'),false);
run('dealDamage(null,mk,999999,{})');assert.equal(run('mk.gone'),true);
assert.ok(run(`['creeper','miniCreeper','mutantCreeper'].every(k=>SP[k].atks.every(a=>a.exAction==='creeperBoom'))`));
// Distinct four-arm trajectories for all four mutant attacks, not just animation labels.
run(`G.units=[];globalThis.e=spawnUnit('mutantEnderMan',p.x,p.y,{force:true});globalThis.signatures=[];for(const d of e.atkList){e.state='attack';const sum=d.windup+d.active+d.rec;e.atk={def:d,t:sum*.37};signatures.push([0,1,2,3].map(i=>enderArmPose(e,i)).join(','));for(const q of ['high','mid','low'])for(const f of [.1,.4,.65,.9]){G.quality=q;e.atk.t=sum*f;drawUnit(e);}}`);
assert.equal(run('new Set(signatures).size'),4);
// Every Reze technique actually produces an explosion and leaves the owner alive.
run(`globalThis.reze=spawnUnit('rezeBomb',p.x,p.y,{force:true});globalThis.target=spawnUnit('cbCore',p.x+30,p.y,{force:true});target.hp=target.mhp=1000000;globalThis.blastCount=0;globalThis.originalBlast=exBlast;exBlast=(...args)=>{blastCount++;originalBlast(...args);};globalThis.attackResults=[];
for(const d of reze.atkList){const n=blastCount;reze.x=p.x;reze.y=p.y;reze.state='idle';rezeFireAction=d.exAction;exFire(reze,d,{tgt:target});for(let i=0;i<100;i++){G.time+=.04;updateCombatPass(.04);}attackResults.push({name:d.n,exploded:blastCount>n});}
exBlast=originalBlast;`);
assert.ok(run('attackResults.every(r=>r.exploded)'));assert.equal(run('reze.gone'),false);assert.equal(run('reze.rezeDetachedUntil'),0);assert.equal(run('reze.rezeRush'),null);
run(`for(const k of Object.keys(FPE_FACES)){const u=spawnUnit(k,p.x,p.y,{force:true});for(const q of ['high','mid','low']){G.quality=q;drawUnit(u);}}`);assert.equal(run('Object.keys(DRAW_ERRS).length'),0);
assert.ok(run('SP.missCircle.fx.glasses===0&&SP.missBloomie.fpeFace==="bloomie"'));
run(`FAC_SEL=new Set(['em','cp','rz','mk','E']);startGame({size:'s'});globalThis.roomsNow=G.map.rooms.length;for(let i=0;i<450;i++)stepSim(1/30);`);
assert.ok(run('G.map.w===120&&G.map.h===84'));assert.ok(run('roomsNow>25'));assert.ok(run('G.time>14.9'));
assert.ok(run('G.units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.x)&&Number.isFinite(u.y))'));
console.log('Combat pass passed: survivor control/sacrifice, explosion-only Creepers, four distinct Ender attack trajectories, all Reze explosions/regeneration, teacher faces, larger mansion and simulation.');
