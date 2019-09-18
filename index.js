var path = require('path');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var config = require('./config/default');
var routes = require('./routes');
var pkg = require('./package');
var winston = require('winston');
var expressWinston = require('express-winston');
var app = express();
var mongoose = require('mongoose');
var mongoDB = config.mongodb;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));

// 设置模板目录
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎为 ejs
app.set('view engine', 'ejs');

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));
// session 中间件

app.use(session({
    name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
    secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
    cookie: {
        maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
    },
    store: new MongoStore({// 将 session 存储到 mongodb
        url: config.mongodb// mongodb 地址
    })
}));
// flash 中间价，用来显示通知
app.use(flash());

// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
	uploadDir: path.join(__dirname, 'public/img'),// 上传文件目录
	keepExtensions: true// 保留后缀
}));

// 设置模板全局常量
app.locals.platform = {
	title: pkg.name,
	description: pkg.description
};

// 添加模板必需的三个变量
app.use(function (req, res, next) {
	//console.log('middleware');
	res.locals.user = req.session.user;
	//console.log(res.locals.user);
	res.locals.success = req.flash('success').toString();
	res.locals.error = req.flash('error').toString();
	res.locals.models = req.session.models;
	res.locals.content = req.session.content;
	// console.log("req.session.user: ")
	// console.log(req.session.user)
	// console.log("req.session.models");
	// console.log(res.locals.models);
	next();
});

// 路由
routes(app);


// 监听端口，启动程序
app.listen(config.port, function () {
	console.log(`${pkg.name} listening on port ${config.port}`);
});