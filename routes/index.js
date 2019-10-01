module.exports = function (app) {
	app.use('/', function(req, res, next) {
		next();
	})
	app.get('/', function (req, res) {
		res.redirect('/home');
	});
	app.use('/home', require('./home'));
	app.use('/signup', require('./signup'));
	app.use('/login', require('./login'));
	app.use('/logout', require('./logout'));
	app.use('/post', require('./post'));
	app.use('/feedback', require('./feedback'));
	app.use(function (req, res) {
		if (!res.headerSent) {
			res.render('404');
		}
	});
};