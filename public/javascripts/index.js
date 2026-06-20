'use strict';

//大雑把に目次
//変数宣言等
//フォント切り替え※後で消すからこの位置

//webGL(PIXIJS)の設定開始
//画像読み込み
//setUp()・・・画像切り取り、画像設定、座標表示設定、submit設定、gameLoop();
//socket.on("userInit")
//ブロックの配置、タップやアニメの設定、クッキー読み込み、看板機能
//login()・・・名前出力、クッキー書き込み、ログイン画面消去、エントランスの設定、座標関連、フォーム切り替え、
//部屋移動・・changeRoom()
//ログアウト処理
// 
//outputChatMsg()//移動時のメッセージ
// メッセージ関連・・・socket.on("emit_msg"、アボン処理
//再起動用メッセージ
//button関係、お絵描き関係
//右クリックメニュー
//Ｐくｎ
//背景色を変える、画面リサイズの処理
//配信関係

//大体セットアップ系処理→部屋移動関連→メッセージ系→お絵描き関係→右クリックメニュー→配信関係
//配信関係は処理が多いので一番下

//ソケットIOをonにする
const port = 3000;
const socket = io.connect(window.location.origin);

// 自動再接続用の状態管理
let wasLoggedIn = false;
let isReconnecting = false;
let reconnectTimeout = null;
let reconnectSavedState = null;

// #region 変数宣言
const setUpFlag = [];

let uiNewMode = localStorage.getItem('uiMode') !== 'old';
document.body.classList.toggle('ui-new', uiNewMode);
const _uiColorMap = {
  'red':     '#f0a0c0',
  'pink':    '#f0a0c0',
  'skyblue': '#60c8e8',
  '#6C9BD2': '#60c8e8',
  'gray':    '#888888',
};
const _newUiInlineProps = ['color', 'borderColor', 'textShadow', 'filter', 'outline', 'opacity'];
function _setBtnState(btn, color) {
  if (uiNewMode) {
    const c = _uiColorMap[color] || color;
    btn.style.color = c;
    btn.style.borderColor = c;
    btn.style.backgroundColor = '';
  } else {
    btn.style.backgroundColor = color;
    for (const p of _newUiInlineProps) btn.style[p] = '';
  }
}
_setBtnState(document.getElementById('checkAllListen'), 'pink');

//アバターの初期位置
let AX = 330;
let AY = 200;
let DIR = "S";

let myToken;
const avaP = {};
let roomMemberToken = [];

//ここ配列にしたほうが良いかいな
const avaS = [], avaSW = [], avaW = [], avaNW = [], avaN = [], avaNE = [], avaE = [], avaSE = [];
const avaSit = [];
let abonTexture;

const hukidashi = [];

let AtextX, AtextY, MtextX, MtextY;

const polygons = {};

let room;
let roomSE;
let loginRoom;
let entrance, meadow, cloud, cloud1, cloud2, bonfire, rainbow, entranceImg;
let entrance2FFloor, entrance1FFloor;
const ENTRANCE_2F_POLY = [[0,152],[159,151],[239,152],[298,160],[362,175],[439,200],[514,224],[590,251],[660,284],[660,405],[576,334],[510,292],[460,267],[404,242],[357,222],[320,210],[297,201],[289,200],[276,224],[254,239],[231,253],[199,265],[164,272],[135,282],[99,289],[61,301],[30,309],[0,320],[0,249],[52,242],[94,236],[136,226],[172,217],[198,206],[216,196],[220,177],[215,168],[187,166],[168,164],[132,164],[86,164],[38,164],[0,164],[0,152]];
let bridge0, bridge1, bridge2, leftPole, rightPole;
const bridgeDepthMaps = [];
let leftPoleDepthMapSmoothed = null;
let rightPoleDepthMapSmoothed = null;
let bridgeDepthMapSmoothed = null; // bridge1用
let entranceIs2F = false;
let daikokubasira;

let outerSpace;
let mozinoheya;
let star1;
let konaNoHeya;
let konaPowderRoom;
let star2;
let mugenIriguchi;
let mugenRoom;
let dirRoomEast, dirRoomSouth, dirRoomWest, dirRoomNorth;
let gateTex;
let mugenGateRooms = [null, null, null, null];
let mugenGateSprites = [];
let _mugenGateBeingEntered = -1;
let directionGateRooms = {};
let directionGateSprites = {};
let _directionGateBeingEntered = null;
let _inUserRoom = false;
let _userRoomDisplayName = '';
let _inRoomTransition = false;
let _prevRoomForBlockReturn = null;
let objMap = {};
const _directLinkRoom = new URLSearchParams(location.search).get('room');
let _resolvedDirectLinkId = _directLinkRoom;
let _directLinkRoomExists = false;

// 直リンクがユーザー部屋の場合: 部屋名→ID解決 + 存在確認 + HTTPキャッシュを温める
let _directLinkResolvePromise = Promise.resolve();
if (_directLinkRoom) {
  const _sysRoomSetDL = new Set(['エントランス', '草原', 'うちゅー', '文字の部屋', '粉の部屋', '星1', 'むげんのいりぐち', 'むげん', '東の部屋', '南の部屋', '西の部屋', '北の部屋']);
  if (_sysRoomSetDL.has(_directLinkRoom)) {
    _directLinkRoomExists = true;
  } else {
    _directLinkResolvePromise = (async () => {
      try {
        const nr = await fetch('/api/rooms/resolve?name=' + encodeURIComponent(_directLinkRoom));
        if (nr.ok) {
          const nd = await nr.json();
          if (nd && nd.id) { _resolvedDirectLinkId = nd.id; _directLinkRoomExists = true; return; }
        }
        // 名前解決失敗 → IDとして直接確認（UUID形式の旧リンク後方互換）
        const ir = await fetch('/api/rooms/' + encodeURIComponent(_directLinkRoom));
        if (ir.ok) _directLinkRoomExists = true;
      } catch (_e) {}
    })();
    (async () => {
      await _directLinkResolvePromise;
      if (!_directLinkRoomExists) return;
      try {
        const r = await fetch('/api/rooms/' + encodeURIComponent(_resolvedDirectLinkId) + '/images');
        if (r.ok) { const imgs = await r.json(); imgs.forEach(img => { new Image().src = img.url; }); }
      } catch (_e) {}
    })();
  }
}

const _dirBgUrlCache = {};
const _dirBgPreSprites = {};
const _dirBgPreloadPromises = {}; // ログイン後に開始する部屋ごとのBGプリロードPromise

const gomaneco = {};
gomaneco.name = "gomaneco";

const gomanecoMono = {};
gomanecoMono.name = "gomanecoMono";
const necosuke = {};
necosuke.name = "necosuke";
const necosukeMono = {};
necosukeMono.name = "necosukeMono";
let avatarIconImg = {};

let colPoint = [];
let colPointAll = [];
let MX, MY;
let wallCount = 0;

const tickerListeners = [];
let waffleEventNum = 0;

//お絵描き
let isDownCtrl = false;
let clickedWa_iButtun = false;
let isPointerDown = false;
const lastPosition = { x: null, y: null };
let oekakityu = false;
let oekakiColor = 0xffffff;
let oekakiAlpha = 1;
let avatarOekakiToken = false;
let clearState = "disabled";   // "enabled" or "disabled"
let undoState = "disabled";   // "enabled" or "disabled"
let redoState = "disabled";   // "enabled" or "disabled"

// キーボード移動
const keysPressed = new Set();
let keyMoveTickerFn = null;
let keyWalkFrame = 0; // 0=idle, 1=walk1, 2=walk2 の3フレームサイクル
let keyWalkFrameTimer = 0;
let keySocketTimer = 0;
const KEY_MOVE_SPEED = 1;
const KEY_WALK_FRAME_TICKS = 6;   // KEY_SOCKET_TICKSと同値→送信側10fps・受信側パケット毎で一致
const KEY_SOCKET_TICKS = 6;       // ~60fps で10回/秒送信
const KEY_FRAME_SWITCH_COOLDOWN = 80; // ms: 連打判定のクールダウン
let lastKeyFrameSwitch = 0;
let oekakiPerStateMode = localStorage.getItem("oekakiPerStateMode") === "true"; // デフォルトfalse
let allowOthersOekaki = localStorage.getItem("allowOthersOekaki") !== "false"; // デフォルトtrue
let useTTS = localStorage.getItem("useTTS") === "true";
let ttsMode = localStorage.getItem("ttsMode") || "normal";
let ttsVolume = parseFloat(localStorage.getItem("ttsVolume") ?? "1.0");

let muon = new Audio('sound/etc/muon.mp3');
muon.autoplay = true;
muon.setAttribute('playsinline', '');
//ログ音
let useLogChime = localStorage.getItem("useLogChime") === "true";
let showJoinLeaveMsg = localStorage.getItem("showJoinLeaveMsg") !== "false"; // デフォルトtrue
let useLogHighlight = localStorage.getItem("useLogHighlight") !== "false"; // デフォルトtrue
let useAvatarHighlight = localStorage.getItem("useAvatarHighlight") !== "false"; // デフォルトtrue
let useLogItemHighlight = localStorage.getItem("useLogItemHighlight") !== "false"; // デフォルトtrue
let contextMenuPos = localStorage.getItem("contextMenuPos") || "tapLeft";
let showCoord = localStorage.getItem("showCoord") === "true";
const _vtdStored = localStorage.getItem("videoTransparentDefault");
let videoTransparentDefault = _vtdStored !== null ? _vtdStored === "true" : (navigator.maxTouchPoints > 0);
let videoTransparentOpacity = Math.max(0.3, parseFloat(localStorage.getItem("videoTransparentOpacity") || "0.5"));
let _videoTransparentActive = false;
let _streamSurfaceAllowed = localStorage.getItem('streamSurfaceAllowed') !== 'false';
let _videoAutoReset = localStorage.getItem('videoAutoReset') !== 'false';
let _lastVideoCount = 0;
const videoStartOrder = {};
let _recalcRetryRaf = null;
const videoFloorObjects = {};
const videoFloorIntrinsic = {};
const _videoFloorZOrder = [];
let _trainBtns = {}; // 奥→手前順のトークン配列（末尾が最前面）
let _videoFloorFocused = false;
const VIDEO_FLOOR_Y = 460;
const VIDEO_FLOOR_H = 330;
let highlightToken = null;
const msgSE = {};
msgSE.loginRoom = {};
msgSE.loginRoom.in = [];
msgSE.loginRoom.in[0] = new Audio('sound/login/tirin1.mp3');

msgSE.JMMLogin = new Audio('sound/bomb2.mp3');
msgSE.JMMLogin.volume = 0.3;

msgSE.log = [];
msgSE.log[0] = new Audio('sound/log/cute-motion1.mp3');
msgSE.log[1] = new Audio('sound/log/nyu3.mp3');
msgSE.log[2] = new Audio('sound/log/papa1.mp3');
msgSE.log[3] = new Audio('sound/log/se_maoudamashii_system10.mp3');
msgSE.log[4] = new Audio('sound/log/se_maoudamashii_retro16.mp3');
msgSE.log[5] = new Audio('sound/log/se_maoudamashii_se_sound15.mp3');
msgSE.log[6] = new Audio('sound/log/se_maoudamashii_system42.mp3');
msgSE.log[7] = new Audio('sound/log/se_maoudamashii_system45.mp3');
msgSE.log[8] = new Audio('sound/log/se_maoudamashii_system48.mp3');

msgSE.other = {};
msgSE.other.in = [];
msgSE.other.log = [];
msgSE.other.out = [];
msgSE.other.logout = [];
msgSE.other.in[0] = new Audio('sound/otherRoomIn/cursor7.mp3');
msgSE.other.in[1] = new Audio('sound/otherRoomIn/touch1.mp3');
msgSE.other.out[0] = new Audio('sound/otherRoomOut/pa1.mp3');
msgSE.other.out[1] = new Audio('sound/otherRoomOut/se_maoudamashii_element_wind02.mp3');
msgSE.other.out[2] = new Audio('sound/otherRoomOut/se_maoudamashii_system39.mp3');
msgSE.other.out[3] = new Audio('sound/otherRoomOut/suck1.mp3');
msgSE.other.logout[0] = new Audio('sound/otherRoomLogout/cancel1.mp3');
msgSE.other.logout[1] = new Audio('sound/otherRoomLogout/decision15.mp3');

msgSE.outerSpace = {};
msgSE.outerSpace.in = [];
msgSE.outerSpace.log = [];
msgSE.outerSpace.out = [];
msgSE.outerSpace.logout = [];
msgSE.outerSpace.in[0] = new Audio('sound/outerSpaceIn/se_maoudamashii_system11.mp3');
msgSE.outerSpace.in[1] = new Audio('sound/outerSpaceIn/se_maoudamashii_system13.mp3');
msgSE.outerSpace.out[0] = new Audio('sound/outerSpaceOut/se_maoudamashii_se_sound10.mp3');
msgSE.outerSpace.out[1] = new Audio('sound/outerSpaceOut/se_maoudamashii_system33.mp3');
msgSE.outerSpace.logout[0] = new Audio('sound/outerSpaceLogout/se_maoudamashii_onepoint31.mp3');
msgSE.outerSpace.logout[1] = new Audio('sound/outerSpaceLogout/se_maoudamashii_system32.mp3');

//エイリアス
const html = document.querySelector('html');
const body = document.querySelector('body');
const mainFrame = document.getElementById("mainFrame");
const main = document.getElementById("main");
const titleBar = document.getElementById("titleBar");
const title = document.getElementById("title");
const Pmachi = document.getElementById("Pmachi");
const Pmain = document.getElementById("Pmain");
const graphic = document.getElementById("graphic");

const mainLog = document.getElementById("mainLog");
const mainLogFrame = document.getElementById("mainLogFrame");
const announce = document.getElementsByClassName("announce");
const footer = document.getElementById("footer");
const switchBar = document.getElementById("switchBar");
const kousinrireki = document.getElementById("kousinrireki");
const day = document.getElementById('day');
const form = document.getElementById('form');
const nameForm = document.getElementById('nameForm');
const msgForm = document.getElementById('msgForm');
const useOverlayChatButton = document.getElementById('useOverlayChatButton');
const logs = document.getElementById('logs');
const logNoiseButton = document.getElementById('logNoiseButton');
const mainLogButton = document.getElementById('mainLogButton');
const wa_i = document.getElementById('wa_i');
const clear = document.getElementById('clear');
const undo = document.getElementById('undo');
const redo = document.getElementById('redo');
const effectVolume = document.getElementById('effectVolume');
const usersDisplay = document.getElementById('usersDisplay');
const usersNumber = document.getElementById('usersNumber');
const train = document.getElementById("train");
const sizeSelecter = document.getElementById("sizeSelecter");
const fontSizeSelecter = document.getElementById("fontSizeSelecter");
const muonAudio = document.getElementById("muonAudio");
const mainLogUl = document.getElementById("mainLog").querySelector("ul");
const contextMenu = document.getElementById("contextMenu");
const sitMenu = document.getElementById("sitMenu");
const sleepMenu = document.getElementById("sleepMenu");
const abonMenu = document.getElementById("abonMenu");
const avatarOekakiMenu = document.getElementById("avatarOekakiMenu");
const setting = document.getElementById("setting");
const selectVideoSize = document.getElementById("selectVideoSize");
const selectVideoSize2Num = document.getElementById("selectVideoSize2Num");
const selectVideoSize3Num = document.getElementById("selectVideoSize3Num");
const selectVideoReverse = document.getElementById("selectVideoReverse");
const selectVideoInverse = document.getElementById("selectVideoInverse");
const selectVideoInverseAndReverse = document.getElementById("selectVideoInverseAndReverse");
const selectVideoReverseOther = document.getElementById("selectVideoReverseOther");
const selectVideoInverseOther = document.getElementById("selectVideoInverseOther");
const selectVideoInverseAndReverseOther = document.getElementById("selectVideoInverseAndReverseOther");

const mediaContainer = document.getElementById('mediaContainer');

let PMsize;

//日付
let date = new Date();
day.innerHTML = date.toLocaleString();

//フォントを切り替える
let fontName;
let obj;
let index;
let fontSize;
const titleFontFamily = ["鉄瓶ゴシック", "kosugiMaru", "チカラヅヨク", "チカラヨワク", "まるっかな", "M+フォント", "源界明朝", "にゃしぃフォント改二", "PixelMplus", "めもわーるしかく"];

let loginMX;
let loginMY;

// ワープポイント定義（座標指定とオブジェクト指定の混在対応）
const warpPoints = [
  // 座標指定のワープポイント
  {
    room: "草原",
    area: { x1: 125, x2: 175, y1: 200, y2: 300 },
    toSpot: "outerSpaceMainSpot"
  },
  {
    room: "うちゅー",
    area: { x1: 136, x2: 151, y1: 68, y2: 86 },
    toSpot: "entranceCloud1"
  },
  {
    room: "うちゅー",
    area: { x1: 580, x2: 595, y1: 180, y2: 200 },
    toSpot: "文字の部屋EntrySpot"
  },
  {
    room: "うちゅー",
    area: { x1: 453, x2: 467, y1: 133, y2: 147 },
    toSpot: "mugenEntrySpot"
  },
  {
    room: "むげんのいりぐち",
    area: { x1: 275, x2: 380, y1: 145, y2: 290 },
    toSpot: "mugenMainSpot"
  },
  {
    room: "むげんのいりぐち",
    area: { x1: 580, x2: 660, y1: 400, y2: 480 },
    toSpot: "outerSpaceMainSpot"
  },
  {
    room: "むげん",
    area: { x1: 580, x2: 660, y1: 400, y2: 480 },
    toSpot: "mugenEntrySpot"
  },
  {
    room: "東の部屋",
    area: { x1: 0, x2: 60, y1: 195, y2: 285 },
    toSpot: "mugenMainSpot"
  },
  {
    room: "南の部屋",
    area: { x1: 275, x2: 385, y1: 0, y2: 60 },
    toSpot: "mugenMainSpot"
  },
  {
    room: "西の部屋",
    area: { x1: 600, x2: 660, y1: 195, y2: 285 },
    toSpot: "mugenMainSpot"
  },
  {
    room: "北の部屋",
    area: { x1: 275, x2: 385, y1: 420, y2: 480 },
    toSpot: "mugenMainSpot"
  },
  {
    room: "星1",
    area: { x1: 311, x2: 348, y1: 220, y2: 250 },
    toSpot: "outerSpaceMainSpot"
  },
  {
    room: "星1",
    area: { x1: 580, x2: 660, y1: 400, y2: 480 },
    toSpot: "文字の部屋LeftEntrySpot"
  },
  {
    room: "文字の部屋",
    area: { x1: 0, x2: 60, y1: 340, y2: 480 },
    toSpot: "star1EntrySpot"
  },
  {
    room: "文字の部屋",
    area: { x1: 600, x2: 660, y1: 340, y2: 480 },
    toSpot: "outerSpaceMainSpot"
  },
  // エントランス(entrance.png) → 草原 ワープ（斜め帯、幅約50px）
  // (415,0)→(640,85) の線を中心に垂直方向25px の帯
  {
    room: "エントランス",
    polygon: [[406, -23], [424, 23], [649, 108], [631, 62]],
    toSpot: "grassFromEntrance"
  },
  // エントランス → むげんのいりぐち ワープ
  {
    room: "エントランス",
    polygon: [[250,0],[251,19],[256,25],[263,29],[291,29],[292,25],[295,16],[302,15],[304,0]],
    toSpot: "mugenEntrySpot"
  },
  // 草原 → エントランス ワープ（右下）⭐ 座標要調整
  {
    room: "草原",
    area: { x1: 540, x2: 660, y1: 400, y2: 480 },
    toSpot: "entranceFromMeadow"
  },
  // オブジェクト指定のワープポイント
  {
    room: "草原",
    targetObject: "大黒柱", // objMapのキー名
    toSpot: "outerSpaceMainSpot"
  },
  // {
  //   room: "エントランス",
  //   targetObject: "雲",
  //   toSpot: "star1EntrySpot"
  // },
  // ログインボタン用
  {
    room: "loginRoom",
    targetObject: "loginButton", // 将来的にloginButtonをGameObjectにした場合
    action: "login"
  }
];

// DBワープゾーン関連
let dbWarpZones = [];
let warpZoneGfx = null;
let _warpGateSprites = [];

// DB部屋画像関連
let dbRoomImages = [];
let _pendingDeletes = new Set();
const _pendingWarpDeletes = new Set();
const _pendingImgAdds = new Set();
const _pendingWarpAdds = new Set();
const dbImageSprites = [];
let _dbImageZIndexTicker = null;
let _platformPixelData = [];

// カスタムコード sandbox関連
let customCodeFrame = null;
let customCodeContainer = null;
let warpPlaceMode = false;
let warpPlaceStart = null;
let warpPlacePreview = null;
let warpEditPassword = '';
let warpEditRoomId = '';
let _warpPlaceShape = 'rect';
let _warpDragMode = false;
const _warpEditOverlays = [];
let _warpDragging = null;
let _warpDragPending = null;
let _prevRoomSpot = '';
const _hiddenWarpIds = new Set();
let dbScaleZones = [];
let _scaleZoneGfx = null;
let _scaleZoneGraphics = [];
const _scaleZoneEditOverlays = [];
let _scaleZoneDragging = null;
let _scaleZoneDragMode = false;
let _roomAvatarScale = 1.0;
let _scaleZonePlaceMode = false;
let _scaleZonePlaceStart = null;
let _scaleZonePlacePreview = null;
let _scaleZoneEditRoomId = '';

// ポリゴン内判定（Ray casting法）
// polygon は [[x0,y0],[x1,y1],...] の配列
function pointInPolygon(px, py, polygon) {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// 統合されたワープ判定関数
function checkObjectWarpPoints(avatar) {
  if (_inRoomTransition) return false;
  if (document.getElementById('roomEditPanel').style.display !== 'none') return false;
  for (const wp of warpPoints) {
    // 部屋が一致しない場合はスキップ
    if (wp.room !== room.name) continue;

    let isInArea = false;

    // オブジェクト指定の場合
    if (wp.targetObject) {
      const targetObj = objMap[wp.targetObject];
      if (targetObj) {
        isInArea = hitAB(avatar, targetObj);
      }
    }
    // ポリゴン指定の場合
    else if (wp.polygon) {
      const avaPos = avatar.container.getGlobalPosition();
      isInArea = pointInPolygon(avaPos.x, avaPos.y, wp.polygon);
    }
    // 矩形指定の場合
    else if (wp.area) {
      const avaPos = avatar.container.getGlobalPosition();
      isInArea = (
        wp.area.x1 <= avaPos.x && avaPos.x <= wp.area.x2 &&
        wp.area.y1 <= avaPos.y && avaPos.y <= wp.area.y2
      );
    }

    // 判定が成功した場合
    if (isInArea) {
      if (wp.action === "login") {
        login();
      } else if (wp.toSpot) {
        goSelfToRoomSpot(wp.toSpot);
      }
      return true;
    }
  }

  // DBワープゾーンの判定
  for (const wz of dbWarpZones) {
    const avaPos = avatar.container.getGlobalPosition();
    let isInWz = false;
    if (wz.shape === 'circle' || wz.shape === 'ellipse') {
      const rw = wz.width / 2;
      const rh = (wz.height ?? wz.width) / 2;
      const cx = wz.x + rw;
      const cy = wz.y + rh;
      const nx = (avaPos.x - cx) / rw;
      const ny = (avaPos.y - cy) / rh;
      isInWz = nx * nx + ny * ny <= 1;
    } else {
      isInWz = (
        wz.x <= avaPos.x && avaPos.x <= wz.x + wz.width &&
        wz.y <= avaPos.y && avaPos.y <= wz.y + (wz.height ?? wz.width)
      );
    }
    if (isInWz) {
      if (wz.warp_type === 'back') {
        const _bSys = { 'エントランス': 'entranceMainSpot', '草原': 'entranceCloud1', 'うちゅー': 'outerSpaceMainSpot', '星1': 'star1EntrySpot', '文字の部屋': '文字の部屋EntrySpot', '粉の部屋': '粉の部屋EntrySpot', 'むげんのいりぐち': 'mugenEntrySpot', 'むげん': 'mugenMainSpot', '東の部屋': '東の部屋Spot', '南の部屋': '南の部屋Spot', '西の部屋': '西の部屋Spot', '北の部屋': '北の部屋Spot' };
        goSelfToRoomSpot(_prevRoomSpot || (wz.target_room_id && _bSys[wz.target_room_id]) || 'entranceMainSpot');
        return true;
      }
      if (wz.target_room_id) {
        const sysSpot = { 'エントランス': 'entranceMainSpot', '草原': 'entranceCloud1', 'うちゅー': 'outerSpaceMainSpot', '星1': 'star1EntrySpot', '文字の部屋': '文字の部屋EntrySpot', '粉の部屋': '粉の部屋EntrySpot', 'むげんのいりぐち': 'mugenEntrySpot', 'むげん': 'mugenMainSpot', '東の部屋': '東の部屋Spot', '南の部屋': '南の部屋Spot', '西の部屋': '西の部屋Spot', '北の部屋': '北の部屋Spot' };
        _prevRoomSpot = _roomToSpot(room.name);
        goSelfToRoomSpot(sysSpot[wz.target_room_id] || ('userRoom:' + wz.target_room_id));
        return true;
      }
      // 未接続のnormalワープ → 新しい部屋を作る
      _warpPortalCreateRoom();
      return true;
    }
  }

  // 画像ワープの判定
  for (const img of dbRoomImages) {
    if (!img.is_warp) continue;
    const avaPos = avatar.container.getGlobalPosition();
    const ix = img.x ?? 0, iy = img.y ?? 0;
    const iw = img.width ?? 0, ih = img.height ?? iw;
    if (avaPos.x >= ix && avaPos.x <= ix + iw && avaPos.y >= iy && avaPos.y <= iy + ih) {
      _warpPortalCreateRoom();
      return true;
    }
  }

  return false;
}

// DBワープゾーン: 現在の部屋のワープゾーンをAPIから取得して描画
async function loadDbWarpZones(roomId) {
  try {
    const res = await fetch('/api/rooms/' + encodeURIComponent(roomId) + '/warps');
    if (!res.ok) return;
    const newZones = await res.json();
    clearWarpZones();
    newZones.sort((a, b) => (a.warp_type === 'back' ? 0 : 1) - (b.warp_type === 'back' ? 0 : 1));
    dbWarpZones = newZones;
    drawWarpZones();
  } catch (_e) {}
}

function _applyRoomBgColor(colorHex) {
  if (!room || !(room.sprite instanceof PIXI.Graphics)) return;
  const col = colorHex ? (parseInt(colorHex.replace('#', ''), 16) || 0xffffff) : 0xffffff;
  const oldBg = room.sprite;
  const newBg = new PIXI.Graphics();
  newBg.zIndex = -200;
  newBg.beginFill(col);
  newBg.drawRect(0, 0, 660, 460);
  newBg.endFill();
  room.container.addChild(newBg);
  if (oldBg.parent) oldBg.parent.removeChild(oldBg);
  room.sprite = newBg;
}

function drawWarpZones() {
  _warpGateSprites.forEach(s => { if (s.parent) s.parent.removeChild(s); s.destroy(); });
  _warpGateSprites = [];
  if (!room) return;
  const GATE_URL = '/img/sample/GATE.png';
  dbWarpZones.forEach(wz => {
    const sprite = PIXI.Sprite.from(wz.custom_image_url || GATE_URL);
    sprite.x = wz.x ?? 0;
    sprite.y = wz.y ?? 0;
    const _setSize = () => {
      const w = (wz.width > 0) ? wz.width : (gateTex ? Math.round(gateTex.width * 2 / 5) : 100);
      const h = ((wz.height ?? wz.width) > 0) ? (wz.height ?? wz.width) : (gateTex ? Math.round(gateTex.height * 2 / 5) : 100);
      sprite.width = w; sprite.height = h;
      sprite.x = wz.x ?? 0;
      sprite.y = wz.y ?? 0;
      sprite.zIndex = sprite.y + sprite.height;
      const oIdx = _warpEditOverlays.findIndex(ov => ov.sprite === sprite);
      if (oIdx >= 0) _redrawWarpEditOverlay(_warpEditOverlays[oIdx]);
      const row = document.querySelector('#warpList [data-warp-id="' + wz.id + '"]');
      if (row) row.querySelectorAll('input[data-field]').forEach(inp => {
        const v = { x: wz.x, y: wz.y, width: w, height: h }[inp.dataset.field];
        if (v !== undefined) inp.value = v;
      });
    };
    if (sprite.texture.baseTexture.valid) { _setSize(); }
    else { sprite.texture.baseTexture.once('loaded', _setSize); }
    sprite.zIndex = sprite.y + sprite.height;
    sprite.eventMode = 'static';
    sprite.cursor = 'pointer';
    sprite.on('pointerdown', e => {
      if (_warpDragMode) return;
      if (_inRoomTransition) return;
      if (document.getElementById('roomEditPanel').style.display !== 'none') return;
      if (e.button !== undefined && e.button !== 0) return;
      if (wz.warp_type === 'back') {
        e.stopPropagation();
        const _bSys = { 'エントランス': 'entranceMainSpot', '草原': 'entranceCloud1', 'うちゅー': 'outerSpaceMainSpot', '星1': 'star1EntrySpot', '文字の部屋': '文字の部屋EntrySpot', '粉の部屋': '粉の部屋EntrySpot', 'むげんのいりぐち': 'mugenEntrySpot', 'むげん': 'mugenMainSpot', '東の部屋': '東の部屋Spot', '南の部屋': '南の部屋Spot', '西の部屋': '西の部屋Spot', '北の部屋': '北の部屋Spot' };
        goSelfToRoomSpot(_prevRoomSpot || (wz.target_room_id && _bSys[wz.target_room_id]) || 'entranceMainSpot');
      } else if (wz.target_room_id) {
        e.stopPropagation();
        const sysSpot = { 'エントランス': 'entranceMainSpot', '草原': 'entranceCloud1', 'うちゅー': 'outerSpaceMainSpot', '星1': 'star1EntrySpot', '文字の部屋': '文字の部屋EntrySpot', '粉の部屋': '粉の部屋EntrySpot', 'むげんのいりぐち': 'mugenEntrySpot', 'むげん': 'mugenMainSpot', '東の部屋': '東の部屋Spot', '南の部屋': '南の部屋Spot', '西の部屋': '西の部屋Spot', '北の部屋': '北の部屋Spot' };
        _prevRoomSpot = _roomToSpot(room.name);
        goSelfToRoomSpot(sysSpot[wz.target_room_id] || ('userRoom:' + wz.target_room_id));
      }
    });
    room.container.addChild(sprite);
    _warpGateSprites.push(sprite);
  });
}

function clearWarpZones() {
  _warpGateSprites.forEach(s => { if (s.parent) s.parent.removeChild(s); s.destroy(); });
  _warpGateSprites = [];
  if (warpZoneGfx) {
    if (warpZoneGfx.parent) warpZoneGfx.parent.removeChild(warpZoneGfx);
    warpZoneGfx.clear();
  }
  dbWarpZones = [];
}

async function loadDbScaleZones(roomId) {
  try {
    const [zonesRes, roomRes] = await Promise.all([
      fetch('/api/rooms/' + encodeURIComponent(roomId) + '/scale-zones'),
      fetch('/api/rooms/' + encodeURIComponent(roomId)),
    ]);
    const newZones = zonesRes.ok ? await zonesRes.json() : null;
    const newRoomData = roomRes.ok ? await roomRes.json() : null;
    clearScaleZones();
    if (newZones) dbScaleZones = newZones;
    if (newRoomData) _roomAvatarScale = (newRoomData.avatar_scale != null) ? newRoomData.avatar_scale : 1.0;
    drawScaleZones();
  } catch (_e) {}
}

function drawScaleZones() {
  const wasVisible = _scaleZoneGfx ? _scaleZoneGfx.visible : false;
  if (!_scaleZoneGfx) {
    _scaleZoneGfx = new PIXI.Graphics();
    _scaleZoneGfx.zIndex = 998;
  }
  _scaleZoneGfx.visible = wasVisible;
  _scaleZoneGfx.clear();
  if (room && room.container) room.container.addChild(_scaleZoneGfx);
  dbScaleZones.forEach(z => {
    _scaleZoneGfx.lineStyle(1, 0xbb44ff, 0.6);
    _scaleZoneGfx.beginFill(0xbb44ff, 0.08);
    _scaleZoneGfx.drawRect(z.x, z.y, z.width, z.height);
    _scaleZoneGfx.endFill();
  });
}

function clearScaleZones() {
  _disableScaleZoneEditMode();
  if (_scaleZoneGfx) {
    if (_scaleZoneGfx.parent) _scaleZoneGfx.parent.removeChild(_scaleZoneGfx);
    _scaleZoneGfx.clear();
  }
  dbScaleZones = [];
  _roomAvatarScale = 1.0;
}

function updateScaleZoneList() {
  const list = document.getElementById('scaleZoneList');
  if (!list) return;
  list.innerHTML = '';
  dbScaleZones.forEach(z => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-direction:column;gap:3px;margin:3px 0;font-size:11px;padding:4px;border:1px solid #442266;border-radius:3px;';

    const topRow = document.createElement('div');
    topRow.style.cssText = 'display:flex;align-items:center;gap:3px;flex-wrap:wrap;';

    const mkXYWHInput = (label, field) => {
      const wrap = document.createElement('span');
      wrap.style.cssText = 'display:inline-flex;align-items:center;gap:1px;';
      const lbl = document.createElement('span');
      lbl.textContent = label;
      lbl.style.cssText = 'font-size:10px;color:#888;';
      const inp = document.createElement('input');
      inp.type = 'number'; inp.value = Math.round(z[field] ?? 0);
      inp.dataset.zoneId = z.id;
      inp.dataset.field = field;
      inp.style.cssText = 'width:42px;background:#0d0d1a;border:1px solid #4a90d9;color:#fff;padding:1px 2px;font-size:10px;';
      inp.addEventListener('change', async () => {
        z[field] = Number(inp.value);
        const overlay = _scaleZoneGraphics.find(o => o.z.id === z.id);
        if (overlay) overlay._redraw();
        await fetch('/api/rooms/' + encodeURIComponent(_scaleZoneEditRoomId) + '/scale-zones/' + z.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword },
          body: JSON.stringify({ [field]: Number(inp.value) }),
        });
      });
      wrap.appendChild(lbl);
      wrap.appendChild(inp);
      return wrap;
    };
    topRow.appendChild(mkXYWHInput('X:', 'x'));
    topRow.appendChild(mkXYWHInput('Y:', 'y'));
    topRow.appendChild(mkXYWHInput('W:', 'width'));
    topRow.appendChild(mkXYWHInput('H:', 'height'));

    const bottomRow = document.createElement('div');
    bottomRow.style.cssText = 'display:flex;align-items:center;gap:4px;';

    const scaleSlider = document.createElement('input');
    scaleSlider.type = 'range';
    scaleSlider.min = '0.1'; scaleSlider.max = '3'; scaleSlider.step = '0.05';
    scaleSlider.value = z.scale;
    scaleSlider.style.cssText = 'flex:1;min-width:60px;';

    const scaleNum = document.createElement('input');
    scaleNum.type = 'number';
    scaleNum.min = '0.01'; scaleNum.max = '10'; scaleNum.step = '0.05';
    scaleNum.value = z.scale;
    scaleNum.style.cssText = 'width:46px;background:#0d0d1a;border:1px solid #4a90d9;color:#fff;font-size:10px;padding:1px 3px;';

    const syncScale = (s) => { z.scale = s; scaleSlider.value = s; scaleNum.value = s; };
    const saveScale = async () => {
      const s = Math.max(0.01, Math.min(10, parseFloat(scaleNum.value) || 1));
      syncScale(s);
      await fetch('/api/rooms/' + encodeURIComponent(_scaleZoneEditRoomId) + '/scale-zones/' + z.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword },
        body: JSON.stringify({ scale: s }),
      });
    };
    scaleSlider.addEventListener('input', () => { syncScale(parseFloat(scaleSlider.value)); });
    scaleSlider.addEventListener('change', saveScale);
    scaleNum.addEventListener('change', saveScale);
    bottomRow.appendChild(scaleSlider);
    bottomRow.appendChild(scaleNum);

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.style.cssText = 'color:#fff;border:none;cursor:pointer;padding:1px 5px;font-size:11px;background:#600;';
    delBtn.addEventListener('click', async () => {
      await fetch('/api/rooms/' + encodeURIComponent(_scaleZoneEditRoomId) + '/scale-zones/' + z.id, {
        method: 'DELETE',
        headers: { 'X-Edit-Password': warpEditPassword },
      });
      _disableScaleZoneEditMode();
      await loadDbScaleZones(_scaleZoneEditRoomId);
      updateScaleZoneList();
      _enableScaleZoneEditMode();
    });
    bottomRow.appendChild(delBtn);

    row.appendChild(topRow);
    row.appendChild(bottomRow);
    list.appendChild(row);
  });
}

function _enableScaleZoneEditMode() {
  _disableScaleZoneEditMode();
  if (!room || !room.container) return;
  const HS = 10;
  dbScaleZones.forEach(z => {
    const gfx = new PIXI.Graphics();
    gfx.zIndex = 999;
    gfx.eventMode = 'static';
    gfx.cursor = 'move';
    const _redraw = () => {
      gfx.clear();
      gfx.lineStyle(2, 0xbb44ff, 0.9);
      gfx.beginFill(0xbb44ff, 0.12);
      gfx.drawRect(0, 0, z.width, z.height);
      gfx.endFill();
      gfx.lineStyle(1, 0xffffff, 0.8);
      gfx.beginFill(0xffffff, 0.9);
      [[0, 0], [z.width - HS, 0], [0, z.height - HS], [z.width - HS, z.height - HS]].forEach(([hx, hy]) => {
        gfx.drawRect(hx, hy, HS, HS);
      });
      gfx.endFill();
      gfx.x = z.x; gfx.y = z.y;
      gfx.hitArea = new PIXI.Rectangle(0, 0, z.width, z.height);
    };
    _redraw();
    gfx.on('pointerdown', e => {
      if (e.button !== undefined && e.button !== 0) return;
      const p = e.data.getLocalPosition(room.container);
      const lx = p.x - z.x, ly = p.y - z.y;
      const base = { z, gfx, _redraw, startX: p.x, startY: p.y, origX: z.x, origY: z.y, origW: z.width, origH: z.height };
      if      (lx <= HS && ly <= HS)                           _scaleZoneDragging = { ...base, type: 'tl' };
      else if (lx >= z.width - HS && ly <= HS)                 _scaleZoneDragging = { ...base, type: 'tr' };
      else if (lx <= HS && ly >= z.height - HS)                _scaleZoneDragging = { ...base, type: 'bl' };
      else if (lx >= z.width - HS && ly >= z.height - HS)     _scaleZoneDragging = { ...base, type: 'br' };
      else                                                      _scaleZoneDragging = { ...base, type: 'move' };
    });
    _scaleZoneGraphics.push({ z, gfx, _redraw });
    room.container.addChild(gfx);
  });
  room.container.on('pointermove', _scaleZoneOnMove);
  room.container.on('pointerup', _scaleZoneOnUp);
  room.container.on('pointerupoutside', _scaleZoneOnUp);
}

function _disableScaleZoneEditMode() {
  _scaleZoneGraphics.forEach(({ gfx }) => { if (gfx.parent) gfx.parent.removeChild(gfx); gfx.destroy(); });
  _scaleZoneGraphics.length = 0;
  _scaleZoneDragging = null;
  if (room && room.container) {
    room.container.off('pointermove', _scaleZoneOnMove);
    room.container.off('pointerup', _scaleZoneOnUp);
    room.container.off('pointerupoutside', _scaleZoneOnUp);
  }
}

function _scaleZoneOnMove(e) {
  if (!_scaleZoneDragging) return;
  const p = e.data.getLocalPosition(room.container);
  const { z, _redraw, type, startX, startY, origX, origY, origW, origH } = _scaleZoneDragging;
  const dx = p.x - startX, dy = p.y - startY;
  if      (type === 'move') { z.x = origX + dx; z.y = origY + dy; }
  else if (type === 'br')   { z.width = Math.max(20, origW + dx); z.height = Math.max(20, origH + dy); }
  else if (type === 'bl')   { z.x = origX + dx; z.width = Math.max(20, origW - dx); z.height = Math.max(20, origH + dy); }
  else if (type === 'tr')   { z.y = origY + dy; z.width = Math.max(20, origW + dx); z.height = Math.max(20, origH - dy); }
  else if (type === 'tl')   { z.x = origX + dx; z.y = origY + dy; z.width = Math.max(20, origW - dx); z.height = Math.max(20, origH - dy); }
  _redraw();
  _updateScaleZoneListXYWH(z);
}

async function _scaleZoneOnUp() {
  if (!_scaleZoneDragging) return;
  const { z } = _scaleZoneDragging;
  _scaleZoneDragging = null;
  await fetch('/api/rooms/' + encodeURIComponent(_scaleZoneEditRoomId) + '/scale-zones/' + z.id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword },
    body: JSON.stringify({ x: Math.round(z.x), y: Math.round(z.y), width: Math.round(z.width), height: Math.round(z.height) }),
  });
}

function _updateScaleZoneListXYWH(z) {
  document.querySelectorAll('[data-zone-id="' + z.id + '"]').forEach(inp => {
    inp.value = Math.round(z[inp.dataset.field] ?? 0);
  });
}

// むげんのGATE
const MUGEN_GATE_TINTS = [0x444444, 0xaabbff, 0xffffff, 0xff2020]; // 上/下/左/右（リンク済み）
const MUGEN_GATE_TINT_EMPTY = 0x888888;
const _mugenGhostMap = new Map(); // token → [{container, sprite}, ...]

async function loadMugenGates() {
  try {
    const res = await fetch('/api/mugen/gates');
    if (!res.ok) return;
    const gates = await res.json();
    mugenGateRooms = [null, null, null, null];
    gates.forEach(g => { mugenGateRooms[g.gate_index] = g.room_id; });
    updateMugenGateTints();
  } catch (_e) {}
}

function updateMugenGateTints() {
  mugenGateSprites.forEach((gs, i) => {
    if (!gs) return;
    gs.tint = mugenGateRooms[i] ? MUGEN_GATE_TINTS[i] : MUGEN_GATE_TINT_EMPTY;
  });
}

function onMugenGateClick(gateIndex) {
  const dirNames = ['北の部屋', '南の部屋', '西の部屋', '東の部屋'];
  const spot = ['北の部屋Spot', '南の部屋Spot', '西の部屋Spot', '東の部屋Spot'];
  _prevRoomSpot = 'mugenMainSpot';
  goSelfToRoomSpot(spot[gateIndex]);
}

function _destroyMugenGhosts(token) {
  const entry = _mugenGhostMap.get(token);
  if (!entry) return;
  for (const g of entry.ghosts) {
    if (g.container.parent) g.container.parent.removeChild(g.container);
    g.sprite.texture = PIXI.Texture.EMPTY;
    g.container.destroy({ children: true });
  }
  _mugenGhostMap.delete(token);
}

function _destroyAllMugenGhosts() {
  for (const token of [..._mugenGhostMap.keys()]) _destroyMugenGhosts(token);
}

function _replayOekakiOnGhost(g, ava) {
  g.oekaki.clear();
  const sk = ava.currentAvaStateKey;
  for (const line of ava.drawHistory) {
    if (line.type !== "line") continue;
    if (oekakiPerStateMode && line.stateKey && line.stateKey !== sk) continue;
    if (!line.pointer || line.pointer.length < 2) continue;
    g.oekaki.lineStyle(2, line.color, line.alpha);
    g.oekaki.moveTo(line.pointer[0].x, line.pointer[0].y);
    for (let i = 1; i < line.pointer.length; i++) {
      g.oekaki.lineTo(line.pointer[i].x, line.pointer[i].y);
    }
  }
}

function _updateMugenGhosts() {
  if (!room || (room.name !== 'むげん' && !_DIR_ROOM_NAMES.has(room.name))) {
    if (_mugenGhostMap.size > 0) _destroyAllMugenGhosts();
    return;
  }
  const W = 660;
  const _mugenFloorH = room.name === 'むげん' && Object.keys(videoFloorObjects).length > 0 ? Math.max(...Object.values(videoFloorObjects).map(f => f._pixiH || VIDEO_FLOOR_H)) : 0;
  const maxY = _mugenFloorH > 0 ? VIDEO_FLOOR_Y + _mugenFloorH : 460;
  const MX = 60, MY = 80;

  for (const token of [..._mugenGhostMap.keys()]) {
    if (!avaP[token] || !avaP[token].container.parent) _destroyMugenGhosts(token);
  }

  for (const ava of Object.values(avaP)) {
    if (ava.abon || !ava.container.parent || !ava.avaC) continue;
    const x = ava.container.x, y = ava.container.y;

    const candidateOffsets = [
      [W, 0], [-W, 0], [0, maxY], [0, -maxY],
      [W, maxY], [W, -maxY], [-W, maxY], [-W, -maxY],
    ];
    const avaBounds = ava.container.getBounds();
    const visibleOffsets = candidateOffsets.filter(([dx, dy]) => {
      const gx = x + dx, gy = y + dy;
      if (gx > -MX && gx < W + MX && gy > -MY && gy < maxY + MY) return true;
      const bl = avaBounds.x + dx, br = avaBounds.x + avaBounds.width + dx;
      const bt = avaBounds.y + dy, bb = avaBounds.y + avaBounds.height + dy;
      return br > 0 && bl < W && bb > 0 && bt < maxY;
    });

    if (!_mugenGhostMap.has(ava.token)) {
      const ghosts = [];
      for (let i = 0; i < 3; i++) {
        const c = new PIXI.Container();
        c.eventMode = 'none';
        c.sortableChildren = true;

        const nt = new PIXI.Graphics();    // nameTag
        nt.zIndex = 1;
        const s = new PIXI.Sprite();       // avaC
        s.anchor.set(0.5, 1);
        s.zIndex = 2;
        const o = new PIXI.Graphics();     // oekaki
        o.zIndex = 10;
        const ntxt = new PIXI.Text('', nameTextStyle); // nameText
        ntxt.zIndex = 3;

        c.addChild(nt);
        c.addChild(s);
        c.addChild(o);
        c.addChild(ntxt);
        c.visible = false;
        room.container.addChild(c);
        ghosts.push({ container: c, sprite: s, oekaki: o, nameTag: nt, nameText: ntxt });
      }
      _mugenGhostMap.set(ava.token, {
        ghosts,
        _oekakiLen: -1, _stateKey: '', _perStateMode: false,
        _nameW: -1,
      });
    }

    const entry = _mugenGhostMap.get(ava.token);
    const { ghosts } = entry;

    // oekaki dirty チェック
    const oekakiDirty = ava.drawHistory.length !== entry._oekakiLen
      || ava.currentAvaStateKey !== entry._stateKey
      || oekakiPerStateMode !== entry._perStateMode;
    if (oekakiDirty) {
      entry._oekakiLen = ava.drawHistory.length;
      entry._stateKey = ava.currentAvaStateKey;
      entry._perStateMode = oekakiPerStateMode;
      for (const g of ghosts) _replayOekakiOnGhost(g, ava);
    }

    // nameTag/nameText dirty チェック（名前幅が変わった時だけ再描画）
    if (ava.nameText.width !== entry._nameW) {
      entry._nameW = ava.nameText.width;
      for (const g of ghosts) {
        g.nameText.text = ava.nameText.text;
        g.nameText.position.copyFrom(ava.nameText.position);
        g.nameTag.clear();
        g.nameTag.beginFill(0x000000, 0.5);
        g.nameTag.drawRect(0, 0, ava.nameText.width, ava.nameText.height);
        g.nameTag.endFill();
        g.nameTag.position.copyFrom(ava.nameTag.position);
      }
    }

    for (let i = 0; i < ghosts.length; i++) {
      const g = ghosts[i];
      const off = visibleOffsets[i];
      if (!off) { g.container.visible = false; continue; }
      g.sprite.texture = ava.avaC.texture;
      g.sprite.tint = ava.avaC.tint;
      g.sprite.scale.x = ava.avaC.scale.x;
      g.nameTag.alpha = ava.nameTag.alpha;
      g.container.x = x + off[0];
      g.container.y = y + off[1];
      g.container.scale.copyFrom(ava.container.scale);
      g.container.alpha = ava.container.alpha;
      g.container.zIndex = ava.container.zIndex;
      g.container.visible = true;
    }
  }
}

async function showGateCreateDialog(gateIndex, prevRoom) {
  _newRoomGateIndex = gateIndex;
  _prevRoomName = prevRoom !== undefined ? prevRoom : (room ? room.name : 'むげん');
  _prevRoomSpot = 'mugenMainSpot';
  try {
    const res = await fetch('/api/mugen/gates/' + gateIndex, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', creatorToken: myToken })
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 409) {
        mugenGateRooms[gateIndex] = data.room_id;
        updateMugenGateTints();
        _mugenGateBeingEntered = gateIndex;
        goSelfToRoomSpot('userRoom:' + data.room_id);
      } else {
        alert(data.error || '部屋の作成に失敗しました');
      }
      return;
    }
    _isNewRoomMode = true;
    _pendingOpenEditPanel = true;
    _pendingRoomName = '';
    mugenGateRooms[gateIndex] = data.id;
    updateMugenGateTints();
    goSelfToRoomSpot('userRoom:' + data.id);
  } catch (_e) {
    alert('通信エラーが発生しました');
  }
}

async function loadDirectionGates(roomName) {
  try {
    // BGがキャッシュ済みなら即適用、未キャッシュならAPIと並行取得
    const cachedBg = _dirBgUrlCache[roomName];
    if (cachedBg !== undefined) {
      _applyDirectionBg(roomName, cachedBg || null);
    }

    const fetches = [fetch('/api/direction/' + encodeURIComponent(roomName) + '/gates')];
    if (cachedBg === undefined) fetches.push(fetch('/api/direction/' + encodeURIComponent(roomName) + '/bg'));

    const [gatesRes, bgRes] = await Promise.all(fetches);
    if (gatesRes.ok) {
      const gates = await gatesRes.json();
      directionGateRooms[roomName] = [null, null, null, null];
      gates.forEach(g => { directionGateRooms[roomName][g.gate_index] = g.room_id; });
      updateDirectionGateTints(roomName);
    }
    if (bgRes && bgRes.ok) {
      const bgData = await bgRes.json();
      _dirBgUrlCache[roomName] = bgData.url || '';
      if (cachedBg === undefined) {
        _applyDirectionBg(roomName, bgData.url || null);
      }
    }
  } catch (_e) {}
}

const _DIR_ROOM_NAMES = new Set(['東の部屋', '南の部屋', '西の部屋', '北の部屋']);
const _SYSTEM_ROOM_NAMES = new Set(['エントランス', '草原', 'うちゅー', '文字の部屋', '粉の部屋', '星1', 'むげんのいりぐち', 'むげん', '東の部屋', '南の部屋', '西の部屋', '北の部屋']);

// ログイン後に呼ぶ。まだプリロードしていない方角部屋のBGを全て並行ロードして_dirBgPreSpritesを生成する
function _startDirBgPreloads() {
  for (const roomName of _DIR_ROOM_NAMES) {
    if (_dirBgPreloadPromises[roomName]) continue; // 起動済みならスキップ
    _dirBgPreloadPromises[roomName] = (async () => {
      try {
        const r = await fetch('/api/direction/' + encodeURIComponent(roomName) + '/bg');
        if (!r.ok) { _dirBgUrlCache[roomName] = ''; return; }
        const d = await r.json();
        _dirBgUrlCache[roomName] = d.url || '';
        if (!d.url) return;
        await new Promise(resolve => {
          const img = new Image();
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth || 660;
              canvas.height = img.naturalHeight || 480;
              canvas.getContext('2d').drawImage(img, 0, 0);
              const base = PIXI.BaseTexture.from(canvas);
              const tex = new PIXI.Texture(base);
              const sp = new PIXI.Sprite(tex);
              sp.zIndex = 6;
              sp.eventMode = 'none';
              sp.width = 660;
              sp.height = 480;
              _dirBgPreSprites[roomName] = sp;
            } catch (_e) {}
            resolve();
          };
          img.onerror = () => resolve();
          img.src = d.url;
        });
      } catch (_e) {}
    })();
  }
}

function _applyDirectionBg(roomName, url) {
  if (!room || room.name !== roomName) return;
  if (room.dirBgSprite) {
    if (room.dirBgSprite.parent) room.dirBgSprite.parent.removeChild(room.dirBgSprite);
    // pre-spriteは使い回すので破棄しない、それ以外は破棄
    if (room.dirBgSprite !== _dirBgPreSprites[roomName]) room.dirBgSprite.destroy();
    room.dirBgSprite = null;
  }
  if (!url) return;
  // ログイン前に生成済みのスプライトがあれば即addChild（同期・RAFなし）
  const pre = _dirBgPreSprites[roomName];
  if (pre && !pre.destroyed) {
    room.dirBgSprite = pre;
    room.container.addChild(pre);
    return;
  }
  // フォールバック: canvas経由で非同期ロード（アップロード直後等）
  const img = new Image();
  img.onload = () => {
    if (!room || room.name !== roomName) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 660;
      canvas.height = img.naturalHeight || 480;
      canvas.getContext('2d').drawImage(img, 0, 0);
      const base = PIXI.BaseTexture.from(canvas);
      const tex = new PIXI.Texture(base);
      const sp = new PIXI.Sprite(tex);
      sp.zIndex = 6;
      sp.eventMode = 'none';
      sp.width = 660;
      sp.height = 480;
      room.dirBgSprite = sp;
      room.container.addChild(sp);
    } catch (_e) {}
  };
  img.src = url;
}

function updateDirectionGateTints(roomName) {
  const sprites = directionGateSprites[roomName];
  if (!sprites) return;
  sprites.forEach((gs, i) => {
    if (!gs) return;
    gs.tint = (directionGateRooms[roomName] || [])[i] ? MUGEN_GATE_TINTS[i] : MUGEN_GATE_TINT_EMPTY;
  });
}

function onDirectionGateClick(roomName, gateIndex) {
  const gateList = directionGateRooms[roomName] || [null, null, null, null];
  if (gateList[gateIndex]) {
    _directionGateBeingEntered = { roomName, gateIndex };
    _prevRoomSpot = _roomToSpot(roomName);
    goSelfToRoomSpot('userRoom:' + gateList[gateIndex]);
  } else {
    showDirectionGateCreateDialog(roomName, gateIndex);
  }
}

async function showDirectionGateCreateDialog(roomName, gateIndex) {
  const newRoomName = await _showCreateRoomConfirm();
  if (newRoomName === null) return;
  _newRoomGateIndex = gateIndex;
  _newRoomParentDirection = roomName;
  _prevRoomName = roomName;
  try {
    const res = await fetch('/api/direction/' + encodeURIComponent(roomName) + '/gates/' + gateIndex, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorToken: myToken, name: newRoomName })
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 409) {
        if (!directionGateRooms[roomName]) directionGateRooms[roomName] = [null, null, null, null];
        directionGateRooms[roomName][gateIndex] = data.room_id;
        updateDirectionGateTints(roomName);
        _directionGateBeingEntered = { roomName, gateIndex };
        _prevRoomSpot = _roomToSpot(roomName);
        goSelfToRoomSpot('userRoom:' + data.room_id);
      } else {
        alert(data.error || '部屋の作成に失敗しました');
      }
      return;
    }
    _isNewRoomMode = true;
    _pendingOpenEditPanel = true;
    _pendingRoomName = newRoomName;
    if (!directionGateRooms[roomName]) directionGateRooms[roomName] = [null, null, null, null];
    directionGateRooms[roomName][gateIndex] = data.id;
    updateDirectionGateTints(roomName);
    _prevRoomSpot = _roomToSpot(roomName);
    goSelfToRoomSpot('userRoom:' + data.id);
  } catch (_e) {
    alert('通信エラーが発生しました');
  }
}

function _roomToSpot(roomName) {
  const m = { 'エントランス': 'entranceMainSpot', '草原': 'entranceCloud1', 'うちゅー': 'outerSpaceMainSpot', '星1': 'star1EntrySpot', '文字の部屋': '文字の部屋EntrySpot', '粉の部屋': '粉の部屋EntrySpot', 'むげんのいりぐち': 'mugenEntrySpot', 'むげん': 'mugenMainSpot', '東の部屋': '東の部屋Spot', '南の部屋': '南の部屋Spot', '西の部屋': '西の部屋Spot', '北の部屋': '北の部屋Spot' };
  return m[roomName] || ('userRoom:' + roomName);
}

let _roomEditPwPromptPending = false;
function _showRoomPwPrompt() {
  if (_roomEditPwPromptPending) return Promise.resolve(null);
  _roomEditPwPromptPending = true;
  return new Promise(resolve => {
    const modal = document.getElementById('roomEditPwModal');
    const input = document.getElementById('roomEditPwModalInput');
    const ok = document.getElementById('roomEditPwModalOk');
    const cancel = document.getElementById('roomEditPwModalCancel');
    const toggle = document.getElementById('roomEditPwModalToggle');
    const err = document.getElementById('roomEditPwModalErr');
    input.value = '';
    input.type = 'password';
    err.style.display = 'none';
    modal.style.display = 'flex';
    setTimeout(() => input.focus(), 50);
    const cleanup = (result) => {
      _roomEditPwPromptPending = false;
      modal.style.display = 'none';
      ok.removeEventListener('click', onOk);
      cancel.removeEventListener('click', onCancel);
      toggle.removeEventListener('click', onToggle);
      input.removeEventListener('keydown', onKey);
      resolve(result);
    };
    const onOk = () => cleanup(input.value);
    const onCancel = () => cleanup(null);
    const onToggle = () => { input.type = input.type === 'password' ? 'text' : 'password'; };
    const onKey = e => {
      if (e.key === 'Enter') onOk();
      else if (e.key === 'Escape') onCancel();
    };
    ok.addEventListener('click', onOk);
    cancel.addEventListener('click', onCancel);
    toggle.addEventListener('click', onToggle);
    input.addEventListener('keydown', onKey);
  });
}

let _createRoomConfirmPending = false;
async function _showCreateRoomConfirm() {
  if (_createRoomConfirmPending) return null;
  _createRoomConfirmPending = true;
  const modal = document.getElementById('createRoomConfirmModal');
  const input = document.getElementById('createRoomNameInput');
  const yes = document.getElementById('createRoomConfirmYes');
  const no = document.getElementById('createRoomConfirmNo');
  const baseName = 'By ' + (localStorage.getItem('userName') || 'player') + ' room';
  let defaultName = baseName;
  try {
    const _allR = await fetch('/api/rooms').then(r => r.ok ? r.json() : []).catch(() => []);
    const existingNames = new Set(_allR.map(r => r.name));
    let n = 2;
    while (existingNames.has(defaultName)) { defaultName = baseName + n++; }
  } catch (_e) {}
  input.value = '';
  input.placeholder = defaultName;
  modal.style.display = 'flex';
  setTimeout(() => input.focus(), 50);
  return new Promise(resolve => {
    const cleanup = (result) => {
      _createRoomConfirmPending = false;
      modal.style.display = 'none';
      yes.removeEventListener('click', onYes);
      no.removeEventListener('click', onNo);
      input.removeEventListener('keydown', onKey);
      resolve(result);
    };
    const onYes = () => {
      cleanup(input.value.trim() || defaultName);
    };
    const onNo = () => cleanup(null);
    const onKey = e => {
      if (e.key === 'Enter') onYes();
      else if (e.key === 'Escape') onNo();
    };
    yes.addEventListener('click', onYes);
    no.addEventListener('click', onNo);
    input.addEventListener('keydown', onKey);
  });
}

async function _warpPortalCreateRoom() {
  if (document.getElementById('roomEditPanel').style.display !== 'none') return;
  const roomName = await _showCreateRoomConfirm();
  if (roomName === null) return;
  try {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roomName, creatorToken: myToken }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || '部屋の作成に失敗しました'); return; }
    _isNewRoomMode = true;
    _pendingOpenEditPanel = true;
    _pendingRoomName = roomName;
    _prevRoomSpot = _roomToSpot(room.name);
    goSelfToRoomSpot('userRoom:' + data.id);
  } catch (_e) {
    alert('通信エラーが発生しました');
  }
}

// DB部屋画像
async function loadDbImages(roomId) {
  try {
    const res = await fetch('/api/rooms/' + encodeURIComponent(roomId) + '/images');
    if (!res.ok) return;
    const newImages = await res.json();
    clearDbImages();
    dbRoomImages = newImages;
    drawDbImages();
    await _loadPlatformPixelData();
  } catch (_e) {}
}

function drawDbImages() {
  if (!room) return;
  dbRoomImages.forEach((img, i) => {
    const sprite = PIXI.Sprite.from(img.url);
    sprite.eventMode = 'none';
    if (img.x != null) sprite.x = img.x;
    if (img.y != null) sprite.y = img.y;
    const _setSize = () => {
      if (img.width || img.height) {
        if (img.width) sprite.width = img.width;
        if (img.height) sprite.height = img.height;
      } else if (img.type === 'background') {
        const tw = sprite.texture.width || 660;
        const th = sprite.texture.height || 460;
        const scale = Math.min(660 / tw, 460 / th, 1);
        sprite.width = tw * scale;
        sprite.height = th * scale;
      }
    };
    if (sprite.texture.baseTexture.valid) {
      _setSize();
    } else {
      sprite.texture.baseTexture.once('loaded', _setSize);
    }
    if (img.type === 'background') {
      sprite.zIndex = i - 100;
    } else if (img.type === 'object') {
      sprite.zIndex = sprite.y + sprite.height;
    } else {
      sprite.zIndex = i - 50;
    }
    room.container.addChild(sprite);
    dbImageSprites.push(sprite);
  });

  if (_dbImageZIndexTicker) { app.ticker.remove(_dbImageZIndexTicker); }
  _dbImageZIndexTicker = () => {
    for (let i = 0; i < dbImageSprites.length; i++) {
      if (dbRoomImages[i]?.type === 'object') {
        dbImageSprites[i].zIndex = dbImageSprites[i].y + dbImageSprites[i].height;
      }
    }
    for (let i = 0; i < _warpGateSprites.length; i++) {
      const s = _warpGateSprites[i];
      s.zIndex = s.y + s.height;
    }
    for (let i = 0; i < _warpEditOverlays.length; i++) {
      const ov = _warpEditOverlays[i];
      const z = ov.sprite.zIndex;
      ov.borderGfx.zIndex = z + 0.5;
      ov.handleGfx.zIndex = z + 1;
    }
    for (let i = 0; i < _imgOverlays.length; i++) {
      const ov = _imgOverlays[i];
      const z = ov.sprite.zIndex;
      ov.borderGfx.zIndex = z + 0.5;
      ov.handleGfx.zIndex = z + 1;
    }
  };
  app.ticker.add(_dbImageZIndexTicker);
}

function clearDbImages() {
  if (_dbImageZIndexTicker) { app.ticker.remove(_dbImageZIndexTicker); _dbImageZIndexTicker = null; }
  dbImageSprites.forEach(s => { if (s.parent) s.parent.removeChild(s); });
  dbImageSprites.length = 0;
  dbRoomImages = [];
  _platformPixelData = [];
}

async function _loadPlatformPixelData() {
  _platformPixelData = [];
  const platforms = dbRoomImages.filter(img => img.type === 'platform');
  if (platforms.length === 0) return;
  await Promise.all(platforms.map(img => new Promise(resolve => {
    const x = img.x ?? 0, y = img.y ?? 0;
    const w = img.width ?? 0, h = img.height ?? img.width ?? 0;
    if (w <= 0 || h <= 0) { resolve(); return; }
    const image = new Image();
    image.onload = () => {
      const srcW = image.naturalWidth;
      const srcH = image.naturalHeight;
      let imgData = null;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = srcW;
        canvas.height = srcH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        imgData = ctx.getImageData(0, 0, srcW, srcH).data;
      } catch (_e) {}
      _platformPixelData.push({ rect: { x, y, w, h }, imgData, srcW, srcH });
      resolve();
    };
    image.onerror = () => {
      _platformPixelData.push({ rect: { x, y, w, h }, imgData: null, srcW: 0, srcH: 0 });
      resolve();
    };
    image.src = img.url;
  })));
}

function _getPlatformZones() {
  if (!_inUserRoom) return null;
  return _platformPixelData.length > 0 ? _platformPixelData : null;
}

function _isOnAnyPlatform(ax, ay, zones) {
  return zones.some(z => {
    const r = z.rect;
    if (ax < r.x || ax > r.x + r.w || ay < r.y || ay > r.y + r.h) return false;
    if (!z.imgData) return true;
    const px = Math.floor((ax - r.x) / r.w * z.srcW);
    const py = Math.floor((ay - r.y) / r.h * z.srcH);
    if (px < 0 || py < 0 || px >= z.srcW || py >= z.srcH) return false;
    return z.imgData[(py * z.srcW + px) * 4 + 3] > 127;
  });
}

// カスタムコード sandbox実行
function _execCustomCodeInFrame(code) {
  clearCustomCode();
  customCodeContainer = new PIXI.Container();
  customCodeContainer.zIndex = 500;
  if (room) room.container.addChild(customCodeContainer);
  window.customStage = customCodeContainer;
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  frame.style.display = 'none';
  document.body.appendChild(frame);
  customCodeFrame = frame;
  const safeCode = code.replace(/<\/script>/gi, '<\\/script>');
  frame.srcdoc = `<!DOCTYPE html><html><body><script>try{${safeCode}}catch(e){parent.postMessage({type:'customCodeError',error:e.message},'*');}<\/script></body></html>`;
  setTimeout(() => { if (customCodeFrame === frame) { frame.remove(); customCodeFrame = null; } }, 5000);
}

async function runCustomCode(roomId) {
  try {
    const res = await fetch('/api/rooms/' + encodeURIComponent(roomId) + '/code');
    if (!res.ok) return;
    const d = await res.json();
    if (d.custom_code) _execCustomCodeInFrame(d.custom_code);
  } catch (_e) {}
}

function clearCustomCode() {
  if (customCodeFrame) { customCodeFrame.remove(); customCodeFrame = null; }
  if (customCodeContainer) {
    if (customCodeContainer.parent) customCodeContainer.parent.removeChild(customCodeContainer);
    customCodeContainer.destroy({ children: true });
    customCodeContainer = null;
  }
}

window.addEventListener('message', e => {
  if (e.data && e.data.type === 'customCodeError') {
    console.warn('[カスタムコード]', e.data.error);
    const el = document.getElementById('codeMsg');
    if (el) { el.textContent = 'エラー: ' + e.data.error; el.style.color = '#f88'; }
  }
});

// 配信機能
const QUALITY_CONSTRAINTS = {
  max:    { width: { ideal: 7680 }, height: { ideal: 4320 }, frameRate: { ideal: 120 } },
  high:   { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } },
  normal: { width: { ideal: 640 },  height: { ideal: 480 },  frameRate: { ideal: 30 } },
  low:    { width: { ideal: 160 },  height: { ideal: 120 },  frameRate: { ideal: 10 } },
};
const QUALITY_BITRATE = { max: undefined, high: 1000000, normal: 400000, low: 100000 };
const QUALITY_ORDER = ['low', 'normal', 'high', 'max'];
let streamQualityLevel = localStorage.getItem('streamQualityLevel') || 'max';
let receiverQualityLevel = localStorage.getItem('receiverQuality') || 'max';
let multiCameraEnabled = localStorage.getItem('multiCameraEnabled') === 'true';
let cameraSelectMode = localStorage.getItem('cameraSelectMode') || 'always';
let cameraDeviceId = localStorage.getItem('cameraDeviceId') || '';
let cameraDeviceLabel = localStorage.getItem('cameraDeviceLabel') || '';
let micSelectMode = localStorage.getItem('micSelectMode') || 'always';
let micDeviceId = localStorage.getItem('micDeviceId') || '';
let micDeviceLabel = localStorage.getItem('micDeviceLabel') || '';
let cameraPickerPreview = localStorage.getItem('cameraPickerPreview') === 'true';


let localStream = null;//自分のとこのメディア情報
let localVideoTrack;//自分のとこのメディア情報
let localAudioTrack;//自分のとこのメディア情報

let _audioCtx = null;
let _audioGainNode = null;
let _audioAnalyser = null;
let _audioRawStream = null;
let _audioBoostEnabled = localStorage.getItem("micBoost") === "true";
const AUDIO_BOOST_VALUE = 3.0;
let _audioVizRafId = null;
let _rnnoiseEnabled = localStorage.getItem("useRNNoise") === "true";
let _rnnoiseWorkletNode = null;
let _rnnoiseWorkletReady = false;
let _highpassEnabled = localStorage.getItem("lowCut") === "true";
let _highpassNode = null;

let _remoteAudioCtx = null;
const _remoteAnalysers = {};
const _remoteVizBases = {};
const _remoteVizBars = {};
const _remoteVizRafIds = {};

let videoStatus = false;
let audioStatus = false;
let roomStream;

// 追加カメラ (n=2..MAX_CAMS)
// _xcam[n].status, .stream, .track, .deviceId, .button{}, .buttonFlag{}, .remoteStream{}, .streamId{}, .previewStream
const MAX_CAMS = 10;
const _xcam = {};
function _xcamGet(n) {
  if (!_xcam[n]) _xcam[n] = { status: false, stream: null, track: null, deviceId: '', button: {}, buttonFlag: {}, remoteStream: {}, streamId: {}, previewStream: null };
  return _xcam[n];
}
let _pendingExtraCameraIds = {};
const _pendingRemoteVideoStreams = {}; // { fromToken: { streamId: stream } } ontrack/createVideoButtonNのレースコンディション対策
// cam2+ のデバイスID を localStorage から復元（中飛びを許容するため break しない）
for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
  const _savedId = localStorage.getItem('cameraDeviceId_' + _cn);
  if (_savedId) _xcamGet(_cn).deviceId = _savedId;
}

let mapPeer = new Map();

const mediaElement = [];
const distributor = [];
const videoButton = [];
const audioButton = [];
const audioVolume = [];
const videoButtonFlag = [];
const audioButtonFlag = [];
let checkAllListen;

const videoArray = {};
const videoArrayWrapper = {};
const videoHandles = {};
const videoOverlays = {};
let videoFlag = true;
let videoMaxFlag = true;

const peerConnections = [];
const remoteAudios = [];
const MAX_CONNECTION_COUNT = 50;//最大接続数？？

const stream = [];

// let num = 0;
// let myScreenW = [];
// let myVideoW = [];
//#endregion

// 最初のユーザー操作（タップやクリック）があった時に「muonAudio」を再生する.
// スマホやブラウザの自動再生制限を回避するための処理
document.addEventListener('pointerdown', () => {
  document.getElementById("muonAudio").play();
  if (!ttsAudioCtx) ttsAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  ttsAudioCtx.resume();
}, {
  capture: false, // イベントキャプチャフェーズではなくバブリングフェーズで実行
  once: true,     // 最初の1回だけ実行
  passive: true,  // パフォーマンス向上のため、イベントのデフォルト動作を妨げない
});

//タイトル(NocojectMachi)をランダムで表示
title.style.fontFamily = titleFontFamily[Math.floor(Math.random() * titleFontFamily.length)];
// title.style.fontSize = fontSize + 37 + "px";

const mainLogResizeBar = document.getElementById("mainLogResizeBar");

// ドラッグで高さ変更
let isResizing = false;
let startY = 0;
let startHeight = 0;

mainLogResizeBar.addEventListener("pointerdown", e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  isResizing = true;
  startY = e.clientY;
  startHeight = mainLog.offsetHeight;
  document.body.style.cursor = "ns-resize";
  e.target.setPointerCapture(e.pointerId);
  e.preventDefault();
});

window.addEventListener("pointermove", e => {
  if (!isResizing) return;
  const dy = e.clientY - startY;
  const fontSize = parseInt(localStorage.getItem("fontSize")) || 16;
  let newHeight = Math.max(fontSize, startHeight + dy); // 最小fontSize
  mainLog.style.height = newHeight + "px";
  mainLogFrame.style.height = newHeight + "px";
});

window.addEventListener("pointerup", e => {
  if (isResizing) {
    isResizing = false;
    document.body.style.cursor = "";
    localStorage.setItem("mainLogHeight", mainLog.offsetHeight);
  }
});

let nameTextStyle = new PIXI.TextStyle({//名前のスタイル
  fontFamily: "JKゴシックM",
  fontSize: 18,
  fill: "white",
  trim: true,
});
document.fonts.load('18px "JKゴシックM"').then(() => {
  for (const tk in avaP) {
    const nt = avaP[tk]?.nameText;
    if (nt) nt.text = nt.text;
  }
});

// let msgStyle =new PIXI.TextStyle({//メッセージのスタイル
//   fontFamily: "Arial",
//   fontSize: 18,
// fill: "white",
// stroke: '#ff3300',
// strokeThickness: 4,
// dropShadow: true,
// dropShadowColor: "#000000",
// dropShadowBlur: 4,
// dropShadowAngle: Math.PI / 6,
// dropShadowDistance: 6,
// });

// #region 読み込み関係

//webGL(Canvasの設定)
// レンダラーのcanvasをDOMに追加する
const myCanvas = document.createElement('canvas');
let app = new PIXI.Application({
  view: myCanvas,
  width: 660,
  height: 460,
});
graphic.appendChild(myCanvas);
app.stage.sortableChildren = true;//子要素のzIndexをonにする。
window.app = app;

// 全avaLoop完了後・PIXI描画前に他アバターに乗ってるアバターのzIndexを修正
app.ticker.add(() => {
  for (const ava of Object.values(avaP)) {
    if (!ava.ridingObject?.token) continue;
    if (!ava.container.parent?.parent) continue; // stageに繋がっていないアバターはスキップ
    const newZ = (ava.ridingObject.container || ava.ridingObject).zIndex - 1;
    if (ava.container.zIndex !== newZ) {
      ava.container.zIndex = newZ;
      ava.lastZIndex = newZ;
    }
  }
}, null, -10);

// むげん・方角部屋のワープ後 dead reckoning（tapMap受信フレームでGSAPが未起動のまま1フレーム止まる問題を解消）
app.ticker.add((delta) => {
  if (!room || (room.name !== 'むげん' && !_DIR_ROOM_NAMES.has(room.name))) return;
  const _drFloorH = room.name === 'むげん' && Object.keys(videoFloorObjects).length > 0 ? Math.max(...Object.values(videoFloorObjects).map(f => f._pixiH || VIDEO_FLOOR_H)) : 0;
  const _drMaxY = _drFloorH > 0 ? VIDEO_FLOOR_Y + _drFloorH : 460;
  const _drNow = performance.now();
  for (const ava of Object.values(avaP)) {
    if (!ava._mugenDR || ava.token === myToken) continue;
    if (_drNow - ava._mugenDR.t > 120) { ava._mugenDR = null; continue; }
    ava.container.x += ava._mugenDR.vx * delta;
    ava.container.y += ava._mugenDR.vy * delta;
    if (ava._mugenDR.tx !== undefined) {
      const _cx = ava._mugenDR.tx - ava.container.x;
      const _cy = ava._mugenDR.ty - ava.container.y;
      if (Math.abs(_cx) < 50) ava.container.x += _cx * 0.15 * delta;
      if (Math.abs(_cy) < 50) ava.container.y += _cy * 0.15 * delta;
    }
    if (ava.container.x < 0) ava.container.x += 660;
    else if (ava.container.x > 660) ava.container.x -= 660;
    if (ava.container.y < 0) ava.container.y += _drMaxY;
    else if (ava.container.y > _drMaxY) ava.container.y -= _drMaxY;
  }
}, null, -0.3);

// 全priority-0コールバック（avaLoop・keyMoveTickerFn）完了後・描画直前にzIndexを同期
app.ticker.add(() => {
  for (const ava of Object.values(avaP)) {
    if (ava.abon) continue;
    if (ava.ridingObject?.token) continue;
    if (!ava.container.parent?.parent) continue; // stageに繋がっていないアバターはスキップ
    if (!ava._tokenZBias) {
      ava._tokenZBias = ava.token.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 1000 / 1000000000;
    }
    let zBase;
    if (room && room.name === "エントランス") {
      const avatarY = ava.container.y;
      const col = Math.min(Math.max(0, Math.round(ava.container.x)), 659);
      if (!ava.is2F) {
        const ld = leftPoleDepthMapSmoothed ? leftPoleDepthMapSmoothed[col] : -1;
        const rd = rightPoleDepthMapSmoothed ? rightPoleDepthMapSmoothed[col] : -1;
        const refDepth = ld >= 0 ? ld : rd;
        zBase = (refDepth >= 0 && refDepth < avatarY) ? 130 : 50;
      } else {
        const refDepth2 = bridgeDepthMapSmoothed ? bridgeDepthMapSmoothed[col] : -1;
        if (ava._zone2F === undefined) {
          ava._zone2F = (refDepth2 >= 0 && refDepth2 > avatarY) ? 200 : 300;
        } else if (refDepth2 >= 0) {
          if (ava._zone2F === 300) {
            if (refDepth2 - 5 > avatarY) ava._zone2F = 200;
          } else {
            if (refDepth2 + 5 <= avatarY) ava._zone2F = 300;
          }
        }
        zBase = ava._zone2F ?? 300;
      }
      // zone内の上下順はy/10000で保持（zone間の差50に対し最大0.05未満）
      const zFinal = zBase + avatarY / 10000 + ava._tokenZBias;
      if (ava.lastZIndex !== zFinal) {
        ava.container.zIndex = zFinal;
        ava.lastZIndex = zFinal;
      }
    } else {
      const zFinal = ava.container.y + ava._tokenZBias;
      if (ava.lastZIndex !== zFinal) {
        ava.container.zIndex = zFinal;
        ava.lastZIndex = zFinal;
      }
    }
  }
  _updateMugenGhosts();
}, null, -0.5);

//スマホで画面に表示するテキスト
let overlayChatStyle = {
  fontSize: 18,
  wordWrap: true,
  wordWrapWidth: 500,
  breakWords: true,
};
const overlayChat = new PIXI.Container();
overlayChat.eventMode = "none";
overlayChat.zIndex = 1000;
app.stage.addChild(overlayChat);

let avaBubbleLayer = null;

/**
 * PIXI.Textureからカラライズ済みアイコン画像のDataURLを生成する関数
 * @param {PIXI.Texture} texture - アイコン用のPIXI.Texture
 * @param {number} color - 16進数カラーコード（例: 0xf8b0fb）
 * @param {number} [width=40] - アイコンの幅
 * @param {number} [height=40] - アイコンの高さ
 * @returns {string} - DataURL（img.srcに使える）
 */
function createColoredIconDataURL(texture, color) {
  // 一時的なPIXI.Application（オフスクリーン用）
  const tmpApp = new PIXI.Application({
    width: texture.width,
    height: texture.height,
    preserveDrawingBuffer: true, // DataURL取得のため
    backgroundAlpha: 0,
  });

  // スプライト生成＆色適用
  const sprite = new PIXI.Sprite(texture);
  sprite.width = texture.width;
  sprite.height = texture.height;
  sprite.tint = color;
  tmpApp.stage.addChild(sprite);

  // レンダリングしてDataURL取得
  tmpApp.renderer.render(tmpApp.stage);
  let dataURL = tmpApp.renderer.extract.base64(tmpApp.stage);

  // 後始末
  tmpApp.destroy(true, { children: true });

  // DataURLを返す
  return dataURL;
}

// アバターごと・色ごとのキャッシュ
const avatarIconCache = {};

// 色変更時やアバター生成時に一度だけ生成
async function getAvatarIconDataURL(aspect, color) {
  const cacheKey = aspect + "_" + color;
  if (!avatarIconCache[cacheKey]) {
    let iconTexture;
    switch (aspect) {
      case "gomanecoMono":
        iconTexture = gomanecoMono.icon;
        break;
      case "necosukeMono":
        iconTexture = necosukeMono.icon;
        break;
      case "gomaneco":
        iconTexture = gomaneco.icon;
        break;
      case "necosuke":
        iconTexture = necosuke.icon;
        break;
    }
    avatarIconCache[cacheKey] = createColoredIconDataURL(iconTexture, color);
  }
  return avatarIconCache[cacheKey];
}

function parseColorCode(colorString) {
  if (!colorString) return 0xFFFF1A;

  if (colorString.startsWith("0x")) {
    return parseInt(colorString, 16);
  }
  if (colorString.startsWith("#")) {
    return parseInt(colorString.slice(1), 16);
  }
  const parsed = parseInt(colorString, 10);
  if (!isNaN(parsed)) {
    return parsed;
  }
  return false;
}

(async () => {
  const assets = await PIXI.Assets.load(['img/allgraphics.png', 'img/roomAtlas.png', 'img/objectAtlas.png', 'img/sample/GATE.png']);
  setUp(assets);
})();
// #endregion

async function setUp(assets) {//画像読み込み後の処理はここに書いていく
  // サーバーから全画像分のポリゴンデータを取得し、画像名ごとにPIXI.Graphicsで可視化・hitArea設定
  let roomAtlasLayout = {};
  let objectAtlasLayout = {};
  try {
    const [polygonRes, atlasRes, objAtlasRes] = await Promise.all([
      fetch('/polygon'),
      fetch('/roomAtlas'),
      fetch('/objectAtlas'),
    ]);
    const data = await polygonRes.json();
    roomAtlasLayout = await atlasRes.json();
    objectAtlasLayout = await objAtlasRes.json();

    if (!data || typeof data !== 'object') {
      console.error('ポリゴンデータがありません');
    } else {
      // polygonsオブジェクトに画像名（拡張子抜き）をキー、値をポリゴン配列として格納
      Object.entries(data).forEach(([imgName, polyArrs]) => {
        const key = imgName.replace(/\.png$/i, '');// 画像名から拡張子を除去
        polygons[key] = polyArrs;
      });
    }
    socket.emit("getMyUser", {});
    setUpFlag[0] = true;
  } catch (err) {
    console.error('初期データ取得失敗:', err);
    socket.emit("getMyUser", {});
    setUpFlag[0] = true;
  }

  const baseTex = assets['img/allgraphics.png'].baseTexture;

  //アバターのベース画像を作る※Rectangleをぴったり同じ大きさの画像に使ったらバグるので注意
  gomaneco.S = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 41, 40, 70));//左上側からのx、y、幅、高さ
  gomaneco.S1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 111, 40, 70));

  gomaneco.SW = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 181, 40, 70));
  gomaneco.SW1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 251, 40, 70));
  gomaneco.SW2 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 321, 40, 70));

  gomaneco.W = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 391, 40, 70));
  gomaneco.W1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 461, 40, 70));
  gomaneco.W2 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 531, 40, 70));

  gomaneco.NW = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 601, 40, 70));
  gomaneco.NW1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 671, 40, 70));
  gomaneco.NW2 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 741, 40, 70));

  gomaneco.N = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 811, 40, 70));
  gomaneco.N1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 881, 40, 70));

  gomaneco.sit = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 951, 40, 70));

  gomaneco.Sleep0 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 1021, 40, 70));
  gomaneco.Sleep1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 1091, 40, 70));
  gomaneco.Sleep2 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 1161, 40, 70));
  gomaneco.Sleep3 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1320.4, 1231, 40, 70));

  gomanecoMono.S = new PIXI.Texture(baseTex, new PIXI.Rectangle(1360, 41, 40, 70));
  gomanecoMono.S1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1360, 111, 40, 70));

  gomanecoMono.SW = new PIXI.Texture(baseTex, new PIXI.Rectangle(1360, 181, 40, 70));
  gomanecoMono.SW1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1360, 251, 40, 70));
  gomanecoMono.SW2 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1360, 321, 40, 70));

  gomanecoMono.W = new PIXI.Texture(baseTex, new PIXI.Rectangle(1360, 391, 40, 70));
  gomanecoMono.W1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1360, 461, 40, 70));
  gomanecoMono.W2 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1360, 531, 40, 70));

  gomanecoMono.NW = new PIXI.Texture(baseTex, new PIXI.Rectangle(1360, 601, 40, 70));
  gomanecoMono.NW1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1360, 671, 40, 70));
  gomanecoMono.NW2 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1360, 741, 40, 70));

  gomanecoMono.N = new PIXI.Texture(baseTex, new PIXI.Rectangle(1360, 811, 40, 70));
  gomanecoMono.N1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1360, 881, 40, 70));

  gomanecoMono.sit = new PIXI.Texture(baseTex, new PIXI.Rectangle(1360, 950, 40, 69));

  gomanecoMono.Sleep0 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1321, 1021, 39, 70));
  gomanecoMono.Sleep1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1321, 1091, 39, 70));
  gomanecoMono.Sleep2 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1321, 1161, 39, 70));
  gomanecoMono.Sleep3 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1321, 1231, 39, 70));

  necosuke.S = new PIXI.Texture(baseTex, new PIXI.Rectangle(1402, 41, 49, 78.8));
  necosuke.S1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1402, 121, 49, 78.8));

  necosuke.SW = new PIXI.Texture(baseTex, new PIXI.Rectangle(1402, 201, 49, 78.8));
  necosuke.SW1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1402, 281, 49, 78.8));
  necosuke.SW2 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1402, 361, 49, 78.8));

  necosuke.W = new PIXI.Texture(baseTex, new PIXI.Rectangle(1402, 441, 49, 78.8));
  necosuke.W1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1402, 521, 49, 78.8));
  necosuke.W2 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1402, 601, 49, 78.8));

  necosuke.NW = new PIXI.Texture(baseTex, new PIXI.Rectangle(1402, 681, 49, 78.8));
  necosuke.NW1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1402, 761, 49, 78.8));
  necosuke.NW2 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1402, 841, 49, 78.8));

  necosuke.N = new PIXI.Texture(baseTex, new PIXI.Rectangle(1402, 921, 49, 78.8));
  necosuke.N1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1402, 1001, 49, 78.8));

  necosuke.sit = new PIXI.Texture(baseTex, new PIXI.Rectangle(1402, 1081, 49, 80));

  necosukeMono.S = new PIXI.Texture(baseTex, new PIXI.Rectangle(1450, 41, 49, 78.8));
  necosukeMono.S1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1450, 121, 49, 78.8));

  necosukeMono.SW = new PIXI.Texture(baseTex, new PIXI.Rectangle(1450, 201, 49, 78.8));
  necosukeMono.SW1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1450, 281, 49, 78.8));
  necosukeMono.SW2 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1450, 361, 49, 78.8));

  necosukeMono.W = new PIXI.Texture(baseTex, new PIXI.Rectangle(1450, 441, 49, 78.8));
  necosukeMono.W1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1450, 521, 49, 78.8));
  necosukeMono.W2 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1450, 601, 49, 78.8));

  necosukeMono.NW = new PIXI.Texture(baseTex, new PIXI.Rectangle(1450, 681, 49, 78.8));
  necosukeMono.NW1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1450, 761, 49, 78.8));
  necosukeMono.NW2 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1450, 841, 49, 78.8));

  necosukeMono.N = new PIXI.Texture(baseTex, new PIXI.Rectangle(1450, 921, 49, 78.8));
  necosukeMono.N1 = new PIXI.Texture(baseTex, new PIXI.Rectangle(1450, 1001, 49, 78.8));

  necosukeMono.sit = new PIXI.Texture(baseTex, new PIXI.Rectangle(1450, 1080, 49, 80));

  gomaneco.icon = new PIXI.Texture(baseTex, new PIXI.Rectangle(1321, 0, 40, 39));
  necosuke.icon = new PIXI.Texture(baseTex, new PIXI.Rectangle(1402, 42, 49, 40));
  gomanecoMono.icon = new PIXI.Texture(baseTex, new PIXI.Rectangle(1362, 40, 39, 39));
  necosukeMono.icon = new PIXI.Texture(baseTex, new PIXI.Rectangle(1450, 42, 49, 40));

  abonTexture = new PIXI.Texture(baseTex, new PIXI.Rectangle(1500, 0, 40, 70));

  //部屋のベース画像を作る
  //エントランス画面（roomAtlasから生成）
  const atlasTex = assets['img/roomAtlas.png'].baseTexture;
  const el = roomAtlasLayout['entrance'];
  entranceImg = new PIXI.Sprite(new PIXI.Texture(atlasTex, new PIXI.Rectangle(el.x, el.y, el.w, el.h)));
  //草原画面の背景（スプライトシートの右半分）
  entrance = new PIXI.Sprite(new PIXI.Texture(baseTex, new PIXI.Rectangle(660, 0, 660, 480)));
  rainbow = new PIXI.Graphics();//ブロックを置く宣言
  meadow = new PIXI.Sprite(new PIXI.Texture(baseTex, new PIXI.Rectangle(0, 0, 660, 480)));
  const cloudBaseTexture = new PIXI.Texture(baseTex, new PIXI.Rectangle(111, 571, 87, 65));
  cloud1 = new PIXI.Sprite(cloudBaseTexture);
  cloud2 = new PIXI.Sprite(cloudBaseTexture);
  bonfire = new PIXI.Sprite(new PIXI.Texture(baseTex, new PIXI.Rectangle(248, 728, 150, 120)));
  daikokubasira = new PIXI.Sprite(new PIXI.Texture(baseTex, new PIXI.Rectangle(1500, 70, 50, 100)));
  //オブジェクトアトラスからスプライト生成
  const objAtlasTex = assets['img/objectAtlas.png'].baseTexture;
  const bridgeLayoutEntries = [];
  for (let i = 0; objectAtlasLayout['bridge' + i]; i++) {
    const bl = objectAtlasLayout['bridge' + i];
    bridgeLayoutEntries.push(bl);
    const spr = new PIXI.Sprite(new PIXI.Texture(objAtlasTex, new PIXI.Rectangle(bl.x, bl.y, bl.w, bl.h)));
    if (i === 0) bridge0 = spr;
    else if (i === 1) bridge1 = spr;
    else if (i === 2) bridge2 = spr;
  }
  const poleAtlasLayouts = {};
  for (const key of ['leftPole', 'rightPole']) {
    if (objectAtlasLayout[key]) {
      const bl = objectAtlasLayout[key];
      const spr = new PIXI.Sprite(new PIXI.Texture(objAtlasTex, new PIXI.Rectangle(bl.x, bl.y, bl.w, bl.h)));
      if (key === 'leftPole') leftPole = spr;
      else rightPole = spr;
      poleAtlasLayouts[key] = bl;
    }
  }
  if (bridgeLayoutEntries.length > 0 || Object.keys(poleAtlasLayouts).length > 0) {
    const img = new Image();
    img.src = 'img/objectAtlas.png';
    img.onload = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = img.width;
      offscreen.height = img.height;
      const ctx = offscreen.getContext('2d', {willReadFrequently: true});
      ctx.drawImage(img, 0, 0);
      for (let i = 0; i < bridgeLayoutEntries.length; i++) {
        const bl = bridgeLayoutEntries[i];
        const imgData = ctx.getImageData(bl.x, bl.y, bl.w, bl.h);
        const map = new Int16Array(bl.w).fill(-1);
        for (let x = 0; x < bl.w; x++) {
          for (let y = bl.h - 1; y >= 0; y--) {
            if (imgData.data[(y * bl.w + x) * 4 + 3] > 10) {
              map[x] = y;
              break;
            }
          }
        }
        bridgeDepthMaps[i] = map;
      }
      const buildPoleMap = (bl) => {
        const imgData = ctx.getImageData(bl.x, bl.y, bl.w, bl.h);
        const map = new Int16Array(bl.w).fill(-1);
        const BODY_GAP = 20;
        const MAX_FIRST_Y = Math.floor(bl.h * 0.75);
        for (let x = 0; x < bl.w; x++) {
          let bodyBottom = -1, transparentRun = 0, foundFirst = false;
          for (let y = 0; y < bl.h; y++) {
            const alpha = imgData.data[(y * bl.w + x) * 4 + 3];
            if (alpha > 10) {
              if (!foundFirst) { if (y >= MAX_FIRST_Y) break; foundFirst = true; }
              if (bodyBottom >= 0 && transparentRun >= BODY_GAP) break;
              bodyBottom = y; transparentRun = 0;
            } else { if (bodyBottom >= 0) transparentRun++; }
          }
          map[x] = bodyBottom;
        }
        const SMOOTH_W = 10;
        const smoothed = new Int16Array(map.length).fill(-1);
        for (let x = 0; x < map.length; x++) {
          const lo = Math.max(0, x - SMOOTH_W), hi = Math.min(map.length - 1, x + SMOOTH_W);
          let mx = -1;
          for (let cx = lo; cx <= hi; cx++) { if (map[cx] > mx) mx = map[cx]; }
          smoothed[x] = mx;
        }
        return smoothed;
      };
      if (poleAtlasLayouts['leftPole']) {
        leftPoleDepthMapSmoothed = buildPoleMap(poleAtlasLayouts['leftPole']);
      }
      if (poleAtlasLayouts['rightPole']) {
        rightPoleDepthMapSmoothed = buildPoleMap(poleAtlasLayouts['rightPole']);
      }
      if (bridgeDepthMaps[1]) {
        const bm = bridgeDepthMaps[1];
        bridgeDepthMapSmoothed = new Int16Array(bm.length).fill(-1);
        const SMOOTH_W2 = 10;
        for (let x = 0; x < bm.length; x++) {
          const lo = Math.max(0, x - SMOOTH_W2), hi = Math.min(bm.length - 1, x + SMOOTH_W2);
          let mx = -1;
          for (let cx = lo; cx <= hi; cx++) { if (bm[cx] > mx) mx = bm[cx]; }
          bridgeDepthMapSmoothed[x] = mx;
        }
      }
    };
  }
  //うちゅー画面
  outerSpace = new PIXI.Sprite(new PIXI.Texture(baseTex, new PIXI.Rectangle(660, 480, 660, 480)));
  //文字の部屋・粉の部屋・星1
  konaNoHeya = new PIXI.Graphics();
  konaPowderRoom = new PIXI.Graphics();
  star1 = new PIXI.Graphics();
  //むげんのいりぐち・むげん・方角部屋
  mugenIriguchi = new PIXI.Graphics();
  mugenRoom = new PIXI.Graphics();
  dirRoomEast = new PIXI.Graphics();
  dirRoomSouth = new PIXI.Graphics();
  dirRoomWest = new PIXI.Graphics();
  dirRoomNorth = new PIXI.Graphics();
  gateTex = assets['img/sample/GATE.png'];

  // objMap = {
  //   "loginRoom": loginRoom,
  //   "エントランス": entrance,
  //   "草原": meadow,
  //   "雲1": cloud,
  //   "たき火": bonfire,
  //   "虹": rainbow,
  //   "大黒柱": daikokubasira,
  //   "うちゅー": outerSpace,
  //   // "文字の部屋": mozinoheya,
  //   "星1": star1,
  //   // "星2": star2

  // 座標確認用のオブジェクトの表示
  const coordText = new PIXI.Text("", { fontFamily: "serif", fontSize: 12, fill: "blue" });
  const mouseText = new PIXI.Text("", { fontFamily: "serif", fontSize: 12, fill: "red" });

  coordText.position.set(560, 400);
  mouseText.position.set(560, 430);

  coordText.zIndex = 1001;
  mouseText.zIndex = 1001;

  coordText.visible = showCoord;
  mouseText.visible = showCoord;

  app.stage.addChild(coordText);
  app.stage.addChild(mouseText);

  window._coordText = coordText;
  window._mouseText = mouseText;

  app.stage.eventMode = 'static';
  app.stage.on('pointermove', (event) => {
    if (showCoord) {
      coordText.text = `AvatarX: ${AX}\nAvatarY: ${AY}`;
    }
    loginMX = event.global.x;
    loginMY = event.global.y;
    if (showCoord && 0 <= loginMX && loginMX <= 660 && 0 <= loginMY && loginMY <= 460) {
      mouseText.text = `MouseX: ${loginMX}\nMouseY: ${loginMY}`;
    }
  });

  //セッション開始時に入力欄にフォーカスを合わせる
  document.querySelector('input').focus();
  //名前を出力、名前がsubmitされた時にログイン
  nameForm.addEventListener("submit", e => {
    avaP[myToken].nameText.text = (nameForm.userName.value);//名前タグに出力
    e.preventDefault();//画面遷移を防ぐ
    login();
  }, {
    capture: false,
    once: true,
    passive: false,
  });

}//setUpはここで終わり

// 複数のポリゴン配列をまとめてhitAreaに設定する共通関数
// targetSprite: 対象のPIXI.SpriteやPIXI.Graphicsなど
// polygonsArr: [[x1,y1,x2,y2,...], [x1,y1,x2,y2,...], ...] の配列（各要素が1つの多角形）
// hitAreaには「contains(x, y)」という関数を持つオブジェクトをセットできる。
// クリックやマウスイベント時、PIXIが自動で contains(x, y) を呼び、trueなら当たり判定内、falseなら外と判定される。
// ここでは複数のポリゴンのどれか1つでも含まれていればtrueを返す。
// function setMultiPolygonHitArea(targetSprite, polygonsArr) {
//   // polygonsArrから有効な多角形だけを抽出し、PIXI.Polygonインスタンスの配列を作る
//   // 各polyArrは[x1,y1,x2,y2,...]形式で、最低3点(6要素)必要
//   const polygonObjs = polygonsArr
//     .filter(polyArr => Array.isArray(polyArr) && polyArr.length >= 6) // 3点以上の多角形のみ
//     .map(polyArr => new PIXI.Polygon(polyArr)); // PIXI.Polygonに変換

//   // hitAreaには「contains(x, y)」関数＋_polygonsプロパティ（Polygon配列）を持たせる
//   // _polygons: 複数ポリゴンのPIXI.Polygonインスタンス配列（独自判定や座標参照用）
//   // contains: PIXIイベント用の当たり判定関数
//   targetSprite.hitArea = {
//     _polygons: polygonObjs, // 独自用途でPolygon座標列を参照したい場合に使う
//     contains: function (x, y) {
//       // どれか1つでもtrueならtrue（複数ポリゴン対応）
//       return polygonObjs.some(poly => poly.contains(x, y));
//     }
//   };

// setMultiPolygonHitArea関数の詳細デバッグ版
function setMultiPolygonHitArea(targetSprite, polygonsArr) {

  // polygonsArrから有効な多角形だけを抽出し、PIXI.Polygonインスタンスの配列を作る
  const polygonObjs = polygonsArr
    .filter(polyArr => {
      const isValid = Array.isArray(polyArr) && polyArr.length >= 6;
      return isValid;
    })
    .map((polyArr, index) => {
      const polygon = new PIXI.Polygon(polyArr);
      return polygon;
    });

  if (polygonObjs.length === 0) {
    console.warn("有効なポリゴンがありません");
    return;
  }

  // hitAreaには「contains(x, y)」関数＋_polygonsプロパティを持たせる
  targetSprite.hitArea = {
    _polygons: polygonObjs,
    contains: function (x, y) {
      const result = polygonObjs.some(poly => {
        const contains = poly.contains(x, y);
        return contains;
      });
      return result;
    }
  };

}

// 複数ポリゴンをGraphicsで可視化する共通関数,デバッグ用
function drawMultiPolygonGraphics(parent, polygonsArr, lineColor = 0x00ff00, fillColor = 0xff0000, fillAlpha = 0.5) {
  polygonsArr.forEach(polyArr => {
    let g = new PIXI.Graphics();
    parent.addChild(g);
    g.lineStyle(0.5, lineColor, 1);
    g.beginFill(fillColor, fillAlpha);
    g.drawPolygon(polyArr);
    g.endFill();
  });
}

// 2つのPIXIオブジェクトa, bが重なっているかどうかを判定する関数
function hitAB(a, b) {
  const aContainer = a.container || a;
  const bContainer = b.container || b;

  // アバター同士の場合、現在表示中のスプライトのhitAreaを使用
  if (a.token && b.token && b.avaC) {
    const currentSprite = b.avaC;

    if (currentSprite && currentSprite.hitArea) {
      const scaleX = bContainer.scale ? bContainer.scale.x : 1;
      const scaleY = bContainer.scale ? bContainer.scale.y : 1;

      const aLocalX = (aContainer.x - bContainer.x) / scaleX;
      const aLocalY = (aContainer.y - bContainer.y) / scaleY;

      // 拡張された範囲での判定（X軸方向のみ半径15ピクセル）
      return checkExpandedPointInHitAreaX(currentSprite.hitArea, aLocalX, aLocalY, 5);
    }
  }

  // オブジェクトとの判定
  if (bContainer.hitArea) {
    const scaleX = bContainer.scale ? bContainer.scale.x : 1;
    const scaleY = bContainer.scale ? bContainer.scale.y : 1;

    const aLocalX = (aContainer.x - bContainer.x) / scaleX;
    const aLocalY = (aContainer.y - bContainer.y) / scaleY;

    // 拡張された範囲での判定（X軸方向のみ半径20ピクセル）
    return checkExpandedPointInHitAreaX(bContainer.hitArea, aLocalX, aLocalY, 5);
  }

  // hitAreaが指定されていないオブジェクトとの判定
  // 自分（a）を座標として扱い、相手（b）を矩形として扱う
  const bb = bContainer.getBounds();

  // aの座標がbの矩形内に含まれるかを判定
  return aContainer.x >= bb.x &&
    aContainer.x <= bb.x + bb.width &&
    aContainer.y >= bb.y &&
    aContainer.y <= bb.y + bb.height;
}

// X軸方向のみ拡張された点判定関数
function checkExpandedPointInHitAreaX(hitArea, centerX, centerY, radiusX = 10) {
  // 中心点での判定
  if (hitArea.contains && hitArea.contains(centerX, centerY)) {
    return true;
  }
  if (hitArea._polygons) {
    if (hitArea._polygons.some(poly => poly.contains(centerX, centerY))) {
      return true;
    }
  }

  // X軸方向のみの点での判定（左右のみ）
  const checkPoints = [
    [centerX - radiusX, centerY], // 左
    [centerX + radiusX, centerY], // 右
  ];

  for (const [x, y] of checkPoints) {
    if (hitArea.contains && hitArea.contains(x, y)) {
      return true;
    }
    if (hitArea._polygons) {
      if (hitArea._polygons.some(poly => poly.contains(x, y))) {
        return true;
      }
    }
    if (hitArea instanceof PIXI.Polygon && hitArea.contains(x, y)) {
      return true;
    }
  }

  return false;
}

// ========================================================
// 吹き出し（エレクトリカルスタイル）
// msg.text / msg.style.fill を PIXI.Text と同じ感覚で使えるように互換インターフェースを持つ
// ========================================================
class MsgBubble extends PIXI.Container {
  constructor(spriteHeight, avatarColor) {
    super();
    this._spriteHeight = spriteHeight || 60;
    this._avatarColor  = typeof avatarColor === "number" ? avatarColor : 0xffffff;
    this._isLog = false;
    this._textColorOverride = null; // null = アバターカラーを使用
    this._offsetX = 0;
    this._offsetY = 0;
    this._dragging = false;
    this._avatarContainer = null;
    this._lastBx = 0;
    this._lastBy = 0;
    this._overlayTickFn = null;
    this._bg   = new PIXI.Graphics();
    this._text = new PIXI.Text("", { fontSize: 15, fill: 0xffffff, fontFamily: "monospace", padding: 4 });
    this.zIndex = 20;
    this.sortableChildren = true;
    this._bg.zIndex   = 0;
    this._text.zIndex = 1;
    this.addChild(this._bg);
    this.addChild(this._text);

    // msg.style.fill = x で特殊色指定（"white"でリセット）
    const self = this;
    this.style = {
      get fill() { return self._textColorOverride; },
      set fill(v) {
        if (!v || v === "white") {
          self._textColorOverride = null;
        } else {
          self._textColorOverride = self._parseColor(v);
        }
        if (self._text.text) self._redraw();
      },
    };
  }

  get text() { return this._text.text; }
  set text(val) {
    this._text.text = val;
    if (val && avaBubbleLayer && this.parent !== avaBubbleLayer) {
      if (this.parent) this.parent.removeChild(this);
      avaBubbleLayer.addChild(this);
      this._startOverlayTick();
    } else if (!val) {
      this._stopOverlayTick();
      if (this.parent && this.parent !== this._avatarContainer && this._avatarContainer) {
        this.parent.removeChild(this);
        this._avatarContainer.addChild(this);
      }
    }
    this._redraw();
  }

  get log() { return this._isLog; }
  set log(v) { this._isLog = v; if (this._text.text) this._redraw(); }

  // CSS名・"0x……"・数値を PIXI が扱える数値に変換
  _parseColor(v) {
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const n = parseInt(v.replace(/^0x|^#/, ""), 16);
      if (!isNaN(n)) return n;
      return { white: 0xffffff, red: 0xff4444, blue: 0x4488ff }[v.toLowerCase()] ?? 0x00eeff;
    }
    return 0x00eeff;
  }

  _redraw() {
    this._bg.clear();
    if (!this._text.text) {
      this.position.set(0, 0);
      return;
    }

    const PX = 8, PY = 8, C = 7;
    const BASE = 7; // 付け根の幅（px）
    const col = this._avatarColor;

    const bgCol = 0x000000;
    const r = (col >> 16) & 0xff, g = (col >> 8) & 0xff, b = col & 0xff;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const isDark = lum < 80;

    this._text.style.fill = this._textColorOverride !== null ? this._textColorOverride : (isDark ? 0xf5f5f5 : col);
    this._text.style.stroke = isDark ? col : 0x000000;
    this._text.style.strokeThickness = isDark ? 2 : 0;
    this._text.style.dropShadow = false;

    const tw = this._text.width;
    const th = this._text.height;
    const w  = tw + PX * 2;
    const h  = th + PY * 2;

    // 三角のk値（bottomExt にも使う）
    const k = BASE * (Math.sqrt(3) - 1) / 2;
    // triLeft/Bottom/Tip は通常時のみ使用。動的計算で上書きされる（let）
    let triLeft   = [0,    h - BASE];
    let triBottom = [BASE, h];
    let triTip    = [-k,   h + k];

    // ！の数でスパイク強度を決定（全角・半角両対応）
    const bangCount = (this._text.text.match(/[!！]/g) || []).length;
    const spikeH    = bangCount > 0 ? 5 + bangCount * 4 : 0;  // ！が増えると長さが伸びる
    const totalSpikes = bangCount > 0 ? 20 : 0;               // トゲの数は固定

    // スパイクポリゴン生成（中心から放射状にトゲ、周長比でトゲ数配分）
    const buildSpikyPts = (sh, total) => {
      const perim = 2 * (w + h);
      const nT = Math.max(1, Math.round(total * w / perim));
      const nR = Math.max(1, Math.round(total * h / perim));
      const nB = Math.max(1, Math.round(total * w / perim));
      const nL = Math.max(1, Math.round(total * h / perim));
      const cx = w / 2, cy = h / 2;
      const tip = (bx, by) => {
        const dx = bx - cx, dy = by - cy;
        const len = Math.sqrt(dx*dx + dy*dy) || 1;
        return [bx + dx/len * sh, by + dy/len * sh];
      };
      const pts = [];
      const push = (i, bx, by) => {
        if (i % 2 === 1) { const [tx, ty] = tip(bx, by); pts.push(tx, ty); }
        else pts.push(bx, by);
      };
      for (let i = 0; i <= 2*nT; i++) push(i, i/(2*nT)*w,      0);
      for (let i = 1; i <= 2*nR; i++) push(i, w,                i/(2*nR)*h);
      for (let i = 1; i <= 2*nB; i++) push(i, w*(1-i/(2*nB)),   h);
      for (let i = 1; i <  2*nL; i++) push(i, 0,                h*(1-i/(2*nL)));
      return pts;
    };

    // 吹き出しをアバターの右上に配置（ドラッグオフセット適用）
    const bottomGap = bangCount > 0 ? 10 : 20;
    const bottomExt = bangCount > 0 ? spikeH * 0.3 : k;
    let _bx = -w / 2 + this._offsetX;
    let _by = -(this._spriteHeight + bottomGap + h + bottomExt) + this._offsetY;

    // 画面端クランプ（ドラッグ中は無効、_offsetX/Y は変えない）
    const _acRef = this._avatarContainer || (this.parent !== avaBubbleLayer ? this.parent : null);
    if (!this._dragging && _acRef?.getGlobalPosition) {
      const gp = _acRef.getGlobalPosition();
      const sx = _acRef.scale?.x ?? 1, sy = _acRef.scale?.y ?? 1;
      const cW = app.renderer.width, cH = app.renderer.height, margin = 4;
      if (gp.x + _bx * sx < margin)               _bx = (margin - gp.x) / sx;
      if (gp.x + (_bx + w) * sx > cW - margin)    _bx = (cW - margin - w * sx - gp.x) / sx;
      if (gp.y + _by * sy < margin)               _by = (margin - gp.y) / sy;
    }

    this._lastBx = _bx;
    this._lastBy = _by;

    if (this._avatarContainer && avaBubbleLayer && this.parent === avaBubbleLayer) {
      const ac = this._avatarContainer;
      this.position.set(ac.x + _bx * ac.scale.x, ac.y + _by * ac.scale.y);
      this.scale.set(ac.scale.x, ac.scale.y);
    } else {
      this.scale.set(1, 1);
      this.position.set(_bx, _by);
    }

    const gA = this._isLog ? [0.10, 0.22, 0.70] : [0.015, 0.05, 0.25];

    if (bangCount > 0) {
      const spikyPts = buildSpikyPts(spikeH, totalSpikes);
      // スパイク時: グロー → 黒塗り → ボーダーの順（内側へのグロー染みを黒で消す）
      this._bg.lineStyle(0);
      this._bg.beginFill(bgCol, 1);
      this._bg.drawPolygon(spikyPts);
      this._bg.endFill();
      this._bg.lineStyle(2, col, 1);
      this._bg.drawPolygon(spikyPts);
      // 当たり判定をスパイクポリゴンに合わせる
      this._hitPolygon = new PIXI.Polygon(spikyPts);
    } else {
      this._hitPolygon = null; // 通常時はAABBに戻す
      // アバター上から1/4の点への方向を求め、矩形エッジ上の付け根から k 分だけ伸ばして三角先端とする
      let _ex = triLeft[0] + (triBottom[0] - triLeft[0]) / 2; // フォールバック付け根中心
      let _ey = triLeft[1] + (triBottom[1] - triLeft[1]) / 2;
      {
        const tipX = -_bx;
        const tipY = -(this._spriteHeight * 3 / 4) - _by;
        const tcx = w / 2, tcy = h / 2;
        const tdx = tcx - tipX, tdy = tcy - tipY;
        const tLen = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
        const tndx = tdx / tLen, tndy = tdy / tLen;
        const eps = 1e-6;
        let tMin = Infinity;
        if (Math.abs(tdx) > eps) {
          const ta = -tipX / tdx;
          if (ta > eps && tipY + ta * tdy >= -2 && tipY + ta * tdy <= h + 2) tMin = Math.min(tMin, ta);
          const tb = (w - tipX) / tdx;
          if (tb > eps && tipY + tb * tdy >= -2 && tipY + tb * tdy <= h + 2) tMin = Math.min(tMin, tb);
        }
        if (Math.abs(tdy) > eps) {
          const tc = -tipY / tdy;
          if (tc > eps && tipX + tc * tdx >= -2 && tipX + tc * tdx <= w + 2) tMin = Math.min(tMin, tc);
          const td2 = (h - tipY) / tdy;
          if (td2 > eps && tipX + td2 * tdx >= -2 && tipX + td2 * tdx <= w + 2) tMin = Math.min(tMin, td2);
        }
        if (isFinite(tMin)) {
          const ex = tipX + tMin * tdx;
          const ey = tipY + tMin * tdy;
          const px = -tndy * (BASE / 2);
          const py = tndx * (BASE / 2);
          // 付け根2点を確実に辺の上にクランプ（辺からはみ出ると枠線が侵入する）
          const e2 = 2;
          const onL = ex < e2, onR = ex > w - e2, onT = ey < e2;
          if (onL || onR) {
            const cx = onL ? 0 : w;
            triLeft[0]   = cx; triLeft[1]   = Math.max(0, Math.min(h, ey + py));
            triBottom[0] = cx; triBottom[1] = Math.max(0, Math.min(h, ey - py));
          } else if (onT) {
            triLeft[0]   = Math.max(0, Math.min(w, ex + px)); triLeft[1]   = 0;
            triBottom[0] = Math.max(0, Math.min(w, ex - px)); triBottom[1] = 0;
          } else { // 下辺
            triLeft[0]   = Math.max(0, Math.min(w, ex + px)); triLeft[1]   = h;
            triBottom[0] = Math.max(0, Math.min(w, ex - px)); triBottom[1] = h;
          }
          // 先端: 距離に応じて伸縮、最小8px・最大30px
          const dist = Math.sqrt((tipX - ex) * (tipX - ex) + (tipY - ey) * (tipY - ey));
          const tipLen = Math.min(30, Math.max(8, dist * 0.25));
          triTip[0] = ex - tndx * tipLen;
          triTip[1] = ey - tndy * tipLen;
          _ex = ex; _ey = ey;
        }
      }
      // 通常時: グロー → 黒背景（内側染みを上書き） → ボーダー
      this._bg.lineStyle(5, col, gA[1]);
      this._bg.drawRect(-2, -2, w + 4, h + 4);
      this._bg.lineStyle(2, col, gA[2]);
      this._bg.drawRect(0, 0, w, h);
      // 背景色でグローの内側染みを消す
      this._bg.lineStyle(0);
      this._bg.beginFill(bgCol, 1);
      this._bg.drawRect(0, 0, w, h);
      this._bg.endFill();
      // 三角の背景
      this._bg.beginFill(bgCol, 1);
      this._bg.moveTo(triLeft[0],   triLeft[1]);
      this._bg.lineTo(triTip[0],    triTip[1]);
      this._bg.lineTo(triBottom[0], triBottom[1]);
      this._bg.closePath();
      this._bg.endFill();

      // メインボーダー（三角の付け根エッジは隙間あり）
      {
        const e2 = 2;
        const onLeft   = _ex < e2;
        const onRight  = _ex > w - e2;
        const onTop    = _ey < e2;
        const x1 = Math.min(triLeft[0], triBottom[0]);
        const x2 = Math.max(triLeft[0], triBottom[0]);
        const y1 = Math.min(triLeft[1], triBottom[1]);
        const y2 = Math.max(triLeft[1], triBottom[1]);
        this._bg.lineStyle(2, col, 1);
        if (onLeft) {
          this._bg.moveTo(0, 0); this._bg.lineTo(w, 0);
          this._bg.moveTo(w, 0); this._bg.lineTo(w, h);
          this._bg.moveTo(0, h); this._bg.lineTo(w, h);
          if (y1 > e2)     { this._bg.moveTo(0, 0);  this._bg.lineTo(0, y1); }
          if (y2 < h - e2) { this._bg.moveTo(0, y2); this._bg.lineTo(0, h);  }
        } else if (onRight) {
          this._bg.moveTo(0, 0); this._bg.lineTo(w, 0);
          this._bg.moveTo(0, 0); this._bg.lineTo(0, h);
          this._bg.moveTo(0, h); this._bg.lineTo(w, h);
          if (y1 > e2)     { this._bg.moveTo(w, 0);  this._bg.lineTo(w, y1); }
          if (y2 < h - e2) { this._bg.moveTo(w, y2); this._bg.lineTo(w, h);  }
        } else if (onTop) {
          this._bg.moveTo(w, 0); this._bg.lineTo(w, h);
          this._bg.moveTo(0, 0); this._bg.lineTo(0, h);
          this._bg.moveTo(0, h); this._bg.lineTo(w, h);
          if (x1 > e2)     { this._bg.moveTo(0, 0);  this._bg.lineTo(x1, 0); }
          if (x2 < w - e2) { this._bg.moveTo(x2, 0); this._bg.lineTo(w, 0);  }
        } else { // 下辺（デフォルト）
          this._bg.moveTo(0, 0); this._bg.lineTo(w, 0);
          this._bg.moveTo(w, 0); this._bg.lineTo(w, h);
          this._bg.moveTo(0, 0); this._bg.lineTo(0, h);
          if (x1 > e2)     { this._bg.moveTo(0, h);  this._bg.lineTo(x1, h); }
          if (x2 < w - e2) { this._bg.moveTo(x2, h); this._bg.lineTo(w, h);  }
        }
      }

      // 三角の2辺
      this._bg.lineStyle(1, col, 1);
      this._bg.moveTo(triLeft[0],   triLeft[1]); this._bg.lineTo(triTip[0],    triTip[1]);
      this._bg.moveTo(triTip[0],    triTip[1]);  this._bg.lineTo(triBottom[0], triBottom[1]);

      // 四隅のブラケット（二重段付き）
      const drawCorner = (ax, ay, dx, dy) => {
        this._bg.lineStyle(3, col, 1);
        this._bg.moveTo(ax, ay); this._bg.lineTo(ax + dx * C, ay);
        this._bg.moveTo(ax, ay); this._bg.lineTo(ax, ay + dy * C);
        this._bg.lineStyle(1, col, 0.7);
        this._bg.moveTo(ax + dx*2, ay + dy*2); this._bg.lineTo(ax + dx*(C-1), ay + dy*2);
        this._bg.moveTo(ax + dx*2, ay + dy*2); this._bg.lineTo(ax + dx*2, ay + dy*(C-1));
      };
      drawCorner(0, 0,  1,  1);
      drawCorner(w, 0, -1,  1);
      drawCorner(w, h, -1, -1);
    }

    // テキストを最前面に（_bg再描画後に確実に上へ）
    this.removeChild(this._text);
    this.addChild(this._text);

    // テキストを縦中央に
    this._text.position.set(PX, (h - th) / 2);
  }

  _startOverlayTick() {
    if (this._overlayTickFn) return;
    this._overlayTickFn = () => {
      if (!this._avatarContainer || this.parent !== avaBubbleLayer) return;
      const ac = this._avatarContainer;
      this.x = ac.x + this._lastBx * ac.scale.x;
      this.y = ac.y + this._lastBy * ac.scale.y;
      this.scale.set(ac.scale.x, ac.scale.y);
    };
    app.ticker.add(this._overlayTickFn);
  }

  _stopOverlayTick() {
    if (!this._overlayTickFn) return;
    app.ticker.remove(this._overlayTickFn);
    this._overlayTickFn = null;
  }

  // 自分のアバターの吹き出しにのみ呼ぶ。ドラッグで位置変更できるようにする
  setupDrag() {
    this._offsetX = Math.max(-250, Math.min(250, parseFloat(localStorage.getItem("bubbleOffsetX")) || 0));
    this._offsetY = Math.max(-67,  Math.min(100, parseFloat(localStorage.getItem("bubbleOffsetY")) || 0));
    this.interactive = true;
    this.cursor = "grab";
    this.on("pointerdown", e => {
      if (e.button !== 0) return;
      e.stopPropagation();
      this._dragging = true;
      this.cursor = "grabbing";
      const startPX = e.global.x;
      const startPY = e.global.y;
      const startOX = this._offsetX;
      const startOY = this._offsetY;
      let lastEmitTime = 0;
      const onMove = ev => {
        if (!this._dragging) return;
        this._offsetX = Math.max(-250, Math.min(250, startOX + (ev.global.x - startPX)));
        this._offsetY = Math.max(-67,  Math.min(100, startOY + (ev.global.y - startPY)));
        if (this._text.text) this._redraw();
        const now = Date.now();
        if (now - lastEmitTime >= 50) {
          lastEmitTime = now;
          socket.emit("bubbleOffset", { offsetX: this._offsetX, offsetY: this._offsetY });
        }
      };
      const onUp = () => {
        if (!this._dragging) return;
        this._dragging = false;
        this.cursor = "grab";
        localStorage.setItem("bubbleOffsetX", this._offsetX);
        localStorage.setItem("bubbleOffsetY", this._offsetY);
        socket.emit("bubbleOffset", { offsetX: this._offsetX, offsetY: this._offsetY });
        app.stage.off("pointermove", onMove);
        app.stage.off("pointerup",   onUp);
        app.stage.off("pointerupoutside", onUp);
      };
      app.stage.on("pointermove",      onMove);
      app.stage.on("pointerup",        onUp);
      app.stage.on("pointerupoutside", onUp);
    });
  }
}

// ========================================================
// ステージ設定
// 新しいステージを追加する時はここに追記するだけでOK
// gravity: true → そのステージで重力が有効
// ========================================================
// 方向文字列に対応するアバタースプライトをセットするヘルパー
const DIR_SPRITE_MAP = { N: "avaN", NE: "avaNE", E: "avaE", SE: "avaSE", S: "avaS", SW: "avaSW", W: "avaW", NW: "avaNW" };
function applyAvatarDir(ava, dir) {
  ava.avaC = ava[DIR_SPRITE_MAP[dir] || "avaS"];
  if (ava.currentAvaStateKey !== undefined) ava.currentAvaStateKey = dir;
}

// 時刻（0〜1440分）に応じたオーバーレイ色を返す
// ColorMatrixFilter用の行列キーフレーム（20値: r/g/b/a行 × 5列[r,g,b,a,offset]）
// 昼=identity。夕日は赤を増幅・緑を少し絞り・青を半減しつつoffsetで光を乗せる。
const SKY_MATRICES = [
  { min: 0,    m: [0.25,0,0,0,0, 0,0.28,0,0,0, 0,0,0.55,0,0, 0,0,0,1,0] }, // 深夜
  { min: 300,  m: [0.25,0,0,0,0, 0,0.28,0,0,0, 0,0,0.55,0,0, 0,0,0,1,0] }, // 5:00
  { min: 390,  m: [0.9,0,0,0,0.05, 0,0.75,0,0,0, 0,0,0.7,0,0, 0,0,0,1,0] }, // 6:30 夜明け
  { min: 420,  m: [1,0,0,0,0, 0,1,0,0,0, 0,0,1,0,0, 0,0,0,1,0] },           // 7:00 昼
  { min: 990,  m: [1,0,0,0,0, 0,1,0,0,0, 0,0,1,0,0, 0,0,0,1,0] },           // 16:30 昼
  { min: 1050, m: [1.15,0,0,0,0.10, 0,0.85,0,0,0.02, 0,0,0.55,0,0, 0,0,0,1,0] }, // 17:30 夕日
  { min: 1140, m: [0.85,0,0,0,0.08, 0,0.6,0,0,0, 0,0,0.5,0,0, 0,0,0,1,0] }, // 19:00 黄昏
  { min: 1200, m: [0.25,0,0,0,0, 0,0.28,0,0,0, 0,0,0.55,0,0, 0,0,0,1,0] }, // 20:00 夜
  { min: 1440, m: [0.25,0,0,0,0, 0,0.28,0,0,0, 0,0,0.55,0,0, 0,0,0,1,0] }, // 24:00
];
function getSkyMatrix(t) {
  for (let i = 0; i < SKY_MATRICES.length - 1; i++) {
    const a = SKY_MATRICES[i], b = SKY_MATRICES[i + 1];
    if (t >= a.min && t <= b.min) {
      const f = (b.min === a.min) ? 0 : (t - a.min) / (b.min - a.min);
      return a.m.map((v, j) => v + (b.m[j] - v) * f);
    }
  }
  return SKY_MATRICES[0].m.slice();
}

// 部屋ごとの設定。新しい部屋を追加するときはここに追記するだけでOK
// perspectiveScale: 奥行きスケール設定。minY〜maxYの間でminScale〜maxScaleに変化する
const ROOM_PHYSICS = {
  "エントランス": { gravity: true, se: "other", overlayChatColor: "black", // skyTime: true で時間帯フィルター有効化
    perspectiveScale: { minY: 160, maxY: 450, minScale: 0.25, maxScale: 1.0 } // ⭐ 要調整
  },
  "草原": { gravity: true,  se: "other",      overlayChatColor: "black", cloudSync: true }, // skyTime: true で時間帯フィルター有効化
  "うちゅー":    { gravity: false, se: "outerSpace", overlayChatColor: "white" },
  "文字の部屋":   { gravity: true,  se: "outerSpace", overlayChatColor: "white" },
  "粉の部屋":     { gravity: true,  se: "outerSpace", overlayChatColor: "white" },
  "星1":         { gravity: false, se: "outerSpace", overlayChatColor: "white" },
  "むげんのいりぐち": { gravity: false, se: "outerSpace", overlayChatColor: "black" },
  "むげん":           { gravity: false, se: "outerSpace", overlayChatColor: "black" },
  "東の部屋":         { gravity: false, se: "outerSpace", overlayChatColor: "white" },
  "南の部屋":         { gravity: false, se: "outerSpace", overlayChatColor: "white" },
  "西の部屋":         { gravity: false, se: "outerSpace", overlayChatColor: "white" },
  "北の部屋":         { gravity: false, se: "outerSpace", overlayChatColor: "white" },
};

class Avatar {
  constructor(name, token, avatarAspect, avatarColor,) {
    this.name = name;
    this.tags = ["standable"];
    this.container = new PIXI.Container();
    this.container.eventMode = 'static';//クリックイベントを有効化
    this.container.sortableChildren = true;//子要素のzIndexをonにする

    this.token = token;
    this.sit = false;
    this.sleep = false;
    this.roomIn++;//確認
    this.sprites = [];
    this._avatarRoomScale = 1.0;

    //画像を追加
    this.avatarAspect = avatarAspect;//アバターを出力
    switch (avatarAspect) {
      case "necosuke":
      case "necosukeMono":
        this.setAvatar(avatarAspect === "necosuke" ? necosuke : necosukeMono);
        break;
      case "gomanecoMono":
        this.setAvatar(gomanecoMono);
        break;
      default:
        this.avatarAspect = "gomaneco";
        this.setAvatar(gomaneco);
        break;
    }

    this.setColor(avatarColor);
    this.avaC = this.avaS;//初期状態はS向き
    this.container.addChild(this.avaC);

    //名前タグ
    this.nameText = new PIXI.Text(this.name, nameTextStyle);
    this.nameText.position.set(-this.nameText.width / 2, -this.avaC.height - 10 - this.nameText.height / 2);

    this.nameTag = new PIXI.Graphics();
    this.nameTag.beginFill(0x000000, 0.5);
    this.nameTag.drawRect(0, 0, this.nameText.width, this.nameText.height);
    this.nameTag.endFill();
    this.nameTag.position.set(this.nameText.x, this.nameText.y);
    let inTime = new Date().getHours();
    if (0 <= inTime && inTime < 12) {
      inTime = 24 - inTime;
    }
    this.nameTag.alpha = Math.pow(1.06, inTime) * 0.1;
    this.container.addChild(this.nameTag);
    this.container.addChild(this.nameText);

    // 吹き出し
    this.msg = new MsgBubble(this.avaS.height, this.avatarColor);
    this.msg._avatarContainer = this.container;
    this.container.addChild(this.msg);

    //アバターお絵描きを描画
    // これまで描いた全ての線の履歴（undo/redo/全消し用,キャッシュ）
    this.drawHistory = [];
    this.redoStack = [];
    this.currentAvaStateKey = "S"; // 現在の方向・状態キー（落書きパターン切り替え用）
    // 新しいGraphicsインスタンスを作成
    this.oekakiGraphics = new PIXI.Graphics();
    this.oekakiGraphics.zIndex = 10;
    this.container.addChild(this.oekakiGraphics);

    this.abon = false;//アボンされてるかどうか
    this.abonSprite = new PIXI.Sprite(abonTexture);
    this.abonSprite.anchor.set(0.5, 1);

    // 物理変数
    this.fixedTimeStep = 16.666; // 60FPS固定 (ms)
    this.lastPhysicsUpdate = 0;
    this.accumulator = 0;
    this.maxAccumulator = 100;
    this.dropVelocity = 1; // 落下速度
    this.lastFallSendTime = 0; // 落下中の定期送信用

    // 乗り物追従
    this.ridingObject = null;
    this.ridingOffset = { x: 0, y: 0 };

    this.is2F = false;

    this.container.on('pointerdown', e => {
      if (['touch', 'pen'].includes(e.pointerType)) {
        let touchTimer = setTimeout(() => {//一秒長押しで、右クリックメニューを表示
          if (avatarOekakiToken !== this.token) avatarOekakiToken = false;
          contextMenu.dataset.token = this.token;
          if (avatarOekakiToken === this.token) {
            avatarOekakiMenu.textContent = "ラクガキをやめる";
            avatarOekakiMenu.style.display = "block";
          } else if (this.token === myToken || avaP[this.token]?.allowOthersOekaki !== false) {
            avatarOekakiMenu.textContent = "ラクガキする";
            avatarOekakiMenu.style.display = "block";
          } else {
            avatarOekakiMenu.style.display = "none";
          }
          if (this.token !== myToken) {
            abonMenu.style.display = "block";
            abonMenu.textContent = this.abon ? "アボン解除" : "アボン";
          } else {
            abonMenu.style.display = "none";
          }
          document.getElementById('roomEditMenu').style.display = 'none';
          contextMenuPositionSet(e);
        }, 1000);
        const clearTouchTimer = () => clearTimeout(touchTimer);
        document.getElementById("graphic").addEventListener("touchend", clearTouchTimer, { passive: true, once: true });

        isPointerDown = true;
      }
      if (e.button === 0 && useLogHighlight && useAvatarHighlight && !isDownCtrl && !clickedWa_iButtun) {
        e.stopPropagation();
        applyLogHighlight(highlightToken === this.token ? null : this.token);
      }
      if (e.button === 2) {//右クリックでメニューを表示
        e.stopPropagation();//親のクリックイベントを動作させない
        if (avatarOekakiToken !== this.token) {//このアバターを落書き中の時以外※avatarOekakiTokenは今落書き中のトークン
          avatarOekakiToken = false;//他のアバターの落書きはやめる。
        }
        contextMenu.dataset.token = this.token;

        //落書きメニューを出す
        if (avatarOekakiToken === this.token) {//そのアバターを落書き中の時
          avatarOekakiMenu.textContent = "ラクガキをやめる";
          avatarOekakiMenu.style.display = "block";
        } else if (this.token === myToken || avaP[this.token]?.allowOthersOekaki !== false) {
          avatarOekakiMenu.textContent = "ラクガキする";
          avatarOekakiMenu.style.display = "block";
        } else {
          avatarOekakiMenu.style.display = "none";
        }

        //アボンメニューを出す
        if (this.token !== myToken) {//自分以外のアバターの時
          abonMenu.style.display = "block";
          if (this.abon) {//アボンされてる時
            abonMenu.textContent = "アボン解除";
          } else {
            abonMenu.textContent = "アボン";
          }
        } else {
          abonMenu.style.display = "none";
        }

        document.getElementById('roomEditMenu').style.display = 'none';
        contextMenu.style.display = "block";
        contextMenuPositionSet(e);
      }
    });

    // AvatarのtickerはtickersListenersに入れない（部屋移動時にクリアされるとavaLoopが止まる）
    this._tickerFn = () => { this.avaLoop(); };
    this._tickerActive = true;
    app.ticker.add(this._tickerFn);
  }

  setAvatar(thisAvatar) {
    if (!polygons) return false;
    this.avaS = new PIXI.Sprite(thisAvatar.S);
    this.avaS1 = new PIXI.Sprite(thisAvatar.S1);
    this.avaS2 = new PIXI.Sprite(thisAvatar.S1);
    this.avaS2.scale.x = -1;
    this.avaSW = new PIXI.Sprite(thisAvatar.SW);
    this.avaSW1 = new PIXI.Sprite(thisAvatar.SW1);
    this.avaSW2 = new PIXI.Sprite(thisAvatar.SW2);
    this.avaW = new PIXI.Sprite(thisAvatar.W);
    this.avaW1 = new PIXI.Sprite(thisAvatar.W1);
    this.avaW2 = new PIXI.Sprite(thisAvatar.W2);
    this.avaNW = new PIXI.Sprite(thisAvatar.NW);
    this.avaNW1 = new PIXI.Sprite(thisAvatar.NW1);
    this.avaNW2 = new PIXI.Sprite(thisAvatar.NW2);
    this.avaN = new PIXI.Sprite(thisAvatar.N);
    this.avaN1 = new PIXI.Sprite(thisAvatar.N1);
    this.avaN2 = new PIXI.Sprite(thisAvatar.N1);
    this.avaN2.scale.x = -1;

    this.avaNE = new PIXI.Sprite(thisAvatar.NW);
    this.avaNE.scale.x = -1;
    this.avaNE1 = new PIXI.Sprite(thisAvatar.NW1);
    this.avaNE1.scale.x = -1;
    this.avaNE2 = new PIXI.Sprite(thisAvatar.NW2);
    this.avaNE2.scale.x = -1;
    this.avaE = new PIXI.Sprite(thisAvatar.W);
    this.avaE.scale.x = -1;
    this.avaE1 = new PIXI.Sprite(thisAvatar.W1);
    this.avaE1.scale.x = -1;
    this.avaE2 = new PIXI.Sprite(thisAvatar.W2);
    this.avaE2.scale.x = -1;
    this.avaSE = new PIXI.Sprite(thisAvatar.SW);
    this.avaSE.scale.x = -1;
    this.avaSE1 = new PIXI.Sprite(thisAvatar.SW1);
    this.avaSE1.scale.x = -1;
    this.avaSE2 = new PIXI.Sprite(thisAvatar.SW2);
    this.avaSE2.scale.x = -1;

    this.avaSit = new PIXI.Sprite(thisAvatar.sit);

    this.avaSleep0 = new PIXI.Sprite(thisAvatar.Sleep0);
    this.avaSleep1 = new PIXI.Sprite(thisAvatar.Sleep1);
    this.avaSleep2 = new PIXI.Sprite(thisAvatar.Sleep2);
    this.avaSleep3 = new PIXI.Sprite(thisAvatar.Sleep3);

    this.icon = thisAvatar.icon;

    this.sprites = [
      this.avaS, this.avaS1, this.avaS2,
      this.avaSW, this.avaSW1, this.avaSW2,
      this.avaW, this.avaW1, this.avaW2,
      this.avaNW, this.avaNW1, this.avaNW2,
      this.avaN, this.avaN1, this.avaN2,
      this.avaNE, this.avaNE1, this.avaNE2,
      this.avaE, this.avaE1, this.avaE2,
      this.avaSE, this.avaSE1, this.avaSE2,
      this.avaSit,
      this.avaSleep0, this.avaSleep1, this.avaSleep2, this.avaSleep3
    ];
    this.sprites.forEach(sprite => {
      if (sprite) sprite.anchor.set(0.5, 1);
    });

    this.setupSpriteHitAreas();
  };

  // 新しいメソッド：各スプライトにhitAreaを設定
  setupSpriteHitAreas() {
    // アバターの種類に応じてポリゴン名を決定
    let basePolygonKey;
    switch (this.avatarAspect) {
      case "gomaneco":
      case "gomanecoMono":
        basePolygonKey = "gomaneco";
        break;
      case "necosuke":
      case "necosukeMono":
        basePolygonKey = "necosuke";
        break;
      default:
        basePolygonKey = "gomaneco";
    }

    // 方向ごとのポリゴンマッピング
    const basicMapping = {
      "avaS": `${basePolygonKey}S0`,
      "avaS1": `${basePolygonKey}S1`,
      "avaS2": `${basePolygonKey}S2`,
      "avaN": `${basePolygonKey}N0`,
      "avaN1": `${basePolygonKey}N1`,
      "avaN2": `${basePolygonKey}N2`,
      "avaW": `${basePolygonKey}W0`,
      "avaW1": `${basePolygonKey}W1`,
      "avaW2": `${basePolygonKey}W2`,
      "avaSW": `${basePolygonKey}SW0`,
      "avaSW1": `${basePolygonKey}SW1`,
      "avaSW2": `${basePolygonKey}SW2`,
      "avaNW": `${basePolygonKey}NW0`,
      "avaNW1": `${basePolygonKey}NW1`,
      "avaNW2": `${basePolygonKey}NW2`,
      "avaSit": `${basePolygonKey}Sit`,
      "avaSleep0": `${basePolygonKey}Sleep0`,
      "avaSleep1": `${basePolygonKey}Sleep1`,
      "avaSleep2": `${basePolygonKey}Sleep2`,
      "avaSleep3": `${basePolygonKey}Sleep3`
    };

    // 反転マッピング（東側 = 西側の反転）
    const flipMapping = {
      "avaE": "avaW",
      "avaE1": "avaW1",
      "avaE2": "avaW2",
      "avaSE": "avaSW",
      "avaSE1": "avaSW1",
      "avaSE2": "avaSW2",
      "avaNE": "avaNW",
      "avaNE1": "avaNW1",
      "avaNE2": "avaNW2",
    };

    // 基本マッピングの処理
    Object.entries(basicMapping).forEach(([spriteName, polygonKey]) => {
      this.setHitAreaForSprite(spriteName, polygonKey, false);
    });

    // 反転マッピングの処理
    Object.entries(flipMapping).forEach(([eastSprite, westSprite]) => {
      const polygonKey = basicMapping[westSprite];
      this.setHitAreaForSprite(eastSprite, polygonKey, true);
    });
  }

  // hitArea設定の共通メソッド（複数ポリゴン対応版）
  setHitAreaForSprite(spriteName, polygonKey, shouldFlip) {
    const sprite = this[spriteName];
    if (!sprite || !polygons[polygonKey]) return;

    // 複数ポリゴンに対応
    const polygonArrays = polygons[polygonKey];
    if (!Array.isArray(polygonArrays) || polygonArrays.length === 0) return;

    const processedPolygons = [];

    polygonArrays.forEach(polygonData => {
      let localPolygon = this.convertToLocalCoordinates(polygonData);

      if (shouldFlip) {
        localPolygon = this.flipPolygonHorizontally(localPolygon);
      }

      processedPolygons.push(new PIXI.Polygon(localPolygon));
    });

    // 複数ポリゴンのhitAreaを設定
    sprite.hitArea = {
      _polygons: processedPolygons,
      contains: function (x, y) {
        return processedPolygons.some(polygon => polygon.contains(x, y));
      }
    };

  }

  // 座標変換メソッド
  convertToLocalCoordinates(globalPolygon) {
    const localPolygon = [];
    const centerX = this.avaS.width / 2;
    const bottomY = this.avaS.height;

    for (let i = 0; i < globalPolygon.length; i += 2) {
      localPolygon.push(globalPolygon[i] - centerX);
      localPolygon.push(globalPolygon[i + 1] - bottomY);
    }

    return localPolygon;
  }

  // X軸反転用のメソッド
  flipPolygonHorizontally(polygon) {
    const flippedPolygon = [];
    for (let i = 0; i < polygon.length; i += 2) {
      flippedPolygon.push(-polygon[i]);     // X座標を反転（マイナスにする）
      flippedPolygon.push(polygon[i + 1]);  // Y座標はそのまま
    }
    return flippedPolygon;
  }

  // アバターの色とお絵描きの色を変更する関数
  setColor(colorCode) {
    if (!colorCode) {//色が入ってなかった場合
      colorCode = 0xFFFFFF;//(無色、白)
    }

    // もしcolorCodeが10進数文字列なら16進数に変換
    if (typeof colorCode === "string") {
      if (colorCode.startsWith("#")) {
        // OK
      } else if (colorCode.startsWith("0x")) {
        colorCode = parseInt(colorCode, 16);
      } else if (!isNaN(Number(colorCode))) {
        colorCode = Number(colorCode);
      }
    }

    // アバターの現在の色情報を保存
    this.avatarColor = colorCode;

    // 吹き出しの背景色を更新
    if (this.msg) {
      this.msg._avatarColor = typeof colorCode === "number" ? colorCode : parseInt(String(colorCode).replace(/^0x|^#/, ""), 16) || 0xffffff;
      if (this.msg.text) this.msg._redraw();
    }

    // 各方向・状態ごとのスプライトに色を適用
    this.sprites.forEach(sprite => {
      if (sprite) sprite.tint = colorCode;
    });

    // アバターをクリック/タップした時の処理を追加
    if (!this.oekakiColorRegistered) {//一度だけ登録
      this.container.on('pointerdown', e => {
        if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
        // Ctrlキーや「ラクガキ」ボタンが押されていない場合のみ色をセット
        if (!isDownCtrl && !clickedWa_iButtun) {
          // アバターの種類によってデフォルト色を設定
          if (this.avatarAspect === "gomaneco") {
            oekakiColor = 0xf8b0fb; // ごまねこはピンク
          } else if (this.avatarAspect === "necosuke") {
            oekakiColor = 0x7a9ce8; // ねこすけは青
          }
          oekakiAlpha = this.avatarAlpha; // 透明度もセット
        }
      });
    }
    this.oekakiColorRegistered = true;
  }

  displayAvatar({ fromRoom, AX, AY, DIR, sit, avatarAlpha, msg, carryOver, sleep, newAvatarDrawHistory, random, ridingData }) {//アバターを表示する。
    this.container.position.set(AX, AY);
    room.container.addChild(this.container);
    this.container.removeChild(this.avaC);

    this.dropVelocity = 1;
    this.ridingObject = null;
    this.ridingOffset = { x: 0, y: 0 };

    this.roomIn = 1;//入室回数をリセット

    // 画像とメッセージと名前を追加してavaPにつける
    applyAvatarDir(this, DIR); // currentAvaStateKey = DIR も設定される
    if (sit) {
      this.avaC = this.avaSit;
      this.currentAvaStateKey = "sit";
      this.sit = true;
    } else {
      this.sit = false;
    }
    this.container.addChild(this.avaC);

    this.setAlpha(avatarAlpha);
    //ログ残しがあったら、反映
    this.msg.log = !!carryOver;
    if (carryOver) {
      this.msg.text = msg;
      // const carryOverMessage = document.createElement("li");
      // carryOverMessage.textContent = this.nameText.text + ":" + msg;//テキストを設定
      // logs.appendChild(carryOverMessage);//logsの末尾に入れる
      outputChatMsg(msg, false, this.token, false, this.name + ":");
    } else {
      this.msg.text = "";
    }

    //落書き履歴のリセット処理
    this.drawHistory = newAvatarDrawHistory ? newAvatarDrawHistory : [];

    //お絵描きの描画（現在の状態キーに合ったパターンのみ）
    if (newAvatarDrawHistory && newAvatarDrawHistory.length > 0) {
      this.redrawOekakiForState();

      room.updateOekakiHitArea(this);
    }

    usersNumber.textContent = room.container.children.filter(child => child.token).length;//部屋人数の表記を変える

    if (useLogChime) {//部屋入室の音を鳴らす
      let regexp = /ＪＭＭ連合/i;//＠ＪＭＭ連合って文字が入ってたら爆発する
      if (fromRoom === "loginRoom" && regexp.test(this.name)) {
        msgSE.JMMLogin.play();
      } else if (Number.isFinite(random)) {
        msgSE[roomSE].in[random].play();
      }
    }

    //sleep処理
    if (sleep) {
      if (!this.sleep) {//二重sleep対策
        this.sleep = true;
        this.animeSleep();
      }
    } else {
      this.sleep = false;
    }

    if (room.name === "星1") {
      this.container.scale.x = 0.5;
      this.container.scale.y = 0.5;
    } else if (room.name === "むげん" || room.name === "東の部屋" || room.name === "南の部屋" || room.name === "西の部屋" || room.name === "北の部屋") {
      this.container.scale.x = 0.82;
      this.container.scale.y = 0.82;
    } else {
      const ps = ROOM_PHYSICS[room.name]?.perspectiveScale;
      if (ps) {
        const t = Math.max(0, Math.min(1, (AY - ps.minY) / (ps.maxY - ps.minY)));
        const scale = ps.minScale + t * (ps.maxScale - ps.minScale);
        this.container.scale.x = scale;
        this.container.scale.y = scale;
      } else {
        this.container.scale.x = 1;
        this.container.scale.y = 1;
      }
    }

    // 乗車状態は全員配置後に resolveRiding() で一括復元するため保存だけする
    this.pendingRidingData = ridingData || null;
  }

  // 全アバターの displayAvatar 完了後に呼ぶ。乗車対象が確実に存在する状態で復元する。
  resolveRiding() {
    const ridingData = this.pendingRidingData;
    if (!ridingData) return;

    const ridingObj = avaP[ridingData.objectName] || objMap[ridingData.objectName];
    if (!ridingObj) return; // 対象未作成 → pendingRidingDataは保持して後で再試行
    this.pendingRidingData = null;

    this.startRiding(ridingObj);
    this.ridingOffset.x = ridingData.offsetX;
    this.ridingOffset.y = ridingData.offsetY;
    const objContainer = ridingObj.container || ridingObj;
    const sx = objContainer.scale?.x ?? 1;
    const sy = objContainer.scale?.y ?? 1;
    this.container.position.set(
      (objContainer.x || 0) + ridingData.offsetX * sx,
      (objContainer.y || 0) + ridingData.offsetY * sy
    );
  }

  //透明度を変える関数
  setAlpha(avatarAlpha) {
    this.avatarAlpha = avatarAlpha;

    // 各方向・状態ごとのスプライトに色を適用
    this.sprites.forEach(sprite => {
      if (sprite) sprite.alpha = avatarAlpha;
    });
  }
  animeSleep() {
    if (this.abon) return;
    if (this.avatarAspect == "gomaneco" || this.avatarAspect == "gomanecoMono") {
      this.container.removeChild(this.avaC);
      this.avaC = this.avaSleep0;
      this.container.addChild(this.avaC);
      gsap.delayedCall(0.3, () => {
        if (this.abon) return;
        this.container.removeChild(this.avaC);
        this.avaC = this.avaSleep1;
        this.container.addChild(this.avaC);
      });
      gsap.delayedCall(0.7, () => {
        if (this.abon) return;
        this.container.removeChild(this.avaC);
        this.avaC = this.avaSleep2;
        this.container.addChild(this.avaC);
      });
      gsap.delayedCall(1.1, () => {
        if (this.abon) return;
        this.container.removeChild(this.avaC);
        this.avaC = this.avaSleep3;
        this.container.addChild(this.avaC);
        //ループ継続
        if (this.sleep) {
          this.animeSleep();
        } else {
          this.container.removeChild(this.avaC);
          this.avaC = this.avaS;
          this.container.addChild(this.avaC);
        }
      });
    }
  }
  //アニメーションの関数（sk0/sk1/sk2：方向・状態キー、落書きパターン切り替え用）
  anime(ava0, ava1, ava2, sk0, sk1, sk2) {//引数：初期ava,歩いてるとき、歩いてるとき２、token
    this._animeRev = (this._animeRev || 0) + 1;
    const rev = this._animeRev;
    const ok = () => this._animeRev === rev;
    const swap = (spr, sk) => {
      if (!ok()) return;
      this.container.removeChild(this.avaC);
      this.avaC = spr;
      this.container.addChild(this.avaC);
      if (sk !== undefined) { this.currentAvaStateKey = sk; this.redrawOekakiForState(); }
    };
    gsap.delayedCall(0.1, () => swap(ava1, sk1));
    gsap.delayedCall(0.2, () => swap(ava2, sk2));
    gsap.delayedCall(0.3, () => swap(ava1, sk1));
    gsap.delayedCall(0.4, () => swap(ava0, sk0));
  }

  // 現在の方向・状態キーに合った落書きだけを再描画する
  redrawOekakiForState() {
    if (!this.oekakiGraphics) return;
    this.oekakiGraphics.clear();
    const sk = this.currentAvaStateKey;
    for (const line of this.drawHistory) {
      if (line.type !== "line") continue;
      // 固定モードの時は全ライン表示、切り替えモードの時は状態キーが一致するものだけ
      if (oekakiPerStateMode && line.stateKey && line.stateKey !== sk) continue;
      if (!line.pointer || line.pointer.length < 2) continue;
      this.oekakiGraphics.lineStyle(2, line.color, line.alpha);
      this.oekakiGraphics.moveTo(line.pointer[0].x, line.pointer[0].y);
      for (let i = 1; i < line.pointer.length; i++) {
        this.oekakiGraphics.lineTo(line.pointer[i].x, line.pointer[i].y);
      }
    }
    if (room && room.updateOekakiHitArea) room.updateOekakiHitArea(this);
  }

  //数値を取得後のアバターの動き
  tappedMove(thisAX, thisAY, thisDIR, sit, onComplete) {
    this.isMoving = true;
    this.pendingRidingData = null;

    if (this.ridingObject) {
      this.stopRiding();
    }

    // 物に乗る判定
    const standingOn = this.isStandingOnObject(this);
    let finalX = thisAX;
    let finalY = thisAY;

    if (standingOn && this.isMovingObject(standingOn) && !standingOn.token) {

      // 移動完了後に乗車システムを起動するよう変更
      const targetObjectName = standingOn.name;
      const targetRelativeX = thisAX - (standingOn.container ? standingOn.container.x || 0 : 0);
      const targetRelativeY = thisAY - (standingOn.container ? standingOn.container.y || 0 : 0);

      // 実際の移動先は現在のオブジェクト位置+相対位置
      const objectX = standingOn.container ? standingOn.container.x || 0 : 0;
      const objectY = standingOn.container ? standingOn.container.y || 0 : 0;
      finalX = objectX + targetRelativeX;
      finalY = objectY + targetRelativeY;
    }

    // ⭐ 方向とアニメーション処理を追加
    const directionMap = {
      N: ["avaN", "avaN1", "avaN2"],
      S: ["avaS", "avaS1", "avaS2"],
      SE: ["avaSE", "avaSE1", "avaSE2"],
      SW: ["avaSW", "avaSW1", "avaSW2"],
      NE: ["avaNE", "avaNE1", "avaNE2"],
      NW: ["avaNW", "avaNW1", "avaNW2"],
      E: ["avaE", "avaE1", "avaE2"],
      W: ["avaW", "avaW1", "avaW2"],
    };

    let dir = directionMap[thisDIR];
    const stateKeys = dir.map(d => d.replace("ava", "")); // ["S","S1","S2"] 等
    if (sit) {
      this.anime(this.avaSit, this[dir[1]], this[dir[2]], "sit", stateKeys[1], stateKeys[2]);
    } else {
      this.anime(this[dir[0]], this[dir[1]], this[dir[2]], stateKeys[0], stateKeys[1], stateKeys[2]);
    }

    // 移動アニメーション
    gsap.killTweensOf(this.container);
    gsap.to(this.container, {
      duration: 0.4,
      x: finalX,
      y: finalY,
      onComplete: () => {
        this.isMoving = false;

        // 移動後の実際の位置で乗車オブジェクトを再チェック（アバターへの誤乗りは除外）
        const nowStanding = this.isStandingOnObject(this);
        if (nowStanding && this.isMovingObject(nowStanding) && !nowStanding.token) {
          this.startRiding(nowStanding);
        }

        if (this.token == myToken) {
          AX = finalX;
          AY = finalY;
          checkObjectWarpPoints(avaP[myToken]);
        } else {
          // ⭐ 他人のアバターの場合の処理を復活
          if (this.roomIn > 1) {
            if (sit) {
              this.avaC = this.avaSit;
              this.currentAvaStateKey = "sit";
            } else {
              this.avaC = this[directionMap[thisDIR][0]]; // 方向に応じたスプライト
              this.currentAvaStateKey = thisDIR;
            }
            this.container.addChild(this.avaC);
            this.container.position.set(finalX, finalY);
            this.redrawOekakiForState();
          }
        }

        if (onComplete) onComplete();
      }
    });
  }

  /**
   * 部屋内の他のオブジェクト（草原・雲・虹など）にアバターが乗っているかどうかを判定する関数
   * @param {PIXI.Container} ava - 判定対象のアバター（PIXI.Container）
   * @returns {GameObject|null} 乗っているオブジェクト（GameObject）か、何もなければnull
   */
  // 判定関数
  isStandingOnObject(ava, skipAvatars = false) {
    const roomContainer = room.container;
    if (!roomContainer) return null;

    if (!skipAvatars) {
      // 1. 全アバター同士の判定
      for (const token in avaP) {
        if (token === ava.token) continue; // 自分自身は除外

        const otherAvatar = avaP[token];
        if (!otherAvatar || otherAvatar.abon) continue; // アボン中は除外
        if (otherAvatar.container.parent !== room.container) continue; // 部屋にいない場合は除外

        // アバター同士のヒット判定
        if (hitAB(ava, otherAvatar)) {
          return otherAvatar;
        }

        // アバター名タグとの判定
        if (otherAvatar.nameText && otherAvatar.nameText.parent === otherAvatar.container) {
          if (this.checkHitWithDisplayObject(ava, otherAvatar.nameText)) {
            return otherAvatar;
          }
        }

        // 吹き出しとの判定（text が空なら判定しない）
        if (otherAvatar.msg && otherAvatar.msg.text !== "" && otherAvatar.msg.parent === otherAvatar.container) {
          if (this.checkHitWithDisplayObject(ava, otherAvatar.msg)) {
            return otherAvatar;
          }
        }

        // アバターお絵描きとの判定
        if (otherAvatar.oekakiGraphics && otherAvatar.oekakiGraphics.parent === otherAvatar.container) {
          if (this.checkHitWithOekaki(ava, otherAvatar, otherAvatar.oekakiGraphics)) {
            return otherAvatar;
          }
        }
      }
    }

    // 2. 部屋のお絵描きとの判定
    if (room.oekakiGraphics && room.oekakiGraphics.parent === room.container) {
      // if(room.oekakiGraphics) {console.log("room.oekakiGraphicsはあります");};
      // if(room.oekakiGraphics.hitArea) {console.log("room.oekakiGraphics.hitAreaはあります");};
      if (this.checkHitWithOekaki(ava, room, room.oekakiGraphics)) {
        return room;
      }
    }

    // 3. その他のオブジェクトとの判定
    for (const otherObjContainer of roomContainer.children) {
      if (otherObjContainer === ava.container) continue;
      const otherObj = Object.values(objMap).find(obj => obj.container === otherObjContainer);
      if (!otherObj) continue;

      const tags = otherObj.tags || [];
      const canStand = tags.includes("standable") ||
        (ava.avatarAlpha < 0.5 && tags.includes("standableWhenTranslucent")) ||
        (room.name === "エントランス" && ava.is2F && tags.includes("standable2F")) ||
        (room.name === "エントランス" && !ava.is2F && tags.includes("standable1F"));

      if (canStand && hitAB(ava, otherObj)) {
        return otherObj;
      }
    }

    return null;
  }

  // アバターの表示オブジェクト（名前タグ・吹き出し）との当たり判定
  // displayObject は otherAvatar.container の直接の子である前提
  checkHitWithDisplayObject(ava, displayObject) {
    if (!displayObject || !displayObject.parent) return false;

    const p = displayObject.parent;
    const psx = p.scale?.x ?? 1;
    const psy = p.scale?.y ?? 1;

    // スパイクポリゴン判定
    if (displayObject._hitPolygon) {
      const localX = (ava.container.x - ((p.x || 0) + (displayObject.x || 0) * psx)) / psx;
      const localY = (ava.container.y - ((p.y || 0) + (displayObject.y || 0) * psy)) / psy;
      return displayObject._hitPolygon.contains(localX, localY);
    }

    // 通常AABB判定
    const worldW = displayObject.width * psx;
    const worldH = displayObject.height * psy;
    if (worldW <= 0 || worldH <= 0) return false;

    const worldX = (p.x || 0) + (displayObject.x || 0) * psx;
    const worldY = (p.y || 0) + (displayObject.y || 0) * psy;

    return ava.container.x >= worldX &&
      ava.container.x <= worldX + worldW &&
      ava.container.y >= worldY &&
      ava.container.y <= worldY + worldH;
  }

  // お絵描きとの当たり判定（線に沿った判定）
  checkHitWithOekaki(ava, targetObject, oekakiGraphics) {
    if (!oekakiGraphics || !oekakiGraphics.hitArea) {
      return false;
    }

    // アバターのお絵描きの場合は、両方とも同じ座標系（ワールド座標）で判定
    if (targetObject.token) {
      // アバター同士の場合：両方ともワールド座標
      const avaWorldX = ava.container.x;
      const avaWorldY = ava.container.y;


      // アバターのお絵描きはローカル座標で記録されているので、ワールド座標に変換
      if (typeof oekakiGraphics.hitArea.contains === 'function') {
        return oekakiGraphics.hitArea.containsWorld
          ? oekakiGraphics.hitArea.containsWorld(avaWorldX, avaWorldY)
          : this.checkAvatarOekakiHit(ava, targetObject);
      }
    } else {
      // 部屋のお絵描きの場合：従来通り
      const localX = ava.container.x - targetObject.container.x;
      const localY = ava.container.y - targetObject.container.y;

      if (typeof oekakiGraphics.hitArea.contains === 'function') {
        return oekakiGraphics.hitArea.contains(localX, localY);
      }
    }

    return false;
  }

  // アバターのお絵描きとの当たり判定（直接計算版）
  checkAvatarOekakiHit(ava, targetAvatar) {
    if (!targetAvatar.drawHistory || targetAvatar.drawHistory.length === 0) {
      return false;
    }

    const tolerance = 3; // 許容距離
    const avaX = ava.container.x;
    const avaY = ava.container.y;
    const avatarX = targetAvatar.container.x;
    const avatarY = targetAvatar.container.y;

    // 描画履歴から線との距離を計算
    for (const line of targetAvatar.drawHistory) {
      if (line.type === "line" && line.pointer && line.pointer.length > 1) {
        for (let i = 0; i < line.pointer.length - 1; i++) {
          const p1 = line.pointer[i];
          const p2 = line.pointer[i + 1];

          // ローカル座標をワールド座標に変換
          const worldP1X = p1.x + avatarX;
          const worldP1Y = p1.y + avatarY;
          const worldP2X = p2.x + avatarX;
          const worldP2Y = p2.y + avatarY;

          const distance = this.distanceToLineSegment(avaX, avaY, worldP1X, worldP1Y, worldP2X, worldP2Y);

          if (distance <= tolerance) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * 固定タイムステップでの落下（物理）更新処理
   *
   * このメソッドはフレームレートに依存しない安定した物理更新を行うための仕組みです。
   * 大まかな流れ：
   * 1. 現在時刻を取得して前回の更新からの経過時間を計算（frameTime）。
   * 2. 経過時間を累積変数（accumulator）に足す。
   * 3. accumulator が固定ステップ（fixedTimeStep）以上ある限り、固定ステップで updatePhysics を呼ぶ。
   * 4. 一フレームあたりの反復回数は最大6回に制限し、スパイラルオブデスを緩和する。
   *
   * 注記：
   * - performance.now() を使ってミリ秒精度で経過時間を取得している。
   * - frameTime は極端に大きくならないよう 100ms にクランプしている（長時間停止後の一気処理対策）。
   * - accumulator も maxAccumulator によって上限がある（長時間再生不能だった後等の暴走防止）。
   * - updatePhysics はミリ秒単位の deltaTime を受け取り、その中で落下量や衝突判定などを行う想定。
   */
  fallDawn() {
    // 現在時刻（ミリ秒）を取得
    const currentTime = performance.now();

    // 「前回の物理更新からの経過時間」を計算
    // 極端に大きな差分が来たときのジャンプを防ぐため 100ms で打ち切る
    const frameTime = Math.min(currentTime - this.lastPhysicsUpdate, 100); // 最大100ms制限
    // 今回の時刻を lastPhysicsUpdate に記録（次回の差分計算用）
    this.lastPhysicsUpdate = currentTime;

    // 固定ステップ用の累積時間に追加
    this.accumulator += frameTime;

    // スパイラルオブデス（処理負荷で更新が追いつかず accumulator が増え続ける現象）防止
    if (this.accumulator > this.maxAccumulator) {
      this.accumulator = this.maxAccumulator;
    }

    // 固定タイムステップ（this.fixedTimeStep）で物理演算を行う。
    // ただし一フレームでの反復回数は最大6回に制限（重い処理による負荷上昇を抑える）
    let iterations = 0;
    while (this.accumulator >= this.fixedTimeStep && iterations < 6) {
      // updatePhysics に渡す deltaTime はミリ秒単位を想定
      this.updatePhysics(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
      iterations++;
    }
  }

  updatePhysics(deltaTime) {
    if (this.isMoving) return;

    // 他人のアバターは乗り物追従のみ（重力は自分だけが計算する）
    if (this.token !== myToken) {
      if (this.ridingObject) this.updateRiding();
      return;
    }

    // ===== 自分のアバターの物理 =====

    // 乗り物の上にいる場合：追従して降車チェック
    if (this.ridingObject) {
      this.updateRiding();
      if (this.ridingObject.token) {
        // アバター乗り: hitABは不安定なのでridingOffsetのY範囲で降車判定
        const bSpr = this.ridingObject.avaC;
        let minLocalY = -60; // fallback
        if (bSpr && bSpr.hitArea && bSpr.hitArea.points) {
          const pts = bSpr.hitArea.points;
          let mY = Infinity;
          for (let i = 1; i < pts.length; i += 2) if (pts[i] < mY) mY = pts[i];
          minLocalY = mY;
        }
        if (this.ridingOffset.y > 5 || this.ridingOffset.y < minLocalY - 15) {
          this.stopRiding();
          this.sendTransformData("落下開始");
        }
      } else {
        const standingOn = this.isStandingOnObject(this);
        if (!standingOn || standingOn !== this.ridingObject) {
          this.stopRiding();
          this.sendTransformData("落下開始");
        }
      }
      return;
    }

    // 地面チェック
    const standingOn = this.isStandingOnObject(this);
    const wasFlying = this.dropVelocity > 1;
    // 別アバターは落下中のみ着地扱い（スポーン重なりで誤停止しないよう）
    if (standingOn && (!standingOn.token || wasFlying)) {
      this.dropVelocity = 1;
      if (this.isMovingObject(standingOn)) {
        if (!standingOn.token) {
          // 動く乗り物（非アバター）への着地
          this.startRiding(standingOn);
        } else {
          // アバターへの着地: A が B の頭頂部付近にいる場合のみ乗車（体通過・スポーン重なりを除外）
          const bC = standingOn.container || standingOn;
          const bSpr = standingOn.avaC;
          const bScaleY = bC.scale?.y ?? 1;
          let headWorldY = bC.y - 50; // fallback: 50px above B's origin
          if (bSpr && bSpr.hitArea && bSpr.hitArea.points) {
            const pts = bSpr.hitArea.points;
            let minLocalY = Infinity;
            for (let i = 1; i < pts.length; i += 2) if (pts[i] < minLocalY) minLocalY = pts[i];
            headWorldY = bC.y + minLocalY * bScaleY;
          }
          if (this.container.y <= headWorldY + 12) {
            this.startRiding(standingOn);
          } else if (wasFlying) {
            this.sendTransformData("着地");
          }
        }
      } else if (wasFlying) {
        this.sendTransformData("着地");
      }
    } else if (standingOn && standingOn.token && !wasFlying && this.isStandingOnObject(this, true)) {
      // 別アバターと重なっているが飛行中でない、かつ床オブジェクトがある → 落下させない
      this.dropVelocity = 1;
    } else if (Object.values(videoFloorObjects).some(f => {
      const dy = this.container.y - f.container.y;
      const dx = this.container.x - f.container.x;
      return dy > 0 && dy <= (f._pixiH || VIDEO_FLOOR_H) && dx >= -20 && dx < (f._pixiW || 660) + 20;
    })) {
      // ビデオフロア上は重力なし（x/y範囲内のフロアに限定）
      this.dropVelocity = 1;
    } else {
      // 空中 → 落下
      if (this.dropVelocity <= 150) {
        this.dropVelocity = Math.round((this.dropVelocity * 1.08) * 100) / 100;
      }
      const deltaY = (this.dropVelocity * deltaTime) / 1000;
      this.container.y = Math.round((this.container.y + deltaY) * 100) / 100;
      AY = this.container.y;

      // キー移動中はtapMapが位置を担うのでtransformDataは送らない（二重送信でのjitter防止）
      if (!keyMoveTickerFn) {
        const now = performance.now();
        if (now - this.lastFallSendTime > 50) {
          this.lastFallSendTime = now;
          this.sendTransformData("落下中");
        }
      }
    }
  }

  // 乗り物・アバターへの追従
  updateRiding() {
    if (!this.ridingObject || this.isMoving) return;
    const objContainer = this.ridingObject.container || this.ridingObject;
    const sx = objContainer.scale?.x ?? 1;
    const sy = objContainer.scale?.y ?? 1;
    const newX = (objContainer.x || 0) + this.ridingOffset.x * sx;
    const newY = (objContainer.y || 0) + this.ridingOffset.y * sy;

    this.container.x = newX;
    this.container.y = newY;

    if (this.token === myToken) {
      AX = newX;
      AY = newY;
    }
  }

  startRiding(targetObject) {
    if (this.ridingObject === targetObject) return;

    this.ridingObject = targetObject;
    this.dropVelocity = 1;

    const objContainer = targetObject.container || targetObject;
    const sx = objContainer.scale?.x ?? 1;
    const sy = objContainer.scale?.y ?? 1;
    // ローカル座標で保存（スケールが変わっても追従できるように）
    this.ridingOffset.x = (this.container.x - (objContainer.x || 0)) / (sx || 1);
    this.ridingOffset.y = (this.container.y - (objContainer.y || 0)) / (sy || 1);

    if (this.token === myToken) {
      this.sendTransformData("乗車開始");
    }
  }

  // 自分の位置・乗車状態をサーバーに送信
  // isFalling=true の時、受け取り側はgsap補間をスキップして直接位置セット
  sendTransformData(reason = "位置同期") {
    if (this.token !== myToken) return;
    if (isReconnecting) return; // 再接続中はemit不要
    if (_inRoomTransition) return; // 部屋遷移中は古い位置を送らない

    const sendData = {
      DIR: DIR,
      AX: Math.round(this.container.x * 100) / 100,
      AY: Math.round(this.container.y * 100) / 100,
      reason: reason,
      isFalling: this.dropVelocity > 1 && !this.ridingObject,
      fromCloud: reason === "雲からの降車",
      is2F: entranceIs2F,
    };

    const _isVFRiding = this.ridingObject && Object.values(videoFloorObjects).includes(this.ridingObject);
    if (this.ridingObject && !_isVFRiding) {
      sendData.ridingData = {
        objectName: this.ridingObject.token || this.ridingObject.name,
        offsetX: Math.round(this.ridingOffset.x * 100) / 100,
        offsetY: Math.round(this.ridingOffset.y * 100) / 100,
      };
    } else {
      sendData.ridingData = null;
    }

    socket.emit("transformData", sendData);
    if (_isKonaRoom() && _konaCurrentHostToken !== myToken && Date.now() - _konaLastHostChangeAt > 2000) {
      socket.emit("konaHostClaim");
    }
  }

  stopRiding() {
    if (!this.ridingObject) return;
    this.ridingObject = null;
    this.ridingOffset = { x: 0, y: 0 };
    if (this.token === myToken) {
      AX = this.container.x;
      AY = this.container.y;
      this.sendTransformData("降車");
    }
  }

  // 乗り物かどうかの判定（タグ "moving" または アバター）
  isMovingObject(targetObject) {
    if (targetObject.token) return true; // アバター同士
    const tags = targetObject.tags || [];
    return tags.includes("moving");
  }

  avaLoop() {
    if (this.ridingObject && !this.isMoving) {
      this.updateRiding();
    }

    const roomPhysics = ROOM_PHYSICS[room.name];
    if (roomPhysics?.gravity) {
      this.fallDawn();

      const currentY = this.container.y;
      if (currentY !== this.lastScaleY) {
        const ps = roomPhysics.perspectiveScale;
        if (ps) {
          const t = Math.max(0, Math.min(1, (currentY - ps.minY) / (ps.maxY - ps.minY)));
          const scale = ps.minScale + t * (ps.maxScale - ps.minScale);
          this.container.scale.x = scale;
          this.container.scale.y = scale;
        } else if (0 < currentY && currentY <= 180) {
          const scale = currentY / 180;
          this.container.scale.x = scale;
          this.container.scale.y = scale;
        } else if (currentY > 180) {
          this.container.scale.x = 1;
          this.container.scale.y = 1;
        }
        this.lastScaleY = currentY;
      }
    }

    if (!roomPhysics?.perspectiveScale) {
      if (_roomAvatarScale !== 1.0 || dbScaleZones.length > 0) {
        let tgt = _roomAvatarScale;
        const ax = this.container.x, ay = this.container.y;
        for (const z of dbScaleZones) {
          if (ax >= z.x && ax <= z.x + z.width && ay >= z.y && ay <= z.y + z.height) {
            tgt = z.scale; break;
          }
        }
        const diff = tgt - this._avatarRoomScale;
        if (Math.abs(diff) > 0.001) {
          this._avatarRoomScale += diff * 0.15;
          this.container.scale.set(this._avatarRoomScale);
        }
      } else if (this._avatarRoomScale !== 1.0) {
        this._avatarRoomScale = 1.0;
        this.container.scale.set(1.0);
      }
    }
  }
}

// 他ユーザーの位置修正を受信した時の処理
socket.on('transformOtherAvatarData', data => {
  const avatar = avaP[data.token];
  if (!avatar || avatar.abon) return;

  if (data.ridingData) {
    // 乗車中：乗り物を特定して ridingObject をセット
gsap.killTweensOf(avatar.container);
    avatar.isMoving = false; // tappedMove中にkillされてもisMovingをリセット（updateRidingが止まるのを防ぐ）
    const ridingObject = avaP[data.ridingData.objectName] || objMap[data.ridingData.objectName];
    if (ridingObject) {
      avatar.startRiding(ridingObject);
      // startRiding で計算されたオフセットをサーバー値（ローカル座標）で上書き
      avatar.ridingOffset.x = data.ridingData.offsetX;
      avatar.ridingOffset.y = data.ridingData.offsetY;
      // 位置を乗り物から計算して直接セット（スケール込み）
      const objContainer = ridingObject.container || ridingObject;
      const sx = objContainer.scale?.x ?? 1;
      const sy = objContainer.scale?.y ?? 1;
      avatar.container.position.set(
        (objContainer.x || 0) + data.ridingData.offsetX * sx,
        (objContainer.y || 0) + data.ridingData.offsetY * sy
      );
    }
  } else {
    // 非乗車
    const wasRiding = !!avatar.ridingObject;
    if (avatar.ridingObject) avatar.stopRiding();

    // 降車確定: 保留していたtapMapがあれば実行
    let executedPendingTapMap = false;
    if (wasRiding && avatar._pendingTapMap) {
      const pm = avatar._pendingTapMap;
      avatar._pendingTapMap = null;
      avatar.tappedMove(pm.AX, pm.AY, pm.DIR, pm.sit);
      executedPendingTapMap = true;
    }

    if (!executedPendingTapMap) {
      const dx = data.AX - avatar.container.x;
      const dy = data.AY - avatar.container.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // sender がゲームエリア移動中 (videoFloor なし) に receiver 側アバターがフロア上にいる場合はスナップしない
      const noFloorSnap = data.AY < VIDEO_FLOOR_Y && avatar.container.y >= VIDEO_FLOOR_Y && Object.keys(videoFloorObjects).length > 0;
      const tapMapFresh = avatar._lastTapMapAt && (Date.now() - avatar._lastTapMapAt) < 500;
      if (data.forceCorrection || (!noFloorSnap && dist > 80)) {
        gsap.killTweensOf(avatar.container);
        avatar.container.position.set(data.AX, data.AY);
      } else if (!noFloorSnap && !tapMapFresh && data.isFalling && !avatar._mugenDR) {
        gsap.to(avatar.container, { duration: 0.04, x: data.AX, y: data.AY, ease: "none", overwrite: "auto" });
      } else if (!noFloorSnap && !tapMapFresh && dist > 5 && !avatar._mugenDR) {
        gsap.to(avatar.container, { duration: 0.2, x: data.AX, y: data.AY, ease: "none" });
      }
    }
  }

  if (data.token === myToken) {
    AX = data.AX;
    AY = data.AY;
    DIR = data.DIR;
  }

  if (data.is2F !== undefined) avatar.is2F = data.is2F;

  avatar.dropVelocity = 1;
});

class GameObject {
  static getOrCreateObject(sprite, name, tags = []) {
    if (!(objMap[name] instanceof GameObject)) {
      // objMapになければ新しくGameObjectインスタンスを作ってobjMapに保存
      objMap[name] = new GameObject(sprite, name, tags);
    }
    return objMap[name];
  }
  constructor(sprite, name, tags = []) {
    this.name = name;
    this.tags = tags;
    this.container = new PIXI.Container();
    this.container.eventMode = 'static';
    this.container.sortableChildren = true;
    this.sprite = sprite;
    this.container.addChild(this.sprite);
  }

  // 動くオブジェクトかどうかを判定
  isMoving() {
    return this.tags.includes("moving");
  }
}

class Room extends GameObject {
  // Roomインスタンスを取得または新規作成する静的メソッド
  // sprite: 部屋のPIXI.SpriteやGraphics
  // name: 部屋名
  // tags: 部屋のタグ配列（省略可）
  static getOrCreateRoom(sprite, name, tags = []) {
    // objMapに既存のRoomインスタンスがなければ新しく作成して保存
    if (!(objMap[name] instanceof Room)) {//instanceofはあるオブジェクトが特定のクラスから生成されたかどうかを判定する演算子
      objMap[name] = new Room(sprite, name, tags);
    }
    // Roomインスタンスを返す
    return objMap[name];
  }
  constructor(sprite, name, tags) {
    super(sprite, name, tags);
    this.drawHistory = [];
    this.oekakiGraphics = new PIXI.Graphics();
    this.oekakiGraphics.zIndex = 5;
    this.container.addChild(this.oekakiGraphics);
    this.roomPolygons = [];
    this.drawHistory = [];
    this.redoStack = [];
    stageMove(this.container);

    this.roomGraphics = new PIXI.Graphics();

    switch (name) {
      case "エントランス": {
        // 2階フロア
        const floor2FContainer = new PIXI.Container();
        entrance2FFloor = { container: floor2FContainer, tags: ["standable2F"], name: "エントランス2階の地" };
        objMap["エントランス2階の地"] = entrance2FFloor;
        floor2FContainer.hitArea = new PIXI.Polygon([0,152,159,151,239,152,298,160,362,175,439,200,514,224,590,251,660,284,660,405,576,334,510,292,460,267,404,242,357,222,320,210,297,201,289,200,276,224,254,239,231,253,199,265,164,272,135,282,99,289,61,301,30,309,0,320,0,249,52,242,94,236,136,226,172,217,198,206,216,196,220,177,215,168,187,166,168,164,132,164,86,164,38,164,0,164,0,152]);
        this.container.addChild(floor2FContainer);
        // 1階フロア
        const floor1FContainer = new PIXI.Container();
        entrance1FFloor = { container: floor1FContainer, tags: ["standable1F"], name: "エントランス1階の地" };
        objMap["エントランス1階の地"] = entrance1FFloor;
        floor1FContainer.hitArea = new PIXI.Polygon([0,185,660,184,660,460,0,460]);
        this.container.addChild(floor1FContainer);
        if (leftPole) {
          leftPole = GameObject.getOrCreateObject(leftPole, "leftPole");
          leftPole.container.x = 0;
          leftPole.container.y = 0;
          leftPole.container.zIndex = 80;
          leftPole.container.eventMode = 'none';
          this.container.addChild(leftPole.container);
        }
        if (rightPole) {
          rightPole = GameObject.getOrCreateObject(rightPole, "rightPole");
          rightPole.container.x = 0;
          rightPole.container.y = 0;
          rightPole.container.zIndex = 80;
          rightPole.container.eventMode = 'none';
          this.container.addChild(rightPole.container);
        }
        if (bridge0) {
          bridge0 = GameObject.getOrCreateObject(bridge0, "bridge0");
          bridge0.container.x = 0;
          bridge0.container.y = 0;
          bridge0.container.zIndex = 150;
          bridge0.container.eventMode = 'none';
          this.container.addChild(bridge0.container);
        }
        if (bridge1) {
          bridge1 = GameObject.getOrCreateObject(bridge1, "bridge1");
          bridge1.container.x = 0;
          bridge1.container.y = 0;
          bridge1.container.zIndex = 250;
          bridge1.container.eventMode = 'none';
          this.container.addChild(bridge1.container);
        }
        if (bridge2) {
          bridge2 = GameObject.getOrCreateObject(bridge2, "bridge2");
          bridge2.container.x = 0;
          bridge2.container.y = 0;
          bridge2.container.zIndex = 350;
          bridge2.container.eventMode = 'none';
          this.container.addChild(bridge2.container);
        }
        break;
      }

      case "草原":
        meadow = GameObject.getOrCreateObject(meadow, "草原の地", ["standable"]);
        // setMultiPolygonHitArea(meadow, polygons["meadow"]); // meadowのhitAreaを追加
        // drawMultiPolygonGraphics(entrance, polygons["meadow"]);
        if (polygons["meadow"] && polygons["meadow"].length > 0)
          meadow.container.hitArea = new PIXI.Polygon(polygons["meadow"][0]);
        this.container.addChild(meadow.container);

        rainbow = GameObject.getOrCreateObject(rainbow, "虹", ["standableWhenTranslucent"]);
        rainbow.container.hitArea = new PIXI.Polygon([
          396, 270,
          403, 251,
          406, 246,
          409, 241,
          413, 235,
          414, 234,
          424, 221,
          425, 220,
          427, 218,
          428, 217,
          446, 204,
          449, 202,
          454, 199,
          455, 198,
          460, 195,
          462, 193,
          473, 184,
          482, 178,
          534, 156,
          547, 154,
          553, 153,
          558, 152,
          578, 150,
          618, 146,
          660, 145,
          660, 217,
          584, 214,
          566, 216,
          563, 217,
          558, 218,
          549, 220,
          545, 221,
          539, 224,
          524, 230,
          521, 231,
          519, 232,
          510, 236,
          504, 239,
          500, 242,
          497, 244,
          491, 249,
          482, 258,
          472, 275,
        ]);
        // setMultiPolygonHitArea(rainbow, polygons["rainbow"]); // rainbowのhitAreaを追加
        // drawMultiPolygonGraphics(entrance, polygons["rainbow"]);
        this.container.addChild(rainbow.container);

        // 雲コンテナを作成
        const cloudContainer = new PIXI.Container();
        cloud1.position.set(111, 91);
        cloud2.position.set(418, 38);
        cloudContainer.addChild(cloud1);
        cloudContainer.addChild(cloud2);
        cloud = GameObject.getOrCreateObject(cloudContainer, "雲", ["standable", "moving"]);
        if (polygons["cloud"] && polygons["cloud"].length > 0) {
          setMultiPolygonHitArea(cloud.container, polygons["cloud"]);
        }

        this.container.addChild(cloud.container);

        // 雲の同期用設定（全クライアント共通の基準時刻）
        const _now = new Date();
        this.cloudSync = {
          // 今月1日UTC深夜0時（毎月自動更新・全クライアント共通）
          gameStartTime: Date.UTC(_now.getUTCFullYear(), _now.getUTCMonth(), 1),

          // 雲の移動設定
          cloudSpeed: -30,           // 通常速度（ピクセル/秒）
          windSpeed: 90,            // 風の時の速度（ピクセル/秒）
          screenWidth: 660,
          cloudWidth: 660,

          // 風の発生パターン設定
          windCheckInterval: 15000, // 15秒ごとに風の発生をチェック
          windProbability: 0.3,     // 30%の確率で風が発生
          windMinDuration: 3000,    // 最短3秒間
          windMaxDuration: 7000,    // 最長7秒間

          // 疑似ランダム用のシード値（固定値）
          windSeed: 54321,
          durationSeed: 98765,
        };

        bonfire = GameObject.getOrCreateObject(bonfire, "焚火");
        bonfire.container.eventMode = "none";
        bonfire.container.position.set(248, 248);
        bonfire.container.zIndex = 325;//アバターのy座標が324以下の時は前に出す。
        this.container.addChild(bonfire.container);

        daikokubasira = GameObject.getOrCreateObject(daikokubasira, "大黒柱", ["standable"]);
        daikokubasira.container.position.set(125, 200);
        daikokubasira.container.zIndex = 300;
        this.container.addChild(daikokubasira.container);
        this.roomPolygons = [meadow, cloud, rainbow];
        break;

      case "うちゅー":
        break;

      case "文字の部屋":
      case "粉の部屋": {
        const konaBg = new PIXI.Graphics();
        konaBg.beginFill(name === "粉の部屋" ? 0x0a0008 : 0x000000);
        konaBg.drawRect(0, 0, 660, 480);
        konaBg.endFill();
        this.container.addChild(konaBg);

        // 地面ライン (Y=KONA_GROUND_Y)
        const konaGroundLine = new PIXI.Graphics();
        konaGroundLine.lineStyle(1, 0x2a2a2a, 1);
        konaGroundLine.moveTo(0, KONA_GROUND_Y);
        konaGroundLine.lineTo(660, KONA_GROUND_Y);
        konaGroundLine.eventMode = 'none';
        this.container.addChild(konaGroundLine);

        // 粉パーティクル用コンテナ
        _konaContainer = new PIXI.Container();
        _konaContainer.zIndex = 150;
        _konaContainer.sortableChildren = true;
        this.container.addChild(_konaContainer);
        this._konaContainer = _konaContainer;

        // 床オブジェクト（hitArea: Y=KONA_GROUND_Y 以下を standable に）
        const konaFloorGfx = new PIXI.Graphics();
        konaFloorGfx.beginFill(0x111111, 0.01);
        konaFloorGfx.drawRect(0, KONA_GROUND_Y, 660, 480 - KONA_GROUND_Y);
        konaFloorGfx.endFill();
        konaFloorGfx.hitArea = new PIXI.Rectangle(0, KONA_GROUND_Y, 660, 480 - KONA_GROUND_Y);
        konaFloorGfx.eventMode = 'none';
        this.container.addChild(konaFloorGfx);

        _konaFloor = { container: konaFloorGfx, tags: ['standable'], name: '粉の床' };
        objMap['粉の床'] = _konaFloor;
        this.roomPolygons = [_konaFloor];
        break;
      }

      case "むげんのいりぐち": {
        // 白背景
        const mgBg = new PIXI.Graphics();
        mgBg.beginFill(0xffffff);
        mgBg.drawRect(0, 0, 660, 480);
        mgBg.endFill();
        this.container.addChild(mgBg);

        // GATEスプライト（中央）
        const gateSprite = new PIXI.Sprite(gateTex);
        gateSprite.anchor.set(0.5, 0.5);
        gateSprite.position.set(330, 240);
        gateSprite.zIndex = 310;
        this.container.addChild(gateSprite);
        break;
      }

      case "むげん": {
        // 黒背景
        const mugenBg = new PIXI.Graphics();
        mugenBg.beginFill(0xffffff);
        mugenBg.drawRect(0, 0, 660, 480);
        mugenBg.endFill();
        this.container.addChild(mugenBg);

        // 上下左右の中央端にGATE（scale 1/4）
        const gatePositions = [
          { x: 330, y: 0,   ax: 0.5, ay: 0,   tint: 0xffffff },  // 上：黒っぽく(0x444444)
          { x: 330, y: 480, ax: 0.5, ay: 1,   tint: 0xffffff },  // 下：青っぽく(0xaabbff)
          { x: 0,   y: 240, ax: 0,   ay: 0.5, tint: 0xffffff },  // 左：白っぽく(0xffffff)
          { x: 660, y: 240, ax: 1,   ay: 0.5, tint: 0xffffff },  // 右：赤っぽく(0xff2020)
        ];
        mugenGateSprites = [];
        gatePositions.forEach((pos, i) => {
          const gs = new PIXI.Sprite(gateTex);
          gs.anchor.set(pos.ax, pos.ay);
          gs.position.set(pos.x, pos.y);
          gs.scale.set(2 / 5);
          gs.tint = MUGEN_GATE_TINT_EMPTY;
          gs.zIndex = 10;
          gs.eventMode = 'static';
          gs.cursor = 'pointer';
          gs.on('pointerdown', (e) => { e.stopPropagation(); onMugenGateClick(i); });
          mugenGateSprites[i] = gs;
          this.container.addChild(gs);
        });

        break;
      }

      case "東の部屋":
      case "南の部屋":
      case "西の部屋":
      case "北の部屋": {
        const dirBg = new PIXI.Graphics();
        dirBg.beginFill(0x000000);
        dirBg.drawRect(0, 0, 660, 480);
        dirBg.endFill();
        dirBg.zIndex = 0;
        this.container.addChild(dirBg);

        const dirChar = new PIXI.Text(name[0], { fontFamily: 'serif', fontSize: 200, fill: 0xffffff });
        dirChar.anchor.set(0.5, 0.5);
        dirChar.position.set(330, 240);
        dirChar.zIndex = 5;
        dirChar.eventMode = 'none';
        this.container.addChild(dirChar);

        this.dirBgSprite = null;
        this.container.sortableChildren = true;

        const dirGatePositions = [
          { x: 0,   y: 0,   ax: 0, ay: 0 },
          { x: 660, y: 0,   ax: 1, ay: 0 },
          { x: 0,   y: 480, ax: 0, ay: 1 },
          { x: 660, y: 480, ax: 1, ay: 1 },
        ];
        if (!directionGateRooms[name]) directionGateRooms[name] = [null, null, null, null];
        directionGateSprites[name] = [];
        dirGatePositions.forEach((pos, i) => {
          const gs = new PIXI.Sprite(gateTex);
          gs.anchor.set(pos.ax, pos.ay);
          gs.position.set(pos.x, pos.y);
          gs.scale.set(2 / 5);
          gs.tint = (directionGateRooms[name] || [])[i] ? MUGEN_GATE_TINTS[i] : MUGEN_GATE_TINT_EMPTY;
          gs.zIndex = 10;
          gs.eventMode = 'static';
          gs.cursor = 'pointer';
          gs.on('pointerdown', (e) => { e.stopPropagation(); onDirectionGateClick(name, i); });
          directionGateSprites[name][i] = gs;
          this.container.addChild(gs);
        });
        break;
      }

      case "星1":
        //背景
        const sg = new PIXI.Graphics();
        sg.beginFill(0x000000);
        sg.drawRect(0, 0, 660, 480);
        sg.endFill();
        this.container.addChild(sg);

        //星
        let treeScale = 1;//枝の短くなる比率
        let colorIndex = 0;
        this.f = 200;
        this.starGraphicsList = [];

        this.removeStars = () => {  // 星を全て消す関数
          if (this.starGraphicsList) {
            this.starGraphicsList.forEach(g => {
              this.container.removeChild(g);
              g.destroy(); // メモリも解放
            });
            this.starGraphicsList = [];
          }
        };
        this.drawStar = (x1, y1, len, stand, angle, starColors) => {//初期x座標、初期y座標、初期の枝長さ,枝の傾き,枝の広がり

          let x2 = x1 + len * Math.sin(this.radians(stand));
          let y2 = y1 - len * Math.cos(this.radians(stand));
          let g = new PIXI.Graphics();
          g.lineStyle(1, starColors[colorIndex % starColors.length]);
          colorIndex++;
          g.moveTo(x1, y1);
          g.lineTo(x2, y2);
          this.container.addChild(g);
          this.starGraphicsList.push(g); // 追加

          if (this.f < 1) return;
          this.f -= 1;
          this.drawStar(x2, y2, len * treeScale, stand - angle, this.f, starColors);
          this.drawStar(x2, y2, len * treeScale, stand + angle, this.f, starColors);
        }

        this.radians = degree => {//度をラジアンに変換
          return degree * (Math.PI / 180);
        }
        break;

      case 'loginRoom': {
        const lg = new PIXI.Graphics();
        lg.beginFill(0x4C4C52);
        lg.drawRect(0, 0, 660, 480);
        lg.endFill();
        lg.zIndex = -2;
        this.container.addChild(lg);

        // 【色設定】ここを変更すると色が変わります
        const BUTTON_COLORS = {
          mainTextColor: 0x4C4C52,      // メインテキストの色
          normalGlowColor: parseColorCode(localStorage.getItem("colorCode")) || 0xFFFF1A,    // 通常時のグロー色（黄色）
          hoverGlowColor: 0xFF0000,     // ホバー時のグロー色（赤）
        };

        // テキストスタイル
        const textStyle = {
          fontFamily: 'Arial, sans-serif',
          fontSize: 25,
          fontWeight: 'bold',
          letterSpacing: 4,
          align: 'center'
        };

        // 極細グロー作成（明滅可能）
        function createFlickerableGlow(text, mainColor, glowColor) {
          const container = new PIXI.Container();

          const glowLayers = [];
          for (let d = 3; d >= 1; d--) {
            const alpha = (0.02 + (3 - d + 1) * (0.13 / 3));
            const steps = Math.max(8, Math.min(32, d * 4));
            glowLayers.push({ distance: d, alpha: alpha, steps: steps });
          }

          glowLayers.forEach(layer => {
            for (let i = 0; i < layer.steps; i++) {
              const angle = (360 / layer.steps) * i;
              const radian = (angle * Math.PI) / 180;
              const x = Math.cos(radian) * layer.distance;
              const y = Math.sin(radian) * layer.distance;

              const glowText = new PIXI.Text(text, {
                ...textStyle,
                fill: glowColor
              });
              glowText.anchor.set(0.5);
              glowText.x = x;
              glowText.y = y;
              glowText.alpha = layer.alpha;
              glowText.baseAlpha = layer.alpha;

              container.addChild(glowText);
            }
          });

          const centerGlow = new PIXI.Text(text, {
            ...textStyle,
            fill: glowColor
          });
          centerGlow.anchor.set(0.5);
          centerGlow.alpha = 0.05;
          centerGlow.baseAlpha = 0.05;
          container.addChild(centerGlow);

          const mainText = new PIXI.Text(text, {
            ...textStyle,
            fill: mainColor
          });
          mainText.anchor.set(0.5);
          container.addChild(mainText);

          return container;
        }

        // 明滅アニメーションを更新する関数（app.ticker.addで呼ぶ）
        function updateButtonFlicker(button, deltaTime) {
          const userData = button.userData;
          userData.time += deltaTime * 0.016;

          const activeText = userData.normalText.visible ? userData.normalText : userData.hoverText;

          // 二重明滅
          const fast = Math.sin(userData.time * 0.04 * 80) * 0.1;
          const slow = Math.sin(userData.time * 0.04 * 20) * 0.15;
          let flickerMultiplier = 0.65 + fast + slow;

          // たまにチラチラする（頻度を1/3に）
          if (Math.random() > 0.999) { // 0.99 → 0.999に変更
            flickerMultiplier *= (Math.random() * 0.4 + 0.3);
          }

          // 全体の明滅を適用（メインテキスト以外）
          activeText.children.forEach((child, index) => {
            if (index < activeText.children.length - 1) {
              child.alpha = child.baseAlpha * flickerMultiplier;
            }
          });
        }

        const loginButtonContainer = new PIXI.Container();
        const loginButton = GameObject.getOrCreateObject(loginButtonContainer, "loginButton");
        loginButton.container.cursor = 'pointer';

        // 明滅可能なグロー
        const normalText = createFlickerableGlow('LOGIN', BUTTON_COLORS.mainTextColor, BUTTON_COLORS.normalGlowColor);
        const hoverText = createFlickerableGlow('LOGIN', BUTTON_COLORS.mainTextColor, BUTTON_COLORS.hoverGlowColor);
        hoverText.visible = false;

        loginButton.container.addChild(normalText);
        loginButton.container.addChild(hoverText);

        // インタラクション
        loginButton.container.on('pointerover', () => {
          normalText.visible = false;
          hoverText.visible = true;
          loginButton.container.scale.set(1.05);
        });

        loginButton.container.on('pointerout', () => {
          normalText.visible = true;
          hoverText.visible = false;
          loginButton.container.scale.set(1.0);
        });

        loginButton.container.on('pointerdown', () => {
          loginButton.container.scale.set(0.95);
        });

        loginButton.container.on('pointerup', () => {
          loginButton.container.scale.set(1.05);
        });

        // 明滅アニメーション用のデータ
        loginButton.container.userData = {
          normalText: normalText,
          hoverText: hoverText,
          time: Math.random() * Math.PI * 2,
          lastFlickerTime: 0
        };

        this.container.addChild(loginButton.container);
        loginButton.container.x = 325;
        loginButton.container.y = 240;

        // loginRoom の場合
        const loginButtonFlicker = (delta) => {
          if (loginButton.container && loginButton.container.userData) {
            updateButtonFlicker(loginButton.container, delta);
          }
        };

        tickerListeners.push(loginButtonFlicker);
        app.ticker.add(loginButtonFlicker);
        break;
      }
    }
    //部屋でのポインター処理
    this.container.on('pointerdown', e => {
      contextMenu.style.display = "none";//前の表示のコンテキストメニューを消す
      if (e.button === 0 && warpPlaceMode) {
        const pos = e.data.getLocalPosition(this.container);
        warpPlaceStart = { x: pos.x, y: pos.y };
        if (!warpPlacePreview) {
          warpPlacePreview = new PIXI.Graphics();
          warpPlacePreview.zIndex = 1000;
          this.container.addChild(warpPlacePreview);
        }
        return;
      }
      if (e.button === 0 && _scaleZonePlaceMode) {
        const pos = e.data.getLocalPosition(this.container);
        _scaleZonePlaceStart = { x: pos.x, y: pos.y };
        if (!_scaleZonePlacePreview) {
          _scaleZonePlacePreview = new PIXI.Graphics();
          _scaleZonePlacePreview.zIndex = 1000;
          this.container.addChild(_scaleZonePlacePreview);
        }
        return;
      }
      if (e.button === 0) {//お絵描き用の処理
        isPointerDown = true;
        if (useLogHighlight && highlightToken && !isDownCtrl && !clickedWa_iButtun) {
          applyLogHighlight(null);
        }
      }
      if (['touch', 'pen'].includes(e.pointerType)) {
        let touchTimer = setTimeout(() => contextMenuPositionSet(e), 1000);//一秒長押しで、右クリックメニューを表示
        const clearTouchTimer = () => clearTimeout(touchTimer);
        document.getElementById("graphic").addEventListener("touchend", clearTouchTimer, { passive: true, once: true });

        isPointerDown = true;
      }
      if (e.button === 2) {//右クリックメニュー用の処理
        //メニューをblockで表示させる
        abonMenu.style.display = "none";
        avatarOekakiMenu.style.display = "none";
        document.getElementById('roomEditMenu').style.display = (_inUserRoom && document.getElementById('roomEditPanel').style.display === 'none') ? '' : 'none';
        contextMenu.style.display = "block";
        contextMenuPositionSet(e);
      }
    });
    //お絵かき関連
    this.drawingGraphics = new PIXI.Graphics();    // 描画中用
    this.drawingGraphics.zIndex = 10;
    this.currentLine = null;

    let target = this.container;  // マウスか、スマホをおしっぱにしてる間、ctrlを押してるか、wa_iがonになってたら線を出力
    this.container.on('pointerdown', e => {
      if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
      if (floorPolyMode) return;
      if (_imgDoodleMode) return;
      if (isPointerDown && (isDownCtrl || clickedWa_iButtun)) {
        target = avatarOekakiToken ? avaP[avatarOekakiToken].container : this.container;
        target.addChild(this.drawingGraphics);
        this.drawingGraphics.clear();
        this.drawingGraphics.lineStyle(2, oekakiColor, oekakiAlpha);

        // 座標取得を統一
        const globalPos = e.data.getLocalPosition(this.container);

        let initialX, initialY;
        if (avatarOekakiToken) {
          // アバターお絵描きの場合：アバターコンテナのローカル座標で記録
          const avatarLocalPos = e.data.getLocalPosition(avaP[avatarOekakiToken].container);
          initialX = avatarLocalPos.x;
          initialY = avatarLocalPos.y;
          lastPosition.x = avatarLocalPos.x;
          lastPosition.y = avatarLocalPos.y;
        } else {
          // 部屋お絵描きの場合：部屋コンテナのローカル座標で記録
          initialX = globalPos.x;
          initialY = globalPos.y;
          lastPosition.x = globalPos.x;
          lastPosition.y = globalPos.y;
        }

        this.drawingGraphics.moveTo(lastPosition.x, lastPosition.y);

        this.currentLine = {
          type: "line",
          token: myToken,
          uuid: uuid(),
          color: oekakiColor,
          alpha: oekakiAlpha,
          pointer: [{ x: initialX, y: initialY }],
          // アバターへの落書きの場合、現在の方向・状態キーをタグ付け（落書きパターン切り替え用）
          stateKey: avatarOekakiToken ? avaP[avatarOekakiToken].currentAvaStateKey : undefined,
        };

        oekakityu = true;
      }
    });
    function uuid() { // UUIDを生成する関数。もし衝突が報告されるようになってきたらuuidv4を検討する。
      return Math.random().toString(36).slice(2, 11);
    }

    this.container.on('pointermove', e => {
      if (!(['mouse', 'touch', 'pen'].includes(e.pointerType))) return;
      if (warpPlaceMode && warpPlaceStart && warpPlacePreview) {
        const pos = e.data.getLocalPosition(this.container);
        warpPlacePreview.clear();
        warpPlacePreview.lineStyle(2, 0x00ffcc, 0.9);
        warpPlacePreview.beginFill(0x00ffcc, 0.2);
        const rx = Math.min(warpPlaceStart.x, pos.x);
        const ry = Math.min(warpPlaceStart.y, pos.y);
        const rw = Math.min(250, Math.abs(pos.x - warpPlaceStart.x));
        const rh = Math.min(250, Math.abs(pos.y - warpPlaceStart.y));
        if (_warpPlaceShape === 'circle') {
          const r = Math.min(rw, rh) / 2;
          warpPlacePreview.drawCircle(rx + r, ry + r, r);
        } else if (_warpPlaceShape === 'ellipse') {
          warpPlacePreview.drawEllipse(rx + rw / 2, ry + rh / 2, rw / 2, rh / 2);
        } else {
          warpPlacePreview.drawRect(rx, ry, rw, rh);
        }
        warpPlacePreview.endFill();
        return;
      }
      if (_scaleZonePlaceMode && _scaleZonePlaceStart && _scaleZonePlacePreview) {
        const pos = e.data.getLocalPosition(this.container);
        _scaleZonePlacePreview.clear();
        _scaleZonePlacePreview.lineStyle(1, 0xbb44ff, 0.9);
        _scaleZonePlacePreview.beginFill(0xbb44ff, 0.2);
        const rx = Math.min(_scaleZonePlaceStart.x, pos.x);
        const ry = Math.min(_scaleZonePlaceStart.y, pos.y);
        const rw = Math.max(5, Math.abs(pos.x - _scaleZonePlaceStart.x));
        const rh = Math.max(5, Math.abs(pos.y - _scaleZonePlaceStart.y));
        _scaleZonePlacePreview.drawRect(rx, ry, rw, rh);
        _scaleZonePlacePreview.endFill();
        return;
      }
      if (isPointerDown && (isDownCtrl || clickedWa_iButtun)) {
        let currentPos;
        if (avatarOekakiToken) {
          // アバターお絵描きの場合：アバターコンテナのローカル座標を使用
          currentPos = e.data.getLocalPosition(avaP[avatarOekakiToken].container);
        } else {
          // 部屋お絵描きの場合：部屋コンテナのローカル座標を使用
          currentPos = e.data.getLocalPosition(this.container);
        }

        this.draw(currentPos.x, currentPos.y);
      }
    });

    // お絵描き中の座標を受け取って線を引く関数
    // ドラッグ開始時は新しい線を作り、ドラッグ中は線を伸ばす

    this.container.on('pointerup', e => {//カーソルを離したとき
      if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
      if (warpPlaceMode && warpPlaceStart) {
        const pos = e.data.getLocalPosition(this.container);
        const x = Math.min(warpPlaceStart.x, pos.x);
        const y = Math.min(warpPlaceStart.y, pos.y);
        const w = Math.abs(pos.x - warpPlaceStart.x);
        const h = Math.abs(pos.y - warpPlaceStart.y);
        warpPlaceStart = null;
        if (warpPlacePreview) { warpPlacePreview.clear(); }
        if (w > 0 || h > 0) {
          if (_warpPlaceShape === 'circle') {
            const size = Math.min(250, Math.max(5, Math.min(w, h)));
            saveWarpZone(x, y, size, size);
          } else {
            saveWarpZone(x, y, Math.min(250, Math.max(5, w)), Math.min(250, Math.max(5, h)));
          }
        }
        return;
      }
      if (_scaleZonePlaceMode && _scaleZonePlaceStart) {
        const pos = e.data.getLocalPosition(this.container);
        const x = Math.min(_scaleZonePlaceStart.x, pos.x);
        const y = Math.min(_scaleZonePlaceStart.y, pos.y);
        const w = Math.max(5, Math.abs(pos.x - _scaleZonePlaceStart.x));
        const h = Math.max(5, Math.abs(pos.y - _scaleZonePlaceStart.y));
        _scaleZonePlaceStart = null;
        if (_scaleZonePlacePreview) _scaleZonePlacePreview.clear();
        saveScaleZone(x, y, w, h, 1.0);
        return;
      }
      isPointerDown = false;
      if (oekakityu) {//お絵描き中なら
        this.sendCurrentLine();
        oekakityu = false;
        this.currentLine = null;

        switchDrawing(avatarOekakiToken);
      }
    });

  }
  draw(x, y) {
    // 描画は渡された座標をそのまま使用
    this.drawingGraphics.moveTo(lastPosition.x, lastPosition.y);//何故かこれを入れないと、座標0,0から線が伸びるバグ?が起きる,v8等にアップデートすることがあったら消してみる
    this.drawingGraphics.lineTo(x, y);

    if (this.currentLine && this.currentLine.pointer) {
      // 座標もそのまま記録（既にローカル座標に変換済み）
      this.currentLine.pointer.push({ x, y });
    }

    // 最後の座標を更新
    lastPosition.x = x;
    lastPosition.y = y;
  }
  // 線描画時にhitAreaも更新する関数
  updateOekakiHitArea(target) {
    if (!target.oekakiGraphics) {
      console.error('oekakiGraphicsが存在しません');
      return;
    }

    // 既存のhitAreaをクリア
    if (target.oekakiHitArea) {
      target.oekakiHitArea.clear();
    } else {
      target.oekakiHitArea = new PIXI.Graphics();
      target.oekakiHitArea.visible = false;
      target.container.addChild(target.oekakiHitArea);
    }

    let hasValidLines = false;

    // 描画履歴から線ごとにhitAreaを作成
    target.drawHistory.forEach(line => {
      if (line.type === "line" && line.pointer && line.pointer.length > 1) {
        target.oekakiHitArea.lineStyle(20, 0x000000, 1);
        target.oekakiHitArea.beginFill(0x000000, 0.01);

        target.oekakiHitArea.moveTo(line.pointer[0].x, line.pointer[0].y);
        for (let i = 1; i < line.pointer.length; i++) {
          target.oekakiHitArea.lineTo(line.pointer[i].x, line.pointer[i].y);
        }

        target.oekakiHitArea.endFill();
        hasValidLines = true;
      }
    });

    // hitAreaを設定（スケール対応）
    if (hasValidLines) {
      if (target.token) {
        // アバター用：スケール考慮のワールド座標判定
        target.oekakiGraphics.hitArea = {
          _target: target,
          contains: function (x, y) {
            return this.checkPointNearLines(x, y, this._target.drawHistory);
          },
          containsWorld: function (worldX, worldY) {
            // スケールを取得
            const scaleX = this._target.container.scale ? this._target.container.scale.x : 1;
            const scaleY = this._target.container.scale ? this._target.container.scale.y : 1;

            // スケールを考慮したローカル座標変換
            const localX = (worldX - this._target.container.x) / scaleX;
            const localY = (worldY - this._target.container.y) / scaleY;


            return this.checkPointNearLines(localX, localY, this._target.drawHistory);
          },
          checkPointNearLines: function (x, y, drawHistory) {
            const tolerance = 3;

            for (const line of drawHistory) {
              if (line.type === "line" && line.pointer && line.pointer.length > 1) {
                for (let i = 0; i < line.pointer.length - 1; i++) {
                  const p1 = line.pointer[i];
                  const p2 = line.pointer[i + 1];
                  const distance = this.distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);

                  if (distance <= tolerance) {
                    return true;
                  }
                }
              }
            }
            return false;
          },
          distanceToLineSegment: function (px, py, x1, y1, x2, y2) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);

            if (length === 0) {
              return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
            }

            const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
            const closestX = x1 + t * dx;
            const closestY = y1 + t * dy;

            return Math.sqrt((px - closestX) * (px - closestX) + (py - closestY) * (py - closestY));
          }
        };
      } else {
        // 部屋用：従来通り（部屋はスケール変更なし）
        target.oekakiGraphics.hitArea = {
          _target: target,
          contains: function (x, y) {
            const bounds = this._target.oekakiHitArea.getBounds();

            if (bounds.width === 0 || bounds.height === 0) {
              return false;
            }

            const margin = 15;
            if (x < bounds.x - margin || x > bounds.x + bounds.width + margin ||
              y < bounds.y - margin || y > bounds.y + bounds.height + margin) {
              return false;
            }

            return this.checkPointNearLines(x, y, this._target.drawHistory);
          },
          checkPointNearLines: function (x, y, drawHistory) {
            const tolerance = 3;

            for (const line of drawHistory) {
              if (line.type === "line" && line.pointer && line.pointer.length > 1) {
                for (let i = 0; i < line.pointer.length - 1; i++) {
                  const p1 = line.pointer[i];
                  const p2 = line.pointer[i + 1];
                  const distance = this.distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);

                  if (distance <= tolerance) {
                    return true;
                  }
                }
              }
            }
            return false;
          },
          distanceToLineSegment: function (px, py, x1, y1, x2, y2) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);

            if (length === 0) {
              return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
            }

            const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
            const closestX = x1 + t * dx;
            const closestY = y1 + t * dy;

            return Math.sqrt((px - closestX) * (px - closestX) + (py - closestY) * (py - closestY));
          }
        };
      }

    } else {
      target.oekakiGraphics.hitArea = null;
    }
  }

  // 線を描画し、サーバーに送信
  sendCurrentLine() {
    this.drawingGraphics.clear();
    if (this.currentLine && this.currentLine.pointer && this.currentLine.pointer.length > 1) {
      const target = avatarOekakiToken ? avaP[avatarOekakiToken] : room;
      const line = this.currentLine;
      target.drawHistory.push(line);

      // 今描いた線だけ追加描画
      if (line.type === "line" && line.pointer.length > 0) {
        target.oekakiGraphics.lineStyle(2, line.color, line.alpha);
        target.oekakiGraphics.moveTo(line.pointer[0].x, line.pointer[0].y);
        for (let i = 1; i < line.pointer.length; i++) {
          target.oekakiGraphics.lineTo(line.pointer[i].x, line.pointer[i].y);
        }
      }
      // hitAreaを更新
      this.updateOekakiHitArea(target);

      // サーバーに送信
      socket.emit("oekaki", {
        avatarOekakiToken: avatarOekakiToken,
        line: line,
      });

      if (avatarOekakiToken === myToken) {
        localStorage.setItem("myOekaki", JSON.stringify(avaP[avatarOekakiToken].drawHistory));
      }
      switchDrawing(avatarOekakiToken);
    }
  }
  displayRoom() {
    app.stage.addChild(this.container);
    room = objMap[this.name];//現在の部屋を更新
    avaBubbleLayer = new PIXI.Container();
    avaBubbleLayer.zIndex = 400;
    avaBubbleLayer.eventMode = 'passive';
    this.container.addChild(avaBubbleLayer);

    //毎回更新する部屋ごとの独自処理（ROOM_PHYSICSで管理）
    const roomConfig = ROOM_PHYSICS[room.name];
    if (roomConfig) {
      if (roomConfig.se) roomSE = roomConfig.se;
      if (roomConfig.overlayChatColor) {
        overlayChatStyle.fill = roomConfig.overlayChatColor;
        overlayChat.children.forEach(child => {
          if (child instanceof PIXI.Text) child.style.fill = roomConfig.overlayChatColor;
        });
      }
      if (roomConfig.cloudSync) this.startCloudSync();
      if (roomConfig.skyTime) this.startSkyOverlay();
    }

    this.roomPolygons.forEach(obj => {
      room.container.addChild(obj.container);
      // ポリゴン可視化（必要に応じてコメントアウト）
      // drawMultiPolygonGraphics(room, polygons[obj.name] || []);
    });
  }

  startSkyOverlay() {
    if (!this._skyFilter) {
      this._skyFilter = new PIXI.filters.ColorMatrixFilter();
      this.sprite.filters = [this._skyFilter];
    }
    this.sprite.tint = 0xFFFFFF;
    let lastSec = -1;
    const updateSky = () => {
      const now = new Date();
      const sec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      if (sec === lastSec) return;
      lastSec = sec;
      const t = sec / 60; // 現在時刻（分）。デバッグ時は固定値に: const t = 1050;
      this._skyFilter.matrix = getSkyMatrix(t);
    };
    updateSky();
    tickerListeners.push(updateSky);
    app.ticker.add(updateSky);
  }
  // ↑ ColorMatrixFilter版（夕方・夜・夜明けの色調整）
  //
  // ── 異世界感ADD版（イベント用プリセット） ──────────────────────────────
  // ROOM_PHYSICSのskyTimeをtrueにする代わりに、入室後に手動で呼ぶ想定。
  // Room constructor のswitch後に↓を追加すればGraphicsオーバーレイが使える:
  //   this.skyOverlay = new PIXI.Graphics();
  //   this.skyOverlay.zIndex = 999;
  //   this.skyOverlay.eventMode = 'none';
  //   this.skyOverlay.blendMode = PIXI.BLEND_MODES.ADD;  ← ADD合成で異世界感
  //   this.container.addChild(this.skyOverlay);
  // startSkyOverlayの中身をこれに差し替え:
  //   this.skyOverlay.clear();
  //   this.skyOverlay.beginFill(0xFF4400, 0.35);  ← 色・濃さをここで調整
  //   this.skyOverlay.drawRect(0, 0, 660, 480);
  //   this.skyOverlay.endFill();
  // ────────────────────────────────────────────────────────────────────

  //雲を動かす仕組み
  // 疑似ランダム関数（クラスメソッドとして定義）
  seededRandom(seed) {
    // シンプルなLCG（線形合同法）
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);

    // シードを正の整数に変換
    seed = Math.abs(Math.floor(seed)) % m;

    // 計算
    const result = (a * seed + c) % m;

    // 0-1の範囲に正規化
    return result / m;
  }

  // 現在時刻から雲の位置を計算
  calculateCloudPosition() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.cloudSync.gameStartTime;

    // 現在の風の状態を確認
    const windInfo = this.getCurrentWindInfo(elapsedTime);

    // 風の影響を考慮した総移動距離を計算
    let totalDistance = 0;
    let timePointer = 0;

    // 15秒刻みで風の状態を確認しながら距離を累積
    while (timePointer < elapsedTime) {
      const checkTime = Math.min(timePointer + this.cloudSync.windCheckInterval, elapsedTime);
      const segmentDuration = checkTime - timePointer;

      const segmentWindInfo = this.getCurrentWindInfo(timePointer);
      const segmentSpeed = segmentWindInfo.isWindActive
        ? this.cloudSync.windSpeed
        : this.cloudSync.cloudSpeed;

      totalDistance += (segmentSpeed * segmentDuration) / 1000; // 秒単位に変換
      timePointer = checkTime;
    }

    // ループを考慮した現在位置
    const loopWidth = this.cloudSync.screenWidth + this.cloudSync.cloudWidth;
    const currentX = (totalDistance % loopWidth) - this.cloudSync.cloudWidth;

    return {
      x: currentX,
      windInfo: windInfo
    };
  }

  // 指定時刻の風の情報を取得
  getCurrentWindInfo(elapsedTime) {
    const checkInterval = this.cloudSync.windCheckInterval;
    const currentCycle = Math.floor(elapsedTime / checkInterval);

    // 疑似ランダムで風の発生を判定
    const windRandom = this.seededRandom(currentCycle + this.cloudSync.windSeed);

    if (windRandom < this.cloudSync.windProbability) {
      // 風が発生する場合、風の継続時間を計算
      const durationRandom = this.seededRandom(currentCycle + this.cloudSync.durationSeed);
      const windDuration = this.cloudSync.windMinDuration +
        (durationRandom * (this.cloudSync.windMaxDuration - this.cloudSync.windMinDuration));

      const windStartTime = currentCycle * checkInterval;
      const windEndTime = windStartTime + windDuration;

      return {
        isWindActive: elapsedTime >= windStartTime && elapsedTime <= windEndTime,
        windStartTime: windStartTime,
        windEndTime: windEndTime,
        windDuration: windDuration
      };
    }

    return {
      isWindActive: false,
      windStartTime: null,
      windEndTime: null,
      windDuration: 0
    };
  }

  // 雲の同期システムを開始
  startCloudSync() {
    if (!cloud || !cloud.container) {
      console.warn("cloud オブジェクトが見つかりません");
      return;
    }
    if (!this.cloudSync) {
      console.error("[startCloudSync] this.cloudSync is undefined! room=", this.name);
      return;
    }

    // 2回目以降の入室: tickerはまだ動いているので _cloudTotalDistance も最新。再計算不要。
    if (this._cloudTickerActive) {
      const lw = this.cloudSync.screenWidth + this.cloudSync.cloudWidth;
      cloud.container.x = ((this._cloudTotalDistance % lw) + lw) % lw - this.cloudSync.cloudWidth;
      return;
    }

    // 初回のみ: whileループで正確に累積距離を計算（全クライアント共通の決定論的計算）
    this._cloudTotalDistance = this._computeCloudTotalDistance();
    const loopWidth = this.cloudSync.screenWidth + this.cloudSync.cloudWidth;
    cloud.container.x = ((this._cloudTotalDistance % loopWidth) + loopWidth) % loopWidth - this.cloudSync.cloudWidth;
    this._cloudLastUpdateTime = Date.now();
    this.lastWindState = false;

    const cloudTicker = (delta) => {
      this.updateCloudPosition();
    };
    this._cloudTickerActive = true;
    tickerListeners.push(cloudTicker);
    app.ticker.add(cloudTicker);
  }

  // 初回だけ whileループで累積距離を計算
  _computeCloudTotalDistance() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.cloudSync.gameStartTime;
    let totalDistance = 0;
    let timePointer = 0;
    while (timePointer < elapsedTime) {
      const checkTime = Math.min(timePointer + this.cloudSync.windCheckInterval, elapsedTime);
      const segmentDuration = checkTime - timePointer;
      const segmentWindInfo = this.getCurrentWindInfo(timePointer);
      const segmentSpeed = segmentWindInfo.isWindActive ? this.cloudSync.windSpeed : this.cloudSync.cloudSpeed;
      totalDistance += (segmentSpeed * segmentDuration) / 1000;
      timePointer = checkTime;
    }
    return totalDistance;
  }

  // 雲の位置を更新
  updateCloudPosition() {
    if (!cloud || !cloud.container) return;

    const currentTime = Date.now();
    const delta = currentTime - this._cloudLastUpdateTime;
    this._cloudLastUpdateTime = currentTime;

    const elapsedTime = currentTime - this.cloudSync.gameStartTime;
    // whileループと同じく「サイクル開始時点」で判定する（風はサイクル全体に適用）
    const cycleInterval = this.cloudSync.windCheckInterval;
    const cycleStart = Math.floor(elapsedTime / cycleInterval) * cycleInterval;
    const windInfo = this.getCurrentWindInfo(cycleStart);
    const speed = windInfo.isWindActive ? this.cloudSync.windSpeed : this.cloudSync.cloudSpeed;
    this._cloudTotalDistance += (speed * delta) / 1000;

    const loopWidth = this.cloudSync.screenWidth + this.cloudSync.cloudWidth;
    const newX = ((this._cloudTotalDistance % loopWidth) + loopWidth) % loopWidth - this.cloudSync.cloudWidth;

    const prevX = cloud.container.x;
    cloud.container.x = newX;

    const dx = newX - prevX;

    // ラップアラウンドの大ジャンプは無視して方向を判定
    if (Math.abs(dx) < loopWidth / 2 && dx !== 0) {
      const goingRight = dx > 0;
      const CLOUD_W = 87;
      cloud1.scale.x = goingRight ? -1 : 1;
      cloud1.x = goingRight ? 111 + CLOUD_W : 111;
      cloud2.scale.x = goingRight ? -1 : 1;
      cloud2.x = goingRight ? 418 + CLOUD_W : 418;
    }
  }
}

//token精製後の処理
socket.on("userInit", data => {//Tokenを受け取ったら
  // 再接続時：ログインUI は再生成せず、保存状態で入室し直す
  if (isReconnecting && reconnectSavedState) {
    const oldToken = myToken;
    myToken = data.token;
    if (avaP[oldToken]) {
      avaP[myToken] = avaP[oldToken];
      avaP[myToken].token = myToken;
      delete avaP[oldToken];
    }
    // 再接続中にローカルで移動していた場合は最新座標を使う
    const liveAva = avaP[myToken];
    socket.emit("joineRoom", {
      userName: reconnectSavedState.userName,
      avatarAspect: reconnectSavedState.avatarAspect,
      avatarColor: reconnectSavedState.avatarColor,
      avatarAlpha: reconnectSavedState.avatarAlpha,
      drawHistory: reconnectSavedState.drawHistory || [],
      toRoom: reconnectSavedState.room,
      reconnectAX: liveAva ? liveAva.container.x : reconnectSavedState.AX,
      reconnectAY: liveAva ? liveAva.container.y : reconnectSavedState.AY,
      isReconnect: true,
    });
    return;
  }

  //ログイン画面の描写
  loginRoom = new PIXI.Graphics();
  room = Room.getOrCreateRoom(loginRoom, "loginRoom");
  room.displayRoom();
  nameForm.userName.value = localStorage.getItem('userName');//名前を出力
  myToken = data.token;

  avaP[myToken] = new Avatar(nameForm.userName.value, myToken, localStorage.getItem('avatarAspect') || "", parseColorCode(localStorage.getItem("colorCode")) || "");
  avaP[myToken].msg.setupDrag();
  oekakiColor = avaP[myToken].avatarColor || 0xf8b0fb;//ごまねこのデフォルト色 (ピンク)

  if (localStorage.getItem("myOekaki")) {
    // 配列の各要素のtokenをmyTokenに書き換えて新しい配列を作り、再度localStorageに保存
    localStorage.setItem(
      "myOekaki",
      JSON.stringify(
        JSON.parse(localStorage.getItem("myOekaki")).map(line => ({ ...line, token: myToken }))
      )
    );
  }

  avaP[myToken].displayAvatar({
    fromRoom: "init",
    AX: 330,
    AY: 200,
    DIR: "S",
    avatarAlpha: 1,
    msg: "",
    sit: JSON.parse(localStorage.getItem("sit")) || false,
    sleep: false,
    newAvatarDrawHistory: JSON.parse(localStorage.getItem("myOekaki")) || [],
    random: null
  });

  if (JSON.parse(localStorage.getItem("sit"))) {
    sitMenu.textContent = "立つ";
  } else {
    sitMenu.textContent = "座る";
  }

  //最初は自分のアバターにお絵描きできるようにする※とりあえず全消しだけ
  oekakiSystem();
  avatarOekakiToken = myToken;
  switchDrawing(myToken);

  // 矢印キー移動リスナー（ログイン前から有効）
  window.addEventListener("keydown", e => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
      if (el !== msgForm.msg) return; // 設定欄の数値入力等はスルー
      el.blur(); // チャット入力欄ならblurして移動に切り替え
    }
    e.preventDefault();
    keysPressed.add(e.key);
    if (!e.repeat) {
      const dir = getKeyDir();
      if (dir) {
        const ava = avaP[myToken];
        if (ava && !ava.sit && !ava.sleep) {
          keyWalkFrame = (keyWalkFrame + 1) % 3;
          keyWalkFrameTimer = 0;
          const spriteName = KEY_WALK_DIR_FRAMES[dir][keyWalkFrame];
          ava.container.removeChild(ava.avaC);
          ava.avaC = ava[spriteName];
          ava.container.addChild(ava.avaC);
          if (ava.currentAvaStateKey !== undefined) {
            ava.currentAvaStateKey = spriteName.replace("ava", "");
            ava.redrawOekakiForState();
          }
          // 方向転換を即座にobserverへ通知（次のsocketタイマーを待たず送信）
          if (keyMoveTickerFn && room && room.name !== "loginRoom" && !isReconnecting) {
            DIR = dir;
            const emitData = { DIR, moveType: "absolute", AX, AY, sit: ava.sit, riding: !!ava.ridingObject, keyMove: true, keyFrame: keyWalkFrame };
            if (ava.ridingObject) { emitData.ridingOffsetX = ava.ridingOffset.x; emitData.ridingOffsetY = ava.ridingOffset.y; }
            socket.emit("tapMap", emitData);
            keySocketTimer = 0; // 即送りしたので次のticker送信を100ms後にリセット
          }
        }
      }
    }
    startKeyMoveTicker();
  }, { passive: false });

  window.addEventListener("keyup", e => {
    keysPressed.delete(e.key);
  }, { passive: true });

  // if (JSON.parse(localStorage.getItem("sleep"))) {
  //   sleepMenu.textContent = "起きる";
  // } else {
  //   sleepMenu.textContent = "寝る";

  // アバターの選択用アイコンを生成する処理
  let iconX = 0;
  function createAvatarIcon(avatar, newOekakiColor, log) {
    const selectIcon = new PIXI.Sprite(avatar.icon);
    room.container.addChild(selectIcon);//login画面にiconを追加
    selectIcon.eventMode = 'static';//クリックイベントを有効化
    selectIcon.x = iconX;
    iconX += selectIcon.width;
    selectIcon.on('pointerdown', e => {//アイコンクリック時にアバター変更
      if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
      avaP[myToken].avatarAspect = avatar.name;
      avaP[myToken].setAvatar(avatar);//親コンテナにアバターの種類を設定する
      avaP[myToken].setColor(0xFFFFFF);//(無色、白)
      oekakiColor = newOekakiColor;
      avaP[myToken].nameText.y = -avaP[myToken].avaC.height - 10 - avaP[myToken].nameText.height / 2;
      avaP[myToken].nameTag.y = avaP[myToken].nameText.y;
    });
  }

  createAvatarIcon(gomaneco, 0xf8b0fb, "ごまねこ裏設定集：高いところが好きな高所恐怖症、飛び降りる時は少しの勇気が必要、目を開けられなくて毎回ちびっちゃう。綿あめを食べ過ぎて腹を壊した、雲を見るとたまに思い出す。");
  createAvatarIcon(necosuke, 0x7a9ce8, "ねこすけ裏設定：クールなまなざしを覗き込むと瞳の奥は燃えている　鳥のように飛べるんじゃないかと考えながら雲から飛び降りている　ごまねこが降りる様を見ると冷や汗をかいてしまう");

  let greenyellowPalette, royalbluePalette, tealPalette, midnightbluePalette, deepskybluePalette, cyanPalette, firebrickPalette, snowPalette, blackPalette, grayPalette, darkvioletPalette;
  let usuiPinkPalette, hutuuPinkPalette, yayakoiPinkPalette, koiPinkPalette, nayakonoiroPalette, ryuboPalette, yarukitiPalette, ryusutaPalette;
  setPalette(greenyellowPalette, 0xadff2f, 0, 300);
  setPalette(firebrickPalette, 0xb22222, 50, 300);
  setPalette(cyanPalette, 0x00ffff, 100, 300);
  setPalette(deepskybluePalette, 0x00bfff, 150, 300);
  setPalette(royalbluePalette, 0x4169e1, 200, 300);
  setPalette(darkvioletPalette, 0x9400d3, 250, 300);
  setPalette(midnightbluePalette, 0x191970, 300, 300);
  setPalette(snowPalette, 0xfffafa, 350, 300);
  setPalette(tealPalette, 0x008080, 400, 300);
  setPalette(grayPalette, 0x808080, 450, 300);
  setPalette(blackPalette, 0x000001, 650, 300, 0x4C4C52);//黒だけパレットカラーを見えなくして実装

  setPalette(usuiPinkPalette, 0xFAC3FF, 0, 350);
  setPalette(hutuuPinkPalette, 0xE2A4E9, 50, 350);
  setPalette(yayakoiPinkPalette, 0xE2A4E9, 100, 350);
  setPalette(koiPinkPalette, 0xDB9AE1, 150, 350);
  setPalette(nayakonoiroPalette, 0xFF9696, 200, 350);
  setPalette(ryuboPalette, 0x14b646, 250, 350);
  setPalette(yarukitiPalette, 0x507879, 300, 350);
  setPalette(ryusutaPalette, 0x841059, 350, 350);

  function setPalette(colorPalette, colorCode, x, y, paletteColor) {//指定する色の名前、カラーコード、座標Ｘ、座標Ｙ、パレットそのものの色(未指定でも良い)
    colorPalette = new PIXI.Graphics();
    colorPalette.x = x;
    colorPalette.y = y;
    colorPalette.eventMode = 'static';
    if (paletteColor) {//paletteColorの色を変更してる場合
      colorPalette.beginFill(paletteColor);
      colorPalette.zIndex = 1000;//zIndexを前に持ってくる
    } else {
      colorPalette.beginFill(colorCode);
      colorPalette.zIndex = -1;//zIndexをアバター以下にする
    }
    colorPalette.drawRect(0, 0, 50, 50);
    colorPalette.endFill();
    room.container.addChild(colorPalette);
    colorPalette.on('pointerdown', e => {
      if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
      if (avaP[myToken].avatarAspect === "necosuke") {
        avaP[myToken].avatarAspect = "necosukeMono";
        avaP[myToken].setAvatar(necosukeMono);
      }
      else if (avaP[myToken].avatarAspect === "gomaneco") {
        avaP[myToken].avatarAspect = "gomanecoMono";
        avaP[myToken].setAvatar(gomanecoMono);
      }
      avaP[myToken].setColor(colorCode);
      oekakiColor = colorCode;
    });
  }

  //タイトルを触った時に背景色を変えて、色を増やす
  let uiColor = 0;
  let skyblue, mikaniro, kyuiro, siniro;
  title.addEventListener('pointerdown', e => {
    if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
    switch (uiColor) {
      case 0:
        body.style.backgroundColor = "skyblue";
        setPalette(skyblue, 0x87ceeb, 500, 300);
        uiColor = 1;
        break;
      case 1:
        body.style.backgroundColor = "#f68b1f";
        setPalette(mikaniro, 0xf68b1f, 500, 350);
        uiColor = 2;
        break;
      case 2:
        body.style.backgroundColor = "#333333";
        setPalette(kyuiro, 0x333333, 500, 400);
        uiColor = 3;
        break;
      case 3:
        body.style.backgroundColor = "#32323a";
        setPalette(siniro, 0x32323a, 500, 450);
        uiColor = 0;
        break;
    }
  }, {
    passive: true,
  });

  //日付を触った時に半透明にする
  day.addEventListener('pointerdown', e => {
    if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
    if (avaP[myToken].avatarAlpha === 1) {
      avaP[myToken].setAlpha(0.3);
      socket.emit("alphaChange", {
        alpha: 0.3,
      });
    } else {
      avaP[myToken].setAlpha(1);
      socket.emit("alphaChange", {
        alpha: 1,
      });
    }
  }, {
    passive: true,
  });

  socket.on("alphaChange", data => {
    avaP[data.token].setAlpha(data.alpha);
  });

  setUpFlag[1] = true;
});

//ログイン時の処理
async function login() {
  tickerListeners.forEach(fn => app.ticker.remove(fn));
  tickerListeners.length = 0;
  //もしカメラやマイクをonにしてたら切る
  if (videoStatus) {
    stopVideo();
  }
  if (audioStatus) {
    stopAudio();
  }

  // 方角部屋BGをログイン後すぐにバックグラウンドでプリロード開始
  _startDirBgPreloads();

  if (setUpFlag[0] && setUpFlag[1]) {
    avaP[myToken].name = nameForm.userName.value;
    // if(!avaP[myToken].name==="黒吉"){
    //   !avaP[myToken].name="ちｎちｎ";
    if (avaP[myToken].name === "フサ吉") {
      avaP[myToken].name = "man吉"
    }
    if (!avaP[myToken].name) {//名前が未入力だった場合
      nanasiName[0] = nanasiName[0][Math.floor(Math.random() * nanasiName[0].length)];
      nanasiName[2] = nanasiName[2][Math.floor(Math.random() * nanasiName[2].length)];
      nanasiName[4] = nanasiName[4][Math.floor(Math.random() * nanasiName[4].length)];
      if (nanasiName[0] === "七百七十零式") {
        nanasiName[2] = nanasiName[6][Math.floor(Math.random() * nanasiName[6].length)];
      }
      avaP[myToken].name = nanasiName[0] + nanasiName[2] + nanasiName[4];
      if (nanasiName[0] === "♰") { avaP[myToken].name += "♰"; }
    }

    localStorage.setItem("userName", avaP[myToken].name);//ローカルストレージに名前を書き込み
    localStorage.setItem("avatarAspect", avaP[myToken].avatarAspect);//ローカルストレージにアバター書き込み
    localStorage.setItem("colorCode", typeof colorCode === "number" ? avaP[myToken].avatarColor : String(avaP[myToken].avatarColor));

    if (room.container.parent) app.stage.removeChild(room.container);//移動前の部屋を消す
    _inRoomTransition = true; // joineRoom応答前にlogin座標(330,200)がtransformDataで送信されるのを防ぐ
    // 直リンクのシステム部屋・ユーザー部屋へ直接入室（エントランス経由スキップ）
    const _dlLoginSysSprites = { 'エントランス': entranceImg, '草原': entrance, 'うちゅー': outerSpace, '文字の部屋': konaNoHeya, '粉の部屋': konaPowderRoom, '星1': star1, 'むげんのいりぐち': mugenIriguchi, 'むげん': mugenRoom, '東の部屋': dirRoomEast, '南の部屋': dirRoomSouth, '西の部屋': dirRoomWest, '北の部屋': dirRoomNorth };
    const _dlLoginSysSpots = { 'エントランス': 'entranceMainSpot', '草原': 'entranceCloud1', 'うちゅー': 'outerSpaceMainSpot', '星1': 'star1EntrySpot', '文字の部屋': '文字の部屋EntrySpot', '粉の部屋': '粉の部屋EntrySpot', 'むげんのいりぐち': 'mugenEntrySpot', 'むげん': 'mugenMainSpot', '東の部屋': '東の部屋Spot', '南の部屋': '南の部屋Spot', '西の部屋': '西の部屋Spot', '北の部屋': '北の部屋Spot' };
    let _loginRoomName, _loginToSpot;
    await _directLinkResolvePromise;
    if (_directLinkRoom && _dlLoginSysSprites[_directLinkRoom]) {
      // 既知のシステム部屋
      _loginRoomName = _directLinkRoom;
      _loginToSpot = _dlLoginSysSpots[_directLinkRoom];
      room = Room.getOrCreateRoom(_dlLoginSysSprites[_loginRoomName], _loginRoomName, ["standable"]);
      if (room._konaContainer) _konaContainer = room._konaContainer;
    } else if (_directLinkRoom && _directLinkRoomExists) {
      // ユーザー部屋への直リンク: 直接その部屋を生成してログイン（_resolvedDirectLinkIdはUUID）
      _loginRoomName = _resolvedDirectLinkId;
      _loginToSpot = undefined;
      if (!(objMap[_resolvedDirectLinkId] instanceof Room)) {
        const bg = new PIXI.Graphics();
        bg.zIndex = -200;
        bg.beginFill(parseColorCode(localStorage.getItem('colorCode')) || 0xffffff);
        bg.drawRect(0, 0, 660, 460);
        bg.endFill();
        const floorGfx = new PIXI.Graphics();
        floorGfx.beginFill(0x223344, 0.01);
        floorGfx.drawRect(0, 200, 660, 260);
        floorGfx.endFill();
        floorGfx.hitArea = new PIXI.Polygon([0, 200, 660, 200, 660, 460, 0, 460]);
        floorGfx.eventMode = 'none';
        const floorObj = { container: floorGfx, tags: ['standable'], name: _resolvedDirectLinkId + '_floor' };
        objMap[_resolvedDirectLinkId + '_floor'] = floorObj;
        const _r = new Room(bg, _resolvedDirectLinkId, []);
        _r.container.addChild(floorGfx);
        _r.roomPolygons.push(floorObj);
        objMap[_resolvedDirectLinkId] = _r;
      }
      _inUserRoom = true;
      room = objMap[_resolvedDirectLinkId];
    } else {
      _loginRoomName = 'エントランス';
      _loginToSpot = 'entranceMainSpot';
      room = Room.getOrCreateRoom(entranceImg, 'エントランス', ["standable"]);
    }
    // 方角部屋への直リンク時はBGプリロードを待ってから表示（フラッシュ防止）
    if (_DIR_ROOM_NAMES.has(_loginRoomName)) {
      await (_dirBgPreloadPromises[_loginRoomName] || Promise.resolve());
    }
    room.displayRoom();
    if (_DIR_ROOM_NAMES.has(room.name) && _dirBgUrlCache[room.name] !== undefined) {
      _applyDirectionBg(room.name, _dirBgUrlCache[room.name] || null);
    }

    socket.emit("joineRoom", {
      userName: avaP[myToken].name,
      avatarAspect: avaP[myToken].avatarAspect,
      avatarColor: avaP[myToken].avatarColor,
      avatarAlpha: avaP[myToken].avatarAlpha,
      drawHistory: avaP[myToken].drawHistory || [],
      toRoom: _loginRoomName,
      toSpot: _loginToSpot,
      bubbleOffsetX: avaP[myToken].msg._offsetX,
      bubbleOffsetY: avaP[myToken].msg._offsetY,
    });

    //フォームを切り替える
    nameForm.style.display = "none";
    msgForm.style.display = "flex";
    msgForm.msg.focus();

    //wa_iButtunがオフの時
    window.addEventListener("keydown", e => {
      if (!clickedWa_iButtun) {
        isDownCtrl = e.ctrlKey;
        if (e.ctrlKey) {
          wa_i.style.backgroundColor = 'skyblue';
        }
      }
    }, { passive: true });

    window.addEventListener("keyup", e => {
      if (!clickedWa_iButtun) {
        isDownCtrl = e.ctrlKey;
        if (e.ctrlKey == false) {
          _setBtnState(wa_i, "red");
        }
      }
    }, { passive: true });

    window.addEventListener("blur", () => {//ウィンドウが非アクティブになったとき
      if (!clickedWa_iButtun) {//わ～いボタンがオンだったらidDownCtrlを効かないようにしとく
        isDownCtrl = false;
        _setBtnState(wa_i, "red");
      }
      keysPressed.clear(); // 矢印キー移動のリセット
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { keysPressed.clear(); stopKeyMove(); }
    }, { passive: true });

    avatarOekakiToken = false;
  }
}

//自分自身の部屋移動
//不要な情報を消し、サーバーに移動することを伝える。
async function goSelfToRoomSpot(toSpot, train) {
  _prevRoomForBlockReturn = room ? room.name : null;
  _inRoomTransition = true;
  //配信関係の接続を切る
  stopAllConnection();
  if (videoStatus) {
    stopVideo();
  }
  if (audioStatus) {
    stopAudio();
  }
  const _prevRoomContainer = room.container; // 旧部屋コンテナ（awaitの後で削除）
  removeAllSigns();

  // 既存の雲システムを停止
  if (room && room.cloudSyncStarted) {
    room.cloudSyncStarted = false;
  }

  _inUserRoom = false;
  _userRoomDisplayName = '';
  switch (toSpot) {
    //部屋の指定
    case "entranceCloud2":
    case "entranceCloud1":
      room = Room.getOrCreateRoom(entrance, "草原", ["standable"]);
      break;
    case "grassFromEntrance":
      room = Room.getOrCreateRoom(entrance, "草原", ["standable"]);
      break;
    case "entranceMainSpot":
    case "entranceTrainSpot":
      entranceIs2F = false;
      room = Room.getOrCreateRoom(entranceImg, "エントランス", ["standable"]);
      break;
    case "entranceFromMeadow":
      entranceIs2F = true;
      room = Room.getOrCreateRoom(entranceImg, "エントランス", ["standable"]);
      break;
    case "outerSpaceMainSpot":
      room = Room.getOrCreateRoom(outerSpace, "うちゅー", ["standable"]);
      break;
    case "文字の部屋EntrySpot":
      room = Room.getOrCreateRoom(konaNoHeya, "文字の部屋", ["standable"]);
      if (room._konaContainer) _konaContainer = room._konaContainer;
      break;
    case "文字の部屋LeftEntrySpot":
      AX = 60; AY = 340; DIR = "E";
      room = Room.getOrCreateRoom(konaNoHeya, "文字の部屋", ["standable"]);
      if (room._konaContainer) _konaContainer = room._konaContainer;
      break;
    case "粉の部屋EntrySpot":
      AX = 580; AY = 300; DIR = "E";
      room = Room.getOrCreateRoom(konaPowderRoom, "粉の部屋", ["standable"]);
      if (room._konaContainer) _konaContainer = room._konaContainer;
      break;
    case "star1EntrySpot":
      room = Room.getOrCreateRoom(star1, "星1", ["standable"]);
      break;
    case "mugenEntrySpot":
      room = Room.getOrCreateRoom(mugenIriguchi, "むげんのいりぐち", ["standable"]);
      break;
    case "mugenMainSpot":
      room = Room.getOrCreateRoom(mugenRoom, "むげん", ["standable"]);
      break;
    case "東の部屋Spot":
      room = Room.getOrCreateRoom(dirRoomEast, "東の部屋", ["standable"]);
      break;
    case "南の部屋Spot":
      room = Room.getOrCreateRoom(dirRoomSouth, "南の部屋", ["standable"]);
      break;
    case "西の部屋Spot":
      room = Room.getOrCreateRoom(dirRoomWest, "西の部屋", ["standable"]);
      break;
    case "北の部屋Spot":
      room = Room.getOrCreateRoom(dirRoomNorth, "北の部屋", ["standable"]);
      break;
    default:
      if (toSpot && toSpot.startsWith('userRoom:')) {
        const targetRoomId = toSpot.slice(9);
        const sysRoomSprites = { 'エントランス': entranceImg, '草原': entrance, 'うちゅー': outerSpace, '文字の部屋': konaNoHeya, '星1': star1, 'むげんのいりぐち': mugenIriguchi, 'むげん': mugenRoom, '東の部屋': dirRoomEast, '南の部屋': dirRoomSouth, '西の部屋': dirRoomWest, '北の部屋': dirRoomNorth };
        if (Object.prototype.hasOwnProperty.call(sysRoomSprites, targetRoomId)) {
          room = Room.getOrCreateRoom(sysRoomSprites[targetRoomId], targetRoomId, ['standable']);
        } else {
          if (!(objMap[targetRoomId] instanceof Room)) {
            const bg = new PIXI.Graphics();
            bg.zIndex = -200;
            bg.beginFill(parseColorCode(localStorage.getItem('colorCode')) || 0xffffff);
            bg.drawRect(0, 0, 660, 460);
            bg.endFill();
            const floorGfx = new PIXI.Graphics();
            floorGfx.beginFill(0x223344, 0.01);
            floorGfx.drawRect(0, 200, 660, 260);
            floorGfx.endFill();
            floorGfx.hitArea = new PIXI.Polygon([0, 200, 660, 200, 660, 460, 0, 460]);
            floorGfx.eventMode = 'none';
            const floorObj = { container: floorGfx, tags: ['standable'], name: targetRoomId + '_floor' };
            objMap[targetRoomId + '_floor'] = floorObj;
            const r = new Room(bg, targetRoomId, []);
            r.container.addChild(floorGfx);
            r.roomPolygons.push(floorObj);
            objMap[targetRoomId] = r;
          }
          _inUserRoom = true;
          room = objMap[targetRoomId];
          _userRoomDisplayName = '';
          fetch('/api/rooms/' + encodeURIComponent(targetRoomId))
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d && d.name) { _userRoomDisplayName = d.name; updateRoomLinkDisplay(); } })
            .catch(() => {});
        }
      }
      break;
  }
  if (!room) { _inUserRoom = false; _userRoomDisplayName = ''; room = Room.getOrCreateRoom(entranceImg, "エントランス", ["standable"]); }

  // 方角部屋はBGが揃ってから表示（ほぼ既に完了済みなのでawaitはゼロ待ち）
  // awaitの後で旧部屋削除→新部屋表示することでブランクフレームを防ぐ
  if (_DIR_ROOM_NAMES.has(room.name)) {
    await (_dirBgPreloadPromises[room.name] || Promise.resolve());
  }
  if (_prevRoomContainer && _prevRoomContainer.parent) app.stage.removeChild(_prevRoomContainer);

  try {
    room.displayRoom();
  } catch (err) {
    console.error("[goSelfToRoomSpot] displayRoom crash:", err);
  }

  if (_DIR_ROOM_NAMES.has(room.name) && _dirBgUrlCache[room.name] !== undefined) {
    _applyDirectionBg(room.name, _dirBgUrlCache[room.name] || null);
  }

  socket.emit("joineRoom", {
    toRoom: room.name,
    toSpot: toSpot,
    train: train,
  });
}

// ワープ配置モード: 部屋コンテナ上でドラッグして矩形ワープゾーンを配置
function startWarpPlaceMode() {
  warpPlaceMode = true;
  document.getElementById('graphic').style.cursor = 'crosshair';
}

function stopWarpPlaceMode() {
  warpPlaceMode = false;
  document.getElementById('graphic').style.cursor = '';
  if (warpPlacePreview) {
    warpPlacePreview.destroy();
    warpPlacePreview = null;
  }
  warpPlaceStart = null;
}

function _redrawWarpEditOverlay(ov) {
  const s = ov.sprite;
  ov.borderGfx.clear();
  ov.borderGfx.lineStyle(2, 0x00ffcc, 0.9);
  ov.borderGfx.drawRect(s.x, s.y, s.width, s.height);
  ov.handleGfx.clear();
}

function _enableWarpEditMode() {
  if (!room) return;
  _disableWarpEditMode();
  _warpDragMode = true;
  app.stage.eventMode = 'static';
  dbWarpZones.forEach((wz, idx) => {
    const sprite = _warpGateSprites[idx];
    if (!sprite) return;
    const borderGfx = new PIXI.Graphics();
    borderGfx.zIndex = sprite.zIndex + 0.5; borderGfx.eventMode = 'none';
    room.container.addChild(borderGfx);
    const handleGfx = new PIXI.Graphics();
    handleGfx.zIndex = sprite.zIndex + 1; handleGfx.eventMode = 'none';
    room.container.addChild(handleGfx);
    const ov = { warpData: wz, sprite, borderGfx, handleGfx };
    _warpEditOverlays.push(ov);
    _redrawWarpEditOverlay(ov);
    const ovIdx = _warpEditOverlays.length - 1;
    sprite.cursor = 'grab';
    const _editMoveFn = e => {
      if (_warpDragging || _warpDragPending) return;
      const p = room.container.toLocal(e.global);
      const hs = 12, edge = 8;
      const ctl = p.x < sprite.x + hs && p.y < sprite.y + hs;
      const ctr = p.x > sprite.x + sprite.width - hs && p.y < sprite.y + hs;
      const cbl = p.x < sprite.x + hs && p.y > sprite.y + sprite.height - hs;
      const cbr = p.x > sprite.x + sprite.width - hs && p.y > sprite.y + sprite.height - hs;
      if (ctl || cbr) { sprite.cursor = 'nwse-resize'; return; }
      if (ctr || cbl) { sprite.cursor = 'nesw-resize'; return; }
      if (p.x < sprite.x + edge || p.x > sprite.x + sprite.width - edge) { sprite.cursor = 'ew-resize'; return; }
      if (p.y < sprite.y + edge || p.y > sprite.y + sprite.height - edge) { sprite.cursor = 'ns-resize'; return; }
      sprite.cursor = 'grab';
    };
    const _editDownFn = e => {
      if (!_warpDragMode || _warpDragging || _warpDragPending) return;
      const p = room.container.toLocal(e.global);
      const hs = 12, edge = 8;
      const ctlC = p.x < sprite.x + hs && p.y < sprite.y + hs;
      const ctrC = p.x > sprite.x + sprite.width - hs && p.y < sprite.y + hs;
      const cblC = p.x < sprite.x + hs && p.y > sprite.y + sprite.height - hs;
      const cbrC = p.x > sprite.x + sprite.width - hs && p.y > sprite.y + sprite.height - hs;
      const ratio = sprite.width / sprite.height;
      const base = { idx: ovIdx, ratio, startX: p.x, startY: p.y, origX: sprite.x, origY: sprite.y, origW: sprite.width, origH: sprite.height };
      if (cbrC) { _warpDragPending = { ...base, type: 'resize_corner_br' }; return; }
      if (cblC) { _warpDragPending = { ...base, type: 'resize_corner_bl' }; return; }
      if (ctrC) { _warpDragPending = { ...base, type: 'resize_corner_tr' }; return; }
      if (ctlC) { _warpDragPending = { ...base, type: 'resize_corner_tl' }; return; }
      const near_left = p.x < sprite.x + edge;
      const near_right = p.x > sprite.x + sprite.width - edge;
      const near_top = p.y < sprite.y + edge;
      const near_bottom = p.y > sprite.y + sprite.height - edge;
      let type = 'move';
      if (near_left) type = 'resize_left';
      else if (near_right) type = 'resize_right';
      else if (near_top) type = 'resize_top';
      else if (near_bottom) type = 'resize_bottom';
      _warpDragPending = { ...base, type };
      if (type === 'move') sprite.cursor = 'grabbing';
    };
    ov._editMoveFn = _editMoveFn;
    ov._editDownFn = _editDownFn;
    sprite.on('pointermove', _editMoveFn);
    sprite.on('pointerdown', _editDownFn);
  });
  app.stage.on('pointermove', _onWarpDragMove);
  app.stage.on('pointerup', _onWarpDragEnd);
  app.stage.on('pointerupoutside', _onWarpDragEnd);
}

function _disableWarpEditMode() {
  _warpDragMode = false;
  _warpDragging = null; _warpDragPending = null;
  if (typeof app !== 'undefined') {
    app.stage.off('pointermove', _onWarpDragMove);
    app.stage.off('pointerup', _onWarpDragEnd);
    app.stage.off('pointerupoutside', _onWarpDragEnd);
  }
  _warpEditOverlays.forEach(ov => {
    if (ov.borderGfx.parent) ov.borderGfx.parent.removeChild(ov.borderGfx);
    if (ov.handleGfx.parent) ov.handleGfx.parent.removeChild(ov.handleGfx);
    ov.borderGfx.destroy();
    ov.handleGfx.destroy();
    if (ov.sprite) {
      if (ov._editDownFn) ov.sprite.off('pointerdown', ov._editDownFn);
      if (ov._editMoveFn) ov.sprite.off('pointermove', ov._editMoveFn);
      ov.sprite.cursor = 'pointer';
    }
  });
  _warpEditOverlays.length = 0;
}

function _onWarpDragMove(e) {
  if (!_warpDragPending && !_warpDragging || !room) return;
  if (_warpDragPending && !_warpDragging) {
    const p = room.container.toLocal(e.global);
    if (Math.abs(p.x - _warpDragPending.startX) < 4 && Math.abs(p.y - _warpDragPending.startY) < 4) return;
    _warpDragging = _warpDragPending;
    _warpDragPending = null;
  }
  if (!_warpDragging) return;
  const ov = _warpEditOverlays[_warpDragging.idx];
  if (!ov) return;
  const p = room.container.toLocal(e.global);
  const dx = p.x - _warpDragging.startX, dy = p.y - _warpDragging.startY;
  const s = ov.sprite;
  if (_warpDragging.type === 'move') {
    s.x = _warpDragging.origX + dx;
    s.y = _warpDragging.origY + dy;
  } else if (_warpDragging.type === 'resize_corner_br') {
    const scale = Math.max(0.05, (_warpDragging.origW + dx) / _warpDragging.origW);
    s.width = Math.max(10, _warpDragging.origW * scale);
    s.height = Math.max(10, s.width / _warpDragging.ratio);
  } else if (_warpDragging.type === 'resize_corner_bl') {
    const newW = Math.max(10, _warpDragging.origW - dx);
    const newH = Math.max(10, newW / _warpDragging.ratio);
    s.x = _warpDragging.origX + _warpDragging.origW - newW;
    s.width = newW; s.height = newH;
  } else if (_warpDragging.type === 'resize_corner_tr') {
    const scale = Math.max(0.05, (_warpDragging.origW + dx) / _warpDragging.origW);
    const newW = Math.max(10, _warpDragging.origW * scale);
    const newH = Math.max(10, newW / _warpDragging.ratio);
    s.y = _warpDragging.origY + _warpDragging.origH - newH;
    s.width = newW; s.height = newH;
  } else if (_warpDragging.type === 'resize_corner_tl') {
    const newW = Math.max(10, _warpDragging.origW - dx);
    const newH = Math.max(10, newW / _warpDragging.ratio);
    s.x = _warpDragging.origX + _warpDragging.origW - newW;
    s.y = _warpDragging.origY + _warpDragging.origH - newH;
    s.width = newW; s.height = newH;
  } else if (_warpDragging.type === 'resize_right') {
    s.width = Math.max(10, _warpDragging.origW + dx);
  } else if (_warpDragging.type === 'resize_bottom') {
    s.height = Math.max(10, _warpDragging.origH + dy);
  } else if (_warpDragging.type === 'resize_left') {
    const newW = Math.max(10, _warpDragging.origW - dx);
    s.x = _warpDragging.origX + (_warpDragging.origW - newW);
    s.width = newW;
  } else if (_warpDragging.type === 'resize_top') {
    const newH = Math.max(10, _warpDragging.origH - dy);
    s.y = _warpDragging.origY + (_warpDragging.origH - newH);
    s.height = newH;
  }
  _redrawWarpEditOverlay(ov);
}

async function _onWarpDragEnd() {
  _warpDragPending = null;
  if (!_warpDragging) return;
  const ov = _warpEditOverlays[_warpDragging.idx];
  _warpDragging = null;
  if (!ov) return;
  ov.sprite.cursor = 'grab';
  const s = ov.sprite;
  const x = Math.round(s.x), y = Math.round(s.y);
  const w = Math.round(s.width), h = Math.round(s.height);
  const wz = ov.warpData;
  wz.x = x; wz.y = y; wz.width = w; wz.height = h;
  _redrawWarpEditOverlay(ov);
  updateWarpList();
  _notifyRoomAssetsChanged();
}

async function saveWarpZone(x, y, w, h) {
  if (!warpEditPassword || !warpEditRoomId) {
    alert('部屋IDとパスワードが必要です');
    return;
  }
  const res = await fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId) + '/warps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword },
    body: JSON.stringify({ x, y, width: Math.abs(w), height: Math.abs(h), shape: _warpPlaceShape }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || 'ワープゾーン保存失敗');
    return;
  }
  const szd = await res.json().catch(() => ({}));
  if (szd.id) {
    _pendingWarpAdds.add(szd.id);
    socket.emit('pendingAddWarp', { id: szd.id });
    const _newWarpList1 = [...dbWarpZones, { id: szd.id, room_id: warpEditRoomId, target_room_id: null, shape: _warpPlaceShape, x, y, width: Math.abs(w), height: Math.abs(h), visual_opacity: 0.3, warp_type: 'normal', color: null, custom_image_url: null, sort_order: dbWarpZones.length }];
    clearWarpZones(); dbWarpZones = _newWarpList1;
  }
  updateWarpList();
  stopWarpPlaceMode();
  document.getElementById('warpPlaceStopBtn').style.display = 'none';
  document.getElementById('warpPlaceBtn').style.display = '';
  _enableWarpEditMode();
  _notifyRoomAssetsChanged();
}

async function saveScaleZone(x, y, w, h, scale) {
  if (!_scaleZoneEditRoomId) return;
  const res = await fetch('/api/rooms/' + encodeURIComponent(_scaleZoneEditRoomId) + '/scale-zones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword },
    body: JSON.stringify({ x, y, width: w, height: h, scale }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errEl = document.getElementById('scaleZoneErr');
    if (errEl) errEl.textContent = err.error || '保存失敗';
    return;
  }
  _scaleZonePlaceMode = false;
  _scaleZonePlaceStart = null;
  if (_scaleZonePlacePreview) _scaleZonePlacePreview.clear();
  document.getElementById('scaleZonePlaceStopBtn').style.display = 'none';
  document.getElementById('scaleZonePlaceBtn').style.display = '';
  _disableScaleZoneEditMode();
  await loadDbScaleZones(_scaleZoneEditRoomId);
  updateScaleZoneList();
  _enableScaleZoneEditMode();
}

async function _saveWarpOrder() {
  if (!warpEditRoomId) return;
  const ids = dbWarpZones.map(wz => wz.id);
  await fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId) + '/warps/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword },
    body: JSON.stringify({ ids }),
  });
  _notifyRoomAssetsChanged();
}

function updateWarpList() {
  const list = document.getElementById('warpList');
  if (!list) return;
  list.innerHTML = '';
  const errEl = document.getElementById('warpDelErr');
  if (errEl) errEl.textContent = '';

  let _warpDragSrc = null;

  const _hasPf = _platformPixelData.length > 0;
  dbWarpZones.forEach((wz, wzIdx) => {
    const isBack = wz.warp_type === 'back';
    const row = document.createElement('div');
    row.dataset.warpId = wz.id;
    const wzW = wz.width ?? 0, wzH = wz.height ?? wz.width ?? 0;
    const _wzFloating = _hasPf && !_isOnAnyPlatform(wz.x + wzW / 2, wz.y + wzH / 2, _platformPixelData);
    const _baseBorder = isBack ? '#225522' : '#223366';
    row.style.cssText = 'display:flex;align-items:center;gap:5px;padding:4px 6px;margin:3px 0;background:#111;border:1px solid ' + (_wzFloating ? '#f90' : _baseBorder) + ';border-radius:3px;cursor:grab;';

    const thumb = document.createElement('img');
    thumb.src = wz.custom_image_url || '/img/sample/GATE.png';
    thumb.style.cssText = 'width:28px;height:28px;object-fit:contain;flex-shrink:0;border:1px solid #444;background:#222;cursor:pointer;';
    thumb.title = '画像を変更';
    row.appendChild(thumb);

    const right = document.createElement('div');
    right.style.cssText = 'display:flex;align-items:center;gap:4px;flex-wrap:wrap;flex:1;';

    const typeLabel = document.createElement('span');
    typeLabel.style.cssText = 'font-size:10px;width:100%;display:flex;gap:4px;align-items:center;';
    const typePart = document.createElement('span');
    typePart.textContent = isBack ? '↩いりぐち' : '→でぐち';
    typePart.style.cssText = 'color:' + (isBack ? '#88ff44' : '#aaa') + ';';
    const imgNamePart = document.createElement('span');
    const rawImgName = (wz.custom_image_url || '/img/sample/GATE.png').split('/').pop().replace(/\.[^.]+$/, '');
    imgNamePart.textContent = rawImgName;
    imgNamePart.style.cssText = 'color:#4af;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-decoration:underline;cursor:pointer;';
    typeLabel.appendChild(typePart);
    typeLabel.appendChild(imgNamePart);
    if (_wzFloating) {
      const badge = document.createElement('span');
      badge.textContent = '浮いてる';
      badge.title = '足場の上に乗っていません';
      badge.className = 'float-badge';
      badge.style.cssText = 'font-size:9px;color:#f90;border:1px solid #f90;border-radius:2px;padding:0 3px;flex-shrink:0;white-space:nowrap;margin-left:auto;';
      typeLabel.appendChild(badge);
    }
    right.appendChild(typeLabel);

    const mkNumInput = (label, field, val) => {
      const wrap = document.createElement('span');
      wrap.style.cssText = 'display:inline-flex;align-items:center;gap:1px;';
      const lbl = document.createElement('span');
      lbl.textContent = label;
      lbl.style.cssText = 'font-size:10px;color:#888;';
      const inp = document.createElement('input');
      inp.type = 'number'; inp.value = Math.round(val ?? 0);
      inp.dataset.field = field;
      inp.style.cssText = 'width:38px;background:#0d0d1a;border:1px solid #4a90d9;color:#fff;padding:1px 2px;font-size:10px;';
      inp.addEventListener('change', async () => {
        const x = Math.round(Number(row.querySelector('[data-field="x"]').value));
        const y = Math.round(Number(row.querySelector('[data-field="y"]').value));
        const w = Math.round(Number(row.querySelector('[data-field="width"]').value));
        const h = Math.round(Number(row.querySelector('[data-field="height"]').value));
        wz.x = x; wz.y = y; wz.width = w; wz.height = h;
        const s = _warpGateSprites[wzIdx];
        if (s) { s.x = x; s.y = y; s.width = w; s.height = h; }
        const activeOv = _warpEditOverlays.find(o => o.warpData === wz);
        if (activeOv) _redrawWarpEditOverlay(activeOv);
        if (_hasPf) {
          const nowFloating = !_isOnAnyPlatform(wz.x + wz.width / 2, wz.y + (wz.height ?? wz.width) / 2, _platformPixelData);
          row.style.borderColor = nowFloating ? '#f90' : _baseBorder;
          const existBadge = typeLabel.querySelector('.float-badge');
          if (nowFloating && !existBadge) {
            const badge = document.createElement('span');
            badge.textContent = '浮いてる';
            badge.title = '足場の上に乗っていません';
            badge.className = 'float-badge';
            badge.style.cssText = 'font-size:9px;color:#f90;border:1px solid #f90;border-radius:2px;padding:0 3px;flex-shrink:0;white-space:nowrap;margin-left:auto;';
            typeLabel.appendChild(badge);
          } else if (!nowFloating && existBadge) {
            existBadge.remove();
          }
        }
        _notifyRoomAssetsChanged();
      });
      wrap.appendChild(lbl);
      wrap.appendChild(inp);
      return wrap;
    };
    const numRow = document.createElement('div');
    numRow.style.cssText = 'display:flex;align-items:center;gap:4px;flex-wrap:wrap;';
    const h = wz.height ?? wz.width;
    numRow.appendChild(mkNumInput('X:', 'x', wz.x));
    numRow.appendChild(mkNumInput('Y:', 'y', wz.y));
    numRow.appendChild(mkNumInput('W:', 'width', wz.width));
    numRow.appendChild(mkNumInput('H:', 'height', h));

    const mkWarpMoveBtn = (symbol, delta) => {
      const btn = document.createElement('button');
      btn.textContent = symbol;
      btn.className = 'warp-arrow-btn';
      btn.style.cssText = 'background:#222;color:#aaa;border:1px solid #444;cursor:pointer;padding:1px 5px;font-size:12px;line-height:1;';
      btn.addEventListener('click', async () => {
        const newIdx = wzIdx + delta;
        if (newIdx < 0 || newIdx >= dbWarpZones.length) return;
        const tmp = dbWarpZones[wzIdx];
        dbWarpZones[wzIdx] = dbWarpZones[newIdx];
        dbWarpZones[newIdx] = tmp;
        await _saveWarpOrder();
        updateWarpList();
        drawWarpZones();
      });
      return btn;
    };
    numRow.appendChild(mkWarpMoveBtn('↑', -1));
    numRow.appendChild(mkWarpMoveBtn('↓', +1));

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.style.cssText = 'background:' + (isBack ? '#333' : '#600') + ';color:#fff;border:none;cursor:pointer;padding:2px 6px;font-size:12px;';
    delBtn.disabled = isBack;
    delBtn.title = isBack ? 'いりぐちは削除できません' : '削除';
    delBtn.addEventListener('click', () => {
      _pendingWarpDeletes.add(wz.id);
      const remaining = dbWarpZones.filter(w => w.id !== wz.id);
      const wasInEditMode = _warpDragMode;
      clearWarpZones();
      dbWarpZones = remaining;
      drawWarpZones();
      _disableWarpEditMode();
      updateWarpList();
      if (wasInEditMode) _enableWarpEditMode();
      _notifyRoomAssetsChanged();
    });
    numRow.appendChild(delBtn);
    right.appendChild(numRow);
    row.appendChild(right);

    thumb.addEventListener('click', () => { _targetWarpZone = wz; _targetWarpZoneIdx = wzIdx; _openWarpImgFilePicker(); });
    imgNamePart.addEventListener('click', () => { _targetWarpZone = wz; _targetWarpZoneIdx = wzIdx; _openWarpImgFilePicker(); });

    row.draggable = true;
    row.addEventListener('dragstart', e => {
      _warpDragSrc = wzIdx;
      e.dataTransfer.effectAllowed = 'move';
      row.style.opacity = '0.4';
    });
    row.addEventListener('dragend', () => {
      row.style.opacity = '';
      list.querySelectorAll('[data-warp-id]').forEach(r => r.style.borderColor = '');
    });
    row.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      list.querySelectorAll('[data-warp-id]').forEach(r => r.style.borderColor = '');
      row.style.borderColor = '#aaa';
    });
    row.addEventListener('drop', async e => {
      e.preventDefault();
      if (_warpDragSrc === null || _warpDragSrc === wzIdx) return;
      const moved = dbWarpZones.splice(_warpDragSrc, 1)[0];
      dbWarpZones.splice(wzIdx, 0, moved);
      _warpDragSrc = null;
      await _saveWarpOrder();
      updateWarpList();
      drawWarpZones();
    });

    list.appendChild(row);
  });

  if (dbWarpZones.length <= 1) {
    list.querySelectorAll('.warp-arrow-btn').forEach(b => { b.style.display = 'none'; });
  }
}

//自分が入室時の処理
socket.on("joineRoom", data => {
  _mugenGateBeingEntered = -1;
  _directionGateBeingEntered = null;
  Object.keys(videoFloorObjects).forEach(t => _removeVideoFloor(t));
  // 再接続成功
  if (isReconnecting) {
    isReconnecting = false;
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
    // 切断中に退室した他ユーザーのアバターを削除してサーバーの現状で再構築
    Object.keys(avaP).forEach(key => {
      if (key !== myToken) {
        if (avaP[key]._tickerFn) app.ticker.remove(avaP[key]._tickerFn);
        avaP[key].msg?._stopOverlayTick();
        if (avaP[key].container.parent) {
          avaP[key].container.parent.removeChild(avaP[key].container);
        }
        delete avaP[key];
      }
    });
    roomMemberToken = [];
    // 看板は data.signs で再構築するので先に全削除（重複防止）
    removeAllSigns();
    outputChatMsg("再接続に成功しました！", "blue");
  }

  socket.emit("mediaButton", {
    type: "callMediaStatus",
  });

  outputChatMsg(data.announce, false, myToken, true);//移動時のメッセージ出力
  avatarOekakiToken = false;

  if (data.fromRoom === "loginRoom") {//自分のログイン時
    socket.emit("setAllowOthersOekaki", { allow: allowOthersOekaki });
    //ユーザー名ををローカルストレージに保存
    localStorage.setItem("avatarUserName", data.user[myToken].userName);
    //トリップに合わせてnameTagの大きさを変更
    avaP[myToken].nameTag.clear();
    avaP[myToken].nameText.text = data.user[myToken].userName;

    avaP[myToken].nameText.position.set(-avaP[myToken].nameText.width / 2, -avaP[myToken].avaC.height - 10 - avaP[myToken].nameText.height / 2);
    avaP[myToken].nameTag.position.set(avaP[myToken].nameText.x, avaP[myToken].nameText.y);
    avaP[myToken].nameTag.beginFill(0x000000, 0.5);
    avaP[myToken].nameTag.drawRect(0, 0, avaP[myToken].nameText.width, avaP[myToken].nameText.height);
    avaP[myToken].nameTag.endFill();
    //nameTagの透明度を再設定
    let inTime = new Date().getHours();
    if (0 <= inTime && inTime < 12) {
      inTime = 24 - inTime;
    }
    avaP[myToken].nameTag.alpha = Math.pow(1.06, inTime) * 0.1;
  }

  if (data.fromRoom === "文字の部屋" || data.fromRoom === "粉の部屋") _konaLeaveCleanup();

  switch (data.toRoom) {//部屋ごとの独自処理を追加
    case "文字の部屋":
    case "粉の部屋":
      if (_konaContainer) {
        _konaPrevAX = avaP[myToken]?.container.x ?? 0;
        _konaPrevAY = avaP[myToken]?.container.y ?? 0;
        _konaSyncReceived = false;
        _konaLastHostChangeAt = Date.now(); // 入室直後のホスト早期宣言を防ぐクールダウン
        _konaStartTicker();
        _konaStartPeriodicSync();
        document.removeEventListener('visibilitychange', _konaOnVisible);
        document.addEventListener('visibilitychange', _konaOnVisible);
        socket.emit("konaRequestSync");
      }
      break;
    case "星1":
      room.f = 200;
      room.colorIndex = 0;
      room.drawStar(430, 450, 200, 0, 90, data.starColors);
      break;
  }
  // ghost ticker 一掃（新部屋にいないアバターのavaLoopを止める）
  Object.keys(avaP).forEach(t => {
    if (t !== myToken && avaP[t]?._tickerActive && avaP[t]._tickerFn) {
      app.ticker.remove(avaP[t]._tickerFn);
      avaP[t]._tickerActive = false;
    }
  });

  roomMemberToken = [];
  const keys = Object.keys(data.user);//入室時の全員のソケットＩＤを取得
  keys.forEach(function (value) {//引数valueにtokenを入れて順番に実行
    if (data.toRoom === data.user[value].room) {//部屋とユーザーの部屋が一致してたら
      if (!avaP[value]) {//アバターをまだ作ってなかったら
        //アバター作成
        avaP[value] = new Avatar(data.user[value].userName, value, data.user[value].avatarAspect, data.user[value].avatarColor);
      } else if (!avaP[value]._tickerActive) {
        app.ticker.add(avaP[value]._tickerFn);
        avaP[value]._tickerActive = true;
      }

      if (!avaP[value].abon) {//アボンしてない場合だけ
        avaP[value].displayAvatar({
          fromRoom: data.fromRoom,
          AX: data.user[value].AX,
          AY: data.user[value].AY,
          DIR: data.user[value].DIR,
          avatarAlpha: data.user[value].avatarAlpha,
          msg: data.user[value].msg,
          carryOver: data.user[value].carryOver,
          sit: data.user[value].sit,
          sleep: data.user[value].sleep,
          newAvatarDrawHistory: data.user[value].drawHistory,
          random: data.random,
          timeShade: data.user[value].timeShade,
          ridingData: data.user[value].ridingObject ? {
            objectName: data.user[value].ridingObject,
            offsetX: data.user[value].ridingOffsetX,
            offsetY: data.user[value].ridingOffsetY,
          } : null,
        });
        // 自分の入室時はグローバル位置・DIRをサーバー値に同期
        if (value === myToken) {
          DIR = data.user[value].DIR || DIR;
          AX = data.user[value].AX;
          AY = data.user[value].AY;
          avaP[myToken].is2F = entranceIs2F;
        }
        // 他ユーザーの2Fフラグと落書き許可フラグを反映
        if (value !== myToken) {
          avaP[value].is2F = data.user[value].is2F ?? false;
          avaP[value].allowOthersOekaki = data.user[value].allowOthersOekaki !== false;
        }
        // 吹き出し位置オフセットを適用（自分の吹き出しは setupDrag で設定済みなのでスキップ）
        if (value !== myToken) {
          avaP[value].msg._offsetX = data.user[value].bubbleOffsetX || 0;
          avaP[value].msg._offsetY = data.user[value].bubbleOffsetY || 0;
          if (avaP[value].msg.text) avaP[value].msg._redraw();
        }
        roomMemberToken.push(value);
      }
    }
  });

  // 全員配置後に乗車状態を一括復元（乗り物チェーンが正しく解決される）
  Object.values(avaP).forEach(ava => ava.resolveRiding?.());

  //落書き履歴のリセット処理
  room.drawHistory = data.drawHistory ? data.drawHistory : [];

  //部屋のお絵描きの描画
  room.oekakiGraphics.clear();//前の部屋の落書きを消す
  room.container.addChild(room.oekakiGraphics);
  if (data.drawHistory) {//落書きがあれば
    data.drawHistory.forEach(line => {
      if (line.type === "line" && line.pointer.length > 0) {// typeが"line"のときだけ線を描く
        // 線の太さ・色・透明度を設定
        room.oekakiGraphics.lineStyle(2, line.color, line.alpha);

        // pointer配列に座標が入っている場合
        if (line.pointer && line.pointer.length > 0) {
          // 最初の点にペンを移動
          room.oekakiGraphics.moveTo(line.pointer[0].x, line.pointer[0].y);
          // 2点目以降を順番につなげて線を引く
          for (let i = 1; i < line.pointer.length; i++) {
            room.oekakiGraphics.lineTo(line.pointer[i].x, line.pointer[i].y);
          }
        }
      }
    });
    room.updateOekakiHitArea(room);
  }
  switchDrawing();

  // 入室時に既存の看板を復元
  if (data.signs && data.signs.length > 0) {
    data.signs.forEach(s => {
      createSign(s.id, s.x, s.y, s.boardText, s.clickText, "", s.endTime);
    });
  }

  // 再接続用の状態を保存（ログイン済みの部屋移動のたびに更新）
  if (data.toRoom !== "loginRoom") {
    wasLoggedIn = true;
    reconnectSavedState = {
      userName: data.user[myToken]?.userName || reconnectSavedState?.userName,
      avatarAspect: avaP[myToken]?.avatarAspect || reconnectSavedState?.avatarAspect,
      avatarColor: avaP[myToken]?.avatarColor || reconnectSavedState?.avatarColor,
      avatarAlpha: avaP[myToken]?.avatarAlpha || 1,
      drawHistory: avaP[myToken]?.drawHistory || [],
      room: data.toRoom,
      AX: data.user[myToken]?.AX || 330,
      AY: data.user[myToken]?.AY || 200,
    };
  }

  // DBワープゾーン・画像・カスタムコードを取得して描画
  if (data.toRoom !== "loginRoom") {
    _applyStreamButtonVisibility(data.allow_video ?? 1, data.allow_audio ?? 1);
    _entryLocked = data.entry_locked ?? false;
    const _isUserRoom = !_SYSTEM_ROOM_NAMES.has(data.toRoom) && data.toRoom !== 'loginRoom';
    const _entryLockBtn = document.getElementById('entryLockBtn');
    if (_entryLockBtn) _entryLockBtn.style.display = 'none';
    _updateEntryLockBtn();
    if (!_pendingOpenEditPanel) _applyRoomBgColor(data.background_color || null);
    if (!_SYSTEM_ROOM_NAMES.has(data.toRoom)) {
      if (!_pendingOpenEditPanel) {
        loadDbWarpZones(data.toRoom);
        loadDbImages(data.toRoom);
        loadDbScaleZones(data.toRoom);
        runCustomCode(data.toRoom);
      }
    } else {
      clearWarpZones();
      clearDbImages();
      clearScaleZones();
      clearCustomCode();
    }
    if (data.toRoom === "むげん") loadMugenGates();
    if (_DIR_ROOM_NAMES.has(data.toRoom)) loadDirectionGates(data.toRoom);
  } else {
    clearCustomCode();
  }

  if (_pendingOpenEditPanel && data.toRoom !== 'loginRoom') {
    _pendingOpenEditPanel = false;
    setTimeout(() => _openRoomEditPanelDirect(data.toRoom, ''), 50);
  }

  // 直リンクでまだターゲット部屋に到達していない場合のみリダイレクト（フォールバック）
  if (_directLinkRoom && _directLinkRoomExists && data.fromRoom === "loginRoom" && data.toRoom !== _resolvedDirectLinkId) {
    const _dlSysSpot = { 'エントランス': 'entranceMainSpot', '草原': 'entranceCloud1', 'うちゅー': 'outerSpaceMainSpot', '星1': 'star1EntrySpot', '文字の部屋': '文字の部屋EntrySpot', '粉の部屋': '粉の部屋EntrySpot', 'むげんのいりぐち': 'mugenEntrySpot', 'むげん': 'mugenMainSpot', '東の部屋': '東の部屋Spot', '南の部屋': '南の部屋Spot', '西の部屋': '西の部屋Spot', '北の部屋': '北の部屋Spot' };
    goSelfToRoomSpot(_dlSysSpot[_directLinkRoom] || ('userRoom:' + _resolvedDirectLinkId));
  }

  updateRoomLinkDisplay();
  // 自分が配信中なら videoSurface を再送信（サーバー再起動後の状態回復）
  if (_streamSurfaceAllowed && videoArray[myToken]) {
    requestAnimationFrame(() => _syncVideoFloor(myToken));
  }
  _inRoomTransition = false;
});

socket.on("otherJoined", data => {//自分以外が部屋にログインor入室してきた時
  if (!avaP[data.token]) {//アバターをまだ作ってなければ作る
    avaP[data.token] = new Avatar(data.userName, data.token, data.avatarAspect, data.avatarColor);
  } else if (!avaP[data.token]._tickerActive) {
    app.ticker.add(avaP[data.token]._tickerFn);
    avaP[data.token]._tickerActive = true;
  }
  // アボンしていない場合のみ処理を実行
  if (avaP[data.token].abon) return;
  avaP[data.token].roomIn++;//確認
  avaP[data.token].displayAvatar({
    fromRoom: data.fromRoom,
    AX: data.AX,
    AY: data.AY,
    DIR: data.DIR,
    avatarAlpha: data.avatarAlpha,
    sit: data.sit,
    sleep: data.sleep,
    announce: data.announce,
    msg: data.msg,
    newAvatarDrawHistory: data.drawHistory,
    random: data.random,
    ridingData: data.ridingObject ? {
      objectName: data.ridingObject,
      offsetX: data.ridingOffsetX,
      offsetY: data.ridingOffsetY,
    } : null,
  });
  // 1人分だけ復元（乗り物の描画が完了した後なので単独でOK）
  avaP[data.token].resolveRiding();
  avaP[data.token].is2F = data.is2F ?? false;
  avaP[data.token].allowOthersOekaki = data.allowOthersOekaki !== false;
  if (data.bubbleOffsetX !== undefined) {
    avaP[data.token].msg._offsetX = data.bubbleOffsetX;
    avaP[data.token].msg._offsetY = data.bubbleOffsetY;
    if (avaP[data.token].msg.text) avaP[data.token].msg._redraw();
  }
  roomMemberToken.push(data.token);
  usersNumber.textContent = room.container.children.filter(child => child.token).length;//部屋人数の表記を変える

  outputChatMsg(data.announce, false, data.token, true);//移動時のメッセージ出力
  // //こっからは入室時のみあればいい//確認
  // if (avaP[data.token].roomIn > 1) {//バックグラウンド復帰時に指示を出す
  //   console.log("バックグラウンド復帰");
  //   tappedMove(data.token, data.AX, data.AY, data.DIR);
});

socket.on("bubbleOffset", data => {
  if (!avaP[data.token]) return;
  avaP[data.token].msg._offsetX = data.offsetX;
  avaP[data.token].msg._offsetY = data.offsetY;
  if (avaP[data.token].msg.text) avaP[data.token].msg._redraw();
});

socket.on("konaKick", data => {
  if (!_isKonaRoom()) return;
  _konaApplyKickExternal(data.ax, data.ay, data.dvx, data.dvy);
});

socket.on("konaRequestSync", data => {
  if (!_isKonaRoom()) return;
  if (_konaCurrentHostToken !== myToken) return;
  // settled/飛行中を問わず全パーティクルを送る（着地直後の飛散状態も同期）
  const particles = _konaParticles
    .filter(p => p.fractureLevel == null)
    .map(p => ({ x: p.x, y: p.y, color: p.color, r: p.r || 1, vx: p.vx || 0, vy: p.vy || 0, settled: !!p.settled }));
  const shards = _konaParticles
    .filter(p => p.fractureLevel != null)
    .map(p => {
      const tr = p.texRegion || {};
      const s = { x: p.x, y: p.y, rot: p.rot || 0, color: p.color,
        w: p.texRegion ? tr.w : p.r * 2, h: p.texRegion ? tr.h : p.r * 2,
        texX: p.texRegion ? tr.x : 0, texY: p.texRegion ? tr.y : 0,
        fractureLevel: p.fractureLevel, hardness: p.hardness, kickCount: p.kickCount || 0,
        vx: p.vx || 0, vy: p.vy || 0, rotV: p.rotV || 0, settled: !!p.settled,
        blockInfo: p.blockInfo, burstSeed: p.burstSeed, pieceIdx: p.pieceIdx != null ? p.pieceIdx : null };
      if (p.isDiagonalShard) { s.diagLocalPoly = p.diagLocalPoly; s.diagCx = p.diagCx; s.diagCy = p.diagCy; }
      return s;
    });
  // !b.landedも含める（着地済みで未砕けのブロックも次tickで砕く）
  const textBlocks = _konaTextBlocks
    .filter(b => !b.crumbled)
    .map(b => ({ grp: b.grp, fontSize: b.fontSize, fontFamily: b.fontFamily, fontStyle: b.fontStyle || 'normal', fontWeight: b.fontWeight || 'normal', color: b.color, x: b.x, y: b.y, vx: b.vx, vy: b.vy, rot: b.rot, rotV: b.rotV, burstSeed: b.burstSeed, initY: b.initY, initVy: b.initVy, hardness: b.hardness, landed: b.landed, textW: b.textW || (b.pixi ? Math.ceil(b.pixi.width) || null : null), textH: b.textH || (b.pixi ? Math.ceil(b.pixi.height) || null : null) }));
  if (!particles.length && !shards.length && !textBlocks.length) return;
  // 新入者が暗黙ホスト扱いされないようホスト宣言してから送信
  if (!_konaCurrentHostToken) _konaCurrentHostToken = myToken;
  socket.emit("konaHostClaim");
  const bd = {};
  for (const [seed, bp] of _konaBreakData) bd[seed] = bp;
  socket.emit("konaSyncData", { targetToken: data.requestingToken, particles, shards, textBlocks, bd });
});

socket.on("konaSyncData", data => {
  if (data.targetToken !== myToken) return;
  if (!_isKonaRoom() || !_konaContainer) return;
  if (_konaSyncReceived) return;
  _konaSyncReceived = true;
  // 状態受信と同時に新ホスト宣言（noSync:true で旧ホストの余分な全同期を抑制）
  _konaCurrentHostToken = myToken;
  _konaLastHostChangeAt = Date.now();
  socket.emit("konaHostClaim", { noSync: true });
  // 入室直後に暗黙ホストとして生成した誤パーティクルを破棄してから再構築
  _konaFractureQueue = [];
  _konaParticles.forEach(p => p.pixi.destroy());
  _konaParticles = [];
  _konaTextBlocks.forEach(b => { if (b.pixi && !b.crumbled) b.pixi.destroy(); });
  _konaTextBlocks = [];
  _konaRenderTextures.forEach(rt => { if (!rt.destroyed) rt.destroy(true); });
  _konaRenderTextures = [];
  _konaSyncRtCache.clear();
  {
    const rtMeta = new Map();  // burstSeed → { bi } （フォント再描画用）
    for (const s of (data.shards || [])) {
      if (_konaParticles.length >= KONA_MAX_PARTICLES) break;
      const hw = s.w / 2, hh = s.h / 2;
      let gfx, shardRt = null;
      if (s.blockInfo && s.burstSeed != null && s.fractureLevel <= 1 && s.blockInfo.textW && s.blockInfo.textH) {
        if (!_konaSyncRtCache.has(s.burstSeed)) {
          const bi = s.blockInfo;
          const tmpText = new PIXI.Text(bi.grp, { fontFamily: bi.fontFamily, fontStyle: bi.fontStyle || 'normal', fontWeight: bi.fontWeight || 'normal', fontSize: bi.fontSize, fill: bi.color, align: 'center' });
          tmpText.anchor.set(0, 0); tmpText.position.set(0, 0);
          if (tmpText.width > 0 && tmpText.height > 0) tmpText.scale.set(bi.textW / tmpText.width, bi.textH / tmpText.height);
          const rt = PIXI.RenderTexture.create({ width: bi.textW, height: bi.textH });
          app.renderer.render(tmpText, { renderTexture: rt });
          tmpText.destroy();
          _konaRenderTextures.push(rt);
          _konaSyncRtCache.set(s.burstSeed, rt);
          rtMeta.set(s.burstSeed, bi);
        }
        shardRt = _konaSyncRtCache.get(s.burstSeed);
        if (s.diagLocalPoly && s.diagLocalPoly.length >= 3) {
          const matrix = new PIXI.Matrix().translate(s.diagCx || 0, s.diagCy || 0);
          gfx = new PIXI.Graphics();
          gfx.beginTextureFill({ texture: shardRt, matrix });
          gfx.moveTo(s.diagLocalPoly[0][0], s.diagLocalPoly[0][1]);
          for (let i = 1; i < s.diagLocalPoly.length; i++) gfx.lineTo(s.diagLocalPoly[i][0], s.diagLocalPoly[i][1]);
          gfx.closePath(); gfx.endFill();
          gfx.alpha = 0.95;
        } else {
          const _sx = s.texX || 0, _sy = s.texY || 0;
          const _sw = Math.min(s.w, shardRt.width - _sx), _sh = Math.min(s.h, shardRt.height - _sy);
          const shardTex = new PIXI.Texture(shardRt.baseTexture, new PIXI.Rectangle(_sx, _sy, _sw, _sh));
          gfx = new PIXI.Sprite(shardTex);
          gfx.anchor.set(0.5, 0.5);
          gfx.alpha = 0.95;
        }
      } else {
        gfx = new PIXI.Graphics();
        gfx.beginFill(s.color, 0.88);
        gfx.moveTo(-hw, -hh); gfx.lineTo(hw, -hh); gfx.lineTo(hw, hh); gfx.lineTo(-hw, hh);
        gfx.closePath(); gfx.endFill();
      }
      gfx.zIndex = 200; gfx.position.set(s.x, s.y); gfx.rotation = s.rot || 0;
      _konaContainer.addChild(gfx);
      const isDiag = !!(s.diagLocalPoly);
      const maxR = isDiag ? Math.max(...s.diagLocalPoly.map(v => Math.hypot(v[0], v[1]))) : Math.max(hw, hh);
      const shardOnFloor = s.y >= KONA_GROUND_Y - maxR;
      _konaParticles.push({
        pixi: gfx, color: s.color, r: maxR,
        x: s.x, y: s.y, vx: s.vx || 0, vy: s.vy || 0, settled: !!s.settled, rot: s.rot || 0, rotV: s.rotV || 0,
        fractureLevel: s.fractureLevel, kickCount: s.kickCount || 0, hardness: s.hardness || 1,
        isTextureShard: !!shardRt,
        renderTexture: shardRt,
        isDiagonalShard: isDiag, diagLocalPoly: s.diagLocalPoly || null, diagCx: s.diagCx || 0, diagCy: s.diagCy || 0,
        texRegion: { x: s.texX || 0, y: s.texY || 0, w: s.w, h: s.h },
        blockInfo: s.blockInfo || null,
        burstSeed: s.burstSeed != null ? s.burstSeed : null,
        pieceIdx: s.pieceIdx != null ? s.pieceIdx : null,
      });
    }
    // 各フォントを明示的にロードしてからRT再描画（fonts.readyはページで未使用のフォントを待たないため個別load必須）
    if (rtMeta.size > 0) {
      for (const [seed, bi] of rtMeta) {
        document.fonts.load(`1px "${bi.fontFamily}"`).then(() => {
          if (!_isKonaRoom()) return;
          const rt = _konaSyncRtCache.get(seed);
          if (!rt || rt.destroyed) return;
          const tmpText = new PIXI.Text(bi.grp, { fontFamily: bi.fontFamily, fontStyle: bi.fontStyle || 'normal', fontWeight: bi.fontWeight || 'normal', fontSize: bi.fontSize, fill: bi.color, align: 'center' });
          tmpText.anchor.set(0, 0); tmpText.position.set(0, 0);
          if (tmpText.width > 0 && tmpText.height > 0) tmpText.scale.set(bi.textW / tmpText.width, bi.textH / tmpText.height);
          app.renderer.render(tmpText, { renderTexture: rt, clear: true });
          tmpText.destroy();
        });
      }
    }
  }
  for (const p of (data.particles || [])) {
    if (_konaParticles.length >= KONA_MAX_PARTICLES) break;
    const pGfx = new PIXI.Graphics();
    pGfx.beginFill(p.color, 0.85); pGfx.drawCircle(0, 0, p.r); pGfx.endFill();
    pGfx.zIndex = 190; pGfx.position.set(p.x, p.y);
    _konaContainer.addChild(pGfx);
    _konaParticles.push({ pixi: pGfx, color: p.color, r: p.r, x: p.x, y: p.y, vx: p.vx || 0, vy: p.vy || 0, settled: !!p.settled });
  }
  for (const b of (data.textBlocks || [])) {
    if (!_konaContainer) break;
    const fStyle = b.fontStyle || 'normal', fWeight = b.fontWeight || 'normal';
    const pixi = new PIXI.Text(b.grp, { fontFamily: b.fontFamily, fontStyle: fStyle, fontWeight: fWeight, fontSize: b.fontSize, fill: b.color, align: 'center' });
    pixi.anchor.set(0.5, 1);
    pixi.position.set(b.x, b.y);
    pixi.rotation = b.rot || 0;
    pixi.zIndex = 200;
    _konaContainer.addChild(pixi);
    const hasSize = b.textW > 0 && b.textH > 0;
    const block = {
      pixi, color: b.color, grp: b.grp, fontSize: b.fontSize, fontFamily: b.fontFamily, fontStyle: fStyle, fontWeight: fWeight,
      x: b.x, y: b.y, vx: b.vx, vy: b.vy, rot: b.rot || 0, rotV: b.rotV || 0,
      burstSeed: b.burstSeed, initY: b.initY, initVy: b.initVy, hardness: b.hardness,
      landed: !!b.landed, crumbled: false, burstDone: false,
      landedAt: b.landed ? Date.now() : undefined,
      textW: b.textW || null, textH: b.textH || null,
      fontReady: hasSize ? undefined : false,
    };
    _konaTextBlocks.push(block);
    // フォントロード後に寸法確定（textW/textHが未設定の場合）
    if (!hasSize) {
      document.fonts.load(`1px "${block.fontFamily}"`).then(() => {
        if (block.pixi && !block.crumbled) {
          block.pixi.updateText(false);
          if (!block.textW) block.textW = Math.ceil(block.pixi.width);
          if (!block.textH) block.textH = Math.ceil(block.pixi.height);
          block.fontReady = true;
        }
      });
    } else {
      document.fonts.load(`1px "${block.fontFamily}"`).then(() => {
        if (block.pixi && !block.crumbled) block.pixi.text = block.pixi.text;
      });
    }
  }
  if (data.bd) { for (const [s, bp] of Object.entries(data.bd)) _konaBreakData.set(Number(s), bp); }
});

socket.on("konaAvaStop", () => {
  if (!_isKonaRoom()) return;
  if (!_konaIsCurrentHost()) return;
  _konaSendFullSync();
});

socket.on("konaResyncFull", () => {
  if (!_isKonaRoom()) return;
  if (!_konaIsCurrentHost()) return;
  _konaSendFullSync();
});

socket.on("konaHostClaim", data => {
  if (!_isKonaRoom()) return;
  // 明示ホストだった場合のみ全同期を新ホストに渡す（暗黙ホスト扱いは送らない）
  const wasHost = !!_konaCurrentHostToken && _konaCurrentHostToken === myToken;
  _konaCurrentHostToken = data.token;
  _konaLastHostChangeAt = Date.now();
  if (wasHost) {
    clearTimeout(_konaScheduleSyncTimer); _konaScheduleSyncTimer = null; _konaScheduleSyncFirstAt = 0;
    if (!data.noSync) _konaSendFullSync(); // 旧ホストが新ホストに現在の完全な状態を渡す
  }
});

socket.on("konaHostRelease", (data) => {
  if (!_isKonaRoom()) return;
  _konaCurrentHostToken = null;
  _konaLastHostChangeAt = Date.now();
  if (document.hidden) return;
  const idx = [...roomMemberToken].sort().indexOf(myToken);
  setTimeout(() => {
    if (_konaCurrentHostToken || !_isKonaRoom() || document.hidden) return;
    _konaCurrentHostToken = myToken;
    _konaLastHostChangeAt = Date.now();
    socket.emit("konaHostClaim");
    if (roomMemberToken.length >= 2) _konaSendFullSync();
  }, 100 + idx * 80);
});

socket.on("konaShatter", data => {
  if (!_isKonaRoom() || !_konaContainer) return;
  if (data.bp) _konaBreakData.set(data.burstSeed, data.bp);
  // 既存シャードを削除（ホストは自身のbroadcastを受信しないのでguard不要）
  for (let i = _konaParticles.length - 1; i >= 0; i--) {
    const p = _konaParticles[i];
    if (p.burstSeed === data.burstSeed && p.fractureLevel != null) {
      p.pixi.destroy(); _konaParticles.splice(i, 1);
    }
  }
  // テキストブロックを探す
  const bIdx = _konaTextBlocks.findIndex(b => b.burstSeed === data.burstSeed && !b.crumbled);
  if (bIdx >= 0) {
    const b = _konaTextBlocks[bIdx];
    if (b.landed) {
      // 着地済み: 即座に適用
      if (b.pixi) { b.pixi.destroy(); b.pixi = null; }
      _konaTextBlocks.splice(bIdx, 1);
      _konaApplyShatterData(data.burstSeed, data.shards);
    } else {
      // まだ落下中: 着地後に適用
      b.pendingShatter = data.shards;
    }
  } else {
    // ブロックが既にない（ローカルで割れていた等）
    _konaApplyShatterData(data.burstSeed, data.shards);
  }
});

socket.on("konaFracture", data => {
  if (!_isKonaRoom() || !_konaContainer) return;
  // 親FL:0シャードが既にない（自前で処理済み）場合はスキップ
  if (_konaIsCurrentHost() && !_konaParticles.some(p => p.fractureLevel === 0 && p.burstSeed === data.parentSeed && p.pieceIdx === data.parentIdx)) return;
  // 親FL:0と同じ親から生まれたFL:1も削除（ホスト交代による二重fracture送信時の重複防止）
  for (let i = _konaParticles.length - 1; i >= 0; i--) {
    const p = _konaParticles[i];
    if (p.burstSeed !== data.parentSeed || p.fractureLevel == null) continue;
    if ((p.fractureLevel === 0 && p.pieceIdx === data.parentIdx) ||
        (p.fractureLevel === 1 && p.pieceIdx != null && Math.floor(p.pieceIdx / 4) === data.parentIdx)) {
      p.pixi.destroy(); _konaParticles.splice(i, 1);
    }
  }
  _konaApplyShatterData(data.parentSeed, data.shards);
});

socket.on("konaSyncFull", data => {
  // 明示的にホストとして確定している場合のみスキップ（トークンソート推定ホストは通す）
  const isExplicitHost = !!_konaCurrentHostToken && _konaCurrentHostToken === myToken;
  if (isExplicitHost && Date.now() > _konaAcceptSyncUntil) return;
  if (isExplicitHost) { clearTimeout(_konaHostClaimSyncTimer); _konaHostClaimSyncTimer = null; }
  if (!_isKonaRoom() || !_konaContainer) return;
  _konaFractureQueue = [];

  // ── shards: スマートマージ（既存はposition更新のみ、新規のみgfx生成）──
  {
    const inShards = data.shards || [];
    const localShards = _konaParticles.filter(p => p.fractureLevel != null);
    const localByKey = new Map();
    for (const lp of localShards) {
      const tr = lp.texRegion || {};
      const k = (lp.burstSeed != null && lp.pieceIdx != null)
        ? `${lp.burstSeed}_${lp.fractureLevel}_p${lp.pieceIdx}`
        : (lp.isDiagonalShard
          ? `${lp.burstSeed ?? -1}_${lp.fractureLevel}_${Math.round(lp.diagCx||0)}_${Math.round(lp.diagCy||0)}_${Math.round(lp.blockInfo?.textW||0)}_${Math.round(lp.blockInfo?.textH||0)}`
          : `${lp.burstSeed ?? -1}_${lp.fractureLevel}_${Math.round(tr.x||0)}_${Math.round(tr.y||0)}_${Math.round(tr.w||0)}_${Math.round(tr.h||0)}`);
      if (!localByKey.has(k)) localByKey.set(k, lp);
    }
    const matchedLocal = new Set();
    const newShards = [];
    for (const s of inShards) {
      if (_konaParticles.length >= KONA_MAX_PARTICLES) break;
      const ik = (s.burstSeed != null && s.pieceIdx != null)
        ? `${s.burstSeed}_${s.fractureLevel}_p${s.pieceIdx}`
        : (s.diagLocalPoly
          ? `${s.burstSeed ?? -1}_${s.fractureLevel}_${Math.round(s.diagCx||0)}_${Math.round(s.diagCy||0)}_${Math.round(s.blockInfo?.textW||0)}_${Math.round(s.blockInfo?.textH||0)}`
          : `${s.burstSeed ?? -1}_${s.fractureLevel}_${Math.round(s.texX||0)}_${Math.round(s.texY||0)}_${Math.round(s.w||0)}_${Math.round(s.h||0)}`);
      const lp = localByKey.get(ik);
      if (lp) {
        matchedLocal.add(lp);
        lp.x = s.x; lp.y = s.y; lp.vx = s.vx || 0; lp.vy = s.vy || 0;
        lp.rot = s.rot || 0; lp.rotV = s.rotV || 0; lp.settled = !!s.settled; lp.kickCount = s.kickCount || 0;
        lp.pixi.position.set(s.x, s.y); lp.pixi.rotation = s.rot || 0;
      } else {
        newShards.push(s);
      }
    }
    // マッチしなかったローカルシャードを削除（ただし相手がまだ破裂させていないブロック由来のシャードは保持）
    const _activeBlockSeeds = new Set((data.textBlocks || []).map(b => b.burstSeed));
    for (const lp of localShards) {
      if (!matchedLocal.has(lp) && !_activeBlockSeeds.has(lp.burstSeed)) {
        lp.pixi.destroy();
        const idx = _konaParticles.indexOf(lp); if (idx >= 0) _konaParticles.splice(idx, 1);
      }
    }
    // 使われなくなったRTをクリーンアップ
    const activeSeedSet = new Set(_konaParticles.filter(p => p.fractureLevel != null && p.burstSeed != null).map(p => p.burstSeed));
    for (const [seed, rt] of _konaSyncRtCache) {
      if (!activeSeedSet.has(seed)) {
        if (!rt.destroyed) rt.destroy(true);
        const ri = _konaRenderTextures.indexOf(rt); if (ri >= 0) _konaRenderTextures.splice(ri, 1);
        _konaSyncRtCache.delete(seed);
      }
    }
    // 新規シャードを生成
    for (const s of newShards) {
      if (_konaParticles.length >= KONA_MAX_PARTICLES) break;
      const hw = s.w / 2, hh = s.h / 2;
      let gfx, shardRt = null;
      if (s.blockInfo && s.burstSeed != null && s.fractureLevel <= 1 && s.blockInfo.textW && s.blockInfo.textH) {
        const bi = s.blockInfo;
        if (!_konaSyncRtCache.has(s.burstSeed)) {
          const rt = PIXI.RenderTexture.create({ width: bi.textW, height: bi.textH });
          _konaRenderTextures.push(rt);
          _konaSyncRtCache.set(s.burstSeed, rt);
          document.fonts.load(`1px "${bi.fontFamily}"`).then(() => {
            if (!_isKonaRoom() || rt.destroyed) return;
            const t2 = new PIXI.Text(bi.grp, { fontFamily: bi.fontFamily, fontStyle: bi.fontStyle || 'normal', fontWeight: bi.fontWeight || 'normal', fontSize: bi.fontSize, fill: bi.color, align: 'center' });
            t2.anchor.set(0, 0); t2.position.set(0, 0);
            if (t2.width > 0 && t2.height > 0) t2.scale.set(bi.textW / t2.width, bi.textH / t2.height);
            app.renderer.render(t2, { renderTexture: rt, clear: true }); t2.destroy();
          });
        }
        shardRt = _konaSyncRtCache.get(s.burstSeed);
        if (s.diagLocalPoly && s.diagLocalPoly.length >= 3) {
          const matrix = new PIXI.Matrix().translate(s.diagCx || 0, s.diagCy || 0);
          gfx = new PIXI.Graphics();
          gfx.beginTextureFill({ texture: shardRt, matrix });
          gfx.moveTo(s.diagLocalPoly[0][0], s.diagLocalPoly[0][1]);
          for (let i = 1; i < s.diagLocalPoly.length; i++) gfx.lineTo(s.diagLocalPoly[i][0], s.diagLocalPoly[i][1]);
          gfx.closePath(); gfx.endFill(); gfx.alpha = 0.95;
        } else {
          const _sx = s.texX || 0, _sy = s.texY || 0;
          const _sw = Math.min(s.w, shardRt.width - _sx), _sh = Math.min(s.h, shardRt.height - _sy);
          const shardTex = new PIXI.Texture(shardRt.baseTexture, new PIXI.Rectangle(_sx, _sy, _sw, _sh));
          gfx = new PIXI.Sprite(shardTex); gfx.anchor.set(0.5, 0.5); gfx.alpha = 0.95;
        }
      } else {
        gfx = new PIXI.Graphics();
        gfx.beginFill(s.color, 0.88);
        gfx.moveTo(-hw, -hh); gfx.lineTo(hw, -hh); gfx.lineTo(hw, hh); gfx.lineTo(-hw, hh);
        gfx.closePath(); gfx.endFill();
      }
      gfx.zIndex = 200; gfx.position.set(s.x, s.y); gfx.rotation = s.rot || 0;
      _konaContainer.addChild(gfx);
      const isDiag = !!(s.diagLocalPoly);
      const maxR = isDiag ? Math.max(...s.diagLocalPoly.map(v => Math.hypot(v[0], v[1]))) : Math.max(hw, hh);
      _konaParticles.push({
        pixi: gfx, color: s.color, r: maxR,
        x: s.x, y: s.y, vx: s.vx || 0, vy: s.vy || 0, settled: !!s.settled, rot: s.rot || 0, rotV: s.rotV || 0,
        fractureLevel: s.fractureLevel, kickCount: s.kickCount || 0, hardness: s.hardness || 1,
        isTextureShard: !!shardRt, renderTexture: shardRt,
        isDiagonalShard: isDiag, diagLocalPoly: s.diagLocalPoly || null, diagCx: s.diagCx || 0, diagCy: s.diagCy || 0,
        texRegion: { x: s.texX || 0, y: s.texY || 0, w: s.w, h: s.h },
        blockInfo: s.blockInfo || null, burstSeed: s.burstSeed != null ? s.burstSeed : null,
        pieceIdx: s.pieceIdx != null ? s.pieceIdx : null,
      });
    }
  }

  // ── dust particles: カウント合わせのみ ──
  {
    const inc = data.particles || [];
    const localDust = _konaParticles.filter(p => p.fractureLevel == null);
    for (let i = localDust.length - 1; i >= inc.length; i--) {
      localDust[i].pixi.destroy();
      const idx = _konaParticles.indexOf(localDust[i]); if (idx >= 0) _konaParticles.splice(idx, 1);
    }
    for (let i = localDust.length; i < inc.length; i++) {
      if (_konaParticles.length >= KONA_MAX_PARTICLES) break;
      const pd = inc[i];
      const pixi = new PIXI.Graphics();
      pixi.beginFill(pd.color, 0.85); pixi.drawCircle(0, 0, pd.r || 1); pixi.endFill();
      pixi.zIndex = 190; pixi.position.set(pd.x, pd.y);
      _konaContainer.addChild(pixi);
      _konaParticles.push({ pixi, color: pd.color, r: pd.r || 1, x: pd.x, y: pd.y, vx: 0, vy: 0, settled: true });
    }
  }

  // ── textBlocks: スマートマージ ──
  {
    const inBlocks = data.textBlocks || [];
    const localByBS = new Map();
    for (const b of _konaTextBlocks) {
      if (!localByBS.has(b.burstSeed)) localByBS.set(b.burstSeed, b);
    }
    const matchedBlocks = new Set();
    const newBlocks = [];
    for (const b of inBlocks) {
      const lb = localByBS.get(b.burstSeed);
      if (lb && !lb.crumbled) {
        matchedBlocks.add(lb);
        if (b.landed) {
          // 着地済み: 位置同期。landed=falseへの逆戻しはしない。
          lb.x = b.x; lb.y = b.y; lb.vx = b.vx; lb.vy = b.vy;
          lb.rot = b.rot || 0; lb.rotV = b.rotV || 0;
          if (!lb.landed) { lb.landed = true; if (!lb.landedAt) lb.landedAt = Date.now(); }
          if (lb.pixi) { lb.pixi.position.set(b.x, b.y); lb.pixi.rotation = b.rot || 0; }
        }
        // 落下中(b.landed=false)は位置を同期しない（deltaの蓄積で先行している場合に逆方向ジャンプが起きるため）
      } else if (!_konaLocallyShatteredSeeds.has(b.burstSeed)) {
        newBlocks.push(b);
      }
    }
    for (let i = _konaTextBlocks.length - 1; i >= 0; i--) {
      const lb = _konaTextBlocks[i];
      if (!matchedBlocks.has(lb)) {
        if (lb.pixi && !lb.crumbled) lb.pixi.destroy();
        if (lb.pendingShatter) {
          // shard sectionで既に生成されている可能性があるので先に削除してから適用
          for (let j = _konaParticles.length - 1; j >= 0; j--) {
            if (_konaParticles[j].burstSeed === lb.burstSeed && _konaParticles[j].fractureLevel != null) {
              _konaParticles[j].pixi.destroy(); _konaParticles.splice(j, 1);
            }
          }
          _konaApplyShatterData(lb.burstSeed, lb.pendingShatter);
        }
        _konaTextBlocks.splice(i, 1);
      }
    }
    for (const b of newBlocks) {
      if (!_konaContainer) break;
      const fStyle = b.fontStyle || 'normal', fWeight = b.fontWeight || 'normal';
      const pixi = new PIXI.Text(b.grp, { fontFamily: b.fontFamily, fontStyle: fStyle, fontWeight: fWeight, fontSize: b.fontSize, fill: b.color, align: 'center' });
      pixi.anchor.set(0.5, 1); pixi.position.set(b.x, b.y); pixi.rotation = b.rot || 0; pixi.zIndex = 200;
      _konaContainer.addChild(pixi);
      const hasSize = b.textW > 0 && b.textH > 0;
      const block = {
        pixi, color: b.color, grp: b.grp, fontSize: b.fontSize, fontFamily: b.fontFamily, fontStyle: fStyle, fontWeight: fWeight,
        x: b.x, y: b.y, vx: b.vx, vy: b.vy, rot: b.rot || 0, rotV: b.rotV || 0,
        burstSeed: b.burstSeed, initY: b.initY, initVy: b.initVy, hardness: b.hardness,
        landed: !!b.landed, crumbled: false, burstDone: false,
        landedAt: b.landed ? Date.now() : undefined,
        textW: b.textW || null, textH: b.textH || null,
        fontReady: hasSize ? undefined : false,
      };
      _konaTextBlocks.push(block);
      if (!hasSize) {
        document.fonts.load(`1px "${block.fontFamily}"`).then(() => {
          if (block.pixi && !block.crumbled) {
            block.pixi.updateText(false);
            if (!block.textW) block.textW = Math.ceil(block.pixi.width);
            if (!block.textH) block.textH = Math.ceil(block.pixi.height);
            block.fontReady = true;
          }
        });
      } else {
        document.fonts.load(`1px "${block.fontFamily}"`).then(() => {
          if (block.pixi && !block.crumbled) block.pixi.text = block.pixi.text;
        });
      }
    }
  }
  if (data.bd) { for (const [s, bp] of Object.entries(data.bd)) _konaBreakData.set(Number(s), bp); }
});

socket.on("konaPosSync", data => {
  if (!_isKonaRoom() || !_konaContainer) return;
  if (_konaCurrentHostToken && _konaCurrentHostToken === myToken) return;
  if (!!keyMoveTickerFn || !!(avaP[myToken] && (avaP[myToken].isMoving || avaP[myToken].dropVelocity > 1))) return;

  // ── dust: カウント合わせのみ（位置は更新しない: 200ms毎の微動防止）──
  const inc = data.d || [];
  const localDust = _konaParticles.filter(p => p.settled && p.fractureLevel == null);
  for (let i = localDust.length - 1; i >= inc.length; i--) {
    localDust[i].pixi.destroy();
    const idx = _konaParticles.indexOf(localDust[i]); if (idx >= 0) _konaParticles.splice(idx, 1);
  }
  for (let i = localDust.length; i < inc.length; i++) {
    if (_konaParticles.length >= KONA_MAX_PARTICLES) break;
    const [x, y, r4, color] = inc[i];
    const r = r4 / 4;
    const pixi = new PIXI.Graphics();
    pixi.beginFill(color, 0.85); pixi.drawCircle(0, 0, r); pixi.endFill();
    pixi.zIndex = 190; pixi.position.set(x, y);
    _konaContainer.addChild(pixi);
    _konaParticles.push({ pixi, color, r, x, y, vx: 0, vy: 0, settled: true });
  }

  // ── shards: 形状キー（burstSeed+fl+texX+texY+w+h）で突合し、完全データで再構築 ──
  const incS = data.s || [];
  const biMap = data.bi || {};
  if (incS.length || _konaParticles.some(p => p.fractureLevel != null)) {
    const localS = _konaParticles.filter(p => p.fractureLevel != null);
    // 形状キー → ローカルパーティクル のマップ
    const localByKey = new Map();
    for (const lp of localS) {
      const tr = lp.texRegion || {};
      const key = (lp.burstSeed != null && lp.pieceIdx != null)
        ? `${lp.burstSeed}_${lp.fractureLevel}_p${lp.pieceIdx}`
        : (lp.isDiagonalShard
          ? `${lp.burstSeed ?? -1}_${lp.fractureLevel}_${Math.round(lp.diagCx||0)}_${Math.round(lp.diagCy||0)}_${Math.round(lp.blockInfo?.textW||0)}_${Math.round(lp.blockInfo?.textH||0)}`
          : `${lp.burstSeed ?? -1}_${lp.fractureLevel}_${Math.round(tr.x||0)}_${Math.round(tr.y||0)}_${Math.round(tr.w||0)}_${Math.round(tr.h||0)}`);
      if (!localByKey.has(key)) localByKey.set(key, lp);
    }
    const matchedLocal = new Set();
    const newShards = [];
    for (const [sx, sy, srot, sFL, sw, sh, stexX, stexY, scolor, sSeed, skickCount, shardness, srotV, sSettledFlag, svx, svy, sPieceIdx] of incS) {
      const sSettled = !!sSettledFlag;
      const key = (sSeed !== -1 && sPieceIdx != null && sPieceIdx !== -1)
        ? `${sSeed}_${sFL}_p${sPieceIdx}`
        : `${sSeed}_${sFL}_${Math.round(stexX)}_${Math.round(stexY)}_${Math.round(sw)}_${Math.round(sh)}`;
      const lp = localByKey.get(key);
      if (lp) {
        matchedLocal.add(lp);
        const _mhw = (lp.texRegion?.w || 0) / 2, _mhh = (lp.texRegion?.h || 0) / 2;
        if (!sSettled) {
          lp.x = sx; lp.y = sy; lp.vx = svx || 0; lp.vy = svy || 0;
          lp.pixi.position.set(sx, sy);
          lp.settled = false;
        } else if (sy >= KONA_GROUND_Y - Math.max(_mhw, _mhh)) {
          lp.x = sx; lp.y = sy; lp.vx = 0; lp.vy = 0;
          lp.pixi.position.set(sx, sy);
          lp.settled = true;
        }
        lp.rot = srot; lp.rotV = srotV || 0;
        lp.pixi.rotation = srot;
        lp.kickCount = skickCount;
      } else {
        newShards.push([sx, sy, srot, sFL, sw, sh, stexX, stexY, scolor, sSeed, skickCount, shardness, srotV || 0, sSettled, svx || 0, svy || 0, sPieceIdx != null ? sPieceIdx : null]);
      }
    }
    // マッチしなかったローカルシャードを削除
    for (const lp of localS) {
      if (!matchedLocal.has(lp)) {
        lp.pixi.destroy();
        const idx = _konaParticles.indexOf(lp); if (idx >= 0) _konaParticles.splice(idx, 1);
      }
    }
    // 新規シャードを構築（定着済み塵を退避してスペースを確保）
    if (newShards.length > 0) {
      const needed = newShards.length - (KONA_MAX_PARTICLES - _konaParticles.length);
      if (needed > 0) {
        let evicted = 0;
        for (let ei = 0; ei < _konaParticles.length && evicted < needed; ei++) {
          const ep = _konaParticles[ei];
          if (ep.fractureLevel == null && ep.settled) {
            ep.pixi.destroy(); _konaParticles.splice(ei, 1); ei--; evicted++;
          }
        }
      }
    }
    for (const [sx, sy, srot, sFL, sw, sh, stexX, stexY, scolor, sSeed, skickCount, shardness, srotV, sSettled, svx, svy, sPIdx] of newShards) {
      if (_konaParticles.length >= KONA_MAX_PARTICLES) break;
      // FL:0シャードはdiagLocalPolyが必要なためkonaShatter/konaSyncFullで生成する
      if (sFL === 0) continue;
      const hw = sw / 2, hh = sh / 2;
      let gfx, shardRt = null;
      const bi = sSeed !== -1 ? biMap[sSeed] : null;
      if (bi && bi.textW && bi.textH) {
        if (!_konaSyncRtCache.has(sSeed)) {
          const rt = PIXI.RenderTexture.create({ width: bi.textW, height: bi.textH });
          _konaRenderTextures.push(rt);
          _konaSyncRtCache.set(sSeed, rt);
          document.fonts.load(`1px "${bi.fontFamily}"`).then(() => {
            if (!_isKonaRoom() || rt.destroyed) return;
            const t2 = new PIXI.Text(bi.grp, { fontFamily: bi.fontFamily, fontStyle: bi.fontStyle || 'normal', fontWeight: bi.fontWeight || 'normal', fontSize: bi.fontSize, fill: bi.color, align: 'center' });
            t2.anchor.set(0, 0); t2.position.set(0, 0);
            if (t2.width > 0 && t2.height > 0) t2.scale.set(bi.textW / t2.width, bi.textH / t2.height);
            app.renderer.render(t2, { renderTexture: rt, clear: true }); t2.destroy();
          });
        }
        shardRt = _konaSyncRtCache.get(sSeed);
        const _sx2 = stexX, _sy2 = stexY;
        const _sw2 = Math.min(sw, shardRt.width - _sx2), _sh2 = Math.min(sh, shardRt.height - _sy2);
        const shardTex = new PIXI.Texture(shardRt.baseTexture, new PIXI.Rectangle(_sx2, _sy2, _sw2, _sh2));
        gfx = new PIXI.Sprite(shardTex);
        gfx.anchor.set(0.5, 0.5);
        gfx.alpha = 0.95;
      } else {
        gfx = new PIXI.Graphics();
        gfx.beginFill(scolor, 0.88);
        gfx.moveTo(-hw, -hh); gfx.lineTo(hw, -hh); gfx.lineTo(hw, hh); gfx.lineTo(-hw, hh);
        gfx.closePath(); gfx.endFill();
      }
      const shardOnFloor = sSettled && sy >= KONA_GROUND_Y - Math.max(hw, hh);
      const placeY = sSettled ? (shardOnFloor ? sy : KONA_GROUND_Y - Math.max(hw, hh)) : sy;
      gfx.zIndex = 200; gfx.position.set(sx, placeY); gfx.rotation = srot;
      _konaContainer.addChild(gfx);
      _konaParticles.push({
        pixi: gfx, color: scolor, r: Math.max(hw, hh),
        x: sx, y: placeY, vx: sSettled ? 0 : (svx || 0), vy: sSettled ? 0 : (svy || 0), settled: !!sSettled, rot: srot, rotV: srotV,
        fractureLevel: sFL, kickCount: skickCount, hardness: shardness,
        isTextureShard: !!shardRt,
        renderTexture: shardRt,
        texRegion: { x: stexX, y: stexY, w: sw, h: sh },
        blockInfo: bi || null,
        burstSeed: sSeed !== -1 ? sSeed : null,
        pieceIdx: sPIdx != null && sPIdx !== -1 ? sPIdx : null,
      });
    }
  }
  // break data マージ＆FL:0 不一致チェック
  if (data.bds) {
    for (const [s, bp] of Object.entries(data.bds)) {
      const seed = Number(s);
      _konaBreakData.set(seed, bp);
      _konaCheckFL0Match(seed, bp);
    }
  }
});

socket.on("otherLeft", data => {//自分以外が部屋から退室した時
  if (!avaP[data.token]) return;
  if (avaP[data.token]._tickerFn) {
    app.ticker.remove(avaP[data.token]._tickerFn);
    avaP[data.token]._tickerActive = false;
  }
  if (avaP[data.token].abon) return;//アボンされてない場合のみ処理を実行
  if (useLogChime) {//ログチャイムがオンになってたら退室の音を鳴らす
    msgSE[roomSE].out[data.random].play();
  }

  // 退室アバターに乗っていたアバターの乗車を解除
  for (const tk in avaP) {
    if (avaP[tk] && avaP[tk].ridingObject === avaP[data.token]) {
      avaP[tk].stopRiding();
      if (tk === myToken) avaP[tk].sendTransformData("落下開始");
    }
  }
  // 吹き出しがオーバーレイ層にある場合は先に除去
  if (avaP[data.token].msg) {
    avaP[data.token].msg._stopOverlayTick();
    if (avaP[data.token].msg.parent) avaP[data.token].msg.parent.removeChild(avaP[data.token].msg);
  }
  // アバターを部屋から排除
  room.container.removeChild(avaP[data.token].container);
  roomMemberToken = roomMemberToken.filter(token => token !== data.token);//退室した人のtokenをroomMemberTokenから削除
  if (_konaCurrentHostToken === data.token) {
    _konaCurrentHostToken = null;
    if (_isKonaRoom()) {
      const newHost = [...roomMemberToken].sort()[0];
      if (newHost === myToken) { _konaCurrentHostToken = myToken; socket.emit("konaHostClaim"); _konaSendFullSync(); }
    }
  }

  avaP[data.token].roomIn--;
  usersNumber.textContent = room.container.children.filter(child => child.token).length;//部屋人数の表記を変える
  outputChatMsg(data.announce, false, data.token, true);
  if (avatarOekakiToken === data.token) {
    avatarOekakiToken = false;
    switchDrawing();//部屋用お絵描きに切り替える
  }
  stopConnection(data.token);
  _removeVideoFloor(data.token);

  //部屋ごとの独自処理を追加
  if (room.name === "星1") {
    let star1Blur = 0;
    let star1BlurFlag = true;
    const star1Filter = new PIXI.filters.BlurFilter();
    star1Loop();

    function star1Loop() {
      if (star1BlurFlag) {
        if (star1Blur >= 0) {
          star1Blur += 10;
        }
        if (star1Blur >= 100) {
          star1BlurFlag = false;
        }
        requestAnimationFrame(() => { star1Loop() });
      } else {
        if (star1Blur >= 0) {
          star1Blur -= 1;
          requestAnimationFrame(() => { star1Loop() });
        } else {
          star1BlurFlag = true;
          star1Blur = 0;
          room.container.filters = [];
          return;
        }
      }
      star1Filter.blur = star1Blur;
      room.container.filters = [star1Filter];
    }
    room.f = 200;
    room.colorIndex = 0;
    room.removeStars();
    room.drawStar(430, 450, 200, 0, 90, data.starColors);
  }
});

//部屋でログアウトした時の処理
socket.on("logout", data => {
  //部屋人数の表記を変える
  usersNumber.textContent = room.container.children.filter(child => child.token).length;//部屋人数の表記を変える
  if (avaP[data.token]) {
    for (const tk in avaP) {
      if (tk !== data.token && avaP[tk] && avaP[tk].ridingObject === avaP[data.token]) {
        avaP[tk].stopRiding();
        if (tk === myToken) avaP[tk].sendTransformData("落下開始");
      }
    }
    objMap[data.room]?.container.removeChild(avaP[data.token].container);
    if (avaP[data.token]._tickerFn) app.ticker.remove(avaP[data.token]._tickerFn);
    delete avaP[data.token];
  }
  roomMemberToken = roomMemberToken.filter(token => token !== data.token);//退室した人のtokenをroomMemberTokenから削除
  if (_konaCurrentHostToken === data.token) {
    _konaCurrentHostToken = null;
    if (_isKonaRoom()) {
      const newHost = [...roomMemberToken].sort()[0];
      if (newHost === myToken) { _konaCurrentHostToken = myToken; socket.emit("konaHostClaim"); _konaSendFullSync(); }
    }
  }

  outputChatMsg(data.msg, false, data.token, true);//移動時のメッセージ出力
  if (useLogChime) {//ログチャイムがオンになってたら、ログアウトの音を鳴らす
    msgSE[roomSE].logout[data.random].play();
  }

  if (avatarOekakiToken === data.token) {
    avatarOekakiToken = false;
    switchDrawing();//部屋用お絵描きに切り替える
  }
  _removeVideoFloor(data.token);
  // 再接続による一時的な切断の場合にWebRTCを壊さないよう2秒遅延
  setTimeout(() => stopConnection(data.token), 2000);
});

//再起動用メッセージ
socket.on("emitSaikiMsg", data => {
  outputChatMsg(data.msg);
});

// ---- 自動再接続 ----
socket.on("disconnect", (reason) => {
  if (!wasLoggedIn) return;
  isReconnecting = true;

  // WebRTC接続を切断（ソケットは切れているのでemitは不要）
  stopAllConnection();
  videoStatus = false;
  audioStatus = false;
  for (let _cn = MAX_CAMS; _cn >= 2; _cn--) {
    const _xc = _xcam[_cn];
    if (_xc && _xc.status) {
      _xc.status = false;
      if (_xc.stream) { _xc.stream.getTracks().forEach(t => t.stop()); _xc.stream = null; }
      _xc.track = null;
      if (videoArray[myToken + '_' + _cn]) detachVideo(myToken + '_' + _cn);
    }
  }

  // 再接続に使う状態を保存
  const ava = avaP[myToken];
  reconnectSavedState = {
    userName: localStorage.getItem("avatarUserName") || (ava ? ava.name : "名もなき名無し"),
    avatarAspect: ava ? ava.avatarAspect : "gomaneco",
    avatarColor: ava ? ava.avatarColor : 0xffffff,
    avatarAlpha: ava ? (ava.avatarAlpha || 1) : 1,
    drawHistory: ava ? (ava.drawHistory || []) : [],
    room: room ? room.name : "エントランス",
    AX: ava ? ava.container.x : 330,
    AY: ava ? ava.container.y : 200,
  };

  const reasonMsg =
    reason === "ping timeout" ? "サーバー応答タイムアウト" :
    reason === "transport close" ? "ネットワーク切断" :
    reason === "transport error" ? "接続エラー" :
    reason === "io server disconnect" ? "サーバー切断" :
    reason;
  outputChatMsg(`再接続中… (${reasonMsg})`, "blue");

  // 60秒以内に再接続できなければ原因推定して失敗メッセージ
  reconnectTimeout = setTimeout(() => {
    if (isReconnecting) {
      isReconnecting = false;
      if (!socket.connected) {
        outputChatMsg("再接続に失敗しました。サーバーが停止しているかネットワークに問題があります。時間を置いてからブラウザを更新してください。", "blue");
      } else {
        outputChatMsg("再接続に失敗しました。原因不明です。ブラウザを更新してみてください。", "blue");
      }
    }
  }, 60000);
});

socket.on("connect", () => {
  if (isReconnecting) {
    socket.emit("getMyUser");
    if (document.getElementById('roomEditPanel').style.display !== 'none' && imgEditRoomId && !_isNewRoomMode) {
      socket.emit('startRoomEdit', { roomId: imgEditRoomId, isNew: _isNewRoomMode });
      for (const id of _pendingImgAdds) socket.emit('pendingAddImg', { id });
      for (const id of _pendingWarpAdds) socket.emit('pendingAddWarp', { id });
    }
  }
});

socket.on("reconnectFailed", () => {
  isReconnecting = false;
  clearTimeout(reconnectTimeout);
  reconnectTimeout = null;
  outputChatMsg("再接続に失敗しました。いた部屋がなくなったかサーバーが更新されました。ブラウザを更新してください。", "blue");
});

socket.on("roomNotFound", () => {
  if (_mugenGateBeingEntered !== -1) {
    const gateIdx = _mugenGateBeingEntered;
    _mugenGateBeingEntered = -1;
    mugenGateRooms[gateIdx] = null;
    updateMugenGateTints();
    goSelfToRoomSpot('mugenMainSpot');
    showGateCreateDialog(gateIdx, 'むげん');
    return;
  }
  if (_directionGateBeingEntered) {
    const { roomName, gateIndex } = _directionGateBeingEntered;
    _directionGateBeingEntered = null;
    if (!directionGateRooms[roomName]) directionGateRooms[roomName] = [null, null, null, null];
    directionGateRooms[roomName][gateIndex] = null;
    updateDirectionGateTints(roomName);
    goSelfToRoomSpot(_roomToSpot(roomName));
    showDirectionGateCreateDialog(roomName, gateIndex);
    return;
  }
  outputChatMsg("その部屋は存在しません。エントランスに戻ります。", "blue");
  goSelfToRoomSpot('entranceMainSpot');
});


//大黒柱の頂点を配置
let daikokubasiraBlock = new PIXI.Graphics();//ブロックを置く宣言
daikokubasiraBlock.beginFill(0xf0f8ff);
daikokubasiraBlock.drawPolygon([
  125, 200,
  175, 300,
  175, 300,
  125, 200,
]);

//障害物の範囲設定
const bonfireBlockX = [270, 349, 392, 320, 270];
const bonfireBlockY = [326, 285, 325, 358, 326];
const daikokubasiraBottomBlockX = [125, 175, 175, 125, 125];
const daikokubasiraBottomBlockY = [295, 295, 300, 300, 295];

function meadowBlock() {
  // ⭐ 現在位置をグローバル変数ではなく実際の位置に ⭐
  const currentAX = avaP[myToken] ? avaP[myToken].container.x : AX;
  const currentAY = avaP[myToken] ? avaP[myToken].container.y : AY;

  iniColPoint(bonfireBlockX);
  checkColPoint(bonfireBlockX, bonfireBlockY, currentAX, currentAY);
  iniColPoint(daikokubasiraBottomBlockX);
  checkColPoint(daikokubasiraBottomBlockX, daikokubasiraBottomBlockY, currentAX, currentAY);
}
function getBestPolygon(key) {
  const polys = polygons[key];
  if (!polys || polys.length === 0) return null;
  let best = polys[0], bestArea = 0;
  for (const flat of polys) {
    let a = 0;
    for (let i = 0; i < flat.length; i += 2) {
      const x1 = flat[i], y1 = flat[i + 1];
      const x2 = flat[(i + 2) % flat.length], y2 = flat[(i + 3) % flat.length];
      a += x1 * y2 - x2 * y1;
    }
    if (Math.abs(a) > bestArea) { bestArea = Math.abs(a); best = flat; }
  }
  return best;
}


//宇宙に画像を入れた時に↑のを参考に増やす
function outerSpaceBlock() {
}

// ===== 文字の部屋・粉の部屋システム =====
const KONA_GROUND_Y = 345;
const KONA_MAX_PARTICLES = 800;
let _konaParticles = [];
let _konaTextBlocks = [];
let _konaTicker = null;
let _konaContainer = null;
let _konaFloor = null;
let _konaPrevAX = 0;
let _konaPrevAY = 0;
let _konaLastKickEmit = 0;
let _konaSyncReceived = false;
let _konaRenderTextures = [];
let _konaFractureQueue = [];
let _konaPeriodicSyncInterval = null;
let _konaSyncRtCache = new Map(); // burstSeed → RenderTexture（konaPosSync用RTキャッシュ）
let _konaBreakData = new Map(); // burstSeed → { t:'d'|'r', tw, th, ox, oy, bm, tx?, bx?, cols?, rows?, cx?, ry?, bi }
let _konaNeedResync = false; // FL:0 不一致検知後のresync重複防止
let _konaAvaStopTimer = null;
let _konaHostClaimSyncTimer = null;
let _konaCurrentHostToken = null;
let _konaAcceptSyncUntil = 0;
let _konaNoKickUntil = 0;
let _konaLastHostChangeAt = 0;
let _konaLocallyShatteredSeeds = new Set(); // Fix3でローカル強制破裂したburstSeedを記録

function _isKonaRoom() { return !!(room && (room.name === "文字の部屋" || room.name === "粉の部屋")); }

function konaNoHeyaBlock() {
  if (MY > KONA_GROUND_Y) {
    MY = KONA_GROUND_Y;
  }
}

// mulberry32 ベースの seeded PRNG
function _konaMakeRng(seed) {
  let s = (seed ^ 0xDEADBEEF) >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), 1 | s);
    s ^= s + Math.imul(s ^ (s >>> 7), 61 | s);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

function _konaHslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
  const toHex = x => Math.round(255 * x).toString(16).padStart(2, '0');
  return parseInt(toHex(f(0)) + toHex(f(8)) + toHex(f(4)), 16);
}

function _konaCharColor(char) {
  const code = char.codePointAt(0);
  const h = (code * 137.508) % 360;
  const s = 55 + ((code * 47) % 40);
  const l = 68 + ((code * 37) % 17);
  return _konaHslToHex(h, s, l);
}

function _konaTextColor(grp, totalLen, senderColor) {
  // ゴールデンレシオハッシュ（連続コードポイントを均一分散→あいうえおが全部別色に）
  let h32 = Math.imul(totalLen + 1, 2246822519) >>> 0;
  for (const c of grp) {
    h32 = (Math.imul(h32, 1664525) + Math.imul(c.codePointAt(0), 2654435761) + 1013904223) >>> 0;
  }
  const hPure = (h32 / 0x100000000) * 360;

  // 送信者カラーを整数化
  const scInt = senderColor != null
    ? (typeof senderColor === 'string' ? (parseInt(senderColor.replace('#', ''), 16) || 0xFFFFFF) : senderColor)
    : null;

  // 部屋メンバー全員の色を収集してソート（決定論的）
  const seen = new Set();
  const memberColors = [];
  for (const t of roomMemberToken) {
    const c = avaP[t]?.avatarColor;
    if (c != null && typeof c === 'number' && !seen.has(c)) { seen.add(c); memberColors.push(c); }
  }
  memberColors.sort((a, b) => a - b);
  // 送信者の色を先頭に追加（2票→同系統がちょっと高め）
  const colorPool = scInt != null ? [scInt, ...memberColors] : memberColors;

  let h = hPure;
  // h32の上位ビットで約62%の確率でアバター色系統を使う（残り38%は純ハッシュ色）
  if (colorPool.length > 0 && ((h32 >>> 8) & 0xFF) < 159) {
    const base = colorPool[(h32 >>> 16) % colorPool.length];
    const r = (base >> 16) & 0xFF, g = (base >> 8) & 0xFF, b = base & 0xFF;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max !== min) {
      const d = max - min;
      let sH;
      if (max === r) sH = ((g - b) / d + (g < b ? 6 : 0)) * 60;
      else if (max === g) sH = ((b - r) / d + 2) * 60;
      else sH = ((r - g) / d + 4) * 60;
      const offset = (hPure / 360 - 0.5) * 120;  // ±60°
      h = (sH + offset + 360) % 360;
    }
  }

  const code0 = grp.codePointAt(0);
  const s = 40 + ((code0 * 47) % 26); // パステル寄り: 40-65%
  const l = 75 + ((code0 * 37) % 14); // パステル寄り: 75-88%
  return _konaHslToHex(h, s, l);
}

function _konaKanjiDensity(text) {
  let count = 0;
  for (const c of text) {
    const cp = c.codePointAt(0);
    if ((cp >= 0x4E00 && cp <= 0x9FFF) || (cp >= 0x3400 && cp <= 0x4DBF)) count++;
  }
  return text.length > 0 ? count / text.length : 0;
}

function _konaFontSize(totalLen) {
  if (totalLen <= 4)  return 38;
  if (totalLen <= 12) return 28;
  if (totalLen <= 25) return 20;
  return 14;
}

function _konaSplitGroups(text, rng) {
  // 文字種境界で分割（全クライアント決定論的・Intl.Segmenterは結果がブラウザ依存でrngデシンクの原因になるため使わない）
  let words = [];
  let cur = '', curType = null;
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    const t = (cp >= 0x4E00 && cp <= 0x9FFF) ? 'k'
            : (cp >= 0x3040 && cp <= 0x309F) ? 'h'
            : (cp >= 0x30A0 && cp <= 0x30FF) ? 'ka' : 'o';
    if (curType !== null && curType !== t) { words.push(cur); cur = ''; }
    cur += ch; curType = t;
  }
  if (cur) words.push(cur);
  if (!words.length) words = [text];
  if (words.length <= 1) return words;

  const r = rng();
  if (r < 0.05) return [...text];  // 5%: 一文字ずつバラバラ
  if (r < 0.25) return words;     // 20%: 単語単位でバラバラ
  if (r < 0.48) {
    // 23%: 2単語ずつ結合
    const groups = [];
    for (let i = 0; i < words.length; i += 2) {
      groups.push(words.slice(i, i + 2).join(''));
    }
    return groups;
  }
  return [text];  // 52%: 全体1塊
}

function konaDropText(msg, seed, senderColor) {
  if (!_isKonaRoom() || !_konaContainer) return;
  const text = msg.replace(/\s+/g, ' ').trim().slice(0, 40);
  if (!text) return;

  const effectiveSeed = seed != null ? seed : Date.now();
  const rng = _konaMakeRng(effectiveSeed);
  const fontFamily = titleFontFamily[Math.floor(rng() * titleFontFamily.length)];
  const groups = _konaSplitGroups(text, rng);

  // 巨大テキスト判定（日本時間0:00台 or 1/125確率）
  const giantRoll = rng();
  const d = new Date(effectiveSeed);
  const jstHour = (d.getUTCHours() + 9) % 24;
  const isMidnightMinute = jstHour === 0 && d.getUTCMinutes() === 0;
  const isGiant = isMidnightMinute || giantRoll < 1 / 125;

  const baseFontSize = _konaFontSize(text.length);
  const density = _konaKanjiDensity(text);
  const baseFallPxPerTick = (80 + density * 140) / 60;

  for (const grp of groups) {
    if (!grp) continue;

    // フォントスタイル（イタリック8%・ボールド7%・両方2%、低確率）
    const styleRoll = rng();
    let fontStyle = 'normal', fontWeight = 'normal';
    if (styleRoll < 0.08) fontStyle = 'italic';
    else if (styleRoll < 0.15) fontWeight = 'bold';
    else if (styleRoll < 0.17) { fontStyle = 'italic'; fontWeight = 'bold'; }

    // フォントサイズ（巨大 or 1文字大きめ）
    const sizeRoll = rng();
    let grpFontSize;
    if (isGiant) {
      grpFontSize = 280 + Math.floor(sizeRoll * 120);
    } else if (grp.length === 1) {
      if (sizeRoll < 0.08) grpFontSize = Math.round(baseFontSize * 2.5);
      else if (sizeRoll < 0.22) grpFontSize = Math.round(baseFontSize * 1.7);
      else grpFontSize = baseFontSize;
    } else {
      grpFontSize = baseFontSize;
    }

    const color = _konaTextColor(grp, text.length, senderColor);
    const pixi = new PIXI.Text(grp, { fontFamily, fontStyle, fontWeight, fontSize: grpFontSize, fill: color, align: 'center' });
    pixi.anchor.set(0.5, 1);
    const spawnX = isGiant ? 100 + rng() * 460 : 40 + rng() * 580;
    const spawnY = -grpFontSize - rng() * 100;
    pixi.position.set(spawnX, spawnY);
    pixi.zIndex = 200;
    _konaContainer.addChild(pixi);
    const vx0 = (rng() - 0.5) * 0.4;
    const vy0 = baseFallPxPerTick * (0.6 + rng() * 0.8);
    const grpDensity = _konaKanjiDensity(grp);
    const hardnessRoll = rng();
    const hardness = room.name === "粉の部屋" ? 0 : (2 + Math.floor(grpDensity * 4) + Math.floor(hardnessRoll * 2));
    const block = {
      pixi, color, grp, fontSize: grpFontSize, fontFamily, fontStyle, fontWeight,
      msg, konaSeed: seed,
      x: spawnX, y: spawnY, initY: spawnY, initVy: vy0,
      vx: vx0, vy: vy0,
      rot: (rng() - 0.5) * 0.3,
      rotV: (rng() - 0.5) * 0.04,
      burstSeed: (rng() * 0xFFFFFF) >>> 0,
      hardness,
      landed: false, crumbled: false, burstDone: false,
      fontReady: false,
    };
    _konaTextBlocks.push(block);
    // フォントロード後に寸法を確定（これが割れ方の決定論的同期に必要）
    document.fonts.load(`1px "${fontFamily}"`).then(() => {
      if (block.crumbled || !block.pixi) return;
      block.pixi.updateText(false);
      block.textW = Math.ceil(block.pixi.width);
      block.textH = Math.ceil(block.pixi.height);
      block.fontReady = true;
    });
  }
}

function _konaSpawnBurst(block, count, rng) {
  const grpLen = block.grp.length;
  const textW = block.fontSize * Math.max(grpLen, 1) * 0.6;
  for (let i = 0; i < count; i++) {
    // rng消費を先に行いRNG状態を全クライアントで一致させる
    const r = 0.5 + rng() * 1.5;
    const angle = rng() * Math.PI * 2;
    const speed = (20 + rng() * 70) / 60;
    const xOff = (rng() - 0.5) * textW;
    const yOff = rng() * block.fontSize;
    if (_konaParticles.length >= KONA_MAX_PARTICLES) {
      const idx = _konaParticles.findIndex(p => p.settled);
      if (idx >= 0) { _konaParticles[idx].pixi.destroy(); _konaParticles.splice(idx, 1); }
      else continue;
    }
    const color = _konaCharColor(block.grp[i % grpLen]);
    const pixi = new PIXI.Graphics();
    pixi.beginFill(color, 0.92);
    pixi.drawCircle(0, 0, r);
    pixi.endFill();
    pixi.zIndex = 190;
    _konaContainer.addChild(pixi);
    _konaParticles.push({
      pixi, color, r,
      x: block.x + xOff,
      y: block.y - yOff,
      vx: Math.cos(angle) * speed,
      vy: -Math.abs(Math.sin(angle) * speed) - 0.8,
      settled: false,
    });
  }
}

function _konaAvatarKickParticles() {
  if (!avaP[myToken]) return;
  const ax = avaP[myToken].container.x;
  const ay = avaP[myToken].container.y;
  const dvx = ax - _konaPrevAX;
  const dvy = ay - _konaPrevAY;
  const speed = Math.sqrt(dvx * dvx + dvy * dvy);
  if (speed < 0.3) return;
  if (speed > 150) { _konaPrevAX = ax; _konaPrevAY = ay; _konaNoKickUntil = Date.now() + 200; return; }
  if (Date.now() < _konaNoKickUntil) { _konaPrevAX = ax; _konaPrevAY = ay; return; }

  _konaApplyKickExternal(ax, ay, dvx, dvy, speed);

  const now = performance.now();
  if (now - _konaLastKickEmit > 80) {
    _konaLastKickEmit = now;
    socket.emit("konaKick", { ax, ay, dvx, dvy });
  }
}

function _konaApplyKickExternal(ax, ay, dvx, dvy, speed) {
  if (speed == null) speed = Math.sqrt(dvx * dvx + dvy * dvy);
  if (speed < 0.3) return;
  const influence = Math.min(speed * 15, 480) / 60;
  const radius = 270 + speed * 24;
  const dirX = dvx / speed;
  const dirY = dvy / speed;
  for (const p of _konaParticles) {
    if (!p.settled) continue;
    const dx = p.x - ax;
    const dy = p.y - ay;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius || dist < 0.01) continue;
    const factor = (1 - dist / radius) * influence;
    const scatter = ((p.color >>> 8) % 100 / 50 - 1.0) * factor * 0.4;
    p.vx = dirX * factor * 1.8 + scatter;
    p.vy = -Math.abs(factor) * 1.5 + dirY * factor * 0.4;
    p.settled = false;
    p.kickCount = (p.kickCount || 0) + 1;
  }
}

function _konaGetColliders() {
  const rects = [];
  for (const token of roomMemberToken) {
    const ava = avaP[token];
    if (!ava || !ava.container.parent) continue;
    const ax = ava.container.x;
    const ay = ava.container.y;
    const hw = (ava.avaS ? ava.avaS.width : 60) / 2;
    const h = ava.avaS ? ava.avaS.height : 80;
    rects.push({ left: ax - hw, right: ax + hw, top: ay - h, bottom: ay });
    if (ava.msg && ava.msg.text && ava.msg.alpha > 0) {
      try {
        const b = ava.msg.getBounds();
        if (b.width > 4 && b.height > 4) {
          rects.push({ left: b.x, right: b.x + b.width, top: b.y, bottom: b.y + b.height });
        }
      } catch (_e) {}
    }
  }
  return rects;
}

// num個の不均等カット位置を返す（rng消費: num回）
function _konaIrregularCuts(num, size, rng) {
  if (num <= 1) return [0, size];
  const biasRoll = rng();
  const cuts = [];
  for (let i = 1; i < num; i++) {
    let pos;
    if (i === 1 && biasRoll < 0.22) {
      pos = (0.06 + rng() * 0.18) * size; // 端欠け（6〜24%）
    } else if (i === num - 1 && biasRoll > 0.78) {
      pos = (0.76 + rng() * 0.18) * size; // 反対側端欠け（76〜94%）
    } else {
      pos = (0.15 + rng() * 0.70) * size; // 通常範囲
    }
    cuts.push(pos);
  }
  cuts.sort((a, b) => a - b);
  return [0, ...cuts, size];
}

function _konaDiagonalCut(b, rng, rt, ox, oy, textW, textH, blastMultiplier, tx, bx) {
  // 斜めカット線: テクスチャ空間で (tx, 0) → (bx, textH)（tx/bx は呼び出し元が計算・保存済み）
  const pieces = [
    [[0, 0], [tx, 0], [bx, textH], [0, textH]],
    [[tx, 0], [textW, 0], [textW, textH], [bx, textH]],
  ];
  for (let pi = 0; pi < pieces.length; pi++) {
    const verts = pieces[pi];
    const cx = verts.reduce((s, v) => s + v[0], 0) / verts.length;
    const cy = verts.reduce((s, v) => s + v[1], 0) / verts.length;
    const lv = verts.map(([x, y]) => [x - cx, y - cy]);
    const wx = ox + cx, wy = oy + cy;
    rng(); rng(); rng(); rng(); rng(); rng(); rng(); rng();
    const speed = (2 + rng() * 4) * blastMultiplier;
    const vxJ = rng() - 0.5;
    const vyJ = rng() * 2.5;
    const rotV = (rng() - 0.5) * 0.04;
    const dCX = cx / textW - 0.5, dCY = cy / textH - 0.5;
    const dist = Math.sqrt(dCX * dCX + dCY * dCY) || 1;
    const matrix = new PIXI.Matrix().translate(cx, cy);
    const gfx = new PIXI.Graphics();
    gfx.beginTextureFill({ texture: rt, matrix });
    gfx.moveTo(lv[0][0], lv[0][1]);
    for (let i = 1; i < lv.length; i++) gfx.lineTo(lv[i][0], lv[i][1]);
    gfx.closePath(); gfx.endFill();
    gfx.position.set(wx, wy); gfx.zIndex = 200;
    _konaContainer.addChild(gfx);
    const maxR = Math.max(...lv.map(v => Math.hypot(v[0], v[1])));
    _konaParticles.push({
      pixi: gfx, color: b.color, r: maxR,
      x: wx, y: wy,
      vx: (dCX / dist) * speed * 1.2 + vxJ,
      vy: (dCY / dist) * speed * 0.8 - 2 - vyJ,
      settled: false, rot: 0, rotV,
      isTextureShard: true, isDiagonalShard: true,
      renderTexture: rt, diagLocalPoly: lv, diagCx: cx, diagCy: cy, pieceIdx: pi,
      texRegion: {
        x: Math.min(...verts.map(v => v[0])), y: Math.min(...verts.map(v => v[1])),
        w: Math.max(...verts.map(v => v[0])) - Math.min(...verts.map(v => v[0])),
        h: Math.max(...verts.map(v => v[1])) - Math.min(...verts.map(v => v[1])),
      },
      fractureLevel: 0, kickCount: 0, hardness: b.hardness || 1,
      burstSeed: b.burstSeed,
      blockInfo: { grp: b.grp, fontFamily: b.fontFamily, fontStyle: b.fontStyle || 'normal', fontWeight: b.fontWeight || 'normal', fontSize: b.fontSize, color: b.color, textW: Math.ceil(textW), textH: Math.ceil(textH) },
    });
  }
}

function _konaShatterBlock(b, rng) {
  if (!b.pixi || !_konaContainer) return;

  const textW = b.textW || b.pixi.width || b.fontSize;
  const textH = b.textH || b.pixi.height || b.fontSize * 1.2;

  // テキストをRenderTextureに焼き付け（anchor/rotation/positionを一時リセット）
  const rt = PIXI.RenderTexture.create({ width: Math.ceil(textW), height: Math.ceil(textH) });
  if (b.pixi.parent) b.pixi.parent.removeChild(b.pixi);
  b.pixi.anchor.set(0, 0);
  b.pixi.position.set(0, 0);
  b.pixi.rotation = 0;
  if (b.pixi.width > 0 && b.pixi.height > 0) b.pixi.scale.set(rt.width / b.pixi.width, rt.height / b.pixi.height);
  app.renderer.render(b.pixi, { renderTexture: rt });
  b.pixi.destroy();
  b.crumbled = true;
  _konaRenderTextures.push(rt);
  // フォント未ロード時の保険：ロード完了後にRTを再描画（destroy済みのb.pixiは使えないので新規作成）
  {
    const _grp = b.grp, _ff = b.fontFamily, _fs = b.fontStyle || 'normal', _fw = b.fontWeight || 'normal', _fz = b.fontSize, _fc = b.color;
    document.fonts.load(`1px "${_ff}"`).then(() => {
      if (!rt || rt.destroyed) return;
      const tmp = new PIXI.Text(_grp, { fontFamily: _ff, fontStyle: _fs, fontWeight: _fw, fontSize: _fz, fill: _fc, align: 'center' });
      tmp.anchor.set(0, 0); tmp.position.set(0, 0);
      if (tmp.width > 0 && tmp.height > 0) tmp.scale.set(rt.width / tmp.width, rt.height / tmp.height);
      app.renderer.render(tmp, { renderTexture: rt, clear: true });
      tmp.destroy();
    });
  }

  // テキスト左上のワールド座標（破片のtexture座標系の原点）
  const ox = b.x - textW / 2;
  const oy = b.y - textH;

  // 衝撃強度（決定論的・全クライアント共通）
  const GRAVITY_TICK = 9.8 / 60;
  const dy = Math.max(0, KONA_GROUND_Y - (b.initY != null ? b.initY : -b.fontSize));
  const impactVy = Math.sqrt(((b.initVy || 2) ** 2) + 2 * GRAVITY_TICK * dy);
  const impactSpeed = Math.sqrt(impactVy * impactVy + (b.vx || 0) * (b.vx || 0));
  const blastMultiplier = 1 + Math.min(impactSpeed / 6, 2);

  // 斜め割れ判定（25%の確率）
  const diagRoll = rng();
  if (diagRoll < 0.25) {
    const tx = (0.25 + rng() * 0.5) * textW;
    const slant = (rng() - 0.5) * textW * 0.8;
    const bx = Math.max(4, Math.min(textW - 4, tx + slant));
    _konaBreakData.set(b.burstSeed, { t: 'd', tw: Math.ceil(textW), th: Math.ceil(textH), ox, oy, bm: blastMultiplier, tx, bx, bi: { grp: b.grp, fontFamily: b.fontFamily, fontStyle: b.fontStyle || 'normal', fontWeight: b.fontWeight || 'normal', fontSize: b.fontSize, color: b.color } });
    _konaDiagonalCut(b, rng, rt, ox, oy, textW, textH, blastMultiplier, tx, bx);
    return;
  }

  // 割れ方の方向と分割数（orientRoll消費後に決定）
  const orientRoll = rng();

  let cols, rows;
  if (impactSpeed > 9) {
    if (orientRoll < 0.25)      { cols = 2; rows = 4; }
    else if (orientRoll < 0.55) { cols = Math.min(b.grp.length + 2, 5); rows = 2; }
    else                        { cols = Math.min(b.grp.length + 1, 4); rows = 3; }
  } else if (impactSpeed > 6) {
    if (orientRoll < 0.30)      { cols = 2; rows = 3; }
    else if (orientRoll < 0.60) { cols = Math.min(b.grp.length + 1, 4); rows = 2; }
    else                        { cols = 3; rows = 3; }
  } else if (impactSpeed > 4) {
    if (orientRoll < 0.40)      { cols = 2; rows = 3; }
    else                        { cols = b.grp.length >= 3 ? 3 : 2; rows = 2; }
  } else {
    cols = 2; rows = 2;
  }

  // 不均等カット（端欠け・非対称を自然発生させる）
  const colXs = _konaIrregularCuts(cols, textW, rng);
  const rowYs = _konaIrregularCuts(rows, textH, rng);
  _konaBreakData.set(b.burstSeed, { t: 'r', tw: Math.ceil(textW), th: Math.ceil(textH), ox, oy, bm: blastMultiplier, cols, rows, cx: colXs, ry: rowYs, bi: { grp: b.grp, fontFamily: b.fontFamily, fontStyle: b.fontStyle || 'normal', fontWeight: b.fontWeight || 'normal', fontSize: b.fontSize, color: b.color } });

  for (let row = 0; row < rows; row++) {
    const v0 = rowYs[row], v1 = rowYs[row + 1];
    const vh = v1 - v0;
    for (let col = 0; col < cols; col++) {
      const u0 = colXs[col], u1 = colXs[col + 1];
      const uw = u1 - u0;
      const pieceIdx = row * cols + col;
      // RNG消費順を維持（速度の決定論的同期を保つためj0-j7相当の8回消費）
      rng(); rng(); rng(); rng(); rng(); rng(); rng(); rng();
      const speed = (2 + rng() * 4) * blastMultiplier;
      const vxJ = rng() - 0.5;
      const vyJ = rng() * 2.5;
      const rotV = (rng() - 0.5) * 0.04;

      const scx = ox + u0 + uw / 2;
      const scy = oy + v0 + vh / 2;

      const shardTex = new PIXI.Texture(rt.baseTexture, new PIXI.Rectangle(u0, v0, uw, vh));
      const gfx = new PIXI.Sprite(shardTex);
      gfx.anchor.set(0.5, 0.5);
      gfx.alpha = 0.95;
      gfx.position.set(scx, scy);
      gfx.zIndex = 200;
      _konaContainer.addChild(gfx);

      // 爆散方向：テキスト中心からこの破片中心への方向
      const dCX = (u0 + uw / 2) / textW - 0.5;
      const dCY = (v0 + vh / 2) / textH - 0.5;
      const dist = Math.sqrt(dCX * dCX + dCY * dCY) || 1;

      _konaParticles.push({
        pixi: gfx, color: b.color,
        r: Math.max(uw, vh) / 2,
        x: scx, y: scy,
        vx: (dCX / dist) * speed * 1.2 + vxJ,
        vy: (dCY / dist) * speed * 0.8 - 2 - vyJ,
        settled: false, rot: 0, rotV,
        isTextureShard: true,
        renderTexture: rt,
        texRegion: { x: u0, y: v0, w: uw, h: vh },
        fractureLevel: 0,
        kickCount: 0,
        hardness: b.hardness || 1,
        burstSeed: b.burstSeed,
        pieceIdx,
        blockInfo: { grp: b.grp, fontFamily: b.fontFamily, fontStyle: b.fontStyle || 'normal', fontWeight: b.fontWeight || 'normal', fontSize: b.fontSize, color: b.color, textW: Math.ceil(textW), textH: Math.ceil(textH) },
      });
    }
  }
}

// level0（テクスチャ破片）→ level1（色付きポリゴン4分割）
function _konaFractureLevel0(p, rng) {
  const hw = p.texRegion.w / 2, hh = p.texRegion.h / 2;
  for (let r2 = 0; r2 < 2; r2++) {
    for (let c2 = 0; c2 < 2; c2++) {
      const sx = p.x + (c2 - 0.5) * hw;
      const sy = p.y + (r2 - 0.5) * hh;
      rng(); rng(); // jx/jy RNG消費（順序維持）
      let gfx;
      if (p.renderTexture && !p.renderTexture.destroyed) {
        const _sx = p.texRegion.x + c2 * hw, _sy = p.texRegion.y + r2 * hh;
        const _sw = Math.min(hw, p.renderTexture.width - _sx), _sh = Math.min(hh, p.renderTexture.height - _sy);
        gfx = new PIXI.Sprite(new PIXI.Texture(p.renderTexture.baseTexture, new PIXI.Rectangle(_sx, _sy, _sw, _sh)));
        gfx.anchor.set(0.5, 0.5);
        gfx.alpha = 0.88;
      } else {
        gfx = new PIXI.Graphics();
        gfx.beginFill(p.color, 0.88);
        gfx.drawRect(-hw/2, -hh/2, hw, hh);
        gfx.endFill();
      }
      gfx.position.set(sx, sy);
      gfx.zIndex = 200;
      _konaContainer.addChild(gfx);
      const speed = 1 + rng() * 3;
      const dX = c2 - 0.5, dY = r2 - 0.5;
      const dd = Math.sqrt(dX*dX + dY*dY) || 1;
      _konaParticles.push({
        pixi: gfx, color: p.color,
        r: Math.max(hw, hh) / 2,
        x: sx, y: sy,
        vx: p.vx * 0.3 + (dX/dd) * speed,
        vy: p.vy * 0.3 + (dY/dd) * speed * 0.5 - 1.5,
        settled: false, rot: p.rot || 0, rotV: (rng() - 0.5) * 0.08,
        fractureLevel: 1,
        kickCount: 0,
        hardness: 1,
        blockInfo: p.blockInfo || null,
        burstSeed: p.burstSeed != null ? p.burstSeed : null,
        pieceIdx: (p.pieceIdx != null ? p.pieceIdx * 4 : 0) + (r2 * 2 + c2),
        texRegion: p.texRegion ? { x: p.texRegion.x + c2 * hw, y: p.texRegion.y + r2 * hh, w: hw, h: hh } : null,
      });
    }
  }
}

// level1（色付きポリゴン）→ 粉パーティクル
function _konaFractureLevel1(p, rng) {
  const count = 6 + Math.floor(rng() * 7);
  const sw = p.texRegion ? p.texRegion.w : p.r * 2;
  const sh = p.texRegion ? p.texRegion.h : p.r * 2;
  for (let i = 0; i < count; i++) {
    const r = 0.5 + rng() * 1.5;
    const angle = rng() * Math.PI * 2;
    const speed = (10 + rng() * 40) / 60;
    if (_konaParticles.length >= KONA_MAX_PARTICLES) continue;
    const pixi = new PIXI.Graphics();
    pixi.beginFill(p.color, 0.9); pixi.drawCircle(0, 0, r); pixi.endFill();
    pixi.zIndex = 190;
    _konaContainer.addChild(pixi);
    _konaParticles.push({
      pixi, color: p.color, r,
      x: p.x + (rng() - 0.5) * sw,
      y: p.y + (rng() - 0.5) * sh,
      vx: Math.cos(angle) * speed,
      vy: -Math.abs(Math.sin(angle) * speed) - 0.5,
      settled: false,
    });
  }
}

function _konaGetOekakiSegments() {
  const segs = [];
  if (!room || !room.drawHistory) return segs;
  for (const line of room.drawHistory) {
    if (line.type !== "line" || !line.pointer || line.pointer.length < 2) continue;
    for (let i = 0; i < line.pointer.length - 1; i++) {
      const p1 = line.pointer[i], p2 = line.pointer[i + 1];
      segs.push([p1.x, p1.y, p2.x, p2.y]);
    }
  }
  return segs;
}

function _konaOekakiSegCollide(px, py, pr, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return null;
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx, cy = y1 + t * dy;
  const ex = px - cx, ey = py - cy;
  const dist = Math.sqrt(ex * ex + ey * ey);
  if (dist >= pr) return null;
  const pen = pr - dist;
  if (dist < 0.001) return { nx: 0, ny: -1, pen };
  return { nx: ex / dist, ny: ey / dist, pen };
}

function _konaTick(delta) {
  if (!_isKonaRoom()) return;
  const d = delta || 1;
  const GRAVITY = 9.8 / 60 / 60;
  const DAMPING = 0.93;
  const _konaIsHost = _konaIsCurrentHost();
  const _avaMoving = _konaIsHost || !!keyMoveTickerFn || !!(avaP[myToken] && (avaP[myToken].isMoving || avaP[myToken].dropVelocity > 1));

  for (let i = _konaTextBlocks.length - 1; i >= 0; i--) {
    const b = _konaTextBlocks[i];
    if (b.crumbled) { _konaTextBlocks.splice(i, 1); continue; }

    if (!b.landed) {
      b.vy += GRAVITY * 60 * d;
      b.x += b.vx * d;
      b.y += b.vy * d;
      b.rot += b.rotV * d;
      if (b.y >= KONA_GROUND_Y) {
        b.y = KONA_GROUND_Y;
        b.landed = true;
        b.landedAt = Date.now();
        b.vy = 0;
        b.vx *= 0.5;
        b.rotV *= 0.3;
      }
      b.pixi.position.set(b.x, b.y);
      b.pixi.rotation = b.rot;
    } else {
      if (!b.burstDone) {
        // pendingShatterは旧ホスト計算済みデータ（diagLocalPoly含む）。fontReady・ホスト状態に関わらず優先使用
        if (b.pendingShatter) {
          b.burstDone = true;
          if (b.pixi) { b.pixi.destroy(); b.pixi = null; }
          b.crumbled = true;
          _konaApplyShatterData(b.burstSeed, b.pendingShatter);
          // konaSyncFullがdiagLocalPolyを含む全シャードを届けるので再送は不要
          if (_konaIsHost && roomMemberToken.length >= 2) _konaScheduleSync();
          continue;
        }
        if (!_konaIsHost && roomMemberToken.length >= 2) {
          // 非ホストはローカルで砕かない（形のずれ防止）。konaShatter/konaSyncFull待ち。
          // 50ms経過でhostにkonaSyncFull送信を要求（1回のみ）
          if (b.landedAt && Date.now() - b.landedAt > 50 && !b._syncRequested) {
            b._syncRequested = true;
            socket.emit("konaResyncFull");
          }
          // 100ms経過してもkonaShatterが届かない場合はローカルで強制破裂（fontReady不問）
          if (b.landedAt && Date.now() - b.landedAt > 100) {
            b.burstDone = true;
            const rng = _konaMakeRng(b.burstSeed);
            _konaShatterBlock(b, rng);
            _konaLocallyShatteredSeeds.add(b.burstSeed);
            b.crumbled = true;
          }
          continue;
        }
        if (b.fontReady === false) continue;
        const prevLen = _konaParticles.length;
        b.burstDone = true;
        const rng = _konaMakeRng(b.burstSeed);
        _konaShatterBlock(b, rng);
        if (_konaIsHost && roomMemberToken.length >= 2) {
          _konaEmitShatter(b.burstSeed, prevLen);
          _konaScheduleSync();
        }
      }
    }
  }

  const colliders = _konaGetColliders();
  const oekakiSegs = _konaGetOekakiSegments();
  for (let i = _konaParticles.length - 1; i >= 0; i--) {
    const p = _konaParticles[i];

    if (!p.settled) {
      p.vy += GRAVITY * 60 * 0.6 * d;
      p.vx *= Math.pow(DAMPING, d);
      p.x += p.vx * d;
      p.y += p.vy * d;
    }

    // 床判定
    let onFloor = false;
    if (p.y >= KONA_GROUND_Y - p.r) {
      p.y = KONA_GROUND_Y - p.r;
      if (!p.settled) {
        const canFracture = (p.kickCount || 0) >= (p.hardness || 1) &&
          ((p.fractureLevel === 0 && p.isTextureShard) || p.fractureLevel === 1);
        if (canFracture && _konaIsHost) {
          _konaFractureQueue.push(p);
        } else {
          p.vy *= -0.12;
          p.vx *= 0.65;
          if (Math.abs(p.vy) < 0.3 && Math.abs(p.vx) < 0.3) {
            p.settled = true; p.vx = 0; p.vy = 0;
          }
        }
      }
      onFloor = true;
    }

    // アバター・吹き出し衝突判定（p.y+p.r>=rect.top: 底辺がコライダー頂上に達したら検出）
    let onCollider = false;
    if (!onFloor) {
      for (const rect of colliders) {
        // settled時はスプライト高変動による誤unsettle防止のため p.r 分の許容バッファを追加
        const tol = p.settled ? p.r : 0;
        if (p.x > rect.left && p.x < rect.right && p.y + p.r + tol >= rect.top && p.y < rect.bottom + tol) {
          if (!p.settled) {
            p.y = rect.top - p.r;
            p.vy *= -0.08;
            p.vx *= 0.5;
            if (Math.abs(p.vy) < 0.3 && Math.abs(p.vx) < 0.5) {
              p.settled = true; p.vx = 0; p.vy = 0;
            }
          }
          onCollider = true;
          break;
        }
      }
    }

    // 落書き衝突判定（落下中のみ）
    if (!onFloor && !onCollider && !p.settled && oekakiSegs.length > 0) {
      for (const seg of oekakiSegs) {
        const hit = _konaOekakiSegCollide(p.x, p.y, p.r, seg[0], seg[1], seg[2], seg[3]);
        if (hit) {
          p.x += hit.nx * hit.pen;
          p.y += hit.ny * hit.pen;
          const dot = p.vx * hit.nx + p.vy * hit.ny;
          if (dot < 0) {
            p.vx = (p.vx - 2 * dot * hit.nx) * 0.4;
            p.vy = (p.vy - 2 * dot * hit.ny) * 0.4;
          }
          break;
        }
      }
    }

    // コライダーが動いてパーティクルの下から消えたら落下再開
    if (p.settled && !onFloor && !onCollider && _avaMoving) {
      p.settled = false;
    }

    if (p.x < -10 || p.x > 670 || p.y > 490) {
      p.pixi.destroy(); _konaParticles.splice(i, 1); continue;
    }
    p.pixi.position.set(p.x, p.y);
    if (p.rotV) { p.rot = (p.rot || 0) + p.rotV * d; p.pixi.rotation = p.rot; }
  }

  // 地面激突フラクチャ処理（ループ外で実行してparticle配列の整合性を保つ）
  if (_konaFractureQueue.length > 0) {
    for (const p of _konaFractureQueue.splice(0)) {
      const pidx = _konaParticles.indexOf(p);
      if (pidx < 0) continue;
      const rng = _konaMakeRng((p.color ^ ((p.kickCount || 0) * 7919)) >>> 0);
      if (p.fractureLevel === 0 && p.isTextureShard) {
        const prevLenFrac = _konaParticles.length;
        _konaFractureLevel0(p, rng);
        if (_konaIsHost && roomMemberToken.length >= 2) {
          const fl1shards = _konaParticles.slice(prevLenFrac).map(s => {
            const tr = s.texRegion || {};
            return { x: s.x, y: s.y, vx: s.vx || 0, vy: s.vy || 0,
              rot: s.rot || 0, rotV: s.rotV || 0,
              color: s.color, fractureLevel: 1, hardness: s.hardness || 1, kickCount: 0,
              w: tr.w || 0, h: tr.h || 0, texX: tr.x || 0, texY: tr.y || 0,
              burstSeed: s.burstSeed, pieceIdx: s.pieceIdx, blockInfo: s.blockInfo };
          });
          if (fl1shards.length) socket.emit("konaFracture", { parentSeed: p.burstSeed, parentIdx: p.pieceIdx, shards: fl1shards });
        }
      } else {
        _konaFractureLevel1(p, rng);
      }
      p.pixi.destroy();
      _konaParticles.splice(pidx, 1);
    }
    if (_konaIsHost && roomMemberToken.length >= 2) _konaScheduleSync();
  }

  _konaAvatarKickParticles();
  if (avaP[myToken]) {
    _konaPrevAX = avaP[myToken].container.x;
    _konaPrevAY = avaP[myToken].container.y;
  }
}

function _konaStartPeriodicSync() {
  if (_konaPeriodicSyncInterval) return;
  _konaPeriodicSyncInterval = setInterval(() => {
    if (!_isKonaRoom()) return;
    if (document.hidden || !_konaIsCurrentHost()) return;
    const dust = _konaParticles.filter(p => p.settled && p.fractureLevel == null);
    const shards = _konaParticles.filter(p => p.fractureLevel != null);
    if (!dust.length && !shards.length) return;
    const _rotVStr = shards.slice(0,3).map(s=>s.rotV?.toFixed(4)).join(',');
    const bi = {};
    for (const s of shards) {
      if (s.burstSeed != null && s.blockInfo && !bi[s.burstSeed]) bi[s.burstSeed] = s.blockInfo;
    }
    // FL:0シャードのburstSeedに対応するbreak dataのみ送る（差分修正用）
    const bds = {};
    for (const s of shards) {
      if (s.fractureLevel === 0 && s.burstSeed != null && _konaBreakData.has(s.burstSeed)) {
        bds[s.burstSeed] = _konaBreakData.get(s.burstSeed);
      }
    }
    socket.emit("konaPosSync", {
      d: dust.map(p => [Math.round(p.x), Math.round(p.y), Math.round(p.r * 4), p.color]),
      s: shards.map(p => {
        const tr = p.texRegion || {};
        const stexX = p.isDiagonalShard ? Math.round(p.diagCx || 0) : Math.round(tr.x || 0);
        const stexY = p.isDiagonalShard ? Math.round(p.diagCy || 0) : Math.round(tr.y || 0);
        const sw = p.isDiagonalShard ? Math.round(p.blockInfo?.textW || tr.w || 0) : Math.round(tr.w || 0);
        const sh = p.isDiagonalShard ? Math.round(p.blockInfo?.textH || tr.h || 0) : Math.round(tr.h || 0);
        return [Math.round(p.x), Math.round(p.y), +((p.rot || 0).toFixed(3)),
          p.fractureLevel, sw, sh, stexX, stexY,
          p.color, p.burstSeed != null ? p.burstSeed : -1,
          p.kickCount || 0, p.hardness || 1, +((p.rotV || 0).toFixed(4)),
          p.settled ? 1 : 0, +((p.vx || 0).toFixed(3)), +((p.vy || 0).toFixed(3)),
          p.pieceIdx != null ? p.pieceIdx : -1];
      }),
      bi,
      bds: Object.keys(bds).length ? bds : undefined,
    });
  }, 200);
}

function _konaStopPeriodicSync() {
  if (!_konaPeriodicSyncInterval) return;
  clearInterval(_konaPeriodicSyncInterval);
  _konaPeriodicSyncInterval = null;
}

let _konaScheduleSyncTimer = null;
let _konaScheduleSyncFirstAt = 0;
function _konaScheduleSync() {
  const now = Date.now();
  if (!_konaScheduleSyncTimer) _konaScheduleSyncFirstAt = now;
  clearTimeout(_konaScheduleSyncTimer);
  const remaining = Math.max(0, 300 - (now - _konaScheduleSyncFirstAt));
  const delay = Math.min(120, remaining);
  _konaScheduleSyncTimer = setTimeout(() => {
    _konaScheduleSyncTimer = null; _konaScheduleSyncFirstAt = 0;
    _konaSendFullSync();
  }, delay);
}

function _konaIsCurrentHost() {
  if (_konaCurrentHostToken) return _konaCurrentHostToken === myToken;
  // 入室直後500ms以内は暗黙ホスト不可（konaHostClaim到着前にwrong shardを生成しないため）
  if (_konaLastHostChangeAt && Date.now() - _konaLastHostChangeAt < 500) return false;
  return roomMemberToken.length < 2 || [...roomMemberToken].sort()[0] === myToken;
}

function _konaEmitAvaStop() {
  if (!_isKonaRoom()) return;
  clearTimeout(_konaAvaStopTimer);
  _konaAvaStopTimer = setTimeout(() => {
    if (_konaIsCurrentHost()) return; // 既にホストなら不要なホスト交代を起こさない
    if (Date.now() - _konaLastHostChangeAt < 300) return; // ホスト交代直後は要求しない（連鎖防止）
    _konaCurrentHostToken = myToken;
    if (roomMemberToken.length < 2) return;
    socket.emit("konaHostClaim");
    // 旧ホストからの in-flight konaSyncFull を200ms間受け入れてから自分のstateをbroadcast
    _konaAcceptSyncUntil = Date.now() + 200;
    clearTimeout(_konaHostClaimSyncTimer);
    _konaHostClaimSyncTimer = setTimeout(_konaSendFullSync, 200);
  }, 150);
}

function _konaEmitShatter(burstSeed, prevLen) {
  if (roomMemberToken.length < 2) return;
  const shards = _konaParticles.slice(prevLen).filter(p => p.fractureLevel != null).map(p => {
    const tr = p.texRegion || {};
    const s = { x: p.x, y: p.y, rot: p.rot || 0, vx: p.vx || 0, vy: p.vy || 0, rotV: p.rotV || 0,
      color: p.color, fractureLevel: p.fractureLevel, hardness: p.hardness,
      w: tr.w || 0,
      h: tr.h || 0,
      texX: tr.x || 0,
      texY: tr.y || 0,
      pieceIdx: p.pieceIdx != null ? p.pieceIdx : null, blockInfo: p.blockInfo };
    if (p.isDiagonalShard) { s.diagLocalPoly = p.diagLocalPoly; s.diagCx = p.diagCx; s.diagCy = p.diagCy; }
    return s;
  });
  if (!shards.length) return;
  const bp = _konaBreakData.get(burstSeed);
  socket.emit("konaShatter", { burstSeed, shards, bp: bp || null });
}

function _konaApplyShatterData(burstSeed, shardsData) {
  if (!_konaContainer) return;
  for (const s of shardsData) {
    if (_konaParticles.length >= KONA_MAX_PARTICLES) break;
    const hw = s.w / 2, hh = s.h / 2;
    let gfx, shardRt = null;
    if (s.blockInfo && s.blockInfo.textW && s.blockInfo.textH) {
      const bi = s.blockInfo;
      // 寸法が違うキャッシュは破棄（フォールバックなどで誤寸法RTが入った場合の修正）
      const _staleRt = _konaSyncRtCache.get(burstSeed);
      if (_staleRt && !_staleRt.destroyed && (_staleRt.width !== bi.textW || _staleRt.height !== bi.textH)) {
        _staleRt.destroy(true);
        const _si = _konaRenderTextures.indexOf(_staleRt);
        if (_si >= 0) _konaRenderTextures.splice(_si, 1);
        _konaSyncRtCache.delete(burstSeed);
      }
      if (!_konaSyncRtCache.has(burstSeed)) {
        const rt = PIXI.RenderTexture.create({ width: bi.textW, height: bi.textH });
        _konaRenderTextures.push(rt);
        _konaSyncRtCache.set(burstSeed, rt);
        // フォントロード後に描画（ロード済みなら即resolveで事実上同フレーム）
        document.fonts.load(`1px "${bi.fontFamily}"`).then(() => {
          if (!_isKonaRoom() || rt.destroyed) return;
          const t2 = new PIXI.Text(bi.grp, { fontFamily: bi.fontFamily, fontStyle: bi.fontStyle || 'normal', fontWeight: bi.fontWeight || 'normal', fontSize: bi.fontSize, fill: bi.color, align: 'center' });
          t2.anchor.set(0, 0); t2.position.set(0, 0);
          if (t2.width > 0 && t2.height > 0) t2.scale.set(bi.textW / t2.width, bi.textH / t2.height);
          app.renderer.render(t2, { renderTexture: rt, clear: true }); t2.destroy();
        });
      }
      shardRt = _konaSyncRtCache.get(burstSeed);
      if (s.diagLocalPoly && s.diagLocalPoly.length >= 3) {
        const matrix = new PIXI.Matrix().translate(s.diagCx || 0, s.diagCy || 0);
        gfx = new PIXI.Graphics();
        gfx.beginTextureFill({ texture: shardRt, matrix });
        gfx.moveTo(s.diagLocalPoly[0][0], s.diagLocalPoly[0][1]);
        for (let di = 1; di < s.diagLocalPoly.length; di++) gfx.lineTo(s.diagLocalPoly[di][0], s.diagLocalPoly[di][1]);
        gfx.closePath(); gfx.endFill(); gfx.alpha = 0.95;
      } else {
        const _sx = s.texX || 0, _sy = s.texY || 0;
        const _sw = Math.min(s.w, shardRt.width - _sx), _sh = Math.min(s.h, shardRt.height - _sy);
        const shardTex = new PIXI.Texture(shardRt.baseTexture, new PIXI.Rectangle(_sx, _sy, _sw, _sh));
        gfx = new PIXI.Sprite(shardTex); gfx.anchor.set(0.5, 0.5); gfx.alpha = 0.95;
      }
    } else {
      gfx = new PIXI.Graphics();
      gfx.beginFill(s.color, 0.88);
      gfx.moveTo(-hw, -hh); gfx.lineTo(hw, -hh); gfx.lineTo(hw, hh); gfx.lineTo(-hw, hh);
      gfx.closePath(); gfx.endFill();
    }
    const isDiag = !!(s.diagLocalPoly);
    const maxR = isDiag ? Math.max(...s.diagLocalPoly.map(v => Math.hypot(v[0], v[1]))) : Math.max(hw, hh);
    gfx.zIndex = 200; gfx.position.set(s.x, s.y); gfx.rotation = s.rot || 0;
    _konaContainer.addChild(gfx);
    _konaParticles.push({
      pixi: gfx, color: s.color, r: maxR,
      x: s.x, y: s.y, vx: s.vx || 0, vy: s.vy || 0, settled: false, rot: s.rot || 0, rotV: s.rotV || 0,
      fractureLevel: s.fractureLevel, kickCount: 0, hardness: s.hardness || 1,
      isTextureShard: !!shardRt, renderTexture: shardRt,
      isDiagonalShard: isDiag, diagLocalPoly: s.diagLocalPoly || null, diagCx: s.diagCx || 0, diagCy: s.diagCy || 0,
      texRegion: { x: s.texX || 0, y: s.texY || 0, w: s.w, h: s.h },
      blockInfo: s.blockInfo || null, burstSeed, pieceIdx: s.pieceIdx != null ? s.pieceIdx : null,
    });
  }
}

function _konaSendFullSync() {
  const particles = _konaParticles.filter(p => p.fractureLevel == null)
    .map(p => ({ x: p.x, y: p.y, color: p.color, r: p.r || 1, vx: p.vx || 0, vy: p.vy || 0, settled: !!p.settled }));
  const shards = _konaParticles.filter(p => p.fractureLevel != null)
    .map(p => { const tr = p.texRegion || {}; const s = { x: p.x, y: p.y, rot: p.rot || 0, color: p.color, w: tr.w || 0, h: tr.h || 0, texX: tr.x || 0, texY: tr.y || 0, fractureLevel: p.fractureLevel, hardness: p.hardness, kickCount: p.kickCount || 0, vx: p.vx || 0, vy: p.vy || 0, rotV: p.rotV || 0, settled: !!p.settled, blockInfo: p.blockInfo, burstSeed: p.burstSeed, pieceIdx: p.pieceIdx }; if (p.isDiagonalShard) { s.diagLocalPoly = p.diagLocalPoly; s.diagCx = p.diagCx; s.diagCy = p.diagCy; } return s; });
  const textBlocks = _konaTextBlocks.filter(b => !b.crumbled)
    .map(b => ({ grp: b.grp, fontSize: b.fontSize, fontFamily: b.fontFamily, fontStyle: b.fontStyle || 'normal', fontWeight: b.fontWeight || 'normal', color: b.color, x: b.x, y: b.y, vx: b.vx, vy: b.vy, rot: b.rot, rotV: b.rotV, burstSeed: b.burstSeed, initY: b.initY, initVy: b.initVy, hardness: b.hardness, landed: b.landed, textW: b.textW || (b.pixi ? Math.ceil(b.pixi.width) || null : null), textH: b.textH || (b.pixi ? Math.ceil(b.pixi.height) || null : null) }));
  if (!particles.length && !shards.length && !textBlocks.length) return;
  const bd = {};
  for (const [seed, bp] of _konaBreakData) bd[seed] = bp;
  socket.emit("konaSyncFull", { particles, shards, textBlocks, bd });
}

function _konaStartTicker() {
  if (_konaTicker) return;
  _konaTicker = _konaTick;
  app.ticker.add(_konaTicker);
}

function _konaStopTicker() {
  if (!_konaTicker) return;
  app.ticker.remove(_konaTicker);
  _konaTicker = null;
}

function _konaOnVisible() {
  if (!_isKonaRoom()) return;
  if (document.hidden) {
    if (_konaCurrentHostToken === myToken) {
      _konaCurrentHostToken = null;
      _konaLastHostChangeAt = Date.now();
      socket.emit("konaHostRelease");
    }
    return;
  }
  if (_konaCurrentHostToken === myToken) {
    if (roomMemberToken.length >= 2) _konaSendFullSync();
    return;
  }
  if (_konaCurrentHostToken && _konaCurrentHostToken !== myToken) {
    // 非ホストとして復帰: 新規入場と同様にホストからデータを受け取りホストを引き継ぐ
    _konaSyncReceived = false;
    socket.emit("konaRequestSync");
    return;
  }
  if (!_konaCurrentHostToken) {
    const idx = [...roomMemberToken].sort().indexOf(myToken);
    setTimeout(() => {
      if (_konaCurrentHostToken || !_isKonaRoom() || document.hidden) return;
      _konaCurrentHostToken = myToken;
      _konaLastHostChangeAt = Date.now();
      socket.emit("konaHostClaim");
      if (roomMemberToken.length >= 2) _konaSendFullSync();
    }, 100 + idx * 80);
  }
}

function _konaResetForResync() {
  _konaParticles.forEach(p => { if (p.pixi && !p.pixi.destroyed) p.pixi.destroy(); });
  _konaParticles = [];
  _konaTextBlocks.forEach(b => { if (b.pixi && !b.crumbled && !b.pixi.destroyed) b.pixi.destroy(); });
  _konaTextBlocks = [];
  _konaRenderTextures.forEach(rt => { if (!rt.destroyed) rt.destroy(true); });
  _konaRenderTextures = [];
  _konaSyncRtCache.clear();
  _konaFractureQueue = [];
  _konaLocallyShatteredSeeds.clear();
}

function _konaLeaveCleanup() {
  document.removeEventListener('visibilitychange', _konaOnVisible);
  _konaStopPeriodicSync();
  _konaStopTicker();
  clearTimeout(_konaScheduleSyncTimer);
  _konaScheduleSyncTimer = null; _konaScheduleSyncFirstAt = 0;
  clearTimeout(_konaHostClaimSyncTimer);
  _konaHostClaimSyncTimer = null;
  _konaSyncReceived = false;
  _konaCurrentHostToken = null;
  _konaAcceptSyncUntil = 0;
  _konaNoKickUntil = 0;
  _konaLastHostChangeAt = 0;
  _konaParticles.forEach(p => p.pixi.destroy());
  _konaParticles = [];
  _konaTextBlocks.forEach(b => { if (!b.crumbled && b.pixi) b.pixi.destroy(); });
  _konaTextBlocks = [];
  _konaRenderTextures.forEach(rt => rt.destroy(true));
  _konaRenderTextures = [];
  _konaFractureQueue = [];
  _konaSyncRtCache.clear();
  _konaBreakData.clear();
  _konaNeedResync = false;
  _konaLocallyShatteredSeeds.clear();
  if (_konaContainer) _konaContainer.removeChildren();
}
// FL:0シャードのbreak params照合・不一致時resync要求
function _konaCheckFL0Match(seed, bp) {
  if (!_konaContainer) return;
  const local0 = _konaParticles.filter(p => p.burstSeed === seed && p.fractureLevel === 0);
  if (!local0.length) return;
  const expected = bp.t === 'd' ? 2 : bp.cols * bp.rows;
  if (local0.length === expected) {
    const p0 = local0[0];
    if (bp.t === 'd' && p0.isDiagonalShard) {
      // diagCxでカット位置を検証（piece0/1どちらが先でも対応）
      const expCx0 = (bp.tx + bp.bx) / 4;
      const expCx1 = (bp.tx + bp.bx + 2 * bp.tw) / 4;
      const p0cx = p0.diagCx || 0;
      if (Math.abs(p0cx - expCx0) <= 3 || Math.abs(p0cx - expCx1) <= 3) return;
    }
    if (bp.t === 'r' && !p0.isDiagonalShard) {
      const expW = Math.round(bp.cx[1] - bp.cx[0]);
      if (Math.abs(Math.round(p0.texRegion?.w || 0) - expW) <= 1) return;
    }
  }
  // 不一致: ホストにkonaSyncFull再送を要求（連続要求防止）
  if (_konaNeedResync) return;
  _konaNeedResync = true;
  setTimeout(() => {
    if (room && _isKonaRoom()) socket.emit("konaResyncFull");
    _konaNeedResync = false;
  }, 150);
}

// ===== 文字の部屋システム終わり =====

function iniColPoint(blockSize) {//checkColpointで設定したcolPointを初期化
  colPoint = [];//一旦全部消す
  for (let i = 0; i < blockSize.length - 1; i++) {//値を用意する
    colPoint[i] = {
      LX: "", LY: "", distance: "",
    };
  }
}

function checkColPoint(BX, BY, startX = AX, startY = AY) {
  // 移動前の点と移動後の点との直線で、最も近い物体の交点を求める
  for (let i = 0; i < BX.length - 1; i++) {
    // まず、移動前と移動後を結ぶ直線とそれぞれの物体の辺を横切る直線との交点を全て得る
    colPoint[i].LX = ((BY[i + 1] - startY) * (MX - startX) * (BX[i] - BX[i + 1])
      - BX[i + 1] * (BY[i] - BY[i + 1]) * (MX - startX)
      + startX * (MY - startY) * (BX[i] - BX[i + 1]))
      / ((MY - startY) * (BX[i] - BX[i + 1])
        - (BY[i] - BY[i + 1]) * (MX - startX));

    colPoint[i].LY = (BY[i + 1] * (MY - startY) * (BX[i] - BX[i + 1])
      + (MY - startY) * (startX - BX[i + 1]) * (BY[i] - BY[i + 1])
      - startY * (BY[i] - BY[i + 1]) * (MX - startX))
      / ((MY - startY) * (BX[i] - BX[i + 1])
        - (BY[i] - BY[i + 1]) * (MX - startX));

    // 移動前の点から移動後の点への直線に物体との交点があるかどうかで絞り込む
    if (
      // 辺の直線との交点が道中にあるかどうか、
      ((MX < colPoint[i].LX && colPoint[i].LX < startX) || (startX < colPoint[i].LX && colPoint[i].LX < MX))
      &&
      // 交点が物体の辺のＸ座標の間に収まってるかどうか
      ((BX[i] <= colPoint[i].LX && colPoint[i].LX <= BX[i + 1]) || (BX[i + 1] <= colPoint[i].LX && colPoint[i].LX <= BX[i]))
      &&
      // 交点が物体の辺のＹ座標の間に収まってるかどうか
      ((BY[i] <= colPoint[i].LY && colPoint[i].LY <= BY[i + 1]) || (BY[i + 1] <= colPoint[i].LY && colPoint[i].LY <= BY[i]))) {

      // 交点の物体の辺の端点を配列に登録する
      colPoint[i].TX = BX[i];
      colPoint[i].TY = BY[i];
      colPoint[i].PX = BX[i + 1];
      colPoint[i].PY = BY[i + 1];

      // それぞれの点の物体との距離の2乗を算出する
      colPoint[i].distance = Math.pow((colPoint[i].LX - startX), 2) + Math.pow((colPoint[i].LY - startY), 2);

      // 衝突点を配列に纏める
      colPointAll.push(colPoint[i]);
    }
  }
}

function _getVideoFloorNorm(ax, ay) {
  for (const [token, f] of Object.entries(videoFloorObjects)) {
    if (!f._pixiW) continue;
    const lx = ax - f.container.x;
    const ly = ay - f.container.y;
    const fw = f._pixiW;
    if (ly >= 0 && ly <= (f._pixiH || VIDEO_FLOOR_H) && lx >= -20 && lx < fw + 20) {
      return { token, normX: lx / fw, normY: ly / VIDEO_FLOOR_H };
    }
  }
  return null;
}
function _resolveVideoFloor(ax, ay, vf) {
  if (!vf) return { ax, ay };
  const f = videoFloorObjects[vf.token];
  const fw = (f && f._pixiW > 0) ? f._pixiW : 660;
  const resolvedX = (f && f._pixiW > 0) ? f.container.x + vf.normX * fw : ax;
  const resolvedY = vf.normY != null ? VIDEO_FLOOR_Y + vf.normY * VIDEO_FLOOR_H : ay;
  return { ax: resolvedX, ay: resolvedY };
}

//ステージをクリックしたときの移動処理
function _doStageTap(targetX, targetY) {
  if (!avaP[myToken]) return;
  const currentX = avaP[myToken].container.x;
  const currentY = avaP[myToken].container.y;
  if (currentX == targetX && currentY == targetY) return;

  MX = targetX;
  MY = targetY;
  let sin = (MY - currentY) / Math.sqrt(Math.pow(MX - currentX, 2) + Math.pow(MY - currentY, 2));
  DIR = calculateDirection(sin, currentX, MX);

  if (room.name === "草原") meadowBlock();
  if (room.name === "エントランス" && entranceIs2F) {
    if (!pointInPolygon(targetX, targetY, ENTRANCE_2F_POLY)) {
      entranceIs2F = false;
      avaP[myToken].is2F = false;
    }
  }

  if (colPointAll[0] == undefined) {
    AX = MX;
    AY = MY;
  } else {
    handleCollision();
  }

  const _pzTap = _getPlatformZones();
  if (_pzTap && !_isOnAnyPlatform(AX, AY, _pzTap)) return;

  const targetObject = findObjectAtPosition(targetX, targetY);
  if (targetObject && targetObject.isMoving && targetObject.isMoving()) {
    const objectContainer = targetObject.container || targetObject;
    const relativeX = AX - (objectContainer.x || 0);
    const relativeY = AY - (objectContainer.y || 0);
    if (room.name !== "loginRoom" && !isReconnecting) {
      socket.emit("tapMap", { DIR, moveType: "relative", targetObject: targetObject.name, relativeX, relativeY, sit: avaP[myToken].sit, AX, AY });
    }
  } else {
    if (room.name !== "loginRoom" && !isReconnecting) {
      socket.emit("tapMap", { DIR, moveType: "absolute", AX, AY, sit: avaP[myToken].sit, riding: false });
    }
  }
  avaP[myToken].tappedMove(AX, AY, DIR, avaP[myToken].sit);
  colPointAll = [];
}

function stageMove(value) {
  value.eventMode = 'static';
  value.on('pointerdown', e => {
    if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
    if (floorPolyMode) return;
    if (_imgDoodleMode) return;
    if (_warpDragging || _imgDragging || _scaleZoneDragging) return;
    const targetX = e.data.getLocalPosition(value).x;
    const targetY = e.data.getLocalPosition(value).y;
    _doStageTap(targetX, targetY);
  });
}

// ⭐ 指定位置にあるオブジェクトを探す関数
function findObjectAtPosition(x, y) {
  const tempAvatar = {
    container: { x: x, y: y },
    token: "temp"
  };

  // 部屋内のオブジェクトをチェック
  for (const objName in objMap) {
    const obj = objMap[objName];
    if (!obj || !obj.tags) continue;

    // standableタグがあり、かつ当たり判定がある場合
    const hasStandableTag = obj.tags.includes("standable") ||
      (avaP[myToken].avatarAlpha < 0.5 && obj.tags.includes("standableWhenTranslucent"));

    if (hasStandableTag && hitAB(tempAvatar, obj)) {
      return obj;
    }
  }

  return null;
}

// 方向計算を分離
function calculateDirection(sin, currentX, MX) {
  if (sin <= -0.9239) {
    return "N";
  } else if (0.9239 <= sin) {
    return "S";
  } else if (0.3827 <= sin && currentX < MX) {
    return "SE";
  } else if (0.3827 <= sin && MX < currentX) {
    return "SW";
  } else if (sin <= -0.3827 && currentX < MX) {
    return "NE";
  } else if (sin <= -0.3827 && MX < currentX) {
    return "NW";
  } else if (currentX < MX) {
    return "E";
  } else if (MX < currentX) {
    return "W";
  }

  // ⭐ デフォルト値を追加
  return "S";
}

// ===== キーボード矢印キー移動 =====

// 現在押されている矢印キーから移動方向を返す
function getKeyDir() {
  const up = keysPressed.has("ArrowUp");
  const dn = keysPressed.has("ArrowDown");
  const lt = keysPressed.has("ArrowLeft");
  const rt = keysPressed.has("ArrowRight");
  if (!up && !dn && !lt && !rt) return null;
  if (up && rt) return "NE";
  if (up && lt) return "NW";
  if (dn && rt) return "SE";
  if (dn && lt) return "SW";
  if (up) return "N";
  if (dn) return "S";
  if (lt) return "W";
  if (rt) return "E";
  return null;
}

// 方向ごとの移動ベクトル（正規化済み）
const DIR_MOVE_DELTA = {
  N:  [0, -1],
  NE: [0.707, -0.707],
  E:  [1, 0],
  SE: [0.707, 0.707],
  S:  [0, 1],
  SW: [-0.707, 0.707],
  W:  [-1, 0],
  NW: [-0.707, -0.707],
};

// 方向ごとの歩行スプライト名（idle, frame1, frame2） の3フレームサイクル
const KEY_WALK_DIR_FRAMES = {
  N:  ["avaN",  "avaN1",  "avaN2"],
  NE: ["avaNE", "avaNE1", "avaNE2"],
  E:  ["avaE",  "avaE1",  "avaE2"],
  SE: ["avaSE", "avaSE1", "avaSE2"],
  S:  ["avaS",  "avaS1",  "avaS2"],
  SW: ["avaSW", "avaSW1", "avaSW2"],
  W:  ["avaW",  "avaW1",  "avaW2"],
  NW: ["avaNW", "avaNW1", "avaNW2"],
};

// 移動停止：アイドルスプライトに戻して最終位置をサーバーに送信
function stopKeyMove() {
  if (!keyMoveTickerFn) return;
  app.ticker.remove(keyMoveTickerFn);
  keyMoveTickerFn = null;
  const ava = avaP[myToken];
  if (!ava) return;
  // キーを離した後も歩行フレームのまま停止（棒立ちに戻さない）
  // currentAvaStateKey は現在の歩行フレームキーを維持するのでそのまま
  if (room && room.name !== "loginRoom" && !isReconnecting) {
    // currentAvaStateKey から実際の表示方向・フレームを取得（DIRとフレームタイマーのズレを防ぐ）
    const sk = ava.currentAvaStateKey || "";
    const stopDIR = sk.replace(/[012]$/, '') || DIR;
    const frameMatch = sk.match(/[012]$/);
    const stopFrame = frameMatch ? parseInt(frameMatch[0]) : keyWalkFrame;
    const stopData = { DIR: stopDIR, moveType: "absolute", AX, AY, sit: ava.sit, riding: !!ava.ridingObject, keyMove: true, keyFrame: stopFrame };
    if (ava.ridingObject) {
      stopData.ridingOffsetX = ava.ridingOffset.x;
      stopData.ridingOffsetY = ava.ridingOffset.y;
    }
    socket.emit("tapMap", stopData);
  }
}

// 移動ティッカーを開始
function startKeyMoveTicker() {
  if (keyMoveTickerFn) return;
  keyWalkFrameTimer = 0;
  keySocketTimer = 0;

  keyMoveTickerFn = (delta) => {
    const dir = getKeyDir();
    if (!dir) { stopKeyMove(); return; }

    // チャット入力欄以外のINPUT/TEXTAREAにフォーカス中は動かさない
    const el = document.activeElement;
    if (el && el !== msgForm.msg && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) { stopKeyMove(); return; }

    const ava = avaP[myToken];
    if (!ava || ava.sit || ava.sleep) { stopKeyMove(); return; }
    if (!room) { stopKeyMove(); return; }

    DIR = dir;
    const [dx, dy] = DIR_MOVE_DELTA[dir];
    MX = ava.container.x + dx * KEY_MOVE_SPEED * delta;
    MY = ava.container.y + dy * KEY_MOVE_SPEED * delta;
    colPointAll = [];
    if (room.name === "草原") meadowBlock();
    if (colPointAll[0] === undefined) {
      AX = MX;
      AY = MY;
    } else {
      handleCollision();
    }
    const _pzKey = _getPlatformZones();
    if (_pzKey) {
      if (_isOnAnyPlatform(ava.container.x, ava.container.y, _pzKey) && !_isOnAnyPlatform(AX, AY, _pzKey)) {
        AX = ava.container.x; AY = ava.container.y;
      }
    }
    ava.container.x = AX;
    ava.container.y = AY;

    // 画面端でワープ（文字の部屋）
    if (room.name === "文字の部屋") {
      if (AX > 660) { goSelfToRoomSpot("outerSpaceMainSpot"); return; }
      if (AX < 0)   { goSelfToRoomSpot("star1EntrySpot"); return; }
    }

    // むげん・方角部屋以外: キーボード移動で画面外に出ないようクランプ
    if (!_DIR_ROOM_NAMES.has(room.name) && room.name !== "むげん") {
      AX = Math.max(0, Math.min(660, AX));
      const _maxFloorH = Object.keys(videoFloorObjects).length > 0 ? Math.max(...Object.values(videoFloorObjects).map(f => f._pixiH || VIDEO_FLOOR_H)) : 0;
      const _maxAY = _maxFloorH > 0 ? VIDEO_FLOOR_Y + _maxFloorH : VIDEO_FLOOR_Y;
      AY = Math.max(0, Math.min(_maxAY, AY));
      ava.container.x = AX;
      ava.container.y = AY;
    } else {
      // むげん・方角部屋: 画面端でループ（逆方向から出現）
      const _mugenFloorH = room.name === 'むげん' && Object.keys(videoFloorObjects).length > 0 ? Math.max(...Object.values(videoFloorObjects).map(f => f._pixiH || VIDEO_FLOOR_H)) : 0;
      const maxY = _mugenFloorH > 0 ? VIDEO_FLOOR_Y + _mugenFloorH : 460;
      let _didWrap = false;
      if (AX < 0) { AX += 660; _didWrap = true; }
      else if (AX > 660) { AX -= 660; _didWrap = true; }
      if (AY < 0) { AY += maxY; _didWrap = true; }
      else if (AY > maxY) { AY -= maxY; _didWrap = true; }
      ava.container.x = AX;
      ava.container.y = AY;
      if (_didWrap && !isReconnecting) {
        const _we = { DIR, moveType: "absolute", AX, AY, sit: ava.sit, riding: !!ava.ridingObject, keyMove: true, keyFrame: keyWalkFrame };
        if (ava.ridingObject) { _we.ridingOffsetX = ava.ridingOffset.x; _we.ridingOffsetY = ava.ridingOffset.y; }
        socket.emit("tapMap", _we);
        keySocketTimer = 0;
      }
    }

    // 乗り物（雲など）に乗っている場合、ridingOffsetを更新して位置を維持
    if (ava.ridingObject) {
      const objContainer = ava.ridingObject.container || ava.ridingObject;
      const sx = objContainer.scale?.x ?? 1;
      const sy = objContainer.scale?.y ?? 1;
      ava.ridingOffset.x = (AX - (objContainer.x || 0)) / (sx || 1);
      ava.ridingOffset.y = (AY - (objContainer.y || 0)) / (sy || 1);
    }

    // 歩行アニメーションフレームの切り替え（0→1→2→0 の3フレームサイクル）
    keyWalkFrameTimer += delta;
    if (keyWalkFrameTimer >= KEY_WALK_FRAME_TICKS) {
      keyWalkFrameTimer = 0;
      keyWalkFrame = (keyWalkFrame + 1) % 3;
      const spriteName = KEY_WALK_DIR_FRAMES[dir][keyWalkFrame];
      ava.container.removeChild(ava.avaC);
      ava.avaC = ava[spriteName];
      ava.container.addChild(ava.avaC);
      if (ava.currentAvaStateKey !== undefined) {
        ava.currentAvaStateKey = spriteName.replace("ava", "");
        ava.redrawOekakiForState();
      }
    }

    // サーバー送信（スロットル）
    keySocketTimer += delta;
    if (keySocketTimer >= KEY_SOCKET_TICKS) {
      keySocketTimer = 0;
      if (!isReconnecting) {
        const emitData = { DIR, moveType: "absolute", AX, AY, sit: ava.sit, riding: !!ava.ridingObject, keyMove: true, keyFrame: keyWalkFrame };
        if (ava.ridingObject) {
          emitData.ridingOffsetX = ava.ridingOffset.x;
          emitData.ridingOffsetY = ava.ridingOffset.y;
        }
        socket.emit("tapMap", emitData);
      }
    }
  };
  app.ticker.add(keyMoveTickerFn);
}

// 衝突処理を分離
function handleCollision() {
  colPointAll.sort((a, b) => a.distance > b.distance ? 1 : -1);

  if (colPointAll[0].TX < colPointAll[0].PX && colPointAll[0].PY < colPointAll[0].TY) {
    colMove(colPointAll[0], -1, -1);
  } else if (colPointAll[0].PX < colPointAll[0].TX && colPointAll[0].PY < colPointAll[0].TY) {
    colMove(colPointAll[0], -1, 1);
  } else if (colPointAll[0].TX < colPointAll[0].PX && colPointAll[0].TY < colPointAll[0].PY) {
    colMove(colPointAll[0], 1, -1);
  } else if (colPointAll[0].PX < colPointAll[0].TX && colPointAll[0].TY < colPointAll[0].PY) {
    colMove(colPointAll[0], 1, 1);
  } else {
    AX = MX;
    AY = MY;
  }
}

//ブロックと衝突時の動きの式,
function colMove(CPA, stopX, stopY) {//CPAはcolPointALLの略、stopXとstopYはブロックの手前で止まってもらうための数字,バグ防止
  //交点に位置に移動する
  AX = CPA.LX + stopX;
  AY = CPA.LY + stopY;
}


//移動時のソケット受け取り//自分以外の時にだけ使ってる
socket.on("tapMap", data => {
  if (!avaP[data.token].abon) {

    if (data.moveType === "relative") {
      // ⭐ 相対座標移動

      const targetObject = objMap[data.targetObject];
      if (targetObject) {
        // 現在のオブジェクト位置から実際の座標を計算
        const objectContainer = targetObject.container || targetObject;
        const objectX = objectContainer.x || 0;
        const objectY = objectContainer.y || 0;
        const actualX = objectX + data.relativeX;
        const actualY = objectY + data.relativeY;

        // 乗車状態を設定して移動
        avaP[data.token].startRiding(targetObject);
        avaP[data.token].ridingOffset.x = data.relativeX;
        avaP[data.token].ridingOffset.y = data.relativeY;
        avaP[data.token].tappedMove(actualX, actualY, data.DIR, data.sit);

      } else {
        console.warn(`対象オブジェクト ${data.targetObject} が見つかりません`);
      }
    } else {
      // ⭐ 絶対座標移動
      const ava = avaP[data.token];
      if (ava.ridingObject) {
        if (data.riding) {
          // riding中の移動: ridingOffsetを更新（送信側から直接offsetが来た場合はそれを使う）
if (data.ridingOffsetX !== undefined) {
            ava.ridingOffset.x = data.ridingOffsetX;
            ava.ridingOffset.y = data.ridingOffsetY;
          } else {
            const objContainer = ava.ridingObject.container || ava.ridingObject;
            const sx = objContainer.scale?.x ?? 1;
            const sy = objContainer.scale?.y ?? 1;
            ava.ridingOffset.x = (data.AX - (objContainer.x || 0)) / (sx || 1);
            ava.ridingOffset.y = (data.AY - (objContainer.y || 0)) / (sy || 1);
          }
          if (data.keyMove && KEY_WALK_DIR_FRAMES[data.DIR]) {
            ava._animeRev = (ava._animeRev || 0) + 1; // 旧anime()の遅延コールバックをキャンセル
            ava._keyWalkFrame = data.keyFrame !== undefined ? data.keyFrame : ((ava._keyWalkFrame || 0) + 1) % 3;
            const spriteName = KEY_WALK_DIR_FRAMES[data.DIR][ava._keyWalkFrame];
            ava.container.removeChild(ava.avaC);
            ava.avaC = ava[spriteName];
            ava.container.addChild(ava.avaC);
            if (ava.currentAvaStateKey !== undefined) {
              ava.currentAvaStateKey = spriteName.replace("ava", "");
              ava.redrawOekakiForState();
            }
            // ridingOffsetをgsapで補間→updateRidingが常にB.x+offsetで追従できる
            const _objC = ava.ridingObject.container || ava.ridingObject;
            const _sx = _objC.scale?.x ?? 1;
            const _sy = _objC.scale?.y ?? 1;
            const _tgtX = data.ridingOffsetX !== undefined ? data.ridingOffsetX : (data.AX - (_objC.x || 0)) / (_sx || 1);
            const _tgtY = data.ridingOffsetY !== undefined ? data.ridingOffsetY : (data.AY - (_objC.y || 0)) / (_sy || 1);
            gsap.killTweensOf(ava.ridingOffset);
            gsap.to(ava.ridingOffset, { duration: 0.12, x: _tgtX, y: _tgtY, ease: "none" });
            ava._mugenDR = null;
          }
        } else {
          // 降車中: transformOtherAvatarData(ridingData=null)を待って実行
          ava._pendingTapMap = data;
        }
      } else if (data.keyMove && KEY_WALK_DIR_FRAMES[data.DIR]) {
        ava._animeRev = (ava._animeRev || 0) + 1; // 旧anime()の遅延コールバックをキャンセル
        ava._keyWalkFrame = data.keyFrame !== undefined ? data.keyFrame : ((ava._keyWalkFrame || 0) + 1) % 3;
        const spriteName = KEY_WALK_DIR_FRAMES[data.DIR][ava._keyWalkFrame];
        ava.container.removeChild(ava.avaC);
        ava.avaC = ava[spriteName];
        ava.container.addChild(ava.avaC);
        if (ava.currentAvaStateKey !== undefined) {
          ava.currentAvaStateKey = spriteName.replace("ava", "");
          ava.redrawOekakiForState();
        }
        gsap.killTweensOf(ava.container);
        if (room && (room.name === 'むげん' || _DIR_ROOM_NAMES.has(room.name))) {
          const [_vx, _vy] = DIR_MOVE_DELTA[data.DIR] || [0, 0];
          if (Math.abs(data.AX - ava.container.x) > 330 || Math.abs(data.AY - ava.container.y) > 220) {
            ava.container.x = data.AX;
            ava.container.y = data.AY;
          }
          ava._mugenDR = { vx: _vx * KEY_MOVE_SPEED, vy: _vy * KEY_MOVE_SPEED, t: performance.now(), tx: data.AX, ty: data.AY };
        } else {
          gsap.to(ava.container, { duration: 0.12, x: data.AX, y: data.AY, ease: "none" });
        }
      } else {
        ava._mugenDR = null;
        ava._lastTapMapAt = Date.now();
        ava.tappedMove(data.AX, data.AY, data.DIR, data.sit);
      }
    }
  }
});

//看板機能
function autoResizeMsg() {
  const el = msgForm.msg;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}
msgForm.msg.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    msgForm.dispatchEvent(new Event("submit", { cancelable: true }));
  }
});
msgForm.msg.addEventListener("input", autoResizeMsg);

//メッセージ入力
msgForm.addEventListener("submit", e => {
  socket.emit("emit_msg", {
    msg: (msgForm.msg.value),
    carryOver: true,
  });
  if (msgForm.msg.value !== "わっふるわっふる" || msgForm.msg.value === "waffle waffle" || waffleEventNum === 0) {
    msgForm.msg.value = "";//メッセージ入力欄を空にする
    msgForm.msg.style.height = '';
  }
  msgForm.msg.focus();//メッセージ入力欄にフォーカスを合わせる
  e.preventDefault();
});

// スマホの送信ボタンタップ時にテキストエリアのフォーカスが奪われないようにする
document.getElementById('sendBtn').addEventListener('mousedown', e => {
  e.preventDefault();
});

let nanasiName = [];
nanasiName[0] = [
  "風吹けば",
  "疾風の",
  "草原の",
  "伝説の",
  "透明な",
  "大和の",
  "聡明な",
  "爆進",
  "怒涛の",
  "陽気な",
  "虹の",
  "名高い",
  "無名な",
  "名無しな",
  "純然たる",
  "噛みつき",
  "かわいい",
  "とある",
  "あっちからそっちから",
  "まことの",
  "すーぱー",
  "あめいじんぐ",
  "ぶよぶよ",
  "ふわふわ",
  "ふんわり",
  "とろとろ",
  "やわらか",
  // "モイモイ!",
  "lightning",
  // "マグマな",
  "トロピカル",
  "おもちゃの国の",
  "宇宙な",
  "野菜畑",
  "りびんぐでっと",
  "火遁の",
  "水遁・",
  "ワイルドタイプな",
  "乙女な",
  "マッハ",
  "蜜柑味",
  "檸檬味",
  // "苺味",
  "七百七十四式",
  "上空の",
  "やめられない、止まらない",
  "時かける",
  "ちょいいいこちゃん系",
  "バナ",
  "海から",
  "永遠の",
  "人参",
  "生姜焼き",
  // "月昇る夜に",
  "ヒップdeホップな",
  "よくある",
  // "とある厨二の",
  "真・",
  "眠れない夜に",
  "皿まで喰らえば",
  "まっするもっする",
  "豪傑",
  "るーぷりーぷ",
  "枉駕来臨",
  // "子墨客卿",
  "アニマな",
  "金魚な",
  // "黒鉄の",
  "メラメラ",
  "ちくわ",
  "神々の",
  "♰",
  "モルデラ",
  "すーぱー",
  "うるとら",
  "はいぱー",
  "光と闇の",
  "万物創世の",
  "らりあっと！",
  "あたりめ",
  "ｻﾝｼｬｲﾝ",
  "月が昇るよ",
  "だんぼーる",
  "",
  //ここ見て入力してるやつおるだろおい！！！！
];
nanasiName[1] = [
  ["名無し", 100],
  ["ななし", 60],
  ["ななお", 15],
  ["ナナシ", 40],
  ["ナナオ", 5],
  ["ナナヲ", 2],
  ["774", 10],
  ["770", 2],
  ["noname", 2],
];
nanasiName[2] = [];
for (let i = 0; i < nanasiName[1].length; i++) {
  for (let j = 0; j < nanasiName[1][i][1]; j++) {
    nanasiName[2].push(nanasiName[1][i][0]);
  }
}

nanasiName[3] = [
  ["さん", 160],
  ["ちゃん", 60],
  ["氏", 20],
  ["君", 20],
  ["にき", 10],
  ["ねき", 10],
  ["兄さん", 10],
  ["姉さん", 10],
  ["娘", 8],
  ["ボーイ", 6],
  ["がーる", 6],
  ["先輩", 8],
  ["親分", 6],
  ["侍", 6],
  ["たん", 6],
  ["きゅん", 6],
  ["どん", 5],
  ["山", 5],
  ["の里", 5],
  ["＠メイドさん", 5],
  ["卿", 5],
  ["師", 5],
  ["ﾏｿ", 4],
  ["殿", 4],
  ["姫", 4],
  ["猊下", 2],
  ["閣下", 2],
  ["犬", 1],
  ["神", 1],
];
nanasiName[4] = [];
for (let i = 0; i < nanasiName[3].length; i++) {
  for (let j = 0; j < nanasiName[3][i][1]; j++) {
    nanasiName[4].push(nanasiName[3][i][0]);
  }
}

nanasiName[5] = [
  ["ななお", 15],
  ["ナナオ", 5],
  ["ナナヲ", 2],
  ["770", 2],
];
nanasiName[6] = [];
for (let i = 0; i < nanasiName[5].length; i++) {
  for (let j = 0; j < nanasiName[5][i][1]; j++) {
    nanasiName[6].push(nanasiName[5][i][0]);
  }
}

//追加案
//✟
//★
//2.0
//～
//(進化後)
//(象さｎ)
//(山)

let _latestChatBarTimer = null;
function _showLatestChatBar(text) {
  if (!imgEditRoomId || _isNewRoomMode) return;
  const bar = document.getElementById('latestChatBar');
  if (!bar) return;
  bar.textContent = text;
  bar.style.display = 'block';
  if (_latestChatBarTimer) clearTimeout(_latestChatBarTimer);
  _latestChatBarTimer = setTimeout(() => { bar.style.display = 'none'; _latestChatBarTimer = null; }, 5000);
}

function outputChatMsg(outputMessage, color, thisToken, announce, namePrefix) {//移動時のメッセージ出力
  if (!outputMessage) return;//空メッセージは処理しない
  if (announce && !showJoinLeaveMsg) return;//入退出メッセージ非表示設定時はスキップ

  if (!floorPolyMode && outputMessage.length > 200) {
    outputMessage = outputMessage.slice(0, 200) + "...";
  }

  const li = document.createElement("li");
  if (color) {
    li.style.color = color;
  }
  if (announce) {//アナウンスstyleの設定
    li.classList.add('log-announce');
    li.style.fontSize = localStorage.getItem("fontSize") + "px";
    li.style.color = "rgb(208,110,197)";
    fontSizeSelecter.onchange = (e) => {
      localStorage.setItem("fontSize", e.target.value);
      mainLog.style.fontSize = e.target.value + "px";
      li.style.fontSize = localStorage.getItem("fontSize") + "px";
    }
  }

  if (thisToken) {
    // アイコン：プレースホルダーimgを先にprefixに追加してDOMに反映してからsrcをセット
    const img = document.createElement("img");
    const fontSize = parseInt(mainLog.style.fontSize, 10) || 18;
    img.height = fontSize - 5;
    img.width = fontSize - 5;

    const msgPrefix = document.createElement('span');
    msgPrefix.classList.add('msgPrefix');
    msgPrefix.appendChild(img);
    if (namePrefix) msgPrefix.appendChild(document.createTextNode(namePrefix));
    li.appendChild(msgPrefix);

    // 発言したテキストをクリックした時アボンする
    li.classList.add(thisToken);//アボンクラスを付与
    li.addEventListener('pointerdown', e => {//ctrlキーとセットでアボンする機能
      if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
      if (e.ctrlKey) {
        if (myToken != thisToken) {//自テキストは省く
          if (avaP[thisToken].abon) {
            avaP[thisToken].abon = false;
          } else {
            avaP[thisToken].abon = true;
          }
          socket.emit("abonSetting", {
            setAbon: avaP[thisToken].abon,
            token: thisToken,
          });
        }
      } else if (useLogHighlight && useLogItemHighlight) {
        applyLogHighlight(highlightToken === thisToken ? null : thisToken);
      }
    }, { passive: true });

    // アイコンはDOMに挿入した後に非同期で取得してsrcをセット（表示ラグを防ぐ）
    if (avaP[thisToken]) {
      const aspect = avaP[thisToken].avatarAspect;
      const avatarColor = avaP[thisToken].avatarColor || 0xffffff;
      getAvatarIconDataURL(aspect, avatarColor).then(dataURL => { img.src = dataURL; });
    }
  }

  //urlで分割
  //u3000は全角空白だからu3001からにした
  let split = (String(outputMessage)).split(/https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#\u3001-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+/g);
  let match = outputMessage.match(/https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#\u3001-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+/g);

  if (!match) {
    match = [];
    match[0] = false;
  }

  let allLength = 0;
  let pre = [];
  let a = [];
  let maxLength = 200;

  function nl2br(el, text) {
    text.split('\n').forEach((part, p, arr) => {
      if (part) el.appendChild(document.createTextNode(part));
      if (p < arr.length - 1) el.appendChild(document.createElement('br'));
    });
  }

  for (let i = 0; i < split.length; i++) {
    if (allLength + split[i].length > maxLength) {
      li.appendChild(document.createTextNode(split[i].slice(0, maxLength - allLength) + "...(省略されました。全てを読むにはわっふるわっふると書き込んでください。)"));
      waffleEventNum++;
      msgForm.addEventListener("submit", waffle), { passive: true };
      break;
    } else {
      nl2br(li, split[i]);
      allLength += split[i].length;
    }

    if (match[i]) {//match[i]の数が分割する数なのでsplit[i]と一致しない為
      a[i] = document.createElement("a");
      a[i].href = match[i];
      a[i].target = "_blank"

      if (allLength + match[i].length > maxLength) {
        a[i].textContent = match[i].slice(0, maxLength - allLength) + " ...(省略されました。全てを読むにはわっふるわっふると書き込んでください。)";
        li.appendChild(a[i]);
        waffleEventNum++;
        msgForm.addEventListener("submit", waffle), { passive: true };
        break;
      } else {
        a[i].textContent = match[i];
        li.appendChild(a[i]);
        allLength += a[i].textContent.length;
      }
    }
  }

  function waffle(e) {
    if (msgForm.msg.value === "わっふるわっふる" || msgForm.msg.value === "waffle waffle") {
      let liAll = document.createElement("li");
      liAll.classList.add("flexContainer");
      if (color) {
        liAll.style.color = color;
      }

      for (let i = 0; i < split.length; i++) {
        pre[i] = document.createElement("pre");

        pre[i].textContent = split[i];
        liAll.appendChild(pre[i]);

        if (match[i]) {//match[i]の数が分割する数なのでsplit[i]と一致しない為
          a[i] = document.createElement("a");
          a[i].href = match[i];
          a[i].target = "_blank"

          a[i].textContent = match[i];
          liAll.appendChild(a[i]);
        }
      }

      //メッセージを出力（元のliとすげ替え）
      mainLogUl.replaceChild(liAll, li);
      if (window.innerWidth > 660 && mainLog.scrollHeight <= mainLog.clientHeight + mainLog.scrollTop + 1) {
        mainLog.scrollTop = mainLog.scrollHeight;
      }

      msgForm.removeEventListener("submit", waffle);
      waffleEventNum--;

      if (waffleEventNum === 0) {
        msgForm.msg.value = "";//メッセージ入力欄を空にする
      }
    }
    e.preventDefault();
  }//waffle

  //メッセージを出力（appendChildで末尾に追加）
  if (highlightToken && thisToken === highlightToken) {
    li.classList.add('log-highlight');
    _applyHighlightStyle(li, thisToken, !!announce);
  }
  const _wasAtBottom = mainLog.scrollHeight <= mainLog.clientHeight + mainLog.scrollTop + 1;
  mainLogUl.appendChild(li);
  if (window.innerWidth > 660 && _wasAtBottom) {
    mainLog.scrollTop = mainLog.scrollHeight;
  }
  _showLatestChatBar((namePrefix ? namePrefix + ' ' : '') + outputMessage);

  //オーバーレイチャットの表示
  const _oDisplayMsg = namePrefix ? namePrefix + outputMessage : outputMessage;
  const _oText = new PIXI.Text(_oDisplayMsg, overlayChatStyle);
  _oText.y = 0;
  const _oOffsetY = Math.max(_oText.height, 18);
  overlayChat.children.forEach(child => { child.y += _oOffsetY; });

  if (thisToken) {
    const iconSprite = new PIXI.Sprite(avaP[thisToken].icon);
    iconSprite.width = 18;
    iconSprite.height = 18;
    iconSprite.x = 0;
    iconSprite.y = 0;
    iconSprite.tint = avaP[thisToken].avatarColor || 0xffffff;
    overlayChat.addChild(iconSprite);
    _oText.x = 18;
    overlayChat.addChild(_oText);
  } else {
    _oText.x = 0;
    overlayChat.addChild(_oText);
  }
}

//メインログ表示
let useMainLog = localStorage.getItem("showMainLog") === "1";
mainLogButton.addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  e.preventDefault(); // テキスト選択やドラッグ開始を防ぐ
  useMainLog = !useMainLog;
  localStorage.setItem("showMainLog", useMainLog ? "1" : "0");
  _setBtnState(mainLogButton, useMainLog ? 'skyblue' : 'red');
  const mainLogHeight = localStorage.getItem("mainLogHeight") || "200";
  mainLog.style.height = useMainLog ? mainLogHeight + "px" : "0px";
  mainLogFrame.style.height = useMainLog ? mainLogHeight + "px" : "0px";
  mainLogResizeBar.style.display = useMainLog ? "block" : "none";
});

//画面chatの表示切替
let useOverlayChat = localStorage.getItem("showOverlayChat") === "1";
useOverlayChatButton.addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  e.preventDefault(); // テキスト選択やドラッグ開始を防ぐ
  useOverlayChat = !useOverlayChat;
  localStorage.setItem("showOverlayChat", useOverlayChat ? "1" : "0");
  overlayChat.visible = useOverlayChat;
  _setBtnState(useOverlayChatButton, useOverlayChat ? 'skyblue' : 'red');
});

// 画面チャット スワイプ：左右でテキスト色切替、上下でスクロール
const _ocTextColors = ['white', 'black', '#ffff00', '#ff8800', '#ff4444', '#00ffff', '#ff88ff'];
let _ocTextColorIdx = 0;
let _ocSwStartX = 0, _ocSwStartY = 0, _ocSwPrevY = 0, _ocSwDir = null;
myCanvas.addEventListener('touchstart', e => {
  if (e.touches.length !== 1) return;
  _ocSwStartX = e.touches[0].clientX;
  _ocSwStartY = e.touches[0].clientY;
  _ocSwPrevY = e.touches[0].clientY;
  _ocSwDir = null;
}, { passive: true });
myCanvas.addEventListener('touchmove', e => {
  if (e.touches.length !== 1 || !useOverlayChat) return;
  const adx = Math.abs(e.touches[0].clientX - _ocSwStartX);
  const ady = Math.abs(e.touches[0].clientY - _ocSwStartY);
  if (!_ocSwDir) {
    if (ady > adx + 5) _ocSwDir = 'v';
    else if (adx > ady + 5) _ocSwDir = 'h';
  }
  if (_ocSwDir === 'v') {
    const rect = myCanvas.getBoundingClientRect();
    const scale = 460 / rect.height;
    overlayChat.y = Math.min(0, overlayChat.y + (e.touches[0].clientY - _ocSwPrevY) * scale);
  }
  _ocSwPrevY = e.touches[0].clientY;
}, { passive: true });
myCanvas.addEventListener('touchend', e => {
  if (!useOverlayChat || !e.changedTouches[0]) return;
  const dx = e.changedTouches[0].clientX - _ocSwStartX;
  const dy = e.changedTouches[0].clientY - _ocSwStartY;
  if (Math.abs(dx) < 50 || Math.abs(dx) < 2 * Math.abs(dy)) return;
  _ocTextColorIdx = (_ocTextColorIdx + (dx > 0 ? -1 : 1) + _ocTextColors.length) % _ocTextColors.length;
  overlayChatStyle.fill = _ocTextColors[_ocTextColorIdx];
  overlayChat.children.forEach(child => {
    if (child instanceof PIXI.Text) child.style.fill = _ocTextColors[_ocTextColorIdx];
  });
}, { passive: true });
myCanvas.addEventListener('wheel', e => {
  if (!useOverlayChat) return;
  e.preventDefault();
  const isHoriz = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
  if (isHoriz) {
    const delta = e.shiftKey ? e.deltaY : e.deltaX;
    if (Math.abs(delta) < 5) return;
    _ocTextColorIdx = (_ocTextColorIdx + (delta > 0 ? 1 : -1) + _ocTextColors.length) % _ocTextColors.length;
    overlayChatStyle.fill = _ocTextColors[_ocTextColorIdx];
    overlayChat.children.forEach(child => {
      if (child instanceof PIXI.Text) child.style.fill = _ocTextColors[_ocTextColorIdx];
    });
  } else {
    const rect = myCanvas.getBoundingClientRect();
    overlayChat.y = Math.min(0, overlayChat.y - e.deltaY * (460 / rect.height));
  }
}, { passive: false });

_setBtnState(wa_i, "red");
wa_i.addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  e.preventDefault(); // テキスト選択やドラッグ開始を防ぐ
  clickedWa_iButtun = !clickedWa_iButtun;
  _setBtnState(wa_i, clickedWa_iButtun ? 'skyblue' : 'red');
});

document.addEventListener('keydown', e => {
  if (e.key === 'F12') {
    const el = document.getElementById('devEditSection');
    if (el) el.style.display = el.style.display === 'none' ? '' : 'none';
  }
});

//お絵描き用のシステム
// ===== 床ポリゴン作成ツール =====
const _uiReverseColorMap = { '#f0a0c0': 'red', '#60c8e8': 'skyblue', '#888888': 'gray' };
function _applyUiModeToButtons() {
  document.querySelectorAll('#switchBar button').forEach(btn => {
    if (uiNewMode) {
      const bg = btn.style.backgroundColor;
      if (bg) {
        const c = _uiColorMap[bg] || bg;
        btn.style.color = c;
        btn.style.borderColor = c;
        btn.style.backgroundColor = '';
      }
    } else {
      const c = btn.style.color;
      for (const p of _newUiInlineProps) btn.style[p] = '';
      if (c) { btn.style.backgroundColor = _uiReverseColorMap[c] || c; }
    }
  });
}
const _uiNewModeChk = document.getElementById('uiNewModeChk');
if (_uiNewModeChk) {
  _uiNewModeChk.checked = !uiNewMode;
  _uiNewModeChk.addEventListener('change', e => {
    uiNewMode = !e.target.checked;
    localStorage.setItem('uiMode', uiNewMode ? 'new' : 'old');
    document.body.classList.toggle('ui-new', uiNewMode);
    _applyUiModeToButtons();
  });
}

document.getElementById('showCoordChk').addEventListener('change', e => {
  showCoord = e.target.checked;
  localStorage.setItem("showCoord", showCoord);
  if (window._coordText) window._coordText.visible = showCoord;
  if (window._mouseText) window._mouseText.visible = showCoord;
});

let floorPolyMode = false;
let floorPolyVerts = [];
let floorPolyGraphics = null;
let floorPolyLastClickTime = 0;

document.getElementById('floorPolyBtn').addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  e.preventDefault();
  floorPolyMode = !floorPolyMode;
  e.currentTarget.style.backgroundColor = floorPolyMode ? 'lime' : '';
  floorPolyVerts = [];
  if (!floorPolyGraphics) {
    floorPolyGraphics = new PIXI.Graphics();
    floorPolyGraphics.zIndex = 1002;
    app.stage.addChild(floorPolyGraphics);
  }
  floorPolyGraphics.clear();
});

myCanvas.addEventListener('click', e => {
  if (!floorPolyMode) return;
  e.stopPropagation();

  const rect = myCanvas.getBoundingClientRect();
  const scaleX = 660 / rect.width;
  const scaleY = 460 / rect.height;
  let x = Math.round((e.clientX - rect.left) * scaleX);
  let y = Math.round((e.clientY - rect.top) * scaleY);

  // 画面端スナップ(±5px)
  if (x < 5) x = 0; else if (x > 655) x = 660;
  if (y < 5) y = 0; else if (y > 455) y = 460;

  // ダブルクリックで確定
  const now = Date.now();
  const isDbl = now - floorPolyLastClickTime < 300;
  floorPolyLastClickTime = now;
  if (isDbl && floorPolyVerts.length >= 3) {
    const flat = floorPolyVerts.flatMap(v => [v.x, v.y]);
    outputChatMsg('床Poly(flat): ' + JSON.stringify(flat), 'lime');
    outputChatMsg('床Poly([[x,y]]): ' + JSON.stringify(floorPolyVerts.map(v => [v.x, v.y])), 'lime');
    floorPolyVerts = [];
    floorPolyGraphics.clear();
    return;
  }

  floorPolyVerts.push({ x, y });

  // プレビュー再描画
  floorPolyGraphics.clear();
  floorPolyGraphics.lineStyle(0);
  for (const v of floorPolyVerts) {
    floorPolyGraphics.beginFill(0xffff00).drawCircle(v.x, v.y, 4).endFill();
  }
  if (floorPolyVerts.length >= 2) {
    floorPolyGraphics.lineStyle(2, 0xffff00, 1);
    floorPolyGraphics.moveTo(floorPolyVerts[0].x, floorPolyVerts[0].y);
    for (let i = 1; i < floorPolyVerts.length; i++) {
      floorPolyGraphics.lineTo(floorPolyVerts[i].x, floorPolyVerts[i].y);
    }
    floorPolyGraphics.lineStyle(1, 0xffff00, 0.4);
    floorPolyGraphics.lineTo(floorPolyVerts[0].x, floorPolyVerts[0].y);
  }
});

// 部屋編集パネル
// ===== 部屋編集パネル =====
let imgEditRoomId = '';
let imgEditPassword = '';
let _imgDragMode = false;
const _imgOverlays = []; // {imgData, sprite, borderGfx, handleGfx}
let _imgDragging = null;
let _imgDragPending = null;
let _imgDoodleMode = false;
let _replaceImgData = null;
let _imgDoodleGfx = null;
let _imgDoodleDrawingGfx = null;
const _imgDoodleHistory = [];
const _imgDoodleRedoStack = [];
let _imgDoodleCurrentLine = null;
let codeEditRoomId = '';
let codeEditPassword = '';
let _roomEditLockToken = '';
let _roomEditLockHeartbeat = null;
let _isNewRoomMode = false;
let _newRoomGateIndex = -1;
let _newRoomParentDirection = null;
let _prevRoomName = '';
let _originalRoomName = '';
let _originalBgColor = '#ffffff';
let _originalAllowVideo = 1;
let _originalAllowAudio = 1;
let _pendingOpenEditPanel = false;
let _pendingRoomName = '';
const _sessionRoomPasswords = new Map(); // ログアウトまでパスワード不要にするキャッシュ

const CODE_RULES = `【猫街 カスタムコード ルール】
- 実行環境: ブラウザ上の iframe (sandbox="allow-scripts allow-same-origin")
- 利用可能なオブジェクト:
    parent.PIXI      … PIXI.js 本体
    parent.app       … PIXI.Application インスタンス
    parent.customStage … 専用コンテナ (zIndex=500, 部屋入室ごとに再生成)
- 描画は parent.customStage に追加すること（app.stage は直接触らない）
- ループは app.ticker.add() を使う。ループ内では重い処理を避ける
- テキスト: new parent.PIXI.Text("文字", { fill: 0xffffff })
- 図形: new parent.PIXI.Graphics() で beginFill/drawRect/drawCircle 等
- 画像: parent.PIXI.Texture.from(URL) で読み込み
- 部屋退室時に customStage は自動破棄される（addEventListener は使わない）
- エラーは parent.postMessage({error: "..."}, "*") で通知される

【AIへのプロンプト用テンプレート】
「猫街というゲームのカスタムコードを書いてください。
利用可能: parent.PIXI, parent.app, parent.customStage
ルール: customStageに追加、ループはapp.ticker.add()、部屋サイズは660×460px
やりたいこと: [ここに説明]」`;

const CODE_SAMPLE = `// テストコード: 画面中央でカラフルな円が回転するサンプル
const PIXI = parent.PIXI;
const stage = parent.customStage;

const circles = [];
for (let i = 0; i < 8; i++) {
  const g = new PIXI.Graphics();
  const color = [0xff4444,0xff8800,0xffff00,0x44ff44,0x00ffff,0x4488ff,0xff44ff,0xffffff][i];
  g.beginFill(color, 0.8);
  g.drawCircle(0, 0, 18);
  g.endFill();
  g.x = 330 + Math.cos(i / 8 * Math.PI * 2) * 80;
  g.y = 230 + Math.sin(i / 8 * Math.PI * 2) * 80;
  stage.addChild(g);
  circles.push(g);
}

let angle = 0;
const ticker = parent.app.ticker.add(() => {
  angle += 0.02;
  circles.forEach((g, i) => {
    g.x = 330 + Math.cos(angle + i / 8 * Math.PI * 2) * 80;
    g.y = 230 + Math.sin(angle + i / 8 * Math.PI * 2) * 80;
  });
});`;

function _openRoomPanel() {
  const mainLogEl = document.getElementById('mainLog');
  const panel = document.getElementById('roomEditPanel');
  panel.style.height = mainLogEl.offsetHeight + 'px';
  mainLogEl.style.display = 'none';
  panel.style.display = 'block';
}

function _closeRoomPanel() {
  document.getElementById('roomEditPanel').style.display = 'none';
  const _elb = document.getElementById('entryLockBtn');
  if (_elb) _elb.style.display = 'none';
  document.getElementById('mainLog').style.display = '';
  _originalRoomName = '';
  _pendingDeletes.clear();
  _pendingWarpDeletes.clear();
  _pendingImgAdds.clear();
  _pendingWarpAdds.clear();
  _isNewRoomMode = false;
  _newRoomParentDirection = null;
  socket.emit('endRoomEdit');
  _releaseRoomEditLock();
  stopWarpGlow();
  _disableWarpEditMode();
  _stopImgDoodleMode();
  _clearImgDoodle();
  _disableImgEditMode();
}

async function _acquireRoomEditLock(roomId, pw) {
  try {
    const res = await fetch('/api/rooms/' + encodeURIComponent(roomId) + '/lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Edit-Password': pw },
      body: JSON.stringify({ editPassword: pw }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return { ok: false, error: d.error || 'ロック取得失敗' };
    }
    const d = await res.json();
    _roomEditLockToken = d.lockToken;
    // 2分ごとにハートビート
    _roomEditLockHeartbeat = setInterval(async () => {
      try {
        await fetch('/api/rooms/' + encodeURIComponent(roomId) + '/lock', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Lock-Token': _roomEditLockToken },
          body: JSON.stringify({ lockToken: _roomEditLockToken }),
        });
      } catch (_e) {}
    }, 45 * 1000);
    return { ok: true };
  } catch (_e) {
    return { ok: false, error: '通信エラー' };
  }
}

async function _releaseRoomEditLock() {
  if (_roomEditLockHeartbeat) { clearInterval(_roomEditLockHeartbeat); _roomEditLockHeartbeat = null; }
  if (!_roomEditLockToken || !warpEditRoomId) return;
  try {
    await fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId) + '/lock', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'X-Lock-Token': _roomEditLockToken },
      body: JSON.stringify({ lockToken: _roomEditLockToken }),
    });
  } catch (_e) {}
  _roomEditLockToken = '';
}

async function _openRoomEditPanelDirect(roomId, pw) {
  _openRoomPanel();
  document.getElementById('gateCreateSection').style.display = 'none';
  document.getElementById('roomEditSection').style.display = 'block';
  document.getElementById('roomEditRoomIdDisplay').textContent = roomId;
  document.getElementById('roomEditPw').value = pw;
  document.getElementById('roomEditErr').textContent = '編集パネルを読み込み中...';
  document.getElementById('roomEditMain').style.display = 'none';
  document.getElementById('roomDeleteConfirm').style.display = 'none';
  document.getElementById('codeRulesBox').textContent = CODE_RULES;


  // デフォルトタブを ImgWarp に設定
  ['ImgWarp', 'Code', 'Options'].forEach(t => {
    const active = t === 'ImgWarp';
    document.getElementById('roomEditTab' + t).style.background = active ? '#1a3a6a' : '#0d0d1a';
    document.getElementById('roomEditTab' + t).style.color = active ? '#fff' : '#888';
    document.getElementById('roomEditContent' + t).style.display = active ? 'block' : 'none';
  });
  if (!window._allRooms) {
    fetch('/api/rooms').then(r => r.ok ? r.json() : []).then(d => { window._allRooms = d; }).catch(() => { window._allRooms = []; });
  }

  warpEditRoomId = roomId;
  warpEditPassword = pw;
  imgEditRoomId = roomId;
  imgEditPassword = pw;
  codeEditRoomId = roomId;
  codeEditPassword = pw;
  _scaleZoneEditRoomId = roomId;
  _sessionRoomPasswords.set(roomId, pw);

  const displayName = _pendingRoomName || '';
  let suffixedName = displayName;
  if (displayName && !_isNewRoomMode) {
    try {
      const _allR = await fetch('/api/rooms').then(r => r.ok ? r.json() : []).catch(() => []);
      const _same = _allR.filter(r => r.name === displayName);
      if (_same.length > 1) {
        const _idx = _same.findIndex(r => r.id === roomId);
        if (_idx > 0) suffixedName = displayName + (_idx + 1);
      }
    } catch (_e) {}
  }
  _originalRoomName = suffixedName;
  document.getElementById('roomNameEditInput').value = suffixedName;
  if (_isNewRoomMode) setTimeout(() => document.getElementById('roomNameEditInput').focus(), 50);

  const _authFetch = fetch('/api/rooms/' + encodeURIComponent(roomId) + '/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': pw },
    body: JSON.stringify({ editPassword: pw }),
  });

  let codeRes = null, authRes = null;
  loadDbImages(roomId).then(() => { if (warpEditRoomId === roomId) updateWarpList(); });
  if (_isNewRoomMode) {
    const [lockResult, , _authRes] = await Promise.all([
      _acquireRoomEditLock(roomId, pw),
      loadDbWarpZones(roomId).then(() => { updateWarpList(); _enableWarpEditMode(); refreshImgList(); }),
      _authFetch,
    ]);
    if (!lockResult.ok) { document.getElementById('roomEditErr').textContent = lockResult.error; return; }
    authRes = _authRes;
  } else {
    const [lockResult, , _codeRes, _authRes] = await Promise.all([
      _acquireRoomEditLock(roomId, pw),
      loadDbWarpZones(roomId).then(() => { updateWarpList(); _enableWarpEditMode(); refreshImgList(); }),
      fetch('/api/rooms/' + encodeURIComponent(roomId) + '/code'),
      _authFetch,
    ]);
    if (!lockResult.ok) { document.getElementById('roomEditErr').textContent = lockResult.error; return; }
    codeRes = _codeRes;
    authRes = _authRes;
  }

  socket.emit('startRoomEdit', { roomId, isNew: _isNewRoomMode });

  if (codeRes && codeRes.ok) {
    const d = await codeRes.json();
    document.getElementById('codeEditor').value = d.custom_code || '';
    document.getElementById('codeMsg').textContent = '';
  }

  try {
    if (authRes && authRes.ok) {
      const authData = await authRes.json();
      const bgInput = document.getElementById('bgColorInput');
      let bgColor = authData.background_color || null;
      if (!bgColor && _isNewRoomMode) {
        const raw = localStorage.getItem('colorCode');
        if (raw) {
          if (raw.startsWith('#')) {
            bgColor = raw;
          } else {
            const num = parseColorCode(raw);
            if (num) bgColor = '#' + num.toString(16).padStart(6, '0');
          }
        }
      }
      bgColor = bgColor || '#ffffff';
      if (bgInput) bgInput.value = bgColor;
      _originalBgColor = bgColor;
      _applyRoomBgColor(bgColor);
      if (_isNewRoomMode && !authData.background_color) {
        fetch('/api/rooms/' + encodeURIComponent(roomId), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Edit-Password': pw, 'X-Lock-Token': _roomEditLockToken },
          body: JSON.stringify({ background_color: bgColor }),
        }).catch(() => {});
      }
      _originalAllowVideo = authData.allow_video !== 0 ? 1 : 0;
      _originalAllowAudio = authData.allow_audio !== 0 ? 1 : 0;
      const allowVideoChk = document.getElementById('allowVideoChk');
      if (allowVideoChk) allowVideoChk.checked = _originalAllowVideo !== 0;
      const allowAudioChk = document.getElementById('allowAudioChk');
      if (allowAudioChk) allowAudioChk.checked = _originalAllowAudio !== 0;
      const _streamingNow = videoStatus || audioStatus ||
        Object.keys(videoButton).some(tk => videoButton[tk] && videoButton[tk].style.visibility !== 'hidden') ||
        Object.keys(audioButton).some(tk => audioButton[tk] && audioButton[tk].style.visibility !== 'hidden');
      const _streamLockMsg = document.getElementById('streamPermLockMsg');
      if (allowVideoChk) allowVideoChk.disabled = _streamingNow;
      if (allowAudioChk) allowAudioChk.disabled = _streamingNow;
      if (_streamLockMsg) _streamLockMsg.style.display = _streamingNow ? '' : 'none';
      const lifetimeMsg = document.getElementById('roomLifetimeMsg');
      if (lifetimeMsg) {
        const lh = authData.lifetime_hours;
        if (lh === 0) {
          lifetimeMsg.textContent = '';
        } else {
          const days = Math.round((lh ?? 24) / 24);
          const _areaMap = { '東の部屋': '東', '南の部屋': '南', '西の部屋': '西', '北の部屋': '北' };
          const _area = _areaMap[authData.parent_direction] || authData.parent_direction || '';
          lifetimeMsg.textContent = '⚠ ' + (_area ? _area + 'エリアの' : '') + '部屋は' + days + '日誰も出入りがなかったら消えます。';
        }
      }
    }
  } catch (_e) {}

  document.getElementById('roomEditMain').style.display = 'block';
  document.getElementById('roomEditErr').textContent = '';
  if (_imgTabIsActive()) _enableImgEditMode();
  if (!_isNewRoomMode) {
    const _elb = document.getElementById('entryLockBtn');
    if (_elb) _elb.style.display = '';
  }
}

async function openRoomEditPanel() {
  const roomId = room ? room.name : '';

  let pw = '';
  try {
    const info = await fetch('/api/rooms/' + encodeURIComponent(roomId)).then(r => r.ok ? r.json() : {});
    if (info.name) _pendingRoomName = info.name;
    if (info.has_password) {
      // パスワード設定済み部屋は毎回プロンプト
      pw = await _showRoomPwPrompt();
      if (pw === null) return;
    } else {
      // パスワード未設定はセッションキャッシュを使って再fetch不要に
      pw = _sessionRoomPasswords.get(roomId) || '';
    }
  } catch (_e) {
    pw = _sessionRoomPasswords.get(roomId) || '';
  }

  _openRoomEditPanelDirect(roomId, pw);
}

document.getElementById('roomEditMenu').addEventListener('click', () => {
  contextMenu.style.display = 'none';
  openRoomEditPanel();
});



document.getElementById('roomEditPwToggle').addEventListener('click', () => {
  const inp = document.getElementById('roomEditPw');
  inp.type = inp.type === 'password' ? 'text' : 'password';
});

// パスワード欄でEnterキー → 即座にDBに保存
document.getElementById('roomEditPw').addEventListener('keydown', async e => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  await _saveRoomPasswordIfChanged();
});

// 部屋名を保存する共通処理（変更なしなら何もせず true を返す）
async function _saveRoomNameIfChanged() {
  const newName = document.getElementById('roomNameEditInput').value.trim();
  if (!warpEditRoomId) return false;
  if (!newName) {
    document.getElementById('roomEditErr').textContent = '部屋名を入力してください';
    document.getElementById('roomNameEditInput').focus();
    return false;
  }
  if (newName === _originalRoomName) return true;
  const allRooms = await fetch('/api/rooms').then(r => r.ok ? r.json() : []).catch(() => []);
  if (allRooms.find(r => r.name === newName && r.id !== warpEditRoomId)) {
    document.getElementById('roomEditErr').textContent = '同名の部屋があります';
    return false;
  }
  const res = await fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId) + '/', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword, 'X-Lock-Token': _roomEditLockToken },
    body: JSON.stringify({ name: newName }),
  });
  if (res.ok) {
    _originalRoomName = newName;
    socket.emit('confirmRoomEdit');
    if (_isNewRoomMode && _newRoomGateIndex >= 0) {
      const mg = document.querySelector('#mugenGateBtn' + _newRoomGateIndex);
      if (mg) mg.textContent = newName;
    }
    return true;
  } else {
    const d = await res.json().catch(() => ({}));
    alert(d.error || '保存失敗');
    return false;
  }
}

// 保存せずに戻る
document.getElementById('roomEditCloseBtn').addEventListener('click', async () => {
  document.getElementById('roomEditDiscardBtn').click();
});

document.getElementById('roomEditDiscardBtn').addEventListener('click', async () => {
  if (_isNewRoomMode && _newRoomGateIndex >= 0) {
    try {
      if (_newRoomParentDirection) {
        await fetch('/api/direction/' + encodeURIComponent(_newRoomParentDirection) + '/gates/' + _newRoomGateIndex, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creatorToken: myToken }),
        });
        if (directionGateRooms[_newRoomParentDirection]) directionGateRooms[_newRoomParentDirection][_newRoomGateIndex] = null;
        updateDirectionGateTints(_newRoomParentDirection);
      } else {
        await fetch('/api/mugen/gates/' + _newRoomGateIndex, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creatorToken: myToken }),
        });
        mugenGateRooms[_newRoomGateIndex] = null;
        updateMugenGateTints();
      }
    } catch (_e) {}
    const prevRoom = _prevRoomName;
    _isNewRoomMode = false;
    _newRoomGateIndex = -1;
    _newRoomParentDirection = null;
    _prevRoomName = '';
    _pendingRoomName = '';
    _applyRoomBgColor(_originalBgColor);
    socket.emit('roomBgColorChanged', { color: _originalBgColor });
    _applyStreamButtonVisibility(_originalAllowVideo, _originalAllowAudio);
    socket.emit('roomPermissionsChanged', { allow_video: _originalAllowVideo, allow_audio: _originalAllowAudio });
    await _discardImgChanges();
    _closeRoomPanel();
    stopWarpPlaceMode();
    _notifyRoomAssetsChanged();
    goSelfToRoomSpot(_roomToSpot(prevRoom));
  } else {
    _isNewRoomMode = false;
    _applyRoomBgColor(_originalBgColor);
    socket.emit('roomBgColorChanged', { color: _originalBgColor });
    _applyStreamButtonVisibility(_originalAllowVideo, _originalAllowAudio);
    socket.emit('roomPermissionsChanged', { allow_video: _originalAllowVideo, allow_audio: _originalAllowAudio });
    await _discardImgChanges();
    await loadDbWarpZones(warpEditRoomId);
    _closeRoomPanel();
    stopWarpPlaceMode();
    _notifyRoomAssetsChanged();
  }
});

async function _saveRoomPasswordIfChanged() {
  if (!warpEditRoomId) return;
  const newPw = document.getElementById('roomEditPw').value;
  if (newPw === warpEditPassword) return;
  const res = await fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword, 'X-Lock-Token': _roomEditLockToken },
    body: JSON.stringify({ newEditPassword: newPw }),
  });
  if (res.ok) {
    warpEditPassword = newPw;
    imgEditPassword = newPw;
    codeEditPassword = newPw;
    _sessionRoomPasswords.set(warpEditRoomId, newPw);
  }
}

function _checkWarpAreaLimit() {
  const ROOM_AREA = 660 * 460;
  const totalArea = dbWarpZones.filter(wz => !_pendingWarpDeletes.has(wz.id)).reduce((sum, wz) => {
    const w = wz.width ?? 0, h = wz.height ?? wz.width ?? 0;
    return sum + (wz.shape === 'circle' ? Math.PI * w * w : w * h);
  }, 0);
  if (totalArea > ROOM_AREA * 2 / 3) {
    document.getElementById('roomEditErr').textContent = 'ワープゾーンの合計面積が部屋の2/3を超えています';
    return false;
  }
  return true;
}

function _checkPlatformWarpValidity() {
  const pz = _getPlatformZones();
  if (!pz) return true;
  const bad = dbWarpZones.some(wz =>
    !pz.some(z => {
      const r = z.rect;
      return wz.x < r.x + r.w && wz.x + (wz.width || wz.height || 0) > r.x &&
        wz.y < r.y + r.h && wz.y + (wz.height || wz.width || 0) > r.y;
    })
  );
  if (bad) {
    document.getElementById('roomEditErr').textContent = '出入口は足場に置くようにしてください';
    return false;
  }
  return true;
}

// 保存（パネルは閉じない）
document.getElementById('roomEditSaveBtn').addEventListener('click', async () => {
  if (document.getElementById('roomEditMain').style.display === 'none') return;
  if (!_checkWarpAreaLimit()) return;
  if (!_checkPlatformWarpValidity()) return;
  const ok = await _saveRoomNameIfChanged();
  if (!ok) return;
  await _saveRoomPasswordIfChanged();
  await _saveRoomOptions();
  await _saveImgPositions();
  await _saveWarpPositions();
  await _commitPendingDeletes();
  await _commitPendingWarpDeletes();
  _pendingImgAdds.clear();
  _pendingWarpAdds.clear();
  socket.emit('clearPendingAdds');
  _isNewRoomMode = false;
  socket.emit('roomAssetsChanged', null);
  document.getElementById('roomEditErr').textContent = '';
  if (_scaleZoneEditRoomId || warpEditRoomId) await _saveRoomScale();
});

// 完了（保存してパネルを閉じる）
document.getElementById('roomEditCompleteBtn').addEventListener('click', async () => {
  if (document.getElementById('roomEditMain').style.display !== 'none') {
    const hasImg = ['imgListBackground', 'imgListPlatform', 'imgListObject'].some(id => document.getElementById(id).children.length > 0);
    const hasCode = document.getElementById('codeEditor').value.trim().length > 0;
    if (!hasImg && !hasCode) {
      document.getElementById('roomEditErr').textContent = '画像またはコードを追加してください';
      return;
    }
    if (!_checkWarpAreaLimit()) return;
    if (!_checkPlatformWarpValidity()) return;
    const ok = await _saveRoomNameIfChanged();
    if (!ok) return;
    await _saveRoomPasswordIfChanged();
    await _saveRoomOptions();
    await _saveImgPositions();
    await _saveWarpPositions();
    await _commitPendingDeletes();
    await _commitPendingWarpDeletes();
    _pendingImgAdds.clear();
    _pendingWarpAdds.clear();
    socket.emit('clearPendingAdds');
    if (_scaleZoneEditRoomId || warpEditRoomId) await _saveRoomScale();
  }
  _isNewRoomMode = false;
  _newRoomParentDirection = null;
  _pendingRoomName = '';
  socket.emit('roomAssetsChanged', null);
  _closeRoomPanel();
  stopWarpPlaceMode();
});

// タブ切り替え（3タブ構成: ImgWarp / Code / Options）
['ImgWarp', 'Code', 'Options'].forEach(tab => {
  document.getElementById('roomEditTab' + tab).addEventListener('click', () => {
    ['ImgWarp', 'Code', 'Options'].forEach(t => {
      const active = t === tab;
      document.getElementById('roomEditTab' + t).style.background = active ? '#1a3a6a' : '#0d0d1a';
      document.getElementById('roomEditTab' + t).style.color = active ? '#fff' : '#888';
      document.getElementById('roomEditContent' + t).style.display = active ? 'block' : 'none';
    });
    if (tab === 'ImgWarp') { startWarpGlow(); _enableWarpEditMode(); _enableImgEditMode(); }
    else { stopWarpGlow(); _disableWarpEditMode(); _disableImgEditMode(); }
    if (tab === 'Options') {
      _scaleZoneEditRoomId = warpEditRoomId;
      updateScaleZoneList();
      const slider = document.getElementById('roomScaleSlider');
      const input = document.getElementById('roomScaleInput');
      if (slider) slider.value = _roomAvatarScale;
      if (input) input.value = _roomAvatarScale;
      if (_scaleZoneGfx) _scaleZoneGfx.visible = false;
      _enableScaleZoneEditMode();
    } else {
      _scaleZonePlaceMode = false;
      _scaleZonePlaceStart = null;
      if (_scaleZonePlacePreview) _scaleZonePlacePreview.clear();
      document.getElementById('scaleZonePlaceBtn').style.display = '';
      document.getElementById('scaleZonePlaceStopBtn').style.display = 'none';
      if (_scaleZoneGfx) _scaleZoneGfx.visible = false;
      _disableScaleZoneEditMode();
    }
  });
});

// ワープ光るアニメーション
let _warpGlowTicker = null;
function startWarpGlow() {
  return;
}
function stopWarpGlow() {
  if (_warpGlowTicker) { app.ticker.remove(_warpGlowTicker); _warpGlowTicker = null; }
}

// warpShape ボタンは新UIでは各ワープ行内の □/○ アイコンに移行済み

function _calcNewWarpPos(defaultW = 30, defaultH = 30) {
  let x = 20, y = 20;
  const step = defaultW + 6;
  for (let attempt = 0; attempt < 100; attempt++) {
    const overlap = dbWarpZones.some(wz =>
      Math.abs(wz.x - x) < defaultW && Math.abs(wz.y - y) < defaultH
    );
    if (!overlap) return { x, y };
    x += step;
    if (x + defaultW > 640) { x = 20; y += step; }
  }
  return { x: 20, y: 20 };
}

let _targetWarpZone = null;
let _targetWarpZoneIdx = null;

async function _applyWarpImgToTarget(base64, filename, sampleUrl) {
  if (!_targetWarpZone) return;
  const wz = _targetWarpZone;
  const wzIdx = _targetWarpZoneIdx;
  const body = sampleUrl ? { sampleUrl } : { imageBase64: base64, filename };
  const res = await fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId) + '/warps/' + wz.id + '/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword },
    body: JSON.stringify(body),
  });
  if (!res.ok) { const d = await res.json().catch(() => ({})); alert(d.error || '失敗'); return; }
  const d = await res.json();
  wz.custom_image_url = d.url;
  const rowEl = document.querySelector('#warpList [data-warp-id="' + wz.id + '"]');
  if (rowEl) {
    const t = rowEl.querySelector('img');
    if (t) t.src = d.url;
    const nameEl = rowEl.querySelectorAll('span span')[1];
    if (nameEl) nameEl.textContent = d.url.split('/').pop().replace(/\.[^.]+$/, '');
  }
  if (wzIdx >= 0) { const s = _warpGateSprites[wzIdx]; if (s) PIXI.Assets.load(d.url).then(tex => { s.texture = tex; }); }
  _notifyRoomAssetsChanged();
}

function _openWarpImgFilePicker() {
  if (!_targetWarpZone) return;
  const fi = document.getElementById('warpImgFileInput');
  fi.value = '';
  const handler = async () => {
    fi.removeEventListener('change', handler);
    if (!fi.files[0]) return;
    const file = fi.files[0];
    const reader = new FileReader();
    reader.onload = async e => { await _applyWarpImgToTarget(e.target.result, file.name, null); };
    reader.readAsDataURL(file);
  };
  fi.addEventListener('change', handler);
  fi.click();
}

async function _addNewWarpWithImage(base64, filename, sampleUrl) {
  if (!warpEditRoomId) return;
  const { x, y } = _calcNewWarpPos(100, 100);
  const errEl = document.getElementById('warpDelErr');
  if (errEl) errEl.textContent = '';
  const res = await fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId) + '/warps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword },
    body: JSON.stringify({ shape: 'rect', x, y, width: 100, height: 100, visual_opacity: 0.2 }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    if (errEl) errEl.textContent = d.error || '追加失敗';
    return;
  }
  const { id } = await res.json();
  _pendingWarpAdds.add(id);
  socket.emit('pendingAddWarp', { id });
  let _warpImgUrl = null;
  if (base64 || sampleUrl) {
    const body = sampleUrl ? { sampleUrl } : { imageBase64: base64, filename };
    const imgRes = await fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId) + '/warps/' + id + '/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword },
      body: JSON.stringify(body),
    }).catch(() => null);
    if (imgRes && imgRes.ok) { const d = await imgRes.json().catch(() => ({})); _warpImgUrl = d.url || null; }
  }
  const wasInEditMode = _warpDragMode;
  const _newWarpList0 = [...dbWarpZones, { id, room_id: warpEditRoomId, target_room_id: null, shape: 'rect', x, y, width: 100, height: 100, visual_opacity: 0.2, warp_type: 'normal', color: null, custom_image_url: _warpImgUrl, sort_order: dbWarpZones.length }];
  clearWarpZones(); dbWarpZones = _newWarpList0;
  _disableWarpEditMode();
  updateWarpList();
  drawWarpZones();
  if (wasInEditMode) _enableWarpEditMode();
  _notifyRoomAssetsChanged();
}

document.getElementById('warpImgUploadBtn')?.addEventListener('click', () => {
  if (!warpEditRoomId) return;
  const fi = document.getElementById('warpImgFileInput');
  fi.value = '';
  const handler = async () => {
    fi.removeEventListener('change', handler);
    if (!fi.files[0]) return;
    const file = fi.files[0];
    const reader = new FileReader();
    reader.onload = async e => { await _addNewWarpWithImage(e.target.result, file.name, null); };
    reader.readAsDataURL(file);
  };
  fi.addEventListener('change', handler);
  fi.click();
});

document.getElementById('warpDoodleBtn')?.addEventListener('click', () => {
  if (!warpEditRoomId) return;
  _triggerImgDoodle('object');
  const btn = document.getElementById('doodleSaveBtn');
  if (btn._warpOverride) btn.removeEventListener('click', btn._warpOverride);
  const saveHandler = async () => {
    btn.removeEventListener('click', saveHandler);
    btn._warpOverride = null;
    const canvas = document.getElementById('doodleCanvas');
    await _addNewWarpWithImage(canvas.toDataURL('image/png'), 'doodle.png', null);
    _stopImgDoodleMode();
  };
  btn._warpOverride = saveHandler;
  btn.addEventListener('click', saveHandler);
});

document.getElementById('warpAddBtn')?.addEventListener('click', async () => {
  if (!warpEditRoomId) return;
  const { x, y } = _calcNewWarpPos(30, 30);
  const errEl = document.getElementById('warpDelErr');
  if (errEl) errEl.textContent = '';
  const res = await fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId) + '/warps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword },
    body: JSON.stringify({ warp_type: 'normal', shape: 'rect', x, y, width: 30, height: 30, visual_opacity: 0.2 }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    if (errEl) errEl.textContent = d.error || '追加失敗';
    return;
  }
  const wd = await res.json().catch(() => ({}));
  if (wd.id) {
    _pendingWarpAdds.add(wd.id);
    socket.emit('pendingAddWarp', { id: wd.id });
    const _newWarpList2 = [...dbWarpZones, { id: wd.id, room_id: warpEditRoomId, target_room_id: null, shape: 'rect', x, y, width: 30, height: 30, visual_opacity: 0.2, warp_type: 'normal', color: null, custom_image_url: null, sort_order: dbWarpZones.length }];
    clearWarpZones(); dbWarpZones = _newWarpList2;
  }
  updateWarpList();
  drawWarpZones();
});

document.getElementById('warpPlaceBtn').addEventListener('click', () => {
  _disableWarpEditMode();
  startWarpPlaceMode();
  document.getElementById('warpPlaceBtn').style.display = 'none';
  document.getElementById('warpPlaceStopBtn').style.display = '';
});

document.getElementById('warpPlaceStopBtn').addEventListener('click', () => {
  stopWarpPlaceMode();
  document.getElementById('warpPlaceStopBtn').style.display = 'none';
  document.getElementById('warpPlaceBtn').style.display = '';
  _enableWarpEditMode();
});

// ===== スケールタブ =====

const _roomScaleSlider = document.getElementById('roomScaleSlider');
const _roomScaleInput = document.getElementById('roomScaleInput');
_roomScaleSlider.addEventListener('input', () => {
  _roomScaleInput.value = _roomScaleSlider.value;
  _roomAvatarScale = parseFloat(_roomScaleSlider.value) || 1;
});
_roomScaleInput.addEventListener('input', () => {
  _roomScaleSlider.value = _roomScaleInput.value;
  _roomAvatarScale = parseFloat(_roomScaleInput.value) || 1;
});

// 背景色ピッカー
document.getElementById('bgColorInput').addEventListener('input', () => {
  const color = document.getElementById('bgColorInput').value;
  _applyRoomBgColor(color);
  if (!_isNewRoomMode) socket.emit('roomBgColorChanged', { color });
});
document.getElementById('bgColorInput').addEventListener('change', () => {
  const color = document.getElementById('bgColorInput').value;
  _applyRoomBgColor(color);
  if (!_isNewRoomMode) socket.emit('roomBgColorChanged', { color });
});

async function _saveImgPositions() {
  if (!imgEditRoomId) return;
  await Promise.all(dbRoomImages.map(img =>
    fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images/' + img.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Edit-Password': imgEditPassword },
      body: JSON.stringify({ x: img.x, y: img.y, width: img.width, height: img.height }),
    }).catch(() => {})
  ));
}

async function _saveWarpPositions() {
  if (!warpEditRoomId) return;
  await Promise.all(dbWarpZones.map(wz =>
    fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId) + '/warps/' + wz.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword },
      body: JSON.stringify({ x: wz.x, y: wz.y, width: wz.width, height: wz.height }),
    }).catch(() => {})
  ));
}

async function _commitPendingDeletes() {
  if (!_pendingDeletes.size || !imgEditRoomId) return;
  await Promise.all([..._pendingDeletes].map(id =>
    fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images/' + id, {
      method: 'DELETE',
      headers: { 'X-Edit-Password': imgEditPassword },
    }).catch(() => {})
  ));
  _pendingDeletes.clear();
}

async function _commitPendingWarpDeletes() {
  if (!_pendingWarpDeletes.size || !warpEditRoomId) return;
  await Promise.all([..._pendingWarpDeletes].map(id =>
    fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId) + '/warps/' + id, {
      method: 'DELETE',
      headers: { 'X-Edit-Password': warpEditPassword },
    }).catch(() => {})
  ));
  _pendingWarpDeletes.clear();
}

async function _discardImgChanges() {
  if (!imgEditRoomId) return;
  await Promise.all([..._pendingImgAdds].map(id =>
    fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images/' + id, {
      method: 'DELETE',
      headers: { 'X-Edit-Password': imgEditPassword },
    }).catch(() => {})
  ));
  _pendingImgAdds.clear();
  await Promise.all([..._pendingWarpAdds].map(id =>
    fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId) + '/warps/' + id, {
      method: 'DELETE',
      headers: { 'X-Edit-Password': warpEditPassword },
    }).catch(() => {})
  ));
  _pendingWarpAdds.clear();
  _pendingDeletes.clear();
  _pendingWarpDeletes.clear();
  socket.emit('clearPendingAdds');
  await loadDbImages(imgEditRoomId);
}

function _notifyRoomAssetsChanged() {
  if (_isNewRoomMode) return;
  const images = dbRoomImages.filter(img => !_pendingDeletes.has(img.id));
  const warps = dbWarpZones.filter(wz => !_pendingWarpDeletes.has(wz.id));
  socket.emit('roomAssetsChanged', { images, warps });
}

function _applyStreamButtonVisibility(allowV, allowA) {
  const sv = document.getElementById('startVideo');
  const sa = document.getElementById('startAudio');
  const cal = document.getElementById('checkAllListen');
  const _av = allowV !== 0;
  const _aa = allowA !== 0;
  if (sv) sv.style.display = _av ? '' : 'none';
  if (sa) sa.style.display = _aa ? '' : 'none';
  if (cal) cal.style.display = (_av || _aa) ? '' : 'none';
  if (!_av && videoStatus) stopVideo();
  if (!_aa && audioStatus) stopAudio();
}

async function _saveRoomOptions() {
  if (!warpEditRoomId) return;
  const allowV = document.getElementById('allowVideoChk').checked ? 1 : 0;
  const allowA = document.getElementById('allowAudioChk').checked ? 1 : 0;
  await fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword, 'X-Lock-Token': _roomEditLockToken },
    body: JSON.stringify({
      background_color: document.getElementById('bgColorInput').value,
      allowVideo: allowV,
      allowAudio: allowA,
    }),
  });
  _applyStreamButtonVisibility(allowV, allowA);
  socket.emit('roomPermissionsChanged', { allow_video: allowV, allow_audio: allowA });
}

const _broadcastStreamPerms = () => {
  if (_isNewRoomMode) return;
  const av = document.getElementById('allowVideoChk').checked ? 1 : 0;
  const aa = document.getElementById('allowAudioChk').checked ? 1 : 0;
  _applyStreamButtonVisibility(av, aa);
  socket.emit('roomPermissionsChanged', { allow_video: av, allow_audio: aa });
};
document.getElementById('allowVideoChk')?.addEventListener('change', _broadcastStreamPerms);
document.getElementById('allowAudioChk')?.addEventListener('change', _broadcastStreamPerms);

// スケール保存は「保存」「完了」ボタン押時に一括保存（roomScaleSaveBtn は廃止）
async function _saveRoomScale() {
  const s = Math.max(0.01, Math.min(10, parseFloat(_roomScaleInput.value) || 1));
  _roomScaleInput.value = s;
  _roomScaleSlider.value = s;
  await fetch('/api/rooms/' + encodeURIComponent(_scaleZoneEditRoomId || warpEditRoomId), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword },
    body: JSON.stringify({ avatar_scale: s }),
  });
  _roomAvatarScale = s;
}

document.getElementById('scaleZonePlaceBtn').addEventListener('click', async () => {
  await saveScaleZone(280, 190, 100, 80, 1.0);
});

document.getElementById('scaleZonePlaceStopBtn').addEventListener('click', () => {
  _scaleZonePlaceMode = false;
  _scaleZonePlaceStart = null;
  if (_scaleZonePlacePreview) _scaleZonePlacePreview.clear();
  document.getElementById('scaleZonePlaceStopBtn').style.display = 'none';
  document.getElementById('scaleZonePlaceBtn').style.display = '';
});

// ===== 部屋削除 =====

document.getElementById('roomDeleteBtn').addEventListener('click', () => {
  const hasPass = !!warpEditPassword;
  document.getElementById('roomDeletePassWrap').style.display = hasPass ? '' : 'none';
  document.getElementById('roomDeletePassInput').value = '';
  document.getElementById('roomDeleteErr').textContent = '';
  document.getElementById('roomDeleteConfirm').style.display = '';
});
document.getElementById('roomDeleteCancelBtn').addEventListener('click', () => {
  document.getElementById('roomDeleteConfirm').style.display = 'none';
});
document.getElementById('roomDeleteConfirmBtn').addEventListener('click', async () => {
  const roomId = warpEditRoomId;
  const hasPass = !!warpEditPassword;
  const pw = hasPass ? document.getElementById('roomDeletePassInput').value : '';
  if (hasPass && !pw) {
    document.getElementById('roomDeleteErr').textContent = 'パスワードを入力してください';
    return;
  }
  const res = await fetch('/api/rooms/' + encodeURIComponent(roomId), {
    method: 'DELETE',
    headers: { 'X-Edit-Password': pw },
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    const errMsg = d.error || '削除失敗';
    document.getElementById('roomDeleteErr').textContent = errMsg;
    alert(errMsg);
    return;
  }
  socket.emit('roomDeleted', { roomId });
  const gateIdx = mugenGateRooms.indexOf(roomId);
  if (gateIdx !== -1) {
    mugenGateRooms[gateIdx] = null;
    updateMugenGateTints();
  }
  for (const dirRoom of ['東の部屋', '南の部屋', '西の部屋', '北の部屋']) {
    const dg = (directionGateRooms[dirRoom] || []).indexOf(roomId);
    if (dg !== -1) {
      directionGateRooms[dirRoom][dg] = null;
      updateDirectionGateTints(dirRoom);
      break;
    }
  }
  _isNewRoomMode = false;
  _newRoomParentDirection = null;
  _closeRoomPanel();
  stopWarpPlaceMode();
  goSelfToRoomSpot(_prevRoomSpot || 'entranceMainSpot');
});

// ===== 画像タブ =====

// セクション別アップロードボタン（imgType を設定してからファイルダイアログを開く）
function _triggerImgUpload(type) {
  document.getElementById('imgType').value = type;
  document.getElementById('imgFileInput').click();
}
function _triggerImgDoodle(type) {
  document.getElementById('imgType').value = type;
  const area = document.getElementById('doodleArea');
  if (area.style.display === 'none') {
    area.style.display = 'block';
    _disableImgEditMode();
    _startImgDoodleMode();
  } else {
    area.style.display = 'none';
    _stopImgDoodleMode();
    _clearImgDoodle();
    if (_imgTabIsActive()) _enableImgEditMode();
  }
}
document.getElementById('imgUploadBtnBg').addEventListener('click', () => _triggerImgUpload('background'));
document.getElementById('imgUploadBtnPlatform').addEventListener('click', () => _triggerImgUpload('platform'));
document.getElementById('imgUploadBtnObject').addEventListener('click', () => _triggerImgUpload('object'));
document.getElementById('imgDoodleBtnBg').addEventListener('click', () => _triggerImgDoodle('background'));
document.getElementById('imgDoodleBtnPlatform').addEventListener('click', () => _triggerImgDoodle('platform'));
document.getElementById('imgDoodleBtnObject').addEventListener('click', () => _triggerImgDoodle('object'));

let _sampleAddType = 'object';
let _sampleFiles = [];

async function _showSamplePanel(type) {
  const panel = document.getElementById('imgSamplePanel');
  if (panel.style.display !== 'none' && _sampleAddType === type) { panel.style.display = 'none'; return; }
  _sampleAddType = type;
  panel.style.display = 'block';
  if (!_sampleFiles.length) {
    panel.textContent = '読込中...';
    _sampleFiles = await fetch('/api/rooms/sample-list').then(r => r.ok ? r.json() : []).catch(() => []);
  }
  panel.textContent = '';
  if (!_sampleFiles.length) { panel.textContent = 'サンプルなし'; return; }
  _sampleFiles.forEach(fname => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:inline-block;margin:3px;text-align:center;cursor:pointer;vertical-align:top;';
    const imgEl = document.createElement('img');
    imgEl.src = '/img/sample/' + fname;
    imgEl.style.cssText = 'width:60px;height:60px;object-fit:contain;background:#222;border:1px solid #444;display:block;';
    const lbl = document.createElement('div');
    lbl.textContent = fname.replace(/\.[^.]+$/, '');
    lbl.style.cssText = 'font-size:9px;color:#aaa;max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    wrap.addEventListener('click', async () => {
      wrap.style.opacity = '0.5';
      if (_sampleAddType === 'warp') {
        await _addNewWarpWithImage(null, null, '/img/sample/' + fname);
        wrap.style.opacity = '';
        panel.style.display = 'none';
      } else {
        const res = await fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images/from-sample', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Edit-Password': imgEditPassword },
          body: JSON.stringify({ sampleName: fname, type: _sampleAddType }),
        });
        wrap.style.opacity = '';
        if (!res.ok) { const d = await res.json().catch(() => ({})); alert(d.error || '失敗'); return; }
        const sd = await res.json().catch(() => ({}));
        if (sd.id) {
          _pendingImgAdds.add(sd.id);
          socket.emit('pendingAddImg', { id: sd.id });
          const _newImgList1 = [...dbRoomImages, { id: sd.id, room_id: imgEditRoomId, type: _sampleAddType, filename: sd.filename, url: sd.url, x: 0, y: 0, width: null, height: null, z_index: dbRoomImages.length, is_warp: 0 }];
          clearDbImages(); dbRoomImages = _newImgList1; drawDbImages(); await _loadPlatformPixelData();
        }
        panel.style.display = 'none';
        await refreshImgList(true);
        if (_imgTabIsActive()) _enableImgEditMode();
      }
    });
    wrap.appendChild(imgEl);
    wrap.appendChild(lbl);
    panel.appendChild(wrap);
  });
}

document.querySelectorAll('.imgSampleBtn').forEach(btn => {
  btn.addEventListener('click', () => _showSamplePanel(btn.dataset.type));
});

document.getElementById('imgFileInput').addEventListener('change', async () => {
  const fileInput = document.getElementById('imgFileInput');
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async e => {
    const type = document.getElementById('imgType').value;
    let initW = null, initH = null, initX = null, initY = null;
    if (type === 'platform' || type === 'object') {
      await new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, 660 / img.naturalWidth, 460 / img.naturalHeight);
          initW = Math.round(img.naturalWidth * scale);
          initH = Math.round(img.naturalHeight * scale);
          initX = Math.round((660 - initW) / 2);
          initY = Math.round((460 - initH) / 2);
          resolve();
        };
        img.src = e.target.result;
      });
    }
    const res = await fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Edit-Password': imgEditPassword },
      body: JSON.stringify({ type, imageBase64: e.target.result, filename: file.name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'アップロード失敗');
      return;
    }
    const addData = await res.json();
    if (addData.id) {
      _pendingImgAdds.add(addData.id);
      socket.emit('pendingAddImg', { id: addData.id });
      if (initW !== null) {
        await fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images/' + addData.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Edit-Password': imgEditPassword },
          body: JSON.stringify({ x: initX, y: initY, width: initW, height: initH }),
        });
      }
      const _newImgList0 = [...dbRoomImages, { id: addData.id, room_id: imgEditRoomId, type, filename: addData.filename, url: addData.url, x: initX ?? 0, y: initY ?? 0, width: initW ?? null, height: initH ?? null, z_index: dbRoomImages.length, is_warp: 0 }];
      clearDbImages(); dbRoomImages = _newImgList0; drawDbImages(); await _loadPlatformPixelData();
    }
    await refreshImgList(true);
    _disableImgEditMode();
    if (_imgTabIsActive()) _enableImgEditMode();
  };
  reader.readAsDataURL(file);
  fileInput.value = '';
});

// 落書きキャンバス
let _doodleCtx = null;
let _doodleDrawing = false;
let _doodleCount = 1;

(function initDoodleCanvas() {
  const canvas = document.getElementById('doodleCanvas');
  if (!canvas) return;
  _doodleCtx = canvas.getContext('2d');

  // パレット色
  const palette = document.getElementById('doodlePalette');
  const colors = ['#000000','#ffffff','#ff4444','#ff8800','#ffff00','#44cc44','#00ccff','#4488ff','#cc44ff','#ff88cc','#884400','#888888'];
  let currentColor = '#000000';
  colors.forEach(c => {
    const b = document.createElement('div');
    b.style.cssText = `width:18px;height:18px;background:${c};cursor:pointer;border:2px solid ${c === currentColor ? '#fff' : 'transparent'};box-sizing:border-box;`;
    b.addEventListener('click', () => {
      currentColor = c;
      document.getElementById('doodleCustomColor').value = c;
      palette.querySelectorAll('div').forEach(d => d.style.border = '2px solid transparent');
      b.style.border = '2px solid #fff';
    });
    palette.appendChild(b);
  });
  document.getElementById('doodleCustomColor').addEventListener('input', e => { currentColor = e.target.value; });

  const getPos = ev => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = ev.touches ? ev.touches[0] : ev;
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
  };
  const down = ev => {
    ev.preventDefault();
    _doodleDrawing = true;
    const p = getPos(ev);
    _doodleCtx.beginPath();
    _doodleCtx.moveTo(p.x, p.y);
    _doodleCtx.strokeStyle = currentColor;
    _doodleCtx.lineWidth = document.getElementById('doodleLineWidth').value;
    _doodleCtx.lineCap = 'round';
  };
  const move = ev => {
    if (!_doodleDrawing) return;
    ev.preventDefault();
    const p = getPos(ev);
    _doodleCtx.lineTo(p.x, p.y);
    _doodleCtx.stroke();
  };
  const up = () => { _doodleDrawing = false; };
  canvas.addEventListener('mousedown', down);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', up);
  canvas.addEventListener('touchstart', down, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', up);
})();

function _getDoodlePos(e) {
  const rect = myCanvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (660 / rect.width),
    y: (e.clientY - rect.top) * (460 / rect.height),
  };
}

function _onDoodleDown(e) {
  if (!_imgDoodleMode) return;
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  e.stopImmediatePropagation();
  e.preventDefault();
  const p = _getDoodlePos(e);
  const color = parseInt(document.getElementById('doodleCustomColor').value.replace('#', ''), 16);
  const width = parseInt(document.getElementById('doodleLineWidth').value, 10);
  _imgDoodleCurrentLine = { color, width, points: [p] };
  if (_imgDoodleDrawingGfx) _imgDoodleDrawingGfx.clear();
}

function _onDoodleMove(e) {
  if (!_imgDoodleMode || !_imgDoodleCurrentLine) return;
  e.stopImmediatePropagation();
  e.preventDefault();
  const p = _getDoodlePos(e);
  _imgDoodleCurrentLine.points.push(p);
  if (_imgDoodleDrawingGfx) {
    const pts = _imgDoodleCurrentLine.points;
    _imgDoodleDrawingGfx.clear();
    _imgDoodleDrawingGfx.lineStyle(_imgDoodleCurrentLine.width, _imgDoodleCurrentLine.color, 1);
    _imgDoodleDrawingGfx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) _imgDoodleDrawingGfx.lineTo(pts[i].x, pts[i].y);
  }
}

function _onDoodleUp(e) {
  if (!_imgDoodleMode || !_imgDoodleCurrentLine) return;
  e.stopImmediatePropagation();
  const line = _imgDoodleCurrentLine;
  _imgDoodleCurrentLine = null;
  if (line.points.length < 2) return;
  _imgDoodleHistory.push(line);
  _imgDoodleRedoStack.length = 0;
  if (_imgDoodleDrawingGfx) _imgDoodleDrawingGfx.clear();
  _imgDoodleRedrawGfx();
  _imgDoodleUpdateButtons();
}

function _imgDoodleRedrawGfx() {
  if (!_imgDoodleGfx) return;
  _imgDoodleGfx.clear();
  for (const line of _imgDoodleHistory) {
    if (line.points.length < 2) continue;
    _imgDoodleGfx.lineStyle(line.width, line.color, 1);
    _imgDoodleGfx.moveTo(line.points[0].x, line.points[0].y);
    for (let i = 1; i < line.points.length; i++) _imgDoodleGfx.lineTo(line.points[i].x, line.points[i].y);
  }
}

function _imgDoodleDoUndo() {
  if (_imgDoodleHistory.length === 0) return;
  _imgDoodleRedoStack.push(_imgDoodleHistory.pop());
  _imgDoodleRedrawGfx();
  _imgDoodleUpdateButtons();
}

function _imgDoodleDoRedo() {
  if (_imgDoodleRedoStack.length === 0) return;
  _imgDoodleHistory.push(_imgDoodleRedoStack.pop());
  _imgDoodleRedrawGfx();
  _imgDoodleUpdateButtons();
}

function _imgDoodleUpdateButtons() {
  _setBtnState(undo, _imgDoodleHistory.length > 0 ? 'skyblue' : '#c4f1efff');
  _setBtnState(redo, _imgDoodleRedoStack.length > 0 ? 'skyblue' : '#c4f1efff');
}

function _imgDoodleUndoCapture(e) {
  if (!_imgDoodleMode) return;
  e.stopImmediatePropagation();
  _imgDoodleDoUndo();
}

function _imgDoodleRedoCapture(e) {
  if (!_imgDoodleMode) return;
  e.stopImmediatePropagation();
  _imgDoodleDoRedo();
}

function _startImgDoodleMode() {
  if (!room) return;
  _stopImgDoodleMode();
  _imgDoodleMode = true;
  document.getElementById('doodleCanvas').style.display = 'none';
  document.getElementById('doodleCanvasInstruction').style.display = 'block';

  _imgDoodleGfx = new PIXI.Graphics();
  _imgDoodleGfx.zIndex = 900;
  _imgDoodleGfx.eventMode = 'none';
  room.container.addChild(_imgDoodleGfx);

  _imgDoodleDrawingGfx = new PIXI.Graphics();
  _imgDoodleDrawingGfx.zIndex = 901;
  _imgDoodleDrawingGfx.eventMode = 'none';
  room.container.addChild(_imgDoodleDrawingGfx);

  myCanvas.addEventListener('pointerdown', _onDoodleDown, { capture: true });
  myCanvas.addEventListener('pointermove', _onDoodleMove, { capture: true });
  myCanvas.addEventListener('pointerup', _onDoodleUp, { capture: true });
  myCanvas.addEventListener('pointercancel', _onDoodleUp, { capture: true });

  undo.addEventListener('pointerup', _imgDoodleUndoCapture, { capture: true });
  redo.addEventListener('pointerup', _imgDoodleRedoCapture, { capture: true });

  _imgDoodleUpdateButtons();
}

function _stopImgDoodleMode() {
  if (!_imgDoodleMode) return;
  _imgDoodleMode = false;
  _imgDoodleCurrentLine = null;
  document.getElementById('doodleCanvas').style.display = 'block';
  document.getElementById('doodleCanvasInstruction').style.display = 'none';

  myCanvas.removeEventListener('pointerdown', _onDoodleDown, { capture: true });
  myCanvas.removeEventListener('pointermove', _onDoodleMove, { capture: true });
  myCanvas.removeEventListener('pointerup', _onDoodleUp, { capture: true });
  myCanvas.removeEventListener('pointercancel', _onDoodleUp, { capture: true });

  undo.removeEventListener('pointerup', _imgDoodleUndoCapture, { capture: true });
  redo.removeEventListener('pointerup', _imgDoodleRedoCapture, { capture: true });

  if (_imgDoodleGfx) {
    if (_imgDoodleGfx.parent) _imgDoodleGfx.parent.removeChild(_imgDoodleGfx);
    _imgDoodleGfx.destroy();
    _imgDoodleGfx = null;
  }
  if (_imgDoodleDrawingGfx) {
    if (_imgDoodleDrawingGfx.parent) _imgDoodleDrawingGfx.parent.removeChild(_imgDoodleDrawingGfx);
    _imgDoodleDrawingGfx.destroy();
    _imgDoodleDrawingGfx = null;
  }

  switchDrawing(avatarOekakiToken);
}

function _clearImgDoodle() {
  _imgDoodleHistory.length = 0;
  _imgDoodleRedoStack.length = 0;
  _imgDoodleCurrentLine = null;
  if (_imgDoodleDrawingGfx) _imgDoodleDrawingGfx.clear();
  _imgDoodleRedrawGfx();
  if (_imgDoodleMode) _imgDoodleUpdateButtons();
}

async function _imgDoodleSave() {
  if (_imgDoodleHistory.length === 0) {
    alert('描いてから保存してください');
    return;
  }
  const rt = PIXI.RenderTexture.create({ width: 660, height: 460 });
  app.renderer.render(_imgDoodleGfx, { renderTexture: rt });
  const exportCanvas = app.renderer.extract.canvas(rt);
  rt.destroy(true);
  const dataUrl = exportCanvas.toDataURL('image/png');
  const name = document.getElementById('doodleNameInput').value || ('ラクガキ' + _doodleCount);
  const res = await fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': imgEditPassword },
    body: JSON.stringify({ type: document.getElementById('imgType').value, imageBase64: dataUrl, filename: name + '.png' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || '保存失敗');
    return;
  }
  const dd = await res.json().catch(() => ({}));
  if (dd.id) {
    _pendingImgAdds.add(dd.id);
    socket.emit('pendingAddImg', { id: dd.id });
    const _dType = document.getElementById('imgType').value;
    const _newImgListD = [...dbRoomImages, { id: dd.id, room_id: imgEditRoomId, type: _dType, filename: dd.filename, url: dd.url, x: 0, y: 0, width: null, height: null, z_index: dbRoomImages.length, is_warp: 0 }];
    clearDbImages(); dbRoomImages = _newImgListD; drawDbImages(); await _loadPlatformPixelData();
  }
  _doodleCount++;
  document.getElementById('doodleNameInput').value = 'ラクガキ' + _doodleCount;
  _clearImgDoodle();
  _stopImgDoodleMode();
  document.getElementById('doodleArea').style.display = 'none';
  await refreshImgList(true);
  _disableImgEditMode();
  if (_imgTabIsActive()) _enableImgEditMode();
}

// imgDoodleBtn は新UIでは imgDoodleBtnBg/Platform/Object に分割済み

document.getElementById('doodleClearBtn').addEventListener('click', () => {
  if (_imgDoodleMode) {
    _clearImgDoodle();
    return;
  }
  const canvas = document.getElementById('doodleCanvas');
  _doodleCtx.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById('doodleSaveBtn').addEventListener('click', async () => {
  if (_imgDoodleMode) {
    await _imgDoodleSave();
    return;
  }
  const canvas = document.getElementById('doodleCanvas');
  const name = document.getElementById('doodleNameInput').value || ('ラクガキ' + _doodleCount);
  const dataUrl = canvas.toDataURL('image/png');
  const res = await fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': imgEditPassword },
    body: JSON.stringify({ type: document.getElementById('imgType').value, imageBase64: dataUrl, filename: name + '.png' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || '保存失敗');
    return;
  }
  const dd = await res.json().catch(() => ({}));
  if (dd.id) {
    _pendingImgAdds.add(dd.id);
    socket.emit('pendingAddImg', { id: dd.id });
    const _dType = document.getElementById('imgType').value;
    const _newImgListD = [...dbRoomImages, { id: dd.id, room_id: imgEditRoomId, type: _dType, filename: dd.filename, url: dd.url, x: 0, y: 0, width: null, height: null, z_index: dbRoomImages.length, is_warp: 0 }];
    clearDbImages(); dbRoomImages = _newImgListD; drawDbImages(); await _loadPlatformPixelData();
  }
  _doodleCount++;
  document.getElementById('doodleNameInput').value = 'ラクガキ' + _doodleCount;
  _doodleCtx.clearRect(0, 0, canvas.width, canvas.height);
  await refreshImgList(true);
  _disableImgEditMode();
  if (_imgTabIsActive()) _enableImgEditMode();
});

function _imgTabIsActive() {
  const el = document.getElementById('roomEditContentImgWarp');
  return el && el.style.display !== 'none';
}

function _redrawImgOverlay(ov) {
  const s = ov.sprite;
  ov.borderGfx.clear();
  ov.borderGfx.lineStyle(2, 0x4a90d9, 0.9);
  ov.borderGfx.drawRect(s.x, s.y, s.width, s.height);
  ov.handleGfx.clear();
}

function _enableImgEditMode() {
  if (!room) return;
  _disableImgEditMode();
  _imgDragMode = true;
  app.stage.eventMode = 'static';
  dbRoomImages.forEach((imgData, idx) => {
    const sprite = dbImageSprites[idx];
    if (!sprite) return;
    if (sprite.texture.baseTexture.valid) {
      if (!imgData.width) imgData.width = Math.round(sprite.width) || null;
      if (!imgData.height) imgData.height = Math.round(sprite.height) || null;
      if (imgData.width) sprite.width = imgData.width;
      if (imgData.height) sprite.height = imgData.height;
    }
    const borderGfx = new PIXI.Graphics();
    borderGfx.zIndex = sprite.zIndex + 0.5; borderGfx.eventMode = 'none';
    room.container.addChild(borderGfx);
    const handleGfx = new PIXI.Graphics();
    handleGfx.zIndex = sprite.zIndex + 1; handleGfx.eventMode = 'none';
    room.container.addChild(handleGfx);
    const ov = { imgData, sprite, borderGfx, handleGfx };
    _imgOverlays.push(ov);
    _redrawImgOverlay(ov);
    sprite.eventMode = 'static'; sprite.cursor = 'grab';
    sprite.on('pointermove', e => {
      if (_imgDragging || _imgDragPending) return;
      const p = room.container.toLocal(e.global);
      const hs = 12, edge = 8;
      const ctl = p.x < sprite.x + hs && p.y < sprite.y + hs;
      const ctr = p.x > sprite.x + sprite.width - hs && p.y < sprite.y + hs;
      const cbl = p.x < sprite.x + hs && p.y > sprite.y + sprite.height - hs;
      const cbr = p.x > sprite.x + sprite.width - hs && p.y > sprite.y + sprite.height - hs;
      if (ctl || cbr) { sprite.cursor = 'nwse-resize'; return; }
      if (ctr || cbl) { sprite.cursor = 'nesw-resize'; return; }
      if (p.x < sprite.x + edge || p.x > sprite.x + sprite.width - edge) { sprite.cursor = 'ew-resize'; return; }
      if (p.y < sprite.y + edge || p.y > sprite.y + sprite.height - edge) { sprite.cursor = 'ns-resize'; return; }
      sprite.cursor = 'grab';
    });
    sprite.on('pointerdown', e => {
      if (!_imgDragMode || _imgDragging || _imgDragPending) return;
      const p = room.container.toLocal(e.global);
      const hs = 12, edge = 8;
      const ctlC = p.x < sprite.x + hs && p.y < sprite.y + hs;
      const ctrC = p.x > sprite.x + sprite.width - hs && p.y < sprite.y + hs;
      const cblC = p.x < sprite.x + hs && p.y > sprite.y + sprite.height - hs;
      const cbrC = p.x > sprite.x + sprite.width - hs && p.y > sprite.y + sprite.height - hs;
      const ratio = sprite.width / sprite.height;
      const base = { idx, ratio, startX: p.x, startY: p.y, origX: sprite.x, origY: sprite.y, origW: sprite.width, origH: sprite.height };
      if (cbrC) { _imgDragPending = { ...base, type: 'resize_corner_br' }; return; }
      if (cblC) { _imgDragPending = { ...base, type: 'resize_corner_bl' }; return; }
      if (ctrC) { _imgDragPending = { ...base, type: 'resize_corner_tr' }; return; }
      if (ctlC) { _imgDragPending = { ...base, type: 'resize_corner_tl' }; return; }
      const near_left = p.x < sprite.x + edge;
      const near_right = p.x > sprite.x + sprite.width - edge;
      const near_top = p.y < sprite.y + edge;
      const near_bottom = p.y > sprite.y + sprite.height - edge;
      let type = 'move';
      if (near_left) type = 'resize_left';
      else if (near_right) type = 'resize_right';
      else if (near_top) type = 'resize_top';
      else if (near_bottom) type = 'resize_bottom';
      _imgDragPending = { ...base, type };
      if (type === 'move') sprite.cursor = 'grabbing';
    });
  });
  app.stage.on('pointermove', _onImgDragMove);
  app.stage.on('pointerup', _onImgDragEnd);
  app.stage.on('pointerupoutside', _onImgDragEnd);
}

function _disableImgEditMode() {
  _imgDragMode = false; _imgDragging = null; _imgDragPending = null;
  if (typeof app !== 'undefined') {
    app.stage.off('pointermove', _onImgDragMove);
    app.stage.off('pointerup', _onImgDragEnd);
    app.stage.off('pointerupoutside', _onImgDragEnd);
  }
  _imgOverlays.forEach(ov => {
    if (ov.borderGfx.parent) ov.borderGfx.parent.removeChild(ov.borderGfx);
    if (ov.handleGfx.parent) ov.handleGfx.parent.removeChild(ov.handleGfx);
    ov.borderGfx.destroy(); ov.handleGfx.destroy();
    ov.sprite.removeAllListeners('pointerdown');
    ov.sprite.removeAllListeners('pointermove');
    ov.sprite.eventMode = 'none'; ov.sprite.cursor = 'default';
  });
  _imgOverlays.length = 0;
}

function _onImgDragMove(e) {
  if (!_imgDragPending && !_imgDragging || !room) return;
  if (_imgDragPending && !_imgDragging) {
    const p = room.container.toLocal(e.global);
    if (Math.abs(p.x - _imgDragPending.startX) < 4 && Math.abs(p.y - _imgDragPending.startY) < 4) return;
    _imgDragging = _imgDragPending;
    _imgDragPending = null;
  }
  if (!_imgDragging) return;
  const ov = _imgOverlays[_imgDragging.idx];
  if (!ov) return;
  const p = room.container.toLocal(e.global);
  const dx = p.x - _imgDragging.startX, dy = p.y - _imgDragging.startY;
  const s = ov.sprite;
  if (_imgDragging.type === 'move') {
    s.x = _imgDragging.origX + dx;
    s.y = _imgDragging.origY + dy;
  } else if (_imgDragging.type === 'resize_corner_br') {
    const scale = Math.max(0.05, (_imgDragging.origW + dx) / _imgDragging.origW);
    s.width = Math.max(20, _imgDragging.origW * scale);
    s.height = Math.max(20, s.width / _imgDragging.ratio);
  } else if (_imgDragging.type === 'resize_corner_bl') {
    const newW = Math.max(20, _imgDragging.origW - dx);
    const newH = Math.max(20, newW / _imgDragging.ratio);
    s.x = _imgDragging.origX + _imgDragging.origW - newW;
    s.width = newW; s.height = newH;
  } else if (_imgDragging.type === 'resize_corner_tr') {
    const scale = Math.max(0.05, (_imgDragging.origW + dx) / _imgDragging.origW);
    const newW = Math.max(20, _imgDragging.origW * scale);
    const newH = Math.max(20, newW / _imgDragging.ratio);
    s.y = _imgDragging.origY + _imgDragging.origH - newH;
    s.width = newW; s.height = newH;
  } else if (_imgDragging.type === 'resize_corner_tl') {
    const newW = Math.max(20, _imgDragging.origW - dx);
    const newH = Math.max(20, newW / _imgDragging.ratio);
    s.x = _imgDragging.origX + _imgDragging.origW - newW;
    s.y = _imgDragging.origY + _imgDragging.origH - newH;
    s.width = newW; s.height = newH;
  } else if (_imgDragging.type === 'resize_right') {
    s.width = Math.max(20, _imgDragging.origW + dx);
  } else if (_imgDragging.type === 'resize_bottom') {
    s.height = Math.max(20, _imgDragging.origH + dy);
  } else if (_imgDragging.type === 'resize_left') {
    const newW = Math.max(20, _imgDragging.origW - dx);
    s.x = _imgDragging.origX + (_imgDragging.origW - newW);
    s.width = newW;
  } else if (_imgDragging.type === 'resize_top') {
    const newH = Math.max(20, _imgDragging.origH - dy);
    s.y = _imgDragging.origY + (_imgDragging.origH - newH);
    s.height = newH;
  }
  _redrawImgOverlay(ov);
}

async function _onImgDragEnd() {
  _imgDragPending = null;
  if (!_imgDragging) return;
  const ov = _imgOverlays[_imgDragging.idx];
  _imgDragging = null;
  if (!ov) return;
  ov.sprite.cursor = 'grab';
  const x = Math.round(ov.sprite.x), y = Math.round(ov.sprite.y);
  const w = Math.round(ov.sprite.width), h = Math.round(ov.sprite.height);
  ov.imgData.x = x; ov.imgData.y = y; ov.imgData.width = w; ov.imgData.height = h;
  if (ov.imgData.type === 'object') ov.sprite.zIndex = y;
  _redrawImgOverlay(ov);
  const row = document.querySelector('[data-img-id="' + ov.imgData.id + '"]');
  if (row) row.querySelectorAll('input[data-field]').forEach(inp => {
    const v = { x, y, width: w, height: h }[inp.dataset.field];
    if (v !== undefined) inp.value = v;
  });
  _notifyRoomAssetsChanged();
}

async function refreshImgList(notify = false) {
  const images = dbRoomImages;
  ['imgListBackground', 'imgListPlatform', 'imgListObject', 'imgList'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
  const TYPE_LIST_ID = { background: 'imgListBackground', platform: 'imgListPlatform', object: 'imgListObject' };
  const _getList = (type) => document.getElementById(TYPE_LIST_ID[type] || 'imgList');

  let _listDragSrc = null;

  const _saveListOrder = async (listEl) => {
    const rows = Array.from(listEl.children);
    for (let i = 0; i < rows.length; i++) {
      const id = Number(rows[i].dataset.imgId);
      if (!id) continue;
      const img = dbRoomImages.find(img => img.id === id);
      if (img) img.z_index = i;
      await fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Edit-Password': imgEditPassword },
        body: JSON.stringify({ z_index: i }),
      });
    }
    dbRoomImages.sort((a, b) => (a.z_index ?? 0) - (b.z_index ?? 0));
    const _sortedList = dbRoomImages.slice();
    _disableImgEditMode();
    clearDbImages(); dbRoomImages = _sortedList; drawDbImages(); await _loadPlatformPixelData();
    if (_imgTabIsActive()) _enableImgEditMode();
  };

  images.forEach(img => {
    const row = document.createElement('div');
    row.dataset.imgId = img.id;
    row.draggable = true;
    row.style.cssText = 'display:flex;align-items:center;gap:5px;padding:4px 6px;margin:3px 0;background:#111;border:1px solid #333;border-radius:3px;cursor:grab;';

    row.addEventListener('dragstart', e => {
      _listDragSrc = row;
      e.dataTransfer.effectAllowed = 'move';
      row.style.opacity = '0.4';
    });
    row.addEventListener('dragend', () => {
      row.style.opacity = '';
      const listEl = row.parentElement;
      if (listEl) _saveListOrder(listEl);
    });
    row.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (_listDragSrc && _listDragSrc !== row) {
        const listEl = row.parentElement;
        const rows = Array.from(listEl.children);
        const srcIdx = rows.indexOf(_listDragSrc);
        const tgtIdx = rows.indexOf(row);
        if (srcIdx < tgtIdx) listEl.insertBefore(_listDragSrc, row.nextSibling);
        else listEl.insertBefore(_listDragSrc, row);
      }
    });

    const thumb = document.createElement('img');
    thumb.src = img.url;
    thumb.style.cssText = 'width:28px;height:28px;object-fit:cover;flex-shrink:0;border:1px solid #444;cursor:pointer;';
    thumb.title = 'クリックで画像を差し替え';
    thumb.addEventListener('click', () => { _replaceImgData = img; document.getElementById('imgReplaceInput').click(); });
    row.appendChild(thumb);

    const right = document.createElement('div');
    right.style.cssText = 'display:flex;align-items:center;gap:4px;flex-wrap:wrap;';

    const displayName = img.filename.replace(/^\d+_/, '');
    const fname = document.createElement('span');
    fname.textContent = displayName;
    fname.title = 'クリックで差し替え';
    fname.style.cssText = 'font-size:11px;color:#4af;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%;cursor:pointer;text-decoration:underline;';
    fname.addEventListener('click', () => { _replaceImgData = img; document.getElementById('imgReplaceInput').click(); });
    right.appendChild(fname);

    const mkNumInput = (label, field, val) => {
      const wrap = document.createElement('span');
      wrap.style.cssText = 'display:inline-flex;align-items:center;gap:1px;';
      const lbl = document.createElement('span');
      lbl.textContent = label;
      lbl.style.cssText = 'font-size:10px;color:#888;';
      const inp = document.createElement('input');
      inp.type = 'number'; inp.value = val ?? 0;
      inp.dataset.field = field;
      inp.style.cssText = 'width:38px;background:#0d0d1a;border:1px solid #4a90d9;color:#fff;padding:1px 2px;font-size:10px;';
      inp.addEventListener('change', () => {
        const val = Number(inp.value);
        img[field] = val;
        const sidx = dbRoomImages.findIndex(i => i.id === img.id);
        const sp = dbImageSprites[sidx];
        if (sp) {
          if (field === 'x') sp.x = val;
          else if (field === 'y') sp.y = val;
          else if (field === 'width') sp.width = val;
          else if (field === 'height') sp.height = val;
        }
        _disableImgEditMode();
        if (_imgTabIsActive()) _enableImgEditMode();
        _notifyRoomAssetsChanged();
      });
      wrap.appendChild(lbl);
      wrap.appendChild(inp);
      return wrap;
    };
    const numRow = document.createElement('div');
    numRow.style.cssText = 'width:100%;display:flex;align-items:center;gap:4px;margin-top:2px;';
    numRow.appendChild(mkNumInput('X:', 'x', img.x));
    numRow.appendChild(mkNumInput('Y:', 'y', img.y));
    numRow.appendChild(mkNumInput('W:', 'width', img.width));
    numRow.appendChild(mkNumInput('H:', 'height', img.height));

    const mkArrowBtn = (label, move) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.className = 'img-arrow-btn';
      btn.style.cssText = 'background:#222;color:#aaa;border:1px solid #444;cursor:pointer;padding:1px 5px;font-size:12px;line-height:1;';
      btn.addEventListener('click', () => {
        const listEl = row.parentElement;
        if (!listEl) return;
        if (move === -1) {
          const prev = row.previousElementSibling;
          if (prev) listEl.insertBefore(row, prev);
        } else {
          const next = row.nextElementSibling;
          if (next) listEl.insertBefore(next, row);
        }
        _saveListOrder(listEl);
      });
      return btn;
    };
    if (img.type !== 'object') {
      const depthLbl = document.createElement('span');
      depthLbl.textContent = '奥行き';
      depthLbl.className = 'img-depth-lbl';
      depthLbl.style.cssText = 'font-size:10px;color:#888;';
      numRow.appendChild(depthLbl);
    }
    numRow.appendChild(mkArrowBtn('↑', -1));
    numRow.appendChild(mkArrowBtn('↓', 1));

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.style.cssText = 'background:#600;color:#fff;border:none;cursor:pointer;padding:2px 6px;font-size:12px;';
    delBtn.addEventListener('click', async () => {
      _pendingDeletes.add(img.id);
      const _filtered = dbRoomImages.filter(i => i.id !== img.id);
      clearDbImages();
      dbRoomImages = _filtered;
      drawDbImages();
      await _loadPlatformPixelData();
      await refreshImgList(false);
      _disableImgEditMode();
      if (_imgTabIsActive()) _enableImgEditMode();
      _notifyRoomAssetsChanged();
    });
    numRow.appendChild(delBtn);
    right.appendChild(numRow);
    row.appendChild(right);

    _getList(img.type).appendChild(row);
  });

  ['imgListBackground', 'imgListPlatform', 'imgListObject', 'imgList'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.children.length === 1) {
      el.querySelectorAll('.img-arrow-btn, .img-depth-lbl').forEach(b => { b.style.display = 'none'; });
    }
  });
  if (notify) _notifyRoomAssetsChanged();
  if (warpEditRoomId) updateWarpList();
}

document.getElementById('imgReplaceInput').addEventListener('change', async () => {
  const input = document.getElementById('imgReplaceInput');
  const file = input.files[0];
  if (!file || !_replaceImgData) { input.value = ''; return; }
  const old = _replaceImgData;
  input.value = '';
  _replaceImgData = null;
  const reader = new FileReader();
  reader.onload = async e => {
    const postRes = await fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Edit-Password': imgEditPassword },
      body: JSON.stringify({ imageBase64: e.target.result, type: old.type }),
    });
    if (!postRes.ok) return;
    const newImg = await postRes.json();
    await fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images/' + newImg.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Edit-Password': imgEditPassword },
      body: JSON.stringify({ x: old.x, y: old.y, width: old.width, height: old.height, z_index: old.z_index }),
    });
    await fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images/' + old.id, {
      method: 'DELETE',
      headers: { 'X-Edit-Password': imgEditPassword },
    });
    const replaced = { id: newImg.id, room_id: imgEditRoomId, type: old.type, filename: newImg.filename, url: newImg.url, x: old.x, y: old.y, width: old.width, height: old.height, z_index: old.z_index, is_warp: 0 };
    const oldIdx = dbRoomImages.findIndex(i => i.id === old.id);
    const _replaceList = [...dbRoomImages];
    if (oldIdx >= 0) _replaceList.splice(oldIdx, 1, replaced);
    else _replaceList.push(replaced);
    _pendingImgAdds.delete(old.id);
    _pendingDeletes.delete(old.id);
    _pendingImgAdds.add(newImg.id);
    socket.emit('pendingAddImg', { id: newImg.id });
    clearDbImages(); dbRoomImages = _replaceList; drawDbImages(); await _loadPlatformPixelData();
    await refreshImgList(true);
    _disableImgEditMode();
    if (_imgTabIsActive()) _enableImgEditMode();
  };
  reader.readAsDataURL(file);
});

// ===== コードタブ =====

document.getElementById('codeTestBtn').addEventListener('click', () => {
  const code = document.getElementById('codeEditor').value;
  if (!code) return;
  _execCustomCodeInFrame(code);
  const msgEl = document.getElementById('codeMsg');
  msgEl.textContent = '実行中...';
  msgEl.style.color = '#ff8';
  setTimeout(() => { if (msgEl.textContent === '実行中...') { msgEl.textContent = ''; } }, 5000);
});

document.getElementById('codeSaveBtn').addEventListener('click', async () => {
  const code = document.getElementById('codeEditor').value;
  const msgEl = document.getElementById('codeMsg');
  const res = await fetch('/api/rooms/' + encodeURIComponent(codeEditRoomId) + '/', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': codeEditPassword },
    body: JSON.stringify({ customCode: code }),
  });
  if (res.ok) {
    msgEl.textContent = '保存しました';
    msgEl.style.color = '#8f8';
  } else {
    const err = await res.json().catch(() => ({}));
    msgEl.textContent = err.error || '保存失敗';
    msgEl.style.color = '#f88';
  }
});

document.getElementById('codeLoadSampleBtn').addEventListener('click', () => {
  document.getElementById('codeEditor').value = CODE_SAMPLE;
});

document.getElementById('codeRulesCopyBtn').addEventListener('click', () => {
  const prompt = `以下のルールに従って猫街のカスタムコードを書いてください:\n\n${CODE_RULES}\n\nやりたいこと: `;
  navigator.clipboard.writeText(prompt).then(() => {
    document.getElementById('codeRulesCopyBtn').textContent = 'コピーしました！';
    setTimeout(() => { document.getElementById('codeRulesCopyBtn').textContent = 'ルールをコピー（AIに貼り付け用）'; }, 2000);
  });
});

function oekakiSystem() {
  /* ~大雑把な説明
  入室時にサーバーからdrawHistoryを受け取る。
  
  お絵描きは線をdrawHistoryに追加
  clearは全て消してバックアップと部屋のメンバーをdrawHistoryに追加。
  undoはdrawHistoryから自分の最後の線を消して,redoStackに追加、clearのundoの場合backupを復元、redoStackにbackupを追加。
  ※clearのundoは全消し時に部屋にいたメンバーのみ可能。redoStackへの追加は無し。
  redoはredoStackから最後の線を引き出して、追加しなおす。

  uuidは使うのやめたから不要なんだけど、なんか使うかもしれんと思ってとりあえず残してる。

  全ての操作はサーバーでも同期、全体にブロードキャスト。
  操作に合わせてbuttonの色と状態を変える。
  
  例:
  drawHistory=[
  {
    type: "line",         // 線を描いた履歴
    token: "xxx",         // 誰が描いたか
    color: 0xFFFFFF,      // 線の色
    alpha: 1,             // 線の透明度
    pointer: [            // 線の座標配列
      { x: 100, y: 200 },
      { x: 110, y: 210 },
      // ...
    ],
    uuid: "abc123",       // 一意ID
  },
  {
    type: "clear",        // 全消し履歴
    backup: [ ... ],      // 消す前の履歴（配列）
    roomMemberToken: [ ... ], // 部屋にいたメンバーのtoken
  },
  // ...
]
*/

  //お絵描き情報をサーバーから受け取った時の処理
  socket.on("oekaki", data => {
    if (avaP[data.token].abon) return;
    if (!allowOthersOekaki && data.targetToken === myToken) return;
    const target = data.targetToken ? avaP[data.targetToken] : room;
    const line = data.line;
    target.drawHistory.push(line);

    if (data.targetToken) {
      // アバターへの落書き：状態キーで絞り込んで再描画
      target.redrawOekakiForState();
    } else {
      // 部屋への落書き：従来通り全描画
      if (line.type === "line" && line.pointer.length > 0) {
        target.oekakiGraphics.lineStyle(2, line.color, line.alpha);
        target.oekakiGraphics.moveTo(line.pointer[0].x, line.pointer[0].y);
        for (let i = 1; i < line.pointer.length; i++) {
          target.oekakiGraphics.lineTo(line.pointer[i].x, line.pointer[i].y);
        }
      }
    }

    // hitAreaを更新
    room.updateOekakiHitArea(target);

    if (data.targetToken && data.targetToken === myToken) {
      localStorage.setItem("myOekaki", JSON.stringify(target.drawHistory));
    }
    switchDrawing(avatarOekakiToken);
  });

  //全消しボタンの処理
  clear.addEventListener('pointerdown', e => {
    if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
    if (clearState === "disabled") return;
    e.preventDefault(); // テキスト選択やドラッグ開始を防ぐ
    _setBtnState(clear, '#c4f1efff');
  });

  clear.addEventListener('pointerup', e => {
    if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
    if (clearState === "disabled") return;
    // 動画フロアの全消し
    if (!avatarOekakiToken) {
      const vfObj = _getActiveVideoFloor();
      if (vfObj) {
        const floorToken = vfObj.name.replace('videoFloor:', '');
        vfObj.oekakiGraphics.clear();
        vfObj.drawHistory = [{
          type: 'clear',
          roomMemberToken: roomMemberToken.slice(),
          backup: vfObj.drawHistory.slice(),
        }];
        vfObj.redoStack = [];
        socket.emit('videoFloorOekakiClear', { floorToken, history: vfObj.drawHistory });
        switchDrawing(avatarOekakiToken);
        return;
      }
    }
    if (room.name === "loginRoom") {//ログインルームでの全消しの場合
      avaP[myToken].drawHistory = [];
      avaP[myToken].oekakiGraphics.clear();
      localStorage.removeItem("myOekaki");
    } else {
      const target = avatarOekakiToken ? avaP[avatarOekakiToken] : room;
      // 全ての線を消す
      target.oekakiGraphics.clear();
      // 全消しの履歴をdrawHistoryに追加
      target.drawHistory = [{
        type: "clear",
        roomMemberToken: roomMemberToken.slice(),
        backup: target.drawHistory.slice(),
      }];
      socket.emit("oekakiClear", {
        avatarOekakiToken: avatarOekakiToken,
        history: target.drawHistory,
      });
      if (avatarOekakiToken === myToken) {
        localStorage.removeItem("myOekaki");
      }
    }
    switchDrawing(avatarOekakiToken);
  }, { passive: true });

  clear.addEventListener('pointerleave', e => {
    switchDrawing(avatarOekakiToken);
  });

  //全消しの処理
  socket.on("oekakiClear", data => {
    if (avaP[data.token].abon) return;
    if (!allowOthersOekaki && data.targetToken === myToken) return;
    const target = data.targetToken ? avaP[data.targetToken] : room;
    target.oekakiGraphics.clear();
    target.drawHistory = data.history;

    // hitAreaもクリア
    if (target.oekakiHitArea) {
      target.oekakiHitArea.clear();
      target.oekakiGraphics.hitArea = null;
    }

    if (data.targetToken === myToken) {
      localStorage.removeItem("myOekaki");
    }
    switchDrawing(avatarOekakiToken);
  });

  //アンドゥーとリドゥーの処理
  // 履歴配列から全ての線を再描画する関数
  function redrawAllLines(object) {
    // アバターの場合は状態キーで絞り込んで再描画
    if (object.currentAvaStateKey !== undefined) {
      object.redrawOekakiForState();
      return;
    }
    object.oekakiGraphics.clear();
    object.drawHistory.forEach(line => {
      if (line.type === "line" && line.pointer.length > 0) {
        object.oekakiGraphics.lineStyle(2, line.color, line.alpha);
        object.oekakiGraphics.moveTo(line.pointer[0].x, line.pointer[0].y);
        for (let i = 1; i < line.pointer.length; i++) {
          object.oekakiGraphics.lineTo(line.pointer[i].x, line.pointer[i].y);
        }
      }
    });
  }

  //タップでundo redo
  let activeTouches = new Set();
  let lastGestureTapTime = 0;

  app.stage.on('pointerdown', e => {
    if (_videoFloorFocused) {
      _videoFloorFocused = false;
      switchDrawing(avatarOekakiToken);
    }
    if (e.pointerType === "touch") {
      activeTouches.add(e.pointerId);
    }
  });

  app.stage.on('pointerup', e => {
    if (e.pointerType === "touch") {
      // 2本指が同時に離された場合
      if (activeTouches.size === 2) {
        const now = Date.now();
        if (now - lastGestureTapTime < 300) {
          doUndo();
        }
        lastGestureTapTime = now;
      }
      // 3本指が同時に離された場合
      if (activeTouches.size === 3) {
        const now = Date.now();
        if (now - lastGestureTapTime < 300) {
          doRedo();
        }
        lastGestureTapTime = now;
      }
      activeTouches.delete(e.pointerId);
    }
  });

  //アンドゥー
  undo.addEventListener('pointerdown', e => {
    if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
    if (undoState === "disabled") return;
    e.preventDefault(); // テキスト選択やドラッグ開始を防ぐ
    _setBtnState(undo, '#c4f1efff');
  });

  undo.addEventListener('pointerup', e => {
    if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
    doUndo();
  }, { passive: true });

  function doUndo() {
    if (undoState === "disabled") return;
    // 動画フロアの場合
    if (!avatarOekakiToken) {
      const vfObj = _getActiveVideoFloor();
      if (vfObj) {
        const floorToken = vfObj.name.replace('videoFloor:', '');
        for (let i = vfObj.drawHistory.length - 1; i >= 0; i--) {
          const entry = vfObj.drawHistory[i];
          if (entry.token === myToken) {
            vfObj.redoStack.push(vfObj.drawHistory.splice(i, 1)[0]);
            break;
          }
          if (entry.roomMemberToken && entry.roomMemberToken.includes(myToken)) {
            vfObj.drawHistory.pop();
            if (Array.isArray(entry.backup)) vfObj.drawHistory.push(...entry.backup);
            break;
          }
        }
        _redrawVideoFloorOekaki(floorToken);
        socket.emit('videoFloorUndo', { floorToken, history: vfObj.drawHistory });
        switchDrawing(avatarOekakiToken);
        return;
      }
    }
    // 操作対象（アバター or ルーム）を決定
    const target = (avatarOekakiToken)
      ? avaP[avatarOekakiToken]
      : room;

    // 自分が描いた線や関与したクリア履歴をdrawHistoryから後ろ向きに探して、Undo処理を行う
    for (let i = target.drawHistory.length - 1; i >= 0; i--) {
      const line = target.drawHistory[i];
      // 自分が描いた線の履歴を見つけた場合
      if (line.token === myToken) {
        //drawHistoryから削除してredoStackに追加
        target.redoStack.push(target.drawHistory.splice(i, 1)[0]);
        break;
      }
      // 自分が関与したクリア履歴を見つけた場合
      if (line.roomMemberToken && line.roomMemberToken.includes(myToken)) {
        //drawHistoryから削除してredoStackに追加
        target.drawHistory.pop();
        // クリア前の履歴を復元
        if (Array.isArray(line.backup)) {
          target.drawHistory.push(...line.backup);
        }
        break;
      }
    }
    // 自分のアバターの場合はローカルストレージに保存
    // アバターの落書き履歴を再描画＆サーバーに通知
    redrawAllLines(target);//再描画
    socket.emit("undo", {
      avatarOekakiToken: avatarOekakiToken,
      history: target.drawHistory,
    });

    if (avatarOekakiToken === myToken) {
      localStorage.setItem("myOekaki", JSON.stringify(target.drawHistory));
    }
    switchDrawing(avatarOekakiToken);
  }

  undo.addEventListener('pointerleave', () => {
    // ボタンから指が離れた時も色を戻す
    switchDrawing(avatarOekakiToken);
  });

  socket.on("undo", data => {
    //再描画
    if (data.history && data.history.length) {
      const target = data.targetToken ? avaP[data.targetToken] : room;
      target.drawHistory = data.history;
      redrawAllLines(target);
    }
    if (data.targetToken === myToken) {
      localStorage.setItem("myOekaki", JSON.stringify(data.history));
    }
    switchDrawing(avatarOekakiToken);
  });

  //リドゥー
  redo.addEventListener('pointerdown', e => {
    if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
    if (redoState === "disabled") return;
    e.preventDefault(); // テキスト選択やドラッグ開始を防ぐ
    _setBtnState(redo, '#c4f1efff');
  });

  // リドゥ（やり直し）ボタンの処理
  redo.addEventListener('pointerup', e => {
    if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
    doRedo();
  }, { passive: true });

  function doRedo() {
    if (redoState === "disabled") return;
    // 動画フロアの場合
    if (!avatarOekakiToken) {
      const vfObj = _getActiveVideoFloor();
      if (vfObj) {
        const floorToken = vfObj.name.replace('videoFloor:', '');
        const line = vfObj.redoStack.pop();
        if (!line) return;
        vfObj.drawHistory.push(line);
        _redrawVideoFloorOekaki(floorToken);
        socket.emit('videoFloorOekaki', { floorToken, line });
        switchDrawing(avatarOekakiToken);
        return;
      }
    }
    // アバター or 部屋のお絵描き対象を決定
    const target = avatarOekakiToken ? avaP[avatarOekakiToken] : room;
    const line = target.redoStack.pop();
    if (!line) return;

    target.drawHistory.push(line);
    // アバターの場合は状態キーで絞り込んで再描画、部屋は直接追加描画
    if (target.currentAvaStateKey !== undefined) {
      target.redrawOekakiForState();
    } else {
      target.oekakiGraphics.lineStyle(2, line.color, line.alpha);
      target.oekakiGraphics.moveTo(line.pointer[0].x, line.pointer[0].y);
      for (let i = 1; i < line.pointer.length; i++) {
        target.oekakiGraphics.lineTo(line.pointer[i].x, line.pointer[i].y);
      }
    }
    socket.emit("oekaki", {
      avatarOekakiToken: avatarOekakiToken,
      line: line,
    });

    // 自分のアバターならローカル保存
    if (avatarOekakiToken === myToken) {
      localStorage.setItem("myOekaki", JSON.stringify(target.drawHistory));
    }
    switchDrawing(avatarOekakiToken);
  }

  redo.addEventListener('pointerleave', () => {
    // ボタンから指が離れた時も色を戻す
    switchDrawing(avatarOekakiToken);
  });

  socket.on("setAllowOthersOekaki", data => {
    if (!avaP[data.token]) return;
    avaP[data.token].allowOthersOekaki = !!data.allow;
    // 現在その人を落書き中なら強制解除
    if (!data.allow && avatarOekakiToken === data.token) {
      // ストローク途中の場合は描画グラフィクスを破棄して中断
      oekakityu = false;
      room.currentLine = null;
      room.drawingGraphics.clear();
      avatarOekakiToken = false;
      switchDrawing(avatarOekakiToken);
    }
  });

}

// お絵描きモード切り替え（アバター/部屋）＆ボタン状態更新
function switchDrawing(avatarDraw) {
  if (_imgDoodleMode) return;
  // 動画フロア上にいる場合はビデオフロアを対象にする
  if (!avatarDraw) {
    const vfObj = _getActiveVideoFloor();
    if (vfObj) {
      const hasLine = vfObj.drawHistory.some(line => line.type === 'line');
      const canUndo = vfObj.drawHistory.some(line =>
        line.token === myToken ||
        (Array.isArray(line.roomMemberToken) && line.roomMemberToken.includes(myToken))
      );
      const canRedo = vfObj.redoStack && vfObj.redoStack.length > 0;
      _setBtnState(clear, hasLine ? 'darkorange' : '#c4f1efff');
      clearState = hasLine ? 'enabled' : 'disabled';
      _setBtnState(undo, canUndo ? 'darkorange' : '#c4f1efff');
      undoState = canUndo ? 'enabled' : 'disabled';
      _setBtnState(redo, canRedo ? 'darkorange' : '#c4f1efff');
      redoState = canRedo ? 'enabled' : 'disabled';
      return;
    }
  }
  // 対象（アバター or 部屋）の履歴・リドゥスタック取得
  const target = avatarDraw ? avaP[avatarOekakiToken] : room;
  const hasLine = target.drawHistory.some(line => line.type === "line");
  const canUndo = target.drawHistory.some(line =>
    line.token === myToken ||
    (Array.isArray(line.roomMemberToken) && line.roomMemberToken.includes(myToken))
  );
  const canRedo = target.redoStack && target.redoStack.length > 0;

  // 全消しボタン
  _setBtnState(clear, avatarDraw ? (hasLine ? "blue" : "#c4f1efff") : (hasLine ? "skyblue" : "#c4f1efff"));
  clearState = hasLine ? "enabled" : "disabled";

  // アンドゥボタン
  _setBtnState(undo, avatarDraw ? (canUndo ? "blue" : "#c4f1efff") : (canUndo ? "skyblue" : "#c4f1efff"));
  undoState = canUndo ? "enabled" : "disabled";

  // リドゥボタン
  _setBtnState(redo, avatarDraw ? (canRedo ? "blue" : "#c4f1efff") : (canRedo ? "skyblue" : "#c4f1efff"));
  redoState = canRedo ? "enabled" : "disabled";
}

//音量保存
if (localStorage.getItem("volume")) {
  effectVolume.value = localStorage.getItem("volume");
  setMsgSE(localStorage.getItem("volume"));
}

function setMsgSE(value) {
  for (let i = 0; i < msgSE.log.length; i++) {
    msgSE.log[i].volume = value;
  }

  const msgSEKeys = Object.keys(msgSE);
  msgSEKeys.forEach(function (room) {
    const roomKeys = Object.keys(msgSE[room]);
    roomKeys.forEach(function (move) {
      for (let i = 0; i < msgSE[room][move].length; i++) {
        msgSE[room][move][i].volume = value;
      }
    });
  });
}

_setBtnState(logNoiseButton, useLogChime ? 'skyblue' : 'red');
logNoiseButton.textContent = useLogChime ? "SE🔊))" : "SE📢✖";

document.getElementById('showJoinLeaveMsg').checked = showJoinLeaveMsg;
document.getElementById('allowOthersOekaki').checked = allowOthersOekaki;
document.getElementById('oekakiPerStateMode').checked = oekakiPerStateMode;
document.getElementById('useLogHighlight').checked = useLogHighlight;
document.getElementById('useAvatarHighlight').checked = useAvatarHighlight;
document.getElementById('useLogItemHighlight').checked = useLogItemHighlight;
document.getElementById('showCoordChk').checked = showCoord;
_updateLogHighlightUI();
document.getElementById('contextMenuPos').value = contextMenuPos;
if (document.getElementById('useTTS')) document.getElementById('useTTS').checked = useTTS;
if (document.getElementById('ttsMode')) document.getElementById('ttsMode').value = ttsMode;
if (document.getElementById('ttsVolumeSlider')) document.getElementById('ttsVolumeSlider').value = ttsVolume;
document.getElementById('rnnoiseCheck').checked = _rnnoiseEnabled;
document.getElementById('audioBoostCheck').checked = _audioBoostEnabled;
document.getElementById('highpassCheck').checked = _highpassEnabled;

logNoiseButton.addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  e.preventDefault();
  useLogChime = !useLogChime;
  _setBtnState(logNoiseButton, useLogChime ? 'skyblue' : 'red');
  logNoiseButton.textContent = useLogChime ? "SE🔊))" : "SE📢✖";
  localStorage.setItem("useLogChime", useLogChime ? true : false);
});

function setSEVolume(value) {//SE音量調整
  localStorage.setItem("volume", value);
  setMsgSE(value);
}

socket.on("get", data => {
});

// ===== 読み上げ機能 (Google TTS + Web Audio) =====
let ttsAudioCtx = null;
let _ttsCurrentAudio = null; // 現在再生中のAudioオブジェクト

function _gttsUrl(text, slow) {
  return '/tts?slow=' + (slow ? '1' : '0') + '&q=' + encodeURIComponent(text);
}

function speakText(text) {
  if (!useTTS || ttsVolume <= 0) return;
  const cleanText = text.replace(/https?:\/\/\S+/g, 'URL').slice(0, 200);
  if (!cleanText.trim()) return;

  if (ttsMode === "soundfont") {
    // どうぶつの森風: Web Audio API
    if (!ttsAudioCtx) ttsAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (ttsAudioCtx.state === 'suspended') ttsAudioCtx.resume();
    const ctx = ttsAudioCtx;
    const masterGain = ctx.createGain();
    masterGain.gain.value = ttsVolume;
    masterGain.connect(ctx.destination);
    const charDelay = 0.075;
    let delay = 0;
    const scale = [523, 587, 659, 784, 880, 1047, 1175, 1319];
    for (let i = 0; i < Math.min(cleanText.length, 40); i++) {
      const ch = cleanText[i];
      if (ch === ' ' || ch === '　' || ch === '\n') { delay += charDelay; continue; }
      const freq = scale[cleanText.charCodeAt(i) % scale.length];
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(masterGain);
      osc.frequency.value = freq; osc.type = 'sine';
      gain.gain.setValueAtTime(0.10, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      osc.start(t); osc.stop(t + 0.07);
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2); gain2.connect(masterGain);
      osc2.frequency.value = freq * 2; osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.04, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc2.start(t); osc2.stop(t + 0.05);
      delay += charDelay;
    }
  } else {
    // Google TTS: new Audio() で再生、絶対止まらない
    if (_ttsCurrentAudio) {
      _ttsCurrentAudio.pause();
      _ttsCurrentAudio = null;
    }
    const slow = (ttsMode === "ikebo"); // 低音はGoogle側でもslowに
    const audio = new Audio(_gttsUrl(cleanText, slow));
    audio.volume = ttsVolume;
    if (!ttsAudioCtx) ttsAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (ttsAudioCtx.state === 'suspended') ttsAudioCtx.resume();
    const ctx = ttsAudioCtx;
    const source = ctx.createMediaElementSource(audio);
    const gainNode = ctx.createGain();
    gainNode.gain.value = ttsVolume;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    // playbackRateでピッチ+テンポを変える
    // 高音1.4倍: 元気でかわいい, 超高音1.9倍: ゆっくり語呂アニメ風, 低音0.8倍: 落ち着いたイケボ
    if (ttsMode === "pitch") audio.playbackRate = 1.9;
    else if (ttsMode === "normal") audio.playbackRate = 1.4;
    else if (ttsMode === "ikebo") audio.playbackRate = 0.8; // slow=1と合わせてさらに低く
    _ttsCurrentAudio = audio;
    audio.play().catch(() => {});
  }
}
// ===== 読み上げ機能ここまで =====

//メッセージを受け取って表示
socket.on("emit_msg", data => {
  if (data.token) {
    if (avaP[data.token].abon) return;//アボンされてない場合のみ処理を実行
    if (data.msg !== "") {　//未入力メッセージじゃなければ

      outputChatMsg(data.msg, "black", data.token, false, data.userName + ":");
      konaDropText(data.msg, data.konaSeed, avaP[data.token]?.avatarColor);
      speakText(data.msg);
      if (data.msg.length > 40) {//長すぎる場合は短くする
        data.msg = data.msg.slice(0, 40) + "...";
      }
      avaP[data.token].msg.log = !!data.carryOver;
      avaP[data.token].msg.eventMode = 'static';
      if (useLogChime) {//ログの音を鳴らす
        msgSE.log[data.soundNum].play();
      }
    }
    avaP[data.token].msg.text = data.msg;
  } else {
    outputChatMsg(data.msg);
  }
});

_setBtnState(train, "rgb(255,165,0)");
function trainClick() {
  if (room !== login) {
    socket.emit("emit_msg", {
      msg: "#train",
    });
  }
}

let _trainLi = null;
let _trainRoomIds = [];

function _buildTrainButtons(li, data) {
  while (li.firstChild) li.removeChild(li.firstChild);
  _trainBtns = {};
  const roomTypes = data.roomTypes || data.roomNameList.map(() => 'system');
  for (let i = 0; i < data.trainList.length; i++) {
    const btn = document.createElement("button");
    btn.textContent = data.trainList[i];
    const roomId = data.roomNameList[i];
    _trainBtns[roomId] = btn;
    const isUser = roomTypes[i] === 'user';
    if (uiNewMode) {
      const c = isUser ? '#aaccff' : 'rgb(255,165,0)';
      btn.style.background = 'rgba(10, 37, 48, 1)';
      btn.style.color = c;
      btn.style.border = '1.2px solid ' + c;
      btn.style.borderRadius = '2px';
      btn.style.padding = '5px 8px';
    } else {
      btn.style.backgroundColor = isUser ? '#1a2a5a' : 'rgb(255,165,0)';
      if (isUser) btn.style.color = '#aaccff';
    }
    btn.addEventListener('pointerdown', e => {
      if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
      e.preventDefault();
      _prevRoomSpot = '';
      if (isUser) { goSelfToRoomSpot('userRoom:' + roomId, 'train'); return; }
      switch (roomId) {
        case "エントランス":    goSelfToRoomSpot("entranceTrainSpot", "train"); break;
        case "草原":           goSelfToRoomSpot("entranceCloud1", "train"); break;
        case "うちゅー":       goSelfToRoomSpot("outerSpaceMainSpot", "train"); break;
        case "文字の部屋":       goSelfToRoomSpot("文字の部屋EntrySpot", "train"); break;
        case "星1":            goSelfToRoomSpot("star1EntrySpot", "train"); break;
        case "むげんのいりぐち": goSelfToRoomSpot("mugenEntrySpot", "train"); break;
        case "むげん":         goSelfToRoomSpot("mugenMainSpot", "train"); break;
        case "東の部屋":       goSelfToRoomSpot("東の部屋Spot", "train"); break;
        case "南の部屋":       goSelfToRoomSpot("南の部屋Spot", "train"); break;
        case "西の部屋":       goSelfToRoomSpot("西の部屋Spot", "train"); break;
        case "北の部屋":       goSelfToRoomSpot("北の部屋Spot", "train"); break;
      }
    });
    li.appendChild(btn);
  }
  _trainRoomIds = [...data.roomNameList];
}

//電車
socket.on("train", data => {
  const li = document.createElement("li");
  li.classList.add("flexContainer");
  li.style.flexWrap = 'wrap';
  _trainLi = li;
  _buildTrainButtons(li, data);

  mainLogUl.appendChild(li);
  if (useMainLog) mainLog.scrollTop = mainLog.scrollHeight;

  const _tBtns = new PIXI.Container();
  let _tbx = 0, _tby = 0;
  const _tRoomTypes = data.roomTypes || data.roomNameList.map(() => 'system');
  const _tBtnData = [];
  for (let i = 0; i < data.trainList.length; i++) {
    const _tRoomId = data.roomNameList[i];
    const _tIsUser = _tRoomTypes[i] === 'user';
    const _tt = new PIXI.Text(data.trainList[i], { fontSize: 12, fill: _tIsUser ? '#88aaff' : '#ff8c00' });
    const _bw = _tt.width + 8, _bh = _tt.height + 6;
    if (_tbx + _bw > 500 && _tbx > 0) { _tbx = 0; _tby += _bh + 2; }
    const _tItem = new PIXI.Container();
    const _tBg = new PIXI.Graphics();
    _tBg.lineStyle(1, _tIsUser ? 0x88aaff : 0xff8c00, 0.9);
    _tBg.beginFill(0x000000, 0.01);
    _tBg.drawRoundedRect(0, 0, _bw, _bh, 3);
    _tBg.endFill();
    _tt.x = 4; _tt.y = 3;
    _tItem.addChild(_tBg);
    _tItem.addChild(_tt);
    _tItem.x = _tbx; _tItem.y = _tby;
    _tBtnData.push({ bx: _tbx, by: _tby, bw: _bw, bh: _bh, action: () => {
      _prevRoomSpot = '';
      if (_tIsUser) { goSelfToRoomSpot('userRoom:' + _tRoomId, 'train'); return; }
      switch (_tRoomId) {
        case "エントランス":    goSelfToRoomSpot("entranceTrainSpot", "train"); break;
        case "草原":           goSelfToRoomSpot("entranceCloud1", "train"); break;
        case "うちゅー":       goSelfToRoomSpot("outerSpaceMainSpot", "train"); break;
        case "文字の部屋":     goSelfToRoomSpot("文字の部屋EntrySpot", "train"); break;
        case "星1":            goSelfToRoomSpot("star1EntrySpot", "train"); break;
        case "むげんのいりぐち": goSelfToRoomSpot("mugenEntrySpot", "train"); break;
        case "むげん":         goSelfToRoomSpot("mugenMainSpot", "train"); break;
        case "東の部屋":       goSelfToRoomSpot("東の部屋Spot", "train"); break;
        case "南の部屋":       goSelfToRoomSpot("南の部屋Spot", "train"); break;
        case "西の部屋":       goSelfToRoomSpot("西の部屋Spot", "train"); break;
        case "北の部屋":       goSelfToRoomSpot("北の部屋Spot", "train"); break;
      }
    }});
    _tbx += _bw + 2;
    _tBtns.addChild(_tItem);
  }
  _tBtns.y = 0;
  const _tOff = Math.max(_tBtns.height + 2, 14);
  overlayChat.children.forEach(c => { c.y += _tOff; });
  overlayChat.addChild(_tBtns);
  const _tCanvas = app.renderer.view;
  const _tCleanup = () => {
    _tCanvas.removeEventListener('pointerdown', _tCanvasHandler);
    if (_tBtns.parent) { _tBtns.parent.removeChild(_tBtns); _tBtns.destroy({ children: true }); }
  };
  const _tCanvasHandler = (e) => {
    if (e.button !== 0 && !['touch', 'pen'].includes(e.pointerType)) return;
    const rect = _tCanvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (660 / rect.width);
    const py = (e.clientY - rect.top) * (460 / rect.height) - overlayChat.y;
    for (const { bx, by, bw, bh, action } of _tBtnData) {
      if (px >= bx && px <= bx + bw && py >= by && py <= by + bh) {
        action();
        return;
      }
    }
  };
  _tCanvas.addEventListener('pointerdown', _tCanvasHandler);
});//socket.on("train");

socket.on("trainUpdate", data => {
  const idsChanged = data.roomNameList.length !== _trainRoomIds.length || data.roomNameList.some((id, i) => id !== _trainRoomIds[i]);
  if (idsChanged && _trainLi) {
    _buildTrainButtons(_trainLi, data);
  } else {
    for (let i = 0; i < data.roomNameList.length; i++) {
      const btn = _trainBtns[data.roomNameList[i]];
      if (btn) btn.textContent = data.trainList[i];
    }
  }
});

//リスト
socket.on("list", data => {
  const li = document.createElement("li");
  li.classList.add("flexContainer");
  li.style.flexWrap = "wrap";
  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  const timeSpan = document.createElement("span");
  timeSpan.textContent = timeStr;
  timeSpan.style.cssText = "font-size:0.85em;opacity:0.7;margin-left:6px;align-self:center;";
  const roomNameSpan = document.createElement("span");
  roomNameSpan.textContent = room.name;
  roomNameSpan.style.cssText = "font-weight:bold;margin-right:4px;align-self:center;white-space:nowrap;color:#000;background:rgba(20,40,100,0.5);padding:3px;border-radius:3px;";
  li.appendChild(roomNameSpan);
  let button = [];

  for (let i = 0; i < data.listName.length; i++) {
    button[i] = document.createElement("button");
    const _listName = data.listName[i];
    const _suffix = peerConnections[data.listToken[i]] ? "📶" : "";
    if (_listName.length > 14) {
      const _half = Math.ceil(_listName.length / 2);
      button[i].textContent = _listName.slice(0, _half) + '\n' + _listName.slice(_half) + _suffix;
      button[i].style.whiteSpace = "pre-line";
    } else {
      button[i].textContent = _listName + _suffix;
    }
    if (uiNewMode) {
      const c = avaP[data.listToken[i]].abon ? 'red' : '#60c8e8';
      button[i].style.background = 'rgba(10, 37, 48, 1)';
      button[i].style.color = c;
      button[i].style.border = '1.2px solid ' + c;
      button[i].style.borderRadius = '2px';
      button[i].style.padding = '5px 8px';
    } else if (avaP[data.listToken[i]].abon) {
      button[i].style.backgroundColor = "red";
    } else {
      button[i].style.backgroundColor = "skyblue";
    }
    button[i].className = data.listToken[i];
    button[i].addEventListener('pointerdown', e => {
      if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
      e.preventDefault();
      if (myToken != data.listToken[i]) {
        socket.emit("abonSetting", {
          setAbon: avaP[data.listToken[i]].abon,
          token: data.listToken[i],
        });
      }
    });
    li.appendChild(button[i]);
  }
  li.appendChild(timeSpan);

  //メッセージを出力
  if (window.innerWidth > 660 && mainLog.scrollHeight <= mainLog.clientHeight + mainLog.scrollTop + 1) {//windowWidthが660以上の時かつスクロールバーが一番下にある時にスクロールバーを自動移動
    mainLogUl.insertBefore(li, logs.querySelectorAll("li")[li.length]);
    mainLog.scrollTop = mainLog.scrollHeight;
  } else {
    mainLogUl.insertBefore(li, logs.querySelectorAll("li")[li.length]);
  }

  const _lBtns = new PIXI.Container();
  let _lbx = 0, _lby = 0;
  const _lBtnData = [];
  for (let i = 0; i < data.listName.length; i++) {
    const _lTk = data.listToken[i];
    const _lSuffix = peerConnections[_lTk] ? "📶" : "";
    const _lt = new PIXI.Text(data.listName[i] + _lSuffix, { fontSize: 12, fill: avaP[_lTk]?.abon ? '#ff4444' : '#00bbdd' });
    const _bw = _lt.width + 8, _bh = _lt.height + 6;
    if (_lbx + _bw > 500 && _lbx > 0) { _lbx = 0; _lby += _bh + 2; }
    const _lItem = new PIXI.Container();
    const _lBg = new PIXI.Graphics();
    _lBg.lineStyle(1, avaP[_lTk]?.abon ? 0xff4444 : 0x00bbdd, 0.9);
    _lBg.beginFill(0x000000, 0.01);
    _lBg.drawRoundedRect(0, 0, _bw, _bh, 3);
    _lBg.endFill();
    _lt.x = 4; _lt.y = 3;
    _lItem.addChild(_lBg);
    _lItem.addChild(_lt);
    _lItem.x = _lbx; _lItem.y = _lby;
    if (myToken !== _lTk) {
      _lBtnData.push({ bx: _lbx, by: _lby, bw: _bw, bh: _bh, action: () => {
        socket.emit("abonSetting", { setAbon: avaP[_lTk]?.abon, token: _lTk });
      }});
    }
    _lbx += _bw + 2;
    _lBtns.addChild(_lItem);
  }
  _lBtns.y = 0;
  const _lOff = Math.max(_lBtns.height + 2, 14);
  overlayChat.children.forEach(c => { c.y += _lOff; });
  overlayChat.addChild(_lBtns);
  const _lCanvas = app.renderer.view;
  const _lCleanup = () => {
    _lCanvas.removeEventListener('pointerdown', _lCanvasHandler);
    if (_lBtns.parent) { _lBtns.parent.removeChild(_lBtns); _lBtns.destroy({ children: true }); }
  };
  const _lCanvasHandler = (e) => {
    if (e.button !== 0 && !['touch', 'pen'].includes(e.pointerType)) return;
    const rect = _lCanvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (660 / rect.width);
    const py = (e.clientY - rect.top) * (460 / rect.height) - overlayChat.y;
    for (const { bx, by, bw, bh, action } of _lBtnData) {
      if (px >= bx && px <= bx + bw && py >= by && py <= by + bh) {
        action();
        return;
      }
    }
  };
  _lCanvas.addEventListener('pointerdown', _lCanvasHandler);
});//socket.on("list");

_setBtnState(usersDisplay, "rgb(200,240,240)");
function usersDisplayClick() {
  if (room !== login) {
    socket.emit("emit_msg", {
      msg: "#list",
    });
  }
};

//アボンの時の処理
socket.on("abonSetting", data => {
  if (data.msg == "その住民は退出済みです") {//アボンするときアボン対象の住人が居ない時
    outputChatMsg(data.msg, "red");
  } else if (!avaP[data.token].abon) {
    avaP[data.token].abon = true;
    outputChatMsg(data.msg, "red");
    avaP[data.token].msg.text = "アボン";
    avaP[data.token].msg.style.fill = "red";
    avaP[data.token].container.removeChild(avaP[data.token].avaC);
    avaP[data.token].avaC = avaP[data.token].abonSprite;
    avaP[data.token].container.addChild(avaP[data.token].avaC);
    stopConnection(data.token);//アボンした人との通信を止める
    if (avatarOekakiToken === data.token) {
      avatarOekakiToken = false;
      switchDrawing();//部屋用お絵描きに切り替える
    }
    document.querySelectorAll('button.' + CSS.escape(data.token)).forEach(btn => { btn.style.backgroundColor = "red"; });
  } else {//アボンを解除する時
    avaP[data.token].abon = false;
    outputChatMsg(data.msg, "blue");
    document.querySelectorAll('button.' + CSS.escape(data.token)).forEach(btn => { btn.style.backgroundColor = "skyblue"; });
    if (data.room === room.name) {//アバターが部屋にいるときの解除
      avaP[data.token].msg.style.fill = "white";
      avaP[data.token].container.x = data.AX;
      avaP[data.token].container.y = data.AY;
      avaP[data.token].container.removeChild(avaP[data.token].avaC);
      applyAvatarDir(avaP[data.token], data.DIR);
      if (avaP[data.token].sit) {
        avaP[data.token].avaC = avaP[data.token].avaSit;
      }
      avaP[data.token].container.addChild(avaP[data.token].avaC);
      if (avaP[data.token].sleep) {
        avaP[data.token].animeSleep();
      }

    } else {//アバターが部屋に居ない時の解除だったら、削除する
      room.container.removeChild(avaP[data.token].container);
    }
    avaP[data.token].msg.text = data.avaMsg;
  }
});


// 立て看板管理
let contextMenuRoomPos = null;
let contextMenuCloudRelX = null; // 右クリック時が雲の上の場合の雲相対X（それ以外はnull）
let pendingSignPassword = ""; // 次に作られる看板のパスワード（ローカル保持）
const signs = []; // { id, container, timer, password } の配列

//右クリックメニュー用の処理を書いてく
// 関係ないとこ触ったら右クリックメニューは消す
window.addEventListener('pointerdown', e => {
  // メニュー自身やその子要素をクリックした場合は何もしない
  if (
    contextMenu.contains(e.target) ||
    abonMenu.contains(e.target) ||
    avatarOekakiMenu.contains(e.target)
  ) return;

  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  //メニューをnoneで非表示にさせる
  contextMenu.style.display = "none";
  abonMenu.style.display = "none";
  avatarOekakiMenu.style.display = "none";
}, { passive: true });

// コンテキストメニューを表示する位置を計算して表示する関数
function contextMenuPositionSet(e) {
  const pos = e.data.getLocalPosition(room.container);
  const winWidth = window.innerWidth;
  const winHeight = window.innerHeight;
  const margin = 4;

  let topOffset;
  if (winWidth > 870) {
    topOffset = parseInt(window.getComputedStyle(titleBar).getPropertyValue('height'));
  } else {
    topOffset = parseInt(window.getComputedStyle(form).getPropertyValue('height'));
  }

  // メニュー項目の表示/非表示を更新
  if (avaP[myToken].avatarAspect == "gomaneco" || avaP[myToken].avatarAspect == "gomanecoMono") {
    sleepMenu.style.display = "block";
  } else {
    sleepMenu.style.display = "none";
  }
  // 立て看板メニュー：重力ありの部屋かつクリック位置に足場があるときのみ表示
  if (ROOM_PHYSICS[room.name]?.gravity && isStandablePosition(pos.x, pos.y)) {
    signMenu.style.display = "block";
    contextMenuRoomPos = { x: pos.x, y: pos.y };
    // 雲の上なら雲相対Xを保存（createSign時に雲がずれても正確に配置できる）
    contextMenuCloudRelX = (cloud && cloud.container && cloud.container.hitArea &&
      cloud.container.hitArea.contains(pos.x - cloud.container.x, pos.y))
      ? pos.x - cloud.container.x
      : null;
  } else {
    signMenu.style.display = "none";
    contextMenuRoomPos = null;
    contextMenuCloudRelX = null;
  }

  // 背景画像変更メニュー：方角部屋のみ表示
  if (_DIR_ROOM_NAMES.has(room.name)) {
    document.getElementById('dirBgChangeMenu').style.display = 'block';
    document.getElementById('dirBgDeleteMenu').style.display = 'block';
  } else {
    document.getElementById('dirBgChangeMenu').style.display = 'none';
    document.getElementById('dirBgDeleteMenu').style.display = 'none';
  }

  contextMenu.style.display = 'block';

  // 画面右上：right プロパティで直接配置（menuW計測不要）
  if (winWidth <= 870 && contextMenuPos === 'right') {
    contextMenu.style.left = 'auto';
    contextMenu.style.right = margin + 'px';
    contextMenu.style.top = (topOffset + margin) + 'px';
    const rh = contextMenu.getBoundingClientRect().height;
    if (topOffset + margin + rh > winHeight) contextMenu.style.top = (winHeight - rh) + 'px';
    return;
  }

  // ブラウザのビューポート座標（room座標系のズレを回避）
  const orig = e.data.originalEvent;
  const clientX = orig.clientX;
  const clientY = orig.clientY;

  // 左上で仮表示してサイズ計測
  contextMenu.style.left = '0';
  contextMenu.style.right = 'auto';
  contextMenu.style.top = '0';
  const { width: menuW, height: menuH } = contextMenu.getBoundingClientRect();

  let left, top;
  if (winWidth > 870) {
    left = clientX; top = clientY;
    if (left + menuW > winWidth) left = winWidth - menuW;
    if (left < 0) left = 0;
    if (top + menuH > winHeight) top = winHeight - menuH;
    if (top < 0) top = 0;
  } else if (contextMenuPos === 'left') {
    left = margin; top = topOffset + margin;
    if (top + menuH > winHeight) top = winHeight - menuH;
  } else if (contextMenuPos === 'tapLeft') {
    left = clientX - menuW; top = clientY - menuH;
    if (left < 0) left = 0;
    if (top < topOffset) top = clientY;
    if (top + menuH > winHeight) top = winHeight - menuH;
  } else { // tapRight
    left = clientX; top = clientY - menuH;
    if (left + menuW > winWidth) left = winWidth - menuW;
    if (left < 0) left = 0;
    if (top < topOffset) top = clientY;
    if (top + menuH > winHeight) top = winHeight - menuH;
  }

  contextMenu.style.left = left + 'px';
  contextMenu.style.right = 'auto';
  contextMenu.style.top = top + 'px';

  // menuW が0だった場合のフォールバック：実描画位置で再補正
  const fr = contextMenu.getBoundingClientRect();
  if (fr.right > winWidth) contextMenu.style.left = Math.max(0, winWidth - fr.width) + 'px';
  if (fr.bottom > winHeight) contextMenu.style.top = Math.max(0, winHeight - fr.height) + 'px';
}

function changeContextMenuPos(val) {
  contextMenuPos = val;
  localStorage.setItem("contextMenuPos", val);
}

function updateRoomLinkDisplay() {
  const input = document.getElementById('roomLinkInput');
  const btn = document.getElementById('roomLinkCopyBtn');
  if (!input) return;
  if (!room || room.name === 'loginRoom') {
    input.textContent = '';
    if (btn) btn.disabled = true;
    return;
  }
  const _roomLinkName = (_inUserRoom && _userRoomDisplayName) ? _userRoomDisplayName : room.name;
  input.textContent = location.origin + location.pathname + '?room=' + encodeURIComponent(_roomLinkName);
  if (btn) btn.disabled = false;
}

function copyRoomLink() {
  updateRoomLinkDisplay();
  const input = document.getElementById('roomLinkInput');
  if (!input || !input.textContent) return;
  navigator.clipboard.writeText(input.textContent);
}

// クリック位置が足場（standableタグのあるオブジェクト）の上かどうか判定
// hitAreaが設定されていないオブジェクトはスキップ（getBounds()は空中を含む全体で一致してしまうため）
function isStandablePosition(x, y) {
  for (const objName in objMap) {
    const obj = objMap[objName];
    if (!obj || !obj.tags || !obj.container || !obj.container.hitArea) continue;
    if (!obj.tags.includes("standable")) continue;
    const bContainer = obj.container;
    const scaleX = bContainer.scale ? bContainer.scale.x : 1;
    const scaleY = bContainer.scale ? bContainer.scale.y : 1;
    const lx = (x - bContainer.x) / scaleX;
    const ly = (y - bContainer.y) / scaleY;
    if (bContainer.hitArea.contains && bContainer.hitArea.contains(lx, ly)) return true;
  }
  return false;
}

//座る時
sitMenu.addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  if (sleepMenu.textContent === "起きる") {//寝てる時に座ろうとしたら起きる
    sleepMenu.textContent = "寝る";
    avaP[myToken].sleep = false;
    socket.emit("sleep", {});
  }
  if (sitMenu.textContent === "座る") {//座る時
    sitMenu.textContent = "立つ";
    avaP[myToken].sit = true;
    avaP[myToken].container.removeChild(avaP[myToken].avaC);
    avaP[myToken].avaC = avaP[myToken].avaSit;
    avaP[myToken].container.addChild(avaP[myToken].avaC);
    localStorage.setItem("sit", true);
  } else {//立つ時
    sitMenu.textContent = "座る";
    DIR = "S";
    avaP[myToken].sit = false;
    avaP[myToken].tappedMove(AX, AY, "S");
    localStorage.setItem("sit", false);
  }
  socket.emit("sitChange", {
    DIR: DIR,
    AX: AX,
    AY: AY,
    sit: avaP[myToken].sit,
  });
  contextMenu.style.display = "none";
});

socket.on("sitChange", data => {
  avaP[data.token].sit = data.sit;
  if (data.sit) {//座る時
    avaP[data.token].container.removeChild(avaP[data.token].avaC);
    avaP[data.token].avaC = avaP[data.token].avaSit;
    avaP[data.token].container.addChild(avaP[data.token].avaC);
  } else {//立つ時
    avaP[data.token].tappedMove(data.AX, data.AY, data.DIR);
  }
});

sleepMenu.addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  if (avaP[myToken].avatarAspect == "gomaneco" || avaP[myToken].avatarAspect == "gomanecoMono") {
    if (sleepMenu.textContent == "寝る") {//寝る時
      if (avaP[myToken].sleep === false) {
        sleepMenu.textContent = "起きる";
        avaP[myToken].sleep = true;
        avaP[myToken].animeSleep();
        socket.emit("sleep", {});
      }
    } else {//起きる時
      sleepMenu.textContent = "寝る";
      avaP[myToken].sleep = false;
      socket.emit("sleep", {});
    }
  }
  contextMenu.style.display = "none";
});

socket.on("sleep", data => {
  if (avaP[data.token].avatarAspect == "gomaneco" || avaP[data.token].avatarAspect == "gomanecoMono") {
    if (data.sleep) {//寝る時
      if (data.token == myToken) {//自分が時間で眠った時右クリックメニューを起きるにする
        sleepMenu.textContent = "起きる";
      }
      if (avaP[data.token].sleep === false) {
        avaP[data.token].sleep = true;
        avaP[data.token].animeSleep();
      }
    } else {//起きるとき
      if (data.token == myToken) {//自分が時間で眠った時右クリックメニューを寝るにする
        sleepMenu.textContent = "寝る";
      }
      avaP[data.token].sleep = false;
    }
  }
});

abonMenu.addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  if (contextMenu.dataset.token != myToken) {//自アバターは省く 
    socket.emit("abonSetting", {
      setAbon: avaP[contextMenu.dataset.token].abon,
      token: contextMenu.dataset.token,
    });
  }
  contextMenu.style.display = "none";
});

avatarOekakiMenu.addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  if (!avatarOekakiToken) {//アバターお絵描きに切り替える時
    avatarOekakiToken = contextMenu.dataset.token;
  } else {//ルームお絵描きに切り替える時
    avatarOekakiToken = false;
  }
  switchDrawing(avatarOekakiToken);
  contextMenu.style.display = "none";
});

// 立て看板メニュー
document.getElementById('dirBgChangeMenu').addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  contextMenu.style.display = 'none';
  document.getElementById('dirBgFileInput').click();
});

document.getElementById('dirBgFileInput').addEventListener('change', async function() {
  const file = this.files[0];
  if (!file || !room || !_DIR_ROOM_NAMES.has(room.name)) return;
  this.value = '';
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const res = await fetch('/api/direction/' + encodeURIComponent(room.name) + '/bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: ev.target.result }),
      });
      if (!res.ok) return;
      const data = await res.json();
      delete _dirBgPreSprites[room.name];
      delete _dirBgPreloadPromises[room.name];
      _dirBgUrlCache[room.name] = data.url;
      _startDirBgPreloads(); // 更新した部屋のBGを即プリロード再開
      _applyDirectionBg(room.name, data.url + '?t=' + Date.now());
      socket.emit('dirBgUpdate', { roomName: room.name, url: data.url });
    } catch (_e) {}
  };
  reader.readAsDataURL(file);
});

document.getElementById('dirBgDeleteMenu').addEventListener('pointerdown', async e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  contextMenu.style.display = 'none';
  if (!room || !_DIR_ROOM_NAMES.has(room.name)) return;
  try {
    await fetch('/api/direction/' + encodeURIComponent(room.name) + '/bg', { method: 'DELETE' });
    _applyDirectionBg(room.name, null);
    socket.emit('dirBgUpdate', { roomName: room.name, url: null });
  } catch (_e) {}
});

signMenu.addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  contextMenu.style.display = "none";
  // デフォルトは自分の名前をプレースホルダーとして表示
  document.getElementById("signBoardText").value = "";
  document.getElementById("signBoardText").placeholder = avaP[myToken]?.nameText?.text || "看板の文字（省略可）";
  document.getElementById("signClickText").value = "";
  document.getElementById("signPassword").value = "";
  const signModal = document.getElementById("signModal");
  signModal.style.display = "flex";
  document.getElementById("signBoardText").focus();
});

document.getElementById("signCancel").addEventListener('pointerdown', () => {
  document.getElementById("signModal").style.display = "none";
});

document.getElementById("signConfirm").addEventListener('pointerdown', () => {
  const inputEl = document.getElementById("signBoardText");
  // 未入力の場合はプレースホルダー（自分の名前）を使う
  const boardText = inputEl.value.trim() || inputEl.placeholder || "";
  const clickText = document.getElementById("signClickText").value.trim();
  if (!boardText && !clickText) return;
  const durationMs = parseInt(document.getElementById("signDuration").value);
  const password = document.getElementById("signPassword").value;
  document.getElementById("signModal").style.display = "none";
  if (contextMenuRoomPos) {
    pendingSignPassword = password;
    _applyPendingPassword = true;
    socket.emit("createSign", {
      x: contextMenuRoomPos.x,
      y: contextMenuRoomPos.y,
      cloudRelX: contextMenuCloudRelX, // 雲の上の場合は雲相対X、それ以外はnull
      boardText,
      clickText,
      durationMs,
    });
  }
});

// 看板右クリックメニュー
let signContextTarget = null;
const signContextMenu = document.getElementById("signContextMenu");
let _signContextMenuJustOpened = false; // 開いた直後にwindowイベントで消えないようにするフラグ

window.addEventListener('pointerdown', e => {
  if (_signContextMenuJustOpened) {
    _signContextMenuJustOpened = false;
    return;
  }
  if (!signContextMenu.contains(e.target)) {
    signContextMenu.style.display = "none";
  }
}, { passive: true });

document.getElementById("signDeleteMenu").addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  signContextMenu.style.display = "none";
  if (!signContextTarget) return;
  if (!signContextTarget.password) {
    // パスワードなし → 確認モーダルを出す
    document.getElementById("signDeleteConfirmModal").style.display = "flex";
    return;
  } else {
    // パスワードあり → モーダルを出す
    document.getElementById("signDeletePassword").value = "";
    document.getElementById("signDeleteError").style.display = "none";
    document.getElementById("signDeleteModal").style.display = "flex";
    document.getElementById("signDeletePassword").focus();
  }
});

document.getElementById("signDeleteConfirmNo").addEventListener('pointerdown', () => {
  document.getElementById("signDeleteConfirmModal").style.display = "none";
  signContextTarget = null;
});

document.getElementById("signDeleteConfirmYes").addEventListener('pointerdown', () => {
  document.getElementById("signDeleteConfirmModal").style.display = "none";
  if (!signContextTarget) return;
  socket.emit("removeSign", { id: signContextTarget.id });
  signContextTarget = null;
});

document.getElementById("signDeleteCancel").addEventListener('pointerdown', () => {
  document.getElementById("signDeleteModal").style.display = "none";
  signContextTarget = null;
});

document.getElementById("signDeleteConfirm").addEventListener('pointerdown', () => {
  if (!signContextTarget) return;
  const input = document.getElementById("signDeletePassword").value;
  if (input === signContextTarget.password) {
    document.getElementById("signDeleteModal").style.display = "none";
    socket.emit("removeSign", { id: signContextTarget.id });
    signContextTarget = null;
  } else {
    document.getElementById("signDeleteError").style.display = "block";
  }
});

// サーバーからの看板作成
socket.on('dirBgUpdate', data => {
  if (data.url) {
    delete _dirBgPreSprites[data.roomName];
    delete _dirBgPreloadPromises[data.roomName];
    _dirBgUrlCache[data.roomName] = data.url;
    _startDirBgPreloads();
    _applyDirectionBg(data.roomName, data.url + '?t=' + Date.now());
  } else {
    delete _dirBgPreSprites[data.roomName];
    delete _dirBgPreloadPromises[data.roomName];
    _dirBgUrlCache[data.roomName] = '';
    _startDirBgPreloads();
    _applyDirectionBg(data.roomName, null);
  }
});

socket.on("createSign", data => {
  // 自分が直前に作った看板なら pendingSignPassword を適用
  const password = _applyPendingPassword ? pendingSignPassword : "";
  _applyPendingPassword = false;
  createSign(data.id, data.x, data.y, data.boardText, data.clickText, password, data.endTime, data.cloudRelX ?? null);
});

// サーバーからの看板削除
socket.on("removeSign", data => {
  const signObj = signs.find(s => s.id === data.id);
  if (signObj) removeSign(signObj);
});

// 入室時に既存の看板を復元
// （joineRoomのdataに signs: [] が含まれる）
// → joineRoom ハンドラ内で処理するため、ここでは関数だけ定義

let _applyPendingPassword = false; // 次のcreateSignイベントに pendingSignPassword を適用するフラグ

// 看板をPIXI.Graphicsで作成して配置する
// cloudRelX が null でない場合は雲コンテナに追加して追従させる
function createSign(id, x, y, boardText, clickText, password, endTime, cloudRelX = null) {
  const BOARD_H = 44;
  const POLE_H = 55;
  const POLE_W = 9;
  const POLE_COLOR = 0x5c2b00;
  const BOARD_COLOR = 0x8b4513;
  const BOARD_EDGE = 0x4a2000;

  const container = new PIXI.Container();
  container.sortableChildren = true;
  container.eventMode = 'static';

  // 看板テキスト（ボード上に表示）
  const displayText = boardText || "";
  const signText = new PIXI.Text(displayText, {
    fontSize: 13,
    fill: 0xfffbe6,
    fontFamily: "monospace",
    wordWrap: false,
    padding: 4, // アセンダー・ディセンダーのクリッピング防止
  });
  signText.zIndex = 2;

  const BOARD_W = Math.max(80, signText.width + 20);

  const g = new PIXI.Graphics();
  g.zIndex = 1;

  // 左ポール
  g.beginFill(POLE_COLOR);
  g.drawRect(-BOARD_W / 2 + 7, -BOARD_H - POLE_H, POLE_W, POLE_H);
  g.endFill();
  // 右ポール
  g.beginFill(POLE_COLOR);
  g.drawRect(BOARD_W / 2 - 16, -BOARD_H - POLE_H, POLE_W, POLE_H);
  g.endFill();

  // ボード枠
  g.lineStyle(2, BOARD_EDGE, 1);
  g.beginFill(BOARD_COLOR);
  g.drawRect(-BOARD_W / 2, -BOARD_H - POLE_H, BOARD_W, BOARD_H);
  g.endFill();
  g.lineStyle(0);

  // ボード内の横線（木目っぽく）
  g.lineStyle(1, BOARD_EDGE, 0.4);
  for (let ly = -BOARD_H - POLE_H + 12; ly < -POLE_H - 4; ly += 12) {
    g.moveTo(-BOARD_W / 2 + 4, ly);
    g.lineTo(BOARD_W / 2 - 4, ly);
  }
  g.lineStyle(0);

  container.addChild(g);

  // テキスト：ボード中央に配置
  if (displayText) {
    signText.position.set(-signText.width / 2, -BOARD_H - POLE_H + (BOARD_H - signText.height) / 2);
    container.addChild(signText);
  }

  container.hitArea = new PIXI.Rectangle(-BOARD_W / 2, -BOARD_H - POLE_H, BOARD_W, BOARD_H + POLE_H);

  const onCloud = cloudRelX !== null && cloudRelX !== undefined &&
    cloud && cloud.container;

  if (onCloud) {
    // 高さに応じたスケール（y=0で0.45、y=480で1.0）
    const scale = 0.45 + 0.55 * (y / 480);
    container.scale.set(scale);
    // 右クリック時に確定した雲相対Xで配置（雲の動きに自動追従）
    container.position.set(cloudRelX, y + BOARD_H);
    container.zIndex = y;
    cloud.container.sortableChildren = true;
    cloud.container.addChild(container);
  } else {
    // ポール下端がクリック位置に来るようにBOARD_H分下げる
    container.position.set(x, y + BOARD_H);
    container.zIndex = y;
    room.container.addChild(container);
  }

  const signObj = { id, container, password: password || "", onCloud };

  container.on('pointerdown', pointerEvt => {
    if (pointerEvt.button === 2) {
      // 右クリック：削除メニューを表示
      pointerEvt.stopPropagation();
      signContextTarget = signObj;
      const pos = pointerEvt.data.getLocalPosition(room.container);
      const winWidth = window.innerWidth;
      const topOffset = winWidth > 870
        ? parseInt(window.getComputedStyle(titleBar).getPropertyValue('height'))
        : parseInt(window.getComputedStyle(form).getPropertyValue('height'));
      signContextMenu.style.left = pos.x + "px";
      signContextMenu.style.top = (pos.y + topOffset) + "px";
      _signContextMenuJustOpened = true; // windowイベントで即座に消えるのを防ぐ
      signContextMenu.style.display = "block";
    } else if (pointerEvt.button === 0 || ['touch', 'pen'].includes(pointerEvt.pointerType)) {
      // 左クリック：クリックメッセージをチャットに表示
      if (clickText) {
        outputChatMsg(`📋 ${clickText}`, false, false, false);
      }
    }
  });

  // タイマー設定：endTime から残り時間を計算（部屋移動で届いた時用）
  if (endTime && endTime > 0) {
    const remaining = endTime - Date.now();
    if (remaining <= 0) return; // すでに期限切れ
    signObj.timer = setTimeout(() => removeSign(signObj), remaining);
  }

  signs.push(signObj);
}

function removeSign(signObj) {
  if (signObj.timer) clearTimeout(signObj.timer);
  if (signObj.container.parent) signObj.container.parent.removeChild(signObj.container);
  signObj.container.destroy({ children: true });
  const idx = signs.indexOf(signObj);
  if (idx !== -1) signs.splice(idx, 1);
}

function removeAllSigns() {
  for (let i = signs.length - 1; i >= 0; i--) {
    removeSign(signs[i]);
  }
}

//設定
function updateStreamStatus() {
  const el = document.getElementById('streamStatus');
  if (!el) return;
  if (videoStatus && localStream) {
    const track = localStream.getVideoTracks()[0];
    if (track) {
      const s = track.getSettings();
      el.textContent = `配信中 ${s.width}×${s.height} @${Math.round(s.frameRate)}fps`;
      el.style.color = '#4c4';
      return;
    }
  }
  el.textContent = '';
}

function settingClick() {
  if (setting.style.display === "block") {
    document.getElementById("setting").style.display = "none";
    stopSettingPreview();
  } else {
    document.getElementById("setting").style.display = "block";
    populateDeviceSelects();
    updateStreamStatus();
  }
}

// Pくん
function clickPkun() {
  pkun.classList.add('moved');
}

let PkunFlag = true;
document.querySelector('svg').addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  if (PkunFlag) {
    clickPkun();
    PkunFlag = false;
  } else {
    pkun.classList.remove('moved');
    PkunFlag = true;
  }
}, { passive: true });

document.getElementById('streamQualitySelect').value = streamQualityLevel;
document.getElementById('receiverQualitySelect').value = receiverQualityLevel;
document.getElementById('cameraSelectMode').value = cameraSelectMode;
document.getElementById('micSelectMode').value = micSelectMode;
document.getElementById('multiCameraCheck').checked = multiCameraEnabled;

//ビデオサイズ
if (localStorage.getItem("videoSize")) {
  selectVideoSize.videoSize.value = localStorage.getItem("videoSize");
  if (selectVideoSize.videoSize.value === "setWidth") {//横幅でセットする場合
    selectVideoSize3Num.value = "";
    if (localStorage.getItem("videoWidth")) {
      selectVideoSize2Num.value = Number(localStorage.getItem("videoWidth"));
    } else {
      selectVideoSize2Num.value = 330;
    }
    if (localStorage.getItem("videoHeight")) {
      selectVideoSize3Num.placeholder = Number(localStorage.getItem("videoHeight"));
    } else {
      selectVideoSize3Num.placeholder = 180;
    }
  } else if (selectVideoSize.videoSize.value === "setHeight") {//立幅でセットする場合
    selectVideoSize2Num.value = "";
    if (localStorage.getItem("videoWidth")) {
      selectVideoSize2Num.placeholder = Number(localStorage.getItem("videoWidth"));
    } else {
      selectVideoSize2Num.placeholder = 330;
    }
    if (localStorage.getItem("videoHeight")) {
      selectVideoSize3Num.value = Number(localStorage.getItem("videoHeight"));
    } else {
      selectVideoSize3Num.value = 180;
    }
  } else {
    selectVideoSize2Num.value = "";
    selectVideoSize3Num.value = "";
    if (localStorage.getItem("videoWidth")) {
      selectVideoSize2Num.placeholder = Number(localStorage.getItem("videoWidth"));
    } else {
      selectVideoSize2Num.placeholder = 330;
    }

    if (localStorage.getItem("videoHeight")) {
      selectVideoSize3Num.placeholder = Number(localStorage.getItem("videoHeight"));
    } else {
      selectVideoSize3Num.placeholder = 180;
    }
  }
}

//入退出メッセージ表示切り替え
function changeShowJoinLeaveMsg() {
  showJoinLeaveMsg = document.getElementById('showJoinLeaveMsg').checked;
  localStorage.setItem("showJoinLeaveMsg", showJoinLeaveMsg);
}

function _updateLogHighlightUI() {
  document.getElementById('logHighlightSubs').style.opacity = useLogHighlight ? '' : '0.4';
  document.getElementById('avatarHighlightSpan').style.opacity = useAvatarHighlight ? '' : '0.4';
  document.getElementById('logItemHighlightSpan').style.opacity = useLogItemHighlight ? '' : '0.4';
}

function changeLogHighlight() {
  const allWereOff = !useLogHighlight && !useAvatarHighlight && !useLogItemHighlight;
  const allWereOn = useLogHighlight && useAvatarHighlight && useLogItemHighlight;

  useLogHighlight = document.getElementById('useLogHighlight').checked;
  useAvatarHighlight = document.getElementById('useAvatarHighlight').checked;
  useLogItemHighlight = document.getElementById('useLogItemHighlight').checked;

  if (allWereOn && !useLogHighlight) {
    // 全オン→マスターOFF：右二つも自動OFF
    useAvatarHighlight = false;
    useLogItemHighlight = false;
    document.getElementById('useAvatarHighlight').checked = false;
    document.getElementById('useLogItemHighlight').checked = false;
  }

  if (allWereOff) {
    if (useLogHighlight) {
      // 全オフ→マスターON：右二つも自動ON
      useAvatarHighlight = true;
      useLogItemHighlight = true;
      document.getElementById('useAvatarHighlight').checked = true;
      document.getElementById('useLogItemHighlight').checked = true;
    } else if (useAvatarHighlight || useLogItemHighlight) {
      // 全オフ→サブON：マスターだけ自動ON
      useLogHighlight = true;
      document.getElementById('useLogHighlight').checked = true;
    }
  }

  // 右二つが両方外れたらマスターも外す
  if (!useAvatarHighlight && !useLogItemHighlight) {
    useLogHighlight = false;
    document.getElementById('useLogHighlight').checked = false;
  }

  _updateLogHighlightUI();

  localStorage.setItem("useLogHighlight", useLogHighlight);
  localStorage.setItem("useAvatarHighlight", useAvatarHighlight);
  localStorage.setItem("useLogItemHighlight", useLogItemHighlight);
  if (!useLogHighlight) applyLogHighlight(null);
}

function _applyHighlightStyle(li, token, isAnnounce) {
  if (!('origBg' in li.dataset)) li.dataset.origBg = li.style.background;
  const c = (avaP[token] != null ? avaP[token].avatarColor : null) ?? 0xffffff;
  const r = (c >> 16) & 0xff;
  const g = (c >> 8) & 0xff;
  const b = c & 0xff;
  if (r + g + b < 60) {
    li.style.background = isAnnounce ? 'rgba(0,0,0,0.6)' : 'black';
    if (!('origColor' in li.dataset)) li.dataset.origColor = li.style.color;
    li.style.color = 'white';
  } else {
    li.style.background = `rgba(${r},${g},${b},${isAnnounce ? 0.3 : 0.7})`;
  }
}

function applyLogHighlight(token) {
  highlightToken = token;
  mainLogUl.querySelectorAll('li.log-highlight').forEach(li => {
    li.classList.remove('log-highlight');
    li.style.background = li.dataset.origBg ?? '';
    delete li.dataset.origBg;
    if ('origColor' in li.dataset) {
      li.style.color = li.dataset.origColor;
      delete li.dataset.origColor;
    }
  });
  if (token) {
    mainLogUl.querySelectorAll('li.' + CSS.escape(token)).forEach(li => {
      li.classList.add('log-highlight');
      _applyHighlightStyle(li, token, li.classList.contains('log-announce'));
    });
  }
}

function changeTTSSetting() {
  useTTS = document.getElementById('useTTS').checked;
  ttsMode = document.getElementById('ttsMode').value;
  localStorage.setItem("useTTS", useTTS);
  localStorage.setItem("ttsMode", ttsMode);
  if (!useTTS && _ttsCurrentAudio) {
    _ttsCurrentAudio.pause();
    _ttsCurrentAudio = null;
  }
}

function changeTTSVolume(value) {
  ttsVolume = parseFloat(value);
  localStorage.setItem("ttsVolume", ttsVolume);
}

function changeAllowOthersOekaki() {
  allowOthersOekaki = document.getElementById('allowOthersOekaki').checked;
  localStorage.setItem("allowOthersOekaki", allowOthersOekaki);
  socket.emit("setAllowOthersOekaki", { allow: allowOthersOekaki });
}

function changeOekakiPerStateMode() {
  oekakiPerStateMode = document.getElementById('oekakiPerStateMode').checked;
  localStorage.setItem("oekakiPerStateMode", oekakiPerStateMode);
  // モード変更を全アバターに即時反映
  for (const token in avaP) {
    if (avaP[token] && avaP[token].redrawOekakiForState) {
      avaP[token].redrawOekakiForState();
    }
  }
}

//左右反転
function changeVideoReverse() {
  if (selectVideoReverse.checked) {
    localStorage.setItem("videoReverse", true);
    if (videoArray[myToken]) {
      attachVideo(myToken + "Re", localStream);
    }
  } else {
    localStorage.setItem("videoReverse", false);
    if (videoArray[myToken + "Re"]) {
      detachVideo(myToken + "Re");
    }
  }
}
if (localStorage.getItem("videoReverse") === "1") {
  selectVideoReverse.checked = true;
} else {
  selectVideoReverse.checked = false;
}

//上下反転
function changeVideoInverse() {
  if (selectVideoInverse.checked) {
    localStorage.setItem("videoInverse", true);
    if (videoArray[myToken]) {
      attachVideo(myToken + "Inv", localStream);
    }
  } else {
    localStorage.setItem("videoInverse", false);
    if (videoArray[myToken + "Inv"]) {
      detachVideo(myToken + "Inv");
    }
  }
}
if (localStorage.getItem("videoInverse")) {
  selectVideoInverse.checked = true;
} else {
  selectVideoInverse.checked = false;
}
//上下左右反転
function changeVideoInverseAndReverse() {
  if (selectVideoInverseAndReverse.checked) {
    localStorage.setItem("videoInverseAndReverse", true);
    if (videoArray[myToken]) {
      attachVideo(myToken + "IR", localStream);
    }
  } else {
    localStorage.setItem("videoInverseAndReverse", false);
    if (videoArray[myToken + "IR"]) {
      detachVideo(myToken + "IR");
    }
  }
}
if (localStorage.getItem("videoInverseAndReverse")) {
  selectVideoInverseAndReverse.checked = true;
} else {
  selectVideoInverseAndReverse.checked = false;
}

//受信した動画の左右反転
function changeVideoReverseOther() {
  if (selectVideoReverseOther.checked) {
    localStorage.setItem("videoReverseOther", true);

    let flag = [];
    //やりたいことは、全てのkeyを見て、ReがないKeyがあれば、myTokenかどうか判断して、
    //それでも残れば、ビデオを作る
    Object.keys(videoArray).forEach(function (key) {
      if (key.match(/Re/)) {
        flag[key - "Re"] = true;
      }
    });
    Object.keys(videoArray).forEach(function (key) {
      if (!flag[key] && key !== myToken) {
        attachVideo(key + "Re", stream[key]);
      }
    });

  } else {
    localStorage.setItem("videoReverseOther", false);
    Object.keys(videoArray).forEach(function (key) {
      if (key.match(/Re/) && key !== myToken + "Re") {
        detachVideo(key);
      }
    });
  }
}
if (localStorage.getItem("videoReverseOther") === "1") {
  selectVideoReverseOther.checked = true;
} else {
  selectVideoReverseOther.checked = false;
}

//上下反転
function changeVideoInverseOther() {
  if (selectVideoInverseOther.checked) {
    localStorage.setItem("videoInverseOther", true);

    let flag = [];
    Object.keys(videoArray).forEach(function (key) {
      if (key.match(/Inv/)) {
        flag[key - "Inv"] = true;
      }
    });
    Object.keys(videoArray).forEach(function (key) {
      if (!flag[key] && key !== myToken) {
        attachVideo(key + "Inv", stream[key]);
      }
    });
  } else {
    localStorage.setItem("videoInverseOther", false);
    Object.keys(videoArray).forEach(function (key) {
      if (key.match(/Inv/) && key !== myToken + "Inv") {
        detachVideo(key);
      }
    });
  }
}
if (localStorage.getItem("videoInverseOther")) {
  selectVideoInverseOther.checked = true;
} else {
  selectVideoInverseOther.checked = false;
}

//上下左右反転
function changeVideoInverseAndReverseOther() {
  if (selectVideoInverseAndReverseOther.checked) {
    localStorage.setItem("videoInverseAndReverseOther", true);

    let flag = [];
    Object.keys(videoArray).forEach(function (key) {
      if (key.match(/IR/)) {
        flag[key - "IR"] = true;
      }
    });
    Object.keys(videoArray).forEach(function (key) {
      if (!flag[key] && key !== myToken) {
        attachVideo(key + "IR", stream[key]);
      }
    });
  } else {
    localStorage.setItem("videoInverseAndReverseOther", false);
    Object.keys(videoArray).forEach(function (key) {
      if (key.match(/IR/) && key !== myToken) {
        detachVideo(key);
      }
    });
  }
}

if (localStorage.getItem("videoInverseAndReverseOther") === "1") {
  selectVideoInverseAndReverseOther.checked = true;
} else {
  selectVideoInverseAndReverseOther.checked = false;
}

// 透過配信
let _mcOriginalParent = null;
let _mcOriginalNextSibling = null;

let _avaOverlayCtx = null;
let _avaOverlayPreTicker = null;
let _avaOverlayPostTicker = null;
let _avaOverlayRT = null;
let _vfMaskMap = new Map();
const _vfHiddenAvas = new Set();
let _overlayFloorSynced = false;

function _startAvaOverlay() {
  let el = document.getElementById('avaVideoOverlay');
  if (!el) return;
  if (el.parentNode !== document.body) document.body.appendChild(el);
  el.width = window.innerWidth;
  el.height = window.innerHeight;
  el.style.display = 'block';
  el.style.zIndex = '13';
  _avaOverlayCtx = el.getContext('2d');
  if (!_avaOverlayRT) _avaOverlayRT = PIXI.RenderTexture.create({ width: 660, height: 460 });

  const _isOnVideoFloor = (ava) => ava.container.parent && Object.values(videoFloorObjects).some(f => {
    const ly = ava.container.y - f.container.y;
    const lx = ava.container.x - f.container.x;
    const fw = f._pixiW || 660;
    return ly >= 0 && ly <= (f._pixiH || VIDEO_FLOOR_H) && lx >= -20 && lx < fw + 20;
  });

  // プリティッカー不要: PIXIが通常描画し、オーバーレイはcRect.bottom以下のみ担当
  if (_avaOverlayPreTicker) { app.ticker.remove(_avaOverlayPreTicker); _avaOverlayPreTicker = null; }
  for (const ava of Object.values(avaP)) { if (ava.container) ava.container.renderable = true; }

  // PIXI描画後: ビデオフロア上アバターの足元部分のみ描画
  // 透過モード: cRect基準（動画全画面のためvRect不使用）
  // 通常モード: vRect基準（動画追従・vsx/vsyで統一）
  if (_avaOverlayPostTicker) app.ticker.remove(_avaOverlayPostTicker);
  _avaOverlayPostTicker = () => {
    if (!_avaOverlayCtx) return;
    if (el.width !== window.innerWidth || el.height !== window.innerHeight) {
      el.width = window.innerWidth;
      el.height = window.innerHeight;
    }
    _avaOverlayCtx.clearRect(0, 0, el.width, el.height);
    for (const ava of _vfHiddenAvas) { if (ava.container) ava.container.renderable = true; }
    _vfHiddenAvas.clear();
    for (const ava of Object.values(avaP)) {
      if (!ava.container) continue;
      if (_isOnVideoFloor(ava)) {
        if (!_vfMaskMap.has(ava) && room) {
          const m = new PIXI.Graphics();
          room.container.addChild(m);
          _vfMaskMap.set(ava, m);
        }
        const m = _vfMaskMap.get(ava);
        if (m) { m.visible = true; ava.container.mask = m; }
      } else {
        const m = _vfMaskMap.get(ava);
        if (m && ava.container.mask === m) { ava.container.mask = null; m.visible = false; }
      }
    }
    const overlayAvas = Object.values(avaP).filter(_isOnVideoFloor);
    const hasDrawings = _videoFloorDrawingToken !== null || Object.values(videoFloorObjects).some(f => f.drawHistory && f.drawHistory.length > 0);
    const _isMugenVF = room && room.name === 'むげん' && Object.keys(videoFloorObjects).length > 0;
    const hasNonFloorOekaki = !_isMugenVF &&
      Object.values(avaP).some(ava => !ava.abon && ava.container.parent === room.container &&
        !_isOnVideoFloor(ava) && ava.drawHistory && ava.drawHistory.length > 0);
    if (overlayAvas.length === 0 && !hasDrawings && !_isMugenVF && !hasNonFloorOekaki) return;
    const cRect = myCanvas.getBoundingClientRect();
    const sx = cRect.width / 660, sy = cRect.height / 460;
    // 落書き＋アバターをz-order順（奥→手前）に描画
    const _sortedOverlayAvas = [...overlayAvas].sort((a, b) => a.container.y - b.container.y);
    const _extractedAvas = new Map();
    const _getExtracted = (ava) => {
      if (_extractedAvas.has(ava)) return _extractedAvas.get(ava);
      let ext;
      const _savedRenderable = ava.container.renderable;
      ava.container.renderable = true;
      const sm = ava.container.mask; ava.container.mask = null;
      ext = app.renderer.extract.canvas(ava.container);
      ava.container.mask = sm;
      ava.container.renderable = _savedRenderable;
      _extractedAvas.set(ava, ext || null);
      return ext || null;
    };
    const _maskedAvas = new Set();
    for (let _zi = 0; _zi < _videoFloorZOrder.length; _zi++) {
      const zToken = _videoFloorZOrder[_zi];
      const floorObj = videoFloorObjects[zToken];
      if (!floorObj) continue;
      // 前面フロアの矩形（穴として使う）
      const _frontHoles = [];
      for (let _fj = _zi + 1; _fj < _videoFloorZOrder.length; _fj++) {
        const _ft = _videoFloorZOrder[_fj];
        const _fv = videoArray[_ft];
        if (_fv) { const _fr = _fv.getBoundingClientRect(); if (_fr.width > 0 && _fr.height > 0) _frontHoles.push(_fr); }
      }
      // --- 落書き ---
      const drawingNow = _videoFloorDrawingToken === zToken && _videoFloorCurrentLine && _videoFloorCurrentLine.pointer.length >= 2;
      if (floorObj.drawHistory.length || drawingNow) {
        let clipLeft, clipTop, clipW, clipH, toScreen;
        const vEl = videoArray[zToken];
        if (vEl) {
          const vRect = vEl.getBoundingClientRect();
          if (vRect.width > 0 && vRect.height > 0) {
            clipLeft = vRect.left; clipTop = vRect.top;
            clipW = vRect.width; clipH = vRect.height;
            toScreen = (lx, ly) => ({ x: vRect.left + lx * vRect.width, y: vRect.top + ly * vRect.height });
          }
        }
        if (toScreen) {
          const lw = 2 * (clipW / 660);
          _avaOverlayCtx.save();
          _avaOverlayCtx.beginPath();
          _avaOverlayCtx.rect(clipLeft, clipTop, clipW, clipH);
          for (const _h of _frontHoles) _avaOverlayCtx.rect(_h.left, _h.top, _h.width, _h.height);
          _avaOverlayCtx.clip(_frontHoles.length ? 'evenodd' : 'nonzero');
          _avaOverlayCtx.lineCap = 'round';
          _avaOverlayCtx.lineJoin = 'round';
          const drawLines = (lines) => {
            for (const line of lines) {
              if (line.type !== 'line' || line.pointer.length < 2) continue;
              const r = (line.color >> 16) & 0xff, g = (line.color >> 8) & 0xff, b = line.color & 0xff;
              _avaOverlayCtx.strokeStyle = `rgba(${r},${g},${b},${line.alpha})`;
              _avaOverlayCtx.lineWidth = lw;
              _avaOverlayCtx.beginPath();
              const p0 = toScreen(line.pointer[0].x, line.pointer[0].y);
              _avaOverlayCtx.moveTo(p0.x, p0.y);
              for (let i = 1; i < line.pointer.length; i++) {
                const p = toScreen(line.pointer[i].x, line.pointer[i].y);
                _avaOverlayCtx.lineTo(p.x, p.y);
              }
              _avaOverlayCtx.stroke();
            }
          };
          drawLines(floorObj.drawHistory);
          if (drawingNow) drawLines([_videoFloorCurrentLine]);
          _avaOverlayCtx.restore();
        }
      }
      // --- アバター ---
      {
        const vEl = videoArray[zToken];
        if (!vEl) continue;
        const vRect = vEl.getBoundingClientRect();
        if (vRect.width === 0 || vRect.height === 0) continue;
        const fW = floorObj._pixiW || 660;
        const fH = floorObj._pixiH || VIDEO_FLOOR_H;
        const floorX = floorObj.container.x;
        const floorY = floorObj.container.y;
        for (const ava of _sortedOverlayAvas) {
          const bounds = ava.container.getBounds();
          if (bounds.width <= 0 || bounds.height <= 0) continue;
          const ly = ava.container.y - floorY;
          if (ly <= 0 || ly > fH + 5) continue;
          if (bounds.x + bounds.width < floorX - 20 || bounds.x > floorX + fW + 20) continue;
          const primaryFloor = Object.entries(videoFloorObjects).find(([, f]) => {
            const plx = ava.container.x - f.container.x;
            const ply = ava.container.y - f.container.y;
            return ply > 0 && ply <= (f._pixiH || VIDEO_FLOOR_H) + 5 && plx >= 0 && plx < (f._pixiW || 660);
          });
          if (primaryFloor && !videoArray[primaryFloor[0]]) continue;
          const isFf = !!(vEl && vEl.freeFloat);
          // プライマリフロアが現在フロアと一致するか（freeFloat時のrenderable=false対象判定に使用）
          const _isMyPrimary = !primaryFloor || primaryFloor[0] === zToken;
          // freeFloat全体描画: プライマリ一致 かつ アバターが完全に動画フロア内（PIXIエリアにはみ出しなし）
          const _isFfFull = isFf && _isMyPrimary && bounds.y >= floorY;
          const extracted = _getExtracted(ava);
          if (!extracted) continue;
          const posVsx = vRect.width / fW;
          const posVsy = vRect.height / fH;
          const drawS = vRect.width / 660;
          const floorFrac = _isFfFull ? 0 : Math.max(0, Math.min(1, (floorY - bounds.y) / bounds.height));
          const imgW = extracted.width, imgH = extracted.height;
          const srcY = floorFrac * imgH;
          const srcH = imgH - srcY;
          if (srcH <= 0) continue;
          const dstW = bounds.width * drawS;
          const dstH = (1 - floorFrac) * bounds.height * drawS;
          if (dstW <= 0 || dstH <= 0) continue;
          const centerDomX = vRect.left + (ava.container.x - floorX) * posVsx;
          const dstX = centerDomX + (bounds.x - ava.container.x) * drawS;
          const avaDomFeetY = vRect.top + (ava.container.y - floorY) * posVsy;
          const dstY = (_isFfFull || bounds.y >= floorY)
            ? avaDomFeetY - (ava.container.y - bounds.y) * drawS
            : vRect.top;
          _avaOverlayCtx.save();
          _avaOverlayCtx.beginPath();
          _avaOverlayCtx.rect(vRect.left, vRect.top, vRect.width, vRect.height);
          for (const _h of _frontHoles) {
            const iL = Math.max(vRect.left, _h.left), iT = Math.max(vRect.top, _h.top);
            const iR = Math.min(vRect.left + vRect.width, _h.left + _h.width), iB = Math.min(vRect.top + vRect.height, _h.top + _h.height);
            if (iR > iL && iB > iT) { _avaOverlayCtx.moveTo(iL, iT); _avaOverlayCtx.lineTo(iL, iB); _avaOverlayCtx.lineTo(iR, iB); _avaOverlayCtx.lineTo(iR, iT); _avaOverlayCtx.closePath(); }
          }
          _avaOverlayCtx.clip();
          _avaOverlayCtx.drawImage(extracted, 0, srcY, imgW, srcH, dstX, dstY, dstW, dstH);
          _avaOverlayCtx.restore();
          if (_isFfFull) {
            const m = _vfMaskMap.get(ava);
            if (m) m.clear();
            ava.container.renderable = false;
            _vfHiddenAvas.add(ava);
            _maskedAvas.add(ava);
          } else if (!_maskedAvas.has(ava)) {
            _maskedAvas.add(ava);
            const m = _vfMaskMap.get(ava);
            if (m && floorFrac > 0) {
              const clampH = Math.max(0, floorY - bounds.y);
              m.clear().beginFill(0xffffff).drawRect(bounds.x, bounds.y, bounds.width, clampH).endFill();
            }
          }
        }
      }
    }
    if (hasNonFloorOekaki) {
      for (const ava of Object.values(avaP)) {
        if (ava.abon || ava.container.parent !== room.container) continue;
        if (_isOnVideoFloor(ava)) continue;
        if (!ava.drawHistory || !ava.drawHistory.length) continue;
        const bounds = ava.container.getBounds();
        const bW = bounds.width, bH = bounds.height;
        if (!bW || !bH) continue;
        let extracted = null;
        for (const [t, f] of Object.entries(videoFloorObjects)) {
          const fW = f._pixiW || 660;
          const fH = f._pixiH || VIDEO_FLOOR_H;
          const floorX = f.container.x, floorY = f.container.y;
          if (bounds.y + bH <= floorY) continue;
          if (bounds.x + bW <= floorX || bounds.x >= floorX + fW) continue;
          const vEl = videoArray[t];
          if (!vEl) continue;
          const vRect = vEl.getBoundingClientRect();
          if (vRect.width === 0 || vRect.height === 0) continue;
          if (!extracted) { extracted = app.renderer.extract.canvas(ava.container); if (!extracted || !extracted.width || !extracted.height) break; }
          const eW = extracted.width, eH = extracted.height;
          const posVsx = vRect.width / fW;
          const posVsy = vRect.height / fH;
          const drawS = vRect.width / 660;
          const floorFrac = Math.max(0, Math.min(1, (floorY - bounds.y) / bH));
          const srcY = floorFrac * eH;
          const srcH = eH - srcY;
          if (srcH <= 0) continue;
          const dstW = bW * drawS;
          const dstH = (1 - floorFrac) * bH * drawS;
          if (dstW <= 0 || dstH <= 0) continue;
          const centerDomX = vRect.left + (ava.container.x - floorX) * posVsx;
          const dstX = centerDomX + (bounds.x - ava.container.x) * drawS;
          const dstY = vRect.top + Math.max(0, bounds.y - floorY) * drawS;
          _avaOverlayCtx.save();
          _avaOverlayCtx.beginPath();
          _avaOverlayCtx.rect(vRect.left, vRect.top, vRect.width, vRect.height);
          _avaOverlayCtx.clip();
          _avaOverlayCtx.drawImage(extracted, 0, srcY, eW, srcH, dstX, dstY, dstW, dstH);
          _avaOverlayCtx.restore();
        }
      }
    }
    if (_isMugenVF) {
      for (const [, entry] of _mugenGhostMap.entries()) {
        for (const g of entry.ghosts) {
          g.container.renderable = true;
          if (!g.container.visible) continue;
          const gBounds = g.container.getBounds();
          if (!gBounds.width || !gBounds.height) continue;
          const gbW = gBounds.width, gbH = gBounds.height;
          for (const t of Object.keys(videoFloorObjects)) {
            const f = videoFloorObjects[t];
            const fh = f._pixiH || VIDEO_FLOOR_H;
            const fw = f._pixiW || 660;
            if (gBounds.y + gbH < f.container.y - 50 || gBounds.y > f.container.y + fh + 50) continue;
            const gStageL = Math.max(gBounds.x, f.container.x);
            const gStageR = Math.min(gBounds.x + gbW, f.container.x + fw);
            if (gStageR <= gStageL) continue;
            const vElG = videoArray[t];
            if (!vElG) continue;
            const vRectG = vElG.getBoundingClientRect();
            if (vRectG.width === 0 || vRectG.height === 0) continue;
            const ghostExtracted = app.renderer.extract.canvas(g.container);
            if (!ghostExtracted || !ghostExtracted.width || !ghostExtracted.height) continue;
            const geW = ghostExtracted.width, geH = ghostExtracted.height;
            const gvsx = vRectG.width / fw;
            const gvsy = vRectG.height / fh;
            const gdrawS = vRectG.width / 660;
            const gCenterDomX = vRectG.left + (g.container.x - f.container.x) * gvsx;
            const gdstW = gbW * gdrawS;
            const gdstH = gbH * gvsy;
            const gdstX = gCenterDomX + (gBounds.x - g.container.x) * gdrawS;
            const gdstY = vRectG.top + (gBounds.y - f.container.y) * gvsy;
            _avaOverlayCtx.save();
            _avaOverlayCtx.beginPath();
            _avaOverlayCtx.rect(vRectG.left, vRectG.top, vRectG.width, vRectG.height);
            _avaOverlayCtx.clip();
            _avaOverlayCtx.drawImage(ghostExtracted, 0, 0, geW, geH, gdstX, gdstY, gdstW, gdstH);
            _avaOverlayCtx.restore();
          }
        }
      }
    }
  };
  app.ticker.add(_avaOverlayPostTicker, null, -1);
}

function _stopAvaOverlay() {
  if (_avaOverlayPreTicker) { app.ticker.remove(_avaOverlayPreTicker); _avaOverlayPreTicker = null; }
  if (_avaOverlayPostTicker) { app.ticker.remove(_avaOverlayPostTicker); _avaOverlayPostTicker = null; }
  _avaOverlayCtx = null;
  for (const [ava, m] of _vfMaskMap) { if (ava.container) ava.container.mask = null; m.destroy(); }
  _vfMaskMap.clear();
  for (const ava of Object.values(avaP)) { if (ava.container) ava.container.renderable = true; }
  for (const [, entry] of _mugenGhostMap.entries()) { for (const g of entry.ghosts) g.container.renderable = true; }
  const el = document.getElementById('avaVideoOverlay');
  if (el) el.style.display = 'none';
}

function _applyTransparentLayout() {
  const mcRect = mediaContainer.getBoundingClientRect();
  const baseToks = _videoSortedKeys().filter(tok => _isBaseVideoToken(tok));
  const N = baseToks.length;
  if (N === 0) return;
  const W = window.innerWidth;
  const isMobile = windowWidth <= 870;
  const localW = isMobile ? 660 : W;
  let topOffset = 0;
  baseToks.forEach((tok, i) => {
    const v = videoArray[tok];
    if (!v) return;
    const ar = (v.videoWidth && v.videoHeight) ? v.videoWidth / v.videoHeight : 0;
    const H = ar ? Math.round(localW / ar) : window.innerHeight;
    v.freeFloat = true;
    v.style.top = (topOffset - mcRect.top) + 'px';
    v.style.left = (-mcRect.left) + 'px';
    v.style.width = localW + 'px';
    v.style.height = H + 'px';
    topOffset += H;
  });
  mediaContainer.style.height = (topOffset - mcRect.top) + 'px';
  Object.keys(videoHandles).forEach(tok => _syncHandle(tok));
}

function _applyVideoTransparent() {
  if (_videoTransparentActive) {
    _applyTransparentLayout();
    Object.values(videoArray).forEach(v => { v.style.opacity = videoTransparentOpacity; });
    const _ovElOn = document.getElementById('avaVideoOverlay'); if (_ovElOn) _ovElOn.style.opacity = videoTransparentOpacity;
  } else {
    Object.keys(videoArray).forEach(tok => {
      const v = videoArray[tok];
      v.freeFloat = false;
      v.style.top = '';
      v.style.left = '';
      v.style.width = '';
      v.style.height = '';
      v.style.opacity = '';
    });
    mediaContainer.style.height = '';
    const _ovElOff = document.getElementById('avaVideoOverlay'); if (_ovElOff) _ovElOff.style.opacity = '';
    videoResize();
  }
}

function toggleVideoTransparent() {
  if (!videoTransparentDefault) return;
  _videoTransparentActive = !_videoTransparentActive;
  _applyVideoTransparent();
}

function changeVideoTransparentDefault() {
  videoTransparentDefault = document.getElementById('videoTransparentDefault').checked;
  localStorage.setItem("videoTransparentDefault", videoTransparentDefault);
}

function changeVideoTransparentOpacity(val) {
  videoTransparentOpacity = parseFloat(val);
  localStorage.setItem("videoTransparentOpacity", videoTransparentOpacity);
  if (_videoTransparentActive) {
    Object.values(videoArray).forEach(v => { v.style.opacity = videoTransparentOpacity; });
    const _ovEl = document.getElementById('avaVideoOverlay'); if (_ovEl) _ovEl.style.opacity = videoTransparentOpacity;
  }
}

// 映像ハンドルの位置同期
function _syncHandle(fromToken) {
  const v = videoArray[fromToken];
  const ov = videoOverlays[fromToken];
  if (!v || !ov) return;
  const boxW = v.clientWidth;
  const boxH = v.clientHeight;
  const vw = v.videoWidth;
  const vh = v.videoHeight;
  let oL = v.offsetLeft, oT = v.offsetTop, oW = boxW, oH = boxH;
  if (vw && vh && boxW && boxH) {
    const scale = Math.min(boxW / vw, boxH / vh);
    oW = Math.round(vw * scale);
    oH = Math.round(vh * scale);
  }
  ov.style.left = oL + 'px';
  ov.style.top = oT + 'px';
  ov.style.width = oW + 'px';
  ov.style.height = oH + 'px';
}

// 映像ジェスチャー（タッチ1本: ダブルタップ透過切替・スワイプ透過度調整 / タッチ2本: 移動+ピンチリサイズ同時 / マウス: ドラッグ移動）
function _addVideoInteraction(fromToken) {
  const v = videoArray[fromToken];

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:absolute;pointer-events:none;z-index:2;';
  const handle = document.createElement('div');
  handle.style.cssText = 'position:absolute;right:0;bottom:0;width:22px;height:22px;cursor:se-resize;touch-action:none;pointer-events:auto;background:rgba(180,180,180,0.5);border-radius:0 0 4px 0;box-sizing:border-box;';
  handle.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" style="position:absolute;bottom:2px;right:2px;"><path d="M3 11L11 3M7 11L11 7" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round"/></svg>';
  overlay.appendChild(handle);
  mediaContainer.appendChild(overlay);
  videoOverlays[fromToken] = overlay;
  videoHandles[fromToken] = handle;
  _syncHandle(fromToken);

  const ptrs = new Map(); // pointerId → {x, y}
  let tapTime = 0;
  let tapForwardTimer = null;
  let startX, startY, startLeft, startTop, startW, startH;
  let startOpacity = 0;
  let pinchStartDist = 0;
  let pinchStartCenter = { x: 0, y: 0 };
  let moved = false;
  let mode = null; // 'mouse-move' | 'two-finger' | 'video-draw'
  let _dragSx = 1, _dragSy = 1;

  const _vfLocalCoords = (cx, cy) => {
    const floorObj = videoFloorObjects[fromToken];
    if (!floorObj) return null;
    const vRect = v.getBoundingClientRect();
    if (vRect.width === 0 || vRect.height === 0) return null;
    return { x: (cx - vRect.left) / vRect.width, y: (cy - vRect.top) / vRect.height };
  };

  v.style.touchAction = 'none';
  v.addEventListener('touchstart', (e) => { e.preventDefault(); }, { passive: false });
  v.addEventListener('pointerdown', (e) => {
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.preventDefault();
    v.setPointerCapture(e.pointerId);

    _bringVideoFloorToFront(fromToken);
    if (videoFloorObjects[fromToken] && !_videoFloorFocused) {
      _videoFloorFocused = true;
      switchDrawing(avatarOekakiToken);
    }

    if (ptrs.size >= 2) {
      // 2本指: 移動+ピンチ同時開始（中心点と指間距離を記録）
      mode = 'two-finger';
      const pts = [...ptrs.values()];
      pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStartCenter = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      startLeft = v.offsetLeft; startTop = v.offsetTop;
      startW = v.clientWidth; startH = v.clientHeight;
      moved = false;
      return;
    }

    // アバター落書きモード（avatarOekakiTokenが設定済み＋Ctrl）
    if (avatarOekakiToken && avaP[avatarOekakiToken] && (isDownCtrl || clickedWa_iButtun) && ptrs.size === 1) {
      const ava = avaP[avatarOekakiToken];
      if (ava.container.y >= VIDEO_FLOOR_Y) {
        const pos = _vfLocalCoords(e.clientX, e.clientY);
        if (pos) {
          const _fvf = videoFloorObjects[fromToken];
          const globalPt = new PIXI.Point(
            (_fvf ? _fvf.container.x + pos.x * (_fvf._pixiW || 660) : pos.x * 660),
            VIDEO_FLOOR_Y + pos.y * (_fvf ? (_fvf._pixiH || VIDEO_FLOOR_H) : VIDEO_FLOOR_H)
          );
          const localPt = ava.container.worldTransform.applyInverse(globalPt);
          ava.container.addChild(room.drawingGraphics);
          room.drawingGraphics.clear();
          room.drawingGraphics.lineStyle(2, oekakiColor, oekakiAlpha);
          room.drawingGraphics.moveTo(localPt.x, localPt.y);
          room.currentLine = {
            type: "line", token: myToken,
            uuid: Math.random().toString(36).slice(2, 11),
            color: oekakiColor, alpha: oekakiAlpha,
            pointer: [{ x: localPt.x, y: localPt.y }],
            stateKey: ava.currentAvaStateKey,
          };
          lastPosition.x = localPt.x;
          lastPosition.y = localPt.y;
          oekakityu = true;
          mode = 'avatar-draw';
          startX = e.clientX; startY = e.clientY;
          moved = false;
          return;
        }
      }
    }

    // 描画モード（1本指、Ctrl or wa_iボタン）
    const floorObj = videoFloorObjects[fromToken];
    if ((isDownCtrl || clickedWa_iButtun) && floorObj && floorObj.oekakiAllowed && ptrs.size === 1) {
      const pos = _vfLocalCoords(e.clientX, e.clientY);
      if (pos) {
        _videoFloorCurrentLine = { type: 'line', color: oekakiColor, alpha: oekakiAlpha, pointer: [pos] };
        _videoFloorDrawingToken = fromToken;
        floorObj.previewGraphics.clear();
        floorObj.previewGraphics.lineStyle(2, oekakiColor, oekakiAlpha);
        floorObj.previewGraphics.moveTo(pos.x, pos.y);
        mode = 'video-draw';
        startX = e.clientX; startY = e.clientY;
        moved = false;
        return;
      }
    }

    // 1本指
    startX = e.clientX; startY = e.clientY;
    startOpacity = videoTransparentOpacity;
    moved = false;
    if (e.pointerType === 'mouse') {
      mode = 'mouse-move';
      startLeft = v.offsetLeft; startTop = v.offsetTop;
      const _dr = v.getBoundingClientRect();
      _dragSx = _dr.width > 0 ? v.clientWidth / _dr.width : 1;
      _dragSy = _dr.height > 0 ? v.clientHeight / _dr.height : 1;
    } else {
      mode = null;
    }
  });

  v.addEventListener('pointermove', (e) => {
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (mode === 'two-finger' && ptrs.size >= 2) {
      const pts = [...ptrs.values()];
      const newCenter = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const newDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      moved = true;
      v.freeFloat = true;
      // パン（中心点の移動量をそのまま位置に加算）
      v.style.left = (startLeft + newCenter.x - pinchStartCenter.x) + 'px';
      v.style.top = (startTop + newCenter.y - pinchStartCenter.y) + 'px';
      // ピンチ（指間距離の比率でサイズ変更）
      if (pinchStartDist > 0) {
        const scale = newDist / pinchStartDist;
        v.style.width = Math.max(80, Math.round(startW * scale)) + 'px';
        v.style.height = Math.max(45, Math.round(startH * scale)) + 'px';
      }
      _syncHandle(fromToken);
      return;
    }

    if (mode === 'mouse-move') {
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
      if (moved) {
        v.freeFloat = true;
        v.style.left = (startLeft + dx * _dragSx) + 'px';
        v.style.top = (startTop + dy * _dragSy) + 'px';
        _syncHandle(fromToken);
      }
    } else if (mode === 'avatar-draw') {
      const ava = avatarOekakiToken && avaP[avatarOekakiToken];
      if (!ava || !room.currentLine) { mode = null; }
      else {
        const pos = _vfLocalCoords(e.clientX, e.clientY);
        if (pos) {
          const _fvf2 = videoFloorObjects[fromToken];
          const globalPt = new PIXI.Point(
            (_fvf2 ? _fvf2.container.x + pos.x * (_fvf2._pixiW || 660) : pos.x * 660),
            VIDEO_FLOOR_Y + pos.y * (_fvf2 ? (_fvf2._pixiH || VIDEO_FLOOR_H) : VIDEO_FLOOR_H)
          );
          const localPt = ava.container.worldTransform.applyInverse(globalPt);
          room.draw(localPt.x, localPt.y);
          moved = true;
        }
      }
    } else if (mode === 'video-draw') {
      const floorObj = videoFloorObjects[fromToken];
      if (_videoFloorCurrentLine && floorObj) {
        const pos = _vfLocalCoords(e.clientX, e.clientY);
        if (pos) {
          const ptr = _videoFloorCurrentLine.pointer;
          const prev = ptr[ptr.length - 1];
          ptr.push(pos);
          floorObj.previewGraphics.moveTo(prev.x, prev.y); // PIXIバグ: lineTo前にmoveTo必須
          floorObj.previewGraphics.lineTo(pos.x, pos.y);
          moved = true;
        }
      }
    } else if (mode === null && _videoTransparentActive && e.pointerType !== 'mouse') {
      // タッチ1本水平スワイプ → 透過度調整
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 8) moved = true;
      if (moved) {
        const newVal = Math.max(0.3, Math.min(0.99, startOpacity + dx * 1.96 / window.innerWidth));
        videoTransparentOpacity = newVal;
        document.getElementById('videoTransparentOpacitySlider').value = newVal;
        localStorage.setItem("videoTransparentOpacity", newVal);
        Object.values(videoArray).forEach(vv => { vv.style.opacity = newVal; });
        const _ovElSw = document.getElementById('avaVideoOverlay'); if (_ovElSw) _ovElSw.style.opacity = newVal;
      }
    }
  });

  v.addEventListener('pointerup', (e) => {
    ptrs.delete(e.pointerId);

    if (mode === 'two-finger') {
      if (ptrs.size < 2) mode = null;
      return;
    }

    if (mode === 'avatar-draw') {
      mode = null;
      if (oekakityu) {
        room.sendCurrentLine();
        oekakityu = false;
        room.currentLine = null;
        switchDrawing(avatarOekakiToken);
      }
      return;
    }

    if (mode === 'video-draw') {
      mode = null;
      const floorObj = videoFloorObjects[fromToken];
      if (floorObj) {
        floorObj.previewGraphics.clear();
        if (_videoFloorDrawingToken === fromToken) _videoFloorSendCurrentLine();
      }
      return;
    }

    if (!moved) {
      const fx = e.clientX, fy = e.clientY;
      const forwardToCanvas = () => {
        if (floorPolyMode || _imgDoodleMode) return;
        const cRect = myCanvas.getBoundingClientRect();
        if (videoFloorObjects[fromToken]) {
          const vRect = v.getBoundingClientRect();
          if (vRect.width > 0 && vRect.height > 0 &&
              fx >= vRect.left && fx <= vRect.right && fy >= vRect.top && fy <= vRect.bottom) {
            const normX = (fx - vRect.left) / vRect.width;
            const floorObj = videoFloorObjects[fromToken];
            const pixiW = floorObj ? (floorObj._pixiW || 660) : 660;
            const pixiH = floorObj ? (floorObj._pixiH || VIDEO_FLOOR_H) : VIDEO_FLOOR_H;
            const floorX = floorObj ? floorObj.container.x : 0;
            const tapPixiY = VIDEO_FLOOR_Y + Math.max(0, Math.min(pixiH, (fy - vRect.top) * 660 / vRect.width));
            _doStageTap(Math.max(0, Math.min(660, floorX + normX * pixiW)), tapPixiY);
            return;
          }
        }
        const withinBounds = fx >= cRect.left && fx <= cRect.right && fy >= cRect.top && fy <= cRect.bottom;
        if (withinBounds) {
          const targetX = (fx - cRect.left) * (660 / cRect.width);
          const targetY = (fy - cRect.top) * (460 / cRect.height);
          _doStageTap(targetX, targetY);
          return;
        }
        if (!videoFloorObjects[fromToken]) return;
        const targetX = Math.max(0, Math.min(660, (fx - cRect.left) * 660 / cRect.width));
        const targetY = VIDEO_FLOOR_Y + Math.max(0, Math.min(VIDEO_FLOOR_H, (fy - cRect.bottom) * 460 / cRect.height));
        _doStageTap(targetX, targetY);
      };
      {
        const now = Date.now();
        if (now - tapTime < 300) {
          clearTimeout(tapForwardTimer);
          tapForwardTimer = null;
          toggleVideoTransparent();
          tapTime = 0;
        } else {
          tapTime = now;
          clearTimeout(tapForwardTimer);
          tapForwardTimer = setTimeout(() => { tapForwardTimer = null; forwardToCanvas(); }, 310);
        }
      }
    }
    if (ptrs.size === 0) mode = null;
  });

  v.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const pos = _vfLocalCoords(e.clientX, e.clientY);
    if (!pos) return;
    let hitAva = null, minDist = 45;
    for (const ava of Object.values(avaP)) {
      if (!ava.container.parent || ava.container.y < VIDEO_FLOOR_Y) continue;
      const d = Math.hypot(pos.x - ava.container.x, pos.y - (ava.container.y - VIDEO_FLOOR_Y));
      if (d < minDist) { minDist = d; hitAva = ava; }
    }
    if (!hitAva) return;
    if (avatarOekakiToken !== hitAva.token) avatarOekakiToken = false;
    contextMenu.dataset.token = hitAva.token;
    if (avatarOekakiToken === hitAva.token) {
      avatarOekakiMenu.textContent = "ラクガキをやめる";
      avatarOekakiMenu.style.display = "block";
    } else if (hitAva.token === myToken || avaP[hitAva.token]?.allowOthersOekaki !== false) {
      avatarOekakiMenu.textContent = "ラクガキする";
      avatarOekakiMenu.style.display = "block";
    } else {
      avatarOekakiMenu.style.display = "none";
    }
    if (hitAva.token !== myToken) {
      abonMenu.style.display = "block";
      abonMenu.textContent = hitAva.abon ? "アボン解除" : "アボン";
    } else {
      abonMenu.style.display = "none";
    }
    document.getElementById('roomEditMenu').style.display = 'none';
    contextMenu.style.display = "block";
    contextMenuPositionSet(e);
  });

  v.addEventListener('wheel', (e) => {
    if (!_videoTransparentActive) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    const newVal = Math.max(0.3, Math.min(0.99, videoTransparentOpacity + delta));
    videoTransparentOpacity = newVal;
    document.getElementById('videoTransparentOpacitySlider').value = newVal;
    localStorage.setItem('videoTransparentOpacity', newVal);
    Object.values(videoArray).forEach(vv => { vv.style.opacity = newVal; });
    const _ovElWh = document.getElementById('avaVideoOverlay'); if (_ovElWh) _ovElWh.style.opacity = newVal;
  }, { passive: false });

  // リサイズハンドル（タッチ/マウスともシングルドラッグ）
  handle.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handle.setPointerCapture(e.pointerId);
    let hStartX = e.clientX, hStartY = e.clientY;
    let hStartW = v.clientWidth, hStartH = v.clientHeight;
    const _r0 = v.getBoundingClientRect();
    const _hsx = _r0.width > 0 ? hStartW / _r0.width : 1;
    const _hsy = _r0.height > 0 ? hStartH / _r0.height : 1;
    let hMoved = false;
    const onMove = (e) => {
      const dx = e.clientX - hStartX, dy = e.clientY - hStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hMoved = true;
      if (hMoved) {
        v.freeFloat = true;
        const vw = v.videoWidth, vh = v.videoHeight;
        const ar = (vw && vh) ? vw / vh : hStartW / hStartH;
        const newW = Math.max(80, hStartW + dx * _hsx);
        v.style.width = newW + 'px';
        v.style.height = Math.max(45, newW / ar) + 'px';
        const needed = v.offsetTop + v.clientHeight;
        if (needed > parseInt(mediaContainer.style.height || 0)) mediaContainer.style.height = needed + 'px';
        _syncHandle(fromToken);
      }
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', () => handle.removeEventListener('pointermove', onMove), { once: true });
  });
}

document.getElementById('videoTransparentDefault').checked = videoTransparentDefault;
document.getElementById('videoTransparentOpacitySlider').value = videoTransparentOpacity;
document.getElementById('streamSurfaceAllowed').checked = _streamSurfaceAllowed;
if (document.getElementById('videoAutoReset')) document.getElementById('videoAutoReset').checked = _videoAutoReset;

//フォントサイズ
if (localStorage.getItem("fontSize")) {
  mainLog.style.fontSize = localStorage.getItem("fontSize") + "px";
} else {
  mainLog.style.fontSize = "17px";
}

fontSizeSelecter.onchange = function () {
  localStorage.setItem("fontSize", this.value);
  mainLog.style.fontSize = this.value + "px";
}

//画面サイズの読みこみ
if (window.innerWidth > 870 && localStorage.getItem("PMsize")) {
  PMsize = localStorage.getItem("PMsize");
} else {
  PMsize = "1.0";
}

//ウィンドウサイズ変更時の処理
let windowWidth = window.innerWidth;

windowResize(true);

let mainLogScrollHeight;
let mainLogScrollTop;
let mainLogClientHeight;
mainLog.onscroll = () => {
  mainLogScrollHeight = mainLog.scrollHeight;
  mainLogScrollTop = mainLog.scrollTop;
  mainLogClientHeight = mainLog.clientHeight;
}

function over870andBottomBar() {//
  windowWidth = window.innerWidth;
  windowResize();
  if (window.innerWidth > 870) {//window.innerWidthが870以上の場所に移動した場合
    mainLog.scrollTop = mainLog.scrollHeight;//スクロールを一番下にする

  } else {//870以下の場所に移動した場合
    mainLog.scrollTop = 0;
  }
}

function under870andTopBar() {
  windowWidth = window.innerWidth;
  windowResize();
  if (window.innerWidth > 870) {//windowサイズが870以上になったら
    mainLog.scrollTop = mainLog.scrollHeight;//スクロールを一番下にする
  }

}

function elseBar() {
  windowWidth = window.innerWidth;
  mainLogScrollTop = mainLog.scrollTop;
  windowResize();
  mainLog.scrollTop = mainLogScrollTop;
  mainLogScrollHeight = mainLog.scrollHeight;
  // mainLogScrollTop = mainLog.scrollTop;
  mainLogClientHeight = mainLog.clientHeight;
}

//画面サイズが変わった時にチャットのスクロールバーを動かす
window.addEventListener("resize", () => {
  if (windowWidth > 870 && mainLogScrollHeight - mainLogScrollTop <= mainLogClientHeight + 1) {//windowサイズが870以上の時かつ、スクロールバーが一番下にある時
    over870andBottomBar();
  } else if (windowWidth <= 870 && mainLog.scrollTop == 0) {//windowサイズが870以下の時、かつスクロールバーが一番上にある時
    under870andTopBar();
  } else {
    elseBar();
  }
}, { passive: true });

function windowResize(isInitial = false) {
  if (windowWidth <= 870) {
    let PMscale = windowWidth / 660;
    let scale = "scale(" + PMscale + ")";
    StyleDeclarationSetTransform(main.style, scale);
    let position = "0px 0px";
    StyleDeclarationSetOrigin(main.style, position);

    titleBar.style.width = 1 / PMscale * 100 + "%";

    if (Pmain.classList.contains('flexContainer')) {
      Pmain.classList.remove("flexContainer");
    }
    if (!Pmain.classList.contains('flexContainerColumn')) {
      Pmain.classList.add("flexContainerColumn");
    }

    document.getElementById("PmainLeft").appendChild(mainLogFrame);
    mainLogFrame.style.width = windowWidth / PMscale + "px";
    //メインログ
    if (useMainLog) {
      _setBtnState(mainLogButton, "skyblue");
      const mainLogHeight = localStorage.getItem("mainLogHeight") ? Number(localStorage.getItem("mainLogHeight")) : 200;
      mainLog.style.height = mainLogHeight + "px";
      mainLogFrame.style.height = mainLogHeight + "px";
      mainLogResizeBar.style.display = "block";
    } else {
      _setBtnState(mainLogButton, "red");
      mainLog.style.height = 0 + "px";
      mainLogFrame.style.height = 0 + "px";
      mainLogResizeBar.style.display = "none";
    }

    if (isInitial && localStorage.getItem("showOverlayChat") === null) {
      _setBtnState(useOverlayChatButton, "skyblue");
      overlayChat.visible = true;
      useOverlayChat = true;
      localStorage.setItem("showOverlayChat", "1");
    } else {
      overlayChat.visible = useOverlayChat;
      _setBtnState(useOverlayChatButton, useOverlayChat ? 'skyblue' : 'red');
    }

    // // mainLog.style.fontSize = "13px";
    // //IE11対策
    // footer.style.width = windowWidth + "px";
    // footer.style.width = kousinrireki.clientWidth + "px";
    mainFrame.style.width = window.innerWidth + "px";
    mainFrame.style.height = window.innerHeight + "px";
    document.getElementById("sizeSelecterFrame").style.display = "none";

  } else {//870以上の時
    document.getElementById("sizeSelecterFrame").style.display = "";
    let scale = "scale(" + PMsize + ")";
    StyleDeclarationSetTransform(main.style, scale);

    let position = "0px 0px";
    StyleDeclarationSetOrigin(main.style, position);

    if (Pmain.classList.contains('flexContainerColumn')) {
      Pmain.classList.remove("flexContainerColumn");
    }
    if (!Pmain.classList.contains('flexContainer')) {
      Pmain.classList.add("flexContainer");
    }

    mainLogFrame.style.width = (window.innerWidth - (660 * Number(PMsize))) / Number(PMsize) + "px";
    titleBar.style.width = 1 / Number(PMsize) * 100 + "%";

    //メインログ
    mainLog.style.height = 539 + "px";
    mainLogFrame.style.height = 539 + "px";
    document.getElementById("PmainTop").appendChild(mainLogFrame);
    mainLogResizeBar.style.display = "none";

    //画面chat
    overlayChat.visible = false;
    mainFrame.style.width = window.innerWidth + "px";
    mainFrame.style.height = window.innerHeight + "px";

    videoResize();
  }
}

function fucusVidoeSize(value) {//カーソル選択時
  if (value) {
    selectVideoSize.videoSize.value = value;
    setVideoValue();
  }
}

function changeVideoValue() {
  Object.keys(videoArray).forEach(function (key) {//人のビデオサイズ
    videoArray[key].fixFlag = false;
  });
  setVideoValue();
}

selectVideoSize2Num.onkeydown = e => {
  Object.keys(videoArray).forEach(function (key) {//人のビデオサイズ
    videoArray[key].fixFlag = false;
  });
  setVideoValue();
}

selectVideoSize3Num.onkeydown = e => {
  Object.keys(videoArray).forEach(function (key) {//人のビデオサイズ
    videoArray[key].fixFlag = false;
  });
  setVideoValue();
}

//最初期の入力は
//localstrageから表示形式ををとってきて、表示形式別に値を入れてく
//あとで入力する場合は表示形式を取得、入ってる値を入力,localStragenに値を入力

function setVideoValue() {//値の表記を変更
  localStorage.setItem("videoSize", selectVideoSize.videoSize.value);
  if (selectVideoSize.videoSize.value === "setWidth") {//横幅でセットする場合
    if (!selectVideoSize2Num.value) {//値が入ってなければ
      selectVideoSize2Num.value = selectVideoSize2Num.placeholder;
    }
    localStorage.setItem("videoWidth", selectVideoSize2Num.value);
    if (selectVideoSize3Num.value) {//値があれば
      selectVideoSize3Num.placeholder = selectVideoSize3Num.value;
      selectVideoSize3Num.value = "";
    }
  } else if (selectVideoSize.videoSize.value === "setHeight") {//立幅でセットする場合
    if (!selectVideoSize3Num.value) {//値が入ってなければ
      selectVideoSize3Num.value = selectVideoSize3Num.placeholder;
    }
    localStorage.setItem("videoHeight", selectVideoSize3Num.value);
    if (selectVideoSize2Num.value) {//値があれば
      selectVideoSize2Num.placeholder = selectVideoSize2Num.value;
      selectVideoSize2Num.value = "";
    }
  } else {//setMaxの時
    if (selectVideoSize2Num.value) {
      selectVideoSize2Num.placeholder = selectVideoSize2Num.value;
      selectVideoSize2Num.value = "";
    }
    if (selectVideoSize3Num.value) {
      selectVideoSize3Num.placeholder = selectVideoSize3Num.value;
      selectVideoSize3Num.value = "";
    }
  }
  videoResize();
}

function _videoSortedKeys() {
  const getBase = tok => tok.replace(/(Re|Inv|IR)$/, '');
  return Object.keys(videoArray).sort((a, b) => (videoStartOrder[getBase(a)] || Infinity) - (videoStartOrder[getBase(b)] || Infinity));
}

function videoResize() {
  const _curVideoCount = Object.keys(videoArray).length;
  if (_videoAutoReset && _curVideoCount !== _lastVideoCount) {
    Object.keys(videoArray).forEach(key => { videoArray[key].freeFloat = false; videoArray[key].style.top = '0'; });
  }
  _lastVideoCount = _curVideoCount;
  if (Object.keys(videoArray).length) {
    let left = 0;
    let allWidth = 0;
    let effectiveW, containerH;
    if (windowWidth <= 870) {
      const PMscale = windowWidth / 660;
      effectiveW = 660;
      containerH = window.innerHeight / PMscale - mainLogFrame.clientHeight - titleBar.clientHeight;
    } else {
      effectiveW = window.innerWidth;
      containerH = window.innerHeight - mainLogFrame.clientHeight - titleBar.clientHeight;
    }
    let orgR = [];
    let maxHeight = 0;

    Object.keys(videoArray).forEach(function (key) {
      let orgW = videoArray[key].videoWidth;//動画のオリジナル横サイズ
      let orgH = videoArray[key].videoHeight;//動画のオリジナル縦サイズ
      orgR[key] = orgH / orgW;//動画のオリジナル比率
    });

    if (selectVideoSize.videoSize.value === "setMax") {//最大値にするとき
      let used = 0;
      let remain = 0;
      Object.keys(videoArray).forEach(function (key) {//人の要素の高さを変更
        if (videoArray[key].freeFloat) return;
        if (!videoArray[key].fixFlag) {
          allWidth += containerH / orgR[key];
          remain += containerH / orgR[key];
        } else {
          allWidth += videoArray[key].clientWidth;
          used += videoArray[key].clientWidth;
        }
      });
      _videoSortedKeys().forEach(function (key) {//人の要素の高さを変更
        if (videoArray[key].freeFloat) {
          if (videoArray[key].clientHeight > maxHeight) maxHeight = videoArray[key].clientHeight;
          _syncHandle(key);
          return;
        }
        if (!videoArray[key].fixFlag) {//要素が固定されてない時
          videoArray[key].style.width = containerH / orgR[key] / allWidth * 100 + "%";
          videoArray[key].style.height = 100 + "%";

          if (effectiveW > allWidth) {//確保できてる立幅/窓の横幅<一番大きい映像の立幅/映像の合計値//横を調整しないといけない時
            videoArray[key].style.left = left + "px";//横の位置を指定
            left += (allWidth - used) / remain * containerH / orgR[key];//横の隙間を入れなおして、ビデオの幅を追加
            videoArray[key].style.width = (allWidth - used) / remain * containerH / orgR[key] + "px";//横の位置を指定
            videoArray[key].style.height = (allWidth - used) / remain * containerH + "px";//横の位置を指定

          } else {//縦を調整しないと行けない時
            //残ってる割合を分け合って、比率の分だけわけた割合
            videoArray[key].style.width = (effectiveW - used) / remain * containerH / orgR[key] + "px";//横の幅を指定
            videoArray[key].style.left = left + "px";//横の位置を指定
            left += (effectiveW - used) / remain * containerH / orgR[key];  //要素が占領している幅を足す
            videoArray[key].style.height = (effectiveW - used) / remain * containerH + "px";//高さを指定
          }
        } else {
          videoArray[key].style.left = left + "px";
          left += videoArray[key].clientWidth;
        }

        let leftTmp = left;
        let ewFlag = false;
        videoArray[key].onmousemove = (event) => {//画像の端で動いてる時
          if (leftTmp - 10 < event.clientX && event.clientX <= leftTmp + 5) {
            body.style.cursor = "ew-resize";
          } else if (ewFlag === false) {
            body.style.cursor = "auto";
          }
        }
        videoArray[key].onmouseout = (event) => {
          if (ewFlag === false) {
            body.style.cursor = "auto";
          }
        }
        videoArray[key].onmousedown = (event) => {//画像の端をクリックした時
          if (leftTmp - 10 < event.clientX && event.clientX <= leftTmp) {
            ewFlag = true;
            videoArray[key].fixFlag = true;
            window.onmousemove = (event) => {//カーソルに画像の大きさを追従させる
              left = 0;
              maxHeight = 0;
              Object.keys(videoArray).forEach(function (keyTmp) {//人の要素の高さを変更
                videoArray[keyTmp].style.left = left + "px";
                if (key === keyTmp) {
                  videoArray[key].style.width = event.clientX - left + "px";//時のになる
                  videoArray[key].style.height = (event.clientX - left) * orgR[key] + "px";
                  if ((event.clientX - left) * orgR[key] > maxHeight) {//他の高さ全てより大きい場合は
                    maxHeight = (event.clientX - left) * orgR[key];
                  }
                  left = event.clientX;
                } else {
                  if (videoArray[keyTmp].clientHeight > maxHeight) {//他の高さ全てより大きい場合は
                    maxHeight = videoArray[keyTmp].clientHeight;
                  }
                  left += videoArray[keyTmp].clientWidth;
                }
              });
              mediaContainer.style.height = maxHeight + "px";
            }
            window.onmouseup = () => {
              window.onmousemove = null;
              window.onmouseup = null;
              body.style.cursor = "auto";
              ewFlag = false;
              videoResize();
            }
          }
        };

        if (!videoArray[key].fixFlag) {
          if (effectiveW > allWidth) {
            if (containerH > maxHeight) {
              maxHeight = containerH;
            }
          } else {
            if (effectiveW * containerH / allWidth > maxHeight) {
              maxHeight = (effectiveW - used) / remain * containerH;
            }
          }
        } else {
          if (videoArray[key].clientHeight > maxHeight) {
            maxHeight = videoArray[key].clientHeight;
          }
        }
      });
    } else if (selectVideoSize.videoSize.value === "setWidth") {//横の大きさで揃える
      _videoSortedKeys().forEach(function (key) {//人の要素の高さを変更
        if (videoArray[key].freeFloat) {
          if (videoArray[key].clientHeight > maxHeight) maxHeight = videoArray[key].clientHeight;
          _syncHandle(key);
          return;
        }
        if (!videoArray[key].fixFlag) {
          videoArray[key].style.width = selectVideoSize2Num.value + "px";
          videoArray[key].style.height = selectVideoSize2Num.value * orgR[key] + "px";
          videoArray[key].style.left = left + "px";
          left += Number(selectVideoSize2Num.value);
        } else {
          videoArray[key].style.left = left + "px";
          left += videoArray[key].clientWidth;
        }
        let leftTmp = left;
        let ewFlag = false;
        videoArray[key].onmousemove = (event) => {//画像の端で動いてる時
          if (leftTmp - 10 < event.clientX && event.clientX <= leftTmp + 5) {
            body.style.cursor = "ew-resize";
          } else if (ewFlag === false) {
            body.style.cursor = "auto";
          }
        }
        videoArray[key].onmouseout = (event) => {
          if (ewFlag === false) {
            body.style.cursor = "auto";
          }
        }
        videoArray[key].onmousedown = (event) => {//画像の端をクリックした時
          if (leftTmp - 10 < event.clientX && event.clientX <= leftTmp) {
            ewFlag = true;
            videoArray[key].fixFlag = true;
            window.onmousemove = (event) => {//カーソルに画像の大きさを追従させる
              left = 0;
              maxHeight = 0;
              Object.keys(videoArray).forEach(function (keyTmp) {//人の要素の高さを変更
                videoArray[keyTmp].style.left = left + "px";
                if (key === keyTmp) {
                  videoArray[key].style.width = event.clientX - left + "px";//時のになる
                  videoArray[key].style.height = (event.clientX - left) * orgR[key] + "px";
                  if ((event.clientX - left) * orgR[key] > maxHeight) {//他の高さ全てより大きい場合は
                    maxHeight = (event.clientX - left) * orgR[key];
                  }
                  left = event.clientX;
                } else {
                  if (videoArray[keyTmp].clientHeight > maxHeight) {//他の高さ全てより大きい場合は
                    maxHeight = videoArray[keyTmp].clientHeight;
                  }
                  left += videoArray[keyTmp].clientWidth;
                }
              });
              mediaContainer.style.height = maxHeight + "px";
            }
            window.onmouseup = () => {
              window.onmousemove = null;
              window.onmouseup = null;
              body.style.cursor = "auto";
              ewFlag = false;
              videoResize();
            }
          }
        };
        if (!videoArray[key].fixFlag) {
          if (selectVideoSize2Num.value * orgR[key] > maxHeight) {
            maxHeight = selectVideoSize2Num.value * orgR[key];
          }
        } else {
          if (videoArray[key].clientHeight > maxHeight) {
            maxHeight = videoArray[key].clientHeight;
          }
        }
      });

    } else if (selectVideoSize.videoSize.value === "setHeight") {//縦の大きさで揃える
      _videoSortedKeys().forEach(function (key) {//人の要素の高さを変更
        if (videoArray[key].freeFloat) {
          if (videoArray[key].clientHeight > maxHeight) maxHeight = videoArray[key].clientHeight;
          _syncHandle(key);
          return;
        }
        if (!videoArray[key].fixFlag) {
          videoArray[key].style.height = selectVideoSize3Num.value + "px";
          videoArray[key].style.width = selectVideoSize3Num.value / orgR[key] + "px";
          videoArray[key].style.left = left + "px";
          left += selectVideoSize3Num.value / orgR[key];
        } else {
          videoArray[key].style.left = left + "px";
          left += videoArray[key].clientWidth;
        }

        let leftTmp = left;
        let ewFlag = false;
        videoArray[key].onmousemove = (event) => {//画像の端で動いてる時
          if (leftTmp - 10 < event.clientX && event.clientX <= leftTmp + 5) {
            body.style.cursor = "ew-resize";
          } else if (ewFlag === false) {
            body.style.cursor = "auto";
          }
        }
        videoArray[key].onmouseout = (event) => {
          if (ewFlag === false) {
            body.style.cursor = "auto";
          }
        }
        videoArray[key].onmousedown = (event) => {//画像の端をクリックした時
          if (leftTmp - 10 < event.clientX && event.clientX <= leftTmp) {
            ewFlag = true;
            videoArray[key].fixFlag = true;
            window.onmousemove = (event) => {//カーソルに画像の大きさを追従させる
              left = 0;
              maxHeight = 0;
              Object.keys(videoArray).forEach(function (keyTmp) {//人の要素の高さを変更
                videoArray[keyTmp].style.left = left + "px";
                if (key === keyTmp) {
                  videoArray[key].style.width = event.clientX - left + "px";//時のになる
                  videoArray[key].style.height = (event.clientX - left) * orgR[key] + "px";
                  if ((event.clientX - left) * orgR[key] > maxHeight) {//他の高さ全てより大きい場合は
                    maxHeight = (event.clientX - left) * orgR[key];
                  }
                  left = event.clientX;
                } else {
                  if (videoArray[keyTmp].clientHeight > maxHeight) {//他の高さ全てより大きい場合は
                    maxHeight = videoArray[keyTmp].clientHeight;
                  }
                  left += videoArray[keyTmp].clientWidth;
                }
              });
              mediaContainer.style.height = maxHeight + "px";
            }
            window.onmouseup = () => {
              window.onmousemove = null;
              window.onmouseup = null;
              body.style.cursor = "auto";
              ewFlag = false;
              videoResize();
            }
          }
        };
        if (!videoArray[key].fixFlag) {
          if (selectVideoSize3Num.value > maxHeight) {
            maxHeight = selectVideoSize3Num.value;
          }
        } else {
          if (videoArray[key].clientHeight > maxHeight) {
            maxHeight = videoArray[key].clientHeight;
          }
        }
      });
    }
    mediaContainer.style.height = maxHeight + "px";
    Object.keys(videoArray).forEach(k => _syncHandle(k));
    if (Object.keys(videoFloorObjects).length > 0) _recalcFloorPositions();
  } else {
    mediaContainer.style.height = 0 + "px";
  }
}
window.addEventListener('resize', videoResize);

sizeSelecter.onchange = function () {
  let scale = "scale(" + this.value + ")";
  StyleDeclarationSetTransform(main.style, scale);
  StyleDeclarationSetOrigin(main.style, "0px 0px");
  PMsize = this.value;

  if (windowWidth > 870) {
    localStorage.setItem("PMsize", this.value);
    titleBar.style.width = 1 / Number(PMsize) * 100 + "%";

    mainLogFrame.style.width = (window.innerWidth - (660 * Number(PMsize))) / Number(PMsize) + "px";
  }
}

function StyleDeclarationSetTransform(style, value) {//設定したい要素,設定内容//大きさを変える
  let list = [
    "transform",
    "webkitTransform",
    "MozTransform",
    "msTransform",
    "OTransform",
  ];
  let i;
  let num = list.length;
  for (i = 0; i < num; i++) {
    style[list[i]] = value;
    if (style[list[i]] !== undefined) {
      return true;
    }
  }
  return false;
}
function StyleDeclarationSetOrigin(style, value) {//設定したい要素,設定内容//↑の起点位置を変える
  let list = [
    "transformOrigin",
    "webkitTransformOrigin",
    "MozTransformOrigin",
    "msTransformOrigin",
    "OTransformOrigin",
  ];
  let i;
  let num = list.length;
  for (i = 0; i < num; i++) {
    style[list[i]] = value;
    if (style[list[i]] !== undefined) {
      return true;
    }
  }
  return false;
}

//配信機能
//video/audioButtonはボタンがあるかどうか(配信が聞ける状態かどうか)
//video/audioButtonFlagはボタンを押してる状態かどうか
//remote/Videos/Audiosはパネルが出てるかどうか

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia || navigator.msGetUserMedia;
RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;

socket.on("stream", data => {
  outputChatMsg(data.msg, "green", data.token, true);
});

socket.on("roomPermissionsChanged", data => {
  _applyStreamButtonVisibility(data.allow_video ?? 1, data.allow_audio ?? 1);
});

socket.on("roomBgColorChanged", data => {
  _applyRoomBgColor(data.color || null);
});

socket.on("roomAssetsChanged", (data) => {
  if (!room || _SYSTEM_ROOM_NAMES.has(room.name)) return;
  if (imgEditRoomId === room.name || warpEditRoomId === room.name) return;
  if (data && data.images !== undefined) {
    clearDbImages(); dbRoomImages = data.images; drawDbImages();
  } else {
    loadDbImages(room.name);
  }
  if (data && data.warps !== undefined) {
    clearWarpZones(); dbWarpZones = data.warps; drawWarpZones();
  } else {
    loadDbWarpZones(room.name).then(() => drawWarpZones());
  }
  if (!data || data.images === undefined) loadDbScaleZones(room.name);
});

let _entryLockFirstUsedAt = null;
let _entryLocked = false;

function _updateEntryLockBtn() {
  const btn = document.getElementById('entryLockBtn');
  if (!btn) return;
  btn.textContent = _entryLocked ? '🔒' : '🔓';
  const expired = _entryLockFirstUsedAt && Date.now() - _entryLockFirstUsedAt > 3600000;
  btn.disabled = !_entryLocked && expired;
  btn.style.opacity = btn.disabled ? '0.4' : '1';
  btn.title = _entryLocked ? '入室制限中（クリックで解除）' : (expired ? '入室制限は1時間経過のため使用不可' : '入室を制限する');
}

socket.on("entryLockChanged", data => {
  _entryLocked = data.locked;
  if (data.firstUsedAt) _entryLockFirstUsedAt = data.firstUsedAt;
  _updateEntryLockBtn();
  if (data.expired) {
    outputChatMsg('⏰ 入室制限が1時間経過したため自動解除されました。', '#f88');
  } else if (data.locked) {
    const exp = new Date(data.expiresAt);
    const hhmm = exp.getHours().toString().padStart(2,'0') + ':' + exp.getMinutes().toString().padStart(2,'0');
    outputChatMsg('🔒 入室制限が有効になりました（' + hhmm + 'まで）', '#fa0');
  } else {
    outputChatMsg('🔓 入室制限が解除されました', '#8af');
  }
});

socket.on("entryBlocked", () => {
  outputChatMsg('この部屋は現在入室制限中です。', '#f44');
  _inRoomTransition = false;
  const _back = _prevRoomForBlockReturn;
  _prevRoomForBlockReturn = null;
  if (_back) goSelfToRoomSpot(_roomToSpot(_back));
  else goSelfToRoomSpot('entranceMainSpot');
});

socket.on("entryLockDenied", () => {
  _entryLockFirstUsedAt = _entryLockFirstUsedAt || (Date.now() - 3600001);
  _updateEntryLockBtn();
  outputChatMsg('入室制限は最初の使用から1時間経過のため使用できません。', '#f88');
});

document.getElementById('entryLockBtn')?.addEventListener('click', () => {
  socket.emit('entryLockToggle');
});

// ソケットIOで "mediaButton" イベントを受信した時の処理
socket.on("mediaButton", data => {
  // デバッグ用に内容を表示

  // 送信元IDを取得
  let fromToken = data.from;

  // メディア状態の問い合わせ（部屋入室時など）
  if (data.type === 'callMediaStatus') {
    // 動画配信中ならボタン作成通知
    if (videoStatus) {
      socket.emit("mediaButton", { type: 'createVideoButton', quality: streamQualityLevel, startTime: videoStartOrder[myToken] });
    }
    // 追加カメラ配信中なら各ボタン作成通知
    for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
      const _xc = _xcam[_cn];
      if (_xc && _xc.status && _xc.stream) {
        socket.emit('mediaButton', { type: 'createVideoButtonN', camIdx: _cn, startTime: videoStartOrder[myToken + '_' + _cn], streamId: _xc.stream.id });
      }
    }
    // 音声配信中ならボタン作成通知
    if (audioStatus) {
      socket.emit("mediaButton", { type: 'createAudioButton', });
    }
  }
  // 動画受信ボタンの作成要求
  else if (data.type === 'createVideoButton') {
    if (data.startTime) {
      videoStartOrder[fromToken] = data.startTime;
      if (videoFloorObjects[fromToken]) _recalcFloorPositions();
    }
    if (!videoButton[fromToken] || videoButton[fromToken].style.visibility === "hidden") {
      createVideoButton(fromToken);
    }
  }
  // 追加カメラN 動画受信ボタンの作成要求
  else if (data.type === 'createVideoButtonN') {
    const _cn = data.camIdx;
    if (_cn >= 2 && _cn <= MAX_CAMS) {
      if (data.startTime) videoStartOrder[fromToken + '_' + _cn] = data.startTime;
      const _xcN = _xcamGet(_cn);
      _xcN.streamId[fromToken] = data.streamId;
      // ontrackがcreateVideoButtonNより先に来た場合のpending解決
      if (data.streamId && _pendingRemoteVideoStreams[fromToken] && _pendingRemoteVideoStreams[fromToken][data.streamId]) {
        _xcN.remoteStream[fromToken] = _pendingRemoteVideoStreams[fromToken][data.streamId];
        delete _pendingRemoteVideoStreams[fromToken][data.streamId];
      }
      const _xb = _xcN.button;
      if (!_xb[fromToken] || _xb[fromToken].style.visibility === 'hidden') {
        createVideoButtonN(_cn, fromToken);
      } else if (_xcN.remoteStream[fromToken] && _xcN.buttonFlag[fromToken] === true && !videoArray[fromToken + '_' + _cn]) {
        // ボタン既表示・pending解決でremoteStreamが届いた → 直接attach
        _xb[fromToken].style.backgroundColor = 'skyblue';
        attachVideo(fromToken + '_' + _cn, _xcN.remoteStream[fromToken]);
      }
    }
  }
  // 追加カメラN 動画ボタン削除要求
  else if (data.type === 'removeVideoButtonN') {
    const _cn = data.camIdx;
    if (_cn >= 2 && _cn <= MAX_CAMS) {
      const _xcN2 = _xcamGet(_cn);
      const _xb = _xcN2.button;
      if (_xb[fromToken]) _xb[fromToken].style.visibility = 'hidden';
      if (videoArray[fromToken + '_' + _cn]) detachVideo(fromToken + '_' + _cn);
      _xcN2.remoteStream[fromToken] = null;
      delete _xcN2.streamId[fromToken];
      // すべてのボタンが非表示ならメディア要素ごと削除
      let _anyVisible = (videoButton[fromToken] && videoButton[fromToken].style.visibility !== 'hidden') ||
                        (audioButton[fromToken] && audioButton[fromToken].style.visibility !== 'hidden');
      if (!_anyVisible) {
        for (let _ci = 2; _ci <= MAX_CAMS; _ci++) {
          const _xbi = _xcam[_ci] && _xcam[_ci].button[fromToken];
          if (_xbi && _xbi.style.visibility !== 'hidden') { _anyVisible = true; break; }
        }
      }
      if (!_anyVisible) removeMediaElementButton(fromToken);
    }
  }
  // 音声受信ボタンの作成要求
  else if (data.type === 'createAudioButton') {
    if (!audioButton[fromToken] || audioButton[fromToken].style.visibility === "hidden") {
      createAudioButton(fromToken);
    }
  }
  // 配信者の画質変更通知
  else if (data.type === 'streamQuality') {
    requestReceiverQuality(fromToken);
  }
  // 動画ボタン削除要求
  else if (data.type === "remove video button") {
    videoButton[fromToken].style.visibility = "hidden"
    // 映像パネルを切断・古いストリーム参照をクリア（再配信時のontrack誤判定防止）
    if (videoArray[fromToken]) detachVideo(fromToken);
    if (videoArray[fromToken + 'Re']) detachVideo(fromToken + 'Re');
    if (videoArray[fromToken + 'Inv']) detachVideo(fromToken + 'Inv');
    if (videoArray[fromToken + 'IR']) detachVideo(fromToken + 'IR');
    stream[fromToken] = null;
    delete _pendingRemoteVideoStreams[fromToken];
    // cam2+ボタンも音声ボタンも非表示ならメディア要素ごと削除
    let _anyCamNVis = false;
    for (let _ci = 2; _ci <= MAX_CAMS; _ci++) {
      if (_xcam[_ci] && _xcam[_ci].button[fromToken] && _xcam[_ci].button[fromToken].style.visibility !== 'hidden') { _anyCamNVis = true; break; }
    }
    if (!_anyCamNVis && (!audioButton[fromToken] || audioButton[fromToken].style.visibility === 'hidden')) {
      removeMediaElementButton(fromToken);
    }
  }
  // 音声ボタン削除要求
  else if (data.type === "remove audio button") {
    audioButton[fromToken].style.visibility = "hidden";
    // 動画ボタンも非表示ならメディア要素ごと削除
    if (!videoButton[fromToken] || videoButton[fromToken].style.visibility === "hidden") {
      removeMediaElementButton(fromToken);
    }
  }
});

socket.on("webRtcSignal", function (data) {
  // デバッグ用に内容を表示

  // 送信元IDを取得
  let fromToken = data.from;
  // 動画接続要求
  if (data.type === 'call video') {
    console.log('[webRtcSignal] call video from', fromToken, 'localStream:', !!localStream, 'peerConn:', !!peerConnections[fromToken]);
    if (!canConnectMore()) {
      // 接続数が多すぎる場合は無視
      console.warn('TOO MANY connections, so ignore');
    }
    else if (!localStream) {
      console.warn('[webRtcSignal] no localStream, ignored');
    }
    else if (peerConnections[fromToken]) {
      console.warn('[webRtcSignal] peerConnection already exists, ignored');
    }
    else {
      // 新規接続（動画のみ）
      makeOffer(fromToken, true, false);
    }
  }
  // 音声接続要求
  else if (data.type === 'call audio') {
    if (!canConnectMore()) {
      console.warn('TOO MANY connections, so ignore');
    }
    else if (!localStream) {
    }
    if (peerConnections[fromToken]) {
    }
    else {
      // 新規接続（音声のみ）
      makeOffer(fromToken, false, true);
    }
  }
  // 動画＋音声接続要求
  else if (data.type === 'call video and audio') {
    if (!canConnectMore()) {
      console.warn('TOO MANY connections, so ignore');
    }
    else if (!localStream) {
    }
    if (peerConnections[fromToken]) {
    }
    else {
      // 新規接続（動画＋音声）
      makeOffer(fromToken, true, true);
    }
  }
  // WebRTCのOffer受信時
  else if (data.type === 'offer') {
    let offer = new RTCSessionDescription(data);
    setOffer(fromToken, offer);
  }
  // WebRTCのAnswer受信時
  else if (data.type === 'answer') {
    let answer = new RTCSessionDescription(data);
    setAnswer(fromToken, answer);
  }
  // ICE Candidate受信時
  else if (data.type === 'candidate') {
    let candidate = new RTCIceCandidate(data.ice);
    addIceCandidate(fromToken, candidate);
  }
});

// --- RTCPeerConnections ---
function canConnectMore() {//コネクションの限界値を超えないようにする
  return (peerConnections.length < MAX_CONNECTION_COUNT);
}

function removeMediaElementButton(fromToken) {
  if (mediaElement[fromToken]) {
    // if (document.getElementById("mediaMenu").mediaElement[fromToken]) {//問題起こりそうだけど一旦消しとく
    document.getElementById("mediaMenu").removeChild(mediaElement[fromToken]);
    delete mediaElement[fromToken];
    if (videoArray[fromToken]) {
      detachVideo(fromToken);
    }
    if (remoteAudios[fromToken]) {
      detachAudio(fromToken);
    }
  }
}

// 接続を切断する関数（id指定）
// メディア要素・ボタン・フラグ・ピアコネクション・mapPeerを削除
function stopConnection(fromToken) {
  if (mediaElement[fromToken]) {
    if (videoButton[fromToken]) videoButton[fromToken].style.visibility = "hidden";
    if (audioButton[fromToken]) audioButton[fromToken].style.visibility = "hidden";
    if (videoButtonFlag[fromToken]) delete videoButtonFlag[fromToken];
    if (audioButtonFlag[fromToken]) delete audioButtonFlag[fromToken];
    // 追加カメラボタンも非表示
    for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
      const _xc = _xcam[_cn];
      if (!_xc) continue;
      if (_xc.button[fromToken]) _xc.button[fromToken].style.visibility = "hidden";
      if (_xc.buttonFlag[fromToken] !== undefined) delete _xc.buttonFlag[fromToken];
    }
    removeMediaElementButton(fromToken);
  }
  // 追加カメラのクリーンアップ
  for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
    const _xc = _xcam[_cn];
    if (!_xc) continue;
    if (videoArray[fromToken + '_' + _cn]) detachVideo(fromToken + '_' + _cn);
    delete _xc.streamId[fromToken];
    delete _xc.remoteStream[fromToken];
  }
  const _pend = _pendingRemoteVideoStreams[fromToken];
  if (_pend) { Object.values(_pend).forEach(s => { if (s) s.getTracks().forEach(t => t.stop()); }); }
  delete _pendingRemoteVideoStreams[fromToken];
  // ピアコネクションを切断・削除
  if (peerConnections[fromToken]) {
    let peer = peerConnections[fromToken];
    peer.close();
    delete peerConnections[fromToken];
  }
  // mapPeerからも削除
  if (mapPeer.get(fromToken)) {
    mapPeer.delete(fromToken);
  }
}

// 全ての接続を切断する関数
function stopAllConnection() {
  const keys = Object.keys(mediaElement);
  keys.forEach(function (fromToken) {
    removeMediaElementButton(fromToken);
    if (videoButton[fromToken]) videoButton[fromToken].style.visibility = "hidden";
    if (audioButton[fromToken]) audioButton[fromToken].style.visibility = "hidden";
    if (videoButtonFlag[fromToken]) delete videoButtonFlag[fromToken];
    if (audioButtonFlag[fromToken]) delete audioButtonFlag[fromToken];
    for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
      const _xc = _xcam[_cn];
      if (!_xc) continue;
      if (_xc.button[fromToken]) _xc.button[fromToken].style.visibility = "hidden";
      if (_xc.buttonFlag[fromToken] !== undefined) delete _xc.buttonFlag[fromToken];
      if (videoArray[fromToken + '_' + _cn]) detachVideo(fromToken + '_' + _cn);
      delete _xc.streamId[fromToken];
      delete _xc.remoteStream[fromToken];
    }
  });
  // mapPeerの全idに対してstopConnectionを実行
  mapPeer.forEach(function (value, token) {
    stopConnection(token);
  });
}

// --- video要素の追加 ---
// tokenごとにvideo要素を作成し、mediaContainerに追加
function attachVideo(fromToken, stream) {
  videoArray[fromToken] = document.createElement('video');
  videoArray[fromToken].classList.add("video");
  videoArray[fromToken].muted = true;
  videoArray[fromToken].autoplay = true;
  videoArray[fromToken].setAttribute('playsinline', '');
  videoArray[fromToken].style.position = "absolute";
  videoArray[fromToken].style.top = 0 + "px";
  videoArray[fromToken].style.zIndex = 0;
  videoArray[fromToken].style.objectFit = 'contain';
  videoArray[fromToken].style.objectPosition = 'left top';
  // 左右反転
  if (fromToken.match(/Re/)) {
    videoArray[fromToken].style.transform = "scaleX(-1)";
  }
  // 上下反転
  if (fromToken.match(/Inv/)) {
    videoArray[fromToken].style.transform = "scaleY(-1)";
  }
  // 上下左右反転
  if (fromToken.match(/IR/)) {
    videoArray[fromToken].style.transform = "scale(-1,-1)";
  }

  _addVideoInteraction(fromToken);
  mediaContainer.appendChild(videoArray[fromToken]);
  if (_videoTransparentActive) {
    _applyTransparentLayout();
    Object.values(videoArray).forEach(v => { v.style.opacity = videoTransparentOpacity; });
    const _ovElAt = document.getElementById('avaVideoOverlay'); if (_ovElAt) _ovElAt.style.opacity = videoTransparentOpacity;
  }

  playMedia(videoArray[fromToken], stream);
  // 再生できない場合のエラー表示
  let p = document.createElement("p");
  p.textContent = "なんか再生できてないvideo";
  videoArray[fromToken].appendChild(p);
  // メタデータ読み込み時にvideoResizeを呼ぶ
  videoArray[fromToken].addEventListener('loadedmetadata', (event) => {
    videoResize();
    if (fromToken === myToken) _syncVideoFloor(fromToken);
    if (_isBaseVideoToken(fromToken) && fromToken !== myToken && !videoFloorObjects[fromToken] && !/^.+_\d+$/.test(fromToken)) {
      socket.emit('requestVideoSurface', { floorToken: fromToken });
    }
    if (!_avaOverlayPostTicker && videoFloorObjects[fromToken]) _startAvaOverlay();
  }, { passive: true });
  // playing時にvideoWidthが確定するため再計算（srcObjectはloadedmetadataでvideoWidth=0になる場合がある）
  videoArray[fromToken].addEventListener('playing', () => {
    if (Object.keys(videoFloorObjects).length > 0) videoResize();
  }, { once: true, passive: true });
}

function attachAudio(fromToken, stream) {//remoteAudioの追加
  let audio = document.createElement('audio');
  audio.autoplay = true;
  // audio.token = 'remote_audio_' + token;//↓↓のやつとともにしばらく消してみて様子見
  mediaContainer.appendChild(audio);
  remoteAudios[fromToken] = audio;//たぶんこれもaudio消してremoteAudiosで統一していい
  playMedia(audio, stream);
  audio.volume = audioVolume[fromToken].value;

  // 受信音声の音量可視化（createMediaStreamSource: audio要素の再生を妨げない）
  if (!_remoteAudioCtx) _remoteAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_remoteAudioCtx.state === 'suspended') _remoteAudioCtx.resume().catch(() => {});
  try {
    const source = _remoteAudioCtx.createMediaStreamSource(stream);
    const analyser = _remoteAudioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.4;
    source.connect(analyser);
    _remoteAnalysers[fromToken] = analyser;
    _startRemoteVolumeViz(fromToken);
  } catch (_e) {}

  // スマホやタブレットの自動再生制限対策
  document.addEventListener('pointerdown', () => {
    audio.play();
    audio.volume = 1;
    if (_remoteAudioCtx && _remoteAudioCtx.state === 'suspended') _remoteAudioCtx.resume().catch(() => {});
  }, { passive: true, once: true });

  //エラーの場合
  let p = document.createElement("p");
  p.textContent = "なんか再生できてないaudio";
  audio.appendChild(p);
}

function detachVideo(token) {//videoの削除
  const v = videoArray[token];
  if (v) {
    pauseMedia(v);
    if (v.parentNode) v.parentNode.removeChild(v);
    delete videoArray[token];
  }
  if (!/Re$|Inv$|IR$/.test(token) && !videoFloorObjects[token]) delete videoStartOrder[token];
  if (videoOverlays[token]) { videoOverlays[token].remove(); delete videoOverlays[token]; }
  if (videoHandles[token]) { delete videoHandles[token]; }
  if (_isBaseVideoToken(token)) {
    if (token === myToken) {
      _removeVideoFloor(token);
      socket.emit('videoSurface', { token, enabled: false });
    }
    // 他者の動画を閉じた場合はフロアを残す（videoSurface: enabled=false で消す）
  }
  if (_videoTransparentActive) { _applyTransparentLayout(); } else { videoResize(); }
}

// --- ビデオ足場システム ---

function _isBaseVideoToken(tok) {
  return !/Re$|Inv$|IR$/.test(tok);
}

function _videoToPIXI(v) {
  return { x: 0, y: VIDEO_FLOOR_Y, width: 660, height: VIDEO_FLOOR_H };
}

function _recalcFloorPositions() {
  const allTokens = Object.keys(videoFloorObjects).sort((a, b) => (videoStartOrder[a] || Infinity) - (videoStartOrder[b] || Infinity));
  const N = allTokens.length;
  if (N === 0) return;

  const ars = allTokens.map(tok => {
    const intr = videoFloorIntrinsic[tok];
    return (intr && intr.w > 0 && intr.h > 0) ? intr.w / intr.h : 16 / 9;
  });
  const totalAR = ars.reduce((s, ar) => s + ar, 0);
  const pixiH = Math.max(50, Math.round(660 * N / totalAR));

  const myAva = avaP[myToken];
  let selfFloorTok = null, selfRelX = 0, selfRelY = 0;
  if (myAva && myAva.container.y > VIDEO_FLOOR_Y) {
    for (const tok of allTokens) {
      const f = videoFloorObjects[tok];
      if (!f._pixiW) continue;
      const lx = myAva.container.x - f.container.x;
      if (lx >= -20 && lx < f._pixiW + 20) {
        selfFloorTok = tok;
        selfRelX = lx / f._pixiW;
        selfRelY = Math.max(0, Math.min(1, (myAva.container.y - VIDEO_FLOOR_Y) / pixiH));
        break;
      }
    }
  }

  let pixiX = 0;
  allTokens.forEach((tok, i) => {
    const f = videoFloorObjects[tok];
    const w = i === N - 1 ? 660 - pixiX : Math.round(660 * ars[i] / totalAR);
    f.container.x = pixiX;
    f.container.y = VIDEO_FLOOR_Y;
    f.container.hitArea = new PIXI.Rectangle(0, 0, w, pixiH + 1);
    f._pixiW = w;
    f._pixiH = pixiH;
    pixiX += w;
  });

  if (selfFloorTok && videoFloorObjects[selfFloorTok]) {
    const nf = videoFloorObjects[selfFloorTok];
    const newX = nf.container.x + selfRelX * nf._pixiW;
    const newY = VIDEO_FLOOR_Y + selfRelY * pixiH;
    if (Math.abs(myAva.container.x - newX) > 1 || Math.abs(myAva.container.y - newY) > 1) {
      gsap.killTweensOf(myAva.container);
      myAva.isMoving = false;
      AX = Math.max(0, Math.min(660, newX));
      AY = Math.max(VIDEO_FLOOR_Y, Math.min(VIDEO_FLOOR_Y + pixiH, newY));
      myAva.container.x = AX;
      myAva.container.y = AY;
      if (myAva.ridingObject === nf) {
        const sx = nf.container.scale?.x ?? 1;
        const sy = nf.container.scale?.y ?? 1;
        myAva.ridingOffset.x = (AX - nf.container.x) / (sx || 1);
        myAva.ridingOffset.y = (AY - nf.container.y) / (sy || 1);
      }
      myAva.sendTransformData("フロア再配置");
    }
  }
}

function _updateVideoFloor(token, pixiX, pixiY, pixiW, pixiH, drawHistory) {
  let floorObj = videoFloorObjects[token];
  if (!floorObj) {
    const container = new PIXI.Container();
    container.eventMode = 'none';
    const oekakiGraphics = new PIXI.Graphics();
    const previewGraphics = new PIXI.Graphics();
    container.addChild(oekakiGraphics);
    container.addChild(previewGraphics);
    floorObj = { container, oekakiGraphics, previewGraphics, drawHistory: [], redoStack: [], tags: ['standable'], name: 'videoFloor:' + token, oekakiAllowed: true };
    videoFloorObjects[token] = floorObj;
    objMap['videoFloor:' + token] = floorObj;
    if (!_videoFloorZOrder.includes(token)) { _videoFloorZOrder.push(token); _updateVideoZIndices(); }
  }
  if (room && room.container && !floorObj.container.parent) {
    room.container.addChild(floorObj.container);
  }
  floorObj.container.x = pixiX;
  floorObj.container.y = pixiY;
  const w = Math.max(pixiW, 10);
  const h = Math.max(pixiH || 100, 10);
  floorObj.container.hitArea = new PIXI.Rectangle(0, 0, w, h);
  if (drawHistory && drawHistory.length) {
    floorObj.drawHistory = drawHistory;
    _redrawVideoFloorOekaki(token);
  }
  floorObj._intrinsicH = h;
  if (!_avaOverlayPostTicker) _startAvaOverlay();
  if (!_videoTransparentActive) { videoResize(); } else { _recalcFloorPositions(); _applyTransparentLayout(); }
  // 新規フロア作成時: このフロアを待っていたアバターの乗車状態を復元
  if (!floorObj._wasResolved) {
    floorObj._wasResolved = true;
    Object.values(avaP).forEach(ava => ava.resolveRiding?.());
  }
}

function _removeVideoFloor(token) {
  const floorObj = videoFloorObjects[token];
  if (!floorObj) return;
  const fw = floorObj._pixiW || 660;
  for (const ava of Object.values(avaP)) {
    if (ava.ridingObject === floorObj) ava.stopRiding();
    if (ava.container.y > VIDEO_FLOOR_Y && ava !== avaP[myToken]) {
      const lx = ava.container.x - floorObj.container.x;
      if (lx >= -20 && lx < fw + 20) ava.container.y = 400;
    }
  }
  const myAva = avaP[myToken];
  if (myAva && myAva.container.y > VIDEO_FLOOR_Y) {
    const lx = myAva.container.x - floorObj.container.x;
    if (lx >= -20 && lx < fw + 20) {
      gsap.killTweensOf(myAva.container);
      myAva.isMoving = false;
      if (AX < 0) AX = 10;
      if (AX > 660) AX = 650;
      myAva.container.x = AX;
      myAva.dropVelocity = 1;
      AY = 50;
      myAva.container.y = AY;
      myAva.sendTransformData("フロア消滅");
    }
  }
  if (_videoFloorDrawingToken === token) { _videoFloorCurrentLine = null; _videoFloorDrawingToken = null; }
  if (floorObj.container.parent) floorObj.container.parent.removeChild(floorObj.container);
  delete videoFloorObjects[token];
  delete videoFloorIntrinsic[token];
  delete objMap['videoFloor:' + token];
  const _zi = _videoFloorZOrder.indexOf(token);
  if (_zi >= 0) _videoFloorZOrder.splice(_zi, 1);
  _updateVideoZIndices();
  _recalcFloorPositions();
  if (_videoTransparentActive) _applyTransparentLayout();
  if (Object.keys(videoFloorObjects).length === 0) { _videoFloorFocused = false; _stopAvaOverlay(); }
  switchDrawing(avatarOekakiToken);
}

function _updateVideoZIndices() {
  _videoFloorZOrder.forEach((tok, i) => {
    const v = videoArray[tok];
    if (v) v.style.zIndex = (i + 1) * 2 - 1;
    const ov = videoOverlays[tok];
    if (ov) ov.style.zIndex = (i + 1) * 2;
  });
}

function _bringVideoFloorToFront(token) {
  const i = _videoFloorZOrder.indexOf(token);
  if (i < 0 || i === _videoFloorZOrder.length - 1) return;
  _videoFloorZOrder.splice(i, 1);
  _videoFloorZOrder.push(token);
  _updateVideoZIndices();
  // DOMを末尾に移動して確実に最前面にする
  const _fv = videoArray[token];
  if (_fv && _fv.parentNode === mediaContainer) mediaContainer.appendChild(_fv);
  const _fo = videoOverlays[token];
  if (_fo && _fo.parentNode === mediaContainer) mediaContainer.appendChild(_fo);
}

function _syncVideoFloor(fromToken) {
  if (!_isBaseVideoToken(fromToken)) return;
  const v = videoArray[fromToken];
  if (!v) return;
  const videoW = v.videoWidth || 0;
  const videoH = v.videoHeight || 0;
  if (videoW > 0 && videoH > 0) videoFloorIntrinsic[fromToken] = { w: videoW, h: videoH };
  const raw = _videoToPIXI(v);
  const coords = raw || { x: 0, y: 0, width: 660, height: VIDEO_FLOOR_H };
  socket.emit('videoSurface', { token: fromToken, x: coords.x, y: coords.y, width: coords.width, height: coords.height, videoW, videoH, enabled: _streamSurfaceAllowed, startTime: videoStartOrder[fromToken] || Date.now() });
  if (_streamSurfaceAllowed) _updateVideoFloor(fromToken, coords.x, coords.y, coords.width, coords.height);
}

socket.on('videoSurface', data => {
  if (!data.enabled) {
    _removeVideoFloor(data.token);
  } else {
    if (data.startTime && !videoStartOrder[data.token]) videoStartOrder[data.token] = data.startTime;
    if (data.videoW > 0 && data.videoH > 0) videoFloorIntrinsic[data.token] = { w: data.videoW, h: data.videoH };
    _updateVideoFloor(data.token, data.x, data.y, data.width, data.height, data.drawHistory);
  }
});

function _redrawVideoFloorOekaki(token) {
  const floorObj = videoFloorObjects[token];
  if (!floorObj) return;
  floorObj.oekakiGraphics.clear();
  floorObj.drawHistory.forEach(line => {
    if (line.type === 'line' && line.pointer.length > 0) {
      floorObj.oekakiGraphics.lineStyle(2, line.color, line.alpha);
      floorObj.oekakiGraphics.moveTo(line.pointer[0].x, line.pointer[0].y);
      for (let i = 1; i < line.pointer.length; i++) {
        floorObj.oekakiGraphics.lineTo(line.pointer[i].x, line.pointer[i].y);
      }
    }
  });
}

socket.on('videoFloorOekaki', data => {
  const floorObj = videoFloorObjects[data.floorToken];
  if (!floorObj) return;
  if (!data.line.token && data.token) data.line.token = data.token;
  floorObj.drawHistory.push(data.line);
  if (data.line.type === 'line' && data.line.pointer.length > 0) {
    floorObj.oekakiGraphics.lineStyle(2, data.line.color, data.line.alpha);
    floorObj.oekakiGraphics.moveTo(data.line.pointer[0].x, data.line.pointer[0].y);
    for (let i = 1; i < data.line.pointer.length; i++) {
      floorObj.oekakiGraphics.lineTo(data.line.pointer[i].x, data.line.pointer[i].y);
    }
  }
});

socket.on('videoFloorOekakiClear', data => {
  const floorObj = videoFloorObjects[data.floorToken];
  if (!floorObj) return;
  floorObj.drawHistory = data.history;
  floorObj.oekakiGraphics.clear();
});

socket.on('videoFloorUndo', data => {
  const floorObj = videoFloorObjects[data.floorToken];
  if (!floorObj) return;
  floorObj.drawHistory = data.history;
  _redrawVideoFloorOekaki(data.floorToken);
});

function _getActiveVideoFloor() {
  if (!_videoFloorFocused) return null;
  const myAva = avaP[myToken];
  if (myAva && myAva.ridingObject && myAva.ridingObject.name && myAva.ridingObject.name.startsWith('videoFloor:')) {
    return myAva.ridingObject;
  }
  for (const floorObj of Object.values(videoFloorObjects)) return floorObj;
  return null;
}

let _videoFloorCurrentLine = null;
let _videoFloorDrawingToken = null;

function _videoFloorSendCurrentLine() {
  if (!_videoFloorCurrentLine || _videoFloorCurrentLine.pointer.length < 2) {
    _videoFloorCurrentLine = null;
    _videoFloorDrawingToken = null;
    return;
  }
  const token = _videoFloorDrawingToken;
  const floorObj = videoFloorObjects[token];
  if (!floorObj) { _videoFloorCurrentLine = null; _videoFloorDrawingToken = null; return; }
  const line = _videoFloorCurrentLine;
  line.token = myToken;
  floorObj.drawHistory.push(line);
  floorObj.redoStack = [];
  if (line.type === 'line' && line.pointer.length > 0) {
    floorObj.oekakiGraphics.lineStyle(2, line.color, line.alpha);
    floorObj.oekakiGraphics.moveTo(line.pointer[0].x, line.pointer[0].y);
    for (let i = 1; i < line.pointer.length; i++) {
      floorObj.oekakiGraphics.lineTo(line.pointer[i].x, line.pointer[i].y);
    }
  }
  socket.emit('videoFloorOekaki', { floorToken: token, line });
  _videoFloorCurrentLine = null;
  _videoFloorDrawingToken = null;
  switchDrawing(avatarOekakiToken);
}


function changeStreamSurface() {
  _streamSurfaceAllowed = document.getElementById('streamSurfaceAllowed').checked;
  localStorage.setItem('streamSurfaceAllowed', _streamSurfaceAllowed);
  if (_streamSurfaceAllowed) {
    if (videoArray[myToken]) _syncVideoFloor(myToken);
  } else {
    _removeVideoFloor(myToken);
    socket.emit('videoSurface', { token: myToken, enabled: false });
  }
}

function changeVideoAutoReset() {
  const _el = document.getElementById('videoAutoReset');
  if (!_el) return;
  _videoAutoReset = _el.checked;
  localStorage.setItem('videoAutoReset', _videoAutoReset);
}

function detachAudio(token) {//remoteAudioの削除
  // mediaContainer.removeChild(document.getElementById('remote_audio_' + token));//しばらく消してみて様子見、
  _stopRemoteVolumeViz(token);
  if (_remoteAnalysers[token]) { _remoteAnalysers[token].disconnect(); delete _remoteAnalysers[token]; }
  if (_remoteVizBases[token]) { delete _remoteVizBases[token]; }
  if (_remoteVizBars[token]) { delete _remoteVizBars[token]; }
  delete remoteAudios[token];
}

// ---------------------- media handling -----------------------
let _pickerSwitchPreview = null; // _pickDevice実行中のみ有効、onDevicePickerPreviewClickから参照
let _pickerSyncExtraPreviews = null; // cam2/cam3プレビューの一括start/stop用
let _pickerPreviewOn = false;

function _pickDevice(kind) {
  // getUserMediaをPromiseチェーン外の最初の呼び出しにすることで
  // iOSのジェスチャーコンテキスト内に収める（.then()内だとコンテキストが失われる）
  const savedPickerId = kind === 'videoinput' ? cameraDeviceId : micDeviceId;
  // 前回使用したデバイスを優先（idealなので未取得でもフォールバック可）
  const tempConstraint = kind === 'videoinput'
    ? (savedPickerId ? { video: { deviceId: { ideal: savedPickerId } } } : { video: true })
    : { audio: true };
  let previewStream = null;
  return navigator.mediaDevices.getUserMedia(tempConstraint)
    .then(tmp => {
      if (kind === 'videoinput') {
        previewStream = tmp; // プレビュー用に保持（stopはcleanupで行う）
      } else {
        tmp.getTracks().forEach(t => t.stop());
      }
      return navigator.mediaDevices.enumerateDevices();
    }, () => navigator.mediaDevices.enumerateDevices())
    .then(devices => {
      const filtered = devices.filter(d => d.kind === kind);
      return new Promise((resolve, reject) => {
        const overlay = document.getElementById('devicePickerOverlay');
        const labelEl = document.getElementById('devicePickerLabel');
        const select = document.getElementById('devicePickerSelect');
        const okBtn = document.getElementById('devicePickerOk');
        const cancelBtn = document.getElementById('devicePickerCancel');
        const extraCamsEl = document.getElementById('devicePickerExtraCams');
        const extraPreviewStreams = {};
        const previewEl = document.getElementById('devicePickerPreview');
        const previewWrap = document.getElementById('devicePickerPreviewWrap');
        const fixWrap = document.getElementById('devicePickerFixWrap');
        const fixCheck = document.getElementById('devicePickerFixCheck');
        labelEl.textContent = kind === 'videoinput' ? 'カメラを選択' : 'マイクを選択';
        document.getElementById('devicePickerFixLabel').textContent = kind === 'videoinput' ? '次回からカメラを固定する' : '次回からマイクを固定する';
        select.innerHTML = '';
        filtered.forEach((d, i) => {
          const opt = document.createElement('option');
          opt.value = d.deviceId;
          opt.textContent = d.label || (kind === 'videoinput' ? 'カメラ' : 'マイク') + (i + 1);
          if (d.deviceId === savedPickerId) opt.selected = true;
          select.appendChild(opt);
        });
        // 「次回から固定」チェックボックス
        fixWrap.style.display = '';
        fixCheck.checked = (kind === 'videoinput' ? cameraSelectMode === 'fixed' : micSelectMode === 'fixed');
        if (kind === 'videoinput') {
          previewWrap.style.display = '';
          _pickerPreviewOn = false;
          const previewBtn = document.getElementById('devicePickerPreviewBtn');
          if (previewBtn) { previewBtn.style.outline = ''; }
          previewEl.srcObject = null;
          previewEl.style.display = 'none';

          async function switchPreview(deviceId) {
            if (previewStream) { previewStream.getTracks().forEach(t => t.stop()); previewStream = null; }
            previewEl.srcObject = null;
            if (!_pickerPreviewOn || !deviceId) { previewEl.style.display = 'none'; return; }
            try {
              previewStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } } });
              previewEl.srcObject = previewStream;
              previewEl.style.display = '';
            } catch (_e) { previewEl.style.display = 'none'; }
          }

          _pickerSwitchPreview = switchPreview;
          select.addEventListener('change', () => {
            switchPreview(select.value);
            // cam1 が選択されたら cam2 セレクターを表示
            _buildPickerExtraCamSelect(filtered, extraPreviewStreams);
          });

          // cam2/cam3 セレクター（videoinput 時のみ）
          function _buildPickerCamSelect(camIdx, deviceList, previewMap, container) {
            // camIdx: 2 or 3
            const wrap = document.createElement('div');
            wrap.style.marginBottom = '8px';
            wrap.dataset.camIdx = String(camIdx);
            const lbl = document.createElement('span');
            lbl.textContent = 'カメラ' + camIdx + '（省略可）：';
            lbl.style.fontSize = '0.9em';
            const sel = document.createElement('select');
            sel.style.cssText = 'width:100%; margin-top:3px; box-sizing:border-box;';
            const blankOpt = document.createElement('option');
            blankOpt.value = ''; blankOpt.textContent = '(なし)';
            sel.appendChild(blankOpt);
            deviceList.forEach((d, i) => {
              const opt = document.createElement('option');
              opt.value = d.deviceId;
              opt.textContent = d.label || 'カメラ' + (i + 1);
              sel.appendChild(opt);
            });
            wrap.appendChild(lbl);
            wrap.appendChild(sel);
            // プレビュー動画要素
            const prevEl = document.createElement('video');
            prevEl.autoplay = true; prevEl.muted = true; prevEl.setAttribute('playsinline', '');
            prevEl.style.cssText = 'width:100%; margin-top:4px; border-radius:4px; display:none;';
            wrap.appendChild(prevEl);
            container.appendChild(wrap);
            const camKey = 'cam' + camIdx;
            sel.addEventListener('change', async () => {
              if (previewMap[camKey]) { previewMap[camKey].getTracks().forEach(t => t.stop()); previewMap[camKey] = null; }
              prevEl.srcObject = null; prevEl.style.display = 'none';
              // 次のカメラセレクターを再構築
              if (camIdx < MAX_CAMS) {
                const nextIdx = camIdx + 1;
                const existingNext = container.querySelector('[data-cam-idx="' + nextIdx + '"]');
                if (existingNext) existingNext.remove();
                // 次以降も削除
                for (let _ri = nextIdx + 1; _ri <= MAX_CAMS; _ri++) {
                  const _re = container.querySelector('[data-cam-idx="' + _ri + '"]');
                  if (_re) _re.remove();
                  const _ck = 'cam' + _ri;
                  if (previewMap[_ck]) { previewMap[_ck].getTracks().forEach(t => t.stop()); previewMap[_ck] = null; }
                }
                if (sel.value && multiCameraEnabled) {
                  _buildPickerCamSelect(nextIdx, deviceList, previewMap, container);
                }
              }
              if (_pickerPreviewOn && sel.value) {
                try {
                  previewMap[camKey] = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: sel.value } } });
                  prevEl.srcObject = previewMap[camKey];
                  prevEl.style.display = '';
                } catch (_e) {}
              }
            });
          }
          function _buildPickerExtraCamSelect(deviceList, previewMap) {
            extraCamsEl.innerHTML = '';
            if (!select.value || !multiCameraEnabled) return;
            _buildPickerCamSelect(2, deviceList, previewMap, extraCamsEl);
          }
          // cam2/cam3プレビューの一括start/stop（onDevicePickerPreviewClickから参照）
          _pickerSyncExtraPreviews = async function () {
            const wraps = extraCamsEl.querySelectorAll('[data-cam-idx]');
            for (const wrap of wraps) {
              const idx = wrap.dataset.camIdx;
              const camKey = 'cam' + idx;
              const sel2 = wrap.querySelector('select');
              const prevEl2 = wrap.querySelector('video');
              if (!sel2 || !prevEl2) continue;
              if (extraPreviewStreams[camKey]) {
                extraPreviewStreams[camKey].getTracks().forEach(t => t.stop());
                extraPreviewStreams[camKey] = null;
              }
              prevEl2.srcObject = null;
              prevEl2.style.display = 'none';
              if (_pickerPreviewOn && sel2.value) {
                try {
                  extraPreviewStreams[camKey] = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: sel2.value } } });
                  prevEl2.srcObject = extraPreviewStreams[camKey];
                  prevEl2.style.display = '';
                } catch (_e) {}
              }
            }
          };
          if (filtered.length > 1) _buildPickerExtraCamSelect(filtered, extraPreviewStreams);
        } else {
          previewWrap.style.display = 'none';
          previewEl.style.display = 'none';
        }
        overlay.style.display = 'flex';
        function stopPreview() {
          _pickerSwitchPreview = null;
          if (previewStream) { previewStream.getTracks().forEach(t => t.stop()); previewStream = null; }
          previewEl.srcObject = null;
          previewEl.style.display = 'none';
        }
        function stopExtraPreviews(previewMap) {
          _pickerSyncExtraPreviews = null;
          if (previewMap) {
            for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
              const _ck = 'cam' + _cn;
              if (previewMap[_ck]) { previewMap[_ck].getTracks().forEach(t => t.stop()); previewMap[_ck] = null; }
            }
          }
          if (extraCamsEl) extraCamsEl.innerHTML = '';
        }
        function onOk() {
          const deviceId = select.value;
          const deviceLabel = select.options[select.selectedIndex]?.textContent || '';
          // cam2/cam3 セレクターの値を収集
          const extraIds = [];
          if (extraCamsEl) {
            extraCamsEl.querySelectorAll('select').forEach(sel => {
              if (sel.value) extraIds.push(sel.value);
            });
          }
          // 「次回から固定」がチェックされていたらモードと保存IDを更新
          if (fixCheck.checked) {
            if (kind === 'videoinput') {
              cameraSelectMode = 'fixed'; localStorage.setItem('cameraSelectMode', 'fixed');
              cameraDeviceId = deviceId; cameraDeviceLabel = deviceLabel;
              localStorage.setItem('cameraDeviceId', deviceId); localStorage.setItem('cameraDeviceLabel', deviceLabel);
              const sel = document.getElementById('cameraSelectMode'); if (sel) sel.value = 'fixed';
            } else {
              micSelectMode = 'fixed'; localStorage.setItem('micSelectMode', 'fixed');
              micDeviceId = deviceId; micDeviceLabel = deviceLabel;
              localStorage.setItem('micDeviceId', deviceId); localStorage.setItem('micDeviceLabel', deviceLabel);
              const sel = document.getElementById('micSelectMode'); if (sel) sel.value = 'fixed';
            }
          }
          overlay.style.display = 'none';
          stopPreview();
          stopExtraPreviews(kind === 'videoinput' ? extraPreviewStreams : null);
          cleanup();
          resolve({ deviceId, deviceLabel, extraIds });
        }
        function onCancel() {
          overlay.style.display = 'none';
          stopPreview();
          stopExtraPreviews(kind === 'videoinput' ? extraPreviewStreams : null);
          cleanup();
          reject(new Error('cancelled'));
        }
        function cleanup() {
          okBtn.removeEventListener('click', onOk);
          cancelBtn.removeEventListener('click', onCancel);
        }
        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
      });
    });
}

function onDevicePickerPreviewClick() {
  _pickerPreviewOn = !_pickerPreviewOn;
  const btn = document.getElementById('devicePickerPreviewBtn');
  if (btn) btn.style.outline = _pickerPreviewOn ? '2px solid #4a90d9' : '';
  const select = document.getElementById('devicePickerSelect');
  if (_pickerSwitchPreview) _pickerSwitchPreview(select.value);
  if (_pickerSyncExtraPreviews) _pickerSyncExtraPreviews();
}

let _settingPreviewStream = null;
let _settingPreviewActive = false;
let _settingPreviewOrigCameraDeviceId = '';
let _settingPreviewOrigCameraDeviceLabel = '';
let _settingPreviewCurrentDeviceId = '';
let _settingPreviewVisibilityHandler = null;
let _settingPreviewFrameCheckInterval = null;

function onSettingPreviewBtnClick() {
  if (!_settingPreviewActive) {
    _settingPreviewActive = true;
    document.getElementById('settingPreviewBtn').style.backgroundColor = 'skyblue';
    _settingPreviewOrigCameraDeviceId = cameraDeviceId;
    _settingPreviewOrigCameraDeviceLabel = cameraDeviceLabel;
    _settingPreviewCurrentDeviceId = '';
    const sel = document.getElementById('cameraDeviceSelect');
    if (sel.value) _switchSettingPreview(sel.value, true);
    for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
      const _xc = _xcam[_cn];
      if (_xc && _xc.deviceId) _switchSettingPreviewN(_cn, _xc.deviceId);
    }
  } else {
    stopSettingPreview();
  }
}

async function stopSettingPreview() {
  if (!_settingPreviewActive) {
    _settingPreviewCurrentDeviceId = '';
    const _btn = document.getElementById('settingPreviewBtn');
    if (_btn) _btn.style.backgroundColor = '';
    return;
  }
  const previewedId = _settingPreviewCurrentDeviceId;
  let previewedLabel = '';
  let keepPreviewCamera = false;
  if (previewedId && previewedId !== _settingPreviewOrigCameraDeviceId) {
    const sel = document.getElementById('cameraDeviceSelect');
    const opt = sel.options[sel.selectedIndex];
    previewedLabel = opt ? opt.textContent : '';
    keepPreviewCamera = confirm('プレビューのカメラに切り替えますか？');
  }

  if (_settingPreviewVisibilityHandler) {
    document.removeEventListener('visibilitychange', _settingPreviewVisibilityHandler);
    _settingPreviewVisibilityHandler = null;
  }
  if (_settingPreviewFrameCheckInterval) {
    clearInterval(_settingPreviewFrameCheckInterval);
    _settingPreviewFrameCheckInterval = null;
  }
  if (_settingPreviewStream && _settingPreviewStream !== localStream) {
    _settingPreviewStream.getTracks().forEach(t => t.stop());
  }
  _settingPreviewStream = null;
  // 追加カメラのプレビューも停止（配信中ストリームは止めない）
  for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
    const _xc = _xcam[_cn];
    if (_xc && _xc.previewStream && _xc.previewStream !== _xc.stream) { _xc.previewStream.getTracks().forEach(t => t.stop()); }
    if (_xc) _xc.previewStream = null;
    const _pEl = document.getElementById('settingPreview' + _cn);
    const _pWr = document.getElementById('settingPreview' + _cn + 'Wrap');
    if (_pEl) _pEl.srcObject = null;
    if (_pWr) _pWr.style.display = 'none';
  }
  _settingPreviewActive = false;
  const previewEl = document.getElementById('settingPreview');
  const previewWrapEl = document.getElementById('settingPreviewWrap');
  previewEl.srcObject = null;
  previewWrapEl.style.display = 'none';
  previewWrapEl.style.minHeight = '';
  document.getElementById('settingPreviewBlackOverlay').style.display = 'none';
  const _btn = document.getElementById('settingPreviewBtn');
  if (_btn) _btn.style.backgroundColor = '';

  if (keepPreviewCamera) {
    if (videoStatus) switchVideoDevice(previewedId);
    cameraDeviceId = previewedId;
    cameraDeviceLabel = previewedLabel;
  } else {
    if (videoStatus && previewedId && previewedId !== _settingPreviewOrigCameraDeviceId) {
      switchVideoDevice(_settingPreviewOrigCameraDeviceId);
    }
    cameraDeviceId = _settingPreviewOrigCameraDeviceId;
    cameraDeviceLabel = _settingPreviewOrigCameraDeviceLabel;
  }
  localStorage.setItem('cameraDeviceId', cameraDeviceId);
  localStorage.setItem('cameraDeviceLabel', cameraDeviceLabel);
  populateDeviceSelects();
  _settingPreviewCurrentDeviceId = '';
}

async function _switchSettingPreview(deviceId, isInitial) {
  if (_settingPreviewStream && _settingPreviewStream !== localStream) {
    _settingPreviewStream.getTracks().forEach(t => t.stop());
  }
  _settingPreviewStream = null;
  const previewEl = document.getElementById('settingPreview');
  const previewWrapEl = document.getElementById('settingPreviewWrap');
  previewEl.srcObject = null;
  if (!isInitial) _settingPreviewCurrentDeviceId = deviceId;
  const streamingDeviceId = videoStatus && videoStatus.deviceId && videoStatus.deviceId.exact;
  const overlayEl = document.getElementById('settingPreviewBlackOverlay');
  // 配信中で同じカメラ: localStreamを流用（中断なし）
  if (videoStatus && localStream && deviceId === streamingDeviceId) {
    _settingPreviewStream = localStream;
    previewEl.srcObject = localStream;
    overlayEl.style.display = 'none';
    previewWrapEl.style.display = '';
    previewWrapEl.style.minHeight = '';
    return;
  }
  // 配信中で別カメラ: srcObjectをnullにしてCSS背景黒を見せてからトラックを止める（iOSは透明になるため）
  if (videoStatus && localStream) {
    [myToken, myToken + 'Re', myToken + 'Inv', myToken + 'IR'].forEach(key => {
      if (videoArray[key]) { videoArray[key].srcObject = null; videoArray[key].style.background = '#000'; }
    });
    localStream.getVideoTracks().forEach(t => t.stop());
  }
  try {
    _settingPreviewStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } } });
    if (!_settingPreviewActive) {
      _settingPreviewStream.getTracks().forEach(t => t.stop());
      _settingPreviewStream = null;
      return;
    }
    previewEl.srcObject = _settingPreviewStream;
    previewWrapEl.style.display = '';
    overlayEl.style.display = 'block'; // デフォルト黒
    const _capturedPreviewStream = _settingPreviewStream;
    // playingイベントで黒オーバーレイを消す（getVideoPlaybackQualityはiOS未サポート）
    if (_settingPreviewFrameCheckInterval) { clearInterval(_settingPreviewFrameCheckInterval); _settingPreviewFrameCheckInterval = null; }
    previewEl.addEventListener('playing', () => {
      if (_settingPreviewStream === _capturedPreviewStream) overlayEl.style.display = 'none';
    }, { once: true });
    const pvt = _capturedPreviewStream.getVideoTracks()[0];
    if (pvt) pvt.onended = () => { previewEl.srcObject = null; overlayEl.style.display = 'block'; };
    _capturedPreviewStream.oninactive = () => { previewEl.srcObject = null; overlayEl.style.display = 'block'; };
  } catch (e) {
    previewEl.srcObject = null;
    previewWrapEl.style.display = '';
    previewWrapEl.style.minHeight = '60px';
    overlayEl.style.display = 'block';
  }
}

async function _switchSettingPreviewN(n, deviceId) {
  const _xc = _xcamGet(n);
  if (_xc.previewStream && _xc.previewStream !== _xc.stream) { _xc.previewStream.getTracks().forEach(t => t.stop()); }
  _xc.previewStream = null;
  const previewEl = document.getElementById('settingPreview' + n);
  const previewWrapEl = document.getElementById('settingPreview' + n + 'Wrap');
  if (!previewEl || !previewWrapEl) return;
  previewEl.srcObject = null;
  if (!deviceId) { previewWrapEl.style.display = 'none'; return; }
  // 配信中で同じカメラ: 配信ストリームを流用（同カメラを2回開かない）
  if (_xc.status && _xc.stream && deviceId === _xc.deviceId) {
    _xc.previewStream = _xc.stream;
    previewEl.srcObject = _xc.stream;
    previewWrapEl.style.display = '';
    return;
  }
  try {
    _xc.previewStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } } });
    if (!_settingPreviewActive) { _xc.previewStream.getTracks().forEach(t => t.stop()); _xc.previewStream = null; return; }
    previewEl.srcObject = _xc.previewStream;
    previewWrapEl.style.display = '';
  } catch (_e) {
    previewWrapEl.style.display = 'none';
  }
}

async function _getVideoDeviceId() {
  if (cameraSelectMode === 'fixed' && cameraDeviceId) {
    _pendingExtraCameraIds = {};
    if (multiCameraEnabled) {
      for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
        const _xc = _xcam[_cn];
        if (_xc && _xc.deviceId) _pendingExtraCameraIds[_cn] = _xc.deviceId;
      }
    }
    return cameraDeviceId;
  }
  const result = await _pickDevice('videoinput');
  _pendingExtraCameraIds = {};
  (result.extraIds || []).forEach((id, i) => { if (id) _pendingExtraCameraIds[i + 2] = id; });
  if (cameraSelectMode === 'fixed' && result.deviceId) {
    cameraDeviceId = result.deviceId; cameraDeviceLabel = result.deviceLabel || '';
    localStorage.setItem('cameraDeviceId', result.deviceId); localStorage.setItem('cameraDeviceLabel', cameraDeviceLabel);
  }
  return result.deviceId;
}

async function _getMicDeviceId() {
  if (micSelectMode === 'fixed' && micDeviceId) return micDeviceId;
  const result = await _pickDevice('audioinput');
  if (micSelectMode === 'fixed' && result.deviceId) {
    micDeviceId = result.deviceId; micDeviceLabel = result.deviceLabel || '';
    localStorage.setItem('micDeviceId', result.deviceId); localStorage.setItem('micDeviceLabel', micDeviceLabel);
  }
  return result.deviceId;
}

async function startVideo() {
  if (videoStatus) {
    return;
  }
  videoStatus = true;
  _setBtnState(document.getElementById('startVideo'), 'gray');
  document.getElementById('startVideo').onclick = function buttonClick() { stopVideo(); };
  let deviceId;
  try {
    deviceId = await _getVideoDeviceId();
  } catch (_e) {
    videoStatus = false;
    _setBtnState(document.getElementById('startVideo'), 'red');
    document.getElementById('startVideo').onclick = function buttonClick() { startVideo(); };
    return;
  }
  if (!videoStatus) return;
  videoStatus = {
    deviceId: deviceId ? { exact: deviceId } : undefined,
    ...QUALITY_CONSTRAINTS[streamQualityLevel],
  };
  getDeviceStream({ video: videoStatus }) // audio: false <-- ontrack once, audio:true --> ontrack twice!!
    .then(async function (stream) { // success
      if (!videoStatus) { stream.getTracks().forEach(t => t.stop()); return; }
      _setBtnState(document.getElementById('startVideo'), "skyblue");
      if (!localStream) {
        localStream = stream;
      }
      localVideoTrack = localStream.addTrack(stream.getVideoTracks()[0]);
      // 実際に取得できたdeviceIdで保存値を更新（セッションをまたいでIDが変わる環境に対応）
      if (cameraSelectMode === 'fixed') {
        const actualId = stream.getVideoTracks()[0]?.getSettings()?.deviceId;
        if (actualId && actualId !== cameraDeviceId) {
          cameraDeviceId = actualId;
          localStorage.setItem('cameraDeviceId', actualId);
        }
      }

      mapPeer.forEach(function (value) {
        if (videoStatus) {
          if (value.get("onVideo")) {
            value.set("oldVideo", stream.getVideoTracks()[0]);
            value.set("idOldVideo", stream.getVideoTracks()[0].id)
            value.get("rtc").addTrack(value.get("oldVideo"), stream);
          };
        }
      });

      videoStartOrder[myToken] = Date.now();
      attachVideo(myToken, stream);
      if (selectVideoReverse.checked) {//自分の左右反転にチェックが入ってたら
        attachVideo(myToken + "Re", stream);
      }
      if (selectVideoInverse.checked) {//自分の上下反転にチェックが入ってたら
        attachVideo(myToken + "Inv", stream);
      }
      if (selectVideoInverseAndReverse.checked) {//自分の上下左右反転にチェックが入ってたら
        attachVideo(myToken + "IR", stream);
      }
      socket.emit("mediaButton", { type: 'createVideoButton', quality: streamQualityLevel, startTime: videoStartOrder[myToken] });
      socket.emit("stream", { format: "videoStart", });
      document.getElementById('startVideo').onclick = function buttonClick() {
        stopVideo();
      }
      // 追加カメラが選択されていたら起動（中飛びを許容）
      for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
        if (_pendingExtraCameraIds[_cn]) {
          _xcamGet(_cn).deviceId = _pendingExtraCameraIds[_cn];
          await startVideoN(_cn, _pendingExtraCameraIds[_cn]);
        }
      }
      _pendingExtraCameraIds = {};
      populateDeviceSelects();
      updateStreamStatus();

    }).catch(function (error) { // error
      videoStatus = false;
      _setBtnState(document.getElementById('startVideo'), "red");
      document.getElementById('startVideo').onclick = function buttonClick() {
        startVideo();
      }
      // deviceId 起因のエラーのみ保存済みIDをクリア（品質制約等は保持）
      const isDeviceIdError = error.name === 'NotFoundError' ||
        (error.name === 'OverconstrainedError' && (!error.constraint || error.constraint === 'deviceId'));
      if (cameraDeviceId && isDeviceIdError) {
        cameraDeviceId = '';
        localStorage.removeItem('cameraDeviceId');
        outputChatMsg("保存済みカメラを解除しました。もう一度押してください。", "red");
      } else {
        outputChatMsg("カメラの取得に失敗しました: " + error.name, "red");
      }
      console.error('getUserMedia error:', error);
    });
}

async function startVideoN(n, deviceId) {
  const _xc = _xcamGet(n);
  if (_xc.status) return;
  let tmpStream;
  try {
    tmpStream = await getDeviceStream({ video: { deviceId: { exact: deviceId }, ...QUALITY_CONSTRAINTS[streamQualityLevel] } });
  } catch (e) {
    outputChatMsg('カメラ' + n + 'の取得に失敗: ' + e.name, 'red');
    _xc.deviceId = '';
    populateDeviceSelects();
    return;
  }
  if (!videoStatus) {
    tmpStream.getTracks().forEach(t => t.stop());
    return;
  }
  _xc.deviceId = deviceId;
  _xc.status = { deviceId: { exact: deviceId }, ...QUALITY_CONSTRAINTS[streamQualityLevel] };
  _xc.track = tmpStream.getVideoTracks()[0];
  _xc.stream = new MediaStream([_xc.track]);

  mapPeer.forEach(function (value) {
    if (value.get('onVideo')) {
      value.set('oldVideoN_' + n, _xc.track);
      value.set('idOldVideoN_' + n, _xc.track.id);
      value.get('rtc').addTrack(_xc.track, _xc.stream);
    }
  });

  const prevKey = n > 2 ? (myToken + '_' + (n - 1)) : myToken;
  const startTimeN = (videoStartOrder[prevKey] || Date.now()) + (n - 1);
  videoStartOrder[myToken + '_' + n] = startTimeN;
  attachVideo(myToken + '_' + n, _xc.stream);
  socket.emit('mediaButton', { type: 'createVideoButtonN', camIdx: n, startTime: startTimeN, streamId: _xc.stream.id });
}

function stopVideoN(n) {
  const _xc = _xcam[n];
  if (!_xc || !_xc.status) return;
  _xc.status = false;
  mapPeer.forEach(function (value) {
    const senders = value.get('rtc').getSenders();
    const trackId = value.get('idOldVideoN_' + n);
    senders.forEach(function (sender) {
      if (sender.track && trackId && sender.track.id === trackId) value.get('rtc').removeTrack(sender);
    });
    value.delete('oldVideoN_' + n);
    value.delete('idOldVideoN_' + n);
  });
  if (videoArray[myToken + '_' + n]) detachVideo(myToken + '_' + n);
  if (_xc.stream) { _xc.stream.getTracks().forEach(t => t.stop()); _xc.stream = null; }
  _xc.track = null;
  socket.emit('mediaButton', { type: 'removeVideoButtonN', camIdx: n });
  populateDeviceSelects();
}

async function startAudio() {
  if (audioStatus) {
    return;
  }
  audioStatus = true;
  _setBtnState(document.getElementById('startAudio'), 'gray');
  document.getElementById('startAudio').onclick = function buttonClick() { stopAudio(); };
  // iOS Safari: AudioContext は最初の await 前に生成しないと gesture context が失われる
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.audioWorklet && !_rnnoiseWorkletReady) {
    try {
      await _audioCtx.audioWorklet.addModule('/rnnoise/rnnoise-worklet.js');
      _rnnoiseWorkletReady = true;
    } catch (_e) { console.warn('RNNoise worklet unavailable:', _e); }
  }
  if (!audioStatus) return;
  let deviceId;
  try {
    deviceId = await _getMicDeviceId();
  } catch (_e) {
    if (audioStatus) { audioStatus = false; _audioCtx.close(); _audioCtx = null; _setBtnState(document.getElementById('startAudio'), 'red'); document.getElementById('startAudio').onclick = function buttonClick() { startAudio(); }; }
    return;
  }
  if (!audioStatus) return;
  getDeviceStream({
    audio: {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      noiseSuppression: true,
      echoCancellation: true,
      autoGainControl: false
    }
  }).then(function (stream) { // success
    if (!audioStatus) { stream.getTracks().forEach(t => t.stop()); return; }
    _setBtnState(document.getElementById('startAudio'), "skyblue");
    _audioRawStream = stream;
    const source = _audioCtx.createMediaStreamSource(stream);
    _audioGainNode = _audioCtx.createGain();
    _audioGainNode.gain.value = _audioBoostEnabled ? AUDIO_BOOST_VALUE : 1.0;
    const compressor = _audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 10;
    compressor.ratio.value = 8;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    _highpassNode = _audioCtx.createBiquadFilter();
    _highpassNode.type = _highpassEnabled ? 'highpass' : 'allpass';
    _highpassNode.frequency.value = 80;
    _audioAnalyser = _audioCtx.createAnalyser();
    _audioAnalyser.fftSize = 256;
    _audioAnalyser.smoothingTimeConstant = 0.4;
    const dest = _audioCtx.createMediaStreamDestination();
    // chain: source → [RNNoise] → highpass → compressor → gain → analyser → dest
    if (_rnnoiseWorkletReady) {
      _rnnoiseWorkletNode = new AudioWorkletNode(_audioCtx, 'rnnoise-processor');
      _rnnoiseWorkletNode.port.postMessage({ type: 'enable', value: _rnnoiseEnabled });
      source.connect(_rnnoiseWorkletNode);
      _rnnoiseWorkletNode.connect(_highpassNode);
    } else {
      source.connect(_highpassNode);
    }
    _highpassNode.connect(compressor);
    compressor.connect(_audioGainNode);
    _audioGainNode.connect(_audioAnalyser);
    _audioAnalyser.connect(dest);
    const processedTrack = dest.stream.getAudioTracks()[0];
    if (!localStream) { localStream = new MediaStream(); }
    localAudioTrack = localStream.addTrack(processedTrack);
    if (micSelectMode === 'fixed') {
      const actualId = stream.getAudioTracks()[0]?.getSettings()?.deviceId;
      if (actualId && actualId !== micDeviceId) {
        micDeviceId = actualId;
        localStorage.setItem('micDeviceId', actualId);
      }
    }
    mapPeer.forEach(function (value) {
      if (audioStatus) {
        if (value.get("onAudio")) {
          value.set("oldAudio", processedTrack);
          value.set("idOldAudio", processedTrack.id);
          value.get("rtc").addTrack(value.get("oldAudio"), localStream);
        }
      }
    });
    _startVolumeViz();

    socket.emit("mediaButton", { type: 'createAudioButton', });
    socket.emit("stream", { format: "audioStart", });
    document.getElementById('startAudio').onclick = function buttonClick() {
      stopAudio();
    }
  }).catch(function (error) { // error
    audioStatus = false;
    _setBtnState(document.getElementById('startAudio'), "red");
    document.getElementById('startAudio').onclick = function buttonClick() {
      startAudio();
    }
    outputChatMsg("マイクの取得に失敗しました。", "red");
    console.error('getUserMedia error:', error);

    return;
  });
}

// stop local video
function stopVideo() {
  _setBtnState(document.getElementById('startVideo'), "red");
  videoStatus = false;
  mapPeer.forEach(function (value) {
    let senders = value.get("rtc").getSenders();
    senders.forEach(function (sender) {
      if (sender.track) {
        if (value.get("idOldVideo")) {
          if (value.get("idOldVideo") === sender.track.id) {
            value.get("rtc").removeTrack(sender);
            // removeTrack()の結果として、通信相手に、streamの「removetrack」イベントが発生する。
          }
        }
      }
    });
    if (value.get("oldVideo")) {
      value.delete("oldVideo");
      value.delete("idOldVideo");
    }
  });

  detachVideo(myToken);
  if (videoArray[myToken + "Re"]) {
    detachVideo(myToken + "Re");
  }
  if (videoArray[myToken + "Inv"]) {
    detachVideo(myToken + "Inv");
  }
  if (videoArray[myToken + "IR"]) {
    detachVideo(myToken + "IR");
  }
  if (!videoStatus && !audioStatus) {
    stopLocalStream(localStream);
    localStream = null;
  }
  socket.emit("mediaButton", { type: "remove video button", });
  document.getElementById('startVideo').onclick = function buttonClick() {
    startVideo();
  }
  socket.emit("stream", { format: "videoStop", });
  for (let _cn = MAX_CAMS; _cn >= 2; _cn--) {
    const _xcn = _xcam[_cn];
    if (_xcn && _xcn.status) stopVideoN(_cn);
  }
  updateStreamStatus();
}

function stopAudio() {
  _setBtnState(document.getElementById('startAudio'), "red");
  audioStatus = false;
  mapPeer.forEach(function (value) {
    let senders = value.get("rtc").getSenders();
    senders.forEach(function (sender) {
      if (sender.track) {
        if (value.get("idOldAudio")) {
          if (value.get("idOldAudio") === sender.track.id) {
            value.get("rtc").removeTrack(sender);
            // removeTrack()の結果として、通信相手に、streamの「removetrack」イベントが発生する。
          }
        }
      }
    });
    if (value.get("oldAudio")) {
      value.delete("oldAudio");
      value.delete("idOldAudio");
    }
  });

  if (!videoStatus && !audioStatus) {
    stopLocalStream(localStream);
    localStream = null;
  }
  socket.emit("mediaButton", { type: "remove audio button", });

  document.getElementById('startAudio').onclick = function buttonClick() {
    startAudio();
  }
  socket.emit("stream", { format: "audioStop", });
  _stopVolumeViz();
  if (_audioRawStream) { _audioRawStream.getTracks().forEach(t => t.stop()); _audioRawStream = null; }
  if (_audioCtx) { _audioCtx.close(); _audioCtx = null; }
  _audioGainNode = null;
  _audioAnalyser = null;
  _rnnoiseWorkletNode = null;
  _rnnoiseWorkletReady = false;
  _highpassNode = null;
}

function toggleAudioBoost() {
  _audioBoostEnabled = document.getElementById('audioBoostCheck').checked;
  if (_audioGainNode) _audioGainNode.gain.value = _audioBoostEnabled ? AUDIO_BOOST_VALUE : 1.0;
  localStorage.setItem("micBoost", _audioBoostEnabled);
}

function toggleRNNoise() {
  _rnnoiseEnabled = document.getElementById('rnnoiseCheck').checked;
  if (_rnnoiseWorkletNode) {
    _rnnoiseWorkletNode.port.postMessage({ type: 'enable', value: _rnnoiseEnabled });
  }
  localStorage.setItem("useRNNoise", _rnnoiseEnabled);
}

function toggleHighpass() {
  _highpassEnabled = document.getElementById('highpassCheck').checked;
  if (_highpassNode) _highpassNode.type = _highpassEnabled ? 'highpass' : 'allpass';
  localStorage.setItem("lowCut", _highpassEnabled);
}

function _startVolumeViz() {
  const bar = document.getElementById('audioVizBar');
  const fill = document.getElementById('audioVizFill');
  if (!bar || !fill || !_audioAnalyser) return;
  bar.style.display = '';
  const data = new Uint8Array(_audioAnalyser.frequencyBinCount);
  function tick() {
    _audioVizRafId = requestAnimationFrame(tick);
    _audioAnalyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    const level = sum / data.length / 255;
    const pct = Math.min(100, level * 300);
    fill.style.width = pct + '%';
  }
  tick();
}

function _stopVolumeViz() {
  if (_audioVizRafId) { cancelAnimationFrame(_audioVizRafId); _audioVizRafId = null; }
  const bar = document.getElementById('audioVizBar');
  if (bar) bar.style.display = 'none';
}

function _updateRemoteSliderBg(token, levelPct) {
  const base = _remoteVizBases[token];
  const fill = _remoteVizBars[token];
  const slider = audioVolume[token];
  if (!fill || !slider) return;
  const valPct = (slider.value - slider.min) / (slider.max - slider.min) * 100;
  if (base) base.style.width = valPct + '%';
  fill.style.width = Math.min(levelPct, valPct) + '%';
}

function _startRemoteVolumeViz(token) {
  const slider = audioVolume[token];
  const analyser = _remoteAnalysers[token];
  if (!slider || !analyser) return;
  const data = new Uint8Array(analyser.frequencyBinCount);
  function tick() {
    _remoteVizRafIds[token] = requestAnimationFrame(tick);
    analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    const level = sum / data.length / 255;
    const levelPct = Math.min(100, level * 300);
    _updateRemoteSliderBg(token, levelPct);
  }
  tick();
}

function _stopRemoteVolumeViz(token) {
  if (_remoteVizRafIds[token]) { cancelAnimationFrame(_remoteVizRafIds[token]); delete _remoteVizRafIds[token]; }
  _updateRemoteSliderBg(token, 0);
}

function checkAllListenFunk() {
  if (checkAllListen) {//checkAllListenを止めるとき
    checkAllListen = false;
    _setBtnState(document.getElementById('checkAllListen'), "pink");
    Object.keys(mediaElement).forEach(function (key) {
      if (videoButton[key] && videoButtonFlag[key]) {
        videoButton[key].style.backgroundColor = 'red';
        videoButtonFlag[key] = undefined;
      }
      if (audioButton[key] && audioButtonFlag[key]) {
        audioButton[key].style.backgroundColor = 'red';
        audioButtonFlag[key] = undefined;
      }
      if (videoButton[key]) {
        mediaConnect(key, "stop video");
      }
      if (audioButton[key]) {
        mediaConnect(key, "stop audio");
      }
    });
  } else {//checkAllListenを動かすとき
    checkAllListen = true;
    _setBtnState(document.getElementById('checkAllListen'), "#6C9BD2");
    Object.keys(mediaElement).forEach(function (key) {
      if (videoButton[key] && videoButtonFlag[key] === undefined) {
        videoButtonFlag[key] = true;
      }
      if (audioButton[key] && audioButtonFlag[key] === undefined) {
        audioButtonFlag[key] = true;
      }
      // cam2+ のbuttonFlagも設定・既にremoteStreamがあればattach
      for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
        const _xc = _xcam[_cn];
        if (!_xc || !_xc.button[key] || _xc.button[key].style.visibility === 'hidden') continue;
        if (_xc.buttonFlag[key] === undefined) _xc.buttonFlag[key] = true;
        if (_xc.buttonFlag[key] === true) {
          _xc.button[key].style.backgroundColor = 'skyblue';
          if (_xc.remoteStream[key] && !videoArray[key + '_' + _cn]) {
            attachVideo(key + '_' + _cn, _xc.remoteStream[key]);
          }
        }
      }
      if (videoButtonFlag[key] && audioButtonFlag[key]) {
        videoButton[key].style.backgroundColor = 'skyblue';
        audioButton[key].style.backgroundColor = 'skyblue';
        mediaConnect(key, "call video and audio");
      } else if (videoButtonFlag[key]) {
        videoButton[key].style.backgroundColor = 'skyblue';
        mediaConnect(key, "call video");
      } else if (audioButtonFlag[key]) {
        audioButton[key].style.backgroundColor = 'skyblue';
        mediaConnect(key, "call audio");
      }
    });
  }
}

function stopLocalStream(stream) {
  let tracks = stream.getTracks();
  if (!tracks) {
    console.warn('NO tracks');
    return;
  }

  // for (let track of tracks) {//正規
  //   track.stop();
  tracks.forEach(function (track) {//IE対応
    track.stop();
  });
}

function getDeviceStream(option) {
  if ('getUserMedia' in navigator.mediaDevices) {
    return navigator.mediaDevices.getUserMedia(option);
  }
  else {
    return new Promise(function (resolve, reject) {
      navigator.getUserMedia(option,
        resolve,
        reject
      );
    });
  }
}

function playMedia(element, stream) {//メディアの再生(要素,取得した映像/音声)
  if ('srcObject' in element) {
    element.srcObject = stream;
  }
  else {
    element.src = window.URL.createObjectURL(stream);
  }

  element.play().catch(e => { if (e.name !== 'AbortError') console.warn('play failed:', e); });//メディアの再生
  element.volume = 0;

  // startVoiceDetection(stream, function(val){
  //   //検出時のエフェクト等
  //   console.log("VCMETERテスト");
  // });
}

function pauseMedia(element) {//メディアの停止
  element.pause();//メディアの一時停止
  if ('srcObject' in element) {
    element.srcObject = null;
  }
  else {
    if (element.src && (element.src !== '')) {
      window.URL.revokeObjectURL(element.src);
    }
    element.src = '';
  }
}

function sendSdp(fromToken, sessionDescription) {
  let message = { type: sessionDescription.type, sdp: sessionDescription.sdp, };
  message.sendto = fromToken;
  socket.emit("webRtcSignal", message);
}

function sendIceCandidate(fromToken, candidate) {
  let message = { type: 'candidate', ice: candidate, };

  if (peerConnections[fromToken]) {
    message.sendto = fromToken;
    socket.emit("webRtcSignal", message);
  }
  else {
    console.warn('connection NOT EXIST or ALREADY CLOSED. so skip candidate')
  }
}

function createVideoButton(fromToken) {
  if (avaP[fromToken].abon) return;
  if (!mediaElement[fromToken]) {
    mediaElement[fromToken] = document.createElement('li');
    mediaElement[fromToken].classList.add('flexContainer');
    mediaElement[fromToken].classList.add('mediaElement');
    document.getElementById("mediaMenu").appendChild(mediaElement[fromToken]);
    distributor[fromToken] = document.createElement('text');
    distributor[fromToken].classList.add("order1");
    distributor[fromToken].innerHTML = avaP[fromToken].name;
    mediaElement[fromToken].prepend(distributor[fromToken]);
  }
  if (!videoButton[fromToken]) {
    videoButton[fromToken] = document.createElement('input');
    videoButton[fromToken].classList.add("order2");
    videoButton[fromToken].value = "動画受信"
    videoButton[fromToken].type = "button";
  }
  videoButton[fromToken].style.visibility = "visible";
  // mediaElement[fromToken].appendChild(videoButton[fromToken]);
  mediaElement[fromToken].insertBefore(videoButton[fromToken], mediaElement[fromToken].firstElementChild);
  if (checkAllListen) {//checkAllListenがonだったらボタンを押す
    if (videoButtonFlag[fromToken] === undefined) {
      videoButtonFlag[fromToken] = true;
    }
  }
  if (videoButtonFlag[fromToken]) {//ボタンが押されていたら
    videoButtonFlag[fromToken] = true;
    videoButton[fromToken].style.backgroundColor = 'gray';
    if ((checkAllListen && !(audioButtonFlag[fromToken] === false))) {//checkAllListenでcallAudioも呼ばれてる場合
      mediaConnect(fromToken, "call video and audio");
    } else {
      mediaConnect(fromToken, "call video");
    }
  } else {//押されてなかったら
    videoButton[fromToken].style.backgroundColor = "red";
    videoButton[fromToken].onclick = function buttonClick() {
      videoButtonFlag[fromToken] = true;
      if (stream[fromToken] && !videoArray[fromToken]) {
        videoButton[fromToken].style.backgroundColor = 'skyblue';
        attachVideo(fromToken, stream[fromToken]);
        if (selectVideoReverseOther.checked) attachVideo(fromToken + "Re", stream[fromToken]);
        if (selectVideoInverseOther.checked) attachVideo(fromToken + "Inv", stream[fromToken]);
        if (selectVideoInverseAndReverseOther.checked) attachVideo(fromToken + "IR", stream[fromToken]);
        videoButton[fromToken].onclick = function buttonClick() {
          videoButtonFlag[fromToken] = false;
          mediaConnect(fromToken, "stop video");
        };
      } else {
        videoButton[fromToken].style.backgroundColor = 'gray';
        videoButton[fromToken].onclick = null;
        mediaConnect(fromToken, "call video");
      }
    }
  }
}

function _makeCamNOnClick(n, ft) {
  return function () {
    const _xcL = _xcamGet(n);
    _xcL.buttonFlag[ft] = true;
    if (_xcL.remoteStream[ft] && !videoArray[ft + '_' + n]) {
      _xcL.button[ft].style.backgroundColor = 'skyblue';
      attachVideo(ft + '_' + n, _xcL.remoteStream[ft]);
      _xcL.button[ft].onclick = function () {
        _xcL.buttonFlag[ft] = false;
        if (videoArray[ft + '_' + n]) detachVideo(ft + '_' + n);
        _xcL.button[ft].style.backgroundColor = 'red';
        _xcL.button[ft].onclick = _makeCamNOnClick(n, ft);
      };
    } else {
      _xcL.button[ft].style.backgroundColor = 'gray';
      _xcL.button[ft].onclick = null;
      mediaConnect(ft, "call video");
    }
  };
}

function createVideoButtonN(n, fromToken) {
  if (avaP[fromToken] && avaP[fromToken].abon) return;
  if (!mediaElement[fromToken]) {
    mediaElement[fromToken] = document.createElement('li');
    mediaElement[fromToken].classList.add('flexContainer');
    mediaElement[fromToken].classList.add('mediaElement');
    document.getElementById("mediaMenu").appendChild(mediaElement[fromToken]);
    distributor[fromToken] = document.createElement('text');
    distributor[fromToken].classList.add("order1");
    distributor[fromToken].innerHTML = avaP[fromToken] ? avaP[fromToken].name : fromToken;
    mediaElement[fromToken].prepend(distributor[fromToken]);
  }
  const _xc = _xcamGet(n);
  if (!_xc.button[fromToken]) {
    _xc.button[fromToken] = document.createElement('input');
    _xc.button[fromToken].classList.add("order2");
    _xc.button[fromToken].value = "動画受信" + n;
    _xc.button[fromToken].type = "button";
  }
  _xc.button[fromToken].style.visibility = "visible";
  // cam(n-1)ボタンの直後に挿入（番号順を維持）
  const _prevBtn = n === 2 ? videoButton[fromToken] : (_xcam[n - 1] && _xcam[n - 1].button[fromToken]);
  if (_prevBtn && _prevBtn.parentNode === mediaElement[fromToken]) {
    mediaElement[fromToken].insertBefore(_xc.button[fromToken], _prevBtn.nextSibling);
  } else {
    mediaElement[fromToken].insertBefore(_xc.button[fromToken], mediaElement[fromToken].firstElementChild);
  }
  if (checkAllListen && _xc.buttonFlag[fromToken] === undefined) {
    _xc.buttonFlag[fromToken] = true;
  }
  if (_xc.buttonFlag[fromToken]) {
    _xc.buttonFlag[fromToken] = true;
    if (_xc.remoteStream[fromToken] && !videoArray[fromToken + '_' + n]) {
      _xc.button[fromToken].style.backgroundColor = 'skyblue';
      attachVideo(fromToken + '_' + n, _xc.remoteStream[fromToken]);
    } else {
      _xc.button[fromToken].style.backgroundColor = 'gray';
      mediaConnect(fromToken, "call video");
    }
  } else {
    _xc.button[fromToken].style.backgroundColor = "red";
    _xc.button[fromToken].onclick = _makeCamNOnClick(n, fromToken);
  }
}

function createAudioButton(fromToken) {
  if (avaP[fromToken].abon) return;
  if (!mediaElement[fromToken]) {
    mediaElement[fromToken] = document.createElement('li');
    mediaElement[fromToken].classList.add('flexContainer');
    mediaElement[fromToken].classList.add('mediaElement');
    document.getElementById("mediaMenu").appendChild(mediaElement[fromToken]);
    distributor[fromToken] = document.createElement('text');
    distributor[fromToken].classList.add("order1");
    distributor[fromToken].innerHTML = avaP[fromToken].name;
    mediaElement[fromToken].prepend(distributor[fromToken]);

  }
  if (!audioButton[fromToken]) {
    audioButton[fromToken] = document.createElement('input');
    audioButton[fromToken].classList.add("order2");
    audioButton[fromToken].value = "音声受信"
    audioButton[fromToken].type = "button";
  }
  audioButton[fromToken].style.visibility = "visible";
  mediaElement[fromToken].appendChild(audioButton[fromToken]);
  if (!audioVolume[fromToken]) {
    audioVolume[fromToken] = document.createElement('input');
    audioVolume[fromToken].token = fromToken;
    audioVolume[fromToken].classList.add('audioVolume');
    audioVolume[fromToken].type = "range";
    audioVolume[fromToken].name = "speed";
    audioVolume[fromToken].value = 0.5;
    audioVolume[fromToken].min = "0";
    audioVolume[fromToken].max = "1";
    audioVolume[fromToken].step = "0.001";
    audioVolume[fromToken].oninput = function setAudioVolume() {
      if (remoteAudios[fromToken]) {
        remoteAudios[fromToken].volume = audioVolume[fromToken].value;
      }
      if (!_remoteVizRafIds[fromToken]) _updateRemoteSliderBg(fromToken, 0);
    }
  } else {
    let audio = remoteAudios[fromToken];
    // audio.volume = document.getElementById(fromToken).value;
  }
  if (!_remoteVizBars[fromToken]) {
    const base = document.createElement('div');
    base.classList.add('audioVolumeBase');
    const fill = document.createElement('div');
    fill.classList.add('audioVolumeFill');
    const track = document.createElement('div');
    track.classList.add('audioVolumeTrack');
    track.appendChild(base);
    track.appendChild(fill);
    const wrap = document.createElement('div');
    wrap.classList.add('audioVolumeWrap');
    wrap.appendChild(track);
    wrap.appendChild(audioVolume[fromToken]);
    _remoteVizBases[fromToken] = base;
    _remoteVizBars[fromToken] = fill;
    mediaElement[fromToken].appendChild(wrap);
    _updateRemoteSliderBg(fromToken, 0);
  } else {
    mediaElement[fromToken].appendChild(audioVolume[fromToken].closest('.audioVolumeWrap') || audioVolume[fromToken]);
  }

  if (checkAllListen) {//checkAllListenがonだったらボタンを押す
    if (audioButtonFlag[fromToken] === undefined) {
      audioButtonFlag[fromToken] = true;
    }
  }

  if (audioButtonFlag[fromToken]) {//ボタンが既に押されていたら
    audioButton[fromToken].style.backgroundColor = 'gray';
    mediaConnect(fromToken, "call audio");
  } else {//押されてなかったら
    audioButton[fromToken].style.backgroundColor = "red";
    audioButton[fromToken].onclick = function buttonClick() {
      audioButtonFlag[fromToken] = true;
      audioButton[fromToken].style.backgroundColor = 'gray';
      audioButton[fromToken].onclick = null;
      mediaConnect(fromToken, "call audio");
    }
  }
}

// ---------------------- connection handling -----------------------
function prepareNewConnection(fromToken) {
  let pc_config = {
    "iceServers": [
      { "urls": "stun:stun.l.google.com:19302" },
      { "urls": "stun:stun1.l.google.com:19302" },
      { "urls": "stun:stun.relay.metered.ca:80" },
      { "urls": "turn:standard.relay.metered.ca:80", "username": "1de346abd63cffd84750fcc1", "credential": "aUFOMmZAGpxKtEHZ" },
      { "urls": "turn:standard.relay.metered.ca:80?transport=tcp", "username": "1de346abd63cffd84750fcc1", "credential": "aUFOMmZAGpxKtEHZ" },
      { "urls": "turn:standard.relay.metered.ca:443", "username": "1de346abd63cffd84750fcc1", "credential": "aUFOMmZAGpxKtEHZ" },
      { "urls": "turns:standard.relay.metered.ca:443?transport=tcp", "username": "1de346abd63cffd84750fcc1", "credential": "aUFOMmZAGpxKtEHZ" }
    ]
  };
  let peer = new RTCPeerConnection(pc_config);

  // --- on get remote stream ---
  if ('ontrack' in peer) {
    peer.ontrack = (event) => {
      let track = event.track;
      // 追加カメラの判定（streamIdで照合、大きいインデックス優先）
      let _matchedCamN = 0;
      if (track.kind === 'video' && event.streams[0]) {
        for (let _cn = MAX_CAMS; _cn >= 2; _cn--) {
          const _xc = _xcam[_cn];
          if (_xc && _xc.streamId[fromToken] && event.streams[0].id === _xc.streamId[fromToken]) {
            _matchedCamN = _cn; break;
          }
        }
      }
      console.log('[ontrack]', fromToken.slice(0,6), track.kind, _matchedCamN ? 'cam' + _matchedCamN : '', 'flag:', videoButtonFlag[fromToken], 'hasVideo:', !!videoArray[fromToken]);
      if (track.kind === 'video') {
        if (_matchedCamN >= 2) {
          // 追加カメラのトラック
          const _xc = _xcamGet(_matchedCamN);
          const _sfx = '_' + _matchedCamN;
          _xc.remoteStream[fromToken] = event.streams[0];
          if (_xc.buttonFlag[fromToken] === true && !videoArray[fromToken + _sfx]) {
            if (_xc.button[fromToken]) _xc.button[fromToken].style.backgroundColor = 'skyblue';
            attachVideo(fromToken + _sfx, _xc.remoteStream[fromToken]);
            if (_xc.button[fromToken]) {
              _xc.button[fromToken].onclick = (function(_n, _ft) { return function () {
                const _xcLocal = _xcamGet(_n);
                _xcLocal.buttonFlag[_ft] = false;
                if (videoArray[_ft + '_' + _n]) detachVideo(_ft + '_' + _n);
                if (_xcLocal.button[_ft]) {
                  _xcLocal.button[_ft].style.backgroundColor = 'red';
                  _xcLocal.button[_ft].onclick = function () {
                    _xcLocal.buttonFlag[_ft] = true;
                    if (_xcLocal.remoteStream[_ft]) attachVideo(_ft + '_' + _n, _xcLocal.remoteStream[_ft]);
                    if (_xcLocal.button[_ft]) _xcLocal.button[_ft].style.backgroundColor = 'skyblue';
                  };
                }
              }; })(_matchedCamN, fromToken);
            }
          }
        } else {
          // cam1 のトラック
          const _incomingId = event.streams[0] && event.streams[0].id;
          // cam1受信済みかつ別streamID = createVideoButtonNより先に来たcam2+トラック → pending保存
          if (stream[fromToken] && _incomingId && _incomingId !== stream[fromToken].id) {
            if (!_pendingRemoteVideoStreams[fromToken]) _pendingRemoteVideoStreams[fromToken] = {};
            _pendingRemoteVideoStreams[fromToken][_incomingId] = event.streams[0];
          } else {
            stream[fromToken] = event.streams[0];
            if (videoButtonFlag[fromToken] === true && !videoArray[fromToken]) {//videoButtonがonの時
              videoButton[fromToken].style.backgroundColor = 'skyblue';
              attachVideo(fromToken, stream[fromToken]);

              if (selectVideoReverseOther.checked) {//受信した動画の左右反転にチェックが入ってたら
                attachVideo(fromToken + "Re", stream[fromToken]);
              }
              if (selectVideoInverseOther.checked) {//受信した動画の上下反転にチェックが入ってたら
                attachVideo(fromToken + "Inv", stream[fromToken]);
              }
              if (selectVideoInverseAndReverseOther.checked) {//受信した動画の上下左右反転にチェックが入ってたら
                attachVideo(fromToken + "IR", stream[fromToken]);
              }
              videoButton[fromToken].onclick = function buttonClick() {//videoButtonがクリックされた時
                videoButtonFlag[fromToken] = false;
                mediaConnect(fromToken, "stop video");
                ///映像が直ぐに消えないならdetachvideoとかやる
              }
            }
          }
        }
      }
      else if (track.kind === 'audio') {
        if (audioButtonFlag[fromToken] === true && !remoteAudios[fromToken]) {//audioButtonがonの時
          audioButton[fromToken].style.backgroundColor = 'skyblue';
          attachAudio(fromToken, stream[fromToken]);
          audioButton[fromToken].onclick = function buttonClick() {//audioButtonがクリックされた時
            audioButtonFlag[fromToken] = false;
            mediaConnect(fromToken, "stop audio");
          }
        }
      }
      if (stream[fromToken]) {
        stream[fromToken].onaddtrack = function (evt) {
          const trackOnAdd = evt.track;
          if (trackOnAdd.kind === 'video') {
          }
          else if (trackOnAdd.kind === 'audio') {
          }
        };

        stream[fromToken].onremovetrack = function (evt) {//除去の場合
          const trackRemove = evt.track;
          if (trackRemove.kind === 'video') {// video除去時の処理
            if (videoArray[fromToken]) {
              detachVideo(fromToken);
            }
            if (videoButton[fromToken] && !videoButtonFlag[fromToken]) {//リスナー側が切っただけの場合
              videoButton[fromToken].style.backgroundColor = "red";
              videoButton[fromToken].onclick = function buttonClick() {
                videoButtonFlag[fromToken] = true;
                mediaConnect(fromToken, "call video");;
              }
            }
          } else if (trackRemove.kind === 'audio') {// audio除去時の処理
            if (remoteAudios[fromToken]) {
              detachAudio(fromToken);
            }
            if (audioButton[fromToken] && !audioButtonFlag[fromToken]) {//リスナー側が切っただけの場合
              audioButton[fromToken].style.backgroundColor = "red";
              audioButton[fromToken].onclick = function buttonClick() {
                audioButtonFlag[fromToken] = true;
                mediaConnect(fromToken, "call audio");
              }
            }

            // if (!audioButton[fromToken] && mediaElement[fromToken]) {
            //   document.getElementById("mediaMenu").removeChild(mediaElement[fromToken]);
          }
        };
      }

    };
  }
  else {
    // peer.onaddstream = (event) => {
    //   let stream = event.stream;
    //   console.log('-- peer.onaddstream() stream.token=' + stream.token);
    //playMedia(remoteVideo, stream);
    // attachVideo(fromToken, stream);///要修正
    // };
  }

  // --- on get local ICE candidate
  peer.onicecandidate = function (evt) {
    if (evt.candidate) {
      const c = evt.candidate;
      console.log('[ICEcand]', fromToken.slice(0,6), c.type, c.protocol, c.address, c.port, c.relatedAddress || '');

      // Trickle ICE の場合は、ICE candidateを相手に送る

      if (!isDataChannelOpen(peer)) {   // チャット前
        // ICE candidateをサーバーを経由して相手に送信
        sendIceCandidate(fromToken, evt.candidate);
      } else {   // チャット中
        // ICE candidateをDataChannelを通して相手に直接送信
        peer.datachannel.send(JSON.stringify({ type: "candidate", data: evt.candidate }));
      }

      // Vanilla ICE の場合には、何もしない
    } else {
      console.log('[ICEcand] gathering complete for', fromToken.slice(0,6));
    }
  };

  // --- when need to exchange SDP ---
  peer.onnegotiationneeded = function (evt) {
    if (!isDataChannelOpen(peer)) {

    } else {
      peer.createOffer()
        .then(function (sessionDescription) {
          return peer.setLocalDescription(sessionDescription);//これでSDPを覚える
        }).then(() => {
          // 初期OfferSDPをDataChannelを通して相手に直接送信
          peer.datachannel.send(JSON.stringify({ type: "offer", data: peer.localDescription }));
        }).catch(function (err) {
          console.error(err);
        });
    }
  };

  peer.onsignalingstatechange = () => {
  };

  peer.oniceconnectionstatechange = () => {
    console.log('[ICE]', fromToken.slice(0,6), peer.iceConnectionState);
    if (peer.iceConnectionState === 'failed') {
      console.warn('[ICE] failed - TURN server unreachable?');
      if (videoButton[fromToken] && videoButtonFlag[fromToken] && !videoArray[fromToken]) {
        videoButtonFlag[fromToken] = false;
        videoButton[fromToken].style.backgroundColor = 'red';
        videoButton[fromToken].onclick = function buttonClick() {
          videoButtonFlag[fromToken] = true;
          videoButton[fromToken].style.backgroundColor = 'gray';
          videoButton[fromToken].onclick = null;
          mediaConnect(fromToken, "call video");
        };
      }
      if (audioButton[fromToken] && audioButtonFlag[fromToken] && !remoteAudios[fromToken]) {
        audioButtonFlag[fromToken] = false;
        audioButton[fromToken].style.backgroundColor = 'red';
        audioButton[fromToken].onclick = function buttonClick() {
          audioButtonFlag[fromToken] = true;
          audioButton[fromToken].style.backgroundColor = 'gray';
          audioButton[fromToken].onclick = null;
          mediaConnect(fromToken, "call audio");
        };
      }
      for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
        const _xc = _xcam[_cn];
        if (_xc && _xc.button[fromToken] && _xc.buttonFlag[fromToken] && !videoArray[fromToken + '_' + _cn]) {
          _xc.buttonFlag[fromToken] = false;
          _xc.button[fromToken].style.backgroundColor = 'red';
          _xc.button[fromToken].onclick = _makeCamNOnClick(_cn, fromToken);
        }
      }
    }
    if (peer.iceConnectionState === 'disconnected') {
      stopConnection(fromToken);//相手が切断したときにこちらも切断する

    }
  };

  peer.onicegatheringstatechange = () => {
    console.log('[ICEgather]', fromToken.slice(0,6), peer.iceGatheringState);
  };

  // Data channel イベントが発生したときのイベントハンドラ
  // - このイベントは、createDataChannel() を呼び出すリモートピアによって
  //   RTCDataChannelが接続に追加されたときに送信されます。
  //   see : https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ondatachannel
  peer.ondatachannel = (event) => {
    // DataChannelオブジェクトをRTCPeerConnectionオブジェクトのメンバーに追加。
    peer.datachannel = event.channel;
    // DataChannelオブジェクトのイベントハンドラの構築
    setupDataChannelEventHandler(peer);
    peer.createOffer()
      .then(function (sessionDescription) {
        return peer.setLocalDescription(sessionDescription);//これでSDPを覚える
      }).then(() => {
        // 初期OfferSDPをDataChannelを通して相手に直接送信
        peer.datachannel.send(JSON.stringify({ type: "offer", data: peer.localDescription, token: fromToken }));
      }).catch(function (err) {
        console.error(err);
      });
  };

  return peer;
}///// prepareNewConnection

// DataChannelオブジェクトのイベントハンドラの構築
function setupDataChannelEventHandler(rtcPeerConnection) {
  if (!("datachannel" in rtcPeerConnection)) {
    console.error("Unexpected : DataChannel does not exist.");
    return;
  }

  // message イベントが発生したときのイベントハンドラ
  rtcPeerConnection.datachannel.onmessage = (event) => {//datachanelの受信
    let objData = JSON.parse(event.data);

    if ("offer" === objData.type) {
      // 受信したOfferSDPの設定とAnswerSDPの作成
      setOfferDataChannel(rtcPeerConnection, objData.data, objData.token);
    }
    else if ("answer" === objData.type) {
      // 受信したAnswerSDPの設定
      setAnswerDataChannel(rtcPeerConnection, objData.data);
    }
    else if ("candidate" === objData.type) {
      // 受信したICE candidateの追加
      // addCandidate(rtcPeerConnection, objData.data);
      rtcPeerConnection.addIceCandidate(objData.data)
        .catch(function (error) {
          console.error("Error : ", error);
        });
    }
    else if ("call video" === objData.type) {
      if (videoStatus) {
        mapPeer.forEach(function (value) {
          if (value.get("rtc") === rtcPeerConnection) {
            if (!value.get("idOldVideo")) {
              value.set("onVideo", true);
              value.set("oldVideo", localStream.getVideoTracks()[0]);
              value.set("idOldVideo", localStream.getVideoTracks()[0].id);
              value.get("rtc").addTrack(value.get("oldVideo"), localStream);
            }
            // 追加カメラも配信中なら追加
            for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
              const _xc = _xcam[_cn];
              if (_xc && _xc.status && _xc.stream && _xc.track && !value.get("idOldVideoN_" + _cn)) {
                value.set("oldVideoN_" + _cn, _xc.track);
                value.set("idOldVideoN_" + _cn, _xc.track.id);
                value.get("rtc").addTrack(_xc.track, _xc.stream);
              }
            }
          }
        });
      }
    } else if ("call audio" === objData.type) {
      if (audioStatus) {
        mapPeer.forEach(function (value) {
          if (value.get("rtc") === rtcPeerConnection) {
            if (!value.get("idOldAudio")) {
              value.set("onAudio", true);
              value.set("oldAudio", localStream.getAudioTracks()[0]);
              value.set("idOldAudio", localStream.getAudioTracks()[0].id);
              value.get("rtc").addTrack(value.get("oldAudio"), localStream);
            }
          }
        });
      }
    } else if ("call video and audio" === objData.type) {
      if (videoStatus) {
        mapPeer.forEach(function (value) {
          if (value.get("rtc") === rtcPeerConnection) {
            if (!value.get("idOldVideo")) {
              value.set("onVideo", true);
              value.set("oldVideo", localStream.getVideoTracks()[0]);
              value.set("idOldVideo", localStream.getVideoTracks()[0].id);
              value.get("rtc").addTrack(value.get("oldVideo"), localStream);
            }
            // 追加カメラも配信中なら追加
            for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
              const _xc = _xcam[_cn];
              if (_xc && _xc.status && _xc.stream && _xc.track && !value.get("idOldVideoN_" + _cn)) {
                value.set("oldVideoN_" + _cn, _xc.track);
                value.set("idOldVideoN_" + _cn, _xc.track.id);
                value.get("rtc").addTrack(_xc.track, _xc.stream);
              }
            }
          }
        });
      }

      if (audioStatus) {
        mapPeer.forEach(function (value) {
          if (value.get("rtc") === rtcPeerConnection) {
            if (!value.get("idOldAudio")) {
              value.set("onAudio", true);
              value.set("oldAudio", localStream.getAudioTracks()[0]);
              value.set("idOldAudio", localStream.getAudioTracks()[0].id);
              value.get("rtc").addTrack(value.get("oldAudio"), localStream);
            }
          }
        });
      }

    }
    else if ("stop video" === objData.type) {
      mapPeer.forEach(function (value) {
        if (value.get("rtc") === rtcPeerConnection) {
          let senders = value.get("rtc").getSenders();
          senders.forEach(function (sender) {
            if (sender.track) {
              if (value.get("oldVideo")) {
                if (value.get("idOldVideo") === sender.track.id) {
                  value.get("rtc").removeTrack(sender);
                  // removeTrack()の結果として、通信相手に、streamの「removetrack」イベントが発生する。
                }
              }
            }
          });
          if (value.get("oldVideo")) {
            value.delete("onVideo");
            value.delete("oldVideo");
            value.delete("idOldVideo");
          }
        }
      });
    }
    else if ("stop audio" === objData.type) {
      mapPeer.forEach(function (value) {
        if (value.get("rtc") === rtcPeerConnection) {
          let senders = value.get("rtc").getSenders();
          senders.forEach(function (sender) {
            if (sender.track) {
              if (value.get("oldAudio")) {
                if (value.get("idOldAudio") === sender.track.id) {
                  value.get("rtc").removeTrack(sender);
                  // removeTrack()の結果として、通信相手に、streamの「removetrack」イベントが発生する
                }
              }
            }
          });
          if (value.get("oldAudio")) {
            value.delete("onAudio");
            value.delete("oldAudio");
            value.delete("idOldAudio");
          }
        }
      });
    }
    else if ("setReceiverQuality" === objData.type) {
      mapPeer.forEach(function (value) {
        if (value.get("rtc") === rtcPeerConnection) {
          value.get("rtc").getSenders().forEach(function (sender) {
            if (sender.track && sender.track.kind === 'video') {
              const params = sender.getParameters();
              if (!params.encodings || params.encodings.length === 0) params.encodings = [{}];
              const bitrate = QUALITY_BITRATE[objData.quality];
              if (bitrate !== undefined) {
                params.encodings[0].maxBitrate = bitrate;
              } else {
                delete params.encodings[0].maxBitrate;
              }
              sender.setParameters(params).catch(e => console.warn('setParameters:', e));
            }
          });
        }
      });
    }
  }
}

// コネクションの終了処理
function endPeerConnection(rtcPeerConnection) {
  // DataChannelの終了
  if ("datachannel" in rtcPeerConnection) {
    rtcPeerConnection.datachannel.close();
    rtcPeerConnection.datachannel = null;
  }
  // グローバル変数から解放
  rtcPeerConnection = null;
  // ピアコネクションの終了
  rtcPeerConnection.close();
}

// DataChannelが開いているか
function isDataChannelOpen(rtcPeerConnection) {
  if (rtcPeerConnection.datachannel) {
  }
  if (!rtcPeerConnection) {
    return false;
  }
  if (!("datachannel" in rtcPeerConnection)) {   // datachannelメンバーが存在しない
    return false;
  }
  if (!rtcPeerConnection.datachannel) {   // datachannelメンバーがnull
    return false;
  }
  if ("open" !== rtcPeerConnection.datachannel.readyState) {   // datachannelメンバーはあるが、"open"でない。
    return false;
  }
  // DataCchannelが開いている
  return true;
}

function makeOffer(fromToken, video, audio) {
  let peerConnection = prepareNewConnection(fromToken);
  mapPeer.set(fromToken, new Map());

  if (localStream) {//これで受信した時にstreamにぶち込む
    if (videoStatus && video) {
      mapPeer.get(fromToken).set("onVideo", true);
      mapPeer.get(fromToken).set("oldVideo", localStream.getVideoTracks()[0]);
      mapPeer.get(fromToken).set("idOldVideo", localStream.getVideoTracks()[0].id);
      peerConnection.addTrack(mapPeer.get(fromToken).get("oldVideo"), localStream);
    }
    if (audioStatus && audio) {
      mapPeer.get(fromToken).set("oldAudio", localStream.getAudioTracks()[0]);
      mapPeer.get(fromToken).set("idOldAudio", localStream.getAudioTracks()[0].id);
      peerConnection.addTrack(mapPeer.get(fromToken).get("oldAudio"), localStream);
    }
  }
  else {
    console.warn('no local stream, but continue.');
  }
  // 追加カメラも配信中なら追加
  if (video) {
    for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
      const _xc = _xcam[_cn];
      if (_xc && _xc.status && _xc.stream && _xc.track) {
        mapPeer.get(fromToken).set('oldVideoN_' + _cn, _xc.track);
        mapPeer.get(fromToken).set('idOldVideoN_' + _cn, _xc.track.id);
        peerConnection.addTrack(_xc.track, _xc.stream);
      }
    }
  }

  // DataChannelの作成
  let datachannel = peerConnection.createDataChannel("my datachannel");
  // DataChannelオブジェクトをRTCPeerConnectionオブジェクトのメンバーに追加。
  peerConnection.datachannel = datachannel;
  // DataChannelオブジェクトのイベントハンドラの構築
  setupDataChannelEventHandler(peerConnection);

  peerConnections[fromToken] = peerConnection;
  mapPeer.get(fromToken).set("rtc", peerConnection);

  peerConnection.createOffer()
    .then(function (sessionDescription) {
      return peerConnection.setLocalDescription(sessionDescription);//これが鍵、これでSDPを覚え直す
    }).then(() => {
      // -- Trickle ICE の場合は、初期SDPを相手に送る --
      sendSdp(fromToken, peerConnection.localDescription);
    }).catch(function (err) {
      console.error(err);
    });
}

function setOffer(fromToken, sessionDescription) {//message.type === 'offer'の時使う
  if (_inRoomTransition) return;
  let peerConnection = prepareNewConnection(fromToken);
  mapPeer.set(fromToken, new Map());

  peerConnections[fromToken] = peerConnection;
  mapPeer.get(fromToken).set("rtc", peerConnection);

  peerConnection.setRemoteDescription(sessionDescription)
    .then(() => {
      if (!peerConnection) {
        console.error('peerConnection NOT exist!');
        return;
      }
      peerConnection.createAnswer()
        .then(function (sessionDescription) {
          return peerConnection.setLocalDescription(sessionDescription);
        }).then(() => {
          // -- Trickle ICE の場合は、初期SDPを相手に送る -- 
          sendSdp(fromToken, peerConnection.localDescription);
        }).catch(function (err) {
          console.error(err);
        });
    }).catch(function (err) {
      console.error('setRemoteDescription(offer) ERROR: ', err);
    });
}

// OfferSDPの設定とAnswerSDPの作成//dateChannel用,後で整理したほうがいいかな
function setOfferDataChannel(rtcPeerConnection, sessionDescription, fromToken) {
  rtcPeerConnection.setRemoteDescription(sessionDescription)
    .then(() => {
      rtcPeerConnection.createAnswer()
        .then(function (sessionDescription) {
          return rtcPeerConnection.setLocalDescription(sessionDescription);
        }).then(() => {
          if (!isDataChannelOpen(rtcPeerConnection)) {   // チャット前
            // 初期AnswerSDPをサーバーを経由して相手に送信
            sendSdp(fromToken, rtcPeerConnection.localDescription);
          } else {   // チャット中
            // 初期AnswerSDPをDataChannelを通して相手に直接送信
            rtcPeerConnection.datachannel.send(JSON.stringify({ type: "answer", data: rtcPeerConnection.localDescription }));
          }
        }).catch(function (err) {
          console.error(err);
        });
    });
}

function setAnswer(fromToken, sessionDescription) {//message.type === 'answer'の時使う
  let peerConnection = peerConnections[fromToken];
  if (!peerConnection) {
    console.error('peerConnection NOT exist!');
    return;
  }

  peerConnection.setRemoteDescription(sessionDescription)
    .then(() => {
    }).catch((err) => {
      console.error('setRemoteDescription(answer) ERROR: ', err);
    });
}

// AnswerSDPの設定//dateChannel用,後で整理したほうがいいかな
function setAnswerDataChannel(rtcPeerConnection, sessionDescription) {
  rtcPeerConnection.setRemoteDescription(sessionDescription)
    .catch((error) => {
      console.error("Error : ", error);

    });
}

// --- tricke ICE ---
function addIceCandidate(fromToken, candidate) {
  if (!peerConnections[fromToken]) {
    console.warn('NOT CONNEDTED or ALREADY CLOSED with token=' + fromToken + ', so ignore candidate');
    return;
  }

  let peerConnection = peerConnections[fromToken];
  if (peerConnection) {
    peerConnection.addIceCandidate(candidate);
  }
  else {
    console.error('PeerConnection not exist!');
    return;
  }
}

// start PeerConnection
function mediaConnect(fromToken, type) {
  console.log('[mediaConnect]', type, 'mapPeer:', !!mapPeer.get(fromToken), 'dcOpen:', mapPeer.get(fromToken) ? isDataChannelOpen(mapPeer.get(fromToken).get("rtc")) : '-');
  if (!canConnectMore()) {
    console.warn('[mediaConnect] canConnectMore=false');
  } else {
    if (mapPeer.get(fromToken)) {
      if (isDataChannelOpen(mapPeer.get(fromToken).get("rtc"))) {//接続済の場合
        mapPeer.get(fromToken).get("rtc").datachannel.send(JSON.stringify({ type: type }));
      } else {
        console.warn('[mediaConnect] mapPeer exists but dc not open, state:', mapPeer.get(fromToken).get("rtc")?.datachannel?.readyState);
      }
    } else {//まだ未接続の場合
      if (type == "call video and audio" || type == "call video" || type == "call audio") {
        console.log('[mediaConnect] emit webRtcSignal', type);
        socket.emit("webRtcSignal", { sendto: fromToken, type: type, });
      }
    }
  }
}

function changeCameraSelectMode(val) {
  cameraSelectMode = val;
  localStorage.setItem('cameraSelectMode', val);
}

function changeMicSelectMode(val) {
  micSelectMode = val;
  localStorage.setItem('micSelectMode', val);
}

async function populateDeviceSelects(kind) {
  // kind='videoinput': カメラ権限のみ取得、'audioinput': マイク権限のみ取得、未指定: 権限不要
  // すでに配信中なら権限は取得済みなのでgetUserMediaをスキップ
  if (kind) {
    const alreadyStreaming = (kind === 'videoinput' && videoStatus) || (kind === 'audioinput' && audioStatus);
    if (!alreadyStreaming) {
      const constraint = kind === 'videoinput' ? { video: true } : { audio: true };
      await navigator.mediaDevices.getUserMedia(constraint)
        .then(tmp => { tmp.getTracks().forEach(t => t.stop()); })
        .catch(() => {});
    }
  }
  const devices = await navigator.mediaDevices.enumerateDevices();
  function fill(selectEl, kindFilter, savedId, savedLabel) {
    const list = devices.filter(d => d.kind === kindFilter && d.deviceId);
    selectEl.innerHTML = '';
    if (!list.length) {
      // 権限未取得でも保存済みラベルがあれば表示
      if (savedId && savedLabel) {
        const opt = document.createElement('option');
        opt.value = savedId;
        opt.textContent = savedLabel;
        opt.selected = true;
        selectEl.appendChild(opt);
      }
      return;
    }
    list.forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = d.deviceId;
      opt.textContent = d.label || (d.deviceId === savedId && savedLabel) || (kindFilter === 'videoinput' ? 'カメラ' : 'マイク') + (i + 1);
      if (d.deviceId === savedId) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }
  const _fillCamId = (_settingPreviewActive && _settingPreviewCurrentDeviceId) ? _settingPreviewCurrentDeviceId : cameraDeviceId;
  const _fillCamLabel = (_settingPreviewActive && _settingPreviewCurrentDeviceId) ? '' : cameraDeviceLabel;
  fill(document.getElementById('cameraDeviceSelect'), 'videoinput', _fillCamId, _fillCamLabel);
  fill(document.getElementById('micDeviceSelect'), 'audioinput', micDeviceId, micDeviceLabel);

  const camList = devices.filter(d => d.kind === 'videoinput' && d.deviceId);
  function fillExtraCamSelect(selectEl, savedId) {
    selectEl.innerHTML = '<option value="">(なし)</option>';
    camList.forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = d.deviceId;
      opt.textContent = d.label || 'カメラ' + (i + 1);
      if (d.deviceId === savedId) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }

  // 追加カメラセレクターを動的生成（camExtraDeviceWraps コンテナ内に配置）
  if (multiCameraEnabled) {
    let container = document.getElementById('camExtraDeviceWraps');
    if (!container) { container = document.createElement('div'); container.id = 'camExtraDeviceWraps'; document.getElementById('cam2DeviceWrap')?.parentNode?.insertBefore(container, document.getElementById('cam2DeviceWrap') || null); }
    // 不要なラッパーをすべて削除して再描画
    container.innerHTML = '';
    // 最後にdeviceIdが設定されているカメラ+1まで表示（cam1選択済みなら最低cam2まで）
    let _maxShowCam = cameraDeviceId ? 2 : 1;
    for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
      if (_xcam[_cn] && _xcam[_cn].deviceId) _maxShowCam = Math.min(_cn + 1, MAX_CAMS);
    }
    for (let _cn = 2; _cn <= _maxShowCam; _cn++) {
      const _xc = _xcamGet(_cn);
      const wrap = document.createElement('div');
      wrap.style.marginTop = '3px';
      const lbl = document.createElement('span');
      lbl.style.cssText = 'display:block; font-size:0.9em;';
      lbl.textContent = 'カメラ' + _cn + '：';
      const sel = document.createElement('select');
      sel.style.cssText = 'width:auto; max-width:100%; margin-top:2px; box-sizing:border-box;';
      sel.onchange = (function(_n, _s) { return function () { onCameraDeviceSelectN(_n, _s); }; })(_cn, sel);
      fillExtraCamSelect(sel, _xc.deviceId);
      wrap.appendChild(lbl);
      wrap.appendChild(sel);
      container.appendChild(wrap);
    }
    // プレビュー要素も動的生成
    let previewContainer = document.getElementById('settingPreviewExtraWraps');
    if (!previewContainer) {
      previewContainer = document.createElement('div');
      previewContainer.id = 'settingPreviewExtraWraps';
      const pw = document.getElementById('settingPreviewWrap');
      if (pw) pw.parentNode.insertBefore(previewContainer, pw.nextSibling);
    }
    previewContainer.innerHTML = '';
    for (let _cn = 2; _cn <= MAX_CAMS; _cn++) {
      const _xc = _xcam[_cn];
      if (!_xc || !_xc.deviceId) break;
      let wrap = document.getElementById('settingPreview' + _cn + 'Wrap');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'settingPreview' + _cn + 'Wrap';
        wrap.style.cssText = 'display:none; width:50%; margin-top:4px; border-radius:4px; overflow:hidden;';
        const vid = document.createElement('video');
        vid.id = 'settingPreview' + _cn;
        vid.autoplay = true; vid.setAttribute('playsinline', ''); vid.muted = true;
        vid.style.cssText = 'width:100%; display:block; min-height:0;';
        wrap.appendChild(vid);
      }
      previewContainer.appendChild(wrap);
    }
  } else {
    const c = document.getElementById('camExtraDeviceWraps');
    if (c) c.innerHTML = '';
    const pc = document.getElementById('settingPreviewExtraWraps');
    if (pc) pc.innerHTML = '';
  }
}

function onCameraDeviceSelect(sel) {
  if (!sel.value) return;
  if (_settingPreviewActive) {
    // プレビューモード中: プレビューのみ切り替え、保存・配信切り替えはしない
    _switchSettingPreview(sel.value);
    return;
  }
  cameraDeviceId = sel.value;
  cameraDeviceLabel = sel.options[sel.selectedIndex]?.textContent || '';
  localStorage.setItem('cameraDeviceId', cameraDeviceId);
  localStorage.setItem('cameraDeviceLabel', cameraDeviceLabel);
  if (videoStatus) switchVideoDevice(cameraDeviceId);
}

function onMultiCameraCheckChange(checkbox) {
  multiCameraEnabled = checkbox.checked;
  localStorage.setItem('multiCameraEnabled', multiCameraEnabled ? 'true' : 'false');
  populateDeviceSelects();
  if (!multiCameraEnabled) {
    for (let _cn = MAX_CAMS; _cn >= 2; _cn--) {
      const _xcn = _xcam[_cn];
      if (_xcn && _xcn.status) stopVideoN(_cn);
      if (_xcn) {
        _xcn.deviceId = '';
        localStorage.removeItem('cameraDeviceId_' + _cn);
        if (_xcn.previewStream && _xcn.previewStream !== _xcn.stream) { _xcn.previewStream.getTracks().forEach(t => t.stop()); }
        _xcn.previewStream = null;
      }
    }
  }
}

async function onCameraDeviceSelectN(n, sel) {
  if (_settingPreviewActive) {
    if (sel.value) _switchSettingPreviewN(n, sel.value);
    return;
  }
  const _xc = _xcamGet(n);
  if (!sel.value) {
    if (_xc.status) stopVideoN(n);
    _xc.deviceId = ''; localStorage.removeItem('cameraDeviceId_' + n);
    if (_xc.previewStream && _xc.previewStream !== _xc.stream) { _xc.previewStream.getTracks().forEach(t => t.stop()); } _xc.previewStream = null;
    populateDeviceSelects();
    return;
  }
  try {
    const test = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: sel.value } } });
    test.getTracks().forEach(t => t.stop());
    _xc.deviceId = sel.value;
    localStorage.setItem('cameraDeviceId_' + n, sel.value);
    if (_xc.status) {
      // 既に配信中: 停止してから新しいカメラで再開
      stopVideoN(n);
      await startVideoN(n, sel.value);
    } else if (videoStatus) {
      await startVideoN(n, sel.value);
    }
    populateDeviceSelects();
  } catch (e) {
    if (e.name === 'NotReadableError' || e.name === 'OverconstrainedError') {
      outputChatMsg('このカメラは同時に使用できません: ' + (sel.options[sel.selectedIndex]?.textContent || ''), 'red');
    } else {
      outputChatMsg('カメラ' + n + 'の取得に失敗: ' + e.name, 'red');
    }
    sel.value = _xc.deviceId || '';
  }
}

async function switchVideoDevice(deviceId) {
  let newStream;
  try {
    newStream = await getDeviceStream({ video: { deviceId: { exact: deviceId }, ...QUALITY_CONSTRAINTS[streamQualityLevel] } });
  } catch (e) {
    outputChatMsg('カメラの切り替えに失敗しました: ' + e.name, 'red');
    return;
  }
  const newTrack = newStream.getVideoTracks()[0];
  if (!newTrack) { newStream.getTracks().forEach(t => t.stop()); return; }

  // RTCPeerConnectionのトラックを差し替え（接続を切らずに切り替え）
  mapPeer.forEach(value => {
    if (!value.get('onVideo')) return;
    value.get('rtc').getSenders().forEach(sender => {
      if (sender.track && sender.track.id === value.get('idOldVideo')) {
        sender.replaceTrack(newTrack);
        value.set('oldVideo', newTrack);
        value.set('idOldVideo', newTrack.id);
      }
    });
  });

  // 古いローカルビデオトラックを停止
  if (localStream) {
    localStream.getVideoTracks().forEach(t => { localStream.removeTrack(t); t.stop(); });
    localStream.addTrack(newTrack);
  }

  // ローカル表示を更新
  [myToken, myToken + 'Re', myToken + 'Inv', myToken + 'IR'].forEach(key => {
    if (videoArray[key]) { videoArray[key].srcObject = newStream; videoArray[key].style.background = ''; }
  });

  // 設定パネルのプレビューも更新
  const settingPreviewEl = document.getElementById('settingPreview');
  if (settingPreviewEl && settingPreviewEl.style.display !== 'none') settingPreviewEl.srcObject = newStream;

  videoStatus = { deviceId: { exact: deviceId }, ...QUALITY_CONSTRAINTS[streamQualityLevel] };
}

function onMicDeviceSelect(sel) {
  if (!sel.value) return;
  micDeviceId = sel.value;
  micDeviceLabel = sel.options[sel.selectedIndex]?.textContent || '';
  localStorage.setItem('micDeviceId', micDeviceId);
  localStorage.setItem('micDeviceLabel', micDeviceLabel);
}

async function changeStreamQuality(level) {
  streamQualityLevel = level;
  localStorage.setItem('streamQualityLevel', level);
  if (!videoStatus || !localStream) return;

  const currentDeviceId = localStream.getVideoTracks()[0]?.getSettings().deviceId;

  localStream.getVideoTracks().forEach(t => { localStream.removeTrack(t); t.stop(); });

  const videoConstraints = currentDeviceId
    ? { deviceId: { exact: currentDeviceId }, ...QUALITY_CONSTRAINTS[level] }
    : QUALITY_CONSTRAINTS[level];
  let newStream;
  try {
    newStream = await getDeviceStream({ video: videoConstraints });
  } catch (e) {
    outputChatMsg('画質の切り替えに失敗しました: ' + e.name, 'red');
    return;
  }
  const newTrack = newStream.getVideoTracks()[0];
  if (!newTrack) { newStream.getTracks().forEach(t => t.stop()); return; }

  mapPeer.forEach(value => {
    value.get('rtc').getSenders().forEach(sender => {
      if (sender.track && sender.track.kind === 'video') {
        sender.replaceTrack(newTrack);
        value.set('oldVideo', newTrack);
        value.set('idOldVideo', newTrack.id);
      }
    });
  });

  localStream.addTrack(newTrack);

  [myToken, myToken + 'Re', myToken + 'Inv', myToken + 'IR'].forEach(key => {
    if (videoArray[key]) { videoArray[key].srcObject = newStream; videoArray[key].style.background = ''; }
  });

  const settingPreviewEl = document.getElementById('settingPreview');
  if (settingPreviewEl && settingPreviewEl.style.display !== 'none') settingPreviewEl.srcObject = newStream;

  videoStatus = { deviceId: { exact: currentDeviceId }, ...QUALITY_CONSTRAINTS[level] };
  socket.emit("mediaButton", { type: 'streamQuality', quality: level });
  setTimeout(updateStreamStatus, 500);
}

function changeReceiverQuality(value) {
  receiverQualityLevel = value;
  localStorage.setItem('receiverQuality', value);
  mapPeer.forEach(function(peer) {
    const rtc = peer.get('rtc');
    if (isDataChannelOpen(rtc)) {
      rtc.datachannel.send(JSON.stringify({ type: 'setReceiverQuality', quality: value }));
    }
  });
}

function requestReceiverQuality(fromToken) {
  const peer = mapPeer.get(fromToken);
  if (peer && isDataChannelOpen(peer.get('rtc'))) {
    peer.get('rtc').datachannel.send(JSON.stringify({ type: 'setReceiverQuality', quality: receiverQualityLevel }));
  }
}

//動画配信ボタンにフォーカス入ってる時のエンターキーを無効
document.getElementById('startVideo').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    outputChatMsg("配信ボタン選択時のenterは無効です。", "red");
    return false;
  }
}, { passive: true });

//音声配信ボタンにフォーカス入ってる時のエンターキーを無効
document.getElementById('startAudio').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    outputChatMsg("配信ボタン選択時のenterは無効です。", "red");
    return false;
  }
}, { passive: true });

