// Structural drawing-path audit, NOT certification of anatomy or perceptual quality.
const fs=require('node:fs');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);
run(`G.units=[];G.corpses=[];G.facOff={};G.map=genMansion(120,84,74538);G.map.walk.fill(1);G.map.propGrid.fill(0);G.quality='high';G.lod=false;G.time=20;fiveInitRules();
globalThis.renderCoverage=[];globalThis.paintCounts={};
const traceBase=canvasStub;ctx=new Proxy(traceBase,{get(target,k){const v=target[k];if(typeof v!=='function')return v;return(...args)=>{paintCounts[k]=(paintCounts[k]||0)+1;return v(...args);};},set(target,k,v){target[k]=v;return true;}});
const blockOriginal=drawFacingBlock;drawFacingBlock=function(...args){paintCounts.directionalBlocks=(paintCounts.directionalBlocks||0)+1;return blockOriginal(...args);};
for(const [key,sp]of Object.entries(SP)){
 G.units=[];const u=spawnUnit(key,600,600,{force:true});if(!u){renderCoverage.push({key,error:'spawn failed'});continue;}
 G.sel=u;u.fiveHidden=false;u.faceA=0;u.dir=-1;u.moveSpd=50;u.gait=.8;
 paintCounts={};drawUnit(u);
 const family=sp.tkUnit?'destiny/taken-'+sp.tkRole:sp.sculkBlock?'minecraft/sculk-block':sp.sculkWarden?'minecraft/warden':sp.pigStructure?'legends/structure':sp.pigArmy?'legends/'+sp.pigArmy:sp.five?'five/'+sp.five.shape:sp.exeShape?'exe/'+sp.exeShape:sp.mwShape?'minecraft-directional':sp.cbShape?'combine/'+sp.cbShape:sp.exShape?'extra/'+sp.exShape:sp.kind;
 const gradients=(paintCounts.createLinearGradient||0)+(paintCounts.createRadialGradient||0),blocks=paintCounts.directionalBlocks||0;
 renderCoverage.push({key,name:sp.name,family,gradients,blocks,strokes:(paintCounts.stroke||0)+(paintCounts.strokeRect||0),fills:(paintCounts.fill||0)+(paintCounts.fillRect||0),review:!gradients&&!blocks?'manual-material-review':'has-lighting-path',error:DRAW_ERRS[key]||null});
}
drawFacingBlock=blockOriginal;ctx=canvasStub;`);
const rows=sandbox.renderCoverage;const groups={};for(const r of rows){groups[r.family]=(groups[r.family]||0)+1;}
const manual=rows.filter(r=>r.review==='manual-material-review');const report={species:rows.length,scope:'base forms, high quality, full drawUnit; static metrics do not certify original anatomy, outline or readable facing',families:groups,manualReviewCount:manual.length,errors:rows.filter(r=>r.error),rows};
fs.writeFileSync('research/render-coverage.json',JSON.stringify(report,null,2)+'\n');
console.log('Render coverage:',rows.length,'species;',manual.length,'require manual material review;',report.errors.length,'errors');
console.log('Manual-review keys:',manual.map(r=>r.key).join(', '));if(report.errors.length)process.exitCode=1;
