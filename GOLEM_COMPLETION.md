# 未実装能力の追加：Extra Golems 第2回

2026-10-22。HTML版 `mansion_war.html` のみ。Minecraft Mod側は変更していません。

## 今回の範囲

前回残っていたExtra Golemsの能力を中心に追加しました。登録済み**189素材・状態**について親定義と名前付きbrainを解決し、**固有behaviorを持つ70枠／21種類のbehavior**を実行処理へ接続しています。前回「未反映」とした17系統にも処理経路を追加しました。

**これは原作全挙動の完全一致、全陣営の原作全技照合完了を認定するものではありません。** 以下に具体的な実装と残件を区別します。

## 追加・変更

|能力|実装した処理|
|---|---|
|状態効果|Bookshelfのランダム自己強化、Lapisのランダム妨害、Coalの盲目、Leaves／Roots／Melon／Moss／Mushroomの条件付き再生、Sculk Catalystの範囲盲目。原作JSONの確率・対象・抽選数・効果時間を参照。|
|状態効果の実作用|再生、毒、ウィザー、即時回復／被害、攻撃力上昇／低下、耐性、耐火、速度上昇／低下、跳躍変化、浮遊、不可視、発光の16種類。毒はHP1を残し、ウィザーは死亡に至る。強い短時間効果の後ろに弱い長時間効果を保持。|
|発火|Magma被弾時・Nether Brick攻撃時などの条件付き発火。新しい燃焼処理は水濡れ・耐火効果で消火。|
|銅の変化|Copper→Exposed→Weathered→Oxidized。ワックス加工で酸化停止、斧でワックス除去／酸化段階を戻す。被雷で元の銅へ。個体ID・被害を保ち、見た目の色も変化。|
|素材・variant操作|木材を斧で剥ぐ。Redstone Lampの点灯／消灯を手動切替。Furnaceの燃料に応じたvariant。|
|サンゴ|乾燥時の死んだサンゴへの変化、水濡れ時の復元。素材名だけでなく種族定義・見た目も変更。|
|範囲環境作用|Spongeの吸水／水没植物の除去、Iceの水の凍結、Strawの作物成長。原作のtick間隔・範囲・確率・成長段階を使用。|
|設置|Moss carpet、キノコ、Nether fungus／wart、花、Sculk veinを床の別レイヤーへ配置・描画。Nether wartはSoul Sand、花は対応する土などの生存条件を検査。|
|発光|Glowstone／Froglight／Sea Lantern等の光量と、Furnace／Redstone Lampのvariantに応じた光を実際の照明へ反映。|
|動力|Redstone Golemから動力を供給。配置したredstone wireで減衰伝播し、配置したlampを点灯・消灯。|
|日光|Boneは屋外・昼・晴れ・頭装備なしの条件で発火し、屋根のある場所へ逃げる。館は初期状態では屋内。室内で無条件に日焼けする処理にはしていない。|
|追従・誘引|Emeraldは原作の8ブロック探索／4ブロック停止条件で村人に追従。稼働中のFurnaceは石炭を持つ対象への誘引に対応。手持ちの素材在庫がなくなれば誘引条件を失う。|
|TNT|繰り返し使う汎用範囲攻撃を廃止。攻撃・被弾・火・点火道具で導火線に点火し、50tickで自爆。水濡れで解除・リセット、死亡時にも爆発。原作JSONの爆発強度8を使用。|
|射撃・弾薬|Dispenserの矢とNether Brickのfire chargeを在庫から装填・消費。空なら射撃せず、近接攻撃へ。矢は初速・重力・減速・速度依存の被害・床／壁への落下と回収を持つ専用弾。SmallFireballは直接被害＋発火で、汎用ロケット爆発にはしない。射線上の他個体が遮る場合は発射・消費を見送る。|
|召喚|Amethyst被弾で回収可能なamethyst shard。Honeycomb被弾で実体のミツバチを召喚。ミツバチは指定相手を一度刺し、通常難易度相当の2被害＋10秒の毒。刺針喪失後は原作の経時死亡判定。銅の屋外雷雨時の落雷にも接続。|
|Furnace燃料|素材在庫から燃料を消費。通常Minecraftの248燃料候補をタグから展開し、非可燃性木材を除外。木材・溶岩バケツなども対応し、容器を返却。最大燃料102400、10tickごとに1消費、無燃料停止を維持。|
|Crafting Golem|3×3作業台と素材在庫を追加。Vanilla 1.20.1の定形590件＋不定形232件＝822レシピ、99のitem tagを内蔵。位置ずらし・左右反転・タグ材料・不定形の組み合わせを照合し、完成時に実材料を消費して完成品を在庫へ加える。素材不足なら在庫を変更せず失敗。|

Iceの「冷気の波」とTNTの「爆発衝撃」は原作の環境凍結・導火線処理へ置換しました。そのため通常攻撃リストの件数は単純増加しません。新しい能力の多くは、被弾時・死亡時・環境・相互作用の経路にあり、通常技件数には含まれません。

## 操作

