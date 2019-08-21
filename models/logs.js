var Logs = require('../lib/mongo').Logs;

module.exports = {
	// 创建操作记录
	create: function(logs){
		return Logs.create(logs).exec();
	}
};