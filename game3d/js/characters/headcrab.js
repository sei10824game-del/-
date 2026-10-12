// Procedural headcrab (Half-Life 2 style) + shared procedural helpers used by zombie.js.
// No external assets: geometry is lofted / lathed / deformed, textures are painted on canvases.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ---------------------------------------------------------------- noise
function hash3(x, y, z, s) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1440662683) ^ Math.imul(s | 0, 2147483587);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const fade = (t) => t * t * (3 - 2 * t);
// tileable 2D value noise (period px, py)
function vn2(x, y, px, py, s) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const u = fade(x - xi), v = fade(y - yi);
  const x0 = ((xi % px) + px) % px, x1 = (x0 + 1) % px;
  const y0 = ((yi % py) + py) % py, y1 = (y0 + 1) % py;
  const a = hash3(x0, y0, 0, s), b = hash3(x1, y0, 0, s), c = hash3(x0, y1, 0, s), d = hash3(x1, y1, 0, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
// tileable fbm over uv in [0,1]; fx/fy integer base frequencies
function fbm(u, v, fx, fy, oct, s) {
  let sum = 0, amp = 0.5, norm = 0;
  for (let o = 0; o < oct; o++) {
    const m = 1 << o;
    sum += amp * vn2(u * fx * m, v * fy * m, fx * m, fy * m, s + o * 31);
    norm += amp; amp *= 0.5;
  }
  return sum / norm;
}
const ridge = (n) => 1 - Math.abs(2 * n - 1);
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;

// 3D value noise for geometry displacement
function vn3(x, y, z, s) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const u = fade(x - xi), v = fade(y - yi), w = fade(z - zi);
  let r = 0;
  for (let k = 0; k < 2; k++) for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
    r += hash3(xi + i, yi + j, zi + k, s) * (i ? u : 1 - u) * (j ? v : 1 - v) * (k ? w : 1 - w);
  }
  return r * 2 - 1;
}
function fbm3(x, y, z, s) { return vn3(x, y, z, s) * 0.62 + vn3(x * 2.1, y * 2.1, z * 2.1, s + 7) * 0.28 + vn3(x * 4.3, y * 4.3, z * 4.3, s + 13) * 0.1; }

export function rng(seed) {
  let s = (seed >>> 0) || 0x9e3779b9;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
}

// ---------------------------------------------------------------- canvas textures
function buildTex(size, paint, normalStrength = 2) {
  const N = size * size, H = new Float32Array(N);
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d'); return [c, x, x.createImageData(size, size)]; };
  const [cc, cx, cd] = mk(), [rc, rx, rd] = mk(), [nc, nx, nd] = mk();
  const o = new Float32Array(6);
  const c255 = (f) => Math.max(0, Math.min(255, f * 255 + 0.5)) | 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    o[0] = o[1] = o[2] = 0.5; o[3] = 1; o[4] = 0.5; o[5] = 0.5;
    paint((x + 0.5) / size, 1 - (y + 0.5) / size, o);
    const i = y * size + x, p = i * 4;
    cd.data[p] = c255(o[0]); cd.data[p + 1] = c255(o[1]); cd.data[p + 2] = c255(o[2]); cd.data[p + 3] = c255(o[3]);
    rd.data[p] = rd.data[p + 1] = rd.data[p + 2] = c255(o[5]); rd.data[p + 3] = 255;
    H[i] = o[4];
  }
  const k = normalStrength * size / 64;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const xl = (x - 1 + size) % size, xr = (x + 1) % size, yu = (y - 1 + size) % size, yd = (y + 1) % size;
    const dx = (H[y * size + xr] - H[y * size + xl]) * k;
    const dy = (H[yu * size + x] - H[yd * size + x]) * k; // +v is canvas up
    const l = Math.hypot(dx, dy, 1), p = (y * size + x) * 4;
    nd.data[p] = c255(-dx / l * 0.5 + 0.5); nd.data[p + 1] = c255(-dy / l * 0.5 + 0.5); nd.data[p + 2] = c255(1 / l * 0.5 + 0.5); nd.data[p + 3] = 255;
  }
  cx.putImageData(cd, 0, 0); rx.putImageData(rd, 0, 0); nx.putImageData(nd, 0, 0);
  const tex = (c, srgb) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    return t;
  };
  return { map: tex(cc, true), roughnessMap: tex(rc, false), normalMap: tex(nc, false) };
}

