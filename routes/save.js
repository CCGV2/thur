var express = require('express');
var router = express.Router();

var checkLogin = require('../middlewares/check').checkLogin;

const post_controller = require('../controller/postController');

router.post('/', function(req, res, next) {
	console.log('nmsl');
})

router.post('/:postID/save', post_controller.save);

router.post('/:postID/remove', checkLogin, function(req, res, next) {
	res.send(req.flash());
});


module.exports = router;