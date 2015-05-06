/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Top-Level properties and functions. Members in this package are accessed either without a namespace prefix or with
 * the <code>window.</code> prefix.
 *
 * @native
 * @jsxdoc-definition  jsx3.Package.definePackage("window", null, function(){});
 */

/**
 * @native
 * @jsxdoc-definition  window.eval = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  window.isNaN = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  window.isFinite = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  window.escape = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  window.unescape = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  window.parseFloat = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  window.parseInt = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  window.NaN = null;
 */

/**
 * @native
 * @jsxdoc-definition  window.Infinity = null;
 */

/**
 * @native
 * @jsxdoc-definition  window.undefined = null;
 */

/**
 * Transfers prototype methods from one class to another; establishes @superClass as the super for @subClass.
 *
 * @param subClass {String} named subclass to transfer prototypes to
 * @param superClass {String} named superclass to transfer prototypes from
 * @param bImplement {boolean} if true, @superClass is an interface
 * @return  the eval value of the script
 * @deprecated  Create classes using <code>jsx3.Class</code>.
 * @see jsx3.lang.Class
 *
 * @jsxdoc-definition  window.doInherit = function(subClass, superClass, bImplement){};
 */

/**
 * Transfers prototype methods from one class to another.
 * @param subClass {String} named subclass to transfer prototypes to
 * @param superClass {String} named superclass to transfer prototypes from
 * @return  the eval value of the script
 * @deprecated  Create classes using <code>jsx3.Class</code>.
 * @see jsx3.lang.Class
 *
 * @jsxdoc-definition  window.doImplement = function(subClass, superClass){};
 */

/**
 * Transfers the methods of a class to a object instance.
 * @param objInstance {object} any JavaScript object
 * @param strClassName {String} the name of a class
 * @deprecated  Use <code>jsx3.Class.mixin()</code>.
 * @see jsx3.lang.Class#mixin()
 *
 * @jsxdoc-definition  window.doMixin = function(objInstance, strClassName){};
 */

/**
 * Registers all prototype functions and properties, contained by the inner function @anonymousFunction; used by jsx3.Object
 * @param strClassName {String} named class containing the anonymous function to call
 * @param anonymousFunction {String} inner function containing named prototypes to bind
 * @deprecated  Create classes using <code>jsx3.Class</code>.
 * @see jsx3.lang.Class
 *
 * @jsxdoc-definition  window.doDefine = function(strClassName, anonymousFunction){};
 */




/**
 * Native JavaScript class Object.
 *
 * @native
 * @jsxdoc-definition  jsx3.Class.defineClass("Object", null, null, function(){});
 */

/**
 * @native
 * @jsxdoc-definition  Object.prototype.Object = function(){};
 */

/* turn this off for now
 * {Function} 
 *
 * @native
 * @jsxdoc-definition  Object.prototype.constructor = null;
 */

/**
 * @return {String}
 *
 * @native
 * @jsxdoc-definition  Object.prototype.toString = function(){};
 */




/**
 * Native JavaScript class Function.
 *
 * @native
 * @jsxdoc-definition  jsx3.Class.defineClass("Function", Object, null, function(){});
 */

/**
 * @native
 * @jsxdoc-definition  Function.prototype.Function = function(){};
 */

/**
 * @param thisArg {Object}
 * @param args {Object...}
 * @return {Object}
 *
 * @native
 * @jsxdoc-definition  Function.prototype.apply = function(thisArg, args){};
 */

/**
 * @param args {Object...}
 * @return {Object}
 *
 * @native
 * @jsxdoc-definition  Function.prototype.call = function(args){};
 */




/**
 * Native JavaScript class Array. Includes GI extensions.
 *
 * @native
 * @jsxdoc-definition  jsx3.Class.defineClass("Array", Object, null, function(){});
 */

/**
 * @native
 * @jsxdoc-definition  Array.prototype.Array = function(){};
 */

