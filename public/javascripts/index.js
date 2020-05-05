'use strict';

//ソケットIOをonにする
let socket = io.connect('153.127.33.40:3000');

//アバターの初期位置
let AX = 300;
let AY = 200;
let DIR = "S";

let userName;

let socketID;


let avaP = [];
let avaS = [], avaSW = [], avaW = [], avaNW = [], avaN = [], avaNE = [], avaE = [], avaSE = [];
let avaS1 = [], avaSW1 = [], avaW1 = [], avaNW1 = [], avaN1 = [], avaNE1 = [], avaE1 = [], avaSE1 = [];
let avaS2 = [], avaSW2 = [], avaW2 = [], avaNW2 = [], avaN2 = [], avaNE2 = [], avaE2 = [], avaSE2 = [];
let gomaNekoSleep = [];
let avaAbon = [];

let avaC = {};
let nameTag = [];
let msg = [];
let checkName, checkMsg;

let colPoint = [];
let colPointAll = [];
let LX, LY, distace, TX, TY, PX, PY, wall, MX, MY;
let wallCount = 0;



let AtextX, AtextY, MtextX, MtextY;
let nameTagX = -30;
let nameTagY = -105;
let inRoom = 0;

let room;
let loginBack, entrance, ground, croud, bonfire;

let moving = gsap.timeline();
let moveX, moveY;
let moveX1, moveY1;
let moveX2, moveY2;
let moveX3, moveY3;
let rightY, leftY;

let flag = false;
let setAbon = [];


// let TEST=0;
// test();
// test2();
// function test2() {
//   console.log("TEST" + TEST);
// }
//         function test() {
//           TEST = 1;
//         }




//日付
let day = new Date().toLocaleString();
document.getElementById('box').innerHTML = day;

//webGL(Canvasの設定)
let app = new PIXI.Application({
  width: 660,
  height: 480,
});
//最初の背景画像
// app.renderer.backgroundColor = 0X4C4C52;
// app.renderer.autoDensityautoResize=true;//要るんか？？これ






//  ブロックを配置
// let block1 = new PIXI.Graphics();//ブロックを置く宣言
// block1.beginFill(0xf0f8ff);
// block1.drawPolygon([
//   321, 250,
//   690, 251,
//   690, 322,
//   400, 323,
//   320, 276,
// ]);
// app.stage.addChild(block1);//実装


// let block2 = new PIXI.Graphics();//ブロックを置く宣言
// block2.beginFill(0x4682b4);
// block2.drawPolygon([
//   0, 0,
//   465, 1,
//   460, 91,
//   437, 90,
//   436, 21,
//   388, 20,
//   386, 91,
//   290, 90,
//   76, 198,
//   1, 138,
// ]);
// app.stage.addChild(block2);//実装
// app.stage.removeChild(block1);//ブロック１を消す
// app.stage.removeChild(block2);//ブロック２を消す

// // ブロックの頂点の座標をブロックごとに入れてく、最後に始点を入れてることに注意。
// const block1X = [321, 690, 691, 400, 320, 321];
// const block1Y = [250, 252, 322, 323, 276, 250];
// const block2X = [0, 465, 460, 437, 436, 388, 386, 290, 76, 1, 0];
// const block2Y = [0, 1, 91, 90, 21, 20, 91, 90, 198, 138, 0];


