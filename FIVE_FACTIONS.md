# 新しい5陣営（HTML版）

**更新：ユーザー指示により「洋館戦向けの簡略化・弱体化」を正当化する方針を撤回。現在の修正・不足一覧は [FIVE_FIDELITY.md](FIVE_FIDELITY.md) と `research/five-fidelity-audit.json` を優先してください。以下には初回追加時の説明を含みます。**

対象は `mansion_war.html`。Minecraft Mod 側は変更していません。

## 今回追加した実装

|陣営|名簿の種類・形態数|主な動作|
|---|---:|---|
|プレデター `pr`|22|光学迷彩、近距離での発見、被弾による迷彩解除、プラズマ、槍、ディスク、支援ドローン・猟犬、自爆、強敵を優先する索敵補正|
|コヴナント `cv`|79|兵種・階級、兵器、シールド吸収と非被弾時の回復、誘導弾、兵員展開、修復・シールド支援。既存フラッドとは敵対|
|物体X `th`|22|人間・犬の擬態、発覚時の変形、接触同化、死亡時の頭蜘蛛分離。悪魔や生存中のEXEなど既存の感染保護対象は同化しない|
|DOORS `dr`|68|高速通過、往復襲撃、視線・移動・音への反応、罠、支援。Figureは静止した遠距離対象を汎用AIで再捕捉しない。Dam Seek本体は直接攻撃せず分体を生成|
|DOOM `dm`|207|版別の悪魔・ボス戦闘形態、火球、追尾弾、突進、召喚、死体蘇生、味方強化、死亡時能力|
|合計|398|初期配置は各名簿枠1体。召喚・再生成に陣営人数上限は設けない|

通常の陣営選択画面から有効／無効を切り替えられます。非戦闘員も名簿には残し、非戦闘DOORS枠などは残存戦力・勝利判定から除外しています。

現在の全体登録数は **1054種・通常攻撃定義2144件**。別形態の攻撃リストを含むアニメーション走査は2216定義です。これらは実装内の件数であり、原作の種類数や技数の証明ではありません。

## 範囲と統合方針

ユーザー指定は「本編に登場する全種類・戦闘形態」。同種の名前違い人物全員を別々に作る方式ではありません。

- **プレデター**：映画の装備・体格・戦闘方法を代表する枠を収録。個体名は区別のための代表ラベルです。同じ装備の背景人物、氏族全員は列挙しません。猟犬・偵察ドローンは支援枠として数に含みます。
- **Halo**：本編キャンペーンのコヴナントと残党を中心に、兵種・階級・主要兵器を収録。Gravity Shield Chieftain / Tartarus と爆発ハーネス付きHuragokも別枠です。Banished、Promethean、小説のみ、Halo Wars専用の勢力・兵器は対象外としています。
- **物体X**：1982年版・2011年版の擬態、発覚後の姿、分離部位を区別。人間状態の同一種の個人名違いは統合し、曖昧な感染者、削除シーン、ゲーム・漫画のみの姿は確定種として加えていません。
- **DOORS**：公開済み本編エリアの名簿と、攻撃方法が変わる分体を収録。商人・光などの非戦闘存在も保持。期間限定イベント・ファンメイド・未公開予定の存在は対象外です。Glitch派生の公開条件はなお再照合が必要です。
- **DOOM**：Classic、II、Final、64、公式Legacy of Rust、3と拡張、2016、EternalとTAG、The Dark AgesとRevelationsを作品・戦闘形態で整理。Final Doomなど同じ種類・同じ技構成は重複登録しません。2016のHarvester / Prowlerはキャンペーン外のプレイアブル悪魔も含む補助枠です。Champion / Demonic Leader / Enforcerは横断強化属性の代表枠で、すべての敵との組合せを別種として水増ししていません。