/**
 * Joins two or more arrays and returns a new array.
 * @param array {Array...}
 * @return {Array}
 *
 * @native
 * @jsxdoc-definition  Array.prototype.concat = function(array){};
 */

/**
 * Joins all elements of an array into a string.
 * @param separator {String}
 * @return {String}
 *
 * @native
 * @jsxdoc-definition  Array.prototype.join = function(separator){};
 */

/**
 * {int} An unsigned, 32-bit integer that specifies the number of elements in an array.
 *
 * @native
 * @jsxdoc-definition  Array.prototype.length = null;
 */

/**
 * Removes the last element from an array and returns that element. This method  changes the length of the array.
 * @return {Object}
 *
 * @native
 * @jsxdoc-definition  Array.prototype.pop = function(){};
 */

/**
 * Adds one or more elements to the end of an array and returns the new length of the array. This method changes 
 * the length of the array.
 * @param element {Object...}
 * @return {int} the new length of the array
 *
 * @native
 * @jsxdoc-definition  Array.prototype.push = function(element){};
 */

/**
 * Transposes the elements of an array: the first array element becomes the last and the last becomes the first.
 *
 * @native
 * @jsxdoc-definition  Array.prototype.reverse = function(){};
 */

/**
 * Removes the first element from an array and returns that element. This method changes the length of the array.
 * @return {Object}
 *
 * @native
 * @jsxdoc-definition  Array.prototype.shift = function(){};
 */

/**
 * Extracts a section of an array and returns a new array.
 * <ul>
 * <li> slice extracts up to but not including end. slice(1,4) extracts the second element through the fourth element (elements indexed 1, 2, and 3)</li>
 * <li> As a negative index, end indicates an offset from the end of the sequence. slice(2,-1) extracts the third element through the second to last element in the sequence.</li>
 * <li> If end is omitted, slice extracts to the end of the sequence.</li>
 * </ul>
 *
 * @param begin {int} Zero-based index at which to begin extraction.
 * @param end {int} Zero-based index at which to end extraction.
 * @return {Array}
 *
 * @native
 * @jsxdoc-definition  Array.prototype.slice = function(begin, end){};
 */

/**
 * Sorts the elements of an array.
 * <p/>
 * If compareFunction is supplied, the array elements are sorted according to the return value of the compare 
 * function. If a and b are two elements being compared, then:
 * <ul>
 * <li>If compareFunction(a, b) is less than 0, sort b to a lower index than a.</li>
 * <li>If compareFunction(a, b) returns 0, leave a and b unchanged with respect to each other, but sorted with respect to all different elements.</li>
 * <li>If compareFunction(a, b) is greater than 0, sort b to a higher index than a.</li>
 * </ul>
 *
 * @param compareFunction {Function} Specifies a function that defines the sort order. If omitted, the array
 *    is sorted lexicographically (in dictionary order) according to the string conversion of each element.
 *
 * @native
 * @jsxdoc-definition  Array.prototype.sort = function(compareFunction){};
 */

/**
 * Changes the content of an array, adding new elements while removing old elements.
 * @param index {int} Index at which to start changing the array.
 * @param howMany {int} An integer indicating the number of old array elements to remove. If howMany is 0, no
 *    elements are removed. In this case, you should specify at least one new element.
 * @param element {Object...} The elements to add to the array. If you don't specify any elements, splice simply
 *    removes elements from the array.
 * @return {Array} an array containing the removed elements
 *
 * @native
 * @jsxdoc-definition  Array.prototype.splice = function(index, howMany, element){};
 */

/**
 * Returns a string representing the specified array and its elements.
 * @return {String}
 *
 * @native
 * @jsxdoc-definition  Array.prototype.toString = function(){};
 */

/**
 * Adds one or more elements to the beginning of an array and returns the new length of the array.
 * @param element {Object...}
 * @return {int} the new length of the array
 *
 * @native
 * @jsxdoc-definition  Array.prototype.unshift = function(element){};
 */

