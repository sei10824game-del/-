/* OMORI crossover: realtime ranges/timers are adaptations, not canon stats. */
const OM_ROSTER=[];
const OM_FACTIONS=[['om','OMORI（夢世界）','💡','#c4b1f1'],['su','サニー（現実世界）','🎻','#e5c28c']];
function omDef(n,action,dmg=0,cost=0,opt={}){return exAbility(n,'omori',dmg,opt.range||110,opt.cd||5,{omAction:action,omCost:cost,omSupport:!dmg&& !['sad','angry','happy','stare','tickle','observe','photograph','charm','smile','dazzle'].includes(action),anim:dmg?'slash':'palmWave',windup:.35,active:.15,rec:.3,...opt});}
const omBasic=(d=22,range=75)=>omDef('ATTACK','hit',d,0,{range,cd:.8});
const omGuard=()=>omDef('GUARD','guard',0,0,{cd:8});
const OM_SKILLS={
 omori:[omBasic(),omGuard(),omDef('SAD POEM','sad',0,5,{range:360}),omDef('STAB','stab',42,13),omDef('BREAD SLICE','bread',38,10),omDef('MOCK','mock',40,20),omDef('HACK AWAY','random3',24,30),omDef('OBSERVE','observe',0,0,{range:420}),omDef('LUCKY SLICE','lucky',35,15),omDef('TRICK','trick',40,20),omDef('PAINFUL TRUTH','truth',30,10),omDef('SHUN','shun',40,20),omDef('STARE','stare',0,45,{range:380}),omDef('EXPLOIT','exploit',44,30),omDef('FINAL STRIKE','final',60,50,{range:350,omArea:true,cd:9}),omDef('RED HANDS','red4',42,75,{range:440,cd:10}),omDef('VERTIGO','vertigo',65,45,{range:340,omArea:true}),omDef('CRIPPLE','cripple',70,45,{range:340,omArea:true}),omDef('SUFFOCATE','suffocate',80,45,{range:340,omArea:true})],
 aubrey:[omBasic(30),omGuard(),omDef('PEP TALK','happy',0,5,{range:350}),omDef('HEADBUTT','headbutt',48,5),omDef('COUNTER','counter',0,5),omDef('TWIRL','twirl',36,10),omDef('TEAM SPIRIT','teamSpirit',0,10),omDef('POWER HIT','power',42,20),omDef('MOOD WRECKER','mood',42,10),omDef('WIND-UP THROW','windup',40,20,{range:330,omArea:true}),omDef('MASH','mash',40,15),omDef('BEATDOWN','triple',28,30),omDef('LAST RESORT','last',1,50,{cd:20,cond:u=>u.hp<u.mhp*.3})],
 kel:[omBasic(20,330),omGuard(),omDef('ANNOY','angry',0,5,{range:350}),omDef('REBOUND','area',30,15,{range:360,omArea:true}),omDef("RUN N' GUN",'speed',40,15,{range:360}),omDef('CURVEBALL','curve',35,20,{range:360}),omDef('RICOCHET','triple',24,30,{range:360}),omDef('MEGAPHONE','megaphone',0,45),omDef("CAN'T CATCH ME",'evade',0,50),omDef('RALLY','rally',0,50),omDef('COMEBACK','comeback',0,25),omDef('TICKLE','tickle',0,55,{range:280}),omDef('FLEX','flex',0,10),omDef('JUICE ME','juiceMe',0,10),omDef('SNOWBALL','snow',38,20,{range:350})],
 hero:[omBasic(25),omGuard(),omDef('COOK','cook',0,10),omDef('MASSAGE','massage',0,5),omDef('CHARM','charm',0,10,{range:400}),omDef('SMILE','smile',0,25,{range:400}),omDef('FAST FOOD','fastFood',0,15,{windup:.1}),omDef('HOMEMADE JAM','revive',0,40,{cd:18}),omDef('CAPTIVATE','captivate',0,20),omDef('ENCHANT','enchant',0,15),omDef('SHARE FOOD','shareFood',0,15),omDef('MESMERIZE','mesmerize',0,30),omDef('DAZZLE','dazzle',0,35,{range:400}),omDef('SNACK TIME','snack',0,25),omDef('TEA TIME','tea',0,25),omDef('SPICY FOOD','spicy',30,15,{range:300}),omDef('REFRESH','refresh',0,40),omDef('TENDERIZE','power',60,30),omDef('GATOR AID','defendAll',0,15)],
 basil:[omBasic(18),omGuard(),omDef('CHEER','cheer',0,80),omDef('HERBAL REMEDY','herbal',0,35),omDef('PHOTOGRAPH','photograph',0,50,{range:360}),omDef('BODY SLAM','bodySlam',40,40),omDef('TULIP','tulip',50,40,{range:330,omArea:true}),omDef('GLADIOLUS','stab',65,40),omDef('CACTUS','cactus',50,40),omDef('ROSE','rose',0,50),omDef('FLOWER CROWN','flower4',40,75,{range:350})],
 boss:[omBasic(48),omDef('STAB','stab',60,0),omDef('HACK AWAY','triple',42,0),omDef('RED HANDS','red4',44,0,{range:420,omPhase:2}),omDef('RED HAND ATTACK','redHand',90,0,{range:420,omPhase:3}),omDef('HAIR ATTACK','hair',95,0,{range:420,omPhase:4}),omDef('MARI ATTACK','mari',100,0,{range:420,omPhase:5}),omDef('FINAL ATTACK','erase',120,0,{range:460,omPhase:6})],
 sunny:[omBasic(20),omGuard(),omDef('CALM DOWN','calm',0,0),omDef('FOCUS','flex',0,0),omDef('PERSIST','persist',0,0,{cd:16}),omDef('OVERCOME','overcome',0,0),omDef('ALLEGRO','allegro',28,19,{range:230}),omDef('ENCORE','encore',0,0,{cd:14}),omDef('CHERISH','cherish',0,0,{cd:35,cond:u=>u.hp<u.mhp*.35})],
 realAubrey:[omBasic(32),omGuard(),omDef('HOMERUN','homerun',70,25)],
 realKel:[omBasic(22,280),omGuard(),omDef('ENCOURAGE','encourage',0,0)],
 realHero:[omBasic(22),omGuard(),omDef('FIRST AID','firstAid',0,10)]
};
function omRegister(key,name,fac,hp,role,skills,extra={}){OM_ROSTER.push(key);exFighter(key,name,fac,hp,skills,{omori:true,omRole:role,omDream:fac==='om',ai:'omori',unique:0,exUnique:0,walk:65,run:120,scale:1.12,r:10,hair:'#24212b',omJuice:150,pal:{...EX_PAL,cloth:fac==='om'?'#a992cf':'#faf0d9'},desc:name+'。原作の技をリアルタイム戦闘へ翻案。JUICE・感情・エネルギーを使用。',...extra});}
omRegister('omOmori','オモリ（主人公）','om',330,'omori',OM_SKILLS.omori,{hair:'#14141a',omJuice:250});
omRegister('omBoss','オモリ（ボス）','om',510,'boss',OM_SKILLS.boss,{omBoss:true,omJuice:0,scale:1.3});
omRegister('omAubrey','オーブリー（夢世界）','om',420,'aubrey',OM_SKILLS.aubrey,{hair:'#a488c9'});
omRegister('omKel','ケル（夢世界）','om',360,'kel',OM_SKILLS.kel,{hair:'#8170b1',run:160});
omRegister('omHero','ヒロ（夢世界）','om',400,'hero',OM_SKILLS.hero,{hair:'#746092',omJuice:300});
omRegister('omBasil','バジル（夢世界）','om',310,'basil',OM_SKILLS.basil,{hair:'#b4d4ab',omJuice:280});
omRegister('omMari','マリ（夢世界）','om',380,'mari',[omDef('PICNIC（回復支援・翻案）','picnic',0,0,{cd:12})],{hair:'#51456e',omCivilian:true});
omRegister('suSunny','サニー','su',300,'sunny',OM_SKILLS.sunny,{omJuice:90});
omRegister('suAubrey','オーブリー（現実）','su',400,'aubrey',OM_SKILLS.realAubrey,{hair:'#edb5cc'});
omRegister('suKel','ケル（現実）','su',340,'kel',OM_SKILLS.realKel,{hair:'#76523b',run:150});
omRegister('suHero','ヒロ（現実）','su',360,'hero',OM_SKILLS.realHero,{hair:'#725441'});
omRegister('suBasil','バジル（現実）','su',220,'basil',[omBasic(23),omGuard()],{hair:'#dccb90',omJuice:0});
omRegister('suPolly','ポリー','su',160,'polly',[],{hair:'#805c43',ai:'prey',omCivilian:true,omJuice:0});
for(const [key,name,role,hair,hp]of [['Kim','キム','kim','#b95772',250],['Vance','ヴァンス','vance','#b88856',350],['Charlene','シャーリーン','charlene','#766446',340],['Angel','エンジェル','angel','#daaf60',210],['Maverick','ミカエル（THE MAVERICK）','maverick','#dfbd6d',240]])omRegister('su'+key,name,'su',hp,role,[omBasic(24),omGuard()],{hair,omJuice:0});
function omWorld(){return G.omori||(G.omori={events:[],effects:[],energy:{om:0,su:0}});}
function omInit(u){if(!u.sp.omori)return;u.omJuiceMax=u.sp.omJuice;u.omJuice=u.omJuiceMax;u.omEmotion='neutral';u.omEmotionTier=0;u.omPhase=1;}
function spawnOmori(){G.omori={events:[],effects:[],energy:{om:0,su:0}};for(const [fac]of OM_FACTIONS)if(facOn(fac)){const room=spawnRoom();for(const key of OM_ROSTER.filter(k=>SP[k].fac===fac)){const p=randWalkIn(room);spawnUnit(key,p.x,p.y,{force:true});}}}
function omAllies(u){return G.units.filter(t=>exAlive(t)&&t.fac===u.fac&&dist(u.x,u.y,t.x,t.y)<450&&losWalk(u.x,u.y,t.x,t.y,1));}
function omEnemies(u,r=400){return G.units.filter(t=>exAlive(t)&&hostileTo(u,t)&&Math.abs((t.z||0)-(u.z||0))<35&&dist(u.x,u.y,t.x,t.y)<r+t.r&&losWalk(u.x,u.y,t.x,t.y,1));}
function omHeal(t,p){if(exAlive(t))t.hp=Math.min(t.mhp,t.hp+t.mhp*p);}
function omJuice(t,p){if(exAlive(t)&&t.sp.omori)t.omJuice=Math.min(t.omJuiceMax,t.omJuice+t.omJuiceMax*p);}
function omEmotion(t,emotion){if(!exAlive(t)||t.sp.statusImmune)return;const max=t.sp.omRole==='omori'?3:2;t.omEmotionTier=emotion===t.omEmotion?Math.min(max,(t.omEmotionTier||0)+1):emotion==='neutral'?0:1;t.omEmotion=emotion;t.omEmotionUntil=G.time+18;}
function omDebuff(t,key){if(!t.sp.statusImmune)t[key]=G.time+8;}
function omSupportTarget(u){return omAllies(u).sort((a,b)=>a.hp/a.mhp-b.hp/b.mhp)[0]||u;}
function omCanUse(u,d,t){if(!d.omAction)return true;if((u.omJuice||0)<d.omCost&&!(u.omEncoreUntil>G.time))return false;if((u.omPhase||1)<(d.omPhase||1))return false;
 if(d.omAction==='revive')return !!omCorpse(u);
 if(['cook','firstAid','fastFood','herbal','snack','shareFood','tea','picnic','calm'].includes(d.omAction)&&!omAllies(u).some(t=>t.hp<t.mhp*.8))return false;
 if(d.omAction==='persist'&&u.hp>u.mhp*.5)return false;
 if(d.omAction==='guard'&&u.omGuardUntil>G.time)return false;
 if(d.omAction==='flex'&&u.omFlex)return false;
 return true;}
