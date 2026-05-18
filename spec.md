# 猫街 (Neko Machi) — 開発仕様書 / Feature Spec

## プロジェクト概要 / Project Overview
- リアルタイムチャット・配信Webアプリ / Real-time chat & streaming web app
- Stack: Node.js/Express, PIXI.js, Socket.io
- アバターが部屋を動き回り、チャットや配信ができる / Avatars move around rooms, chat & stream
- Working dir: `e:\マイドライブ\Pmachi6`

---

## 機能リスト / Feature List
※ 上から優先順位が高い。開発都合で順番変更可だが、上位項目を大幅に下げるのはNG。
※ Priority order (top = highest). Reordering for dev convenience is OK, but don't push high-priority items too far down.

---

### 1. キーボード移動 & アバター落書き強化 ✅
**Keyboard movement & avatar doodle enhancement**
- 矢印キーで移動、同時押しで斜め移動 / Arrow keys to move, diagonal on simultaneous press
- キーを離した時点で停止（クリック移動と違いアイドルポーズにならない）/ Stop on key release (no idle pose, unlike click-move)
- 方向・状態ごとに落書きパターンを持たせ、歩くたびに切り替え / Doodle patterns per direction/state, cycle each step

---

### 2. 自動再接続 ✅
**Auto-reconnect**
- 切断→再接続時に位置・アバター情報・配信受信情報を再送信 / On reconnect, resend position, avatar, stream info
- チャット欄に青字でステータスを表示:
  - 「再接続中…」
  - 「再接続に成功しました！」
  - 失敗時は原因推定メッセージ（部屋消失 / サーバー停止またはネットワーク障害 / 原因不明 の3パターン）

---

### 3. 読み上げ機能
**Text-to-speech**
- 設定でON/OFF / Toggleable in settings
- 3モード:
  1. 通常TTS (Web Speech API)
  2. サウンドフォント方式: 文字ごとにa.wav等の短音を再生 (どうぶつの森スタイル)
  3. ピッチ加工方式: pitch=2.0, rate=1.5 で極端に加工した音声
- コード例 / Code hint:
  ```js
  const u = new SpeechSynthesisUtterance(text);
  u.pitch = 2.0; u.rate = 1.5;
  window.speechSynthesis.speak(u);
  ```

#### 現状 (2026-04-11 実装途中、後回し)
**実装済み**
- 設定UIあり（ON/OFF チェック、モード選択、音量スライダー）
- localStorage で設定を永続化
- どうぶつの森風モード（Web Audio API オシレーター）は動作OK
- 人間語モード3種（低音・高音・超高音）: サーバー経由 Google TTS プロキシ (`/tts` エンドポイント) で安定再生できている
  - `app.js` に `/tts?q=TEXT&slow=0|1` プロキシ実装済み
  - `playbackRate` で低音0.8倍・高音1.4倍・超高音1.9倍に加工

**未解決の問題**
- Google TTS の声質が根本的にナレーション/辞書読み上げ風でユーザーの好みではない
- `playbackRate` でどう加工しても Google TTS の平坦な抑揚は変わらない
- Web Speech API は Chromeのバグで5〜6発言後に止まる（根本解決できず断念）

**次にとるべき選択肢（公開サーバー移行時に判断）**

| 選択肢 | 声質 | 安定性 | 条件 |
|---|---|---|---|
| **VoiceVox（サーバー側）** | ★★★ アニメ風・自然 | ○ | サーバーにVoiceVoxをインストール。スペック次第（安いVPSだと重い可能性）|
| **Web Speech API（クライアント側）** | ★★ WindowsならHaruka等で自然 | △ Chrome バグあり | サーバー負荷ゼロ。ブラウザ/OSの声を使う |
| **Google TTS（現状）** | ★ 辞書読み | ○ | 声質のみ問題、動作は安定 |

**推奨**: 公開サーバーのスペックが決まったら VoiceVox を検討。スペックが厳しければ Web Speech API の安定化に再挑戦。それまでは現状（Google TTS）のまま。

---

### 4. 吹き出し位置変更 ✅ (2026-04-11 実装完了)
**Chat bubble repositioning**
- ドラッグで位置変更 / Drag to reposition
- 三角はアバター上から1/4の位置を常に指す / Triangle always points to 1/4 from top of avatar
- 移動範囲はアバター近辺に制限 / Range limited to near avatar
- 位置はローカル保存、再ログイン時も維持 / Position saved, persists across logins

