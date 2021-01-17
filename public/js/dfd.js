
var GO = go.GraphObject.make;

var logs = [];
// initialize the diagram
var myDiagram = GO(go.Diagram, "myDiagramDiv",{
	initialContentAlignment: go.Spot.Center,
	allowDrop: true,
	commandHandler: new DrawCommandHandler(),
	// must be true to accept drops from the Palette
	"LinkDrawn": showLinkLabel,
	// this DiagramEvent listener is defined below
	"LinkRelinked": showLinkLabel,
	scrollsPageOnFocus: false,
	scrollMargin:500, // margin outside content
	resizingTool: new ResizeMultipleTool(), 
	"undoManager.isEnabled": true, // enable undo & redo
	"panningTool.isEnabled": false
});
myDiagram.toolManager.mouseDownTools.add(GO(LinkShiftingTool));
myDiagram.toolManager.mouseDownTools.add(myDiagram.toolManager.replaceTool("ContextMenu", null));
myDiagram.toolManager.mouseMoveTools.insertAt(0, new LinkLabelDraggingTool());
myDiagram.toolManager.textEditingTool.defaultTextEditor = window.TextEditor;

// use listener to listen whether diagram is changed.
myDiagram.addDiagramListener("Modified", function(e){
	var button = document.getElementById("save-button");
	var info = document.getElementById("save-info");
	if (button) button.disabled = !myDiagram.isModified;
	if (myDiagram.isModified) {
		if (info.innerHTML=="更改已保存") {
			info.innerHTML = "更改未保存";
			info.style.color = "red";
		}
	} else {
		if (info.innerHTML=="更改未保存"){
			info.innerHTML = "更改已保存";
			info.style.color = "green";
		}
	}
})
$(window).bind('beforeunload', function(){
    if( myDiagram.isModified){
        return true;
    }
});

function showLinkLabel(e) {
	var label = e.subject.findObject("LABEL");
	if (label !== null) label.visible = (e.subject.fromNode.data.category === "Conditional");
}

function nodeStyle() {
	return [
	new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), {
		locationSpot: go.Spot.Center
	}];
}
function textStyle() {
	return {
		font: "bold 11pt Helvetica, Arial, sans-serif",
		stroke: "black"
	}
}
// Not useful anymore.
function clickLog(e, obj) {
	var hehe = new Date().getTime();
	var content = "" + obj.data.category + " " + obj.data.text + " clicked";
	var SpeLog = {
			"content" : content,
			"level" : 'C',
			"timeStamp": hehe,
			"parentLog": hehe
		};
	logs.push(SpeLog);
}
// make port for nodes
function makePort(name, spot, output, input) {
    // the port is basically just a small transparent square
	return GO(go.Shape, "Circle",
	{
		fill: null,  // not seen, by default; set to a translucent gray by showSmallPorts, defined below
		stroke: null,
		desiredSize: new go.Size(8, 8),
		alignment: spot,  // align the port on the main Shape
		alignmentFocus: spot,  // just inside the Shape
		portId: name,  // declare this object to be a "port"
		fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
		fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
		cursor: "pointer"  // show a different cursor to indicate potential link point
	});
}

