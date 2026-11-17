function drawExeUnit(u){
 const S=17*u.sp.scale*u.sizeMul,x=u.x,y=u.y*SQ-u.z,T=G.time,shape=u.sp.exeShape,act=actionPhase(u),hit=Math.sin(act*Math.PI),col=u.pal.skin;
 const walk=Math.sin(u.gait||T*6)*Math.min(1,(u.moveSpd||0)/80),hx=x,hy=y-S*2.3,dir=renderFacing(u);
 const a=u.atk,ad=a?.def,at=a?.t||0,aw=Math.max(.001,ad?.windup||.5),wind=a&&u.state==='attack'&&at<aw?Math.sin(at/aw*Math.PI/2):0,strike=a&&u.state==='attack'&&at>=aw?Math.exp(-(at-aw)/Math.max(.12,(ad.active||.1)*.6)):0;
 let heldHand=null;
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 ctx.translate(dir*S*(-wind*.08+strike*.1),0);
 if(shape==='water'){ctx.strokeStyle='#4e849c';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(x,y-i*3,S*(1.2+i*.2),S*.2,0,0,TAU);ctx.stroke();}}
 if(shape==='fox'){
  const spinning=u.state==='attack'&&ad?.exAction==='exeSpin',tailPhase=spinning?act*TAU*2:T*2.5;
  for(const q of [-1,1]){ctx.save();ctx.translate(x-dir*S*.2,y-S*.85);ctx.rotate((Math.sin(tailPhase+q*.9)*.18+q*.22)*(spinning?2:1));const len=S*(1.35+(spinning?hit*.65:0)),end=-dir*len,dy=q*S*.36;ctx.fillStyle=visualMaterial(col,-len,-S*.7,len*2,S*1.4);ctx.strokeStyle='#30252c';ctx.lineWidth=S*.025;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-dir*S*.55,-S*.4+dy,end-dir*S*.25,-S*.45+dy,end,dy);ctx.quadraticCurveTo(end+dir*S*.35,dy+S*.36,0,S*.12);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#cebc94';ctx.beginPath();ctx.moveTo(end+dir*S*.25,dy-S*.22);ctx.lineTo(end,dy);ctx.lineTo(end+dir*S*.28,dy+S*.23);ctx.lineTo(end+dir*S*.45,dy+S*.04);ctx.closePath();ctx.fill();ctx.restore();}
 }
 ctx.strokeStyle='#27212c';ctx.lineWidth=S*.26;
 if(shape!=='unicycle')for(const q of [-1,1]){ctx.beginPath();ctx.moveTo(x+q*S*.2,y-S);ctx.lineTo(x+q*S*.42+walk*q*S*.2,y-S*.15);ctx.stroke();ctx.fillStyle='#8c303e';ctx.beginPath();ctx.ellipse(x+q*S*.45+walk*q*S*.2,y-S*.08,S*.34,S*.15,0,0,TAU);ctx.fill();}
 ctx.fillStyle=visualMaterial(shape==='coat'?'#303039':shape==='amy'?'#9e244c':col,x-S*.5,y-S*1.9,S,S*1.1);
 ctx.beginPath();ctx.moveTo(x-S*.4,y-S*1.9);ctx.lineTo(x+S*.4,y-S*1.9);ctx.lineTo(x+S*(shape==='eggman'?.85:.52),y-S*.8);ctx.lineTo(x-S*(shape==='eggman'?.85:.52),y-S*.8);ctx.closePath();ctx.fill();
 // Character-specific chest details prevent the common profile from reading as
 // the same blank shirt on every vessel. They follow the existing torso.
 if(shape==='fox'){ctx.fillStyle='#d7c7a3';ctx.beginPath();ctx.moveTo(x-S*.22,y-S*1.8);ctx.lineTo(x+S*.24,y-S*1.8);ctx.lineTo(x+S*.15,y-S*1.36);ctx.lineTo(x,y-S*1.46);ctx.lineTo(x-S*.13,y-S*1.3);ctx.closePath();ctx.fill();}
 if(shape==='echidna'){ctx.strokeStyle='#d9c8b9';ctx.lineWidth=S*.075;ctx.beginPath();ctx.moveTo(x-S*.24,y-S*1.63);ctx.quadraticCurveTo(x,y-S*1.45,x+S*.24,y-S*1.63);ctx.stroke();}
 if(shape==='amy'){ctx.strokeStyle='#ed8ba7';ctx.lineWidth=S*.035;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x+(i-1)*S*.12,y-S*1.25);ctx.lineTo(x+(i-1)*S*.22,y-S*.85);ctx.stroke();}ctx.strokeStyle='#cfad78';ctx.lineWidth=S*.055;ctx.beginPath();ctx.moveTo(x-S*.37,y-S*1.25);ctx.lineTo(x+S*.37,y-S*1.25);ctx.stroke();}
 if(shape==='eggman'){ctx.strokeStyle='#dbc18c';ctx.lineWidth=S*.045;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(x+side*S*.18,y-S*1.82);ctx.lineTo(x+side*S*.4,y-S*.93);ctx.stroke();for(let i=0;i<3;i++){ctx.fillStyle='#e9d6a4';ctx.fillRect(x+side*S*.24-S*.025,y-S*(1.63-i*.22),S*.05,S*.05);}}}
 if(shape==='coat'){ctx.strokeStyle='#858178';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y-S*1.8);ctx.lineTo(x,y-S*.85);ctx.stroke();}
 if(shape==='hedgehog'||shape==='echidna'||shape==='amy'){ctx.fillStyle=col;for(let i=0;i<5;i++){const a=Math.PI*.55+i*.37;ctx.beginPath();ctx.moveTo(hx+dir*Math.cos(a)*S*.45,hy+Math.sin(a)*S*.42);ctx.lineTo(hx+dir*Math.cos(a+.2)*S*(shape==='echidna'?1:1.2),hy+Math.sin(a+.2)*S);ctx.lineTo(hx+dir*Math.cos(a+.5)*S*.5,hy+Math.sin(a+.5)*S*.45);ctx.fill();}}
 ctx.strokeStyle=visualMaterial(col,x-S,y-S*2,S*2,S*1.6);ctx.lineWidth=S*.22;
 for(const q of [-1,1]){const stretch=u.atk&&u.atk.def.exAction==='exeStretch'&&q===dir?strike*2.8:0,ax=x+q*S*(.7+stretch+(q===dir?strike*.35-wind*.15:0)),ay=y-S*(1.35+walk*q*.2+(q===dir?wind*.65+strike*.12:wind*.12));ctx.beginPath();ctx.moveTo(x+q*S*.3,y-S*1.7);ctx.quadraticCurveTo(x+q*S*(.9+stretch*.4),y-S*1.2,ax,ay);ctx.stroke();ctx.fillStyle=visualMaterial('#baaba0',ax-S*.24,ay-S*.28,S*.48,S*.56);ctx.beginPath();ctx.ellipse(ax,ay,S*.24,S*.28,0,0,TAU);ctx.fill();for(let j=0;j<3;j++){ctx.strokeStyle='#ddd1ac';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ax+q*S*.15,ay+(j-1)*S*.12);ctx.lineTo(ax+q*S*.45,ay+(j-1)*S*.18);ctx.stroke();}if(q===dir)heldHand={x:ax,y:ay};if(shape==='echidna'){ctx.fillStyle='#e0d4bb';for(let j=0;j<2;j++){ctx.beginPath();ctx.moveTo(ax+q*S*.1,ay-S*(.04+j*.16));ctx.lineTo(ax+q*S*.42,ay-S*(.12+j*.16));ctx.lineTo(ax+q*S*.14,ay-S*(.18+j*.16));ctx.fill();}}}
 ctx.save();ctx.translate(hx,hy);if(u.atk&&u.atk.def.exAction==='exeSpin'&&u.key==='lordX')ctx.rotate(act*TAU);
 ctx.fillStyle=visualMaterial(shape==='unicycle'?'#d9bb9e':col,-S*.58,-S*.55,S*1.16,S*1.1);ctx.beginPath();ctx.ellipse(0,0,S*.58,S*.55,0,0,TAU);ctx.fill();ctx.strokeStyle='#12101c';ctx.lineWidth=S*.035;ctx.stroke();
 if(['fox','sally','amy','hedgehog'].includes(shape)){for(const q of [-1,1]){ctx.beginPath();ctx.moveTo(q*S*.28,-S*.3);ctx.lineTo(q*S*.48,-S*.95);ctx.lineTo(q*S*.65,-S*.25);ctx.fill();}}
 // Side-view muzzle and one leading eye establish an unambiguous profile.
 ctx.fillStyle=visualMaterial(shape==='unicycle'?'#d9bb9e':col,-S*.1,-S*.2,S*.9,S*.6);ctx.beginPath();ctx.moveTo(dir*S*.3,-S*.18);ctx.lineTo(dir*S*.78,S*.08);ctx.lineTo(dir*S*.58,S*.3);ctx.lineTo(dir*S*.25,S*.35);ctx.closePath();ctx.fill();
 ctx.fillStyle='#08060b';ctx.beginPath();ctx.ellipse(dir*S*.32,-S*.07,S*.17,S*.22,0,0,TAU);ctx.fill();ctx.fillStyle='#ff263f';ctx.beginPath();ctx.arc(dir*S*.38,-S*.07,S*.045,0,TAU);ctx.fill();
 ctx.strokeStyle='#9f1939';ctx.lineWidth=S*.055;ctx.beginPath();ctx.moveTo(dir*S*.35,S*.06);ctx.lineTo(dir*S*.42,S*.31);ctx.stroke();
 const hole=u.atk&&u.atk.def.exAction==='exeHole';ctx.fillStyle='#130d16';ctx.beginPath();ctx.ellipse(dir*S*.36,S*.25,S*(hole?.45:.24),S*(hole?.35:.12),0,0,TAU);ctx.fill();if(hole){ctx.strokeStyle='#b16bb6';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,S*.25,S*(.5+hit*.35),S*(.4+hit*.2),T*4,0,TAU);ctx.stroke();}ctx.fillStyle='#dbb99a';for(let i=0;i<6;i++)ctx.fillRect(dir*S*(.16+i*.065),S*.18,S*.035,S*.09);
 if(shape==='eggman'){ctx.fillStyle='#bda987';for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(0,S*.14);ctx.quadraticCurveTo(side*S*.5,-S*.02,side*S*.88,S*.06);ctx.lineTo(side*S*.65,S*.3);ctx.quadraticCurveTo(side*S*.32,S*.32,0,S*.19);ctx.closePath();ctx.fill();}}
 if(shape==='crown'){ctx.strokeStyle='#d4b469';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-S*.5,-S*.4);ctx.lineTo(-S*.6,-S*.9);ctx.lineTo(0,-S*.65);ctx.lineTo(S*.3,-S*1.1);ctx.lineTo(S*.55,-S*.4);ctx.stroke();}
 if(shape==='prayer'){ctx.strokeStyle='#f4e2aa';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-S*.8,S*.6,S*.13,0,0,TAU);ctx.stroke();}
 ctx.restore();
 if(u.key==='lordX'){ctx.strokeStyle='#b83e50';ctx.lineWidth=3;for(const q of [-1,1]){ctx.beginPath();ctx.moveTo(x-S*.18,y-S*(1.5+q*.15));ctx.lineTo(x+S*.18,y-S*(1.5-q*.15));ctx.stroke();}}
 if(shape==='unicycle'){
  const rotation=u.gait||0,cy=y-S*.12;ctx.save();ctx.translate(x,cy);ctx.rotate(rotation*dir);ctx.strokeStyle='#44434e';ctx.lineWidth=S*.13;ctx.beginPath();ctx.arc(0,0,S*.4,0,TAU);ctx.stroke();ctx.strokeStyle='#bdb6bd';ctx.lineWidth=S*.035;for(let i=0;i<7;i++){const aa=i*TAU/7;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(aa)*S*.35,Math.sin(aa)*S*.35);ctx.stroke();}ctx.restore();ctx.strokeStyle='#8d8799';ctx.lineWidth=S*.08;ctx.beginPath();ctx.moveTo(x,y-S*.9);ctx.lineTo(x,cy);ctx.stroke();
  for(const q of [-1,1]){const aa=rotation+q*Math.PI/2,px=x+Math.cos(aa)*S*.22,py=cy+Math.sin(aa)*S*.16;limb({x:x+q*S*.15,y:y-S*.85},{x:px,y:py},S*.1,S*.07,'#27212c');ctx.fillStyle='#8c303e';ctx.fillRect(px-S*.14,py-S*.03,S*.28,S*.07);}
 }
 if(shape==='amy'&&heldHand){ctx.save();ctx.translate(heldHand.x,heldHand.y);ctx.rotate(dir*(-wind*1.25+strike*1.8));ctx.strokeStyle='#72533e';ctx.lineWidth=S*.09;ctx.beginPath();ctx.moveTo(0,S*.12);ctx.lineTo(0,-S*.85);ctx.stroke();drawFacingBlock(0,-S*.75,S*.88,S*.45,S*.16,dir,'#b33465','#6b2545','#ed8ca5');ctx.fillStyle='#d5ac65';ctx.fillRect(-S*.11,-S*1.2,S*.22,S*.45);ctx.restore();}
 ctx.restore();
}
