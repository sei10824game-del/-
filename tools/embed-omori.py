from pathlib import Path
p=Path('mansion_war.html');s=p.read_text()
a='/* OMORI_BEGIN */';b='/* OMORI_END */';block=a+'\n'+Path('tools/omori-runtime.js').read_text()+'\n'+Path('tools/omori-renderer.js').read_text()+'\n'+b
if a in s:s=s[:s.index(a)]+block+s[s.index(b)+len(b):]
else:s=s.replace('/* FIVE_FACTIONS_END */',block+'\n/* FIVE_FACTIONS_END */',1)
def hook(marker,old,new):
 global s
 if marker not in s:
  if old not in s:raise RuntimeError('Missing OMORI hook '+old)
  s=s.replace(old,new,1)
hook("f:'om',name:",'const FAC_BY = {};',"FACTION_DEFS.push({f:'om',name:'OMORI（夢世界）',icon:'💡',col:'#c4b1f1',group:'OMORI',panel:'panelOm'},{f:'su',name:'サニー（現実世界）',icon:'🎻',col:'#e5c28c',group:'OMORI',panel:'panelSu'});\nconst FAC_BY = {};")
hook('  spawnOmori();','  spawnPlatformHeroes();','  spawnPlatformHeroes();\n  spawnOmori();')
hook('  G.omori=null;','function startGame(cfg) {','function startGame(cfg) {\n  G.omori=null;')
hook('  omInit(u);','  piInit(u);','  piInit(u);\n  omInit(u);')
hook(' omTick(dt);','function updateExpansion(dt){','function updateExpansion(dt){\n omTick(dt);')
hook("case 'omori':", "      case 'platformHero':", "      case 'omori': thinkOmori(u);break;\n      case 'platformHero':")
hook('if(d.omAction){omFire', 'function fireAttack(u, d, a) {', 'function fireAttack(u, d, a) {\n  if(d.omAction){omFire(u,d,a);return;}')
hook('if(!omCanUse(u,d,tgt))', 'function canUse(u, d, tgt) {', 'function canUse(u, d, tgt) {\n  if(!omCanUse(u,d,tgt))return false;')
hook('dmg=omDamage(att,tgt,dmg,o);', '  tgt.hp -= dmg;', '  dmg=omDamage(att,tgt,dmg,o);if(dmg<=0)return;\n  tgt.hp -= dmg;\n  omAfterDamage(att,tgt,dmg,o);')
s=s.replace('let s = u.walkSpd * omSpeed(u);','let s = u.walkSpd;')
hook('  s *= omSpeed(u);', '  return s * golemEffectSpeed', '  s *= omSpeed(u);\n  return s * golemEffectSpeed')
hook('omOriginFac: u.fac,', '    ...canonCorpseMetadata(u,opts),', '    ...canonCorpseMetadata(u,opts), omOriginFac: u.fac,')
hook("if(u.fac==='om'||u.fac==='su'", "  if(u.fac==='sk'||o.fac==='sk')", "  if(u.fac==='om'||u.fac==='su'||o.fac==='om'||o.fac==='su')return u.fac!==o.fac;\n  if(u.fac==='sk'||o.fac==='sk')")
hook('else if(u.sp.omori)drawOmoriUnit', '    else if(u.sp.piHero)', '    else if(u.sp.omori)drawOmoriUnit(u,pose);\n    else if(u.sp.piHero)')
hook('drawOmoriEffects();drawPlatformEffects();','function drawCountdownBombs(){drawPlatformEffects();','function drawCountdownBombs(){drawOmoriEffects();drawPlatformEffects();')
hook('  omInspector(el,u);','  piInspector(el,u);','  piInspector(el,u);\n  omInspector(el,u);')
hook('...OM_FACTIONS.map', '  const extraFac = [', "  const extraFac = [\n    ...OM_FACTIONS.map(([f,n,ic,c])=>[f,f==='om'?'panelOm':'panelSu',ic+' '+n,c,OM_ROSTER.filter(k=>SP[k].fac===f)]),")
s=s.replace('dmg=omDamage(att,tgt,dmg,o);\n','dmg=omDamage(att,tgt,dmg,o);if(dmg<=0)return;\n')
p.write_text(s)
