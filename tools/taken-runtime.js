/* Destiny common Taken archetypes, not an invented universal infection.
 * Timings, HP, initial counts and cross-universe damage are game projections. */
const TK_PAL={skin:'#10121d',skinD:'#03050d',skinL:'#414b65',cloth:'#151522',clothD:'#04050d',clothL:'#384157',acc:'#d9f4ff',eye:'#f5fcff',blood:'#151326'};
AANIM.tkCrossSlash=[{t:0,armR:[.4,.4],armL:[.4,.4]},{t:.30,armR:[-2.3,1],armL:[2.1,.3],twist:.7,crouch:.12},{t:.38,armR:[1.8,.1],armL:[-1.8,1],twist:-.8,lean:.4},{t:.52,armR:[2,.1],armL:[1.8,.1],twist:-.4,lean:.4},{t:.68,armR:[1.4,.4],armL:[1.3,.4],lean:.2},{t:1,armR:[.4,.4],armL:[.4,.4],twist:0,lean:.08}];
const TK_TYPES=[['Thrall','スロール',100,1.2],['Acolyte','アコライト',170,1.25],['Knight','ナイト',420,1.8],['Wizard','ウィザード',280,1.6],['Ogre','オーガ',850,2.6],['Vandal','バンダル',180,1.4],['Captain','キャプテン',400,1.8],['Goblin','ゴブリン',160,1.3],['Hobgoblin','ホブゴブリン',260,1.55],['Minotaur','ミノタウロス',550,2],['Psion','サイオン',120,1.05],['Phalanx','ファランクス',360,1.8],['Centurion','センチュリオン',500,2]];
const TK_BASE=TK_TYPES.map(([role])=>'tk'+role),TK_SUPPORT=['tkShadowThrall','tkEye','tkShadowbeast'];
const TK_ROSTER=[...TK_BASE,...TK_SUPPORT];
let TK_INITIAL=1;try{const n=Number(localStorage.getItem('mw_taken_initial'));if(localStorage.getItem('mw_taken_initial')!==null&&Number.isSafeInteger(n)&&n>=0)TK_INITIAL=n;}catch(e){}
const tkMelee=(n='宿られた近接攻撃',dmg=18,reach=28,extra={})=>AT({n,type:'melee',dmg,reach,windup:.32,active:.18,rec:.4,cd:1.1,anim:'slash',...extra});
const tkPower=(n,power,dmg,range,cd,extra={})=>exAbility(n,'tk:'+power,dmg,range,cd,{tkPower:power,...extra});
const tkGun=(n,dmg=18,range=440,extra={})=>tkPower(n,'shot',dmg,range,1.8,{tkElement:'void',anim:'launch',...extra});
const tkBlinkAttack=()=>tkPower('短距離転移','blink',0,380,5,{windup:.18,rec:.2,anim:'blinkRend'});
const TK_LOADOUT={
 Thrall:[tkMelee('ソーラーの爪',18,25),tkBlinkAttack()],
 Acolyte:[tkGun('アーク・シュレッダー',16,400,{tkElement:'arc',volley:3}),tkGun('ボイド・ブーマー',24,440,{tkSplash:45}),tkGun('ステイシス・ハウラー',15,400,{tkElement:'stasis',tkPower:'howler',exAction:'tk:howler',cd:4}),tkPower('アコライトの眼を展開','eye',0,500,12),tkMelee()],
 Knight:[tkGun('ボイド・ブーマー',28,480,{tkSplash:50}),tkGun('ステイシス・ハウラー',18,400,{tkElement:'stasis',tkPower:'howler',exAction:'tk:howler',cd:4}),tkPower('ソーラージェット','flame',0,280,5,{anim:'gasSpray'}),tkBlinkAttack(),tkMelee('ハイヴの殴打',30,35)],
 Wizard:[tkGun('ネクロマンティック・ゲイズ',16,480,{tkElement:'solar',volley:3,windup:.9,cd:2.8}),tkPower('シャドウスロール召喚','thralls',0,600,10,{windup:.8}),tkMelee('接近排除',16,30)],
 Ogre:[tkPower('ロットン・サージ','surge',12,500,2,{windup:.55,knock:90}),AT({n:'グラウンドスラム',type:'aoe',aoeR:90,reach:90,dmg:42,windup:.7,active:.2,rec:.7,cd:4,anim:'stomp',knock:300})],
 Vandal:[tkGun('ソーラー・ワイヤーライフル',32,700,{tkElement:'solar',windup:.85,cd:3}),tkGun('アーク・シュラプネルランチャー',9,360,{tkElement:'arc',volley:5,spread:.08}),tkPower('防御バブル','bubble',0,600,14),tkBlinkAttack(),tkMelee('フォールンの殴打')],
 Captain:[tkGun('アーク・シュラプネルランチャー',10,360,{tkElement:'arc',volley:5,spread:.08}),tkMelee('アーク・ショックブレード',30,40,{anim:'tkCrossSlash'}),tkPower('ダークネスボルト','dark',28,Infinity,7,{windup:.75}),tkBlinkAttack()],
 Goblin:[tkGun('ボイド・スラップライフル',16,400),tkGun('ソーラー・トーチハンマー',26,440,{tkElement:'solar',tkSplash:50,cd:3}),tkPower('味方への無敵テザー','tether',0,600,3),tkMelee('ベックスの殴打')],
 Hobgoblin:[tkGun('ボイド・ラインライフル',30,700,{windup:.8,cd:3}),tkGun('ボイド・スラップライフル',18,440),tkBlinkAttack(),tkMelee('ベックスの殴打',22)],
 Minotaur:[tkGun('ソーラー・トーチハンマー',30,480,{tkElement:'solar',tkSplash:55}),tkGun('ボイド・スラップライフル',20,440),tkMelee('重機体の殴打',38,42,{knock:180})],
 Psion:[tkGun('高速アーク・スラグライフル',9,400,{tkElement:'arc',volley:3,cd:.9}),tkPower('分裂','split',0,600,14,{windup:.8}),tkMelee('サイキック近接',15,24)],
 Phalanx:[tkGun('アーク・スラグライフル',15,440,{tkElement:'arc',volley:2}),tkPower('シールドブラスト','shieldBlast',20,180,5,{windup:.65,anim:'palmWave'}),tkMelee('シールドバッシュ',28,38,{knock:240,anim:'bash'})],
 Centurion:[tkGun('ボイド・プロジェクションライフル',26,500,{tkSplash:45}),tkGun('アーク・スラグライフル',15,440,{tkElement:'arc',volley:2}),tkPower('追尾アクシオンダート','axion',32,600,7),tkBlinkAttack(),tkMelee('カバルの殴打',30,38)]
};
for(const [role,name,hp,scale] of TK_TYPES){
 exFighter('tk'+role,'宿られた'+name,'tk',hp,TK_LOADOUT[role],{ic:'◈',tkRole:role,tkUnit:1,ai:'taken',unique:0,exUnique:0,hair:null,held:null,scale,r:Math.min(17,8+scale*3),mass:scale>=2?6:2,walk:role==='Ogre'?38:58,run:role==='Ogre'?72:125,mortal:false,infectable:0,infectionImmune:1,pal:{...TK_PAL},fx:{},pp:{shoulder:scale>=1.8?7:5,torsoW:scale>=1.8?7:4.5,armU:10,armL:11},tkAbsorb:['Captain','Wizard','Centurion'].includes(role)?80:0,
 desc:'Destinyの宿られた'+name+'。黒い肉体と青白い炎を持つ。固有能力は兵種別。数値と屋敷内の挙動は投影で、接触感染で他陣営を宿らせる能力は持たせない。'});
}
// Species proportions remain visible in silhouette, rather than reskinned humans.
Object.assign(SP.tkThrall,{pose0:{armS:.6,armE:.7,lean:.36,crouch:.2,headP:.2},pp:{shoulder:6,torsoW:5,armU:13,armL:17,armR:1.8,legU:12,legL:13}});
Object.assign(SP.tkOgre.pp,{shoulder:12,torsoW:11,hipW:7,armR:4.5,armU:14,armL:14,legR:4.2});
Object.assign(SP.tkOgre.pose0,{lean:.25,crouch:.15});
for(const key of ['tkPhalanx','tkCenturion'])Object.assign(SP[key].pp,{shoulder:10,torsoW:9,hipW:7,armR:3,legR:3.5});
for(const key of ['tkCaptain','tkVandal'])Object.assign(SP[key].pp,{shoulder:8,torsoW:6,armR:2,armU:13,armL:14});
SP.tkShadowThrall={...SP.tkThrall,name:'シャドウスロール',tkRole:'ShadowThrall',hp:65,scale:1.1,atks:[tkMelee('影のソーラーの爪',14,24)]};
SP.tkEye={...SP.tkAcolyte,name:'アコライトの眼',tkRole:'Eye',walk:0,run:0,mass:20,r:9,hp:100,scale:.8,atks:[tkGun('眼のアーク連射',12,420,{tkElement:'arc',volley:3,cd:1.5})]};
SP.tkShadowbeast={...SP.tkThrall,name:'シャドウビースト',tkRole:'Shadowbeast',kind:'quad',hp:130,scale:1.2,walk:65,run:155,atks:[tkMelee('影獣の噛みつき',22,24,{anim:'bite'})]};
SP.tkAxion={...SP.tkEye,name:'アクシオンダート',tkRole:'Axion',tkOrdnance:1,hp:12,r:5,scale:.4,atks:[]};
function tkWorld(){return G.taken||(G.taken={bolts:[],fields:[],summoned:0,splits:0});}
function tkInitUnit(u){
 if(!u.sp.tkUnit)return;u.tkShield=u.sp.tkAbsorb||0;
 if(u.sp.tkRole==='Psion')u.cds['分裂']=G.time+14;
 if(u.sp.tkRole==='Minotaur')u.tkRevealUntil=0;
}
function tkSpawn(key,x,y){
 if(!facOn('tk'))return null;const p=exPoint(x,y);if(!p)return null;
 const u=spawnUnit(key,p.x,p.y,{force:true});if(u){tkInitUnit(u);if(G.stats.tk)G.stats.tk.born++;tkWorld().summoned++;}return u;
}
function tkBirthNear(u,key){
 for(let i=0;i<8;i++){const a=(i+u.id)*TAU/8,x=u.x+Math.cos(a)*TILE,y=u.y+Math.sin(a)*TILE;if(bodyClear(x,y,SP[key].r)&&losWalk(u.x,u.y,x,y,1))return tkSpawn(key,x,y);}
 return tkSpawn(key,u.x,u.y);
}
function spawnTaken(){
 G.taken={bolts:[],fields:[],summoned:0,splits:0};if(!facOn('tk')||TK_INITIAL===0)return;
 const room=spawnRoom();for(const key of [...TK_BASE,'tkShadowbeast'])for(let i=0;i<TK_INITIAL;i++){const p=randWalkIn(room);tkSpawn(key,p.x,p.y);}
}
function tkTetherValid(source,target){
 return exAlive(source)&&exAlive(target)&&source!==target&&source.fac==='tk'&&target.fac==='tk'&&source.tkTetherTarget===target&&source.sp.tkRole==='Goblin'&&target.sp.tkRole!=='Goblin'&&!target.sp.tkOrdnance&&['idle','move','attack'].includes(source.state)&&!(source.stunT>0)&&!(source.tkBlindUntil>G.time)&&!(source.tkFrozenUntil>G.time)&&source.moveSpd<8&&dist(source.x,source.y,target.x,target.y)<=180&&losWalk(source.x,source.y,target.x,target.y,1);
}
function tkAlly(u){
 return G.units.filter(t=>exAlive(t)&&t!==u&&t.fac==='tk'&&!t.sp.tkOrdnance&&t.sp.tkRole!=='Goblin'&&dist(u.x,u.y,t.x,t.y)<=180&&losWalk(u.x,u.y,t.x,t.y,1)).sort((a,b)=>b.mhp-a.mhp)[0]||null;
}
function tkDamage(att,tgt,dmg,o){
 if(dmg<=0||tgt.fac!=='tk')return dmg;
 for(const source of G.units)if(source.tkTetherTarget===tgt&&tkTetherValid(source,tgt)){combatBlock(tgt,'ゴブリンの無敵テザー（供給元を攻撃）');return 0;}
 for(const f of G.taken?.fields||[])if(f.kind==='bubble'&&f.until>G.time&&tgt.fac==='tk'&&dist(tgt.x,tgt.y,f.x,f.y)<=f.r&&att&&att.fac!=='tk'&&dist(att.x,att.y,f.x,f.y)>f.r&&(o.restProjectile||o.tkProjectile||(o.fiveWeapon&&!o.golemMelee)||(o.acid&&!o.golemMelee)||o.explosion)){
  combatBlock(tgt,'宿られたバンダルのバブル（内側へ侵入可能）');return 0;
 }
 if(tgt.sp.tkRole==='Phalanx'&&att&&!o.explosion&&!o.tkShieldPierce&&(o.restProjectile||o.tkProjectile||(o.fiveWeapon&&!o.golemMelee)||(o.acid&&!o.golemMelee)||o.explosion)&&Math.abs(angDiff(tgt.faceA,angTo(tgt.x,tgt.y,att.x,att.y)))<1.15&&!(tgt.stunT>0)){combatBlock(tgt,'ファランクスの正面シールド');return 0;}
 if(tgt.sp.tkUnit){
  tgt.tkShieldHitAt=G.time;tgt.tkFrontUntil=G.time+2;
  if(tgt.tkShield==null)tgt.tkShield=tgt.sp.tkAbsorb||0;
  if(tgt.tkShield>0){const absorb=Math.min(tgt.tkShield,dmg);tgt.tkShield-=absorb;dmg-=absorb;if(dmg===0)combatBlock(tgt,'属性吸収シールド');}
 }
 return dmg;
}
function tkOnHit(u,att,dmg,o){
 if(!u.sp.tkUnit||!att||dmg<=0)return;
 if(u.sp.tkRole==='Hobgoblin'&&(u.tkRetaliateAt||0)<=G.time&&exAlive(att)&&hostileTo(u,att)){u.tkRetaliateAt=G.time+4;for(let i=0;i<3;i++)tkBolt(u,att,{dmg:12,tkElement:'void'},'retaliate',i*.16);}
 if(u.sp.tkRole==='Minotaur'){u.tkRevealDamage=(u.tkRevealDamage||0)+dmg;if(u.tkRevealDamage>=30){u.tkRevealUntil=G.time+2;u.tkRevealDamage=0;}}
 if(['Thrall','Knight','Captain','Vandal','Hobgoblin','Centurion'].includes(u.sp.tkRole))u.tkWantBlink=true;
}
function tkBolt(u,t,d,kind='shot',delay=0){
 const a=angTo(u.x,u.y,t.x,t.y),speed=kind==='dark'?230:kind==='retaliate'?370:450;
 tkWorld().bolts.push({src:u,target:t,x:u.x,y:u.y,z:24,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,speed,kind,dmg:d.dmg,splash:d.tkSplash||0,element:d.tkElement||'void',knock:d.knock||45,at:G.time+delay,expire:G.time+delay+Math.hypot(G.map.wpx,G.map.hpx)/speed+1,hits:new Map()});
}
function tkBlink(u,t){
 if(u.tkFrozenUntil>G.time||u.tkRootUntil>G.time)return false;
 const a=angTo(u.x,u.y,t.x,t.y),distance=Math.min(100,Math.max(35,dist(u.x,u.y,t.x,t.y)-u.r-t.r-20));
 for(const offset of (['Thrall','ShadowThrall'].includes(u.sp.tkRole)?[Math.PI/2,-Math.PI/2,1.2,-1.2]:[0,.6,-.6,1.2,-1.2])){const x=u.x+Math.cos(a+offset)*distance,y=u.y+Math.sin(a+offset)*distance;if(bodyClear(x,y,u.r)&&losWalk(u.x,u.y,x,y,u.r*.6)){addShock(u.x,u.y,4,24,'#dcecff');u.x=x;u.y=y;u.dest=null;u.path=null;addShock(x,y,4,28,'#a9d3ff');return true;}}
 return false;
}
function tkFire(u,d,a){
 const t=a.tgt,p=d.tkPower;if(!t)return;
 if(p==='split'){if(tkBirthNear(u,u.key))tkWorld().splits++;return;}
 if(p==='thralls'){for(let i=0;i<2;i++)tkBirthNear(u,'tkShadowThrall');return;}
 if(p==='eye'){tkBirthNear(u,'tkEye');return;}
 if(p==='bubble'){tkWorld().fields.push({kind:'bubble',x:u.x,y:u.y,r:85,until:G.time+6,src:u,next:G.time});return;}
 if(p==='tether'){u.tkTetherTarget=tkAlly(u);u.dest=null;u.path=null;u.moveSpd=0;return;}
 if(p==='blink'){tkBlink(u,t);u.tkWantBlink=false;return;}
 if(p==='axion'){const orb=tkSpawn('tkAxion',u.x,u.y);if(orb){orb.tkOwner=u;orb.tkTarget=t;orb.tkExpire=G.time+8;orb.tkPayload=d.dmg;}return;}
 if(p==='shieldBlast'){
  u.faceA=angTo(u.x,u.y,t.x,t.y);for(const v of G.units.slice())if(exAlive(v)&&hostileTo(u,v)&&dist(u.x,u.y,v.x,v.y)<180&&Math.abs(angDiff(u.faceA,angTo(u.x,u.y,v.x,v.y)))<.75&&losWalk(u.x,u.y,v.x,v.y,1))dealDamage(u,v,d.dmg,{tkProjectile:true,kpow:420,kdir:angTo(u.x,u.y,v.x,v.y)});addShock(u.x,u.y,12,140,'#d8eaff');return;
 }
 if(p==='flame'){const a=angTo(u.x,u.y,t.x,t.y);for(const r of [40,85,130,175]){const x=u.x+Math.cos(a)*r,y=u.y+Math.sin(a)*r;if(!losWalk(u.x,u.y,x,y,1))break;tkWorld().fields.push({kind:'flame',x,y,r:30,until:G.time+6,src:u,next:G.time,dmg:9});}return;}
 if(p==='surge'){
  const ramp=G.time-(u.tkLastSurge||0)<5?Math.min(3,(u.tkSurgeRamp||0)+1):0;u.tkSurgeRamp=ramp;u.tkLastSurge=G.time;
  for(let i=0;i<5;i++)tkBolt(u,t,{...d,tkElement:'arc',knock:95},'shot',i*(.16-ramp*.025));return;
 }
 for(let i=0;i<(d.volley||1);i++){tkBolt(u,t,d,p==='dark'?'dark':p==='howler'?'howler':'shot',i*.08);const b=tkWorld().bolts.at(-1);if(d.spread){const angle=angTo(u.x,u.y,t.x,t.y)+(i-((d.volley||1)-1)/2)*d.spread;b.vx=Math.cos(angle)*b.speed;b.vy=Math.sin(angle)*b.speed;}}
}
function tkImpact(p,t){
 const before=t.hp;dealDamage(p.src,t,p.dmg,{tkProjectile:true,explosion:!!p.splash,kpow:p.knock,kdir:Math.atan2(p.vy,p.vx)});
 if(p.splash)tkSplash(p,t);
 if(t.hp>=before)return;
 if(p.kind==='dark'){t.tkBlindUntil=G.time+3;t.tkDeafUntil=G.time+3;t.memSight={};}
}
function tkSplash(p,exclude){
 if(p.tkBurst)return;p.tkBurst=true;addShock(p.x,p.y,5,p.splash,'#bec8ef');
 for(const t of G.units.slice())if(t!==exclude&&exAlive(t)&&hostileTo(p.src,t)&&dist(p.x,p.y,t.x,t.y)<p.splash+t.r&&losWalk(p.x,p.y,t.x,t.y,1))dealDamage(p.src,t,p.dmg,{tkProjectile:true,explosion:true,kpow:p.knock,kdir:angTo(p.x,p.y,t.x,t.y)});
}
function tkFreeze(t){
 t.tkFrost=(t.tkFrostUntil>G.time?t.tkFrost||0:0)+1;t.tkFrostUntil=G.time+4;t.slowT=Math.max(t.slowT||0,2);
 if(t.tkFrost>=3){interrupt(t);t.tkFrozenUntil=G.time+2;t.stunT=Math.max(t.stunT||0,2);t.tkFrost=0;}
}
function updateTaken(dt){
 const w=G.taken;if(!w)return;
 // Snapshot: summoning and damage callbacks must not invalidate iterations.
 for(const u of G.units.slice())if(exAlive(u)&&u.sp.tkUnit){
  if(u.sp.tkAbsorb&&(u.tkShieldHitAt||0)+7<G.time)u.tkShield=Math.min(u.sp.tkAbsorb,(u.tkShield??u.sp.tkAbsorb)+12*dt);
  if(u.sp.tkRole==='Minotaur'&&u.atk?.def.type==='melee')u.tkRevealUntil=G.time+1.5;
  if(u.tkTetherTarget&&!tkTetherValid(u,u.tkTetherTarget))u.tkTetherTarget=null;
  if(u.sp.tkRole==='Axion')tkAxionStep(u,dt);
 }
 for(const p of w.bolts.slice()){
  if(p.dead||p.at>G.time)continue;if(p.expire<G.time){p.dead=true;continue;}
  if(p.kind==='retaliate'&&exAlive(p.target)){const a=Math.atan2(p.vy,p.vx),want=angTo(p.x,p.y,p.target.x,p.target.y),next=a+clamp(angDiff(a,want),-dt*4,dt*4);p.vx=Math.cos(next)*p.speed;p.vy=Math.sin(next)*p.speed;}
  const n=Math.max(1,Math.ceil(p.speed*dt/5));
  for(let i=0;i<n&&!p.dead;i++){
   p.x+=p.vx*dt/n;p.y+=p.vy*dt/n;
   if(p.x<0||p.y<0||p.x>G.map.wpx||p.y>G.map.hpx||(p.kind!=='dark'&&!walkAtPx(p.x,p.y))){if(p.splash){p.x-=p.vx*dt/n;p.y-=p.vy*dt/n;tkSplash(p,null);}if(p.kind==='howler'&&p.x>=0&&p.y>=0&&p.x<=G.map.wpx&&p.y<=G.map.hpx)w.fields.push({kind:'stasis',x:p.x-p.vx*dt/n,y:p.y-p.vy*dt/n,r:45,until:G.time+5,src:p.src,next:G.time,dmg:0});p.dead=true;break;}
   let impact=false;
   for(const t of G.units.slice())if(exAlive(t)&&t!==p.src&&hostileTo(p.src,t)&&Math.abs((t.z||0)-p.z)<75&&dist(p.x,p.y,t.x,t.y)<t.r+(p.kind==='dark'?16:5)){
    const hits=p.hits.get(t.id)||{n:0,next:0};if(hits.n>=(p.kind==='dark'?2:1)||hits.next>G.time)continue;tkImpact(p,t);p.hits.set(t.id,{n:hits.n+1,next:G.time+.12});impact=true;if(p.kind!=='dark'){p.dead=true;break;}
   }
   if(p.kind==='howler'&&impact){w.fields.push({kind:'stasis',x:p.x,y:p.y,r:45,until:G.time+5,src:p.src,next:G.time,dmg:0});}
  }
 }
 w.bolts=w.bolts.filter(p=>!p.dead);
 for(const f of w.fields){
  if(f.until<=G.time||f.next>G.time)continue;f.next=G.time+.5;
  for(const t of G.units.slice())if(exAlive(t)&&dist(t.x,t.y,f.x,f.y)<=f.r){
   if(f.kind==='bubble'){if(t.fac==='tk')t.hp=Math.min(t.mhp,t.hp+4);}
   else if(hostileTo(f.src,t)){if(f.kind==='flame')dealDamage(f.src,t,f.dmg,{tkField:true});else tkFreeze(t);}
  }
 }
 w.fields=w.fields.filter(f=>f.until>G.time);
}
function tkAxionStep(u,dt){
 const t=u.tkTarget;if(!exAlive(t)||u.tkExpire<G.time){u.gone=true;u.dead=true;return;}
 let goal=t;
 if(!losWalk(u.x,u.y,t.x,t.y,1)){
  if(!u.tkRoute||(u.tkRouteAt||0)<G.time){u.tkRoute=findPath(u.x,u.y,t.x,t.y,1)||[];u.tkRouteAt=G.time+.4;}
  while(u.tkRoute.length&&dist(u.x,u.y,u.tkRoute[0].x,u.tkRoute[0].y)<8)u.tkRoute.shift();goal=u.tkRoute[0]||t;
 }
 const a=angTo(u.x,u.y,goal.x,goal.y),x=u.x+Math.cos(a)*105*dt,y=u.y+Math.sin(a)*105*dt;
 if(!walkAtPx(x,y)){u.gone=true;u.dead=true;return;}u.x=x;u.y=y;
 if(dist(u.x,u.y,t.x,t.y)<t.r+8){u.tkDetonated=true;exBlast(u.tkOwner||u,u.x,u.y,50,u.tkPayload||32);u.gone=true;u.dead=true;}
}
function thinkTaken(u){
 if(u.sp.tkOrdnance)return;
 if(u.tkTetherTarget&&tkTetherValid(u,u.tkTetherTarget)){u.dest=null;u.path=null;u.moveSpd=0;return;}
 let t=exAlive(u.tgt)&&hostileTo(u,u.tgt)?u.tgt:acquireTarget(u,750);u.tgt=t;
 if(u.sp.tkRole==='Goblin'&&tkAlly(u)){
  const d=u.atkList.find(d=>d.tkPower==='tether');if(canUse(u,d,tkAlly(u))){startAttack(u,d,tkAlly(u));return;}
 }
 if(!t){if(u.sp.walk>0&&(!u.dest||u.st>8)){const p=randWalkIn(rpick(G.map.rooms));setDest(u,p.x,p.y);}return;}
 u.faceA=angTo(u.x,u.y,t.x,t.y);
 const priorities={Psion:'split',Wizard:'thralls',Acolyte:'eye',Vandal:'bubble',Centurion:'axion',Knight:'flame',Captain:'dark',Phalanx:'shieldBlast'};
 const power=u.tkWantBlink?'blink':priorities[u.sp.tkRole],special=u.atkList.find(d=>d.tkPower===power);
 if(special&&canUse(u,special,t)){startAttack(u,special,t);return;}
 const d=chooseAttack(u,t);if(d){startAttack(u,d,t);return;}
 if(u.sp.walk>0)setDest(u,t.x,t.y);else{u.dest=null;u.path=null;}
}
function tkOnDeath(u,att){
 if(u.sp.tkRole==='Hobgoblin'&&exAlive(att)&&hostileTo(u,att))for(let i=0;i<3;i++)tkBolt(u,att,{dmg:12,tkElement:'void'},'retaliate',i*.16);
 if(u.sp.tkOrdnance&&!u.tkDetonated){u.tkDetonated=true;addShock(u.x,u.y,4,25,'#d7e6ff');}
}
function takenHidden(u){return u.sp.tkRole==='Minotaur'&&!(u.tkRevealUntil>G.time);}
function buildTakenCountPicker(box){
 const el=document.createElement('div');el.className='fgrp';el.id='takenCounts';el.innerHTML='<label>宿られた軍団：通常13兵種＋影獣の各初期数 <input type="number" min="0" step="1" value="'+TK_INITIAL+'" style="width:64px" aria-label="宿られた軍団の各初期数"></label>';
 el.addEventListener('change',e=>{const n=Number(e.target.value);if(Number.isSafeInteger(n)&&n>=0){TK_INITIAL=n;try{localStorage.setItem('mw_taken_initial',String(n));}catch(err){}}else e.target.value=TK_INITIAL;});box.appendChild(el);
}
