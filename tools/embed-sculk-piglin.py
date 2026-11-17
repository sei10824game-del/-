"""Final, idempotent connections for Sculk and Minecraft Legends piglins."""
from pathlib import Path
p=Path('mansion_war.html');s=p.read_text()
if "f:'sk',name:'スカルク'" not in s:
    s=s.replace('const FAC_BY = {};', "FACTION_DEFS.push({f:'sk',name:'スカルク',icon:'🌑',col:'#53c9bf',group:'Minecraft',panel:'panelSk',win:'屋敷の床をスカルクが覆った'});\nconst FAC_BY = {};",1)
s=s.replace("{ f: 'P', name: 'ピグリン', icon: '🐷', col: '#e8c040', group: 'Minecraft',", "{ f: 'P', name: 'ピグリン軍', icon: '🐷', col: '#e8c040', group: 'Minecraft Legends',")
# Replace the old five-unit Nether spawn rather than adding a second army.
a=s.find("  spawnUnit('pfort', (pRoom.cx + .5)")
if a>=0:
    b=s.index("  spawnUnit('hoglin',",a);b=s.index('\n',b)
    s=s[:a]+'  spawnPigArmy(pRoom);'+s[b:]
if '  spawnSculk();' not in s:s=s.replace('  spawnFiveFactions();','  spawnFiveFactions();\n  spawnSculk();',1)
if '  G.sculk=null;G.pigArmy=null;' not in s:s=s.replace('function startGame(cfg) {','function startGame(cfg) {\n  G.sculk=null;G.pigArmy=null;',1)
if ' updateSculk(dt);' not in s:s=s.replace('function updateExpansion(dt){','function updateExpansion(dt){\n updateSculk(dt);updatePigArmy(dt);',1)
if "case 'sculk': thinkSculk(u);" not in s:s=s.replace("      case 'piglin':", "      case 'sculk': thinkSculk(u);break;\n      case 'pigArmy': thinkPigArmy(u);break;\n      case 'piglin':",1)
# Scope hostility to hostileTo, never to the earlier sight helper.
sk_hostile="  if(u.fac==='sk'||o.fac==='sk')return u.fac!==o.fac;\n"
s=s.replace(sk_hostile,'')
a=s.index('function hostileTo(u, o) {')
b=s.index("  if(o.fiveHidden&&u.fac!=='th')return false;",a)+len("  if(o.fiveHidden&&u.fac!=='th')return false;\n")
s=s[:b]+sk_hostile+s[b:]
if '  skOnDeath(u);skBlockDestroyed(u);' not in s:s=s.replace('  u.dead = true; u.gone = true;', '  u.dead = true; u.gone = true;\n  skOnDeath(u);skBlockDestroyed(u);',1)
if 'if(u.sp.sculkBlock||u.sp.pigStructure){addDust' not in s:s=s.replace('  if (xDeathHook(att, u, o)) return;', '  if(u.sp.sculkBlock||u.sp.pigStructure){addDust(u.x,u.y,8);return;}\n  if (xDeathHook(att, u, o)) return;',1)
if "if(d.exAction==='skSonic')" not in s:s=s.replace('function exFire(u,d,a){', "function exFire(u,d,a){\n if(d.exAction==='skSonic'){skFire(u,d,a);return;}",1)
if 'else if(u.sp.sculkBlock)drawSculk(u);' not in s:s=s.replace('    else if(u.sp.exeShape)', '    else if(u.sp.sculkBlock)drawSculk(u);\n    else if(u.sp.sculkWarden)drawSculkWarden(u);\n    else if(u.sp.pigStructure)drawPigStructure(u);\n    else if(u.sp.exeShape)',1)
if '  drawPigGear(u,sk);' not in s:s=s.replace('  drawRezeMotion(u,sk);','  drawRezeMotion(u,sk);\n  drawPigGear(u,sk);',1)
if '    drawPigQuadGear(u);' not in s:s=s.replace('    drawCbEffects(u);','    drawPigQuadGear(u);\n    drawCbEffects(u);',1)
s=s.replace("u.sp.kind === 'biped' && !u.sp.unique", "u.sp.kind === 'biped' && !u.sp.pigArmy && !u.sp.unique")
if '  drawPigWorld();' not in s:s=s.replace('  golemDrawTiles();','  golemDrawTiles();\n  drawPigWorld();',1)
if '  sculkInspector(el,u);' not in s:s=s.replace('  restInspector(el,u);','  restInspector(el,u);\n  sculkInspector(el,u);',1)
s=s.replace("['P', 'panelP', '🐷 ピグリン', '#e8c040', ['pfort', 'piglin', 'piglinxbow', 'pbrute', 'hoglin']]", "['P', 'panelP', '🐷 ピグリン軍', '#e8c040', PM_ROSTER]")
if "['sk','panelSk'" not in s:s=s.replace('  const extraFac = [', "  const extraFac = [\n    ['sk','panelSk','🌑 スカルク','#53c9bf',[...SCULK_BLOCKS,'skWarden']],",1)
if '  pmOnDamage(att,tgt,dmg,o);' not in s:s=s.replace('  tgt.hp -= dmg;', '  tgt.hp -= dmg;\n  pmOnDamage(att,tgt,dmg,o);',1)
if 'if(u.pmRootUntil>G.time)return false;' not in s:s=s.replace('function tryMove(u, dx, dy) {','function tryMove(u, dx, dy) {\n  if(u.pmRootUntil>G.time)return false;',1)
sk_dark="  if(u.skDarkUntil>G.time&&dist(u.x,u.y,o.x,o.y)>120)return false;\n"
s=s.replace(sk_dark,'')
a=s.index('function canSee(u, o) {')
b=s.index('  if (!u || !o || o.gone || o.dead) return false;',a)+len('  if (!u || !o || o.gone || o.dead) return false;\n')
s=s[:b]+sk_dark+s[b:]
if "if(f==='P')return G.units.filter" not in s:s=s.replace('function facPot(f) {', "function facPot(f) {\n  if(f==='P')return G.units.filter(u=>!u.gone&&!u.dead&&u.fac==='P'&&!u.sp.pmNonCombat).length;",1)
s=s.replace("u.fac === f && !u.sp.fivePassive) n++", "u.fac === f && !u.sp.fivePassive && !u.sp.pmNonCombat) n++")
if '  if(pmRolling(u))return;' not in s:s=s.replace('function drawQuad(u, pose) {','function drawQuad(u, pose) {\n  if(pmRolling(u))return;',1)
p.write_text(s)
