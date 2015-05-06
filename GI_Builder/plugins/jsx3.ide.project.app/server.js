/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _jsxroots

// override jsx3.GO in the context of Builder
jsx3.GO = jsx3.lang.System.GO = function(strIdName, strNS) {
  if (jsx3.util.strEmpty(strIdName)) return null;
  var isId = strIdName.indexOf("_jsx_") == 0;
  var builderProj = jsx3.ide.SERVER;

  if (strNS) {
    if (strNS == "jsx3.IDE")
      return isId ? jsx3.IDE.getJSXById(strIdName) : jsx3.IDE.getJSXByName(strIdName);

    if (builderProj != null && builderProj.getEnv("namespace") == strNS)
      return isId ? builderProj.getJSXById(strIdName) : builderProj.getJSXByName(strIdName);

  } else {
    return (builderProj != null && (isId ? builderProj.getJSXById(strIdName) : builderProj.getJSXByName(strIdName))) ||
        (isId ? jsx3.IDE.getJSXById(strIdName) : jsx3.IDE.getJSXByName(strIdName));
  }

  return null;
};

jsx3.require("jsx3.gui.Dialog");

// Override the doClose method of Dialog in the IDE so that removed dialogs go to the recycling bin
jsx3.gui.Dialog.prototype._doClose = jsx3.gui.Dialog.prototype.doClose;
jsx3.gui.Dialog.prototype.doClose = function() {
  if (this.getServer() != jsx3.IDE)
    jsx3.ide.getEditorForJSX(this).doRecycle(this.getId(), true);
  else
    this._doClose();
};

/**
 * The IDE's version of a server. This class is instantiated once when a project loads in the IDE.
 */
jsx3.Class.defineClass("jsx3.ide.Server", jsx3.app.Server, null, function(Server, Server_prototype) {

  /**
   * @param strAppPath {String} the application path relative to the current projects directory.
   */
  Server_prototype.init = function(strAppPath) {
    strAppPath = jsx3.ide.getSystemDirFile().toURI().relativize(
        jsx3.ide.getCurrentUserHome().toURI().resolve(strAppPath)).toString();
    this.jsxsuper(strAppPath, null, false);

    /* @jsxobf-clobber */
    this._views = new jsx3.util.List();

    this.getCache().subscribe(jsx3.app.Cache.CHANGE, function() {
      jsx3.ide.getPlugIn("jsx3.ide.project.app").publish({subject:"cachedChanged"});
    });
  };

  Server_prototype.getDirectory = function() {
    if (this._dirfile == null)
      /* @jsxobf-clobber */
      this._dirfile = jsx3.ide.getSystemRelativeFile(this.getAppPath());
    return this._dirfile;
  };

  Server_prototype.getBaseDirectory = function() {
    if (this._basefile == null)
      /* @jsxobf-clobber */
      this._basefile = jsx3.ide.getSystemRelativeFile(this.getEnv("apppathuri"));
    return this._basefile;
  };

  Server_prototype.paint = function() {};
  Server_prototype.setDimensions = function() {};
  Server_prototype.getRootDocument = function() { return jsx3.IDE.getRootDocument(); };

  Server_prototype.destroy = function() {
    delete this.ENVIRONMENT.onunload;
    this.jsxsuper();
  };

  Server_prototype.getJSX = function(strId) {
    var isId = strId.indexOf("_jsx_") == 0;
    return isId ? this.getJSXById(strId) : this.getJSXByName(strId);
  };

  Server.trashFinder = function(x) { return x != null && x == jsx3.ide._TRASH; };

  Server_prototype.getJSXByName = function(strName) {
    // look in active server view first
    var active = jsx3.ide.getActiveServer();
    var views = this._views;
    if (active != null) {
      views = jsx3.util.List.wrap([active]);
      views.addAll(this._views);
    }

    var obj = null;
    for (var i = views.iterator(); i.hasNext() && obj == null; ) {
      var allMatches = i.next().getDOM().getAllByName(strName);
      for (var j = 0; j < allMatches.length; j++) {
        var match = allMatches[j];
        if (match.findAncestor(Server.trashFinder) == null) {
          obj = match;
          break;
        }
      }
    }
    return obj;
  };

  Server_prototype.getJSXById = function(strId) {
    var obj = null;
    for (var i = this._views.iterator(); i.hasNext() && obj == null; )
      obj = i.next().getDOM().getById(strId);

    return obj;
  };

  /** @private @jsxobf-clobber */
  Server._ENV = {
    cancelrightclick: false,
    caption: "",
    cancelerror: false,
    bodyhotkeys: false
  };

  Server_prototype.getEnv = function(strEnvKey) {
    strEnvKey = strEnvKey.toLowerCase();
    if (Server._ENV[strEnvKey] != null) return Server._ENV[strEnvKey];
    return this.jsxsuper(strEnvKey);
  };

  /** @private @jsxobf-clobber */
  Server_prototype.addView = function(objView) {
    this._views.add(objView);
  };

  /** @private @jsxobf-clobber */
  Server_prototype.removeView = function(objView) {
    this._views.remove(objView);

    //remove ref to this server
    objView.deactivateView();
  };

  Server_prototype.getViews = function() {
    return this._views;
  };

  Server_prototype.loadInclude = function(strSrc, strId, strType, bReload) {
    // Support for loading JS and CSS resources from custom schemes like gears://
    
    if (strType == "script" || strType == "css") {
      var u = jsx3.net.URI.valueOf(strSrc);
      var scheme = u.getScheme();
      if (scheme && jsx3.net.Request.getSchemeHandler(scheme)) {
        var r = jsx3.net.Request.open("GET", u, true);
        r.subscribe("*", function() {
          if (r.getStatus() == 200) {
            if (strType == "script") {
              jsx3.eval(r.getResponseText());
            } else {
              jsx3.html.insertAdjacentHTML(document.getElementsByTagName("head")[0], "beforeEnd",
                      '<style type="text/css">\n' + r.getResponseText() + "\n</style>");
            }
          }
        });
        r.send();
        return;
      }
    }

    return this.jsxsuper(strSrc, strId, strType, bReload);
  };

});

