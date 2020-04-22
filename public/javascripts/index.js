'use strict';
//ソケットIOをonにする
let socket = io.connect('153.127.33.40:3000');


//アバターの初期位置
let AX = 410;
let AY = 80;

let userName;

let socketID;

let room = "entrance";

let avaP = [];
let avaS = [], avaSW = [], avaW = [], avaNW = [], avaN = [], avaNE = [], avaE = [], avaSE = [];
let avaSs1 = [], avaSs2 = [], avaSWs = [], avaWs = [], avaNWs = [], avaNs = [], avaNEs = [], avaEs = [], avaSEs = [];
let avaC = {};
let nameTag = [];
let msg = [];
let checkName, checkMsg;

let colPoint = [];
let colPointAll = [];
let LX, LY, distace, TX, TY, PX, PY, wall, MX, MY;
let wallCount = 0;

// let ava = [];

let DIR = 6;

let AtextX, AtextY, MtextX, MtextY;
let nameTagX = -30;
let nameTagY = -105;
let inRoom = 0;
let entrance;

let moving = gsap.timeline();
let moveX, moveY;
let rightY, leftY;

let flag = false;
let abonMsg = [];


//日付
let day = new Date().toLocaleString();
document.getElementById('box').innerHTML = day;

//webGL(Canvasの設定)
let app = new PIXI.Application({
  width: 660,
  height: 480,
});
//最初の背景画像
app.renderer.backgroundColor = 0X4C4C52;
app.stage.interactive = true;//タップを可能にする
// app.renderer.autoDensityautoResize=true;//要るんか？？これ

//  ブロックを配置
// let block1 = new PIXI.Graphics();//ブロックを置く宣言
// block1.beginFill("black");
// block1.drawPolygon([
//   321,250,
//   690,251,
//   690,322,
//   400,323,
//   320,276,
// ]);
// app.stage.addChild(block1);//実装


// let block2 = new PIXI.Graphics();//ブロックを置く宣言
// block2.beginFill("black");
// block2.drawPolygon([
//   0,0,
//   465,1,
//   460,91,
//   437,90,
//   436,21,
//   388,20,
//   386,91,
//   290,90,
//   76,198,
//   1,138,
// ]);
// app.stage.addChild(block2);//実装


// ブロックの頂点の座標をブロックごとに入れてく、最後に始点を入れてることに注意。
const block1X = [321, 690, 691, 400, 320, 321];
const block1Y = [250, 252, 322, 323, 276, 250];
const block2X = [0, 465, 460, 437, 436, 388, 386, 290, 76, 1, 0];
const block2Y = [0, 1, 91, 90, 21, 20, 91, 90, 198, 138, 0];



//アバターの画像
//斜め右上から四方向に時計回り→上から四方向に時計回り
// let direction = ['img/avaNE.png','img/avaSE.png', 
// 'img/avaSW.png','img/avaNW.png',
// 'img/avaN.png', 'img/avaS.png', 'img/avaW.png',
// // 'images/upperRight2.png','images/lowerRight2.png', 'images/lowerLeft2.png','images/upperLeft2.png',
// // 'images/upper2.png', 'images/Right2.png','images/lower2.png', 'images/left2.png'
// ];

// let directionS = ['images/upperRightS.png','images/lowerRightS.png',
// 'images/lowerLeftS.png','images/upperLeftS.png',
// 'images/upper2.png', 'images/RightS.png','images/lowerS.png', 'images/leftS.png',
// 'images/upperRightS2.png','images/lowerRightS2.png', 'images/lowerLeftS2.png','images/upperLeftS.png',
// 'images/upperS2.png', 'images/RightS2.png','images/lowerS2.png', 'images/leftS2.png'];


//ここらへん、こんなことせずに普通に数値入れれば良いかも
// アバター画像読みこみ
// const img =[];//大きいほう
// for(let i=0; i<direction.length; i++){
//   img[i] = document.createElement('img');
//   img[i].src = direction[i];
// }

// const imgS =[];//小さいほう
// for(let i=0; i<direction.length; i++){
//   imgS[i] = document.createElement('img');
//   imgS[i].src = directionS[i];
//     }
// 画像の基準点を真ん中にするために、横幅半分と、高さの数値を取る
// let aW = img[0].naturalWidth/2;
// let aH = img[0].naturalHeight;//大きいほう
// let aHS = imgS[0].height;//小さいほう
// console.log("aW:" + aW);
// console.log("aH:" + aH);


