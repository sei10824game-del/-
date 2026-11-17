/* One hero per edition. Arena strength profiles, NOT canonical numeric stats.
 * Keep ammunition, walls, shields, post-hit i-frames and death meaningful. */
const SL_HERO_PROFILES={
 classic:{hp:20,armor:10,damage:5.1,taken:.35,speed:1.2,tempo:1.3},
 modern:{hp:40,armor:15,damage:8.5,taken:.2,speed:1.35,tempo:1.6},
 mini:{hp:20,armor:10,damage:6.8,taken:.3,speed:1.25,tempo:1.4}
};
function slHeroProfile(era){return SL_HERO_PROFILES[era==='mini'?'mini':['praetor','eternal','dark','vfr'].includes(era)?'modern':'classic'];}
for(const key of SL_ROSTER)SP[key].superArmor=1;
function slHeroInit(u){
 if(!u.sp.slUnit||u.slPower)return;
 u.slPower=Object.freeze({...slHeroProfile(u.sp.slEra)});const p=u.slPower;
 u.hp*=p.hp;u.mhp*=p.hp;u.slArmor*=p.armor;u.slArmorMax=u.sp.slArmorMax*p.armor;
 u.dmgMul=(u.dmgMul||1)*p.damage;u.walkSpd*=p.speed;u.runSpd*=p.speed;
 // Do not turn special charges, fuel or cooldowns into infinite resources.
 if(u.sp.slEra!=='mini')for(const key of ['bullet','shell','rocket','cell','grenade','bfg','skull','spike','fuel','water','bot','extinguisher']){u.slAmmo[key]*=3;u.slMax[key]*=3;}
}
function slHeroChoose(u,t){
 const dd=dist(u.x,u.y,t.x,t.y),ammoLow=Object.keys(u.slMax).some(k=>['bullet','shell','cell','rocket'].includes(k)&&u.slAmmo[k]<u.slMax[k]*.25);
 let best=null,score=-Infinity;
 for(const d of u.atkList){
  if(!canUse(u,d,t))continue;const k=d.slKind;
  if(['dash','hook','telefrag'].includes(k)&&dd<100)continue;
  if(k==='extinguish'&&!t.slBurn)continue;
  if(k==='holo'&&u.hp>u.mhp*.65)continue;
  if(['parry','gunShield','artifact'].includes(k)&&!t.atk&&u.hp>u.mhp*.65)continue;
  if(['collar','grabber'].includes(k))continue; // reaction branch below
  if(d.slWeapon==='saw'&&!ammoLow&&dd>50)continue;
  if(['rocket','homing','grenade','bfg'].includes(k)&&dd<85)continue;
  const pellets=k==='hitscan'?Math.min(12,d.slCount||1):1;
  let s=(d.dmg||0)*pellets/Math.max(.3,(d.windup+d.active+d.rec)/(u.slPower?.tempo||1));
  if(k==='flame'&&u.slArmor<u.slArmorMax*.4)s+=4000;
  if(k==='glory')s+=u.hp<u.mhp*.95?10000:500;
  if(d.slWeapon==='saw'&&ammoLow)s+=8000;
  if(['parry','gunShield','artifact'].includes(k))s+=2000;
  if(['dash','hook','telefrag'].includes(k))s+=dd>450?1500:-100;
  if(k==='holo')s+=1500;
  if(s>score){score=s;best=d;}
 }
 // Catching an actual valid energy shot is preferable to absorbing it.
 const grab=u.atkList.find(d=>d.slKind==='grabber'&&canUse(u,d,t));return grab||best;
}
function thinkSlayerHero(u){
 if(!exCanAct(u))return;
 if(u.sp.slEra==='mini'){thinkMonster(u);return;}
 const t=exAlive(u.tgt)&&hostileTo(u,u.tgt)?u.tgt:acquireTarget(u,750);u.tgt=t;
 if(t){
  u.faceA=angTo(u.x,u.y,t.x,t.y);
  if(losWalk(u.x,u.y,t.x,t.y,1)){const d=slHeroChoose(u,t);if(d){u.dest=null;u.path=null;startAttack(u,d,t);return;}}
  setDest(u,t.x,t.y);return;
 }
 const pick=slWorld().pickups.find(p=>dist(u.x,u.y,p.x,p.y)<250&&(u.hp<u.mhp*.8||u.slArmor<u.slArmorMax*.5));
 if(pick){setDest(u,pick.x,pick.y);return;}
 thinkMonster(u);
}
function slHeroText(u){const p=u.slPower;return p?'｜主人公強化 HP×'+p.hp+' / 火力×'+p.damage+' / 被害×'+p.taken:'';}
