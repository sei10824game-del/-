/* Five researched factions. Data and coverage notes: research/five-factions-roster.json.
 * Real-time crossovers, support auras, finite HP and scaled bosses are adaptations. */
const FIVE_ROSTERS={pr:[],cv:[],th:[],dr:[],dm:[]};
const FIVE_SHOTS={
 axewave:['斧のエネルギー波','fireball',40,650],
 plasma:['プラズマ射撃','fireball',28,430],dualplasma:['二連プラズマ','fireball',22,450,2],chargedplasma:['溜めプラズマ','fireball',65,480],
 fireball:['火球','fireball',30,430],chargedfire:['溜め火球','fireball',60,470],greenfire:['緑炎弾','fireball',45,440],homingfire:['追尾火球','fireball',38,460],
 homingskull:['追尾する髑髏','fireball',48,500,2],tetherfire:['連結火球','fireball',28,420,2],fence:['追尾エネルギーフェンス','fireball',35,460,3],crossfence:['十字エネルギー弾','fireball',40,460,4],
 spreadfire:['両腕の拡散火球','fireball',30,450,3],firebarrage:['火球の連射','fireball',35,500,5],needler:['ニードラー','bullet',12,400,5],
 fuelrod:['燃料ロッド砲','rocket',65,540],rocket:['ロケット砲','rocket',75,600,3],homing:['誘導ミサイル','rocket',65,580,2],wristrocket:['手首ロケット','rocket',70,450],
 grenade:['プラズマグレネード','nade',40,320],sticky:['粘着爆弾','nade',50,420],mortar:['迫撃砲','nade',90,650],
 rifle:['ライフル','bullet',12,480,3],pistol:['拳銃','bullet',20,370],spiker:['スパイカー','bullet',14,420,4],shotgun:['ショットガン','bullet',13,240,6],chaingun:['機関砲','bullet',12,570,7],
 carbine:['カービン','bullet',34,570],sniper:['ビームライフル狙撃','bullet',95,820],concussion:['コンカッション弾','fireball',48,420,2],
 bolt:['追尾ボルト','trident',50,480,3],arrow:['騎乗弓射','trident',36,460],ballista:['バリスタ','trident',90,650],axethrow:['斧投擲','trident',65,420],
 disc:['スマートディスク','trident',65,380],shuriken:['手裏剣','trident',60,380],acid:['酸液','spit',25,350,3],bfg:['BFG弾','fireball',180,650]
};
const FIVE_MELEE={wrist:['リストブレイド',55,'slash'],blade:['刃の斬撃',65,'slash'],axe:['斧の強打',85,'heavy'],claw:['爪の切り裂き',35,'slash'],punch:['剛腕の打撃',55,'heavy'],bite:['噛みつき',42,'bite'],spear:['槍の突き',75,'thrust'],hammer:['重力ハンマー',110,'spinSlam'],shieldbash:['シールド殴打',45,'bash'],chainsaw:['チェーンソー',75,'rip'],maw:['開いた顎の捕食',65,'bite'],sickle:['鎌の斬撃',65,'slash'],flail:['フレイル',80,'flailSpin'],tentacle:['触手の薙ぎ払い',50,'spineWhip'],whip:['鞭の一閃',45,'spineWhip'],burntouch:['燃える接触',30,'palm']};
const FIVE_NAMES={cloak:'光学迷彩',selfdestruct:'自爆装置',net:'捕縛ネット',chain:'鎖の引き寄せ',mine:'近接地雷',sonic:'衝撃波',laser:'レーザー',beam:'エネルギービーム',plant:'生物装備の拘束',falcon:'偵察ドローン展開',hounds:'猟犬の投入',repair:'修復',shieldpulse:'シールド供給',shieldwall:'防壁生成',deploy:'兵員降下',scan:'索敵',assimilate:'接触同化',harpoon:'触手の銛',rush:'廊下の高速通過',rebound:'往復襲撃',gaze:'視線への反応',ambushbite:'背後からの噛みつき',doortrap:'扉の待ち伏せ',halt:'反転の警告',eject:'隠れ場所からの排出',scare:'突然の出現',dread:'時間切れの襲撃',snare:'足止め',pull:'引力',blink:'瞬間移動',supply:'物資の支援',revive:'蘇生の支援',guide:'導きの光',facehug:'顔への跳びつき',swarm:'群れの襲撃',haste:'時間制限の追跡',movementcurse:'動きを検知する警告',drain:'継続吸収',observed:'視線で停止',stalk:'視線に反応する追跡',slow:'絡みつく減速',motionhunt:'動いた相手を追跡',erratic:'不規則な追跡',lostsouls:'ロストソウル召喚',hellfire:'地獄の炎',resurrect:'死体蘇生',demonspawn:'悪魔の召喚',seekers:'シーカー召喚',telekinesis:'念動投擲',timeslow:'時間減速',meteors:'隕石群',shockwave:'地面の衝撃波',buff:'味方強化',possess:'憑依強化',curse:'呪いの爪',deathbuff:'死亡時の強化叫声',roll:'回転突進',field:'防御エネルギーフィールド',psychic:'精神波',clone:'分身',stomp:'踏みつけ',grab:'つかみ攻撃',charge:'突進',leap:'跳躍攻撃',suicide:'接触自爆',wolf:'霊狼召喚',seekspawn:'Seekの分体生成'};
function fiveBuildAttack(m,r){return fiveCanonicalDefinition(r,m,fiveBuildAttackRaw(m,r));}
function fiveBuildAttackRaw(m,r){
 const power=1; // No arbitrary boss/heavy damage multiplier for balancing.
 if(FIVE_SHOTS[m]){const [n,kind,dmg,range,volley=1]=FIVE_SHOTS[m];return cbShot(n,dmg*power,range,{projKind:kind,minR:0,volley,spread:volley>1?.07:0,cd:m==='sniper'?4:kind==='rocket'?4:2,windup:m==='sniper'?1.3:.4,fiveShot:m});}
 if(FIVE_MELEE[m]){const [n,dmg,anim]=FIVE_MELEE[m];return cbMelee(n,dmg*power,{anim,reach:['spear','whip','tentacle','flail'].includes(m)?100:40,windup:/heavy|Slam|flail/.test(anim)?.85:.28,cd:1.7,knock:power*100,fiveMelee:m});}
 const support=['cloak','hounds','falcon','repair','shieldpulse','shieldwall','deploy','scan','supply','revive','guide','lostsouls','resurrect','demonspawn','seekers','buff','possess','deathbuff','clone','wolf','seekspawn'].includes(m);
 return exAbility(FIVE_NAMES[m]||m,'five:'+m,support?0:(['selfdestruct','suicide'].includes(m)?170:45)*power,['rush','rebound','blink','haste','dread','erratic','motionhunt','laser','beam','hellfire','meteors'].includes(m)?550:240, support?14:['selfdestruct','suicide'].includes(m)?8:5,{anim:['charge','rush','rebound','roll','haste','erratic'].includes(m)?'charge':['beam','laser','hellfire','buff'].includes(m)?'palmWave':['stomp','shockwave','sonic'].includes(m)?'spinSlam':'grab',windup:['rush','rebound','haste'].includes(m)?1.2:m==='selfdestruct'?2:.7,fiveMove:m,fiveTriggerOnly:r.key==='dm_marauder'&&m==='wolf'});
}
function registerFiveFactions(){
 for(const r of FIVE_TYPES){
  const flags=new Set(r.flags),boss=flags.has('boss'),heavy=flags.has('heavy'),small=['grunt','spider','skull','rat','bird','fish','bat'].includes(r.shape),passive=flags.has('passive');
  const hp=fiveCanonicalHP(r,boss?5500:heavy?1500:small?220:600),col={pr:'#9d9977',cv:'#6674ba',th:'#ac7369',dr:'#3b344b',dm:'#a34b3f'}[r.faction];
  exFighter(r.key,r.name,r.faction,hp,r.moves.map(m=>fiveBuildAttack(m,r)),{unique:0,exUnique:0,ai:'fiveFaction',five:r,fiveShape:r.shape,fivePassive:passive,scale:boss?2.25:heavy?1.65:small?.85:1.2,r:boss?21:heavy?15:small?7:10,mass:boss?12:heavy?5:1.7,walk:flags.has('static')?0:65,run:flags.has('static')?0:140,
   infectionImmune:flags.has('machine')||['th','dr','dm'].includes(r.faction)||['hunter','engineer'].includes(r.shape),mortal:['pr','cv'].includes(r.faction)&&!flags.has('machine'),infectable:['pr','cv'].includes(r.faction)&&!flags.has('machine')?1:0,
   pal:{...EX_PAL,skin:col,skinD:shade(col,-.4),skinL:shade(col,.3),cloth:col,clothD:shade(col,-.4),clothL:shade(col,.3),eye:r.faction==='cv'?'#81efff':'#f4b86c'},
   desc:r.name+' / '+r.work+'。調査名簿の種類・形態。原作条件を優先。未照合の技・数値は監査記録に記載。'+(passive?'非戦闘枠。勝敗の残存戦力には数えない。':'')});
  FIVE_ROSTERS[r.faction].push(r.key);
 }
}
registerFiveFactions();
function fiveOnSpawn(u){
 if(!u.sp.five)return;const r=u.sp.five;
 u.fiveShieldMax=r.flags.includes('shield')?u.mhp*.4:0;u.fiveShield=u.fiveShieldMax;u.fiveLastHit=-10;
 u.fiveHidden=r.flags.includes('disguise');u.fiveRevealAt=Infinity;
 u.fiveCloakUntil=r.flags.includes('invisible')?G.time+1e8:0;
 if(r.flags.includes('fly'))u.z=18;
 u.fiveNext=G.time+rnd(.1,.7);
 canonWorldSpawn(u);
}
function spawnFiveFactions(){
 G.fiveFields=[];fiveInitRules();
 for(const [f,keys] of Object.entries(FIVE_ROSTERS))if(facOn(f)){
  const rooms=[spawnRoom(),spawnRoom(),spawnRoom()];
  if(f==='dm'){
   // Initial budget only: every species remains registered; reinforcements have no cap.
   const order=[...keys];for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
   const builder=order.indexOf('dm_possessed_scientist');if(builder>0)[order[0],order[builder]]=[order[builder],order[0]];
   for(let i=0;i<fiveCount('dm');i++){const p=randWalkIn(rooms[i%rooms.length]);spawnUnit(order[i%order.length],p.x,p.y,{force:true});}
  }else keys.forEach((key,i)=>{for(let n=0;n<fiveCount(f);n++){const p=randWalkIn(rooms[i%rooms.length]);spawnUnit(key,p.x,p.y,{force:true});}});
  addLog(FAC_BY[f].icon+' '+FAC_BY[f].name+' — '+(f==='dm'?fiveCount('dm')+'体を初期配置（全'+keys.length+'種類から選出）':keys.length+'種類・形態が出現'),f,true);
 }
}
function fiveReveal(u){if(!u.fiveHidden)return;u.fiveHidden=false;u.tgt=null;addShock(u.x,u.y,5,40,'#c67e80');}
function fiveDamage(att,u,dmg,o){
 if(u.fiveHidden)fiveReveal(u);
 if(u.fiveCloakUntil>G.time&&!u.sp.five?.flags.includes('invisible'))u.fiveCloakUntil=0;
 dmg=fiveRuleDamage(att,u,dmg,o);
 if(!u.sp.five||dmg<=0)return dmg;
 u.fiveLastHit=G.time;
 if(u.fiveShield>0&&fiveDirectionalShield(att,u)&&!fiveIsMarauder(u)){combatBlock(u,'シールドが吸収');const blocked=Math.min(u.fiveShield,dmg);u.fiveShield-=blocked;dmg-=blocked;}

 return dmg;
}
function fiveChooseTarget(u,range=600){
 let best=null,score=Infinity;
 for(const v of G.units){if(!exAlive(v)||v===u||!hostileTo(u,v))continue;const d=dist(u.x,u.y,v.x,v.y);if(d>range||!losWalk(u.x,u.y,v.x,v.y,1))continue;
  if(u.sp.five?.flags.includes('hearing')&&v.moveSpd<12&&v.state!=='attack'&&d>55)continue;
  const s=d-(v.state==='attack'?30:0)-(u.fac==='pr'?Math.min(300,v.mhp*.03):0);if(s<score){score=s;best=v;}
 }return best;
}
function thinkFive(u){
 if(fiveRuleThink(u))return;
 if(u.sp.fivePassive){u.dest=null;u.path=null;return;}
 if(u.fiveRush)return;
 if(u.fiveHidden){
  const t=G.units.find(v=>exAlive(v)&&v.fac!=='th'&&isInfectHost(v)&&dist(u.x,u.y,v.x,v.y)<420);
  if(t){setDest(u,t.x,t.y);if(dist(u.x,u.y,t.x,t.y)<u.r+t.r+12&&!u.fiveAssimilating){const d=u.atkList.find(a=>a.fiveMove==='assimilate');if(d&&canUse(u,d,t))startAttack(u,d,t);}}else if(G.time>=u.fiveRevealAt)fiveReveal(u);else if(!u.dest){const p=randWalkIn(spawnRoom());setDest(u,p.x,p.y);}return;
 }
 const hearing=u.sp.five?.flags.includes('hearing');
 const t=!hearing&&u.tgt&&exAlive(u.tgt)&&hostileTo(u,u.tgt)?u.tgt:fiveChooseTarget(u);u.tgt=t;
 if(hearing&&!t){u.dest=null;u.path=null;return;}
 if(t){
  const moves=u.sp.five?.moves||[];
  if(moves.includes('motionhunt')&&t.moveSpd<5&&t.state!=='attack'){u.dest=null;return;}
  if(moves.includes('observed')&&canSee(t,u)){u.dest=null;return;}
  if(moves.includes('stalk')&&canSee(t,u)){
   u.fiveAggro=(u.fiveAggro||0)+.22;
   if(u.fiveAggro<2.5){const a=angTo(t.x,t.y,u.x,u.y),p=exPoint(u.x+Math.cos(a)*70,u.y+Math.sin(a)*70);if(p)setDest(u,p.x,p.y);return;}
  }
 }
 thinkMonster(u);
}
function fiveSpawn(owner,key,life){
 if(!SP[key]||(!PI_CAST_OWNER&&!facOn(SP[key].fac)))return null;const p=exPoint(owner.x+rnd(-35,35),owner.y+rnd(-35,35));if(!p)return null;
 const v=spawnUnit(key,p.x,p.y,{force:true});if(v){if(G.stats[v.fac])G.stats[v.fac].born++;v.fiveParent=owner.id;if(life)v.fiveExpires=G.time+life;addShock(v.x,v.y,4,25,'#bf865e');}return v;
}
function fiveBuff(u,kind){
 for(const v of G.units)if(exAlive(v)&&v.fac===u.fac&&dist(u.x,u.y,v.x,v.y)<190){
  if(kind==='repair'||kind==='supply')v.hp=Math.min(v.mhp,v.hp+35);
  else if(['shieldpulse','shieldwall','field'].includes(kind)){v.fiveShieldMax=Math.max(v.fiveShieldMax||0,80);v.fiveShield=Math.min(v.fiveShieldMax,(v.fiveShield||0)+40);}
  else{v.fiveBuffUntil=G.time+8;v.fiveBuffBase=v.fiveBuffBase??(v.dmgMul||1);v.dmgMul=v.fiveBuffBase*1.25;}
 }addShock(u.x,u.y,5,180,'#9ad3e5');
}
function fiveResurrect(u){
 const i=G.corpses.findIndex(c=>!(u.key==='dm_arch_vile_classic'&&(/arch_vile|cyberdemon|spider_mastermind|commander_keen|lost_soul|pain_elemental|tyrant|ghoul/.test(c.key)||c.gib||c.canonGib||c.decap))&&SP[c.key]?.fac===u.fac&&!c.riseAs&&!c.virusFac&&!c.hauled&&dist(u.x,u.y,c.x,c.y)<230);
 if(i<0)return false;const c=G.corpses[i],v=spawnUnit(c.key,c.x,c.y,{rise:true,force:true});if(!v)return false;
 G.corpses.splice(i,1);addShock(c.x,c.y,5,40,'#f5b767');return true;
}
function fiveStartRush(u,t,mode,dmg){
 u.fiveRush={origin:{x:u.x,y:u.y},target:exPoint(t.x,t.y)||{x:t.x,y:t.y},left:mode==='rebound'?4:1,mode,dmg,hit:new Set(),until:G.time+5};
 u.dest=null;u.path=null;
}
function fiveFire(u,d,a){
 if(fiveRuleFire(u,d,a))return;
 const m=d.fiveMove,t=a.tgt,r=u.sp.five;
 if(m==='cloak'){u.fiveCloakUntil=G.time+7;return;}
 if(['repair','supply','shieldpulse','shieldwall','buff','possess','field'].includes(m)){fiveBuff(u,m);return;}
 if(m==='resurrect'||m==='revive'){fiveResurrect(u);return;}
 if(m==='seekspawn'){for(const key of ['dr_seek_hand','dr_seek_sludge','dr_seek_worm'])fiveSpawn(u,key);return;}
 const summons={hounds:'pr_yautja_hunting_hound',falcon:'pr_falcon_recon_drone',wolf:'dm_marauder_spirit_wolf',lostsouls:'dm_lost_soul_classic',seekers:'dm_seeker_doom_3',demonspawn:'dm_imp_classic',deploy:'cv_grunt_minor',seekspawn:'dr_seek_hand'};
 if(summons[m]){for(let i=0;i<(m==='lostsouls'?3:2);i++)fiveSpawn(u,summons[m]);return;}
 if(m==='clone'){if(!u.fiveClone){const v=fiveSpawn(u,u.key,10);if(v){v.fiveClone=1;v.atkList=v.sp.atks.filter(d=>d.fiveMove!=='clone');}}return;}
 if(m==='scan'||m==='guide'){u.fiveScanUntil=G.time+5;fiveBuff(u,'shieldpulse');return;}
 if(m==='deathbuff')return;
 if(!exAlive(t)||!hostileTo(u,t)||dist(u.x,u.y,t.x,t.y)-u.r-t.r>d.maxR||!losWalk(u.x,u.y,t.x,t.y,1))return;
 if(['rush','rebound','charge','roll','haste','erratic'].includes(m)){fiveStartRush(u,t,m,d.dmg);return;}
 if(m==='blink'||m==='ambushbite'){
  const p=exPoint(t.x-Math.cos(t.faceA||0)*40,t.y-Math.sin(t.faceA||0)*40);if(p){addSmoke(u.x,u.y,6,8);u.x=p.x;u.y=p.y;u.path=null;u.dest=null;addSmoke(u.x,u.y,6,8);}if(m==='blink')return;
 }
 if(['selfdestruct','suicide'].includes(m)){u.fiveBurstDone=true;exBlast(u,u.x,u.y,145,d.dmg);u.hp=0;killUnit(null,u,{gib:1,noRise:true,selfBoom:true});return;}
 if(m==='gaze'&&!canSee(t,u))return;
 if(m==='movementcurse'&&t.moveSpd<5&&t.state!=='attack')return;
 if(m==='motionhunt'&&t.moveSpd<5)return;
 if(m==='stalk'&&canSee(t,u)&&(u.fiveAggro||0)<2.5)return;
 if(m==='observed'&&canSee(t,u))return;
 if(['scare','halt','eject','snare','net','slow','timeslow','plant','facehug','movementcurse','curse'].includes(m)){
  t.slowT=Math.max(t.slowT||0,3);t.panicT=3;t.threat=true;
  if(['halt','eject'].includes(m))knockDown(t);
  if(m==='slow'||m==='scare'){addShock(t.x,t.y,4,35,'#b3a3c9');return;}
 }
 if(m==='chain'||m==='pull'){const a2=angTo(t.x,t.y,u.x,u.y);tryMove(t,Math.cos(a2)*50,Math.sin(a2)*50);}
 if(m==='drain')u.hp=Math.min(u.mhp,u.hp+d.dmg*.4);
 if(['hellfire','meteors','mine','dread'].includes(m)){
  (G.fiveFields||(G.fiveFields=[])).push({owner:u,x:t.x,y:t.y,r:m==='meteors'?110:65,delay:m==='mine'?1:.7,life:3,next:G.time+.7,dmg:d.dmg,t:0});return;
 }
 if(['stomp','sonic','shockwave','psychic'].includes(m)){exBlast(u,u.x,u.y,150,d.dmg);return;}
 (G.beams||(G.beams=[])).push({x:u.x,y:u.y,tx:t.x,ty:t.y,t:.25,w:['beam','laser'].includes(m)?5:2,col:u.fac==='cv'?'#8bdcff':u.fac==='th'?'#d8979c':'#f5ab6b'});
 dealDamage(u,t,d.dmg,{noRise:m==='assimilate',kpow:90,kdir:angTo(u.x,u.y,t.x,t.y)});
}
function fiveGuideProjectile(p,dt){
 if(!p.fiveHoming||!exAlive(p.fiveTarget))return;
 const speed=Math.hypot(p.vx,p.vy),a=Math.atan2(p.vy,p.vx),want=angTo(p.x,p.y,p.fiveTarget.x,p.fiveTarget.y),turn=clamp(angDiff(a,want),-dt*2.8,dt*2.8),next=a+turn;
 p.vx=Math.cos(next)*speed;p.vy=Math.sin(next)*speed;
}
function updateFive(dt){
 fiveRuleUpdate(dt);
 for(const u of G.units){if(!exAlive(u))continue;
  if(u.fiveExpires&&G.time>=u.fiveExpires){u.gone=true;continue;}
  if(u.fiveBuffUntil&&G.time>=u.fiveBuffUntil){u.dmgMul=u.fiveBuffBase;u.fiveBuffUntil=0;}
  if(u.fiveShieldMax&&G.time-(u.fiveLastHit||0)>5)u.fiveShield=Math.min(u.fiveShieldMax,(u.fiveShield||0)+dt*u.fiveShieldMax*.15);
  const rush=u.fiveRush;
  if(rush){
   const dest=rush.left%2===0?rush.target:rush.mode==='rebound'?rush.origin:rush.target,ox=u.x,oy=u.y,a=angTo(u.x,u.y,dest.x,dest.y),speed=rush.mode==='erratic'?220+Math.sin(G.time*8)*100:350;
   tryMove(u,Math.cos(a)*speed*dt,Math.sin(a)*speed*dt);u.faceA=a;u.moveSpd=dist(ox,oy,u.x,u.y)/Math.max(.001,dt);
   for(const v of G.units)if(exAlive(v)&&hostileTo(u,v)&&!v.fiveHiding&&losWalk(u.x,u.y,v.x,v.y,1)&&dist(u.x,u.y,v.x,v.y)<(u.fac==='dr'?90:u.r+v.r+14)&&!rush.hit.has(v.id)){rush.hit.add(v.id);dealDamage(u,v,FIVE_DOOR_DAMAGE[u.key]??rush.dmg,{kpow:160,kdir:a,fiveWeapon:'entity',ignoreArmor:u.fac==='dr'});}
   if(dist(u.x,u.y,dest.x,dest.y)<15||dist(ox,oy,u.x,u.y)<.1){rush.left--;rush.hit.clear();}
   if(rush.left<=0||G.time>rush.until)u.fiveRush=null;
  }
  if(!u.sp.five||G.time<(u.fiveNext||0))continue;u.fiveNext=G.time+.65;
  const r=u.sp.five;
  if(r.flags.includes('fly'))u.z=18+Math.sin(G.time*2+u.id)*3;

 }
 const fs=G.fiveFields||[];for(let i=fs.length-1;i>=0;i--){const f=fs[i];f.t+=dt;if(f.t>f.life){fs.splice(i,1);continue;}if(f.t>=f.delay&&G.time>=f.next){f.next=G.time+.7;exBlast(f.owner,f.x,f.y,f.r,f.dmg);}}
}
function fiveOnDeath(u,o){
 const r=u.sp.five||(u.fiveAssimilated?{faction:'th',flags:[],moves:[]}:null);if(!r)return;
 if(r.moves.includes('deathbuff'))fiveBuff(u,'buff');
 if(r.moves.includes('lostsouls'))for(let i=0;i<3;i++)fiveSpawn(u,'dm_lost_soul_classic');
 if(r.faction==='th'&&!r.flags.includes('fragment')&&!o.gib&&!o.explosion)fiveSpawn(u,'th_norris_head_spider');
 if(r.moves.includes('suicide')&&!u.fiveBurstDone){u.fiveBurstDone=true;exBlast(u,u.x,u.y,90,100);}
}
function drawFiveUnit(u,pose){
 if(u.canonTrap)return;
 const r=u.sp.five||{shape:'thing',faction:'th',flags:[],moves:['tentacle']},shape=u.fiveAssimilated&&!u.fiveHidden?'thing':r.shape;
 if(u.fiveHidden&&u.fiveAssimilated){const v={...u,fiveHidden:false,fiveAssimilated:0};if(u.sp.five)drawFiveUnit(v,pose);else drawUnit(v);return;}
 if(u.fiveHidden){const sp=shape==='hound'?SP.dog:SP.human,v={...u,sp,pal:sp.pal,fx:sp.fx||{},sizeMul:u.sizeMul};if(shape==='hound')drawQuad(v,poseFor(v));else drawBiped(v,poseFor(v));return;}
 const S=18*u.sp.scale*u.sizeMul,d=renderFacing(u),T=G.time,phase=actionPhase(u),hit=Math.sin(phase*Math.PI),walk=Math.sin(u.gait||0)*Math.min(1,(u.moveSpd||0)/90),rank=r.flags.includes('elder')?'#d6b166':r.flags.includes('elite')?'#b6c9d8':u.pal.skin;
 ctx.save();ctx.translate(u.x,u.y*SQ-u.z);ctx.scale(d,1);
 if(u.fiveCloakUntil>G.time)ctx.globalAlpha*=.24;
 ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=1;ctx.strokeStyle=shade(rank,-.45);
 const ellipse=(x,y,rx,ry,c)=>{
  ctx.save();ctx.lineWidth=Math.max(.6,S*.025);ctx.strokeStyle='rgba(0,0,0,.45)';
  ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x*S,y*S,rx*S,ry*S,0,0,TAU);ctx.fill();ctx.stroke();
  if(G.quality!=='low'&&rx*S>1.5&&ry*S>1.5){
   const g=ctx.createLinearGradient((x-rx)*S,(y-ry)*S,(x+rx)*S,(y+ry)*S);
   g.addColorStop(0,'rgba(255,255,255,.3)');g.addColorStop(.35,'rgba(255,255,255,.03)');g.addColorStop(.7,'rgba(0,0,0,.12)');g.addColorStop(1,'rgba(0,0,0,.48)');ctx.fillStyle=g;ctx.fill();
  }ctx.restore();
 };
 const line=(x,y,tx,ty,w,c)=>{ctx.strokeStyle=c;ctx.lineWidth=w*S;ctx.beginPath();ctx.moveTo(x*S,y*S);ctx.lineTo(tx*S,ty*S);ctx.stroke();};
 const eye=(x,y,c='#ffdd8c',size=.05)=>ellipse(x,y,size,size,c);
 const tent=(x,y,len,i,c)=>{ctx.strokeStyle=c;ctx.lineWidth=S*.09;ctx.beginPath();ctx.moveTo(x*S,y*S);ctx.bezierCurveTo((x+len*.3)*S,(y-.3)*S,(x+len*.65)*S,(y+Math.sin(T*3+i)*.4)*S,(x+len)*S,(y+.15)*S);ctx.stroke();};
 if(drawFiveGazePolish(u,shape,S)){}
 else if(drawFiveApparitionPolish(u,shape,S)){}
 else if(drawFivePlantPolish(u,shape,S)){}
 else if(drawFiveSeekPolish(u,shape,S)){}
 else if(drawFiveGrumblePolish(u,shape,S)){}
 else if(drawFiveHoundPolish(u,shape,S)){}
 else if(drawFiveDemonPolish(u,shape,S)){}
 else if(drawFiveSpecialBody(u,shape,S,rank,hit,walk)){}
 else if(['vehicle','tank','aircraft','walker','turret'].includes(shape)){
  const cv=r.faction==='cv',body=cv?'#544575':'#5c483e';
  if(shape==='walker'){for(const q of [-1,1])for(let i=0;i<2;i++){const x=q*(.55+i*.25);line(x,-1.4,x+q*.5,-.55,.16,'#4e405b');line(x+q*.5,-.55,x+q*.75+walk*.15,0,.13,'#786480');}drawFacingBlock(0,-S*1.2,S*1.5,S*.7,S*.5,1,body,'#332d45','#9b88a2');line(.4,-1.45,1.5,-1.3,.2,'#776481');eye(1.5,-1.3,'#8aff9d',.12);}
  else if(shape==='turret'){line(0,-.6,-.6,0,.12,'#585664');line(0,-.6,.5,0,.12,'#585664');ellipse(0,-.8,.5,.24,body);line(.2,-.9,1,-.9,.18,'#8b789e');}
  else{ellipse(0,-.5,1.05,.36,body);ellipse(-.4,-.7,.6,.26,'#8d75a3');if(shape==='aircraft'){ctx.fillStyle=body;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(-S*.6,-S*.5);ctx.lineTo(-S*1.3,-S*(side>0?1.3:-.1));ctx.lineTo(S*.5,-S*.5);ctx.fill();}eye(-.8,-.45,'#6bddff',.12);}else{line(-.65,-.25,.65,-.25,.22,'#383543');}line(.1,-.7,1.15,-.85,.2,'#8c7997');eye(1.15,-.85,'#8bddff',.1);}
 }else if(['spider','thing','tentacle','worm','slime','plant','grumble'].includes(shape)){
  const col=shape==='thing'?'#ad706a':shape==='grumble'?'#bca58d':shape==='plant'?'#526e47':shape==='spider'&&r.faction==='dm'?'#ab7673':rank;
  if(shape==='plant'){for(let i=0;i<6;i++)tent(0,-.1,(i%2?1:-1)*(.7+i*.12),i,'#526b43');line(0,0,.15,-1.7,.16,'#71865c');ellipse(.15,-1.6,.43,.3,'#929a68');eye(.35,-1.65,'#e4e0a4',.12);}
  else if(shape==='tentacle'||shape==='worm'){for(let i=0;i<3;i++)tent(-.5,-.2-i*.2,1.4+hit*.8,i,col);ellipse(-.35,-.3,.45,.33,col);}
  else{
   const legs=shape==='grumble'?8:shape==='spider'?6:shape==='thing'?5:3;
   for(let i=0;i<legs;i++){const side=i%2?1:-1,x=(Math.floor(i/2)-1)*.35;line(x,-.65,x+side*.6,-.3,.09,shade(col,-.35));line(x+side*.6,-.3,x+side*.8+walk*.15,0,.065,shade(col,.1));}
   ellipse(0,-.85,shape==='grumble'?.9:.65,shape==='slime'?.4:.55,col);
   if(shape==='spider'&&r.faction==='dm'){drawFacingBlock(0,-S*.8,S*.9,S*.4,S*.3,1,'#765b67','#494856','#b59b9a');line(.3,-1.05,1.1,-1.05,.15,'#b8a8a2');}
   else{ellipse(.4,-.8,.32,.22,'#301c25');for(let i=0;i<6;i++)line(.2+i*.075,-.96,.23+i*.075,-.84,.035,'#e4d3b6');eye(.5,-1.1,r.faction==='dr'?'#d891b1':'#e8ca93',.09);}
   if(shape==='thing'){for(let i=0;i<5;i++)tent(-.1,-.7,(i%2?1:-1)*(.8+hit*.4),i,'#be8a80');ellipse(-.2,-1.1,.25,.2,'#4a252d');eye(-.15,-1.12);}
   if(shape==='grumble')for(let i=0;i<5;i++)eye(-.25+i*.15,-1.15-Math.sin(i)*.1,'#d89ca9',.045);
  }
 }else if(['face','eyes','ghost','void','light','orb','skull','bat','bird','fish','drone'].includes(shape)){
  const bob=Math.sin(T*3+u.id)*.07;
  if(shape==='light'){ellipse(0,-1+bob,.24,.4,'#b6dcfc');ctx.strokeStyle='#b7d7ff';ctx.lineWidth=1;for(let i=0;i<7;i++){const a=i*TAU/7+T;ctx.beginPath();ctx.moveTo(Math.cos(a)*S*.4,(-1+Math.sin(a)*.4)*S);ctx.lineTo(Math.cos(a)*S*.65,(-1+Math.sin(a)*.65)*S);ctx.stroke();}}
  else if(shape==='eyes'){for(let i=0;i<7;i++){const a=i*2.4;ellipse(Math.cos(a)*.6,-1+Math.sin(a)*.4,.19,.1,'#d8d2ee');eye(Math.cos(a)*.6+.05,-1+Math.sin(a)*.4,'#8d62b8');}}
  else if(shape==='skull'){ellipse(0,-1+bob,.4,.4,'#d5b997');ellipse(.15,-1,.12,.1,'#2c2227');line(.05,-.7,.4,-.7,.1,'#d6c8b3');for(let i=0;i<4;i++)tent(-.2,-1.2+i*.12,-.7,i,'#ef9250');}
  else if(shape==='drone'){ellipse(0,-1+bob,.45,.3,'#778594');line(-.6,-1.1,.6,-1.1,.07,'#bcc9d6');eye(.35,-1,'#88e5ff',.1);}
  else if(shape==='bat'||shape==='bird'){ellipse(0,-1,.22,.3,rank);for(const side of [-1,1]){ctx.fillStyle=shade(rank,-.1);ctx.beginPath();ctx.moveTo(0,-S);ctx.lineTo(side*S*(.8+Math.sin(T*12)*.2),-S*(1.2+Math.cos(T*12)*.2));ctx.lineTo(side*S*.6,-S*.6);ctx.closePath();ctx.fill();}eye(.18,-1.15);}
  else if(shape==='fish'){ellipse(0,-.6,.5,.2,'#9a9f99');line(-.4,-.6,-.7,-.85,.12,'#7a8f9f');eye(.3,-.65);}
  else{
   const col=shape==='orb'&&r.faction==='dm'?'#b85449':shape==='ghost'?'#5f718a':'#211d2b';ellipse(0,-1+bob,.65,.65,col);
   if(shape==='orb'&&r.faction==='dm'){eye(.3,-1.2,'#94dba3',.17);ellipse(.3,-.7,.3,.18,'#391d25');for(const side of [-1,1])line(side*.4,-1.4,side*.7,-1.8,.12,'#d7b595');}
   else{eye(.28,-1.15,r.name.includes('Ambush')?'#8ce4bb':'#dfd9d5',.12);ellipse(.3,-.75,.25,.18,'#090811');for(let i=0;i<5;i++)line(.12+i*.08,-.88,.16+i*.08,-.76,.025,'#d2c5b3');for(let i=0;i<4;i++)tent(-.2,-.7-i*.2,-.8,i,'#30263a');}
   if(r.moves.includes('motionhunt')||r.moves.includes('erratic')){drawFacingBlock(-S*.5,-S*.1,S*.6,S*.5,S*.15,1,'#525064','#292736','#887e8c');}
  }
 }else if(shape==='door'||shape==='portrait'||shape==='statue'||shape==='totem'){
  drawFacingBlock(0,0,S*.8,S*2,S*.3,1,shape==='door'?'#795d49':'#7c7479','#42383c','#a39ba1');
  if(shape==='door'){ellipse(.25,-.85,.07,.07,'#dfc478');ellipse(.05,-1.35,.24,.18,'#211921');eye(.12,-1.4);}
  else if(shape==='portrait'){ctx.fillStyle='#bc9d6d';ctx.fillRect(-S*.3,-S*1.8,S*.6,S*1.2);ellipse(0,-1.45,.17,.2,'#746986');}
  else{for(let i=0;i<4;i++)line(-.3,-.4-i*.35,.3,-.45-i*.35,.04,'#c2aba4');eye(.25,-1.65,'#e6797f',.08);}
 }else if(shape==='hound'||shape==='rat'){
  const col=r.faction==='th'?'#916b65':rank;for(const side of [-1,1]){line(-.45,-.6,-.55+walk*side*.2,0,.13,shade(col,-.2));line(.4,-.6,.6-walk*side*.2,0,.13,col);}
  ellipse(0,-.7,.7,.32,col);ellipse(.65,-.85,.35,.27,shade(col,.1));ellipse(.95,-.75,.2,.16,shade(col,-.2));eye(.8,-.95);line(-.55,-.7,-1,-.8,.1,col);
  if(r.name.includes('Rider')){ellipse(0,-1.5,.2,.25,'#a58b71');line(0,-1.3,0,-.8,.13,'#574649');line(.1,-1.35,.65,-1.35,.08,'#d0b280');}
 }else{
  // Profile skeleton with depth-ordered limbs and the shared detailed attack pose.
  const p=pose||poseFor(u),short=shape==='grunt'||shape==='goblin',bulk=['brute','hunter','mancubus','cyber'].includes(shape)||r.flags.includes('heavy'),height=short?1.7:2.5,torso=bulk?.63:.34,skin=shape==='skeleton'?'#d3bca1':rank;
  const articulated=['pr','cv'].includes(u.fac);
  if(articulated){ctx.translate(0,-(p.rootZ||0)*.55);ctx.rotate(clamp(p.lean||0,-.5,.8)*.09);}
  const arm=(side)=>{const a=side<0?p.armL:p.armR,L=bulk?.62:.68,sh={x:side*S*.13,y:-S*(height-.55)},el={x:side*S*.13+Math.sin(a[0])*S*L,y:sh.y+Math.cos(a[0])*S*L},ha={x:el.x+Math.sin(a[0]+a[1])*S*L,y:el.y+Math.cos(a[0]+a[1])*S*L};limb(sh,el,S*(bulk?.17:.12),S*.1,side<0?shade(skin,-.3):skin);limb(el,ha,S*.1,S*(bulk?.17:.11),side<0?shade(skin,-.3):skin);
   if(shape==='mancubus'||shape==='cyber'||(r.faction==='cv'&&side>0&&!['blade','hammer','shieldbash','punch'].includes(u.atk?.def.fiveMelee))||shape==='soldier'){line(ha.x/S,ha.y/S,ha.x/S+.55,ha.y/S,.15,'#605668');eye(ha.x/S+.55,ha.y/S,r.faction==='cv'?'#81dbff':'#e79965',.06);}
   if(side>0&&articulated)drawFiveHeldPolish(u,shape,S,el,ha);
   return {sh,el,ha};
  };
  const leg=side=>{const hip={x:side*S*.12,y:-S*(short?.65:1)},knee={x:side*S*.15+walk*side*S*.22,y:-S*.45},foot={x:side*S*.18+walk*side*S*.38,y:side*S*.05};if(articulated){const angles=side<0?p.legL:p.legR,L=(short?.65:1)*S*.5,crouch=clamp(p.crouch||0,0,.7)*S*.18;hip.y+=crouch;knee.x=hip.x+Math.sin(angles[0])*L;knee.y=hip.y+Math.cos(angles[0])*L;foot.x=knee.x+Math.sin(angles[0]-angles[1])*L;foot.y=knee.y+Math.cos(angles[0]-angles[1])*L;}limb(hip,knee,S*(bulk?.18:.12),S*.09,shade(skin,side<0?-.35:-.1));limb(knee,foot,S*.09,S*.11,shade(skin,-.2));line(foot.x/S,foot.y/S,foot.x/S+.2,foot.y/S,.13,shade(skin,-.3));};
  const backArm=arm(-1);leg(-1);drawFiveTorso(u,shape,S,skin,height,torso,short);leg(1);
  drawFiveBodyDetail(u,shape,S,skin,height,torso);
  const hy=-height+.25;
  if(shape==='grunt'){ellipse(-.3,-1.15,.42,.65,'#687a98');line(.2,hy+.2,.45,hy+.35,.13,'#41464f');}
  if(shape==='yautja'){for(let i=0;i<6;i++)line(-.18,hy-.1,-.55-i*.035,hy+.5+i*.08,.06,'#2d2a29');ellipse(.05,hy,.38,.48,'#8d999b');line(.12,hy-.12,.46,hy-.12,.06,'#243239');line(.1,hy+.13,.48,hy+.28,.1,'#68767c');}
  else if(shape==='jackal'){ellipse(0,hy,.27,.33,'#a9966c');line(.17,hy+.08,.65,hy+.22,.13,'#b9a375');eye(.23,hy-.06,'#f8d98b');}
  else if(shape==='elite'){ellipse(0,hy,.3,.42,'#747d9a');for(let i=0;i<2;i++){line(.17,hy+.1+i*.12,.48,hy+.25+i*.06,.07,'#b7aca7');}eye(.24,hy-.06,'#90e9ff');}
  else if(shape==='figure'){ellipse(0,hy,.32,.45,'#9c735e');ellipse(.27,hy+.07,.22,.27,'#2b191c');for(let i=0;i<5;i++)line(-.22,-1.6+i*.12,.3,-1.55+i*.12,.04,'#d5b393');}
  else if(shape==='seek'){ellipse(0,hy,.3,.38,'#16151b');ellipse(.27,hy,.18,.12,'#f4e9df');eye(.33,hy,'#13111b',.06);}
  else{ellipse(.02,hy,.3,.37,shape==='brute'?'#7b726a':skin);eye(.25,hy-.07,r.faction==='cv'?'#96e7fa':'#e9b78a');line(.2,hy+.19,.44,hy+.15,.06,'#3e2830');}
  if(['horned','imp','dragon'].includes(shape))for(const side of [-1,1])line(side*.18,hy-.22,side*.42,hy-.65,.11,'#d5b89b');
  if(shape==='skeleton')for(let i=0;i<5;i++)line(-.22,-1.9+i*.15,.28,-1.85+i*.15,.04,'#ccb89c');
  if(shape==='angel'||shape==='dragon'){for(const side of [-1,1]){ctx.fillStyle=shape==='angel'?'#b9b3a1':'#744b4e';ctx.beginPath();ctx.moveTo(-S*.2,-S*1.8);ctx.lineTo(-S*(1.3+Math.sin(T*3)*.15),-S*(side>0?2.7:.8));ctx.lineTo(-S*.4,-S*1.2);ctx.fill();}}
  drawFiveHeadDetail(u,shape,S,hy);
  arm(1);
  if(shape==='hunter'||r.flags.includes('shield')){ctx.strokeStyle='#8bc8ef';ctx.lineWidth=S*.09;ctx.beginPath();ctx.ellipse(articulated?backArm.ha.x+S*.16:S*.48,articulated?backArm.ha.y-S*.3:-S*1.25,S*.25,S*.6,.2,0,TAU);ctx.stroke();}
  if(r.name.includes('Ranger')||r.flags.includes('fly')){line(-.35,-1.8,-.45,-1.2,.2,'#5d677d');eye(-.45,-1.1,'#82ccff',.1);}
 }
 if(u.fiveShield>0){ctx.strokeStyle='rgba(120,205,255,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,-S,S*.9,S*1.6,0,0,TAU);ctx.stroke();}
 if(u.fiveRush){ctx.strokeStyle='rgba(195,180,218,.7)';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-S*(.8+i*.2),-S*(.5+i*.25));ctx.lineTo(-S*(1.5+i*.2),-S*(.5+i*.25));ctx.stroke();}}
 ctx.restore();
}
function drawFiveFields(){drawFiveRuleFields();ctx.save();for(const f of G.fiveFields||[]){ctx.strokeStyle=f.t<f.delay?'#eec77f':'#d65c49';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(f.x,f.y*SQ,f.r,f.r*SQ,0,0,TAU);ctx.stroke();}ctx.restore();}

