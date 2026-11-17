/* DOOM protagonists: campaign editions + researched spin-offs.
 * Cross-universe values and 2D mechanics are projections, not an exact port. */
const SL_GUNS={
 chargedPistol:['ピストル：チャージショット',36,600,null,0,'hitscan'],fist:['拳',12,38,null,0,'melee'],saw:['チェーンソー',36,44,null,0,'melee'],pistol:['ピストル',12,520,'bullet',1,'hitscan'],shotgun:['ショットガン',9,420,'shell',1,'hitscan',7,.055],ssg:['スーパーショットガン',9,330,'shell',2,'hitscan',20,.065],chaingun:['チェーンガン',12,600,'bullet',2,'hitscan',2,.018],rocket:['ロケットランチャー',100,650,'rocket',1,'rocket'],plasma:['プラズマライフル',24,620,'cell',1,'plasma'],bfg:['BFG9000',240,800,'cell',40,'bfg'],unmaker:['Unmaker',40,650,'cell',1,'hitscan',3,.04],
 machine:['マシンガン',10,620,'bullet',3,'hitscan',3,.018],grenade:['フラググレネード',90,420,'grenade',1,'grenade'],flashlight:['フラッシュライト打撃',10,38,null,0,'melee'],cube:['ソウルキューブ',220,650,'soul',5,'cube'],grabber:['Grabber：弾の捕獲・投げ返し',60,400,null,0,'grabber'],artifact:['Artifact：ヘルタイム／バーサーク／無敵',0,700,'heart',1,'artifact'],
 axe:['消防斧',25,42,null,0,'melee'],extinguisher:['消火器',5,140,'extinguisher',1,'extinguish'],collar:['ドッグカラー',0,170,null,0,'collar'],scoped:['スコープ付きアサルトライフル',65,820,'bullet',1,'hitscan'],holy:['聖水ピストル',28,300,'water',1,'holy'],sentry:['セントリーボット射撃',12,550,'bot',1,'hitscan',4,.025],redSentry:['赤セントリーボット自爆',130,350,'bot',1,'rocket'],toilet:['便器投擲',45,230,null,0,'slug'],
 heavy:['ヘビーアサルトライフル',15,650,'bullet',3,'hitscan',3,.018],combat:['コンバットショットガン',10,400,'shell',1,'hitscan',8,.05],gauss:['ガウスキャノン',140,850,'cell',15,'rail'],siphon:['サイフォングレネード',15,280,null,0,'siphon'],holo:['ホログラムデコイ',0,650,null,0,'holo'],glory:['グローリーキル',120,42,null,0,'glory'],telefrag:['テレポート／テレフラグ',180,300,null,0,'telefrag'],
 cannon:['ヘビーキャノン',16,700,'bullet',3,'hitscan',3,.018],ballista:['バリスタ',150,850,'cell',25,'rail'],unmaykr:['Unmaykr',35,650,'bfg',1,'plasma',3,.05],etBfg:['BFG9000',260,850,'bfg',30,'bfg'],blade:['ドゥームブレイド',35,42,null,0,'melee'],blood:['ブラッドパンチ',100,75,'blood',1,'slam'],crucible:['クルーシブル',350,48,'crucible',1,'melee'],hammer:['センチネルハンマー',75,110,'hammer',2,'slam'],hook:['ミートフック',0,360,null,0,'hook'],flame:['フレイムベルチ',8,150,null,0,'flame'],ice:['アイスボム',5,360,null,0,'ice'],dash:['ダッシュ',0,350,'dash',1,'dash'],
 accelerator:['アクセラレーター',18,650,'cell',2,'plasma',3,.02],cycler:['サイクラー',22,650,'cell',2,'plasma',3,.06],pulverizer:['パルヴァライザー',8,500,'skull',5,'slug',5,.025],ravager:['ラヴェジャー',12,650,'skull',5,'slug',5,.018],impaler:['インペイラー',120,850,'spike',1,'rail'],shredder:['シュレッダー',18,650,'spike',3,'slug',3,.018],chainshot:['チェーンショット',140,700,'chain',1,'slug'],launcher:['グレネードランチャー',100,650,'rocket',1,'grenade'],crossbow:['バリスティック・フォース・クロスボウ',300,850,'bfg',1,'bfg'],shield:['シールドソー：投擲',65,400,null,0,'shield'],parry:['シールドガード／パリィ',0,650,null,0,'parry'],gauntlet:['パワーガントレット',65,48,'melee',1,'melee'],flail:['フレイル',85,70,'melee',1,'melee'],mace:['ドレッドメイス',150,65,'melee',3,'slam'],
 incinerator:['インシネレーター',20,360,'fuel',1,'flame'],calamity:['カラミティブレイド：最大チャージ',80,700,'fuel',50,'heat',15,.087],
 sticky:['スティッキーボム',65,440,'shell',1,'grenade'],burst:['3連バースト',10,360,'shell',3,'hitscan',24,.035],auto:['フルオート',10,360,'shell',3,'hitscan',24,.04],micro:['マイクロミサイル',25,600,'bullet',6,'rocket',6,.025],scope:['プレシジョンボルト',90,850,'bullet',6,'hitscan'],heat:['ヒートブラスト',70,150,'heat',1,'slam'],stun:['スタンボム',5,380,null,0,'ice'],microwave:['マイクロウェーブビーム',25,450,'cell',5,'beam'],lock:['ロックオンバースト',70,700,'rocket',3,'homing',3,.04],remote:['リモートデトネーション',100,500,'rocket',1,'rocket'],siege:['シージモード',220,850,'cell',30,'rail'],arbalest:['アーバレスト',150,750,'cell',25,'rocket'],destroyer:['デストロイヤーブレード',180,650,'cell',50,'heat',3,.16],turret:['モバイルタレット',12,650,'bullet',9,'hitscan',9,.018],gunShield:['エネルギーシールド',0,600,null,0,'gunShield'],spin:['ガトリングローテーター',12,650,'bullet',6,'hitscan',6,.018],
 arc:['アークグレネード',15,360,null,0,'ice'],acid:['アシッドスピット',16,360,null,0,'acid']
};
const SL_CLASSIC=['fist','saw','pistol','shotgun','chaingun','rocket','plasma','bfg'];
const SL_II=[...SL_CLASSIC,'ssg'];
const SL_D3=[...SL_CLASSIC,'flashlight','machine','grenade','cube'];
const SL_2016=['fist','saw','pistol','chargedPistol','combat','ssg','heavy','chaingun','rocket','plasma','gauss','bfg','grenade','siphon','holo','glory','sticky','burst','scope','micro','heat','stun','lock','remote','siege','turret','spin'];
const SL_ET=['fist','saw','combat','ssg','cannon','chaingun','rocket','plasma','ballista','etBfg','unmaykr','blade','blood','hook','flame','ice','grenade','dash','glory','sticky','auto','scope','micro','heat','microwave','lock','remote','arbalest','destroyer','turret','gunShield'];
const SL_DARK=['combat','ssg','accelerator','cycler','pulverizer','ravager','impaler','shredder','chainshot','rocket','launcher','crossbow','shield','parry','gauntlet','flail','mace','glory'];
// Ports/remasters without a new campaign share the corresponding campaign edition.
const SL_EDITIONS=[
 ['doom','DOOM (1993)','classic',SL_CLASSIC],['ultimate','The Ultimate DOOM','classic',SL_CLASSIC],['doom2','DOOM II','classic',SL_II],['master','Master Levels for DOOM II','classic',SL_II],['tnt','Final DOOM: TNT Evilution','classic',SL_II],['plutonia','Final DOOM: The Plutonia Experiment','classic',SL_II],['norest','No Rest for the Living','classic',SL_II],['sigil','SIGIL','classic',SL_CLASSIC],['sigil2','SIGIL II','classic',SL_CLASSIC],['rust','Legacy of Rust','classic',[...SL_II.filter(k=>!['plasma','bfg'].includes(k)),'incinerator','calamity']],
 ['doom64','DOOM 64','64',[...SL_II,'unmaker']],['lostlevels','DOOM 64: The Lost Levels','64',[...SL_II,'unmaker']],
 ['doom3','DOOM 3','d3',SL_D3],['roe','DOOM 3: Resurrection of Evil','d3',[...SL_D3.filter(k=>!['saw','cube'].includes(k)),'ssg','grabber','artifact']],['lostmission','DOOM 3: The Lost Mission','d3',[...SL_D3.filter(k=>!['saw','cube','flashlight'].includes(k)),'ssg','grabber']],
 ['rpg','DOOM RPG','rpg',['axe','extinguisher','pistol','shotgun','ssg','chaingun','plasma','rocket','bfg','collar']],
 ...['Stan Blazkowicz','Kira Morgan',"Riley O’Connor"].map((n,i)=>['rpg2_'+i,'DOOM II RPG — '+n,'rpg',['saw','machine','scoped','ssg','chaingun','plasma','rocket','bfg','holy','sentry','redSentry','cube','toilet']]),
 ['resurrection','DOOM Resurrection (iPhone)','d3',['machine','shotgun','ssg','chaingun','saw','plasma','bfg']],
 ['2016','DOOM (2016)','praetor',SL_2016],['vfr','DOOM VFR — Dr. Peters','vfr',['pistol','combat','heavy','rocket','plasma','ssg','gauss','chaingun','grenade','telefrag','sticky','scope','heat','lock','siege','turret']],
 ['eternal','DOOM Eternal','eternal',[...SL_ET,'crucible']],['tag1','The Ancient Gods — Part One','eternal',SL_ET],['tag2','The Ancient Gods — Part Two','eternal',[...SL_ET,'hammer']],
 ['darkages','DOOM: The Dark Ages','dark',SL_DARK],['mighty','Mighty DOOM — Mini Slayer','mini',['heavy','combat','plasma','chaingun','burst','rocket','ballista','ssg','gauss','hammer','saw','crucible','etBfg','unmaykr','grenade','flame','ice','arc','acid']]
];
const SL_ROSTER=SL_EDITIONS.map(r=>'sl_'+r[0]);
function slDef(id,era){
 const [n,dmg,range,rawAmmo,rawCost,kind,count=1,spread=0]=SL_GUNS[id],freePistol=id==='pistol'&&['praetor','vfr'].includes(era),ammo=freePistol?null:rawAmmo,cost=freePistol?0:rawCost;
 const melee=['melee','glory','slam'].includes(kind),special=['artifact','holo','parry','gunShield','dash','hook','collar','grabber','extinguish'].includes(kind);
 return AT({n,type:melee?'melee':'proj',dmg,reach:range,minR:0,maxR:range,windup:['bfg','heat'].includes(kind)?.9:kind==='melee'?.22:.18,active:.12,rec:melee?.3:.16,cd:id==='grabber'?2:special?6:['bfg','cube'].includes(kind)?5:['grenade','ice'].includes(kind)?5:count>5?.65:.45,anim:melee?(kind==='slam'?'spinSlam':id==='saw'?'rip':'heavy'):'launch',slWeapon:id,slAmmo:ammo,slCost:cost,slKind:kind,slCount:count,slSpread:spread,w:kind==='glory'?15:1,
 cond:(u,t)=>slEligible(u,id,t)});
}
for(const [edition,title,era,weapons] of SL_EDITIONS){
 const modern=['praetor','eternal','dark','mini'].includes(era),classic=['classic','64','rpg'].includes(era),armor=classic?'#627b43':era==='d3'?'#526a58':era==='vfr'?'#b4b7b1':'#5e7647';
 exFighter('sl_'+edition,title+' 主人公','sl',modern?150:100,weapons.map(id=>slDef(id,era)),{ic:'🛡️',slUnit:1,slEdition:edition,slEra:era,ai:'slayer',unique:1,exUnique:1,mortal:false,infectable:0,infectionImmune:1,mkImmune:1,jokerImmune:1,parasiteImmune:1,conversionImmune:1,hair:null,held:null,scale:era==='mini'?.85:1.25,r:11,mass:3,walk:90,run:modern?185:150,slArmorMax:modern?150:200,pal:{...EX_PAL,cloth:armor,clothD:shade(armor,-.45),clothL:shade(armor,.3),acc:'#777a70',eye:'#c3deab'},
 desc:title+'の主人公。作品別装備・各種同時1体。感染／寄生／洗脳／陣営転換無効。原作と異なる数値・2D戦闘、未再現要素はDOOM_SLAYER.md参照。'});
}
SP.slHologram={...SP.human,name:'ホログラムデコイ',fac:'sl',ai:'slDecoy',slDecoy:1,hp:1,walk:0,run:0,atks:[],infectionImmune:1,mkImmune:1,mortal:false,infectable:0};
function slWorld(){return G.slayer||(G.slayer={shots:[],fields:[],pickups:[]});}
function slInit(u){if(!u.sp.slUnit)return;
 u.slArmor=u.sp.slArmorMax;u.slAmmo={bullet:200,shell:50,rocket:20,cell:300,grenade:4,bfg:60,skull:200,spike:100,chain:10,fuel:150,soul:0,heart:3,blood:0,hammer:0,crucible:3,dash:2,melee:3,heat:0,water:20,bot:20,extinguisher:50};u.slMax={...u.slAmmo,soul:5,blood:2,hammer:2,heat:1};u.slFuel=3;u.slFuelNext=G.time+20;u.slRecharge=G.time+3;
 if(u.sp.slEdition==='resurrection')u.slAmmo.bullet=u.slMax.bullet=Infinity;
 if(u.sp.slEra==='mini')slMightyInit(u);
 slHeroInit(u);
}
function spawnSlayers(){G.slayer={shots:[],fields:[],pickups:[]};if(!facOn('sl'))return;const rooms=[spawnRoom(),spawnRoom(),spawnRoom()];SL_ROSTER.forEach((k,i)=>{const p=randWalkIn(rooms[i%rooms.length]);spawnUnit(k,p.x,p.y,{force:true});});
 for(const room of G.map.rooms){const p=randWalkIn(room);slWorld().pickups.push({x:p.x,y:p.y,kind:'supply',amount:1});}
 addLog('🛡️ Doom Slayer陣営：'+SL_ROSTER.length+'作品・主人公版、各1体','sl',true);
}
function slEligible(u,id,t,automatic=false){
 if(u.sp.slEra==='mini')return slMightyReady(u,id,t,automatic);
 if(!u.sp.slUnit)return false;const d=SL_GUNS[id],kind=d[5];
 if(!(id==='pistol'&&['praetor','vfr'].includes(u.sp.slEra))&&d[3]&&(u.slAmmo?.[d[3]]||0)<d[4])return false;
 if(id==='saw'&&['praetor','eternal'].includes(u.sp.slEra)&&u.slFuel<(t?.sp.mass>=4?3:1))return false;
 if(kind==='glory')return exAlive(t)&&t.hp<=t.mhp*.25&&!t.sp.unique&&(t.sp.mass||1)<8;
 if(kind==='collar')return exAlive(t)&&/hellhound|cerberus/.test(t.key)&&!t.sp.conversionImmune;
 if(kind==='grabber')return slGrabberCandidates(u).length>0;
 if(['parry','gunShield'].includes(kind))return !((u.slGuard||0)>G.time);
 return true;
}
function slRefill(u,kind,amount=1){
 if(kind==='health')u.hp=Math.min(u.mhp,u.hp+25*(u.slPower?.hp||1)*amount);
 else if(kind==='armor')u.slArmor=Math.min(u.slArmorMax||u.sp.slArmorMax,u.slArmor+20*(u.slPower?.armor||1)*amount);
 else for(const k of ['bullet','shell','rocket','cell','bfg','fuel','skull','spike','chain','grenade','water','bot','extinguisher'])u.slAmmo[k]=Math.min(u.slMax[k],u.slAmmo[k]+Math.max(1,Math.floor(u.slMax[k]*.2))*amount);
}
function slDamage(att,tgt,dmg,o){
 if(tgt.sp.slDecoy)return 0;
 if(!tgt.sp.slUnit||dmg<=0)return dmg;
 if(tgt.slInvuln>G.time)return 0;
 if(tgt.slGuard>G.time&&att&&Math.abs(angDiff(tgt.faceA,angTo(tgt.x,tgt.y,att.x,att.y)))<Math.PI*.55){
  if(tgt.slParry>G.time&&o.slParried!==true&&exAlive(att)&&dist(att.x,att.y,tgt.x,tgt.y)<500)dealDamage(tgt,att,dmg,{slParried:true});return 0;
 }
 dmg*=tgt.slPower?.taken||1;
 const absorbed=Math.min(tgt.slArmor||0,dmg*(['classic','64','rpg'].includes(tgt.sp.slEra)?.5:.65));tgt.slArmor-=absorbed;return dmg-absorbed;
}
function slHit(u,t,d,extra={}){
 const before=t.hp;dealDamage(u,t,d.dmg,{...extra,slWeapon:d.slWeapon,slBurnHit:d.slKind==='flame'});
 if(t.hp<before){if(['plasma','beam'].includes(d.slKind))u.slAmmo.heat=Math.min(1,(u.slAmmo.heat||0)+.2);if(d.slKind==='ice')t.slowT=Math.max(t.slowT||0,3);if(d.slKind==='flame'&&exAlive(t))t.slBurn={src:u,until:G.time+3,next:G.time+.5};if(d.slKind==='acid'&&exAlive(t))t.slAcid={src:u,until:G.time+3,next:G.time+.6};}return t.hp<before;
}
function slArea(u,x,y,r,d,extra={}){
 let hits=0;const {slOnHit,...options}=extra;
 for(const t of G.units.slice())if(exAlive(t)&&hostileTo(u,t)&&dist(x,y,t.x,t.y)<=r+t.r&&losWalk(x,y,t.x,t.y,1)&&slHit(u,t,d,options)){hits++;if(exAlive(t)&&slOnHit)slOnHit(t);}
 addShock(x,y,5,r,d.slKind==='ice'?'#9deaff':'#f2be72');return hits;
}
function slFire(u,d,a){
 if(!exAlive(u))return;
 const t=a.tgt;if(!slEligible(u,d.slWeapon,t,!!a.slMightyAutomatic))return;
 if(!exAlive(t)||!hostileTo(u,t)||dist(u.x,u.y,t.x,t.y)>d.maxR+u.r+t.r||!losWalk(u.x,u.y,t.x,t.y,1))return;
 if(u.sp.slEra==='mini')slMightySpend(u,d);else if(d.slAmmo)u.slAmmo[d.slAmmo]-=d.slCost;
 const id=d.slWeapon,kind=d.slKind;u.slLastWeapon=id;u.slFlash=G.time+.12;
 if(u.sp.slEra==='mini'&&slMightySpecial(u,d,t))return;
 if(id==='saw'&&['praetor','eternal'].includes(u.sp.slEra))u.slFuel-=t.sp.mass>=4?3:1;
 if(kind==='artifact'){u.slInvuln=G.time+5;u.slBerserk=G.time+5;for(const v of G.units)if(exAlive(v)&&hostileTo(u,v)&&dist(u.x,u.y,v.x,v.y)<250)v.slowT=Math.max(v.slowT||0,5);return;}
 if(kind==='holo'){if(!exAlive(u.slDecoy)){u.slDecoy=spawnUnit('slHologram',u.x,u.y,{force:true});if(u.slDecoy){u.slDecoy.slOwner=u;u.slDecoy.slExpires=G.time+5;}}return;}
 if(kind==='parry'||kind==='gunShield'){u.slGuard=G.time+2;u.slParry=kind==='parry'?G.time+.5:0;return;}
 if(kind==='dash'||kind==='hook'||kind==='telefrag'){
  const want=kind==='dash'?110:Math.max(0,dist(u.x,u.y,t.x,t.y)-u.r-t.r-8),ang=angTo(u.x,u.y,t.x,t.y);for(let i=0;i<Math.ceil(want/6);i++){const x=u.x,y=u.y;tryMove(u,Math.cos(ang)*Math.min(6,want-i*6),Math.sin(ang)*Math.min(6,want-i*6));if(x===u.x&&y===u.y)break;}
  if(kind==='telefrag'&&dist(u.x,u.y,t.x,t.y)<u.r+t.r+12)slHit(u,t,d);return;
 }
 if(kind==='grabber'){slGrabberCapture(u,t);return;}
 if(kind==='collar'){if(!t.sp.conversionImmune){t.fac=t.team='sl';t.tgt=null;t.slCollared=true;}return;}
 if(kind==='extinguish'){t.slBurn=null;t.burnT=0;slHit(u,t,d);return;}
 if(kind==='melee'||kind==='glory'){slHit(u,t,{...d,dmg:d.dmg*(u.slBerserk>G.time?4:1)});return;}
 if(kind==='slam'||kind==='siphon'||kind==='flame'||kind==='ice'||kind==='acid'){
  const hits=slArea(u,t.x,t.y,kind==='slam'?90:kind==='flame'?45:65,d,kind==='slam'?{slOnHit:v=>{v.stunT=Math.max(v.stunT||0,1.5);}}:{});
  if(kind==='siphon'&&hits)slRefill(u,'health');return;
 }
 if(kind==='hitscan'||kind==='rail'||kind==='beam'||kind==='holy'){
  // Cheap cone/range rejection first. Snapshot and stable distance-sort once
  // per discharge, not per pellet. No damage is applied until all rays finish.
  const base=angTo(u.x,u.y,t.x,t.y),spread=(d.slCount-1)*Math.abs(d.slSpread)*.5,candidates=[];
  for(const v of G.units){
   if(!exAlive(v))continue;
   const dd=dist(u.x,u.y,v.x,v.y);if(dd>d.maxR)continue;
   const angle=angTo(u.x,u.y,v.x,v.y),half=Math.atan2(v.r+2,dd);
   if(Math.abs(angDiff(base,angle))>spread+half||!hostileTo(u,v))continue;
   candidates.push({v,dd,angle,half,visible:undefined});
  }
  candidates.sort((a,b)=>a.dd-b.dd);
  const totals=new Map();for(let i=0;i<d.slCount;i++){
   const ang=base+(i-(d.slCount-1)/2)*d.slSpread;
   for(const c of candidates){
    if(Math.abs(angDiff(ang,c.angle))>c.half)continue;
    if(c.visible===undefined)c.visible=losWalk(u.x,u.y,c.v.x,c.v.y,1);
    if(!c.visible)continue;
    totals.set(c.v,(totals.get(c.v)||0)+d.dmg);if(kind!=='rail')break;
   }
  }
  for(const [v,damage] of totals)slHit(u,v,{...d,dmg:damage});
  (G.beams||(G.beams=[])).push({x:u.x,y:u.y,tx:t.x,ty:t.y,t:.1,w:kind==='rail'?3:1,col:kind==='rail'?'#87e9ec':'#eacb8b'});return;
 }
 const base=angTo(u.x,u.y,t.x,t.y);for(let i=0;i<d.slCount;i++){const ang=base+(i-(d.slCount-1)/2)*d.slSpread,speed=kind==='bfg'?240:kind==='grenade'?280:kind==='cube'?440:500;
 slWorld().shots.push({x:u.x,y:u.y,vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,src:u,target:t,d,life:4,hits:new Set(),next:0});}
}
function slOnDeath(att,t,o={}){
 if(!att?.sp.slUnit||!hostileTo(att,t)||t.sp.slDecoy||t.sp.tkOrdnance)return;const ammo=att.slAmmo;if(!ammo)return;if(att.sp.slEra==='mini'){slMightyOnDeath(att,t);return;}
 ammo.soul=Math.min(5,ammo.soul+1);
 const fin=o.slWeapon,executed=!!fin;
 if(executed&&fin==='glory'){slRefill(att,'health');ammo.blood=Math.min(2,ammo.blood+1);ammo.hammer=Math.min(2,ammo.hammer+1);}
 if(executed&&fin==='saw'&&['praetor','eternal'].includes(att.sp.slEra))slRefill(att,'supply',3);
 if(o.slBurnHit||(t.slBurn?.src===att&&t.slBurn.until>G.time))slRefill(att,'armor');
 if(executed&&fin==='cube')att.hp=Math.min(att.mhp,att.hp+100*(att.slPower?.hp||1));
}
function updateSlayers(dt){
 const world=slWorld();
 for(const u of G.units){if(!exAlive(u))continue;
  if(u.sp.slDecoy){if(u.slExpires<=G.time||!exAlive(u.slOwner)){u.dead=u.gone=true;continue;}for(const t of G.units)if(exCanAct(t)&&hostileTo(t,u)&&dist(t.x,t.y,u.x,u.y)<200&&losWalk(t.x,t.y,u.x,u.y,1))t.tgt=u;continue;}
  for(const k of ['slBurn','slAcid']){const f=u[k];if(f&&f.until>G.time&&f.next<=G.time){f.next=G.time+.5;dealDamage(f.src,u,k==='slBurn'?4:6,{slDot:true});}}
  if(!u.sp.slUnit)continue;
  if(u.sp.slEra==='mini'){slMightyAutomatic(u);continue;}
  if(G.time>=u.slRecharge){u.slRecharge=G.time+3;u.slAmmo.dash=Math.min(2,u.slAmmo.dash+1);u.slAmmo.melee=Math.min(3,u.slAmmo.melee+1);}
  if(G.time>=u.slFuelNext){u.slFuelNext=G.time+20;u.slFuel=Math.max(1,u.slFuel);}
  for(let i=world.pickups.length-1;i>=0;i--){const p=world.pickups[i];if(dist(u.x,u.y,p.x,p.y)<u.r+12){slRefill(u,p.kind,p.amount);world.pickups.splice(i,1);}}
 }
 world.fields=world.fields.filter(f=>f.until>G.time);
 for(let i=world.shots.length-1;i>=0;i--){const p=world.shots[i],d=p.d,k=d.slKind;
  if(k==='mightySticky'&&(p.stuck||p.anchorOnly)){if(exAlive(p.stuck)){p.x=p.stuck.x;p.y=p.stuck.y;}if(G.time>=p.detonateAt){slArea(p.src,p.x,p.y,80,p.d);world.shots.splice(i,1);}continue;}
  p.life-=dt;let gone=p.life<=0;
  if(['homing','cube'].includes(k)&&exAlive(p.target)){const ang=angTo(p.x,p.y,p.target.x,p.target.y),speed=Math.hypot(p.vx,p.vy);p.vx=Math.cos(ang)*speed;p.vy=Math.sin(ang)*speed;}
  const n=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vy)*dt/5));
  for(let j=0;j<n&&!gone&&!p.stuck&&!p.anchorOnly;j++){const x=p.x+p.vx*dt/n,y=p.y+p.vy*dt/n;if(!walkAtPx(x,y)){if(k==='mightySticky'){p.anchorOnly=true;p.detonateAt=G.time+2;}else gone=true;break;}p.x=x;p.y=y;
   if(k==='bfg'&&p.next<=G.time){p.next=G.time+.2;slArea(p.src,p.x,p.y,100,{...d,dmg:8});}
   for(const t of G.units){if(Math.abs(p.x-t.x)>t.r+5||Math.abs(p.y-t.y)>t.r+5||p.hits.has(t.id)||!exAlive(t)||dist(p.x,p.y,t.x,t.y)>t.r+5||!hostileTo(p.src,t))continue;p.hits.add(t.id);if(k==='mightySticky'){p.stuck=t;p.detonateAt=G.time+2;break;}slHit(p.src,t,d);if(!['heat','rail'].includes(k)){gone=true;break;}}
  }
  if(gone){if(['rocket','homing','grenade','bfg'].includes(k))slArea(p.src,p.x,p.y,k==='bfg'?130:80,{...d,dmg:d.dmg*.5});if(k==='heat')world.fields.push({kind:'fire',src:p.src,x:p.x,y:p.y,until:G.time+2,next:0,d});world.shots.splice(i,1);}
 }
 for(const f of world.fields)if(f.kind==='fire'&&f.until>G.time&&f.next<=G.time){f.next=G.time+.5;slArea(f.src,f.x,f.y,35,{...f.d,dmg:8});}
}
function thinkSlayer(u){thinkSlayerHero(u);}
function slInspector(el,u){
 let note=document.getElementById('slayerStatus');if(!u.sp.slUnit){note?.remove();return;}if(!note){note=document.createElement('div');note.id='slayerStatus';el.appendChild(note);}
 note.textContent='各種1体／感染・寄生・洗脳・転換無効｜装甲 '+Math.round(u.slArmor||0)+(u.sp.slEra==='mini'?'｜'+slMightyInspectorText(u):'｜弾 '+['bullet','shell','rocket','cell','bfg'].map(k=>k+':'+u.slAmmo[k]).join(' '))+slHeroText(u)+'｜原作との差分：DOOM_SLAYER.md';
}

function buildSlayerInfo(box){
 const row=document.createElement('div');row.id='slayerRosterInfo';row.style.cssText='font-size:12px;color:#b7c99d;margin:8px 0';row.textContent='🛡️ Doom Slayer：27作品・主人公版を各1体。主人公強化：HP×20–40・火力×6–10・被害×0.2–0.35（屋敷戦用倍率）。感染／寄生／洗脳／転換無効。装備・特殊能力の再現途中（全強化・搭乗戦など未実装）。';box.appendChild(row);
}