/* @JSC :: begin DEP */

/**
 * Returns the index of the first occurrence of <code>objElement</code> in this array.
 * @param objElement {Object} the item to find
 * @param intStartAt {int}
 * @return {int} the index of the found object or -1 if not found
 * @deprecated Use the <code>jsx3.util.List</code> class.
 */
Array.prototype.indexOf = function(objElement, intStartAt) {
  if (intStartAt == null) intStartAt = 0;
  for (var i = intStartAt; i < this.length; i++) {
    if (this[i] == objElement)
      return i;
  }
  return -1;
};

/**
 * Returns the index of the last occurrence of <code>objElement</code> in this array.
 * @param objElement {Object} the item to find
 * @param intStartAt {int}
 * @return {int} the index of the found object or -1 if not found
 * @deprecated Use the <code>jsx3.util.List</code> class.
 */
Array.prototype.lastIndexOf = function(objElement, intStartAt) {
  if (intStartAt == null) intStartAt = this.length - 1;
  for (var i = intStartAt; i >= 0; i--) {
    if (this[i] == objElement)
      return i;
  }
  return -1;
};

/**
 * @deprecated Use the <code>jsx3.util.List</code> class.
 */
Array.prototype.contains = function(objElement) {
  return this.indexOf(objElement) >= 0;
};

/**
 * removes the first occurrence of <code>objElement</code> in this array
 * @param objElement  the object to remove
 * @return  the removed object or null if no object was removed
 * @deprecated Use the <code>jsx3.util.List</code> class.
 */
Array.prototype.remove = function(objElement) {
  var index = this.indexOf(objElement);
  if (index >= 0)
    return this.splice(index, 1)[0];
  return null;
};

/**
 * creates a copy of this array
 * @return {Array}
 * @deprecated Use the <code>jsx3.util.List</code> class.
 */
Array.prototype.clone = function() {
  return this.concat();
};

/**
 * pushes the contents of an Array onto this Array.
 * @param a {Array}
 * @deprecated Use the <code>jsx3.util.List</code> class.
 */
Array.prototype.pushAll = function(a) {
  this.push.apply(this, a);
};

/**
 * Returns true if this array and <code>a</code> have the same length and this[n] = a[n] for all n.
 * @param a {Array}
 * @return {boolean}
 * @deprecated Use the <code>jsx3.util.List</code> class.
 */
Array.prototype.contentsEqual = function(a) {
  if (a == null) return false;
  if (this.length != a.length) return false;
  for (var i = 0; i < a.length; i++) {
    if (this[i] != a[i]) return false;
  }
  return true;
};

/**
 * Creates a new array with the filtered contents of this array. The <code>fctFilter</code> parameter defines
 * the filtering function.
 * @param fctFilter {Function} a function that is called once for each item in this array and returns true if the item
 *    should be included in the filtered list. The signature of this function is
 *    <code>function(item : Object) : boolean</code>.
 * @return {Array}
 * @since 3.1
 * @deprecated Use the <code>jsx3.util.List</code> class.
 */
Array.prototype.filter = function(fctFilter) {
  var filtered = [];
  for (var i = 0; i < this.length; i++) {
    if (fctFilter(this[i]))
      filtered.push(this[i]);
  }
  return filtered;
};

