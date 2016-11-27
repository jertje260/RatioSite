var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('public/html/index.html');
});

router.get('/upload', function(req, res, next){
  res.render('upload', { title: 'Upload File' });
})
module.exports = router;
