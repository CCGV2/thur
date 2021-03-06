const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
	name: { type: 'string', required: true },
	password: { type: 'string', required: true },
	models: [{ type: mongoose.Schema.Types.ObjectId, ref:'diagram' }]
},{timestamps:true});
userSchema.index({ name: 1 }, { unique: true })

userSchema.query.byName = function(name) {
	return this.where({ name: name });
}
module.exports = mongoose.model('user', userSchema);