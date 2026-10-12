// アクター(ゾンビ/ヘッドクラブ/生存者)のAIと、モデルの読み込み。専用モデルが無い場合は簡易モデルで代替する。
import * as THREE from 'three';
import { resolve, ROOM } from './world.js';

export const ACTOR_KINDS = ['zombie', 'headcrab', 'human'];
const NAMES = { zombie: 'ヘッドクラブゾンビ', headcrab: 'ヘッドクラブ', human: '生存者' };
const STATS = { zombie: { hp: 140, walk: 1.0, run: 1.9, dmg: 14, reach: 1.25 }, headcrab: { hp: 40, walk: 1.6, run: 3.2, dmg: 6, reach: .6 }, human: { hp: 100, walk: 1.4, run: 3.8, dmg: 0, reach: 0 } };

const GLB = { zombie: ['assets/zombie.glb', 1.85, .4], headcrab: ['assets/headcrab.glb', .35, .25], human: ['assets/human.glb', 1.75, .32] };
async function loadModel(kind, seed) {
  const g = GLB[kind];
  if (g && !new URLSearchParams(location.search).has('nolglb')) { try { const m = await import('./glbmodel.js'); if (await m.glbExists(g[0])) return await m.createGLBModel(g[0], { height: g[1], radius: g[2] }); } catch (e) { console.warn('GLB load failed, using procedural', kind, e.message); } }
  try {
    if (kind === 'zombie') { const m = await import('./characters/zombie.js'); return m.createHeadcrabZombie({ seed }); }
    if (kind === 'headcrab') { const m = await import('./characters/headcrab.js'); return m.createHeadcrab({ seed }); }
  } catch (e) { console.warn('model fallback', kind, e.message); }
  return fallbackModel(kind, seed);
}

function fallbackModel(kind, seed) { // 簡易ヒューマノイド (生存者用 / 専用モデル未読込時の代替)
  const root = new THREE.Group(), skin = new THREE.MeshStandardMaterial({ color: kind === 'zombie' ? 0x6a7a58 : 0xd2a888, roughness: .6 }), cloth = new THREE.MeshStandardMaterial({ color: kind === 'human' ? 0x2a4a6a : 0x3a3030, roughness: .85 }), pant = new THREE.MeshStandardMaterial({ color: 0x24242a, roughness: .9 });
  const mk = (g, m, x, y, z) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; return o; };
  const scale = kind === 'headcrab' ? .3 : 1;
  const hips = new THREE.Group(); hips.position.y = .95; root.add(hips);
  const torso = mk(new THREE.CapsuleGeometry(.2, .45, 6, 14), cloth, 0, .4, 0); hips.add(torso);
  const head = mk(new THREE.SphereGeometry(.14, 20, 16), skin, 0, .92, 0); hips.add(head);
  const limb = (m, x, y, len, r) => { const g = new THREE.Group(); g.position.set(x, y, 0); const l = mk(new THREE.CapsuleGeometry(r, len, 4, 10), m, 0, -len / 2 - r / 2, 0); g.add(l); return g; };
  const aL = limb(cloth, -.27, .62, .5, .06), aR = limb(cloth, .27, .62, .5, .06), lL = limb(pant, -.1, 0, .72, .085), lR = limb(pant, .1, 0, .72, .085);
  hips.add(aL, aR, lL, lR); root.scale.setScalar(scale);
  let ph = Math.random() * 6, dead = 0;
  return {
    root, height: 1.75 * scale, radius: .32 * scale,
    update(dt, s) { ph += dt * (2 + s.speed * 6); const sw = Math.sin(ph) * s.speed * .7; lL.rotation.x = sw; lR.rotation.x = -sw; aL.rotation.x = -sw * .8 - s.attack * 1.2; aR.rotation.x = sw * .8 - s.attack * 1.2; hips.position.y = .95 + Math.abs(Math.sin(ph)) * .03 * s.speed; dead += ((s.dead > 0 ? 1 : 0) - dead) * Math.min(1, dt * 4); root.rotation.x = -dead * 1.5; root.position.y = dead * .15; }
  };
}

