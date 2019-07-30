//日付:たまたまソースを見っけたのでとりあえず入れといた、あとでver4の日付と合わせたい
var day = new Date().toLocaleString();
document.getElementById('box').innerHTML = day;


//マウスの座標
var mX;
var mY;
window.addEventListener('DOMContentLoaded', function() {
    document.body.onmousemove = function (e) {
        mX = e.pageX;
        mY = e.pageY;
//マウス移動時のイベントをBODYタグに登録する
        document.getElementById('txtX').value = mX;
        document.getElementById('txtY').value = mY;
    };
})


//クリックした位置にアバターの移動と画像切り替え
//前のクリック位置との比較で動かしてる。
//アバターの座標
var aX = 0;
var aY = 0;

//アバター画像位置微調整用
var aW = 20;
var aH = 50;



const direction_src = new Array('img/upperRight.gif','img/lowerRight.gif', 'img/lowerLeft.gif','img/upperLeft.gif',
                                'img/upper.gif',  'img/Right.gif','img/lower.gif',  'img/left.gif');

const imgTimer　= function(){
//画像番号
count++; //*3  	//画像の枚数確認
if (count == direction_src.length) count = 0; //*4
//画像出力
document.avatar2.src = direction_src[count]; //*5
//次のタイマー呼びだし
setTimeout("imgTimer()",100); //*6
}





//
var moveX = 0;
var moveY = 0;

//？？？？　とりあえずクリックしたら、斜めに動くモーションを作ってるんだけど、動かねーー！
const avatarTimer = () =>{
//？？？？　　　↓のaXを数字に変えたら一応動くから、ここが問題だと思うんだけど、どう直すのが正解なのかよくわからない。
if(moveX < (mX-aX)){
  console.log(mX-aX);

  moveX++;
  moveY++;

  avatar.style.left = `${moveX}px`;
  avatar.style.top = `${moveY}px`;

  aX = mX;
  aY = mY;
setTimeout("avatarTimer()",1);
 }
}

document.getElementById('graphic').onclick = () => {
avatarTimer();
}



/*とりま止めてる
document.getElementById('graphic').onclick = () => {
  //ここにクリックした時の処理を記述
    if (mX > aX+aW && mY < aY-aH) {

        while(moveY < 80){
          moveY += 20;
          avatar.style.top = `${moveY}px`;
          imgTimer();
        }
        avatar.src = direction_src[0];
    }
    else if(mX > aX+aW && mY > aY){
        avatar.src = direction_src[1];
    }
    else if(mX < aX-aW && mY > aY){
        avatar.src = direction_src[2];
    }
    else if(mX < aX-aW && mY < aY-aH){
        avatar.src = direction_src[3];
    }
    else if(mY < aY-aH){
        avatar.src = direction_src[4];
    }
    else if(mX > aX+aW){
        avatar.src = direction_src[5];
    }
    else if(mY > aY){
        avatar.src = direction_src[6];
    }
    else if(mX < aX-aW){
        avatar.src = direction_src[7];
    }

    avatar.style.left = `${mX-18}px`;
    avatar.style.top = `${mY-70}px`;

    aX = mX;
    aY = mY;
  }
  */
