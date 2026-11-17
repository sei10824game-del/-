const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');const{createCanvas}=require('@napi-rs/canvas');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);const cv=createCanvas(1400,980),ctx=cv.getContext('2d');sandbox.rasterCtx=ctx;
run(`ctx=rasterCtx;G.map=genMansion(120,84,74538);G.map.walk.fill(1);G.facOff={};G.time=100;G.units=[];G.doomNests=[];G.quality='high';G.lod=false;
ctx.fillStyle='#27303d';ctx.fillRect(0,0,1400,980);ctx.fillStyle='#e4efff';ctx.font='14px sans-serif';['Before interaction','0.08s after','0.30s after','1.20s after'].forEach((n,i)=>ctx.fillText(n,170+i*300,20));
const rows=['Dupe','Real door','Timothy container','Snare'];rows.forEach((key,row)=>{
 const src={id:500+row,key:row===2?'dr_timothy':'dr_dupe_hotel',hp:100,dead:false,gone:false};const snare={id:600,key:'dr_snare',hp:100,dead:false,gone:false,x:600,y:600,canonContacts:new Set()};ctx.fillStyle='#e4efff';ctx.fillText(key,7,row*235+48);
 for(let i=0;i<4;i++){
 G.time=100+[0,.08,.3,1.2][i];const o={id:'test-'+row,kind:row===2?'container':'door',x:600,y:600,number:12,opened:i>0&&row!==0,numberBlurred:i>0&&row===0,fake:row===0,src,prop:{}};const ev={object:row===3?'snare600':o.id,time:100,actor:1,type:row===0?'dupe-open':row===2?'container-open':'snare-step'};
 G.canonWorld={doors:row<2?[o]:[],containers:row===2?[o]:[],events:i?[ev]:[],throws:[]};G.units=row===3?[snare]:[];snare.canonContacts=i?new Set([1]):new Set();
 const before=JSON.stringify([G.time,o.opened,o.numberBlurred,o.spent,src.hp,snare.hp,snare.x,snare.y,[...snare.canonContacts],G.canonWorld.events]);ctx.save();ctx.beginPath();ctx.rect(150+i*300,row*235+30,300,205);ctx.clip();ctx.translate(295+i*300,row*235+220);ctx.scale(2,2);ctx.translate(-600,-600*SQ);drawCanonWorld();ctx.restore();if(before!==JSON.stringify([G.time,o.opened,o.numberBlurred,o.spent,src.hp,snare.hp,snare.x,snare.y,[...snare.canonContacts],G.canonWorld.events]))throw Error('trap draw changed gameplay '+key);
 }
});`);
const hash=(row,i)=>crypto.createHash('sha256').update(ctx.getImageData(150+i*300,row*235+30,300,200).data).digest('hex');
for(let row=0;row<4;row++)assert.notEqual(hash(row,0),hash(row,1),'interaction changes image '+row);
for(let row=0;row<3;row++)assert.notEqual(hash(row,1),hash(row,2),'event timing changes image '+row);
assert.notEqual(hash(2,2),hash(2,3),'Timothy disappears after jump');
fs.writeFileSync('/home/user/trap-polish.png',cv.toBuffer('image/png'));console.log('Trap polish passed: real/false door, container and Snare × four event times, native image differences, no damage/flags/events mutation. /home/user/trap-polish.png');
