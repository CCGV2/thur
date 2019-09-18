const User = require('../models/user');
const Diagram = require('../models/diagram');
exports.index = (req, res) => {
	var id = req.params.postID;
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
		console.log(diagram.type);
		return res.render(diagram.type);
	})
};