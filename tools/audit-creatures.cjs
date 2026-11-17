// Canvas/DOM stubs: definition audit only, not a browser/rendering test.
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('mansion_war.html', 'utf8');
const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const noop = () => {};
const stub = new Proxy(noop, {get: (_, k) => k === Symbol.toPrimitive ? () => 1 : k === 'globalAlpha' ? 1 : k === 'getContext' ? () => stub : k === 'width' || k === 'height' ? 1000 : k === 'devicePixelRatio' ? 1 : stub, set: () => true, apply: () => stub});
const sandbox = { console, Math, Date, Set, Map, Float32Array, Int32Array, Uint8Array, Uint16Array, Uint32Array, document: stub, window: stub, navigator: stub, performance: {now: () => 0}, requestAnimationFrame: noop, setTimeout: noop, localStorage: {getItem: () => null, setItem: noop} };
vm.createContext(sandbox);
vm.runInContext(code.slice(0, code.indexOf('/* ── 起動 ── */')) + '\n globalThis.catalog = Object.entries(SP).map(([key,s]) => ({key,name:s.name,faction:s.fac,kind:s.kind, attacks:(s.atks||[]).map(a=>({name:a.n,type:a.type||"melee",anim:a.anim,damage:a.dmg})),ai:s.ai}));', sandbox);
fs.writeFileSync('creature-attack-catalog.json', JSON.stringify(sandbox.catalog, null, 2) + '\n');
const rows = sandbox.catalog;
console.log(`${rows.length} species, ${rows.reduce((n,s)=>n+s.attacks.length,0)} attack definitions`);
console.log('No explicit attacks:', rows.filter(s=>!s.attacks.length).map(s=>s.key).join(', '));
const assert = require('node:assert/strict');
for (const s of rows) for (const a of s.attacks) {
  assert.ok(a.name, `${s.key}: unnamed attack`);
  assert.ok(Number.isFinite(a.damage), `${s.key}/${a.name}: invalid damage`);
}
// Exercise every species' actual draw dispatcher at each quality with a mock canvas.
// This detects JS exceptions; it does not validate pixels, browser behavior, or combat reachability.
sandbox.drawFailures = [];
sandbox.canvasStub = stub;
vm.runInContext(`
ctx = canvasStub;
G.map = {wpx: 10000, hpx: 10000, w: 400, h: 400, roomOf: new Int32Array(160000), rooms: [{type:"storage"}], walk: new Uint8Array(160000).fill(1)};
for (const quality of ['high','mid','low']) {
  G.quality = quality;
  for (const key of Object.keys(SP)) {
    try {
      const u = spawnUnit(key, 500, 500, {force:true});
      if (u) { drawUnit(u); }
    } catch(e) { drawFailures.push(quality + '/' + key + ': ' + e.message); }
  }
}
for (const [key, message] of Object.entries(DRAW_ERRS)) drawFailures.push(key + ': ' + message);
`, sandbox);
console.log('Mock-canvas draw failures:', sandbox.drawFailures.length);
if (sandbox.drawFailures.length) console.log(sandbox.drawFailures.slice(0,15).join('\n'));
let report = '# HTML版：全種の攻撃定義監査\n\n';
report += `対象: ${rows.length}種、攻撃リスト合計${rows.reduce((n,s)=>n+s.attacks.length,0)}件。\n\n`;
report += '**これは実装一覧であり、原作準拠の合格表ではありません。全種の原作技数は未検証です。** 原作の作品・版・形態によって技が異なり、通常技以外のAI、召喚、死亡時能力、必殺技はこの件数に含まれません。条件付きの技の実戦到達性も別途確認が必要です。技数を水増しするための汎用攻撃追加はしていません。\n\n';
report += '## 再実行\n\n`node tools/audit-creatures.cjs`（外部依存なし）。定義の名前・ダメージ値の検査と、全種×3画質のモックCanvas描画を実行。実ブラウザの見た目・操作・性能を保証するテストではありません。\n\n';
report += '## 全種一覧\n\n|ID|名前|陣営|定義数|実装済み技（原作照合は未完了）|\n|---|---|---|---:|---|\n';
for (const s of rows) report += `|${s.key}|${s.name}|${s.faction}|${s.attacks.length}|${s.attacks.map(a=>a.name).join(' / ') || '通常攻撃リストなし：AI・非戦闘役・拠点を個別確認'}|\n`;
fs.writeFileSync('CREATURE_AUDIT.md', report);
assert.equal(sandbox.drawFailures.length, 0, 'Mock draw failures detected');
module.exports = {sandbox, vm};
