/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.ide.Editor");

// @jsxobf-clobber-shared  _tab _url _unsaved _server _mode _openNewTab _setTabName getUntitledPath getTabPath getMatrix loadMatrixData getMatrixData

jsx3.Class.defineClass("jsx3.ide.PropertiesEditor", jsx3.ide.Editor, null, function(PropertiesEditor, PropertiesEditor_prototype) {
  
  PropertiesEditor_prototype._mode = 'grid';

  PropertiesEditor_prototype.getMatrix = function() {
    return this.getContent().getDescendantOfName("jsxdynpropeditor");
  };

  PropertiesEditor_prototype.loadMatrixData = function(objXML) {
    var objMatrix = this.getMatrix();
    objMatrix.setSourceXML(objXML);
    objMatrix.repaintData();
  };

  PropertiesEditor_prototype.getMatrixData = function() {
    var objXML = this.getMatrix().getXML();
    objXML.setAttribute("jsxns", "urn:tibco.com/v3.0/dynamicproperties/1");
    return objXML;
  };

  PropertiesEditor_prototype.render = function(objContainer) {
    var xml = this.getPlugIn().getResource("editor").getData();
    return objContainer.loadXML(xml, false, this.getPlugIn());
  };

  PropertiesEditor_prototype.loadFromFile = function() {
    var objFile = this.getOpenFile();
    if (objFile && objFile.isFile()) {
      var url = jsx3.ide.relativePathTo(objFile);
      var doc = new jsx3.xml.Document().load(url);
      this.loadMatrixData(doc);
    }
  };

  PropertiesEditor_prototype.save = function(objFile) {
    objFile = objFile || this.getOpenFile();
    if (objFile) {
      var objXML = jsx3.ide.makeXmlPretty(this.getMatrixData(), true);
      if (jsx3.ide.writeUserXmlFile(objFile, objXML)) {
        this.setDirty(false);
        this.publish({subject:"saved"});
        return true;
      }
    } else {
      this.getPlugIn().getLog().error("can't save file to blank url");
    }

    return false;
  };

  PropertiesEditor_prototype.onBeforeSetMode = function(strNewMode) {
    var strMode = this.getMode();

    if (strMode == "source") {
      var oldView = this.getContent().getModePane().getChild("mode_source");
      if (oldView.isDirty()) {
        if (! this._cascadeExpertChanges())
          return false;
      }
    }
  };

  PropertiesEditor_prototype.onSetMode = function(objContent, strOldMode) {
    objContent.doShow();
  };

  PropertiesEditor_prototype.getPlugIn = function() {
    return jsx3.IDE.PropertiesEditorPlugin;
  };

  /** @private @jsxobf-clobber */
  PropertiesEditor_prototype._cascadeExpertChanges = function() {
    var objView = this.getContent().getModePane().getChild("mode_source");
    var doc = new jsx3.xml.Document().loadXML(objView.getTextValue());

    //the XML is structurally valid
    if (! doc.hasError()) {
      this.loadMatrixData(doc);
      this.getMatrix().repaintData();
    } else {
      this.getPlugIn().getServer().alert("Alert", "Changes made to the XML source caused the following XML parsing error: <br/><br/><b>" +
          doc.getError() + "</b><br/><br/> Please fix the error or revert to the last saved version before continuing.",
          null, null, {width: 400, height: 225});
      return false;
    }

    return true;
  };

  PropertiesEditor_prototype.supportsReload = function() {
    return true;
  };

  PropertiesEditor_prototype.removeDP = function(strRecordId, objMatrix) {
    objMatrix.deleteRecord(strRecordId, true);
    this.setDirty(true);
  };

});
