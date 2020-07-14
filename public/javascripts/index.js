'use strict';
//大雑把に目次
//変数宣言等
//フォント切り替え※後で消すからこの位置
//webGL(PIXIJS)の設定開始
//画像読み込み
//setUp()・・・画像切り取り、画像設定、座標表示設定、submit設定、gameLoop();
//socket.on("mySocketID"
//ブロックの配置、タップやアニメの設定、クッキー読み込み、看板機能
//login()・・・名前出力、クッキー書き込み、ログイン画面消去、エントランスの設定、座標関連、フォーム切り替え、changeRoomPoint()
//部屋移動・・changeRoomPoint()、socket.on("leave_room"、socket.on("join_me"、socket.on("join_room")、moveMsg()//移動時のメッセージ
// メッセージ関連・・・socket.on("emit_msg"、アボン処理
//socket.on("mySocketID"、socket.on("login_me"、socket.on("loadAvatar")
//ログアウト処理
//function gameLoop()
//再起動用メッセージ
//背景色を変える、画面リサイズの処理
//Ｐくｎ

//ソケットIOをonにする
let socket = io.connect('153.127.33.40:3000');


//アバターの初期位置
let AX = 300;
let AY = 200;
let DIR = "S";

let userName;

let socketID;

let avaP = [];

//ここ配列にしたほうが良いかいな
let avaS = [], avaSW = [], avaW = [], avaNW = [], avaN = [], avaNE = [], avaE = [], avaSE = [];
let avaS1 = [], avaSW1 = [], avaW1 = [], avaNW1 = [], avaN1 = [], avaNE1 = [], avaE1 = [], avaSE1 = [];
let avaS2 = [], avaSW2 = [], avaW2 = [], avaNW2 = [], avaN2 = [], avaNE2 = [], avaE2 = [], avaSE2 = [];
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
let necosuke = {};

let moveX, moveY;
let moveX1, moveY1;
let moveX2, moveY2;
let moveX3, moveY3;
let rightY, leftY;

let flag = false;
let setAbon = [];



//ログ音
let msgSE = {};
msgSE.login = {};
msgSE.login.in = [];
msgSE.login.in[0] = new Audio('sound/login/tirin1.mp3');

msgSE.other = {};
msgSE.other.in = [];
msgSE.other.log = [];
msgSE.other.out = [];
msgSE.other.logout = [];
msgSE.other.in[0] = new Audio('sound/otherRoomIn/cursor7.mp3');
msgSE.other.in[1] = new Audio('sound/otherRoomIn/touch1.mp3');
msgSE.other.log[0] = new Audio('sound/otherRoomLog/cute-motion1.mp3');
msgSE.other.log[1] = new Audio('sound/otherRoomLog/nyu3.mp3');
msgSE.other.log[2] = new Audio('sound/otherRoomLog/papa1.mp3');
msgSE.other.log[3] = new Audio('sound/otherRoomLog/se_maoudamashii_system10.mp3');
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
msgSE.utyu.log[0] = new Audio('sound/utyuLog/se_maoudamashii_retro16.mp3');
msgSE.utyu.log[1] = new Audio('sound/utyuLog/se_maoudamashii_se_sound15.mp3');
msgSE.utyu.log[2] = new Audio('sound/utyuLog/se_maoudamashii_system42.mp3');
msgSE.utyu.log[3] = new Audio('sound/utyuLog/se_maoudamashii_system45.mp3');
msgSE.utyu.log[4] = new Audio('sound/utyuLog/se_maoudamashii_system48.mp3');
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



//エイリアス
let html = document.querySelector('html')
let body = document.querySelector('body')
let main = document.getElementById("main");
let titleBar = document.getElementById("titleBar");
let title = document.getElementById("title");

let Pmachi = document.getElementById("Pmachi");
let Pmain = document.getElementById("Pmain");
let loginButton = document.getElementById("loginButton");
let graphic = document.getElementById("graphic");
let fontSousenkyo = document.getElementById("fontSousenkyo");
let chatLog = document.getElementById("chatLog");
let footer = document.getElementById("footer");
let kousinrireki = document.getElementById("kousinrireki");
let day = document.getElementById('day');
let form = document.getElementById('form');
let nameForm = document.getElementById('nameForm');
let msgForm = document.getElementById('msgForm');
let usersDisplay = document.getElementById('usersDisplay');
let usersNumber = document.getElementById('usersNumber');
let PmainFooterChild = document.getElementsByClassName("PmainFooterChild");
let visibleLogButton = document.getElementById('visibleLogButton');
let logs = document.getElementById('logs');
let logNoiseButton = document.getElementById('logNoiseButton');
let pastLog = document.getElementById('pastLog');
let wa_i = document.getElementById('wa_i');
let clear = document.getElementById('clear');
let effectVolume = document.getElementById('effectVolume');


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
nameTextFont.options[1].selected = true;//選択位置を変更
chatFont.options[2].selected = true;
titleFont.options[8].selected = true;
sonotaFont.options[2].selected = true;
function fontChange(value) {
  switch (value) {
    case "chatLog":
      obj = chatFont;
      break;
    case "title":
      obj = titleFont;
      break;
    case "sonota":
      obj = sonotaFont;
      break;
    case "nameText":
      obj = nameTextFont;
      break;
  }
  index = obj.selectedIndex;
  switch (index) {
    case 0:
      fontName = "鉄瓶ゴシック";
      fontSize = 16;
      break;
    case 1:
      fontName = "JKゴシックM";
      fontSize = 17;
      break;
    case 2:
      fontName = "kosugiMaru";
      fontSize = 17;
      break;
    case 3:
      fontName = "チカラヅヨク";
      fontSize = 18;
      break;
    case 4:
      fontName = "チカラヨワク";
      fontSize = 18;
      break;
    case 5:
      fontName = "MSゴシック";
      fontSize = 18;
      break;
    case 6:
      fontName = "UD Digi Kyokasho N-R";
      fontSize = 18;
      break;
    case 7:
      fontName = "游ゴシック";
      fontSize = 18;
      break;
    case 8:
      fontName = "microsoft jhenghei UI light";
      fontSize = 18;
      break;
  }
  switch (value) {
    case "chatLog":
      chatLog.style.fontFamily = fontName, "游ゴシック", "Yu Gothic", "MS ゴシック", 'メイリオ', 'Meiryo', "monospace";
      chatLog.style.fontSize = fontSize + "px";
      chatFont.style.fontFamily = fontName;
      break;
    case "title":
      title.style.fontFamily = fontName;
      title.style.fontSize = fontSize + 37 + "px";
      titleFont.style.fontFamily = fontName;
      break;
    case "sonota":
      body.style.fontFamily = fontName;
      sonotaFont.style.fontFamily = fontName;
      break;
    case "nameText":
      nameText[socketID].style = {
        fontFamily: fontName,
        fontSize: 18,
        fill: "white",
        trim: true,
      }
      break;
  }
};


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
  gomaneco.S = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2020, 0, 40, 70));
  gomaneco.S1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2060, 0, 40, 70));

  gomaneco.SW = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2100, 0, 40, 70));
  gomaneco.SW1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2140, 0, 40, 70));
  gomaneco.SW2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2180, 0, 40, 70));

  gomaneco.W = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2220, 0, 40, 70));
  gomaneco.W1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2260, 0, 40, 70));
  gomaneco.W2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2300, 0, 40, 70));

  gomaneco.NW = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2340, 0, 40, 70));
  gomaneco.NW1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2380, 0, 40, 70));
  gomaneco.NW2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2420, 0, 40, 70));

  gomaneco.N = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2460, 0, 40, 70));
  gomaneco.N1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2500, 0, 40, 70));


  // gomaneco.Sleep = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(0, 0, 40, 20));
  // gomaneco.Sleep1= new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(40, 0, 40, 70));
  // gomaneco.Sleep2= new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(80, 0, 40, 70));



  necosuke.S = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2020, 70, 50, 80));
  necosuke.S1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2070, 70, 50, 80));


  necosuke.SW = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2120, 70, 50, 80));
  necosuke.SW1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2170, 70, 50, 80));
  necosuke.SW2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2220, 70, 50, 80));

  necosuke.W = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2270, 70, 50, 80));
  necosuke.W1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2320, 70, 50, 80));
  necosuke.W2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2370, 70, 50, 80));

  necosuke.NW = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2420, 70, 50, 80));
  necosuke.NW1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2470, 70, 50, 80));
  necosuke.NW2 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2520, 70, 50, 80));

  necosuke.N = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2570, 70, 50, 80));
  necosuke.N1 = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2620, 70, 50, 80));


  gomaneco.Face = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1980, 0, 40, 40));
  necosuke.Face = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1980, 40, 40, 40));


  avaAbon = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1980, 1300, 40, 70));



  //login画面をクリックできるようにする
  loginBack.sortableChildren = true;//子要素のzIndexをonにする。
  app.stage.addChild(loginBack);//画像を読みこむ
  tapRange(loginBack);




  //エントランス画面
  entrance = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1320, 0, 660, 480));
  ground = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(660, 0, 660, 480));
  croud = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(660, 480, 660, 200));
  bonfire = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(660, 680, 660, 280));
  daikokubasira = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(2020, 1340, 50, 100));
  //宇宙画面
  utyu = new PIXI.Texture(PIXI.BaseTexture.from("all"), new PIXI.Rectangle(1320, 480, 660, 480));


  socket.emit("getMySocketID", {});//サーバーに入ったことを伝える


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
    nameText[socketID].text = (nameForm.userName.value);//名前タグに出力
    e.preventDefault();//画面遷移を防ぐ
    login();
  });



  // マウス座標を表示
  app.stage.addChild(MtextX);
  app.stage.addChild(MtextY);
  app.stage.addChild(AtextX);
  app.stage.addChild(AtextY);
  gameLoop();
}//function setUpはここで終わり