/* Articulated profile detail layered between rear limbs and front arms.
 * Details never affect collision, attack reach, HP or character availability. */
function drawFiveBodyDetail(u,shape,S,skin,height,torso){
 if(G.quality==='low')return;const r=u.sp.five||{},f=r.faction||u.fac;
 const line=(x,y,a,b,w,c)=>{ctx.strokeStyle=c;ctx.lineWidth=w*S;ctx.beginPath();ctx.moveTo(x*S,y*S);ctx.lineTo(a*S,b*S);ctx.stroke();};
 if(f==='cv'||shape==='yautja'||shape==='soldier'||shape==='cyber'){
  const metal=f==='cv'?'#7d86aa':shape==='yautja'?'#7e857a':'#66636a';
  drawFacingBlock(-S*.04,-S*(height-.85),S*(torso*1.5),S*.38,S*.13,1,metal,shade(metal,-.3),shade(metal,.35));
  drawFacingBlock(S*.08,-S*(height-1.25),S*.32,S*.2,S*.09,1,shade(metal,-.12),shade(metal,-.4),shade(metal,.2));
  for(let i=0;i<3;i++)line(-torso*.6,-height+.65+i*.1,torso*.6,-height+.65+i*.1,.025,shade(metal,-.35));
  line(-torso*.8,-height+1.25,torso*.8,-height+1.25,.1,'#36333d');
  if(shape==='yautja'){
   for(let i=0;i<4;i++){line(-torso,-height+.95+i*.13,torso,-height+1.15+i*.13,.018,'#34342f');line(-torso,-height+1.15+i*.13,torso,-height+.95+i*.13,.018,'#34342f');}
   drawFacingBlock(-S*.3,-S*(height-.42),S*.26,S*.2,S*.22,1,'#90958a','#3d453f','#b6bbaa');
  }
 }else if(f==='dm'){
  if(shape==='skeleton')return;
  const hi=shade(skin,.2),lo=shade(skin,-.35);
  for(const side of [-1,1]){
   ctx.fillStyle=side<0?shade(skin,-.12):hi;ctx.beginPath();ctx.ellipse(side*S*torso*.45,-S*(height-.85),S*torso*.48,S*.22,side*.18,0,TAU);ctx.fill();
   for(let i=0;i<3;i++)line(side*.04,-height+1.12+i*.12,side*torso*.55,-height+1.08+i*.12,.025,lo);
  }
  line(0,-height+.7,0,-height+1.4,.035,lo);
 }else if(shape==='figure'){
  for(let i=0;i<6;i++)line(-torso*.8,-height+.8+i*.13,torso*.8,-height+.86+i*.13,.045,'#dfb49b');
 }
}
function drawFiveHeadDetail(u,shape,S,hy){
 if(G.quality==='low')return;
 const line=(x,y,a,b,w,c)=>{ctx.strokeStyle=c;ctx.lineWidth=w*S;ctx.beginPath();ctx.moveTo(x*S,y*S);ctx.lineTo(a*S,b*S);ctx.stroke();};
 if(shape==='yautja'){
  drawFacingBlock(S*.12,S*(hy+.21),S*.43,S*.54,S*.22,1,'#a6b0ab','#535f60','#d0d4c8');
  line(.2,hy-.12,.55,hy-.16,.05,'#1a2529');
  for(let i=0;i<3;i++)line(.27+i*.06,hy+.08,.33+i*.06,hy+.18,.018,'#303a39');
  ctx.fillStyle='#ff5148';for(let i=0;i<3;i++)ctx.fillRect(S*(.02+i*.07),S*(hy-.19),S*.035,S*.035);
 }else if(shape==='elite'){
  drawFacingBlock(-S*.06,S*(hy+.06),S*.42,S*.48,S*.13,1,'#737faa','#343a60','#a6b9db');
  line(.19,hy-.04,.38,hy-.07,.045,'#99f4ff');
  for(const side of [-1,1]){line(.2,hy+.13+side*.09,.5,hy+.3+side*.12,.06,'#aeb4b8');line(.5,hy+.3+side*.12,.58,hy+.17+side*.12,.035,'#e7dac4');}
 }else if(shape==='jackal'){
  for(let i=0;i<4;i++)line(-.14+i*.075,hy-.22,-.32+i*.07,hy-.55-i*.025,.055,'#847876');
  line(.25,hy+.08,.67,hy+.2,.05,'#d7c997');line(.6,hy+.18,.62,hy+.25,.025,'#30252a');
 }else if(shape==='brute'){
  for(let i=0;i<5;i++)line(-.2+i*.1,hy+.2,-.16+i*.09,hy+.46,.08,'#494344');
  line(.23,hy+.12,.41,hy+.23,.075,'#b9a892');
 }else if(['horned','imp','zombie','cyber'].includes(shape)){
  line(.14,hy-.17,.36,hy-.12,.07,'#4b2529');line(.18,hy+.16,.43,hy+.22,.1,'#4a2227');
  for(let i=0;i<4;i++)line(.2+i*.055,hy+.15,.21+i*.055,hy+.23,.025,'#e0c8a0');
  if(shape==='cyber'){drawFacingBlock(-S*.13,S*(hy+.1),S*.3,S*.4,S*.08,1,'#7b7476','#3b3845','#a9a0a3');line(-.05,hy-.05,.18,hy+.03,.03,'#d24836');}
 }
}