/**
 * The IDE's version of a component cache. This class is instantiated once per ServerView. This class
 * simply keeps track of which documents were inserted the Server cache through it so that the cache palette
 * can partition cache documents by component tab.
 */
jsx3.Class.defineClass("jsx3.ide.ViewCache", jsx3.app.Cache, null, function(ViewCache, ViewCache_prototype) {

  var Cache = jsx3.app.Cache;
  var Cache_prototype = Cache.prototype;

  ViewCache_prototype.init = function(objServer, objCache) {
    this.jsxsuper();
    
    /* @jsxobf-clobber */
    this._view = objServer;
    /* @jsxobf-clobber */
    this._cache = objCache;
  };

  ViewCache_prototype.isMyDocument = function(strId) {
    var myDoc = Cache_prototype.getDocument.call(this, strId);
    var masterDoc = this._cache.getDocument(strId);
    return myDoc && (!masterDoc || myDoc == masterDoc);
  };

  ViewCache_prototype.clearById = function(strId) {
    var objDoc = this.jsxsuper(strId);
    if (objDoc == this._cache.getDocument(strId))
      this._cache.clearById(strId);
  };

  ViewCache_prototype.clearByTimestamp = function(intTimestamp) {
    if (intTimestamp instanceof Date) intTimestamp = intTimestamp.getTime();

    var keys = this.keys();
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var ts = this.getTimestamp(key);
      if (ts < intTimestamp)
        this.clearById(key);
    }
  };

  ViewCache_prototype.getDocument = function(strId) {
    return this.jsxsuper(strId) || this._cache.getDocument(strId);
  };

  ViewCache_prototype.setDocument = function(strId, objDocument) {
    this.jsxsuper(strId, objDocument);
    this._cache.setDocument(strId, objDocument);
  };

  ViewCache_prototype.destroy = function() {
    // QUESTION: Should this take documents out of the master cache or leave them in?
/*
    var keys = this.keys();
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      this.clearById(key);
    }
*/
    this.jsxsuper();
  };

});

/**
 * The IDE's version of a per-tab server. This class keeps a reference to the real server instance and delegates
 * calls as necessary for proper functionality.
 */
