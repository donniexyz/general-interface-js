/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/*
 * Defines a GI framework for writing tests based on JsUnit.
 */

if (!window.gi) window.gi = new Object();
if (!gi.test) gi.test = new Object();
if (!gi.test.jsunit) gi.test.jsunit = new Object();

gi.test.jsunit._init = function(jsunit) {

  jsunit.FILE_SCHEME = String(document.location.protocol).indexOf("file") == 0;
  jsunit.JSX_BASE = "../../";
  jsunit.JSX_JS_BASE = jsunit.JSX_BASE + "JSX/js/";
  jsunit.TEST_BASE = "%2E%2E/tests/";
  jsunit.HTTP_BASE = jsunit.FILE_SCHEME ? "http://www.generalinterface.org/tests" : "../server";
  
  jsunit._PENDING_SUITES = [];

  jsunit.decodeURI = function(strText) {
    if (strText == null) return null;
    if (strText.indexOf("%") < 0) return strText;

    var length = strText.length;
    var decoded = new Array(length);
    var j = 0;

    for (var i = 0; i < strText.length; i++) {
      var chr = strText.charAt(i);
      if (chr == "%") {
        var octet = strText.substring(i+1, i+3);
        if (octet.match(/[^a-fA-F0-9]/)) {
          decoded[j++] = chr;
        } else {
          decoded[j++] = String.fromCharCode(parseInt(octet, 16));
          i += 2;
        }
      } else {
        decoded[j++] = chr;
      }
    }

    return decoded.join("");
  };

  jsunit.getQueryParams = function(strURL) {
    var params = {};
    var index = strURL.indexOf("?");
    if (index < 0) return params;
    var query = strURL.substring(index+1);
    var pairs = query.split(/&/g);
    for (var i = 0; i < pairs.length; i++) {
      var nv = pairs[i].split("=", 2);
      params[jsunit.decodeURI(nv[0])] = jsunit.decodeURI(nv[1]);
    }
    return params;
  };

  /**
   *
   */
  jsunit.newJsSuite = function(strTest1) {
    var s = new top.jsUnitTestSuite();
    var a = [s];
    for (var i = 0; i < arguments.length; i++)
      a.push(arguments[i]);

    jsunit._addJsTests.apply(jsunit, a);
    return s;
  };

  jsunit._addJsTests = function(objSuite, strTest1) {
    for (var i = 1; i < arguments.length; i++) {
      var arg = arguments[i];
      if (!(arg instanceof Array)) arg = [arg];
      for (var j = 0; j < arg.length; j++)
        arg[j] = jsunit.TEST_BASE + arg[j];
      objSuite.addTestPage("../gi/test-js.html?extjs=" + arg.join(","));
    }
  };

  jsunit.loadScript = function(strSrc, fctDone, objAttr) {
    jsunit.debug("Loading " + strSrc);
    // instance a new DOM element
    var element = document.createElement("script");
    element.src = strSrc;
    element.type = 'text/javascript';

    if (objAttr) {
      for (var f in objAttr)
        element.setAttribute(f, objAttr[f]);
    }

    if (fctDone) {
      element.onreadystatechange = function() {
        var state = this.readyState;
        if (state == "loaded" || state == "interactive" || state == "complete") {
          this.onreadystatechange = null;
          this.onload = null;
          fctDone(strSrc);
        }
      };
      element.onload = function() {
        element.onreadystatechange = null;
        element.onload = null;
        fctDone(strSrc);
      };
    }

    // bind the element to the browser DOM to begin loading the resource
    document.getElementsByTagName("head")[0].appendChild(element);
  };

  jsunit.loadGI = function() {
    jsunit.loadScript(jsunit.JSX_JS_BASE + "JSX30.js", jsunit._doneLoadingJSX30,
        {jsxappempty:"true"});
  };

  jsunit.TestSuite = function(strPrefix) {
    var tokens = strPrefix.split(/\W/);
    this._prefix = tokens.join("_");
    tokens.pop();
    this._path = tokens.join("/") + "/";
  };

  jsunit.TestSuite.prototype.getPrefix = function() {
    return this._prefix;
  };

  jsunit.TestSuite.prototype.resolveURI = function(strPath) {
    var path = jsunit.TEST_BASE + this._path + strPath;
    return jsunit.decodeURI(path);
  };

  jsunit.TestSuite.prototype.newServer = function(strConfig, strPath, bGUI, objEnv) {
    var doc = null;
    if (strConfig) {
      doc = (new jsx3.xml.Document()).load(this.resolveURI(strConfig));
      if (doc.hasError())
        throw new JsUnitException("Error loading server configuration file: " + doc.getError());
    } else {
      doc = (new jsx3.xml.Document()).loadXML("<data/>");
    }

    var settings = new jsx3.app.Settings(doc);
    if (objEnv == null) objEnv = {};
    objEnv.jsxsettings = settings;

    var objGUI = null;
    if (bGUI) {
      objGUI = document.createElement("div");
      document.getElementsByTagName("body")[0].appendChild(objGUI);
    }

    return new jsx3.app.Server(this.resolveURI(strPath), objGUI, bGUI, objEnv);
  };

  jsunit.TestSuite.prototype.asyncCallback = function(fctTest) {
    return function() {
      if (eval("typeof(asyncTestWaiting) == 'undefined' || asyncTestWaiting !== true")) {
        var msg = "Executing async callback before async waiting: " + fctTest;
        if (jsunit.INTERACTIVE) {
          window.alert(msg);
        } else {
          throw new Error(msg);
        }
      }

      try {
        fctTest.apply(this, arguments);
      } catch (e) {
        eval("asyncTestException = e;");
      }

      if (jsunit._lastTearDown)
        jsunit._lastTearDown();

      eval("asyncTestWaiting = false;");
    };
  };

  jsunit.TestSuite.prototype._prefix = null;
  jsunit.TestSuite.prototype._path = null;
  jsunit.TestSuite.prototype._setUp = null;
  jsunit.TestSuite.prototype._tearDown = null;
  jsunit.TestSuite.prototype._if = null;
  jsunit.TestSuite.prototype._unless = null;
  jsunit.TestSuite.prototype._async = null;
  jsunit.TestSuite.prototype._skip = null;
  jsunit.TestSuite.prototype._skip_unless = null;

  /**
   *
   */
  jsunit.defineTests = function(strPrefix, objFunct) {
    if (! jsunit.DEP && !jsunit.NODEP) {
      jsunit._PENDING_SUITES.push([strPrefix, objFunct]);
      jsunit.require("jsx3.lang.ClassLoader");
      return;
    }

    this._definePendingTests();

    var t = new jsunit.TestSuite(strPrefix);
    objFunct(t, jsunit);
    jsunit._exposeTests(t);
  };

  jsunit._definePendingTests = function() {
    if (jsunit._PENDING_SUITES.length > 0) {
      var suites = jsunit._PENDING_SUITES.concat();
      jsunit._PENDING_SUITES = [];

      for (var i = 0; i < suites.length; i++)
        jsunit.defineTests(suites[i][0], suites[i][1]);
    }
  };

  jsunit.makeTestFunction = function(fctBody, arg1) {
    var a = [];
    for (var i = 1; i < arguments.length; i++)
      a[i-1] = arguments[i];

    return function() {
      fctBody.apply(null, a);
    };
  };

  jsunit._tests = [];

  jsunit._exposeTests = function(objTests) {
    for (var f in objTests) {
      if (typeof(jsunit.TestSuite.prototype[f]) != "undefined") continue;
      if (typeof(objTests[f]) != "function") continue;

      var name = objTests.getPrefix() + "__" + f;
      if (jsunit._tests[name]) {
        if (jsunit.INTERACTIVE)
          window.alert("Redefinition of test " + name);
        else
          ;
      } else {
        var skipCond = jsunit._getMeta("_skip", objTests[f], objTests);
        var skipUnlessCond = jsunit._getMeta("_skip_unless", objTests[f], objTests);

        if ((skipCond && jsunit._matchIf(skipCond)) || (skipUnlessCond && !jsunit._matchIf(skipUnlessCond))) {
          jsunit.inform("Skipping " + name);
          continue;
        }

        jsunit._tests.push(name);

        // HACK: IE doesn't like this for some reason. If a test fails, generic "Object doesn't support..." is reported.
        // window[name] = jsunit._makeTestFunct(name, objTests[f], objTests);

        // HACK: eval seems to work fine in IE
        var fctTest = jsunit._makeTestFunct(name, objTests[f], objTests);
        eval(name + " = fctTest;");
      }
    }

    if (window.exposeTestFunctionNames == null)
      window.exposeTestFunctionNames = function() {
        return jsunit._tests;
      };
  };

  jsunit._makeTestFunct = function(strName, fctTest, objMeta) {
    var fctSetUp = jsunit._getMeta("_setUp", fctTest, objMeta);
    var fctTearDown = jsunit._getMeta("_tearDown", fctTest, objMeta);
    var ifCond = jsunit._getMeta("_if", fctTest, objMeta);
    var unlessCond = jsunit._getMeta("_unless", fctTest, objMeta);
    var async = jsunit._getMeta("_async", fctTest, objMeta);

    if (fctSetUp || fctTearDown)
      fctTest = jsunit._makeSetupFunct(fctTest, fctSetUp, fctTearDown, async);

    if (ifCond || unlessCond) {
      if (async)
        jsunit.warn("Test " + strName + " cannot be async and have if or unless condition.");
      else
        fctTest = jsunit._makeIfFunct(fctTest, strName, ifCond ? "if" : "unless", ifCond || unlessCond);
    }

    if (async)
      fctTest = jsunit._makeAsyncFunct(fctTest);

    return fctTest;
  };

  jsunit._makeAsyncFunct = function(fctTest) {
    return function() {
      eval("asyncTestWaiting = true;");
      fctTest();
    };
  };

  jsunit._makeSetupFunct = function(fctTest, fctSetUp, fctTearDown, bAsync) {
    if (!bAsync && fctTearDown) {
      return function() {
        if (fctSetUp) fctSetUp();
        try {
          fctTest();
        } finally {
          fctTearDown();
        }
      };
    } else {
      return function() {
        jsunit._lastTearDown = null;
        
        if (fctSetUp) fctSetUp();
        fctTest();

        if (fctTearDown) {
          if (eval("typeof(asyncTestWaiting) == 'undefined' || asyncTestWaiting !== true")) {
            fctTearDown();
          } else {
            jsunit._lastTearDown = fctTearDown;
          }
        }
      };
    }
  };

  jsunit._makeIfFunct = function(fct, strName, strType, strCond) {
    return function() {
      if (strType == "if" ? !jsunit._matchIf(strCond) : jsunit._matchIf(strCond)) {
        try {
          fct();
          jsunit.warn("Test " + strName + " passed even though it passed " + strType + " condition (" + strCond + ").");
        } catch (e) {
          if (e instanceof JsUnitException) {
            jsunit.inform("Test " + strName + " failed but didn't pass " + strType + " condition (" + strCond + "): " + e.jsUnitMessage);
          } else {
            jsunit.inform("Test " + strName + " failed but didn't pass " + strType + " condition (" + strCond + "): " + e.message);
          }
        }
      } else {
        fct();
      }
    };
  };

  jsunit._matchIf = function(strCond) {
    var tokens = strCond.split(/[\s,;]+/g);
    for (var i = 0; i < tokens.length; i++) {
      if (jsunit[tokens[i]])
        return true;
    }
    return false;
  };

  jsunit._getMeta = function(field, fct, meta) {
    return typeof(fct[field]) == "undefined" ? meta[field] : fct[field];
  };

  /**
   *
   */
  jsunit.require = function(strClass1) {
    jsunit.debug("Requiring " + strClass1 + "...");

    var bFirst = jsunit._waiting == null;
    if (bFirst)
      jsunit._waiting = [];

    for (var i = 0; i < arguments.length; i++) {
      try {
        if (eval(arguments[i]) == null) {
          jsunit._waiting.push(arguments[i]);
        }
      } catch (e) {
        jsunit._waiting.push(arguments[i]);
      }
    }

    if (window.setUpPage == null)
      window.setUpPage = function() {};
  };

  jsunit._doneLoadingJSX30 = function(strSrc) {
    if (strSrc == jsunit.JSX_JS_BASE + "JSX30.js") {
      // Copy CLASS_LOADER browser tokens into jsunit
      var tokens = ["IE", "IE7", "MOZ", "FX", "SAF", "GOG", "KON", "SVG", "VML"];
      for (var i = 0; i < tokens.length; i++)
        jsunit[tokens[i]] = jsx3.CLASS_LOADER[tokens[i]];

      // Copy any URL parameters into JSX environment
      var params = jsunit.getQueryParams(window.location.search);
      for (var p in params)
        jsx3.setEnv(p, params[p]);
    }

    jsunit._tryLoadLogger();

    for (var i = 0; jsunit._waiting && i < jsunit._waiting.length; i++) {
      try {
        if (eval(jsunit._waiting[i]) != null)
          jsunit._waiting.splice(i--, 1);
      } catch (e) {;}
    }

//    jsunit.debug("Loaded " + strSrc + ". Still waiting for [" + jsunit._waiting + "]");

    if (jsunit._jsxbaseclasses == null) {
      jsunit._jsxbaseclasses = jsx3.lang.ClassLoader.SYSTEM_SCRIPTS.concat();

      jsunit.BUILD = jsunit._jsxbaseclasses.length <= 2;
      jsunit.SOURCE = !jsunit.BUILD;
      jsunit.DEP = typeof(jsx3.ABSOLUTEPATH) == "string";
      jsunit.NODEP = !jsunit.DEP;
      jsunit.INTERACTIVE = jsx3.getEnv("jsxtestinter") == "1";
      jsunit.NOINTERACTIVE = !jsunit.INTERACTIVE;
      jsunit.NETWORK = true;
      jsunit.NONETWORK = !jsunit.NETWORK;

      jsunit[String(window.location.protocol).replace(/\W/g, "")] = true;

      jsunit._definePendingTests();
    }

    if (jsunit._waiting && jsunit._waiting.length > 0) {
      if (jsunit._jsxbaseclasses.length > 0) {
        var nextPath = jsunit._jsxbaseclasses.shift();
        // HACK: without timeout was causing stack overflow on Safari
        window.setTimeout(function() {
          jsunit.loadScript(jsx3.CLASS_LOADER.resolvePath(jsunit.JSX_JS_BASE + nextPath), jsunit._doneLoadingJSX30);
        }, 0);
      } else {
        for (var i = 0; i < jsunit._waiting.length; i++) {
          try {
            jsunit.debug("Requiring class " + jsunit._waiting[i] + "...");
            jsx3.require(jsunit._waiting[i]);
          } catch (e) {
            jsunit.warn("Could not load class " + jsunit._waiting[i] + ": " + e);
          }
        }

        jsunit._loadJsxIncludes();

        jsunit._waiting = [];
        window.setTimeout(function() {
          jsunit.debug("Setting status to complete (A).");
          jsunit._testLoaded();
        }, 0);
      }
    } else {
      jsunit._loadJsxIncludes();

      window.setTimeout(function() {
        jsunit.debug("Setting status to complete (B).");
        jsunit._testLoaded();
      }, 0);
    }
  };

  jsunit._tryLoadLogger = function() {
    if (!this._loggerinit && jsx3.util && jsx3.util.Logger) {
      this._loggerinit = true;
      var h = new jsx3.util.Logger.FormatHandler("jsunit");
      var methods = [null, "fail", "warn", "warn", "inform", "debug", "debug"];
      h.handle = function(objRecord) {
        var m = window[methods[objRecord.getLevel()]];
        if (m) {
          try {
            m.apply(window, [jsx3.util.strEscapeHTML(this.format(objRecord))]);
          } catch (e) {;}
        }
      };
      jsx3.util.Logger.GLOBAL.addHandler(h);
    }
  };

  jsunit._testLoaded = function() {
    // For some reason, on Safari 4 JS files loaded after the page loads do not generate page load events. This breaks
    // the way JsUnit works by default so we need to set isTestPageLoaded here explicitly. 
    eval('setUpPageStatus = "complete"; isTestPageLoaded = true;');
  };

  jsunit._loadJsxIncludes = function() {
    // NOTE: this depends on unpublished API of the GI class loader
    if (jsx3.app && jsx3.app.PropsBundle && jsx3.System) {
      jsx3.app.PropsBundle.getProps(jsunit.JSX_BASE + "JSX/locale/messages.xml", null, jsx3.getSystemCache());
      jsx3.app.PropsBundle.getProps(jsunit.JSX_BASE + "JSX/locale/locale.xml", null, jsx3.getSystemCache());
    }
  };

  // Assertion functions

  /**
   *
   */
  jsunit.assert = function() {
    return assert.apply(null, arguments);
  };

  /**
   *
   */
  jsunit.assertTrue = function() {
    return assertTrue.apply(null, arguments);
  };

  /**
   *
   */
  jsunit.assertFalse = function() {
    return assertFalse.apply(null, arguments);
  };

  jsunit.assertArrayEquals = function() {
    _validateArguments(2, arguments);
    var var1=nonCommentArg(1, 2, arguments);
    var var2=nonCommentArg(2, 2, arguments);

    if (!var1.length || !var2.length) return false; // (not arrays)
    if (var1.length == var2.length) {
      for (var i in var1) {
        assertEquals(var1[i],var2[i]);
      }
    }
  };
  /**
   *
   */
  jsunit.assertEquals = function() {
    _validateArguments(2, arguments);
    var var1=nonCommentArg(1, 2, arguments);
    var var2=nonCommentArg(2, 2, arguments);

    if (var1 != null && typeof(var1) == "object" && typeof(var1.equals) == "function") {
      if (!var1.equals(var2))
        throw new JsUnitException(commentArg(2, arguments), "Expected " + var1 + " but was " + var2 + ".");
    } else {
      return assertEquals.apply(null, arguments);
    }
  };

  /**
   *
   */
  jsunit.assertNotEquals = function() {
    _validateArguments(2, arguments);
    var var1=nonCommentArg(1, 2, arguments);
    var var2=nonCommentArg(2, 2, arguments);

    if (var1 != null && typeof(var1) == "object" && typeof(var1.equals) == "function") {
      if (var1.equals(var2))
        throw new JsUnitException(commentArg(2, arguments), "Expected not equal to " + var1 + " but was " + var2 + ".");
    } else {
      return assertNotEquals.apply(null, arguments);
    }
  };

  /**
   *
   */
  jsunit.assertNull = function() {
    return assertNull.apply(null, arguments);
  };

  /**
   *
   */
  jsunit.assertNullOrUndef = function() {
    _validateArguments(1, arguments);
    var aVar=nonCommentArg(1, 1, arguments);
    _assert(commentArg(1, arguments), aVar === null || aVar === top.JSUNIT_UNDEFINED_VALUE,
        'Expected undefined or null but was ' + _displayStringForValue(aVar));
  };

  /**
   *
   */
  jsunit.assertNotNullOrUndef = function() {
    _validateArguments(1, arguments);
    var aVar=nonCommentArg(1, 1, arguments);
    _assert(commentArg(1, arguments), !(aVar === null || aVar === top.JSUNIT_UNDEFINED_VALUE),
        'Expected not undefined and not null but was ' + _displayStringForValue(aVar));
  };

  /**
   *
   */
  jsunit.assertNotNull = function() {
    return assertNotNull.apply(null, arguments);
  };

  /**
   *
   */
  jsunit.assertUndefined = function() {
    return assertUndefined.apply(null, arguments);
  };

  /**
   *
   */
  jsunit.assertNotUndefined = function() {
    return assertNotUndefined.apply(null, arguments);
  };

  /**
   *
   */
  jsunit.assertNaN = function() {
    return assertNaN.apply(null, arguments);
  };

  /**
   *
   */
  jsunit.assertNotNaN = function() {
    return assertNotNaN.apply(null, arguments);
  };

  /**
   *
   */
  jsunit.assertInstanceOf = function(strMessage, objArg, fctConstructor) {
    _validateArguments(2, arguments);
    var var1=nonCommentArg(1, 2, arguments);
    var var2=nonCommentArg(2, 2, arguments);

    fctConstructor = typeof(var2) == "string" ? eval(fctConstructor) : var2;

    if (typeof(fctConstructor) != "function")
      throw new JsUnitException(commentArg(2, arguments), "Second argument to assertInstanceOf() must be a function.");

    if (!(var1 instanceof fctConstructor || (var1 && var1.instanceOf && var1.instanceOf(fctConstructor))))
      throw new JsUnitException(commentArg(2, arguments), "Expected " + var1 + " to be an instance of " +
          (fctConstructor.jsxclass || fctConstructor) + ".");
  };

  /**
   *
   */
  jsunit.assertTypeOf = function(strMessage, objArg, strType) {
    _validateArguments(2, arguments);
    var var1=nonCommentArg(1, 2, arguments);
    var var2=nonCommentArg(2, 2, arguments);

    if (typeof(var1) != var2)
      throw new JsUnitException(commentArg(2, arguments), "Expected " + var1 + " (" + typeof(var1) + ") to be typeof " + var2 + ".");
  };

  /**
   *
   */
  jsunit.assertThrows = function(strMessage, fctCall, fctType) {
    if (typeof(strMessage) == "function") {
      fctType = fctCall;
      fctCall = strMessage;
      strMessage = null;
    }

    var ex = null;
    try {
      fctCall();
    } catch (e) {
      ex = e;
    }

    if (ex == null)
      throw new JsUnitException(strMessage, "Expected exception raised.");

    if (fctType && !(ex instanceof fctType))
      throw new JsUnitException(strMessage, "Expected exception " + ex + " to be of type " + fctType + ".");
  };

  /**
   *
   */
  jsunit.assertMatches = function(strMessage, regex, strText) {
    var var1=nonCommentArg(1, 2, arguments);
    var var2=nonCommentArg(2, 2, arguments);

    if (!(var1 instanceof RegExp)) var1 = new RegExp(String(var1));
    var2 = String(var2);

    if (! var1.test(var2))
      throw new JsUnitException(commentArg(2, arguments), "Expected '" + var2 + "' to match regular expression " + var1 + ".");
  };

  // Logging functions

  /**
   *
   */
  jsunit.fail = function() {
    return fail.apply(null, arguments);
    if (window.console) try { window.console.error.apply(window.console, arguments); } catch (e) {}
  };

  /**
   *
   */
  jsunit.warn = function() {
    if (window.warn) warn.apply(null, arguments);
    if (window.console) try { window.console.warn.apply(window.console, arguments); } catch (e) {}
  };

  /**
   *
   */
  jsunit.inform = function() {
    if (window.inform) inform.apply(null, arguments);
    if (window.console) try { window.console.info.apply(window.console, arguments); } catch (e) {}
  };

  /**
   *
   */
  jsunit.debug = function() {
    if (window.debug) debug.apply(null, arguments);
    if (window.console) try { window.console.debug.apply(window.console, arguments); } catch (e) {}
  };

};

gi.test.jsunit._init(gi.test.jsunit);
delete gi.test.jsunit._init;
