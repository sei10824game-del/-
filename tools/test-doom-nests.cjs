const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);
run(`G.map=genMansion(120,84,74538);G.map.walk.fill(1);G.map.propGrid.fill(0);PF.init();G.units=[];G.corpses=[];G.facOff={};G.cfg.invincibility=false;G.time=100;G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,inf:0,conv:0};fiveInitRules();
function mk(k,x=600,y=600){return spawnUnit(k,x,y,{force:true});}
function body(x=620){const h=mk('human',x);makeCorpse(h);h.dead=h.gone=true;return G.corpses[G.corpses.length-1];}
globalThis.u=mk('dm_possessed_scientist');globalThis.c=body();doomRitualThink(u);`);
assert.equal(run('c.hauled===u'),true);assert.equal(run('G.doomNests.length'),1);
run(`globalThis.n=G.doomNests[0];u.x=n.x;u.y=n.y;doomRitualThink(u);u.lastHitT=G.time;doomWorldUpdate(.1);`);assert.equal(run('u.doomBody'),null);assert.equal(run('G.corpses.includes(c)'),true);assert.equal(run('n.bodies'),0);
// Complete actual transport/ritual channels, consuming exactly three distinct corpses.
run(`for(let i=0;i<3;i++){if(i)body(u.x+10);const c=G.corpses.find(c=>!c.hauled);for(let step=0;step<80&&dist(u.x,u.y,c.x,c.y)>u.r+16;step++)directMove(u,c.x,c.y,90,.02);doomRitualThink(u);for(let step=0;step<80&&dist(u.x,u.y,n.x,n.y)>u.r+16;step++)directMove(u,n.x,n.y,90,.02);doomRitualThink(u);G.time+=3.1;doomWorldUpdate(.1);}`);
assert.equal(run('n.bodies'),3);assert.equal(run('n.active'),true);assert.equal(run('G.corpses.length'),0);assert.equal(run('G.doomNestWaves.length'),1);
run(`G.time+=1.6;doomWorldUpdate(.1);`);assert.equal(run('G.units.filter(u=>u.doomArrival===n.id).length'),3);assert.equal(run('G.stats.dm.born'),3);assert.ok(run('G.units.filter(u=>u.doomArrival).every(u=>DOOM_NEST_POOL.includes(u.key))'));
run(`globalThis.enemy=mk('cbMetro',n.x+10,n.y);G.time+=9;dealDamage(enemy,u,1,{});`);assert.equal(run('G.doomNestWaves.length'),1);run(`dealDamage(enemy,u,1,{});`);assert.equal(run('G.doomNestWaves.length'),1,'one pending wave per nest, not duplicate frame alarms');
run(`doomStartTear(enemy,n);enemy.lastHitT=G.time;doomWorldUpdate(.1);`);assert.equal(run('enemy.doomTearing'),null);assert.equal(run('n.gone'),false);
run(`doomStartTear(enemy,n);G.time+=1.3;doomWorldUpdate(.1);`);assert.equal(run('n.gone'),true);assert.equal(run('enemy.doomTearing'),null);
run(`G.time+=2;doomWorldUpdate(.1);globalThis.spawned=G.units.filter(u=>u.doomArrival).length;G.time+=100;doomWorldUpdate(.1);`);assert.equal(run('G.units.filter(u=>u.doomArrival).length'),run('spawned'),'destroyed nests cannot restart passive spawning');
run(`fiveInitRules();`);assert.equal(run('G.doomNests.length'),0);assert.equal(run('G.doomNestWaves.length'),0);
run(`G.units=[];G.corpses=[];globalThis.u=mk('dm_possessed_scientist');globalThis.c=body();c.canonSterile=true;doomRitualThink(u);`);assert.equal(run('u.doomBody'),undefined);
console.log('DOOM nest lifecycle passed: physical corpse pickup/transport, interrupted rituals, three-body consumption, portal arrivals, damage alarms, interrupted/removable heart, no revival of destroyed nest, reset and sterile exclusion.');
