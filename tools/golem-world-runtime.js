/* Upstream predicates, events and world interactions. See GOLEM_COMPLETION.md. */
function golemWorld(){return G.golemWorld||(G.golemWorld={clock:6000,weather:'clear',tiles:new Map(),bag:{},tick:0,carry:0});}
function golemCell(x,y){const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);return {tx,ty,key:ty*G.map.w+tx,x:(tx+.5)*TILE,y:(ty+.5)*TILE};}
function golemTile(x,y){return golemWorld().tiles.get(golemCell(x,y).key);}
function golemPut(x,y,block,extra={}){
 const p=golemCell(x,y);if(!walkAtPx(p.x,p.y))return false;
 golemWorld().tiles.set(p.key,{...p,block,...extra});return true;
}
function golemExposed(u){const room=G.map.rooms[G.map.roomOf?.[golemCell(u.x,u.y).key]];return room?.golemOpenSky===true;} // The mansion is roofed unless explicitly opened by the operator.
function golemWet(u){return !!golemTile(u.x,u.y)?.water||(golemExposed(u)&&golemWorld().weather!=='clear');}
function golemVariant(u,b){const v=u.restVariant||0,r=b.variant;return r==null||(typeof r==='number'?v===r:v>=(r.min??-Infinity)&&v<=(r.max??Infinity));}
function golemPredicate(u,value){
 const w=golemWorld(),day=w.clock%24000<12000,wet=golemWet(u);
 const p={always:true,never:false,day,night:!day,wet,dry:!wet,clear:!golemExposed(u)||w.weather==='clear',rain:golemExposed(u)&&w.weather!=='clear',thunder:golemExposed(u)&&w.weather==='thunder',fuel:u.restFuel>0,fuel_empty:!(u.restFuel>0),baby:!!u.restBaby,adult:!u.restBaby,ammo:u.golemAmmo>0,ammo_empty:!(u.golemAmmo>0),fuse_lit:u.golemFuse!=null,fuse_unlit:u.golemFuse==null};
 return (Array.isArray(value)?value:[value||'always']).every(k=>p[k]===true);
}
function golemNumber(v,fallback=0){if(typeof v==='number')return v;if(v?.value!=null)return golemNumber(v.value,fallback);if(v?.min_inclusive!=null)return Math.floor(rnd(v.min_inclusive,v.max_inclusive+1));return fallback;}
function golemTargets(u,target,enemy,radius=2){if(target==='self'||!target)return [u];if(target==='area')return G.units.filter(t=>t!==u&&exAlive(t)&&dist(u.x,u.y,t.x,t.y)<=radius*TILE+t.r);return exAlive(enemy||u.tgt)?[enemy||u.tgt]:[];}
function golemEffect(u,e,src){
 if(!exAlive(u))return;const id=e.id.replace('minecraft:',''),amp=e.amplifier||0,ticks=e.duration??1;
 if(id==='instant_health'){u.hp=Math.min(u.mhp,u.hp+(4<<amp));return;}
 if(id==='instant_damage'){dealDamage(src,u,6<<amp,{golemEffect:true,magic:true});return;}
 const effects=u.golemEffects||(u.golemEffects={}),old=effects[id];
 const next={amp,until:G.time+ticks/20,remaining:ticks,src};
 effects[id]=golemMergeEffect(old,next);
 if(id==='jump_boost'){const live=effects[id];u.restJumpEffect={until:live.until,amplifier:live.amp};}
}
function golemActive(u,id){const e=u?.golemEffects?.[id];return e&&e.until>G.time?e:null;}
function golemEffectSpeed(u){const slow=golemActive(u,'slowness'),fast=golemActive(u,'speed');return Math.max(0,1-(slow?.amp+1||0)*.15+(fast?.amp+1||0)*.2);}
function golemDamage(att,tgt,dmg,o){
 const immunity=REST_GOLEM_DATA[tgt.key]?.data.attributes?.immune||[];
 const fire=o.fire||o.golemFire||o.burn;
 if(fire&&(golemActive(tgt,'fire_resistance')||immunity.some(k=>/on_fire|in_fire|lava/.test(k))))return 0;
 if(att&&o.golemMelee){const strength=golemActive(att,'strength'),weak=golemActive(att,'weakness');dmg=Math.max(0,dmg+(strength?3*(strength.amp+1):0)-(weak?4*(weak.amp+1):0));}
 const res=golemActive(tgt,'resistance');if(res)dmg*=Math.max(0,1-(res.amp+1)*.2);return dmg;
}
function golemApply(u,a){
 let changed=false;
 if(a.golem){const key='eg_'+a.golem.split(':').pop();if(key!==u.key&&SP[key]){
  const oldHp=u.hp,oldDefault=u.sp.name;u.key=key;u.sp=SP[key];u.mhp=SP[key].hp;u.hp=Math.min(u.mhp,oldHp);u.atkList=SP[key].atks.map(d=>({...d}));u.pal={...SP[key].pal};u.walkSpd=SP[key].walk;u.runSpd=SP[key].run;u.restVariant=0;if(u.name===oldDefault)u.name=SP[key].name;u.golemChanges=(u.golemChanges||0)+1;changed=true;
 }}
 if(a.variant!=null){const n=golemNumber(a.variant);changed=changed||u.restVariant!==n;u.restVariant=n;}
 if(a.cycle){u.restVariant=(u.restVariant||0)+1;u.restVariant%=REST_GOLEM_DATA[u.key]?.data.variants||1;changed=true;}
 return changed;
}
function golemIgnite(u,b){if(u.golemFuse==null&&!golemWet(u)){u.golemFuse=b.fuse??60;u.dest=null;u.path=null;return true;}return false;}
function golemExplosion(u,b){
 if(u.golemDetonated)return;u.golemDetonated=true;const power=b.radius??2,r=power*2*TILE;
 addShock(u.x,u.y,10,r,'rgba(255,190,80,.9)');addFire(u.x,u.y,15,30);Sfx.play('boom',u.x,u.y);addShake(12);
 for(const t of G.units.slice())if(t!==u&&exAlive(t)){const d=dist(u.x,u.y,t.x,t.y);if(d>r||!losWalk(u.x,u.y,t.x,t.y,3))continue;const impact=1-d/r;dealDamage(u,t,Math.floor((impact*impact+impact)/2*7*(power*2)+1),{explosion:true,kdir:angTo(u.x,u.y,t.x,t.y),kpow:impact*280});}
 if(exAlive(u)){u.hp=0;u.restDissolved=true;killUnit(u,u,{gib:true,noRise:true});}
}
function golemPlace(u,b,enemy){
 const target=b.position==='enemy'?enemy||u.tgt:u;if(!target)return false;
 const choices=Array.isArray(b.block)?b.block:[b.block],picked=rpick(choices),name=typeof picked==='string'?picked:picked?.Name;
 if(!name)return false;const tile=golemTile(target.x,target.y);if(tile?.block&&tile.block!=='air')return false;
 // Surviving plant blocks need dry solid ground; water plants and Nether substrates are not silently synthesized.
 if(b.must_survive!==false){
  const soil=tile?.substrate||((G.village?.fields||[]).some(f=>dist(f.x,f.y,target.x,target.y)<TILE)?'farmland':'mansion_floor');
  if(tile?.water)return false;
  if(/nether_wart$/.test(name)&&soil!=='soul_sand')return false;
  if(/dandelion|poppy|orchid|allium|bluet|tulip|daisy|cornflower|lily/.test(name)&&!['grass_block','dirt','coarse_dirt','podzol','rooted_dirt','moss_block','farmland'].includes(soil))return false;
 }
 return golemPut(target.x,target.y,name.replace('minecraft:',''),{substrate:tile?.substrate,properties:picked?.Properties||picked?.properties||{},source:u.id});
}
function golemTrigger(u,trigger,enemy,options={}){
 if(!u?.sp||!REST_GOLEM_DATA[u.key])return;
 for(const b of restBehaviors(u).slice()){
  if(!golemVariant(u,b))continue;
  if(b.type==='golems:explode'){
   if(trigger==='death')golemExplosion(u,b);
   else if(trigger==='hurt'&&(options.fire||options.golemFire||rchance(b.hurt_chance||0)))golemIgnite(u,b);
   else if(trigger==='attack'&&((enemy?.golemBurn||0)>0||rchance(b.attack_chance||0)))golemIgnite(u,b);
   continue;
  }
  if(!['golems:effect','golems:set_fire','golems:update_golem','golems:place','golems:summon'].includes(b.type))continue;
  if((b.trigger||'tick')!==trigger||!golemPredicate(u,b.predicate)||!rchance(b.chance??1))continue;
  if(b.type==='golems:effect'){
   const a=b.apply,list=Array.isArray(a.effect)?a.effect:[a.effect],rolls=golemNumber(a.rolls),chosen=rolls>0?Array.from({length:rolls},()=>rpick(list)):list;
   for(const t of golemTargets(u,a.target,enemy,a.radius))for(const e of chosen)golemEffect(t,e,u);
  }else if(b.type==='golems:set_fire'){
   for(const t of golemTargets(u,b.target,enemy,b.radius)){t.golemBurn=Math.max(t.golemBurn||0,golemNumber(b.seconds,3));t.golemBurnSrc=u;}
  }else if(b.type==='golems:update_golem'){
   if(golemApply(u,b.apply))break; // Do not run the old material's remaining rules after transformation.
  }else if(b.type==='golems:place')golemPlace(u,b,enemy);
  else if(b.type==='golems:summon')golemSummon(u,b,enemy);
 }
}
function golemUseItem(u,item,bag){
 if(!exAlive(u))return false;item=item.replace('minecraft:','');
 for(const b of restBehaviors(u))if(b.type==='golems:item_update_golem'&&golemVariant(u,b)&&golemPredicate(u,b.predicate)){
  const match=b.item?.replace('minecraft:','');if(match&&(match==='#axes'?!/^(wooden|stone|iron|golden|diamond|netherite)_axe$/.test(item):match!==item))continue;
  if(b.consume&&(!bag||!(bag[item]>0)))return false;
  if(!rchance(b.chance??1)||!golemApply(u,b.apply))return false;
  if(b.consume)bag[item]--;addShock(u.x,u.y,5,32,'#e4c478');return true;
 }return false;
}
function golemAoe(u,b){
 if(b.type==='golems:aoe_grow'){
  for(const f of G.village?.fields||[])if(dist(u.x,u.y,f.x,f.y)<=(b.radius??3)*TILE&&f.growth<1&&rchance(b.chance??.05))f.growth=Math.min(1,f.growth+(b.amount==null?Math.floor(rnd(2,6)):golemNumber(b.amount))/7);
  return;
 }
 const w=golemWorld(),r=(b.radius??3)*TILE;
 for(const t of w.tiles.values())if(dist(u.x,u.y,t.x,t.y)<=r){
  if(b.type==='golems:aoe_dry'&&t.water){t.water=false;if(/^(kelp|kelp_plant|seagrass|tall_seagrass)$/.test(t.block)){t.drops=t.drops||{};t.drops[t.block]=(t.drops[t.block]||0)+1;t.block='air';}if(t.block==='water')t.block='air';t.waterlogged=false;}
  if(b.type==='golems:aoe_freeze'&&t.water&&t.block==='water'){t.water=false;t.block=b.frosted?'frosted_ice':'ice';}
 }
}
function golemTickEffects(u){
 for(const [id,e] of Object.entries(u.golemEffects||{})){
  if(e.until<=G.time){if(e.hidden&&e.hidden.until>G.time)u.golemEffects[id]=e.hidden;else delete u.golemEffects[id];continue;}
  const level=e.amp+1;
  if(id==='regeneration'&&e.remaining%Math.max(1,50>>e.amp)===0)u.hp=Math.min(u.mhp,u.hp+1);
  if(id==='poison'&&e.remaining%Math.max(1,25>>e.amp)===0&&u.hp>1)dealDamage(e.src,u,Math.min(1,u.hp-1),{golemEffect:true,magic:true});
  if(id==='wither'&&e.remaining%Math.max(1,40>>e.amp)===0)dealDamage(e.src,u,1,{golemEffect:true,magic:true});
  if(id==='levitation'&&!u.leap){u.golemVz=(u.golemVz||0)+(.05*level-(u.golemVz||0))*.2;u.z=Math.max(0,(u.z||0)+u.golemVz*TILE);}
  e.remaining--; // planar vertical adapter, not a new ground slow
 }
 if(u.golemBurn>0){if(golemWet(u)||golemActive(u,'fire_resistance'))u.golemBurn=0;else{u.golemBurn=Math.max(0,u.golemBurn-.05);u.golemBurnTicks=(u.golemBurnTicks||0)+1;if(u.golemBurnTicks%20===0)dealDamage(u.golemBurnSrc||null,u,1,{golemFire:true,fire:true});}}
}
function golemWorldUpdate(dt){
 const w=golemWorld();w.clock=(w.clock+dt*20)%24000;w.carry+=dt*20;
 while(w.carry>=1){w.carry--;w.tick++;
  for(const u of G.units.slice()){
   if(!exAlive(u))continue;golemTickEffects(u);
   if(!exAlive(u))continue;
   if(u.key==='mcHoneyBee'){golemBeeTick(u);continue;}
   if(!REST_GOLEM_DATA[u.key])continue;
   golemTrigger(u,'tick');
   for(const b of restBehaviors(u)){
    if(!golemVariant(u,b))continue;
    if(b.type.startsWith('golems:aoe_')&&w.tick%(b.interval??4)===0)golemAoe(u,b);
    if(b.type==='golems:burn_in_sun'&&golemPredicate(u,'day')&&golemExposed(u)&&w.weather==='clear'&&!u.golemHelmet&&rchance(b.chance??.25))u.golemBurn=Math.max(u.golemBurn||0,3);
    if(b.type==='golems:explode'){
     if(golemWet(u)){u.golemFuse=null;}else if(u.golemFuse!=null){u.dest=null;u.path=null;if(--u.golemFuse<0)golemExplosion(u,b);}
    }
   }
  }
 }
}
function golemLight(u){let n=0;for(const b of restBehaviors(u))if(b.type==='golems:light'&&golemVariant(u,b))n=Math.max(n,b.light??15);return n;}
function golemThink(u){
 if(!REST_GOLEM_DATA[u.key])return false;
 if(u.golemFuse!=null){u.dest=null;u.path=null;return true;}
 if(restBehaviors(u).some(b=>b.type==='golems:burn_in_sun')&&golemExposed(u)&&golemPredicate(u,'day')){const r=G.map.rooms.find(r=>!r.golemOpenSky);if(r){setDest(u,r.cx*TILE,r.cy*TILE);return true;}}
 if(u.tgt&&exAlive(u.tgt))return false;
 for(const b of restBehaviors(u))if(golemVariant(u,b)){
  if(b.type==='golems:follow'){
   const v=exAlive(u.golemFollowTarget)?u.golemFollowTarget:G.units.find(t=>exAlive(t)&&t.key==='mcVillager'&&!golemActive(t,'invisibility')&&Math.abs(t.x-u.x)<=8*TILE&&Math.abs(t.y-u.y)<=8*TILE);
   if(v){u.golemFollowTarget=v;const d=dist(u.x,u.y,v.x,v.y);if(d>4*TILE){u.golemFollowing=true;setDest(u,v.x,v.y);}else{u.golemFollowing=false;u.dest=null;u.path=null;u.golemFollowTarget=null;}return true;}
  }
  if(b.type==='golems:tempt'){
   const t=G.units.find(t=>exAlive(t)&&t.golemHeldItem&&t.golemHeldBag?.[t.golemHeldItem]>0&&/^(coal|charcoal)$/.test(t.golemHeldItem)&&dist(u.x,u.y,t.x,t.y)<10*TILE);
   if(t){if(dist(u.x,u.y,t.x,t.y)>2.5*TILE)setDest(u,t.x,t.y);else{u.dest=null;u.path=null;}return true;}
  }
 }
 return false;
}
function golemCanUse(u,d){return !(d.golemSting&&u.golemStung)&&!(d.golemShot&&!(u.golemAmmo>0))&&u.golemFuse==null;}
function golemFire(u,d,a){
 if(d.golemSting){golemBeeSting(u,a.tgt);return true;}
 if(!d.golemShot)return false;if(!(u.golemAmmo>0)||!exAlive(a.tgt)||!losWalk(u.x,u.y,a.tgt.x,a.tgt.y,3))return true;
 const ax=a.tgt.x-u.x,ay=a.tgt.y-u.y,den=ax*ax+ay*ay;
 for(const v of G.units)if(v!==u&&v!==a.tgt&&exAlive(v)){const f=((v.x-u.x)*ax+(v.y-u.y)*ay)/(den||1);if(f>0&&f<1&&dist(v.x,v.y,u.x+ax*f,u.y+ay*f)<v.r+3)return true;}
 u.golemAmmo--;
 // The arrow keeps its own physical projectile; a fire charge is not a generic rocket.
 if(d.golemShot==='arrows'){
  const z=(u.z||0)+unitTopY(u)*.55,dx=a.tgt.x-u.x,dy=a.tgt.y-u.y,dz=(a.tgt.z||0)+unitTopY(a.tgt)/3-z+Math.hypot(dx,dy)*.2,len=Math.hypot(dx,dy,dz)||1,speed=1.6*TILE*20;
  G.projs.push({kind:'golemArrow',x:u.x,y:u.y,z,vx:dx/len*speed,vy:dy/len*speed,vz:dz/len*speed,src:u,team:u.fac,t:0,life:60,baseDamage:d.dmg*(u.restBaby?.5:1)});
 }
 else{const a2=angTo(u.x,u.y,a.tgt.x,a.tgt.y);G.projs.push({kind:'golemCharge',src:u,team:u.fac,x:u.x,y:u.y,z:24,vx:Math.cos(a2)*320,vy:Math.sin(a2)*320,t:0,life:6,dmg:5,style:'fireball'});}return true;
}
function golemSummon(u,b,enemy){
 if(b.entity==='minecraft:item'){
  const id=/id:\"minecraft:([^\"]+)\"/.exec(b.nbt||'')?.[1];if(!id)return;
  const w=golemWorld(),p=golemCell(u.x,u.y);const tile=w.tiles.get(p.key)||{...p,block:'air'};tile.drops=tile.drops||{};tile.drops[id]=(tile.drops[id]||0)+(b.amount||1);w.tiles.set(p.key,tile);
 }else if(b.entity==='minecraft:bee'){
  for(let i=0;i<(b.amount||1);i++){const v=spawnUnit('mcHoneyBee',u.x+rnd(-.5,.5)*TILE,u.y+rnd(-.5,.5)*TILE,{force:true});if(v){v.tgt=enemy||u.tgt;v.golemBeeTarget=v.tgt;}}
 }else if(b.entity==='minecraft:lightning_bolt'){
  addFlash(u.x,u.y,300,'230,240,255',1,.3);golemTrigger(u,'lightning');
  for(const t of G.units.slice())if(exAlive(t)&&dist(u.x,u.y,t.x,t.y)<3*TILE){t.golemBurn=8;dealDamage(u,t,5,{golemEffect:true,magic:true});}
 }
}
function golemBeeThink(u){
 if(u.key!=='mcHoneyBee')return false;
 const t=u.golemBeeTarget;if(!u.golemStung&&exAlive(t)){u.tgt=t;if(dist(u.x,u.y,t.x,t.y)>u.r+t.r+8)setDest(u,t.x,t.y);else{golemBeeSting(u,t);}}else{u.tgt=null;if(!u.dest||dist(u.x,u.y,u.dest.x,u.dest.y)<10){const p=exPoint(u.x+rnd(-100,100),u.y+rnd(-100,100));if(p)setDest(u,p.x,p.y);}}return true;
}
function golemBeeTick(u){if(u.golemStung){u.golemStingTicks++;if(u.golemStingTicks%5===0&&Math.floor(rnd(0,clamp(1200-u.golemStingTicks,1,1200)))===0){u.hp=0;killUnit(null,u,{noRise:true});}}}
function golemDrawBee(u){
 ctx.save();ctx.translate(u.x,u.y*SQ-(u.z||0)-14);ctx.rotate(u.faceA);ctx.fillStyle='rgba(220,240,255,.7)';for(const s of [-1,1]){ctx.beginPath();ctx.ellipse(-2,s*(7+Math.sin(G.time*45)*2),7,4,s*.4,0,TAU);ctx.fill();}ctx.fillStyle=visualMaterial('#e9ba35',-11,-6,22,12);ctx.beginPath();ctx.ellipse(0,0,11,6,0,0,TAU);ctx.fill();ctx.fillStyle='#342d21';ctx.fillRect(-6,-5,3,10);ctx.fillRect(0,-5.5,3,11);ctx.fillStyle='#171c1b';ctx.fillRect(7,-4,3,3);ctx.fillRect(7,1,3,3);if(!u.golemStung){ctx.beginPath();ctx.moveTo(-10,-2);ctx.lineTo(-15,0);ctx.lineTo(-10,2);ctx.fill();}ctx.restore();
}
function golemDrawTiles(){
 const w=G.golemWorld;if(!w)return;
 for(const t of w.tiles.values()){
  const x=t.x,y=t.y*SQ,b=t.block;ctx.save();
  if(t.water||/ice/.test(b)){ctx.fillStyle=t.water?'rgba(65,145,210,.5)':'rgba(165,220,245,.8)';ctx.fillRect(x-TILE/2,y-TILE*SQ/2,TILE,TILE*SQ);}
  else if(b==='redstone_wire'){ctx.strokeStyle=t.power>0?'#fa4636':'#713026';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-TILE/2,y);ctx.lineTo(x+TILE/2,y);ctx.moveTo(x,y-TILE*SQ/2);ctx.lineTo(x,y+TILE*SQ/2);ctx.stroke();}
  else if(b==='redstone_lamp'){ctx.fillStyle='#574333';ctx.fillRect(x-10,y-7,20,14);ctx.fillStyle=t.powered?'#ffe69a':'#8b6847';ctx.fillRect(x-7,y-5,14,10);}
  else if(b!=='air'){ctx.fillStyle=/sculk/.test(b)?'#144f50':/mushroom/.test(b)?'#bf5b49':/fungus|wart/.test(b)?'#926c9c':'#568443';ctx.fillRect(x-7,y-5,14,10);if(/flower|poppy|tulip|dandelion|orchid|allium|daisy|cornflower|lily/.test(b)){ctx.fillStyle='#e4bb70';ctx.beginPath();ctx.arc(x,y-3,4,0,TAU);ctx.fill();}}
  if(t.drops){ctx.fillStyle='#c394f0';ctx.beginPath();ctx.moveTo(x,y-9);ctx.lineTo(x+5,y-3);ctx.lineTo(x,y+3);ctx.lineTo(x-5,y-3);ctx.closePath();ctx.fill();}ctx.restore();
 }
}
function golemPrepareSpecies(){
 for(const [key,record] of Object.entries(REST_GOLEM_DATA)){
  const s=SP[key];if(!s)continue;
  let col=null;if(/^eg_(waxed_)?(exposed_|weathered_|oxidized_)?copper$/.test(key))col=/oxidized/.test(key)?'#479b84':/weathered/.test(key)?'#6c9a84':/exposed/.test(key)?'#a57963':'#be7553';
  if(/coral/.test(key))col=/dead_/.test(key)?'#797975':/brain/.test(key)?'#ce6597':/bubble/.test(key)?'#ac5eae':/fire/.test(key)?'#c34b55':/horn/.test(key)?'#c9bd43':'#4778bd';
  if(col)for(const name of ['skin','cloth']){s.pal[name]=col;s.pal[name+'D']=shade(col,-.3);s.pal[name+'L']=shade(col,.25);}
  s.atks=s.atks.filter(d=>!['冷気の波','爆発衝撃','矢の射撃','火球'].includes(d.n));
  for(const b of record.data.brain.behaviors||[]){if(b.type==='golems:shoot_arrows')s.atks.push(AT({n:'矢の射撃',type:'proj',projKind:'bullet',golemShot:'arrows',dmg:b.damage||2,maxR:32*TILE,minR:3.5*TILE,windup:.25,active:.1,rec:.25,cd:b.attack_interval/20,anim:'launch'}));if(b.type==='golems:shoot_fireballs')s.atks.push(AT({n:'火球',type:'proj',projKind:'fire',golemShot:'fireballs',dmg:5,maxR:32*TILE,minR:3.5*TILE,windup:.25,active:.1,rec:.25,cd:b.attack_interval/20,anim:'launch'}));}
 }
 SP.mcHoneyBee={...SP.crow,name:'ミツバチ（Honeycomb召喚）',ic:'🐝',fac:'vg',ai:'golemBee',hp:10,r:7,walk:96,run:120,mass:.1,unique:0,atks:[AT({n:'刺針',dmg:2,golemSting:true,reach:8,windup:.1,active:.1,rec:.2,cd:.5,anim:'thrust'})],mortal:true,desc:'Honeycomb Golemの被弾で出現。指定された相手を一度刺し、毒を与える。刺針を失った後は時間経過で死亡判定。'};
}
golemPrepareSpecies();
function golemChargeStep(p,dt){
 const steps=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vy)*dt/5));
 for(let i=0;i<steps;i++){
  const nx=p.x+p.vx*dt/steps,ny=p.y+p.vy*dt/steps;
  if(!walkAtPx(nx,ny)){addFire(p.x,p.y,p.z,3);return true;}p.x=nx;p.y=ny;
  for(const t of G.units)if(t!==p.src&&exAlive(t)&&hostileTo(p.src,t)&&dist(p.x,p.y,t.x,t.y)<t.r+5&&Math.abs((t.z||0)-p.z)<70){dealDamage(p.src,t,p.dmg,{fire:true,restProjectile:true});t.golemBurn=Math.max(t.golemBurn||0,5);t.golemBurnSrc=p.src;return true;}
 }return p.t>=p.life;
}
function golemArrowStep(p,dt){
 const n=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vy)*dt/4)),h=dt/n;
 for(let i=0;i<n;i++){
  const x=p.x+p.vx*h,y=p.y+p.vy*h;
  if(!walkAtPx(x,y)||p.z<=0){const cell=golemCell(p.x,p.y),w=golemWorld(),t=w.tiles.get(cell.key)||{...cell,block:'air'};t.drops=t.drops||{};t.drops.arrow=(t.drops.arrow||0)+1;w.tiles.set(cell.key,t);return true;}
  p.x=x;p.y=y;p.z+=p.vz*h;
  for(const t of G.units)if(t!==p.src&&exAlive(t)&&dist(p.x,p.y,t.x,t.y)<t.r+3&&p.z>=(t.z||0)-2&&p.z<(t.z||0)+unitTopY(t)){
   const damage=Math.ceil(Math.hypot(p.vx,p.vy,p.vz)/(20*TILE)*p.baseDamage);dealDamage(p.src,t,damage,{restProjectile:true});return true;
  }
  const drag=Math.pow(.99,h*20);p.vx*=drag;p.vy*=drag;p.vz=p.vz*drag-.05*TILE*400*h;
 }return p.t>=p.life;
}
function golemDrawArrow(p){ctx.save();ctx.translate(p.x,p.y*SQ-p.z);ctx.rotate(Math.atan2(p.vy*SQ-p.vz,p.vx));ctx.strokeStyle='#ac8a62';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(6,0);ctx.stroke();ctx.fillStyle='#acb0b2';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(4,-3);ctx.lineTo(4,3);ctx.fill();ctx.fillStyle='#eee9da';ctx.fillRect(-11,-3,5,2);ctx.fillRect(-11,1,5,2);ctx.restore();}

function golemMergeEffect(old,next){
 if(!old||old.until<=G.time)return next;
 if(old.amp>next.amp){old.hidden=golemMergeEffect(old.hidden,next);return old;}
 if(old.amp===next.amp){if(old.until>=next.until)return old;next.hidden=old.hidden;return next;}
 next.hidden=old.until>next.until?old:old.hidden;return next;
}

function golemBeeSting(u,t){
 if(u.golemStung||!exAlive(t)||dist(u.x,u.y,t.x,t.y)>u.r+t.r+8)return false;
 const hp=t.hp;dealDamage(u,t,2,{golemEffect:true});if(t.hp>=hp)return false;
 golemEffect(t,{id:'minecraft:poison',duration:200},u);u.golemStung=true;u.golemStingTicks=0;u.golemStingAt=G.time;u.tgt=null;u.dest=null;u.path=null;return true;
}
