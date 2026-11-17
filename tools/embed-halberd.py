from pathlib import Path
p=Path('mansion_war.html');s=p.read_text()
s=s.replace('  hbInit(u);','  hbInit(u,o);')
a='/* HALBERD_BEGIN */';b='/* HALBERD_END */';block=a+'\n'+Path('tools/halberd-runtime.js').read_text()+'\n'+Path('tools/halberd-renderer.js').read_text()+'\n'+b
if a in s:s=s[:s.index(a)]+block+s[s.index(b)+len(b):]
else:s=s.replace('/* FIVE_FACTIONS_END */',block+'\n/* FIVE_FACTIONS_END */',1)
def hook(marker,old,new):
 global s
 if marker not in s:
  if old not in s:raise RuntimeError('Missing Halberd hook '+old[:90])
  s=s.replace(old,new,1)
hook('  G.halberd=null;','function startGame(cfg) {','function startGame(cfg) {\n  G.halberd=null;')
hook('  hbInit(u,o);','  if (!o.force && G.stats[sp.fac]', '  hbInit(u,o);\n  if (!o.force && G.stats[sp.fac]')
hook(' hbTick(dt);','function updateExpansion(dt){','function updateExpansion(dt){\n hbTick(dt);')
hook("case 'halberd':", "      case 'platformHero':", "      case 'halberd': thinkHalberd(u);break;\n      case 'halberdCrew': thinkHalberd(u);break;\n      case 'platformHero':")
hook('if(d.hbPower){hbFire','  if(d.piPower){piFire(u,d,a);return;}','  if(d.piPower){piFire(u,d,a);return;}\n  if(d.hbPower){hbFire(u,d,a);return;}')
hook('  hbOnDamage(att,tgt,dmg);','  tgt.hp -= dmg;','  tgt.hp -= dmg;\n  hbOnDamage(att,tgt,dmg);')
hook('  hbOnDeath(u);','  terrariaSlimeDeath(u);','  hbOnDeath(u);\n  terrariaSlimeDeath(u);')
hook('if(u.hbShip)return; // cargo update', 'function updateUnit(u, dt) {','function updateUnit(u, dt) {\n  if(u.hbShip)return; // cargo update')
hook('if(tgt?.hbShip)return;', 'function dealDamage(att, tgt, dmg, o = {}) {','function dealDamage(att, tgt, dmg, o = {}) {\n  if(tgt?.hbShip)return;')
hook('if(u?.hbShip)return;', 'function killUnit(att, u, o = {}) {','function killUnit(att, u, o = {}) {\n  if(u?.hbShip)return;')
hook('if(u?.hbShip||o?.hbShip)return false;', 'function canSee(u, o) {','function canSee(u, o) {\n  if(u?.hbShip||o?.hbShip)return false;')
hook('if(u.hbShip||o.hbShip)return false;', '  if (u === o) return false;', '  if (u === o) return false;\n  if(u.hbShip||o.hbShip)return false;')
hook('if(u.hbShip)return; // cargo body', 'function drawUnit(u) {','function drawUnit(u) {\n  if(u.hbShip)return; // cargo body')
hook('if(u.hbShip)return; // cargo bars', 'function drawUnitBars(u) {','function drawUnitBars(u) {\n  if(u.hbShip)return; // cargo bars')
hook('else if(u.sp.hbCrew||u.sp.hbShipUnit)', '    else if(u.sp.piHero)drawPlatformHero', '    else if(u.sp.hbCrew||u.sp.hbShipUnit)drawHalberdUnit(u,pose);\n    else if(u.sp.piHero)drawPlatformHero')
hook('function drawCountdownBombs(){drawHalberdEffects();', 'function drawCountdownBombs(){','function drawCountdownBombs(){drawHalberdEffects();')
hook('  hbInspector(el,u);','  piInspector(el,u);','  piInspector(el,u);\n  hbInspector(el,u);')
hook('if(u.hbShip||u.sp.hbShipUnit)return;', 'function startTransform(u, newKey, opts = {}) {','function startTransform(u, newKey, opts = {}) {\n  if(u.hbShip||u.sp.hbShipUnit)return;')
hook('if(u.sp.hbShipUnit||u.sp.hbShape', 'function makeCorpse(u, opts = {}) {', "function makeCorpse(u, opts = {}) {\n  if(u.sp.hbShipUnit||u.sp.hbShape==='reactor'||u.sp.hbShape==='cannon'||u.sp.hbShape==='lobster')opts={...opts,sterile:true,riseT:0,riseAs:null,virusFac:null,cSpore:false};")
# Include all members in deployment controls without removing the existing hero entry.
s=s.replace("[f,'panelPi_'+f,ic+' '+n,c,[k]]", "[f,'panelPi_'+f,ic+' '+n,c,f==='mt'?['hbHalberd',k,...HB_CREW]:[k]]")
s=s.replace('G.ctrl=u&&!u.gone&&!u.dead?u:null;', 'G.ctrl=u&&!u.hbShip&&!u.gone&&!u.dead?u:null;')
# Existing embedders require these two entry hooks to remain first.
for signature,call in [('function updateUnit(u, dt) {','  updateJokerProtection(u);'),('function startGame(cfg) {','  playerSetControl(null);')]:
 start=s.index(signature);end=s.index('\nfunction ',start+len(signature));part=s[start:end].replace(call+'\n','');part=part.replace(signature,signature+'\n'+call,1);s=s[:start]+part+s[end:]
p.write_text(s)
