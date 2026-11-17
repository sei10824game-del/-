// Tests current dispatcher behavior, not a claim that its summon pools match canon.
const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);
run(`G.map=genMansion(120,84,74538);G.map.walk.fill(1);G.map.propGrid.fill(0);G.facOff={};G.time=100;G.cfg.invincibility=false;G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,inf:0,conv:0};
function resetDoom(){G.units=[];G.corpses=[];G.projs=[];fiveInitRules();}
function mk(k,x=600){return spawnUnit(k,x,600,{force:true});}
resetDoom();globalThis.s=mk('dm_summoner_2016');globalThis.h=mk('human',800);fiveFire(s,s.atkList.find(d=>d.fiveMove==='demonspawn'),{tgt:h});`);assert.equal(run(`countKey('dm_imp_classic')`),2);assert.equal(run('h.fac'),'N');
run(`resetDoom();globalThis.p=mk('dm_pain_elemental_classic');fiveFire(p,p.atkList.find(d=>d.fiveMove==='lostsouls'),{tgt:null});`);assert.equal(run(`countKey('dm_lost_soul_classic')`),3);
run(`fiveOnDeath(p,{});`);assert.equal(run(`countKey('dm_lost_soul_classic')`),6);
run(`resetDoom();globalThis.a=mk('dm_arch_vile_classic');globalThis.imp=mk('dm_imp_classic',625);makeCorpse(imp);imp.gone=imp.dead=true;`);assert.equal(run('fiveResurrect(a)'),true);assert.equal(run('G.corpses.length'),0);assert.equal(run(`countKey('dm_imp_classic')`),1);
run(`G.units=G.units.filter(u=>u===a);globalThis.imp=mk('dm_imp_classic',625);makeCorpse(imp,{gib:true});imp.gone=imp.dead=true;`);assert.equal(run('fiveResurrect(a)'),false);
run(`resetDoom();globalThis.m=mk('dm_marauder');globalThis.h=mk('human',650);m.faceA=0;dealDamage(h,m,50,{fiveWeapon:'rifle'});`);assert.equal(run(`countKey('dm_marauder_spirit_wolf')`),1);
run(`resetDoom();globalThis.ac=mk('dm_acolyte');fiveFire(ac,ac.atkList.find(d=>d.fiveMove==='clone'),{tgt:null});`);assert.equal(run(`G.units.filter(u=>u.fiveClone).length`),1);assert.equal(run('G.units.find(u=>u.fiveClone).fiveExpires'),110);
run(`G.time=111;updateFive(.1);`);assert.equal(run(`G.units.filter(u=>u.fiveClone&&!u.gone).length`),0);
console.log('DOOM growth inspection passed: generic summon pool, lost-soul release, corpse-consuming resurrection with gib exclusion, reactive wolf, expiring non-recursive clone; no human conversion in generic summoning.');
