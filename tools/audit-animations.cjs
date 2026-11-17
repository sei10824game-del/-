// Definition + mock-render audit; not a pixel or original-work fidelity certification.
const fs=require('node:fs');const assert=require('node:assert/strict');const{vm,sandbox}=require('./audit-creatures.cjs');
vm.runInContext(`
globalThis.animationRows=[];globalThis.missingAnimations=[];G.units=[];G.facOff={};G.time=3;
for(const [key,s] of Object.entries(SP)){
 const u=spawnUnit(key,500,500,{force:true});if(!u)continue;
 const lists=[s.atks||[],...(s.formAtks||[]),...(key==='gon'?[GON_ADULT_ATKS]:[])];
 const seen=new Set();for(let form=0;form<lists.length;form++)for(const d of lists[form]){
  if(seen.has(d))continue;seen.add(d);const missing=!AANIM[d.anim];if(missing)missingAnimations.push(key+'/'+d.n+'/'+d.anim);
  const renderer=s.exeShape?'EXE専用':s.mwShape?'Minecraft専用':s.exShape?'触手／台風専用':s.cbShape?'コンバイン機械専用':key==='fpeAlice'?'人型＋悪魔専用':s.kind;
  animationRows.push({key,name:d.n,anim:d.anim,renderer});u.state='attack';u.form=key==='fpeAlice'&&form>1?1:0;
  for(const f of [.15,.45,.75]){u.atk={def:d,t:(d.windup+d.active+d.rec)*f,tgt:null};drawUnit(u);}
 }u.gone=true;
}
`,sandbox);
assert.equal(sandbox.missingAnimations.length,0);assert.equal(vm.runInContext('Object.keys(DRAW_ERRS).length',sandbox),0);
let text='# 攻撃アニメーション監査\n\n通常＋別形態＋ゴンさんの攻撃リストを走査。'+sandbox.animationRows.length+'定義を確認。未定義アニメーションキー: '+sandbox.missingAnimations.length+'件。攻撃の3時点でモック描画例外0件。\n\n';
text+='## 今回見つけて修正した専用描画の問題\n\nアニメーション名は既存の全攻撃にあったものの、汎用骨格を通らない描画は攻撃ポーズを使っていなかった。ミュータントエンダーマンの4攻撃を個別の四本腕軌道・点滅・屈み・衝撃波へ変更。通常エンダーマン、エンダーマイト、クリーパーの予備動作、アリス悪魔の爪、地中触手の鞭、台風の吸引／竜巻、コンバイン機械の射撃反動／打撃／範囲動作にも攻撃進行を反映。\n\n';
text+='これは全攻撃が原作通りの独自アニメーションを持つという合格証ではない。共有アニメーションは多数残る。専用描画のすべての技が互いに識別できるか、実ブラウザの見た目は未確認。\n\n|ID|技|アニメーション指定|描画経路|\n|---|---|---|---|\n';
for(const r of sandbox.animationRows)text+=`|${r.key}|${r.name}|${r.anim}|${r.renderer}|\n`;
fs.writeFileSync('ANIMATION_AUDIT.md',text);console.log(`Animation audit: ${sandbox.animationRows.length} attack definitions, 0 missing keys, 0 mock draw errors.`);
