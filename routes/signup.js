var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signup 注册页
router.get('/', checkNotLogin, function (req, res, next) {
	res.render('signup')
})

// POST /signup 用户注册
router.post('/', checkNotLogin, function(req, res, next) {
	var name = req.fields.name;
	var gender = req.fields.gender;
	var bio = req.fields.bio;
	var avatar = req.files.avatar.path.split(path.seq).pop();
	console.log(avatar);
	var password = req.fields.password;
	var repassword = req.fields.repassword;

	// 校验参数
	try {
		if (!(name.length >= 1 && name.length <= 10)) {
			throw new Error('名字长度请限制为 1-10 个字符');
		}
		if (['m', 'f', 'x'].indexOf(gender) === -1) {
			throw new Error('性别只能是 m、 f 或 x');
		}
		if (!(bio.length >= 1 && bio.length <= 30)) {
			throw new Error('个人简历长度限制为 1-30 个字符');
		}
		if (!req.files.avatar.name) {
			throw new Error('缺少头像');
		}
		if (password.length <= 6) {
			throw new Error('密码过短');
		}
		if (password != repassword) {
			throw new Error('两次密码不一样');
		}
	}
	catch(e) {
		req.flash('error', e.message);
		return res.redirect('/signup');
	}
	password = sha1(password);

	var user = {
		name: name,
		password: password,
		gender: gender,
		bio: bio,
		avatar: path.relative(path.resolve(__dirname, '../public'), avatar)
	};

	UserModel.create(user)
		.then(function(result) {
			// 此user是插入Mongodb之后的值，包含_id
			user = result.ops[0];
			// 删除密码
			delete user.password;
			req.session.user = user;
			// 写入flash
			req.flash('success', '注册成功');
			// 跳转到首页
			res.redirect('/home');
		})
		.catch(function(e) {
			fs.unlink(req.files.avatar.path);
			if (e.message.match('duplicate key')) {
				req.flash('error', '用户名已被占用');
				return res.redirect('/signup');
			}
			next(e);
		})
});

module.exports = router;