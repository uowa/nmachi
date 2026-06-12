# 猫街 (Neko Machi) — 開発仕様書 / Feature Spec

## プロジェクト概要 / Project Overview
- リアルタイムチャット・配信Webアプリ / Real-time chat & streaming web app
- Stack: Node.js/Express, PIXI.js, Socket.io
- アバターが部屋を動き回り、チャットや配信ができる / Avatars move around rooms, chat & stream
- Working dir: `e:\マイドライブ\Pmachi6`

---

## インフラ・運用メモ

### TURNサーバー（WebRTC）
- 自前 coturn: `turn:nuco.moe:50000` / `stun:coturn.nuco.moe:50000`（username: user / credential: password）
- **2026-05-25 時点で nuco.moe coturn が停止中**。ICEがcheckingのまま止まり映像が映らない症状が出る。
- 暫定対応: `openrelay.metered.ca` の無料公開TURNを追加済み（`prepareNewConnection` の `pc_config.iceServers`）。帯域制限あり。
- nuco.moe が復活したら openrelay を外すこと。長期的には有料TURNサービスへの移行を検討。
- ICEが繋がらない場合はまずTURNサーバーを疑うこと。

---

## 実装ブロック管理 / Implementation Block Guide

**spec.md・memory の同時更新ルール**: 複数機能を同時に進めている間は spec.md / CLAUDE.md / memory への書き込みは行わない。ユーザーが「完了」と言った時点で書き込む。先に完了した機能も、他の機能が進行中なら spec.md 更新はユーザー許可後に行う。

### ブロック定義

| ブロック | 内容 | 触るファイル |
|---|---|---|
| **index.js** | index.js を編集するタスク全般 | `index.js`（+タスクにより `style.css` `index.ejs` 等） |
| **F** | サーバーイベント全般 | `bin/www` |
| **G** | 方角部屋システム | `index.js` `bin/www` `db/init.js` |
| **I** | サブページ・静的ページ・外部リンク | `views/` `routes/pages.js` 新規ページ |
| **J** | ロゴ・デザイン変更 | `public/` `style.css` テキスト全体 |
| **K** | パフォーマンス・セキュリティ（別枠） | 全ファイル横断 |
| **L** | 文字の部屋・粉の部屋（kona全域） | `index.js` `bin/www` |

### 同時作業不可ペア

> 同じUSBフォルダで並列作業する場合、**同じファイルを触るブロック同士は後から保存した方が上書きされる**。

**① `index.js` を共有（index.js / G / L）→ 同時に1つだけ**

**② `bin/www` を共有（F / G / L）→ 同時に1つだけ**

**③ J は `style.css` を含む → index.js タスクが style.css も触る場合は不可**

---

**安全に同時作業できる組み合わせ（ファイルが完全に別）**:

| 組み合わせ | 理由 |
|---|---|
| **F + index.js（G・L除く）** | F は `bin/www` のみ |
| **I + ほぼ何でも** | I は `views/` と `routes/pages.js` のみ |

---

### 未実装タスク一覧（実装順推奨）

> 実装完了後このリストから削除。詳細は各番号のセクションを参照。

#### グループ1：バグ修正・他機能に干渉しやすい（優先）

| # | タスク | ブロック |
|---|---|---|
| 39 | 部屋入退室通知に部屋名を表示（ID→部屋名） | F / index.js |
| 34 | むげん部屋キーボードループ（画面外→逆方向から出現） | index.js |
| 33 | スマホ配信でアバターが細くなるバグ修正 | index.js |

#### グループ2：UI改善・中規模

| # | タスク | ブロック |
|---|---|---|
| 31 | 画面チャット・ログ状態の前回状態引き継ぎ | index.js |
| 18 (追加) | 透過配信：ダブルクリック切替 + PCスクロールで透過度変更 | index.js |
| 9 | リスナー人数表示（配信画面に受信者数を表示） | index.js / F |
| 38 | usersボタン → 部屋情報ボタン改修（部屋名・受信者・アボン修正） | index.js |
| 40 | 電車ボタン改修（行変え・リアルタイム数値更新） | index.js |
| 35 | 設定パネル配置変更（ラクガキ設定・読み上げ行の移動） | index.js |
| 36 | 編集用UIをF12コンソール開いてる時だけ表示 | index.js |

#### グループ3：大規模・AI応答待ちが多いもの

| # | タスク | ブロック |
|---|---|---|
| 24 (追加) | 動画複数時のMAP上配置ルール修正 | index.js |
| 14 | 複数カメラ同時使用 | index.js |
| 15 | 配信音量ブースト（マイク音声をブースト、ON/OFF） | index.js |
| 16 | 配信音量可視化（音量に応じた色バー表示） | index.js |
| 17 | 動画コメント機能（ニコニコ風、動画上に流れるコメント） | index.js |
| 22 | YouTuberモード（人物切り抜き・右下表示） | index.js |
| 41 | 東西南北部屋の大幅改修 | G |
| 42 | 部屋作成UIの大規模改修（PLANモード必須） | index.js |
| 37 | ロゴ名称変更（NecojectMachi → Necomachi） | J |
| 43 | UIボタンデザインテストページ | I / J |
| 44 | リンク集・更新履歴改修 | I |
| 45 | カンパ用URLページ | I |

#### やりかけ・動作不安定（要修正）

| # | タスク | ブロック |
|---|---|---|
| 27 | 文字の部屋（未完成・動作不安定） | L |
| 29 | 粉の部屋（未完成・動作不安定） | L |

#### 保留中（外部判断待ち・再有効化待ち）

| # | タスク | ブロック | 理由 |
|---|---|---|---|
| 3 | 読み上げ機能（TTS）続き | index.js | VoiceVox導入可否がサーバースペック次第。公開サーバー移行後に判断 |
| 23 | ボイスチェンジャー（配信中に使用可能） | index.js | ピッチ変換はライブラリ or AudioWorklet必須で重め。公開後に要件確認 |
| 4.6 | 時間帯フィルター（夕方・夜の色調） | index.js | 実装済みだが無効化中。再有効化は `skyTime: true` を戻すだけ |

#### 別枠（最後・横断的調査が必要）

| # | タスク | ブロック |
|---|---|---|
| 47 | パフォーマンス改善（重い要素の洗い出し・改善） | K |
| 48 | セキュリティ改善（問題の洗い出し・修正） | K |

---

## 機能リスト / Feature List
※ 上から優先順位が高い。開発都合で順番変更可だが、上位項目を大幅に下げるのはNG。
※ Priority order (top = highest). Reordering for dev convenience is OK, but don't push high-priority items too far down.

---

### 1. キーボード移動 & アバター落書き強化 ✅ (2026-04-10 実装完了)
**Keyboard movement & avatar doodle enhancement**
- 矢印キーで移動、同時押しで斜め移動 / Arrow keys to move, diagonal on simultaneous press
- キーを離した時点で停止（クリック移動と違いアイドルポーズにならない）/ Stop on key release (no idle pose, unlike click-move)
- 方向・状態ごとに落書きパターンを持たせ、歩くたびに切り替え / Doodle patterns per direction/state, cycle each step

---

### 2. 自動再接続 ✅ (2026-04-10 実装完了)
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

### 4. 吹き出し位置変更・改善 ✅ (2026-04-11 実装完了 / 2026-06-11 改善完了)
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

#### 追加実装済み ✅ (2026-06-11 実装完了)
- **移動範囲**: `_bx = -w/2 + offsetX`（吹き出し中心がアバター真上）、offsetX ±250px で左右対称
- **グロー**: 10px 外層を削除、5px+2px の2層構成に縮小
- **画面端自動収まり**: `_redraw()` でキャンバス境界クランプ（ドラッグ中は無効）
- **障害物前面表示**: `displayRoom()` で `avaBubbleLayer`（zIndex=400）を `room.container` に追加。テキスト設定時に吹き出しを reparent＋overlay ticker で毎フレーム位置追従。`otherLeft`・再接続時にクリーンアップ
- **濃い色アバターの視認性**: lum<80 のとき `0xf5f5f5`（≈96%白）文字＋アバター色2px stroke。通常はアバター色文字のまま

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

**GATEリンク機能** ✅ 2026-05-08 実装完了 → 2026-05-31 方角部屋システムに改修

**方角部屋システム**（2026-05-31 実装完了）
- むげんの4GATEは方角部屋に固定（クリックで直接移動、名前入力なし）：
  - 上GATE(0) → 北の部屋、下GATE(1) → 南の部屋、左GATE(2) → 西の部屋、右GATE(3) → 東の部屋
