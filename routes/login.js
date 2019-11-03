var sha1 = require('sha1');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var moment = require('moment');

var UserModel = require('../models/user');
var DiagramModel = require('../models/diagram');
var checkNotLogin = require('../middlewares/check').checkNotLogin;
const dfd = require('../tools/dfd');


// GET /login 登录页
router.get('/', checkNotLogin, function(req, res, next) {
	res.render('login');
});

// POST /login 用户登录
router.post('/', checkNotLogin, function(req, res, next) {
	var name = req.body.name;
	var password = req.body.password;
	console.log("start login");
	console.log(name + password);
	UserModel.findOne().byName(name).populate({path: 'models', select:'content title updatedAt'}).exec(function(err, user) {
		console.log("after find");
		console.log(user);
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('back');
		}
		//检查密码
		if (sha1(password) != user.password) {
			req.flash('error', '用户名或密码错误');
			return res.redirect('back');
		}
		console.log("登陆成功");
		console.log(user);
		req.flash('success', '登陆成功');
		// 用户信息写入session
		delete user.password;
		for (var i = 0; i < user.models.length; i++){
			fs.exists(path.resolve(__dirname, '../public', './img/' + user.models[i]._id + '.png'), function(exist){
				if (!exist){
					fs.writeFile(path.resolve(__dirname, '../public', './img/' + user.models[i]._id + '.png'), dfd.makeImg(target.models[i]), function(err){
						console.log(err);
					})
				}
			});
			user.models[i].updatedAt = moment(user.models[i].updatedAt).format('LLLL');

		}
		req.session.user = user;
		return res.redirect(`/home/${user._id}`);
	});

});

module.exports = router;