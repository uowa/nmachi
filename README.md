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

ライセンス上 GitHub に同梱できないフォントが2つあります。サーバー立てる場合は以下の手順で各自ダウンロードして `public/stylesheets/` に配置してください。これをしないと2フォントが化けますが、ランダム選出される他のフォントは表示されるので動作自体に支障はありません。

#### ポプらむ☆キュート

1. [もじワク研究 ポプらむ☆キュート](https://moji-waku.com/poprumcute/index.html) からzipをダウンロード
2. `PopRumCute.otf` を `public/stylesheets/title_PopRumCute.otf` にリネームして配置

#### ピグモ00

1. [もじワク研究 ピグモ00](https://moji-waku.com/pigmo/) からzipをダウンロード
2. `Pigmo-00.otf` を `public/stylesheets/title_Pigmo-00.otf` にリネームして配置

ライセンス詳細: [もじワク研究 使用許諾範囲](https://moji-waku.com/mj_work_license/)

#### 梅干し雑メモ

1. [字FONT 梅干し雑メモ](https://font.xxenxx.net/umeboshizatumemo/) からzipをダウンロード
2. `umeboshi_zatumemo.ttf` を `public/stylesheets/title_umeboshi_zatumemo.ttf` にリネームして配置

ライセンス詳細: [字FONT 利用規約](https://font.xxenxx.net/terms-of-service/)

#### ドラマチック明朝

1. [ドラマチック明朝（ffont.jp経由）](https://ffont.jp/dramatic-mincho/) からダウンロード
2. ttfファイルを `public/stylesheets/title_dramatic-mincho.ttf` にリネームして配置

#### マキ丸ハンド

1. [マキ丸ハンド（ac-font.com）](https://www.ac-font.com/jp/detail_j_003.php) で会員登録してダウンロード
2. ttfファイルを `public/stylesheets/title_makimaru-hand.ttf` にリネームして配置
3. **再配布NG**

#### 19seg box（WOFF2版）

1. [ぱれったいぷ 19seg box（BOOTH）](https://palettype.booth.pm/items/178994) からPixiv IDログイン後WOFF版zipをダウンロード
2. `PTO-19seg-Box.woff2` を `public/stylesheets/title_19seg-box.woff2` にリネームして配置

#### あおさぎ

1. [あおさぎ（ymnk-design）](https://ymnk-design.com/aosagi/) からzipをダウンロード
2. `YDWaosagi.otf` を `public/stylesheets/title_aosagi.otf` にリネームして配置

#### ふわふで

1. [ふわふで（ff-design）](https://huwahuwa.ff-design.net/ふわふで/) からzipをダウンロード
2. `FuwaFude.ttf` を `public/stylesheets/title_fuwafude.ttf` にリネームして配置

#### 推しゴ

1. [アトリエこたつ 推しゴ（BOOTH）](https://atelierkotatu.booth.pm/items/5635169) からPixiv IDログイン後ダウンロード
2. otfファイルを `public/stylesheets/title_oshigo.otf` にリネームして配置

#### ぎっしりフォント

1. [ぎっしりフォント（BOOTH）](https://booth.pm/ja/items/4652044) からPixiv IDログイン後ダウンロード
2. `Gisshiri.ttf` を `public/stylesheets/title_gisshiri.ttf` にリネームして配置

#### なぎの

1. [microraptor なぎの（BOOTH）](https://microraptor.booth.pm/items/5010245) からPixiv IDログイン後ダウンロード
2. otfファイルを `public/stylesheets/title_nagino.otf` にリネームして配置

#### おまつりフォント

1. [213chan おまつりフォント（BOOTH）](https://213chan.booth.pm/items/5502706) からPixiv IDログイン後ダウンロード
2. otfファイルを `public/stylesheets/title_omatsuri.otf` にリネームして配置

#### くるん・デコ

1. [くるん・デコ（BOOTH）](https://booth.pm/ja/items/6401767) からPixiv IDログイン後ダウンロード
2. otfファイルを `public/stylesheets/title_kurun-deco.otf` にリネームして配置

#### 夜すがら手書きフォント

1. [夜すがら手書きフォント（BOOTH）](https://booth.pm/ja/items/2801268) からPixiv IDログイン後ダウンロード
2. `yosugaraver1_2.ttf` を `public/stylesheets/title_yosugara.ttf` にリネームして配置

#### ぼてりん

1. [fontring ぼてりん（BOOTH）](https://fontring.booth.pm/items/1029793) からPixiv IDログイン後ダウンロード
2. otfファイルを `public/stylesheets/title_boterin.otf` にリネームして配置

#### ロンド（スクエア）

1. [もじワク研究 ロンド](https://moji-waku.com/ronde/) からzipをダウンロード（ロンドBスクエア）
2. `Ronde-B_square.otf` を `public/stylesheets/title_Ronde-square.otf` にリネームして配置

#### AOMEMOFONT

1. [AOMEMOFONT（BOOTH）](https://booth.pm/ja/items/118072) からPixiv IDログイン後ダウンロード
2. otfファイルを `public/stylesheets/title_aomemo.otf` にリネームして配置

#### マメロン

1. [マメロン（もじワク研究）](http://moji-waku.com/mamelon/index.html) からzipをダウンロード
2. `Mamelon-4-Hi-Regular.otf` を `public/stylesheets/title_mamelon-4-hi.otf` にリネームして配置

#### みつバッチフォント

1. [みつバッチ（BOOTH）](https://booth.pm/ja/items/3723426) からPixiv IDログイン後ダウンロード
2. ttfファイルを `public/stylesheets/title_mitsubatch.ttf` にリネームして配置
3. **商用利用要相談**

#### 数式フォント

1. [数式フォント（BOOTH kiyumaya）](https://booth.pm/ja/items/3723139) からPixiv IDログイン後ダウンロード
2. ttfファイルを `public/stylesheets/title_suushiki.ttf` にリネームして配置
3. **商用利用要相談**

#### 衡山毛筆フォント

1. [衡山毛筆（opentype.jp）](http://opentype.jp/kouzanmouhitufont.htm) からOpenType版zipをダウンロード
2. `KouzanMouhituFontOTF.otf` を `public/stylesheets/title_kouzan-mouhitu.otf` にリネームして配置

#### 美咲ゴシック

1. [美咲フォント（Little Limit）](https://littlelimit.net/misaki.htm) からttf版zipをダウンロード
2. `misaki_gothic.ttf` を `public/stylesheets/title_misaki-gothic.ttf` にリネームして配置

#### モフ字

1. [モフ字（Fub工房）](http://fub-koubou.work/mofuji/) からダウンロード
2. ttfファイルを `public/stylesheets/title_mofuji.ttf` にリネームして配置

#### 青柳疎石フォント

1. [青柳疎石（opentype.jp）](http://opentype.jp/aoyagisosekifont.htm) からOpenType版zipをダウンロード
2. `AoyagiSosekiFont2.otf` を `public/stylesheets/title_aoyagi-soseki.otf` にリネームして配置
3. **著作権放棄・完全フリー**

#### 喜々フォント

1. [喜々フォント（fontlab）](http://fontlab.web.fc2.com/kiki.html) からダウンロード
2. `kiki.ttf` を `public/stylesheets/title_kiki.ttf` にリネームして配置

#### からすまる

1. [からすまる（BOOTH）](https://booth.pm/ja/items/108047) からPixiv IDログイン後ダウンロード
2. ttfファイルを `public/stylesheets/title_karasumaru.otf` にリネームして配置
3. **漢字なし**

