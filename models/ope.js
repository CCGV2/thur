
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const logSchema = new Schema({
	opeID: {type: Number},
	opeType: {type: "string"},
	startTime: {type: Number},
    endTime:  {type: Number},
	author: { type: mongoose.Types.ObjectId, ref:'user' },
	model: { type: mongoose.Types.ObjectId, ref:'diagram' }
},{timestamps:true});

module.exports = mongoose.model('log', logSchema);
