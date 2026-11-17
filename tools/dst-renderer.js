/* DST-inspired inked silhouettes drawn natively; not original game sprites. */
function drawDST(u,pose){
 const shape=u.sp.dstShape,color=u.sp.pal.skin,phase=dstPhase(u),attack=u.atk?Math.sin(clamp(u.atk.t/Math.max(.1,u.atk.def.windup),0,1)*Math.PI/2):0,gait=Math.sin(u.gait||0)*Math.min(1,(u.moveSpd||0)/80),stroke='#1c1920';
 ctx.save();ctx.translate(u.x,u.y*SQ-(u.z||0));ctx.scale(renderFacing(u)*(u.sizeMul||1),u.sizeMul||1);ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=1.8;ctx.strokeStyle=stroke;
 const ell=(x,y,rx,ry,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();ctx.strokeStyle=stroke;ctx.stroke();};
 const poly=(pts,c)=>{ctx.fillStyle=c;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.strokeStyle=stroke;ctx.stroke();};
 const line=(pts,c,w=2)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.lineWidth=1.8;ctx.strokeStyle=stroke;};
 const grad=ctx.createLinearGradient(-25,-65,25,5);grad.addColorStop(0,shade(color,.24));grad.addColorStop(.55,color);grad.addColorStop(1,shade(color,-.4));
 const fur=(x,y,w,h,c)=>{poly([[x-w,y-h],[x-w*.65,y-h*1.1],[x-w*.45,y-h*.9],[x,y-h*1.12],[x+w*.4,y-h*.9],[x+w*.75,y-h],[x+w,y-h*.5],[x+w*.85,y],[x+w*.45,y-h*.14],[x+w*.1,y+h*.07],[x-w*.3,y-h*.13],[x-w*.65,y+h*.05]],c);};
 const claws=(x,y,n=3)=>{for(let i=0;i<n;i++)poly([[x+i*4,y],[x+i*4+4,y+1],[x+i*4+5,y+11]],'#c4bba3');};
 const eye=(x,y,r=5,iris='#bdbb71')=>{ell(x,y,r,r*.83,'#e8ddc5');ell(x+1,y,r*.46,r*.65,iris);ell(x+2,y,r*.15,r*.55,'#191b21');ell(x+1,y-2,r*.13,r*.17,'#f0ead4');};
 const antler=(side,x,y,scale=1)=>{ctx.save();ctx.translate(x,y);ctx.scale(side*scale,scale);line([[0,0],[8,-14],[9,-33],[20,-43]],'#a6a293',5);line([[8,-14],[23,-22],[24,-35]],'#aaa69a',3);line([[9,-29],[-1,-38],[-3,-48]],'#aaa69a',3);line([[18,-42],[16,-53]],'#aaa69a',3);ctx.restore();};
 if(shape==='eye'||shape==='servant'){
  const R=shape==='eye'?29:11,cy=shape==='eye'?-33:-12;
  for(let i=0;i<7;i++){const y=cy-R*.7+i*R*.22;line([[-R*.7,y],[-R*1.35-Math.sin(G.time*5+i)*5,y-8],[-R*1.8,y+Math.sin(G.time*4+i)*9]],i%2?'#8d565b':'#b0a19a',shape==='eye'?3:1.5);}
  ell(0,cy,R,R,grad);
  for(let i=0;i<6;i++)line([[-R*.7+i*R*.25,cy-R*.65],[-R*.45+i*R*.15,cy-R*.3],[-R*.35+i*R*.13,cy]],'#9c6b6e',1);
  if(phase===1||shape==='servant'){ell(R*.35,cy,R*.68,R*.8,'#dedbd0');ell(R*.6,cy,R*.45,R*.62,'#699276');ell(R*.73,cy,R*.17,R*.48,'#1e2929');ell(R*.65,cy-R*.2,R*.09,R*.13,'#f1ead6');}
  else{ell(R*.42,cy,R*.75,R*.85,'#4e2933');for(const side of [-1,1])for(let i=0;i<6;i++)poly([[R*.05+i*R*.2,cy+side*R*.63],[R*.15+i*R*.2,cy+side*R*.28],[R*.25+i*R*.2,cy+side*R*.63]],'#d7c5a7');ell(R*.2,cy+6,R*.13,R*.5,'#a2656c');}
 }else if(shape==='dragon'){
  const enraged=u.dstEnragedUntil>G.time,body=enraged?'#d86b39':grad;
  for(const side of [-1,1]){ctx.save();ctx.scale(side,1);const flap=Math.sin(G.time*15)*5;poly([[-8,-30],[-51,-64-flap],[-58,-47],[-44,-33],[-20,-24]],'#c3bda064');line([[-9,-30],[-51,-61-flap],[-45,-37]],'#7b765b',2);ctx.restore();}
  for(let i=0;i<3;i++)for(const side of [-1,1])line([[side*14,-20+i*6],[side*(32+attack*9),-15+i*8],[side*38,-3+i*6]],'#64543d',4);
  ell(-5,-25,27,25,body);poly([[-26,-40],[-31,-24],[-25,-12],[-18,-6],[-18,-36]],shade(color,-.3));
  for(let i=0;i<4;i++)line([[-13,-42+i*8],[14,-39+i*8]],enraged?'#f6bc50':'#7b6d46',2);
  ell(14,-48,20,18,body);ell(2,-52,10,14,'#a1b76b');ell(25,-52,10,14,'#a1b76b');
  for(const x of [-2,5,21,28])line([[x,-60],[x-3,-54],[x,-48],[x-3,-42]],'#657f52',1);
  poly([[12,-42],[30,-42],[33,-33],[19,-29],[9,-33]],'#696043');for(let i=0;i<4;i++)poly([[12+i*5,-39],[15+i*5,-33],[18+i*5,-39]],'#d4c393');
  line([[6,-63],[1,-77],[-8,-82]],'#7b6c49',3);line([[23,-64],[29,-78],[36,-82]],'#7b6c49',3);
  if(enraged)for(let i=0;i<5;i++)poly([[-25+i*11,-16],[-31+i*11,-27-Math.sin(G.time*14+i)*8],[-18+i*11,-22]],'#f4b43b');
 }else if(shape==='bear'){
  ell(-15+gait*5,0,13,8,'#40383a');ell(16-gait*5,0,13,8,'#40383a');fur(0,-1,32,64,grad);fur(0,-39,21,32,'#ccc6b2');
  for(const side of [-1,1]){ell(side*20,-70,9,10,'#5d504a');ell(side*20,-70,5,5,'#a59a8b');line([[side*24,-43],[side*(33+attack*10),-22]],'#584b45',16);claws(side<0?-43-attack*10:28+attack*10,-18);}
  ell(8,-56,21,14,'#aaa493');poly([[15,-58],[34,-54],[25,-43],[11,-47]],'#746c51');eye(12,-65,4,'#b49e74');line([[-15,-66],[-3,-61]],'#52463f',3);
  for(let i=0;i<7;i++)line([[-15+i*4,-28],[-17+i*4,-8]],'#91877d',1);
 }else if(shape==='moose'||shape==='mossling'){
  const baby=shape==='mossling';ctx.save();if(baby)ctx.scale(.48,.48);
  for(const side of [-1,1]){line([[side*13,-9],[side*(15+gait*4),8]],'#6c6552',4);poly([[side*15,6],[side*26,12],[side*9,12]],'#8f825d');}
  ell(-3,-27,29,30,grad);poly([[-24,-33],[-31,-15],[-14,-6],[-4,-22]],'#a29e8d');line([[-23,-27],[-15,-10]],'#757463',2);
  line([[10,-25],[13,-55],[19,-64]],'#c8c2a7',16);ell(22,-65,17,14,grad);poly([[29,-64],[48,-59],[30,-52],[20,-55]],'#b69761');eye(27,-69,4,'#979d71');
  if(!baby){antler(-1,12,-75,.72);antler(1,28,-75,.72);}else{poly([[7,-71],[10,-84],[20,-75],[25,-82],[29,-72]],'#d7ca85');if(u.dstAngry)line([[13,-72],[27,-67]],'#9e533d',3);}
  if(u.atk?.def.dstPower==='honk'){for(let i=0;i<3;i++){ctx.strokeStyle='#ddd2a3';ctx.beginPath();ctx.arc(46,-57,10+i*9,-.7,.7);ctx.stroke();}}
  ctx.restore();
 }else if(shape==='pig'){
  const tired=u.dstTiredUntil>G.time;ctx.rotate(tired?.13:0);fur(-6,-2,27,62,grad);
  for(const side of [-1,1]){line([[side*13,-13],[side*(16+gait*5),2]],'#53434b',12);ell(side*(18+gait*5),4,12,6,'#44383f');line([[side*19,-47],[side*(36+attack*15),-18],[side*(37+attack*18),-1]],'#756069',13);claws(side<0?-49-attack*18:30+attack*18,-1);}
  fur(-2,-48,20,29,'#4b3b43');poly([[-18,-65],[-25,-88],[-8,-76]],'#857279');poly([[9,-71],[18,-87],[19,-65]],'#857279');
  ell(13,-59,16,11,'#ae8991');ell(20,-59,4,2,'#6c4956');ell(10,-59,3,2,'#6c4956');eye(4,-71,4,'#d9be68');poly([[0,-51],[1,-39],[7,-49]],'#d4c3a2');poly([[21,-49],[27,-39],[27,-53]],'#d4c3a2');
  line([[-17,-34],[-4,-30],[5,-24],[12,-27]],'#bca995',2);for(const side of [-1,1])for(let i=0;i<4;i++)ell(side*(31+attack*13),-18+i*3,4,2,'#aaa59d');
  if(phase>=3){ctx.strokeStyle='#553457';for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-22+i*9,-42);ctx.bezierCurveTo(-40+i*9,-60,-19+i*6,-70,-32+i*8,-85);ctx.stroke();}}
 }else if(shape==='deer'){
  for(const side of [-1,1]){line([[side*13,-12],[side*(21+gait*5),7]],'#888c89',9);poly([[side*17,4],[side*30,11],[side*12,11]],'#5c6261');}
  fur(-3,-9,27,59,grad);fur(-2,-50,22,29,'#bbbeb6');
  for(const side of [-1,1]){line([[side*22,-43],[side*(37+attack*12),-18]],'#969d99',12);claws(side<0?-48-attack*12:32+attack*12,-19);antler(side,side*14,-77,.86);}
  eye(6,-65,11,'#a8bdc4');poly([[-8,-48],[15,-49],[20,-42],[5,-36],[-12,-40]],'#41494b');for(let i=0;i<5;i++)poly([[-8+i*5,-47],[-6+i*5,-41],[-4+i*5,-47]],'#d3d4bf');
  for(let i=0;i<8;i++)line([[-20+i*6,-35],[-17+i*6,-16]],'#d1d0c4',1);
 }else if(shape==='varg'||shape==='hound'){
  const small=shape==='hound';ctx.save();if(small)ctx.scale(.56,.56);
  const howl=u.atk?.def.dstPower==='howl';ell(-3,-22,35,21,grad);fur(-7,-24,26,28,'#a4a197');
  for(const x of [-23,18]){line([[x,-20],[x+gait*6,3]],'#87847c',8);ell(x+gait*6+4,5,10,4,'#706e69');}
  poly([[-30,-26],[-51,-32],[-49,-18],[-60,-12],[-44,-8],[-31,-18]],'#a3a098');
  ctx.save();ctx.translate(24,-30);ctx.rotate(howl?-.8:0);fur(0,6,18,34,'#bcb8ae');poly([[-10,-19],[-14,-41],[-1,-29]],'#b6b3aa');poly([[7,-22],[13,-40],[19,-19]],'#b6b3aa');ell(15,-4,20,10,grad);ell(31,-5,6,5,'#39383a');eye(7,-16,4,'#d0bd83');poly([[0,3],[27,2],[22,11],[5,12]],'#4b3d42');for(let i=0;i<5;i++)poly([[3+i*5,3],[6+i*5,10],[8+i*5,3]],'#e0d5b9');ctx.restore();ctx.restore();
 }else if(shape==='lavae'){
  ell(-3,-8,17,9,grad);for(let i=0;i<4;i++){ell(-13+i*7,-10-i,6,7,i%2?'#c85629':'#ed9544');line([[-13+i*7,-3],[-15+i*7,2]],'#513529',2);}ell(13,-15,9,9,'#e4984f');eye(15,-17,3,'#e3c16c');poly([[10,-20],[8,-29],[17,-23]],'#f0bb59');
 }else if(shape==='leech'){
  ctx.beginPath();ctx.moveTo(-17,1);ctx.bezierCurveTo(-22,-17,-2,-6,7,-17);ctx.bezierCurveTo(20,-25,25,-6,7,1);ctx.closePath();ctx.fillStyle=grad;ctx.fill();ctx.stroke();ell(15,-12,8,5,'#2b1b30');for(let i=0;i<4;i++)poly([[10+i*3,-15],[12+i*3,-9],[14+i*3,-15]],'#bba9bd');
 }else if(shape==='egg'||shape==='eyeEgg'){
  const R=shape==='egg'?19:10;for(let i=0;i<7;i++)line([[-R-6+i*5,4],[-R+4+i*4,-2]],'#7e7257',2);ell(0,-R*.9,R,R*1.25,grad);for(let i=0;i<6;i++)ell(Math.sin(i*6)*R*.65,-R*.8+Math.cos(i*4)*R*.8,R*.13,R*.18,'#86816a');if(u.dstHatchAt-G.time<10)line([[-R*.5,-R*1.7],[0,-R],[R*.3,-R*.8],[0,-R*.3]],'#514b43',2);
 }
 ctx.restore();
}
function drawDSTEffects(){ctx.save();for(const e of dstWorld().effects){const f=clamp((e.until-G.time)/.65,0,1),fire=/fire|lava|enrage/.test(e.kind);ctx.globalAlpha=f*.7;ctx.strokeStyle=fire?'#e9a353':/freeze/.test(e.kind)?'#b1dee7':'#baa9b1';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y*SQ-4,e.r*(1-f*.6),e.r*.45*(1-f*.6),0,0,TAU);ctx.stroke();if(/slam|stomp/i.test(e.kind))for(let i=0;i<6;i++){const a=i*TAU/6;ctx.beginPath();ctx.moveTo(e.x,e.y*SQ);ctx.lineTo(e.x+Math.cos(a)*e.r*(1-f),e.y*SQ+Math.sin(a)*e.r*.45*(1-f));ctx.stroke();}}ctx.restore();}
