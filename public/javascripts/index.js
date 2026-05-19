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
let bridge0, bridge1, bridge2, pole;
const bridgeDepthMaps = [];
let poleDepthMap = null;
let entranceIs2F = false;
let daikokubasira;

let outerSpace;
let mozinoheya;
let star1;
let star2;
let mugenIriguchi;
let mugenRoom;
let gateTex;
let mugenGateRooms = [null, null, null, null];
let mugenGateSprites = [];
let _mugenGateBeingEntered = -1;
let _inUserRoom = false;
let objMap = {};
const _directLinkRoom = new URLSearchParams(location.search).get('room');

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
const KEY_WALK_FRAME_TICKS = 1;   // ~60fps で約60Hz のウォークサイクル（毎フレーム切り替え）
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
let videoTransparentDefault = localStorage.getItem("videoTransparentDefault") === "true";
let videoTransparentOpacity = parseFloat(localStorage.getItem("videoTransparentOpacity") || "0.5");
let _videoTransparentActive = videoTransparentDefault;
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
    toSpot: "star1EntrySpot"
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
    room: "星1",
    area: { x1: 311, x2: 348, y1: 220, y2: 250 },
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

// DB部屋画像関連
let dbRoomImages = [];
const dbImageSprites = [];
let _dbImageZIndexTicker = null;

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
let _prevRoomSpot = '';
const _hiddenWarpIds = new Set();
let dbScaleZones = [];
let _scaleZoneGfx = null;
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
        goSelfToRoomSpot(_prevRoomSpot || 'entranceMainSpot');
        return true;
      }
      if (wz.target_room_id) {
        const sysSpot = { 'エントランス': 'entranceMainSpot', '草原': 'entranceCloud1', 'うちゅー': 'outerSpaceMainSpot', '星1': 'star1EntrySpot', 'むげんのいりぐち': 'mugenEntrySpot', 'むげん': 'mugenMainSpot' };
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
  clearWarpZones();
  try {
    const res = await fetch('/api/rooms/' + encodeURIComponent(roomId) + '/warps');
    if (!res.ok) return;
    dbWarpZones = await res.json();
    drawWarpZones();
  } catch (_e) {}
}

function drawWarpZones() {
  if (!warpZoneGfx) {
    warpZoneGfx = new PIXI.Graphics();
    warpZoneGfx.zIndex = 999;
  }
  warpZoneGfx.clear();
  if (room && room.container) room.container.addChild(warpZoneGfx);
  dbWarpZones.forEach(wz => {
    if (_hiddenWarpIds.has(wz.id)) return;
    // back=黄緑、接続済み=青白、未接続=オレンジ
    const color = wz.warp_type === 'back' ? 0x88ff44 : (wz.target_room_id ? 0x00ccff : 0xff8800);
    warpZoneGfx.lineStyle(2, color, 0.8);
    warpZoneGfx.beginFill(color, wz.visual_opacity ?? 0.2);
    if (wz.shape === 'circle' || wz.shape === 'ellipse') {
      const rw = wz.width / 2;
      const rh = (wz.height ?? wz.width) / 2;
      warpZoneGfx.drawEllipse(wz.x + rw, wz.y + rh, rw, rh);
    } else {
      warpZoneGfx.drawRect(wz.x, wz.y, wz.width, wz.height ?? wz.width);
    }
    warpZoneGfx.endFill();
  });
}

function clearWarpZones() {
  if (warpZoneGfx) {
    if (warpZoneGfx.parent) warpZoneGfx.parent.removeChild(warpZoneGfx);
    warpZoneGfx.clear();
  }
  dbWarpZones = [];
  _hiddenWarpIds.clear();
}

async function loadDbScaleZones(roomId) {
  clearScaleZones();
  try {
    const [zonesRes, roomRes] = await Promise.all([
      fetch('/api/rooms/' + encodeURIComponent(roomId) + '/scale-zones'),
      fetch('/api/rooms/' + encodeURIComponent(roomId)),
    ]);
    if (zonesRes.ok) dbScaleZones = await zonesRes.json();
    if (roomRes.ok) {
      const rd = await roomRes.json();
      _roomAvatarScale = (rd.avatar_scale != null) ? rd.avatar_scale : 1.0;
    }
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
    row.style.cssText = 'display:flex;gap:4px;align-items:center;margin:3px 0;font-size:11px;padding:3px;border:1px solid #442266;border-radius:3px;';

    const info = document.createElement('span');
    info.style.cssText = 'color:#cc88ff;white-space:nowrap;';
    info.textContent = `#${z.id} (${Math.round(z.x)},${Math.round(z.y)}) ${Math.round(z.width)}×${Math.round(z.height)}`;
    row.appendChild(info);

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

    const syncScale = (s) => {
      z.scale = s;
      scaleSlider.value = s;
      scaleNum.value = s;
    };
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
    row.appendChild(scaleSlider);
    row.appendChild(scaleNum);

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.style.cssText = 'color:#fff;border:none;cursor:pointer;padding:1px 5px;font-size:11px;background:#600;';
    delBtn.addEventListener('click', async () => {
      await fetch('/api/rooms/' + encodeURIComponent(_scaleZoneEditRoomId) + '/scale-zones/' + z.id, {
        method: 'DELETE',
        headers: { 'X-Edit-Password': warpEditPassword },
      });
      await loadDbScaleZones(_scaleZoneEditRoomId);
      updateScaleZoneList();
    });
    row.appendChild(delBtn);

    list.appendChild(row);
  });
}

// むげんのGATE
const MUGEN_GATE_TINTS = [0x444444, 0xaabbff, 0xffffff, 0xff2020]; // 上/下/左/右（リンク済み）
const MUGEN_GATE_TINT_EMPTY = 0x888888;

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
  if (gateIndex === 0) {
    outputChatMsg('この部屋の編集には特別な権限が必要です。', 'blue');
    return;
  }
  if (mugenGateRooms[gateIndex]) {
    _mugenGateBeingEntered = gateIndex;
    goSelfToRoomSpot('userRoom:' + mugenGateRooms[gateIndex]);
  } else {
    showGateCreateDialog(gateIndex);
  }
}

