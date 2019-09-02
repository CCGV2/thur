var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

var diagramModel = require('../models/diagram');

var userModel = require('../models/user');

const home_controller = require('../controller/homeController');

// GET /home 主页
router.get('/', home_controller.index);

router.get('/:userId', home_controller.user_detail);

router.post('/:userId', home_controller.user_new_diagram);

module.exports = router;