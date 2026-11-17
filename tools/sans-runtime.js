/* UNDERTALE Sans + creator-based Dusttale Murder!Sans.
 * Real-time arena projection, not an exact turn-based battle port. */
const SS_ROSTER=['utSans','utDustSans'];
const SS_STATUS_ZERO=['inf','infG','infC','coth','nmInfT','jokerRate','mkCtrl','gelExposure','gestT','hugT','slowT','stun','stunT','down','panicT','atkSlow','burnT','frozen','restSlow','tkFrost','tkFrostUntil','tkFrozenUntil','tkBlindUntil','tkDeafUntil','skDarkUntil','fiveStopUntil','fiveFalterUntil','pmRootUntil','pmDotUntil','tvPoison','tvPoisonTick','tvBurn','tvBurnTick','tvInfV','golemBurn','golemBurnTicks','ssKarma','ssBlueUntil','kvx','kvy'];
const SS_STATUS_NULL=['hug','grabbedBy','carriedBy','fiveNet','slBurn','slAcid','pmDotSource','rideBy','inTv','shLured','canonTrap','biled','golemStung','shDoom'];
let SS_FANON=true;try{SS_FANON=localStorage.getItem('mw_sans_fanon')!=='0';}catch(e){}
const SS_ATTACKS=[
 ['opening','開幕：重力・骨列・4連ブラスター',600,9],['gap','骨の上下ギャップ',480,2.4],['blue','青い骨：動くと被弾',480,2.5],['random','高さ違いの骨列',480,2.5],['platform','足場と骨の波',480,3],['side','左右からの骨',480,2.5],['blaster','Gaster Blaster',650,3],['cross','4方向Gaster Blaster',600,5],['gravity','青いSOUL・重力スラム',420,5],['shortcut','ショートカット：位置転換',480,5],['final','最終連続攻撃',600,14],['stall','スペシャル：攻撃せず待つ',600,20]
];
function ssDef([power,n,range,cd]){return exAbility(n,'ss:'+power,power==='stall'||power==='shortcut'?0:1,range,cd,{ssPower:power,anim:power==='gravity'?'palmWave':power==='shortcut'?'blinkRend':'launch',windup:power==='opening'?.8:.45,active:.12,rec:.35,cond:(u,t)=>!u.ssSleeping&&!(u.ssBusyUntil>G.time)&&(!u.ssStallUntil||u.ssStallUntil<=G.time)&&(!u.sp.ssDust||!['opening','final','stall'].includes(power))});}
for(const dust of [false,true]){
 const key=dust?'utDustSans':'utSans';exFighter(key,dust?'Dust Sans（Murder!Sans）':'Sans','sn',dust?20:1,SS_ATTACKS.filter(a=>!dust||!['opening','final','stall'].includes(a[0])).map(ssDef),{ic:'💀',ssUnit:1,ssDust:dust,unique:0,exUnique:0,ai:'sans',mortal:false,infectable:0,infectionImmune:1,jokerImmune:1,mkImmune:1,parasiteImmune:1,conversionImmune:1,statusImmune:1,scale:1.1,r:10,mass:1,walk:62,run:110,hair:null,held:null,pal:{...EX_PAL,skin:'#e4e1d6',cloth:dust?'#3e526c':'#3976ac',eye:dust?'#e570b8':'#71d7ec'},desc:(dust?'原作者側Dusttale設定を基準。追加技は二次創作と明記。':'UNDERTALE版。HP1、骨・青骨・ブラスター・重力・有限回避。')+'初期各1体、感染/寄生/支配/ジョーカー化/毒/減速/気絶など無効。通常ダメージは受ける。原作差分はSANS.md参照。'});
}
function ssWorld(){return G.sans||(G.sans={shots:[],fields:[],events:[]});}
function ssProtect(u){
 for(const key of SS_STATUS_ZERO)Object.defineProperty(u,key,{get:()=>0,set:()=>{},enumerable:true,configurable:false});
 for(const key of SS_STATUS_NULL)Object.defineProperty(u,key,{get:()=>null,set:()=>{},enumerable:true,configurable:false});
 Object.defineProperty(u,'gest',{get:()=>-1,set:()=>{},enumerable:true});
 let state=u.state;const denied=new Set(['transform','down','stagger','hugged','grappled','carried','resin','ridden','ride','cbPrisoner','frozen','stun','cower','thrown','attached']);
 Object.defineProperty(u,'state',{get:()=>state,set:value=>{if(!denied.has(value))state=value;},enumerable:true});
}
function ssInit(u){if(!u.sp.ssUnit)return;ssProtect(u);u.ssDodgeLeft=u.sp.ssDust?36:24;u.ssPattern=0;u.ssTurns=0;u.ssLV=1;u.ssEXP=0;u.ssFanon=SS_FANON;
 if(u.sp.ssDust&&u.ssFanon)u.atkList=[...u.atkList,exAbility('【二次創作】骨の刃','ss:blade',12,50,3,{ssPower:'blade',anim:'heavy'}),exAbility('【二次創作】回転ブラスター陣','ss:ring',1,600,8,{ssPower:'ring',anim:'palmWave'})];
}
function spawnSans(){G.sans={shots:[],fields:[],events:[]};if(!facOn('sn'))return;const room=spawnRoom();for(const key of SS_ROSTER){const p=randWalkIn(room);spawnUnit(key,p.x,p.y,{force:true});}addLog('💀 Sans / Dust Sans — 初期各1体、デバフ・転換無効','sn',true);}
function ssDamage(att,u,dmg,o){
 if(!u.sp.ssUnit||dmg<=0||!att||att===u)return dmg;
 if(u.ssSleeping||u.ssDodgeLeft<=0)return dmg;
 if(u.ssEvadeUntil>G.time)return 0;
 for(let i=0;i<12;i++){const ang=angTo(att.x,att.y,u.x,u.y)+(i%2?1:-1)*(Math.PI*.5+Math.floor(i/2)*.3),r=45+Math.floor(i/4)*15,x=u.x+Math.cos(ang)*r,y=u.y+Math.sin(ang)*r;
  if(bodyClear(x,y,u.r)&&losWalk(u.x,u.y,x,y,u.r*.6)){u.ssAfter={x:u.x,y:u.y,until:G.time+.3};u.x=x;u.y=y;u.path=null;u.dest=null;u.ssDodgeLeft--;u.ssDodges=(u.ssDodges||0)+1;combatBlock(u,'回避');u.ssEvadeUntil=G.time+.12;return 0;}}
 return dmg;
}
function ssHit(src,t,kr=true,power=1,nonlethal=false,krAmount=3){
 if(!exAlive(t)||!hostileTo(src,t))return false;
 const dmg=nonlethal?Math.min(power,Math.max(0,t.hp-1)):power;if(dmg<=0)return false;
 const before=t.hp;dealDamage(src,t,dmg,{ssAttack:true,ignoreArmor:true,canonNonlethal:nonlethal});
 if(t.hp<before&&exAlive(t)&&kr&&!t.sp.statusImmune){t.ssKarma=Math.min(40,(t.ssKarma||0)+krAmount);t.ssKarmaSrc=src;t.ssKarmaNext=G.time+.15;}return t.hp<before;
}
function ssBone(u,x,y,angle,speed=130,blue=false,delay=0){ssWorld().shots.push({src:u,x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,blue,delay:G.time+delay,life:4,hits:new Map()});}
function ssBeam(u,x,y,angle,delay=.65,width=14){ssWorld().fields.push({kind:'beam',src:u,x,y,angle,width,start:G.time+delay,until:G.time+delay+.55,next:0,hits:new Set()});}
function ssCross(u,t,delay=.65){for(let i=0;i<4;i++){const ang=i*TAU/4;ssBeam(u,t.x+Math.cos(ang)*110,t.y+Math.sin(ang)*110,ang+Math.PI,delay,14);}}
function ssFire(u,d,a){
 const t=a.tgt;if(!exAlive(u)||!exAlive(t)||!hostileTo(u,t)||u.ssSleeping||u.ssBusyUntil>G.time||dist(u.x,u.y,t.x,t.y)>d.maxR+u.r+t.r||!losWalk(u.x,u.y,t.x,t.y,1))return;
 const p=d.ssPower;u.ssTurns++;
 if(p==='stall'){u.ssStallUntil=G.time+8;u.dest=null;u.path=null;return;}
 if(p==='shortcut'){const angle=angTo(u.x,u.y,t.x,t.y),x=t.x-Math.cos(angle)*75,y=t.y-Math.sin(angle)*75;if(bodyClear(x,y,u.r)&&losWalk(u.x,u.y,x,y,1)){u.ssAfter={x:u.x,y:u.y,until:G.time+.3};u.x=x;u.y=y;u.path=null;u.dest=null;}return;}
 if(p==='final'){u.ssFinalDone=true;u.ssBusyUntil=G.time+40;u.dest=null;u.path=null;for(let i=0;i<20;i++)ssWorld().events.push({src:u,t,at:G.time+i*2});return;}
 if(p==='blade'){if(u.ssFanon&&u.sp.ssDust)ssHit(u,t,true,12);return;}
 if(p==='gravity'||p==='opening'||p==='final'){
  if(!t.sp.statusImmune){t.ssBlueUntil=G.time+2;const ang=angTo(u.x,u.y,t.x,t.y);for(let i=0;i<8;i++){const x=t.x,y=t.y;tryMove(t,Math.cos(ang)*5,Math.sin(ang)*5);if(t.x===x&&t.y===y)break;}ssHit(u,t,false,1,true);}
  if(p==='gravity')return;
 }
 if(p==='blaster'){ssBeam(u,u.x,u.y,angTo(u.x,u.y,t.x,t.y));return;}
 if(p==='cross'){ssCross(u,t);return;}
 if(p==='ring'){if(u.sp.ssDust&&u.ssFanon)for(let i=0;i<8;i++){const ang=i*TAU/8;ssBeam(u,t.x+Math.cos(ang)*130,t.y+Math.sin(ang)*130,ang+Math.PI,.5+i*.12,12);}return;}
 if(p==='opening'||p==='final'){ssCross(u,t,.7);ssCross(u,t,1.5);if(p==='final')ssCross(u,t,2.3);}
 const count=p==='final'?16:12,blue=p==='blue';
 for(let i=0;i<count;i++){if(p==='gap'&&Math.floor(i/2)===count/4)continue;const side=i%2?1:-1,x=p==='random'?t.x+(i-count/2)*20:t.x+side*130,y=p==='random'?t.y-130:t.y+(Math.floor(i/2)-count/4)*18;ssBone(u,x,y,p==='random'?Math.PI*.5:side>0?Math.PI:0,p==='side'?180:130,blue&&i%3!==0,i*.045);}
 if(p==='platform'&&!t.sp.statusImmune){t.ssBlueUntil=G.time+2.8;t.ssBlueV=0;}
 if(p==='platform')ssWorld().fields.push({kind:'platform',src:u,x:t.x,y:t.y+22,start:G.time+.35,until:G.time+2.8});
}
function thinkSans(u){
 if(!exCanAct(u)||u.ssSleeping||u.ssStallUntil>G.time||u.ssBusyUntil>G.time)return;
 const t=exAlive(u.tgt)&&hostileTo(u,u.tgt)?u.tgt:acquireTarget(u,650);u.tgt=t;
 if(!t){thinkMonster(u);return;}u.faceA=angTo(u.x,u.y,t.x,t.y);
 if(!losWalk(u.x,u.y,t.x,t.y,1)){setDest(u,t.x,t.y);return;}
 let d;
 if(!u.sp.ssDust&&u.ssTurns===0)d=u.atkList.find(d=>d.ssPower==='opening');
 else if(!u.sp.ssDust&&u.ssTurns>=23)d=u.atkList.find(d=>d.ssPower===(!u.ssFinalDone?'final':'stall'));
 else{
  const list=u.atkList.filter(d=>!['opening','final','stall'].includes(d.ssPower));
  for(let i=0;i<list.length;i++){const index=(u.ssPattern+i)%list.length;if(canUse(u,list[index],t)){d=list[index];u.ssPattern=index+1;break;}}
 }
 if(d&&canUse(u,d,t)){u.dest=null;u.path=null;u.moveSpd=0;startAttack(u,d,t);return;}
 if(dist(u.x,u.y,t.x,t.y)>380)setDest(u,t.x,t.y);else{u.dest=null;u.path=null;u.moveSpd=0;}
}
function ssOnDeath(att,t){if(!att?.sp.ssDust||!hostileTo(att,t)||t.sp.tkOrdnance||t.sp.slDecoy)return;att.ssEXP+=Math.max(1,Math.ceil(t.sp.mass||1));att.ssLV=Math.min(20,1+Math.floor(att.ssEXP/3));}
function updateSans(dt){
 const w=ssWorld();for(const e of w.events||[])if(e.at<=G.time&&!e.done){e.done=true;if(exAlive(e.src)&&exAlive(e.t)&&hostileTo(e.src,e.t)&&dist(e.src.x,e.src.y,e.t.x,e.t.y)<650&&losWalk(e.src.x,e.src.y,e.t.x,e.t.y,1)){ssCross(e.src,e.t,.7);for(let j=0;j<8;j++){const ang=j*TAU/8;ssBone(e.src,e.t.x+Math.cos(ang)*100,e.t.y+Math.sin(ang)*100,ang+Math.PI,100,j%3===0);}}}w.events=(w.events||[]).filter(e=>!e.done);
 for(const t of G.units){
  if(t.sp.ssUnit&&t.ssStallUntil&&t.ssStallUntil<=G.time){t.ssSleeping=true;t.ssDodgeLeft=0;t.ssStallUntil=0;}
  if(!exAlive(t))continue;
  t.ssMoved=t.ssPX!==undefined&&dist(t.x,t.y,t.ssPX,t.ssPY)>3*dt;t.ssPX=t.x;t.ssPY=t.y;
  if(t.ssBlueUntil>G.time){t.ssBlueV=Math.min(65,(t.ssBlueV||0)+120*dt);const platform=w.fields.find(f=>f.kind==='platform'&&f.start<=G.time&&f.until>G.time&&Math.abs(t.x-f.x)<30&&t.y<=f.y&&t.y+t.ssBlueV*dt>=f.y-t.r);if(platform){t.ssBlueV=0;}else{const y=t.y;tryMove(t,0,t.ssBlueV*dt);if(t.y!==y)t.ssMoved=true;}}
  if(t.ssKarma>0&&t.ssKarmaNext<=G.time){t.ssKarmaNext=G.time+(t.ssKarma>20?.08:.2);if(t.hp<=1){t.ssKarma=0;continue;}const before=t.hp;dealDamage(t.ssKarmaSrc,t,Math.min(1,t.hp-1),{ssKarma:true,ignoreArmor:true,canonNonlethal:true});if(t.hp<before)t.ssKarma--;}
 }
 for(let i=w.shots.length-1;i>=0;i--){const p=w.shots[i];if(p.delay>G.time)continue;p.life-=dt;let gone=p.life<=0;const n=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vy)*dt/5));for(let j=0;j<n&&!gone;j++){const x=p.x+p.vx*dt/n,y=p.y+p.vy*dt/n;if(!walkAtPx(x,y)){gone=true;break;}p.x=x;p.y=y;
  for(const t of G.units)if(exAlive(t)&&hostileTo(p.src,t)&&(p.hits.get(t.id)||0)<=G.time&&dist(p.x,p.y,t.x,t.y)<t.r+5){if(p.blue&&(t.moveSpd||0)<3&&!t.ssMoved)continue;ssHit(p.src,t,true,p.src.sp.ssDust?1+(p.src.ssLV-1)*.15:1,false,p.hits.has(t.id)?1:6);p.hits.set(t.id,G.time+1/30);}}
  if(gone)w.shots.splice(i,1);
 }
 for(const f of w.fields)if(f.kind==='beam'&&G.time>=f.start&&f.until>G.time&&f.next<=G.time){f.next=G.time+1/30;const dx=Math.cos(f.angle),dy=Math.sin(f.angle);for(const t of G.units){if(!exAlive(t)||!hostileTo(f.src,t))continue;const tx=t.x-f.x,ty=t.y-f.y,along=tx*dx+ty*dy;if(along>=0&&along<=650&&Math.abs(tx*dy-ty*dx)<t.r+f.width*.5&&losWalk(f.x,f.y,t.x,t.y,1)){ssHit(f.src,t,true,f.src.sp.ssDust?1+(f.src.ssLV-1)*.15:1,false,f.hits.has(t.id)?1:10);f.hits.add(t.id);}}}
 w.fields=w.fields.filter(f=>f.until>G.time);
}
function ssInspector(el,u){let note=document.getElementById('sansStatus');if(!u.sp.ssUnit){note?.remove();return;}if(!note){note=document.createElement('div');note.id='sansStatus';el.appendChild(note);}note.textContent='デバフ・転換無効／回避成功 '+(u.ssDodges||0)+'回／残り回避 '+u.ssDodgeLeft+(u.ssSleeping?'／疲労・睡眠中':'')+(u.sp.ssDust?'／LV '+u.ssLV+'／二次創作技 '+(u.ssFanon?'ON':'OFF'):'／HP 1')+'／再現差分：SANS.md';}
function buildSansPicker(box){const row=document.createElement('label');row.id='sansFanonSetting';row.style.cssText='display:block;margin:8px;color:#b6d8eb';const input=document.createElement('input');input.type='checkbox';input.checked=SS_FANON;input.addEventListener('change',()=>{SS_FANON=input.checked;try{localStorage.setItem('mw_sans_fanon',SS_FANON?'1':'0');}catch(e){}});row.appendChild(input);row.appendChild(document.createTextNode(' Dust Sans：二次創作技（骨の刃・回転ブラスター）を追加。次回開始時に適用'));box.appendChild(row);}
