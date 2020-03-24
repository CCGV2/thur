
var GO = go.GraphObject.make;

var logs = [];

var myDiagram = GO(go.Diagram, "myDiagramDiv",{
	initialContentAlignment: go.Spot.Center,
	allowDrop: true,
	commandHandler: new DrawCommandHandler(),
	// must be true to accept drops from the Palette
	"LinkDrawn": showLinkLabel,
	// this DiagramEvent listener is defined below
	"LinkRelinked": showLinkLabel,
	scrollsPageOnFocus: false,
	scrollMargin:500,
	resizingTool: new ResizeMultipleTool(),
	"undoManager.isEnabled": true, // enable undo & redo
});

myDiagram.toolManager.mouseDownTools.add(GO(LinkShiftingTool));
myDiagram.toolManager.mouseMoveTools.insertAt(0, new LinkLabelDraggingTool());
myDiagram.toolManager.textEditingTool.defaultTextEditor = window.TextEditor;

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

function clickLog(e, obj) {
	var hehe = new Date().getTime();
	var content = "" + obj.data.category + " " + obj.data.文本 + " clicked";
	var SpeLog = {
			"content" : content,
			"level" : 'C',
			"timeStamp": hehe,
			"parentLog": hehe
		};
	logs.push(SpeLog);
}

function makePort(name, align, spot, output, input) {
	var horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
	// the port is basically just a transparent rectangle that stretches along the side of the node,
	// and becomes colored when the mouse passes over it
	return GO(go.Shape, {
		fill: "transparent",
		// changed to a color in the mouseEnter event handler
		strokeWidth: 0,
		// no stroke
		width: horizontal ? NaN: 8,
		// if not stretching horizontally, just 8 wide
		height: !horizontal ? NaN: 8,
		// if not stretching vertically, just 8 tall
		alignment: align,
		// align the port on the main Shape
		stretch: (horizontal ? go.GraphObject.Horizontal: go.GraphObject.Vertical),
		portId: name,
		// declare this object to be a "port"
		fromSpot: spot,
		// declare where links may connect at this port
		fromLinkable: output,
		// declare whether the user may draw links from here
		toSpot: spot,
		// declare where links may connect at this port
		toLinkable: input,
		// declare whether the user may draw links to here
		cursor: "pointer",
		// show a different cursor to indicate potential link point
		mouseEnter: function(e, port) { // the PORT argument will be this Shape
		    if (!e.diagram.isReadOnly) port.fill = "rgba(255,0,255,0.5)";
		},
		mouseLeave: function(e, port) {
		    port.fill = "transparent";
		}
	});
}


var entityTemplate = GO(go.Node, "Auto", nodeStyle(),{
	click:clickLog, resizable: true, desiredSize:new go.Size(100, 50)},
	new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
    {
    	fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides,
        fromLinkable: true, toLinkable: true,
        fromLinkableDuplicates: true,toLinkableDuplicates:true,
        locationSpot: go.Spot.Center,
        cursor: "crosshair"
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
            textAlign: "center",
            text: "外部实体"
		},
		new go.Binding("text", "text").makeTwoWay(),

	))
);
var processTemplate = GO(go.Node, "Auto",{
		click: clickLog,resizable: true, desiredSize:new go.Size(70, 70)
	}, nodeStyle(),new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
	{
    	fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides,
        fromLinkable: true, toLinkable: true,
        fromLinkableDuplicates: true,toLinkableDuplicates:true,
        locationSpot: go.Spot.Center,
        cursor: "crosshair"
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
        text: "加工"
	},new go.Binding("text", "text").makeTwoWay())))
	// three named ports, one on each side except the top, all output only:;