function setRGB(o, r, g, b) { o[0] = r; o[1] = g; o[2] = b; }

const PAINTERS = {
  // wrinkled tan / orange-brown headcrab hide
  crab: () => buildTex(512, (u, v, o) => {
    const n = fbm(u, v, 4, 4, 5, 11);
    const cell = Math.pow(ridge(fbm(u, v, 7, 7, 4, 23)), 7);
    const fine = Math.pow(ridge(fbm(u, v, 22, 30, 3, 37)), 9);
    const blot = sstep(0.5, 0.72, fbm(u, v, 3, 3, 4, 41));
    const pore = sstep(0.82, 0.9, vn2(u * 160, v * 160, 160, 160, 5));
    let r = mix(0.78, 0.6, n), g = mix(0.6, 0.38, n), b = mix(0.44, 0.24, n);
    r = mix(r, 0.8, blot * 0.5); g = mix(g, 0.46, blot * 0.5); b = mix(b, 0.4, blot * 0.5);
    const dark = 1 - 0.55 * cell - 0.3 * fine - 0.25 * pore;
    setRGB(o, r * dark, g * dark * 0.97, b * dark * 0.95);
    o[4] = 0.55 + 0.3 * n - 0.45 * cell - 0.2 * fine - 0.1 * pore;
    o[5] = 0.38 + 0.35 * cell + 0.15 * fine - 0.1 * blot;
  }, 2.2),
  // wet exposed muscle / viscera
  flesh: () => buildTex(512, (u, v, o) => {
    const str = fbm(u, v, 40, 4, 3, 51);
    const blob = fbm(u, v, 6, 6, 4, 53);
    const fat = sstep(0.6, 0.7, fbm(u, v, 9, 9, 3, 57));
    const clot = sstep(0.6, 0.75, fbm(u, v, 5, 5, 4, 59));
    const vein = Math.pow(ridge(fbm(u, v, 5, 5, 4, 61)), 14);
    const t = str * 0.65 + blob * 0.35;
    let r = mix(0.32, 0.82, t), g = mix(0.03, 0.2, t * t), b = mix(0.03, 0.12, t * t);
    r = mix(r, 0.9, fat * 0.8); g = mix(g, 0.66, fat * 0.8); b = mix(b, 0.36, fat * 0.8);
    r = mix(r, 0.12, clot * 0.75); g = mix(g, 0.01, clot * 0.75); b = mix(b, 0.015, clot * 0.75);
    r = mix(r, 0.35, vein * 0.6); g = mix(g, 0.04, vein * 0.6); b = mix(b, 0.16, vein * 0.6);
    setRGB(o, r, g, b);
    o[4] = 0.4 + str * 0.35 + blob * 0.35 + fat * 0.2 - clot * 0.15 + vein * 0.1;
    o[5] = 0.14 + 0.22 * (1 - blob) + clot * 0.25;
  }, 1.6),
  skin: () => buildTex(512, (u, v, o) => {
    const n = fbm(u, v, 5, 5, 5, 71);
    const vein = Math.pow(ridge(fbm(u, v, 6, 6, 4, 73)), 16);
    const mott = fbm(u, v, 12, 12, 3, 75);
    const blood = sstep(0.55, 0.72, fbm(u, v, 3, 5, 4, 77));
    let r = mix(0.6, 0.48, n), g = mix(0.55, 0.47, n), b = mix(0.48, 0.42, n);
    g += (mott - 0.5) * 0.05; r += (0.5 - mott) * 0.04;
    r = mix(r, 0.3, vein * 0.5); g = mix(g, 0.22, vein * 0.5); b = mix(b, 0.32, vein * 0.5);
    r = mix(r, 0.36, blood); g = mix(g, 0.04, blood); b = mix(b, 0.03, blood);
    setRGB(o, r, g, b);
    o[4] = 0.5 + n * 0.3 + mott * 0.15 + vein * 0.12;
    o[5] = 0.5 + 0.15 * n - blood * 0.28;
  }, 1.2),
  bone: () => buildTex(256, (u, v, o) => {
    const n = fbm(u, v, 6, 6, 4, 81), bl = sstep(0.45, 0.7, fbm(u, v, 4, 4, 4, 83));
    setRGB(o, mix(mix(0.9, 0.78, n), 0.45, bl), mix(mix(0.84, 0.7, n), 0.07, bl), mix(mix(0.7, 0.56, n), 0.05, bl));
    o[4] = n; o[5] = 0.3 + 0.2 * n - 0.1 * bl;
  }, 1),
  leather: () => buildTex(256, (u, v, o) => {
    const n = fbm(u, v, 8, 8, 5, 91), c = Math.pow(ridge(fbm(u, v, 10, 10, 3, 93)), 8);
    const l = 0.07 + 0.06 * n - 0.03 * c;
    setRGB(o, l * 1.1, l * 0.9, l * 0.75); o[4] = n - c * 0.4; o[5] = 0.45 + 0.3 * n + c * 0.2;
  }, 1.5),
};
// woven, dirty, blood-soaked cloth with alpha tatters. mode: 0 jacket (open front + hem), 1 sleeve/pants (end at v=0)
function clothPainter(mode, base, seed) {
  return () => buildTex(512, (u, v, o) => {
    const weave = 0.5 + 0.5 * Math.sin((u * 256 + v * 256) * Math.PI) * Math.sin((u * 256 - v * 256) * Math.PI * 0.5);
    const dirt = fbm(u, v, 6, 6, 5, seed);
    const grime = fbm(u, v, 2, 3, 3, seed + 3);
    const edge = mode === 0 ? Math.max(sstep(0.22, 0.0, u), sstep(0.78, 1.0, u)) : sstep(0.35, 0.0, v);
    const bl = sstep(0.62, 0.78, fbm(u, v, 5, 5, 4, seed + 5) + edge * 0.35 + (1 - v) * 0.08);
    let r = base[0] * (0.55 + 0.8 * dirt) + 0.025 * weave, g = base[1] * (0.55 + 0.8 * dirt) + 0.022 * weave, b = base[2] * (0.55 + 0.8 * dirt) + 0.02 * weave;
    r *= 0.8 + 0.4 * grime; g *= 0.8 + 0.4 * grime; b *= 0.8 + 0.4 * grime;
    r = mix(r, 0.2, bl * 0.85); g = mix(g, 0.015, bl * 0.85); b = mix(b, 0.012, bl * 0.85);
    setRGB(o, r, g, b);
    // tatters
    const tn = fbm(u, v, 24, 24, 3, seed + 9), tn2 = fbm(u, v, 8, 8, 2, seed + 11);
    let a = 1;
    if (mode === 0) {
      if (u < 0.015 + 0.06 * tn + 0.03 * tn2 || u > 0.985 - 0.06 * tn - 0.03 * tn2) a = 0;
      if (v < 0.03 + 0.12 * tn * tn2) a = 0;
      if (fbm(u, v, 7, 5, 3, seed + 13) > 0.73) a = 0; // holes
    } else if (v < 0.025 + 0.14 * tn * tn2 * 1.4) a = 0;
    o[3] = a;
    o[4] = weave * 0.25 + dirt * 0.5 + bl * 0.15;
    o[5] = 0.9 - bl * 0.45 + 0.05 * dirt;
  }, 1.4);
}
PAINTERS.jacket = clothPainter(0, [0.12, 0.105, 0.09], 101);
PAINTERS.sleeve = clothPainter(1, [0.12, 0.105, 0.09], 121);
PAINTERS.pants = clothPainter(1, [0.11, 0.12, 0.14], 141);
PAINTERS.shirt = clothPainter(0, [0.62, 0.58, 0.5], 161);

