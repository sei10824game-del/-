/* Grabber projectile interception. Hold/object physics and tiny-monster
 * disintegration remain unimplemented; this is not a complete physics port. */
const SL_GRABBER_DAMAGE={dm_imp_doom_3:150,dm_vulgar:150,dm_cacodemon_doom_3:200,dm_revenant_doom_3:250,dm_hell_knight_doom_3:250,dm_maledict:250,dm_invulnerability_hunter:375,dm_mancubus_doom_3:400,dm_bruiser:400};
const SL_GRABBER_ENERGY=new Set(['fireball','chargedfire','greenfire','homingfire','spreadfire','plasma','dualplasma','chargedplasma']);
function slGrabberKind(p){
 if(p.fiveCanon){
  if(p.src?.key==='dm_revenant_doom_3'&&['homing','rocket'].includes(p.weapon))return 'revenant';
  if(SL_GRABBER_ENERGY.has(p.weapon)||(p.src?.key==='dm_vulgar'&&p.weapon==='acid'))return 'energy';
  return null;
 }
 // Only explicit energy-orb schemas; never catch hitscan bullets/beams or grenades.
 if(p.d&&['plasma'].includes(p.d.slKind))return 'energy';
 if(p.kind==='fireball'||p.kind==='plasma')return 'energy';
 return null;
}
function slGrabberCandidates(u){
 if(!exAlive(u)||(u.slGrabberNext||0)>G.time)return [];
 const result=[];
 for(const [pool,shots] of [['world',G.projs],['slayer',slWorld().shots]])for(const p of shots){
  if(!p.src||p.src===u||!hostileTo(u,p.src)||p.stuck||p.anchorOnly||!Number.isFinite(p.x)||!Number.isFinite(p.y)||!Number.isFinite(p.vx)||!Number.isFinite(p.vy)||Math.hypot(p.vx,p.vy)<1)continue;
  if(Number.isFinite(p.life)&&(pool==='world'?(p.t||0)>=p.life:p.life<=0))continue;
  const kind=slGrabberKind(p),range=dist(u.x,u.y,p.x,p.y);
  if(!kind||range>160||Math.abs((p.z??24)-(u.z||0)-24)>60||Math.abs(angDiff(u.faceA||0,angTo(u.x,u.y,p.x,p.y)))>.8||!losWalk(u.x,u.y,p.x,p.y,2))continue;
  result.push({p,pool,kind,range});
 }
 return result.sort((a,b)=>a.range-b.range);
}
function slGrabberCapture(u,target){
 const entry=slGrabberCandidates(u)[0];if(!entry)return false;
 const {p,pool,kind}=entry,original=p.src,speed=Math.hypot(p.vx,p.vy),bfgReturn=kind==='revenant'&&u.sp.slEdition==='lostmission';
 // Original RoE deflects powered revenant rockets rather than holding/aiming them.
 const deflect=kind==='revenant'&&!bfgReturn,aim=bfgReturn&&exAlive(original)?original:target;
 const angle=deflect?angTo(u.x,u.y,p.x,p.y)+(u.id%2?1:-1)*Math.PI*.5:angTo(p.x,p.y,aim.x,aim.y);
 p.src=u;p.team=u.fac;p.vx=Math.cos(angle)*speed;p.vy=Math.sin(angle)*speed;
 p.target=deflect?null:aim;p.fiveTarget=deflect?null:aim;
 p.homing=!deflect&&(bfgReturn||!!p.homing);p.fiveHoming=!deflect&&!!p.fiveHoming;p.returning=false;
 p.hits=new Set();if(p.hit)p.hit=new Set();p.slGrabbedFrom=original.key;p.slGrabbedBy=u.id;
 if(pool==='world'){p.t=0;p.life=Math.max(2,p.life||0);}else p.life=Math.max(2,p.life||0);
 const canonical=SL_GRABBER_DAMAGE[original.key];if(canonical&&!deflect)p.dmg=canonical;
 if(p.d)p.d={...p.d,dmg:canonical&&!deflect?canonical:p.d.dmg};
 p.impactX=aim.x;p.impactY=aim.y;u.slGrabberNext=G.time+2;
 (G.beams||(G.beams=[])).push({x:u.x,y:u.y,tx:p.x,ty:p.y,t:.2,w:3,col:'#9bddd3'});
 return true;
}
