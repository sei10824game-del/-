/* Environmental triggers, not proximity substitutes. See CANON_WORLD.md.
 * Mansion interaction geometry and assimilation channel duration are simulation
 * parameters, not asserted film/game measurements. */
const CANON_TRAPS=new Set(['dr_dupe_hotel','dr_dupe_mines','dr_timothy','dr_snare']);
function canonWorldInit(){
 for(const b of G.canonWorld?.throws||[])if(G.map.props?.includes(b.prop))canonLandObject(b);
 G.canonWorld={doors:[],containers:[],events:[]};
 for(const [i,d] of (G.map.doors||[]).entries())G.canonWorld.doors.push({kind:'door',id:'door'+i,x:(d.x+.5)*TILE,y:(d.y+.5)*TILE,number:i+1,opened:false});
 for(const [i,p] of (G.map.props||[]).entries())if(['crate','barrel'].includes(p.type)){
  const offsets=[[0,TILE], [TILE,0], [0,-TILE], [-TILE,0]];
  const q=offsets.map(([x,y])=>({x:p.x+x,y:p.y+y})).find(v=>walkAtPx(v.x,v.y));
  if(q)G.canonWorld.containers.push({kind:'container',id:'container'+i,x:q.x,y:q.y,prop:p,opened:false});
 }
}
function canonWorld(){if(!G.canonWorld)canonWorldInit();return G.canonWorld;}
function canonWorldSpawn(u){
 if(!CANON_TRAPS.has(u.key))return;
 const w=canonWorld();u.canonTrap=true;u.fiveHidden=true;u.dest=null;u.path=null;
 if(u.key.startsWith('dr_dupe_')){
  const real=w.doors.filter(d=>!d.fake).sort((a,b)=>dist(u.x,u.y,a.x,a.y)-dist(u.x,u.y,b.x,b.y))[0];
  // Separate fake doorway; never relabel a real traversable door as fake.
  const candidates=real?[[TILE*1.5,0],[-TILE*1.5,0],[0,TILE*1.5],[0,-TILE*1.5]].map(([x,y])=>({x:real.x+x,y:real.y+y})):[];
  const p=candidates.find(p=>walkAtPx(p.x,p.y))||{x:u.x,y:u.y};
  const d={kind:'door',id:'dupe'+u.id,...p,number:(real?.number||0)+2,correctNumber:real?.number,fake:true,src:u,opened:false};
  w.doors.push(d);u.x=d.x;u.y=d.y;u.canonObject=d;
 }else if(u.key==='dr_timothy'){
  const c=w.containers.filter(c=>!c.src&&!c.opened).sort((a,b)=>dist(u.x,u.y,a.x,a.y)-dist(u.x,u.y,b.x,b.y))[0];
  if(c){c.src=u;u.canonObject=c;u.x=c.x;u.y=c.y;}
 }
}
function canonEvent(type,u,obj){const w=canonWorld();w.events.push({type,actor:u.id,object:obj.id,time:G.time});if(w.events.length>100)w.events.shift();}
function canonInteract(u,obj,action='open'){
 if(!exAlive(u)||u.canonTrap||!obj||obj.prop?.gone||obj.prop?.canonAirborne||dist(u.x,u.y,obj.x,obj.y)>TILE*1.6||!losWalk(u.x,u.y,obj.x,obj.y,1))return false;
 const w=canonWorld();if(!w.doors.includes(obj)&&!w.containers.includes(obj))return false;
 if(!['open','unlock'].includes(action)||obj.opened||obj.spent)return false;
 if(obj.fake){
  if(!exAlive(obj.src))return false;
  obj.spent=true;obj.numberBlurred=true;canonEvent('dupe-'+action,u,obj);
  // No inventory mutation: attempting a fake lock must not consume keys.
  fiveDoorDamage(obj.src,u,40);return true;
 }
 obj.opened=true;canonEvent(obj.kind+'-'+action,u,obj);
 if(obj.kind==='container'&&exAlive(obj.src)&&obj.src.key==='dr_timothy'){
  dealDamage(obj.src,u,5,{fiveWeapon:'timothy',ignoreArmor:1,canonNonlethal:true});obj.src.canonSpent=true;
 }
 return true;
}
function canonInteractionThink(u){
 if(doomInteractionThink(u))return true;
 if(u.canonTrap){u.dest=null;u.path=null;return true;}
 if(u.fac!=='N'||u.tgt||u.aggro||!['idle','move'].includes(u.state))return false;
 const w=canonWorld();const a=[...w.doors,...w.containers].filter(o=>!o.opened&&!o.spent&&!o.prop?.gone&&!o.prop?.canonAirborne&&dist(u.x,u.y,o.x,o.y)<TILE*3&&losWalk(u.x,u.y,o.x,o.y,1)).sort((a,b)=>dist(u.x,u.y,a.x,a.y)-dist(u.x,u.y,b.x,b.y));
 const o=a[0];if(!o)return false;
 if(dist(u.x,u.y,o.x,o.y)<=TILE*1.5){canonInteract(u,o);u.dest=null;u.path=null;}else setDest(u,o.x,o.y);
 return true;
}
function canonCorpseMetadata(u,opts){
 const host=isInfectHost(u); // Snapshot before any conversion; no dead-host live predicate later.
 return {canonHost:host,canonViable:host,canonGib:!!(opts.gib||u.canonDeathOptions?.gib),canonSterile:!!(opts.sterile||u.canonDeathOptions?.sterile),canonDeathTime:G.time,pal:u.pal};
}
function canonViableCorpse(c){
 // Unknown/legacy corpses are not silently certified as fresh biological hosts.
 // There is no invented film-canon expiry in seconds. Decay/sterilization are explicit states.
 return !!(c&&c.canonHost&&c.canonViable&&!c.canonSterile&&!c.hauled&&!c.riseAs&&!c.farmT&&!c.canonConsumed);
}
function canonCorpseContact(u,c){return dist(u.x,u.y,c.x,c.y)<=u.r+18&&losWalk(u.x,u.y,c.x,c.y,1);}
function canonCancelCorpse(u){const a=u.canonAssimilating;if(a?.corpse.canonClaim===u.id)delete a.corpse.canonClaim;u.canonAssimilating=null;}
function canonCorpseThink(u){
 if(u.fac!=='th'||!exAlive(u))return false;
 if(u.canonAssimilating){u.dest=null;u.path=null;return true;}
 if(u.fiveAssimilating)return false;
 const c=G.corpses.filter(c=>canonViableCorpse(c)&&(!c.canonClaim||c.canonClaim===u.id)&&dist(u.x,u.y,c.x,c.y)<180&&losWalk(u.x,u.y,c.x,c.y,1)).sort((a,b)=>dist(u.x,u.y,a.x,a.y)-dist(u.x,u.y,b.x,b.y))[0];
 if(!c)return false;
 if(canonCorpseContact(u,c)){c.canonClaim=u.id;u.canonAssimilating={corpse:c,until:G.time+4,hit:u.lastHitT};u.dest=null;u.path=null;}
 else setDest(u,c.x,c.y);return true;
}
function canonWorldUpdate(dt){
 doomWorldUpdate(dt);
 canonUpdateThrows(dt);
 for(const c of G.corpses)if(c.canonClaim&&!G.units.some(u=>exAlive(u)&&u.id===c.canonClaim&&u.canonAssimilating?.corpse===c))delete c.canonClaim;
 for(const u of [...G.units]){
  const a=u.canonAssimilating;
  if(a){const c=a.corpse;
   if(!exAlive(u)||!G.corpses.includes(c)||!canonViableCorpse(c)||c.canonClaim!==u.id||!canonCorpseContact(u,c)||u.lastHitT!==a.hit||['down','stagger','transform'].includes(u.state)){canonCancelCorpse(u);continue;}
   if(G.time>=a.until){
    // Spawn first; if the host cannot be placed the body is not lost.
    const v=spawnUnit(c.key,c.x,c.y,{force:true});
    if(v){v.fac=v.team='th';v.fiveOrigin=c.key;v.fiveAssimilated=1;v.fiveCellImmune=1;v.fiveHidden=true;v.fiveRevealAt=Infinity;v.jokerRate=0;v.sizeMul=c.sizeMul||v.sizeMul;v.pal=c.pal||v.pal;v.atkList=[...v.atkList,...SP.th_carter_human_imitation.atks.filter(d=>d.fiveMove==='assimilate')];v.tgt=v.aggro=null;c.canonConsumed=true;G.corpses.splice(G.corpses.indexOf(c),1);G.stats.th.conv++;}
    canonCancelCorpse(u);
   }
  }
  if(!exAlive(u)||u.key!=='dr_snare')continue;
  if(!u.canonContacts)u.canonContacts=new Set();
  const touching=new Set();
  for(const t of G.units)if(exAlive(t)&&hostileTo(u,t)&&!t.fiveHiding&&!(t.z>8)&&dist(u.x,u.y,t.x,t.y)<u.r+t.r&&losWalk(u.x,u.y,t.x,t.y,1)){
   touching.add(t.id);if(!u.canonContacts.has(t.id)){
    dealDamage(u,t,20,{fiveWeapon:'snare',ignoreArmor:1,canonNonlethal:true});
    t.fiveStopUntil=Math.max(t.fiveStopUntil||0,G.time+3);canonEvent('snare-step',t,{id:'snare'+u.id});
   }
  }u.canonContacts=touching;
 }
}
function canonVisualAge(w,id){
 for(let i=w.events.length-1;i>=0;i--)if(w.events[i].object===id)return Math.max(0,G.time-w.events[i].time);
 return Infinity;
}
function canonDrawSpider(x,y,age){
 // A short, render-only jump after the existing container-open event.
 const f=clamp(age/.8,0,1),jump=Math.sin(f*Math.PI)*17;ctx.save();ctx.translate(x+f*15,y-14-jump);ctx.scale(1+Math.sin(f*Math.PI)*.15,1);ctx.lineCap='round';
 for(let i=0;i<8;i++){const side=i<4?-1:1,k=i%4,baseY=(k-1.5)*1.5,kneeX=side*(7+Math.sin(age*18+k)*1.4),kneeY=baseY-4+k*1.3;ctx.strokeStyle=i<4?'#49352e':'#715044';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(side*2,baseY);ctx.lineTo(kneeX,kneeY);ctx.lineTo(side*(10-k*.7),baseY+5+Math.sin(age*16+k));ctx.stroke();}
 blob(0,1,4,5,'#624437','#9a7561');blob(0,-3,3,3,'#553c32','#a17c65');ctx.fillStyle='#1b1617';ctx.fillRect(-1.5,-4,1,1);ctx.fillRect(.5,-4,1,1);ctx.restore();
}
function canonDrawSnare(u,w){
 const x=u.x,y=u.y*SQ,age=canonVisualAge(w,'snare'+u.id),raised=(u.canonContacts?.size>0||age<2.4)?1:age<3?(3-age)/.6:0;
 ctx.save();const g=ctx.createRadialGradient(x-3,y-2,0,x,y,14);g.addColorStop(0,'#8e7e48');g.addColorStop(.65,'#6c603c');g.addColorStop(1,'#3d3a2b');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,14,8,0,0,TAU);ctx.fill();ctx.strokeStyle='#51472e';ctx.lineWidth=1.4;
 for(let i=0;i<7;i++){const aa=i*2.399;ctx.beginPath();ctx.moveTo(x+Math.cos(aa)*9,y+Math.sin(aa)*5);ctx.lineTo(x+Math.cos(aa)*16,y+Math.sin(aa)*9);ctx.stroke();}
 ctx.fillStyle='#252a20';ctx.beginPath();ctx.ellipse(x,y,5,3,0,0,TAU);ctx.fill();
 for(let i=0;i<9;i++){const aa=i*TAU/9,xx=x+Math.cos(aa)*9,yy=y+Math.sin(aa)*5,h=4+raised*(7+(i%3)*2);ctx.fillStyle=i%2?'#b5a56a':'#d3bd7e';ctx.strokeStyle='#746440';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(xx-2.1,yy);ctx.lineTo(xx+Math.cos(aa)*1.5,yy-h);ctx.lineTo(xx+2.1,yy+1);ctx.closePath();ctx.fill();ctx.stroke();}ctx.restore();
}
function drawCanonWorld(){
 doomDrawWorld();
 const w=G.canonWorld;if(!w)return;ctx.save();ctx.font='bold 9px sans-serif';ctx.textAlign='center';
 for(const u of G.units)if(exAlive(u)&&u.key==='dr_snare')canonDrawSnare(u,w);
 for(const o of [...w.doors,...w.containers]){
  if(o.prop?.gone||o.prop?.canonAirborne)continue;
  const x=o.x,y=o.y*SQ,age=canonVisualAge(w,o.id);
  if(o.kind==='door'){
   // Real and false doors share the same facade before interaction.
   const strike=o.fake&&age<.75?Math.sin(clamp(age/.75,0,1)*Math.PI):0,opening=o.opened?Math.min(1,age/.3):strike,leafW=Math.max(3,24*Math.cos(opening*1.3));
   drawFacingBlock(x-14,y,4,52,3,1,'#745b46','#3b302b','#b28d61');drawFacingBlock(x+14,y,4,52,3,1,'#745b46','#3b302b','#b28d61');drawFacingBlock(x,y-50,32,5,3,1,'#8d7151','#493a30','#c1a277');
   ctx.fillStyle='#18171c';ctx.fillRect(x-12,y-49,24,49);
   if(strike>0){ctx.fillStyle='#a7a08e';for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(x+side*5,y-31,3,2,side*.18,0,TAU);ctx.fill();}ctx.fillStyle='#050508';ctx.beginPath();ctx.ellipse(x,y-20,7,4+strike*7,0,0,TAU);ctx.fill();ctx.fillStyle='#b8aa92';for(let i=0;i<5;i++)ctx.fillRect(x-5+i*2.3,y-27,1.1,3);}
   drawFacingBlock(x-12+leafW/2,y,leafW,48,2,1,'#876b4c','#48382d','#b79870');
   ctx.strokeStyle='#5c4836';ctx.lineWidth=.7;for(let i=0;i<3;i++)ctx.strokeRect(x-11+leafW*.12,y-43+i*13,leafW*.72,10);
   ctx.fillStyle='#d4b46c';ctx.beginPath();ctx.arc(x-12+leafW*.8,y-22,1.2,0,TAU);ctx.fill();
   ctx.fillStyle='#292629';ctx.fillRect(x-8,y-48,16,10);ctx.fillStyle='#e6dbbf';ctx.fillText(o.numberBlurred?'???':String(o.number),x,y-40);
  }else{
   drawFacingBlock(x,y-1,24,15,5,1,'#88684c','#493a2f','#bc9b72');ctx.strokeStyle='#49372c';ctx.lineWidth=1;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x-10,y-4-i*4);ctx.lineTo(x+10,y-4-i*4);ctx.stroke();}
   const lift=o.opened?Math.min(1,age/.25):0;ctx.save();ctx.translate(x-12,y-16);ctx.rotate(-lift*.85);drawFacingBlock(12,0,25,4,3,1,'#aa875d','#5e4634','#cbae80');ctx.restore();ctx.fillStyle='#cfba7b';ctx.fillRect(x-2,y-10,4,3);
   if(o.src?.key==='dr_timothy'&&age<.8&&o.opened)canonDrawSpider(x,y,age);
  }
 }
 for(const b of w.throws||[]){drawFacingBlock(b.x,b.y*SQ-8,20,20,4,1,'#846344','#48352d','#c19b6a');}
 ctx.restore();
}
function canonInteractionPanel(){
 if(typeof document.createElement!=='function')return;
 let el=document.getElementById('canonInteractions');if(!el){el=document.createElement('div');el.id='canonInteractions';el.style.cssText='position:fixed;bottom:12px;left:12px;z-index:25;background:#25212bea;padding:8px;color:#eee;font-size:12px;max-width:340px';document.body.appendChild(el);}
 const u=G.sel;if(!exAlive(u)){el.style.display='none';el._signature=null;return;}el.style.display='block';
 const nearby=[...canonWorld().doors,...canonWorld().containers].filter(o=>!o.opened&&!o.spent&&!o.prop?.gone&&!o.prop?.canonAirborne&&dist(u.x,u.y,o.x,o.y)<=TILE*1.6);
 const signature=u.id+':'+nearby.map(o=>o.id).join(',')+':'+(G.doomNests||[]).filter(n=>!n.gone&&n.active&&dist(u.x,u.y,n.x,n.y)<=u.r+24).map(n=>n.id).join(',')+':'+!!u.doomTearing;if(el._signature===signature&&el._world===G.canonWorld)return;el._signature=signature;el._world=G.canonWorld;el.textContent='';
 doomInteractionPanel(el,u);
 const title=document.createElement('div');title.textContent='選択個体：近くの扉・容器を操作';el.appendChild(title);
 for(const o of nearby){
  const b=document.createElement('button');b.textContent=o.kind==='door'?'扉 '+(o.numberBlurred?'???':o.number)+' を開く':'容器を開く';b.onclick=()=>{canonInteract(u,o);canonInteractionPanel();};el.appendChild(b);
 }
}