function setAvatar(thisSocketID, thisAvatar, thisWidth) {
  avaS[thisSocketID] = new PIXI.Sprite(thisAvatar.S);
  avaS1[thisSocketID] = new PIXI.Sprite(thisAvatar.S1);
  avaS2[thisSocketID] = new PIXI.Sprite(thisAvatar.S1);
  avaS2[thisSocketID].width = -thisWidth;
  avaSW[thisSocketID] = new PIXI.Sprite(thisAvatar.SW);
  avaSW1[thisSocketID] = new PIXI.Sprite(thisAvatar.SW1);
  avaSW2[thisSocketID] = new PIXI.Sprite(thisAvatar.SW2);
  avaW[thisSocketID] = new PIXI.Sprite(thisAvatar.W);
  avaW1[thisSocketID] = new PIXI.Sprite(thisAvatar.W1);
  avaW2[thisSocketID] = new PIXI.Sprite(thisAvatar.W2);
  avaNW[thisSocketID] = new PIXI.Sprite(thisAvatar.NW);
  avaNW1[thisSocketID] = new PIXI.Sprite(thisAvatar.NW1);
  avaNW2[thisSocketID] = new PIXI.Sprite(thisAvatar.NW2);
  avaN[thisSocketID] = new PIXI.Sprite(thisAvatar.N);
  avaN1[thisSocketID] = new PIXI.Sprite(thisAvatar.N1);
  avaN2[thisSocketID] = new PIXI.Sprite(thisAvatar.N1);
  avaN2[thisSocketID].width = -thisWidth;

  avaNE[thisSocketID] = new PIXI.Sprite(thisAvatar.NW);
  avaNE[thisSocketID].width = -thisWidth;
  avaNE1[thisSocketID] = new PIXI.Sprite(thisAvatar.NW1);
  avaNE1[thisSocketID].width = -thisWidth;
  avaNE2[thisSocketID] = new PIXI.Sprite(thisAvatar.NW2);
  avaNE2[thisSocketID].width = -thisWidth;
  avaE[thisSocketID] = new PIXI.Sprite(thisAvatar.W);
  avaE[thisSocketID].width = -thisWidth;
  avaE1[thisSocketID] = new PIXI.Sprite(thisAvatar.W1);
  avaE1[thisSocketID].width = -thisWidth;
  avaE2[thisSocketID] = new PIXI.Sprite(thisAvatar.W2);
  avaE2[thisSocketID].width = -thisWidth;
  avaSE[thisSocketID] = new PIXI.Sprite(thisAvatar.SW);
  avaSE[thisSocketID].width = -thisWidth;
  avaSE1[thisSocketID] = new PIXI.Sprite(thisAvatar.SW1);
  avaSE1[thisSocketID].width = -thisWidth;
  avaSE2[thisSocketID] = new PIXI.Sprite(thisAvatar.SW2);
  avaSE2[thisSocketID].width = -thisWidth;

  avaS[thisSocketID].anchor.set(0.5, 1);
  avaS1[thisSocketID].anchor.set(0.5, 1);
  avaS2[thisSocketID].anchor.set(0.5, 1);
  avaSW[thisSocketID].anchor.set(0.5, 1);
  avaSW1[thisSocketID].anchor.set(0.5, 1);
  avaSW2[thisSocketID].anchor.set(0.5, 1);
  avaW[thisSocketID].anchor.set(0.5, 1);
  avaW1[thisSocketID].anchor.set(0.5, 1);
  avaW2[thisSocketID].anchor.set(0.5, 1);
  avaNW[thisSocketID].anchor.set(0.5, 1);
  avaNW1[thisSocketID].anchor.set(0.5, 1);
  avaNW2[thisSocketID].anchor.set(0.5, 1);
  avaN[thisSocketID].anchor.set(0.5, 1);
  avaN1[thisSocketID].anchor.set(0.5, 1);
  avaN2[thisSocketID].anchor.set(0.5, 1);
  avaNE[thisSocketID].anchor.set(0.5, 1);
  avaNE1[thisSocketID].anchor.set(0.5, 1);
  avaNE2[thisSocketID].anchor.set(0.5, 1);
  avaE[thisSocketID].anchor.set(0.5, 1);
  avaE1[thisSocketID].anchor.set(0.5, 1);
  avaE2[thisSocketID].anchor.set(0.5, 1);
  avaSE[thisSocketID].anchor.set(0.5, 1);
  avaSE1[thisSocketID].anchor.set(0.5, 1);
  avaSE2[thisSocketID].anchor.set(0.5, 1);
};


