/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _tab _url _unsaved _server _mode _type _openNewTab _setTabName

jsx3.Class.defineClass("jsx3.ide.XmlEditor", jsx3.ide.TextEditor, null, function(XmlEditor, XmlEditor_prototype) {
  
  XmlEditor_prototype._mode = 'readwrite';

  XmlEditor_prototype.save = function(objFile) {
    objFile = objFile || this.getOpenFile();
    if (objFile) {
      var strContent = this.getEditorText();

      var objXML = new jsx3.xml.Document();
      objXML.loadXML(strContent);

      if (!objXML.hasError()) {
        if (jsx3.ide.writeUserXmlFile(objFile, objXML)) {
          this.revert();
          this.setDirty(false);
          this.publish({subject:"saved"});
          return true;
        } else {
          return false;
        }
      } else {
        this.getPlugIn().getLog().error("Cannot save text editor as XML because it is not valid XML: " +
            objXML.getError());
      }

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

/*
  XmlEditor_prototype.render = function(objContainer) {
    var xml = this.getPlugIn().getResource("editor").getData();
    return objContainer.loadXML(xml, false, this.getPlugIn());
  };
*/

  XmlEditor_prototype.loadFromFile = function() {
    var objFile = this.getOpenFile();

    var content = "";
    if (objFile && objFile.isFile()) {
      var d = new jsx3.xml.Document();
      d.load(objFile.toURI());

      if (! d.hasError()) {
        content = d.toString();
      } else {
        content = objFile.read();

        // ignore errors caused by empty documents
        if (content.match(/\S/))
          this.getPlugIn().getLog().warn("Error parsing XML document: " + d.getError());
      }
    }

    this.setEditorText(content);
  };

  XmlEditor_prototype.onBeforeSetMode = function(strNewMode) {
    var strMode = this.getMode();

    if (strMode == 'readwrite') {
      var doc = new jsx3.xml.Document();
      doc.loadXML(this.getEditorText());
      
      if (doc.hasError()) {
        var error = doc.getError();
        this.getPlugIn().getServer().alert("Alert", "The XML source is not a valid XML document. The following XML parsing error occurred: <br/><br/><b>" + error.description + "</b><br/><br/> Please fix the error before entering formatted markup view.", null, null, {width: 400, height: 225});
        return false;
      }
    }
  };

  XmlEditor_prototype.onSetMode = function(objContent, strOldMode) {
    var strMode = this.getMode();

    if (strOldMode == 'readwrite') {
      var doc = new jsx3.xml.Document();
      doc.loadXML(this.getEditorText());
      objContent.setSourceDocument(doc);
    }

    objContent.doShow();
  };

  XmlEditor_prototype.getPlugIn = function() {
    return jsx3.IDE.XmlEditorPlugin;
  };

  XmlEditor_prototype.supportsReload = function() {
    return true;
  };

});
