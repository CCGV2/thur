var express = require('express');
var router = express.Router();

// GET /home 主页
router.get('/', function(req, res, next) {
	res.render('home');
});


module.exports = router;