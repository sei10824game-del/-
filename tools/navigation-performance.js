/* Exact sample/grid semantics; no cross-call wall cache or path throttling. */
function findPath(sx, sy, tx, ty, radius) {
  const m = G.map;
  const rad = navigationRadius({r:radius||9});
  let s = nearestWalkT(Math.floor(sx / TILE), Math.floor(sy / TILE));
  let g = nearestWalkT(Math.floor(tx / TILE), Math.floor(ty / TILE));
  if (!s || !g) return null;
  const N = m.w * m.h, sIdx = s.y * m.w + s.x, gIdx = g.y * m.w + g.x;
  if (!bodyClear(tx,ty,rad)) { tx=(g.x+.5)*TILE;ty=(g.y+.5)*TILE; }
  if (sIdx === gIdx) return [{ x: tx, y: ty }];
  PF.gen++;
  const gen = PF.gen, gArr = PF.g, came = PF.came, stamp = PF.stamp, heap = PF.heap;
  heap.length = 0;
  gArr[sIdx] = 0; came[sIdx] = -1; stamp[sIdx] = gen;
  const hFn = (i) => {
    const x = i % m.w, y = (i / m.w) | 0, dx = Math.abs(x - g.x), dy = Math.abs(y - g.y);
    return (dx + dy) + (Math.SQRT2 - 2) * Math.min(dx, dy);
  };
  const sN = { i: sIdx }; sN._f = hFn(sIdx); heap.push(sN);
  let expanded = 0, found = false;
  while (heap.length) {
    const cur = PF.hpop();
    const ci = cur.i;
    if (stamp[ci] === -gen) continue;   // closed（負数で管理）
    if (ci === gIdx) { found = true; break; }
    stamp[ci] = -gen;
    if (++expanded > 14000) break;
    const cx = ci % m.w, cy = (ci / m.w) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = cx + dx, ny = cy + dy;
      // navigationRadius <= .42*TILE: a tile-center footprint stays inside that tile.
      if (nx<0||ny<0||nx>=m.w||ny>=m.h||m.walk[ny*m.w+nx]!==1) continue;
      if (dx && dy && (!walkAtT(cx + dx, cy) || !walkAtT(cx, cy + dy))) continue; // 角切り防止
      const ni = ny * m.w + nx;
      if (stamp[ni] === -gen) continue;
      const cost = gArr[ci] + (dx && dy ? Math.SQRT2 : 1);
      if (stamp[ni] !== gen || cost < gArr[ni]) {
        stamp[ni] = gen; gArr[ni] = cost; came[ni] = ci;
        const n = { i: ni }; n._f = cost + hFn(ni);
        heap.push(n); let c = heap.length - 1;
        while (c > 0) { const p = (c - 1) >> 1; if (heap[p]._f <= heap[c]._f) break; [heap[p], heap[c]] = [heap[c], heap[p]]; c = p; }
      }
    }
  }
  if (!found) return null;
  // 経路復元
  const tilePath = [];
  let cur = gIdx;
  while (cur !== -1) { tilePath.push(cur); cur = came[cur]; }
  tilePath.reverse();
  // ストリングプーリング
  const pts = tilePath.map(i => ({ x: ((i % m.w) + .5) * TILE, y: (((i / m.w) | 0) + .5) * TILE }));
  pts.push({ x: tx, y: ty });
  const sm = [];
  let ax = sx, ay = sy, k = 0;
  while (k < pts.length) {
    let best = k;
    for (let j = pts.length - 1; j > k; j--) {
      if (losWalk(ax, ay, pts[j].x, pts[j].y, rad)) { best = j; break; }
    }
    sm.push(pts[best]); ax = pts[best].x; ay = pts[best].y; k = best + 1;
  }
  if (!sm.length) return null;
  return sm;
}

function losWalk(x0, y0, x1, y1, rad) {
  const d=dist(x0,y0,x1,y1),steps=Math.max(1,Math.ceil(d/7)),r=rad||0;
  // The old bodyClear samples a square footprint; for these radii it spans
  // at most four cells. Perpendicular offset checks lie inside that square.
  // Cache only the last footprint WITHIN this call: wall edits are seen by
  // the very next call, even when game time has not advanced.
  if(typeof r==='number'&&r>=0&&r<=TILE*.5){
    const m=G.map,w=m.w,h=m.h,walk=m.walk;let lastA=-1,lastB=-1;
    for(let i=1;i<=steps;i++){
      const t=i/steps,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t;
      const ax=Math.floor((x-r)/TILE),bx=Math.floor((x+r)/TILE),ay=Math.floor((y-r)/TILE),by=Math.floor((y+r)/TILE);
      if(ax<0||ay<0||bx>=w||by>=h)return false;
      const a=ay*w+ax,b=by*w+bx;
      if(a===lastA&&b===lastB)continue;
      if(walk[a]!==1||walk[ay*w+bx]!==1||walk[by*w+ax]!==1||walk[b]!==1)return false;
      lastA=a;lastB=b;
    }
    return true;
  }
  // Keep the original wide/unusual-radius fallback exactly.
  const px=-(y1-y0)/(d||1)*rad,py=(x1-x0)/(d||1)*rad;
  for(let i=1;i<=steps;i++){
    const t=i/steps,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t;
    if(!bodyClear(x,y,rad||0))return false;
    if(rad>3&&(!walkAtPx(x+px,y+py)||!walkAtPx(x-px,y-py)))return false;
  }
  return true;
}
