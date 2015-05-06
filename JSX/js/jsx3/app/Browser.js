/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * @package
 */
jsx3.Class.defineClass('jsx3.app.Browser', null, null, function(Browser, Browser_prototype) {

  /**
   * {String}
   * @package
   * @final @jsxobf-final
   */
  Browser.WIN32 = "win32";

  /**
   * {String}
   * @package
   * @final @jsxobf-final
   */
  Browser.LINUX = "linux";

  /**
   * {String}
   * @package
   * @final @jsxobf-final
   */
  Browser.MACOSX = "macosx";

  /**
   * {String}
   * @package
   * @final @jsxobf-final
   */
  Browser.OTHER = "other";
          
  /**
   * Returns the locale string used by the browser. This string will be formatted in the Java-style <code>ll_CC</code>
   * format where <code>ll</code> is the two lowercase character language code and <code>CC</code> is the two
   * uppercase character country code.
   * @return {String}
   * @since 3.2
   */
  Browser.getLocaleString = function() {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    var nativeValue = window.navigator.userLanguage;
/* @JSC */ } else {
    var nativeValue = window.navigator.language;
/* @JSC */ }
    var tokens = nativeValue.split(/[_-]/);
    if (tokens.length > 0) {
      tokens[0] = tokens[0].toLowerCase();
      if (tokens.length > 1) {
        tokens[1] = tokens[1].toUpperCase();
      }
    }
    return tokens.join("_");
  };

  /**
   * Returns whether moving a table will cause the browser to crash.
   * @return {boolean}
   */
  Browser.isTableMoveBroken = function(w) {
    //[3.2] firefox won't crash, but the screen repaint is too taxing and therefore would be better if not shown until a better solution is found
    return true;
  };

  /** @private @jsxobf-clobber */
  Browser._STYLE_CACHE = null;

  Browser.getStyleClass = function(strName) {
/* @JSC */ if (jsx3.CLASS_LOADER.SAF) {
    strName = strName.toLowerCase();
/* @JSC */ }

    if (Browser._STYLE_CACHE == null) {
      var bc = {};

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
      for (var i = 0; i < document.styleSheets.length; i++) {
        var sheet = document.styleSheets[i];
        for (var j = 0; j < sheet.rules.length; j++) {
          var style = sheet.rules[j];
          bc[style.selectorText] = style.style;
        }
      }
/* @JSC */ } else {
      // GI-545: Firefox throws an exception with cross domain CSS, including when file:// accesses a URL higher up
      for (var i = 0; i < document.styleSheets.length; i++) {
        var sheet = document.styleSheets[i];
        try {
          for (var j = 0; j < sheet.cssRules.length; j++) {
            var style = sheet.cssRules[j];
            bc[style.selectorText] = style.style;
          }
        } catch (e) {}
      }
/* @JSC */ }

      Browser._STYLE_CACHE = bc;
    }

    return Browser._STYLE_CACHE[strName];
  };

  Browser.getLocation = function() {
    if (Browser._LOC_URI == null)
      /* @jsxobf-clobber */
      Browser._LOC_URI = new jsx3.net.URI(window.location.href);
    return Browser._LOC_URI;
  };
  
  Browser.getSystem = function() {
    if (Browser._SYSTEM == null) {
      var np = navigator.platform;
      var ua = navigator.userAgent;
      var sys = Browser.OTHER;
      
      if (np.indexOf("Win") == 0)
        sys = Browser.WIN32;
      else if (np.indexOf("Linux") == 0)
        sys = Browser.LINUX;
      else if (ua.indexOf("Mac OS X") != -1)
        sys = Browser.MACOSX;
      
      /* @jsxobf-clobber */
      Browser._SYSTEM = sys;
    }
    return Browser._SYSTEM;
  };

  Browser[Browser.getSystem()] = true;

});
