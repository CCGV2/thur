const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const diagramSchema = new Schema({
	author: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
	title: { type: 'string', required: true},
	type: { type: 'string', enum: ['dfd', 'ucd', 'uml'], default: 'dfd'},
	content: { type: 'string' }
})

diagramSchema.index({ author: 1, _id: -1 });

module.exports = mongoose.model('diagram', diagramSchema);