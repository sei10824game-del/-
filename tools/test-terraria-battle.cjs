const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext('{'+s+'}',sandbox);
run(`G.map=genMansion(120,84,74538);G.map.walk.fill(1);G.map.propGrid.fill(0);PF.init();G.units=[];G.corpses=[];G.facOff={};G.time=100;G.cfg.sound=false;G.cfg.invincibility=false;Sfx.on=false;G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,inf:0,conv:0};
G.slimeRooms=[0,1,2];G.slimeKills=0;G.slimeRainT=1;G.slimeKing=false;G.slimeKingDead=false;updateTerrariaRain(1);if(G.units.length!==6||!G.units.every(u=>u.terrariaFalling&&u.z>=90))throw Error('rain rate/airborne spawn');const falling=G.units[0];for(let i=0;i<40;i++)updateUnit(falling,1/30);if(falling.terrariaFalling||falling.z!==0)throw Error('never lands');
for(let i=0;i<149;i++){const u=spawnUnit('slimeG',600,600,{force:true});killUnit(null,u,{});}if(G.slimeKills!==149||countKey('kingslime'))throw Error('early king');const last=spawnUnit('slimeB',600,600,{force:true});killUnit(null,last,{});if(G.slimeKills!==150||countKey('kingslime')!==1||!G.slimeKing)throw Error('150 threshold');terrariaSlimeDeath(last);if(G.slimeKills!==150)throw Error('duplicate death');
let before=G.units.length;updateTerrariaRain(5);if(G.units.length!==before+30)throw Error('rain stopped during boss');const king=G.units.find(u=>u.terrariaRainKing);killUnit(null,king,{});if(!G.slimeKingDead)throw Error('king death');before=G.units.length;updateTerrariaRain(30);if(G.units.length!==before)throw Error('rain did not stop');
G.facOff.O=true;G.slimeKingDead=false;G.slimeKills=200;G.slimeKing=false;updateTerrariaRain(3);if(G.units.length!==before)throw Error('disabled rain');G.facOff={};G.slimeRooms=[];
// Real AI attacks in both directions, including initially facing away and cloak.
for(const key of ['cv_brute_stalker','pillager','sl_doom'])for(const other of ['cv_brute_stalker','pillager','sl_doom']){
 if(key===other)continue;G.units=[];G.corpses=[];G.projs=[];G.slayer=null;G.omori=null;G.noises=[];G.raidFocus=null;G.time+=10;
 const u=spawnUnit(key,680,600,{force:true}),t=spawnUnit(other,600,600,{force:true});t.hp=t.mhp=10000000;t.faceA=0;u.faceA=0;if(other==='cv_brute_stalker')t.fiveCloakUntil=G.time+10;
 if(!hostileTo(u,t)||!hostileTo(t,u))throw Error('allegiance '+key+'/'+other);const hp=t.hp;
 for(let i=0;i<360&&t.hp===hp;i++){G.time+=1/30;Spatial.rebuild();updateUnit(u,1/30);updateProjs(1/30);updateSlayers(1/30);updateFive(1/30);}
 if(!(t.hp<hp))throw Error('no AI damage '+key+' -> '+other);
}
// Raid's remote global focus cannot override an immediate nearby attacker.
G.units=[];const r=spawnUnit('pillager',600,600,{force:true}),near=spawnUnit('cv_brute_stalker',680,600,{force:true}),far=spawnUnit('sl_doom',1600,600,{force:true});r.faceA=0;G.raidFocus=far;Spatial.rebuild();thinkRaid(r);if(r.tgt!==near)throw Error('remote focus override');
// Camera culling retains edge-overlapping big/high models but rejects distant bodies.
const v={...r,x:600,y:600,z:0};if(!renderUnitInView(v,500,700,200,500)||renderUnitInView({...v,x:9000},500,700,200,500)||renderUnitInView({...v,y:9000},500,700,200,500))throw Error('viewport culling');
`);
console.log('Terraria/battle passed: 6 slimes/sec in 3 rooms, landing, exact 150 deaths, one king, uninterrupted boss rain, death/disable stop, all six directed AI damage pairs including rear/close cloak, nearby raid focus, conservative camera culling.');
