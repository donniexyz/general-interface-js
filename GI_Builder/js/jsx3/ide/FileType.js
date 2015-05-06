/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * 
 */
jsx3.Class.defineClass("jsx3.ide.FileType", null, null, function(FileType, FileType_prototype) {

  FileType_prototype.init = function(ext, elm) {
    /* @jsxobf-clobber */
    this._xml = elm;
    /* @jsxobf-clobber */
    this._ext = ext;
  };

  FileType_prototype.getExt = function() {
    return this._ext;
  };

  FileType_prototype.getId = function() {
    return this._xml.attr("id");
  };

  FileType_prototype.getLabel = function() {
    return this._xml.attr("label");
  };

  FileType_prototype.getImage = function() {
    return this._xml.attr("img");
  };

  FileType_prototype.isSlowReload = function() {
    return this._xml.attr("slow-reload") == "true";
  };

  FileType_prototype.isReloadable = function() {
    return this._xml.attr("reloadable") == "true";
  };

  FileType_prototype.toString = function() {
    return this.getId();
  };

  FileType_prototype.isTypeOf = function(objFile, objXML) {
    return this.getId().toLowerCase() == objFile.getExtension().toLowerCase();
  };

  FileType_prototype.getPrecedence = function() {
    return parseInt(this._xml.attr("precedence")) || 0;
  };

});

jsx3.Class.defineClass("jsx3.ide.FileType.Script", jsx3.ide.FileType, null, function(FileType, FileType_prototype) {

  FileType_prototype.isTypeOf = function(objFile, objXML) {
    return "js" ==  objFile.getExtension().toLowerCase();
  };

});

jsx3.Class.defineClass("jsx3.ide.FileType.XML", jsx3.ide.FileType, null, function(FileType, FileType_prototype) {

  FileType_prototype.isTypeOf = function(objFile, objXML) {
    return objXML != null;
  };

});

jsx3.Class.defineClass("jsx3.ide.FileType.XSL", jsx3.ide.FileType, null, function(FileType, FileType_prototype) {

  FileType_prototype.isTypeOf = function(objFile, objXML) {
    if (objXML) {
      var strNSURI = objXML.getRootNode().getNamespaceURI();
      return strNSURI == "http://www.w3.org/1999/XSL/Transform" || strNSURI == "http://www.w3.org/TR/WD-xsl";
    }
    return false;
  };

});

jsx3.Class.defineClass("jsx3.ide.FileType.Component", jsx3.ide.FileType, null, function(FileType, FileType_prototype) {

  FileType_prototype.isTypeOf = function(objFile, objXML) {
    if (objXML) {
      var strNSURI = objXML.getRootNode().getNamespaceURI();
      return strNSURI == jsx3.app.Model.CURRENT_VERSION || strNSURI == jsx3.app.Model.CIF_VERSION;
    }
    return false;
  };

});

jsx3.Class.defineClass("jsx3.ide.FileType.JSS", jsx3.ide.FileType, null, function(FileType, FileType_prototype) {

  FileType_prototype.isTypeOf = function(objFile, objXML) {
    return objXML != null && objXML.getRootNode().getAttribute("jsxns") == "urn:tibco.com/v3.0/dynamicproperties/1";
  };

});

jsx3.Class.defineClass("jsx3.ide.FileType.LJSS", jsx3.ide.FileType, null, function(FileType, FileType_prototype) {

  FileType_prototype.isTypeOf = function(objFile, objXML) {
    return objXML != null && objXML.getAttribute("jsxnamespace") == "propsbundle";
  };

});

