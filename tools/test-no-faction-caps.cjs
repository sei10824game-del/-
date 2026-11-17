const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);
run(`G.units=[];G.corpses=[];G.items=[];G.facOff={};G.claimed=[];G.time=0;G.cfg.invincibility=false;G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,conv:0};G.map=genMansion(120,84,74538);PF.init();globalThis.p=randWalkIn(G.map.rooms[0]);globalThis.checked=[];
for(const fac of FACTION_DEFS.map(f=>f.f)){
 const entry=Object.entries(SP).find(([k,s])=>s.fac===fac&&!s.unique&&!s.exUnique&&!s.cbMajor&&!['cbCore','anohito','mikeTyson'].includes(k));if(!entry)continue;
 G.units=[];const k=entry[0];for(let i=0;i<110;i++){if(!spawnUnit(k,p.x,p.y))throw Error('Population ceiling '+fac+'/'+k+'/'+i);}checked.push(fac);
}
`);
assert.ok(run('checked.length>25'));
// High-count infection, delayed hatching/growth, and recurring production are not admission-capped.
run(`G.units=[];G.claimed=[];spawnCombineFactions();for(let i=0;i<85;i++)spawnUnit('cbMetro',p.x,p.y);updateCbFactory();globalThis.n=countFac('cb');for(let i=0;i<40;i++){G.time+=12;updateCbFactory();}`);
assert.equal(run('countFac("cb")'),run('n+40'));
run(`globalThis.hero=G.units.find(u=>u.sp.cbMajor);`);assert.equal(run('spawnUnit(hero.key,p.x,p.y,{force:true})'),null);
run(`G.units=[];for(let i=0;i<80;i++)spawnUnit('miniCreeper',p.x,p.y);globalThis.child=G.units[0];child.age=36;mwUpdate(.1);finishTransform(child);`);assert.equal(run('countFac("cp")'),80);
run(`G.units=[];globalThis.flKey=Object.keys(SP).find(k=>SP[k].fac==='fl'&&!SP[k].unique);for(let i=0;i<90;i++)spawnUnit(flKey,p.x,p.y);`);
assert.equal(run('countFac("fl")'),90);assert.equal(run('xCanSpawn("fl")'),true);assert.equal(run('xCap("fl")'),Infinity);
run(`G.facOff.fl=1;`);assert.equal(run('xCanSpawn("fl")'),false);
console.log('No faction caps passed: '+run('checked.length')+' repeatable faction rosters beyond 100, high-count factory production, growth, disabled factions and hero uniqueness.');