#### 現状 (2026-04-11 実装完了)
- 自分のアバターの吹き出しのみドラッグ可能（`MsgBubble.setupDrag()`）
- 三角先端: 吹き出し位置に関わらずアバター上から1/4の点（コンテナY=-spriteH*3/4）へ常に向く（動的計算）
- 移動範囲: オフセットX -200〜+200、Y -200〜+100 に制限（上方向は元の1/3に制限済み）
- 三角の長さ: 距離に比例してスケール（min 8px / max 30px）、吹き出し枠の辺に根元をクランプして枠線が三角内に入らないよう処理
- localStorage `bubbleOffsetX` / `bubbleOffsetY` に保存・再ログイン時も復元
- socket.io `bubbleOffset` イベントでリアルタイム他者同期（ドラッグ中は50msスロットル、放した時に最終位置を確定送信）
- スパイク時（！含む吹き出し）はオフセット適用のみ（三角なし）
- 再接続時はアバターオブジェクトを使い回すため setupDrag 再呼び出し不要
- ログイン時の `joineRoom` emit に `bubbleOffsetX/Y` を含めサーバーへ初期値を送信
- 他者入室時（`joineRoom` forEach / `otherJoined`）に `bubbleOffsetX/Y` を適用

**バグ修正履歴**
- コンストラクタで localStorage を読み込んでいたため他者アバターに自分の offset が適用されるバグ → コンストラクタは 0 初期化、`setupDrag` のみ localStorage を読むよう修正
- 入室時 `joineRoom` forEach ループが既存ユーザーの `bubbleOffsetX/Y` を適用していなかったバグ → 修正済み

---

### 4.5. エントランスの追加及び、 1F/2F レイヤーシステム ✅ (2026-04-12 実装完了)

**現状**
- エントランスに1階・2階の概念を追加
- `entranceIs2F`（グローバル）/ `ava.is2F`（Avatar プロパティ）でフロア管理。`sendTransformData` / `transformOtherAvatarData` / `otherJoined` で他者に同期
- **2Fフロア**: `entrance2FFloor`（hitArea = ユーザー提供ポリゴン、tag=standable2F）で重力判定。草原→エントランス (`entranceFromMeadow`) で入室時に2Fスポーン
- **1Fフロア**: `entrance1FFloor`（hitArea = [0,185,660,184,660,460,0,460]、tag=standable1F）で重力判定
- **2F→1F降下**: stageMove で2Fポリゴン外クリック時に `entranceIs2F=false`。1F→2Fの昇りは不可
- **ポリゴン判定**: `pointInPolygon` は `[[x,y],...]` 形式が必要。`PIXI.Polygon.points` は flat配列なので別途 `ENTRANCE_2F_POLY` 定数を保持
- **zIndexレイヤー構成（エントランス）**:
  - `pole`: zIndex=80（1Fのみピクセル判定: poleBottom≤avatarY → z=130、それ以外 → z=50）
  - `bridge0`: zIndex=150（2Fアバターより常に下）
  - `bridge1`: zIndex=250（2Fのみピクセル判定: bottomY>avatarY → z=200、それ以外 → z=300）
  - `bridge2`: zIndex=350（2Fアバターより常に上）
  - 1Fアバター: z=50 or 130（全bridgeより下）
- **bridge/pole/floorコンテナは `eventMode='none'` 必須**: `GameObject` は `eventMode='static'` を設定するため、大型スプライト(660×460)をそのまま追加するとクリックを横取りして右クリックメニュー等が機能しなくなる
- **深度マップ**: サーバー起動後にobjectAtlas.pngをオフスクリーンcanvasで読み込み、bridge0/1/2/poleの列ごと「最も下の不透明ピクセルY」を `bridgeDepthMaps[]` / `poleDepthMap` (Int16Array) に格納
- `entranceBlock.png`・`entranceBlock()` 関数は削除済み

---

### 4.55. 草原バグ修正 ✅ (2026-05-04 修正完了)

**修正内容**
- **草原入室クラッシュ**: `polygons["meadow"]` が undefined のとき `[0]` アクセスでクラッシュしていた → ガードを追加（`if (polygons["meadow"] && polygons["meadow"].length > 0)`）
- **`/polygon` エンドポイントの競合**: サーバー起動直後にポリゴンキャッシュ生成が完了する前にクライアントが `/polygon` を叩くと空オブジェクトが返っていた → `cacheReadyPromise` で完了待ちに変更（`routes/polygon.js`）
- **ポリゴン生成ループの中断**: 個々のファイル処理でエラーが発生するとループが止まり以降のファイル（cloud.png等）が処理されなかった → ファイルごとに try-catch して `continue` するよう修正
- **`hitArea/meadow.png` の破損**: PNG形式でないファイルが置かれていて `sharp` で処理できなかった → ファイルを差し替えで解決
- **雲の位置がクライアント間でずれる**: 初回計算が「平均速度×経過時間」の近似値だったため実際の風パターンとずれていた → `_computeCloudTotalDistance()`（whileループ版）に変更
- **雲のwhileループが重い**: `gameStartTime` が `2025-01-01` 固定で年々ループ回数が増えていた（2026年5月時点で約280万回）→ 「今月1日UTC深夜0時」を自動計算する方式に変更（最大31日分 ≈ 17万8千回以内）

---

### 4.6. エントランス・草原 時間帯フィルター（保留中）

**概要**
- エントランス・草原を現実の時刻に合わせて夕方・夜・夜明けの色調にする