// Doom 3 Vagary: pick up an actual loose prop, never a damage beam from empty air.
function canonVagaryObject(u){return (G.map.props||[]).find(p=>!p.gone&&!p.canonAirborne&&['crate','barrel'].includes(p.type)&&dist(u.x,u.y,p.x,p.y)<300&&canonObjectVisible(u,p));}
function canonLiftThrow(u,t){
 if(!exAlive(t))return;const p=canonVagaryObject(u);if(!p)return;
 const m=G.map;p.canonAirborne=true;
 for(let y=p.ty;y<p.ty+p.th;y++)for(let x=p.tx;x<p.tx+p.tw;x++){const i=y*m.w+x;m.propGrid[i]=0;if(m.t[i]>0)m.walk[i]=1;}
 const a=angTo(p.x,p.y,t.x,t.y);
 (canonWorld().throws||(canonWorld().throws=[])).push({src:u,prop:p,x:p.x,y:p.y,vx:Math.cos(a)*320,vy:Math.sin(a)*320,t:0});
}
function canonLandObject(b){
 const p=b.prop,m=G.map,tx=Math.floor(b.x/TILE-p.tw/2),ty=Math.floor(b.y/TILE-p.th/2);
 // The object is consumed as broken debris if there is no room to land intact.
 let clear=!G.units.some(u=>exAlive(u)&&Math.abs(u.x-b.x)<p.tw*TILE/2+u.r&&Math.abs(u.y-b.y)<p.th*TILE/2+u.r)&&tx>=0&&ty>=0&&tx+p.tw<=m.w&&ty+p.th<=m.h;
 for(let y=ty;clear&&y<ty+p.th;y++)for(let x=tx;x<tx+p.tw;x++)if(!m.walk[y*m.w+x]){clear=false;break;}
 p.canonAirborne=false;if(!clear){p.gone=true;addDust(b.x,b.y,8);return;}
 p.tx=tx;p.ty=ty;p.x=(tx+p.tw/2)*TILE;p.y=(ty+p.th/2)*TILE;
 for(let y=ty;y<ty+p.th;y++)for(let x=tx;x<tx+p.tw;x++){m.propGrid[y*m.w+x]=1;m.walk[y*m.w+x]=0;}
 // Container interaction follows the same physical object instead of a stale location.
 for(const c of canonWorld().containers)if(c.prop===p){c.x=p.x;c.y=p.y+TILE;}
}
function canonUpdateThrows(dt){
 const list=canonWorld().throws||[];
 for(let i=list.length-1;i>=0;i--){const b=list[i];b.t+=dt;let ended=false;
  const steps=Math.max(1,Math.ceil(320*dt/5));
  for(let j=0;j<steps&&!ended;j++){
   const x=b.x+b.vx*dt/steps,y=b.y+b.vy*dt/steps;
   if(!walkAtPx(x,y)){ended=true;break;}b.x=x;b.y=y;
   const t=G.units.find(t=>exAlive(t)&&hostileTo(b.src,t)&&dist(x,y,t.x,t.y)<t.r+12);
   if(t){dealDamage(b.src,t,12,{fiveWeapon:'vagary-object',kpow:100,kdir:angTo(b.src.x,b.src.y,t.x,t.y)});ended=true;}
  }
  if(ended||b.t>=2){canonLandObject(b);list.splice(i,1);}
 }
}

function canonObjectVisible(u,p){
 const n=Math.max(1,Math.ceil(dist(u.x,u.y,p.x,p.y)/5));
 for(let i=0;i<=n;i++){
  const x=u.x+(p.x-u.x)*i/n,y=u.y+(p.y-u.y)*i/n,tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);
  if(tx>=p.tx&&tx<p.tx+p.tw&&ty>=p.ty&&ty<p.ty+p.th)continue;
  if(!walkAtPx(x,y))return false;
 }return true;
}
