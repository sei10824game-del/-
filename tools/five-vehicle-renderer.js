/* Side profiles are drawn in drawFiveUnit's facing transform. No hitbox scaling. */
function drawFiveVehicleProfile(u,shape,S,walk){
 const a=u.atk,ad=a?.def,at=a?.t||0,aw=Math.max(.001,ad?.windup||.5),wind=a&&u.state==='attack'&&at<aw?Math.sin(at/aw*Math.PI/2):0,flash=a&&u.state==='attack'&&at>=aw?Math.exp(-(at-aw)/.16):0,moving=u.moveSpd>4;
 const k=u.key,cv=u.fac==='cv',purple=cv?'#685482':'#6d4542',metal=cv?'#a49ab9':'#927d72';
 if(shape==='aircraft'||cv){ctx.translate(0,Math.sin(G.time*2.4+u.id)*S*.025);if(shape==='aircraft')ctx.rotate((moving?Math.sin((u.gait||0)*.5)*.025:0)-flash*.018);}
 const ell=(x,y,rx,ry,c)=>blob(x*S,y*S,rx*S,ry*S,c);
 const rod=(x,y,a,b,w,c)=>limb({x:x*S,y:y*S},{x:a*S,y:b*S},w*S,w*S*.85,c);
 const plate=(points,c)=>{ctx.fillStyle=visualMaterial(c,-S*1.4,-S*1.7,S*3,S*1.7);ctx.strokeStyle='#292734';ctx.lineWidth=S*.035;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x*S,y*S):ctx.moveTo(x*S,y*S));ctx.closePath();ctx.fill();ctx.stroke();};
 const port=(x,y,r=.08)=>{ell(x,y,r*1.3,r*1.3,'#29333c');ell(x+.015,y-.015,r,r,flash>.1?'#e1faff':'#8ae7e7');if(wind||flash){ctx.save();ctx.globalAlpha*=Math.min(.8,wind*.3+flash*.7);ctx.strokeStyle='#b8f6ff';ctx.lineWidth=S*.02;ctx.beginPath();ctx.ellipse(x*S,y*S,r*S*(1.5+flash),r*S*(1.5+flash),0,0,TAU);ctx.stroke();ctx.restore();}};
 const hatch=(x,y,w,h)=>drawFacingBlock(x*S,y*S,w*S,h*S,S*.12,1,metal,'#39384c','#c2b9ce');
 if(shape==='tank'){
  if(cv){
   // Broad floating hull, split front armor, high mortar instead of a straight pole.
   ell(-.15,-.46,1.12,.36,purple);ell(-.4,-.82,.7,.36,'#8e7a9d');
   plate([[-1.1,-.63],[-.45,-.8],[.78,-.67],[1.12,-.3],[.3,-.35],[-.75,-.26]],'#58466e');
   plate([[-.95,-.95],[-.22,-1.06],[.37,-.75],[-.64,-.64]],'#a490b0');
   ell(.1,-1.02,.46,.28,'#776188');
   if(k.includes('anti_air'))for(const side of [-1,1]){rod(.25,-1.13+side*.09,.94,-1.2+side*.09,.075,'#aaa1b4');port(.98,-1.2+side*.09,.065);}
   else{rod(.16,-1.1,.48,-1.4,.12,'#ad9bb5');rod(.48,-1.4,.75,-1.36,.13,'#887298');port(.8,-1.36,.095);}
   port(-.93,-.44);port(.83,-.5,.06);
  }else{
   // Tracked demon machinery: side treads, frontal armor and heavy bore.
   ell(-.05,-.27,.99,.25,'#332c2d');for(let i=0;i<6;i++){const wx=-.77+i*.3;ell(wx,-.25,.15,.15,'#70635c');const aa=(moving?u.gait||0:0)+i*.4;rod(wx-Math.cos(aa)*.1,-.25-Math.sin(aa)*.1,wx+Math.cos(aa)*.1,-.25+Math.sin(aa)*.1,.025,'#afa08b');}
   ctx.save();ctx.beginPath();ctx.ellipse(-.05*S,-.27*S,.99*S,.25*S,0,0,TAU);ctx.clip();for(let i=0;i<12;i++){const xx=-1+((i*.18+(moving?(u.gait||0)*.05:0))%2.16);rod(xx,-.5,xx+.045,-.39,.035,'#8b8070');rod(xx,-.13,xx+.045,-.02,.035,'#8b8070');}ctx.restore();
   hatch(0,-.4,1.7,.42);ell(-.2,-1,.6,.4,purple);hatch(.12,-.8,.8,.4);rod(.18,-1.05,1.05,-1.03,.17,'#8c7e75');ell(1.08,-1.03,.1,.14,'#29242c');
   if(k==='dm_sabaoth'){ell(-.17,-1.35,.25,.35,'#a88c7a');ell(-.1,-1.7,.2,.24,'#bbaa92');port(.02,-1.71,.035);}
  }return true;
 }
 if(shape==='vehicle'){
  if(k==='cv_brute_chopper'){
   ell(.68,-.42,.44,.43,'#34313a');ell(.69,-.43,.27,.27,'#817a83');
   for(let i=0;i<8;i++){const a=i*TAU/8+(u.gait||0);rod(.68+Math.cos(a)*.28,-.42+Math.sin(a)*.28,.68+Math.cos(a)*.4,-.42+Math.sin(a)*.4,.04,'#aca2a8');}
   plate([[-1,-.6],[-.36,-.9],[.66,-.77],[.45,-.33],[-.7,-.3]],'#6a5b68');hatch(-.4,-.7,.34,.5);rod(.1,-.77,.65,-.83,.08,metal);
  }else{
   const transport=k.includes('spectre')||k.includes('prowler');ell(-.2,-.55,transport?1.1:.7,.3,purple);
   plate([[-.8,-.7],[-.3,-.95],[.7,-.72],[.98,-.42],[.26,-.38],[-.48,-.4]],'#8b769f');
   ell(.12,-.85,.33,.19,'#383e53');
   for(const side of [-1,1]){ell(.62,-.27+side*.2,.46,.15,'#564366');rod(.65,-.34+side*.19,1.02,-.36+side*.19,.055,metal);port(1.07,-.36+side*.19,.045);}
   if(transport){hatch(-.56,-.45,.55,.24);port(-.96,-.53,.055);}else port(-.65,-.6,.06);
  }return true;
 }
 if(shape==='aircraft'){
  ctx.save();ctx.globalAlpha*=.3;ctx.fillStyle='#91dfff';const len=.15+(moving?.24:0)+Math.sin(G.time*11+u.id)*.04;ctx.beginPath();ctx.moveTo(-.8*S,-1*S);ctx.quadraticCurveTo(-(1.1+len)*S,-.85*S,-.85*S,-.68*S);ctx.closePath();ctx.fill();ctx.restore();
  if(k.includes('spirit')){
   for(const side of [-1,1]){const y=-.73+side*.24;ell(-.12,y,1.27,.22,purple);hatch(-.1,y+.04,1.7,.27);port(-1.22,y,.08);}
   plate([[-.7,-1.18],[-.4,-1.38],[.1,-1.24],[.34,-.64],[-.14,-.58]],'#a28eae');ell(.62,-.86,.3,.18,'#6c6c8a');
  }else if(k.includes('phantom')||k.includes('lich')||!cv){
   ell(-.13,-.8,1.25,.44,purple);ell(.52,-.95,.57,.34,'#9b86a8');
   plate([[-1.2,-.87],[-.5,-1.3],[.3,-1.23],[.94,-.83],[.66,-.63],[-.7,-.57]],purple);
   for(let i=0;i<4;i++)hatch(-.75+i*.35,-.57,.23,.2);ell(.68,-1.01,.23,.12,'#52657a');
   rod(.53,-.56,.64,-.29,.075,metal);port(.67,-.3,.06);port(-1.11,-.83,.085);
  }else{
   // Fighter: swept curved wings, leading canopy, aft engine. No identical star.
   for(const side of [-1,1])plate([[-.88,-.84],[-1.22,-1.38-side*.13],[-.34,-1.1],[.58,-.77],[.16,-.59]],side<0?'#44384f':'#8a749a');
   ell(.05,-.83,.79,.27,purple);ell(.4,-.99,.36,.2,'#b0a0bd');ell(.52,-1.04,.22,.1,'#59738a');
   rod(.4,-.7,1.02,-.71,.06,metal);port(1.05,-.71,.05);port(-.7,-.82,.08);
   if(k==='cv_seraph'){plate([[-.7,-.82],[-.23,-1.55],[.55,-1.14],[.87,-.8]],'#78628c');port(.25,-1.27,.07);}
  }return true;
 }
 return false;
}
