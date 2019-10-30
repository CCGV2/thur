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
	User.findOne({"_id": user._id}).populate({path: 'models', select:'content title updatedAt'})
	.exec(function(err, target){
		if (err) {
			console.log(err);
		}
		console.log(target);
		delete target.password;
		target.models.forEach(makeImg);
		for (var i = 0; i < target.models.length; i++) {
			var date = new Date(target.models[i].updatedAt);
			target.models[i].updatedAt = date.toISOString().
										  replace(/T/, ' ').      // replace T with a space
										  replace(/\..+/, '');
			console.log(date);
			
		}
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
		fs.exists(path.resolve(__dirname, '../public', './img/' + file._id + '.png'), function(exist){
			if (!exist){
				console.log("不存在");
				console.log("nmsl");
				dfd.makeImg(file, function(){
					User.findByIdAndUpdate(
					user._id,
					{$push: {models: file._id}},
					{new: true}
					).populate({path: 'models', select:'content title updatedAt'}).exec(
					function(error, success) {
						if (error) {
							console.log(error);
						} else {

							user.models.push(file._id);
							req.session.user = success;
							req.session.models = success.models;
						}
						return res.redirect('back');
					})
				});
			}
		});
		
	})
	//return res.redirect(`/home/${user._id}`);
}