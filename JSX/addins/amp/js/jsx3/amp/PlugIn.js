/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _plugin _loadPlugIn _extendInstance
// @jsxobf-clobber-shared  _getConstructor _setPlugInOnInit _addExtPoint _addExt _removeExtPoint _removeExt

/**
 * An AMP plug-in. A plug-in is a logical collection of application logic and resources. Plug-ins are loaded
 * as needed and may contain extension points and extensions.
 */
jsx3.lang.Class.defineClass("jsx3.amp.PlugIn", null, [jsx3.util.EventDispatcher, jsx3.net.URIResolver, jsx3.amp.Bindable], function(PlugIn, PlugIn_prototype) {

  var amp = jsx3.amp;
  
  /** {String} Event subject published when this plug-in has loaded completely. */
  PlugIn.READY = "ready";
  
  /** {String} Event subject published when an extension point of this plug-in has been extended. */
  PlugIn.EXTENDED = "extended";

  /**
   * @jsxobf-clobber
   * @private
   * @jsxobf-final
   */
  PlugIn.NOT_LOADED = 0;
  /**
   * @jsxobf-clobber
   * @private
   * @jsxobf-final
   */
  PlugIn.LOADING = 1;
  /**
   * @jsxobf-clobber
   * @private
   * @jsxobf-final
   */
  PlugIn.LOADED = 2;

  PlugIn_prototype.init = function() {
    /* @jsxobf-clobber */
    this._state = PlugIn.NOT_LOADED;
    
    /* @jsxobf-clobber */
    this._req = jsx3.$A();
    
    /* @jsxobf-clobber */
    this._resources = jsx3.$A();
    /* @jsxobf-clobber */
    this._resourcemap = {};

    /* @jsxobf-clobber */
    this._extpt = jsx3.$A();
    /* @jsxobf-clobber */
    this._extptmap = {};

    /* @jsxobf-clobber */
    this._ext = jsx3.$A();
    /* @jsxobf-clobber */
    this._extmap = {};

    /* @jsxobf-clobber */
    this._events = jsx3.$A();
  };
  
  /**
   * Called after this plug-in is instantiated to provide the plug-in with its XML configuration data. This method
   * is optional for objects used as plug-ins.
   *
   * @param objElm {jsx3.xml.Entity}
   */
  PlugIn_prototype.setData = function(objElm) {
    /* @jsxobf-clobber */
    this._id = objElm.getAttribute("id");
    /* @jsxobf-clobber */
    this._global = objElm.getAttribute("global") == "true";
    /* @jsxobf-clobber */
    this._name = objElm.getAttribute("name");
    /* @jsxobf-clobber */
    this._version = objElm.getAttribute("version");

    var children = objElm.getChildNodes().toArray(true);
    for (var i = 0; i < children.length; i++) {
      var node = children[i];
      var name = node.getBaseName();

      if (name == "requires") {
        for (var j = node.selectNodeIterator("amp:plugin", amp.getXmlNS(node)); j.hasNext(); )
          this._req.push(j.next().getAttribute("id"));
      } else if (name == "event") {

        this._events.push(node.getAttribute("id"));

      } else if (name == "extension-point") {

        var xpClass = null;

        var xpClassName = node.getAttribute("class");
        if (xpClassName) {
          xpClass = amp._getConstructor(xpClassName);
          if (!xpClass)
            amp.LOG.error(jsx3._msg("amp.38", xpClassName));
        }
        if (!xpClass) xpClass = amp.ExtPoint;

        var xp = new xpClass(this, node);
        var id = xp.getLocalId();
        if (this._extptmap[id]) {
          amp.LOG.error(jsx3._msg("amp.39", this, id));
        } else {
          amp.Engine._extendInstance(xp, node);
          this._extptmap[id] = xp;
          this._extpt.push(xp);
        }

      } else if (name == "extension") {
        var xClass = null;
        var xClassName = node.getAttribute("class");
        if (xClassName) {
          xClass = amp._getConstructor(xClassName);
          if (!xpClass)
            amp.LOG.error(jsx3._msg("amp.40", xClassName));
        }
        if (!xClass) xClass = amp.Ext;

        var x = new xClass(this, node);
        var id = x.getLocalId();
        if (id != null) {
          if (this._extmap[id]) {
            amp.LOG.error(jsx3._msg("amp.41", this, id));
          } else {
            this._extmap[id] = x;
          }
        }
        amp.Engine._extendInstance(x, node);
        this._ext.push(x);

      }
    }
  };
  
  /**
   * Called after this plug-in is instantiated to provide the plug-in with the engine that created it. This method
   * is optional for objects used as plug-ins.
   *
   * @param objEngine {jsx3.amp.Engine}
   */
  PlugIn_prototype.setEngine = function(objEngine) {
    /* @jsxobf-clobber */
    this._engine = objEngine;
  };
  
  /**
   * Called after this plug-in is instantiated to provide the plug-in with its path. This method
   * is optional for objects used as plug-ins.
   *
   * @param strPath {String}
   */
  PlugIn_prototype.setPath = function(strPath) {
    /* @jsxobf-clobber */
    this._path = strPath;
    /* @jsxobf-clobber */
    this._uri = new jsx3.net.URI(strPath + "/");
    /* @jsxobf-clobber */
    this._uriabs = jsx3.app.Browser.getLocation().resolve(this._uri);
  };
  
  /**
   * Called after this plug-in is instantiated to provide the plug-in with the resources defined in the 
   * configuration data. This method is optional for objects used as plug-ins.
   *
   * @param arrRsrc {Array<jsx3.amp.Resource>}
   */
  PlugIn_prototype.setResources = function(arrRsrc) {
    this._resources = jsx3.$A(arrRsrc);
    this._resourcemap = {};
    for (var i = 0; i < arrRsrc.length; i++) {
      var rsrc = arrRsrc[i];

      rsrc._setPlugInOnInit(this);
      if (!rsrc.isLoaded())
        rsrc.subscribe(amp.Resource.READY, this, "_onResourceReady");
      
      this._resourcemap[rsrc.getLocalId()] = rsrc;
    }
  };

  /**
   * Returns the id attribute from the plug-in configuration element.
   * @return {String}
   */
  PlugIn_prototype.getId = function() {
    return this._id;
  };

  /**
   * Returns whether this is a global plug-in. A global plug-in is only instantiated once for all of the
   * applications that register it.
   * @return {boolean}
   */
  PlugIn_prototype.isGlobal = function() {
    return this._global;
  };

  /**
   * Returns the name attribute from the plug-in configuration element.
   * @return {String}
   */
  PlugIn_prototype.getName = function() {
    return this._name;
  };

  /**
   * Returns the version attribute from the plug-in configuration element.
   * @return {String}
   */
  PlugIn_prototype.getVersion = function() {
    return this._version;
  };

  /**
   * Returns the resources of this plug-in that are defined in the plug-in configuration data.
   * @return {jsx3.$Array<jsx3.amp.Resource>}
   */
  PlugIn_prototype.getResources = function() {
    return this._resources;
  };

  /**
   * Returns the list of event subjects that this plug-in declares to publish.
   * @return {jsx3.$Array<String>}
   */
  PlugIn_prototype.getEvents = function() {
    return this._events;
  };

  /**
   * Returns a resource of this plug-in by its ID.
   * @param strId {String}
   * @return {jsx3.amp.Resource}
   */
  PlugIn_prototype.getResource = function(strId) {
    return this._resourcemap[strId];
  };
  
  /**
   * Returns the list of plug-in IDs that this plug-in requires. These plug-ins must be loaded before this plug-in
   * loads.
   * @return {jsx3.$Array<String>}
   */
  PlugIn_prototype.getRequires = function() {
    return this._req;
  };
  
  /**
   * Loads this plug-in asynchronously if it is not already loaded. 
   */
  PlugIn_prototype.load = jsx3.$Y(function(cb) {
    if (this._state == PlugIn.NOT_LOADED) {
      amp.LOG.debug(jsx3._msg("amp.42", this));
      this._state = PlugIn.LOADING;
      return this._engine._loadPlugIn(this);
    } else if (!this.isLoaded())
      this.subscribe(PlugIn.READY, jsx3.$F(cb.done).bind(cb));
    else
      cb.done();
  });
  
  PlugIn_prototype.loaded = jsx3.$Y(function(cb) {
    if (this.isLoaded()) {
      cb.done();
    } else {
      this.subscribe(PlugIn.READY, jsx3.$F(cb.done).bind(cb));
    }
  });

  /** @private @jsxobf-clobber */
  PlugIn_prototype._onResourceReady = function(objEvent) {
/*
    if (this._state != PlugIn.LOADED) {
      for (var i = 0; i < this._resources.length; i++) {
        var rsrc = this._resources[i];
        if (!rsrc.isLoaded() && rsrc.getLoadType() != amp.Resource.LOAD_MANUAL)
          return;
      }
      
      this._onLastResourceLoaded();
    }
*/
  };

  /** @private @jsxobf-clobber-shared */
  PlugIn_prototype._onLastResourceLoaded = function() {
    this._state = PlugIn.LOADED;

    this.onLoaded();
    this.publish({subject:PlugIn.READY});
  };
        
  /**
   * Returns true is all of the resources of this plug-in have loaded.
   * @return {boolean}
   */
  PlugIn_prototype.isLoaded = function() {
    return this._state == PlugIn.LOADED;
  };

  /**
   * Returns the engine of this plug-in.
   * @return {jsx3.amp.Engine}
   */
  PlugIn_prototype.getEngine = function() {
    return this._engine;
  };

  /**
   * Returns the server of the engine of this plug-in.
   * @return {jsx3.app.Server}
   */
  PlugIn_prototype.getServer = function() {
    return this._engine.getServer();
  };

  /**
   * Returns the extension points of this plug-in.
   * @return {jsx3.$Array<jsx3.amp.ExtPoint>}
   */
  PlugIn_prototype.getExtPoints = function() {
    return this._extpt;
  };

  /**
   * Returns an extension point of this plug-in by its ID.
   * @param strId {String} the local ID of the extension point.
   * @return {jsx3.amp.ExtPoint}
   */
  PlugIn_prototype.getExtPoint = function(strId) {
    return this._extptmap[strId];
  };

  /**
   * Adds an extension point to this plug-in programmatically. <code>xp.getPlugIn()</code> must return this plug-in.
   * @param xp {jsx3.amp.ExtPoint} the extension point to add.
   * @since 3.9
   */
  PlugIn_prototype.addExtPoint = function(xp) {
    var id = xp.getLocalId();
    this._extptmap[id] = xp;
    this._extpt.push(xp);
    this._engine._addExtPoint(xp);
  };

  /**
   * Removes an extension point from this plug-in programmatically. <code>xp</code> must be an extension point of
   * this plug-in.
   * @param xp {jsx3.amp.ExtPoint} the extension point of this plug-in to remove.
   * @since 3.9
   */
  PlugIn_prototype.removeExtPoint = function(xp) {
    var id = xp.getLocalId();
    if (xp === this._extptmap[id])
      delete this._extptmap[id];
    this._extpt.remove(xp);
    this._engine._removeExtPoint(xp);
  };

  /**
   * Adds an extension to this plug-in programmatically. <code>x.getPlugIn()</code> must return this plug-in.
   * @param x {jsx3.amp.Ext} the extension to add.
   * @since 3.9
   */
  PlugIn_prototype.addExt = function(x) {
    var id = x.getLocalId();
    if (id != null) {
      if (this._extmap[id]) {
        amp.LOG.error(jsx3._msg("amp.41", this, id));
      } else {
        this._extmap[id] = x;
      }
    }
    this._ext.push(x);
    this._engine._addExt(x, true);
  };

  /**
   * Removes an extension from this plug-in programmatically. <code>x</code> must be an extension of this plug-in.
   * @param x {jsx3.amp.Ext} the extension of this plug-in to remove.
   * @since 3.9
   */
  PlugIn_prototype.removeExt = function(x) {
    var id = x.getLocalId();
    if (x === this._extmap[id])
      delete this._extmap[id];
    this._ext.remove(x);
    this._engine._removeExt(x);
  };

  /**
   * Returns the extensions of this plug-in.
   * @return {jsx3.$Array<jsx3.amp.Ext>}
   */
  PlugIn_prototype.getExts = function() {
    return this._ext;
  };

  /**
   * Returns an extension of this plug-in by its ID.
   * @param strId {String} the local ID of the extension.
   * @return {jsx3.amp.Ext}
   */
  PlugIn_prototype.getExt = function(strId) {
    return this._extmap[strId];
  };

  /**
   * Calls when this plug-in is registered with its engine. Subclasses may override this method to provide custom
   * behavior.
   */
  PlugIn_prototype.onRegister = function() {
    ;
  };
  
  /**
   * Called when all the resources of this plug-in have loaded. Subclasses may override this method to provide custom
   * behavior.
   */
  PlugIn_prototype.onLoaded = function() {
    ;
  };
  
  /**
   * Called when the engine of this plug-in has completely registered all plug-ins. Subclasses may override this 
   * method to provide custom behavior.
   */
  PlugIn_prototype.onStartup = function() {
    ;
  };
  
  /**
   * Called (after this plug-in is instantiated) any time extensions are registered for an extension
   * point of this plug-in. Subclasses may override this method to provide custom behavior but should call
   * <code>jsxsuper</code> to ensure that the <code>EXTENDED</code> event is published.
   *
   * @param objExtPt {jsx3.amp.ExtPoint}
   * @param arrExts {Array<jsx3.amp.Ext>}
   */
  PlugIn_prototype.onExtension = function(objExtPt, arrExts) {
    this.publish({subject:PlugIn.EXTENDED, extpt:objExtPt, exts:arrExts});
  };

  /**
   * Implements <code>jsx3.net.URIResolver</code>.
   * @param strURI {String|jsx3.net.URI}
   * @return {jsx3.net.URI}
   */
  PlugIn_prototype.resolveURI = function(strURI) {
    var uri = jsx3.net.URI.valueOf(strURI);

    // Special handling of relative jsxapp:/path URIs
    if (uri.getScheme() == "jsxapp" && !uri.getHost())
      return this.getServer().resolveURI(uri.getPath().substring(1));
    
    if (!jsx3.net.URIResolver.isAbsoluteURI(uri))
      uri = this._uri.resolve(uri);

    return jsx3.net.URIResolver.DEFAULT.resolveURI(uri);
  };

  /**
   * Implements <code>jsx3.net.URIResolver</code>.
   * @return {String}
   */
  PlugIn_prototype.getUriPrefix = function() {
    return this._uri.toString();
  };

  /**
   * Implements <code>jsx3.net.URIResolver</code>.
   * @param strURI {String|jsx3.net.URI}
   * @param bRel {boolean}
   * @return {jsx3.net.URI}
   */
  PlugIn_prototype.relativizeURI = function(strURI, bRel) {
    var loc = jsx3.app.Browser.getLocation();
    var relative = this._uriabs.relativize(loc.resolve(strURI));

    if (relative.isAbsolute() || bRel)
      return relative;
    else
      return jsx3.net.URI.fromParts("jsxplugin", null, this.getId(), null, 
          "/" + relative.getPath(), relative.getQuery(), relative.getFragment());
  };

  PlugIn_prototype.toString = function() {
    return this._id;
  };

  /**
   * Returns a logger for this plug-in.
   * @return {jsx3.util.Logger}
   */
  PlugIn_prototype.getLog = function() {
    return jsx3.util.Logger.getLogger(this.getId());
  };

  /**
   * Loads the contents of a plug-in resource as a GUI component. The resource should be an XML resource whose
   * data is a GI component file. The resource must be already loaded to call this method. This method loads the
   * component with this plug-in as the URI resolver. Therefore, any relative paths in the component will be
   * resolved relative to the directory of this plug-in.
   * <p/>
   * Once the component is loaded, this method defines a <code>getPlugIn()</code> method on the root component object
   * that returns this component. In addition, if the root component object defines an <code>onRsrcLoad()</code>
   * method, that method is called.
   *
   * @param strRsrcId {String | jsx3.amp.Resource}
   * @param objParent {jsx3.app.Model} the GUI component into which to load the resource.
   * @param bPaint {boolean} whether to paint the loaded resource (default is <code>true</code>).
   * @return {jsx3.app.Model} the loaded component.
   */
  PlugIn_prototype.loadRsrcComponent = function(strRsrcId, objParent, bPaint) {
    if (!objParent)
      throw new jsx3.Exception("Parent container not specified for loading resource " + strRsrcId + ".");

    var rsrc = strRsrcId instanceof amp.Resource ? strRsrcId : this.getResource(strRsrcId);

    if (!rsrc)
      throw new jsx3.Exception("No resource " + strRsrcId + " in plug-in " + this + ".");

    var content = objParent.loadXML(rsrc.getData(), false, this);
    content.getPlugIn = jsx3.$F(function() { return this; }).bind(this);
    if (content.onRsrcLoad) {
      try {
        content.onRsrcLoad();
      } catch (e) {
        amp.LOG.error(jsx3._msg("amp.44", strRsrcId), jsx3.NativeError.wrap(e));
      }
    }

    if (bPaint !== false)
      objParent.paintChild(content);
    
    return content;
  };

  /**
   * Returns <code>true</code> if <code>e</code> is a binding expression. A binding expression starts with '{'
   * and ends with '}'.
   * @param e {String}
   */
  PlugIn.isBindExpr = function(e) {
    return e.indexOf("{") == 0 && jsx3.$S(e).endsWith("}");
  };

  /**
   * Registers a function to be called when the value of a binding expression changes.
   * <p/>
   * The binding expression should begin with a '{' and end with a '}'. The expression is parsed for any tokens that
   * match a bindable property of this object. <code>handler</code> will be invoked any time one of these
   * bindable properties changes value. This function is passed the value of the binding expression. The binding
   * expression is evaluated in the context of this object. The "this" keyword is optional in the expression
   * because the expression is evaluated inside of a <code>with</code> block.
   *
   * @param expression {String} a valid binding expression.
   * @param handler {Function}
   * @see #isExpression()
   */
  PlugIn_prototype.regBindExpr = function(expression, handler) {
    var expr = expression.substring(1, expression.length - 1);
    var index = jsx3.$H(expr.split(/[^\w\$]+/g));
    var propIds = this.getBindableProps().filter(function(e) { return index[e]; });

    var onChange = jsx3.$F(function() {
      var v = this.eval("with(this){" + expr + "}");
      handler(v);
    }).bind(this);

    if (propIds.length > 0) {
      propIds.each(jsx3.$F(function(e) {
        this.subscribe(e, onChange);
      }).bind(this));
    }

    onChange();
  };

});

/**
 * A type of plug-in that loads a JSX class. The class must be loaded by default or contained in its own JavaScript
 * class file in the <code>jsx:/js/</code> classpath. 
 *
 * @package
 */
jsx3.lang.Class.defineClass("jsx3.amp.ClassPlugIn", jsx3.amp.PlugIn, null, function(ClassPlugIn, ClassPlugIn_prototype) {

  var amp = jsx3.amp;

  ClassPlugIn_prototype.isLoaded = function() {
    return jsx3.Class.forName(this.getId()) != null;
  };

  ClassPlugIn_prototype.setResource = function(arrRsrc) {
  };

  ClassPlugIn_prototype.getResources = function() {
    if (!this._resources || this._resources.length == 0) {
      var r = new amp.Resource(this, "class",
          {"@path":"jsx:/js/" + this.getId().replace(/\./g, "/") + ".js", "name()":"script"});
      this._resources = jsx3.$A([r]);
    }

    return this._resources;
  };

});
