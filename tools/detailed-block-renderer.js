function drawFacingBlock(x,y,w,h,depth,d,front,side,top){
 // Shared directional geometry: used by Minecraft, golems, EXE and new factions.
 // Recessed edge lighting follows the object's three planes, not the screen.
 ctx.fillStyle=side;ctx.fillRect(x-w/2,y-h,w,h);
 ctx.fillStyle=front;ctx.beginPath();ctx.moveTo(x+d*w/2,y-h);ctx.lineTo(x+d*(w/2+depth),y-h-depth*.4);ctx.lineTo(x+d*(w/2+depth),y-depth*.4);ctx.lineTo(x+d*w/2,y);ctx.closePath();ctx.fill();
 ctx.fillStyle=top;ctx.beginPath();ctx.moveTo(x-w/2,y-h);ctx.lineTo(x+w/2,y-h);ctx.lineTo(x+w/2+d*depth,y-h-depth*.4);ctx.lineTo(x-w/2+d*depth,y-h-depth*.4);ctx.closePath();ctx.fill();
 if(G.quality==='low'||w<5)return;
 ctx.save();const edge=Math.max(.5,Math.min(1.5,w*.035));ctx.lineWidth=edge;
 ctx.strokeStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.moveTo(x-w/2,y-h);ctx.lineTo(x-w/2,y);ctx.lineTo(x+w/2,y);ctx.lineTo(x+d*(w/2+depth),y-depth*.4);ctx.stroke();
 ctx.strokeStyle='rgba(255,255,255,.24)';ctx.beginPath();ctx.moveTo(x-w/2+edge,y-h+edge);ctx.lineTo(x+w/2-edge,y-h+edge);ctx.moveTo(x+d*w/2,y-h+edge);ctx.lineTo(x+d*w/2,y-edge);ctx.stroke();
 ctx.strokeStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.moveTo(x-w/2+edge,y-edge*2);ctx.lineTo(x+w/2-edge,y-edge*2);ctx.stroke();ctx.restore();
}