const TEX = {};
export function getTex(kind) { return TEX[kind] || (TEX[kind] = PAINTERS[kind]()); }

const MAT_PRESET = {
  crab: { roughness: 1, clearcoat: 0.45, clearcoatRoughness: 0.35, sheen: 0.6, sheenRoughness: 0.4, sheenColor: 0xff9a70, normalScale: 1.2 },
  flesh: { roughness: 1, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.8, sheenRoughness: 0.35, sheenColor: 0xff3020, normalScale: 1.4 },
  skin: { roughness: 1, clearcoat: 0.2, clearcoatRoughness: 0.5, sheen: 0.5, sheenRoughness: 0.5, sheenColor: 0xc06050, normalScale: 0.8 },
  bone: { roughness: 1, clearcoat: 0.6, clearcoatRoughness: 0.25 },
  leather: { roughness: 1, clearcoat: 0.3, clearcoatRoughness: 0.5 },
  jacket: { roughness: 1, sheen: 1, sheenRoughness: 0.8, sheenColor: 0x3a3a3a, alphaTest: 0.5, side: THREE.DoubleSide },
  sleeve: { roughness: 1, sheen: 1, sheenRoughness: 0.8, sheenColor: 0x3a3a3a, alphaTest: 0.5, side: THREE.DoubleSide },
  pants: { roughness: 1, sheen: 1, sheenRoughness: 0.8, sheenColor: 0x3a4050, alphaTest: 0.5, side: THREE.DoubleSide },
  shirt: { roughness: 1, sheen: 0.8, sheenRoughness: 0.7, sheenColor: 0x888070, alphaTest: 0.5, side: THREE.DoubleSide },
};
export function makeMat(kind, extra = {}) {
  const t = getTex(kind), p = MAT_PRESET[kind] || {};
  const m = new THREE.MeshPhysicalMaterial({ map: t.map, normalMap: t.normalMap, roughnessMap: t.roughnessMap, ...p, ...extra });
  if (p.normalScale) m.normalScale.set(p.normalScale, p.normalScale);
  return m;
}

