var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');
var diagramModel = require('../models/diagram');

var moment = require('moment');

var UserModel = require('../models/user');
var dfd = require('../tools/dfd');

const home_controller = require('../controller/homeController');

var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /home 主页
router.get('/', home_controller.index);
router.post('/', checkNotLogin, function(req, res, next) {
	var name = req.body.name;
	var password = req.body.password;
	UserModel.findOne().byName(name).populate({path: 'models', select:'content title updatedAt'}).exec(function(err, user) {
		console.log("after find");
		console.log(user);
		if (!user) {
			return res.json({success:true,'error': '用户不存在'});
			// return res.render('home',{success: true, 'error': '用户不存在'});
		}
		//检查密码
		if (sha1(password) != user.password) {
			return res.json({success:true,'error': '用户名或密码错误'});
			// return res.render('home', {success: true, 'error': '用户名或密码错误'});
		}
		console.log("登陆成功");
		console.log(user);
		req.flash('success', '登陆成功');
		// 用户信息写入session
		console.log(user.models);
		console.log(typeof user.models);
		delete user.password;
		const tmparray = [];
		for (let i = 0; i < user.models.length; i++){
			user.models[i].updatedAt = moment(user.models[i].updatedAt).format('LLLL');
			tmparray.push(user.models[i]);
		}
		tmparray.forEach(model=>{
			console.log(typeof model);
			console.log(model);
			fs.exists(path.resolve(__dirname, '../public', './img/' + model._id + '.png'), function(exist){
				if (!exist){
					console.log(model);
					dfd.makeImg(model);
				}
			});
		});
		
		req.session.user = user;
		return res.json({success: true, 'url':`/home/${user._id}`});
	});

});

router.get('/:userId', home_controller.user_detail);

router.post('/create', home_controller.user_new_diagram);

module.exports = router;