**現状 (2026-04-12 実装済み・無効化中)**
- `ROOM_PHYSICS` の `skyTime: true` をコメントアウトして無効化中
- **再有効化**: エントランス・草原のエントリに `skyTime: true` を追加するだけ
- ColorMatrixFilterで時刻→色行列を補間（`SKY_MATRICES` / `getSkyMatrix()`）
- 時間帯: 昼(7:00-16:30)=変化なし、夕日(17:30)=赤増・緑微減・青55%、黄昏(19:00)=暗い赤紫、夜(20:00-5:00)=暗い青
- デバッグ用固定時刻: `startSkyOverlay` 内の `const t = sec / 60` を `const t = 1050` 等に変更

**保存済みプリセット**
- **ColorMatrixFilter版**（現在コード）: 夕方・夜・夜明けの自然な色調変化。`skyTime: true` で起動。
- **異世界感ADD版**: `startSkyOverlay` 下のコメントブロックに手順保存。`PIXI.BLEND_MODES.ADD` + `0xFF4400 alpha 0.35` のGraphicsオーバーレイ。イベント用途向け。

**問題点**
- エントランス背景はシアン系の色が多く、どの方式でも夕方らしい色にするのが難しい（シアン→青を削ると緑になる）
- ColorMatrixFilter版は「夕方」感は薄いが色が崩れにくい。ADD版は異世界感あり。

---

### 5. ユーザー投稿部屋（画像・コード）
**User-content rooms (images & code)**
- PNG画像アップロード→足場自動生成機能付き / PNG upload with auto-scaffold generation
- コードはPIXI.jsで描画可能なものだけ受け付ける / Only accept PIXI.js-drawable code
- セキュリティ: `<iframe sandbox>` でサンドボックス化、サーバーや外部APIへのアクセスを遮断 / Sandbox via iframe sandbox attribute

#### 詳細仕様書（2026-04-17 追加）

##### 5.1 システム概要
- **目的**: ユーザーが自由に部屋を作成・連結し、無限に拡張可能な仮想空間を構築
- **部屋の接続**: グラフ構造（各部屋は入口と出口を持つ）
- **権限管理**: 作成者パスワード、管理者パスワードによる階層的管理

##### 5.2 データベース設計（SQLite）

```sql
-- 部屋テーブル
CREATE TABLE rooms (
    id TEXT PRIMARY KEY,              -- UUID
    name TEXT NOT NULL,               -- 部屋名
    creator_token TEXT,               -- 作成者トークン（nullなら管理人）
    edit_password_hash TEXT,          -- 編集用パスワード（bcryptハッシュ）
    is_system_room BOOLEAN DEFAULT 0, -- システム部屋フラグ
    max_users INTEGER DEFAULT 0,      -- 最大人数（0=無制限）
    max_streamers INTEGER DEFAULT 0,  -- 最大配信者数
    allow_video BOOLEAN DEFAULT 1,    -- ビデオ配信許可
    allow_audio BOOLEAN DEFAULT 1,    -- 音声配信許可
    custom_code TEXT,                 -- カスタムPIXI.jsコード
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 部屋の画像テーブル
CREATE TABLE room_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    type TEXT NOT NULL,              -- 'background', 'platform', 'object'
    filename TEXT NOT NULL,          -- ファイル名
    url TEXT NOT NULL,               -- アクセスURL
    x REAL DEFAULT 0,                -- X座標
    y REAL DEFAULT 0,                -- Y座標
    width REAL,                      -- 幅
    height REAL,                     -- 高さ
    z_index INTEGER DEFAULT 0,       -- 重なり順
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- ワープゾーンテーブル
CREATE TABLE warp_zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,           -- 設置元の部屋
    target_room_id TEXT,             -- 接続先の部屋（nullなら未接続）
    shape TEXT NOT NULL,             -- 'rect' or 'circle'
    x REAL NOT NULL,                 -- X座標
    y REAL NOT NULL,                 -- Y座標
    width REAL NOT NULL,             -- 幅（矩形）または直径（円）
    height REAL,                     -- 高さ（矩形のみ）
    visual_opacity REAL DEFAULT 0.3, -- 視覚的な透明度
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (target_room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- 編集セッションテーブル
CREATE TABLE editing_sessions (
    id TEXT PRIMARY KEY,             -- セッションID
    warp_zone_id INTEGER NOT NULL,   -- 編集中のワープゾーン
    edit_password_hash TEXT NOT NULL,-- 編集用パスワード
    room_data TEXT,                  -- 編集中のデータ（JSON）
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warp_zone_id) REFERENCES warp_zones(id)
);
```

##### 5.3 部屋作成フロー
1. **開始**: 既存部屋の空きワープゾーンを右クリック→「部屋を作る」
2. **パスワード設定**: 編集用パスワードを入力
3. **編集画面**:
   - 部屋名、最大人数、配信設定
   - 画像アップロード（背景・足場・オブジェクト）
   - ワープゾーン配置（矩形・円形）
   - カスタムコード入力
4. **オートセーブ**: 編集中は自動保存
5. **公開**: 「部屋を作成」ボタンで正式公開

