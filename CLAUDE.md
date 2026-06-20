# CLAUDE.md — 猫街 (Pmachi6) プロジェクトガイド

## ドキュメント更新ルール（自動・毎回）

- 機能実装完了時 → spec.md の該当機能に「現状」セクションを追加/更新（`YYYY-MM-DD 実装完了` の日付付き）、かつ機能見出し（`### N.`）に `✅` を追加（例：`### 12. カメラ選択 ✅`）
- 問題発生・解決時 → spec.md の問題点・選択肢を更新
- 新ファイル・関数・パターン追加時 → CLAUDE.md を更新
- 新しい localStorage キー追加時 → CLAUDE.md のキー一覧を更新
- 新しい注意点・バグ判明時 → CLAUDE.md の「既知の注意点」を更新
- **ユーザーが「完了」と言ったら新スレッドへの移行合図** → その前に必ず以下を行うこと：
  1. spec.md / CLAUDE.md への必要な書き込みを済ませる
  2. 変更ファイルを全てステージング（`test_ol.js` 等の一時ファイルは除外）
  3. このスレッドの作業内容を元に日本語でコミットメッセージを作成してコミット
  4. `git push origin master` で GitHub に push

---

## 作業ルール

- **`bin/www` を変更した場合は必ずユーザーに「サーバー再起動が必要です」と伝えること**
- 機能仕様・優先順位・現状は `spec.md` を参照すること
- `spec.md` の「未確定」シリーズは未確定仕様。新スレッドで質問しないこと
- 編集・デバッグ用の機能UIは、設定パネル（`#setting`）の一番下に、`<hr>` と「― 編集用 ―」ラベルで他の設定と区切って配置する
- **Agentツール（サブエージェント）を使わない** → Glob・Grep・Read・Bash等を直接使うこと（サブエージェントを使うと会話が履歴に表示されなくなるため）。`.claude/settings.json` の PreToolUse フックで機械的にブロックされる（2026-05-04 設定済み）
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
│   ├── polygon.js                # PNG→足場ポリゴン自動生成 API
│   └── rooms.js                  # ユーザー投稿部屋API（POST/GET/PUT /api/rooms）
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
| エントランス1F/2Fフロア・bridge/pole深度 | `index.js` Room constructor エントランスcase / グローバル `entranceIs2F`, `ENTRANCE_2F_POLY`, `bridgeDepthMaps`, `leftPoleDepthMapSmoothed`, `rightPoleDepthMapSmoothed` |
| ユーザー投稿部屋API | `routes/rooms.js`（POST/GET/PUT）、認証ミドルウェア `authRoom` |
| SQLiteDB | `db/index.js`（接続）、`db/init.js`（テーブル作成・システム部屋投入、`app.js` で require）|
| カスタムコード sandbox実行 | `routes/rooms.js`（GET /:id/code）、`index.js`（`_execCustomCodeInFrame` / `runCustomCode` / `clearCustomCode`、clearDbImages の直後）|
| むげんのいりぐち・むげん部屋 | `index.js` Room constructor case / goSelfToRoomSpot / ROOM_PHYSICS、`bin/www` roomNameList・joineRoom switch、`db/init.js` 登録 |
| むげん部屋端ループ・ゴースト | `index.js` `keyMoveTickerFn` むげん else ブランチ（AX/AY折り返し）、`_mugenGhostMap` / `_updateMugenGhosts` / `_destroyMugenGhosts` / `_replayOekakiOnGhost`（zIndexティッカー末尾で毎フレーム呼び出し）|
| 文字の部屋・粉の部屋 | `index.js` グローバル変数 `konaNoHeya` / `konoPowderRoom` / `_konaParticles` / `_konaTextBlocks` / `_konaContainer` / `_konaFloor` / `KONA_GROUND_Y`、`_isKonaRoom()` ヘルパー、Room constructor case（両部屋 fall-through）、goSelfToRoomSpot、warpPoints（うちゅー→文字の部屋、文字の部屋→星1/うちゅー、星1→粉の部屋、粉の部屋→星1）+キーボード画面端ワープ（`keyMoveTickerFn` 内）、ROOM_PHYSICS、joineRoom switch（enter/leave 両部屋共通）、`konaDropText`（粉の部屋は hardness=0 固定）/ `_konaTick`（落書き衝突判定 `_konaGetOekakiSegments` / `_konaOekakiSegCollide` 含む）/ `_konaLeaveCleanup` / `konaNoHeyaBlock`、`sendTransformData` 内 konaHostClaim 自動発火、emit_msg に konaDropText 追加、`bin/www` roomNameList・KONA_ROOMS Set・konaHostRelease relay・`konaSyncFull` 常時サーバーキャッシュ（`konaPersistedStates`）・`konaRequestSync` キャッシュ優先返送、`db/init.js` 登録 |
| 方角部屋（東・南・西・北の部屋） | `index.js` グローバル変数 `dirRoomEast/South/West/North` / `directionGateRooms` / `directionGateSprites` / `_directionGateBeingEntered` / `_newRoomParentDirection`、Room constructor case、goSelfToRoomSpot、warpPoints (→むげん)、`loadDirectionGates` / `onDirectionGateClick` / `showDirectionGateCreateDialog`、`routes/direction.js`（GET/POST/DELETE /api/direction/:roomName/gates）、`db/init.js` 登録・direction_gatesテーブル・lifetime_hoursカラム |

