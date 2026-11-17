# OMORI 2陣営／ジョーカー対象制限／密集停止対策

2026-10-26。HTML版 `mansion_war.html`。OMORIは作業前の登録に存在しなかったため新規追加。

## 追加陣営・初期構成

### OMORI（夢世界） `om`：7種、初期各1体

| キー | キャラクター | 登録技数 |
|---|---|---:|
| omOmori | オモリ（主人公） | 19 |
| omBoss | オモリ（ボス） | 8 |
| omAubrey | オーブリー（夢世界） | 13 |
| omKel | ケル（夢世界） | 15 |
| omHero | ヒロ（夢世界） | 19 |
| omBasil | バジル（夢世界） | 11 |
| omMari | マリ（夢世界） | 1（ピクニック支援の翻案） |

### サニー（現実世界） `su`：11種、初期各1体

| キー | キャラクター | 登録技数 |
|---|---|---:|
| suSunny | サニー | 9 |
| suAubrey | オーブリー（現実） | 3 |
| suKel | ケル（現実） | 3 |
| suHero | ヒロ（現実） | 3 |
| suBasil | バジル（現実） | 2 |
| suPolly | ポリー | 0（非戦闘・避難AI） |
| suKim | キム | 2 |
| suVance | ヴァンス | 2 |
| suCharlene | シャーリーン | 2 |
| suAngel | エンジェル | 2 |
| suMaverick | ミカエル（THE MAVERICK） | 2 |

追加18種・116技、全体1,147種・2,770技。初期各1体は同時個体数上限ではない。夢世界／現実世界を別の選択可能陣営にし、両者はこの対戦シミュレーション内では敵対。同じ陣営では友好。現実のマリを生存NPCとして追加することはしていない。「その他」は上記の主要人物を今回の範囲とし、HEADSPACEの全ボス・全雑魚・全住民を網羅したものではない。

## 戦闘

- 主人公OMORI：SAD POEM、STAB、HACK AWAY、RED HANDS、VERTIGO、CRIPPLE、SUFFOCATE等。HACK AWAYは3回、RED HANDSは4回の遅延命中判定。
- ボスOMORI：ATTACK／STAB／HACK AWAYに加え、段階2からRED HANDS、3でRED HAND ATTACK、4でHAIR ATTACK、5でMARI ATTACK、6でFINAL ATTACKを解禁。防御低下・複数能力低下・AFRAIDを付与。
- 原作のボス戦の継続不能構造をそのまま持ち込んで無限不死にはしない。今作では5回だけ体力再充填、6段階目は通常ダメージで死亡。主人公版の「did not succumb」は一度だけHP1に耐える。
- サニー：CALM DOWN、FOCUS、PERSIST、OVERCOME、ALLEGRO、ENCORE、CHERISH。PERSISTは2秒だけHP1に耐える。ALLEGROは3回。ヴァイオリンを持つ終盤の精神戦も通常のアリーナへ翻案して統合している。
- 夢Aubreyは3連撃・頭突き反動・カウンター・自分が倒れるLAST RESORT等、Kelは3連球・FLEX・JUICE補給、HeroはHP回復・JUICE回復・味方死体を消費するHOMEMADE JAM、夢Basilは花系の技や回復支援を持つ。
- 現実Kelはサニーの攻撃支援、現実HeroはFIRST AID、現実Aubreyは反動つきHOMERUN。現実Basil／不良グループの基本攻撃・GUARDはこのアリーナ向けの装備・行動翻案。
- JUICE消費、毎秒2の自然回復、感情と相性、ENERGY（被ダメージ・支援で蓄積、Basilの技に使用）を実装。InspectorにJUICE／感情／ENERGY／ボス段階を表示。
- HAPPY／SAD／ANGRYの相性により与ダメージが変わり、感情による移動・防御・攻撃変化もある。AFRAIDは攻撃と移動を弱める。感情は18秒、能力変化は基本8秒で解ける。
- 命中時にも生存・敵対・射程・高さ・LOSを再確認。発動後に壁ができた場合も貫通しない。既存の被弾後無敵設定・有限回避・装甲を無条件に解除しない。

### 原作との差分

