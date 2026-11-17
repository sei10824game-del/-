// Native raster evidence; run with the optional @napi-rs/canvas dependency.
const assert=require('node:assert/strict'),fs=require('node:fs');const{createCanvas}=require('@napi-rs/canvas');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);
const cv=createCanvas(1400,1750),ctx=cv.getContext('2d');sandbox.rasterCtx=ctx;
run(`ctx=rasterCtx;G.units=[];G.facOff={};G.map=genMansion(120,84,74538);G.quality='high';G.lod=false;G.time=10;globalThis.acroDraws=0;
const samples=[['left',Math.PI,null,0],['right',0,null,0],['vault windup',0,'vault',-.4],['vault tuck',0,'vault',.24],['vault strike',0,'vault',.56],['wheel left',Math.PI,'wheel',.3],['wheel right',0,'wheel',.66]];
ctx.fillStyle='#171e27';ctx.fillRect(0,0,1400,1750);
ACROBAT_KEYS.forEach((key,row)=>{samples.forEach(([label,face,kind,phase],col)=>{
 G.units=[];const u=spawnUnit(key,600,600,{force:true});u.faceA=face;u.sizeMul=1;u.state=kind?'attack':'idle';u.atk=null;
 if(kind){const d=u.atkList.find(d=>d.acroKind===kind);u.atk={def:d,t:d.windup+d.active*phase,tgt:null};u.z=phase>0?24:0;}
 const cx=col*200+100,cy=row*250+218;ctx.save();ctx.beginPath();ctx.rect(col*200,row*250,200,250);ctx.clip();ctx.translate(cx,cy);ctx.scale(.78,.78);ctx.translate(-u.x,-u.y*SQ);drawUnit(u);ctx.restore();
 ctx.fillStyle='#dce3ec';ctx.font='12px sans-serif';ctx.fillText(key,col*200+8,row*250+17);ctx.fillStyle='#8fa3b9';ctx.fillText(label,col*200+8,row*250+34);
 acroDraws++;
 });});if(Object.keys(DRAW_ERRS).length)throw Error(JSON.stringify(DRAW_ERRS));`);
assert.equal(run('acroDraws'),49);const target=process.env.ACROBAT_IMAGE||'/home/user/acrobat-check.png';fs.writeFileSync(target,cv.toBuffer('image/png'));
console.log('Native acrobat raster: 49 idle/left/right/windup/tuck/strike/cartwheel frames; review '+target+' manually. Not a certification of all character artwork.');