- 方角部屋はシステム部屋（is_system_room=1、永続）、白背景・4方向GATE.png
- 方角部屋GATEをクリック → 新しいサブ部屋を作成（名前は編集パネルで）
- サブ部屋の有効期限は方角部屋によって異なる：
  - **東の部屋**: 24時間（1日）
  - **南の部屋**: 168時間（1週間）
  - **西の部屋**: 720時間（1ヶ月）
  - **北の部屋**: 8760時間（1年）
- 方角部屋右下（x580〜660, y400〜480）を踏むとむげんに戻る
- 期限はDBの `lifetime_hours` カラムで管理、クリーンアップはSQLite動的interval

**バグ修正（2026-05-31）**
- **むげんGATEクリックで方角部屋がむげんに見える問題**: 方角部屋の見た目がむげんと同一（白背景＋同位置GATE）だったため、中央に半透明グレーの部屋名ラベルを追加（`dirLabel`、eventMode:'none'）
- **遷移中の誤ワープ**: 部屋遷移直後にアバターの古い座標（旧部屋の位置）でwarpPoints判定が走り、方角部屋の「右下→むげん戻りワープ」がヒットしてむげんに戻される可能性があった。`_inRoomTransition` フラグで修正（`goSelfToRoomSpot` 開始時に true、`joineRoom` 受信末尾で false）

**関連ファイル**
- `index.js`: グローバル変数 `dirRoomEast/South/West/North` / `directionGateRooms` / `directionGateSprites` / `_directionGateBeingEntered` / `_newRoomParentDirection`、Room constructor case 4方角部屋、goSelfToRoomSpot `東/南/西/北の部屋Spot`、warpPoints 方角部屋→むげん、`loadDirectionGates` / `updateDirectionGateTints` / `onDirectionGateClick` / `showDirectionGateCreateDialog`
- `routes/direction.js`: GET/POST/DELETE `/api/direction/:roomName/gates`
- `routes/mugen.js`: GET/POST/DELETE `/api/mugen/gates`（むげんGATEは常に方角部屋を返す）
- `bin/www`: roomNameList・ROOM_SE_KEY・joineRoom switchに4方角部屋追加、lifetime_hoursベースのクリーンアップ
- `db/init.js`: is_system_room=1 で4方角部屋を登録、mugen_gates初期化、direction_gatesテーブル・lifetime_hoursカラム追加

---

##### 5.9 既存システムとの統合
- 既存部屋（エントランス等）をis_system_room=1で登録
- 既存ワープ処理は維持、新ワープゾーンを追加
- Socket.IOイベントの拡張

---

### 6. ログハイライト機能 ✅ (2026-04-13 実装完了)
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

### 7. ログ複数行入力（Shift+Enter）✅ (2026-04-13 実装完了)
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

### 8. 他者からのアバター落書きON/OFF ✅ (2026-04-13 実装完了)
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

### 10. usersで時間表示 ✅ (2026-05-17 実装完了)
**Timestamp in users list**
- usersボタン押下時に時刻も表示 / Show time when users list is opened

#### 現状（2026-05-17 実装完了）
- `socket.on("list")` 受信時に現在時刻（HH:MM）を `li` の末尾に span で追加

---

### 11. 配信画質セレクター ✅ (2026-05-08 実装完了)
**Stream quality selector**
- 最高・高・標準・低 の4段階 / 4 levels: max / high / normal / low
- 設定から変更 / Changed via settings

#### 現状（2026-05-08 実装完了）
- 送信側: 設定パネル「配信画質」セレクト（720p/480p/240p/120p）→ getUserMedia constraints + applyConstraints + 全視聴者へ streamQuality イベント通知
- 受信側: mediaElement 内に画質セレクト追加 → DataChannel で配信者に setReceiverQuality 送信 → 配信者が setParameters(maxBitrate) で制限
- 上限制約: senderQuality より高い選択肢は disabled、超えていたら自動で下げる
- localStorage: `streamQualityLevel`

---

### 12. カメラ選択 ✅ (2026-05-18 実装完了)
**Camera selection**
- 配信開始時にカメラを選択 / Select camera when starting stream
- 「毎回選ぶ」か固定かを設定で切り替え（初期値: 毎回）/ Setting: always-ask vs. fixed (default: always-ask)
- 保存済みカメラが存在しない場合は再選択 / Re-ask if saved camera not found

#### 現状
2026-05-18 実装完了。設定パネルに「カメラ：毎回選ぶ/固定」セレクトを追加。動画配信ボタン押下時に `_getVideoDeviceId()` → `_pickDevice('videoinput')` でデバイスピッカー表示。固定モードかつ保存済み deviceId が有効なら再選択しない。localStorage: `cameraSelectMode`, `cameraDeviceId`, `cameraDeviceLabel`。

---

### 12.5. カメラプレビュー（配信中カメラ切替）✅ (2026-05-31 実装完了)

**Camera preview during stream**
- 配信中に別カメラに切り替える前にプレビュー確認できる
- プレビュー用チェックボックスON → 現在のカメラ映像をプレビュー枠に表示
- 別カメラ選択 → 配信映像を黒にしてプレビューに新カメラを表示
- プレビュー終了時、別カメラを選んでいた場合は確認ダイアログで採用/元に戻すを選択

#### 現状（2026-05-31 実装完了）
- `_switchSettingPreview(deviceId, isInitial)`: プレビュー切替の中核。配信中+別カメラの場合、`videoArray[myToken]` 系の `srcObject = null` + `style.background = '#000'` で配信映像を黒にしてから localStream のトラックを止め、新カメラで getUserMedia
- 黒オーバーレイ（`#settingPreviewBlackOverlay`）は初期 `display:block`、`playing` イベント発火で `display:none`（iOS Safari は `getVideoPlaybackQuality()` 未サポートのため `playing` イベントを使用）
- `switchVideoDevice()` 呼び出し時に `videoArray[key].srcObject = newStream` と同時に `style.background = ''` をクリア
- プレビュー中のカメラ名がセレクトで元に戻るバグ → `populateDeviceSelects()` で `_settingPreviewCurrentDeviceId` を参照して修正
- グローバル変数: `_settingPreviewActive`, `_settingPreviewStream`, `_settingPreviewOrigCameraDeviceId`, `_settingPreviewOrigCameraDeviceLabel`, `_settingPreviewCurrentDeviceId`

---

### 13. マイク選択 ✅ (2026-05-18 実装完了)
**Mic selection**
- カメラ選択と同仕様 / Same spec as camera selection

#### 現状
2026-05-18 実装完了。カメラ選択と同仕様。`_getMicDeviceId()` → `_pickDevice('audioinput')`。localStorage: `micSelectMode`, `micDeviceId`, `micDeviceLabel`。

---

### 14. 複数カメラ ✅ (2026-06-12 実装完了、2026-06-13 バグ修正、2026-06-13 追加バグ修正)
**Multi-camera support**
- 複数カメラを同時使用可能にする / Allow using multiple cameras simultaneously

