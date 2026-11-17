from pathlib import Path
p=Path('mansion_war.html');s=p.read_text()
a='/* TERRARIA_BATTLE_BEGIN */';b='/* TERRARIA_BATTLE_END */';block=a+'\n'+Path('tools/terraria-runtime.js').read_text()+'\n'+b
if a in s:s=s[:s.index(a)]+block+s[s.index(b)+len(b):]
else:s=s.replace('/* FIVE_FACTIONS_END */',block+'\n/* FIVE_FACTIONS_END */',1)
def hook(marker,old,new):
 global s
 if marker not in s:
  if old not in s:raise RuntimeError('Missing Terraria hook '+old[:70])
  s=s.replace(old,new,1)
if '  updateTerrariaRain(dt);' not in s:
 start=s.index('  G.slimeRainT = (G.slimeRainT || 8) - dt;');end=s.index('\n}\n',start)
 s=s[:start]+'  updateTerrariaRain(dt);'+s[end:]
s=s.replace('G.slimeRainT = 8; G.slimeKills = 0;', 'G.slimeRainT = 1; G.slimeKills = 0;')
hook('  terrariaSlimeDeath(u);','  u.dead = true; u.gone = true;','  u.dead = true; u.gone = true;\n  terrariaSlimeDeath(u);')
hook('if(u.terrariaFalling){', '  if (u.gone) return;\n  // 騎乗', '  if (u.gone) return;\n  if(u.terrariaFalling){u.z=Math.max(0,u.z-180*dt);u.moveSpd=0;if(u.z<=0)u.terrariaFalling=false;return;}\n  // 騎乗')
s=s.replace('drawDQSlime(u, pose); return;','drawTerrariaSlime(u, pose); return;')
s=s.replace("spawnC2('crunner', 12); spawnC2('cstalker', 6); spawnC2('cclicker', 4); spawnC2('cshambler', 2);", "spawnC2('crunner', 24); spawnC2('cstalker', 12); spawnC2('cclicker', 8); spawnC2('cshambler', 4);")
hook('  if(combatNotice(u,o))return true;', '  if (hasMemoryOf(u, o)) return true;', '  if (hasMemoryOf(u, o)) return true;\n  if(combatNotice(u,o))return true;')
start=s.index('function thinkRaid(u) {');end=s.index('\nfunction pickRaidFocus',start)
s=s[:start]+'''function thinkRaid(u) {
  const local=acquireTarget(u,500);
  if(local)u.tgt=local;
  else if(!exAlive(u.tgt)||!hostileTo(u,u.tgt)){
    if(!exAlive(G.raidFocus)||!hostileTo(u,G.raidFocus))G.raidFocus=pickRaidFocus(u);
    u.tgt=G.raidFocus;
  }
  thinkMonster(u);
}'''+s[end:]
s=s.replace('    if (u.x < vx0 - drawMargin || u.x > vx1 + drawMargin || u.y * SQ < vy0 - drawMargin || u.y * SQ > vy1 + drawMargin) continue;', '    if (!renderUnitInView(u,vx0,vx1,vy0,vy1)) continue;')
s=s.replace("(u.z || 0) > 2 && u.x > vx0 && u.x < vx1) drawShadow", "(u.z || 0) > 2 && u.x+u.r*2 > vx0 && u.x-u.r*2 < vx1 && u.y*SQ+u.r*2>vy0 && u.y*SQ-u.r*2<vy1) drawShadow")
if 'function drawDQSlime(' in s:
 start=s.index('function drawDQSlime(');end=s.index('\nfunction drawHugger(',start);s=s[:start]+s[end:]
start=s.index('  G.slimeRooms = [];');end=s.index("  if (!facOn('O'))",start)
part=s[start:end].replace('const r = rpick(G.map.rooms);','const available=G.map.rooms.filter(r=>!used.has(r));if(!available.length)break;const r=rpick(available);');s=s[:start]+part+s[end:]
s=s.replace("{ f: 'O', name: 'スライム', icon: '🟢', col: '#5cb85c', group: 'ドラクエ',","{ f: 'O', name: 'Terraria スライム', icon: '🟢', col: '#5cb85c', group: 'Terraria',")
p.write_text(s)
