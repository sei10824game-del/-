function drawMCGuardian(u, pose) { // 立方体の体、中央の大きな単眼、突き出す棘、尾びれ
  const pal = u.pal, sc = u.sp.scale * u.sizeMul, hf = u.fxT > 0, dir = renderFacing(u);
  const S = Math.max(8, (u.sp.r || 10) * sc * 1.0), x = u.x, y = u.y * SQ - u.z - S * .9 - Math.sin(G.time * 2 + (u.id || 0)) * S * .08;
  const spikesOut = u.state === 'attack' || u.hp < u.mhp * .98 ? 1 : .35;
  // 尾
  ctx.fillStyle = shade(pal.skin, -.1);
  const tw = Math.sin(G.time * 3 + (u.id || 0)) * S * .12;
  for (let i = 0; i < 3; i++) ctx.fillRect(x - dir * (S * .55 + i * S * .32) - S * .15, y - S * .15 + tw * i, S * .3, S * .3 - i * S * .06);
  ctx.fillStyle = pal.acc; ctx.fillRect(x - dir * (S * 1.55) - S * .15, y - S * .25 + tw * 3, S * .25, S * .5);
  // 棘
  ctx.fillStyle = '#e8d8b0';
  for (let i = 0; i < 8; i++) { // 角と各面の中央から突き出す棘
    const a = i * Math.PI / 4, c = i % 2 ? Math.SQRT2 : 1, L0 = S * .6 * c, L = L0 + S * (.08 + .32 * spikesOut);
    ctx.strokeStyle = '#e8d8b0'; ctx.lineWidth = S * .1;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * L0 * .9, y + Math.sin(a) * L0 * .9); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); ctx.stroke();
  }
  // 体
  drawFacingBlock(x,y+S*.6,S*1.2,S*1.2,S*.28,dir,hf?'#e0c0b0':pal.skin,shade(pal.skin,-.3),shade(pal.skin,.25));
  ctx.strokeStyle = shade(pal.skin, -.4); ctx.lineWidth = 1; ctx.strokeRect(x - S * .6, y - S * .6, S * 1.2, S * 1.2);
  ctx.fillStyle = shade(pal.skin, -.15); ctx.fillRect(x - S * .6, y + S * .35, S * 1.2, S * .25);
  ctx.fillStyle = pal.acc; ctx.fillRect(x - S * .6, y - S * .6, S * 1.2, S * .12);
  // 目
  const ex = x + dir * S * .65;
  ctx.fillStyle = '#f4ecd8'; ctx.fillRect(ex - S * .3, y - S * .22, S * .6, S * .44);
  const ad=u.atk?.def,at=u.atk?.t||0,charge=u.state==='attack'&&ad?clamp(at/Math.max(.001,ad.windup||.5),0,1):0;
  ctx.fillStyle = charge>.75 ? '#ff552b' : (pal.eye || '#e07040'); ctx.fillRect(ex + dir * S * .02 - S * .12, y - S * .16, S * .24, S * .32);
  ctx.fillStyle = '#141414'; ctx.fillRect(ex + dir * S * .08 - S * .05, y - S * .08, S * .1, S * .16);
  if(charge>0){ctx.strokeStyle=`rgba(255,173,80,${charge*.8})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(ex,y,S*(.22+charge*.2),S*(.3+charge*.15),0,0,TAU);ctx.stroke();}
  // Iris follows the target within the side-facing eye instead of a fixed stare.
  if(u.tgt&&!u.tgt.gone){const dy=clamp((u.tgt.y-u.y)/180,-1,1)*S*.09;ctx.fillStyle='#171c18';ctx.fillRect(ex+dir*S*.06-S*.045,y-S*.07+dy,S*.09,S*.14);}
}
function drawCbMachine(u){
 const shape=u.sp.cbShape,x=u.x,y=u.y*SQ-u.z,S=u.sp.scale*(shape==='core'?10:shape==='hunter'?20:shape==='strider'?16:shape==='crab'||shape==='turret'?18:shape==='manhack'?14:16)*(u.sizeMul||1),p=u.pal,clone=u.fac==='cc';
 const a=u.atk,d=a?.def,t=a?.t||0,w=Math.max(.001,d?.windup||.5),wind=a&&u.state==='attack'&&t<w?Math.sin(t/w*Math.PI/2):0,kick=a&&u.state==='attack'&&t>=w?Math.exp(-(t-w)/.13):0,dir=renderFacing(u),moving=u.moveSpd>4;
 ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
 if(u.atk&&u.state==='attack'){const f=actionPhase(u),hit=Math.sin(f*Math.PI);if(u.atk.def.type==='proj')ctx.translate(-renderFacing(u)*S*.22*hit,S*.06*hit);else if(u.atk.def.type==='melee')ctx.translate(renderFacing(u)*S*.4*hit,S*.1*hit);else ctx.translate(0,-S*.15*hit);}
 if(shape==='core'){
  drawFacingBlock(x,y,S*1.6,S*2.5,S*.3,renderFacing(u),'#334f5d','#172932','#597480');ctx.fillStyle=visualMaterial('#334f5d',x-S*.6,y-S*4,S*1.4,S*4);ctx.beginPath();ctx.moveTo(x-S*.6,y);ctx.lineTo(x-S*.4,y-S*3.5);ctx.lineTo(x+S*.3,y-S*4);ctx.lineTo(x+S*.8,y);ctx.fill();
  ctx.fillStyle='#74d9fa';for(let i=0;i<6;i++)ctx.fillRect(x-S*.2,y-S*(.6+i*.45),S*.16,S*.25);
  ctx.strokeStyle='#4b96b5';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y-S*.4,S*1.5,S*.5,0,0,TAU);ctx.stroke();ctx.fillStyle='#c0eaff';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('CITY 17 / CORE',x,y-S*4.3);
 }else if(shape==='strider'||shape==='hunter'||shape==='crab'){
  const tall=shape==='strider'?2.5:shape==='hunter'?1.3:.9,cy=y-S*tall+(moving?Math.cos((u.gait||0)*2)*S*.025:0),count=shape==='crab'?4:3,spread=shape==='strider'?1.55:1.1;
  // Lift only the swing foot; the opposing legs stay planted. Four-legged synths
  // use four distinct anchors rather than wrapping a fourth leg onto the first.
  for(let i=0;i<count;i++){
   const angle=i*TAU/count+.4,c=Math.cos(angle),phase=(u.gait||0)+i*TAU/count,stride=moving?Math.sin(phase)*S*.17:0,lift=moving?Math.max(0,Math.cos(phase))*S*.12:0;
   const hip={x:x+c*S*.35,y:cy+Math.sin(angle)*S*.12},knee={x:x+c*S*.95+stride*.45,y:cy+S*.55-lift*.35},foot={x:x+c*S*spread+stride,y:y+Math.sin(angle)*S*.16-lift};
   limb(hip,knee,S*.13,S*.085,p.skinD);limb(knee,foot,S*.085,S*.035,p.skin);blob(knee.x,knee.y,S*.105,S*.085,p.cloth,p.skinL);ctx.strokeStyle=p.acc;ctx.lineWidth=Math.max(.7,S*.025);ctx.beginPath();ctx.moveTo(foot.x-dir*S*.06,foot.y);ctx.lineTo(foot.x+dir*S*.12,foot.y);ctx.stroke();
  }
  blob(x,cy,S*.7,S*.45,p.cloth,p.skinL);
  ctx.strokeStyle=shade(p.cloth,-.4);ctx.lineWidth=S*.035;
  for(let i=0;i<5;i++){const xx=x+S*(-.45+i*.21);ctx.beginPath();ctx.moveTo(xx,cy-S*.32);ctx.lineTo(xx+dir*S*.08,cy);ctx.lineTo(xx-dir*S*.04,cy+S*.26);ctx.stroke();}
  // Pointed forward carapace and recessed optical housing distinguish the front.
  ctx.fillStyle=visualMaterial(p.skin,x-S*.5,cy-S*.6,S,S);ctx.beginPath();ctx.moveTo(x-dir*S*.4,cy-S*.32);ctx.lineTo(x+dir*S*.38,cy-S*.48);ctx.lineTo(x+dir*S*.8,cy-S*.04);ctx.lineTo(x+dir*S*.43,cy+S*.3);ctx.closePath();ctx.fill();ctx.stroke();
  blob(x+dir*S*.48,cy-S*.04,S*.19,S*.15,'#142731');blob(x+dir*S*.52,cy-S*.06,S*.11,S*.09,p.eye);
  const guns=shape==='hunter'?2:1;
  for(let i=0;i<guns;i++){
   const gy=cy+S*(.24+i*.19);ctx.strokeStyle='#1a2b34';ctx.lineWidth=S*(shape==='strider'?.15:.12);ctx.beginPath();ctx.moveTo(x,gy);ctx.lineTo(x+dir*S*(.76-kick*.14),gy+S*.12);ctx.stroke();
   if(wind||kick){ctx.strokeStyle=`rgba(150,225,255,${Math.min(1,wind*.65+kick)})`;ctx.lineWidth=1+kick*2;ctx.beginPath();ctx.arc(x+dir*S*.76,gy+S*.12,S*(.08+wind*.13+kick*.1),0,TAU);ctx.stroke();}
  }
 }else if(shape==='dropship'){
  const cy=y-S*1.3;blob(x,cy,S*1.5,S*.4,p.cloth,p.skinL);for(const side of [-1,1]){ctx.fillStyle=p.skinD;ctx.beginPath();ctx.moveTo(x,cy);ctx.lineTo(x+side*S*1.8,cy-S*.2);ctx.lineTo(x+side*S*.8,cy+S*.55);ctx.fill();}ctx.fillStyle='#263d49';ctx.fillRect(x-S*.65,cy+S*.25,S*1.3,S*.65);ctx.strokeStyle=p.acc;ctx.lineWidth=1.5;ctx.strokeRect(x-S*.65,cy+S*.25,S*1.3,S*.65);
 }else if(shape==='turret'){
  for(const off of [-.75,.65,.1]){ctx.strokeStyle=p.skinD;ctx.lineWidth=S*.1;ctx.beginPath();ctx.moveTo(x,y-S*.65);ctx.lineTo(x+S*off,y);ctx.stroke();ctx.strokeStyle=p.skinL;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+S*off-S*.1,y);ctx.lineTo(x+S*off+S*.14,y);ctx.stroke();}
  drawFacingBlock(x,y-S*.5,S*.56,S*1.5,S*.18,dir,p.cloth,p.skinD,p.skinL);
  ctx.save();ctx.translate(x,y-S*1.3);ctx.scale(dir,1);ctx.rotate(clamp(Math.atan2(Math.sin(u.faceA)*SQ,Math.abs(Math.cos(u.faceA))),-.6,.6));
  drawFacingBlock(S*.1-kick*S*.08,S*.12,S*.55,S*.32,S*.08,1,p.skin,p.skinD,p.skinL);ctx.fillStyle='#17232b';ctx.fillRect(S*.15-kick*S*.08,-S*.06,S*.8,S*.13);ctx.strokeStyle='#7a9eac';ctx.lineWidth=1;ctx.strokeRect(S*.15-kick*S*.08,-S*.06,S*.8,S*.13);
  if(kick>.04){ctx.fillStyle=`rgba(255,220,145,${kick})`;ctx.beginPath();ctx.moveTo(S*.95,-S*.08);ctx.lineTo(S*(.95+kick*.45),-S*.22*kick);ctx.lineTo(S*1.1,0);ctx.lineTo(S*(.95+kick*.4),S*.22*kick);ctx.lineTo(S*.95,S*.08);ctx.fill();}ctx.restore();
  blob(x+dir*S*.2,y-S*1.65,S*.13,S*.1,p.eye);ctx.fillStyle='#536f7b';for(let i=0;i<3;i++)ctx.fillRect(x-S*.15,y-S*(.7+i*.18),S*.3,S*.05);
 }else{
  const cy=y-(shape==='roller'?S*.3:S*(1.5+Math.sin(G.time*3+u.id)*.08));
  blob(x,cy,S*.65,S*(shape==='mortar'?.4:.55),p.cloth,p.skinL);
  if(shape==='manhack'){ctx.save();ctx.strokeStyle='rgba(157,188,205,.22)';ctx.lineWidth=S*.12;ctx.beginPath();ctx.ellipse(x,cy,S*1.15,S*.63,0,0,TAU);ctx.stroke();ctx.restore();ctx.strokeStyle=p.skin;ctx.lineWidth=1.5;for(let i=0;i<4;i++){const a=G.time*30+i*TAU/4;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*S*.3,cy+Math.sin(a)*S*.2);ctx.lineTo(x+Math.cos(a)*S*1.2,cy+Math.sin(a)*S*.65);ctx.stroke();}}
  if(shape==='roller'){ctx.strokeStyle='#6bb9ec';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,cy,S*.7,S*.4,G.time*2,0,TAU);ctx.stroke();}
  if(shape==='scanner'||shape==='shieldscanner'){
   drawFacingBlock(x,cy+S*.28,S*.95,S*.5,S*.2,dir,p.cloth,p.skinD,p.skinL);blob(x+dir*S*.52,cy,S*.21,S*.18,'#172a35');blob(x+dir*S*.56,cy,S*.13,S*.11,p.eye);ctx.strokeStyle=p.skinL;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x-dir*S*.25,cy-S*.2);ctx.lineTo(x-dir*S*.48,cy-S*.62);ctx.stroke();
   if(wind||kick){ctx.strokeStyle=`rgba(195,233,255,${wind*.4+kick*.6})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x+dir*S*.56,cy,S*(.22+wind*.15+kick*.3),0,TAU);ctx.stroke();}
  }
  if(shape==='roller'){ctx.save();ctx.translate(x,cy);ctx.rotate(moving?G.time*7*dir:0);ctx.strokeStyle='#273b49';ctx.lineWidth=S*.1;for(let i=0;i<3;i++){const aa=i*TAU/3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(aa)*S*.6,Math.sin(aa)*S*.4);ctx.stroke();}ctx.restore();}
  blob(x+renderFacing(u)*S*.35,cy,S*.18,S*.18,p.eye);if(shape==='mortar'){ctx.strokeStyle=p.skinD;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,cy);ctx.lineTo(x-renderFacing(u)*S*.6,cy-S*.7);ctx.stroke();}
 }
 if(clone){ctx.strokeStyle='#a2ff8c';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y-S*.2,S*.9,S*.25,0,0,TAU);ctx.stroke();}
 ctx.restore();
}
function drawMwUnit(u){
 const x=u.x,y=u.y*SQ-u.z,S=16*u.sp.scale*u.sizeMul,T=G.time,mut=u.key.startsWith('mutant'),d=renderFacing(u);
 ctx.save();ctx.translate(x,y);
 const f=actionPhase(u),pulseAttack=Math.sin(f*Math.PI);
 if(u.atk&&u.state==='attack'){if(u.key==='enderMite')ctx.translate(d*S*pulseAttack*.6,-S*pulseAttack*.3);else if(u.fac==='cp')ctx.scale(1+pulseAttack*.12,1-pulseAttack*.1);else if(u.atk.def.anim==='heavy')ctx.translate(d*S*pulseAttack*.2,S*pulseAttack*.35);else if(u.atk.def.exAction==='enderStrike')ctx.globalAlpha=.35+.65*Math.abs(Math.cos(f*TAU));}
 if(u.key==='enderMite'){
  for(let i=3;i>=0;i--){drawFacingBlock((i-1.5)*S*.5+S*.325,Math.sin(T*9+i)*S*.08,S*.65,S*.45,S*.12,d,i%2?'#5d397b':'#39244c','#271936','#9a66b5');ctx.fillStyle='#ac70d6';ctx.fillRect((i-1.5)*S*.5,-S*.5,S*.55,S*.1);}ctx.fillStyle='#eb94ff';ctx.fillRect(d*S*.8,-S*.36,S*.16,S*.12);
 }else if(u.fac==='em'){
  drawDirectionalEnder(u,S,T);
 }else{
  drawDirectionalCreeper(u,S,T);
 }ctx.restore();
}
function drawSirenHead(u, S, x, gy, T, strike, mv, ph, pal, dir) {
  const ad=u.atk?.def,at=u.atk?.t||0,aw=Math.max(.001,ad?.windup||.5),wind=u.state==='attack'&&at<aw?Math.sin(at/aw*Math.PI/2):0,impact=u.state==='attack'&&u.atk&&at>=aw?Math.exp(-(at-aw)/.23):0,sonic=ad?.anim==='roar',stomp=ad?.anim==='stomp';
  const H = S * 8.6, hidden = u.shDisguise, sw = mv ? Math.sin(ph * .9) : 0;
  const hipY = gy - H * .42, shY = gy - H * .82, sx = x + (hidden ? 0 : dir * S * .15);
  ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(x, gy, S * 1.6, S * .45, 0, 0, TAU); ctx.fill();
  if (!hidden) { ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(x + S * 3, gy + S * .4, S * 4, S * .4, .1, 0, TAU); ctx.fill(); }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const limb = (pts, w) => { ctx.strokeStyle = pal.skinD; ctx.lineWidth = w + 1; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); ctx.strokeStyle = visualMaterial(pal.skin,pts[0][0]-w,pts[0][1],w*2,Math.max(w,Math.abs(pts[pts.length-1][1]-pts[0][1]))); ctx.lineWidth = w; ctx.stroke(); };
  for (const sd of [-1, 1]) { // 細長い脚
    const s2 = hidden ? 0 : sw * sd, kx = x + sd * S * .25 + s2 * S * .9 + dir * S * .3, ky = gy - H * .22, fx = x + sd * S * .3 + s2 * S * 1.8, fy = gy - (mv ? Math.max(0, -s2) * S * .5 : 0)-(stomp&&sd===dir?wind*S*1.4:0);
    limb([[x + sd * S * .15, hipY], [kx, ky], [fx, fy]], S * .22);
  }
  // 痩せこけた胴 (肋骨が浮く)
  ctx.strokeStyle = pal.skinD; ctx.lineWidth = S * .5; ctx.beginPath(); ctx.moveTo(x, hipY); ctx.quadraticCurveTo(x - dir * S * .2, (hipY + shY) / 2, sx, shY); ctx.stroke();
  ctx.strokeStyle = visualMaterial(pal.skin,x-S*.3,shY,S*.6,hipY-shY); ctx.lineWidth = S * .42; ctx.stroke();
  ctx.strokeStyle = pal.skinD; ctx.lineWidth = .7; for (let i = 0; i < 6; i++) { const y = shY + (hipY - shY) * (.1 + i * .08); ctx.beginPath(); ctx.moveTo(x - S * .2, y); ctx.lineTo(x + S * .2, y + 2); ctx.stroke(); }
  // 長い腕: 擬態中は枝のように真上へ、攻撃時は振り下ろす
  for (const sd of [-1, 1]) {
    let ex, ey, hx2, hy2;
    if (hidden) { ex = sx + sd * S * .7; ey = shY - H * .1; hx2 = sx + sd * S * 1.2; hy2 = shY - H * .2; }
    else {
      const atk = sd===dir && u.state === 'attack'&&!sonic&&!stomp ? impact-wind*.28 : 0, hang = Math.sin(T * 1.3 + sd) * S * .2;
      ex = sx + sd * S * .5 + dir * S * atk * 1.5; ey = shY + H * .25 - atk * H * .1; hx2 = sx + sd * S * .4 + dir * S * (.6 + atk * 4.5) + hang; hy2 = shY + H * .56 - atk * H * .25;
    }
    limb([[sx + sd * S * .25, shY], [ex, ey], [hx2, hy2]], S * .17);
    ctx.strokeStyle = pal.skin; ctx.lineWidth = S * .06; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(hx2, hy2); ctx.lineTo(hx2 + k * S * .2 + (hidden ? 0 : dir * S * .1), hy2 + (hidden ? -S * .5 : S * .6)); ctx.stroke(); } // 長い指
  }
  // 首の支柱と2基のサイレン
  const nx = sx, ny = shY - H * .12, blast = G.shWaves && G.shWaves.some(w => w.id === u.id && w.t < 2.2);
  ctx.strokeStyle = '#5a5046'; ctx.lineWidth = S * .28; ctx.beginPath(); ctx.moveTo(sx, shY); ctx.lineTo(nx, ny); ctx.stroke();
  ctx.fillStyle = '#6a6a6a'; ctx.fillRect(nx - S * 1.1, ny - S * .12, S * 2.2, S * .24);
  for (const sd of [-1, 1]) {
    const cx = nx + sd * S * .95, cy = ny - S * .35 + (blast ? Math.sin(T * 60) * S * .04 : 0), vib = blast ? 1.08 : 1;
    ctx.fillStyle = visualMaterial('#8a8a8a',cx-S,cy-S*.7,S*2,S*1.4); ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = .8;
    ctx.beginPath(); ctx.moveTo(cx - sd * S * .15, cy - S * .35); ctx.lineTo(cx + sd * S * .75 * vib, cy - S * .7 * vib); ctx.lineTo(cx + sd * S * .75 * vib, cy + S * .7 * vib); ctx.lineTo(cx - sd * S * .15, cy + S * .35); ctx.closePath(); ctx.fill(); ctx.stroke(); // ホーン
    ctx.fillStyle = blast ? '#1a1410' : '#2a2622'; ctx.beginPath(); ctx.ellipse(cx + sd * S * .75 * vib, cy, S * .16, S * .66 * vib, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#555'; ctx.lineWidth = .5; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(cx + sd * S * .72 * vib, cy + k * S * .22); ctx.lineTo(cx + sd * S * .78 * vib, cy + k * S * .22); ctx.stroke(); }
    if (blast) { ctx.fillStyle = 'rgba(255,240,200,.25)'; ctx.beginPath(); ctx.ellipse(cx + sd * S * 1.2, cy, S * .6, S * .9, 0, 0, TAU); ctx.fill(); }
  }
  if(sonic&&(wind>0||impact>.02)){ctx.save();ctx.strokeStyle=`rgba(224,213,180,${Math.min(.65,wind*.35+impact*.5)})`;ctx.lineWidth=1;for(const sd of [-1,1])for(let i=0;i<2;i++){const radius=S*(.8+i*.35+impact*.9);ctx.beginPath();ctx.ellipse(nx+sd*S*(1.7+i*.5+impact),ny-S*.35,radius*.25,radius*.7,0,-Math.PI*.7,Math.PI*.7);ctx.stroke();}ctx.restore();}
  return true;
}
function drawHubPlan(u, S, x, gy, T) {
  const y = gy;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, y, S * 1.4, S * .45, 0, 0, TAU); ctx.fill();
  drawFacingBlock(x,y-S*.1,S*2,S*1.2,S*.3,renderFacing(u),u.hubHyper?'#c8a040':'#3a5a8a','#24344e','#b4a98d');
  ctx.fillStyle = '#e8d8b0'; ctx.fillRect(x - S * 1.1, y - S * 1.45, S * 2.2, S * .2);
  ctx.strokeStyle = '#c8a040'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - S * .9, y - S * 1.45); ctx.lineTo(x - S * .9, y - S * 2.4); ctx.moveTo(x + S * .9, y - S * 1.45); ctx.lineTo(x + S * .9, y - S * 2.4); ctx.moveTo(x - S * .9, y - S * 2.4); ctx.quadraticCurveTo(x, y - S * 2.9, x + S * .9, y - S * 2.4); ctx.stroke();
  for (let i = 0; i < 3; i++) { ctx.fillStyle = ['#6a3a2a', '#2a4a6a', '#8a2a2a'][i]; ctx.fillRect(x - S * .8 + i * S * .55, y - S * (2 - i * .1), S * .45, S * .55); }
  ctx.fillStyle = '#e8c040'; ctx.beginPath(); ctx.arc(x + S * 1.2, y - S * .9, S * .22, Math.PI, TAU); ctx.fill(); ctx.fillRect(x + S * 1.2 - S * .28, y - S * .9, S * .56, S * .08); // 呼び鈴
}
function drawExShape(u){
 const x=u.x,y=u.y*SQ-u.z,S=18*u.sp.scale*u.sizeMul,T=G.time,dir=renderFacing(u),a=u.atk,d=a?.def,t=a?.t||0,w=Math.max(.001,d?.windup||.5),wind=a&&u.state==='attack'&&t<w?Math.sin(t/w*Math.PI/2):0,hit=a&&u.state==='attack'&&t>=w?Math.exp(-(t-w)/.22):0;
 ctx.save();ctx.lineCap='round';
 if(u.sp.exShape==='tendril'){
  const sc=u.sizeMul,grow=clamp(u.age*2,0,1),L=85*sc*grow,sw=(Math.sin(T*3+u.id)*10-dir*wind*26+dir*hit*64)*sc;
  const p0={x,y},p1={x:x-dir*wind*20*sc,y:y-L*.35},p2={x:x+sw,y:y-L*(.8-wind*.12)},p3={x:x+sw+dir*22*sc,y:y-L+hit*L*.22};
  let prev=p0;
  // Tapered cubic sections, rather than a constant-width hose with a red dot.
  for(let i=1;i<=16;i++){const f=i/16,q=1-f,pt={x:q*q*q*p0.x+3*q*q*f*p1.x+3*q*f*f*p2.x+f*f*f*p3.x,y:q*q*q*p0.y+3*q*q*f*p1.y+3*q*f*f*p2.y+f*f*f*p3.y};limb(prev,pt,(7*(1-(i-1)/16)+.7)*sc,(7*(1-f)+.7)*sc,i%3===0?'#203445':'#101d2a');if(i%2===0){ctx.strokeStyle='#567082';ctx.lineWidth=.8*sc;ctx.beginPath();ctx.moveTo(pt.x-2.4*sc,pt.y);ctx.lineTo(pt.x+2.4*sc,pt.y+1.5*sc);ctx.stroke();}prev=pt;}
  ctx.fillStyle='#d43358';ctx.beginPath();ctx.arc(p3.x,p3.y,2*sc,0,TAU);ctx.fill();
 }else{
  const adult=u.key==='typhoonAdult',count=adult?10:6,cy=y-S*1.6;
  ctx.translate(dir*S*(hit*.08-wind*.05),hit*S*.08);if(d?.exAction==='stormPull')ctx.scale(1-wind*.1,1+wind*.07);
  // Back half of the funnel, then the face, then front ribbons. No flat stack
  // of complete rings drawn over every facial feature.
  const ribbon=(i,front)=>{const f=i/count,yy=y-S*f*2,rx=S*(1.4-f*.8),phase=T*(3+hit*2)+i*.7,xx=x+Math.sin(phase)*S*.1;ctx.strokeStyle=front?'rgba(166,194,207,.7)':'rgba(57,91,115,.4)';ctx.lineWidth=S*(front?.095:.16);ctx.beginPath();ctx.ellipse(xx,yy,rx,S*.21,Math.sin(phase)*.08,front?0:Math.PI,front?Math.PI:TAU);ctx.stroke();};
  for(let i=0;i<count;i++)ribbon(i,false);
  blob(x,cy,S*.55,S*.65,'#bcac9c','#dfd3c5');
  ctx.fillStyle='#b0a08f';ctx.beginPath();ctx.moveTo(x+dir*S*.35,cy-S*.25);ctx.lineTo(x+dir*S*.7,cy+S*.05);ctx.lineTo(x+dir*S*.41,cy+S*.15);ctx.closePath();ctx.fill();
  ctx.fillStyle='#243f48';ctx.beginPath();ctx.ellipse(x+dir*S*.26,cy-S*.14,S*.095,S*.1,0,0,TAU);ctx.fill();ctx.strokeStyle='#776e64';ctx.lineWidth=S*.06;ctx.beginPath();ctx.moveTo(x+dir*S*.1,cy-S*.3);ctx.lineTo(x+dir*S*.43,cy-S*.25);ctx.stroke();
  ctx.fillStyle='#243f48';ctx.beginPath();ctx.ellipse(x+dir*S*.33,cy+S*.29,S*.13,S*(.13+wind*.14+hit*.08),-.15*dir,0,TAU);ctx.fill();
  for(let i=0;i<count;i++)ribbon(i,true);
  // Dust and rubble follow the same deterministic vortex phase; no new objects.
  for(let i=0;i<(adult?8:4);i++){const aa=T*(adult?1.7:2)+i*TAU/(adult?8:4),rr=S*(adult?1.6:1.1);ctx.fillStyle=adult?'#71685b':'rgba(151,156,144,.5)';ctx.save();ctx.translate(x+Math.cos(aa)*rr,y-S*.8+Math.sin(aa)*S*.5);ctx.rotate(aa);ctx.fillRect(-S*.1,-S*.07,S*.2,S*.14);ctx.restore();}
 }ctx.restore();
}
