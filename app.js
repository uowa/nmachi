var createError = require('http-errors');
var express = require('express');//expressモジュールを読みこむ
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');//index.jsモジュールを読みこむ

var kousinrireki = require("./routes/kousinrireki");//kousinrirekiモジュールを読みこむ
var QandA = require("./routes/Q-A");//Q-A.jsモジュールを読みこむ
var link = require("./routes/link");//link.jsモジュールを読みこむ
var loginErrorHandling = require("./routes/login_error_handling");//error_handling.jsモジュールを読みこむ
var dominionrule = require("./routes/dominionrule");//dominionrule.jsモジュールを読みこむ
var talk = require("./routes/talk");//talk.jsモジュールを読みこむ
var watch = require("./routes/watch");//watch.jsモジュールを読みこむ




var app = express();//expressモジュールを実体化

// view engine setup
app.set('views', path.join(__dirname, 'views'));//__dirnameはプロジェクト全体へのリンク
app.set('view engine', 'ejs');//viewフォルダのejsの拡張子を省略できるようにする

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);//indexリクエストがあった時に.jsモジュールを使うよう設定する

app.use("/kousinrireki", kousinrireki);//kousinrirekiリクエストがあった時にkousinrireki.jsモジュールを使うよう設定する
app.use("/Q-A", QandA);//
app.use("/link", link);
app.use("/login_error_handling", loginErrorHandling);
app.use("/dominionrule", dominionrule);
app.use("/talk", talk);
app.use("/watch", watch);

// app.get('/', (req, res) => {//httpからのリダイレクトやりたいのにやり方がわからん
//   res.redirect(301, '/talk');
// });



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;