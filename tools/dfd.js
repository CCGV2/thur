const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const parseDataUrl = (dataUrl) => {
	const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
	if (matches.length !== 3) {
		throw new Error('Could not parse data URL.');
	}
	return { mime: matches[1], buffer: Buffer.from(matches[2], 'base64') };
};


exports.makeImg = async function makeImg(diagram, callback){
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.addScriptTag({
		path: 'public/release/go-debug.js'
	});
	await page.addScriptTag({
		path: 'public/release/LinkLabelDraggingTool.js'
	});
	await page.addScriptTag({
		path: 'public/release/LinkShiftingTool.js'
	});
	

	page.setContent('<div id="myDiagramDiv" style="border: solid 1px black; width:1600px; height:1200px"></div>');

	const imageData = await page.evaluate((diagram) =>{
		var GO = go.GraphObject.make;
		

		var myDiagram = GO(go.Diagram, "myDiagramDiv",{
			initialContentAlignment: go.Spot.Center,
			allowDrop: true,
			// must be true to accept drops from the Palette
			"LinkDrawn": showLinkLabel,
			// this DiagramEvent listener is defined below
			"LinkRelinked": showLinkLabel,
			scrollsPageOnFocus: false,
			"undoManager.isEnabled": true, // enable undo & redo
		});

		myDiagram.toolManager.mouseDownTools.add(GO(LinkShiftingTool));
		myDiagram.toolManager.mouseMoveTools.insertAt(0, new LinkLabelDraggingTool());
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


		
		var entityTemplate = GO(go.Node, "Auto", nodeStyle(),{resizable: true, desiredSize:new go.Size(100, 50)},
			new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
			{
				fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides,
				fromLinkableDuplicates: true,toLinkableDuplicates:true,
				locationSpot: go.Spot.Center
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
			makePort("B", go.Spot.Bottom, true, true)
		);
		var processTemplate = GO(go.Node, "Auto",{resizable: true, desiredSize:new go.Size(70, 70)
			}, nodeStyle(),new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
			{
				fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides,
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
			makePort("B", go.Spot.Bottom, true, true));
			var structureTemplate = GO(go.Node, "Auto",nodeStyle(),{
				fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides,
				// fromLinkable: true, toLinkable: true,
				fromLinkableDuplicates: true,toLinkableDuplicates:true,
				locationSpot: go.Spot.Center,
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
			makePort("B", go.Spot.Bottom, true, true)
			); // end node
			// three named ports, one on each side except the bottom, all input only:

		myDiagram.nodeTemplateMap.add('entity', entityTemplate);
		myDiagram.nodeTemplateMap.add('structure', structureTemplate);
		myDiagram.nodeTemplateMap.add('process', processTemplate);
		myDiagram.linkTemplate = GO(go.Link,
			{reshapable: true, resegmentable: true},
			{adjusting: go.Link.Stretch},
			new go.Binding("points", "points").makeTwoWay(),
			new go.Binding("fromSpot", "fromSpot", go.Spot.parse).makeTwoWay(go.Spot.stringify),
		    new go.Binding("toSpot", "toSpot", go.Spot.parse).makeTwoWay(go.Spot.stringify),
			GO(go.Shape, {strokeWidth:1.5}),
			GO(go.Shape, {toArrow: "OpenTriangle"}),
			GO(go.Panel, "Auto", 
				{cursor: "move"},
				GO(go.Shape, {
					fill: GO(go.Brush, "Radial", {0: "rgb(240,240,240)", 0.3: "rgb(240, 240, 240)", 1: "rgba(240,240,240,0)"}),
					stroke: null			
				}), 
				GO(go.TextBlock, "数据流", 
				textStyle(), {
					editable: true
				}, new go.Binding("text", "文本").makeTwoWay()),
				new go.Binding("segmentOffset", "segmentOffset", go.Point.parse).makeTwoWay(go.Point.stringify))
		);
		myDiagram.model.linkFromPortIdProperty="fromPort";
		myDiagram.model.linkToPortIdProperty="toPort";

		var modelJSON = diagram.content;
		if (modelJSON == '') {
			modelJSON = '{"nodeDataArray":[], "linkDataArray":[]}';
		}
		modelJSON = modelJSON.replace(/\n/g, '\\n');
		var modelContent = JSON.parse(modelJSON);


		myDiagram.model = new go.GraphLinksModel(modelContent["nodeDataArray"], modelContent["linkDataArray"]);
		return myDiagram.makeImageData();
	}, diagram);
	const {buffer} = parseDataUrl(imageData);
	var targetPath = path.resolve(__dirname, '../public/img/' + diagram._id + '.png');
  	fs.writeFileSync(targetPath, buffer, 'base64');
  	if (typeof callback === 'function'){
  		callback();
  	}
	await browser.close();
}