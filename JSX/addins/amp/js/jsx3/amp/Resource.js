/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _loadResourceShared _getBestLocaleKey

/**
 * An AMP plug-in resource, such as a JavaScript file or XML file.
 */
jsx3.lang.Class.defineClass("jsx3.amp.Resource", null, [jsx3.util.EventDispatcher], function(Resource, Resource_prototype) {

  var amp = jsx3.amp;

  /** {String} Event subject published when this resource has loaded. */
  Resource.READY = "ready";

  /**
   * {String}
   * @final @jsxobf-final
   */
  Resource.TYPE_SCRIPT = "script";

  /**
   * {String}
   * @final @jsxobf-final
   */
  Resource.TYPE_CSS = "css";

  /**
   * {String}
   * @final @jsxobf-final
   */
  Resource.TYPE_XML = "xml";

  /**
   * {String}
   * @final @jsxobf-final
   */
  Resource.TYPE_XSL = "xsl";

  /**
   * {String}
   * @final @jsxobf-final
   */
  Resource.TYPE_JSS = "jss";

  /**
   * {String}
   * @final @jsxobf-final
   */
  Resource.TYPE_BUNDLE = "propsbundle";

  /** {String} Loads a resource before the plug-in is instantiated and registered. */
  Resource.LOAD_EARLY = "early";
  /** {String} Loads a resource before the plug-in loads. */
  Resource.LOAD_NORMAL = "normal";
  /** {String} Waits for a resource to be loaded programatically some time after the plug-in loads. */
  Resource.LOAD_MANUAL = "manual";

  /** @private @jsxobf-clobber */
  Resource._LOAD_MAP = {early:1, normal:1, manual:1};

  /**
   * @jsxobf-clobber
   * @private
   * @jsxobf-final
   */
  Resource.NOT_LOADED = 0;
  /**
   * @jsxobf-clobber
   * @private
   * @jsxobf-final
   */
  Resource.LOADING = 1;
  /**
   * @jsxobf-clobber
   * @private
   * @jsxobf-final
   */
  Resource.LOADED = 2;

  /**
   * @private
   * @jsxobf-clobber-shared
   */
  Resource._newBeforePlugIn = function(strPlugInId, strPlugInPath, strId, elm, objEngine) {
    var rsrc = new Resource(null, strId, elm);
    /* @jsxobf-clobber-shared */
    rsrc._pluginid = strPlugInId;
    /* @jsxobf-clobber */
    rsrc._pluginpath = strPlugInPath;
    /* @jsxobf-clobber */
    rsrc._pluginengine = objEngine;
    return rsrc;
  };

  /**
   * @param objPlugIn {jsx3.amp.PlugIn} the plug-in owning the resource.
   * @param strId {String} the ID of the resource. This ID is unique among all resources of the same plug-in.
   * @param elm {jsx3.xml.Element} the XML declaration of the resource.
   */
  Resource_prototype.init = function(objPlugIn, strId, elm) {
    /* @jsxobf-clobber */
    this._xml = new amp.XML(elm || {});
    /* @jsxobf-clobber */
    this._xmlnative = elm;
    /* @jsxobf-clobber-shared */
    this._plugin = objPlugIn;
    /* @jsxobf-clobber */
    this._id = strId;
    /* @jsxobf-clobber */
    this._prereqs = jsx3.$A();
    /* @jsxobf-clobber */
    this._state = Resource.NOT_LOADED;
    /* @jsxobf-clobber */
    this._data = null;
  };

  /** @private @jsxobf-clobber-shared */
  Resource_prototype._setPlugInOnInit = function(p) {
    this._plugin = p;
    delete this._pluginid;
    delete this._pluginpath;
    delete this._pluginengine;
  };

  /**
   * Returns the value of any attribute of the XML declaration of this resource.
   * @param k {String} the attribute name.
   */
  Resource_prototype.attr = function(k) {
    return this._xml.attr(k);
  };

  /**
   * Returns the XML declaration of this resource as passed to the constructor.
   * @return {jsx3.xml.Entity}
   */
  Resource_prototype.xml = function() {
    return this._xmlnative;
  };

  /**
   * Returns the plug-in that owns this resource.
   * @return {jsx3.amp.PlugIn}
   */
  Resource_prototype.getPlugIn = function() {
    return this._plugin;
  };

  /**
   * Returns the full ID of this resource, which is unique to the entire AMP engine.
   * @return {String}
   */
  Resource_prototype.getId = function() {
    return (this._plugin ? this._plugin.getId() : this._pluginid) + "." + this._id;
  };

  /**
   * Returns the ID Of this resource, which is unique among all resources of the same plug-in.
   * @return {String}
   */
  Resource_prototype.getLocalId = function() {
    return this._id;
  };

  /**
   * Returns the path of this resource, which is relative to the directory of the plug-in owning this resource.
   * The resource type is defined by the <code>id</code> attribute of the resource XML declaration.
   * @return {String}
   */
  Resource_prototype.getPath = function() {
    return this.attr("path");
  };

  /**
   * @package
   */
  Resource_prototype.getFullPath = function(p) {
    var path = p || this.getPath();
    return this._plugin ? "" + this._plugin.resolveURI(path) : this._pluginpath + path;
  };

  /**
   * Returns the list of locale keys for which this resources is localized. This is equal to the locales
   * attribute of the resource, split by whitespace.
   * @return {Array<String>}
   */
  Resource_prototype.getLocales = function() {
    var l = this.attr("locales");
    if (l) {
      l = jsx3.$S(l).trim();
      if (l.length > 0)
        return l.split(/\s+/g);
    }
    return [];
  };

  /**
   * Returns the path of the best localized version of this resource for <code>objLocale</code>.
   * @param objLocale {jsx3.util.Locale}
   * @return {String}
   */
  Resource_prototype.getPathForLocale = function(objLocale) {
    var path = this.getPath();
    if (objLocale) {
      var key = amp._getBestLocaleKey(this.attr("locales"), objLocale);
      if (key) {
        var index = path.lastIndexOf(".");
        if (index < 0 || index < path.lastIndexOf("/"))
          index = path.length;
        path = path.substring(0, index) + "." + key + path.substring(index);
      }
    }
    return path;
  };

  /**
   * Returns the resource type, such as <code>TYPE_SCRIPT</code>. The resource type is defined by the element
   * node name of the resource XML declaration.
   *
   * @return {String}
   */
  Resource_prototype.getType = function() {
    return this._xml.nname();
  };

  /**
   * Returns the load type, such as <code>LOAD_NORMAL</code>. The load type is defined using the <code>load</code>
   * attribute of the resource XML declaration.
   *
   * @return {String}
   * @see LOAD_EARLY
   * @see LOAD_NORMAL
   * @see LOAD_MANUAL
   */
  Resource_prototype.getLoadType = function() {
    var load = this.attr("load");
    return Resource._LOAD_MAP[load] ? load : Resource.LOAD_NORMAL;
  };

  /**
   * @return {jsx3.$Array<Object>}
   * @package
   * @jsxobf-clobber-shared
   */
  Resource_prototype._getPrereqs = function() {
    return this._prereqs;
  };

  /**
   * @package
   * @jsxobf-clobber-shared
   */
  Resource_prototype._addPrereq = function(strPrereqId, type) {
    this._prereqs.push({id:strPrereqId, type:type});
  };

  /**
   * @return {boolean}
   */
  Resource_prototype.isLoaded = function() {
    return this._state == Resource.LOADED;
  };

  /**
   * Returns an asynchronous return value that completes when this resource is loaded.
   * @see #load()
   */
  Resource_prototype.loaded = jsx3.$Y(function(cb) {
    if (this.isLoaded()) {
      cb.done();
    } else {
      this.subscribe(Resource.READY, jsx3.$F(cb.done).bind(cb));
    }
  });

  /**
   * Asynchronously loads this resource if it is not already loaded.
   * @see #loaded()
   */
  Resource_prototype.load = jsx3.$Y(function(cb) {
    if (this._state == Resource.NOT_LOADED) {
      return (this._plugin ? this._plugin.getEngine() : this._pluginengine)._loadResourceShared(this);
    } else if (!this.isLoaded())
      this.subscribe(Resource.READY, jsx3.$F(cb.done).bind(cb));
    else
      cb.done();
  });

  /**
   * @package
   * @jsxobf-clobber-shared
   */
  Resource_prototype._engineStart = function(objData) {
    this._state = Resource.LOADING;
  };

  /**
   * @package
   * @jsxobf-clobber-shared
   */
  Resource_prototype._engineFinish = function(objData) {
    this._state = Resource.LOADED;
    this._data = objData;
    this.publish({subject:Resource.READY});
  };

  /**
   * Returns the data associated with this resource. Only resources of type xml, xsl, jss, and propsbundle will
   * return a defined value.
   *
   * @param bClear {boolean} if <code>true</code> then delete the reference to the data object in order to allow
   *    garbage collection.
   * @return {jsx3.xml.Document|jsx3.app.Properties|jsx3.app.PropsBundle}
   */
  Resource_prototype.getData = function(bClear) {
    var d = this._data;
    if (bClear) delete this._data;
    return d;
  };

  Resource_prototype.toString = function() {
    return this.getId();
  };

});
