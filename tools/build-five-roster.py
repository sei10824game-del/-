"""Maintain the researched type/form roster. Embedding is done separately."""
import json,re
from pathlib import Path
rows=[]
S={'pr':'https://www.avpcentral.com/predators-from-the-movies','cv':'https://www.halopedia.org/Covenant_military','th':'https://thething.fandom.com/wiki/The_Thing_(Organism)','dr':'https://doorsgame.wiki/wiki/Entities','dm':'https://doomwiki.org/wiki/Monster'}
def add(f,work,lines,source=None):
 for line in lines.strip().splitlines():
  parts=line.split('|');name,shape,moves=parts[:3];flags=parts[3].split(',') if len(parts)>3 and parts[3] else []
  key=f+'_'+re.sub('[^a-z0-9]+','_',name.lower()).strip('_')
  assert not any(r['key']==key for r in rows),key
  rows.append(dict(key=key,name=name,faction=f,work=work,shape=shape,moves=moves.split(',') if moves else [],flags=flags,source=source or S[f],status='implemented-partial-canon-review',evidence='source-listed roster; source-specific rules tracked in five-fidelity-audit.json; full original attack inventory unverified'))
add('pr','Predator films 1987–2025 (including AvP)', '''
Jungle Hunter|yautja|wrist,plasma,cloak,selfdestruct
City Hunter|yautja|wrist,spear,disc,net,plasma,cloak,selfdestruct
Young Blood / Celtic|yautja|wrist,net,charge,cloak
Young Blood / Chopper|yautja|wrist,spear,cloak
Blooded / Scar|yautja|wrist,spear,shuriken,plasma,cloak
Elder / Greyback|yautja|wrist,spear,plasma,cloak|elder
Cleaner / Wolf|yautja|wrist,dualplasma,whip,shuriken,mine,punch,cloak|elite
Super Predator / Berserker|yautja|wrist,plasma,charge,cloak|heavy
Super Predator / Falconer|yautja|wrist,falcon,cloak
Super Predator / Tracker|yautja|wrist,plasma,hounds,cloak
Fugitive Predator|yautja|wrist,plasma,shuriken,cloak
Upgrade / Assassin Predator|yautja|claw,punch,wristrocket|boss,armor
Feral Predator|yautja|wrist,bolt,shieldbash,spear,net,mine,cloak|shield
Viking / Grendel|yautja|punch,sonic,cloak|heavy
Oni Predator|yautja|wrist,spear,chain,mine,cloak
Pilot / Cyborg Predator|yautja|wrist,laser,cloak|armor
Warlord / Grendel King|yautja|axe,spear,punch|boss,armor
Badlands / Dek|yautja|blade,shuriken,shieldbash,plant|shield
Badlands Clan Leader / Njohrr|yautja|blade,wrist,spear|elder
Yautja Hunting Hound|hound|bite,charge|supportCreature
Upgraded Predator Hound|hound|bite,charge|heavy,supportCreature
Falcon Recon Drone|drone|scan|supportCreature,machine
''')
# Rank/armor/weapon forms appearing in the FPS campaigns. Political-only ranks and Banished excluded.
add('cv','Halo CE / 2 / 3 / ODST / Reach / 4 / 5 campaigns', '''
Grunt Minor|grunt|plasma,grenade
Grunt Major|grunt|needler,grenade
Grunt Ultra|grunt|plasma,grenade|elite
Grunt Heavy|grunt|fuelrod,punch
Grunt Special Operations|grunt|needler,grenade
Grunt Suicide|grunt|suicide
Grunt Storm|grunt|plasma,grenade
Grunt Ranger|grunt|plasma,grenade|fly
Grunt Imperial|grunt|needler,grenade|elite
Elite Minor|elite|plasma,punch,grenade|shield
Elite Major|elite|plasma,blade,grenade|shield
Elite Ultra|elite|blade,plasma,grenade|shield,elite
Elite Zealot|elite|blade,charge,grenade|shield,elite
Elite General|elite|fuelrod,blade,grenade|shield,heavy
Elite Field Marshal|elite|fuelrod,blade,grenade|shield,elder
Elite Ranger|elite|dualplasma,grenade|shield,fly
Elite Special Operations|elite|blade,plasma,cloak|shield
Elite Stealth|elite|blade,plasma,cloak|shield
Elite Honor Guard|elite|blade,plasma|shield,elite
Elite Honor Guard Ultra|elite|blade,plasma|shield,elder
Elite High Councilor|elite|blade,plasma|shield,elder
Elite Arbiter Harness|elite|blade,plasma,cloak|shield,elder
Elite Storm|elite|plasma,punch,grenade|shield
Elite Warrior|elite|fuelrod,blade,grenade|shield,heavy
Elite Commander|elite|concussion,carbine,blade|shield,elite
Jackal Minor|jackal|plasma,shieldbash|shield
Jackal Major|jackal|needler,shieldbash|shield,elite
Jackal Sniper / Beam Rifle|jackal|sniper,punch
Jackal Marksman / Carbine|jackal|carbine,punch
Jackal Ranger|jackal|sniper,punch|fly
Jackal Storm|jackal|needler,shieldbash|shield
Jackal Heavy|jackal|carbine,shieldbash|shield,heavy
Skirmisher Minor|jackal|needler,leap
Skirmisher Major|jackal|carbine,leap
Skirmisher Murmillo|jackal|needler,shieldbash,leap|shield
Skirmisher Commando|jackal|sniper,leap
Skirmisher Champion|jackal|carbine,shieldbash,leap|shield,elite
Brute Minor|brute|spiker,punch,grenade
Brute Major|brute|spiker,punch,grenade|elite
Brute Ultra|brute|bruteshot,punch,grenade|heavy
Brute Captain|brute|bruteshot,punch|shield
Brute Captain Major|brute|carbine,punch,grenade|shield,elite
Brute Captain Ultra|brute|fuelrod,punch|shield,heavy
Brute Bodyguard|brute|spiker,punch|shield,elite
Brute Honor Guard|brute|bruteshot,punch|heavy
Brute Stalker|brute|spiker,mine,cloak
Brute Jumper|brute|spiker,leap|fly
Brute Jumper Major|brute|bruteshot,leap|fly,elite
Brute Jumper Captain|brute|bruteshot,leap|fly,shield
Brute Chieftain / Gravity Hammer|brute|hammer,charge|shield,heavy
Brute War Chieftain / Plasma Cannon|brute|fuelrod,hammer|shield,heavy
Drone Minor|bug|plasma,claw|fly
Drone Major|bug|needler,claw|fly,elite
Drone Ultra|bug|plasma,claw|fly,shield
Drone Leader|bug|plasma,claw|fly,shield,elite
Hunter / Fuel Rod|hunter|fuelrod,shieldbash,charge|heavy,armor
Hunter / Assault Beam|hunter|beam,shieldbash,charge|heavy,armor
Engineer / Huragok|engineer|repair,shieldpulse|fly,support
San Shyuum / Gravity Throne|prophet|beam,blink|boss,shield
Ghost|vehicle|dualplasma,charge|machine
Wraith / Plasma Mortar|tank|mortar,plasma|machine,heavy
Anti-Air Wraith|tank|fuelrod,plasma|machine,heavy
Banshee|aircraft|dualplasma,fuelrod|fly,machine
Space Banshee|aircraft|dualplasma,rocket|fly,machine
Seraph|aircraft|plasma,rocket|fly,machine,shield
Spirit Dropship|aircraft|plasma,deploy|fly,machine,heavy
Phantom Dropship|aircraft|plasma,deploy|fly,machine,heavy
Lich|aircraft|beam,deploy|fly,machine,boss
Scarab / Protos|walker|beam,stomp,plasma|machine,boss
Scarab / Deutoros|walker|beam,stomp,plasma|machine,boss
Spectre Transport|vehicle|plasma,charge|machine
Brute Prowler|vehicle|plasma,charge|machine
Brute Chopper|vehicle|spiker,charge|machine
Shade / Plasma Turret|turret|plasma|machine,static
Shade / Fuel Rod Turret|turret|fuelrod|machine,static
Shade / Anti-Air Turret|turret|dualplasma|machine,static
Harvester|walker|beam,deploy|machine,boss,static
''')
add('th','The Thing (1982) / The Thing (2011)', '''
Dog Imitation|hound|bite,assimilate|disguise
Kennel Thing / Split Dog|thing|tentacle,acid,assimilate
Kennel Thing / Escape Organism|thing|tentacle,leap,assimilate
Bennings / Incomplete Imitation|thing|claw,assimilate
Norris / Chest Maw|thing|maw,tentacle,assimilate
Norris / Head Spider|spider|bite,assimilate|fragment
Palmer / Vertical Maw|thing|maw,tentacle,assimilate
Blood Test Fragment|slime|leap,assimilate|fragment
Windows / Assimilating Body|thing|tentacle,assimilate
Blair / Human Imitation|thing|claw,assimilate|disguise
Blair / Giant Composite|thing|maw,tentacle,stomp,assimilate|boss
Original Thing / Ice Escape|thing|harpoon,maw,assimilate|heavy
Griggs / Split Face and Chest|thing|maw,tentacle,assimilate
Juliette / Abdominal Maw|thing|maw,claw,tentacle,assimilate
Karl / Partial Assimilation|thing|tentacle,assimilate
Edvard / Insectoid Body|spider|claw,harpoon,assimilate|heavy
Edvard / Centipede Hand|spider|bite,assimilate|fragment
Edvard / Detached Arm|spider|claw,assimilate|fragment
Jonas / Face Attachment|thing|tentacle,assimilate
Split Face / Edvard Adam|thing|claw,maw,assimilate|heavy
Sander / Final Composite|thing|claw,maw,tentacle,assimilate|boss
Carter / Human Imitation|thing|claw,assimilate|disguise
''')
add('dr','DOORS permanent Hotel / Mines / Backdoor / Archives / Outdoors / Stairwell / Rooms', '''
Figure|figure|grab|hearing
Seek / Humanoid|seek|charge,tentacle
Seek / Dam|slime|seekspawn|boss,static
Seek Hand|tentacle|grab|static
Seek Sludge|slime|leap,acid
Seek Worm|worm|maw,tentacle
Rush|face|rush
Ambush|face|rebound
Eyes|eyes|gaze
Screech|face|ambushbite
Dupe / Hotel|door|doortrap|static
Dupe / Mines|door|doortrap|static
Halt|ghost|halt
Sally|ghost|charge,punch
Hide|shade|eject|static
Jack|face|scare
Timothy|spider|bite
Dread|face|dread
Snare|plant|snare|static
Void|void|pull,blink
El Goblino|goblin||passive
Jeff|tentacle||passive
Bob|skeleton||passive,static
Weirdo|shade|scare|passive
Portrait|portrait||passive,static
Charles|goblin||passive
World Lotus|plant|revive|passive,static
Moonlight / Guiding Light|light||passive,static
Starlight / Curious Light|light||passive,static
Red Light / Modifying Light|light||passive,static
Giggle|spider|facehug
Grumble|grumble|bite,charge
Queen Grumble|grumble|bite,charge|boss
Gloombat|bat|bite,swarm|fly
Louie|rat||passive
Haste|face|haste
Blitz|face|rebound
Lookman|eyes|gaze
Honcho|shade|charge,grab
Drone / Archives|drone|scan,rush
Forget-Me-Not|eyes|gaze,ambushbite
Teller|shade|scare|passive
Bash|face|rush
Scribbles|face|rebound
Ransom|face|movementcurse
Alma|ghost|gaze,leap,drain
Fih|fish||passive
Groundskeeper|figure|blade,charge
Eyestalk|plant|gaze|static
Bramble|plant|tentacle,snare
Surge|face|rush
Mandrake|plant|sonic,snare
Monument|statue|observed,grab
Caw|bird|scare|fly,passive
Grampy|shade||passive
Creak|shade|stalk,grab
Meld|slime|slow|static
Cobbler|shade||passive
Noise|ghost|motionhunt
Stem|orb|bite,charge
Hijack|ghost|erratic,grab
A-60|face|rush
A-90|face|movementcurse
A-120|face|rebound
Glitch|face|blink,pull
Glitched Rush / RNIUSHCg|face|rush,blink
Glitched Ambush / AR0xMBUSH|face|rebound,blink
Glitched Screech / SCJVEREECH|face|ambushbite,blink
''')
# Mechanically distinct campaign configurations, not all named individuals.
add('cv','Halo 2 / Halo 3 ODST campaign configurations', '''
Gravity Shield Chieftain / Tartarus|brute|hammer,shieldpulse,shockwave|boss,shield,armor
Huragok / Explosive Harness|engineer|repair,shieldpulse,selfdestruct|fly,support,shield
''',source='https://www.halopedia.org/Covenant_military')
# Versions retained where silhouette or attack behaviour differs, not every texture reskin.
add('dm','Doom / Doom II / Final Doom / Doom 64 / official Legacy of Rust', '''
Zombieman|soldier|rifle,punch
Shotgun Guy|soldier|shotgun,punch
Chaingunner|soldier|chaingun,punch
Imp / Classic|imp|fireball,claw
Pinky / Classic|hound|bite,charge
Spectre / Classic|hound|bite,charge|invisible
Lost Soul / Classic|skull|charge|fly
Cacodemon / Classic|orb|fireball,bite|fly
Baron of Hell / Classic|horned|greenfire,claw|heavy
Cyberdemon / Classic|cyber|rocket,stomp|boss
Spider Mastermind / Classic|spider|chaingun,stomp|boss,machine
Hell Knight / Classic|horned|greenfire,claw
Revenant / Classic|skeleton|homing,punch
Mancubus / Classic|mancubus|spreadfire,punch|heavy
Arachnotron / Classic|spider|plasma,claw|machine
Pain Elemental / Classic|orb|lostsouls|fly
Arch-vile / Classic|imp|hellfire,resurrect|elite
Wolfenstein SS / Secret Map|soldier|rifle,punch
Commander Keen / Effigy|skeleton||passive,static
Icon of Sin / Wall|horned|demonspawn|boss,static
Nightmare Spectre / PSX|hound|bite,charge|invisible,heavy
Nightmare Imp / Doom 64|imp|fireball,claw|invisible
Mother Demon / Doom 64|horned|hellfire,homing|boss,fly
Resurrector / Lost Levels|horned|hellfire,homing|boss,fly
Banshee / Legacy of Rust|orb|suicide
Ghoul / Legacy of Rust|skull|plasma|fly
Mindweaver / Legacy of Rust|spider|chaingun|machine
Shocktrooper / Legacy of Rust|soldier|plasma,punch
Tyrant / Legacy of Rust|cyber|rocket,stomp|heavy
Vassago / Legacy of Rust|horned|hellfire,claw|heavy
''')
add('dm','Doom 3 / Resurrection of Evil / Lost Mission', '''
Arch-vile / Doom 3|imp|hellfire,demonspawn
Cacodemon / Doom 3|orb|fireball,bite|fly
Tentacle Commando|soldier|whip,punch
Chaingun Commando|soldier|chaingun,punch
Cyberdemon / Doom 3|cyber|rocket,stomp|boss
Pinky / Doom 3|hound|bite,charge|armor
Hell Knight / Doom 3|horned|greenfire,claw,bite|heavy
Imp / Doom 3|imp|fireball,claw,leap
Lost Soul / Doom 3|skull|charge|fly
Mancubus / Doom 3|mancubus|spreadfire,punch|heavy
Revenant / Doom 3|skeleton|homing,punch
Z-Sec Pistol Guard|soldier|pistol,punch
Z-Sec Shotgun Guard|soldier|shotgun,punch
Z-Sec Machine Gunner|soldier|rifle,punch
Z-Sec Riot Shield|soldier|pistol,shieldbash|shield
Zombie / Doom 3|zombie|claw
Chainsaw Zombie|zombie|chainsaw
Flaming Zombie|zombie|burntouch
Fat Zombie|zombie|punch|heavy
Cherub|bug|claw,leap|fly
Guardian of Hell|hound|stomp,fireball,seekers|boss
Seeker / Doom 3|orb|scan|fly,support
Maggot|imp|claw,leap
Tick|spider|bite,leap
Trite|spider|bite,leap
Vagary / Doom 3|spider|telekinesis,claw|boss
Sabaoth|tank|bfg,chaingun|boss,machine
Wraith / Doom 3|imp|blink,claw
Bio-suit Zombie|zombie|claw|armor
Bruiser|mancubus|spreadfire,punch|heavy,armor
Forgotten One|skull|charge|fly
Helltime Hunter|horned|timeslow,claw|boss
Berserk Hunter|horned|charge,punch|boss
Invulnerability Hunter|horned|shieldpulse,plasma,punch|boss
Maledict|dragon|meteors,fireball,bite|boss,fly
Vulgar|imp|acid,claw,leap
''')
add('dm','Doom (2016) campaign and playable demon types', '''
Baron of Hell / 2016|horned|greenfire,stomp,claw|heavy
Cacodemon / 2016|orb|acid,bite|fly
Cyberdemon / 2016|cyber|rocket,beam,shockwave,stomp|boss
Hell Knight / 2016|horned|punch,leap,stomp|heavy
Imp / 2016|imp|fireball,chargedfire,claw,leap
Lost Soul / 2016|skull|suicide|fly
Mancubus / 2016|mancubus|spreadfire,flame,punch|heavy
Pinky / 2016|hound|charge,bite|armor
Possessed / Scientist|zombie|claw
Possessed Engineer|zombie|suicide
Possessed Soldier|soldier|plasma,chargedplasma,punch
Possessed Security|soldier|shotgun,shieldbash|shield
Revenant / 2016|skeleton|rocket,homing,punch|fly
Spectre / 2016|hound|charge,bite|invisible
Spider Mastermind / 2016|spider|plasma,telekinesis,stomp|boss,machine
Cyber Mancubus / 2016|mancubus|acid,spreadfire,punch|heavy,armor
Harvester / 2016|imp|beam,drain
Hell Guard / Shield|horned|shieldbash,shockwave,fireball|boss,shield
Hell Guard / Twin|horned|punch,fireball|heavy
Hell Razer|soldier|laser,punch
Prowler / 2016|imp|leap,claw
Summoner / 2016|ghost|blink,demonspawn,hellfire
Unwilling|zombie|claw
''')
add('dm','Doom Eternal / The Ancient Gods Parts One and Two', '''
Arch-vile / Eternal|imp|hellfire,demonspawn,buff,blink|shield,elite
Arachnotron / Eternal|spider|plasma,grenade,claw|machine
Baron of Hell / Eternal|horned|blade,leap,stomp|heavy
Cacodemon / Eternal|orb|fireball,bite,leap|fly
Cyber Mancubus / Eternal|mancubus|acid,punch|heavy,armor
Dread Knight|horned|blade,shockwave,leap|heavy
Hell Knight / Eternal|horned|punch,leap,stomp|heavy
Imp / Eternal|imp|fireball,claw,leap
Mancubus / Eternal|mancubus|spreadfire,flame,punch|heavy
Lost Soul / Eternal|skull|suicide|fly
Pain Elemental / Eternal|orb|lostsouls,fireball|fly
Pinky / Eternal|hound|charge,bite|armor
Prowler / Eternal|imp|blink,claw
Revenant / Eternal|skeleton|homing,rocket,punch|fly
Soldier Blaster|soldier|plasma,punch
Soldier Shield|soldier|shotgun,shieldbash|shield
Spectre / Eternal|hound|charge,bite|invisible
Zombie / Eternal|zombie|claw
Mecha Zombie|zombie|plasma,flame
Buff Totem|totem|buff,demonspawn|static
Carcass|cyber|shieldwall,shockwave,punch
Doom Hunter / Sled|cyber|rocket,homing,chainsaw|shield,heavy
Doom Hunter / Detached|cyber|homing,chainsaw|heavy
Gargoyle|bug|acid,claw,leap|fly
Gladiator / Shield Phase|horned|flail,shieldbash|boss,shield
Gladiator / Twin Flails|horned|flail,shockwave|boss
Icon of Sin / Armored|horned|meteors,flame,punch,demonspawn|boss,armor
Icon of Sin / Exposed|horned|meteors,flame,punch,demonspawn|boss
Khan Maykr|angel|beam,fireball,hellfire|boss,fly,shield
Marauder|horned|axe,axewave,shotgun,wolf|elite,shield
Maykr Drone|angel|plasma|fly
Tentacle / Eternal|tentacle|tentacle|static
Giant Tentacle / Eternal|tentacle|tentacle,stomp|static,heavy
Tyrant / Eternal|cyber|rocket,beam,stomp|heavy
Whiplash|worm|whip,shockwave
Cueball|zombie|suicide
Kalibas|orb|fireball|boss,static
Blood Maykr|angel|beam,hellfire|fly,shield
Spirit|ghost|possess|fly,support
Turret / Ancient Gods|turret|plasma|static,machine
Whiplash Spectre|worm|whip,shockwave|invisible
Trial of Maligog|orb|fireball,slow|static
Samur Maykr / Seraphim|angel|beam,blink,demonspawn|boss,fly
Armored Baron|horned|flail,charge|armor,heavy
Cursed Prowler|imp|curse,blink,claw
Demonic Trooper|soldier|plasma
Riot Soldier|soldier|chaingun,shieldbash|shield
Screecher|zombie|deathbuff
Stone Imp / Eternal|imp|roll,claw|armor
Dark Lord / Davoth|cyber|blade,shieldbash,wolf,drain|boss,shield
Marauder Spirit Wolf|hound|bite,charge|supportCreature
''')
add('dm','Doom The Dark Ages base campaign', '''
Agaddon Hunter|horned|blade,shieldbash,charge|shield,heavy
Arachnotron / Dark Ages|spider|chaingun,sticky,claw|machine
Armored Arachnotron|spider|chaingun,sticky,claw|machine,armor
Ballistatron|spider|ballista,claw|machine,armor
Battle Knight|horned|axe,axethrow,stomp|armor,heavy
Cacodemon Hybrid|orb|field,fireball,bite|fly,shield
Chaingunner Soldier / Dark Ages|soldier|chaingun,shieldbash|shield
Cosmic Baron|horned|psychic,blade,charge|heavy
Cyberdemon / Dark Ages|cyber|rocket,beam,stomp,claw|boss
Hell Knight / Dark Ages|horned|punch,leap,stomp|heavy
Imp / Dark Ages|imp|fence,claw
Imp Stalker|imp|homingfire,claw
Lost Soul / Dark Ages|skull|charge|fly
Mancubus / Dark Ages|mancubus|spreadfire,acid,punch|heavy
Armored Mancubus|mancubus|fence,spreadfire,punch|heavy,armor
Mortar Mancubus|mancubus|acid,mortar|heavy
Maykr Drone / Dark Ages|angel|plasma|fly
Nightmare Imp Stalker|imp|homingfire,claw|invisible
Pinky Rider|hound|charge,arrow,bite
Armored Pinky Rider|hound|charge,arrow,bite|armor
Revenant / Dark Ages|skeleton|homingskull,sickle|fly
Soldier / Dark Ages|soldier|tetherfire,punch
Shield Soldier / Metal|soldier|tetherfire,shieldbash|shield
Shield Soldier / Plasma|soldier|plasma,shieldbash|shield
Stone Imp / Dark Ages|imp|roll,claw|armor
Tentacle / Dark Ages|tentacle|tentacle|static
Giant Tentacle / Dark Ages|tentacle|tentacle,stomp|static,heavy
Vagary / Dark Ages|spider|plasma,rocket,claw|armor,heavy
Whiplash / Dark Ages|worm|whip,crossfence
Zombie / Dark Ages|zombie|claw
Acolyte|ghost|blink,clone,psychic
Hell Cultist|imp|demonspawn|static
Hell Tank|tank|mortar,beam|machine,static,heavy
Komodo / Mechanical Fist|horned|firebarrage,punch|heavy
Komodo / Chainsaw Staff|horned|firebarrage,chainsaw|heavy
Cyclops Titan|cyber|laser,spear,stomp|boss
Giant Cacodemon|orb|blink,fireball,bite|boss,fly
Hell Carrier|aircraft|rocket,firebarrage|machine,boss,fly
Hell Ship|aircraft|plasma,rocket|machine,fly
Titan / Unarmored|horned|punch,stomp|boss
Titan / Armored|horned|punch,shieldbash,stomp|boss,armor
Titan / Spear|horned|spear,stomp|boss
Enhanced Ahzrak / Ground|horned|spear,shockwave|boss
Enhanced Ahzrak / Winged|dragon|spear,fireball,charge|boss,fly
Ahzrak / Final|horned|spear,charge,shockwave|boss
Witch|ghost|blink,shieldpulse,firebarrage|boss,fly,support
Kreed Maykr|angel|beam,fireball,shieldpulse|boss,fly
The Old One|dragon|tentacle,beam,firebarrage|boss
Champion / Empowerment|horned|punch,shockwave|heavy
Demonic Leader / Empowerment|horned|buff,fireball|heavy
Enforcer / Empowerment|horned|shieldpulse,fireball|heavy
''')
# Released July 7, 2026. Source gives the expansion-exclusive roster.
# Individual attacks are crossover adaptations, not a full original-moves audit.
add('dm','Doom: The Dark Ages | Revelations (2026)', '''
Buzzsaw / Revelations|cyber|spear,charge,shieldbash,plasma|heavy,shield,machine
Warlock / Revelations|imp|homingfire,hellfire,buff|heavy,support
Cosmic Elemental / Revelations|orb|seekers,fireball,bite|heavy,fly
Arch-vile / Revelations|imp|hellfire,demonspawn,shieldpulse|heavy
Armored Arch-vile / Revelations|imp|hellfire,demonspawn,shieldpulse|heavy,armor
Agaddon Brute / Revelations|horned|axe,charge,shockwave|heavy
Nightmare Revenant / Revelations|skeleton|homing,punch|invisible
Nightmare Whiplash / Revelations|worm|whip,shockwave|invisible
Blighted Hell Knight / Revelations|horned|punch,leap,curse|heavy
Blighted Zombie / Revelations|soldier|claw,curse
Insurgent / Revelations|soldier|rifle,blade
Vagary Leader / Revelations|spider|telekinesis,claw,demonspawn|heavy
Hallowed Zombie / Revelations|soldier|claw
Marok / Revelations|angel|beam,blade,firebarrage,shieldpulse|boss,fly
The Henchman / Revelations|horned|punch,stomp,charge,shockwave|boss
Xal Goroth the Imprisoned / Revelations|dragon|tentacle,beam,firebarrage,shockwave|boss
''',source='https://doom.fandom.com/wiki/Doom:_The_Dark_Ages:_Revelations')
Path('research/five-factions-roster.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print(len(rows),{f:sum(r['faction']==f for r in rows) for f in S})
