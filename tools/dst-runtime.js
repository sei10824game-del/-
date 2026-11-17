/* Seven independent encounter factions. Canon health; arena geometry/timing. */
const DST_FACTIONS=[['dtEye','Eye of Terror','👁️','#d6a5a4','dstEye'],['dtDragon','Dragonfly','🔥','#dba85b','dstDragon'],['dtBear','Bearger','🐻','#b5aba0','dstBear'],['dtMoose','Moose/Goose','🪿','#c6bba3','dstMoose'],['dtPig','Nightmare Werepig','🐗','#bfa2c0','dstPig'],['dtDeer','Deerclops','🦌','#b8cbd5','dstDeer'],['dtVarg','Varg','🐺','#b3b9c4','dstVarg']];
const DST_BOSSES=DST_FACTIONS.map(v=>v[4]);
function dstDef(n,p,dmg,range,cd=3,extra={}){return exAbility(n,'dst',dmg,range,cd,{dstPower:p,anim:['swipe','bite'].includes(p)?'heavy':['howl','honk','roar','stalk'].includes(p)?'roar':'spinSlam',...extra});}
function dstRegister(k,n,f,shape,hp,r,color,atks,extra={}){exFighter(k,n,f,hp,atks,{dst:true,dstShape:shape,ai:'dst',kind:'biped',head:'beast',r,scale:1,walk:55,run:110,mass:8,hair:null,unique:0,exUnique:0,mortal:true,infectable:1,pal:{...EX_PAL,skin:color,skinD:shade(color,-.45),skinL:shade(color,.25),eye:'#e7cb8f'},desc:n+'（DST）。出現数は1回の遭遇単位、HPはDST準拠。技の距離・時間・2D表現は対戦用翻案。',...extra});}
dstRegister('dstEye','Eye of Terror','dtEye','eye',5000,25,'#d5c4b9',[
 dstDef('突進','charge',125,350,6),dstDef('目玉の卵を産む','eyeEgg',0,600,18,{cond:u=>dstPhase(u)===1}),dstDef('口から目玉の卵を2個射出','eyeEggs',0,600,18,{cond:u=>dstPhase(u)===2}),dstDef('連続突進','multiCharge',100,400,12,{cond:u=>dstPhase(u)===2}),dstDef('噛みつき着地','chomp',100,170,6,{cond:u=>dstPhase(u)===2})],{mass:5,run:140});
dstRegister('dstDragon','Dragonfly','dtDragon','dragon',27500,30,'#b49b60',[
 dstDef('前脚の打撃','swipe',150,115,3),dstDef('激怒の火炎打撃','fireSwipe',300,150,3,{cond:u=>u.dstEnragedUntil>G.time}),dstDef('3連火炎ストンプ','fireStomp',75,180,20,{cond:u=>u.dstEnragedUntil>G.time})],{mass:12,walk:45,run:85});
dstRegister('dstBear','Bearger','dtBear','bear',6000,29,'#675b54',[
 dstDef('爪のなぎ払い','swipe',175,125,3),dstDef('連続爪攻撃','combo',175,130,8),dstDef('地面叩き','stomp',200,200,9)],{mass:15,walk:45,run:90});
dstRegister('dstMoose','Moose/Goose','dtMoose','moose',6000,28,'#bcb9a5',[
 dstDef('ついばみ','peck',150,125,3),dstDef('羽ばたきと武器落とし','honk',0,260,9)],{walk:60,run:100,mass:10});
dstRegister('dstPig','Nightmare Werepig','dtPig','pig',10000,27,'#6a575b',[
 dstDef('爪撃','swipe',75,100,4),dstDef('飛びかかり','pounce',50,300,5),dstDef('X字の両爪','crossClaw',150,150,6,{cond:u=>u.hp<u.mhp*.8}),dstDef('大地砕き','slam',225,210,8,{cond:u=>u.hp<u.mhp*.5}),dstDef('シャドウリーチを3体放つ咆哮','roar',0,650,30),dstDef('忍び寄り','stalk',0,500,20,{cond:u=>u.hp<u.mhp*.3})],{run:150,mass:12});
dstRegister('dstDeer','Deerclops','dtDeer','deer',4000,28,'#b5b7b4',[
 dstDef('氷の衝撃を伴うなぎ払い','freezeSwipe',150,165,3)],{run:90,walk:45,mass:15});
dstRegister('dstVarg','Varg','dtVarg','varg',1800,24,'#b9b6ad',[
 dstDef('大顎の噛みつき','bite',50,105,2),dstDef('遠吠え：ハウンド2匹','howl',0,650,12,{windup:.9,rec:.7})],{walk:45,run:95,mass:8});