function drawFiveTorso(u,shape,S,skin,height,torso,short){
 const organic=['horned','imp','zombie','mancubus','figure','seek','brute','angel','dragon','skeleton'].includes(shape);
 const bottom=-(short?.6:1),top=-height+.45;
 if(!organic){drawFacingBlock(0,bottom*S,S*torso*2,S*(height-(short?1.05:1.45)),S*.18,1,shade(skin,.1),shade(skin,-.2),shade(skin,.3));return;}
 ctx.save();ctx.beginPath();ctx.moveTo(-S*torso*.55,bottom*S);
 ctx.bezierCurveTo(-S*torso*1.15,(bottom-.35)*S,-S*torso*1.25,(top+.3)*S,-S*torso*.65,top*S);
 ctx.quadraticCurveTo(0,(top-.1)*S,S*torso*.75,top*S);
 ctx.bezierCurveTo(S*torso*1.2,(top+.35)*S,S*torso*.75,(bottom-.25)*S,S*torso*.45,bottom*S);ctx.closePath();
 const g=ctx.createLinearGradient(-torso*S,top*S,torso*S,bottom*S);g.addColorStop(0,shade(skin,-.4));g.addColorStop(.42,shade(skin,.1));g.addColorStop(.72,shade(skin,.2));g.addColorStop(1,shade(skin,-.2));ctx.fillStyle=g;ctx.fill();ctx.lineWidth=S*.035;ctx.strokeStyle=shade(skin,-.5);ctx.stroke();
 ctx.fillStyle=shade(skin,-.17);ctx.beginPath();ctx.ellipse(0,bottom*S,S*torso*.55,S*.16,0,0,TAU);ctx.fill();ctx.restore();
}

