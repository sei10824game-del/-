/* Shared keyboard, click and touch control. Uses normal combat/collision rules. */
function playerClearInput(){
 G.keys={};G.stick={x:0,y:0};camKeys={};
 const u=G.ctrl;if(u?.playerKeyboard){u.dest=null;u.path=null;u.moveSpd=0;u.playerKeyboard=false;}
}
function playerSetControl(u){
 playerClearInput();const old=G.ctrl;
 if(old){old.dest=null;old.path=null;old.moveSpd=0;old.playerKeyboard=false;}
 G.ctrl=u&&!u.gone&&!u.dead?u:null;
 if(G.ctrl){G.ctrl.dest=null;G.ctrl.path=null;G.ctrl.tgt=null;G.follow=false;G.sel=G.ctrl;addLog('▶ '+G.ctrl.name+' を操作：WASD/矢印 移動・J/Space 攻撃・K 別技・Esc 解除・P 一時停止','sys');}
 else if(old)addLog('操作解除','sys');
}
function playerCanAct(u){return !!u&&!u.dead&&!u.gone&&!u.tf&&!u.grabbedBy&&!(u.stunT>0)&&!(u.down>0)&&['idle','move'].includes(u.state);}
function playerAttack(index=0){
 const u=G.ctrl;if(!G.started||G.paused||G.over||!playerCanAct(u))return false;
 if(u.sp.slEra==='mini')return slMightyPlayerAttack(u,index);
 let pick=null;
 const targets=G.units.filter(t=>t!==u&&!t.dead&&!t.gone&&hostileTo(u,t)&&canPerceive(u,t));
 targets.sort((a,b)=>(a===u.tgt?-1:b===u.tgt?1:dist(u.x,u.y,a.x,a.y)-dist(u.x,u.y,b.x,b.y)));
 for(const t of targets){const moves=(u.atkList||[]).filter(d=>canUse(u,d,t));if(!moves.length)continue;pick={t,d:moves[index]||moves[0]};break;}
 if(!pick)return false;
 u.tgt=pick.t;u.dest=null;u.path=null;startAttack(u,pick.d,pick.t);return true;
}
function tickCtrl(dt){
 const u=G.ctrl;if(!u)return;
 if(u.dead||u.gone||!G.units.includes(u)){playerSetControl(null);return;}
 const k=G.keys||{},stick=G.stick||{};
 let dx=(k.d||k.arrowright?1:0)-(k.a||k.arrowleft?1:0),dy=(k.s||k.arrowdown?1:0)-(k.w||k.arrowup?1:0);
 if(Math.hypot(stick.x||0,stick.y||0)>.12){dx+=stick.x;dy+=stick.y;}
 if(!dx&&!dy&&u.playerKeyboard){u.dest=null;u.path=null;u.moveSpd=0;u.playerKeyboard=false;}
 if(!playerCanAct(u)){if(u.state!=='attack'){u.dest=null;u.path=null;u.moveSpd=0;}return;}
 if(dx||dy){dy/=SQ;const n=Math.hypot(dx,dy);u.faceA=Math.atan2(dy,dx);u.playerKeyboard=true;setDest(u,u.x+dx/n*80,u.y+dy/n*80,true);}
 if(k.j||k[' ']||k.space)playerAttack(0);else if(k.k)playerAttack(1);
}
function playerInputKey(e){
 const code=(e.code||'').toLowerCase();if(/^key[a-z]$/.test(code))return code.slice(3);if(code==='space')return ' ';return (e.key||'').toLowerCase();
}
function playerTyping(e){return !!e.target?.closest?.('input,textarea,select,[contenteditable="true"],[role="textbox"]');}
function playerKeyDown(e){
 if(playerTyping(e)||e.isComposing||e.ctrlKey||e.metaKey||e.altKey)return;
 const k=playerInputKey(e);G.keys=G.keys||{};G.keys[k]=true;camKeys[k]=true;
 if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k)||(G.ctrl&&['w','a','s','d','j','k'].includes(k)))e.preventDefault();
 if(e.repeat)return;
 if(k===' '&&!G.ctrl){playerClearInput();togglePause();}
 if(k==='p'){playerClearInput();togglePause();}
 if(k==='c'){playerSetControl(G.ctrl===G.sel?null:G.sel);updateInspector();updateCtrlHud();}
 if(k==='escape'){playerSetControl(null);G.sel=null;updateInspector();$('helpOv').classList.add('hide');updateCtrlHud();}
 if(k==='f'&&!G.ctrl)toggleFollow();
 if(k==='u')$('ui').classList.toggle('uioff');
 if(k==='r'&&G.started)startGame({});
 if(k==='h')$('helpOv').classList.toggle('hide');
 if(k==='1')setSpeed(.5);if(k==='2')setSpeed(1);if(k==='3')setSpeed(2);if(k==='4')setSpeed(4);
}
function playerKeyUp(e){const k=playerInputKey(e);if(G.keys)G.keys[k]=false;camKeys[k]=false;}
