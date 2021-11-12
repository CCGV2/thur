
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const opeSchema = new Schema({
	opeID: {type: Number},
	opeType: {type: "string"},
	startTime: {type: Number},
    endTime:  {type: Number},
	model: { type: mongoose.Types.ObjectId, ref:'diagram' }
},{timestamps:true});

module.exports = mongoose.model('ope', opeSchema);
