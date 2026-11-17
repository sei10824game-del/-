/* Hand-painted native canvas silhouettes; no sprite/image dependencies. */
function drawHalberdUnit(u,pose){
 const c=u.pal?.skin||u.sp.pal.skin,shape=u.sp.hbShape||'ship',r=u.r,tm=G.time,attack=u.atk?Math.sin(Math.min(1,u.atk.t/Math.max(.01,u.atk.def.dur))*Math.PI):0;ctx.save();ctx.translate(u.x,u.y*SQ-(u.z||0));ctx.scale(renderFacing(u),1);
 const ellipse=(x,y,rx,ry,col)=>{ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();ctx.strokeStyle='#25283b';ctx.lineWidth=1;ctx.stroke();};
 const poly=(points,col)=>{ctx.fillStyle=col;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.strokeStyle='#25283b';ctx.lineWidth=1;ctx.stroke();};
 const line=(x,y,xx,yy,col,w=2)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.stroke();};
 if(shape==='ship'){
  const wing=Math.sin(tm*2)*4;
  for(const side of [-1,1]){ctx.save();ctx.scale(side,1);poly([[-34,-9],[-65,-45+wing],[-92,-56+wing],[-82,-20],[-100,-3],[-65,-8],[-43,12]],'#4a426b');poly([[-20,-13],[-46,-35-wing],[-66,-39-wing],[-57,-14],[-72,0],[-34,3]],'#655a89');ctx.restore();}
  ellipse(0,5,65,23,'#343f58');poly([[-60,4],[-43,-20],[30,-24],[73,-3],[61,15],[-40,21]],'#7d8a9f');
  poly([[-48,-18],[-14,-31],[38,-26],[60,-6],[-27,-2]],'#a5b0bf');for(let i=0;i<7;i++){ellipse(-35+i*12,10,4,3,'#d5c983');line(-35+i*12,0,-30+i*12,-9,'#4b5468');}
  ellipse(44,-3,25,22,'#adb8cc');poly([[23,-17],[43,-8],[64,-16],[58,2],[30,5]],'#3b405b');line(36,-5,42,-7,'#fff19a',3);line(49,-7,56,-6,'#fff19a',3);poly([[37,14],[44,5],[50,14]],'#666a85');
  poly([[-19,-24],[-12,-45],[11,-45],[20,-25]],'#62748a');ctx.fillStyle='#cad5df';ctx.fillRect(-11,-41,22,7);ctx.fillStyle='#394658';ctx.fillRect(-8,-39,5,4);ctx.fillRect(3,-39,5,4);line(0,-45,0,-61,'#9fa9bf',2);poly([[1,-60],[18,-55],[1,-49]],'#52436c');
  for(const x of [-29,17]){ellipse(x,-22,12,6,'#58657c');line(x,-24,x+22+attack*8,-28,'#b2bfcc',6);ellipse(x+23+attack*8,-28,3,4,'#252b40');}
  for(const x of [-55,-35]){ellipse(x,24,13,5,'#3a3e55');ellipse(x-9,25,7+Math.sin(tm*20)*2,3,'#b3cbee');}
  line(-44,17,22,19,'#bec6d3',2);ctx.restore();return;
 }
 ctx.scale(u.sp.scale*u.sizeMul,u.sp.scale*u.sizeMul);const R=r/Math.max(1,u.sp.scale);let bob=Math.sin(tm*6+u.id)*1.2;ctx.translate(0,bob);
 if(['cannon','reactor'].includes(shape)){
  poly([[-R*1.1,8],[-R*1.2,-15],[R*.9,-19],[R*1.3,5],[R,12],[-R,12]],'#59667b');ellipse(0,-5,R*.75,12,c);for(let i=-1;i<=1;i++){ctx.fillStyle='#d1b27a';ctx.fillRect(i*R*.6-2,3,4,4);}
  if(shape==='cannon'){ellipse(0,-20,12,6,'#a0aabc');line(0,-20,27+attack*5,-24,'#c1c9d0',7);ellipse(28+attack*5,-24,4,4,'#272d3e');line(5,0,29,0,'#c7b07d',6);ellipse(30,0,5,5,'#796aa1');line(-15,-5,-26,-16,'#a6abb4',5);line(-26,-16,-34,-9,'#a6abb4',4);poly([[-37,-12],[-29,-11],[-31,-4]],'#b9bec9');}
  else{ellipse(0,-5,10,10,'#4b434e');ellipse(0,-5,6,6,'#f4c680');line(-25,-17,-13,-20,'#c6c6ae',5);poly([[8,-21],[18,-28],[24,-20],[15,-12]],'#cabaa5');ellipse(18,-21,3,3,'#b0d6e1');}
  ctx.restore();return;
 }
 if(shape==='lobster'){
  for(const side of [-1,1])for(let i=0;i<3;i++){line(side*R*.6,1+i*3,side*(R+5),7+i*3,'#9c7735',3);line(side*(R+5),7+i*3,side*(R+8),12+i*2,'#d6c17a',2);}
  ellipse(0,-3,R,12,c);for(let i=0;i<3;i++)line(-R*.7,3+i*3,R*.7,3+i*3,'#9a7837',1);ellipse(0,-14,R*.8,8,'#d0b566');
  for(const side of [-1,1]){line(side*R*.7,-10,side*(R+7+attack*7),-18,'#a18345',5);ellipse(side*(R+10+attack*7),-20,8,5,c);poly([[side*(R+11+attack*7),-24],[side*(R+20+attack*7),-28],[side*(R+17+attack*7),-18]],'#e3ca85');ellipse(side*R*.4,-16,3,3,'#a72b36');}ctx.restore();return;
 }
 if(shape==='wheel'){ellipse(0,-3,14,14,'#292b38');ellipse(0,-3,9,9,c);ellipse(0,-3,4,4,'#b9c2cb');for(let i=0;i<8;i++){let a=i*TAU/8+tm*7;line(Math.cos(a)*10,-3+Math.sin(a)*10,Math.cos(a)*13,-3+Math.sin(a)*13,'#8a8e9a',2);}ellipse(8,-10,4,5,'#fff0d3');ellipse(10,-10,2,3,'#302b40');ctx.restore();return;}
 if(shape==='gordo'){for(let i=0;i<12;i++){const a=i*TAU/12;poly([[Math.cos(a-.2)*10,-5+Math.sin(a-.2)*10],[Math.cos(a)*18,-5+Math.sin(a)*18],[Math.cos(a+.2)*10,-5+Math.sin(a+.2)*10]],'#bdc6cc');}ellipse(0,-5,11,11,c);}
 else if(shape==='rock')poly([[-13,7],[-13,-8],[-5,-17],[8,-15],[15,-4],[10,8]],c);
 else if(shape==='wisp'){ellipse(0,-5,13+Math.sin(tm*7)*2,14,c);for(let i=0;i<5;i++){let a=tm*3+i*TAU/5;ellipse(Math.cos(a)*16,-5+Math.sin(a)*16,2,3,'#e0f3bd');}}
 else{
  ellipse(-7,9,7,4,shape==='sailor'?'#ad6c4e':'#6c5872');ellipse(7,9,7,4,shape==='sailor'?'#ad6c4e':'#6c5872');
  if(shape==='bird'){for(const side of [-1,1])poly([[side*8,-10],[side*24,-19+Math.sin(tm*12)*7],[side*20,-3],[side*8,2]],shade(c,-.15));}
  if(shape==='bug'){poly([[-5,-15],[-16,-28],[-4,-24],[0,-16],[4,-24],[16,-28],[5,-15]],'#c4c697');}
  ellipse(0,-3,R+2,14,c);
 }
 if(['axe','mace','trident','javelin','sword','helmet','ninja'].includes(shape)){
  ellipse(0,-10,12,11,shade(c,.1));poly([[-9,-13],[0,-8],[9,-13],[7,-4],[-7,-4]],'#353647');line(-6,-9,-2,-9,'#f8e59c',2);line(2,-9,6,-9,'#f8e59c',2);
  if(shape==='axe'){poly([[-10,-15],[-15,-25],[-5,-19]],'#d2c1a2');poly([[10,-15],[15,-25],[5,-19]],'#d2c1a2');ellipse(0,-17,3,3,'#dcd8c6');}
  if(shape==='trident')poly([[-8,-17],[-11,-29],[0,-21],[11,-29],[8,-17]],'#e0c877');
  const wx=16+attack*15;line(12,-4,wx,-20,'#c2a46d',3);
  if(shape==='axe')poly([[wx,-25],[wx+12,-24],[wx+13,-14],[wx,-16]],'#bec3ca');
  else if(shape==='mace'){line(10,-4,wx+7,-23,'#c2c6ce',2);ellipse(wx+9,-25,9,9,'#989aa6');for(let i=0;i<6;i++){let a=i*TAU/6;poly([[wx+9+Math.cos(a)*8,-25+Math.sin(a)*8],[wx+9+Math.cos(a+.2)*13,-25+Math.sin(a+.2)*13],[wx+9+Math.cos(a+.4)*8,-25+Math.sin(a+.4)*8]],'#c4c5cb');}}
  else if(shape==='trident'){line(wx,-20,wx,-35,'#d8d4d6');line(wx-6,-29,wx+6,-29,'#d8d4d6');line(wx-6,-29,wx-6,-35,'#d8d4d6');line(wx+6,-29,wx+6,-35,'#d8d4d6');}
  else poly([[wx-3,-20],[wx,-38],[wx+4,-20]],'#e0dfc5');
 }else if(shape==='vul'){poly([[-14,-17],[-12,-25],[13,-25],[15,-17]],'#4a527a');ctx.fillStyle='#d2c2a3';ctx.fillRect(-15,-18,30,3);poly([[9,-9],[24,-5],[10,-2]],'#b49b6a');ellipse(-3,-8,3,4,'#fff1cf');line(-11,-23,11,-23,'#b8a572',2);}
 else if(shape==='sailor'){ellipse(0,-17,12,5,'#dfe7de');ctx.fillStyle='#5b779e';ctx.fillRect(-8,-19,16,2);poly([[-8,4],[0,9],[8,4],[0,1]],'#dfe6e1');}
 else if(shape==='poppy'){poly([[-12,-13],[-9,-24],[10,-21],[12,-13]],'#cfdbd9');ellipse(12,-22,4,4,'#d5b654');ellipse(17,-2,7,7,'#3b3c4c');line(18,-9,21,-14,'#bb915c');}
 else if(shape==='chef'){for(let i=-1;i<=1;i++)ellipse(i*7,-24,7,7,'#e6e5df');ctx.fillStyle='#ddd9d0';ctx.fillRect(-12,-24,24,8);ellipse(17,-8,6,3,'#bbc4ca');line(12,0,17,-8,'#8f7662',2);}
 else if(shape==='frosty'){ellipse(-7,-16,4,6,'#8fc1d2');ellipse(7,-16,4,6,'#8fc1d2');ellipse(0,0,8,9,'#e4eee4');}
 else if(shape==='flame'){poly([[-11,-12],[-16,-23],[-6,-21],[-2,-33],[5,-22],[13,-27],[10,-10]],'#ebad42');}
 else if(shape==='jet'){ellipse(0,-15,10,8,'#bbced1');ellipse(1,-15,6,4,'#384957');poly([[-9,2],[-17,9],[-13,-5]],'#db9c5f');}
 else if(shape==='bomb'){line(0,-17,5,-24,'#b9a46e',2);ellipse(5,-25,3,3,'#f4cc63');ellipse(0,-3,11,10,'#545365');}
 else if(shape==='sleep'){poly([[-12,-13],[-3,-29],[12,-15]],'#758bba');ellipse(-4,-28,3,3,'#e7e5d3');}
 else if(shape==='broom'){line(12,6,19,-22,'#a58b60',2);poly([[9,7],[18,9],[21,-2],[12,-4]],'#d5c58b');poly([[-12,-16],[0,-34],[12,-16]],'#92769f');}
 else if(shape==='fighter'){poly([[-12,-14],[-5,-23],[5,-19],[13,-23],[11,-12]],'#d4bf83');line(-11,-14,11,-14,'#d65d62',3);for(const side of [-1,1]){line(side*9,-3,side*(16+attack*10),-5,'#d7c3a3',4);ellipse(side*(17+attack*10),-6,5,5,'#e1ccaa');}poly([[-9,2],[-9,8],[9,8],[9,2]],'#43728f');}
 else if(shape==='scarfy'){for(const side of [-1,1])poly([[side*5,-13],[side*12,-24],[side*13,-7]],'#e1b08d');if(u.tgt){ellipse(0,-2,8,5,'#653341');for(let i=-1;i<=1;i++)poly([[i*4-2,-5],[i*4,-1],[i*4+2,-5]],'#e6dabb');}}
 else if(shape==='robot'){poly([[-10,-15],[-8,-23],[8,-23],[11,-15]],'#b1b9d1');ctx.fillStyle='#4e536e';ctx.fillRect(-7,-18,14,5);line(11,-3,23,-3,'#aaa1ad',1);ellipse(24,-3,5,5,'#e1c576');}
 else if(shape==='mic'){ellipse(0,-14,10,10,'#a3bcc0');for(let i=-1;i<=1;i++)line(-7,-17+i*3,7,-17+i*3,'#556470');}
 else if(shape==='sweeper'){ellipse(0,-8,15,8,'#b4bdc5');line(-9,-17,9,-17,'#a6b1b8',3);ellipse(0,-8,8,4,'#444c65');}
 if(!['axe','mace','trident','javelin','sword','helmet','ninja','vul','mic','sweeper','jet'].includes(shape)){
  if(shape==='doo'){ellipse(0,-8,7,8,'#f0e9d7');ellipse(0,-7,3,5,'#333243');}
  else if(shape==='sleep'){line(-7,-9,-2,-9,'#383444');line(2,-9,7,-9,'#383444');}
  else for(const side of [-1,1]){ellipse(side*4,-9,2,4,'#f1e7cd');ellipse(side*4,-8,1,3,'#343144');}
 }
 ctx.restore();
}
function drawHalberdEffects(){const w=hbWorld();ctx.save();for(const p of w.shots){const s={x:p.x,y:p.y*SQ};ctx.save();ctx.translate(s.x,s.y-8);ctx.rotate(Math.atan2(p.vy,p.vx));const power=p.d.hbPower;if(power==='laser'||power==='reflectLaser'){ctx.strokeStyle='#c1e6ff';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-16,0);ctx.lineTo(12,0);ctx.stroke();}else{ctx.fillStyle=p.bomb?'#666879':power==='ice'?'#a6e8ed':'#e8c98a';ctx.beginPath();ctx.ellipse(0,0,p.returning?9:5,5,0,0,TAU);ctx.fill();}ctx.restore();}for(const e of w.effects){const s={x:e.x,y:e.y*SQ};ctx.globalAlpha=Math.max(0,(e.until-G.time)*2);ctx.strokeStyle=e.kind==='paint'?'#e2b459':'#f3d590';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(s.x,s.y-8,18,10,0,0,TAU);ctx.stroke();}ctx.restore();}
