/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

if (window["jsx3"] == null) window["jsx3"] = new window.Object();
if (jsx3.lang == null) jsx3.lang = new window.Object();

// @jsxobf-clobber  _constructor _super _interface _implements _staticMethods _instanceMethods _instanceMethodIndex _staticFields _instanceFields _superMap _superMixinMap _ancestors
// @jsxobf-clobber-shared  _name _class _static _abstract _classDidLoad

/**
 * JavaScript class that allows introspection of the JSX class hierarchy.
 * <p/>
 * You may obtain an instance of <code>jsx3.lang.Class</code> in one of the following ways:
 * <ul>
 *   <li>var c = jsx3.Class.forName("jsx3.Object");</li>
 *   <li>var c = jsx3.Object.jsxclass;</li>
 * </ul>
 * This class is also used for defining classes. Use one of <code>defineClass</code> and
 * <code>defineInterface</code> to define a class in the JSX class hierarchy. <i>Note that any class defined
 * in the package <code>jsx3.lang</code> is aliased into the <code>jsx3</code> package. Therefore 
 * <code>jsx3.lang.Object</code> may also be referenced as <code>jsx3.Object</code>.</i>
 * <p/>
 * The following are class nomenclature definitions using jsx3.lang.Object as an example:
 * <ul>
 *   <li>jsx3.lang &#8212; the package, an instance of (JavaScript, not JSX) <code>Object</code></li>
 *   <li>jsx3.lang.Object &#8212; the class constructor, instance of <code>Function</code></li>
 *   <li>jsx3.lang.Object.jsxclass &#8212; the class, instance of <code>jsx3.lang.Class</code></li>
 *   <li>jsx3.lang.Object.prototype &#8212; the class prototype, instance of <code>Object</code></li>
 * </ul>
 * <p/>
 * The following is an example of how to define a new class called Example in package eg:
 * <pre>
 * jsx3.lang.Class.defineClass(
 *   "eg.Example",                   // the full name of the class to create
 *   eg.Base,                        // the class extends eg.Base
 *   [eg.Comparable, eg.Testable],   // the class implements interfaces eg.Comparable and eg.Testable
 *   function(Example) {             // name the argument of this function "Example"
 *     
 *     // every class must define an init method since it is called automatically by the constructor
 *     Example.prototype.init = function(arg1) {
 *       this.arg1 = arg1;
 *     };
 *
 *     // define an instance method like this:
 *     Example.prototype.instanceMethod = function() {
 *       ...
 *     };
 *
 *     // define an abstract method like this:
 *     Example.prototype.abstractMethod = jsx3.Method.newAbstract();
 *
 *     // define a static method like this:
 *     Example.staticMethod = function() {
 *       ...
 *     };
 *
 *     // define a static field like this:
 *     Example.STATIC_FIELD = "...";
 *
 *     // define an instance field like this:
 *     Example.prototype.instanceField = "...";
 *   }
 * );
 * </pre>
 *
 * @see jsx3.lang.Object
 * @see jsx3.lang.Method
 * @see jsx3.lang.Package
 *
 * @since 3.1
 *
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.lang.Class", null, null, function(){});
 */
jsx3.lang.Class = jsx3.lang.newPrivateConstructor();

// bootstrap Class superclass
jsx3.lang.Class.prototype = new jsx3.lang.Object;
jsx3.lang.Class.prototype.__jsxclass__ = jsx3.lang.Class;