// Anatomies that previously fell through into the generic humanoid branch.
const FIVE_SPECIAL_ANATOMIES=new Set(['bug','engineer','prophet','shade']);
function drawFiveSpecialBody(u,shape,S,col,hit,walk){
 if(['vehicle','tank','aircraft'].includes(shape)){ctx.save();if(u.atk)ctx.translate(-S*.1*Math.sin(actionPhase(u)*Math.PI),S*.025*Math.sin(actionPhase(u)*Math.PI));const drawn=drawFiveVehicleProfile(u,shape,S,walk);ctx.restore();return drawn;}
 if(!FIVE_SPECIAL_ANATOMIES.has(shape))return false;
 const at=u.atk,ad=at?.def,t=at?.t||0,w=Math.max(.001,ad?.windup||.5),wind=at&&u.state==='attack'&&t<w?Math.sin(t/w*Math.PI/2):0,release=at&&u.state==='attack'&&t>=w?Math.exp(-(t-w)/.2):0;
 ctx.save();if(['bug','engineer','prophet'].includes(shape))ctx.translate(0,Math.sin(G.time*2.7+u.id)*S*.035);
 const ell=(x,y,rx,ry,c)=>{blob(x*S,y*S,rx*S,ry*S,c);ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=S*.025;ctx.stroke();};
 const line=(x,y,a,b,w,c)=>limb({x:x*S,y:y*S},{x:a*S,y:b*S},w*S,w*S*.65,c);
 const wing=(side,large)=>{
  const far=side<0,phase=G.time*(large?8:15)+u.id+(far?.65:0),span=(large?1.4:.95)*(far?.72:1),tx=-span,ty=-1.4-Math.sin(phase)*(large?.6:.45)-(far?.2:0),root={x:-.1*S,y:-1.2*S},tip={x:tx*S,y:ty*S},low={x:-span*.67*S,y:-(.65+Math.sin(phase)*.12)*S};
  ctx.save();ctx.globalAlpha*=far?.45:.8;ctx.fillStyle=visualMaterial(large?'#797b72':'#a5b7a9',-span*S,-S*2.3,span*S,S*1.8);ctx.strokeStyle=large?'#454b45':'#6d8b88';ctx.lineWidth=S*.025;ctx.beginPath();ctx.moveTo(root.x,root.y);ctx.quadraticCurveTo(-S*.45,tip.y-S*.12,tip.x,tip.y);ctx.lineTo(low.x,low.y);ctx.quadraticCurveTo(-S*.3,-S*.8,root.x,root.y);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.lineWidth=S*.015;for(let i=1;i<4;i++){const f=i/4;ctx.beginPath();ctx.moveTo(root.x,root.y);ctx.lineTo(tip.x*(1-f)+low.x*f,tip.y*(1-f)+low.y*f);ctx.stroke();}ctx.restore();
 };
 if(shape==='engineer'){
  // Huragok: suspended gas sacs, bent neck, sensory head and trailing tendrils; no human legs.
  const bob=0;
  ell(-.3,-1+bob,.72,.54,'#9c839c');ell(-.65,-.9+bob,.36,.35,'#74647e');
  for(let i=0;i<4;i++){const x=-.5+i*.2;ctx.strokeStyle=visualMaterial('#81728f',x*S,-S*.8,S*.6,S);ctx.lineWidth=S*.065;ctx.beginPath();ctx.moveTo(x*S,(-.75+bob)*S);ctx.bezierCurveTo((x+.3)*S,-S*.4,(x-.2)*S,-S*.1,(x+.25+Math.sin(G.time*2+i)*.12+wind*.18+release*.25)*S,(-.08-wind*.12)*S);ctx.stroke();}
  line(.05,-1.05,.23-wind*.08,-1.65-wind*.1,.14,'#a18ba5');line(.23-wind*.08,-1.65-wind*.1,.62+release*.12,-1.65-wind*.12,.12,'#b3a0b2');ell(.65+release*.12,-1.65-wind*.12,.27,.18,'#bda7b8');
  for(let i=0;i<3;i++)ell(.59+i*.1+release*.12,-1.7+i*.02-wind*.12,.035,.05,'#302435');
  ctx.strokeStyle='#665673';ctx.lineWidth=S*.022;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo((- .7+i*.22)*S,-S*1.35);ctx.quadraticCurveTo((-.6+i*.22)*S,-S*.95,(-.6+i*.22)*S,-S*.65);ctx.stroke();}
  if(wind||release){ctx.strokeStyle=`rgba(159,224,238,${wind*.4+release*.5})`;ctx.lineWidth=S*.022;ctx.beginPath();ctx.ellipse(S*.12,-S*.36,S*(.35+release*.2),S*(.13+wind*.07),0,0,TAU);ctx.stroke();}
  if(u.key.includes('explosive')){line(-.6,-1.35,-.15,-.65,.08,'#393b44');drawFacingBlock(-S*.1,-S*.9,S*.25,S*.22,S*.1,1,'#65646e','#343443','#96929d');}
 }else if(shape==='prophet'){
  // Gravity throne and seated, narrow-necked occupant rather than walking soldier.
  ell(-.1,-.32,.78,.23,'#403b61');drawFacingBlock(-S*.35,-S*.45,S*.3,S*1.35,S*.3,1,'#7f6b9e','#413859','#baa1cc');
  drawFacingBlock(S*.05,-S*.4,S*.72,S*.33,S*.2,1,'#8d79a4','#4e4566','#c8b1db');
  ctx.fillStyle=visualMaterial('#826947',-S*.3,-S*1.6,S*.7,S);ctx.beginPath();ctx.moveTo(-S*.23,-S*1.6);ctx.lineTo(S*.2,-S*1.65);ctx.lineTo(S*.43,-S*.55);ctx.lineTo(-S*.3,-S*.6);ctx.closePath();ctx.fill();
  line(.02,-1.5,.1,-2.03,.08,'#b9a99a');ell(.12,-2.15,.19,.31,'#b4aa9b');ell(.29,-2.03,.13,.08,'#a29785');ell(.24,-2.19,.025,.035,'#262c3d');line(.07,-1.4,.35-wind*.12,-1.1-wind*.15,.06,'#c1b9aa');line(.35-wind*.12,-1.1-wind*.15,.5+release*.2,-.95-wind*.3,.055,'#c1b9aa');
  const glow=ctx.createRadialGradient(-S*.05,-S*.22,0,-S*.05,-S*.22,S*.65);glow.addColorStop(0,`rgba(160,180,255,${.1+wind*.2+release*.3})`);glow.addColorStop(1,'rgba(120,160,240,0)');ctx.fillStyle=glow;ctx.fillRect(-S*.7,-S*.87,S*1.3,S*1.3);
  ctx.strokeStyle='#bcb0d7';ctx.lineWidth=S*.025;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-S*.45,-S*(.6+i*.25));ctx.lineTo(-S*.25,-S*(.66+i*.25));ctx.stroke();}
  ctx.strokeStyle='#b2b9ee';ctx.lineWidth=S*.025;ctx.beginPath();ctx.ellipse(-S*.05,-S*.22,S*.56,S*.08,0,0,TAU);ctx.stroke();
 }else if(shape==='bug'){
  const gargoyle=u.key==='dm_gargoyle',cherub=u.key==='dm_cherub';wing(-1,gargoyle);
  if(gargoyle){ell(0,-1.2,.28,.5,col);for(const side of [-1,1]){line(side*.12,-.9,side*.28+walk*.1,-.2,.09,col);line(side*.15,-1.45,.52+release*.3-wind*.15,-1.05+side*.1-wind*.2,.07,col);}ell(.1,-1.83,.22,.27,col);ell(.3,-1.85,.03,.04,'#f1b95c');}
  else{
   for(let i=0;i<4;i++){const side=i%2?1:-1,x=-.4+Math.floor(i/2)*.4;line(x,-.8,x+side*.4,-.4,.065,col);line(x+side*.4,-.4,x+side*.5+walk*.12,-.06,.045,shade(col,-.15));}
   ell(-.25,-.9,.58,.28,cherub?'#a68e74':'#687558');ell(.17,-1.2,.3,.4,cherub?'#d1b29c':col);ell(.3,-1.65,.25,cherub?.29:.2,cherub?'#d5bba4':'#9a9e69');
   for(let i=0;i<3;i++)line(-.55+i*.18,-1.08,-.5+i*.18,-.76,.025,'#424836');
   line(.28,-1.25,.68+release*.3-wind*.16,-.9-wind*.22,.06,cherub?'#d1b29c':col);ell(.46,-1.7,.035,.04,cherub?'#39303b':'#dbaa57');
  }wing(1,gargoyle);
  if(u.fac==='cv'){const hx=.68+release*.3-wind*.16,hy=-.9-wind*.22;line(hx,hy,hx+.25,hy,.09,'#5c6276');ell(hx+.25,hy,.045,.04,release>.1?'#dcfaff':'#95dfef');}
 }else{
  // Shadow entities retain a dark silhouette, not invented metallic equipment.
  ctx.fillStyle=visualMaterial('#393544',-S*.35,-S*2.15,S*.7,S*2.15);ctx.beginPath();ctx.moveTo(-S*.15,-S*1.7);ctx.quadraticCurveTo(-S*.5,-S*1.2,-S*.37,0);ctx.lineTo(S*.27,0);ctx.quadraticCurveTo(S*.45,-S*1.3,S*.14,-S*1.7);ctx.closePath();ctx.fill();
  ell(.05,-1.95,.25,.3,'#393544');line(.23,-1.93,.38,-1.87,.05,'#776e81');
 }
 ctx.restore();return true;
}

