/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.Class.defineClass("jsx3.io.FileRequest", jsx3.net.Request, null, function(FileRequest, FileRequest_prototype) {

  FileRequest_prototype.open = function(strMethod, strURL, bAsync, strUser, strPass) {
    this._url = jsx3.net.URIResolver.DEFAULT.resolveURI(strURL);
    this._async = bAsync;
    return this;
  };

  FileRequest_prototype.send = function(strContent, intTimeout) {
    var f = jsx3.io.PLUGIN.getFileForURI(this._url);

    if (f.isFile()) {
      this._response = f.read();
    } else {
      this._status = jsx3.net.Request.STATUS_ERROR;
    }

    if (this._async) {
      jsx3.sleep(function() {
        this.publish({subject:jsx3.net.Request.EVENT_ON_RESPONSE});
      }, null, this);
    }
    return this;
  };

  FileRequest_prototype.getURL = function() {
    return this._url && this._url.toString();
  };

  FileRequest_prototype.getStatus = function() {
    return this._status || 200;
  };

  FileRequest_prototype.getResponseText = function() {
    return this._response;
  };

  FileRequest_prototype.getResponseXML = function() {
    return (new jsx3.xml.Document()).loadXML(this.getResponseText());
  };

});
