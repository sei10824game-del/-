> 追加更新：`CONTACT_AND_GORE_NEST.md`。密集時の攻撃不発を修正し、遺骸運搬・儀式・ゴアネスト開通・警報増援・心臓の除去を追加。以下の「ゴアネスト未実装」は前回時点の記録。魂工場・自然繁殖・製造工程は引き続き未実装。

# DOOMは今どう増えているか

## 結論

**現行HTMLは、魂の分離・ゴアネストの構築・自然繁殖・製造工場という4経路のライフサイクルを実装していない。** 現在は主に戦闘中の召喚、死体蘇生、ロストソウル放出、一時的な分身／反応召喚で増える。初期配置の既定値は合計12体のまま。12は最大同時個体数ではなく、増援・召喚への人数上限はない。

## コード上の現状

正本は `tools/five-factions-runtime.js` と `tools/five-fidelity.js`。

|処理|現行動作|原作再現の注意|
|---|---|---|
|`demonspawn`|使用1回で `dm_imp_classic` を2体、使用者の近くに配置|作品・遭遇ごとの召喚候補を使い分けていない。2016/Eternal等の召喚者でもClassic Impが出る汎用処理が残っている。完全な原作再現ではない|
|`lostsouls`|使用1回でClassic Lost Soulを3体|所持する個体の死亡時にも3体を出す。作品別の違いは未完|
|`resurrect` / `revive`|近くの同陣営の死体を消費し、同種を再出現|Classic Arch-vileには対象の種類・切断等の除外がある。今回、死亡時に保存した `canonGib` も除外に反映し、粉砕死体の情報が判定から抜ける問題を修正|
|`seekers`|使用1回でDoom 3 Seekerを2体|全使用者に同じ汎用候補を使っている|
|Marauderの反応|防御中の特定攻撃への反応でSpirit Wolfを呼ぶ|通常の人間や死体からの変換ではない|
|`clone`|同種の一時的な分身を1体出す|10秒で消失。分身から同じ分身技を取り除き、再帰増殖はさせない|
|`possess`|現状は味方への一時強化に流れている|人間をPossessedに変える処理ではない。Spiritの本編どおりの憑依でもない|

これらの技はAIの標的・距離・クールダウン等で使用される。全個体が一定時間ごとに自然繁殖する処理ではない。召喚先に立てる場所がない場合や陣営が無効の場合、スポーンは失敗する。

## 提示された4経路と資料の照合

### 1. 人間の魂と肉体／Lazarus Wave

- Nekravolでは、犠牲者を拷問して魂を抽出し、魂から得たHell essenceとWraith energyを組み合わせてArgent energyを作る。残された肉体が地獄で時間をかけて悪魔へ変わる、という説明がある。
- Lazarus Wave等によるPossessed化は別の経路として説明される。
- ただし、この説明から「すべての作品の全悪魔が元人間」「必ず数千年後にImpになる」と一律に扱うことはしない。今回の確認資料では、その固定時間と種の対応まで確定していない。
- **HTMLには魂・地獄側の処理施設・抜け殻の変異・Lazarus Waveによる人間の転換は未実装。**

資料：
- https://doomwiki.org/wiki/Nekravol
- https://doomwiki.org/wiki/Nekravol_-_Part_II
- https://doomwiki.org/wiki/Argent_energy
- https://doomwiki.org/wiki/Hell

### 2. Gore Nest

- 犠牲者の遺骸を集めて儀式を行い、地獄へ通じる門を作って悪魔を呼ぶ、という説明が確認できる。
- **「召喚されて到着する」と「その場で新しい悪魔が生まれる」は区別する。** 今回確認した資料だけでは、蓄積した生体エネルギーからあらゆる種類を孵化させる施設とまでは認定しない。
- **HTMLには死体の回収・儀式・巣の形成・巣のポータルからの増援は未実装。** 現在の `demonspawn` をゴアネスト再現と呼ぶことはできない。

資料：
- https://doomwiki.org/wiki/Gore_nest
- https://doom.fandom.com/wiki/Gore_Nest （ゲーム内説明文の転載）

### 3. 自然繁殖

- Spectreには、実験個体が地獄へ戻った後に繁殖し、能力が子孫に伝わったと推測される記述がある。ただし繁殖方法自体は不明とされている。
- これは「ピンキー系に子孫の記述がある」ことの根拠になる。一方、カコデーモンも含めた全種のつがい・近親交配・妊娠時間・一腹の数まで推定して実装する根拠にはしない。
- **HTMLには悪魔のつがい・妊娠・産卵・幼体成長・遺伝は未実装。**

資料：
- https://doom.fandom.com/wiki/Spectre/Doom_(2016) （Codexの "It is unknown how the Spectre managed to breed" と子孫への遺伝）
- https://doomwiki.org/wiki/Spectre_(Doom_2016)

### 4. 技術的な改造・製造

- 2016のRevenantには、人間の軍事要員へ装備を取り付け、Lazarus Waveへ繰り返し曝露して変貌させる設定がある。
- 素体・装備・工程は種と作品ごとに区別する。例えば通常のMancubusの生物としての成長とCyber-MancubusのUACによる改造を、すべて同じ工場製造とは扱わない。
- **HTMLには素体の搬入、装備・資材、処置、工場による生産は未実装。**

資料：
- https://doomwiki.org/wiki/Revenant_(Doom_2016)
- https://doomwiki.org/wiki/Mancubus_(Doom_2016)
- https://doom.fandom.com/wiki/Cyber-Mancubus/Doom_(2016)

## 検証と方針

`node tools/test-doom-growth.cjs` で実際の汎用召喚数・死亡時放出・死体消費・粉砕死体の除外・狼・期限付き分身を確認した。これは現在の動作を検証するテストであり、汎用の召喚候補が原作どおりだという認定ではない。

この更新で、未検証のカコデーモン交配や、数千年を数秒に変える人間→Imp生成を勝手に追加してはいない。ライフサイクルの実装は未完のまま明示する。
