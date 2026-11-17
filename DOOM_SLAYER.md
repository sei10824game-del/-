# Doom Slayer陣営 — 初期実装・未完了の再現監査

> **最新：各種1体を維持して主人公強化を適用。** HP×20–40、与ダメージ×6–10、被ダメージ×0.2–0.35、装甲・回復・機動・武器選択も強化。倍率は原作の確定値ではなく屋敷戦用。旧記述の生ステータスに対する追加層です。詳細と攻撃エフェクト表示修正は `SANS_VISIBILITY_SLAYER_POWER.md` を参照。

**状態：遊べる初期実装。『全ての作品を原作と全く同じ』という依頼の完了版ではありません。**

## 登録範囲

27の作品／キャンペーン／主人公版を各1体初期配置する。DOOM II RPGの3主人公を含むため、27作品という意味ではない。

1. DOOM (1993)
2. The Ultimate DOOM
3. DOOM II
4. Master Levels for DOOM II
5. Final DOOM: TNT Evilution
6. Final DOOM: The Plutonia Experiment
7. No Rest for the Living
8. SIGIL
9. SIGIL II
10. Legacy of Rust
11. DOOM 64
12. DOOM 64: The Lost Levels
13. DOOM 3
14. DOOM 3: Resurrection of Evil
15. DOOM 3: The Lost Mission
16. DOOM RPG
17–19. DOOM II RPG：Stan Blazkowicz / Kira Morgan / Riley O’Connor
20. DOOM Resurrection (iPhone)
21. DOOM (2016)
22. DOOM VFR：Dr. Petersの戦闘シャーシ
23. DOOM Eternal
24. The Ancient Gods — Part One
25. The Ancient Gods — Part Two
26. DOOM: The Dark Ages
27. Mighty DOOM：Mini Slayer

新キャンペーンのない移植・リマスター（BFG Editionなど）は対応キャンペーンにまとめた。SIGIL系は追加キャンペーン枠。無関係な公式アドオンの全主人公、映画・小説、他社ゲームのゲスト出演、全スキンまで網羅したものではない。全発売作品・版の照合も完了していない。詳細な装備IDは `research/slayer-roster.json`。

## 人数と防護

- 陣営ID `sl`、陣営選択・27登録の人数パネル・装甲/弾薬の選択中表示を追加。
- 通常・強制・召喚・蘇生経路が共用する `spawnUnit` で、生存中の同一キーの二重生成を拒否。陣営全体の上限は付けていない。他陣営の上限撤廃にも変更なし。
- `infectionImmune`、寄生無効、ジョーカー無効、マキマ支配無効、汎用変身／転換無効。予約された変身の完了時にも拒否する。
- 死体にもウイルス・胞子・変異蘇生予約を付けない。原作の全主人公が同じ耐性を持つという主張ではなく、今回のユーザー指定。
- 同陣営は非敵対。現時点では他陣営とは敵対（既存の非戦闘・隠蔽などの例外は維持）。
- ホログラムは一時的な別デコイで、Slayerの複製ではない。5秒または所有者死亡で消える。全滅判定を延命しない。

## 追加実装：Mighty DOOMの4枠装備

開始前に主武器5種／副武器5種／必殺4種／装備5種から各1つを選択する。生存中のMini Slayerが保持するのは選んだ4アクションのみ。設定は保存され、変更は次回開始時に適用（進行中の個体には反映しない）。主武器と装備は自動作動、副武器は使用後10秒待ち、必殺は開始時0から撃破で充填。手動操作はJが副武器、Kが必殺。観戦AIは副武器・必殺も選択する。

MightyのBurst Rifleを散弾バーストと分離。Ballistaは付着後の遅延爆発、Crucibleは最大5対象、BFGは部屋内への範囲攻撃へ分岐。弾薬切れは起きず、他作品のチェーンソー燃料・Soul Cube用魂・Blood Punch用チャージで制限しない。Mightyの撃破報酬も他作品の炎による装甲補給などとは分離した。

**必殺の充填量は敵mass由来の1〜4、満タン20という本ゲーム用の未照合値。装備ランチャーの待ち時間、威力・連射なども原作同一ではない。** 詳細・検証：`MIGHTY_DOOM_LOADOUT.md`。

## 実装した戦闘の基礎