socket.on("mySocketID", function (data) {
  nameForm.userName.value = localStorage.getItem('userName');//名前を出力
  socketID = data.socketID;
  //アバターの親コンテナを設定
  avaP[socketID] = new PIXI.Container();
  avaP[socketID].sortableChildren = true;//子要素のzIndexをonにする
  avaP[socketID].position.set(320, 200);

  //画像を追加
  avaP[socketID].avatar = localStorage.getItem('avatar');
  if (avaP[socketID].avatar == "necosuke") {
    console.log("ねこすけ裏設定：クールなまなざしを覗き込むと瞳の奥は燃えている　鳥のように飛べるんじゃないかと考えながら雲から飛び降りている　ごまねこが降りる様を見ると冷や汗をかいてしまう");
    avaP[socketID].avatar = "necosuke";
    setAvatar(socketID, necosuke, 50);
  } else {//デフォルト
    avaP[socketID].avatar = "gomaneco";
    setAvatar(socketID, gomaneco, 40);
    console.log("ごまねこ裏設定集：高いところが好きな高所恐怖症、飛び降りる時は少しの勇気が必要、目を開けられなくて毎回ちびっちゃう。綿あめを食べ過ぎて腹を壊した、雲を見るとたまに思い出す。");
  }

  //色設定//透明度設定
  if (localStorage.getItem("colorCode")) {
    setColor(socketID, localStorage.getItem("colorCode"));
  } else {
    avaP[socketID].avatarColor = 0XFFFFFF;
  }

  avaP[socketID].avatarAlpha = 1;


  //avaPに追加
  avaC[socketID] = avaS[socketID];
  avaP[socketID].addChild(avaC[socketID]);

  //名前タグを生成
  nameText[socketID] = new PIXI.Text(localStorage.getItem("avatarUserName"), nameTextStyle);
  nameText[socketID].zIndex = 10;
  nameText[socketID].anchor.set(0.5);
  nameText[socketID].position.set(0, -avaC[socketID].height - 15);
  avaP[socketID].addChild(nameText[socketID]);

  nameTag[socketID] = new PIXI.Graphics();
  nameTag[socketID].lineStyle(1, 0x000000, 0.5);
  nameTag[socketID].beginFill(0x000000);
  nameTag[socketID].drawRect(0, 0, nameText[socketID].width, nameText[socketID].height);
  nameTag[socketID].endFill();
  nameTag[socketID].x = -nameText[socketID].width / 2;
  nameTag[socketID].y = -avaC[socketID].height - 15 - nameText[socketID].height / 2;
  nameTag[socketID].alpha = 0.3;

  avaP[socketID].addChild(nameTag[socketID]);
  //ステージに追加
  loginBack.addChild(avaP[socketID]);


  gomaneco.Face = new PIXI.Sprite(gomaneco.Face);
  loginBack.addChild(gomaneco.Face);//login画面にgomaNocoFaceを追加
  gomaneco.Face.interactive = true;//クリックイベントを有効化
  gomaneco.Face.pointerdown = function () {//ごまねこアイコンクリック時にアバター変更
    localStorage.setItem("avatar", "gomaneco")//ローカルストレージにアバター設定
    avaP[socketID].avatar = "gomaneco";//親コンテナにアバターの種類を設定する
    console.log("ごまねこ裏設定集：高いところが好きな高所恐怖症、飛び降りる時は少しの勇気が必要、目を開けられなくて毎回ちびっちゃう。綿あめを食べ過ぎて腹を壊した、雲を見るとたまに思い出す。");
    setAvatar(socketID, gomaneco, 40);
    localStorage.removeItem("colorCode");
  };

  necosuke.Face = new PIXI.Sprite(necosuke.Face);
  loginBack.addChild(necosuke.Face);//login画面にnucosukeFaceを追加
  necosuke.Face.position.set(40, 0);
  necosuke.Face.interactive = true;//クリックイベントを有効化
  necosuke.Face.pointerdown = function () {//ねこすけアイコンクリック時にアバター変更
    localStorage.setItem("avatar", "necosuke");//ローカルストレージにアバター書き込み
    avaP[socketID].avatar = "necosuke";
    setAvatar(socketID, necosuke, 50);
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
    colorPalette.pointerdown = function () {
      setColor(socketID, colorCode);
      localStorage.setItem("colorCode", colorCode);
    }
  }



  //タイトルを触った時に背景色を変えて、色を増やす
  let uiColor = 0;
  let skyblue, mikaniro, kyuiro, siniro;
  title.addEventListener("touchstart", function () {//タップの場合
    flag = true;
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
  });
  title.addEventListener("click", function () {//クリックの場合
    if (flag) {
      flag = false;
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
  });




  //日付を触った時に半透明にする
  day.addEventListener("touchstart", function () {//タップの場合
    flag = true;
    if (avaP[socketID].avatarAlpha == 1) {
      setAlpha(socketID, 0.3);
      socket.json.emit("alphaChange", {
        alpha: 0.3,
      })
    } else {
      setAlpha(socketID, 1);
      socket.json.emit("alphaChange", {
        alpha: 1,
      });
    }
  });
  day.addEventListener("click", function () {//クリックの場合
    if (flag) {
      flag = false;
    } else {
      if (avaP[socketID].avatarAlpha == 1) {
        setAlpha(socketID, 0.3);
        socket.json.emit("alphaChange", {
          alpha: 0.3,
        });
      } else {
        setAlpha(socketID, 1);
        socket.json.emit("alphaChange", {
          alpha: 1,
        });
      }
    }
  });

  socket.on("alphaChange", function (data) {
    setAlpha(data.socketID, data.alpha);
  });


});

function setColor(thisSocketID, colorCode) {//色を変える
  avaP[thisSocketID].avatarColor = colorCode;
  avaS[thisSocketID].tint = colorCode;
  avaS1[thisSocketID].tint = colorCode;
  avaS2[thisSocketID].tint = colorCode;
  avaSW[thisSocketID].tint = colorCode;
  avaSW1[thisSocketID].tint = colorCode;
  avaSW2[thisSocketID].tint = colorCode;
  avaW[thisSocketID].tint = colorCode;
  avaW1[thisSocketID].tint = colorCode;
  avaW2[thisSocketID].tint = colorCode;
  avaNW[thisSocketID].tint = colorCode;
  avaNW1[thisSocketID].tint = colorCode;
  avaNW2[thisSocketID].tint = colorCode;
  avaN[thisSocketID].tint = colorCode;
  avaN1[thisSocketID].tint = colorCode;
  avaN2[thisSocketID].tint = colorCode;
  avaNE[thisSocketID].tint = colorCode;
  avaNE1[thisSocketID].tint = colorCode;
  avaNE2[thisSocketID].tint = colorCode;
  avaE[thisSocketID].tint = colorCode;
  avaE1[thisSocketID].tint = colorCode;
  avaE2[thisSocketID].tint = colorCode;
  avaSE[thisSocketID].tint = colorCode;
  avaSE1[thisSocketID].tint = colorCode;
  avaSE2[thisSocketID].tint = colorCode;
}

function setAlpha(thisSocketID, alpha) {//透明度を変える
  avaP[thisSocketID].avatarAlpha = alpha;
  avaS[thisSocketID].alpha = alpha;
  avaS1[thisSocketID].alpha = alpha;
  avaS2[thisSocketID].alpha = alpha;
  avaSW[thisSocketID].alpha = alpha;
  avaSW1[thisSocketID].alpha = alpha;
  avaSW2[thisSocketID].alpha = alpha;
  avaW[thisSocketID].alpha = alpha;
  avaW1[thisSocketID].alpha = alpha;
  avaW2[thisSocketID].alpha = alpha;
  avaNW[thisSocketID].alpha = alpha;
  avaNW1[thisSocketID].alpha = alpha;
  avaNW2[thisSocketID].alpha = alpha;
  avaN[thisSocketID].alpha = alpha;
  avaN1[thisSocketID].alpha = alpha;
  avaN2[thisSocketID].alpha = alpha;
  avaNE[thisSocketID].alpha = alpha;
  avaNE1[thisSocketID].alpha = alpha;
  avaNE2[thisSocketID].alpha = alpha;
  avaE[thisSocketID].alpha = alpha;
  avaE1[thisSocketID].alpha = alpha;
  avaE2[thisSocketID].alpha = alpha;
  avaSE[thisSocketID].alpha = alpha;
  avaSE1[thisSocketID].alpha = alpha;
  avaSE2[thisSocketID].alpha = alpha;
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
  if (lastPosition.x === null || lastPosition.y === null) {
    // ドラッグ開始時の線の開始位置
    oekaki[0].moveTo(x, y);
    oekaki[0].X = [x];
    oekaki[0].Y = [y];
  } else {
    // ドラッグ中の線の開始位置
    oekaki[0].moveTo(lastPosition.x, lastPosition.y);
    oekaki[0].X.push(x);
    oekaki[0].Y.push(y);
  }
  oekaki[0].lineTo(x, y);
  oekaki[0].zIndex = 1000;
  app.stage.getChildByName(room).addChild(oekaki[0]);

  lastPosition.x = x;
  lastPosition.y = y;
}

socket.on("oekaki", function (data) {
  oekaki[room][oekakiNum[room]] = new PIXI.Graphics();
  oekaki[room][oekakiNum[room]].zIndex = 1000;
  oekaki[room][oekakiNum[room]].lineStyle(2, 0xffffff);
  oekaki[room][oekakiNum[room]].moveTo(data.oekakiX[0], data.oekakiY[0])
  for (let i = 1; i < data.oekakiX.length; i++) {
    oekaki[room][oekakiNum[room]].lineTo(data.oekakiX[i], data.oekakiY[i]);
  }
  app.stage.getChildByName(room).addChild(oekaki[room][oekakiNum[room]]);
  oekakiNum[room]++;
});

socket.on("clearCanvas", function (data) {
  for (let i = 0; i < oekaki[room].length; i++) {
    app.stage.getChildByName(room).removeChild(oekaki[room][i]);
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
      ((MX <= colPoint[i].LX && colPoint[i].LX <= AX) || (AX <= colPoint[i].LX && colPoint[i].LX <= MX))
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
  value.pointerdown = function (event) {
    MX = event.data.getLocalPosition(value).x;
    MY = event.data.getLocalPosition(value).y;

    if (AX != MX || AY != MY) {//同一点なら移動しない//パターン１
      let sin = (MY - AY) / Math.sqrt(Math.pow(MX - AX, 2) + Math.pow(MY - AY, 2));

      if (inRoom == 0) {//ログイン画面に居るとき
        if (sin <= -0.9239) {
          anime(avaN, avaN1, avaN2, socketID);
        } else if (0.9239 <= sin) {
          anime(avaS, avaS1, avaS2, socketID);
        } else if (0.3827 <= sin && AX < MX) {
          anime(avaSE, avaSE1, avaSE2, socketID);
        } else if (0.3827 <= sin && MX < AX) {
          anime(avaSW, avaSW1, avaSW2, socketID);

        } else if (sin <= -0.3827 && AX < MX) {
          anime(avaNE, avaNE1, avaNE2, socketID);
        } else if (sin <= -0.3827 && MX < AX) {
          anime(avaNW, avaNW1, avaNW2, socketID);

        } else if (AX < MX) {
          anime(avaE, avaE1, avaE2, socketID);
        } else if (MX < AX) {
          anime(avaW, avaW1, avaW2, socketID);
        }

        gsap.to(avaP[socketID], {
          duration: 0.4, x: MX, y: MY, onComplete: function () { moveEnd(); }
        });

        function moveEnd() {
          AX = avaP[socketID].x;
          AY = avaP[socketID].y;
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
          tappedMove(socketID, AX, AY, DIR);
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
          if (colPointAll[0].TX < colPointAll[0].PX && colPointAll[0].PY < colPointAll[0].TY) {
            colMove(colPointAll[0], -1, -1);
          } else if (colPointAll[0].PX < colPointAll[0].TX && colPointAll[0].PY < colPointAll[0].TY) {
            colMove(colPointAll[0], -1, 1);
          } else if (colPointAll[0].TX < colPointAll[0].PX && colPointAll[0].TY < colPointAll[0].PY) {
            colMove(colPointAll[0], 1, -1);
          } else if (colPointAll[0].PX < colPointAll[0].TX && colPointAll[0].TY < colPointAll[0].PY) {
            colMove(colPointAll[0], 1, 1);
          }
        }
        // 初期化
        colPointAll = [];
      }
    }
    // document.msgForm.msg.focus();
  };
}



function anime(ava, ava1, ava2, value) {//引数：初期ava,歩いてるとき、歩いてるとき２、socketID
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
      avaC[value] = ava[value];
      avaP[value].addChild(avaC[value]);
    }
  });
}