function omCorpse(u){return G.corpses.find(c=>!c.omRevived&&!c.hauled&&!c.canonConsumed&&c.omOriginFac===u.fac&&SP[c.key]?.omori&&!SP[c.key].omBoss&&dist(u.x,u.y,c.x,c.y)<400&&losWalk(u.x,u.y,c.x,c.y,1));}
function thinkOmori(u){
 if(!exCanAct(u))return;
 const support=u.atkList.filter(d=>d.omSupport&&canUse(u,d,u));
 const heal=support.find(d=>['cook','firstAid','herbal','snack','picnic','revive','calm','cherish'].includes(d.omAction));
 if(heal){startAttack(u,heal,u);return;}
 if(u.sp.omCivilian){thinkPrey(u);return;}
 if(!exAlive(u.tgt)||!hostileTo(u,u.tgt))u.tgt=acquireTarget(u,650);
 if(u.tgt){const d=chooseAttack(u,u.tgt);if(d){startAttack(u,d,u.tgt);return;}setDest(u,u.tgt.x,u.tgt.y,losWalk(u.x,u.y,u.tgt.x,u.tgt.y,navigationRadius(u)));return;}
 if(!u.dest||u.destT>12){const h=endgameHunt(u),p=h||randWalkIn(rpick(G.map.rooms));setDest(u,p.x,p.y);}
}
function omEffect(u,t,d){const w=omWorld();w.effects.push({x:t.x,y:t.y,fromX:u.x,fromY:u.y,kind:d.omAction,n:d.n,start:G.time,until:G.time+.75,red:['red4','redHand','erase','hair','mari'].includes(d.omAction)});}
function omFire(u,d,a){
 if(!exAlive(u)||!omCanUse(u,d,a.tgt))return;
 const action=d.omAction,w=omWorld();if(!(u.omEncoreUntil>G.time))u.omJuice=Math.max(0,(u.omJuice||0)-d.omCost);
 const t=a.tgt,allies=omAllies(u),ally=omSupportTarget(u),enemies=omEnemies(u,d.maxR+u.r);
 if(d.omSupport){omEffect(u,ally,d);
 switch(action){
 case 'guard':u.omGuardUntil=G.time+2;break;
 case 'counter':u.omCounterUntil=G.time+3;omTaunt(u,enemies);break;
 case 'cook':case 'herbal':omHeal(ally,.75);if(action==='herbal')w.energy[u.fac]=Math.min(10,(w.energy[u.fac]||0)+1);break;
 case 'firstAid':omHeal(ally,.25);break;
 case 'fastFood':omHeal(ally,.4);break;
 case 'shareFood':omHeal(ally,.5);if(ally!==u)omHeal(u,.5);break;
 case 'snack':case 'picnic':for(const v of allies){omHeal(v,action==='picnic'?1:.4);if(action==='picnic')omJuice(v,1);}break;
 case 'tea':omHeal(ally,.3);omJuice(ally,.2);break;
 case 'refresh':omJuice(allies.filter(v=>v.sp.omori).sort((a,b)=>a.omJuice/a.omJuiceMax-b.omJuice/b.omJuiceMax)[0]||u,.5);break;
 case 'massage':omEmotion(ally,'neutral');break;
 case 'flex':u.omFlex=true;break;
 case 'teamSpirit':omEmotion(u,'happy');omEmotion(ally,'happy');break;
 case 'megaphone':for(const v of allies)omEmotion(v,'angry');break;
 case 'comeback':{const sad=u.omEmotion==='sad';omEmotion(u,'happy');if(sad)u.omFlex=true;break;}
 case 'rally':omEmotion(u,'happy');for(const v of allies)if(v!==u)omJuice(v,.3);w.energy[u.fac]=Math.min(10,(w.energy[u.fac]||0)+4);break;
 case 'juiceMe':ally.hp=Math.max(1,ally.hp*.75);omJuice(ally,.4);break;
 case 'defendAll':for(const v of allies)v.omDefenseUp=G.time+8;break;
 case 'cheer':for(const v of allies){omJuice(v,.2);if(v.omEmotion==='angry')v.omAttackUp=G.time+8;else if(v.omEmotion==='sad')v.omDefenseUp=G.time+8;else if(v.omEmotion==='happy')v.omSpeedUp=G.time+8;}break;
 case 'rose':for(const v of allies)omHeal(v,.4);for(const v of enemies)omDebuff(v,'omAttackDown');break;
 case 'evade':omTaunt(u,enemies);for(const v of enemies)omDebuff(v,'omAccuracyDown');break;
 case 'captivate':case 'mesmerize':omTaunt(u,enemies);if(action==='mesmerize')u.omGuardUntil=G.time+3;break;
 case 'enchant':if(exAlive(t)&&hostileTo(u,t)){omTaunt(u,[t]);omEmotion(t,'happy');}break;
 case 'calm':omEmotion(u,'neutral');omHeal(u,.5);break;
 case 'persist':u.omPersistUntil=G.time+2;u.hp=Math.min(u.mhp,u.hp+20);break;
 case 'overcome':u.omEmotion='neutral';u.omEmotionTier=0;u.panicT=0;u.omAttackDown=u.omDefenseDown=u.omSpeedDown=0;break;
 case 'encore':u.omEncoreUntil=G.time+6;break;
 case 'cherish':u.hp=u.mhp;u.omJuice=u.omJuiceMax;for(const k of ['omAttackDown','omDefenseDown','omSpeedDown','omAccuracyDown','panicT','slowT','stunT','burnT','atkSlow'])u[k]=0;omEmotion(u,'neutral');u.omAttackUp=u.omDefenseUp=u.omSpeedUp=G.time+8;break;
 case 'encourage':{const sunny=allies.find(v=>v.key==='suSunny');if(sunny)sunny.omAttackUp=G.time+8;break;}
 case 'revive':{const c=omCorpse(u);if(c){const v=spawnUnit(c.key,c.x,c.y,{force:true});if(v){v.fac=v.team=u.fac;v.hp=v.mhp*.7;c.omRevived=true;G.corpses.splice(G.corpses.indexOf(c),1);}}break;}
 }return;}
 if(!exAlive(t)||!hostileTo(u,t)||!enemies.includes(t))return;
 omEffect(u,t,d);
 if(['sad','angry','happy'].includes(action)){omEmotion(t,action);return;}
 if(action==='stare'){for(const k of ['omAttackDown','omDefenseDown','omSpeedDown'])omDebuff(t,k);return;}
 if(action==='observe'){u.omObserved={id:t.id,target:t.tgt?.id,until:G.time+5};return;}
 if(action==='tickle'){if(!t.sp.statusImmune)t.omCriticalUntil=G.time+3;return;}
 if(action==='smile'){omDebuff(t,'omAttackDown');return;}
 if(action==='charm'){omTaunt(u,[t]);return;}
 if(action==='photograph'||action==='dazzle'){for(const v of enemies){omDebuff(v,action==='photograph'?'omAccuracyDown':'omAttackDown');if(action==='dazzle')omEmotion(v,'happy');}if(action==='photograph')omTaunt(u,enemies);return;}
 const targets=d.omArea?enemies:[t],count=['random3','triple','allegro'].includes(action)?3:['red4','flower4'].includes(action)?4:1;
 let bonus=u.omFlex?2.5:1;u.omFlex=false;
 for(let i=0;i<count;i++)for(const v of (action==='random3'?[rpick(enemies)]:targets))w.events.push({src:u,target:v,d,bonus,at:G.time+i*.2,energy:w.energy[u.fac]||0});
}
function omTaunt(u,enemies){for(const t of enemies)if(!t.sp.statusImmune){t.tgt=t.aggro=u;t.aggroUntil=G.time+3;}}
function omResolve(e){const {src:u,target:t,d}=e,a=d.omAction;if(!exAlive(u)||!exAlive(t)||!hostileTo(u,t)||dist(u.x,u.y,t.x,t.y)>d.maxR+u.r+t.r||Math.abs((t.z||0)-(u.z||0))>35||!losWalk(u.x,u.y,t.x,t.y,1))return;
 let dmg=d.dmg*e.bonus,ignoreArmor=['power','stab'].includes(a);
 if(a==='stab'&&u.omEmotion!=='sad'&&u.sp.omRole!=='basil')ignoreArmor=false;
 if((a==='exploit'&&t.omEmotion&&t.omEmotion!=='neutral')||(a==='lucky'&&u.omEmotion==='happy')||(a==='mood'&&t.omEmotion==='happy')||(a==='snow'&&t.omEmotion==='sad')||(a==='headbutt'&&u.omEmotion==='angry'))dmg*=1.4;
 if(a==='speed'||a==='vertigo')dmg*=Math.min(2,effSpeed(u)/100);
 if(a==='final')dmg*=1+(u.omEmotionTier||0)/3;
 if(a==='windup')dmg*=Math.max(1,1.6-omEnemies(u,d.maxR).length*.1);
 if(a==='allegro')dmg+=t.mhp*.15;
 if(a==='bodySlam')dmg+=e.energy*5;
 if(a==='cactus')dmg+=u.hp*.1;
 if(a==='tulip'){const o=omAllies(u).find(v=>v.sp.omRole==='omori');if(o)dmg+=o.runSpd*.15;}
 if(a==='last')dmg=u.hp*4;
 if(a==='homerun'&&rchance(.15)&&t.sp.mass<4&&!t.sp.conversionImmune)dmg=Math.max(dmg,t.hp*1.2);
 const before=t.hp;dealDamage(u,t,dmg,{ignoreArmor,omSkill:true});if(!(t.hp<before||t.dead))return;
 omEffect(u,t,d);
 if(a==='truth'){omEmotion(u,'sad');omEmotion(t,'sad');}
 if(a==='twirl')omEmotion(u,'happy');
 if(a==='spicy')omEmotion(t,'angry');
 if(a==='curve')omEmotion(t,rpick(['happy','sad','angry']));
 if(a==='snow')omEmotion(t,'sad');
 if(a==='mock'&&t.omEmotion==='angry'||a==='vertigo')omDebuff(t,'omAttackDown');
 if(a==='trick'&&t.omEmotion==='happy'||a==='cripple')omDebuff(t,'omSpeedDown');
 if(a==='shun'&&t.omEmotion==='sad'||['power','suffocate','redHand','erase'].includes(a))omDebuff(t,'omDefenseDown');
 if(a==='hair')for(const k of ['omAttackDown','omDefenseDown','omSpeedDown'])omDebuff(t,k);
 if(['mari','erase'].includes(a))omEmotion(t,'afraid');
 if(a==='headbutt'||a==='homerun'){u.hp=Math.max(1,u.hp-u.mhp*.2);}
 if(t.dead&&a==='bread')omHeal(u,.2);
 if(t.dead&&a==='mash')u.omJuice=u.omJuiceMax;
 if(a==='last')dealDamage(null,u,u.hp+u.mhp,{omSkill:true});
}
function omDamage(att,t,dmg,o){
 if(att?.omAttackDown>G.time)dmg*=.65;if(att?.omAttackUp>G.time)dmg*=1.5;
 if(t.omDefenseDown>G.time)dmg*=1.4;if(t.omDefenseUp>G.time)dmg*=.65;if(t.omGuardUntil>G.time)dmg*=.5;
 const ae=att?.omEmotion,te=t.omEmotion;
 if(ae==='afraid')dmg*=.7;if(ae==='angry')dmg*=1.2;if(te==='angry')dmg*=1.2;if(te==='sad')dmg*=.8;
 if(ae==='happy'&&te==='angry'||ae==='angry'&&te==='sad'||ae==='sad'&&te==='happy')dmg*=1.5;
 if(ae==='angry'&&te==='happy'||ae==='sad'&&te==='angry'||ae==='happy'&&te==='sad')dmg*=.8;
 if(t.omCriticalUntil>G.time)dmg*=1.5;
 if(att?.omAccuracyDown>G.time&&rchance(.4))return 0;
 return dmg;
}
function omAfterDamage(att,t,dmg,o){
 const w=omWorld();if(t.sp.omori&&dmg>0)w.energy[t.fac]=Math.min(10,(w.energy[t.fac]||0)+1);
 if(t.omCounterUntil>G.time&&exAlive(att)&&hostileTo(t,att)&&!o.omCounter&&dist(t.x,t.y,att.x,att.y)<130)dealDamage(t,att,28,{omCounter:true});
 if(t.hp<=0&&t.omPersistUntil>G.time)t.hp=1;
 if(t.hp<=0&&t.sp.omBoss&&(t.omPhase||1)<6){t.omPhase++;t.hp=t.mhp;interrupt(t);t.state='idle';t.dest=null;addLog('💡 オモリ（ボス） PHASE '+t.omPhase+' — OMORI did not succumb.',t.fac,true);}
 else if(t.hp<=0&&t.key==='omOmori'&&!t.omNotSuccumb){t.omNotSuccumb=true;t.hp=1;addLog('💡 OMORI did not succumb.',t.fac);}
}
function omTick(dt){const w=omWorld();const due=w.events.filter(e=>e.at<=G.time);w.events=w.events.filter(e=>e.at>G.time);for(const e of due)omResolve(e);w.effects=w.effects.filter(e=>e.until>G.time);
 for(const u of G.units)if(exAlive(u)){if(u.sp.omori)u.omJuice=Math.min(u.omJuiceMax,(u.omJuice||0)+dt*2);if(u.omEmotionUntil&&u.omEmotionUntil<=G.time){u.omEmotion='neutral';u.omEmotionTier=0;u.omEmotionUntil=0;}}
}
function omSpeed(u){return (u.omSpeedDown>G.time?.65:1)*(u.omSpeedUp>G.time?1.5:1)*(u.omEmotion==='happy'?1.2:u.omEmotion==='sad'?.8:u.omEmotion==='afraid'?.75:1);}
function omInspector(el,u){let box=document.getElementById('omoriStatus');box?.remove?.();if(!u.sp.omori)return;box=document.createElement('div');box.id='omoriStatus';box.textContent='JUICE '+Math.round(u.omJuice||0)+' / '+u.omJuiceMax+' | '+(u.omEmotion||'neutral')+' '+(u.omEmotionTier||0)+' | ENERGY '+(omWorld().energy[u.fac]||0)+(u.sp.omBoss?' | PHASE '+u.omPhase+'/6':'');el.appendChild(box);}
