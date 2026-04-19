# CLAUDE.md — 猫街 (Pmachi6) プロジェクトガイド

## ドキュメント更新ルール（自動・毎回）

- 機能実装完了時 → spec.md の該当機能に「現状」セクションを追加/更新（`YYYY-MM-DD 実装完了` の日付付き）
- 問題発生・解決時 → spec.md の問題点・選択肢を更新
- 新ファイル・関数・パターン追加時 → CLAUDE.md を更新
- 新しい localStorage キー追加時 → CLAUDE.md のキー一覧を更新
- 新しい注意点・バグ判明時 → CLAUDE.md の「既知の注意点」を更新
- **ユーザーが「完了」と言ったら新スレッドへの移行合図** → その前に必ず spec.md / CLAUDE.md への必要な書き込みを済ませること

---

## 作業ルール

- 機能仕様・優先順位・現状は `spec.md` を参照すること
- `spec.md` の24番以降は未確定仕様。新スレッドで質問しないこと
- 編集・デバッグ用の機能UIは、設定パネル（`#setting`）の一番下に、`<hr>` と「― 編集用 ―」ラベルで他の設定と区切って配置する
- コメント・docstring・型注釈を不要に足さない
- 頼まれた以外の「改善」「リファクタ」をしない
- エラーハンドリングを余分に足さない
- 日本語コメントは既存に合わせる

---

## プロジェクト概要

リアルタイムチャット・アバター配信Webアプリ。  
Stack: Node.js/Express + Socket.io (サーバー) / PIXI.js + Socket.io (クライアント)

---

## ファイル構成と役割

```
Pmachi6/
├── app.js                        # Express設定、ルート登録、/ttsプロキシ等のミドルウェア
├── bin/www                       # HTTPSサーバー起動、Socket.ioの初期化・イベント定義
├── routes/
│   ├── index.js                  # ルート "/" のルーター（index.ejsをrender）
│   ├── pages.js                  # サブページ群のルーター
│   └── polygon.js                # PNG→足場ポリゴン自動生成 API
├── views/
│   ├── index.ejs                 # メイン画面のHTML。UIの追加はここ（設定欄・ボタン等）
│   └── *.ejs                     # サブページ（更新頻度低）
├── public/
│   ├── javascripts/index.js      # クライアント全ロジック（約7500行・単一ファイル）
│   └── stylesheets/style.css     # メインCSS
└── spec.md                       # 機能仕様書（現状・問題点・選択肢も記載）
```

---

## クライアント index.js の構造（約7500行）

| 行範囲 | 内容 |
|---|---|
| 1〜30 | ファイル先頭コメント（各機能の場所の索引） |
| 30〜170 | グローバル変数・localStorage読み込み・定数 |
| 170〜285 | DOM要素の取得 (`const mainLog = ...` 等) |
| 286〜870 | アバター移動・衝突判定・ポリゴン関連 |
| 870〜2105 | PIXI.js 初期化・部屋描画・アバター描画 |
| 2105〜3215 | socket.on イベント群（アバター変換・初期化等） |
| 3216〜3845 | ログイン・部屋移動・再接続処理 |
| 3846〜3989 | キーボード矢印キー移動 |
| 3990〜4429 | マップタップ移動・ステージ操作 |
| 4430〜4733 | お絵かきシステム |
| 4734〜4810 | SEシステム（効果音） |
| 4811〜4882 | 読み上げ機能（TTS） ← `speakText()`, `_gttsUrl()`, `changeTTSSetting()` |
| 4885〜5075 | チャットメッセージ受信・表示 (`socket.on("emit_msg")`) |
| 5076〜5368 | UIクリック処理・コンテキストメニュー・設定 |
| 5369〜5600 | サイン（看板）システム・設定関数群 |
| 5600〜6247 | 動画リサイズ・レイアウト処理 |
| 6248〜6950 | WebRTC配信（映像・音声・接続管理） |

---

## 主要な機能別の関連ファイル

| 機能 | 主な変更箇所 |
|---|---|
| チャットUI・設定パネル | `views/index.ejs`（#setting 内）、`style.css` |
| チャットメッセージ処理 | `index.js` L4885〜 (`socket.on("emit_msg")`) |
| アバター移動（キー） | `index.js` L3846〜3989 |
| 再接続 | `index.js` L3597〜3660 (`socket.on("disconnect/connect")`) |
| TTS読み上げ | `index.js` L4811〜4882、`app.js`（/ttsプロキシ）|
| 配信（WebRTC） | `index.js` L6248〜 |
| サーバーイベント全般 | `bin/www` （socket.ioのon/emitはここ） |
| ルーティング・API追加 | `app.js` |
| 吹き出しドラッグ・三角描画 | `index.js` `MsgBubble` クラス（L876〜付近）`setupDrag()` / `_redraw()` |
| 吹き出しオフセット同期 | `bin/www` `socket.on("bubbleOffset")` (L864〜) / `otherJoined` emit |
| エントランス1F/2Fフロア・bridge/pole深度 | `index.js` Room constructor エントランスcase / `avaLoop()` / グローバル `entranceIs2F`, `ENTRANCE_2F_POLY`, `bridgeDepthMaps`, `poleDepthMap` |