function colMove(CPA, stopX, stopY) {//ブロックと衝突時の動きの式,CPAはcolPointALLの略、stopXとstopYはブロックの手前で止まってもらうための数字,バグ防止
  //交点に位置に移動する
  AX = CPA.LX + stopX;
  AY = CPA.LY + stopY;
  tappedMove(socketID, AX, AY, DIR);
  socket.json.emit("tapMap", {
    DIR: DIR,
    AX: AX,
    AY: AY,
  });
}


//移動時のソケット受け取り//自分以外の時にだけ使ってる
socket.on("tapMap", function (data) {
  if (setAbon[data.socketID] == false) {
    tappedMove(data.socketID, data.AX, data.AY, data.DIR);
  }
});

//数値を取得後のアバターの動き
function tappedMove(thisSocketID, thisAX, thisAY, DIR) {
  switch (DIR) {//子要素の画像を入れる
    case "NE":
      anime(avaNE, avaNE1, avaNE2, thisSocketID);
      break;
    case "SE":
      anime(avaSE, avaSE1, avaSE2, thisSocketID);
      break;
    case "SW":
      anime(avaSW, avaSW1, avaSW2, thisSocketID);
      break;
    case "NW":
      anime(avaNW, avaNW1, avaNW2, thisSocketID);
      break;
    case "N":
      anime(avaN, avaN1, avaN2, thisSocketID);
      break;
    case "E":
      anime(avaE, avaE1, avaE2, thisSocketID);
      break;
    case "S":
      anime(avaS, avaS1, avaS2, thisSocketID);
      break;
    default:
      anime(avaW, avaW1, avaW2, thisSocketID);
      break;
  }
  gsap.to(avaP[thisSocketID], {
    duration: 0.4, x: thisAX, y: thisAY, onComplete: function () {
      if (thisSocketID == socketID) {//オブジェクトの数が増えた時はここを書き換える
        if (room == "entrance" && 125 <= AX && AX <= 175 && 200 <= AY && AY <= 300) {
          changeSelfRoom("entrance", entrance, "utyu", utyu, 200, 300, "S", "utyu", "white");
        } else if (room == "utyu" && 141 <= AX && AX <= 146 && 73 <= AY && AY <= 81) {
          changeSelfRoom("utyu", utyu, "entrance", entrance, 150, 130, "S", "other", "black");
        }
      } else {
        if (avaP[thisSocketID].room == "entrance" && 125 <= thisAX && thisAX <= 175 && 200 <= thisAY && thisAY <= 300) {
          changeNonSelfRoomOut(thisSocketID, "utyu");
        } else if (avaP[thisSocketID].room == "utyu" && 141 <= thisAX && thisAX <= 146 && 73 <= thisAY && thisAY <= 81) {//宇宙の星の範囲内に入った時
          changeNonSelfRoomOut(thisSocketID, "entrance");
        }
        if (avaP[thisSocketID].roomIn > 1) {//バックグラウンド復帰時
          switch (DIR) {
            case "NE":
              avaC[thisSocketID] = avaNE[thisSocketID];
              avaP[thisSocketID].addChild(avaC[thisSocketID]);
              break;
            case "SE":
              avaC[thisSocketID] = avaSE[thisSocketID];
              avaP[thisSocketID].addChild(avaC[thisSocketID]);
              break;
            case "SW":
              avaC[thisSocketID] = avaSW[thisSocketID];
              avaP[thisSocketID].addChild(avaC[thisSocketID]);
              break;
            case "NW":
              avaC[thisSocketID] = avaNW[thisSocketID];
              avaP[thisSocketID].addChild(avaC[thisSocketID]);
              break;
            case "N":
              avaC[thisSocketID] = avaN[thisSocketID];
              avaP[thisSocketID].addChild(avaC[thisSocketID]);
              break;
            case "E":
              avaC[thisSocketID] = avaE[thisSocketID];
              avaP[thisSocketID].addChild(avaC[thisSocketID]);
              break;
            case "S":
              avaC[thisSocketID] = avaS[thisSocketID];
              avaP[thisSocketID].addChild(avaC[thisSocketID]);
              break;
            default:
              avaC[thisSocketID] = avaW[thisSocketID];
              avaP[thisSocketID].addChild(avaC[thisSocketID]);
              break;
          }
          avaP[thisSocketID].position.set(thisAX, thisAY);
        }
      }
    }
  });
}

