/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * @package
 */
jsx3.lang.Class.defineClass("jsx3.amp.AutoReg", jsx3.amp.PlugIn, null, function(AutoReg, AutoReg_prototype) {

  var amp = jsx3.amp;

  AutoReg.DIR = "plugins_auto";

  AutoReg_prototype.hasProvider = function() {
    return this._hasProvider;
  };

  AutoReg_prototype.hasCompleted = function() {
    return this._done;
  };

  AutoReg_prototype.onRegister = function() {
    this._hasProvider = false;
    this._done = false;
    this._uri = jsx3.app.Browser.getLocation().resolve(this.getServer().resolveURI(AutoReg.DIR + "/"));
  };

  AutoReg_prototype.onExtension = function(objExtPt, arrExts) {
    this.jsxsuper(objExtPt, arrExts);

    if (objExtPt.getLocalId() == "dirlist") {
      if (!this._hasProvider) {
        for (var i = 0; i < arrExts.length; i++) {
          var x = arrExts[i];
          if (x.isAvailable(this._uri.getScheme())) {
            this._hasProvider = true;
            this._loadWith(x);
            break;
          }
        }
      }
    }
  };

  AutoReg_prototype._loadWith = function(ext) {
    ext.getPlugIn().load().when(jsx3.$F(function() {
      var dirNames = ext.getDirNames(this._uri);
      dirNames = dirNames.filter(function(e) { return e.match(/^([\w\-]+)(\.[\w\-]+)*$/); });

      dirNames.each(jsx3.$F(function(e) {
        this.getEngine().register(e, this._uri);
      }).bind(this));

      this._done = true;
      this.publish({subject:"done"});
    }).bind(this));
  };

});
