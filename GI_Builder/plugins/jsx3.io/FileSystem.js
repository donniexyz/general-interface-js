/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.Class.defineClass("jsx3.io.FileSystemDesc", null, null, function(FileSystemDesc, FileSystemDesc_prototype) {

  var amp = jsx3.amp;

  FileSystemDesc_prototype.init = function(ext, elm) {
    /* @jsxobf-clobber */
    this._ext = ext;
    /* @jsxobf-clobber */
    this._elm = elm;
  };

  FileSystemDesc_prototype.getExt = function() {
    return this._ext;
  };

  FileSystemDesc_prototype.getId = function() {
    return this._elm.attr("id");
  };

  FileSystemDesc_prototype.getLabel = function() {
    return this._elm.attr("label");
  };

  FileSystemDesc_prototype.getFSClass = function() {
    return this._elm.attr("class");
  };

  FileSystemDesc_prototype.hasRead = function() {
    return "true" == this._elm.attr("read");
  };

  FileSystemDesc_prototype.hasWrite = function() {
    return "true" == this._elm.attr("write");
  };

  FileSystemDesc_prototype.hasList = function() {
    return "true" == this._elm.attr("list");
  };

  FileSystemDesc_prototype.load = jsx3.$Y(function(cb) {
    this._ext.getPlugIn().load().when(cb);
  });

  FileSystemDesc_prototype.getSchemes = function() {
    return this._elm.attr("scheme").split(/\s*,\s*/g);
  };

  FileSystemDesc_prototype.getInstance = function() {
    if (!this._inst) {
      this._inst = new (jsx3.lang.getVar(this.getFSClass()));
      this._inst._desc = this;
    }
    return this._inst;
  };

  FileSystemDesc_prototype.isAvailable = function() {
    return !this._ext.isAvailable || this._ext.isAvailable();
  };

  FileSystemDesc_prototype.toString = function() {
    return this.getId();
  };

});

/**
 * 
 */
jsx3.Class.defineClass("jsx3.io.FileSystem", null, null, function(FileSystem, FileSystem_prototype) {

  FileSystem_prototype.getFile = jsx3.Method.newAbstract("strPath");

  FileSystem_prototype.getUserDocuments = jsx3.Method.newAbstract();

  FileSystem_prototype.getRoots = jsx3.Method.newAbstract();

  FileSystem_prototype.createTempFile = jsx3.Method.newAbstract();

  FileSystem_prototype.hasRead = function() {
    return this._desc.hasRead();
  };

  FileSystem_prototype.hasWrite = function() {
    return this._desc.hasWrite();
  };

  FileSystem_prototype.hasList = function() {
    return this._desc.hasList();
  };

});
