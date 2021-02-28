'use strict';



//大雑把に目次
//変数宣言等
//フォント切り替え※後で消すからこの位置

//webGL(PIXIJS)の設定開始
//画像読み込み
//setUp()・・・画像切り取り、画像設定、座標表示設定、submit設定、gameLoop();
//socket.on("myToken"
//ブロックの配置、タップやアニメの設定、クッキー読み込み、看板機能
//login()・・・名前出力、クッキー書き込み、ログイン画面消去、エントランスの設定、座標関連、フォーム切り替え、changeRoomPoint()
//部屋移動・・changeRoomPoint()、socket.on("leave_room"、socket.on("join_me"、socket.on("join_room")、outputMsg()//移動時のメッセージ
// メッセージ関連・・・socket.on("emit_msg"、アボン処理
//socket.on("myToken"、socket.on("login_me"、socket.on("loadAvatar")
//ログアウト処理
//function gameLoop()

//再起動用メッセージ
//背景色を変える、画面リサイズの処理
//Ｐくｎ
//右クリックメニュー
//配信関係

//ソケットIOをonにする
let port = 3000;
let socket;
if (location.hostname == "localhost") {
  socket = io.connect('http://localhost:' + port + '');
} else {
  socket = io.connect('https://nuco.moe:' + port + '/');
}

let setUpFlag = [];


//アバターの初期位置
let AX = 300;
let AY = 200;
let DIR = "S";

let userName;

let token;

let avaP = [];

//ここ配列にしたほうが良いかいな
let avaS = [], avaSW = [], avaW = [], avaNW = [], avaN = [], avaNE = [], avaE = [], avaSE = [];
let avaS1 = [], avaSW1 = [], avaW1 = [], avaNW1 = [], avaN1 = [], avaNE1 = [], avaE1 = [], avaSE1 = [];
let avaS2 = [], avaSW2 = [], avaW2 = [], avaNW2 = [], avaN2 = [], avaNE2 = [], avaE2 = [], avaSE2 = [];
let avaSit = [];
let avaSleep0 = [], avaSleep1 = [], avaSleep2 = [], avaSleep3 = [];
let avaAbon = [];

let avaC = {};
let nameText = [];
let nameTag = [];
let hukidashi = [];
let msg = [];

let colPoint = [];
let colPointAll = [];
let LX, LY, distace, TX, TY, PX, PY, wall, MX, MY;
let wallCount = 0;



let AtextX, AtextY, MtextX, MtextY;
let nameTextX = -30;
let nameTextY = -105;
let inRoom = 0;

let room = "login";
let roomSE;
let loginBack;
let entrance, ground, croud, bonfire;
let daikokubasira;

let utyu;



let gomaneco = {};
let gomanecoMono = {};
let necosuke = {};
let necosukeMono = {};

let moveX, moveY;
let moveX1, moveY1;
let moveX2, moveY2;
let moveX3, moveY3;
let rightY, leftY;

let tapFlag = false;
let setAbon = [];
let setAbonID = [];

const callbackId = [];
const sleepFlag = [];

let waffleEventNum = 0;


let muon = new Audio('sound/etc/muon.mp3');
muon.autoplay = true;
muon.setAttribute('playsinline', '');
//ログ音
let msgSE = {};
msgSE.login = {};
msgSE.login.in = [];
msgSE.login.in[0] = new Audio('sound/login/tirin1.mp3');
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


msgSE.utyu = {};
msgSE.utyu.in = [];
msgSE.utyu.log = [];
msgSE.utyu.out = [];
msgSE.utyu.logout = [];
msgSE.utyu.in[0] = new Audio('sound/utyuIn/se_maoudamashii_system11.mp3');
msgSE.utyu.in[1] = new Audio('sound/utyuIn/se_maoudamashii_system13.mp3');
msgSE.utyu.out[0] = new Audio('sound/utyuOut/se_maoudamashii_se_sound10.mp3');
msgSE.utyu.out[1] = new Audio('sound/utyuOut/se_maoudamashii_system33.mp3');
msgSE.utyu.logout[0] = new Audio('sound/utyuLogout/se_maoudamashii_onepoint31.mp3');
msgSE.utyu.logout[1] = new Audio('sound/utyuLogout/se_maoudamashii_system32.mp3');


//お絵かき
let oekaki = [];
let isDownCtrl = false;
let clickedWa_iButtun = false;
let pointDown = false;
let lastPosition = { x: null, y: null };
let oekakityu = false;
let oekakiNum = [];
let oekakiColor = 0xffffff;
let oekakiAlpha = 1;





//エイリアス
let html = document.querySelector('html');
let body = document.querySelector('body');
let mainFrame = document.getElementById("mainFrame");
let main = document.getElementById("main");
let canvas = document.querySelector('canvas');
let titleBar = document.getElementById("titleBar");
let title = document.getElementById("title");
let Pmachi = document.getElementById("Pmachi");
let Pmain = document.getElementById("Pmain");
let loginButton = document.getElementById("loginButton");
let graphic = document.getElementById("graphic");
// let fontSousenkyo = document.getElementById("fontSousenkyo");
let chatLog = document.getElementById("chatLog");
let footer = document.getElementById("footer");
let kousinrireki = document.getElementById("kousinrireki");
let day = document.getElementById('day');
let form = document.getElementById('form');
let nameForm = document.getElementById('nameForm');
let msgForm = document.getElementById('msgForm');
let usersDisplay = document.getElementById('usersDisplay');
let usersNumber = document.getElementById('usersNumber');
let visibleLogButton = document.getElementById('visibleLogButton');
let logs = document.getElementById('logs');
let logNoiseButton = document.getElementById('logNoiseButton');
let pastLog = document.getElementById('pastLog');
let wa_i = document.getElementById('wa_i');
let clear = document.getElementById('clear');
let effectVolume = document.getElementById('effectVolume');
let sizeSelecter = document.getElementById("sizeSelecter");
let fontSizeSelecter = document.getElementById("fontSizeSelecter");
let muonAudio = document.getElementById("muonAudio");
let chatLogUl = document.getElementById("chatLog").querySelector("ul")
let phoneCameraSelect = document.getElementById("phoneCameraSelect");

let PMsize;

//ここはフォント総選挙消したときに消していい
let chatFont = document.getElementById("chatFont");
let titleFont = document.getElementById("titleFont");
let nameTextFont = document.getElementById("nameTextFont");
let sonotaFont = document.getElementById("sonotaFont");



//日付
let date = new Date().toLocaleString();
day.innerHTML = date;

//フォントを切り替える
let fontName;
let obj;
let index;
let fontSize;
let titleFontFamily = ["鉄瓶ゴシック", "kosugiMaru", "チカラヅヨク", "チカラヨワク", "まるっかな", "M+フォント", "源界明朝", "にゃしぃフォント改二", "PixelMplus", "めもわーるしかく"];

let loginMX;
let loginMY;




//配信機能
let localVideo = document.getElementById('local_video');
let localAudio = document.getElementById('local_audio');

let localStream = null;//自分のとこのメディア情報
let localVideoTrack;//自分のとこのメディア情報
let localAudioTrack;//自分のとこのメディア情報

let videoStatus = false;
let audioStatus = false;
let roomStream;

let mapPeer = new Map();

let mediaElement = [];
let distributor = [];
let videoButton = [];
let audioButton = [];
let audioVolume = [];
let videoButtonFlag = [];
let audioButtonFlag = [];;
let checkAllListen;

let peerConnections = [];
//let remoteStreams = [];
let remoteVideos = [];
let remoteAudios = [];
const MAX_CONNECTION_COUNT = 50;//最大接続数？？

let container = document.getElementById('container');





document.addEventListener('click', audioPlay, {
  capture: false,
  once: true,
  passive: true,
});
function audioPlay() {
  document.getElementById("muonAudio").play();
  document.removeEventListener('click', audioPlay);
}

title.style.fontFamily = titleFontFamily[Math.floor(Math.random() * titleFontFamily.length)];
// title.style.fontSize = fontSize + 37 + "px";








// nameTextFont.options[1].selected = true;//選択位置を変更
// chatFont.options[2].selected = true;
// // titleFont.options[8].selected = true;
// sonotaFont.options[2].selected = true;
// function fontChange(value) {
//   switch (value) {
//     case "chatLog":
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
//     case "chatLog":
//       chatLog.style.fontFamily = fontName, "游ゴシック", "Yu Gothic", "MS ゴシック", 'メイリオ', 'Meiryo', "monospace";
//       chatLog.style.fontSize = fontSize + "px";
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
//       pastLog.style.fontFamily = fontName;
//       logNoiseButton.style.fontFamily = fontName;
//       clear.style.fontFamily = fontName;
//       wa_i.style.fontFamily = fontName;
//       visibleLogButton.style.fontFamily = fontName;
//       break;
//     case "nameText":
//       nameText[token].style = {
//         fontFamily: fontName,
//         fontSize: 18,
//         fill: "white",
//         trim: true,
//       }
//       break;
//   }
// };


//webGL(Canvasの設定)
let app = new PIXI.Application({
  width: 660,
  height: 460,
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


// レンダラーのviewをDOMに追加する
graphic.appendChild(app.view);
app.stage.sortableChildren = true;//子要素のzIndexをonにする。

PIXI.Loader.shared//画像を読みこんでから処理を始める為のローダー、画像はそのうち１つか２つの画像に纏めたい
  .add("all", "img/allgraphics.png")
  .add("sound0", "sound/login/tirin1.mp3")
  .on("progress", loadProgressHandler)//プログラミングローダー
  .load(setUp);//画像読み込み後の処理は基本ここに書いてく


//プログラミングのローダー確認
function loadProgressHandler(Loader, resources) {
  // console.log("loading"+resources.url);
  // console.log("loading:"+resources.name);
  console.log("progress" + Loader.progress + "%");
  debugMode("progress" + Loader.progress + "%");
}

//背景の画像を追加
//ログイン画面
let loginBackRect = new PIXI.Rectangle(0, 0, 660, 480);
loginBack = new PIXI.Graphics();
loginBack.beginFill(0X4C4C52);
loginBack.drawShape(loginBackRect);
loginBack.endFill();

//スマホで画面に表示するテキスト
let gamenLogStyle = {
  fontSize: 18,
  wordWrap: true,
  wordWrapWidth: 500,
  breakWords: true
};
let gamenLog = new PIXI.Text("", gamenLogStyle);



let tyui = new PIXI.Text("※一応トリップ使えるけど、流出対策はあんましてないです");
tyui.zIndex = 0;
tyui.position.set(0, 464);
tyui.style.fontSize = 16;
tyui.style.fill = "red";
loginBack.addChild(tyui);


function setUp() {//画像読み込み後の処理はここに書いていく
  // app.renderer.autoResize = true;//なんかこいつが非推奨ってでるから↓のに書き換えたが、そもそもこれ必要なんか？機能してるんか？ようわからｎ
  app.renderer.autoDensity = true;

  //アバターのベース画像を作る※Rectangleをぴったり同じ大きさの画像に使ったらバグるので注意
  gomaneco.S = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 40, 39, 70));
  gomaneco.S1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 110, 39, 70));

  gomaneco.SW = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 180, 39, 70));
  gomaneco.SW1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 250, 39, 70));
  gomaneco.SW2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 320, 39, 70));

  gomaneco.W = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 390, 39, 70));
  gomaneco.W1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 460, 39, 70));
  gomaneco.W2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 530, 39, 70));

  gomaneco.NW = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 600, 39, 70));
  gomaneco.NW1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 670, 39, 70));
  gomaneco.NW2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 740, 39, 70));

  gomaneco.N = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 810, 39, 70));
  gomaneco.N1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 880, 39, 70));

  gomaneco.sit = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 950, 39, 70));

  gomaneco.Sleep0 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 1021, 39, 70));
  gomaneco.Sleep1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 1091, 39, 70));
  gomaneco.Sleep2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 1161, 39, 70));
  gomaneco.Sleep3 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 1231, 39, 70));


  gomanecoMono.S = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1362, 40, 39, 70));
  gomanecoMono.S1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1362, 110, 39, 70));

  gomanecoMono.SW = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1362, 180, 39, 70));
  gomanecoMono.SW1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1362, 250, 39, 70));
  gomanecoMono.SW2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1362, 320, 39, 70));

  gomanecoMono.W = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1362, 390, 39, 70));
  gomanecoMono.W1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1362, 460, 39, 70));
  gomanecoMono.W2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1362, 530, 39, 70));

  gomanecoMono.NW = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1362, 600, 39, 70));
  gomanecoMono.NW1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1362, 670, 39, 70));
  gomanecoMono.NW2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1362, 740, 39, 70));

  gomanecoMono.N = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1362, 810, 39, 70));
  gomanecoMono.N1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1362, 880, 39, 70));

  gomanecoMono.sit = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1362, 950, 40, 69));

  gomanecoMono.Sleep0 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 1021, 39, 70));
  gomanecoMono.Sleep1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 1091, 39, 70));
  gomanecoMono.Sleep2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 1161, 39, 70));
  gomanecoMono.Sleep3 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 1231, 39, 70));




  necosuke.S = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1402, 40, 49, 80));
  necosuke.S1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1402, 120, 49, 80));


  necosuke.SW = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1402, 200, 49, 80));
  necosuke.SW1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1402, 280, 49, 80));
  necosuke.SW2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1402, 360, 49, 80));

  necosuke.W = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1402, 440, 49, 80));
  necosuke.W1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1402, 520, 49, 80));
  necosuke.W2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1402, 600, 49, 80));

  necosuke.NW = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1402, 680, 49, 80));
  necosuke.NW1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1402, 760, 49, 80));
  necosuke.NW2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1402, 840, 49, 80));

  necosuke.N = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1402, 920, 49, 80));
  necosuke.N1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1402, 1000, 49, 80));

  necosuke.sit = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1402, 1080, 49, 80));


  necosukeMono.S = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1449, 40, 49, 80));
  necosukeMono.S1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1449, 120, 49, 80));

  necosukeMono.SW = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1449, 200, 49, 80));
  necosukeMono.SW1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1449, 280, 49, 80));
  necosukeMono.SW2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1449, 360, 49, 80));

  necosukeMono.W = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1449, 440, 49, 80));
  necosukeMono.W1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1449, 520, 49, 80));
  necosukeMono.W2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1449, 600, 49, 80));

  necosukeMono.NW = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1449, 680, 49, 80));
  necosukeMono.NW1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1449, 760, 49, 80));
  necosukeMono.NW2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1449, 840, 49, 80));

  necosukeMono.N = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1449, 920, 49, 80));
  necosukeMono.N1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1449, 1000, 49, 80));

  necosukeMono.sit = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1449, 1080, 49, 80));

  gomaneco.Face = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1321, 0, 40, 40));
  necosuke.Face = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1401, 0, 40, 40));


  avaAbon = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1500, 0, 40, 70));



  //login画面をクリックできるようにする
  loginBack.sortableChildren = true;//子要素のzIndexをonにする。
  app.stage.addChild(loginBack);//画像を読みこむ
  tapRange(loginBack);




  //エントランス画面
  entrance = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(660, 0, 660, 480));
  ground = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(0, 0, 660, 480));
  croud = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(0, 480, 660, 200));
  bonfire = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(0, 680, 660, 280));
  daikokubasira = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1500, 70, 50, 100));
  //宇宙画面
  utyu = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(660, 480, 660, 480));


  socket.emit("getMyUser", {});//サーバーに入ったことを伝える


  // 座標確認用のオブジェクトの表示
  // アバターX座標の表示設定
  AtextX = new PIXI.Text("avaX");
  AtextX.style = {//アバターX座標のスタイル
    fontFamily: "serif",
    fontSize: "12px",
    fill: "blue",
  }
  ///アバターX座標の位置
  AtextX.position.set(560, 400);
  AtextX.zIndex = 10;

  //アバターY座標の表示設定
  AtextY = new PIXI.Text("avaY");
  AtextY.style = {//アバターY座標のスタイル
    fontFamily: "serif",
    fontSize: "12px",
    fill: "blue",
  }
  //アバターY座標の位置
  AtextY.position.set(560, 415);
  AtextY.zIndex = 10;


  //マウスX座標の表示設定
  MtextX = new PIXI.Text("mouX");
  MtextX.style = {//マウスX座標のスタイル
    fontFamily: "serif",
    fontSize: "12px",
    fill: "red",
  }
  //マウスX座標の位置
  MtextX.position.set(560, 430);
  MtextX.zIndex = 10;

  //マウスY座標の表示位置設定
  MtextY = new PIXI.Text("mouY");
  MtextY.style = {//マウスY座標のスタイル
    fontFamily: "serif",
    fontSize: "12px",
    fill: "red",
  }
  //マウスY座標の位置
  MtextY.position.set(560, 445);
  MtextY.zIndex = 10;




  //セッション開始時に入力欄にフォーカスを合わせる
  document.querySelector('input').focus();
  //名前を出力、名前がsubmitされたらログイン
  nameForm.addEventListener("submit", function (e) {
    nameText[token].text = (nameForm.userName.value);//名前タグに出力
    e.preventDefault();//画面遷移を防ぐ
    login();
  }, {
    capture: false,
    once: true,
    passive: true,
  });



  // マウス座標を表示
  app.stage.addChild(MtextX);
  app.stage.addChild(MtextY);
  app.stage.addChild(AtextX);
  app.stage.addChild(AtextY);

  gameLoop();
  setUpFlag[0] = true;

}//function setUpはここで終わり

