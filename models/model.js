var Model = require('../lib/mongo').Model;

module.exports = {
	// 创建模型
	create: function(model){
		return Model.create(model).exec();
	}
};