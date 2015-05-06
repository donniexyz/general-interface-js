/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

(function(jsx3) {

  var extend = function(target, source) {
    for (var f in source)
      target[f] = source[f];
    return target;
  };

  var json = function(o, recurse) {
    if (typeof(recurse) == "undefined") recurse = true;
    var j;

    if (o == null)
      j = "null";
    else if (jsx3.$A.is(o)) {
      var s = [];
      for (var i = 0; i < o.length; i++)
        s.push(recurse ? json(o[i]) : o[i]);
      j = "[" + s.join(",") + "]";
    } else if (typeof(o) == "object") {
      var s = [];
      for (var f in o)
        if (!o.hasOwnProperty || o.hasOwnProperty(f))
          s.push(f + ":" + (recurse ? json(o[f]) : o[f]));
      j = "{" + s.join(",") + "}";
    } else if (typeof(o) == "string") {
      j = jsx3.util.strEscapeJSON(o);
    } else {
      j = o.toString();
    }
    
    return j;
  };

  /**
   * Useful extensions to the JavaScript <code>Object</code> class.
   * @since 3.7
   * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.$Object", Object, null, function() {});
   */
  jsx3.$Object = {

    /**
     * Copies all properties of <code>o</code> into this object.
     * @param o {Object}
     */
    extend: function(o) {
      return extend(this, o);
    },

    /**
     * Creates a new objects with all the same properties as this object.
     * @return {jsx3.$Object}
     */
    clone: function() {
      var c = jsx3.$O();
      c.extend(this);
      return c;
    }
  };

  /** @jsxdoc-category  jsx3 */

  /**
   * Injects class <code>jsx3.$Object</code> into object instance <code>o</code>.
   * @param o {Object}
   * @since 3.7
   */
  jsx3.$O = function(o) {
    return extend(o || {}, jsx3.$Object);
  };

  jsx3.$O.json = json;

  /**
   * Useful extensions to the JavaScript <code>Array</code> class.
   * @since 3.7
   * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.$Array", Array, null, function() {});
   */
  jsx3.$Array = {

    /**
     * Calls <code>fct</code> for each element in this array. <code>fct</code> is passed each element as the
     * sole parameter.
     * @param fct {Function}
     */
    each: function(fct) {
      for (var i = 0; i < this.length; i++)
        fct(this[i]);
    },

    /**
     * Creates a new array using the mapped values of each element in this array. <code>fct</code> is called for
     * each element in this array and the element is passed as the sole argument. The new array is constructed with
     * the return values of each call to <code>fct</code>.
     * sole parameter.
     * @param fct {Function}
     * @return {jsx3.$Array}
     */
    map: function(fct) {
      var a = jsx3.$A();
      for (var i = 0; i < this.length; i++)
        a[i] = fct(this[i]);
      return a;
    },

    /**
     * Creates a new array with the filtered contents of this array. <code>fct</code> is called for
     * each element in this array and the element is passed as the sole argument. The new array is constructed with
     * only the elements of this array for which <code>fct</code> returns <code>true</code>.
     * @param fct {Function}
     * @return {jsx3.$Array}
     */
    filter: function(fct) {
      var a = jsx3.$A();
      for (var i = 0; i < this.length; i++)
        if (fct(this[i]))
          a.push(this[i]);
      return a;
    },

    /**
     * Returns the first index of <code>o</code> in this array. This method uses strict equality for comparing objects
     * (<code>===</code>).
     * @param o {Object}
     * @return {int}
     */
    indexOf: function(o) {
      for (var i = 0; i < this.length; i++)
        if (this[i] === o)
          return i;
      return -1;
    },

    /**
     * Returns true if <code>o</code> is in this array. This method uses strict equality for comparing objects
     * (<code>===</code>).
     * @param o {Object}
     * @return {boolean}
     */
    contains: function(o) {
      return this.indexOf(o) >= 0;
    },

    /**
     * Removes the first occurrence of <code>o</code> in this array. This method uses strict equality for comparing objects
     * (<code>===</code>).
     * @param o {Object}
     * @return {Object} the removed object or <code>undefined</code> if <code>o</code> is not in this array.
     */
    remove: function(o) {
      var index = this.indexOf(o);
      if (index >= 0)
        return this.splice(index, 1)[0];
    },

    /**
     * Returns the first element in this array for which <code>fct</code> returns true when passed the element as
     * the sole parameter.
     * @param fct {Function}
     * @return {Object}
     */
    find: function(fct) {
      for (var i = 0; i < this.length; i++)
        if (fct(this[i]))
          return this[i];
    },

    /**
     * Returns a list containing only the unique elements in this list.
     * @return {jsx3.$Array}
     */
    unique: function() {
      var a = this.concat();
      for (var i = a.length - 1; i >= 1; i--) {
        for (var j = i - 1; j >= 0; j--) {
          if (a[i] === a[j]) {
            a.splice(i, 1);
            break;
          }
        }
      }
      return jsx3.$A(a);
    },

    /**
     * Appends the contents of <code>a</code> to this array.
     * @param a {Array}
     */
    addAll: function(a) {
      this.push.apply(this, a);
    },

    /**
     * Returns true if the contents of this array equal the contents of <code>a</code>.
     * @param a {Array}
     * @return {boolean}
     * @since 3.9
     */
    eq: function(a) {
      if (this.length != a.length) return false;
      for (var i = 0; i < this.length; i++)
        if (this[i] !== a[i]) return false;
      return true;
    },

    clone: function() {
      return jsx3.$A(this.concat());
    }
  };

  /**
   * Useful extensions to the JavaScript <code>Object</code> class for emulating a hashtable.
   * @since 3.7
   * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.$Hash", jsx3.$Object, null, function() {});
   */
  jsx3.$Hash = jsx3.$Object.clone().extend({

    /**
     * Iterates over all the key-value pairs of this hashtable. <code>fct</code> is called for each pair; the pair key
     * is the first parameter and the pair value is the second parameter.
     * @param fct {Function} <code>function(key : String, value: Object} : void</code>
     */
    each: function(fct) {
      for (var f in this) {
        if (this[f] != this.constructor.prototype[f] && this[f] != jsx3.$Hash[f])
          fct(f, this[f]);
      }
    },

    /**
     * Returns the list of keys of this hashtable.
     * @return {jsx3.$Array}
     */
    keys: function() {
      var a = [];
      for (var f in this) {
        if (this[f] != this.constructor.prototype[f] && this[f] != jsx3.$Hash[f])
          a.push(f);
      }
      return jsx3.$A(a);
    },

    /**
     * Returns the list of values of this hashtable.
     * @return {jsx3.$Array}
     */
    values: function() {
      var a = [];
      for (var f in this) {
        if (this[f] != this.constructor.prototype[f] && this[f] != jsx3.$Hash[f])
          a.push(this[f]);
      }
      return jsx3.$A(a);
    }
  });

  /**
   * Useful extensions to the JavaScript <code>Function</code> class.
   * @since 3.7
   * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.$Function", Object, null, function() {});
   */
  jsx3.$Function = {

    /**
     * Returns a method that is this function applied to <code>thisObj</code> with arguments <code>argsArr</code>.
     * @param thisObj {Object}
     * @param argsArr {Array}
     * @return {jsx3.$Function}
     */
    bind: function(thisObj, argsArr) {
      var fct = this;

      if (argsArr == null || argsArr.length == 0) {
        return jsx3.$F(function() {
          return fct.apply(thisObj, arguments);
        });
      } else {
        return function() {
          var myArgs;

          if (arguments.length > 0) {
            myArgs = [];
            for (var i = 0; i < argsArr.length; i++)
              myArgs.push(argsArr[i]);
            for (var i = 0; i < arguments.length; i++)
              myArgs.push(arguments[i]);
          } else {
            myArgs = argsArr;
          }

          return fct.apply(thisObj, myArgs);
        };
      }
    },

    /**
     * @return {jsx3.$Function}
     * @package
     */
    throttled: function() {
      var fct = this;
      return jsx3.$F(function() {
        if (fct._thlto)
          window.clearTimeout(fct._thlto);
        fct._thlto = window.setTimeout(jsx3.$F(fct).bind(this, arguments));
      });
    },

    /**
     * @return {jsx3.$Function}
     * @package
     */
    slept: function() {
      var fct = this;
      return jsx3.$F(function() {
        window.setTimeout(fct.bind(this, arguments));
      });
    }
  };

  /**
   * Useful extensions to the JavaScript <code>String</code> class.
   * @since 3.7
   * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.$String", jsx3.$Object, null, function() {});
   */
  jsx3.$String = jsx3.$Object.clone().extend({

    /**
     * Returns true if this string ends with string <code>s</code>.
     * @param s {String}
     * @return {boolean}
     */
    endsWith: function(s) {
      return this.lastIndexOf(s) == this.length - s.length;
    },

    /**
     * Returns this string with all leading and trailing space removed.
     * @return {jsx3.$String}
     */
    trim: function() {
      return jsx3.$S(this.replace(/(^\s*)|(\s*$)/g, ""));
    }
  });

  /** @jsxdoc-category  jsx3 */
  
  /**
   * Injects class <code>jsx3.$Function</code> into function instance <code>f</code>.
   * @param f {Function}
   * @since 3.7
   */
  jsx3.$F = function(f) {
    return extend(f, jsx3.$Function);
  };

  var fixAsyncArg = jsx3.$F(function(args, n, arg) { args[n] = arg.rv(); });
  var handleAsyncArgs = function(args) {
    var c = null;

    for (var i = 0; i < args.length; i++) {
      var a = args[i];
      if (a instanceof AsyncRV) {
        if (a._done) {
          args[i] = a.rv();
        } else {
          a.when(fixAsyncArg.bind(null, [args, i, a]));
          c = c ? c.and(a) : a;
        }
      }
    }

    return c;
  };

  /**
   * The callback object passed as the single argument to an asynchronous method.
   *
   * @see jsx3#$Y()
   * @since 3.7
   *
   * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.$AsyncCB", Object, null, function() {});
   */
  jsx3.$AsyncCB = function(objThis, arrArgs) {
    /* @jsxobf-clobber */
    this._this = objThis;
    /* @jsxobf-clobber */
    this._args = arrArgs;
    /* @jsxobf-clobber */
    this._condition = handleAsyncArgs(arrArgs);
  };
  extend(jsx3.$AsyncCB.prototype, {

    /** @private @jsxobf-clobber */
    _whenArg: jsx3.$F(function(n, arg) { this._args[n] = arg.rv(); }),
    
    /**
     * Signals the callback object that the asynchronous method is done and passes the asynchronous return value.
     * @param rv {Object} the return value.
     */
    done: function(rv) {
      this._done = true;
      this._rv = rv;
      if (this._ondone)
        this._ondone(rv);
    },

    /**
     * Returns the arguments that were passed to the asynchronous method wrapper.
     * @return {Array<Object>}
     */
    args: function() {
      return this._args;
    }

  });

  /**
   * The return value from an asynchronous method.
   *
   * @see jsx3#$Y()
   * @since 3.7
   *
   * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.$AsyncRV", Object, null, function() {});
   */
  var AsyncRV = jsx3.$AsyncRV = function() {
  };
  extend(AsyncRV.prototype, {
    /* @jsxobf-clobber */
    _trigger: function(rv) {
      /* @jsxobf-clobber */
      this._done = true;
      /* @jsxobf-clobber */
      this._rv = rv;
      if (this._sub) {
        this._sub.each(function(e) { e(rv); });
        delete this._sub;
      }
    },

    /**
     * Returns the return value from the asynchronous method.
     * @return {Object}
     * @throws {Error} if called before <code>done()</code> is called on corresponding callback object.
     */
    rv: function() {
      if (!this._done)
        throw new Error("May not call $AsyncRV.rv() before the return value is set.");
      return this._rv;
    },

    /**
     * Registers code to be called when the asynchronous method completes.
     * <p/>
     * If argument <code>cb</code> is a function, then that function will be called when the asynchronous method
     * completes. This function will be called synchronously is the function has already completed. The
     * asynchronous method return value will be passed as the only argument to the function.
     * <p/>
     * If argument <code>cb</code> is an instance of <code>jsx3.$AsyncCB</code>, then its <code>done()</code> method
     * will be called when the asynchronous method completes. The done method will be passed the <code>rv</code>
     * argument it is is provided. Otherwise, it will be passed the return value of <code>cb</code>.
     *
     * @param cb {Function | jsx3.$AsyncCB} 
     * @param rv {Object}
     */
    when: function(cb, rv) {
      var fct = null;

      if (typeof(cb) == "function")
        fct = cb;
      else if (cb instanceof jsx3.$AsyncCB) {
        if (arguments.length > 1)
          fct = function() {cb.done(rv);};
        else
          fct = function(chainedRV) {cb.done(chainedRV);};
      } else
        throw new Error();

      if (this._done) {
        fct(this._rv);
      } else {
        if (!this._sub)
          /* @jsxobf-clobber */
          this._sub = jsx3.$A();
        this._sub.push(fct);
      }
    },

    /**
     * Creates and returns an asynchronous return value that completes when this and <code>rv</code> have completed.
     * @param rv {jsx3.$AsyncRV...}
     * @return {jsx3.$AsyncRV}
     */
    and: function(rv) {
      var a = [this];
      for (var i = 0; i < arguments.length; i++)
        a.push(arguments[i]);
      return new AndRV(a);
    },

    /**
     * Creates and returns an asynchronous return value that completes when this or <code>rv</code> have completed.
     * @param rv {jsx3.$AsyncRV...}
     * @return {jsx3.$AsyncRV}
     */
    or: function(rv) {
      var a = [this];
      for (var i = 0; i < arguments.length; i++)
        a.push(arguments[i]);
      return new OrRV(a);
    }
  });

  var MethodRV = function(cb) {
    /* @jsxobf-clobber */
    this._cb = cb;
    /* @jsxobf-clobber */
    cb._ondone = this._cbdone.bind(this);
  };
  MethodRV.prototype = new AsyncRV();
  extend(MethodRV.prototype, {
    /* @jsxobf-clobber */
    _cbdone: jsx3.$F(function(rv) {
      delete this._cb._ondone;
      this._trigger(rv);
    })
  });

  var AndRV = function(rvs) {
    /* @jsxobf-clobber */
    this._ct = rvs.length;
    /* @jsxobf-clobber */
    this._donect = 0;
    jsx3.$A(rvs).each(jsx3.$F(function(e) {
      if (e._done)
        this._donect++;
      else
        e.when(this._inc.bind(this));
    }).bind(this));

    if (this._ct == this._donect)
      this._trigger();
  };
  AndRV.prototype = new AsyncRV();
  extend(AndRV.prototype, {
    /* @jsxobf-clobber */
    _inc: jsx3.$F(function() {
      this._donect++;
      if (this._donect == this._ct)
        this._trigger();
    })
  });

  var OrRV = function(rvs) {
    jsx3.$A(rvs).each(jsx3.$F(function(e) {
      if (e._done)
        this._inc();
      else
        e.when(this._inc.bind(this));
    }).bind(this));
  };
  OrRV.prototype = new AsyncRV();
  extend(OrRV.prototype, {
    /* @jsxobf-clobber */
    _inc: jsx3.$F(function() {
      if (!this._done)
        this._trigger();
    })
  });

  /** @jsxdoc-category  jsx3 */

  /**
   * Injects class <code>jsx3.$Array</code> into array instance <code>a</code>.
   * @param a {Array | Object}
   * @since 3.7
   */
  jsx3.$A = function(a) {
    if (a == null) {
      a = [];
    } else if (a instanceof Array) {

    } else if (jsx3.$A.is(a)) {
      // works on arguments array
      var t = [];
      for (var i = 0; i < a.length; i++)
        t[i] = a[i];
      a = t;
    } else {
      a = [a];
    }

    return extend(a, jsx3.$Array);
  };

  jsx3.$A.is = function(a) {
    return a && typeof(a) == "object" && (a instanceof Array || typeof(a.length) == "number");
  };

  /**
   * Injects class <code>jsx3.$Hash</code> into object instance <code>o</code>. If <code>o</code> is an array, it
   * is first converted into an object by setting a property equal to <code>1</code> for each item in the array.
   *
   * @param o {Object | Array}
   * @since 3.7
   */
  jsx3.$H = function(o) {
    if (jsx3.$A.is(o)) {
      var h = {};
      for (var i = 0; i < o.length; i++)
        h[o[i]] = 1;
      return extend(h, jsx3.$Hash)
    } else {
      return extend(o || {}, jsx3.$Hash);
    }
  };

  /**
   * Injects class <code>jsx3.$String</code> into string instance <code>s</code>.
   * @param s {String}
   * @since 3.7
   */
  jsx3.$S = function(s) {
    if (s == null) return s;
    return extend(new String(s), jsx3.$String);
  };

  /**
   * Wraps an asynchronous method. An asynchronous method follows a very strict contract. It can be called
   * with any number of parameters but the wrapped method sees only a single parameter, an instance of
   * <code>jsx3.$AsyncCB</code>. The wrapped method must call <code>done()</code> on this
   * method parameter, either synchronously or asynchronously. The <code>done()</code> method takes a single
   * parameter, which is the return value of the method.
   * <p/>
   * The wrapped method should not itself return anything. The only exception to this is that the method may return
   * and instance of <code>jsx3.$AsyncRV</code>. In this case, the method will return when and with the same return
   * value as the returned instance of <code>jsx3.$AsyncRV</code>. 
   * <p/>
   * Client code that calls the asynchronous method will see a synchronous return value of type
   * <code>jsx3.$AsyncRV</code>. Client code should use the <code>when()</code> method of this return value to
   * continue execution when the asynchronous method has completed. Or this return value may be used in conjuction
   * with other asynchronous methods (such as by passing is as a parameter to an asynchronous method).
   * <p/>
   * Another feature of asynchronous methods is that you can pass instances of <code>jsx3.$AsyncRV</code> as
   * parameters to the method and the method is only invoked once all of those parameters have returned. The parameters
   * that the wrapped method sees are automatically converted into the return values of the <code>jsx3.$AsyncRV</code>
   * instances.
   *
   * @see jsx3.$AsyncCB
   * @see jsx3.$AsyncCB#done()
   * @see jsx3.$AsyncRV
   * @see jsx3.$AsyncRV#when()
   * @since 3.7
   *
   * @param f {Function} the function to wrap.
   * @return {Function} the wrapped function.
   */
  jsx3.$Y = function(f) {
    return function() {
      var cb = new jsx3.$AsyncCB(this, arguments);
      var rv = new MethodRV(cb);

//      var stack = (jsx3.lang && jsx3.lang.getStack) ? jsx3.lang.getStack() : [];
//      window.setTimeout(jsx3.$F(function() {
//        if (!cb._done) {
//          jsx3.log("Never finished: " + this + " " + f + "\nargs:" + jsx3.Method.argsAsArray(cb.args()) + "\n" +
//                   jsx3.Exception.formatStack(stack));
//        }
//      }).bind(this), 10000);

      if (cb._condition) {
        var objThis = this;
        cb._condition.when(function() {
          var r = f.apply(objThis, [cb]);
          if (r instanceof AsyncRV)
            r.when(cb);
        });
      } else {
        var r = f.apply(this, [cb]);
        if (r instanceof AsyncRV)
          r.when(cb);
      }

      return rv;
    };
  };

  /**
   * Returns an asynchronous wrapper of a synchronous method. The returned method is method <code>strMethod</code>
   * bound to object <code>objThis</code>. <code>objThis</code> is optional and may be an object or an instance of
   * <code>jsx3.$AsyncRV</code>. If the latter, then the wrapped method is only called on the return value of
   * <code>objThis</code> after <code>objThis</code> returns.
   * <p/>
   * The wrapper takes the same parameters as the wrapped method. However, instead of returning the return value of the
   * wrapped method, it returns an instance of <code>jsx3.$AsyncRV</code>.
   * <p/>
   * The returned method may be passed parameters that are actually instances of <code>jsx3.$AsyncRV</code>. In this
   * case, the wrapped method is only actually called when all the parameters have returned.
   *
   * @param strMethod {String | Function} the function to wrap or the name of a method of <code>objThis</code> to wrap.
   * @param objThis {Object | jsx3.$AsyncRV} optionally, the object to which to bind the wrapper.
   * @return {Function} the wrapper function.
   * @since 3.7
   */
  jsx3.$Z = function(strMethod, objThis) {
    if (objThis instanceof AsyncRV)
      objThis.when(function(rv) { objThis = rv; });

    return function() {
      var rv = new AsyncRV();
      var a = jsx3.Method.argsAsArray(arguments);

      if (objThis instanceof AsyncRV) {
        objThis.when(function() {
          onceDone(objThis, strMethod, a, rv);
        });
      } else {
        onceDone(objThis || this, strMethod, a, rv);
      }

      return rv;
    }
  };

  var onceDone = function(objThis, strMethod, args, rv) {
    var fct = typeof(strMethod) == "function" ? strMethod : objThis[strMethod];
    var c = handleAsyncArgs(args);
    if (c) {
      c.when(function() {
        rv._trigger(fct.apply(objThis, args))
      });
    } else {
      rv._trigger(fct.apply(objThis, args));
    }
  };

})(jsx3);
