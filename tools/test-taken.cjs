const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');const run=s=>vm.runInContext(s,sandbox);sandbox.innerWidth=1280;sandbox.innerHeight=720;
run(`G.map=genMansion(120,84,74538);PF.init();G.facOff={};G.cfg.invincibility=false;G.cfg.sound=false;Sfx.on=false;G.started=true;G.over=false;G.paused=false;G.time=100;G.stats={};for(const f of FACTION_DEFS)G.stats[f.f]={kills:0,born:0,lost:0,inf:0,conv:0};
function resetTk(){G.units=[];G.corpses=[];G.projs=[];G.city17=null;G.sculk=null;G.pigArmy=null;G.taken=null;G.map.walk.fill(1);G.map.propGrid.fill(0);G.cfg.invincibility=false;G.time+=20;}
function enemy(x=760,y=600){const t=spawnUnit('human',x,y,{force:true});t.hp=t.mhp=10000;return t;}
function power(u,p,t){const d=u.atkList.find(d=>d.tkPower===p);if(!d)throw Error('missing power '+p+' on '+u.key);fireAttack(u,d,{tgt:t});}
function tickTk(n=150){for(let i=0;i<n;i++){G.time+=.02;Spatial.rebuild();updateTaken(.02);}}
resetTk();`);
assert.equal(run('TK_BASE.length'),13);assert.equal(run('TK_ROSTER.length'),16);assert.ok(run('TK_ROSTER.every(k=>SP[k].infectionImmune&&!SP[k].infectable&&!SP[k].mortal)'));
// All dedicated ranged routes inflict actual damage, including every alternative loadout.
run(`for(const key of TK_ROSTER){for(const def of SP[key].atks.filter(d=>['shot','howler','dark','surge'].includes(d.tkPower))){resetTk();const u=tkSpawn(key,600,600),t=enemy();fireAttack(u,def,{tgt:t});tickTk();if(t.hp>=t.mhp)throw Error('no live damage '+key+'/'+def.n);}}`);
run(`resetTk();globalThis.p=tkSpawn('tkPsion',600,600);globalThis.t=enemy();p.hp=1;power(p,'split',t);globalThis.child=G.units.find(u=>u!==p&&u.key===p.key);`);
assert.equal(run('child.hp'),run('child.mhp'));assert.equal(run('child.cds["分裂"]'),run('G.time+14'));assert.equal(run('canUse(child,child.atkList.find(d=>d.tkPower==="split"),t)'),false);
run(`for(let i=0;i<25;i++)power(p,'split',t);`);assert.equal(run('countKey("tkPsion")'),27,'no simultaneous population ceiling');
run(`resetTk();globalThis.w=tkSpawn('tkWizard',600,600);globalThis.t=enemy();power(w,'thralls',t);globalThis.ac=tkSpawn('tkAcolyte',600,640);power(ac,'eye',t);globalThis.eye=G.units.find(u=>u.key==='tkEye');globalThis.x=eye.x;thinkTaken(eye);`);assert.equal(run('countKey("tkShadowThrall")'),2);assert.ok(run('eye.dest==null'));assert.equal(run('eye.sp.walk'),0);
// Tether is truly invulnerable, but supply, motion, LOS and source control matter.
run(`resetTk();globalThis.g=tkSpawn('tkGoblin',600,600);globalThis.ally=tkSpawn('tkOgre',660,600);globalThis.t=enemy();power(g,'tether',ally);dealDamage(t,ally,300,{});`);assert.equal(run('ally.hp'),run('ally.mhp'));
run('g.moveSpd=20;dealDamage(t,ally,100,{})');assert.equal(run('ally.hp'),run('ally.mhp-100'));
run('g.moveSpd=0;g.tkBlindUntil=G.time+3;dealDamage(t,ally,100,{})');assert.equal(run('ally.hp'),run('ally.mhp-200'));
run(`g.tkBlindUntil=0;G.map.walk[21*G.map.w+22]=0;dealDamage(t,ally,100,{});`);assert.equal(run('ally.hp'),run('ally.mhp-300'));
run(`G.map.walk.fill(1);killUnit(t,g,{noRise:true});dealDamage(t,ally,100,{});`);assert.equal(run('ally.hp'),run('ally.mhp-400'));
run(`resetTk();globalThis.g=tkSpawn('tkGoblin',600,600);globalThis.g2=tkSpawn('tkGoblin',620,600);`);assert.equal(run('tkAlly(g)'),null);
// Bubbles block outside fire; melee and enemies entering are not blocked, allies heal.
run(`resetTk();globalThis.v=tkSpawn('tkVandal',600,600);globalThis.t=enemy(800);power(v,'bubble',t);dealDamage(t,v,50,{restProjectile:true});`);assert.equal(run('v.hp'),run('v.mhp'));
run('dealDamage(t,v,30,{})');assert.equal(run('v.hp'),run('v.mhp-30'));run('t.x=620;dealDamage(t,v,20,{restProjectile:true});updateTaken(.1)');assert.equal(run('v.hp'),run('v.mhp-46'));
// Explosive Boomer/Torch/Projection loadouts damage neighbours, not just one body.
run(`resetTk();globalThis.a=tkSpawn('tkAcolyte',600,600);globalThis.t=enemy(760);globalThis.near=enemy(770,635);fireAttack(a,a.atkList.find(d=>d.tkSplash),{tgt:t});tickTk();`);assert.ok(run('t.hp<10000&&near.hp<10000'),'Boomer splash must deal live area damage');
// Shield absorbs rather than damaging HP, then regenerates after quiet time.
run(`resetTk();globalThis.c=tkSpawn('tkCaptain',600,600);globalThis.t=enemy();dealDamage(t,c,100,{});`);assert.equal(run('c.tkShield'),0);assert.equal(run('c.hp'),run('c.mhp-20'));run('G.time+=8;updateTaken(1)');assert.equal(run('c.tkShield'),12);
// Frontal shield and flanking must disagree before the first hit.
run(`resetTk();globalThis.ph=tkSpawn('tkPhalanx',600,600);ph.faceA=0;globalThis.t=enemy();dealDamage(t,ph,30,{restProjectile:true});`);assert.equal(run('ph.hp'),run('ph.mhp'));run('t.x=450;dealDamage(t,ph,30,{restProjectile:true})');assert.equal(run('ph.hp'),run('ph.mhp-30'));
// Ordinary bolts stop at a wall; Darkness penetrates it and blinds/deafens, not just flash.
run(`resetTk();globalThis.c=tkSpawn('tkCaptain',600,600);globalThis.t=enemy(800);G.map.walk[21*G.map.w+25]=0;power(c,'shot',t);tickTk();`);assert.equal(run('t.hp'),10000);
run('power(c,"dark",t);tickTk(45)');assert.ok(run('t.hp<10000&&t.tkBlindUntil>G.time&&t.tkDeafUntil>G.time'));assert.equal(run('unitHasHearing(t)'),false);assert.equal(run('canSee(t,c)'),false);assert.equal(run('canSee(null,c)'),false);
run('G.time+=4');assert.equal(run('unitHasHearing(t)'),true);
// Every-target Darkness penetration and bounded double-hit independent of frame rate.
run(`resetTk();globalThis.c=tkSpawn('tkCaptain',600,600);globalThis.t=enemy(760);globalThis.t2=enemy(820);power(c,'dark',t);tickTk();`);assert.ok(run('t.hp<10000&&t2.hp<10000'));assert.ok(run('t.hp>=10000-56&&t2.hp>=10000-56'));
// Howler leaves a Stasis field on impact AND on walls. Three stacks stop movement/attack.
run(`resetTk();globalThis.a=tkSpawn('tkAcolyte',600,600);globalThis.t=enemy();power(a,'howler',t);tickTk(45);`);assert.ok(run('G.taken.fields.some(f=>f.kind==="stasis")'));
run('tkFreeze(t);tkFreeze(t);tkFreeze(t);globalThis.x=t.x;tryMove(t,10,0)');assert.equal(run('t.x'),run('x'));assert.equal(run('canUse(t,t.atkList[0]||a.atkList[0],a)'),false);
run(`resetTk();globalThis.a=tkSpawn('tkAcolyte',600,600);globalThis.t=enemy(800);G.map.walk[21*G.map.w+25]=0;power(a,'howler',t);tickTk(45);`);assert.ok(run('G.taken.fields.some(f=>f.kind==="stasis")'));
// Reactive and death volleys, cloak/reveal, Solar damage field and real knockback.
run(`resetTk();globalThis.h=tkSpawn('tkHobgoblin',600,600);globalThis.t=enemy();dealDamage(t,h,10,{});`);assert.equal(run('G.taken.bolts.length'),3);run('killUnit(t,h,{noRise:true})');assert.equal(run('G.taken.bolts.length'),6);run('tickTk()');assert.ok(run('t.hp<10000'));
run(`resetTk();globalThis.m=tkSpawn('tkMinotaur',600,600);globalThis.t=enemy(800);t.faceA=Math.PI;`);assert.equal(run('canSee(t,m)'),false);run('dealDamage(t,m,35,{})');assert.equal(run('takenHidden(m)'),false);assert.equal(run('canSee(t,m)'),true);
run(`resetTk();globalThis.k=tkSpawn('tkKnight',600,600);globalThis.t=enemy(680);power(k,'flame',t);updateTaken(.1);`);assert.ok(run('t.hp<10000'));
run(`resetTk();globalThis.ph=tkSpawn('tkPhalanx',600,600);globalThis.t=enemy(700);power(ph,'shieldBlast',t);`);assert.ok(run('t.hp<10000&&Math.hypot(t.kvx,t.kvy)>0'));
// Axion is a shootable target, not an immortal ordinary projectile or victory survivor.
run(`resetTk();globalThis.c=tkSpawn('tkCenturion',600,600);globalThis.t=enemy(900);power(c,'axion',t);globalThis.orb=G.units.find(u=>u.key==='tkAxion');killUnit(t,c,{noRise:true});`);assert.equal(run('facPot("tk")'),0);assert.equal(run('facLiveCount("tk")'),0);run('killUnit(t,orb,{noRise:true})');assert.equal(run('orb.gone'),true);assert.ok(run('!G.corpses.some(c=>c.key==="tkAxion")'));assert.equal(run('t.hp'),10000,'destroying dart does not explode at full payload');
run(`resetTk();globalThis.c=tkSpawn('tkCenturion',600,600);globalThis.t=enemy(760);power(c,'axion',t);tickTk();`);assert.ok(run('t.hp<10000'));
// Dart follows a corner route; ordinary engine bullets can destroy it in flight.
run(`resetTk();globalThis.c=tkSpawn('tkCenturion',600,600);globalThis.t=enemy(820);for(let y=19;y<=22;y++)G.map.walk[y*G.map.w+25]=0;power(c,'axion',t);tickTk(300);`);assert.ok(run('t.hp<10000'),'dart must route around a wall');
run(`resetTk();globalThis.c=tkSpawn('tkCenturion',600,600);globalThis.t=enemy(820);power(c,'axion',t);globalThis.orb=G.units.find(u=>u.key==='tkAxion');orb.x=700;addProj('bullet',t.x,t.y,0,orb.x,orb.y,t.fac,t,30);for(let i=0;i<20;i++){G.time+=.01;Spatial.rebuild();updateProjs(.01);}`);assert.equal(run('orb.gone'),true,'ordinary bullets can shoot down Axion');
// Blink respects walls and shifts sideways for Thrall. No invented universal Taking.
run(`resetTk();globalThis.u=tkSpawn('tkThrall',600,600);globalThis.t=enemy();globalThis.oldY=u.y;power(u,'blink',t);`);assert.ok(run('Math.abs(u.y-oldY)>20'));
run(`globalThis.oldX=u.x;globalThis.oldY=u.y;G.map.walk.fill(0);G.map.walk[Math.floor(u.y/TILE)*G.map.w+Math.floor(u.x/TILE)]=1;power(u,'blink',t);`);assert.equal(run('u.x'),run('oldX'));assert.equal(run('u.y'),run('oldY'),'blink cannot jump across sealed walls');
run('startTransform(u,"joker");startTransform(u,"mzombie");');assert.notEqual(run('u.state'),'transform');assert.equal(run('u.key'),'tkThrall');
// AI invokes distinct abilities, not only basic shooting.
run(`for(const [key,p] of [['tkWizard','thralls'],['tkAcolyte','eye'],['tkVandal','bubble'],['tkCenturion','axion'],['tkCaptain','dark'],['tkKnight','flame'],['tkPhalanx','shieldBlast'],['tkPsion','split']]){resetTk();const u=tkSpawn(key,600,600),t=enemy(700);u.tgt=t;u.cds={};thinkTaken(u);if(u.atk?.def.tkPower!==p)throw Error('AI priority '+key+' got '+u.atk?.def.n);}`);
run(`FAC_SEL=new Set(['tk','T']);TK_INITIAL=1;startGame({size:'s'});`);assert.equal(run('countFac("tk")'),14);assert.equal(run('countKey("tkEye")'),0);assert.equal(run('countKey("tkShadowThrall")'),0);assert.equal(run('FAC_BY.tk.panel'),'panelTk');
run(`FAC_SEL=new Set(['T','X']);startGame({size:'s'});`);assert.equal(run('countFac("tk")'),0);assert.equal(run('G.taken.bolts.length'),0);assert.equal(run('G.taken.fields.length'),0);
console.log('Taken passed: 16 roles/13 base, all ranged loadouts, uncapped full-health split + newborn CD, summon/stationary eye, tether/LOS/motion/blindness/death, bubble/heal/inside fire, absorb/regen/front/flank shields, wall/double Darkness/real sensory expiry, Stasis terrain/freeze, retaliation/death volley, cloak, Solar field, knockback, shootable dart/impact/victory exclusion, sideways blink, infection immunity, AI priorities, selection/restart.');
