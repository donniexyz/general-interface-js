/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber  _jsxshaking
/**
 * Global GI static methods and constants.
 */
jsx3.Package.definePackage("jsx3", function() {

  /**
   * {String} location for addin resources.
   */
  jsx3.ADDINSPATH = "JSX/addins/";
  
/* @JSC :: begin DEP */

  /**
   * {String} Default ActiveX XML object key.
   * @deprecated
   */
  jsx3.XMLREGKEY = "Msxml2.FreeThreadedDOMDocument.3.0";

  /**
   * {String} Default ActiveX XSL object key.
   * @deprecated
   */
  jsx3.XSLREGKEY = "Msxml2.XSLTemplate.3.0";

  /**
   * {String} Default ActiveX HTTP object key.
   * @deprecated
   */
  jsx3.HTTPREGKEY = "Msxml2.XMLHTTP.3.0";

/* @JSC :: end */

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {

  /* @jsxobf-clobber */
  jsx3.MSXML_VERSION = null;
  
  /* @jsxobf-clobber */
  jsx3._MSXML_TRY = [6, 4, 3];
  
  jsx3.getXmlVersion = function() {
    if (this.MSXML_VERSION == null) {
      var vers = jsx3.getEnv("jsxxmlversion");
      
      // TODO: these error messages are not localized or externalized
      if (vers) {
        if (jsx3._msxmlTry(vers))
          jsx3.MSXML_VERSION = vers;
        else {
          throw new jsx3.Exception("FATAL: Cannot instantiate the specified MSXML version, " + vers + ".");
        }
      } else if (jsx3.getEnv("jsxxmlregkey") || jsx3.getEnv("jsxxslregkey")) {
        // if overridden, we'll assume fewest features
        jsx3.MSXML_VERSION = 3;
      } else {
        for (var i = 0; i < jsx3._MSXML_TRY.length; i++) {
          vers = jsx3._MSXML_TRY[i];
          if (jsx3._msxmlTry(vers)) {
            jsx3.MSXML_VERSION = vers;
            break;
          }
        }

        if (!jsx3.MSXML_VERSION)
          throw new jsx3.Exception("FATAL: Cannot instantiate any valid version of Microsoft XML.");
      }
    }
    
    return this.MSXML_VERSION;
  };
  
  /* @jsxobf-clobber */
  jsx3._msxmlTry = function(intVers) {
    try {
      var o = new ActiveXObject("MSXML2.FreeThreadedDOMDocument." + intVers + ".0");
      return o != null;
    } catch (e) {
      return false;
    }
  };

  jsx3.getXmlInstance = function() {
    var key = jsx3.getEnv("jsxxmlregkey") || "MSXML2.FreeThreadedDOMDocument." + this.getXmlVersion() + ".0";
    return new ActiveXObject(key);
  };

  jsx3.getXslInstance = function() {
    var key = jsx3.getEnv("jsxxslregkey") || "MSXML2.XSLTemplate." + this.getXmlVersion() + ".0";
    return new ActiveXObject(key);
  };

  jsx3.getHttpInstance = function() {
    var key = jsx3.getEnv("jsxhttpregkey") || "MSXML2.XMLHTTP." + this.getXmlVersion() + ".0";
    return new ActiveXObject(key);
  };

/* @JSC */ } else {
  
  jsx3.getXmlVersion = function() {
    return 6;
  };
  
/* @JSC */ }

/* @JSC :: begin DEP */

  /**
   * @deprecated  The new <code>jsx3.lang.Class</code> framework does not use this constant for instantiating objects.
   */
  jsx3.DESERIALIZE = "JSX30DESERIALIZE";

  /**
   * @deprecated  The new <code>jsx3.lang.Class</code> framework does not use this constant for instantiating objects.
   */
  jsx3.INITIALIZE = "JSX30INITIALIZE";

/* @JSC :: end */

  // See: http://bugs.webkit.org/show_bug.cgi?id=15631
/* @JSC */ if (jsx3.CLASS_LOADER.SAF) {
  jsx3.LOG10E = 0.4342944819032518;
/* @JSC */ } else {
  jsx3.LOG10E = Math.LOG10E;
/* @JSC */ }
  
  /**
   * {jsx3.gui.Event}
   * @package
   */
  jsx3.STARTUP_EVENT = null;
  
  /**
   * {jsx3.app.Cache} The <code>jsx3.app.Cache</code> instance used by the JSX system to store XML and XSL documents.
   * @deprecated  Use <code>getSharedCache()</code> instead.
   * @see #getSharedCache()
   */
  jsx3.CACHE = null;
  
/* @JSC :: begin DEP */

  /**
   * {jsx3.EVT} wrapped static access to the current JavaScript event
   * @deprecated Static access to the event object is deprecated as it is not cross-platform. Access to the current
   *   event object, where available, is granted via a method parameter or model event context variable.
   * @see jsx3.gui.Event
   */
  jsx3.EVENT = null;

/* @JSC :: end */

  /**
   * Returns the global JSX XML/XSL cache. This cache is shared by all applications in the JSX runtime. Every
   * server cache instance consults this cache when <code>getDocument()</code> is called on the server cache with
   * a cache id that does not correspond to a document in the server cache.
   * @return {jsx3.app.Cache}
   */
  jsx3.getSharedCache = function() {
    if (jsx3.CACHE == null) jsx3.CACHE = new jsx3.app.Cache();
    return jsx3.CACHE;
  };
  
  /**
   * @return {jsx3.app.Cache}
   * @package
   */
  jsx3.getSystemCache = function() {
    if (jsx3._SYSCACHE == null)
      /* @jsxobf-clobber */
      jsx3._SYSCACHE = new jsx3.app.Cache();
    return jsx3._SYSCACHE;
  };
  
  /**
   * Evaluates a JavaScript expression in a controlled local variable context. Every name-value pair in 
   * <code>objContext</code> will be exposed as a local variable to the evaluated script. All names must be valid
   * JavaScript names in order to be exposed as local variables. Any invalid names will be ignored.
   *
   * @param strScript {String} the JavaScript to evaluate.
   * @param objContext {Object<String, Object>} a map containing the local variable context. Each key is the name
   *    of a variable to expose and each value is the value of that variable. 
   * @return  the results of evaluating <code>strScript</code>.
   * 
   * @see jsx3.util#isName()
   */
  jsx3.eval = function(strScript, objContext) {
    // name of parameter will be obfuscated so ...
    if (strScript != null && strScript !== "") {
      var vars = "";
      if (objContext) {
        /* @jsxobf-bless */
        var _ec = objContext;
        var a = [];

        for (var f in _ec)
          if (jsx3.util.isName(f))
            a[a.length] = "var " + f + " = _ec." + f + ";";

        vars = a.join("");
      }
      return eval(vars + strScript);
    }
  };
  
  /**
   * Returns a URI resolved against the default URI resolver, <code>URIResolver.DEFAULT</code>.
   * @param strURI {String|jsx3.net.URI} the URI to resolve.
   * @return {String}
   * @see jsx3.net.URIResolver#DEFAULT
   */
  jsx3.resolveURI = function(strURI) {
    return jsx3.net.URIResolver.DEFAULT.resolveURI(strURI).toString();
  };
  
  jsx3.makeCallback = function(fctBody, objThis, varArgs) {
    var argsAsArray = jsx3.Method.argsAsArray;
    var args = argsAsArray(arguments, 2);

    if (typeof(fctBody) == "string")
      fctBody = objThis[fctBody];
      
    return function() {
      var myArgs = arguments;
      // make arguments to this function available
      var a = myArgs.length > 0 ? args.concat(argsAsArray(myArgs)) : args;
      return fctBody.apply(objThis, a);
    };
  };

  jsx3.clone = function(obj) {
    if (typeof(obj) != "object") return obj;
    
    var c = {};
    for (var f in obj)
      c[f] = obj[f];
    return c;
  };

/* @JSC :: begin DEP */
  /** @private @jsxobf-clobber */
  jsx3._REQUIRE_MAP = {};
  jsx3._REQUIRE_MAP["jsx3.gui.MatrixColumn"] = "jsx3.gui.Matrix.Column"; // DEPRECATED: only way to make bridge work with lazy loading
/* @JSC :: end */

  /**
   * Ensures that one or more classes is available before this method returns. Any class that fails to load will
   * throw an error. Only classes that can be found by the system class loader may be loaded in this manner.
   *
   * @param strClass {String...} the fully-qualified names of the classes to load.
   * @since 3.2
   */
  jsx3.require = function(strClass) {
    for (var i = 0; i < arguments.length; i++) {
      var className = arguments[i];
/* @JSC :: begin DEP */
      className = jsx3._REQUIRE_MAP[className] || className;
/* @JSC :: end */
      if (jsx3.Class.forName(className) == null)
        jsx3.CLASS_LOADER.loadClass(className);
    }
  };

  /**
   * Loads a class or classes asynchronously. If multiple classes are specified they are loaded serially rather
   * than in parallel. This method does not resolve dependencies, i.e. if the class to load contains a call to
   * <code>jsx3.require</code> that class will be loaded synchronously.
   * <p/>
   * Note that if <code>strClass</code> does not correspond to an file on the classpath or if the
   * corresponding file does not actualy define a class whose name is <code>strClass</code>, this async function
   * will never complete and no callbacks will be executed.
   *
   * @param strClass {String...} the fully-qualified names of the classes to load.
   * @throws {jsx3.Exception} if the package of <code>strClass</code> is not registered as a system, add-in or application classpath.
   * @since 3.9
   */
  jsx3.requireAsync = jsx3.$Y(function(cb) {
    var a = cb.args();
    var className = a[0];

    jsx3.CLASS_LOADER.loadClassAsync(className, function() {
      if (a.length >= 2) {
        jsx3.requireAsync.apply(jsx3, jsx3.Method.argsAsArray(a, 1)).when(
            function() { cb.done(); }
        );
      } else {
        cb.done();
      }
    });
  });

  /** @private @jsxobf-clobber */
  jsx3._SLEEP_QUEUE = [];
  /** @private @jsxobf-clobber */
  jsx3._SLEEP_MAP = [];
  /** @private @jsxobf-clobber */
  jsx3._SLEEP_TO = null;

  /**
   * A replacement for peppering code with <code>window.setTimeout(fnct, 0)</code> statements. This method places
   * all jobs in a queue. Each job gets its own stack.
   * @param objFunction {Function} an anonymous function to call after a timeout.
   * @param strId {String} the id of this job. If this parameter is not <code>null</code> and a job already
   *    exists in the queue with this id, then this job is not added to the queue.
   * @param objThis {Object} if provided, this object is the "this" context for the anonymous function
        <code>objFunction</code> when it is called.
   * @param bClobber {boolean} if <code>true</code> and a job already exists, this new job clobbers the old job.
   * @since 3.2
   */
  jsx3.sleep = function(objFunction, strId, objThis, bClobber) {
    if (strId && jsx3._SLEEP_MAP[strId]) {
      if (bClobber)
        jsx3._SLEEP_MAP[strId][0] = null;
      else
        return;
    }

    var record = [objFunction, strId, objThis];
    var queue = jsx3._SLEEP_QUEUE;

    queue[queue.length] = record;
    if (strId != null)
      jsx3._SLEEP_MAP[strId] = record;

    if (!jsx3._SLEEP_TO)
      jsx3._SLEEP_TO = window.setTimeout(jsx3._sleepChunk, 0);
  };

  jsx3.QUEUE_DONE = "queueDone";

  /** @private @jsxobf-clobber */
  jsx3._sleepChunk = function() {
/* @JSC :: begin BENCH */
    jsx3.util.WeakMap.expire();
/* @JSC :: end */

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {

    // one queue item at a time so that items can't affect one another
    var item = jsx3._SLEEP_QUEUE.shift();
    var bEmpty = jsx3._SLEEP_QUEUE.length == 0;

    // do this before calling the queue item so that the next item is guaranteed to run
    // I don't think that IE has the Firefox 3.1 bug of executing timeouts synchronously 
    jsx3._SLEEP_TO = bEmpty ? null : window.setTimeout(jsx3._sleepChunk, 0);

    if (item && item[0]) { // necessary because of clobber option in sleep()
      delete jsx3._SLEEP_MAP[item[1]];
      item[0].apply(item[2]); // no try-catch because of how IE destroys the stack information
    }

    if (bEmpty)
      jsx3.publish({subject:jsx3.QUEUE_DONE}); // this could still fail if the last item throws an exception

/* @JSC */ } else {


    try {
      // Sync XHR may cause timeouts to fire in Firefox 3.0, fixed in 3.1
      // https://bugzilla.mozilla.org/show_bug.cgi?id=340345
      if (jsx3.lang.getVar("jsx3.net.Request.INSYNC"))
        return;

      var q = jsx3._SLEEP_QUEUE;
      jsx3._SLEEP_QUEUE = [];

      for (var i = 0; i < q.length; i++) {
        var item = q[i];
        if (item && item[0]) { // necessary because of clobber option in sleep()
          try {
            if (item[1] != null)
              delete jsx3._SLEEP_MAP[item[1]];
            item[0].apply(item[2]);
          } catch (e) {
            var l = jsx3.util.Logger;
            if (l) {
              var ex = jsx3.NativeError.wrap(e);
              l.GLOBAL.error(ex, ex);
            }
          }
        }
      }
    } finally {
      if (jsx3._SLEEP_QUEUE.length > 0) // more items could have been put in the queue while processing the last queue
        jsx3._SLEEP_TO = window.setTimeout(jsx3._sleepChunk, 0);
      else {
        jsx3._SLEEP_TO = null;
        jsx3.publish({subject:jsx3.QUEUE_DONE});
      }
    }

/* @JSC */ }

  };

  /**
   * @package
   */
  jsx3.startup = function() {
    if (window.OpenAjax) {
      try {
        OpenAjax.hub.registerLibrary("gi", "http://www.tibco.com/gi", jsx3.getVersion());
      } catch (e) {
        var l = jsx3.util.Logger;
        if (l) l.GLOBAL.error(jsx3._msg("boot.oah"), jsx3.NativeError.wrap(e));
      }
    }
  };

  /**
   * Called when the page hosting the JSX application is about to unload.
   * @package
   */
  jsx3.destroy = function() {
    if (jsx3.app && jsx3.app.Server) {
      var servers = jsx3.app.Server.allServers();
      for (var i = 0; i < servers.length; i++) {
        try {
          servers[i].destroy();
        } catch (e) {
          ;
        }
      }
    }

    if (jsx3.gui && jsx3.gui.Event) {
      var eTypes = ("BEFOREUNLOAD BLUR CHANGE CLICK DOUBLECLICK ERROR FOCUS KEYDOWN KEYPRESS KEYUP LOAD MOUSEDOWN " +
                    "MOUSEMOVE MOUSEOUT MOUSEOVER MOUSEUP MOUSEWHEEL UNLOAD RESIZE").split(/\s+/);
      for (var i = 0; i < eTypes.length; i++)
        jsx3.gui.Event.unsubscribeAll(jsx3.gui.Event[eTypes[i]]);
    }

    jsx3.NativeError.stopErrorCapture();

    var allScripts = document.getElementsByTagName("script");
    for (var i = 0; i < allScripts.length; i++) {
      var oneScript = allScripts.item(i);
      oneScript.parentNode.removeChild(oneScript);
    }
    
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    /* This is the only way I could find to tell the difference in IE6 between a reload event and a close event.
       It seems as though IE moves the window off-screen before destroying it. Knowing the difference is
       important for thwarting a memory leak in IE. The method of stopping the leak (document.write) breaks the
       reload button. */
//    window.alert("destroy " + window + " " + window.top + " " + (window == window.top) + " " + jsx3.gui.Event.wrap(window.event));

    if (window != window.top || 
        (window.event.clientX < -1 * window.screen.width && window.event.clientY < -1 * window.screen.height)) {
      // This helps IE to clean up memory in the same IE process. Without this call an IE process that spawns a
      // GI page over and over will use more and more memory.
//      window.document.write('');
//      if (window.opener && window.opener.jsx3)
//        window.opener.jsx3.log("closing window " + window.location);
    } else {
//      if (window.opener && window.opener.jsx3)
//        window.opener.jsx3.log("reloading window " + window.location);
    }
/* @JSC */ }

    jsx3.CLASS_LOADER.destroy();

    window.jsx3 = null;
  };
  
/* @JSC :: begin DEP */

  // DEPRECATED: remove in next version

  /**
   * Returns item as class if a type of function, not object (used by inheritance when transferring prototype methods)
   * @param strClassName {String} name of class
   * @return {Object}
   * @deprecated use <code>jsx3.lang.Class</code>
   * @private
   */
  jsx3.getClass = function(strClassName) {
    try {
      var c = eval(strClassName);
      return typeof(c) == "function" ? c : null;
    } catch (e) {
      return null;
    }
  };

  /**
   * Returns prototype object (a collection) belonging to class named, @strClassName
   * @param strClassName {String} name of class
   * @return {Object}
   * @deprecated use <code>jsx3.lang.Class</code>
   * @private
   */
  jsx3.getClassPrototype = function(strClassName) {
    try {
      var p = eval(strClassName + ".prototype");
      return (typeof(p) == "object" && typeof(p.constructor) == "function") ? p : null;
    } catch (e) {
      return null;
    }
  };

  /**
   * Returns a JavaScript array of all named constants for this class; these names (strings) can then be used by the developer to
   *            lookup/evaluate/modify applicable constants; To derive the value for the first named constant for the
   *            jsx3.gui.Block class, a method such as the following would work: var myFirstConstantValue = eval(jsx3.getClassConstants("jsx3.gui.Block")[0]);
   *            NOTE: passing an invalid class name results in a null value being returned.  If no constants exist for the given class, an empty array will be returned
   * @param strClassName {String} name of the class to get the constants for. For example: jsx3.gui.Block, jsx3.gui.Select, etc.
   * @return {Object} JavaScript array
   * @deprecated use <code>jsx3.lang.Class</code>
   * @see jsx3.lang.Class
   */
  jsx3.getClassConstants = function(strClassName) {
    var o = jsx3.getClass(strClassName);
    if (o != null) {
      var a = [];
      for (var p in o) {
        if (p.toUpperCase() == p) a[a.length] = strClassName + "." + p;
      }
      return a;
    }
  };

  /**
   * Returns a new-line-delimited (e.g., \n) list of all instance methods for the particular class
   * @param strClassName {String} name of the class to get the constants for. For example: jsx3.gui.Block, jsx3.gui.Select, etc.
   * @return {String}
   * @deprecated use <code>jsx3.lang.Class</code>
   * @see jsx3.lang.Class
   */
  jsx3.getInstanceMethods = function(strClassName) {
    var o = jsx3.getClassPrototype(strClassName);
    var a = [];
    for (var p in o) {
      if (typeof(o[p]) == "function") {
        var t = o[p].toString();
        a[a.length] = t.substring(9,t.indexOf(')')+1);
      }
    }
    return a;
  };

  /**
   * Returns a new-line-delimited (e.g., \n) list of all instance methods for the particular class
   * @param strClassName {String} name of the class to get the constants for. For example: jsx3.gui.Block, jsx3.gui.Select, etc.
   * @return {String}
   * @deprecated use <code>jsx3.lang.Class</code>
   * @see jsx3.lang.Class
   */
  jsx3.getClassMethods = function(strClassName) {
    var o = jsx3.getClass(strClassName);
    var s = "";
    for (var p in o) {
      if (typeof(o[p]) == "function") {
        var t = o[p].toString();
        s+= p + t.substring(8,t.indexOf(')')+1) + '\n';
      }
    }
    return s;
  };

  /**
   * transfers prototype methods from one class to another; establishes @superClass as the super for @subClass
   * @param subClass {String} named subclass to transfer prototypes to
   * @param superClass {String} named superclass to transfer prototypes from
   * @param bImplement {boolean} if true, @superClass is an interface
   * @return  the eval value of the script
   * @deprecated  create classes using <code>jsx3.Class</code>
   * @see jsx3.lang.Class
   */
  jsx3.doInherit = function(subClass, superClass,bImplement) {
    var objClass = jsx3.getClass(subClass);
    var objSuper = jsx3.getClass(superClass);

    if (objSuper == null) {
      jsx3.util.Logger.doLog("INHR01","Super class '" + superClass + "' of '" + subClass +
          "' not properly defined", 1, false);
      return;
    }

    if (objClass.isInherited == null || (bImplement != null && bImplement)) {
      if (!bImplement) {
        objClass.SUPER = superClass;
        objClass.SUPERS = {};
        for (var p in objSuper.SUPERS) {
          objClass.SUPERS[p] = objSuper.SUPERS[p];
          objClass.SUPERS[subClass] = 1;
        }
      }
      objClass.className = subClass;

      // keep track of the order in which to seach classes for overridden members
      if (objClass.INHERITANCE == null) objClass.INHERITANCE = [subClass];
      if (objSuper.INHERITANCE)
        for (var i = objSuper.INHERITANCE.length - 1; i >= 0; i--)
          objClass.INHERITANCE.splice(1, 0, objSuper.INHERITANCE[i]);
      else
        objClass.INHERITANCE.splice(1, 0, superClass);

      if (objClass.INTERFACES == null) objClass.INTERFACES = {};
      if (objSuper.INTERFACES) {
        for (var p in objSuper.INTERFACES) objClass.INTERFACES[p] = objSuper.INTERFACES[p];
      } else {
        objClass.INTERFACES[superClass] = "1";
      }
      objClass.INTERFACES[subClass] = "1";

      if (!(bImplement != null && bImplement)) objClass.isInherited = true;
      var objParentPrototype = jsx3.getClassPrototype(superClass);

      var objChildPrototype = jsx3.getClassPrototype(subClass);
      for (var p in objParentPrototype) {
        if (typeof(objChildPrototype[p]) != "function") {
          objChildPrototype[p] = objParentPrototype[p];
        }
      }
    }
  };

  /**
   * transfers prototype methods from one class to another
   * @param subClass {String} named subclass to transfer prototypes to
   * @param superClass {String} named superclass to transfer prototypes from
   * @return  the eval value of the script
   * @deprecated  create classes using <code>jsx3.Class</code>
   * @see jsx3.lang.Class
   */
  jsx3.doImplement = function(subClass, superClass) {
    jsx3.doInherit(subClass, superClass,true);
  };

  /**
   * transfer the methods of a class to a object instance
   * @param objInstance {object} any JavaScript object
   * @param strClassName {String} the name of a class
   * @deprecated  use <code>jsx3.Class.mixin()</code>
   * @see jsx3.lang.Class#mixin()
   */
  jsx3.doMixin = function(objInstance, strClassName) {
    var objClass = jsx3.getClassPrototype(strClassName);
    for (var f in objClass) {
      if (typeof(objClass[f]) == 'function') objInstance[f] = objClass[f];
    }
  };

  /**
   * Registers all prototype functions and properties, contained by the inner function @anonymousFunction; used by jsx3.Object
   * @param strClassName {String} named class containing the anonymous function to call
   * @param anonymousFunction {String} inner function containing named prototypes to bind
   * @deprecated  create classes using <code>jsx3.Class</code>
   * @see jsx3.lang.Class
   */
  jsx3.doDefine = function(strClassName, anonymousFunction) {
    var objClass = jsx3.getClass(strClassName);
    if (objClass.isDefined == null) {
      objClass.isDefined = true;
      anonymousFunction();
    }
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
   *
   * @jsxdoc-definition  jsx3.GO = function(strIdName, strNS){}
   */

  /**
   * Alias for <code>jsx3.util.Logger.doLog()</code> (formerly <code>jsx3.Error.doLog()</code>).
   *
   * @param strErrorNumber {String} arbitrary identifier passed by the calling function to track the specific location of the error
   * @param strMessage {String} message to describe the error
   * @param PRIORITY {int} one of 1, 2 or 3, with 1 being most serious (red..orange..yellow)
   * @param bTrace {boolean} true if null; if true, the stack trace is printed, displaying the order of the call stack
   * @deprecated  use <code>jsx3.log()</code> or the <code>jsx3.util.Logger</code> interface
   * @see #log()
   * @see jsx3.util.Logger
   */
  jsx3.out = function(strErrorNumber, strMessage, PRIORITY, bTrace) {
    if (jsx3.Class.forName("jsx3.util.Logger"))
      jsx3.util.Logger.doLog(strErrorNumber, strMessage, PRIORITY, bTrace);
  };

  window.doInherit = jsx3.doInherit;
  window.doImplement = jsx3.doImplement;
  window.doMixin = jsx3.doMixin;
  window.doDefine = jsx3.doDefine;
  
/* @JSC :: end */
  
  /**
   * Sends a message to the logging system. This method is an alias for <code>jsx3.util.Logger.GLOBAL.info()</code>.
   * <p/>
   * Since this method is defined before the logging system, any messages passed to this method before the logging 
   * system is defined are cached and sent with the first message passed after the logging system is defined.
   *
   * @param strMessage {String} the message to send to the logging system.
   * @see jsx3.util.Logger#GLOBAL
   */
  jsx3.log = function(strMessage) {
    if (jsx3.Class.forName("jsx3.util.Logger") && jsx3.util.Logger.GLOBAL) {
      // check for cached messages
      if (jsx3._logcache) {
        for (var i = 0; i < jsx3._logcache.length; i++)
          jsx3.util.Logger.GLOBAL.info(jsx3._logcache[i]);
        delete jsx3._logcache;
      }
      jsx3.util.Logger.GLOBAL.info(strMessage);
    } else {
      var cache = jsx3._logcache;
      if (!cache)
      /* @jsxobf-clobber */
        jsx3._logcache = cache = [];
      cache[cache.length] = strMessage;
    }
  };

  /**
   * Returns the version of General Interface.
   *
   * @jsxdoc-definition  jsx3.getVersion = function(){}
   */
});

