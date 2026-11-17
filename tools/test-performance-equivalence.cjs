const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const reference=require('./performance-reference.cjs');const run=s=>vm.runInContext('{'+s+'}',sandbox);for(const [name,source]of Object.entries(reference))vm.runInContext(source.replace('function '+name+'(','function reference_'+name+'('),sandbox);
run(`let seed=38821;globalThis.perfRandom=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};G.map=genMansion(48,40,74538);PF.init();G.units=[];G.facOff={};G.cfg.invincibility=false;G.cfg.sound=false;Sfx.on=false;G.time=100;G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,inf:0,conv:0};
for(let map=0;map<8;map++){
 for(let i=0;i<G.map.walk.length;i++)G.map.walk[i]=perfRandom()<.11?0:1;
 for(let i=0;i<1500;i++){
  const point=()=>{const t=Math.floor(perfRandom()*46)+1;return t*TILE+[0,.00000001,TILE*.5,TILE-.00000001][i%4];};
  const x=point(),y=point()*.8,tx=point(),ty=point()*.8,r=[undefined,null,0,1,3,3.01,5.58,TILE*.42,TILE*.5,TILE*.5+.01,28,70][i%12];
  if(losWalk(x,y,tx,ty,r)!==reference_losWalk(x,y,tx,ty,r))throw Error('LOS changed '+JSON.stringify({x,y,tx,ty,r}));
 }
}
G.map.walk.fill(1);const x=5*TILE+.5*TILE,y=8*TILE+.5*TILE,tx=12*TILE+.5*TILE;
if(!losWalk(x,y,tx,y,1))throw Error('open corridor');G.map.walk[8*G.map.w+9]=0;if(losWalk(x,y,tx,y,1))throw Error('same-time wall edit cached');G.map.walk[8*G.map.w+9]=1;if(!losWalk(x,y,tx,y,1))throw Error('same-time broken wall cached');
for(let map=0;map<12;map++){
 for(let i=0;i<G.map.walk.length;i++)G.map.walk[i]=perfRandom()<.18?0:1;
 for(let i=0;i<10;i++){
  const x=(1+Math.floor(perfRandom()*45)+.5)*TILE,y=(1+Math.floor(perfRandom()*36)+.5)*TILE,tx=(1+Math.floor(perfRandom()*45)+.5)*TILE,ty=(1+Math.floor(perfRandom()*36)+.5)*TILE,r=[1,9,14,50,500][i%5];
  const a=reference_findPath(x,y,tx,ty,r),b=findPath(x,y,tx,ty,r);if(JSON.stringify(a)!==JSON.stringify(b))throw Error('route or reachability changed '+JSON.stringify({map,i,r,a,b}));
 }
}
`);
run(`G.map=genMansion(120,84,74538);PF.init();G.map.walk.fill(1);G.map.propGrid.fill(0);globalThis.performanceLosCounts=[];
function perfShotFixture(){G.units=[];G.nextId=1;G.slayer={shots:[],fields:[],pickups:[]};G.projs=[];G.corpses=[];G.map.walk.fill(1);const u=spawnUnit('sl_doom',600,700,{force:true}),t=spawnUnit('human',900,700,{force:true});u.faceA=0;u.slAmmo.bullet=u.slAmmo.shell=100000;t.hp=t.mhp=1000000;
 for(let i=0;i<80;i++){const v=spawnUnit(i%7===0?'sl_2016':'zombie',630+(i%20)*18,610+Math.floor(i/20)*50,{force:true});if(v)v.hp=v.mhp=1000000;}
 for(let i=0;i<500;i++){const v=spawnUnit('zombie',1900+i%80,1700+Math.floor(i/80)*25,{force:true});v.hp=v.mhp=1000000;}
 return {u,t};}
const savedSlHit=slHit,savedLos=losWalk;
for(const kind of ['hitscan','rail','beam','holy'])for(const count of [1,7,20])for(const spread of [0,.055,-.055]){
 const histories=[],calls=[];
 for(const old of [true,false]){const {u,t}=perfShotFixture();const d={...slDef('pistol','classic'),slKind:kind,slCount:count,slSpread:spread};let n=0,hit=[];losWalk=(...args)=>{n++;return savedLos(...args);};slHit=(u,t,d)=>{hit.push([t.id,d.dmg]);return true;};(old?reference_slFire:slFire)(u,d,{tgt:t});histories.push(JSON.stringify([hit,u.slAmmo.bullet]));calls.push(n);}
 if(histories[0]!==histories[1])throw Error('pellet order/nearest/rail/aggregate damage changed '+JSON.stringify({kind,count,spread,histories}));if(calls[1]>582)throw Error('repeated candidate LOS');
 if(kind==='hitscan'&&count===20&&spread===.055){performanceLosCounts=calls;if(calls[0]<calls[1]*50)throw Error('insufficient LOS reduction '+calls);}
}
slHit=savedSlHit;losWalk=savedLos;
`);
// Old and new projectile code see an identical mixed local/far, tall and friendly crowd.
run(`const savedDamage=dealDamage,savedHostile=hostileTo;globalThis.perfProjectileCalls=[];
for(const weapon of ['plasma','needler','disc']){
 const histories=[],calls=[];for(const old of [true,false]){const {u,t}=perfShotFixture();t.x=700;t.y=700;const p={x:650,y:700,z:24,vx:220,vy:0,t:.2,life:3,weapon,src:u,team:u.fac,dmg:10,hits:new Set(),returning:weapon==='disc'};let hit=[],n=0;dealDamage=(u,t,d)=>hit.push([t.id,d]);hostileTo=(...args)=>{n++;return savedHostile(...args);};const result=(old?reference_fiveProjectileStep:fiveProjectileStep)(p,.12);histories.push(JSON.stringify([hit,result,p.x,p.y,[...p.hits]]));calls.push(n);}
 if(histories[0]!==histories[1])throw Error('projectile hit/order/position changed '+weapon);if(calls[1]>calls[0])throw Error('projectile broad rejection made more calls');perfProjectileCalls.push({weapon,before:calls[0],after:calls[1]});
}
dealDamage=savedDamage;hostileTo=savedHostile;
`);
console.log('Performance equivalence passed: 12,000 LOS rays including narrow/wide radii and tile edges; immediate wall edits; 120 exact A* route/reachability comparisons; 36 mixed pellet/rail/beam/holy discharges with stable target order and damage; projectile collision equivalence. LOS call counts:',vm.runInContext('performanceLosCounts',sandbox),'Projectile hostility checks:',vm.runInContext('perfProjectileCalls',sandbox));
