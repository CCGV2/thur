const User = require('../models/user');
const Diagram = require('../models/diagram');
exports.index = (req, res, next) => {
	var id = req.params.postID;
	console.log("post index");
	Diagram.findOne({_id:id}).exec(function(err, diagram) {
		if (err) {
			console.log('未找到该模型');
			return res.redirect('back');
		}
		if (req.session.user._id != diagram.author) {
			console.log('模型与作者不匹配');
			return res.redirect('back');
		}
		req.session.content = diagram.content;
		req.session.page = diagram.type;
		console.log(diagram.type);
		console.log(diagram.type + diagram.content);
		return res.render(diagram.type);
	})
};

exports.save = (req, res) => {
	console.log("save");
	// var id = req.params.postID;
	// console.log("start saving");
	// console.log(req.body.data);
	// var content = req.body.data;
	// Diagram.findOne({_id:id}).exec(function(err, diagram) {
	// 	if (err) {
	// 		console.log('未找到该模型');
	// 		req.flash('error', '未找到该模型');
	// 		return res.redirect('back');
	// 	}
	// 	if (req.session.user_id != diagram.author) {
	// 		req.flash('error', '模型与作者不匹配');
	// 		return res.redirect('back');
	// 	}
	// 	diagram.content = content;

	// 	return res.redirect('back');
	// })
	return res.redirect('back');
}