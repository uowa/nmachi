var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Necomachi' });
});

router.post('/post', (req, res, next) => {
  res.render('index', { title: 'Necomachi' });
});

module.exports = router;
