/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Utility classes.
 */
jsx3.Package.definePackage("jsx3.util", function(util) {

  /** @package */
  util.RESERVED = jsx3.$H("abstract,boolean,break,byte,case,catch,char,class,const,continue,debugger,default,delete,do,double,else,enum,export,extends,false,final,finally,float,for,function,goto,if,implements,import,in,instanceof,int,interface,long,native,new,null,package,private,protected,public,return,short,static,super,switch,synchronized,this,throw,throws,transient,true,try,typeof,var,void,volatile,while,with".split(","));

  /** 
   * Returns <code>true</code> if <code>n</code> is a valid JavaScript name and not a JavaScript reserved word.
   * 
   * @param n {String} the candidate name.
   * @return {boolean}
   */
  util.isName = function(n) {
    return Boolean(!util.RESERVED[n] && n.match(/^[\\$_a-zA-Z][\w\\$]*$/));
  };

  /**
   * Compares two version strings. A version string is list of arbitrary length of numbers separated by '.'. The
   * first number is the most significant.
   *
   * @param v1 {String} the first version string.
   * @param v2 {String} the second version string.
   * @return {int} <code>1</code> if <code>v1</code> is greater than <code>v2</code>, <code>-1</code> if
   *   <code>v2</code> is greater than <code>v1</code>, or <code>0</code> if <code>v1</code> and <code>v2</code> are equal.
   * @package
   */
  util.compareVersions = function(v1, v2) {
    var regex = /^(\d+)?([a-zA-Z_]\w*)?$/;

    var v1t = v1.split(/[\._]/);
    var v2t = v2.split(/[\._]/);
    var maxLength = Math.max(v1t.length, v2t.length);

    var ad, al, bd, bl;

    for (var i = 0; i < maxLength; i++) {
      if (v1t.length > i && regex.test(v1t[i])) {
        ad = parseInt(RegExp.$1) || Number(0);
        al = RegExp.$2;
      } else {
        ad = 0;
        al = "";
      }

      if (v2t.length > i && regex.test(v2t[i])) {
        bd = parseInt(RegExp.$1) || Number(0);
        bl = RegExp.$2;
      } else {
        bd = 0;
        bl = "";
      }

      if (ad > bd) return 1;
      if (ad < bd) return -1;
      if (al > bl) return 1;
      if (al < bl) return -1;
    }

    return 0;
  };

  /**
   * Calculates <code>a mod b</code>, but the result is not allowed to be negative.
   * @param v {Number} a
   * @param mod {Number} b
   * @return {Number} <code>a mod b</code> if <code>a >= 0</code>, <code>b + a mod b</code>, if <code>a < 0</code>.
   * @since 3.2
   */
  util.numMod = function(v, mod) {
    var result = v % mod;
    return result < 0 ? result + mod : result;
  };

  /**
   * Returns <code>v == null || isNaN(v)</code>.
   * @param v {Object} any value.
   * @return {boolean}
   * @since 3.2
   */
  util.numIsNaN = function(v) {
    return v == null || v === "" || isNaN(v);
  };

  /**
   * Rounds <code>v</code> to the nearest value that can be divided by <code>intUnit</code>.
   * @param v {Number}
   * @param intUnit {int}
   * @return {Number}
   * @since 3.2
   */
  util.numRound = function(v, intUnit) {
    return Math.round(v/intUnit) * intUnit;
  };

  /**
   * Returns whether <code>s</code> is <code>null</code> or an empty string.
   * @param s {String}
   * @return {boolean}
   * @since 3.2
   */
  util.strEmpty = function(s) {
    return s == null || s === "";
  };

  /** @private @jsxobf-clobber */
  util._jsxescapemap = {};
  util._jsxescapemap['\b'] = '\\b';
  util._jsxescapemap['\t'] = '\\t';
  util._jsxescapemap['\n'] = '\\n';
  util._jsxescapemap['\f'] = '\\f';
  util._jsxescapemap['\r'] = '\\r';
  util._jsxescapemap['"'] = '\\"';
  util._jsxescapemap['\\'] = '\\\\';

  /**
   * Returns <code>str</code> appropriately formatted and escaped for use as a JSON string.  If evaluated via
   * <code>window.eval</code>, the return from this method will be an exact match of the input.
   * @param str {String}
   * @return {String}
   * @since 3.6
   */
  util.strEscapeJSON = function (str) {
    if (/["\\\x00-\x1f]/.test(str)) {
      return '"' + str.replace(/[\x00-\x1f\\"]/g, function (a) {
        var c = util._jsxescapemap[a];
        if (c)
          return c;
        c = a.charCodeAt();
        return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
      }) + '"';
    }
    return '"' + str + '"';
  };

  /**
   * Returns the array index of <code>o</code> in <code>a</code>. Comparisons are performed with strict equals (===).
   * @param a {Array}
   * @param o {Object}
   * @return {int}
   */
  util.arrIndexOf = function(a, o) {
    for (var i = 0; i < a.length; i++)
      if (a[i] === o) return i;
    return -1;
  };

  /** @private @jsxobf-clobber */
  util._TRIM_REGEX = /(^\s*)|(\s*$)/g;

  /**
   * Returns <code>s</code> trimmed of trailing and leading spaces (anything matching the regexp <code>/\s/</code>).
   * @param s {String}
   * @return {String}
   * @since 3.2
   */
  util.strTrim = function(s) {
    return s.replace(util._TRIM_REGEX, "");
  };

  /**
   * Returns <code>s</code> with the following four characters replaced by their escaped equivalent:
   * <code>&amp; &lt; &gt; "</code>. This method also replaces any character that is not a valid XML character
   * (valid character codes are: 0x09, 0x0A, 0x0D, 0x20-0xD7FF, 0xE000-0xFFFD, 0x10000-0x10FFFF) with "&#92;uXX" where XX
   * is the unicode hex value of the character.
   *
   * @param s {String}
   * @return {String}
   * @since 3.2
   */
  util.strEscapeHTML = function(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(
        // NOTE: the XML spec would be [^\x09\x0A\x0D\x20-\xD7FF\xE000-\xFFFD\x10000-\x10FFFF] but Firefox won't
        // compile that regex, see http://www.w3.org/TR/REC-xml/
        /[^\x09\x0A\x0D\x20-\x7F]/g,
        function(m) {
          var c = m.charCodeAt(0);
          if (c < 0x20 || (c > 0xD7FF && c < 0xE000) || (c > 0xFFFD && c < 0x10000) || c > 0x10FFFF)
            return "\\u" + c.toString(16);
          else
            return m;
        } );
  };

  /**
   * Limits <code>s</code> to length <code>intMax</code> by placing an ellipsis in values that are too long.
   * @param s {String}
   * @param intMax {int} the maximum length of the string returned by this method.
   * @param strEllipsis {String} the ellipsis to use. <code>"..."</code> is used by default.
   * @param fltPos {Number} the placement of the ellipsis as a value between 0 and 1. 1, the default, means that the
   *   ellipsis comes at the end of the truncated string. Other values mean that the head and tail of the string
   *   will be returned with the ellipsis somewhere in the middle.
   * @return {String}
   * @since 3.2
   */
  util.strTruncate = function(s, intMax, strEllipsis, fltPos) {
    if (strEllipsis == null) strEllipsis = "...";
    if (fltPos == null) fltPos = 1.0;

    if (s.length > intMax && strEllipsis.length < intMax) {
      var l = intMax - strEllipsis.length;
      var beforeLength = Math.round(l * fltPos);
      var before = s.substring(0, beforeLength);
      var after = s.substring(s.length - (l - beforeLength));
      return before + strEllipsis + after;
    } else {
      return s;
    }
  };

  /**
   * Returns whether <code>s</code> ends with <code>strTest</code>.
   * @param s {String}
   * @param strTest {String}
   * @return {boolean}
   * @since 3.2
   */
  util.strEndsWith = function(s, strTest) {
    var index = s.lastIndexOf(strTest);
    return index >= 0 && index == s.length - strTest.length;
  };

  /** @private @jsxobf-clobber */
  util._BASE64S = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  /**
   * Returns the result of encoding <code>s</code> to its base-64 equivalent.
   * @param s {String}
   * @return {String}
   * @since 3.2
   */
  util.strEncodeBase64 = function(s) {
    var base64s = util._BASE64S;
    var buffer = new Array(Math.ceil(s.length * 4 / 3));

    var i = 0, c = 0, length = s.length;
    for (; i <= length - 3; i += 3) {
      var bits = (s.charCodeAt(i)   & 0xff) << 16 |
                 (s.charCodeAt(i+1) & 0xff) << 8  |
                 (s.charCodeAt(i+2) & 0xff);

      buffer[c++] = base64s.charAt((bits & 0xfc0000) >> 18);
      buffer[c++] = base64s.charAt((bits & 0x03f000) >> 12);
      buffer[c++] = base64s.charAt((bits & 0x000fc0) >> 6);
      buffer[c++] = base64s.charAt((bits & 0x00003f));
    }

    if (i < length) {
      var dual = i < length - 1;

      var bits = (s.charCodeAt(i) & 0xff) << 16;
      if (dual)
        bits |= (s.charCodeAt(i+1) & 0xff) << 8;

      buffer[c++] =   base64s.charAt((bits & 0xfc0000) >> 18);
      buffer[c++] =   base64s.charAt((bits & 0x03f000) >> 12);
      if (dual)
        buffer[c++] = base64s.charAt((bits & 0x000fc0) >> 6);
      else
        buffer[c++] = "=";
      buffer[c++] = "=";
    }

    return buffer.join("");
  };

  /**
   * Returns the result of decoding <code>s</code> from its base-64 equivalent.
   * @param s {String}
   * @return {String}
   * @since 3.2
   */
  util.strDecodeBase64 = function(s) {
    var base64s = util._BASE64S;
    var buffer = new Array(Math.ceil(s.length / 4));

    //declare variables
    var i = 0, c = 0, length = s.length;
    for (; i < length; i += 4) {
      var bits = (base64s.indexOf(s.charAt(i))   & 0xff) << 18 |
                 (base64s.indexOf(s.charAt(i+1)) & 0xff) << 12 |
                 (base64s.indexOf(s.charAt(i+2)) & 0xff) <<  6 |
                 (base64s.indexOf(s.charAt(i+3)) & 0xff);

      buffer[c++] = String.fromCharCode((bits & 0xff0000) >> 16, (bits & 0xff00) >> 8, bits & 0xff);
    }

    if (s.charCodeAt(i-2) == 61)
      buffer[c-1] = buffer[c-1].substring(0,1);
    else if (s.charCodeAt(i-1) == 61)
      buffer[c-1] = buffer[c-1].substring(0,2);

    return buffer.join("");
  };

});

/* @JSC :: begin BENCH */

/**
 * A benchmarking utility that facilitates sending timing messages to the logging system. 
 * <p/>
 * <b>This class is only available in the source distribution and debug build of General Interface.</b>
 *
 * @since 3.5
 * @package
 */
jsx3.Class.defineClass("jsx3.util.Timer", null, null, function(Timer, Timer_prototype) {
  
  /** @private @jsxobf-clobber */
  Timer._LISTENERS = [];
  
  /**
   * Starts collecting statistics about all timer instances. The return value is an array into which the statistics
   * are places. Each element in the array is an object with the following keys:
   * <ul>
   *   <li>topic {String}</li>
   *   <li>subtopic {String}</li>
   *   <li>message {String}</li>
   *   <li>ms {int}</li>
   * </ul>
   *
   * @return {Array<Object>}
   * @see #ignore()
   * @since 3.6
   */
  Timer.listen = function() {
    var l = [];
    Timer._LISTENERS.push(l);
    return l;
  };

  /**
   * Stops collecting statistics about timers. The <code>arrStats</code> should be a value returned by a call to
   * <code>listen()</code>.
   * @param arrStats {Array<Object>}
   * @see #listen()
   * @since 3.6
   */
  Timer.ignore = function(arrStats) {
    var i = jsx3.util.arrIndexOf(Timer._LISTENERS, arrStats);
    Timer._LISTENERS.splice(i, 1);
  };
  
  /** @private @jsxobf-clobber */
  Timer._record = function(objTimer, strMessage, intMS) {
    var l = Timer._LISTENERS;
    if (l.length > 0) {
      var o = {topic:objTimer._topic, subtopic:objTimer._message, message:strMessage, ms:intMS};
      for (var i = 0; i < l.length; i++) {
        l[i].push(o);
      }
    }
  };

  /**
   * @param strTopic {Object} the timer topic (usually the class name).
   * @param strSubtopic {Object} the optional timer sub-topic (usually an instance identifier).
   * @param intLevel {int} the level at which to log the timer message. The default is <code>INFO</code>. 
   */
  Timer_prototype.init = function(strTopic, strSubtopic, intLevel) {
    /* @jsxobf-clobber */
    this._t1 = new Date();
    /* @jsxobf-clobber */
    this._topic = String(strTopic);
    /* @jsxobf-clobber */
    this._message = String(strSubtopic);
    /* @jsxobf-clobber */
    this._level = intLevel || 4; // default is INFO
  };

  /**
   * @param strMessage {String} the optional message to include with the topic and sub-topic in the logging record (usually the
   *    name of the action performed).
   */
  Timer_prototype.log = function(strMessage) {
    var t2 = new Date();
    if (! this._logger) {
      if (jsx3.util.Logger)
        /* @jsxobf-clobber */
        this._logger = jsx3.util.Logger.getLogger("bench." + this._topic);
    }

    var timeTaken = t2 - this._t1;
    if (this._logger && this._logger.isLoggable(this._level))
      this._logger.log(this._level, 
          (this._message ? this._message  + " : " : "") + (strMessage ? strMessage + " : ": "") + timeTaken + "ms");

    Timer._record(this, strMessage, timeTaken);
    this._t1 = t2;
  };
  
});

/**
 * A name-value map that holds its contents only during the current JavaScript "thread"/stack. All contents of
 * a weak map are cleared after the next window timeout.
 * <p/>
 * <b>This class is only available in the source distribution and debug build of General Interface.</b>
 *
 * @since 3.5
 * @package
 */
jsx3.Class.defineClass("jsx3.util.WeakMap", null, null, function(WeakMap, WeakMap_prototype) {

  /** @private @jsxobf-clobber */
  WeakMap._SERIAL = 0;
  /** @private @jsxobf-clobber */
  WeakMap._ALL = {};
  /** @private @jsxobf-clobber */
  WeakMap._TO = null;

  /** @package */
  WeakMap.expire = function() {
    window.clearTimeout(WeakMap._TO);
    WeakMap._TO = null;
    for (var f in WeakMap._ALL) {
      var m = WeakMap._ALL[f];
      if (m._dirty) m._map = {};
    }
  };

  /**
   * The instance initializer.
   */
  WeakMap_prototype.init = function() {
    /* @jsxobf-clobber */
    this._serial = WeakMap._SERIAL++;
    /* @jsxobf-clobber */
    this._map = {};
    /* @jsxobf-clobber */
    this._dirty = false;

    WeakMap._ALL[this._serial] = this;
  };

  /**
   * Returns a value stored in this map.
   * @param strKey {String}
   * @return {Object}
   */
  WeakMap_prototype.get = function(strKey) {
    return this._map[strKey];
  };

  /**
   * Sets a value stored in this map.
   * @param strKey {String}
   * @param strValue {Object}
   */
  WeakMap_prototype.set = function(strKey, strValue) {
    this._map[strKey] = strValue;
    this._dirty = true;
    if (! WeakMap._TO)
      WeakMap._TO = window.setTimeout(WeakMap.expire, 0);
  };

  /**
   * Destroys this map. This method should be called for proper garbage collection to occur.
   */
  WeakMap_prototype.destroy = function(strKey, strValue) {
    delete this._map;
    delete WeakMap._ALL[this._serial];
  };

});

/**
 * Reports various memory statistics for the GI runtime. <b>This class is only available in the source and "debug"
 * builds.</b>
 * <p/>
 * This class prints the memory statistics to the logger <code>bench.jsx3.util.MemStats</code> at an interval of 15s.
 * By default the logging message is level <code>TRACE</code>. Every 12th message is <code>DEBUG</code> and every
 * 60th is <code>INFO</code>.
 *
 * @since 3.7.1
 * @package
 */
jsx3.Class.defineClass("jsx3.util.MemStats", null, null, function(MemStats, MemStats_prototype) {

  MemStats.INTERVAL = 15000;

  /** @private @jsxobf-clobber */
  MemStats._DEBUG = 12;
  /** @private @jsxobf-clobber */
  MemStats._INFO = 60;
  /** @private @jsxobf-clobber */
  MemStats._SERIAL = 0;

  /** @private @jsxobf-clobber */
  MemStats._interval = function() {
    var Logger = jsx3.util.Logger;
    if (Logger) {
      var level = (MemStats._SERIAL % MemStats._INFO == 0) ? Logger.INFO :
                  ((MemStats._SERIAL % MemStats._DEBUG == 0) ? Logger.DEBUG : Logger.TRACE);
      MemStats._log(level);
      MemStats._SERIAL++;
    }
  };

  /**
   * Logs the memory statistics immediately with level WARN.
   */
  MemStats.log = function() {
    MemStats._log(jsx3.util.Logger.WARN);
  };

  /**
   * Returns the memory statistics with the following object schema:
   * <pre>
   * {
   *   systemcache: [count, bytes],
   *   sharedcache: [count, bytes],
   *   jss: count,
   *   apps: [
   *     {
   *       ns: "namespace",
   *       cache: [count, bytes],
   *       html: bytes,
   *       dom: count,
   *       jss: count
   *     }, ...
   *   ],
   *   statstime: millis
   * }
   * </pre>
   */
  MemStats.getStats = function() {
    var o = {};
    var t1 = new Date();

    o.systemcache = MemStats._cacheSize(jsx3.getSystemCache());
    o.sharedcache = MemStats._cacheSize(jsx3.getSharedCache());
    o.jss = MemStats._jssSize(jsx3.System.JSS);
    o.apps = [];

    var s = jsx3.app.Server.allServers();
    jsx3.$A(s).each(function(e) {
      var rend = e.getRootBlock().getRendered();

      o.apps.push({
        ns: e.getEnv("namespace"),
        cache: MemStats._cacheSize(e.getCache()),
        html: rend ? rend.parentNode.innerHTML.length : 0,
        dom: MemStats._domSize(e.JSXROOT) + MemStats._domSize(e.INVISIBLE),
        jss: e.JSS.getKeys().length + MemStats._jssSize(e.LJSS)
      });
    });

    o.statstime = (new Date()).getTime() - t1.getTime();

    return o;
  };

  /** @private @jsxobf-clobber */
  MemStats._cacheSize = function(objCache) {
    var size = 0;
    var count = 0;
    var keys = objCache.keys();
    jsx3.$A(keys).each(function(e) {
      var d = objCache.getDocument(e);
      if (d) {
        count++;
        size += d.toString().length;
      }
    });
    return [count, size];
  };

  /** @private @jsxobf-clobber */
  MemStats._domSize = function(objNode) {
    if (!objNode) return 0;
    var s = 1;
    var c = objNode.getChildren();
    for (var i = 0; i < c.length; i++)
      s += MemStats._domSize(c[i]);
    return s;
  };

  /** @private @jsxobf-clobber */
  MemStats._jssSize = function(jss) {
    var s = jss.getKeys().length;
    var c = jss.getParents();
    for (var i = 0; i < c.length; i++)
      s += MemStats._jssSize(c[i]);
    return s;
  };

  /** @private @jsxobf-clobber */
  MemStats._log = function(intLevel) {
    var Logger = jsx3.util.Logger;
    if (Logger) {
      var log = Logger.getLogger("bench." + MemStats.jsxclass.getName());
      if (log.isLoggable(intLevel)) {
        var stat = MemStats.getStats();
        var s = "sys-cache:" + MemStats._kb(stat.systemcache[1]) +
                " shr-cache:" + MemStats._kb(stat.sharedcache[1]) +
                " sys-jss:" + stat.jss;

        jsx3.$A(stat.apps).each(function(e) {
          s += " [@" + e.ns + " dom:" + e.dom + " html:" + MemStats._kb(e.html) +
               " cache:" + MemStats._kb(e.cache[1]) + " jss:" + e.jss + "]";
        });

        s += " time: " + MemStats._ts(stat.statstime);

        log.log(intLevel, s);
      }
    }
  };

  /** @private @jsxobf-clobber */
  MemStats._kb = function(bytes) {
    if (bytes < 1024)
      return bytes + "B";
    bytes = Math.ceil(bytes/1024);
    if (bytes < 1024)
      return bytes + "K";
    bytes /= 1024;
    if (bytes < 1024)
      return (Math.round(bytes*10)/10) + "M";
    bytes = Math.ceil(bytes/1024);

    return (Math.round(bytes*10)/10) + "G";
  };

  /** @private @jsxobf-clobber */
  MemStats._ts = function(ms) {
    return Math.round(ms/100)/10 + "s";
  };

  window.setInterval(MemStats._interval, MemStats.INTERVAL);

});

/* @JSC :: end */
