from pathlib import Path
p=Path('mansion_war.html');s=p.read_text()
# Replace the dormant controller, and keep the shared implementation in one place.
start=s.index('function tickCtrl(dt) {') if 'function tickCtrl(dt) {' in s else -1
if start>=0:
    end=s.index('function stepSim(dt)',start)
    s=s[:start]+s[end:]
a=s.index('  // キー\n',s.index('let miniCtx ='))
b=s.index('\n}\nfunction touchDist',a)
s=s[:a]+'''  // キー
  G.keys = G.keys || {};
  window.addEventListener('keydown', playerKeyDown);
  window.addEventListener('keyup', playerKeyUp);
  window.addEventListener('blur', playerClearInput);
  document.addEventListener('visibilitychange', () => {if(document.hidden)playerClearInput();});'''+s[b:]
s=s.replace("if (G.ctrl === best) { G.ctrl = null; addLog('操作解除', 'sys'); }", "if (G.ctrl === best) playerSetControl(null);")
s=s.replace("else { G.ctrl = best; G.follow = false; addLog('▶ ' + best.name + ' に憑依 (WASD・クリック移動・スペース／攻撃ボタン)', 'sys'); }", "else playerSetControl(best);")
s=s.replace("if (G.ctrl === G.sel) { G.ctrl = null; addLog('操作解除', 'sys'); }", "if (G.ctrl === G.sel) playerSetControl(null);")
s=s.replace("else { G.ctrl = G.sel; G.follow = false; addLog('▶ ' + G.sel.name + ' を操作中 (WASD/矢印・クリック移動・スペース攻撃)', 'sys'); }", "else playerSetControl(G.sel);")
# Click attacks must not restart an already playing attack or bypass cooldown.
s=s.replace("    if (atk) startAttack(G.ctrl, atk, best);\n    else setDest(G.ctrl, best.x, best.y, true);", "    if (playerCanAct(G.ctrl)&&!G.paused&&!G.over) {\n      if(atk) {G.ctrl.dest=null;G.ctrl.path=null;startAttack(G.ctrl,atk,best);}\n      else setDest(G.ctrl,best.x,best.y,true);\n    }")
s=s.replace("    G.ctrl.playerKeyboard=false;\n", "")
s=s.replace("    setDest(G.ctrl, w.x, w.y, true);", "    G.ctrl.playerKeyboard=false;\n    setDest(G.ctrl, w.x, w.y, true);")
if 'function startGame(cfg) {\n  playerSetControl(null);' not in s:
    s=s.replace('function startGame(cfg) {','function startGame(cfg) {\n  playerSetControl(null);',1)
# All touch and mouse HUD attacks use the same form-aware, state-aware path.
a=s.index('  const fire = n =>',s.index('function ensureCtrlHud()'))
b=s.index("  $('ctrlAtk').addEventListener",a)
s=s[:a]+"  const fire = n => playerAttack(n);\n"+s[b:]
s=s.replace('sans-serif">攻撃</button>', 'sans-serif">攻撃<br>J / Space</button>')
s=s.replace('sans-serif">技2</button>', 'sans-serif">別技 K</button>')
if 'id="ctrlInfo"' not in s:
    s=s.replace('  <div id="stickBase"', '  <div id="ctrlInfo" style="position:absolute;top:64px;left:50%;transform:translateX(-50%);max-width:90vw;padding:7px 12px;background:#15131de8;color:#ffe9a0;border:1px solid #8a7346;border-radius:6px;font:12px sans-serif;text-align:center"></div>\n  <div id="stickBase"',1)
if "$('ctrlInfo').textContent=" not in s:
    s=s.replace("  const el = $('ctrlHud');", "  const el = $('ctrlHud');\n  $('ctrlInfo').textContent=G.ctrl?'操作中：'+G.ctrl.name+' ｜ WASD/矢印 移動 ｜ J/Space 攻撃 ｜ K 別技 ｜ Esc 解除 ｜ P 停止':'';",1)
s=s.replace('  G.paused = !G.paused;', '  playerClearInput();\n  G.paused = !G.paused;') if 'function togglePause() {\n  playerClearInput();' not in s else s
s=s.replace('<li>ユニットをクリック … 詳細パネル（HP・感染率・懐胎率・形態など）</li>', '<li>ユニットをクリック … 詳細パネル。<b>「操作」ボタン / C / 同じ個体をもう一度クリック</b>で直接操作を開始。</li>\n        <li><b>操作中</b>：WASD / 矢印で移動、<b>J / Spaceで攻撃、Kで別技</b>（押し続け可）。近くの攻撃可能な敵を自動選択。敵クリックで標的指定、床クリックで移動。Escで解除、Pで停止/再開。</li>')
if 'id="ctrlRelease"' not in s:
    s=s.replace('  </div>`;\n  document.body.appendChild(d);', '    <button id="ctrlRelease" style="padding:8px;background:#25202e;color:#ffe9a0;border:1px solid #8a7346">操作解除 Esc</button>\n  </div>`;\n  document.body.appendChild(d);',1)
if "$('ctrlRelease').addEventListener" not in s:
    s=s.replace('  const fire = n => playerAttack(n);', "  $('ctrlRelease').addEventListener('click',e=>{e.stopPropagation();playerSetControl(null);updateInspector();updateCtrlHud();});\n  const fire = n => playerAttack(n);",1)
p.write_text(s)
