const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext('{'+s+'}',sandbox);
run(`G.map=genMansion(120,84,74538);G.map.walk.fill(1);PF.init();G.facOff={};G.cfg.invincibility=false;G.cfg.sound=false;Sfx.on=false;G.started=true;G.over=false;G.paused=false;G.time=100;G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,inf:0,conv:0};
function resetSl(){G.units=[];G.corpses=[];G.projs=[];G.slayer={shots:[],fields:[],pickups:[]};G.time+=20;}
function enemySl(x=720,y=600){const t=spawnUnit('human',x,y,{force:true});t.hp=t.mhp=100000;t.sp={...t.sp,hp:100000};return t;}
function tickSl(n=100){for(let i=0;i<n;i++){G.time+=.02;updateSlayers(.02);}}
`);
assert.equal(run('SL_ROSTER.length'),27);assert.equal(run('new Set(SL_ROSTER).size'),27);
run(`for(const key of SL_ROSTER){resetSl();const u=spawnUnit(key,600,600,{force:true});if(!u)throw Error('missing '+key);if(spawnUnit(key,630,600,{force:true}))throw Error('forced duplicate '+key);if(spawnUnit(key,630,600))throw Error('normal duplicate '+key);
if(!infectionProtected(u)||isInfectHost(u)||jokerEligible(u))throw Error('infection eligibility '+key);
const original=u.sp;startTransform(u,'joker');if(u.state==='transform'||u.sp!==original)throw Error('joker conversion '+key);startTransform(u,'th_carter_human_imitation');if(u.state==='transform')throw Error('generic conversion '+key);
mkControl(u,null,'test');virusConvert(u,'T');virusConvert(u,'G',true);virusConvert(u,'tv');if(u.fac!=='sl'||u.team!=='sl')throw Error('allegiance '+key);
const h=spawnUnit('hugger',650,600,{force:true});huggerAttach(h,u);if(u.hug||u.gest>=0)throw Error('parasite '+key);
makeCorpse(u,{riseAs:key,riseT:1,virusFac:'T',cSpore:true});const c=G.corpses.at(-1);if(c.riseAs||c.riseT||c.virusFac||c.cSpore)throw Error('corpse conversion '+key);
killUnit(null,u,{noRise:true});if(!spawnUnit(key,600,600,{force:true}))throw Error('dead singleton reservation '+key);
}`);
run(`resetSl();G.facOff.sl=true;spawnSlayers();if(G.units.length)throw Error('disabled faction spawn');G.facOff.sl=false;spawnSlayers();if(G.units.filter(u=>u.sp.slUnit).length!==27)throw Error('initial roster');spawnSlayers();if(G.units.filter(u=>u.sp.slUnit).length!==27)throw Error('duplicate initialization');`);
run(`resetSl();const u=spawnUnit('sl_doom',600,600,{force:true}),v=spawnUnit('sl_eternal',650,600,{force:true}),t=enemySl();if(hostileTo(u,v)||!hostileTo(u,t)||!hostileTo(t,u))throw Error('hostility');
const hp=u.hp,armor=u.slArmor;dealDamage(t,u,40,{});if(u.hp!==hp-20*u.slPower.taken||u.slArmor!==armor-20*u.slPower.taken)throw Error('classic armor');
const d=u.atkList.find(d=>d.slWeapon==='pistol');u.slAmmo.bullet=0;if(canUse(u,d,t))throw Error('empty ammunition usable');fireAttack(u,d,{tgt:t});if(t.hp!==t.mhp)throw Error('empty ammunition damage');
slRefill(u,'supply');if(!canUse(u,d,t))throw Error('refilled gun unusable');fireAttack(u,d,{tgt:t});if(t.hp>=t.mhp)throw Error('hitscan no damage');`);
run(`const checked=new Set();for(const key of SL_ROSTER){for(const original of SP[key].atks){const id=original.slWeapon;if(checked.has(id))continue;checked.add(id);if(key==='sl_mighty'){const slot=Object.keys(SL_MIGHTY_SLOTS).find(slot=>SL_MIGHTY_SLOTS[slot].includes(id));SL_MIGHTY_CONFIG={...SL_MIGHTY_DEFAULT,[slot]:id};}resetSl();const u=spawnUnit(key,600,600,{force:true}),t=enemySl(640);for(const k in u.slAmmo)u.slAmmo[k]=10000;u.slFuel=3;const d=u.atkList.find(d=>d.slWeapon===id);
if(d.slKind==='glory')t.hp=50;
if(d.slKind==='grabber'){u.faceA=0;fiveLaunch(t,{fiveShot:'fireball',projKind:'fireball',dmg:30,volley:1},{tgt:u});}
if(d.slKind==='collar'){t.key='hellhound';}
const before=t.hp,ammo=d.slAmmo&&u.slAmmo[d.slAmmo];fireAttack(u,d,{tgt:t,slMightyAutomatic:key==='sl_mighty'});tickSl();
if(d.slAmmo&&u.slAmmo[d.slAmmo]>=ammo&&d.slKind!=='cube'&&d.slKind!=='slam')throw Error('no resource consumption '+id);
if(d.dmg>0&&!['grabber','telefrag'].includes(d.slKind)&&t.hp>=before)throw Error('no live weapon damage '+id+'/'+d.slKind);
} }
globalThis.slChecked=checked.size;`);
assert.ok(run('slChecked')>=75);
run(`resetSl();const e=spawnUnit('sl_eternal',600,600,{force:true}),a=spawnUnit('sl_tag1',650,600,{force:true}),b=spawnUnit('sl_tag2',700,600,{force:true});if(!e.atkList.some(d=>d.slWeapon==='crucible')||a.atkList.some(d=>d.slWeapon==='crucible')||b.atkList.some(d=>d.slWeapon==='crucible')||!b.atkList.some(d=>d.slWeapon==='hammer'))throw Error('TAG loadout leakage');
const lost=SP.sl_lostmission.atks.map(d=>d.slWeapon);if(lost.includes('cube')||lost.includes('artifact')||lost.includes('saw')||lost.includes('flashlight'))throw Error('Lost Mission loadout');
const rust=SP.sl_rust.atks.map(d=>d.slWeapon);if(rust.includes('plasma')||rust.includes('bfg')||!rust.includes('calamity'))throw Error('Rust replacement arsenal');`);
run(`resetSl();const u=spawnUnit('sl_2016',600,600,{force:true}),t=enemySl(640);u.hp=40;u.slAmmo.soul=0;t.hp=50;fireAttack(u,u.atkList.find(d=>d.slWeapon==='glory'),{tgt:t});if(u.hp<=40||u.slAmmo.soul!==1)throw Error('glory rewards');
const t2=enemySl(640);u.slAmmo.bullet=0;t2.hp=10;fireAttack(u,u.atkList.find(d=>d.slWeapon==='saw'),{tgt:t2});if(u.slAmmo.bullet<=0||u.slFuel!==2)throw Error('chainsaw resource loop');
const dec=u.atkList.find(d=>d.slWeapon==='holo');const t3=enemySl(640);fireAttack(u,dec,{tgt:t3});if(!u.slDecoy||u.slDecoy===u)throw Error('no decoy');killUnit(t3,u,{noRise:true});if(facPot('sl')!==0)throw Error('decoy keeps faction alive');tickSl(260);if(!u.slDecoy.gone)throw Error('orphan decoy');`);
console.log('Slayer passed: 27 editions, forced singleton/faction switch, live weapons, finite ammo, armor, finishers, TAG exclusions, parasite/virus/Joker/Makima/corpse immunity, faction and decoy lifecycle.');
