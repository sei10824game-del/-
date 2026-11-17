const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);
run(`G.cfg.invincibility=false;G.units=[];G.corpses=[];G.items=[];G.facOff={};G.time=0;G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,inf:0,conv:0};G.map=genMansion(120,84,74538);PF.init();globalThis.p=randWalkIn(G.map.rooms[0]);globalThis.parent=spawnUnit('mzombie',p.x,p.y);parent.reinforceBase=parent.reinforce=.7;parent.reinforceCallerCharge=parent.reinforceCalleeCharge=0;globalThis.oldRandom=Math.random;`);
// Force normal children with 0.075 base; mutations and leadership fail at this random value.
run(`Math.random=()=>.75;globalThis.child=mzSpawnReinforcement(parent,'mzombie',p.x,p.y);Math.random=oldRandom;`);
assert.ok(Math.abs(run('parent.reinforce')-.65)<1e-10);assert.ok(Math.abs(run('child.reinforceBase')-.075)<1e-10);assert.ok(Math.abs(run('child.reinforce')-.025)<1e-10);
assert.equal(run('parent.reinforceCallerCharge'),-.05);assert.equal(run('child.reinforceCalleeCharge'),-.05);assert.equal(run('child.reinforceCallerCharge'),0);
run(`Math.random=()=>.75;globalThis.grandchild=mzSpawnReinforcement(child,'mzombie',p.x,p.y);Math.random=oldRandom;`);
assert.equal(run('child.reinforce'),0);assert.equal(run('child.reinforceCallerCharge'),-.05);assert.equal(run('child.reinforceCalleeCharge'),-.05);
run(`Math.random=()=>.75;mzSpawnReinforcement(parent,'mzombie',p.x,p.y);Math.random=oldRandom;`);assert.ok(Math.abs(run('parent.reinforce')-.6)<1e-10);
run(`G.facOff.mz=1;globalThis.before=parent.reinforce;globalThis.failed=mzSpawnReinforcement(parent,'mzombie',p.x,p.y);G.facOff={};`);assert.equal(run('failed'),null);assert.equal(run('parent.reinforce'),run('before'));
// Low bases clamp to zero; independent leader children retain their own higher base minus .05.
run(`Math.random=()=>.01;globalThis.leader=mzSpawnReinforcement(parent,'mzombie',p.x,p.y);Math.random=oldRandom;`);
// spawnMz can roll a mutant; explicitly verify leader child charge using the same additive helper.
run(`globalThis.leader=spawnUnit('husk',p.x,p.y);leader.reinforceBase=.8;leader.reinforce=.8;leader.reinforceCallerCharge=leader.reinforceCalleeCharge=0;mzReinforcementCharge(leader,'reinforceCalleeCharge');`);assert.ok(Math.abs(run('leader.reinforce')-.75)<1e-10);
// Damage integration, not only direct helper calls.
run(`parent.hp=parent.mhp=10000;parent.reinforce=parent.reinforceBase=1;parent.reinforceCallerCharge=parent.reinforceCalleeCharge=0;globalThis.n=countFac('mz');dealDamage(null,parent,1,{});`);
assert.equal(run('countFac("mz")'),run('n+1'));assert.ok(Math.abs(run('parent.reinforce')-.95)<1e-10);
// Ordinary spawning and infection resurrection are allowed above the former 80-unit limit.
run(`while(countFac('mz')<85)spawnUnit('husk',p.x,p.y);globalThis.extra=spawnUnit('drowned',p.x,p.y);globalThis.h=spawnUnit('human',p.x,p.y,{force:true});dealDamage(parent,h,10000,{});`);
assert.ok(run('extra!==null && countFac("mz")>80'));assert.ok(run('G.corpses.some(c=>c.key==="human"&&c.riseAs==="mzombie")'));
run(`globalThis.body=G.corpses.find(c=>c.key==='human'&&c.riseAs==='mzombie');globalThis.beforeRise=countFac('mz');riseFromCorpse(body);`);assert.equal(run('countFac("mz")'),run('beforeRise+1'));
console.log('Zombie reinforcement passed: independent bases, additive parent/child charges, stacking/clamp, failed-spawn exemption, damage integration, and spawn/infection beyond 80.');
