const assert=require('node:assert/strict');const fs=require('node:fs');const roster=JSON.parse(fs.readFileSync('research/five-factions-roster.json'));const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);sandbox.innerWidth=1280;sandbox.innerHeight=720;
run(`G.units=[];G.corpses=[];G.items=[];G.facOff={};G.claimed=[];G.time=0;G.cfg.invincibility=false;G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,inf:0,conv:0};G.map=genMansion(120,84,74538);G.map.walk.fill(1);G.map.propGrid.fill(0);PF.init();globalThis.p={x:600,y:600};spawnFiveFactions();`);
assert.equal(roster.length,398);assert.equal(run('FIVE_TYPES.length'),roster.length);
for(const[f,n]of Object.entries({pr:22,cv:79,th:22,dr:68,dm:12}))assert.equal(run(`countFac('${f}')`),n);
assert.ok(run('FIVE_TYPES.every(r=>SP[r.key]&&SP[r.key].five===r&&SP[r.key].atks.length===r.moves.length&&FAC_BY[r.faction])'));
// UI registration, passive victory exclusion, regular roster does not have a faction admission cap.
run(`G.units=[];spawnUnit('dr_bob',p.x,p.y);spawnUnit('dr_moonlight_guiding_light',p.x,p.y);`);assert.equal(run('facPot("dr")'),0);assert.equal(run('facLiveCount("dr")'),0);
run(`for(let i=0;i<120;i++)spawnUnit('cv_grunt_minor',p.x,p.y);`);assert.equal(run('countFac("cv")'),120);
// Covenant shields absorb before HP and recover after a quiet interval.
run(`G.units=[];globalThis.h=spawnUnit('human',650,600);globalThis.elite=spawnUnit('cv_elite_minor',600,600);globalThis.sh=elite.fiveShield;dealDamage(h,elite,50,{});`);
assert.equal(run('elite.hp'),run('elite.mhp'));assert.equal(run('elite.fiveShield'),run('sh-50'));
run('G.time+=6;updateFive(1)');assert.ok(run('elite.fiveShield>sh-50'));
// Cloaking changes acquisition; damage reveals it. Normal infantry can be infected, mechanical/ghost bodies cannot.
run(`globalThis.pr=spawnUnit('pr_jungle_hunter',900,600);pr.fiveCloakUntil=G.time+5;h.faceA=0;`);assert.equal(run('canSee(h,pr)'),false);
run('dealDamage(h,pr,10,{})');assert.equal(run('pr.fiveCloakUntil'),0);
assert.equal(run('isInfectHost(elite)'),true);assert.equal(run(`isInfectHost(spawnUnit('cv_ghost',700,600))`),false);
// Assimilation is a contact operation, never converts immune devils or live EXEs.
run(`globalThis.th=spawnUnit('th_juliette_abdominal_maw',600,600);globalThis.v=spawnUnit('human',620,600);v.hp=10;globalThis.d=th.sp.atks.find(d=>d.fiveMove==='assimilate');fiveFire(th,d,{tgt:v});G.time+=4.1;updateFive(.1);`);
assert.equal(run('v.fac'),'th');assert.equal(run('v.fiveHidden'),true);assert.equal(run('infectionProtected(v)'),true);
run(`globalThis.lx=spawnUnit('lordX',620,600);fiveFire(th,d,{tgt:lx});`);assert.equal(run('lx.fac'),'lx');
// Death separation and resurrection are actual spawn operations with no population gate.
run(`G.units=[];G.corpses=[];globalThis.t=spawnUnit('th_palmer_vertical_maw',600,600);t.hp=0;killUnit(null,t,{});`);assert.equal(run('countKey("th_norris_head_spider")'),1);
run(`G.units=[];G.corpses=[];globalThis.arch=spawnUnit('dm_arch_vile_classic',600,600);globalThis.imp=spawnUnit('dm_imp_classic',620,600);imp.hp=0;killUnit(null,imp,{noRise:1});globalThis.ok=fiveResurrect(arch);`);assert.equal(run('ok'),true);assert.equal(run('countKey("dm_imp_classic")'),1);
// Figure does not reacquire a silent, distant target via the generic monster AI.
run(`G.units=[];globalThis.fig=spawnUnit('dr_figure',600,600);globalThis.silent=spawnUnit('human',740,600);silent.moveSpd=0;silent.state='idle';thinkFive(fig);`);assert.equal(run('fig.tgt'),null);
run(`silent.moveSpd=60;thinkFive(fig);`);assert.equal(run('fig.tgt===silent'),true);
// Homing actually turns velocity instead of only changing a projectile's label.
run(`globalThis.bolt={x:600,y:600,vx:300,vy:0,fiveHoming:true,fiveTarget:silent};silent.x=600;silent.y=740;fiveGuideProjectile(bolt,.1);`);assert.ok(run('bolt.vy>0&&bolt.vx<300'));assert.ok(run('Math.abs(Math.hypot(bolt.vx,bolt.vy)-300)<.00001'));
assert.deepEqual(JSON.parse(run(`JSON.stringify(SP.dr_seek_dam.atks.map(d=>d.fiveMove))`)),['seekspawn']);
// Every special move is dispatched at least once on a live clear-room target.
run(`globalThis.moves=new Map();for(const key of FIVE_TYPES.map(r=>r.key))for(const d of SP[key].atks)if(d.fiveMove&&!moves.has(d.fiveMove))moves.set(d.fiveMove,{key,d});
for(const {key,d}of moves.values()){
 G.units=[];G.corpses=[];G.fiveFields=[];const u=spawnUnit(key,600,600),t=spawnUnit('human',630,600);t.mhp=t.hp=100000;t.faceA=Math.PI;t.moveSpd=70;t.state='move';u.fiveHidden=false;
 if(['resurrect','revive'].includes(d.fiveMove))G.corpses.push({key:u.fac==='dr'?'dr_seek_humanoid':'dm_imp_classic',x:620,y:600});
 fiveFire(u,d,{tgt:t});G.time+=.8;updateFive(.1);drawFiveUnit(u,poseFor(u));drawFiveFields();
 if(!Number.isFinite(u.x)||!Number.isFinite(t.hp))throw Error('Nonfinite '+d.fiveMove);
}`);assert.ok(run('moves.size>50'));assert.equal(run('Object.keys(DRAW_ERRS).length'),0);
// Rush is motion through the room, not a renamed instant hit. Rebound returns along its route.
run(`G.units=[];G.fiveFields=[];globalThis.rush=spawnUnit('dr_ambush',600,600);globalThis.prey=spawnUnit('human',690,600);prey.hp=prey.mhp=10000;globalThis.ra=rush.sp.atks[0];fiveFire(rush,ra,{tgt:prey});globalThis.positions=[];for(let i=0;i<50;i++){G.time+=1/30;updateFive(1/30);positions.push(rush.x);}`);
assert.ok(run('Math.max(...positions)>670'));assert.ok(run('prey.hp<10000'));assert.ok(run('positions.some((x,i)=>i>0&&x<positions[i-1]-1)'));
// Normal game initialization and roster selection. Limit simulation fixture, not production population.
run(`FAC_SEL=new Set(['pr','cv','th','dr','dm']);startGame({size:'s'});`);
for(const f of ['pr','cv','th','dr','dm'])assert.equal(run(`countFac('${f}')`),f==='dm'?12:roster.filter(r=>r.faction===f).length);
run(`for(let i=0;i<90;i++)stepSim(1/30);`);assert.ok(run('G.units.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.y)&&Number.isFinite(u.hp))'));
run(`G.units=G.units.filter(u=>['pr_jungle_hunter','cv_elite_minor','th_juliette_abdominal_maw','dr_figure','dm_imp_classic','human'].includes(u.key));for(let i=0;i<90;i++)stepSim(1/30);`);assert.ok(run('G.units.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.y)&&Number.isFinite(u.hp))'));
run(`FAC_SEL=new Set(['pr']);startGame({size:'s'});`);assert.equal(run('countFac("pr")'),22);for(const f of ['cv','th','dr','dm'])assert.equal(run(`countFac('${f}')`),0);assert.equal(run('G.fiveFields.length'),0);
console.log('Five factions passed: 398 roster entries, registration/spawn/selection, no faction caps, passive victory handling, shields/regen, cloak, organic/machine infection rules, protected assimilation, corpse split/resurrection, every custom dispatcher, actual rebound, rendering and simulation.');
