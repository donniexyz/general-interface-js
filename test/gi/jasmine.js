/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/*
 * Defines a GI framework for writing tests based on Jasmine.
 */

if (!window.gi) window.gi = new Object();
if (!gi.test) gi.test = new Object();
if (!gi.test.jasmine) gi.test.jasmine = new Object();

  /* Browser detection, the result of which is setting the strPath variable. */
  var BrowserDetect = function() {
    var vers, agt = this.agt = navigator.userAgent.toLowerCase();

    this.gk = agt.indexOf('gecko') >= 0;

    // Mozilla Firefox v1.5-4
    this.fx = this.gk && (agt.indexOf('firefox') >= 0 || agt.indexOf('granparadiso') >= 0);
    if (this.fx) {
      vers = this._getVersionAfter('firefox/') || this._getVersionAfter('granparadiso/');
      this.fx1_5 = vers >= 1.5 && vers < 2;
      this.fx2 = vers >= 2 && vers < 3;
      this.fx3 = vers >= 3 && vers < 4;
      this.fx4 = vers >= 4;
    }

    // Apple WebKit (Safari) v3-4
    this.sf = agt.indexOf('applewebkit') >= 0;
    if (this.sf) {
      if (agt.indexOf('chrome/') >= 0) {
        this.gc1 = true;
      } else {
        vers = this._getVersionAfter('version/');
        this.sf3 = vers >= 3 && vers < 4;
        this.sf4 = vers >= 4;
      }
    }

    // Opera v9-10
    this.op = agt.indexOf("opera") >= 0;
    if (this.op) {
      vers = this._getVersionAfter('opera/') || this._getVersionAfter('opera ');
      this.op9 = vers >= 9 && vers < 10;
      this.op10 = vers >= 10;
    }

    // Microsoft Internet Explorer v6-9+
    this.ie = agt.indexOf("msie") >= 0 && !this.op||!!document.documentMode;
    if (this.ie) {
      vers = this._getVersionAfter('msie ')||this._getVersionAfter("rv:");
      this.ie6 = vers >= 6 && vers < 7;
      this.ie7 = vers >= 7 && vers < 8;
      this.ie8 = vers >= 8 && vers < 9;
      this.ie9 = vers >= 9 && vers < 10;
      this.ie9s = vers >= 9 && document.documentMode >= 9;
      this.ie10 = vers >= 10 && vers < 11;
      this.ie11 = vers >= 11;
    }
  };

  /* @jsxobf-clobber */
  BrowserDetect._ORDER = [
      "ie11","ie10", "ie9s", "ie9", "ie8", "ie7", "ie6",
      "fx4", "fx3", "fx2", "fx1_5",
      "gc1", "sf4", "sf3",
      "op10", "op9",
      "ie", "fx", "sf", "op", "gk"
  ];

  /* @jsxobf-clobber */
  BrowserDetect.prototype._getVersionAfter = function(strToken) {
    var index = this.agt.indexOf(strToken);
    return index >= 0 ? parseFloat(this.agt.substring(index+strToken.length)) : 0;
  };

  BrowserDetect.prototype.getType = function() {
    for (var i = 0; i < BrowserDetect._ORDER.length; i++)
      if (this[BrowserDetect._ORDER[i]])
        return BrowserDetect._ORDER[i];
    return "xx";
  };

