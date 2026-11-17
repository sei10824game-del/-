const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);
run(`G.units=[];G.corpses=[];G.facOff={};G.items=[];G.claimed=[];G.time=0;G.map=genMansion(120,84,74538);G.map.walk.fill(1);G.map.propGrid.fill(0);PF.init();globalThis.p={x:600,y:600};`);
// Two same-faction columns must actually cross a one-tile corridor, not bounce.
run(`G.map.walk.fill(0);for(let x=5;x<80;x++)G.map.walk[25*G.map.w+x]=1;globalThis.laneY=25.5*TILE;globalThis.columns=[];
for(let i=0;i<16;i++){const u=spawnUnit('cbMetro',600+(i%8)*5,laneY,{force:true});u.goalX=i<8?900:350;u.faceA=i<8?0:Math.PI;u.dest={x:u.goalX,y:laneY};u.state='move';columns.push(u);}
for(let tick=0;tick<180;tick++){for(const u of columns)directMove(u,u.goalX,laneY,90,1/30);Spatial.rebuild();separateUnits(1/30);}
`);
assert.ok(run('columns.every(u=>Math.abs(u.x-u.goalX)<12)'));assert.ok(run('columns.every(u=>walkAtPx(u.x,u.y))'));
// Dense stationary friends cannot push an active walker backwards.
run(`G.units=[];G.map.walk.fill(1);globalThis.walker=spawnUnit('cbMetro',600,600,{force:true});walker.faceA=0;walker.dest={x:950,y:600};walker.state='move';for(let i=0;i<35;i++)spawnUnit('cbMetro',610+(i%7)*8,580+Math.floor(i/7)*8,{force:true});globalThis.backward=0;
for(let i=0;i<120;i++){const old=walker.x;directMove(walker,950,600,95,1/30);Spatial.rebuild();separateUnits(1/30);if(walker.x<old-.01)backward++;}`);
assert.equal(run('backward'),0);assert.ok(run('walker.x>930'));
// Idle spacing remains; fixed cores are never displaced; crowd corrections are bounded.
run(`G.units=[];globalThis.a=spawnUnit('cbMetro',600,600,{force:true});globalThis.b=spawnUnit('cbMetro',600,600,{force:true});globalThis.core=spawnUnit('cbCore',600,600,{force:true});Spatial.rebuild();separateUnits(.1);`);
assert.ok(run('dist(a.x,a.y,b.x,b.y)>.1'));assert.equal(run('core.x'),600);assert.equal(run('core.y'),600);
run(`G.units=[];globalThis.center=spawnUnit('cbMetro',600,600,{force:true});for(let i=0;i<100;i++)spawnUnit('cbMetro',600,600,{force:true});Spatial.rebuild();separateUnits(1/30);`);
assert.ok(run('dist(center.x,center.y,600,600)<=65/30+.001'));
// Facing is independent of a stale u.dir; all profiles and action phases draw cleanly.
assert.equal(run('renderFacing({faceA:0,dir:-1})'),1);assert.equal(run('renderFacing({faceA:Math.PI,dir:1})'),-1);
run(`G.units=[];for(const key of ['enderMan','mutantEnderMan','creeper','mutantCreeper','fpeAlice','lordX','sonicExe']){
 const u=spawnUnit(key,600,600,{force:true});if(!u)throw Error('Missing '+key);u.form=key==='fpeAlice'?1:0;
 for(const angle of [0,.8,Math.PI/2,Math.PI,4,Math.PI*1.5])for(const quad of [false,true])for(const gait of [0,Math.PI/2,Math.PI]){
 u.faceA=angle;u.aliceQuad=quad;u.gait=gait;u.moveSpd=120;u.state='move';drawUnit(u);
 for(const d of u.sp.atks){u.state='attack';for(const phase of [.15,.45,.75]){u.atk={def:d,t:phase*(d.windup+d.active+d.rec),tgt:null};drawUnit(u);}}u.atk=null;
 }u.gone=true;
}`);
assert.equal(run('Object.keys(DRAW_ERRS).length'),0);
console.log('Crowd/facing passed: opposing corridor columns, walker through idle crowd, bounded pushes, idle spacing, fixed core, angle-aware profiles, all walk/attack phases and quadruped Alice.');
