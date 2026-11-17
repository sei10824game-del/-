# 開始直後の処理負荷改善（2026-10-26）

ユーザーの「改善して」に基づき、調査のみだった段階から性能修正を実施。HTML版対象。人数上限の追加、陣営削減、画質低下、ゲーム速度・AI更新間隔の変更は行っていない。

## 実装

- Slayer hitscan: 距離・射角で候補を絞ってから距離順に一度だけ安定ソート。散弾ごとに同じ相手へ行っていた射線判定を、一発射内の候補ごとの遅延評価に変更。最初の有効命中相手・貫通順・ダメージ集計を維持。
- LOS: 半径が0～半タイルの足元矩形を最大4セルで直接検査。同一呼出し内の連続する同じ矩形だけ再検査を省略。呼出し間キャッシュは使わず、同時刻の壁破壊・編集を即座に反映。広い/特殊な半径は従来処理。
- A*: navigationRadiusが最大0.42タイルなので、タイル中心の足元検査は既存の通行セル検査と同値。この重複を除去。斜め角抜け防止、展開上限、優先順、経路平滑化は維持。
- five/Slayer弾: 距離・矩形・高さなど安価な除外を敵対関係判定より前へ。移動後の座標や生成直後の個体を漏らさないよう、古いSpatialグリッドへの置換はせず走査順を維持。
- 正本は `tools/navigation-performance.js`, `tools/slayer-runtime.js`, `tools/five-fidelity.js`。`python3 tools/embed-five-factions.py` からナビゲーション最適化も含めHTMLへ再埋め込み。

## 同一条件のCPU計測

`PROFILE_LABEL=before/after node tools/profile-startup.cjs`。seed 724126、mid、90 step（ゲーム内3秒）、現行71陣営版で比較。Node VM・実時計・mock canvasによるシミュレーションCPU計測であり、実ブラウザのFPS/GPU/描画速度ではない。単回計測なので環境による変動あり。

| 条件 | 平均ms/step 改善前→後 | 平均削減 | p95 ms 改善前→後 | 最大ms 改善前→後 |
|---|---:|---:|---:|---:|
| 全71陣営、初期960体 | 886.90 → 338.45 | 61.8% | 1830.86 → 506.22 | 2030.36 → 532.22 |
| T/X選択＋中立、初期189体 | 54.98 → 29.90 | 45.6% | 164.12 → 80.33 | 325.58 → 116.74 |

全陣営の終了時個体数は両方786体、2陣営条件は両方188体。初期化時間は全陣営205.46→208.24ms、2陣営134.69→99.21msで、今回の主な改善対象は開始後のシミュレーション処理。全陣営同時戦は改善後も重く、快適なFPSを保証する結果ではない。残る主な負荷はLOS、敵対関係/生存確認、各陣営AIであり、2陣営条件では経路探索も残る。

結果JSON: `research/startup-performance-{before,after}-2026-10-26.json`。旧調査の67陣営計測とは区別する。

## 検証

- 全 `tools/test-*.cjs` 68本PASS（既存67本＋差分試験）。DOM操作・新4陣営・Kirbyコピー・Slayer・壁/移動を含む。
- `tools/test-performance-equivalence.cjs`: 最適化前関数を `performance-reference.cjs` に固定し比較。12,000 LOS（複数半径/タイル境界）、同時刻壁変更、120 A*経路/到達可否、36発射条件（散弾/貫通/beam/holy、正負spread）の命中順/ダメージ、3種弾の衝突結果が一致。
- 差分試験内の20散弾ケースでLOS呼出し11,381→10回。弾の敵対確認はplasma/needler 38→1回、disc 2,846→2回。これは特定fixtureでの回数であり全局面の倍率ではない。
- アニメーション2,726件、未登録0、mock描画エラー0。描画監査1,129種、エラー0（手動材質確認対象32種）。新4陣営のnative canvas試験もPASS。
- 再埋め込み前後のHTML SHA256一致、`git diff --check` PASS。

実行例: `NODE_PATH=/home/user/.cache/detail-verification/node_modules node tools/test-performance-equivalence.cjs`。