function setAvatar(thisToken, thisAvatar, thisWidth) {
  avaS[thisToken] = new PIXI.Sprite(thisAvatar.S);
  avaS1[thisToken] = new PIXI.Sprite(thisAvatar.S1);
  avaS2[thisToken] = new PIXI.Sprite(thisAvatar.S1);
  avaS2[thisToken].width = -thisWidth;
  avaSW[thisToken] = new PIXI.Sprite(thisAvatar.SW);
  avaSW1[thisToken] = new PIXI.Sprite(thisAvatar.SW1);
  avaSW2[thisToken] = new PIXI.Sprite(thisAvatar.SW2);
  avaW[thisToken] = new PIXI.Sprite(thisAvatar.W);
  avaW1[thisToken] = new PIXI.Sprite(thisAvatar.W1);
  avaW2[thisToken] = new PIXI.Sprite(thisAvatar.W2);
  avaNW[thisToken] = new PIXI.Sprite(thisAvatar.NW);
  avaNW1[thisToken] = new PIXI.Sprite(thisAvatar.NW1);
  avaNW2[thisToken] = new PIXI.Sprite(thisAvatar.NW2);
  avaN[thisToken] = new PIXI.Sprite(thisAvatar.N);
  avaN1[thisToken] = new PIXI.Sprite(thisAvatar.N1);
  avaN2[thisToken] = new PIXI.Sprite(thisAvatar.N1);
  avaN2[thisToken].width = -thisWidth;

  avaNE[thisToken] = new PIXI.Sprite(thisAvatar.NW);
  avaNE[thisToken].width = -thisWidth;
  avaNE1[thisToken] = new PIXI.Sprite(thisAvatar.NW1);
  avaNE1[thisToken].width = -thisWidth;
  avaNE2[thisToken] = new PIXI.Sprite(thisAvatar.NW2);
  avaNE2[thisToken].width = -thisWidth;
  avaE[thisToken] = new PIXI.Sprite(thisAvatar.W);
  avaE[thisToken].width = -thisWidth;
  avaE1[thisToken] = new PIXI.Sprite(thisAvatar.W1);
  avaE1[thisToken].width = -thisWidth;
  avaE2[thisToken] = new PIXI.Sprite(thisAvatar.W2);
  avaE2[thisToken].width = -thisWidth;
  avaSE[thisToken] = new PIXI.Sprite(thisAvatar.SW);
  avaSE[thisToken].width = -thisWidth;
  avaSE1[thisToken] = new PIXI.Sprite(thisAvatar.SW1);
  avaSE1[thisToken].width = -thisWidth;
  avaSE2[thisToken] = new PIXI.Sprite(thisAvatar.SW2);
  avaSE2[thisToken].width = -thisWidth;

  avaSit[thisToken] = new PIXI.Sprite(thisAvatar.sit);

  avaSleep0[thisToken] = new PIXI.Sprite(thisAvatar.Sleep0);
  avaSleep1[thisToken] = new PIXI.Sprite(thisAvatar.Sleep1);
  avaSleep2[thisToken] = new PIXI.Sprite(thisAvatar.Sleep2);
  avaSleep3[thisToken] = new PIXI.Sprite(thisAvatar.Sleep3);

  avaS[thisToken].anchor.set(0.5, 1);
  avaS1[thisToken].anchor.set(0.5, 1);
  avaS2[thisToken].anchor.set(0.5, 1);
  avaSW[thisToken].anchor.set(0.5, 1);
  avaSW1[thisToken].anchor.set(0.5, 1);
  avaSW2[thisToken].anchor.set(0.5, 1);
  avaW[thisToken].anchor.set(0.5, 1);
  avaW1[thisToken].anchor.set(0.5, 1);
  avaW2[thisToken].anchor.set(0.5, 1);
  avaNW[thisToken].anchor.set(0.5, 1);
  avaNW1[thisToken].anchor.set(0.5, 1);
  avaNW2[thisToken].anchor.set(0.5, 1);
  avaN[thisToken].anchor.set(0.5, 1);
  avaN1[thisToken].anchor.set(0.5, 1);
  avaN2[thisToken].anchor.set(0.5, 1);
  avaNE[thisToken].anchor.set(0.5, 1);
  avaNE1[thisToken].anchor.set(0.5, 1);
  avaNE2[thisToken].anchor.set(0.5, 1);
  avaE[thisToken].anchor.set(0.5, 1);
  avaE1[thisToken].anchor.set(0.5, 1);
  avaE2[thisToken].anchor.set(0.5, 1);
  avaSE[thisToken].anchor.set(0.5, 1);
  avaSE1[thisToken].anchor.set(0.5, 1);
  avaSE2[thisToken].anchor.set(0.5, 1);
  avaSit[thisToken].anchor.set(0.5, 1);
  avaSleep0[thisToken].anchor.set(0.5, 1);
  avaSleep1[thisToken].anchor.set(0.5, 1);
  avaSleep2[thisToken].anchor.set(0.5, 1);
  avaSleep3[thisToken].anchor.set(0.5, 1);
};


socket.on("myToken", function (data) {//Tokenを受け取ったら
  nameForm.userName.value = localStorage.getItem('userName');//名前を出力
  token = data.token;
  setAbon[token] = false;//sleepを動かす為に自身のsetAbonは先にfalseにしておく
  sleepFlag[token] = false;

  //アバターの親コンテナを設定
  avaP[token] = new PIXI.Container();
  avaP[token].sortableChildren = true;//子要素のzIndexをonにする
  avaP[token].position.set(320, 200);

  //画像を追加
  avaP[token].avatar = localStorage.getItem('avatar');//アバターを出力
  switch (avaP[token].avatar) {
    case "necosuke":
      console.log("ねこすけ裏設定：クールなまなざしを覗き込むと瞳の奥は燃えている　鳥のように飛べるんじゃないかと考えながら雲から飛び降りている　ごまねこが降りる様を見ると冷や汗をかいてしまう");
      avaP[token].avatar = "necosuke";
      setAvatar(token, necosuke, 50);
      break;

    case "necosukeMono":
      console.log("ねこすけ裏設定：クールなまなざしを覗き込むと瞳の奥は燃えている　鳥のように飛べるんじゃないかと考えながら雲から飛び降りている　ごまねこが降りる様を見ると冷や汗をかいてしまう");
      avaP[token].avatar = "necosukeMono";
      setAvatar(token, necosukeMono, 50);
      break;
    case "gomanecoMono":
      avaP[token].avatar = "gomanecoMono";
      setAvatar(token, gomanecoMono, 40);
      console.log("ごまねこ裏設定集：高いところが好きな高所恐怖症、飛び降りる時は少しの勇気が必要、目を開けられなくて毎回ちびっちゃう。綿あめを食べ過ぎて腹を壊した、雲を見るとたまに思い出す。");
      break;
    default:
      avaP[token].avatar = "gomaneco";
      setAvatar(token, gomaneco, 40);
      console.log("ごまねこ裏設定集：高いところが好きな高所恐怖症、飛び降りる時は少しの勇気が必要、目を開けられなくて毎回ちびっちゃう。綿あめを食べ過ぎて腹を壊した、雲を見るとたまに思い出す。");
      break;

  }


  //色設定//透明度設定
  if (localStorage.getItem("colorCode")) {
    setColor(token, localStorage.getItem("colorCode"));
    oekakiColor = localStorage.getItem("colorCode");
  } else {
    avaP[token].avatarColor = 0XFFFFFF;//(無色、白)
    oekakiColor = 0XFFFFFF;
  }

  avaP[token].avatarAlpha = 1;


  //avaPに追加
  avaC[token] = avaS[token];
  avaP[token].addChild(avaC[token]);

  //名前タグを生成
  nameText[token] = new PIXI.Text(localStorage.getItem("avatarUserName"), nameTextStyle);
  nameText[token].zIndex = 10;
  nameText[token].anchor.set(0.5);
  nameText[token].position.set(0, -avaC[token].height - 10);
  avaP[token].addChild(nameText[token]);

  nameTag[token] = new PIXI.Graphics();
  nameTag[token].lineStyle(1, 0x000000, 0.5);
  nameTag[token].beginFill(0x000000);
  nameTag[token].drawRect(0, 0, nameText[token].width, nameText[token].height);
  nameTag[token].endFill();
  nameTag[token].x = -nameText[token].width / 2;
  nameTag[token].y = -avaC[token].height - 10 - nameText[token].height / 2;
  nameTag[token].alpha = 0.3;

  avaP[token].addChild(nameTag[token]);
  //ステージに追加
  loginBack.addChild(avaP[token]);


  gomaneco.Face = new PIXI.Sprite(gomaneco.Face);
  loginBack.addChild(gomaneco.Face);//login画面にgomaNocoFaceを追加
  gomaneco.Face.interactive = true;//クリックイベントを有効化
  gomaneco.Face.pointerdown = function () {//ごまねこアイコンクリック時にアバター変更
    avaP[token].avatar = "gomaneco";//親コンテナにアバターの種類を設定する
    avaP[token].avatarColor = 0XFFFFFF;//(無色、白)
    oekakiColor = 0XFFFFFF;
    setAvatar(token, gomaneco, 40);
    nameText[token].position.set(0, -avaS[token].height - 10);
    nameTag[token].y = -avaS[token].height - 10 - nameText[token].height / 2;
    console.log("ごまねこ裏設定集：高いところが好きな高所恐怖症、飛び降りる時は少しの勇気が必要、目を開けられなくて毎回ちびっちゃう。綿あめを食べ過ぎて腹を壊した、雲を見るとたまに思い出す。");
  };

  necosuke.Face = new PIXI.Sprite(necosuke.Face);
  loginBack.addChild(necosuke.Face);//login画面にnecosukeFaceを追加
  necosuke.Face.position.set(40, 0);//位置を設定
  necosuke.Face.interactive = true;//クリックイベントを有効化
  necosuke.Face.pointerdown = function () {//ねこすけアイコンクリック時にアバター変更
    avaP[token].avatar = "necosuke";
    avaP[token].avatarColor = 0XFFFFFF;//(無色、白)
    oekakiColor = 0XFFFFFF;
    setAvatar(token, necosuke, 50);
    nameText[token].position.set(0, -avaS[token].height - 10);
    nameTag[token].y = -avaS[token].height - 10 - nameText[token].height / 2;
    localStorage.removeItem("colorCode");
    console.log("ねこすけ裏設定：クールなまなざしを覗き込むと瞳の奥は燃えている　鳥のように飛べるんじゃないかと考えながら雲から飛び降りている　ごまねこが降りる様を見ると冷や汗をかいてしまう");
  };


  let rect = new PIXI.Rectangle(0, 0, 50, 50);
  let greenyellowPalette, royalbluePalette, tealPalette, midnightbluePalette, deepskybluePalette, cyanPalette, firebrickPalette, snowPalette, blackPalette, grayPalette, darkvioletPalette;
  let usuiPinkPalette, hutuuPinkPalette, yayakoiPinkPalette, koiPinkPalette, nayakonoiroPalette, grayppoiPalette;
  setPalette(greenyellowPalette, 0Xadff2f, 0, 300);
  setPalette(firebrickPalette, 0Xb22222, 50, 300);
  setPalette(cyanPalette, 0X00ffff, 100, 300);
  setPalette(deepskybluePalette, 0X00bfff, 150, 300);
  setPalette(royalbluePalette, 0X4169e1, 200, 300);
  setPalette(darkvioletPalette, 0X9400d3, 250, 300);
  setPalette(midnightbluePalette, 0X191970, 300, 300);
  setPalette(snowPalette, 0Xfffafa, 350, 300);
  setPalette(tealPalette, 0X008080, 400, 300);
  setPalette(grayPalette, 0X808080, 450, 300);
  setPalette(blackPalette, 0X000000, 650, 300, 0X4C4C52);//黒だけパレットカラーを見えなくして実装

  setPalette(usuiPinkPalette, 0XFAC3FF, 0, 350);
  setPalette(hutuuPinkPalette, 0XE2A4E9, 50, 350);
  setPalette(yayakoiPinkPalette, 0XE2A4E9, 100, 350);
  setPalette(koiPinkPalette, 0XDB9AE1, 150, 350);
  setPalette(nayakonoiroPalette, 0XFF9696, 200, 350);
  setPalette(grayppoiPalette, 0X808080, 250, 350);


  function setPalette(colorPalette, colorCode, x, y, paletteColor) {//指定する色の名前、カラーコード、座標Ｘ、座標Ｙ、パレットそのものの色(未指定でも良い)

    colorPalette = new PIXI.Graphics();
    colorPalette.x = x;
    colorPalette.y = y;
    colorPalette.interactive = true;
    if (paletteColor) {//paletteColorの色を変更してる場合
      colorPalette.beginFill(paletteColor);
      colorPalette.zIndex = 1000;//zIndexを前に持ってくる
    } else {
      colorPalette.beginFill(colorCode);
      colorPalette.zIndex = -1;//zIndexをアバター以下にする
    }
    // colorPalette.lineStyle(2, 0xff0000);
    colorPalette.drawShape(rect);
    colorPalette.endFill();
    loginBack.addChild(colorPalette);
    colorPalette.pointerdown = function () {//クリック
      if (avaP[token].avatar == "necosuke" || avaP[token].avatar == "necosukeMono") {
        avaP[token].avatar = "necosukeMono";
        setAvatar(token, necosukeMono, 50);
      }
      else {
        avaP[token].avatar = "gomanecoMono";
        setAvatar(token, gomanecoMono, 40);
      }
      setColor(token, colorCode);
      oekakiColor = colorCode;
    }
  }



  //タイトルを触った時に背景色を変えて、色を増やす
  let uiColor = 0;
  let skyblue, mikaniro, kyuiro, siniro;
  title.addEventListener("touchstart", function () {//タップの場合
    tapFlag = true;
    switch (uiColor) {
      case 0:
        body.style.backgroundColor = "skyblue";
        setPalette(skyblue, 0X87ceeb, 500, 300);
        uiColor = 1;
        break;
      case 1:
        body.style.backgroundColor = "#f68b1f";
        setPalette(mikaniro, 0Xf68b1f, 500, 350);
        uiColor = 2;
        break;
      case 2:
        body.style.backgroundColor = "#333333";
        setPalette(kyuiro, 0X333333, 500, 400);
        uiColor = 3;
        break;
      case 3:
        body.style.backgroundColor = "#32323a";
        setPalette(siniro, 0X32323a, 500, 450);
        uiColor = 0;
        break;
    }
  }, {
    passive: true,
  });
  title.addEventListener("click", function () {//クリックの場合
    if (tapFlag) {
      tapFlag = false;
    } else {
      switch (uiColor) {
        case 0:
          body.style.backgroundColor = "skyblue";
          setPalette(skyblue, 0X87ceeb, 500, 300);
          uiColor = 1;
          break;
        case 1:
          body.style.backgroundColor = "#f68b1f";
          setPalette(mikaniro, 0Xf68b1f, 500, 350);
          uiColor = 2;
          break;
        case 2:
          body.style.backgroundColor = "#333333";
          setPalette(kyuiro, 0X333333, 500, 400);
          uiColor = 3;
          break;
        case 3:
          body.style.backgroundColor = "rgb(50, 50, 58)";
          setPalette(siniro, 0X32323a, 500, 450);
          uiColor = 0;
          break;
      }
    }
  }, {
    passive: true,
  });




  //日付を触った時に半透明にする
  day.addEventListener("touchstart", function () {//タップの場合
    tapFlag = true;
    if (avaP[token].avatarAlpha == 1) {
      setAlpha(token, 0.3);
      socket.json.emit("alphaChange", {
        alpha: 0.3,
      });
    } else {
      setAlpha(token, 1);
      socket.json.emit("alphaChange", {
        alpha: 1,
      });
    }
  }, {
    passive: true,
  });
  day.addEventListener("click", function () {//クリックの場合
    if (tapFlag) {
      tapFlag = false;
    } else {
      if (avaP[token].avatarAlpha == 1) {
        setAlpha(token, 0.3);
        socket.json.emit("alphaChange", {
          alpha: 0.3,
        });
      } else {
        setAlpha(token, 1);
        socket.json.emit("alphaChange", {
          alpha: 1,
        });
      }
    }
  }, {
    passive: true,
  });

  socket.on("alphaChange", function (data) {
    setAlpha(data.token, data.alpha);
  });

  setUpFlag[1] = true;
});

