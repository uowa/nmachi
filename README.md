# 猫街 (Pmachi6)

リアルタイムチャット・アバター配信Webアプリ。

## セットアップ

### 1. 依存パッケージ

```
npm install
```
（`node_modules` も P: ドライブ運用想定で同梱されています、ネカフェ等での起動方法は [CLAUDE.md](CLAUDE.md) 参照）

### 2. サーバー起動

```
node bin/www
```

### 3. 追加で必要なフォントファイル

ライセンス上 GitHub に同梱できないフォントを各自配置する必要があります。配置しないとそのフォントだけシステムフォントにフォールバックしますが、他のフォントは表示されるので動作には支障ありません。

**配置先は全部 `public/stylesheets/` です。**

---

#### 🤖 A. AIに依頼可能（公式サイトに直リンあり）

> AIに「README の Aセクションのフォントを全部DLして配置して」と頼めば一括処理可能。

| フォント | 配布元 | 配置先ファイル名 |
|---|---|---|
| ポプらむ☆キュート | [もじワク研究](https://moji-waku.com/poprumcute/index.html) | `title_PopRumCute.otf` |
| ピグモ00 | [もじワク研究](https://moji-waku.com/pigmo/) | `title_Pigmo-00.otf` |
| ロンド（スクエア） | [もじワク研究](https://moji-waku.com/ronde/) | `title_Ronde-square.otf` |
| マメロン | [もじワク研究](http://moji-waku.com/mamelon/index.html) | `title_mamelon-4-hi.otf` |
| 梅干し雑メモ | [字FONT](https://font.xxenxx.net/umeboshizatumemo/) | `title_umeboshi_zatumemo.ttf` |
| あおさぎ | [ymnk-design](https://ymnk-design.com/aosagi/) | `title_aosagi.otf` |
| ふわふで | [ff-design](https://huwahuwa.ff-design.net/ふわふで/) | `title_fuwafude.ttf` |
| 衡山毛筆 | [opentype.jp](http://opentype.jp/kouzanmouhitufont.htm) | `title_kouzan-mouhitu.otf` |
| 美咲ゴシック | [Little Limit](https://littlelimit.net/misaki.htm) | `title_misaki-gothic.ttf` |
| 青柳疎石（著作権放棄・完全フリー） | [opentype.jp](http://opentype.jp/aoyagisosekifont.htm) | `title_aoyagi-soseki.otf` |

ライセンス参考: [もじワク研究 使用許諾範囲](https://moji-waku.com/mj_work_license/) ・ [字FONT 利用規約](https://font.xxenxx.net/terms-of-service/)

---

#### ✋ B. 手動DL必須：BOOTH（Pixiv IDログイン必要）

> AIでは取得できません。Pixiv にログインしてから各リンク先で **無料ダウンロード** ボタンを押してください。
> ダウンロード後はAIに「これらのzipを `C:\Users\xxx\Downloads` に置いた、配置して」と頼めば残りはやってくれます。

| フォント | 配布元 | 配置先ファイル名 | 備考 |
|---|---|---|---|
| 19seg-box（**WOFF版**を使用） | [ぱれったいぷ](https://palettype.booth.pm/items/178994) | `title_19seg-box.woff2` | |
| 推しゴ | [アトリエこたつ](https://atelierkotatu.booth.pm/items/5635169) | `title_oshigo.otf` | |
| ぎっしりフォント | [BOOTH](https://booth.pm/ja/items/4652044) | `title_gisshiri.ttf` | |
| なぎの | [microraptor](https://microraptor.booth.pm/items/5010245) | `title_nagino.otf` | |
| おまつりフォント | [213chan](https://213chan.booth.pm/items/5502706) | `title_omatsuri.otf` | |
| くるん・デコ | [BOOTH](https://booth.pm/ja/items/6401767) | `title_kurun-deco.otf` | |
| 夜すがら手書き | [BOOTH](https://booth.pm/ja/items/2801268) | `title_yosugara.ttf` | |
| ぼてりん | [fontring](https://fontring.booth.pm/items/1029793) | `title_boterin.otf` | |
| AOMEMOFONT | [BOOTH](https://booth.pm/ja/items/118072) | `title_aomemo.otf` | |
| みつバッチ | [BOOTH](https://booth.pm/ja/items/3723426) | `title_mitsubatch.ttf` | 商用利用要相談 |
| 数式フォント | [kiyumaya](https://booth.pm/ja/items/3723139) | `title_suushiki.ttf` | 商用利用要相談 |
| からすまる | [BOOTH](https://booth.pm/ja/items/108047) | `title_karasumaru.otf` | 漢字なし |

---

#### ✋ C. 手動DL必須：その他

> 公式サイトが JS必要・会員登録必要・URL不安定 などでAI自動取得が困難。各リンク先で手動ダウンロードしてください。
> ダウンロード後はAIに配置を頼めます。

| フォント | 配布元 | 配置先ファイル名 | 備考 |
|---|---|---|---|
| ドラマチック明朝 | [miao3.cn 経由](https://ffont.jp/dramatic-mincho/) | `title_dramatic-mincho.ttf` | 中国サイト・JS必要 |
| マキ丸ハンド | [ac-font.com](https://www.ac-font.com/jp/detail_j_003.php) | `title_makimaru-hand.ttf` | 会員登録必要・再配布NG |
| モフ字 | [Fub工房](http://fub-koubou.work/mofuji/) | `title_mofuji.ttf` | |
| 喜々フォント | [fontlab](http://fontlab.web.fc2.com/kiki.html) | `title_kiki.ttf` | |
