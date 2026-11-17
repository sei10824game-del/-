const assert = require('node:assert/strict');
const {sandbox, vm} = require('./audit-creatures.cjs');
const run = code => vm.runInContext(code, sandbox);
run('G.cfg.invincibility=false');
run(`
G.units=[];G.corpses=[];G.facOff={};G.claimed=[];G.logs=[];G.time=0;
G.stats={};for(const d of FACTION_DEFS)G.stats[d.f]={kills:0,born:0,lost:0,inf:0,conv:0};
G.map=genMansion(108,76,12345);PF.init();
spawnVillage();
`);
assert.equal(run('countKey("mcVillager")'),24);
assert.equal(run('countKey("ironGolem")'),1);
assert.equal(run('EXTRA_GOLEM_DATA.length'),189);
assert.equal(run('new Set(VILLAGE_GOLEMS).size'),190);
assert.ok(run('G.village.fields.length > 0 && G.village.fields.every(f=>walkAtPx(f.x,f.y))'));
assert.ok(run('G.units.every(u=>walkAtPx(u.x,u.y))'));
run(`globalThis.villager=G.units.find(villageResident);globalThis.golem=G.units.find(u=>u.key==='ironGolem');globalThis.human=spawnUnit('human',villager.x,villager.y,{force:true});`);
assert.equal(run('hostileTo(villager,human)||hostileTo(human,villager)||hostileTo(golem,human)||hostileTo(human,golem)||hostileTo(golem,villager)'),false);
assert.equal(run('isInfectHost(villager)'),true);
assert.equal(run('srpCothHost(villager)'),true);
assert.ok(run('VILLAGE_GOLEMS.every(k=>{const u={sp:SP[k],fac:"vg"};return !isInfectHost(u)&&!srpCothHost(u)&&!nmInSignal(u);})'));
run(`G.cfg.screenShake=false;G.cam.shake=5;addShake(20);`);
assert.equal(run('G.cam.shake'),0);
run('G.cfg.screenShake=true;addShake(10)');
assert.equal(run('G.cam.shake'),10);
// A room-sharing villager contracts all three airborne infections, but golems do not.
run(`
for(const k of ['zombie','gcommon','crunner'])spawnUnit(k,villager.x,villager.y,{force:true});
golem.x=villager.x;golem.y=villager.y;airborneContagion();
`);
assert.ok(run('villager.inf>0 && villager.infG>0 && villager.infC>0'));
assert.equal(run('(golem.inf||0)+(golem.infG||0)+(golem.infC||0)'),0);
// Farming and breeding. Keep other populations out of this focused test.
run(`
G.units=G.units.filter(u=>u.fac==='vg');
for(const u of G.units.filter(villageResident)) {u.x=G.village.fields[0].x;u.y=G.village.fields[0].y;u.state='idle';u.down=0;u.hunger=50;u.breedCd=0;}
G.village.fields[0].growth=1;G.village.fields[0].work=3;updateVillage(.1);
`);
assert.ok(run('G.units.some(u=>u.villageHarvest>0 && u.inv.food>0 && u.hunger>50)'));
run(`for(const u of G.units.filter(villageResident)){u.hunger=100;u.thirst=100;u.breedCd=0;u.sizeMul=1;}G.village.tick=0;updateVillage(.1);`);
assert.equal(run('G.village.births'),1);
assert.equal(run('countKey("mcVillager")'),25);
assert.ok(run('G.units.some(u=>u.key==="mcVillager"&&u.sizeMul<.9&&u.growFrac)'));
// Trigger population milestone, verify it cannot repeatedly spawn at the same population.
run(`for(const u of G.units.filter(villageResident))u.breedCd=100;G.village.nextPopulation=26;globalThis.guardsBefore=G.units.filter(u=>u.sp.infectionImmune).length;while(countKey('mcVillager')<26){const p=randWalkIn(G.village.room);spawnUnit('mcVillager',p.x,p.y,{force:true});}G.village.tick=0;updateVillage(.1);`);
assert.equal(run('G.units.filter(u=>u.sp.infectionImmune).length'),run('guardsBefore+1'));
assert.equal(run('G.village.nextPopulation'),28);
run('G.village.tick=0;updateVillage(.1)');
assert.equal(run('G.units.filter(u=>u.sp.infectionImmune).length'),run('guardsBefore+1'));
// Test actual infection progression dispatch and infant growth via updateUnit.
run(`villager.inf=1.1;villager.infG=0;villager.infC=0;updateUnit(villager,.1);`);
assert.equal(run('villager.state'),'transform');
run(`globalThis.baby=G.units.find(u=>u.key==='mcVillager'&&u.sizeMul<.9);globalThis.oldSize=baby.sizeMul;updateUnit(baby,1);`);
assert.ok(run('baby.sizeMul>oldSize'));
// Immune golem cannot be converted on hit/death/direct viral resurrection paths.
assert.equal(run('xDeathHook({fac:"fl"},golem,{})'),false);
assert.equal(run('virusMonsterRise({fac:"T"},golem,{})'),false);
run('virusConvert(golem,"T")');
assert.equal(run('golem.fac'),'vg');
// Restart/disabled faction must clear the previous village rather than retain farms or spawns.
run('G.units=[];G.facOff={vg:1};spawnVillage()');
assert.equal(run('G.village'),null);
assert.equal(run('G.units.length'),0);
console.log('Village tests passed: roster, spawn, farming, breeding, milestones, growth, alliances, infection, immunity, shake, disabled faction.');

// Full game bootstrap and simulation (mock DOM/Canvas, real map/AI/combat).
sandbox.innerWidth=1280;sandbox.innerHeight=720;
run(`G.cfg.sound=false;Sfx.on=false;FAC_SEL=new Set(['vg','T']);G.cfg.screenShake=false;startGame({size:'s'});`);
assert.ok(run('G.village && countKey("mcVillager")===24 && countKey("ironGolem")===1'));
assert.equal(run('G.cfg.screenShake'),false);
run('for(let i=0;i<300;i++)stepSim(1/30)');
assert.ok(run('G.time>9.9'));
run(`FAC_SEL=new Set(['T','X']);startGame({size:'s'});`);
assert.equal(run('G.village'),null);
assert.equal(run('countFac("vg")'),0);
console.log('Full start/restart and 10-second simulation passed.');