function setColor(thisToken, colorCode) {//色を変える
  avaP[thisToken].avatarColor = colorCode;
  avaS[thisToken].tint = colorCode;
  avaS1[thisToken].tint = colorCode;
  avaS2[thisToken].tint = colorCode;
  avaSW[thisToken].tint = colorCode;
  avaSW1[thisToken].tint = colorCode;
  avaSW2[thisToken].tint = colorCode;
  avaW[thisToken].tint = colorCode;
  avaW1[thisToken].tint = colorCode;
  avaW2[thisToken].tint = colorCode;
  avaNW[thisToken].tint = colorCode;
  avaNW1[thisToken].tint = colorCode;
  avaNW2[thisToken].tint = colorCode;
  avaN[thisToken].tint = colorCode;
  avaN1[thisToken].tint = colorCode;
  avaN2[thisToken].tint = colorCode;
  avaNE[thisToken].tint = colorCode;
  avaNE1[thisToken].tint = colorCode;
  avaNE2[thisToken].tint = colorCode;
  avaE[thisToken].tint = colorCode;
  avaE1[thisToken].tint = colorCode;
  avaE2[thisToken].tint = colorCode;
  avaSE[thisToken].tint = colorCode;
  avaSE1[thisToken].tint = colorCode;
  avaSE2[thisToken].tint = colorCode;
  avaSit[thisToken].tint = colorCode;
  avaSleep0[thisToken].tint = colorCode;
  avaSleep1[thisToken].tint = colorCode;
  avaSleep2[thisToken].tint = colorCode;
  avaSleep3[thisToken].tint = colorCode;
}

function setAlpha(thisToken, alpha) {//透明度を変える
  avaP[thisToken].avatarAlpha = alpha;
  avaS[thisToken].alpha = alpha;
  avaS1[thisToken].alpha = alpha;
  avaS2[thisToken].alpha = alpha;
  avaSW[thisToken].alpha = alpha;
  avaSW1[thisToken].alpha = alpha;
  avaSW2[thisToken].alpha = alpha;
  avaW[thisToken].alpha = alpha;
  avaW1[thisToken].alpha = alpha;
  avaW2[thisToken].alpha = alpha;
  avaNW[thisToken].alpha = alpha;
  avaNW1[thisToken].alpha = alpha;
  avaNW2[thisToken].alpha = alpha;
  avaN[thisToken].alpha = alpha;
  avaN1[thisToken].alpha = alpha;
  avaN2[thisToken].alpha = alpha;
  avaNE[thisToken].alpha = alpha;
  avaNE1[thisToken].alpha = alpha;
  avaNE2[thisToken].alpha = alpha;
  avaE[thisToken].alpha = alpha;
  avaE1[thisToken].alpha = alpha;
  avaE2[thisToken].alpha = alpha;
  avaSE[thisToken].alpha = alpha;
  avaSE1[thisToken].alpha = alpha;
  avaSE2[thisToken].alpha = alpha;
  avaSit[thisToken].alpha = alpha;
  avaSleep0[thisToken].alpha = alpha;
  avaSleep1[thisToken].alpha = alpha;
  avaSleep2[thisToken].alpha = alpha;
  avaSleep3[thisToken].alpha = alpha;
}




function avaLoop(value) {//アバターの大きさを常に変える
  if (0 < avaP[value].y && avaP[value].y <= 180 && room == "entrance") {//エントランスにいるとき
    avaP[value].scale.x = avaP[value].y / 180;
    avaP[value].scale.y = avaP[value].y / 180;
  } else if (180 < avaP[value].y && room == "entrance") {
    avaP[value].scale.x = 1;
    avaP[value].scale.y = 1;
  }

  avaP[value].zIndex = avaP[value].y;



  requestAnimationFrame(function () { avaLoop(value) });
}



function draw(x, y) {
  if (!pointDown) {//いらんかも
    return;
  }
  oekaki[0].lineStyle(2, oekakiColor, oekakiAlpha);//これこの位置なんかなあ
  if (lastPosition.x === null || lastPosition.y === null) {
    // ドラッグ開始時の線の開始位置
    oekaki[0].moveTo(x, y);
    oekaki[0].X = [x];
    oekaki[0].Y = [y];
    oekaki[0].dataColor = [oekakiColor];
    oekaki[0].dataAlpha = [oekakiAlpha];
  } else {
    // ドラッグ中の線の開始位置
    oekaki[0].moveTo(lastPosition.x, lastPosition.y);
    oekaki[0].X.push(x);
    oekaki[0].Y.push(y);
    oekaki[0].dataColor.push(oekakiColor);
    oekaki[0].dataAlpha.push(oekakiAlpha);
  }
  oekaki[0].lineTo(x, y);
  oekaki[0].zIndex = 1000;
  app.stage.getChildByName(room).addChild(oekaki[0]);

  lastPosition.x = x;
  lastPosition.y = y;
}

socket.on("oekaki", function (data) {
  if (setAbon[data.token] == false) {//アボンされてない場合
    oekaki[room][oekakiNum[room]] = new PIXI.Graphics();
    oekaki[room][oekakiNum[room]].zIndex = 1000;
    oekaki[room][oekakiNum[room]].lineStyle(2, data.oekakiColor[0], data.oekakiAlpha[0]);
    oekaki[room][oekakiNum[room]].moveTo(data.oekakiX[0], data.oekakiY[0])
    for (let i = 1; i < data.oekakiX.length; i++) {
      // oekaki[room][oekakiNum[room]].lineStyle(2, data.oekakiColor[i],data.oekakiAlpha[i]);
      oekaki[room][oekakiNum[room]].lineTo(data.oekakiX[i], data.oekakiY[i]);
    }
    app.stage.getChildByName(room).addChild(oekaki[room][oekakiNum[room]]);
    oekakiNum[room]++;
  }
});

socket.on("clearCanvas", function (data) {
  if (setAbon[data.token] == false) {//アボンされてない場合
    for (let i = 0; i < oekaki[room].length; i++) {
      app.stage.getChildByName(room).removeChild(oekaki[room][i]);
    }
  }
});


//エントランスでタップ可能なブロックを配置
// croudBlock1配置
let croudBlock1 = new PIXI.Graphics();
croudBlock1.beginFill(0xf0f8ff);
croudBlock1.alpha = 0;//透明にする
croudBlock1.drawPolygon([
  111, 123,
  123, 113,
  133, 109,
  133, 105,
  142, 97,
  151, 97,
  151, 92,
  160, 92,
  173, 99,
  173, 113,
  185, 113,
  196, 120,
  198, 130,
  194, 130,
  194, 137,
  184, 137,
  184, 140,
  176, 140,
  176, 140,
  176, 147,
  173, 147,
  173, 147,
  171, 151,
  159, 151,
  159, 148,
  151, 148,
  145, 154,
  122, 154,
  111, 144,
]);

//croudBlock2配置
let croudBlock2 = new PIXI.Graphics();
croudBlock2.beginFill(0xf0f8ff);
croudBlock2.alpha = 0;//透明にする
croudBlock2.drawPolygon([
  421, 73,
  443, 59,
  443, 55,
  452, 47,
  461, 47,
  461, 42,
  470, 42,
  483, 49,
  483, 63,
  495, 63,
  506, 70,
  508, 80,
  504, 80,
  504, 87,
  494, 87,
  494, 90,
  486, 90,
  486, 97,
  483, 97,
  483, 97,
  481, 101,
  469, 101,
  469, 98,
  461, 98,
  455, 104,
  432, 104,
  421, 94,
]);







//groundBlock配置
let groundBlock = new PIXI.Graphics();//ブロックを置く宣言
groundBlock.beginFill(0xf0f8ff);
groundBlock.drawPolygon([
  0, 285,
  3, 285,
  23, 285,
  69, 274,
  197, 274,
  280, 268,
  302, 268,
  358, 268,
  462, 275,
  556, 275,
  660, 285,
  660, 480,
  0, 480,
]);
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

