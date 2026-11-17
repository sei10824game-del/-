"""Reproducible leadership/protection/population hooks; final embed pass."""
from pathlib import Path
p = Path('mansion_war.html')
s = p.read_text()
intro = Path('tools/combine-leadership.js').read_text().split('function cbLeaderRank(')[0]
s = s.replace(intro, '')
start = s.index('function cbLeaderRank(') if 'function cbLeaderRank(' in s else s.index('function cbUpdateSquads(')
end = s.index('function thinkCombine(', start)
s = s[:start] + Path('tools/combine-leadership.js').read_text() + '\n' + s[end:]
old = " if(squad&&squad.leader!==u&&dist(u.x,u.y,squad.leader.x,squad.leader.y)>65){const l=squad.leader,a=(u.cbSlot||0)*TAU/5;const x=l.x+Math.cos(a)*45,y=l.y+Math.sin(a)*45;if(walkAtPx(x,y))setDest(u,x,y);else setDest(u,l.x,l.y);return;}"
s = s.replace(old, ' if(!clone&&cbPatrolThink(u))return;')
if 'function thinkCombine(u){\n u.cbFollowing=null;' not in s:
    s = s.replace('function thinkCombine(u){', 'function thinkCombine(u){\n u.cbFollowing=null;', 1)
s = s.replace('(u.sp.combineUnit||u.sp.devilImmune||u.sp.exeImmune)&&(newKey', '(u.sp.combineUnit||u.sp.devilImmune||u.sp.exeImmune||u.sp.jokerImmune)&&(newKey')
s = s.replace('return isInfectHost(u)&&!u.sp.combineUnit&&!u.sp.devilImmune;', 'return isInfectHost(u)&&!u.sp.combineUnit&&!u.sp.devilImmune&&!u.sp.jokerImmune;')
if 'function updateUnit(u, dt) {\n  updateJokerProtection(u);' not in s:
    s = s.replace('function updateUnit(u, dt) {', 'function updateUnit(u, dt) {\n  updateJokerProtection(u);', 1)
if '    acrobatDrawTransform(u);' not in s:
    s = s.replace('    const pose = poseFor(u);', '    acrobatDrawTransform(u);\n    drawCombineLeader(u);\n    const pose = poseFor(u);', 1)
s = s.replace("i < 8; i++) { const p = randWalkIn(wRoom); spawnUnit('wspike'", "i < 16; i++) { const p = randWalkIn(wRoom); spawnUnit('wspike'")
s = s.replace("i < 7; i++) { const p = randWalkIn(sRoom); spawnUnit('scp939'", "i < 14; i++) { const p = randWalkIn(sRoom); spawnUnit('scp939'")
s = s.replace("i<12;i++) {const p=randWalkIn(room);spawnUnit('mcVillager'", "i<24;i++) {const p=randWalkIn(room);spawnUnit('mcVillager'")
# Retain the existing easy population milestones, without a guardian population cap.
s = s.replace('population>=v.nextPopulation && guardians<12', 'population>=v.nextPopulation')
s = s.replace('（守護上限12）', '（個体数上限なし）')
s = s.replace('headR:4.2,handL:6}', 'headR:4.2,handL:1.7}')
s = s.replace("fx:{bareTorso:1,claws:1},\n desc:'箱から這い出す", "fx:{bareTorso:1,claws:1,verityFingers:1},\n desc:'箱から這い出す")
if 'if(fx.verityFingers){drawVerityFingers' not in s:
    s = s.replace('  // 手 (hand)\n  if (fx.claws)', '  // 手 (hand)\n  if(fx.verityFingers){drawVerityFingers(arm,P,dark<1?skinD:skin);return;}\n  if (fx.claws)', 1)
p.write_text(s)
