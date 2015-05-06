/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.Class.defineClass("jsx3.ide.TextEditor", jsx3.ide.Editor, null, function(TextEditor, TextEditor_prototype) {

  TextEditor_prototype.save = function(objFile) {
    objFile = objFile || this.getOpenFile();
    if (objFile) {
      var strContent = this.getEditorText();

      if (jsx3.ide.writeUserFile(objFile, strContent)) {
        this.setDirty(false);
        this.publish({subject:"saved"});
        return true;
      }
    } else {
      this.getPlugIn().getLog().error("Cannot save file to blank url.");
    }

    return false;
  };

  TextEditor_prototype.getPlugIn = function() {
    return jsx3.IDE.TextEditorPlugin;
  };
  
  TextEditor_prototype.render = function(objContainer) {
    var xml = this.getPlugIn().getResource("editor").getData();
    return objContainer.loadXML(xml, false, this.getPlugIn());
  };

  TextEditor_prototype.loadFromFile = function() {
    var objFile = this.getOpenFile();
    if (objFile && objFile.isFile()) {
      this.setEditorText(objFile.read());
    }
  };

  TextEditor_prototype.getEditorText = function() {
    var content = this.getContent();
    if (content)
      return content.getTextValue();
  };

  TextEditor_prototype.setEditorText = function(s) {
    var content = this.getContent();
    if (content)
      content.setTextValue(s);
  };

  TextEditor_prototype.supportsReload = function() {
    return true;
  };

  TextEditor_prototype.onTextChange = function() {
    this.setDirty(true);
  };

  TextEditor_prototype.onKeyDown = function() {
    if (!this.isDirty()) {
      var c = this.getEditorText();
      jsx3.sleep(function() {
        if (c != this.getEditorText())
          this.setDirty(true);
      }, null, this);
    }
  };

});
