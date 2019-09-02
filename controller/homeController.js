const User = require('../models/user');
const Diagram = require('../models/diagram');

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
	console.log(fileType);
	var file = {
		author : user._id,
		title: fileName,
		type: fileType,
		content: ""
	};
	Diagram.create(file, function(err, file) {
		if (err) {
			return handleError(err);
		}
		User.findByIdAndUpdate(
			user._id,
			{$push: {models: file._id}, $set: {count: user.count + 1}},
			function(error, success) {
				if (error) {
					console.log(error);
				} else {
					console.log(success);
				}
			})
	})
	res.redirect('back');
}