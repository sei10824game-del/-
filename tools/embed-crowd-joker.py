from pathlib import Path
p=Path('mansion_war.html');s=p.read_text()
a=s.index('function jokerEligible(');b=s.index('\n',a)
s=s[:a]+"function jokerEligible(u){return !!(u&&u.sp&&!u.dead&&!u.gone&&u.sp.mortal&&u.sp.kind==='biped'&&u.sp.head==='human'&&!(u.atkList||[]).length&&!(u.sp.atks||[]).length&&!Object.values(u.sp.formAtks||{}).some(a=>a.length)&&isInfectHost(u)&&!u.sp.combineUnit&&!u.sp.devilImmune&&!u.sp.jokerImmune);}"+s[b:]
s=s.replace("function startTransform(u, newKey, opts = {}) {", "function startTransform(u, newKey, opts = {}) {\n  if((newKey==='joker'||newKey==='jokerFan')&&!jokerEligible(u)){u.jokerRate=0;return;}" ,1) if "if((newKey==='joker'||newKey==='jokerFan')&&!jokerEligible(u))" not in s else s
s=s.replace("function finishTransform(u) {", "function finishTransform(u) {\n  if((u.transTo==='joker'||u.transTo==='jokerFan')&&!jokerEligible(u)){u.jokerRate=0;u.transTo=null;u.state='idle';return;}",1) if "u.transTo==='joker'||u.transTo==='jokerFan'" not in s else s
s=s.replace('addNoise(u.x, u.y, 240);','addNoise(u.x, u.y, 240, u.fac);')
# Friendly footstep events used to attract every monster in the pack back to each other.
s=s.replace('    const d = dist(u.x, u.y, nz.x, nz.y);\n    if (d > 520) continue;', "    if(nz.fac===u.fac||(u.allyFacs||[]).includes(nz.fac))continue;\n    const d = dist(u.x, u.y, nz.x, nz.y);\n    if (d > 520 || d < 40) continue;",1)
s=s.replace('if (u.hearCommit && dist(u.x, u.y, u.hearCommit.x, u.hearCommit.y) > 36)', 'if (u.hearCommit && (u.hearCommit.until||0)>G.time && dist(u.x, u.y, u.hearCommit.x, u.hearCommit.y) > 36)')
s=s.replace('u.hearCommit = { x: best.x, y: best.y };','u.hearCommit = { x: best.x, y: best.y, until:G.time+4 };')
s=s.replace("if (o.allyFacs && o.allyFacs.indexOf(u.fac) >= 0) continue;\n    const n = typeof unitNoise", "if (!hostileTo(u,o)) continue;\n    const n = typeof unitNoise",1)
if 'friendly target changed faction' not in s:
 s=s.replace('function thinkMonster(u) {',"function thinkMonster(u) {\n  // Drop a friendly target changed faction by infection, conversion or Kirby.\n  if(u.tgt&&!hostileTo(u,u.tgt)){u.tgt=null;u.dest=null;u.path=null;}\n  if(u.aggro&&!hostileTo(u,u.aggro))u.aggro=null;",1)
s=s.replace("v.fac === 'T' && v !== u && (v.sp.mass >= 4 || v.sp.brute)","v.fac === u.fac && v !== u && !v.dead && dist(u.x,u.y,v.x,v.y)>180 && (v.sp.mass >= 4 || v.sp.brute)")
# A destination behind an unreachable wall must not monopolize an idle monster forever.
if 'crowdRouteWatch(u,dt);' not in s:s=s.replace('  // スタミナ(獲物)','  crowdRouteWatch(u,dt);\n  // スタミナ(獲物)',1)
p.write_text(s)
# Runtime lives outside replaceable block so re-embedding is idempotent.
a='/* CROWD_ROUTE_WATCH_BEGIN */';b='/* CROWD_ROUTE_WATCH_END */'
source='''function crowdRouteWatch(u,dt){
 if(!['monster','mz'].includes(u.sp.ai)||u===G.ctrl||u.canonTrap||u.tkFrozenUntil>G.time||u.pmRootUntil>G.time||!['idle','move'].includes(u.state)||!u.dest||exAlive(u.tgt)){u.crowdStall=0;return;}
 const prev=u.crowdCheckpoint;if(!prev){u.crowdCheckpoint={x:u.x,y:u.y};u.crowdStall=0;return;}
 if(dist(prev.x,prev.y,u.x,u.y)>12){u.crowdCheckpoint={x:u.x,y:u.y};u.crowdStall=0;return;}
 u.crowdStall=(u.crowdStall||0)+dt;if(u.crowdStall<2.5)return;
 u.crowdStall=0;u.hearCommit=null;u.path=null;u.dest=null;u.crowdCheckpoint={x:u.x,y:u.y};
 const base=(u.id*2.399963229728653)%TAU;
 for(let i=0;i<12;i++){const a=base+i*TAU/12,r=80+(i%3)*40,x=u.x+Math.cos(a)*r,y=u.y+Math.sin(a)*r;if(bodyClear(x,y,navigationRadius(u))&&losWalk(u.x,u.y,x,y,navigationRadius(u))){setDest(u,x,y,true);return;}}
}'''
s=p.read_text();block=a+'\n'+source+'\n'+b
if a in s:s=s[:s.index(a)]+block+s[s.index(b)+len(b):]
else:s=s.replace('/* ── 起動 ── */',block+'\n/* ── 起動 ── */',1)
p.write_text(s)