##### 5.4 画像仕様
- **制限**: 1部屋10枚まで、各1024px以下
- **形式**: PNG/JPEG → WebP自動変換
- **保存先**: `/public/uploads/rooms/{roomId}/`
- **種別**:
  - 背景: 衝突判定なし、最背面
  - 足場: 衝突判定あり（5%以上必須）
  - オブジェクト: Y座標でzIndex自動調整

##### 5.5 ワープゾーン仕様
- **形状**: 矩形（rect）、円形（circle）
- **配置**: ドラッグ&ドロップで視覚的に配置
- **接続**: 作成時は未接続、後から接続先を指定
- **既存との共存**: 従来の座標ベースワープと併用可能

##### 5.6 セキュリティ
- **管理者パスワード**: 環境変数 `ADMIN_PASSWORD`
- **編集パスワード**: bcryptでハッシュ化
- **Sandboxコード実行**:
  ```javascript
  <iframe sandbox="allow-scripts" srcdoc="
    <script>
      const PIXI = parent.PIXI;
      const startTime = Date.now();
      const checkTimeout = () => {
        if (Date.now() - startTime > 100) {
          throw new Error('実行時間制限超過');
        }
      };
      try {
        ${userCode}
      } catch (e) {
        parent.postMessage({error: e.message}, '*');
      }
    </script>
  "></iframe>
  ```

##### 5.7 バリデーション
- **足場密度**: 足場面積が部屋全体の5%以上
- **経路探索**: A*で全出口への到達可能性確認
- **削除制限**: 孤立防止、システム部屋保護

##### 5.8 実装フェーズ
1. **Phase 1**: データベース基盤 ✅ 2026-04-20 実装完了
   - [x] SQLite初期化（db/init.js）
   - [x] 既存部屋の初期データ投入（エントランス・草原・うちゅー・星1・むげんのいりぐち・むげん を is_system_room=1 で登録）
   - [x] DB接続モジュール（db/index.js、WAL mode・外部キー有効）
   - ✅ **2026-05-03 修正**: `better-sqlite3`（要コンパイル）→ `node-sqlite3-wasm`（WASM純JS、コンパイル不要）に変更。ネカフェポータブル環境対応。db/ フォルダのファイルシステム破損も再構築済み。

2. **Phase 2**: 基本的な部屋作成・保存 ✅ 2026-05-03 実装完了
   - [x] 部屋作成API（POST /api/rooms）← `/api/rooms` に統一
   - [x] 認証ミドルウェア（`authRoom`、crypto.scryptSync によるパスワード照合）
   - [x] 部屋情報API（GET /api/rooms/:id、PUT /api/rooms/:id）
   - [x] `db/init.js` を `app.js` で require するよう追加（起動時DB初期化）
   - 実装ファイル: `routes/rooms.js`

3. **Phase 3**: ワープゾーン機能 ✅ 2026-05-03 実装完了
   - [x] ワープゾーン配置UI（設定パネル「ワープゾーン管理」、ドラッグ矩形配置）
   - [x] 接続API（GET/POST/PUT/DELETE `/api/rooms/:id/warps`、GET `/api/rooms` 一覧）
   - [x] 既存ワープとの統合（`checkObjectWarpPoints` がDBワープゾーンも判定、ユーザー部屋への移動対応）
   - [x] ワープゾーンのドラッグ移動・リサイズ（Warpタブ表示中、本体ドラッグで移動、右下ハンドルで拡縮、ドロップ時API自動保存）✅ 2026-05-18 実装完了
   - 実装ファイル: `routes/rooms.js`（APIエンドポイント）、`bin/www`（動的ルーム生成）、`index.js`（dbWarpZones/描画/判定/配置モード）、`index.ejs`（設定パネルUI）

4. **Phase 4**: 画像アップロード ✅ 2026-05-04 実装完了
   - [x] アップロードAPI（POST /api/rooms/:id/images、base64 JSON受信）
   - [x] WebP変換（sharp使用、1024px以下にリサイズ、sharp不可時はそのまま保存）
   - [x] 画像一覧API（GET /api/rooms/:id/images）
   - [x] 位置更新API（PUT /api/rooms/:id/images/:imageId）
   - [x] 削除API（DELETE /api/rooms/:id/images/:imageId）
   - [x] 配置UI（設定パネル「画像管理」セクション、X/Y入力・種別選択・サムネイル一覧）
   - [x] PIXI描画（入室時 loadDbImages() で背景/足場/オブジェクトを zIndex 振り分けてレンダリング）
   - 実装ファイル: `routes/rooms.js`（API）、`app.js`（JSON上限5MB）、`views/index.ejs`（UI）、`index.js`（loadDbImages/drawDbImages/clearDbImages/UIハンドラ）
   - 保存先: `/public/uploads/rooms/{roomId}/`

