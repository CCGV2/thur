const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const logSchema = new Schema({
	logID: {type: Number},
	belongOpe: {type: Number},
	objectKey: {type: 'string'},
	objectType: {type: 'string'},
	objectText: {type: 'string'},
	logTime: {type: Number},
	propertyOld: {type: 'string'},
	propertyNew: {type: 'string'},
	eventID: {type:'string'},
	model: { type: mongoose.Types.ObjectId, ref:'diagram' }
},{timestamps:true});

module.exports = mongoose.model('log', logSchema);
