var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  res.render('index', { title: 'にゃおにゃお街' });
});

router.post('/post', (req, res, next) => {
  res.render('index', { title: 'にゃおにゃお街' });
});

module.exports = router;