/**
 * Creates a new array with the mapped contents of this array. The <code>fctMapper</code> parameter defines
 * the mapping function.
 * <p/>
 * This method has four modes corresponding to the four possible values for <code>{bExpand, bObject}</code>:
 * <ul>
 * <li><code>{false, false}</code> (default) &#8211; the filtering function takes an item in this list and returns
 *    a single object value which will take the place of the item in the mapped result.</li>
 * <li><code>{true, false}</code> &#8211; the filtering function takes an item in this list and returns
 *    a single object value or an array of values, all of which will be inserted into the mapped result at the index
 *    of the item.</li>
 * <li><code>{false, true}</code> &#8211; the filtering function takes an item in this list and returns an array with
 *    exactly two values, which become a name/value pair in the mapped result.</li>
 * <li><code>{true, true}</code> &#8211; the filtering function takes an item in this list and returns an array with
 *    zero or an even number of items, which become name/value pairs in the mapped result.</li>
 * </ul>
 *
 * @param fctMapper {Function} a function that is called once for each item in this array and returns the mapped
 *    value. The signature of this function depends on the values for the <code>bExpand</code> and
 *    <code>bObject</code> parameters.
 * @param bExpand {boolean} if <code>true</code>, the resulting mapped array or object may any number of values
 *    corresponding to each item in this list. Otherwise, it will have exactly one value for each item in this list.
 * @param bObject {boolean} if <code>true</code>, this array is mapped to an object with property name/value pairs.
 *    Otherwise this array is mapped to another array.
 * @return {Array|Object} an <code>Array</code> if the <code>bObject</code> parameter is <code>null</code> or
 *    <code>false</code>, otherwise an <code>Object</code>.
 * @since 3.1
 * @deprecated Use the <code>jsx3.util.List</code> class.
 */
Array.prototype.map = function(fctMapper, bExpand, bObject) {
  var mapped = null;
  if (bExpand) {
    if (bObject) {
      mapped = {};
      for (var i = 0; i < this.length; i++) {
        var pairs = fctMapper(this[i]);
        for (var j = 0; j < pairs.length; j+=2)
          mapped[pairs[i]] = pairs[i+1];
      }
    } else {
      mapped = [];
      for (var i = 0; i < this.length; i++) {
        var val = fctMapper(this[i]);
        if (val instanceof Array)
          mapped.pushAll(val);
        else
          mapped.push(val);
      }
    }
  } else {
    if (bObject) {
      mapped = {};
      for (var i = 0; i < this.length; i++) {
        var pair = fctMapper(this[i]);
        mapped[pair[0]] = pair[1];
      }
    } else {
      mapped = new Array(this.length);
      for (var i = 0; i < this.length; i++)
        mapped[i] = fctMapper(this[i]);
    }
  }
  return mapped;
};

/* @JSC :: end */



/**
 * Native JavaScript class Math. Includes GI extensions.
 *
 * @native
 * @jsxdoc-definition  jsx3.Class.defineClass("Math", Object, null, function(){});
 */

/**
 * @native
 * @jsxdoc-definition  Math.abs = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.acos = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.asin = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.atan = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.atan2 = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.ceil = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.cos = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.exp = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.floor = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.log = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.max = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.min = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.pow = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.random = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.round = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.sin = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.sqrt = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Math.tan = function(){};
 */

/**
 * {Number}
 *
 * @native
 * @jsxdoc-definition  Math.E = null;
 */

/**
 * {Number}
 *
 * @native
 * @jsxdoc-definition  Math.LN10 = null;
 */

/**
 * {Number}
 *
 * @native
 * @jsxdoc-definition  Math.LN2 = null;
 */

/**
 * {Number}
 *
 * @native
 * @jsxdoc-definition  Math.LOG10E = null;
 */

/**
 * {Number}
 *
 * @native
 * @jsxdoc-definition  Math.LOG2E = null;
 */

/**
 * {Number}
 *
 * @native
 * @jsxdoc-definition  Math.PI = null;
 */

/**
 * {Number}
 *
 * @native
 * @jsxdoc-definition  Math.SQRT1_2 = null;
 */

/**
 * {Number}
 *
 * @native
 * @jsxdoc-definition  Math.SQRT2 = null;
 */

/* @JSC :: begin DEP */

/**
 * calculates a mod b, but the result is not allowed to be negative
 * @param v {Number} a
 * @param mod {Number} b
 * @return {Number} a mod b if a >= 0, b + a mod b, if a < 0
 * @deprecated Use <code>jsx3.util.numMod()</code> instead.
 */
