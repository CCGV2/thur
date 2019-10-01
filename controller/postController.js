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
	var id = req.params.postID;
	console.log("start saving");
	console.log(req.body.data);
	var content = req.body.data;
	console.log(content);
	Diagram.findOne({_id:id}).exec(function(err, diagram) {
		console.log("233");
		if (err) {
			console.log(err);
			req.flash('error', 'failed');
			return res.redirect('back');
		}
		console.log(diagram.author)
		console.log(req.session.user._id)
		if (req.session.user._id != diagram.author) {
			req.flash('error', '模型与作者不匹配');
			return res.redirect('back');
		}
		diagram.content = content;
		console.log("finded");
		Diagram.findByIdAndUpdate(id, {
			$set:{content:content}
		}).exec(function(err) {
			if (err) {
				console.log(err);
			}
			console.log('success save');
			req.flash('success', '保存成功');
			return res.redirect('back');
		})
	})
}