/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * The base GI exception class.
 *
 * <h4>Throwing an Exception</h4>
 * <pre>
 * // throwing a simple exception:
 * throw new jsx3.Exception("an error occurred");
 * 
 * // throwing a nested exception:
 * try {
 *   ...
 * } catch (e) {
 *   throw new jsx3.Exception("an error occurred while ...", 
 *       jsx3.NativeError.wrap(e));
 * }</pre>
 *
 * <h4>Catching an Exception</h4>
 * <pre>
 * // catching an exception and logging it
 * try {
 *   ...
 * } catch (e) {
 *   jsx3.util.Logger.GLOBAL.error("an error occurred while ...", 
 *       jsx3.NativeError.wrap(e));
 * }</pre>
 *
 * @since 3.1
 */
jsx3.Class.defineClass("jsx3.lang.Exception", null, null, function(Exception, Exception_prototype) {
  
  var Method = jsx3.lang.Method;

  /** @private @jsxobf-clobber */
  Exception._ALERT_BEFORE_ONERROR = false;
  
  /**
   * @package
   */
  Exception._LAST_THROWN = null;
  
  /**
   * The instance initializer. A subclass of this class should always chain its <code>init()</code> method.
   *
   * @param strMessage {String}  the description of the exception.
   * @param objCause {jsx3.Exception}  an optional argument. A caught exception that caused this exception to be raised.
   */
  Exception_prototype.init = function(strMessage, objCause) {
    // always store the last exception created, this will help with IE uncaught exceptions
    Exception._LAST_THROWN = this;
    
    /* @jsxobf-clobber */
    this._message = strMessage;
    /* @jsxobf-clobber */
    this._cause = objCause;
    /* @jsxobf-clobber-shared */
    this._stack = [];
    this._storeStackTrace();
    
    if (Exception._ALERT_BEFORE_ONERROR && window.onerror == null)
      window.alert(strMessage + this.printStackTrace());
    
    var Logger = jsx3.util.Logger;
    if (Logger) {
      var l = Logger.getLogger(Exception.jsxclass.getName());
      if (l.isLoggable(Logger.TRACE))
        l.trace(strMessage, this);
    }
  };

  /**
   * Returns a string representation of this exception.
   * @return {String}
   */
  Exception_prototype.toString = function() {
    return this._message;
  };
  
  /**
   * Returns the description of this exception, as specified when the constructor was called.
   * @return {String}
   */
  Exception_prototype.getMessage = function() {
    return this._message;
  };
  
  /**
   * Returns the cause of this exception, if one was specified in the constructor.
   * @return {jsx3.Exception}
   */
  Exception_prototype.getCause = function() {
    return this._cause;
  };
  
  /**
   * Returns the complete call stack from when this exception was instantiated as an array of functions.
   * @return {Array<Function>}
   */
  Exception_prototype.getStack = function() {
    return this._stack;
  };
  
  /**
   * A list of methods that do not get printed by <code>printStackTrace()</code>.
   * @private
   * @jsxobf-clobber
   */
  Exception._NOSTACK_METHODS = [
      jsx3.Object.jsxclass.getInstanceMethod('jsxsuper'),
      jsx3.Object.jsxclass.getInstanceMethod('jsxsupermix'),
      jsx3.Object.jsxclass.getInstanceMethod('__noSuchMethod__') // may be null (in IE)
  ];

  /**
   * @param stack {Array<Function>}
   * @return {String}
   * @package
   */
  Exception.formatStack = function(stack) {
    var s = "";
    if (!jsx3.util || !jsx3.util.jsxpackage) return s;
    
    for (var i = 0; i < stack.length; i++) {
      var funct = stack[i];
      if (funct == null) continue; // BUG: this was cropping up in Firefox, not sure why
      
      if (funct.jsxmethod instanceof Method) {
        var next = stack[i+1];
        
        if (next != null && jsx3.util.arrIndexOf(Exception._NOSTACK_METHODS, next.jsxmethod) >= 0)
          if (funct == Method.prototype.apply) continue;
//        if (funct.jsxmethod == Method.getInstanceMethod("apply")) continue; // BUG: not sure why this wasn't working
        
        if (jsx3.util.arrIndexOf(Exception._NOSTACK_METHODS, funct.jsxmethod) >= 0) continue;

        if (s.length > 0) s += "\n";
        
        s += "    at ";
        s += funct.jsxmethod.getDeclaringClass().getName();
        s += funct.jsxmethod.isStatic() ? "#" : ".";
        s += funct.jsxmethod.getName() + "()";
      } else {
        if (s.length > 0) s += "\n";
        s += "    at ";
        
        if (funct.jsxclass instanceof jsx3.lang.Class) {
          s += funct.jsxclass.getName() + "()";
        } else {
          var source = funct.toString();
          if (source.match(new RegExp("^function(\\s+\\w+)?\\s*\\(([^\\)]*)\\)\\s*{"))) {
            var name = RegExp.$1 || "anonymous";
            var params = RegExp.$2;
            var fctbody = RegExp.rightContext;
            fctbody = jsx3.util.strTruncate(jsx3.util.strTrim(fctbody).replace(/\s+/g, " "), 70);
            s += jsx3.util.strTrim(name) + "(" + jsx3.util.strTrim(params).split(/\s*,\s*/).join(", ") + ")" + (fctbody ? " { " + fctbody : "");
          } else {
            s += "anonymous()";
          }
        }
      }
    }
    
    return s;
  };
  
  /**
   * Returns a string representation of the call stack for when this exception was instantiated. This stack trace
   * is delimited by new line characters (\n) but is not terminated with one.
   * @return {String}
   */
  Exception_prototype.printStackTrace = function() {
    var s = this.getClass().getName() + ": " + this + "\n" + Exception.formatStack(this._stack);

    if (this._cause != null)
      s += "\nCaused By:\n" + this._cause.printStackTrace();
    
    return s;
  };
  
  /** @private @jsxobf-clobber */
  Exception_prototype._storeStackTrace = function() {
    var stack = jsx3.lang.getStack(1);
    // trim off everything until (and including the last constructor method)
    var index = -1;
    for (var i = 0; i < stack.length; i++) {
      if (stack[i].jsxclass != null) {
        index = i;
        break;
      }
    }
    if (index >= 0)
      stack.splice(0, index + 1);
    
    this._stack = stack;
  };
  
});

/**
 * A special exception type to throw when the caller of a function does not pass arguments according to the method's
 * contract.
 */
jsx3.Class.defineClass("jsx3.lang.IllegalArgumentException", jsx3.lang.Exception, null, function(IllegalArgumentException, IllegalArgumentException_prototype) {
  
  /**
   * The instance initializer.
   * @param strArg {String}  the name of the argument 
   * @param objValue {Object}  the (illegal) value passed to the method
   */
  IllegalArgumentException_prototype.init = function(strArg, objValue) {
    this.jsxsuper(jsx3._msg("exc.ill_arg", strArg, objValue));
  };
  
});

