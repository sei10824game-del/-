const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);sandbox.innerWidth=1280;sandbox.innerHeight=720;
run(`G.units=[];G.corpses=[];G.items=[];G.facOff={};G.claimed=[];G.time=0;G.cfg.invincibility=false;G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,inf:0,conv:0};G.map=genMansion(120,84,74538);PF.init();globalThis.p=randWalkIn(G.map.rooms[0]);`);
assert.ok(run(`['rezeBomb','typhoonChild','typhoonAdult','makima','denji','fpeAlice'].every(k=>DEVIL_SPECIES.includes(k))`));
run(`globalThis.immuneResults=[];for(const k of DEVIL_SPECIES){const u=spawnUnit(k,p.x,p.y,{force:true});if(!u)throw Error(k);immuneResults.push(!isInfectHost(u)&&!jokerEligible(u)&&!srpCothHost(u)&&!nmInSignal(u)&&!xDeathHook({fac:'fl'},u,{})&&!srpDeathHook({fac:'srp'},u,{})&&!virusMonsterRise({fac:'T'},u,{}));const fac=u.fac;virusConvert(u,'tv');if(u.fac!==fac)throw Error('Direct conversion '+k);startTransform(u,'jokerFan',{});if(u.state==='transform')throw Error('Joker '+k);startTransform(u,'tvZombie',{});if(u.state==='transform')throw Error('Virus transformation '+k);u.jokerRate=2;u.inf=u.infG=u.infC=u.coth=u.tvInfV=2;updateExpansion(.1);if(u.jokerRate||u.inf||u.infG||u.infC||u.coth||u.tvInfV)throw Error('Residue '+k);drawUnit(u);}`);
assert.ok(run('immuneResults.every(Boolean)'));
// Ordinary controlled people do not become infection-immune just by joining Makima.
run(`globalThis.h=spawnUnit('human',p.x,p.y,{force:true});mkControl(h,G.units.find(u=>u.key==='makima'));`);assert.equal(run('!!h.sp.devilImmune'),false);
run(`G.units=[];G.claimed=[];spawnVillage();globalThis.before=countFac('vg');for(const u of G.units.filter(villageResident))u.breedCd=100;updateVillage(.1);`);
assert.equal(run('countFac("vg")'),run('before+1'));assert.equal(run('G.village.nextPopulation'),14);
run('for(let i=0;i<6;i++){G.village.tick=0;updateVillage(.1);}');assert.equal(run('countFac("vg")'),run('before+7'));assert.equal(run('G.village.nextPopulation'),26);run('G.village.tick=0;updateVillage(.1)');assert.equal(run('countFac("vg")'),run('before+7'));
run(`globalThis.v=spawnUnit('verityMon',p.x,p.y,{force:true});for(const q of ['high','mid','low']){G.quality=q;drawUnit(v);}`);assert.equal(run('v.pal.skin'),'#ffe300');assert.ok(run('v.sp.pp.legU>=20&&v.sp.pp.torsoW<3'));
assert.equal(run('Object.keys(DRAW_ERRS).length'),0);
run(`FAC_SEL=new Set(['X','H','A','tv','rz','vg']);startGame({size:'s'});`);
assert.equal(run('countFac("X")'),35);assert.equal(run('G.eggs.filter(e=>e.fac!=="W").length'),18);
assert.equal(run('countFac("H")'),24);assert.equal(run('countFac("A")'),24);assert.equal(run('countFac("tv")'),29);
assert.equal(run('countKey("headcrab")'),10);assert.equal(run('countKey("hcfast")'),3);assert.equal(run('countKey("hcrevive")'),5);
run('for(let i=0;i<450;i++)stepSim(1/30)');assert.ok(run('G.time>14.9'));assert.ok(run('G.units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.x)&&Number.isFinite(u.y))'));
console.log('Devils/population passed: living/death/direct infection guards, Joker immunity, no immunity for human pawns, easier golems without repetition, yellow slender Verity, four starting populations and simulation.');
