'use strict';
//ソケットIOをonにする
var socket = io.connect('153.127.33.40:3000');

// 未検証！！！！！！！
// タッチ操作をサポートしているブラウザーなら, タッチ操作を有効にする。
//ブラウザがcanvas未対応だった時に、読みこみを止めれるようにできるらしいんだけど、なんかエラー吐く。

//アバターの初期位置
let AX = 410;
let AY = 80;

let userNum;
let userName;
let socketID;

let pageUser=0;
let room = "エントランス";

//宣言
let avaP = [];
let avaS = [],avaSW=[],avaW=[],avaNW=[],avaN=[],avaNE=[],avaE=[],avaSE=[];
let avaSs=[],avaSWs=[],avaWs=[],avaNWs=[],avaNs=[],avaNEs=[],avaEs=[],avaSEs=[];
let avaC;
let nameTag=[];
let msg=[];
let checkName,checkMsg;


let colPoint = [];
let colPointAll =[];
let LX,LY,distace,TX,TY,PX,PY,wall,MX,MY;
let wallCount=0;

// let ava = [];

let C = 6;

let AtextX,AtextY,MtextX,MtextY;
let nameTagX=-30;
let nameTagY=-70;
let inRoom=0;
let entrance;

let moving =gsap.timeline();
let moveX,moveY;
let rightY, leftY;


//エイリアス
let Application = PIXI.Application,
Loader = PIXI.Loader.shared,
resources = PIXI.Loader.shared.resources,
Sprite = PIXI.Sprite;


//日付
let day = new Date().toLocaleString();
document.getElementById('box').innerHTML = day;

//webGL(Canvasの設定)
let app = new Application({
  width:660,
  height:480,
});
//最初の背景画像
app.renderer.backgroundColor = 0X4C4C52;
// app.renderer.autoDensityautoResize=true;//要るんか？？これ

//  ブロックを配置
let block1 = new PIXI.Graphics();//ブロックを置く宣言
block1.beginFill("black");
block1.drawPolygon([
  321,250,
  690,251,
  690,322,
  400,323,
  320,276,
]);
app.stage.addChild(block1);//実装




let block2 = new PIXI.Graphics();//ブロックを置く宣言
block2.beginFill("black");
block2.drawPolygon([
  0,0,
  465,1,
  460,91,
  437,90,
  436,21,
  388,20,
  386,91,
  290,90,
  76,198,
  1,138,
]);
app.stage.addChild(block2);//実装


// ブロックの頂点の座標をブロックごとに入れてく、最後に始点を入れてることに注意。
const block1X=[321,690,691,400,320,321];
const block1Y=[250,252,322,323,276,250];
const block2X=[0,465,460,437,436,388,386,290, 76,  1,0];
const block2Y=[0,  1, 91, 90, 21, 20, 91, 90,198,138,0];



//アバターの画像
//斜め右上から四方向に時計回り→上から四方向に時計回り
let direction = ['img/avaNE.png','img/avaSE.png', 
'img/avaSW.png','img/avaNW.png',
'img/avaN.png', 'img/avaS.png', 'img/avaW.png',
// 'images/upperRight2.png','images/lowerRight2.png', 'images/lowerLeft2.png','images/upperLeft2.png',
// 'images/upper2.png', 'images/Right2.png','images/lower2.png', 'images/left2.png'
];

// let directionS = ['images/upperRightS.png','images/lowerRightS.png',
// 'images/lowerLeftS.png','images/upperLeftS.png',
// 'images/upper2.png', 'images/RightS.png','images/lowerS.png', 'images/leftS.png',
// 'images/upperRightS2.png','images/lowerRightS2.png', 'images/lowerLeftS2.png','images/upperLeftS.png',
// 'images/upperS2.png', 'images/RightS2.png','images/lowerS2.png', 'images/leftS2.png'];


//ここらへん、こんなことせずに普通に数値入れれば良いかも
// アバター画像読みこみ
const img =[];//大きいほう
for(let i=0; i<direction.length; i++){
  img[i] = document.createElement('img');
  img[i].src = direction[i];
}

// const imgS =[];//小さいほう
// for(let i=0; i<direction.length; i++){
//   imgS[i] = document.createElement('img');
//   imgS[i].src = directionS[i];
//     }
// 画像の基準点を真ん中にするために、横幅半分と、高さの数値を取る
let aW = img[0].naturalWidth/2;
let aH = img[0].naturalHeight;//大きいほう
// let aHS = imgS[0].height;//小さいほう


let nameTagStyle =new PIXI.TextStyle({//名前のスタイル
  fontSize:20,
  fill:"blue",
});


let msgStyle =new PIXI.TextStyle({//メッセージのスタイル
  fontFamily: "Arial",
  fontSize: 18,
  fill: "white",
  // stroke: '#ff3300',
  // strokeThickness: 4,
  // dropShadow: true,
  // dropShadowColor: "#000000",
  // dropShadowBlur: 4,
  // dropShadowAngle: Math.PI / 6,
  // dropShadowDistance: 6,
});