#### 現状（2026-06-12 実装完了）
- 最大10台のカメラを同時配信可能（cam1は既存変数、cam2〜10は `_xcam[n]` オブジェクトで管理）
- 設定パネルに「複数カメラ」チェックボックスを追加（localStorage `multiCameraEnabled` で保存、デフォルトOFF）
- チェックON時：cam1が選択されるとcam2セレクターが出現、cam2選択でcam3セレクター…と順番に最大cam10まで動的生成（`populateDeviceSelects` が `camExtraDeviceWraps` コンテナに生成）
- 「毎回選ぶ」ピッカーでも同様にcam2→cam3→…と連鎖セレクター表示（`_buildPickerCamSelect` で汎用生成）
- 受信側には「動画受信N」ボタンがN台分表示
- WebRTC: 1本のRTCPeerConnectionに複数トラックを追加（接続数は増やさない）
- stream ID で `_xcam[n].streamId[fromToken]` と照合してどのカメラのトラックか判定
- 同時使用できないカメラを選択した場合は `NotReadableError` をキャッチしてエラー表示・リセット
- ピッカープレビュー：プレビューボタンON後に選択でもON前に選択後にボタンONでも映像が出る（`_pickerSyncExtraPreviews` で一括同期）、プレビューOFF時に消える
- 設定パネルプレビュー：cam2〜以降も各カメラのプレビュー動画が縦に並ぶ
- `videoStartOrder[myToken+'_N']` でcam1より後のタイムスタンプを付与し、パネル順を保証
- 各カメラは完全独立（cam N=none にすると cam N のみ停止・クリア、他カメラに影響なし）
- `populateDeviceSelects` は「最後にdeviceIdが設定されているcam+1」まで動的にセレクターを表示（中抜けがあっても高番号camのセレクターが消えない）
- cam N 選択時、cam1が配信中（`videoStatus`）なら即起動（前のcamが配信中かは不問）
- `複数カメラ` チェックOFF時は cam2+ の deviceId を localStorage からも削除・previewStream も停止
- `_pendingExtraCameraIds` をオブジェクト形式に変更し中抜けcam番号に対応
- `remove video button` 受信時、cam2+ボタンが表示中なら `removeMediaElementButton` を呼ばない
- `createVideoButton` のonclickで `stream[fromToken]` が既にあれば直接 attach（再配信後に押せない問題を修正）
- **disconnect 時に cam2+ の status・stream が残留するバグを修正**（disconnectハンドラ末尾に cam2+ ローカル停止ループ追加）
- **`startVideoN` の getDeviceStream await 中に disconnect・部屋移動が起きた場合の誤動作を修正**（await 後に `videoStatus` ガード追加）
- **`stopAllConnection` で `_xcam[n].remoteStream` がクリアされないバグを修正**（cam2+ ループに `delete remoteStream` 追加）
- **`_pendingRemoteVideoStreams` の tracks が stop されないバグを修正**（delete 前に tracks.stop() 追加）
- **`startVideo`・`startAudio` の getDeviceStream.then() 内に status ガードがないバグを修正**（停止・部屋移動後に配信通知が走る問題）
- **`startVideo`・`startAudio` の await 前に status フラグが立たないバグを修正**（部屋移動時の stopVideo/stopAudio が効かない問題）
- **受信ボタン連打中に部屋移動すると旧部屋ユーザーと WebRTC が確立されるバグを修正**（`setOffer` に `_inRoomTransition` ガード追加）
- **配信ボタン（startVideo/startAudio）押下直後に灰色+キャンセル可能状態に変更**（getUserMedia 待ち中に再度押せばキャンセルできる）
- **受信ボタンに「接続中」状態（灰色）を追加**（WebRTC 確立待ち中は連打ブロック、ICE 失敗時に赤に戻す）
- `_makeCamNOnClick(n, ft)` ヘルパー関数で cam2+ 受信ボタンの onclick ロジックを共通化（createVideoButtonN・ICE失敗リセットで共用）

---

### 15. 配信音量ブースト ✅ (2026-06-11 実装完了)
**Audio boost**
- 音声をブースト、ON/OFF可能 / Boost mic audio, toggleable

#### 現状（2026-06-11 実装完了）
- 設定パネルに「ノイズ除去（RNNoise）」「マイク音量ブースト」「低音カット（80Hz以下）」チェックボックスを追加
- getUserMedia に `noiseSuppression: true, echoCancellation: true, autoGainControl: false` を指定（ブラウザ組み込みのノイズ抑制・エコーキャンセル）
- Web Audio チェーン: `source → [RNNoiseWorklet] → HighPass(80Hz) → DynamicsCompressor → GainNode(×3) → AnalyserNode → dest`
- RNNoise（`@jitsi/rnnoise-wasm` v0.2.0 WASM）をAudioWorkletで処理。定常ノイズ・混合ノイズどちらも除去可能。`public/rnnoise/rnnoise-worklet.js` + `public/rnnoise/rnnoise-sync.js`
- HighPassFilter（BiquadFilterNode）：OFF時は `type=allpass` でバイパス、ON時は `type=highpass`（80Hz以下カット）
- DynamicsCompressor（threshold=-24, ratio=8）でピークを圧縮してから増幅するため歪みにくく、声の大小が均一化
- 各チェックボックスは配信中にON/OFF切り替え可能（即時反映）
- AudioWorklet非対応環境（iOS Safari等）はRNNoiseをスキップして動作継続（低音カットはiOSでも動作）
- 各チェックボックスの状態をlocalStorageに保存・復元（キー: `useRNNoise`, `micBoost`, `lowCut`）（2026-06-12 追加）

---

### 16. 配信音量可視化 ✅ (2026-06-11 実装完了)
**Audio level visualization**
- 音声バーに音量に応じた色付きバーを表示 / Color bar extending with volume on audio bar

#### 現状（2026-06-11 実装完了）
- 送信側：音声配信ボタン下にグラデーションバーを表示（#5be→#48f→#c4a）
- 受信側：音量スライダーに内蔵（薄いベースバー＋鮮やかなフィル）
- AnalyserNode（smoothingTimeConstant=0.4）で音量をリアルタイム取得
- 受信側スライダーのつまみ・バーをフルカスタムCSS化

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
- **映像のダブルタップ（タッチ）**で通常↔透過切替（`toggleVideoTransparent()`）
- **映像の位置・サイズ操作**（通常・透過両モード対応）
  - マウス: シングルドラッグで移動
  - タッチ: ダブルタップ後ホールド→ドラッグで移動（シングルタップは1回目カウントのみ）
  - ピンチ: 2本指で拡縮リサイズ（`ptrs` Mapで複数ポインタ追跡）
  - 右下グリップハンドル: タッチ/マウスともシングルドラッグでリサイズ
  - `freeFloat=true` で `videoResize()` の自動レイアウトから除外、透過切替時にリセット
  - `videoHandles[token]` にグリップハンドルdivを保持、`_syncHandle()` で位置同期
- 透過モード入り時: `mediaContainer.style.height=''` `mediaContainer.style.width=''` で inline height/width を消しCSSの `bottom:0` を有効化、全動画の `top/left/width/height` を全画面値にリセット
- `videoResize()` 末尾で `Object.keys(videoArray).forEach(k => _syncHandle(k))` を呼び、透過切替後もハンドル位置を正しく同期
- `videoResize()` 先頭に `if (_videoTransparentActive) return;` ガードを追加。透過モード中に `loadedmetadata` 等で `videoResize()` が呼ばれ `mediaContainer.style.height` が再設定されて全画面が崩れる問題を修正
- `_applyTransparentLayout` でデスクトップも AR（アスペクト比）ベースで動画サイズを計算（修正前は `window.innerHeight / N` で AR 無視、動画フロアのタップ可能範囲が画面全体になりアバター位置がズレていた）
- モバイルでは `localW = 660`（CSS scale 変換後のローカル座標幅）を使用。`windowWidth` が 660〜870 の端末で `window.innerWidth` をそのまま使うと `width²/660` になり横はみ出しが発生していた
- 設定チェックボックス「透過配信をデフォルトにする」＋透過度スライダー（0.05〜0.95）
- localStorage: `videoTransparentDefault`（bool）、`videoTransparentOpacity`（float）

#### 追加実装予定（→ ブロック管理表 `18 (追加)` 参照）
- ダブルクリック（PC）でも透過/通常モード切替（現在はタップのみ）
- PC: 動画上でマウスホイールスクロールすると透過度が変わる

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

### 21. 特定部屋への直接リンク ✅ (2026-05-17 実装完了)
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

---

### 24. 配信画面の足場化（アバター乗り上げ）✅ (2026-06-10 実装完了)

#### 概要
- 配信中の動画画面（`#mediaContainer` 内の `<video>` 要素）を「乗れる足場」として扱う
- アバターが乗ると位置・状態が全ユーザーにリアルタイム同期される
- 動画フロア上での落書きも可能（Ctrl+ドラッグ or wa-i!ボタンON）
- 2人以上配信時は動画を横に並べて複数フロアを作成
- 配信者は設定で乗り上げ・落書きを一括禁止できる（localStorage: `streamSurfaceAllowed`）

#### 座標系とレイヤー構造

```
PIXIステージ y=0〜460  → PIXIキャンバスに描画（z-index:12）
──────────────────── VIDEO_FLOOR_Y=460 ────────────────────
PIXIステージ y=460〜790 → PIXIキャンバス外。videoFloorObjects がここに配置される
動画DOM要素（<video>）  → PIXIキャンバス直下に並ぶ
#avaVideoOverlay canvas → z-index:13、フルスクリーン、pointer-events:none
```

- アバターが y > 460 に入ると、上半身（y<460）は PIXI のマスク付き描画、足元（y>=460）は overlay canvas に描画
- `videoFloorObjects` が存在する間だけ重力キャンセル（配信がなければ落下）
- `#Pmachi { z-index:12 }` で overlay(13) より上にゲームUIを配置（`style.css`）

