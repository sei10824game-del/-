// Implementation audit only. Shared code is NOT evidence of missing canonical abilities.
const fs=require('node:fs');const{vm,sandbox}=require('./audit-creatures.cjs');
const data=JSON.parse(vm.runInContext(`JSON.stringify({
 factions:FACTION_DEFS.map(f=>({key:f.f,name:f.name,species:Object.entries(SP).filter(([k,s])=>s.fac===f.f).map(([k,s])=>({key:k,name:s.name}))})),
 count:Object.keys(SP).length,
 nonSelectableSpecies:Object.entries(SP).filter(([k,s])=>!FACTION_DEFS.some(f=>f.f===s.fac)).map(([key,s])=>({key,name:s.name,faction:s.fac,status:'canon-comparison-not-completed'})),
 golems:EXTRA_GOLEM_DATA.filter(d=>d[6].length).map(d=>({key:'eg_'+d[0],name:d[1],behaviorTags:d[6]})),
 commonExplosives:Object.entries(SP).flatMap(([key,s])=>(s.atks||[]).filter(d=>d.type==='proj'&&['rocket','nade'].includes(d.projKind)&&!d.fiveShot&&!d.exAction&&!d.cbAction).map(d=>({key,name:s.name,faction:s.fac,attack:d.n,listedDamage:d.dmg,kind:d.projKind})))
})`,sandbox));
const html=fs.readFileSync('mansion_war.html','utf8');
const sources={};for(const needle of ['function villageGolem(', 'function cbFire(', 'for(const [key,name,base,color] of CB_HERO_DATA)', 'function exPlantBomb(', 'function exeFire(', 'function registerFiveFactions(', 'function fiveBuildAttackRaw(', 'function fiveFire(', 'function explodeRocket(', 'function thinkMonster(', 'function navigationRadius(', 'function drawUnit(', 'function fovHalf(']){
 const i=html.indexOf(needle);if(i<0)throw Error('Audit anchor not found: '+needle);sources[needle]={file:'mansion_war.html',line:html.slice(0,i).split('\n').length};
}
const confirmed=new Set(['vg','bm','cb','cc','lx','sx','pr','cv','th','dr','dm']);
const declared=new Set(['hn','rz','E','5']);
for(const f of data.factions){f.status=confirmed.has(f.key)?'simplification-or-substitution-confirmed':declared.has(f.key)?'adaptation-declared-canon-comparison-needed':'canon-comparison-not-completed';}
const golemRecords=JSON.parse(fs.readFileSync('research/restored-golem-behaviors.json','utf8'));
const crafting=JSON.parse(fs.readFileSync('research/minecraft-crafting.json','utf8'));
const restorations={golemRegisteredDataCount:Object.keys(golemRecords).length,golemBehaviorFamilyCount:new Set(Object.values(golemRecords).flatMap(r=>(r.data.brain.behaviors||[]).map(b=>b.type))).size,golemWorldRuntime:html.includes('function golemWorldUpdate('),staticCraftingRecipeCount:crafting.recipes.length,fuelCount:Object.keys(crafting.fuels).length,note:'Verified subset only; see RESTORED_ABILITIES.md. All-faction canonical completion remains unverified.',runtimeEmbedded:html.includes('/* RESTORED_ABILITIES_BEGIN */'),projectileHookInCorrectFunction:html.slice(html.indexOf('function updateProjs('),html.indexOf('\nfunction ',html.indexOf('function updateProjs(')+1)).includes('if(p.fiveCanon)'),projectileBlastDamageForwarded:html.includes('p.dmg>0?p.dmg:65'),golemDataKeys:Object.keys(JSON.parse(fs.readFileSync('research/restored-golem-behaviors.json','utf8'))),bomberHeartbeat6000:html.includes('beats:6000')};
for(const e of data.commonExplosives){e.currentBlastPower=e.listedDamage>0?e.listedDamage:65;e.canonicalDamageVerified=false;}
const out={restorations,scope:'all selectable factions; implementation/document evidence, not exhaustive original-source comparison',date:'2026-10-22',species:data.count,factionCount:data.factions.length,confirmedFactions:data.factions.filter(f=>confirmed.has(f.key)).length,declaredAdaptationFactions:data.factions.filter(f=>declared.has(f.key)).length,sources,...data};
fs.writeFileSync('research/simplification-audit.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({species:out.species,factions:out.factionCount,confirmed:out.confirmedFactions,declared:out.declaredAdaptationFactions,notCleared:out.factions.filter(f=>f.status==='canon-comparison-not-completed').length,commonExplosives:out.commonExplosives.length,behaviorTaggedGolems:out.golems.length,sources},null,2));
