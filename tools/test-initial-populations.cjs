const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);
run(`G.map=genMansion(120,84,74538);G.map.walk.fill(1);G.map.propGrid.fill(0);G.time=0;G.facOff={};G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,inf:0,conv:0};
function resetPop(){G.units=[];G.corpses=[];G.projs=[];FAC_SEL=new Set(['dr','dm']);}
resetPop();spawnFiveFactions();`);
assert.equal(run('countFac("dm")'),12);assert.equal(run('countFac("dr")'),68);assert.equal(run('new Set(G.units.filter(u=>u.fac==="dm").map(u=>u.key)).size'),12);
assert.ok(run(`FIVE_ROSTERS.dr.every(k=>countKey(k)===1)`));
run(`FIVE_COUNTS.dr=9;FIVE_COUNTS.dm=0;resetPop();spawnFiveFactions();`);assert.equal(run('countFac("dm")'),0);assert.ok(run(`FIVE_ROSTERS.dr.every(k=>countKey(k)===1)`));
run(`FIVE_COUNTS.dm=220;resetPop();spawnFiveFactions();`);assert.equal(run('countFac("dm")'),220);assert.equal(run('new Set(G.units.filter(u=>u.fac==="dm").map(u=>u.key)).size'),207);
run(`for(let i=0;i<50;i++)spawnUnit('dm_imp_classic',600,600,{force:true});`);assert.equal(run('countFac("dm")'),270);
run(`FAC_SEL=new Set(['pr']);G.facOff={dr:true,dm:true};G.units=[];spawnFiveFactions();`);assert.equal(run('countFac("dr")'),0);assert.equal(run('countFac("dm")'),0);
console.log('Initial populations passed: DOOM default 12 total, unique selection up to roster size, 0 and >roster budgets, unrestricted later spawns; DOORS one of each, faction deselection.');