/* @jsxobf-clobber */
window._jsxtmp = function(Class, Class_prototype) {
  
  /** @private @jsxobf-clobber */
  Class._SPECIAL = {"jsx3.lang.Object":1, "jsx3.lang.Method":1, "jsx3.lang.ClassLoader": 1, "jsx3.lang.Class": 2};
  
  /** @private @jsxobf-clobber */
  Class._NON_ITERATED = ["toString", "valueOf"];
  
  /** @private @jsxobf-clobber */
  Class._SKIP_ITERATED = {prototype:1, constructor:1, jsxclass:1, __jsxclass__:1}; // Mozilla browser likes to iterate over the first two

  /** @private @jsxobf-clobber */
  Class._LOG = null;

  /**
   * Defines a new class in the JSX hierarchy. After executing this method, an instance of 
   * jsx3.lang.Class representing the new class will be available for introspection.
   *
   * @param strName {String} the full name of the class to create, including the package prefix
   * @param objExtends {Function|jsx3.Class} the super class of the class to create; either the class constructor
   *     or the jsx3.Class instance itself. If no super class is provided, jsx3.Object will be used. May be
   *     null. If provided and representing an introspectable class, must be a class rather than an interface.
   * @param arrImplements {Array<jsx3.Class|Function|String>} the array of interfaces that the class to create will implement. Each item in
   *     the array may be either a class constructor, an instance of jsx3.Class, or a string but must represent an 
   *     interface (a class created with <code>defineInterface</code>). May also be null or empty.
   * @param fctBody {Function} a function that defines the body of the class. This function takes two arguments,
   *     the constructor of the newly created interface, and its prototype. See class summary for more information.
   */
  Class.defineClass = function(strName, objExtends, arrImplements, fctBody) {
    this._define(strName, objExtends, arrImplements, fctBody, false);
  };
  
  /**
   * Defines a new interface in the JSX hierarchy. After executing this method, an 
   * instance of jsx3.lang.Class representing the new interface will be available for introspection.
   *
   * @param strName {String} the full name of the interface to create, including the package prefix
   * @param objExtends {Function|jsx3.Class} the super interface of the interface to create; either the class 
   *     constructor or the jsx3.Class instance itself. If no super interface is provided, Object will be used. 
   *     May be <code>null</code>. If provided and representing an introspectable class, must be an interface rather
   *     than a class.
   * @param fctBody {Function} a function that defines the body of the interface. This function takes two arguments,
   *     the constructor of the newly created interface, and its prototype. See class summary for more information.
   */
  Class.defineInterface = function(strName, objExtends, fctBody) {
    this._define(strName, objExtends, null, fctBody, true);
  };
  
  /** @private @jsxobf-clobber */
  Class._define = function(strName, objExtends, arrImplements, fctBody, bInterface) {
    if (Class._LOG == null && Class.forName && Class.forName("jsx3.util.Logger.Manager")
        && jsx3.util.Logger.Manager.getManager())
      Class._LOG = jsx3.util.Logger.getLogger("jsx3.lang.Class");

    // parse name into package and class name
    var pathTokens = strName.split(".");
    var className = pathTokens.pop();
    var myPackage = this._getOrCreatePackage(pathTokens);
    var bSpecial = this._SPECIAL[strName] != null;
    
    // resolve the super class
    var fctSuperConstructor = null;
    if (objExtends == null) {
      fctSuperConstructor = (bInterface || strName == "jsx3.lang.Object") ? window.Object : jsx3.lang.Object;
    } else if (objExtends instanceof Class) {
      fctSuperConstructor = objExtends.getConstructor();
    } else if (typeof(objExtends) == "function" && objExtends.prototype != null) {
      fctSuperConstructor = objExtends;
    } else {
      Class._throw(jsx3._msg("class.bad_super", objExtends));
    }
    
    if (myPackage[className] && myPackage[className].jsxclass) {
      Class._throw(jsx3._msg("class.redefine", strName, myPackage[className].jsxclass), null, 2);
    } else {
      var bConstructorExists = false;
      if (!bSpecial) {
        // check inheritance rules
        if (fctSuperConstructor.jsxclass != null) {
          if (bInterface && ! fctSuperConstructor.jsxclass.isInterface())
            Class._throw(jsx3._msg("class.int_ext_class", strName, fctSuperConstructor.jsxclass));
          if (! bInterface && fctSuperConstructor.jsxclass.isInterface())
            Class._throw(jsx3._msg("class.class_ext_int", strName, fctSuperConstructor.jsxclass));
        }

        // create the constructor, which calls init()
        if (typeof(myPackage[className]) == "function") {
          bConstructorExists = true;
        } else if (bInterface) {
          // will this work with JavaScript prototype inheritance?
          myPackage[className] = jsx3.lang.newPrivateConstructor();
        } else if (typeof(myPackage[className]) == "object") {
          // support a class being defined previously as a package ...
          var tmp = myPackage[className];
          myPackage[className] = jsx3.lang.newConstructor();
          for (var f in tmp)
            myPackage[className][f] = tmp[f];
        } else {
          myPackage[className] = jsx3.lang.newConstructor();
        }

        // set up JavaScript inheritance
        myPackage[className].prototype = this._newInstanceNoInit(fctSuperConstructor, bInterface);
      }

      // create a reference from constructor to jsx3.lang.Class
      myPackage[className].prototype.__jsxclass__ = myPackage[className];

      var fctConstructor = myPackage[className];

      // alias jsx3.lang to jsx3
      if (pathTokens.join(".") == "jsx3.lang")
        jsx3[className] = fctConstructor;

      // create the jsx3.lang.Class instance, bootstrap since we use this method to create Class as well
      var objClass = Class._newInstanceForce(Class);
      objClass._name = strName;
      /* this reference seems to be OK */
      objClass._constructor = fctConstructor; // create 2-way reference, if removed will still work
      if (fctSuperConstructor != null)
        objClass._super = fctSuperConstructor.jsxclass; // may be null, ok
      objClass._interface = bInterface;
      objClass._implements = [];
      objClass._staticMethods = [];
      objClass._instanceMethods = [];
      var staticFields = objClass._staticFields = [];
      var instanceFields = objClass._instanceFields = [];
      objClass._superMap = {};
      objClass._superMixinMap = {};

      fctConstructor.jsxclass = objClass;

      // define the body of the class
      try {
        fctBody(fctConstructor, fctConstructor.prototype);
      } catch (e) {
        var ex = jsx3.NativeError ? jsx3.NativeError.wrap(e) : null;
        Class._throw(jsx3._msg("class.def_error", strName, ex || e.description), ex);
      }

      // define static methods
      for (var f in fctConstructor) {
        if (Class._SKIP_ITERATED[f]) continue;

        if (typeof(fctConstructor[f]) == "function") {
          this._blessMethod(fctConstructor[f], objClass, f, true);
        } else {
          staticFields[staticFields.length] = f;
        }
      }
      // static methods that don't show up in a for loop
      for (var i = 0; i < Class._NON_ITERATED.length; i++) {
        var name = Class._NON_ITERATED[i];
        if (fctConstructor[name] != null && fctConstructor[name] != window.Function.prototype[name] &&
            fctConstructor[name].jsxmethod == null)
          this._blessMethod(fctConstructor[name], objClass, name, true);
      }

      // define instance methods and fields
      for (var f in fctConstructor.prototype) {
        if (Class._SKIP_ITERATED[f]) continue;

        var funct = fctConstructor.prototype[f];
        if (typeof(funct) == "function") {
          if (fctSuperConstructor == null || funct != fctSuperConstructor.prototype[f])
            this._blessMethod(funct, objClass, f, false);
        } else {
          instanceFields[instanceFields.length] = f;
        }
      }
      // instance methods that don't show up in a for loop
      for (var i = 0; i < Class._NON_ITERATED.length; i++) {
        var name = Class._NON_ITERATED[i];
        if (fctConstructor.prototype[name] != null && fctConstructor.prototype[name] != window.Object.prototype[name] &&
            fctConstructor.prototype[name].jsxmethod == null)
          this._blessMethod(fctConstructor.prototype[name], objClass, name, false);
      }

      // ensure init() method defined
      if (!bConstructorExists && !bInterface && !(typeof(fctConstructor.prototype.init) == "function"))
        Class._throw(jsx3._msg("class.no_init", strName));

      // import mixin interface methods
      if (jsx3.$A.is(arrImplements)) {
        // go backwards through interfaces because we clobber and first defined interface has precedence
        for (var i = arrImplements.length-1; i >= 0; i--)
          Class._defineImplements(objClass, fctConstructor, arrImplements[i]);
      }

      if (Class._LOG)
        Class._LOG.trace("loaded " + strName);

  // Enables Class.require(), which is commented out below.
  //    Class._checkWaiting();
      jsx3.CLASS_LOADER._classDidLoad(objClass);
    }
  };
  
  /** @private @jsxobf-clobber */
  Class._defineImplements = function(objClass, fctConstructor, anInterface) {
    if (typeof(anInterface) == "function" && anInterface.jsxclass != null)
      anInterface = anInterface.jsxclass;
    else if (!(anInterface instanceof Class))
      Class._throw(jsx3._msg("class.bad_int", objClass, anInterface));
        
    if (! anInterface.isInterface())
      Class._throw(jsx3._msg("class.class_imp_class", objClass, anInterface));

    // import interface methods into this class
    var interfacePrototype =  anInterface.getConstructor().prototype;
    for (var f in interfacePrototype) {
      var interfaceFunction = interfacePrototype[f];
      var interfaceMethod = typeof(interfaceFunction) == "function" ? interfaceFunction.jsxmethod : null;
      if (interfaceMethod == null) continue;
      var existingFunction = fctConstructor.prototype[f];
          
      // import method if no existing method by that name ...
      if (existingFunction == null) {
        fctConstructor.prototype[f] = interfaceFunction;
      } 
      // ... or if there is existing method but it wasn't defined in this class
      else if (! existingFunction.jsxmethod.getDeclaringClass().equals(objClass)) {
        fctConstructor.prototype[f] = interfaceFunction;
      }
    }
  
    // add interface to list of interfaces
    objClass._implements.unshift(anInterface);
  };
  
  /**
   * @private
   */
  Class._getOrCreatePackage = function(arrTokens) {
    var node = window;
    for (var i = 0; i < arrTokens.length; i++) {
      var token = arrTokens[i];
      if (node[token] == null) node[token] = new window.Object();
      node = node[token];
    }
    return node;
  };
  
  /** @private @jsxobf-clobber */
  Class._blessMethod = function(fctMethod, objClass, strName, bStatic) {
    if (fctMethod.jsxmethod instanceof jsx3.lang.Method) {
      if (fctMethod.jsxmethod.getDeclaringClass().equals(objClass))   
        Class._throw(jsx3._msg("class.redef_method", fctMethod.jsxmethod, objClass + "." + strName));
      else
        return;
    }
    
    var objMethod = Class._newInstanceForce(jsx3.lang.Method);
    /* this reference seems to be OK */
    objMethod._class = objClass;
    objMethod._name = strName;
    objMethod._static = bStatic;
    objMethod._abstract = Boolean(fctMethod._abstract);

    fctMethod.jsxmethod = objMethod;

    var collection = bStatic ? objClass._staticMethods : objClass._instanceMethods;
    collection[collection.length] = objMethod;
  };
  
  /** @private @jsxobf-clobber */
  Class._newInstanceNoInit = function(fctConstructor, bInterface) {
    if (fctConstructor == Object) return {};
    return new fctConstructor(bInterface ? jsx3.lang._NEW_FORCE : jsx3.lang._NEW_NO_INIT);
  };
  
  /**
   * @private
   */
  Class._newInstanceForce = function(fctConstructor) {
    return new fctConstructor(jsx3.lang._NEW_FORCE);
  };
  
  /** @private @jsxobf-clobber */
  Class._throw = function(strMessage, objCause, intLevel) {
    if (Class._LOG) {
      Class._LOG.log(intLevel || jsx3.util.Logger.FATAL, strMessage, objCause);
    } else if (jsx3.Exception) {
      var e = new jsx3.Exception(strMessage, objCause);
      window.alert(e.printStackTrace());
    } else {
      window.alert(strMessage);
    }
  };
};

