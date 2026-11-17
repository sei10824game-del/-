function drawOmoriUnit(u,pose){
 const role=u.sp.omRole,dream=u.sp.omDream,mono=role==='omori'||role==='boss',dir=renderFacing(u),scale=(u.sp.scale||1)*(u.sizeMul||1),stride=Math.sin(u.gait||0)*5*Math.min(1,(u.moveSpd||0)/90),cast=u.atk?Math.sin(Math.min(1,u.atk.t/Math.max(.1,u.atk.def.windup))*Math.PI/2):0;
 ctx.save();ctx.translate(u.x,u.y*SQ-(u.z||0));ctx.scale(dir*scale,scale);ctx.lineJoin='round';ctx.lineCap='round';
 const ink=mono?'#25232b':'#44374f',skin=mono?'#eeeef0':dream?'#ece0f4':u.pal.skin||'#e7c3a2',hair=u.sp.hair||'#24212b';
 const ell=(x,y,rx,ry,c)=>{ctx.fillStyle=c;ctx.strokeStyle=ink;ctx.lineWidth=.85;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();ctx.stroke();};
 const poly=(pts,c)=>{ctx.fillStyle=c;ctx.strokeStyle=ink;ctx.lineWidth=.85;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.stroke();};
 const line=(x,y,tx,ty,c,w=1)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke();};
 if(role==='boss'){
  ctx.strokeStyle='#a91c46';ctx.lineWidth=2;for(let i=0;i<Math.max(0,(u.omPhase||1)-1);i++){const a=G.time*.5+i*TAU/5;ctx.beginPath();ctx.arc(0,-32,30+i*2,a,a+1.4);ctx.stroke();}
 }
 const longHair=['aubrey','mari','polly','charlene'].includes(role);
 if(longHair)poly([[-12,-48],[-16,-17],[-8,-12],[-6,-26],[12,-16],[15,-41],[9,-53]],hair);
 const clothes=mono?'#18171d':role==='kel'?(dream?'#de9578':'#e69638'):role==='hero'?(dream?'#a1b4ec':'#d5bfaa'):role==='aubrey'?(dream?'#9bc4bd':'#a7c2bd'):role==='basil'?'#c6ddaf':role==='mari'?'#f0d0e2':role==='polly'?'#bcd6b9':role==='sunny'?'#f2e7d5':'#c095a3';
 // Two articulated legs and shoes; dream Aubrey/Mari use long dresses.
 for(const [x,step]of [[-5,-stride],[6,stride]]){line(x,-17,x+step,-3,mono?'#eeeeef':skin,4);ell(x+step+2,-2,5,2.5,mono?'#dddde0':'#52455b');}
 if(role==='mari'||role==='polly'||role==='aubrey'&&dream)poly([[-8,-36],[8,-36],[13,-9],[-13,-9]],clothes);
 else{poly([[-9,-36],[8,-36],[10,-17],[-9,-17]],clothes);poly([[-9,-19],[10,-19],[9,-11],[1,-11],[0,-16],[-2,-11],[-9,-11]],mono?'#fafafa':role==='kel'?'#734f7e':'#4c536e');}
 if(mono){for(let x=-6;x<=6;x+=4)line(x,-18,x,-12,'#37343e',1);line(-7,-35,-7,-23,'#8f8999');}
 if(role==='sunny'||role==='hero'&&!dream){poly([[-6,-36],[0,-30],[5,-36],[7,-34],[1,-27],[-7,-32]],'#faf7e9');for(let i=0;i<3;i++)ell(1,-25+i*3,.7,.7,'#766357');}
 if(role==='basil'){poly([[-8,-34],[-4,-34],[-4,-16],[-8,-16]],'#90ae85');poly([[5,-34],[8,-34],[9,-16],[5,-16]],'#90ae85');ell(-2,-20,1,1,'#e9d78a');ell(6,-20,1,1,'#e9d78a');}
 if(role==='kel'){line(-7,-31,7,-31,dream?'#f0dba8':'#faf0de',3);if(!dream){ctx.fillStyle='#fff4df';ctx.font='bold 7px sans-serif';ctx.fillText('16',-4,-22);}}
 // Far arm then head, visible ear and profile nose distinguish facing.
 line(-9,-33,-13-stride*.4,-21,skin,4);ell(-13-stride*.4,-20,2.5,3,skin);
 ell(0,-45,11,12,skin);ell(-10,-43,2.7,3.5,skin);poly([[9,-46],[14,-41],[9,-40]],skin);
 poly([[-11,-43],[-12,-50],[-7,-57],[3,-58],[10,-53],[11,-46],[5,-50],[4,-44],[0,-49],[-4,-44],[-5,-49],[-9,-42]],hair);
 if(role==='kel')poly([[-12,-47],[-16,-50],[-11,-51],[-9,-57],[-5,-60],[0,-57],[5,-59],[10,-53],[13,-50],[7,-49]],hair);
 if(role==='aubrey'){ell(5,-55,3,2.5,dream?'#ee869e':'#64c4d4');ell(9,-54,3,2.5,dream?'#ee869e':'#64c4d4');}
 if(role==='basil'){for(let i=0;i<6;i++){const a=i*TAU/6;ell(-7+Math.cos(a)*3,-51+Math.sin(a)*3,2,2,'#f4e6b0');}ell(-7,-51,1.4,1.4,'#d8a746');}
 if(role==='charlene')poly([[-14,-48],[-10,-59],[7,-60],[12,-48]],'#6b8c62');
 if(role==='kim')ell(-6,-56,8,4,'#b94d6f');
 if(role==='maverick')poly([[-12,-49],[-6,-60],[10,-59],[14,-45],[8,-47],[5,-51],[0,-48]],'#ecd180');
 ell(5,-44,1.1,1.8,mono?'#141318':'#473149');line(4,-37,8,-37,ink,.8);
 const handX=12+cast*8,handY=-24-cast*8;line(8,-32,handX,handY,skin,4);ell(handX,handY,3,3,skin);
 ctx.save();ctx.translate(handX,handY);ctx.rotate(-.35-cast*.7);
 if(mono){line(0,0,0,7,'#343139',3);poly([[-2,-1],[2,-1],[3,-18],[-2,-13]],'#e3e4e8');line(1,-13,2,-17,'#ffffff');}
 else if(role==='aubrey'||role==='vance'){line(0,6,0,-15,'#a87c58',4);ell(0,-18,4,9,dream?'#ceb3dc':'#bb9271');if(!dream)for(const y of [-22,-17,-12]){line(-4,y,-7,y-3,'#c9ced2',1.5);line(4,y,7,y-3,'#c9ced2',1.5);}}
 else if(role==='kel'){ell(1,-4,6,6,dream?'#cf7278':'#d98b3e');line(-5,-4,7,-4,'#6c4347');line(1,-10,1,2,'#6c4347');}
 else if(role==='hero'){line(0,6,0,-14,'#8a7179',2);ell(0,-17,4,6,'#cbd1dd');line(-2,-18,1,-20,'#fff4ec');}
 else if(role==='basil'){if(dream){ctx.fillStyle='#594d60';ctx.fillRect(-5,-8,10,7);ell(0,-5,2.5,2.5,'#b0c6d0');}else{line(-2,4,3,-13,'#aab5bb',2);line(2,4,-3,-13,'#aab5bb',2);ell(-2,4,2,2,'#506d73');ell(2,4,2,2,'#506d73');}}
 else if(role==='sunny'){ell(0,-5,5,8,'#b46b3c');ell(0,-15,4,6,'#ad673c');line(0,-23,0,-4,'#4c3a31',2);line(-8,-15,9,3,'#d1b989',1.5);}
 ctx.restore();
 if(u.omGuardUntil>G.time){ctx.strokeStyle='#a6cce5';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-26,20,32,0,0,TAU);ctx.stroke();}
 if(u.omEmotion&&u.omEmotion!=='neutral'){const col={happy:'#f6d96b',sad:'#89b9f6',angry:'#f67d7d',afraid:'#c6a5e6'}[u.omEmotion];ell(-1,-65,4,4,col);ctx.fillStyle=ink;ctx.font='bold 6px sans-serif';ctx.fillText(String(u.omEmotionTier||1),-3,-63);}
 ctx.restore();
}
function drawOmoriEffects(){ctx.save();for(const e of omWorld().effects){const p=(G.time-e.start)/.75,alpha=Math.max(0,1-p);ctx.save();ctx.globalAlpha=alpha;ctx.translate(e.x,e.y*SQ-25);ctx.strokeStyle=e.red?'#d93458':'#f0dbb5';ctx.fillStyle=e.red?'#bb2648':'#fff5d7';ctx.lineWidth=2;
 if(e.red){for(let j=0;j<4;j++){ctx.save();ctx.rotate(j*TAU/4+p*.4);ctx.translate(22+p*14,0);ctx.fillRect(-4,-8,8,13);for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-3+i*2,-6);ctx.lineTo(-3+i*2,-17-(i%2)*3);ctx.stroke();}ctx.restore();}}
 else{ctx.beginPath();ctx.arc(0,0,8+p*27,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(-12,-12);ctx.lineTo(14,14);ctx.stroke();}
 ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillStyle=e.red?'#ff99b3':'#fff2d4';ctx.fillText(e.n,0,-37-p*14);ctx.restore();}ctx.restore();}
