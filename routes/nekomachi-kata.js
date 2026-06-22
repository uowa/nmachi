var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  res.render('index', { title: 'ネコマチ' });
});

router.post('/post', (req, res, next) => {
  res.render('index', { title: 'ネコマチ' });
});

module.exports = router;
