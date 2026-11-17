/* User-requested game adaptations, NOT newly asserted canonical moves. */
for(const k of ['gon','killua'])SP[k].jokerImmune=1;
const ACROBAT_KEYS=['verityMon',...Object.keys(SP).filter(k=>SP[k].ai==='fpeTeach')];
for(const k of ACROBAT_KEYS)if(k!=='verityMon')SP[k].scale*=1.25;
AANIM.acroVault=[{t:0,crouch:.1},{t:.16,crouch:.65,lean:-.3,armL:[-1.1,.8],armR:[-1.2,.7]},{t:.34,crouch:.1,lean:.5,legL:[-1.4,1.8],legR:[-1.2,1.6],armL:[-1.5,1],armR:[-1.5,1]},{t:.52,lean:.7,legL:[1.1,.1],legR:[-.8,.4],armL:[1.4,.1],armR:[1.7,.1]},{t:.72,crouch:.6,lean:.4},{t:1,crouch:0,lean:0}];
AANIM.acroWheel=[{t:0,lean:0},{t:.18,lean:.7,crouch:.3,armL:[1.6,.1],armR:[-1.5,.2]},{t:.38,legL:[-1.6,.1],legR:[1.4,.1],armL:[1.4,.1],armR:[-1.4,.1]},{t:.58,legL:[1.2,.2],legR:[-1.3,.2],armL:[-1.5,.1],armR:[1.4,.1]},{t:.8,crouch:.4,lean:.4},{t:1,lean:0,crouch:0}];
for(const k of ACROBAT_KEYS){
 const sp=SP[k],monster=k==='verityMon',tool=monster?'長腕':k==='missCircle'?'コンパス':k==='missThavel'?'鉤爪':k==='missBloomie'?'剪刀':k==='dngCircle'?'火炎腕':k==='dngThavel'?'グローブ':'銃床';
 sp.atks.push(AT({n:'跳び越し'+tool+'落とし',type:'leap',leap:monster?175:140,reach:monster?50:38,dmg:monster?34:30,windup:.38,active:.48,rec:.62,cd:6,anim:'acroVault',acroKind:'vault',knock:190}));
 sp.atks.push(AT({n:'側転'+tool+'薙ぎ',type:'dash',dash:105,reach:monster?48:34,dmg:monster?26:23,windup:.26,active:.48,rec:.48,cd:4.8,anim:'acroWheel',acroKind:'wheel',knock:130}));
}
function updateJokerProtection(u){if(!jokerEligible(u))u.jokerRate=0;}
function acrobatDrawTransform(u){
 const a=u.atk;if(!a||!a.def.acroKind)return;
 const d=a.def,active=clamp((a.t-d.windup)/Math.max(.001,d.active),0,1);if(active<=0||active>=1)return;
 // Rotate the complete articulated silhouette, including the weapon, around its
 // airborne centre; no collision coordinates or invulnerability are changed.
 const x=u.x,y=u.y*SQ-(u.z||0)-unitTopY(u)*.48;
 const dir=Math.cos(u.faceA)>=0?1:-1;
 ctx.translate(x,y);ctx.rotate(dir*TAU*active);ctx.translate(-x,-y);
}
var drawYellowVerityHead = function(u,sk){
 const h=sk.head,R=sk.P.headR,d=sk.dir;ctx.save();ctx.translate(h.x,h.y);ctx.scale(d,1);
 ctx.fillStyle='#ffe300';ctx.beginPath();ctx.moveTo(-R*.7,-R*1.35);ctx.quadraticCurveTo(R*.4,-R*1.65,R*.88,-R*.65);ctx.lineTo(R*1.1,R*.2);ctx.lineTo(R*.65,R*1.45);ctx.quadraticCurveTo(-R*.9,R*1.35,-R*.7,-R*1.35);ctx.fill();
 ctx.strokeStyle='#b39808';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-R*.58,-R*.9);ctx.quadraticCurveTo(-R*.7,R*.8,R*.4,R*1.25);ctx.stroke();
 ctx.fillStyle='#211b03';ctx.beginPath();ctx.ellipse(R*.52,-R*.32,R*.13,R*.23,-.2,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(R*.42,R*.22);ctx.lineTo(R*.94,R*.12);ctx.lineTo(R*.64,R*.94);ctx.lineTo(R*.35,R*.7);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#fff46b';ctx.lineWidth=.65;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(R*(.5+i*.13),R*.3);ctx.lineTo(R*(.5+i*.1),R*.49);ctx.stroke();}ctx.restore();
};

function drawVerityFingers(arm,P,skin){
 const a=Math.atan2(arm.ha.y-arm.el.y,arm.ha.x-arm.el.x);ctx.save();ctx.translate(arm.ha.x,arm.ha.y);ctx.rotate(a);ctx.fillStyle=skin;
 ctx.beginPath();ctx.ellipse(P.handL*.5,0,P.handL*1.1,P.handL*.65,0,0,TAU);ctx.fill();
 ctx.strokeStyle=skin;ctx.lineWidth=Math.max(.65,P.armR*.5);ctx.lineCap='round';
 for(let i=0;i<4;i++){const y=(i-1.5)*P.handL*.43,len=P.handL*(i===0||i===3?2.6:3.7);ctx.beginPath();ctx.moveTo(P.handL,y);ctx.lineTo(P.handL+len*.65,y*1.7);ctx.lineTo(P.handL+len,y*2.3+P.handL*.3);ctx.stroke();}ctx.restore();
}