// Bespoke Doom profiles; render-only, using the existing attack clock.
function drawFiveDemonPolish(u,shape,S){
 const keys=['dm_cacodemon_classic','dm_cacodemon_2016','dm_cacodemon_eternal','dm_pain_elemental_classic','dm_pain_elemental_eternal','dm_lost_soul_classic','dm_lost_soul_2016','dm_lost_soul_eternal'];
 if(!keys.includes(u.key)||!['orb','skull'].includes(shape))return false;
 const a=u.atk,d=a?.def,t=a?.t||0,w=Math.max(.001,d?.windup||.5),wind=a&&u.state==='attack'&&t<w?Math.sin(t/w*Math.PI/2):0,hit=a&&u.state==='attack'&&t>=w?Math.exp(-(t-w)/.2):0,pain=u.key.includes('pain_elemental'),skull=shape==='skull',bob=Math.sin(G.time*2.7+u.id)*.065;
 ctx.save();ctx.scale(S,S);ctx.translate(-wind*.07+hit*.08,bob);ctx.lineWidth=.025;ctx.strokeStyle='#351e21';
 const ell=(x,y,rx,ry,c)=>{blob(x,y,rx,ry,c);if(G.quality!=='low'){const g=ctx.createLinearGradient(x-rx,y-ry,x+rx,y+ry);g.addColorStop(0,'rgba(255,235,196,.27)');g.addColorStop(.4,'rgba(255,220,200,.02)');g.addColorStop(1,'rgba(25,8,16,.42)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();}};
 if(skull){
  // Trailing flames bend independently; the skull remains a readable side profile.
  for(let i=0;i<6;i++){const yy=-1.3+i*.11,tail=.6+.18*Math.sin(G.time*8+i+u.id);ctx.fillStyle=i%2?'#f1a04b':'#d9562a';ctx.globalAlpha*=.65;ctx.beginPath();ctx.moveTo(-.13,yy-.08);ctx.quadraticCurveTo(-.5,yy-.2,-tail-hit*.4,yy+Math.sin(G.time*6+i)*.12);ctx.quadraticCurveTo(-.4,yy+.1,-.1,yy+.07);ctx.fill();ctx.globalAlpha/=.65;}
  ell(0,-1.12,.36,.4,'#cbbb9e');ell(.23,-1.17,.16,.12,'#281d1e');ell(.26,-1.18,.075,.06,'#ffb263');
  ctx.fillStyle='#b5a384';ctx.beginPath();ctx.moveTo(.18,-1);ctx.lineTo(.5,-.92);ctx.lineTo(.42,-.83);ctx.lineTo(.1,-.85);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.save();ctx.translate(.02,-.82);ctx.rotate(wind*.35-hit*.08);ctx.fillStyle='#b7a588';ctx.fillRect(0,0,.39,.1);ctx.fillStyle='#f1dfb9';for(let i=0;i<4;i++)ctx.fillRect(.06+i*.08,-.06,.045,.075);ctx.restore();
 }else{
  const col=pain?'#887048':'#ad413d',mouth=-.71,open=.13+wind*.19+hit*.1;
  if(pain){for(const side of [-1,1]){const ex=side*.7+hit*.08,ey=-.9-wind*.15;limb({x:side*.38,y:-1.25},{x:ex,y:ey},.13,.085,'#76603f');limb({x:ex,y:ey},{x:ex+.14,y:-.45-wind*.15},.085,.06,'#99805b');for(let i=0;i<3;i++){ctx.strokeStyle='#ded1ad';ctx.lineWidth=.035;ctx.beginPath();ctx.moveTo(ex+.14+i*.04,-.45-wind*.15);ctx.lineTo(ex+.2+i*.035,-.32-wind*.15);ctx.stroke();}}}
  ell(-.02,-1.04,.66,.65,col);
  ctx.strokeStyle=pain?'#453e2d':'#632d30';ctx.lineWidth=.025;for(let i=0;i<6;i++){const angle=i*2.39;ctx.beginPath();ctx.moveTo(Math.cos(angle)*.43,-1.04+Math.sin(angle)*.43);ctx.lineTo(Math.cos(angle+.18)*.55,-1.04+Math.sin(angle+.18)*.5);ctx.stroke();}
  // Curved horns, socket rims and lower-jaw teeth, not a generic smiling sphere.
  for(const side of [-1,1]){ctx.fillStyle='#d3bd91';ctx.strokeStyle='#6a5544';ctx.beginPath();ctx.moveTo(side*.37,-1.5);ctx.quadraticCurveTo(side*.75,-1.65,side*.67,-1.94);ctx.quadraticCurveTo(side*.48,-1.68,side*.26,-1.57);ctx.closePath();ctx.fill();ctx.stroke();}
  ell(.22,-1.27,.27,.23,pain?'#4a3b27':'#552b2c');ell(.27,-1.28,.18,.17,pain?'#e79947':'#a2d5ac');ell(.32,-1.28,.055,.13,'#1d2921');ell(.34,-1.33,.035,.035,'#eef4c9');
  ctx.fillStyle=pain?'#2c2119':'#292033';ctx.beginPath();ctx.ellipse(.24,mouth,.34,open,-.08,0,TAU);ctx.fill();ctx.strokeStyle=pain?'#b1976a':'#cf6e68';ctx.lineWidth=.04;ctx.stroke();
  ctx.fillStyle='#e2d5af';for(let i=0;i<5;i++){const xx=.01+i*.105;ctx.beginPath();ctx.moveTo(xx,mouth-open*.8);ctx.lineTo(xx+.045,mouth-open*.8+.1);ctx.lineTo(xx+.075,mouth-open*.8);ctx.fill();ctx.beginPath();ctx.moveTo(xx,mouth+open*.8);ctx.lineTo(xx+.04,mouth+open*.8-.075);ctx.lineTo(xx+.07,mouth+open*.8);ctx.fill();}
  if(wind||hit){const g=ctx.createRadialGradient(.26,mouth,0,.26,mouth,.28);g.addColorStop(0,`rgba(255,${pain?181:150},90,${Math.min(1,wind*.75+hit*.85)})`);g.addColorStop(1,'rgba(242,90,60,0)');ctx.fillStyle=g;ctx.fillRect(-.03,mouth-.29,.58,.58);}
 }
 ctx.restore();return true;
}

function drawFiveHeldPolish(u,shape,S,el,ha){
 const d=u.atk?.def,m=d?.fiveMelee,theta=Math.atan2(ha.y-el.y,ha.x-el.x);
 ctx.save();ctx.translate(ha.x,ha.y);ctx.rotate(theta);ctx.lineWidth=S*.025;
 if(shape==='yautja'){
  if(m==='spear'){
   ctx.strokeStyle='#727a75';ctx.lineWidth=S*.045;ctx.beginPath();ctx.moveTo(-S*.5,0);ctx.lineTo(S*.95,0);ctx.stroke();ctx.fillStyle='#c7cdb9';ctx.beginPath();ctx.moveTo(S*.85,-S*.1);ctx.lineTo(S*1.2,0);ctx.lineTo(S*.85,S*.1);ctx.closePath();ctx.fill();
  }else if(m==='whip'){
   ctx.strokeStyle='#a3a993';ctx.lineWidth=S*.035;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(S*.3,-S*.4,S*.75,S*.4,S*1.15,-S*.12);ctx.stroke();
  }else{
   ctx.fillStyle='#858f87';ctx.fillRect(-S*.22,-S*.13,S*.3,S*.26);ctx.fillStyle='#d4d9ca';ctx.strokeStyle='#606c66';for(let i=0;i<2;i++){const yy=(i-.5)*S*.12;ctx.beginPath();ctx.moveTo(0,yy-S*.035);ctx.lineTo(S*.6,yy);ctx.lineTo(0,yy+S*.035);ctx.closePath();ctx.fill();ctx.stroke();}
  }
 }else if(u.fac==='cv'&&m==='blade'){
  ctx.fillStyle='#9beeff';ctx.strokeStyle='#d8fcff';ctx.lineWidth=S*.025;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(0,side*S*.035);ctx.quadraticCurveTo(S*.45,side*S*.28,S*.85,side*S*.12);ctx.lineTo(S*.14,side*S*.03);ctx.closePath();ctx.fill();ctx.stroke();}
 }else if(u.fac==='cv'&&m==='hammer'){
  ctx.strokeStyle='#665c70';ctx.lineWidth=S*.065;ctx.beginPath();ctx.moveTo(-S*.24,0);ctx.lineTo(S*.65,0);ctx.stroke();drawFacingBlock(S*.65,S*.22,S*.27,S*.62,S*.11,1,'#645a6b','#302e3a','#b1a1b3');ctx.fillStyle='#86d5ed';ctx.fillRect(S*.68,-S*.17,S*.05,S*.24);
 }
 ctx.restore();
}

function drawFiveHoundPolish(u,shape,S){
 const keys=['pr_yautja_hunting_hound','pr_upgraded_predator_hound','th_dog_imitation','dm_marauder_spirit_wolf'];
 if(shape!=='hound'||!keys.includes(u.key))return false;
 const wolf=u.key==='dm_marauder_spirit_wolf',thing=u.fac==='th',upgraded=u.key==='pr_upgraded_predator_hound',a=u.atk,d=a?.def,t=a?.t||0,w=Math.max(.001,d?.windup||.5),wind=a&&u.state==='attack'&&t<w?Math.sin(t/w*Math.PI/2):0,hit=a&&u.state==='attack'&&t>=w?Math.exp(-(t-w)/.18):0,moving=u.moveSpd>4,gait=u.gait||0;
 const skin=wolf?'#477653':thing?'#87665e':upgraded?'#484641':'#4c5355',bone=wolf?'#b4e5a8':'#c4c2a5';
 ctx.save();ctx.scale(S,S);ctx.translate(-wind*.1+hit*.18,moving?Math.cos(gait*2)*.025:Math.sin(G.time*2+u.id)*.012);ctx.lineJoin='round';ctx.lineCap='round';
 if(wolf){ctx.globalAlpha*=.82;const g=ctx.createRadialGradient(0,-.65,.1,0,-.65,1.05);g.addColorStop(0,'rgba(111,226,132,.19)');g.addColorStop(1,'rgba(76,216,121,0)');ctx.fillStyle=g;ctx.fillRect(-1.1,-1.8,2.2,2);}
 const ell=(x,y,rx,ry,c)=>{blob(x,y,rx,ry,c);const g=ctx.createLinearGradient(x-rx,y-ry,x+rx,y+ry);g.addColorStop(0,'rgba(227,225,208,.21)');g.addColorStop(.4,'rgba(200,210,205,.01)');g.addColorStop(1,'rgba(7,15,16,.4)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();};
 const leg=(front,far)=>{const xx=front?.43:-.45,phase=gait+(front?0:Math.PI)+(far?Math.PI:0),step=moving?Math.sin(phase)*.19:0,lift=moving?Math.max(0,Math.cos(phase))*.14:0,hip={x:xx,y:-.57},knee={x:xx+(front?-.05:.12)+step*.45,y:-.3-lift*.4},paw={x:xx+step+(front?.12:-.03),y:-lift};limb(hip,knee,far?.075:.1,.06,far?shade(skin,-.3):skin);limb(knee,paw,.06,.045,skin);ell(paw.x+.04,paw.y,.105,.045,far?shade(skin,-.2):skin);ctx.strokeStyle=bone;ctx.lineWidth=.015;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(paw.x+.06+i*.025,paw.y-.01);ctx.lineTo(paw.x+.095+i*.025,paw.y+.015);ctx.stroke();}};
 leg(false,true);leg(true,true);
 // Tail follows its root and gait; it is not a rigid horizontal pole.
 ctx.strokeStyle=skin;ctx.lineWidth=upgraded?.1:.075;ctx.beginPath();ctx.moveTo(-.58,-.64);ctx.quadraticCurveTo(-.9,-.68+Math.sin(G.time*2+u.id)*.06,-1.05,-.9+(moving?Math.sin(gait)*.08:0));ctx.stroke();
 ell(-.02,-.68,.66,upgraded?.37:.3,skin);ell(.34,-.76,upgraded?.35:.28,.3,skin);
 ctx.strokeStyle=shade(skin,-.35);ctx.lineWidth=.025;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-.26+i*.14,-.87);ctx.lineTo(-.29+i*.14,-.58);ctx.stroke();}
 if(u.fac==='pr'&&!upgraded){ctx.fillStyle='#b4b49e';ctx.strokeStyle='#575e58';ctx.lineWidth=.018;for(let i=0;i<5;i++){const xx=-.48+i*.19;ctx.beginPath();ctx.moveTo(xx,-.9);ctx.lineTo(xx-.08,-1.16+(i%2)*.06);ctx.lineTo(xx+.09,-.93);ctx.closePath();ctx.fill();ctx.stroke();}}
 leg(false,false);leg(true,false);
 ctx.save();ctx.translate(.55,-.94+wind*.04-hit*.045);ctx.rotate(wind*.12-hit*.08);
 ell(.03,0,upgraded?.3:.25,upgraded?.27:.24,skin);ell(upgraded?.23:.27,.12,upgraded?.22:.3,.13,shade(skin,.07));
 ctx.fillStyle=wolf?'#94ba8e':skin;ctx.beginPath();ctx.moveTo(-.15,-.13);ctx.lineTo(-.13,upgraded?-.27:-.45);ctx.lineTo(.02,-.18);ctx.closePath();ctx.fill();
 ctx.fillStyle=wolf?'#d2ffd1':thing?'#dbbc85':'#d7d797';ctx.beginPath();ctx.ellipse(.12,-.035,.055,.025,-.15,0,TAU);ctx.fill();
 const jaw=.06+wind*.24+hit*.04;ctx.fillStyle=thing?'#4b2227':'#12191b';ctx.beginPath();ctx.moveTo(.08,.15);ctx.lineTo(.48,.12);ctx.lineTo(.44,.2+jaw*.4);ctx.lineTo(.04,.2+jaw*.2);ctx.closePath();ctx.fill();
 ctx.save();ctx.translate(.02,.17);ctx.rotate(jaw);ell(.2,.035,.26,.065,shade(skin,-.12));ctx.fillStyle=bone;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(.11+i*.08,0);ctx.lineTo(.13+i*.08,-.06);ctx.lineTo(.16+i*.08,0);ctx.fill();}ctx.restore();ctx.restore();
 if(thing){ctx.strokeStyle='#8f4f52';ctx.lineWidth=.03;ctx.beginPath();ctx.moveTo(.28,-.88);ctx.bezierCurveTo(.08,-.7,.38,-.56,.14,-.4);ctx.stroke();}
 ctx.restore();return true;
}

