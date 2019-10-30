const User = require('../models/user');
const Diagram = require('../models/diagram');
const Log = require('../models/log');
const dfd = require('../tools/dfd');
exports.index = (req, res) => {
	var id = req.params.postID;
	console.log("post index");
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
		return res.render(diagram.type, {content:diagram.content});
	})
};

exports.save = (req, res) => {
	console.log("start to save");
	var id = req.params.postID;
	var content = req.body.data;
	console.log(content);
	Diagram.findOne({_id:id}).exec(function(err, diagram) {
		console.log("233");
		if (err) {
			console.log(err);
			req.flash('error', 'failed');
			return res.redirect('back');
		}
		console.log(diagram.author)
		console.log(req.session.user._id)
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
			console.log('success save');
			req.flash('success', '保存成功');
			req.session.content = diagram.content;
			return res.json({success:true});
		})
	})
}

exports.remove = (req, res) => {
	var id = req.params.postID;
	console.log("remove");
	console.log(id);
	console.log(req.session.user.models);
	var index = -1;
	for (var i = 0; i < req.session.user.models.length; i++){
		if (req.session.user.models[i]._id === id){
			index = i;
			break;
		}
	}
	if (index > -1) {
		console.log(req.session.user.models);
		req.session.user.models.splice(index, 1);
		console.log(req.session.user.models);
		User.updateOne({"_id":req.session.user._id}, {$pull:{models:id}}, function(err){
			if (err) {
				console.log(err);
			}
			return res.redirect(`/home/${req.session.user._id}`);
		});	
	}else{
		return res.redirect(`/home/${req.session.user._id}`);
	}
	console.log(req.session.user.models);
	
}

exports.upload = (req, res) => {
	console.log("upload");
	var id = req.params.postID;
	var content = req.body.data;
	var logDiagram = id;
	var logAuthor = req.session.user._id;
	var doc = ({
		author: logAuthor,
		model: logDiagram,
		content: content
	})
	console.log(content);
	Log.create(doc, function(err, docs){
		if (err) return res.json({err: err});
		else return res.json({success: true});
	})

}