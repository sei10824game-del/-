function blob(x, y, rx, ry, col, hi) {
  ctx.fillStyle = col;
  if (G.quality !== 'low' && rx > 1.2 && ry > 1.2 && visualOpaqueColor(col)) {
    const g = ctx.createRadialGradient(x - rx * .32, y - ry * .38, 0, x, y, Math.max(rx, ry));
    g.addColorStop(0, shade(col, .18)); g.addColorStop(.5, col); g.addColorStop(1, shade(col, -.36));
    ctx.fillStyle = g;
  }
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill();
  if(G.quality!=='low'&&rx>2.5&&ry>2.5&&visualOpaqueColor(col)){ctx.save();ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=.6;ctx.stroke();ctx.restore();}
  if (hi) { ctx.fillStyle = hi; ctx.beginPath(); ctx.ellipse(x - rx * .25, y - ry * .35, rx * .4, ry * .35, 0, 0, TAU); ctx.fill(); }
}
