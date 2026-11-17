from pathlib import Path
import json,re
p=Path('mansion_war.html');s=p.read_text()
a='/* RESTORED_ABILITIES_BEGIN */';b='/* RESTORED_ABILITIES_END */'
block=a+'\nconst REST_GOLEM_DATA='+json.dumps(json.loads(Path('research/restored-golem-behaviors.json').read_text()),ensure_ascii=False,separators=(',',':'))+';\n'+Path('tools/restored-abilities.js').read_text()+'\nconst GOLEM_CRAFT_DATA='+Path('research/minecraft-crafting.json').read_text().strip()+';\n'+Path('tools/golem-world-runtime.js').read_text()+'\n'+Path('tools/golem-interactions.js').read_text()+'\n'+b+'\n'
if a in s:
 i=s.index(a);j=s.index(b,i)+len(b)+1;s=s[:i]+block+s[j:]
else:
 marker='/* ── 起動 ── */';assert marker in s;s=s.replace(marker,block+marker,1)
def patch(old,new):
 global s
 if new in s or (new.startswith(old) and new[len(old):].strip() in s):return
 assert old in s,old[:100]
 s=s.replace(old,new,1)
def function(name,body):
 global s
 i=s.index('function '+name+'(');j=s.index('\nfunction ',i+1)
 s=s[:i]+body+'\n'+s[j:]
def renderer(name,body):
 global s
 i=s.index('function '+name+'(');j=s.index('\n}',i+1)+2
 s=s[:i]+body+s[j:]