let aW = 17.5;
let aH = 0.75;


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
PIXI.Loader.shared
  .add("gomaNeko", "img/gomaNeko.png")
  .add("gomaNekoWalk", "img/gomaNekoWalk.png")
  .add("avaW", "img/avaW.png")
  .add("avaNEs", "img/avaNEs.png")
  .add("avaSEs", "img/avaSEs.png")
  .add("avaSWs", "img/avaSWs.png")
  .add("avaNWs", "img/avaNWs.png")
  .add("avaNs", "img/avaNs.png")
  .add("avaEs", "img/avaEs.png")
  .add("avaWs", "img/avaWs.png")
  .add("entrance", "img/entrance.jpg")
  .on("progress", loadProgressHandler)
  .load(setUp)
  .load(gameLoop);



//プログラミングのローダー確認
function loadProgressHandler(Loader, resources) {
  // console.log("loading"+resources.url);
  // console.log("loading:"+resources.name);
  console.log("progress" + Loader.progress + "%");
}


//新しい人がきたときにその次の人の画像を読みこんでおく※次の人のをやっておく必要性があるかはわからｎ
socket.on("loadNewUser", function (data) {
  avaSWs[data.socketID] = new PIXI.Sprite(PIXI.Loader.shared.resources["avaSWs"].texture);
  avaWs[data.socketID] = new PIXI.Sprite(PIXI.Loader.shared.resources["avaWs"].texture);
  avaNWs[data.socketID] = new PIXI.Sprite(PIXI.Loader.shared.resources["avaNWs"].texture);
  avaNs[data.socketID] = new PIXI.Sprite(PIXI.Loader.shared.resources["avaNs"].texture);
  avaNEs[data.socketID] = new PIXI.Sprite(PIXI.Loader.shared.resources["avaNEs"].texture);
  avaEs[data.socketID] = new PIXI.Sprite(PIXI.Loader.shared.resources["avaEs"].texture);
  avaSEs[data.socketID] = new PIXI.Sprite(PIXI.Loader.shared.resources["avaSEs"].texture);
  avaS[data.socketID] = new PIXI.Sprite(gomaNekoS);
  avaSW[data.socketID] = new PIXI.Sprite(gomaNekoSW);
  avaW[data.socketID] = new PIXI.Sprite(gomaNekoW);
  avaNW[data.socketID] = new PIXI.Sprite(gomaNekoNW);
  avaN[data.socketID] = new PIXI.Sprite(gomaNekoN);
  avaNE[data.socketID] = new PIXI.Sprite(gomaNekoNE);
  avaE[data.socketID] = new PIXI.Sprite(gomaNekoE);
  avaSE[data.socketID] = new PIXI.Sprite(gomaNekoSE);
  avaSs1[data.socketID] = new PIXI.Sprite(gomaNekoSs1);
  avaSs2[data.socketID] = new PIXI.Sprite(gomaNekoSs2);
  avaSs1[data.socketID].anchor.set(0.5, 1);
  avaSs2[data.socketID].anchor.set(0.5, 1);
  avaSWs[data.socketID].anchor.set(0.5, 1);
  avaWs[data.socketID].anchor.set(0.5, 1);
  avaNWs[data.socketID].anchor.set(0.5, 1);
  avaNs[data.socketID].anchor.set(0.5, 1);
  avaNEs[data.socketID].anchor.set(0.5, 1);
  avaEs[data.socketID].anchor.set(0.5, 1);
  avaSEs[data.socketID].anchor.set(0.5, 1);
  avaS[data.socketID].anchor.set(0.5, 1);
  avaSW[data.socketID].anchor.set(0.5, 1);
  avaW[data.socketID].anchor.set(0.5, 1);
  avaNW[data.socketID].anchor.set(0.5, 1);
  avaN[data.socketID].anchor.set(0.5, 1);
  avaNE[data.socketID].anchor.set(0.5, 1);
  avaE[data.socketID].anchor.set(0.5, 1);
  avaSE[data.socketID].anchor.set(0.5, 1);
});

let gomaNekoS, gomaNekoSW, gomaNekoW, gomaNekoNW, gomaNekoN, gomaNekoNE, gomaNekoE, gomaNekoSE,
  gomaNekoSs1, gomaNekoSs2;
// let S, SW, W, NW, N, NE, E, ES, Ss1, Ss2;

