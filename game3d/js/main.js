import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildWorld, resolve } from './world.js';
import { bloodTexture, softSprite } from './textures.js';
import { makeActor, ACTOR_KINDS } from './actors.js';

const Q = new URLSearchParams(location.search).get('q') || 'high';
const renderer = new THREE.WebGLRenderer({ antialias: Q === 'low', powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, Q === 'high' ? 1.5 : 1)); renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x020204); scene.fog = new THREE.FogExp2(0x050608, .022);
const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .12;
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, .05, 120); scene.add(camera);
scene.add(new THREE.HemisphereLight(0x8090b0, 0x201810, .22));

const world = buildWorld(scene, Q);
const { colliders } = world;

// ---------- ポストプロセス ----------
const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
let gtao = null;
if (Q !== 'low') { gtao = new GTAOPass(scene, camera, innerWidth, innerHeight); gtao.output = GTAOPass.OUTPUT.Default; gtao.updateGtaoMaterial({ radius: .6, distanceExponent: 1.4, thickness: 1.5, scale: 1.1, samples: 12 }); composer.addPass(gtao); }
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .45, .7, .88); if (Q !== 'low') composer.addPass(bloom);
composer.addPass(new OutputPass());
if (Q === 'high') composer.addPass(new SMAAPass(innerWidth * renderer.getPixelRatio(), innerHeight * renderer.getPixelRatio()));
const filmShader = {
  uniforms: { tDiffuse: { value: null }, t: { value: 0 }, hurt: { value: 0 } },
  vertexShader: 'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: `uniform sampler2D tDiffuse;uniform float t,hurt;varying vec2 v;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+t)*43758.5453);}
  void main(){vec2 c=v-.5;float d=dot(c,c);vec2 o=c*d*.012;
  vec3 col=vec3(texture2D(tDiffuse,v+o).r,texture2D(tDiffuse,v).g,texture2D(tDiffuse,v-o).b);
  col*=1.-smoothstep(.08,.62,d)*.85; col+=(h(v*900.)-.5)*.035; col=mix(col,col*vec3(1.,.25,.25)+vec3(.15,0.,0.)*hurt,hurt*.6);
  gl_FragColor=vec4(col,1.);}`
};
const film = new ShaderPass(filmShader); composer.addPass(film);

// ---------- プレイヤー ----------
const P = { pos: new THREE.Vector3(world.total / 2, 0, world.total - 2.2), vy: 0, yaw: 0, pitch: 0, hp: 100, ammo: 12, reserve: 120, onGround: true, r: .34, eye: 1.65, bob: 0, flash: true, reload: 0, kick: 0, shake: 0 };
const keys = {}; let locked = false;
const flashlight = new THREE.SpotLight(0xfff0d8, 26, 28, .5, .55, 1.5); flashlight.castShadow = Q !== 'low'; flashlight.shadow.mapSize.set(1024, 1024); flashlight.shadow.bias = -.0003; flashlight.shadow.camera.near = .1; flashlight.position.set(.15, -.1, 0); camera.add(flashlight, flashlight.target); flashlight.target.position.set(0, 0, -5);
const muzzle = new THREE.PointLight(0xffb060, 0, 9, 2); muzzle.position.set(.2, -.1, -.8); camera.add(muzzle);
const gun = new THREE.Group(); { const m = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: .35, metalness: .9 }); const slide = new THREE.Mesh(new THREE.BoxGeometry(.04, .05, .2), m), grip = new THREE.Mesh(new THREE.BoxGeometry(.036, .1, .05), new THREE.MeshStandardMaterial({ color: .1, roughness: .8 })); slide.position.set(0, 0, -.05); grip.position.set(0, -.085, .03); grip.rotation.x = .2; gun.add(slide, grip); slide.castShadow = grip.castShadow = false; gun.scale.setScalar(.7); gun.position.set(.16, -.16, -.34); camera.add(gun); }

addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'KeyF') { P.flash = !P.flash; click(); } if (e.code === 'KeyR') reload(); if (e.code === 'KeyQ') toggleMenu(); if (e.code === 'Tab') e.preventDefault(); });
addEventListener('keyup', e => keys[e.code] = false);
addEventListener('mousemove', e => { if (!locked) return; P.yaw -= e.movementX * .0022; P.pitch = Math.max(-1.5, Math.min(1.5, P.pitch - e.movementY * .0022)); });
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === renderer.domElement; ui.start.style.display = locked || menuOpen ? 'none' : 'flex'; });
renderer.domElement.addEventListener('mousedown', e => { if (!locked) return; if (e.button === 0) shoot(); else if (e.button === 2) grabStart(); });
renderer.domElement.addEventListener('mouseup', e => { if (e.button === 2) grabEnd(); });
addEventListener('contextmenu', e => e.preventDefault());
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); });

// ---------- UI ----------
const ui = {};
document.body.insertAdjacentHTML('beforeend', `<style>#hud{position:fixed;inset:0;pointer-events:none;font-family:system-ui,sans-serif;color:#e8e0d0;text-shadow:0 1px 3px #000}#cross{position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px;border-radius:50%;background:#fff8;box-shadow:0 0 0 1px #0008}
#stats{position:absolute;left:24px;bottom:20px;font-size:26px;letter-spacing:1px}#stats small{font-size:12px;opacity:.7;display:block}#fps{position:absolute;right:12px;top:8px;font-size:11px;opacity:.6}
#start{position:fixed;inset:0;background:#000c;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;cursor:pointer;color:#e8e0d0;font-family:system-ui;text-align:center;line-height:1.6}#start h1{margin:0;font-weight:300;letter-spacing:6px}
#menu{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);background:#101216ee;border:1px solid #444;border-radius:8px;padding:14px;display:none;grid-template-columns:repeat(4,120px);gap:8px;font-family:system-ui;color:#ddd;z-index:5}#menu button{background:#1c2026;color:#ddd;border:1px solid #3a3f48;border-radius:6px;padding:10px 4px;cursor:pointer;font-size:13px}#menu button:hover{background:#2c333d}#menu h3{grid-column:1/-1;margin:0 0 4px;font-weight:400}
#log{position:absolute;left:24px;top:16px;font-size:13px;opacity:.85}</style>
<div id="hud"><div id="cross"></div><div id="stats"></div><div id="fps"></div><div id="log"></div></div>
<div id="start"><h1>洋館サンドボックス 3D</h1><div>クリックで開始<br><small>WASD 移動 / Shift 走る / Space ジャンプ / マウス 視点 / 左クリック 発砲 / 右クリック(押しっぱなし) 物を掴む<br>F ライト / R リロード / Q スポーンメニュー</small></div></div><div id="menu"></div>`);
ui.stats = document.getElementById('stats'); ui.fps = document.getElementById('fps'); ui.log = document.getElementById('log'); ui.start = document.getElementById('start'); ui.menu = document.getElementById('menu');
ui.start.addEventListener('click', () => { Audio.ctx(); renderer.domElement.requestPointerLock(); menuClose(); });
let menuOpen = false;
const MENU = [['ゾンビ', 'zombie'], ['ヘッドクラブ', 'headcrab'], ['生存者', 'human'], ['木箱', 'crate'], ['樽', 'barrel'], ['ボール', 'ball'], ['ライト', 'bulb'], ['全消去', 'clear']];
ui.menu.innerHTML = '<h3>スポーン (視線の先に出現)</h3>' + MENU.map(([n, k]) => `<button data-k="${k}">${n}</button>`).join('');
ui.menu.addEventListener('click', e => { const k = e.target.dataset && e.target.dataset.k; if (!k) return; spawn(k); });
function toggleMenu() { menuOpen ? menuClose(true) : menuOpenF(); }
function menuOpenF() { menuOpen = true; ui.menu.style.display = 'grid'; document.exitPointerLock(); ui.start.style.display = 'none'; }
function menuClose(relock) { menuOpen = false; ui.menu.style.display = 'none'; if (relock) renderer.domElement.requestPointerLock(); }
let logT = 0; function say(t) { ui.log.textContent = t; logT = 3; }

// ---------- 音 (WebAudio合成) ----------
const Audio = {
  c: null, ctx() { if (!this.c) { try { this.c = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } return this.c; },
  noise(dur, vol, f0, f1, type = 'lowpass') { const c = this.c; if (!c) return; const n = c.sampleRate * dur | 0, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2); const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(f0, c.currentTime); f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), c.currentTime + dur); const g = c.createGain(); g.gain.value = vol; s.connect(f); f.connect(g); g.connect(c.destination); s.start(); },
  osc(type, f0, f1, dur, vol) { const c = this.c; if (!c) return; const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, c.currentTime); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), c.currentTime + dur); const g = c.createGain(); g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + dur); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + dur); },
  shot() { this.noise(.35, .7, 5000, 200); this.osc('sine', 140, 40, .18, .8); }, hit() { this.noise(.12, .4, 900, 150); }, groan() { this.osc('sawtooth', 90 + Math.random() * 30, 45, .7, .12); this.noise(.6, .1, 500, 120, 'bandpass'); }, click() { this.osc('square', 1200, 600, .03, .08); }, claw() { this.noise(.18, .25, 3000, 400, 'bandpass'); }
};
function click() { Audio.click(); }

// ---------- 血・パーティクル ----------
const bloodTex = bloodTexture(), spark = softSprite();
const parts = []; const partGeo = new THREE.BufferGeometry(); const MAXP = 600; const pPos = new Float32Array(MAXP * 3), pCol = new Float32Array(MAXP * 3);
partGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); partGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
const partMat = new THREE.PointsMaterial({ size: .06, vertexColors: true, map: spark, transparent: true, depthWrite: false, sizeAttenuation: true }); const partPts = new THREE.Points(partGeo, partMat); partPts.frustumCulled = false; scene.add(partPts);
function burst(p, n, col, spd, up = 1) { for (let i = 0; i < n && parts.length < MAXP; i++) parts.push({ p: p.clone(), v: new THREE.Vector3((Math.random() - .5) * spd, Math.random() * spd * up, (Math.random() - .5) * spd), life: .6 + Math.random() * .8, col }); }
const decals = []; const decalGeo = new THREE.PlaneGeometry(1, 1);
function decal(x, y, z, size, nrm, mat) { const m = new THREE.Mesh(decalGeo, mat || new THREE.MeshBasicMaterial({ map: bloodTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, opacity: .9 })); m.position.set(x, y, z); m.scale.setScalar(size); if (nrm) { m.lookAt(m.position.clone().add(nrm)); } else m.rotation.x = -Math.PI / 2; m.rotateZ(Math.random() * 6.28); scene.add(m); decals.push(m); if (decals.length > 80) { const o = decals.shift(); scene.remove(o); } }
function updateParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life -= dt; p.v.y -= 9 * dt; p.p.addScaledVector(p.v, dt); if (p.p.y < .02) { if (p.col === 0) decal(p.p.x, .015, p.p.z, .1 + Math.random() * .25); parts.splice(i, 1); continue; } if (p.life <= 0) parts.splice(i, 1); }
  for (let i = 0; i < MAXP; i++) { const p = parts[i]; if (p) { pPos[i * 3] = p.p.x; pPos[i * 3 + 1] = p.p.y; pPos[i * 3 + 2] = p.p.z; const c = p.col === 0 ? [.4, .02, .03] : [1, .8, .4]; pCol[i * 3] = c[0]; pCol[i * 3 + 1] = c[1]; pCol[i * 3 + 2] = c[2]; } else { pPos[i * 3 + 1] = -99; } }
  partGeo.attributes.position.needsUpdate = partGeo.attributes.color.needsUpdate = true;
}

// ---------- アクターと物理プロップ ----------
const actors = [], bodies = [];
function groundSpawn() { const d = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), P.yaw); const p = P.pos.clone().addScaledVector(d, 3.5); const r = { x: p.x, z: p.z }; resolve(r, .5, colliders); return { x: r.x, z: r.z, d }; }
async function spawn(kind) {
  if (kind === 'clear') { for (const a of actors) scene.remove(a.root); actors.length = 0; for (const b of bodies) scene.remove(b.mesh); bodies.length = 0; decals.forEach(d => scene.remove(d)); decals.length = 0; say('全消去'); return; }
  const g = groundSpawn();
  if (ACTOR_KINDS.includes(kind)) { const a = await makeActor(kind); a.root.position.set(g.x, 0, g.z); scene.add(a.root); a.pos = a.root.position; actors.push(a); say(a.name + ' をスポーン'); }
  else if (kind === 'bulb') { const L = new THREE.PointLight(0xffc880, 8, 12, 1.6); L.position.set(g.x, 1.6, g.z); const s = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfff0c0 })); L.add(s); scene.add(L); say('ライト'); }
  else {
    let geo, mat, r; if (kind === 'crate') { geo = new THREE.BoxGeometry(.8, .8, .8); mat = new THREE.MeshStandardMaterial({ color: 0x8a6a40, roughness: .85 }); r = .5; } else if (kind === 'barrel') { geo = new THREE.CylinderGeometry(.32, .32, .9, 20); mat = new THREE.MeshStandardMaterial({ color: 0x3a5a3a, roughness: .45, metalness: .6 }); r = .34; } else { geo = new THREE.SphereGeometry(.3, 24, 18); mat = new THREE.MeshStandardMaterial({ color: 0xc03030, roughness: .3 }); r = .3; }
    const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = mesh.receiveShadow = true; mesh.position.set(g.x, 1.4, g.z); scene.add(mesh); bodies.push({ mesh, v: new THREE.Vector3(), r, h: kind === 'barrel' ? .45 : kind === 'ball' ? .3 : .4, held: false, spin: new THREE.Vector3() }); say(kind + ' をスポーン');
  }
}
let held = null, holdDist = 2.4;
function lookDir(out = new THREE.Vector3()) { return out.set(0, 0, -1).applyQuaternion(camera.quaternion); }
function grabStart() { const o = camera.position, d = lookDir(), best = pickBody(o, d, 7); if (best) { held = best; best.held = true; holdDist = Math.max(1.2, Math.min(4, best.mesh.position.distanceTo(o))); } }
function grabEnd() { if (held) { held.held = false; held.v.addScaledVector(lookDir(), 6); held = null; } }
function pickBody(o, d, max) { let best = null, bt = max; for (const b of bodies) { const to = b.mesh.position.clone().sub(o), t = to.dot(d); if (t < 0 || t > bt) continue; const dist = to.sub(d.clone().multiplyScalar(t)).length(); if (dist < b.r + .1) { best = b; bt = t; } } return best; }
function updateBodies(dt) {
  for (const b of bodies) {
    const m = b.mesh; if (b.held) { const tgt = camera.position.clone().addScaledVector(lookDir(), holdDist); b.v.copy(tgt.sub(m.position).multiplyScalar(14)); m.position.addScaledVector(b.v, dt); b.v.multiplyScalar(.6); m.rotation.y += dt; continue; }
    b.v.y -= 9.8 * dt; m.position.addScaledVector(b.v, dt);
    if (m.position.y < b.h) { m.position.y = b.h; if (b.v.y < -2) Audio.hit(); b.v.y *= -.35; b.v.x *= .88; b.v.z *= .88; }
    const p2 = { x: m.position.x, z: m.position.z }; const ox = p2.x, oz = p2.z; resolve(p2, b.r, colliders); if (p2.x !== ox || p2.z !== oz) { const nx = p2.x - ox, nz = p2.z - oz; const l = Math.hypot(nx, nz) || 1; const dn = (b.v.x * nx + b.v.z * nz) / l; if (dn < 0) { b.v.x -= 1.6 * dn * nx / l; b.v.z -= 1.6 * dn * nz / l; } m.position.x = p2.x; m.position.z = p2.z; }
    const dx = m.position.x - P.pos.x, dz = m.position.z - P.pos.z, dd = Math.hypot(dx, dz); if (dd < b.r + P.r && m.position.y < 1.8) { const push = (b.r + P.r - dd); m.position.x += dx / (dd || 1) * push; m.position.z += dz / (dd || 1) * push; b.v.x += dx / (dd || 1) * 2.5; b.v.z += dz / (dd || 1) * 2.5; }
    const sp = Math.hypot(b.v.x, b.v.z); if (b.h < .4 || b.r === .3) { m.rotation.z -= b.v.x * dt / b.r; m.rotation.x += b.v.z * dt / b.r; }
  }
}

// ---------- 射撃 ----------
const ray = new THREE.Raycaster();
function reload() { if (P.reload > 0 || P.ammo === 12 || P.reserve <= 0) return; P.reload = 1.4; Audio.noise(.1, .3, 3000, 800, 'highpass'); }
function shoot() {
  if (P.reload > 0) return; if (P.ammo <= 0) { reload(); return; } P.ammo--; P.kick = 1; P.shake = .5; muzzle.intensity = 40; Audio.shot();
  const o = camera.position.clone(), d = lookDir(); let tMax = 60, wallHit = null;
  // 壁との交差 (XZ平面のAABBレイ)
  for (const c of colliders) { const t = rayAABB(o, d, c, tMax); if (t != null && t < tMax) { tMax = t; wallHit = c; } }
  if (d.y < -1e-4) { const t = -o.y / d.y; if (t > 0 && t < tMax) { tMax = t; wallHit = 'floor'; } }
  let hitA = null, ha = tMax;
  for (const a of actors) { if (a.dead) continue; const t = rayCapsule(o, d, a.pos, a.height, a.radius); if (t != null && t < ha) { ha = t; hitA = a; } }
  const hb = pickBody(o, d, Math.min(tMax, 60));
  if (hitA) { const hp = o.clone().addScaledVector(d, ha); const head = hp.y > a_h(hitA) * .78; burst(hp, 14, 0, 3, 1); hitA.damage(head ? 70 : 30, hp, d); Audio.hit(); if (hp.y < 1.2) decal(hp.x, .015, hp.z, .4 + Math.random() * .3); }
  else if (hb && true) { hb.v.addScaledVector(d, 4); const hp = o.clone().addScaledVector(d, hb.mesh.position.distanceTo(o)); burst(hp, 6, 1, 2); }
  else { const hp = o.clone().addScaledVector(d, tMax); burst(hp, 6, 1, 2); if (wallHit && wallHit !== 'floor') { const n = new THREE.Vector3(); const c = wallHit; if (Math.abs(hp.x - c.x0) < .02) n.set(-1, 0, 0); else if (Math.abs(hp.x - c.x1) < .02) n.set(1, 0, 0); else if (Math.abs(hp.z - c.z0) < .02) n.set(0, 0, -1); else n.set(0, 0, 1); decal(hp.x + n.x * .01, hp.y, hp.z + n.z * .01, .12, n, new THREE.MeshBasicMaterial({ color: 0x050505, transparent: true, opacity: .8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })); } }
  for (const a of actors) if (!a.dead && a.pos.distanceTo(P.pos) < 25) a.alert(P.pos);
}
const a_h = a => a.height;
function rayAABB(o, d, c, max) { let t0 = 0, t1 = max; for (const [oo, dd, lo, hi] of [[o.x, d.x, c.x0, c.x1], [o.z, d.z, c.z0, c.z1]]) { if (Math.abs(dd) < 1e-9) { if (oo < lo || oo > hi) return null; } else { let a = (lo - oo) / dd, b = (hi - oo) / dd; if (a > b) [a, b] = [b, a]; t0 = Math.max(t0, a); t1 = Math.min(t1, b); if (t0 > t1) return null; } } const hy = o.y + d.y * t0; if (hy < 0 || hy > 3.4) return null; return t0; }
function rayCapsule(o, d, pos, h, r) { // 垂直カプセル (y 0..h) の近似: 円柱
  const ox = o.x - pos.x, oz = o.z - pos.z, a = d.x * d.x + d.z * d.z, b = 2 * (ox * d.x + oz * d.z), c = ox * ox + oz * oz - r * r; if (a < 1e-9) return null; const disc = b * b - 4 * a * c; if (disc < 0) return null; const t = (-b - Math.sqrt(disc)) / (2 * a); if (t < 0) return null; const y = o.y + d.y * t; if (y < 0 || y > h) return null; return t;
}

// ---------- メインループ ----------
const clock = new THREE.Clock(); let fpsT = 0, fpsN = 0; const mv = new THREE.Vector3();
function playerUpdate(dt) {
  const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0), run = keys.ShiftLeft ? 1.7 : 1, spd = 3.2 * run;
  mv.set(s, 0, -f); if (mv.lengthSq() > 0) mv.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), P.yaw).multiplyScalar(spd * dt);
  if (locked || menuOpen) { P.pos.add(mv); resolve(P.pos, P.r, colliders); }
  if (keys.Space && P.onGround && locked) { P.vy = 4.2; P.onGround = false; }
  P.vy -= 12 * dt; P.pos.y += P.vy * dt; if (P.pos.y <= 0) { P.pos.y = 0; P.vy = 0; P.onGround = true; }
  const moving = mv.lengthSq() > 0 && P.onGround; P.bob += dt * (moving ? 9 * run * .8 : 0);
  camera.position.set(P.pos.x, P.pos.y + P.eye + Math.sin(P.bob) * (moving ? .04 : 0), P.pos.z);
  const sh = P.shake * (Math.random() - .5) * .02; camera.rotation.order = 'YXZ'; camera.rotation.set(P.pitch + sh + P.kick * .02, P.yaw + sh, Math.sin(P.bob * .5) * (moving ? .004 : 0));
  P.kick = Math.max(0, P.kick - dt * 8); P.shake = Math.max(0, P.shake - dt * 4); muzzle.intensity = Math.max(0, muzzle.intensity - dt * 400);
  gun.position.set(.2 + Math.sin(P.bob * .5) * .006, -.2 + P.kick * .02 - Math.abs(Math.cos(P.bob)) * (moving ? .008 : 0), -.38 + P.kick * .06); gun.rotation.x = P.kick * .25;
  flashlight.intensity = P.flash ? 26 : 0;
  if (P.reload > 0) { P.reload -= dt; gun.rotation.x = -.6; if (P.reload <= 0) { const n = Math.min(12 - P.ammo, P.reserve); P.ammo += n; P.reserve -= n; } }
  if (P.hp <= 0) { P.hp = 100; P.pos.set(world.total / 2, 0, world.total - 2.2); say('倒れた… 玄関から再開'); }
}
function loop() {
  const dt = Math.min(.05, clock.getDelta()), t = clock.elapsedTime;
  playerUpdate(dt); world.update(dt, t); updateBodies(dt); updateParts(dt);
  for (const a of actors) a.update(dt, { player: P, colliders, actors, hurtPlayer: (n, from) => { P.hp -= n; film.uniforms.hurt.value = 1; Audio.claw(); P.shake = 1; }, burst, decal, groan: () => Audio.groan() });
  film.uniforms.t.value = t % 10; film.uniforms.hurt.value = Math.max(0, film.uniforms.hurt.value - dt * 2 + (P.hp < 30 ? 0 : 0));
  logT -= dt; if (logT <= 0) ui.log.textContent = '';
  ui.stats.innerHTML = `<small>HP</small>${Math.max(0, P.hp | 0)}　<small style="display:inline">弾 ${P.reload > 0 ? 'リロード中' : P.ammo + ' / ' + P.reserve}</small>`;
  fpsN++; fpsT += dt; if (fpsT > .5) { ui.fps.textContent = (fpsN / fpsT | 0) + ' fps / ' + Q; fpsT = 0; fpsN = 0; }
  composer.render();
  requestAnimationFrame(loop);
}
window.__g = { THREE, scene, camera, P, world, spawn, actors, bodies, shoot, composer, renderer, say, keys, setLocked(v) { locked = v; }, parts, burst };
loop();