function changeSelfRoom(beforeRoomString, beforeRoom, afterRoomString, afterRoom, thisAX, thisAY, thisDIR, thisSE, logCollor) {//自分自身の部屋が変わった時
  if (oekaki[room]) {
    for (let i = 0; i < oekaki[room].length; i++) {
      app.stage.getChildByName(room).removeChild(oekaki[room][i]);
    }
  }
  app.stage.removeChild(beforeRoom);
  room = afterRoomString;//移動先の部屋を設定
  roomSE = thisSE;
  app.stage.addChild(afterRoom);//画像を読みこむ
  avaP[socketID].removeChild(avaC[socketID]);
  AX = thisAX;
  AY = thisAY;
  DIR = thisDIR;
  socket.json.emit("roomIn", {
    socketID: socketID,//soket.id
    userName: userName,
    beforeRoom: beforeRoomString,
    afterRoom: afterRoomString,
    AX: AX,
    AY: AY,
    DIR: DIR,
  });
  gamenLog.style.fill = logCollor;
}

function changeNonSelfRoomOut(thisSocketID, afterRoom) {//自分以外が部屋から出るとき
  if (avaP[thisSocketID].roomIn == 1) {
    app.stage.getChildByName(avaP[thisSocketID].room).removeChild(avaP[thisSocketID]);
    avaP[thisSocketID].room = afterRoom;
  }
  avaP[thisSocketID].roomIn--;
  usersNumber.textContent--;
  moveMsg(nameText[thisSocketID].text + "が" + afterRoom + "に移動しました。");
}







socket.on("roomInNonSelf", function (data) {//自分以外が部屋にログインor入室してきた時
  app.stage.getChildByName(data.room).addChild(avaP[data.socketID]);//部屋にアバターを入れる
  avaP[data.socketID].room = data.room;
  avaP[data.socketID].position.set(data.AX, data.AY);
  avaP[data.socketID].roomIn++;
  avaP[data.socketID].removeChild(avaC[data.socketID]);
  switch (data.DIR) {
    case "NE":
      avaC[data.socketID] = avaNE[data.socketID];
      avaP[data.socketID].addChild(avaC[data.socketID]);
      break;
    case "SE":
      avaC[data.socketID] = avaSE[data.socketID];
      avaP[data.socketID].addChild(avaC[data.socketID]);
      break;
    case "SW":
      avaC[data.socketID] = avaSW[data.socketID];
      avaP[data.socketID].addChild(avaC[data.socketID]);
      break;
    case "NW":
      avaC[data.socketID] = avaNW[data.socketID];
      avaP[data.socketID].addChild(avaC[data.socketID]);
      break;
    case "N":
      avaC[data.socketID] = avaN[data.socketID];
      avaP[data.socketID].addChild(avaC[data.socketID]);
      break;
    case "E":
      avaC[data.socketID] = avaE[data.socketID];
      avaP[data.socketID].addChild(avaC[data.socketID]);
      break;
    case "S":
      avaC[data.socketID] = avaS[data.socketID];
      avaP[data.socketID].addChild(avaC[data.socketID]);
      break;
    default:
      avaC[data.socketID] = avaW[data.socketID];
      avaP[data.socketID].addChild(avaC[data.socketID]);
      break;
  }
  moveMsg(data.msg);
  usersNumber.textContent = data.users;//部屋人数の表記を変える
  if (useLogChime) {//部屋入室の音を鳴らす
    msgSE[roomSE].in[data.random].play();
  }

  //こっからは入室時のみあればいい
  msg[data.socketID].text = "";
  if (avaP[data.socketID].roomIn > 1) {//バックグラウンド復帰時に指示を出す
    tappedMove(data.socketID, data.AX, data.AY, data.DIR);
  }
});


socket.on("roomOutNonSelf", function (data) {//自分以外が部屋から退室した時
  if (useLogChime) {//ログチャイムがオンになってたら退室の音を鳴らす
    msgSE[roomSE].out[data.random].play();
  }
});




//看板機能
let isDownedShift = false;
msgForm.addEventListener("keydown", function (e) {
  isDownedShift = e.shiftKey;
});
msgForm.addEventListener("keyup", function (e) {
  isDownedShift = e.shiftKey;
});
msgForm.addEventListener("submit", function (e) {
  if (isDownedShift) {//シフトが押されてる場合
    socket.json.emit("emit_msg", {
      socketID: socketID,
      msg: (msgForm.msg.value),
      kanban: true,
    });
    msgForm.msg.value = "";
    msgForm.msg.focus();
  } else {//シフトが推されてない時
    socket.json.emit("emit_msg", {
      socketID: socketID,
      msg: (msgForm.msg.value),
      kanban: false,
    });
    msgForm.msg.value = "";//メッセージ入力欄を空にする
    msgForm.msg.focus();//メッセージ入力欄にフォーカスを合わせる
  }
  e.preventDefault();
});

//ログイン時の処理
function login() {
  userName = nameForm.userName.value;
  if (userName) {//名前が空だと移動しない
    localStorage.setItem("userName", userName);//ローカルストレージに名前書き込み

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
      avatar: avaP[socketID].avatar,
      avatarColor: avaP[socketID].avatarColor,
      avatarAlpha: avaP[socketID].avatarAlpha,
    });


    //フォームを切り替える
    nameForm.style.display = "none";
    msgForm.style.display = "block";
    loginButton.parentNode.removeChild(loginButton);
    msgForm.msg.focus();
    inRoom = 1;

  }


  //wa_iButtunがオフの時
  window.addEventListener("keydown", function (e) {
    if (clickedWa_iButtun == false) {
      isDownCtrl = e.ctrlKey;
      if (e.ctrlKey) {
        wa_i.style.backgroundColor = 'skyblue';
      }
    }
  });
  window.addEventListener("keyup", function (e) {
    if (clickedWa_iButtun == false) {
      isDownCtrl = e.ctrlKey;
      if (e.ctrlKey == false) {
        wa_i.style.backgroundColor = 'red';
      }
    }
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
      });
      app.stage.getChildByName(room).removeChild(oekaki[0]);
      lastPosition.x = null;
      lastPosition.y = null;
      oekaki[0] = new PIXI.Graphics();
      oekaki[0].lineStyle(2, 0xffffff);
      oekakityu = false;
    }
    pointDown = false;
  }
  app.stage.getChildByName("entrance").mouseup = function () {
    pointDown = false;
  }


  oekaki[0] = new PIXI.Graphics();
  oekaki[0].lineStyle(2, 0xffffff);
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

