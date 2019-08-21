var express = require('express');
var router = express.Router();
var checkLogin = require('../middlewares/check').checkLogin;

// GET /feedback 主页
router.get('/', checkLogin, function(req, res, next) {
	res.send(req.flash());
});

// POST /feedback 反馈内容

router.post('/', checkLogin, function(req, res, next) {
	res.send(req.flash());
});


module.exports = router;