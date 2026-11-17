// Native pixel differences verify pose changes, not original-work fidelity.
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const{createCanvas}=require('@napi-rs/canvas');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);
const canvas=createCanvas(1380,1560),ctx=canvas.getContext('2d');sandbox.rasterCtx=ctx;
run(`ctx=rasterCtx;G.units=[];G.facOff={};G.map=genMansion(120,84,74538);G.map.walk.fill(1);G.quality='high';G.lod=false;G.time=100;G.taken=null;globalThis.visualSnapshots=[];
const cases=[['tkShadowbeast',null],['tkEye','shot'],['tkWizard','thralls'],['tkCaptain',null],['tkOgre','surge'],['skWarden',null]];
ctx.fillStyle='#27303d';ctx.fillRect(0,0,1380,1560);ctx.font='14px sans-serif';ctx.fillStyle='#ecf5ff';['Idle','Walk','Anticipation','Impact','Recovery'].forEach((n,i)=>ctx.fillText(n,190+i*238,20));
cases.forEach(([key,p],row)=>{
 G.units=[];const u=spawnUnit(key,600,600,{force:true});u.sizeMul=1;u.faceA=0;u.tkRevealUntil=G.time+5;
 const d=key==='skWarden'?u.atkList.find(d=>d.exAction==='skSonic'):key==='tkCaptain'?u.atkList.find(d=>d.anim==='tkCrossSlash'):p?u.atkList.find(d=>d.tkPower===p):u.atkList[0];
 ctx.fillStyle='#ecf5ff';ctx.fillText(key,8,row*230+48);
 for(let i=0;i<5;i++){
  u.state=i<2?(i===1?'move':'idle'):'attack';u.moveSpd=i===1?80:0;u.gait=i===1?1.5:0;u.atk=i<2?null:{def:d,t:i===2?d.windup*.85:i===3?d.windup+d.active*.5:d.windup+d.active+d.rec*.75,tgt:null};
  const before=JSON.stringify([G.time,u.x,u.y,u.hp,u.state,u.atk?.t]);ctx.save();ctx.beginPath();ctx.rect(180+i*238,row*230+30,238,220);ctx.clip();ctx.translate(295+i*238,row*230+230);ctx.scale(1.3,1.3);ctx.translate(-u.x,-u.y*SQ);drawUnit(u);ctx.restore();
  if(before!==JSON.stringify([G.time,u.x,u.y,u.hp,u.state,u.atk?.t]))throw Error('drawing changed combat state '+key);
 }
});
// Explicit coverage of all new field/projectile render paths at nonzero alpha.
G.units=[];G.taken={fields:[],bolts:[]};const source=spawnUnit('tkGoblin',600,600,{force:true});
for(const [i,kind] of ['bubble','flame','stasis'].entries())G.taken.fields.push({kind,x:600+i*238,y:600,r:65,until:G.time+4,src:source});
G.taken.bolts.push({at:G.time,dead:false,x:1314,y:600,z:25,kind:'dark',element:'void',vx:230,vy:0});
const target=spawnUnit('tkOgre',1552,600,{force:true});source.x=1455;source.tkTetherTarget=target;source.moveSpd=0;
ctx.save();ctx.translate(295-600,1500-600*SQ);drawTakenEffects();ctx.restore();
if(Object.keys(DRAW_ERRS).length)throw Error(JSON.stringify(DRAW_ERRS));`);
const hash=(x,y,w,h)=>crypto.createHash('sha256').update(ctx.getImageData(x,y,w,h).data).digest('hex');
for(let row=0;row<6;row++){
 const poses=Array.from({length:5},(_,i)=>hash(180+i*238,row*230+30,238,200));
 if(row!==1)assert.notEqual(poses[0],poses[1],`row ${row}: walking must differ from idle`);
 else assert.equal(poses[0],poses[1],"stationary Eye has no invented walking animation");
 assert.notEqual(poses[0],poses[2],`row ${row}: anticipation must differ from idle`);
 assert.notEqual(poses[2],poses[3],`row ${row}: impact must differ from anticipation`);
 assert.notEqual(poses[3],poses[4],`row ${row}: recovery must differ from impact`);
}
fs.writeFileSync('/home/user/visual-polish-poses.png',canvas.toBuffer('image/png'));
console.log('Visual polish passed: six models × five poses, native pixel differences for walk/anticipation/impact/recovery, no combat-state mutation, all Taken effects, 0 drawing errors. /home/user/visual-polish-poses.png');
