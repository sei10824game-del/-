# 洋館の黙示録 (yakata) — Minecraft Java 26.3 / Fabric

スーパーフラットの出生地に洋館(3x3部屋・約37x37)が一度だけ建ち、感染者の5陣営
(t-ウイルス / G-ウイルス / 冬虫夏草 / ゼノモーフ / 寄生体) が各部屋に湧いて殺し合う。村人(生存者)を殺すと、その陣営の感染者が生まれる。

## 導入
1. Java 25 / Minecraft Java 26.3 / Fabric Loader 0.19.5+ / Fabric API (26.3版)
2. `dist/yakata-1.0.0.jar` を `mods/` に入れる
3. ワールド作成でスーパーフラット (MODが既定にする)。専用サーバーは `level-type=minecraft\:flat`

## コマンド
`/yakata info` `/yakata build`(op) `/yakata factions` `/yakata spawn <陣営|mob> [数]` `/yakata clear` `/yakata kills` `/yakata sidebar` `/yakata director <bool>`

## ビルド
`JAVA_HOME=<JDK25> ./gradlew build` → `build/libs/yakata-1.0.0.jar`
