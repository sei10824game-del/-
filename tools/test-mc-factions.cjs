const assert=require('node:assert/strict');
const {vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);
sandbox.innerWidth=1280;sandbox.innerHeight=720;
run('G.cfg.invincibility=false');
run(`G.cfg.sound=false;Sfx.on=false;G.units=[];G.corpses=[];G.items=[];G.facOff={};G.claimed=[];G.time=0;G.nextId=1;G.stats={};for(const d of FACTION_DEFS)G.stats[d.f]={kills:0,born:0,lost:0,inf:0,conv:0};G.map=genMansion(108,76,74538);PF.init();mwSpawnFactions();globalThis.p=randWalkIn(G.map.rooms[0]);`);
assert.equal(run('countFac("em")'),9);assert.equal(run('countFac("cp")'),11);
assert.equal(run('SP.rezeBomb.hp'),12000);assert.equal(run('SP.typhoonAdult.hp'),8500);assert.ok(run('SP.rezeBomb.atks[0].dmg>45'));
run(`globalThis.e=G.units.find(u=>u.key==='enderMan');globalThis.n=countKey('enderMite');globalThis.oldRandom=Math.random;Math.random=()=>0;mwTeleport(e);Math.random=oldRandom;`);
assert.equal(run('countKey("enderMite")'),run('n+1'));assert.ok(run('mwTeleport.toString().includes("rchance(.05)")'));
run(`globalThis.m=G.units.find(u=>u.key==='enderMite');globalThis.h=spawnUnit('human',m.x,m.y,{force:true});Math.random=()=>.5;mwContact(m);Math.random=oldRandom;`);
assert.equal(run('h.transTo'),'enderMan');run('finishTransform(h)');
run(`globalThis.h2=spawnUnit('human',m.x,m.y,{force:true});Math.random=()=>0;mwContact(m);Math.random=oldRandom;`);assert.equal(run('h2.transTo'),'mutantEnderMan');
assert.equal(run('hostileTo(e,m)||hostileTo(m,e)'),false);
// Ordinary death leaves a corpse but neither blasts nor emits spores.
run(`G.units=[];G.corpses=[];G.mwClouds=[];globalThis.c=spawnUnit('creeper',p.x,p.y,{force:true});globalThis.v=spawnUnit('human',p.x+10,p.y,{force:true});globalThis.hp=v.hp;dealDamage(v,c,9999,{});`);
assert.equal(run('G.mwClouds.length'),0);assert.equal(run('v.hp'),run('hp'));assert.equal(run('G.corpses.filter(c=>c.key==="creeper").length'),1);
// Explosion death cannot leave a corpse and must not trigger a second explosion.
run(`G.units=[];G.corpses=[];globalThis.c=spawnUnit('creeper',p.x,p.y,{force:true});dealDamage(null,c,9999,{explosion:1});`);
assert.equal(run('G.corpses.length'),0);assert.equal(run('G.mwClouds.length'),0);
// A real detonation: corpse substrate, living carrier, no corpse of the bomber.
run(`G.units=[];G.corpses=[];G.mwClouds=[];globalThis.c=spawnUnit('creeper',p.x,p.y,{force:true});globalThis.v=spawnUnit('human',p.x+10,p.y,{force:true});v.mhp=v.hp=5000;globalThis.dead=spawnUnit('human',p.x,p.y,{force:true});dealDamage(null,dead,99999,{});mwDetonate(c,c.atkList[0]);`);
assert.equal(run('c.gone'),true);assert.equal(run('G.corpses.some(c=>c.key==="creeper")'),false);
assert.ok(run('v.hp>0 && v.mwShedUntil===12'));assert.ok(run('G.corpses.some(c=>c.mwGrowAt===6)'));
assert.equal(run('mwDetonate(c,c.atkList[0])'),false);
run('G.time=6.1;updateCorpses(.1)');assert.equal(run('countKey("miniCreeper")'),1);assert.equal(run('G.corpses.length'),0);
run(`globalThis.mini=G.units.find(u=>u.key==='miniCreeper');mini.age=36;Math.random=()=>.5;mwUpdate(.1);Math.random=oldRandom;`);
assert.equal(run('mini.transTo'),'creeper');run('finishTransform(mini)');
run(`globalThis.mini2=spawnUnit('miniCreeper',p.x,p.y,{force:true});mini2.age=36;Math.random=()=>0;mwUpdate(.1);Math.random=oldRandom;`);assert.equal(run('mini2.transTo'),'mutantCreeper');
// Carrier spreads to corpses far from the original explosion, and expires.
run(`v.x=p.x+500;v.y=p.y;globalThis.dead2=spawnUnit('human',v.x,v.y,{force:true});dealDamage(null,dead2,99999,{});G.time=8;mwUpdate(.1);`);
assert.ok(run('G.corpses.some(c=>c.mwGrowAt && c.x===dead2.x)'));
run('G.time=13;mwUpdate(.1);globalThis.cloudCount=G.mwClouds.length;G.time=17;mwUpdate(.5)');assert.equal(run('G.mwClouds.length'),0);assert.equal(run('v.mwShedUntil'),12);
// Same-faction maturation at the population cap is replacement, not death.
run(`G.units=[];globalThis.mini=spawnUnit('miniCreeper',p.x,p.y,{force:true});for(let i=0;i<63;i++)spawnUnit('creeper',p.x,p.y,{force:true});mini.age=36;mwUpdate(.1);finishTransform(mini);`);
assert.equal(run('countFac("cp")'),64);assert.equal(run('G.units.some(u=>!u.gone&&u.key==="miniCreeper")'),false);
// Bootstrap, all custom renderers, actual combat, reset and disabled factions.
run(`FAC_SEL=new Set(['em','cp','rz']);startGame({size:'s'});for(const u of G.units.filter(u=>u.sp.mwShape))for(const q of ['high','mid','low']){G.quality=q;drawUnit(u);}for(let i=0;i<600;i++)stepSim(1/30);drawMwSpores();`);
assert.equal(run('Object.keys(DRAW_ERRS).length'),0);assert.ok(run('G.time>19.9'));assert.ok(run('G.units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.x)&&Number.isFinite(u.y))'));
run(`FAC_SEL=new Set(['T','X']);startGame({size:'s'});`);assert.equal(run('G.mwClouds.length'),0);assert.equal(run('countFac("em")+countFac("cp")'),0);
console.log('Minecraft factions passed: spawn, Reze buff, 5% teleport spawn, 10% contact mutation, death versus detonation, spore carriers/expiry, corpse growth, 10% maturation, cap replacement, rendering, 20s simulation and reset.');