#### なぜ overlay キャンバスを使うのか

PIXIキャンバスは `660×460` 固定。動画フロアは y>460 にあるため PIXI の描画範囲外。アバターの足元（y>460）を画面に出すには別の描画手段が必要で、そのために全画面の HTML Canvas 2D（`#avaVideoOverlay`）を使っている。PIXI extract（GPU読み戻し）はビューポート外 Graphics に非対応なので落書きも同キャンバスで再描画している。

#### overlay 描画（`_avaOverlayPostTicker`）

**3つのスケール変数**
```js
const posVsx = vRect.width / fW;   // X位置スケール（アバター中心の DOM X 計算専用）
const posVsy = vRect.height / fH;  // Y位置スケール（足元 DOM Y 計算に使用）
const drawS  = vRect.width / 660;  // サイズスケール（アバター表示サイズ、動画増加で縮小）
```

**drawS が動画増加でアバターを縮小する理由**

動画が N 本になると各動画の DOM 幅は約 `vRect.width / N`。`drawS = vRect.width / 660` もそれに比例して小さくなるため、アバターが N 本分の映像面積に対して邪魔にならないサイズに自動調整される。N=1 のときの見た目を基準に、N=2 では半分、N=3 では 1/3 のサイズになる。逆に `posVsx/posVsy`（位置スケール）を drawS の代わりにサイズ計算に使うと、フロア縦横比が変わるたびにアバターが伸縮するため NG。

**描画座標計算**
```js
// floorFrac: ゲームエリアにはみ出してる割合（0=全て動画エリア、1=全てゲームエリア）
const floorFrac = (isFf && _isMyPrimary) ? 0
  : Math.max(0, Math.min(1, (floorY - bounds.y) / bounds.height));

const srcY = floorFrac * imgH;          // floor 以上をクロップ
const dstW = bounds.width * drawS;
const dstH = (1 - floorFrac) * bounds.height * drawS;
const dstX = vRect.left + (ava.container.x - floorX) * posVsx
           + (bounds.x - ava.container.x) * drawS;
const avaDomFeetY = vRect.top + (ava.container.y - floorY) * posVsy;
const dstY = ((isFf && _isMyPrimary) || bounds.y >= floorY)
  ? avaDomFeetY - (ava.container.y - bounds.y) * drawS
  : vRect.top;
```

**clip（_frontHoles の正しい使い方）**
- `_frontHoles`：自フロアより前面にあるフロアの vRect 一覧
- `evenodd` で使うと隣接（非重複）矩形が両方 visible になるバグ（Part E）が発生する
- 正解：vRect との **交差矩形を CCW 方向** で path に追加してから `clip()`（nonzero）

```js
_avaOverlayCtx.rect(vRect.left, vRect.top, vRect.width, vRect.height); // CW（外側）
for (const _h of _frontHoles) {
  const iL = Math.max(vRect.left, _h.left),  iT = Math.max(vRect.top, _h.top);
  const iR = Math.min(vRect.left + vRect.width, _h.left + _h.width);
  const iB = Math.min(vRect.top + vRect.height, _h.top + _h.height);
  if (iR > iL && iB > iT) {          // 交差がある時だけ穴を開ける
    _avaOverlayCtx.moveTo(iL, iT); _avaOverlayCtx.lineTo(iL, iB);
    _avaOverlayCtx.lineTo(iR, iB);   _avaOverlayCtx.lineTo(iR, iT);
    _avaOverlayCtx.closePath();       // CCW → nonzero で穴になる
  }
}
_avaOverlayCtx.clip();
```

**PIXI マスク（ゲームエリア部分）**
```js
// floorFrac > 0 のとき _vfMaskMap の Graphics をゲームエリア矩形に更新
m.clear().beginFill(0xffffff).drawRect(bounds.x, bounds.y, bounds.width, clampH).endFill();
```

**【汎用】スケールと座標系が違うターゲットへのY軸合わせ公式**

「PIXI 座標系のアンカー点（足元）を、別の座標系（CSS 動画 DOM 等）に正確に位置合わせしつつ、スプライトサイズは別スケールで描く」場合の汎用パターン。

```
posVsy  = targetHeight / floorPixiHeight   // 位置スケール（フロアY範囲 → ターゲット高さ）
drawS   = targetWidth  / stageWidth (660)  // サイズスケール（PIXI全幅 → ターゲット幅）

// フロアに一部はみ出ている（floorFrac = ゲームエリア側にはみ出てる割合）
floorFrac = clamp((floorOriginY - bounds.y) / bounds.height, 0, 1)

anchorDomY = targetTop + (anchor_pixi_y - floorOriginY) * posVsy  // 足元のDOM Y
dstY = (bounds.y >= floorOriginY || isFf)
     ? anchorDomY - (anchor_pixi_y - bounds.y) * drawS   // 足元基準でスプライト上端を逆算
     : targetTop                                           // はみ出し時は targetTop からクリップ
srcY = floorFrac * imgH    // はみ出した分だけ src 側もクロップ
dstH = (1 - floorFrac) * bounds.height * drawS
```

**なぜ posVsy と drawS を使い分けるか**:
- `posVsy` はフロアの PIXI 高さに対する倍率 → フロア内のどの位置に足元があるかを正確にターゲット上の Y に写す
- `drawS = vRect.width/660` は PIXI ステージ全幅を基準にした均等スケール → アバターのサイズを「映像が増えた/減った」に比例して変える（フロア縦横比に左右されない）
- 2 つを混ぜることで「足元が映像の正しいY位置に着地しつつ、体の縦幅は映像幅で決まる」を実現

**適用条件**: `posVsy ≠ drawS` になる（= フロアのアスペクト比がステージと異なる）とき。フロアの `_pixiH` が VIDEO_FLOOR_H (330) と異なるケース（動画アスペクト比が 2:1 以外）などで差が生じる。

**freeFloat（動画ドラッグ移動）について**

配信者・受信者ともに動画を画面上の好きな位置にドラッグ移動できる機能。動画 DOM が `position:fixed` で移動するため `vRect` が動的に変わり、overlay の描画位置もそれに追従する。

**freeFloat 時のアバター描画**
- `_isFfFull`（= `isFf && _isMyPrimary && bounds.y >= floorY`）のとき（アバターが完全に動画フロア内かつプライマリフロアが移動中）
  - `floorFrac = 0`（全身を overlay に描画）、`renderable = false`（PIXI 描画を抑制）→ アバターが動画と一緒に動いているように見える
  - `_vfHiddenAvas` に追加 → 次フレーム先頭で `renderable = true` に復元
- `bounds.y < floorY`（体が PIXI エリアにはみ出している）場合は freeFloat でも通常の floorFrac 処理。PIXI が上半身を描画し続け、overlay は下半身だけ新位置に描画する

**`_isMyPrimary` の役割**

複数フロアがある場合にフロアAが移動中でも、フロアBに立っているアバターはAの freeFloat に影響されないようにするための判定。「このフロアが現在描画中のフロアのプライマリフロアか」をチェックし、違う場合は renderable=false にしない。z-order（どのフロアが前面か）は `_videoFloorZOrder` が別途担当。

**z-order 管理**
- `_videoFloorZOrder[]`：配信開始順で追加、タッチ時に最前面に移動（`_bringVideoFloorToFront`）
- `_updateVideoZIndices()`：`_videoFloorZOrder` 順に video/overlay の CSS z-index を設定
- overlay ループも `_videoFloorZOrder` 順（奥→手前）で描画

#### 複数動画フロア（MAP 座標）

| 軸 | 仕様 |
|---|---|
| MAP X | 全動画合計で 660 固定。DOM 幅比率に応じて各フロアに分配（2動画同サイズなら各 330） |
| MAP Y | 全フロア共通。`pixiH = Math.round(660 * N / totalAR)`（16:9 動画1本=371、2本=371） |
| リサイズ | DOM 表示サイズのみ変更。MAP サイズ（_pixiW/_pixiH）は変わらない |

**MAP X が合計 660 固定の理由（現在の制約）**

ゲームエリアの PIXI 幅と一致させることで座標変換を統一できる。またクライアントによって DOM 表示幅は解像度に依存して変わるが、MAP 座標（_pixiW）は不変なので全クライアントで同じアバター位置になる。各フロアの _pixiW は `DOM幅の比率 × 660` で決まる（`videoResize()` 内で計算）。

