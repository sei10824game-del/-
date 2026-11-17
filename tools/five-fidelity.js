/* Source-driven rules; unresolved species are NOT certified as canonical.
 * Sources and remaining gaps: FIVE_FIDELITY.md / research/five-fidelity-audit.json. */
const FIVE_COUNTS={pr:1,cv:1,th:1,dr:1,dm:12};
try{const saved=JSON.parse(localStorage.getItem('mw_five_counts')||'{}');for(const f of Object.keys(FIVE_COUNTS))if(f!=='dr'&&f!=='dm'&&Number.isSafeInteger(saved[f])&&saved[f]>=0)FIVE_COUNTS[f]=saved[f];}catch(e){}
try{const n=Number(localStorage.getItem('mw_doom_initial_total'));if(localStorage.getItem('mw_doom_initial_total')!==null&&Number.isSafeInteger(n)&&n>=0)FIVE_COUNTS.dm=n;}catch(e){}
const FIVE_CLASSIC_HP={zombieman:20,shotgun_guy:30,chaingunner:70,imp_classic:60,pinky_classic:150,spectre_classic:150,lost_soul_classic:100,cacodemon_classic:400,baron_of_hell_classic:1000,hell_knight_classic:500,revenant_classic:300,mancubus_classic:600,arachnotron_classic:500,pain_elemental_classic:400,arch_vile_classic:700,cyberdemon_classic:4000,spider_mastermind_classic:3000};
const FIVE_DOOR_DAMAGE={dr_rush:125,dr_ambush:100,dr_eyes:10,dr_screech:40,dr_hide:40,dr_a_90:90,dr_a_60:100,dr_a_120:100};
const FIVE_UNTARGETABLE=new Set(); // User request: remove blanket normal-attack immunity.
function fiveCanonicalHP(r,fallback){return FIVE_CLASSIC_HP[r.key.replace(/^dm_/,'')]??fallback;}
function fiveCount(f){if(f==='dr')return 1;return Number.isSafeInteger(FIVE_COUNTS[f])&&FIVE_COUNTS[f]>=0?FIVE_COUNTS[f]:1;}
function buildFiveCountPicker(box){
 if(!box||typeof document.createElement!=='function')return;
 const el=document.createElement('div');el.className='fgrp';el.id='fiveCounts';
 el.innerHTML='<div class="fgn">初期配置：DOOMは総数、DOORSは各種類1体固定。他は各種類の数（陣営を外すと出現なし）</div>'+Object.keys(FIVE_COUNTS).map(f=>`<label style="display:inline-block;margin:6px">${FAC_BY[f].name}${f==='dm'?'（合計）':'（各種類）'} <input type="number" min="0" step="1" data-five-count="${f}" ${f==='dr'?'disabled':''} value="${fiveCount(f)}" style="width:70px;color:#eee;background:#28222b;border:1px solid #766474;padding:5px"></label>`).join('');
 el.addEventListener('change',e=>{const f=e.target.dataset.fiveCount,n=Number(e.target.value);if(!(f in FIVE_COUNTS)||f==='dr')return;if(!Number.isSafeInteger(n)||n<0){e.target.value=fiveCount(f);return;}FIVE_COUNTS[f]=n;try{if(f==='dm')localStorage.setItem('mw_doom_initial_total',String(n));localStorage.setItem('mw_five_counts',JSON.stringify(FIVE_COUNTS));}catch(err){}});box.appendChild(el);
}
function fiveIsMarauder(u){return u.key==='dm_marauder';}
function fiveMarauderOpen(u){const a=u.atk;return (u.fiveFalterUntil||0)>G.time||!!(a&&a.def.fiveMelee==='axe'&&a.t>=a.def.windup-.2&&a.t<=a.def.windup+a.def.active);}
function fiveRuleDamage(att,u,dmg,o){
 if(u.fiveNet&&(o.acid||['disc','shuriken'].includes(o.fiveWeapon)))u.fiveNet=null;
 const flags=u.sp.five?.flags||[],front=!att||Math.abs(angDiff(u.faceA,angTo(u.x,u.y,att.x,att.y)))<Math.PI*.5;
 if(fiveIsMarauder(u)&&!fiveMarauderOpen(u)){
  combatBlock(u,'防御中：攻撃の隙を狙う');
  if(o.explosion){u.fiveFalterUntil=G.time+1;return dmg;}
  if(att&&(u.fiveWolfAt||0)<=G.time){u.fiveWolfAt=G.time+10;fiveSpawn(u,'dm_marauder_spirit_wolf');}
  addShock(u.x,u.y,8,24,'#f6a46a');return 0;
 }
 if(fiveIsMarauder(u)&&dmg>0)u.fiveFalterUntil=G.time+1;
 if(['dm_cyberdemon_classic','dm_spider_mastermind_classic'].includes(u.key)&&o.explosion)return 0;
 if(u.sp.five?.shape==='hunter'&&front&&!o.explosion&&!o.ignoreArmor){combatBlock(u,'前面装甲で防御');return 0;}
 if(/^dm_pinky_(2016|eternal)$/.test(u.key)&&front&&!o.ignoreArmor)dmg*=.02;
 if(u.sp.five?.shape==='jackal'&&flags.includes('shield')&&front&&u.fiveShield>0){
  if(['rifle','pistol','chaingun','shotgun','carbine','sniper','needler','spiker'].includes(o.fiveWeapon))return 0;
  if(o.fiveWeapon==='chargedplasma'){u.fiveShield=0;u.fiveLastHit=G.time;return 0;}
 }
 return dmg;
}
function fiveDirectionalShield(att,u){return !(u.sp.five?.shape==='jackal'&&att&&Math.abs(angDiff(u.faceA,angTo(u.x,u.y,att.x,att.y)))>=Math.PI*.5);}
function fiveCanUse(u,d,t){
 if(u.key==='dm_vagary_doom_3'&&d.fiveMove==='telekinesis'&&!canonVagaryObject(u))return false;
 if(CANON_TRAPS.has(u.key))return false;
 if(d.fiveTriggerOnly)return false;
 if(d.fiveMove==='selfdestruct'&&u.fac==='pr'&&u.hp>u.mhp*.15)return false;
 if(u.key==='dr_hide'&&(!t?.fiveHiding||G.time-t.fiveHideSince<12))return false;
 if(d.fiveMove==='assimilate'&&(!t||!isInfectHost(t)||dist(u.x,u.y,t.x,t.y)>u.r+t.r+12))return false;
 return true;
}
function fiveRuleThink(u){
 if(doomRitualThink(u))return true;
 if(canonCorpseThink(u))return true;
 if(u.fiveHiding||(u.fiveStopUntil||0)>G.time||(u.fiveFalterUntil||0)>G.time||u.fiveAssimilating){u.dest=null;u.path=null;return true;}
 if(fiveIsMarauder(u)){
  const t=fiveChooseTarget(u);u.tgt=t;if(!t)return false;
  const dd=dist(u.x,u.y,t.x,t.y),move=dd<80?'shotgun':dd>260?'axewave':'axe';
  const d=u.atkList.find(d=>d.fiveMelee===move||d.fiveShot===move);
  if(d&&canUse(u,d,t)&&(u.state==='idle'||u.state==='move')){startAttack(u,d,t);return true;}
  if(dd>130)setDest(u,t.x,t.y);else u.dest=null;return true;
 }
 return false;
}
function fiveBlast(src,x,y,r,dmg,weapon,exclude){
 addShock(x,y,6,r,'#f2aa75');
 for(const t of [...G.units])if(t!==exclude&&exAlive(t)&&hostileTo(src,t)&&dist(x,y,t.x,t.y)<r+t.r&&losWalk(x,y,t.x,t.y,1))dealDamage(src,t,dmg,{explosion:1,fiveWeapon:weapon,kpow:140,kdir:angTo(x,y,t.x,t.y)});
}
function fiveLaunch(u,d,a){
 if(fiveClassicHitscan(u,d,a))return;
 const t=a.tgt,m=d.fiveShot,base=t?angTo(u.x,u.y,t.x,t.y):u.faceA,n=d.volley||1;
 for(let i=0;i<n;i++){
  const angle=base+(i-(n-1)/2)*(d.spread||.07),kind=d.projKind,speed=kind==='bullet'?m==='needler'?360:900:kind==='rocket'?300:kind==='nade'?260:420;
  G.projs.push({kind:'fiveCanon',fiveCanon:1,weapon:m,x:u.x,y:u.y,z:24,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,t:0,life:kind==='bullet'?1.5:5,src:u,team:u.fac,dmg:fiveRollDamage(u,m,d.dmg),homing:['needler','homing','homingfire','homingskull','bolt','fence'].includes(m),target:t,impactX:t?.x,impactY:t?.y,grenade:kind==='nade'&&m!=='mortar',fuse:kind==='nade'&&m!=='mortar'?1.5:0,returning:['disc','shuriken','axethrow'].includes(m),hits:new Set()});
 }
}
function fiveProjectileStep(p,dt){
 if(p.stuck){if(exAlive(p.stuck)){p.x=p.stuck.x;p.y=p.stuck.y;}if(p.t>=p.fuse){fiveBlast(p.src,p.x,p.y,90,p.dmg,p.weapon);return true;}return false;}
 if(p.grenade&&p.t>=p.fuse){fiveBlast(p.src,p.x,p.y,p.weapon==='mortar'?130:90,p.dmg,p.weapon);return true;}
 const target=p.returning&&p.t>1?p.src:p.target;
 if((p.homing||p.returning&&p.t>1)&&exAlive(target)&&losWalk(p.x,p.y,target.x,target.y,1)){
  const a=Math.atan2(p.vy,p.vx),want=angTo(p.x,p.y,target.x,target.y),next=a+clamp(angDiff(a,want),-dt*3,dt*3),s=Math.hypot(p.vx,p.vy);p.vx=Math.cos(next)*s;p.vy=Math.sin(next)*s;
 }
 if(p.returning&&p.t>1&&exAlive(p.src)&&dist(p.x,p.y,p.src.x,p.src.y)<p.src.r+8)return true;
 const n=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vy)*dt/6));
 for(let i=0;i<n;i++){
  const nx=p.x+p.vx*dt/n,ny=p.y+p.vy*dt/n;
  if(!walkAtPx(nx,ny)){if(p.weapon==='mortar'){fiveBlast(p.src,p.x,p.y,130,p.dmg,p.weapon);return true;}if(p.grenade){p.vx*=-.5;p.vy*=-.5;return false;}if(['rocket','homing','wristrocket','fuelrod','bfg'].includes(p.weapon))fiveProjectileBurst(p);return true;}
  p.x=nx;p.y=ny;
  if(p.weapon==='mortar'&&((Number.isFinite(p.impactX)&&dist(p.x,p.y,p.impactX,p.impactY)<7)||G.units.some(t=>exAlive(t)&&hostileTo(p.src,t)&&dist(p.x,p.y,t.x,t.y)<t.r+6))){fiveBlast(p.src,p.x,p.y,130,p.dmg,p.weapon);return true;}
  for(const t of G.units){
   if(t===p.src||Math.abs(t.x-p.x)>t.r+5||Math.abs(t.y-p.y)>t.r+5||Math.abs(t.z-p.z)>70||p.hits.has(t.id)||!exAlive(t)||dist(p.x,p.y,t.x,t.y)>t.r+5||!hostileTo(p.src,t))continue;
   if(p.weapon==='net'){t.fiveNet={src:p.src,next:G.time+.5};return true;}
   if(p.grenade){if(['sticky','grenade'].includes(p.weapon)){p.stuck=t;return false;}continue;}
   const before=t.hp;
   dealDamage(p.src,t,p.dmg,{fiveWeapon:p.weapon,kpow:45,kdir:Math.atan2(p.vy,p.vx)});
   if(p.weapon==='needler'&&t.hp<before&&exAlive(t)){
    const shards=t.fiveNeedles||(t.fiveNeedles=[]);shards.push({at:G.time+1,src:p.src,dmg:p.dmg});
    if(shards.length>=7){t.fiveNeedles=[];fiveBlast(p.src,t.x,t.y,80,p.dmg*7,'supercombine');}
   }
   p.hits.add(t.id);
   if(['rocket','homing','wristrocket','fuelrod','bfg'].includes(p.weapon))fiveProjectileBurst(p,t);
   if(!p.returning)return true;
  }
 }
 return p.t>p.life;
}
function fiveProjectileBurst(p,direct){
 fiveBlast(p.src,p.x,p.y,p.weapon==='bfg'?160:90,p.dmg,p.weapon,direct);
 if(p.weapon==='bfg'&&exAlive(p.src)){
  // Classic BFG: impact-triggered spray originates at the shooter, not a constant aura.
  const a=Math.atan2(p.vy,p.vx);for(let i=0;i<40;i++){
   const ray=a-Math.PI/4+i*Math.PI/78;let hit=null,best=1024;
   for(const t of G.units)if(exAlive(t)&&hostileTo(p.src,t)&&losWalk(p.src.x,p.src.y,t.x,t.y,1)){
    const d=dist(p.src.x,p.src.y,t.x,t.y);if(d<best&&Math.abs(angDiff(ray,angTo(p.src.x,p.src.y,t.x,t.y)))<Math.atan2(t.r+2,d)){hit=t;best=d;}
   }
   if(hit)dealDamage(p.src,hit,Array.from({length:15},()=>1+Math.floor(Math.random()*8)).reduce((a,b)=>a+b,0),{fiveWeapon:'bfgSpray'});
  }
 }
}
function drawFiveProjectile(p){
 const col=p.weapon==='needler'?'#f5a3ef':p.weapon==='bfg'?'#8fff91':/plasma|fuelrod/.test(p.weapon)?'#8eeaff':'#ffb167';
 ctx.save();ctx.translate(p.x,p.y*SQ-p.z);ctx.rotate(Math.atan2(p.vy*SQ,p.vx));ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=8;
 if(p.returning){ctx.rotate(p.t*18);ctx.fillRect(-8,-2,16,4);ctx.fillRect(-2,-8,4,16);}else{ctx.beginPath();ctx.ellipse(0,0,p.weapon==='needler'?7:5,p.weapon==='needler'?2:4,0,0,TAU);ctx.fill();}ctx.restore();
}
function fiveDoorDamage(u,t,value){if(t.fiveHiding)return;dealDamage(u,t,value,{fiveWeapon:'entity',ignoreArmor:1});}
function fiveRuleFire(u,d,a){
 if(u.key==='dm_vagary_doom_3'&&d.fiveMove==='telekinesis'){canonLiftThrow(u,a.tgt);return true;}
 if(CANON_TRAPS.has(u.key))return true;
 const m=d.fiveMove,t=a.tgt;
 if(m==='net'&&exAlive(t)){const angle=angTo(u.x,u.y,t.x,t.y);G.projs.push({kind:'fiveCanon',fiveCanon:1,weapon:'net',x:u.x,y:u.y,z:24,vx:Math.cos(angle)*500,vy:Math.sin(angle)*500,t:0,life:2,src:u,team:u.fac,dmg:0,hits:new Set()});return true;}
 if(m==='mine'&&exAlive(t)){(G.fiveMines||(G.fiveMines=[])).push({src:u,x:t.x,y:t.y,armed:G.time+1,dmg:d.dmg});return true;}
 if(u.sp.fivePassive)return true; // No invented free healing, resurrection or shield auras from merchants/lights.
 if(u.key==='dm_marauder'&&m==='wolf')return true; // Reactive to shield impacts only.
 if(m==='hellfire'&&u.key==='dm_arch_vile_classic'&&exAlive(t)){
  (G.fiveCasts||(G.fiveCasts=[])).push({src:u,t,until:G.time+2});return true;
 }
 if(m==='assimilate'){
  if(exAlive(t)&&isInfectHost(t)&&dist(u.x,u.y,t.x,t.y)<=u.r+t.r+12){u.fiveAssimilating={target:t,until:G.time+4,hit:t.lastHitT};u.dest=null;}return true;
 }
 if((u.piSourceFac||u.fac)!=='dr')return false;
 if(['gaze','eject','movementcurse','ambushbite'].includes(m)){
  if(!exAlive(t))return true;
  if(m==='gaze')return true; // Continuous gaze is resolved against each actual viewer, below.
  if(m==='eject'){if(t.fiveHiding&&G.time-t.fiveHideSince>=12)fiveExitHide(t,u);return true;}
  if(m==='movementcurse'&&u.key==='dr_a_90'){
   (G.fiveWarnings||(G.fiveWarnings=[])).push({src:u,t,start:G.time,until:G.time+.9,x:null,y:null,face:null});addShock(t.x,t.y,4,35,'#ff5353');return true;
  }
  if(m==='ambushbite'&&u.key==='dr_screech'){
   (G.fiveScreeches||(G.fiveScreeches=[])).push({src:u,t,until:G.time+1});addNoise(t.x,t.y,100);return true;
  }
 }
 if(u.key==='dr_figure'&&m==='grab'){
  if(exAlive(t)&&!t.fiveHiding&&dist(u.x,u.y,t.x,t.y)<=u.r+t.r+10){t.hp=0;killUnit(u,t,{noRise:1});}return true;
 }
 if(u.key==='dr_hide')return true;
 return false;
}
function fiveEnterHide(u,spot){
 if(!spot||spot.occupant&&spot.occupant!==u.id||G.time<(u.fiveHideBlockedUntil||0)||dist(u.x,u.y,spot.x,spot.y)>55)return false;
 spot.occupant=u.id;u.fiveHiding=spot;u.fiveHideSince=G.time;interrupt(u);u.dest=null;u.path=null;return true;
}
function fiveExitHide(u,att){
 if(!u.fiveHiding)return;u.fiveHiding.occupant=null;u.fiveHiding=null;u.fiveHideBlockedUntil=G.time+10;
 if(att)fiveDoorDamage(att,u,40);
}
function fiveRuleUpdate(dt){
 canonWorldUpdate(dt);
 const mines=G.fiveMines||[];for(let i=mines.length-1;i>=0;i--){const m=mines[i];if(G.time<m.armed)continue;if(G.units.some(t=>exAlive(t)&&hostileTo(m.src,t)&&dist(m.x,m.y,t.x,t.y)<35&&losWalk(m.x,m.y,t.x,t.y,1))){fiveBlast(m.src,m.x,m.y,90,m.dmg,'mine');mines.splice(i,1);}}
 for(const name of ['fiveCasts','fiveWarnings','fiveScreeches']){
  const list=G[name]||[];
  for(let i=list.length-1;i>=0;i--){const w=list[i];if(!exAlive(w.src)||!exAlive(w.t)){list.splice(i,1);continue;}
   if(name==='fiveCasts'){
    addFire(w.t.x,w.t.y,4,1);
    if(['down','stagger','transform'].includes(w.src.state)){list.splice(i,1);continue;}
    if(G.time>=w.until){if(losWalk(w.src.x,w.src.y,w.t.x,w.t.y,1)){dealDamage(w.src,w.t,90,{fiveWeapon:'hellfire',kpow:150});fiveBlast(w.src,w.t.x,w.t.y,70,70,'hellfire',w.t);if(exAlive(w.t)){knockDown(w.t);w.t.z=Math.max(w.t.z,1);w.t.vz=280;}}list.splice(i,1);}
   }else if(name==='fiveWarnings'){
    if(G.time>=w.start+.6){if(w.x===null){w.x=w.t.x;w.y=w.t.y;w.face=w.t.faceA;}else if(dist(w.x,w.y,w.t.x,w.t.y)>.5||Math.abs(angDiff(w.face,w.t.faceA))>.02)w.moved=true;}
    if(G.time>=w.until){if(w.moved)fiveDoorDamage(w.src,w.t,90);list.splice(i,1);}
   }else{
    if(w.t.fiveHiding||canSee(w.t,w.src)){list.splice(i,1);continue;}
    if(G.time>=w.until){fiveDoorDamage(w.src,w.t,40);list.splice(i,1);}
   }
  }
 }
 for(const u of G.units){if(!exAlive(u))continue;
  if(u.fiveNet&&G.time>=u.fiveNet.next){u.fiveNet.next=G.time+.5;if(u.fac==='X')u.fiveNet=null;else dealDamage(u.fiveNet.src,u,10,{fiveWeapon:'netCut'});}
  if(u.fiveNeedles?.length){const due=u.fiveNeedles.filter(s=>s.at<=G.time);u.fiveNeedles=u.fiveNeedles.filter(s=>s.at>G.time);for(const s of due)dealDamage(s.src,u,s.dmg,{fiveWeapon:'needleBurst'});}
  if(u.fiveHiding){
   if(G.time-u.fiveHideSince>=12){const hide=G.units.find(v=>exAlive(v)&&v.key==='dr_hide');if(hide)fiveExitHide(u,hide);}
   continue;
  }
  if(u.fiveAssimilating){const a=u.fiveAssimilating,t=a.target;
   if(!exAlive(t)||!isInfectHost(t)||dist(u.x,u.y,t.x,t.y)>u.r+t.r+12||t.lastHitT!==a.hit)u.fiveAssimilating=null;
   else if(G.time>=a.until){
    interrupt(t);t.fiveOrigin=t.key;t.fac=t.team='th';t.fiveAssimilated=1;t.fiveCellImmune=1;t.fiveHidden=true;t.fiveRevealAt=Infinity;t.atkList=[...t.atkList,...SP.th_carter_human_imitation.atks.filter(d=>d.fiveMove==='assimilate')];t.tgt=t.aggro=null;t.jokerRate=0;G.stats.th.conv++;u.fiveAssimilating=null;
   }
  }
  if(u.sp.five?.flags.includes('fragment')&&u.fac==='th'){
   const parent=G.units.find(v=>v!==u&&exAlive(v)&&v.fac==='th'&&v.sp.five&&!v.sp.five.flags.includes('fragment')&&v.hp<v.mhp&&dist(u.x,u.y,v.x,v.y)<u.r+v.r+8);
   if(parent){parent.hp=Math.min(parent.mhp,parent.hp+u.hp);u.gone=true;continue;}
  }
  if(u.key==='dr_eyes'&&G.time>=(u.fiveEyeTick||0)){
   u.fiveEyeTick=G.time+.2;
   for(const t of G.units)if(exAlive(t)&&hostileTo(u,t)&&!t.fiveHiding&&dist(u.x,u.y,t.x,t.y)<300&&canSee(t,u))fiveDoorDamage(u,t,10);
  }
 }
}
function fiveInitRules(){
 doomWorldInit();
 canonWorldInit();
 G.fiveCasts=[];G.fiveWarnings=[];G.fiveScreeches=[];G.fiveHides=[];G.fiveMines=[];
 if(!facOn('dr'))return;
 for(const prop of G.map.props||[])if(prop.type==='bed'){
  const p=exPoint(prop.x,prop.y+TILE);if(p)G.fiveHides.push({x:p.x,y:p.y,prop,occupant:null});
 }
}
function fiveReact(u){
 if(!['human','dog','cat'].includes(u.key))return false;
 const danger=G.units.find(v=>exAlive(v)&&['dr_rush','dr_ambush','dr_a_60','dr_a_120'].includes(v.key)&&v.atk&&dist(u.x,u.y,v.x,v.y)<500);
 if(u.fiveHiding){if(!danger&&!G.units.some(v=>v.fiveRush&&dist(u.x,u.y,v.x,v.y)<500)&&G.time-u.fiveHideSince>2)fiveExitHide(u);return true;}
 if(danger&&(u.fiveHideBlockedUntil||0)<=G.time){
  const spots=(G.fiveHides||[]).filter(s=>!s.occupant&&dist(u.x,u.y,s.x,s.y)<220);spots.sort((a,b)=>dist(u.x,u.y,a.x,a.y)-dist(u.x,u.y,b.x,b.y));
  if(spots[0]){if(!fiveEnterHide(u,spots[0]))setDest(u,spots[0].x,spots[0].y);return true;}
 }
 return false;
}
function drawFiveRuleState(u){
 if(u.fiveHiding){ctx.save();ctx.strokeStyle='#bba88f';ctx.strokeRect(u.x-8,u.y*SQ-16,16,16);ctx.restore();return;}
 if(fiveIsMarauder(u)&&fiveMarauderOpen(u)){ctx.save();ctx.fillStyle='#70ff78';ctx.beginPath();ctx.arc(u.x+renderFacing(u)*10,u.y*SQ-u.z-42,4,0,TAU);ctx.fill();ctx.restore();}
}
function fiveRollDamage(u,m,fallback){
 const key=u.key.replace(/^dm_/,''),spec={zombieman:[3,5],shotgun_guy:[3,5],chaingunner:[3,5],imp_classic:[3,8],pinky_classic:[4,10],spectre_classic:[4,10],cacodemon_classic:[5,8],baron_of_hell_classic:[8,8],hell_knight_classic:[8,8],revenant_classic:[10,8],mancubus_classic:[8,8],arachnotron_classic:[5,8]}[key];
 if(key==='cacodemon_classic'&&m==='bite')return 10*(1+Math.floor(Math.random()*6));
 if(['baron_of_hell_classic','hell_knight_classic'].includes(key)&&m==='claw')return 10*(1+Math.floor(Math.random()*8));
 if(key==='revenant_classic'&&m==='punch')return 6*(1+Math.floor(Math.random()*10));
 return spec?spec[0]*(1+Math.floor(Math.random()*spec[1])):fallback;
}

