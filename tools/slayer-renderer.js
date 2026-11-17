// Facing-aware DOOM marine armor. Drawing never advances combat state.
function drawSlayer(u,pose){
 if(u.sp.slDecoy){const owner=u.slOwner;if(owner){ctx.save();ctx.globalAlpha*=.35;drawSlayer({...owner,x:u.x,y:u.y,z:0,slFlash:0,atk:null},pose);ctx.restore();}return;}
 const era=u.sp.slEra,classic=['classic','64','rpg'].includes(era),d3=era==='d3',dark=era==='dark',mini=era==='mini',dir=renderFacing(u),a=u.atk,t=a?.t||0,w=Math.max(.001,a?.def.windup||.4),wind=a&&t<w?Math.sin(t/w*Math.PI/2):0,hit=a&&t>=w?Math.exp(-(t-w)/.2):0,gait=u.gait||0,walk=Math.min(1,(u.moveSpd||0)/90),stride=Math.sin(gait)*8*walk,col=u.pal.cloth;
 ctx.save();ctx.translate(u.x,u.y*SQ-(u.z||0));ctx.scale(dir*u.sp.scale*u.sizeMul,u.sp.scale*u.sizeMul);ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle='#141b18';ctx.lineWidth=.8;
 const ell=(x,y,rx,ry,c)=>{ctx.fillStyle=visualMaterial(c,x-rx,y-ry,rx*2,ry*2);ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();ctx.stroke();};
 const box=(x,y,width,height,c)=>drawFacingBlock(x,y,width,height,3,1,c,shade(c,-.35),shade(c,.2));
 const leg=(x,phase,far)=>{const swing=Math.sin(gait+phase)*8*walk,lift=Math.max(0,Math.cos(gait+phase))*4*walk,hip={x,y:-21},knee={x:x+swing*.4,y:-11-lift*.4},foot={x:x+swing+2,y:-lift};limb(hip,knee,4.2,3.4,far?'#36413b':'#505b4c');limb(knee,foot,3.4,3,far?'#303831':col);ell(knee.x,knee.y,4,3,far?'#424a3d':'#8a9275');box(foot.x+1,foot.y,9,5,'#343a33');};
 if(dark){ctx.fillStyle=visualMaterial('#524433',-18,-50,30,49);ctx.beginPath();ctx.moveTo(-12,-51);ctx.lineTo(-20-stride*.2,-2);ctx.lineTo(-6,0);ctx.lineTo(1,-34);ctx.closePath();ctx.fill();}
 leg(-5,Math.PI,true);leg(5,0,false);
 ctx.translate(-wind*3+hit*5,Math.cos(gait*2)*walk*.8+Math.sin(G.time*2+u.id)*.25);
 // Back arm, layered torso, hip plates and pronounced shoulder armor.
 limb({x:-9,y:-42},{x:-11-stride*.2,y:-27},classic?3:4,3,classic?'#b79572':'#414c3e');
 box(-1,-22,22,25,col);box(-1,-43,27,10,shade(col,.08));box(-2,-23,24,6,'#6a6552');
 for(let i=0;i<3;i++){ctx.strokeStyle=shade(col,-.35);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-9,-39+i*5);ctx.lineTo(7,-38+i*5);ctx.stroke();}
 if(classic){box(-1,-25,12,9,'#4c5041');ctx.fillStyle='#ac9d7f';ctx.fillRect(-5,-43,9,3);}else{box(-1,-35,14,12,'#748063');ell(2,-39,2,1.4,'#c19d58');box(-9,-43,9,11,'#7c8769');}
 if(d3){box(-2,-48,18,6,'#484d48');ell(-2,-53,5,6,'#b69d7d');}else{
  box(0,-49,20,16,dark?'#6a7455':col);box(5,-53,14,5,'#303d38');ctx.fillStyle=classic?'#bad0aa':era==='vfr'?'#79d9e0':'#a8c795';ctx.beginPath();ctx.moveTo(0,-61);ctx.lineTo(10,-60);ctx.lineTo(12,-56);ctx.lineTo(3,-56);ctx.closePath();ctx.fill();ctx.strokeStyle='#d2dfbc';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(2,-60);ctx.lineTo(9,-59);ctx.stroke();box(6,-49,9,4,'#5a6052');for(let i=0;i<3;i++){ctx.fillStyle='#272f28';ctx.fillRect(3+i*3,-51,1,3);}
 }
 const id=a?.def.slWeapon||u.slLastWeapon||u.sp.atks.find(d=>d.slAmmo)?.slWeapon||'shotgun',def=SL_GUNS[id],melee=def&&['melee','glory','slam'].includes(def[5]),hx=14-wind*5+hit*8,hy=-32-wind*7;
 limb({x:9,y:-43},{x:7,y:-31-wind*4},classic?3.5:4.5,3,classic?'#b89975':col);limb({x:7,y:-31-wind*4},{x:hx,y:hy},3,2.5,classic?'#c3a581':'#626d59');box(10,-39,12,9,col);ell(hx,hy,3,3,'#353e34');
 if(melee){ctx.save();ctx.translate(hx,hy);ctx.rotate(-wind*.8+hit*1.1);if(id==='saw'){box(7,3,12,9,'#bd9a49');box(15,0,18,4,'#a6aba1');for(let i=0;i<6;i++){ctx.fillStyle='#3f443e';ctx.fillRect(10+i*2.6,-4,1,2);}}else if(id==='crucible'||id==='blade'){ctx.strokeStyle=id==='crucible'?'#fb5c37':'#b0b7a8';ctx.lineWidth=id==='crucible'?4:2.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(9,-24);ctx.stroke();}else if(['hammer','mace','flail','axe'].includes(id)){ctx.strokeStyle='#786348';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,4);ctx.lineTo(5,-19);ctx.stroke();box(5,-16,13,10,id==='hammer'?'#cf9e5b':'#787f70');}ctx.restore();}
 else{const energy=def&&['plasma','bfg','rail','heat','beam'].includes(def[5]),big=energy||id==='rocket',width=big?25:19;box(hx+7,hy+3,width,big?10:6,energy?'#777e6b':'#545b52');box(hx+width*.65,hy+1,7,3,'#2c342c');ctx.fillStyle=energy?'#a6e5bc':'#111a15';ctx.fillRect(hx+width*.65+3,hy-3,3,3);if(energy)for(let i=0;i<3;i++){ctx.fillStyle='#9bc997';ctx.fillRect(hx-2+i*5,hy-4,2,3);}if(u.slFlash>G.time){ctx.fillStyle=energy?'#a5f3b1':'#ffd28b';ctx.beginPath();ctx.moveTo(hx+width*.65+6,hy-1);ctx.lineTo(hx+width*.65+18,hy-6);ctx.lineTo(hx+width*.65+14,hy+1);ctx.lineTo(hx+width*.65+18,hy+6);ctx.lineTo(hx+width*.65+6,hy+2);ctx.fill();}}
 if(era==='eternal'){box(-9,-48,8,5,'#6f775f');ctx.fillStyle='#b0b7a3';ctx.beginPath();ctx.moveTo(hx-3,hy-3);ctx.lineTo(hx+4,hy-15);ctx.lineTo(hx+1,hy);ctx.fill();}
 if(dark){ell(-5,-29,10,13,'#4b5342');ell(-5,-29,7,10,'#898c72');for(let i=0;i<10;i++){const ang=i*TAU/10;ctx.strokeStyle='#b3b6a0';ctx.beginPath();ctx.moveTo(-5+Math.cos(ang)*9,-29+Math.sin(ang)*12);ctx.lineTo(-5+Math.cos(ang)*12,-29+Math.sin(ang)*15);ctx.stroke();}}
 if(u.slGuard>G.time){ctx.strokeStyle='#a0dcd6';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(23,-32,4,22,0,-Math.PI*.6,Math.PI*.6);ctx.stroke();}
 ctx.restore();
}
function drawSlayerEffects(){
 if(!G.slayer)return;ctx.save();for(const p of G.slayer.shots){const k=p.d.slKind;ctx.fillStyle=k==='bfg'?'#9df8a0':k==='plasma'?'#8adeff':k==='cube'?'#d79759':'#f4bd75';ctx.beginPath();ctx.arc(p.x,p.y*SQ-22,k==='bfg'?8:k==='cube'?6:3,0,TAU);ctx.fill();}
 for(const p of G.slayer.pickups){ctx.fillStyle='#788a65';ctx.fillRect(p.x-5,p.y*SQ-8,10,8);ctx.fillStyle='#dbc99c';ctx.fillRect(p.x-2,p.y*SQ-6,4,3);}
 ctx.restore();
}