---

## サーバー側 (bin/www) の構造

- Socket.io の全イベント定義がここにある（`io.on("connection", ...)` 以下）
- 部屋管理・ユーザー管理・ソケット転送はすべてここ
- Express ルーティングは `app.js` → `routes/*.js`

---

## 既知の注意点

- **git コマンドの実行方法（Bash ツール内）**: `git` を直接呼ぶと `fatal: not a git repository: 'P:\git-portable'` エラーになる。必ず以下の形式で実行すること：
  ```
  GIT_DIR=/p/Pmachi6/.git GIT_WORK_TREE=/p/Pmachi6 "P:/git-portable/mingw64/bin/git.exe" -C "P:/Pmachi6" [コマンド]
  ```
- **GitHub SSH鍵（2026-05-08 設定済み）**: 鍵は `P:/.ssh/id_ed25519`。`git config core.sshCommand` に `ssh -i /p/.ssh/id_ed25519 -o StrictHostKeyChecking=no -o UpdateHostkeys=no` を設定済みのため、push 時に `GIT_SSH_COMMAND` の指定は不要。リモートは `git@github.com:uowa/nmachi.git`（旧 Pmachi5 から移動済み）。別PCでも P: ドライブを使う限り鍵はそのまま使える。（`-o UpdateHostkeys=no` は Google Drive の P: ドライブがハードリンク非対応のため known_hosts 更新エラーを防ぐ）
- **git オブジェクト大規模破損（2026-05-06・2026-06-20 二度修復）**: Google Drive 同期が `.git/objects/pack/` を破損。2026-06-20: `git filter-branch` + `git replace` で破損コミットを切り捨て・書き換えし、GitHub に force push で上書き。現在 97コミット（`0e9ef8d 404ページにやせアボン画像追加` 以降）が有効履歴。それ以前の履歴は破損のため消失済み。
- **`.gitignore` 追加済みパターン**: `.vs/`、`Microsoft/`、`.claude/`（認証情報含む）、`.git_pack_backup/`、`db_broken`（2026-05-06）、`db/rooms.db`・`public/uploads/`（2026-05-15、VPS運用でデプロイ時に上書きされないよう）
- **VSCode settings.json（`P:\vscode\data\user-data\User\settings.json`）**: `git.path` は `P:\git-portable\mingw64\bin\git.exe`、`CLAUDE_CODE_GIT_BASH_PATH` は `P:\git-portable\bin\bash.exe` に設定済み。code.bat 経由で起動すれば P: が固定されるため全PC共通で動く。
- **Claude Code 会話履歴**: `P:\vscode\.claude\projects\p--Pmachi6\` に集約済み（旧 d--/e-- ドライブ時代の履歴もコピー済み、破損ファイルは `.corrupted` にリネーム）。**必ず `code.bat` 経由で VSCode を起動すること**。普通に起動すると `C:\Users\user\.claude\` が参照され、履歴が見えなくなる。
- **`C:\Users\user\.claude` はジャンクション（2026-05-06 設定済み）**: VSCode の extension host が `USERPROFILE` 環境変数を引き継がず、Node.js が `C:\Users\user\.claude` を参照してしまう問題を解決するため、`C:\Users\user\.claude` → `P:\vscode\.claude` のディレクトリジャンクションを作成済み。これにより code.bat 経由でも普通に開いても同じ履歴を参照する。ネカフェ等の別PCで新しいWindowsユーザーになった場合は同じ手順（`mklink /J C:\Users\<ユーザー名>\.claude P:\vscode\.claude`）で再作成すること。
- `npm install` が EBADF エラーで壊れている。原因はプロジェクトが Google Drive 上にあるため、`node_modules` 内の大量ファイル書き込みを Google Drive の同期処理が妨害するから。新パッケージを追加するときは要注意（Node.js組み込みモジュールか既存パッケージで代替を検討）。**自宅でも必ず Google Drive 同期を一時停止してから `npm install` を実行すること**
- **ネカフェ（ポータブル）運用**: P: ドライブに Node.js・Git・プロジェクト一式が入っているため、別のネカフェでも `npm install` 不要でそのまま起動できる。`node_modules/` も P: ドライブに含まれている
- **ネカフェでPowerShell実行ポリシーエラーが出る場合**: `npm start` が "スクリプトの実行が無効" エラーになる。回避策は `node bin/www` で直接起動する（ポリシー変更不要）。または `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process` を先に実行する
- **ネカフェで `node_modules` が壊れていた場合**: `node_modules` を `Remove-Item -Recurse -Force` で削除し、`node P:\node-v24.15.0-win-x64\node_modules\npm\bin\npm-cli.js install` で再インストール（`npm` コマンド使えない場合）。USBメモリ環境ではGoogle Drive同期が関係ないため `npm install` はそのまま実行できる
- **ネイティブモジュール禁止**: Python・Visual Studio Build Tools が P: ドライブに入っていないため、`node-gyp` ビルドが必要なパッケージ（`better-sqlite3` 等）は使えない。SQLite は `node-sqlite3-wasm`（WASM純JS）を使用
- **`db_broken/` フォルダ**: 2026-05-03 にファイルシステム破損で発生した残骸フォルダ。Windows からは削除不可（ファイル名に禁止文字）。**Google Drive のブラウザ版（drive.google.com）から削除できる可能性がある**
- `public/javascripts/index.js` は単一巨大ファイル。分割しない（既存方針）
- PIXI.js と Socket.io のバージョンは更新済み（古いAPIは使わない）
- `#setting` の高さは `min-height: 200px`（以前 `height` で内容が切れるバグがあった）
- **グローバル変数 `DIR` とサーバー `user[token].DIR` の同期に注意**: `displayAvatar` はスプライトを変えるがグローバル `DIR` は更新しない。`joineRoom` 受信時に `DIR = data.user[myToken].DIR` で同期している（L3548付近）。これをしないと重力落下 `sendTransformData` が古い DIR を送信し、他者が間違った向きで見る。
- **`sendTransformData` は `DIR` グローバル変数をそのまま送信する**。入室直後に DIR が古い値のまま落下が始まると、サーバーの DIR が上書きされるため注意。
- **`star1Loop`（星1部屋の退室エフェクト）**: `BlurFilter` はループ外で1回だけ生成すること。ループ内で `new PIXI.filters.BlurFilter()` するとシェーダーコンパイルが毎フレーム走り深刻な描画遅延になる。またアニメーション終了時に `room.container.filters = []` でクリアしないと、フィルターが永続して毎フレームのレンダリングが重くなる。
- **`calculateCloudPosition` のwhileループ**: `gameStartTime` は「今月1日UTC深夜0時」を自動計算（`Date.UTC(_now.getUTCFullYear(), _now.getUTCMonth(), 1)`）。毎月自動リセットされ、ループ回数は常に最大31日分（≈17万8千回）以内に抑えられる。毎フレーム呼び出してはいけない。初回のみ `_computeCloudTotalDistance()` でwhileループを実行し、以降は `updateCloudPosition` で差分更新（O(1)）する設計になっている。速度判定は `getCurrentWindInfo(elapsedTime)` ではなく `getCurrentWindInfo(cycleStart)` でサイクル開始時刻を渡すこと（whileループと同じ挙動にするため）。
- **エントランス bridge/pole/floor の `eventMode`**: `GameObject` コンストラクタは `this.container.eventMode = 'static'` を設定する。660×460 フルサイズのスプライト（bridge0/1/2/leftPole/rightPole）をそのまま Room に追加するとクリックを横取りし、右クリックメニュー・アバター落書き等が機能しなくなる。追加時に必ず `container.eventMode = 'none'` を上書きすること。
- **`pointInPolygon` の引数形式**: `[[x,y],...]` 形式を期待する。`PIXI.Polygon.points` は flat配列 `[x0,y0,...]` なので、そのまま渡すと全判定が false になる。2Fポリゴン判定用に `ENTRANCE_2F_POLY` 定数（`[[x,y],...]`）を別途保持している。
- **エントランス `is2F` 同期**: `ava.is2F` は `sendTransformData` / `transformOtherAvatarData` / `otherJoined` で同期。`goSelfToRoomSpot` で `entranceIs2F` をセットし、`joineRoom` 受信後に `avaP[myToken].is2F = entranceIs2F` で反映。
- **`outputChatMsg` の `li` クラス付与**: `li.className = thisToken` は既存クラスを全消しするので使わない。`li.classList.add(thisToken)` を使うこと。
- **チャットログの改行表示**: `\n` は `<br>` に変換して `li` の直接の子として挿入する。`<br>` を `<span>` や `<a>` の中にネストすると効かないことがある。`msgPrefix`（icon+名前）は `display: inline; white-space: nowrap` の span、テキストノードと `<br>` は `li` に直接 appendChild。
- **カスタムコード sandbox の `allow-same-origin`**: `sandbox="allow-scripts allow-same-origin"` を使用。`allow-same-origin` なしでは `parent.PIXI` が cross-origin エラーになる。この組み合わせは iframe がサンドボックスを自己解除できる既知リスクがあるが、本プロジェクトでは部屋オーナー（パスワード所持者）のみが編集できるため許容。
- **カスタムコード `</script>` エスケープ**: srcdoc へのコード注入時は `.replace(/<\/script>/gi, '<\\/script>')` でエスケープしている。
- **`window.app = app`**: カスタムコード iframe から `parent.app` でアクセスできるよう、PIXI.Application 初期化直後に設定。`app` は `let` 宣言のため `window` に自動公開されない。
- **`nameTag` は `nameText` の子にしてはいけない**: `this.nameText.addChild(this.nameTag)` にすると nameTag がテキストの上に重なり背景として機能しない。`this.container.addChild(this.nameTag)` → `this.container.addChild(this.nameText)` の順（nameTag を先に追加）が正しい。2026-05-05 修正済み。
- **`rooms[fromRoom]` は undefined になりうる**: ユーザー投稿部屋など `rooms` オブジェクトに存在しない部屋名が `fromRoom` に来るケースがある。`rooms[fromRoom].usersToken` 等へのアクセス前に `if (rooms[fromRoom])` ガードが必要。2026-05-05 修正済み。
- **`data.userName` は joineRoom で undefined になりうる**: 部屋間移動時は `userName` を送らないため、`fromRoom === "loginRoom"` の条件だけでは不十分。`data.userName && data.userName.length` のように undefined チェックを入れること。2026-05-05 修正済み。
- **新システム部屋追加時の必要箇所**: `index.js`（グローバル変数・setUp初期化・warpPoints・sysSpot・ROOM_PHYSICS・Room constructor case・goSelfToRoomSpot・sysRoomSprites・電車 switch）、`bin/www`（roomNameList・ROOM_SE_KEY・joineRoom switch の出現座標）、`db/init.js`（insertRoom.run）。
- **`Avatar._tickerActive` フラグ**: Avatar コンストラクタで `app.ticker.add(_tickerFn)` する際に `_tickerActive = true` を同時にセット。退室・ログアウト・再接続時は `app.ticker.remove(_tickerFn)` + `_tickerActive = false` でstop。再入室時に `_tickerActive` が false ならば add しなおす（2重add防止）。このフラグを忘れると、退室済みアバターのavaLoopがセッション中ずっと60fps動き続け重くなる。
- **`_inRoomTransition` フラグ**: `goSelfToRoomSpot` 開始時に `true`、`joineRoom` ハンドラ末尾で `false` にクリア。この間 `checkObjectWarpPoints` は即return。部屋遷移直後にアバターの古い座標（旧部屋の位置）でwarpPointsがヒットし誤ワープするバグを防ぐ。`goSelfToRoomSpot` を呼ぶ新機能を追加した場合は必ずこのフラグが立っていることを確認すること。
- **`#setting` のスワイプ干渉対策**: `overscroll-behavior-x: contain` と `touch-action: pan-y` を `#setting` に設定済み。`input[type="range"]` には `touch-action: pan-x` を設定済み。これにより `#setting` 内のスライダー操作がブラウザバックジェスチャーに干渉しない。`#setting` 外に新しいパネルを追加する場合は同様に設定すること。
- **透過配信モード中のUI z-index**: `#mediaContainer.video-transparent-mode` は `z-index:10`。`#setting` は `z-index:20; position:relative` で動画より上に固定済み。`#setting` 内に新しいスライダー・ボタン等を追加する限り追加対応不要。`#setting` の外に新しいインタラクティブUI（別パネル等）を追加した場合は `z-index:20` 以上を付けること。
- **動画フロアオーバーレイ（`#avaVideoOverlay`）の全体構造（2026-05-30 実装）**: 詳細は `spec.md` 23.5節を参照。以下は修正時に特に注意する点：
  - **`_isOnVideoFloor` は `ava.container.parent` チェック必須**: 退室済みアバターは `container.parent === null` だが `container.y > 460` なので、チェックなしだと退室後もオーバーレイに描画される
  - **`detachVideo` では `v.parentNode.removeChild(v)` でDOMから削除必須**: `delete videoArray[token]` だけでは `<video>` 要素がDOMに残留し `pointer-events:auto` でクリックを吸収する
  - **`resolveRiding` は失敗時も `pendingRidingData` を保持する**: 入室時にビデオフロアがまだ未作成の場合、`_updateVideoFloor`（新規フロア作成）が後から `resolveRiding` を再試行する。`tappedMove` では `pendingRidingData = null` でクリアする
  - **オーバーレイ描画は透過/通常モードで座標系が異なる**: 透過モード=`cRect`（PIXIキャンバス矩形）基準、通常モード=`vRect`（動画DOM要素矩形）基準。タップ処理も同様に分岐している（`forwardToCanvas`）
  - **`#Pmachi { z-index:12; position:relative }` が `style.css` に設定済み**: `#avaVideoOverlay`（z-index:11）よりゲームUIが上に来るための設定。消さないこと
