/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * An AMP extension point.
 */
jsx3.lang.Class.defineClass("jsx3.amp.ExtPoint", null, [jsx3.util.EventDispatcher], function(ExtPoint, ExtPoint_prototype) {

  var amp = jsx3.amp;

  /** {String} An event published by an extension point when it is extended by a new extension. */
  ExtPoint.EXTENDED = "extended";

  /**
   * @param objPlugIn {jsx3.amp.PlugIn} the plug-in owning the extension point.
   * @param objElm {jsx3.xml.Entity} the XML declaration of the extension point.
   * @package
   */
  ExtPoint_prototype.init = function(objPlugIn, objElm) {
    this._xml = new amp.XML(objElm, true);

    /* @jsxobf-clobber */
    this._plugin = objPlugIn;
  };

  /**
   * Returns the full ID of this extension, which is unique among all extension points in the AMP engine.
   * @return {String}
   */
  ExtPoint_prototype.getId = function() {
    return this._plugin.getId() + "." + this.getLocalId();
  };

  /**
   * Returns the local ID of this extension point, which is defined by the <code>id</code> attribute of the XML
   * extension point declaration.
   * @return {String}
   */
  ExtPoint_prototype.getLocalId = function() {
    return this._xml.attr("id");
  };

  /**
   * Returns the name of this extension point, which is defined by the <code>name</code> attribute of the XML
   * extension point declaration.
   * @return {String}
   */
  ExtPoint_prototype.getName = function() {
    return this._xml.attr("name");
  };

  /**
   * Returns the plug-in declaring this extension point.
   * @return {jsx3.amp.PlugIn}
   */
  ExtPoint_prototype.getPlugIn = function() {
    return this._plugin;
  };

  /**
   * Returns the engine owning the plug-in owning this extension point.
   * @return {jsx3.amp.Engine}
   */
  ExtPoint_prototype.getEngine = function() {
    return this._plugin.getEngine();
  };

  /**
   * Returns the list of extensions registered with this extension point.
   * @return {jsx3.$Array<jsx3.amp.Ext>}
   */
  ExtPoint_prototype.getExts = function() {
    return this.getEngine().getExts(this.getId());
  };
  
  /**
   * Processes each extension of this extension point using the visitor pattern.
   * @param objProcessor {jsx3.amp.ExtProc | Function} the visitor. This argument may be null if the XML declaration
   *    of this extension point specifies a processor that can be constructed with the processor factory.
   * @param arrExt {Array<jsx3.amp.Ext>} optionally, a subset of the extensions of this extension point. Only these
   *    extensions will be processed if this parameter is not empty.
   * @return {jsx3.$Array<Object>} the extensions to process, defaults to all the extensions of this extension point.
   * @see jsx3.amp.ExtProc#process()
   * @see jsx3.amp.ExtProc#getProcessor()
   */
  ExtPoint_prototype.processExts = function(objProcessor, arrExt) {
    if (!objProcessor) {
      var def = this._xml.child("processor");
      if (def)
        objProcessor = amp.ExtProc.getProcessor(def.attr("type"), def);

      if (!objProcessor)
        throw new jsx3.Exception("Parameter objProcessor must not be null.");
    }

    if (!arrExt) arrExt = this.getExts();
    return amp.ExtProc.process(arrExt, objProcessor);
  };

  /**
   * This method is called (after this extension point is instantiated) any time extensions are registered for this
   * point. Subclasses may override this method to perform custom functionality but should call <code>jsxsuper()</code>.
   *
   * @param arrExts {jsx3.$Array<jsx3.amp.Ext>}
   */
  ExtPoint_prototype.onExtension = function(arrExts) {
    this.publish({subject:ExtPoint.EXTENDED, exts:arrExts});
  };

  ExtPoint_prototype.toString = function() {
    return this.getId();
  };

});

