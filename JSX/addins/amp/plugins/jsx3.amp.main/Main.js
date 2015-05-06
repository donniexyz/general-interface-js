/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * @package
 */
jsx3.lang.Class.defineClass("jsx3.amp.Main", jsx3.amp.PlugIn, null, function(Main, Main_prototype) {

  var amp = jsx3.amp;
  
  Main_prototype.onRegister = function() {
    amp.LOG.debug("Main.onRegister");
    this._progress = jsx3.$A();
    this._pctdone = 0;
    this._mainComp = null;
    
    this.getEngine().subscribe(amp.Engine.PROGRESS, this, "_onProgress");
    this.load();
    // Since this is the first plug-in to load, no need to check pre-existing extensions.
  };

  Main_prototype.onExtension = function(objExtPt, arrExts) {
    this.jsxsuper(objExtPt, arrExts);

    amp.LOG.debug("Main.onExtension " + objExtPt + " [" + arrExts + "]");
    var id = objExtPt.getLocalId();

    if (id == "progress") {
      objExtPt.processExts(null, arrExts).each(jsx3.$F(function(arv) {
        arv.when(jsx3.$F(function(rv) {
          rv.setProgress(this._pctdone);
          this._progress.push(rv);
        }).bind(this));
      }).bind(this));
    } else if (id == "init") {
      jsx3.$A(arrExts).each(function(e) { e.getPlugIn().load(); });
    } else if (id == "layout") {
      jsx3.$A(arrExts).each(function(e) { e.getPlugIn().load(); });
    }
  };
  
  /** @private @jsxobf-clobber */
  Main_prototype._onProgress = function(objEvent) {
    this._pctdone = objEvent.pct;
//    this.getLog().debug("_onProgress " + objEvent.pct + " " + objEvent.done);

    var msg = objEvent.done ? "onComplete" : "setProgress";
    var pct = this._pctdone;
    this._progress.each(function(e) {
      e[msg](pct);
    });
  };
  
  Main_prototype.onStartup = function() {
    // Make sure that required plug-ins are loaded before doing this.
    this.loaded().when(jsx3.$F(function() {
      amp.LOG.debug("Main.onStartup");

      this.getExtPoint("init").processExts();

      var layouts = this.getExtPoint("layout").processExts();
      if (layouts.length > 0) {
        var container = this.getServer().getBodyBlock();
        layouts[0].when(function(rv) { rv(container); });
      }
    }).bind(this));
  };

});
