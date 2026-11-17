const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);sandbox.innerWidth=1280;sandbox.innerHeight=720;
run(`G.units=[];G.corpses=[];G.items=[];G.facOff={};G.time=0;G.claimed=[];G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,conv:0};G.map=genMansion(120,84,74538);PF.init();globalThis.p=randWalkIn(G.map.rooms[0]);globalThis.h=spawnUnit('human',p.x,p.y,{force:true});h.hp=h.mhp=10000;`);
for(const state of ['spawn','transform','grow']){
 run(`h.state='${state}';G.cfg.invincibility=false;globalThis.hp=h.hp;dealDamage(null,h,100,{});`);assert.equal(run('h.hp'),run('hp-50'));
}
run(`h.state='idle';h.shellT=3;G.cfg.invincibility=false;globalThis.hp=h.hp;dealDamage(null,h,100,{});`);assert.equal(run('h.hp'),run('hp'));
run(`h.shellT=0;G.cfg.invincibility=true;globalThis.hp=h.hp;dealDamage(null,h,100,{});dealDamage(null,h,100,{});`);assert.equal(run('h.hp'),run('hp-100'));
run(`G.time+=.36;dealDamage(null,h,100,{});`);assert.equal(run('h.hp'),run('hp-200'));
run(`G.cfg.invincibility=false;dealDamage(null,h,100,{});dealDamage(null,h,100,{});`);assert.equal(run('h.hp'),run('hp-400'));
// Exact coincident positions previously never separated because d>.01 was required.
run(`G.units=[];globalThis.a=spawnUnit('cbMetro',p.x,p.y,{force:true});globalThis.b=spawnUnit('cbMetro',p.x,p.y,{force:true});Spatial.rebuild();separateUnits(.1);`);assert.ok(run('dist(a.x,a.y,b.x,b.y)>.1'));
run(`G.units=[];G.claimed=[];spawnCombineFactions();globalThis.room=G.city17.room;globalThis.q=randWalkIn(room);globalThis.enemy=spawnUnit('zombie',q.x,q.y,{force:true});enemy.state='idle';Spatial.rebuild();cbUpdateSquads();`);
assert.equal(run('cbCoreIntruder()===enemy'),true);assert.ok(run('G.cbSquads.every(s=>s.target===enemy)'));
run(`globalThis.cop=G.units.find(u=>u.key==='cbAR2');cop.state='idle';cop.tgt=null;thinkCombine(cop);`);assert.equal(run('cop.tgt===enemy'),true);
run(`globalThis.u=G.units.find(u=>u.key==='cbSMG');globalThis.points=[cop,u].map(v=>cbFormationPoint(v,enemy,170));`);
assert.ok(run('points.every(p=>p&&walkAtPx(p.x,p.y))'));assert.ok(run('dist(points[0].x,points[0].y,points[1].x,points[1].y)>10'));
run(`globalThis.remote=G.map.rooms.find(r=>r.id!==room.id);globalThis.rp=randWalkIn(remote);cop.x=rp.x;cop.y=rp.y;cop.state='idle';cop.atk=null;thinkCombine(cop);`);assert.ok(run('cop.dest&&roomOfUnit(cop.dest)===room.id'));
run('enemy.gone=true');assert.equal(run('cbCoreIntruder()'),null);
run(`FAC_SEL=new Set(['T','S','cb']);G.cfg.invincibility=false;startGame({size:'s'});`);assert.equal(run('countKey("zombie")'),14);assert.equal(run('countKey("scp939")'),14);assert.equal(run('G.cfg.invincibility'),false);
run('for(let i=0;i<450;i++)stepSim(1/30)');assert.ok(run('G.time>14.9'));assert.ok(run('G.units.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.y)&&Number.isFinite(u.hp))'));
console.log('Defense/settings passed: timed immunity ON/OFF, exact-overlap separation, room invasion priority, distinct formation points, increased spawns, setting persistence and simulation.');