/**
 * Application layer classes.
 */
jsx3.Package.definePackage("jsx3.app", function(){

});


/** 
 * Boolean class encapsulates GI's XML boolean values (0 and 1 rather than true and false).
 *
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Boolean", -, null, function(){});
 */
jsx3.Boolean = {};

/**
 * {int} 1
 * @final @jsxobf-final
 */
jsx3.Boolean.TRUE = 1;

/**
 * {int} 0
 * @final @jsxobf-final
 */
jsx3.Boolean.FALSE = 0;

/**
 * Returns <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>.
 * @param v {Object} boolean (or similar) that when evaluated via an 'if' would result in a true false; For example, null, 0 (numeric zero), and false all return  jsx3.Boolean.FALSE
 * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
 */
jsx3.Boolean.valueOf = function(v) {
  return v ? jsx3.Boolean.TRUE : jsx3.Boolean.FALSE;
};


/**
 * GUI classes.
 */
jsx3.Package.definePackage("jsx3.gui", function(gui){

  /**
   * generic handler that toggles the className or style property for an HTML element; can receive multiple parameter pairs
   * @param objGUI {HTMLElement} on-screen element (HTML element)
   * @param styleProps {Object} JavaScript object, supporting the named property, className, or one or more valid CSS styles. For example: {className:"myClass"} or {color:"#ff0000",fontWeight:"bold"}
   * @package
   */
  gui.shakeStyles = function(objGUI, styleProps) {
    var args = [];
    for (var i = 0; i < arguments.length - 1; i+=2) {
      objGUI = arguments[i];
      
      if (objGUI._jsxshaking) continue;
      objGUI._jsxshaking = true;
      
      styleProps = arguments[i+1];
      var origProps = {};
      for (var f in styleProps) {
        origProps[f] = f == 'className' ? objGUI.className : objGUI.style[f];
      }
      
      args.push(objGUI, origProps, styleProps);
    }
    
    gui._shakeStyles(args, 0, 6);
  };

  /** 
   * called by shakeStyles; toggles the actual CSS class and/or style property
   * @param args {Object} JavaScript array
   * @param thisTime {int} incrementer to toggle n-number of times
   * @param maxTimes {int} max number of times to toggle
   * @private
   * @jsxobf-clobber
   */
  gui._shakeStyles = function(args, thisTime, maxTimes) {
    if (thisTime == maxTimes) { 
      for (var i = 0; i < args.length - 2; i+=3) {
        var objGUI = args[i];
        objGUI._jsxshaking = null;
      }
      return;
    }
    
    for (var i = 0; i < args.length - 2; i+=3) {
      var objGUI = args[i];
      var styleProps = (thisTime % 2 == 0) ? args[i+2] : args[i+1];

      for (var f in styleProps) {
        if (f == 'className')
          objGUI.className = styleProps[f];
        else 
          objGUI.style[f] = styleProps[f];
      }
    }
    
    window.setTimeout(function() {gui._shakeStyles(args, thisTime+1, maxTimes);}, 75);
  };

  gui.isMouseEventModKey = function(objEvent) {
    if (jsx3.app.Browser.macosx)
      return objEvent.metaKey();
    else
      return objEvent.ctrlKey();
  };

});


