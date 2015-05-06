/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber  _before _after _around _name _cond _methodkeys _pc _method

/**
 * Simple aspect oriented programming for General Interface.
 * <p/>
 * Advice can be added before, after, and around any call to an instance method of a GI class. 
 * <p/>
 * <b>Note that only the exact class and subclasses loaded after a pointcut is defined are affected.</b> 
 * <p/>
 * <b>Note that only instance methods and not static methods can define pointcuts.</b>
 * <p/>
 * The second argument to the before, after, and around methods is the advice function, examples of which are 
 * provided here:
 * <pre>
 * jsx3.AOP.pc("myPointcut", {classes:"jsx3.xml.Document", methods:"load"});
 *
 * jsx3.AOP.before("myPointcut", function(strURL, intTimeout) {
 *   jsx3.log("load() called on " + this + " with URL " + strURL + ".");
 * });
 *
 * jsx3.AOP.after("myPointcut", function(rv, strURL, intTimeout) {
 *   jsx3.log("load() called on " + this + " with URL " + strURL + " returned " + rv + ".");
 * });
 *
 * jsx3.AOP.around("myPointcut", function(aop, strURL, intTimeout) {
 *   var t1 = new Date().getTime();
 *   var rv = aop.proceed(strURL, intTimeout);
 *   var tTotal = new Date().getTime() - t1;
 *   jsx3.log("load() called on " + this + " with URL " + strURL + " took " + tTotal + " ms and returned " + rv + ".");
 *   return rv;
 * });
 * </pre>
 * Note that after advice receives the method return value as the first method parameter. Note also that around
 * advice must manage the AOP chain by calling <code>proceed()</code> on the first method parameter and by returning
 * the return value of this call. 
 *
 * @since 3.6
 */
