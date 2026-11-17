"""Inventory the 398 implementations. This is NOT an automated canon certification."""
import json,re
from pathlib import Path
roster=json.loads(Path('research/five-factions-roster.json').read_text())
code=Path('tools/five-fidelity.js').read_text()
hps={k:int(v) for k,v in re.findall(r'([a-z_]+):(\d+)',re.search(r'const FIVE_CLASSIC_HP=\{([^}]+)',code)[1])}
rows=[]
for r in roster:
 rules=[]
 if r['faction']=='th':rules+=['contact assimilation channel, separation/damage interruption, preserved original appearance']
 if 'fragment' in r['flags']:rules+=['fragment rejoining wounded Thing']
 if r['shape']=='jackal' and 'shield' in r['flags']:rules+=['front shield / exposed rear / ballistic rejection / charged plasma break']
 if r['shape']=='hunter':rules+=['front armor and exposed rear']
 if 'needler' in r['moves']:rules+=['homing physical needles / delayed shards / seven-shard supercombine']
 if set(r['moves'])&{'sticky','grenade'}:rules+=['attachment / delayed fuse']
 if 'net' in r['moves']:rules+=['physical constricting net / immobilization / acid and smart-disc release']
 if r['key']=='dm_marauder':rules+=['reactive shield / green-eye vulnerability / stagger / shield-triggered wolf / range-dependent attacks']
 if r['key']=='dm_arch_vile_classic':rules+=['moving-target flame / LOS at detonation / launch / splash / resurrection exclusions']
 if r['key'] in ['dm_cyberdemon_classic','dm_spider_mastermind_classic']:rules+=['classic explosion immunity']
 if r['key']=='dr_eyes':rules+=['continuous damage to actual viewers; look-away / hiding counter']
 if r['key']=='dr_a_90':rules+=['warning then stop window; movement AND facing check']
 if r['key']=='dr_screech':rules+=['warning; facing/hiding counter before bite']
 if r['key']=='dr_hide':rules+=['hiding duration / 40 damage / ejection / re-entry block']
 if r['key'] in ['dr_rush','dr_ambush','dr_a_60','dr_a_120']:rules+=['raycast occlusion and hiding counter; canonical damage where sourced']
 if r['key']=='dr_figure':rules+=['contact execution; hearing rather than omniscient sight']
 gaps=['original attack inventory/count not fully cross-checked','individual attack animations and every original trigger not certified']
 hp=hps.get(r['key'].removeprefix('dm_')) if r['faction']=='dm' else None
 if hp is None:gaps+=['HP/stat profile not independently verified; provisional values may remain']
 if r['faction']=='dr':gaps+=['original room progression, items and full encounter lifecycle not yet implemented']
 if r['faction']=='dm' and ('boss' in r['flags'] or 'armor' in r['flags']):gaps+=['all phase transitions/destructible components and version-specific exceptions not yet complete']
 if r['faction']=='cv':gaps+=['title-specific weapon/shield variants, vehicle boarding/crew and part-level weak points incomplete']
 if r['faction']=='pr':gaps+=['full equipment interactions, targeting laser/helmet guidance, gauntlet destruction and explosion scale incomplete']
 if r['faction']=='th':gaps+=['film-specific arbitrary severing, fusion/transformation sequence and fresh-corpse assimilation incomplete; channel duration provisional']
 rows.append({'key':r['key'],'name':r['name'],'faction':r['faction'],'source':r['source'],'implementedMoves':r['moves'],'specificRules':rules,'verifiedHP':hp,'hpSource':'https://doomwiki.org/wiki/Health' if hp is not None else None,'canonicalAttackCountVerified':False,'canonicalComplete':False,'remainingGaps':gaps})
Path('research/five-fidelity-audit.json').write_text(json.dumps({'scope':'implementation gap inventory, NOT a full original-source certification','date':'2026-10-22','entries':rows},ensure_ascii=False,indent=2)+'\n')
print(f'{len(rows)} entries inventoried; {sum(r["verifiedHP"] is not None for r in rows)} original HP values; complete-canon certificates: 0 (not asserted).')