function utyuBlock() {
  //宇宙に画像を入れた時に↑のを参考に増やす
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



function tapRange(value) {
  value.interactive = true;//クリックイベントを有効化
  value.touchstart = function (event) {
    tapFlag = true;
    clickTapRange(event);
  }
  value.click = function (event) {
    if (tapFlag) {
      tapFlag = false;
    } else {
      clickTapRange(event);
    }
  }



  function clickTapRange(event) {
    MX = event.data.getLocalPosition(value).x;
    MY = event.data.getLocalPosition(value).y;

    if (AX != MX || AY != MY) {//同一点なら移動しない//パターン１
      let sin = (MY - AY) / Math.sqrt(Math.pow(MX - AX, 2) + Math.pow(MY - AY, 2));
      if (inRoom == 0) {//ログイン画面に居るとき
        if (sin <= -0.9239) {
          anime(avaN, avaN1, avaN2, token);
        } else if (0.9239 <= sin) {
          anime(avaS, avaS1, avaS2, token);
        } else if (0.3827 <= sin && AX < MX) {
          anime(avaSE, avaSE1, avaSE2, token);
        } else if (0.3827 <= sin && MX < AX) {
          anime(avaSW, avaSW1, avaSW2, token);

        } else if (sin <= -0.3827 && AX < MX) {
          anime(avaNE, avaNE1, avaNE2, token);
        } else if (sin <= -0.3827 && MX < AX) {
          anime(avaNW, avaNW1, avaNW2, token);

        } else if (AX < MX) {
          anime(avaE, avaE1, avaE2, token);
        } else if (MX < AX) {
          anime(avaW, avaW1, avaW2, token);
        }

        gsap.to(avaP[token], {
          duration: 0.4, x: MX, y: MY, onComplete: function () { moveEnd(); }
        });

        function moveEnd() {
          AX = avaP[token].x;
          AY = avaP[token].y;
        }

      } else {//ログイン画面以外に居るとき
        // 方向に合わせて画像を変えて表示
        if (sin <= -0.9239) {
          DIR = "N";
        } else if (0.9239 <= sin) {
          DIR = "S";
        } else if (0.3827 <= sin && AX < MX) {
          DIR = "SE";
        } else if (0.3827 <= sin && MX < AX) {
          DIR = "SW";
        } else if (sin <= -0.3827 && AX < MX) {
          DIR = "NE";
        } else if (sin <= -0.3827 && MX < AX) {
          DIR = "NW";
        } else if (AX < MX) {
          DIR = "E";
        } else if (MX < AX) {
          DIR = "W";
        }
        if (room == "entrance") {
          entranceBlock();
        }//別の部屋の場合でつき足す!!!!!!!!!!!!
        if (colPointAll[0] == undefined) {//どこにもぶつからなかった場合//パターン２
          AX = MX;
          AY = MY;
          tappedMove(token, AX, AY, DIR);
          socket.json.emit("tapMap", {
            DIR: DIR,
            AX: AX,
            AY: AY,
          });
        } else {//ブロックと交わる場合//パターン３
          //distanceが最小値順になるようにcolPointAllを並び変える   
          colPointAll.sort(function (a, b) {
            if (a.distance > b.distance) {
              return 1;
            } else {
              return -1;
            }
          });
          //衝突時の動き
          if (colPointAll[0].TX < colPointAll[0].PX && colPointAll[0].PY < colPointAll[0].TY) {//右下に向かう時
            colMove(colPointAll[0], -1, -1);
          } else if (colPointAll[0].PX < colPointAll[0].TX && colPointAll[0].PY < colPointAll[0].TY) {//右上に向かう時
            colMove(colPointAll[0], -1, 1);
          } else if (colPointAll[0].TX < colPointAll[0].PX && colPointAll[0].TY < colPointAll[0].PY) {//左下に向かう時
            colMove(colPointAll[0], 1, -1);
          } else if (colPointAll[0].PX < colPointAll[0].TX && colPointAll[0].TY < colPointAll[0].PY) {//左上に向かう時
            colMove(colPointAll[0], 1, 1);
          } else {//物体に対して平行に移動する場合(どこにもぶつからない)//パターン４
            AX = MX;
            AY = MY;
            tappedMove(token, AX, AY, DIR);
            socket.json.emit("tapMap", {
              DIR: DIR,
              AX: AX,
              AY: AY,
            });
          }
        }
        // 初期化
        colPointAll = [];
      }
    }
    // document.msgForm.msg.focus();
  };
}



function anime(ava0, ava1, ava2, value) {//引数：初期ava,歩いてるとき、歩いてるとき２、token
  gsap.to(avaP[value], 0, {
    delay: 0.1,
    onUpdate: function () {
      avaP[value].removeChild(avaC[value]);
      avaC[value] = ava1[value];
      avaP[value].addChild(avaC[value]);
    }
  });
  gsap.to(avaP[value], 0, {
    delay: 0.2,
    onUpdate: function () {
      avaP[value].removeChild(avaC[value]);
      avaC[value] = ava2[value];
      avaP[value].addChild(avaC[value]);
    }
  });
  gsap.to(avaP[value], 0, {
    delay: 0.3,
    onUpdate: function () {
      avaP[value].removeChild(avaC[value]);
      avaC[value] = ava1[value];
      avaP[value].addChild(avaC[value]);
    }
  });
  gsap.to(avaP[value], 0, {
    delay: 0.4,
    onUpdate: function () {
      avaP[value].removeChild(avaC[value]);
      avaC[value] = ava0[value];
      avaP[value].addChild(avaC[value]);
    }
  });
}

function colMove(CPA, stopX, stopY) {//ブロックと衝突時の動きの式,CPAはcolPointALLの略、stopXとstopYはブロックの手前で止まってもらうための数字,バグ防止
  //交点に位置に移動する
  AX = CPA.LX + stopX;
  AY = CPA.LY + stopY;
  tappedMove(token, AX, AY, DIR);
  socket.json.emit("tapMap", {
    DIR: DIR,
    AX: AX,
    AY: AY,
  });
}


//移動時のソケット受け取り//自分以外の時にだけ使ってる
socket.on("tapMap", function (data) {
  if (setAbon[data.token] == false) {//アボンされてない場合
    tappedMove(data.token, data.AX, data.AY, data.DIR);
  }
});

//数値を取得後のアバターの動き
function tappedMove(thisToken, thisAX, thisAY, thisDIR) {
  switch (thisDIR) {//子要素の画像を入れる
    case "NE":
      anime(avaNE, avaNE1, avaNE2, thisToken);
      break;
    case "SE":
      anime(avaSE, avaSE1, avaSE2, thisToken);
      break;
    case "SW":
      anime(avaSW, avaSW1, avaSW2, thisToken);
      break;
    case "NW":
      anime(avaNW, avaNW1, avaNW2, thisToken);
      break;
    case "N":
      anime(avaN, avaN1, avaN2, thisToken);
      break;
    case "E":
      anime(avaE, avaE1, avaE2, thisToken);
      break;
    case "S":
      anime(avaS, avaS1, avaS2, thisToken);
      break;
    case "sit":
      anime(avaSit, avaSit, avaSit, thisToken);
      break;
    default:
      anime(avaW, avaW1, avaW2, thisToken);
      break;
  }
  gsap.to(avaP[thisToken], {
    duration: 0.4, x: thisAX, y: thisAY, onComplete: function () {
      if (thisToken == token) {//自分自身の移動の場合
        //オブジェクトの数が増えた時はここを書き換える
        if (room == "entrance" && 125 <= AX && AX <= 175 && 200 <= AY && AY <= 300) {
          changeSelfRoom("entrance", entrance, "utyu", utyu, 200, 300, "S", "utyu", "white");
        } else if (room == "utyu" && 136 <= AX && AX <= 151 && 68 <= AY && AY <= 86) {
          changeSelfRoom("utyu", utyu, "entrance", entrance, 150, 130, "S", "other", "black");
        }
      } else {//自分以外の移動の場合
        if (avaP[thisToken].roomIn > 1) {//バックグラウンド復帰時
          switch (thisDIR) {
            case "NE":
              avaC[thisToken] = avaNE[thisToken];
              avaP[thisToken].addChild(avaC[thisToken]);
              break;
            case "SE":
              avaC[thisToken] = avaSE[thisToken];
              avaP[thisToken].addChild(avaC[thisToken]);
              break;
            case "SW":
              avaC[thisToken] = avaSW[thisToken];
              avaP[thisToken].addChild(avaC[thisToken]);
              break;
            case "NW":
              avaC[thisToken] = avaNW[thisToken];
              avaP[thisToken].addChild(avaC[thisToken]);
              break;
            case "N":
              avaC[thisToken] = avaN[thisToken];
              avaP[thisToken].addChild(avaC[thisToken]);
              break;
            case "E":
              avaC[thisToken] = avaE[thisToken];
              avaP[thisToken].addChild(avaC[thisToken]);
              break;
            case "S":
              avaC[thisToken] = avaS[thisToken];
              avaP[thisToken].addChild(avaC[thisToken]);
              break;
            case "sit":
              avaC[thisToken] = avaSit[thisToken];
              avaP[thisToken].addChild(avaC[thisToken]);
              break;
            default:
              avaC[thisToken] = avaW[thisToken];
              avaP[thisToken].addChild(avaC[thisToken]);
              break;
          }
          avaP[thisToken].position.set(thisAX, thisAY);
        }
      }
    }
  });
}

function changeSelfRoom(beforeRoomString, beforeRoom, afterRoomString, afterRoom, thisAX, thisAY, thisDIR, thisSE, logCollor) {//自分自身の部屋が変わった時
  stopAllConnection();
  if (videoStatus) {
    stopVideo();
  }
  if (audioStatus) {
    stopAudio();
  }
  if (oekaki[room]) {
    for (let i = 0; i < oekaki[room].length; i++) {
      app.stage.getChildByName(room).removeChild(oekaki[room][i]);
    }
  }
  const keys = Object.keys(avaP);//入室時の全員のソケットＩＤを取得
  keys.forEach(function (value) {//移動前の部屋のアバターを消す
    app.stage.getChildByName(room).removeChild(avaP[value]);
  });
  app.stage.removeChild(beforeRoom);//移動前の部屋を消す

  room = afterRoomString;//移動先の部屋を設定
  roomSE = thisSE;
  app.stage.addChild(afterRoom);//画像を読みこむ
  avaP[token].removeChild(avaC[token]);
  AX = thisAX;
  AY = thisAY;
  DIR = thisDIR;
  socket.json.emit("roomIn", {
    userName: userName,
    beforeRoom: beforeRoomString,
    afterRoom: afterRoomString,
    AX: AX,
    AY: AY,
    DIR: DIR,
  });
  gamenLog.style.fill = logCollor;
}







socket.on("roomInNonSelf", function (data) {//自分以外が部屋にログインor入室してきた時
  if (setAbon[data.token] == false) {//アボンされてない場合
    app.stage.getChildByName(data.room).addChild(avaP[data.token]);//部屋にアバターを入れる
    avaP[data.token].room = data.room;
    avaP[data.token].position.set(data.AX, data.AY);
    avaP[data.token].roomIn++;
    avaP[data.token].removeChild(avaC[data.token]);
    switch (data.DIR) {
      case "NE":
        avaC[data.token] = avaNE[data.token];
        avaP[data.token].addChild(avaC[data.token]);
        break;
      case "SE":
        avaC[data.token] = avaSE[data.token];
        avaP[data.token].addChild(avaC[data.token]);
        break;
      case "SW":
        avaC[data.token] = avaSW[data.token];
        avaP[data.token].addChild(avaC[data.token]);
        break;
      case "NW":
        avaC[data.token] = avaNW[data.token];
        avaP[data.token].addChild(avaC[data.token]);
        break;
      case "N":
        avaC[data.token] = avaN[data.token];
        avaP[data.token].addChild(avaC[data.token]);
        break;
      case "E":
        avaC[data.token] = avaE[data.token];
        avaP[data.token].addChild(avaC[data.token]);
        break;
      case "S":
        avaC[data.token] = avaS[data.token];
        avaP[data.token].addChild(avaC[data.token]);
        break;
      default:
        avaC[data.token] = avaW[data.token];
        avaP[data.token].addChild(avaC[data.token]);
        break;
    }

    nameText[data.token].position.set(0, -avaC[data.token].height - 10);
    nameTag[data.token].y = -avaC[data.token].height - 10 - nameText[data.token].height / 2;
    msg[data.token].position.set(0, -avaC[data.token].height - 5);

    outputMsg(data.msg);
    usersNumber.textContent = data.users;//部屋人数の表記を変える
    if (useLogChime) {//部屋入室の音を鳴らす
      let regexp = /＠ＪＭＭ連合/i;//＠ＪＭＭ連合って文字が入ってたら爆発する
      if (data.roomSE == "login" && regexp.test(data.userName)) {
        console.log("JMM連合");
        msgSE.JMMLogin.play();
      } else {
        msgSE[roomSE].in[data.random].play();
      }
    }
    if (data.sleep) {
      if (sleepFlag[data.token] == false) {
        sleepFlag[data.token] = true;
        animeSleep(data.token);
      }
    } else {
      sleepFlag[data.token] = false;
    }

    //こっからは入室時のみあればいい
    msg[data.token].text = "";
    if (avaP[data.token].roomIn > 1) {//バックグラウンド復帰時に指示を出す
      tappedMove(data.token, data.AX, data.AY, data.DIR);
    }
  }
});


socket.on("roomOutNonSelf", function (data) {//自分以外が部屋から退室した時
  if (setAbon[data.token] == false) {//アボンされてない場合
    if (useLogChime) {//ログチャイムがオンになってたら退室の音を鳴らす
      msgSE[roomSE].out[data.random].play();
    }
  }

  if (avaP[data.token].roomIn == 1) {
    app.stage.getChildByName(avaP[data.token].room).removeChild(avaP[data.token]);
    avaP[data.token].room = data.room;
  }
  avaP[data.token].roomIn--;
  usersNumber.textContent--;
  outputMsg(nameText[data.token].text + "が" + data.room + "に移動しました。");

  stopConnection(data.token);
});




//看板機能
let isDownedShift = false;
msgForm.addEventListener("keydown", function (e) {
  isDownedShift = e.shiftKey;
});
msgForm.addEventListener("keyup", function (e) {
  isDownedShift = e.shiftKey;
});

//メッセージ入力
msgForm.addEventListener("submit", function (e) {
  if (isDownedShift) {//シフトが押されてる場合
    socket.json.emit("emit_msg", {
      msg: (msgForm.msg.value),
      kanban: true,
    });
  } else {//シフトが推されてない時
    socket.json.emit("emit_msg", {
      msg: (msgForm.msg.value),
      kanban: false,
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
  "純前たる",
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
  "モイモイ!",
  "lightning",
  "マグマな",
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
nanasiName[3] = [];
for (let i = 0; i < nanasiName[1].length; i++) {
  for (let j = 0; j < nanasiName[1][i][1]; j++) {
    nanasiName[3].push(nanasiName[1][i][0]);
  }
}

nanasiName[2] = [
  ["さん", 80],
  ["ちゃん", 30],
  ["氏", 10],
  ["君", 10],
  ["卿", 5],
  ["兄さん", 5],
  ["姉さん", 5],
  ["ボーイ", 3],
  ["がーる", 3],
  ["先輩", 4],
  ["親分", 3],
  ["たん", 2],
  ["きゅん", 2],
  ["殿", 2],
  ["姫", 2],
  ["猊下", 1],
  ["閣下", 1],
  ["犬", 1],
];
nanasiName[4] = [];
for (let i = 0; i < nanasiName[2].length; i++) {
  for (let j = 0; j < nanasiName[2][i][1]; j++) {
    nanasiName[4].push(nanasiName[2][i][0]);
  }
}
//ログイン時の処理
function login() {
  //もしカメラやマイクをonにしてたら切る
  if (videoStatus) {
    stopVideo();
  }
  if (audioStatus) {
    stopAudio();
  }

  if (setUpFlag[0] && setUpFlag[1]) {
    userName = nameForm.userName.value;
    if (!userName) {
      userName = nanasiName[0][Math.floor(Math.random() * nanasiName[0].length)]
        + nanasiName[3][Math.floor(Math.random() * nanasiName[3].length)]
        + nanasiName[4][Math.floor(Math.random() * nanasiName[4].length)];
    }
    localStorage.setItem("avatar", avaP[token].avatar);//ローカルストレージにアバター書き込み
    localStorage.setItem("userName", userName);//ローカルストレージに名前書き込み
    localStorage.setItem("colorCode", avaP[token].avatarColor);

    entrance = new PIXI.Sprite(entrance);
    entrance.name = "entrance";//名前を割り振る※これをやらないとgetChildByNameメソッドが使えない
    //userNameにフォームの内容を入れる
    room = "entrance";//マップを切り替える
    roomSE = "other";
    oekaki["entrance"] = [];
    oekakiNum["entrance"] = 0;

    //ログイン画面の画像を消す
    app.stage.removeChild(loginBack);

    entrance.addChild(croudBlock1);
    tapRange(croudBlock1);
    entrance.addChild(croudBlock2);
    tapRange(croudBlock2);

    entrance.addChild(groundBlock);
    tapRange(groundBlock);

    entrance.addChild(daikokubasiraBlock);
    tapRange(daikokubasiraBlock);

    croud = new PIXI.Sprite(croud);
    entrance.addChild(croud);
    ground = new PIXI.Sprite(ground);
    entrance.addChild(ground);
    bonfire = new PIXI.Sprite(bonfire);
    bonfire.position.set(0, 200);
    bonfire.zIndex = 325;
    entrance.addChild(bonfire);

    daikokubasira = new PIXI.Sprite(daikokubasira);
    daikokubasira.anchor.set(0.5, 1);
    daikokubasira.position.set(150, 300);
    daikokubasira.zIndex = 300;
    entrance.addChild(daikokubasira);

    entrance.sortableChildren = true;//子要素のzIndexをonにする。
    app.stage.addChild(entrance);//画像を読みこむ

    //マップをここで作っておく
    utyu = new PIXI.Sprite(utyu);
    utyu.name = "utyu";//名前を割り振る
    utyu.sortableChildren = true;//子要素のzIndexをonにする。
    tapRange(utyu);

    AX = 457;//座標を切り替える
    AY = 80;



    socket.json.emit("login_room", {//エントランスに入る
      room: "entrance",
      userName: userName,//ユーザーネーム
      avatar: avaP[token].avatar,
      avatarColor: avaP[token].avatarColor,
      avatarAlpha: avaP[token].avatarAlpha,
    });


    //フォームを切り替える
    nameForm.style.display = "none";
    msgForm.style.display = "block";
    loginButton.parentNode.removeChild(loginButton);
    msgForm.msg.focus();
    inRoom = 1;

    //wa_iButtunがオフの時
    window.addEventListener("keydown", function (e) {
      if (clickedWa_iButtun == false) {
        isDownCtrl = e.ctrlKey;
        if (e.ctrlKey) {
          wa_i.style.backgroundColor = 'skyblue';
        }
      }
    }, {
      passive: true,
    });
    window.addEventListener("keyup", function (e) {
      if (clickedWa_iButtun == false) {
        isDownCtrl = e.ctrlKey;
        if (e.ctrlKey == false) {
          wa_i.style.backgroundColor = "red";
        }
      }
    }, {
      passive: true,
    });

    window.addEventListener("blur", function () {
      if (clickedWa_iButtun == false) {
        isDownCtrl = false;
        wa_i.style.backgroundColor = "red";
      }
    }, {
      passive: true,
    });



    app.stage.getChildByName("entrance").interactive = true;
    // マウスか、スマホをおしっぱにしてる間、ctrlを押してるか、wa_iがonになってたら線を出力
    app.stage.getChildByName("entrance").pointerdown = function () {
      pointDown = true;
    }

    app.stage.getChildByName("entrance").pointermove = function (e) {//カーソルを動かし中
      if (pointDown && (isDownCtrl || clickedWa_iButtun)) {
        draw(e.data.getLocalPosition(app.stage.getChildByName("entrance")).x, e.data.getLocalPosition(app.stage.getChildByName("entrance")).y);
        oekakityu = true;
      }
    }
    app.stage.getChildByName("entrance").pointerup = function () {//カーソルを離したとき
      if (oekakityu) {//お絵かき中なら
        app.stage.getChildByName(room).removeChild(oekaki[0]);
        socket.json.emit("oekaki", {
          oekakiX: oekaki[0].X,
          oekakiY: oekaki[0].Y,
          oekakiColor: oekaki[0].dataColor,
          oekakiAlpha: oekaki[0].dataAlpha,
        });
        app.stage.getChildByName(room).removeChild(oekaki[0]);
        lastPosition.x = null;
        lastPosition.y = null;
        oekaki[0] = new PIXI.Graphics();
        oekaki[0].lineStyle(2, oekakiColor, oekakiAlpha);
        oekakityu = false;
      }
      pointDown = false;
    }
    app.stage.getChildByName("entrance").mouseup = function () {
      pointDown = false;
    }


    oekaki[0] = new PIXI.Graphics();
    oekaki[0].lineStyle(2, oekakiColor, oekakiAlpha);
    app.stage.getChildByName(room).addChild(oekaki[0]);

    //点と色情報をサーバーにアップロード

    //wa_iを受け取ったら,ブロックを作る

    //ブロックにぶつかったら動けないようにする

    //クリアボタンでブロックを全て消すよう指示
    // function clearCanvas() {
    //   for (let i = 0; i < oekaki.length; i++) {
    //     app.stage.getChildByName(room).removeChild(oekaki[i]);
    //   }
    // }

    //クリアボタンの指示を受け取ったらブロックを部屋のブロックを消す

    //線はカラーパレットをクリックで色を変える

    //ホワイトキャンバス部屋に居る時
    //落書きがされてたら
    //部屋出力ボタンを作る
    //出力ボタンが押されたら、部屋の左下に扉を出現

    //扉の色は最後に使用した色

    //扉の先にwhitecanvasNに繋がるようにする
  }
}

function outputMsg(outputMsg, color) {//移動時のメッセージ出力
  console.log("outputMsgLENGth:" + outputMsg.length);
  const li = document.createElement("li");
  li.classList.add("flexContainer");
  if (color) {
    li.style.color = color;
  }
  //u3000は全角空白だからu3001からにした
  let split = outputMsg.split(/https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#\u3001-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+/g);
  let match = outputMsg.match(/https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#\u3001-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+/g);

  if (!match) {
    match = [];
    match[0] = false;
  }

  let allLength = 0;
  let pre = [];
  let a = [];
  let maxLength = 200;


  for (let i = 0; i < split.length; i++) {
    pre[i] = document.createElement("pre");

    if (allLength + split[i].length > maxLength) {
      pre[i].textContent = split[i].substr(0, maxLength - allLength) + "...(省略されました。全てを読むにはわっふるわっふると書き込んでください。)";
      li.appendChild(pre[i]);
      waffleEventNum++;
      msgForm.addEventListener("submit", waffle);
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
        a[i].textContent = match[i].substr(0, maxLength - allLength) + " ...(省略されました。全てを読むにはわっふるわっふると書き込んでください。)";
        li.appendChild(a[i]);
        waffleEventNum++;
        msgForm.addEventListener("submit", waffle);
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
      if (window.innerWidth > 660 && chatLog.scrollHeight <= chatLog.clientHeight + chatLog.scrollTop + 1) {//windowsizeが660以上の時かつスクロールバーが一番下にある時にスクロールバーを自動移動
        chatLogUl.replaceChild(liAll, li); //すげ替え。
        chatLog.scrollTop = chatLog.scrollHeight;
      }


      msgForm.removeEventListener("submit", waffle);
      waffleEventNum--;

      if (waffleEventNum === 0) {
        msgForm.msg.value = "";//メッセージ入力欄を空にする
      }
    }
    e.preventDefault();
  }

  //メッセージを出力
  if (window.innerWidth > 660 && chatLog.scrollHeight <= chatLog.clientHeight + chatLog.scrollTop + 1) {//windowsizeが660以上の時かつスクロールバーが一番下にある時にスクロールバーを自動移動
    chatLogUl.insertBefore(li, logs.querySelectorAll("li")[li.length]);
    chatLog.scrollTop = chatLog.scrollHeight;
  } else {
    chatLogUl.insertBefore(li, logs.querySelectorAll("li")[li.length]);
  }


  if (outputMsg.length > 200) {
    outputMsg = outputMsg.substr(0, 200) + "...";
  }
  gamenLog.text = outputMsg + "\n" + gamenLog.text;
  app.stage.addChild(gamenLog);

}

//過去ログ表示
let usePastLog;
function pastLogButtonClicked() {
  if (usePastLog) {
    pastLog.style.backgroundColor = "red";
    chatLog.style.height = 0 + "px";
    usePastLog = false;
  } else {
    pastLog.style.backgroundColor = 'skyblue';
    chatLog.style.height = 470 + "px";
    usePastLog = true;
  }
}
pastLog.addEventListener('click', pastLogButtonClicked);
pastLog.addEventListener('mousedown', function (e) { e.preventDefault(); });

//画面ログ非表示
let visibleLog = false;
visibleLogButton.style.backgroundColor = "red";
function visibleLogButtonClicked() {
  if (visibleLog) {
    visibleLogButton.style.backgroundColor = "red";
    gamenLog.visible = false;
    visibleLog = false;
  } else {
    visibleLogButton.style.backgroundColor = 'skyblue';
    gamenLog.visible = true;
    visibleLog = true;
  }
}
visibleLogButton.addEventListener('click', visibleLogButtonClicked);
visibleLogButton.addEventListener('mousedown', function (e) { e.preventDefault(); });



wa_i.style.backgroundColor = "red";
function wa_iButtonClicked() {
  if (clickedWa_iButtun) {
    wa_i.style.backgroundColor = "red";
    clickedWa_iButtun = false;
  } else {
    wa_i.style.backgroundColor = 'skyblue';
    clickedWa_iButtun = true;
  }
}
wa_i.addEventListener('click', wa_iButtonClicked);
wa_i.addEventListener('mousedown', function (e) { e.preventDefault(); });

clear.style.backgroundColor = 'skyblue';
function clearButtonClicked() {
  socket.emit("clearCanvas", {});
  clear.style.backgroundColor = '#BCE1DF';
}

clear.addEventListener('mousedown', clearButtonClicked);

function clearButtonUp() {
  clear.style.backgroundColor = 'skyblue';
}
clear.addEventListener('mouseup', clearButtonUp);



if (localStorage.getItem("volume")) {
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




let useLogChime;
if (localStorage.getItem("useLogChime")) {
  useLogChime = true;
} else {
  useLogChime = false;
}
useLogChime = Boolean(parseInt(localStorage.getItem("useLogChime"), 10));//
if (useLogChime) {//ログチャイムを使う時
  logNoiseButton.style.backgroundColor = 'skyblue';
  logNoiseButton.textContent = "SE🔊))"
} else {//使わない時
  logNoiseButton.style.backgroundColor = "red";
  logNoiseButton.textContent = "SE📢✖"

}

function logChimeButtonClicked() {
  if (useLogChime) {//ログチャイムを使わない時
    logNoiseButton.style.backgroundColor = "red";
    logNoiseButton.textContent = "📢✖"
    localStorage.setItem("useLogChime", false);
    useLogChime = false;
  } else {//ログチャイムを使う時
    logNoiseButton.style.backgroundColor = 'skyblue';
    logNoiseButton.textContent = "🔊))"
    localStorage.setItem("useLogChime", true);
    useLogChime = true;
  }
}
logNoiseButton.addEventListener('click', logChimeButtonClicked);
logNoiseButton.addEventListener('mousedown', function (e) { e.preventDefault(); });



function setSEVolume(value) {//SE音量調整
  localStorage.setItem("volume", value);
  setMsgSE(value);
}


//メッセージを受け取って表示
socket.on("emit_msg", function (data) {
  if (setAbon[data.token] == false) {//アボンされてない場合
    outputMsg("（　´∀｀)" + data.userName + ":" + data.msg,);

    if (data.avaMsg.length > 40) {//長すぎる場合は短くする
      data.avaMsg = data.avaMsg.substr(0, 40) + "...";
    }

    if (data.avaMsg == "") {//未入力メッセージなら吹き出しを消す
      msg[data.token].text = data.avaMsg;
    } else {
      if (data.kanban) {//看板機能
        msg[data.token].text = data.avaMsg;
        msg[data.token].style.fill = "0x1e90ff";
      } else {
        msg[data.token].text = data.avaMsg;
        msg[data.token].style.fill = "white";
      }


      // // 発言したテキストをクリックした時アボンする
      // li.className = data.token;//アボンクラスを付与
      // const abonClass = document.getElementsByClassName(data.token);
      // abonClass[abonClass.length - 1].addEventListener("click", function () {
      //   if (data.token != token) {//自テキストは省く
      //     if (setAbon[data.token]) {
      //       setAbon[data.token] = false;
      //     } else {
      //       setAbon[data.token] = true;
      //       avaP[data.token].removeChild(avaC[data.token]);//画像をアボンにする
      //       avaC[data.token] = avaAbon[data.token];
      //       avaP[data.token].addChild(avaC[data.token]);
      //     }
      //     socket.json.emit("abonSetting", {
      //       setAbon: setAbon[data.token],
      //       token: data.token,
      //     });
      //   }
      // });
      if (useLogChime) {//ログの音を鳴らす
        msgSE.log[data.soundNum].play();
      }
    }
  }
});

//アボンの時の処理
socket.on("abonSetting", function (data) {
  if (setAbon[data.token] == true || data.msg == "その住民は退出済みです") {//アボンするときかアボン対象の住人が居ない時
    outputMsg(data.msg, "red");
    msg[data.token].style.fill = "red";
    msg[data.token].text = data.avaMsg;
  } else {//アボンを解除する時
    outputMsg(data.msg, "blue");
    if (data.room == room) {//アバターが部屋にいるときの解除
      msg[data.token].style.fill = "white";
      avaP[data.token].x = data.AX;
      avaP[data.token].y = data.AY;
      avaP[data.token].removeChild(avaC[data.token]);

      switch (data.DIR) {
        case "N":
          avaC[data.token] = avaN[data.token];
          break;
        case "NE":
          avaC[data.token] = avaNE[data.token]
          break;
        case "E":
          avaC[data.token] = avaE[data.token]
          break;
        case "SE":
          avaC[data.token] = avaSE[data.token]
          break;
        case "S":
          avaC[data.token] = avaS[data.token]
          break;
        case "SW":
          avaC[data.token] = avaSW[data.token]
          break;
        case "W":
          avaC[data.token] = avaW[data.token]
          break;
        case "NW":
          avaC[data.token] = avaNW[data.token]
          break;
        case "sit":
          avaC[data.token] = avaSit[data.token]
          break;
      }
      avaP[data.token].addChild(avaC[data.token]);
    } else {//アバターが部屋に居ない時の解除だったら、削除する
      app.stage.getChildByName(avaP[data.token].room).removeChild(avaP[data.token]);
    }
    msg[data.token].text = data.avaMsg;
  }
});










//ログインか入室時に自分と他人のアバターを生成する
socket.on("roomInSelf", function (data) {
  socket.emit("message", { type: "callMediaStatus" });

  if (data.beforeRoom == "login") {//ログイン時
    localStorage.setItem("avatarUserName", data.user[token].userName);
  }
  outputMsg(data.msg);//移動時のメッセージ出力
  //部屋人数の表記を変える
  usersNumber.textContent = data.users;
  const keys = Object.keys(data.user);//入室時の全員のソケットＩＤを取得
  keys.forEach(function (value) {//引数valueにtokenを入れて順番に実行
    if (data.beforeRoom == "login") {//ログインする時

      switch (data.user[value].avatar) {
        case "necosukeMono":
          setAvatar(value, necosukeMono, 50);
          break;

        case "necosuke":
          setAvatar(value, necosuke, 50)
          break;
        case "gomanecoMono":
          setAvatar(value, gomanecoMono, 40);
          break;

        default:
          setAvatar(value, gomaneco, 40)
          break;
      }
      avaAbon[value] = new PIXI.Sprite(avaAbon);
      avaAbon[value].anchor.set(0.5, 1);

      // アバターの親コンテナを作成
      avaP[value] = new PIXI.Container();//ここで自身のアバターの関係性もリセットされてる
      avaP[value].avatar = data.user[value].avatar;
      avaP[value].sortableChildren = true;//子要素のzIndexをonにする

      avaP[value].room = data.user[value].room;
      setColor(value, data.user[value].avatarColor);
      setAlpha(value, data.user[value].avatarAlpha);

      //名前を追加
      nameText[value] = new PIXI.Text(data.user[value].userName, nameTextStyle);
      nameText[value].zIndex = 10;
      nameText[value].anchor.set(0.5);
      avaP[value].userName = data.user[value].userName;
      avaP[value].addChild(nameText[value]);

      nameTag[value] = new PIXI.Graphics();
      nameTag[value].lineStyle(1, 0x000000, 0.5);
      nameTag[value].beginFill(0x000000);
      nameTag[value].drawRect(0, 0, nameText[value].width, nameText[value].height);
      nameTag[value].endFill();
      nameTag[value].x = -nameText[value].width / 2;

      nameTag[value].alpha = 0.3;

      avaP[value].addChild(nameTag[value]);


      // アバターのメッセージを追加する
      msg[value] = new PIXI.Text(data.user[value].msg);
      msg[value].zIndex = 20;

      msg[value].style.fontSize = 16;
      msg[value].style.fill = "0x1e90ff";
      avaP[value].addChild(msg[value]);

      //アバタークリックでアボン
      avaP[value].interactive = true;//クリックイベントを有効化
      setAbon[value] = false;
      if (value !== token) {
        avaP[value].rightclick = function () {
          setAbonID = value;
          document.getElementById("abon").style.display = "block";
        };
      }
      avaP[value].touchstart = function () {
        tapFlag = true;
        if (!isDownCtrl && !clickedWa_iButtun) {
          oekakiColor = avaP[value].avatarColor;
          oekakiAlpha = avaP[value].avatarAlpha;
        }


        let contextCount = 0;
        let countup = function () {
          contextCount++;
          let id = setTimeout(countup, 1000);
          if (contextCount > 1) {
            setAbonID = value;
            document.getElementById("abon").style.display = "block";
            clearTimeout(id);
            contextCount = 0;
          } else {
            document.getElementById("graphic").addEventListener("touchend", function (e) {//タップを離したとき
              clearTimeout(id);
              contextCount = 0;
            }, {
              passive: true,
            });
          }
        }
        countup();
      }

      avaP[value].click = function () {
        if (tapFlag) {
          tapFlag = false;
        } else {
          if (!isDownCtrl && !clickedWa_iButtun) {
            oekakiColor = avaP[value].avatarColor;
            oekakiAlpha = avaP[value].avatarAlpha;
          }
        }
      }



      if (value !== token) {
        sleepFlag[value] = false;//ログインした時自分以外のスリープフラグは一旦オフにする
      }


      avaLoop(value);
    } else {
      msg[token].text = "";
    }

    if (setAbon[value] == false) {//アボンしてない場合だけ
      avaP[value].position.set(data.user[value].AX, data.user[value].AY);

      if (data.user[value].room == data.room) {//部屋に存在してるユーザーのアバを作る
        avaP[value].roomIn = 1;//入室回数をリセット
        app.stage.getChildByName(data.room).addChild(avaP[value]);
        avaP[value].removeChild(avaC[value]);
        // 画像とメッセージと名前を追加してステージに上げる
        switch (data.user[value].DIR) {
          case "NE":
            avaC[value] = avaNE[value];
            avaP[value].addChild(avaC[value]);
            break;
          case "SE":
            avaC[value] = avaSE[value];
            avaP[value].addChild(avaC[value]);
            break;
          case "SW":
            avaC[value] = avaSW[value];
            avaP[value].addChild(avaC[value]);
            break;
          case "NW":
            avaC[value] = avaNW[value];
            avaP[value].addChild(avaC[value]);
            break;
          case "N":
            avaC[value] = avaN[value];
            avaP[value].addChild(avaC[value]);
            break;
          case "E":
            avaC[value] = avaE[value];
            avaP[value].addChild(avaC[value]);
            break;
          case "S":
            avaC[value] = avaS[value];
            avaP[value].addChild(avaC[value]);
            break;
          case "sit":
            avaC[value] = avaSit[value];
            avaP[value].addChild(avaC[value]);
            break;
          default:
            avaC[value] = avaW[value];
            avaP[value].addChild(avaC[value]);
            break;
        }
        //この位置だと、部屋に存在してないアバを作れない
        nameText[value].position.set(0, -avaC[value].height - 10);
        nameTag[value].y = -avaC[value].height - 10 - nameText[value].height / 2;
        msg[value].position.set(0, -avaC[value].height - 5);



        if (data.user[value].msg != "") {
          const liKanban = document.createElement("li");//likanbanを作る
          liKanban.textContent = "[（　´∀｀）" + data.user[value].userName + "]:" + data.user[value].msg;//likanbanのテキストを設定
          logs.appendChild(liKanban);//logsの末尾に入れる
        }
      } else {
        avaP[value].roomIn = 0;
      }
      if (data.user[value].sleep) {
        if (sleepFlag[value] == false) {//二重sleep対策
          sleepFlag[value] = true;
          animeSleep(value);
        }
      } else {
        sleepFlag[value] = false;
      }
    }
  });
  if (useLogChime) {//部屋入室の音を鳴らす
    if (data.roomSE == "login") {
      let regexp = /ＪＭＭ連合/i;//ＪＭＭ連合って文字が入ってたら爆発する
      if (regexp.test(data.userName)) {
        msgSE.JMMLogin.play();

      } else {
        msgSE.login.in[data.random].play();
      }
    } else {
      msgSE[roomSE].in[data.random].play();
    }
  }

  //お絵かきブロック生成
  for (let n = 0; n < data.oekakiX.length; n++) {
    oekaki[room][n] = new PIXI.Graphics();
    oekaki[room][n].zIndex = 1000;
    oekaki[room][n].lineStyle(2, data.oekakiColor[n][0], data.oekakiAlpha[n][0]);
    oekaki[room][n].moveTo(data.oekakiX[n][0], data.oekakiY[n][0]);
    for (let i = 1; i < data.oekakiX[n].length; i++) {
      oekaki[room][n].lineStyle(2, data.oekakiColor[n][i], data.oekakiAlpha[n][i]);
      oekaki[room][n].lineTo(data.oekakiX[n][i], data.oekakiY[n][i]);
    }
    app.stage.getChildByName(room).addChild(oekaki[room][n]);
    oekakiNum[room]++;
  }

});


socket.on("loadAvatar", function (data) {//新規入場者の読み込み
  // アバターの親コンテナを作成
  avaP[data.token] = new PIXI.Container();
  avaP[data.token].sortableChildren = true;//子要素のzIndexをonにする
  avaP[data.token].roomIn = 0;

  //ここらへんは、後で画像纏めた時に関数化したいな
  avaAbon[data.token] = new PIXI.Sprite(avaAbon);
  avaAbon[data.token].anchor.set(0.5, 1);

  switch (data.avatar) {
    case "necosukeMono":
      avaP[data.token].avatar = "necosukeMono";
      setAvatar(data.token, necosukeMono, 50);
      break;
    case "necosuke":
      avaP[data.token].avatar = "necosuke";
      setAvatar(data.token, necosuke, 50);
      break;
    case "gomanecoMono":
      avaP[data.token].avatar = "gomanecoMono";
      setAvatar(data.token, gomanecoMono, 40);
      break;
    default:
      avaP[data.token].avatar = "gomaneco";
      setAvatar(data.token, gomaneco, 40);
      break;
  }
  setColor(data.token, data.avatarColor);
  setAlpha(data.token, data.avatarAlpha);

  //画像をあげる
  avaC[data.token] = avaS[data.token];
  avaP[data.token].addChild(avaC[data.token]);

  //名前を追加
  nameText[data.token] = new PIXI.Text(data.userName, nameTextStyle);
  nameText[data.token].zIndex = 10;
  nameText[data.token].anchor.set(0.5);
  nameText[data.token].position.set(0, -avaC[data.token].height - 10);
  avaP[data.token].userName = data.userName;
  avaP[data.token].addChild(nameText[data.token]);

  nameTag[data.token] = new PIXI.Graphics();
  nameTag[data.token].lineStyle(1, 0x000000, 0.5);
  nameTag[data.token].beginFill(0x000000);
  nameTag[data.token].drawRect(0, 0, nameText[data.token].width, nameText[data.token].height);
  nameTag[data.token].endFill();
  nameTag[data.token].x = -nameText[data.token].width / 2;
  nameTag[data.token].y = -avaC[data.token].height - 10 - nameText[data.token].height / 2;
  nameTag[data.token].alpha = 0.3;
  avaP[data.token].addChild(nameTag[data.token]);

  // アバターのメッセージを追加する
  msg[data.token] = new PIXI.Text("");
  msg[data.token].zIndex = 20;
  msg[data.token].position.set(0, -avaC[data.token].height - 5);
  msg[data.token].style.fill = "white";
  msg[data.token].style.fontSize = 16;
  avaP[data.token].addChild(msg[data.token]);

  //sleepFlagをfalseに
  sleepFlag[data.token] = false;
  // アバタークリックでアボン
  avaP[data.token].interactive = true;//クリックイベントを有効化
  setAbon[data.token] = false;
  avaP[data.token].rightclick = function () {
    setAbonID = data.token;
    document.getElementById("abon").style.display = "block";
  };
  avaP[data.token].touchstart = function () {
    tapFlag = true;
    if (!isDownCtrl && !clickedWa_iButtun) {
      oekakiColor = avaP[data.token].avatarColor;
      oekakiAlpha = avaP[data.token].avatarAlpha;
    }

    let contextCount = 0;
    let countup = function () {
      contextCount++;
      let id = setTimeout(countup, 1000);
      if (contextCount > 1) {
        setAbonID = data.token;
        document.getElementById("abon").style.display = "block";
        clearTimeout(id);
        contextCount = 0;
      } else {
        document.getElementById("graphic").addEventListener("touchend", function (e) {//タップを離したとき
          clearTimeout(id);
          contextCount = 0;
        }, {
          passive: true,
        });
      }
    }
    countup();
  }

  avaP[data.token].click = function () {
    if (tapFlag) {
      tapFlag = false;
    } else {
      if (!isDownCtrl && !clickedWa_iButtun) {
        oekakiColor = avaP[data.token].avatarColor;
        oekakiAlpha = avaP[data.token].avatarAlpha;
      }
    }
  }
  avaLoop(data.token);
});


//ログアウトした時の処理
socket.on("logout", function (data) {
  outputMsg(data.msg);//移動時のメッセージ出力
  //部屋人数の表記を変える
  usersNumber.textContent = data.users;
  app.stage.getChildByName(data.room).removeChild(avaP[data.token]);

  if (useLogChime) {//ログチャイムがオンになってたら、ログアウトの音を鳴らす
    msgSE[roomSE].logout[data.random].play();
  }

  stopConnection(data.token);
});


function gameLoop() {
  //アバター位置とマウス位置の表示
  loginMX = app.renderer.plugins.interaction.mouse.global.x;
  loginMY = app.renderer.plugins.interaction.mouse.global.y;
  AtextX.text = "avaX" + AX;
  AtextY.text = "avaY" + AY;
  if (0 <= loginMX && app.renderer.plugins.interaction.mouse.global.x <= 660 && 0 <= loginMY && loginMY <= 460) {
    MtextX.text = "mouX" + loginMX;
    MtextY.text = "mouY" + loginMY;
  }
  requestAnimationFrame(gameLoop);
}




//再起動用メッセージ
socket.on("emitSaikiMsg", function (data) {
  outputMsg(data.msg);//移動時じゃないけど、これ使う
});


// Pくん
function clickPkun() {
  pkun.classList.add('moved');
  console.log("プロ街&飴ちゃん");
}

let PkunFlag = true;
document.querySelector('svg').addEventListener("touchstart", function () {
  tapFlag = true;
  if (PkunFlag) {
    clickPkun();
    PkunFlag = false;
  } else {
    pkun.classList.remove('moved');
    PkunFlag = true;
  }
}, {
  passive: true,
});

document.querySelector('svg').addEventListener("click", function () {
  if (tapFlag) {
    tapFlag = false;
  } else {
    if (PkunFlag) {
      clickPkun();
      PkunFlag = false;
    } else {
      pkun.classList.remove('moved');
      PkunFlag = true;
    }
  }
}, {
  passive: true,
});


//フォントサイズ
if (localStorage.getItem("fontSize")) {
  chatLog.style.fontSize = localStorage.getItem("fontSize") + "px";
} else {
  chatLog.style.fontSize = "17px";
}
fontSizeSelecter.onchange = function () {
  localStorage.setItem("fontSize", this.value);
  chatLog.style.fontSize = this.value + "px";
}



//画面サイズの読みこみ
if (window.innerWidth > 870 && localStorage.getItem("PMsize")) {
  PMsize = localStorage.getItem("PMsize");
} else {
  PMsize = "1.0";
}

//ウィンドウサイズ変更時の処理
let windowSize = window.innerWidth;
loginButton.style.position = windowSize / 2 - 10 + "px"


windowResize();


let chatLogScrollHeight;
let chatLogScrollTop;
let chatLogClientHeight;
chatLog.onscroll = function () {
  chatLogScrollHeight = chatLog.scrollHeight;
  chatLogScrollTop = chatLog.scrollTop;
  chatLogClientHeight = chatLog.clientHeight;
}

function over870andBottomBar() {
  windowSize = window.innerWidth;
  windowResize();
  if (window.innerWidth > 870) {//window.innerWidthが870以上の場所に移動した場合
    chatLog.scrollTop = chatLog.scrollHeight;//スクロールを一番下にする

  } else {//870以下の場所に移動した場合
    chatLog.scrollTop = 0;
  }
}

function under870andTopBar() {
  windowSize = window.innerWidth;
  windowResize();
  if (window.innerWidth > 870) {//windowサイズが870以上になったら
    chatLog.scrollTop = chatLog.scrollHeight;//スクロールを一番下にする
  }

}

function elseBar() {
  windowSize = window.innerWidth;
  chatLogScrollTop = chatLog.scrollTop;
  windowResize();
  chatLog.scrollTop = chatLogScrollTop;
  chatLogScrollHeight = chatLog.scrollHeight;
  // chatLogScrollTop = chatLog.scrollTop;
  chatLogClientHeight = chatLog.clientHeight;
}

//画面サイズが変わった時にチャットのスクロールバーを動かす
window.addEventListener("resize", function () {
  if (windowSize > 870 && chatLogScrollHeight - chatLogScrollTop <= chatLogClientHeight + 1) {//windowサイズが870以上の時かつ、スクロールバーが一番下にある時
    over870andBottomBar();
  } else if (windowSize <= 870 && chatLog.scrollTop == 0) {//windowサイズが870以下の時、かつスクロールバーが一番上にある時
    under870andTopBar();
  } else {
    elseBar();
  }
}, {
  passive: true,
});



function windowResize() {
  if (windowSize <= 870) {
    let PMscale = windowSize / 660;
    let scale = "scale(" + PMscale + ")";
    StyleDeclarationSetTransform(main.style, scale);
    let position = "0px 0px";
    StyleDeclarationSetOrigin(main.style, position);
    loginButton.style.left = loginButton.offsetWidth * PMscale / 2 + window.innerWidth / 2 + "px";

    titleBar.style.width = 1 / PMscale * 100 + "%";


    if (Pmain.classList.contains('flexContainer')) {
      Pmain.classList.remove("flexContainer");
    }
    if (!Pmain.classList.contains('flexContainerColumn')) {
      Pmain.classList.add("flexContainerColumn");
    }

    chatLog.style.width = 660 + "px";


    // //過去ログ
    pastLog.style.backgroundColor = "red";
    chatLog.style.height = 0 + "px";
    usePastLog = false;

    //画面log
    visibleLogButton.style.backgroundColor = "skyblue";
    gamenLog.visible = true;
    visibleLog = true;


    // // chatLog.style.fontSize = "13px";
    // //IE11対策
    // footer.style.width = windowSize + "px";
    // footer.style.width = kousinrireki.clientWidth + "px";
    mainFrame.style.width = window.innerWidth + "px";
    mainFrame.style.height = window.innerHeight + "px";

  }

  else {//870以上の時
    let scale = "scale(" + PMsize + ")";
    StyleDeclarationSetTransform(main.style, scale);

    let position = "0px 0px";
    StyleDeclarationSetOrigin(main.style, position);
    loginButton.style.left = loginButton.offsetWidth * 0.8 / 2 + 660 / 2 * 0.8 + "px";


    if (Pmain.classList.contains('flexContainerColumn')) {
      Pmain.classList.remove("flexContainerColumn");
    }
    if (!Pmain.classList.contains('flexContainer')) {
      Pmain.classList.add("flexContainer");
    }

    chatLog.style.width = (window.innerWidth - (660 * Number(PMsize))) / Number(PMsize) + "px";
    titleBar.style.width = 1 / Number(PMsize) * 100 + "%";


    //過去ログ
    pastLog.style.backgroundColor = 'skyblue';
    chatLog.style.height = 530 + "px";
    usePastLog = true;

    //画面ログ
    gamenLog.visible = false;
    mainFrame.style.width = window.innerWidth + "px";
    mainFrame.style.height = window.innerHeight + "px";
  }
}


sizeSelecter.onchange = function () {
  let scale = "scale(" + this.value + ")";
  StyleDeclarationSetTransform(main.style, scale);
  StyleDeclarationSetOrigin(main.style, "0px 0px");
  PMsize = this.value;

  if (windowSize > 870) {
    localStorage.setItem("PMsize", this.value);
    titleBar.style.width = 1 / Number(PMsize) * 100 + "%";

    chatLog.style.width = (window.innerWidth - (660 * Number(PMsize))) / Number(PMsize) + "px";
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




function debugMode(message) {
  if (document.getElementById("debugCheck").checked) {
    outputMsg(message, "rgb(212, 4, 4)");
  }
}












//右クリックメニュー
window.onload = function () {
  document.getElementById("graphic").addEventListener('contextmenu', function (e) {
    //マウスの位置をstyleへ設定（左上の開始位置を指定）
    document.getElementById('contextmenu').style.left = e.pageX - 80 + "px";
    document.getElementById('contextmenu').style.top = e.pageY + "px";
    //メニューをblockで表示させる
    document.getElementById('contextmenu').style.display = "block";
  });
  document.getElementById("graphic").addEventListener('click', function (e) {
    //メニューをnoneで非表示にさせる
    document.getElementById('contextmenu').style.display = "none";
    document.getElementById("abon").style.display = "none";
  });


  let contextCount = 0;
  let countup = function () {
    console.log(contextCount++);
    let id = setTimeout(countup, 1000);
    if (contextCount > 2) {
      clearTimeout(id);
    }
  }

  document.getElementById("graphic").addEventListener("touchstart", function (e) {//タップの場合
    document.getElementById('contextmenu').style.display = "none";
    let contextCount = 0;
    let countup = function () {
      contextCount++;
      let id = setTimeout(countup, 1000);
      if (contextCount > 1) {
        document.getElementById('contextmenu').style.left = e.pageX - 80 + "px";
        document.getElementById('contextmenu').style.top = e.pageY + "px";
        //メニューをblockで表示させる
        document.getElementById('contextmenu').style.display = "block";
        clearTimeout(id);
        contextCount = 0;
      } else {
        document.getElementById("graphic").addEventListener("touchend", function (e) {//タップを離したとき
          clearTimeout(id);
          contextCount = 0;
        });
      }
    }
    countup();
  });
}



function menu1() {//座らせる
  if (document.getElementById('sleep').textContent == "起きる") {
    document.getElementById('sleep').textContent = "寝る";
    sleepFlag[token] = false;
    socket.json.emit("sleep", {});
  }
  DIR = "sit";
  avaP[token].removeChild(avaC[token]);
  avaC[token] = avaSit[token];
  avaP[token].addChild(avaC[token]);
  socket.json.emit("tapMap", {
    DIR: DIR,
    AX: AX,
    AY: AY,
  });
  document.getElementById('contextmenu').style.display = "none";
  document.getElementById("abon").style.display = "none";
}

(function () {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

(function () {
  var cancelAnimationFrame = window.cancelAnimationFrame ||
    window.mozcancelAnimationFrame || window.webkitcancelAnimationFrame || window.mscancelAnimationFrame;
  window.cancelAnimationFrame = cancelAnimationFrame;
})();



function menu2() {//眠らせる
  if (avaP[token].avatar == "gomaneco" || avaP[token].avatar == "gomanecoMono") {
    if (document.getElementById('sleep').textContent == "寝る") {//寝る時
      if (sleepFlag[token] == false) {
        document.getElementById('sleep').textContent = "起きる";
        sleepFlag[token] = true;
        animeSleep(token);
        socket.json.emit("sleep", {});
      }
    } else {//起きる時
      document.getElementById('sleep').textContent = "寝る";
      sleepFlag[token] = false;
      socket.json.emit("sleep", {});
    }
    document.getElementById('contextmenu').style.display = "none"
  }
  document.getElementById("abon").style.display = "none";
}
socket.on("sleep", function (data) {
  if (avaP[data.token].avatar == "gomaneco" || avaP[token].avatar == "gomanecoMono") {
    if (data.sleep) {//寝る時
      if (data.token == token) {//自分が時間で眠った時右クリックメニューを起きるにする
        document.getElementById('sleep').textContent = "起きる";
      }
      if (sleepFlag[data.token] == false) {
        sleepFlag[data.token] = true;
        animeSleep(data.token);
      }
    } else {//起きるとき
      if (data.token == token) {//自分が時間で眠った時右クリックメニューを寝るにする
        document.getElementById('sleep').textContent = "寝る";
      }
      sleepFlag[data.token] = false;
    }
  }
});



function animeSleep(thisToken) {
  if (avaP[thisToken].avatar == "gomaneco" || avaP[thisToken].avatar == "gomanecoMono") {
    gsap.to(avaP[thisToken], 0, {
      onUpdate: function () {
        if (setAbon[thisToken] == false) {
          avaP[thisToken].removeChild(avaC[thisToken]);
          avaC[thisToken] = avaSleep0[thisToken];
          avaP[thisToken].addChild(avaC[thisToken]);
        }
      }
    });
    gsap.to(avaP[thisToken], 0, {
      delay: 0.3,
      onUpdate: function () {
        if (setAbon[thisToken] == false) {
          avaP[thisToken].removeChild(avaC[thisToken]);
          avaC[thisToken] = avaSleep1[thisToken];
          avaP[thisToken].addChild(avaC[thisToken]);
        }
      }
    });
    gsap.to(avaP[thisToken], 0, {
      delay: 0.7,
      onUpdate: function () {
        if (setAbon[thisToken] == false) {
          avaP[thisToken].removeChild(avaC[thisToken]);
          avaC[thisToken] = avaSleep2[thisToken];
          avaP[thisToken].addChild(avaC[thisToken]);
        }
      }
    });
    gsap.to(avaP[thisToken], 0, {
      delay: 1.1,
      onUpdate: function () {
        if (setAbon[thisToken] == false) {
          avaP[thisToken].removeChild(avaC[thisToken]);
          avaC[thisToken] = avaSleep3[thisToken];
          avaP[thisToken].addChild(avaC[thisToken]);
        }
        callbackId[thisToken] = window.requestAnimationFrame(function () { animeSleep(thisToken) });
        if (sleepFlag[thisToken] === false) {
          window.cancelAnimationFrame(callbackId[thisToken]);
          if (setAbon[thisToken] == false) {
            avaP[thisToken].removeChild(avaC[thisToken]);
            avaC[thisToken] = avaS[thisToken];
            avaP[thisToken].addChild(avaC[thisToken]);
          }
        }
      }
    });
  }
}


function menu3(value) {//アボン
  if (value != token) {//自アバターは省く 
    if (setAbon[value]) {
      setAbon[value] = false;
      document.getElementById('abon').textContent = "アボン";
    } else {
      setAbon[value] = true;
      avaP[value].removeChild(avaC[value]);//画像をアボンにする
      avaC[value] = avaAbon[value];
      avaP[value].addChild(avaC[value]);
      document.getElementById('abon').textContent = "アボン解除";
    }
    socket.json.emit("abonSetting", {
      setAbon: setAbon[value],
      token: value,
    });
  }
  document.getElementById("abon").style.display = "none";
  document.getElementById('contextmenu').style.display = "none";
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

_assert('container', container);

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




socket.on('message', function (message) {
  console.log('message:', message);
  debugMode(message);
  let fromId = message.from;
  if (message.type === 'callMediaStatus') {
    if (videoStatus) {
      socket.emit('message', { type: 'createVideoButton' });
    }
    if (audioStatus) {
      socket.emit('message', { type: 'createAudioButton' });
    }
  }
  else if (message.type === 'createVideoButton') {
    if (!videoButton[fromId]) {
      createVideoButton(fromId);
    }
  } else if (message.type === 'createAudioButton') {
    if (!audioButton[fromId]) {
      createAudioButton(fromId);
    }
  } else if (message.type === "remove video button") {

    mediaElement[fromId].removeChild(videoButton[fromId]);
    videoButton[fromId] = null;
    if (!audioButton[fromId]) {
      removeMediaElementButton(fromId);
    }
  } else if (message.type === "remove audio button") {
    mediaElement[fromId].removeChild(audioButton[fromId]);
    audioButton[fromId] = null;
    if (!videoButton[fromId]) {
      removeMediaElementButton(fromId);
    }
  }
  else if (message.type === 'call video') {//接続
    if (!canConnectMore()) {
      console.warn('TOO MANY connections, so ignore');
      debugMode("接続数が多すぎる");
    }
    else if (!localStream) {
      console.log("NO localStream");
      debugMode("NO localStream");
    }
    else if (peerConnections[fromId]) {
      // already connnected, so skip
      console.log('already connected, so ignore');
      debugMode("already connected, so ignore");
    }
    else {
      // connect new party
      console.log("connect video");
      debugMode("connect video");
      makeOffer(fromId, true, false);//videoはtrue,audioはfalse,
    }
  }
  else if (message.type === 'call audio') {//接続
    if (!canConnectMore()) {
      console.warn('TOO MANY connections, so ignore');
      debugMode("接続数が多すぎる");
    }
    else if (!localStream) {
      console.log("NO localStream");
      debugMode("NO localStream");
    }
    if (peerConnections[fromId]) {
      // already connnected, so skip
      console.log('already connected, so ignore');
      debugMode("already connected, so ignore");
    }
    else {
      console.log("connect audio");
      debugMode("connect audio");
      makeOffer(fromId, false, true);//videoはfalse,audioはtrue
    }
  }
  else if (message.type === 'call video and audio') {//接続
    if (!canConnectMore()) {
      console.warn('TOO MANY connections, so ignore');
      debugMode("接続数が多すぎる");
    }
    else if (!localStream) {
      console.log("NO localStream");
      debugMode("NO localStream");
    }
    if (peerConnections[fromId]) {
      // already connnected, so skip
      console.log('already connected, so ignore');
      debugMode("already connected, so ignore");
    }
    else {
      // connect new party
      console.log("connect video and audio");
      debugMode("connect video and audio");
      makeOffer(fromId, true, true);//videoもaudioもtrue
    }
  }

  else if (message.type === 'offer') {
    // -- got offer ---
    console.log('Received offer ...');
    debugMode("Received offer ...");
    let offer = new RTCSessionDescription(message);
    setOffer(fromId, offer);
  }
  else if (message.type === 'answer') {
    // --- got answer ---
    console.log('Received answer ...');
    debugMode("Received offer ...");
    let answer = new RTCSessionDescription(message);
    setAnswer(fromId, answer);
  }
  else if (message.type === 'candidate') {
    // --- got ICE candidate ---
    console.log('Received ICE candidate ...');
    debugMode("Received ICE candidate ...");
    let candidate = new RTCIceCandidate(message.ice);
    console.log(candidate);
    debugMode(candidate);
    addIceCandidate(fromId, candidate);
  }
});






// --- RTCPeerConnections ---
function canConnectMore() {//コネクションの限界値を超えないようにする
  return (peerConnections.length < MAX_CONNECTION_COUNT);
}

function removeMediaElementButton(id) {
  if (mediaElement[id]) {
    // if (document.getElementById("recieve_menu").mediaElement[id]) {//問題起こりそうだけど一旦消しとく
    document.getElementById("recieve_menu").removeChild(mediaElement[id]);
    delete mediaElement[id];
    // }
    if (remoteVideos[id]) {
      detachVideo(id);
    }
    if (remoteAudios[id]) {
      detachAudio(id);
    }
  }
}

function stopConnection(id) {
  console.log("stopTest");
  if (mediaElement[id]) {
    if (videoButton[id]) {
      delete videoButton[id];
    }
    if (audioButton[id]) {
      delete audioButton[id];
    }
    if (videoButtonFlag[id]) {
      delete videoButtonFlag[id];
    }
    if (audioButtonFlag[id]) {
      delete audioButtonFlag[id];
    }
    removeMediaElementButton(id)
  }

  if (peerConnections[id]) {
    let peer = peerConnections[id];
    peer.close();
    // deleteConnection(id);
    delete peerConnections[id];
  }
  if (mapPeer.get(id)) {
    mapPeer.delete(id);
  }
}

function stopAllConnection() {
  const keys = Object.keys(mediaElement);
  keys.forEach(function (id) {
    removeMediaElementButton(id);
    if (videoButton[id]) {
      delete videoButton[id];
    }
    if (audioButton[id]) {
      delete audioButton[id];
    }
    if (videoButtonFlag[id]) {
      delete videoButtonFlag[id];
    }
    if (audioButtonFlag[id]) {
      delete audioButtonFlag[id];
    }
  });
  mapPeer.forEach(function (value, id) {
    stopConnection(id);
  });
}

function attachMyVideo(stream) {
  let video = document.createElement('video');
  video.muted = true;
  video.autoplay = true;
  video.setAttribute('playsinline', '');
  video.width = '320';//受信側の要素の大きさを指定？
  // video.height = '180';
  video.style.border = 'solid black 1px';
  video.style.margin = '2px';
  container.prepend(video);
  localVideo = video;
  playMedia(video, stream);

  let p = document.createElement("p");
  p.textContent = "なんか再生できてないmyVideo";
  video.appendChild(p);
}

// --- video elements ---
function attachVideo(id, stream) {//remoteVideoの追加
  let video = document.createElement('video');
  video.muted = true;
  video.autoplay = true;
  video.setAttribute('playsinline', '');
  video.width = '320';//受信側の要素の大きさを指定？
  // video.height = '180';
  video.style.border = 'solid black 1px';
  video.style.margin = '2px';
  container.appendChild(video);
  video.id = 'remote_video_' + id;

  remoteVideos[id] = video;
  playMedia(video, stream);

  let p = document.createElement("p");
  p.textContent = "なんか再生できてないvideo";
  video.appendChild(p);
}


function attachAudio(id, stream) {//remoteAudioの追加
  let audio = document.createElement('audio');
  audio.autoplay = true;
  audio.id = 'remote_audio_' + id;
  container.appendChild(audio);
  remoteAudios[id] = audio;
  playMedia(audio, stream);
  audio.volume = 1;

  document.addEventListener('touchstart', attachAudioPlay, {
    passive: true,
  });
  function attachAudioPlay() {
    audio.play();
    audio.volume = 1;
    document.getElementById("graphic").removeEventListener('touchstart', attachAudioPlay);
  }

  let p = document.createElement("p");
  p.textContent = "なんか再生できてないaudio";
  audio.appendChild(p);

}




function detachMyVideo() {
  pauseMedia(localVideo);
  localVideo.width = '';//受信側の要素の大きさを指定？
  localVideo.height = '';
  localVideo.style.border = '';
  localVideo.style.margin = '';
  // container.removeChild(document.getElementById("localVideo"));
}

function detachVideo(id) {//remoteVideoの削除
  let video = remoteVideos[id];
  pauseMedia(video);
  container.removeChild(document.getElementById('remote_video_' + id));
  delete remoteVideos[id];
}

function detachAudio(id) {//remoteAudioの削除
  container.removeChild(document.getElementById('remote_audio_' + id));
  delete remoteAudios[id];
}


// ---------------------- media handling ----------------------- 
function startVideo() {
  if (videoStatus) {
    return;
  }


  let camera = {}
  switch (phoneCameraSelect.phoneCamera.value) {
    default:
      camera = { ideal: "environment" };
      break;
    case "environment":
      camera = { exact: "environment" };
      break;
    case "user":
      camera = { exact: "user" }
      break;
  }

  videoStatus =
  {
    width: { max: 320 },
    facingMode: camera,
    // height: { max: 180 }
  };
  getDeviceStream({
    video: videoStatus
  }) // audio: false <-- ontrack once, audio:true --> ontrack twice!!
    .then(function (stream) { // success
      document.getElementById('startVideo').style.backgroundColor = "skyblue";
      if (!localStream) {
        localStream = stream;
      }
      localVideoTrack = localStream.addTrack(stream.getVideoTracks()[0]);

      mapPeer.forEach(function (value, id) {
        if (videoStatus) {
          if (value.get("onVideo")) {
            value.set("oldVideo", stream.getVideoTracks()[0]);
            value.set("idOldVideo", stream.getVideoTracks()[0].id)
            value.get("rtc").addTrack(value.get("oldVideo"), stream);
          };
        }
      });

      attachMyVideo(stream);
      socket.emit('message', { type: 'createVideoButton' });
      document.getElementById('startVideo').onclick = function buttonClick() {
        stopVideo();
      }
    }).catch(function (error) { // error
      videoStatus = false;
      document.getElementById('startVideo').style.backgroundColor = "red";
      document.getElementById('startVideo').onclick = function buttonClick() {
        startVideo();
      }
      outputMsg("カメラの取得に失敗しました。", "red");
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
    mapPeer.forEach(function (value, id) {
      if (audioStatus) {
        if (value.get("onAudio")) {
          value.set("oldAudio", stream.getAudioTracks()[0]);
          value.set("idOldAudio", stream.getAudioTracks()[0].id);
          value.get("rtc").addTrack(value.get("oldAudio"), stream);
        }
      }
    });

    socket.emit('message', { type: 'createAudioButton' });

    document.getElementById('startAudio').onclick = function buttonClick() {
      stopAudio();
    }
  }).catch(function (error) { // error
    audioStatus = false;
    document.getElementById('startAudio').style.backgroundColor = "red";
    document.getElementById('startAudio').onclick = function buttonClick() {
      startAudio();
    }
    outputMsg("マイクの取得に失敗しました。", "red");
    debugMode('getUserMedia error:' + error);
    console.error('getUserMedia error:', error);

    return;
  });
}

// stop local video
function stopVideo() {
  document.getElementById('startVideo').style.backgroundColor = "red";
  videoStatus = false;
  mapPeer.forEach(function (value, id) {
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

  detachMyVideo();
  if (!videoStatus && !audioStatus) {
    stopLocalStream(localStream);
    localStream = null;
  }
  socket.emit('message', { type: "remove video button" });
  document.getElementById('startVideo').onclick = function buttonClick() {
    startVideo();
  }
}



function stopAudio() {
  document.getElementById('startAudio').style.backgroundColor = "red";
  audioStatus = false;
  mapPeer.forEach(function (value, id) {
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
  socket.emit('message', { type: "remove audio button" });

  document.getElementById('startAudio').onclick = function buttonClick() {
    startAudio();
    document.getElementById('startAudio').style.backgroundColor = "skyblue"
  }
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
  } else {
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



function sendSdp(id, sessionDescription) {
  let message = { type: sessionDescription.type, sdp: sessionDescription.sdp };
  message.sendto = id;
  socket.emit('message', message);
}

function sendIceCandidate(id, candidate) {
  let obj = { type: 'candidate', ice: candidate };


  if (peerConnections[id]) {
    obj.sendto = id;
    socket.emit('message', obj);
  }
  else {
    console.warn('connection NOT EXIST or ALREADY CLOSED. so skip candidate')
  }
}





function createVideoButton(id) {
  if (!mediaElement[id]) {
    mediaElement[id] = document.createElement('li');
    mediaElement[id].classList.add('flexContainer');
    mediaElement[id].classList.add('mediaElement');
    document.getElementById("recieve_menu").appendChild(mediaElement[id]);
    distributor[id] = document.createElement('text');
    distributor[id].classList.add("order1");
    distributor[id].innerHTML = avaP[id].userName;
    mediaElement[id].prepend(distributor[id]);
  }
  videoButton[id] = document.createElement('input');
  videoButton[id].classList.add("order2");
  videoButton[id].value = "動画受信"
  videoButton[id].type = "button";
  mediaElement[id].appendChild(videoButton[id]);

  if (checkAllListen) {//checkAllListenがonだったらボタンを押す
    if (videoButtonFlag[id] === undefined) {
      videoButtonFlag[id] = true;
    }
  }
  if (videoButtonFlag[id]) {//ボタンが押されていたら
    videoButtonFlag[id] = true;
    videoButton[id].style.backgroundColor = 'skyblue';
    if ((checkAllListen && !(audioButtonFlag[id] === false))) {//checkAllListenでcallAudioも呼ばれてる場合
      mediaConnect(id, "call video and audio");
    } else {
      mediaConnect(id, "call video");
    }
  } else {//押されてなかったら
    videoButton[id].style.backgroundColor = "red";
    videoButton[id].onclick = function buttonClick() {
      videoButtonFlag[id] = true;
      mediaConnect(id, "call video");
    }
  }
}



function createAudioButton(id) {
  if (!mediaElement[id]) {
    mediaElement[id] = document.createElement('li');
    mediaElement[id].classList.add('flexContainer');
    mediaElement[id].classList.add('mediaElement');
    document.getElementById("recieve_menu").appendChild(mediaElement[id]);
    distributor[id] = document.createElement('text');
    distributor[id].classList.add("order1");
    distributor[id].innerHTML = avaP[id].userName;
    mediaElement[id].prepend(distributor[id]);
  }

  audioButton[id] = document.createElement('input');
  audioButton[id].classList.add("order2");
  audioButton[id].value = "音声受信"
  audioButton[id].type = "button";
  mediaElement[id].appendChild(audioButton[id]);


  if (!audioVolume[id]) {
    audioVolume[id] = document.createElement('input');
    audioVolume[id].id = id;
    audioVolume[id].classList.add("order3");
    // audioVolume[id] =  classList.add('audioVolume');
    audioVolume[id].type = "range";
    audioVolume[id].name = "speed";
    audioVolume[id].value = 0.5;
    audioVolume[id].min = "0";
    audioVolume[id].max = "1";
    audioVolume[id].step = "0.01";
    audioVolume[id].onchange = function setAudioVolume() {
      if (remoteAudios[id]) {
        let audio = remoteAudios[id];
        audio.volume = document.getElementById(id).value;
      }
    }
    mediaElement[id].appendChild(audioVolume[id]);
  }

  if (checkAllListen) {//checkAllListenがonだったらボタンを押す
    if (audioButtonFlag[id] === undefined) {
      audioButtonFlag[id] = true;
    }
  }

  if (audioButtonFlag[id]) {//ボタンが既に押されていたら
    audioButton[id].style.backgroundColor = 'skyblue';
    mediaConnect(id, "call audio");
  } else {//押されてなかったら
    audioButton[id].style.backgroundColor = "red";
    audioButton[id].onclick = function buttonClick() {
      audioButtonFlag[id] = true;
      mediaConnect(id, "call audio");
    }
  }
}


// ---------------------- connection handling -----------------------
function prepareNewConnection(id) {
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
    peer.ontrack = function (event) {
      console.log("test1");
      let stream = event.streams[0];
      console.log("test2");
      //追加の場合
      let track = event.track;
      console.log("test3");
      if (track.kind === 'video') {
        console.log("test4");
        if (videoButtonFlag[id] === true && !remoteVideos[id]) {//videoButtonがonの時
          console.log("test5");
          videoButton[id].style.backgroundColor = 'skyblue';
          console.log("test6");
          attachVideo(id, stream);
          console.log("test7");
          videoButton[id].onclick = function buttonClick() {//videoButtonがクリックされた時
            console.log("test8");
            videoButtonFlag[id] = false;
            console.log("test9");
            mediaConnect(id, "stop video");
            console.log("test10");
            ///映像が直ぐに消えないならdetachvideoとかやる
          }
        }
      }
      else if (track.kind === 'audio') {
        if (audioButtonFlag[id] === true && !remoteAudios[id]) {//audioButtonがonの時
          audioButton[id].style.backgroundColor = 'skyblue';
          attachAudio(id, stream);
          audioButton[id].onclick = function buttonClick() {//audioButtonがクリックされた時
            audioButtonFlag[id] = false;
            mediaConnect(id, "stop audio");
          }
        }
      }
      stream.onaddtrack = function (evt) {
        const trackOnAdd = evt.track;
        if (trackOnAdd.kind === 'video') {
          console.log("onAddTrackVideo");
        }
        else if (trackOnAdd.kind === 'audio') {
          console.log("onAddTrackAudio");
        }
      };

      stream.onremovetrack = function (evt) {//除去の場合
        console.log("remTest1");

        const trackRemove = evt.track;
        console.log("remTest2");
        if (trackRemove.kind === 'video') {// video除去時の処理
          console.log("remTest3");
          if (remoteVideos[id]) {
            console.log("remTest4");
            detachVideo(id);
            console.log("remTest5");
          }
          console.log("remTest6");
          if (videoButton[id] && videoButtonFlag[id] === false) {//リスナー側が切っただけの場合
            console.log("remTest7");
            videoButton[id].style.backgroundColor = "red";
            console.log("remTest8");
            videoButton[id].onclick = function buttonClick() {
              console.log("remTest9");
              videoButtonFlag[id] = true;
              console.log("remTest10");
              mediaConnect(id, "call video");
              console.log("remTest11");
            }
          }
        } else if (trackRemove.kind === 'audio') {// audio除去時の処理
          if (remoteAudios[id]) {
            detachAudio(id);
          }
          if (audioButton[id] && audioButtonFlag[id] === false) {//リスナー側が切っただけの場合
            audioButton[id].style.backgroundColor = "red";
            audioButton[id].onclick = function buttonClick() {
              audioButtonFlag[id] = true;
              mediaConnect(id, "call audio");
            }
          }


          // if (!audioButton[id] && mediaElement[id]) {
          //   document.getElementById("recieve_menu").removeChild(mediaElement[id]);
          // }
        }
      };

    };
  }
  else {
    // peer.onaddstream = function (event) {
    //   let stream = event.stream;
    //   console.log('-- peer.onaddstream() stream.id=' + stream.id);
    //playMedia(remoteVideo, stream);
    // attachVideo(id, stream);///要修正
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
        sendIceCandidate(id, evt.candidate);
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
        }).then(function () {
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

  peer.onsignalingstatechange = function () {
    console.log('== signaling status=' + peer.signalingState);
    debugMode('== signaling status=' + peer.signalingState);
  };

  peer.oniceconnectionstatechange = function () {
    console.log('== ice connection status=' + peer.iceConnectionState);
    if (peer.iceConnectionState === 'disconnected') {
      console.log('-- disconnected --');
      stopConnection(id);

      debugMode('-- disconnected --');
    }
  };

  peer.onicegatheringstatechange = function () {
    console.log('==***== ice gathering state=' + peer.iceGatheringState);
    debugMode('==***== ice gathering state=' + peer.iceGatheringState);
  };

  // peer.onconnectionstatechange = function () {//firefoxに対応してないので使わない
  //   console.log('==***== connection state=' + peer.connectionState);
  // };

  // Data channel イベントが発生したときのイベントハンドラ
  // - このイベントは、createDataChannel() を呼び出すリモートピアによって
  //   RTCDataChannelが接続に追加されたときに送信されます。
  //   see : https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ondatachannel
  peer.ondatachannel = function (event) {
    // console.log("Event : Data channel");；
    // DataChannelオブジェクトをRTCPeerConnectionオブジェクトのメンバーに追加。
    peer.datachannel = event.channel;
    // DataChannelオブジェクトのイベントハンドラの構築
    console.log("Call : setupDataChannelEventHandler()");
    setupDataChannelEventHandler(peer);
    peer.createOffer()
      .then(function (sessionDescription) {
        return peer.setLocalDescription(sessionDescription);//これでSDPを覚える
      }).then(function () {
        // 初期OfferSDPをDataChannelを通して相手に直接送信
        console.log("- Send OfferSDP through DataChannel");
        peer.datachannel.send(JSON.stringify({ type: "offer", data: peer.localDescription, id: id }));
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
  rtcPeerConnection.datachannel.onmessage = function (event) {//datachanelの受信
    console.log("DataChannel Event : message");
    let objData = JSON.parse(event.data);
    console.log("- type : ", objData.type);
    debugMode(objData.type);
    console.log("- data : ", objData.data);
    debugMode(objData.date);

    if ("message" === objData.type) {
      // 受信メッセージをメッセージテキストエリアへ追加
      // let strMessage = objData.data;
      // g_elementTextareaMessageReceived.value = strMessage + "\n" + g_elementTextareaMessageReceived.value; // 一番上に追加
      // //g_elementTextareaMessageReceived.value += strMessage + "\n";  // 一番下に追加
    } else if ("offer" === objData.type) {
      // 受信したOfferSDPの設定とAnswerSDPの作成
      setOfferDataChannel(rtcPeerConnection, objData.data, objData.id);
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
      debugMode("calltest1");
      if (videoStatus) {
        debugMode("calltest2");
        mapPeer.forEach(function (value, id) {
          debugMode("calltest3");
          if (value.get("rtc") === rtcPeerConnection) {
            debugMode("calltest4");
            if (!value.get("idOldVideo")) {
              debugMode("calltest5");
              value.set("onVideo", true);
              debugMode("calltest6");
              value.set("oldVideo", localStream.getVideoTracks()[0]);
              debugMode("calltest7");
              value.set("idOldVideo", localStream.getVideoTracks()[0].id);
              debugMode("calltest8");
              value.get("rtc").addTrack(value.get("oldVideo"), localStream);
              debugMode("calltest9");
            }
          }
        });
      }
    } else if ("call audio" === objData.type) {
      if (audioStatus) {
        mapPeer.forEach(function (value, id) {
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
        mapPeer.forEach(function (value, id) {
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
        mapPeer.forEach(function (value, id) {
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
      mapPeer.forEach(function (value, id) {
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
      mapPeer.forEach(function (value, id) {
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




function makeOffer(id, video, audio) {
  let peerConnection = prepareNewConnection(id);
  mapPeer.set(id, new Map());


  if (localStream) {//これで受信した時にstreamにぶち込む
    console.log('Adding local stream...');
    if (videoStatus && video) {
      mapPeer.get(id).set("oldVideo", localStream.getVideoTracks()[0]);
      mapPeer.get(id).set("idOldVideo", localStream.getVideoTracks()[0].id);
      peerConnection.addTrack(mapPeer.get(id).get("oldVideo"), localStream);
    }
    if (audioStatus && audio) {
      mapPeer.get(id).set("oldAudio", localStream.getAudioTracks()[0]);
      mapPeer.get(id).set("idOldAudio", localStream.getAudioTracks()[0].id);
      peerConnection.addTrack(mapPeer.get(id).get("oldAudio"), localStream);
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

  peerConnections[id] = peerConnection;
  mapPeer.get(id).set("rtc", peerConnection);

  peerConnection.createOffer()
    .then(function (sessionDescription) {
      return peerConnection.setLocalDescription(sessionDescription);//これが鍵、これでSDPを覚え直す
    }).then(function () {
      // -- Trickle ICE の場合は、初期SDPを相手に送る --
      sendSdp(id, peerConnection.localDescription);
    }).catch(function (err) {
      console.error(err);
      debugMode(err);
    });
}

function setOffer(id, sessionDescription) {//message.type === 'offer'の時使う

  let peerConnection = prepareNewConnection(id);
  mapPeer.set(id, new Map());

  peerConnections[id] = peerConnection;
  mapPeer.get(id).set("rtc", peerConnection);

  peerConnection.setRemoteDescription(sessionDescription)
    .then(function () {
      if (!peerConnection) {
        console.error('peerConnection NOT exist!');
        debugMode('peerConnection NOT exist!');
        return;
      }
      peerConnection.createAnswer()
        .then(function (sessionDescription) {
          return peerConnection.setLocalDescription(sessionDescription);
        }).then(function () {
          // -- Trickle ICE の場合は、初期SDPを相手に送る -- 
          sendSdp(id, peerConnection.localDescription);
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
function setOfferDataChannel(rtcPeerConnection, sessionDescription, id) {
  rtcPeerConnection.setRemoteDescription(sessionDescription)
    .then(function () {
      rtcPeerConnection.createAnswer()
        .then(function (sessionDescription) {
          return rtcPeerConnection.setLocalDescription(sessionDescription);
        }).then(function () {
          if (!isDataChannelOpen(rtcPeerConnection)) {   // チャット前
            // 初期AnswerSDPをサーバーを経由して相手に送信
            sendSdp(id, rtcPeerConnection.localDescription);
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


function setAnswer(id, sessionDescription) {//message.type === 'answer'の時使う
  let peerConnection = peerConnections[id];
  if (!peerConnection) {
    console.error('peerConnection NOT exist!');
    debugMode('peerConnection NOT exist!');
    return;
  }

  peerConnection.setRemoteDescription(sessionDescription)
    .then(function () {
      console.log('setRemoteDescription(answer) succsess in promise');
    }).catch(function (err) {
      console.error('setRemoteDescription(answer) ERROR: ', err);
      debugMode('setRemoteDescription(answer) ERROR: ' + err);
    });
}

// AnswerSDPの設定//dateChannel用,後で整理したほうがいいかな
function setAnswerDataChannel(rtcPeerConnection, sessionDescription) {
  console.log("Call : rtcPeerConnection.setRemoteDescription()");
  rtcPeerConnection.setRemoteDescription(sessionDescription)
    .catch(function (error) {
      console.error("Error : ", error);
      debugMode("Error : " + error);

    });
}

// --- tricke ICE ---
function addIceCandidate(id, candidate) {
  if (!peerConnections[id]) {
    console.warn('NOT CONNEDTED or ALREADY CLOSED with id=' + id + ', so ignore candidate');
    return;
  }

  let peerConnection = peerConnections[id];
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
function mediaConnect(id, type) {
  console.log("mediaConnectTest1");
  if (!canConnectMore()) {
    console.log("mediaConnectTest2");
    console.log('TOO MANY connections');
    console.log("mediaConnectTest3");
  } else {
    console.log("mediaConnectTest4");
    if (mapPeer.get(id)) {
      console.log("mediaConnectTest5");
      if (isDataChannelOpen(mapPeer.get(id).get("rtc"))) {//接続済の場合
        console.log("mediaConnectTest6");
        mapPeer.get(id).get("rtc").datachannel.send(JSON.stringify({ type: type }));
        console.log("mediaConnectTest7");
      }
      console.log("mediaConnectTest8");
    } else {//まだ未接続の場合
      console.log("mediaConnectTest9");
      if (type == "call video and audio" || type == "call video" || type == "call audio") {
        console.log("mediaConnectTest10");
        socket.emit('message', { sendto: id, type: type });
        console.log("mediaConnectTest11");
      }
    }
  }
}




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