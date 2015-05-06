/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * An AMP extension.
 */
jsx3.lang.Class.defineClass("jsx3.amp.Ext", null, null, function(Ext, Ext_prototype) {

  var amp = jsx3.amp;
  
  /**
   * @param objPlugIn {jsx3.amp.PlugIn} the plug-in owning the extension.
   * @param objElm {jsx3.xml.Entity} the XML declaration of the extension.
   * @package
   */
  Ext_prototype.init = function(objPlugIn, objElm) {
    this._xml = new amp.XML(objElm);

    /* @jsxobf-clobber */
    this._plugin = objPlugIn;
  };

  /**
   * Returns the full ID of this extension, which is unique among all extensions in the AMP engine.
   * @return {String}
   */
  Ext_prototype.getId = function() {
    var lid = this.getLocalId();
    return this.getPlugIn() + "." + (lid || "?");
  };

  /**
   * Returns the local ID of this extension, which is defined by the <code>id</code> attribute of the XML
   * extension declaration.
   * @return {String}
   */
  Ext_prototype.getLocalId = function() {
    return this._xml.attr("id");
  };

  /**
   * Returns the name of this extension, which is defined by the <code>name</code> attribute of the XML
   * extension declaration.
   * @return {String}
   */
  Ext_prototype.getName = function() {
    return this._xml.attr("name");
  };

  /**
   * Returns the plug-in declaring this extension.
   * @return {jsx3.amp.PlugIn}
   */
  Ext_prototype.getPlugIn = function() {
    return this._plugin;
  };

  /**
   * Returns the engine owning the plug-in owning this extension.
   * @return {jsx3.amp.Engine}
   */
  Ext_prototype.getEngine = function() {
    return this._plugin.getEngine();
  };

  /**
   * Returns the ID of the extension point this this extension extends. This is equal to the <code>point</code>
   * attribute of the XML extension declaration.
   * @return {String}
   */
  Ext_prototype.getPointId = function() {
    return this._xml.attr("point");
  };

  /**
   * Returns the extension point to which this extension is registered.
   * @return {jsx3.amp.ExtPoint}
   */
  Ext_prototype.getPoint = function() {
    return this.getEngine().getExtPoint(this.getPointId());
  };

  /**
   * Returns the list of XML elements declared in the body of the extension declaration.
   * @return {jsx3.$Array<jsx3.amp.XML>}
   */
  Ext_prototype.getData = function() {
    return this._xml.children();
  };

  Ext_prototype.toString = function() {
    return this.getId();
  };

});
