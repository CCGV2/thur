"use strict";
/*
*  Copyright (C) 1998-2017 by Northwoods Software Corporation. All Rights Reserved.
*/

// HTML + JavaScript text editor menu, made with HTMLInfo
// This is a re-implementation of the default text editor
// This file exposes one instance of HTMLInfo, window.TextEditor
// See also TextEditor.html
(function(window) {
  var textarea = document.createElement('textarea');
  textarea.id = "myTextArea";

  textarea.addEventListener('input', function(e) {
    var tool = TextEditor.tool;
    if (tool.textBlock === null) return;
    tool.diagram.startTransaction();
    var loc = tool.textBlock.getDocumentPoint(go.Spot.Center)
    var pos = tool.diagram.position;
    var sc = tool.diagram.scale;
    var Oldleft = (loc.x - pos.x) * sc;
    var Oldtop = (loc.y - pos.y) * sc;

    var scale = this.textScale;
    tool.textBlock.text = this.value;
    tool.diagram.commitTransaction("input text");
    var tempText = tool.measureTemporaryTextBlock(this.value);
    this.style.width = 6 + tempText.measuredBounds.width * scale + 'px';
    
    this.style.height = 2 + tempText.measuredBounds.height * scale + "px";
    console.log(this.style.left);
    this.style.left = ((Oldleft - ((6 + tempText.measuredBounds.width * scale) / 2) | 0)) + 'px';
    console.log(this.style.left);
    this.style.top = ((Oldtop - ((2 + tempText.measuredBounds.height * scale) / 2) | 0)) + 'px';
    

    this.rows = tempText.lineCount;
  }, false);

  textarea.addEventListener('keydown', function(e) {
    var tool = TextEditor.tool;
    if (tool.textBlock === null) return;
    var keynum = e.which;
    if (keynum === 13) { // Enter
      if (tool.textBlock.isMultiline === false) e.preventDefault();
      tool.acceptText(go.TextEditingTool.Enter);
      return;
    } else if (keynum === 9) { // Tab
      tool.acceptText(go.TextEditingTool.Tab);
      e.preventDefault();
      return;
    } else if (keynum === 27) { // Esc
      var tb = tool.textBlock;
      tool.doCancel();
      tb.diagram.startTransaction();
      tb.text = TextEditor.originalString;
      tb.diagram.commitTransaction("cancel text edit");
      if (tool.diagram !== null) tool.diagram.doFocus();
    }
  }, false);

  // handle focus:
  textarea.addEventListener('focus', function(e) {
    var tool = TextEditor.tool;
    if (tool.currentTextEditor === null) return;

    if (tool.state === go.TextEditingTool.StateActive) {
      tool.state = go.TextEditingTool.StateEditing;
    }
    // tool.diagram.startTransaction();
    // tool.diagram.commitTransaction("start to edit text");

    if (tool.selectsTextOnActivate) {
      textarea.select();
      textarea.setSelectionRange(0, 9999);
    }
  }, false);

  // Disallow blur.
  // If the textEditingTool blurs and the text is not valid,
  // we do not want focus taken off the element just because a user clicked elsewhere.
  textarea.addEventListener('blur', function(e) {
    var tool = TextEditor.tool;
    if (!tool || tool.currentTextEditor === null || tool.state === go.TextEditingTool.StateNone) return;

    textarea.focus();

    if (tool.selectsTextOnActivate) {
      textarea.select();
      textarea.setSelectionRange(0, 9999);
    }
  }, false);


  var TextEditor = new go.HTMLInfo();

  TextEditor.valueFunction = function() { return textarea.value; }

  TextEditor.mainElement = textarea; // to reference it more easily

  // used to be in doActivate
  TextEditor.show = function(textBlock, diagram, tool) {
    if (!(textBlock instanceof go.TextBlock)) return;

    TextEditor.tool = tool;  // remember the TextEditingTool for use by listeners
    TextEditor.originalString = textBlock.text;

    // This is called during validation, if validation failed:
    if (tool.state === go.TextEditingTool.StateInvalid) {
      textarea.style.border = '3px solid red';
      textarea.focus();
      return;
    }

    // This part is called during initalization:

    var loc = textBlock.getDocumentPoint(go.Spot.Center);
    var pos = diagram.position;
    var sc = diagram.scale;
    var textscale = textBlock.getDocumentScale() * sc;
    if (textscale < tool.minimumEditorScale) textscale = tool.minimumEditorScale;
    // Add slightly more width/height to stop scrollbars and line wrapping on some browsers
    // +6 is firefox minimum, otherwise lines will be wrapped improperly
    var textwidth = (textBlock.naturalBounds.width * textscale) + 6;
    var textheight = (textBlock.naturalBounds.height * textscale) + 2;
    var left = (loc.x - pos.x) * sc;
    var top = (loc.y - pos.y) * sc;

    textarea.value = textBlock.text;
    // the only way you can mix font and fontSize is if the font inherits and the fontSize overrides
    // in the future maybe have textarea contained in its own div
    diagram.div.style['font'] = textBlock.font;

    var paddingsize = 1;

    textarea.style.cssText =
    'position: absolute;' +
    'z-index: 100;' +
    'font: inherit;' +
    'fontSize: ' + (textscale * 100) + '%;' +
    'lineHeight: normal;' +
    'width: ' + (textwidth) + 'px;' +
    'height: ' + (textheight) + 'px;' +
    'left: ' + ((left - ((textwidth) / 2) | 0)) + 'px;' +
    'top: ' + ((top - ((textheight) / 2) | 0)) + 'px;' +
    'textAlign: ' + textBlock.textAlign + ';' +
    'margin: 0;' +
    'padding: ' + paddingsize + 'px;' +
    'border: 0;' +
    'outline: none;' +
    'white-space: pre-wrap;' +
    'overflow: hidden;' // for proper IE wrap

    textarea.textScale = textscale; // attach a value to the textarea, for convenience

    // Show:
    diagram.div.appendChild(textarea);

    // After adding, focus:
    textarea.focus();
    if (tool.selectsTextOnActivate) {
      textarea.select();
      textarea.setSelectionRange(0, 9999);
    }
  };

  TextEditor.hide = function(diagram, tool) {
    diagram.div.removeChild(textarea);
    TextEditor.tool = null;  // forget reference to TextEditingTool
  }

  window.TextEditor = TextEditor;
})(window);