var entityTemplate = GO(go.Node, "Auto", nodeStyle(),{
	click:clickLog, resizable: true, desiredSize:new go.Size(100, 50)},
	new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
    {
    	fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides,
        // fromLinkable: true, toLinkable: true,
        fromLinkableDuplicates: true,toLinkableDuplicates:true,
        locationSpot: go.Spot.Center,
        // cursor: "crosshair"
    },
	GO(go.Panel, "Auto", 
		GO(go.Shape, "Rectangle",
		{ fill: "transparent", strokeWidth: 2, stroke: "black"},
		new go.Binding("figure", "figure")),
		GO(go.TextBlock, textStyle(),{
			margin: 8,
			wrap: go.TextBlock.WrapFit,
			editable: true,
			fromLinkable:false,
			toLinkable:false,
            cursor: "default", 
            alignment: go.Spot.Center,
            textAlign: "left",
            text: "外部实体",
            name: "LABEL"
		},
		new go.Binding("text", "text").makeTwoWay(),
		new go.Binding("textAlign", "textAlign").makeTwoWay(),
		new go.Binding("font", "font").makeTwoWay()

	)),
	makePort("T", go.Spot.Top, true, true),
	makePort("L", go.Spot.Left, true, true),
	makePort("R", go.Spot.Right, true, true),
	makePort("B", go.Spot.Bottom, true, true),
	{ // handle mouse enter/leave events to show/hide the ports
		mouseEnter: function(e, node) { showSmallPorts(node, true); },
		mouseLeave: function(e, node) { showSmallPorts(node, false); },
		contextMenu:     // define a context menu for each node
          GO("ContextMenu",  // that has one button
            GO("ContextMenuButton",
              GO(go.TextBlock, "复制"),
              { click: function(){
              	myDiagram.commandHandler.copySelection();
              } }),
            GO("ContextMenuButton",
              GO(go.TextBlock, "更改节点为数据存储"),
              { click: function(){
              	setCategory('structure');
              } }),
            GO("ContextMenuButton",
              GO(go.TextBlock, "更改节点为加工"),
              { click: function(){
              	setCategory('process');
              } }),
            GO("ContextMenuButton",
              GO(go.TextBlock, "删除所选内容"),
              { click: function(){
              	myDiagram.commandHandler.deleteSelection();
              } })
            // more ContextMenuButtons would go here
          )  // end Adornment
	}
);
function showSmallPorts(node, show) {
	node.ports.each(function(port) {
		if (port.portId !== "") {  // don't change the default port, which is the big shape
			port.fill = show ? "rgba(0,0,0,.3)" : null;
		}
	});
}	
var processTemplate = GO(go.Node, "Auto",{
		click: clickLog,resizable: true, desiredSize:new go.Size(70, 70)
	}, nodeStyle(),new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
	{
    	fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides,
        // fromLinkable: true, toLinkable: true,
        fromLinkableDuplicates: true,toLinkableDuplicates:true,
        locationSpot: go.Spot.Center
    }, GO(go.Panel, "Auto", GO(go.Shape, "Circle", {
		minSize: new go.Size(40, 40),
		fill: "transparent",
		strokeWidth: 2
	}), GO(go.TextBlock, textStyle(), {
		margin: 8,
		cursor: "default",
		wrap: go.TextBlock.WrapFit,
		editable: true,
		fromLinkable:false,
		toLinkable:false, alignment: go.Spot.Center,
        textAlign: "center",
        text: "加工",
        name: "LABEL"
	},new go.Binding("text", "text").makeTwoWay(),
	new go.Binding("textAlign", "textAlign").makeTwoWay(),
	new go.Binding("font", "font").makeTwoWay())),
	makePort("T", go.Spot.Top, true, true),
	makePort("L", go.Spot.Left, true, true),
	makePort("R", go.Spot.Right, true, true),
	makePort("B", go.Spot.Bottom, true, true),
	{ // handle mouse enter/leave events to show/hide the ports
		mouseEnter: function(e, node) { showSmallPorts(node, true); },
		mouseLeave: function(e, node) { showSmallPorts(node, false); },
		contextMenu:     // define a context menu for each node
          GO("ContextMenu",  // that has one button
            GO("ContextMenuButton",
              GO(go.TextBlock, "复制"),
              { click: function(){
              	myDiagram.commandHandler.copySelection();
              } }),
            GO("ContextMenuButton",
              GO(go.TextBlock, "更改节点为数据存储"),
              { click: function(){
              	setCategory('structure');
              } }),
            GO("ContextMenuButton",
              GO(go.TextBlock, "更改节点为外部实体"),
              { click: function(){
              	setCategory('entity');
              } }),
            GO("ContextMenuButton",
              GO(go.TextBlock, "删除所选内容"),
              { click: function(){
              	myDiagram.commandHandler.deleteSelection();
              } })
            // more ContextMenuButtons would go here
          )  // end Adornment
	});

	  var structureTemplate = GO(go.Node, "Auto",nodeStyle(),{
	  	fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides,
        // fromLinkable: true, toLinkable: true,
        fromLinkableDuplicates: true,toLinkableDuplicates:true,
        locationSpot: go.Spot.Center,
        click:clickLog,
        resizable: true, desiredSize: new go.Size(70, 50)
	  },new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
        GO(go.Panel, "Vertical",
          { margin: 0},

          
            GO(go.Shape, "MinusLine", { height:3, strokeWidth: 3, stroke: 'black', stretch: go.GraphObject.Fill}),
            

          GO(go.Panel, "Auto",
            GO(go.Shape, "Rectangle", { strokeWidth: 0, fill: 'transparent', stretch: go.GraphObject.Fill, desiredSize: new go.Size(70, 38)},new go.Binding("desiredSize", "size", function(str){var tmp = go.Size.parse(str);return new go.Size(tmp.width, tmp.height - 12)}).makeTwoWay(go.Size.stringify)),
            GO(go.TextBlock, textStyle(),
              { margin: 8 ,
              fromLinkable:false,
				editable: true,
			  	toLinkable:false,
			  	cursor: "default", 
				wrap: go.TextBlock.WrapFit,
                alignment: go.Spot.Center,
        		textAlign: "center",
        		text: "数据存储", name:"LABEL",
        		width: 62},
        		new go.Binding("width", "size", function(str){
        			var tmp = go.Size.parse(str);
        			return tmp.width - 8;
        		}).makeTwoWay(go.Size.stringify),
				
              	new go.Binding("text", "text").makeTwoWay(),
				new go.Binding("textAlign", "textAlign").makeTwoWay(),
				new go.Binding("font", "font").makeTwoWay())
            ),

            GO(go.Shape, "MinusLine", { height: 3, strokeWidth: 3, stroke: 'black', stretch: go.GraphObject.Fill} )
          
        ), // end outer panel

	makePort("T", go.Spot.Top, true, true),
	makePort("L", go.Spot.Left, true, true),
	makePort("R", go.Spot.Right, true, true),
	makePort("B", go.Spot.Bottom, true, true),
	{ // handle mouse enter/leave events to show/hide the ports
		mouseEnter: function(e, node) { showSmallPorts(node, true); },
		mouseLeave: function(e, node) { showSmallPorts(node, false); },
		contextMenu:     // define a context menu for each node
          GO("ContextMenu",  // that has one button
            GO("ContextMenuButton",
              GO(go.TextBlock, "复制"),
              { click: function(){
              	myDiagram.commandHandler.copySelection();
              } }),
            GO("ContextMenuButton",
              GO(go.TextBlock, "更改节点为外部实体"),
              { click: function(){
              	setCategory('entity');
              } }),
            GO("ContextMenuButton",
              GO(go.TextBlock, "更改节点为加工"),
              { click: function(){
              	setCategory('process');
              } }),
            GO("ContextMenuButton",
              GO(go.TextBlock, "删除所选内容"),
              { click: function(){
              	myDiagram.commandHandler.deleteSelection();
              } })
            // more ContextMenuButtons would go here
          )  // end Adornment
	}
    ); // end node
	// three named ports, one on each side except the bottom, all input only:

