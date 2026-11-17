const assert=require('node:assert/strict'),fs=require('node:fs');const{createCanvas}=require('@napi-rs/canvas');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);const cv=createCanvas(1400,920),ctx=cv.getContext('2d');sandbox.rasterCtx=ctx;
run(`ctx=rasterCtx;G.units=[];G.facOff={};G.map=genMansion(120,84,74538);G.quality='high';G.lod=false;G.time=100;globalThis.newRenders=0;ctx.fillStyle='#1c242e';ctx.fillRect(0,0,1400,920);
const keys=[...SCULK_BLOCKS,'skWarden',...PM_ROSTER];
keys.forEach((key,index)=>{G.units=[];const u=spawnUnit(key,600,600,{force:true});u.sizeMul=1;u.state='idle';u.skActive=G.time+1;
 const col=index%7,row=Math.floor(index/7),cx=col*200+100,cy=row*230+205;
 for(const face of [0,Math.PI]){ctx.fillStyle='#1c242e';ctx.fillRect(col*200,row*230,200,230);u.faceA=face;ctx.save();ctx.beginPath();ctx.rect(col*200,row*230,200,230);ctx.clip();ctx.translate(cx,cy);ctx.scale(.85,.85);ctx.translate(-u.x,-u.y*SQ);drawUnit(u);ctx.restore();newRenders++;}
 ctx.fillStyle='#dde4ed';ctx.font='12px sans-serif';ctx.fillText(key,col*200+8,row*230+18);
});if(Object.keys(DRAW_ERRS).length)throw Error(JSON.stringify(DRAW_ERRS));`);
assert.equal(run('newRenders'),56);fs.writeFileSync('/home/user/sculk-piglin-models.png',cv.toBuffer('image/png'));console.log('Native new-model raster: six blocks, Warden and 21 Legends roles/structures; 56 left/right draw calls. Review /home/user/sculk-piglin-models.png; not a full-browser performance certification.');
