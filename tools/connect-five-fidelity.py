"""Idempotent engine hooks; never silently report success if a connection is absent."""
from pathlib import Path
p=Path('mansion_war.html');s=p.read_text()
def hook(old,new):
 global s
 if new in s or (new.startswith(old) and new[len(old):].strip() in s) or (old=='  let s = u.walkSpd;' and 'if(u.fiveHiding||u.fiveNet||' in s):return
 assert old in s,old
 s=s.replace(old,new,1)
hook("function fireAttack(u, d, a) {", "function fireAttack(u, d, a) {\n  if(d.fiveShot){fiveLaunch(u,d,a);return;}")
# Projectile hook is connected precisely by embed-restoration.py, not updateParts().
hook("function drawProj(p) {", "function drawProj(p) {\n  if(p.fiveCanon){drawFiveProjectile(p);return;}")
hook("function canUse(u, d, tgt) {", "function canUse(u, d, tgt) {\n  if(!fiveCanUse(u,d,tgt))return false;")
hook("function applyHit(u, d, o, ang) {", "function applyHit(u, d, o, ang) {\n  if(d.fiveMelee)d={...d,dmg:fiveRollDamage(u,d.fiveMelee,d.dmg)};")
hook("    inf: d.inf, infG:", "    fiveWeapon:d.fiveMelee, inf: d.inf, infG:")
hook("  let s = u.walkSpd;", "  if(u.fiveHiding||(u.fiveStopUntil||0)>G.time||u.fiveAssimilating)return 0;\n  let s = u.walkSpd;")
hook("function aiThink(u) {\n  try {", "function aiThink(u) {\n  try {\n    if(fiveReact(u)||u.fiveHiding||(u.fiveStopUntil||0)>G.time)return;")
hook("  if (u.inTv) return;", "  if (u.inTv) return;\n  if(u.fiveHiding){drawFiveRuleState(u);return;}")
hook("if(u.sp.five||u.fiveAssimilated)drawFiveUnit(u,pose);", "if(u.sp.five||u.fiveAssimilated){drawFiveUnit(u,pose);drawFiveRuleState(u);}")
hook("  const refresh = () => {\n    box.querySelectorAll('.fchip')", "  buildFiveCountPicker(box);\n  const refresh = () => {\n    box.querySelectorAll('.fchip')")
# Hidden entities cannot be targeted using ordinary visual acquisition.
hook("  if(o.fiveHidden&&u.fac!=='th')return false;", "  if(o.fiveHiding)return false;\n  if(o.fiveHidden&&u.fac!=='th')return false;")
s=s.replace('if(u.fiveHiding||(u.fiveStopUntil||0)>G.time||u.fiveAssimilating)return 0;', 'if(u.fiveHiding||u.fiveNet||(u.fiveStopUntil||0)>G.time||u.fiveAssimilating)return 0;')
p.write_text(s)

# Environmental interactions and corpse metadata are preserved on regeneration.
hook("function aiThink(u) {\n  try {", "function aiThink(u) {\n  try {\n    if(canonInteractionThink(u))return;")
hook("function updateInspector() {", "function updateInspector() {\n  canonInteractionPanel();")
hook("  tgt.hp -= dmg;", "  if(o.canonNonlethal)dmg=Math.min(dmg,Math.max(0,tgt.hp-1));\n  tgt.hp -= dmg;")
hook("    key: u.key, x: u.x, y: u.y, dir: u.dir, seed: u.seed || u.id, t: 0,", "    ...canonCorpseMetadata(u,opts),\n    key: u.key, x: u.x, y: u.y, dir: u.dir, seed: u.seed || u.id, t: 0,")
hook("  u.dead = true; u.gone = true;", "  u.dead = true; u.gone = true;\n  u.canonDeathOptions={sterile:!!o.sterile,gib:!!o.gib};")
hook("function effSpeed(u) {", "function effSpeed(u) {\n  if(u.canonTrap||u.canonAssimilating)return 0;")
# Real doorway crossing is an opening event; no damage-on-proximity for Dupe.
hook("function tryMove(u, dx, dy) {", "function tryMove(u, dx, dy) {\n  if(u.canonTrap)return;\n  if((dx||dy)&&G.canonWorld)for(const d of G.canonWorld.doors)if(!d.fake&&!d.opened&&dist(u.x,u.y,d.x,d.y)<TILE*.6)canonInteract(u,d);")
p.write_text(s)

