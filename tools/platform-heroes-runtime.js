/* Kirby-specific rules are user-requested crossover rules, not a canon claim. */
const PI_ROSTER=['piKirby','piMetaKnight','piDedede','piBowser'];
const PI_FACTIONS=[['kb','カービィ','🌟','#f39bc5','piKirby'],['mt','メタナイト','⚔️','#9ba5db','piMetaKnight'],['dd','デデデ大王','🔨','#e5b057','piDedede'],['bw','クッパ','🐢','#91bd66','piBowser']];
let PI_CAST_OWNER=null;
function piDef(n,power,dmg,range,cd,extra={}){return exAbility(n,'pi:'+power,dmg,range,cd,{piPower:power,anim:power==='inhale'?'palmWave':power==='leap'?'spinSlam':power==='slash'?'heavy':'launch',...extra});}
const PI_KIRBY_ATKS=[piDef('吸い込み','inhale',0,155,2,{windup:.6,cond:(u,t)=>piCanInhale(u,t)}),piDef('空気弾','puff',12,350,1),piDef('スライディング','slide',24,100,2),piDef('ダッシュ体当たり','charge',30,150,3),piDef('踏みつけ','leap',35,100,4),piDef('回転キック','spin',25,80,3)];
exFighter('piKirby','カービィ','kb',1000,PI_KIRBY_ATKS,{piHero:'kirby',ai:'platformHero',kind:'biped',r:14,scale:1.2,walk:75,run:130,mass:1,unique:0,exUnique:0,ic:'🌟',pal:{...EX_PAL,skin:'#f8a8ce',cloth:'#ed5685',eye:'#244e91'},desc:'現在HPが低い敵を吸い込み、味方として排出か吸収コピー。拘束/転換無効の敵は自分が倒した後のみ。コピーでHPや防御を上乗せしない。観戦は自動、操作時は二択。'});
exFighter('piMetaKnight','メタナイト','mt',1400,[piDef('ギャラクシア斬撃','slash',40,85,.8),piDef('連続斬り','slash',22,85,2,{piHits:3,active:.4}),piDef('ソードビーム','crescent',35,500,2),piDef('ドリルスラッシュ','charge',55,230,4),piDef('シャトルループ','leap',65,150,5),piDef('マッハトルネイド','tornado',18,180,6),piDef('ディメンション斬り','blinkSlash',75,330,8),piDef('剣のガード','guard',0,450,5)],{piHero:'meta',ai:'platformHero',r:13,scale:1.2,walk:105,run:185,mass:2,unique:0,exUnique:0,ic:'⚔️',pal:{...EX_PAL,skin:'#354083',cloth:'#5966ae',eye:'#ffdf47'}});
exFighter('piDedede','デデデ大王','dd',2400,[piDef('ハンマーたたき','hammer',70,95,1.6),piDef('回転ハンマー','spin',55,110,4),piDef('スーパーデデデジャンプ','leap',95,220,6),piDef('ヘッドスライディング','slide',55,200,4),piDef('ゴルドー投げ','gordo',45,480,3),piDef('ハンマー投げ','hammerThrow',60,400,5),piDef('ジェットハンマー','charge',100,200,7,{windup:1}),piDef('ハンマー衝撃波','quake',50,230,6),piDef('吸い込み・星吐き','star',45,270,4)],{piHero:'dedede',ai:'platformHero',r:20,scale:1.35,walk:52,run:95,mass:5,unique:0,exUnique:0,ic:'🔨',pal:{...EX_PAL,skin:'#347baf',cloth:'#ca3441',eye:'#252a32'}});
exFighter('piBowser','クッパ','bw',4000,[piDef('火炎放射','breath',18,260,4,{windup:.6}),piDef('ファイアボール','fireball',50,550,2),piDef('ひっかき','slash',55,100,1),piDef('かみつき','bite',65,85,2),piDef('しっぽ攻撃','tail',60,140,3),piDef('クッパドロップ','leap',110,200,6),piDef('スピニングシェル','shell',35,200,6),piDef('つかみ投げ','throw',70,100,5),piDef('突進','charge',75,230,4),piDef('連続火球','fireballs',30,550,6)],{piHero:'bowser',ai:'platformHero',r:23,scale:1.45,walk:58,run:115,mass:7,unique:0,exUnique:0,ic:'🐢',pal:{...EX_PAL,skin:'#d6a13f',cloth:'#4c8b52',eye:'#d7422d'}});
function piWorld(){return G.platformHeroes||(G.platformHeroes={shots:[],fields:[]});}
function spawnPlatformHeroes(){G.platformHeroes={shots:[],fields:[]};for(const [fac,,,,key] of PI_FACTIONS)if(facOn(fac)){if(fac==='mt'){spawnHalberd();continue;}const p=randWalkIn(spawnRoom());spawnUnit(key,p.x,p.y,{force:true});}}
function piInit(u){if(u.sp.piHero==='kirby'){u.piMeals=[];u.piCopy=null;u.piCopyIndex=0;}}
function piOwner(u){return u?.piAvatar?u.piOwner:u;}
function piCanInhale(u,t){return !!(exAlive(u)&&exAlive(t)&&!u.piMouth&&!t.piInhaledBy&&hostileTo(u,t)&&t.hp<u.hp&&!t.sp.statusImmune&&!t.sp.conversionImmune&&!t.sp.parasiteImmune&&!t.grabbedBy&&!t.carriedBy&&t.state!=='attached');}
function piInhale(u,t,defeated=false){
 if(!exAlive(u)||u.key!=='piKirby'||(!defeated&&!piCanInhale(u,t)))return false;
 if(!defeated&&(dist(u.x,u.y,t.x,t.y)>155+u.r+t.r||!losWalk(u.x,u.y,t.x,t.y,1)))return false;
 if(t.piReservedFor||t.piInhaledBy)return false;
 t.piDefeated=defeated;t.piReservedFor=u;t.piOriginalFac=t.fac;t.piOriginalSp=t.sp;
 if(!defeated){interrupt(t);t.dest=null;t.path=null;t.piInhaledBy=u;}
 u.piMeals||(u.piMeals=[]);u.piMeals.push(t);piNextMeal(u);return true;
}
function piNextMeal(u){if(u.piMouth||!u.piMeals?.length)return;u.piMouth=u.piMeals.shift();u.piChoiceAt=G.time+.8;}
function piEjectPoint(u,t){for(let i=0;i<16;i++){const a=u.faceA+(i%2?1:-1)*Math.floor(i/2)*.3,r=u.r+t.r+24,x=u.x+Math.cos(a)*r,y=u.y+Math.sin(a)*r;if(bodyClear(x,y,t.r)&&losWalk(u.x,u.y,x,y,1))return {x,y};}const p=exPoint(u.x,u.y);return p||{x:u.x,y:u.y};}
function piChoose(u,choice){
 const t=u?.piMouth;if(!exAlive(u)||!t||!['ally','copy'].includes(choice))return false;
 if(choice==='copy'){
  piSetCopy(u,t);if(t.key==='piKirby')piOnDeath(null,t);t.piInhaledBy=null;t.piReservedFor=null;t.piConsumed=true;t.hp=0;t.dead=t.gone=true;
  if(!t.piDefeated){if(G.stats[t.piOriginalFac])G.stats[t.piOriginalFac].lost++;if(G.stats[u.fac])G.stats[u.fac].kills++;u.kills++;}
  addLog('🌟 '+u.name+'が'+t.name+'を吸収：技をコピー（HP増加なし）',u.fac);
 }else{
  const p=piEjectPoint(u,t);t.piInhaledBy=null;t.piReservedFor=null;t.piConsumed=false;t.dead=t.gone=false;if(t.piDefeated)t.hp=t.mhp;
  t.x=p.x;t.y=p.y;t.z=0;t.fac=t.team=u.fac;t.sp={...t.piOriginalSp,ai:'platformAlly'};t.tgt=null;t.aggro=null;t.aggroUntil=0;t.dest=null;t.path=null;t.atk=null;t.state='idle';t.st=0;t.kvx=0;t.kvy=0;t.piAllyOf=u.id;t.piDefeated=false;
  if(!G.units.includes(t))G.units.push(t);if(G.stats[u.fac])G.stats[u.fac].born++;
  addLog('🌟 '+u.name+'が'+t.name+'を味方として排出（仲間数の上限なし）',u.fac);
 }
 u.piMouth=null;piNextMeal(u);piRefreshChoice();return true;
}
function piCloneValue(v,depth=0){if(v===null||typeof v!=='object')return v;if(v.sp||depth>2)return null;if(v instanceof Set)return new Set(v);if(v instanceof Map)return new Map(v);if(Array.isArray(v))return v.map(x=>piCloneValue(x,depth+1));const o={};for(const [k,x]of Object.entries(v))if(typeof x!=='function')o[k]=piCloneValue(x,depth+1);return o;}
function piSetCopy(u,t){
 const sourceSp=t.piOriginalSp||t.sp,defs=(t.atkList||sourceSp.atks||[]).map(d=>({...d,piCopied:true,...(d.slMightySlot&&['primary','equipment'].includes(d.slMightySlot)?{cond:(a,target)=>slMightyReady(a,d.slWeapon,target,true)}:{})}));
 const actor={};const skip=new Set(['sp','atk','atkList','piMeals','piMouth','piCopy','piReservedFor','piInhaledBy','slPower','dmgMul','spdMul','cutMul','gear','bShield','slArmor','shield','fiveShield']);
 for(const [k,v]of Object.entries(t))if(!skip.has(k)&&!k.startsWith('pi'))actor[k]=piCloneValue(v);
 Object.assign(actor,{key:t.key,sp:sourceSp,atkList:defs,piAvatar:true,piOwner:u,piSourceFac:t.piOriginalFac||t.fac,dmgMul:1,spdMul:1,cutMul:1,gear:null,bShield:0,slPower:null,ssSleeping:false,ssStallUntil:0,ssBusyUntil:0});
 for(const k of ['id','name','fac','team','x','y','z','faceA','state','st','atk','cds','dest','path','moveSpd','kvx','kvy','dead','gone','kills','piGuardUntil'])Object.defineProperty(actor,k,{get:()=>u[k],set:v=>{u[k]=v;},enumerable:true,configurable:true});
 for(const k of ['r','sizeMul','formScale','walkSpd','runSpd'])Object.defineProperty(actor,k,{get:()=>u[k],set:()=>{},enumerable:true,configurable:true});
 Object.defineProperty(actor,'hp',{get:()=>u.hp,set:v=>{u.hp=Math.min(u.mhp,v);},enumerable:true,configurable:true});Object.defineProperty(actor,'mhp',{get:()=>u.mhp,set:()=>{},enumerable:true,configurable:true});
 u.piCopy={key:t.key,name:t.name,sp:sourceSp,actor,defs,visual:{...t,pal:{...t.pal},sp:sourceSp}};u.piCopyIndex=0;u.atkList=[...PI_KIRBY_ATKS,...defs];
}
function piCast(u,d,a,fn){const owner=PI_CAST_OWNER;PI_CAST_OWNER=piOwner(u);try{const actor=a?.piCopyActor||u.atk?.piCopyActor||u.piCopy.actor;if(actor.sp.slEra==='mini'&&u.atk&&['primary','equipment'].includes(u.atk.def.slMightySlot))u.atk.slMightyAutomatic=true;return fn(actor,d,a);}finally{PI_CAST_OWNER=owner;}}
function piDropCopy(u){if(!u?.piCopy)return;if(u.atk?.def.piCopied){interrupt(u);u.state='idle';}u.piCopy=null;u.piCopyIndex=0;u.atkList=[...PI_KIRBY_ATKS];}
function piOnDeath(att,t){
 const owner=piOwner(att);
 if(t.key==='piKirby'){
  for(const v of [t.piMouth,...(t.piMeals||[])].filter(Boolean)){v.piInhaledBy=null;v.piReservedFor=null;if(!v.piDefeated){const p=piEjectPoint(t,v);v.x=p.x;v.y=p.y;v.state='idle';}else makeCorpse(v,{noRise:true});}t.piMouth=null;t.piMeals=[];
 }
 if(exAlive(owner)&&owner.key==='piKirby'&&hostileTo(owner,t)&&t!==owner&&!t.sp.slDecoy&&!t.sp.tkOrdnance)piInhale(owner,t,true);
}
function piDamage(u,dmg){return u&&u.piGuardUntil>G.time?dmg*.5:dmg;}
function piHit(u,t,d,options={}){if(!exAlive(t)||!hostileTo(u,t))return false;const hp=t.hp;dealDamage(u,t,d.dmg,{...options,piAttack:true});return t.hp<hp;}
function piArea(u,x,y,r,d){for(const t of G.units.slice())if(exAlive(t)&&hostileTo(u,t)&&dist(x,y,t.x,t.y)<r+t.r&&losWalk(x,y,t.x,t.y,1))piHit(u,t,d);}
function piShot(u,t,d,kind,offset=0){const a=angTo(u.x,u.y,t.x,t.y)+offset;piWorld().shots.push({src:u,d,kind,x:u.x,y:u.y,vx:Math.cos(a)*230,vy:Math.sin(a)*230,life:3,hits:new Set()});}
function piFire(u,d,a){
 const t=a.tgt;if(!exAlive(u)||!exAlive(t)||!hostileTo(u,t)||dist(u.x,u.y,t.x,t.y)>d.maxR+u.r+t.r||!losWalk(u.x,u.y,t.x,t.y,1))return;
 const power=d.piPower;if(power==='inhale'){piInhale(piOwner(u),t);return;}
 if(power==='guard'){u.piGuardUntil=G.time+2;return;}
 if(power==='fireballs'){for(let i=-2;i<=2;i++)piShot(u,t,d,'fireball',i*.16);return;}
 if(['puff','crescent','gordo','hammerThrow','star','fireball'].includes(power)){piShot(u,t,d,power);return;}
 if(power==='breath'||power==='tornado'||power==='shell'){piWorld().fields.push({kind:power,src:u,x:u.x,y:u.y,angle:u.faceA,start:G.time,until:G.time+(power==='breath'?1.8:1.4),next:G.time,d});return;}
 if(['charge','slide','blinkSlash','leap'].includes(power)){
  const want=Math.max(0,dist(u.x,u.y,t.x,t.y)-u.r-t.r-8),ang=angTo(u.x,u.y,t.x,t.y);for(let i=0;i<Math.ceil(want/6);i++){const x=u.x,y=u.y;tryMove(u,Math.cos(ang)*Math.min(6,want-i*6),Math.sin(ang)*Math.min(6,want-i*6));if(x===u.x&&y===u.y)break;}
 }
 const radius=Math.max(40,d.maxR+u.r);
 piArea(u,u.x,u.y,radius,d);if(power==='throw'&&exAlive(t)){const ang=angTo(u.x,u.y,t.x,t.y);t.kvx+=Math.cos(ang)*220;t.kvy+=Math.sin(ang)*220;}if(d.piHits>1)piWorld().fields.push({kind:'slashBurst',src:u,x:u.x,y:u.y,angle:u.faceA,start:G.time,until:G.time+.45,next:G.time+.13,left:d.piHits-1,d});piWorld().fields.push({kind:power==='quake'||power==='leap'?'impact':'slash',src:u,x:u.x,y:u.y,angle:u.faceA,start:G.time,until:G.time+.35,next:Infinity,d});
}
function thinkPlatformHero(u){
 if(!exCanAct(u)||u.piMouth)return;const t=exAlive(u.tgt)&&hostileTo(u,u.tgt)?u.tgt:acquireTarget(u,650);u.tgt=t;if(!t){thinkMonster(u);return;}u.faceA=angTo(u.x,u.y,t.x,t.y);
 if(!losWalk(u.x,u.y,t.x,t.y,1)){setDest(u,t.x,t.y);return;}
 const inhale=u.key==='piKirby'&&u.atkList.find(d=>d.piPower==='inhale');let d=inhale&&canUse(u,inhale,t)?inhale:null;
 if(!d){const list=u.atkList.filter(d=>canUse(u,d,t)&&d.piPower!=='inhale');if(list.length)d=list[(u.piAttackCycle||0)%list.length];}
 if(d){u.piAttackCycle=(u.piAttackCycle||0)+1;u.dest=null;u.path=null;startAttack(u,d,t);}else setDest(u,t.x,t.y);
}
function piTick(dt){
 const w=piWorld();for(const u of G.units){if(!exAlive(u)||u.piInhaledBy||u.key!=='piKirby')continue;
  if(u.piMouth){if(G.ctrl!==u&&u.piChoiceAt<=G.time){const t=u.piMouth;piChoose(u,!u.piCopy||Math.random()<.3?'copy':'ally');}else{u.dest=null;u.path=null;}}
  const a=u.piCopy?.actor;if(a?.ammoMax){a.ammoT=(a.ammoT||0)+dt;const recharge=a.key==='nita'?2.15:1.15;if(a.ammoT>=recharge){a.ammoT=0;a.ammo=Math.min(a.ammoMax,(a.ammo||0)+1);}}if(a?.sp.slUnit){if(G.time>=a.slRecharge){a.slRecharge=G.time+3;a.slAmmo.dash=Math.min(2,a.slAmmo.dash+1);a.slAmmo.melee=Math.min(3,a.slAmmo.melee+1);}if(G.time>=a.slFuelNext){a.slFuelNext=G.time+20;a.slFuel=Math.max(1,a.slFuel);}}
 }
 for(let i=w.shots.length-1;i>=0;i--){const p=w.shots[i];p.life-=dt;let gone=p.life<=0;const steps=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vy)*dt/5));for(let j=0;j<steps&&!gone;j++){p.x+=p.vx*dt/steps;p.y+=p.vy*dt/steps;if(!walkAtPx(p.x,p.y)){if(p.kind==='gordo'&&(p.bounces||0)<3){p.bounces=(p.bounces||0)+1;p.x-=p.vx*dt/steps;p.y-=p.vy*dt/steps;p.vx=-p.vx;p.vy=-p.vy;}else gone=true;break;}for(const t of G.units)if(exAlive(t)&&hostileTo(p.src,t)&&!p.hits.has(t.id)&&dist(p.x,p.y,t.x,t.y)<t.r+7){piHit(p.src,t,p.d);p.hits.add(t.id);if(p.kind!=='crescent'&&p.kind!=='gordo')gone=true;}}
  if(gone)w.shots.splice(i,1);
 }
 for(const f of w.fields){if(f.until<=G.time||!exAlive(f.src))continue;if(['tornado','shell'].includes(f.kind))tryMove(f.src,Math.cos(f.angle)*120*dt,Math.sin(f.angle)*120*dt);if(f.next>G.time)continue;f.next=G.time+(f.kind==='slashBurst'?.13:.2);f.x=f.src.x;f.y=f.src.y;
  if(f.kind==='breath'){for(const t of G.units)if(exAlive(t)&&hostileTo(f.src,t)&&dist(f.x,f.y,t.x,t.y)<f.d.maxR+f.src.r+t.r&&Math.abs(angDiff(f.angle,angTo(f.x,f.y,t.x,t.y)))<.5&&losWalk(f.x,f.y,t.x,t.y,1))piHit(f.src,t,f.d);}
  else if(f.kind==='slashBurst'&&f.left>0){piArea(f.src,f.x,f.y,f.d.maxR+f.src.r,f.d);f.left--;}else if(['tornado','shell'].includes(f.kind))piArea(f.src,f.x,f.y,85,f.d);
 }w.fields=w.fields.filter(f=>f.until>G.time);piRefreshChoice();
}
function piPlayerAttack(u,index){
 if(u.piMouth)return piChoose(u,index===0?'ally':'copy');
 const targets=G.units.filter(t=>exAlive(t)&&hostileTo(u,t)&&canPerceive(u,t)).sort((a,b)=>dist(u.x,u.y,a.x,a.y)-dist(u.x,u.y,b.x,b.y));
 for(const t of targets){const d=index===0?u.atkList.find(d=>d.piPower==='inhale'):u.piCopy?u.piCopy.defs[u.piCopyIndex%u.piCopy.defs.length]:u.atkList[1];if(d&&canUse(u,d,t)){startAttack(u,d,t);return true;}}
 return false;
}
function piRefreshChoice(){
 if(typeof document==='undefined')return;const u=G.ctrl;let box=document.getElementById('kirbyChoice');if(!u||u.key!=='piKirby'||!u.piMouth){box?.remove?.();return;}if(box?.dataset?.meal===String(u.piMouth.id))return;box?.remove?.();box=document.createElement('div');box.id='kirbyChoice';box.dataset.meal=String(u.piMouth.id);box.style.cssText='position:fixed;bottom:100px;left:50%;transform:translateX(-50%);z-index:1000;background:#24202ded;color:white;border:2px solid #f7acd1;border-radius:12px;padding:12px;max-width:90vw';const label=document.createElement('div');label.textContent=u.piMouth.name+' を吸い込みました';box.appendChild(label);
 for(const [value,text]of [['ally','J：味方として排出（人数上限なし）'],['copy','K：吸収して技をコピー（HPは増えません）']]){const b=document.createElement('button');b.textContent=text;b.style.margin='6px';b.onclick=()=>{piChoose(u,value);updateInspector();};box.appendChild(b);}document.body.appendChild(box);
}
function piInspector(el,u){
 let box=document.getElementById('platformHeroStatus');if(!u.sp.piHero&&!u.piAllyOf){box?.remove?.();return;}box?.remove?.();box=document.createElement('div');box.id='platformHeroStatus';box.textContent=u.key==='piKirby'?'J：吸い込み／K：選択中のコピー技。口に敵がいる時はJ：仲間、K：吸収。コピーでHP・防御・移動速度は増えません。':'専用の攻撃と方向付き描画。カービィ・デデデ・クッパは初期各1体／メタナイトはハルバード全員搭乗。';
 if(u.piCopy){const text=document.createElement('div');text.textContent='コピー中：'+u.piCopy.name;box.appendChild(text);const select=document.createElement('select');select.id='kirbyCopyAttack';u.piCopy.defs.forEach((d,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=d.n;select.appendChild(o);});select.value=String(u.piCopyIndex);select.onchange=()=>u.piCopyIndex=Number(select.value);box.appendChild(select);const drop=document.createElement('button');drop.textContent='コピー解除';drop.onclick=()=>{piDropCopy(u);updateInspector();};box.appendChild(drop);}el.appendChild(box);
}