Revelationsは2026年7月7日の公開を公式案内で再確認し、拡張名簿から16枠を追加しました。[2](https://slayersclub.bethesda.net/en-US/article/doom-the-dark-ages-revelations-preview) [1](https://doom.fandom.com/wiki/Doom:_The_Dark_Ages:_Revelations)

**「調査して採用した398行を実装済み」と「本編の全種・全技を漏れなく検証済み」は別です。後者の照合は完了していません。** 上記の境界判断・統合・最新公開分の取りこぼしは追加照合の対象です。

## 原作再現についての制限

- HP、威力、距離、サイズ、クールダウンは洋館戦用に調整しています。原作で無敵・即死の存在も有限HP・有限ダメージです。
- 元作品の謎解き、隠れ場所、音声入力、プレイヤー操作、武器交換、部位破壊などをそのまま移植したわけではありません。視線・音・移動検知はAIの向き・移動速度・攻撃状態を使った簡易版です。
- 盾の方向別弱点やMarauderの厳密なカウンター時間、全ボスの原作フェーズ移行、Thingの複雑な再結合・全形態間遷移は未再現です。形態を別ユニットとして登録したものがあります。
- 描画は種族・輪郭別の専用プロファイルに共通骨格を併用。398枠がすべて個別手描きの見た目という意味ではありません。
- 支援NPCの回復・シールド供給、一部召喚などはこのクロスオーバー用の翻案です。全攻撃の個別原典照合と「原作と同数以上」の監査は未完了です。技名があるだけで原作再現済みとは扱いません。

## データと再生成

- `research/five-factions-roster.json`：全398行。作品、参照URL、輪郭、実装技、属性、実装状況を保持。
- `tools/build-five-roster.py`：名簿編集元。
- `tools/five-factions-runtime.js`：登録、能力、AI、描画。
- `tools/embed-five-factions.py`：名簿とランタイムを単一HTMLに埋め込み。

```sh
python3 tools/build-five-roster.py
python3 tools/embed-five-factions.py
node tools/test-five-factions.cjs
node tools/audit-animations.cjs
```

各行の `implemented-partial-canon-review` は実装済み・原作の全条件は再照合中という意味です。`evidence` も技単位の原作照合が未実施であることを明記しています。

## 確認したこと

- 新陣営専用テスト：398枠の登録・初期スポーン・選択切替・再開始、人数上限なし、非戦闘員の勝敗除外、シールドと再生、迷彩と発覚、機械／有機兵の感染判定、同化保護、死亡分離、蘇生、全custom技ディスパッチ、実際の往復移動、Figureの音反応、誘導弾の旋回、Dam本体の直接攻撃なし、5陣営を同時起動したシミュレーション。
- 全1054種のモックCanvas描画：例外0。
- アニメーション2216定義：未定義キー0、モック描画例外0。
- 既存14回帰スイート：壁・向き・防御設定・EXE・人数上限・Minecraft増援・悪魔・ピットドローン・コンバイン・村・Minecraft陣営・既存拡張・戦闘・バランスは398枠追加直前の380枠版で全件成功。最終398枠版では新陣営専用／全種描画／アニメーションを再実行。

実ブラウザの操作・最終的な見た目・長時間の大量増殖時の性能は未確認です。人数上限なしのため、同時有効陣営や召喚増殖により負荷が高くなります。

## 主な参照先

参照日は2026-10-22。名簿の出典は各JSON行にも保持。総合一覧はすべての技の個別根拠を兼ねるものではありません。

- Predator映画： https://www.avpcentral.com/predators-from-the-movies
- Predator武器： https://www.avpgalaxy.net/predator/weapons/
- Covenant： https://www.halopedia.org/Covenant_military
- Jul 'Mdama残党： https://www.halopedia.org/Jul_%27Mdama%27s_Covenant
- Thing： https://thething.fandom.com/wiki/The_Thing_(Organism)
- DOORS： https://doorsgame.wiki/wiki/Entities
- DOOM： https://doomwiki.org/wiki/Monster
- Revelations： https://doom.fandom.com/wiki/Doom:_The_Dark_Ages:_Revelations
- Warlock： https://doomwiki.org/wiki/Warlock