let nameTagStyle = new PIXI.TextStyle({//名前のスタイル
  fontSize: 20,
  fill: "blue",
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
document.getElementById("graphic").appendChild(app.view);

PIXI.Loader.shared//画像を読みこんでから処理を始める為のローダー、画像はそのうち１つか２つの画像に纏めたい
  .add("gomaNeko", "img/gomaNeko.png")
  .add("gomaNekoSleep", "img/sleeping.png")
  .add("abon", "img/abon.png")
  .add("loginBack", "img/loginBack.png")
  .add("entrance", "img/sky.png")//ここでsky.pngをentranceに書き換えてるので注意
  .add("ground", "img/ground.png")
  .add("croud", "img/croud.png")
  .add("bonfire", "img/bonfire.png")
  .on("progress", loadProgressHandler)//プログラミングローダー
  .load(setUp);//画像読み込み後の処理は基本ここに書いてく


//プログラミングのローダー確認
function loadProgressHandler(Loader, resources) {
  // console.log("loading"+resources.url);
  // console.log("loading:"+resources.name);
  console.log("progress" + Loader.progress + "%");
}

let gomaNekoS, gomaNekoS1, gomaNekoS2,
  gomaNekoSW, gomaNekoSW1, gomaNekoSW2,
  gomaNekoW, gomaNekoW1, gomaNekoW2,
  gomaNekoNW, gomaNekoNW1, gomaNekoNW2,
  gomaNekoN, gomaNekoN1, gomaNekoN2,
  gomaNekoNE, gomaNekoNE1, gomaNekoNE2,
  gomaNekoE, gomaNekoE1, gomaNekoE2,
  gomaNekoSE, gomaNekoSE1, gomaNekoSE2,
  gomaNekoSleep1, gomaNekoSleep2, gomaNekoSleep3;
let abon;

function setUp() {//画像読み込み後の処理はここに書いていく
  //アバターのベース画像を作る※Rectangleをぴったり同じ大きさの画像に使ったらバグるので注意
  gomaNekoS = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(0, 0, 40, 70));
  gomaNekoS1 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(40, 0, 40, 70));
  gomaNekoS2 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(120, 0, 40, 70));

  gomaNekoSW = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(0, 70, 40, 70));
  gomaNekoSW1 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(40, 70, 40, 70));
  gomaNekoSW2 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(120, 70, 40, 70));

  gomaNekoW = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(0, 140, 40, 70));
  gomaNekoW1 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(40, 140, 40, 70));
  gomaNekoW2 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(120, 140, 40, 70));

  gomaNekoNW = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(0, 210, 40, 70));
  gomaNekoNW1 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(40, 210, 40, 70));
  gomaNekoNW2 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(120, 210, 40, 70));

  gomaNekoN = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(0, 280, 40, 70));
  gomaNekoN1 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(40, 280, 40, 70));
  gomaNekoN2 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(120, 280, 40, 70));

  gomaNekoNE = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(0, 350, 40, 70));
  gomaNekoNE1 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(40, 350, 40, 70));
  gomaNekoNE2 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(120, 350, 40, 70));

  gomaNekoE = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(0, 420, 40, 70));
  gomaNekoE1 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(40, 420, 40, 70));
  gomaNekoE2 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(120, 420, 40, 70));

  gomaNekoSE = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(0, 490, 40, 70));
  gomaNekoSE1 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(40, 490, 40, 70));
  gomaNekoSE2 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(120, 490, 40, 70));

  gomaNekoSleep = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNekoSleep"), new PIXI.Rectangle(0, 0, 40, 20));
  // gomaNekoSleep1= new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNekoSleep"), new PIXI.Rectangle(40, 0, 40, 70));
  // gomaNekoSleep2= new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNekoSleep"), new PIXI.Rectangle(80, 0, 40, 70));

  //新しい人がきたときに画像を読み込む
  socket.on("loadNewUser", function (data) {
    avaS[data.socketID] = new PIXI.Sprite(gomaNekoS);
    avaS1[data.socketID] = new PIXI.Sprite(gomaNekoS1);
    avaS2[data.socketID] = new PIXI.Sprite(gomaNekoS2);
    avaSW[data.socketID] = new PIXI.Sprite(gomaNekoSW);
    avaSW1[data.socketID] = new PIXI.Sprite(gomaNekoSW1);
    avaSW2[data.socketID] = new PIXI.Sprite(gomaNekoSW2);
    avaW[data.socketID] = new PIXI.Sprite(gomaNekoW);
    avaW1[data.socketID] = new PIXI.Sprite(gomaNekoW1);
    avaW2[data.socketID] = new PIXI.Sprite(gomaNekoW2);
    avaNW[data.socketID] = new PIXI.Sprite(gomaNekoNW);
    avaNW1[data.socketID] = new PIXI.Sprite(gomaNekoNW1);
    avaNW2[data.socketID] = new PIXI.Sprite(gomaNekoNW2);
    avaN[data.socketID] = new PIXI.Sprite(gomaNekoN);
    avaN1[data.socketID] = new PIXI.Sprite(gomaNekoN1);
    avaN2[data.socketID] = new PIXI.Sprite(gomaNekoN2);
    avaNE[data.socketID] = new PIXI.Sprite(gomaNekoNE);
    avaNE1[data.socketID] = new PIXI.Sprite(gomaNekoNE1);
    avaNE2[data.socketID] = new PIXI.Sprite(gomaNekoNE2);
    avaE[data.socketID] = new PIXI.Sprite(gomaNekoE);
    avaE1[data.socketID] = new PIXI.Sprite(gomaNekoE1);
    avaE2[data.socketID] = new PIXI.Sprite(gomaNekoE2);
    avaSE[data.socketID] = new PIXI.Sprite(gomaNekoSE);
    avaSE1[data.socketID] = new PIXI.Sprite(gomaNekoSE1);
    avaSE2[data.socketID] = new PIXI.Sprite(gomaNekoSE2);
    gomaNekoSleep[data.socketID] = new PIXI.Sprite(gomaNekoSleep);
    avaAbon[data.socketID] = new PIXI.Sprite(PIXI.Loader.shared.resources["abon"].texture);

    avaS[data.socketID].anchor.set(0.5, 1);
    avaS1[data.socketID].anchor.set(0.5, 1);
    avaS2[data.socketID].anchor.set(0.5, 1);
    avaSW[data.socketID].anchor.set(0.5, 1);
    avaSW1[data.socketID].anchor.set(0.5, 1);
    avaSW2[data.socketID].anchor.set(0.5, 1);
    avaW[data.socketID].anchor.set(0.5, 1);
    avaW1[data.socketID].anchor.set(0.5, 1);
    avaW2[data.socketID].anchor.set(0.5, 1);
    avaNW[data.socketID].anchor.set(0.5, 1);
    avaNW1[data.socketID].anchor.set(0.5, 1);
    avaNW2[data.socketID].anchor.set(0.5, 1);
    avaN[data.socketID].anchor.set(0.5, 1);
    avaN1[data.socketID].anchor.set(0.5, 1);
    avaN2[data.socketID].anchor.set(0.5, 1);
    avaNE[data.socketID].anchor.set(0.5, 1);
    avaNE1[data.socketID].anchor.set(0.5, 1);
    avaNE2[data.socketID].anchor.set(0.5, 1);
    avaE[data.socketID].anchor.set(0.5, 1);
    avaE1[data.socketID].anchor.set(0.5, 1);
    avaE2[data.socketID].anchor.set(0.5, 1);
    avaSE[data.socketID].anchor.set(0.5, 1);
    avaSE1[data.socketID].anchor.set(0.5, 1);
    avaSE2[data.socketID].anchor.set(0.5, 1);
    gomaNekoSleep[data.socketID].anchor.set(0.5, 1);
    avaAbon[data.socketID].anchor.set(0.5, 1);
  });

  socket.emit("set", {});//サーバーに入ったことを伝える
  //背景の画像を追加
  loginBack = new PIXI.Sprite(PIXI.Loader.shared.resources["loginBack"].texture);
  entrance = new PIXI.Sprite(PIXI.Loader.shared.resources["entrance"].texture);
  ground = new PIXI.Sprite(PIXI.Loader.shared.resources["ground"].texture);
  croud = new PIXI.Sprite(PIXI.Loader.shared.resources["croud"].texture);
  bonfire = new PIXI.Sprite(PIXI.Loader.shared.resources["bonfire"].texture);

  // entrance.width = 660;
  // entrance.height = 480;

  setMap(loginBack);
  clickRange(loginBack);





  // 座標確認用のオブジェクト
  // アバターX座標の表示設定
  AtextX = new PIXI.Text("avaX");
  AtextX.style = {//アバターX座標のスタイル
    fontFamily: "serif",
    fontSize: "12px",
    fill: "blue",
  }
  ///アバターX座標の位置
  AtextX.position.set(560, 420);
  app.stage.addChild(AtextX);

  //アバターY座標の表示設定
  AtextY = new PIXI.Text("avaY");
  AtextY.style = {//アバターY座標のスタイル
    fontFamily: "serif",
    fontSize: "12px",
    fill: "blue",
  }
  //アバターY座標の位置
  AtextY.position.set(560, 435);
  app.stage.addChild(AtextY);

  //マウスX座標の表示設定
  MtextX = new PIXI.Text("mouX");
  MtextX.style = {//マウスX座標のスタイル
    fontFamily: "serif",
    fontSize: "12px",
    fill: "red",
  }
  //マウスX座標の位置
  MtextX.position.set(560, 450);

  //マウスY座標の表示位置設定
  MtextY = new PIXI.Text("mouY");
  MtextY.style = {//マウスY座標のスタイル
    fontFamily: "serif",
    fontSize: "12px",
    fill: "red",
  }
  //マウスY座標の位置
  MtextY.position.set(560, 465);


  //入った時に入力欄にフォーカスを合わせる
  document.querySelector('input').focus();


  //名前を出力
  checkName = function () {
    nameTag[socketID].text = (document.nameForm.userName.value);
    login();
  }

  //メッセージ出力
  checkMsg = function () {
    msg.text = (document.msgForm.msg.value);
    socket.json.emit("emit_msg", {
      socketID: socketID,
      msg: (document.msgForm.msg.value),
    });
    document.msgForm.msg.value = "";
    document.msgForm.msg.focus();
  }

  //   //画面をタップした時の処理
  // // document.getElementById("graphic").addEventListener("touchstart", function () {
  //   app.stage.on('touchstart', function (event) {
  //   // loginBack.touchstart = function(){
  //     flag = true;
  //     MX = event.data.getLocalPosition(event.target).x;
  //     MY = event.data.getLocalPosition(event.target).y;
  //     // MX = app.renderer.plugins.interaction.mouse.global.x;//使えない
  //     // MY = app.renderer.plugins.interaction.mouse.global.y;
  //     moveEvent();
  //   });
  // // });



  gameLoop();


}


