/* Restored rules. Verified subset only; see RESTORED_ABILITIES.md. */
function restBehaviors(u){return REST_GOLEM_DATA[u.key]?.data.brain?.behaviors||[];}
function restTeleport(u,near){
 for(let i=0;i<16;i++){
  const range=(restBehaviors(u).find(b=>b.type==='golems:teleport')?.radius||32)*TILE;
  let x,y;if(near&&dist(u.x,u.y,near.x,near.y)>=range){const a=angTo(u.x,u.y,near.x,near.y);x=u.x+Math.cos(a)*range*.5+rnd(-.125,.125)*range;y=u.y+Math.sin(a)*range*.5+rnd(-.125,.125)*range;}else{x=near?near.x+rnd(-4,4)*TILE:u.x+rnd(-.5,.5)*range;y=near?near.y+rnd(-4,4)*TILE:u.y+rnd(-.5,.5)*range;}
  if(x<TILE||y<TILE||x>G.map.wpx-TILE||y>G.map.hpx-TILE||!bodyClear(x,y,navigationRadius(u)))continue;
  addShock(u.x,u.y,4,25,'#c9a1ed');u.x=x;u.y=y;u.dest=null;u.path=null;addShock(x,y,4,25,'#c9a1ed');return true;
 }return false;
}
function restHoney(src,t){
 if(!src||!t||src.key!=='eg_honey')return;
 t.restSlow={until:G.time+1.5,mul:.25};golemEffect(t,{id:'minecraft:slowness',amplifier:4,duration:30},src);golemEffect(t,{id:'minecraft:jump_boost',amplifier:-4,duration:70},src);
}
function restOnSpawn(u){
 if(restBehaviors(u).some(b=>b.type==='golems:shoot_arrows'||b.type==='golems:shoot_fireballs'))u.golemAmmo=0;
 if(u.key==='eg_furnace'){u.restFuel=0;u.restFuelTick=0;u.restVariant=1;}
}
function restOnHurt(att,t,dmg,o){
 if(dmg<=0)return;restHoney(t,att);golemTrigger(t,'hurt',att,o);
 if(t.hp>0&&restBehaviors(t).some(b=>b.type==='golems:teleport')){
  const cfg=restBehaviors(t).find(b=>b.type==='golems:teleport');
  const indirect=o.restProjectile||!!FIVE_SHOTS[o.fiveWeapon];
  if(indirect||rchance(cfg.hurt_chance??.6)||(!exAlive(t.tgt)&&rchance(.5))){if(att&&indirect)t.tgt=att;restTeleport(t);}
 }
}
function restOnDeath(u){
 golemTrigger(u,'death');
 if(u.restBaby)return;const split=restBehaviors(u).find(b=>b.type==='golems:split');if(!split||!facOn(u.fac))return;
 for(let i=0;i<split.children;i++){
  const p=exPoint(u.x+(i?1:-1)*12,u.y);if(!p)continue;
  const c=spawnUnit(u.key,p.x,p.y,{force:true,sizeMul:u.sizeMul*.5});if(c){c.restBaby=true;c.tgt=u.tgt;}
 }
}
function restFeedFuel(u,item,count=1){
 if(u.key!=='eg_furnace'||!exAlive(u)||!Number.isSafeInteger(count)||count<1)return false;
 if(item==='water_bucket'){u.restFuel=0;u.restVariant=1;return true;}
 const value=GOLEM_CRAFT_DATA.fuels[item];if(!value)return false;
 const cfg=restBehaviors(u).find(b=>b.type==='golems:use_fuel');if(!cfg||(u.restFuel||0)+value*count>cfg.max_fuel)return false;
 u.restFuel=(u.restFuel||0)+value*count;u.restVariant=0;return true;
}
function restWeapon(u,d){
 if(!u.sp.combineUnit||d.cbAction||d.type!=='proj'||d.projKind!=='bullet')return null;
 if(/ショットガン/.test(d.n))return {id:'shotgun',max:6,cost:/二連/.test(d.n)?2:1,time:3};
 if(/SMG/.test(d.n))return {id:'smg',max:45,cost:d.volley||1,time:2};
 if(/AR2|パルス射撃/.test(d.n))return {id:'ar2',max:30,cost:d.volley||1,time:2};
 return null;
}
function restCanUse(u,d){
 if(!golemCanUse(u,d))return false;
 if(u.key==='eg_furnace'&&!(u.restFuel>0))return false;
 const w=restWeapon(u,d);if(!w)return true;
 const mags=u.restMag||(u.restMag={});if(mags[w.id]==null)mags[w.id]=w.max;
 if(u.restReload)return false;
 if(mags[w.id]<w.cost){u.restReload={id:w.id,until:G.time+w.time,max:w.max};return false;}return true;
}
function restFire(u,d,a){
 if(golemFire(u,d,a))return true;
 if(u.key==='eg_furnace'&&!(u.restFuel>0))return true;
 const w=restWeapon(u,d);if(w){if(!restCanUse(u,d))return true;u.restMag[w.id]-=w.cost;}
 if(d.cbAction==='energy'){
  const t=a.tgt;if(!exAlive(t))return true;
  const angle=angTo(u.x,u.y,t.x,t.y);
  G.projs.push({kind:'combineBall',x:u.x+Math.cos(angle)*(u.r+14),y:u.y+Math.sin(angle)*(u.r+14),z:24,vx:Math.cos(angle)*420,vy:Math.sin(angle)*420,src:u,team:u.fac,t:0,life:4,dmg:d.dmg,hits:new Set()});return true;
 }
 return false;
}
function restBallStep(p,dt){
 const n=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vy)*dt/5));
 for(let i=0;i<n;i++){
  const dx=p.vx*dt/n,dy=p.vy*dt/n;
  if(walkAtPx(p.x+dx,p.y))p.x+=dx;else p.vx=-p.vx;
  if(walkAtPx(p.x,p.y+dy))p.y+=dy;else p.vy=-p.vy;
  for(const t of G.units){
   if(!exAlive(t)||t===p.src||p.hits.has(t.id)||!hostileTo(p.src,t)||dist(p.x,p.y,t.x,t.y)>t.r+9||Math.abs(t.z-p.z)>70)continue;
   p.hits.add(t.id);
   // Strong/unique targets retain their own defenses. Ordinary organic bodies dissolve.
   if(t.sp.mortal&&!t.sp.unique&&!t.sp.exUnique&&(t.sp.mass||1)<4){t.hp=0;t.restDissolved=true;killUnit(p.src,t,{gib:true,noRise:true});}
   else dealDamage(p.src,t,p.dmg,{restProjectile:true,energy:true});
   const a=angTo(t.x,t.y,p.x,p.y);p.vx=Math.cos(a)*420;p.vy=Math.sin(a)*420;
  }
 }if(p.t>=p.life){addShock(p.x,p.y,8,70,'#c4eeff');return true;}return false;
}
function restDrawBall(p){
 ctx.save();ctx.shadowBlur=15;ctx.shadowColor='#c4eeff';ctx.fillStyle='#f4fcff';ctx.beginPath();ctx.arc(p.x,p.y*SQ-p.z,9,0,TAU);ctx.fill();ctx.strokeStyle='#8dd6ff';ctx.lineWidth=3;ctx.stroke();ctx.restore();
}
function restBombTouch(u,t,word='ボマー'){
 if(!exAlive(u)||!exAlive(t)||u.key!=='genthru'||!t.sp.mortal||bomberMember(t)||dist(u.x,u.y,t.x,t.y)>u.r+t.r+12||word!=='ボマー')return false;
 const marks=G.restBombMarks||(G.restBombMarks=[]);
 if(marks.some(b=>b.owner===u&&b.victim===t)||(G.countdownBombs||[]).some(b=>b.owner===u&&b.victim===t))return false;
 marks.push({owner:u,victim:t});addLog('💬 ゲンスルー「ボマー」','bm');restActivateBombs(u);return true;
}
function restExplainBombs(u,targets){
 if(!exAlive(u)||u.key!=='genthru')return false;let heard=false;
 for(const t of targets)if(exAlive(t)&&unitHasHearing(t)&&dist(u.x,u.y,t.x,t.y)<=400){
  (t.restBombKnowledge||(t.restBombKnowledge=new Set())).add(u.id);heard=true;
 }
 if(heard){exReveal(u);addLog('💬 カウントダウン：接触と「ボマー」、能力説明で発動。6000心拍で起爆。術者に触れ「ボマー捕まえた」で解除。','bm',true);restActivateBombs(u);}return heard;
}
function restActivateBombs(owner){
 const marks=G.restBombMarks||[],bombs=G.countdownBombs||(G.countdownBombs=[]);
 for(let i=marks.length-1;i>=0;i--){const m=marks[i];if(m.owner!==owner||!m.victim.restBombKnowledge?.has(owner.id))continue;
  bombs.push({owner,victim:m.victim,beats:6000,due:Infinity,x:m.victim.x,y:m.victim.y});marks.splice(i,1);
 }
}
function restDisarmBomb(t,owner,phrase){
 if(phrase!=='ボマー捕まえた'||!exAlive(t)||!exAlive(owner)||!t.restBombKnowledge?.has(owner.id)||dist(t.x,t.y,owner.x,owner.y)>t.r+owner.r+12)return false;
 const bombs=G.countdownBombs||[],i=bombs.findIndex(b=>b.owner===owner&&b.victim===t);if(i<0)return false;
 bombs.splice(i,1);addLog('💬「ボマー捕まえた」—— カウントダウン解除','bm');return true;
}
function restReleaseBombs(owner,sub,bara,word){
 if(word!=='リリース'||owner.key!=='genthru'||sub?.key!=='bomberSub'||bara?.key!=='bomberBara'||![owner,sub,bara].every(exAlive))return false;
 // Mutual contact, not simply standing within 85px. Structured action represents the thumbs/voice ritual.
 if(dist(owner.x,owner.y,sub.x,sub.y)>owner.r+sub.r+6||dist(owner.x,owner.y,bara.x,bara.y)>owner.r+bara.r+6||dist(sub.x,sub.y,bara.x,bara.y)>sub.r+bara.r+6)return false;
 addLog('💬 三人が親指を合わせ「リリース」','bm',true);restDetonate(owner,true);return true;
}
function restDetonate(owner,force=false){
 const bombs=G.countdownBombs||[];
 for(let i=bombs.length-1;i>=0;i--){const b=bombs[i];if(b.owner!==owner||!force&&(b.beats!=null?b.beats>0:b.due>G.time))continue;
  bombs.splice(i,1);const x=exAlive(b.victim)?b.victim.x:b.x,y=exAlive(b.victim)?b.victim.y:b.y;
  const flower=owner.sp.atks.find(d=>d.n==='リトルフラワー')?.dmg||72;
  if(exAlive(b.victim))dealDamage(owner,b.victim,flower*10,{gib:true,noRise:true,ignoreArmor:true});exBlast(owner,x,y,85,flower,{gib:true});
 }
}
function restThinkBomber(u){
 const marks=(G.restBombMarks||[]).filter(b=>b.owner===u&&exAlive(b.victim));
 if(marks.length){restExplainBombs(u,marks.map(b=>b.victim));return;}
 const active=(G.countdownBombs||[]).some(b=>b.owner===u);
 if(active){const sub=G.units.find(t=>t.key==='bomberSub'&&exAlive(t)),bara=G.units.find(t=>t.key==='bomberBara'&&exAlive(t));
  if(sub&&bara){if(!restReleaseBombs(u,sub,bara,'リリース')){setDest(u,(sub.x+bara.x)/2,(sub.y+bara.y)/2);setDest(sub,u.x,u.y);setDest(bara,u.x,u.y);}return;}
 }
 if(!u.bmHidden){thinkMonster(u);return;}
 const t=G.units.find(t=>exAlive(t)&&t.fac==='N'&&t.sp.mortal&&!bomberMember(t)&&!t.restBombKnowledge?.has(u.id));
 if(t){if(!restBombTouch(u,t))setDest(u,t.x,t.y);return;}thinkPrey(u);
}
function restVictimThink(u){
 const b=(G.countdownBombs||[]).find(b=>b.victim===u&&u.restBombKnowledge?.has(b.owner.id)&&exAlive(b.owner));
 if(!b)return false;if(!restDisarmBomb(u,b.owner,'ボマー捕まえた'))setDest(u,b.owner.x,b.owner.y);return true;
}
function restUpdate(dt){
 golemWorldUpdate(dt);golemPowerNetwork();
 const bombs=G.countdownBombs||[];
 for(const b of bombs){if(exAlive(b.victim)){b.x=b.victim.x;b.y=b.victim.y;
  if(b.beats!=null){const bpm=b.victim.heartRateBpm??(b.victim.panicT>0?140:b.victim.moveSpd>10?110:60);b.beats=Math.max(0,b.beats-dt*bpm/60);}
 }}
 for(const owner of new Set(bombs.filter(b=>b.beats!=null?b.beats<=0:b.due<=G.time).map(b=>b.owner)))restDetonate(owner);
 for(const u of G.units){if(!exAlive(u))continue;
  if(u.restReload&&G.time>=u.restReload.until){u.restMag[u.restReload.id]=u.restReload.max;u.restReload=null;}
  if(u.key==='eg_furnace'){
   const cfg=restBehaviors(u).find(b=>b.type==='golems:use_fuel');u.restFuelTick=(u.restFuelTick||0)+dt*20;
   if(u.restFuelTick>=cfg.burn_time){const n=Math.floor(u.restFuelTick/cfg.burn_time);u.restFuelTick-=n*cfg.burn_time;u.restFuel=Math.max(0,(u.restFuel||0)-n);}
   u.restVariant=u.restFuel>0?0:1;
  }
  if(u.restBaby)continue;
  const cfg=restBehaviors(u).find(b=>b.type==='golems:teleport');
  if(cfg){u.restTeleportTick=(u.restTeleportTick||0)+dt*20;
   while(u.restTeleportTick>=1){u.restTeleportTick--;if(rchance(exAlive(u.tgt)?cfg.target_chance:cfg.idle_chance))restTeleport(u,exAlive(u.tgt)?u.tgt:null);}
  }
 }
}
function restInspector(el,u){
 let box=document.getElementById('restActions');if(!box){box=document.createElement('div');box.id='restActions';el.appendChild(box);}box.innerHTML='';
 const add=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.style.cssText='display:block;margin-top:5px;padding:5px;color:#eee;background:#342e28;border:1px solid #88715c';b.onclick=()=>{if(fn()===false)addLog('操作条件または素材が不足しています。素材・環境操作を確認してください。','sys');updateInspector();};box.appendChild(b);};
 if(u.key==='eg_furnace'){
  const p=document.createElement('div');p.textContent='燃料 '+Math.ceil(u.restFuel||0)+' / 102400 — '+(u.restFuel>0?'稼働':'停止');box.appendChild(p);
  add('在庫の石炭1個を投入',()=>golemInventoryUse(u,'coal',golemWorld().bag));
  add('在庫の水バケツで消火',()=>golemInventoryUse(u,'water_bucket',golemWorld().bag));
 }
 if(u.key==='genthru'){
  add('能力・解除条件を周囲へ説明',()=>restExplainBombs(u,G.units));
  add('接触しているサブ・バラとリリース',()=>restReleaseBombs(u,G.units.find(v=>v.key==='bomberSub'&&exAlive(v)),G.units.find(v=>v.key==='bomberBara'&&exAlive(v)),'リリース'));
 }
 for(const bomb of G.countdownBombs||[])if(bomb.victim===u)add('接触して「ボマー捕まえた」',()=>restDisarmBomb(u,bomb.owner,'ボマー捕まえた'));
 if(u.restReload){const p=document.createElement('div');p.textContent='リロード中 '+Math.max(0,u.restReload.until-G.time).toFixed(1)+'秒';box.appendChild(p);}
 golemInspector(el,u);
}