function setUp() {
  gomaNekoS = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNekoWalk"), new PIXI.Rectangle(0, 0, 40, 70));
  gomaNekoSW = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(40, 0, 40, 70));
  gomaNekoW = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(80, 0, 40, 70));
  gomaNekoNW = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(120, 0, 40, 70));
  gomaNekoN = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(160, 0, 40, 70));
  gomaNekoNE = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(200, 0, 40, 70));
  gomaNekoE = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(240, 0, 40, 70));
  gomaNekoSE = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNeko"), new PIXI.Rectangle(280, 0, 40, 70));
  gomaNekoSs1 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNekoWalk"), new PIXI.Rectangle(40, 0, 40, 70));
  gomaNekoSs2 = new PIXI.Texture(PIXI.BaseTexture.fromImage("gomaNekoWalk"), new PIXI.Rectangle(120, 0, 40, 70));

  socket.emit("set", {});//サーバーに入ったことを伝える
  //エントランスの画像を追加
  entrance = new PIXI.Sprite(PIXI.Loader.shared.resources["entrance"].texture);
  entrance.width = 660;
  entrance.height = 480;



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
  app.stage.addChild(MtextX);

  //マウスY座標の表示位置設定
  MtextY = new PIXI.Text("mouY");
  MtextY.style = {//マウスY座標のスタイル
    fontFamily: "serif",
    fontSize: "12px",
    fill: "red",
  }
  //マウスY座標の位置
  MtextY.position.set(560, 465);
  app.stage.addChild(MtextY);

  //入った時に入力欄にフォーカスを合わせる
  document.querySelector('input').focus();



  //名前を出力
  checkName = function () {
    nameTag[socketID].text = (document.nameForm.userName.value);
    socket.json.emit("emit_name", {
      name: (document.nameForm.userName.value),
    });
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
}
//メッセージを受け取って表示
socket.on("emit_msg_from_server", function (data) {
  const li = document.createElement("li");
  if (abonMsg[data.socketID] != true) {
    li.textContent = data.msg;
    const ul = document.querySelector("ul");
    ul.insertBefore(li, document.getElementById("logs").querySelectorAll("li")[0]);
    msg[data.socketID].text = data.avaMsg;

    // 発言したテキストをクリックした時アボンする
    li.className = data.abonClass;//アボンクラスを付与
    const abonClass = document.getElementsByClassName(data.abonClass);
    abonClass[0].addEventListener("click", function () {
      if (data.socketID != socketID) {//自テキストは省く
        if (abonMsg[data.socketID]) {
          abonMsg[data.socketID] = false;
        } else {
          abonMsg[data.socketID] = true;
        }
        socket.json.emit("abonMsg", {
          abonMsg: abonMsg[data.socketID],
          socketID: data.socketID,
        });
      }
    });
  }
});

//アボンした時の処理
socket.on("abonMsg_from_server", function (data) {
  const li = document.createElement("li");
  li.textContent = data.msg;
  const ul = document.querySelector("ul");
  if (abonMsg[data.socketID] == true || data.msg == "その住民は退出済みです") {
    li.style.color = "red";
    ul.insertBefore(li, document.getElementById("logs").querySelectorAll("li")[0]);
    msg[data.socketID].style.fill = "red";
  } else {
    li.style.color = "blue";
    ul.insertBefore(li, document.getElementById("logs").querySelectorAll("li")[0]);
    msg[data.socketID].style.fill = "white";
  }
  msg[data.socketID].text = data.avaMsg;
});


