var mX;
var mY;

window.onload=function(){
  //マウス移動時のイベントをBODYタグに登録する
  document.body.addEventListener("mousemove", function(e){



    //座標を取得する
    mX = e.pageX;  //X座標
    mY = e.pageY;  //Y座標

    //あとで消す:座標表示
    document.getElementById("txtX").value = mX;
    document.getElementById("txtY").value = mY;



    //クリック時に発生するイベント
    onclick = function() {
      // ここに画面をクリックしたら発生させる処理を記述する
      var avatarX = mX;
      var avatarY = mY;
      var avatar = document.getElementById("avatar");

      document.getElementById("avatar").style.left = avatarX;
      document.getElementById("avatar").style.top = avatarY;
     };
  });
}