// レンダラーのviewをDOMに追加する
document.getElementById("graphic").appendChild(app.view);
//userNumを取得する
Loader
.add("avaNE","img/avaNE.png")
.add("avaSE","img/avaSE.png")
.add("avaSW","img/avaSW.png")
.add("avaNW","img/avaNW.png")
.add("avaN","img/avaN.png")
.add("avaE","img/avaE.png")
.add("avaS","img/avaS.png")
.add("avaW","img/avaW.png")
.add("avaNEs","img/avaNEs.png")
.add("avaSEs","img/avaSEs.png")
.add("avaSWs","img/avaSWs.png")
.add("avaNWs","img/avaNWs.png")
.add("avaNs","img/avaNs.png")
.add("avaEs","img/avaEs.png")
.add("avaSs","img/avaSs.png")
.add("avaWs","img/avaWs.png")
.add("entrance","img/entrance.png")
.on("progress",loadProgressHandler)
.load(setup)
.load(gameLoop);



//プログラミングのローダー確認
function loadProgressHandler(Loader,resources){
  // console.log("loading"+resources.url);
  console.log("loading:"+resources.name);
  console.log("progress"+Loader.progress+"%");
}



function setup() {
  socket.emit("myNum", {
  });

  //エントランスの画像を追加
  entrance=new Sprite(resources["entrance"].texture);
  entrance.width=660;
  entrance.height=480;

  // 座標確認用のオブジェクト
  // アバターX座標の表示位置設定
  AtextX = new PIXI.Text("avaX");
  AtextX.style={
    fontFamily:"serif",
    fontSize:"12px",
    fill:"blue",
  }

  AtextX.position.set(560,420);
  app.stage.addChild(AtextX);

  //アバターY座標の表示位置設定
  AtextY = new PIXI.Text("avaY");
  AtextY.style={
    fontFamily:"serif",
    fontSize:"12px",
    fill:"blue",
  }

  AtextY.position.set(560,435);
  app.stage.addChild(AtextY);
  //X座標の表示位置設定
  MtextX = new PIXI.Text("mouX");
  MtextX.style={
    fontFamily:"serif",
    fontSize:"12px",
    fill:"red",
  }


  MtextX.position.set(560,450);
  app.stage.addChild(MtextX);
  //Y座標の表示位置設定
  MtextY = new PIXI.Text("mouY");
  MtextY.style={
    fontFamily:"serif",
    fontSize:"12px",
    fill:"red",
  }
  MtextY.position.set(560,465);
  app.stage.addChild(MtextY);



  //名前を出力
  checkName =()=>{
    nameTag[0].text=(document.nameForm.userName.value);
  }

  //メッセージ出力
  checkMsg =()=>{
    msg.text=(document.msgForm.msg.value);
  }
}

socket.on("pageUser", function (data) {
  pageUser = data.pageUser;
  console.log("pageUser" + pageUser);
});

socket.on("myNum_from_server",function(data){
  userNum=data.userNum;
  //アバターの画像を設定
  for (let i = 0; i < 200; i++) {
    avaS[i] = new Sprite(resources["avaS"].texture);
    avaS[i].position.set(-aW, -aH);
    avaSW[i] = new Sprite(resources["avaSW"].texture);
    avaSW[i].position.set(-aW, -aH);
    avaW[i] = new Sprite(resources["avaW"].texture);
    avaW[i].position.set(-aW, -aH);
    avaNW[i] = new Sprite(resources["avaNW"].texture);
    avaNW[i].position.set(-aW, -aH);
    avaN[i] = new Sprite(resources["avaN"].texture);
    avaN[i].position.set(-aW, -aH);
    avaNE[i] = new Sprite(resources["avaNE"].texture);
    avaNE[i].position.set(-aW, -aH);
    avaE[i] = new Sprite(resources["avaE"].texture);
    avaE[i].position.set(-aW, -aH);
    avaSE[i] = new Sprite(resources["avaSE"].texture);
    avaSE[i].position.set(-aW, -aH);

    avaSs[i] = new Sprite(resources["avaSs"].texture);
    avaSs[i].position.set(-aW, -aH);
    avaSWs[i] = new Sprite(resources["avaSWs"].texture);
    avaSWs[i].position.set(-aW, -aH);
    avaWs[i] = new Sprite(resources["avaWs"].texture);
    avaWs[i].position.set(-aW, -aH);
    avaNWs[i] = new Sprite(resources["avaNWs"].texture);
    avaNWs[i].position.set(-aW, -aH);
    avaNs[i] = new Sprite(resources["avaNs"].texture);
    avaNs[i].position.set(-aW, -aH);
    avaNEs[i] = new Sprite(resources["avaNEs"].texture);
    avaNEs[i].position.set(-aW, -aH);
    avaEs[i] = new Sprite(resources["avaEs"].texture);
    avaEs[i].position.set(-aW, -aH);
    avaSEs[i] = new Sprite(resources["avaSEs"].texture);
    avaSEs[i].position.set(-aW, -aH);
  }


  nameTag[0] = new PIXI.Text(document.nameForm.userName.value,nameTagStyle);
  nameTag[0].position.set(nameTagX,nameTagY);//名前の位置
  //アバターの親コンテナを設定
  avaP[0]=new PIXI.Container();
  avaP[0].position.set(320,200);
  //名前とメッセージと画像を追加
  avaP[0].addChild(avaS[0]);
  avaP[0].addChild(nameTag[0]);
  //ステージに追加
  app.stage.addChild(avaP[0]);
});



