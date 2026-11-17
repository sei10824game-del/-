/* Six vanilla block types. Treating all hostile mobs as vibration sources and
 * spreading from ANY sculk block are explicit user-requested crossover rules. */
const SCULK_BLOCKS=['skBlock','skVein','skCatalyst','skSensor','skCalibrated','skShrieker'];
const SK_PAL={skin:'#092d32',skinD:'#061c25',skinL:'#237d80',cloth:'#092d32',clothD:'#061c25',clothL:'#1c5e65',acc:'#59e0cb',eye:'#65f5dc',blood:'#163e45'};
for(const [i,key] of SCULK_BLOCKS.entries())SP[key]={...SP.pfort,name:['スカルク','スカルクヴェイン','スカルクカタリスト','スカルクセンサー','調律されたスカルクセンサー','スカルクシュリーカー'][i],ic:'🌑',fac:'sk',ai:'sculk',head:'human',sculkBlock:1,infectionImmune:1,infectable:0,mortal:false,superArmor:0,r:key==='skVein'?5:10,scale:.65,hp:[55,25,130,65,75,100][i],walk:0,run:0,mass:20,pal:SK_PAL,atks:[],desc:'破壊可能なスカルク構造物。周囲の敵の死を経験値に見立て、隣接する床へ広がる（陣営化は本ゲーム用アレンジ）。'};
SP.skWarden={...SP.pbrute,name:'ウォーデン',ic:'🫀',fac:'sk',ai:'sculk',sculkWarden:1,head:'human',held:null,r:17,scale:2.4,hp:1000,mass:12,walk:42,run:100,infectionImmune:1,infectable:0,mortal:false,pal:SK_PAL,pp:{shoulder:8,torsoW:8,armU:13,armL:14,handL:4},fx:{claws:1,noEyes:1},atks:[AT({n:'両腕の殴打',type:'melee',dmg:60,reach:38,windup:.55,active:.18,rec:.7,cd:1.2,anim:'heavy',knock:280}),AT({n:'ソニックブーム',type:'proj',projKind:'laser',minR:0,maxR:420,dmg:40,windup:1.7,active:.15,rec:.7,cd:5,anim:'roar',exAction:'skSonic'})],desc:'目を持たず振動・近くの匂いで敵を追う。ソニックブームは壁を貫く。自然生成シュリーカーの警告で出現。'};
function skCell(x,y){return Math.floor(x/TILE)+','+Math.floor(y/TILE);}
function skAlive(u){return u&&!u.gone&&!u.dead;}
function skPlace(key,x,y,opts={}){
 const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);x=(tx+.5)*TILE;y=(ty+.5)*TILE;
 if(!walkAtPx(x,y)||G.units.some(u=>skAlive(u)&&u.sp.sculkBlock&&skCell(u.x,u.y)===skCell(x,y)))return null;
 const u=spawnUnit(key,x,y,{force:true});if(u){u.skNatural=!!opts.natural;u.skFrequency=opts.frequency||(key==='skCalibrated'?'movement':'any');u.skNext=0;if(G.stats.sk)G.stats.sk.born++;}return u;
}
function spawnSculk(){
 G.sculk={warnings:{},growth:0,events:0};if(!facOn('sk'))return;
 const room=spawnRoom(),x=(room.cx+.5)*TILE,y=(room.cy+.5)*TILE;
 const spots=[];for(let r=0;r<8;r++)for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++)if(Math.max(Math.abs(dx),Math.abs(dy))===r&&walkAtPx(x+dx*TILE,y+dy*TILE))spots.push({x:x+dx*TILE,y:y+dy*TILE});
 Array.from({length:4},()=>['skCatalyst','skBlock','skVein','skSensor','skCalibrated','skShrieker']).flat().forEach((k,i)=>{const p=spots[i];if(p)skPlace(k,p.x,p.y,{natural:k==='skShrieker'});});
}
function skOnDeath(v){
 if(!G.sculk||v.skDeathPaid||v.fac==='sk'||v.sp.pigStructure||v.sp.fivePassive)return;
 v.skDeathPaid=true;const roots=G.units.filter(u=>skAlive(u)&&u.sp.sculkBlock&&dist(u.x,u.y,v.x,v.y)<=8*TILE);
 if(!roots.length)return;
 roots.sort((a,b)=>dist(a.x,a.y,v.x,v.y)-dist(b.x,b.y,v.x,v.y));
 // One final death is paid once, regardless of the number of nearby blocks.
 const budget=v.sp.sculkXP??clamp(Math.ceil(v.mhp/100),1,12),occupied=new Set(G.units.filter(u=>skAlive(u)&&u.sp.sculkBlock).map(u=>skCell(u.x,u.y)));
 const queue=[roots[0]],seen=new Set();let spent=0;
 while(queue.length&&spent<budget){const p=queue.shift();for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
  const x=p.x+dx*TILE,y=p.y+dy*TILE,c=skCell(x,y);if(seen.has(c)||!walkAtPx(x,y))continue;seen.add(c);
  if(occupied.has(c)){queue.push({x,y});continue;}
  const roll=Math.random(),key=roll<.01?'skShrieker':roll<.02?'skSensor':roll<.22?'skVein':'skBlock';
  if(skPlace(key,x,y)){occupied.add(c);queue.push({x,y});spent++;G.sculk.growth++;}if(spent>=budget)break;
 }}G.sculk.events++;
}
function skWarn(shrieker,enemy){
 if(!skAlive(shrieker)||!skAlive(enemy)||shrieker.skNext>G.time)return false;
 shrieker.skNext=G.time+10;shrieker.skActive=G.time+4.5;
 if(!shrieker.skNatural)return true; // Growth-produced shriekers never summon.
 // Arena enemies frequently die before four warnings; preserve the colony's alert.
 const w=G.sculk.alert||(G.sculk.alert={level:0,next:0,decay:G.time+600});
 if(G.time>=w.next){w.level=Math.min(4,w.level+1);w.next=G.time+10;w.decay=G.time+600;G.sculk.warnings[enemy.id]=w;enemy.skDarkUntil=G.time+12;enemy.memSight={};if(w.level>=4)shrieker.skSummonAt=G.time+4.5;}
 return true;
}
function skTrySummon(s){
 if(!s.skNatural||!facOn('sk'))return;
 // No population limit: unlike vanilla, existing wardens do not suppress spawns.
 const p=exPoint(s.x+TILE,s.y)||exPoint(s.x,s.y);if(!p)return;
 const u=spawnUnit('skWarden',p.x,p.y,{force:true});if(u){u.skEmergeUntil=G.time+2;u.state='spawn';u.transDur=2;if(G.stats.sk)G.stats.sk.born++;}
}
function updateSculk(dt){
 if(!G.sculk)return;
 G.sculk.tick=(G.sculk.tick||0)-dt;if(G.sculk.tick>0)return;G.sculk.tick=.15;
 for(const w of new Set(Object.values(G.sculk.warnings))){if(G.time>=w.decay){w.level=Math.max(0,w.level-1);w.decay=G.time+600;}}
 const blocks=G.units.filter(u=>skAlive(u)&&u.sp.sculkBlock),enemies=G.units.filter(u=>skAlive(u)&&u.fac!=='sk'&&!u.sp.sculkBlock);
 for(const s of blocks){
  if(s.skSummonAt&&G.time>=s.skSummonAt){s.skSummonAt=0;skTrySummon(s);}
  if(s.skNext>G.time)continue;
  if(s.key==='skShrieker'){const t=enemies.find(t=>hostileTo(s,t)&&dist(s.x,s.y,t.x,t.y)<TILE);if(t)skWarn(s,t);continue;}
  if(s.key!=='skSensor'&&s.key!=='skCalibrated')continue;
  const radius=(s.key==='skCalibrated'?16:8)*TILE;
  const t=enemies.find(t=>hostileTo(s,t)&&dist(s.x,s.y,t.x,t.y)<=radius&&losWalk(s.x,s.y,t.x,t.y,1)&&((s.skFrequency==='attack')?t.state==='attack':s.skFrequency==='movement'?t.moveSpd>4:(t.moveSpd>4||t.state==='attack')));
  if(!t)continue;s.skNext=G.time+(s.key==='skCalibrated'?1:2);s.skActive=G.time+1;
  for(const sh of blocks)if(sh.key==='skShrieker'&&dist(sh.x,sh.y,s.x,s.y)<=8*TILE&&losWalk(sh.x,sh.y,s.x,s.y,1))skWarn(sh,t);
 }
}
function thinkSculk(u){
 if(u.sp.sculkBlock){u.dest=null;u.moveSpd=0;return;}
 let t=u.tgt;if(!skAlive(t)||!hostileTo(u,t))t=null;
 if(!t){let best=Infinity;for(const v of G.units){if(!skAlive(v)||!hostileTo(u,v))continue;const d=dist(u.x,u.y,v.x,v.y);if(d<best&&(d<100||((v.moveSpd>4||v.state==='attack')&&d<500))){best=d;t=v;}}}
 u.tgt=t;if(!t){if(!u.dest){const p=randWalkIn(G.map.rooms[roomOfUnit(u)]||G.map.rooms[0]);setDest(u,p.x,p.y);}return;}
 u.faceA=angTo(u.x,u.y,t.x,t.y);const d=chooseAttack(u,t);if(d){startAttack(u,d,t);return;}setDest(u,t.x,t.y);
}
function skFire(u,d,a){const t=a.tgt;if(!skAlive(t))return;dealDamage(u,t,d.dmg,{kdir:angTo(u.x,u.y,t.x,t.y),kpow:220});addShock(t.x,t.y,8,55,'rgba(100,245,230,.7)');}
function skBlockDestroyed(u){if(u.sp.sculkBlock&&u.skSummonAt){u.skSummonAt=0;skTrySummon(u);}}
function drawSculk(u){
 const x=u.x,y=u.y*SQ,active=u.skActive>G.time,z=u.key==='skCatalyst'?17:11,r=13;
 ctx.save();ctx.lineJoin='miter';
 if(u.key==='skVein'){
  ctx.strokeStyle='#082c36';ctx.lineWidth=5;for(let i=0;i<6;i++){const aa=i*TAU/6+.3,xx=x+Math.cos(aa)*14,yy=y+Math.sin(aa)*8;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx*.5+x*.5,yy*.5+y*.5-1);ctx.lineTo(xx,yy);ctx.stroke();ctx.strokeStyle='#2c9d9b';ctx.lineWidth=1.5;ctx.stroke();ctx.strokeStyle='#082c36';ctx.lineWidth=5;ctx.fillStyle='#75d1be';ctx.fillRect(xx-1,yy-1,2,1.5);}ctx.restore();return;
 }
 // Three voxel faces, with speckles clipped to the top rather than spilling off.
 ctx.fillStyle='#08252e';ctx.beginPath();ctx.moveTo(x-r,y-z);ctx.lineTo(x,y-z+r*.55);ctx.lineTo(x,y+r*.55);ctx.lineTo(x-r,y);ctx.closePath();ctx.fill();
 ctx.fillStyle='#061a25';ctx.beginPath();ctx.moveTo(x,y-z+r*.55);ctx.lineTo(x+r,y-z);ctx.lineTo(x+r,y);ctx.lineTo(x,y+r*.55);ctx.closePath();ctx.fill();
 ctx.save();ctx.beginPath();ctx.moveTo(x-r,y-z);ctx.lineTo(x,y-z-r*.55);ctx.lineTo(x+r,y-z);ctx.lineTo(x,y-z+r*.55);ctx.closePath();ctx.clip();ctx.fillStyle=active?'#247879':'#10434a';ctx.fillRect(x-r,y-z-r,r*2,r*2);
 for(let i=0;i<(G.quality==='low'?10:24);i++){const dx=((i*13+u.id*3)%27)-13,dy=((i*7+u.id)%15)-7;ctx.fillStyle=i%3===0?'#75d7c1':i%3===1?'#278d8e':'#092a35';ctx.fillRect(x+dx,y-z+dy,i%2?2:3,1.5);}ctx.restore();
 for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#21676e':'#0c3641';ctx.fillRect(x-r+2+i*4,y-z+5+(i%2)*3,2,3);}
 if(u.key==='skSensor'||u.key==='skCalibrated'){
  for(const off of [-7,-2,3,8]){const sway=Math.sin(G.time*(active?10:2)+off)* (active?3.4:.55),base=y-z+Math.abs(off)*.1;ctx.strokeStyle=off<0?'#34727c':active?'#9ce9db':'#4a9da1';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+off,base);ctx.quadraticCurveTo(x+off+sway,base-9,x+off+sway*1.4,base-20);ctx.stroke();ctx.strokeStyle=active?'#c5fff0':'#79b9b4';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+off+sway*1.4,base-20);ctx.lineTo(x+off+sway*1.4+2,base-23);ctx.stroke();}
  if(u.key==='skCalibrated'){for(const [dx,h] of [[-4,9],[0,16],[4,11]]){const yy=y-z-12;ctx.fillStyle='#7753a9';ctx.beginPath();ctx.moveTo(x+dx-3,yy);ctx.lineTo(x+dx-2,yy-h+3);ctx.lineTo(x+dx,yy-h);ctx.lineTo(x+dx+3,yy-2);ctx.closePath();ctx.fill();ctx.strokeStyle=active?'#e7d1ff':'#c09ade';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x+dx,yy-h);ctx.lineTo(x+dx,yy-1);ctx.lineTo(x+dx+3,yy-2);ctx.stroke();}}
 }
 if(u.key==='skShrieker'||u.key==='skCatalyst'){
  const shriek=u.key==='skShrieker';
  ctx.fillStyle=active?'#b2f5df':'#071c26';ctx.beginPath();ctx.ellipse(x,y-z,shriek?5:4,3,0,0,TAU);ctx.fill();
  for(const [dx,dy] of [[-8,-2],[6,-3],[-5,4],[8,3]]){drawFacingBlock(x+dx,y-z+dy,3.5,shriek?15:10,1.4,1,'#d6d6ae','#929c84','#ece8c8');ctx.fillStyle='#697e73';ctx.fillRect(x+dx-1.5,y-z+dy-5,1,3);}
  if(shriek&&active){const elapsed=Math.max(0,4.5-(u.skActive-G.time));ctx.save();for(let i=0;i<2;i++){const f=(elapsed*.9+i*.5)%1;ctx.globalAlpha=1-f;ctx.strokeStyle='#91ead9';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(x,y-z-5-f*16,8+f*20,3+f*9,0,0,TAU);ctx.stroke();}ctx.restore();}
 }
 ctx.restore();
}
function drawSculkWarden(u){
 const x=u.x,y=u.y*SQ-(u.z||0),dir=renderFacing(u),moving=u.moveSpd>4,gait=u.gait||0,walk=moving?Math.sin(gait)*7:0;
 const a=u.atk,d=a?.def,t=a?.t||0,w=Math.max(.001,d?.windup||.5),sonic=d?.exAction==='skSonic',wind=a&&t<w?Math.sin(t/w*Math.PI/2):0,hit=a&&t>=w?Math.exp(-(t-w)/.22):0,pulse=.55+.25*Math.sin(G.time*5+u.id)+wind*.2;
 // Local voxel faces retain a readable front/side/top instead of flat rectangles.
 const box=(bx,by,bw,bh,front,side='#071f27',top='#2d5554')=>{
  const depth=4;ctx.fillStyle=front;ctx.fillRect(bx,by,bw,bh);ctx.fillStyle=side;ctx.beginPath();ctx.moveTo(bx+bw,by);ctx.lineTo(bx+bw+depth,by-depth*.5);ctx.lineTo(bx+bw+depth,by+bh-depth*.5);ctx.lineTo(bx+bw,by+bh);ctx.closePath();ctx.fill();ctx.fillStyle=top;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+depth,by-depth*.5);ctx.lineTo(bx+bw+depth,by-depth*.5);ctx.lineTo(bx+bw,by);ctx.closePath();ctx.fill();
 };
 ctx.save();ctx.translate(x,y);ctx.scale(dir*(u.sizeMul||1),u.sizeMul||1);
 // Heavy, alternating footfalls. Body bounce is smaller and twice the gait rate.
 box(-17-walk*.35,-32-Math.max(0,walk)*.4,13,29,'#153b40');box(6+walk*.35,-32-Math.max(0,-walk)*.4,13,29,'#12353c');
 box(-19-walk*.35,-6-Math.max(0,walk)*.4,16,6,'#a9baa2','#788d7c','#c4d2b6');box(5+walk*.35,-6-Math.max(0,-walk)*.4,18,6,'#b4c4aa','#839681','#d2d9bd');
 ctx.translate(-wind*2+(!sonic?hit*4:0),moving?Math.cos(gait*2)*1.2:Math.sin(G.time*1.7+u.id)*.5);
 // Back arm swings opposite to the near arm; sonic braces both hands away from chest.
 for(const far of [true,false]){ctx.save();ctx.translate(far?-27:19,-70);ctx.rotate(sonic?(far?-.3:.35)*(wind+hit*.8):(far?walk*.025+wind*.35:-walk*.035+wind*.9-hit*1.65));box(far?-5:0,0,13,43,far?'#0d2a32':'#17454a');box(far?-7:-2,37,17,10,far?'#8ca78f':'#c7d1b0','#718575','#d5ddbd');ctx.restore();if(far){box(-18,-76,35,45,'#092d35');box(-20,-79,39,18,'#1b5153');}}
 // Asymmetric side-profile head, jaw, branching antennae (no invented eyes).
 box(-15,-99,32,22,'#0a2b32');box(8,-85,11,5,'#b5d4c5','#718a80','#c8e0cd');
 ctx.strokeStyle='#46b3b4';ctx.lineWidth=4;for(const side of [-1,1]){const sway=Math.sin(G.time*2.1+side+u.id)*1.2;ctx.beginPath();ctx.moveTo(side*12,-94);ctx.lineTo(side*24,-101);ctx.lineTo(side*27+sway,-113);ctx.stroke();ctx.strokeStyle='#97d5ca';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(side*23,-102);ctx.lineTo(side*32+sway,-106);ctx.stroke();ctx.strokeStyle='#46b3b4';ctx.lineWidth=4;}
 // Rib cage and heartbeat: stronger chest charge only for the sonic attack.
 const glow=ctx.createRadialGradient(0,-56,1,0,-56,18+wind*6);glow.addColorStop(0,`rgba(99,255,232,${pulse*.55})`);glow.addColorStop(1,'rgba(40,220,211,0)');ctx.fillStyle=glow;ctx.fillRect(-27,-83,54,54);
 ctx.strokeStyle='#a4c6b1';ctx.lineWidth=3;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-14,-69+i*7);ctx.lineTo(-4,-65+i*7);ctx.moveTo(4,-65+i*7);ctx.lineTo(14,-69+i*7);ctx.stroke();}ctx.fillStyle=`rgba(106,255,232,${clamp(pulse+(sonic?(wind+hit)*.3:0),0,1)})`;ctx.fillRect(-3,-65,7,20);
 if(sonic&&(wind>0||hit>.02)){const charge=wind+hit*.7;ctx.strokeStyle=`rgba(165,255,243,${Math.min(1,charge)*.7})`;ctx.lineWidth=1.2;for(let i=0;i<2;i++){ctx.beginPath();ctx.ellipse(2,-55,6+charge*(10+i*7)+hit*7,12+charge*(6+i*5)+hit*4,0,0,TAU);ctx.stroke();}}
 ctx.restore();
}

