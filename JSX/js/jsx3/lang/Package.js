/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _name _class _static _packageDidLoad

jsx3.lang.Package = jsx3.lang.newPrivateConstructor();

/**
 * The Package class provides an introspectable API for JavaScript/JSX packages. It also provides a way of defining 
 * new packages.
 * <p/>
 * An instance of this class may be obtained in one of the following ways (<b>this class may not be instantiated 
 * directly</b>):
 * <ul>
 * <li>jsx3.lang.jsxpackage</li>
 * <li>jsx3.Package.forName('jsx3.lang')</li>
 * </ul>
 * In this example, the JavaScript object <code>jsx3.lang</code> is known as the package "namespace," which is a plain
 * JavaScript object and is analogous to the constructor property of a jsx3.Class.
 * <p/>
 * The following is an example of how to define a new package called eg.tests:
 * <pre>
 * jsx3.lang.Package.definePackage(
 *   "eg.tests",                           // the full name of the package to create
 *   function(tests) {                  // name the argument of this function "eg"
 *     
 *     // define a static method like this:
 *     tests.staticMethod = function() {
 *       ...
 *     };
 *
 *     // define a static field like this:
 *     tests.STATIC_FIELD = "...";
 *   }
 * );
 * </pre>
 *
 * @since 3.1
 */