gi.test.jasmine._init = function(_jasmine, undefined) {
  var _BROWSERS = {
    ie7:["IE","IE7","VML"],
    ie8:["IE","IE8","VML"],
    ie9:["IE","IE9","VML"],
    ie9s:["IE","IE9","SVG"],
    ie10:["IE","IE10","SVG"],
    ie11:["IE","IE11","SVG"],
    fx1_5:["FX","SVG","GKO"],
    fx2:["FX","FX2","SVG","GKO"],
    fx3:["FX","FX3","SVG","GKO"],
    fx4:["FX","FX4","SVG","GKO"],
    gc1:["SAF","SAF4","SVG","WBK","GOG"],
    sf3:["SAF","SAF3","SVG","WBK"],
    sf4:["SAF","SAF4","SVG","WBK"]
  };

  _jasmine.FILE_SCHEME = String(document.location.protocol).indexOf("file") == 0;
  _jasmine.JSX_BASE = "../";
  _jasmine.JSX_JS_BASE = _jasmine.JSX_BASE + "JSX/js/";
  _jasmine.TEST_BASE = "tests/jasmine/";
  _jasmine.HTTP_BASE = _jasmine.FILE_SCHEME ? "http://www.generalinterface.org/tests" : "../test/server";
  _jasmine.NETWORK = true;
  _jasmine.NONETWORK = !_jasmine.NETWORK;
  var _browser = _jasmine._type = (new BrowserDetect()).getType();

  var defines = _BROWSERS[_browser];
  for (var i = 0; i < defines.length; i++)
    _jasmine[defines[i]] = true; // so that gi.test.jasmine.IE, etc are defined for precompiler

  _jasmine.decodeURI = function(strText) {
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

  _jasmine.getQueryParams = function(strURL) {
    var params = {};
    var index = strURL.indexOf("?");
    if (index < 0) return params;
    var query = strURL.substring(index+1);
    var pairs = query.split(/&/g);
    for (var i = 0; i < pairs.length; i++) {
      var nv = pairs[i].split("=", 2);
      params[_jasmine.decodeURI(nv[0])] = _jasmine.decodeURI(nv[1]);
    }
    return params;
  };

  _jasmine.loadTestSpecs = function(specs) {
    for (var i = 0; i < specs.length; i++)
      _jasmine.loadScript(_jasmine.TEST_BASE + specs[i]);
  };

  _jasmine.loadScript = function(strSrc, fctDone, objAttr) {
    if (console) console.log("Loading " + strSrc);
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

  _jasmine.loadGI = function() {
    _jasmine.loadScript(_jasmine.JSX_JS_BASE + "JSX30.js", _jasmine._doneLoadingJSX30,
        {jsxappempty:"true"});
  };

  _jasmine.App = function(strPrefix) {
    var tokens = strPrefix.split(/\W/);
    this._prefix = tokens.join("_");
    tokens.pop();
    this._path = tokens.join("/") + "/";
    this._id = this.getPrefix()+document.body.childNodes.length;
  };

  _jasmine.App.prototype.getPrefix = function() {
    return this._prefix;
  };

  _jasmine.App.prototype.resolveURI = function(strPath) {
    var path = _jasmine.TEST_BASE + this._path + strPath;
    return _jasmine.decodeURI(path);
  };

  _jasmine.App.prototype.newServer = function(strConfig, strPath, bGUI, objEnv) {
    var doc = null;
    if (strConfig) {
      doc = (new jsx3.xml.Document()).load(this.resolveURI(strConfig));
      if (doc.hasError())
        throw new Error("Error loading server configuration file: " + doc.getError());
    } else {
      doc = (new jsx3.xml.Document()).loadXML("<data/>");
    }

    var settings = new jsx3.app.Settings(doc);
    if (objEnv == null) objEnv = {};
    objEnv.jsxsettings = settings;

    var objGUI = null;
    if (bGUI) {
      objGUI = document.createElement("div");
      objGUI.setAttribute("id", this._id);
      document.getElementsByTagName("body")[0].appendChild(objGUI);
    }

    return new jsx3.app.Server(this.resolveURI(strPath), objGUI, bGUI, objEnv);
  };

  _jasmine.App.prototype.destroy = function() {
    document.body.removeChild(document.getElementById(this._id));
  };
  _jasmine.App.prototype._prefix = null;
  _jasmine.App.prototype._path = null;
  _jasmine._undefined = undefined;

  /**
   *
   */
  _jasmine.makeTestFunction = function(fctBody, arg1) {
    var a = [], jasmineEnv = jasmine.getEnv();
    for (var i = 1; i < arguments.length; i++)
      a[i-1] = arguments[i];
    fctBody['args'] = a;

    return jasmineEnv.it(arg1, fctBody);
  };

  _jasmine._required = {};
  /**
   *
   */
  _jasmine.require = function(strClass1) {
    if (console) console.log("Requiring " + strClass1 + "...");

    var bFirst = _jasmine._waiting == null;
    if (bFirst)
      _jasmine._waiting = [];

    for (var i = 0; i < arguments.length; i++) {
      try {
        var name = arguments[i];
        if (!_jasmine._required[name] &&eval(name) == null) {
          _jasmine._waiting.push(name);
          _jasmine._required[name] = true;
        }
      } catch (e) {
        _jasmine._waiting.push(arguments[i]);
      }
    }
  };

  _jasmine._doneLoadingJSX30 = function(strSrc) {
    if (strSrc == _jasmine.JSX_JS_BASE + "JSX30.js") {
      // Copy CLASS_LOADER browser tokens into jasmine
      var tokens = ["IE", "IE7", "MOZ", "FX", "SAF", "GOG", "KON", "SVG", "VML"];
      for (var i = 0; i < tokens.length; i++)
        _jasmine[tokens[i]] = jsx3.CLASS_LOADER[tokens[i]];

      // Copy any URL parameters into JSX environment
      var params = _jasmine.getQueryParams(window.location.search);
      for (var p in params)
        jsx3.setEnv(p, params[p]);
    }

    _jasmine._tryLoadLogger();
    var _waiting = _jasmine._waiting;
    for (i = 0; _waiting && i < _waiting.length; i++) {
      try {
        if (eval(_waiting[i]) != null)
          _waiting.splice(i--, 1);
      } catch (e) {}
    }

    //if (console) console.log("Loaded " + strSrc + ". Still waiting for [" + _jasmine._waiting + "]");

    if (_jasmine._jsxbaseclasses == null) {
      _jasmine._jsxbaseclasses = jsx3.lang.ClassLoader.SYSTEM_SCRIPTS.concat();

      _jasmine.BUILD = _jasmine._jsxbaseclasses.length <= 2;
      _jasmine.SOURCE = !_jasmine.BUILD;
      _jasmine.DEP = typeof(jsx3.ABSOLUTEPATH) == "string";
      _jasmine.NODEP = !_jasmine.DEP;
      _jasmine.INTERACTIVE = jsx3.getEnv("jsxtestinter") == "1";
      _jasmine.NOINTERACTIVE = !_jasmine.INTERACTIVE;

      _jasmine[String(window.location.protocol).replace(/\W/g, "")] = true;

    }

    if (_waiting && _waiting.length > 0) {
      if (_jasmine._jsxbaseclasses.length > 0) {
        var nextPath = _jasmine._jsxbaseclasses.shift();
        // HACK: without timeout was causing stack overflow on Safari
        window.setTimeout(function() {
          _jasmine.loadScript(jsx3.CLASS_LOADER.resolvePath(_jasmine.JSX_JS_BASE + nextPath), _jasmine._doneLoadingJSX30);
        }, 0);
      } else {
        for (i = 0; i < _waiting.length; i++) {
          try {
            if (console) console.log("jsx3 requiring class " + _jasmine._waiting[i] + "...");
            jsx3.require(_waiting[i]);
          } catch (e) {
            _jasmine.warn("Could not load class " + _jasmine._waiting[i] + ": " + e);
          }
        }

        _jasmine._loadJsxIncludes();

        _jasmine._waiting = [];
        window.setTimeout(function() {
          if (console) console.log("Setting status to complete (A).");
          _jasmine.onLoaded();
        }, 0);
      }
    } else {
      _jasmine._loadJsxIncludes();

      window.setTimeout(function() {
        if (console) console.log("Setting status to complete (B).");
        _jasmine.onLoaded();
      }, 0);
    }
  };

  _jasmine._tryLoadLogger = function() {
    if (!this._loggerinit && jsx3.util && jsx3.util.Logger) {
      this._loggerinit = true;
      var h = new jsx3.util.Logger.FormatHandler("jasmine");
      var methods = [null, "fail", "warn", "warn", "inform", "debug", "debug"];
      h.handle = function(objRecord) {
        var m = window[methods[objRecord.getLevel()]];
        if (m) {
          try {
            m.apply(window, [jsx3.util.strEscapeHTML(this.format(objRecord))]);
          } catch (e) {}
        }
      };
      jsx3.util.Logger.GLOBAL.addHandler(h);
    }
  };

  _jasmine._loadJsxIncludes = function() {
    // NOTE: this depends on unpublished API of the GI class loader
    if (jsx3.app && jsx3.app.PropsBundle && jsx3.System) {
      jsx3.app.PropsBundle.getProps(_jasmine.JSX_BASE + "JSX/locale/messages.xml", null, jsx3.getSystemCache());
      jsx3.app.PropsBundle.getProps(_jasmine.JSX_BASE + "JSX/locale/locale.xml", null, jsx3.getSystemCache());
    }
  };

  _jasmine.onLoaded = function() {
    // publish loaded event
  };
  // Assertion functions
  // add custom Jasmine matcher here

  _jasmine.assertInstanceOf = function(expected) {
    var objArg = this.actual;
    var fctConstructor = typeof(expected) == "string" ? eval(expected) : expected;

    if (typeof(fctConstructor) != "function")
      return false;

    return objArg instanceof fctConstructor || (objArg && objArg.instanceOf && objArg.instanceOf(fctConstructor));
  };

  _jasmine.assertTypeOf = function(expected) {
    var var1 = this.actual;

    return typeof(var1) == expected;
  };

  _jasmine.assertEquals = function(expected) {
    var actual = this.actual;

    if (expected != null && typeof(expected) == "object" && typeof(expected.equals) == "function") {
      return expected.equals(actual);
    } else {
      return this.env.equals_(actual, expected);
    }
  };

  _jasmine.assertThrows = function(expected) {
    var result = false;
    var exception;
    if (typeof this.actual != 'function') {
      throw new Error('Actual is not a function');
    }
    try {
      this.actual();
    } catch (e) {
      exception = e;
    }
    if (exception) {
      result = (expected && (exception instanceof expected));
    }

    var not = this.isNot ? "not " : "";

    this.message = function() {
      if (exception && (expected && !(exception instanceof expected))) {
        return ["Expected function " + not + "to throw a ", (expected && expected.message ? expected.message || expected : "exception"), ", but it threw ", exception.message || exception].join('');
      } else {
        return "Expected function to throw an exception.";
      }
    };

    return result;
  };

  _jasmine.matchers = {
    toBeInstanceOf: _jasmine.assertInstanceOf,
    toBeTypeOf: _jasmine.assertTypeOf,
    toEquals: _jasmine.assertEquals,
    toThrowException: _jasmine.assertThrows
  };
  // Logging functions

  /**
   *
   */
  _jasmine.log = function() {
    if (window.log) log.apply(null, arguments);
    if (window.console) try { window.console.log.apply(window.console, arguments); } catch (e) {}
  };

  /**
   *
   */
  _jasmine.warn = function() {
    if (window.warn) warn.apply(null, arguments);
    if (window.console) try { window.console.warn.apply(window.console, arguments); } catch (e) {}
  };

  /**
   *
   */
  _jasmine.inform = function() {
    if (window.inform) inform.apply(null, arguments);
    if (window.console) try { window.console.info.apply(window.console, arguments); } catch (e) {}
  };

  /**
   *
   */
  _jasmine.debug = function() {
    if (window.debug) debug.apply(null, arguments);
    if (window.console) try { window.console.log.apply(window.console, arguments); } catch (e) {}
  };

};

gi.test.jasmine._init(gi.test.jasmine);
delete gi.test.jasmine._init;

// Automatically add GI matchers, so you don't need to do this everytime in beforeEach()
if (jasmine && jasmine.Matchers) {
  for (var method in gi.test.jasmine.matchers)
     jasmine.Matchers.prototype[method] = gi.test.jasmine.matchers[method];
}