---

## サーバー側 (bin/www) の構造

- Socket.io の全イベント定義がここにある（`io.on("connection", ...)` 以下）
- 部屋管理・ユーザー管理・ソケット転送はすべてここ
- Express ルーティングは `app.js` → `routes/*.js`

---

## 既知の注意点

- `npm install` が EBADF エラーで壊れている。原因はプロジェクトが Google Drive 上にあるため、`node_modules` 内の大量ファイル書き込みを Google Drive の同期処理が妨害するから。新パッケージを追加するときは要注意（Node.js組み込みモジュールか既存パッケージで代替を検討）
- `public/javascripts/index.js` は単一巨大ファイル。分割しない（既存方針）
- PIXI.js と Socket.io のバージョンは更新済み（古いAPIは使わない）
- `#setting` の高さは `min-height: 200px`（以前 `height` で内容が切れるバグがあった）
- **グローバル変数 `DIR` とサーバー `user[token].DIR` の同期に注意**: `displayAvatar` はスプライトを変えるがグローバル `DIR` は更新しない。`joineRoom` 受信時に `DIR = data.user[myToken].DIR` で同期している（L3548付近）。これをしないと重力落下 `sendTransformData` が古い DIR を送信し、他者が間違った向きで見る。
- **`sendTransformData` は `DIR` グローバル変数をそのまま送信する**。入室直後に DIR が古い値のまま落下が始まると、サーバーの DIR が上書きされるため注意。
- **`star1Loop`（星1部屋の退室エフェクト）**: `BlurFilter` はループ外で1回だけ生成すること。ループ内で `new PIXI.filters.BlurFilter()` するとシェーダーコンパイルが毎フレーム走り深刻な描画遅延になる。またアニメーション終了時に `room.container.filters = []` でクリアしないと、フィルターが永続して毎フレームのレンダリングが重くなる。
- **`calculateCloudPosition` のwhileループ**: `gameStartTime` が `2025-01-01` 固定のため、時間経過で1フレームあたりのループ回数が増え続ける（1年後で約2600回/フレーム）。毎フレーム呼び出してはいけない。初回のみ `_computeCloudTotalDistance()` でwhileループを実行し、以降は `updateCloudPosition` で差分更新（O(1)）する設計になっている。速度判定は `getCurrentWindInfo(elapsedTime)` ではなく `getCurrentWindInfo(cycleStart)` でサイクル開始時刻を渡すこと（whileループと同じ挙動にするため）。
- **エントランス bridge/pole/floor の `eventMode`**: `GameObject` コンストラクタは `this.container.eventMode = 'static'` を設定する。660×460 フルサイズのスプライト（bridge0/1/2/pole）をそのまま Room に追加するとクリックを横取りし、右クリックメニュー・アバター落書き等が機能しなくなる。追加時に必ず `container.eventMode = 'none'` を上書きすること。
- **`pointInPolygon` の引数形式**: `[[x,y],...]` 形式を期待する。`PIXI.Polygon.points` は flat配列 `[x0,y0,...]` なので、そのまま渡すと全判定が false になる。2Fポリゴン判定用に `ENTRANCE_2F_POLY` 定数（`[[x,y],...]`）を別途保持している。
- **エントランス `is2F` 同期**: `ava.is2F` は `sendTransformData` / `transformOtherAvatarData` / `otherJoined` で同期。`goSelfToRoomSpot` で `entranceIs2F` をセットし、`joineRoom` 受信後に `avaP[myToken].is2F = entranceIs2F` で反映。
- **`outputChatMsg` の `li` クラス付与**: `li.className = thisToken` は既存クラスを全消しするので使わない。`li.classList.add(thisToken)` を使うこと。
- **チャットログの改行表示**: `\n` は `<br>` に変換して `li` の直接の子として挿入する。`<br>` を `<span>` や `<a>` の中にネストすると効かないことがある。`msgPrefix`（icon+名前）は `display: inline; white-space: nowrap` の span、テキストノードと `<br>` は `li` に直接 appendChild。
- localStorage のキー一覧: `userName`, `avatarAspect`, `avatarUserName`, `colorCode`, `myOekaki`, `sit`, `fontSize`, `mainLogHeight`, `volume`, `PMsize`, `useTTS`, `ttsMode`, `ttsVolume`, `useLogChime`, `showJoinLeaveMsg`, `oekakiPerStateMode`, `useLogHighlight`, `useAvatarHighlight`, `useLogItemHighlight`, `videoSize`, `videoWidth`, `videoHeight`, `videoReverse`, `videoInverse`, `videoInverseAndReverse`, `videoReverseOther`, `videoInverseOther`, `videoInverseAndReverseOther`, `bubbleOffsetX`, `bubbleOffsetY`
