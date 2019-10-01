var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/user');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

var fs = require('fs');

// GET /signup 注册页
router.get('/', checkNotLogin, function (req, res, next) {
	res.render('signup')
})

// POST /signup 用户注册
router.post('/', checkNotLogin, function(req, res, next) {
	console.log(req.query);
	var name = req.body.name;
	var password = req.body.password;
	var repassword = req.body.repassword;

	// 校验参数
	try {
		if (!(name.length >= 1 && name.length <= 10)) {
			throw new Error('名字长度请限制为 1-10 个字符');
		}
		if (password.length < 6) {
			throw new Error('密码过短');
		}
		if (password != repassword) {
			throw new Error('两次密码不一样');
		}
	}
	catch(e) {
		console.log(e);
		req.flash('error', e.message);
		return res.redirect('/signup');
	}
	password = sha1(password);

	var user = {
		name: name,
		password: password,
		count: 0,
		models: []
	};

	UserModel.create(user, function(err, user) {
		if (err) {
			fs.unlink(req.files.avatar.path, function(err) {
				return res.redirect('/signup');
			});
			if (e.message.match('duplicate key')) {
				req.flash('error', '用户名已被占用');
				return res.redirect('/signup');
			}
		}
		delete user.password;
		req.session.user = user;
		req.session.models = user.models;
		req.flash('success', '注册成功');
		res.redirect('/home');
	})
	// UserModel.create(user)
	// 	.then(function(result) {
	// 		// 此user是插入Mongodb之后的值，包含_id
	// 		user = result.ops[0];
	// 		// 删除密码
	// 		delete user.password;
	// 		req.session.user = user;
	// 		req.session.models = user.models;
	// 		// 写入flash
	// 		req.flash('success', '注册成功');
	// 		// 跳转到首页
	// 		res.redirect('/home');
	// 	})
	// 	.catch(function(e) {
	// 		fs.unlink(req.files.avatar.path);
	// 		if (e.message.match('duplicate key')) {
	// 			req.flash('error', '用户名已被占用');
	// 			return res.redirect('/signup');
	// 		}
	// 		next(e);
	// 	})
});

module.exports = router;