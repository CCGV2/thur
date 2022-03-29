var express = require('express');
var router = express.Router();

var checkLogin = require('../middlewares/check').checkLogin;

const post_controller = require('../controller/postController');

router.get('/:postID', (req, res) => {
	// check whether this diagram is belong to this user.
	var id = req.params.postID;
	console.log("post index");
	console.log(id);
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
		return res.render(diagram.type, {content:diagram.content, diagramTitle:diagram.title});
	})
});

router.post('/:postID/save', post_controller.save);

router.post('/:postID/upload', post_controller.upload);

router.get('/:postID/remove', checkLogin, post_controller.remove);

router.post('/:postID/changeTitle', post_controller.changeTitle);


module.exports = router;