jsx3.lang.Class.defineClass("jsx3.lang.Package", null, null, function(Package, Package_prototype) {
  
  // imports
  var Class = jsx3.lang.Class;
  var Method = jsx3.lang.Method;
  
  /** @private @jsxobf-clobber */
  Package._PACKAGES = [];
  
  /**
   * Defines a new package so that it is available for introspection.
   * <p/>
   * It is not an error if the namespace object already exists prior to calling this method. Any members defined
   * by <code>fctBody</code> are simply added to the pre-existing namespace. Then, all members, whether defined
   * before the call to this method or with the call to this method, are made introspectable.
   * <p/>
   * This method may be called more than once with the same <code>strName</code> without causing an error. The
   * package is simply redefined. Only the members that are defined in the namespace object after the last call to
   * this method will be available for introspection.
   * <p/>
   * It is an error if, after <code>fctBody</code> is executed, any two members of the namespace object equal the
   * same function object. This is know as method aliasing, which can be a useful technique in JavaScript. Any
   * method aliasing within the namespace object must occur after the call to this method. Therefore, method aliasing
   * will cause an error if this package is redefined later.
   * 
   * @param strName {String} the full package name
   * @param fctBody {Function} the function that defines the body of the package. This function takes one argument 
   *    which is the package "namespace".
   */
  Package.definePackage = function(strName, fctBody) {
    var objOwner = Class._getOrCreatePackage(strName.split("."));

    var bRedefinition = false;
    var objPackage = null;
    if (objOwner.jsxpackage != null) {
      if (jsx3.Class.forName("jsx3.util.Logger"))
        jsx3.util.Logger.getLogger("jsx3.lang").info(jsx3._msg("pkg.redefine", strName));

      objPackage = objOwner.jsxpackage;
      bRedefinition = true;
      objPackage._staticFields = [];
      objPackage._staticMethods = [];
    } else {
      objPackage = Class._newInstanceForce(Package);
      objPackage._pname = strName;
      /* has been observed to cause memory leaks in IE
      objPackage._owner = objOwner; // create 2-way reference, if removed will still work */
      objPackage._staticFields = [];
      objPackage._staticMethods = [];
      objOwner.jsxpackage = objPackage;    
    }
    
    try {
      fctBody(objOwner);
    } catch (e) {
      var ex = jsx3.NativeError.wrap(e);
      throw new jsx3.Exception(jsx3._msg("pkg.def_error", strName, ex), ex);
    }
    
    // define static methods
    for (var f in objOwner) {
      if (f == "jsxpackage") continue;
      if (typeof(objOwner[f]) == "function") {
        // don't define classes as static methods
        if (objOwner[f].jsxclass == null)
          this._blessMethod(objOwner[f], objPackage, f);
      } else {
        // don't define packages as static fields
        if (objOwner[f] == null || typeof(objOwner[f]) != "object" || objOwner[f].jsxpackage == null)
          objPackage._staticFields.push(f);
      }
    }
    
    // define no such method catch-all for Mozilla
    if (objOwner.__noSuchMethod__ == null)
      objOwner.__noSuchMethod__ = function(strMethod, args) {
        throw new jsx3.Exception(jsx3._msg("class.nsm", strName + "#" + strMethod + "()"));
      };
    
    Package._PACKAGES.push(objPackage);
    
    jsx3.CLASS_LOADER._packageDidLoad(objPackage);
  };
  
  /** @private @jsxobf-clobber */
  Package._blessMethod = function(fctMethod, objPackage, strName) {
    if (fctMethod.jsxmethod instanceof Method) {
      // renaming a method in this package is an error
      if (fctMethod.jsxmethod.getDeclaringClass().equals(objPackage) && fctMethod.jsxmethod.getName() != strName) {
        throw new jsx3.Exception(jsx3._msg("class.redef_method", fctMethod.jsxmethod, objPackage + "." + strName));
      } else {
        if (fctMethod.jsxmethod.getDeclaringClass().equals(objPackage) && 
            jsx3.util.arrIndexOf(objPackage._staticMethods, fctMethod.jsxmethod) < 0)
          objPackage._staticMethods.push(fctMethod.jsxmethod);
        return;
      }
    }
    
    var objMethod = Class._newInstanceForce(Method);
    /* has been observed to cause memory leaks in IE
    objMethod._function = fctMethod; // create 2-way reference, if removed will still work */
    objMethod._class = objPackage;
    objMethod._name = strName;
    objMethod._static = true;

    fctMethod.jsxmethod = objMethod;
  
    objPackage._staticMethods.push(objMethod);
  };
  
  /**
   * Returns the defined package with name equal to <code>strName</code>.
   * @param strName {String} the full name of the package to retrieve
   * @return {jsx3.lang.Package} the package or <code>null</code> if none matches
   */
  Package.forName = function(strName) {
    var c = jsx3.lang.getVar(strName);
    return c ? c.jsxpackage : null;
  };
  
  /**
   * Returns a list of all defined packages.
   * @return {Array<jsx3.Package>}
   */
  Package.getPackages = function() {
    return Package._PACKAGES.concat();
  };
  
  /** @private @jsxobf-clobber */
  Package_prototype._pname = null;
  /** @private @jsxobf-clobber */
  Package_prototype._owner = null;
  /** @private @jsxobf-clobber */
  Package_prototype._staticMethods = null;
  /** @private @jsxobf-clobber */
  Package_prototype._staticFields = null;
  
  /**
   * Returns the fully-qualified name of this class.
   * @return {String}
   */
  Package_prototype.getName = function() {
    return this._pname;
  };
  
  /**
   * Returns the namespace of this package. The namespace is the JavaScript object, descending from
   *    window, that references this package by its property <code>jsxpackage</code>.
   * @return {Object}
   */
  Package_prototype.getNamespace = function() {
    if (this._owner != null) return this._owner;
    var c = jsx3.lang.getVar(this._pname);
    return c || null;
  };
  
  /**
   * Returns an array of all the classes defined in this package.
   * @return {Array<jsx3.Class>}
   */
  Package_prototype.getClasses = function() {
    var classes = [];
    var owner = this.getNamespace();
    for (var f in owner) {
      if (typeof(owner[f]) == "function" && owner[f].jsxclass instanceof Class) {
        if (owner[f].jsxclass.getPackage() == this && 
            (this.getName() + "." + f) == owner[f].jsxclass.getName()) {
          classes[classes.length] = owner[f].jsxclass;
          classes.push.apply(classes, owner[f].jsxclass.getClasses());
        }
      }
    }
    return classes;
  };
  
  /**
   * Returns the array of static methods defined for this package.
   * @return {Array<jsx3.Method>} an array of jsx3.Method instances
   */
  Package_prototype.getStaticMethods = function() {
    return this._staticMethods.concat();
  };
  
  /**
   * Returns the static method defined in this package with name <code>strMethodName</code>.
   * @param strMethodName {String} the name of the method to find
   * @return {jsx3.Method} the method or null if none found matching <code>strMethodName</code>
   */
  Package_prototype.getStaticMethod = function(strMethodName) {
    for (var i = 0; i < this._staticMethods.length; i++) {
      if (strMethodName == this._staticMethods[i].getName())
        return this._staticMethods[i];
    }
    return null;
  };
  
  /**
   * Returns the array of static fields defined for this package.
   * @return {Array<String>} an array of String names
   */
  Package_prototype.getStaticFieldNames = function() {
    return this._staticFields.concat();
  };
  
  /**
   * @return {String}
   */
  Package_prototype.toString = function() {
    return this._pname;
  };
  
});