// ---------------------------------------------------------------- geometry helpers
export function lathe(profile, segs = 32, phiStart = 0, phiLen = Math.PI * 2) {
  return new THREE.LatheGeometry(profile.map((p) => new THREE.Vector2(Math.max(p[0], 1e-4), p[1])), segs, phiStart, phiLen);
}
// rounded tapered limb hanging from y=0 down to y=-len (radius fn of t: 0 top .. 1 bottom)
export function limbProfile(len, rTop, rBot, bulge = 0, bulgeAt = 0.3, n = 16) {
  const pts = [], cap = 5, cb = -len + rBot, ct = -rTop;
  for (let k = 0; k <= cap; k++) { const a = -Math.PI / 2 + (k / cap) * Math.PI / 2; pts.push([rBot * Math.cos(a), cb + rBot * Math.sin(a)]); }
  for (let k = 1; k < n; k++) {
    const t = k / n, top = 1 - t; // top: 0 at bottom .. 1 at top
    pts.push([mix(rBot, rTop, t) + bulge * Math.exp(-(((top - bulgeAt) / 0.22) ** 2)), mix(cb, ct, t)]);
  }
  for (let k = 0; k <= cap; k++) { const a = (k / cap) * Math.PI / 2; pts.push([rTop * Math.cos(a), ct + rTop * Math.sin(a)]); }
  return pts;
}
// average normals of vertices sharing a position (fixes lathe/sphere seams after displacement)
export function weldNormals(geo) {
  geo.computeVertexNormals();
  const p = geo.attributes.position, n = geo.attributes.normal, map = new Map();
  for (let i = 0; i < p.count; i++) {
    const k = `${p.getX(i).toFixed(4)},${p.getY(i).toFixed(4)},${p.getZ(i).toFixed(4)}`;
    let e = map.get(k); if (!e) { e = [0, 0, 0, []]; map.set(k, e); }
    e[0] += n.getX(i); e[1] += n.getY(i); e[2] += n.getZ(i); e[3].push(i);
  }
  for (const e of map.values()) {
    const l = Math.hypot(e[0], e[1], e[2]) || 1;
    for (const i of e[3]) n.setXYZ(i, e[0] / l, e[1] / l, e[2] / l);
  }
  n.needsUpdate = true;
  return geo;
}
export function displace(geo, amp, freq, seed = 1) {
  weldNormals(geo);
  const p = geo.attributes.position, n = geo.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const d = fbm3(x * freq, y * freq, z * freq, seed) * amp;
    p.setXYZ(i, x + n.getX(i) * d, y + n.getY(i) * d, z + n.getZ(i) * d);
  }
  return weldNormals(geo);
}
const _tv = new THREE.Vector3();
// tube along catmull-rom points with radius tapering r0 -> r1 (optional radius fn)
export function taperTube(points, segs, r0, r1, radSeg = 8, rFn = null) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => (p.isVector3 ? p : new THREE.Vector3(p[0], p[1], p[2]))));
  const g = new THREE.TubeGeometry(curve, segs, 1, radSeg, false);
  const pos = g.attributes.position;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    curve.getPointAt(t, _tv);
    const r = rFn ? rFn(t) : mix(r0, r1, t);
    for (let j = 0; j <= radSeg; j++) {
      const k = i * (radSeg + 1) + j;
      pos.setXYZ(k, _tv.x + (pos.getX(k) - _tv.x) * r, _tv.y + (pos.getY(k) - _tv.y) * r, _tv.z + (pos.getZ(k) - _tv.z) * r);
    }
  }
  g.computeVertexNormals();
  return g;
}
export function blob(rx, ry, rz, amp = 0.1, freq = 3, seed = 1, ws = 24, hs = 16) {
  const g = new THREE.SphereGeometry(1, ws, hs);
  g.scale(rx, ry, rz);
  return displace(g, amp * Math.min(rx, ry, rz), freq / Math.min(rx, ry, rz), seed);
}
export function merge(list) { const g = mergeGeometries(list, false); list.forEach((x) => x.dispose()); return g; }
export function meshOf(geo, mat, parent, pos, rot) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true; m.receiveShadow = true;
  if (pos) m.position.set(pos[0], pos[1], pos[2]);
  if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
  if (parent) parent.add(m);
  return m;
}
export function joint(parent, x = 0, y = 0, z = 0, name = '') {
  const j = new THREE.Object3D(); j.name = name; j.position.set(x, y, z); parent.add(j); return j;
}

