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


//メモ
//PIXI.Rectangle: x, y, width, height を持つだけの矩形データ
//PIXI.Texture 画像データそのものを扱う
//PIXI.Sprite Textureを加工して表示する。Spriteの永続的設定はSprite生成直後に行う。
//PIXI.Graphics ベクター図形を扱う。

// PIXIの「Displayオブジェクト」とは、
// 画面に表示できて、addChild/removeChildできるクラスのことです。

// 主なDisplayオブジェクト（PIXI.DisplayObjectを継承）
// PIXI.Container（コンテナ、グループ化用）
// PIXI.Sprite（画像表示）
// PIXI.Graphics（ベクター描画）
// PIXI.Text（テキスト表示）
// PIXI.AnimatedSprite（アニメーションスプライト）
// PIXI.TilingSprite（タイル状スプライト）
// PIXI.Mesh（メッシュ）
// PIXI.SimpleMesh など

// Displayオブジェクト「ではない」もの
// PIXI.Texture（画像データそのもの、表示できない）
// PIXI.BaseTexture
// PIXI.Rectangle / PIXI.Circle / PIXI.Polygon（ジオメトリ型、当たり判定や図形定義用）
// PIXI.Loader / PIXI.Application などの管理・ユーティリティ系
// PIXI.resources.* など




//ソケットIOをonにする
const port = 3000;
const socket = io.connect(window.location.origin);

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
let entrance, meadow, cloud, bonfire, rainbow;
let daikokubasira;

let outerSpace;
let mozinoheya;
let star1;
let star2;
let objMap = {};



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


let muon = new Audio('sound/etc/muon.mp3');
muon.autoplay = true;
muon.setAttribute('playsinline', '');
//ログ音
let useLogChime = localStorage.getItem("useLogChime") === "true";
const msgSE = {};
msgSE.loginRoom = {};
msgSE.loginRoom.in = [];
msgSE.loginRoom.in[0] = new Audio('sound/login/tirin1.mp3');
// msgSE.login.in[0].autoplay = true;
// msgSE.login.in[0].setAttribute('playsinline', '');

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




