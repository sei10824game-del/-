from pathlib import Path
import json
p=Path('mansion_war.html');s=p.read_text()
a='/* FIVE_FACTIONS_BEGIN */';b='/* FIVE_FACTIONS_END */'
data=json.loads(Path('research/five-factions-roster.json').read_text())
block=a+'\nconst FIVE_TYPES='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n'+Path('tools/five-fidelity.js').read_text()+'\n'+Path('tools/five-factions-runtime.js').read_text()+'\n'+Path('tools/five-vehicle-renderer.js').read_text()+'\n'+Path('tools/doom-nest-runtime.js').read_text()+'\n'+Path('tools/combat-contact-runtime.js').read_text()+'\n'+Path('tools/visual-material.js').read_text()+'\n'+Path('tools/canon-world-runtime.js').read_text()+'\n'+Path('tools/acrobat-runtime.js').read_text()+'\n'+Path('tools/player-control.js').read_text()+'\n'+Path('tools/sculk-runtime.js').read_text()+'\n'+Path('tools/piglin-army-runtime.js').read_text()+'\n'+Path('tools/taken-runtime.js').read_text()+'\n'+Path('tools/taken-renderer.js').read_text()+'\n'+Path('tools/slayer-runtime.js').read_text()+'\n'+Path('tools/slayer-mighty-runtime.js').read_text()+'\n'+Path('tools/slayer-grabber-runtime.js').read_text()+'\n'+Path('tools/slayer-renderer.js').read_text()+'\n'+Path('tools/slayer-hero-runtime.js').read_text()+'\n'+Path('tools/sans-runtime.js').read_text()+'\n'+Path('tools/sans-renderer.js').read_text()+'\n'+Path('tools/platform-heroes-runtime.js').read_text()+'\n'+Path('tools/platform-heroes-renderer.js').read_text()+'\n'+b+'\n'
if a in s:
 start=s.index(a);end=s.index(b,start)+len(b)+1;s=s[:start]+block+s[end:]
else:
 s=s.replace('const DEVIL_SPECIES=',block+'const DEVIL_SPECIES=',1)
 s=s.replace('const FAC_BY = {};',"FACTION_DEFS.push({f:'pr',name:'プレデター',icon:'🎯',col:'#b6b18b',group:'Predator',panel:'panelPr'}, {f:'cv',name:'コヴナント',icon:'🔷',col:'#9d92e5',group:'Halo',panel:'panelCv'}, {f:'th',name:'物体X',icon:'🧬',col:'#c88d87',group:'The Thing',panel:'panelTh'}, {f:'dr',name:'DOORS',icon:'🚪',col:'#b8a7d7',group:'Roblox',panel:'panelDr'}, {f:'dm',name:'DOOM 悪魔軍',icon:'🔥',col:'#e57a56',group:'DOOM',panel:'panelDm'});\nconst FAC_BY = {};",1)
 s=s.replace('  spawnExeFactions();','  spawnExeFactions();\n  spawnFiveFactions();',1)
 s=s.replace('  pitOnSpawn(u);','  pitOnSpawn(u);\n  fiveOnSpawn(u);',1)
 s=s.replace("if(u.sp.exeShape)drawExeUnit(u);", "if(u.sp.five||u.fiveAssimilated)drawFiveUnit(u,pose);\n    else if(u.sp.exeShape)drawExeUnit(u);",1)
 s=s.replace("function exFire(u,d,a){", "function exFire(u,d,a){\n if(d.fiveMove){fiveFire(u,d,a);return;}",1)
 s=s.replace('function updateExpansion(dt){','function updateExpansion(dt){\n updateFive(dt);',1)
 s=s.replace('function drawCountdownBombs(){drawExeEffects();','function drawCountdownBombs(){drawFiveFields();drawExeEffects();',1)
 s=s.replace("      case 'pitDrone':", "      case 'fiveFaction': thinkFive(u);break;\n      case 'pitDrone':",1)
 s=s.replace("    if(u.fac==='pv')", "    if(u.fiveAssimilated){thinkFive(u);return;}\n    if(u.fac==='pv')",1)
 s=s.replace("  if (u === o) return false;", "  if (u === o) return false;\n  if(u.sp.fivePassive||o.sp.fivePassive)return false;\n  if(o.fiveHidden&&u.fac!=='th')return false;",1)
 s=s.replace('  if (!unitHasSight(u)) return false;', "  if(o.fiveCloakUntil>G.time&&dist(u.x,u.y,o.x,o.y)>100)return false;\n  if(o.fiveHidden&&u.fac!=='th')return false;\n  if (!unitHasSight(u)) return false;",1)
 s=s.replace('  if(tgt.shellT>0)return;', '  if(tgt.shellT>0)return;\n  dmg=fiveDamage(att,tgt,dmg,o);if(dmg<=0)return;',1)
 s=s.replace('  u.dead = true; u.gone = true;', '  u.dead = true; u.gone = true;\n  fiveOnDeath(u,o);',1)
 s=s.replace("function facPot(f) {", "function facPot(f) {\n  if(f==='dr'||f==='dm')return G.units.filter(u=>!u.gone&&!u.dead&&u.fac===f&&!u.sp.fivePassive).length+xPending(f);",1)
 s=s.replace("if (!u.gone && !u.dead && u.fac === f) n++;", "if (!u.gone && !u.dead && u.fac === f && !u.sp.fivePassive) n++;",1)
 s=s.replace('u.sp.infectionImmune||(u.sp.exeImmune', 'u.sp.infectionImmune||u.fiveCellImmune||(u.sp.exeImmune',1)
# These connections also apply when upgrading an already embedded HTML.
s=s.replace("    p.t += dt;\n    if (p.kind === 'rocket')", "    p.t += dt;\n    if(p.fiveHoming)fiveGuideProjectile(p,dt);\n    if (p.kind === 'rocket')",1)
shot="const pp = G.projs[G.projs.length - 1]; if (pp && pp.src === u && st) pp.style = st;"
if 'pp.fiveHoming=true' not in s:
 s=s.replace(shot,shot+"\n          if(pp&&pp.src===u&&['homing','homingfire','homingskull','bolt','needler','fence'].includes(d.fiveShot)){pp.fiveHoming=true;pp.fiveTarget=tgt;}",1)
s=s.replace("if (d.projKind === 'rocket') addLog('🚀 ネメシスがロケットを発射した！', 't');", "if (d.projKind === 'rocket') addLog(d.fiveShot?'🚀 '+u.sp.name+'が砲弾を発射した！':'🚀 ネメシスがロケットを発射した！',d.fiveShot?u.fac:'t');",1)
p.write_text(s)

import runpy
runpy.run_path('tools/connect-five-fidelity.py')

runpy.run_path('tools/embed-restoration.py')

runpy.run_path('tools/embed-leadership-acrobat.py')

runpy.run_path('tools/embed-player-control.py')

runpy.run_path('tools/embed-sculk-piglin.py')

runpy.run_path('tools/embed-taken.py')

runpy.run_path('tools/embed-slayer.py')

runpy.run_path('tools/embed-sans.py')

runpy.run_path('tools/embed-platform-heroes.py')

runpy.run_path('tools/embed-performance.py')

runpy.run_path('tools/embed-omori.py')

runpy.run_path('tools/embed-crowd-joker.py')

runpy.run_path('tools/embed-terraria-battle.py')

runpy.run_path('tools/embed-halberd.py')

runpy.run_path('tools/embed-dst-update.py')