78種類の武器・能力アクションを、作品別の装備リストに配分。射撃、散弾、貫通射線、誘導弾、範囲爆発、炎/酸の継続ダメージ、減速、近接、移動、装甲、有限弾薬、既存マップ上の補給箱を扱う。

- クラシックDOOMには基本武器、II系にはSSG、64にはUnmakerを追加。
- Legacy of Rustではプラズマ/BFGを外し、Incinerator/Calamity Bladeを登録。
- DOOM 3にはソウルキューブ、RoEにはGrabber/Artifact。Lost Mission通常版にはチェーンソー・Soul Cube・Artifact・手持ちライトを入れない。
- Soul Cubeは5撃破で使用可能。Glory Killでの回復・チャージ、2016/Eternalのチェーンソー撃破での弾薬補充、燃焼させた敵の撃破での装甲補給を実装。
- 2016とVFRのピストルは弾薬を消費しない。Resurrectionのアサルトライフルは無限予備弾薬。
- Eternalにはドゥームブレイド、Blood Punch、Meathook、Flame Belch、Ice Bomb、Dash、Unmaykr等。TAG1/2ではCrucibleを外し、TAG2にHammerを追加。
- Dark Agesには銃11種、Shield Saw/ガード・短いパリィ窓、Gauntlet/Flail/Dreadmaceを登録。
- 散弾の同時命中は合算して1ダメージ判定にする。設定済みの被弾無敵時間を迂回しない。

## 重要：原作との差分・未実装

以下を『再現済み』とは扱わない。

- **原作のダメージ乱数・連射速度・命中計算・全弾薬上限・全装甲吸収率・難易度差とは一致しない。** 現在のHP、装甲率、射程、クールダウン、弾薬量、複数弾と無敵時間の関係はクロスオーバー用の投影。
- 全武器MODのマスタリー・全強化段階、ルーン、スーツ強化、全パワーアップ、Berserkアイテム、全弱点破壊、細かな敵別処刑条件は未再現。
- 2016/Eternal等は武器を別アクションに展開したAI選択。原作の武器ホイール、装着MOD切替、手動照準・リロード・クイックスイッチ・二段ジャンプ/壁移動を忠実には再現していない。
- Doom 3の弾倉リロード、Grabberによる物理オブジェクト運搬・保持操作・全弾種の照合、Artifactの人間の魂の補給ルール、Soul Cubeの正確なダメージ/帰還、Lost Mission Nightmare時のSoul Cube例外は未実装。
- RPGのターン・属性/成長・NPC会話・便器などの環境物の有限在庫、セントリーボットの独立ユニット運用は未実装。Botアクションは射撃/自爆の投影。
- Unmakerは最大強化相当の複数射線のみ。Demon Key取得と段階別成長なし。Calamity Bladeは最大チャージのみ。
- BFGの全トレーサー条件、原作と同じ射線/範囲/飛翔、Shield Sawの帰還・全相互作用、各防御の原作固有条件は未再現。Ice/スタンは既存ゲームの減速・停止への投影。
- Dark AgesのAtlan搭乗戦・ドラゴン搭乗戦、全Shield Rune/銃の強化・Parry連携は未実装。派生DLCの存在・範囲も含め追加調査が必要。
- Mighty DOOMの4スロット制限・19武器からの選択は追加実装済み。全Slayerタイプ・全スキン・装備の等級/成長/ランダムスキルは未実装。部屋クリア時の副武器再充填、必殺ごとの正確な充填量、必殺発動中の固有無敵や全攻撃演出も未再現。Mini Slayerは引き続き1種のみ。
- Resurrectionのレール進行・遮蔽・固有リロード、VFRのVR操作/テレポート、死亡/チェックポイントや復活によるステージ進行は屋敷シミュレーションに未移植。
- 見た目は共通骨格に作品系列別の鎧・ヘルメット・盾・マント・刃・サイズを加えた2D描画。原作モデルやテクスチャの完全再現ではない。

## 戦闘判定の追加修正

致死炎命中の補給、燃焼期限切れ、処刑技と実際の致死ダメージの区別、壁・無敵に防がれた範囲攻撃の状態異常、壁に固定されたMighty Ballistaの遅延爆発、味方撃破の魂稼ぎ、死亡主体からの発射を修正。人数・耐性・威力・補給量・待ち時間は維持。詳細と再現試験は `SLAYER_IMPACT_SAFETY.md`。

## Grabberの追加改善

