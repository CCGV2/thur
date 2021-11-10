
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const logSchema = new Schema({
	eventID: {type: Number},
	eventType: {type: "string"},
	eventTime: {type: Number},
    eventValue: {type: "string"},
    objectType: {type: "string"},
    objectKey: {type: "string"},
	author: { type: mongoose.Types.ObjectId, ref:'user' },
	model: { type: mongoose.Types.ObjectId, ref:'diagram' }
},{timestamps:true});

module.exports = mongoose.model('log', logSchema);
