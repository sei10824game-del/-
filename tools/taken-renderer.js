/* Articulated, facing-aware Taken silhouettes; no front-facing generic faces. */
// Render-only timing: never advances attack clocks or modifies combat state.
function tkVisualBeat(u){
 const a=u.atk;if(!a||u.state!=='attack')return {wind:0,strike:0,flash:0};
 const d=a.def,t=a.t,w=Math.max(.001,d.windup||0),active=Math.max(.001,d.active||.1),r=Math.max(.001,d.rec||.3);
 return {wind:t<w?Math.sin(clamp(t/w,0,1)*Math.PI/2):0,strike:t>=w?Math.exp(-Math.max(0,t-w)/Math.max(.08,active+r*.35)):0,flash:t>=w&&t<w+active?Math.sin((t-w)/active*Math.PI):0};
}
function tkFlames(u,x,y,r,color='#a5d9ff'){
 ctx.save();const count=G.quality==='low'?3:6,seed=u.id||0;
 for(let i=0;i<count;i++){
  const a=i*2.399+seed,dx=Math.cos(a)*r,ph=G.time*3.6+i+seed*.17,base=y+Math.sin(a)*r*.25,tip=base-r*(.6+.3*Math.sin(ph*.7)),sway=Math.sin(ph)*r*.22;
  ctx.globalAlpha*=.22+.1*Math.sin(ph);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x+dx-r*.09,base);ctx.quadraticCurveTo(x+dx+sway-r*.2,base-r*.45,x+dx+sway,tip);ctx.quadraticCurveTo(x+dx+sway+r*.08,base-r*.35,x+dx+r*.09,base);ctx.fill();ctx.globalAlpha/=(.22+.1*Math.sin(ph));
 }
 ctx.strokeStyle='#e0f5ff';ctx.globalAlpha*=.38;ctx.lineWidth=.75;ctx.beginPath();ctx.moveTo(x-r*.5,y);ctx.quadraticCurveTo(x-r*.8,y-r*.3,x-r*.3+Math.sin(G.time*2+seed)*3,y-r*.7);ctx.stroke();ctx.restore();
}
function drawTaken(u,pose){
 const role=u.sp.tkRole,dir=renderFacing(u),x=u.x,y=u.y*SQ-(u.z||0),beat=tkVisualBeat(u);ctx.save();
 if(takenHidden(u))ctx.globalAlpha*=.24;
 if(role==='Axion'||role==='Eye'){
  const r=role==='Axion'?6:12,cy=y-(role==='Axion'?22:28)+Math.sin(G.time*2.8+u.id)*2.5;tkFlames(u,x,cy,r*1.7);
  ctx.strokeStyle='#708cba';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,cy,r*1.45,r*.75,Math.sin(G.time*1.7+u.id)*.5,0,TAU);ctx.stroke();
  ctx.fillStyle='#060712';ctx.strokeStyle='#9ecbff';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,cy,r,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#f5fcff';ctx.beginPath();ctx.ellipse(x+Math.cos(u.faceA||0)*r*.25,cy+Math.sin(u.faceA||0)*r*.12,r*.38,r*.22,0,0,TAU);ctx.fill();
  if(beat.wind||beat.flash){ctx.strokeStyle='#e2f7ff';ctx.globalAlpha*=.5+beat.flash*.5;ctx.beginPath();ctx.arc(x+dir*r*.3,cy,r*(.5+beat.wind*.7+beat.flash),0,TAU);ctx.stroke();}
  if(role==='Eye'){ctx.strokeStyle='#8793c1';for(let i=0;i<4;i++){const a=i*TAU/4;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r,cy+Math.sin(a)*r);ctx.lineTo(x+Math.cos(a)*(r+7),cy+Math.sin(a)*(r+5));ctx.stroke();}}ctx.restore();return;
 }
 if(role==='Shadowbeast'){
  const scale=u.sp.scale*(u.sizeMul||1),moving=u.moveSpd>3,gait=u.gait||0,bob=moving?Math.cos(gait*2)*1.7:Math.sin(G.time*2+u.id)*.6;
  ctx.translate(x,y);ctx.scale(dir*scale,scale);ctx.translate(-beat.wind*5+beat.strike*10,bob+beat.wind*3-beat.strike*2);
  ctx.fillStyle='#080b13';ctx.strokeStyle='#7286a4';ctx.lineWidth=1;
  // Rear legs first, alternating planted paws and lifted toes, then the torso.
  const leg=(lx,phase,far)=>{const c=moving?Math.sin(gait+phase):0,swing=c*7,lift=moving?Math.max(0,Math.cos(gait+phase))*5:0,hip={x:lx,y:-17},knee={x:lx-4+swing*.45,y:-8-lift*.4},paw={x:lx+swing+3,y:-lift};limb(hip,knee,far?2:3,2,far?'#12192a':'#263047');limb(knee,paw,2,1.3,'#111725');ctx.strokeStyle=far?'#8198b3':'#daefff';ctx.lineWidth=1.1;for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(paw.x+k*1.6,paw.y);ctx.lineTo(paw.x+k*1.6+3,paw.y+1);ctx.stroke();}};
  leg(-16,Math.PI,true);leg(16,0,true);
  const g=ctx.createLinearGradient(0,-33,0,-9);g.addColorStop(0,'#303a50');g.addColorStop(.35,'#0a0d19');g.addColorStop(1,'#03060d');ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(-24,-17);ctx.lineTo(-18,-29);ctx.lineTo(-5,-34);ctx.lineTo(14,-30);ctx.lineTo(25,-20);ctx.lineTo(18,-10);ctx.lineTo(-20,-10);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#c4e6f9';ctx.lineWidth=.8;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-11+i*6,-29);ctx.lineTo(-8+i*6,-24);ctx.lineTo(-10+i*6,-18);ctx.stroke();}
  leg(-13,0,false);leg(19,Math.PI,false);
  ctx.save();ctx.translate(18,-24-beat.strike*2);ctx.rotate(-beat.wind*.18+beat.strike*.12);
  ctx.fillStyle='#0b101d';ctx.strokeStyle='#8c9cb8';ctx.beginPath();ctx.moveTo(-4,-3);ctx.lineTo(7,-8);ctx.lineTo(16,-4);ctx.lineTo(23,5);ctx.lineTo(9,8);ctx.lineTo(-2,4);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#e9f9ff';ctx.fillRect(10,-3,5,2);ctx.beginPath();ctx.moveTo(1,-6);ctx.lineTo(-1,-14);ctx.lineTo(6,-8);ctx.fill();
  const jaw=2+beat.wind*7+beat.strike*1.5;ctx.save();ctx.translate(5,6);ctx.rotate(jaw*.035);ctx.fillStyle='#080d17';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(17,0);ctx.lineTo(13,4);ctx.lineTo(0,3);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#e7faff';for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(5+i*4,0);ctx.lineTo(6+i*4,-3);ctx.lineTo(8+i*4,0);ctx.fill();}ctx.restore();ctx.restore();
  tkFlames(u,0,-24,24);ctx.restore();return;
 }
 if(role==='Wizard')ctx.translate(0,Math.sin(G.time*2+u.id)*3.5-beat.wind*3);
 const sk=solveBiped(u,pose),P=sk.P,heavy=['Knight','Ogre','Minotaur','Phalanx','Centurion'].includes(role),vex=['Goblin','Hobgoblin','Minotaur'].includes(role),thrall=role==='Thrall'||role==='ShadowThrall';
 const color=u.fxT>0?'#b2c5df':'#0b0e19',edge='#5d6b86',h=sk.head,R=P.headR;
 const limbDraw=(a,b,r1,r2)=>{limb(a,b,r1,r2,color);ctx.strokeStyle=edge;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();};
 tkFlames(u,sk.s2.x,sk.s2.y,P.torsoW*2.5);
 for(const [arm,far] of [[sk.armL,true],[sk.armR,false]]){
  limbDraw(arm.sh,arm.el,P.armR*(heavy?1.7:1),P.armR);limbDraw(arm.el,arm.ha,P.armR,P.armR*.7);
  if(thrall){const a=Math.atan2(arm.ha.y-arm.el.y,arm.ha.x-arm.el.x);clawsAt(arm.ha.x,arm.ha.y,a,3,P.handL*2.8,'#dbf2ff');}
  if(role==='Captain'||role==='Vandal'){
   const a={x:arm.sh.x,y:arm.sh.y+P.armU*.7},b={x:arm.el.x+dir*(far?-12:12),y:arm.el.y+P.armU*.5},c={x:arm.ha.x+dir*(far?-15:17),y:arm.ha.y+P.armU*.35};limbDraw(a,b,P.armR*.8,P.armR*.65);limbDraw(b,c,P.armR*.65,P.armR*.5);ctx.fillStyle='#d4e9f5';ctx.fillRect(c.x-1,c.y-1,3,3);
  }
 }
 if(role==='Wizard'){
  ctx.fillStyle='#080b17';ctx.strokeStyle=edge;ctx.beginPath();ctx.moveTo(sk.s2.x-P.shoulder,sk.s2.y);ctx.lineTo(sk.s2.x+P.shoulder,sk.s2.y);ctx.lineTo(sk.pel.x+P.torsoW*1.7,sk.pel.y+P.legU);ctx.lineTo(sk.pel.x,sk.pel.y+P.legU*.75);ctx.lineTo(sk.pel.x-P.torsoW*1.7,sk.pel.y+P.legU*1.1);ctx.closePath();ctx.fill();ctx.stroke();
 }else{
  for(const leg of [sk.legL,sk.legR]){limbDraw(leg.hip,leg.kn,P.legR*(heavy?1.4:1),P.legR);limbDraw(leg.kn,leg.an,P.legR,P.legR*.7);ctx.strokeStyle='#dcefff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(leg.an.x,leg.an.y);ctx.lineTo(leg.an.x+dir*P.footL,leg.an.y);ctx.stroke();}
 }
 limb(sk.pel,sk.s2,P.hipW*(heavy?1.3:1),P.torsoW*(heavy?1.45:1),color);
 ctx.strokeStyle=edge;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(sk.pel.x-P.hipW,sk.pel.y);ctx.lineTo(sk.s2.x-P.torsoW,sk.s2.y);ctx.moveTo(sk.pel.x+P.hipW,sk.pel.y);ctx.lineTo(sk.s2.x+P.torsoW,sk.s2.y);ctx.stroke();
 // Broken armor, ribs, joints and icy fissures are articulated with the skeleton.
 for(const [side,arm] of [[-1,sk.armL],[1,sk.armR]]){
  const sx=sk.s2.x+side*P.shoulder,sy=sk.s2.y;
  if(heavy||vex||role==='Captain'){
   ctx.fillStyle='#171e2f';ctx.strokeStyle='#7186a2';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(sx-side*P.armR,sy-4);ctx.lineTo(sx+side*P.armR*2.5,sy-2);ctx.lineTo(sx+side*P.armR*2,sy+P.armU*.55);ctx.lineTo(sx,sy+P.armU*.4);ctx.closePath();ctx.fill();ctx.stroke();
  }
  ctx.strokeStyle='#adc5dc';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(arm.el.x-2,arm.el.y);ctx.lineTo(arm.el.x+2,arm.el.y);ctx.stroke();
 }
 ctx.strokeStyle=vex?'#87a4c7':'#72829a';ctx.lineWidth=.9;
 for(let i=0;i<4;i++){const f=(i+1)/5,cx=sk.s2.x+(sk.pel.x-sk.s2.x)*f,cy=sk.s2.y+(sk.pel.y-sk.s2.y)*f,rr=P.torsoW*(1-f*.35);ctx.beginPath();ctx.moveTo(cx-rr*.8,cy-2);ctx.lineTo(cx,cy+1);ctx.lineTo(cx+rr*.8,cy-2);ctx.stroke();}
 ctx.strokeStyle='#c2e7ff';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(sk.s2.x+dir*3,sk.s2.y+2);ctx.lineTo(sk.s1.x+dir*P.torsoW*.45,sk.s1.y-3);ctx.lineTo(sk.s1.x,sk.s1.y+2);ctx.lineTo(sk.pel.x+dir*P.hipW*.3,sk.pel.y-3);ctx.stroke();
 if(role==='Psion'){ctx.strokeStyle='#abc4de';ctx.beginPath();ctx.arc(h.x,h.y,P.headR*1.25,Math.PI*.8,Math.PI*1.9);ctx.stroke();}
 ctx.fillStyle='#e2f1ff';ctx.fillRect(sk.s1.x+dir*P.torsoW*.1,sk.s1.y-3,Math.max(2,P.torsoW*.5),5);
 ctx.save();ctx.translate(h.x,h.y);ctx.scale(dir,1);ctx.fillStyle=color;ctx.strokeStyle=edge;ctx.lineWidth=.9;
 ctx.beginPath();ctx.moveTo(-R,-R*.6);ctx.lineTo(-R*.8,-R*1.2);ctx.lineTo(R*.6,-R*(vex?1.3:.95));ctx.lineTo(R*(thrall?1.4:1.05),R*.12);ctx.lineTo(R*.7,R*.65);ctx.lineTo(-R*.7,R*.65);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle='#f1fbff';ctx.beginPath();ctx.ellipse(R*.52,-R*.13,R*(role==='Psion'?.32:.22),R*.13,0,0,TAU);ctx.fill();
 if(vex){ctx.strokeStyle='#bddef5';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-R*.6,-R);ctx.lineTo(-R*1.6,-R*2);ctx.lineTo(R*.1,-R*1.5);ctx.lineTo(R*.6,-R*2.4);ctx.stroke();}
 if(role==='Knight'||role==='Wizard'){ctx.strokeStyle='#b1c8e4';ctx.lineWidth=2;for(const off of [-.8,.2]){ctx.beginPath();ctx.moveTo(R*off,-R*.8);ctx.lineTo(R*(off-.3),-R*1.9);ctx.stroke();}}
 if(role==='Ogre'){if(beat.wind||beat.flash){ctx.strokeStyle='#a7deff';ctx.lineWidth=1+beat.flash*2;ctx.beginPath();ctx.arc(R*.7,R*.1,R*(.6+beat.wind*.7+beat.flash*.5),0,TAU);ctx.stroke();}ctx.fillStyle='#d3ddf2';ctx.beginPath();ctx.ellipse(R*.4,R*.1,R*.65,R*.26,0,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(R*.7,R*.1,R*.24,0,TAU);ctx.fill();}
 ctx.restore();
 if(role==='Captain'&&u.atk?.def.anim==='tkCrossSlash'){for(const arm of [sk.armL,sk.armR]){const a=Math.atan2(arm.ha.y-arm.el.y,arm.ha.x-arm.el.x),end={x:arm.ha.x+Math.cos(a)*26,y:arm.ha.y+Math.sin(a)*26};ctx.strokeStyle='#63caff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(arm.ha.x,arm.ha.y);ctx.lineTo(end.x,end.y);ctx.stroke();ctx.strokeStyle='#effbff';ctx.lineWidth=1.5;ctx.stroke();}}
 if(!thrall&&role!=='Wizard'&&role!=='Ogre'&&u.atk?.def.type!=='melee'){
  const a=sk.armR.ha;ctx.save();ctx.translate(a.x,a.y);ctx.rotate(u.faceA===undefined?0:Math.atan2(Math.sin(u.faceA)*SQ,Math.cos(u.faceA)));ctx.fillStyle='#141a29';ctx.strokeStyle='#b9d5ed';ctx.lineWidth=1;const len=role==='Hobgoblin'||role==='Vandal'?25:16;ctx.beginPath();ctx.moveTo(-5,-4);ctx.lineTo(5,-5);ctx.lineTo(8,-2);ctx.lineTo(len,-2);ctx.lineTo(len,2);ctx.lineTo(4,3);ctx.lineTo(1,7);ctx.lineTo(-3,6);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#e3efff';ctx.fillRect(len-3,-1,3,2);if(beat.flash>0&&['shot','howler','surge'].includes(u.atk?.def.tkPower)){ctx.fillStyle='#e6f8ff';ctx.beginPath();ctx.moveTo(len,-2);ctx.lineTo(len+10*beat.flash,-5*beat.flash);ctx.lineTo(len+5*beat.flash,0);ctx.lineTo(len+10*beat.flash,5*beat.flash);ctx.lineTo(len,2);ctx.fill();}ctx.restore();
 }
 if(role==='Phalanx'){
  const a=sk.armL.ha;ctx.fillStyle='#101625';ctx.strokeStyle='#b3dbf0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x-dir*8,a.y-P.armU*1.2);ctx.lineTo(a.x+dir*15,a.y-P.armU*.9);ctx.lineTo(a.x+dir*18,a.y+P.armU);ctx.lineTo(a.x-dir*7,a.y+P.armU*1.2);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#e8f8ff';ctx.beginPath();ctx.arc(a.x+dir*4,a.y,3,0,TAU);ctx.fill();
 }
 if(role==='Centurion'){ctx.strokeStyle='#8cadd2';ctx.lineWidth=3;for(const off of [-1,1]){ctx.beginPath();ctx.moveTo(sk.s2.x+off*P.shoulder,sk.s2.y);ctx.lineTo(sk.s2.x+off*P.shoulder*1.8,sk.s2.y-10);ctx.lineTo(sk.s2.x+off*P.shoulder*1.8,sk.s2.y+12);ctx.stroke();}}
 if((u.tkShield??u.sp.tkAbsorb)>0){ctx.strokeStyle=role==='Captain'?'#eab16b':role==='Wizard'?'#aa92ed':'#9beaff';ctx.globalAlpha*=.4;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(sk.s1.x,sk.s1.y,P.shoulder*2.2,(sk.pel.y-h.y)*.7,0,0,TAU);ctx.stroke();}
 ctx.restore();
}
function drawTakenEffects(){
 const w=G.taken;if(!w)return;ctx.save();
 for(const f of w.fields){
  const x=f.x,y=f.y*SQ,fade=clamp((f.until-G.time)/.5,0,1);ctx.save();ctx.globalAlpha*=fade;
  if(f.kind==='bubble'){
   const g=ctx.createRadialGradient(x-f.r*.3,y-f.r*.6,2,x,y-20,f.r);g.addColorStop(0,'rgba(190,222,255,.04)');g.addColorStop(.8,'rgba(131,170,230,.10)');g.addColorStop(1,'rgba(187,216,255,.34)');ctx.fillStyle=g;ctx.strokeStyle='#a9ccef';ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(x,y-20,f.r,f.r*.9,0,0,TAU);ctx.fill();ctx.stroke();
   ctx.globalAlpha*=.5;ctx.beginPath();ctx.ellipse(x,y,f.r,f.r*SQ,0,0,TAU);ctx.stroke();ctx.beginPath();ctx.ellipse(x,y-20,f.r*.35,f.r*.9,0,0,TAU);ctx.stroke();ctx.strokeStyle='#e2f4ff';ctx.beginPath();ctx.ellipse(x,y-20,f.r-3,f.r*.9-3,0,Math.PI*1.1,Math.PI*1.65);ctx.stroke();
  }else{
   ctx.fillStyle=f.kind==='stasis'?'rgba(104,142,223,.18)':'rgba(247,127,48,.16)';ctx.beginPath();ctx.ellipse(x,y,f.r,f.r*SQ,0,0,TAU);ctx.fill();
   if(f.kind==='stasis'){for(let i=0;i<7;i++){const a=i*2.399,rr=f.r*(.3+(i%3)*.23),cx=x+Math.cos(a)*rr,cy=y+Math.sin(a)*rr*SQ,h=9+(i%3)*5;ctx.fillStyle=i%2?'#496caa':'#799ad1';ctx.strokeStyle='#c3e3ff';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(cx-4,cy);ctx.lineTo(cx-2,cy-h*.7);ctx.lineTo(cx+1,cy-h);ctx.lineTo(cx+5,cy-2);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(cx+1,cy-h);ctx.lineTo(cx+1,cy-2);ctx.stroke();}}
   else {const glow=ctx.createRadialGradient(x,y,1,x,y,f.r);glow.addColorStop(0,'rgba(255,169,63,.32)');glow.addColorStop(1,'rgba(235,83,20,0)');ctx.fillStyle=glow;ctx.fillRect(x-f.r,y-f.r,f.r*2,f.r*2);tkFlames(f.src,x,y,f.r*.85,'#ffb476');tkFlames(f.src,x,y,f.r*.4,'#ffe7a1');}
  }ctx.restore();
 }
 for(const u of G.units)if(u.tkTetherTarget&&tkTetherValid(u,u.tkTetherTarget)){
  const t=u.tkTetherTarget,sx=u.x,sy=u.y*SQ-35,tx=t.x,ty=t.y*SQ-35,cx=(sx+tx)/2,cy=(sy+ty)/2-30;
  ctx.strokeStyle='#91b9e7';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(cx,cy,tx,ty);ctx.stroke();ctx.fillStyle='#e6f8ff';
  for(let i=0;i<4;i++){const k=(G.time*.65+i/4)%1,ik=1-k;ctx.beginPath();ctx.arc(ik*ik*sx+2*ik*k*cx+k*k*tx,ik*ik*sy+2*ik*k*cy+k*k*ty,1.6,0,TAU);ctx.fill();}
 }
 for(const p of w.bolts)if(p.at<=G.time&&!p.dead){
  const x=p.x,y=p.y*SQ-p.z,r=p.kind==='dark'?13:p.kind==='retaliate'?5:3,color=p.element==='solar'?'#ffc681':p.element==='arc'?'#b3eaff':p.element==='stasis'?'#a6b7ff':'#c0aae6';
  ctx.save();ctx.strokeStyle=color;ctx.lineWidth=r*.9;ctx.globalAlpha*=.35;ctx.beginPath();ctx.moveTo(x-p.vx*.045,y-p.vy*.045*SQ);ctx.lineTo(x,y);ctx.stroke();ctx.restore();
  ctx.fillStyle=p.kind==='dark'?'#090c18':color;ctx.strokeStyle='#e8f5ff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.stroke();
  if(p.kind==='dark'){ctx.strokeStyle='#7697ca';ctx.beginPath();ctx.ellipse(x,y,r*1.4,r*.65,G.time*3,0,TAU);ctx.stroke();ctx.beginPath();ctx.ellipse(x,y,r*.65,r*1.3,-G.time*2,0,TAU);ctx.stroke();}
 }
 ctx.restore();
}
function takenInspector(el,u){
 let note=document.getElementById('takenStatus');if(!u.sp.tkUnit){note?.remove();return;}
 if(!note){note=document.createElement('div');note.id='takenStatus';el.appendChild(note);}
 const tether=G.units.find(s=>s.tkTetherTarget===u&&tkTetherValid(s,u));note.textContent='宿られた兵種：'+u.sp.tkRole+((u.tkShield||0)>0?' ／ 吸収シールド '+Math.ceil(u.tkShield):'')+(tether?' ／ 無敵テザー供給元：'+tether.name:'')+(takenHidden(u)?' ／ 透明化中':'');
}