//ログイン時の処理
function login() {
  //userNameにフォームの内容を入れる
  // nameTag[0].text=document.nameForm.userName.value;
  userName=document.nameForm.userName.value;
  if(userName!=""){//名前が空だと移動しない//マップを切り替える
    //エントランス画像を表示
    app.stage.addChild(entrance);
    //ログイン画面のアバを一回消す
    app.stage.removeChild(avaP[0]);
    socket.json.emit("join_room",{//エントランスに入る
      room:"エントランス",
      userNum:userNum,//ユーザーナンバー
      userName: userName,//ユーザーネーム
    });


    //フォームを切り替える
    document.getElementById("nameForm").style.display="none";
    document.getElementById("msgForm").style.display="block";
    document.getElementById("login").remove();
    app.stage.removeChild(block1);//ブロック１を消す
    app.stage.removeChild(block2);//ブロック２を消す
    //座標を消す
    app.stage.removeChild(AtextX);
    app.stage.removeChild(AtextY);
    app.stage.removeChild(MtextX);
    app.stage.removeChild(MtextY);
    inRoom=1;
  }
}

socket.on("join_me_from_server",function(data){
  for (let i = 0; i < pageUser + 1; i++) {
    if (data.userEX[i] == true) {
      // アバターの親コンテナを作成
      avaP[i] = new PIXI.Container();
      avaP[i].position.set(data.AX[i], data.AY[i]);
      // 画像とメッセージと名前を追加してステージに上げる
      app.stage.addChild(avaP[i]);
      if (data.C[i] == 0) {
        avaP[i].addChild(avaNE[i]);
      } else if (data.C[0] == 1) {
        avaP[i].addChild(avaSE[i]);
      } else if (data.C[0] == 2) {
        avaP[i].addChild(avaSW[i]);
      } else if (data.C[0] == 3) {
        avaP[i].addChild(avaNW[i]);
      } else if (data.C[0] == 4) {
        avaP[i].addChild(avaN[i]);
      } else if (data.C[0] == 5) {
        avaP[i].addChild(avaE[i]);
      } else if (data.C[0] == 6) {
        avaP[i].addChild(avaS[i]);
      } else if (data.C[0] == 7) {
        avaP[i].addChild(avaW[i]);
      } else { }
      // //名前タグを追加
      nameTag[i] = new PIXI.Text(data.userName[i], nameTagStyle);
      nameTag[i].position.set(nameTagX, nameTagY);
      avaP[i].addChild(nameTag[i]);
      // アバターのメッセージを追加する
      msg[i] = new PIXI.Text("", msgStyle);
      msg[i].position.set(-30, -60);
      avaP[i].addChild(msg[i]);
    }
  }
});



//ルーム入室時のアナウンスとアバター作成
socket.on("join_room_from_server", function (data) {
  for (let i = 0; i < pageUser + 1; i++) {
    if (data.userNum == i) {
      // アバターの親コンテナを作成
      avaP[i] = new PIXI.Container();
      avaP[i].position.set(410, 80);
      // //名前タグを追加
      nameTag[i] = new PIXI.Text(data.userName, nameTagStyle);
      nameTag[i].position.set(nameTagX, nameTagY);
      
      // アバターのメッセージを追加する
      msg[i] = new PIXI.Text("", msgStyle);
      msg[i].position.set(-30, -60);
      // 画像とメッセージと名前を追加してステージに上げる
      app.stage.addChild(avaP[i]);
      avaP[i].addChild(avaS[i]);
      avaP[i].addChild(nameTag[i]);
      avaP[i].addChild(msg[i]);
    }
  }
//入室時のメッセージを出す
  $("#logs").prepend($("<li>").text(data.msg));
});