function nearestRoom(x, z) { return Math.max(0, Math.min(2, Math.floor(z / ROOM))) * 3 + Math.max(0, Math.min(2, Math.floor(x / ROOM))); }
function doorBetween(a, b) { // 隣り合う部屋の扉口の中心
  const ax = a % 3, ay = a / 3 | 0, bx = b % 3, by = b / 3 | 0;
  return bx !== ax ? { x: Math.max(ax, bx) * ROOM, z: ay * ROOM + ROOM / 2 } : { x: ax * ROOM + ROOM / 2, z: Math.max(ay, by) * ROOM };
}
function route(from, to) { // 部屋グラフ上のBFS → 次に向かう扉口
  const fa = nearestRoom(from.x, from.z), fb = nearestRoom(to.x, to.z); if (fa === fb) return null;
  const prev = new Map([[fa, -1]]), q = [fa];
  while (q.length) { const c = q.shift(); if (c === fb) break; const cx = c % 3, cy = c / 3 | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx > 2 || ny > 2) continue; const n = ny * 3 + nx; if (!prev.has(n)) { prev.set(n, c); q.push(n); } } }
  let cur = fb, nxt = fb; while (prev.get(cur) !== fa && prev.get(cur) !== -1 && prev.has(cur)) { nxt = cur; cur = prev.get(cur); } nxt = cur;
  return doorBetween(fa, nxt);
}
function sees(a, b, colliders) { // XZ線分と壁AABBの交差判定 (扉口は壁が無いので通る)
  const dx = b.x - a.x, dz = b.z - a.z; for (const c of colliders) { if (c.prop) continue; let t0 = 0, t1 = 1; for (const [o, d, lo, hi] of [[a.x, dx, c.x0, c.x1], [a.z, dz, c.z0, c.z1]]) { if (Math.abs(d) < 1e-9) { if (o < lo || o > hi) { t0 = 2; break; } } else { let u = (lo - o) / d, v = (hi - o) / d; if (u > v) [u, v] = [v, u]; t0 = Math.max(t0, u); t1 = Math.min(t1, v); if (t0 > t1) break; } } if (t0 <= t1) return false; }
  return true;
}