async function showGateCreateDialog(gateIndex, prevRoom) {
  _newRoomGateIndex = gateIndex;
  _prevRoomName = prevRoom !== undefined ? prevRoom : (room ? room.name : 'むげん');
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

function _roomToSpot(roomName) {
  const m = { 'エントランス': 'entranceMainSpot', '草原': 'entranceCloud1', 'うちゅー': 'outerSpaceMainSpot', '星1': 'star1EntrySpot', 'むげんのいりぐち': 'mugenEntrySpot', 'むげん': 'mugenMainSpot' };
  return m[roomName] || ('userRoom:' + roomName);
}

async function _warpPortalCreateRoom() {
  if (document.getElementById('roomEditPanel').style.display !== 'none') return;
  try {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', creatorToken: myToken }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || '部屋の作成に失敗しました'); return; }
    _isNewRoomMode = true;
    _pendingOpenEditPanel = true;
    _pendingRoomName = '';
    _prevRoomSpot = _roomToSpot(room.name);
    goSelfToRoomSpot('userRoom:' + data.id);
  } catch (_e) {
    alert('通信エラーが発生しました');
  }
}

// DB部屋画像
async function loadDbImages(roomId) {
  clearDbImages();
  try {
    const res = await fetch('/api/rooms/' + encodeURIComponent(roomId) + '/images');
    if (!res.ok) return;
    dbRoomImages = await res.json();
    drawDbImages();
  } catch (_e) {}
}

function drawDbImages() {
  if (!room) return;
  dbRoomImages.forEach(img => {
    const sprite = PIXI.Sprite.from(img.url);
    sprite.eventMode = 'none';
    if (img.x != null) sprite.x = img.x;
    if (img.y != null) sprite.y = img.y;
    const _setSize = () => {
      if (img.width) sprite.width = img.width;
      if (img.height) sprite.height = img.height;
    };
    if (sprite.texture.baseTexture.valid) {
      _setSize();
    } else {
      sprite.texture.baseTexture.once('loaded', _setSize);
    }
    if (img.type === 'background') {
      sprite.zIndex = -100;
    } else if (img.type === 'object') {
      sprite.zIndex = sprite.y + sprite.height;
    } else {
      sprite.zIndex = 0;
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
  };
  app.ticker.add(_dbImageZIndexTicker);
}

function clearDbImages() {
  if (_dbImageZIndexTicker) { app.ticker.remove(_dbImageZIndexTicker); _dbImageZIndexTicker = null; }
  dbImageSprites.forEach(s => { if (s.parent) s.parent.removeChild(s); });
  dbImageSprites.length = 0;
  dbRoomImages = [];
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
  max:    { width: { ideal: 1280 }, height: { ideal: 720 },  frameRate: { ideal: 30 } },
  high:   { width: { ideal: 640 },  height: { ideal: 480 },  frameRate: { ideal: 30 } },
  normal: { width: { ideal: 320 },  height: { ideal: 240 },  frameRate: { ideal: 15 } },
  low:    { width: { ideal: 160 },  height: { ideal: 120 },  frameRate: { ideal: 10 } },
};
const QUALITY_BITRATE = { max: undefined, high: 1000000, normal: 400000, low: 100000 };
const QUALITY_ORDER = ['low', 'normal', 'high', 'max'];
let streamQualityLevel = localStorage.getItem('streamQualityLevel') || 'max';
let cameraSelectMode = localStorage.getItem('cameraSelectMode') || 'always';
let cameraDeviceId = localStorage.getItem('cameraDeviceId') || '';
let cameraDeviceLabel = localStorage.getItem('cameraDeviceLabel') || '';
let micSelectMode = localStorage.getItem('micSelectMode') || 'always';
let micDeviceId = localStorage.getItem('micDeviceId') || '';
let micDeviceLabel = localStorage.getItem('micDeviceLabel') || '';
const receiverQualitySelect = {};
const senderQuality = {};

let localStream = null;//自分のとこのメディア情報
let localVideoTrack;//自分のとこのメディア情報
let localAudioTrack;//自分のとこのメディア情報

let videoStatus = false;
let audioStatus = false;
let roomStream;

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

PIXI.Assets.load(['img/allgraphics.png', 'img/roomAtlas.png', 'img/objectAtlas.png', 'img/objects/GATE.png']).then((assets) => {
  setUp(assets);
});
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
    console.log('objectAtlasLayout:', JSON.stringify(objectAtlasLayout));

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
    // エラー時もゲーム続行
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
  let poleAtlasLayout = null;
  if (objectAtlasLayout['pole']) {
    poleAtlasLayout = objectAtlasLayout['pole'];
    pole = new PIXI.Sprite(new PIXI.Texture(objAtlasTex, new PIXI.Rectangle(poleAtlasLayout.x, poleAtlasLayout.y, poleAtlasLayout.w, poleAtlasLayout.h)));
  }
  if (bridgeLayoutEntries.length > 0 || poleAtlasLayout) {
    const img = new Image();
    img.src = 'img/objectAtlas.png';
    img.onload = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = img.width;
      offscreen.height = img.height;
      const ctx = offscreen.getContext('2d');
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
      if (poleAtlasLayout) {
        const bl = poleAtlasLayout;
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
        poleDepthMap = map;
        console.log('poleDepthMap 構築完了');
      }
      console.log('bridgeDepthMaps 構築完了:', bridgeDepthMaps.length, '枚');
    };
  }
  //うちゅー画面
  outerSpace = new PIXI.Sprite(new PIXI.Texture(baseTex, new PIXI.Rectangle(660, 480, 660, 480)));
  //星1
  star1 = new PIXI.Graphics();
  //むげんのいりぐち・むげん
  mugenIriguchi = new PIXI.Graphics();
  mugenRoom = new PIXI.Graphics();
  gateTex = assets['img/objects/GATE.png'];

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
      coordText.text = `avaX: ${AX}\navaY: ${AY}`;
    }
    loginMX = event.global.x;
    loginMY = event.global.y;
    if (showCoord && 0 <= loginMX && loginMX <= 660 && 0 <= loginMY && loginMY <= 460) {
      mouseText.text = `mouX: ${loginMX}\nmouY: ${loginMY}`;
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
  set text(val) { this._text.text = val; this._redraw(); }

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

    // テキスト色（override あればそちら、なければアバターカラー）
    this._text.style.fill = this._textColorOverride !== null ? this._textColorOverride : col;

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
    const _bx = 50 + this._offsetX;
    const _by = -(this._spriteHeight + bottomGap + h + bottomExt) + this._offsetY;
    this.position.set(_bx, _by);

    const gA = this._isLog ? [0.22, 0.45, 0.80] : [0.04, 0.10, 0.30];

    if (bangCount > 0) {
      const spikyPts = buildSpikyPts(spikeH, totalSpikes);
      // スパイク時: グロー → 黒塗り → ボーダーの順（内側へのグロー染みを黒で消す）
      this._bg.lineStyle(10, col, gA[0]);
      this._bg.drawPolygon(buildSpikyPts(spikeH + 6, totalSpikes));
      this._bg.lineStyle(0);
      this._bg.beginFill(0x000000, 1);
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
      this._bg.lineStyle(10, col, gA[0]);
      this._bg.drawRect(-4, -4, w + 8, h + 8);
      this._bg.lineStyle(5, col, gA[1]);
      this._bg.drawRect(-2, -2, w + 4, h + 4);
      this._bg.lineStyle(2, col, gA[2]);
      this._bg.drawRect(0, 0, w, h);
      // 黒背景でグローの内側染みを消す
      this._bg.lineStyle(0);
      this._bg.beginFill(0x000000, 1);
      this._bg.drawRect(0, 0, w, h);
      this._bg.endFill();
      // 三角の黒背景
      this._bg.beginFill(0x000000, 1);
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

  // 自分のアバターの吹き出しにのみ呼ぶ。ドラッグで位置変更できるようにする
  setupDrag() {
    this._offsetX = Math.max(-200, Math.min(200, parseFloat(localStorage.getItem("bubbleOffsetX")) || 0));
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
        this._offsetX = Math.max(-200, Math.min(200, startOX + (ev.global.x - startPX)));
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
  "星1":         { gravity: false, se: "outerSpace", overlayChatColor: "white" },
  "むげんのいりぐち": { gravity: false, se: "outerSpace", overlayChatColor: "black" },
  "むげん":           { gravity: false, se: "outerSpace", overlayChatColor: "black" },
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
      } else if (random) {
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
    } else if (room.name === "むげん") {
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
    this.pendingRidingData = null;
    if (!ridingData) return;

    const ridingObj = avaP[ridingData.objectName] || objMap[ridingData.objectName];
    if (!ridingObj) return;

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
    gsap.delayedCall(0.1, () => {
      this.container.removeChild(this.avaC);
      this.avaC = ava1;
      this.container.addChild(this.avaC);
      if (sk1 !== undefined) { this.currentAvaStateKey = sk1; this.redrawOekakiForState(); }
    });
    gsap.delayedCall(0.2, () => {
      this.container.removeChild(this.avaC);
      this.avaC = ava2;
      this.container.addChild(this.avaC);
      if (sk2 !== undefined) { this.currentAvaStateKey = sk2; this.redrawOekakiForState(); }
    });
    gsap.delayedCall(0.3, () => {
      this.container.removeChild(this.avaC);
      this.avaC = ava1;
      this.container.addChild(this.avaC);
      if (sk1 !== undefined) { this.currentAvaStateKey = sk1; this.redrawOekakiForState(); }
    });
    gsap.delayedCall(0.4, () => {
      this.container.removeChild(this.avaC);
      this.avaC = ava0;
      this.container.addChild(this.avaC);
      if (sk0 !== undefined) { this.currentAvaStateKey = sk0; this.redrawOekakiForState(); }
    });
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

    if (this.ridingObject) {
      this.stopRiding();
    }

    // 物に乗る判定
    const standingOn = this.isStandingOnObject(this);
    let finalX = thisAX;
    let finalY = thisAY;

    if (standingOn && this.isMovingObject(standingOn)) {

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
    gsap.to(this.container, {
      duration: 0.4,
      x: finalX,
      y: finalY,
      onComplete: () => {
        this.isMoving = false;

        // ⭐ 移動完了後に乗車処理を実行
        if (standingOn && this.isMovingObject(standingOn)) {
          this.startRiding(standingOn);

          // 移動完了後の正確な相対座標を再計算
          const objectContainer = standingOn.container || standingOn;
          const objectX = objectContainer.x || 0;
          const objectY = objectContainer.y || 0;
          this.ridingOffset.x = this.container.x - objectX;
          this.ridingOffset.y = this.container.y - objectY;

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
  isStandingOnObject(ava) {
    const roomContainer = room.container;
    if (!roomContainer) return null;

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
        (room.name === "エントランス" && entranceIs2F && tags.includes("standable2F")) ||
        (room.name === "エントランス" && !entranceIs2F && tags.includes("standable1F"));

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
      const standingOn = this.isStandingOnObject(this);
      if (!standingOn || standingOn !== this.ridingObject) {
        // 乗り物から外れた → 落下開始
        this.stopRiding();
        this.sendTransformData("落下開始");
      }
      return;
    }

    // 地面チェック
    const standingOn = this.isStandingOnObject(this);
    if (standingOn) {
      const wasFlying = this.dropVelocity > 1;
      this.dropVelocity = 1;

      // 動く乗り物に乗った（startRiding内でsendTransformDataを呼ぶ）
      if (this.isMovingObject(standingOn)) {
        this.startRiding(standingOn);
      } else if (wasFlying) {
        // 静止した地面に着地した時だけ送信
        this.sendTransformData("着地");
      }
    } else {
      // 空中 → 落下
      if (this.dropVelocity <= 150) {
        this.dropVelocity = Math.round((this.dropVelocity * 1.08) * 100) / 100;
      }
      const deltaY = (this.dropVelocity * deltaTime) / 1000;
      this.container.y = Math.round((this.container.y + deltaY) * 100) / 100;
      AY = this.container.y;

      // 他クライアントにも落下の様子を見せるため50ms間隔で送信
      const now = performance.now();
      if (now - this.lastFallSendTime > 50) {
        this.lastFallSendTime = now;
        this.sendTransformData("落下中");
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

    const sendData = {
      DIR: DIR,
      AX: Math.round(this.container.x * 100) / 100,
      AY: Math.round(this.container.y * 100) / 100,
      reason: reason,
      isFalling: this.dropVelocity > 1 && !this.ridingObject,
      fromCloud: reason === "雲からの降車",
      is2F: entranceIs2F,
    };

    if (this.ridingObject) {
      sendData.ridingData = {
        objectName: this.ridingObject.token || this.ridingObject.name,
        offsetX: Math.round(this.ridingOffset.x * 100) / 100,
        offsetY: Math.round(this.ridingOffset.y * 100) / 100,
      };
    } else {
      sendData.ridingData = null;
    }

    socket.emit("transformData", sendData);
  }

  stopRiding() {
    if (!this.ridingObject) return;
    this.ridingObject = null;
    this.ridingOffset = { x: 0, y: 0 };
    if (this.token === myToken) {
      AX = this.container.x;
      AY = this.container.y;
    }
  }

  // 乗り物かどうかの判定（タグ "moving" または アバター）
  isMovingObject(targetObject) {
    if (targetObject.token) return true; // アバター同士
    const tags = targetObject.tags || [];
    return tags.includes("moving");
  }

  avaLoop() {
    let zBase = this.ridingObject
      ? (this.ridingObject.container || this.ridingObject).y
      : this.container.y;

    if (room && room.name === "エントランス") {
      const col = Math.round(this.container.x);
      const avatarY = this.container.y;

      if (!this.is2F) {
        // 1階: bridge0/1/2(150+)は常に上。poleはピクセル判定
        let z = 50;
        if (poleDepthMap) {
          const c = Math.max(0, Math.min(poleDepthMap.length - 1, col));
          // poleの下端がavatarYより上(<=avatarY)ならアバターがpoleの前
          if (poleDepthMap[c] >= 0 && poleDepthMap[c] <= avatarY) {
            z = 130; // poleの前(>80)、bridge0の後ろ(<150)
          }
        }
        zBase = z;
      } else {
        // 2階: bridge0(150)は常に下、bridge2(350)は常に上
        // pole(80)は常に下(z>=200>80)。bridge1(250)はピクセル判定
        let z = 300;
        if (bridgeDepthMaps[1]) {
          const map = bridgeDepthMaps[1];
          const c = Math.max(0, Math.min(map.length - 1, col));
          if (map[c] >= 0 && map[c] > avatarY) z = 200;
        }
        zBase = z;
      }
    }

    if (this.lastZIndex !== zBase) {
      this.container.zIndex = zBase;
      this.lastZIndex = zBase;
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
    if (avatar.ridingObject) avatar.stopRiding();

    if (data.isFalling || data.forceCorrection) {
      // 落下中 or 強制修正 → gsap なしで直接セット
      avatar.container.position.set(data.AX, data.AY);
    } else {
      // 歩き移動など → 距離が大きければ滑らか補間
      const dx = data.AX - avatar.container.x;
      const dy = data.AY - avatar.container.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 50) {
        avatar.container.position.set(data.AX, data.AY);
      } else if (dist > 5) {
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
        if (pole) {
          pole = GameObject.getOrCreateObject(pole, "pole");
          pole.container.x = 0;
          pole.container.y = 0;
          pole.container.zIndex = 80;
          pole.container.eventMode = 'none';
          this.container.addChild(pole.container);
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
        document.getElementById('roomEditMenu').style.display = _inUserRoom ? '' : 'none';
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
      cloud.container.x = (this._cloudTotalDistance % (this.cloudSync.screenWidth + this.cloudSync.cloudWidth)) - this.cloudSync.cloudWidth;
      return;
    }

    // 初回のみ: whileループで正確に累積距離を計算（全クライアント共通の決定論的計算）
    this._cloudTotalDistance = this._computeCloudTotalDistance();
    const loopWidth = this.cloudSync.screenWidth + this.cloudSync.cloudWidth;
    cloud.container.x = (this._cloudTotalDistance % loopWidth) - this.cloudSync.cloudWidth;
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
    const newX = (this._cloudTotalDistance % loopWidth) - this.cloudSync.cloudWidth;

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
    const now = Date.now();
    if (now - lastKeyFrameSwitch >= KEY_FRAME_SWITCH_COOLDOWN) {
      lastKeyFrameSwitch = now;
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
function login() {
  tickerListeners.forEach(fn => app.ticker.remove(fn));
  tickerListeners.length = 0;
  //もしカメラやマイクをonにしてたら切る
  if (videoStatus) {
    stopVideo();
  }
  if (audioStatus) {
    stopAudio();
  }

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
    room = Room.getOrCreateRoom(entranceImg, "エントランス", ["standable"]);
    if (!_directLinkRoom) room.displayRoom();

    socket.emit("joineRoom", {//エントランスに入る
      userName: avaP[myToken].name,//ユーザーネーム
      avatarAspect: avaP[myToken].avatarAspect,
      avatarColor: avaP[myToken].avatarColor,
      avatarAlpha: avaP[myToken].avatarAlpha,
      drawHistory: avaP[myToken].drawHistory || [],
      toRoom: "エントランス",
      toSpot: "entranceMainSpot",
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
          wa_i.style.backgroundColor = "red";
        }
      }
    }, { passive: true });

    window.addEventListener("blur", () => {//ウィンドウが非アクティブになったとき
      if (!clickedWa_iButtun) {//わ～いボタンがオンだったらidDownCtrlを効かないようにしとく
        isDownCtrl = false;
        wa_i.style.backgroundColor = "red";
      }
      keysPressed.clear(); // 矢印キー移動のリセット
    }, { passive: true });

    avatarOekakiToken = false;
  }
}

//自分自身の部屋移動
//不要な情報を消し、サーバーに移動することを伝える。
function goSelfToRoomSpot(toSpot, train) {
  //配信関係の接続を切る
  stopAllConnection();
  if (videoStatus) {
    stopVideo();
  }
  if (audioStatus) {
    stopAudio();
  }
  if (room.container.parent) app.stage.removeChild(room.container);//移動前の部屋を消す
  removeAllSigns();

  // 既存の雲システムを停止
  if (room && room.cloudSyncStarted) {
    room.cloudSyncStarted = false;
  }

  _inUserRoom = false;
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
    case "star1EntrySpot":
      room = Room.getOrCreateRoom(star1, "星1", ["standable"]);
      break;
    case "mugenEntrySpot":
      room = Room.getOrCreateRoom(mugenIriguchi, "むげんのいりぐち", ["standable"]);
      break;
    case "mugenMainSpot":
      room = Room.getOrCreateRoom(mugenRoom, "むげん", ["standable"]);
      break;
    default:
      if (toSpot && toSpot.startsWith('userRoom:')) {
        const targetRoomId = toSpot.slice(9);
        const sysRoomSprites = { 'エントランス': entranceImg, '草原': entrance, 'うちゅー': outerSpace, '星1': star1, 'むげんのいりぐち': mugenIriguchi, 'むげん': mugenRoom };
        if (Object.prototype.hasOwnProperty.call(sysRoomSprites, targetRoomId)) {
          room = Room.getOrCreateRoom(sysRoomSprites[targetRoomId], targetRoomId, ['standable']);
        } else {
          if (!(objMap[targetRoomId] instanceof Room)) {
            const bg = new PIXI.Graphics();
            bg.beginFill(parseColorCode(localStorage.getItem('colorCode')) || 0xffffff);
            bg.drawRect(0, 0, 660, 460);
            bg.endFill();
            const floorGfx = new PIXI.Graphics();
            floorGfx.beginFill(0x223344, 0.01);
            floorGfx.drawRect(0, 200, 660, 260);
            floorGfx.endFill();
            floorGfx.hitArea = new PIXI.Polygon([0, 200, 660, 200, 660, 460, 0, 460]);
            const floorObj = { container: floorGfx, tags: ['standable'], name: targetRoomId + '_floor' };
            objMap[targetRoomId + '_floor'] = floorObj;
            const r = new Room(bg, targetRoomId, []);
            r.container.addChild(floorGfx);
            r.roomPolygons.push(floorObj);
            objMap[targetRoomId] = r;
          }
          _inUserRoom = true;
          room = objMap[targetRoomId];
        }
      }
      break;
  }
  if (!room) { _inUserRoom = false; room = Room.getOrCreateRoom(entranceImg, "エントランス", ["standable"]); }
  try {
    room.displayRoom();
  } catch (err) {
    console.error("[goSelfToRoomSpot] displayRoom crash:", err);
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
  const wz = ov.warpData;
  const hs = 12;
  const h = wz.height ?? wz.width;
  ov.hitGfx.clear();
  ov.hitGfx.lineStyle(2, 0x00ffcc, 0.9);
  ov.hitGfx.beginFill(0x00ffcc, 0.05);
  if (wz.shape === 'circle' || wz.shape === 'ellipse') {
    ov.hitGfx.drawEllipse(wz.x + wz.width / 2, wz.y + h / 2, wz.width / 2, h / 2);
  } else {
    ov.hitGfx.drawRect(wz.x, wz.y, wz.width, h);
  }
  ov.hitGfx.endFill();
  ov.handleGfx.clear();
  ov.handleGfx.beginFill(0x00ffcc);
  ov.handleGfx.drawRect(wz.x + wz.width - hs, wz.y + h - hs, hs, hs);
  ov.handleGfx.endFill();
}

function _enableWarpEditMode() {
  if (!room) return;
  _disableWarpEditMode();
  _warpDragMode = true;
  app.stage.eventMode = 'static';
  dbWarpZones.forEach((wz, idx) => {
    if (wz.warp_type === 'back') return;
    const hitGfx = new PIXI.Graphics();
    hitGfx.zIndex = 1002;
    hitGfx.eventMode = 'static';
    hitGfx.cursor = 'grab';
    room.container.addChild(hitGfx);
    const handleGfx = new PIXI.Graphics();
    handleGfx.zIndex = 1003;
    handleGfx.eventMode = 'static';
    handleGfx.cursor = 'se-resize';
    room.container.addChild(handleGfx);
    const ov = { warpData: wz, hitGfx, handleGfx };
    _warpEditOverlays.push(ov);
    _redrawWarpEditOverlay(ov);
    const ovIdx = _warpEditOverlays.length - 1;
    hitGfx.on('pointerdown', e => {
      if (!_warpDragMode || _warpDragging) return;
      const p = room.container.toLocal(e.global);
      const hs = 12;
      const h = wz.height ?? wz.width;
      if (p.x >= wz.x + wz.width - hs && p.y >= wz.y + h - hs) return;
      e.stopPropagation();
      _warpDragging = { idx: ovIdx, type: 'move', startX: p.x, startY: p.y, origX: wz.x, origY: wz.y, origW: wz.width, origH: h };
      hitGfx.cursor = 'grabbing';
    });
    handleGfx.on('pointerdown', e => {
      if (!_warpDragMode || _warpDragging) return;
      e.stopPropagation();
      const p = room.container.toLocal(e.global);
      const h = wz.height ?? wz.width;
      _warpDragging = { idx: ovIdx, type: 'resize', startX: p.x, startY: p.y, origX: wz.x, origY: wz.y, origW: wz.width, origH: h };
    });
  });
  app.stage.on('pointermove', _onWarpDragMove);
  app.stage.on('pointerup', _onWarpDragEnd);
  app.stage.on('pointerupoutside', _onWarpDragEnd);
}

function _disableWarpEditMode() {
  _warpDragMode = false;
  _warpDragging = null;
  if (typeof app !== 'undefined') {
    app.stage.off('pointermove', _onWarpDragMove);
    app.stage.off('pointerup', _onWarpDragEnd);
    app.stage.off('pointerupoutside', _onWarpDragEnd);
  }
  _warpEditOverlays.forEach(ov => {
    if (ov.hitGfx.parent) ov.hitGfx.parent.removeChild(ov.hitGfx);
    if (ov.handleGfx.parent) ov.handleGfx.parent.removeChild(ov.handleGfx);
    ov.hitGfx.destroy();
    ov.handleGfx.destroy();
  });
  _warpEditOverlays.length = 0;
}

function _onWarpDragMove(e) {
  if (!_warpDragging || !room) return;
  const ov = _warpEditOverlays[_warpDragging.idx];
  if (!ov) return;
  const p = room.container.toLocal(e.global);
  const dx = p.x - _warpDragging.startX, dy = p.y - _warpDragging.startY;
  if (_warpDragging.type === 'move') {
    ov.warpData.x = _warpDragging.origX + dx;
    ov.warpData.y = _warpDragging.origY + dy;
  } else {
    ov.warpData.width = Math.min(250, Math.max(5, _warpDragging.origW + dx));
    ov.warpData.height = Math.min(250, Math.max(5, _warpDragging.origH + dy));
  }
  _redrawWarpEditOverlay(ov);
  drawWarpZones();
}

async function _onWarpDragEnd() {
  if (!_warpDragging) return;
  const ov = _warpEditOverlays[_warpDragging.idx];
  _warpDragging = null;
  if (!ov) return;
  ov.hitGfx.cursor = 'grab';
  const wz = ov.warpData;
  const x = Math.round(wz.x), y = Math.round(wz.y);
  const w = Math.round(wz.width), h = Math.round(wz.height ?? wz.width);
  wz.x = x; wz.y = y; wz.width = w; wz.height = h;
  _redrawWarpEditOverlay(ov);
  drawWarpZones();
  const res = await fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId) + '/warps/' + wz.id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword },
    body: JSON.stringify({ x, y, width: w, height: h }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || '保存失敗');
  }
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
  await loadDbWarpZones(warpEditRoomId);
  updateWarpList();
  stopWarpPlaceMode();
  document.getElementById('warpPlaceStopBtn').style.display = 'none';
  document.getElementById('warpPlaceBtn').style.display = '';
  _enableWarpEditMode();
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
  await loadDbScaleZones(_scaleZoneEditRoomId);
  updateScaleZoneList();
}

function updateWarpList() {
  const list = document.getElementById('warpList');
  if (!list) return;
  list.innerHTML = '';
  const errEl = document.getElementById('warpDelErr');
  if (errEl) errEl.textContent = '';

  dbWarpZones.forEach(wz => {
    const isBack = wz.warp_type === 'back';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:4px;align-items:center;margin:3px 0;font-size:11px;flex-wrap:wrap;padding:3px;border:1px solid ' + (isBack ? '#88ff44' : '#223366') + ';border-radius:3px;';

    // 形状セレクタ
    const shapeSel = document.createElement('select');
    shapeSel.style.cssText = 'background:#0d0d1a;color:#fff;border:1px solid #4a90d9;font-size:10px;';
    [['rect','矩形'],['circle','円'],['ellipse','楕円']].forEach(([v, l]) => {
      const o = document.createElement('option');
      o.value = v; o.textContent = l;
      if (v === wz.shape) o.selected = true;
      shapeSel.appendChild(o);
    });
    shapeSel.addEventListener('change', async () => {
      await fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId) + '/warps/' + wz.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword },
        body: JSON.stringify({ shape: shapeSel.value }),
      });
      await loadDbWarpZones(warpEditRoomId);
      updateWarpList();
    });
    row.appendChild(shapeSel);

    // 表示/非表示トグル
    const visBtn = document.createElement('button');
    const isHidden = _hiddenWarpIds.has(wz.id);
    visBtn.textContent = isHidden ? '表示' : '非表示';
    visBtn.style.cssText = 'font-size:10px;padding:1px 5px;cursor:pointer;background:' + (isHidden ? '#333' : '#0d0d1a') + ';color:' + (isHidden ? '#888' : '#fff') + ';border:1px solid #4a90d9;';
    visBtn.addEventListener('click', () => {
      if (_hiddenWarpIds.has(wz.id)) {
        _hiddenWarpIds.delete(wz.id);
        visBtn.textContent = '非表示';
        visBtn.style.background = '#0d0d1a';
        visBtn.style.color = '#fff';
      } else {
        _hiddenWarpIds.add(wz.id);
        visBtn.textContent = '表示';
        visBtn.style.background = '#333';
        visBtn.style.color = '#888';
      }
      drawWarpZones();
    });
    row.appendChild(visBtn);

    // 削除ボタン（back ワープは無効）
    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.style.cssText = 'color:#fff;border:none;cursor:pointer;padding:1px 5px;font-size:11px;background:' + (isBack ? '#444' : '#600') + ';';
    delBtn.disabled = isBack;
    delBtn.title = isBack ? '前の部屋に戻るワープは削除できません' : '削除';
    delBtn.addEventListener('click', async () => {
      if (errEl) errEl.textContent = '';
      const res = await fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId) + '/warps/' + wz.id, {
        method: 'DELETE',
        headers: { 'X-Edit-Password': warpEditPassword },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        if (errEl) { errEl.textContent = d.error || '削除失敗'; }
        return;
      }
      await loadDbWarpZones(warpEditRoomId);
      updateWarpList();
    });
    row.appendChild(delBtn);

    const info = document.createElement('span');
    info.style.cssText = 'color:' + (isBack ? '#88ff44' : '#aaa') + ';flex:1;min-width:60px;';
    info.textContent = (isBack ? '↩戻る ' : '') + `#${wz.id} (${Math.round(wz.x)},${Math.round(wz.y)}) ${Math.round(wz.width)}×${Math.round(wz.height ?? wz.width)}`;
    row.appendChild(info);

    list.appendChild(row);
  });
}

//自分が入室時の処理
socket.on("joineRoom", data => {
  _mugenGateBeingEntered = -1;
  // 再接続成功
  if (isReconnecting) {
    isReconnecting = false;
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
    // 切断中に退室した他ユーザーのアバターを削除してサーバーの現状で再構築
    Object.keys(avaP).forEach(key => {
      if (key !== myToken) {
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

  switch (data.toRoom) {//部屋ごとの独自処理を追加
    case "星1":
      room.f = 200;
      room.colorIndex = 0;
      room.drawStar(430, 450, 200, 0, 90, data.starColors);
      break;
  }
  const keys = Object.keys(data.user);//入室時の全員のソケットＩＤを取得
  keys.forEach(function (value) {//引数valueにtokenを入れて順番に実行
    if (data.toRoom === data.user[value].room) {//部屋とユーザーの部屋が一致してたら
      if (!avaP[value]) {//アバターをまだ作ってなかったら
        //アバター作成
        avaP[value] = new Avatar(data.user[value].userName, value, data.user[value].avatarAspect, data.user[value].avatarColor);
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
        // 自分の入室時はグローバルDIRをサーバー値に同期（重力sendTransformDataが古い値を送らないように）
        if (value === myToken) {
          DIR = data.user[value].DIR || DIR;
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
    loadDbWarpZones(data.toRoom);
    loadDbImages(data.toRoom);
    loadDbScaleZones(data.toRoom);
    runCustomCode(data.toRoom);
    if (data.toRoom === "むげん") loadMugenGates();
  } else {
    clearCustomCode();
  }

  if (_pendingOpenEditPanel && data.toRoom !== 'loginRoom') {
    _pendingOpenEditPanel = false;
    setTimeout(() => _openRoomEditPanelDirect(data.toRoom, ''), 300);
  }

  if (_directLinkRoom && data.fromRoom === "loginRoom") {
    const _dlSysSpot = { 'エントランス': 'entranceMainSpot', '草原': 'entranceCloud1', 'うちゅー': 'outerSpaceMainSpot', '星1': 'star1EntrySpot', 'むげんのいりぐち': 'mugenEntrySpot', 'むげん': 'mugenMainSpot' };
    goSelfToRoomSpot(_dlSysSpot[_directLinkRoom] || ('userRoom:' + _directLinkRoom));
  }

  updateRoomLinkDisplay();
});

socket.on("otherJoined", data => {//自分以外が部屋にログインor入室してきた時
  if (!avaP[data.token]) {//アバターをまだ作ってなければ作る
    avaP[data.token] = new Avatar(data.userName, data.token, data.avatarAspect, data.avatarColor);

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

socket.on("otherLeft", data => {//自分以外が部屋から退室した時
  if (avaP[data.token].abon) return;//アボンされてない場合のみ処理を実行
  if (useLogChime) {//ログチャイムがオンになってたら退室の音を鳴らす
    msgSE[roomSE].out[data.random].play();
  }

  // アバターを部屋から排除
  room.container.removeChild(avaP[data.token].container);
  roomMemberToken = roomMemberToken.filter(token => token !== data.token);//退室した人のtokenをroomMemberTokenから削除

  avaP[data.token].roomIn--;
  usersNumber.textContent = room.container.children.filter(child => child.token).length;//部屋人数の表記を変える
  outputChatMsg(data.announce, false, data.token, true);
  if (avatarOekakiToken === data.token) {
    avatarOekakiToken = false;
    switchDrawing();//部屋用お絵描きに切り替える
  }
  stopConnection(data.token);

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
  objMap[data.room].container.removeChild(avaP[data.token].container);
  roomMemberToken = roomMemberToken.filter(token => token !== data.token);//退室した人のtokenをroomMemberTokenから削除

  outputChatMsg(data.msg, false, data.token, true);//移動時のメッセージ出力
  if (useLogChime) {//ログチャイムがオンになってたら、ログアウトの音を鳴らす
    msgSE[roomSE].logout[data.random].play();
  }

  if (avatarOekakiToken === data.token) {
    avatarOekakiToken = false;
    switchDrawing();//部屋用お絵描きに切り替える
  }
  stopConnection(data.token);
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

//ステージをクリックしたときの移動処理
function stageMove(value) {
  value.eventMode = 'static';
  value.on('pointerdown', e => {
    if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
    if (floorPolyMode) return;
    if (_imgDoodleMode) return;

    const targetX = e.data.getLocalPosition(value).x;
    const targetY = e.data.getLocalPosition(value).y;
    const currentX = avaP[myToken].container.x;
    const currentY = avaP[myToken].container.y;

    if (currentX != targetX || currentY != targetY) {
      MX = targetX;
      MY = targetY;

      // ⭐ 方向計算を確実に実行
      let sin = (MY - currentY) / Math.sqrt(Math.pow(MX - currentX, 2) + Math.pow(MY - currentY, 2));
      DIR = calculateDirection(sin, currentX, MX);

       if (room.name === "草原") {
          meadowBlock();
        }//別の部屋の場合でつき足す!!!!!!!!!!!!
      if (room.name === "エントランス" && entranceIs2F) {
        if (!pointInPolygon(targetX, targetY, ENTRANCE_2F_POLY)) {
          entranceIs2F = false;
          avaP[myToken].is2F = false;
        }
      }

      // 衝突処理...
      if (colPointAll[0] == undefined) {
        AX = targetX;
        AY = targetY;
      } else {
        handleCollision();
      }

      // オブジェクト判定...
      const targetObject = findObjectAtPosition(targetX, targetY);

      if (targetObject && targetObject.isMoving && targetObject.isMoving()) {// 動くオブジェクト上への移動
        const objectContainer = targetObject.container || targetObject;
        const objectX = objectContainer.x || 0;
        const objectY = objectContainer.y || 0;
        const relativeX = AX - objectX;
        const relativeY = AY - objectY
        if (room.name !== "loginRoom" && !isReconnecting) {
          socket.emit("tapMap", {
            DIR: DIR, // ⭐ 確実に方向を送信
            moveType: "relative",
            targetObject: targetObject.name,
            relativeX: relativeX,
            relativeY: relativeY,
            sit: avaP[myToken].sit,
            AX: AX, // ⭐ 追加
            AY: AY  // ⭐ 追加
          });
        }
      } else {
        // 通常移動
        if (room.name !== "loginRoom" && !isReconnecting) {
          socket.emit("tapMap", {
            DIR: DIR, // ⭐ 確実に方向を送信
            moveType: "absolute",
            AX: AX,
            AY: AY,
            sit: avaP[myToken].sit
          });
        }
      }
      avaP[myToken].tappedMove(AX, AY, DIR, avaP[myToken].sit);

      colPointAll = [];
    }
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
    socket.emit("tapMap", { DIR, moveType: "absolute", AX, AY, sit: ava.sit });
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
    ava.container.x = AX;
    ava.container.y = AY;

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
        socket.emit("tapMap", { DIR, moveType: "absolute", AX, AY, sit: ava.sit });
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
      // ⭐ 絶対座標移動（従来通り）
      avaP[data.token].tappedMove(data.AX, data.AY, data.DIR, data.sit);
    }
  }
});

//看板機能
let isDownedShift = false;
function autoResizeMsg() {
  const el = msgForm.msg;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}
msgForm.msg.addEventListener("keydown", e => {
  isDownedShift = e.altKey;
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    msgForm.dispatchEvent(new Event("submit", { cancelable: true }));
  }
});
msgForm.msg.addEventListener("keyup", e => {
  isDownedShift = e.altKey;
});
msgForm.msg.addEventListener("input", autoResizeMsg);

//メッセージ入力
msgForm.addEventListener("submit", e => {
  if (isDownedShift) {//シフトが押されてる場合
    socket.emit("emit_msg", {
      msg: (msgForm.msg.value),
      carryOver: true,
    });
  } else {//シフトが推されてない時
    socket.emit("emit_msg", {
      msg: (msgForm.msg.value),
      carryOver: false,
    });
  }
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
    const aspect = avaP[thisToken].avatarAspect;
    const avatarColor = avaP[thisToken].avatarColor || 0xffffff;
    getAvatarIconDataURL(aspect, avatarColor).then(dataURL => { img.src = dataURL; });
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
let useMainLog = false;
mainLogButton.addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  e.preventDefault(); // テキスト選択やドラッグ開始を防ぐ
  useMainLog = !useMainLog;
  mainLogButton.style.backgroundColor = useMainLog ? 'skyblue' : 'red';
  const mainLogHeight = localStorage.getItem("mainLogHeight") || "200";
  mainLog.style.height = useMainLog ? mainLogHeight + "px" : "0px";
  mainLogFrame.style.height = useMainLog ? mainLogHeight + "px" : "0px";
  mainLogResizeBar.style.display = useMainLog ? "block" : "none";
});

//画面chatの表示切替
let useOverlayChat = false;
useOverlayChatButton.addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  e.preventDefault(); // テキスト選択やドラッグ開始を防ぐ
  useOverlayChat = !useOverlayChat;
  overlayChat.visible = useOverlayChat;
  useOverlayChatButton.style.backgroundColor = useOverlayChat ? 'skyblue' : 'red';
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

wa_i.style.backgroundColor = "red";
wa_i.addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  e.preventDefault(); // テキスト選択やドラッグ開始を防ぐ
  clickedWa_iButtun = !clickedWa_iButtun;
  wa_i.style.backgroundColor = clickedWa_iButtun ? 'skyblue' : 'red';
});

//お絵描き用のシステム
// ===== 床ポリゴン作成ツール =====
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
let _imgDragging = null; // {idx, type:'move'|'resize', startX, startY, origX, origY, origW, origH}
let _imgDoodleMode = false;
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
let _prevRoomName = '';
let _originalRoomName = '';
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
  document.getElementById('mainLog').style.display = '';
  _originalRoomName = '';
  _updateRoomSaveBtnState();
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
  // 認証前から部屋名を表示
  const knownName = (window._allRooms || []).find(r => r.id === roomId);
  document.getElementById('roomEditNameDisplay').textContent = knownName ? knownName.name : (_pendingRoomName || '');

  const lockResult = await _acquireRoomEditLock(roomId, pw);
  if (!lockResult.ok) {
    document.getElementById('roomEditErr').textContent = lockResult.error;
    return;
  }

  socket.emit('startRoomEdit', { roomId });

  try {
    if (!window._allRooms) {
      const r = await fetch('/api/rooms');
      window._allRooms = r.ok ? await r.json() : [];
    }
  } catch (_e) { window._allRooms = []; }

  warpEditRoomId = roomId;
  warpEditPassword = pw;
  imgEditRoomId = roomId;
  imgEditPassword = pw;
  codeEditRoomId = roomId;
  codeEditPassword = pw;
  _sessionRoomPasswords.set(roomId, pw);

  const displayName = _pendingRoomName || '';
  document.getElementById('roomEditNameDisplay').textContent = displayName;
  _originalRoomName = displayName;
  document.getElementById('roomNameEditInput').value = displayName;
  _updateRoomSaveBtnState();
  if (_isNewRoomMode) setTimeout(() => document.getElementById('roomNameEditInput').focus(), 50);

  await loadDbWarpZones(roomId);
  updateWarpList();
  await refreshImgList();
  const codeRes = await fetch('/api/rooms/' + encodeURIComponent(roomId) + '/code');
  if (codeRes.ok) {
    const d = await codeRes.json();
    document.getElementById('codeEditor').value = d.custom_code || '';
    document.getElementById('codeMsg').textContent = '';
  }
  document.getElementById('roomEditMain').style.display = 'block';
  document.getElementById('roomEditErr').textContent = '';
}

function openRoomEditPanel() {
  _openRoomPanel();
  document.getElementById('gateCreateSection').style.display = 'none';
  document.getElementById('roomEditSection').style.display = 'block';
  const rId = room ? room.name : '';
  document.getElementById('roomEditRoomIdDisplay').textContent = rId;
  document.getElementById('roomEditPw').value = '';
  document.getElementById('roomEditPw').type = 'password';
  document.getElementById('roomEditPwToggle').textContent = '表示';
  document.getElementById('roomEditMain').style.display = 'none';
  document.getElementById('roomEditErr').textContent = '';
  document.getElementById('roomDeleteConfirm').style.display = 'none';
  // コードルール初期表示
  document.getElementById('codeRulesBox').textContent = CODE_RULES;

  // 認証前から部屋名を表示
  const knownName = (window._allRooms || []).find(r => r.id === rId);
  document.getElementById('roomEditNameDisplay').textContent = knownName ? knownName.name : '';
  if (!knownName) {
    fetch('/api/rooms/' + encodeURIComponent(rId)).then(r => r.ok ? r.json() : null).then(d => {
      if (d && d.name) document.getElementById('roomEditNameDisplay').textContent = d.name;
    }).catch(() => {});
  }

  const cachedPw = _sessionRoomPasswords.get(rId);
  if (cachedPw !== undefined) {
    document.getElementById('roomEditPw').value = cachedPw;
    document.getElementById('roomEditAuthBtn').click();
  }
}

document.getElementById('roomEditMenu').addEventListener('click', () => {
  contextMenu.style.display = 'none';
  openRoomEditPanel();
});



document.getElementById('roomEditPwToggle').addEventListener('click', () => {
  const inp = document.getElementById('roomEditPw');
  const isHidden = inp.type === 'password';
  inp.type = isHidden ? 'text' : 'password';
  document.getElementById('roomEditPwToggle').textContent = isHidden ? '隠す' : '表示';
});

document.getElementById('roomEditAuthBtn').addEventListener('click', async () => {
  const roomId = room ? room.name : '';
  const pw = document.getElementById('roomEditPw').value;
  const errEl = document.getElementById('roomEditErr');
  errEl.textContent = '確認中...';

  // サーバーでパスワードを検証
  let authRes;
  try {
    authRes = await fetch('/api/rooms/' + encodeURIComponent(roomId) + '/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editPassword: pw }),
    });
  } catch (_e) {
    errEl.textContent = '通信エラー';
    return;
  }
  if (!authRes.ok) {
    const d = await authRes.json().catch(() => ({}));
    errEl.textContent = d.error || '認証失敗';
    return;
  }
  const authData = await authRes.json();

  // 編集ロック取得
  const lockResult = await _acquireRoomEditLock(roomId, pw);
  if (!lockResult.ok) {
    errEl.textContent = lockResult.error;
    return;
  }

  try {
    if (!window._allRooms) {
      const r = await fetch('/api/rooms');
      window._allRooms = r.ok ? await r.json() : [];
    }
  } catch (_e) { window._allRooms = []; }

  warpEditRoomId = roomId;
  warpEditPassword = pw;
  imgEditRoomId = roomId;
  imgEditPassword = pw;
  codeEditRoomId = roomId;
  codeEditPassword = pw;
  _sessionRoomPasswords.set(roomId, pw);

  document.getElementById('roomEditNameDisplay').textContent = authData.name || '';
  _originalRoomName = authData.name || '';
  document.getElementById('roomNameEditInput').value = _originalRoomName;
  _updateRoomSaveBtnState();

  await loadDbWarpZones(roomId);
  updateWarpList();
  await refreshImgList();
  const codeRes = await fetch('/api/rooms/' + encodeURIComponent(roomId) + '/code');
  if (codeRes.ok) {
    const d = await codeRes.json();
    document.getElementById('codeEditor').value = d.custom_code || '';
    document.getElementById('codeMsg').textContent = '';
  }
  document.getElementById('roomEditMain').style.display = 'block';
  errEl.textContent = '';
  if (_isNewRoomMode) {
    setTimeout(() => document.getElementById('roomNameEditInput').focus(), 50);
  }
});

// パスワード欄でEnterキー → 読込
document.getElementById('roomEditPw').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); document.getElementById('roomEditAuthBtn').click(); }
});

function _updateRoomSaveBtnState() {}

document.getElementById('roomNameEditInput').addEventListener('input', _updateRoomSaveBtnState);

// 部屋名を保存する共通処理
async function _saveRoomNameIfChanged() {
  const newName = document.getElementById('roomNameEditInput').value.trim();
  if (!warpEditRoomId) return false;
  if (!newName) {
    document.getElementById('roomEditErr').textContent = '部屋名を入力してください';
    document.getElementById('roomNameEditInput').focus();
    return false;
  }
  if (newName === _originalRoomName) {
    document.getElementById('roomEditErr').textContent = '変更がありません';
    return false;
  }
  const res = await fetch('/api/rooms/' + encodeURIComponent(warpEditRoomId) + '/', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword, 'X-Lock-Token': _roomEditLockToken },
    body: JSON.stringify({ name: newName }),
  });
  if (res.ok) {
    document.getElementById('roomEditNameDisplay').textContent = newName;
    _originalRoomName = newName;
    _updateRoomSaveBtnState();
    // むげんGATEの表示名も更新
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
  const mainVisible = document.getElementById('roomEditMain').style.display !== 'none';
  if (mainVisible) {
    const currentName = document.getElementById('roomNameEditInput').value.trim();
    if (currentName !== _originalRoomName) {
      document.getElementById('roomEditErr').textContent = '部屋の変更が保存されていません';
      return;
    }
  }
  document.getElementById('roomEditDiscardBtn').click();
});

document.getElementById('roomEditDiscardBtn').addEventListener('click', async () => {
  if (_isNewRoomMode && _newRoomGateIndex >= 0) {
    try {
      await fetch('/api/mugen/gates/' + _newRoomGateIndex, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken: myToken }),
      });
    } catch (_e) {}
    mugenGateRooms[_newRoomGateIndex] = null;
    updateMugenGateTints();
    const prevRoom = _prevRoomName;
    _isNewRoomMode = false;
    _newRoomGateIndex = -1;
    _prevRoomName = '';
    _pendingRoomName = '';
    _closeRoomPanel();
    stopWarpPlaceMode();
    goSelfToRoomSpot(prevRoom === 'むげん' ? 'mugenMainSpot' : prevRoom);
  } else {
    _isNewRoomMode = false;
    _closeRoomPanel();
    stopWarpPlaceMode();
  }
});

// 保存（パネルは閉じない）
document.getElementById('roomEditSaveBtn').addEventListener('click', async () => {
  if (document.getElementById('roomEditMain').style.display === 'none') return;
  const ok = await _saveRoomNameIfChanged();
  if (ok) _isNewRoomMode = false;
});

// 完了（保存してパネルを閉じる）
document.getElementById('roomEditCompleteBtn').addEventListener('click', async () => {
  if (document.getElementById('roomEditMain').style.display !== 'none') {
    const ok = await _saveRoomNameIfChanged();
    if (!ok) return;
  }
  _isNewRoomMode = false;
  _pendingRoomName = '';
  _closeRoomPanel();
  stopWarpPlaceMode();
});

// 部屋名保存
document.getElementById('roomNameSaveBtn').addEventListener('click', () => _saveRoomNameIfChanged());

// タブ切り替え
['Warp', 'Img', 'Code', 'Scale'].forEach(tab => {
  document.getElementById('roomEditTab' + tab).addEventListener('click', () => {
    ['Warp', 'Img', 'Code', 'Scale'].forEach(t => {
      const active = t === tab;
      document.getElementById('roomEditTab' + t).style.background = active ? '#1a3a6a' : '#0d0d1a';
      document.getElementById('roomEditTab' + t).style.color = active ? '#fff' : '#888';
      document.getElementById('roomEditContent' + t).style.display = active ? 'block' : 'none';
    });
    if (tab === 'Warp') { startWarpGlow(); _enableWarpEditMode(); }
    else { stopWarpGlow(); _disableWarpEditMode(); }
    if (tab === 'Img') _enableImgEditMode();
    else _disableImgEditMode();
    if (tab === 'Scale') {
      _scaleZoneEditRoomId = warpEditRoomId;
      updateScaleZoneList();
      const slider = document.getElementById('roomScaleSlider');
      const input = document.getElementById('roomScaleInput');
      if (slider) slider.value = _roomAvatarScale;
      if (input) input.value = _roomAvatarScale;
      if (_scaleZoneGfx) _scaleZoneGfx.visible = true;
    } else {
      _scaleZonePlaceMode = false;
      _scaleZonePlaceStart = null;
      if (_scaleZonePlacePreview) _scaleZonePlacePreview.clear();
      document.getElementById('scaleZonePlaceBtn').style.display = '';
      document.getElementById('scaleZonePlaceStopBtn').style.display = 'none';
      if (_scaleZoneGfx) _scaleZoneGfx.visible = false;
    }
  });
});

// ワープ光るアニメーション
let _warpGlowTicker = null;
function startWarpGlow() {
  if (_warpGlowTicker) return;
  let t = 0;
  _warpGlowTicker = app.ticker.add(() => {
    t += 0.05;
    const alpha = 0.15 + Math.abs(Math.sin(t)) * 0.5;
    if (!warpZoneGfx) return;
    warpZoneGfx.alpha = alpha;
  });
}
function stopWarpGlow() {
  if (_warpGlowTicker) { app.ticker.remove(_warpGlowTicker); _warpGlowTicker = null; }
  if (warpZoneGfx) warpZoneGfx.alpha = 1;
}

['Rect', 'Circle', 'Ellipse'].forEach(s => {
  document.getElementById('warpShape' + s).addEventListener('click', () => {
    _warpPlaceShape = s.toLowerCase();
    ['Rect', 'Circle', 'Ellipse'].forEach(t => {
      const btn = document.getElementById('warpShape' + t);
      const active = t === s;
      btn.style.background = active ? '#1a3a6a' : '#0d0d1a';
      btn.style.color = active ? '#fff' : '#888';
    });
    _disableWarpEditMode();
    startWarpPlaceMode();
    document.getElementById('warpPlaceBtn').style.display = 'none';
    document.getElementById('warpPlaceStopBtn').style.display = '';
  });
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

document.getElementById('roomScaleSaveBtn').addEventListener('click', async () => {
  const s = Math.max(0.01, Math.min(10, parseFloat(_roomScaleInput.value) || 1));
  _roomScaleInput.value = s;
  _roomScaleSlider.value = s;
  await fetch('/api/rooms/' + encodeURIComponent(_scaleZoneEditRoomId), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': warpEditPassword },
    body: JSON.stringify({ avatar_scale: s }),
  });
  _roomAvatarScale = s;
});

document.getElementById('scaleZonePlaceBtn').addEventListener('click', () => {
  _scaleZonePlaceMode = true;
  document.getElementById('scaleZonePlaceBtn').style.display = 'none';
  document.getElementById('scaleZonePlaceStopBtn').style.display = '';
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
    document.getElementById('roomDeleteErr').textContent = d.error || '削除失敗';
    return;
  }
  socket.emit('roomDeleted', { roomId });
  const gateIdx = mugenGateRooms.indexOf(roomId);
  if (gateIdx !== -1) {
    mugenGateRooms[gateIdx] = null;
    updateMugenGateTints();
  }
  _isNewRoomMode = false;
  _closeRoomPanel();
  stopWarpPlaceMode();
  goSelfToRoomSpot('entranceMainSpot');
});

// ===== 画像タブ =====

document.getElementById('imgUploadBtn').addEventListener('click', () => {
  document.getElementById('imgFileInput').click();
});

document.getElementById('imgFileInput').addEventListener('change', async () => {
  const fileInput = document.getElementById('imgFileInput');
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async e => {
    const res = await fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Edit-Password': imgEditPassword },
      body: JSON.stringify({ type: document.getElementById('imgType').value, imageBase64: e.target.result, filename: file.name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'アップロード失敗');
      return;
    }
    await refreshImgList();
    _disableImgEditMode();
    await loadDbImages(imgEditRoomId);
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
  undo.style.backgroundColor = _imgDoodleHistory.length > 0 ? 'skyblue' : '#c4f1efff';
  redo.style.backgroundColor = _imgDoodleRedoStack.length > 0 ? 'skyblue' : '#c4f1efff';
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
  _doodleCount++;
  document.getElementById('doodleNameInput').value = 'ラクガキ' + _doodleCount;
  _clearImgDoodle();
  _stopImgDoodleMode();
  document.getElementById('doodleArea').style.display = 'none';
  await refreshImgList();
  _disableImgEditMode();
  await loadDbImages(imgEditRoomId);
  if (_imgTabIsActive()) _enableImgEditMode();
}

document.getElementById('imgDoodleBtn').addEventListener('click', () => {
  const area = document.getElementById('doodleArea');
  if (area.style.display === 'none') {
    area.style.display = 'block';
    _startImgDoodleMode();
  } else {
    area.style.display = 'none';
    _stopImgDoodleMode();
    _clearImgDoodle();
  }
});

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
  _doodleCount++;
  document.getElementById('doodleNameInput').value = 'ラクガキ' + _doodleCount;
  _doodleCtx.clearRect(0, 0, canvas.width, canvas.height);
  await refreshImgList();
  _disableImgEditMode();
  await loadDbImages(imgEditRoomId);
  if (_imgTabIsActive()) _enableImgEditMode();
});

function _imgTabIsActive() {
  const el = document.getElementById('roomEditContentImg');
  return el && el.style.display !== 'none';
}

function _redrawImgOverlay(ov) {
  const s = ov.sprite, hs = 12;
  ov.borderGfx.clear();
  ov.borderGfx.lineStyle(2, 0x4a90d9, 0.9);
  ov.borderGfx.drawRect(s.x, s.y, s.width, s.height);
  ov.handleGfx.clear();
  ov.handleGfx.beginFill(0x4a90d9);
  ov.handleGfx.drawRect(s.x + s.width - hs, s.y + s.height - hs, hs, hs);
  ov.handleGfx.endFill();
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
      if (!imgData.width) imgData.width = Math.round(sprite.texture.width) || null;
      if (!imgData.height) imgData.height = Math.round(sprite.texture.height) || null;
      if (imgData.width) sprite.width = imgData.width;
      if (imgData.height) sprite.height = imgData.height;
    }
    const borderGfx = new PIXI.Graphics();
    borderGfx.zIndex = 1000; borderGfx.eventMode = 'none';
    room.container.addChild(borderGfx);
    const handleGfx = new PIXI.Graphics();
    handleGfx.zIndex = 1001; handleGfx.eventMode = 'static'; handleGfx.cursor = 'se-resize';
    room.container.addChild(handleGfx);
    const ov = { imgData, sprite, borderGfx, handleGfx };
    _imgOverlays.push(ov);
    _redrawImgOverlay(ov);
    sprite.eventMode = 'static'; sprite.cursor = 'grab';
    sprite.on('pointerdown', e => {
      if (!_imgDragMode || _imgDragging) return;
      const p = room.container.toLocal(e.global);
      const hs = 12;
      if (p.x >= sprite.x + sprite.width - hs && p.y >= sprite.y + sprite.height - hs) return;
      e.stopPropagation();
      _imgDragging = { idx, type: 'move', startX: p.x, startY: p.y, origX: sprite.x, origY: sprite.y, origW: sprite.width, origH: sprite.height };
      sprite.cursor = 'grabbing';
    });
    handleGfx.on('pointerdown', e => {
      if (!_imgDragMode || _imgDragging) return;
      e.stopPropagation();
      const p = room.container.toLocal(e.global);
      _imgDragging = { idx, type: 'resize', startX: p.x, startY: p.y, origX: sprite.x, origY: sprite.y, origW: sprite.width, origH: sprite.height };
    });
  });
  app.stage.on('pointermove', _onImgDragMove);
  app.stage.on('pointerup', _onImgDragEnd);
  app.stage.on('pointerupoutside', _onImgDragEnd);
}

