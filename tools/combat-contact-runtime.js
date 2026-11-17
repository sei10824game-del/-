/* Collision fixes, not new damage multipliers or immunity bypasses. */
function combatProjectileEnemy(p,t){
 return exAlive(t)&&t!==p.src&&(p.src?(hostileTo(p.src,t)||hostileTo(t,p.src)):t.fac!==p.team);
}
function combatProjectileStep(p,dt){
 if(!['bullet','trident','icebeam','firebeam','rocket'].includes(p.kind))return null;
 const beam=p.kind==='icebeam'||p.kind==='firebeam',rocket=p.kind==='rocket';
 const life=rocket?2.8:beam?p.life:p.kind==='trident'?1.2:.7;
 if(p.t>life){if(rocket)explodeRocket(p.x,p.y,p.src,p.dmg>0?p.dmg:65,p.blastR||95);return true;}
 if(beam&&!p.hit)p.hit=new Set();
 const n=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vy)*dt/5));
 for(let i=0;i<n;i++){
  const x=p.x+p.vx*dt/n,y=p.y+p.vy*dt/n;
  if(!walkAtPx(x,y)){if(rocket)explodeRocket(p.x,p.y,p.src,p.dmg>0?p.dmg:65,p.blastR||95);return true;}
  p.x=x;p.y=y;
  // Snapshot protects this iteration from acid/splash callbacks querying Spatial.
  const nearby=[];Spatial.query(x,y,(Spatial.maxRadius||32)+10,nearby);
  for(const t of nearby){
   if(!combatProjectileEnemy(p,t)||(beam&&p.hit.has(t.id))||Math.abs((t.z||0)-(p.z||0))>70||dist(x,y,t.x,t.y)>t.r+(beam?8:5))continue;
   if(rocket){explodeRocket(x,y,p.src,p.dmg>0?p.dmg:65,p.blastR||95);return true;}
   dealDamage(p.src,t,p.dmg,{restProjectile:true,kdir:Math.atan2(p.vy,p.vx),kpow:p.kind==='bullet'?90:0});
   if(beam){p.hit.add(t.id);if(p.kind==='icebeam')t.slowT=Math.max(t.slowT||0,2.2);}
   else{if(p.kind==='bullet')addBlood(t.x,t.y,unitTopY(t)*.5,2);return true;}
  }
 }
 if(rocket){p.smokeT=(p.smokeT||0)-dt;if(p.smokeT<=0){p.smokeT=.025;addSmoke(p.x,p.y,p.z,1);addFire(p.x,p.y,p.z,1);}}
 return false;
}
function combatRangeThink(u,t){
 if(!exAlive(t)||!['idle','move'].includes(u.state)||u.canonTrap)return false;
 const gap=dist(u.x,u.y,t.x,t.y)-u.r-t.r;
 if((u.atkList||[]).some(d=>canUse(u,d,t)))return false;
 const d=(u.atkList||[]).find(d=>d.type==='proj'&&d.minR>gap&&(u.cds[d.n]||0)<=G.time&&fiveCanUse(u,d,t)&&restCanUse(u,d));
 if(!d)return false;
 const a=angTo(t.x,t.y,u.x,u.y),radius=u.r+t.r+d.minR+14;
 for(const turn of [0,.5,-.5,1,-1,1.5,-1.5]){
  const x=t.x+Math.cos(a+turn)*radius,y=t.y+Math.sin(a+turn)*radius;
  if(bodyClear(x,y,navigationRadius(u))&&losWalk(u.x,u.y,x,y,navigationRadius(u))){setDest(u,x,y,true);return true;}
 }
 return false;
}
function combatBlock(u,reason){u.combatBlocked={reason,until:G.time+1.2};}
function drawCombatFeedback(u){
 if(G.sel!==u||!u.combatBlocked||u.combatBlocked.until<G.time)return;
 ctx.save();ctx.fillStyle='#acd9f0';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(u.combatBlocked.reason,u.x,u.y*SQ-(u.z||0)-unitTopY(u)-24);ctx.restore();
}
