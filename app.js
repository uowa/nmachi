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
var roomsApiRouter = require('./routes/rooms');
var mugenRouter = require('./routes/mugen');
var directionRouter = require('./routes/direction');

require('./db/init');

var app = express();//expressモジュールを実体化

// ボディパーサーを全APIルーターより先に登録
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// spec.md 閲覧
app.get('/spec', (req, res) => {
  const fs = require('fs');
  const content = fs.readFileSync(path.join(__dirname, 'spec.md'), 'utf-8');
  const escaped = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>spec.md</title><link rel="stylesheet" href="/stylesheets/style.css"><style>
body{margin:0;background:#060e16;color:#e8e8e8;font-size:18px;line-height:1.6;}
pre{padding:20px 0;white-space:pre-wrap;word-break:break-word;margin:0;}
</style></head><body><pre>${escaped}</pre></body></html>`);
});

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

app.use('/api/rooms', roomsApiRouter);

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
app.use('/api/mugen', mugenRouter);
app.use('/api/direction', directionRouter);
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);//indexリクエストがあった時に.jsモジュールを使うよう設定する
app.get('/index-test', (req, res) => res.render('index-test', { title: 'NecojectMachi [デザインテスト]' }));
app.get('/index-test-jkg', (req, res) => res.render('index-test-jkg', { title: 'NecojectMachi [JKゴシックM]' }));
app.get('/index-test-chikara-d', (req, res) => res.render('index-test-chikara-d', { title: 'NecojectMachi [チカラヅヨク]' }));
app.get('/index-test-chikara-y', (req, res) => res.render('index-test-chikara-y', { title: 'NecojectMachi [チカラヨワク]' }));

app.use("/kousinrireki", pagesRouter);
app.use("/Q-A", pagesRouter);
app.use("/link", pagesRouter);
app.use("/login_error_handling", pagesRouter);
app.use("/dominionrule", pagesRouter);
app.use("/button-test", pagesRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).render('404', { baseUrl: req.protocol + '://' + req.get('host') });
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