// Grumble profiles: render-only articulation, driven by the existing attack clock.
function drawFiveGrumblePolish(u,shape,S){
 if(shape!=='grumble'||!['dr_grumble','dr_queen_grumble'].includes(u.key))return false;
 const queen=u.key==='dr_queen_grumble',a=u.atk,d=a?.def,t=a?.t||0,w=Math.max(.001,d?.windup||.5),wind=a&&u.state==='attack'&&t<w?Math.sin(t/w*Math.PI/2):0,strike=a&&u.state==='attack'&&t>=w?Math.exp(-(t-w)/.22):0,walk=Math.min(1,(u.moveSpd||0)/80),col=queen?'#a79883':'#b6a891';
 ctx.save();ctx.scale(S,S);ctx.translate(-wind*.12+strike*.25,-wind*.07+Math.sin(u.gait||0)*walk*.035);ctx.lineJoin='round';ctx.lineCap='round';
 const ell=(x,y,rx,ry,c)=>{ctx.fillStyle=visualMaterial(c,x-rx,y-ry,rx*2,ry*2);ctx.strokeStyle=shade(c,-.45);ctx.lineWidth=.025;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();ctx.stroke();};
 const seg=(x,y,tx,ty,r,c)=>limb({x,y},{x:tx,y:ty},r,r*.65,c);
 const legs=far=>{for(let i=0;i<4;i++){const root=-.7+i*.4,step=Math.sin((u.gait||0)+i*1.8+(far?Math.PI:0))*walk,side=far?-1:1,kx=root+(i<2?-.4:.45),ky=-.55+(far?-.18:.15)-wind*.13;
 seg(root,-.92,kx,ky,.14,shade(col,far?-.32:-.05));seg(kx,ky,kx+.2+step*.17,-.04-step*.08,.1,shade(col,far?-.4:-.18));seg(kx+.2+step*.17,-.04-step*.08,kx+.34+step*.17,-.02,.055,'#574c41');ell(kx,ky,.085,.085,shade(col,-.15));}};
 legs(true);ell(-.2,-.88,1.02,.68,col);ell(.52,-.92,.57,.65,col);
 // Scalloped dorsal folds and worn, uneven skin, kept deterministic.
 for(let i=0;i<7;i++){const x=-1+i*.24;ctx.strokeStyle=shade(col,-.25);ctx.lineWidth=.025;ctx.beginPath();ctx.moveTo(x,-1.22);ctx.quadraticCurveTo(x-.12,-.92,x+.07,-.67);ctx.stroke();}
 for(let i=0;i<21;i++){const x=-.97+(i%7)*.24,y=-1.25+Math.floor(i/7)*.24;ell(x,y,.028+(i%3)*.012,.018,shade(col,i%2?-.19:.13));}
 const gape=.27+wind*.1+strike*.22;ell(.64,-.91,.43,gape,'#241e1c');ell(.65,-.82+gape*.5,.25,.08,'#826059');
 ctx.fillStyle='#d7c7a8';ctx.strokeStyle='#716454';ctx.lineWidth=.013;
 for(let i=0;i<7;i++){const x=.29+i*.105,curve=Math.sin(i/6*Math.PI),top=-.91-gape*curve,bottom=-.91+gape*curve;
 for(const upper of [true,false]){const y=upper?top:bottom;ctx.beginPath();ctx.moveTo(x-.037,y);ctx.lineTo(x+.035,y);ctx.lineTo(x+.014,y+(upper?1:-1)*(.09+(i%3)*.025));ctx.closePath();ctx.fill();ctx.stroke();}}
 // Small recessed eyes above the upper jaw; face and mouth point toward travel.
 for(let i=0;i<5;i++){const x=.06+i*.19,y=-1.35-Math.sin(i*.8)*.09;ell(x,y,.075,.065,'#51473e');ell(x+.016,y,.038,.032,'#d1b9aa');ell(x+.025,y,.015,.026,'#211d1b');}
 legs(false);
 if(queen){ctx.strokeStyle='#594d43';ctx.lineWidth=.042;ctx.beginPath();ctx.moveTo(.17,-1.51);ctx.lineTo(.29,-1.34);ctx.lineTo(.23,-1.18);ctx.stroke();}
 ctx.restore();return true;
}