socket.on("mySocketID_from_server", function (data) {
  socketID = data.socketID;
  const keys = Object.keys(data.user);
  keys.forEach(function (value) {
    //アバターの画像を設定
    avaSWs[value] = new PIXI.Sprite(PIXI.Loader.shared.resources["avaSWs"].texture);
    avaWs[value] = new PIXI.Sprite(PIXI.Loader.shared.resources["avaWs"].texture);
    avaNWs[value] = new PIXI.Sprite(PIXI.Loader.shared.resources["avaNWs"].texture);
    avaNs[value] = new PIXI.Sprite(PIXI.Loader.shared.resources["avaNs"].texture);
    avaNEs[value] = new PIXI.Sprite(PIXI.Loader.shared.resources["avaNEs"].texture);
    avaEs[value] = new PIXI.Sprite(PIXI.Loader.shared.resources["avaEs"].texture);
    avaSEs[value] = new PIXI.Sprite(PIXI.Loader.shared.resources["avaSEs"].texture);

    avaS[value] = new PIXI.Sprite(gomaNekoS);
    // avaS[value].tint= 0xffff00; //これで色変更ができるうううううううう！
    // avaS[value].alpha = 0.9;//半透明か
    avaSW[value] = new PIXI.Sprite(gomaNekoSW);
    avaW[value] = new PIXI.Sprite(gomaNekoW);
    avaNW[value] = new PIXI.Sprite(gomaNekoNW);
    avaN[value] = new PIXI.Sprite(gomaNekoN);
    avaNE[value] = new PIXI.Sprite(gomaNekoNE);
    avaE[value] = new PIXI.Sprite(gomaNekoE);
    avaSE[value] = new PIXI.Sprite(gomaNekoSE);
    avaSs1[value] = new PIXI.Sprite(gomaNekoSs1);
    avaSs2[value] = new PIXI.Sprite(gomaNekoSs2);
    avaSs1[value].anchor.set(0.5, 1);
    avaSs2[value].anchor.set(0.5, 1);
    avaSWs[value].anchor.set(0.5, 1);
    avaWs[value].anchor.set(0.5, 1);
    avaNWs[value].anchor.set(0.5, 1);
    avaNs[value].anchor.set(0.5, 1);
    avaNEs[value].anchor.set(0.5, 1);
    avaEs[value].anchor.set(0.5, 1);
    avaSEs[value].anchor.set(0.5, 1);
    avaS[value].anchor.set(0.5, 1);
    avaSW[value].anchor.set(0.5, 1);
    avaW[value].anchor.set(0.5, 1);
    avaNW[value].anchor.set(0.5, 1);
    avaN[value].anchor.set(0.5, 1);
    avaNE[value].anchor.set(0.5, 1);
    avaE[value].anchor.set(0.5, 1);
    avaSE[value].anchor.set(0.5, 1);
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
  app.stage.addChild(avaP[socketID]);
});





//ログイン時の処理
function login() {
  //userNameにフォームの内容を入れる
  userName = document.nameForm.userName.value;
  if (userName != "") {//名前が空だと移動しない//マップを切り替える
    //エントランス画像を表示
    app.stage.addChild(entrance);
    //ログイン画面のアバを一回消す
    app.stage.removeChild(avaP[socketID]);
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
    // app.stage.removeChild(block1);//ブロック１を消す
    // app.stage.removeChild(block2);//ブロック２を消す
    //座標を消す
    app.stage.removeChild(AtextX);
    app.stage.removeChild(AtextY);
    app.stage.removeChild(MtextX);
    app.stage.removeChild(MtextY);
    inRoom = 1;
  }
}

//ルーム入室時に自分と他人のアバターを生成する
socket.on("join_me_from_server", function (data) {
  const keys = Object.keys(data.user);
  keys.forEach(function (value) {
    if (data.user[value].room == "entrance") {
      // アバターの親コンテナを作成
      avaP[value] = new PIXI.Container();
      avaP[value].position.set(data.user[value].AX, data.user[value].AY);

      //アバタークリックでアボン
      avaP[value].interactive = true;
      abonMsg[value] = false;
      avaP[value].on("click", function () {
        if (value != socketID) {//自アバターは省く 
          if (abonMsg[value]) {
            abonMsg[value] = false;
          } else {
            abonMsg[value] = true;
          }
          socket.json.emit("abonMsg", {
            abonMsg: abonMsg[value],
            socketID: value,
          });
        }
      });
      // 画像とメッセージと名前を追加してステージに上げる
      if (data.user[value].DIR == 0) {
        console.log("ID" + value + "DIR" + 0);
        avaC[value] = avaNE[value];
        avaP[value].addChild(avaC[value]);
      } else if (data.user[value].DIR == 1) {
        console.log("ID" + value + "DIR" + 1);
        avaC[value] = avaSE[value];
        avaP[value].addChild(avaC[value]);
      } else if (data.user[value].DIR == 2) {
        console.log("ID" + value + "DIR" + 2);
        avaC[value] = avaSW[value];
        avaP[value].addChild(avaC[value]);
      } else if (data.user[value].DIR == 3) {
        console.log("ID" + value + "DIR" + 3);
        avaC[value] = avaNW[value];
        avaP[value].addChild(avaC[value]);
      } else if (data.user[value].DIR == 4) {
        console.log("ID" + value + "DIR" + 4);
        avaC[value] = avaN[value];
        avaP[value].addChild(avaC[value]);
      } else if (data.user[value].DIR == 5) {
        console.log("ID" + value + "DIR" + 5);
        avaC[value] = avaE[value];
        avaP[value].addChild(avaC[value]);
      } else if (data.user[value].DIR == 6) {
        console.log("ID" + value + "DIR" + 6);
        avaC[value] = avaS[value];
        avaP[value].addChild(avaC[value]);
      } else {
        console.log("ID" + value + "DIR" + 7);
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
      app.stage.addChild(avaP[value]);
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
  avaP[data.socketID].position.set(410, 80);

  // アバタークリックでアボン
  avaP[data.socketID].interactive = true;
  abonMsg[data.socketID] = false;
  avaP[data.socketID].on("click", function () {
    if (abonMsg[data.socketID]) {
      abonMsg[data.socketID] = false;
    } else {
      abonMsg[data.socketID] = true;
    }
    socket.json.emit("abonMsg", {
      abonMsg: abonMsg[data.socketID],
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
  app.stage.addChild(avaP[data.socketID]);
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



//画面をタップした時の処理
document.getElementById("graphic").addEventListener("touchstart", function () {
  console.log("tes3");
  app.stage.on('touchstart', function (event) {
    flag = true;
    console.log("tes");
    MX = event.data.getLocalPosition(event.target).x;
    MY = event.data.getLocalPosition(event.target).y;
    console.log("MX" + event.data.getLocalPosition(event.target).x);
    console.log("MY" + event.data.getLocalPosition(event.target).y);
    moveEvent();
    console.log("tes5");
  });
  console.log("tes4");
});
//画面をクリックした時の処理
// entrance.interactive = true;
// app.stage.on("click",function(){//こっちのが良いかも、一応置いとく
document.getElementById("graphic").addEventListener("click", function () {
  if (flag) {
    flag = false;
  } else {
    MX = app.renderer.plugins.interaction.mouse.global.x;
    MY = app.renderer.plugins.interaction.mouse.global.y;
    console.log("clickMX" + app.renderer.plugins.interaction.mouse.global.x);
    console.log("clickMY" + app.renderer.plugins.interaction.mouse.global.y);
    moveEvent();
    document.msgForm.msg.focus();
  }
});


function moveEvent() {
  if (inRoom == 0) {
    if (MX > AX + aW && MY < AY - aH) {
      anime(avaNE, avaNEs, avaNEs, socketID);
    } else if (MX > AX + aW && MY > AY) {
      anime(avaSE, avaSEs, avaSEs, socketID);
    } else if (MX < AX - aW && MY > AY) {
      anime(avaSW, avaSWs, avaSWs, socketID);
    } else if (MX < AX - aW && MY < AY - aH) {
      anime(avaNW, avaNWs, avaNWs, socketID);
    } else if (MX < AX - aW) {
      anime(avaW, avaWs, avaWs, socketID);
    } else if (MX > AX + aW) {
      anime(avaE, avaEs, avaEs, socketID);
    } else if (MY < AY) {
      anime(avaN, avaNs, avaNs, socketID);
    } else if (MY > AY) {
      anime(avaS, avaSs1, avaSs2, socketID);
    } else {
    };

    gsap.to(avaP[socketID], {
      duration: 0.4, x: MX, y: MY,
      onComplete: function () {
        AX = avaP[socketID].x;
        AY = avaP[socketID].y;
      }
    });
  } else if (inRoom == 1) {
    inRoom = 2;
  } else if (inRoom == 2) {
    // 方向に合わせて画像を変えて表示
    if (MX > AX + aW && MY < AY - aH) {
      DIR = 0;
    } else if (MX > AX + aW && MY > AY) {
      DIR = 1;
    } else if (MX < AX - aW && MY > AY) {
      DIR = 2;
    } else if (MX < AX - aW && MY < AY - aH) {
      DIR = 3;
    } else if (MX < AX - aW) {
      DIR = 7;
    } else if (MX > AX + aW) {
      DIR = 5;
    } else if (MY < AY) {
      DIR = 4;
    } else if (MY > AY) {
      DIR = 6;
    } else { }
    if (room == "entrance") {
      entranceBlock();
    }//別の部屋の場合でつき足す!!!!!!!!!!!!
    moveX = MX;
    moveY = MY;
    AX = MX;
    AY = MY;
    if (colPointAll[0] == undefined) {
      socket.json.emit("clickMap", {
        DIR: DIR,
        AX: AX,
        AY: AY,
        socketID: socketID,
        moveX: moveX,
        moveY: moveY,
      });
    } else {//ブロックと交わる場合
      //distanceが最小値順になるように並び変える
      colPointAll.sort(function (a, b) {
        if (a.distance > b.distance) {
          return 1;
        } else {
          return -1;
        }
      });
      //衝突時の動き
      if (colPointAll[0].PX > colPointAll[0].TX && colPointAll[0].TY > colPointAll[0].PY) {
        colMove(colPointAll[0], -1, -1);
      } else if (colPointAll[0].TX > colPointAll[0].PX && colPointAll[0].TY > colPointAll[0].PY) {
        colMove(colPointAll[0], -1, 1);
      } else if (colPointAll[0].PX > colPointAll[0].TX && colPointAll[0].PY > colPointAll[0].TY) {
        colMove(colPointAll[0], 1, -1);
      } else if (colPointAll[0].TX > colPointAll[0].PX && colPointAll[0].PY > colPointAll[0].TY) {
        colMove(colPointAll[0], 1, 1);
      }
    }
    // 初期化
    colPointAll = [];
    //メッセージにフォーカスを当てる
  }
}



function anime(ava, avas1, avas2, value) {
  gsap.to(avaP[value], 0, {
    delay: 0.1,
    onUpdate: function () {
      avaP[value].removeChild(avaC[value]);
      avaC[value] = avas1[value];
      avaP[value].addChild(avaC[value]);
      avaP[value].addChild(nameTag[value]);
      avaP[value].addChild(msg[value]);
    }
  });
  gsap.to(avaP[value], 0, {
    delay: 0.2,
    onUpdate: function () {
      avaP[value].removeChild(avaC[value]);
      avaC[value] = avas2[value];
      avaP[value].addChild(avaC[value]);
      avaP[value].addChild(nameTag[value]);
      avaP[value].addChild(msg[value]);
    }
  });
  gsap.to(avaP[value], 0, {
    delay: 0.3,
    onUpdate: function () {
      avaP[value].removeChild(avaC[value]);
      avaC[value] = avas1[value];
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


//移動時のソケット受け取り
socket.on("clickMap_from_server", function (data) {
  socket.emit("AXYDIR", {
    DIR: DIR,
    socketID: socketID,
    AX: AX,
    AY: AY,
  });
  moveX = data.moveX;
  moveY = data.moveY;

  if (data.DIR == 0) {//子要素の画像を入れる
    anime(avaNE, avaNEs, avaNEs, data.socketID);
  } else if (data.DIR == 1) {
    anime(avaSE, avaSEs, avaSEs, data.socketID);
  } else if (data.DIR == 2) {
    anime(avaSW, avaSWs, avaSWs, data.socketID);
  } else if (data.DIR == 3) {
    anime(avaNW, avaNWs, avaNWs, data.socketID);
  } else if (data.DIR == 4) {
    anime(avaN, avaNs, avaNs, data.socketID);
  } else if (data.DIR == 5) {
    anime(avaE, avaEs, avaEs, data.socketID);
  } else if (data.DIR == 6) {
    anime(avaS, avaSs1, avaSs2, data.socketID);
  } else {
    anime(avaW, avaWs, avaWs, data.socketID);
  }
  moving.to(avaP[data.socketID], { duration: 0.4, x: moveX, y: moveY });
});


function gameLoop() {
  requestAnimationFrame(gameLoop);
  // MX = app.renderer.plugins.interaction.mouse.global.x;
  // MY = app.renderer.plugins.interaction.mouse.global.y;

  AtextX.text = "avaX" + AX;
  AtextY.text = "avaY" + AY;
  // if(0<=MX && app.renderer.plugins.interaction.mouse.global.x<=660 && 0<=MY && MY < 480){
  // MtextX.text="mouX"+MX;
  // MtextY.text="mouY"+MY;
  // }
}




function checkColPoint(bX, bY) { //(collisionPointの略)
  //移動前の点と移動後の点との直線で、最も近い物体の交点を求める
  for (let i = 0; i < bX.length - 1; i++) {
    //まず、移動前と移動後を結ぶ直線とそれぞれの物体の辺を横切る直線との交点を全て得る
    colPoint[i].LX = ((bY[i + 1] - AY) * (MX - AX) * (bX[i] - bX[i + 1])
      - bX[i + 1] * (bY[i] - bY[i + 1]) * (MX - AX)
      + AX * (MY - AY) * (bX[i] - bX[i + 1]))
      / ((MY - AY) * (bX[i] - bX[i + 1])
        - (bY[i] - bY[i + 1]) * (MX - AX));
    colPoint[i].LY = (bY[i + 1] * (MY - AY) * (bX[i] - bX[i + 1])
      + (MY - AY) * (AX - bX[i + 1]) * (bY[i] - bY[i + 1])
      - AY * (bY[i] - bY[i + 1]) * (MX - AX))
      / ((MY - AY) * (bX[i] - bX[i + 1])
        - (bY[i] - bY[i + 1]) * (MX - AX));
    //移動前の点から移動後の点への直線に物体との交点があるかどうかで絞り込む
    if (
      //辺の直線との交点が道中にあるかどうか、
      ((MX >= colPoint[i].LX && colPoint[i].LX >= AX) || (AX >= colPoint[i].LX && colPoint[i].LX >= MX))
      &&
      //交点が物体の辺のＸ座標の間に収まってるかどうか
      ((colPoint[i].LX >= bX[i] && colPoint[i].LX <= bX[i + 1]) || (colPoint[i].LX <= bX[i] && colPoint[i].LX >= bX[i + 1]))
      &&
      //交点が物体の辺のＹ座標の間に収まってるかどうか
      ((colPoint[i].LY >= bY[i] && colPoint[i].LY <= bY[i + 1]) || (colPoint[i].LY <= bY[i] && colPoint[i].LY >= bY[i + 1]))) {
      //交点の物体の辺の端点を配列に登録する
      colPoint[i].TX = bX[i];
      colPoint[i].TY = bY[i];
      colPoint[i].PX = bX[i + 1];
      colPoint[i].PY = bY[i + 1];

      // それぞれの点の物体との距離の2乗を算出する ※大きさを比較するだけなので、2乗のままでおｋ
      colPoint[i].distance = Math.pow((colPoint[i].LX - AX), 2) + Math.pow((colPoint[i].LY - AY), 2);
      //衝突点を配列に纏める
      colPointAll.push(colPoint[i]);
    }
  }
}



function iniColPoint(blockSize) {//checkColpointで設定したcolPointを初期化
  colPoint = [];
  for (let i = 0; i < blockSize.length - 1; i++) {
    colPoint[i] = {
      LX: "", LY: "", distance: "",
    };
  }
}


function colMove(cPA, jX, jY) {//ブロックと衝突時の動きの式
  // //座標MX,MYから垂直の点の座標
  // VX=((MX*(cPA.TX-cPA.PX)**2+cPA.TX*(cPA.TY-cPA.PY)**2+(MY-cPA.TY)*(cPA.TY-cPA.PY)*(cPA.TX-cPA.PX))/((cPA.TX-cPA.PX)**2+(cPA.PY-cPA.TY)**2));

  // VY=(((cPA.TX-MX)*(cPA.PX-cPA.TX)*(cPA.TY-cPA.PY)+(cPA.TY-MY)*(cPA.TX-cPA.PX)**2)/((cPA.TX-cPA.PX)**2+(cPA.PY-cPA.TY)**2)+MY);


  // //接する辺の式
  // lineY=(cPA.TY-cPA.PY)*MX/(cPA.TX-cPA.PX)+(cPA.TX*cPA.PY-cPA.PX*cPA.TY)/(cPA.TX-cPA.PX);
  // //lineYの傾き
  // lineYa=(cPA.TY-cPA.PY)/(cPA.TX-cPA.PX);


  //辺の右側に垂直な式を得る
  rightY = (MX * (cPA.PX - cPA.TX) + (Math.pow(cPA.TX, 2) + Math.pow(cPA.TY, 2) - cPA.PX * cPA.TX - cPA.TY * cPA.PY)) / (cPA.TY - cPA.PY);
  //辺の左側に垂直な式を得る
  leftY = (MX * (cPA.PX - cPA.TX) - (Math.pow(cPA.PX, 2) + Math.pow(cPA.PY, 2) - cPA.TX * cPA.PX - cPA.TY * cPA.PY)) / (cPA.TY - cPA.PY);



  if ((leftY > MY && MY > rightY) || (leftY < MY && MY < rightY)) {
    //途中で止まる時//パターン２
    console.log("col2-1");
    //交点まで1/3ずつ移動する
    moveX = cPA.LX;
    moveY = cPA.LY;
    socket.json.emit("clickMap", {
      DIR: DIR,
      socketID: socketID,
      moveX: moveX,
      moveY: moveY,
    });


    //垂直点まで1/3ずつ移動する
    moveX = ((MX * Math.pow((cPA.TX - cPA.PX), 2) + cPA.TX * Math.pow((cPA.TY - cPA.PY), 2)
      + (MY - cPA.TY) * (cPA.TY - cPA.PY) * (cPA.TX - cPA.PX))
      / (Math.pow((cPA.TX - cPA.PX), 2)
        + Math.pow((cPA.PY - cPA.TY), 2)));
    moveY = (((cPA.TX - MX) * (cPA.PX - cPA.TX) * (cPA.TY - cPA.PY)
      + (cPA.TY - MY) * Math.pow((cPA.TX - cPA.PX), 2))
      / (Math.pow((cPA.TX - cPA.PX), 2) + Math.pow((cPA.PY - cPA.TY), 2))
      + MY);


    AX = (MX * Math.pow((cPA.TX - cPA.PX), 2) + cPA.TX * Math.pow((cPA.TY - cPA.PY), 2)
      + (MY - cPA.TY) * (cPA.TY - cPA.PY) * (cPA.TX - cPA.PX))
      / (Math.pow((cPA.TX - cPA.PX), 2)
        + Math.pow((cPA.PY - cPA.TY), 2)) + jX;
    AY = ((cPA.TX - MX) * (cPA.PX - cPA.TX) * (cPA.TY - cPA.PY)
      + (cPA.TY - MY) * Math.pow((cPA.TX - cPA.PX), 2))
      / (Math.pow((cPA.TX - cPA.PX), 2) + Math.pow((cPA.PY - cPA.TY), 2))
      + MY + jY;

  } else if ((rightY > MY && cPA.PY > cPA.TY) || (rightY < MY && cPA.TY > cPA.PY)) {
    //辺の右側に移動するとき//パターン３
    console.log("col2-2");
    //交点まで移動する
    moveX = cPA.LX;
    moveY = cPA.LY;
    socket.json.emit("clicKMap", {
      DIR: DIR,
      socketID: socketID,
      moveX: moveX,
      moveY: moveY,
    });
    //辺の右端に移動する
    moveX = cPA.TX;
    moveY = cPA.TY;
    socket.json.emit("clickMap", {
      DIR: DIR,
      socketID: socketID,
      moveX: moveX,
      moveY: moveY,
    });
    AX = cPA.TX + jX;
    AY = cPA.TY + jY;
  } else if ((MY > leftY && cPA.PY > cPA.TY) || (leftY > MY && cPA.TY > cPA.PY)) {
    //辺の左側に移動するとき//パターン４
    console.log("col2-3");
    //交点まで移動する
    moveX = cPA.LX;
    moveY = cPA.LY;

    socket.json.emit("clicKMap", {
      DIR: DIR,
      socketID: socketID,
      moveX: moveX,
      moveY: moveY,
    });

    //辺の左端に移動する
    moveX = cPA.PX;
    moveY = cPA.PY;
    socket.json.emit("clickMap", {
      DIR: DIR,
      socketID: socketID,
      moveX: moveX,
      moveY: moveY,
    });
    AX = cPA.PX + jX;
    AY = cPA.PY + jY;
  }
}



function entranceBlock() {
  iniColPoint(block1X);//block1XのcolPointを初期化
  checkColPoint(block1X, block1Y);//block1のcollision pointを調べる
  iniColPoint(block2X);//block2XのcolPointを初期化
  checkColPoint(block2X, block2Y);//block2のcollision pointを調べる
}


//ログアウトした時の処理
socket.on("logout_from_server", function (data) {
  const li = document.createElement("li");
  li.textContent = data.msg;//退出ログを入れる
  const ul = document.querySelector("ul");
  ul.insertBefore(li, document.getElementById("logs").querySelectorAll("li")[0]);
  //部屋人数の表記を変える
  document.getElementById('users').textContent = "users:" + data.roomUser;
  app.stage.removeChild(avaP[data.socketID]);
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