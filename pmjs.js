//日付:たまたまソースを見っけたのでとりあえず入れといた、あとでver4の日付と合わせたい
var day = new Date().toLocaleString();
document.getElementById("box").innerHTML = day;




//マウスの座標
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
  });
}




//？？？？？？？クリックしたら画像を切り替えて、場所を移動するアバターって
//処理をやりたいんやけど、なんで上手くいかんのかわからんぞ！！！
//最初の一回しか画像が切り替わってくれん！！
var direction_src = new Array("right.png","left.png");

//クリック時に発生するイベント
document.getElementById("graphic").onclick = () => {
// ここに画面をクリックしたら発生させる処理を記述する
var avatar = document.getElementById("avatar");

if(mX > avatar.style.left){
  document.getElementById("avatar").src = direction_src[0];
}else{
  document.getElementById("avatar").src = direction_src[1];
}

  var avatarX = mX;
  var avatarY = mY;


  avatar.style.position = "absolute";
  avatar.style.left = avatarX+ "px";
  avatar.style.top = avatarY+ "px";
}
