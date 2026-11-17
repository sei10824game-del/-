/* Directional, hooded skeleton silhouettes; phantom Papyrus is visual only. */
function drawSans(u,pose){
 const dust=u.sp.ssDust,dir=renderFacing(u),walk=Math.min(1,(u.moveSpd||0)/80),stride=Math.sin(u.gait||0)*5*walk,attack=u.atk?Math.sin(Math.min(1,u.atk.t/Math.max(.1,u.atk.def.windup))*Math.PI*.5):0;
 ctx.save();ctx.translate(u.x,u.y*SQ-(u.z||0));ctx.scale(dir*u.sp.scale*u.sizeMul,u.sp.scale*u.sizeMul);ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle='#20212a';ctx.lineWidth=1;
 const ell=(x,y,rx,ry,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();ctx.stroke();};
 if(dust){ctx.globalAlpha=.36;ctx.save();ctx.translate(-25,-39+Math.sin(G.time*2)*2);ell(0,-12,6,9,'#dad9ce');ell(-1,-13,1.8,2,'#701b20');ell(3,-13,1.6,2,'#bc2029');ctx.fillStyle='#951f25';ctx.fillRect(-6,0,13,4);ctx.beginPath();ctx.moveTo(-5,3);ctx.lineTo(-16,13);ctx.lineTo(-8,15);ctx.lineTo(0,3);ctx.fill();ell(0,9,7,5,'#dad9ce');ctx.restore();ctx.globalAlpha=1;}
 // Far leg, shorts, exposed tibia and pink slippers.
 ell(-5-stride,-5,2.2,7,'#d4d2c6');ell(-4-stride,0,6,3,dust?'#777184':'#e6aac1');
 ell(6+stride,-5,2.4,7,'#eeece0');ell(8+stride,0,7,3,dust?'#92869c':'#f0bbcd');
 ctx.fillStyle='#20242d';ctx.fillRect(-10,-19,20,10);ctx.fillStyle='#e8e8dc';ctx.fillRect(-10,-18,2,8);ctx.fillRect(8,-18,2,8);
 ell(0,-28,13,13,dust?'#3d4b61':'#3f83c8');ell(-5,-32,8,10,dust?'#2c3748':'#2f6399');
 // Hoodie rim and open white shirt, asymmetric pocket hand / casting hand.
 ell(1,-35,11,6,'#e5e1d8');ctx.fillStyle='#c4c4c3';ctx.fillRect(-3,-34,7,15);ctx.strokeStyle='#2a3545';ctx.beginPath();ctx.moveTo(-4,-32);ctx.lineTo(-5,-17);ctx.moveTo(5,-32);ctx.lineTo(7,-17);ctx.stroke();
 ell(-11,-24,4,7,dust?'#3a485e':'#3777b6');ell(-10,-20,3,2.5,'#e4e1d6');
 ell(12+attack*7,-27-attack*7,4,7,dust?'#526078':'#5395d3');ell(14+attack*10,-23-attack*14,3.5,3,'#e8e5d8');
 if(dust){ctx.fillStyle='#5d383e';ctx.fillRect(-8,-37,17,3);ctx.beginPath();ctx.moveTo(-8,-36);ctx.lineTo(-18,-20);ctx.lineTo(-11,-18);ctx.lineTo(-3,-35);ctx.fill();}
 if(dust)ell(1,-44,15,14,'#293344');
 // Three-quarter skull, broad grin, unequal sockets and forward-facing nose.
 ctx.save();ctx.translate(2,-45);if(u.ssSleeping)ctx.rotate(.3);ell(0,-1,12,10,dust?'#d7d5c9':'#efeee4');ell(3,5,9,5,'#e7e5db');ell(-5,-2,3.5,4,'#171b25');ell(4,-2,4.2,4.6,'#171b25');
 if(attack>.1&&!u.ssSleeping){ell(4,-2,1.8,2.3,dust?'#b37ade':'#67e4f2');if(dust)ell(-5,-2,1.1,1.5,'#e43b3f');}
 ctx.fillStyle='#242634';ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(11,3);ctx.lineTo(7,3);ctx.fill();ctx.strokeStyle='#34333a';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-5,5);ctx.quadraticCurveTo(3,10,10,5);for(let i=0;i<5;i++){ctx.moveTo(-4+i*3,5);ctx.lineTo(-3+i*3,8);}ctx.stroke();ctx.restore();
 if(u.ssSleeping){ctx.fillStyle='#cadbee';ctx.font='10px monospace';ctx.fillText('z z',12,-55);}
 ctx.restore();
}
function drawSansEffects(){
 const w=ssWorld();ctx.save();
 for(const p of w.shots){if(p.delay>G.time)continue;G.frameLights?.push({x:p.x,y:p.y,z:0,r:34,col:p.blue?'70,210,255':'215,240,255',a:.45});ctx.save();ctx.translate(p.x,p.y*SQ);ctx.rotate(Math.atan2(p.vy*SQ,p.vx)+Math.PI*.5);ctx.strokeStyle=p.blue?'#53d9f0':'#f1f0e8';ctx.lineWidth=Math.max(3,1.6/(G.cam.z||1));ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(10,0);ctx.stroke();for(const x of [-10,10])for(const y of [-2,2]){ctx.beginPath();ctx.arc(x,y,2,0,TAU);ctx.stroke();}ctx.restore();}
 for(const f of w.fields){if(f.kind==='platform'){ctx.strokeStyle='#9bead6';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(f.x-30,f.y*SQ);ctx.lineTo(f.x+30,f.y*SQ);ctx.stroke();continue;}
 if(G.time<f.start-.8)continue;const active=G.time>=f.start;let len=650;for(let l=8;l<=650;l+=8)if(!walkAtPx(f.x+Math.cos(f.angle)*l,f.y+Math.sin(f.angle)*l)){len=l;break;}
 G.frameLights?.push({x:f.x,y:f.y,z:0,r:active?135:65,col:'100,215,255',a:active?.9:.4});
 if(active)for(let l=50;l<len;l+=70)G.frameLights?.push({x:f.x+Math.cos(f.angle)*l,y:f.y+Math.sin(f.angle)*l,z:0,r:90,col:'150,230,255',a:.7});
 ctx.strokeStyle=active?'#f5ffff':'rgba(130,221,245,.65)';ctx.lineWidth=active?f.width:1;ctx.beginPath();ctx.moveTo(f.x,f.y*SQ);ctx.lineTo(f.x+Math.cos(f.angle)*len,(f.y+Math.sin(f.angle)*len)*SQ);ctx.stroke();if(active){ctx.strokeStyle='#85eaff';ctx.lineWidth=Math.max(2,f.width*.3);ctx.stroke();}ctx.save();ctx.translate(f.x,f.y*SQ);ctx.scale(1.35,1.35);ctx.rotate(Math.atan2(Math.sin(f.angle)*SQ,Math.cos(f.angle)));ctx.fillStyle=active?'#f2f2e4':'#a7b0bd';ctx.strokeStyle='#202632';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(0,-9);ctx.lineTo(-14,-7);ctx.lineTo(-9,0);ctx.lineTo(-14,7);ctx.lineTo(0,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#315f72';ctx.fillRect(-4,-6,5,4);ctx.fillRect(-4,2,5,4);ctx.restore();
 }
 for(const u of G.units){if(u.ssAfter?.until>G.time){ctx.globalAlpha=(u.ssAfter.until-G.time)*1.2;drawSans({...u,x:u.ssAfter.x,y:u.ssAfter.y,ssAfter:null},{});ctx.globalAlpha=1;}if(exAlive(u)&&u.ssKarma>0){ctx.fillStyle='#d48cde';ctx.font='10px monospace';ctx.fillText('KR '+u.ssKarma,u.x-10,u.y*SQ-55);}if(exAlive(u)&&u.ssBlueUntil>G.time){ctx.fillStyle='#559fff';ctx.font='12px monospace';ctx.fillText('♥',u.x-4,u.y*SQ-48);}}
 ctx.restore();
}
