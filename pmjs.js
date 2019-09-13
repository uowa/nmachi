//日付:たまたまソースを見っけたのでとりあえず入れといた、あとでver4の日付と合わせたい
var day = new Date().toLocaleString();
document.getElementById('box').innerHTML = day;

{
//ページ全体のマウス座標
// window.onload=function(){
//   //マウス移動時のイベントをBODYタグに登録する
//   document.body.addEventListener("mousemove", function(e){
//
//     //座標を取得する
//     var mX = e.pageX;  //X座標
//     var mY = e.pageY;  //Y座標
//
//     //座標を表示する
//     document.getElementById("txtX").value = mX;
//     document.getElementById("txtY").value = mY;
//   });
// }


//名前表示の書きかけ、たぶんサーバーサイド言語に触れてからじゃないと意味ないので放置
// let name;
// function getValue(idname){
// // value値を取得する
// let result = document.getElementById(idname).value;
// // 表示する
//  chat= result;
// }
}

//とりあえずチャットだけは表示されるようにした。
//エンターキーは未対応
let chat;
function getValue(idname){
// value値を取得する
let result = document.getElementById(idname).value;
// 表示する
 chat= result;
}



//アバターの画像
//斜め右上から四方向に時計回り→上から四方向に時計回り
let direction = ['img/upperRight.png','img/lowerRight.png', 'img/lowerLeft.png','img/upperLeft.png',
                  'img/upper.png', 'img/Right.png','img/lower.png', 'img/left.png',
                  'img/upperRight2.png','img/lowerRight2.png', 'img/lowerLeft2.png','img/upperLeft2.png',
                  'img/upper2.png', 'img/Right2.png','img/lower2.png', 'img/left2.png'];

let directionS = ['img/upperRightS.png','img/lowerRightS.png', 'img/lowerLeftS.png','img/upperLeftS.png',
                  'img/upperS.png', 'img/RightS.png','img/lowerS.png', 'img/leftS.png',
                  'img/upperRightS2.png','img/lowerRightS2.png', 'img/lowerLeftS2.png','img/upperLeftS2.png',
                  'img/upperS2.png', 'img/RightS2.png','img/lowerS2.png', 'img/leftS2.png'];







//アバター画像読みこみ
const img =[];
for(let i=0; i<direction.length; i++){
  img[i] = document.createElement('img');
  img[i].src = direction[i];
}

const imgS =[];
for(let i=0; i<direction.length; i++){
  imgS[i] = document.createElement('img');
  imgS[i].src = directionS[i];
}


