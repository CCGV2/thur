var config = require('config-lite');
var Mongolass = require('mongolass');
var mongolass = new Mongolass();
mongolass.connect(config.mongodb);

exports.User = mongolass.model('User', {
	name: { type: 'string', required: true },
	password: { type: 'string', required: true },
	avatar: { type: 'string', required: true },
	gender: { type: 'string', enum: ['m', 'f', 'x'], default: 'x' },
	models: [{ Mongolass.Types.ObjectId }]
})
exports.User.index({ name: 1 }, { unique: true }).exec()// 根据用户名找到用户，用户名全局唯一

exports.Model = mongolass.model('Model', {
	author: { type: Mongolass.Types.ObjectId },
	title: { type: 'stirng', required: true},
	type: { type: 'string', enum: ['dfd', 'ucd', 'uml'], default: 'dfd'},
	content: { type: 'string', required: true }
})
exports.Model.index({ author: 1, _id: -1 }).exec()

exports.Logs = mongolass.logs('Logs', {
	author: { type: Mongolass.Types.ObjectId },
	model: { type: Mongolass.Types.ObjectId },
	content: { type: 'string' }
})
exports.Logs.index({ author: 1, _id: -1 }).exec()

var moment = require('moment');
var objectIdToTimestamp = require('objectid-to-timestamp');

// 根据 id 生成创建时间 created_at
mongolass.plugin('addCreatedAt', {
	afterFind: function (results) {
		results.forEach(function (item) {
			item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
		});
		return results;
	},
	afterFindOne: function (results) {
		if (results) {
			results.created_at = moment(objectIdToTimestamp(results._id)).format('YYYY-MM-DD HH:mm');
		}
		return results;
	}
});