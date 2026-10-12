// Procedural Half-Life 2 style headcrab zombie: shambling, torso split open, headcrab clamped on the head.
import * as THREE from 'three';
import {
  createHeadcrab, makeMat, lathe, limbProfile, displace, weldNormals, taperTube, blob, merge, meshOf, joint, rng,
} from './headcrab.js';

const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;

function remapV(geo, a, b) {
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setY(i, a + uv.getY(i) * (b - a));
  return geo;
}
function scaleUV(geo, su, sv) {
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
  return geo;
}
function scaleXZ(geo, sx, sz) { geo.scale(sx, 1, sz); return geo; }
function limb(len, rTop, rBot, bulge, bulgeAt, seed, amp = 0.004) {
  return displace(lathe(limbProfile(len, rTop, rBot, bulge, bulgeAt), 28), amp, 14, seed);
}

// torso cross-section radius (before elliptical scale) as fn of spine-local y
const TORSO = [[0.172, -0.27], [0.168, -0.16], [0.156, -0.04], [0.154, 0.06], [0.168, 0.16], [0.186, 0.26], [0.196, 0.34], [0.192, 0.4], [0.168, 0.45], [0.11, 0.495], [0.074, 0.51], [0.068, 0.53]];
const TSX = 1.24, TSZ = 0.8;
function torsoR(y) {
  for (let i = 1; i < TORSO.length; i++) if (y <= TORSO[i][1]) {
    const a = TORSO[i - 1], b = TORSO[i];
    return mix(a[0], b[0], (y - a[1]) / (b[1] - a[1]));
  }
  return TORSO[TORSO.length - 1][0];
}

function buildHand(side, seed) {
  const R = rng(seed);
  const skin = [], claws = [];
  const palm = blob(0.043, 0.052, 0.019, 0.12, 2.5, seed);
  palm.translate(0, -0.048, 0.004);
  skin.push(palm);
  const fx = [-0.028, -0.0095, 0.0095, 0.027];
  const flen = [0.85, 1.0, 0.97, 0.8];
  fx.forEach((x, i) => {
    const L = flen[i] * (0.95 + R() * 0.1), curl = 0.6 + R() * 0.5;
    const p = [[x, -0.085, 0.004], [x * 1.12, -0.085 - 0.05 * L, 0.012 * curl], [x * 1.2, -0.085 - 0.095 * L, 0.032 * curl], [x * 1.22, -0.085 - 0.125 * L, 0.06 * curl]];
    skin.push(taperTube(p, 14, 0.0095, 0.0062, 8));
    skin.push(blob(0.011, 0.01, 0.011, 0.1, 3, seed + i).translate(x * 1.12, -0.085 - 0.05 * L, 0.012 * curl));
    const e = p[3], d = [p[3][0] - p[2][0], p[3][1] - p[2][1], p[3][2] - p[2][2]];
    claws.push(taperTube([e, [e[0] + d[0] * 0.6, e[1] + d[1] * 0.6, e[2] + d[2] * 0.6 + 0.008], [e[0] + d[0] * 0.9, e[1] + d[1] * 0.5, e[2] + d[2] * 1.1 + 0.03]], 8, 0.0058, 3e-4, 7));
  });
  const tx = -0.04 * side;
  const tp = [[tx * 0.6, -0.03, 0.01], [tx, -0.06, 0.03], [tx * 1.05, -0.09, 0.05]];
  skin.push(taperTube(tp, 10, 0.012, 0.007, 8));
  claws.push(taperTube([tp[2], [tx * 1.05, -0.105, 0.065], [tx, -0.11, 0.085]], 6, 0.0065, 3e-4, 7));
  if (side < 0) { skin.forEach((g) => g.scale(-1, 1, 1)); claws.forEach((g) => g.scale(-1, 1, 1)); }
  const sg = merge(skin.map((g) => (g.index ? g : g))), cg = merge(claws);
  if (side < 0) { flip(sg); flip(cg); }
  weldNormals(sg);
  return [sg, cg];
}
function flip(g) { // fix winding after mirroring
  const idx = g.index.array;
  for (let i = 0; i < idx.length; i += 3) { const t = idx[i]; idx[i] = idx[i + 2]; idx[i + 2] = t; }
  g.computeVertexNormals();
}