function sculkInspector(el,u){
 for(const [id,key] of [['skTune','skCalibrated'],['skOrigin','skShrieker']])if(u.key!==key)document.getElementById(id)?.remove();
 if(u.key==='skCalibrated'){
  let b=document.getElementById('skTune');if(!b){b=document.createElement('button');b.id='skTune';el.appendChild(b);}
  b.onclick=()=>{u.skFrequency=u.skFrequency==='attack'?'movement':'attack';updateInspector();};
  b.textContent='検知する振動：'+(u.skFrequency==='attack'?'攻撃':'移動')+'（切替）';
 }
 if(u.key==='skShrieker'){let info=document.getElementById('skOrigin');if(!info){info=document.createElement('div');info.id='skOrigin';el.appendChild(info);}info.textContent=u.skNatural?'自然生成／手動配置：警告 '+(G.sculk?.alert?.level||0)+'/4'+(u.skSummonAt?'（出現準備中）':'。警告は陣営内で共有、10秒ごとに加算'):'増殖生成：召喚しない';}
}

function skInit(u){if(!u.sp.sculkBlock)return;if(!G.sculk)G.sculk={warnings:{},growth:0,events:0};u.skNext=0;u.skFrequency=u.key==='skCalibrated'?'movement':'any';u.skNatural=u.key==='skShrieker';}
