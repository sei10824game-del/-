const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);
run(`G.units=[];G.facOff={};G.time=0;G.map=genMansion(120,84,74538);G.map.walk.fill(1);G.map.propGrid.fill(0);PF.init();for(let y=5;y<=30;y++)G.map.walk[y*G.map.w+20]=0;globalThis.u=spawnUnit('cbMetro',18.5*TILE,15.5*TILE,{force:true});globalThis.goal={x:22.5*TILE,y:15.5*TILE};setDest(u,goal.x,goal.y,true);`);
assert.ok(run('u.path&&u.path.length>1'));
run(`globalThis.invalid=0;for(let i=0;i<900;i++){G.time+=1/30;if(u.path&&u.pi<u.path.length)followPath(u,130,1/30);else directMove(u,goal.x,goal.y,130,1/30);if(!bodyClear(u.x,u.y,navigationRadius(u)))invalid++;}`);
assert.equal(run('invalid'),0);assert.ok(run('dist(u.x,u.y,goal.x,goal.y)<4'));
// Force an initially stale straight route to the wall: no target change is required for recovery.
run(`u.x=18.5*TILE;u.y=15.5*TILE;u.path=null;u.dest={...goal};u.navStuck=0;u.navRetryAt=0;for(let i=0;i<900;i++){G.time+=1/30;if(u.path&&u.pi<u.path.length)followPath(u,130,1/30);else directMove(u,goal.x,goal.y,130,1/30);}`);
assert.ok(run('dist(u.x,u.y,goal.x,goal.y)<4'));
// Swept movement must not jump through a thin wall even with a large impulse.
run(`u.x=18.5*TILE;u.y=15.5*TILE;tryMove(u,8*TILE,0);`);assert.ok(run('u.x<20*TILE'));assert.ok(run('bodyClear(u.x,u.y,navigationRadius(u))'));
run(`globalThis.heavy=AT({anim:'heavy',windup:1,active:.2,rec:1}),light=AT({anim:'jab',windup:.15,active:.12,rec:.25});globalThis.hf=detailedAttackFrames(heavy);`);
assert.equal(run('hf.length'),21);assert.notEqual(run('attackVisualPhase(heavy,.5)'),run('attackVisualPhase(light,.075)'));
assert.equal(run('attackVisualPhase(heavy,heavy.windup)'),.45);assert.ok(Math.abs(run('attackVisualPhase(heavy,heavy.windup+heavy.active)')-.62)<1e-8);
assert.ok(run('hf[5].crouch>detailedAttackFrames(light)[5].crouch'));assert.ok(run('hf.every(f=>Number.isFinite(f.lean)&&Number.isFinite(f.headP))'));
console.log('Wall/animation passed: thin-wall detour, stale-route automatic recovery, clearance throughout route, no impulse tunneling, 21 keys, heavy/light timing and unchanged impact boundaries.');