Math.modpos = function(v, mod) {
  return jsx3.util.numMod(v, mod);
};

/**
 * value == null || isNaN(value)
 * @param value {Object} any value
 * @return {boolean}
 * @deprecated Use <code>jsx3.util.numIsNaN()</code> instead.
 */
Math.isNaN = function(value) {
  return jsx3.util.numIsNaN(value);
};

/* @JSC :: end */



/**
 * Native JavaScript class Boolean.
 *
 * @native
 * @jsxdoc-definition  jsx3.Class.defineClass("Boolean", Object, null, function(){});
 */




/**
 * Native JavaScript class Number. Includes GI extensions.
 *
 * @native
 * @jsxdoc-definition  jsx3.Class.defineClass("Number", Object, null, function(){});
 */

/**
 * @native
 * @jsxdoc-definition  Number.prototype.Number = function(){};
 */

/**
 * {Number}
 *
 * @native
 * @jsxdoc-definition  Number.MAX_VALUE = null;
 */

/**
 * {Number}
 *
 * @native
 * @jsxdoc-definition  Number.MIN_VALUE = null;
 */

/**
 * {Number}
 *
 * @native
 * @jsxdoc-definition  Number.NaN = null;
 */

/**
 * {Number}
 *
 * @native
 * @jsxdoc-definition  Number.NEGATIVE_INFINITY = null;
 */

/**
 * {Number}
 *
 * @native
 * @jsxdoc-definition  Number.POSITIVE_INFINITY = null;
 */

/**
 * @native
 * @jsxdoc-definition  Number.prototype.toFixed = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Number.prototype.toPrecision = function(){};
 */

/* @JSC :: begin DEP */

/**
 * Rounds the number (this) to the nearest value that can be divided by @intUnit.
 * @param intUnit {int} unit to use
 * @return {Number}
 * @deprecated Use <code>jsx3.util.numRound()</code> instead.
 */
Number.prototype.roundTo = function(intUnit) {
  return jsx3.util.numRound(this, intUnit);
};

/**
 * Left pads this number with zeros to return a string of length <code>intDigits</code>.
 * @param intDigits {int} the length of the string to return
 * @return {String}
 * @deprecated Use the <code>jsx3.util.NumberFormat</code> class.
 */
Number.prototype.zeroPad = function(intDigits) {
  var s = "" + this;
  while (s.length < intDigits)
    s = "0" + s;
  return s;
};

/* @JSC :: end */



/**
 * Native JavaScript class Date. Includes GI extensions.
 *
 * @native
 * @jsxdoc-definition  jsx3.Class.defineClass("Date", Object, null, function(){});
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.Date = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getDate = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getDay = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getFullYear = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getHours = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getMilliseconds = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getMinutes = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getMonth = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getSeconds = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getTime = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getTimezoneOffset = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getUTCDate = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getUTCDay = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getUTCFullYear = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getUTCHours = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getUTCMilliseconds = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getUTCMinutes = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getUTCMonth = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getUTCSeconds = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.getYear = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.parse = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.setDate = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.setFullYear = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.setHours = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.setMilliseconds = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.setMinutes = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.setMonth = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.setSeconds = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.setTime = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.setUTCDate = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.setUTCFullYear = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.setUTCHours = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.setUTCMilliseconds = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.setUTCMinutes = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.setUTCMonth = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.setUTCSeconds = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.toGMTString = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.toLocaleString = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  Date.prototype.toUTCString = function(){};
 */

/* @JSC :: begin DEP */

/**
 * Returns the date of the last day of the month of this Date object, ie will return 31 for any Date with a January month value (any year and any date)
 * @return {int}
 * @deprecated
 */
Date.prototype.getLastDateOfMonth = function() {
  var month = this.getMonth();

  return Date._LAST_DATE_ARRAY[month] ||
      ((new Date(this.getYear(), month, 29)).getMonth() == month ? 29 : 28);
};

