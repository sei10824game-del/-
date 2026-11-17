// Optional real raster smoke test: NODE_PATH=<@napi-rs/canvas install>/node_modules
const assert=require('node:assert/strict');const{createCanvas}=require('@napi-rs/canvas');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);const cv=createCanvas(360,360),ctx=cv.getContext('2d');sandbox.rasterCtx=ctx;
run(`ctx=rasterCtx;G.units=[];G.map=genMansion(120,84,74538);G.facOff={};G.time=20;G.quality='high';fiveInitRules();globalThis.rendered=0;
for(const r of FIVE_TYPES){const u=spawnUnit(r.key,600,600,{force:true});if(u.canonTrap)continue;
 u.fiveShield=0;u.fiveHidden=false;u.sizeMul=1;
 for(const facing of [0,Math.PI])for(const attacking of [false,true]){
  ctx.resetTransform();ctx.clearRect(0,0,360,360);ctx.translate(180-u.x,250-u.y*SQ);u.faceA=facing;u.gait=.8;u.moveSpd=70;
  u.state=attacking&&u.atkList.length?'attack':'move';u.atk=attacking&&u.atkList.length?{def:u.atkList[0],t:u.atkList[0].windup*.7,tgt:null}:null;
  drawFiveUnit(u,poseFor(u));
  const pixels=ctx.getImageData(0,0,360,360).data;let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i])visible++;
  if(visible<10)throw Error('Blank real-canvas render '+u.key);rendered++;
 }u.gone=true;
}`);assert.ok(run('rendered')>1500);
console.log(`Real raster passed: ${run('rendered')} left/right, walk/attack new-faction renders; no blank bodies or canvas exceptions. Not a browser/perceptual quality certification.`);
run(`globalThis.extraRendered=0;
for(const key of [...EXE_ROSTERS.lx,...EXE_ROSTERS.sx,'guardian','elderG','cbTurret','cc_cbTurret','cbCore','enderMite','sirenHead','porterHub','mcHoneyBee']){
 G.units=[];const u=spawnUnit(key,600,600,{force:true});if(!u)throw Error('Missing detailed model '+key);u.sizeMul=1;
 for(const facing of [0,Math.PI]){
  ctx.resetTransform();ctx.clearRect(0,0,360,360);ctx.translate(180,300);ctx.scale(.65,.65);ctx.translate(-u.x,-u.y*SQ);u.faceA=facing;u.dir=facing===0?-1:1;u.state='move';u.atk=null;u.moveSpd=60;u.gait=.8;drawUnit(u);
  let visible=0;const pixels=ctx.getImageData(0,0,360,360).data;for(let i=3;i<pixels.length;i+=4)if(pixels[i])visible++;
  if(visible<4)throw Error('Blank extra model '+key);extraRendered++;
 }
}
if(Object.keys(DRAW_ERRS).length)throw Error(JSON.stringify(DRAW_ERRS));`);
console.log(`Real raster extensions passed: ${run('extraRendered')} EXE/guardian/machine/mite/siren/porter/bee profiles, including stale u.dir opposite faceA.`);
run(`ctx.resetTransform();ctx.clearRect(0,0,360,360);G.doomNests=[{id:1,x:100,y:210/SQ,bodies:1,active:false,gone:false},{id:2,x:250,y:210/SQ,bodies:3,active:true,gone:false}];doomDrawWorld();let nestPixels=0;const nestImage=ctx.getImageData(0,0,360,360).data;for(let i=3;i<nestImage.length;i+=4)if(nestImage[i])nestPixels++;if(nestPixels<500)throw Error('Blank nest geometry');`);
console.log('Real raster environment passed: building and open Gore Nest geometry/portal.');
