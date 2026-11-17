const assert=require('node:assert/strict');
const {vm,sandbox}=require('./audit-creatures.cjs');
const run=s=>vm.runInContext(s,sandbox);
sandbox.innerWidth=1280;sandbox.innerHeight=720;
run('G.cfg.invincibility=false');
run(`G.cfg.sound=false;Sfx.on=false;G.units=[];G.corpses=[];G.items=[];G.facOff={};G.claimed=[];G.time=0;G.nextId=1;
G.stats={};for(const d of FACTION_DEFS)G.stats[d.f]={kills:0,born:0,lost:0,inf:0,conv:0};G.map=genMansion(108,76,74538);PF.init();spawnExpansion();
globalThis.gon=G.units.find(u=>u.key==='gon');globalThis.kil=G.units.find(u=>u.key==='killua');globalThis.gen=G.units.find(u=>u.key==='genthru');globalThis.ty=G.units.find(u=>u.key==='typhoonChild');
globalThis.p=randWalkIn(G.map.rooms[0]);`);
assert.equal(run('G.units.length'),7);
assert.equal(run('gen.fac'),'N');
assert.equal(run('facPot("bm")'),3);
assert.equal(run('hostileTo(gen,G.units.find(u=>u.key==="bomberSub"))||hostileTo(G.units.find(u=>u.key==="bomberBara"),gen)'),false);
assert.equal(run('hostileTo(gon,kil)||hostileTo(kil,gon)'),false);
run(`globalThis.h=spawnUnit('human',p.x,p.y,{force:true});gen.x=h.x;gen.y=h.y;gen.state='idle';gen.thinkT=0;aiThink(gen);`);
assert.equal(run('G.countdownBombs.length'),0);
assert.equal(run('G.restBombMarks.length'),1);
assert.equal(run('gen.fac'),'N');
assert.equal(run('exPlantBomb(gen,h)'),false);
run('restExplainBombs(gen,[h]);G.countdownBombs[0].beats=1;h.heartRateBpm=60;G.time+=1.1;updateExpansion(1.1)');
assert.equal(run('G.countdownBombs.length'),0);
assert.equal(run('gen.fac'),'bm');
assert.ok(run('h.hp<h.mhp'));
run(`gen.bmHidden=1;gen.fac='N';gen.bmPlantAt=0;globalThis.h2=spawnUnit('human',gen.x,gen.y,{force:true});exPlantBomb(gen,h2);restExplainBombs(gen,[h2]);for(const k of ['bomberSub','bomberBara']){const u=G.units.find(u=>u.key===k);u.x=gen.x;u.y=gen.y;}thinkGenthru(gen);`);
assert.equal(run('gen.fac'),'bm');assert.equal(run('G.countdownBombs.length'),0);
run(`dealDamage(gen,gon,10000,{});`);
assert.equal(run('gon.form'),1);assert.equal(run('gon.hp'),24000);assert.equal(run('gon.gone'),false);
run('updateUnit(gon,2)');assert.equal(run('gon.gone'),false);assert.equal(run('gon.state'),'idle');
run(`gen.x=kil.x;gen.y=kil.y;globalThis.before=gen.hp;dealDamage(gen,kil,10,{});`);
assert.ok(run('gen.hp<before'));assert.ok(run('kil.counterAt>G.time'));
run(`ty.age=91;updateExpansion(.1);`);assert.equal(run('ty.transTo'),'typhoonAdult');
run('finishTransform(ty)');assert.equal(run('countKey("typhoonAdult")'),1);
run(`globalThis.a=spawnUnit('fpeAlice',p.x,p.y,{force:true});globalThis.t=spawnUnit('cbMetro',p.x,p.y,{force:true});exSummonTendrils(a,t);`);
assert.equal(run('countKey("aliceTendril")'),3);
run('dealDamage(t,a,1000,{});exSummonTendrils(a,t);updateExpansion(.1);drawUnit(a);a.aliceQuad=!a.aliceQuad;drawUnit(a)');
assert.equal(run('countKey("aliceTendril")'),10);
assert.ok(run('G.units.filter(u=>u.key==="aliceTendril").some(u=>u.sizeMul>1.5 && u.mhp>150)'));
run('G.time+=13;updateExpansion(.1)');assert.equal(run('countKey("aliceTendril")'),0);
assert.equal(run('jokerEligible(t)'),false);assert.equal(run('isInfectHost(t)'),true);
run('t.jokerRate=2;updateExpansion(.1);startTransform(t,"jokerFan",{})');assert.equal(run('t.jokerRate'),0);assert.notEqual(run('t.state'),'transform');
run(`globalThis.z1=spawnUnit('pvZombie',p.x,p.y,{force:true});`);
run(`globalThis.z2=spawnUnit('pvJack',p.x,p.y,{force:true});globalThis.hp1=z1.hp;dealDamage(z2,z1,1000,{});z1.tgt=z2;z1.aggro=z2;aiThink(z1);`);
assert.equal(run('z1.hp'),run('hp1'));assert.equal(run('z1.aggro'),null);assert.notEqual(run('z1.tgt===z2'),true);
// Exercise each added custom action plus every Fen arm weapon, at all qualities.
run(`
G.units=[];globalThis.target=spawnUnit('cbCore',p.x,p.y,{force:true});target.mhp=target.hp=1000000;
for(const k of ['rezeBomb','typhoonChild','typhoonAdult','gon','killua','genthru','fen','fpeAlice']){
 const u=spawnUnit(k,p.x+20,p.y,{force:true});u.state='idle';if(k==='genthru'){u.fac='bm';u.bmHidden=0;}
 const defs=k==='fpeAlice'?SP[k].formAtks.flat():[...u.atkList,...(k==='gon'?GON_ADULT_ATKS:[])];
 for(const d of defs){if(!d.exAction&&!d.fenMorph)continue;u.atk={def:d,tgt:target,t:0,ang:0,hits:[]};fireAttack(u,d,u.atk);for(const q of ['high','mid','low']){G.quality=q;drawUnit(u);}}
}
for(const h of G.exHazards)drawExHazard(h);updateExpansion(2);drawCountdownBombs();
`);
assert.equal(run('Object.keys(DRAW_ERRS).length'),0);
run(`FAC_SEL=new Set(['rz','hn','bm','sp','vg','V','W','X']);startGame({size:'s'});`);
assert.equal(run('countKey("mcVillager")'),24);
assert.equal(run('countKey("villRifle")+countKey("villNata")+countKey("villAxe")'),14);
assert.equal(run('countKey("warrior")'),14);assert.equal(run('countKey("drone")'),12);assert.equal(run('countKey("runner")'),8);
assert.equal(run('countKey("wspike")'),16);assert.equal(run('countFac("sp")'),30);assert.equal(run('G.nests.length'),7);
assert.equal(run('countFac("rz")'),2);assert.equal(run('countFac("hn")'),2);assert.equal(run('facPot("bm")'),3);
run('for(let i=0;i<360;i++)stepSim(1/30)');
assert.ok(run('G.time>11.9'));assert.ok(run('G.units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.x)&&Number.isFinite(u.y))'));
run(`FAC_SEL=new Set(['T','X']);startGame({size:'s'});`);
assert.equal(run('G.countdownBombs.length+G.exHazards.length'),0);assert.equal(run('countFac("rz")+countFac("hn")+countFac("bm")'),0);
console.log('Expansion tests passed: factions, infiltration, timed/contact detonation, Gon revival, Killua counter, Typhoon growth, living tendrils, forms/arm rendering, Joker immunity, PvZ allies, all custom actions, populations, simulation and restart.');