# Repair the earlier broad string match: projectile stepping belongs to projectiles, NOT particles.
s=s.replace('    if(p.fiveCanon){if(fiveProjectileStep(p,dt))G.projs.splice(i,1);continue;}\n','')
s=s.replace("    if(p.kind==='combineBall'){if(restBallStep(p,dt))G.projs.splice(i,1);continue;}\n",'')
patch('function updateProjs(dt) {\n  for (let i = G.projs.length - 1; i >= 0; i--) {\n    const p = G.projs[i];\n    p.t += dt;', 'function updateProjs(dt) {\n  for (let i = G.projs.length - 1; i >= 0; i--) {\n    const p = G.projs[i];\n    p.t += dt;\n    if(p.fiveCanon){if(fiveProjectileStep(p,dt))G.projs.splice(i,1);continue;}\n    if(p.kind===\'combineBall\'){if(restBallStep(p,dt))G.projs.splice(i,1);continue;}')
patch('function drawProj(p) {', "function drawProj(p) {\n  if(p.kind==='combineBall'){restDrawBall(p);return;}")
patch('function cbFire(u,d,a){', "function cbFire(u,d,a){\n if(d.cbAction==='energy'){restFire(u,d,a);return;}")
patch('function fireAttack(u, d, a) {', 'function fireAttack(u, d, a) {\n  if(restFire(u,d,a))return;')
patch('function canUse(u, d, tgt) {', 'function canUse(u, d, tgt) {\n  if(!restCanUse(u,d))return false;')
patch('  fiveOnSpawn(u);', '  fiveOnSpawn(u);\n  restOnSpawn(u);')
patch('  tgt.hp -= dmg;', '  tgt.hp -= dmg;\n  restOnHurt(att,tgt,dmg,o);')
patch('  fiveOnDeath(u,o);', '  fiveOnDeath(u,o);\n  restOnDeath(u);')
patch('function makeCorpse(u, opts = {}) {', 'function makeCorpse(u, opts = {}) {\n  if(u.restDissolved)return;')
patch('function applyHit(u, d, o, ang) {', 'function applyHit(u, d, o, ang) {\n  restHoney(u,o);')
patch('function effSpeed(u) {', "function effSpeed(u) {\n  if(u.key==='eg_furnace'&&!(u.restFuel>0))return 0;")
patch("  return s * u.spdMul * (u.key==='fpeAlice'", "  return s * golemEffectSpeed(u) * u.spdMul * (u.key==='fpeAlice'")
patch('function aiThink(u) {\n  try {', 'function aiThink(u) {\n  try {\n    if(u.key===\'eg_furnace\'&&!(u.restFuel>0)){u.dest=null;u.path=null;return;}\n    if(restVictimThink(u))return;')
patch('function updateExpansion(dt){', 'function updateExpansion(dt){\n restUpdate(dt);')
patch(' G.countdownBombs=[];G.exHazards=[];', ' G.countdownBombs=[];G.exHazards=[];G.restBombMarks=[];')
function('exPlantBomb', "function exPlantBomb(u,t){return restBombTouch(u,t,'ボマー');}")
function('exDetonateBombs', 'function exDetonateBombs(owner,force=false){return restDetonate(owner,force);}')
function('thinkGenthru', 'function thinkGenthru(u){return restThinkBomber(u);}')
patch("Math.max(0,Math.ceil(b.due-G.time))", "(b.beats!=null?Math.ceil(b.beats)+'拍':Math.max(0,Math.ceil(b.due-G.time))+'秒')")
# Preserve the old no-argument explosion API; projectiles now supply their own damage/radius.
patch('function explodeRocket(x, y, src) {', 'function explodeRocket(x, y, src, power=65, radius=95) {')
patch('  Spatial.query(x, y, 100, _q);\n  for (const u of _q) {\n    const dd = dist(x, y, u.x, u.y);\n    if (dd < 95) {\n      dealDamage(src, u, Math.round(65 * (1 - dd / 130)),', '  Spatial.query(x, y, radius+5, _q);\n  for (const u of _q.slice()) {\n    const dd = dist(x, y, u.x, u.y);\n    if (dd < radius) {\n      dealDamage(src, u, Math.round(power * (1 - dd / (radius*130/95))),')
s=s.replace('explodeRocket(p.x, p.y, p.src);','explodeRocket(p.x, p.y, p.src,p.dmg>0?p.dmg:65,p.blastR||95);')
patch('const pp = G.projs[G.projs.length - 1]; if (pp && pp.src === u && st) pp.style = st;', 'const pp = G.projs[G.projs.length - 1]; if (pp && pp.src === u && st) pp.style = st;\n          if(pp&&pp.src===u)pp.blastR=d.blastR||d.aoeR||95;')
patch("  btn.textContent = G.ctrl === u ? '操作を解除' : '操作';", "  btn.textContent = G.ctrl === u ? '操作を解除' : '操作';\n  restInspector(el,u);")
patch("h: clamp(dd * .16, 16, 44) };", "h: clamp(dd * .16, 16, 44) };\n      if(u.restJumpEffect?.until>G.time)u.leap.h*=Math.pow(Math.max(0,.42+.1*(u.restJumpEffect.amplifier+1))/.42,2);")
# All ordinary projectile impacts identify their indirect damage source.
i=s.index('function updateProjs(');j=s.index('\nfunction ',i+1)
import re
part=s[i:j];part=re.sub(r'dealDamage\(p.src, (\w+), p.dmg, \{(?! restProjectile:)',r'dealDamage(p.src, \1, p.dmg, { restProjectile: true,',part)
s=s[:i]+part+s[j:]
s=s.replace("size=demon?1.85:1,existing=G.units.filter(v=>v.key==='aliceTendril'&&v.exOwner===u.id&&exAlive(v)).length;","size=demon?1.85:1;").replace('i<Math.min(count,14-existing);i++','i<count;i++')
# World/interaction integration. Full function-scoped hooks, not broad fragment matching.
patch("function dealDamage(att, tgt, dmg, o = {}) {\n  if (!tgt || tgt.gone || tgt.dead || tgt.hp <= 0) return;", "function dealDamage(att, tgt, dmg, o = {}) {\n  if (!tgt || tgt.gone || tgt.dead || tgt.hp <= 0) return;\n  dmg=golemDamage(att,tgt,dmg,o);if(dmg<=0)return;")
patch("  restHoney(u,o);", "  restHoney(u,o);\n  if(exAlive(o))golemTrigger(u,'attack',o);")
patch("    fiveWeapon:d.fiveMelee,", "    golemMelee:d.type==='melee',\n    fiveWeapon:d.fiveMelee,")
s=s.replace("(u.restSlow&&u.restSlow.until>G.time?u.restSlow.mul:1)","golemEffectSpeed(u)")
patch("function thinkVillageGolem(u) {\n  thinkMonster(u);", "function thinkVillageGolem(u) {\n  if(golemThink(u))return;\n  thinkMonster(u);")
patch("  if (!unitHasSight(u)) return false;", "  if (!unitHasSight(u)) return false;\n  if(golemActive(o,'invisibility')&&dist(u.x,u.y,o.x,o.y)>2*TILE)return false;")
patch("function sightRange(u) {", "function sightRange(u) {\n  if(golemActive(u,'blindness')&&u.fac==='N')return 5*TILE;")
patch("function drawUnit(u) {", "function drawUnit(u) {\n  if(u.key==='mcHoneyBee'){golemDrawBee(u);return;}\n  golemDrawStatus(u);")
patch("function collectLights() {\n  const L = G.frameLights; const T = G.time;", "function collectLights() {\n  const L = G.frameLights; const T = G.time;\n  golemCollectLights(L);")
patch("  if (G.village) { for (const h of G.village.houses)", "  golemDrawTiles();\n  if (G.village) { for (const h of G.village.houses)")
patch("function startGame(cfg) {", "function startGame(cfg) {\n  G.golemWorld=null;document.getElementById('golemTools')?.remove?.();")
patch("    if(restVictimThink(u))return;", "    if(restVictimThink(u))return;\n    if(golemBeeThink(u))return;")
patch("    if(p.kind==='combineBall'){if(restBallStep(p,dt))G.projs.splice(i,1);continue;}", "    if(p.kind==='combineBall'){if(restBallStep(p,dt))G.projs.splice(i,1);continue;}\n    if(p.kind==='golemCharge'){if(golemChargeStep(p,dt))G.projs.splice(i,1);continue;}")
s=s.replace("else if (u.z > 0 && !u.leap)","else if (u.z > 0 && !u.leap && !golemActive(u,'levitation'))")
s=s.replace("    golemMelee:d.type==='melee',fiveWeapon:d.fiveMelee,", "    golemMelee:d.type==='melee',\n    fiveWeapon:d.fiveMelee,")
patch("    if(p.kind==='golemCharge'){if(golemChargeStep(p,dt))G.projs.splice(i,1);continue;}", "    if(p.kind==='golemCharge'){if(golemChargeStep(p,dt))G.projs.splice(i,1);continue;}\n    if(p.kind==='golemArrow'){if(golemArrowStep(p,dt))G.projs.splice(i,1);continue;}")
patch("function drawProj(p) {", "function drawProj(p) {\n  if(p.kind==='golemArrow'){golemDrawArrow(p);return;}")
patch("    const pose = poseFor(u);", "    if(golemActive(u,'invisibility'))ctx.globalAlpha*=.12;\n    const pose = poseFor(u);")
for body in re.split(r'(?m)(?=^function )',Path('tools/detailed-legacy-renderers.js').read_text()+'\n'+Path('tools/combat-attack-updater.js').read_text()):
 if body.strip():
  name=re.match(r'function (\w+)\(',body).group(1)
  renderer(name,body.strip())