function fiveCanonicalDefinition(r,m,d){
 if(FIVE_DOOR_DAMAGE[r.key]!=null&&d.dmg>0)d.dmg=FIVE_DOOR_DAMAGE[r.key];
 if(r.key==='dm_zombieman'&&m==='rifle')d.volley=1;
 if(r.key==='dm_shotgun_guy'&&m==='shotgun')d.volley=3;
 if(r.key==='dm_chaingunner'&&m==='chaingun')d.volley=2;
 if(['dm_zombieman','dm_shotgun_guy','dm_chaingunner'].includes(r.key)&&d.fiveShot)d.maxR=2048;
 if(r.key==='dm_arch_vile_classic'&&m==='hellfire')d.maxR=1088;
 if(r.key==='dm_arch_vile_classic'&&m==='resurrect')d.windup=1.2;
 return d;
}
function fiveClassicHitscan(u,d,a){
 if(!['dm_zombieman','dm_shotgun_guy','dm_chaingunner'].includes(u.key))return false;
 const target=a.tgt,angle=target?angTo(u.x,u.y,target.x,target.y):u.faceA;
 for(let i=0;i<(d.volley||1);i++){
  const theta=angle+(Math.random()-Math.random())*.13,range=d.maxR||2048;
  let hit=null,x=u.x,y=u.y;
  for(let step=u.r+3;step<range;step+=4){
   x=u.x+Math.cos(theta)*step;y=u.y+Math.sin(theta)*step;if(!walkAtPx(x,y))break;
   hit=G.units.find(t=>exAlive(t)&&t!==u&&hostileTo(u,t)&&dist(x,y,t.x,t.y)<t.r+2);if(hit)break;
  }
  (G.beams||(G.beams=[])).push({x:u.x,y:u.y,tx:x,ty:y,t:.06,w:1,col:'#ffd9b0'});
  if(hit)dealDamage(u,hit,fiveRollDamage(u,d.fiveShot,d.dmg),{fiveWeapon:d.fiveShot});
 }
 return true;
}
function drawFiveRuleFields(){
 drawCanonWorld();
 ctx.save();
 for(const m of G.fiveMines||[]){ctx.fillStyle=G.time<m.armed?'#a9b0b5':'#fb7664';ctx.beginPath();ctx.ellipse(m.x,m.y*SQ,7,4,0,0,TAU);ctx.fill();}
 for(const w of G.fiveWarnings||[]){if(!exAlive(w.t))continue;ctx.fillStyle=G.time<w.start+.6?'#ecc968':'#ed5252';ctx.beginPath();for(let i=0;i<8;i++){const a=Math.PI/8+i*TAU/8,x=w.t.x+Math.cos(a)*13,y=w.t.y*SQ-50+Math.sin(a)*13;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.fillText('STOP',w.t.x,w.t.y*SQ-47);}
 for(const u of G.units)if(exAlive(u)&&u.fiveNet){ctx.strokeStyle='#c7c5bc';ctx.lineWidth=1;for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(u.x-12,u.y*SQ-20+i*4);ctx.lineTo(u.x+12,u.y*SQ-20+i*4+12);ctx.moveTo(u.x-12,u.y*SQ-20+i*4+12);ctx.lineTo(u.x+12,u.y*SQ-20+i*4);ctx.stroke();}}
 ctx.restore();
}
