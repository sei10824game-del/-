const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);sandbox.innerWidth=1280;sandbox.innerHeight=720;
run(`G.cfg.sound=false;Sfx.on=false;G.cfg.invincibility=false;G.facOff={};G.units=[];G.corpses=[];G.items=[];G.claimed=[];G.time=100;G.city17=null;G.cbSquads=[];G.map=genMansion(108,76,4875);PF.init();G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,inf:0,conv:0};
const room=G.map.rooms[0],p=randWalkIn(room);globalThis.soldiers=[];for(const key of ['cbElite','cbSMG','cbAR2','cbShotgun','cbMetro'])soldiers.push(spawnUnit(key,p.x,p.y,{force:true}));Spatial.rebuild();cbUpdateSquads();globalThis.squad=G.cbSquads[0];globalThis.leader=squad.leader;globalThis.origin={x:leader.x,y:leader.y};globalThis.initialRoom=roomOfUnit(leader);globalThis.patrolDistance=0;globalThis.exploredRooms=new Set([initialRoom]);`);
assert.equal(run('leader.key'),'cbElite');
run(`for(let i=0;i<30*35;i++){G.time+=1/30;Spatial.rebuild();if(i%30===0)cbUpdateSquads();for(const u of soldiers)updateUnit(u,1/30);patrolDistance=Math.max(patrolDistance,dist(origin.x,origin.y,leader.x,leader.y));exploredRooms.add(roomOfUnit(leader));}`);
assert.ok(run('patrolDistance>100'),'leader must actually explore, not just hold a leader flag');
assert.ok(run('exploredRooms.size>1'),'patrol must leave its initial room');
assert.ok(run('G.cbSquads[0]===squad&&squad.leader===leader'),'no periodic squad/leader reshuffle');
run(`for(const u of soldiers){u.state='idle';thinkCombine(u);}`);
assert.equal(run('leader.cbFollowing'),null);
assert.ok(run('soldiers.filter(u=>u!==leader).every(u=>u.cbFollowing===leader.id)'),'all follow edges point directly to the captain');
run(`globalThis.close=soldiers.find(u=>u!==leader);close.x=leader.x+8;close.y=leader.y;close.dest={x:1,y:1};thinkCombine(close);`);assert.equal(run('close.dest'),null,'nearby follower waits, rather than choosing its own random exploration');
run(`leader.dead=true;leader.gone=true;cbUpdateSquads();globalThis.successor=squad.leader;cbPatrolThink(successor);`);assert.ok(run('successor!==leader&&successor.cbFollowing===null&&successor.cbSquad===squad'));
run(`{const p=randWalkIn(G.map.rooms[0]);globalThis.recruit=spawnUnit('cbSMG',p.x,p.y,{force:true});cbUpdateSquads();}`);assert.ok(run('recruit.cbSquad===squad&&squad.leader===successor'));
// Only Joker immunity is added: other requested vulnerabilities remain intact.
for(const key of ['gon','killua']){
 run(`G.units=[];globalThis.u=spawnUnit('${key}',600,600,{force:true});`);
 assert.equal(run('jokerEligible(u)'),false);assert.equal(run('isInfectHost(u)'),true);
 for(const form of ['joker','jokerFan']){run(`startTransform(u,'${form}',{});`);assert.notEqual(run('u.state'),'transform');}
 run('u.jokerRate=2;updateUnit(u,.01)');assert.equal(run('u.jokerRate'),0);
 run("startTransform(u,'zombie',{})");assert.equal(run('u.state'),'transform');
}
// Real movement, airtime, damage and complete recovery for every new move.
run(`G.map.walk.fill(1);G.map.propGrid.fill(0);PF.init();globalThis.acroResults=[];
for(const key of ACROBAT_KEYS)for(const move of SP[key].atks.filter(d=>d.acroKind)){
 G.units=[];G.projs=[];const u=spawnUnit(key,600,600,{force:true}),t=spawnUnit('human',690,600,{force:true});t.hp=t.mhp=10000;t.sp={...t.sp,marked:1};Spatial.rebuild();const d=u.atkList.find(d=>d.n===move.n);if(!canUse(u,d,t))throw Error('AI eligibility '+key+' '+d.n);startAttack(u,d,t);let height=0,travel=0;
 for(let i=0;i<250&&u.atk;i++){G.time+=.01;Spatial.rebuild();updateUnit(u,.01);height=Math.max(height,u.z||0);travel=Math.max(travel,dist(600,600,u.x,u.y));drawUnit(u);}
 if(u.atk||travel<30||t.hp>=10000||(d.type==='leap'&&height<10))throw Error(JSON.stringify({key,move:d.n,travel,height,hp:t.hp,state:u.state}));acroResults.push({key,move:d.n,travel,height,damage:10000-t.hp});
}`);assert.equal(run('acroResults.length'),14);assert.equal(run('Object.keys(DRAW_ERRS).length'),0);
// Restart uses doubled population counts, unchanged queen and DOOM/DOORS sizes.
run(`FAC_SEL=new Set(['S','W','vg','dm','dr']);startGame({size:'s'});`);
assert.equal(run('countKey("scp939")'),14);assert.equal(run('countKey("wspike")'),16);assert.equal(run('countKey("wsqueen")'),1);assert.equal(run('countKey("mcVillager")'),24);assert.equal(run('countFac("dm")'),12);assert.ok(run('FIVE_TYPES.filter(r=>r.fac==="dr").every(r=>countKey(r.key)===1)'));
// Milestones must still work beyond the old hidden 12-guardian cap.
run(`for(const u of G.units.filter(villageResident))u.breedCd=100;while(G.units.filter(u=>u.fac==='vg'&&u.sp.infectionImmune).length<13)spawnUnit('ironGolem',G.village.x,G.village.y,{force:true});G.village.nextPopulation=24;G.village.tick=0;globalThis.beforeGuard=G.units.filter(u=>u.fac==='vg'&&u.sp.infectionImmune).length;updateVillage(.1);`);assert.equal(run('G.units.filter(u=>u.fac==="vg"&&u.sp.infectionImmune).length'),run('beforeGuard+1'));
console.log('Leadership/acrobat passed: real multiroom patrol, persistent captains, acyclic direct following, close waiting, succession/recruitment, selective Gon/Killua immunity, 14 moving/damaging/recovering attacks, including Danger AU teachers, increased populations, unchanged DOOM/DOORS, uncapped guardians.');
