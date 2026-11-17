const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');const{createCanvas}=require('@napi-rs/canvas');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);const cv=createCanvas(1400,2200),ctx=cv.getContext('2d');sandbox.rasterCtx=ctx;
run(`ctx=rasterCtx;G.map=genMansion(120,84,74538);G.map.walk.fill(1);G.facOff={};G.time=100;G.quality='high';G.lod=false;globalThis.legacyDraws=0;
const keys=[...new Set(['pr_jungle_hunter','pr_city_hunter','pr_cleaner_wolf',...['blade','hammer','shieldbash'].map(m=>Object.keys(SP).find(k=>SP[k].fac==='cv'&&SP[k].atks.some(d=>d.fiveMelee===m))),...['grunt','hunter','jackal'].map(shape=>Object.keys(SP).find(k=>SP[k].fac==='cv'&&SP[k].five?.shape===shape))])];globalThis.polishKeys=keys;
ctx.fillStyle='#27303d';ctx.fillRect(0,0,1400,2200);ctx.fillStyle='#ecf5ff';ctx.font='14px sans-serif';['Idle','Walk','Charge','Fire / impact','Left facing'].forEach((n,i)=>ctx.fillText(n,160+i*245,20));
keys.forEach((key,row)=>{G.units=[];const u=spawnUnit(key,600,600,{force:true});u.sizeMul=1;const preferred=key==='pr_city_hunter'?'spear':key==='pr_cleaner_wolf'?'whip':null;const d=(preferred?u.atkList.find(d=>d.fiveMelee===preferred):u.atkList.find(d=>['blade','hammer','shieldbash'].includes(d.fiveMelee)))||u.atkList[0];if(!d)throw Error('missing attack '+key);ctx.fillStyle='#ecf5ff';ctx.fillText(key,6,row*210+45);
for(let i=0;i<5;i++){u.faceA=i===4?Math.PI:0;u.state=i===1?'move':i===2||i===3?'attack':'idle';u.moveSpd=i===1?70:0;u.gait=i===1?1.7:0;u.atk=i===2||i===3?{def:d,t:i===2?d.windup*.85:d.windup+d.active*.45,tgt:null}:null;
const before=JSON.stringify([u.x,u.y,u.hp,G.time,u.state,u.atk?.t]);ctx.save();ctx.beginPath();ctx.rect(150+i*245,row*210+30,245,200);ctx.clip();ctx.translate(270+i*245,row*210+205);ctx.scale(1.15,1.15);ctx.translate(-u.x,-u.y*SQ);drawUnit(u);ctx.restore();if(before!==JSON.stringify([u.x,u.y,u.hp,G.time,u.state,u.atk?.t]))throw Error('combat mutation '+key);legacyDraws++;}
});if(Object.keys(DRAW_ERRS).length)throw Error(JSON.stringify(DRAW_ERRS));`);
const keys=run('polishKeys');assert.equal(keys.length,8);assert.equal(run('legacyDraws'),keys.length*5);
for(let row=0;row<keys.length;row++){
const h=i=>crypto.createHash('sha256').update(ctx.getImageData(150+i*245,row*210+30,245,175).data).digest('hex');
assert.notEqual(h(0),h(4),keys[row]+' facing must be readable');
assert.notEqual(h(0),h(2),keys[row]+' charge should change pixels');
assert.notEqual(h(2),h(3),keys[row]+' impact should differ from charge');
}
fs.writeFileSync('/home/user/warrior-polish-poses.png',cv.toBuffer('image/png'));console.log(`Warrior polish passed: ${keys.length} models × 5 states, native pose/facing differences, no combat mutation, zero draw errors. /home/user/warrior-polish-poses.png`);