- **iOS Safari での `video.srcObject` 透明バグ**: 配信中に `localStream` のビデオトラックを `stop()` すると、`videoArray[myToken].srcObject` が `localStream` のままでも映像が透明になる（iOS ネイティブビデオレイヤーの仕様）。対策は `srcObject = null` + `style.background = '#000'` を先に設定してからトラックを止めること。`canvas.captureStream()` は iOS 15.4 未満では未サポートで例外になるため使わないこと。カメラ復帰時（`switchVideoDevice`）で `srcObject = newStream` と同時に `style.background = ''` をクリアする。
- **iOS Safari での `getVideoPlaybackQuality()` 未サポート**: `video.getVideoPlaybackQuality()` は iOS Safari で例外を投げる。動画の再生開始検出には `video.addEventListener('playing', handler, { once: true })` を使うこと。
- **アバター同士乗車の同期アーキテクチャ（2026-05-31 完成）**: `transformOtherAvatarData` が乗車状態の唯一の権威。`tapMap` はあくまで移動アニメーション用。降車時は `_pendingTapMap` パターンで調整：①tapMap(riding:false) 受信時は `_pendingTapMap` に保存、②transformOtherAvatarData(ridingData:null) 受信時に `stopRiding()` してから `_pendingTapMap` を実行。`_pendingTapMap` 実行後は位置補正ブロックをスキップすること（Bが移動中に降車するとdata.AXとcontainer.xがズレてgsap競合する）。マップタップ降車は常に `riding: false` を送る（`calculateTargetAndEmit`でハードコード）。キーボード移動は `riding: !!ridingObject`。サーバーは `riding: false` の絶対座標tapMapの時のみ `ridingObject` をクリア。
- **アバター乗車中のジッター（2026-06-01 修正）**: `keyMoveTickerFn` がアクティブな間（キー移動中）は `updatePhysics` の落下ブランチで `sendTransformData("落下中")` を抑制すること。抑制しないと `tapMap`（100ms周期）と `sendTransformData`（50ms周期）が同時に位置を送信し、観測者のgsapが競合してアバターがガタガタ揺れる。
- **アバターへの `startRiding` 判定（2026-06-01 修正）**: `!standingOn.token` ガードを外した場合、入室時に座標が重なったアバターに自動乗車するバグが再発する。代わりに hitArea の `points`（flat配列 `[x0,y0,x1,y1,...]`）からY成分の最小値を取得し `headWorldY = bC.y + minLocalY * scaleY` を計算、`A.container.y <= headWorldY + 12` の時のみ `startRiding()` を呼ぶ。ポリゴンなし時フォールバック: `bC.y - 50`。「クールダウンタイマー」で解決しようとすると電車入室後等で副作用が出るため使わないこと。
- **アバター乗車の降車判定（2026-06-01 修正）**: hitAB（`isStandingOnObject`）を使うとキー移動ごとに誤降車し空中歩行になる。代わりに `ridingOffset.y > 5 || ridingOffset.y < minLocalY - 15` の範囲チェックを使う（minLocalY は hitArea points から取得）。
- **B が退室・ログアウトした時の乗車クリーンアップ**: `otherLeft` / `logout` ハンドラで `for (const tk in avaP)` を回し、`avaP[tk].ridingObject === avaP[data.token]` のアバターを `stopRiding()` すること。これをしないと B の avatar オブジェクトが削除された後も A の `ridingObject` が古い参照を保持し、A が空中に浮いたまま重力が効かなくなる。myToken の場合は `sendTransformData("落下開始")` も送る。
- **`stopKeyMove` のフレーム・方向同期（2026-06-01 修正）**: `DIR` グローバルはtickerで毎tick更新、`keyWalkFrame` は100msタイマーで更新。キーを離した瞬間に両者がズレている。`stopKeyMove` では `ava.currentAvaStateKey`（例: "NE1", "SE2"）から `/[012]$/` でフレームを、残り文字で方向を抽出して送信する。
- **落下アニメーションの gsap 設定（2026-06-01 修正）**: `transformOtherAvatarData` の `isFalling` ブランチでは `gsap.to(container, { duration: 0.04, overwrite: "auto", ... })` を使う。`killTweensOf` + `duration: 0.05` だとアニメーション途中でkillされて着地位置に届かず、次の50ms更新との差分がズレ続けて「着地前にジャンプして見える」問題になる。0.04s（40ms）にすることで50ms周期の次の更新前にアニメが完了する。
- **`bin/www` tapMapブロードキャストに `ridingOffsetX/Y` を含めること**: `avaP[token].ridingObject` がセットされている状態でキー移動するとき、オフセット値をブロードキャストしないと観測者がアバターを正しい位置に配置できない。
- **`_isKonaRoom()` の自己再帰バグに注意（2026-06-03）**: `replace_all` で `room.name === "文字の部屋"` → `_isKonaRoom()` を置換すると、`_isKonaRoom` 定義内の `room.name === "文字の部屋"` も置換されて無限再帰になる。今後 replace_all をかける際は `_isKonaRoom` 関数定義部分を手動で確認・修正すること。定義は必ず `return !!(room && (room.name === "文字の部屋" || room.name === "粉の部屋"))` とする。
- **新しい kona 部屋追加時の必要箇所**: `index.js`（`_isKonaRoom()` 定義、グローバル変数、Room constructor case、goSelfToRoomSpot case、joineRoom switch、warpPoints、ROOM_PHYSICS、sysSpot maps 5箇所、train switch）、`bin/www`（roomNameList、KONA_ROOMS Set、ROOM_SE_KEY、joineRoom switch）、`db/init.js`（insertRoom.run）
- localStorage のキー一覧: `userName`, `avatarAspect`, `avatarUserName`, `colorCode`, `myOekaki`, `sit`, `fontSize`, `mainLogHeight`, `volume`, `PMsize`, `useTTS`, `ttsMode`, `ttsVolume`, `useLogChime`, `showJoinLeaveMsg`, `oekakiPerStateMode`, `useLogHighlight`, `useAvatarHighlight`, `useLogItemHighlight`, `videoSize`, `videoWidth`, `videoHeight`, `videoReverse`, `videoInverse`, `videoInverseAndReverse`, `videoReverseOther`, `videoInverseOther`, `videoInverseAndReverseOther`, `bubbleOffsetX`, `bubbleOffsetY`, `streamQualityLevel`, `receiverQuality`, `contextMenuPos`, `videoTransparentDefault`, `videoTransparentOpacity`, `cameraSelectMode`, `cameraDeviceId`, `cameraDeviceLabel`, `micSelectMode`, `micDeviceId`, `micDeviceLabel`, `showCoord`, `useRNNoise`, `micBoost`, `lowCut`, `cameraDeviceId_2`〜`cameraDeviceId_10`（cam2+のデバイスID、連番なので途中が空なら以降も空）、`showMainLog`（下ログ表示状態 "1"/"0"）、`showOverlayChat`（画面チャット表示状態 "1"/"0"、未設定時はスマホ初回起動で自動ON）