jsx3.Class.defineClass("jsx3.lang.AOP", null, null, function(AOP, AOP_prototype) {

  var IllegalArgumentException = jsx3.IllegalArgumentException;
  
  /** 
   * {Object<String,Object>} 
   * @private @jsxobf-clobber 
   */
  AOP._nameToPC = {};
  
  /** 
   * {Object<String,Object>} 
   * @private @jsxobf-clobber 
   */
  AOP._methodToPC = {};
  
  /**
   * Creates a new pointcut. The supported conditions are as follows:
   * <ul>
   *   <li>classes {String|Function|jsx3.Class|Array&lt;String|Function|jsx3.Class&gt;}: 
   *         the classes for which to look for methods.</li>
   *   <li>methods {String|Array&lt;String&gt;}: the names of the methods for which to add pointcuts. Any name can be a 
   *         regular expression with "*" expanded to <code>\w+</code>.</li>
   *   <li>type: {String|Function|jsx3.Class}: the pointcut will only affect objects that are 
   *         <code>instanceOf(type)</code>.</li>
   * </ul>
   * @param strName {String} the name of the pointcut to create.
   * @param objConditions {Object} the pointcut conditions. 
   */
  AOP.pc = function(strName, objConditions) {
    if (AOP._nameToPC[strName]) 
      throw new IllegalArgumentException();
    
    var pointcut = AOP._nameToPC[strName] = 
        {_name:strName, _before:[], _after:[], _around:[], _cond:objConditions, _methodkeys:[]};

    var methods = AOP._getMethods(objConditions);
    for (var i = 0; i < methods.length; i++) {
      var method = methods[i];
      var key = AOP._initMethod(method);
      AOP._methodToPC[key]._pc.push(pointcut);
      pointcut._methodkeys.push(key);
    }
    
    return AOP;
  };
  
  /**
   * Removes a pointcut.
   * @param strName {String} the name of the pointcut to remove.
   */
  AOP.pcrem = function(strName) {
    var pointcut = AOP._nameToPC[strName];
    if (pointcut) {
      var methodKeys = pointcut._methodkeys;
      for (var i = 0; i < methodKeys.length; i++) {
        var mObj = AOP._methodToPC[methodKeys[i]];
        mObj._pc.splice(jsx3.util.arrIndexOf(mObj._pc, pointcut), 1);
        if (mObj._pc.length == 0)
          AOP._restoreMethod(methodKeys[i]);
      }
      delete AOP._nameToPC[strName];
    }
  };
    
  /** @private @jsxobf-clobber */
  AOP._initMethod = function(objArr) {
    var c = objArr[0], mName = objArr[1];
    var key = c.getName() + "$" + mName;
      
    if (!AOP._methodToPC[key]) {
      var proto = c.getConstructor().prototype;

      // make sure not to add a pointcut around another pointcut
      if (!proto[mName]._aoppc) {
        AOP._methodToPC[key] = {_method:proto[mName], _pc:[]};

        var oldMethod = proto[mName].jsxmethod;

        proto[mName] = AOP._newCutPoint(key);

        // So that prototype[methodName].jsxmethod is still defined...
        proto[mName].jsxmethod = oldMethod;
      } else {
        AOP._methodToPC[key] = {_method:AOP._methodToPC[proto[mName]._aopkey]._method, _pc:[]};
      }
    }

    return key;
  };
   
  /** @private @jsxobf-clobber */
  AOP._restoreMethod = function(strKey) {
    var mObj = AOP._methodToPC[strKey];
    var fctMethod = mObj._method;
    var objMethod = fctMethod.jsxmethod;
    objMethod.getDeclaringClass().getConstructor().prototype[objMethod.getName()] = fctMethod;
    delete AOP._methodToPC[strKey];
  };
   
  /**
   * @param strPName {String} the pointcut name.
   * @param fctAdvice {Function} the advice function.
   * @param bRemove {boolean} if <code>true</code>, remove this advice.
   */
  AOP.before = function(strPName, fctAdvice, bRemove) {
    AOP[bRemove ? "_remove" : "_add"](strPName, fctAdvice, "_before");
  };
  
  /**
   * @param strPName {String} the pointcut name.
   * @param fctAdvice {Function} the advice function.
   * @param bRemove {boolean} if <code>true</code>, remove this advice.
   */
  AOP.after = function(strPName, fctAdvice, bRemove) {
    AOP[bRemove ? "_remove" : "_add"](strPName, fctAdvice, "_after");
  };
  
  /**
   * @param strPName {String} the pointcut name.
   * @param fctAdvice {Function} the advice function.
   * @param bRemove {boolean} if <code>true</code>, remove this advice.
   */
  AOP.around = function(strPName, fctAdvice, bRemove) {
    AOP[bRemove ? "_remove" : "_add"](strPName, fctAdvice, "_around");
  };
  
  /** @private @jsxobf-clobber */
  AOP._add = function(strPName, fctAdvice, strType) {
    AOP._nameToPC[strPName][strType].push(fctAdvice);
  };
  
  /** @private @jsxobf-clobber */
  AOP._remove = function(strPName, fctAdvice, strType) {
    var list = AOP._nameToPC[strPName][strType];
    for (var i = list.length - 1; i >= 0; i--)
      if (list[j] === fctAdvice)
        list.splice(i, 1);
  };
  
  /** @private @jsxobf-clobber */
  AOP._newCutPoint = function(strKey) {
    var f = function() {
      return AOP._cutPoint(strKey, this, arguments);
    };
    f._aoppc = 1;
    f._aopkey = strKey;
    return f;
  };
  
  /** @private @jsxobf-clobber */
  AOP._cutPoint = function(strKey, objThis, arrArgs) {
    var cp = AOP._filterCP(objThis, AOP._methodToPC[strKey]._pc);
    var around = AOP._getAllOf(cp, "_around");
    
    if (around.length > 0) {
      return (new AOP._AroundStack(strKey, around, objThis, arrArgs))._start();
    } else {
      return AOP._cutPointNoAround(strKey, objThis, arrArgs, cp);
    }
  };
  
  /** @private @jsxobf-clobber */
  AOP._cutPointNoAround = function(strKey, objThis, arrArgs, arrPC) {
    if (!arrPC)
      arrPC = AOP._filterCP(objThis, AOP._methodToPC[strKey]._pc);
    
    var before = AOP._getAllOf(arrPC, "_before");
    for (var i = 0; i < before.length; i++)
      before[i].apply(objThis, arrArgs);
    
    var returnVal = AOP._methodToPC[strKey]._method.apply(objThis, arrArgs);
    
    var after = AOP._getAllOf(arrPC, "_after");
    if (after.length > 0) {
      var args = jsx3.Method.argsAsArray(arrArgs);
      args.unshift(returnVal);
      for (var i = 0; i < after.length; i++)
        after[i].apply(objThis, args);
    }
    
    return returnVal;
  };
  
  /** @private @jsxobf-clobber */
  AOP._filterCP = function(objThis, arrPC) {
    var pc = [];
    for (var i = 0; i < arrPC.length; i++) {
      var obj = arrPC[i];
      var conditions = obj._cond;
      if (!conditions || !conditions.type || objThis.instanceOf(conditions.type))
        pc.push(obj);
    }
    return pc;
  };
  
  /** @private @jsxobf-clobber */
  AOP._getAllOf = function(a, f) {
    var rv = [];
    for (var i = 0; i < a.length; i++)
      rv.push.apply(rv, a[i][f]);
    return rv;
  };
  
  /** @private @jsxobf-clobber */
  AOP._getMethods = function(objConditions) {
    var m = [];
    var classes = AOP._getClasses(objConditions.classes);
    for (var i = 0; i < classes.length; i++)
      m.push.apply(m, AOP._getMethodsForClass(classes[i], objConditions.methods));
    return m;
  };
  
  /** @private @jsxobf-clobber */
  AOP._getClasses = function(strClasses) {
    if (!jsx3.$A.is(strClasses))
      strClasses = [strClasses];
    
    var a = [];
    for (var i = 0; i < strClasses.length; i++)
      a[i] = AOP._getClass(strClasses[i]);
    return a;
  };
  
  /** @private @jsxobf-clobber */
  AOP._getMethodsForClass = function(objClass, strMethods) {
    var m = [];
    var proto = objClass.getConstructor().prototype;
    
    if (!jsx3.$A.is(strMethods))
      strMethods = [strMethods];
    
    for (var i = 0; i < strMethods.length; i++) {
      var name = strMethods[i];
      if (name.match(/^\w+$/)) {
        var aFunct = proto[name];
        if (aFunct)
          m.push([objClass, name]);
      } else {
        var re = new RegExp("^" + name.replace("*", "\\w*") + "$");
        for (var f in proto)
          if (f.match(re))
            m.push([objClass, f]);
      }
    }
    
    return m;
  };
  
  /** @private @jsxobf-clobber */
  AOP._getClass = function(strClass) {
    if (typeof(strClass) == "string")
      return jsx3.Class.forName(strClass);
    else if (typeof(strClass) == "function")
      return strClass.jsxclass;
    else if (strClass instanceof jsx3.Class)
      return strClass;
    else
      throw new IllegalArgumentException("strClass", strClass);
  };
  
  /** @private @jsxobf-clobber */
  AOP._AroundStack = function(strKey, arrArounds, objThis, arrArgs) {
    /* @jsxobf-clobber */
    this._key = strKey;
    /* @jsxobf-clobber */
    this._arounds = arrArounds;
    /* @jsxobf-clobber */
    this._this = objThis;
    /* @jsxobf-clobber */
    this._args = arrArgs;
  };
  
  /** @private @jsxobf-clobber */
  AOP._AroundStack.prototype._start = function() {
    return this.proceed.apply(this, this._args);
  };
  
  AOP._AroundStack.prototype.proceed = function() {
    var around = this._arounds.shift();
    if (around) {
      var args = jsx3.Method.argsAsArray(arguments);
      args.unshift(this);
      return around.apply(this._this, args);
    } else {
      return AOP._cutPointNoAround(this._key, this._this, arguments);
    }
  };
  
});
