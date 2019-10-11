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


exports.makeImg = async function makeImg(diagram){
	console.log("makeImg");
	console.log(diagram);
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await page.addScriptTag({
		path: 'public/release/go-debug.js'
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


		var entityTemplate = GO(go.Node, "Table", nodeStyle(),{
			click:function(e, obj){
				//inspector.inspectObject(obj.data);
			}},
		        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
			GO(go.Panel, "Auto", 
				GO(go.Shape, "Rectangle",
				{ fill: null, strokeWidth: 2, stroke: "black"},
				new go.Binding("figure", "figure")),
				GO(go.TextBlock, textStyle(),{
					margin: 8,
					maxSize: new go.Size(160, NaN),
					wrap: go.TextBlock.WrapFit,
					editable: true
				},
				new go.Binding("text", "文本").makeTwoWay()
			)),
			// four named ports, one on each side:
			makePort("T", go.Spot.Top, go.Spot.TopSide, true, true), 
			makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true), 
			makePort("R", go.Spot.Right, go.Spot.RightSide, true, true), 
			makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, true)
		);
		var processTemplate = GO(go.Node, "Table",{
				click:function(e, obj){
					//inspector.inspectObject(obj.data);
				}
			}, nodeStyle(), GO(go.Panel, "Auto", GO(go.Shape, "Circle", {
				minSize: new go.Size(40, 40),
				fill: null,
				strokeWidth: 2
			}), GO(go.TextBlock, textStyle(), {
				margin: 8,
				maxSize: new go.Size(160, NaN),
				wrap: go.TextBlock.WrapFit,
				editable: true
			},new go.Binding("text", "文本").makeTwoWay())),
			// three named ports, one on each side except the top, all output only:
			makePort("T", go.Spot.Top, go.Spot.Top, true, true),
			makePort("L", go.Spot.Left, go.Spot.Left, true, true), 
			makePort("R", go.Spot.Right, go.Spot.Right, true, true), 
			makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, true));
		var structureTemplate = GO(go.Node, "Table",{click:function(e, obj){
			//	inspector.inspectObject(obj.data);
			}},nodeStyle(), GO(go.Panel, "Auto", 
				GO(go.Shape, {geometryString: "F M150 0 L0 0z M150 100 L0 100z"}, {
				minSize: new go.Size(40, 40),
				fill: null,
				strokeWidth: 2
			}), GO(go.TextBlock, textStyle(),{
				margin: 8,
				maxSize: new go.Size(160, NaN),
				wrap: go.TextBlock.WrapFit,
				editable: true
			}, new go.Binding("text", "文本").makeTwoWay())),
			// three named ports, one on each side except the bottom, all input only:
			makePort("T", go.Spot.Top, go.Spot.Top, true, true),
			makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, true));

		myDiagram.nodeTemplateMap.add('entity', entityTemplate);
		myDiagram.nodeTemplateMap.add('structure', structureTemplate);
		myDiagram.nodeTemplateMap.add('process', processTemplate);

		myDiagram.linkTemplate = GO(go.Link,
			{reshapable: true, resegmentable: true},
			{adjusting: go.Link.Stretch},
			new go.Binding("points", "points").makeTwoWay(),
			GO(go.Shape, {strokeWidth:1.5}),
			GO(go.Shape, {toArrow: "OpenTriangle"})
		);
		myDiagram.model.linkFromPortIdProperty="fromPort";
		myDiagram.model.linkToPortIdProperty="toPort";


		var modelJSON = diagram.content;
		console.log(modelJSON);
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
	await browser.close();
}