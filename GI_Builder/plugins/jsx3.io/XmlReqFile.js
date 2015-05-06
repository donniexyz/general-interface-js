/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.Class.defineClass("jsx3.io.XmlReqFileSystem", jsx3.io.FileSystem, null, function(XmlReqFileSystem, XmlReqFileSystem_prototype) {

  XmlReqFileSystem._TMPSER = 1;

  XmlReqFileSystem._WINPATH = /^[a-zA-Z]:\\/;

  XmlReqFileSystem_prototype.getFile = function(strPath) {
    if (typeof(strPath) == "string" && strPath.match(XmlReqFileSystem._WINPATH)) {
      strPath = "file:///" + strPath.replace(/\\/g, "/");
    }

    var uri = jsx3.net.URI.valueOf(strPath);
    if (!uri.getScheme()) {
      uri = new jsx3.net.URI("file://" + (uri.getPath().indexOf("/") != 0 ? "/" : "") + uri.getPath());
    }
    return new jsx3.io.XmlReqFile(this, uri);
  };

  XmlReqFileSystem_prototype.getUserDocuments = function() {
    return null;
  };

  XmlReqFileSystem_prototype.getRoots = function() {
    return [this.getFile("file:///")];
  };

  XmlReqFileSystem_prototype.createTempFile = function(strName) {
    return this.getFile("/tmp/" + strName + (XmlReqFileSystem._TMPSER++));
  };

});

/**
 * Wraps the file system. Based on java.io.File.
 */
jsx3.Class.defineClass("jsx3.io.XmlReqFile", jsx3.io.File, null, function(XmlReqFile, XmlReqFile_prototype) {

  var File = jsx3.io.File;

  XmlReqFile.MANIFEST = ".manifest";

  XmlReqFile_prototype.init = function(fs, uri) {
    var path = uri.getPath();
    if (path.match(/\/[^\.\/]+$/))
      uri = jsx3.net.URI.fromParts(uri.getScheme(), uri.getUserInfo(), uri.getHost(),
          uri.getPort(), path + "/", uri.getQuery(), null);
    this.jsxsuper(fs, uri);
  };

  XmlReqFile_prototype.write = function(strData, objParams) {
    jsx3.ide.getPlugIn("jsx3.io").getLog().error("XmlReqFile.write not implemented.");
    return false;
  };

  XmlReqFile_prototype.read = function() {
    var req = new jsx3.net.Request();
    req.open("GET", this._uri, false);
    req.send();

    this._exists = req.getStatus() == 200;
    return req.getStatus() == 200 ? req.getResponseText() : null;
  };
  
  XmlReqFile_prototype.isDirectory = function() {
    return this.getExtension() == "";
  };
  
  XmlReqFile_prototype.isFile = function() {
    return this.exists() && this.getExtension() != "";
  };
  
  XmlReqFile_prototype.exists = function() {
    if (this._exists == null) {
      this._exists = false;
      this.read();
    }
    return this._exists;
  };

  XmlReqFile_prototype.listFiles = function() {
    var req = new jsx3.net.Request();
    req.open("GET", this._uri + XmlReqFile.MANIFEST, false);
    req.send();

    if (req.getStatus() == 200) {
      var text = req.getResponseText() || "";
      return jsx3.$A(text.split(/[ \t\r]*\n[ \t\r]*/)).filter(
              function(e) { return e.match(/\S/); }).map(
              jsx3.$F(function(e) { return this.resolve(e); }).bind(this))
    }

    return [];
  };
    
  XmlReqFile_prototype.mkdir = function() {
    jsx3.ide.getPlugIn("jsx3.io").getLog().error("XmlReqFile.mkdir not implemented.");
  };

  XmlReqFile_prototype.deleteFile = function() {
    jsx3.ide.getPlugIn("jsx3.io").getLog().error("XmlReqFile.deleteFile not implemented.");
  };
    
  XmlReqFile_prototype.renameTo = function(objDest) {
    jsx3.ide.getPlugIn("jsx3.io").getLog().error("XmlReqFile.renameTo not implemented.");
  };
  
  XmlReqFile_prototype.isHidden = function() {
    return false;
  };
  
  XmlReqFile_prototype.isReadOnly = function() {
    return true;
  };
  
  XmlReqFile_prototype.setReadOnly = function(bReadOnly) {
    jsx3.ide.getPlugIn("jsx3.io").getLog().error("XmlReqFile.setReadOnly not implemented.");
  };

});
