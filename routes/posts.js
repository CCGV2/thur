var express = require('express');
var router = express.Router();

var checkLogin = require('../middlewares/check').checkLogin;

// GET /posts/userID 用户主界面
router.post('/:userID', checkLogin, function(req, res, next) {
  res.send(req.flash());
});

router.post('/:userID/create', checkLogin, function(req, res, next) {
	res.send(req.flash());
});

router.get('/:postID', checkLogin, function(req, res, next) {
	res.send(req.flash());
});

router.post('/:postID/save', checkLogin, function(req, res, next) {
	res.send(req.flash());
});

router.post('/:postID/remove', checkLogin, function(req, res, next) {
	res.send(req.flash());
});


module.exports = router;