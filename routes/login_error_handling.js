var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) =>{
    var data={
      title: 'PrejectNecoMachiテストサバー',
    };
  res.render('login_error_handling', data);
});

module.exports = router;