1. 対象を選択し、詳細パネルの **「素材・環境操作」** を開く。Crafting Golemでは **「／3×3作業台」** と表示。
2. アイテムID（例：`coal`、`arrow`、`fire_charge`、`honeycomb`、`iron_axe`、`oak_log`）と個数を入力して観戦用在庫へ追加。
3. 在庫の素材を選択し「選んだ素材を対象に使用」で装填・燃料投入・素材加工・点火を行う。Furnaceの詳細パネルからの投入も同じ在庫を消費する。
4. Crafting Golemでは3×3の各枠に材料を指定し、「クラフト」で作成。素材を複数枠に指定した場合も必要個数を検査する。
5. 「対象に持たせる」で誘引用の手持ちを設定できる。「周辺のドロップ回収」で近くの破片・矢を回収する。
6. 環境操作で天候・昼夜・その部屋の屋根・足元の水を変更できる。素材設置では土／Soul Sand／redstone wire／lamp等を配置できる。これらは実際の能力条件に作用する。

**「観戦用に素材を追加」や屋根／天候の変更は検証・観戦操作です。採掘・全NPCの採集経済・Minecraftプレイヤーの完全な所持品システムを作ったという意味ではありません。** 在庫・設置物・環境条件は新しいゲーム開始時にリセットします。操作ウィンドウは定期HUD更新で作り直さず、入力中の値を維持します。

## 依然として残る内容

### 今回触れた機能の完全一致までは未確認

- Minecraftの3D地形、流体伝播、全ブロック生存条件、氷の摩擦、全照明・レッドストーン機構（リピーター／コンパレーター／垂直配線など）。動力は今回追加した床のwire／lampネットワークで動作する。
- TNTの材質硬度に応じた館の破壊、全3D遮蔽露出率、死亡時のポーション残留雲。爆発の遮蔽は館の既存LOSを使用。
- 原作の防具・難易度・エンチャント・NBTを含む矢の全挙動、特殊矢の薬効、弾薬インベントリの元ゲームと同じスロット構造。
- 幼体の全成長条件・正確な能力補正、ミツバチの巣／花粉／繁殖を含む全ライフサイクル。
- 特殊クラフト14種（染色・地図複製・本複製・花火・耐久修理・NBT付きアイテム等）。822件は通常の定形・不定形レシピの件数であり、これらまで含めた全クラフトとは言っていない。
- Forgeの追加Mod燃料、全採掘・資源採集、NBT保存復元。
- 他作品キャラクターへMinecraftの状態効果を適用した際の作品別の完全な耐性表。不可視の視覚距離や浮遊等は既存館エンジンへの接続部分が残る。

### 他陣営の残件

DOORSの部屋・扉・アイテムを含む遭遇進行、EXEのSoul等、物体Xの自由変形／新鮮死体同化、DOOM全ボスフェーズ、コヴナントの作品別兵器・搭乗／乗員などは今回の変更では未完です。横断監査の未照合48陣営も、照合完了へ変更していません。

## 出典と再生成

- Extra Golems：`dev-1.20.1`、コミット **b70f8036489b5e23e1bec5b0453e481baba5c480**。
  https://github.com/MinecraftModDevelopmentMods/Extra-Golems/tree/b70f8036489b5e23e1bec5b0453e481baba5c480
- 各素材・親・brainの直接出典は `research/restored-golem-behaviors.json` の `source`／`sourceChain` に保存。対応するJava behavior、`util/TargetedMobEffects`、`entity/goal/FollowGoal`も照合。
- レシピ／タグ： https://github.com/misode/mcmeta/tree/2dedcb96cc58788e8b0206c93ae5e61faea2ed19/data/minecraft （1.20.1）。
- 通常燃料・ミツバチの基礎値： https://github.com/mahtomedi/minecraft/tree/6ac5fe18be48a7395be84148be051908111d6772/src/main/java/net/minecraft 。それぞれ`AbstractFurnaceBlockEntity`、`Bee`。
- 元ゲームの画像・音声は取り込まず、Canvasで描画。既存のExtra Golemsライセンスを維持。
- `tools/import-golem-behaviors.py` は上記ソースの`src/main/resources/data/golems/golems`を引数にして全189枠を解決する。ゲームは出典ファイルを実行時ダウンロードせず、データをHTMLへ内蔵する。
- 埋め込み：`python3 tools/embed-five-factions.py`。再実行の同一性を確認。

## 検証

- `node tools/test-golem-completion.cjs`：189素材・70behavior枠、状態効果、素材変化、在庫、環境、追従／誘引、日光、動力、導火線、弾薬、実際の弾の更新、破片、ミツバチ、822レシピ全件の具体的材料からのクラフト、全素材を含むsimulation、再開始。
- `tools/test-golem-ui.cjs`：jsdomによる実DOMのパネル／入力／選択／作成／素材不足／燃料投入／ウィンドウ終了。任意依存`jsdom`を用意し、`NODE_PATH=<インストール先>/node_modules node tools/test-golem-ui.cjs`で実行。
- 既存17テスト：restored-abilities、expansion、five-fidelity、combine、village、mc-factions、five-factions、wall-animation、crowd-facing、defense-settings、exe-factions、no-faction-caps、zombie-reinforcement、devils-population、pit-drone、combat-pass、balance-pass。
- 登録1055枠・通常2143定義、形態を含む2215定義の描画監査で欠落0・mock描画エラー0。

VM／mock Canvas／jsdomでの検証です。実ブラウザの見た目・操作感・大軍勢での性能や原作全能力の完全一致を保証するものではありません。