5. **Phase 5**: Sandboxコード実行 ✅ 2026-05-04 実装完了
   - [x] iframe環境構築（`sandbox="allow-scripts allow-same-origin"` + srcdoc）
   - [x] PIXI.js注入（`parent.PIXI` / `parent.app` / `parent.customStage` でアクセス可能）
   - [x] 実行時間制限（5秒後に iframe 自動破棄）
   - [x] カスタムコードAPI（GET /api/rooms/:id/code）
   - [x] 編集UI（設定パネル「カスタムコード」セクション、読込・テスト実行・保存）
   - [x] 入退室連動（joineRoom 時に自動実行、loginRoom・部屋移動時に clearCustomCode）
   - 実装ファイル: `routes/rooms.js`（GET /:id/code）、`index.js`（_execCustomCodeInFrame / runCustomCode / clearCustomCode / UIハンドラ）、`views/index.ejs`（設定パネルUI）
   - 注意: `parent.customStage` は入室ごとに再生成される PIXI.Container（zIndex=500）。コードはここに追加すること

6. **Phase 6**: 管理機能 ✅ 2026-05-06 実装完了（経路探索は未実装）
   - [x] 削除制限（未接続ワープ2つ以上残存、backワープ保護、サイズ250px以内・合計2/3以内）
   - [ ] 経路探索（A* による全出口到達確認）— 保留
   - [x] 部屋編集UI（パスワード検証、編集ロック、部屋名編集、ワープ自動生成・形状選択・削除制限・光る、画像・落書き→画像、コードルール・テストコード・コピー）
   - [x] 電車にユーザー部屋追加（ネイビーボタン）
   - [x] パスワード未入力=誰でも編集可
   - [x] 部屋は24時間アクティビティなしで自動削除

   #### Phase 6 追加実装（2026-05-07）
   - **PIXI画面への直接落書き**: 編集中に猫街の画面に直接描画→「画像として追加」ボタンで画像化。既存のUNDO/REDOボタンをそのまま使用。DOM captureフェーズで PIXI のポインターイベントをブロック（`stopImmediatePropagation()`）。変数: `_imgDoodleMode`, `_imgDoodleGfx`, `_imgDoodleHistory[]`, `_imgDoodleRedoStack[]`
   - **ワープ仕様変更**:
     - 形状を矩形/円/楕円の3択で最初から選ぶ（形状ボタンクリックと同時に配置モード開始）
     - 最大サイズ250px（縦横各）にハードクランプ（アラートなし）
     - ワープ先指定を廃止 → ワープを踏んだユーザーが新しい部屋を作る（`_warpPortalCreateRoom()`）。部屋名ポップアップなしで即座に編集パネルを開く（むげんのいりぐちGATEと同じ動作。2026-05-16 変更）
     - 戻りワープ（`warp_type='back'`）: `_prevRoomSpot` に入室前の部屋を記録し、踏むと戻る
     - **画像ワープ**: 画像一覧の行に「ワープ」トグルボタン追加。`is_warp=1` の画像を踏むと新部屋作成
     - ドラッグ移動・リサイズ機能: コードは残してあるが呼び出しをコメントアウト中（後で復活予定）
   - **編集パネルUX**: パスワード未入力状態では保存/完了/保存せずに戻るボタンを非表示。部屋名はパスワード前から表示（`_allRooms` キャッシュ or `GET /api/rooms/:id` で取得）
   - **電車（#train）修正**: DBから全ユーザー部屋を取得して表示（以前はメモリ上のアクティブ部屋のみ）。ユーザー部屋はネイビーボタンで色分け。

   #### 電車 `last_activity` バグ修正（2026-05-07）
   - **原因**: `db/init.js` の `alterCmds` に `"ALTER TABLE rooms ADD COLUMN last_activity DATETIME DEFAULT CURRENT_TIMESTAMP"` があったが、node-sqlite3-wasm は `ALTER TABLE ADD COLUMN` で関数ベースのデフォルト値（`CURRENT_TIMESTAMP` 等）を受け付けない（"Cannot add a column with non-constant default"）。例外は `catch (_e) {}` でサイレント飲みされ、カラムが追加されないまま運用されていた
   - **修正**: `DEFAULT CURRENT_TIMESTAMP` → `DEFAULT NULL` に変更。クエリ側は `ORDER BY COALESCE(last_activity, created_at) DESC` に変更
   - **教訓**: `alterCmds` で DATETIME カラムを追加する場合は必ず `DEFAULT NULL` にする

---

### 無限部屋（むげん）✅ 2026-05-05 実装完了

**むげんのいりぐち**（エントランス部屋）
- うちゅー x453〜467, y133〜147 のワープゾーンから入室
- エントランス 床ポリゴン [[250,0]...[304,0]] のワープから入室（2026-05-18 追加）
- 白背景、中央に GATE.png（`img/objects/GATE.png`）、zIndex:310
- X275〜380, Y145〜290 を踏むと「むげん」に移動

**むげん**（本体・無限部屋の起点）
- むげんのいりぐちから入室、右下（x580〜660, y400〜480）から入口に戻れる
- 白背景、上下左右の中央端に GATE.png を scale 2/5 で配置
- 各GATEのtintカラーはコメントで保存中（上:0x444444 下:0xaabbff 左:0xffffff 右:0xff2020）、現在は全て 0xffffff（元の色）
- アバタースケール 0.82、出現位置 AX:330 AY:255 DIR:S
- 電車からも両部屋に移動可能