export async function makeActor(kind) {
  const st = STATS[kind], model = await loadModel(kind, Math.random() * 1000 | 0), root = new THREE.Group(); root.add(model.root);
  root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const a = {
    kind, name: NAMES[kind], root, model, height: model.height, radius: model.radius, hp: st.hp, dead: false, pos: root.position, yaw: Math.random() * 6.28, speed: 0, state: 'idle', t: Math.random() * 3, atkT: 0, cd: 0, hurt: 0, alerted: 0, tgt: null, wander: null, leap: null,
    damage(n, hp, dir) { if (this.dead) return; this.hp -= n; this.hurt = 1; this.alerted = 8; if (this.kind === 'human') this.state = 'flee'; if (this.hp <= 0) { this.dead = true; this.root.userData.deadT = 0; } else if (kind === 'zombie' && Math.random() < .3) this.stagger = .4; },
    alert(p) { if (!this.dead) this.alerted = Math.max(this.alerted, 6); this.lastKnown = p.clone ? p.clone() : p; },
    update(dt, ctx) {
      const P = ctx.player; this.hurt = Math.max(0, this.hurt - dt * 3); this.cd -= dt; this.alerted -= dt;
      if (this.dead) { this.root.userData.deadT += dt; model.update(dt, { speed: 0, attack: 0, hurt: 0, dead: Math.min(1, this.root.userData.deadT) }); return; }
      if (this.stagger > 0) { this.stagger -= dt; model.update(dt, { speed: 0, attack: 0, hurt: this.hurt, dead: 0 }); return; }
      // 標的選択: プレイヤー or 生存者
      let tgt = null, td = 1e9; const pp = { x: P.pos.x, z: P.pos.z, isPlayer: true };
      if (kind !== 'human') {
        const dP = Math.hypot(pp.x - this.pos.x, pp.z - this.pos.z); const seeP = dP < 16 && sees(this.pos, pp, ctx.colliders) || this.alerted > 0 || dP < 3;
        if (seeP && P.hp > 0) { tgt = pp; td = dP; }
        for (const o of ctx.actors) { if (o.kind !== 'human' || o.dead) continue; const d = Math.hypot(o.pos.x - this.pos.x, o.pos.z - this.pos.z); if (d < 12 && d < td && sees(this.pos, o.pos, ctx.colliders)) { tgt = { x: o.pos.x, z: o.pos.z, actor: o }; td = d; } }
      } else { // 生存者: 近い怪物から逃げる
        let th = null, thd = 11; for (const o of ctx.actors) { if (o.kind === 'human' || o.dead) continue; const d = Math.hypot(o.pos.x - this.pos.x, o.pos.z - this.pos.z); if (d < thd) { thd = d; th = o; } }
        if (th) { const ax = this.pos.x - th.pos.x, az = this.pos.z - th.pos.z, l = Math.hypot(ax, az) || 1; this.dir = { x: ax / l, z: az / l }; this.state = 'flee'; } else if (this.state === 'flee') this.state = 'idle';
      }
      let wantX = 0, wantZ = 0, spd = 0, atk = 0;
      if (kind === 'human') {
        if (this.state === 'flee' && this.dir) { wantX = this.dir.x; wantZ = this.dir.z; spd = st.run; }
        else { this.t -= dt; if (this.t <= 0) { this.t = 2 + Math.random() * 4; if (Math.random() < .6) { const a = Math.random() * 6.28; this.dir = { x: Math.cos(a), z: Math.sin(a) }; } else this.dir = null; } if (this.dir) { wantX = this.dir.x; wantZ = this.dir.z; spd = st.walk * .6; } }
      } else if (tgt) {
        const dx = tgt.x - this.pos.x, dz = tgt.z - this.pos.z, d = Math.hypot(dx, dz); let gx = dx, gz = dz;
        if (!sees(this.pos, tgt, ctx.colliders)) { const w = route(this.pos, tgt); if (w) { gx = w.x - this.pos.x; gz = w.z - this.pos.z; } }
        const gl = Math.hypot(gx, gz) || 1; wantX = gx / gl; wantZ = gz / gl; spd = st.run;
        if (kind === 'headcrab') { // 跳びかかり
          if (this.leap) { this.leap.t += dt; const k = this.leap.t / .55; this.pos.x += this.leap.vx * dt; this.pos.z += this.leap.vz * dt; this.pos.y = Math.sin(Math.min(1, k) * Math.PI) * 1.1; atk = 1; if (this.leap.t > .12 && !this.leap.hit && d < .8) { this.leap.hit = true; if (tgt.isPlayer) ctx.hurtPlayer(st.dmg); else tgt.actor.damage(st.dmg); } if (k >= 1) { this.leap = null; this.pos.y = 0; this.cd = 1.4; } model.update(dt, { speed: 0, attack: 1, hurt: this.hurt, dead: 0 }); return; }
          if (d < 3.6 && d > .8 && this.cd <= 0 && sees(this.pos, tgt, ctx.colliders)) { this.leap = { t: 0, vx: dx / d * 5.2, vz: dz / d * 5.2 }; this.yaw = Math.atan2(dx, dz); ctx.groan(); }
        } else if (d < st.reach + .3) { // ゾンビ近接
          spd = 0; atk = 1; if (this.atkT === 0 && this.cd <= 0) { this.atkT = .0001; } this.yaw = Math.atan2(dx, dz);
          if (this.atkT > 0) { this.atkT += dt; if (this.atkT > .55) { if (Math.hypot(tgt.x - this.pos.x, tgt.z - this.pos.z) < st.reach + .5) { if (tgt.isPlayer) ctx.hurtPlayer(st.dmg); else tgt.actor.damage(st.dmg); } this.atkT = 0; this.cd = 1.3; } }
        }
        if (Math.random() < dt * .08) ctx.groan();
      } else { // 徘徊
        this.t -= dt; if (this.t <= 0) { this.t = 3 + Math.random() * 4; if (Math.random() < .55) { const a = Math.random() * 6.28; this.dir = { x: Math.cos(a), z: Math.sin(a) }; } else this.dir = null; }
        if (this.dir) { wantX = this.dir.x; wantZ = this.dir.z; spd = st.walk * .55; }
      }
      if (this.atkT > 0) { atk = 1; spd = 0; this.atkT += 0; }
      // 向きと移動
      if (spd > 0) { const ty = Math.atan2(wantX, wantZ); let dy = ty - this.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); this.yaw += dy * Math.min(1, dt * (kind === 'zombie' ? 3 : 8)); const f = Math.max(0, Math.cos(dy)); this.pos.x += Math.sin(this.yaw) * spd * f * dt; this.pos.z += Math.cos(this.yaw) * spd * f * dt; }
      this.speed += ((spd > 0 ? Math.min(1, spd / st.run + .15) : 0) - this.speed) * Math.min(1, dt * 6);
      for (const o of ctx.actors) { if (o === this || o.dead) continue; const dx = this.pos.x - o.pos.x, dz = this.pos.z - o.pos.z, d = Math.hypot(dx, dz), m = this.radius + o.radius; if (d < m && d > 1e-4) { this.pos.x += dx / d * (m - d) * .5; this.pos.z += dz / d * (m - d) * .5; } }
      const hit = { x: this.pos.x, z: this.pos.z }; resolve(hit, this.radius, ctx.colliders); if (hit.x !== this.pos.x || hit.z !== this.pos.z) { this.dir = this.dir ? { x: -this.dir.x + (Math.random() - .5), z: -this.dir.z + (Math.random() - .5) } : null; } this.pos.x = hit.x; this.pos.z = hit.z;
      const pd = Math.hypot(this.pos.x - P.pos.x, this.pos.z - P.pos.z); if (pd < this.radius + P.r) { const k = (this.radius + P.r - pd) * .5; this.pos.x += (this.pos.x - P.pos.x) / (pd || 1) * k; this.pos.z += (this.pos.z - P.pos.z) / (pd || 1) * k; }
      this.root.rotation.y = this.yaw;
      model.update(dt, { speed: this.speed, attack: atk, hurt: this.hurt, dead: 0 });
    }
  };
  return a;
}
