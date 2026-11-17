# Mighty DOOM：4枠装備と発動方式の追加実装

## 今回の範囲

Doom Slayer陣営の `sl_mighty` だけに専用装備管理を追加。陣営全27版、Mini Slayer各種1体、感染・寄生・支配・変身／転換無効は維持。他作品の装備・操作・弾薬ルールは変更しない。

| 枠 | 候補 | 発動 |
|---|---|---|
| 主武器 | Heavy Cannon / Combat Shotgun / Plasma Rifle / Chaingun / Burst Rifle | 射程内の知覚した敵へ自動、移動・他の攻撃中も作動 |
| 副武器 | Rocket Launcher / Ballista / Super Shotgun / Gauss Cannon / Sentinel Hammer | 手動J、または観戦AI。使用後10秒待ち |
| 必殺 | Chainsaw / Crucible / BFG9000 / Unmaykr | 手動K、または観戦AI。満タン時のみ使用、使用時ゲージ消費 |
| 装備ランチャー | Frag Grenade / Flame Belch / Ice Bomb / Arc Grenade / Acid Spit | 射程内の知覚した敵へ自動、再使用待ちあり |

開始前画面の4セレクトで各1つを選ぶ。全19武器を同時には使えない。開始時に専用の4件の `atkList` と凍結した装備スナップショットを作る。メニュー変更は次回ゲーム開始時に適用し、生存中の装備を変更したり、ゲージや待ち時間をリセットしたりしない。設定はlocalStorage保存。不正JSONや別枠の武器IDは安全な初期設定へ復旧する。

主武器・装備は通常の手動攻撃候補から除外し、専用の自動処理から発動する。未装備武器、充填前の必殺、待ち時間中の副武器は `canUse` だけでなく発射処理からも拒否する。主武器・副武器・装備の発動にFPS版の弾薬・燃料・Blood Punch等の資源を要求しない。

## 作品別の機能差

- Burst Rifle：コンバットショットガンの24散弾ではなく、同じ方向への3発バーストに分離。
- Mighty Ballista：貫通レールではなく、敵に付着し、敵の移動を追って2秒後に爆発する方式。2秒は本ゲーム用の未照合値。
- Sentinel Hammer：FPS版のGlory Killチャージを要求せず、副武器10秒待ちで周辺へ衝撃・減速。
- Arc Grenade：範囲内にダメージと減速を与える。
- Crucible：単体FPS近接ではなく、最大5体へ攻撃。ただし原作の演出・瞬間移動・無敵を完全には再現していない。
- BFG：FPS版の飛翔弾とは別に、現在の部屋内へ攻撃する。部屋IDのない廊下では射程・壁で制限し、同じ廊下IDのマップ全体には当てない。

## 充填と残る原作差分

必殺は開始時0。実際に撃破した敵で充填し、味方・ホログラム・Takenの弾体では充填しない。時間経過や補給箱でも充填しない。

**充填量は敵massを元に1〜4、満タン20のクロスオーバー用仮値で、原作の武器別・敵別の表とは一致未確認。** 装備の待ち時間10秒、威力・連射・範囲・状態異常時間も未照合。本変更を完全原作再現とは呼ばない。原作と同じ部屋クリア時の副武器再充填、全武器強化/スキル/等級/レベル/元素派生、全Slayerタイプ/スキン、必殺中の全固有保護/演出は未実装。

原作では副武器/必殺はプレイヤーが操作するが、このHTMLの観戦モードではAIが選択する。手動操作ではJ／Kへ割当。タッチの通常攻撃／別技も同じ経路を使う。

## 正本と検証

- `tools/slayer-mighty-runtime.js`：4枠候補、設定検証・保存、実戦装備、資源・待ち時間、自動/手動、Mighty専用攻撃。
- `tools/slayer-runtime.js`、`tools/player-control.js`、`tools/embed-slayer.py`、`tools/embed-five-factions.py`：接続。
- `research/mighty-doom-loadout.json`：候補と未照合の充填/待ち時間データ。
- `tools/test-slayer-mighty.cjs`：500通り、19武器の実ダメージ、未装備拒否、弾薬不要、10秒境界、充填/消費/味方撃破で稼げないこと、移動中の自動射撃、Ballista付着・追従・遅延、Crucible最大5体、BFG廊下範囲、J/K経路。
- `tools/test-slayer-ui.cjs`：4枠/19候補、保存・復旧、進行中の装備不変、充填表示、実マップ900ステップ、陣営OFFの再開始。jsdom試験でありブラウザ画像や大軍性能の認証ではない。
- 全58テスト成功。全形態2672攻撃定義で欠落0・モック描画エラー0。1123種の描画監査でエラー0（手動確認マーカー26）。再生成一致と `git diff --check` 成功。

## 調査元

2026-10-23の検索抜粋で確認：
- https://doomwiki.org/wiki/Mighty_Doom — 4枠、19武器、副武器10秒、開始時は必殺無効・撃破充填、装備自動発動。
- https://doom.fandom.com/wiki/Weapon — Burst Rifleの3発、Crucible最大5体、Mighty BFGの部屋全体攻撃。
- https://doom.fandom.com/wiki/Ballista — Mighty版は付着後の遅延爆発。
- https://doomwiki.org/wiki/Gauss_cannon — Mighty版の副武器10秒と等級による差（等級差は今回未実装）。

調査と実装は部分的であり、全記載・全強化の照合済みという意味ではない。DOOM全体の不足分は `DOOM_SLAYER.md` に継続記録する。

追加修正：壁に当たったBallistaも壁手前に固定されて遅延爆発する。Hammer/Arcの状態異常は実ダメージが通った対象のみに付与する。詳細：`SLAYER_IMPACT_SAFETY.md`。
