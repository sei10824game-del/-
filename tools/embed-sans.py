"""Idempotent Sans connections; called by embed-five-factions.py."""
from pathlib import Path
p=Path('mansion_war.html');s=p.read_text()
def hook(marker,old,new):
 global s
 if marker not in s:
  if old not in s:raise RuntimeError('Missing Sans hook: '+old[:100])
  s=s.replace(old,new,1)
hook("f:'sn',name:",'const FAC_BY = {};',"FACTION_DEFS.push({f:'sn',name:'Sans / Dust Sans',icon:'💀',col:'#80c6ee',group:'UNDERTALE / Dusttale',panel:'panelSn',win:'Sansたちが屋敷を制圧した'});\nconst FAC_BY = {};")
hook('  spawnSans();','  spawnSlayers();','  spawnSlayers();\n  spawnSans();')
hook('  G.sans=null;','function startGame(cfg) {','function startGame(cfg) {\n  G.sans=null;')
hook('  ssInit(u);','  slInit(u);','  slInit(u);\n  ssInit(u);')
hook(' updateSans(dt);','function updateExpansion(dt){','function updateExpansion(dt){\n updateSans(dt);')
hook("case 'sans': thinkSans(u);","      case 'slayer':", "      case 'sans': thinkSans(u);break;\n      case 'slayer':")
hook('if(d.ssPower){ssFire','function fireAttack(u, d, a) {','function fireAttack(u, d, a) {\n  if(d.ssPower){ssFire(u,d,a);return;}')
hook('dmg=ssDamage(att,tgt,dmg,o);','  dmg=slDamage(att,tgt,dmg,o);','  dmg=ssDamage(att,tgt,dmg,o);if(dmg<=0)return;\n  dmg=slDamage(att,tgt,dmg,o);')
hook('  ssOnDeath(att,u);','  slOnDeath(att,u,o);','  slOnDeath(att,u,o);\n  ssOnDeath(att,u);')
hook('if (tgt.sp.statusImmune) return;', 'function beginGrab(u, d, tgt) {','function beginGrab(u, d, tgt) {\n  if (tgt.sp.statusImmune) return;')
hook("if(u.fac==='sn'||o.fac==='sn')return u.fac!==o.fac;", "  if(u.fac==='sl'||o.fac==='sl')", "  if(u.fac==='sn'||o.fac==='sn')return u.fac!==o.fac;\n  if(u.fac==='sl'||o.fac==='sl')")
hook('else if(u.sp.ssUnit)drawSans', '    else if(u.sp.slUnit||u.sp.slDecoy)', '    else if(u.sp.ssUnit)drawSans(u,pose);\n    else if(u.sp.slUnit||u.sp.slDecoy)')
hook('drawSansEffects();drawSlayerEffects();','function drawCountdownBombs(){drawSlayerEffects();','function drawCountdownBombs(){drawSansEffects();drawSlayerEffects();')
hook('  ssInspector(el,u);','  slInspector(el,u);','  slInspector(el,u);\n  ssInspector(el,u);')
hook("['sn','panelSn'",'  const extraFac = [',"  const extraFac = [\n    ['sn','panelSn','💀 Sans / Dust Sans','#80c6ee',SS_ROSTER],")
hook('  buildSansPicker(box);','  buildSlayerMightyPicker(box);','  buildSlayerMightyPicker(box);\n  buildSansPicker(box);')
hook('!u.sp.ssUnit && !u.sp.superArmor', '!u.sp.unique && !u.sp.superArmor', '!u.sp.unique && !u.sp.ssUnit && !u.sp.superArmor')
hook('if(tgt.sp.statusImmune)return;', 'function knockDown(tgt) {', 'function knockDown(tgt) {\n  if(tgt.sp.statusImmune)return;')
hook('o.pull && att && !tgt.sp.statusImmune', 'if (o.pull && att) {', 'if (o.pull && att && !tgt.sp.statusImmune) {')
hook('!tgt.sp.statusImmune && !tgt.sp.superArmor', 'else if (!tgt.sp.superArmor && dmg >', 'else if (!tgt.sp.statusImmune && !tgt.sp.superArmor && dmg >')
# Sterile corpses: no infection after death either.
hook('if(u.sp.ssUnit)opts={...opts', 'function makeCorpse(u, opts = {}) {', 'function makeCorpse(u, opts = {}) {\n  if(u.sp.ssUnit)opts={...opts,riseT:0,riseAs:null,virusFac:null,cSpore:false};')
hook('/* Always render expansion effects, even without countdown bombs. */', '  if(G.countdownBombs&&G.countdownBombs.length)list.push({d:Infinity,f:drawCountdownBombs,a:null});', '  /* Always render expansion effects, even without countdown bombs. */\n  list.push({d:Infinity,f:drawCountdownBombs,a:null});')
p.write_text(s)