function moveMsg(moveMsg) {//移動時のメッセージ出力
  const li = document.createElement("li");
  li.textContent = moveMsg;
  const ul = document.querySelector("ul");
  //メッセージを出力
  if (window.innerWidth > 700 && chatLog.scrollHeight <= chatLog.clientHeight + chatLog.scrollTop + 1) {//windowsizeが700以上の時かつスクロールバーが一番下にある時にスクロールバーを自動移動
    ul.insertBefore(li, logs.querySelectorAll("li")[li.length]);
    chatLog.scrollTop = chatLog.scrollHeight;
  } else {
    ul.insertBefore(li, logs.querySelectorAll("li")[li.length]);
  }

  gamenLog.text = moveMsg + "\n" + gamenLog.text;
  app.stage.addChild(gamenLog);

}

//過去ログ表示
let usePastLog = false;
pastLog.style.backgroundColor = 'red';
function pastLogButtonClicked() {
  if (usePastLog) {
    pastLog.style.backgroundColor = 'red';
    chatLog.style.height = 0 + "px";
    usePastLog = false;
  } else {
    pastLog.style.backgroundColor = 'skyblue';
    if (window.innerWidth > 700) {
      chatLog.style.width = windowSize - 528 + "px";
    } else {
      chatLog.style.width = windowSize + "px";
    }
    chatLog.style.height = 470 + "px";
    usePastLog = true;
  }
}
pastLog.addEventListener('click', pastLogButtonClicked);
pastLog.addEventListener('mousedown', function (e) { e.preventDefault(); });

