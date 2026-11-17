/* The ship/cargo rules are requested arena mechanics, not original-game rules. */
const HB_CREW=[];let HB_GROUND_SPAWN=false;
const HB_STATUS_ZERO=[...SS_STATUS_ZERO,'fiveCloakUntil','omAttackDown','omDefenseDown','omSpeedDown','omAccuracyDown','omEmotionUntil','omCriticalUntil','omCounterUntil','fiveDrainUntil','canonDeathTime'];
function hbDef(n,power,dmg,range,cd=2,extra={}){return exAbility(n,'halberd',dmg,range,cd,{hbPower:power,anim:['slash','axe','mace','spear','punch','throw'].includes(power)?'slash':'launch',...extra});}
function hbRegister(key,name,shape,color,hp,atks,extra={}){HB_CREW.push(key);exFighter(key,name,'mt',hp,atks,{hbCrew:true,hbShape:shape,ai:'halberdCrew',unique:0,exUnique:0,kind:'biped',r:10,scale:1.1,walk:64,run:115,mortal:true,infectable:1,hair:null,pal:{...EX_PAL,skin:color,skinD:shade(color,-.4),skinL:shade(color,.3),cloth:color,eye:'#f2db72'},...extra});}
const hbM=(n='体当たり',d=18,r=65)=>hbDef(n,'punch',d,r,1.2);
const hbS=(n='飛び道具',d=18,r=400)=>hbDef(n,'shot',d,r,2.5);
hbRegister('hbVul','バル艦長','vul','#aa8fa2',350,[hbDef('艦内指揮（支援の翻案）','rally',0,500,8)]);
hbRegister('hbSailor','水兵ワドルディ','sailor','#d49a65',180,[],{ai:'prey'});
hbRegister('hbAxe','アックスナイト','axe','#bd8558',260,[hbDef('斧の振り下ろし','axe',28,85,1),hbDef('ブーメランアックス','boomerang',25,380,3)]);
hbRegister('hbMace','メイスナイト','mace','#6375b7',460,[hbDef('鉄球振り回し','spin',34,110,2),hbDef('鎖鉄球','mace',40,230,3)],{r:15,scale:1.45,mass:4});
hbRegister('hbTrident','トライデントナイト','trident','#9f65bd',250,[hbDef('三叉槍投げ','spearShot',28,400,2.5),hbDef('槍の電撃','spark',25,100,3)]);
hbRegister('hbJavelin','ジャベリンナイト','javelin','#83aab0',260,[hbDef('槍回転','spin',26,95,2),hbDef('ジャベリン投げ','spearShot',28,400,3),hbDef('跳躍槍','hop',30,180,3)]);
hbRegister('hbSword','ソードナイト','sword','#7d9bc7',270,[hbDef('剣の斬撃','slash',26,85,1),hbDef('剣突進','charge',30,150,3)]);
hbRegister('hbBlade','ブレイドナイト','sword','#6dba89',270,[hbDef('剣の斬撃','slash',26,85,1),hbDef('跳躍斬り','hop',30,160,3)]);
hbRegister('hbHeavyLobster','ヘビーロブスター','lobster','#d6aa48',2200,[hbDef('はさみ','slash',60,110,1.5),hbDef('ロケット突進','charge',70,250,4),hbDef('大ジャンプ','hop',65,220,4),hbDef('火炎放射','flame',18,280,5),hbDef('ミニロブスター放出','mini',0,450,8),hbDef('ペイントブロビー射出','paintSpawn',0,450,7)],{r:26,scale:2,mass:9,infectionImmune:1,infectable:0,mortal:false});
hbRegister('hbMiniLobster','ミニロブスター','lobster','#cfaa59',90,[hbDef('走行体当たり','charge',17,140,2)],{r:7,scale:.65,infectionImmune:1,infectable:0,mortal:false});
hbRegister('hbPaintBlobby','ペイントブロビー','blob','#ebaa58',75,[hbDef('ペイント跳ね','paint',12,130,2)],{r:7,scale:.7});
hbRegister('hbComboCannon','2連主砲（コンボキャノン）','cannon','#8294a9',2000,[hbDef('回転砲塔の連射','volley',32,650,3),hbDef('下部レーザー','laser',60,650,5),hbDef('アームのつかみ投げ','throw',50,130,4),hbDef('アーム爆弾','bomb',45,480,4)],{walk:0,run:0,r:24,scale:1.8,mass:15,infectionImmune:1,infectable:0,mortal:false});
hbRegister('hbReactor','リアクター','reactor','#98a5aa',1800,[hbDef('反射レーザー','reflectLaser',44,600,4),hbDef('固定レーザー','laser',40,600,4),hbDef('火球砲','volley',30,450,4),hbDef('床の火炎放射','flame',18,260,5)],{walk:0,run:0,r:23,scale:1.7,mass:16,infectionImmune:1,infectable:0,mortal:false});
hbRegister('hbWheelie','ウィリー','wheel','#bb5360',180,[hbDef('高速走行','charge',30,230,2)],{run:180});
hbRegister('hbJukid','ジュキッド','fighter','#cf9568',600,[hbM('拳撃',25),hbDef('跳び蹴り','hop',35,160,2),hbDef('つかみ投げ','throw',45,90,3),hbS('気弾',24)],{scale:1.4});
hbRegister('hbPoppySr','ポピーブロスSr.','poppy','#729fc7',550,[hbDef('爆弾投げ','bomb',35,380,2),hbDef('3連爆弾','tripleBomb',24,380,4),hbDef('ジャンプ体当たり','hop',25,150,3)],{scale:1.4});
hbRegister('hbFrosty','ミスター・フロスティ','frosty','#a1d9dd',650,[hbDef('氷ブロック','ice',28,380,2),hbDef('突進','charge',35,180,3),hbDef('つかみ投げ','throw',35,90,4)],{scale:1.45,r:15});
hbRegister('hbBugzzy','バグジー','bug','#7659a4',700,[hbDef('つかみ投げ','throw',48,100,3),hbDef('突進','charge',38,200,3),hbDef('跳躍踏みつけ','hop',42,170,3),hbS('子虫射出',20,380)],{scale:1.5,r:16});
hbRegister('hbKawasaki','コックカワサキ','chef','#d6a16a',650,[hbDef('おたま','mace',30,120,2),hbDef('皿投げ','boomerang',25,380,2),hbDef('調理つかみ','throw',45,95,4)],{scale:1.4,r:15});
// All standard enemy types listed for the onboard chapters 4–7 of KSS/KSSU.
const HB_STANDARD=[
 ['BioSpark','バイオスパーク','ninja','#be799a', [hbDef('手裏剣','boomerang',20,400,2),hbDef('忍者斬り','slash',23,80,1),hbDef('跳び蹴り','hop',23,150,3)]],
 ['JungleBomb','ジャングルボム','bomb','#779a4b',[hbDef('爆弾投下','bomb',30,350,3)]],
 ['Bomber','ボンバー','bomb','#b18062',[hbDef('クラッシュ自爆','suicide',90,100,6)]],
 ['PlasmaWisp','プラズマウィスプ','wisp','#88d58b',[hbDef('プラズマ弾','shot',18,420,2),hbDef('大プラズマ','laser',32,480,4)]],
 ['Bounder','バウンダー','ball','#c7a56d',[hbDef('星弾','shot',18,350,2),hbM()]],['Gip','ギップ','ball','#c6aabe',[hbDef('星弾','shot',18,350,2),hbM()]],
 ['PoppyJr','ポピーブロスJr.','poppy','#739acb',[hbDef('爆弾','bomb',22,350,3),hbDef('カッター','boomerang',18,350,3)]],
 ['BurningLeo','バーニンレオ','flame','#e29252',[hbDef('火炎','flame',14,210,3),hbDef('バーニング突進','charge',26,180,3)]],
 ['Rocky','ロッキー','rock','#aca28b',[hbDef('ストーン落下','hop',35,130,3)]],['Gim','ギム','robot','#939dbc',[hbDef('ヨーヨー','mace',25,180,2)]],
 ['Shotzo','シャッツォ','cannon','#686d80',[hbS('砲弾',25,500)]],['MotoShotzo','モトシャッツォ','cannon','#8f647a',[hbS('連射砲',22,480)]],
 ['Gordo','ゴルドー','gordo','#56556c',[hbM('針の接触',28,70)]],['SirKibble','サーキブル','helmet','#b8a365',[hbDef('カッター','boomerang',24,400,2)]],
 ['BroomHatter','ブルームハッター','broom','#bba582',[hbM('ほうき',14,75)]],['CapsuleJ','カプセルJ','jet','#a8b0bc',[hbDef('ジェット突進','charge',26,240,2)]],['CapsuleJ2','カプセルJ2','jet','#bcb0a4',[hbDef('ジェット突進','charge',26,240,2)]],
 ['Scarfy','スカーフィ','scarfy','#e6a67e',[hbM('怒りの噛みつき',28,75),hbDef('追跡突進','charge',28,170,3)]],
 ['WaddleDoo','ワドルドゥ','doo','#d6a27c',[hbDef('ビームウィップ','spark',24,180,2)]],['KnuckleJoe','ナックルジョー','fighter','#82b8b4',[hbM('連続パンチ',20),hbDef('気弾','shot',22,400,2),hbDef('跳び蹴り','hop',25,150,3)]],
 ['Walky','ウォーキー','mic','#9cb5b4',[hbDef('マイク音波','spin',25,210,4)]],['LaserBall','レーザーボール','wisp','#edca64',[hbDef('レーザー','laser',30,500,3)]],
 ['Noddy','ノディ','sleep','#a8bdd2',[]],['BrontoBurt','ブロントバート','bird','#cc879e',[hbDef('飛行体当たり','charge',18,150,2)]],['Tookey','トゥーキー','bird','#c7ac72',[hbDef('急降下','hop',20,170,2)]],['Twizzy','ツイジー','bird','#d4cc83',[hbDef('飛行体当たり','charge',16,140,2)]],['MagicalSweeper','マジカルスイーパー','sweeper','#828e9d',[hbDef('飛行体当たり','charge',22,170,2)]]
];
for(const [key,name,shape,col,atks]of HB_STANDARD)hbRegister('hb'+key,name,shape,col,shape==='rock'?240:160,atks,{ai:atks.length?'halberdCrew':'prey',...(key==='Shotzo'?{walk:0,run:0}:{}),...(['jet','robot','cannon','sweeper'].includes(shape)?{infectionImmune:1,infectable:0,mortal:false}:{})});
exFighter('hbHalberd','戦艦ハルバード','mt',14000,[hbDef('主砲レーザー','laser',100,750,5),hbDef('連装砲斉射','volley',35,650,3),hbDef('爆弾投下','bomb',60,450,5)],{hbShipUnit:true,ai:'halberd',kind:'biped',head:'human',r:42,scale:1,walk:45,run:60,mass:100,mortal:false,infectable:0,infectionImmune:1,jokerImmune:1,mkImmune:1,parasiteImmune:1,conversionImmune:1,statusImmune:1,groundTarget:1,unique:0,exUnique:0,hair:null,pal:{...EX_PAL,skin:'#697896'},desc:'全乗員を搭載して開始。戦闘時は順次出撃、破壊時は全生存搭乗者を放出。感染・転換・状態異常無効だが通常ダメージで破壊可能。'});
function hbWorld(){return G.halberd||(G.halberd={shots:[],effects:[]});}
function hbProtect(u){
 for(const key of new Set(HB_STATUS_ZERO))Object.defineProperty(u,key,{get:()=>0,set:()=>{},enumerable:true});
 for(const key of SS_STATUS_NULL)Object.defineProperty(u,key,{get:()=>null,set:()=>{},enumerable:true});
 Object.defineProperty(u,'gest',{get:()=>-1,set:()=>{},enumerable:true});
 let state=u.state;const allowed=new Set(['idle','move','attack','spawn']);Object.defineProperty(u,'state',{get:()=>state,set:v=>{if(allowed.has(v))state=v;},enumerable:true});
 Object.defineProperty(u,'omEmotion',{get:()=> 'neutral',set:()=>{},enumerable:true});
}
function hbInit(u,o={}){if(u.sp.hbShipUnit){u.hbCargo=[];u.hbNextLaunch=0;u.hbEngaged=false;hbProtect(u);}else if(u.fac==='mt'&&!HB_GROUND_SPAWN){const ship=o.hbCarrier||G.units.find(s=>exAlive(s)&&s.sp.hbShipUnit);if(ship)hbBoard(ship,u);}}
function hbBoard(ship,u){if(!ship||!u||ship===u||u.hbShip||u.dead||u.piInhaledBy)return false;interrupt(u);u.hbShip=ship;u.hbWasAboard=true;u.gone=true;u.dest=u.path=null;u.atk=null;u.x=ship.x;u.y=ship.y;ship.hbCargo.push(u);if(G.ctrl===u)playerSetControl(null);return true;}
function spawnHalberd(){if(!facOn('mt'))return;const p=randWalkIn(spawnRoom()),ship=spawnUnit('hbHalberd',p.x,p.y,{force:true});if(!ship)return;for(const key of ['piMetaKnight',...HB_CREW])spawnUnit(key,p.x,p.y,{force:true,hbCarrier:ship});}
function hbExitPoint(ship,u,index){
 const base=(index*2.399963229728653)%TAU,rad=navigationRadius(u);
 for(let ring=0;ring<7;ring++)for(let j=0;j<12;j++){const a=base+j*TAU/12,d=30+ring*22,x=ship.x+Math.cos(a)*d,y=ship.y+Math.sin(a)*d;if(bodyClear(x,y,rad)&&losWalk(ship.x,ship.y,x,y,rad))return{x,y};}
 // A tile-center clearance point ensures every passenger exits even in a tiny room.
 const t=nearestWalkT(Math.floor(ship.x/TILE),Math.floor(ship.y/TILE));return t?{x:(t.x+.5)*TILE,y:(t.y+.5)*TILE}:{x:ship.x,y:ship.y};
}
function hbLaunch(ship,n=4){let launched=0;while(ship.hbCargo?.length&&launched<n){const u=ship.hbCargo.shift();if(u.dead||u.hbShip!==ship)continue;const p=hbExitPoint(ship,u,ship.hbLaunched||0);ship.hbLaunched=(ship.hbLaunched||0)+1;u.hbShip=null;u.gone=false;u.x=p.x;u.y=p.y;u.z=0;u.state='idle';u.st=0;u.dest=u.path=null;u.thinkT=0;u.hbReleasedAt=G.time;if(!G.units.includes(u))G.units.push(u);launched++;}return launched;}
function hbOnDamage(att,u,dmg){if(u.sp.hbShipUnit&&dmg>0){u.hbEngaged=true;if(exAlive(att)&&hostileTo(u,att))u.tgt=att;hbLaunch(u,8);}}
function hbOnDeath(u){if(!u.sp.hbShipUnit||u.hbEvacuated)return;u.hbEvacuated=true;const count=hbLaunch(u,Infinity);addLog('🚢 ハルバード撃墜！ 艦内の'+count+'体が全員脱出した','mt',true);}
function thinkHalberd(u){
 if(!exCanAct(u))return;const t=exAlive(u.tgt)&&hostileTo(u,u.tgt)?u.tgt:acquireTarget(u,750);u.tgt=t;
 if(t){u.hbEngaged=true;u.faceA=angTo(u.x,u.y,t.x,t.y);const d=chooseAttack(u,t);if(d&&losWalk(u.x,u.y,t.x,t.y,1)){u.dest=u.path=null;startAttack(u,d,t);return;}setDest(u,t.x,t.y);return;}
 if(!u.dest||u.destT>16){const p=endgameHunt(u)||randWalkIn(rpick(G.map.rooms));setDest(u,p.x,p.y);}
}
function hbTick(dt){const w=hbWorld();for(const ship of G.units.slice())if(exAlive(ship)&&ship.sp.hbShipUnit){if(ship.hbEngaged&&ship.hbNextLaunch<=G.time){hbLaunch(ship,4);ship.hbNextLaunch=G.time+1;}for(const u of ship.hbCargo){u.x=ship.x;u.y=ship.y;}}
 for(const p of w.shots){p.life-=dt;const steps=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vy)*dt/6));if(p.returning&&p.life<1&&exAlive(p.src)){const a=angTo(p.x,p.y,p.src.x,p.src.y);p.vx=Math.cos(a)*300;p.vy=Math.sin(a)*300;}
 for(let i=0;i<steps&&p.life>0;i++){const x=p.x,y=p.y;p.x+=p.vx*dt/steps;p.y+=p.vy*dt/steps;if(!losWalk(x,y,p.x,p.y,1)){if(p.d.hbPower==='reflectLaser'&&(p.bounces||0)<3){p.bounces=(p.bounces||0)+1;const hitX=!losWalk(x,y,p.x,y,1),hitY=!losWalk(x,y,x,p.y,1);if(hitX||!hitY)p.vx=-p.vx;if(hitY||!hitX)p.vy=-p.vy;p.x=x;p.y=y;continue;}p.life=0;break;}for(const t of G.units.slice())if(exAlive(t)&&hostileTo(p.src,t)&&!p.hits.has(t.id)&&Math.abs(t.z||0)<35&&dist(p.x,p.y,t.x,t.y)<t.r+7){p.hits.add(t.id);if(p.bomb)exBlast(p.src,p.x,p.y,75,p.d.dmg);else hbHit(p.src,t,p.d);if(!p.returning&&!p.pierce)p.life=0;break;}}
 }w.shots=w.shots.filter(p=>p.life>0);w.effects=w.effects.filter(e=>e.until>G.time);
}
function hbHit(u,t,d){if(!exAlive(t)||!hostileTo(u,t))return;dealDamage(u,t,d.dmg,{hbAttack:1});if(d.hbPower==='ice'&&!t.sp.statusImmune)t.slowT=Math.max(t.slowT||0,3);if(d.hbPower==='paint'&&!t.sp.statusImmune)t.tkBlindUntil=G.time+5;}
function hbFire(u,d,a){const t=a.tgt,power=d.hbPower;if(!exAlive(u)||!exAlive(t)||!hostileTo(u,t)||dist(u.x,u.y,t.x,t.y)>d.maxR+u.r+t.r||!losWalk(u.x,u.y,t.x,t.y,1))return;
 const w=hbWorld();w.effects.push({x:t.x,y:t.y,kind:power,until:G.time+.4});
 if(power==='rally'){for(const v of G.units)if(exAlive(v)&&v.fac===u.fac&&dist(u.x,u.y,v.x,v.y)<300)v.piGuardUntil=G.time+2;return;}
 if(power==='mini'||power==='paintSpawn'){const old=HB_GROUND_SPAWN;HB_GROUND_SPAWN=true;try{const p=exPoint(u.x+30,u.y+20);if(p){const v=spawnUnit(power==='mini'?'hbMiniLobster':'hbPaintBlobby',p.x,p.y,{force:true});if(v){v.fac=v.team=u.fac;v.tgt=t;}}}finally{HB_GROUND_SPAWN=old;}return;}
 if(['shot','bomb','tripleBomb','volley','laser','reflectLaser','boomerang','spearShot','ice'].includes(power)){
 const n=['tripleBomb','volley'].includes(power)?3:1;for(let i=0;i<n;i++){const ang=angTo(u.x,u.y,t.x,t.y)+(i-(n-1)/2)*.1,speed=['laser','reflectLaser'].includes(power)?600:260;w.shots.push({x:u.x,y:u.y,src:u,d,vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,life:2.5,hits:new Set(),returning:power==='boomerang',pierce:power==='laser'||power==='reflectLaser',bomb:power==='bomb'||power==='tripleBomb'});}return;}
 if(['charge','hop'].includes(power)){const angle=angTo(u.x,u.y,t.x,t.y),step=Math.min(d.maxR*.7,Math.max(0,dist(u.x,u.y,t.x,t.y)-u.r-t.r));tryMove(u,Math.cos(angle)*step,Math.sin(angle)*step);}
 if(power==='spin'||power==='flame'||power==='suicide')for(const v of G.units.slice()){if(!exAlive(v)||!hostileTo(u,v)||dist(u.x,u.y,v.x,v.y)>d.maxR+u.r+v.r||!losWalk(u.x,u.y,v.x,v.y,1))continue;if(power==='flame'&&Math.abs(angDiff(u.faceA,angTo(u.x,u.y,v.x,v.y)))>.65)continue;hbHit(u,v,d);}
 else hbHit(u,t,d);
 if(power==='throw'&&exAlive(t)&&!t.sp.statusImmune){const ang=angTo(u.x,u.y,t.x,t.y);tryMove(t,Math.cos(ang)*25,Math.sin(ang)*25);}
 if(power==='suicide')killUnit(null,u,{});
}
function hbInspector(el,u){let old=document.getElementById('halberdStatus');old?.remove?.();if(!u.sp.hbShipUnit)return;const box=document.createElement('div');box.id='halberdStatus';const cargo=u.hbCargo||[];box.textContent='艦内 '+cargo.length+'体 ／ '+(u.hbEngaged?'戦闘・出撃中':'巡航中')+'。感染・状態異常無効（通常攻撃で破壊可能）。';const manifest=document.createElement('div');manifest.textContent=cargo.map(v=>v.name).join('、');box.appendChild(manifest);const b=document.createElement('button');b.textContent='全乗員を出撃';b.onclick=()=>{u.hbEngaged=true;hbLaunch(u,Infinity);updateInspector();};box.appendChild(b);el.appendChild(box);}
