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
//前のクリック位置との比較で動かしてるけど、あとあと問題になるような気がしなくもない
var avatarX = 0;
const direction_src = new Array('right.png', 'left.png');
document.getElementById('graphic').onclick = function () {
  //ここにクリックした時の処理を記述
    if (mX > avatarX) {
        avatar.src = direction_src[0];
    } else {
        avatar.src = direction_src[1];
    }

    avatar.style.position= 'absolute';
    avatar.style.left = `${mX}px`;
    avatar.style.top = `${mY}px`;

    avatarX = mX;
  }