myDiagram.contextMenu =
    GO("ContextMenu",
      GO("ContextMenuButton",
      	GO(go.TextBlock, "全选"), 
      	{click: function(e, obj) {e.diagram.commandHandler.selectAll();}},
      	new go.Binding("visible", "", function(o) {
                  return o.diagram.commandHandler.canSelectAll();
                }).ofObject()),
      GO("ContextMenuButton",
        GO(go.TextBlock, "撤销"),
        { click: function(e, obj) { e.diagram.commandHandler.undo(); } },
        new go.Binding("visible", "", function(o) {
                                          return o.diagram.commandHandler.canUndo();
                                        }).ofObject()),
      GO("ContextMenuButton",
        GO(go.TextBlock, "恢复"),
        { click: function(e, obj) { e.diagram.commandHandler.redo(); } },
        new go.Binding("visible", "", function(o) {
                                          return o.diagram.commandHandler.canRedo();
                                        }).ofObject()),
      GO("ContextMenuButton",
        GO(go.TextBlock, "添加外部实体"),
        { click: function(e, obj) {
          e.diagram.commit(function(d) {
            var data = {category: "entity", text:"外部实体"};
            d.model.addNodeData(data);
            part = d.findPartForData(data);  // must be same data reference, not a new {}
            // set location to saved mouseDownPoint in ContextMenuTool
            part.location = d.toolManager.contextMenuTool.mouseDownPoint;
          }, 'new node');
        } }),
      GO("ContextMenuButton",
        GO(go.TextBlock, "添加数据存储"),
        { click: function(e, obj) {
          e.diagram.commit(function(d) {
            var data = {category: "structure", text:"数据存储"};
            d.model.addNodeData(data);
            part = d.findPartForData(data);  // must be same data reference, not a new {}
            // set location to saved mouseDownPoint in ContextMenuTool
            part.location = d.toolManager.contextMenuTool.mouseDownPoint;
          }, 'new node');
        } }),
      GO("ContextMenuButton",
        GO(go.TextBlock, "添加加工"),
        { click: function(e, obj) {
          e.diagram.commit(function(d) {
            var data = {category: "process", text:"加工"};
            d.model.addNodeData(data);
            part = d.findPartForData(data);  // must be same data reference, not a new {}
            // set location to saved mouseDownPoint in ContextMenuTool
            part.location = d.toolManager.contextMenuTool.mouseDownPoint;
          }, 'new node');
        } }),
      GO("ContextMenuButton", 
      	GO(go.TextBlock, "复制"),
      	{click: function(e, obj){e.diagram.commandHandler.copySelection()}},
      	new go.Binding("visible", "", function(o){
      		return o.diagram.commandHandler.canCopySelection();
      	}).ofObject()),
      GO("ContextMenuButton", 
      	GO(go.TextBlock, "粘贴"),
      	{click: function(e, obj){e.diagram.commandHandler.pasteSelection()}},
      	new go.Binding("visible", "", function(o){
      		return o.diagram.commandHandler.canPasteSelection();
      	}).ofObject())
    );

