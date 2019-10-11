const User = require('../models/user');
const Diagram = require('../models/diagram');
const dfd = require('../tools/dfd');
var path = require('path');
var fs = require('fs');
var publicPath = path.resolve(__dirname, '../public');

function makeImg(element, index, array){
	fs.exists(path.resolve(__dirname, '../public', './img/' + element._id + '.png'), function(exist){
		if (!exist){
			console.log("不存在");
			dfd.makeImg(element);
		}else{
			return true;
		}
	});
}

exports.index = (req, res) => {
	res.render('home');
}

exports.user_detail = (req, res) => {
	var user = req.session.user;
	User.findOne({"_id": user._id}).populate({path: 'models', select:'content title'})
	.exec(function(err, target){
		if (err) {
			console.log(err);
		}
		delete target.password;
		target.models.forEach(makeImg);
		req.session.user = target;
		res.render('user');
	});
}

exports.user_new_diagram = (req, res) => {
	var user = req.session.user;
	var fileName = req.body.filename;
	var fileType = req.body.filetype;
	var file = {
		author : user._id,
		title: fileName,
		type: fileType,
		content: '{"nodeDataArray":[], "linkDataArray":[]}'
	};
	Diagram.create(file, function(err, file) {
		if (err) {
			console.log(err.message);
			return res.redirect('back');
		}
		console.log('创建成功');
		User.findByIdAndUpdate(
			user._id,
			{$push: {models: file._id}, $set: {count: user.count + 1}},
			{new: true},
			function(error, success) {
				if (error) {
					console.log(error);
				} else {

					user.count += 1;
					user.models.push(file._id);
					req.session.user = success;
					req.session.models = success.models;
				}
				user.models.forEach(makeImg);
				return res.redirect(`/home/${user._id}`);
			})
	})
	//return res.redirect(`/home/${user._id}`);
}