//画面ログ非表示
let visibleLog = false;
visibleLogButton.style.backgroundColor = 'red';
function visibleLogButtonClicked() {
  if (visibleLog) {
    visibleLogButton.style.backgroundColor = 'red';
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



wa_i.style.backgroundColor = 'red';
function wa_iButtonClicked() {
  if (clickedWa_iButtun) {
    wa_i.style.backgroundColor = 'red';
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
  effectVolume.value = localStorage.getItem("volume");
}

setMsgSE();

function setMsgSE() {
  const msgSEKeys = Object.keys(msgSE);
  msgSEKeys.forEach(function (room) {
    const roomKeys = Object.keys(msgSE[room]);
    roomKeys.forEach(function (move) {
      for (let i = 0; i < msgSE[room][move].length; i++) {
        msgSE[room][move][i].volume = effectVolume.value;
      }
    });
  });
}




let useLogChime = Boolean(parseInt(localStorage.getItem("useLogChime"), 10));
if (useLogChime) {//ログチャイムを使う時
  logNoiseButton.style.backgroundColor = 'red';
} else {//使わない時
  logNoiseButton.style.backgroundColor = 'skyblue';
}

function logChimeButtonClicked() {
  if (useLogChime) {//ログチャイム使わない時
    logNoiseButton.style.backgroundColor = 'skyblue';
    localStorage.setItem("useLogChime", 0);
    useLogChime = false;
  } else {//ログチャイムを使う時
    logNoiseButton.style.backgroundColor = 'red';
    localStorage.setItem("useLogChime", 1);
    useLogChime = true;
  }
}
logNoiseButton.addEventListener('click', logChimeButtonClicked);
logNoiseButton.addEventListener('mousedown', function (e) { e.preventDefault(); });

function setVolume(value) {//音量調整
  localStorage.setItem("volume", value);
  setMsgSE();
}


//メッセージを受け取って表示
socket.on("emit_msg", function (data) {
  const li = document.createElement("li");
  if (setAbon[data.socketID] == false) {
    if (data.avaMsg == "") {//未入力メッセージなら吹き出しを消す
      msg[data.socketID].text = data.avaMsg
    } else {
      if (data.kanban) {//看板機能
        msg[data.socketID].text = data.avaMsg;
        msg[data.socketID].style.fill = "0x1e90ff";
      } else {
        msg[data.socketID].text = data.avaMsg;
        msg[data.socketID].style.fill = "white";
      }

      let msgText = data.msg;
      // //、Ｂって文字列が含まれてたら
      // let regexp = /、b|、ｂ/i
      // if (regexp.test(msgText)) {
      //   msgText += "　ちゃりーｎ、りーん";
      // }

      li.textContent = "（　´∀｀)" + data.userName + ": " + msgText;
      const ul = document.querySelector("ul");


      gamenLog.text = data.userName + ":" + data.avaMsg + "\n" + gamenLog.text;
      app.stage.addChild(gamenLog);


      //メッセージを出力
      if (window.innerWidth > 700 && chatLog.scrollHeight <= chatLog.clientHeight + chatLog.scrollTop + 1) {//windowsizeが700以上の時かつスクロールバーが一番下にある時にスクロールバーを自動移動
        ul.insertBefore(li, logs.querySelectorAll("li")[li.length]);
        chatLog.scrollTop = chatLog.scrollHeight;
      } else {
        ul.insertBefore(li, logs.querySelectorAll("li")[li.length]);
      }

      // 発言したテキストをクリックした時アボンする
      // li.className = data.abonClass;//アボンクラスを付与
      // const abonClass = document.getElementsByClassName(data.abonClass);
      // abonClass[0].addEventListener("click", function () {
      //   if (data.socketID != socketID) {//自テキストは省く
      //     if (setAbon[data.socketID]) {
      //       setAbon[data.socketID] = false;
      //     } else {
      //       setAbon[data.socketID] = true;
      //     }
      //     socket.json.emit("abonSetting", {
      //       setAbon: setAbon[data.socketID],
      //       socketID: data.socketID,
      //     });
      //   }
      // });
    }
  }
  if (useLogChime) {//部屋入室の音を鳴らす
    msgSE[roomSE].log[data.random].play();
  }
});

//アボンした時の処理
socket.on("abonSetting", function (data) {
  const li = document.createElement("li");
  li.textContent = data.msg;
  const ul = document.querySelector("ul");
  if (setAbon[data.socketID] == true || data.msg == "その住民は退出済みです") {//アボンするときかアボン対象の住人が居ない時
    li.style.color = "red";

    //メッセージを出力
    if (window.innerWidth > 700 && chatLog.scrollHeight <= chatLog.clientHeight + chatLog.scrollTop + 1) {//windowsizeが700以上の時かつスクロールバーが一番下にある時にスクロールバーを自動移動
      ul.insertBefore(li, logs.querySelectorAll("li")[li.length]);
      chatLog.scrollTop = chatLog.scrollHeight;
    } else {
      ul.insertBefore(li, logs.querySelectorAll("li")[li.length]);
    }
    msg[data.socketID].style.fill = "red";
  } else {//アボンを解除する時
    li.style.color = "blue";
    //メッセージを出力
    if (window.innerWidth > 700 && chatLog.scrollHeight <= chatLog.clientHeight + chatLog.scrollTop + 1) {//windowsizeが700以上の時かつスクロールバーが一番下にある時にスクロールバーを自動移動
      ul.insertBefore(li, logs.querySelectorAll("li")[li.length]);
      chatLog.scrollTop = chatLog.scrollHeight;
    } else {
      ul.insertBefore(li, logs.querySelectorAll("li")[li.length]);
    }
    msg[data.socketID].style.fill = "white";
    avaP[data.socketID].x = data.AX;
    avaP[data.socketID].y = data.AY;
    avaP[data.socketID].removeChild(avaC[data.socketID]);

    switch (data.DIR) {
      case "N":
        avaC[data.socketID] = avaN[data.socketID];
        break;
      case "NE":
        avaC[data.socketID] = avaNE[data.socketID]
        break;
      case "E":
        avaC[data.socketID] = avaE[data.socketID]
        break;
      case "SE":
        avaC[data.socketID] = avaSE[data.socketID]
        break;
      case "S":
        avaC[data.socketID] = avaS[data.socketID]
        break;
      case "SW":
        avaC[data.socketID] = avaSW[data.socketID]
        break;
      case "W":
        avaC[data.socketID] = avaW[data.socketID]
        break;
      case "NW":
        avaC[data.socketID] = avaNW[data.socketID]
        break;
    }
    avaP[data.socketID].addChild(avaC[data.socketID]);
  }
  msg[data.socketID].text = data.avaMsg;
});










//ログインか入室時に自分と他人のアバターを生成する
socket.on("roomInSelf", function (data) {
  if (data.beforeRoom) {//ログイン時
    localStorage.setItem("avatarUserName", data.user[socketID].userName);
  }
  moveMsg(data.msg);//移動時のメッセージ出力
  //部屋人数の表記を変える
  usersNumber.textContent = data.users;

  const keys = Object.keys(data.user);//入室時の全員のソケットＩＤを取得
  keys.forEach(function (value) {//引数valueにsocketIDを入れて順番に実行
    if (data.beforeRoom) {//ログインする時
      switch (data.user[value].avatar) {
        case "gomaneco":
          setAvatar(value, gomaneco, 40);
          break;

        case "necosuke":
          setAvatar(value, necosuke, 50)
          break;
      }
      avaAbon[value] = new PIXI.Sprite(avaAbon);
      avaAbon[value].anchor.set(0.5, 1);

      // アバターの親コンテナを作成
      avaP[value] = new PIXI.Container();
      avaP[value].sortableChildren = true;//子要素のzIndexをonにする

      avaP[value].room = data.user[value].room;
      setColor(value, data.user[value].avatarColor);
      //名前を追加
      nameText[value] = new PIXI.Text(data.user[value].userName, nameTextStyle);
      nameText[value].zIndex = 10;
      nameText[value].anchor.set(0.5);
      // nameText[value].position.set(0, -avaC[value].height - 15);
      avaP[value].addChild(nameText[value]);

      nameTag[value] = new PIXI.Graphics();
      nameTag[value].lineStyle(1, 0x000000, 0.5);
      nameTag[value].beginFill(0x000000);
      nameTag[value].drawRect(0, 0, nameText[value].width, nameText[value].height);
      nameTag[value].endFill();
      nameTag[value].x = -nameText[value].width / 2;
      // nameTag[value].y = -avaC[value].height - 15 - nameText[value].height / 2;
      nameTag[value].alpha = 0.3;

      avaP[value].addChild(nameTag[value]);

      // アバターのメッセージを追加する
      msg[value] = new PIXI.Text(data.user[value].msg);
      msg[value].zIndex = 20;
      // msg[value].position.set(0, -avaC[value].height - 5);
      msg[value].style.fontSize = 16;
      msg[value].style.fill = "0x1e90ff";
      avaP[value].addChild(msg[value]);


      //アバタークリックでアボン
      avaP[value].interactive = true;//クリックイベントを有効化
      setAbon[value] = false;
      avaP[value].rightclick = function () {
        if (value != socketID) {//自アバターは省く 
          if (setAbon[value]) {
            setAbon[value] = false;
          } else {
            setAbon[value] = true;
            avaP[value].removeChild(avaC[value]);
            avaC[value] = avaAbon[value];
            avaP[value].addChild(avaC[value]);
          }
          socket.json.emit("abonSetting", {
            setAbon: setAbon[value],
            socketID: value,
          });
        }
      };


      avaLoop(value);
    } else {
      msg[socketID].text = "";
    }


    avaP[value].position.set(data.user[value].AX, data.user[value].AY);

    avaP[value].roomIn = 1;//入室回数をリセット
    if (data.user[value].room == data.room) {//部屋に存在してるユーザーのアバを作る
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
        default:
          avaC[value] = avaW[value];
          avaP[value].addChild(avaC[value]);
          break;
      }
      if (data.beforeRoom) {//ログインする時
        nameText[value].position.set(0, -avaC[value].height - 15);
        nameTag[value].y = -avaC[value].height - 15 - nameText[value].height / 2;
        msg[value].position.set(0, -avaC[value].height - 5);
      }

      setAlpha(value, data.user[value].avatarAlpha);

      if (data.user[value].msg != "") {
        const liKanban = document.createElement("li");//likanbanを作る
        liKanban.textContent = "[（　´∀｀）" + data.user[value].userName + "]:" + data.user[value].msg;//likanbanのテキストを設定
        logs.appendChild(liKanban);//logsの末尾に入れる
      }
    }
  });
  if (useLogChime) {//部屋入室の音を鳴らす
    if (data.roomSE == "login") {
      msgSE.login.in[data.random].play();
    } else {
      msgSE[roomSE].in[data.random].play();
    }
  }

  //お絵かきブロック生成
  for (let n = 0; n < data.oekakiX.length; n++) {
    oekaki[room][n] = new PIXI.Graphics();
    oekaki[room][n].zIndex = 1000;
    oekaki[room][n].lineStyle(2, 0xffffff);
    oekaki[room][n].moveTo(data.oekakiX[n][0], data.oekakiY[n][0])
    for (let i = 1; i < data.oekakiX[n].length; i++) {
      oekaki[room][n].lineTo(data.oekakiX[n][i], data.oekakiY[n][i]);
    }
    app.stage.getChildByName(room).addChild(oekaki[room][n]);
    oekakiNum[room]++;
  }
});


socket.on("loadAvatar", function (data) {
  // アバターの親コンテナを作成
  avaP[data.socketID] = new PIXI.Container();
  avaP[data.socketID].sortableChildren = true;//子要素のzIndexをonにする
  avaP[data.socketID].roomIn = 0;

  //ここらへんは、後で画像纏めた時に関数化したいな
  avaAbon[data.socketID] = new PIXI.Sprite(avaAbon);
  avaAbon[data.socketID].anchor.set(0.5, 1);

  switch (data.avatar) {
    case "gomaneco":
      avaP[data.socketID].avatar = "gomaneco";
      setAvatar(data.socketID, gomaneco, 40);
      break;
    case "necosuke":
      avaP[data.socketID].avatar = "necosuke";
      setAvatar(data.socketID, necosuke, 50);
      break;
  }
  setColor(data.socketID, data.avatarColor);
  setAlpha(data.socketID, data.avatarAlpha);

  //画像をあげる
  avaC[data.socketID] = avaS[data.socketID];
  avaP[data.socketID].addChild(avaC[data.socketID]);

  //名前を追加
  nameText[data.socketID] = new PIXI.Text(data.userName, nameTextStyle);
  nameText[data.socketID].zIndex = 10;
  nameText[data.socketID].anchor.set(0.5);
  nameText[data.socketID].position.set(0, -avaC[data.socketID].height - 15);
  avaP[data.socketID].addChild(nameText[data.socketID]);

  nameTag[data.socketID] = new PIXI.Graphics();
  nameTag[data.socketID].lineStyle(1, 0x000000, 0.5);
  nameTag[data.socketID].beginFill(0x000000);
  nameTag[data.socketID].drawRect(0, 0, nameText[data.socketID].width, nameText[data.socketID].height);
  nameTag[data.socketID].endFill();
  nameTag[data.socketID].x = -nameText[data.socketID].width / 2;
  nameTag[data.socketID].y = -avaC[data.socketID].height - 15 - nameText[data.socketID].height / 2;
  nameTag[data.socketID].alpha = 0.3;
  avaP[data.socketID].addChild(nameTag[data.socketID]);

  // アバターのメッセージを追加する
  msg[data.socketID] = new PIXI.Text("");
  msg[data.socketID].zIndex = 20;
  msg[data.socketID].position.set(0, -avaC[data.socketID].height - 5);
  msg[data.socketID].style.fill = "white";
  msg[data.socketID].style.fontSize = 16;
  avaP[data.socketID].addChild(msg[data.socketID]);


  // アバタークリックでアボン
  avaP[data.socketID].interactive = true;//クリックイベントを有効化
  setAbon[data.socketID] = false;
  avaP[data.socketID].rightclick = function () {
    if (setAbon[data.socketID]) {
      setAbon[data.socketID] = false;
    } else {
      setAbon[data.socketID] = true;
      avaP[data.socketID].removeChild(avaC[data.socketID]);
      avaC[data.socketID] = avaAbon[data.socketID];
      avaP[data.socketID].addChild(avaC[data.socketID]);
    }
    socket.json.emit("abonSetting", {
      setAbon: setAbon[data.socketID],
      socketID: data.socketID,
    });
  };

  avaLoop(data.socketID);
});


//ログアウトした時の処理
socket.on("logout", function (data) {
  moveMsg(data.msg);//移動時のメッセージ出力
  //部屋人数の表記を変える
  usersNumber.textContent = data.users;
  //アバターを消す
  app.stage.getChildByName(data.room).removeChild(avaP[data.socketID]);

  if (useLogChime) {//ログチャイムがオンになってたら、ログアウトの音を鳴らす
    msgSE[roomSE].logout[data.random].play();
  }
});

let loginMX;
let loginMY;
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
  moveMsg(data.msg);//移動時じゃないけど、これ使う
});