**GATEリンク機能** ✅ 2026-05-08 実装完了
- 各 GATE をクリック → 未接続なら新規部屋を即時作成して入室＋編集パネルが開く
- 接続済みなら対応する部屋へ移動
- **上GATE（インデックス0）は現在ロック中**：クリックしても「この部屋の編集には特別な権限が必要です。」とチャットに表示するのみ（権限仕様は未確定・後日実装）
- 部屋名は空のままで作成開始、編集パネルで入力する
- 編集中に切断 → 部屋名が空のまま残った場合はサーバーが自動削除し `mugen_gates` もクリア
- 部屋削除時は `mugen_gates.room_id` を NULL に戻す（`routes/rooms.js` DELETE・切断クリーンアップ両方）
- DB に古い room_id が残っていても POST 409 ハンドラが自動クリアして新規作成に進む（`routes/mugen.js`）
- `roomNotFound` 受信時にむげんゲート入室試行中だった場合はゲートを空扱いにして作成フローを再開（ループ防止）

**関連ファイル**
- `index.js`: グローバル変数 `mugenIriguchi` / `mugenRoom` / `gateTex` / `mugenGateRooms` / `_mugenGateBeingEntered`、Room constructor case "むげんのいりぐち" / "むげん"、goSelfToRoomSpot "mugenEntrySpot" / "mugenMainSpot"、ROOM_PHYSICS エントリ、`onMugenGateClick` / `showGateCreateDialog` / `loadMugenGates` / `updateMugenGateTints`
- `routes/mugen.js`: GET/POST/DELETE `/api/mugen/gates`
- `bin/www`: roomNameList・ROOM_SE_KEY・joineRoom switch に両部屋追加、切断クリーンアップで空名前部屋削除＋mugen_gates クリア
- `db/init.js`: is_system_room=1 で両部屋を登録

---

##### 5.9 既存システムとの統合
- 既存部屋（エントランス等）をis_system_room=1で登録
- 既存ワープ処理は維持、新ワープゾーンを追加
- Socket.IOイベントの拡張

---

### 6. ログハイライト機能 ✅
**Log highlight**
- アバタークリック→そのユーザーの発言と入退室のみハイライト / Click avatar → highlight that user's messages & joins/leaves
- 他をクリックで解除 / Click elsewhere to deselect
- 設定でON/OFF / Toggleable

#### 現状 (2026-04-13 実装完了)
- アバター左クリック or ログ項目クリック（Ctrl なし）でそのユーザーをハイライト、同じ対象を再クリックで解除
- 部屋背景左クリック（Ctrl/ラクガキモード以外）でハイライト解除
- ハイライト色はアバターカラーを参照: 発言 `rgba(r,g,b,0.7)`、入退室 `rgba(r,g,b,0.3)`
- アバターカラーが真っ黒（`r+g+b < 60`）の場合は黒背景・白文字（文字色は黒のまま）
- 他ユーザーの発言を薄くする（dim）は実装せず（当初実装したが削除）
- 入退室アナウンスにもトークンを紐付け（`otherJoined`/`otherLeft`/`logout` は `data.token`、自入室は `myToken`）
- 設定チェックボックスは3つ構成: `☑ログのハイライト（☑アバタークリック、☑ログクリック）`
  - localStorage: `useLogHighlight`（マスター）、`useAvatarHighlight`、`useLogItemHighlight`
  - マスター OFF → カッコ内全体グレーアウト、各サブ OFF → そのサブだけグレーアウト
  - 全オフ → マスターON: 右二つも自動ON
  - 全オフ → サブON: マスターだけ自動ON（もう片方のサブは連動しない）
  - 全オン → マスターOFF: 右二つも自動OFF
  - 右二つ両方OFF → マスター自動OFF
- `li.classList.add('log-announce')` で入退室を識別、`li.classList.add(token)` でトークン紐付け
- ハイライト中に新着メッセージが来た場合も即時スタイル適用
- **注意**: `querySelectorAll('li.' + token)` は token が数字始まりだと SyntaxError になりハイライト不可になる。必ず `CSS.escape(token)` でエスケープすること
- **注意**: `avaP[token].avatarColor` が `0`（黒）のとき `|| 0xffffff` フォールバックが誤作動する。`?? 0xffffff`（nullish coalescing）を使うこと

#### 仕様変更履歴
- ハイライト背景色: 黄（`rgba(255,255,100,0.25)`）→ 青固定 → アバターカラー参照に変更
- 他ユーザーを薄くする（dim）: 当初実装したが「不要」とのことで削除
- 文字色: 白文字案を出したが「黒のままでいい」とのことで取り消し（黒背景時のみ白）

---

### 7. ログ複数行入力（Shift+Enter）✅
**Multi-line input (Shift+Enter)**
- Shift+Enterで入力欄が縦に拡張 / Shift+Enter expands input vertically
- Enterで送信→入力欄リセット / Enter sends → resets input

