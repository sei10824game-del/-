/* Gore Nest lifecycle: corpses -> ritual -> portal -> incoming reinforcements.
 * Geometry, corpse count and timings are explicit simulation parameters, not
 * codex measurements. This does NOT implement soul factories or demon breeding. */
const DOOM_NEST_RULES={corpses:3,ritualSeconds:3,alarmSeconds:8,waveDelay:1.5,waveSize:3};
const DOOM_NEST_BUILDERS=new Set(['dm_possessed_scientist','dm_possessed_engineer','dm_possessed_soldier','dm_possessed_security','dm_unwilling']);
const DOOM_NEST_POOL=['dm_imp_2016','dm_possessed_soldier','dm_hell_razer','dm_hell_knight_2016'];
function doomWorldInit(){for(const u of G.units||[]){doomDropBody(u);u.doomSite=null;u.doomTearing=null;}G.doomNests=[];G.doomNestWaves=[];G.doomNestNextId=1;}
function doomDropBody(u){const c=u.doomBody;if(c?.hauled===u){c.hauled=null;delete c.doomCarrier;}u.doomBody=null;u.doomRitual=null;}
function doomNestCorpse(c){return !!(c.canonHost&&c.canonViable&&!c.canonSterile&&!c.canonConsumed&&!c.hauled&&!c.canonClaim&&!c.riseAs&&!c.farmT);}
function doomRitualThink(u){
 if(!DOOM_NEST_BUILDERS.has(u.key)||!exAlive(u)||u.fac!=='dm')return false;
 const threat=G.units.some(t=>exAlive(t)&&hostileTo(u,t)&&dist(u.x,u.y,t.x,t.y)<160&&losWalk(u.x,u.y,t.x,t.y,1));
 if(threat){doomDropBody(u);return false;}
 if(u.doomBody){
  const c=u.doomBody,n=u.doomSite;
  if(!G.corpses.includes(c)||c.hauled!==u||!n||n.gone||n.active){doomDropBody(u);return false;}
  if(dist(u.x,u.y,n.x,n.y)<u.r+20){
   u.dest=null;u.path=null;
   if(!u.doomRitual)u.doomRitual={until:G.time+DOOM_NEST_RULES.ritualSeconds,hit:u.lastHitT};
  }else setDest(u,n.x,n.y);
  return true;
 }
 const c=G.corpses.filter(c=>doomNestCorpse(c)&&dist(u.x,u.y,c.x,c.y)<300&&losWalk(u.x,u.y,c.x,c.y,1)).sort((a,b)=>dist(u.x,u.y,a.x,a.y)-dist(u.x,u.y,b.x,b.y))[0];
 if(!c)return false;
 if(dist(u.x,u.y,c.x,c.y)>u.r+18){setDest(u,c.x,c.y);return true;}
 let n=(G.doomNests||[]).find(n=>!n.gone&&!n.active&&dist(n.x,n.y,u.x,u.y)<300);
 if(!n){const p=exPoint(u.x+TILE*2,u.y)||exPoint(u.x,u.y);if(!p)return false;n={id:G.doomNestNextId++,x:p.x,y:p.y,bodies:0,active:false,gone:false,alarmAt:-Infinity};(G.doomNests||(G.doomNests=[])).push(n);}
 c.hauled=u;c.doomCarrier=u.id;u.doomBody=c;u.doomSite=n;setDest(u,n.x,n.y);return true;
}
function doomQueueWave(n,reason){
 if(n.wavePending)return;n.wavePending=true;n.alarmAt=G.time;
 (G.doomNestWaves||(G.doomNestWaves=[])).push({nest:n,reason,at:G.time+DOOM_NEST_RULES.waveDelay});
}
function doomNestOnDamage(att,tgt,dmg){
 if(!(dmg>0)||!att||att.fac==='dm'||tgt.fac!=='dm')return;
 for(const n of G.doomNests||[])if(n.active&&!n.gone&&dist(n.x,n.y,tgt.x,tgt.y)<190&&G.time-n.alarmAt>=DOOM_NEST_RULES.alarmSeconds)doomQueueWave(n,'defender-attacked');
}
function doomStartTear(u,n){
 if(!exAlive(u)||u.fac==='dm'||!n?.active||n.gone||dist(u.x,u.y,n.x,n.y)>u.r+24||!losWalk(u.x,u.y,n.x,n.y,1))return false;
 interrupt(u);u.doomTearing={nest:n,until:G.time+1.2,hit:u.lastHitT};u.dest=null;u.path=null;return true;
}
function doomInteractionThink(u){
 if(u.doomTearing){u.dest=null;u.path=null;return true;}
 if(u.fac==='dm'||!exAlive(u)||!['idle','move'].includes(u.state))return false;
 if(u.tgt&&exAlive(u.tgt)&&dist(u.x,u.y,u.tgt.x,u.tgt.y)<160)return false;
 const n=(G.doomNests||[]).find(n=>n.active&&!n.gone&&dist(u.x,u.y,n.x,n.y)<u.r+24);
 return n?doomStartTear(u,n):false;
}
function doomWorldUpdate(dt){
 for(const u of G.units){
  if(u.doomBody){
   const c=u.doomBody,n=u.doomSite,r=u.doomRitual;
   if(!exAlive(u)||u.fac!=='dm'||!G.corpses.includes(c)||c.hauled!==u||!c.canonViable||c.canonSterile||c.farmT||!n||n.gone||n.active||['down','stagger','transform','hugged','carried','grappled'].includes(u.state)||(r&&(u.lastHitT!==r.hit||dist(u.x,u.y,n.x,n.y)>u.r+20))){doomDropBody(u);}
   else{
    c.x=u.x-8*Math.cos(u.faceA);c.y=u.y-8*Math.sin(u.faceA);
    if(r&&G.time>=r.until){G.corpses.splice(G.corpses.indexOf(c),1);c.canonConsumed=true;doomDropBody(u);n.bodies++;
     if(n.bodies>=DOOM_NEST_RULES.corpses){n.active=true;doomQueueWave(n,'portal-opened');addLog('🔥 遺骸の儀式でゴアネストが開通した','dm');}
    }
   }
  }
  const a=u.doomTearing;
  if(a){const n=a.nest;
   if(!exAlive(u)||['down','stagger','transform','hugged','carried','grappled'].includes(u.state)||n.gone||u.lastHitT!==a.hit||dist(u.x,u.y,n.x,n.y)>u.r+24||!losWalk(u.x,u.y,n.x,n.y,1)){u.doomTearing=null;continue;}
   if(G.time>=a.until){n.gone=true;u.doomTearing=null;doomQueueWave(n,'core-removed');addShock(n.x,n.y,8,75,'#db7067');addLog('💥 ゴアネストの心臓が引き抜かれた','dm');}
  }
 }
 const waves=G.doomNestWaves||[];
 for(let i=waves.length-1;i>=0;i--){const w=waves[i];if(G.time<w.at)continue;const n=w.nest;
  // A destroyed nest can emit its already-triggered death alarm, never restart itself.
  for(let j=0;j<DOOM_NEST_RULES.waveSize;j++){
   const a=j*TAU/DOOM_NEST_RULES.waveSize,p=exPoint(n.x+Math.cos(a)*45,n.y+Math.sin(a)*45);if(!p||!facOn('dm'))continue;
   const key=DOOM_NEST_POOL[Math.floor(Math.random()*DOOM_NEST_POOL.length)],v=spawnUnit(key,p.x,p.y,{force:true});
   if(v){if(G.stats.dm)G.stats.dm.born++;v.doomArrival=n.id;addShock(p.x,p.y,6,30,'#d77c59');}
  }n.wavePending=false;waves.splice(i,1);
 }
}
function doomInteractionPanel(el,u){
 if(u.fac==='dm')return;
 for(const n of G.doomNests||[])if(n.active&&!n.gone&&dist(u.x,u.y,n.x,n.y)<=u.r+24){
  const b=document.createElement('button');b.textContent=u.doomTearing?'ゴアネストの心臓を引き抜き中':'ゴアネストの心臓を引き抜く';b.disabled=!!u.doomTearing;b.onclick=()=>{doomStartTear(u,n);el._signature=null;canonInteractionPanel();};el.appendChild(b);
 }
}
function doomDrawWorld(){
 ctx.save();
 for(const n of G.doomNests||[]){if(n.gone)continue;const x=n.x,y=n.y*SQ;
  ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(x,y+3,34,13,0,0,TAU);ctx.fill();
  blob(x,y-10,27,17,'#713d42');blob(x-15,y-15,18,13,'#8e5652');blob(x+13,y-15,16,12,'#a76a5a');
  ctx.strokeStyle='#d2b399';ctx.lineWidth=2;
  for(let j=0;j<4;j++){ctx.beginPath();ctx.moveTo(x-21+j*8,y-4);ctx.quadraticCurveTo(x-30+j*9,y-30,x-15+j*7,y-32);ctx.stroke();}
  blob(x+17,y-18,8,10,n.active?'#d5bc69':'#7e7051');blob(x+18,y-20,3,4,'#f1daa0');
  if(n.active){
   const g=ctx.createRadialGradient(x,y-33,2,x,y-33,19);g.addColorStop(0,'#1e1824');g.addColorStop(.7,'#b74533');g.addColorStop(1,'#ef9a59');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y-33,17,23,0,0,TAU);ctx.fill();
   ctx.strokeStyle='#e4b68b';ctx.lineWidth=2;ctx.stroke();
   for(let j=0;j<7;j++){const a=j*TAU/7+G.time*.7;ctx.fillStyle='#d8a465';ctx.fillRect(x+Math.cos(a)*17-1,y-33+Math.sin(a)*23-1,2,2);}
  }else{ctx.fillStyle='#e1be9c';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText('儀式 '+n.bodies+'/'+DOOM_NEST_RULES.corpses,x,y-36);}
 }
 ctx.restore();
}
