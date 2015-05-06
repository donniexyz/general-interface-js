/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Encapsulates a keydown event listener that is invoked by a certain combination of keys pressed simultaneously.
 *
 * @see jsx3.gui.Interactive#registerHotKey()
 * @see jsx3.gui.Form#doKeyBinding()
 *
 * @since 3.2
 */
jsx3.Class.defineClass("jsx3.gui.HotKey", null, [jsx3.util.EventDispatcher], function(HotKey, HotKey_prototype) {
  
  var Event = jsx3.gui.Event;
  
  /**
   * {String} Event type published just after a hot key is invoked.
   * @final @jsxobf-final
   */
  HotKey.WAS_INVOKED = "invoked";
  
  /** @private @jsxobf-clobber */
  HotKey_prototype._callback = null;
  /** @private @jsxobf-clobber */
  HotKey_prototype._keycode = null;
  /** @private @jsxobf-clobber */
  HotKey_prototype._shift = false;
  /** @private @jsxobf-clobber */
  HotKey_prototype._ctrl = false;
  /** @private @jsxobf-clobber */
  HotKey_prototype._meta = false;
  /** @private @jsxobf-clobber */
  HotKey_prototype._alt = false;
  /** @private @jsxobf-clobber */
  HotKey_prototype._enabled = true;
  /** @private @jsxobf-clobber */
  HotKey_prototype._destroyed = false;

  /**
   * @param strKey {String}
   * @param fctCallback {Function}
   * @return {jsx3.gui.HotKey}
   */
  HotKey.valueOf = function(strKey, fctCallback) {
    var objKeys = strKey.toLowerCase().split("+");
    var vntCharacter = objKeys.pop();

    //determine the control-key accelerators
    var bCtrl = objKeys.indexOf("ctrl") >= 0;
    var bShift = objKeys.indexOf("shift") >= 0;
    var bAlt = objKeys.indexOf("alt") >= 0;
    var bMeta = objKeys.indexOf("meta") >= 0;

    //convert characters to their unicode equivalent
    if (typeof(vntCharacter) == "string" && vntCharacter.match(/^\[(\d+)\]$/))
      vntCharacter = parseInt(RegExp.$1);

    return new HotKey(fctCallback || new Function(""), vntCharacter, bShift, bCtrl, bAlt, bMeta);
  };

  /**
   * @param callback {Function} a function to be called when this hot key is invoked. The return value of this function
   *   will be returned from the invoke() method.
   * @param key {String|int}
   * @param shift {boolean}
   * @param control {boolean}
   * @param alt {boolean}
   * @param meta {boolean}
   * @package
   */
  HotKey_prototype.init = function(callback, key, shift, control, alt, meta) {
    if (!(typeof(callback) == "function"))
      throw new jsx3.IllegalArgumentException("callback", callback);
    
    this._callback = callback;
    this._shift = shift == null ? null : Boolean(shift);
    this._ctrl = control == null ? null : Boolean(control);
    this._alt = alt == null ? null : Boolean(alt);
    this._meta = meta == null ? null : Boolean(meta);
    this._keycode = typeof(key) == 'number' ? key : HotKey.keyDownCharToCode(key);
    
    if (this._keycode == null)
      throw new jsx3.IllegalArgumentException("key", key);
  };
  
  /**
   * @package
   */
  HotKey_prototype.getKey = function() {
    var s = "";
    if (this._meta) s += "meta+";
    if (this._alt) s += "alt+";
    if (this._ctrl) s += "ctrl+";
    if (this._shift) s += "shift+";
    var c = HotKey.keyDownCodeToChar(this._keycode);
    s += c != null ? c : "[" + this._keycode + "]";
    return s;
  };
  
  /**
   * Returns the keycode that this hot key responds to.
   * @return {int}
   */
  HotKey_prototype.getKeyCode = function() {
    return this._keycode;
  };

  /**
   * Returns whether this hot key should be invoked for the keydown event <code>objEvent</code>.
   * @param objEvent {jsx3.gui.Event}
   * @return {boolean}
   */
  HotKey_prototype.isMatch = function(objEvent) {
    var match =  
        (                         objEvent.keyCode()  == this._keycode) && 
        (this._shift   == null || objEvent.shiftKey() == this._shift) && 
        (this._ctrl    == null || objEvent.ctrlKey()  == this._ctrl) &&
        (this._meta    == null || objEvent.metaKey()  == this._meta) &&
        (this._alt     == null || objEvent.altKey()   == this._alt);
    return match;
  };

  /**
   * Invokes this hot key by executing its callback function. This hot key also publishes a <code>WAS_INVOKED</code>
   * event through the event dispatcher interface.
   * @param objThis {Object}
   * @param arrArgs {Array<Object>}
   * @return {Object} this method returns whatever value was returned by the hot key callback function.
   */
  HotKey_prototype.invoke = function(objThis, arrArgs) {
    if (this._destroyed || !this._enabled)
      throw new jsx3.Exception(jsx3._msg("gui.hk.dest", this));
    var retVal = this._callback.apply(objThis, arrArgs);
    this.publish({subject:HotKey.WAS_INVOKED});
    return retVal;
  };

  /**
   * Returns whether this hot key is enabled.
   * @return {boolean}
   */
  HotKey_prototype.isEnabled = function() {
    return this._enabled;
  };

  /**
   * Sets whether this hot key is enabled. Hot keys may be turned off temporarily by sending <code>false</code> to 
   * this method.
   * @param bEnabled {boolean}
   */
  HotKey_prototype.setEnabled = function(bEnabled) {
    this._enabled = bEnabled;
  };
  
  /**
   * Returns whether this hot key had been destoyed.
   * @return {boolean}
   */
  HotKey_prototype.isDestroyed = function() {
    return this._destroyed;
  };

  /**
   * Destroys this hot key. Once a hot key is destroyed it cannot be invoked again. 
   */
  HotKey_prototype.destroy = function() {
    this._destroyed = true;
    delete this._callback;
  };

  /**
   * @package
   */
  HotKey_prototype.getFormatted = function() {
    var glue = null, keys = null;
    if (jsx3.app.Browser.macosx) {
//      if (HotKey.KEY_NAMES_MACOS.shift == null) {
//        // HACK: 21E7 is supposed to be shift but doesn't work in Fx ... beware if they fix this bug
//        //   also, \u0005 is not a valid XML character
//        var bStrict = jsx3.html.getMode() == jsx3.html.MODE_FF_STRICT;
//        HotKey.KEY_NAMES_MACOS.shift = "\u21EA";//[bStrict ? "\u21EA" : "\u0005", Event.KEY_SHIFT];
//      }
      glue = ""; keys = HotKey.KEY_NAMES_MACOS;
    } else {
      glue = "+"; keys = HotKey.KEY_NAMES;
    }

    var s = "";
    if (this._ctrl) s += keys.ctrl[0] + glue;
    if (this._alt) s += keys.alt[0] + glue;
    if (this._shift) s += keys.shift[0] + glue;
    if (this._meta) s += keys.meta[0] + glue;
    var c = HotKey.keyDownCodeToChar(this._keycode, true);
    s += c != null ? (c.length == 1 ? c.toUpperCase() : c) : "[" + this._keycode + "]";
    return s;
  };

  /**
   * @private
   * @jsxobf-clobber
   */
  HotKey.KEY_NAMES_MACOS = {
    meta: ["\u2318", Event.KEY_META],
    alt: ["\u2325", Event.KEY_ALT],
    ctrl: ["\u2303", Event.KEY_CONTROL],
    shift: [jsx3.CLASS_LOADER.FX && jsx3.CLASS_LOADER.getVersion() < 3 ? "\u21EA" : "\u21E7", Event.KEY_SHIFT], // NOTE: supposed to be 21E7 but Fx doesn't work
    enter: ["\u21A9", Event.KEY_ENTER], // NOTE: this is return, 2305 is enter
    esc: ["\u238B", Event.KEY_ESCAPE],
    tab: ["\u21E5", Event.KEY_TAB],
    del: ["\u2326", Event.KEY_DELETE],
    space: ["\u2423", Event.KEY_SPACE],
    backspace: ["\u232B", Event.KEY_BACKSPACE],
    up: ["\u2191", Event.KEY_ARROW_UP],
    down: ["\u2193", Event.KEY_ARROW_DOWN],
    left: ["\u2190", Event.KEY_ARROW_LEFT],
    right: ["\u2192", Event.KEY_ARROW_RIGHT],
    insert: ["Insert", Event.KEY_INSERT],
    home: ["\u2196", Event.KEY_HOME],
    end: ["\u2198", Event.KEY_END],
    pgup: ["\u21DE", Event.KEY_PAGE_UP],
    pgdn: ["\u21DF", Event.KEY_PAGE_DOWN]
  };

  /**
   * @private
   * @jsxobf-clobber
   */
  HotKey.KEY_NAMES = {
    meta: ["Meta", Event.KEY_META],
    alt: ["Alt", Event.KEY_ALT],
    ctrl: ["Ctrl", Event.KEY_CONTROL],
    shift: ["Shift", Event.KEY_SHIFT],
    enter: ["Enter", Event.KEY_ENTER],
    esc: ["Esc", Event.KEY_ESCAPE],
    tab: ["Tab", Event.KEY_TAB],
    del: ["Del", Event.KEY_DELETE],
    space: ["Space", Event.KEY_SPACE],
    backspace: ["Backspace", Event.KEY_BACKSPACE],
    up: ["Up", Event.KEY_ARROW_UP],
    down: ["Down", Event.KEY_ARROW_DOWN],
    left: ["Left", Event.KEY_ARROW_LEFT],
    right: ["Right", Event.KEY_ARROW_RIGHT],
    insert: ["Insert", Event.KEY_INSERT],
    home: ["Home", Event.KEY_HOME],
    end: ["End", Event.KEY_END],
    pgup: ["PgUp", Event.KEY_PAGE_UP],
    pgdn: ["PgDn", Event.KEY_PAGE_DOWN]
  };

  /**
   * @return {String}
   */
  HotKey_prototype.toString = function() {
    return "@HotKey key:" + this._keycode + " shift:" + this._shift + " ctrl:" + this._ctrl + " alt:" + this._alt
         + " meta:" + this._meta;
  };
  
  /**
   * {Object<int, int>} JavaScript hash of key codes for common characters
   * @private
   * @jsxobf-clobber
   */
  HotKey.MISC_KEY_CODES = {
    39: 222, // '
    44: 188, // ,
    45: 189, // -
    46: 190, // .
    47: 191, // /
    59: 186, // ;
    61: 187, // =
    91: 219, // [
    92: 220, // \
    93: 221, // ]
    96: 192  // `
  };

  /**
   * Converts the string representation of a keyboard key to an integer keycode. This keycode will match the keycode
   * value of a <code>jsx3.gui.Event</code> of type <code>keydown</code>. 
   * <p/>
   * The following string representations are supported:
   * <ul>
   *   <li>alpha numeric characters: <code>A-Z</code>, <code>a-z</code>, <code>0-9</code></li>
   *   <li>the punctuation keys in the string: <code>";,./'[]\-=`"</code></li>
   *   <li>functions keys: <code>F1-F15</code></li>
   *   <li>special keys: <code>enter</code>, <code>esc</code>, <code>tab</code>, <code>del</code>, <code>space</code>, 
   *     <code>backspace</code>, <code>up</code>, <code>down</code>, <code>left</code>, <code>right</code>, 
   *     <code>insert</code>, <code>home</code>, <code>end</code>, <code>pgup</code>, <code>pgdn</code>.</li>
   * </ul>
   *
   * @param strChar {String} the string representation of a key.
   * @return {int} the keycode.
   */
  HotKey.keyDownCharToCode = function(strChar) {
    var code = null;
    
    if (strChar.length == 1) {
      var unicode = strChar.charCodeAt(0);
  
      // A-Z
      if (unicode >= 65 && unicode <= 90)
        code = unicode;
      // a-z
      else if (unicode >= 97 && unicode <= 122)
        code = unicode - (97 - 65);
      // 0-9
      else if (unicode >= 48 && unicode <= 57)
        code = unicode;
      // ; , . / ' [ ] \ - = `
      else
        code = HotKey.MISC_KEY_CODES[unicode];
    } else if (HotKey.KEY_NAMES[strChar.toLowerCase()]) {
      code = HotKey.KEY_NAMES[strChar.toLowerCase()][1];
    } else if (strChar.match(/^[fF](\d\d?)$/)) {
      code = parseInt(RegExp.$1) + Event.KEY_F1 - 1;
    }
    
    return code;
  };
  
  /**
   * Converts an integer keycode into the string representation of the corresponding keyboard key. This method
   * is the inverse of <code>HotKey.keyDownCharToCode</code>.
   *
   * @param intCode {int} the keycode.
   * @return {String} the string representation of a key.
   *
   * @see #keyDownCharToCode()
   * @package
   */
  HotKey.keyDownCodeToChar = function(intCode, bSystem) {
    var strChar = null;
    
    // A-Z
    if (intCode >= 65 && intCode <= 90)
      strChar = String.fromCharCode(intCode + 97 - 65);
    // 0-9
    else if (intCode >= 48 && intCode <= 57)
      strChar = String.fromCharCode(intCode);
    // F1-F15
    else if (intCode >= Event.KEY_F1 && intCode <= Event.KEY_F15)
      strChar = "F" + (intCode - Event.KEY_F1 + 1);
    else {
      // ; , . / ' [ ] \ - = `
      for (var f in HotKey.MISC_KEY_CODES) {
        if (HotKey.MISC_KEY_CODES[f] == intCode) {
          strChar = String.fromCharCode(f);
          break;
        }
      }
      
      if (strChar == null) {
        // enter, esc, etc
        var keys = bSystem && jsx3.app.Browser.macosx ? HotKey.KEY_NAMES_MACOS : HotKey.KEY_NAMES;
        for (var f in keys) {
          if (keys[f][1] == intCode) {
            strChar = keys[f][0];
            break;
          }
        }
      }
    }

    return strChar;
  };
  
});
