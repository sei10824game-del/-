"""Idempotent Taken engine/UI connections. Run via embed-five-factions.py."""
from pathlib import Path
p=Path('mansion_war.html');s=p.read_text()
def hook(marker, old, new):
 global s
 if marker not in s:
  if old not in s: raise RuntimeError('Missing Taken hook: '+old[:80])
  s=s.replace(old,new,1)
hook("f:'tk',name:", 'const FAC_BY = {};', "FACTION_DEFS.push({f:'tk',name:'宿られた軍団',icon:'◈',col:'#b9d5f5',group:'Destiny',panel:'panelTk',win:'屋敷は宿られた軍団に覆われた'});\nconst FAC_BY = {};")
hook('  spawnTaken();','  spawnSculk();','  spawnSculk();\n  spawnTaken();')
hook('  G.taken=null;', 'function startGame(cfg) {','function startGame(cfg) {\n  G.taken=null;')
hook(' updateTaken(dt);','function updateExpansion(dt){','function updateExpansion(dt){\n updateTaken(dt);')
hook('  tkInitUnit(u);','  pitOnSpawn(u);','  pitOnSpawn(u);\n  tkInitUnit(u);')
hook("case 'taken': thinkTaken(u);", "      case 'sculk':", "      case 'taken': thinkTaken(u);break;\n      case 'sculk':")
hook('if(d.tkPower){tkFire', 'function exFire(u,d,a){','function exFire(u,d,a){\n if(d.tkPower){tkFire(u,d,a);return;}')
hook('dmg=tkDamage(att,tgt,dmg,o);','  dmg=fiveDamage(att,tgt,dmg,o);','  dmg=tkDamage(att,tgt,dmg,o);if(dmg<=0)return;\n  dmg=fiveDamage(att,tgt,dmg,o);')
hook('  tkOnHit(tgt,att,dmg,o);','  tgt.hp -= dmg;','  tgt.hp -= dmg;\n  tkOnHit(tgt,att,dmg,o);')
hook('  tkOnDeath(u,att);','  skOnDeath(u);skBlockDestroyed(u);','  skOnDeath(u);skBlockDestroyed(u);\n  tkOnDeath(u,att);')
hook('if(u.sp.tkOrdnance)return;\n  if (xDeathHook', '  if (xDeathHook(att, u, o)) return;', '  if(u.sp.tkOrdnance)return;\n  if (xDeathHook(att, u, o)) return;')
hook('else if(u.sp.tkUnit)drawTaken', '    else if(u.sp.sculkBlock)', '    else if(u.sp.tkUnit)drawTaken(u,pose);\n    else if(u.sp.sculkBlock)')
hook('drawTakenEffects();drawFiveFields();','function drawCountdownBombs(){drawFiveFields();','function drawCountdownBombs(){drawTakenEffects();drawFiveFields();')
hook('  takenInspector(el,u);','  sculkInspector(el,u);','  sculkInspector(el,u);\n  takenInspector(el,u);')
hook('  buildTakenCountPicker(box);','  buildFiveCountPicker(box);','  buildFiveCountPicker(box);\n  buildTakenCountPicker(box);')
hook("['tk','panelTk'",'  const extraFac = [',"  const extraFac = [\n    ['tk','panelTk','◈ 宿られた軍団','#b9d5f5',TK_ROSTER],")
hook('if(u.tkFrozenUntil>G.time)return false;', 'function tryMove(u, dx, dy) {','function tryMove(u, dx, dy) {\n  if(u.tkFrozenUntil>G.time)return false;')
hook('if(u.tkFrozenUntil>G.time)return false;\n  if(!restCanUse', 'function canUse(u, d, tgt) {','function canUse(u, d, tgt) {\n  if(u.tkFrozenUntil>G.time)return false;')
hook('if(u.sp.tkUnit)return; // No generic Taking', 'function startTransform(u, newKey, opts = {}) {', 'function startTransform(u, newKey, opts = {}) {\n  if(u.sp.tkUnit)return; // No generic Taking, infection or Joker conversion of these entities.')
# Scope vision/hearing after null guards; never shortcut hostileTo/LOS.
vision="  if(u.tkBlindUntil>G.time&&dist(u.x,u.y,o.x,o.y)>45)return false;\n  if(takenHidden(o)&&dist(u.x,u.y,o.x,o.y)>75)return false;\n"
if vision not in s:
 a=s.index('function canSee(u, o) {');b=s.index('  if (!u || !o || o.gone || o.dead) return false;',a)+len('  if (!u || !o || o.gone || o.dead) return false;\n');s=s[:b]+vision+s[b:]
if 'if(u.tkDeafUntil>G.time)return false;' not in s:
 a=s.index('function unitHasHearing(u) {');b=s.index('  if (!u || !u.sp) return false;',a)+len('  if (!u || !u.sp) return false;\n');s=s[:b]+'  if(u.tkDeafUntil>G.time)return false;\n'+s[b:]
hook("if(f==='tk')return G.units.filter",'function facPot(f) {',"function facPot(f) {\n  if(f==='tk')return G.units.filter(u=>!u.gone&&!u.dead&&u.fac==='tk'&&!u.sp.tkOrdnance).length;")
s=s.replace('u.fac === f && !u.sp.fivePassive && !u.sp.pmNonCombat) n++','u.fac === f && !u.sp.fivePassive && !u.sp.pmNonCombat && !u.sp.tkOrdnance) n++')
p.write_text(s)
