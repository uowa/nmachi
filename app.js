var createError = require('http-errors');
var express = require('express');//expressモジュールを読みこむ
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var https = require('https');

var indexRouter = require('./routes/index');//index.jsモジュールを読みこむ
var pagesRouter = require("./routes/pages");//そのほかのページのモジュール用
var polygonRouter = require('./routes/polygon'); //polygonモジュール
var { roomRouter, objectRouter, atlasReady } = require('./routes/roomAtlas'); //部屋・オブジェクトアトラス生成

var app = express();//expressモジュールを実体化


// Google TTS プロキシ
app.get('/tts', (req, res) => {
  const text = req.query.q;
  const slow = req.query.slow === '1' ? '1' : '0';
  if (!text) return res.status(400).end();
  const url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&slow=' + slow + '&q=' + encodeURIComponent(text);
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (gttsRes) => {
    res.setHeader('Content-Type', 'audio/mpeg');
    gttsRes.pipe(res);
  }).on('error', () => res.status(500).end());
});

//polygon生成用
app.use('/polygon', polygonRouter);
//部屋背景アトラス（レイアウトJSON）
app.use('/roomAtlas', roomRouter);
//オブジェクトアトラス（レイアウトJSON）
app.use('/objectAtlas', objectRouter);
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
module.exports.atlasReady = atlasReady;




