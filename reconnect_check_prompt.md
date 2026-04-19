# 再接続チェック用プロンプト

## 背景
猫街（e:\マイドライブ\Pmachi6）には自動再接続機能が実装済み。
切断→再接続時にチャット欄に青字でステータスを表示し、
位置・アバター・部屋状態を自動復元する。

## 再接続の仕組み（実装済み）

**フロー：**
1. `disconnect` → `wasLoggedIn` が true なら `isReconnecting = true`、状態を `reconnectSavedState` に保存、「再接続中…」表示
2. `connect` → `getMyUser` を再送信
3. `userInit` → ログインUIをスキップし、保存状態で `joineRoom` を送信（`isReconnect: true` フラグ付き）
4. サーバーが `roomNameList` に部屋名がなければ `reconnectFailed` を返す
5. `joineRoom` 成功時 → 他ユーザーのアバターを全削除し `data.user` で再構築、`removeAllSigns()` してから `data.signs` で再構築、「再接続に成功しました！」表示
6. `reconnectFailed` 時 → 「いた部屋がなくなったか…」表示

**移動の整合：**
- 再接続中は `isReconnecting` ガードにより tapMap / transformData の socket.emit をブロック（ローカル移動は許可）
- `userInit` の reconnect joineRoom emit では `avaP[myToken].container.x/y`（最新座標）を使用

---

## チェックしてほしいこと

新機能追加後に以下を確認・修正してほしい。

### 1. 再接続成功時に再構築が必要なもの

再接続の `joineRoom` ハンドラ先頭の reconnect ブロック（`if (isReconnecting) { ... }` の中）と、
その後の通常 `joineRoom` フローで、新たに追加された「入室時に復元すべき状態」が漏れていないか確認する。

**現時点で対応済みのもの：**
- 他ユーザーのアバター（削除→`data.user`で再生成）
- 部屋の落書き（`oekakiGraphics.clear()` → `data.drawHistory` 再描画）
- 他ユーザーのアバター落書き（`displayAvatar` の `newAvatarDrawHistory`）
- ログ残し発言（`displayAvatar` の `carryOver`）
- 立て看板（`removeAllSigns()` → `data.signs` 再生成）
- 他ユーザーの入退室状態（`data.user` から再生成）

**追加機能が増えたら：**
新機能が「部屋に入った時にサーバーから送られてくるデータ」を使って表示するものなら、
通常の `joineRoom` フローで自動的に反映されることが多い。
ただし、**クライアント側にキャッシュ・表示オブジェクトが残り続けるもの**（看板のように）は
reconnect ブロック内で明示的に削除する必要がある。

### 2. 再接続中にブロックすべき socket.emit

再接続中（`isReconnecting === true`）に新たに追加された socket.emit が、
ブロックなしで呼ばれる経路がないか確認する。

**確認観点：**
- ユーザー操作（クリック・キー・ドラッグ等）で発火する emit に `if (isReconnecting) return;` があるか
- ticker（毎フレーム）や setTimeout で発火する emit に同ガードがあるか
- WebRTC関連の emit（`webRtcSignal`, `mediaButton`, `stream` 等）は `stopAllConnection()` で切断済みなので基本不要だが、手動でボタンが押せる状態になっていないか確認

### 3. `reconnectSavedState` に保存すべき項目

`disconnect` ハンドラ内の `reconnectSavedState` 保存と、
`userInit` reconnect ハンドラ内の `joineRoom` emit に、
新機能で追加されたユーザー状態（サーバーに再送信が必要なもの）が含まれているか確認する。

**現時点で保存済みのもの：**
- `userName`, `avatarAspect`, `avatarColor`, `avatarAlpha`
- `drawHistory`（アバター落書き）
- `room`（部屋名）
- `AX`, `AY`（座標、userInit emit 時は `avaP[myToken].container.x/y` の最新値を使用）

**確認観点：**
- 新機能で「ログイン時にサーバーに送る情報」が増えた場合、`reconnectSavedState` に追加し `joineRoom` emit にも含める

### 4. `reconnectFailed` を返すべきケース

サーバー側 `joineRoom` ハンドラの reconnect バリデーション部分（`if (data.isReconnect) { ... }`）に、
新たに「そのまま再接続すべきでない状況」が追加されていないか確認する。

**現時点のバリデーション：**
- 部屋名が `roomNameList` に存在しない（部屋削除・リネーム）

**確認観点：**
- 新機能で「部屋に入れない条件」が増えた場合（人数制限・パスワード等）、
  reconnect 時も同条件で弾いて `reconnectFailed` を返すべきか検討する

---

## 確認の進め方

1. 仕様書（`e:\マイドライブ\Pmachi6\spec.md`）で前回以降に追加・変更された機能を把握する
2. `public/javascripts/index.js` と `bin/www` を読み、上記4点を照合する
3. 問題があれば修正する。問題なければ「問題なし」と報告する