// the menue on left.
var palette = GO(go.Palette, 'myPaletteDiv', {
	scrollsPageOnFocus: false,
	layout: GO(go.GridLayout, {spacing: new go.Size(10, 30)})
});


// enable or disable a particular button
function enable(name, ok) {
	var button = document.getElementById(name);
	if (button) button.disabled = !ok;
}
// enable or disable all command buttons
function enableAll() {
	var cmdhnd = myDiagram.commandHandler;
	enable("SelectAll", cmdhnd.canSelectAll());
	enable("Cut", cmdhnd.canCutSelection());
	enable("Copy", cmdhnd.canCopySelection());
	enable("Paste", cmdhnd.canPasteSelection());
	enable("Delete", cmdhnd.canDeleteSelection());
	enable("Group", cmdhnd.canGroupSelection());
	enable("Ungroup", cmdhnd.canUngroupSelection());
	enable("Undo", cmdhnd.canUndo());
	enable("Redo", cmdhnd.canRedo());
}
// notice whenever the selection may have changed
myDiagram.addDiagramListener("ChangedSelection", function(e) {
	enableAll();
});
// notice when the Paste command may need to be reenabled
myDiagram.addDiagramListener("ClipboardChanged", function(e) {
	enableAll();
});
// notice whenever a transaction or undo/redo has occurred
myDiagram.addModelChangedListener(function(e) {
	if (e.isTransactionFinished) enableAll();
});

