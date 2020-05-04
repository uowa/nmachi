var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) =>{
    var data={
      title:'PrejectNecoMachiテストサバー',
    };
  res.render('index', data);
});       

router.post('/', (req, res, next)=>{
  // var pid;

  // var msg = pid +":？？？"+req.body["msg"];
  // req.session.message=pid+msg;
  var data={
    title:'PrejectNecoMachiテストサバー',
    // content:msg
  };
res.render('index', data);
});

module.exports = router;
