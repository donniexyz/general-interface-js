/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _jsxns _jsxroots

/**
 * The controller of the JSX architecture.
 */
jsx3.Class.defineClass("jsx3.app.Server", null, [jsx3.util.EventDispatcher, jsx3.net.URIResolver/*, jsx3.gui.Alerts*/],
    function(Server, Server_prototype) {

  jsx3.util.EventDispatcher.jsxclass.mixin(Server);

  var Event = jsx3.gui.Event;
  var URIResolver = jsx3.net.URIResolver;
  var Browser = jsx3.app.Browser;
  var Block = null;

  var LOG = jsx3.util.Logger.getLogger(Server.jsxclass.getName());

  /** @package */
  Server.Z_DIALOG = 2;
  /** @package */
  Server.Z_DRAG = 3;
  /** @package */
  Server.Z_MENU = 4;

  /**
   * {String} The subject of an event that <code>jsx3.app.Server</code> publishes when an instance of this class
   *    is created. The target of the event object is the initialized server.
   */
  Server.INITED = "inited";

  /**
   * {String} The subject of an event that instances of this class publish when a context help hot key is pressed
   *    in the context of a DOM node that has a help ID. The event has the following fields:
   *    <ul>
   *      <li><code>target</code> - the server publishing the event.</li>
   *      <li><code>model</code> - the DOM node that received the key event.</li>
   *      <li><code>helpid</code> - the help ID of the nearest ancestor of <code>model</code> that defines a help ID.</li>
   *    </ul>
   *
   * @see jsx3.app.Model#getHelpId()
   * @since 3.5
   */
  Server.HELP = "help";

  /** @private @jsxobf-clobber @jsxobf-final */
  Server._DIVID = "JSX";

  /**
   * {jsx3.util.List<jsx3.app.Server>} a list of all instances of this class
   * @private
   * @jsxobf-clobber
   */
  Server._INSTANCES = new jsx3.util.List();

  /**
   * {jsx3.gui.Block}
   * @deprecated  Use <code>Server.getRootBlock()</code>
   * @see #getRootBlock()
   */
  Server_prototype.JSXROOT = null;

  /**
   * {jsx3.gui.Block}
   * @deprecated  Use <code>Server.getBodyBlock()</code>
   * @see #getBodyBlock()
   */
  Server_prototype.JSXBODY = null;

  /**
   * {jsx3.app.Cache}
   * @deprecated  Use <code>Server.getCache()</code>
   * @see #getCache()
   */
  Server_prototype.Cache = null;

  /**
   * {Object<String, String>}
   * @deprecated  Use <code>Server.getEnv()</code>
   * @see #getEnv()
   */
  Server_prototype.ENVIRONMENT = null;

  /**
   * {jsx3.app.DOM}
   * @deprecated  Use <code>Server.getDOM()</code>
   * @see #getDOM()
   */
  Server_prototype.DOM = null;

  /**
   * {jsx3.app.Properties}
   * @private
   */
  Server_prototype.JSS = null;

  /**
   * Sets environment variables used by this class (the controller for the JSX architecture)
   * @param strAppPath {String} URL (either relative or absolute) for the application to load
   * @param objGUI {HTMLElement} the browser element (body, div, span, td, etc) into which the GI application should load
   * @param bPaint {boolean} false if null; if true, the application VIEW will immediately be generated.
   * @param-package objEnv {Object}
   */
  Server_prototype.init = function(strAppPath, objGUI, bPaint, objEnv) {
    //instance a new DOM controller for this server instance that will track and manage JSX GUI and Data objects
    this.DOM = new jsx3.app.DOM();

    //instance the cache controller -- although this object is little-changed, its recommended use is much more limited and can merely be thought of as a simplified way to cache an XML document or system XSLT
    this.Cache = new jsx3.app.Cache();
    this.Cache.addParent(jsx3.getSharedCache());

    if (objEnv) {
      if (objEnv.jsxsettings) {
        this._jsxsettings = objEnv.jsxsettings;
        delete objEnv.jsxsettings;
      }

      var temp = {};
      for (var f in objEnv)
        temp[f.toLowerCase()] = objEnv[f];
      objEnv = temp;
    } else {
      objEnv = {};
    }

    this.ENVIRONMENT = objEnv;
    objEnv.apppath = strAppPath.replace(/\/*$/, "");

    //load the application config file, so we know which resource files (JS, CSS, XML, etc) to load
    var objSettings = this.getSettings();

    var settingsTree = objSettings.get();

    for (var f in settingsTree) {
      var key = f.toLowerCase();
      if (typeof(objEnv[key]) == "undefined" && typeof(settingsTree[f]) != "object") {
        objEnv[key] = settingsTree[f];
      }
    }

    // figure out path to resources, support for environment variable jsxappbase which is a relative (or absolute)
    // path from the config.xml file to the content root of the application
    objEnv.apppathuri = new jsx3.net.URI(objEnv.apppath + "/");
    if (objEnv.jsxappbase)
      objEnv.apppathuri = objEnv.apppathuri.resolve(objEnv.jsxappbase);

    var i = objEnv.apppath.indexOf(jsx3.APP_DIR_NAME);
    if (i >= 0)
      objEnv.apppathrel = objEnv.apppath.substring(i + jsx3.APP_DIR_NAME.length + 1);
    objEnv.apppathabs = Browser.getLocation().resolve(objEnv.apppathuri);

    if (objEnv['liquid'] == null) objEnv['liquid'] = true;
/* @JSC :: begin DEP */
    if (objEnv['eventsvers'] == null) objEnv['eventsvers'] = 3.0;
/* @JSC :: end */
    if (objEnv['jsxversion'] == null) objEnv['jsxversion'] = "3.1";

    objEnv.abspath = jsx3.getEnv("jsxabspath");
    objEnv.guiref = objGUI;            //object ref to on-screen containing object (div, td, span, etc)
    objEnv.namespace = objEnv.jsxappns || objEnv.namespace;

    if (objEnv.namespace == null)
      throw new jsx3.Exception(jsx3._msg("serv.no_ns", strAppPath));
    
    if (objGUI && this.getEnv("caption"))
      objGUI.ownerDocument.title = this.getEnv("caption");

    // implicitly cancel (trap) all right-click events unless explictly told not to
    if (objGUI && this.getEnv("cancelrightclick"))
      objGUI.ownerDocument.oncontextmenu = new Function("return false;");

    // implicitly cancel (trap) all browser-native errors unless explictly told not to
    if (this.getEnv("cancelerror"))
      jsx3.NativeError.initErrorCapture();

    // add this to the list of all instances
    Server._INSTANCES.add(this);

    //bind a reference to this jsxserver instance to the top-level window, using the declared namespace for this server; this provides a global handle to the server by name and is critical to backwards compatibility
    jsx3.registerApp(this);

    //create JSS MODEL CONTAINER (the dynamic properties object array)
    this.JSS = new jsx3.app.Properties();
    this.LJSS = new jsx3.app.Properties();
    this.JSS.addParent(this.LJSS); // add localized properties to the tree
    this.JSS.addParent(jsx3.System.JSS); // copy system JSS properties into this server

    Server.publish({subject: Server.INITED, target:this});

    //7) if specified, immediately render the view (typically only happens if the user chooses to initialize a new server AFTER the document BODY has fully loaded
    if (bPaint) this.paint();
  };

  /** @private @jsxobf-clobber */
  Server_prototype._createRootAndBody = function() {
    jsx3.require("jsx3.gui.Block");
    Block = jsx3.gui.Block;

    if (this.JSXROOT) return;

    // always create root and body; even though the app might not have a VIEW, it still may want access to the MODEL --
    // even for GUI objects
    var root = this.JSXROOT = this._createRoot("JSXROOT");
    root.setDynamicProperty("jsxbgcolor","@Solid DarkShadow");
    root.setRelativePosition(Block.ABSOLUTE);
    root.setOverflow(Block.OVERFLOWEXPAND);
    root.setAlwaysCheckHotKeys(true);
    root.setIndex(1);

    var body = this.JSXBODY = new Block("JSXBODY",0,0,"100%","100%","");
    body.setDynamicProperty("jsxbgcolor","@Solid Light");
    body.setRelativePosition(Block.ABSOLUTE);
    body.setZIndex(1);
    body.setOverflow(Block.OVERFLOWEXPAND).setIndex(0);
    root.setChild(body);
  };

  /**
   * Subscribed function that is notified whenever a window resize event fires.
   * @private
   */
  Server_prototype.onResize = function() {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    //use delay in IE to stop CPU thrashing
    window.clearTimeout(this.resize_timeout_id);
    var my = this;
    this.resize_timeout_id = window.setTimeout(function() { my._onResizeDelay(); }, 250);
/* @JSC */ } else {
    this._onResizeDelay();
/* @JSC */ }
  };

  /**
   * Called by onResize; begins the actual propogation of the resize adjustment
   * @private
   * @jsxobf-clobber
   */
  Server_prototype._onResizeDelay = function() {
    //jsx3.util.Logger.getLogger("jsx3.boxmodel").trace("RESIZE " + this.getClass() + ": [" + this.getEnv("NAMESPACE") + "]");

    //get the HTML element that contains this server instance
    var objGUI = this.getEnv("GUIREF");

    //tell the root block to update its profile
    if(objGUI) {
      this.getRootBlock().syncBoxProfile({left:0,top:0,parentwidth:objGUI.clientWidth,parentheight:objGUI.clientHeight}, true);
    }
  };

  /** @package */
  Server_prototype.getNextZIndex = function(intType) {
    if (this.ZRANGE == null) {
      /* @jsxobf-clobber */
      this.ZRANGE = [];
      this.ZRANGE[0] = 0;
      this.ZRANGE[1] = 1000;
      this.ZRANGE[Server.Z_DIALOG] = 5000;
      this.ZRANGE[Server.Z_DRAG] = 7500;
      this.ZRANGE[Server.Z_MENU] = 10000;
      this.ZRANGE[5] = 25000;
    }

    return this.ZRANGE[intType]++;
  };

  /**
   * @package
   */
  Server.allServers = function() {
    return Server._INSTANCES.toArray();
  };

  /**
   * create a root block that does not need to be bound to a parent
   * @param strName {String} name of the server (jsxname property for the block)
   * @return {jsx3.gui.Block} jsx3.gui.Block instance
   * @private
   * @jsxobf-clobber
   */
  Server_prototype._createRoot = function(strName) {
    if (this._jsxroots == null) this._jsxroots = [];

    var root = new Block(strName, 0, 0, "100%", "100%", "");
    root._jsxns = this.getEnv("NAMESPACE");
    root._jsxid = jsx3.app.DOM.newId(this.getEnv("NAMESPACE"));
    root._jsxserver = this;
    this.DOM.add(root);

    this._jsxroots.push(root);
    return root;
  };

  /**
   * @package
   */
  Server_prototype.getInvisibleRoot = function() {
    if (this.INVISIBLE == null)
      this.INVISIBLE = this._createRoot("JSXINVISIBLE");
    return this.INVISIBLE;
  };

  /**
   * Returns the value of an environment variable of this server. Valid keys correspond to deployment options and
   * include:
   * <ul>
   * <li>VERSION</li>
   * <li>APPPATH</li>
   * <li>ABSPATH</li>
   * <li>CAPTION</li>
   * <li>MODE</li>
   * <li>SYSTEM</li>
   * <li>NAMESPACE</li>
   * <li>CANCELERROR</li>
   * <li>CANCELRIGHTCLICK</li>
   * <li>BODYHOTKEYS</li>
   * <li>WIDTH</li>
   * <li>HEIGHT</li>
   * <li>LEFT</li>
   * <li>TOP</li>
   * <li>POSITION</li>
   * <li>OVERFLOW</li>
   * <li>UNICODE</li>
   * <li>EVENTSVERS</li>
   * </ul>
   * Other environment variables may be set either by query parameters in the launch page URL, by attributes
   * on the GI <b>script</b> tag, or by entries in the server's <code>config.xml</code> file. Server environment
   * variable keys must either begin with <code>"jsxapp"</code> or must not begin with <code>"jsx"</code>.
   *
   * @param strEnvKey {String} the case-insensitive key of the environment variable to return.
   * @return {String}
   * @see jsx3#getEnv()
   */
  Server_prototype.getEnv = function(strEnvKey) {
    var e = this.ENVIRONMENT;
    return e[strEnvKey] || e[strEnvKey.toLowerCase()];
  };

  /**
   * Displays a spyglass showing the environment profile for the given app
   * @private
   * @jsxobf-clobber
   */
  Server._showEnv = function(objEvent) {
    //get the relevant variables to profile
    var s = ['<div class="jsx30block jsx30env">'];
    s.push('<b>Version:</b> ', '@gi.version.full@', '<br/>');
    s.push('<b>XML Version:</b> ', jsx3.getXmlVersion(), '<br/>');
    s.push('<b>System Locale:</b> ', jsx3.System.getLocale().getDisplayName(), '<br/>');
    s.push('<b>Browser:</b> ', jsx3.CLASS_LOADER + '<br/>');
    s.push('<b>Operating System:</b> ', jsx3.app.Browser.getSystem() + " (" + navigator.userAgent + ")");
    s.push('<hr/>');

    var root = null;

    var servers = Server.allServers();
    for (var i = 0; i < servers.length; i++) {
      var server = servers[i];
      s.push("<b>", server.getEnv("namespace"), "</b>", "<div>");
      s.push('<b>Path:</b> ', server.getAppPath(), '<br/>');
      s.push('<b>Version:</b> ', server.getEnv("version"), '<br/>');
      s.push("</div>");

      if (root == null) {
        root = server.getRootBlock();
        if (root.getRendered() == null) root = null;
      }
    }

    s.push('</div>');
    s = s.join("");

    if (root)
      root.showSpy(s, Math.round(root.getRendered().clientWidth/2), Math.round(root.getRendered().clientHeight/2-100));
    else window.alert(s);
  };

  /**
   * Returns the settings of this server/project per config.xml
   * @return {jsx3.app.Settings}
   */
  Server_prototype.getSettings = function() {
    if (this._jsxsettings == null) {
      var objXML = this.getCache().getOrOpenDocument(jsx3.resolveURI(this.getAppPath() + "/" + jsx3.CONFIG_FILE), "JSX_SETTINGS");
      if (objXML.hasError()) {
        LOG.error(jsx3._msg("serv.err_set", this, objXML.getError()));
        objXML = null;
      }
      /* @jsxobf-clobber */
      this._jsxsettings = new jsx3.app.Settings(objXML);
    }
    return this._jsxsettings;
  };

  Server_prototype.getAppPath = function() {
    return this.getEnv("apppath");
  };

  /** @private @jsxobf-clobber */
  Server._taskBarFinder = function(obj) {
    return (obj instanceof jsx3.gui.WindowBar) && obj.getType() == jsx3.gui.WindowBar.TYPETASK;
  };

  /**
   * Returns handle to a descendant taskbar belonging to this server instance (this is where JSXDialog instances will try to minimize to if it exists); returns null if none found;
   *            if no taskbar is found, dialogs are not minimized, but are 'window shaded'&#8212;like a Mac used to do
   * @param objJSX {jsx3.app.Model} if null, this.JSXROOT is assumed; otherwise the object in the DOM from which to start looking for a descendant taskbar (a jsx3.gui.WindowBar instance)
   * @return {jsx3.gui.WindowBar}
   */
  Server_prototype.getTaskBar = function(objJSX) {
    if (! jsx3.gui.WindowBar) return null;
    if (objJSX == null) objJSX = this.JSXROOT;
    return objJSX.findDescendants(Server._taskBarFinder, false, false, false, true);
  };

  /**
   * call to shut down a server instance and free up resources used by the server (cache,dom,etc)
   */
  Server_prototype.destroy = function() {
    var unloadScript = this.getEnv("onunload");
    if (unloadScript) {
      try {
        this.eval(unloadScript);
      } catch (e) {
        LOG.error(jsx3._msg("serv.err_onun", this), jsx3.NativeError.wrap(e));
      }
    }

    //unsubscribe self from the box profiler
    if (jsx3.Class.forName("jsx3.gui.Painted"))
      jsx3.gui.Painted.Box.unregisterServer(this,this.getEnv("LIQUID"));

    //destroy root view (JSXROOT)
    if (this.JSXROOT) {
      var objGUI = this.JSXROOT.getRendered();
      if (objGUI) {
        //depending upon the server mode (ide or runtime), the outer container may or may not be present
        if (objGUI.parentNode.id == Server._DIVID)
          objGUI = objGUI.parentNode;
        jsx3.html.removeNode(objGUI);
      }
    }

    //free-up GUI objects belonging to the various roots
    if (this._jsxroots) {
      for (var i = 0; i < this._jsxroots.length; i++) {
        var root = this._jsxroots[i];
        root.removeChildren();
      }
    }
    delete this._jsxroots;

    //shut down subscriptions to dom and cache
    this.DOM.unsubscribeAllFromAll();
    this.DOM.destroy();

    //free-up xml resources
    this.Cache.unsubscribeAll(jsx3.app.Cache.CHANGE);
    this.Cache.destroy();

    //remove ref to this server
    jsx3.deregisterApp(this);

    // remove instance from list of all Server instances
    Server._INSTANCES.remove(this);

    // uncapture BODY keydown
    Event.unsubscribe(Event.KEYDOWN, this, "checkHotKeys");

    this.ENVIRONMENT = {};
  };

  /**
   * Paints this application and its default component into the application view port on the host HTML page. The
   * system class loader calls this method once all the required resources of the application have loaded. The
   * order of actions taken by this method is:
   * <ol>
   *   <li>Load the default component file</li>
   *   <li>Execute the onload script for the application</li>
   *   <li>Paint the default component in the view port</li>
   * </ol>
   *
   * @param-package objXML {jsx3.xml.Document} the pre-loaded default component document.
   */
  Server_prototype.paint = function(objXML) {
    jsx3.require("jsx3.gui.Alerts", "jsx3.gui.Block");
    Block = jsx3.gui.Block;

    // make sure that Server implements jsx3.gui.Alerts before painting
    if (! jsx3.gui.Alerts.jsxclass.isAssignableFrom(Server.jsxclass))
      Server.jsxclass.addInterface(jsx3.gui.Alerts.jsxclass);

    //3) register the browser mode
    jsx3.html.getMode(this.getEnv("GUIREF"));

    //4) generate the initial DOM structure (JSXROOT AND JSXBODY)
    this._createRootAndBody();

    //5) register the server with the box manager; pass the liquid mode (true or false)
    jsx3.gui.Painted.Box.registerServer(this, this.getEnv("LIQUID"));

    if (this.getEnv("BODYHOTKEYS"))
      Event.subscribe(Event.KEYDOWN, this, "checkHotKeys");

    // Register ctrl+alt+shift+j to show the server environment
    var showEnv = "_showEnv";
    this.registerHotKey(new Function("jsx3.app.Server." + showEnv + "();"), 74, true, true, true);
    // Register the esc key to abort DnD
    this.registerHotKey(new Function("if (jsx3.EventHelp.isDragging()) jsx3.EventHelp.reset();"), Event.KEY_ESCAPE, false, false, false);
    // Register context-sensitive help system
    this._regHelpKey();

    //validate that the GUI container to place our app inside is not a null reference
    var objGUI = this.getEnv("GUIREF");

    if (objGUI) {
      //derive overflow settings for the outermost app container
      var strOverflow = "";
      var of = this.getEnv("OVERFLOW");
      if (of == Block.OVERFLOWSCROLL) {
        strOverflow = "overflow:auto;";
      } else if (of == Block.OVERFLOWHIDDEN) {
        strOverflow = "overflow:hidden;";
      }

      //derive position settings
      var strPosition, strLeft = "", strTop = "";
      if (this.getEnv("POSITION") == 0) {
        strPosition = "relative";
      } else {
        strPosition = "absolute";
        strLeft = "left:" + this.getEnv("LEFT") + ";";
        strTop = "top:" + this.getEnv("TOP") + ";";
      }
      var strWidth = "width:" + this.getEnv("WIDTH") + ";";
      var strHeight = "height:" + this.getEnv("HEIGHT") + ";";

      //generate initial application container
      objGUI.innerHTML = '<div id="' + Server._DIVID + '" style="position:' + strPosition + ';' + strOverflow +
          strLeft + strTop + strWidth + strHeight + '"></div>';
      objGUI = objGUI.lastChild;

      objGUI.className = jsx3.CLASS_LOADER.getCssClass();

      //initialize the box profile for root (this is how the box profiling is first initiated); basically pass the drawspace that root should live within
      this.JSXROOT.syncBoxProfileSync({left:0,top:0,parentwidth:objGUI.clientWidth,parentheight:objGUI.clientHeight});

      if (objGUI)
        objGUI.innerHTML = this.JSXROOT.paint();
    }

    try {
      //call _doLoad (regardless of whether or not there is a view component for this server instance, still try to initialize the environment
      this._doLoad(objXML);
    } catch (e) {
      LOG.fatal(jsx3._msg("serv.err_paint", this), jsx3.NativeError.wrap(e));
    }

    try {
      //initialize the on load script now that all files, includes, and object sets have been loaded
      this.eval(this.getEnv("onload"));
    } catch (e) {
      LOG.fatal(jsx3._msg("serv.err_onload", this), jsx3.NativeError.wrap(e));
    }
  };

  /** @package */
  Server_prototype._regHelpKey = function() {
    var helpKey = this.getDynamicProperty("jsx3.app.Server.help." + jsx3.app.Browser.getSystem()) ||
                  this.getDynamicProperty("jsx3.app.Server.help");
    if (helpKey)
      this.registerHotKey(jsx3.gui.HotKey.valueOf(helpKey, jsx3.makeCallback("_onHelpKey", this)));
  };

  /**
   * called by [this].paint().  Deserializes any designated component and fires the onLoad script for the application
   *            At runtime, the body's onload event calls [this].paint() which then calls [this]._doLoad() which then fires the
   *            the onLoad script for the application.
   * @private
   * @jsxobf-clobber-shared
   */
  Server_prototype._doLoad = function(objXML) {
    var child = null;

    if (objXML) {
      child = this.JSXBODY.loadXML(objXML, true);
    } else {
      var strComponentURL = this.getEnv("objectseturl");

      if (strComponentURL)
        child = this.JSXBODY.load(strComponentURL, true);
    }

    if (child)
      child.setPersistence(jsx3.app.Model.PERSISTEMBED);
  };

  /**
   * set all four dimensions for a jsx3.Server instance, allowing the developer to adjust the width/height/left/width for the server. Must be called during/after the onload event for the server instance as it affects the VIEW for the server.  Updates the absolutely positioned element that contains JSXROOT.
   * @param left {int/Array} the new left value or a JavaScript array containing all four new values (in pixels)
   * @param top {int} the new top value (in pixels)
   * @param width {int} the new width value (in pixels)
   * @param height {int} the new height value (in pixels)
   */
  Server_prototype.setDimensions = function(left, top, width, height) {
    //convert array to ints
    if (jsx3.$A.is(left)) {
      top = left[1];
      width = left[2];
      height = left[3];
      left = left[0];
    }

    var objGUI = this.JSXROOT.getRendered();
    if (objGUI) {
      if (left) objGUI.parentNode.style.left = left + "px";
      if (top) objGUI.parentNode.style.top = top + "px";
      if (width) objGUI.parentNode.style.width = width + "px";
      if (height) objGUI.parentNode.style.height = height + "px";
    }
  };

  /**
   * Loads an external resource into this server instance. What this method does depends on the <code>strType</code>
   * parameter.
   * <ul>
   *   <li><code>script</code> - Loads a JavaScript file asynchronously into the memory space of the page hosting this
   *       application; returns <code>null</code>.</li>
   *   <li><code>css</code> - Loads a CSS file asynchronously into the memory space of the page hosting this
   *       application; returns <code>null</code>.</li>
   *   <li><code>xml</code> or <code>xsl</code> - Loads an XML file synchronously into the XML cache of this
   *       application; returns the loaded <code>jsx3.xml.Document</code> instance.</li>
   *   <li><code>jss</code> or <code>ljss</code> - Loads a dynamic properties file or localized properties bundle
   *       synchronously into this application; returns <code>null</code>.</li>
   *   <li><code>services</code> - Loads and parses a mapping rules file synchronously; returns a new instance of
   *       <code>jsx3.net.Service</code>.</li>
   * </ul>
   *
   * @param strSrc {String|jsx3.net.URI} the path to the resource.
   * @param strId {String} the unique identifier of the resource. A resource loaded by this method may clobber
   *    a previously loaded resource of the same type and id.
   * @param strType {String} the type of include, one of: <code>css</code>, <code>jss</code>, <code>xml</code>,
   *    <code>xsl</code>, <code>script</code> (for JavaScript), <code>services</code> (for mapping rules),
   *    or <code>ljss</code>.
   * @param bReload {String} if <code>true</code>, a JavaScript or CSS file is reloaded from the remote server
   *    without checking the local browser cache. Other types of resources are not affected by this parameter.
   * @return {jsx3.xml.Document | jsx3.net.Service | null} the return type depends on the <code>strType</code>
   *    parameter. See the method description.
   * @throws {jsx3.IllegalArgumentException}  if <code>strType</code> in not a valid type.
   */
  Server_prototype.loadInclude = function(strSrc, strId, strType, bReload) {
    //resolve id to an empty string if not passed
    if (strId == null) strId = "";

    //create query string to force the browser to reload this resource from the remote server unless set to never reload
    var strAppend = (bReload) ? ((((strSrc+"").indexOf("?") == -1)?"?":"&") + (new Date()).valueOf()) : "";

    //branch based on file type
    if (strType == "css") {
      jsx3.CLASS_LOADER.loadResource(strSrc + strAppend, strId, strType);
    } else if (strType == "jss" || (strType == "ljss" && !jsx3.app.PropsBundle)) {
      var jssDoc = this.Cache.openDocument(strSrc, strId);

      if (jssDoc.hasError()) {
        jsx3.util.Logger.GLOBAL.error(jsx3._msg("serv.err_jss", + strSrc, jssDoc.getError()));
      } else {
        this.getProperties().loadXML(jssDoc, strId);
      }
    } else if (strType == "ljss") {
      var objCache = this.getCache();
      if (bReload) {
        var p = this.LJSS.getParents();
        for (var i = 0; i < p.length; i++) {
          if (p[i].getPath() == strSrc)
            this.LJSS.removeParent(p[i]);
        }
        
        jsx3.app.PropsBundle.clearCache(strSrc, objCache);
      }

      this.LJSS.addParent(jsx3.app.PropsBundle.getPropsFT(strSrc, this.getLocale(), objCache));
    } else if (strType == "xml" || strType == "xsl") {
      return this.Cache.openDocument(strSrc, strId);
    } else if (strType == "script") {
      //try to remove existing script
      this.unloadInclude(strId);
      jsx3.CLASS_LOADER.loadResource(strSrc + strAppend, strId, strType);
    } else if (strType == "services") {
      jsx3.require("jsx3.net.Service");
      return (new jsx3.net.Service(strSrc)).setNamespace(this);
    } else {
      throw new jsx3.IllegalArgumentException('strType', strType);
    }
  };

  /**
   * Removes a loaded JavaScript or CSS resource from the browser DOM.
   * @param strId {String} the id used when loading the resource.
   * @see #loadInclude()
   */
  Server_prototype.unloadInclude = function(strId) {
    var objInclude = this.getRootDocument().getElementById(strId);
    try {
      if (objInclude) objInclude.parentNode.removeChild(objInclude);
    } catch (e) {
      LOG.warn(jsx3._msg("serv.err_unload", strId, this), jsx3.NativeError.wrap(e));
    }
  };

  /**
   * Loads an application resource. This method looks up a resource registered with this application by its id.
   * The resource must be registered in the <code>config.xml</code> file of this application.
   *
   * @param strId {String} unique identifier for the resource (its unique id as an application resource file).
   * @return {jsx3.xml.Document | jsx3.net.Service | null} the return type depends on the type of resource.
   *    See the documentation for <code>loadInclude()</code> for more information.
   * @see #loadInclude()
   */
  Server_prototype.loadResource = function(strId) {
    var objSettings = this.getSettings();
    var includes = jsx3.util.List.wrap(objSettings.get('includes')).filter(function(x) { return x.id == strId; }).toArray(true);

    var lastInclude;
    for (var i = 0; i < includes.length; i++) {
      var include = includes[i];
      lastInclude = this.loadInclude(this.resolveURI(include.src), include.id, include.type);
    }

    if (includes.length == 0)
      LOG.warn(jsx3._msg("serv.err_badid", strId));

    return lastInclude;
  };

  /**
   * updates a single dynamic style property; dynamic properties are used by jsx3.gui.Block objects that extend the astract class, jsx3.gui.Block;
   * @param strPropName {String} id for this dynamic property among all properties
   * @param vntValue {String} value of the property; if null, the property with the name, @strPropName will be removed
   */
  Server_prototype.setDynamicProperty = function(strPropName, vntValue) {
    var jss = this.getProperties();
    jss.set(strPropName, vntValue);
  };

  /**
   * Returns the value of the dynamic property @strPropName
   * @param strPropName {String} id for this dynamic property among all properties
   * @param strToken {String...} if present tokens such as {0}, {1}, {n} will be replaced with the nth element of this vararg array
   * @return {String} value of the property
   */
  Server_prototype.getDynamicProperty = function(strPropName, strToken) {
    var value = this.getProperties().get(strPropName);

    // jsx3.util.MessageFormat class is optional, should work without it
    if (arguments.length > 1 && jsx3.util.MessageFormat) {
      try {
        var format = new jsx3.util.MessageFormat(value);
        var args = new Array(arguments.length - 1);
        for (var i = 1; i < arguments.length; i++)
          args[i-1] = arguments[i];
        return format.format(args);
      } catch (e) {;}
    }

    return value;
  };

  /**
   * Sets a Cookie with the given name and value
   * @param name {String} name of the cookie
   * @param value {String} value of the cookie
   * @param expires {Date} valid jscript date object. for example: new Date("11:59:59 12-31-2004")
   * @param path {String} path where the cookie is valid (default: path of calling document)
   * @param domain {String} domain where the cookie is valid (default: domain of calling document)
   * @param secure {boolean} valid jscript date object. for example: new Date("11:59:59 12-31-2004")
   */
  Server_prototype.setCookie = function(name, value, expires, path, domain, secure, bRaw) {
    this.getRootDocument().cookie = name + "=" + (bRaw ? value : escape(value)) +
        ((expires) ? "; expires=" + expires.toGMTString() : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
  };

  /**
   * Returns the value for the Cookie with the given @name
   * @param name {String} name of the cookie
   * @return {String}
   */
  Server_prototype.getCookie = function(name, bRaw) {
    var doc = this.getRootDocument();

    var dc = doc.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
      begin = dc.indexOf(prefix);
      if (begin != 0) return null;
    } else {
      begin += 2;
    }

    var end = doc.cookie.indexOf(";", begin);
    if (end == -1) {
      end = dc.length;
    }

  var raw = dc.substring(begin + prefix.length, end);
    return bRaw ? raw : unescape(raw);
  };

  /**
   * delete a cookie
   * @param name {String} name of the cookie
   * @param path {String} path where the cookie is valid (default: path of calling document)
   * @param domain {String} domain where the cookie is valid (default: domain of calling document)
   */
  Server_prototype.deleteCookie = function(name, path, domain) {
    this.setCookie(name, "", new Date(1970,0,1), path, domain);
  };

  /**
   * Returns the root block for this server (JSXROOT)
   * @return {jsx3.gui.Block}
   */
  Server_prototype.getRootBlock = function() {
    if (this.JSXROOT == null) this._createRootAndBody();
    return this.JSXROOT;
  };

  /**
   * To implement jsx3.gui.Alerts interface.
   * @return {jsx3.app.Model} the root block.
   */
  Server_prototype.getAlertsParent = function() {
    return this.getRootBlock();
  };

  /**
   * Returns the body block for this server (JSXBODY)
   * @return {jsx3.gui.Block}
   */
  Server_prototype.getBodyBlock = function() {
    if (this.JSXROOT == null) this._createRootAndBody();
    return this.JSXBODY;
  };

  /**
   * Returns the list of objects that are children of the body object. These are the root objects
   *     in a serialization file and the root nodes in the Component Hierarchy palette.
   * @return {Array<jsx3.app.Model>}
   */
  Server_prototype.getRootObjects = function() {
    return this.JSXBODY.getChildren().concat();
  };

  /**
   * Returns the XML/XSL cache for this server
   * @return {jsx3.app.Cache}
   */
  Server_prototype.getCache = function() {
    return this.Cache;
  };

  /**
   * Returns the dynamic properties registry for this server. The returned object contains the properties contained
   * in all loaded resources of type 'jss' and 'ljss.' It also contains any properties loaded by the system or
   * active add-ins. 
   *
   * @return {jsx3.app.Properties}
   */
  Server_prototype.getProperties = function() {
    return this.JSS;
  };

  /**
   * Returns the DOM for this server
   * @return {jsx3.app.DOM}
   */
  Server_prototype.getDOM = function() {
    return this.DOM;
  };

  /**
   * Looks up a DOM node owned by this server by id or by name.
   * @param strId {String} either the id (_jsxid) of the object or its name (jsxname)
   * @return {jsx3.app.Model} the JSX object or null if none found
   * @see jsx3.app.DOM#get()
   */
  Server_prototype.getJSX = function(strId) {
    return this.DOM.get(strId);
  };

  /**
   * Looks up a DOM node owned by this server by name. If more than one such objects exist, only one is returned.
   * @param strId {String} the name (jsxname) of the object
   * @return {jsx3.app.Model} the JSX object or null if none found
   * @see jsx3.app.DOM#getByName()
   */
  Server_prototype.getJSXByName = function(strId) {
    return this.DOM.getByName(strId);
  };

  /**
   * Looks up a DOM node owned by this server by id.
   * @param strId {String} the id (_jsxid) of the object
   * @return {jsx3.app.Model} the JSX object or null if none found
   * @see jsx3.app.DOM#getById()
   */
  Server_prototype.getJSXById = function(strId) {
    return this.DOM.getById(strId);
  };

  Server_prototype.beep = function() {
    if (! jsx3.gui.WindowBar) return;

    var windowBar = this.JSXROOT.findDescendants(
      function(x) {return (x instanceof jsx3.gui.WindowBar)
          && x.getType() == jsx3.gui.WindowBar.TYPEMENU;}, false, false);
    if (windowBar != null)
      windowBar.beep();
  };

  /**
   * Creates a new jsx3.gui.Window instance for this server. A branch of the DOM of this application can be placed
   * in this window in order to distribute the application across multiple browser windows.
   * @param strName {String} the unique name of the window to create
   * @return {jsx3.gui.Window}
   * @throws {jsx3.IllegalArgumentException} if there already exists a window in this server by that name
   * @since 3.2
   */
  Server_prototype.createAppWindow = function(strName) {
    jsx3.require("jsx3.gui.Window");

    if (this.WINDOWS == null)
      this.WINDOWS = this._createRoot("JSXWINDOWS");

    if (this.WINDOWS.getChild(strName) != null)
      throw new jsx3.IllegalArgumentException("strName", strName);

    var w = new jsx3.gui.Window(strName);
    this.WINDOWS.setChild(w);
    return w;
  };

  /**
   * Loads a new jsx3.gui.Window instance from a component file.
   * @param strSource {jsx3.xml.Entity|String} either an XML document containing the window to load or the URL of the
   *    component to load.
   * @param objResolver {jsx3.net.URIResolver} If this parameter is provided, <code>strSource</code> is resolved
   *    relative to it. Additionally, this resolver is stored as the URI resolver for this DOM node and its descendants.
   * @return {jsx3.gui.Window}
   * @throws {jsx3.Exception} if the loaded entity is not an instance of jsx3.gui.Window or if the name of window is
   *    not unique with respect to the already loaded windows
   * @since 3.2
   */
  Server_prototype.loadAppWindow = function(strSource, objResolver) {
    jsx3.require("jsx3.gui.Window");

    if (this.WINDOWS == null)
      this.WINDOWS = this._createRoot("JSXWINDOWS");

    var component = null;
    if (strSource instanceof jsx3.xml.Entity)
      component = this.WINDOWS.loadXML(strSource, false, objResolver);
    else
      component = this.WINDOWS.load(strSource, false, objResolver);

    if (component == null)
      throw new jsx3.Exception(jsx3._msg("serv.win_err", strSource));
    if (!(component instanceof jsx3.gui.Window)) {
      component.getParent().removeChild(component);
      throw new jsx3.Exception(jsx3._msg("serv.win_notwin", strSource, component.getClass()));
    }

    if (this.WINDOWS.getChild(component.getName()) != component) {
      component.getParent().removeChild(component);
      throw new jsx3.Exception(jsx3._msg("serv.win_name", strSource, component.getName()));
    }

    return component;
  };

  /**
   * Retrieves a previously created <code>jsx3.gui.Window</code> instance.
   * @param strName {String} the unique name of the window to retrieve
   * @return {jsx3.gui.Window} the window instance or <code>null</code> if no such window exists.
   * @since 3.2
   */
  Server_prototype.getAppWindow = function(strName) {
    if (this.WINDOWS != null)
      return this.WINDOWS.getChild(strName);
    return null;
  };

  /**
   * Returns the browser document object containing a particular JSX object. This method inspects whether the
   * JSX object is a descendent of the root block of this server or one of its <code>jsx3.gui.Window</code> roots.
   * @param objJSX {jsx3.app.Model}
   * @return {HTMLDocument} document object
   */
  Server_prototype.getDocumentOf = function(objJSX) {
    var parent = objJSX;
    while (parent != null) {
      if (jsx3.gui.Window && parent instanceof jsx3.gui.Window)
        return parent.getDocument();
      if (parent._jsxserver != null)
        return this.getRootDocument();

      parent = parent.getParent();
    }
    return this.getRootDocument();
  };

  Server_prototype.getRootDocument = function() {
    var rootGUI = this.getEnv('GUIREF');
    return rootGUI != null ? rootGUI.ownerDocument : null;
  };

  /**
   * Returns the browser DOM object where a particulat JSX object renders. This method inspects the main root of
   * this server as well as all of its <code>jsx3.gui.Window</code> roots.
   * @param objJSX {jsx3.app.Model}
   * @return {HTMLElement} DOM object
   */
  Server_prototype.getRenderedOf = function(objJSX) {
    var id = objJSX.getId();
    var rootDoc = this.getRootDocument();
    if (rootDoc == null) return null;

    var objGUI = rootDoc.getElementById(id);

    if (objGUI == null && this.WINDOWS != null) {
      var windows = this.WINDOWS.getChildren();
      for (var i = 0; objGUI == null && i < windows.length; i++) {
        var doc = windows[i].getDocument();
        if (doc)
          objGUI = doc.getElementById(id);
      }
    }

    return objGUI;
  };

  /**
   * calls the same method on the JSXROOT of this server; the hotkey is then captured for any event that originates in the server
   * @private
   */
  Server_prototype.registerHotKey = function(vntCallback, vntKey, bShift, bControl, bAlt) {
    return this.getRootBlock().registerHotKey(vntCallback, vntKey, bShift, bControl, bAlt);
  };

  /**
   * delegate to JSXROOT
   * @private
   */
  Server_prototype.checkHotKeys = function(objEvent) {
    return this.getRootBlock().checkHotKeys(objEvent.event);
  };

/* @JSC :: begin DEP */

  /**
   * Conforms to the EventDispatcher contract.
   * @return {jsx3.app.Server} this object.
   * @deprecated
   */
  Server_prototype.getServer = function() {
    return this;
  };

/* @JSC :: end */

  /**
   * Returns <code>true</code> if the configuration file of this application specifies a version number equal to
   * or greater than the <code>strVersion</code> parameter.
   * @param strVersion {String} period-delimited version number.
   * @return {boolean}
   * @package
   */
  Server_prototype.isAtLeastVersion = function(strVersion) {
    return jsx3.util.compareVersions(this.getEnv('jsxversion'), strVersion) >= 0;
  };

  /**
   * Resolves a URI that is referenced from a file in this server. This method takes into account the changes in
   * resource addressing between 3.1 and 3.2. For version 3.1, the URI is resolved as any URI in the system, using
   * <code>jsx3.resolveURI()</code>. In version 3.2, the URI is taken as relative to the application folder. In
   * particular, a relative URI will be resolved to a base of the application folder, an absolute URI will be
   * unaffected.
   * @param strURI {String|jsx3.net.URI} the URI to resolve.
   * @return {jsx3.net.URI} the resolved URI.
   * @since 3.2
   * @see jsx3.net.URIResolver
   * @see jsx3#resolveURI()
   */
  Server_prototype.resolveURI = function(strURI) {
    var uri = jsx3.net.URI.valueOf(strURI);

    if (this.isAtLeastVersion("3.2") && !URIResolver.isAbsoluteURI(uri)) {
      var appPathUri = this.getEnv("apppathuri");
      uri = appPathUri.resolve(uri);
    }
    
    return URIResolver.DEFAULT.resolveURI(uri);
  };

  /**
   * @return {String}
   * @since 3.2
   */
  Server_prototype.getUriPrefix = function() {
    return this.getEnv("apppathuri").toString();
  };

  /**
   * @param strURI {String|jsx3.net.URI} the URI to relativize.
   * @return {jsx3.net.URI} the relativized URI.
   * @since 3.2
   */
  Server_prototype.relativizeURI = function(strURI, bRel) {
    var loc = Browser.getLocation();
    var appPathUri = this.getEnv("apppathabs");
    var relative = appPathUri.relativize(loc.resolve(strURI));

    if (relative.isAbsolute() || bRel) {
      return relative;
    } else {
      var relPath = this.getEnv("apppathrel");
      if (relPath) {
        return jsx3.net.URI.fromParts("jsxapp", null, relPath.replace(/\//g, "!"), null,
            "/" + relative.getPath(), relative.getQuery(), relative.getFragment());
      } else {
        // special handling for GI_Builder/
        return jsx3.net.URI.fromParts(null, null, null, null,
            this.getEnv("apppath") + "/" + relative.getPath(), relative.getQuery(), relative.getFragment());
      }
    }
  };
      
  URIResolver.register("jsxapp", function(uri) {
    var host = uri.getHost();
    if (host) {
      var appPath = host.replace(/!/g, "/");
      var loadedApp = jsx3.System.getAppByPath(appPath);
      return loadedApp || new Server.Resolver(appPath);
    }
    return URIResolver.DEFAULT;
  });

  /**
   * Returns the current locale of this server. If the locale has been set explicitly with <code>setLocale()</code>,
   * that locale is returned. Otherwise, <code>getDefaultLocale()</code> is consulted, and finally the system-wide
   * locale.
   *
   * @return {jsx3.util.Locale}
   * @since 3.2
   */
  Server_prototype.getLocale = function() {
    if (this._locale == null)
      this._locale = this.getDefaultLocale();

    return this._locale != null ? this._locale : jsx3.System.getLocale();
  };

  /**
   * Sets the locale of this server.
   * @param objLocale {jsx3.util.Locale}
   * @since 3.2
   */
  Server_prototype.setLocale = function(objLocale) {
    /* @jsxobf-clobber */
    this._locale = objLocale;
  };

  /**
   * Returns the default locale of this server. This is configured with the <code>default_locale</code> configuration
   * setting.
   * @return {jsx3.util.Locale}
   * @since 3.2
   */
  Server_prototype.getDefaultLocale = function() {
    var localeKey = this.getSettings().get("default_locale");
    if (localeKey == null) return null;
    localeKey = jsx3.util.strTrim(localeKey.toString());
    // Locale is optional
    return localeKey.length > 0 && jsx3.util.Locale ? jsx3.util.Locale.valueOf(localeKey) : null;
  };

  /**
   * Reloads all resource files that are localized. This method should be called after calling
   * <code>setLocale()</code> for the server to render properly in the new locale.
   *
   * @since 3.2
   */
  Server_prototype.reloadLocalizedResources = function() {
    var p = this.LJSS.getParents();
    this.LJSS.removeAllParents();
    
    for (var i = 0; i < p.length; i++) {
      var props = jsx3.app.PropsBundle.getPropsFT(p[i].getPath(), this.getLocale(), this.getCache());
      this.LJSS.addParent(props);
    }
  };

  /** @private @jsxobf-clobber */
  Server_prototype._onHelpKey = function(objEvent) {
    var objJSX = jsx3.html.getJSXParent(objEvent.srcElement(), this);
    if (!objJSX) objJSX = this.JSXROOT;
    return objJSX ? this.invokeHelp(objJSX) : false;
  };

  /**
   * Invokes context-sensitive help as though the user had pressed the help hot key in the context of the DOM node
   * <code>objJSX</code>.
   * @param objJSX {jsx3.app.Model}
   * @since 3.5
   * @see #HELP
   */
  Server_prototype.invokeHelp = function(objJSX) {
    var strId = null;
    while (objJSX && !strId) {
      strId = objJSX.getHelpId();
      objJSX = objJSX.getParent();
    }

    if (strId)
      this.publish({subject:Server.HELP, helpid:strId, model:objJSX});

    return Boolean(strId);
  };
      
  /**
   * @return {Array<jsx3.app.AddIn>}
   * @package
   */
  Server_prototype.getAddins = function() {
    var a = [];
    var names = this.getSettings().get("addins");
    if (names) {
      for (var i = 0; i < names.length; i++) {
        var addin = jsx3.System.getAddin(names[i]);
        if (addin) a.push(addin);
      }
    }
    return a;
  };

  /**
   * @return {String}
   */
  Server_prototype.toString = function() {
    return this.jsxsuper() + " " + this.getAppPath() + ":" + this.getEnv("namespace");
  };

/* @JSC :: begin DEP */

  /**
   * Returns version of the JSX runtime; separate versions are also available for GUI and Operational classes
   *
   * @return {String} app version number (major (MM), minor (mm), and dot release (dd)) MM.mm.dd
   * @deprecated
   */
  Server.getVersion = function() {
    return "3.00.00";
  };

/* @JSC :: end */

});

// if Alerts is already loaded (shouldn't be), then go ahead and implement it here
if (jsx3.gui.Alerts)
  jsx3.app.Server.jsxclass.addInterface(jsx3.gui.Alerts.jsxclass);

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.app.Server
 * @see jsx3.app.Server
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Server", -, null, function(){});
 */
jsx3.Server = jsx3.app.Server;

/* @JSC :: end */

/**
 * @private
 */
jsx3.Class.defineClass("jsx3.app.Server.Resolver", null, [jsx3.net.URIResolver], 
    function(ServerURIResolver, ServerURIResolver_prototype) {

  var URIResolver = jsx3.net.URIResolver;
      
  ServerURIResolver_prototype.init = function(strHost) {
    this._host = strHost;
    this._uri = new jsx3.net.URI(jsx3.getEnv("jsxhomepath") + jsx3.APP_DIR_NAME + "/" + strHost.replace(/!/g, "/") + "/");
  };
      
  ServerURIResolver_prototype.resolveURI = function(strURI) {
    var uri = jsx3.net.URI.valueOf(strURI);
    
    if (! URIResolver.isAbsoluteURI(uri))
      uri = URIResolver.DEFAULT.resolveURI(this._uri.resolve(uri));

    return URIResolver.DEFAULT.resolveURI(uri);
  };

  ServerURIResolver_prototype.getUriPrefix = function() {
    return this._uri.toString();
  };

  ServerURIResolver_prototype.relativizeURI = function(strURI, bRel) {
    var relative = this._uri.relativize(strURI);
    
    if (relative.isAbsolute() || bRel)
      return relative;
    else
      return jsx3.net.URI.fromParts("jsxapp", null, this._host, null, 
          "/" + relative.getPath(), relative.getQuery(), relative.getFragment());    
  };
  
  ServerURIResolver_prototype.toString = function() {
    return this._uri.toString();
  };

});

