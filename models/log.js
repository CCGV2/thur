const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const logSchema = new Schema({
	author: { type: Mongolass.Types.ObjectId },
	model: { type: Mongolass.Types.ObjectId },
	content: { type: 'string' }
});

module.exports = mongoose.model('log', logSchema);
