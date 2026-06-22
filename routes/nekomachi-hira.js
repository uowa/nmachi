var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  res.render('index', { title: 'ねこまち' });
});

router.post('/post', (req, res, next) => {
  res.render('index', { title: 'ねこまち' });
});

module.exports = router;