ターン制をリアルタイムへ変換したため射程・HP・威力・秒数は翻案値。4スキル装備制限は設けず、登録技を利用できる。EMOTIONの全数式／命中乱数／JUICEダメージ吸収／FOLLOW-UP操作や全カットシーンを完全再現するものではない。ENERGYはこの実装では主にBasilの攻撃計算等に使用し、原作のRELEASE ENERGY演出そのものは未実装。マリの戦闘中PICNICは原作の回復地点を支援行動へ翻案。ポリーに超能力・攻撃技は追加していない。通常攻撃無効や全状態異常免疫は新陣営へ追加していない。

## ジョーカー化の対象

`jokerEligible`を「生きている、感染対象となる、人間の頭部を持つ二足のmortalで、現在・元種・戦闘形態の技がない個体」に限定。既存の感染／ジョーカー保護も維持。

- 避難民等の非戦闘人間は対象。
- 武装／戦闘人間・動物・ゾンビ・ロボット・怪物は対象外。
- 攻撃だけでなく固有技を持つ個体も非戦闘の一般人とはみなさない。
- 蓄積対象だけでなく、直接`startTransform`を呼ぶ経路と変換完了時も検査。対象外の`jokerRate`を毎更新で消去。
- 他のウイルスの感染条件をこの修正で一括無効化しない。

## 密集停止の修正

確認した原因：聴覚AIが陣営つき足音をフィルタせず味方の位置へ集合し、到達した直近の音を繰り返し目的地にする。通常Monsterの群れ合流先が自陣営でなくT陣営に固定されていた。感染／味方化で友好になったターゲットとaggroを追い続ける経路もあった。

- 味方の音・既に到達した40px未満の音は聴覚追跡の対象外。敵の音を追う機能は維持。
- 音へのコミットを4秒で期限切れにし、古い位置への無期限追跡を防ぐ。攻撃開始音にも発生陣営を付加。
- 合流先を生きた同陣営重装個体に限定し、180px以内にいる仲間への集合を繰り返さない。
- Monster/mz AIは友好になったターゲット・aggroを破棄。
- 戦闘／拘束中ではないMonster/mzが目的地へ進めず2.5秒停滞したら、歩ける足元とLOSを確認した別方向を選ぶ。今回追加した救済では位置を直接書き換えるワープはしない。
- 同陣営を固い障害物にしない既存のすれ違い処理は維持。

すべての作品固有AIやあらゆる地形の停滞解消を保証するものではない。今回の再現ケースと既存の狭い廊下すれ違い試験を確認した。

## 検証

全 `tools/test-*.cjs` 72本PASS（既存68＋新4）。新規：

- `test-crowd-joker.cjs`：全種対象判定監査、蓄積・直接／完了変換ガード、敵聴覚維持、味方・到達済み音除外、16体の実AI／移動による密集解消、非ワープ進路変更。
- `test-omori.cjs`：116技を個別実行、全ダメージ技のHP減少、回復／死体消費蘇生／FLEX／ガード実効、コスト・感情・ボス6段階・有限耐久・途中壁生成。
- `test-omori-ui.cjs`：実DOMで2陣営選択／パネル／Inspector／操作、18体初期配置、240 step戦闘、無効陣営／再開始時のイベント・効果リセット。
- `test-omori-visual.cjs`：native canvasで18モデルの向き／歩行／構え、描画による戦闘値変更なし。画像 `/home/user/omori-character-poses.png` を目視確認。

原作参考：
- https://omori.fandom.com/wiki/OMORI （ユーザー指定）
- https://omori.fandom.com/wiki/OMORI_(Enemy) （ボス8技・各段階）
- https://omori.fandom.com/wiki/SKILLS （夢／現実のスキル表。夢Basilは追加コンテンツの技能を含む）

正本：`tools/omori-runtime.js`, `tools/omori-renderer.js`, `tools/embed-omori.py`, `tools/embed-crowd-joker.py`, `tools/acrobat-runtime.js`。`python3 tools/embed-five-factions.py`で再生成可能。

最終監査：アニメーション2,842件／未登録0／mock描画エラー0。描画1,147種／エラー0（手動材質確認対象50種、新18種は上記native画像で確認）。再埋め込み前後HTML SHA256一致、`git diff --check` PASS。8080サーバー稼働確認。