dstRegister('dstHound','ハウンド','dtVarg','hound',150,10,'#928c85',[dstDef('噛みつき','bite',20,65,2)],{walk:80,run:145,mass:1.5});
dstRegister('dstLavae','Lavae','dtDragon','lavae',500,11,'#d36c35',[dstDef('燃える体当たり','fireSwipe',50,80,4)],{walk:65,run:115,mass:2});
dstRegister('dstMossling','Mossling','dtMoose','mossling',525,12,'#d2c787',[dstDef('ついばみ','peck',50,70,3),dstDef('怒りの回転突進','spinCharge',50,250,5,{cond:u=>!!u.dstAngry})],{walk:80,run:135,mass:2});
dstRegister('dstServant','Servant of Cthulhu','dtEye','servant',200,10,'#b7a9a1',[dstDef('目玉突進','charge',20,190,3)],{walk:80,run:135,mass:1});
dstRegister('dstLeech','Shadow Leech','dtPig','leech',80,8,'#3b283c',[dstDef('跳躍噛みつき','leech',15,160,3)],{walk:85,run:150,mass:.5,mortal:false,infectable:0,infectionImmune:1});
dstRegister('dstMooseEgg','Moose/Gooseの卵','dtMoose','egg',300,17,'#c5c1a3',[],{ai:'dstEgg',walk:0,run:0,mass:10,mortal:false,infectable:0,dstEgg:'moose'});
dstRegister('dstEyeEgg','目玉の卵','dtEye','eyeEgg',100,8,'#b7b398',[],{ai:'dstEgg',walk:0,run:0,mass:1,mortal:false,infectable:0,dstEgg:'eye'});
function dstWorld(){return G.dst||(G.dst={events:[],effects:[]});}
function dstInit(u){if(!u.sp.dst)return;u.dstPhase=1;u.dstFatigue=0;u.dstLavaeWave=0;u.dstThresholds=new Set();if(u.sp.dstEgg)u.dstHatchAt=G.time+(u.sp.dstEgg==='eye'?15:60);if(u.key==='dstLavae')u.dstExpires=G.time+30;}
function dstPhase(u){if(u.key==='dstEye')return u.hp/u.mhp<=.65?2:1;if(u.key==='dstPig')return u.hp/u.mhp<=.3?4:u.hp/u.mhp<=.5?3:u.hp/u.mhp<=.8?2:1;return 1;}
function dstChild(u,key,i=0,count=1){const a=i*TAU/Math.max(1,count)+(u.faceA||0),p=exPoint(u.x+Math.cos(a)*(u.r+24),u.y+Math.sin(a)*(u.r+24))||exPoint(u.x,u.y);if(!p)return null;const v=spawnUnit(key,p.x,p.y,{force:true});if(v){v.fac=v.team=u.fac;v.dstOwner=u;v.tgt=exAlive(u.tgt)?u.tgt:null;v.state='idle';v.faceA=u.faceA||0;if(key==='dstMossling')v.dstAngry=u.key==='dstMooseEgg'&&!exAlive(u.dstOwner);}return v;}
function spawnDST(){G.dst={events:[],effects:[]};for(const [fac,,,,key]of DST_FACTIONS){if(!facOn(fac))continue;const p=randWalkIn(spawnRoom()),u=spawnUnit(key,p.x,p.y,{force:true});if(u&&key==='dstMoose')dstChild(u,'dstMooseEgg');}}
function dstHatch(u){if(u.dstHatched)return;u.dstHatched=true;const n=u.sp.dstEgg==='moose'?5:1;for(let i=0;i<n;i++)dstChild(u,n===5?'dstMossling':'dstServant',i,n);if(!u.dead){u.gone=true;u.dead=true;u.hp=0;}}
function dstOnDeath(u){if(!u.sp.dst)return;if(u.sp.dstEgg==='moose')dstHatch(u);if(u.key==='dstMoose'){for(const v of G.units)if(v.key==='dstMossling'&&v.fac===u.fac&&(v.dstOwner===u||v.dstOwner?.dstOwner===u))v.dstAngry=true;}if(u.key==='dstDragon'){for(const v of G.units.slice())if(v.key==='dstLavae'&&v.dstOwner===u&&exAlive(v))killUnit(u,v,{});}}
function dstCanAct(u){return exCanAct(u)&&!(u.dstTiredUntil>G.time);}
function thinkDST(u){
 if(!dstCanAct(u))return;const t=exAlive(u.tgt)&&hostileTo(u,u.tgt)?u.tgt:acquireTarget(u,650);u.tgt=t;
 if(!t){if(exAlive(u.dstOwner)){if(dist(u.x,u.y,u.dstOwner.x,u.dstOwner.y)>90)setDest(u,u.dstOwner.x,u.dstOwner.y);return;}thinkMonster(u);return;}
 u.faceA=angTo(u.x,u.y,t.x,t.y);if(!losWalk(u.x,u.y,t.x,t.y,1)){setDest(u,t.x,t.y);return;}
 const choices=u.atkList.filter(d=>canUse(u,d,t));let d=u.key==='dstVarg'?choices.find(d=>d.dstPower==='howl'):null;
 if(!d&&choices.length){d=choices[(u.dstCycle||0)%choices.length];u.dstCycle=(u.dstCycle||0)+1;}
 if(d){u.dest=u.path=null;startAttack(u,d,t);}else setDest(u,t.x,t.y);
}
function dstEffect(u,power,x=u.x,y=u.y,r=90){dstWorld().effects.push({kind:power,x,y,r,until:G.time+.65});}
function dstHit(u,t,d){if(!exAlive(t)||!hostileTo(u,t)||!losWalk(u.x,u.y,t.x,t.y,1))return false;let dmg=d.dmg;if(u.key==='dstDragon'&&d.dstPower==='swipe'&&u.dstEnragedUntil>G.time)dmg*=2;dealDamage(u,t,dmg,{dstAttack:1});if(!t.sp.statusImmune&&!t.sp.slUnit&&!t.sp.ssUnit){if(d.dstPower==='freezeSwipe'){t.dstColdHits=(t.dstColdHits||0)+1;t.slowT=Math.max(t.slowT||0,3);if(t.dstColdHits>=3){t.dstColdHits=0;t.tkFrozenUntil=G.time+2;}}if(['fireSwipe','fireStomp'].includes(d.dstPower))t.burnT=Math.max(t.burnT||0,3);if(d.dstPower==='honk'){interrupt(t);t.stunT=Math.max(t.stunT||0,1.2);}if(d.dstPower==='leech')t.slowT=Math.max(t.slowT||0,2);}return true;}
function dstArea(u,d,r=d.maxR,cone=false){let hits=0;for(const t of G.units.slice())if(exAlive(t)&&hostileTo(u,t)&&dist(u.x,u.y,t.x,t.y)<=r+u.r+t.r&&(!cone||Math.abs(angDiff(u.faceA,angTo(u.x,u.y,t.x,t.y)))<1.1)){if(dstHit(u,t,d))hits++;}return hits;}
function dstDash(u,d,t){const a=angTo(u.x,u.y,t.x,t.y),distance=Math.min(d.maxR,Math.max(0,dist(u.x,u.y,t.x,t.y)-u.r-t.r));u.faceA=a;tryMove(u,Math.cos(a)*distance,Math.sin(a)*distance);return dstArea(u,d,Math.max(65,u.r*2));}
function dstFire(u,d,a){
 const t=a.tgt,p=d.dstPower;if(!exAlive(u)||!exAlive(t)||!hostileTo(u,t)||dist(u.x,u.y,t.x,t.y)>d.maxR+u.r+t.r+12||!losWalk(u.x,u.y,t.x,t.y,1))return;
 dstEffect(u,p,t.x,t.y,d.maxR);const w=dstWorld();
 if(p==='howl'){for(let i=0;i<2;i++)dstChild(u,'dstHound',i,2);addNoise(u.x,u.y,500);return;}
 if(p==='roar'){for(let i=0;i<3;i++)dstChild(u,'dstLeech',i,3);return;}
 if(p==='eyeEgg'||p==='eyeEggs'){const n=p==='eyeEgg'?1:2;for(let i=0;i<n;i++)dstChild(u,'dstEyeEgg',i,n);return;}
 if(p==='stalk'){const ang=angTo(t.x,t.y,u.x,u.y);const point=exPoint(t.x+Math.cos(ang)*200,t.y+Math.sin(ang)*200);if(point&&losWalk(u.x,u.y,point.x,point.y,1))tryMove(u,point.x-u.x,point.y-u.y);u.dstStalkUntil=G.time+4;return;}
 let hits=0;
 if(['charge','multiCharge','pounce','spinCharge','leech'].includes(p)){hits=dstDash(u,d,t);if(p==='multiCharge'||p==='spinCharge')for(let i=1;i<3;i++)w.events.push({kind:'dash',src:u,tgt:t,d,at:G.time+i*.7});}
 else if(p==='honk'){dstArea(u,d);return;}
 else if(['stomp','slam','chomp','fireStomp'].includes(p)){hits=dstArea(u,d);if(p==='fireStomp')for(let i=1;i<3;i++)w.events.push({kind:'stomp',src:u,tgt:t,d,at:G.time+i*.65});}
 else{hits=dstArea(u,d,d.maxR,true);if(p==='combo')for(let i=1;i<3;i++)w.events.push({kind:'swipe',src:u,tgt:t,d,at:G.time+i*.65});}
 if(u.key==='dstPig'&&['pounce','slam'].includes(p)){u.dstFatigue=Math.max(0,(u.dstFatigue||0)+(hits?-1.5:1));if(u.dstFatigue>=3){u.dstTiredUntil=G.time+7;u.dest=u.path=null;}}
}
function dstTick(dt){
 const w=dstWorld();for(const u of G.units.slice()){
  if(!u.sp.dst||!exAlive(u))continue;
  if(u.sp.dstEgg&&G.time>=u.dstHatchAt){dstHatch(u);continue;}
  if(u.dstExpires&&G.time>=u.dstExpires){killUnit(null,u,{});continue;}
  u.dstPhase=dstPhase(u);
  if(u.dstTiredUntil>G.time){u.dest=u.path=null;u.moveSpd=0;if(u.key==='dstPig')u.hp=Math.min(u.mhp,u.hp+20*dt);continue;}else if(u.dstTiredUntil){u.dstTiredUntil=0;u.dstFatigue=0;}
  if(u.key==='dstPig'){if(!exAlive(u.tgt))u.hp=Math.min(u.mhp,u.hp+25*dt);else if(u.dstStalkUntil>G.time)u.hp=Math.min(u.mhp,u.hp+10*dt);}
  if(u.key==='dstDragon'){
   for(const threshold of [.8,.5,.2])if(u.hp/u.mhp<=threshold&&!u.dstThresholds.has(threshold)){u.dstThresholds.add(threshold);u.dstLavaeWave++;const n=Math.min(10,4+u.dstLavaeWave);for(let i=0;i<n;i++){const v=dstChild(u,'dstLavae',i,n);if(v)v.dstWave=u.dstLavaeWave;}u.dstAwaitLavae=true;dstEffect(u,'lavae',u.x,u.y,130);}
   if(u.dstAwaitLavae&&!G.units.some(v=>exAlive(v)&&v.key==='dstLavae'&&v.dstOwner===u)){u.dstAwaitLavae=false;u.dstEnragedUntil=G.time+60;dstEffect(u,'enrage',u.x,u.y,160);}
  }
 }
 for(const event of w.events.slice())if(event.at<=G.time){w.events.splice(w.events.indexOf(event),1);const u=event.src;if(!exAlive(u)||u.hbShip)continue;if(event.kind==='dash'){if(exAlive(event.tgt)&&hostileTo(u,event.tgt))dstDash(u,event.d,event.tgt);}else dstArea(u,event.d,event.d.maxR,event.kind==='swipe');dstEffect(u,event.d.dstPower,u.x,u.y,event.d.maxR);}
 w.effects=w.effects.filter(e=>e.until>G.time);
}
function dstInspector(el,u){document.getElementById('dstStatus')?.remove?.();if(!u.sp.dst)return;const box=document.createElement('div');box.id='dstStatus';box.textContent=u.key==='dstVarg'?'戦闘中の遠吠え1回につきハウンド2匹（個体数上限なし）':u.sp.dstEgg?'孵化まで '+Math.max(0,Math.ceil(u.dstHatchAt-G.time))+'秒':u.key==='dstDragon'?'Lavae出撃段階 '+u.dstLavaeWave+'／激怒 '+(u.dstEnragedUntil>G.time?'ON':'OFF'):u.key==='dstMossling'?'母親を失うと怒りの回転突進':'戦闘段階 '+dstPhase(u)+(u.dstTiredUntil>G.time?'（疲労中）':'');el.appendChild(box);}
function setUniformLighting(on){G.cfg.uniformLighting=!!on;try{localStorage.setItem('mw_uniformLighting',on?'1':'0');}catch(e){}document.querySelectorAll('#segUniformLighting div').forEach(d=>d.classList.toggle('on',d.dataset.v===(on?'1':'0')));const b=document.getElementById('btnUniformLighting');if(b){b.textContent=on?'💡 均一照明 ON':'💡 均一照明 OFF';b.classList.toggle('on',!!on);}}
function drawUniformLighting(W,H){ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalCompositeOperation='multiply';ctx.fillStyle='#dddddd';ctx.fillRect(0,0,W,H);ctx.restore();}