myDiagram.nodeTemplateMap.add('entity', entityTemplate);
myDiagram.nodeTemplateMap.add('structure', structureTemplate);
myDiagram.nodeTemplateMap.add('process', processTemplate);
if (modelJSON == '') {
	modelJSON = '{"nodeDataArray":[], "linkDataArray":[]}';
}
modelJSON = modelJSON.replace(/\n/g, '\\n');
modelContent = JSON.parse(modelJSON);

myDiagram.linkTemplate = GO(go.Link,
	{reshapable: true, resegmentable: true},
	{adjusting: go.Link.Stretch},
	new go.Binding("points", "points").makeTwoWay(),
	new go.Binding("adjusting", "adjusting").makeTwoWay(),
	GO(go.Shape, {strokeWidth:3}),
	GO(go.Shape, {toArrow: "OpenTriangle", scale: 1.5}, new go.Binding("toArrow", "toArrow").makeTwoWay()),
	GO(go.Panel, "Auto", 
		{cursor: "move"},
		GO(go.Shape, {
			fill: GO(go.Brush, "Radial", {0: "rgb(240,240,240)", 0.3: "rgb(240, 240, 240)", 1: "rgba(240,240,240,0)"}),
			stroke: null
		}), 
		GO(go.TextBlock,"数据流",
		textStyle(), {
			editable: true
		}, new go.Binding("text", "text").makeTwoWay(),
		new go.Binding("textAlign", "textAlign").makeTwoWay(),
		new go.Binding("font", "font").makeTwoWay()),
		new go.Binding("segmentOffset", "segmentOffset", go.Point.parse).makeTwoWay(go.Point.stringify)),
	GO(go.Shape, {fromArrow: ""}, new go.Binding("fromArrow", "fromArrow").makeTwoWay())
);

myDiagram.toolManager.linkingTool.archetypeLinkData={"text":"数据流"};

myDiagram.model = new go.GraphLinksModel(modelContent["nodeDataArray"], modelContent["linkDataArray"]);

palette.nodeTemplateMap = myDiagram.nodeTemplateMap;

palette.model.nodeDataArray = [
	{category: "entity", text: "外部实体"},
	{category: "structure", text: "数据存储"},
	{category: "process", text: "加工"}
];
// change node text to left align
function leftAlign(){
	myDiagram.commit(function(d) {
    d.selection.each(function(node) {
      var shape;
      if (node instanceof go.Link)
        shape = node.elt(2).elt(1);
      else 
        shape = node.findObject("LABEL");//1004
      // If there was a GraphObject in the node named SHAPE, then set its fill to red:
      if (shape !== null) {
        shape.textAlign = "left";
      }
    });
  }, "ChangeTextAlign");
}
// change node text to right align
function rightAlign(){
	myDiagram.commit(function(d) {
    d.selection.each(function(node) {
      var shape;
      if (node instanceof go.Link)
        shape = node.elt(2).elt(1);
      else 
        shape = node.findObject("LABEL");//1004
      // If there was a GraphObject in the node named SHAPE, then set its fill to red:
      if (shape !== null) {
        shape.textAlign = "right";
      }
    });
  }, "ChangeTextAlign");
}
function centerAlign(){
	myDiagram.commit(function(d) {
    d.selection.each(function(node) {
      var shape;
      if (node instanceof go.Link)
        shape = node.elt(2).elt(1);
      else 
        shape = node.findObject("LABEL");//1004
      // If there was a GraphObject in the node named SHAPE, then set its fill to red:
      if (shape !== null) {
        shape.textAlign = "center";
      }
    });
  }, "ChangeTextAlign");
}