window._jsxtmp(jsx3.lang.Class, jsx3.lang.Class.prototype);
window._jsxtmp = null;

jsx3.lang.Class.defineClass("jsx3.lang.Class", null, null, function(Class, Class_prototype) {
  
  /**
   * Retrieve an instance of jsx3.Class for a fully-qualified class name. This method will also return aliased 
   * classes such as <code>jsx3.Object</code>. Thus the name of the class returned by this method may not always equal the value
   * of the <code>strName</code> parameter.
   * 
   * @param strName {String} the fully-qualified (including package prefix) class name
   * @return {jsx3.Class}
   */
  Class.forName = function(strName) {
    var c = jsx3.lang.getVar(strName);
    return c ? c.jsxclass : null;
  };

// JCG: Wrote this and now I don't use it anymore. Maybe it will come in handy in the future.
//
//  /* @private @--jsxobf-clobber */
//  Class._WAITING = [];
//  
//  /*
//   * Invokes a callback function once all prerequisite classes are loaded.
//   * @param arrPrereq {Array<String>} a list of fully-qualified class names.
//   * @param fctCallback {Function} the callback function. This method will be called synchronously if all 
//   *    prerequisites are already loaded.
//   * @package
//   */
//  Class.require = function(arrPrereq, fctCallback) {
//    for (var i = 0; i < arrPrereq.length; i++) {
//      if (! Class.forName(arrPrereq[i])) {
//        Class._WAITING.push([arrPrereq, fctCallback]);
//        return;
//      }
//    }
//    fctCallback();
//  };
//  
//  /* @private @--jsxobf-clobber */
//  Class._checkWaiting = function() {
//    WAITING: for (var i = 0; i < Class._WAITING.length; i++) {
//      var arrPrereq = Class._WAITING[i][0];
//      PREREQ: for (var j = 0; j < arrPrereq.length; j++) {
//        if (! Class.forName(arrPrereq[j]))
//          continue WAITING;
//      }
//      
//      var fctCallback = Class._WAITING[i][1];
//      Class._WAITING.splice(i--, 1);
//      fctCallback();
//    }
//  };
  
  /**
   * Returns the fully-qualified name of this class.
   * @return {String}
   */
  Class_prototype.getName = function() {
    return this._name;
  };
  
  /**
   * Returns the package of this class. This may be null if the namespace that this class was 
   *    defined in was never initialized with <code>jsx3.lang.Package.definePackage</code>.
   * @return {jsx3.Package}
   */
  Class_prototype.getPackage = function() {
    var path = this._name;
    while (true) {
      // get the fully-qualified name less the last token
      var index = path.lastIndexOf(".");
      if (index < 0) break;
      path = path.substring(0, index);
      // check for a package
      var pkg = jsx3.lang.Package.forName(path);
      if (pkg != null) return pkg;
      // OR, this could be an inner class
      if (Class.forName(path) == null) break;
    }
    return null;
  };
  
  /**
   * Returns the package name of this class, e.g. <code>jsx3.lang</code>. If the package containing this class has
   * been defined, then this method returns the name of the package. Otherwise, it returns the fully-qualified name
   * of this class less the final token.
   * @return {String}
   */
  Class_prototype.getPackageName = function() {
    var pkg = this.getPackage();
    if (pkg) {
      return pkg.getName();
    } else {
      var index = this._name.lastIndexOf(".") + 1;
      return index >= 0 ? this._name.substring(0, index-1) : "";
    }
  };
  
  /**
   * Returns the constructor function of this class.
   * @return {Function}
   */
  Class_prototype.getConstructor = function() {
    if (this._constructor != null) return this._constructor;
    
    var c = jsx3.lang.getVar(this._name);
    return c || null;
  };
  
  /**
   * Returns the super class of this class. This will be null for an interface without a super interface or 
   * <code>jsx3.lang.Object</code>.
   * @return {jsx3.Class} null if no super class is defined
   */
  Class_prototype.getSuperClass = function() {
    return this._super;
  };
  
  /**
   * Returns whether this class was defined as an interface.
   * @return {boolean}
   */
  Class_prototype.isInterface = function() {
    return this._interface;
  };
  
  /**
   * @return {String}
   */
  Class_prototype.toString = function() {
    return this._name;
  };
  
  /**
   * Creates a new instance of this class by invoking the class constructor. This is equivalent to calling 
   * <code>new()</code> on this class's constructor function and will call the class's <code>init()</code> method.
   * @param arg {Object...} the variable number of arguments to send to the constructor
   * @return {Object}
   */
  Class_prototype.newInstance = function(arg) {
    if (arguments.length > 10)
      throw new jsx3.Exception(jsx3._msg("class.new_inst"));
    var a = arguments;
    var c = this.getConstructor();
    return new c(a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7],a[8],a[9]);
  };
  
  /**
   * Determines whether an object is an instance of this class.
   * @param obj {Object} the object to test
   * @return {boolean}
   * @throws {Error} if <code>obj</code> is <code>null</code>.
   */
  Class_prototype.isInstance = function(obj) {
    var objClass = obj.__jsxclass__ ? obj.__jsxclass__.jsxclass : null;
    return objClass != null && this.isAssignableFrom(objClass);
  };
  
  /**
   * Determines whether this class is the same as or is a superclass or superinterface
   *    of parameter <code>objClass</code>.
   * @param objClass {jsx3.Class} the class to test
   * @return {boolean}
   */
  Class_prototype.isAssignableFrom = function(objClass) {
    if (this.equals(objClass)) return true;
    
    // lazily create ancestor hash
    if (objClass._ancestors == null)
      objClass._cacheAncestors();
    
    return objClass._ancestors[this.getName()] == true;
  };

  /** @private @jsxobf-clobber */
  Class_prototype._cacheAncestors = function() {
    this._ancestors = {};
    for (var i = 0; i < this._implements.length; i++) {
      var anInterface = this._implements[i];
      this._ancestors[anInterface.getName()] = true;
      
      if (anInterface._ancestors == null)
        anInterface._cacheAncestors();
      for (var f in anInterface._ancestors)
        this._ancestors[f] = true;
    }
    
    if (this._super != null) {
      this._ancestors[this._super.getName()] = true;
      if (this._super._ancestors == null)
        this._super._cacheAncestors();
      for (var f in this._super._ancestors)
        this._ancestors[f] = true;
    }
  };
  
  /**
   * Copies all the instance methods in this class into an instance (of another class).
   * @param obj {Object} the target of the method transfer
   * @param bNoClobber {boolean} if true, then do not transfer any methods already existing in <code>obj</code>
   * @param arrNames {Array<String>}
   */
  Class_prototype.mixin = function(obj, bNoClobber, arrNames) {
    if (arrNames) {
      for (var i = 0; i < arrNames.length; i++) {
        var method = this.getInstanceMethod(arrNames[i]);
        if (method && obj[method.getName()] == null || !bNoClobber)
          obj[method.getName()] = method.getFunction();
      }
    } else {
      for (var i = 0; i < this._instanceMethods.length; i++) {
        var method = this._instanceMethods[i];
        if (obj[method.getName()] == null || !bNoClobber)
          obj[method.getName()] = method.getFunction();
      }
    }
  };
  
  /**
   * Creates a new instance of this class and populates its properties with the properties of the 
   *    <code>obj</code> parameter. <b>Does not call <code>init()</code> when instantiating the class.</b>
   * @param obj {Object} Optional parameter. If provided, this method will copy all the properties of <code>obj</code>
   *    into the newly created object.
   * @return {jsx3.Object} a new instance of this class
   * @throws {jsx3.Exception} if called on an instance of <code>jsx3.lang.Class</code> that represents an interface
   */
  Class_prototype.bless = function(obj) {
    if (this.isInterface())
      throw new jsx3.Exception(jsx3._msg("class.bless_int", this));
    
    var instance = Class._newInstanceNoInit(this.getConstructor());
    if (obj != null) {
      for (var f in obj) {
        if (!(typeof(obj[f]) == "function"))
          instance[f] = obj[f];
      }
    }
    return instance;
  };
  
  /**
   * Creates a new instance of this class so that it can be used to create a java-style inner
   * class extending this class. This method will instantiate an interface or a class, in which case the 
   * <code>init()</code> method will be called. In this way you can accomplish the following:
   * <pre>
   * var aClass = eg.Testable.jsxclass;       // get jsx3.lang.Class instance
   * var innerClass = aClass.newInnerClass(); // create inner class instance
   * innerClass.test = function() {};         // implement the eg.Testable interface
   * innerClass instanceof eg.Testable;       // evaluates to true
   * </pre>
   *
   * @param arg {Object...} arguments to pass to the constructor, supports up to 10 arguments
   * @return {jsx3.Object} a new instance of this class
   */
  Class_prototype.newInnerClass = function(arg) {
    if (this.isInterface()) {
      return Class._newInstanceForce(this.getConstructor());
    } else {
      return this.newInstance.apply(this, arguments);
    }
  };
  
  /**
   * Returns the array of static methods defined for this class.
   * @return {Array<jsx3.Method>} an array of jsx3.lang.Method instances
   */
  Class_prototype.getStaticMethods = function() {
    return this._staticMethods.concat();
  };
  
  /**
   * Returns the array of instance methods defined for this class.
   * @return {Array<jsx3.Method>} an array of jsx3.lang.Method instances
   */
  Class_prototype.getInstanceMethods = function() {
    return this._instanceMethods.concat();
  };
  
  /**
   * Returns the static method defined in this class with name <code>strMethodName</code>.
   * @param strMethodName {String} the name of the method to find
   * @return {jsx3.Method} the method or null if none found matching <code>strMethodName</code>
   */
  Class_prototype.getStaticMethod = function(strMethodName) {
    for (var i = 0; i < this._staticMethods.length; i++) {
      if (strMethodName == this._staticMethods[i].getName())
        return this._staticMethods[i];
    }
    return null;
  };
  
  /**
   * Returns the instance method defined in this class with name <code>strMethodName</code>.
   * @param strMethodName {String} the name of the method to find
   * @return {jsx3.Method} the method or null if none found matching <code>strMethodName</code>
   */
  Class_prototype.getInstanceMethod = function(strMethodName) {
    if (!this._instanceMethodIndex) {
      this._instanceMethodIndex = {};
      for (var i = 0; i < this._instanceMethods.length; i++)
        this._instanceMethodIndex[this._instanceMethods[i].getName()] = this._instanceMethods[i];
    }
    return this._instanceMethodIndex[strMethodName] || null;
  };
  
  /**
   * Returns the accessor (getter) method of this class's bean property <code>strProp</code>. Searches this class and
   * the classes that it inherits method from
   * for an instance method named "getStrProp" or "isStrProp" using the <code>strProp</code> parameter with the first
   * letter made uppercase.
   * @param strProp {String} the name of the bean property whose getter to return
   * @return {jsx3.Method} the method or null if none found
   */
  Class_prototype.getGetter = function(strProp) {
    strProp = strProp.charAt(0).toUpperCase() + strProp.substring(1);
    return this._findMethod("get" + strProp) || this._findMethod("is" + strProp);
  };
  
  /**
   * Returns the mutator (setter) method of this class's bean property <code>strProp</code>. Searches this class and
   * the classes that it inherits method from
   * for an instance method named "setStrProp" using the <code>strProp</code> parameter with the first
   * letter made uppercase.
   * @param strProp {String} the name of the bean property whose setter to return
   * @return {jsx3.Method} the method or null if none found
   */
  Class_prototype.getSetter = function(strProp) {
    strProp = strProp.charAt(0).toUpperCase() + strProp.substring(1);
    return this._findMethod("set" + strProp);
  };
  
  /**
   * Returns the array of static fields defined for this class.
   * @return {Array<String>} an array of String instances
   */
  Class_prototype.getStaticFieldNames = function() {
    return this._staticFields.concat();
  };
  
  /**
   * Returns the array of instance fields defined for this class.
   * @return {Array<String>} an array of String instances
   */
  Class_prototype.getInstanceFieldNames = function() {
    return this._instanceFields.concat();
  };
  
  /**
   * Returns the array of interfaces that this class was defined to implement. This method does not return the 
   * interfaces that this class implements by way of its superclass.
   * @return {Array<jsx3.Class>} an array of jsx3.Class instances
   */
  Class_prototype.getInterfaces = function() {
    return this._implements.concat();
  };
  
  /**
   * Causes this class to implement interface <b>objInterface</b>. This method is called after this class is
   * defined so it can be used to have this class implement an interface that is defined after it.
   * @param objInterface {jsx3.lang.Class}
   * @package  -> for now
   */
  Class_prototype.addInterface = function(objInterface) {
    var errmsg = null;
    if (this.isInterface())
      errmsg = "class.int_imp_int";
    else if (! objInterface.isInterface())
      errmsg = "class.class_imp_class";
    else if (objInterface.isAssignableFrom(this))
      errmsg = "class.already_imp";
    if (errmsg) throw new jsx3.Exception(jsx3._msg(errmsg, this, objInterface));

    Class._defineImplements(this, this.getConstructor(), objInterface);
    delete this._ancestors;
  };
  
  /**
   * Returns the array of classes and interfaces that this class inherits from, ordered by
   * precedence from highest to lowest. This is the same order the defines where an inherited method will come from.
   * <p/>
   * The order is: 
   * <ol><li>this class (not included in the returned array of this method)</li>
   * <li>the interfaces that this class implements in the order that they were passed to the defineClass() function</li>
   * <li>the superclass of this class ... recursively</li>
   * </ol>
   * @return {Array<jsx3.Class>} an array of jsx3.Class instances
   */
  Class_prototype.getInheritance = function() {
    var inherit = this._implements.concat();
    if (this._super != null) {
      inherit[inherit.length] = this._super;
      inherit.push.apply(inherit, this._super.getInheritance());
    }
    return inherit;
  };
  
  /**
   * Returns an array of all the classes defined in this class. This method returns the JSX equivalent of Java's 
   * public static inner classes. 
   * <p/>
   * To be returned by this method, a static inner class should be defined after the containing class is defined, 
   * like this:
   * <pre>
   * jsx3.Class.defineClass("eg.ContainingClass", null, null, function(){});
   * jsx3.Class.defineClass("eg.ContainingClass.InnerClass", null, null, function(){});
   * </pre>
   *
   * @return {Array<jsx3.Class>}
   */
  Class_prototype.getClasses = function() {
    var constructor = this.getConstructor();
    var classes = [];
    for (var f in constructor) {
      if (typeof(constructor[f]) == "function" && constructor[f].jsxclass instanceof Class) {
        classes[classes.length] = constructor[f].jsxclass;
        classes.push.apply(classes, constructor[f].jsxclass.getClasses());
      }
    }
    return classes;
  };

  /**
   * Adds an after advice function to a method of this class via AOP. The pointcut is only active for instances of
   * <code>objClass</code>.
   *
   * @param strMethod {String} the name of the method of this class to which to add the advice.
   * @param objClass {jsx3.lang.Class} the type condition for the pointcut.
   * @param strMixin {String} the name of the method to call from the advice function. This method is called on the
   *   the same instance of this class on which <code>strMethod</code> is called. 
   * @since 3.5
   * @see jsx3.lang.AOP
   */
  Class_prototype.addMethodMixin = function(strMethod, objClass, strMixin) {
    var objMethod = this.getInstanceMethod(strMethod);
    if (!objMethod) Class._throw(jsx3._msg("class.mmix_bad", this, strMethod));
    
    var AOP = jsx3.AOP;
    if (!AOP) Class._throw(jsx3._msg("class.no_aop", this, strMethod));
    
    var pointName = this.getName() + "." + strMethod + "." + objClass.getName();
    AOP.pc(pointName, {classes:this, methods:strMethod, type:objClass}).after(pointName, function() {
      this[strMixin].apply(this, jsx3.Method.argsAsArray(arguments, 1));
    });
  };
  
  /**
   * Looks in the inheritance list of this class for a method. This should always match what is actually in the
   * class prototype.
   * @return {jsx3.Method}
   * @private
   * @jsxobf-clobber
   */
  Class_prototype._findMethod = function(strMethodName, bExcludeSelf) {
    var objMethod = null;
    
    // look in self
    if (! bExcludeSelf)
      objMethod = this.getInstanceMethod(strMethodName);
    
    var inheritance = this.getInheritance();
    for (var i = 0; objMethod == null && i < inheritance.length; i++) {
      objMethod = inheritance[i].getInstanceMethod(strMethodName);
    }

    return objMethod;
  };
  
  /**
   * Looks in the superclasses of this class for a method.
   * @return {jsx3.Method}
   * @private
   * @jsxobf-clobber
   */
  Class_prototype._findSuperMethod = function(strMethodName, bExcludeSelf) {
    var objMethod = null;
    
    // look in self
    if (! bExcludeSelf)
      objMethod = this.getInstanceMethod(strMethodName);

    // look in superclass
    if (objMethod == null && this._super != null)
      objMethod = this._super._findSuperMethod(strMethodName);
    
    return objMethod;
  };
  
  /**
   * Looks in the super interfaces of this class for a method.
   * @return {jsx3.Method}
   * @private
   * @jsxobf-clobber
   */
  Class_prototype._findMixinMethod = function(strMethodName) {
    var objMethod = null;

    for (var i = 0; i < this._implements.length && objMethod == null; i++)
      objMethod = this._implements[i].getInstanceMethod(strMethodName);

    if (objMethod == null && this._super != null)
      objMethod = this._super._findMixinMethod(strMethodName);
    
    return objMethod;
  };
  
  /**
   * @return {jsx3.Method}
   * @package
   */
  Class_prototype._getSuperMethodFor = function(objMethod) {
    var methodName = objMethod.getName();
    var superMethod = this._superMap["m:" + methodName];
    
    // will be null if already queried and not found, if undefined need to query still
    if (typeof(superMethod) == "undefined") {
      this._superMap["m:" + methodName] = superMethod = this._findSuperMethod(methodName, true);
    }
    
    return superMethod;
  };
  
  /**
   * @return {jsx3.Method}
   * @package
   */
  Class_prototype._getSuperMixinMethodFor = function(objMethod) {
    var methodName = objMethod.getName();
    var superMethod = this._superMixinMap["m:" + methodName];
    
    // will be null if already queried and not found, if undefined need to query still
    if (typeof(superMethod) == "undefined") {
      this._superMixinMap["m:" + methodName] = superMethod = this._findMixinMethod(methodName);
    }
    
    return superMethod;
  };
  
});

// define Object
jsx3.lang.Class.defineClass("jsx3.lang.Object", null, null, function(){});
// define Method 
jsx3.lang.Class.defineClass("jsx3.lang.Method", null, null, function(){});

// set up super class of Class
jsx3.lang.Class.jsxclass._super = jsx3.lang.Object.jsxclass;