// Seek derivatives: visual-only profiles; no simulation or attack changes.
function drawFiveSeekPolish(u,shape,S){
 if(!['dr_seek_dam','dr_seek_hand','dr_seek_sludge','dr_seek_worm'].includes(u.key))return false;
 const a=u.atk,d=a?.def,t=a?.t||0,w=Math.max(.001,d?.windup||.5),wind=a&&u.state==='attack'&&t<w?Math.sin(t/w*Math.PI/2):0,hit=a&&u.state==='attack'&&t>=w?Math.exp(-(t-w)/.24):0,bob=Math.sin(G.time*2.3+u.id)*.025;
 ctx.save();ctx.scale(S,S);ctx.translate(-wind*.09+hit*.18,bob);ctx.lineCap='round';ctx.lineJoin='round';
 const ell=(x,y,rx,ry,c)=>{ctx.fillStyle=visualMaterial(c,x-rx,y-ry,rx*2,ry*2);ctx.strokeStyle='#070a0e';ctx.lineWidth=.022;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();ctx.stroke();};
 const stroke=(pts,width,c)=>{ctx.strokeStyle=c;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(pts[0],pts[1]);ctx.bezierCurveTo(...pts.slice(2));ctx.stroke();};
 const eye=(x,y,r)=>{ell(x,y,r,r*.62,'#deddd2');ell(x+r*.23,y,r*.3,r*.5,'#080b0e');ell(x+r*.32,y-r*.18,r*.09,r*.12,'#f6f9fa');};
 ell(-.16,-.03,.9,.15,'#171b22');
 if(u.key==='dr_seek_hand'){
  stroke([-.55,-.04,-.6,-.6,.05-wind*.25,-.48,.15+hit*.35,-1.08-wind*.18],.27,'#20252d');
  const px=.15+hit*.35,py=-1.13-wind*.18;ell(px,py,.25,.31,'#242a32');
  for(let i=0;i<4;i++){const x=px-.16+i*.11,len=.38+(i===1?.1:0),curl=wind*.22-hit*.13;stroke([x,py-.12,x-.08,py-len,x+.07+curl,py-len-.22,x+.17+curl,py-len-.09],.075,'#303741');stroke([x+.01,py-.15,x-.025,py-len,x+.08+curl,py-len-.15,x+.13+curl,py-len-.08],.018,'#66707c');}
  stroke([px+.16,py+.1,px+.48,py+.12,px+.53,py-.15,px+.35,py-.23],.11,'#303741');
 }else if(u.key==='dr_seek_worm'){
  stroke([-.8,-.08,-.66,-.75,-.15,-.25,.35+hit*.25,-1.04-wind*.12],.6,'#222831');
  for(let i=0;i<6;i++){const f=i/6;ell(-.64+f*.8,-.18-f*.65,.27-f*.045,.09,'#303844');}
  const x=.42+hit*.25,y=-1.09-wind*.12,gape=.32+wind*.07+hit*.16;ell(x,y,.46,gape+.1,'#313842');ell(x+.1,y,.34,gape,'#05070b');
  ctx.fillStyle='#c9c4b6';for(let i=0;i<12;i++){const ang=i*TAU/12,cx=x+.1+Math.cos(ang)*.3,cy=y+Math.sin(ang)*gape*.88;ctx.beginPath();ctx.moveTo(cx-Math.sin(ang)*.035,cy+Math.cos(ang)*.035);ctx.lineTo(cx+Math.sin(ang)*.035,cy-Math.cos(ang)*.035);ctx.lineTo(cx-Math.cos(ang)*.12,cy-Math.sin(ang)*.12);ctx.closePath();ctx.fill();}
 }else{
  const dam=u.key==='dr_seek_dam';
  for(let i=0;i<6;i++){const x=-.75+i*.28,y=-.15-Math.sin(i*.8)*.12;ell(x,y,.34,.18,'#252c35');}
  if(dam){
   for(let i=0;i<4;i++){const x=-.66+i*.4,h=.5+Math.sin(i*1.8)*.2+wind*.12;stroke([x,-.12,x-.25,-h,x+.1,-h-.3,x+.14+hit*.15,-h-.1],.22,'#272f39');ell(x+.03,-h*.7,.12,.19,'#37414c');}
   eye(.29,-.61,.2);eye(-.49,-.37,.11);
  }else{
   ell(-.08,-.45-hit*.2,.68,.42+wind*.08,'#252d37');ell(.38,-.66-hit*.2,.34,.3,'#303a46');eye(.53,-.76-hit*.2,.15);
   for(let side of [-1,1])stroke([-.1,-.4,-.1+side*.45,-.65-wind*.2,.5+hit*.35,-.6+side*.15,.68+hit*.35,-.31+side*.12],.13,'#343e49');
   ell(.6,-.49-hit*.2,.16,.08+hit*.1,'#080b10');
  }
  for(let i=0;i<8;i++){const x=-.8+i*.22;ell(x,-.16-Math.sin(i*1.7)*.065,.045,.02,'#65717d');}
 }
 ctx.restore();return true;
}

// Dedicated plant silhouettes. Reads animation state only.
function drawFivePlantPolish(u,shape,S){
 if(!['dr_world_lotus','dr_eyestalk','dr_bramble','dr_mandrake'].includes(u.key))return false;
 const a=u.atk,d=a?.def,t=a?.t||0,w=Math.max(.001,d?.windup||.5),wind=a&&u.state==='attack'&&t<w?Math.sin(t/w*Math.PI/2):0,hit=a&&u.state==='attack'&&t>=w?Math.exp(-(t-w)/.26):0,sway=Math.sin(G.time*2+u.id)*.035;
 ctx.save();ctx.scale(S,S);ctx.lineCap='round';ctx.lineJoin='round';
 const ell=(x,y,rx,ry,c)=>{ctx.fillStyle=visualMaterial(c,x-rx,y-ry,rx*2,ry*2);ctx.strokeStyle=shade(c,-.45);ctx.lineWidth=.025;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();ctx.stroke();};
 const stem=(x,y,tx,ty,width,c,bend=0)=>{ctx.strokeStyle=c;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+bend,y+(ty-y)*.4,tx-bend,y+(ty-y)*.7,tx,ty);ctx.stroke();};
 const leaf=(x,y,tx,ty,c)=>{const dx=tx-x,dy=ty-y;ctx.fillStyle=visualMaterial(c,Math.min(x,tx)-.1,Math.min(y,ty)-.1,Math.abs(dx)+.2,Math.abs(dy)+.2);ctx.strokeStyle=shade(c,-.4);ctx.lineWidth=.018;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+dx*.2-dy*.25,y+dy*.2+dx*.25,tx,ty);ctx.quadraticCurveTo(x+dx*.65+dy*.22,y+dy*.65-dx*.22,x,y);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke();};
 for(let i=0;i<5;i++)stem(0,-.12,-.65+i*.32,-.015,.07,'#655744',Math.sin(i)*.15);
 if(u.key==='dr_world_lotus'){
  for(let i=0;i<6;i++){const a=i*TAU/6;leaf(0,-.1,Math.cos(a)*.85,-.15+Math.sin(a)*.21,'#456e64');}
  stem(0,-.1,sway,-.7-wind*.12,.12,'#527e70');
  const cy=-.78-wind*.12;for(let layer=0;layer<2;layer++)for(let i=0;i<7;i++){const a=i*TAU/7+layer*.4,spread=.62-layer*.19+hit*.16-wind*.08;leaf(sway,cy,Math.cos(a)*spread+sway,cy-.22+Math.sin(a)*spread*.5-layer*.23,layer?'#c6d6d0':'#819d9b');}
  ell(sway,cy,.15,.1,'#d8c78b');
  if(wind||hit){ctx.strokeStyle=`rgba(181,224,219,${wind*.35+hit*.6})`;ctx.lineWidth=.025;ctx.beginPath();ctx.ellipse(sway,cy,.25+hit*.6,.12+hit*.22,0,0,TAU);ctx.stroke();}
 }else if(u.key==='dr_eyestalk'){
  const x=.17+sway-wind*.16+hit*.14,y=-1.65-wind*.12;
  stem(0,-.1,x,y,.15,'#6c8054',-.35);stem(-.025,-.1,x-.03,y,.025,'#a2ad76',-.35);
  leaf(-.03,-.55,-.62,-.94,'#5e794c');leaf(.02,-.9,.51,-1.2,'#6b8755');
  ell(x,y,.38,.25,'#6e7c55');ell(x+.07,y,.27,.18,'#d9d3b5');ell(x+.17+hit*.03,y,.1,.15,'#8d9c67');ell(x+.2+hit*.03,y,.038,.12,'#1a2222');ell(x+.2,y-.055,.025,.035,'#eef1d8');
 }else if(u.key==='dr_bramble'){
  for(let i=0;i<6;i++){const side=i%2?1:-1,tx=side*(.65+(i%3)*.2)+hit*.3,ty=-.2-(i%3)*.37-wind*.2;
   stem(-.1,-.08,tx,ty,.095,'#5d6b44',side*.38);
   for(let j=1;j<4;j++){const f=j/4,x=tx*f,y=-.08+(ty+.08)*f;ctx.fillStyle='#c3b18c';ctx.beginPath();ctx.moveTo(x-.04,y);ctx.lineTo(x+side*.11,y-.13);ctx.lineTo(x+.045,y+.03);ctx.closePath();ctx.fill();}
   leaf(tx*.65,ty*.65,tx*.65+side*.23,ty*.65-.22,'#758255');}
  ell(-.08,-.16,.27,.19,'#4c593a');
 }else{
  const x=sway-wind*.08+hit*.1;
  for(let i=0;i<5;i++)leaf(x,-1.27-wind*.08,x-.65+i*.3,-1.7-Math.sin(i)*.25-wind*.13,'#647b42');
  ell(x,-.78,.29,.6,'#9c815a');ell(x+.03,-1.12,.33,.3,'#ac946a');
  for(const side of [-1,1]){stem(x+side*.19,-.8,x+side*(.55+hit*.2),-.5-wind*.2,.085,'#977b53',side*.15);stem(x+side*.12,-.3,x+side*.34,-.02,.1,'#806743');}
  ell(x+.2,-1.16,.045,.04,'#302d24');ell(x-.08,-1.16,.045,.04,'#302d24');ell(x+.09,-.98,.08,.045+wind*.04+hit*.09,'#433629');
  for(let i=0;i<4;i++){ctx.strokeStyle='#756043';ctx.lineWidth=.02;ctx.beginPath();ctx.moveTo(x-.15,-.77+i*.12);ctx.lineTo(x+.17,-.8+i*.12);ctx.stroke();}
 }
 ctx.restore();return true;
}