// ---------------------------------------------------------------- headcrab
const LEGS = [ // angle from +Z (deg), femur len, tibia len, radius, stand lift, stand bend
  [32, 0.17, 0.22, 0.021, 0.95, -2.25],
  [72, 0.12, 0.15, 0.014, 0.75, -1.95],
  [112, 0.12, 0.15, 0.014, 0.75, -1.95],
  [150, 0.115, 0.145, 0.013, 0.8, -2.0],
];

function crabBodyGeo(seed) {
  const g = new THREE.SphereGeometry(1, 64, 40);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    let X = x * 0.15, Y = y * 0.085, Z = z * 0.17;
    if (y < 0) Y *= 0.55;
    if (z > 0) { X *= 1 - 0.2 * z * z; Y *= 1 - 0.12 * z; }
    Y += 0.03 * Math.max(0, y) * Math.exp(-((z + 0.25) ** 2) * 3);
    if (y > 0.1) Y += 0.0035 * Math.sin(z * 16) * y * (1 - Math.abs(x));
    Y -= 0.012 * Math.max(0, y) * Math.exp(-((x / 0.12) ** 2)) * Math.max(0, z); // shallow mid-groove on the front
    p.setXYZ(i, X, Y, Z);
  }
  return displace(g, 0.004, 28, seed);
}