//ウィンドウサイズ変更時の処理
let windowSize = window.innerWidth;
StyleDeclarationSetTransform(Pmain.style, "scale(0.8)");
loginButton.style.position = windowSize / 2 - 10 + "px"

Pmain.style.width = 528 + "px";
Pmain.style.height = 460 + "px";

windowResize();


let chatLogScrollHeight;
let chatLogScrollTop;
let chatLogClientHeight;
chatLog.onscroll = function () {
  chatLogScrollHeight = chatLog.scrollHeight;
  chatLogScrollTop = chatLog.scrollTop;
  chatLogClientHeight = chatLog.clientHeight;
}

function over700andBottomBar() {
  windowSize = window.innerWidth;
  windowResize();
  if (window.innerWidth > 700) {//window.innerWidthが700以上の場所に移動した場合
    chatLog.scrollTop = chatLog.scrollHeight;//スクロールを一番下にする

  } else {//700以下の場所に移動した場合
    chatLog.scrollTop = 0;
  }
}

function under700andTopBar() {
  windowSize = window.innerWidth;
  windowResize();
  if (window.innerWidth > 700) {//windowサイズが700以上になったら
    chatLog.scrollTop = chatLog.scrollHeight;//スクロールを一番下にする
  }

}

function elseBar() {
  windowSize = window.innerWidth;
  windowResize();
  chatLogScrollHeight = chatLog.scrollHeight;
  chatLogScrollTop = chatLog.scrollTop;
  chatLogClientHeight = chatLog.clientHeight;
}

//画面サイズが変わった時にチャットのスクロールバーを動かす
window.addEventListener("resize", function () {
  if (windowSize > 700 && chatLogScrollHeight - chatLogScrollTop <= chatLogClientHeight + 1) {//windowサイズが700以上の時かつ、スクロールバーが一番下にある時
    over700andBottomBar();
  } else if (windowSize <= 700 && chatLog.scrollTop == 0) {//windowサイズが700以下の時、かつスクロールバーが一番上にある時
    under700andTopBar();
  } else {
    elseBar();
  }
});



function windowResize() {
  if (windowSize <= 700) {//windowSizeが700以下の時//あああ、IE11で横に謎の隙間できるの不安やなぁ,現状は問題ないけど、スマホとかで問題でそう。とりあえず、Pmainのscale前の状態を参照しとるっぽい。(たぶｎ)
    let PMscale = windowSize / 660 - 0.015;
    let scale = "scale(" + PMscale + ")";
    StyleDeclarationSetTransform(Pmain.style, scale);

    loginButton.style.left = loginButton.offsetWidth * PMscale / 2 + 660 / 2 * PMscale + "px";


    PmainFooter.style.position = "absolute";
    PmainFooter.style.top = 23 + graphic.clientHeight + "px";
    // PmainFooterChild.style.top = 23 + graphic.clientHeight + "px";
    usersNumber.style.position = "absolute";
    usersNumber.style.top = 25 + "px";
    usersNumber.style.right = 0 + "px";

    pastLog.style.position = "absolute";
    pastLog.style.top = 20 + "px";
    pastLog.style.right = 210 + "px";
    usersDisplay.style.position = "absolute";
    usersDisplay.style.top = 25 + "px";
    usersDisplay.style.right = 8 + "px";
    logNoiseButton.style.position = "absolute";
    logNoiseButton.style.top = 20 + "px";
    logNoiseButton.style.right = 60 + "px";
    visibleLogButton.style.position = "absolute";
    visibleLogButton.style.top = 20 + "px";
    visibleLogButton.style.right = 115 + "px";


    // chatLog.style.fontSize = "13px";

    StyleDeclarationSetTransform(fontSousenkyo.style, scale);

    footer.appendChild(chatLog);
    footer.insertBefore(chatLog, document.getElementById('firstFooter'));
    footer.style.position = "absolute";

    //過去ログ
    pastLog.style.backgroundColor = 'red';
    chatLog.style.height = 0 + "px";
    usePastLog = false;

    footer.style.top = 26 + 26 + 480 * PMscale + "px";
    footer.appendChild(fontSousenkyo);
    footer.appendChild(titleBar);

    //IE11対策
    footer.style.width = windowSize + "px";
    // footer.style.width = kousinrireki.clientWidth + "px";

  } else {//700以上の時
    StyleDeclarationSetTransform(Pmain.style, "scale(0.8)");
    chatLog.style.width = windowSize - 528 + "px";
    Pmain.style.width = 528 + "px";
    loginButton.style.left = loginButton.offsetWidth * 0.8 / 2 + 660 / 2 * 0.8 + "px";


    PmainFooter.style.position = "static";
    usersNumber.style.position = "static";
    usersDisplay.style.position = "static";
    logNoiseButton.style.position = "static";
    visibleLogButton.style.position = "static";

    Pmachi.appendChild(chatLog);
    chatLog.style.position = "static";
    pastLog.style.backgroundColor = 'skyblue';
    chatLog.style.height = 470 + "px";
    usePastLog = true;

    footer.style.position = "static";
    StyleDeclarationSetTransform(fontSousenkyo.style, "scale(1.0)");
    Pmain.appendChild(fontSousenkyo);
    main.insertBefore(titleBar, Pmachi);
    footer.style.width = windowSize + "px";


    chatLog.style.fontSize = "17px";
    //画面ログ
    gamenLog.visible = false;
  }
}



function StyleDeclarationSetTransform(style, value) {//設定したい要素,設定内容
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







// Pくん
function clickPkun() {
  pkun.classList.add('moved');
  console.log("プロ街&飴ちゃん");
}

let PkunFlag = true;
document.querySelector('svg').addEventListener("touchstart", function () {
  flag = true;
  if (PkunFlag) {
    clickPkun();
    PkunFlag = false;
  } else {
    pkun.classList.remove('moved');
    PkunFlag = true;
  }
});

document.querySelector('svg').addEventListener("click", function () {
  if (flag) {
    flag = false;
  } else {
    if (PkunFlag) {
      clickPkun();
      PkunFlag = false;
    } else {
      pkun.classList.remove('moved');
      PkunFlag = true;
    }
  }
});