{//CanvasとCreateJSで画面実装
  //CreateJSはhttps://ics.media/tutorial-createjs/basicを上から読んで理解した。
  //挙動はFireFoxで確認すること、
  // Chromeのローカルサーバーだと、CreateJSの画像が上手く動かないことがあるらしい

  //Canvas実装
  let stage = new createjs.Stage("canvas");
    const ctx = canvas.getContext('2d');

  //ブラウザがcanvas未対応だった時に、読みこみを止めれるようにできるらしいんだけど、なんかエラー吐く。
  // const canvas = document.querySelector('canvas');
  // if (typeof canvas.getContext === 'undefined'){
  //     return;
  // }

  //Canvasを高解像度に対応
  const CANVAS_WIDTH = 550;
  const CANVAS_HEIGHT = 400;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = CANVAS_WIDTH*dpr;
  canvas.height = CANVAS_HEIGHT*dpr;
  ctx.scale(dpr,dpr);



  let AX = 500;
  let AY = 400;
  let colPoint= [];
  let colPointAll =[];
  let LX,LY,distace,TX,TY,PX,PY,wall,MX,MY;
  let wallCount=0;

  let wassyoiN=20;

  // //ブロックを配置
  let block1 = new createjs.Shape();//ブロックを置く宣言
  block1.graphics.beginFill("black"); //塗りつぶす色を決める
  block1.graphics.moveTo(321, 250);//初期点、ここらから線を引く
  block1.graphics.lineTo(680, 251);//時計回りに次の点を入れていく
  block1.graphics.lineTo(681, 322);
  block1.graphics.lineTo(400, 323);
  block1.graphics.lineTo(320, 276);
  stage.addChild(block1);//実装


  let block2 = new createjs.Shape();
  block2.graphics.beginFill("black");
  block2.graphics.moveTo(0, 0);
  block2.graphics.lineTo(475, 1);
  block2.graphics.lineTo(470, 91);
  block2.graphics.lineTo(451, 90);
  block2.graphics.lineTo(450, 21);
  block2.graphics.lineTo(406, 20);
  block2.graphics.lineTo(405, 91);
  block2.graphics.lineTo(290, 90);
  block2.graphics.lineTo(76, 198);
  block2.graphics.lineTo(1, 138);
  stage.addChild(block2);//実装


  //ブロックの頂点の座標をブロックごとに入れてく、最後に始点を入れてることに注意。
  const block1X=[321,680,681,400,320,321];
  const block1Y=[250,252,322,323,276,250];
  const block2X=[0,475,470,451,450,406,405,290, 76,  1,0];
  const block2Y=[0,  1, 91, 90, 21, 20, 91, 90,198,138,0];


  //ワープポイント作成
  let warp = new createjs.Shape();
  //色と形を指定
  warp.graphics.beginFill("blue").drawCircle(0, 0, 80);
  warp.y = 300;
  // 円を描く
  stage.addChild(warp);


  // //アバター変更用ポイント大きいほう
  // let bigAvatar = new createjs.Bitmap("img/bigAvatarImg.png");
  // bigAvatar.scaleX =0.8;
  // bigAvatar.scaleY =0.8;
  // bigAvatar.x = 250;
  // bigAvatar.y = 220;
  // stage.addChild(bigAvatar);

  // //アバター変更用ポイント大きいほう
  // let smallAvatar = new createjs.Bitmap("img/smallAvatarImg.png");
  // smallAvatar.scaleX =0.8;
  // smallAvatar.scaleY =0.8;
  // smallAvatar.x = 340;
  // smallAvatar.y = 200;
  // stage.addChild(smallAvatar);


  window.addEventListener("load", () => {//画像読みこみ後に実行する
    const draw = () => {



      //アバターのコンテナ（親、parent）を作成
      var avaP = new createjs.Container();
      // 画像の基準点を真ん中にするために、横幅半分と、高さの数値を取る
      let aW = img[0].width/2;
      let aH = img[0].height;//大きいほう
      let aHS = imgS[0].height;//小さいほう
      //コンテナの基準点
      avaP.regX = aW;
      avaP.regY = aH;
      //コンテナの初期位置
      avaP.x = 500;
      avaP.y = 400;
      stage.addChild(avaP);



      // アバター作成
      let ava = [];
      for(let i = 0; i<direction.length; i++){
        ava[i] = new createjs.Bitmap(direction[i]);
      }




      //初期アバターの表示
      let C = 6;
      let avaC = ava[6];
      avaP.addChild(avaC);



      //アバターのモーション用関数
      anime1= () => {
        //前の画像を除去
        avaP.removeChild(avaC);
        //画像を切り替え
        C+=8;
        avaC =ava[C];
        //画像を表示
        avaP.addChild(avaC);
      }
      anime2= () => {
        //前の画像を除去
        avaP.removeChild(avaC);
        //画像を切り替え
        C-=8;
        avaC = ava[C];
        //画像を表示
        avaP.addChild(avaC);
      }

      {
        //アバターの設定メモ
        // avaC.alpha=0.5;//半透明にする
        // avaC.scale = 3.0; // 300%の大きさにに設定する
        // avaC.scaleX = 0.5; // 50%の幅に設定する
        // avaC.scaleY = 2.0; // 200%の高さに設する
      }

      let avaTween = function(FX,FY,time1,time2,time3){// (移動後のX座標,移動後のY座標,一つ目の画像切り替えまでの移動時間,二つ目の画像切り替えまでの移動時間,三つ目の画像切り替えまでの移動時間)


        createjs.Tween.get(avaP)
        .to({x:(FX-AX)/3+AX,y:(FY-AY)/3+AY}, time1,createjs.cubicInOut)
        .call(anime1)
        .to({x:2*(FX-AX)/3+AX,y:2*(FY-AY)/3+AY}, time2,createjs.cubicInOut)
        .call(anime2)
        .to({x:FX,y:FY}, time3,createjs.cubicInOut);
        AX = FX;
        AY = FY;
      }

      let checkColPoint = function(bX,bY){ //collisionPoint
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
              //衝突点を纏める
              colPointAll.push(colPoint[i]);
            }
          }
        }



        let iniColPoint = function(blockSize){//colPointを初期化
          colPoint=[];
          for(let i=0; i<blockSize.length-1; i++){
          colPoint[i]= {LX:"", LY:"", distance:"", TX,TY,PX,PY};
        }
      }

      let colMove=function(cPA,jX,jY){
        //座標MX,MYから垂直の点の座標
        // VX=((MX*(cPA.TX-cPA.PX)**2+cPA.TX*(cPA.TY-cPA.PY)**2+(MY-cPA.TY)*(cPA.TY-cPA.PY)*(cPA.TX-cPA.PX))/((cPA.TX-cPA.PX)**2+(cPA.PY-cPA.TY)**2));
        //
        // VY=(((cPA.TX-MX)*(cPA.PX-cPA.TX)*(cPA.TY-cPA.PY)+(cPA.TY-MY)*(cPA.TX-cPA.PX)**2)/((cPA.TX-cPA.PX)**2+(cPA.PY-cPA.TY)**2)+MY);

        //接する辺の式
        lineY=(cPA.TY-cPA.PY)*MX/(cPA.TX-cPA.PX)+(cPA.TX*cPA.PY-cPA.PX*cPA.TY)/(cPA.TX-cPA.PX);
        //lineYの傾き
        lineYa=(cPA.TY-cPA.PY)/(cPA.TX-cPA.PX);
        //辺の右側に垂直な式を得る
        rightY=(MX*(cPA.PX-cPA.TX)+(cPA.TX**2+cPA.TY**2-cPA.PX*cPA.TX-cPA.TY*cPA.PY))/(cPA.TY-cPA.PY);
        //辺の左側に垂直な式を得る
        leftY= (MX*(cPA.PX-cPA.TX)-(cPA.PX**2+cPA.PY**2-cPA.TX*cPA.PX-cPA.TY*cPA.PY))/(cPA.TY-cPA.PY);

        if((leftY>MY && MY>rightY) || (leftY<MY && MY<rightY)){
        //途中で止まる時
        console.log("col2-1");
        createjs.Tween.get(avaP)
          //交点まで1/3ずつ移動する
          .to({x:(cPA.LX+2*AX)/3,y:(cPA.LY+2*AY)/3}, 50,createjs.cubicInOut)
          .call(anime1)
          .to({x:(2*cPA.LX+AX)/3,y:(2*cPA.LY+AY)/3}, 50,createjs.cubicInOut)
          .call(anime2)
          .to({x:cPA.LX,y:cPA.LY},50,createjs.cubicInOut)
          //垂直点まで1/3ずつ移動する
          .to({x:(((MX*(cPA.TX-cPA.PX)**2+cPA.TX*(cPA.TY-cPA.PY)**2
            +(MY-cPA.TY)*(cPA.TY-cPA.PY)*(cPA.TX-cPA.PX))
            /((cPA.TX-cPA.PX)**2
            +(cPA.PY-cPA.TY)**2))+2*cPA.LX)/3,y:((((cPA.TX-MX)*(cPA.PX-cPA.TX)*(cPA.TY-cPA.PY)
              +(cPA.TY-MY)*(cPA.TX-cPA.PX)**2)
              /((cPA.TX-cPA.PX)**2+(cPA.PY-cPA.TY)**2)
              +MY)+2*cPA.LY)/3},50,createjs.cubicInOut)
          .call(anime1)
          .to({x:(2*((MX*(cPA.TX-cPA.PX)**2+cPA.TX*(cPA.TY-cPA.PY)**2
            +(MY-cPA.TY)*(cPA.TY-cPA.PY)*(cPA.TX-cPA.PX))
            /((cPA.TX-cPA.PX)**2
            +(cPA.PY-cPA.TY)**2))+cPA.LX)/3,y:(2*(((cPA.TX-MX)*(cPA.PX-cPA.TX)*(cPA.TY-cPA.PY)
              +(cPA.TY-MY)*(cPA.TX-cPA.PX)**2)
              /((cPA.TX-cPA.PX)**2+(cPA.PY-cPA.TY)**2)
              +MY)+cPA.LY)/3},50,createjs.cubicInOut)
          .call(anime2)
          .to({x:((MX*(cPA.TX-cPA.PX)**2+cPA.TX*(cPA.TY-cPA.PY)**2
            +(MY-cPA.TY)*(cPA.TY-cPA.PY)*(cPA.TX-cPA.PX))
            /((cPA.TX-cPA.PX)**2
            +(cPA.PY-cPA.TY)**2)),y:(((cPA.TX-MX)*(cPA.PX-cPA.TX)*(cPA.TY-cPA.PY)
              +(cPA.TY-MY)*(cPA.TX-cPA.PX)**2)
              /((cPA.TX-cPA.PX)**2+(cPA.PY-cPA.TY)**2)
              +MY)},20,createjs.cubicInOut);
          AX = (MX*(cPA.TX-cPA.PX)**2+cPA.TX*(cPA.TY-cPA.PY)**2
            +(MY-cPA.TY)*(cPA.TY-cPA.PY)*(cPA.TX-cPA.PX))
            /((cPA.TX-cPA.PX)**2
            +(cPA.PY-cPA.TY)**2)+jX;
          AY = ((cPA.TX-MX)*(cPA.PX-cPA.TX)*(cPA.TY-cPA.PY)
            +(cPA.TY-MY)*(cPA.TX-cPA.PX)**2)
            /((cPA.TX-cPA.PX)**2+(cPA.PY-cPA.TY)**2)
            +MY+jY;

          }else if((rightY>MY && cPA.PY>cPA.TY) || (rightY<MY && cPA.TY>cPA.PY)){
            console.log("col2-2");
          //辺の右側に移動するとき
          createjs.Tween.get(avaP)
            //交点まで移動する
            .to({x:(cPA.LX+2*AX)/3,y:(cPA.LY+2*AY)/3}, 50,createjs.cubicInOut)
            .call(anime1)
            .to({x:(2*cPA.LX+AX)/3,y:(2*cPA.LY+AY)/3}, 50,createjs.cubicInOut)
            .call(anime2)
            .to({x:cPA.LX,y:cPA.LY},50,createjs.cubicInOut)
            //辺の右端に移動する
            .to({x:(2*cPA.LX+cPA.TX)/3,y:(2*cPA.LY+cPA.TY)/3},50,createjs.cubicInOut)
            .call(anime1)
            .to({x:(cPA.LX+2*cPA.TX)/3,y:(cPA.LY+2*cPA.TY)/3},50,createjs.cubicInOut)
            .call(anime2)
            .to({x:cPA.TX,y:cPA.TY},20,createjs.cubicInOut);
            AX = cPA.TX+jX;
            AY = cPA.TY+jY;

          }else if((MY>leftY && cPA.PY>cPA.TY) || (leftY>MY && cPA.TY>cPA.PY)){
            //辺の左側に移動するとき
            console.log("col2-3");
          createjs.Tween.get(avaP)
            //交点まで移動する
            .to({x:(cPA.LX+2*AX)/3,y:(cPA.LY+2*AY)/3}, 50,createjs.cubicInOut)
            .call(anime1)
            .to({x:(2*cPA.LX+AX)/3,y:(2*cPA.LY+AY)/3}, 50,createjs.cubicInOut)
            .call(anime2)
            .to({x:cPA.LX,y:cPA.LY},50,createjs.cubicInOut)
            //辺の左端に移動する
            .to({x:(2*cPA.LX+cPA.PX)/3,y:(2*cPA.LY+cPA.PY)/3},50,createjs.cubicInOut)
            .call(anime1)
            .to({x:(cPA.LX+2*cPA.PX)/3,y:(cPA.LY+2*cPA.PY)/3},50,createjs.cubicInOut)
            .call(anime2)
            .to({x:cPA.PX,y:cPA.PY},20,createjs.cubicInOut);
            AX = cPA.PX+jX;
            AY = cPA.PY+jY;
          }
        }
      iniColPoint(block1X);


      let wassyoI=function(text){
        let wassyoi = new createjs.Text(text, "24px serif", "DarkRed");
        wassyoi.y=wassyoiN-20;
        stage.addChild(wassyoi);
        wassyoiN += 20;
      }
{ //     //アバターの当たり判定を足元を囲うように設置する,今のとここれは使わない,物体の中心に対してしか判定をとらなくて使いにくい
  //     let avaHit=[];
  //     avaHit[0] = new createjs.Shape;
  //     avaHit[0].graphics.beginFill("black");
  //     avaHit[0].graphics.drawCircle(0, 0, 5);
  //     avaHit[0].y = 3*aH/4;
  //     avaP.addChild(avaHit[0]);
  //
  //     avaHit[1] = new createjs.Shape;
  //     avaHit[1].graphics.beginFill("black");
  //     avaHit[1].graphics.drawCircle(0, 0, 5);
  //     avaHit[1].y = aH;
  //     avaP.addChild(avaHit[1]);
  //
  //     avaHit[2] = new createjs.Shape;
  //     avaHit[2].graphics.beginFill("black");
  //     avaHit[2].graphics.drawCircle(0, 0, 5);
  //     avaHit[2].x = 2*aW;
  //     avaHit[2].y = aH;
  //     avaP.addChild(avaHit[2]);
  //
  //     avaHit[3] = new createjs.Shape;
  //     avaHit[3].graphics.beginFill("black");
  //     avaHit[3].graphics.drawCircle(0, 0, 5);
  //     avaHit[3].x = 2*aW;
  //     avaHit[3].y = 3*aH/4;
  //     avaP.addChild(avaHit[3]);
  //
  //     //当たり判定がブロックに当たった時の動作、上と同じくとりま使わない
  //     hitMove = () =>{
  //     for(let i=0; i<4; i++){
  //     let point = avaHit[i].localToLocal(0, 0, block1);
  //     let isHit = block1.hitTest(point.x, point.y);
  //        if (isHit == true) {
  //       console.log("hit");
  //     }
  //     let point2 = block1.localToLocal(0, 0, avaHit[i]);
  //     let isHit2 = avaHit[i].hitTest(point2.x, point2.y);
  //        if (isHit2 == true) {
  //       console.log("hit");
  //     }
  //   }
  // }
}

      //テキスト
      // new createjs.Text(テキスト, フォント, 色);
      let t = new createjs.Text("test","24px serif", "DarkRed");
      t.textAlign = "left";
      t.y = -30;
      avaP.addChild(t);



      //未検証！！！！！！！
      // タッチ操作をサポートしているブラウザーなら, タッチ操作を有効にする。
      if(createjs.Touch.isSupported() == true){
        createjs.Touch.enable(stage)
      }

      //マウスオーバーを有効にする
      stage.enableMouseOver();






      /////////////////クリックした時の処理////////////////////////
      canvas.addEventListener("click", handleClick);
      function handleClick(event){

        // //マウスの座標を取得
        MX = stage.mouseX;
        MY = stage.mouseY;
        //一旦前のアバター画像を消す
        avaP.removeChild(avaC);

        // 方向に合わせて画像を変えて表示
        if(MX > avaP.x + aW && MY < avaP.y-aH){
        C=0;
        avaC = ava[0];
        avaP.addChild(avaC);
        }else if(MX > avaP.x +aW && MY > avaP.y){
          C=1;
          avaC = ava[1];
          avaP.addChild(avaC);
        }else if(MX < avaP.x -aW && MY > avaP.y){
          C=2;
          avaC = ava[2];
          avaP.addChild(avaC);
        }else if(MX < avaP.x -aW && MY < avaP.y-aH){
          C=3;
          avaC = ava[3];
          avaP.addChild(avaC);
        }else if(MY < avaP.y-aH){
          C=4;
          avaC = ava[4];
          avaP.addChild(avaC);
        }else if(MX > avaP.x +aW){
          C=5;
          avaC = ava[5];
          avaP.addChild(avaC);
        }else if(MY > avaP.y){
          C=6;
          avaC = ava[6];
          avaP.addChild(avaC);
        }else if(MX < avaP.x -aW){
          C=7;
          avaC = ava[7];
          avaP.addChild(avaC);
        }else{
          C=0;
          avaC = ava[0];
          avaP.addChild(avaC);
        }

          checkColPoint(block1X,block1Y);
          iniColPoint(block2X);
          checkColPoint(block2X,block2Y);

          if(colPointAll[0]==undefined){//ブロックと交わらなければそのままマウスの座標に進む
            avaTween(MX,MY,10,80,10);
          }else{
            //distanceが最小値順になるように並び変える
            colPointAll.sort((a,b)=>{
              if(a.distance>b.distance){
                return 1;
              }else{
                return -1;
              }
            });
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

        //元アバターを切り替える
        if(345<AX && AX<475 && 202<AY && AY <246){
          for(let i = 0; i<directionS.length; i++){
            ava[i] = new createjs.Bitmap(directionS[i]);
          }
          //コンテナの基準点
          avaP.regY = aHS;
        }else if(257<AX && AX<321 && 214<AY && AY <316){
          for(let i = 0; i<direction.length; i++){
            ava[i] = new createjs.Bitmap(direction[i]);
          }
          //コンテナの基準点
          avaP.regY = aH;
        }else if(475<AX && AX<490 && 0<AY && AY <17 && wassyoiN%3!==0){
          wassyoI("わっしょい！");
        }else if(475<AX && AX<490 && 0<AY && AY <17 && wassyoiN%3===0){
          wassyoI("わっしょい！！！！！！！！");
        }
          //初期化
          colPointAll=[];
        }
/////////////////////////////////////////////////////////////////////////




      //ワープポイントの上にマウスオーバー
      warp.addEventListener("mouseover", handleMouseOver);
      function handleMouseOver(event){
        // 緑で塗り直す
        warp.graphics
        .clear()
        .beginFill("green")
        .drawCircle(0, 0, 80);
      }
      // マウスアウトしたとき
      warp.addEventListener("mouseout", handleMouseOut);
      function handleMouseOut(event){
        // 赤で塗り直す
        warp.graphics
        .clear()
        .beginFill("blue")
        .drawCircle(0, 0, 80);
      }
      // // ワープポイントをクリックしたとき
      // warp.addEventListener("click", handleClickWarp);
      // function handleClickWarp(event) {
      //   warp.visible = false; // 非表示にする
      // }



      //アバターX座標の表示位置設定
      let AtextX = new createjs.Text("avaX","12px serif", "blue");
      AtextX.x =560;
      AtextX.y =430;
      stage.addChild(AtextX);
      //アバターY座標の表示位置設定
      let AtextY = new createjs.Text("avaY","12px serif", "blue");
      AtextY.x =560;
      AtextY.y =445;
      stage.addChild(AtextY);
      //X座標の表示位置設定
      let MtextX = new createjs.Text("mouX","12px serif", "red");
      MtextX.x = 560;
      MtextX.y = 460;
      stage.addChild(MtextX);
      //Y座標の表示位置設定
      let MtextY = new createjs.Text("mouY","12px serif", "red");
      MtextY.x =560;
      MtextY.y =475;
      stage.addChild(MtextY);




      //毎フレーム、ステージを自動更新する
      createjs.Ticker.addEventListener("tick", handleTick);
      function handleTick(){
        //テキストを入れ替える
        t.text = chat;//チャットテキスト
        AtextX.text = "AX:"+avaP.x;//アバターのＸ座標
        AtextY.text = "AY:"+avaP.y;//アバターのY座標
        MtextX.text = "X:"+stage.mouseX;//Ｘ座標
        MtextY.text = "Y:"+stage.mouseY;//Ｙ座標



        //ステージの描画を更新
        stage.update();
      }
      createjs.Ticker.timingMode = createjs.Ticker.RAF;//ブラウザへの処理回数の最適化、ほぼ60FPS
    }
    draw();//実行
  });
}
