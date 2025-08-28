var createError = require('http-errors');
var express = require('express');//expressモジュールを読みこむ
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');//index.jsモジュールを読みこむ
var pagesRouter = require("./routes/pages");//そのほかのページのモジュール用
var polygonRouter = require('./routes/polygon'); //polygonモジュール

var app = express();//expressモジュールを実体化


//polygon生成用
app.use('/polygon', polygonRouter);
app.use(express.static(path.join(__dirname, 'public')));


// view engine setup
app.set('views', path.join(__dirname, 'views'));//__dirnameはプロジェクト全体へのリンク
app.set('view engine', 'ejs');//viewフォルダのejsの拡張子を省略できるようにする

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);//indexリクエストがあった時に.jsモジュールを使うよう設定する

app.use("/kousinrireki", pagesRouter);
app.use("/Q-A", pagesRouter);
app.use("/link", pagesRouter);
app.use("/login_error_handling", pagesRouter);
app.use("/dominionrule", pagesRouter);
app.use("/uowamemo01", pagesRouter);
app.use("/uowamemo02", pagesRouter);
app.use("/uowamemo03", pagesRouter);
app.use("/uowamemo04", pagesRouter);
app.use("/uowamemo05", pagesRouter);
app.use("/uowamemo06", pagesRouter);
app.use("/uowamemo07", pagesRouter);
app.use("/uowamemo08", pagesRouter);
app.use("/uowamemo09", pagesRouter);
app.use("/uowamemo10", pagesRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).render('404');
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