> **将来対応**: マップによって動画フロアの幅を変えることを想定している。実装時は以下の箇所の `660` を room ごとの幅定数（例 `STAGE_W`）に差し替える：
> - `_recalcFloorPositions()` L13116/13137: `pixiH` と `_pixiW` の計算式
> - `drawS = vRect.width / 660` (L11626, L11692, L11737): アバター・ゴースト描画サイズ
> - `tapPixiY` の `* 660 / vRect.width` (L12102): タップY座標変換
> - 落書き線幅 `clipW / 660` (L11549)

**MAP Y が全フロア共通の理由**

ユーザーが「ウィンドウサイズに合わせて最大化」を使うと全動画が同じ DOM 高さで横並びになる（アスペクト比が同じなら同一高さ）。全フロアが同じ `pixiH` を持つことでフロア間を歩くときに段差なく移動できる。`pixiH = 660 * N / totalAR` は「幅 660px に N 本を並べたときの高さ」で、例えば 16:9 動画 2 本なら totalAR = 2×(16/9) → pixiH = 660×2/(2×16/9) ≈ 371（本数に関わらず同じ高さ）。

- `_recalcFloorPositions()`：`videoStartOrder` でソートして左から配置、自アバターの相対位置を保持
- `videoResize()` 末尾で自動呼び出し（循環させないこと）

#### 落書き

- Ctrl+ドラッグ or wa-i!ボタンON でフロア上に落書き
- `oekakiGraphics`（PIXI.Graphics）：PIXI ステージ上に描画
- `#avaVideoOverlay`（HTML Canvas 2D）：drawHistory を 2D API で再描画（PIXI extract は viewport 外 Graphics に非対応）
- サーバーが `rooms[room].videoSurfaces[token].drawHistory[]` に追記・入室者に送信
- クリア/アンドゥ/リドゥは通常お絵かきと同仕様。`_videoFloorFocused` フラグで対象を切り替え

#### 動作仕様（その他）

- タップ座標変換（`forwardToCanvas`）：透過モード = `cRect` 基準、通常モード = `vRect` 基準
- `_isOnVideoFloor` には `ava.container.parent` チェック必須（退室済みアバターが y>460 のまま残るため）
- `detachVideo` では `v.parentNode.removeChild(v)` でDOM削除必須（残骸が pointer-events を吸収する）
- 入室時：`joineRoom` でフロアをクリア → `callMediaStatus` で再確立。`ridingData` で乗車状態を復元
- フロア消滅時：乗っていたアバターを y=400 にスナップしてゲームエリアへ戻す

#### やってはいけないこと

| アプローチ | 結果 | 理由 |
|---|---|---|
| `_recalcFloorPositions()` 内で `videoResize()` を呼ぶ | 循環呼び出し | `videoResize()` の末尾で `_recalcFloorPositions()` を呼んでいるため |
| 透過モードで `vRect` 基準の座標系を使う | タップ・描画位置がズレる | 透過モードは `cRect` 基準が正しい |
| 配信順の同期に受信順を使う | クライアントによって動画が逆順になる | `videoSurface` 到着順は不定。`startTime` でソートが必要 |
| アバターサイズに `posVsx/posVsy` を使う | 横または縦に伸びる | サイズは `drawS = vRect.width/660`。posVsx/posVsy は位置計算専用 |
| `_frontHoles` を `evenodd` で clip する | 隣接フロアにゴースト（Part E）が出る | evenodd は非重複矩形を両方 visible にする。CCW 交差穴 + nonzero が正解 |
| `#avaVideoOverlay` の z-index を 12 以下にする | ゲームUIが動画の下に隠れる | overlay は 13、PIXI は 12 の固定構造 |
| `_videoAutoReset` で `freeFloat=false` にするとき `style.top` を触らない | 動画増減後も Y 位置がずれたまま | `style.left` は `videoResize()` が上書きするが `style.top` は触らないので、`freeFloat=false` 時に `style.top='0'` も合わせてリセットする |
| freeFloat 中に `bounds.y < floorY`（体が PIXI エリアにはみ出し）のアバターで `_isFfFull=true` にする | アバター上半身が消える | PIXI 側が `renderable=false` になり overlay の clip（vRect）にも上半身が入らない。`_isFfFull` は `bounds.y >= floorY` のときだけ true にする |

---

### 25. アバター同士乗車の全クライアント同期バグ修正 ✅ (2026-05-31 修正完了)

**概要**: AがBに乗っている状態を第三者Cの画面でも正しく反映する。

#### 実装済みの仕組み

**同期の権威情報**
- `transformOtherAvatarData`（`transformData` socket受信）が乗車状態の唯一の権威。`ridingData` がセットされていれば乗車、null なら非乗車。

**`_pendingTapMap` アーキテクチャ**
- AがBから降車してマップをタップすると、Cは以下の順で受け取る：
  1. `tapMap(riding: false, AX: 目的地)` → 降車中フラグ → `_pendingTapMap` に保存（まだ実行しない）
  2. `transformOtherAvatarData(ridingData: null)` → 降車確定 → `_pendingTapMap` を取り出して `tappedMove(目的地)` を実行
- `_pendingTapMap` が実行された場合は位置補正ブロックをスキップ（Bが移動中に降車すると `data.AX` と実際位置がズレてgsap競合が起きるため）

**tapMap の `riding` フラグ**
- マップタップ降車: 常に `riding: false`（`calculateTargetAndEmit`でハードコード）
- キーボード移動中: `riding: !!ava.ridingObject` で送信（乗車中は true を維持）
- サーバーは `riding: false` の絶対座標tapMap を受け取った時のみ `ridingObject` をクリア

**Cの tapMap ハンドラ（3分岐）**
```
ridingObjectがセットされている場合:
  data.riding = true  → ridingOffset のみ更新（乗車中の移動）
  data.riding = false → _pendingTapMap に保存（降車待ち）
ridingObjectがない場合:
  → tappedMove を直接実行
```

**`stopRiding` の降車通知**
- myToken の `stopRiding` では `sendTransformData("降車")` を明示的に emit（重力なし部屋でも確実に通知）

**重力部屋でのアバター乗車**
- hitArea判定（`isStandingOnObject`）はアバター乗車中はスキップ（頭ぎわで誤降車する問題を回避）
- `if (!this.ridingObject.token)` の条件で判断

**zIndex 同期**
- post-tick（priority: -10）で全乗車アバターの zIndex を `ridingObject.zIndex - 1` に毎フレーム上書き

#### 関連コード箇所（index.js）
| 処理 | 場所 |
|---|---|
| `stopRiding` + 降車通知 | `Avatar.stopRiding()` |
| `_pendingTapMap` 保存 | `socket.on("tapMap")` absoluteブランチ |
| `_pendingTapMap` 実行 + 位置補正スキップ | `socket.on("transformOtherAvatarData")` 非乗車ブランチ |
| マップタップ `riding: false` | `calculateTargetAndEmit` |
| キーボード `riding: !!ridingObject` | `stopKeyMove` / `keyMoveTickerFn` |
| 重力中アバター乗車のhitAreaスキップ | `Avatar.updatePhysics` |
| zIndex post-tick | `app.ticker.add(…, null, -10)` |

#### 関連コード箇所（bin/www）
- `tapMap` ハンドラ: `riding: false` の時のみ `user[token].ridingObject = null`、常に `riding` フラグをブロードキャスト

---

---

### 26. パフォーマンス改善：ticker管理 ✅ (2026-05-31 修正完了)

**症状**: ログインや入退室が重い、アバター出現が遅い（このスレッド以前から発生）

**原因: avaLoopのticker蓄積**
- `Avatar` コンストラクタが `app.ticker.add(this._tickerFn)` でavaLoopをtickerに登録するが、アバターが退室・ログアウトしても ticker から外していなかった
- セッション中に入退室を繰り返すユーザーが増えるほど、ゴーストticker（もう部屋にいないアバターのavaLoop）が60fps×n個蓄積し続ける
- 部屋移動のたびに `joineRoom` で全ユーザーを処理するため、ゴーストが多いほど処理が重くなる

**修正内容**
1. `Avatar._tickerActive` フラグで管理（コンストラクタで `true` 初期化）
2. `otherLeft`・`logout` イベント: `app.ticker.remove(avaP[token]._tickerFn)` + `_tickerActive = false`
3. 再接続時: myToken以外の全avaP ticker をstop → delete
4. `joineRoom` 受信時: 新部屋にいないアバターのtickerを一掃、新部屋ユーザーのtickerを再起動（`_tickerActive` で2重add防止）
5. `otherJoined` 時: stopされていれば再起動