function boldText(){
	myDiagram.commit(function(d) {
		d.selection.each(function(node) {
      var shape;
      if (node instanceof go.Link)
        shape = node.elt(2).elt(1);
      else 
        shape = node.findObject("LABEL");//1004
			if (shape !== null) {
				
				var fontStr = shape.font;

				if (fontStr.search('bold') !== -1) {
					// console.log('nmsl')
					fontStr = fontStr.replace('bold ', '');
				} else {
					if (fontStr.search('italic') !== -1) {
						fontStr = fontStr.replace('italic', 'italic bold');
					} else {
						if (fontStr[0] == ' ')
							fontStr = 'bold' + fontStr;
						else
							fontStr = 'bold ' + fontStr;
					}
				}
				shape.font = fontStr;
				console.log(shape.font);
			}
		})
	}, "ChangeTextBold");
}
function italicText(){
	myDiagram.commit(function(d) {
		d.selection.each(function(node) {
			var shape;
      if (node instanceof go.Link)
        shape = node.elt(2).elt(1);
      else 
        shape = node.findObject("LABEL");//1004
			if (shape !== null) {
				
				var fontStr = shape.font;

				if (fontStr.search('italic') !== -1) {
					// console.log('nmsl')
					fontStr = fontStr.replace('italic ', '');
				} else {
					fontStr = 'italic ' + fontStr;
				}
				shape.font = fontStr;
				console.log(shape.font);
			}
		})
	}, "ChangeTextItalic");
}

function setStart(str){
	myDiagram.commit(function(d) {

		d.selection.each(function(node) {
			d.model.set(node.data, "fromArrow", str);
		})
	}, "ChangeFromArrow");
}

function setEnd(str) {
	myDiagram.commit(function(d) {

		d.selection.each(function(node) {
			d.model.set(node.data, "toArrow", str);
		})
	}, "ChangeToArrow");
}

function setCategory(str) {
	myDiagram.commit(function(d) {
		d.selection.each(function(node) {
			if (node instanceof go.Node){
				d.model.set(node.data, "category", str);
			}
		})
	}, "ChangeCategory");
}

function changeAdjust(str) {
	myDiagram.commit(function(d) {
		d.selection.each(function(node) {
			if (node instanceof go.Link) {
				console.log(node.data.category);
				d.model.set(node.data, "category", str);
			}
		})
	}, "ChangeCategoryLine")
}


var startTimeStamp = new Date().getTime();
var parentLog;
myDiagram.model.addChangedListener(function(evt) {
	// ignore unimportant Transaction events
	
	// if (evt.change === go.ChangedEvent.Transaction) {
	// 	if (evt.propertyName === "CommittingTransaction" || evt.modelChange === "SourceChanged")
	// 		return;
	// 	//var txn = evt.object;

	// 	var changes = evt.toString();
	// 	console.log(changes);
	// 	//console.log(txn.changes);
	// 	// txn.changes.each(function(c) {
	// 	// 	console.log(c.change);
	// 	// 	if (c.change === go.ChangedEvent.Property)
	// 	// 		console.log(new Date().getTime() + " " + evt.propertyName + "  " + evt.oldValue + "  " + evt.newValue);
	// 	// })
	// }
	// the codes above is useless for this case but useful for other cases, so I want to keep them there

  var changes = evt.toString();
	if (evt.object){
    console.log(evt.object);
    if (evt.object.category){
      changes += " category: " + evt.object.category + " key: " + evt.object.key + " text: " + evt.object.text;
    } else if (evt.object.from) {
      changes += " from: " + evt.object.from + " to: " + evt.object.to + " points: " + " text: " + (evt.object.text ? evt.object.text:"数据流");
    }
	}
	if (changes[0] === '*') {
		startTimeStamp = new Date().getTime();
		var SpeLog = {
			"content" : changes,
			"level" : 'A',
			"timeStamp": startTimeStamp,
			"parentLog": startTimeStamp
		};
		logs.push(SpeLog);
	} else {
		var SpeLog = {
			"content": changes,
			"level": 'B',
			"timeStamp": new Date().getTime(),
			"parentLog": startTimeStamp
		}
		logs.push(SpeLog);
	}
})
zoomSlider = new ZoomSlider(myDiagram, {
    alignment: go.Spot.BottomLeft, alignmentFocus: go.Spot.BottomLeft,
    orientation: 'horizontal'
});

