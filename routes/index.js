var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    var data={
      title: 'PrejectNecoMachiテストサバー',
    };
  res.render('index', data);
});       

router.post('/post', (req, res, next) => {
  var data={
    title: 'PrejectNecoMachiテストサバー',
  };
res.render('index', data);
});

module.exports = router;