**グローバルticker最適化**
- 乗車同期ticker（priority: -10）と動画フロアticker（priority: -0.5）の2本が全avaPを毎フレームイテレートしていた
- `ava.container.parent?.parent === null`（stageに繋がっていない）のアバターはスキップするガードを追加

---

### 27. 文字の部屋 (未完成・動作不安定)

**新システム部屋: 黒背景・テキスト落下・粉砕パーティクル**

#### 部屋仕様
- 背景黒、Y=345 に地面（重力あり）
- Y=345より下はクリック移動不可（`konaNoHeyaBlock`）
- 接続: うちゅー → 文字の部屋（右端入口）→ 星1（左端出口）
  - うちゅーの旧 star1EntrySpot ワープを `文字の部屋EntrySpot` に変更
  - 文字の部屋左端 (x:0-60, y:340-480) → star1EntrySpot（タップ移動用）
  - 文字の部屋右端 (x:600-660, y:340-480) → outerSpaceMainSpot（タップ移動用）
  - **キーボード移動でAX < 0** → star1EntrySpot（`keyMoveTickerFn` 内で判定）
  - **キーボード移動でAX > 660** → outerSpaceMainSpot（同上）

#### テキスト落下（`konaDropText`）
- `socket.on("emit_msg")` 受信時、文字の部屋にいれば発動
- 文字数で4段階フォントサイズ（58/40/26/18px）
- 漢字密度が高いほど落下速度が速い（80〜220px/s）
- ランダムフォント（titleFontFamily 配列から選択）
- ランダムグループ化（1文字ずつ/2-4文字グループ/全体1塊）

#### 文字→粉の崩壊
- 着地後2.5秒で崩壊開始、3.5秒かけてα値が0に近づく
- 崩壊中は少量の粉を逐次放出
- 完全崩壊時に `_konaSpawnParticlesFromBlock` でパーティクル化

#### 粉パーティクル（`_konaParticles`）
- 上限 500 個（超過時は最古の settled 粒子を削除）
- 文字の先頭文字のハッシュからパステルカラーを決定（`_konaCharColor`）
- 重力 + 減衰でバウンス後に settling
- 削除条件: `x < -10 || x > 670 || y > 490`（左・右・下のみ）
- **上方向（y < 0）には削除条件なし** → 上に飛び出したパーティクルは永遠に残る（未修正）
- テキストブロック（`_konaTextBlocks`）は画面外削除条件が一切なし → 地面到達まで残り続ける（未修正）

#### アバターとの干渉（`_konaAvatarKickParticles`）
- 毎tick、アバターの移動速度を検出
- 半径 (45 + speed×4) 以内の settled 粒子を速度に応じて舞い上がらせる
- 速度が速いほど影響範囲・強度が増大

#### ライフサイクル
- `_konaStartTicker` / `_konaStopTicker`: app.ticker への登録・解除
- `_konaLeaveCleanup`: 退室時に全粒子・テキストブロックを destroy + removeChildren
- 2回目以降の入室はキャッシュ済み Room を再利用
- **状態サーバーキャッシュ** (`konaPersistedStates`): `konaSyncFull` 受信のたびにサーバーが `konaPersistedStates[roomName]` に保存（常時有効、フラグなし）。新規入室者が `konaRequestSync` を emit すると、キャッシュがあればサーバーが直接 `konaSyncData` を返送（クライアントホスト不要）。キャッシュなし時のみ既存クライアントにリレー。`KONA_STATE_PERSIST` フラグは廃止。

#### 文字の部屋との統合
- 旧「文字の部屋」（mozinoheya）は未実装のまま。文字落下機能を文字の部屋として実装し統合。

---

### 28. アバター乗車物理・ジッターバグ修正 ✅ (2026-06-01 修正完了)

#### 修正したバグ一覧

| バグ | 原因 | 修正箇所 |
|---|---|---|
| AがBに乗って移動すると他クライアントからガタガタする | `tapMap`（100ms周期）と`sendTransformData("落下中")`（50ms周期）が両方位置を送信し競合 | `updatePhysics`の落下ブランチで`keyMoveTickerFn`がnullの時のみ送信するよう抑制 |
| AがBの上で追従しない | `updatePhysics`の`!standingOn.token`ガードが`startRiding`をブロックしていた | ガードを削除してhitArea頭頂部判定に置き換え |
| 入室時に重なってるアバターに勝手に乗車 | `!standingOn.token`ガード削除により着地判定が緩すぎた | hitAreaの`points`minYで頭頂部ワールドY座標を計算、`A.y <= headWorldY + 12`の時のみ`startRiding` |
| アバター乗車後に空中歩行できる | hitABによる降車判定がキー移動のたびに誤発火 | 降車判定を`ridingOffset.y > 5 \|\| ridingOffset.y < minLocalY - 15`の範囲チェックに変更 |
| Bが退室するとAが空中に浮いたまま停止 | Bのavatarオブジェクト削除後もAの`ridingObject`が古い参照を保持 | `otherLeft`・`logout`ハンドラでそのアバターに乗車中の全アバターを`stopRiding()` |
| 他クライアント視点で落下→地面前にジャンプして見える | `gsap.killTweensOf` + duration:0.05s でアニメ途中kill→次の50ms更新で位置ズレ蓄積 | `overwrite:"auto"` + `duration:0.04`に変更（40ms完了→次の50ms更新前に着地） |
| 斜め移動後キーを離すとフレームが合わない | `stopKeyMove`が`DIR`グローバルと`keyWalkFrame`を参照（100msタイマー未発火時に旧値を送信） | `ava.currentAvaStateKey`（実際の表示スプライトキー）から方向とフレームを読む |

#### 重要な設計ポイント

**`keyMoveTickerFn` アクティブ中は `sendTransformData("落下中")` を抑制**
- キー移動中は`tapMap`が100ms毎に絶対座標を送信する
- 同時に`sendTransformData`が50ms毎に落下座標を送ると観測者の`gsap`が競合してジッター
- `updatePhysics`の落下ブランチ冒頭で`if (!keyMoveTickerFn)`でガード

**アバターへの`startRiding`条件: hitArea minY で頭頂部チェック**
- `bSpr.hitArea.points`（flat配列`[x0,y0,x1,y1,...]`）からY成分の最小値を取得
- `headWorldY = bC.y + minLocalY * scaleY`
- `A.container.y <= headWorldY + 12` の時のみ乗車（+12は許容マージン）
- ポリゴンがない場合のフォールバック: `bC.y - 50`

**アバター乗車の降車判定: `ridingOffset.y` 範囲チェック**
- `ridingOffset.y > 5`: Aが乗車面より下にずれた（めり込み防止）
- `ridingOffset.y < minLocalY - 15`: AがBの頭頂部より大幅に上（ジャンプ等）
- hitABによる判定はキー移動時に不安定なため使用しない

**`stopKeyMove`でのフレーム同期**
- `keyWalkFrame`は`keyWalkFrameTimer`が発火するたびに更新（約100ms周期）
- `DIR`グローバルはtickerで毎tick更新される
- キーを離した瞬間は両者が不一致になりうる
- `currentAvaStateKey`（例: "NE1", "SE2"）から`/[012]$/`でフレームを、残り文字で方向を抽出

---

### 29. 粉の部屋 (未完成・動作不安定)

**文字の部屋のインフラを共有した別部屋。テキストが着地即座に砕け散る。**

#### 部屋仕様
- 背景: 濃い紫黒（0x0a0008）、床・物理は文字の部屋と同じ（Y=345、重力あり）
- `hardness = 0` に固定 → 着地1フレーム目で即 `kickCount >= hardness` を満たし即砕け
- チャットテキストの落下・崩壊・パーティクル化は文字の部屋と共通コード（`konaDropText` / `_konaTick`）
- 接続: 星1右下 (x:580-660, y:400-480) → 粉の部屋EntrySpot（AX=580, AY=300, DIR="E"、右側に出現）
  - 粉の部屋左端 (x:0-60, y:340-480) → star1EntrySpot

#### 実装上のメモ
- 文字の部屋コードとの共通化: `_isKonaRoom()` ヘルパー、`KONA_ROOMS` Set（bin/www）で全ガード条件を共通化
- `konoPowderRoom` グローバル変数（PIXI.Graphics）を追加
- DB: `rooms` テーブルに `('粉の部屋', '粉の部屋')` を INSERT OR IGNORE で登録済み

