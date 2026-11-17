/* Minecraft Legends roster; room-scale production/build timing is a simulation. */
const PM_PAL={skin:'#d69580',skinD:'#8e514a',skinL:'#f0b4a2',cloth:'#504039',clothD:'#251e25',clothL:'#7e6150',acc:'#d6ad48',eye:'#f4d8aa',blood:'#8a3030'};
const PM_TROOPS=['piglin','piglinxbow','pbrute','hoglin','pmClanger','pmBuilder','pmSporeMedic','pmSeeker','pmPigmadillo','pmSporeback','pmLavaLauncher','pmPortalGuard'];
const PM_BOSSES=['pmBeast','pmDevourer','pmUnbreakable','pmGreatHog'];
const PM_STRUCTURES=['pfort','pmBarracks','pmBlazeTower','pmNetherSpreader'];
const PM_ROSTER=[...PM_TROOPS,...PM_BOSSES,'pmSeer',...PM_STRUCTURES];
function pmMelee(n,dmg=20,reach=24,extra={}){return AT({n,type:'melee',dmg,reach,windup:.4,active:.18,rec:.5,cd:1.3,anim:'heavy',...extra});}
function pmShot(n,dmg=18,maxR=380,extra={}){return AT({n,type:'proj',projKind:'bullet',minR:0,maxR,dmg,windup:.5,active:.12,rec:.5,cd:2,anim:'launch',fiveShot:extra.projKind==='nade'?'grenade':'pmProjectile',...extra});}
function pmDef(k,name,role,hp,scale,atks,extra={}){
 SP[k]={...SP.pbrute,name,ic:'🐷',fac:'P',ai:'pigArmy',head:'mcpiglin',held:role==='mace'?'bat':null,kind:'biped',pigArmy:role,hp,scale,r:Math.min(17,8+scale*3),walk:42,run:95,mass:Math.max(1,scale*2),superArmor:0,mortal:true,infectable:1,pal:{...PM_PAL},pp:{shoulder:6.3,torsoW:6.6,hipW:5.6,armR:2.6,legR:2.7,armU:8.5,armL:8.2,spine1:8,spine2:9,headR:6.8,...(scale>=2.5?{shoulder:9,torsoW:10,hipW:8,armR:4,legR:3.8,headR:8}:{} )},fx:{},atks,desc:'Minecraft Legends ピグリン軍：'+name+'。建築・生産・ネザー化を伴う侵攻軍。屋敷内の数値・配置はゲーム用アレンジ。',...extra};
}
pmDef('piglin','メイス・ラント','mace',110,1.05,[pmMelee('メイス打撃',14,20)],{held:'bat'});
pmDef('piglinxbow','ブレイズ・ラント','blaze',95,1.05,[pmShot('ブレイズロッド投擲',16,420,{projKind:'fireball'})]);
pmDef('pbrute','ブルート（Legends）','brute',300,1.8,[pmMelee('重武器振り下ろし',30,34),AT({n:'重武器薙ぎ',type:'aoe',aoeR:65,reach:65,dmg:24,windup:.6,active:.2,rec:.7,cd:4,anim:'bigSpin'})],{held:'axe'});
pmDef('hoglin','ウォーボア','warboar',180,1.4,[AT({n:'牙の突進',type:'dash',dash:170,reach:22,dmg:24,windup:.35,active:.4,rec:.6,cd:3,anim:'pounce'})],{kind:'quad',head:'mchoglin',walk:55,run:140});
pmDef('pmClanger','クランガー','clanger',150,1.2,[pmMelee('シンバル衝撃',16,55,{down:1,knock:140})]);
pmDef('pmBuilder','ピグリン・ビルダー','builder',120,1.05,[pmShot('爆弾投擲',20,280,{projKind:'nade',cd:4})],{held:'axe'});
pmDef('pmSporeMedic','スポア・メディック','medic',115,1.05,[AT({n:'ネザースポア噴出',type:'cone',coneR:120,arc:.7,dmg:8,windup:.5,active:.3,rec:.6,cd:3,anim:'gasSpray',toxic:1})]);
pmDef('pmSeeker','シーカー','seeker',70,1,[AT({n:'自爆突進',type:'dash',dash:130,reach:22,dmg:36,windup:.3,active:.4,rec:.2,cd:4,anim:'charge',pmSeeker:1})],{run:145});
pmDef('pmPigmadillo','ピグマディロ','pigmadillo',420,2,[AT({n:'装甲回転突進',type:'dash',dash:240,reach:30,dmg:38,windup:.5,active:.65,rec:.8,cd:4,anim:'pounce'})],{kind:'quad',head:'mchoglin',superArmor:1});
pmDef('pmSporeback','スポアバック','sporeback',320,1.9,[pmShot('拘束キノコ投擲',22,360,{projKind:'spit',down:1,cd:3})]);
pmDef('pmLavaLauncher','ラヴァ・ランチャー','lava',600,2.4,[pmShot('溶岩砲撃',36,640,{projKind:'nade',fiveShot:'mortar',blastR:80,cd:4})],{kind:'quad',head:'mchoglin',walk:28,run:48});
pmDef('pmPortalGuard','ポータル・ガード','guard',720,2.5,[pmMelee('フレイル打撃',42,48),pmShot('フレイル射出',34,260,{cd:4})]);
pmDef('pmBeast','ザ・ビースト','beast',1800,2.8,[AT({n:'巨体突進',type:'dash',dash:270,reach:40,dmg:55,windup:.7,active:.65,rec:.8,cd:4,anim:'charge'}),pmMelee('大槌打撃',60,48)],{held:'bat',walk:60,run:160});
pmDef('pmDevourer','ザ・デヴァウアー','devourer',2200,3,[pmShot('胞子の吐瀉',35,420,{projKind:'spit',toxic:1}),AT({n:'巨体着地',type:'leap',leap:200,reach:65,dmg:60,windup:.8,active:.7,rec:1,cd:6,anim:'stomp'})]);
pmDef('pmUnbreakable','ザ・アンブレイカブル','unbreakable',2400,3,[pmShot('腕の溶岩砲',50,600,{projKind:'nade',fiveShot:'mortar',blastR:110,cd:4}),pmMelee('重装打撃',55,45)],{superArmor:1});
pmDef('pmGreatHog','ザ・グレートホッグ','greatHog',3200,3.5,[pmMelee('巨槍薙ぎ',65,65,{knock:300}),pmShot('魔法の杖',45,540,{projKind:'fireball',cd:4}),AT({n:'杖の衝撃波',type:'aoe',aoeR:120,reach:120,dmg:45,windup:1,active:.2,rec:1,cd:7,anim:'palmWave'})],{held:'trident'});
pmDef('pmSeer','シーア（非戦闘指揮者）','seer',180,1.1,[],{held:null,pmNonCombat:1});
for(const k of PM_STRUCTURES){pmDef(k,{pfort:'ネザーポータル',pmBarracks:'ピグリン兵舎',pmBlazeTower:'ブレイズロッド・タワー',pmNetherSpreader:'ネザー・スプレッダー'}[k],'structure',k==='pfort'?1200:450,1.3,k==='pmBlazeTower'?[pmShot('防衛ブレイズロッド',18,420,{projKind:'fireball'})]:[],{pigStructure:1,walk:0,run:0,r:13,mass:30,infectionImmune:1,infectable:0,mortal:false});}
function pmSpawn(k,x,y){const p=exPoint(x,y);if(!p)return null;const u=spawnUnit(k,p.x,p.y,{force:true});if(u&&G.stats.P)G.stats.P.born++;return u;}
function spawnPigArmy(room){
 if(!facOn('P'))return;const x=(room.cx+.5)*TILE,y=(room.cy+.5)*TILE;
 pmSpawn('pfort',x,y);for(const k of PM_ROSTER.filter(k=>k!=='pfort')){const p=PM_STRUCTURES.includes(k)?(pmBuildSite({x,y})||randWalkIn(room)):randWalkIn(room);pmSpawn(k,p.x,p.y);}
}
function pmBuildSite(u){
 const room=G.map.rooms[roomOfUnit(u)]||G.map.rooms[0];
 for(let i=0;i<30;i++){const p=randWalkIn(room);if(!G.units.some(v=>skAlive(v)&&v.sp.pigStructure&&dist(v.x,v.y,p.x,p.y)<TILE*1.5))return p;}return null;
}
function updatePigArmy(dt){
 for(const v of G.units.slice())if(skAlive(v)&&v.pmDotUntil>G.time&&(v.pmDotNext||0)<=G.time){v.pmDotNext=G.time+.5;dealDamage(v.pmDotOwner,v,2,{pmTick:true});}
 if(!G.pigArmy)G.pigArmy={nether:new Map(),born:0,built:0};
 const units=G.units.filter(u=>skAlive(u)&&u.fac==='P'&&u.sp.pigArmy);
 for(const u of units){
  if(u.sp.pigStructure){u.dest=null;u.moveSpd=0;
   if(u.key==='pfort'||u.key==='pmBarracks'){
    u.pmSpawnIn=(u.pmSpawnIn??12)-dt;if(u.pmSpawnIn<=0){u.pmSpawnIn=u.key==='pfort'?14:20;const k=PM_TROOPS[(u.pmProduced||0)%PM_TROOPS.length];u.pmProduced=(u.pmProduced||0)+1;if(pmSpawn(k,u.x+TILE,u.y))G.pigArmy.born++;}
   }
   if(u.key==='pfort'||u.key==='pmNetherSpreader'){
    u.pmSpreadIn=(u.pmSpreadIn||0)-dt;if(u.pmSpreadIn<=0){u.pmSpreadIn=3;const r=(u.pmRadius||0)+1;u.pmRadius=r;for(let dx=-r;dx<=r;dx++)for(const dy of [-r,r])pmNether(u.x+dx*TILE,u.y+dy*TILE);for(let dy=-r+1;dy<r;dy++)for(const dx of [-r,r])pmNether(u.x+dx*TILE,u.y+dy*TILE);if(r>TILE+Math.max(G.map.w,G.map.h))u.pmSpreadIn=Infinity;}
   }continue;
  }
  if(u.sp.pigArmy==='medic'){
   u.pmHealIn=(u.pmHealIn||0)-dt;if(u.pmHealIn<=0){u.pmHealIn=1;for(const v of units)if(!v.sp.pigStructure&&dist(v.x,v.y,u.x,u.y)<130)v.hp=Math.min(v.mhp,v.hp+6);}
  }
  if(u.sp.pigArmy==='seeker'&&u.atk?.def.pmSeeker&&u.atk.fired){
   const t=u.atk.tgt;if(skAlive(t)&&dist(u.x,u.y,t.x,t.y)<u.r+t.r+30){exBlast(u,u.x,u.y,75,36);u.hp=0;killUnit(null,u,{noRise:true});}continue;
  }
  if(u.sp.pigArmy==='builder'&&G.ctrl!==u){
   u.pmBuildIn=(u.pmBuildIn??18)-dt;
   if(u.pmBuildIn<=0&&(!u.tgt||!skAlive(u.tgt)||dist(u.x,u.y,u.tgt.x,u.tgt.y)>220)){
    if(!u.pmSite)u.pmSite=pmBuildSite(u);
    if(u.pmSite&&dist(u.x,u.y,u.pmSite.x,u.pmSite.y)<25&&['idle','move'].includes(u.state)){
     u.pmWork=(u.pmWork||0)+dt;if(u.pmWork>=3){const p=u.pmSite,k=['pmNetherSpreader','pmBarracks','pmBlazeTower'][(u.pmBuilt||0)%3];if(!G.units.some(v=>skAlive(v)&&v.sp.pigStructure&&dist(v.x,v.y,p.x,p.y)<TILE)){if(pmSpawn(k,p.x,p.y))G.pigArmy.built++;}u.pmBuilt=(u.pmBuilt||0)+1;u.pmSite=null;u.pmWork=0;u.pmBuildIn=25;}
    }
   }
  }
 }
}
function pmNether(x,y){if(walkAtPx(x,y))G.pigArmy.nether.set(skCell(x,y),{x:(Math.floor(x/TILE)+.5)*TILE,y:(Math.floor(y/TILE)+.5)*TILE});}
function thinkPigArmy(u){
 if(u.sp.pigArmy==='seer'){u.dest=null;return;}
 if(u.sp.pigStructure){u.dest=null;const t=acquireTarget(u,450);if(t){const a=chooseAttack(u,t);if(a)startAttack(u,a,t);}return;}
 if(u.sp.pigArmy==='builder'&&u.pmSite&&(!u.tgt||!skAlive(u.tgt)||dist(u.x,u.y,u.tgt.x,u.tgt.y)>220)){if(dist(u.x,u.y,u.pmSite.x,u.pmSite.y)>20)setDest(u,u.pmSite.x,u.pmSite.y);else{u.dest=null;u.moveSpd=0;}return;}
 thinkMonster(u);
}
function drawPigWorld(){
 if(!G.pigArmy)return;ctx.save();ctx.fillStyle='rgba(106,37,43,.38)';for(const p of G.pigArmy.nether.values()){ctx.fillRect(p.x-TILE/2,p.y*SQ-TILE*SQ/2,TILE,TILE*SQ);ctx.fillStyle='rgba(174,75,48,.22)';ctx.fillRect(p.x-7,p.y*SQ-2,8,3);ctx.fillStyle='rgba(106,37,43,.38)';}ctx.restore();
}
function drawPigStructure(u){
 const x=u.x,y=u.y*SQ,a=u.atk,d=a?.def,t=a?.t||0,w=Math.max(.001,d?.windup||.5),wind=a&&u.state==='attack'&&t<w?Math.sin(t/w*Math.PI/2):0,flash=a&&u.state==='attack'&&t>=w?Math.exp(-(t-w)/.18):0;
 ctx.save();ctx.lineJoin='miter';drawFacingBlock(x,y+1,46,18,8,1,'#50373d','#2a242c','#88604f');
 // Fixed masonry details: no frame-to-frame random flickering.
 for(let i=0;i<4;i++){ctx.strokeStyle='#30252d';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-20,y-4-i*4);ctx.lineTo(x+20,y-4-i*4);ctx.stroke();}
 if(u.key==='pfort'){
  drawFacingBlock(x-20,y-16,8,68,5,1,'#3b3043','#1c1b28','#685367');drawFacingBlock(x+20,y-16,8,68,5,1,'#3b3043','#1c1b28','#685367');drawFacingBlock(x,y-80,48,10,6,1,'#665047','#342d32','#a08054');
  ctx.save();ctx.beginPath();ctx.rect(x-15,y-78,30,61);ctx.clip();const g=ctx.createLinearGradient(x-15,y-78,x+15,y-17);g.addColorStop(0,'#281a3c');g.addColorStop(.5,'#81479c');g.addColorStop(1,'#3a2452');ctx.fillStyle=g;ctx.fillRect(x-15,y-78,30,61);
  for(let i=0;i<7;i++){const yy=y-75+((G.time*12+i*9)%58),sway=Math.sin(G.time*2+i)*5;ctx.strokeStyle=i%2?'rgba(201,132,231,.65)':'rgba(53,24,80,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-18,yy);ctx.bezierCurveTo(x-5+sway,yy-8,x+6-sway,yy+8,x+18,yy-3);ctx.stroke();}ctx.restore();
  ctx.fillStyle='#bd9458';for(const side of [-1,1])for(let i=0;i<4;i++)ctx.fillRect(x+side*20-1,y-71+i*14,2,5);
 }else if(u.key==='pmBlazeTower'){
  drawFacingBlock(x,y-17,24,47,6,1,'#6b5141','#3c3234','#9d794a');drawFacingBlock(x,y-62,36,10,7,1,'#b7843d','#65482e','#e0b66b');
  for(let i=0;i<3;i++){ctx.fillStyle='#332b30';ctx.fillRect(x-7,y-53+i*11,13,3);}
  const hh=14+Math.sin(G.time*8+u.id)*2+wind*5;ctx.fillStyle=flash>.1?'#fff0b3':'#ffb044';ctx.beginPath();ctx.moveTo(x-8,y-73);ctx.quadraticCurveTo(x-6,y-73-hh,x,y-76-hh);ctx.quadraticCurveTo(x+10,y-74-hh*.5,x+7,y-73);ctx.closePath();ctx.fill();ctx.fillStyle='#ffdc87';ctx.fillRect(x-2,y-82,4,10);
  if(wind||flash){ctx.strokeStyle=`rgba(255,216,137,${wind*.5+flash*.5})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x,y-80,8+wind*5+flash*8,6+wind*3+flash*5,0,0,TAU);ctx.stroke();}
 }else if(u.key==='pmBarracks'){
  drawFacingBlock(x,y-14,46,23,7,1,'#6b443a','#382b2e','#986948');
  ctx.fillStyle='#a56341';ctx.strokeStyle='#422e2f';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-28,y-35);ctx.lineTo(x,y-62);ctx.lineTo(x+28,y-35);ctx.closePath();ctx.fill();ctx.stroke();for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x-20+i*12,y-36);ctx.lineTo(x-10+i*7,y-52);ctx.stroke();}
  ctx.fillStyle='#241d27';ctx.fillRect(x-8,y-23,16,23);ctx.strokeStyle='#a78451';ctx.lineWidth=2;ctx.strokeRect(x-9,y-24,18,24);ctx.fillStyle='#e1b665';ctx.fillRect(x+14,y-60,2,23);ctx.fillStyle='#a54836';ctx.beginPath();ctx.moveTo(x+16,y-59);ctx.lineTo(x+27,y-56+Math.sin(G.time*3+u.id)*2);ctx.lineTo(x+16,y-50);ctx.closePath();ctx.fill();
 }else{
  drawFacingBlock(x,y-19,26,30,6,1,'#67404b','#332637','#a06c68');ctx.fillStyle='#f09245';ctx.beginPath();ctx.ellipse(x,y-50,13,7,0,0,TAU);ctx.fill();ctx.strokeStyle='#e7b56d';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x,y-50,10,5,0,0,TAU);ctx.stroke();
  ctx.strokeStyle='#735947';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x,y-25);ctx.lineTo(x+24,y-10);ctx.stroke();ctx.strokeStyle='#b5885d';ctx.lineWidth=2;ctx.stroke();for(let i=0;i<3;i++){const f=(G.time*.45+i/3)%1;ctx.fillStyle='#ffbb65';ctx.beginPath();ctx.ellipse(x+f*24,y-25+f*15,2,1.5,0,0,TAU);ctx.fill();}
 }ctx.restore();
}
function drawPigGear(u,sk){
 if(!u.sp.pigArmy||u.sp.pigStructure)return;const role=u.sp.pigArmy,h=sk.head,p=sk.s2,dir=sk.dir,R=sk.P.headR;
 ctx.save();ctx.strokeStyle='#bd9a4a';ctx.lineWidth=2;
 if(['sporeback','medic','devourer'].includes(role)){ctx.fillStyle='#76516b';ctx.fillRect(p.x-sk.P.torsoW,p.y,sk.P.torsoW*2,sk.P.spine2);}
 if(role==='blaze'){const a=sk.armR;ctx.strokeStyle='#edaa35';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(a.ha.x-dir*4,a.ha.y+6);ctx.lineTo(a.ha.x+dir*9,a.ha.y-12);ctx.stroke();ctx.fillStyle='#ffe18b';ctx.fillRect(a.ha.x+dir*9-2,a.ha.y-15,4,6);}
 if(role==='seeker'){ctx.fillStyle='#6a4632';ctx.strokeStyle='#b19361';ctx.fillRect(p.x-dir*15-6,p.y,13,18);ctx.strokeRect(p.x-dir*15-6,p.y,13,18);ctx.fillStyle='#f5a44d';ctx.fillRect(p.x-dir*15,p.y-4,3,5);}
 if(role==='beast'){ctx.fillStyle='#d6c8a6';ctx.beginPath();ctx.moveTo(h.x-dir*R,h.y-R);ctx.lineTo(h.x+dir*R,h.y-R);ctx.lineTo(h.x+dir*R*1.3,h.y+R*.5);ctx.lineTo(h.x,h.y+R*.7);ctx.closePath();ctx.fill();ctx.strokeStyle='#d6c8a6';ctx.lineWidth=R*.2;ctx.beginPath();ctx.moveTo(h.x-dir*R,h.y-R);ctx.lineTo(h.x-dir*R*1.6,h.y-R*1.9);ctx.stroke();}
 if(role==='greatHog'){ctx.fillStyle='#dcb44a';ctx.beginPath();ctx.moveTo(h.x-R,h.y-R);ctx.lineTo(h.x-R,h.y-R*1.7);ctx.lineTo(h.x-R*.35,h.y-R*1.25);ctx.lineTo(h.x,h.y-R*2);ctx.lineTo(h.x+R*.35,h.y-R*1.25);ctx.lineTo(h.x+R,h.y-R*1.7);ctx.lineTo(h.x+R,h.y-R);ctx.closePath();ctx.fill();const a=sk.armL;ctx.strokeStyle='#795042';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(a.ha.x,a.ha.y+15);ctx.lineTo(a.ha.x,a.ha.y-28);ctx.stroke();ctx.fillStyle='#b169d0';ctx.beginPath();ctx.arc(a.ha.x,a.ha.y-31,5,0,TAU);ctx.fill();}
 if(role==='guard'){ctx.strokeStyle='#16191c';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(h.x-R*.5+i*R*.4,h.y-R);ctx.lineTo(h.x-R+i*R*.4,h.y-R*2.2);ctx.stroke();}}

 if(['brute','guard','beast','unbreakable','greatHog'].includes(role)){ctx.fillStyle='#4b3a37';ctx.fillRect(p.x-sk.P.torsoW,p.y,sk.P.torsoW*2,sk.P.spine2);ctx.strokeRect(p.x-sk.P.torsoW,p.y,sk.P.torsoW*2,sk.P.spine2);ctx.fillStyle='#cba34a';ctx.fillRect(h.x-R,h.y-R,R*2,R*.5);}
 if(role==='sporeback'||role==='medic'||role==='devourer'){for(let i=0;i<3;i++){ctx.fillStyle=i%2?'#9a638b':'#cf90b1';ctx.beginPath();ctx.ellipse(p.x-dir*(9+i*4),p.y+i*5,8+i*2,6+i,0,0,TAU);ctx.fill();}}
 if(role==='builder'){ctx.fillStyle='#c39a49';ctx.fillRect(h.x-R,h.y-R-3,R*2,5);}
 if(role==='clanger'){ctx.fillStyle='#d5a747';for(const a of [sk.armL,sk.armR]){ctx.beginPath();ctx.ellipse(a.ha.x,a.ha.y,9,3,dir*.5,0,TAU);ctx.fill();}}
 if(role==='guard'||role==='unbreakable'){const a=sk.armR;ctx.strokeStyle='#cbb37d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(a.ha.x,a.ha.y);ctx.lineTo(a.ha.x+dir*16,a.ha.y-4);ctx.stroke();ctx.fillStyle='#352e36';ctx.fillRect(a.ha.x+dir*16-6,a.ha.y-10,12,12);}
 if(role==='seer'){ctx.fillStyle='#633f73';ctx.beginPath();ctx.moveTo(h.x-R,h.y-R);ctx.lineTo(h.x,h.y-R*3);ctx.lineTo(h.x+R,h.y-R);ctx.closePath();ctx.fill();}
 ctx.restore();
}
function pmRolling(u){const a=u.atk;return u.sp.pigArmy==='pigmadillo'&&u.state==='attack'&&a&&a.t>=a.def.windup&&a.t<a.def.windup+a.def.active;}
function drawPigQuadGear(u){
 const role=u.sp.pigArmy;if(!['lava','pigmadillo'].includes(role))return;
 const x=u.x,y=u.y*SQ-(u.z||0),dir=renderFacing(u),a=u.atk,d=a?.def,t=a?.t||0,w=Math.max(.001,d?.windup||.5),wind=a&&t<w?Math.sin(t/w*Math.PI/2):0,kick=a&&t>=w?Math.exp(-(t-w)/.18):0;
 ctx.save();ctx.translate(x,y);ctx.scale(dir*u.sizeMul,u.sizeMul);
 if(role==='pigmadillo'){
  const rolling=pmRolling(u);
  ctx.save();ctx.translate(-3,-28+(u.moveSpd>4?Math.cos((u.gait||0)*2)*1.2:0));
  if(rolling){ctx.rotate((t-w)*15);ctx.fillStyle=visualMaterial('#655448',-43,-39,86,78);ctx.strokeStyle='#b4976b';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,43,39,0,0,TAU);ctx.fill();ctx.stroke();for(let i=0;i<8;i++){const aa=i*TAU/8;ctx.beginPath();ctx.moveTo(Math.cos(aa)*29,Math.sin(aa)*27);ctx.lineTo(Math.cos(aa)*41,Math.sin(aa)*37);ctx.stroke();}ctx.beginPath();ctx.ellipse(0,0,28,25,0,0,TAU);ctx.stroke();}
  else {ctx.rotate(-wind*.12);ctx.fillStyle=visualMaterial('#665448',-30,-24,60,35);ctx.strokeStyle='#b4976b';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,29,21,0,Math.PI,TAU);ctx.fill();ctx.stroke();for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-23+i*11,-2);ctx.lineTo(-20+i*10,-20);ctx.stroke();ctx.fillStyle='#bba273';ctx.beginPath();ctx.moveTo(-25+i*11,-16);ctx.lineTo(-23+i*11,-27);ctx.lineTo(-20+i*11,-16);ctx.fill();}}
  ctx.restore();
 }else {
  const bob=u.moveSpd>4?Math.cos((u.gait||0)*2)*1.1:0;ctx.translate(0,bob);
  drawFacingBlock(-2,-27,55,13,5,1,'#80536f','#49354c','#b17b94');drawFacingBlock(1,-40,42,26,6,1,'#3a3439','#24252a','#62585f');
  ctx.strokeStyle='#c48b47';ctx.lineWidth=2;ctx.strokeRect(-20,-66,42,26);for(let i=0;i<3;i++){ctx.fillStyle='#97754c';ctx.fillRect(-14+i*11,-61,5,15);}
  ctx.save();ctx.translate(15-kick*7,-54+wind*2);ctx.rotate(-wind*.1);drawFacingBlock(10,6,25,12,4,1,'#78513b','#3e3430','#b77b4e');ctx.fillStyle='#241c1c';ctx.fillRect(20,-5,4,12);ctx.fillStyle=`rgba(255,${Math.round(110+kick*110)},55,${.45+wind*.35+kick*.2})`;ctx.fillRect(20,-3,4,8);if(kick>.05){ctx.fillStyle=`rgba(255,207,106,${kick})`;ctx.beginPath();ctx.moveTo(24,-4);ctx.lineTo(24+kick*18,-8);ctx.lineTo(28,1);ctx.lineTo(24+kick*16,9);ctx.lineTo(24,6);ctx.fill();}ctx.restore();
  drawFacingBlock(-7,-67,13,13,3,1,'#ce947d','#965e52','#e4b19c');ctx.fillStyle='#927140';ctx.fillRect(-13,-68,13,9);ctx.fillStyle='#292424';ctx.fillRect(-3,-75,2,2);
 }
 ctx.restore();
}

function pmOnDamage(att,tgt,dmg,o){
 if(!att||!att.sp.pigArmy||o.pmTick||dmg<=0)return;
 if(att.sp.pigArmy==='sporeback')tgt.pmRootUntil=Math.max(tgt.pmRootUntil||0,G.time+3);
 if(['medic','devourer','blaze','lava','unbreakable'].includes(att.sp.pigArmy)||att.key==='pmBlazeTower'){
  tgt.pmDotUntil=G.time+3;tgt.pmDotOwner=att;tgt.pmDotNext=G.time+.5;
 }
}
