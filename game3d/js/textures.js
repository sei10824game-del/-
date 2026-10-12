// 手続き生成のPBRテクスチャ (albedo / roughness / normal) — 外部アセット不要
import * as THREE from 'three';

function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function mk(size) { const c = document.createElement('canvas'); c.width = c.height = size; return [c, c.getContext('2d')]; }
function noiseField(size, scale, seed) { // 値ノイズ (周期的)
  const r = rng(seed), n = Math.ceil(size / scale), g = new Float32Array(n * n).map(() => r()), out = new Float32Array(size * size);
  const sm = t => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const fx = x / scale, fy = y / scale, x0 = Math.floor(fx) % n, y0 = Math.floor(fy) % n, x1 = (x0 + 1) % n, y1 = (y0 + 1) % n, tx = sm(fx - Math.floor(fx)), ty = sm(fy - Math.floor(fy));
    out[y * size + x] = (g[y0 * n + x0] * (1 - tx) + g[y0 * n + x1] * tx) * (1 - ty) + (g[y1 * n + x0] * (1 - tx) + g[y1 * n + x1] * tx) * ty;
  }
  return out;
}
function fbm(size, seed, base = 64, oct = 4) {
  const out = new Float32Array(size * size); let amp = 1, tot = 0;
  for (let o = 0; o < oct; o++) { const f = noiseField(size, Math.max(2, base >> o), seed + o * 17); for (let i = 0; i < out.length; i++) out[i] += f[i] * amp; tot += amp; amp *= .5; }
  for (let i = 0; i < out.length; i++) out[i] /= tot;
  return out;
}
function normalFromHeight(h, size, strength) {
  const [c, g] = mk(size), img = g.createImageData(size, size), d = img.data;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const L = h[y * size + (x + size - 1) % size], R = h[y * size + (x + 1) % size], U = h[((y + size - 1) % size) * size + x], D = h[((y + 1) % size) * size + x];
    let nx = (L - R) * strength, ny = (U - D) * strength, nz = 1, l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    const i = (y * size + x) * 4; d[i] = (nx * .5 + .5) * 255; d[i + 1] = (ny * .5 + .5) * 255; d[i + 2] = (nz * .5 + .5) * 255; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0); return c;
}
function tex(canvas, srgb, repeat) {
  const t = new THREE.CanvasTexture(canvas); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.repeat.set(repeat[0], repeat[1]); return t;
}
function grayCanvas(h, size, map) {
  const [c, g] = mk(size), img = g.createImageData(size, size);
  for (let i = 0; i < h.length; i++) { const v = map(h[i], i) * 255; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
  g.putImageData(img, 0, 0); return c;
}

const cache = {};
// 'wood' 'plaster' 'wallpaper' 'carpet' 'marble' 'metal' 'brick'
export function pbr(kind, repeat = [1, 1], opts = {}) {
  const key = kind + repeat.join(','); if (cache[key] && !opts.fresh) return cache[key];
  const S = 512, r = rng(kind.length * 977 + 3), n1 = fbm(S, 11, 128, 5), n2 = fbm(S, 29, 16, 3);
  const [col, g] = mk(S); const img = g.createImageData(S, S), d = img.data, h = new Float32Array(S * S), rough = new Float32Array(S * S);
  const set = (i, R, G, B) => { d[i * 4] = R; d[i * 4 + 1] = G; d[i * 4 + 2] = B; d[i * 4 + 3] = 255; };
  let metal = 0, nStr = 2;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, a = n1[i], b = n2[i];
    if (kind === 'wood') { // 板張りフローリング
      const pw = 128, pl = Math.floor(x / pw), off = ((pl * 97) % 7) * 70, py = (y + off) % S, seam = (x % pw < 2) || (py % 256 < 2), grain = Math.sin((y * .06 + a * 14 + pl * 5)) * .5 + .5, tone = .62 + (rng(pl * 31 + Math.floor((y + off) / 256) * 7)() - .5) * .35;
      const v = (tone + (grain - .5) * .18 + (b - .5) * .12) * (seam ? .35 : 1);
      set(i, 92 * v * 1.8, 58 * v * 1.8, 34 * v * 1.8); h[i] = seam ? 0 : .5 + grain * .08 + b * .05; rough[i] = .5 + b * .25 + (seam ? .3 : 0); nStr = 3;
    } else if (kind === 'plaster') {
      const v = .72 + (a - .5) * .35 + (b - .5) * .1, stain = Math.max(0, a - .62) * 2.2; set(i, (150 * v) * (1 - stain * .45), (142 * v) * (1 - stain * .5), (128 * v) * (1 - stain * .6)); h[i] = a * .7 + b * .3; rough[i] = .85 + b * .1; nStr = 2.2;
    } else if (kind === 'wallpaper') {
      const cx = x % 128 - 64, cy = y % 128 - 64, dm = Math.abs(cx) + Math.abs(cy), motif = dm < 26 && dm > 14 ? 1 : 0, stripe = Math.sin(x / 128 * Math.PI * 2 * 2) * .5 + .5;
      const base = .55 + stripe * .08 + (a - .5) * .3; const stain = Math.max(0, a - .66) * 2;
      set(i, (118 * base + motif * 28) * (1 - stain * .4), (34 * base + motif * 12) * (1 - stain * .5), (40 * base + motif * 10) * (1 - stain * .5)); h[i] = motif * .15 + b * .1 + a * .2; rough[i] = .8; nStr = 2.5;
    } else if (kind === 'carpet') {
      const fib = r(), v = .5 + (a - .5) * .3 + (fib - .5) * .35; const border = (x % 256 < 14 || y % 256 < 14) ? 1.3 : 1; set(i, 100 * v * border, 28 * v * border, 30 * v * border); h[i] = fib * .6 + b * .2; rough[i] = .95; nStr = 4;
    } else if (kind === 'marble') {
      const vein = Math.abs(Math.sin((x + y) * .015 + a * 9)), v = .78 + (b - .5) * .1 - Math.pow(1 - vein, 14) * .35; const tile = (x % 256 < 2 || y % 256 < 2) ? .4 : 1; set(i, 200 * v * tile, 198 * v * tile, 192 * v * tile); h[i] = (x % 256 < 2 || y % 256 < 2) ? 0 : .5; rough[i] = .18 + (1 - vein) * .1; nStr = 1.5;
    } else if (kind === 'metal') {
      const sc = Math.sin(y * 1.7 + a * 20) * .5 + .5, v = .5 + (a - .5) * .3 + sc * .08, rust = Math.max(0, a - .55) * 2.4; set(i, (150 * v) * (1 + rust * .5), (150 * v) * (1 - rust * .3), (155 * v) * (1 - rust * .8)); h[i] = sc * .2 + a * .3; rough[i] = .35 + rust * .5; metal = 1; nStr = 2;
    } else if (kind === 'brick') {
      const bh = 32, bw = 96, row = Math.floor(y / bh), xo = (row % 2) * bw / 2, bx = (x + xo) % bw, by = y % bh, mortar = bx < 4 || by < 4, bi = rng(Math.floor((x + xo) / bw) * 13 + row * 101)();
      const v = mortar ? .55 : .5 + bi * .25 + (b - .5) * .2; set(i, mortar ? 120 * v * 1.4 : 140 * v, mortar ? 115 * v * 1.4 : 62 * v, mortar ? 105 * v * 1.4 : 46 * v); h[i] = mortar ? 0 : .6 + b * .2; rough[i] = mortar ? .95 : .8; nStr = 5;
    }
  }
  g.putImageData(img, 0, 0);
  const mat = new THREE.MeshStandardMaterial({
    map: tex(col, true, repeat), normalMap: tex(normalFromHeight(h, S, nStr), false, repeat), roughnessMap: tex(grayCanvas(rough, S, v => v), false, repeat),
    roughness: 1, metalness: metal ? .8 : 0, normalScale: new THREE.Vector2(1, 1)
  });
  cache[key] = mat; return mat;
}

// 汎用: 生肉・血のデカール用の丸いテクスチャ
export function bloodTexture() {
  const [c, g] = mk(128), gr = g.createRadialGradient(64, 64, 2, 64, 64, 62); gr.addColorStop(0, 'rgba(110,5,8,.95)'); gr.addColorStop(.6, 'rgba(80,4,6,.7)'); gr.addColorStop(1, 'rgba(60,3,4,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const r = rng(5);
  for (let i = 0; i < 26; i++) { const a = r() * 6.28, l = 20 + r() * 40; g.fillStyle = 'rgba(90,4,6,.8)'; g.beginPath(); g.arc(64 + Math.cos(a) * l, 64 + Math.sin(a) * l, 1 + r() * 3.5, 0, 6.28); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function softSprite() {
  const [c, g] = mk(64), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
