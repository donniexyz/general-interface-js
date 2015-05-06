/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber  _params
// @jsxobf-clobber-shared  _name _class _static _abstract

if (window["jsx3"] == null) window["jsx3"] = {};
if (jsx3.lang == null) jsx3.lang = {};

/**
 * JSX Class extends the build in JavaScript class Function. Provides reflection capabilities.
 *
 * @since 3.1
 *
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.lang.Method", null, null, function(){});
 */
jsx3.lang.Method = jsx3.lang.newPrivateConstructor();

jsx3.lang.Method.prototype = new jsx3.lang.Object;
jsx3.lang.Method.prototype.constructor = jsx3.lang.Method;

/* @jsxobf-clobber */
window._jsxtmp = function(Method, Method_prototype) {

  /** @private @jsxobf-clobber */
  Method._PARAMS = /^\s*function(\s+\w+)?\s*\(\s*([^\)]*?)\s*\)/;

  /** @private @jsxobf-clobber */
  Method_prototype._initParams = function() {
    if (Method._PARAMS.exec(this.getFunction().toString())) {
      var params = RegExp.$2;
      params = params.replace(/\n*\/\*.*\*\//m, ""); // remove comment in code
      this._params = params ? params.split(/\s*,\s*/) : [];
    } else {
      this._params = [];
    }
  };

  /**
   * Returns the name of the method. The name of the method is determined when the class is defined.
   * @return {String}
   */
  Method_prototype.getName = function() {
    return this._name;
  };

  /**
   * Returns the number of parameters that this method takes (as declared in the JavaScript source).
   * @return {int}
   */
  Method_prototype.getArity = function() {
    if (this._params == null) this._initParams();
    return this._params.length;
  };

  /**
   * Returns the names of parameters that this method takes (as declared in the JavaScript source).
   * @return {Array<String>}
   */
  Method_prototype.getParameterNames = function() {
    if (this._params == null) this._initParams();
    return this._params.concat();
  };

  /**
   * Returns the name of a parameter that this method takes (as declared in the JavaScript source).
   * @param intIndex {int} the index of the parameter name to return
   * @return {String}
   */
  Method_prototype.getParameterName = function(intIndex) {
    if (this._params == null) this._initParams();
    return this._params[intIndex];
  };

  /**
   * Returns the class that defined this method.
   * @return {jsx3.lang.Class|jsx3.lang.Package}
   */
  Method_prototype.getDeclaringClass = function() {
    return this._class;
  };

  /**
   * Returns whether the definer of this class (returned by <code>getDeclaringClass()</code>) is in fact
   *    a package.
   * @return {boolean}
   */
  Method_prototype.isPackageMethod = function() {
    return this._class instanceof jsx3.lang.Package;
  };

  /**
   * Returns true if this method is static (is a class method).
   * @return {boolean}
   */
  Method_prototype.isStatic = function() {
    return this._static;
  };

  /**
   * Returns true if this method is abstract. Abstract methods will throw an Exception if they are
   *    invoked.
   * @return {boolean}
   */
  Method_prototype.isAbstract = function() {
    return this._abstract;
  };

  /**
   * Returns the native JavaScript function of this method.
   * @return {Function}
   */
  Method_prototype.getFunction = function() {
    if (this.isPackageMethod()) {
      return this._class.getNamespace()[this._name];
    } else {
      if (this._static) {
        return this._class.getConstructor()[this._name];
      } else {
        return this._class.getConstructor().prototype[this._name];
      }
    }
  };

  /**
   * Calls apply on the native function.
   * @param thisArg {Object} this argument to pass to <code>Function.apply()</code>
   * @param argArray {Array} argument array to pass to <code>Function.apply()</code>
   * @return {Object/undefined}
   */
  Method_prototype.apply = function(thisArg, argArray) {
    return this.getFunction().apply(thisArg, argArray);
  };

  /**
   * Calls call on the native function.
   * @param arg {Object...} arguments to pass to <code>Function.call()</code>, supports up to 11 arguments (this+10)
   * @return {Object/undefined}
   */
  Method_prototype.call = function(arg) {
    var a = arguments;
    if (a.length > 11)
      throw new jsx3.Exception(jsx3._msg("method.call", + a.length));
    return this.getFunction().call(a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7],a[8],a[9],a[10]);
  };

  Method_prototype.toString = function() {
    return this._class.getName() + "." + this._name;
  };

  /**
   * Creates a new abstract method.
   * @param paramNames {String...} the names of the parameters that the abtract method will take
   * @return {Function}
   * @throws {jsx3.IllegalArgumentException}  if any element in paramNames is not a valid JavaScript identifier.
   */
  Method.newAbstract = function(paramNames) {
    var paramString = "";
    for (var i = 0; i < arguments.length; i++) {
      if (! arguments[i].match(/^[a-zA-Z_]\w*$/))
        throw new jsx3.IllegalArgumentException("paramNames[" + i + "]", arguments[i]);

      paramString += "'" + arguments[i] + "', ";
    }

    var functBody =
        'var method = arguments.callee.jsxmethod;' +
        'if (method instanceof jsx3.lang.Method) {' +
        '  throw new jsx3.Exception("method " + method.getName() + " in class " + method.getDeclaringClass() +' +
        '    " is abstract and may not be invoked");' +
        '} else {' +
        '  throw new jsx3.Exception("invoked abstract method improperly initialized");' +
        '}';

    var fnct = jsx3.eval("new Function(" + paramString + "'" + functBody + "');");

    fnct._abstract = true;
    return fnct;
  };

  Method.newDelegate = function(strMethod, strField) {
    var functBody = 'return this.' + strField + '.' + strMethod + '.apply(this.' + strField + ', arguments);';
    return new Function(functBody);
  };

  /** @package */
  Method.argsAsArray = function(args, from, to) {
    if (from == null)
      from = 0;

    if (to == null)
      to = args.length;
    else
      to = Math.min(to, args.length);

    var length = to - from;
    if (length <= 0) return [];

    var a = new Array(length);
    for (var i = 0; i < length; i++)
      a[i] = args[i+from];

    return a;
  };
};

window._jsxtmp(jsx3.lang.Method, jsx3.lang.Method.prototype);
window._jsxtmp = null;
