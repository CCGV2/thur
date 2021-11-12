const User = require('../models/user');
const Diagram = require('../models/diagram');
const Event = require('../models/event');
const Ope = require('../models/ope');
const Log = require('../models/log');
const dfd = require('../tools/dfd');

let AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
exports.index = (req, res) => {
	// check whether this diagram is belong to this user.
	var id = req.params.postID;
	Diagram.findOne({_id:id}).exec(function(err, diagram) {
		if (err) {
			console.log('未找到该模型');
			return res.redirect('back');
		}
		if (req.session.user._id != diagram.author) {
			console.log('模型与作者不匹配');
			return res.redirect('back');
		}
		req.session.content = diagram.content;
		req.session.page = diagram.type;
		return res.render(diagram.type, {content:diagram.content, diagramTitle:diagram.title});
	})
};

exports.changeTitle = (req, res) => {
	// change the title of specific diagram.
	var newTitle = req.body.data;
	var id = req.params.postID;
	Diagram.findOne({_id:id}).exec(function(err, diagram) {
		if (err) {
			req.flash('error', 'failed');
			return res.redirect('back');
		}
		if (req.session.user._id != diagram.author) {
			req.flash('error', '模型与作者不匹配');
			return res.send("error");
		}

		Diagram.findByIdAndUpdate(id, {
			$set:{title:newTitle}
		}).exec(function(err) {
			if (err) {
				console.log(err);
			}
			return res.json({success:true});
		})
	})
}

exports.save = (req, res) => {
	// save diagram to database
	var id = req.params.postID;
	var content = req.body.data;
	Diagram.findOne({_id:id}).exec(function(err, diagram) {
		if (err) {
			req.flash('error', 'failed');
			return res.redirect('back');
		}
		if (req.session.user._id != diagram.author) {
			req.flash('error', '模型与作者不匹配');
			return res.send("error");
		}
		diagram.content = content;

		Diagram.findByIdAndUpdate(id, {
			$set:{content:content}
		}).exec(function(err) {
			if (err) {
				console.log(err);
			}
			dfd.makeImg(diagram, function(){});
			req.flash('success', '保存成功');
			req.session.content = diagram.content;
			return res.json({success:true});
		})
	})
}

exports.remove = (req, res) => {
	// remove a diagram. but didn't really delete it, just delete the connection between them.
	// we can still access the diagram.
	var id = req.params.postID;
	var index = -1;
	for (var i = 0; i < req.session.user.models.length; i++){
		if (req.session.user.models[i]._id === id){
			index = i;
			break;
		}
	}
	if (index > -1) {
		req.session.user.models.splice(index, 1);
		User.updateOne({"_id":req.session.user._id}, {$pull:{models:id}}, function(err){
			if (err) {
				console.log(err);
			}
			return res.redirect(`/home/${req.session.user._id}`);
		});	
	}else{
		return res.redirect(`/home/${req.session.user._id}`);
	}
}

exports.upload = (req, res) => {
	// get the log and save.
	var id = req.params.postID;
	var content = req.body.data;
	var logDiagram = id;
	var logAuthor = req.session.user._id;
	
	var contentArray = JSON.parse(content);

	var opes = contentArray.ope;
	var logs = contentArray.log;
	var events = contentArray.event;
	var modelData = Diagram.findByIdAndUpdate(id,{$inc:{opecnt:opes.length, logcnt:logs.length, eventcnt:events.length}},function(err, doc){
		if (err){
			req.flash('error', 'failed');
			return res.redirect('back');
		}
		var putope = new Promise((resolve, reject) => {
			var tmp = 0;
			if (opes.length == 0){
				resolve();
			}
			opes.forEach((ope)=>{
				ope.opeID += doc.opecnt;
				ope.model = id;
				tmp += 1;
				if (tmp == opes.length){
					Ope.insertMany(opes, function(error, doc){
						if (error){
							reject(error);
							return ;
						}
						resolve(doc);
					})
				}
			})
		})
		var putlog = new Promise((resolve, reject) => {
			var tmp = 0;
			if (logs.length == 0){
				resolve();
			}
			logs.forEach((log)=>{
				log.logID += doc.logcnt;
				log.belongOpe += doc.opecnt;
				log.model = id;
				tmp += 1;
				if (log.eventID){
					log.eventID += doc.eventcnt;
				}
				if (tmp == logs.length){
					Log.insertMany(logs, function(error, doc){
						if (error){
							reject(error);
							return ;
						}
						resolve(doc);
					})
				}
			})
		})
		var putevent = new Promise((resolve, reject) => {
			var tmp = 0;
			if (events.length == 0){
				resolve();
			}
			events.forEach((event)=>{
				event.eventID += doc.eventcnt;
				event.model = id;
				tmp += 1;
				if (tmp == events.length){
					Event.insertMany(events, function(error, doc){
						if (error){
							reject(error);
							return ;
						}
						resolve(doc);
					})
				}
			})
		})
		Promise.all([putope, putlog, putevent])
		.then(doc => {
			return res.json({success: true});
		})
		.catch(err => {
			return res.json({err: err})
		})
	});
}