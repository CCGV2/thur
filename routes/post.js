var express = require('express');
var router = express.Router();

var checkLogin = require('../middlewares/check').checkLogin;

const post_controller = require('../controller/postController');


router.get('/:postID', post_controller.index);

router.post('/:postID/save', checkLogin, function(req, res, next) {
	res.send(req.flash());
});

router.post('/:postID/remove', checkLogin, function(req, res, next) {
	res.send(req.flash());
});


module.exports = router;