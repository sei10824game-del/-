const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);sandbox.innerWidth=1280;sandbox.innerHeight=720;
run(`G.units=[];G.corpses=[];G.items=[];G.facOff={};G.claimed=[];G.time=0;G.cfg.invincibility=false;G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,inf:0,conv:0};G.map=genMansion(120,84,74538);PF.init();globalThis.p=randWalkIn(G.map.rooms[0]);spawnExeFactions();`);
assert.equal(run('countFac("lx")'),11);assert.equal(run('countFac("sx")'),5);
run(`for(const k of [...EXE_ROSTERS.lx,...EXE_ROSTERS.sx]){
 const u=G.units.find(v=>v.key===k);if(!u||u.sp.atks.length<2)throw Error('Roster '+k);
 if(isInfectHost(u)||jokerEligible(u)||srpCothHost(u)||nmInSignal(u))throw Error('Living infection '+k);
 const fac=u.fac;virusConvert(u,'tv');if(u.fac!==fac)throw Error('Conversion '+k);
 for(const to of ['joker','jokerFan','tvZombie','zombie']){startTransform(u,to);if(u.state==='transform')throw Error('Direct transform '+k);}
 u.jokerRate=3;u.inf=u.infG=u.infC=u.coth=u.tvInfV=2;updateExpansion(.1);
 if(u.jokerRate||u.inf||u.infG||u.infC||u.coth||u.tvInfV)throw Error('Residue '+k);
 if(spawnUnit(k,p.x,p.y,{force:true}))throw Error('Duplicate '+k);
}
`);
// A dead vessel loses its living-only protection and can rise infected under normal corpse rules.
run(`globalThis.vessel=G.units.find(v=>v.key==='lxAlan');vessel.hp=0;vessel.dead=true;vessel.gone=true;`);
assert.equal(run('infectionProtected(vessel)'),false);assert.equal(run('isInfectHost(vessel)'),true);
run(`globalThis.savedRandom=Math.random;Math.random=()=>0;globalThis.rose=virusMonsterRise({fac:'T'},vessel,{});Math.random=savedRandom;`);
assert.equal(run('rose'),true);
run(`globalThis.c=G.corpses[G.corpses.length-1];riseFromCorpse(c);globalThis.infected=G.units.find(u=>u.key==='lxAlan'&&!u.dead&&!u.gone);`);
assert.equal(run('infected.fac'),'T');assert.equal(run('infected.virusFac'),'T');run('updateExe(.1)');assert.equal(run('infected.virusFac'),'T');
// Exercise every custom action against an actual hostile in a clear room.
run(`G.units=[];G.corpses=[];G.exeEffects=[];globalThis.results=[];
for(const key of [...EXE_ROSTERS.lx,...EXE_ROSTERS.sx]){
 G.units=[];const u=spawnUnit(key,p.x,p.y,{force:true});const t=spawnUnit('human',p.x+10,p.y,{force:true});t.hp=t.mhp=10000000;
 for(const d of u.sp.atks.filter(d=>d.exAction)){
  u.x=p.x;u.y=p.y;t.x=p.x+10;t.y=p.y;t.hp=10000000;t.dead=t.gone=false;const old=t.hp;
  exFire(u,d,{tgt:t});if(t.hp>=old)throw Error('No attack damage '+key+'/'+d.n);
  if(d.exAction==='exeWarp'&&dist(u.x,u.y,p.x,p.y)<1)throw Error('No teleport');
  if(d.exAction==='exeLight'&&!(t.slowT>0))throw Error('No trap');
  if(d.exAction==='exeDecay'){if(!t.exeDecay)throw Error('No decay');G.time+=1;const hp=t.hp;updateExe(.1);if(t.hp>=hp)throw Error('No decay tick');}
  if(d.exAction==='exeIllusion'&&!G.exeEffects.some(e=>e.kind==='statue'))throw Error('No illusions');
  startAttack(u,d,t);for(const f of [.15,.45,.75]){u.atk.t=(d.windup+d.active+d.rec)*f;drawUnit(u);}u.atk=null;u.state='idle';results.push(d.n);
 }
}drawExeEffects();`);
assert.equal(run('results.length'),run('[...EXE_ROSTERS.lx,...EXE_ROSTERS.sx].reduce((n,k)=>n+SP[k].atks.filter(a=>a.exAction).length,0)'));assert.ok(run('results.length>20'));assert.equal(run('Object.keys(DRAW_ERRS).length'),0);
// Actual attack timeline: the mouth finisher is telegraphed and stops infected resurrection.
run(`G.units=[];G.corpses=[];globalThis.exe=spawnUnit('sonicExe',p.x,p.y,{force:true});globalThis.target=spawnUnit('human',p.x+10,p.y,{force:true});globalThis.hole=exe.sp.atks.find(a=>a.exAction==='exeHole');startAttack(exe,hole,target);updateAttack(exe,.5);`);
assert.equal(run('target.dead'),false);
run('updateAttack(exe,2)');assert.equal(run('target.dead'),true);assert.equal(run('G.corpses.some(c=>c.riseAs||c.virusFac)'),false);
// Restart, disabled factions, persistent selection, finite multi-faction simulation.
run(`FAC_SEL=new Set(['lx','sx','T','jk']);startGame({size:'s'});`);assert.equal(run('countFac("lx")'),11);assert.equal(run('countFac("sx")'),5);
run('for(let i=0;i<600;i++)stepSim(1/30)');assert.ok(run('G.units.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.y)&&Number.isFinite(u.hp))'));
run(`FAC_SEL=new Set(['sx']);startGame({size:'s'});`);assert.equal(run('countFac("lx")'),0);assert.equal(run('countFac("sx")'),5);assert.equal(run('G.exeEffects.length'),0);
console.log('EXE passed: 16 characters, living-only infection/Joker immunity, infected corpse resurrection, unique roster, all custom attacks, decay, trap, teleport, illusions, telegraphed erasure, render, restart/selection and 20s simulation.');
