const assert=require('node:assert/strict');
const {vm,sandbox}=require('./audit-creatures.cjs');
const run=s=>vm.runInContext(s,sandbox);
sandbox.innerWidth=1280;sandbox.innerHeight=720;
run('G.cfg.invincibility=false');
run(`G.cfg.sound=false;Sfx.on=false;G.units=[];G.corpses=[];G.items=[];G.facOff={};G.claimed=[];G.time=0;G.nextId=1;
G.stats={};for(const d of FACTION_DEFS)G.stats[d.f]={kills:0,born:0,lost:0,inf:0,conv:0};
G.map=genMansion(108,76,74538);PF.init();spawnCombineFactions();`);
assert.equal(run('CB_ROSTER.length'),30);
assert.equal(run('CB_HEROES.length'),7);
assert.ok(run('SP.cbAiden2.hp>SP.cbElite.hp && SP.cbAiden2.atks!==SP.cbElite.atks && !SP.cbElite.atks.some(a=>a.cbAction==="xen")'));
assert.ok(run('SP.cbAiden1.atks!==SP.cbMetro.atks'));
assert.ok(run('CB_ROSTER.every(k=>countKey(k)===1)'));
assert.ok(run('cbCoreAlive()'));
assert.ok(run('G.units.filter(u=>u.fac==="cb").every(u=>roomOfUnit(u)===G.city17.room.id)'));
assert.ok(run('CB_HEROES.every(k=>spawnUnit(k,G.city17.x,G.city17.y,{force:true})===null)'));
assert.equal(run('hostileTo(G.units.find(u=>u.fac==="cb"),G.units.find(u=>u.fac==="cc"))'),true);
assert.equal(run('hostileTo(G.units.find(u=>u.key==="cbMetro"),G.units.find(u=>u.key==="cbAR2"))'),false);
// Every combatant, including synth/machine entries, is susceptible as requested; core is not.
assert.ok(run('CB_ROSTER.every(k=>isInfectHost(G.units.find(u=>u.key===k)))'));
assert.equal(run('isInfectHost(G.city17.core)'),false);
run(`globalThis.cop=G.units.find(u=>u.key==='cbMetro');globalThis.person=spawnUnit('human',cop.x,cop.y,{force:true});`);
assert.equal(run('cbCapture(cop,person)'),true);
assert.equal(run('person.state'),'cbPrisoner');
assert.equal(run('hostileTo(cop,person)'),false);
run('cop.x=G.city17.x;cop.y=G.city17.y;person.x=cop.x;person.y=cop.y;cbUpdatePrisoner(person,4.1)');
assert.equal(run('person.state'),'transform');
assert.ok(run('["cbMetro","cbSMG","cbAR2","cbShotgun","cbGrunt"].includes(person.transTo)'));
assert.equal(run('G.city17.converted'),1);
assert.equal(run('cop.cbPrisoner'),null);
run('finishTransform(person)');
assert.ok(run('person.gone && G.units.some(u=>u.id!==cop.id&&u.fac==="cb"&&u.state==="spawn")'));
// Interrupt/death of escort, infection of prisoner and core destruction all release reservations.
run(`globalThis.p2=spawnUnit('human',cop.x,cop.y,{force:true});cbCapture(cop,p2);interrupt(cop);`);
assert.equal(run('p2.cbCaptor'),null);
assert.equal(run('p2.state'),'idle');
run('cbCapture(cop,p2);startTransform(cop,"zombie",{dur:1})');
assert.equal(run('p2.cbCaptor'),null);
run(`globalThis.cop2=G.units.find(u=>u.key==='cbSMG');globalThis.p3=spawnUnit('human',cop2.x,cop2.y,{force:true});cbCapture(cop2,p3);p3.inf=1.1;updateUnit(p3,.1);`);
assert.equal(run('p3.state'),'transform');
assert.equal(run('cop2.cbPrisoner'),null);
// A gel carrier's actual damage hook builds exposure; it does not infect on the first hit.
run(`globalThis.z=spawnUnit('hczombie',cop2.x,cop2.y,{force:true});z.gelCarrier=1;dealDamage(z,cop2,1,{});`);
assert.ok(run('cop2.gelExposure>0&&cop2.gelExposure<1'));
assert.equal(run('cbTryGelConvert(cop2)'),false);
run('dealDamage(z,cop2,1,{});dealDamage(z,cop2,1,{})');
assert.equal(run('cbTryGelConvert(cop2)'),true);
assert.equal(run('cop2.transTo'),'cc_cbSMG');
run('finishTransform(cop2)');
assert.ok(run('G.units.some(u=>u.key==="cc_cbSMG"&&!u.gone&&u.fac==="cc"&&u.mhp>SP.cbSMG.hp)'));
// Both Aiden versions map to the singleton Clone Cop. Pending transformations reserve it too.
run(`globalThis.aiden=G.units.find(u=>u.key==='cbAiden2');aiden.gelExposure=1;`);
assert.equal(run('cbTryGelConvert(aiden)'),true);
assert.equal(run('aiden.transTo'),'ccCloneCop');
run(`globalThis.aiden1=G.units.find(u=>u.key==='cbAiden1');aiden1.gelExposure=1;`);
assert.equal(run('cbTryGelConvert(aiden1)'),false);
run('finishTransform(aiden)');
assert.equal(run('countKey("ccCloneCop")'),1);
// Teleport must land on walkable ground; summons must be infected manhacks of the clone faction.
run(`globalThis.clone=G.units.find(u=>u.key==='ccCloneCop');clone.state='idle';clone.cbSummonAt=0;clone.cbTeleportAt=0;clone.tgt=G.units.find(u=>u.key==='cbAR2');globalThis.beforeHacks=countKey('cc_cbManhack');cbCloneAbilities(clone);`);
assert.ok(run('walkAtPx(clone.x,clone.y)'));
assert.equal(run('countKey("cc_cbManhack")'),run('beforeHacks+1'));
run('cbCloneAbilities(clone)');
assert.equal(run('countKey("cc_cbManhack")'),run('beforeHacks+1'));
// Death reconstruction is delayed, singleton-safe, and only sustained by a living core.
run(`globalThis.hero=G.units.find(u=>u.key==='cbVictor');killUnit(null,hero,{noRise:true,gib:true});updateCombine(.1);`);
assert.ok(run('G.city17.heroTimers.cbVictor>G.time'));
run('G.time+=44;updateCombine(.1)');
assert.equal(run('countKey("cbVictor")'),0);
run('G.time+=2;updateCombine(.1)');
assert.equal(run('countKey("cbVictor")'),1);
run('updateCombine(.1)');
assert.equal(run('countKey("cbVictor")'),1);
// Airborne infection and its progression use normal biological lifecycle for Combine units.
run(`globalThis.host=G.units.find(u=>u.key==='cbAR2');for(const k of ['zombie','gcommon','crunner'])spawnUnit(k,host.x,host.y,{force:true});airborneContagion();`);
assert.ok(run('host.inf>0&&host.infG>0&&host.infC>0'));
run('host.inf=1.1;updateUnit(host,.1)');
assert.equal(run('host.state'),'transform');
// Squad assignments never mix enemy factions and have at most five members.
run('cbUpdateSquads()');
assert.ok(run('G.cbSquads.length>0&&G.cbSquads.every(s=>s.members.length<=5&&s.members.every(u=>u.fac==="cb"&&u.cbSquad===s))'));
// Core destruction frees captives and disables future reconstruction and conversion.
run(`globalThis.escort=G.units.find(u=>u.key==='cbShotgun');globalThis.p4=spawnUnit('human',escort.x,escort.y,{force:true});cbCapture(escort,p4);killUnit(null,G.city17.core,{noRise:true,gib:true});killUnit(null,G.units.find(u=>u.key==='cbBec'),{gib:true,noRise:true});updateCombine(.1);G.time+=60;updateCombine(.1);`);
assert.equal(run('p4.cbCaptor'),null);
assert.equal(run('cbCoreAlive()'),false);
assert.equal(run('countKey("cbBec")'),0);
assert.equal(run('Object.keys(G.city17.heroTimers).length'),0);
// Fire each declared attack through its actual dispatcher, including custom abilities.
run(`G.units=[];G.facOff={};G.city17=null;globalThis.attackErrors=[];
for(const key of [...CB_ROSTER,'ccCloneCop']){const p=randWalkIn(G.map.rooms[0]),u=spawnUnit(key,p.x,p.y,{force:true}),t=spawnUnit('human',p.x+30,p.y,{force:true});
for(const d of u.atkList){try{fireAttack(u,d,{tgt:t,hitSet:new Set(),hitCount:0});}catch(e){attackErrors.push(key+'/'+d.n+': '+e.message);}}}`);
assert.equal(run('attackErrors.join("\\n")'),'');
// Real bootstrap, real AI/simulation with a mock DOM/Canvas, and restart with both factions disabled.
run(`FAC_SEL=new Set(['cb','cc','H']);startGame({size:'s'});`);
assert.ok(run('cbCoreAlive() && countKey("cbAiden2")===1 && G.units.some(u=>u.gelCarrier)'));
run('for(let i=0;i<300;i++)stepSim(1/30)');
assert.ok(run('G.time>9.9'));
run(`FAC_SEL=new Set(['T','X']);startGame({size:'s'});`);
assert.equal(run('G.city17'),null);
assert.equal(run('countFac("cb")+countFac("cc")'),0);
console.log('Combine tests passed: all 30 entries, singleton heroes, City 17, capture/conversion/rescue, gel, Clone Cop, clone abilities, infection, squads, resurrection, core destruction, attacks, full simulation, restart.');

// End-to-end arrest and pathfinding, not manual placement at the core.
run(`{
G.units=[];G.facOff={};G.time=0;G.nextId=1;G.stats={cb:{kills:0,born:0,lost:0},T:{inf:0},G:{inf:0},C:{inf:0}};
G.map=genMansion(108,76,4875);PF.init();const room=G.map.rooms.find(r=>r.x1-r.x0>6&&r.y1-r.y0>6)||G.map.rooms[0];const p=randWalkIn(room);const core=spawnUnit('cbCore',p.x,p.y,{force:true});G.city17={room,x:p.x,y:p.y,core,heroTimers:{},converted:0};
const q=randWalkIn(room),escort=spawnUnit('cbMetro',q.x,q.y,{force:true}),person=spawnUnit('human',q.x,q.y,{force:true});Spatial.rebuild();thinkCombine(escort);
for(let i=0;i<1800&&!person.gone;i++){G.time+=1/30;Spatial.rebuild();updateUnit(escort,1/30);updateUnit(person,1/30);}
if(!person.gone||G.city17.converted!==1)throw Error('Automatic escort failed');
drawCbDistrict(G.city17);
}`);
console.log('Automatic arrest/pathfinding/core conversion passed.');
