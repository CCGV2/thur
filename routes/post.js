var express = require('express');
var router = express.Router();

var checkLogin = require('../middlewares/check').checkLogin;

const post_controller = require('../controller/postController');

router.get('/:postID', post_controller.index);

router.post('/:postID/save', post_controller.save);

router.post('/:postID/upload', post_controller.upload);

router.get('/:postID/remove', checkLogin, post_controller.remove);

router.post('/:postID/changeTitle', post_controller.changeTitle);


module.exports = router;