#### 追加機能（同セッションで実装）
- **落書き衝突判定** (`_konaGetOekakiSegments` / `_konaOekakiSegCollide`): 部屋の落書き（`room.drawHistory`）をセグメント列として抽出し、パーティクルが落書き線に当たると反発するようにした。毎tick precompute（`oekakiSegs`）、非settled粒子のみ判定。
- **ホスト管理**: `konaHostClaim` / `konaHostRelease` で物理シミュレーションの担当クライアントを決定。バックグラウンド移行時は `konaHostRelease` を emit して手放す。アバターを動かすと自分が非ホストかつ最後のホスト変更から2秒以上経過していれば自動で `konaHostClaim`（`sendTransformData` 内）。状態同期はサーバーキャッシュが主、クライアントホストはリアルタイム物理の担当のみ。

---

### 30. 404ページ やせアボン設置 ✅ (2026-06-04 実装完了)
**404 page: skinny Abon + index link**
- 「そんにゃぺーじないよ」404ページにやせアボン画像を設置
- 誘導URLとして、サイトURL変更に対応した相対URL（インデックスページへ）を画像の下に掲載

#### 現状
2026-06-04 実装完了  
`views/404.ejs` に `/img/objects/abonyase.png` と相対リンク `/` を追加。

---

### 31. 画面チャット・ログ状態の前回状態引き継ぎ
**Persist overlay chat / main log state across sessions**
- 前回終了時の画面チャット表示/非表示、下ログ表示/非表示を localStorage に保存し次回起動時に引き継ぐ
- 新しい localStorage キーが必要（`showOverlayChat`、`showMainLog` 等、実装時に確認）

---

### 32. ウィンドウ変更時の画面チャット自動表示バグ修正 ✅ (2026-06-04 実装完了)
**Fix: chat overlay auto-shows on window resize**
- ウィンドウリサイズ時に画面チャットが勝手に出現する仕様を削除
- 対象: `index.js` の resize イベントハンドラ付近
`windowResize(isInitial)` に引数を追加。初回ロード時（`isInitial=true`）はモバイルで画面チャットを自動ON。リサイズ時は `useOverlayChat` の値を反映して表示/非表示を復元（870超えで非表示→870以下に戻した時にボタンONなら再表示）。

---

### 33. スマホ配信時の動画上アバター細問題修正
**Fix: avatar appears thin on video overlay on mobile**
- スマホで配信中、`#avaVideoOverlay` 上のアバターが縦に細く表示されるバグを修正
- オーバーレイ描画のスケール・座標変換処理を確認

---

### 34. むげん部屋キーボード移動ループ ✅ (2026-06-11 最終更新)
**Mugen room: keyboard movement wraps around screen edges**
- キー移動でアバターが画面外に出ると、逆方向から出現（左端→右端から、等）
- 出現時はトリミングして画面外からスライドインするように
- 動画配信フロアがある時は、フロアの下（Y=790相当）まで行ったら上から出現
- むげん部屋固有の仕様（他部屋の画面外バグ修正 #46 とは別処理）
- 対象: `index.js` `keyMoveTickerFn` のむげん部屋分岐

#### 現状
2026-06-04 実装完了。`keyMoveTickerFn` のむげん分岐でAX/AYをモジュロ折り返し（`AX += 660` 等）。加えて画面端に近づくとゴーストアバター（最大3体）が反対側に出現するシステムを実装（`_mugenGhostMap` / `_updateMugenGhosts` / `_destroyMugenGhosts`）。ゴーストはアバタースプライト・落書き・ネームタグ・名前テキストを全て反映。zIndexも本体に追従。他クライアントのアバターにも適用。

**合わせて修正：** キーボード移動中に他クライアントで向き・フレームが化けるバグを修正。`tapMap`（`keyMove:true`）受信時に `ava._animeRev` をインクリメントして旧 `anime()` の遅延コールバックをキャンセル。

#### 受信側キーボード移動のかくつき修正（2026-06-11）

**問題**: 観察者側で他クライアントのアバターがキーボード移動するとき、特にワープ（画面端）時と方向転換時にかくつく。

**原因**:
- GSAP は PIXI rAF の後に自身の rAF でコンテナを更新するため、tapMap 受信フレームで PIXI が描画した後に GSAP が動き出す → 1フレーム停止が見える
- `tapMap`（keyMove:true）は 100ms ごとに送信され、受信のたびに GSAP アニメが新規スタートされる → 100ms ごとのかくつき

**解決策: Dead Reckoning（予測移動）**

`index.js` に priority -0.3 の DR ティッカーを追加（PIXI 描画前・GSAP の前に実行）。

受信側の処理フロー:
1. **tapMap (keyMove:true) 受信**: むげん部屋はワープ（距離>330px）時のみテレポート。それ以外は `tx/ty` (目標位置) と速度を `_mugenDR` に格納するだけ（スナップしない）
2. **DR ティッカー（毎フレーム）**: `container.x += vx * delta` で等速予測移動。加えて `(tx - container.x) * 0.15 * delta` の緩やかな吸着補正（方向転換時のドリフト解消・キー離し後の自然減速）。120ms 間 tapMap がなければ DR 停止
3. **tapMap (keyMove:false) / tappedMove**: `_mugenDR = null` でクリア → 通常の GSAP に戻る
4. **transformOtherAvatarData**: DR 中は dist>5 の GSAP 補正をスキップ（DR と GSAP の競合を防ぐ）

**実装箇所** (`index.js`):
- DR ティッカー: `app.ticker.add(...)` priority -0.3（L1240〜付近）
- tapMap 受信: `data.keyMove && KEY_WALK_DIR_FRAMES[data.DIR]` ブランチ内
- transformOtherAvatarData: `dist > 5` / `isFalling` 補正に `&& !avatar._mugenDR` 条件追加
- ワープ送信側: `_didWrap` 時に `socket.emit("tapMap", ...)` して `keySocketTimer = 0` リセット（L7881〜）

**既知の挙動**: キー離し後、DR が最大 ~7px オーバーシュートして自然停止する。その後 `transformOtherAvatarData` が GSAP で最終位置に補正（0.2s）。

---

### 35. 設定パネル配置変更
**Settings panel rearrangement**
- 「他の人からのアバター落書きを受け付ける」「ラクガキをアニメーションごとに切り替える」を「配信画面への乗上げとラクガキ」の直下に移動
- 「読み上げ」の行を設定パネルから外してSE音量調整の上に配置

---

### 36. 編集用UIをF12コンソール開いてる時だけ表示 ✅ (2026-06-11 実装完了)
**Show debug UI only when DevTools are open**
- 「― 編集用 ―」セクションのUI（座標表示・床Poly等）を DevTools を開いている時だけ表示
- DevTools 開閉の検出: `window.outerHeight - window.innerHeight > 200` 等
- 座標表示ラベル改善: `mouX mouY avaX avaY` → `MouseX MouseY AvatarX AvatarY` に変更

#### 現状（2026-06-11 実装完了）
- `views/index.ejs`: 編集UIセクションを `<div id="devEditSection" style="display:none">` で包んだ
- `index.js`: F12キー押下でトグル表示（`outerHeight - innerHeight` 方式は環境依存で誤検知したため不採用）
- 座標テキスト: `AvatarX/AvatarY`（青）、`MouseX/MouseY`（赤）に変更済み

---

### 37. ロゴ名称変更（NecojectMachi → Necomachi）
**Logo text rename**
- 実装前に「NecojectMachi」の全使用箇所をプロジェクト内で検索してリストアップ
- テキストベースファイル（HTML/JS/CSS/EJS）は変更可能
- 画像ファイル（PNG等）は変更不可のためユーザーによる素材作り直しが必要

---

### 38. usersボタン → 部屋人数ボタン改修 ✅ (2026-06-11 実装完了)
**"users" → "部屋人数:" button overhaul**
- ボタン名を「部屋人数:N」に変更（横に現在人数表示）
- users 押した時に一番左に部屋名を表示
- 配信受信者がわかるように表示（ユーザー名に📶マーク）
- ユーザー名を押して赤字にした時のアボン挙動修正（「アボンをやめました」が出る問題）