/**
 * Base classes and the GI introspection framework. 
 * <p/>
 * Note that all classes in this package are also accessible under the <code>jsx3</code> namespace.
 */
jsx3.Package.definePackage("jsx3.lang", function(lang){

});


/**
 * Networking related classes.
 */
jsx3.Package.definePackage("jsx3.net", function(net){

});

/**
 * An interface specifying the methods necessary to define a context against which URIs are resolved.
 *
 * @since 3.2
 */
jsx3.Class.defineInterface("jsx3.net.URIResolver", null, function(URIResolver, URIResolver_prototype) {
  
  /** @private @jsxobf-clobber */
  URIResolver._SCHEME_REG = {};
  
  /**
   * @param strScheme {String}
   * @param objResolver {jsx3.net.URIResolver|Function}
   */
  URIResolver.register = function(strScheme, objResolver) {
    URIResolver._SCHEME_REG[strScheme] = objResolver;
  };
  
  /** @private @jsxobf-clobber */
  URIResolver._getAbsPathUri = function() {
    if (this._ABS_PATH_URI == null)
      /* @jsxobf-clobber */
      this._ABS_PATH_URI = new jsx3.net.URI(jsx3.getEnv("jsxabspath"));
    return this._ABS_PATH_URI;
  };
  
  /** @private @jsxobf-clobber */
  URIResolver._getHomePathUri = function() {
    var env = jsx3.getEnv("jsxhomepath");
    if (env == null) {
      // If we are running under Builder, and a jsxuser: URI is resolved before the project server loads,
      // then the URI will be resolved against the GI installation directory.
      return new jsx3.net.URI(jsx3.getEnv("jsxscriptapppath"));
    }
    
    if (this._HOME_PATH_URI == null)
      /* @jsxobf-clobber */
      this._HOME_PATH_URI = new jsx3.net.URI(env);
    return this._HOME_PATH_URI;
  };
  
  /**
   * {jsx3.net.URIResolver} The default URI resolver. This resolver can resolve any of the absolute URI formats
   * supported by the system. Other absolute URIs and all relative URIs are unmodified. The absolute URI formats are:
   * <ul>
   *   <li><code>JSX/...</code> &#8211;</li>
   *   <li><code>JSXAPPS/...</code> &#8211;</li>
   *   <li><code>GI_Builder/...</code> &#8211;</li>
   *   <li><code>jsx:/...</code> &#8211;</li>
   *   <li><code>jsxapp://appPath/...</code> &#8211;</li>
   *   <li><code>jsxaddin://addinKey/...</code> &#8211;</li>
   *   <li><code>jsxuser:/...</code> &#8211;</li>
   * </ul>
   */
  URIResolver.DEFAULT = URIResolver.jsxclass.newInnerClass();
  
  URIResolver.DEFAULT.resolveURI = function(strURI) {
    var uri = jsx3.net.URI.valueOf(strURI);
    var scheme = uri.getScheme();
    var path = uri.getPath();
    var resolver = URIResolver.getResolver(uri);

    var resolved = uri;
    
    if (resolver && resolver != URIResolver.DEFAULT) {
      if (uri.isAbsolute())
        uri = jsx3.net.URI.fromParts(null, null, null, null, path.substring(1), uri.getQuery(), uri.getFragment());
      resolved = resolver.resolveURI(uri);
    } else if (resolver) {
      resolved = URIResolver._getAbsPathUri().resolve(uri);
    } else if (uri.toString().indexOf(jsx3.APP_DIR_NAME + "/") == 0) {
      resolved = URIResolver.USER.resolveURI(uri);
    } else if (!scheme && path.indexOf("..") >= 0) {
      var loc = jsx3.app.Browser.getLocation();
      resolved = loc.relativize(loc.resolve(uri));
    }
    
    return resolved;    
  };
  
  URIResolver.DEFAULT.getUriPrefix = function() {
    return URIResolver._getAbsPathUri().toString();
  };
  
  URIResolver.DEFAULT.relativizeURI = function(strURI, bRel) {
    return jsx3.net.URI.valueOf(strURI);
  };
  
  /** 
   * {jsx3.net.URIResolver} Resolves URIs according to the default resolver except that all relative URIs are 
   * resolved relative to the <code>JSX/</code> directory. This resolver resolves the following URIs to the same value:
   * <ul>
   *   <li><code>JSX/file.xml</code></li>
   *   <li><code>jsx:/file.xml</code></li>
   *   <li><code>file.xml</code></li>
   * </ul>
   */
  URIResolver.JSX = URIResolver.jsxclass.newInnerClass();
  URIResolver.register("jsx", URIResolver.JSX);
  
  URIResolver.JSX.getURI = function() {
    if (this._uri == null)
      this._uri = URIResolver._getAbsPathUri().resolve(jsx3.SYSTEM_ROOT + "/");
    return this._uri;
  };
  
  URIResolver.JSX.resolveURI = function(strURI) {
    var uri = jsx3.net.URI.valueOf(strURI);
    
    if (!URIResolver.isAbsoluteURI(uri))
      uri = this.getURI().resolve(uri);

    return URIResolver.DEFAULT.resolveURI(uri);
  };
  
  URIResolver.JSX.getUriPrefix = function() {
    return URIResolver._getAbsPathUri() + jsx3.SYSTEM_ROOT + "/";
  };  
  
  URIResolver.JSX.relativizeURI = function(strURI, bRel) {
    var relative = this.getURI().relativize(strURI);
    if (relative.isAbsolute() || bRel)
      return relative;
    else
      return jsx3.net.URI.fromParts("jsx", null, null, null, 
          "/" + relative.getPath(), relative.getQuery(), relative.getFragment());
  };
  
  /** 
   * {jsx3.net.URIResolver} Resolves URIs according to the default resolver except that all relative URIs are 
   * resolved relative to the user directory (or <code>JSXAPPS/../</code>). This resolver resolves the following 
   * URIs to the same value:
   * <ul>
   *   <li><code>JSXAPPS/../file.xml</code></li>
   *   <li><code>jsxuser:/file.xml</code></li>
   *   <li><code>file.xml</code></li>
   * </ul>
   */
  URIResolver.USER = URIResolver.jsxclass.newInnerClass();
  URIResolver.register("jsxuser", URIResolver.USER);
  
  URIResolver.USER.resolveURI = function(strURI) {
    var uri = jsx3.net.URI.valueOf(strURI);

    if (uri.getPath().indexOf(jsx3.APP_DIR_NAME + "/") == 0 || !URIResolver.isAbsoluteURI(uri))
      return URIResolver._getHomePathUri().resolve(uri);
  
    return URIResolver.DEFAULT.resolveURI(uri);
  };
  
  URIResolver.USER.getUriPrefix = function() {
    return URIResolver._getHomePathUri().toString();
  };  
  
  URIResolver.USER.relativizeURI = function(strURI, bRel) {
    var loc = jsx3.app.Browser.getLocation();

    var relative = loc.resolve(jsx3.getEnv("jsxhomepath")).relativize(loc.resolve(strURI));
    if (relative.isAbsolute() || bRel)
      return relative;
    else
      return jsx3.net.URI.fromParts("jsxuser", null, null, null, 
          "/" + relative.getPath(), relative.getQuery(), relative.getFragment());
  };
    
  /**
   * Returns whether the URI <code>strURI</code> is considered absolute in the JSX system. Implementors of the
   * <code>URIResolver</code> interface should always delegate resolution of absolute URIs to the default resolver.
   * This method is not equivalent to <code>URI.isAbsolute()</code> because, for example, URIs beginning with 
   * <code>"JSX/"</code> are considered absolute in the JSX system.
   *
   * @param strURI {String|jsx3.net.URI}
   * @return {boolean}
   */
  URIResolver.isAbsoluteURI = function(strURI) {
    var uri = jsx3.net.URI.valueOf(strURI);
    if (uri.getScheme() != null) return true;
    var path = uri.getPath();
    return path.indexOf("/") == 0 || 
           path.indexOf(jsx3.SYSTEM_ROOT + "/") == 0 || 
           path.indexOf(jsx3.APP_DIR_NAME + "/") == 0 || 
           path.indexOf("GI_Builder/") == 0;    
  };
  
  /**
   * Returns the resolver explicitly referenced in the scheme, host, and path parts of the URI <code>strURI</code>. 
   * This method returns the the following values depending URI:
   * <ul>
   *   <li>jsx: &#8211; <code>URIResolver.JSX</code>.</li>
   *   <li>jsxapp: &#8211; and instance of <code>URIResolver</code> capable of resolving URIs relative to the base
   *     directory of the application corresponding to the host part of the URI.</li>
   *   <li>jsxaddin: &#8211; the instance of <code>jsx3.app.AddIn</code> corresponding to the host part of the URI. If
   *     the addin is not loaded then <code>null</code> is returned.</li>
   *   <li>jsxuser: &#8211; <code>URIResolver.USER</code>.</li>
   *   <li>JSX/ &#8211; <code>URIResolver.DEFAULT</code>.</li>
   *   <li>JSXAPPS/ &#8211; <code>URIResolver.USER</code>.</li>
   *   <li>GI_Builder/ &#8211; <code>URIResolver.DEFAULT</code>.</li>
   *   <li>otherwise <code>null</code>.</li>
   * </ul>
   *
   * @param strURI {String|jsx3.net.URI}
   * @return {jsx3.net.URIResolver}
   */
  URIResolver.getResolver = function(strURI) {    
    var uri = jsx3.net.URI.valueOf(strURI);
    var scheme = uri.getScheme();
    var resolver = null;
    
    if (scheme) {
      resolver = URIResolver._SCHEME_REG[scheme];
      
      if (typeof(resolver) == "function")
        resolver = resolver(uri);
    } else {
      var path = uri.getPath();

      if (path.indexOf(jsx3.SYSTEM_ROOT + "/") == 0 || path.indexOf("GI_Builder/") == 0)
        resolver = URIResolver.DEFAULT;
/* @JSC :: begin DEP */
      else if (jsx3.getEnv('jsxurirslv') == '3.6' && path.indexOf(jsx3.APP_DIR_NAME + "/") == 0)
        resolver = URIResolver.USER;
/* @JSC :: end */
    }
    
    return resolver;
  };
  
  /**
   * Resolves the URI <code>strURI</code> against the base context of this resolver. Converts a URI relative to this
   * resolver into a URI relative to the URL of the HTML page containing the JSX system. Implementations of this
   * method should delegate to the default resolver any URIs that are judged to be absolute by the method
   * <code>URIResolver.isAbsoluteURI()</code>.
   *
   * @param strURI {String|jsx3.net.URI}
   * @return {jsx3.net.URI}
   * @see #isAbsoluteURI()
   */
  URIResolver_prototype.resolveURI = jsx3.Method.newAbstract("strURI");
  
  /**
   * Returns the URI prefix that when prepended to relative URIs resolves them. This prefix may include 
   * <code>"../"</code> path segments. 
   *
   * @return {String}
   */
  URIResolver_prototype.getUriPrefix = jsx3.Method.newAbstract();
  
  /**
   * Transforms a URI relative to the URL of the HTML page containing the JSX system into an absolute URI defined
   * in relation to this resolver. When resolved against any resolver, the returned URI resolves to <code>strURI</code>.
   *
   * @param strURI {String|jsx3.net.URI}
   * @param bRel {boolean}
   * @return {jsx3.net.URI}
   */
  URIResolver_prototype.relativizeURI = jsx3.Method.newAbstract("strURI", "bRel");
  
});

/**
 * XML related classes.
 */
jsx3.Package.definePackage("jsx3.xml", function(xml){

});