const NO_STATE = Object.freeze({});
export function createHeadcrabZombie(opts = {}) {
  const seed = (opts.seed ?? 1) | 0;
  const R = rng(seed * 2654435761 + 7);
  const root = new THREE.Group(); root.name = 'headcrabZombie';
  const geos = [], mats = [];
  const G = (g) => (geos.push(g), g), M = (m) => (mats.push(m), m);

  // materials (textures are shared/cached; materials per instance)
  const jacketM = M(makeMat('jacket')), sleeveM = M(makeMat('sleeve'));
  if (opts.tint != null) { jacketM.color.set(opts.tint); sleeveM.color.set(opts.tint); }
  const shirtM = M(makeMat('shirt', { color: 0xb8ad98 }));
  const pantsM = M(makeMat('pants')), pantsTopM = pantsM;
  const fleshM = M(makeMat('flesh'));
  const gutM = M(makeMat('flesh', { color: 0xffc0b0, sheenColor: 0xff6050 }));
  const organM = M(makeMat('flesh', { color: 0x9a4048 }));
  const skinM = M(makeMat('skin', { color: 0xd8c4b4 }));
  const boneM = M(makeMat('bone', { color: 0xd8b8a0 }));
  const faceM = M(makeMat('skin', { color: 0xb88878 }));
  const shoeM = M(makeMat('leather'));
  const clawM = M(makeMat('bone', { color: 0x4a3a2c, clearcoat: 0.8 }));
  const mouthM = M(new THREE.MeshStandardMaterial({ color: 0x200406, roughness: 0.25 }));

  const rig = joint(root, 0, 0, 0, 'rig');
  const hips = joint(rig, 0, 0.98, 0, 'hips');
  const spine = joint(hips, 0, 0.06, 0, 'spine');
  const chest = joint(spine, 0, 0.36, 0, 'chest');
  const neck = joint(chest, 0, 0.13, 0.0, 'neck');
  const head = joint(neck, 0, 0.1, 0.02, 'head');

  // ---------------- pelvis + legs
  const pelvis = scaleXZ(lathe([[0.03, -0.17], [0.1, -0.15], [0.145, -0.1], [0.158, -0.02], [0.155, 0.06], [0.14, 0.1]], 32), 1.15, 0.86);
  meshOf(G(remapV(displace(pelvis, 0.004, 12, seed + 1), 0.35, 1)), pantsTopM, hips);
  const legs = [];
  for (const side of [1, -1]) {
    const hip = joint(hips, 0.095 * side, -0.06, 0, 'hip');
    hip.rotation.order = 'XZY';
    meshOf(G(remapV(limb(0.46, 0.088, 0.062, 0.012, 0.3, seed + 2 + side), 0.3, 1)), pantsM, hip);
    const knee = joint(hip, 0, -0.44, 0, 'knee');
    meshOf(G(limb(0.45, 0.066, 0.05, 0.01, 0.25, seed + 4 + side)), pantsM, knee, [0, 0.03, 0]);
    meshOf(G(limb(0.42, 0.045, 0.032, 0.008, 0.3, seed + 6 + side, 0.002)), skinM, knee);
    const ankle = joint(knee, 0, -0.4, 0, 'ankle');
    const shoe = blob(0.052, 0.045, 0.125, 0.06, 2, seed + 8 + side, 28, 18);
    const sp = shoe.attributes.position;
    for (let i = 0; i < sp.count; i++) { // flat sole, toe tapers & lifts
      const z = sp.getZ(i); let y = sp.getY(i);
      if (y < -0.02) y = -0.02 - (y + 0.02) * 0.25;
      if (z > 0.07) y += (z - 0.07) * 0.25 * (y > 0 ? -0.8 : 0.3);
      sp.setY(i, y);
    }
    weldNormals(shoe);
    meshOf(G(shoe), shoeM, ankle, [0, -0.06, 0.045]);
    legs.push({ hip, knee, ankle, side });
  }

  // ---------------- torso: jacket, shirt, exposed flesh, ribs, guts
  const gap = 0.5;
  const jacket = scaleXZ(lathe(TORSO, 48, gap, Math.PI * 2 - gap * 2), TSX, TSZ);
  meshOf(G(displace(jacket, 0.005, 9, seed + 10)), jacketM, spine);
  const collar = scaleXZ(lathe([[0.09, 0.47], [0.11, 0.5], [0.105, 0.535], [0.085, 0.545]], 32, gap * 0.8, Math.PI * 2 - gap * 1.6), TSX * 0.98, TSZ * 1.05);
  meshOf(G(displace(collar, 0.004, 14, seed + 11)), jacketM, spine);
  const shirtProf = TORSO.slice(1, 10).map(([r, y]) => [r * 0.965, y]);
  const shirt = scaleXZ(lathe(shirtProf, 40, gap * 0.62, Math.PI * 2 - gap * 1.24), TSX, TSZ);
  meshOf(G(displace(shirt, 0.004, 10, seed + 12)), shirtM, spine);
  // flesh core with a recessed cavity at the front
  const core = scaleXZ(lathe(TORSO.slice(1, 10).map(([r, y]) => [r * 0.92, y]), 48), TSX, TSZ);
  {
    const p = core.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), phi = Math.atan2(x / TSX, z / TSZ);
      const f = Math.max(0, Math.cos(Math.min(Math.PI / 2, Math.abs(phi) / 0.75 * Math.PI / 2))) * sstep(-0.16, -0.05, y) * (1 - sstep(0.38, 0.46, y));
      const k = 1 - 0.3 * f * f;
      p.setX(i, x * k); p.setZ(i, z * k);
    }
  }
  meshOf(G(scaleUV(displace(core, 0.012, 16, seed + 13), 3, 2)), fleshM, spine);
  // sternum muscle strips / torn tissue flaps at the split edges
  const flaps = [];
  for (const side of [1, -1]) for (let i = 0; i < 5; i++) {
    const y0 = -0.12 + i * 0.11 + R() * 0.03, ph = (gap - 0.05) * side;
    const r = torsoR(y0) * 0.97;
    const x = Math.sin(ph) * r * TSX, z = Math.cos(ph) * r * TSZ;
    flaps.push(taperTube([[x, y0 + 0.05, z - 0.01], [x * 0.85, y0, z + 0.01], [x * 0.6, y0 - 0.035, z - 0.005]], 8, 0.016, 0.003, 7));
  }
  meshOf(G(displace(merge(flaps), 0.003, 40, seed + 14)), fleshM, spine);
  // ribs, broken at the sternum and splayed outward
  const ribs = [];
  for (const side of [1, -1]) for (let i = 0; i < 5; i++) {
    const y = 0.13 + i * 0.056 + (R() - 0.5) * 0.012, r = torsoR(y), pts = [];
    const brk = 0.3 + R() * 0.25, out = 1.0 + R() * 0.08;
    for (const [phi, rr, dy] of [[1.55, 0.93, 0.02], [1.2, 0.97, 0.008], [0.9, 0.99, 0], [0.62, 0.99, -0.01], [brk + 0.12, 0.99, -0.02], [brk, out, -0.03 - R() * 0.02]]) {
      const a = phi * side;
      pts.push([Math.sin(a) * r * rr * TSX, y + dy - i * 0.004, Math.cos(a) * r * rr * TSZ]);
    }
    ribs.push(taperTube(pts, 20, 0.0072, 0.005, 7));
    const e = pts[5];
    ribs.push(blob(0.007, 0.006, 0.009, 0.4, 4, seed + i * 3 + side).translate(e[0], e[1], e[2]));
  }
  meshOf(G(merge(ribs)), boneM, spine);
  // lungs / heart behind the ribs
  meshOf(G(blob(0.07, 0.1, 0.05, 0.12, 2.5, seed + 20)), organM, spine, [0.07, 0.27, 0.035]);
  meshOf(G(blob(0.07, 0.1, 0.05, 0.12, 2.5, seed + 21)), organM, spine, [-0.07, 0.27, 0.035]);
  meshOf(G(blob(0.045, 0.055, 0.04, 0.15, 3, seed + 22)), fleshM, spine, [0.02, 0.22, 0.07], [0.3, 0, 0.4]);
  // intestines: coiled in the belly with one loop hanging out
  const gut = [];
  for (let k = 0; k < 3; k++) {
    const pts = [];
    const yb = -0.08 + k * 0.06;
    for (let i = 0; i <= 10; i++) {
      const tt = i / 10, a = (tt - 0.5) * 1.6;
      pts.push([Math.sin(a) * 0.12 * TSX * 0.82, yb + Math.sin(tt * 9 + k) * 0.022, Math.cos(a) * 0.12 * TSZ * 0.85 + 0.012 * Math.sin(tt * 13 + k)]);
    }
    gut.push(taperTube(pts, 48, 0.019, 0.019, 10));
  }
  gut.push(taperTube([[0.06, -0.05, 0.1], [0.075, -0.13, 0.13], [0.06, -0.24, 0.135], [0.02, -0.3, 0.12], [-0.02, -0.26, 0.12], [-0.03, -0.16, 0.13], [-0.05, -0.08, 0.1]], 48, 0.02, 0.02, 10));
  meshOf(G(scaleUV(displace(merge(gut), 0.003, 50, seed + 23), 4, 1)), gutM, spine);

  // ---------------- shoulders + arms
  const arms = [];
  for (const side of [1, -1]) {
    const sh = joint(chest, 0.205 * side, 0.07, -0.015, 'shoulder');
    sh.rotation.order = 'XZY';
    meshOf(G(blob(0.058, 0.05, 0.062, 0.08, 2.5, seed + 30 + side)), jacketM, sh, [-0.012 * side, -0.02, 0]);
    meshOf(G(remapV(limb(0.32, 0.064, 0.05, 0.008, 0.25, seed + 32 + side), 0.35, 1)), sleeveM, sh);
    const elbow = joint(sh, 0, -0.29, 0, 'elbow');
    meshOf(G(limb(0.2, 0.052, 0.046, 0.004, 0.3, seed + 34 + side)), sleeveM, elbow);
    meshOf(G(limb(0.28, 0.04, 0.026, 0.009, 0.25, seed + 36 + side, 0.003)), skinM, elbow);
    const wrist = joint(elbow, 0, -0.27, 0, 'wrist');
    const [hg, cg] = buildHand(side, seed + 40 + side);
    meshOf(G(hg), skinM, wrist);
    meshOf(G(cg), clawM, wrist);
    arms.push({ sh, elbow, wrist, side });
  }

  // ---------------- neck + head + clamped headcrab
  meshOf(G(displace(lathe([[0.058, -0.04], [0.054, 0.04], [0.05, 0.1], [0.045, 0.14]], 24), 0.004, 20, seed + 50)), skinM, neck);
  meshOf(G(blob(0.088, 0.1, 0.096, 0.06, 2, seed + 51)), faceM, head, [0, 0.0, 0]);
  const jaw = joint(head, 0, -0.035, 0.03, 'jaw');
  meshOf(G(blob(0.066, 0.04, 0.07, 0.1, 2.5, seed + 52)), faceM, jaw, [0, -0.045, 0.02]);
  meshOf(G(blob(0.05, 0.03, 0.03, 0.05, 2, seed + 53)), mouthM, head, [0, -0.06, 0.075]);
  const teeth = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 9 - 0.5) * 1.6, c = new THREE.ConeGeometry(0.005, 0.014, 5);
    c.rotateX(Math.PI); c.translate(Math.sin(a) * 0.045, -0.042, Math.cos(a) * 0.075);
    teeth.push(c);
  }
  meshOf(G(merge(teeth)), boneM, head);
  const crab = createHeadcrab({ seed: seed + 99, clamped: true });
  crab.root.position.set(0, 0.035, 0.012);
  crab.root.rotation.x = 0.32;
  crab.root.scale.setScalar(0.95);
  head.add(crab.root);

  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  // ---------------- animation
  let t = R() * 20, ph = R() * 6, aph = 0;
  const crabS = { speed: 0, attack: 0, hurt: 0, dead: 0 };
  const limp = 0.65 + R() * 0.2;
  const api = {
    root, height: 1.85, radius: 0.4,
    joints: { rig, hips, spine, chest, neck, head, legs, arms },
    headcrab: crab,
    update(dt, s = NO_STATE) {
      t += dt;
      const sp = s.speed || 0, at = s.attack || 0, hu = s.hurt || 0, de = s.dead || 0;
      ph += dt * (1.6 + 3.4 * sp);
      if (at > 0.001) aph += dt * 7.5; else aph = 0;
      const br = Math.sin(t * 1.6), sw = Math.sin(t * 0.7);
      const w = Math.sin(ph), wc = Math.cos(ph);
      const kneel = sstep(0, 0.35, de) * (1 - 0.7 * sstep(0.45, 0.85, de));
      const fall = sstep(0.25, 0.85, de);
      const fallE = fall * fall * (3 - 2 * fall);
      const alive = 1 - sstep(0, 0.3, de);
      const jit = Math.sin(t * 43) * hu;

      // rig-level fall (pivot at feet), lands face down along +Z
      rig.rotation.x = fallE * 1.5;
      rig.position.y = fallE * 0.15;
      rig.position.z = fallE * 0.12;

      // hips & legs
      hips.position.y = 0.98 - 0.02 - sp * 0.035 * Math.abs(wc) - kneel * 0.38 - hu * 0.03;
      hips.rotation.y = 0.14 * sp * w * alive;
      hips.rotation.z = (0.06 * sp * wc + 0.02 * sw) * alive;
      hips.rotation.x = -0.05 + kneel * 0.2;
      for (let i = 0; i < 2; i++) {
        const L = legs[i], dir = i === 0 ? 1 : -1, amp = i === 0 ? 0.48 : 0.48 * limp;
        const thigh = -amp * sp * w * dir;
        const swing = i === 0 ? Math.max(0, wc) : Math.max(0, -wc);
        let knee = 0.12 + sp * (i === 0 ? 0.85 : 0.5) * swing + hu * 0.25;
        let hx = thigh - 0.04 - hu * 0.12;
        hx = mix(hx, -1.05, kneel); knee = mix(knee, 1.75, kneel);
        hx = mix(hx, 0.08 * dir, fall); knee = mix(knee, 0.25 + 0.15 * i, fall);
        L.hip.rotation.x = hx;
        L.hip.rotation.z = (0.05 + (i === 1 ? 0.04 : 0)) * L.side * (1 - fall) + fall * 0.12 * L.side;
        L.hip.rotation.y = i === 1 ? -0.25 * L.side * alive : 0.05 * L.side;
        L.knee.rotation.x = knee;
        L.ankle.rotation.x = mix(-(hx + knee) * 0.75, 0.6, fall) + (i === 1 ? 0.15 * sp * alive : 0);
      }

      // spine hunch, breathing, flinch
      spine.rotation.x = 0.38 + br * 0.015 + sp * 0.07 + at * 0.16 - hu * 0.42 + kneel * 0.15 - fall * 0.28;
      spine.rotation.z = (-0.09 * sp * wc + 0.03 * sw) * alive + jit * 0.04;
      spine.rotation.y = (0.12 * sp * w + 0.2 * at * Math.sin(aph)) * alive;
      chest.rotation.x = 0.14 - br * 0.02 - hu * 0.15;
      chest.scale.set(1 + br * 0.012, 1, 1 + br * 0.018);
      neck.rotation.x = -0.28 + Math.sin(t * 0.5) * 0.04 - hu * 0.35 - at * 0.1 + fall * 0.2;
      neck.rotation.y = 0.15 * Math.sin(t * 0.37) * alive + fall * 0.9;
      neck.rotation.z = 0.12 * Math.sin(t * 0.31 + 1) * alive + jit * 0.08 - fall * 0.25;
      head.rotation.x = -0.1 - hu * 0.25;
      head.rotation.z = Math.sin(t * 1.9) * 0.02 * alive;

      // arms: hang forward, swing loosely; attack = alternating overhead claw swipes
      for (let i = 0; i < 2; i++) {
        const A = arms[i], sd = A.side, k = i === 0 ? 0 : Math.PI;
        const swing = Math.sin(ph + k + Math.PI * 0.5);
        let sx = -0.42 - 0.18 * sp * swing + 0.03 * Math.sin(t * 1.1 + k);
        let sz = (0.13 + 0.02 * Math.sin(t * 0.9 + k)) * sd;
        let ex = -0.38 - 0.1 * sp * Math.max(0, swing);
        let wx = -0.15;
        const a = Math.sin(aph + k);
        sx = mix(sx, -1.85 - 0.75 * a, at);
        sz = mix(sz, (0.3 - 0.35 * a) * sd, at);
        ex = mix(ex, -0.35 - 0.55 * Math.max(0, a), at);
        wx = mix(wx, -0.5 + 0.35 * a, at);
        sx += hu * 0.35; sz += hu * 0.45 * sd; ex -= hu * 0.4;
        sx = mix(sx, -2.75, fall); sz = mix(sz, 0.3 * sd, fall); ex = mix(ex, -0.2, fall);
        sx = mix(sx, -0.25, kneel * (1 - fall));
        A.sh.rotation.x = sx; A.sh.rotation.z = sz; A.sh.rotation.y = -0.15 * sd;
        A.elbow.rotation.x = ex;
        A.wrist.rotation.x = wx;
        A.wrist.rotation.z = 0.1 * sd;
      }

      // crab keeps pulsing; jaw hangs
      crabS.hurt = hu; crabS.dead = 0; crabS.speed = 0; crabS.attack = 0;
      crab.update(dt, crabS);
    },
    dispose() {
      root.removeFromParent();
      crab.dispose();
      geos.forEach((g) => g.dispose()); mats.forEach((m) => m.dispose());
    },
  };
  api.update(0, {});
  return api;
}
