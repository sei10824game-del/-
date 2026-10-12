// Blenderで作ったGLB(スキン+アニメーション)を、ゲームのモデル規約 {root,height,radius,update(dt,s)} に包む
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

const loader = new GLTFLoader(), cache = new Map();
function load(url) { if (!cache.has(url)) cache.set(url, new Promise((res, rej) => loader.load(url, res, undefined, rej))); return cache.get(url); }

export async function createGLBModel(url, { height, radius, scale = 1 } = {}) {
  const gltf = await load(url), root = new THREE.Group(), model = clone(gltf.scene);
  model.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; o.frustumCulled = false; if (o.material && o.material.map) o.material.map.anisotropy = 8; } });
  const box = new THREE.Box3().setFromObject(model), h = box.max.y - box.min.y; if (height) model.scale.setScalar(height / h * scale);
  root.add(model);
  const mixer = new THREE.AnimationMixer(model), A = {};
  for (const c of gltf.animations) { const key = c.name.replace(/^.*[|:]/, '').toLowerCase(); A[key] = mixer.clipAction(c); }
  for (const k of ['attack', 'hurt', 'death']) if (A[k]) { A[k].setLoop(THREE.LoopOnce, 1); A[k].clampWhenFinished = true; }
  let cur = null, hurtT = 0, dead = false;
  const play = (name, fade = .25) => { const n = A[name] || A.idle; if (!n || n === cur) return; n.reset().fadeIn(fade).play(); if (cur) cur.fadeOut(fade); cur = n; };
  play('idle', 0); if (cur) cur.time = Math.random() * cur.getClip().duration;
  return {
    root, height: height || h, radius: radius || .35,
    update(dt, s) {
      if (dead) { mixer.update(dt); return; }
      if (s.dead > 0) { dead = true; play('death', .15); mixer.update(dt); return; }
      hurtT = Math.max(0, hurtT - dt);
      if (s.hurt > .8 && hurtT <= 0 && A.hurt) { hurtT = 1; A.hurt.reset(); cur && cur.fadeOut(.1); A.hurt.fadeIn(.05).play(); cur = A.hurt; }
      else if (hurtT <= 0) {
        if (s.attack > .5 && A.attack) { if (cur !== A.attack) { A.attack.reset(); } play('attack', .15); if (cur === A.attack && !A.attack.isRunning()) A.attack.reset().play(); }
        else play(s.speed > .55 && A.run ? 'run' : s.speed > .12 ? 'walk' : 'idle');
      }
      if (cur === A.walk) cur.timeScale = .6 + s.speed * 1.2; else if (cur) cur.timeScale = 1;
      mixer.update(dt);
    },
    dispose() { mixer.stopAllAction(); model.traverse(o => { if (o.isMesh) o.geometry.dispose(); }); }
  };
}
export async function glbExists(url) { try { const r = await fetch(url, { method: 'HEAD' }); return r.ok; } catch (e) { return false; } }