// croudBlock1配置
let croudBlock1 = new PIXI.Graphics();
croudBlock1.beginFill(0xf0f8ff);
croudBlock1.alpha = 0;
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
croudBlock2.alpha = 0;
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

const bonfireBlockX = [270, 349, 392, 320, 270];
const bonfireBlockY = [326, 285, 325, 358, 326];

function entranceBlock() {
  iniColPoint(bonfireBlockX);//colPointを初期化
  checkColPoint(bonfireBlockX, bonfireBlockY);//bonFireのcolPointを調べる
}


//画面をクリックした時の処理
function setMap(value) {
  value.sortableChildren = true;//子要素のzIndexをonにする。
  app.stage.addChild(value);//画像を読みこむ
}

function clickRange(value) {
  value.interactive = true;//クリックイベントを有効化
  value.click = function () {

    // if (flag) {
    // flag = false;
    // } else {
    MX = app.renderer.plugins.interaction.mouse.global.x;
    MY = app.renderer.plugins.interaction.mouse.global.y;
    // console.log("clickMX" + app.renderer.plugins.interaction.mouse.global.x);//マウスの座標を取得
    // console.log("clickMY" + app.renderer.plugins.interaction.mouse.global.y);
    if (AX != MX || AY != MY) {//同一点なら移動しない//パターン１
      moveEvent();
    }
    document.msgForm.msg.focus();
    // }
  };
}
function moveEvent() {
  let sin = (MY - AY) / Math.sqrt(Math.pow(MX - AX, 2) + Math.pow(MY - AY, 2));
  if (inRoom == 0) {
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
      duration: 0.4, x: MX, y: MY,
      onComplete: function () {
        AX = avaP[socketID].x;
        AY = avaP[socketID].y;
      }
    });
  } else {
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
      clickedMove(DIR, AX, AY, socketID);
      socket.json.emit("clickMap", {
        DIR: DIR,
        AX: AX,
        AY: AY,
        socketID: socketID,

      });
    } else {//ブロックと交わる場合
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

function anime(ava, ava1, ava2, value) {//引数：初期ava,歩いてるとき、歩いてるとき２、socketID
  gsap.to(avaP[value], 0, {
    delay: 0.1,
    onUpdate: function () {
      avaP[value].removeChild(avaC[value]);
      avaC[value] = ava1[value];
      avaP[value].addChild(avaC[value]);
      avaP[value].addChild(nameTag[value]);
      avaP[value].addChild(msg[value]);
    }
  });
  gsap.to(avaP[value], 0, {
    delay: 0.2,
    onUpdate: function () {
      avaP[value].removeChild(avaC[value]);
      avaC[value] = ava2[value];
      avaP[value].addChild(avaC[value]);
      avaP[value].addChild(nameTag[value]);
      avaP[value].addChild(msg[value]);
    }
  });
  gsap.to(avaP[value], 0, {
    delay: 0.3,
    onUpdate: function () {
      avaP[value].removeChild(avaC[value]);
      avaC[value] = ava1[value];
      avaP[value].addChild(avaC[value]);
      avaP[value].addChild(nameTag[value]);
      avaP[value].addChild(msg[value]);
    }
  });
  gsap.to(avaP[value], 0, {
    delay: 0.4,
    onUpdate: function () {
      avaP[value].removeChild(avaC[value]);
      avaC[value] = ava[value];
      avaP[value].addChild(avaC[value]);
      avaP[value].addChild(nameTag[value]);
      avaP[value].addChild(msg[value]);
    }
  });
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


function colMove(CPA, stopX, stopY) {//ブロックと衝突時の動きの式,CPAはcolPointALLの略、stopXとstopYはブロックの手前で止まってもらうための数字,バグ防止
  //交点に位置に移動する
  AX = CPA.LX + stopX;
  AY = CPA.LY + stopY;
  clickedMove(DIR, AX, AY, socketID);
  socket.json.emit("clickMap", {
    DIR: DIR,
    socketID: socketID,
    AX: AX,
    AY: AY,
  });
}


//移動時のソケット受け取り
socket.on("clickMap_from_server", function (data) {
  if (setAbon[data.socketID] == false) {
    clickedMove(data.DIR,data.AX,data.AY,data.socketID);
  }
});

//数値を取得後のアバターの動き
function clickedMove(DIR,AX,AY,socketID) {
  if (DIR == "NE") {//子要素の画像を入れる
    anime(avaNE, avaNE1, avaNE2, socketID);
  } else if (DIR == "SE") {
    anime(avaSE, avaSE1, avaSE2, socketID);
  } else if (DIR == "SW") {
    anime(avaSW, avaSW1, avaSW2, socketID);
  } else if (DIR == "NW") {
    anime(avaNW, avaNW1, avaNW2, socketID);
  } else if (DIR == "N") {
    anime(avaN, avaN1, avaN2, socketID);
  } else if (DIR == "E") {
    anime(avaE, avaE1, avaE2, socketID);
  } else if (DIR == "S") {
    anime(avaS, avaS1, avaS2, socketID);
  } else {
    anime(avaW, avaW1, avaW2, socketID);
  }
  moving.to(avaP[socketID], { duration: 0.4, x: AX, y: AY });
  avaP[socketID].zIndex = AY;//上に進むか下に進むかで処理位置決めたらいいんかな？　後で考える
  
}

//ログイン時の処理
function login() {
  room = "entrance";


  //userNameにフォームの内容を入れる
  userName = document.nameForm.userName.value;
  if (userName != "") {//名前が空だと移動しない//マップを切り替える


    entrance.addChild(croudBlock1);
    clickRange(croudBlock1);
    entrance.addChild(croudBlock2);
    clickRange(croudBlock2);

    entrance.addChild(groundBlock);
    clickRange(groundBlock);

    entrance.addChild(croud);
    entrance.addChild(ground);
    bonfire.zIndex = 325;
    entrance.addChild(bonfire);
    setMap(entrance);

    //マウス座標を表示
    // app.stage.addChild(MtextX);
    // app.stage.addChild(MtextY);
    //座標を消す
    // app.stage.removeChild(AtextX);
    // app.stage.removeChild(AtextY);
    // app.stage.removeChild(MtextX);
    // app.stage.removeChild(MtextY);

    AX = 457;//座標を切り替える//ここらへんは後でsetMapに入れるか
    AY = 80;

    //ログイン画面の画像を消す
    app.stage.removeChild(loginBack);//ここもsetMapに入れたい

    socket.json.emit("join_room", {//エントランスに入る
      room: "entrance",
      socketID: socketID,//soket.id
      userName: userName,//ユーザーネーム
    });


    //フォームを切り替える
    document.getElementById("nameForm").style.display = "none";
    document.getElementById("msgForm").style.display = "block";
    document.getElementById("login").parentNode.removeChild(document.getElementById("login"));
    document.msgForm.msg.focus();
    inRoom = 1;
  }
}


//メッセージを受け取って表示
socket.on("emit_msg_from_server", function (data) {
  const li = document.createElement("li");
  if (setAbon[data.socketID] == false) {
    if (data.avaMsg == "") {
      msg[data.socketID].text = data.avaMsg
    } else {
      li.textContent = data.msg;
      const ul = document.querySelector("ul");
      ul.insertBefore(li, document.getElementById("logs").querySelectorAll("li")[0]);
      msg[data.socketID].text = data.avaMsg;

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
});

//アボンした時の処理
socket.on("abonSetting_from_server", function (data) {
  const li = document.createElement("li");
  li.textContent = data.msg;
  const ul = document.querySelector("ul");
  if (setAbon[data.socketID] == true || data.msg == "その住民は退出済みです") {//アボンするときかアボン対象の住人が居ない時
    li.style.color = "red";
    ul.insertBefore(li, document.getElementById("logs").querySelectorAll("li")[0]);
    msg[data.socketID].style.fill = "red";
  } else {//アボンを解除する時
    li.style.color = "blue";
    ul.insertBefore(li, document.getElementById("logs").querySelectorAll("li")[0]);
    msg[data.socketID].style.fill = "white";
    avaP[data.socketID].x = data.AX;
    avaP[data.socketID].y = data.AY;
    avaP[data.socketID].removeChild(avaC[data.socketID]);
    if (data.DIR == "N") {
      avaC[data.socketID] = avaN[data.socketID];
    } else if (data.DIR == "NE") {
      avaC[data.socketID] = avaNE[data.socketID]
    } else if (data.DIR == "E") {
      avaC[data.socketID] = avaE[data.socketID]
    } else if (data.DIR == "SE") {
      avaC[data.socketID] = avaSE[data.socketID]
    } else if (data.DIR == "S") {
      avaC[data.socketID] = avaS[data.socketID]
    } else if (data.DIR == "SW") {
      avaC[data.socketID] = avaSW[data.socketID]
    } else if (data.DIR == "W") {
      avaC[data.socketID] = avaW[data.socketID]
    } else if (data.DIR == "NW") {
      avaC[data.socketID] = avaNW[data.socketID]
    }
    avaP[data.socketID].addChild(avaC[data.socketID]);
  }
  msg[data.socketID].text = data.avaMsg;
});


socket.on("mySocketID_from_server", function (data) {
  socketID = data.socketID;
  const keys = Object.keys(data.user);
  keys.forEach(function (value) {
    //アバターの画像を設定
    avaS[value] = new PIXI.Sprite(gomaNekoS);
    avaS1[value] = new PIXI.Sprite(gomaNekoS1);
    avaS2[value] = new PIXI.Sprite(gomaNekoS2);
    avaSW[value] = new PIXI.Sprite(gomaNekoSW);
    avaSW1[value] = new PIXI.Sprite(gomaNekoSW1);
    avaSW2[value] = new PIXI.Sprite(gomaNekoSW2);
    avaW[value] = new PIXI.Sprite(gomaNekoW);
    avaW1[value] = new PIXI.Sprite(gomaNekoW1);
    avaW2[value] = new PIXI.Sprite(gomaNekoW2);
    avaNW[value] = new PIXI.Sprite(gomaNekoNW);
    avaNW1[value] = new PIXI.Sprite(gomaNekoNW1);
    avaNW2[value] = new PIXI.Sprite(gomaNekoNW2);
    avaN[value] = new PIXI.Sprite(gomaNekoN);
    avaN1[value] = new PIXI.Sprite(gomaNekoN1);
    avaN2[value] = new PIXI.Sprite(gomaNekoN2);
    avaNE[value] = new PIXI.Sprite(gomaNekoNE);
    avaNE1[value] = new PIXI.Sprite(gomaNekoNE1);
    avaNE2[value] = new PIXI.Sprite(gomaNekoNE2);
    avaE[value] = new PIXI.Sprite(gomaNekoE);
    avaE1[value] = new PIXI.Sprite(gomaNekoE1);
    avaE2[value] = new PIXI.Sprite(gomaNekoE2);
    avaSE[value] = new PIXI.Sprite(gomaNekoSE);
    avaSE1[value] = new PIXI.Sprite(gomaNekoSE1);
    avaSE2[value] = new PIXI.Sprite(gomaNekoSE2);
    avaAbon[value] = new PIXI.Sprite(PIXI.Loader.shared.resources["abon"].texture);

    // avaS[value].tint = 0xa1e6e6; //これで色変更ができるうううううううう！
    // avaSs1[value].tint = 0xa1e6e6;
    // avaSs2[value].tint = 0xa1e6e6;
    // avaSWs[value].tint = 0xa1e6e6;
    // avaWs[value].tint = 0xa1e6e6;
    // avaNWs[value].tint = 0xa1e6e6;
    // avaNs[value].tint = 0xa1e6e6;
    // avaNEs[value].tint = 0xa1e6e6;
    // avaEs[value].tint = 0xa1e6e6;
    // avaSEs[value].tint = 0xa1e6e6;
    // avaS[value].tint = 0xa1e6e6;
    // avaSW[value].tint = 0xa1e6e6;
    // avaW[value].tint = 0xa1e6e6;
    // avaNW[value].tint = 0xa1e6e6;
    // avaN[value].tint = 0xa1e6e6;
    // avaNE[value].tint = 0xa1e6e6;
    // avaE[value].tint = 0xa1e6e6;
    // avaSE[value].tint = 0xa1e6e6;

    // avaS[value].alpha = 0.6; //半透明化
    // avaS[value].height = -70; //上下反転
    // avaSs1[value].alpha = 0.6;
    // avaSs2[value].alpha = 0.6;
    // avaSWs[value].alpha = 0.6;
    // avaWs[value].alpha = 0.6;
    // avaNWs[value].alpha = 0.6;
    // avaNs[value].alpha = 0.6;
    // avaNEs[value].alpha = 0.6;
    // avaEs[value].alpha = 0.6;
    // avaSEs[value].alpha = 0.6;
    // avaS[value].alpha = 0.6;
    // avaSW[value].alpha = 0.6;
    // avaW[value].alpha = 0.6;
    // avaNW[value].alpha = 0.6;
    // avaN[value].alpha = 0.6;
    // avaNE[value].alpha = 0.6;
    // avaE[value].alpha = 0.6;
    // avaSE[value].alpha = 0.6;


    avaS[value].anchor.set(0.5, 1);
    avaS1[value].anchor.set(0.5, 1);
    avaS2[value].anchor.set(0.5, 1);
    avaSW[value].anchor.set(0.5, 1);
    avaSW1[value].anchor.set(0.5, 1);
    avaSW2[value].anchor.set(0.5, 1);
    avaW[value].anchor.set(0.5, 1);
    avaW1[value].anchor.set(0.5, 1);
    avaW2[value].anchor.set(0.5, 1);
    avaNW[value].anchor.set(0.5, 1);
    avaNW1[value].anchor.set(0.5, 1);
    avaNW2[value].anchor.set(0.5, 1);
    avaN[value].anchor.set(0.5, 1);
    avaN1[value].anchor.set(0.5, 1);
    avaN2[value].anchor.set(0.5, 1);
    avaNE[value].anchor.set(0.5, 1);
    avaNE1[value].anchor.set(0.5, 1);
    avaNE2[value].anchor.set(0.5, 1);
    avaE[value].anchor.set(0.5, 1);
    avaE1[value].anchor.set(0.5, 1);
    avaE2[value].anchor.set(0.5, 1);
    avaSE[value].anchor.set(0.5, 1);
    avaSE1[value].anchor.set(0.5, 1);
    avaSE2[value].anchor.set(0.5, 1);
    avaAbon[value].anchor.set(0.5, 1);
  });

  nameTag[socketID] = new PIXI.Text(document.nameForm.userName.value, nameTagStyle);
  nameTag[socketID].position.set(nameTagX, nameTagY);//名前の位置
  //アバターの親コンテナを設定
  avaP[socketID] = new PIXI.Container();
  avaP[socketID].position.set(320, 200);
  //名前と画像を追加
  avaC[socketID] = avaS[socketID];
  avaP[socketID].addChild(avaC[socketID]);
  avaP[socketID].addChild(nameTag[socketID]);
  //ステージに追加
  loginBack.addChild(avaP[socketID]);
});







//ルーム入室時に自分と他人のアバターを生成する
socket.on("join_me_from_server", function (data) {
  const keys = Object.keys(data.user);//入室時の全員のソケットＩＤを取得
  keys.forEach(function (value) {
    if (data.user[value].room == "entrance") {
      // アバターの親コンテナを作成
      avaP[value] = new PIXI.Container();
      avaP[value].position.set(data.user[value].AX, data.user[value].AY);

      //アバタークリックでアボン
      avaP[value].interactive = true;//クリックイベントを有効化
      setAbon[value] = false;
      avaP[value].on("click", function () {
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
      });

      //これだとうまくいかんなあ
      //     function clickAvaC() {
      //       if (value != socketID) {//自アバターは省く 
      //         if (setAbon[value]) {
      //           setAbon[value] = false;


      //         } else {
      //           setAbon[value] = true;
      //           avaP[value].removeChild(avaC[value]);
      //             avaC[value] = avaAbon[value];
      //             avaP[value].addChild(avaC[value]);
      //           }
      //           socket.json.emit("abonSetting", {
      //             setAbon: setAbon[value],
      //             socketID: value,
      //           });
      //         }
      //     }

      //     avaN[value].on("click", function () {
      //       console.log("TEST");
      //       clickAvaC();
      //     });
      //     avaNE[value].on("click", function () {
      //       console.log("TEST");
      //       clickAvaC();
      //     });
      //     avaE[value].on("click", function () {
      //       console.log("TEST");
      //       clickAvaC();
      //     });
      //     avaSE[value].on("click", function () {
      //       console.log("TEST");
      //       clickAvaC();
      //     });
      //     avaS[value].on("click", function () {
      //       console.log("TEST");
      //       clickAvaC();
      //     });
      //     avaSW[value].on("click", function () {
      //       console.log("TEST");
      //       clickAvaC();
      //     });
      //     avaW[value].on("click", function () {
      //       clickAvaC();
      //     });
      //     avaNW[value].on("click", function () {
      //       console.log("TEST");
      //   clickAvaC();
      // });



      // 画像とメッセージと名前を追加してステージに上げる
      if (data.user[value].DIR == "NE") {
        avaC[value] = avaNE[value];
        avaP[value].addChild(avaC[value]);
      } else if (data.user[value].DIR == "SE") {
        avaC[value] = avaSE[value];
        avaP[value].addChild(avaC[value]);
      } else if (data.user[value].DIR == "SW") {
        avaC[value] = avaSW[value];
        avaP[value].addChild(avaC[value]);
      } else if (data.user[value].DIR == "NW") {
        avaC[value] = avaNW[value];
        avaP[value].addChild(avaC[value]);
      } else if (data.user[value].DIR == "N") {
        avaC[value] = avaN[value];
        avaP[value].addChild(avaC[value]);
      } else if (data.user[value].DIR == "E") {
        avaC[value] = avaE[value];
        avaP[value].addChild(avaC[value]);
      } else if (data.user[value].DIR == "S") {
        avaC[value] = avaS[value];
        avaP[value].addChild(avaC[value]);
      } else {
        avaC[value] = avaW[value];
        avaP[value].addChild(avaC[value]);
      }
      // //名前タグを追加
      nameTag[value] = new PIXI.Text(data.user[value].userName, nameTagStyle);
      nameTag[value].position.set(nameTagX, nameTagY);
      avaP[value].addChild(nameTag[value]);
      // アバターのメッセージを追加する
      msg[value] = new PIXI.Text("");
      msg[value].position.set(-30, -95);
      msg[value].style.fill = "white";
      msg[value].style.fontSize = 18;
      avaP[value].addChild(msg[value]);

      avaP[value].zIndex = data.user[value].AY;
      entrance.addChild(avaP[value]);
    }
  });

  //入室時のメッセージを出す
  const li = document.createElement("li");
  li.textContent = data.msg;
  const ul = document.querySelector("ul");
  ul.insertBefore(li, document.getElementById("logs").querySelectorAll("li")[0]);

  //部屋人数の表記を変える
  document.getElementById('users').textContent = "users:" + data.roomUser;
});




//自分以外がルームに入ってきた時のアバター作成とアナウンス
socket.on("join_room_from_server", function (data) {
  // アバターの親コンテナを作成
  avaP[data.socketID] = new PIXI.Container();
  avaP[data.socketID].position.set(457, 80);

  // アバタークリックでアボン
  avaP[data.socketID].interactive = true;//クリックイベントを有効化
  setAbon[data.socketID] = false;
  avaP[data.socketID].on("click", function () {
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
  });

  // //名前タグを追加
  nameTag[data.socketID] = new PIXI.Text(data.userName, nameTagStyle);
  nameTag[data.socketID].position.set(nameTagX, nameTagY);

  // アバターのメッセージを追加する
  msg[data.socketID] = new PIXI.Text("");
  msg[data.socketID].position.set(-30, -60);
  msg[data.socketID].style.fill = "white";
  msg[data.socketID].style.fontSize = 18;
  // 画像とメッセージと名前を追加してステージに上げる
  avaP[data.socketID].zIndex = 200;
  entrance.addChild(avaP[data.socketID]);
  avaC[data.socketID] = avaS[data.socketID];
  avaP[data.socketID].addChild(avaC[data.socketID]);
  avaP[data.socketID].addChild(nameTag[data.socketID]);
  avaP[data.socketID].addChild(msg[data.socketID]);


  //入室時のメッセージを出す
  const li = document.createElement("li");
  li.textContent = data.msg;
  const ul = document.querySelector("ul");
  ul.insertBefore(li, document.getElementById("logs").querySelectorAll("li")[0]);
  //部屋人数の表記を変える
  document.getElementById('users').textContent = "users:" + data.roomUser;
});








//アバター位置とマウス位置の表示
let loginMX;
let loginMY;
function gameLoop() {
  requestAnimationFrame(gameLoop);
  loginMX = app.renderer.plugins.interaction.mouse.global.x;
  loginMY = app.renderer.plugins.interaction.mouse.global.y;
  AtextX.text = "avaX" + AX;
  AtextY.text = "avaY" + AY;
  if (0 <= loginMX && app.renderer.plugins.interaction.mouse.global.x <= 660 && 0 <= loginMY && loginMY < 480) {
    MtextX.text = "mouX" + loginMX;
    MtextY.text = "mouY" + loginMY;
  }
}











//ログアウトした時の処理
socket.on("logout_from_server", function (data) {
  const li = document.createElement("li");
  li.textContent = data.msg;//退出ログを入れる
  const ul = document.querySelector("ul");
  ul.insertBefore(li, document.getElementById("logs").querySelectorAll("li")[0]);
  //部屋人数の表記を変える
  document.getElementById('users').textContent = "users:" + data.roomUser;
  //アバターを消す
  // let DATAROOM = data.room;
  // // console.log("logout:" + entrance);
  // console.log("logout:" + data.room);
  // console.log("logout2:" + typeof data.room);
  // // new String(DATAROOM)
  // // console.log("logout2:" + typeof DATAROOM);
  // Number(DATAROOM).removeChild(avaP[data.socketID]);
  // data.room= new PIXI.Container();


  // data.room.removeChild(avaP[data.socketID]);
  entrance.removeChild(avaP[data.socketID]);


});

//背景色を変える
let uiColor = true;

document.getElementById("title").addEventListener("touchstart", function (event) {
  flag = true;
  if (uiColor == true) {
    document.querySelector('title').style.color = "#5F5F64";
    document.querySelector('body').style.color = "black";
    document.querySelector('body').style.backgroundColor = "white";
    document.querySelector('ul').style.backgroundColor = "#999";
    document.querySelector('input').style.backgroundColor = "rgb(25, 85, 85)";
    uiColor = false;
  } else {
    document.querySelector('title').style.color = "#eee";
    document.querySelector('body').style.color = "#eee";
    document.querySelector('body').style.backgroundColor = "#333333";
    document.querySelector('ul').style.backgroundColor = "#fff";
    document.querySelector('input').style.backgroundColor = "#eee";
    uiColor = true;
  }
});

document.getElementById('title').addEventListener("click", function () {
  if (flag) {
    flag = false;
  } else {
    if (uiColor == true) {
      document.querySelector('title').style.color = "#5F5F64";
      document.querySelector('body').style.color = "black";
      document.querySelector('body').style.backgroundColor = "white";
      document.querySelector('ul').style.backgroundColor = "#999";
      document.querySelector('input').style.backgroundColor = "rgb(25, 85, 85)";
      uiColor = false;
    } else {
      document.querySelector('title').style.color = "#eee";
      document.querySelector('body').style.color = "#eee";
      document.querySelector('body').style.backgroundColor = "#333333";
      document.querySelector('ul').style.backgroundColor = "#fff";
      document.querySelector('input').style.backgroundColor = "#eee";
      uiColor = true;
    }
  }
});



//Pくん
(function () {
  document.querySelector('svg').addEventListener("click", function () {
    document.querySelectorAll('.pkun').forEach(function (pkun) {
      pkun.classList.add('moved');
    });
  });

})(); 