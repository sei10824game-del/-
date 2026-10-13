# 洋館の黙示録 (yakata) — Minecraft Java 26.3 / Fabric

スーパーフラットの出生地に洋館(3x3部屋・約37x37)が一度だけ建ち、感染者・怪物の12陣営が各部屋(と前庭)に湧いて殺し合う。
村人(生存者)を殺すと、その陣営の感染者が生まれる。ウイルス陣営(t/G/T-ベロニカ)に倒された化け物は感染体として蘇る。

## 導入
1. Java 25 / Minecraft Java 26.3 / Fabric Loader 0.19.5+ / Fabric API (26.3版)
2. `dist/yakata-1.0.0.jar` を `mods/` に入れる
3. ワールド作成でスーパーフラット (MODが既定にする)。専用サーバーは `level-type=minecraft\:flat`

## コマンド
`/yakata info` `/yakata build`(op) `/yakata factions` `/yakata spawn <陣営|mob> [数]` `/yakata clear` `/yakata kills`
`/yakata sidebar` `/yakata director <bool>` `/yakata seed` `/yakata homes` `/yakata count <陣営>` `/yakata event <名前>`

`/yakata factions` は頭数・戦果・キル表(行=攻撃側)・特殊イベントの回数 (siren, makima_control, flood_takeover, necro_reanimate, tv_pollen_conversion ...) を表示する。

## 陣営

| 陣営 (id) | 本拠地の希望 | Mob | 仕組み |
|---|---|---|---|
| t-ウイルス (`tvirus`) | library | t_zombie, crimson_head, licker, tyrant★ | ウイルス: 倒した化け物は 50% で t-ゾンビとして蘇る |
| G-ウイルス (`gvirus`) | cellar | g_birkin★(3形態), g_adult, g_embryo | ウイルス。バーキンはキル/時間で変異、成体は胚を産む |
| 冬虫夏草 (`cordyceps`) | kitchen | cordyceps_runner, _clicker, _bloater | 胞子で鈍化・弱体化 |
| ゼノモーフ (`xeno`) | bedroom | xeno_facehugger, _drone, _warrior | 酸の血。フェイスハガーが寄生 → 10秒後にチェストバスター |
| 寄生体 (`parasite`) | gallery | parasite_swarmer, _crawler, _assimilated | 同化人間が群体虫を吐く |
| フラッド (`flood`) | hall, dining | flood_infector, _combat, _carrier, _pure, flood_juggernaut★ | 感染体が弱った(体力35%以下)村人/Mobに取り付いて戦闘体化、死体にも這い寄る。倒した者は45%で戦闘体化。キャリアーは破裂して感染体を放出 |
| ネクロモーフ (`necromorph`) | dining, study | necro_slasher, _leaper, _exploder, _infector, necro_brute★ | 四肢切断(頭は0.5倍、腕/脚は1.3倍で切断→攻撃/速度低下、致命傷を四肢で肩代わり)。インフェクターが死体を再起動。ブルートは正面装甲 |
| プラーガ (`plaga`) | study, dining | plaga_ganado, plaga_garrador, plaga_parasite | ガナードは斧/ピッチフォーク/松明/鎌。頭を潰すと首からプラーガ。ガラドールは盲目・背中が弱点。**他陣営の感染を一切受けない** |
| T-ベロニカ (`tveronica`) | dining, hall | tv_alexia★(2形態), tv_bee, tv_albinoid, tv_nosferatu, tv_zombie | ウイルス。アレクシアの血は燃え(攻撃者発火)、倒すと巨大植物体の第2形態へ。花粉で村人が感染者化。放電・毒ガス |
| サイレンヘッド (`sirenhead`) | yard (前庭・屋外) | siren_head★(専用の細長いモデル), siren_long_horse★, siren_cartoon_cat | サイレン: event.raid.horn を音量10〜16(160〜256ブロック)で鳴らし、14ブロック以内を難聴(ダメージ+鈍化+吐き気)、80ブロック以内の獲物のないMobと生存者を誘引。声真似 |
| マキマ (`makima`) | study, library | makima_devil★, makima_agent | 視界内の明らかに弱い(戦力半分未満)Mobを見ただけで支配。視界内で倒された者は寝返る。支配下の種類から攻撃を借りる。致命傷は支配下を身代わりに全回復。感染/支配無効 |
| チェンソーマン (`chainsaw`) | hall, kitchen | chainsaw_denji★(2形態), chainsaw_power★, chainsaw_aki★ | デンジは連撃で吸血回復、倒れると黒いチェンソーマン(大型・4本腕)へ。第2形態は倒すたびに恒久成長(正面で目撃した弱い敵がいれば更に)。感染/支配無効。マキマの宿敵 |

★ = ボス級 (ウイルス蘇生・支配・乗っ取りの対象外、同時数制限あり)

部屋は9室 (ロビーは生存者用) で陣営は12あるため、希望順に空き部屋→宿敵のいない最も空いた部屋の順で割り当て、
同じ部屋の陣営は部屋の対角に分ける。サイレンヘッドは天井 (高さ6) に収まらないので前庭に棲む。

### 陣営を追加するには
`src/main/java/jp/yakata/faction/entity/<Name>Mobs.java` に `Faction.builder(id)...register()` (名前・色・本拠地・宿敵・上限・初期配置・転化先・フラグ・フック) と
`FactionEntities.register(...)` (モデル種別・属性・重み・同時数上限・ボス・マキマが借りる攻撃) を書き、`Factions.bootstrap()` に1行足す。
あとはテクスチャ (`tools/gen_faction_textures.py`) と lang を追加するだけで、ディレクター・コマンド・サイドバー・集計・転化に自動で組み込まれる。

## ビルド
`JAVA_HOME=<JDK25> ./gradlew build` → `build/libs/yakata-1.0.0.jar`
テクスチャ再生成: `python3 tools/gen_faction_textures.py` (Pillow)
