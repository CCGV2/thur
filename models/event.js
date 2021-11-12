
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
	eventID: {type: Number},
	eventType: {type: "string"},
	eventTime: {type: Number},
    eventValue: {type: "string"},
    objectType: {type: "string"},
    objectKey: {type: "string"},
	model: { type: mongoose.Types.ObjectId, ref:'diagram' }
},{timestamps:true});

module.exports = mongoose.model('event', eventSchema);
