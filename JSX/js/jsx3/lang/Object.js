/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

if (window["jsx3"] == null) window["jsx3"] = {};
if (jsx3.lang == null) jsx3.lang = {};

jsx3.lang._NEW_FORCE = new window.Object();
jsx3.lang._NEW_NO_INIT = new window.Object();

jsx3.lang.newPrivateConstructor = function() {
  return function() {
    if (arguments[0] != jsx3.lang._NEW_FORCE) {
      var clazz = this.getClass ? this.getClass() : null;
      throw new jsx3.Exception(jsx3._msg("obj.no_inst", clazz || this));
    }
  };
};

jsx3.lang.newConstructor = function() {
  return function() {
    if (arguments[0] !== jsx3.lang._NEW_NO_INIT) {
      if (this.init) {
        this.init.apply(this, arguments);
      } else {
        var objConstr = jsx3.lang.getCaller(-1);
        throw new jsx3.Exception(jsx3._msg("obj.no_init", objConstr.jsxclass));
      }
    }
  };
};

/**
 * Base class for all classes defined with <code>jsx3.lang.Class</code>.
 *
 * <h4>Determining the Class of an Object</h4>
 * <p/>
 * The class of an object can be determined in one of several ways. 
 * <ol>
 * <li> <code>jsx3.lang.Object</code> defines the method 
 *   <code>getClass()</code>, which returns an instance of <code>jsx3.lang.Class</code>. This method is useful for 
 *   testing whether an object is an instance of exactly (not a superclass of) a class.</li>
 * <li>To test whether an object is an instance of a class or one of its superclasses, use the JavaScript operator
 *   <code>instanceof</code>: <code>obj instanceof jsx3.lang.Object</code>. <i>Note that the right hand argument of this
 *   expression must be the constructor function of a class and not of an interface defined with 
 *   <code>jsx3.Class.defineInterface()</code>)</i>.</li>
 * <li>To test whether an object implements an interface, use the method <code>instanceOf()</code> defined in 
 *   <code>jsx3.lang.Object</code>. This method will check against all classes and interfaces but is probably slower
 *   than the <code>instanceof</code> operator.</li>
 * </ol>
 * Examples:
 * <pre>
 * var doc = new jsx3.gui.Block();
 * doc.getClass().equals(jsx3.gui.Block.jsxclass);  // true
 * doc.getClass().equals(jsx3.app.Model.jsxclass);  // false, even though Block extends Model
 *
 * doc instanceof jsx3.gui.Block;  // true
 * doc instanceof jsx3.app.Model;  // true
 * doc instanceof jsx3.util.EventDispatcher;  // false, EventDispatcher is an interface
 * doc instanceof Object;          // true, works on non-jsx3.Class class constructors
 * 
 * doc.instanceOf(jsx3.gui.Block);            // true
 * doc.instanceOf(jsx3.app.Model.jsxclass);   // true, accepts arguments of type jsx3.Class
 * doc.instanceOf('jsx3.lang.Object');        // true, accepts arguments of type String
 * doc.instanceOf(jsx3.util.EventDispatcher); // true, works on interfaces
 * doc.instanceOf(Object);                    // true, works on non-jsx3.Class class constructors
 * </pre>
 *
 * @since 3.1
 *
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.lang.Object", null, null, function(){});
 */
jsx3.lang.Object = function() {
  this.init();
};

