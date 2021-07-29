const User = require('../models/user');
const Diagram = require('../models/diagram');
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
	console.log("changeTitle")
	Diagram.findOne({_id:id}).exec(function(err, diagram) {
		console.log("233");
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
			console.log('success changeTitle');
			return res.json({success:true});
		})
	})
}

exports.save = (req, res) => {
	console.log("start to save");
	// save diagram to database
	var id = req.params.postID;
	var content = req.body.data;
	console.log(content);
	Diagram.findOne({_id:id}).exec(function(err, diagram) {
		console.log("233");
		if (err) {
			req.flash('error', 'failed');
			return res.redirect('back');
		}
		// console.log(diagram.author)
		// console.log(req.session.user._id)
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
			// console.log('success save');
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
	// get the log and save.
	console.log("upload");
	var id = req.params.postID;
	var content = req.body.data;
	var logDiagram = id;
	var logAuthor = req.session.user._id;
	var contentArray = JSON.parse(content);
	//console.log(contentArray);
	var cnt = 0;
	var err;
	function upLoadToDb(file){
		return new Promise((resolve, reject) => {
			var doc = ({
				author:logAuthor,
				model:logDiagram,
				content:JSON.stringify(file)
			});
			Log.create(doc, function(err, docs){
				if (err) {
					err = err;
				}
			})
			resolve(file);
		})
		
	}
	let promiseArray = contentArray.map(upLoadToDb);
	Promise.all(promiseArray).then(result => {
		if (err) return res.json({err: err});
		else return res.json({success: true});
	})

}