/**
 * whether two Date objects represent the same date
 * @param o {Date} the date to compare this date against
 * @deprecated
 */
Date.prototype.equals = function(o) {
  return o != null && o instanceof Date && o.valueOf() == this.valueOf();
};

/**
 * compare this date instance to argument <code>d</code>
 * @param d {Date} the date to compare this date against
 * @return {int} 1 if this date is later than d, 0 if equal, and -1 otherwise
 * @deprecated
 */
Date.prototype.compareTo = function(d) {
  var a = this.valueOf();
  var b = d.valueOf();
  return a == b ? 0 : a > b ? 1 : -1;
};

/** @private @jsxobf-clobber */
Date._LAST_DATE_ARRAY = [31,null,31,30,31,30,31,31,30,31,30,31];

/* @JSC :: end */




/**
 * Native JavaScript class String. Includes GI extensions.
 *
 * @native
 * @jsxdoc-definition  jsx3.Class.defineClass("String", Object, null, function(){});
 */

/**
 * @native
 * @jsxdoc-definition  String.prototype.String = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  String.prototype.charAt = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  String.prototype.charCodeAt = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  String.prototype.concat = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  String.fromCharCode = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  String.prototype.indexOf = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  String.prototype.length = null;
 */

/**
 * @native
 * @jsxdoc-definition  String.prototype.match = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  String.prototype.replace = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  String.prototype.search = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  String.prototype.slice = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  String.prototype.split = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  String.prototype.substring = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  String.prototype.toLowerCase = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  String.prototype.toUpperCase = function(){};
 */

/* @JSC :: begin DEP */

/**
 * trims trailing and leading spaces (anything matching  the regexp, \s) from a string
 * @return {String}
 * @deprecated Use <code>jsx3.util.strTrim()</code> instead.
 */
String.prototype.trim = function() {
  return jsx3.util.strTrim(this);
};

/**
 * performs a global, case-sensitive replace of all instances of @strReplace with @strReplaceWith
 * @param strReplace {String} string to replace
 * @param strReplaceWith {String} string to replace with
 * @return {String}
 * @deprecated  Use <code>String.replace()</code> with regular expression syntax.
 */
String.prototype.doReplace = function(strReplace,strReplaceWith) {
  var re = new RegExp(strReplace,["g"]);
  return this.replace(re, strReplaceWith);
};

/**
 * replaces the following four characters with their escaped equivalent: &amp; &lt; &gt; "
 * @return {String}
 * @deprecated Use <code>jsx3.util.strEscapeHTML()</code> instead.
 */
String.prototype.escapeHTML = function() {
  return jsx3.util.strEscapeHTML(this);
};

/**
 * truncates a string to @intLength and appends "..." to the end if the string is is actually truncated
 * @param intLength {int} length of the string (including the trailing ..., if necessary)
 * @return {String}
 * @deprecated Use <code>jsx3.util.strTruncate()</code> instead.
 */
String.prototype.doTruncate = function(intLength) {
  return jsx3.util.strTruncate(this, intLength, "...", 1);
};

/**
 * takes any string (assumed to be a valid URL) and prepends that string with the appropriate path information. This function
 *          is used by the JSX framework to resolve file locations at runtime, and is always used by system methods that need to resolve
 *          the location of a resource.  For example, if the application is located at "/system/JSXAPPS/app1/" and a resource is requested
 *          at "JSXAPPS/app1/components/appCanval.xml", this method would return "/system/JSXAPPS/app1/components/appCanval.xml"
 * @return {String} URL
 * @deprecated  Use <code>jsx3.resolveURI()</code>.
 * @see jsx3#resolveURI()
 */
