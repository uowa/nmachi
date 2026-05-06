const fs = require('fs');
const path = require('path');
var express = require('express');
var router = express.Router();

router.get('/*', (req, res) => {
  // サブページなら req.params[0] に値が入る。なければトップページ
  let page = req.params[0];
  if (!page || page === '') {
    // トップページの場合はbaseUrlから取得
    page = req.baseUrl.replace('/', '');
  }
  const viewPath = path.join(__dirname, '../views', `${page}.ejs`);
  if (!fs.existsSync(viewPath)) {
    return res.status(404).render('404');
  }
  res.render(page);
});

module.exports = router;