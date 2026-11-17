function updateAttack(u, dt) {
  const a = u.atk;
  if (!a) { u.state = 'idle'; return; }
  const d = a.def;
  a.t += dt * ((u.atkSlow || 0) > 0 ? .55 : 1);
  const total = d.windup + d.active + d.rec;
  const tgt = a.tgt;
  if (tgt && !tgt.gone && !tgt.dead && a.t < d.windup) u.faceA = angLerp(u.faceA, angTo(u.x, u.y, tgt.x, tgt.y), .3);
  if (tgt && (tgt.gone || tgt.dead) && a.t < d.windup * .6 && d.type !== 'aoe' && d.type !== 'roar') {
    u.state = 'idle'; u.st = 0; u.atk = null; return;
  }
  // 掴み攻撃のランジ: 構え中に獲物へ一気に距離を詰める
  if (!a.fired && d.type === 'grab' && tgt && !tgt.gone && !tgt.dead) {
    const gd = dist(u.x, u.y, tgt.x, tgt.y);
    if (gd > u.r + tgt.r + 6) {
      const ls = u.runSpd * 1.5 * u.spdMul;
      const a2 = angTo(u.x, u.y, tgt.x, tgt.y);
      tryMove(u, Math.cos(a2) * ls * dt, Math.sin(a2) * ls * dt);
      u.moveSpd = ls;
    } else u.moveSpd = 0;
  }
  if (!a.fired && a.t >= d.windup) { a.fired = true; fireAttack(u, d, a); }
  if (!u.atk) return; // 寄生などで攻撃が中断された
  if (d.type === 'run') { runAttackStep(u, d, a, dt); if (!u.atk) return; }
  // マルチヒット
  if (d.multi && a.fired) {
    while(a.hitCount<d.multi&&a.nextHit<=Math.min(a.t,d.windup+d.active)){
      a.hitCount++;a.nextHit=d.windup+a.hitCount*d.active/d.multi;
      if(tgt&&!tgt.gone&&!tgt.dead)meleeHitCheck(u,d,a,tgt);
      if(!u.atk||u.gone)return;
    }
  }
  if(d.type==='melee'&&!d.multi&&a.fired&&a.t<=d.windup+d.active&&tgt&&!tgt.gone&&!tgt.dead)meleeHitCheck(u,d,a,tgt);
  // ダッシュ/リープの接触判定
  if (a.fired && (d.type === 'dash') && a.t < d.windup + d.active) {
    const sp = d.dash / d.active;
    u.kvx = Math.cos(u.faceA) * sp; u.kvy = Math.sin(u.faceA) * sp;
    if (d.chargeGrab) chargeContact(u, d, a); // チャージャー: 最初の敵を掴んで叩きつけ
    else contactCheck(u, d, a);
    if (!u.atk) return; // 掴みに移行した
  }
  if (a.fired && u.leap && u.leap.t < u.leap.T) {
    u.leap.t += dt;
    const f = clamp(u.leap.t / u.leap.T, 0, 1);
    u.z = 4 * u.leap.h * f * (1 - f);
    tryMove(u, u.leap.vx * dt, u.leap.vy * dt);
    u.moveSpd = Math.hypot(u.leap.vx, u.leap.vy);
    if (u.sp.ai === 'hugger') huggerContact(u, d, a);
    else contactCheck(u, d, a);
    if (f >= 1) {
      u.z = 0; u.leap = null;
      if (d.type === 'leap') leapLandHit(u, d, a);
      // 飛び乗り後の組み付き (ハンターのマウント等)
      if (d.grabAfter && !u.grab && !u.gone) {
        const t2 = a.tgt;
        if (t2 && !t2.gone && !t2.dead && t2.state !== 'transform' && !t2.grabbedBy && t2.sp.mass < 4 &&
          dist(u.x, u.y, t2.x, t2.y) < u.r + t2.r + 26) {
          beginGrab(u, { hold: d.hold || 'throw', reach: d.reach }, t2);
          return;
        }
      }
    }
  } else if (u.z > 0 && !u.leap && !golemActive(u,'levitation')) { u.z = Math.max(0, u.z - GRAV * dt * .5); }
  if (a.t >= total) { u.state = 'idle'; u.st = 0; u.atk = null; }
}
function meleeHitCheck(u, d, a, tgt) {
  if(!a.hitSet)a.hitSet=new Set();
  if(!exAlive(tgt)||(!d.multi&&a.hitSet.has(tgt.id)))return false;
  const dd = dist(u.x, u.y, tgt.x, tgt.y) - u.r - tgt.r;
  if (dd > d.reach + 10||!losWalk(u.x,u.y,tgt.x,tgt.y,1)) return false;
  const a2 = angTo(u.x, u.y, tgt.x, tgt.y);
  if (dist(u.x,u.y,tgt.x,tgt.y)>(u.r+tgt.r)*.25&&Math.abs(angDiff(u.faceA, a2)) > (d.arc || 1.7) / 2 + .5) return;
  if(!d.multi)a.hitSet.add(tgt.id);
  applyHit(u, d, tgt, a2);
  Sfx.play(d.snd || 'hit', u.x, u.y);return true;
}