// autoplay = true：自動再生を有効にする
// setAttribute('playsinline', '')：iOSなどでインライン再生を有効にする
//これ何のためにかいたのかなんでコメントアウトしてるのか思いだせない、//試しに戻したら読み込みが追い付かなくてばぐるっぽい？
// msgSE.log[0].autoplay = true;
// msgSE.log[0].setAttribute('playsinline', '');
// msgSE.log[1].autoplay = true;
// msgSE.log[1].setAttribute('playsinline', '');
// msgSE.log[2].autoplay = true;
// msgSE.log[2].setAttribute('playsinline', '');
// msgSE.log[3].autoplay = true;
// msgSE.log[3].setAttribute('playsinline', '');
// msgSE.log[4].autoplay = true;
// msgSE.log[4].setAttribute('playsinline', '');
// msgSE.log[5].autoplay = true;
// msgSE.log[5].setAttribute('playsinline', '');
// msgSE.log[6].autoplay = true;
// msgSE.log[6].setAttribute('playsinline', '');
// msgSE.log[7].autoplay = true;
// msgSE.log[7].setAttribute('playsinline', '');
// msgSE.log[8].autoplay = true;
// msgSE.log[8].setAttribute('playsinline', '');





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
    room: "エントランス",
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
    room: "星1",
    area: { x1: 311, x2: 348, y1: 220, y2: 250 },
    toSpot: "outerSpaceMainSpot"
  },
  // オブジェクト指定のワープポイント
  {
    room: "エントランス",
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

// 統合されたワープ判定関数
function checkObjectWarpPoints(avatar) {
  for (const wp of warpPoints) {
    // 部屋が一致しない場合はスキップ
    if (wp.room !== room.name) continue;


    let isInArea = false;


    // オブジェクト指定の場合
    if (wp.targetObject) {
      const targetObj = objMap[wp.targetObject];
      console.log(targetObj);
      if (targetObj) {
        isInArea = hitAB(avatar, targetObj);
        console.log(isInArea);
      }
    }
    // 座標指定の場合
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
  return false;
}

// 配信機能
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

//#region フォント総選挙 消してもいいんだけど、一応残してる。
// let fontSousenkyo = document.getElementById("fontSousenkyo");
// let chatFont = document.getElementById("chatFont");
// let titleFont = document.getElementById("titleFont");
// let nameTextFont = document.getElementById("nameTextFont");
// let sonotaFont = document.getElementById("sonotaFont");
// nameTextFont.options[1].selected = true;//選択位置を変更
// chatFont.options[2].selected = true;
// // titleFont.options[8].selected = true;
// sonotaFont.options[2].selected = true;
// function fontChange(value) {
//   switch (value) {
//     case "mainLog":
//       obj = chatFont;
//       break;
//     case "title":
//       obj = titleFont;
//       break;
//     case "sonota":
//       obj = sonotaFont;
//       break;
//     case "nameText":
//       obj = nameTextFont;
//       break;
//   }
//   index = obj.selectedIndex;
//   switch (index) {
//     case 0:
//       fontName = "鉄瓶ゴシック";
//       fontSize = 16;
//       break;
//     case 1:
//       fontName = "JKゴシックM";
//       fontSize = 17;
//       break;
//     case 2:
//       fontName = "kosugiMaru";
//       fontSize = 17;
//       break;
//     case 3:
//       fontName = "チカラヅヨク";
//       fontSize = 18;
//       break;
//     case 4:
//       fontName = "チカラヨワク";
//       fontSize = 18;
//       break;
//     case 5:
//       fontName = "MSゴシック";
//       fontSize = 18;
//       break;
//     case 6:
//       fontName = "UD Digi Kyokasho N-R";
//       fontSize = 18;
//       break;
//     case 7:
//       fontName = "游ゴシック";
//       fontSize = 18;
//       break;
//     case 8:
//       fontName = "microsoft jhenghei UI light";
//       fontSize = 18;
//       break;
//   }
//   switch (value) {
//     case "mainLog":
//       mainLog.style.fontFamily = fontName, "游ゴシック", "Yu Gothic", "MS ゴシック", 'メイリオ', 'Meiryo', "monospace";
//       mainLog.style.fontSize = fontSize + "px";
//       chatFont.style.fontFamily = fontName;
//       break;
//     case "title":
//       title.style.fontFamily = fontName;
//       title.style.fontSize = fontSize + 37 + "px";
//       titleFont.style.fontFamily = fontName;
//       break;
//     case "sonota":
//       body.style.fontFamily = fontName;
//       sonotaFont.style.fontFamily = fontName;
//       PmainFooter.style.fontFamily = fontName;
//       mainLog.style.fontFamily = fontName;
//       logNoiseButton.style.fontFamily = fontName;
//       clear.style.fontFamily = fontName;
//       wa_i.style.fontFamily = fontName;
//       useOverlayChatButton.style.fontFamily = fontName;
//       break;
//     case "nameText":
//       nameText[myToken].style = {
//         fontFamily: fontName,
//         fontSize: 18,
//         fill: "white",
//         trim: true,
//       }
//       break;
//   }
// };
//#endregion


// mainLogの下端にリサイズバーを追加
// const mainLogResizeBar = document.createElement("div");
// mainLogの外にリサイズバーを追加
// mainLog.insertAdjacentElement('afterend', mainLogResizeBar);

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
  console.log(fontSize);
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

  dataURL = dataURL;


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




PIXI.Assets.load(['img/allgraphics.png']).then((assets) => {
  setUp(assets);
});
// #endregion

async function setUp(assets) {//画像読み込み後の処理はここに書いていく
  // サーバーから全画像分のポリゴンデータを取得し、画像名ごとにPIXI.Graphicsで可視化・hitArea設定
  try {
    const response = await fetch('/polygon');
    const data = await response.json();

    if (!data || typeof data !== 'object') {
      console.error('ポリゴンデータがありません');
      return;
    }
    // polygonsオブジェクトに画像名（拡張子抜き）をキー、値をポリゴン配列として格納
    Object.entries(data).forEach(([imgName, polyArrs]) => {
      const key = imgName.replace(/\.png$/i, '');// 画像名から拡張子を除去
      polygons[key] = polyArrs;
    });
    // ポリゴン取得完了後の処理
    socket.emit("getMyUser", {});
    setUpFlag[0] = true;
  } catch (err) {
    console.error('ポリゴン取得失敗:', err);
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
  //エントランス画面
  entrance = new PIXI.Sprite(new PIXI.Texture(baseTex, new PIXI.Rectangle(660, 0, 660, 480)));
  rainbow = new PIXI.Graphics();//ブロックを置く宣言
  meadow = new PIXI.Sprite(new PIXI.Texture(baseTex, new PIXI.Rectangle(0, 0, 660, 480)));
  cloud = new PIXI.Sprite(new PIXI.Texture(baseTex, new PIXI.Rectangle(0, 480, 660, 200)));
  bonfire = new PIXI.Sprite(new PIXI.Texture(baseTex, new PIXI.Rectangle(248, 728, 150, 120)));
  daikokubasira = new PIXI.Sprite(new PIXI.Texture(baseTex, new PIXI.Rectangle(1500, 70, 50, 100)));
  //うちゅー画面
  outerSpace = new PIXI.Sprite(new PIXI.Texture(baseTex, new PIXI.Rectangle(660, 480, 660, 480)));
  //星1
  star1 = new PIXI.Graphics();

  // objMap = {
  //   "loginRoom": loginRoom,
  //   "エントランス": entrance,
  //   "草原": meadow,
  //   "雲": cloud,
  //   "たき火": bonfire,
  //   "虹": rainbow,
  //   "大黒柱": daikokubasira,
  //   "うちゅー": outerSpace,
  //   // "文字の部屋": mozinoheya,
  //   "星1": star1,
  //   // "星2": star2
  // }




  // 座標確認用のオブジェクトの表示
  const coordText = new PIXI.Text("", { fontFamily: "serif", fontSize: 12, fill: "blue" });
  const mouseText = new PIXI.Text("", { fontFamily: "serif", fontSize: 12, fill: "red" });

  coordText.position.set(560, 400);
  mouseText.position.set(560, 430);

  coordText.zIndex = 1001;
  mouseText.zIndex = 1001;

  app.stage.addChild(coordText);
  app.stage.addChild(mouseText);


  app.stage.eventMode = 'static';
  app.stage.on('pointermove', (event) => {
    coordText.text = `avaX: ${AX}\navaY: ${AY}`;
    loginMX = event.global.x;
    loginMY = event.global.y;
    if (0 <= loginMX && loginMX <= 660 && 0 <= loginMY && loginMY <= 460) {
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
function setMultiPolygonHitArea(targetSprite, polygonsArr) {
  // polygonsArrから有効な多角形だけを抽出し、PIXI.Polygonインスタンスの配列を作る
  // 各polyArrは[x1,y1,x2,y2,...]形式で、最低3点(6要素)必要
  const polygonObjs = polygonsArr
    .filter(polyArr => Array.isArray(polyArr) && polyArr.length >= 6) // 3点以上の多角形のみ
    .map(polyArr => new PIXI.Polygon(polyArr)); // PIXI.Polygonに変換

  // hitAreaには「contains(x, y)」関数＋_polygonsプロパティ（Polygon配列）を持たせる
  // _polygons: 複数ポリゴンのPIXI.Polygonインスタンス配列（独自判定や座標参照用）
  // contains: PIXIイベント用の当たり判定関数
  targetSprite.hitArea = {
    _polygons: polygonObjs, // 独自用途でPolygon座標列を参照したい場合に使う
    contains: function (x, y) {
      // どれか1つでもtrueならtrue（複数ポリゴン対応）
      return polygonObjs.some(poly => poly.contains(x, y));
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


    //画像を追加
    this.avatarAspect = avatarAspect;//アバターを出力
    switch (avatarAspect) {
      case "necosuke":
      case "necosukeMono":
        this.setAvatar(avatarAspect === "necosuke" ? necosuke : necosukeMono);
        console.log("ねこすけ裏設定：クールなまなざしを覗き込むと瞳の奥は燃えている　鳥のように飛べるんじゃないかと考えながら雲から飛び降りている　ごまねこが降りる様を見ると冷や汗をかいてしまう");
        break;
      case "gomanecoMono":
        this.setAvatar(gomanecoMono);
        console.log("ごまねこ裏設定集：高いところが好きな高所恐怖症、飛び降りる時は少しの勇気が必要、目を開けられなくて毎回ちびっちゃう。綿あめを食べ過ぎて腹を壊した、雲を見るとたまに思い出す。");
        break;
      default:
        this.avatarAspect = "gomaneco";
        this.setAvatar(gomaneco);
        console.log("ごまねこ裏設定集：高いところが好きな高所恐怖症、飛び降りる時は少しの勇気が必要、目を開けられなくて毎回ちびっちゃう。綿あめを食べ過ぎて腹を壊した、雲を見るとたまに思い出す。");
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
    let inTime = new Date().getHours();
    if (0 <= inTime && inTime < 12) {
      inTime = 24 - inTime;
    }
    this.nameTag.alpha = Math.pow(1.06, inTime) * 0.1;
    this.container.addChild(this.nameText);
    this.nameText.addChild(this.nameTag);

    // アバターのメッセージを追加する
    this.msg = new PIXI.Text("");
    this.msg.zIndex = 20;

    this.msg.style.fontSize = 16;
    this.msg.style.fill = "0x1e90ff";
    this.msg.position.set(0, -this.avaS.height - 5);
    this.container.addChild(this.msg);


    //アバターお絵描きを描画
    // これまで描いた全ての線の履歴（undo/redo/全消し用,キャッシュ）
    this.drawHistory = [];
    this.redoStack = [];
    // 新しいGraphicsインスタンスを作成
    this.oekakiGraphics = new PIXI.Graphics();
    this.oekakiGraphics.zIndex = 10;
    this.container.addChild(this.oekakiGraphics);

    this.abon = false;//アボンされてるかどうか
    this.abonSprite = new PIXI.Sprite(abonTexture);
    this.abonSprite.anchor.set(0.5, 1);


    app.ticker.add(() => {
      this.avaLoop();
    });


    this.container.on('pointerdown', e => {
      if (['touch', 'pen'].includes(e.pointerType)) {
        let touchTimer = setTimeout(() => contextMenuPositionSet(e), 1000);//一秒長押しで、右クリックメニューを表示
        const clearTouchTimer = () => clearTimeout(touchTimer);
        document.getElementById("graphic").addEventListener("touchend", clearTouchTimer, { passive: true, once: true });

        isPointerDown = true;
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
        } else {
          avatarOekakiMenu.textContent = "ラクガキする";
        }
        avatarOekakiMenu.style.display = "block";

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

        contextMenu.style.display = "block";
        contextMenuPositionSet(e);
      }
    });
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
    // if (polygons["gomaN"]) {
    //   console.log("ポリゴン設定", polygons["gomaN"]);

    //   // ポリゴン座標をアバターのローカル座標系に変換
    //   const originalPolygon = polygons["gomaN"][0];
    //   const localPolygon = [];

    //   // アバターの中心を基準にした座標に変換
    //   // anchor.set(0.5, 1)なので、アバターの足元中心が原点
    //   const centerX = this.avaS.width / 2;
    //   const bottomY = this.avaS.height;

    //   for (let i = 0; i < originalPolygon.length; i += 2) {
    //     localPolygon.push(originalPolygon[i] - centerX);           // X座標を中心基準に
    //     localPolygon.push(originalPolygon[i + 1] - bottomY);       // Y座標を足元基準に
    //   }

    //   this.container.hitArea = new PIXI.Polygon(localPolygon);
    //   // console.log("ローカル座標変換後:", localPolygon);
    // }
    // setMultiPolygonHitArea(this.container, polygons["gomaN"]); 
    // console.log("ポリゴン設定", polygons["gomaN"]);
    // drawMultiPolygonGrBb aphics(this.container, polygons["gomaN"]);
    // }
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

    console.log(`${this.name}の${spriteName}にhitArea設定: ${polygonKey}${shouldFlip ? ' (反転)' : ''}, ポリゴン数: ${processedPolygons.length}`);
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

  displayAvatar({ fromRoom, AX, AY, DIR, sit, avatarAlpha, msg, carryOver, sleep, newAvatarDrawHistory, random }) {//アバターを表示する。
    this.container.position.set(AX, AY);
    room.container.addChild(this.container);
    this.container.removeChild(this.avaC);

    this.dropVelocity = 1;

    this.roomIn = 1;//入室回数をリセット

    // 画像とメッセージと名前を追加してavaPにつける
    switch (DIR) {
      case "NE":
        this.avaC = this.avaNE;
        break;
      case "SE":
        this.avaC = this.avaSE;
        break;
      case "SW":
        this.avaC = this.avaSW;
        break;
      case "NW":
        this.avaC = this.avaNW;
        break;
      case "N":
        this.avaC = this.avaN;
        break;
      case "E":
        this.avaC = this.avaE;
        break;
      case "W":
        this.avaC = this.avaW;
        break;
      default:
        this.avaC = this.avaS;
        break;
    }
    if (sit) {
      this.avaC = this.avaSit;
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
      outputChatMsg(this.name + ":" + msg, false, this.token);
    } else {
      this.msg.text = "";
    }


    //落書き履歴のリセット処理
    this.drawHistory = newAvatarDrawHistory ? newAvatarDrawHistory : [];

    //お絵描きの描画
    if (newAvatarDrawHistory && newAvatarDrawHistory.length > 0) {
      this.oekakiGraphics.clear(); // 既存の描画をクリア
      newAvatarDrawHistory.forEach(line => { // 履歴データを1本ずつ描画
        if (line.type === "line" && line.pointer.length > 0) {    // typeが"line"のときだけ線を描く
          // 線の太さ・色・透明度を設定
          this.oekakiGraphics.lineStyle(2, line.color, line.alpha);
          // pointer配列に座標が入っている場合
          if (line.pointer && line.pointer.length > 0) {
            // 最初の点にペンを移動
            this.oekakiGraphics.moveTo(line.pointer[0].x, line.pointer[0].y);
            // 2点目以降を順番につなげて線を引く
            for (let i = 1; i < line.pointer.length; i++) {
              this.oekakiGraphics.lineTo(line.pointer[i].x, line.pointer[i].y);
            }
          }
        }
        // typeが"clear"のときは何もしない（全消し履歴用）
      });
    }


    usersNumber.textContent = room.container.children.filter(child => child.token).length;//部屋人数の表記を変える

    if (useLogChime) {//部屋入室の音を鳴らす
      let regexp = /ＪＭＭ連合/i;//＠ＪＭＭ連合って文字が入ってたら爆発する
      if (fromRoom === "loginRoom" && regexp.test(this.name)) {
        console.log("JMM連合");
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
    } else {
      this.container.scale.x = 1;
      this.container.scale.y = 1;
    }
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
  //アニメーションの関数
  anime(ava0, ava1, ava2,) {//引数：初期ava,歩いてるとき、歩いてるとき２、token
    gsap.delayedCall(0.1, () => {
      this.container.removeChild(this.avaC);
      this.avaC = ava1;
      this.container.addChild(this.avaC);
    });
    gsap.delayedCall(0.2, () => {
      this.container.removeChild(this.avaC);
      this.avaC = ava2;
      this.container.addChild(this.avaC);
    });
    gsap.delayedCall(0.3, () => {
      this.container.removeChild(this.avaC);
      this.avaC = ava1;
      this.container.addChild(this.avaC);
    });
    gsap.delayedCall(0.4, () => {
      this.container.removeChild(this.avaC);
      this.avaC = ava0;
      this.container.addChild(this.avaC);
    });
  }

  //数値を取得後のアバターの動き
  tappedMove(thisAX, thisAY, thisDIR, sit) {
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
    if (sit) {
      this.anime(this.avaSit, this[dir[1]], this[dir[2]]);
    } else {
      this.anime(this[dir[0]], this[dir[1]], this[dir[2]]);
    }
    gsap.to(this.container, {
      duration: 0.4, x: thisAX, y: thisAY, onComplete: () => {
        if (this.token == myToken) {//自分自身の移動の場合
          checkObjectWarpPoints(avaP[myToken]);//オブジェクトワープポイントの確認 
        } else {//自分以外の移動の場合
          if (this.roomIn > 1) {//バックグラウンド復帰時
            if (sit) {
              this.avaC = this.avaSit;
            } else {
              this.avaC = directionMap[thisDIR][0];
            }
            this.container.addChild(this.avaC);
            this.container.position.set(thisAX, thisAY);
          }
        }
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
        console.log(`${ava.name}が${otherAvatar.name}に乗っています`);
        return otherAvatar;
      }

      // アバター名タグとの判定
      if (otherAvatar.nameText && otherAvatar.nameText.parent === otherAvatar.container) {
        if (this.checkHitWithDisplayObject(ava, otherAvatar, otherAvatar.nameText)) {
          // console.log(`${ava.name}が${otherAvatar.name}の名前タグに乗っています`);
          return otherAvatar;
        }
      }

      // アバターお絵描きとの判定
      if (otherAvatar.oekakiGraphics && otherAvatar.oekakiGraphics.parent === otherAvatar.container) {
        if (this.checkHitWithOekaki(ava, otherAvatar, otherAvatar.oekakiGraphics)) {
          console.log(`${ava.name}が${otherAvatar.name}のお絵描きに乗っています`);
          return otherAvatar;
        }
      }
    }

    // 2. 部屋のお絵描きとの判定
    if (room.oekakiGraphics && room.oekakiGraphics.parent === room.container) {
      // if(room.oekakiGraphics) {console.log("room.oekakiGraphicsはあります");};
      // if(room.oekakiGraphics.hitArea) {console.log("room.oekakiGraphics.hitAreaはあります");};
      if (this.checkHitWithOekaki(ava, room, room.oekakiGraphics)) {
        console.log(`${ava.name}が部屋のお絵描きに乗っています`);
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
        (ava.avatarAlpha < 0.5 && tags.includes("standableWhenTranslucent"));

      if (canStand && hitAB(ava, otherObj)) {
        // console.log(`${ava.name}が${otherObj.name}に乗っています`);
        return otherObj;
      }
    }

    return null;
  }

  // アバターの表示オブジェクト（名前タグ、お絵描き）との当たり判定
  checkHitWithDisplayObject(ava, targetAvatar, displayObject) {
    if (!displayObject || !displayObject.getBounds) return false;

    // displayObjectのグローバル座標での境界を取得
    const bounds = displayObject.getBounds();

    // avatarの座標がdisplayObjectの範囲内にあるかチェック
    return ava.container.x >= bounds.x &&
      ava.container.x <= bounds.x + bounds.width &&
      ava.container.y >= bounds.y &&
      ava.container.y <= bounds.y + bounds.height;
  }

  // お絵描きとの当たり判定（線に沿った判定）
  checkHitWithOekaki(ava, targetObject, oekakiGraphics) {
    if (!oekakiGraphics || !oekakiGraphics.hitArea) {
      console.warn(`${targetObject.name || 'Unknown'}のお絵描きにhitAreaが設定されていません`);
      return false;
    }
    const localX = ava.container.x - targetObject.container.x;
    const localY = ava.container.y - targetObject.container.y;

    // カスタムcontains関数を持つ場合
    if (typeof oekakiGraphics.hitArea.contains === 'function') {
      return oekakiGraphics.hitArea.contains(localX, localY);
    }
    
    // PIXI.Polygonの場合
    if (oekakiGraphics.hitArea instanceof PIXI.Polygon) {
      return oekakiGraphics.hitArea.contains(localX, localY);
    }

    console.warn(`未対応のhitAreaタイプ: ${typeof oekakiGraphics.hitArea}`);
    return false;
  }

  // アバターの落下処理
  fallDawn() {
    // 毎フレーム、今乗っているオブジェクトがあるか判定
    const standingOn = this.isStandingOnObject(this);

    if (standingOn) {
      // 着地時の処理（落下速度が1より大きい場合のみ）
      if (this.dropVelocity > 1 && this.token === myToken) {
        console.log("着地");
        socket.emit("transformData", {
          DIR: DIR,
          AX: this.container.x,
          AY: this.container.y,
        });
      }
      this.dropVelocity = 1; // 落下速度リセット
    } else {
      // 空中なので落下処理
      if (this.dropVelocity <= 150) {
        this.dropVelocity *= 1.08; // 加速
      }
      this.container.y += this.dropVelocity; // 落下
    }
  }

  avaLoop() {
    this.container.zIndex = this.container.y;
    if (room.name === "エントランス") {
      this.fallDawn();
      // アバターのY座標に応じてスケール（大きさ）を変更
      if (0 < this.container.y && this.container.y <= 180) {
        this.container.scale.x = this.container.y / 180;
        this.container.scale.y = this.container.y / 180;
      } else if (180 < this.container.y) {
        this.container.scale.x = 1;
        this.container.scale.y = 1;
      }
      // //通っただけで発動する関数を使いたいならここ使う。
      // // 特定範囲内なら「うちゅー」部屋へ移動
      // if (this.token === myToken) {
      //   if (125 <= this.container.x && this.container.x <= 175 && 200 <= this.container.y && this.container.y <= 300) {
      //     goSelfToRoomSpot("outerSpaceMainSpot");
      //   }
      // }
    }
  }
}


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

    switch (sprite) {
      case entrance:
        meadow = GameObject.getOrCreateObject(meadow, "草原", ["standable"]);
        // setMultiPolygonHitArea(meadow, polygons["meadow"]); // meadowのhitAreaを追加
        // drawMultiPolygonGraphics(entrance, polygons["meadow"]);
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

        cloud = GameObject.getOrCreateObject(cloud, "雲", ["standable"]);
        setMultiPolygonHitArea(cloud.container, polygons["cloud"]); // cloudのhitAreaを追加
        // drawMultiPolygonGraphics(entrance, polygons["cloud"]);
        this.container.addChild(cloud.container);

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
      case outerSpace:
        break;

      case star1:
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

      default://loginRoom
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
          console.log('Login button clicked!');
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
    //部屋でのポインター処理
    this.container.on('pointerdown', e => {
      contextMenu.style.display = "none";//前の表示のコンテキストメニューを消す
      if (e.button === 0) {//お絵描き用の処理
        isPointerDown = true;
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
      if (isPointerDown && (isDownCtrl || clickedWa_iButtun)) {
        target = avatarOekakiToken ? avaP[avatarOekakiToken].container : this.container;
        target.addChild(this.drawingGraphics);
        this.drawingGraphics.clear();
        this.drawingGraphics.lineStyle(2, oekakiColor, oekakiAlpha);
        lastPosition.x = e.data.getLocalPosition(target).x;
        lastPosition.y = e.data.getLocalPosition(target).y;
        this.drawingGraphics.moveTo(lastPosition.x, lastPosition.y);
        // 今描いている線のデータを初期化
        this.currentLine = {
          type: "line",
          token: myToken,
          uuid: uuid(),//線の識別用
          color: oekakiColor,
          alpha: oekakiAlpha,
          pointer: [{ x: lastPosition.x, y: lastPosition.y }],
        };

        oekakityu = true;
      }
    });
    function uuid() { // UUIDを生成する関数。もし衝突が報告されるようになってきたらuuidv4を検討する。
      return Math.random().toString(36).slice(2, 11);
    }

    this.container.on('pointermove', e => {
      if (!(['mouse', 'touch', 'pen'].includes(e.pointerType))) return;//なんか、pointermoveはe.button=-1になるらしい、e.pointerTypeで判定する
      if (isPointerDown && (isDownCtrl || clickedWa_iButtun)) {
        this.draw(e.data.getLocalPosition(target).x, e.data.getLocalPosition(target).y);//毎瞬drawする
      }
    });

    // お絵描き中の座標を受け取って線を引く関数
    // ドラッグ開始時は新しい線を作り、ドラッグ中は線を伸ばす


    this.container.on('pointerup', e => {//カーソルを離したとき
      if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
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
    // ドラッグ中は線を伸ばすだけ
    this.drawingGraphics.moveTo(lastPosition.x, lastPosition.y);//何故かこれを入れないと、座標0,0から線が伸びるバグ?が起きる,v8等にアップデートすることがあったら消してみる
    this.drawingGraphics.lineTo(x, y);
    if (this.currentLine && this.currentLine.pointer) {
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
        target.oekakiHitArea.lineStyle(10, 0x000000, 0); // 透明だが当たり判定あり
        target.oekakiHitArea.moveTo(line.pointer[0].x, line.pointer[0].y);
        for (let i = 1; i < line.pointer.length; i++) {
          target.oekakiHitArea.lineTo(line.pointer[i].x, line.pointer[i].y);
        }
        hasValidLines = true;
      }
    });

    // hitAreaを設定（線がある場合のみ）
    if (hasValidLines) {
      target.oekakiGraphics.hitArea = {
        _graphics: target.oekakiHitArea,
        contains: function (x, y) {
          return target.oekakiHitArea.containsPoint(new PIXI.Point(x, y));
        }
      };
      console.log(`${target.name || 'Room'}のお絵描きhitAreaを更新しました`);
         if (room.oekakiGraphics.hitArea) {
        console.warn(`${room.name || 'Unknown'}のお絵描きにhitAreaが設定されてます。`);
      } else {
        console.warn(`${room.name || 'Unknown'}のお絵描きにhitAreaが設定されていません。`);
      }
    } else {
      target.oekakiGraphics.hitArea = null;
      console.log(`${target.name || 'Room'}のお絵描きhitAreaをクリアしました（線がないため）`);
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

    //部屋ごとの独自処理を追加
    switch (room.name) {
      case "エントランス":
        roomSE = "other";
        overlayChat.children.forEach(child => {
          if (child instanceof PIXI.Text) {
            child.style.fill = "black";
          }
        });
        break;
      case "うちゅー":
        roomSE = "outerSpace";
        overlayChat.children.forEach(child => {
          if (child instanceof PIXI.Text) {
            child.style.fill = "white";
          }
        });
        break;
      case "星1":
        roomSE = "star1";
        overlayChat.children.forEach(child => {
          if (child instanceof PIXI.Text) {
            child.style.fill = "white";
          }
        });
        break;
    }

    this.roomPolygons.forEach(obj => {
      room.container.addChild(obj.container);
      // ポリゴン可視化（必要に応じてコメントアウト）
      // drawMultiPolygonGraphics(room, polygons[obj.name] || []);
    });
  }
}






//token精製後の処理
socket.on("userInit", data => {//Tokenを受け取ったら
  //ログイン画面の描写
  loginRoom = new PIXI.Graphics();
  room = Room.getOrCreateRoom(loginRoom, "loginRoom");
  room.displayRoom();
  nameForm.userName.value = localStorage.getItem('userName');//名前を出力
  myToken = data.token;

  avaP[myToken] = new Avatar(nameForm.userName.value, myToken, localStorage.getItem('avatarAspect') || "", parseColorCode(localStorage.getItem("colorCode")) || "");
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


  // if (JSON.parse(localStorage.getItem("sleep"))) {
  //   sleepMenu.textContent = "起きる";
  // } else {
  //   sleepMenu.textContent = "寝る";
  // }

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
      console.log(log);//設定集
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





// デバッグ用：お絵描きのhitAreaを可視化
function visualizeOekakiHitArea(target, color = 0x00ff00) {
  // 既存のデバッグ表示をクリア
  if (target.debugOekakiHitAreaGraphics) {
    target.container.removeChild(target.debugOekakiHitAreaGraphics);
  }
  
  if (target.oekakiGraphics && target.oekakiGraphics.hitArea) {
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(3, color, 0.8);
    graphics.beginFill(color, 0.3);
    
    // hitAreaの内容を可視化
    if (target.oekakiHitArea) {
      // oekakiHitAreaの境界を描画
      const bounds = target.oekakiHitArea.getBounds();
      graphics.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }
    
    // 描画履歴から線を再描画（確認用）
    target.drawHistory.forEach(line => {
      if (line.type === "line" && line.pointer && line.pointer.length > 1) {
        graphics.lineStyle(1, color, 0.6);
        graphics.moveTo(line.pointer[0].x, line.pointer[0].y);
        for (let i = 1; i < line.pointer.length; i++) {
          graphics.lineTo(line.pointer[i].x, line.pointer[i].y);
        }
      }
    });
    
    graphics.endFill();
    graphics.zIndex = 1000;
    target.container.addChild(graphics);
    target.debugOekakiHitAreaGraphics = graphics;
    
    console.log(`${target.name || 'Target'}のお絵描きhitAreaを可視化しました`);
    console.log("bounds:", target.oekakiHitArea?.getBounds());
    console.log("線の数:", target.drawHistory.filter(l => l.type === "line").length);
  } else {
    console.warn(`${target.name || 'Target'}にはhitAreaがありません`);
  }
}

// デバッグ用キーコマンド
window.addEventListener('keydown', e => {
  if (e.key === 'F1' || e.keyCode === 112) { // F1 でhitArea可視化
    e.preventDefault();
    console.log("=== hitArea可視化 ===");
    
    // 部屋のお絵描きを可視化
    if (room.oekakiGraphics) {
      visualizeOekakiHitArea(room, 0x00ff00); // 緑
    }
    
    // アバターのお絵描きも可視化
    Object.values(avaP).forEach((avatar, index) => {
      if (avatar.drawHistory && avatar.drawHistory.length > 0) {
        const colors = [0xff0000, 0x0000ff, 0xffff00, 0xff00ff]; // 赤、青、黄、マゼンタ
        visualizeOekakiHitArea(avatar, colors[index % colors.length]);
      }
    });
  }

  if (e.key === 'F2' && e.ctrlKey) { // Ctrl+F2 でhitArea詳細情報
    console.log("=== hitArea詳細情報 ===");
    
    // 部屋のお絵描き情報
    console.log("【部屋のお絵描き】");
    console.log("drawHistory長さ:", room.drawHistory?.length || 0);
    console.log("oekakiGraphics:", !!room.oekakiGraphics);
    console.log("hitArea:", !!room.oekakiGraphics?.hitArea);
    if (room.oekakiHitArea) {
      console.log("oekakiHitArea bounds:", room.oekakiHitArea.getBounds());
    }
    
    // アバターのお絵描き情報
    Object.values(avaP).forEach(avatar => {
      if (avatar.drawHistory && avatar.drawHistory.length > 0) {
        console.log(`【${avatar.name}のお絵描き】`);
        console.log("drawHistory長さ:", avatar.drawHistory.length);
        console.log("oekakiGraphics:", !!avatar.oekakiGraphics);
        console.log("hitArea:", !!avatar.oekakiGraphics?.hitArea);
        if (avatar.oekakiHitArea) {
          console.log("oekakiHitArea bounds:", avatar.oekakiHitArea.getBounds());
        }
      }
    });
  }
}, { passive: true });

  console.log("gomanecoW0のポリゴンデータ:", polygons["gomanecoW0"]);
  console.log("gomanecoS0のポリゴンデータ:", polygons["gomanecoS0"]);

  // 比較して違いを確認
  if (polygons["gomanecoW0"] && polygons["gomanecoS0"]) {
    console.log("W0のポイント数:", polygons["gomanecoW0"][0].length);
    console.log("S0のポイント数:", polygons["gomanecoS0"][0].length);
  }

  // アバターのhitAreaを可視化する関数
  function visualizeAvatarHitAreas(avatar) {
    // 既存のデバッグ表示をクリア
    if (avatar.debugHitAreaGraphics) {
      avatar.container.removeChild(avatar.debugHitAreaGraphics);
    }

    const graphics = new PIXI.Graphics();
    graphics.zIndex = 1000; // 最前面に表示

    // 各方向のスプライトのhitAreaを可視化
    const directions = ['avaS', 'avaN', 'avaE', 'avaW', 'avaSE', 'avaSW', 'avaNE', 'avaNW'];
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500, 0x800080];

    directions.forEach((direction, index) => {
      const sprite = avatar[direction];
      if (sprite && sprite.hitArea) {
        graphics.lineStyle(2, colors[index], 1);
        graphics.beginFill(colors[index], 0.2);

        if (sprite.hitArea instanceof PIXI.Polygon) {
          graphics.drawPolygon(sprite.hitArea.points);
          console.log(`${avatar.name}の${direction}のhitArea:`, sprite.hitArea.points);
        }

        graphics.endFill();
      }
    });

    avatar.container.addChild(graphics);
    avatar.debugHitAreaGraphics = graphics;
  }

  // 現在表示中のスプライトのhitAreaのみを可視化（複数ポリゴン対応）
  function visualizeCurrentSpriteHitArea(avatar) {
    // 既存のデバッグ表示をクリア
    if (avatar.debugCurrentHitAreaGraphics) {
      avatar.container.removeChild(avatar.debugCurrentHitAreaGraphics);
    }

    const currentSprite = avatar.avaC;
    if (currentSprite && currentSprite.hitArea) {
      const graphics = new PIXI.Graphics();

      // 複数ポリゴンの場合
      if (currentSprite.hitArea._polygons && Array.isArray(currentSprite.hitArea._polygons)) {
        currentSprite.hitArea._polygons.forEach((polygon, index) => {
          const color = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff][index % 5];
          graphics.lineStyle(2, color, 1);
          graphics.beginFill(color, 0.2);
          graphics.drawPolygon(polygon.points);
          graphics.endFill();
        });
        console.log(`${avatar.name}の現在のスプライト複数hitArea: ${currentSprite.hitArea._polygons.length}個のポリゴン`);
      }
      // 単一ポリゴンの場合
      else if (currentSprite.hitArea instanceof PIXI.Polygon) {
        graphics.lineStyle(3, 0x00ff00, 1);
        graphics.beginFill(0xff0000, 0.3);
        graphics.drawPolygon(currentSprite.hitArea.points);
        graphics.endFill();
        console.log(`${avatar.name}の現在のスプライト単一hitArea:`, currentSprite.hitArea.points);
      }

      graphics.zIndex = 1001;
      avatar.container.addChild(graphics);
      avatar.debugCurrentHitAreaGraphics = graphics;
    }
  }

  // 特定の方向のhitAreaを詳細確認
  function debugSpecificDirection(avatar, direction) {
    const sprite = avatar[direction];
    if (!sprite) {
      console.log(`${direction}スプライトが存在しません`);
      return;
    }

    if (!sprite.hitArea) {
      console.log(`${direction}のhitAreaが設定されていません`);
      return;
    }

    console.log(`=== ${avatar.name}の${direction}詳細情報 ===`);
    console.log("スプライトサイズ:", sprite.width, "x", sprite.height);
    console.log("hitAreaタイプ:", sprite.hitArea.constructor.name);

    if (sprite.hitArea instanceof PIXI.Polygon) {
      console.log("ポイント数:", sprite.hitArea.points.length / 2);
      console.log("ポイント:", sprite.hitArea.points);

      // 範囲計算
      const points = sprite.hitArea.points;
      let minX = points[0], maxX = points[0];
      let minY = points[1], maxY = points[1];

      for (let i = 0; i < points.length; i += 2) {
        minX = Math.min(minX, points[i]);
        maxX = Math.max(maxX, points[i]);
        minY = Math.min(minY, points[i + 1]);
        maxY = Math.max(maxY, points[i + 1]);
      }

      console.log(`範囲: X(${minX} to ${maxX}), Y(${minY} to ${maxY})`);
      console.log(`サイズ: ${maxX - minX} x ${maxY - minY}`);
    }
  }

  // デバッグ用のキーイベントを追加
  window.addEventListener('keydown', e => {
    if (e.key === 'v' && e.ctrlKey) { // Ctrl+V で可視化
      visualizeAvatarHitAreas(avaP[myToken]);
    }
    if (e.key === 'c' && e.ctrlKey) { // Ctrl+C で現在のスプライトのみ可視化
      visualizeCurrentSpriteHitArea(avaP[myToken]);
    }
    if (e.key === 'w' && e.altlKey) { // Ctrl+W でW方向の詳細確認
      debugSpecificDirection(avaP[myToken], 'avaW');
    }
  }, { passive: true });

  // 右クリックメニューにデバッグオプションを追加
  function addDebugMenuToContextMenu() {
    const debugButton = document.createElement('div');
    debugButton.textContent = 'hitArea可視化';
    debugButton.style.padding = '5px';
    debugButton.style.cursor = 'pointer';
    debugButton.addEventListener('pointerdown', e => {
      const token = contextMenu.dataset.token;
      if (avaP[token]) {
        visualizeCurrentSpriteHitArea(avaP[token]);
      }
      contextMenu.style.display = "none";
    });

    contextMenu.appendChild(debugButton);
  }

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
    // }
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




    app.stage.removeChild(room.container);//移動前の部屋を消す
    room = Room.getOrCreateRoom(entrance, "エントランス", ["standable"]);
    room.displayRoom();

    socket.emit("joineRoom", {//エントランスに入る
      userName: avaP[myToken].name,//ユーザーネーム
      avatarAspect: avaP[myToken].avatarAspect,
      avatarColor: avaP[myToken].avatarColor,
      avatarAlpha: avaP[myToken].avatarAlpha,
      drawHistory: avaP[myToken].drawHistory || [],
      toRoom: "エントランス",
    });


    //フォームを切り替える
    nameForm.style.display = "none";
    msgForm.style.display = "block";
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
  app.stage.removeChild(room.container);//移動前の部屋を消す
  switch (toSpot) {
    //部屋の指定
    case "entranceCloud2":
    case "entranceCloud1":
      room = Room.getOrCreateRoom(entrance, "エントランス", ["standable"]);
      break;
    case "outerSpaceMainSpot":
      room = Room.getOrCreateRoom(outerSpace, "うちゅー", ["standable"]);
      break;
    case "star1EntrySpot":
      room = Room.getOrCreateRoom(star1, "星1", ["standable"]);
      break;
  }
  room.displayRoom();


  socket.emit("joineRoom", {
    toRoom: room.name,
    toSpot: toSpot,
    train: train,
  });
}


//自分が入室時の処理
socket.on("joineRoom", data => {
  socket.emit("mediaButton", {
    type: "callMediaStatus",
  });

  outputChatMsg(data.announce, false, false, true);//移動時のメッセージ出力
  avatarOekakiToken = false;

  if (data.fromRoom === "loginRoom") {//自分のログイン時
    //ユーザー名ををローカルストレージに保存
    localStorage.setItem("avatarUserName", data.user[myToken].userName);
    //トリップに合わせてnameTagの大きさを変更
    avaP[myToken].nameTag.clear();
    avaP[myToken].nameText.text = data.user[myToken].userName;

    avaP[myToken].nameText.position.set(-avaP[myToken].nameText.width / 2, -avaP[myToken].avaC.height - 10 - avaP[myToken].nameText.height / 2);
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
          timeShade: data.user[value].timeShade
        });
        roomMemberToken.push(value);
      }
    }
  });


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
  }
  switchDrawing();
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
    random: data.random
  });
  roomMemberToken.push(data.token);
  usersNumber.textContent = room.container.children.filter(child => child.token).length;//部屋人数の表記を変える

  outputChatMsg(data.announce, false, false, true);//移動時のメッセージ出力
  // //こっからは入室時のみあればいい//確認
  // if (avaP[data.token].roomIn > 1) {//バックグラウンド復帰時に指示を出す
  //   console.log("バックグラウンド復帰");
  //   tappedMove(data.token, data.AX, data.AY, data.DIR);
  // }
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
  outputChatMsg(data.announce, false, false, true);
  if (avatarOekakiToken === data.token) {
    avatarOekakiToken = false;
    switchDrawing();//部屋用お絵描きに切り替える
  }
  stopConnection(data.token);

  //部屋ごとの独自処理を追加
  if (room.name === "星1") {
    let star1Blur = 0;
    let star1BlurFlag = true;
    star1Loop();

    function star1Loop() {
      let filter = new PIXI.filters.BlurFilter();
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
        }
      }
      filter.blur = star1Blur;
      room.container.filters = [filter];
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


  outputChatMsg(data.msg, false, false, true);//移動時のメッセージ出力
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

function entranceBlock() {//エントランスで障害物に当たった時の設定
  iniColPoint(bonfireBlockX);//colPointを初期化
  checkColPoint(bonfireBlockX, bonfireBlockY);//bonfireのcolPointを調べる
  iniColPoint(daikokubasiraBottomBlockX);//colPointを初期化
  checkColPoint(daikokubasiraBottomBlockX, daikokubasiraBottomBlockY);//daikokubasiraBlockBottomのcolPointを調べる
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

function checkColPoint(BX, BY) { //(collisionPointの略)
  //移動前の点と移動後の点との直線で、最も近い物体の交点を求める
  for (let i = 0; i < BX.length - 1; i++) {//このままだと壁に対して完全に平行な移動をしようとしたときに,colPoint.LXかLYがinfinityになって動かないってバグがあるな、どうすっかな

    //まず、移動前と移動後を結ぶ直線とそれぞれの物体の辺を横切る直線との交点を全て得る
    colPoint[i].LX = ((BY[i + 1] - AY) * (MX - AX) * (BX[i] - BX[i + 1])
      - BX[i + 1] * (BY[i] - BY[i + 1]) * (MX - AX)
      + AX * (MY - AY) * (BX[i] - BX[i + 1]))
      / ((MY - AY) * (BX[i] - BX[i + 1])
        - (BY[i] - BY[i + 1]) * (MX - AX));
    colPoint[i].LY = (BY[i + 1] * (MY - AY) * (BX[i] - BX[i + 1])
      + (MY - AY) * (AX - BX[i + 1]) * (BY[i] - BY[i + 1])
      - AY * (BY[i] - BY[i + 1]) * (MX - AX))
      / ((MY - AY) * (BX[i] - BX[i + 1])
        - (BY[i] - BY[i + 1]) * (MX - AX));
    //移動前の点から移動後の点への直線に物体との交点があるかどうかで絞り込む
    if (
      //辺の直線との交点が道中にあるかどうか、
      ((MX < colPoint[i].LX && colPoint[i].LX < AX) || (AX < colPoint[i].LX && colPoint[i].LX < MX))
      &&
      //交点が物体の辺のＸ座標の間に収まってるかどうか
      ((BX[i] <= colPoint[i].LX && colPoint[i].LX <= BX[i + 1]) || (BX[i + 1] <= colPoint[i].LX && colPoint[i].LX <= BX[i]))
      &&
      //交点が物体の辺のＹ座標の間に収まってるかどうか
      ((BY[i] <= colPoint[i].LY && colPoint[i].LY <= BY[i + 1]) || (BY[i + 1] <= colPoint[i].LY && colPoint[i].LY <= BY[i]))) {
      //交点の物体の辺の端点を配列に登録する
      colPoint[i].TX = BX[i];
      colPoint[i].TY = BY[i];
      colPoint[i].PX = BX[i + 1];
      colPoint[i].PY = BY[i + 1];

      // それぞれの点の物体との距離の2乗を算出する ※大きさを比較するだけなので、2乗のままでおｋ
      colPoint[i].distance = Math.pow((colPoint[i].LX - AX), 2) + Math.pow((colPoint[i].LY - AY), 2);
      //衝突点を配列に纏める
      colPointAll.push(colPoint[i]);
    }
  }
}

function stageMove(value) {//部屋でのアバターの移動処理
  value.eventMode = 'static';//クリックイベントを有効化
  value.on('pointerdown', e => {
    if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
    MX = e.data.getLocalPosition(value).x;
    MY = e.data.getLocalPosition(value).y;
    if (AX != MX || AY != MY) {//同一点以外なら移動する
      let sin = (MY - AY) / Math.sqrt(Math.pow(MX - AX, 2) + Math.pow(MY - AY, 2));
      // 方向に合わせて画像を変えて表示
      let moveDIR;
      if (sin <= -0.9239) {
        moveDIR = "N";
        if (avaP[myToken].sit !== "sit") {
          DIR = "N";
        }
      } else if (0.9239 <= sin) {
        moveDIR = "S";
        if (avaP[myToken].sit !== "sit") {
          DIR = "S";
        }
      } else if (0.3827 <= sin && AX < MX) {
        moveDIR = "SE";
        if (avaP[myToken].sit !== "sit") {
          DIR = "SE";
        }
      } else if (0.3827 <= sin && MX < AX) {
        moveDIR = "SW";
        if (avaP[myToken].sit !== "sit") {
          DIR = "SW";
        }
      } else if (sin <= -0.3827 && AX < MX) {
        moveDIR = "NE";
        if (avaP[myToken].sit !== "sit") {
          DIR = "NE";
        }
      } else if (sin <= -0.3827 && MX < AX) {
        moveDIR = "NW";
        if (avaP[myToken].sit !== "sit") {
          DIR = "NW";
        }
      } else if (AX < MX) {
        moveDIR = "E";
        if (avaP[myToken].sit !== "sit") {
          DIR = "E";
        }
      } else if (MX < AX) {
        moveDIR = "W";
        if (avaP[myToken].sit !== "sit") {
          DIR = "W";
        }
      }
      if (room.name === "エントランス") {
        entranceBlock();
      }//別の部屋の場合でつき足す!!!!!!!!!!!!

      if (colPointAll[0] == undefined) {//どこにもぶつからなかった場合//パターン１
        AX = MX;
        AY = MY;

      } else {
        //distanceが最小値順になるようにcolPointAllを並び変える   
        colPointAll.sort(function (a, b) {
          if (a.distance > b.distance) {
            return 1;
          } else {
            return -1;
          }
        });
        //衝突時の動き//ブロックと交わる場合//パターン２
        if (colPointAll[0].TX < colPointAll[0].PX && colPointAll[0].PY < colPointAll[0].TY) {//右下に向かう時
          colMove(colPointAll[0], -1, -1);
        } else if (colPointAll[0].PX < colPointAll[0].TX && colPointAll[0].PY < colPointAll[0].TY) {//右上に向かう時
          colMove(colPointAll[0], -1, 1);
        } else if (colPointAll[0].TX < colPointAll[0].PX && colPointAll[0].TY < colPointAll[0].PY) {//左下に向かう時
          colMove(colPointAll[0], 1, -1);
        } else if (colPointAll[0].PX < colPointAll[0].TX && colPointAll[0].TY < colPointAll[0].PY) {//左上に向かう時
          colMove(colPointAll[0], 1, 1);
        } else {//物体に対して平行に移動する場合(どこにもぶつからない)
          AX = MX;
          AY = MY;
        }
      }
      avaP[myToken].tappedMove(AX, AY, DIR, avaP[myToken].sit);
      if (room.name !== "loginRoom") {
        socket.emit("tapMap", {
          DIR: DIR,
          AX: AX,
          AY: AY,
          sit: avaP[myToken].sit,
        });
      }
      // 初期化
      colPointAll = [];
    }
    // document.msgForm.msg.focus();
  });
};


//ブロックと衝突時の動きの式,
function colMove(CPA, stopX, stopY) {//CPAはcolPointALLの略、stopXとstopYはブロックの手前で止まってもらうための数字,バグ防止
  //交点に位置に移動する
  AX = CPA.LX + stopX;
  AY = CPA.LY + stopY;
}


//移動時のソケット受け取り//自分以外の時にだけ使ってる
socket.on("tapMap", data => {
  if (!avaP[data.token].abon) {//アボンされてない場合のみ処理を実行
    avaP[data.token].tappedMove(data.AX, data.AY, data.DIR, data.sit);
  }
});


//看板機能
let isDownedShift = false;
msgForm.addEventListener("keydown", e => {
  isDownedShift = e.shiftKey;
}, { passive: true });
msgForm.addEventListener("keyup", e => {
  isDownedShift = e.shiftKey;
}, { passive: true });



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
  }
  msgForm.msg.focus();//メッセージ入力欄にフォーカスを合わせる
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



async function outputChatMsg(outputMessage, color, thisToken, announce) {//移動時のメッセージ出力
  if (!outputMessage) return;//空メッセージは処理しない
  const li = document.createElement("li");
  li.classList.add("flexContainer");
  if (color) {
    li.style.color = color;
  }
  if (announce) {//アナウンスstyleの設定
    li.style.fontSize = localStorage.getItem("fontSize") + "px";
    li.style.color = "rgb(208,110,197)";
    fontSizeSelecter.onchange = (e) => {
      localStorage.setItem("fontSize", e.target.value);
      mainLog.style.fontSize = e.target.value + "px";
      li.style.fontSize = localStorage.getItem("fontSize") + "px";
    }
  }



  if (thisToken) {
    //アイコンの表示
    // チャット表示時
    const aspect = avaP[thisToken].avatarAspect;
    const color = avaP[thisToken].avatarColor || 0xffffff;
    const iconDataURL = await getAvatarIconDataURL(aspect, color);

    const img = document.createElement("img");
    img.src = iconDataURL;
    let fontSize = 18; // デフォルト値
    if (li.style.fontSize) {
      fontSize = parseInt(li.style.fontSize, 10);
    } else if (mainLog.style.fontSize) {
      fontSize = parseInt(mainLog.style.fontSize, 10);
    }
    img.height = fontSize - 5;
    li.appendChild(img);



    // 発言したテキストをクリックした時アボンする
    li.className = thisToken;//アボンクラスを付与
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
      }
    }, { passive: true });
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


  for (let i = 0; i < split.length; i++) {
    pre[i] = document.createElement("a");//すごいてきとーな直し方してるよなあ、これ
    if (allLength + split[i].length > maxLength) {
      pre[i].textContent = split[i].slice(0, maxLength - allLength) + "...(省略されました。全てを読むにはわっふるわっふると書き込んでください。)";
      li.appendChild(pre[i]);
      waffleEventNum++;
      msgForm.addEventListener("submit", waffle), { passive: true };
      break;
    } else {
      pre[i].textContent = split[i];
      li.appendChild(pre[i]);
      allLength += pre[i].textContent.length;
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

      //メッセージを出力
      if (window.innerWidth > 660 && mainLog.scrollHeight <= mainLog.clientHeight + mainLog.scrollTop + 1) {//windowWidthが660以上の時（PC表示）かつスクロールバーが一番下にある時にスクロールバーを自動移動
        mainLogUl.replaceChild(liAll, li); //すげ替え。
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

  //メッセージを出力
  if (window.innerWidth > 660 && mainLog.scrollHeight <= mainLog.clientHeight + mainLog.scrollTop + 1) {//windowWidthが660以上の時かつスクロールバーが一番下にある時にスクロールバーを自動移動
    mainLogUl.insertBefore(li, logs.querySelectorAll("li")[li.length]);
    mainLog.scrollTop = mainLog.scrollHeight;
  } else {
    mainLogUl.insertBefore(li, logs.querySelectorAll("li")[li.length]);
  }



  if (outputMessage.length > 200) {
    outputMessage = outputMessage.slice(0, 200) + "...";
  }





  //オーバーレイチャットの表示
  // overlayChat.text = outputMessage + "\n" + overlayChat.text;
  //既存のテキストを下にずらす
  const offsetY = 18; // テキストを下にずらす量
  overlayChat.children.forEach(child => {
    child.y += offsetY; // TextもSpriteもまとめて下にずらす
  });

  if (thisToken) {
    const iconSprite = new PIXI.Sprite(avaP[thisToken].icon); // TextureからSpriteを生成
    iconSprite.width = 18; // アイコンサイズ調整
    iconSprite.height = 18;
    iconSprite.x = 0;
    iconSprite.y = 0;
    iconSprite.tint = avaP[thisToken].avatarColor || 0xffffff; // アバターの色を反映

    overlayChat.addChild(iconSprite);

    // テキスト
    const text = new PIXI.Text(outputMessage, overlayChatStyle);
    text.x = iconSprite.width; // アイコンの右にテキスト
    text.y = 0;
    overlayChat.addChild(text);
  } else {
    // テキストのみ
    const text = new PIXI.Text(outputMessage, overlayChatStyle);
    text.x = 0;
    text.y = 0;
    overlayChat.addChild(text);
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


wa_i.style.backgroundColor = "red";
wa_i.addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  e.preventDefault(); // テキスト選択やドラッグ開始を防ぐ
  clickedWa_iButtun = !clickedWa_iButtun;
  wa_i.style.backgroundColor = clickedWa_iButtun ? 'skyblue' : 'red';
});



//お絵描き用のシステム
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
    const target = data.targetToken ? avaP[data.targetToken] : room;
    const line = data.line;
    target.drawHistory.push(line);

    if (line.type === "line" && line.pointer.length > 0) {
      target.oekakiGraphics.lineStyle(2, line.color, line.alpha);
      target.oekakiGraphics.moveTo(line.pointer[0].x, line.pointer[0].y);
      for (let i = 1; i < line.pointer.length; i++) {
        target.oekakiGraphics.lineTo(line.pointer[i].x, line.pointer[i].y);
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
    target.oekakiGraphics.lineStyle(2, line.color, line.alpha);
    target.oekakiGraphics.moveTo(line.pointer[0].x, line.pointer[0].y);
    for (let i = 1; i < line.pointer.length; i++) {
      target.oekakiGraphics.lineTo(line.pointer[i].x, line.pointer[i].y);
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

}

// お絵描きモード切り替え（アバター/部屋）＆ボタン状態更新
function switchDrawing(avatarDraw) {
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
  console.log(data.msg);
});

//メッセージを受け取って表示
socket.on("emit_msg", data => {
  if (data.token) {
    if (avaP[data.token].abon) return;//アボンされてない場合のみ処理を実行
    if (data.msg !== "") {　//未入力メッセージじゃなければ

      outputChatMsg(data.userName + ":" + data.msg, "black", data.token);
      if (data.msg.length > 40) {//長すぎる場合は短くする
        data.msg = data.msg.slice(0, 40) + "...";
      }
      if (data.carryOver) {//ログ残しなら
        avaP[data.token].msg.style.fill = "0x1e90ff";
        avaP[data.token].msg.eventMode = 'static';
      } else {
        avaP[data.token].msg.style.fill = "white";
        avaP[data.token].msg.eventMode = 'static';
      }
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
  let button = [];
  for (let i = 0; i < data.trainList.length; i++) {
    console.log(data.trainList[i]);
    button[i] = document.createElement("button");
    button[i].textContent = data.trainList[i];
    button[i].style.backgroundColor = "rgb(255,165,0)";
    button[i].addEventListener('pointerdown', e => {
      if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
      e.preventDefault(); // テキスト選択やドラッグ開始を防ぐ
      switch (data.roomNameList[i]) {
        case "エントランス":
          goSelfToRoomSpot("entranceCloud1", "train");
          break;
        case "うちゅー":
          goSelfToRoomSpot("outerSpaceMainSpot", "train");
          break;
        case "星1":
          goSelfToRoomSpot("star1EntrySpot", "train");
          break;
      }
    });
    li.appendChild(button[i]);
  }

  //メッセージを出力
  if (window.innerWidth > 660 && mainLog.scrollHeight <= mainLog.clientHeight + mainLog.scrollTop + 1) {//windowWidthが660以上の時かつスクロールバーが一番下にある時にスクロールバーを自動移動
    mainLogUl.insertBefore(li, logs.querySelectorAll("li")[li.length]);
    mainLog.scrollTop = mainLog.scrollHeight;
  } else {
    mainLogUl.insertBefore(li, logs.querySelectorAll("li")[li.length]);
  }
});//socket.on("train");

//リスト
socket.on("list", data => {
  const li = document.createElement("li");
  li.classList.add("flexContainer");
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
      console.log("abon解除");
      avaP[data.token].msg.style.fill = "white";
      avaP[data.token].container.x = data.AX;
      avaP[data.token].container.y = data.AY;
      avaP[data.token].container.removeChild(avaP[data.token].avaC);

      switch (data.DIR) {
        case "N":
          avaP[data.token].avaC = avaP[data.token].avaN;
          break;
        case "NE":
          avaP[data.token].avaC = avaP[data.token].avaNE;
          break;
        case "E":
          avaP[data.token].avaC = avaP[data.token].avaE;
          break;
        case "SE":
          avaP[data.token].avaC = avaP[data.token].avaSE;
          break;
        case "S":
          avaP[data.token].avaC = avaP[data.token].avaS;
          break;
        case "SW":
          avaP[data.token].avaC = avaP[data.token].avaSW;
          break;
        case "W":
          avaP[data.token].avaC = avaP[data.token].avaW;
          break;
        case "NW":
          avaP[data.token].avaC = avaP[data.token].avaNW;
          break;
      }
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

function debugMode(message) {
  if (document.getElementById("debugCheck").checked) {
    outputChatMsg(message, "rgb(212, 4, 4)");
  }
}

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
  // クリック位置を取得（roomオブジェクトのローカル座標）
  const pos = e.data.getLocalPosition(room.container);
  const winWidth = window.innerWidth;

  // メニューのtop位置のオフセットを計算
  let topOffset;
  if (winWidth > 870) {
    // PC表示時はtitleBarの高さを取得
    topOffset = parseInt(window.getComputedStyle(titleBar).getPropertyValue('height'));
  } else {
    // スマホ表示時はformの高さを取得
    topOffset = parseInt(window.getComputedStyle(form).getPropertyValue('height'));
  }

  // PC表示 or スマホ左側 or スマホ右側で位置を調整
  if (winWidth > 870) {
    // PC表示：そのままの位置
    contextMenu.style.left = pos.x + "px";
    contextMenu.style.top = (pos.y + topOffset) + "px";
  } else if (pos.x < 540) {
    // スマホ左側：そのままの位置
    contextMenu.style.left = pos.x + "px";
    contextMenu.style.top = (pos.y + topOffset) + "px";
  } else {
    // スマホ右側：左にメニューの幅分ずらす
    contextMenu.style.left = (pos.x - contextMenu.offsetWidth) + "px";
    contextMenu.style.top = (pos.y + topOffset) + "px";
  }
  if (avaP[myToken].avatarAspect == "gomaneco" || avaP[myToken].avatarAspect == "gomanecoMono") {
    sleepMenu.style.display = "block";
  } else {
    sleepMenu.style.display = "none";
  }
}


//座る時
sitMenu.addEventListener('pointerdown', e => {
  if (!(e.button === 0 || ['touch', 'pen'].includes(e.pointerType))) return;
  if (sleepMenu.textContent === "起きる") {//寝てる時に座ろうとしたら起きる
    sleepMenu.textContent = "寝る";
    avaP[myToken].sleep = false;
    socket.emit("sleep", {});
  }
  if (sitMenu.textContent === "座る") {
    sitMenu.textContent = "立つ";
    avaP[myToken].sit = true;
    avaP[myToken].container.removeChild(avaP[myToken].avaC);
    avaP[myToken].avaC = avaP[myToken].avaSit;
    avaP[myToken].container.addChild(avaP[myToken].avaC);
    localStorage.setItem("sit", true);
  } else {
    sitMenu.textContent = "座る";
    DIR = "S";
    avaP[myToken].sit = false;
    avaP[myToken].tappedMove(AX, AY, "S");
    localStorage.setItem("sit", false);
  }
  socket.emit("tapMap", {
    DIR: DIR,
    AX: AX,
    AY: AY,
    sit: avaP[myToken].sit,
  });
  contextMenu.style.display = "none";
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


//設定
function settingClick() {
  if (setting.style.display === "block") {
    document.getElementById("setting").style.display = "none";
  } else {
    document.getElementById("setting").style.display = "block";
  }
}



// Pくん
function clickPkun() {
  pkun.classList.add('moved');
  console.log("プロ街&飴ちゃん");
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

  } else {//870以上の時
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
    console.log(selectVideoSize2Num.value);
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
        if (!videoArray[key].fixFlag) {
          allWidth += containerH / orgR[key];
          remain += containerH / orgR[key];
        } else {
          allWidth += videoArray[key].clientWidth;
          used += videoArray[key].clientWidth;
        }
      });

      Object.keys(videoArray).forEach(function (key) {//人の要素の高さを変更
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
            console.log(key);
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
            console.log(key);
            console.log(videoArray[key].clientWidth);
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
// var userAgent = window.navigator.userAgent.toLowerCase();
// if (userAgent.indexOf('msie') != -1 ||
//   userAgent.indexOf('trident') != -1) {
//   console.log('Internet Explorerをお使いですね');
// }
// else if (userAgent.indexOf('edge') != -1) {
//     console.log('Edgeをお使いですね');
// } else if(userAgent.indexOf('chrome') != -1) {
//     console.log('Google Chromeをお使いですね');
// } else if(userAgent.indexOf('safari') != -1) {
//     console.log('Safariをお使いですね');
// } else if(userAgent.indexOf('firefox') != -1) {
//     console.log('FireFoxをお使いですね');
// } else if(userAgent.indexOf('opera') != -1) {
//     console.log('Operaをお使いですね');
// } else {
//     console.log('そんなブラウザは知らん');
// }

//video/audioButtonはボタンがあるかどうか(配信が聞ける状態かどうか)
//video/audioButtonFlagはボタンを押してる状態かどうか
//remote/Videos/Audiosはパネルが出てるかどうか

// _assert('mediaContainer', mediaContainer);//ナニコレ？？？？？　とりま消してみる
// --- prefix -----
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia || navigator.msGetUserMedia;
RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;


// ----- use socket.io ---
// let getRoom = getRoomName();
// socket.on('connect', function (evt) {
//   socket.emit('enter', getRoom);
// });

// // -- room名を取得 --
// function getRoomName() { // たとえば、 URLに  ?roomname  とする
//   let url = document.location.href;
//   let args = url.split('?');
//   if (args.length > 1) {
//     let getRoom = args[1];
//     if (getRoom != '') {
//       return getRoom;
//     }
//   }
//   return '_testroom';
// }

socket.on("stream", data => {
  outputChatMsg(data.msg, "green", data.token, true);
});


// ソケットIOで "mediaButton" イベントを受信した時の処理
socket.on("mediaButton", data => {
  // デバッグ用に内容を表示
  console.log("mediaButton:", data);

  // 送信元IDを取得
  let fromToken = data.from;

  // メディア状態の問い合わせ（部屋入室時など）
  if (data.type === 'callMediaStatus') {
    // 動画配信中ならボタン作成通知
    if (videoStatus) {
      socket.emit("mediaButton", { type: 'createVideoButton', });
    }
    // 音声配信中ならボタン作成通知
    if (audioStatus) {
      socket.emit("mediaButton", { type: 'createAudioButton', });
    }
  }
  // 動画受信ボタンの作成要求
  else if (data.type === 'createVideoButton') {
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
  console.log("webRtcSignal:", data);

  // 送信元IDを取得
  let fromToken = data.from;
  // 動画接続要求
  if (data.type === 'call video') {
    if (!canConnectMore()) {
      // 接続数が多すぎる場合は無視
      console.warn('TOO MANY connections, so ignore');
      debugMode("接続数が多すぎる");
    }
    else if (!localStream) {
      // ローカルストリームが無い場合は無視
      console.log("NO localStream");
      debugMode("NO localStream");
    }
    else if (peerConnections[fromToken]) {
      // 既に接続済みなら無視
      console.log('already connected, so ignore');
      debugMode("already connected, so ignore");
    }
    else {
      // 新規接続（動画のみ）
      console.log("connect video");
      debugMode("connect video");
      makeOffer(fromToken, true, false);
    }
  }
  // 音声接続要求
  else if (data.type === 'call audio') {
    if (!canConnectMore()) {
      console.warn('TOO MANY connections, so ignore');
      debugMode("接続数が多すぎる");
    }
    else if (!localStream) {
      console.log("NO localStream");
      debugMode("NO localStream");
    }
    if (peerConnections[fromToken]) {
      console.log('already connected, so ignore');
      debugMode("already connected, so ignore");
    }
    else {
      // 新規接続（音声のみ）
      console.log("connect audio");
      debugMode("connect audio");
      makeOffer(fromToken, false, true);
    }
  }
  // 動画＋音声接続要求
  else if (data.type === 'call video and audio') {
    if (!canConnectMore()) {
      console.warn('TOO MANY connections, so ignore');
      debugMode("接続数が多すぎる");
    }
    else if (!localStream) {
      console.log("NO localStream");
      debugMode("NO localStream");
    }
    if (peerConnections[fromToken]) {
      console.log('already connected, so ignore');
      debugMode("already connected, so ignore");
    }
    else {
      // 新規接続（動画＋音声）
      console.log("connect video and audio");
      debugMode("connect video and audio");
      makeOffer(fromToken, true, true);
    }
  }
  // WebRTCのOffer受信時
  else if (data.type === 'offer') {
    console.log('Received offer ...');
    debugMode("Received offer ...");
    let offer = new RTCSessionDescription(data);
    setOffer(fromToken, offer);
  }
  // WebRTCのAnswer受信時
  else if (data.type === 'answer') {
    console.log('Received answer ...');
    debugMode("Received answer ...");
    let answer = new RTCSessionDescription(data);
    setAnswer(fromToken, answer);
  }
  // ICE Candidate受信時
  else if (data.type === 'candidate') {
    console.log('Received ICE candidate ...');
    debugMode("Received ICE candidate ...");
    let candidate = new RTCIceCandidate(data.ice);
    console.log(candidate);
    debugMode(candidate);
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
    // }
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
    console.log("close peerConnection:" + fromToken);
    let peer = peerConnections[fromToken];
    peer.close();
    delete peerConnections[fromToken];
    console.log(peerConnections)
  }
  // mapPeerからも削除
  if (mapPeer.get(fromToken)) {
    mapPeer.delete(fromToken);
    console.log(mapPeer);
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
  console.log(fromToken);
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
  videoResize();
}

function detachAudio(token) {//remoteAudioの削除
  // mediaContainer.removeChild(document.getElementById('remote_audio_' + token));//しばらく消してみて様子見、
  delete remoteAudios[token];
}

// ---------------------- media handling ----------------------- 
function startVideo() {
  if (videoStatus) {
    return;
  }
  let camera = {}
  switch (phoneCameraSelect.phoneCamera.value) {
    default:
      camera = { ideal: "environment" };//できれば外側カメラを使う
      break;
    case "environment":
      camera = { exact: "environment" };//外側カメラを使う
      break;
    case "user":
      camera = { exact: "user" }//前面カメラを使う
      break;
  }

  videoStatus = {
    facingMode: camera,//カメラの種類を設定
    // width: { max: 320 },
    // height: { max: 180 }
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
      socket.emit("mediaButton", { type: 'createVideoButton', });
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
      debugMode('getUserMedia error:' + error);
      console.error('getUserMedia error:', error);

      return;
    });
}

function startAudio() {
  if (audioStatus) {
    return;
  }
  audioStatus = true;
  getDeviceStream({
    audio: audioStatus
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
    debugMode('getUserMedia error:' + error);
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
  // }
  tracks.forEach(function (track) {//IE対応
    track.stop();
  });
}

function getDeviceStream(option) {
  if ('getUserMedia' in navigator.mediaDevices) {
    console.log('navigator.mediaDevices.getUserMadia');
    return navigator.mediaDevices.getUserMedia(option);
  }
  else {
    console.log('wrap navigator.getUserMadia with Promise');
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
          console.log("onAddTrackVideo");
        }
        else if (trackOnAdd.kind === 'audio') {
          console.log("onAddTrackAudio");
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
          // }
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
    console.log("ontrackが無い");
    debugMode("必要な関数がないから管理人に使ってるブラウザを報告する");
  }

  // --- on get local ICE candidate
  peer.onicecandidate = function (evt) {
    if (evt.candidate) {
      console.log(evt.candidate);
      debugMode(evt.candidate);

      // Trickle ICE の場合は、ICE candidateを相手に送る

      if (!isDataChannelOpen(peer)) {   // チャット前
        // ICE candidateをサーバーを経由して相手に送信
        console.log("- Send ICE candidate to server");
        sendIceCandidate(fromToken, evt.candidate);
      } else {   // チャット中
        // ICE candidateをDataChannelを通して相手に直接送信
        console.log("- Send ICE candidate through DataChannel");
        peer.datachannel.send(JSON.stringify({ type: "candidate", data: evt.candidate }));
      }

      // Vanilla ICE の場合には、何もしない
    } else {
      console.log('empty ice event');
    }
  };

  // --- when need to exchange SDP ---
  peer.onnegotiationneeded = function (evt) {
    console.log('-- onnegotiationneeded() ---');
    if (!isDataChannelOpen(peer)) {

    } else {
      peer.createOffer()
        .then(function (sessionDescription) {
          return peer.setLocalDescription(sessionDescription);//これでSDPを覚える
        }).then(() => {
          // 初期OfferSDPをDataChannelを通して相手に直接送信
          console.log("- Send OfferSDP through DataChannel");
          peer.datachannel.send(JSON.stringify({ type: "offer", data: peer.localDescription }));
        }).catch(function (err) {
          console.error(err);
          debugMode(err);
        });
    }
  };

  // --- other events ----
  // peer.onicecandidateerror = function (evt) {
  //   console.error('ICE candidate ERROR:', evt);
  //   if (evt.errorCode >= 300 && evt.errorCode <= 699) {
  //     // STUN errors are in the range 300-699. See RFC 5389, section 15.6
  //     // for a list of codes. TURN adds a few more error codes; see
  //     // RFC 5766, section 15 for details.
  //   } else if (evt.errorCode >= 660 && evt.errorCode <= 799) {
  //     // Server could not be reached; a specific error number is
  //     // provided but these are not yet specified.
  //   }
  // };

  peer.onsignalingstatechange = () => {
    console.log('== signaling status=' + peer.signalingState);
    debugMode('== signaling status=' + peer.signalingState);
  };

  peer.oniceconnectionstatechange = () => {
    console.log('== ice connection status=' + peer.iceConnectionState);
    if (peer.iceConnectionState === 'disconnected') {
      console.log('-- disconnected --');
      stopConnection(fromToken);//相手が切断したときにこちらも切断する

      debugMode('-- disconnected --');
    }
  };

  peer.onicegatheringstatechange = () => {
    console.log('==***== ice gathering state=' + peer.iceGatheringState);
    debugMode('==***== ice gathering state=' + peer.iceGatheringState);
  };

  // peer.onconnectionstatechange = () => {//firefoxに対応してないので使わない
  //   console.log('==***== connection state=' + peer.connectionState);
  // };

  // Data channel イベントが発生したときのイベントハンドラ
  // - このイベントは、createDataChannel() を呼び出すリモートピアによって
  //   RTCDataChannelが接続に追加されたときに送信されます。
  //   see : https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ondatachannel
  peer.ondatachannel = (event) => {
    // console.log("Event : Data channel");；
    // DataChannelオブジェクトをRTCPeerConnectionオブジェクトのメンバーに追加。
    peer.datachannel = event.channel;
    // DataChannelオブジェクトのイベントハンドラの構築
    console.log("Call : setupDataChannelEventHandler()");
    setupDataChannelEventHandler(peer);
    peer.createOffer()
      .then(function (sessionDescription) {
        return peer.setLocalDescription(sessionDescription);//これでSDPを覚える
      }).then(() => {
        // 初期OfferSDPをDataChannelを通して相手に直接送信
        console.log("- Send OfferSDP through DataChannel");
        peer.datachannel.send(JSON.stringify({ type: "offer", data: peer.localDescription, token: fromToken }));
      }).catch(function (err) {
        console.error(err);
        debugMode(err);
      });
  };


  return peer;
}///// prepareNewConnection

// DataChannelオブジェクトのイベントハンドラの構築
function setupDataChannelEventHandler(rtcPeerConnection) {
  if (!("datachannel" in rtcPeerConnection)) {
    console.error("Unexpected : DataChannel does not exist.");
    debugMode("Unexpected : DataChannel does not exist.");
    return;
  }

  // message イベントが発生したときのイベントハンドラ
  rtcPeerConnection.datachannel.onmessage = (event) => {//datachanelの受信
    console.log("DataChannel Event : message");
    let objData = JSON.parse(event.data);
    console.log("- type : ", objData.type);
    debugMode(objData.type);
    console.log("- data : ", objData.data);
    debugMode(objData.date);

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
      console.log("Call : rtcPeerConnection.addIceCandidate()");
      rtcPeerConnection.addIceCandidate(objData.data)
        .catch(function (error) {
          console.error("Error : ", error);
          debugMode("Error : ", error);
        });
    }
    else if ("call video" === objData.type) {
      console.log("今からvideo接続");
      if (videoStatus) {
        console.log("video接続");
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
      console.log("今からaudio接続");
      if (audioStatus) {
        console.log("audio接続");
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
      console.log("今からvideoとaudio接続");
      if (videoStatus) {
        console.log("videoとaudio接続");
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
  }
}


// function onsubmitButton_SendMessage() {//使えない,ボタンに設定すれば、接続中独自のデータの送受信が可能//https://www.hiramine.com/programming/videochat_webrtc/11_data_channel.html
//   console.log("UI Event : 'Send Message' button clicked.");

//   if (!g_rtcPeerConnection) {   // コネクションオブジェクトがない
//     alert("Connection object does not exist.");
//     return;
//   }
//   if (!isDataChannelOpen(g_rtcPeerConnection)) {   // DataChannelオブジェクトが開いていない
//     alert("Datachannel is not open.");
//     return;
//   }

//   if (!g_elementTextMessageForSend.value) {
//     alert("Message for send is empty. Please enter the message for send.");
//     return;
//   }

//   // メッセージをDataChannelを通して相手に直接送信
//   console.log("- Send Message through DataChannel");
//   g_rtcPeerConnection.datachannel.send(JSON.stringify({ type: "message", data: g_elementTextMessageForSend.value }));

//   // 送信メッセージをメッセージテキストエリアへ追加
//   g_elementTextareaMessageReceived.value = g_elementTextMessageForSend.value + "\n" + g_elementTextareaMessageReceived.value; // 一番上に追加
//   //g_elementTextareaMessageReceived.value += g_elementTextMessageForSend.value + "\n"; // 一番下に追加
//   g_elementTextMessageForSend.value = "";
// }

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
    console.log('Adding local stream...');
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
  console.log("Call : setupDataChannelEven tHandler()");
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
      debugMode(err);
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
        debugMode('peerConnection NOT exist!');
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
          debugMode(err);
        });
    }).catch(function (err) {
      console.error('setRemoteDescription(offer) ERROR: ', err);
      debugMode('setRemoteDescription(offer) ERROR: ' + err)
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
          debugMode(err);
        });
    });
}


function setAnswer(fromToken, sessionDescription) {//message.type === 'answer'の時使う
  let peerConnection = peerConnections[fromToken];
  if (!peerConnection) {
    console.error('peerConnection NOT exist!');
    debugMode('peerConnection NOT exist!');
    return;
  }

  peerConnection.setRemoteDescription(sessionDescription)
    .then(() => {
      console.log('setRemoteDescription(answer) succsess in promise');
    }).catch((err) => {
      console.error('setRemoteDescription(answer) ERROR: ', err);
      debugMode('setRemoteDescription(answer) ERROR: ' + err);
    });
}

// AnswerSDPの設定//dateChannel用,後で整理したほうがいいかな
function setAnswerDataChannel(rtcPeerConnection, sessionDescription) {
  console.log("Call : rtcPeerConnection.setRemoteDescription()");
  rtcPeerConnection.setRemoteDescription(sessionDescription)
    .catch((error) => {
      console.error("Error : ", error);
      debugMode("Error : " + error);

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
    debugMode('PeerConnection not exist!');
    return;
  }
}


// start PeerConnection
function mediaConnect(fromToken, type) {
  if (!canConnectMore()) {
    console.log('TOO MANY connections');
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



// this.vadobject = null;

// function startVoiceDetection(stream,update) {
//     // window.AudioContext = window.AudioContext;
//     let audioContext = new AudioContext();
//     let vadOptions = {
//         onVoiceStart: function() {
//             console.log('voice start');
//         },
//         onVoiceStop: function() {
//             console.log('voice stop');
//         },
//         onUpdate: function(val) {
//             // 音声が検出されると発火
//             update(val);
//         }
//     };
//     // streamオブジェクトの音声検出を開始
//     this.vadobject = vad(audioContext,stream,vadOptions);
// }

// function stopVoiceDetection(){
//     if(this.vadobject){
//         // 音声検出を終了する
//         this.vadobject.destroy();
//     }
// }

//、Ｂって文字列が含まれてたら
// let regexp = /、b|、ｂ/i;
// if (regexp.test(msgText)) {
//   msgText += "　ちゃりーｎ、りーん";
// }