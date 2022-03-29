const User = require('../models/user');
const Diagram = require('../models/diagram');
const dfd = require('../tools/dfd');
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var publicPath = path.resolve(__dirname, '../public');

function makeImg(element, index, array){
	// make image on server for thumbnail.
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
	// change the format from database to be used on front
	var user = req.session.user;
	console.log(user);
	var target = User.findOne({"_id": user._id}).populate({path: 'models', select:'content title updatedAt'}).then(function(doc){
		console.log("user detail");
		console.log(doc);
		delete doc.password;
		doc.models.forEach(makeImg);
		moment.locale('zh-cn');
		user = doc;

		for (var i = 0; i < doc.models.length; i++) {
			var date = new Date(doc.models[i].updatedAt);
			var str = moment(doc.models[i].updatedAt).format('LLLL').toString()
			doc.models[i].updatedAt = moment(doc.models[i].updatedAt).format('LLLL').toString();
			user.models[i].updatedAtStr = str;
		}
		return user;
	}).then(function(doc){
		return res.render('user', {user:user});
	});
}

exports.user_new_diagram = (req, res) => {
	// create a new blank picture for users and add it into database.
	var user = req.session.user;
	var fileName = req.body.filename;
	var fileType = req.body.filetype;
	var file = {
		author : user._id,
		title: fileName,
		type: fileType,
		content: '{"nodeDataArray":[], "linkDataArray":[]}',
		opecnt:0,
		logcnt:0,
		eventcnt:0
	};
	Diagram.create(file, function(err, file) {
		if (err) {
			console.log(err.message);
			return res.redirect('back');
		}
		fs.exists(path.resolve(__dirname, '../public', './img/' + file._id + '.png'), function(exist){
			if (!exist){
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
					})
				});
			}
		});
		return res.json(200,{msg:"success",url:`/post/${file._id}`});	
	})
}