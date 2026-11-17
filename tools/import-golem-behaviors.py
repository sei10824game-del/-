"""Resolve upstream parents and named brains for the 189 registered golems.
Usage: python3 tools/import-golem-behaviors.py PATH_TO_UPSTREAM_DATA_GOLEMS
The source checkout must be commit b70f8036489b5e23e1bec5b0453e481baba5c480.
"""
from pathlib import Path
import sys,json,re,copy
root=Path(sys.argv[1]);sha='b70f8036489b5e23e1bec5b0453e481baba5c480'
url=f'https://github.com/MinecraftModDevelopmentMods/Extra-Golems/blob/{sha}/src/main/resources/data/golems/golems/'
raw={p.stem:json.loads(p.read_text()) for p in (root/'golem').glob('*.json')}
cache={}
def resolve(key,seen=()):
 if key in seen:raise ValueError('parent cycle '+key)
 if key in cache:return copy.deepcopy(cache[key])
 d=copy.deepcopy(raw[key]);chain=[url+'golem/'+key+'.json']
 if 'parent' in d:
  parent=resolve(d['parent'].split(':')[-1],seen+(key,));base=parent['data'];chain+=parent['sourceChain'];base.update(d);d=base
 brain=d.get('brain',{})
 if isinstance(brain,str):
  name=brain.split(':')[-1];brain=json.loads((root/'behavior_list'/(name+'.json')).read_text());chain.append(url+'behavior_list/'+name+'.json')
 d['brain']=brain
 cache[key]={'source':chain[0],'sourceChain':list(dict.fromkeys(chain)),'data':d}
 return copy.deepcopy(cache[key])
s=Path('mansion_war.html').read_text();roster=json.loads(re.search(r'const EXTRA_GOLEM_DATA = (\[.*?\]);',s).group(1))
out={'eg_'+x[0]:resolve(x[0]) for x in roster}
Path('research/restored-golem-behaviors.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(f'Resolved {len(out)} registered golems, {sum(bool(x["data"]["brain"].get("behaviors")) for x in out.values())} with behaviors')