export function createHeadcrab(opts = {}) {
  const seed = opts.seed ?? 1, clamped = !!opts.clamped;
  const R = rng(seed * 7919 + 13);
  const root = new THREE.Group(); root.name = 'headcrab';
  const geos = [], mats = [];
  const G = (g) => (geos.push(g), g), M = (m) => (mats.push(m), m);
  const crabMat = M(makeMat('crab'));
  if (opts.tint != null) crabMat.color.set(opts.tint);
  const clawMat = M(makeMat('bone', { color: 0x5a4030, clearcoat: 0.8, clearcoatRoughness: 0.2 }));
  const mouthMat = M(makeMat('flesh', { color: 0xc07070 }));
  const toothMat = M(makeMat('bone', { color: 0xf0e8d0 }));

  const bodyY = clamped ? 0 : 0.13;
  const body = joint(root, 0, bodyY, 0, 'crabBody');
  const shell = meshOf(G(crabBodyGeo(seed)), crabMat, body);
  // front "beak" lobes over the mouth
  const beakL = blob(0.05, 0.03, 0.05, 0.15, 3, seed + 3); G(beakL);
  meshOf(beakL, crabMat, body, [0.035, -0.012, 0.135], [0.3, 0.2, 0]);
  meshOf(beakL, crabMat, body, [-0.035, -0.012, 0.135], [0.3, -0.2, 0]);
  // dorsal ridge
  const ridgeG = G(taperTube([[0, 0.07, 0.13], [0, 0.105, 0.04], [0, 0.11, -0.06], [0, 0.085, -0.15]], 24, 0.012, 0.006, 8, (t) => 0.006 + 0.008 * Math.sin(Math.PI * Math.min(1, t * 1.3))));
  meshOf(ridgeG, crabMat, body);
  // ventral mouth: lip ring, throat, ring of teeth
  const mouth = joint(body, 0, -0.04, 0.05, 'mouth');
  mouth.rotation.x = Math.PI / 2 - 0.15;
  const lip = G(displace(new THREE.TorusGeometry(0.05, 0.018, 12, 36), 0.004, 40, seed + 5));
  meshOf(lip, mouthMat, mouth);
  const throat = G(new THREE.SphereGeometry(0.052, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2));
  meshOf(throat, M(new THREE.MeshStandardMaterial({ color: 0x1a0204, roughness: 0.3, side: THREE.BackSide })), mouth, [0, 0, -0.002], [-Math.PI / 2, 0, 0]);
  const teeth = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2, rr = 0.043 + R() * 0.004, l = 0.018 + R() * 0.01;
    const c = new THREE.ConeGeometry(0.0045, l, 6); c.translate(0, l / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-Math.cos(a) * 0.7, -Math.sin(a) * 0.7, 1).normalize());
    c.applyQuaternion(q); c.translate(Math.cos(a) * rr, Math.sin(a) * rr, 0.004);
    teeth.push(c);
  }
  meshOf(G(merge(teeth)), toothMat, mouth);

  // legs
  const legs = [];
  LEGS.forEach((cfg, li) => {
    for (const side of [1, -1]) {
      const a = cfg[0] * Math.PI / 180 * side, l1 = cfg[1], l2 = cfg[2], r = cfg[3];
      const dx = Math.sin(a), dz = Math.cos(a);
      const coxa = joint(body, dx * 0.125, -0.012, dz * 0.14);
      const yaw0 = Math.atan2(-dz, dx);
      coxa.rotation.y = yaw0;
      const fem = joint(coxa); fem.rotation.order = 'YZX';
      meshOf(G(taperTube([[-0.01, 0, 0], [l1 * 0.5, l1 * 0.07, 0], [l1, 0, 0]], 12, r * 1.15, r * 0.8, 10)), crabMat, fem);
      const knee = joint(fem, l1, 0, 0);
      const tib = merge([
        taperTube([[0, 0, 0], [l2 * 0.5, -l2 * 0.03, 0], [l2, 0, 0]], 14, r * 0.85, r * 0.38, 10),
        new THREE.SphereGeometry(r * 0.9, 12, 8),
      ]);
      meshOf(G(tib), crabMat, knee);
      const cl = r > 0.018 ? 0.06 : 0.04;
      meshOf(G(taperTube([[l2 - 0.004, 0, 0], [l2 + cl * 0.55, -cl * 0.08, 0], [l2 + cl, -cl * 0.42, 0]], 10, r * 0.42, 4e-4, 8)), clawMat, knee);
      legs.push({ coxa, fem, knee, yaw0, front: li === 0, rear: li === 3, side, off: li * 1.6 + (side > 0 ? 0 : Math.PI), lift0: cfg[4], bend0: cfg[5] });
    }
  });
  if (clamped) { // wrap down around a head
    for (const L of legs) {
      L.lift0 = L.front ? -0.7 : -0.95; L.bend0 = L.front ? -1.25 : -1.0;
      L.coxa.position.y -= 0.02;
    }
  }
  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  let t = R() * 10, ph = 0;
  const api = {
    root, height: 0.35, radius: 0.25, body, legs,
    update(dt, s = {}) {
      t += dt;
      const sp = s.speed || 0, at = s.attack || 0, hu = s.hurt || 0, de = s.dead || 0;
      ph += dt * (2 + 12 * sp);
      const breathe = Math.sin(t * (clamped ? 2.2 : 3.1));
      const crouch = at < 0.5 ? sstep(0, 0.5, at) : 1 - sstep(0.5, 0.65, at);
      const leap = at > 0.5 ? Math.sin(Math.min(1, (at - 0.5) / 0.5) * Math.PI) : 0;
      const leapPose = at > 0.5 ? sstep(0.5, 0.6, at) * (1 - sstep(0.92, 1, at)) : 0;
      const flip = sstep(0, 0.45, de), twitch = de > 0 ? (1 - sstep(0.4, 1, de)) * Math.sin(t * 23) : 0;
      // body
      body.position.y = mix(bodyY - crouch * 0.05 + leap * 0.32 + breathe * 0.002, 0.12, flip) + Math.sin(flip * Math.PI) * 0.12;
      if (clamped) body.position.y = breathe * 0.003;
      body.rotation.x = -0.25 * crouch * (1 - leapPose) - 0.55 * leapPose + Math.sin(ph * 2) * 0.03 * sp + Math.sin(t * 31) * 0.05 * hu;
      body.rotation.z = flip * Math.PI + Math.sin(t * 27) * 0.12 * hu + twitch * 0.05 + Math.sin(ph) * 0.04 * sp;
      body.scale.set(1 + breathe * 0.012, 1 - breathe * 0.02, 1 + breathe * 0.01);
      // legs
      for (let i = 0; i < legs.length; i++) {
        const L = legs[i];
        const c = Math.sin(ph + L.off), lift = Math.max(0, c);
        let lf = L.lift0 + sp * 0.4 * lift + Math.sin(t * 1.3 + L.off) * 0.03;
        let bd = L.bend0 - sp * 0.25 * lift;
        let yw = L.yaw0 + sp * 0.32 * Math.cos(ph + L.off) * L.side * (L.front ? -1 : 1);
        // crouch: front legs raised to grab, others fold
        lf = mix(lf, L.front ? 1.6 : L.lift0 + 0.35, crouch);
        bd = mix(bd, L.front ? -1.4 : L.bend0 - 0.5, crouch);
        // leap: front legs reach forward/outward, rear legs trail
        lf = mix(lf, L.front ? 0.35 : (L.rear ? -0.25 : 0.1), leapPose);
        bd = mix(bd, L.front ? -0.55 : -0.35, leapPose);
        // hurt splay
        lf += hu * (0.4 + 0.2 * Math.sin(t * 40 + i));
        // dead: curled up on its back, twitching
        lf = mix(lf, 1.35 + twitch * 0.25 * ((i & 1) ? 1 : -1), flip);
        bd = mix(bd, -2.5 + twitch * 0.3, flip);
        L.coxa.rotation.y = yw;
        L.fem.rotation.z = lf;
        L.knee.rotation.z = bd;
      }
    },
    dispose() {
      root.removeFromParent();
      geos.forEach((g) => g.dispose()); mats.forEach((m) => m.dispose());
    },
  };
  api.update(0, {});
  return api;
}
