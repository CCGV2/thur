var express = require('express');
var router = express.Router();

var checkLogin = require('../middlewares/check').checkLogin;

// GET /logout 登出
router.get('/', checkLogin, function(req, res, next) {
	// 清空 session 中用户信息
	if (req.session){
		req.session.user = null;
	}
	req.flash('success', '注销成功');
	// 登出成功后跳转到主页
	req.session.models = null;
	res.redirect('/home');
});

module.exports = router;