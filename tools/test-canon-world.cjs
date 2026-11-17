const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);
run(`G.map=genMansion(120,84,74538);G.map.walk.fill(1);G.map.propGrid.fill(0);PF.init();G.cfg.invincibility=false;G.facOff={};G.time=100;G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,inf:0,conv:0};
function resetCanon(){G.units=[];G.corpses=[];G.projs=[];fiveInitRules();}
function mk(k,x=600,y=600){return spawnUnit(k,x,y,{force:true});}
resetCanon();globalThis.dupe=mk('dr_dupe_hotel');globalThis.fake=dupe.canonObject;globalThis.h=mk('human',fake.x,fake.y);h.hp=h.mhp=1000;h.inventory={key:2};
fiveFire(dupe,dupe.atkList[0],{tgt:h});canonWorldUpdate(.1);`);
assert.equal(run('h.hp'),1000);assert.equal(run('fiveCanUse(dupe,dupe.atkList[0],h)'),false);
assert.equal(run(`canonInteract(h,fake,'unlock')`),true);assert.equal(run('h.hp'),960);assert.equal(run('h.inventory.key'),2);assert.equal(run('fake.numberBlurred'),true);
assert.equal(run(`canonInteract(h,fake)`),false);assert.equal(run('h.hp'),960);
run(`resetCanon();G.canonWorld.containers=[{kind:'container',id:'testbox',x:600,y:600,opened:false}];globalThis.tim=mk('dr_timothy');globalThis.h=mk('human',600);h.hp=h.mhp=1000;globalThis.box=tim.canonObject;fiveFire(tim,tim.atkList[0],{tgt:h});canonWorldUpdate(.1);`);
assert.equal(run('h.hp'),1000);assert.equal(run('canonInteract(h,box)'),true);assert.equal(run('h.hp'),995);assert.equal(run('canonInteract(h,box)'),false);
run(`resetCanon();G.canonWorld.containers=[{kind:'container',id:'testbox',x:600,y:600,opened:false}];globalThis.tim=mk('dr_timothy');globalThis.h=mk('human',600);h.hp=3;canonInteract(h,tim.canonObject);`);assert.equal(run('h.hp'),1);assert.equal(run('h.dead'),false);
run(`resetCanon();globalThis.sn=mk('dr_snare');globalThis.h=mk('human',700);h.hp=h.mhp=1000;fiveFire(sn,sn.atkList[0],{tgt:h});canonWorldUpdate(.1);`);assert.equal(run('h.hp'),1000);
run(`h.x=600;canonWorldUpdate(.1);canonWorldUpdate(.1);`);assert.equal(run('h.hp'),980);assert.ok(run('h.fiveStopUntil>G.time'));
run(`h.x=700;canonWorldUpdate(.1);h.x=600;h.hp=4;canonWorldUpdate(.1);`);assert.equal(run('h.hp'),1);
run(`resetCanon();globalThis.th=mk('th_juliette_abdominal_maw');globalThis.h=mk('human',620);makeCorpse(h);h.dead=h.gone=true;globalThis.c=G.corpses[0];canonCorpseThink(th);`);
assert.ok(run('th.canonAssimilating'));assert.equal(run('effSpeed(th)'),0);
run(`th.x=900;G.time+=5;canonWorldUpdate(.1);`);assert.equal(run('th.canonAssimilating'),null);assert.equal(run('G.corpses.length'),1);
run(`th.x=600;canonCorpseThink(th);th.lastHitT=G.time;G.time+=5;canonWorldUpdate(.1);`);assert.equal(run('th.canonAssimilating'),null);assert.equal(run('G.corpses.length'),1);
run(`canonCorpseThink(th);G.time+=4.1;canonWorldUpdate(.1);`);assert.equal(run('G.corpses.length'),0);assert.equal(run(`G.units.filter(u=>!u.gone&&u.fac==='th'&&u.key==='human').length`),1);assert.equal(run('G.stats.th.conv'),1);
run(`resetCanon();globalThis.h=mk('human',620);killUnit(null,h,{});globalThis.c=G.corpses.find(c=>c.key==='human');`);assert.equal(run('canonViableCorpse(c)'),true);
run(`c.canonViable=false;`);assert.equal(run('canonViableCorpse(c)'),false);run(`c.canonViable=true;c.canonSterile=true;`);assert.equal(run('canonViableCorpse(c)'),false);
run(`resetCanon();globalThis.h=mk('human',620);killUnit(null,h,{fire:true});globalThis.c=G.corpses.find(c=>c.key==='human');`);assert.equal(run('canonViableCorpse(c)'),true);
run(`resetCanon();globalThis.h=mk('human',620);killUnit(null,h,{sterile:true});globalThis.c=G.corpses.find(c=>c.key==='human');`);assert.equal(run('canonViableCorpse(c)'),false);
run(`resetCanon();globalThis.g=mk('eg_coal');makeCorpse(g);`);assert.equal(run('canonViableCorpse(G.corpses[0])'),false);
// Only a single claimant can convert the same physical corpse.
run(`resetCanon();globalThis.a=mk('th_juliette_abdominal_maw');globalThis.b=mk('th_carter_human_imitation');globalThis.h=mk('human',620);makeCorpse(h);h.gone=h.dead=true;canonCorpseThink(a);canonCorpseThink(b);G.time+=4.1;canonWorldUpdate(.1);`);assert.equal(run(`G.units.filter(u=>!u.gone&&u.fac==='th'&&u.key==='human').length`),1);
run(`fiveInitRules();`);assert.equal(run('G.canonWorld.events.length'),0);assert.equal(run('G.canonWorld.doors.some(d=>d.fake)'),false);
console.log('Canon-world regression passed: event-only Dupe/Timothy, preserved keys, nonlethal damage, Snare entry edges, contact corpse assimilation/interruption/single claim, biological metadata, partial fire vs explicit sterilization, restart reset.');

run(`resetCanon();G.map.walk.fill(1);G.map.propGrid.fill(0);G.map.props=[];globalThis.v=mk('dm_vagary_doom_3');globalThis.h=mk('human',780);h.hp=h.mhp=1000;globalThis.tele=v.atkList.find(d=>d.fiveMove==='telekinesis');fiveFire(v,tele,{tgt:h});`);
assert.equal(run('h.hp'),1000);assert.equal(run('fiveCanUse(v,tele,h)'),false);
run(`globalThis.prop={type:'crate',tx:24,ty:21,tw:1,th:1,x:24.5*TILE,y:21.5*TILE};G.map.props=[prop];G.map.propGrid[21*G.map.w+24]=1;G.map.walk[21*G.map.w+24]=0;`);
assert.equal(run('fiveCanUse(v,tele,h)'),true);
run(`fiveFire(v,tele,{tgt:h});`);assert.equal(run('G.canonWorld.throws.length'),1);assert.equal(run('G.map.walk[21*G.map.w+24]'),1);assert.equal(run('prop.canonAirborne'),true);assert.equal(run('h.hp'),1000);
run(`for(let i=0;i<40;i++)canonWorldUpdate(.02);`);assert.equal(run('h.hp'),988);assert.equal(run('G.canonWorld.throws.length'),0);assert.equal(run('prop.canonAirborne'),false);
console.log('Vagary physical-object regression passed: no object means no throw, real prop pickup frees collision, delayed swept collision and single impact.');