#### 現状 (2026-04-13 実装完了)
- `<input>` → `<textarea>` に変更、`rows="1"` で初期1行
- Shift+Enter: テキストエリア内で改行
- Enter（Shiftなし）: 送信（`e.preventDefault()` + `dispatchEvent("submit")`）
- Alt+Enter: ログ残し（`isDownedShift = e.altKey` で判定、`carryOver: true` で送信）
- テキストエリアは入力に合わせて自動リサイズ（`autoResizeMsg()`）、送信後リセット

#### 更新 (2026-05-16 スマホ用送信ボタン追加)
- スマホ幅（870px以下）のみ ⏎ 送信ボタンを入力欄右に表示（`#sendBtn`）
- ボタン高さは `align-items: stretch` で入力欄に追従
- `msgForm` の表示は `display: flex`（JSで `block` にすると flex が崩れるため注意）
- **バグ修正 (2026-05-17)**: 送信ボタンタップ後にテキストエリアのフォーカスが外れる問題  
  → `sendBtn` の `mousedown` で `preventDefault()` することでフォーカス奪取を防止
- チャットログの改行表示: `\n` を `<br>` に変換し `li` の直接の子として挿入
  - 自動折り返し・明示改行ともに2行目以降は `li` 左端から始まる
  - `li.classList.add(thisToken)` で追加（`li.className =` で上書きしないこと）
  - `msgPrefix` span（icon + 名前）は `display: inline; white-space: nowrap`
  - テキストノードと `<br>` は `li` に直接 appendChild（span等のネストなし）

#### 更新 (2026-05-16 画面チャット スワイプ操作・電車ボタン改善)
- **左右スワイプ / Shift+ホイール / 横トラックパッドでテキスト色切替**: `myCanvas` に touchend・wheel を追加。タッチは50px以上水平スワイプ、ホイールは `shiftKey` または `deltaX > deltaY` で判定。7色プリセット（white/black/黄/橙/赤/水色/ピンク）を循環。`overlayChatStyle.fill` と既存 PIXI.Text 子要素を一括更新
- **上下スワイプ / 縦ホイールでスクロール**: `myCanvas` の touchmove・wheel で縦方向検出時に `overlayChat.y` を更新。スクリーン座標→PIXI座標に変換（`460 / rect.height`）。上端（y=0）を超えない
- **電車ボタン → 画面チャットにもテキスト表示**: `socket.on("train")` で mainLog の DOM ボタン表示に加え、部屋一覧を PIXI.Text として overlayChat にも追加
- **電車ボタン → mainLog 自動展開**: mainLog が非表示状態でも電車イベント受信時に自動展開・最下部スクロール

---

### 8. 他者からのアバター落書きON/OFF ✅
**Toggle others' avatar doodles**
- デフォルトON / Default: ON

#### 現状（2026-04-13 実装完了）
- localStorage キー: `allowOthersOekaki`（デフォルト `true`）
- OFFにすると右クリックメニューに「ラクガキする」が表示されなくなる（「ラクガキをやめる」は表示される）
- サーバー側でも `oekaki` / `oekakiClear` をブロック（コンソール抜け道不可）
- ログイン時に自分の設定をサーバーに送信、設定変更時も即時反映・部屋内全員に broadcast
- OFFに切り替わった瞬間、相手が描画中でもストロークを強制中断（座標混在バグ防止）

---

### 9. リスナー人数表示
**Viewer count display**
- 配信画面に現在の受信者数を表示 / Show current viewer count on stream screen

---

### 10. usersで時間表示 ✅
**Timestamp in users list**
- usersボタン押下時に時刻も表示 / Show time when users list is opened

#### 現状（2026-05-17 実装完了）
- `socket.on("list")` 受信時に現在時刻（HH:MM）を `li` の末尾に span で追加

---

**Stream quality selector**
- 最高・高・標準・低 の4段階 / 4 levels: max / high / normal / low
- 設定から変更 / Changed via settings

#### 現状（2026-05-08 実装完了）
- 送信側: 設定パネル「配信画質」セレクト（720p/480p/240p/120p）→ getUserMedia constraints + applyConstraints + 全視聴者へ streamQuality イベント通知
- 受信側: mediaElement 内に画質セレクト追加 → DataChannel で配信者に setReceiverQuality 送信 → 配信者が setParameters(maxBitrate) で制限
- 上限制約: senderQuality より高い選択肢は disabled、超えていたら自動で下げる
- localStorage: `streamQualityLevel`

---

### 12. カメラ選択
**Camera selection**
- 配信開始時にカメラを選択 / Select camera when starting stream
- 「毎回選ぶ」か固定かを設定で切り替え（初期値: 毎回）/ Setting: always-ask vs. fixed (default: always-ask)
- 保存済みカメラが存在しない場合は再選択 / Re-ask if saved camera not found

#### 現状
2026-05-18 実装完了。設定パネルに「カメラ：毎回選ぶ/固定」セレクトを追加。動画配信ボタン押下時に `_getVideoDeviceId()` → `_pickDevice('videoinput')` でデバイスピッカー表示。固定モードかつ保存済み deviceId が有効なら再選択しない。localStorage: `cameraSelectMode`, `cameraDeviceId`, `cameraDeviceLabel`。