// var structureTemplate = GO(go.Node, "Auto",{click:function(e, obj){
// 	//	inspector.inspectObject(obj.data);
// 	}},nodeStyle(), {
//     	fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides,
//         fromLinkable: true, toLinkable: true,
//         locationSpot: go.Spot.Center
//     }, GO(go.Panel, "Vertical", {margin: 5}, 
// 	GO(go.Panel, "Auto", 
// 		GO(go.Shape, "LineH", {
// 			minSize: new go.Size(40, 40),
// 			fill: "black",
// 			strokeWidth: 2
// 		})),
// 	GO(go.Panel, "Auto", 
// 		GO(go.Shape, "Rectangle", {
// 			minSize: new go.Size(40, 40),
// 			file: "whitle",
// 			strokeWidth: 0
// 		}),
// 		GO(go.TextBlock, textStyle(),{
// 			margin: 8,
// 			maxSize: new go.Size(160, NaN),
// 			wrap: go.TextBlock.WrapFit,
// 			editable: true,
// 			fromLinkable:false,
// 			toLinkable:false
// 		}, new go.Binding("text", "文本").makeTwoWay())),
// 	GO(go.Panel, "Auto", 
// 		GO(go.Shape, "LineH", {
// 			minSize: new go.Size(40, 40),
// 			fill: "black",
// 			strokeWidth: 2
// 		})))
// 	);
	  var structureTemplate = GO(go.Node, "Auto",nodeStyle(),{
	  	fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides,
        fromLinkable: true, toLinkable: true,
        fromLinkableDuplicates: true,toLinkableDuplicates:true,
        locationSpot: go.Spot.Center,
        click:clickLog,
        resizable: true, desiredSize: new go.Size(70, 50)
	  },new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
        GO(go.Panel, "Vertical",
          { margin: 0, cursor: "crosshair"},

          
            GO(go.Shape, "MinusLine", { height:3, strokeWidth: 3, stroke: 'black', stretch: go.GraphObject.Fill}),
            

          GO(go.Panel, "Auto",
            GO(go.Shape, "Rectangle", { strokeWidth: 0, fill: 'transparent', stretch: go.GraphObject.Fill, desiredSize: new go.Size(70, 38)},new go.Binding("desiredSize", "size", function(str){var tmp = go.Size.parse(str);return new go.Size(tmp.width, tmp.height - 12)}).makeTwoWay(go.Size.stringify)),
            GO(go.TextBlock, textStyle(),
              { margin: 8 ,
              fromLinkable:false,
              wrap: go.TextBlock.WrapFit,
				editable: true,
			  	toLinkable:false,
			  	cursor: "default", 
                alignment: go.Spot.Center,
        		textAlign: "center",
        		text: "数据存储"
				},
              new go.Binding("text", "text").makeTwoWay())
            ),

            GO(go.Shape, "MinusLine", { height: 3, strokeWidth: 3, stroke: 'black', stretch: go.GraphObject.Fill} )
          
        ) // end outer panel
      ); // end node
	// three named ports, one on each side except the bottom, all input only:

var palette = GO(go.Palette, 'myPaletteDiv', {
	scrollsPageOnFocus: false,
	layout: GO(go.GridLayout, {spacing: new go.Size(10, 30)})
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
	new go.Binding("fromSpot", "fromSpot", go.Spot.parse).makeTwoWay(go.Spot.stringify),
    new go.Binding("toSpot", "toSpot", go.Spot.parse).makeTwoWay(go.Spot.stringify),
	GO(go.Shape, {strokeWidth:3}),
	GO(go.Shape, {toArrow: "OpenTriangle", scale: 1.5}),
	GO(go.Panel, "Auto", 
		{cursor: "move"},
		GO(go.Shape, {
			fill: GO(go.Brush, "Radial", {0: "rgb(240,240,240)", 0.3: "rgb(240, 240, 240)", 1: "rgba(240,240,240,0)"}),
			stroke: null			
		}), 
		GO(go.TextBlock,
		textStyle(), {
			editable: true,
			text: "数据流"
		}, new go.Binding("text", "text").makeTwoWay()),
		new go.Binding("segmentOffset", "segmentOffset", go.Point.parse).makeTwoWay(go.Point.stringify)),
	GO(go.Shape, {fromArrow: "BackwardOpenTriangle"})
);
myDiagram.model = new go.GraphLinksModel(modelContent["nodeDataArray"], modelContent["linkDataArray"]);
myDiagram.model.linkFromPortIdProperty="fromPort";
myDiagram.model.linkToPortIdProperty="toPort";
palette.nodeTemplateMap = myDiagram.nodeTemplateMap;

palette.model.nodeDataArray = [
	{category: "entity", text: "外部实体"},
	{category: "structure", text: "数据存储"},
	{category: "process", text: "加工"}
];
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
	// the codes up there is useless for this case but useful for other cases, so I want to keep them there
	var changes = evt.toString();
	console.log(changes);
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

function printDiagram() {
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
}
 