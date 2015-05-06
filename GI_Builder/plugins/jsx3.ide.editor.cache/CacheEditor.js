/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.ide.TextEditor");

// @jsxobf-clobber-shared  _tab _url _unsaved  _mode _type _openNewTab _setTabName

jsx3.Class.defineClass("jsx3.ide.CacheEditor", jsx3.ide.TextEditor, null, function(CacheEditor, CacheEditor_prototype) {
  
  CacheEditor_prototype._mode = 'readwrite';

  CacheEditor_prototype.getCache = function() {
    var f = this.getOpenFile();
    return f && f.cache;
  };

  CacheEditor_prototype.getCacheId = function() {
    var f = this.getOpenFile();
    return f && f.cacheid;
  };

  CacheEditor_prototype.getFileType = function() {
    var cache = this.getCache();
    if (cache) {
      var objXML = cache.getDocument(this.getCacheId());
      if (objXML) {
        var strNSURI = objXML.getRootNode().getNamespaceURI();
        if (strNSURI == "http://www.w3.org/1999/XSL/Transform" || strNSURI == "http://www.w3.org/TR/WD-xsl")
          return 'xsl';
      }
    }

    return 'xml'; // used for save-as, anything else?
  };

  CacheEditor_prototype.getPlugIn = function() {
    return jsx3.IDE.CacheEditorPlugin;
  };

  CacheEditor_prototype.isReadOnly = function() {
    return false;
  };

  CacheEditor_prototype.getTitle = function() {
    return this.getCacheId();
  };

  CacheEditor_prototype.loadFromFile = function() {
    var cache = this.getCache();
    if (cache) {
      var objXML = cache.getDocument(this.getCacheId());
      this.setEditorText(objXML ? objXML.toString() : "");
    }
  };

  CacheEditor_prototype.revert = function() {
    var cache = this.getCache();
    this.setEditorText(cache.getDocument(this.getCacheId()).toString());
    this.setDirty(false);
    this.publish({subject:"reverted"});
  };

  CacheEditor_prototype.save = function(objFile) {
    var objXML = new jsx3.xml.Document();
    objXML.loadXML(this.getEditorText());

    if (objXML.hasError()) {
      this.getPlugIn().getLog().error("The cache document count not be saved because of the following XML " +
          "parsing error: " + objXML.getError() + ". Please fix the error or revert to the last saved version before continuing.");
      return false;
    }

    this.getCache().setDocument(this.getCacheId(), objXML);
    this.setDirty(false);
    this.publish({subject:"saved"});
    return true;
  };

  CacheEditor_prototype.saveAs = function(objFile) {
    var objXML = new jsx3.xml.Document();
    objXML.loadXML(this.getEditorText());

    if (objXML.hasError()) {
      this.getPlugIn().getLog().error("The cache document count not be saved to disk because of the following XML " +
          "parsing error: " + objXML.getError() + ". Please fix the error or revert to the last saved version before continuing.");
      return false;
    }

    return jsx3.ide.writeUserXmlFile(objFile, objXML);
  };

  CacheEditor_prototype.onBeforeSetMode = function(strNewMode) {
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

  CacheEditor_prototype.onSetMode = function(objContent, strOldMode) {
    var strMode = this.getMode();

    if (strOldMode == 'readwrite') {
      var doc = new jsx3.xml.Document();
      doc.loadXML(this.getEditorText());
      objContent.setSourceDocument(doc);
    }

    objContent.doShow();
  };

  CacheEditor_prototype.supportsReload = function() {
    return false;
  };

});