String.prototype.toAbsolute = function() {
  var s;
  //given portal implementations, any string instance that represents a URI can call this method to add a prepend of the absolute path
  if (this.substring(0,1) == "/" || this.substring(0,7).toUpperCase() == "HTTP://" || this.substring(0,8).toUpperCase() == "HTTPS://") {
    s = this.toString();
  } else if (this.substring(0,4) == "JSX/") {
    s = jsx3.getEnv("jsxabspath") + this;
  } else {
    s = jsx3.getEnv("jsxhomepath") + this;
  }
  return s;
};

/**
 * Returns a url, strRelative, relative to the URL represented by this string. For example, if 'this' String is equal to "/perforce/DEV/gi/gi-dev/index.html" and @strRelative is equal to "JSXAPPS/app1/config.xml", then the result of this function would be: "/perforce/DEV/gi/gi-dev/JSXAPPS/app1/config.xml"
 * @param strRelative {String} URL to base relativity from
 * @return {String}
 * @deprecated  Create instances of <code>jsx3.net.URI</code> and use <code>URI.resolve()</code>.
 * @see jsx3.net.URI
 */
String.prototype.urlTo = function(strRelative) {
  var concat = null;

  var index = this.lastIndexOf('/');
  if (index == this.length - 1)
    concat = this + strRelative;
  else if (index < 0)
    concat = strRelative;
  else
    concat = this.substring(0, index+1) + strRelative;

  concat = concat.replace(/\\/g,"/");
  var tokens = concat.split("/");

  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    if (token == ".") {
      tokens.splice(i--, 1);
    } else if (token == "..") {
      if (i > 0 && tokens[i-1] != "..") {
        tokens.splice(i--, 1);
        tokens.splice(i--, 1);
      }
    }
  }

  return tokens.join("/");
};

/**
 * Returns whether or not the string ends with @token
 * @param token {String} item to match on the String instance
 * @return {boolean}
 * @deprecated Use <code>jsx3.util.strEndsWith()</code> instead.
 */
String.prototype.endsWith = function(token) {
  return jsx3.util.strEndsWith(this, token);
};

/**
 * trim a string down to a maximum length, put an ellipsis in the middle of the string if the string is too long, showing the beginning and ending of the string.
 * @return {String}
 * @deprecated Use <code>jsx3.util.strTruncate()</code> instead.
 */
String.prototype.constrainLength = function(intMax, ellipsis) {
  return jsx3.util.strTruncate(this, intMax, ellipsis, 2/3);
};

/**
 * Encodes this string to its base64 equivalent.
 * @return {String}
 * @deprecated Use <code>jsx3.util.strEncodeBase64()</code> instead.
 */
String.prototype.toBase64 = function() {
  return jsx3.util.strEncodeBase64(this);
};

/**
 * Decodes this string from its base64 equivalent.
 * @return {String}
 * @deprecated Use <code>jsx3.util.strDecodeBase64()</code> instead.
 */
String.prototype.fromBase64 = function() {
  return jsx3.util.strDecodeBase64(this);
};

/* @JSC :: end */




/**
 * Native JavaScript class RegExp.
 *
 * @native
 * @jsxdoc-definition  jsx3.Class.defineClass("RegExp", Object, null, function(){});
 */

/**
 * @native
 * @jsxdoc-definition  RegExp.prototype.RegExp = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  RegExp.prototype.compile = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  RegExp.prototype.exec = function(){};
 */

/**
 * @native
 * @jsxdoc-definition  RegExp.prototype.test = function(){};
 */

/**
 * {boolean}
 *
 * @native
 * @jsxdoc-definition  RegExp.prototype.global = null;
 */

/**
 * {boolean}
 *
 * @native
 * @jsxdoc-definition  RegExp.prototype.ignoreCase = null;
 */

/**
 * {int}
 *
 * @native
 * @jsxdoc-definition  RegExp.prototype.lastIndex = null;
 */

/**
 * {String}
 *
 * @native
 * @jsxdoc-definition  RegExp.prototype.source = null;
 */