/* @jsxobf-clobber */
window._jsxtmp = function(Object, Object_prototype) {

  /**
   * Instance initializer.
   */
  Object_prototype.init = function() {
  };
  
  /**
   * Returns the class of this object.
   * @return {jsx3.lang.Class}
   */
  Object_prototype.getClass = function() {
    return this.__jsxclass__.jsxclass;
  };
  
  /**
   * Returns true if this object is equals to the <code>obj</code> parameter.
   * @param obj {Object} 
   * @return {boolean}
   */
  Object_prototype.equals = function(obj) {
    return this === obj;
  };
  
  /**
   * Returns a shallow copy of this object.
   * @return {jsx3.Object}
   */
  Object_prototype.clone = function() {
    return this.getClass().bless(this);
  };
  
  /**
   * Determines whether this object is an instance of <code>objClass</code>, that is, whether 
   *    <code>objClass</code> is equal to or a superclass or superinterface of this object's class.
   * @param objClass {Function|jsx3.lang.Class|String} the class to test, may be either the class constructor, and instance 
   *    of jsx3.lang.Class, or the fully-qualified class name
   * @return {boolean}
   * @throws {jsx3.IllegalArgumentException}  if <code>objClass</code> is a string that is not the name of a registered class
   */
  Object_prototype.instanceOf = function(objClass) {
    if (objClass instanceof jsx3.lang.Class) {
      return objClass.isInstance(this);
    } else if (typeof(objClass) == "function" && objClass.prototype != null) {
      return (this instanceof objClass) || (objClass.jsxclass != null && objClass.jsxclass.isInstance(this));
    } else if (typeof(objClass) == "string") {
      objClass = jsx3.lang.Class.forName(objClass);
      if (objClass != null)
        return objClass.isInstance(this);
    }  
    throw new jsx3.IllegalArgumentException("objClass", objClass);
  };
  
  /**
   * @return {String} a string representation of this object
   */
  Object_prototype.toString = function() {
    return "@" + this.getClass().getName();
  };
  
  /**
   * Calls the supermethod overridden by the method that calls jsxsuper(). The following example shows a chained instance
   * initializer method:
   * <pre>
   * Subclass.prototype.init = function(a, b, c) {
   *   this.jsxsuper(a, b);  // calls the init() method in the superclass of Subclass
   *   this.c = c;
   * };
   * </pre>
   * 
   * @param arg {Object...} the variable number of arguments passed to the supermethod
   * @return {Object|undefined} returns the result of the supermethod
   * @throws {jsx3.Exception} if called by a static method, if called by a method not defined in a call to 
   *    <code>jsx3.lang.Class.defineClass()</code>/<code>defineInterface()</code>, or if no suitable super method exists
   * @protected
   */
  Object_prototype.jsxsuper = function(arg) {
    var Exception = jsx3.Exception;
    var fctCaller = jsx3.lang.getCaller();
    var objMethod = fctCaller != null ? fctCaller.jsxmethod : null;
      
    if (objMethod == null || !(objMethod instanceof jsx3.lang.Method))
      throw new Exception(jsx3._msg("obj.super_funct", fctCaller));
    if (objMethod.isStatic())
      throw new Exception(jsx3._msg("obj.super_static", objMethod));
    
    var objClass = objMethod.getDeclaringClass();
    var objSuperMethod = objClass._getSuperMethodFor(objMethod);
    
    if (objSuperMethod == null)
      throw new Exception(jsx3._msg("obj.super_none", objMethod));
  
    var result = objSuperMethod.apply(this, arguments);
    if (typeof(result) != "undefined")
      return result;
  };
  
  /**
   * Like jsxsuper() but traverses up through all the interfaces implemented by this class and its super classes. This 
   * method facilitates modifying the functionality of a mixin interface for a particular class that implements the 
   * interface, as the following example shows:
   * <pre>
   * // imagine that the jsx3.Testable mixin interface defines a method test() that provides basic testing functionality
   * jsx3.Class.defineClass('eg.Test', null, [jsx3.Testable], function(Test){
   *
   *   Test.prototype.test = function() {
   *     this.setUpTest();      // do something before running the test
   *     this.jsxsupermix();    // calls test() in jsx3.Testable
   *     this.tearDownTest();   // do something after running the test
   *   };
   *
   * });
   * </pre>
   *
   * @param arg {Object...} the variable number of arguments passed to the supermethod
   * @return {Object/undefined} returns the result of the supermethod
   * @throws {jsx3.Exception} if called by a static method, if called by a method not defined in a call to 
   *    <code>jsx3.lang.Class.defineClass()</code>/<code>defineInterface()</code>, or if no suitable super method exists
   * @protected
   */
  Object_prototype.jsxsupermix = function(arg) {
    var Exception = jsx3.Exception;
    var fctCaller = jsx3.lang.getCaller();
    var objMethod = fctCaller != null ? fctCaller.jsxmethod : null;
      
    if (objMethod == null || !(objMethod instanceof jsx3.lang.Method))
      throw new Exception(jsx3._msg("obj.supmx_funct", fctCaller));
    if (objMethod.isStatic())
      throw new Exception(jsx3._msg("obj.supmx_static", objMethod));
    
    var objClass = objMethod.getDeclaringClass();
    var objSuperMethod = objClass._getSuperMixinMethodFor(objMethod);
    
    if (objSuperMethod == null)
      throw new Exception(jsx3._msg("obj.supmx_none", objMethod));
  
    var result = objSuperMethod.apply(this, arguments);
    if (typeof(result) != "undefined")
      return result;
  };

/* @JSC :: begin DEP */ 

  /**
   * No-op.
   *
   * @param arg {Object...} the variable number of arguments passed to the method mixins.
   * @since 3.5
   * @deprecated  No-op, replaced with <code>jsx3.lang.AOP</code>.
   * @see jsx3.lang.AOP
   */
  Object_prototype.jsxmix = function(arg) {
  };

/* @JSC :: end */

/* @JSC :: begin DEP */

  /* DEPRECATED: Remove in 4.0? */
    
  /**
   * returns whether or not this object is an instance of @strClassName
   * @param strClassName {String} named class
   * @param strPropName {String} default is INTERFACES; one of the strings: INTERFACES or SUPERS
   * @param-private bIsRecurse {boolean} BRIDGE CODE; remove when old names fully deprecated/unsupported (release 4.0)
   * @return {boolean}
   * @deprecated  use <code>instanceof</code> or Object.instanceOf()
   */
  Object_prototype.isInstanceOf = function(strClassName,strPropName,bIsRecurse) {
    if (this.getClass() && 
        (typeof(strClassName) != "string" || jsx3.lang.Class.forName(strClassName) != null)) 
      return this.instanceOf(strClassName);
    
    //returns true if the instance is an instance of strClassName
    var f = jsx3.getClass(this.getInstanceOf());
  
    //default so that it's not necessary to call setInstanceOf()
    if(f == null) f = this.constructor;
    
    if(typeof(f) == "function") {
      var o = f[(strPropName) ? strPropName : "INTERFACES"];
      var e = (o) ? o[strClassName] : null;
  
  //BRIDGE: Remove this in 4.0
  //start
      if(e == 1) {
        return true;
      } else if(bIsRecurse) {
        return false;
      } else {
        return this.isInstanceOf(strClassName.replace(/jsx3/g,"jsx3.gui"),strPropName,true);
      }
  //end
  
  //BRIDGE: Replace with this
  //      return (e == 1);
  
    }
    return false;
  };
  
  /**
   * Returns whether or not this object is an instance of a subclass of @strClassName
   * @param strClassName {String} named superclass
   * @return {boolean}
   * @deprecated  no direct replacement
   */
  Object_prototype.isSubclassOf = function(strClassName) {
    return this.isInstanceOf(strClassName,"SUPERS");
  };
  
  /** 
   * gets the class name for the object (the function that was instanced via 'new' to create the object).  For example, jsx3.gui.Block, jsx3.gui.Tree, etc.
   * @return {String} class name of object
   * @deprecated  use Object.getClass()
   */
  Object_prototype.getInstanceOf = function() {
    if (this.getClass()) return this.getClass().getName();
    
    return this._jsxinstanceof ? this._jsxinstanceof : this.constructor.className;
  };
  
  /** 
   * sets the JSX object type (only set during object initialization; although custom code can be written to 'cast' an object type to another object type)
   * @param strInstanceOf {String} type of JSX object, such as jsx3.gui.Tree, jsx3.gui.Button, etc.
   * @deprecated  no direct replacement
   */
  Object_prototype.setInstanceOf = function(strInstanceOf) {
    this._jsxinstanceof = strInstanceOf;
    return this;
  };
  
  /**
   * returns the name of the package that this class belongs to; returns empty string if no package found
   * @return {String}
   * @deprecated  use <code>Object.getClass().getPackageName()</code>
   */
  Object_prototype.getInstanceOfPackage = function() {
    if (this.getClass()) return this.getClass().getPackageName();
    
    var fullName = this.getInstanceOf();
    if (fullName == null) return "";
    var index = fullName.lastIndexOf('.');
    if (index >= 0)
      return fullName.substring(0, index);
    else
      return "";
  };
  
  /** 
   * gets the class name (less the package prefix) that this object is an instance of
   * @return {String}
   * @deprecated  use <code>Object.getClass().getName()</code> and parse out final token
   */
  Object_prototype.getInstanceOfClass = function() {
    if (this.getClass()) {
      var name = this.getClass().getName();
      return name.substring(name.lastIndexOf(".") + 1);
    }
    
    var fullName = this.getInstanceOf();
    if (fullName == null) return "";
    var index = fullName.lastIndexOf('.');
    if (index >= 0)
      return fullName.substring(index+1);
    else
      return fullName;
  };

/* @JSC :: end */ 

  /**
   * Evaluates a JavaScript expression in the context of this object with a controlled local variable context. 
   * Every name-value pair in <code>objContext</code> will be exposed as a local variable to the evaluated script. 
   * All names must be valid JavaScript names in order to be exposed as local variables. Any invalid names will be 
   * ignored.
   * 
   * @param strScript {String} the JavaScript to evaluate.
   * @param objContext {Object} a map containing the local variable context.
   * @return {Object} the results of evaluating <code>strScript</code>.
   * @see jsx3#eval()
   */
  Object_prototype.eval = function(strScript, objContext) {
    return jsx3.eval.call(this, strScript, objContext);
  };
  
};

window._jsxtmp(jsx3.lang.Object, jsx3.lang.Object.prototype);
window._jsxtmp = null;

/**
 * Throws an intelligible exception in Firefox when a call is made to a non-existent method.
 * @private
 */
jsx3.lang.Object.prototype.__noSuchMethod__ = function(strMethod, args) {
  throw new jsx3.Exception(jsx3._msg("class.nsm", this.getClass().getName() + "#" + strMethod + "()"));
};

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.lang.Object
 * @see jsx3.lang.Object
 * @jsxdoc-definition  jsx3.Class.defineClass("inheritance", -, null, function(){});
 */
window.inheritance = jsx3.lang.Object;

/* @JSC :: end */