setInterval(save, 10000);
setInterval(upload, 10000);
function saveButton() {
	if (!myDiagram.isModified){
		return ;
	}
	var dataJSON = myDiagram.model.toJson();
	dataJSON = dataJSON.replace(/\r\n/g, '');
	dataJSON = dataJSON.replace(/\n/g, '');
	dataJSON = dataJSON.replace(/\r/g, '');
  var t = typeof dataJSON;
  var base_url = window.location.pathname;
    
	$.ajax({
		url: base_url + "/save",
		data: {'data': dataJSON},
		type: "POST",
		dataType: "JSON",
		contentType: "application/x-www-form-urlencoded",
		timeout: 2000,
		success:function(response){
			
			myDiagram.isModified = false;
			window.onbeforeunload = null;
		}
	}).fail  (function(jqXHR, textStatus, errorThrown) { alert("服务器连接超时。请检查网络，若网络无问题请联系管理员。")   ; })
}
function save() {
	if (!myDiagram.isModified){
		return ;
	}
	var dataJSON = myDiagram.model.toJson();
	dataJSON = dataJSON.replace(/\r\n/g, '');
	dataJSON = dataJSON.replace(/\n/g, '');
	dataJSON = dataJSON.replace(/\r/g, '');
    // dataJSON = dataJSON.replace(/[\'\\\/\b\f\n\r\t]/g, '');
    // dataJSON = dataJSON.replace(/[\"]/g, '\"');
    var t = typeof dataJSON;
    var base_url = window.location.pathname;
    
	$.ajax({
		url: base_url + "/save",
		data: {'data': dataJSON},
		type: "POST",
		dataType: "JSON",
		contentType: "application/x-www-form-urlencoded",
		timeout: 2000,
		success:function(response){
			
			myDiagram.isModified = false;
			window.onbeforeunload = null;
		}
	})
}

function upload(){
	if (logs.length === 0){
		return ;
	}
	var logJSON = JSON.stringify(logs);
	
    var base_url = window.location.pathname;
	$.ajax({
		url: base_url + "/upload",
		data: {'data': logJSON},
		type: "POST",
		dataType: "JSON",
		contentType: "application/x-www-form-urlencoded",
		timeout: 2000,
		success: function(response){
			logJSON = [];
			logs = [];
		}
	})
}

function download(dataurl, filename) {
  var a = document.createElement("a");
  a.href = dataurl;
  a.setAttribute("download", filename);
  a.click();
}

function printDiagram(str) {
	if (str == 'pdf') {
		var svgWindow = window.open();
		if (!svgWindow) return;  // failure to open a new Window
		var printSize = new go.Size(700, 960);
		var bnds = myDiagram.documentBounds;
		var x = bnds.x;
		var y = bnds.y;
		while (y < bnds.bottom) {
			while (x < bnds.right) {
				var svg = myDiagram.makeSVG({ scale: 1.0, position: new go.Point(x, y), size: printSize });
				svgWindow.document.body.appendChild(svg);
				x += printSize.width;
			}
			x = bnds.x;
			y += printSize.height;
		}
		setTimeout(function() { svgWindow.print(); }, 1);
	} else if (str == 'png') {
		var svgWindow = window.open();
		if (!svgWindow) return;  // failure to open a new Window
		var svg = myDiagram.makeImage({scale : 1.0})
    // svg.name = "model.png";

		svgWindow.document.body.appendChild(svg);
    download(svg.src, "model.png");
    // var url = svg;
	} else if (str == 'jpg') {
		var svgWindow = window.open();
		if (!svgWindow) return;  // failure to open a new Window
		var svg = myDiagram.makeImage({scale : 1.0, background:"white", type: "image/jpeg"})
		svgWindow.document.body.appendChild(svg);
    download(svg.src, "model.jpg");
	}
}
 