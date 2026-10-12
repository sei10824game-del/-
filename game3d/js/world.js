// 洋館のワールド生成: 3x3の部屋 + 扉口 + 窓 + 家具 + 照明。衝突はXZ平面のAABB。
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { pbr } from './textures.js';

export const ROOM = 10, WALL_H = 3.4, WALL_T = .3, DOOR_W = 2.2, DOOR_H = 2.6;
const TYPES = [['library', 'wood', 'wallpaper'], ['hall', 'marble', 'plaster'], ['bedroom', 'carpet', 'wallpaper'], ['dining', 'wood', 'plaster'], ['lobby', 'marble', 'wallpaper'], ['study', 'wood', 'wallpaper'], ['kitchen', 'marble', 'plaster'], ['gallery', 'carpet', 'plaster'], ['cellar', 'wood', 'plaster']];

export function buildWorld(scene, quality) {
  const colliders = [], rooms = [], flicker = [], walls = {}, windows = [], doorGaps = [];
  const rr = (() => { let s = 1234567; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; })();
  const root = new THREE.Group(); scene.add(root);
  const collect = (mat, geo) => { (walls[mat.uuid] = walls[mat.uuid] || { mat, geos: [] }).geos.push(geo); };
  const box = (mat, x0, y0, z0, x1, y1, z1, uvScale = 3) => { // ワールド座標でUVを張った箱 (タイル連続)
    const w = x1 - x0, h = y1 - y0, d = z1 - z0, g = new THREE.BoxGeometry(w, h, d); g.translate(x0 + w / 2, y0 + h / 2, z0 + d / 2);
    const uv = g.attributes.uv, pos = g.attributes.position, nor = g.attributes.normal;
    for (let i = 0; i < uv.count; i++) { const nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i)); const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i); if (ny > .5) uv.setXY(i, px / uvScale, pz / uvScale); else if (nx > .5) uv.setXY(i, pz / uvScale, py / uvScale); else uv.setXY(i, px / uvScale, py / uvScale); }
    collect(mat, g);
  };
  const wallSolid = (mat, x0, z0, x1, z1, solid = true) => { box(mat, x0, 0, z0, x1, WALL_H, z1); if (solid) colliders.push({ x0, z0, x1, z1 }); };

  const plasterMat = pbr('plaster', [1, 1]), ceilMat = pbr('plaster', [1, 1]);
  const total = ROOM * 3;
  // 外壁 + 内壁 (扉口あり)
  for (let gy = 0; gy < 3; gy++) for (let gx = 0; gx < 3; gx++) {
    const [name, floorK, wallK] = TYPES[gy * 3 + gx], x0 = gx * ROOM, z0 = gy * ROOM, wm = pbr(wallK), fm = pbr(floorK);
    rooms.push({ name, gx, gy, x0, z0, x1: x0 + ROOM, z1: z0 + ROOM, cx: x0 + ROOM / 2, cz: z0 + ROOM / 2 });
    box(fm, x0, -.1, z0, x0 + ROOM, 0, z0 + ROOM, 4); box(ceilMat, x0, WALL_H, z0, x0 + ROOM, WALL_H + .1, z0 + ROOM, 4);
    // 北(z0)・西(x0)の壁: 隣と共有。扉口は部屋の中央
    const edges = [
      { side: 'N', exists: true, outer: gy === 0 }, { side: 'W', exists: true, outer: gx === 0 },
      { side: 'S', exists: gy === 2, outer: true }, { side: 'E', exists: gx === 2, outer: true }];
    for (const e of edges) {
      if (!e.exists) continue;
      const horizontal = e.side === 'N' || e.side === 'S', pos = e.side === 'N' ? z0 : e.side === 'S' ? z0 + ROOM : e.side === 'W' ? x0 : x0 + ROOM;
      const a = horizontal ? x0 : z0, b = a + ROOM, mid = (a + b) / 2, hasDoor = !e.outer || (gx === 1 && gy === 2 && e.side === 'S'); // 玄関
      const wallM = e.outer ? pbr('brick', [1, 1]) : wm, T = WALL_T / 2;
      const seg = (s0, s1, hmin = 0, hmax = WALL_H, solid = true) => {
        if (horizontal) { box(wallM, s0, hmin, pos - T, s1, hmax, pos + T); if (solid) colliders.push({ x0: s0, z0: pos - T, x1: s1, z1: pos + T }); }
        else { box(wallM, pos - T, hmin, s0, pos + T, hmax, s1); if (solid) colliders.push({ x0: pos - T, z0: s0, x1: pos + T, z1: s1 }); }
      };
      if (hasDoor) { seg(a, mid - DOOR_W / 2); seg(mid + DOOR_W / 2, b); seg(mid - DOOR_W / 2, mid + DOOR_W / 2, DOOR_H, WALL_H, false); doorGaps.push({ horizontal, pos, mid }); }
      else if (e.outer) { // 窓: 3つの開口
        const wins = [a + 2, mid, b - 2], ww = 1.4, wb = 1.0, wt = 2.5;
        let cur = a; for (const w of wins) { seg(cur, w - ww / 2); seg(w - ww / 2, w + ww / 2, 0, wb, true); seg(w - ww / 2, w + ww / 2, wt, WALL_H, false); cur = w + ww / 2; windows.push({ horizontal, pos, c: w, ww, wb, wt, side: e.side }); }
        seg(cur, b);
      } else seg(a, b);
    }
  }
  // 外壁の角の柱
  for (const [cx, cz] of [[0, 0], [total, 0], [0, total], [total, total]]) wallSolid(pbr('brick'), cx - .25, cz - .25, cx + .25, cz + .25);

  // 結合してドローコール削減
  for (const k in walls) { const m = new THREE.Mesh(mergeGeometries(walls[k].geos), walls[k].mat); m.castShadow = m.receiveShadow = true; root.add(m); }

  // ---- 窓ガラス (うっすら青) と月明かりの窓光 ----
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x9fb8d8, transparent: true, opacity: .16, roughness: .05, metalness: 0, transmission: 0, emissive: 0x1a2a48, emissiveIntensity: .6, side: THREE.DoubleSide, depthWrite: false });
  const frameMat = pbr('wood', [1, 1]);
  const moon = new THREE.DirectionalLight(0x6f8fd8, 0.55); moon.position.set(total * .4, 40, -20); moon.target.position.set(total / 2, 0, total / 2);
  scene.add(moon, moon.target); // 窓越しに差し込む (壁で遮られる)
  moon.castShadow = true; const sh = moon.shadow; sh.mapSize.set(quality === 'low' ? 1024 : 2048, quality === 'low' ? 1024 : 2048); const sc = sh.camera; sc.left = -total * .8; sc.right = total * .8; sc.top = total * .8; sc.bottom = -total * .8; sc.near = 1; sc.far = 100; sh.bias = -.0004; sh.normalBias = .04;
  for (const w of windows) {
    const gh = w.wt - w.wb, g = new THREE.Mesh(new THREE.PlaneGeometry(w.ww, gh), glassMat);
    g.position.set(w.horizontal ? w.c : w.pos, w.wb + gh / 2, w.horizontal ? w.pos : w.c); if (!w.horizontal) g.rotation.y = Math.PI / 2; root.add(g);
    const fr = new THREE.Mesh(new THREE.BoxGeometry(w.horizontal ? w.ww : .08, .06, w.horizontal ? .08 : w.ww), frameMat), fr2 = new THREE.Mesh(new THREE.BoxGeometry(w.horizontal ? .05 : .08, gh, w.horizontal ? .08 : .05), frameMat);
    fr.position.copy(g.position); fr2.position.copy(g.position); root.add(fr, fr2);
  }

  // ---- 家具 ----
  const woodDark = pbr('wood', [1, 1]).clone(); woodDark.color = new THREE.Color(.55, .38, .26);
  const fabric = new THREE.MeshStandardMaterial({ color: 0x5a1f24, roughness: .95 }), leather = new THREE.MeshStandardMaterial({ color: 0x24160f, roughness: .55 }), brass = new THREE.MeshStandardMaterial({ color: 0xb08a3a, roughness: .3, metalness: 1 }), whiteM = new THREE.MeshStandardMaterial({ color: 0xcfcac0, roughness: .6 });
  const prop = (geo, mat, x, y, z, ry = 0, solid = true) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; root.add(m);
    if (solid) { geo.computeBoundingBox(); const bb = geo.boundingBox, w = (bb.max.x - bb.min.x) / 2, d = (bb.max.z - bb.min.z) / 2, c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)), hx = w * c + d * s, hz = w * s + d * c; colliders.push({ x0: x - hx, z0: z - hz, x1: x + hx, z1: z + hz, prop: m }); }
    return m;
  };
  const rb = (w, h, d, r = .03) => new RoundedBoxGeometry(w, h, d, 3, r);
  const bookshelf = (x, z, ry) => { prop(rb(2.2, 2.6, .4), woodDark, x, 1.3, z, ry); const colors = [0x5a1818, 0x1e3a2a, 0x2a2a5a, 0x5a4a1a, 0x3a2418]; for (let sh = 0; sh < 5; sh++) for (let i = 0; i < 9; i++) { const bk = new THREE.Mesh(rb(.16 + rr() * .06, .38 + rr() * .1, .26, .01), new THREE.MeshStandardMaterial({ color: colors[(i + sh) % 5], roughness: .8 })); const ox = -.95 + i * .22, oy = .3 + sh * .48; const c = Math.cos(ry), s = Math.sin(ry); bk.position.set(x + ox * c + (-.0) * s + s * .06, oy, z - ox * s + c * .06); bk.rotation.y = ry; bk.castShadow = true; root.add(bk); } };
  const table = (x, z, w, d, ry = 0) => { prop(rb(w, .08, d, .02), woodDark, x, .78, z, ry, false); for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const c = Math.cos(ry), s = Math.sin(ry), ox = dx * (w / 2 - .1), oz = dz * (d / 2 - .1); prop(rb(.09, .75, .09, .02), woodDark, x + ox * c + oz * s, .375, z - ox * s + oz * c, ry, false); } colliders.push({ x0: x - w / 2, z0: z - d / 2, x1: x + w / 2, z1: z + d / 2 }); };
  const sofa = (x, z, ry) => { prop(rb(2.2, .45, .9, .08), fabric, x, .25, z, ry); const c = Math.cos(ry), sn = Math.sin(ry); const back = prop(rb(2.2, .6, .22, .08), fabric, x, .65, z, ry, false); back.position.set(x + sn * .34, .65, z + c * .34); };
  const bed = (x, z, ry) => { prop(rb(2.1, .4, 2.4, .04), woodDark, x, .2, z, ry); prop(rb(1.9, .25, 2.1, .1), whiteM, x, .55, z, ry, false); prop(rb(.7, .15, .4, .06), whiteM, x, .75, z - 1, ry, false); prop(rb(2.1, 1.1, .1, .03), woodDark, x, .8, z - 1.2, ry, false); };
  const chandelier = (x, z) => { const g = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(.6, .03, 8, 32), brass); ring.rotation.x = Math.PI / 2; g.add(ring); const chain = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .9), brass); chain.position.y = .45; g.add(chain); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, c = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .16), whiteM), f = new THREE.Mesh(new THREE.SphereGeometry(.045, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffd9a0 })); c.position.set(Math.cos(a) * .6, .09, Math.sin(a) * .6); f.position.set(Math.cos(a) * .6, .2, Math.sin(a) * .6); g.add(c, f); } g.position.set(x, WALL_H - .9, z); root.add(g); };
  const lamp = (x, z, col, intensity, dist, flick) => { const L = new THREE.PointLight(col, intensity, dist, 1.6); L.position.set(x, WALL_H - 1.1, z); root.add(L); if (flick) flicker.push({ L, base: intensity, ph: rr() * 100, mode: flick }); return L; };
  const pillar = (x, z) => { prop(new THREE.CylinderGeometry(.28, .32, WALL_H, 20), pbr('marble', [1, 2]), x, WALL_H / 2, z); };
  const rug = (x, z, w, d) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: 0x3a1418, roughness: 1, bumpScale: 1 })); m.rotation.x = -Math.PI / 2; m.position.set(x, .012, z); m.receiveShadow = true; root.add(m); };
  const picture = (x, y, z, ry, w = 1.1, h = .8) => { const f = new THREE.Mesh(rb(w + .12, h + .12, .06, .02), brass), c = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(rr(), .25, .22), roughness: .9 })); f.position.set(x, y, z); c.position.set(x + Math.sin(ry) * .04, y, z + Math.cos(ry) * .04); f.rotation.y = c.rotation.y = ry; f.castShadow = true; root.add(f, c); };

  for (const r of rooms) {
    const { cx, cz, x0, z0, x1, z1 } = r, isCell = r.name === 'cellar';
    lamp(cx, cz, r.name === 'kitchen' || r.name === 'cellar' ? 0xc8e0ff : 0xffc27a, isCell ? 5 : 11, 15, rr() < .5 ? (rr() < .5 ? 'flick' : 'dying') : 0);
    switch (r.name) {
      case 'library': bookshelf(x0 + .5, cz - 2.5, Math.PI / 2); bookshelf(x0 + .5, cz + 2.5, Math.PI / 2); bookshelf(cx, z0 + .5, 0); bookshelf(cx + 3, z0 + .5, 0); table(cx, cz, 2.4, 1.2); rug(cx, cz, 4, 3); break;
      case 'hall': chandelier(cx, cz); pillar(cx - 3, cz - 3); pillar(cx + 3, cz - 3); pillar(cx - 3, cz + 3); pillar(cx + 3, cz + 3); break;
      case 'bedroom': bed(cx + 2, z0 + 2.4, 0); picture(x0 + .2, 1.9, cz, Math.PI / 2); rug(cx, cz, 4.5, 3.5); break;
      case 'dining': table(cx, cz, 4.2, 1.5); for (let i = -1; i <= 1; i++) for (const sd of [-1, 1]) prop(rb(.5, .9, .5, .05), leather, cx + i * 1.3, .45, cz + sd * 1.15, 0); chandelier(cx, cz); break;
      case 'lobby': sofa(cx - 2, cz + 2, Math.PI); sofa(cx + 2, cz + 2, Math.PI); table(cx, cz, 1.4, 1.4); picture(cx, 2, z0 + .2, 0, 1.6, 1.1); break;
      case 'study': table(cx, cz - 1, 2.2, 1); prop(rb(.6, .6, .6, .06), leather, cx, .3, cz - 2.1); bookshelf(x1 - .5, cz, -Math.PI / 2); picture(x0 + .2, 1.9, cz - 2, Math.PI / 2); break;
      case 'kitchen': prop(rb(4, .95, .8, .03), pbr('metal'), cx, .475, z0 + .8); prop(rb(2.4, .95, 1.2, .03), pbr('metal'), cx, .475, cz); prop(rb(.9, 2, .8, .03), pbr('metal'), x1 - .7, 1, z0 + .9); break;
      case 'gallery': for (let i = -2; i <= 2; i++) picture(cx + i * 1.8, 1.9, z0 + .2, 0, 1.1, 1.4); sofa(cx, cz, 0); break;
      case 'cellar': for (let i = 0; i < 6; i++) prop(new THREE.CylinderGeometry(.4, .4, .9, 16), woodDark, x0 + 1 + (i % 3) * 1, .45, z1 - 1 - Math.floor(i / 3) * 1); break;
    }
  }
  // 玄関ホールの外に出られないよう外壁は閉じている。玄関の扉口は壁際で塞ぐ
  // (玄関 = 南壁の中央) — 外は暗い庭としてフォグで表現
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), pbr('plaster', [60, 60])); ground.rotation.x = -Math.PI / 2; ground.position.set(total / 2, -.12, total / 2); ground.receiveShadow = true; root.add(ground);
  const maxX = total, maxZ = total; // 玄関扉口を塞ぐ重い扉
  const door = { x0: 1.5 * ROOM - DOOR_W / 2, z0: total - .15, x1: 1.5 * ROOM + DOOR_W / 2, z1: total + .15 }; colliders.push(door);
  const doorMesh = new THREE.Mesh(rb(DOOR_W, DOOR_H, .12, .02), woodDark); doorMesh.position.set(1.5 * ROOM, DOOR_H / 2, total); doorMesh.castShadow = true; root.add(doorMesh);

  const spawnPoints = rooms.map(r => ({ x: r.cx + (rr() - .5) * 3, z: r.cz + (rr() - .5) * 3, room: r.name }));
  function update(dt, t) {
    for (const f of flicker) {
      if (f.mode === 'flick') f.L.intensity = f.base * (.75 + Math.sin(t * 7 + f.ph) * .12 + Math.sin(t * 23 + f.ph) * .08);
      else { const s = Math.sin(t * 3.1 + f.ph) + Math.sin(t * 11.7 + f.ph * 2); f.L.intensity = f.base * (s > 1.2 ? .05 : s > .8 ? .4 : .9); }
    }
  }
  return { root, colliders, rooms, spawnPoints, update, total, moon };
}

// 円(半径r)とAABB群の衝突解決 (XZ)
export function resolve(pos, r, colliders, ignore) {
  for (let it = 0; it < 3; it++) for (const c of colliders) {
    if (c === ignore) continue;
    const nx = Math.max(c.x0, Math.min(pos.x, c.x1)), nz = Math.max(c.z0, Math.min(pos.z, c.z1)), dx = pos.x - nx, dz = pos.z - nz, d2 = dx * dx + dz * dz;
    if (d2 < r * r) {
      if (d2 > 1e-8) { const d = Math.sqrt(d2), p = r - d; pos.x += dx / d * p; pos.z += dz / d * p; }
      else { const l = pos.x - c.x0, rgt = c.x1 - pos.x, t = pos.z - c.z0, b = c.z1 - pos.z, m = Math.min(l, rgt, t, b); if (m === l) pos.x = c.x0 - r; else if (m === rgt) pos.x = c.x1 + r; else if (m === t) pos.z = c.z0 - r; else pos.z = c.z1 + r; }
    }
  }
}