renderer('blob',Path('tools/detailed-primitive-renderer.js').read_text().strip())
renderer('drawExeUnit',Path('tools/detailed-exe-renderer.js').read_text().strip())
renderer('drawFacingBlock',Path('tools/detailed-block-renderer.js').read_text().strip())
for name in ['solveBiped','solveQuad','solveBird','drawBird','drawDSSpider','drawHugger','drawBurster','drawExShape','drawCbMachine','drawMwUnit','drawSRP','drawMCGuardian']:
 marker='function '+name+'('
 if marker not in s:continue
 i=s.index(marker);j=s.find('\nfunction ',i+1)
 if j<0:raise AssertionError(name)
 part=s[i:j].replace('u.dir || 1','renderFacing(u)').replace('u.dir||1','renderFacing(u)').replace('u.dir','renderFacing(u)')
 s=s[:i]+part+s[j:]
patch("ctx.fillStyle = pal.skin; ctx.beginPath(); ctx.ellipse(ax, ay, S * .75, S * .5, dir * .3, 0, TAU);", "ctx.fillStyle = visualMaterial(pal.skin,ax-S*.75,ay-S*.5,S*1.5,S); ctx.beginPath(); ctx.ellipse(ax, ay, S * .75, S * .5, dir * .3, 0, TAU);")
patch("    if(p.fiveHoming)fiveGuideProjectile(p,dt);", "    if(p.fiveHoming)fiveGuideProjectile(p,dt);\n    {const result=combatProjectileStep(p,dt);if(result!==null){if(result)G.projs.splice(i,1);continue;}}")
for name in ['fireAttack','fireLaser','fireCrack','contactCheck','chargeContact','leapLandHit','huggerContact','explodeRocket']:
 marker='function '+name+'('
 if marker not in s:continue
 i=s.index(marker);j=s.index('\n}',i+1)+2
 s=s[:i]+s[i:j].replace('for (const o of _q)', 'for (const o of _q.slice())').replace('for (const u of _q)', 'for (const u of _q.slice())')+s[j:]
p.write_text(s)