捕獲できる弾種と前方/距離/高さ/遮蔽の条件、両方の弾管理配列、最寄り1発の捕獲、2秒待ち、反射後の所有者/誘導先/命中履歴の更新を実装。RoE通常版のRevenantミサイル偏向と、BFG Edition由来Lost Missionの射手への誘導を区別した。物体運搬・保持・小型敵の分解は依然未実装。詳細と根拠は `SLAYER_GRABBER.md`。

## 検証

- `tools/test-slayer.cjs`：27登録、通常/強制二重生成防止、陣営OFF、実ダメージ、弾薬切れ、装甲、Glory/チェーンソー補給、TAG/Lost Mission/Rust装備の混入防止、ウイルス/寄生/ジョーカー/支配/死体変異拒否、デコイ寿命/全滅判定。
- `tools/test-slayer-polish.cjs`：27×5状態をnative Canvasで描画。左右向き・溜め・発動の画素差と描画時の戦闘状態不変。
- `/home/user/slayer-polish-sample.png`：6系列の代表を目視。全27×5は `/home/user/slayer-polish-poses.png`。実ブラウザでの美術・大軍性能の保証ではない。
- `tools/test-slayer-mighty.cjs`：500通りの4枠組合せ、19武器の実ダメージ、自動/手動、待ち時間・ゲージ、Ballista遅延、Crucible5対象、BFGの部屋/通路範囲。
- `tools/test-slayer-ui.cjs`：4枠選択/保存/不正設定の復旧・進行中装備の不変・ゲージ表示に加え、jsdomで陣営選択、27体の開始配置/人数表示、装甲/弾薬表示の切替、900ステップ実マップ戦、OFFにして再開始を確認。
- 全59テスト成功。1123登録/2600通常攻撃、全形態2672攻撃定義のアニメーション監査で欠落0/モック描画エラー0。再生成一致、diff whitespace検査成功。

## 調査元（装備表・作品/主人公の区別。完全照合の合格証ではない）

- https://doomwiki.org/wiki/Weapon — Classic/II/64/3/RPG/RPG II/2016/Eternal/Rustの装備一覧。
- https://doomwiki.org/wiki/Doom_3 — DOOM 3の武器。
- https://doomwiki.org/wiki/Doom_3:_Resurrection_of_Evil — Grabber/Artifactと武器の入替。
- https://doomwiki.org/wiki/The_Lost_Mission — 別主人公、通常/ NightmareのSoul Cubeの違い。
- https://doomwiki.org/wiki/Doom_RPG — 消火器・斧・犬の首輪。
- https://doomwiki.org/wiki/Doom_II_RPG — 武器と主人公候補。
- https://doomwiki.org/wiki/Doom_Resurrection_(iPhone) — レールシューター、無限予備弾薬のARと60発リロード、武器。
- https://doomwiki.org/wiki/Doom_VFR — Dr. Petersの戦闘シャーシと武器。
- https://doomwiki.org/wiki/Weapon_modification — 2016/Eternal/VFRのMOD。
- https://doomwiki.org/wiki/Crucible_(Doom_Eternal) — TAGではCrucible非所持。
- https://doomwiki.org/wiki/Sentinel_Hammer — TAG2の追加武器とチャージ。
- https://doomwiki.org/wiki/Unmaykr — BFGと共用する弾薬、3方向射撃。
- https://doomwiki.org/wiki/Unmaker — Doom 64のDemon Key強化。
- https://doomwiki.org/wiki/Legacy_of_Rust — Incinerator/Calamity Blade。
- https://doomwiki.org/wiki/Calamity_blade — 5段階チャージ（実装は最大のみ）。
- https://doomwiki.org/wiki/Doom:_The_Dark_Ages — 銃カテゴリ、Atlan等。
- https://doomwiki.org/wiki/Mighty_Doom — primary/secondary/ultimate/equipmentの4種枠。

検索取得の抜粋に基づく初期調査。ページの全記載や全版差分を照合したものではない。外部記事の未確認の将来DLC情報を実装根拠として採用していない。

## 火力微調整（DST追加時）

ユーザー指定により、ヒーロー強化の与ダメージ倍率をclassic 6→5.1、modern 10→8.5、mini 8→6.8へ15%低下。HP・防御・武器・速度・テンポ・各版1体・免疫は維持。`DST_AND_LIGHTING_UPDATE.md`参照。