#### 現状
- ボタン名は `部屋人数:<span id="usersNumber">N</span>` 形式
- `socket.on("list")` 描画時にログの先頭に `room.name` を表示（黒文字・青み帯・padding付き）
- 名前が14文字以内は1行、15文字以上はJS側で `Math.ceil(len/2)` 文字ずつ `\n` で分割して2行表示（`white-space:pre-line`）
- `peerConnections[token]` が存在するユーザーのボタンに📶を付与
- アボン修正: listボタンのpointerdownでローカルの `abon` を先に切り替えず、現在の状態（`abon`）をそのまま `setAbon` としてサーバーに送る。`abonSetting` 受信ハンドラでローカル状態更新とボタン色更新（`CSS.escape` + `querySelectorAll`）を一括処理

---

### 39. 部屋入退室通知に部屋名を表示 ✅ (2026-06-04 実装完了（未確認）)
**Show room name in join/leave notifications instead of ID**
- 現在 ID で表示されている入退室通知を部屋名で表示
- 対象: `bin/www` の入退室ブロードキャスト処理

#### 現状
`bin/www` に `displayName(roomId)` ヘルパー関数を追加。ユーザー投稿部屋の `rooms` オブジェクト初期化時に DB から `name` を取得・保存し、4箇所の announce 文字列（「に入室」「に再入室」「に移動」「から移動」）を `displayName()` 経由に変更。システム部屋は ID = 名前なので挙動変わらず。

---

### 40. 電車ボタン改修 ✅ (2026-06-11 実装完了)
**Train button improvements**
- 横枠に入りきらない場合に行を折り返す（flex-wrap 等）
- ボタン内のユーザー数等の数値が変更されたらリアルタイムで更新

#### 現状
- `li.style.flexWrap = 'wrap'` で折り返し対応
- `buildTrainData()` ヘルパー（bin/www）でシステム部屋＋ユーザー部屋の一覧を構築
- `scheduleTrainUpdate()`（500ms デバウンス）が `joineRoom` / `stream`（配信開始停止）/ `disconnect` の3箇所で発火し、全クライアントに `trainUpdate` イベントを送信
- クライアントは `_trainBtns`（roomId → button要素）で最新 train list のボタン参照を保持し、`trainUpdate` 受信時にテキストを更新

---

### 41. 東西南北部屋の大幅改修
**Compass rooms: major redesign**
- 部屋の真ん中に大きな文字を表示（東の部屋なら「東」、白文字）
- 背景黒
- GATEを部屋の斜め4隅に配置（現在は上下左右中央）
- 背景画像のみ変更可（パスなし・誰でも変更可）、背景画像は中央文字の上に乗る、背景消すと文字が見える
- アバターサイズをむげん部屋と合わせる
- むげんへの戻りワープ位置を方向に合わせて変更:
  - 東の部屋: 左の真ん中 → むげんへ
  - 南の部屋: 上の真ん中 → むげんへ
  - 西の部屋: 右の真ん中 → むげんへ
  - 北の部屋: 下の真ん中 → むげんへ

---

### 42. 部屋作成UIの大規模改修
**Room creation/editing UI overhaul**

**実装前に必ず PLANモードで計画立て。**

**新規作成フロー変更**
- 空きワープゲートをクリック → 「新しい部屋を作りますか？」ポップアップのみ表示 → OK を押したら部屋に移動して編集パネルを開く
- 新規作成時の編集パネルタイトル: 「新しく部屋を作る：[部屋名入力欄]」（背景白・オレンジ文字）
- 既存部屋を右クリックメニューから編集する場合、パスワードが設定されていればパスワード要求ポップアップを出す

**UIクリーンアップ**
- 部屋ID を非表示
- パスワード欄の左に「パスワード」ラベル追加
- パスワード表示/非表示を目アイコン（共通アイコン）でパスワード欄内に入れ込む
- 読込ボタン削除
- 全体スケール保存ボタン削除（完了/保存ボタン押時に一括保存）

**タブ構成変更**（現行: ワープ・画像・コード・スケール → 変更後: 画像とワープゲート・コード・オプション）

**「画像とワープゲート」タブ**
- 背景 / 足場 / オブジェクト / ワープゲート の4セクション（各セクションに非表示ボタン）
- 画像追加手段: ファイルから / サンプル（GATE を含む）/ 落書き
- 背景: 単一色選択可（デフォルト白）+ カラーパネルで変更
- 足場: 重力あり、透過PNG の透明部分は立てない
- オブジェクト: クリック移動不可・キー移動で引っかかる（bonfire と同等）、透過部分は当たり判定なし
- ワープゲート「追加」ボタン押下で自動的に左上に配置（既存と重なる場合は右→下に避ける）、サイズは既存GATEと同じかまたは前回配置サイズを踏襲
- ワープゲート形状: □（矩形）/ ○（円・楕円統合）のワンクリック切替アイコン
- ワープゲートの色変更可、デフォルト色を赤みが強い色に変更
- リターンゲートは青みが強い色
- 表示/非表示切替（点滅なし）
- ワープゲート名（`#153` 等）は大きさの後ろに配置
- 「戻る」→「リターンゲート」に名称変更
- ✖ボタンで削除（一番後ろに配置）

**「オプション」タブ**
- 一番上: 「アバターの大きさ」（スケール）
- 「大きさ変更エリア追加」（旧: エリア追加）
- 動画配信・音声配信の許可チェックボックス（デフォルト ON）
- 入室時パスワード要求オプション（東/南/西/北それぞれのワープ先が少ない時は使用不可・斜線+「ワープゲートが少なすぎる為使用不可」表示）
- この機能使用時はリターンゲートのみになる旨の注意書き
- 「この部屋を削除」一番下

**部屋の有効期限**（方角部屋から繋がる場合）
- 東から繋がる部屋: 1日（既存仕様と同じ）
- 南から繋がる部屋: 1週間
- 西から繋がる部屋: 1ヶ月
- 北から繋がる部屋: 消えない

---

### 43. UIボタンデザインテストページ
**UI button design test page**
- テスト用ページを新規作成、ボタンデザイン候補（白抜き文字、ネオン常時点灯等）を並べて表示
- ユーザーが確認して選定後、本実装へ

---

### 44. リンク集・更新履歴改修
**Links page & changelog update**
- リンク集に街っぽいリンクを追加（内容は後で決定）
- 更新履歴ページに spec.md を見れる URL を掲載

---

### 45. カンパ用URLページ
**Donation page**
- https://ko-fi.com/nmachi と Amazon ギフト券ページへのリンクを掲載したページを新規作成

---

### 46. キーボード移動で画面外に行けるバグ修正 ✅ (2026-06-04 実装完了)
**Fix: keyboard movement lets avatar go off-screen**
- キーボード矢印キーでアバターが x<0, x>660, y<0 等の画面外に移動できてしまうバグを修正
- むげん部屋はループ仕様（#34）のため除外、その他全部屋でクランプ
- 対象: `index.js` `keyMoveTickerFn`

**現状**
- `keyMoveTickerFn` 内、文字の部屋ワープ判定の直後に `room.name !== "むげん"` ガードでクランプ追加（AX: [0,660]、AY: [0,460]）。2026-06-04 実装完了

---

### 47. パフォーマンス改善（別枠）
**Performance audit & optimization**
- サイトを重くしている要素を徹底的に洗い出し、改善
- 単独スレッドで集中して実施（他の機能と同時進行しない）

---

### 48. セキュリティ改善（別枠）
**Security audit & hardening**
- セキュリティ上の問題を徹底的に洗い出し、修正
- 単独スレッドで集中して実施（他の機能と同時進行しない）

---

※ 以下は未確定仕様シリーズ。新スレッドで質問しないこと。
※ 未確定仕様を実装した場合は確定仕様（25番以降）に追加し、未確定シリーズからは削除する。
※ Items below are not finalized. Do not ask about them in new threads.

### 未確定1. 宇宙の反響 / Space reverb effect
### 未確定2. 掲示板 / Bulletin board in the town
### 未確定4. マンション / 999-floor apartment (up to 3 rooms each)
### 未確定5. 自動生成迷路 / Auto-generated maze room
### 未確定6. ライブカメラ部屋 / Room where stream feed is the room itself
### 未確定7. ピアノ部屋 / Piano room (avatars step on keys to play notes)
### 未確定8. ~~文字の部屋~~ → 27番として実装完了
### 未確定9. もち / "もち" keyword in chat triggers mochi to fall
### 未確定10. 破片の部屋 / Shard room
- 粉の部屋とは別物として検討中（粉の部屋は独立した仕様）
- 詳細未定
