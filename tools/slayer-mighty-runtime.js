/* Mighty DOOM: four mutually exclusive loadout slots. Exact level/rarity and
 * per-monster ultimate-charge tables are not yet ported; see DOOM_SLAYER.md. */
const SL_MIGHTY_SLOTS={
 primary:['heavy','combat','plasma','chaingun','burst'],
 secondary:['rocket','ballista','ssg','gauss','hammer'],
 ultimate:['saw','crucible','etBfg','unmaykr'],
 equipment:['grenade','flame','ice','arc','acid']
};
const SL_MIGHTY_LABELS={primary:'主武器（自動）',secondary:'副武器（J・10秒待ち）',ultimate:'必殺武器（K・撃破で充填）',equipment:'装備ランチャー（自動）'};
const SL_MIGHTY_DEFAULT={primary:'heavy',secondary:'rocket',ultimate:'etBfg',equipment:'grenade'};
function slMightyValidate(value){const result={};for(const [slot,ids] of Object.entries(SL_MIGHTY_SLOTS))result[slot]=ids.includes(value?.[slot])?value[slot]:SL_MIGHTY_DEFAULT[slot];return result;}
function slMightyReadConfig(){try{return slMightyValidate(JSON.parse(localStorage.getItem('mw_slayer_mighty_loadout')));}catch(e){return {...SL_MIGHTY_DEFAULT};}}
let SL_MIGHTY_CONFIG=slMightyReadConfig();
function slMightyDefinition(id,slot){
 const d=slDef(id,'mini');d.slAmmo=null;d.slCost=0;d.slMightySlot=slot;
 d.n=slot==='primary'&&id==='burst'?'バーストライフル':d.n;
 d.cd=slot==='secondary'?10:slot==='equipment'?10:slot==='ultimate'?.5:id==='chaingun'?.16:id==='combat'?.8:id==='burst'?.55:.3;
 if(slot==='primary'&&['heavy','plasma'].includes(id)){d.slCount=1;d.slSpread=0;}
 if(slot==='primary'&&id==='burst'){d.slCount=3;d.slSpread=0;}
 // These weapon functions differ from the same-named weapons in the FPS games.
 if(slot==='secondary'&&id==='ballista'){d.slKind='mightySticky';d.windup=.25;}
 if(slot==='secondary'&&id==='hammer'){d.slKind='mightyHammer';d.type='proj';d.maxR=150;d.dmg=75;}
 if(slot==='equipment'&&id==='arc')d.slKind='mightyArc';
 if(slot==='ultimate'&&id==='crucible'){d.slKind='mightyCrucible';d.type='proj';d.maxR=500;d.dmg=90;}
 if(slot==='ultimate'&&id==='etBfg'){d.slKind='mightyBfg';d.type='proj';d.maxR=700;d.dmg=260;}
 d.cond=(u,t)=>slMightyReady(u,id,t,false);return d;
}
function slMightyInit(u){
 u.slMightyLoadout=Object.freeze(slMightyValidate(SL_MIGHTY_CONFIG));
 u.atkList=Object.entries(u.slMightyLoadout).map(([slot,id])=>slMightyDefinition(id,slot));
 u.slMightyNext={primary:G.time,secondary:G.time,ultimate:G.time,equipment:G.time};
 u.slMightyCharge=0;u.slMightyRequired=20; // Explicit crossover projection, not a verified original charge table.
}
function slMightySlot(u,id){return Object.keys(u.slMightyLoadout||{}).find(slot=>u.slMightyLoadout[slot]===id);}
function slMightyReady(u,id,t,automatic=false){
 const slot=slMightySlot(u,id);if(!slot||!exAlive(u)||!exAlive(t)||!hostileTo(u,t))return false;
 if((slot==='primary'||slot==='equipment')&&!automatic)return false;
 if((u.slMightyNext?.[slot]||0)>G.time)return false;
 if(slot==='ultimate'&&u.slMightyCharge<u.slMightyRequired)return false;
 return true;
}
function slMightySpend(u,d){
 const slot=slMightySlot(u,d.slWeapon);u.slMightyNext[slot]=G.time+d.cd;
 if(slot==='ultimate')u.slMightyCharge=0;
}
function slMightyOnDeath(att,t){
 // No allied kills, decoys or ordnance farming; only actual credited hostile kills.
 if(att.sp.slEra!=='mini'||!hostileTo(att,t)||t.sp.slDecoy||t.sp.tkOrdnance)return;
 const gain=clamp(Math.ceil(t.sp.mass||1),1,4);
 att.slMightyCharge=Math.min(att.slMightyRequired,att.slMightyCharge+gain);
}
function slMightyAutomatic(u){
 if(!['idle','move','attack'].includes(u.state)||u.grabbedBy||u.carriedBy||u.inTv||u.stunT>0||u.down>0)return;
 for(const slot of ['primary','equipment']){
  const d=u.atkList.find(d=>d.slMightySlot===slot);if(!d)continue;
  const targets=G.units.filter(t=>exAlive(t)&&hostileTo(u,t)&&dist(u.x,u.y,t.x,t.y)<=d.maxR+u.r+t.r&&losWalk(u.x,u.y,t.x,t.y,1)&&canPerceive(u,t)).sort((a,b)=>dist(u.x,u.y,a.x,a.y)-dist(u.x,u.y,b.x,b.y));
  const t=targets[0];if(!t||!slMightyReady(u,d.slWeapon,t,true))continue;
  u.faceA=angTo(u.x,u.y,t.x,t.y);slFire(u,d,{tgt:t,slMightyAutomatic:true});
 }
}
function slMightySpecial(u,d,t){
 if(d.slKind==='mightyHammer'){slArea(u,u.x,u.y,110,d,{slOnHit:v=>{v.slowT=Math.max(v.slowT||0,3);}});return true;}
 if(d.slKind==='mightyArc'){slArea(u,t.x,t.y,65,d,{slOnHit:v=>{v.slowT=Math.max(v.slowT||0,3);}});return true;}
 if(d.slKind==='mightySticky'){
  const ang=angTo(u.x,u.y,t.x,t.y);slWorld().shots.push({x:u.x,y:u.y,vx:Math.cos(ang)*500,vy:Math.sin(ang)*500,src:u,target:t,d,life:4,hits:new Set(),next:0});return true;
 }
 if(d.slKind==='mightyCrucible'){
  const targets=G.units.filter(v=>exAlive(v)&&hostileTo(u,v)&&dist(u.x,u.y,v.x,v.y)<=d.maxR&&losWalk(u.x,u.y,v.x,v.y,1)).sort((a,b)=>dist(u.x,u.y,a.x,a.y)-dist(u.x,u.y,b.x,b.y)).slice(0,5);
  for(const v of targets)slHit(u,v,d);return true;
 }
 if(d.slKind==='mightyBfg'){
  // Mighty Doom's room-wide blast is not the FPS version's travelling BFG orb.
  const room=roomOfUnit(u);for(const v of G.units.slice())if(exAlive(v)&&hostileTo(u,v)&&(room>=0?roomOfUnit(v)===room:dist(u.x,u.y,v.x,v.y)<=d.maxR&&losWalk(u.x,u.y,v.x,v.y,1)))slHit(u,v,d);addShock(u.x,u.y,8,250,'#b8f4a6');return true;
 }
 return false;
}
function slMightyPlayerAttack(u,index){
 const slot=index===1?'ultimate':'secondary',d=u.atkList.find(d=>d.slMightySlot===slot);if(!d)return false;
 const targets=G.units.filter(t=>exAlive(t)&&hostileTo(u,t)&&canPerceive(u,t)).sort((a,b)=>dist(u.x,u.y,a.x,a.y)-dist(u.x,u.y,b.x,b.y));
 const t=targets.find(t=>canUse(u,d,t));if(!t)return false;u.tgt=t;startAttack(u,d,t);return true;
}
function slMightyInspectorText(u){
 const slots=Object.entries(u.slMightyLoadout).map(([slot,id])=>SL_MIGHTY_LABELS[slot]+':'+(id==='burst'?'バーストライフル':SL_GUNS[id][0])).join('｜');
 return slots+'｜副武器 待ち'+Math.max(0,u.slMightyNext.secondary-G.time).toFixed(1)+'秒｜必殺ゲージ '+u.slMightyCharge+'/'+u.slMightyRequired+'（充填量は本ゲーム用）';
}
function buildSlayerMightyPicker(box){
 const existing=document.getElementById('slayerMightyLoadout');if(existing)existing.remove();
 const field=document.createElement('fieldset');field.id='slayerMightyLoadout';field.style.cssText='border:1px solid #657b4c;margin:8px 0;padding:8px;display:grid;gap:6px';
 const legend=document.createElement('legend');legend.textContent='Mighty DOOM：開始時の4枠装備';field.appendChild(legend);
 for(const [slot,ids] of Object.entries(SL_MIGHTY_SLOTS)){
  const label=document.createElement('label');label.textContent=SL_MIGHTY_LABELS[slot]+' ';
  const select=document.createElement('select');select.id='slayerMighty_'+slot;select.setAttribute('aria-label',SL_MIGHTY_LABELS[slot]);
  for(const id of ids){const option=document.createElement('option');option.value=id;option.textContent=id==='burst'?'バーストライフル':SL_GUNS[id][0];select.appendChild(option);}
  select.value=SL_MIGHTY_CONFIG[slot];select.addEventListener('change',()=>{SL_MIGHTY_CONFIG=slMightyValidate({...SL_MIGHTY_CONFIG,[slot]:select.value});select.value=SL_MIGHTY_CONFIG[slot];try{localStorage.setItem('mw_slayer_mighty_loadout',JSON.stringify(SL_MIGHTY_CONFIG));}catch(e){}});label.appendChild(select);field.appendChild(label);
 }
 const note=document.createElement('small');note.textContent='次のゲーム開始時に適用。主武器・装備は自動、副武器J／必殺K。AI操作時は副武器・必殺も自動選択。原作の全強化・全タイプは未実装。';field.appendChild(note);box.appendChild(field);
}
