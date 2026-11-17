"""Import pinned Minecraft 1.20.1 static recipes/tags and vanilla fuel definitions.
Usage: python3 tools/import-minecraft-crafting.py DATA_MINECRAFT_DIR FURNACE_JAVA_FILE
See GOLEM_COMPLETION.md for pinned source revisions. Normal builds need no download.
"""
from pathlib import Path
import json,re,sys
root=Path(sys.argv[1]);recipes=[]
for p in sorted((root/'recipes').glob('*.json')):
 d=json.loads(p.read_text())
 if d['type'] in ['minecraft:crafting_shaped','minecraft:crafting_shapeless']:recipes.append({'id':p.stem,**d})
raw={str(p.relative_to(root/'tags/items'))[:-5]:json.loads(p.read_text())['values'] for p in (root/'tags/items').rglob('*.json')}
def resolve(k,seen=()):
 if k in seen:raise ValueError('tag cycle '+k)
 out=set()
 for value in raw.get(k,[]):
  if isinstance(value,dict):value=value['id']
  if value.startswith('#'):out.update(resolve(value[1:].replace('minecraft:',''),seen+(k,)))
  else:out.add(value.replace('minecraft:',''))
 return sorted(out)
tags={k:resolve(k) for k in raw};fuels={};never=set(tags.get('non_flammable_wood',[]))
code=Path(sys.argv[2]).read_text();code=code[code.index('public static Map<Item, Integer> getFuel()'):];code=code[:code.index('return var0;')]
for kind,name,time in re.findall(r'add\(var0, (Items|Blocks|ItemTags)\.(\w+), (\d+)\)',code):
 for item in tags.get(name.lower(),[]) if kind=='ItemTags' else [name.lower()]:
  if item not in never:fuels[item]=int(time)
data={'source':'https://github.com/misode/mcmeta/tree/2dedcb96cc58788e8b0206c93ae5e61faea2ed19/data/minecraft','version':'1.20.1','recipes':recipes,'tags':tags,'fuels':fuels,'fuelSource':'https://github.com/mahtomedi/minecraft/blob/6ac5fe18be48a7395be84148be051908111d6772/src/main/java/net/minecraft/world/level/block/entity/AbstractFurnaceBlockEntity.java'}
Path('research/minecraft-crafting.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
print(len(recipes),'static recipes,',len(tags),'resolved item tags,',len(fuels),'fuels')
