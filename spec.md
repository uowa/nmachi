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
1. **Phase 1**: データベース基盤
   - [ ] SQLite初期化（db/init.js）
   - [ ] 既存部屋の初期データ投入
   - [ ] DB接続モジュール

2. **Phase 2**: 基本的な部屋作成・保存
   - [ ] 部屋作成API（POST /api/rooms/create）
   - [ ] 認証ミドルウェア
   - [ ] 部屋情報API（GET/PUT）

3. **Phase 3**: ワープゾーン機能
   - [ ] ワープゾーン配置UI
   - [ ] 接続API
   - [ ] 既存ワープとの統合

4. **Phase 4**: 画像アップロード
   - [ ] アップロードAPI
   - [ ] WebP変換
   - [ ] 配置UI

5. **Phase 5**: Sandboxコード実行
   - [ ] iframe環境構築
   - [ ] PIXI.js注入
   - [ ] 実行時間制限

6. **Phase 6**: 管理機能
   - [ ] 削除制限
   - [ ] 経路探索
   - [ ] 管理画面

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
- チャットログの改行表示: `\n` を `<br>` に変換し `li` の直接の子として挿入
  - 自動折り返し・明示改行ともに2行目以降は `li` 左端から始まる
  - `li.classList.add(thisToken)` で追加（`li.className =` で上書きしないこと）
  - `msgPrefix` span（icon + 名前）は `display: inline; white-space: nowrap`
  - テキストノードと `<br>` は `li` に直接 appendChild（span等のネストなし）

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

### 10. usersで時間表示
**Timestamp in users list**
- usersボタン押下時に時刻も表示 / Show time when users list is opened

---

### 11. 画質切り替え
**Stream quality selector**
- 最高・高・標準・低 の4段階 / 4 levels: max / high / normal / low
- 設定から変更 / Changed via settings

---

### 12. カメラ選択
**Camera selection**
- 配信開始時にカメラを選択 / Select camera when starting stream
- 「毎回選ぶ」か固定かを設定で切り替え（初期値: 毎回）/ Setting: always-ask vs. fixed (default: always-ask)
- 保存済みカメラが存在しない場合は再選択 / Re-ask if saved camera not found

---

### 13. マイク選択
**Mic selection**
- カメラ選択と同仕様 / Same spec as camera selection

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

### 18. 透過配信（スマホ向け）
**Transparent stream overlay (mobile)**
- 配信画面を半透明にして画面に重ねる / Semi-transparent stream overlaid on screen
- スライダーで透明度をリアルタイム変更 / Slider to adjust opacity anytime

---

### 19. 多言語対応
**Multilingual UI**
- 設定で言語切り替え / Language switch in settings

---

### 20. 自動翻訳
**Auto-translate chat**
- チャットを自動翻訳 / Auto-translate chat messages
- 設定でON/OFF / Toggleable

---

### 21. 特定部屋への直接リンク
**Direct room link**
- ログイン後に指定部屋へ直行するリンクを発行 / Shareable link that lands user in specific room after login
- 設定からコピー可能 / Copyable from settings

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
### 29. ライブカメラ部屋 / Room where stream feed is the room itself
### 30. ピアノ部屋 / Piano room (avatars step on keys to play notes)
### 31. 粉の部屋 / Powder room (colorful powder falls as avatars walk)
### 32. もち / "もち" keyword in chat triggers mochi to fall
