# HTML版：全種の攻撃定義監査

対象: 1208種、攻撃リスト合計2885件。

**これは実装一覧であり、原作準拠の合格表ではありません。全種の原作技数は未検証です。** 原作の作品・版・形態によって技が異なり、通常技以外のAI、召喚、死亡時能力、必殺技はこの件数に含まれません。条件付きの技の実戦到達性も別途確認が必要です。技数を水増しするための汎用攻撃追加はしていません。

## 再実行

`node tools/audit-creatures.cjs`（外部依存なし）。定義の名前・ダメージ値の検査と、全種×3画質のモックCanvas描画を実行。実ブラウザの見た目・操作・性能を保証するテストではありません。

## 全種一覧

|ID|名前|陣営|定義数|実装済み技（原作照合は未完了）|
|---|---|---|---:|---|
|human|避難民|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|dog|飼い犬|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|cat|猫|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|rat|ネズミ|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|crow|カラス|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|zombie|ゾンビ|T|4|噛みつき / 組み付き / 飛び掛かり / 胃液吐き|
|crimson|クリムゾンヘッド|T|4|爪の乱舞 / 飛び掛かり / 深爪 / 走り爪|
|licker|リッカー|T|4|舌鞭 / 飛び掛かり / 爪引き裂き / 走り爪|
|hunter|ハンター|T|4|タロン連斬 / 首狩りの Leap / 突進斬り / 走り爪|
|zdog|ゾンビ犬|T|4|飛び掛かり / 喉喰い / 噛みつき / 走り噛みつき|
|zcrow|ゾンビカラス|T|3|急襲くちばし / 鉤爪 / 走りパンチ|
|tyrantX|タイラント(Mr.X)|T|7|裏拳 / 掌底砕き / 掴み投げ / ダブルスレッジ / ラリアット / 走りラリアット / 走り掴み|
|tyrant002|タイラントT-002|T|3|爪薙ぎ / 双爪 / 掴み串刺し|
|nemesis|ネメシス|T|8|触手突き / 触手引き寄せ / 重拳 / ロケットランチャー / マシンガン / 火炎放射 / 走り掴み / 走りアッパー|
|drone|ゼノモーフ・ドローン|X|6|爪 / 尻尾鞭 / 内顎頭噛み / 飛び掛かり / 捕獲 / 走り爪|
|warrior|ゼノモーフ・ウォリアー|X|5|連爪 / 尻尾槍 / 内顎頭噛み / 捕獲 / 走り爪|
|berserker|ゼノモーフ・バーサーカー|X|4|地砕き / 狂乱の乱舞 / 頭突き突進 / 走り体当たり|
|runner|ゼノモーフ・ランナー|X|4|飛び掛かり / 尾斬り / 内顎噛み / 走り噛みつき|
|praetorian|ゼノモーフ・プラエトリアン|X|5|重爪 / 尾圧砕 / 酸吐き / 突進 / 走り体当たり|
|predalien|ゼノモーフ・プレデリアン|X|5|外顎爪 / 双顎噛み / 殴打投げ / 直接植え付け / 走り体当たり|
|queen|ゼノモーフ・クイーン|X|4|爪薙ぎ / 尾薙ぎ / 内顎 / 威嚇の咆哮|
|hugger|フェイスハガー|X|1|跳躍寄生|
|burster|チェストバスター|X|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|dangel|デスエンジェル|D|5|前爪斬り / 音速飛襲 / 挟み潰し / 飛びかかり押さえつけ / 走り噛みつき|
|daqueen|デスエンジェルクイーン|D|6|大爪断頭 / 音速飛襲 / 絶叫衝撃波 / 挟み潰し / 飛びかかり押さえつけ / 走り噛みつき|
|headcrab|ヘッドクラブ|H|1|跳躍|
|hczombie|ヘッドクラブゾンビ|H|2|引き裂き / 振り回し|
|hcfastz|ヘッドクラブファーストゾンビ|H|3|飛び掛かり / 乱れ引き / 走り爪|
|hcpoisonz|ヘッドクラブポイズンゾンビ|H|3|毒撃 / 毒液吐き / 毒クラブ投擲|
|zombine|ゾンバイン|H|3|引き裂き / 振り回し / 走りパンチ|
|gonome|ゴノーム|H|4|裂き爪 / 胃囊吐き / 捕食噛み / 走り爪|
|gonarch|ゴナーチ|H|3|巨爪払い / 酸吐き / 踏み潰し|
|babycrab|ベビーヘッドクラブ|H|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|hcfast|ファーストヘッドクラブ|H|1|跳躍|
|hcpoison|ポイズンヘッドクラブ|H|1|跳躍|
|hcarmor|アーマードヘッドクラブ|H|1|跳躍|
|hcrevive|リバイブドヘッドクラブ|H|1|跳躍|
|hcarmz|アーマードヘッドクラブゾンビ|H|2|引き裂き / 重撃|
|revivedz|リバイブド・ゾンビ|H|2|引き裂き / 飛び掛かり|
|revfastz|リバイブド・ファーストゾンビ|H|3|飛び掛かり / 乱れ引き / 走り爪|
|revpoisonz|リバイブド・ポイズンゾンビ|H|2|毒撃 / 毒液吐き|
|gcommon|通常感染者|G|3|引っ掻き / 殴りつけ / 走り爪|
|boomer|ブーマー|G|2|胆汁吐き / 引っ掻き|
|ghunter|ハンター(L4D)|G|3|飛び乗り / 爪 / 走り爪|
|gsmoker|スモーカー|G|3|舌巻き付け / 爪 / 走りパンチ|
|tank|タンク|G|4|殴り飛ばし / 岩投げ / 地面叩き / 走り体当たり|
|witch|ウィッチ|G|4|引き裂き爪 / 馬乗り引き裂き / 狂乱の爪 / 疾走引き裂き|
|charger|チャージャー|G|4|猛突進 / 巨腕殴り / 掴み叩きつけ / 走り掴み|
|spitter|スピッター|G|3|酸吐き / 引っ掻き / 走りパンチ|
|jockey|ジョッキー|G|3|飛び乗り / 引っ掻き / 走り爪|
|crunner|ランナー|C|3|引っ掻き / 噛みつき / 走りパンチ|
|cstalker|ストーカー|C|3|待ち伏せ突き / 噛みつき / 走り爪|
|cclicker|クリッカー|C|2|捕食噛みつき / 走り爪|
|cbloater|ブローター|C|2|巨腕殴打 / 胞子嚢投擲|
|cshambler|シャンブラー|C|2|引っ掻き / 沸騰胞子噴出|
|cratking|ラットキング|C|2|巨腕なぎ払い / 融合体の踏みつけ|
|wspike|ホワイトスパイク|W|4|連爪 / 跳び掛かり / 尾スパイク射出 / 走り爪|
|wsqueen|ホワイトスパイククイーン|W|3|爪薙ぎ / 尾薙ぎ / 召喚の叫び|
|antlion|アントライオン|A|3|ハサミ斬り / 飛び掛かり / 走り噛みつき|
|aworker|アントライオンワーカー|A|3|ハサミ斬り / 酸飛ばし / 走り噛みつき|
|aguard|アントライオンガード|A|3|体当たり / ハサミ挟み / 走り噛みつき|
|aguardian|アントライオンガーディアン|A|3|酸毒ハサミ / 毒液飛ばし / 走り噛みつき|
|aking|アントライオンキング|A|2|王者の突進 / 巨体衝撃|
|agrub|アントライオングラブ|A|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|aqueen|アントライオンクイーン|A|2|巨ハサミ挟み / 産卵嚢の振り払い|
|scp939|SCP-939 成体|S|3|噛み裂き / 呼び寄せ / 走り噛みつき|
|scp939pup|SCP-939 幼体|S|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|jeff|ジェフ・ザ・キラー|J|4|喉切り / 家具破壊突撃 / めった刺し / 走り斬り|
|ghostface|ゴーストフェイス|F|4|刺突 / 連続刺し / 物陰からの奇襲 / 走り斬り|
|chara|キャラ|K|3|ナイフ / DETERMINATION斬り / 走り斬り|
|skynet|スカイネット・コア|M|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|t600|T-600|M|2|重機関銃 / 殴打|
|t800|T-800|M|5|ショットガン / 拳 / 掴み投げ / ヘッドバット / 走りパンチ|
|t850|T-850|M|3|プラズマ / 拳 / 走り体当たり|
|t1000|T-1000|M|4|刃腕 / 槍腕突き / 液体金属の抱擁 / 走りパンチ|
|tx|T-X|M|3|プラズマキャノン / 内蔵刃 / 走りパンチ|
|t3000|T-3000|M|2|ナノ切断 / 走りパンチ|
|rev9|Rev-9|M|2|分離殴打 / 走りパンチ|
|marcus|マーカス・ライト|M|2|エンドアーム / 走りパンチ|
|t5000|T-5000|M|3|ナノ感染 / 殴打 / 走り体当たり|
|hkaerial|HK-エアリアル|M|1|プラズマ爆撃|
|hktank|HK-タンク|M|2|プラズマ砲 / 履帯蹂躙|
|harvester|ハーベスター|M|1|捕獲アーム|
|moto|モト-ターミネーター|M|1|体当たり|
|hydrobot|ハイドロボット|M|2|締め付け / 走り噛みつき|
|t1|T-1|M|1|ガトリング|
|smile|スマイル|Y|3|Grin / にやけ顔の凝視 / 走りパンチ|
|nottoru|取り憑かれ(自害待ち)|Y|2|殴打 / 走りパンチ|
|chucky|チャッキー|Q|4|人形ナイフ / めった刺し / アキレス腱斬り / 走り斬り|
|megan|ミーガン|B|3|精密斬撃 / 突進 / 走り斬り|
|pfort|ネザーポータル|P|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|piglin|メイス・ラント|P|1|メイス打撃|
|piglinxbow|ブレイズ・ラント|P|1|ブレイズロッド投擲|
|pbrute|ブルート（Legends）|P|2|重武器振り下ろし / 重武器薙ぎ|
|hoglin|ウォーボア|P|1|牙の突進|
|pillager|ピリジャー|R|1|クロスボウ|
|vindicator|ヴィンディケーター|R|2|鉄斧 / 走り斬り|
|mwitch|ウィッチ(MC)|R|1|ポーション|
|evoker|エヴォーカー|R|3|牙の呪い / 杖打ち / 走りパンチ|
|ravager|ラヴェジャー|R|4|体当たり / 咆哮 / 噛みつき / 走り噛みつき|
|scp096|SCP-096|I|4|引き裂き / 絶叫の乱打 / 頭部粉砕 / 絶叫タックル|
|scp173|SCP-173|3|1|首折り|
|scp049|SCP-049|4|1|ペストの手|
|scp0492|SCP-049-2|4|1|殴打|
|kayako|伽倻子|U|3|呪い / 髪の絡め取り / 這い寄り|
|toshio|俊雄|U|2|呪い / 走りパンチ|
|sadako|貞子|L|4|呪い / 呪いの凝視 / 髪の絞殺 / 走りパンチ|
|slimeG|緑スライム|O|1|体当たり|
|slimeB|青スライム|O|1|体当たり|
|slimeP|紫のスライム|O|1|体当たり|
|pinky|ピンキー|O|1|跳ね|
|kingslime|キングスライム|O|1|王の跳ね|
|anohito|あの人|V|2|解体 / 走り斬り|
|villRifle|村人(猟銃)|V|1|猟銃|
|villNata|村人(ナタ)|V|2|ナタ / 走り斬り|
|villAxe|村人(斧)|V|2|斧 / 走り斬り|
|fpeClaire|クレア|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeEngel|エンゲル|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeZip|ジップ|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeEdward|エドワード|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeOliver|オリバー|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeAbbie|アビー|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeLana|ラナ|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeBubble|バブル|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeCubbie|カビー|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpePetunia|ペチュニア|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeLizzy|リジー|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeKevin|ケビン|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeRobby|ロビー|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeSkell|スケル|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeRuby|ルービー|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeRiley|ライリー|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeChip|チップ|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeDemi|ミスター・デミ|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeSasha|ミス・サシャ|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|fpeGrace|ミス・グレース|N|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|missCircle|ミス・サークル|E|7|コンパス斬り / コンパス突進 / コンパス大回転 / コンパス串刺し / 走り体当たり / 跳び越しコンパス落とし / 側転コンパス薙ぎ|
|missThavel|ミス・サベル|E|7|鉤爪 / 角突進 / 乱れ引っ掻き / 角かち上げ / 走り爪 / 跳び越し鉤爪落とし / 側転鉤爪薙ぎ|
|missBloomie|ミス・ブルーミー|E|6|カッター / クロスカット / 足元斬り / 走り斬り / 跳び越し剪刀落とし / 側転剪刀薙ぎ|
|fpeAlice|アリス|E|15|アクロバット斬り / 側転蹴り / 壁跳ね斬り / 影ワープ斬り / 黒棘飛ばし / 回転蹴り / 触手引き込み / 黒棘の床 / 髪の刃 / インク潜り / 紙の手裏剣 / インクの鞭 / 狂気の微笑 / 疾走斬り / 生きた地中触手|
|dngCircle|デンジャーサークル|E|5|火炎放射 / 頭を焼け / 地面焼き / 跳び越し火炎腕落とし / 側転火炎腕薙ぎ|
|dngBloomie|デンジャーブルーミー|E|5|2点バースト / 連射 / 乱射 / 跳び越し銃床落とし / 側転銃床薙ぎ|
|dngThavel|デンジャータベル|E|8|グレネード散布 / 爆破グローブ / 挟みパンチ / 閃光弾 / 毒ガス弾 / 走り爪 / 跳び越しグローブ落とし / 側転グローブ薙ぎ|
|fen|フェン|5|13|巨大な手 / 指貫き / 手伸ばし掴み / 回転叩き / 衝撃波掌 / 走り体当たり / 巨大ハンマー腕 / 腕を大鎌へ変形 / 槍状の腕で串刺し / 鞭腕の薙ぎ払い / ドリル腕の連続穿孔 / 盾腕の押し潰し / 巨大化した五指の檻|
|mikeTyson|マイクタイソン|N|3|ジャブ / フック / アッパー|
|locust|ローカスト|6|2|引き裂き / 走りパンチ|
|verity|ベリティー|8|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|verityMon|ベリティーモンスター|8|5|見境なき殴打 / 突進 / 走り体当たり / 跳び越し長腕落とし / 側転長腕薙ぎ|
|slender|スレンダーマン|0|4|触手 / フラッシュ / 背後絞め / 走り体当たり|
|joker|ジョーカー|jk|3|ナイフ / 笑気ガス / 走りパンチ|
|jokerFan|ジョーカー信者|jk|2|乱打 / 走りパンチ|
|horgaHam|ホルガ村人(ハンマー)|hg|2|ハンマー / 走りパンチ|
|horgaScythe|ホルガ村人(鎌)|hg|2|鎌 / 走り斬り|
|horgaAxe|ホルガ村人(斧)|hg|2|斧 / 走り斬り|
|gvAxe|村人(斧)|pg|2|斧 / 走り斬り|
|gvTorch|村人(松明)|pg|2|焼き払い / 走りパンチ|
|gvDyna|村人(ダイナマイト)|pg|1|ダイナマイト|
|gvSickle|村人(鎌)|pg|2|鎌 / 走り斬り|
|gvChainM|チェーンソー男|pg|3|チェーンソー / 首刈り / 走り斬り|
|gvChainF|チェーンソー姉妹|pg|3|チェーンソー / 首刈り / 走り斬り|
|gvGatling|ガトリング男|pg|1|ガトリング|
|gvMendez|ビトレス・メンデス|pg|3|殴打 / 触手 / 走り体当たり|
|gvCultSh|邪教徒(盾)|pg|2|盾打ち / 走りパンチ|
|gvCultBow|邪教徒(ボーガン)|pg|1|ボーガン|
|gvSoldStun|戦闘員(スタンバトン)|pg|2|スタン / 走りパンチ|
|gvSoldDyna|戦闘員(ダイナマイト)|pg|1|ダイナマイト|
|gvSoldRkt|戦闘員(ロケット)|pg|1|ロケットランチャー|
|gvSalazar|ラモン・サラザール|pg|3|呪い / ヴェルデューゴを呼ぶ / 走り体当たり|
|gvKrauser|ジャック・クラウザー|pg|4|ナイフ連撃 / 斬撃 / 回し蹴り / スライディング斬り|
|gvSaddler|オズムンド・サドラー|pg|4|触手 / 踏みつけ / 幼生プラガ放出 / 走り体当たり|
|plagaA|プラガA|pg|2|触手打ち / 走りパンチ|
|plagaB|プラガB|pg|2|噛み切り / 走り爪|
|plagaC|プラガC|pg|1|飛びつき|
|arana|アラーニャ|pg|1|噛みつき|
|barako|太陽の導師バラコ|bk|2|太陽レーザー / 陽光|
|barakoana|バラコアナー|bk|2|槍 / 走りパンチ|
|bkDart|バラコア(毒吹き矢)|bk|1|毒吹き矢|
|bkClub|バラコア(棍棒)|bk|2|棍棒 / 走りパンチ|
|nita|ニタ|nt|1|地割れ|
|nBearH|ヒーリングクマ|nt|2|爪 / 走り噛みつき|
|nBearB|バーサーカークマ|nt|2|連撃 / 走り噛みつき|
|mrP|ミスターP|mp|1|キャリーケース|
|porter|ポーター兵|mp|1|中距離撃ち|
|porterUp|強化ポーター兵|mp|1|強化撃ち|
|mzombie|ゾンビ|mz|1|殴打|
|husk|ハスク|mz|1|殴打|
|drowned|ドラウンド|mz|2|殴打 / トライデント投擲|
|mutZombie|ミュータントゾンビ|mz|3|咆哮 / 衝撃波 / 投げ叩き|
|mutHusk|ミュータントハスク|mz|5|擲砂岩 / 衝撃波 / 重拳 / 咆哮 / 沙暴躍撃|
|guardian|ガーディアン|gd|1|レーザー|
|elderG|エルダーガーディアン|gd|1|レーザー|
|spider|スパイダー|sp|2|噛みつき / 走り噛みつき|
|spWar|スパイダーウォーリアー|sp|3|噛みつき / 飛びかかり / 走り噛みつき|
|spCave|洞窟蜘蛛|sp|2|噛みつき / 走り噛みつき|
|spSpit|スピッター|sp|1|粘液|
|spNurse|ナースグモ|sp|2|噛みつき / 走り噛みつき|
|spHang|ハングドスパイダー|sp|2|奇襲 / 走り噛みつき|
|spQueen|クイーンスパイダー|sp|1|大顎|
|spDepth|深層グモ|sp|3|噛みつき / 飛びかかり / 走り噛みつき|
|pvZombie|ゾンビ|pv|1|噛みつき|
|pvCone|コーンヘッドゾンビ|pv|1|殴打|
|pvBucket|バケットヘッドゾンビ|pv|1|殴打|
|pvPole|ポールボールトゾンビ|pv|3|ポール跳び / 噛みつき / 走りパンチ|
|pvPaper|ペーパーボーイゾンビ|pv|1|新聞殴り|
|pvScreen|スクリーンドアゾンビ|pv|1|ドア殴り|
|pvFoot|フットボールゾンビ|pv|1|タックル|
|pvCatapult|カタパルトゾンビ|pv|1|投石|
|pvJack|ジャックインザボックスゾンビ|pv|1|爆発|
|pvZomboni|ゾンボニ|pv|1|轢く|
|pvGarg|ガーガンチュア|pv|2|叩きつけ / 投擲|
|pvBungee|バンジーゾンビ|pv|1|さらい|
|pvZomboss|ゾンボス|pv|3|キャンピングカー投擲 / 氷弾 / 火の玉|
|srpBuglin|バグリン|srp|1|噛みつき|
|srpRupter|ルプター|srp|1|体当たり|
|srpMangler|マングラー|srp|2|鎌腕 / 連続鎌|
|srpGnat|グナット|srp|1|刺針|
|srpLice|ライス|srp|1|食いつき|
|srpWorker|ワーカー|srp|1|顎|
|srpFlyCarrier|フライングキャリアー|srp|1|体液滴下|
|srpLightCarrier|ライトキャリアー|srp|1|刺突|
|srpAsHuman|同化人間|srp|3|爪 / 触手鞭 / 走り爪|
|srpAsAdventurer|同化冒険者|srp|3|錆びた剣 / 突き / 走り斬り|
|srpAsCow|同化牛|srp|2|突き上げ / 走り噛みつき|
|srpAsPig|同化豚|srp|2|噛みつき / 走り噛みつき|
|srpAsSheep|同化羊|srp|2|頭突き / 走り噛みつき|
|srpAsHorse|同化馬|srp|3|蹴り / 突進 / 走り噛みつき|
|srpAsWolf|同化狼|srp|3|噛み裂き / 飛びかかり / 走り噛みつき|
|srpAsBear|同化熊|srp|2|豪腕 / 走り噛みつき|
|srpAsSpider|同化大グモ|srp|2|毒牙 / 跳躍|
|srpAsEnderman|同化エンダーマン|srp|2|長腕打ち / 走りパンチ|
|srpAsVillager|同化村人|srp|2|引っ掻き / 走りパンチ|
|srpHjGolem|乗っ取りゴーレム|srp|2|振り上げ / 地響き|
|srpHjBlaze|乗っ取りブレイズ|srp|1|寄生火球|
|srpFeralHuman|野生人間|srp|3|裂爪 / 触手連打 / 走り爪|
|srpFeralWolf|野生狼|srp|3|噛み千切り / 飛びかかり / 走り噛みつき|
|srpFeralBear|野生熊|srp|2|叩き潰し / 走り噛みつき|
|srpFeralCow|野生牛|srp|3|突撃 / 角 / 走り噛みつき|
|srpAssimaraHuman|アシマラ人間|srp|4|骨刃 / 背触手 / 乱撃 / 走り爪|
|srpAssimaraBear|アシマラ熊|srp|3|破砕 / 地鳴り / 走り噛みつき|
|srpAssimaraEnderman|アシマラエンダーマン|srp|3|虚無の爪 / 転移強襲 / 走り爪|
|srpFlesh|動く肉塊|srp|1|肉塊打ち|
|srpIncompS|不完全体(小)|srp|1|叩きつけ|
|srpIncompM|不完全体(中)|srp|1|肉腕|
|srpAirscrew|エアスクリュー|srp|1|回転刃|
|srpCrux|クラックス|srp|1|骨杭|
|srpDredge|ドレッジ|srp|1|吸い込み|
|srpHeed|ヒード|srp|2|叫声 / 叩き|
|srpHost|ホスト|srp|2|寄生体放出 / 叩き|
|srpThrall|スロール|srp|2|肉鎚 / 走り爪|
|srpHerd|ハード|srp|2|突撃 / 噛みつき|
|srpPrLongarms|原始ロングアームズ|srp|4|長腕薙ぎ / 引き寄せ / 振り下ろし / 走り爪|
|srpAdLongarms|適応ロングアームズ|srp|4|長腕薙ぎ / 引き寄せ / 振り下ろし / 走り体当たり|
|srpPrReeker|原始リーカー|srp|3|腐臭ガス / 殴打 / 走り爪|
|srpAdReeker|適応リーカー|srp|3|腐臭ガス / 殴打 / 走り体当たり|
|srpPrYelloweye|原始イエローアイ|srp|3|酸液弾 / 爪 / 走り爪|
|srpAdYelloweye|適応イエローアイ|srp|3|酸液弾 / 爪 / 走り爪|
|srpPrSummoner|原始サモナー|srp|4|先天種召喚 / 呼び声 / 殴打 / 走り爪|
|srpAdSummoner|適応サモナー|srp|4|先天種召喚 / 呼び声 / 殴打 / 走り体当たり|
|srpPrManducater|原始マンデュケーター|srp|2|丸呑み噛み / 噛み砕き|
|srpAdManducater|適応マンデュケーター|srp|2|丸呑み噛み / 噛み砕き|
|srpPrBolster|原始ボルスター|srp|2|盾殴り / 士気の咆哮|
|srpAdBolster|適応ボルスター|srp|2|盾殴り / 士気の咆哮|
|srpPrArachnida|原始アラクニダ|srp|3|鋏角 / 跳躍強襲 / 粘糸|
|srpAdArachnida|適応アラクニダ|srp|3|鋏角 / 跳躍強襲 / 粘糸|
|srpPrBurrower|原始バロワー|srp|2|地中突き上げ / 噛みつき|
|srpAdBurrower|適応バロワー|srp|2|地中突き上げ / 噛みつき|
|srpPrDevourer|原始デヴァウアー|srp|2|捕食 / 咬撃|
|srpAdDevourer|適応デヴァウアー|srp|2|捕食 / 咬撃|
|srpPrTozoon|原始トゾーン|srp|2|転がり突進 / 棘弾き|
|srpAdTozoon|適応トゾーン|srp|2|転がり突進 / 棘弾き|
|srpPrViscera|原始ヴィセラ|srp|2|臓物爆散 / 腸鞭|
|srpAdViscera|適応ヴィセラ|srp|2|臓物爆散 / 腸鞭|
|srpAdVermin|適応ヴァーミン|srp|2|急襲 / 連噛み|
|srpBeckon|ベコン|srp|1|触手叩き|
|srpDispatcher|ディスパッチャー|srp|2|寄生弾 / 触手叩き|
|srpRooter|ルーター|srp|1|根の槍|
|srpGrunt|グラント|srp|4|剛腕 / ラリアット / 地砕き / 走り体当たり|
|srpOverseer|オーバーシーア|srp|2|監視光線 / 指揮|
|srpSeeker|シーカー|srp|3|追跡斬 / 跳び裂き / 走り爪|
|srpVigilante|ヴィジランテ|srp|4|骨剣 / 串刺し / 回転斬り / 走り体当たり|
|srpMonarch|モナーク|srp|4|王の爪 / 群れ召喚 / 支配の咆哮 / 走り体当たり|
|srpBogle|ボーグル|srp|3|闇討ち / 這い寄る爪 / 走り体当たり|
|srpHaunter|ホーンター|srp|2|急降下 / 悲鳴|
|srpWraith|レイス|srp|2|霊爪 / 霊弾|
|srpArchitect|アーキテクト|srp|3|構築杭 / 骨槌 / 走り体当たり|
|srpColonyCarrier|コロニーキャリアー|srp|1|爆撃嚢|
|srpHeavyBomber|ヘビーボンバー|srp|1|寄生爆弾|
|srpSuccor|サッカー|srp|3|吸血管 / 爪 / 走り体当たり|
|srpDreadnaut|エンシェント・ドレッドノート|srp|4|巨脚踏み潰し / 顎砕き / 寄生弾幕 / 暴走突進|
|srpOverlord|エンシェント・オーバーロード|srp|4|支配の光線 / 触手嵐 / 群体召喚 / 重圧|
|flInfect|感染体|fl|2|神経侵入 / 飛びつき|
|flCarrier|キャリアー|fl|1|自爆|
|flBiomass|バイオマス|fl|1|胞子噴出|
|flHuman|人間戦闘体|fl|4|アサルトライフル / ショットガン / 触手腕の殴打 / 走りパンチ|
|flElite|エリート戦闘体|fl|4|エナジーソード / プラズマライフル / 触手鞭 / 走りパンチ|
|flBrute|ブルート戦闘体|fl|4|突進 / 剛腕 / 叩き潰し / 走り体当たり|
|flBeast|感染野獣|fl|3|噛み裂き / 飛びかかり / 走り噛みつき|
|flStalker|ステルス変異|fl|2|飛びかかり / 爪|
|flTank|タンク変異|fl|2|巨腕パンチ / 感染体吐き出し|
|flRanged|レンジ変異|fl|1|有機スパイク連射|
|flProto|プロト・グレイブマインド|fl|1|触手薙ぎ|
|flGravemind|グレイブマインド|fl|3|巨触手の鉄槌 / 神経言語 / 感染体放出|
|flKeyMind|キーマインド|fl|3|思考体の圧殺 / 神経言語の奔流 / 純粋形態産出|
|nmMarker|マーカー|nm|1|マーカー信号|
|nmInfector|インフェクター|nm|1|吻針|
|nmLurker|ラーカー|nm|2|触手針 / 噛みつき|
|nmSwarm|スワーム|nm|1|群がり|
|nmCorruption|腐生組織|nm|1|汚染ガス|
|nmSlasher|スラッシャー|nm|3|骨刃 / 突進斬り / 走りパンチ|
|nmSpitter|スピッター|nm|3|強酸液 / 爪 / 走りパンチ|
|nmExploder|エクスプローダー|nm|1|自爆|
|nmLeaper|リーパー|nm|2|跳躍鎌 / 鎌|
|nmPuker|プーカー|nm|3|腐食胆汁 / 殴打 / 走りパンチ|
|nmStalker|ストーカー|nm|2|頭突き突進 / 爪|
|nmGuardian|ガーディアン|nm|2|即死触手 / ポッド産出|
|nmPod|ポッド|nm|1|触手弾|
|nmTwitcher|トゥイッチャー|nm|3|高速斬撃 / 乱撃 / 走りパンチ|
|nmDivider|ディバイダー|nm|3|長腕 / 首絞め / 走りパンチ|
|nmDivHead|ディバイダーの頭|nm|1|食いつき|
|nmHunter|ハンター (ウーバーモーフ)|nm|3|骨刃 / 突進 / 走りパンチ|
|nmBrute|ブルート|nm|3|突進 / 剛腕 / 肉塊投げ|
|nmLeviathan|レヴァイアサン (ハイブマインド)|nm|3|巨触手 / 爆発嚢射出 / スワーム放出|
|nmMoon|ブレザレン・ムーン|nm|2|収束の触手 / 終焉の信号|
|gvPitch|村人(ピッチフォーク)|pg|2|ピッチフォーク突き / 走り斬り|
|gvKnife|村人(包丁)|pg|2|包丁 / 走り斬り|
|gvBrick|村人(レンガ投げ)|pg|3|レンガ投げ / 殴打 / 走りパンチ|
|gvSling|村人(投石器)|pg|1|投石器|
|gvGigante|エル・ヒガンテ|pg|4|踏み潰し / 丸太薙ぎ / 掴み握り潰し / 岩投げ|
|gvDelLago|デル・ラーゴ|pg|3|丸呑み / 突進 / 噛みつき|
|gvColmillos|コルミロス|pg|4|噛み裂き / 飛びかかり / 背中の触手 / 走り噛みつき|
|gvGarrador|ガラドール|pg|3|鉄爪突き / 鉄爪乱撃 / 疾走鉄爪|
|gvNovis|ノビスタドール|pg|2|溶解液 / 鉤爪|
|gvArmadura|アルマデューラ|pg|4|大剣振り下ろし / 薙ぎ払い / 兜のプラーガ / 走り体当たり|
|gvVerdugo|ヴェルデューゴ|pg|4|尾刃突き / 尾刃薙ぎ / 天井からの奇襲 / 走り体当たり|
|gvCultScythe|邪教徒(大鎌)|pg|2|大鎌 / 走り斬り|
|gvCultFlail|邪教徒(フレイル)|pg|2|フレイル旋回 / 走りパンチ|
|gvCultRkt|邪教徒(ロケット)|pg|1|ロケットランチャー|
|gvCultGat|邪教徒(固定ガトリング)|pg|1|固定ガトリング|
|gvPriest|司祭|pg|3|錫杖 / 祈祷 / 走りパンチ|
|gvCultRed|赤衣の上級教徒|pg|3|大鎌 / 連続斬り / 走り斬り|
|gvCultIron|鉄仮面の盾教徒|pg|3|鉄盾突進 / メイス / 走りパンチ|
|gvDrill|削岩機のガナード|pg|2|ドリル突撃 / 粉砕|
|gvSoldPistol|戦闘員(拳銃)|pg|1|拳銃|
|gvSoldRifle|戦闘員(ライフル)|pg|1|ライフル|
|gvSoldNade|戦闘員(手榴弾)|pg|1|手榴弾|
|gvSoldShield|戦闘員(盾)|pg|2|盾殴り / 走りパンチ|
|gvSoldHammer|戦闘員(ハンマー)|pg|3|ハンマー振り下ろし / ハンマー旋回 / 走りパンチ|
|gvRegen|リヘナラドール|pg|2|腕伸ばし掴み / 噛みつき|
|gvIronMaiden|アイアンメイデン|pg|2|棘の抱擁 / 全身棘突出|
|gvU3|U-3|pg|3|鎌腕 / 百足突進 / 尾針|
|gvSuperSalvador|スーパーサルバドール|pg|3|巨大チェンソー / 首刈り / 走り体当たり|
|gvDesnucado|デスヌカド|pg|3|首の寄生体 / 掴みかかり / 走りパンチ|
|gvMartinico|マルティニコ|pg|3|首なし突進 / 触手鞭 / 走りパンチ|
|gvCowHead|牛頭のガナード|pg|3|牛頭突進 / 大槌 / 走り体当たり|
|gvSalazarMon|サラザール (融合体)|pg|3|巨大触手 / 捕食 / 幼生プラガ産出|
|gvSaddlerMon|サドラー (最終形態)|pg|4|巨脚突き刺し / 脚薙ぎ / 踏み潰し / 幼生プラガ放出|
|makima|マキマ|mk|3|ばん / 圧殺 / 手刀|
|denji|チェンソーマン|cs|5|チェンソー連撃 / 頭のチェンソー突き / 飛びかかり両断 / チェンソー回転斬り / 走りチェンソー|
|porterHub|ポーター拠点|mp|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|alexia|アレクシア・アッシュフォード|tv|5|炎の血 / 血の発火 / 燃える血飛沫 / 平手打ち / 走り体当たり|
|nosferatu|ノスフェラトゥ|tv|5|毒ガス噴射 / 触腕の鞭 / 毒霧の吐息 / 跳躍 / 爪の一撃|
|steveMon|スティーブ(変異体)|tv|5|大斧の振り下ろし / 斧の大旋回 / 猛進 / 掴み上げ / 走り体当たり|
|tvZombie|T-ベロニカ感染者|tv|2|噛みつき / 蔓の鞭|
|vPlant|ベロニカ・プラント|tv|2|蔓の鞭 / 花粉散布|
|vWorm|ベロニカ・ワーム|tv|2|地中突き上げ / 丸呑み噛みつき|
|vBee|ベロニカ・ハチ|tv|2|毒針 / 毒針射出|
|vAnt|ベロニカ・アリ|tv|2|大顎 / 蟻酸|
|albinoidJ|アルビノイド(幼体)|tv|2|噛みつき / 放電|
|albinoidA|アルビノイド(成体)|tv|3|噛み砕き / 大放電 / 電撃突進|
|alexiaBaby|アレクシアの幼体|tv|1|自爆発火|
|sirenHead|サイレンヘッド|sh|6|サイレン / 長腕の叩きつけ / 掴み上げ / 踏み潰し / 声真似 / 長い脚の疾走|
|longHorse|ロングホース|sh|3|首の叩きつけ / 踏み潰し / 長い首の噛みつき|
|cartoonCat|カートゥーン・キャット|sh|4|伸びる腕 / 引きずり込み / 笑う声 / ゴム足ダッシュ|
|cbShotgun|コンバインショットガンナー|cb|3|ショットガン散弾 / ショットガン二連射 / 銃床打撃|
|cbSMG|コンバインSMG|cb|3|SMG連射 / SMGグレネード / 銃床打撃|
|cbAR2|コンバインAR2|cb|3|AR2パルス射撃 / 手榴弾 / 銃床打撃|
|cbElite|コンバインエリート|cb|3|AR2精密射撃 / AR2エネルギーボール / 強化銃床|
|cbMetro|メトロコップ|cb|3|ピストル / SMG制圧 / スタンバトン|
|cbHunter|ハンター|cb|3|フレシェット連射 / 突進 / 前脚で串刺し|
|cbStrider|ストライダー|cb|3|パルス機銃 / ワープキャノン / 脚で突き刺す|
|cbManhack|マンハック|cb|2|回転刃 / 回転突進|
|cbAssassin|アサシン|cb|3|二丁拳銃 / 跳躍キック / 近接蹴り|
|cbCremator|クレメイター|cb|2|イモレーター噴射 / ノズル打撃|
|cbStalker|ストーカー|cb|2|眼部レーザー / 義肢打撃|
|cbMortarSynth|モーターシンス|cb|2|迫撃弾 / パルス砲|
|cbDropship|コンバインドロップシップ|cb|2|コンテナ機銃 / 増援降下|
|cbSniper|コンバインスナイパー|cb|2|照準レーザー狙撃 / 護身打撃|
|cbScanner|シティースキャナー|cb|1|撮影フラッシュ|
|cbGrunt|コンバイングラント|cb|3|パルスSMG / 手榴弾 / 銃床打撃|
|cbGuard|コンバインガード|cb|2|重粒子砲 / 装甲殴打|
|cbSynth|コンバインシンス|cb|2|生体パルス砲 / シンスの爪|
|cbSynthElite|コンバインシンスエリート|cb|2|強化パルス砲 / 強化爪|
|cbSuppressor|コンバインサプレッサー|cb|2|重機関銃の制圧射撃 / 重銃床|
|cbCrabSynth|クラブシンス|cb|2|背部機関砲 / 体当たり|
|cbTurret|タレット|cb|1|自動銃撃|
|cbRollermine|ローラーマイン|cb|2|電撃接触 / 転がり突進|
|cbAiden2|Unit 3650 / Aiden（Entropy: Zero 2）|cb|6|AR2精密射撃 / AR2エネルギーボール / 強化銃床 / ショットガン / キック / Xenグレネード|
|cbAiden1|Unit 3650 / Aiden（Entropy: Zero）|cb|5|ピストル / SMG制圧 / スタンバトン / AR2 / 手榴弾|
|cbVictor|ビクターシックスティー（Uprising）|cb|3|ピストル / SMG制圧 / スタンバトン|
|cbBec|ベック / Unit 2810（Uprising）|cb|3|ピストル / SMG制圧 / スタンバトン|
|cbBloody|ブラッドコップ（Uprising）|cb|3|ピストル / SMG制圧 / スタンバトン|
|cbShadow|シャドウ（Shadow Apartment）|cb|3|二丁拳銃 / 跳躍キック / 近接蹴り|
|cbEcho|Echo-8824（Excalibur 1-6）|cb|3|AR2精密射撃 / AR2エネルギーボール / 強化銃床|
|cbCore|City 17 コア|cb|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|cc_cbShotgun|クローン コンバインショットガンナー|cc|3|ショットガン散弾 / ショットガン二連射 / 銃床打撃|
|cc_cbSMG|クローン コンバインSMG|cc|3|SMG連射 / SMGグレネード / 銃床打撃|
|cc_cbAR2|クローン コンバインAR2|cc|3|AR2パルス射撃 / 手榴弾 / 銃床打撃|
|cc_cbElite|クローン コンバインエリート|cc|3|AR2精密射撃 / AR2エネルギーボール / 強化銃床|
|cc_cbMetro|クローン メトロコップ|cc|3|ピストル / SMG制圧 / スタンバトン|
|cc_cbHunter|クローン ハンター|cc|3|フレシェット連射 / 突進 / 前脚で串刺し|
|cc_cbStrider|クローン ストライダー|cc|3|パルス機銃 / ワープキャノン / 脚で突き刺す|
|cc_cbManhack|クローン マンハック|cc|2|回転刃 / 回転突進|
|cc_cbAssassin|クローン アサシン|cc|3|二丁拳銃 / 跳躍キック / 近接蹴り|
|cc_cbCremator|クローン クレメイター|cc|2|イモレーター噴射 / ノズル打撃|
|cc_cbStalker|クローン ストーカー|cc|2|眼部レーザー / 義肢打撃|
|cc_cbMortarSynth|クローン モーターシンス|cc|2|迫撃弾 / パルス砲|
|cc_cbDropship|クローン コンバインドロップシップ|cc|1|コンテナ機銃|
|cc_cbSniper|クローン コンバインスナイパー|cc|2|照準レーザー狙撃 / 護身打撃|
|cc_cbScanner|クローン シティースキャナー|cc|1|撮影フラッシュ|
|cc_cbGrunt|クローン コンバイングラント|cc|3|パルスSMG / 手榴弾 / 銃床打撃|
|cc_cbGuard|クローン コンバインガード|cc|2|重粒子砲 / 装甲殴打|
|cc_cbSynth|クローン コンバインシンス|cc|2|生体パルス砲 / シンスの爪|
|cc_cbSynthElite|クローン コンバインシンスエリート|cc|2|強化パルス砲 / 強化爪|
|cc_cbSuppressor|クローン コンバインサプレッサー|cc|2|重機関銃の制圧射撃 / 重銃床|
|cc_cbCrabSynth|クローン クラブシンス|cc|2|背部機関砲 / 体当たり|
|cc_cbTurret|クローン タレット|cc|1|自動銃撃|
|cc_cbRollermine|クローン ローラーマイン|cc|2|電撃接触 / 転がり突進|
|ccCloneCop|クローンコップ（3650）|cc|6|AR2精密射撃 / AR2エネルギーボール / 強化銃床 / ショットガン / キック / Xenグレネード|
|cc_cbVictor|クローン ビクターシックスティー（Uprising）|cc|3|ピストル / SMG制圧 / スタンバトン|
|cc_cbBec|クローン ベック / Unit 2810（Uprising）|cc|3|ピストル / SMG制圧 / スタンバトン|
|cc_cbBloody|クローン ブラッドコップ（Uprising）|cc|3|ピストル / SMG制圧 / スタンバトン|
|cc_cbShadow|クローン シャドウ（Shadow Apartment）|cc|3|二丁拳銃 / 跳躍キック / 近接蹴り|
|cc_cbEcho|クローン Echo-8824（Excalibur 1-6）|cc|3|AR2精密射撃 / AR2エネルギーボール / 強化銃床|
|mcVillager|村人|vg|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|ironGolem|アイアンゴーレム|vg|1|振り上げ|
|eg_acacia_log|Acacia Log Golem|vg|1|振り上げ|
|eg_amethyst|Amethyst Golem|vg|1|振り上げ|
|eg_ancient_debris|Ancient Debris Golem|vg|1|振り上げ|
|eg_andesite|Polished Andesite Golem|vg|1|振り上げ|
|eg_bamboo_wood|Bamboo Golem|vg|1|振り上げ|
|eg_basalt|Polished Basalt Golem|vg|1|振り上げ|
|eg_bedrock|Bedrock Golem|vg|1|振り上げ|
|eg_birch_log|Birch Log Golem|vg|1|振り上げ|
|eg_black_concrete|Black Concrete Golem|vg|1|振り上げ|
|eg_black_glazed_terracotta|Black Glazed Terracotta Golem|vg|1|振り上げ|
|eg_black_stained_glass|Black Stained Glass Golem|vg|1|振り上げ|
|eg_black_terracotta|Black Terracotta Golem|vg|1|振り上げ|
|eg_black_wool|Black Wool Golem|vg|1|振り上げ|
|eg_blackstone|Polished Blackstone Golem|vg|1|振り上げ|
|eg_blue_concrete|Blue Concrete Golem|vg|1|振り上げ|
|eg_blue_glazed_terracotta|Blue Glazed Terracotta Golem|vg|1|振り上げ|
|eg_blue_stained_glass|Blue Stained Glass Golem|vg|1|振り上げ|
|eg_blue_terracotta|Blue Terracotta Golem|vg|1|振り上げ|
|eg_blue_wool|Blue Wool Golem|vg|1|振り上げ|
|eg_bone|Bone Golem|vg|1|振り上げ|
|eg_bookshelf|Librarian Golem|vg|1|振り上げ|
|eg_brain_coral|Brain Coral Golem|vg|1|振り上げ|
|eg_brick|Brick Golem|vg|1|振り上げ|
|eg_brown_concrete|Brown Concrete Golem|vg|1|振り上げ|
|eg_brown_glazed_terracotta|Brown Glazed Terracotta Golem|vg|1|振り上げ|
|eg_brown_mushroom|Brown Mushroom Golem|vg|1|振り上げ|
|eg_brown_stained_glass|Brown Stained Glass Golem|vg|1|振り上げ|
|eg_brown_terracotta|Brown Terracotta Golem|vg|1|振り上げ|
|eg_brown_wool|Brown Wool Golem|vg|1|振り上げ|
|eg_bubble_coral|Bubble Coral Golem|vg|1|振り上げ|
|eg_cherry_log|Cherry Log Golem|vg|1|振り上げ|
|eg_clay|Clay Golem|vg|1|振り上げ|
|eg_coal|Coal Golem|vg|1|振り上げ|
|eg_copper|Copper Golem|vg|1|振り上げ|
|eg_crafting|Crafting Golem|vg|1|振り上げ|
|eg_crimson_stem|Crimson Stem Golem|vg|1|振り上げ|
|eg_crying_obsidian|Crying Obsidian Golem|vg|1|振り上げ|
|eg_cyan_concrete|Cyan Concrete Golem|vg|1|振り上げ|
|eg_cyan_glazed_terracotta|Cyan Glazed Terracotta Golem|vg|1|振り上げ|
|eg_cyan_stained_glass|Cyan Stained Glass Golem|vg|1|振り上げ|
|eg_cyan_terracotta|Cyan Terracotta Golem|vg|1|振り上げ|
|eg_cyan_wool|Cyan Wool Golem|vg|1|振り上げ|
|eg_dark_oak_log|Dark Oak Log Golem|vg|1|振り上げ|
|eg_dead_brain_coral|Dead Brain Coral Golem|vg|1|振り上げ|
|eg_dead_bubble_coral|Dead Bubble Coral Golem|vg|1|振り上げ|
|eg_dead_fire_coral|Dead Fire Coral Golem|vg|1|振り上げ|
|eg_dead_horn_coral|Dead Horn Coral Golem|vg|1|振り上げ|
|eg_dead_tube_coral|Dead Tube Coral Golem|vg|1|振り上げ|
|eg_deepslate|Polished Deepslate Golem|vg|1|振り上げ|
|eg_diamond|Diamond Golem|vg|1|振り上げ|
|eg_diorite|Polished Diorite Golem|vg|1|振り上げ|
|eg_dispenser|Dispenser Golem|vg|2|振り上げ / 矢の射撃|
|eg_dried_kelp|Dried Kelp Golem|vg|1|振り上げ|
|eg_emerald|Emerald Golem|vg|1|振り上げ|
|eg_end_stone|Endstone Golem|vg|1|振り上げ|
|eg_exposed_copper|Exposed Copper Golem|vg|1|振り上げ|
|eg_fire_coral|Fire Coral Golem|vg|1|振り上げ|
|eg_furnace|Furnace Golem|vg|1|振り上げ|
|eg_glass|Glass Golem|vg|1|振り上げ|
|eg_glowstone|Glowstone Golem|vg|1|振り上げ|
|eg_gold|Gold Golem|vg|1|振り上げ|
|eg_granite|Polished Granite Golem|vg|1|振り上げ|
|eg_gray_concrete|Gray Concrete Golem|vg|1|振り上げ|
|eg_gray_glazed_terracotta|Gray Glazed Terracotta Golem|vg|1|振り上げ|
|eg_gray_stained_glass|Gray Stained Glass Golem|vg|1|振り上げ|
|eg_gray_terracotta|Gray Terracotta Golem|vg|1|振り上げ|
|eg_gray_wool|Gray Wool Golem|vg|1|振り上げ|
|eg_green_concrete|Green Concrete Golem|vg|1|振り上げ|
|eg_green_glazed_terracotta|Green Glazed Terracotta Golem|vg|1|振り上げ|
|eg_green_stained_glass|Green Stained Glass Golem|vg|1|振り上げ|
|eg_green_terracotta|Green Terracotta Golem|vg|1|振り上げ|
|eg_green_wool|Green Wool Golem|vg|1|振り上げ|
|eg_hay|Straw Golem|vg|1|振り上げ|
|eg_honey|Honey Golem|vg|1|振り上げ|
|eg_honeycomb|Honeycomb Golem|vg|1|振り上げ|
|eg_horn_coral|Horn Coral Golem|vg|1|振り上げ|
|eg_ice|Ice Golem|vg|1|振り上げ|
|eg_jungle_log|Jungle Log Golem|vg|1|振り上げ|
|eg_lapis|Lapis Lazuli Golem|vg|1|振り上げ|
|eg_leaves|Leaf Golem|vg|1|振り上げ|
|eg_light_blue_concrete|Light Blue Concrete Golem|vg|1|振り上げ|
|eg_light_blue_glazed_terracotta|Light Blue Glazed Terracotta Golem|vg|1|振り上げ|
|eg_light_blue_stained_glass|Light Blue Stained Glass Golem|vg|1|振り上げ|
|eg_light_blue_terracotta|Light Blue Terracotta Golem|vg|1|振り上げ|
|eg_light_blue_wool|Light Blue Wool Golem|vg|1|振り上げ|
|eg_light_gray_concrete|Light Gray Concrete Golem|vg|1|振り上げ|
|eg_light_gray_glazed_terracotta|Light Gray Glazed Terracotta Golem|vg|1|振り上げ|
|eg_light_gray_stained_glass|Light Gray Stained Glass Golem|vg|1|振り上げ|
|eg_light_gray_terracotta|Light Gray Terracotta Golem|vg|1|振り上げ|
|eg_light_gray_wool|Light Gray Wool Golem|vg|1|振り上げ|
|eg_lime_concrete|Lime Concrete Golem|vg|1|振り上げ|
|eg_lime_glazed_terracotta|Lime Glazed Terracotta Golem|vg|1|振り上げ|
|eg_lime_stained_glass|Lime Stained Glass Golem|vg|1|振り上げ|
|eg_lime_terracotta|Lime Terracotta Golem|vg|1|振り上げ|
|eg_lime_wool|Lime Wool Golem|vg|1|振り上げ|
|eg_magenta_concrete|Magenta Concrete Golem|vg|1|振り上げ|
|eg_magenta_glazed_terracotta|Magenta Glazed Terracotta Golem|vg|1|振り上げ|
|eg_magenta_stained_glass|Magenta Stained Glass Golem|vg|1|振り上げ|
|eg_magenta_terracotta|Magenta Terracotta Golem|vg|1|振り上げ|
|eg_magenta_wool|Magenta Wool Golem|vg|1|振り上げ|
|eg_magma|Magma Golem|vg|1|振り上げ|
|eg_mangrove_log|Mangrove Log Golem|vg|1|振り上げ|
|eg_mangrove_roots|Mangrove Roots Golem|vg|1|振り上げ|
|eg_melon|Melon Golem|vg|1|振り上げ|
|eg_moss|Moss Golem|vg|1|振り上げ|
|eg_mud|Muddy Golem|vg|1|振り上げ|
|eg_muddy_mangrove_roots|Muddy Mangrove Roots Golem|vg|1|振り上げ|
|eg_nether_brick|Nether Brick Golem|vg|2|振り上げ / 火球|
|eg_nether_wart|Nether Wart Golem|vg|1|振り上げ|
|eg_netherite|Netherite Golem|vg|1|振り上げ|
|eg_oak_log|Oak Log Golem|vg|1|振り上げ|
|eg_obsidian|Obsidian Golem|vg|1|振り上げ|
|eg_ochre_froglight|Ochre Froglight Golem|vg|1|振り上げ|
|eg_orange_concrete|Orange Concrete Golem|vg|1|振り上げ|
|eg_orange_glazed_terracotta|Orange Glazed Terracotta Golem|vg|1|振り上げ|
|eg_orange_stained_glass|Orange Stained Glass Golem|vg|1|振り上げ|
|eg_orange_terracotta|Orange Terracotta Golem|vg|1|振り上げ|
|eg_orange_wool|Orange Wool Golem|vg|1|振り上げ|
|eg_oxidized_copper|Oxidized Copper Golem|vg|1|振り上げ|
|eg_packed_mud|Packed Mud Golem|vg|1|振り上げ|
|eg_pearlescent_froglight|Pearlescent Froglight Golem|vg|1|振り上げ|
|eg_pink_concrete|Pink Concrete Golem|vg|1|振り上げ|
|eg_pink_glazed_terracotta|Pink Glazed Terracotta Golem|vg|1|振り上げ|
|eg_pink_stained_glass|Pink Stained Glass Golem|vg|1|振り上げ|
|eg_pink_terracotta|Pink Terracotta Golem|vg|1|振り上げ|
|eg_pink_wool|Pink Wool Golem|vg|1|振り上げ|
|eg_prismarine|Prismarine Golem|vg|1|振り上げ|
|eg_purple_concrete|Purple Concrete Golem|vg|1|振り上げ|
|eg_purple_glazed_terracotta|Purple Glazed Terracotta Golem|vg|1|振り上げ|
|eg_purple_stained_glass|Purple Stained Glass Golem|vg|1|振り上げ|
|eg_purple_terracotta|Purple Terracotta Golem|vg|1|振り上げ|
|eg_purple_wool|Purple Wool Golem|vg|1|振り上げ|
|eg_purpur|Purpur Golem|vg|1|振り上げ|
|eg_quartz|Quartz Golem|vg|1|振り上げ|
|eg_raw_copper|Raw Copper Golem|vg|1|振り上げ|
|eg_raw_gold|Raw Gold Golem|vg|1|振り上げ|
|eg_raw_iron|Raw Iron Golem|vg|1|振り上げ|
|eg_red_concrete|Red Concrete Golem|vg|1|振り上げ|
|eg_red_glazed_terracotta|Red Glazed Terracotta Golem|vg|1|振り上げ|
|eg_red_mushroom|Red Mushroom Golem|vg|1|振り上げ|
|eg_red_nether_brick|Red Nether Brick Golem|vg|2|振り上げ / 火球|
|eg_red_sandstone|Red Sandstone Golem|vg|1|振り上げ|
|eg_red_stained_glass|Red Stained Glass Golem|vg|1|振り上げ|
|eg_red_terracotta|Red Terracotta Golem|vg|1|振り上げ|
|eg_red_wool|Red Wool Golem|vg|1|振り上げ|
|eg_redstone|Redstone Golem|vg|1|振り上げ|
|eg_redstone_lamp|Redstone Lamp Golem|vg|1|振り上げ|
|eg_sandstone|Sandstone Golem|vg|1|振り上げ|
|eg_sculk|Sculk Golem|vg|1|振り上げ|
|eg_sculk_catalyst|Sculk Catalyst Golem|vg|1|振り上げ|
|eg_sea_lantern|Sea Lantern Golem|vg|1|振り上げ|
|eg_shroomlight|Shroomlight Golem|vg|1|振り上げ|
|eg_slime|Slimy Golem|vg|1|振り上げ|
|eg_smooth_stone|Smooth Stone Golem|vg|1|振り上げ|
|eg_sponge|Sponge Golem|vg|1|振り上げ|
|eg_spruce_log|Spruce Log Golem|vg|1|振り上げ|
|eg_stripped_acacia_log|Stripped Acacia Log Golem|vg|1|振り上げ|
|eg_stripped_bamboo_wood|Stripped Bamboo Golem|vg|1|振り上げ|
|eg_stripped_birch_log|Stripped Birch Log Golem|vg|1|振り上げ|
|eg_stripped_cherry_log|Stripped Cherry Log Golem|vg|1|振り上げ|
|eg_stripped_crimson_stem|Stripped Crimson Stem Golem|vg|1|振り上げ|
|eg_stripped_dark_oak_log|Stripped Dark Oak Log Golem|vg|1|振り上げ|
|eg_stripped_jungle_log|Stripped Jungle Log Golem|vg|1|振り上げ|
|eg_stripped_mangrove_log|Stripped Mangrove Log Golem|vg|1|振り上げ|
|eg_stripped_oak_log|Stripped Oak Log Golem|vg|1|振り上げ|
|eg_stripped_spruce_log|Stripped Spruce Log Golem|vg|1|振り上げ|
|eg_stripped_warped_stem|Stripped Warped Stem Golem|vg|1|振り上げ|
|eg_terracotta|Terracotta Golem|vg|1|振り上げ|
|eg_tinted_glass|Tinted Glass Golem|vg|1|振り上げ|
|eg_tnt|TNT Golem|vg|1|振り上げ|
|eg_tube_coral|Tube Coral Golem|vg|1|振り上げ|
|eg_verdant_froglight|Verdant Froglight Golem|vg|1|振り上げ|
|eg_warped_stem|Warped Stem Golem|vg|1|振り上げ|
|eg_warped_wart|Warped Wart Golem|vg|1|振り上げ|
|eg_waxed_copper|Waxed Copper Golem|vg|1|振り上げ|
|eg_waxed_exposed_copper|Waxed Exposed Copper Golem|vg|1|振り上げ|
|eg_waxed_oxidized_copper|Waxed Oxidized Copper Golem|vg|1|振り上げ|
|eg_waxed_weathered_copper|Waxed Weathered Copper Golem|vg|1|振り上げ|
|eg_weathered_copper|Weathered Copper Golem|vg|1|振り上げ|
|eg_white_concrete|White Concrete Golem|vg|1|振り上げ|
|eg_white_glazed_terracotta|White Glazed Terracotta Golem|vg|1|振り上げ|
|eg_white_stained_glass|White Stained Glass Golem|vg|1|振り上げ|
|eg_white_terracotta|White Terracotta Golem|vg|1|振り上げ|
|eg_white_wool|White Wool Golem|vg|1|振り上げ|
|eg_yellow_concrete|Yellow Concrete Golem|vg|1|振り上げ|
|eg_yellow_glazed_terracotta|Yellow Glazed Terracotta Golem|vg|1|振り上げ|
|eg_yellow_stained_glass|Yellow Stained Glass Golem|vg|1|振り上げ|
|eg_yellow_terracotta|Yellow Terracotta Golem|vg|1|振り上げ|
|eg_yellow_wool|Yellow Wool Golem|vg|1|振り上げ|
|rezeBomb|爆弾の悪魔（レゼ）|rz|8|爆破掌 / 爆弾投擲 / ミサイル脚の爆破突進 / 切り離した頭と胴体の連続爆破 / 爆弾の塊を射出 / 連鎖爆破 / 爆風跳躍蹴り / 至近距離の全身爆破|
|typhoonChild|台風の悪魔（幼体）|rz|2|小さな竜巻 / 風圧|
|typhoonAdult|台風の悪魔（成体）|rz|4|巨大竜巻 / 瓦礫の暴風 / 暴風の吸引 / 巨体の圧殺|
|gon|ゴン|hn|4|連続拳 / ジャジャン拳・グー / ジャジャン拳・チー / ジャジャン拳・パー|
|killua|キルア|hn|4|神速の連撃 / 落雷 / 電光石火 / 肢曲の手刀|
|genthru|ゲンスルー|bm|3|リトルフラワー / 念の打撃 / 両手リトルフラワー|
|bomberSub|サブ|bm|2|念の拳 / 連続打撃|
|bomberBara|バラ|bm|2|強打 / 突進打撃|
|aliceTendril|アリスの生体触手|E|1|生体触手の鞭|
|enderMan|エンダーマン|em|2|長腕の打撃 / 瞬間移動からの強襲|
|enderMite|エンダーマイト|em|1|噛みつき|
|mutantEnderMan|ミュータントエンダーマン|em|4|四本腕の連撃 / 瞬間移動の重撃 / エンダーの衝撃波 / 巨腕の叩き潰し|
|creeper|クリーパー|cp|1|自爆|
|mutantCreeper|ミュータントクリーパー|cp|1|大爆発|
|miniCreeper|ミニクリーパー|cp|1|幼体の小爆発|
|pitDrone|ピットドローン|pd|3|鉤爪の切り裂き / 頭部の棘を射出 / 両腕の連撃|
|lordX|Lord X|lx|4|弾性肢の伸長 / 首の360度回転 / 器の歪曲突進 / 腐食の手 / Decaying Touch|
|lxAlan|Alan Rowper / Tails Vessel|lx|2|二尾の薙ぎ払い / 器の急襲|
|lxJulie|Julie Donahue / Knuckles Vessel|lx|2|棘付き拳 / 器の衝撃波|
|lxKylie|Kylie / Amy Vessel|lx|2|反抗のハンマー / 意志の一撃|
|lxKito|Kito / 祈りのガーディアン|lx|2|祈りの誘捕光 / 祈りの手|
|lxKeno|Ken’o / 嫌悪のガーディアン|lx|2|虚無の手 / 嫌悪の瘴気|
|lxKofuku|Kofuku / 喜びのガーディアン|lx|2|一輪車の突撃 / 狂喜の仮面|
|lxGekido|Gekido / 怒りのガーディアン|lx|2|処理場の剛腕 / 怒りの叩き潰し|
|lxZetsubo|Zetsubo / 絶望のガーディアン|lx|2|水底からの拘束 / 韻律の精神拷問|
|lxKyofu|Kyofu / 恐怖のガーディアン|lx|2|変身する腕 / 恐怖の背後取り|
|lxYokubo|Yokubo / 欲望のガーディアン|lx|2|欲望の引力 / 傲慢なる圧壊|
|sonicExe|Sonic.EXE|sx|5|クロー・スラッシュ / 黒煙の背後テレポート / 幻影のスタチュー / 魂の捕縛 / 口内のブラックホール|
|soulTails|Tails / Soul Tails|sx|2|二尾の回転 / 魂の滑空|
|soulKnuckles|Knuckles / Soul Knuckles|sx|2|魂の拳 / 魂の叩きつけ|
|soulEggman|Eggman / Soul Eggman|sx|2|魂の機械弾 / 追い詰める幻影|
|sallyExe|Sally Acorn / Sally.EXE|sx|2|操り人形の爪 / 魂の奇襲|
|pr_jungle_hunter|Jungle Hunter|pr|4|リストブレイド / プラズマ射撃 / 光学迷彩 / 自爆装置|
|pr_city_hunter|City Hunter|pr|7|リストブレイド / 槍の突き / スマートディスク / 捕縛ネット / プラズマ射撃 / 光学迷彩 / 自爆装置|
|pr_young_blood_celtic|Young Blood / Celtic|pr|4|リストブレイド / 捕縛ネット / 突進 / 光学迷彩|
|pr_young_blood_chopper|Young Blood / Chopper|pr|3|リストブレイド / 槍の突き / 光学迷彩|
|pr_blooded_scar|Blooded / Scar|pr|5|リストブレイド / 槍の突き / 手裏剣 / プラズマ射撃 / 光学迷彩|
|pr_elder_greyback|Elder / Greyback|pr|4|リストブレイド / 槍の突き / プラズマ射撃 / 光学迷彩|
|pr_cleaner_wolf|Cleaner / Wolf|pr|7|リストブレイド / 二連プラズマ / 鞭の一閃 / 手裏剣 / 近接地雷 / 剛腕の打撃 / 光学迷彩|
|pr_super_predator_berserker|Super Predator / Berserker|pr|4|リストブレイド / プラズマ射撃 / 突進 / 光学迷彩|
|pr_super_predator_falconer|Super Predator / Falconer|pr|3|リストブレイド / 偵察ドローン展開 / 光学迷彩|
|pr_super_predator_tracker|Super Predator / Tracker|pr|4|リストブレイド / プラズマ射撃 / 猟犬の投入 / 光学迷彩|
|pr_fugitive_predator|Fugitive Predator|pr|4|リストブレイド / プラズマ射撃 / 手裏剣 / 光学迷彩|
|pr_upgrade_assassin_predator|Upgrade / Assassin Predator|pr|3|爪の切り裂き / 剛腕の打撃 / 手首ロケット|
|pr_feral_predator|Feral Predator|pr|7|リストブレイド / 追尾ボルト / シールド殴打 / 槍の突き / 捕縛ネット / 近接地雷 / 光学迷彩|
|pr_viking_grendel|Viking / Grendel|pr|3|剛腕の打撃 / 衝撃波 / 光学迷彩|
|pr_oni_predator|Oni Predator|pr|5|リストブレイド / 槍の突き / 鎖の引き寄せ / 近接地雷 / 光学迷彩|
|pr_pilot_cyborg_predator|Pilot / Cyborg Predator|pr|3|リストブレイド / レーザー / 光学迷彩|
|pr_warlord_grendel_king|Warlord / Grendel King|pr|3|斧の強打 / 槍の突き / 剛腕の打撃|
|pr_badlands_dek|Badlands / Dek|pr|4|刃の斬撃 / 手裏剣 / シールド殴打 / 生物装備の拘束|
|pr_badlands_clan_leader_njohrr|Badlands Clan Leader / Njohrr|pr|3|刃の斬撃 / リストブレイド / 槍の突き|
|pr_yautja_hunting_hound|Yautja Hunting Hound|pr|2|噛みつき / 突進|
|pr_upgraded_predator_hound|Upgraded Predator Hound|pr|2|噛みつき / 突進|
|pr_falcon_recon_drone|Falcon Recon Drone|pr|1|索敵|
|cv_grunt_minor|Grunt Minor|cv|2|プラズマ射撃 / プラズマグレネード|
|cv_grunt_major|Grunt Major|cv|2|ニードラー / プラズマグレネード|
|cv_grunt_ultra|Grunt Ultra|cv|2|プラズマ射撃 / プラズマグレネード|
|cv_grunt_heavy|Grunt Heavy|cv|2|燃料ロッド砲 / 剛腕の打撃|
|cv_grunt_special_operations|Grunt Special Operations|cv|2|ニードラー / プラズマグレネード|
|cv_grunt_suicide|Grunt Suicide|cv|1|接触自爆|
|cv_grunt_storm|Grunt Storm|cv|2|プラズマ射撃 / プラズマグレネード|
|cv_grunt_ranger|Grunt Ranger|cv|2|プラズマ射撃 / プラズマグレネード|
|cv_grunt_imperial|Grunt Imperial|cv|2|ニードラー / プラズマグレネード|
|cv_elite_minor|Elite Minor|cv|3|プラズマ射撃 / 剛腕の打撃 / プラズマグレネード|
|cv_elite_major|Elite Major|cv|3|プラズマ射撃 / 刃の斬撃 / プラズマグレネード|
|cv_elite_ultra|Elite Ultra|cv|3|刃の斬撃 / プラズマ射撃 / プラズマグレネード|
|cv_elite_zealot|Elite Zealot|cv|3|刃の斬撃 / 突進 / プラズマグレネード|
|cv_elite_general|Elite General|cv|3|燃料ロッド砲 / 刃の斬撃 / プラズマグレネード|
|cv_elite_field_marshal|Elite Field Marshal|cv|3|燃料ロッド砲 / 刃の斬撃 / プラズマグレネード|
|cv_elite_ranger|Elite Ranger|cv|2|二連プラズマ / プラズマグレネード|
|cv_elite_special_operations|Elite Special Operations|cv|3|刃の斬撃 / プラズマ射撃 / 光学迷彩|
|cv_elite_stealth|Elite Stealth|cv|3|刃の斬撃 / プラズマ射撃 / 光学迷彩|
|cv_elite_honor_guard|Elite Honor Guard|cv|2|刃の斬撃 / プラズマ射撃|
|cv_elite_honor_guard_ultra|Elite Honor Guard Ultra|cv|2|刃の斬撃 / プラズマ射撃|
|cv_elite_high_councilor|Elite High Councilor|cv|2|刃の斬撃 / プラズマ射撃|
|cv_elite_arbiter_harness|Elite Arbiter Harness|cv|3|刃の斬撃 / プラズマ射撃 / 光学迷彩|
|cv_elite_storm|Elite Storm|cv|3|プラズマ射撃 / 剛腕の打撃 / プラズマグレネード|
|cv_elite_warrior|Elite Warrior|cv|3|燃料ロッド砲 / 刃の斬撃 / プラズマグレネード|
|cv_elite_commander|Elite Commander|cv|3|コンカッション弾 / カービン / 刃の斬撃|
|cv_jackal_minor|Jackal Minor|cv|2|プラズマ射撃 / シールド殴打|
|cv_jackal_major|Jackal Major|cv|2|ニードラー / シールド殴打|
|cv_jackal_sniper_beam_rifle|Jackal Sniper / Beam Rifle|cv|2|ビームライフル狙撃 / 剛腕の打撃|
|cv_jackal_marksman_carbine|Jackal Marksman / Carbine|cv|2|カービン / 剛腕の打撃|
|cv_jackal_ranger|Jackal Ranger|cv|2|ビームライフル狙撃 / 剛腕の打撃|
|cv_jackal_storm|Jackal Storm|cv|2|ニードラー / シールド殴打|
|cv_jackal_heavy|Jackal Heavy|cv|2|カービン / シールド殴打|
|cv_skirmisher_minor|Skirmisher Minor|cv|2|ニードラー / 跳躍攻撃|
|cv_skirmisher_major|Skirmisher Major|cv|2|カービン / 跳躍攻撃|
|cv_skirmisher_murmillo|Skirmisher Murmillo|cv|3|ニードラー / シールド殴打 / 跳躍攻撃|
|cv_skirmisher_commando|Skirmisher Commando|cv|2|ビームライフル狙撃 / 跳躍攻撃|
|cv_skirmisher_champion|Skirmisher Champion|cv|3|カービン / シールド殴打 / 跳躍攻撃|
|cv_brute_minor|Brute Minor|cv|3|スパイカー / 剛腕の打撃 / プラズマグレネード|
|cv_brute_major|Brute Major|cv|3|スパイカー / 剛腕の打撃 / プラズマグレネード|
|cv_brute_ultra|Brute Ultra|cv|3|bruteshot / 剛腕の打撃 / プラズマグレネード|
|cv_brute_captain|Brute Captain|cv|2|bruteshot / 剛腕の打撃|
|cv_brute_captain_major|Brute Captain Major|cv|3|カービン / 剛腕の打撃 / プラズマグレネード|
|cv_brute_captain_ultra|Brute Captain Ultra|cv|2|燃料ロッド砲 / 剛腕の打撃|
|cv_brute_bodyguard|Brute Bodyguard|cv|2|スパイカー / 剛腕の打撃|
|cv_brute_honor_guard|Brute Honor Guard|cv|2|bruteshot / 剛腕の打撃|
|cv_brute_stalker|Brute Stalker|cv|3|スパイカー / 近接地雷 / 光学迷彩|
|cv_brute_jumper|Brute Jumper|cv|2|スパイカー / 跳躍攻撃|
|cv_brute_jumper_major|Brute Jumper Major|cv|2|bruteshot / 跳躍攻撃|
|cv_brute_jumper_captain|Brute Jumper Captain|cv|2|bruteshot / 跳躍攻撃|
|cv_brute_chieftain_gravity_hammer|Brute Chieftain / Gravity Hammer|cv|2|重力ハンマー / 突進|
|cv_brute_war_chieftain_plasma_cannon|Brute War Chieftain / Plasma Cannon|cv|2|燃料ロッド砲 / 重力ハンマー|
|cv_drone_minor|Drone Minor|cv|2|プラズマ射撃 / 爪の切り裂き|
|cv_drone_major|Drone Major|cv|2|ニードラー / 爪の切り裂き|
|cv_drone_ultra|Drone Ultra|cv|2|プラズマ射撃 / 爪の切り裂き|
|cv_drone_leader|Drone Leader|cv|2|プラズマ射撃 / 爪の切り裂き|
|cv_hunter_fuel_rod|Hunter / Fuel Rod|cv|3|燃料ロッド砲 / シールド殴打 / 突進|
|cv_hunter_assault_beam|Hunter / Assault Beam|cv|3|エネルギービーム / シールド殴打 / 突進|
|cv_engineer_huragok|Engineer / Huragok|cv|2|修復 / シールド供給|
|cv_san_shyuum_gravity_throne|San Shyuum / Gravity Throne|cv|2|エネルギービーム / 瞬間移動|
|cv_ghost|Ghost|cv|2|二連プラズマ / 突進|
|cv_wraith_plasma_mortar|Wraith / Plasma Mortar|cv|2|迫撃砲 / プラズマ射撃|
|cv_anti_air_wraith|Anti-Air Wraith|cv|2|燃料ロッド砲 / プラズマ射撃|
|cv_banshee|Banshee|cv|2|二連プラズマ / 燃料ロッド砲|
|cv_space_banshee|Space Banshee|cv|2|二連プラズマ / ロケット砲|
|cv_seraph|Seraph|cv|2|プラズマ射撃 / ロケット砲|
|cv_spirit_dropship|Spirit Dropship|cv|2|プラズマ射撃 / 兵員降下|
|cv_phantom_dropship|Phantom Dropship|cv|2|プラズマ射撃 / 兵員降下|
|cv_lich|Lich|cv|2|エネルギービーム / 兵員降下|
|cv_scarab_protos|Scarab / Protos|cv|3|エネルギービーム / 踏みつけ / プラズマ射撃|
|cv_scarab_deutoros|Scarab / Deutoros|cv|3|エネルギービーム / 踏みつけ / プラズマ射撃|
|cv_spectre_transport|Spectre Transport|cv|2|プラズマ射撃 / 突進|
|cv_brute_prowler|Brute Prowler|cv|2|プラズマ射撃 / 突進|
|cv_brute_chopper|Brute Chopper|cv|2|スパイカー / 突進|
|cv_shade_plasma_turret|Shade / Plasma Turret|cv|1|プラズマ射撃|
|cv_shade_fuel_rod_turret|Shade / Fuel Rod Turret|cv|1|燃料ロッド砲|
|cv_shade_anti_air_turret|Shade / Anti-Air Turret|cv|1|二連プラズマ|
|cv_harvester|Harvester|cv|2|エネルギービーム / 兵員降下|
|th_dog_imitation|Dog Imitation|th|2|噛みつき / 接触同化|
|th_kennel_thing_split_dog|Kennel Thing / Split Dog|th|3|触手の薙ぎ払い / 酸液 / 接触同化|
|th_kennel_thing_escape_organism|Kennel Thing / Escape Organism|th|3|触手の薙ぎ払い / 跳躍攻撃 / 接触同化|
|th_bennings_incomplete_imitation|Bennings / Incomplete Imitation|th|2|爪の切り裂き / 接触同化|
|th_norris_chest_maw|Norris / Chest Maw|th|3|開いた顎の捕食 / 触手の薙ぎ払い / 接触同化|
|th_norris_head_spider|Norris / Head Spider|th|2|噛みつき / 接触同化|
|th_palmer_vertical_maw|Palmer / Vertical Maw|th|3|開いた顎の捕食 / 触手の薙ぎ払い / 接触同化|
|th_blood_test_fragment|Blood Test Fragment|th|2|跳躍攻撃 / 接触同化|
|th_windows_assimilating_body|Windows / Assimilating Body|th|2|触手の薙ぎ払い / 接触同化|
|th_blair_human_imitation|Blair / Human Imitation|th|2|爪の切り裂き / 接触同化|
|th_blair_giant_composite|Blair / Giant Composite|th|4|開いた顎の捕食 / 触手の薙ぎ払い / 踏みつけ / 接触同化|
|th_original_thing_ice_escape|Original Thing / Ice Escape|th|3|触手の銛 / 開いた顎の捕食 / 接触同化|
|th_griggs_split_face_and_chest|Griggs / Split Face and Chest|th|3|開いた顎の捕食 / 触手の薙ぎ払い / 接触同化|
|th_juliette_abdominal_maw|Juliette / Abdominal Maw|th|4|開いた顎の捕食 / 爪の切り裂き / 触手の薙ぎ払い / 接触同化|
|th_karl_partial_assimilation|Karl / Partial Assimilation|th|2|触手の薙ぎ払い / 接触同化|
|th_edvard_insectoid_body|Edvard / Insectoid Body|th|3|爪の切り裂き / 触手の銛 / 接触同化|
|th_edvard_centipede_hand|Edvard / Centipede Hand|th|2|噛みつき / 接触同化|
|th_edvard_detached_arm|Edvard / Detached Arm|th|2|爪の切り裂き / 接触同化|
|th_jonas_face_attachment|Jonas / Face Attachment|th|2|触手の薙ぎ払い / 接触同化|
|th_split_face_edvard_adam|Split Face / Edvard Adam|th|3|爪の切り裂き / 開いた顎の捕食 / 接触同化|
|th_sander_final_composite|Sander / Final Composite|th|4|爪の切り裂き / 開いた顎の捕食 / 触手の薙ぎ払い / 接触同化|
|th_carter_human_imitation|Carter / Human Imitation|th|2|爪の切り裂き / 接触同化|
|dr_figure|Figure|dr|1|つかみ攻撃|
|dr_seek_humanoid|Seek / Humanoid|dr|2|突進 / 触手の薙ぎ払い|
|dr_seek_dam|Seek / Dam|dr|1|Seekの分体生成|
|dr_seek_hand|Seek Hand|dr|1|つかみ攻撃|
|dr_seek_sludge|Seek Sludge|dr|2|跳躍攻撃 / 酸液|
|dr_seek_worm|Seek Worm|dr|2|開いた顎の捕食 / 触手の薙ぎ払い|
|dr_rush|Rush|dr|1|廊下の高速通過|
|dr_ambush|Ambush|dr|1|往復襲撃|
|dr_eyes|Eyes|dr|1|視線への反応|
|dr_screech|Screech|dr|1|背後からの噛みつき|
|dr_dupe_hotel|Dupe / Hotel|dr|1|扉の待ち伏せ|
|dr_dupe_mines|Dupe / Mines|dr|1|扉の待ち伏せ|
|dr_halt|Halt|dr|1|反転の警告|
|dr_sally|Sally|dr|2|突進 / 剛腕の打撃|
|dr_hide|Hide|dr|1|隠れ場所からの排出|
|dr_jack|Jack|dr|1|突然の出現|
|dr_timothy|Timothy|dr|1|噛みつき|
|dr_dread|Dread|dr|1|時間切れの襲撃|
|dr_snare|Snare|dr|1|足止め|
|dr_void|Void|dr|2|引力 / 瞬間移動|
|dr_el_goblino|El Goblino|dr|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|dr_jeff|Jeff|dr|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|dr_bob|Bob|dr|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|dr_weirdo|Weirdo|dr|1|突然の出現|
|dr_portrait|Portrait|dr|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|dr_charles|Charles|dr|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|dr_world_lotus|World Lotus|dr|1|蘇生の支援|
|dr_moonlight_guiding_light|Moonlight / Guiding Light|dr|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|dr_starlight_curious_light|Starlight / Curious Light|dr|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|dr_red_light_modifying_light|Red Light / Modifying Light|dr|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|dr_giggle|Giggle|dr|1|顔への跳びつき|
|dr_grumble|Grumble|dr|2|噛みつき / 突進|
|dr_queen_grumble|Queen Grumble|dr|2|噛みつき / 突進|
|dr_gloombat|Gloombat|dr|2|噛みつき / 群れの襲撃|
|dr_louie|Louie|dr|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|dr_haste|Haste|dr|1|時間制限の追跡|
|dr_blitz|Blitz|dr|1|往復襲撃|
|dr_lookman|Lookman|dr|1|視線への反応|
|dr_honcho|Honcho|dr|2|突進 / つかみ攻撃|
|dr_drone_archives|Drone / Archives|dr|2|索敵 / 廊下の高速通過|
|dr_forget_me_not|Forget-Me-Not|dr|2|視線への反応 / 背後からの噛みつき|
|dr_teller|Teller|dr|1|突然の出現|
|dr_bash|Bash|dr|1|廊下の高速通過|
|dr_scribbles|Scribbles|dr|1|往復襲撃|
|dr_ransom|Ransom|dr|1|動きを検知する警告|
|dr_alma|Alma|dr|3|視線への反応 / 跳躍攻撃 / 継続吸収|
|dr_fih|Fih|dr|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|dr_groundskeeper|Groundskeeper|dr|2|刃の斬撃 / 突進|
|dr_eyestalk|Eyestalk|dr|1|視線への反応|
|dr_bramble|Bramble|dr|2|触手の薙ぎ払い / 足止め|
|dr_surge|Surge|dr|1|廊下の高速通過|
|dr_mandrake|Mandrake|dr|2|衝撃波 / 足止め|
|dr_monument|Monument|dr|2|視線で停止 / つかみ攻撃|
|dr_caw|Caw|dr|1|突然の出現|
|dr_grampy|Grampy|dr|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|dr_creak|Creak|dr|2|視線に反応する追跡 / つかみ攻撃|
|dr_meld|Meld|dr|1|絡みつく減速|
|dr_cobbler|Cobbler|dr|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|dr_noise|Noise|dr|1|動いた相手を追跡|
|dr_stem|Stem|dr|2|噛みつき / 突進|
|dr_hijack|Hijack|dr|2|不規則な追跡 / つかみ攻撃|
|dr_a_60|A-60|dr|1|廊下の高速通過|
|dr_a_90|A-90|dr|1|動きを検知する警告|
|dr_a_120|A-120|dr|1|往復襲撃|
|dr_glitch|Glitch|dr|2|瞬間移動 / 引力|
|dr_glitched_rush_rniushcg|Glitched Rush / RNIUSHCg|dr|2|廊下の高速通過 / 瞬間移動|
|dr_glitched_ambush_ar0xmbush|Glitched Ambush / AR0xMBUSH|dr|2|往復襲撃 / 瞬間移動|
|dr_glitched_screech_scjvereech|Glitched Screech / SCJVEREECH|dr|2|背後からの噛みつき / 瞬間移動|
|cv_gravity_shield_chieftain_tartarus|Gravity Shield Chieftain / Tartarus|cv|3|重力ハンマー / シールド供給 / 地面の衝撃波|
|cv_huragok_explosive_harness|Huragok / Explosive Harness|cv|3|修復 / シールド供給 / 自爆装置|
|dm_zombieman|Zombieman|dm|2|ライフル / 剛腕の打撃|
|dm_shotgun_guy|Shotgun Guy|dm|2|ショットガン / 剛腕の打撃|
|dm_chaingunner|Chaingunner|dm|2|機関砲 / 剛腕の打撃|
|dm_imp_classic|Imp / Classic|dm|2|火球 / 爪の切り裂き|
|dm_pinky_classic|Pinky / Classic|dm|2|噛みつき / 突進|
|dm_spectre_classic|Spectre / Classic|dm|2|噛みつき / 突進|
|dm_lost_soul_classic|Lost Soul / Classic|dm|1|突進|
|dm_cacodemon_classic|Cacodemon / Classic|dm|2|火球 / 噛みつき|
|dm_baron_of_hell_classic|Baron of Hell / Classic|dm|2|緑炎弾 / 爪の切り裂き|
|dm_cyberdemon_classic|Cyberdemon / Classic|dm|2|ロケット砲 / 踏みつけ|
|dm_spider_mastermind_classic|Spider Mastermind / Classic|dm|2|機関砲 / 踏みつけ|
|dm_hell_knight_classic|Hell Knight / Classic|dm|2|緑炎弾 / 爪の切り裂き|
|dm_revenant_classic|Revenant / Classic|dm|2|誘導ミサイル / 剛腕の打撃|
|dm_mancubus_classic|Mancubus / Classic|dm|2|両腕の拡散火球 / 剛腕の打撃|
|dm_arachnotron_classic|Arachnotron / Classic|dm|2|プラズマ射撃 / 爪の切り裂き|
|dm_pain_elemental_classic|Pain Elemental / Classic|dm|1|ロストソウル召喚|
|dm_arch_vile_classic|Arch-vile / Classic|dm|2|地獄の炎 / 死体蘇生|
|dm_wolfenstein_ss_secret_map|Wolfenstein SS / Secret Map|dm|2|ライフル / 剛腕の打撃|
|dm_commander_keen_effigy|Commander Keen / Effigy|dm|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|dm_icon_of_sin_wall|Icon of Sin / Wall|dm|1|悪魔の召喚|
|dm_nightmare_spectre_psx|Nightmare Spectre / PSX|dm|2|噛みつき / 突進|
|dm_nightmare_imp_doom_64|Nightmare Imp / Doom 64|dm|2|火球 / 爪の切り裂き|
|dm_mother_demon_doom_64|Mother Demon / Doom 64|dm|2|地獄の炎 / 誘導ミサイル|
|dm_resurrector_lost_levels|Resurrector / Lost Levels|dm|2|地獄の炎 / 誘導ミサイル|
|dm_banshee_legacy_of_rust|Banshee / Legacy of Rust|dm|1|接触自爆|
|dm_ghoul_legacy_of_rust|Ghoul / Legacy of Rust|dm|1|プラズマ射撃|
|dm_mindweaver_legacy_of_rust|Mindweaver / Legacy of Rust|dm|1|機関砲|
|dm_shocktrooper_legacy_of_rust|Shocktrooper / Legacy of Rust|dm|2|プラズマ射撃 / 剛腕の打撃|
|dm_tyrant_legacy_of_rust|Tyrant / Legacy of Rust|dm|2|ロケット砲 / 踏みつけ|
|dm_vassago_legacy_of_rust|Vassago / Legacy of Rust|dm|2|地獄の炎 / 爪の切り裂き|
|dm_arch_vile_doom_3|Arch-vile / Doom 3|dm|2|地獄の炎 / 悪魔の召喚|
|dm_cacodemon_doom_3|Cacodemon / Doom 3|dm|2|火球 / 噛みつき|
|dm_tentacle_commando|Tentacle Commando|dm|2|鞭の一閃 / 剛腕の打撃|
|dm_chaingun_commando|Chaingun Commando|dm|2|機関砲 / 剛腕の打撃|
|dm_cyberdemon_doom_3|Cyberdemon / Doom 3|dm|2|ロケット砲 / 踏みつけ|
|dm_pinky_doom_3|Pinky / Doom 3|dm|2|噛みつき / 突進|
|dm_hell_knight_doom_3|Hell Knight / Doom 3|dm|3|緑炎弾 / 爪の切り裂き / 噛みつき|
|dm_imp_doom_3|Imp / Doom 3|dm|3|火球 / 爪の切り裂き / 跳躍攻撃|
|dm_lost_soul_doom_3|Lost Soul / Doom 3|dm|1|突進|
|dm_mancubus_doom_3|Mancubus / Doom 3|dm|2|両腕の拡散火球 / 剛腕の打撃|
|dm_revenant_doom_3|Revenant / Doom 3|dm|2|誘導ミサイル / 剛腕の打撃|
|dm_z_sec_pistol_guard|Z-Sec Pistol Guard|dm|2|拳銃 / 剛腕の打撃|
|dm_z_sec_shotgun_guard|Z-Sec Shotgun Guard|dm|2|ショットガン / 剛腕の打撃|
|dm_z_sec_machine_gunner|Z-Sec Machine Gunner|dm|2|ライフル / 剛腕の打撃|
|dm_z_sec_riot_shield|Z-Sec Riot Shield|dm|2|拳銃 / シールド殴打|
|dm_zombie_doom_3|Zombie / Doom 3|dm|1|爪の切り裂き|
|dm_chainsaw_zombie|Chainsaw Zombie|dm|1|チェーンソー|
|dm_flaming_zombie|Flaming Zombie|dm|1|燃える接触|
|dm_fat_zombie|Fat Zombie|dm|1|剛腕の打撃|
|dm_cherub|Cherub|dm|2|爪の切り裂き / 跳躍攻撃|
|dm_guardian_of_hell|Guardian of Hell|dm|3|踏みつけ / 火球 / シーカー召喚|
|dm_seeker_doom_3|Seeker / Doom 3|dm|1|索敵|
|dm_maggot|Maggot|dm|2|爪の切り裂き / 跳躍攻撃|
|dm_tick|Tick|dm|2|噛みつき / 跳躍攻撃|
|dm_trite|Trite|dm|2|噛みつき / 跳躍攻撃|
|dm_vagary_doom_3|Vagary / Doom 3|dm|2|念動投擲 / 爪の切り裂き|
|dm_sabaoth|Sabaoth|dm|2|BFG弾 / 機関砲|
|dm_wraith_doom_3|Wraith / Doom 3|dm|2|瞬間移動 / 爪の切り裂き|
|dm_bio_suit_zombie|Bio-suit Zombie|dm|1|爪の切り裂き|
|dm_bruiser|Bruiser|dm|2|両腕の拡散火球 / 剛腕の打撃|
|dm_forgotten_one|Forgotten One|dm|1|突進|
|dm_helltime_hunter|Helltime Hunter|dm|2|時間減速 / 爪の切り裂き|
|dm_berserk_hunter|Berserk Hunter|dm|2|突進 / 剛腕の打撃|
|dm_invulnerability_hunter|Invulnerability Hunter|dm|3|シールド供給 / プラズマ射撃 / 剛腕の打撃|
|dm_maledict|Maledict|dm|3|隕石群 / 火球 / 噛みつき|
|dm_vulgar|Vulgar|dm|3|酸液 / 爪の切り裂き / 跳躍攻撃|
|dm_baron_of_hell_2016|Baron of Hell / 2016|dm|3|緑炎弾 / 踏みつけ / 爪の切り裂き|
|dm_cacodemon_2016|Cacodemon / 2016|dm|2|酸液 / 噛みつき|
|dm_cyberdemon_2016|Cyberdemon / 2016|dm|4|ロケット砲 / エネルギービーム / 地面の衝撃波 / 踏みつけ|
|dm_hell_knight_2016|Hell Knight / 2016|dm|3|剛腕の打撃 / 跳躍攻撃 / 踏みつけ|
|dm_imp_2016|Imp / 2016|dm|4|火球 / 溜め火球 / 爪の切り裂き / 跳躍攻撃|
|dm_lost_soul_2016|Lost Soul / 2016|dm|1|接触自爆|
|dm_mancubus_2016|Mancubus / 2016|dm|3|両腕の拡散火球 / flame / 剛腕の打撃|
|dm_pinky_2016|Pinky / 2016|dm|2|突進 / 噛みつき|
|dm_possessed_scientist|Possessed / Scientist|dm|1|爪の切り裂き|
|dm_possessed_engineer|Possessed Engineer|dm|1|接触自爆|
|dm_possessed_soldier|Possessed Soldier|dm|3|プラズマ射撃 / 溜めプラズマ / 剛腕の打撃|
|dm_possessed_security|Possessed Security|dm|2|ショットガン / シールド殴打|
|dm_revenant_2016|Revenant / 2016|dm|3|ロケット砲 / 誘導ミサイル / 剛腕の打撃|
|dm_spectre_2016|Spectre / 2016|dm|2|突進 / 噛みつき|
|dm_spider_mastermind_2016|Spider Mastermind / 2016|dm|3|プラズマ射撃 / 念動投擲 / 踏みつけ|
|dm_cyber_mancubus_2016|Cyber Mancubus / 2016|dm|3|酸液 / 両腕の拡散火球 / 剛腕の打撃|
|dm_harvester_2016|Harvester / 2016|dm|2|エネルギービーム / 継続吸収|
|dm_hell_guard_shield|Hell Guard / Shield|dm|3|シールド殴打 / 地面の衝撃波 / 火球|
|dm_hell_guard_twin|Hell Guard / Twin|dm|2|剛腕の打撃 / 火球|
|dm_hell_razer|Hell Razer|dm|2|レーザー / 剛腕の打撃|
|dm_prowler_2016|Prowler / 2016|dm|2|跳躍攻撃 / 爪の切り裂き|
|dm_summoner_2016|Summoner / 2016|dm|3|瞬間移動 / 悪魔の召喚 / 地獄の炎|
|dm_unwilling|Unwilling|dm|1|爪の切り裂き|
|dm_arch_vile_eternal|Arch-vile / Eternal|dm|4|地獄の炎 / 悪魔の召喚 / 味方強化 / 瞬間移動|
|dm_arachnotron_eternal|Arachnotron / Eternal|dm|3|プラズマ射撃 / プラズマグレネード / 爪の切り裂き|
|dm_baron_of_hell_eternal|Baron of Hell / Eternal|dm|3|刃の斬撃 / 跳躍攻撃 / 踏みつけ|
|dm_cacodemon_eternal|Cacodemon / Eternal|dm|3|火球 / 噛みつき / 跳躍攻撃|
|dm_cyber_mancubus_eternal|Cyber Mancubus / Eternal|dm|2|酸液 / 剛腕の打撃|
|dm_dread_knight|Dread Knight|dm|3|刃の斬撃 / 地面の衝撃波 / 跳躍攻撃|
|dm_hell_knight_eternal|Hell Knight / Eternal|dm|3|剛腕の打撃 / 跳躍攻撃 / 踏みつけ|
|dm_imp_eternal|Imp / Eternal|dm|3|火球 / 爪の切り裂き / 跳躍攻撃|
|dm_mancubus_eternal|Mancubus / Eternal|dm|3|両腕の拡散火球 / flame / 剛腕の打撃|
|dm_lost_soul_eternal|Lost Soul / Eternal|dm|1|接触自爆|
|dm_pain_elemental_eternal|Pain Elemental / Eternal|dm|2|ロストソウル召喚 / 火球|
|dm_pinky_eternal|Pinky / Eternal|dm|2|突進 / 噛みつき|
|dm_prowler_eternal|Prowler / Eternal|dm|2|瞬間移動 / 爪の切り裂き|
|dm_revenant_eternal|Revenant / Eternal|dm|3|誘導ミサイル / ロケット砲 / 剛腕の打撃|
|dm_soldier_blaster|Soldier Blaster|dm|2|プラズマ射撃 / 剛腕の打撃|
|dm_soldier_shield|Soldier Shield|dm|2|ショットガン / シールド殴打|
|dm_spectre_eternal|Spectre / Eternal|dm|2|突進 / 噛みつき|
|dm_zombie_eternal|Zombie / Eternal|dm|1|爪の切り裂き|
|dm_mecha_zombie|Mecha Zombie|dm|2|プラズマ射撃 / flame|
|dm_buff_totem|Buff Totem|dm|2|味方強化 / 悪魔の召喚|
|dm_carcass|Carcass|dm|3|防壁生成 / 地面の衝撃波 / 剛腕の打撃|
|dm_doom_hunter_sled|Doom Hunter / Sled|dm|3|ロケット砲 / 誘導ミサイル / チェーンソー|
|dm_doom_hunter_detached|Doom Hunter / Detached|dm|2|誘導ミサイル / チェーンソー|
|dm_gargoyle|Gargoyle|dm|3|酸液 / 爪の切り裂き / 跳躍攻撃|
|dm_gladiator_shield_phase|Gladiator / Shield Phase|dm|2|フレイル / シールド殴打|
|dm_gladiator_twin_flails|Gladiator / Twin Flails|dm|2|フレイル / 地面の衝撃波|
|dm_icon_of_sin_armored|Icon of Sin / Armored|dm|4|隕石群 / flame / 剛腕の打撃 / 悪魔の召喚|
|dm_icon_of_sin_exposed|Icon of Sin / Exposed|dm|4|隕石群 / flame / 剛腕の打撃 / 悪魔の召喚|
|dm_khan_maykr|Khan Maykr|dm|3|エネルギービーム / 火球 / 地獄の炎|
|dm_marauder|Marauder|dm|4|斧の強打 / 斧のエネルギー波 / ショットガン / 霊狼召喚|
|dm_maykr_drone|Maykr Drone|dm|1|プラズマ射撃|
|dm_tentacle_eternal|Tentacle / Eternal|dm|1|触手の薙ぎ払い|
|dm_giant_tentacle_eternal|Giant Tentacle / Eternal|dm|2|触手の薙ぎ払い / 踏みつけ|
|dm_tyrant_eternal|Tyrant / Eternal|dm|3|ロケット砲 / エネルギービーム / 踏みつけ|
|dm_whiplash|Whiplash|dm|2|鞭の一閃 / 地面の衝撃波|
|dm_cueball|Cueball|dm|1|接触自爆|
|dm_kalibas|Kalibas|dm|1|火球|
|dm_blood_maykr|Blood Maykr|dm|2|エネルギービーム / 地獄の炎|
|dm_spirit|Spirit|dm|1|憑依強化|
|dm_turret_ancient_gods|Turret / Ancient Gods|dm|1|プラズマ射撃|
|dm_whiplash_spectre|Whiplash Spectre|dm|2|鞭の一閃 / 地面の衝撃波|
|dm_trial_of_maligog|Trial of Maligog|dm|2|火球 / 絡みつく減速|
|dm_samur_maykr_seraphim|Samur Maykr / Seraphim|dm|3|エネルギービーム / 瞬間移動 / 悪魔の召喚|
|dm_armored_baron|Armored Baron|dm|2|フレイル / 突進|
|dm_cursed_prowler|Cursed Prowler|dm|3|呪いの爪 / 瞬間移動 / 爪の切り裂き|
|dm_demonic_trooper|Demonic Trooper|dm|1|プラズマ射撃|
|dm_riot_soldier|Riot Soldier|dm|2|機関砲 / シールド殴打|
|dm_screecher|Screecher|dm|1|死亡時の強化叫声|
|dm_stone_imp_eternal|Stone Imp / Eternal|dm|2|回転突進 / 爪の切り裂き|
|dm_dark_lord_davoth|Dark Lord / Davoth|dm|4|刃の斬撃 / シールド殴打 / 霊狼召喚 / 継続吸収|
|dm_marauder_spirit_wolf|Marauder Spirit Wolf|dm|2|噛みつき / 突進|
|dm_agaddon_hunter|Agaddon Hunter|dm|3|刃の斬撃 / シールド殴打 / 突進|
|dm_arachnotron_dark_ages|Arachnotron / Dark Ages|dm|3|機関砲 / 粘着爆弾 / 爪の切り裂き|
|dm_armored_arachnotron|Armored Arachnotron|dm|3|機関砲 / 粘着爆弾 / 爪の切り裂き|
|dm_ballistatron|Ballistatron|dm|2|バリスタ / 爪の切り裂き|
|dm_battle_knight|Battle Knight|dm|3|斧の強打 / 斧投擲 / 踏みつけ|
|dm_cacodemon_hybrid|Cacodemon Hybrid|dm|3|防御エネルギーフィールド / 火球 / 噛みつき|
|dm_chaingunner_soldier_dark_ages|Chaingunner Soldier / Dark Ages|dm|2|機関砲 / シールド殴打|
|dm_cosmic_baron|Cosmic Baron|dm|3|精神波 / 刃の斬撃 / 突進|
|dm_cyberdemon_dark_ages|Cyberdemon / Dark Ages|dm|4|ロケット砲 / エネルギービーム / 踏みつけ / 爪の切り裂き|
|dm_hell_knight_dark_ages|Hell Knight / Dark Ages|dm|3|剛腕の打撃 / 跳躍攻撃 / 踏みつけ|
|dm_imp_dark_ages|Imp / Dark Ages|dm|2|追尾エネルギーフェンス / 爪の切り裂き|
|dm_imp_stalker|Imp Stalker|dm|2|追尾火球 / 爪の切り裂き|
|dm_lost_soul_dark_ages|Lost Soul / Dark Ages|dm|1|突進|
|dm_mancubus_dark_ages|Mancubus / Dark Ages|dm|3|両腕の拡散火球 / 酸液 / 剛腕の打撃|
|dm_armored_mancubus|Armored Mancubus|dm|3|追尾エネルギーフェンス / 両腕の拡散火球 / 剛腕の打撃|
|dm_mortar_mancubus|Mortar Mancubus|dm|2|酸液 / 迫撃砲|
|dm_maykr_drone_dark_ages|Maykr Drone / Dark Ages|dm|1|プラズマ射撃|
|dm_nightmare_imp_stalker|Nightmare Imp Stalker|dm|2|追尾火球 / 爪の切り裂き|
|dm_pinky_rider|Pinky Rider|dm|3|突進 / 騎乗弓射 / 噛みつき|
|dm_armored_pinky_rider|Armored Pinky Rider|dm|3|突進 / 騎乗弓射 / 噛みつき|
|dm_revenant_dark_ages|Revenant / Dark Ages|dm|2|追尾する髑髏 / 鎌の斬撃|
|dm_soldier_dark_ages|Soldier / Dark Ages|dm|2|連結火球 / 剛腕の打撃|
|dm_shield_soldier_metal|Shield Soldier / Metal|dm|2|連結火球 / シールド殴打|
|dm_shield_soldier_plasma|Shield Soldier / Plasma|dm|2|プラズマ射撃 / シールド殴打|
|dm_stone_imp_dark_ages|Stone Imp / Dark Ages|dm|2|回転突進 / 爪の切り裂き|
|dm_tentacle_dark_ages|Tentacle / Dark Ages|dm|1|触手の薙ぎ払い|
|dm_giant_tentacle_dark_ages|Giant Tentacle / Dark Ages|dm|2|触手の薙ぎ払い / 踏みつけ|
|dm_vagary_dark_ages|Vagary / Dark Ages|dm|3|プラズマ射撃 / ロケット砲 / 爪の切り裂き|
|dm_whiplash_dark_ages|Whiplash / Dark Ages|dm|2|鞭の一閃 / 十字エネルギー弾|
|dm_zombie_dark_ages|Zombie / Dark Ages|dm|1|爪の切り裂き|
|dm_acolyte|Acolyte|dm|3|瞬間移動 / 分身 / 精神波|
|dm_hell_cultist|Hell Cultist|dm|1|悪魔の召喚|
|dm_hell_tank|Hell Tank|dm|2|迫撃砲 / エネルギービーム|
|dm_komodo_mechanical_fist|Komodo / Mechanical Fist|dm|2|火球の連射 / 剛腕の打撃|
|dm_komodo_chainsaw_staff|Komodo / Chainsaw Staff|dm|2|火球の連射 / チェーンソー|
|dm_cyclops_titan|Cyclops Titan|dm|3|レーザー / 槍の突き / 踏みつけ|
|dm_giant_cacodemon|Giant Cacodemon|dm|3|瞬間移動 / 火球 / 噛みつき|
|dm_hell_carrier|Hell Carrier|dm|2|ロケット砲 / 火球の連射|
|dm_hell_ship|Hell Ship|dm|2|プラズマ射撃 / ロケット砲|
|dm_titan_unarmored|Titan / Unarmored|dm|2|剛腕の打撃 / 踏みつけ|
|dm_titan_armored|Titan / Armored|dm|3|剛腕の打撃 / シールド殴打 / 踏みつけ|
|dm_titan_spear|Titan / Spear|dm|2|槍の突き / 踏みつけ|
|dm_enhanced_ahzrak_ground|Enhanced Ahzrak / Ground|dm|2|槍の突き / 地面の衝撃波|
|dm_enhanced_ahzrak_winged|Enhanced Ahzrak / Winged|dm|3|槍の突き / 火球 / 突進|
|dm_ahzrak_final|Ahzrak / Final|dm|3|槍の突き / 突進 / 地面の衝撃波|
|dm_witch|Witch|dm|3|瞬間移動 / シールド供給 / 火球の連射|
|dm_kreed_maykr|Kreed Maykr|dm|3|エネルギービーム / 火球 / シールド供給|
|dm_the_old_one|The Old One|dm|3|触手の薙ぎ払い / エネルギービーム / 火球の連射|
|dm_champion_empowerment|Champion / Empowerment|dm|2|剛腕の打撃 / 地面の衝撃波|
|dm_demonic_leader_empowerment|Demonic Leader / Empowerment|dm|2|味方強化 / 火球|
|dm_enforcer_empowerment|Enforcer / Empowerment|dm|2|シールド供給 / 火球|
|dm_buzzsaw_revelations|Buzzsaw / Revelations|dm|4|槍の突き / 突進 / シールド殴打 / プラズマ射撃|
|dm_warlock_revelations|Warlock / Revelations|dm|3|追尾火球 / 地獄の炎 / 味方強化|
|dm_cosmic_elemental_revelations|Cosmic Elemental / Revelations|dm|3|シーカー召喚 / 火球 / 噛みつき|
|dm_arch_vile_revelations|Arch-vile / Revelations|dm|3|地獄の炎 / 悪魔の召喚 / シールド供給|
|dm_armored_arch_vile_revelations|Armored Arch-vile / Revelations|dm|3|地獄の炎 / 悪魔の召喚 / シールド供給|
|dm_agaddon_brute_revelations|Agaddon Brute / Revelations|dm|3|斧の強打 / 突進 / 地面の衝撃波|
|dm_nightmare_revenant_revelations|Nightmare Revenant / Revelations|dm|2|誘導ミサイル / 剛腕の打撃|
|dm_nightmare_whiplash_revelations|Nightmare Whiplash / Revelations|dm|2|鞭の一閃 / 地面の衝撃波|
|dm_blighted_hell_knight_revelations|Blighted Hell Knight / Revelations|dm|3|剛腕の打撃 / 跳躍攻撃 / 呪いの爪|
|dm_blighted_zombie_revelations|Blighted Zombie / Revelations|dm|2|爪の切り裂き / 呪いの爪|
|dm_insurgent_revelations|Insurgent / Revelations|dm|2|ライフル / 刃の斬撃|
|dm_vagary_leader_revelations|Vagary Leader / Revelations|dm|3|念動投擲 / 爪の切り裂き / 悪魔の召喚|
|dm_hallowed_zombie_revelations|Hallowed Zombie / Revelations|dm|1|爪の切り裂き|
|dm_marok_revelations|Marok / Revelations|dm|4|エネルギービーム / 刃の斬撃 / 火球の連射 / シールド供給|
|dm_the_henchman_revelations|The Henchman / Revelations|dm|4|剛腕の打撃 / 踏みつけ / 突進 / 地面の衝撃波|
|dm_xal_goroth_the_imprisoned_revelations|Xal Goroth the Imprisoned / Revelations|dm|4|触手の薙ぎ払い / エネルギービーム / 火球の連射 / 地面の衝撃波|
|skBlock|スカルク|sk|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|skVein|スカルクヴェイン|sk|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|skCatalyst|スカルクカタリスト|sk|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|skSensor|スカルクセンサー|sk|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|skCalibrated|調律されたスカルクセンサー|sk|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|skShrieker|スカルクシュリーカー|sk|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|skWarden|ウォーデン|sk|2|両腕の殴打 / ソニックブーム|
|pmClanger|クランガー|P|1|シンバル衝撃|
|pmBuilder|ピグリン・ビルダー|P|1|爆弾投擲|
|pmSporeMedic|スポア・メディック|P|1|ネザースポア噴出|
|pmSeeker|シーカー|P|1|自爆突進|
|pmPigmadillo|ピグマディロ|P|1|装甲回転突進|
|pmSporeback|スポアバック|P|1|拘束キノコ投擲|
|pmLavaLauncher|ラヴァ・ランチャー|P|1|溶岩砲撃|
|pmPortalGuard|ポータル・ガード|P|2|フレイル打撃 / フレイル射出|
|pmBeast|ザ・ビースト|P|2|巨体突進 / 大槌打撃|
|pmDevourer|ザ・デヴァウアー|P|2|胞子の吐瀉 / 巨体着地|
|pmUnbreakable|ザ・アンブレイカブル|P|2|腕の溶岩砲 / 重装打撃|
|pmGreatHog|ザ・グレートホッグ|P|3|巨槍薙ぎ / 魔法の杖 / 杖の衝撃波|
|pmSeer|シーア（非戦闘指揮者）|P|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|pmBarracks|ピグリン兵舎|P|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|pmBlazeTower|ブレイズロッド・タワー|P|1|防衛ブレイズロッド|
|pmNetherSpreader|ネザー・スプレッダー|P|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|tkThrall|宿られたスロール|tk|2|ソーラーの爪 / 短距離転移|
|tkAcolyte|宿られたアコライト|tk|5|アーク・シュレッダー / ボイド・ブーマー / ステイシス・ハウラー / アコライトの眼を展開 / 宿られた近接攻撃|
|tkKnight|宿られたナイト|tk|5|ボイド・ブーマー / ステイシス・ハウラー / ソーラージェット / 短距離転移 / ハイヴの殴打|
|tkWizard|宿られたウィザード|tk|3|ネクロマンティック・ゲイズ / シャドウスロール召喚 / 接近排除|
|tkOgre|宿られたオーガ|tk|2|ロットン・サージ / グラウンドスラム|
|tkVandal|宿られたバンダル|tk|5|ソーラー・ワイヤーライフル / アーク・シュラプネルランチャー / 防御バブル / 短距離転移 / フォールンの殴打|
|tkCaptain|宿られたキャプテン|tk|4|アーク・シュラプネルランチャー / アーク・ショックブレード / ダークネスボルト / 短距離転移|
|tkGoblin|宿られたゴブリン|tk|4|ボイド・スラップライフル / ソーラー・トーチハンマー / 味方への無敵テザー / ベックスの殴打|
|tkHobgoblin|宿られたホブゴブリン|tk|4|ボイド・ラインライフル / ボイド・スラップライフル / 短距離転移 / ベックスの殴打|
|tkMinotaur|宿られたミノタウロス|tk|3|ソーラー・トーチハンマー / ボイド・スラップライフル / 重機体の殴打|
|tkPsion|宿られたサイオン|tk|3|高速アーク・スラグライフル / 分裂 / サイキック近接|
|tkPhalanx|宿られたファランクス|tk|3|アーク・スラグライフル / シールドブラスト / シールドバッシュ|
|tkCenturion|宿られたセンチュリオン|tk|5|ボイド・プロジェクションライフル / アーク・スラグライフル / 追尾アクシオンダート / 短距離転移 / カバルの殴打|
|tkShadowThrall|シャドウスロール|tk|1|影のソーラーの爪|
|tkEye|アコライトの眼|tk|1|眼のアーク連射|
|tkShadowbeast|シャドウビースト|tk|1|影獣の噛みつき|
|tkAxion|アクシオンダート|tk|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|sl_doom|DOOM (1993) 主人公|sl|8|拳 / チェーンソー / ピストル / ショットガン / チェーンガン / ロケットランチャー / プラズマライフル / BFG9000|
|sl_ultimate|The Ultimate DOOM 主人公|sl|8|拳 / チェーンソー / ピストル / ショットガン / チェーンガン / ロケットランチャー / プラズマライフル / BFG9000|
|sl_doom2|DOOM II 主人公|sl|9|拳 / チェーンソー / ピストル / ショットガン / チェーンガン / ロケットランチャー / プラズマライフル / BFG9000 / スーパーショットガン|
|sl_master|Master Levels for DOOM II 主人公|sl|9|拳 / チェーンソー / ピストル / ショットガン / チェーンガン / ロケットランチャー / プラズマライフル / BFG9000 / スーパーショットガン|
|sl_tnt|Final DOOM: TNT Evilution 主人公|sl|9|拳 / チェーンソー / ピストル / ショットガン / チェーンガン / ロケットランチャー / プラズマライフル / BFG9000 / スーパーショットガン|
|sl_plutonia|Final DOOM: The Plutonia Experiment 主人公|sl|9|拳 / チェーンソー / ピストル / ショットガン / チェーンガン / ロケットランチャー / プラズマライフル / BFG9000 / スーパーショットガン|
|sl_norest|No Rest for the Living 主人公|sl|9|拳 / チェーンソー / ピストル / ショットガン / チェーンガン / ロケットランチャー / プラズマライフル / BFG9000 / スーパーショットガン|
|sl_sigil|SIGIL 主人公|sl|8|拳 / チェーンソー / ピストル / ショットガン / チェーンガン / ロケットランチャー / プラズマライフル / BFG9000|
|sl_sigil2|SIGIL II 主人公|sl|8|拳 / チェーンソー / ピストル / ショットガン / チェーンガン / ロケットランチャー / プラズマライフル / BFG9000|
|sl_rust|Legacy of Rust 主人公|sl|9|拳 / チェーンソー / ピストル / ショットガン / チェーンガン / ロケットランチャー / スーパーショットガン / インシネレーター / カラミティブレイド：最大チャージ|
|sl_doom64|DOOM 64 主人公|sl|10|拳 / チェーンソー / ピストル / ショットガン / チェーンガン / ロケットランチャー / プラズマライフル / BFG9000 / スーパーショットガン / Unmaker|
|sl_lostlevels|DOOM 64: The Lost Levels 主人公|sl|10|拳 / チェーンソー / ピストル / ショットガン / チェーンガン / ロケットランチャー / プラズマライフル / BFG9000 / スーパーショットガン / Unmaker|
|sl_doom3|DOOM 3 主人公|sl|12|拳 / チェーンソー / ピストル / ショットガン / チェーンガン / ロケットランチャー / プラズマライフル / BFG9000 / フラッシュライト打撃 / マシンガン / フラググレネード / ソウルキューブ|
|sl_roe|DOOM 3: Resurrection of Evil 主人公|sl|13|拳 / ピストル / ショットガン / チェーンガン / ロケットランチャー / プラズマライフル / BFG9000 / フラッシュライト打撃 / マシンガン / フラググレネード / スーパーショットガン / Grabber：弾の捕獲・投げ返し / Artifact：ヘルタイム／バーサーク／無敵|
|sl_lostmission|DOOM 3: The Lost Mission 主人公|sl|11|拳 / ピストル / ショットガン / チェーンガン / ロケットランチャー / プラズマライフル / BFG9000 / マシンガン / フラググレネード / スーパーショットガン / Grabber：弾の捕獲・投げ返し|
|sl_rpg|DOOM RPG 主人公|sl|10|消防斧 / 消火器 / ピストル / ショットガン / スーパーショットガン / チェーンガン / プラズマライフル / ロケットランチャー / BFG9000 / ドッグカラー|
|sl_rpg2_0|DOOM II RPG — Stan Blazkowicz 主人公|sl|13|チェーンソー / マシンガン / スコープ付きアサルトライフル / スーパーショットガン / チェーンガン / プラズマライフル / ロケットランチャー / BFG9000 / 聖水ピストル / セントリーボット射撃 / 赤セントリーボット自爆 / ソウルキューブ / 便器投擲|
|sl_rpg2_1|DOOM II RPG — Kira Morgan 主人公|sl|13|チェーンソー / マシンガン / スコープ付きアサルトライフル / スーパーショットガン / チェーンガン / プラズマライフル / ロケットランチャー / BFG9000 / 聖水ピストル / セントリーボット射撃 / 赤セントリーボット自爆 / ソウルキューブ / 便器投擲|
|sl_rpg2_2|DOOM II RPG — Riley O’Connor 主人公|sl|13|チェーンソー / マシンガン / スコープ付きアサルトライフル / スーパーショットガン / チェーンガン / プラズマライフル / ロケットランチャー / BFG9000 / 聖水ピストル / セントリーボット射撃 / 赤セントリーボット自爆 / ソウルキューブ / 便器投擲|
|sl_resurrection|DOOM Resurrection (iPhone) 主人公|sl|7|マシンガン / ショットガン / スーパーショットガン / チェーンガン / チェーンソー / プラズマライフル / BFG9000|
|sl_2016|DOOM (2016) 主人公|sl|27|拳 / チェーンソー / ピストル / ピストル：チャージショット / コンバットショットガン / スーパーショットガン / ヘビーアサルトライフル / チェーンガン / ロケットランチャー / プラズマライフル / ガウスキャノン / BFG9000 / フラググレネード / サイフォングレネード / ホログラムデコイ / グローリーキル / スティッキーボム / 3連バースト / プレシジョンボルト / マイクロミサイル / ヒートブラスト / スタンボム / ロックオンバースト / リモートデトネーション / シージモード / モバイルタレット / ガトリングローテーター|
|sl_vfr|DOOM VFR — Dr. Peters 主人公|sl|16|ピストル / コンバットショットガン / ヘビーアサルトライフル / ロケットランチャー / プラズマライフル / スーパーショットガン / ガウスキャノン / チェーンガン / フラググレネード / テレポート／テレフラグ / スティッキーボム / プレシジョンボルト / ヒートブラスト / ロックオンバースト / シージモード / モバイルタレット|
|sl_eternal|DOOM Eternal 主人公|sl|32|拳 / チェーンソー / コンバットショットガン / スーパーショットガン / ヘビーキャノン / チェーンガン / ロケットランチャー / プラズマライフル / バリスタ / BFG9000 / Unmaykr / ドゥームブレイド / ブラッドパンチ / ミートフック / フレイムベルチ / アイスボム / フラググレネード / ダッシュ / グローリーキル / スティッキーボム / フルオート / プレシジョンボルト / マイクロミサイル / ヒートブラスト / マイクロウェーブビーム / ロックオンバースト / リモートデトネーション / アーバレスト / デストロイヤーブレード / モバイルタレット / エネルギーシールド / クルーシブル|
|sl_tag1|The Ancient Gods — Part One 主人公|sl|31|拳 / チェーンソー / コンバットショットガン / スーパーショットガン / ヘビーキャノン / チェーンガン / ロケットランチャー / プラズマライフル / バリスタ / BFG9000 / Unmaykr / ドゥームブレイド / ブラッドパンチ / ミートフック / フレイムベルチ / アイスボム / フラググレネード / ダッシュ / グローリーキル / スティッキーボム / フルオート / プレシジョンボルト / マイクロミサイル / ヒートブラスト / マイクロウェーブビーム / ロックオンバースト / リモートデトネーション / アーバレスト / デストロイヤーブレード / モバイルタレット / エネルギーシールド|
|sl_tag2|The Ancient Gods — Part Two 主人公|sl|32|拳 / チェーンソー / コンバットショットガン / スーパーショットガン / ヘビーキャノン / チェーンガン / ロケットランチャー / プラズマライフル / バリスタ / BFG9000 / Unmaykr / ドゥームブレイド / ブラッドパンチ / ミートフック / フレイムベルチ / アイスボム / フラググレネード / ダッシュ / グローリーキル / スティッキーボム / フルオート / プレシジョンボルト / マイクロミサイル / ヒートブラスト / マイクロウェーブビーム / ロックオンバースト / リモートデトネーション / アーバレスト / デストロイヤーブレード / モバイルタレット / エネルギーシールド / センチネルハンマー|
|sl_darkages|DOOM: The Dark Ages 主人公|sl|18|コンバットショットガン / スーパーショットガン / アクセラレーター / サイクラー / パルヴァライザー / ラヴェジャー / インペイラー / シュレッダー / チェーンショット / ロケットランチャー / グレネードランチャー / バリスティック・フォース・クロスボウ / シールドソー：投擲 / シールドガード／パリィ / パワーガントレット / フレイル / ドレッドメイス / グローリーキル|
|sl_mighty|Mighty DOOM — Mini Slayer 主人公|sl|19|ヘビーアサルトライフル / コンバットショットガン / プラズマライフル / チェーンガン / 3連バースト / ロケットランチャー / バリスタ / スーパーショットガン / ガウスキャノン / センチネルハンマー / チェーンソー / クルーシブル / BFG9000 / Unmaykr / フラググレネード / フレイムベルチ / アイスボム / アークグレネード / アシッドスピット|
|slHologram|ホログラムデコイ|sl|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|utSans|Sans|sn|12|開幕：重力・骨列・4連ブラスター / 骨の上下ギャップ / 青い骨：動くと被弾 / 高さ違いの骨列 / 足場と骨の波 / 左右からの骨 / Gaster Blaster / 4方向Gaster Blaster / 青いSOUL・重力スラム / ショートカット：位置転換 / 最終連続攻撃 / スペシャル：攻撃せず待つ|
|utDustSans|Dust Sans（Murder!Sans）|sn|9|骨の上下ギャップ / 青い骨：動くと被弾 / 高さ違いの骨列 / 足場と骨の波 / 左右からの骨 / Gaster Blaster / 4方向Gaster Blaster / 青いSOUL・重力スラム / ショートカット：位置転換|
|piKirby|カービィ|kb|6|吸い込み / 空気弾 / スライディング / ダッシュ体当たり / 踏みつけ / 回転キック|
|piMetaKnight|メタナイト|mt|8|ギャラクシア斬撃 / 連続斬り / ソードビーム / ドリルスラッシュ / シャトルループ / マッハトルネイド / ディメンション斬り / 剣のガード|
|piDedede|デデデ大王|dd|9|ハンマーたたき / 回転ハンマー / スーパーデデデジャンプ / ヘッドスライディング / ゴルドー投げ / ハンマー投げ / ジェットハンマー / ハンマー衝撃波 / 吸い込み・星吐き|
|piBowser|クッパ|bw|10|火炎放射 / ファイアボール / ひっかき / かみつき / しっぽ攻撃 / クッパドロップ / スピニングシェル / つかみ投げ / 突進 / 連続火球|
|omOmori|オモリ（主人公）|om|19|ATTACK / GUARD / SAD POEM / STAB / BREAD SLICE / MOCK / HACK AWAY / OBSERVE / LUCKY SLICE / TRICK / PAINFUL TRUTH / SHUN / STARE / EXPLOIT / FINAL STRIKE / RED HANDS / VERTIGO / CRIPPLE / SUFFOCATE|
|omBoss|オモリ（ボス）|om|8|ATTACK / STAB / HACK AWAY / RED HANDS / RED HAND ATTACK / HAIR ATTACK / MARI ATTACK / FINAL ATTACK|
|omAubrey|オーブリー（夢世界）|om|13|ATTACK / GUARD / PEP TALK / HEADBUTT / COUNTER / TWIRL / TEAM SPIRIT / POWER HIT / MOOD WRECKER / WIND-UP THROW / MASH / BEATDOWN / LAST RESORT|
|omKel|ケル（夢世界）|om|15|ATTACK / GUARD / ANNOY / REBOUND / RUN N' GUN / CURVEBALL / RICOCHET / MEGAPHONE / CAN'T CATCH ME / RALLY / COMEBACK / TICKLE / FLEX / JUICE ME / SNOWBALL|
|omHero|ヒロ（夢世界）|om|19|ATTACK / GUARD / COOK / MASSAGE / CHARM / SMILE / FAST FOOD / HOMEMADE JAM / CAPTIVATE / ENCHANT / SHARE FOOD / MESMERIZE / DAZZLE / SNACK TIME / TEA TIME / SPICY FOOD / REFRESH / TENDERIZE / GATOR AID|
|omBasil|バジル（夢世界）|om|11|ATTACK / GUARD / CHEER / HERBAL REMEDY / PHOTOGRAPH / BODY SLAM / TULIP / GLADIOLUS / CACTUS / ROSE / FLOWER CROWN|
|omMari|マリ（夢世界）|om|1|PICNIC（回復支援・翻案）|
|suSunny|サニー|su|9|ATTACK / GUARD / CALM DOWN / FOCUS / PERSIST / OVERCOME / ALLEGRO / ENCORE / CHERISH|
|suAubrey|オーブリー（現実）|su|3|ATTACK / GUARD / HOMERUN|
|suKel|ケル（現実）|su|3|ATTACK / GUARD / ENCOURAGE|
|suHero|ヒロ（現実）|su|3|ATTACK / GUARD / FIRST AID|
|suBasil|バジル（現実）|su|2|ATTACK / GUARD|
|suPolly|ポリー|su|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|suKim|キム|su|2|ATTACK / GUARD|
|suVance|ヴァンス|su|2|ATTACK / GUARD|
|suCharlene|シャーリーン|su|2|ATTACK / GUARD|
|suAngel|エンジェル|su|2|ATTACK / GUARD|
|suMaverick|ミカエル（THE MAVERICK）|su|2|ATTACK / GUARD|
|hbVul|バル艦長|mt|1|艦内指揮（支援の翻案）|
|hbSailor|水兵ワドルディ|mt|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|hbAxe|アックスナイト|mt|2|斧の振り下ろし / ブーメランアックス|
|hbMace|メイスナイト|mt|2|鉄球振り回し / 鎖鉄球|
|hbTrident|トライデントナイト|mt|2|三叉槍投げ / 槍の電撃|
|hbJavelin|ジャベリンナイト|mt|3|槍回転 / ジャベリン投げ / 跳躍槍|
|hbSword|ソードナイト|mt|2|剣の斬撃 / 剣突進|
|hbBlade|ブレイドナイト|mt|2|剣の斬撃 / 跳躍斬り|
|hbHeavyLobster|ヘビーロブスター|mt|6|はさみ / ロケット突進 / 大ジャンプ / 火炎放射 / ミニロブスター放出 / ペイントブロビー射出|
|hbMiniLobster|ミニロブスター|mt|1|走行体当たり|
|hbPaintBlobby|ペイントブロビー|mt|1|ペイント跳ね|
|hbComboCannon|2連主砲（コンボキャノン）|mt|4|回転砲塔の連射 / 下部レーザー / アームのつかみ投げ / アーム爆弾|
|hbReactor|リアクター|mt|4|反射レーザー / 固定レーザー / 火球砲 / 床の火炎放射|
|hbWheelie|ウィリー|mt|1|高速走行|
|hbJukid|ジュキッド|mt|4|拳撃 / 跳び蹴り / つかみ投げ / 気弾|
|hbPoppySr|ポピーブロスSr.|mt|3|爆弾投げ / 3連爆弾 / ジャンプ体当たり|
|hbFrosty|ミスター・フロスティ|mt|3|氷ブロック / 突進 / つかみ投げ|
|hbBugzzy|バグジー|mt|4|つかみ投げ / 突進 / 跳躍踏みつけ / 子虫射出|
|hbKawasaki|コックカワサキ|mt|3|おたま / 皿投げ / 調理つかみ|
|hbBioSpark|バイオスパーク|mt|3|手裏剣 / 忍者斬り / 跳び蹴り|
|hbJungleBomb|ジャングルボム|mt|1|爆弾投下|
|hbBomber|ボンバー|mt|1|クラッシュ自爆|
|hbPlasmaWisp|プラズマウィスプ|mt|2|プラズマ弾 / 大プラズマ|
|hbBounder|バウンダー|mt|2|星弾 / 体当たり|
|hbGip|ギップ|mt|2|星弾 / 体当たり|
|hbPoppyJr|ポピーブロスJr.|mt|2|爆弾 / カッター|
|hbBurningLeo|バーニンレオ|mt|2|火炎 / バーニング突進|
|hbRocky|ロッキー|mt|1|ストーン落下|
|hbGim|ギム|mt|1|ヨーヨー|
|hbShotzo|シャッツォ|mt|1|砲弾|
|hbMotoShotzo|モトシャッツォ|mt|1|連射砲|
|hbGordo|ゴルドー|mt|1|針の接触|
|hbSirKibble|サーキブル|mt|1|カッター|
|hbBroomHatter|ブルームハッター|mt|1|ほうき|
|hbCapsuleJ|カプセルJ|mt|1|ジェット突進|
|hbCapsuleJ2|カプセルJ2|mt|1|ジェット突進|
|hbScarfy|スカーフィ|mt|2|怒りの噛みつき / 追跡突進|
|hbWaddleDoo|ワドルドゥ|mt|1|ビームウィップ|
|hbKnuckleJoe|ナックルジョー|mt|3|連続パンチ / 気弾 / 跳び蹴り|
|hbWalky|ウォーキー|mt|1|マイク音波|
|hbLaserBall|レーザーボール|mt|1|レーザー|
|hbNoddy|ノディ|mt|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|hbBrontoBurt|ブロントバート|mt|1|飛行体当たり|
|hbTookey|トゥーキー|mt|1|急降下|
|hbTwizzy|ツイジー|mt|1|飛行体当たり|
|hbMagicalSweeper|マジカルスイーパー|mt|1|飛行体当たり|
|hbHalberd|戦艦ハルバード|mt|3|主砲レーザー / 連装砲斉射 / 爆弾投下|
|dstEye|Eye of Terror|dtEye|5|突進 / 目玉の卵を産む / 口から目玉の卵を2個射出 / 連続突進 / 噛みつき着地|
|dstDragon|Dragonfly|dtDragon|3|前脚の打撃 / 激怒の火炎打撃 / 3連火炎ストンプ|
|dstBear|Bearger|dtBear|3|爪のなぎ払い / 連続爪攻撃 / 地面叩き|
|dstMoose|Moose/Goose|dtMoose|2|ついばみ / 羽ばたきと武器落とし|
|dstPig|Nightmare Werepig|dtPig|6|爪撃 / 飛びかかり / X字の両爪 / 大地砕き / シャドウリーチを3体放つ咆哮 / 忍び寄り|
|dstDeer|Deerclops|dtDeer|1|氷の衝撃を伴うなぎ払い|
|dstVarg|Varg|dtVarg|2|大顎の噛みつき / 遠吠え：ハウンド2匹|
|dstHound|ハウンド|dtVarg|1|噛みつき|
|dstLavae|Lavae|dtDragon|1|燃える体当たり|
|dstMossling|Mossling|dtMoose|2|ついばみ / 怒りの回転突進|
|dstServant|Servant of Cthulhu|dtEye|1|目玉突進|
|dstLeech|Shadow Leech|dtPig|1|跳躍噛みつき|
|dstMooseEgg|Moose/Gooseの卵|dtMoose|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|dstEyeEgg|目玉の卵|dtEye|0|通常攻撃リストなし：AI・非戦闘役・拠点を個別確認|
|mcHoneyBee|ミツバチ（Honeycomb召喚）|vg|1|刺針|