---

### 13. マイク選択
**Mic selection**
- カメラ選択と同仕様 / Same spec as camera selection

#### 現状
2026-05-18 実装完了。カメラ選択と同仕様。`_getMicDeviceId()` → `_pickDevice('audioinput')`。localStorage: `micSelectMode`, `micDeviceId`, `micDeviceLabel`。

---

### 14. 複数カメラ
**Multi-camera support**
- 複数カメラを同時使用可能にする / Allow using multiple cameras simultaneously

---

### 15. 配信音量ブースト
**Audio boost**
- 音声をブースト、ON/OFF可能 / Boost mic audio, toggleable

---

### 16. 配信音量可視化
**Audio level visualization**
- 音声バーに音量に応じた色付きバーを表示 / Color bar extending with volume on audio bar

---

### 17. 動画コメント機能
**Floating video comments (ニコニコ style)**
- 動画上にコメントが流れる / Comments scroll over video
- ON/OFF切り替え、動画のすぐ横に切り替えボタン / Toggle button next to video

---

### 18. 透過配信（スマホ向け）✅ (2026-05-18 実装完了)
**Transparent stream overlay (mobile)**
- 配信画面を半透明にして画面に重ねる / Semi-transparent stream overlaid on screen
- スライダーで透明度をリアルタイム変更 / Slider to adjust opacity anytime

#### 現状（2026-05-18 実装完了）
- `#mediaContainer.video-transparent-mode` を `position:fixed; top:0; left:0; right:0; bottom:0; z-index:50; pointer-events:none` で全画面オーバーレイ
- 透過モード時: 動画 `opacity = videoTransparentOpacity`、`pointer-events:auto`、`width:100%; height:100%; object-fit:contain` で全画面表示
- **映像のダブルタップ**で通常↔透過切替（`toggleVideoTransparent()`）
- **映像のドラッグ**で位置移動、**右下コーナー（28px）ドラッグ**でリサイズ（通常・透過両モード対応）
  - `freeFloat=true` で `videoResize()` の自動レイアウトから除外
  - `videoHandles[token]` にグリップハンドルdivを保持、`_syncHandle()` で位置同期
- 設定チェックボックス「透過配信をデフォルトにする」＋透過度スライダー（0.05〜0.95）
- localStorage: `videoTransparentDefault`（bool）、`videoTransparentOpacity`（float）

---

### 19. 多言語対応
**Multilingual UI**
- 設定で言語切り替え / Language switch in settings
- **見送り（2026-05-17）**: ブラウザの自動翻訳で代替できるため実装不要と判断

---

### 20. 自動翻訳
**Auto-translate chat**
- チャットを自動翻訳 / Auto-translate chat messages
- 設定でON/OFF / Toggleable
- **見送り（2026-05-17）**: 翻訳APIのコスト・レート制限の問題があり実装見送り

---

### 21. 特定部屋への直接リンク ✅
**Direct room link**
- ログイン後に指定部屋へ直行するリンクを発行 / Shareable link that lands user in specific room after login
- 設定からコピー可能 / Copyable from settings

#### 現状（2026-05-17 実装完了）
- URL パラメータ `?room=<部屋名>` でアクセスすると、ログイン後にその部屋へ自動移動
  - システム部屋: `?room=エントランス`、`?room=草原`、`?room=うちゅー`、`?room=星1`、`?room=むげんのいりぐち`、`?room=むげん`
  - ユーザー部屋: `?room=<room_id>`
- 設定パネルに「この部屋のリンクをコピー」ボタン → クリックボードにコピーしてチャットに通知
- 実装場所: `index.js` `_directLinkRoom` 変数（グローバル）、`socket.on("joineRoom")` 末尾のリダイレクト処理、`copyRoomLink()` 関数; `index.ejs` 設定パネル内ボタン

---

### 22. YouTuberモード
**YouTuber mode**
- 人物を切り抜き、画面右下に表示 / Chroma-key/cutout person shown bottom-right

---

### 23. ボイスチェンジャー
**Voice changer**
- 配信中に簡単なボイスチェンジャーを使用可能 / Basic voice changer during streaming

---

※ 24以降は未確定仕様。新スレッドで質問しないこと。
※ Items 24+ are not finalized. Do not ask about them in new threads.

### 24. 宇宙の反響 / Space reverb effect
### 25. 掲示板 / Bulletin board in the town
### 26. 文字の部屋 / Room where typed text falls from above
### 27. マンション / 999-floor apartment (up to 3 rooms each)
### 28. 自動生成迷路 / Auto-generated maze room
### 29. ライブカメラ部屋 / Room where stream feed is the room itself### 30. ピアノ部屋 / Piano room (avatars step on keys to play notes)
### 31. 粉の部屋 / Powder room (colorful powder falls as avatars walk)
### 32. もち / "もち" keyword in chat triggers mochi to fall
