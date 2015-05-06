/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * A collection of GI system related functions.
 */
jsx3.Class.defineClass("jsx3.lang.System", null, null, function(System, System_prototype) {

  var PropsBundle = jsx3.app.PropsBundle;

  System.LJSS = new jsx3.app.Properties();
  
  /**
   * {jsx3.app.Properties}
   * @package
   */
  System.JSS = new jsx3.app.Properties();
  System.JSS.addParent(System.LJSS);
  
  /**
   * {Object<String, jsx3.app.Server>} an object array that indexes all loaded GI applications by their namespace.
   * @private
   * @jsxobf-clobber
   */
  System.APPS = {};
  
  /**
   * Returns a system property as specified by a JSS file loaded by the JSX runtime or an addin.
   * @param strKey {String}
   * @return {String}
   * @since 3.2
   */
  System.getProperty = function(strKey) {
    return System.JSS.get(strKey);
  };

  /**
   * If the locale has been explicitly set with <code>setLocale()</code>, that locale is returned. Otherwise the
   * locale is determined by introspecting the browser. If all else fails the default locale, en_US, is returned.
   * 
   * @since 3.2
   */
  System.getLocale = function() {
    // Locale is optional
    if (System._locale == null && jsx3.util.Locale) {
      var localeString = jsx3.app.Browser.getLocaleString();
      if (localeString) {
        var tokens = localeString.split("_");
        System._locale = new jsx3.util.Locale(tokens[0], tokens[1]);
      } else {
        System._locale = jsx3.util.Locale.US;
      }
    }
    return System._locale;
  };

  /**
   * Sets the system-wide locale. This in turn affects all applications running under the JSX system.
   * @since 3.2
   */
  System.setLocale = function(objLocale) {
    if (objLocale != System._locale) {
      System.JSS.removeParent(System.getLocaleProperties());
      /* @jsxobf-clobber */
      System._locale = objLocale;
      System.JSS.addParent(System.getLocaleProperties());
    }
  };
  
  /**
   * @since 3.2
   */
  System.reloadLocalizedResources = function() {
    if (PropsBundle) {
      var p = System.LJSS.getParents();
      System.LJSS.removeAllParents();
    
      for (var i = 0; i < p.length; i++)
        System.LJSS.addParent(PropsBundle.getPropsFT(p[i].getPath(), System.getLocale(), jsx3.getSystemCache()));
    }
  };

  /* @jsxobf-clobber */
  System._locdocurl = jsx3.resolveURI("jsx:///locale/locale.xml");

  /**
   * @return {jsx3.app.Properties}
   * @since 3.2
   * @package
   */
  System.getLocaleProperties = function(objLocale) {
    return PropsBundle.getPropsFT(System._locdocurl, objLocale, jsx3.getSystemCache());
  };

  /**
   * @param strKey {String}
   * @param strTokens {Object...}
   * @return {String}
   * @since 3.2
   */
  System.getMessage = function(strKey, strTokens) {
    var value = System.LJSS.get(strKey);
    var suffix = "";

    // jsx3.util.MessageFormat class is optional, should work without it
    if (arguments.length > 1) {
      var args = jsx3.Method.argsAsArray(arguments, 1);
      if (value != null && jsx3.util.MessageFormat) {
        try {
          var format = new jsx3.util.MessageFormat(value);
          return format.format(args);
        } catch (e) {;}
      } else {
        suffix = " " + args.join(" ");
      }
    }

    if (value == null) value = strKey;
    return value + suffix;
  };

  /**
   * global call to get a handle to a specific JSX GUI Object; NOTE: This is a significant modification used to support
   *            multi-instance servers. It is equivalently the same as calling 'getJO' in all builds prior to 3.0; returns null
   *            if object cannot be found. The specific app (a jsx3.app.Server instance) can also be queried for objects using its own
   *            DOM APIs.
   * @param strIdName {String} JSX 'id' or 'name' property for the object to get a handle to
   * @param strNS {String/jsx3.app.Server} namespace for the server to get the object from; when a 'name' is passed as @strNameId
   *            (as opposed to the object's 'id'), this allows the global JSX controller to more-quickly find the
   *            server that owns the given object. As this parameter is optional, the JSX controller will try to locate
   *            the named object by iterating through all server instances running in the browser in load order if no
   *            namespace is passed. When an 'id' is passed, the namespaces is not required as it explicitly contains
   *            this namespace.
   * @return {jsx3.app.Model} handle to given JSX GUI object or null if none found
   * @package
   */
  System.GO = function(strIdName, strNS) {
    var objJSX = null;
    if (strIdName != null) {
      // check for argument like jsxid, only check by id
      if (strIdName.indexOf("_jsx_") == 0) {
        var appKey = jsx3.app.DOM.getNamespaceForId(strIdName);
        
        // namespace argument does not match the namespace encoded in the id
        if (strNS && strNS != appKey) return null;
        
        if (System.APPS[appKey])
          objJSX = System.APPS[appKey].getJSXById(strIdName);
      } 
      // it must be a name, we'll check APPS, then all servers
      else {
        // namespace specified
        if (strNS) {
          if (System.APPS[strNS])
            objJSX = System.APPS[strNS].getJSXByName(strIdName);
        } else {
          for (var i in System.APPS) 
            if ((objJSX = System.APPS[i].getJSXByName(strIdName)) != null) return objJSX;
        }
      }
    }
    return objJSX;
  };

  /**
   * Lookup an application (<code>jsx3.app.Server</code>) by its namespace. If more than one application 
   * share the same namespace, this returns the instance most recently sent as an argument to <code>registerApp()</code> or <code>activateApp()</code>. This is generally equivalent to <code>window[strAppKey]</code>.
   * @param strAppKey {String} the namespace of the application to get
   * @package
   */
  System.getApp = function(strAppKey) {
    return System.APPS[strAppKey];
  };
  
  /**
   * @return {Array<jsx3.app.Server>}
   * @package
   */
  System.getAllApps = function() {
    var apps = [];
    for (var f in System.APPS)
      apps.push(System.APPS[f]);
    return apps;
  };

  /**
   * Register an application (<code>jsx3.app.Server</code>) in the framework. 
   * @param objServer {jsx3.app.Server} 
   * @package
   */
  System.registerApp = function(objServer) {
    var ns = objServer.getEnv('namespace');

    jsx3.lang.setVar(ns, objServer);
  
    // add this server instance to the collection indexed and managed by the JSX controller
    System.APPS[ns] = objServer;  
  };

  /**
   * De-register an application (<code>jsx3.app.Server</code>) in the framework. 
   * @param objServer {jsx3.app.Server} 
   * @package
   */
  System.deregisterApp = function(objServer) {
    var ns = objServer.getEnv('namespace');

    var s = jsx3.lang.getVar(ns);
    if (objServer == s)
      jsx3.lang.setVar(objServer.getEnv('namespace'), null);
    
    if (System.APPS[ns] == objServer) 
      delete System.APPS[ns];
  };

  /**
   * Activate an application (<code>jsx3.app.Server</code>) in the framework. Call this method on an application that has already been registered and has become the "topmost" or "most active" application of all the applications sharing its namespace.
   * @param objServer {jsx3.app.Server} 
   * @package
   */
  System.activateApp = function(objServer) {
    jsx3.registerApp(objServer);
  };

  /**
   * @package
   */
  System.getAppByPath = function(strPath) {
    for (var ns in System.APPS) {
      var app = System.APPS[ns];
      if (app.getEnv("apppathrel") == strPath || app.getEnv("apppath") == strPath)
        return app;
    }
    return null;
  };

  /** @private @jsxobf-clobber */
  System._ADDINS = [];
  
  /** @private @jsxobf-clobber */
  System._ADDIN_MAP = {};
  
  /**
   * @package
   */
  System.registerAddin = function(strVar, objAddin) {
    jsx3.lang.setVar(strVar, objAddin);
    System._ADDINS.push(objAddin);
    System._ADDIN_MAP[objAddin.getKey()] = objAddin;
  };
  
  /**
   * @return {Array<jsx3.app.AddIn>}
   * @package
   */
  System.getAddins = function() {
    return System._ADDINS.concat();
  };

  /**
   * @param strKey {String}
   * @return {jsx3.app.AddIn}
   * @package
   */
  System.getAddin = function(strKey) {
    return System._ADDIN_MAP[strKey];
  };

  /**
   * Returns the version number of General Interface. 
   * @return {String} <code>"3.1.0"</code>, etc.
   */
  System.getVersion = function() {
    var v = "@build.gi.version@_@build.gi.buildno@";
    return v.match(/\d/) ? v : "3.9.2"; // fallback for uncompiled version
  };

});

// jsx3.lang.System
jsx3.GO =            jsx3.lang.System.GO;
jsx3.getApp =        jsx3.lang.System.getApp;
jsx3.registerApp =   jsx3.lang.System.registerApp;
jsx3.activateApp =   jsx3.lang.System.activateApp;
jsx3.deregisterApp = jsx3.lang.System.deregisterApp;
jsx3.getVersion =    jsx3.lang.System.getVersion;