hook("function drawProp(p) {", "function drawProp(p) {\n  if(p.canonAirborne)return;")
p.write_text(s)

hook("    this.map.clear();", "    this.map.clear();this.maxRadius=0;")
hook("      const k = this.key(Math.floor(u.x / this.cell)", "      this.maxRadius=Math.max(this.maxRadius,u.r||0);\n      const k = this.key(Math.floor(u.x / this.cell)")
hook("function thinkMonster(u) {", "function thinkMonster(u) {\n  if(u.tgt&&combatRangeThink(u,u.tgt))return;")
hook("const cbShot=(n,dmg=8,range=420,extra={})=>AT(Object.assign({n,dmg,type:'proj',projKind:'bullet',minR:16,", "const cbShot=(n,dmg=8,range=420,extra={})=>AT(Object.assign({n,dmg,type:'proj',projKind:'bullet',minR:0,")
hook("addProj(d.projKind, u.x + Math.cos(u.faceA) * 16, u.y + Math.sin(u.faceA) * 16,", "addProj(d.projKind, u.x, u.y,")
hook("Spatial.query(u.x, u.y, 40, _q);\n  for (const o of _q) {", "Spatial.query(u.x, u.y, u.r+(Spatial.maxRadius||32)+12, _q);\n  for (const o of _q.slice()) {")
hook("Spatial.query(u.x, u.y, 46, _q);\n  for (const o of _q) {", "Spatial.query(u.x, u.y, u.r+(Spatial.maxRadius||32)+14, _q);\n  for (const o of _q.slice()) {")
hook("Spatial.query(u.x, u.y, 44, _q);", "Spatial.query(u.x, u.y, u.r+(Spatial.maxRadius||32)+(d.reach||10)+6, _q);")
hook("Spatial.query(u.x, u.y, 32, _q);\n  for (const o of _q) {", "Spatial.query(u.x, u.y, u.r+(Spatial.maxRadius||32)+10, _q);\n  for (const o of _q.slice()) {")
p.write_text(s)
hook("  const dd = tgt ? dist(u.x, u.y, tgt.x, tgt.y) - u.r - tgt.r : 999;", "  const dd = tgt ? Math.max(0,dist(u.x, u.y, tgt.x, tgt.y) - u.r - tgt.r) : 999;")
p.write_text(s)

hook("function effSpeed(u) {", "function effSpeed(u) {\n  if(u.doomRitual||u.doomTearing)return 0;")
hook("  tgt.hp -= dmg;", "  tgt.hp -= dmg;\n  doomNestOnDamage(att,tgt,dmg);")
p.write_text(s)

hook("if(G.cfg.invincibility!==false&&dmg>0&&(tgt.damageImmuneUntil||0)>G.time)return;", "if(G.cfg.invincibility!==false&&dmg>0&&(tgt.damageImmuneUntil||0)>G.time){combatBlock(tgt,'被弾直後の無敵時間');return;}")
hook("  if(tgt.shellT>0)return;", "  if(tgt.shellT>0){combatBlock(tgt,'殻で防御中');return;}")
hook("    drawCombatAccent(u);", "    drawCombatAccent(u);\n    drawCombatFeedback(u);")
p.write_text(s)
hook("    if (d < u.r + t.r + 30 || d < 480) {", "    { // Attack eligibility is decided by canUse(), not an unrelated 480px ceiling.")
p.write_text(s)
