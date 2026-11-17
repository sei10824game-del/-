const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);
run(`G.map=genMansion(120,84,74538);G.map.walk.fill(1);G.map.propGrid.fill(0);PF.init();G.cfg.invincibility=false;G.facOff={};G.time=100;G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,inf:0,conv:0};
function resetFive(){G.units=[];G.corpses=[];G.projs=[];G.fiveFields=[];fiveInitRules();}
function mk(k,x=600,y=600){return spawnUnit(k,x,y,{force:true});}
resetFive();globalThis.j=mk('cv_jackal_minor');globalThis.h=mk('human',650);j.faceA=0;globalThis.hp=j.hp,sh=j.fiveShield;dealDamage(h,j,50,{fiveWeapon:'rifle'});`);
assert.equal(run('j.hp'),run('hp'));assert.equal(run('j.fiveShield'),run('sh'));
run(`h.x=550;dealDamage(h,j,50,{fiveWeapon:'rifle'});`);assert.equal(run('j.hp'),run('hp-50'));assert.equal(run('j.fiveShield'),run('sh'));
run(`h.x=650;dealDamage(h,j,10,{fiveWeapon:'chargedplasma'});`);assert.equal(run('j.fiveShield'),0);
run(`resetFive();globalThis.hunter=mk('cv_hunter_fuel_rod');globalThis.h=mk('human',650);hunter.faceA=0;globalThis.hp=hunter.hp;dealDamage(h,hunter,50,{fiveWeapon:'rifle'});`);assert.equal(run('hunter.hp'),run('hp'));
run(`h.x=550;dealDamage(h,hunter,50,{fiveWeapon:'rifle'});`);assert.equal(run('hunter.hp'),run('hp-50'));
run(`resetFive();globalThis.m=mk('dm_marauder');globalThis.h=mk('human',750);globalThis.hp=m.hp;dealDamage(h,m,50,{fiveWeapon:'rifle'});dealDamage(h,m,50,{fiveWeapon:'rifle'});`);assert.equal(run('m.hp'),run('hp'));assert.equal(run('countKey("dm_marauder_spirit_wolf")'),1);
run(`globalThis.ax=m.atkList.find(d=>d.fiveMelee==='axe');m.atk={def:ax,t:ax.windup-.1};dealDamage(h,m,50,{fiveWeapon:'rifle'});`);assert.equal(run('m.hp'),run('hp-50'));assert.ok(run('fiveMarauderOpen(m)'));
assert.equal(run('SP.dm_imp_classic.hp'),60);assert.equal(run('SP.dm_cyberdemon_classic.hp'),4000);
run(`resetFive();globalThis.c=mk('dm_cyberdemon_classic');globalThis.h=mk('human',650);dealDamage(h,c,500,{explosion:1});`);assert.equal(run('c.hp'),4000);
// Spell follows its victim, then checks actual wall occlusion at detonation.
run(`resetFive();globalThis.arch=mk('dm_arch_vile_classic');globalThis.h=mk('human',820);h.hp=h.mhp=1000;globalThis.spell=arch.atkList.find(d=>d.fiveMove==='hellfire');fiveFire(arch,spell,{tgt:h});h.x=850;G.time+=1;updateFive(.1);`);assert.equal(run('h.hp'),1000);
run(`G.time+=1.1;updateFive(.1);`);assert.equal(run('h.hp'),910);
run(`fiveFire(arch,spell,{tgt:h});for(let y=0;y<G.map.h;y++)G.map.walk[y*G.map.w+Math.floor(700/TILE)]=0;G.time+=2.1;updateFive(.1);`);assert.equal(run('h.hp'),910);
run(`G.map.walk.fill(1);G.corpses=[{key:'dm_cyberdemon_classic',x:620,y:600},{key:'dm_imp_classic',x:625,y:600}];fiveResurrect(arch);`);assert.equal(run('countKey("dm_imp_classic")'),1);assert.equal(run('countKey("dm_cyberdemon_classic")'),0);assert.equal(run('fiveResurrect(arch)'),false);
// Seven physical needles combine. Ordinary hits retain individual delayed shard bursts.
run(`resetFive();globalThis.el=mk('cv_elite_minor');globalThis.h=mk('human',650);h.hp=h.mhp=10000;
function needle(){const p={x:640,y:600,z:24,vx:360,vy:0,t:0,life:2,src:el,weapon:'needler',dmg:12,hits:new Set()};return fiveProjectileStep(p,.02);}
for(let i=0;i<6;i++)needle();`);assert.equal(run('h.fiveNeedles.length'),6);
run('needle()');assert.equal(run('h.fiveNeedles.length'),0);assert.ok(run('h.hp<=10000-168'));
run(`needle();G.time+=1.1;updateFive(.1);`);assert.equal(run('h.fiveNeedles.length'),0);
// Sticky projectiles attach before their fuse; no instant generic rocket damage.
run(`resetFive();globalThis.el=mk('cv_elite_minor');globalThis.h=mk('human',650);h.hp=h.mhp=1000;globalThis.sticky={x:640,y:600,z:24,vx:200,vy:0,t:.1,life:4,src:el,weapon:'sticky',grenade:true,fuse:1.5,dmg:50,hits:new Set()};fiveProjectileStep(sticky,.03);`);assert.equal(run('sticky.stuck===h'),true);assert.equal(run('h.hp'),1000);
run(`h.x=700;sticky.t=1.6;fiveProjectileStep(sticky,.01);`);assert.equal(run('sticky.x'),700);assert.equal(run('h.hp'),950);
// Gaze, reaction window including camera movement, looking at Screech, and hiding.
run(`resetFive();globalThis.eyes=mk('dr_eyes');globalThis.h=mk('human',800);h.hp=h.mhp=1000;h.faceA=Math.PI;G.time+=1;updateFive(.1);`);assert.equal(run('h.hp'),990);
run(`h.faceA=0;G.time+=.3;updateFive(.1);`);assert.equal(run('h.hp'),990);
run(`globalThis.spot={x:800,y:600};fiveEnterHide(h,spot);h.faceA=Math.PI;G.time+=.3;updateFive(.1);dealDamage(h,eyes,100000,{});`);assert.equal(run('h.hp'),990);assert.equal(run('eyes.hp'),run('eyes.mhp-100000'));assert.equal(run('eyes.dead&&eyes.gone'),true); // User removed blanket normal-attack immunity.
run(`globalThis.hide=mk('dr_hide');G.time+=12.1;updateFive(.1);`);assert.equal(run('h.fiveHiding'),null);assert.equal(run('h.hp'),950);assert.ok(run('h.fiveHideBlockedUntil>G.time'));
run(`resetFive();globalThis.a90=mk('dr_a_90');globalThis.h=mk('human',800);h.hp=h.mhp=1000;globalThis.curse=a90.atkList[0];fiveFire(a90,curse,{tgt:h});G.time+=.65;updateFive(.1);h.faceA+=.2;G.time+=.3;updateFive(.1);`);assert.equal(run('h.hp'),910);
run(`fiveFire(a90,curse,{tgt:h});G.time+=.65;updateFive(.1);G.time+=.3;updateFive(.1);`);assert.equal(run('h.hp'),910);
run(`resetFive();globalThis.s=mk('dr_screech');globalThis.h=mk('human',800);h.hp=h.mhp=1000;h.faceA=Math.PI;fiveFire(s,s.atkList[0],{tgt:h});G.time+=1.1;updateFive(.1);`);assert.equal(run('h.hp'),1000);
run(`h.faceA=0;fiveFire(s,s.atkList[0],{tgt:h});G.time+=1.1;updateFive(.1);`);assert.equal(run('h.hp'),960);
// Close-contact assimilation takes time and breaks on separation, never a ranged three-hit conversion.
run(`resetFive();globalThis.th=mk('th_juliette_abdominal_maw');globalThis.h=mk('human',620);globalThis.assim=th.atkList.find(d=>d.fiveMove==='assimilate');fiveFire(th,assim,{tgt:h});`);assert.equal(run('h.fac'),'N');
run(`h.x=800;G.time+=5;updateFive(.1);`);assert.equal(run('h.fac'),'N');assert.equal(run('th.fiveAssimilating'),null);
run(`h.x=620;fiveFire(th,assim,{tgt:h});G.time+=4.1;updateFive(.1);`);assert.equal(run('h.fac'),'th');assert.equal(run('h.fiveOrigin'),'human');assert.equal(run('h.fiveRevealAt'),Infinity);
// Net is a real constricting projectile, not a generic slow effect.
run(`resetFive();globalThis.pr=mk('pr_city_hunter');globalThis.h=mk('human',650);h.hp=h.mhp=1000;fiveFire(pr,pr.atkList.find(d=>d.fiveMove==='net'),{tgt:h});globalThis.net=G.projs[0];net.t=.1;fiveProjectileStep(net,.1);`);assert.ok(run('h.fiveNet'));assert.equal(run('effSpeed(h)'),0);
run(`G.time+=.6;updateFive(.1);`);assert.equal(run('h.hp'),990);run(`dealDamage(pr,h,1,{acid:true});`);assert.equal(run('h.fiveNet'),null);
// Mines persist until proximity activation, detonate once, and classic guns are hitscan.
run(`resetFive();globalThis.pr=mk('pr_cleaner_wolf');globalThis.h=mk('human',750);h.hp=h.mhp=1000;fiveFire(pr,pr.atkList.find(d=>d.fiveMove==='mine'),{tgt:h});h.x=1000;G.time+=5;updateFive(.1);`);assert.equal(run('G.fiveMines.length'),1);assert.equal(run('h.hp'),1000);
run(`h.x=750;G.time+=.1;updateFive(.1);`);assert.equal(run('G.fiveMines.length'),0);assert.ok(run('h.hp<1000'));run(`globalThis.last=h.hp;G.time+=1;updateFive(.1);`);assert.equal(run('h.hp'),run('last'));
run(`resetFive();globalThis.z=mk('dm_zombieman');globalThis.h=mk('human',680);h.hp=h.mhp=1000;fireAttack(z,z.atkList.find(d=>d.fiveShot==='rifle'),{tgt:h});`);assert.equal(run('G.projs.length'),0);assert.ok(run('h.hp<1000'));assert.equal(run('z.atkList.find(d=>d.fiveShot).volley'),1);
// The BFG impact performs its spray from the shooter; it is not a passive aura.
run(`resetFive();globalThis.z=mk('dm_zombieman');globalThis.h=mk('human',680);h.r=40;h.hp=h.mhp=10000;fiveProjectileBurst({src:z,x:900,y:600,vx:300,vy:0,dmg:180,weapon:'bfg'});`);assert.ok(run('h.hp<10000'));
// Population is independent of strength; zero initial count does not disable future summons.
run(`resetFive();FIVE_COUNTS.pr=2;for(const f of ['cv','th','dr','dm'])FIVE_COUNTS[f]=0;spawnFiveFactions();`);assert.equal(run('countFac("pr")'),44);assert.equal(run('countFac("cv")'),0);assert.equal(run('SP.dm_imp_classic.hp'),60);
run(`for(const f of Object.keys(FIVE_COUNTS))FIVE_COUNTS[f]=1;`);
console.log('Source-rule regression passed: directional shields/weak points, Marauder shield/counter/wolf, classic HP and blast immunity, tracking LOS spell and resurrection exclusions, physical needles/supercombine, sticky fuse, gaze/look-away, A90 stop/camera window, Screech counter, Hide timeout, contact assimilation interruption, constricting net, independent initial populations.');