jsx3.Class.defineClass("jsx3.ide.ServerView", jsx3.app.Server, null, function(ServerView, ServerView_prototype) {

  ServerView_prototype.init = function(objServer, objGUI, strComponentURL) {
    /* @jsxobf-clobber */
    this._server = objServer;
    /* @jsxobf-clobber */
    this._gui = objGUI;
    /* @jsxobf-clobber */
    this._compurl = strComponentURL;

    /* @jsxobf-clobber */
    this._stats = {};
    /* @jsxobf-clobber */
    this._statsonly = strComponentURL instanceof jsx3.xml.Document;

    this.DOM = new jsx3.app.DOM();

    // init cache from parent
    this.Cache = new jsx3.ide.ViewCache(this, this._server.getCache());

    this.getRootBlock(); // creates root and body

    if (!this._statsonly)
      this._server.addView(this);
  };
  
  ServerView_prototype.getStats = function() {
    return this._stats;
  };

  ServerView_prototype.toString = function() {
    return "@" + this.getClass() + " " + this._compurl + ":" + this.getEnv("namespace");
  };

  ServerView_prototype.load = function(callback) {
    if (!this._statsonly) {
      //find the jsx object that contains the serverview instance; subscribe to its resize_view event, so the serverview instance will  resize as if it's part of containing jsx app's box model
      var objJSXParent = jsx3.html.getJSXParent(this._gui);
      objJSXParent.subscribe(jsx3.gui.Interactive.AFTER_RESIZE_VIEW,this,"onResizeParent");
      /* @jsxobf-clobber */
      this._parentid = objJSXParent.getId();
    }

    //initialize the box profile
    this.JSXROOT.syncBoxProfileSync({left:0,top:0,parentwidth:this._gui.clientWidth,parentheight:this._gui.clientHeight});

    //paint the on-screen HTML
    this._gui.innerHTML = this.JSXROOT.paint();

    var t1 = new Date().getTime();

    if (this._statsonly) {
      var xml = this._compurl;
      this._load2(xml, t1);
    } else {
      var xml = new jsx3.xml.Document();
      xml.setAsync(true);
      xml.subscribe("*", jsx3.$F(function() {
        this._load2(xml, t1);
        callback();
      }).bind(this));
      xml.load(this.resolveURI(this._compurl));
    }
  };

  ServerView_prototype._load2 = function(xml, t1) {
    var children = this.JSXBODY.loadXML(xml, false);
    this._stats.unmarshal = new Date().getTime() - t1;
    this._stats.objcount = this.JSXBODY.findDescendants(function(x) { return true; }, false, true).length;
    this._stats.size = xml.toString().length;

    if (jsx3.$A.is(children)) {
      for (var i = 0; i < children.length; i++)
        children[i].setPersistence(jsx3.app.Model.PERSISTEMBED);
    } else if (children) {
      children.setPersistence(jsx3.app.Model.PERSISTEMBED);
    }
  };

  ServerView_prototype.paint = function() {
    var t1 = new Date().getTime();
    this._regHelpKey();
    var html = this.JSXROOT.repaint();

    this._stats.paint = new Date().getTime() - t1;
    this._stats.html = html.length;
  };

  ServerView_prototype.invokeHelp = function(objJSX) {
    return this._server.invokeHelp(objJSX);
  };

  /**
   * when jsxparent (the ide server object) updates the on-screen view, the block that contains this serverview instance will publish this event
   * @private
   */
  ServerView_prototype.onResizeParent = function() {
    var objGUI = this.getEnv("guiref");
    this.getRootBlock().syncBoxProfile(
      {left:0,top:0,width:parseInt(objGUI.clientWidth),height:parseInt(objGUI.clientHeight)}, true);
  };

  ServerView_prototype.destroy = function() {
    this._server.removeView(this);

    this.DOM.unsubscribeAllFromAll();

    //free-up GUI objects belonging to the various roots
    for (var i = 0; i < this._jsxroots.length; i++) {
      var root = this._jsxroots[i];
      root.removeChildren();
    }
    this.DOM.destroy();

    //free-up xml resources
    this.Cache.unsubscribeAll(jsx3.app.Cache.CHANGE);
    this.Cache.destroy();

    //unsubscribe (should this be static?)
    if (!this._statsonly)
      jsx3.GO(this._parentid).unsubscribe(jsx3.gui.Interactive.AFTER_RESIZE_VIEW,this,"onResizeParent");

    //destroy root view (JSXROOT)
    var objGUI = this.JSXROOT.getRendered();
    if (objGUI) {
      //depending upon the server mode (ide or runtime), the outer container may or may not be present
      if (objGUI.parentNode.id == "JSX")
        objGUI = objGUI.parentNode;
      objGUI.parentNode.removeChild(objGUI);
    }
  };

  ServerView_prototype.getEnv = function(strEnvKey) {
    strEnvKey = strEnvKey.toUpperCase();
    if (strEnvKey == "GUIREF") return this._gui;
    if (strEnvKey == "COMPONENTURL") return this._compurl;
    return this._server.getEnv(strEnvKey);
  };

  /**
   * @private
   * @return {jsx3.app.Properties}
   */
  ServerView_prototype.getProperties = function() {
    return this._server.getProperties();
  };

  ServerView_prototype.getAppPath = function() {
    return this._server.getAppPath();
  };

  ServerView_prototype.getLocale = function() {
    return this._server.getLocale();
  };

  ServerView_prototype.setLocale = function(objLocale) {
    this._server.setLocale(objLocale);
  };

  ServerView_prototype.reloadLocalizedResources = function() {
    this._server.reloadLocalizedResources();
  };

  ServerView_prototype.activateView = function() {
    jsx3.activateApp(this);
  };

  ServerView_prototype.deactivateView = function() {
    jsx3.activateApp(this._server);
  };

});