/**
 * {String}
 *
 * @native
 * @jsxdoc-definition  RegExp.input = null;
 */

/**
 * {String}
 *
 * @native
 * @jsxdoc-definition  RegExp.lastMatch = null;
 */

/**
 * {String}
 *
 * @native
 * @jsxdoc-definition  RegExp.lastParen = null;
 */

/**
 * {String}
 *
 * @native
 * @jsxdoc-definition  RegExp.leftContext = null;
 */

/**
 * {boolean}
 *
 * @native
 * @jsxdoc-definition  RegExp.multiline = null;
 */

/**
 * {String}
 *
 * @native
 * @jsxdoc-definition  RegExp.rightContext = null;
 */

/**
 * {String}
 *
 * @native
 * @jsxdoc-definition  RegExp.$1 = null;
 */




/**
 * Native browser DOM class <code>HTMLElement</code>. Mozilla browsers call this <code>HTMLElement</code>, while
 * Microsoft Internet Explorer usually reports it as a plain <code>Object</code>.
 *
 * @native
 * @jsxdoc-definition  jsx3.Class.defineClass("HTMLElement", Object, null, function(){});
 */

/**
 * {String}
 *
 * @native
 * @jsxdoc-definition  HTMLElement.prototype.innerHTML = null;
 */

/**
 * {Object}
 *
 * @native
 * @jsxdoc-definition  HTMLElement.prototype.style = null;
 */

/**
 * {Array<HTMLElement>}
 *
 * @native
 * @jsxdoc-definition  HTMLElement.prototype.childNodes = null;
 */

/**
 * {HTMLElement}
 *
 * @native
 * @jsxdoc-definition  HTMLElement.prototype.parentNode = null;
 */

/**
 * {String}
 *
 * @native
 * @jsxdoc-definition  HTMLElement.prototype.id = null;
 */

/**
 * {HTMLDocument}
 *
 * @native
 * @jsxdoc-definition  HTMLElement.prototype.ownerDocument = null;
 */

/**
 * {String}
 *
 * @native
 * @jsxdoc-definition  HTMLElement.prototype.tagName = null;
 */

/**
 * {String}
 *
 * @native
 * @jsxdoc-definition  HTMLElement.prototype.className = null;
 */

/**
 * @param strName {String}
 * @return {String}
 *
 * @native
 * @jsxdoc-definition  HTMLElement.prototype.getAttribute = function(strName) {};
 */

/**
 * @param strName {String}
 *
 * @native
 * @jsxdoc-definition  HTMLElement.prototype.removeAttribute = function(strName) {};
 */

/**
 * @param strName {String}
 * @param strValue {String}
 *
 * @native
 * @jsxdoc-definition  HTMLElement.prototype.setAttribute = function(strName, strValue) {};
 */

/**
 * {HTMLElement}
 *
 * @native
 * @jsxdoc-definition  HTMLElement.prototype.previousSibling = null;
 */

/**
 * {HTMLElement}
 *
 * @native
 * @jsxdoc-definition  HTMLElement.prototype.nextSibling = null;
 */

/**
 * {HTMLElement}
 *
 * @native
 * @jsxdoc-definition  HTMLElement.prototype.firstChild = null;
 */

/**
 * {HTMLElement}
 *
 * @native
 * @jsxdoc-definition  HTMLElement.prototype.lastChild = null;
 */



/**
 * Native browser DOM class <code>HTMLDocument</code>. Mozilla browsers call this <code>HTMLDocument</code>, while
 * Microsoft Internet Explorer usually reports it as a plain <code>Object</code>.
 *
 * @native
 * @jsxdoc-definition  jsx3.Class.defineClass("HTMLDocument", HTMLElement, null, function(){});
 */

/**
 * @param strId {String}
 * @return {HTMLElement}
 *
 * @native
 * @jsxdoc-definition  HTMLDocument.prototype.getElementById = function(strId) {};
 */