//クリックした時の処理
document.getElementById("graphic").onclick = function(){
  if(inRoom==0){
    if(MX > AX + aW && MY < AY-aH){
      gsap.to(avaP[0],0,{
        delay:0.1,
        onUpdate:function(){
          avaP[0].removeChild(avaC);
          avaC=avaNEs[0];
          avaP[0].addChild(avaC);
          avaP[0].addChild(nameTag[0]);
        }
      });
      gsap.to(avaP[0],0,{
        delay:0.2,
        onUpdate:function(){
          avaP[0].removeChild(avaC);
          avaC=avaNE[0];
          avaP[0].addChild(avaC);
          avaP[0].addChild(nameTag[0]);
        }
      });
      gsap.to(avaP[0],0,{
        delay:0.3,
        onUpdate:function(){
          avaP[0].removeChild(avaC);
          avaC=avaNEs[0];
          avaP[0].addChild(avaC);
          avaP[0].addChild(nameTag[0]);
        }
      });
      gsap.to(avaP[0],0,{
        delay:0.4,
        onUpdate:function(){
          avaP[0].removeChild(avaC);
          avaC=avaNE[0];
          avaP[0].addChild(avaC);
          avaP[0].addChild(nameTag[0]);
        }
      });
    }else if(MX > AX +aW && MY > AY){
      gsap.to(avaP[0],0,{
        delay:0.1,
        onUpdate:function(){
          avaP[0].removeChild(avaC);
          avaC=avaSEs[0];
          avaP[0].addChild(avaC);
          avaP[0].addChild(nameTag[0]);
        }
      });
      gsap.to(avaP[0],0,{
        delay:0.2,
        onUpdate:function(){
          avaP[0].removeChild(avaC);
          avaC=avaSE[0];
          avaP[0].addChild(avaC);
          avaP[0].addChild(nameTag[0]);
        }
      });
      gsap.to(avaP[0],0,{
        delay:0.3,
        onUpdate:function(){
          avaP[0].removeChild(avaC);
          avaC=avaSEs[0];
          avaP[0].addChild(avaC);
          avaP[0].addChild(nameTag[0]);
        }
      });
      gsap.to(avaP[0],0,{
        delay:0.4,
        onUpdate:function(){
          avaP[0].removeChild(avaC);
          avaC=avaSE[0];
          avaP[0].addChild(avaC);
          avaP[0].addChild(nameTag[0]);
        }
      });
    }else if(MX < AX -aW && MY > AY){
        gsap.to(avaP[0],0,{
          delay:0.1,
          onUpdate:function(){
            avaP[0].removeChild(avaC);
            avaC=avaSWs[0];
            avaP[0].addChild(avaC);
            avaP[0].addChild(nameTag[0]);
          }
        });
        gsap.to(avaP[0],0,{
          delay:0.2,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaSW[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
          gsap.to(avaP[0],0,{
            delay:0.3,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaSWs[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
          gsap.to(avaP[0],0,{
            delay:0.4,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaSW[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
          }else if(MX < AX -aW && MY < AY-aH){
             gsap.to(avaP[0],0,{
               delay:0.1,
               onUpdate:function(){
                 avaP[0].removeChild(avaC);
                 avaC=avaNWs[0];
                 avaP[0].addChild(avaC);
                 avaP[0].addChild(nameTag[0]);
                }
              });
             gsap.to(avaP[0],0,{
              delay:0.2,
              onUpdate:function(){
                avaP[0].removeChild(avaC);
                avaC=avaNW[0];
                avaP[0].addChild(avaC);
                avaP[0].addChild(nameTag[0]);
               }
             });
            gsap.to(avaP[0],0,{
              delay:0.3,
              onUpdate:function(){
                avaP[0].removeChild(avaC);
                avaC=avaNWs[0];
                avaP[0].addChild(avaC);
                avaP[0].addChild(nameTag[0]);
               }
             });
            gsap.to(avaP[0],0,{
              delay:0.4,
              onUpdate:function(){
                avaP[0].removeChild(avaC);
                avaC=avaNW[0];
                avaP[0].addChild(avaC);
                avaP[0].addChild(nameTag[0]);
               }
             });
        }else if(MX < AX -aW){
          gsap.to(avaP[0],0,{
            delay:0.1,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaWs[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
          gsap.to(avaP[0],0,{
            delay:0.2,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaW[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
          gsap.to(avaP[0],0,{
            delay:0.3,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaWs[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
          gsap.to(avaP[0],0,{
            delay:0.4,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaW[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
        }else if(MX > AX +aW){
          gsap.to(avaP[0],0,{
            delay:0.1,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaEs[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
          gsap.to(avaP[0],0,{
            delay:0.2,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaE[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
          gsap.to(avaP[0],0,{
            delay:0.3,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaEs[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
          gsap.to(avaP[0],0,{
            delay:0.4,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaE[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
        }else if(MY < AY){
          gsap.to(avaP[0],0,{
            delay:0.1,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaNs[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
          gsap.to(avaP[0],0,{
            delay:0.2,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaN[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
          gsap.to(avaP[0],0,{
            delay:0.3,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaNs[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
          gsap.to(avaP[0],0,{
            delay:0.4,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaN[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
        }else if(MY > AY){
          gsap.to(avaP[0],0,{
            delay:0.1,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaSs[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
          gsap.to(avaP[0],0,{
            delay:0.2,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC = avaS[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
          gsap.to(avaP[0],0,{
            delay:0.3,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC=avaSs[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
          gsap.to(avaP[0],0,{
            delay:0.4,
            onUpdate:function(){
              avaP[0].removeChild(avaC);
              avaC = avaS[0];
              avaP[0].addChild(avaC);
              avaP[0].addChild(nameTag[0]);
             }
           });
        }else{
        }

  gsap.to(avaP[0],{duration:0.4,x:MX,y:MY,
    onComplete:function(){
      AX=avaP[0].x;
      AY=avaP[0].y;
  
  }});
}else if(inRoom==1){
  inRoom=2;
}else if( inRoom==2){
    //マウスの座標を取得
    MX = app.renderer.plugins.interaction.mouse.global.x;
    MY = app.renderer.plugins.interaction.mouse.global.y;

    // 方向に合わせて画像を変えて表示
    if(MX > AX + aW && MY < AY-aH){
      C=0;
    }else if(MX > AX +aW && MY > AY){
      C=1;
    }else if(MX < AX -aW && MY > AY){
      C=2;
    }else if(MX < AX -aW && MY < AY-aH){
      C=3;
    }else if(MX < AX -aW){
      C=7;
    }else if(MX > AX +aW){
      C=5;
    }else if(MY < AY){
      C=4;
    }else if(MY > AY){
      C=6;
    }else{}
    if(room=="エントランス"){
      entranceBlock();
    }//別の部屋の場合でつき足す
    moveX=MX;
    moveY=MY;
    AX=MX;
    AY=MY;
    if(colPointAll[0]==undefined){
      socket.json.emit("clickMap",{
        C:C,
        AX:AX,
        AY:AY,
        userNum:userNum,
        moveX:moveX,
        moveY:moveY,
      });
    }else{//ブロックと交わる場合
      //distanceが最小値順になるように並び変える
      colPointAll.sort((a,b)=>{
        if(a.distance>b.distance){
          return 1;
        }else{
          return -1;
        }
      });
      //衝突時の動き
      if(colPointAll[0].PX>colPointAll[0].TX && colPointAll[0].TY>colPointAll[0].PY){
        colMove(colPointAll[0],-1,-1);
      }else if(colPointAll[0].TX>colPointAll[0].PX && colPointAll[0].TY>colPointAll[0].PY){
        colMove(colPointAll[0],-1,1);
      }else if(colPointAll[0].PX>colPointAll[0].TX && colPointAll[0].PY>colPointAll[0].TY){
        colMove(colPointAll[0],1,-1);
      }else if(colPointAll[0].TX>colPointAll[0].PX && colPointAll[0].PY>colPointAll[0].TY){
        colMove(colPointAll[0],1,1);
      }
  }
  // 初期化
  colPointAll=[];
  }
}



//移動時のソケット受け取り
socket.on("clickMap_from_server",function(data){
  moveX=data.moveX;
  moveY = data.moveY;
  for (let i = 0; i < pageUser+1; i++) {
    if (data.userNum == i) {
      if (data.D == 0) {//子要素の画像を削除
        avaP[i].removeChild(avaNE[i]);
      } else if (data.D == 1) {
        avaP[i].removeChild(avaSE[i]);
      } else if (data.D == 2) {
        avaP[i].removeChild(avaSW[i]);
      } else if (data.D == 3) {
        avaP[i].removeChild(avaNW[i]);
      } else if (data.D == 4) {
        avaP[i].removeChild(avaN[i]);
      } else if (data.D == 5) {
        avaP[i].removeChild(avaE[i]);
      } else if (data.D == 6) {
        avaP[i].removeChild(avaS[i]);
      } else {
        avaP[i].removeChild(avaW[i]);
      }

      if (data.C == 0) {//子要素の画像を入れる
        gsap.to(avaP[i], 0, {
          delay: 0.1,
          onUpdate: function () {
            avaP[i].removeChild(avaNE[i]);
            avaP[i].addChild(avaNEs[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.2,
          onUpdate: function () {
            avaP[i].removeChild(avaNEs[i]);
            avaP[i].addChild(avaNE[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.3,
          onUpdate: function () {
            avaP[i].removeChild(avaNE[i]);
            avaP[i].addChild(avaNEs[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.4,
          onUpdate: function () {
            avaP[i].removeChild(avaNEs[i]);
            avaP[i].addChild(avaNE[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
      } else if (data.C == 1) {
        gsap.to(avaP[i], 0, {
          delay: 0.1,
          onUpdate: function () {
            avaP[i].removeChild(avaSE[i]);
            avaP[i].addChild(avaSEs[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.2,
          onUpdate: function () {
            avaP[i].removeChild(avaSEs[i]);
            avaP[i].addChild(avaSE[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.3,
          onUpdate: function () {
            avaP[i].removeChild(avaSE[i]);
            avaP[i].addChild(avaSEs[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.4,
          onUpdate: function () {
            avaP[i].removeChild(avaSEs[i]);
            avaP[i].addChild(avaSE[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
      } else if (data.C == 2) {
        gsap.to(avaP[i], 0, {
          delay: 0.1,
          onUpdate: function () {
            avaP[i].removeChild(avaSW[i]);
            avaP[i].addChild(avaSWs[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.2,
          onUpdate: function () {
            avaP[i].removeChild(avaSWs[i]);
            avaP[i].addChild(avaSW[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.3,
          onUpdate: function () {
            avaP[i].removeChild(avaSW[i]);
            avaP[i].addChild(avaSWs[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.4,
          onUpdate: function () {
            avaP[i].removeChild(avaSWs[i]);
            avaP[i].addChild(avaSW[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
      } else if (data.C == 3) {
        gsap.to(avaP[i], 0, {
          delay: 0.1,
          onUpdate: function () {
            avaP[i].removeChild(avaNW[i]);
            avaP[i].addChild(avaNWs[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.2,
          onUpdate: function () {
            avaP[i].removeChild(avaNWs[i]);
            avaP[i].addChild(avaNW[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.3,
          onUpdate: function () {
            avaP[i].removeChild(avaNW[i]);
            avaP[i].addChild(avaNWs[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.4,
          onUpdate: function () {
            avaP[i].removeChild(avaNWs[i]);
            avaP[i].addChild(avaNW[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
      } else if (data.C == 4) {
        gsap.to(avaP[i], 0, {
          delay: 0.1,
          onUpdate: function () {
            avaP[i].removeChild(avaN[i]);
            avaP[i].addChild(avaNs[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.2,
          onUpdate: function () {
            avaP[i].removeChild(avaNs[i]);
            avaP[i].addChild(avaN[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.3,
          onUpdate: function () {
            avaP[i].removeChild(avaN[i]);
            avaP[i].addChild(avaNs[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.4,
          onUpdate: function () {
            avaP[i].removeChild(avaNs[i]);
            avaP[i].addChild(avaN[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
      } else if (data.C == 5) {
        gsap.to(avaP[i], 0, {
          delay: 0.1,
          onUpdate: function () {
            avaP[i].removeChild(avaE[i]);
            avaP[i].addChild(avaEs[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.2,
          onUpdate: function () {
            avaP[i].removeChild(avaEs[i]);
            avaP[i].addChild(avaE[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.3,
          onUpdate: function () {
            avaP[i].removeChild(avaE[i]);
            avaP[i].addChild(avaEs[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.4,
          onUpdate: function () {
            avaP[i].removeChild(avaEs[i]);
            avaP[i].addChild(avaE[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
      } else if (data.C == 6) {
        gsap.to(avaP[i], 0, {
          delay: 0.1,
          onUpdate: function () {
            avaP[i].removeChild(avaS[i]);
            avaP[i].addChild(avaSs[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.2,
          onUpdate: function () {
            avaP[i].removeChild(avaSs[i]);
            avaP[i].addChild(avaS[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.3,
          onUpdate: function () {
            avaP[i].removeChild(avaS[i]);
            avaP[i].addChild(avaSs[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.4,
          onUpdate: function () {
            avaP[i].removeChild(avaSs[i]);
            avaP[i].addChild(avaS[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
      } else {
        gsap.to(avaP[i], 0, {
          delay: 0.1,
          onUpdate: function () {
            avaP[i].removeChild(avaW[i]);
            avaP[i].addChild(avaWs[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.2,
          onUpdate: function () {
            avaP[i].removeChild(avaWs[i]);
            avaP[i].addChild(avaW[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.3,
          onUpdate: function () {
            avaP[i].removeChild(avaW[i]);
            avaP[i].addChild(avaWs[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
        gsap.to(avaP[i], 0, {
          delay: 0.4,
          onUpdate: function () {
            avaP[i].removeChild(avaWs[i]);
            avaP[i].addChild(avaW[i]);
            avaP[i].addChild(nameTag[i]);
            avaP[i].addChild(msg[i]);
          }
        });
      }

      moving.to(avaP[i], { duration: 0.3, x: moveX, y: moveY });
      socket.emit("AXYC", {
        userNum: userNum,
        AX: AX,
        AY: AY,
        C: data.C,
      });
    }
  }
});


function gameLoop(){
  requestAnimationFrame(gameLoop);
  MX=app.renderer.plugins.interaction.mouse.global.x;
  MY=app.renderer.plugins.interaction.mouse.global.y;
  AtextX.text="avaX"+AX;
  AtextY.text="avaY"+AY;
  if(0<=MX && app.renderer.plugins.interaction.mouse.global.x<=660 && 0<=MY && MY < 480){
    MtextX.text="mouX"+MX;
    MtextY.text="mouY"+MY;
  }
}




let checkColPoint = function(bX,bY){ //(collisionPointの略)
  //移動前の点と移動後の点との直線で、最も近い物体の交点を求める
  for(let i=0; i<bX.length-1; i++){
    //まず、移動前と移動後を結ぶ直線とそれぞれの物体の辺を横切る直線との交点を全て得る
    colPoint[i].LX=((bY[i+1]-AY)*(MX-AX)*(bX[i]-bX[i+1])
            -bX[i+1]*(bY[i]-bY[i+1])*(MX-AX)
            +AX*(MY-AY)*(bX[i]-bX[i+1]))
            /((MY-AY)*(bX[i]-bX[i+1])
            -(bY[i]-bY[i+1])*(MX-AX));
    colPoint[i].LY=(bY[i+1]*(MY-AY)*(bX[i]-bX[i+1])
            +(MY-AY)*(AX-bX[i+1])*(bY[i]-bY[i+1])
            -AY*(bY[i]-bY[i+1])*(MX-AX))
            /((MY-AY)*(bX[i]-bX[i+1])
            -(bY[i]-bY[i+1])*(MX-AX));
    //移動前の点から移動後の点への直線に物体との交点があるかどうかで絞り込む
    if(
      //辺の直線との交点が道中にあるかどうか、
      ((MX>=colPoint[i].LX && colPoint[i].LX>=AX) || (AX>=colPoint[i].LX && colPoint[i].LX>=MX))
      &&
      //交点が物体の辺のＸ座標の間に収まってるかどうか
      ((colPoint[i].LX >= bX[i] && colPoint[i].LX <= bX[i+1]) || (colPoint[i].LX <= bX[i] &&  colPoint[i].LX >= bX[i+1]))
      &&
      //交点が物体の辺のＹ座標の間に収まってるかどうか
      ((colPoint[i].LY >= bY[i] && colPoint[i].LY <= bY[i+1]) || (colPoint[i].LY <= bY[i] &&  colPoint[i].LY >= bY[i+1]))){
        //交点の物体の辺の端点を配列に登録する
        colPoint[i].TX=bX[i];
        colPoint[i].TY=bY[i];
        colPoint[i].PX=bX[i+1];
        colPoint[i].PY=bY[i+1];

        // それぞれの点の物体との距離の2乗を算出する ※大きさを比較するだけなので、2乗のままでおｋ
        colPoint[i].distance=(colPoint[i].LX -AX)**2+(colPoint[i].LY -AY)**2;
        //衝突点を配列に纏める
        colPointAll.push(colPoint[i]);
      }
    }
  }



let iniColPoint = function(blockSize){//checkColpointで設定したcolPointを初期化
    colPoint=[];
    for(let i=0; i<blockSize.length-1; i++){
    colPoint[i]= {LX:"", LY:"", distance:"", TX,TY,PX,PY};
  }
}


let colMove=function(cPA,jX,jY){//ブロックと衝突時の動きの式
  // //座標MX,MYから垂直の点の座標
  // VX=((MX*(cPA.TX-cPA.PX)**2+cPA.TX*(cPA.TY-cPA.PY)**2+(MY-cPA.TY)*(cPA.TY-cPA.PY)*(cPA.TX-cPA.PX))/((cPA.TX-cPA.PX)**2+(cPA.PY-cPA.TY)**2));

  // VY=(((cPA.TX-MX)*(cPA.PX-cPA.TX)*(cPA.TY-cPA.PY)+(cPA.TY-MY)*(cPA.TX-cPA.PX)**2)/((cPA.TX-cPA.PX)**2+(cPA.PY-cPA.TY)**2)+MY);


  // //接する辺の式
  // lineY=(cPA.TY-cPA.PY)*MX/(cPA.TX-cPA.PX)+(cPA.TX*cPA.PY-cPA.PX*cPA.TY)/(cPA.TX-cPA.PX);
  // //lineYの傾き
  // lineYa=(cPA.TY-cPA.PY)/(cPA.TX-cPA.PX);


  //辺の右側に垂直な式を得る
  rightY=(MX*(cPA.PX-cPA.TX)+(cPA.TX**2+cPA.TY**2-cPA.PX*cPA.TX-cPA.TY*cPA.PY))/(cPA.TY-cPA.PY);
  //辺の左側に垂直な式を得る
  leftY= (MX*(cPA.PX-cPA.TX)-(cPA.PX**2+cPA.PY**2-cPA.TX*cPA.PX-cPA.TY*cPA.PY))/(cPA.TY-cPA.PY);



  if((leftY>MY && MY>rightY) || (leftY<MY && MY<rightY)){
  //途中で止まる時//パターン２
  console.log("col2-1");
    //交点まで1/3ずつ移動する
    moveX=cPA.LX;
    moveY=cPA.LY;
    socket.json.emit("clickMap",{
      C:C,
      userNum:userNum,
      moveX:moveX,
      moveY:moveY,
    });



    //垂直点まで1/3ずつ移動する
    moveX=((MX*(cPA.TX-cPA.PX)**2+cPA.TX*(cPA.TY-cPA.PY)**2
    +(MY-cPA.TY)*(cPA.TY-cPA.PY)*(cPA.TX-cPA.PX))
    /((cPA.TX-cPA.PX)**2
    +(cPA.PY-cPA.TY)**2));
    moveY=(((cPA.TX-MX)*(cPA.PX-cPA.TX)*(cPA.TY-cPA.PY)
    +(cPA.TY-MY)*(cPA.TX-cPA.PX)**2)
    /((cPA.TX-cPA.PX)**2+(cPA.PY-cPA.TY)**2)
    +MY);


    AX = (MX*(cPA.TX-cPA.PX)**2+cPA.TX*(cPA.TY-cPA.PY)**2
      +(MY-cPA.TY)*(cPA.TY-cPA.PY)*(cPA.TX-cPA.PX))
      /((cPA.TX-cPA.PX)**2
      +(cPA.PY-cPA.TY)**2)+jX;
    AY = ((cPA.TX-MX)*(cPA.PX-cPA.TX)*(cPA.TY-cPA.PY)
      +(cPA.TY-MY)*(cPA.TX-cPA.PX)**2)
      /((cPA.TX-cPA.PX)**2+(cPA.PY-cPA.TY)**2)
      +MY+jY;



    }else if((rightY>MY && cPA.PY>cPA.TY) || (rightY<MY && cPA.TY>cPA.PY)){
      //辺の右側に移動するとき//パターン３
      console.log("col2-2");
      //交点まで移動する
      moveX=cPA.LX;
      moveY=cPA.LY;
      socket.json.emit("clicKMap",{
        C:C,
        userNum:userNum,
        moveX:moveX,
        moveY:moveY,
      });
      //辺の右端に移動する
      moveX=cPA.TX;
      moveY=cPA.TY;
      socket.json.emit("clickMap",{
        C:C,
        moveX:moveX,
        moveY:moveY,
      });
      AX = cPA.TX+jX;
      AY = cPA.TY+jY;
    }else if((MY>leftY && cPA.PY>cPA.TY) || (leftY>MY && cPA.TY>cPA.PY)){
      //辺の左側に移動するとき//パターン４
      console.log("col2-3");
      //交点まで移動する
      moveX=cPA.LX;
      moveY=cPA.LY;
      socket.json.emit("clicKMap",{
        C:C,
        userNum:userNum,
        moveX:moveX,
        moveY:moveY,
      });

      //辺の左端に移動する
      moveX=cPA.PX;
      moveY=cPA.PY;
      socket.json.emit("clickMap",{
        C:C,
        userNum:userNum,
        moveX:moveX,
        moveY:moveY,
      });
      AX = cPA.PX+jX;
      AY = cPA.PY+jY;
    }
  }



  function entranceBlock(){
    iniColPoint(block1X);//block1XのcolPointを初期化
    checkColPoint(block1X,block1Y);//block1のcollision pointを調べる
    iniColPoint(block2X);//block2XのcolPointを初期化
    checkColPoint(block2X,block2Y);//block2のcollision pointを調べる
  }



  //jquery起動時の合図らしいが、これ必要なんか謎いからとりあえず省いてる
  // $(function(){
// });

    //名前を送る
    $("#nameForm").submit(function(e){
      e.preventDefault();
      socket.json.emit("emit_name",{
        name:$("#name").val(),
      });
    });

    //チャットの処理
    $("#msgForm").submit(function(e){
      e.preventDefault();
      socket.json.emit("emit_msg",{
        userNum:userNum,
        msg:$("#msg").val(),
      });
      $("#msg").val("").focus();
    });



    socket.on("emit_msg_from_server",function(data){
      $("#logs").prepend($("<li>").text(data.msg));
      for (let i = 0; i < pageUser+1; i++) {
        if(data.userNum==i) {
            msg[i].text = data.avaMsg;
        }
      }
    });

    socket.on("logout_from_server",function(data){
      $("#logs").prepend($("<li>").text(data.msg));
      for (let i = 0; i < pageUser+1; i++) {
        if(data.userIDEX==i) {
            app.stage.removeChild(avaP[i]);
        }
      }
    });




(() => {
  document.querySelector('svg').addEventListener('click', () => {
    document.querySelectorAll('.box').forEach((box) => {
      box.classList.add('moved');
    });
  });
})(); 


        // //元アバターを切り替える
        // if(345<AX && AX<475 && 202<AY && AY <246){
        //   for(let i = 0; i<directionS.length; i++){
        //     ava[i] = new createjs.Bitmap(directionS[i]);
        //   }
        //   //コンテナの基準点を切り替える
        //   avaP.regY = aHS;
        // }else if(257<AX && AX<321 && 214<AY && AY <316){
        //   for(let i = 0; i<direction.length; i++){
        //     ava[i] = new createjs.Bitmap(direction[i]);
        //   }
        //   //コンテナの基準点を切り替える
        //   avaP.regY = aH;
        // }


//ワープポイント作成
// let warp = new createjs.Shape();
// //色と形を指定
// warp.graphics.beginFill("blue").drawCircle(0, 0, 80);
// warp.y = 300;
// // 円を描く
// stage.addChild(warp);


      //ワープポイントの上にマウスオーバー
      // warp.addEventListener("mouseover", handleMouseOver);
      // function handleMouseOver(event){
      //   // 緑で塗り直す
      //   warp.graphics
      //   .clear()
      //   .beginFill("green")
      //   .drawCircle(0, 0, 80);
      // }
      // // マウスアウトしたとき
      // warp.addEventListener("mouseout", handleMouseOut);
      // function handleMouseOut(event){
      //   // 赤で塗り直す
      //   warp.graphics
      //   .clear()
      //   .beginFill("blue")
      //   .drawCircle(0, 0, 80);
      // }
      // // ワープポイントをクリックしたとき
      // warp.addEventListener("click", handleClickWarp);
      // function handleClickWarp(event) {
      //   warp.visible = false; // 非表示にする
      // }



// let left=keyboard(37);
//     up = keyboard(38);
//     right=keyboard(39);
//     down=keyboard(40);

//     left.press= function(){
//       cat.x+=cat.vx;
//     }

// スプライトの削除
// app.stage.removeChild(anySprite)
//スプライトの非表示
// anySprite。visible  =  false ;

//使いどころがよくわからｎ、いらんかも
// let texture = PIXI.utils.TextureCache["img/lower.png"];

// let loginText = new createjs.Text("LOGIN","24px serif", "yellow");
// loginText.textAlign="center";
// loginText.x=330;
// loginText.y=240;
// loginText.fontWeight="bold";
// loginText.textShadow=
//   "2px  2px 5px #ffff1a",
//   "-2px  2px 5px #ffff1a",
//    "2px -2px 5px #ffff1a",
//   "-2px -2px 5px #ffff1a",
//    "2px  0px 5px #ffff1a",
//    "0px  2px 5px #ffff1a",
//   "-2px  0px 5px #ffff1a",
//    "0px -2px 5px #ffff1a";//この表記じゃうまくいかねええええええ、後で治せるかどうか考える

// app.stage.addChild(loginText);


//アバターの設定メモ
// avaC.alpha=0.5;//半透明にする
// avaC.scale = 3.0; // 300%の大きさにに設定する
// avaC.scaleX = 0.5; // 50%の幅に設定する
// avaC.scaleY = 2.0; // 200%の高さに設する


// class AvaP extends PIXI.Container {
//   constructor(){
//     super();
//     //コンテナの基準点
//     //コンテナ初期位置
//     this.x=AX;
//     this.y=AY;
//     app.stage.addChild(this);
//     //アバターの上の名前
//     let userName=document.nameForm.userName.value;
//     // new createjs.Text(テキスト, フォント, 色);
//     nameTag= new PIXI.Text(userName);
//     nameTag.style={
//       fontFamily:"serif",
//       fontSize:"18px",
//       fill:"white",
//     }
//     nameTag.textAlign = "left";
//     nameTag.y = -30;
//     this.addChild(nameTag);
//     //初期アバターの表示
//     this.addChild(avaC);
//   }
// }
// avaP=new AvaP();