const User = require('../models/user');
const Diagram = require('../models/diagram');
var path = require('path');
var fs = require('fs');
var publicPath = path.resolve(__dirname, '../public');

exports.index = (req, res) => {
	res.render('home');
}

exports.user_detail = (req, res) => {
	res.render('user');
}

exports.user_new_diagram = (req, res) => {
	var user = req.session.user;
	var fileName = req.fields.filename;
	var fileType = req.fields.filetype;
	console.log(fileName);
	console.log(path.resolve(__dirname, '../public', './img/blank.jpg'));
	console.log(fileType);
	var file = {
		author : user._id,
		title: fileName,
		type: fileType,
		content: ""
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
					return res.redirect(`/home/${user._id}`);
				} else {

					user.count += 1;
					user.models.push(file._id);
					req.session.user = success;
					req.session.models = success.models;
					console.log('req.session.user:');
					console.log(req.session.user);
					console.log('req.session.models:');
					console.log(req.session.models);
					fs.copyFile(path.resolve(__dirname, '../public', './img/blank.jpg'), 
						path.resolve(__dirname, '../public', './img/' + file._id + '.jpg'), 
						function(err) {
							console.log(err);
						});
					console.log("success");
					return res.redirect(`/home/${user._id}`);
				}
			})
	})
	//return res.redirect(`/home/${user._id}`);
}