function _disableImgEditMode() {
  _imgDragMode = false; _imgDragging = null;
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
    ov.sprite.eventMode = 'none'; ov.sprite.cursor = 'default';
  });
  _imgOverlays.length = 0;
}

function _onImgDragMove(e) {
  if (!_imgDragging || !room) return;
  const ov = _imgOverlays[_imgDragging.idx];
  if (!ov) return;
  const p = room.container.toLocal(e.global);
  const dx = p.x - _imgDragging.startX, dy = p.y - _imgDragging.startY;
  if (_imgDragging.type === 'move') {
    ov.sprite.x = _imgDragging.origX + dx;
    ov.sprite.y = _imgDragging.origY + dy;
  } else {
    ov.sprite.width = Math.max(20, _imgDragging.origW + dx);
    ov.sprite.height = Math.max(20, _imgDragging.origH + dy);
  }
  _redrawImgOverlay(ov);
}

async function _onImgDragEnd() {
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
  const row = document.querySelector('#imgList [data-img-id="' + ov.imgData.id + '"]');
  if (row) row.querySelectorAll('input[data-field]').forEach(inp => {
    const v = { x, y, width: w, height: h }[inp.dataset.field];
    if (v !== undefined) inp.value = v;
  });
  await fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images/' + ov.imgData.id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Edit-Password': imgEditPassword },
    body: JSON.stringify({ x, y, width: w, height: h }),
  });
}

