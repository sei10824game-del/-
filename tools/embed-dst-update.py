"""DST encounters, Sculk spawn initialization, and visual-only uniform lighting."""
from pathlib import Path
import json, re
p=Path('mansion_war.html');s=p.read_text()
a='/* DST_UPDATE_BEGIN */';b='/* DST_UPDATE_END */';block=a+'\n'+Path('tools/dst-runtime.js').read_text()+'\n'+Path('tools/dst-renderer.js').read_text()+'\n'+b
if a in s:s=s[:s.index(a)]+block+s[s.index(b)+len(b):]
else:s=s.replace('/* FIVE_FACTIONS_END */',block+'\n/* FIVE_FACTIONS_END */',1)
def hook(marker,old,new):
 global s
 if marker not in s:
  if old not in s:raise RuntimeError('Missing DST hook '+old[:100])
  s=s.replace(old,new,1)
fac=[('dtEye','Eye of Terror','👁️','#d6a5a4'),('dtDragon','Dragonfly','🔥','#dba85b'),('dtBear','Bearger','🐻','#b5aba0'),('dtMoose','Moose/Goose','🪿','#c6bba3'),('dtPig','Nightmare Werepig','🐗','#bfa2c0'),('dtDeer','Deerclops','🦌','#b8cbd5'),('dtVarg','Varg','🐺','#b3b9c4')]
literal=json.dumps([dict(f=f,name=n,icon=ic,col=c,group="Don't Starve Together",panel='panel_'+f)for f,n,ic,c in fac],ensure_ascii=False,separators=(',',':'))
hook('FACTION_DEFS.push(...[{"f":"dtEye"','const FAC_BY = {};','FACTION_DEFS.push(...'+literal+');\nconst FAC_BY = {};')
hook('  G.dst=null;','  G.halberd=null;','  G.halberd=null;\n  G.dst=null;')
hook('  spawnDST();','  spawnOmori();','  spawnOmori();\n  spawnDST();')
hook('  skInit(u);','  hbInit(u,o);','  hbInit(u,o);\n  skInit(u);\n  dstInit(u);')
hook(' dstTick(dt);',' hbTick(dt);',' hbTick(dt);\n dstTick(dt);')
hook("case 'dst':", "      case 'halberd':", "      case 'dst': thinkDST(u);break;\n      case 'dstEgg': u.dest=u.path=null;u.moveSpd=0;break;\n      case 'halberd':")
hook('if(d.dstPower){dstFire','  if(d.hbPower){hbFire(u,d,a);return;}','  if(d.hbPower){hbFire(u,d,a);return;}\n  if(d.dstPower){dstFire(u,d,a);return;}')
hook('  dstOnDeath(u);','  hbOnDeath(u);','  hbOnDeath(u);\n  dstOnDeath(u);')
hook('if(u.sp.dstTiredUntil', 'function canUse(u, d, tgt) {', 'function canUse(u, d, tgt) {\n  if(u.sp.dstTiredUntil||u.dstTiredUntil>G.time)return false;')
hook('else if(u.sp.dst)drawDST', '    else if(u.sp.hbCrew', '    else if(u.sp.dst)drawDST(u,pose);\n    else if(u.sp.hbCrew')
hook('drawDSTEffects();drawHalberdEffects();', 'function drawCountdownBombs(){drawHalberdEffects();','function drawCountdownBombs(){drawDSTEffects();drawHalberdEffects();')
hook('  dstInspector(el,u);','  hbInspector(el,u);','  hbInspector(el,u);\n  dstInspector(el,u);')
hook('...DST_FACTIONS.map', '  const extraFac = [', "  const extraFac = [\n    ...DST_FACTIONS.map(([f,n,ic,c,k])=>[f,'panel_'+f,ic+' '+n,c,Object.keys(SP).filter(key=>SP[key].dst&&SP[key].fac===f)]),")
hook('if(u.sp.dstEgg||u.key', 'function makeCorpse(u, opts = {}) {', "function makeCorpse(u, opts = {}) {\n  if(u.sp.dstEgg||u.key==='dstLeech')return;")
hook("u.fac.startsWith('dt')", "  if(u.fac==='sk'||o.fac==='sk')return u.fac!==o.fac;", "  if(u.fac.startsWith('dt')||o.fac.startsWith('dt'))return u.fac!==o.fac;\n  if(u.fac==='sk'||o.fac==='sk')return u.fac!==o.fac;")
hook('if (G.cfg.uniformLighting)', 'function renderLighting(W, H, z, ox, oy) {', 'function renderLighting(W, H, z, ox, oy) {\n  if (G.cfg.uniformLighting) { drawUniformLighting(W,H);return; }')
hook('id="segUniformLighting"','      <div id="facWarn"', '      <div class="optrow"><span class="lbl">💡 全部屋の明るさを均一化</span><div class="seg" id="segUniformLighting" title="描画のみ変更。索敵・感染・戦闘の仕様は変わりません"><div data-v="1">ON</div><div data-v="0" class="on">OFF（従来の照明）</div></div></div>\n      <div id="facWarn"')
hook('id="btnUniformLighting"','    <div class="tbtn clickable" id="btnFollow"','    <div class="tbtn clickable" id="btnUniformLighting" title="全部屋の明るさを均一化（見た目のみ）">💡 均一照明 OFF</div>\n    <div class="tbtn clickable" id="btnFollow"')
hook("segBind('segUniformLighting'", "  segBind('segShake',", "  {let uniform=false;try{uniform=localStorage.getItem('mw_uniformLighting')==='1';}catch(e){}setUniformLighting(uniform);}\n  segBind('segUniformLighting',v=>setUniformLighting(v==='1'));\n  $('btnUniformLighting').addEventListener('click',()=>setUniformLighting(!G.cfg.uniformLighting));\n  segBind('segShake',")
s=re.sub(r'        <li>[^\n]*部屋の照明は時々明滅し[^\n]*</li>', '        <li>「全部屋の明るさを均一化」は開始前・上部ボタンで切替可能（描画のみ）。OFFでは従来どおり部屋の照明は時々明滅し、壊れて真っ暗な部屋もある。炎・爆発・銃口炎・発光する怪物が闇を照らす</li>',s)
p.write_text(s)
