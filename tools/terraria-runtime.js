const TERRARIA_SLIMES=['slimeG','slimeB','slimeP','pinky'];
SP.kingslime.pal={...SP.kingslime.pal,skin:'#4686d2',skinD:'#245086',skinL:'#96d6f5',blood:'#377ab3'};
SP.slimeG.desc='Terrariaの緑スライム。半透明の丸いゼリー体で跳ねる。';
SP.kingslime.desc='Terrariaのキングスライム。雨の最中にスライム150匹撃破で出現。倒されるまで雨が続く。';
function updateTerrariaRain(dt){
 if(!facOn('O')||G.slimeKingDead||!G.slimeRooms?.length)return;
 if((G.slimeKills||0)>=150&&!G.slimeKing){
  const room=G.map.rooms[G.slimeRooms[0]],p=randWalkIn(room),king=spawnUnit('kingslime',p.x,p.y,{force:true});
  if(king){G.slimeKing=true;king.terrariaRainKing=true;addLog('👑 スライム150匹撃破！ キングスライムが現れた。倒すまで雨は止まらない','O',true);}
 }
 G.slimeRainT=(G.slimeRainT??1)-dt;
 while(G.slimeRainT<=0){G.slimeRainT+=1;
  for(const rid of G.slimeRooms){const room=G.map.rooms[rid];if(!room)continue;for(let i=0;i<2;i++){
   const p=randWalkIn(room),key=rchance(.03)?'pinky':rchance(.3)?'slimeP':rchance(.5)?'slimeB':'slimeG';const u=spawnUnit(key,p.x,p.y,{silent:true,force:true});if(u){u.z=90+Math.random()*50;u.vz=0;u.terrariaFalling=true;}
  }}
 }
}
function terrariaSlimeDeath(u){
 if(u.terrariaDeathCounted)return;u.terrariaDeathCounted=true;
 if(u.terrariaRainKing){G.slimeKingDead=true;addLog('🌧️ キングスライム撃破！ スライムの雨が止んだ','O',true);return;}
 if(TERRARIA_SLIMES.includes(u.key)&&!G.slimeKingDead&&G.slimeRooms?.length){G.slimeKills=(G.slimeKills||0)+1;if(G.slimeKills===150)updateTerrariaRain(0);}
}
function drawTerrariaSlime(u,pose){
 const king=u.key==='kingslime',sc=(u.sizeMul||1)*(u.sp.scale||1),r=Math.max(u.r,(u.sp.r||8)*sc*.65),hop=Math.abs(Math.sin((u.gait||0)*1.3)),squash=(u.moveSpd||0)>3?(1-hop)*.22:.04;
 const x=u.x,y=u.y*SQ-(u.z||0),w=r*(1.15+squash),h=r*(.85-squash*.4+hop*.08),pal=u.pal;
 ctx.save();ctx.globalAlpha*=.87;const g=ctx.createLinearGradient(x,y-h*1.8,x,y);g.addColorStop(0,pal.skinL);g.addColorStop(.6,pal.skin);g.addColorStop(1,pal.skinD);ctx.fillStyle=g;ctx.strokeStyle=pal.skinD;ctx.lineWidth=1.2;
 // Terraria jelly dome: no Dragon Quest point, eyes or smiling mouth.
 ctx.beginPath();ctx.moveTo(x-w,y);ctx.bezierCurveTo(x-w*1.2,y-h*1.3,x-w*.5,y-h*1.8,x,y-h*1.8);ctx.bezierCurveTo(x+w*.65,y-h*1.8,x+w*1.2,y-h*.9,x+w,y);ctx.quadraticCurveTo(x,y+h*.12,x-w,y);ctx.fill();ctx.stroke();
 ctx.fillStyle='rgba(226,249,255,.45)';ctx.beginPath();ctx.ellipse(x-w*.35,y-h*1.2,w*.28,h*.13,-.3,0,TAU);ctx.fill();
 ctx.fillStyle='rgba(225,247,255,.18)';for(let i=0;i<5;i++){const xx=x+(((u.id||0)*13+i*17)%19/19-.5)*w*1.5,yy=y-h*(.3+(i%3)*.3);ctx.fillRect(xx,yy,Math.max(1,r*.06),Math.max(1,r*.07));}
 if(king){
  // The small trapped ninja is visible through the blue gel.
  const s=r*.22;ctx.fillStyle='#30465e';ctx.fillRect(x-s*.5,y-h*.95,s,s*1.5);ctx.fillRect(x-s*.35,y-h*1.2,s*.7,s*.65);ctx.fillStyle='#b5b7b6';ctx.fillRect(x-s*.3,y-h*1.02,s*.6,s*.12);ctx.strokeStyle='#30465e';ctx.lineWidth=s*.26;ctx.beginPath();ctx.moveTo(x-s*.4,y-h*.8);ctx.lineTo(x-s*1.1,y-h*.55);ctx.moveTo(x+s*.4,y-h*.8);ctx.lineTo(x+s*1.1,y-h*.6);ctx.stroke();
  const cy=y-h*1.8,cw=w*.4;ctx.globalAlpha=1;ctx.fillStyle='#e5bc49';ctx.strokeStyle='#916b22';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-cw,cy+5);ctx.lineTo(x-cw,cy-12);ctx.lineTo(x-cw*.5,cy-4);ctx.lineTo(x,cy-19);ctx.lineTo(x+cw*.5,cy-4);ctx.lineTo(x+cw,cy-12);ctx.lineTo(x+cw,cy+5);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#d14c4a';ctx.fillRect(x-3,cy-4,6,6);
 }
 ctx.restore();
}
function renderUnitInView(u,x0,x1,y0,y1){
 const sc=(u.sp?.scale||1)*(u.sizeMul||1),r=Math.max(90,(u.r||10)*sc*2,u.key==='fpeAlice'&&u.form>0?240:0,u.key==='typhoonAdult'?180:0),y=u.y*SQ-(u.z||0),height=Math.max(r,unitTopY(u)||0);
 return u.x+r>=x0&&u.x-r<=x1&&y+r>=y0&&y-height<=y1;
}
function combatNotice(u,o){
 if(!u?.sp||!o?.sp||!unitHasSight(u)||!unitHasHearing(u)||!u.atkList?.length||!hostileTo(u,o)||o.fiveHidden||o.fiveHiding||takenHidden(o))return false;
 const d=dist(u.x,u.y,o.x,o.y);if(o.fiveCloakUntil>G.time&&d>100)return false;
 const contact=d<u.r+o.r+70,loud=o.state==='attack'||(o.moveSpd||0)>35;
 return (contact||loud&&d<230)&&losWalk(u.x,u.y,o.x,o.y,1);
}
