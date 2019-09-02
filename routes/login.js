var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/user');
var DiagramModel = require('../models/diagram');
var checkNotLogin = require('../middlewares/check').checkNotLogin;


// GET /login 登录页
router.get('/', checkNotLogin, function(req, res, next) {
	res.render('login');
});

// POST /login 用户登录
router.post('/', checkNotLogin, function(req, res, next) {
	var name = req.fields.name;
	var password = req.fields.password;

	UserModel.findOne().byName(name).exec(function(err, user) {
		if (!user) {
			return res.redirect('back');
		}
		//检查密码
		if (sha1(password) != user.password) {
			return res.redirect('back');
		}
		req.flash('success', '登陆成功');
		// 用户信息写入session
		delete user.password;
		req.session.user = user;
		console.log("user: " + JSON.stringfy('user'));
	});

	// UserModel.getUserByName(name)
	// 	.then((user) => {
	// 		if (!user) {
	// 			req.flash('error', '用户不存在');
	// 			return res.redirect('back');
	// 		}
	// 		// 检查密码
	// 		if (sha1(password) !== user.password) {
	// 			req.flash('error', '用户名或密码错误');
	// 			return res.redirect('back');
	// 		}
	// 		req.flash('success', '登陆成功');
	// 		// 用户信息写入 session
	// 		delete user.password;
	// 		req.session.user = user;
	// 		console.log("user:" + JSON.stringify(user));
	// 		console.log("user.model:" + user.models);
	// 		if (user.count === 0) {
	// 			req.session.models = [];
	// 			return res.redirect(`/home/${user._id}`);
	// 		}
	// 	})
	// 	.then((user) => {
	// 		return ModelModel.getModelByIdArray(user.models)
	// 	})
	// 	.then(function(models){
	// 		console.log("in the then: " + models);
	// 		req.session.models = models;

	// 		// 跳转到主页
	// 		return res.redirect(`/home/${models[0].author}`);
	// 	})
	// 	.catch(next);
});

module.exports = router;