// DOORS apparitions: individual silhouettes, driven only by the existing animation clock.
function drawFiveApparitionPolish(u,shape,S){
 if(!['dr_rush','dr_ambush','dr_screech','dr_halt'].includes(u.key))return false;
 const a=u.atk,d=a?.def,t=a?.t||0,w=Math.max(.001,d?.windup||.5),wind=a&&u.state==='attack'&&t<w?Math.sin(t/w*Math.PI/2):0,hit=a&&u.state==='attack'&&t>=w?Math.exp(-(t-w)/.24):0,bob=Math.sin(G.time*3+u.id)*.045;
 ctx.save();ctx.scale(S,S);ctx.translate(-wind*.13+hit*.27,bob);ctx.lineJoin='round';ctx.lineCap='round';
 const ell=(x,y,rx,ry,c)=>{ctx.fillStyle=visualMaterial(c,x-rx,y-ry,rx*2,ry*2);ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=.022;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();ctx.stroke();};
 const teeth=(x,y,width,height,n,c)=>{ctx.fillStyle=c;for(let i=0;i<n;i++){const tx=x+width*i/n;ctx.beginPath();ctx.moveTo(tx,y);ctx.lineTo(tx+width/n*.75,y);ctx.lineTo(tx+width/n*.4,y+height*(i%2?.8:1));ctx.closePath();ctx.fill();}};
 const trail=(col,count)=>{ctx.save();for(let i=count;i>0;i--){ctx.globalAlpha=(.035+hit*.035)*(count+1-i);ctx.strokeStyle=col;ctx.lineWidth=.11;ctx.beginPath();ctx.moveTo(-.35-i*.15,-1.45);ctx.bezierCurveTo(-1-i*.12,-1.45+Math.sin(G.time*3+i)*.12,-.7-i*.2,-.7,-1-i*.15,-.45);ctx.stroke();}ctx.restore();};
 if(u.key==='dr_halt'){
  trail('#78cadc',4);ctx.save();ctx.globalAlpha*=.8;
  ctx.fillStyle=visualMaterial('#497f97',-.6,-2,1.2,2);ctx.strokeStyle='#8bcbd6';ctx.lineWidth=.025;ctx.beginPath();ctx.moveTo(-.05,-2.05);ctx.bezierCurveTo(-.65,-2.1,-.55,-1.1,-.64,-.22);for(let i=0;i<7;i++)ctx.lineTo(-.64+i*.19,-.2-Math.sin(i*2+G.time*2)*.12);ctx.bezierCurveTo(.6,-1,.63,-1.9,.24,-2.02);ctx.closePath();ctx.fill();ctx.stroke();
  for(let i=0;i<5;i++){ctx.strokeStyle='rgba(173,226,234,.23)';ctx.lineWidth=.025;ctx.beginPath();ctx.moveTo(-.32+i*.15,-1.2);ctx.quadraticCurveTo(-.45+i*.18,-.6,-.42+i*.2,-.25);ctx.stroke();}
  ell(-.09,-1.6,.12,.13,'#c8f2f1');ell(.27,-1.59,.13,.13,'#c8f2f1');ell(.11,-1.21,.12,.15+hit*.08,'#244350');ctx.restore();
 }else if(u.key==='dr_screech'){
  for(let i=0;i<6;i++){const ang=i*TAU/6,x=Math.cos(ang)*.38,y=-1+Math.sin(ang)*.32,tx=Math.cos(ang)*(.95+hit*.22)-wind*.1,ty=-1+Math.sin(ang)*(.77+wind*.13);ctx.strokeStyle='#181c26';ctx.lineWidth=.14;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x*1.6,y-.2,tx-.2,ty-.25,tx,ty);ctx.stroke();ctx.strokeStyle='#4c5260';ctx.lineWidth=.025;ctx.stroke();}
  ell(0,-1,.55,.5,'#151922');ell(.12,-1.02,.42,.4,'#bbb9ab');ell(-.02,-1.17,.13,.14,'#f4eed4');ell(.31,-1.16,.12,.14,'#f4eed4');ell(.02,-1.16,.04,.075,'#171a22');ell(.35,-1.15,.04,.075,'#171a22');
  const gape=.1+wind*.07+hit*.18;ell(.17,-.82,.29,gape,'#10131b');teeth(-.08,-.84-gape*.3,.49,.09,7,'#ded7bd');
 }else if(u.key==='dr_ambush'){
  trail('#92b5a1',5);ctx.save();ctx.globalAlpha*=.88;ctx.fillStyle=visualMaterial('#b6c4ad',-.68,-1.95,1.3,1.8);ctx.strokeStyle='#748c79';ctx.lineWidth=.04;ctx.beginPath();ctx.moveTo(-.5,-1.92);ctx.bezierCurveTo(-.85,-1.45,-.44,-.7,-.35,-.26);ctx.lineTo(.08,-.08);ctx.lineTo(.48,-.3);ctx.bezierCurveTo(.62,-.95,.78,-1.64,.36,-1.9);ctx.quadraticCurveTo(-.05,-2.09,-.5,-1.92);ctx.fill();ctx.stroke();
  ell(-.18,-1.51,.2,.28,'#172a24');ell(.31,-1.5,.22,.29,'#172a24');ell(-.12,-1.51,.09,.16,'#8bba9d');ell(.37,-1.5,.1,.17,'#8bba9d');
  ell(.1,-.76,.29,.43+hit*.09,'#172820');teeth(-.11,-1.06,.43,.12,6,'#d5d6bc');teeth(-.08,-.43,.37,-.1,5,'#d5d6bc');ctx.restore();
 }else{
  trail('#89909d',5);ctx.fillStyle=visualMaterial('#333640',-.75,-1.8,1.5,1.6);ctx.strokeStyle='#747682';ctx.lineWidth=.025;ctx.beginPath();for(let i=0;i<32;i++){const ang=i*TAU/32,r=.65+Math.sin(i*7.2)*.09;const x=Math.cos(ang)*r,y=-1+Math.sin(ang)*r;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();
  ell(-.18,-1.22,.17,.11,'#d6d7ce');ell(.29,-1.24,.2,.12,'#deded3');ell(-.12,-1.22,.045,.07,'#171a20');ell(.37,-1.24,.05,.075,'#171a20');
  ctx.fillStyle='#0a0d13';ctx.beginPath();ctx.moveTo(-.34,-.98);ctx.quadraticCurveTo(.06,-.68,.52,-1);ctx.quadraticCurveTo(.36,-.35,-.04,-.46);ctx.quadraticCurveTo(-.28,-.51,-.34,-.98);ctx.fill();teeth(-.25,-.89,.67,.16+hit*.06,9,'#cecbbd');
  // Deterministic grain avoids consuming gameplay randomness during rendering.
  for(let i=0;i<32;i++){const x=-.55+(i%8)*.15,y=-1.47+Math.floor(i/8)*.28;ctx.fillStyle=i%2?'rgba(218,222,224,.18)':'rgba(0,0,0,.25)';ctx.fillRect(x,y,.045,.025);}
 }
 ctx.restore();return true;
}

// Gaze entities: render-only silhouettes, reading the existing attack clock.
function drawFiveGazePolish(u,shape,S){
 if(!['dr_eyes','dr_lookman'].includes(u.key))return false;
 const a=u.atk,d=a?.def,t=a?.t||0,w=Math.max(.001,d?.windup||.5),wind=a&&u.state==='attack'&&t<w?Math.sin(t/w*Math.PI/2):0,hit=a&&u.state==='attack'&&t>=w?Math.exp(-(t-w)/.28):0,look=u.key==='dr_lookman',bob=Math.sin(G.time*2.2+u.id)*.04;
 ctx.save();ctx.scale(S,S);ctx.translate(-wind*.045+hit*.06,bob);ctx.lineJoin='round';ctx.lineCap='round';
 const ell=(x,y,rx,ry,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();};
 const eye=(x,y,r,i)=>{
  const blink=.86+Math.sin(G.time*1.7+i*1.8)*.09-wind*.2+hit*.26;
  ell(x,y,r*1.19,r*.65*blink,look?'#3a3536':'#554968');
  ctx.fillStyle=visualMaterial(look?'#d9d1c3':'#dcd6eb',x-r,y-r,r*2,r*2);ctx.beginPath();ctx.moveTo(x-r,y);ctx.quadraticCurveTo(x,y-r*blink,x+r,y);ctx.quadraticCurveTo(x,y+r*blink,x-r,y);ctx.fill();
  ell(x+r*.26,y,r*.3,r*.43*blink,look?'#a3896a':'#9976bf');ell(x+r*.32,y,r*(.13-wind*.025+hit*.02),r*.34*blink,'#15121d');ell(x+r*.35,y-r*.18,r*.075,r*.09,'#ffffff');
 };
 if(look){
  // Unequal shoulders and an offset face retain a clear facing direction.
  ctx.fillStyle=visualMaterial('#202027',-.65,-2.4,1.3,2.4);ctx.strokeStyle='#4c4651';ctx.lineWidth=.025;ctx.beginPath();ctx.moveTo(-.24,-1.64);ctx.lineTo(-.53,-1.4);ctx.lineTo(-.67,-.42);ctx.lineTo(-.48,-.38);ctx.lineTo(-.31,-1.04);ctx.lineTo(-.3,-.42);ctx.lineTo(-.43,-.02);ctx.lineTo(-.1,-.02);ctx.lineTo(.04,-.48);ctx.lineTo(.14,-.02);ctx.lineTo(.41,-.02);ctx.lineTo(.29,-.58);ctx.lineTo(.28,-1.08);ctx.lineTo(.43,-.48);ctx.lineTo(.58,-.52);ctx.lineTo(.44,-1.42);ctx.lineTo(.18,-1.66);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=visualMaterial('#27232c',-.36,-2.26,.75,.7);ctx.beginPath();ctx.ellipse(.025,-1.9,.32,.4,-.08,0,TAU);ctx.fill();ctx.stroke();
  eye(-.09,-1.95,.115,0);eye(.19,-1.94,.12,1);
  for(let i=0;i<4;i++){ctx.strokeStyle='rgba(113,100,117,.18)';ctx.lineWidth=.022;ctx.beginPath();ctx.moveTo(-.24+i*.14,-1.38);ctx.lineTo(-.3+i*.17,-.61);ctx.stroke();}
 }else{
  const g=ctx.createRadialGradient(0,-1,0,0,-1,1.05+hit*.16);g.addColorStop(0,'rgba(112,71,155,.42)');g.addColorStop(.55,'rgba(78,48,119,.22)');g.addColorStop(1,'rgba(67,37,108,0)');ctx.fillStyle=g;ctx.fillRect(-1.25,-2.2,2.5,2.4);
  for(let i=0;i<8;i++){const ang=i*TAU/8,rx=.66+Math.sin(G.time*1.2+i)*.035;ctx.strokeStyle='rgba(134,103,174,.28)';ctx.lineWidth=.035;ctx.beginPath();ctx.moveTo(Math.cos(ang)*rx,-1+Math.sin(ang)*.63);ctx.quadraticCurveTo(Math.cos(ang+.3)*.98,-1+Math.sin(ang+.3)*.9,Math.cos(ang+.45)*.86,-1+Math.sin(ang+.45)*.8);ctx.stroke();}
  const positions=[[-.51,-1.23,.17],[-.22,-1.57,.16],[.19,-1.57,.17],[.53,-1.28,.19],[-.38,-.87,.21],[.13,-1.09,.25],[.47,-.69,.16],[-.05,-.58,.15]];
  positions.forEach(([x,y,r],i)=>eye(x,y+Math.sin(G.time*1.6+i)*.025,r,i));
 }
 if(wind||hit){ctx.save();ctx.globalAlpha=wind*.22+hit*.45;ctx.strokeStyle=look?'#c2ae97':'#b99bde';ctx.lineWidth=.025;ctx.beginPath();ctx.ellipse(look?.1:0,look?-1.94:-1,look?.44+hit*.12:.87+hit*.2,look?.22+hit*.08:.65+hit*.15,0,-Math.PI*.65,Math.PI*.65);ctx.stroke();ctx.restore();}
 ctx.restore();return true;
}