async function refreshImgList() {
  const res = await fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images');
  const images = res.ok ? await res.json() : [];
  const list = document.getElementById('imgList');
  list.innerHTML = '';

  const TYPE_CFG = {
    background: { label: '背景',       color: '#4a90d9', bg: '#0d2040' },
    platform:   { label: '足場',       color: '#50c878', bg: '#0d2a15' },
    object:     { label: 'オブジェクト', color: '#f0a030', bg: '#2a1a00' },
  };

  images.forEach(img => {
    const row = document.createElement('div');
    row.dataset.imgId = img.id;
    row.style.cssText = 'display:flex;align-items:center;gap:5px;padding:4px 6px;margin:3px 0;background:#111;border:1px solid #333;border-radius:3px;';

    const thumb = document.createElement('img');
    thumb.src = img.url;
    thumb.style.cssText = 'width:28px;height:28px;object-fit:cover;flex-shrink:0;border:1px solid #444;';
    row.appendChild(thumb);

    const right = document.createElement('div');
    right.style.cssText = 'display:flex;align-items:center;gap:4px;';

    const displayName = img.filename.replace(/^\d+_/, '');
    const fname = document.createElement('span');
    fname.textContent = displayName;
    fname.title = displayName;
    fname.style.cssText = 'font-size:11px;color:#ddd;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:120px;';
    right.appendChild(fname);

    const typeSel = document.createElement('select');
    const initCfg = TYPE_CFG[img.type] || TYPE_CFG.background;
    typeSel.style.cssText = `background:#1a1a1a;border:1px solid ${initCfg.color};color:${initCfg.color};padding:2px 3px;font-size:10px;cursor:pointer;margin-left:32px;`;
    Object.entries(TYPE_CFG).forEach(([key, cfg]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = cfg.label;
      if (key === img.type) opt.selected = true;
      typeSel.appendChild(opt);
    });
    typeSel.addEventListener('change', async () => {
      const cfg = TYPE_CFG[typeSel.value];
      typeSel.style.borderColor = cfg.color;
      typeSel.style.color = cfg.color;
      await fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images/' + img.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Edit-Password': imgEditPassword },
        body: JSON.stringify({ type: typeSel.value }),
      });
      _disableImgEditMode();
      await loadDbImages(imgEditRoomId);
      if (_imgTabIsActive()) _enableImgEditMode();
    });
    right.appendChild(typeSel);

    const mkNumInput = (placeholder, field, val) => {
      const inp = document.createElement('input');
      inp.type = 'number'; inp.value = val ?? 0; inp.placeholder = placeholder;
      inp.dataset.field = field;
      inp.style.cssText = 'width:38px;background:#0d0d1a;border:1px solid #4a90d9;color:#fff;padding:1px 2px;font-size:10px;';
      inp.addEventListener('change', async () => {
        await fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images/' + img.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Edit-Password': imgEditPassword },
          body: JSON.stringify({ [field]: Number(inp.value) }),
        });
        _disableImgEditMode();
        await loadDbImages(imgEditRoomId);
        if (_imgTabIsActive()) _enableImgEditMode();
      });
      return inp;
    };
    right.appendChild(mkNumInput('X', 'x', img.x));
    right.appendChild(mkNumInput('Y', 'y', img.y));
    right.appendChild(mkNumInput('W', 'width', img.width));
    right.appendChild(mkNumInput('H', 'height', img.height));

    const warpBtn = document.createElement('button');
    warpBtn.textContent = img.is_warp ? 'ワープON' : 'ワープ';
    warpBtn.title = 'この画像をワープとして使う';
    warpBtn.style.cssText = `font-size:10px;padding:1px 4px;cursor:pointer;border:1px solid ${img.is_warp ? '#00ccff' : '#555'};background:${img.is_warp ? '#003344' : '#111'};color:${img.is_warp ? '#00ccff' : '#888'};`;
    warpBtn.addEventListener('click', async () => {
      const newVal = img.is_warp ? 0 : 1;
      await fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images/' + img.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Edit-Password': imgEditPassword },
        body: JSON.stringify({ is_warp: newVal }),
      });
      await refreshImgList();
    });
    right.appendChild(warpBtn);

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.style.cssText = 'background:#600;color:#fff;border:none;cursor:pointer;padding:2px 6px;font-size:12px;';
    delBtn.addEventListener('click', async () => {
      await fetch('/api/rooms/' + encodeURIComponent(imgEditRoomId) + '/images/' + img.id, {
        method: 'DELETE',
        headers: { 'X-Edit-Password': imgEditPassword },
      });
      await refreshImgList();
      _disableImgEditMode();
      await loadDbImages(imgEditRoomId);
      if (_imgTabIsActive()) _enableImgEditMode();
    });
    right.appendChild(delBtn);
    row.appendChild(right);

    list.appendChild(row);
  });
}

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
    clear.style.backgroundColor = '#c4f1efff';
  });

  clear.addEventListener('pointerup', e => {
    if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
    if (clearState === "disabled") return;
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
    undo.style.backgroundColor = '#c4f1efff';
  });

  undo.addEventListener('pointerup', e => {
    if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
    doUndo();
  }, { passive: true });

  function doUndo() {
    if (undoState === "disabled") return;
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
    redo.style.backgroundColor = '#c4f1efff';
  });

  // リドゥ（やり直し）ボタンの処理
  redo.addEventListener('pointerup', e => {
    if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
    doRedo();
  }, { passive: true });

  function doRedo() {
    if (redoState === "disabled") return;

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
  // 対象（アバター or 部屋）の履歴・リドゥスタック取得
  const target = avatarDraw ? avaP[avatarOekakiToken] : room;
  const hasLine = target.drawHistory.some(line => line.type === "line");
  const canUndo = target.drawHistory.some(line =>
    line.token === myToken ||
    (Array.isArray(line.roomMemberToken) && line.roomMemberToken.includes(myToken))
  );
  const canRedo = target.redoStack && target.redoStack.length > 0;

  // 全消しボタン
  clear.style.backgroundColor = avatarDraw
    ? (hasLine ? "blue" : "#c4f1efff")
    : (hasLine ? "skyblue" : "#c4f1efff");
  clearState = hasLine ? "enabled" : "disabled";

  // アンドゥボタン
  undo.style.backgroundColor = avatarDraw
    ? (canUndo ? "blue" : "#c4f1efff")
    : (canUndo ? "skyblue" : "#c4f1efff");
  undoState = canUndo ? "enabled" : "disabled";

  // リドゥボタン
  redo.style.backgroundColor = avatarDraw
    ? (canRedo ? "blue" : "#c4f1efff")
    : (canRedo ? "skyblue" : "#c4f1efff");
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

logNoiseButton.style.backgroundColor = useLogChime ? 'skyblue' : 'red';
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

logNoiseButton.addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  e.preventDefault();
  useLogChime = !useLogChime;
  logNoiseButton.style.backgroundColor = useLogChime ? 'skyblue' : 'red';
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

train.style.backgroundColor = "rgb(255,165,0)";
function trainClick() {
  if (room !== login) {
    socket.emit("emit_msg", {
      msg: "#train",
    });
  }
}

//電車
socket.on("train", data => {
  const li = document.createElement("li");
  li.classList.add("flexContainer");
  const roomTypes = data.roomTypes || data.roomNameList.map(() => 'system');
  for (let i = 0; i < data.trainList.length; i++) {
    const btn = document.createElement("button");
    btn.textContent = data.trainList[i];
    const isUser = roomTypes[i] === 'user';
    btn.style.backgroundColor = isUser ? '#1a2a5a' : 'rgb(255,165,0)';
    if (isUser) btn.style.color = '#aaccff';
    btn.addEventListener('pointerdown', e => {
      if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
      e.preventDefault();
      const roomId = data.roomNameList[i];
      if (isUser) {
        goSelfToRoomSpot('userRoom:' + roomId, 'train');
        return;
      }
      switch (roomId) {
        case "エントランス":    goSelfToRoomSpot("entranceTrainSpot", "train"); break;
        case "草原":           goSelfToRoomSpot("entranceCloud1", "train"); break;
        case "うちゅー":       goSelfToRoomSpot("outerSpaceMainSpot", "train"); break;
        case "星1":            goSelfToRoomSpot("star1EntrySpot", "train"); break;
        case "むげんのいりぐち": goSelfToRoomSpot("mugenEntrySpot", "train"); break;
        case "むげん":         goSelfToRoomSpot("mugenMainSpot", "train"); break;
      }
    });
    li.appendChild(btn);
  }

  if (!useMainLog) {
    useMainLog = true;
    const mainLogHeight = localStorage.getItem("mainLogHeight") || "200";
    mainLog.style.height = mainLogHeight + "px";
    mainLogFrame.style.height = mainLogHeight + "px";
    mainLogResizeBar.style.display = "block";
    mainLogButton.style.backgroundColor = 'skyblue';
  }
  mainLogUl.appendChild(li);
  mainLog.scrollTop = mainLog.scrollHeight;

  // 画面チャットにもテキストで表示
  const _ot = new PIXI.Text(data.trainList.join('  '), { ...overlayChatStyle, fontSize: 13 });
  _ot.y = 0;
  const _off = Math.max(_ot.height, 14);
  overlayChat.children.forEach(c => { c.y += _off; });
  overlayChat.addChild(_ot);
});//socket.on("train");

//リスト
socket.on("list", data => {
  const li = document.createElement("li");
  li.classList.add("flexContainer");
  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  const timeSpan = document.createElement("span");
  timeSpan.textContent = timeStr;
  timeSpan.style.cssText = "font-size:0.85em;opacity:0.7;margin-left:6px;align-self:center;";
  let button = [];

  for (let i = 0; i < data.listName.length; i++) {
    button[i] = document.createElement("button");
    button[i].textContent = data.listName[i];
    if (avaP[data.listToken[i]].abon) {
      button[i].style.backgroundColor = "red";
    } else {
      button[i].style.backgroundColor = "skyblue";
    }
    button[i].className = data.listToken[i];
    button[i].addEventListener('pointerdown', e => {
      if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
      e.preventDefault(); // テキスト選択やドラッグ開始を防ぐ
      if (myToken != data.listToken[i]) {//自テキストは省く
        if (avaP[data.listToken[i]].abon) {
          avaP[data.listToken[i]].abon = false;
          button[i].style.backgroundColor = "skyblue";
        } else {
          avaP[data.listToken[i]].abon = true;
          button[i].style.backgroundColor = "red";
        }
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
});//socket.on("list");

usersDisplay.style.backgroundColor = "rgb(200,240,240)";
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
  } else {//アボンを解除する時
    avaP[data.token].abon = false;
    outputChatMsg(data.msg, "blue");
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
  input.textContent = location.origin + location.pathname + '?room=' + room.name;
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
function settingClick() {
  if (setting.style.display === "block") {
    document.getElementById("setting").style.display = "none";
  } else {
    document.getElementById("setting").style.display = "block";
    populateDeviceSelects();
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
document.getElementById('cameraSelectMode').value = cameraSelectMode;
document.getElementById('micSelectMode').value = micSelectMode;

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
  const c = (avaP[token] != null ? avaP[token].avatarColor : null) ?? 0xffffff;
  const r = (c >> 16) & 0xff;
  const g = (c >> 8) & 0xff;
  const b = c & 0xff;
  if (r + g + b < 60) {
    li.style.background = isAnnounce ? 'rgba(0,0,0,0.6)' : 'black';
    li.style.color = 'white';
  } else {
    li.style.background = `rgba(${r},${g},${b},${isAnnounce ? 0.3 : 0.7})`;
    li.style.color = '';
  }
}

function applyLogHighlight(token) {
  highlightToken = token;
  mainLogUl.querySelectorAll('li.log-highlight').forEach(li => {
    li.classList.remove('log-highlight');
    li.style.background = '';
    li.style.color = '';
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

function _applyVideoTransparent() {
  if (_videoTransparentActive) {
    // transform を持つ #main の外に出して fixed が viewport 基準になるようにする
    _mcOriginalParent = mediaContainer.parentNode;
    _mcOriginalNextSibling = mediaContainer.nextSibling;
    document.body.appendChild(mediaContainer);
    mediaContainer.classList.add('video-transparent-mode');
    mediaContainer.style.height = '';
    mediaContainer.style.width = '';
    Object.values(videoArray).forEach(v => {
      v.freeFloat = false;
      v.style.opacity = videoTransparentOpacity;
      v.style.pointerEvents = 'auto';
      v.style.top = '0';
      v.style.left = '0';
      v.style.width = '100%';
      v.style.height = '100%';
      v.style.objectFit = 'contain';
      v.style.objectPosition = 'left top';
    });
    Object.values(videoHandles).forEach(h => { h.style.display = 'none'; });
  } else {
    mediaContainer.classList.remove('video-transparent-mode');
    if (_mcOriginalParent) {
      _mcOriginalParent.insertBefore(mediaContainer, _mcOriginalNextSibling);
      _mcOriginalParent = null;
    }
    Object.values(videoArray).forEach(v => {
      v.freeFloat = false;
      v.style.opacity = '';
      v.style.pointerEvents = '';
      v.style.top = '0';
      v.style.objectFit = '';
      v.style.objectPosition = '';
    });
    Object.values(videoHandles).forEach(h => { h.style.display = ''; });
    videoResize();
  }
}

function toggleVideoTransparent() {
  _videoTransparentActive = !_videoTransparentActive;
  _applyVideoTransparent();
}

function changeVideoTransparentDefault() {
  videoTransparentDefault = document.getElementById('videoTransparentDefault').checked;
  localStorage.setItem("videoTransparentDefault", videoTransparentDefault);
  _videoTransparentActive = videoTransparentDefault;
  _applyVideoTransparent();
}

function changeVideoTransparentOpacity(val) {
  videoTransparentOpacity = parseFloat(val);
  localStorage.setItem("videoTransparentOpacity", videoTransparentOpacity);
  if (_videoTransparentActive) {
    Object.values(videoArray).forEach(v => { v.style.opacity = videoTransparentOpacity; });
  }
}

// 映像ハンドルの位置同期
function _syncHandle(fromToken) {
  const v = videoArray[fromToken];
  const h = videoHandles[fromToken];
  if (!v || !h) return;
  h.style.left = (v.offsetLeft + v.clientWidth - 22) + 'px';
  h.style.top = (v.offsetTop + v.clientHeight - 22) + 'px';
}

// 映像ジェスチャー（タッチ1本: ダブルタップ透過切替・スワイプ透過度調整 / タッチ2本: 移動+ピンチリサイズ同時 / マウス: ドラッグ移動）
function _addVideoInteraction(fromToken) {
  const v = videoArray[fromToken];

  const handle = document.createElement('div');
  handle.style.cssText = 'position:absolute;width:22px;height:22px;z-index:2;cursor:se-resize;touch-action:none;pointer-events:auto;background:rgba(180,180,180,0.5);border-radius:0 0 4px 0;box-sizing:border-box;';
  handle.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" style="position:absolute;bottom:2px;right:2px;"><path d="M3 11L11 3M7 11L11 7" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round"/></svg>';
  mediaContainer.appendChild(handle);
  videoHandles[fromToken] = handle;
  _syncHandle(fromToken);

  const ptrs = new Map(); // pointerId → {x, y}
  let tapTime = 0;
  let startX, startY, startLeft, startTop, startW, startH;
  let startOpacity = 0;
  let pinchStartDist = 0;
  let pinchStartCenter = { x: 0, y: 0 };
  let moved = false;
  let mode = null; // 'mouse-move' | 'two-finger'

  v.style.touchAction = 'none';
  v.addEventListener('touchstart', (e) => { e.preventDefault(); }, { passive: false });
  v.addEventListener('pointerdown', (e) => {
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.preventDefault();
    v.setPointerCapture(e.pointerId);

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

    // 1本指
    startX = e.clientX; startY = e.clientY;
    startOpacity = videoTransparentOpacity;
    moved = false;
    if (e.pointerType === 'mouse') {
      mode = 'mouse-move';
      startLeft = v.offsetLeft; startTop = v.offsetTop;
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
        v.style.left = (startLeft + dx) + 'px';
        v.style.top = (startTop + dy) + 'px';
        _syncHandle(fromToken);
      }
    } else if (mode === null && _videoTransparentActive && e.pointerType !== 'mouse') {
      // タッチ1本水平スワイプ → 透過度調整
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 8) moved = true;
      if (moved) {
        const newVal = Math.max(0.01, Math.min(0.99, startOpacity + dx * 1.96 / window.innerWidth));
        videoTransparentOpacity = newVal;
        document.getElementById('videoTransparentOpacitySlider').value = newVal;
        localStorage.setItem("videoTransparentOpacity", newVal);
        Object.values(videoArray).forEach(vv => { vv.style.opacity = newVal; });
      }
    }
  });

  v.addEventListener('pointerup', (e) => {
    ptrs.delete(e.pointerId);

    if (mode === 'two-finger') {
      if (ptrs.size < 2) mode = null;
      return;
    }

    if (e.pointerType !== 'mouse' && !moved) {
      const now = Date.now();
      if (now - tapTime < 300) {
        toggleVideoTransparent();
        tapTime = 0;
      } else {
        tapTime = now;
      }
    }
    if (ptrs.size === 0) mode = null;
  });

  // リサイズハンドル（タッチ/マウスともシングルドラッグ）
  handle.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handle.setPointerCapture(e.pointerId);
    let hStartX = e.clientX, hStartY = e.clientY;
    let hStartW = v.clientWidth, hStartH = v.clientHeight;
    let hMoved = false;
    const onMove = (e) => {
      const dx = e.clientX - hStartX, dy = e.clientY - hStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hMoved = true;
      if (hMoved) {
        v.freeFloat = true;
        v.style.width = Math.max(80, hStartW + dx) + 'px';
        v.style.height = Math.max(45, hStartH + dy) + 'px';
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
if (videoTransparentDefault) _applyVideoTransparent();

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

windowResize();

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

function windowResize() {
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
      const mainLogHeight = localStorage.getItem("mainLogHeight") ? Number(localStorage.getItem("mainLogHeight")) : 200;
      mainLog.style.height = mainLogHeight + "px";
      mainLogFrame.style.height = mainLogHeight + "px";
      mainLogResizeBar.style.display = "block";
    } else {
      mainLogButton.style.backgroundColor = "red";
      mainLog.style.height = 0 + "px";
      mainLogFrame.style.height = 0 + "px";
      mainLogResizeBar.style.display = "none";
    }

    //画面chat
    useOverlayChatButton.style.backgroundColor = "skyblue";
    overlayChat.visible = true;
    useOverlayChat = true;

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

function videoResize() {
  if (_videoTransparentActive) return;
  if (Object.keys(videoArray).length) {
    let left = 0;
    let allWidth = 0;
    let containerH = window.innerHeight - mainLogFrame.clientHeight - titleBar.clientHeight;
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

      Object.keys(videoArray).forEach(function (key) {//人の要素の高さを変更
        if (videoArray[key].freeFloat) {
          if (videoArray[key].clientHeight > maxHeight) maxHeight = videoArray[key].clientHeight;
          _syncHandle(key);
          return;
        }
        if (!videoArray[key].fixFlag) {//要素が固定されてない時
          videoArray[key].style.width = containerH / orgR[key] / allWidth * 100 + "%";
          videoArray[key].style.height = 100 + "%";

          if (window.innerWidth > allWidth) {//確保できてる立幅/窓の横幅<一番大きい映像の立幅/映像の合計値//横を調整しないといけない時
            videoArray[key].style.left = left + "px";//横の位置を指定
            left += (allWidth - used) / remain * containerH / orgR[key];//横の隙間を入れなおして、ビデオの幅を追加
            videoArray[key].style.width = (allWidth - used) / remain * containerH / orgR[key] + "px";//横の位置を指定
            videoArray[key].style.height = (allWidth - used) / remain * containerH + "px";//横の位置を指定

          } else {//縦を調整しないと行けない時
            //残ってる割合を分け合って、比率の分だけわけた割合
            videoArray[key].style.width = (window.innerWidth - used) / remain * containerH / orgR[key] + "px";//横の幅を指定
            videoArray[key].style.left = left + "px";//横の位置を指定
            left += (window.innerWidth - used) / remain * containerH / orgR[key];  //要素が占領している幅を足す
            videoArray[key].style.height = (window.innerWidth - used) / remain * containerH + "px";//高さを指定
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
          if (window.innerWidth > allWidth) {
            if (containerH > maxHeight) {
              maxHeight = containerH;
            }
          } else {
            if (window.innerWidth * containerH / allWidth > maxHeight) {
              maxHeight = (window.innerWidth - used) / remain * containerH;
            }
          }
        } else {
          if (videoArray[key].clientHeight > maxHeight) {
            maxHeight = videoArray[key].clientHeight;
          }
        }
      });
    } else if (selectVideoSize.videoSize.value === "setWidth") {//横の大きさで揃える
      Object.keys(videoArray).forEach(function (key) {//人の要素の高さを変更
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
      Object.keys(videoArray).forEach(function (key) {//人の要素の高さを変更
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
  } else {
    mediaContainer.style.height = 0 + "px";
  }
}

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

// ソケットIOで "mediaButton" イベントを受信した時の処理
socket.on("mediaButton", data => {
  // デバッグ用に内容を表示

  // 送信元IDを取得
  let fromToken = data.from;

  // メディア状態の問い合わせ（部屋入室時など）
  if (data.type === 'callMediaStatus') {
    // 動画配信中ならボタン作成通知
    if (videoStatus) {
      socket.emit("mediaButton", { type: 'createVideoButton', quality: streamQualityLevel });
    }
    // 音声配信中ならボタン作成通知
    if (audioStatus) {
      socket.emit("mediaButton", { type: 'createAudioButton', });
    }
  }
  // 動画受信ボタンの作成要求
  else if (data.type === 'createVideoButton') {
    senderQuality[fromToken] = data.quality || 'max';
    if (!videoButton[fromToken] || videoButton[fromToken].style.visibility === "hidden") {
      createVideoButton(fromToken);
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
    senderQuality[fromToken] = data.quality;
    updateReceiverQualitySelect(fromToken);
  }
  // 動画ボタン削除要求
  else if (data.type === "remove video button") {
    videoButton[fromToken].style.visibility = "hidden"
    // 音声ボタンも非表示ならメディア要素ごと削除
    if (!audioButton[fromToken] || audioButton[fromToken].style.visibility === "hidden") {
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
    if (!canConnectMore()) {
      // 接続数が多すぎる場合は無視
      console.warn('TOO MANY connections, so ignore');
    }
    else if (!localStream) {
      // ローカルストリームが無い場合は無視
    }
    else if (peerConnections[fromToken]) {
      // 既に接続済みなら無視
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
  delete receiverQualitySelect[fromToken];
  delete senderQuality[fromToken];
}

// 接続を切断する関数（id指定）
// メディア要素・ボタン・フラグ・ピアコネクション・mapPeerを削除
function stopConnection(fromToken) {
  if (mediaElement[fromToken]) {
    // 動画・音声ボタンを非表示
    if (videoButton[fromToken]) {
      videoButton[fromToken].style.visibility = "hidden";
    }
    if (audioButton[fromToken]) {
      audioButton[fromToken].style.visibility = "hidden";
    }
    // ボタンフラグを削除
    if (videoButtonFlag[fromToken]) {
      delete videoButtonFlag[fromToken];
    }
    if (audioButtonFlag[fromToken]) {
      delete audioButtonFlag[fromToken];
    }
    // メディア要素を削除
    removeMediaElementButton(fromToken)
  }
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
    if (videoButton[fromToken]) {
      videoButton[fromToken].style.visibility = "hidden";
    }
    if (audioButton[fromToken]) {
      audioButton[fromToken].style.visibility = "hidden";
    }
    if (videoButtonFlag[fromToken]) {
      delete videoButtonFlag[fromToken];
    }
    if (audioButtonFlag[fromToken]) {
      delete audioButtonFlag[fromToken];
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
  if (_videoTransparentActive) {
    videoArray[fromToken].style.opacity = videoTransparentOpacity;
    videoArray[fromToken].style.pointerEvents = 'auto';
    videoArray[fromToken].style.left = '0';
    videoArray[fromToken].style.width = '100%';
    videoArray[fromToken].style.height = '100%';
    videoArray[fromToken].style.objectFit = 'contain';
    videoArray[fromToken].style.objectPosition = 'left top';
  }
  mediaContainer.appendChild(videoArray[fromToken]);

  playMedia(videoArray[fromToken], stream);
  // 再生できない場合のエラー表示
  let p = document.createElement("p");
  p.textContent = "なんか再生できてないvideo";
  videoArray[fromToken].appendChild(p);
  // メタデータ読み込み時にvideoResizeを呼ぶ
  videoArray[fromToken].addEventListener('loadedmetadata', (event) => {
    videoResize();
  }, { passive: true });
}

function attachAudio(fromToken, stream) {//remoteAudioの追加
  let audio = document.createElement('audio');
  audio.autoplay = true;
  // audio.token = 'remote_audio_' + token;//↓↓のやつとともにしばらく消してみて様子見
  mediaContainer.appendChild(audio);
  remoteAudios[fromToken] = audio;//たぶんこれもaudio消してremoteAudiosで統一していい
  playMedia(audio, stream);
  audio.volume = audioVolume[fromToken].value;

  // スマホやタブレットの自動再生制限対策
  document.addEventListener('pointerdown', () => {
    audio.play();
    audio.volume = 1;
  }, { passive: true, once: true });

  //エラーの場合
  let p = document.createElement("p");
  p.textContent = "なんか再生できてないaudio";
  audio.appendChild(p);
}

function detachVideo(token) {//videoの削除
  pauseMedia(videoArray[token]);
  delete videoArray[token];
  if (videoHandles[token]) { videoHandles[token].remove(); delete videoHandles[token]; }
  videoResize();
}

function detachAudio(token) {//remoteAudioの削除
  // mediaContainer.removeChild(document.getElementById('remote_audio_' + token));//しばらく消してみて様子見、
  delete remoteAudios[token];
}

// ---------------------- media handling -----------------------
function _pickDevice(kind) {
  return navigator.mediaDevices.enumerateDevices().then(devices => {
    const hasLabel = devices.some(d => d.kind === kind && d.label);
    if (hasLabel) return devices;
    // 権限未付与でラベルが空 → 一時取得して権限を得てから再列挙
    const tempConstraint = kind === 'videoinput' ? { video: true } : { audio: true };
    return navigator.mediaDevices.getUserMedia(tempConstraint)
      .then(tmp => { tmp.getTracks().forEach(t => t.stop()); return navigator.mediaDevices.enumerateDevices(); })
      .catch(() => devices);
  }).then(devices => {
    const filtered = devices.filter(d => d.kind === kind);
    return new Promise((resolve, reject) => {
      const overlay = document.getElementById('devicePickerOverlay');
      const labelEl = document.getElementById('devicePickerLabel');
      const select = document.getElementById('devicePickerSelect');
      const okBtn = document.getElementById('devicePickerOk');
      const cancelBtn = document.getElementById('devicePickerCancel');
      labelEl.textContent = kind === 'videoinput' ? 'カメラを選択' : 'マイクを選択';
      select.innerHTML = '';
      filtered.forEach((d, i) => {
        const opt = document.createElement('option');
        opt.value = d.deviceId;
        opt.textContent = d.label || (kind === 'videoinput' ? 'カメラ' : 'マイク') + (i + 1);
        select.appendChild(opt);
      });
      overlay.style.display = 'flex';
      function onOk() {
        const deviceId = select.value;
        const deviceLabel = select.options[select.selectedIndex]?.textContent || '';
        overlay.style.display = 'none';
        cleanup();
        resolve({ deviceId, deviceLabel });
      }
      function onCancel() {
        overlay.style.display = 'none';
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

async function _getVideoDeviceId() {
  if (cameraSelectMode === 'fixed' && cameraDeviceId) {
    return cameraDeviceId;
  }
  if (cameraSelectMode === 'fixed') {
    return null;
  }
  const picked = await _pickDevice('videoinput');
  cameraDeviceId = picked.deviceId;
  cameraDeviceLabel = picked.deviceLabel;
  localStorage.setItem('cameraDeviceId', cameraDeviceId);
  localStorage.setItem('cameraDeviceLabel', cameraDeviceLabel);
  return cameraDeviceId;
}

async function _getMicDeviceId() {
  if (micSelectMode === 'fixed' && micDeviceId) {
    return micDeviceId;
  }
  if (micSelectMode === 'fixed') {
    return null;
  }
  const picked = await _pickDevice('audioinput');
  micDeviceId = picked.deviceId;
  micDeviceLabel = picked.deviceLabel;
  localStorage.setItem('micDeviceId', micDeviceId);
  localStorage.setItem('micDeviceLabel', micDeviceLabel);
  return micDeviceId;
}

async function startVideo() {
  if (videoStatus) {
    return;
  }
  let deviceId;
  try {
    deviceId = await _getVideoDeviceId();
  } catch (_e) {
    return;
  }
  videoStatus = {
    ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
    ...QUALITY_CONSTRAINTS[streamQualityLevel],
  };
  getDeviceStream({
    video: videoStatus,
  }) // audio: false <-- ontrack once, audio:true --> ontrack twice!!
    .then(function (stream) { // success
      document.getElementById('startVideo').style.backgroundColor = "skyblue";
      if (!localStream) {
        localStream = stream;
      }
      localVideoTrack = localStream.addTrack(stream.getVideoTracks()[0]);

      mapPeer.forEach(function (value) {
        if (videoStatus) {
          if (value.get("onVideo")) {
            value.set("oldVideo", stream.getVideoTracks()[0]);
            value.set("idOldVideo", stream.getVideoTracks()[0].id)
            value.get("rtc").addTrack(value.get("oldVideo"), stream);
          };
        }
      });

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
      socket.emit("mediaButton", { type: 'createVideoButton', quality: streamQualityLevel });
      socket.emit("stream", { format: "videoStart", });
      document.getElementById('startVideo').onclick = function buttonClick() {
        stopVideo();
      }

    }).catch(function (error) { // error
      videoStatus = false;
      document.getElementById('startVideo').style.backgroundColor = "red";
      document.getElementById('startVideo').onclick = function buttonClick() {
        startVideo();
      }
      outputChatMsg("カメラの取得に失敗しました。", "red");
      console.error('getUserMedia error:', error);

      return;
    });
}

async function startAudio() {
  if (audioStatus) {
    return;
  }
  let deviceId;
  try {
    deviceId = await _getMicDeviceId();
  } catch (_e) {
    return;
  }
  audioStatus = true;
  getDeviceStream({
    audio: deviceId ? { deviceId: { exact: deviceId } } : true
  }).then(function (stream) { // success
    document.getElementById('startAudio').style.backgroundColor = "skyblue";
    if (!localStream) {
      localStream = stream;
    }
    localAudioTrack = localStream.addTrack(stream.getAudioTracks()[0]);
    mapPeer.forEach(function (value) {
      if (audioStatus) {
        if (value.get("onAudio")) {
          value.set("oldAudio", stream.getAudioTracks()[0]);
          value.set("idOldAudio", stream.getAudioTracks()[0].id);
          value.get("rtc").addTrack(value.get("oldAudio"), stream);
        }
      }
    });

    socket.emit("mediaButton", { type: 'createAudioButton', });
    socket.emit("stream", { format: "audioStart", });
    document.getElementById('startAudio').onclick = function buttonClick() {
      stopAudio();
    }
  }).catch(function (error) { // error
    audioStatus = false;
    document.getElementById('startAudio').style.backgroundColor = "red";
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
  document.getElementById('startVideo').style.backgroundColor = "red";
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
}

function stopAudio() {
  document.getElementById('startAudio').style.backgroundColor = "red";
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
}

function checkAllListenFunk() {
  if (checkAllListen) {//checkAllListenを止めるとき
    checkAllListen = false;
    document.getElementById('checkAllListen').style.backgroundColor = "pink";
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
    document.getElementById('checkAllListen').style.backgroundColor = "#6C9BD2";
    Object.keys(mediaElement).forEach(function (key) {
      if (videoButton[key] && videoButtonFlag[key] === undefined) {
        videoButtonFlag[key] = true;
      }
      if (audioButton[key] && audioButtonFlag[key] === undefined) {
        audioButtonFlag[key] = true;
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

  element.play();//メディアの再生
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
    videoButton[fromToken].style.backgroundColor = 'skyblue';
    if ((checkAllListen && !(audioButtonFlag[fromToken] === false))) {//checkAllListenでcallAudioも呼ばれてる場合
      mediaConnect(fromToken, "call video and audio");
    } else {
      mediaConnect(fromToken, "call video");
    }
  } else {//押されてなかったら
    videoButton[fromToken].style.backgroundColor = "red";
    videoButton[fromToken].onclick = function buttonClick() {
      videoButtonFlag[fromToken] = true;
      mediaConnect(fromToken, "call video");
    }
  }
  if (!receiverQualitySelect[fromToken]) {
    const sel = document.createElement('select');
    [['max','最高'],['high','高'],['normal','標準'],['low','低']].forEach(([v, t]) => {
      const opt = document.createElement('option');
      opt.value = v; opt.textContent = t;
      sel.appendChild(opt);
    });
    sel.value = 'max';
    sel.onchange = function() { requestReceiverQuality(fromToken, sel.value); };
    receiverQualitySelect[fromToken] = sel;
    mediaElement[fromToken].appendChild(sel);
  }
  updateReceiverQualitySelect(fromToken);
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
    audioVolume[fromToken].classList.add("order3");
    audioVolume[fromToken].classList.add('audioVolume');
    audioVolume[fromToken].type = "range";
    audioVolume[fromToken].name = "speed";
    audioVolume[fromToken].value = 0.5;
    audioVolume[fromToken].min = "0";
    audioVolume[fromToken].max = "1";
    audioVolume[fromToken].step = "0.001";
    // audioVolume[fromToken].width = "500px";
    audioVolume[fromToken].onchange = function setAudioVolume() {
      if (remoteAudios[fromToken]) {
        let audio = remoteAudios[fromToken];
        audio.volume = document.getElementById(fromToken).value;
      }
    }
  } else {
    let audio = remoteAudios[fromToken];
    // audio.volume = document.getElementById(fromToken).value;
  }
  mediaElement[fromToken].appendChild(audioVolume[fromToken]);

  if (checkAllListen) {//checkAllListenがonだったらボタンを押す
    if (audioButtonFlag[fromToken] === undefined) {
      audioButtonFlag[fromToken] = true;
    }
  }

  if (audioButtonFlag[fromToken]) {//ボタンが既に押されていたら
    audioButton[fromToken].style.backgroundColor = 'skyblue';
    mediaConnect(fromToken, "call audio");
  } else {//押されてなかったら
    audioButton[fromToken].style.backgroundColor = "red";
    audioButton[fromToken].onclick = function buttonClick() {
      audioButtonFlag[fromToken] = true;
      mediaConnect(fromToken, "call audio");
    }
  }
}

// ---------------------- connection handling -----------------------
function prepareNewConnection(fromToken) {
  let pc_config = {
    "iceServers": [
      { "urls": "stun:coturn.nuco.moe:50000" },
      { "urls": "turn:nuco.moe:50000?transport=udp", "username": "user", "credential": "password" },
      { "urls": "turn:nuco.moe:50000?transport=tcp", "username": "user", "credential": "password" }
    ]
  };
  let peer = new RTCPeerConnection(pc_config);

  // --- on get remote stream ---
  if ('ontrack' in peer) {
    peer.ontrack = (event) => {
      stream[fromToken] = event.streams[0];//追加の場合
      let track = event.track;
      if (track.kind === 'video') {
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
    if (peer.iceConnectionState === 'disconnected') {
      stopConnection(fromToken);//相手が切断したときにこちらも切断する

    }
  };

  peer.onicegatheringstatechange = () => {
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
  if (!canConnectMore()) {
  } else {
    if (mapPeer.get(fromToken)) {
      if (isDataChannelOpen(mapPeer.get(fromToken).get("rtc"))) {//接続済の場合
        mapPeer.get(fromToken).get("rtc").datachannel.send(JSON.stringify({ type: type }));
      }
    } else {//まだ未接続の場合
      if (type == "call video and audio" || type == "call video" || type == "call audio") {
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

async function populateDeviceSelects(withPermission) {
  if (withPermission) {
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(tmp => { tmp.getTracks().forEach(t => t.stop()); })
      .catch(() => {});
  }
  const devices = await navigator.mediaDevices.enumerateDevices();
  function fill(selectEl, kind, savedId, savedLabel) {
    // deviceIdが空のデバイスは権限未取得なので表示しない
    const list = devices.filter(d => d.kind === kind && d.deviceId);
    if (!list.length) return;
    selectEl.innerHTML = '';
    list.forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = d.deviceId;
      opt.textContent = d.label || (d.deviceId === savedId && savedLabel) || (kind === 'videoinput' ? 'カメラ' : 'マイク') + (i + 1);
      if (d.deviceId === savedId) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }
  fill(document.getElementById('cameraDeviceSelect'), 'videoinput', cameraDeviceId, cameraDeviceLabel);
  fill(document.getElementById('micDeviceSelect'), 'audioinput', micDeviceId, micDeviceLabel);
}

function onCameraDeviceSelect(sel) {
  if (!sel.value) return;
  cameraDeviceId = sel.value;
  cameraDeviceLabel = sel.options[sel.selectedIndex]?.textContent || '';
  localStorage.setItem('cameraDeviceId', cameraDeviceId);
  localStorage.setItem('cameraDeviceLabel', cameraDeviceLabel);
}

function onMicDeviceSelect(sel) {
  if (!sel.value) return;
  micDeviceId = sel.value;
  micDeviceLabel = sel.options[sel.selectedIndex]?.textContent || '';
  localStorage.setItem('micDeviceId', micDeviceId);
  localStorage.setItem('micDeviceLabel', micDeviceLabel);
}

function changeStreamQuality(level) {
  streamQualityLevel = level;
  localStorage.setItem('streamQualityLevel', level);
  if (videoStatus && localStream) {
    const track = localStream.getVideoTracks()[0];
    if (track) track.applyConstraints(QUALITY_CONSTRAINTS[level]).catch(e => console.warn('applyConstraints:', e));
  }
  if (videoStatus) socket.emit("mediaButton", { type: 'streamQuality', quality: level });
}

function updateReceiverQualitySelect(fromToken) {
  const sel = receiverQualitySelect[fromToken];
  if (!sel) return;
  const senderIdx = QUALITY_ORDER.indexOf(senderQuality[fromToken] || 'max');
  Array.from(sel.options).forEach(opt => {
    opt.disabled = QUALITY_ORDER.indexOf(opt.value) > senderIdx;
  });
  if (QUALITY_ORDER.indexOf(sel.value) > senderIdx) {
    sel.value = QUALITY_ORDER[senderIdx];
    requestReceiverQuality(fromToken, sel.value);
  }
}

function requestReceiverQuality(fromToken, quality) {
  const peer = mapPeer.get(fromToken);
  if (peer && isDataChannelOpen(peer.get('rtc'))) {
    peer.get('rtc').datachannel.send(JSON.stringify({ type: 'setReceiverQuality', quality }));
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

