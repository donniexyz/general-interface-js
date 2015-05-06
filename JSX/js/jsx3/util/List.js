/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * An object-oriented version of the built-in JavaScript <code>Array</code> class.
 * <p/>
 * Note that methods such as <code>indexOf</code> and <code>remove</code> compare objects
 * with the strict equality operators (<code>===</code> and <code>!==</code>). Therefore, for the purposes of this
 * class <code>1</code> and <code>"1"</code> are not equal.
 *
 * @since 3.2
 */
jsx3.Class.defineClass('jsx3.util.List', null, null, function(List, List_prototype) {

  /**
   * If <code>a</code> is already an instance of this class, this method returns <code>a</code>.
   * If <code>a</code> is an array, this method returns a new List instance backed by <code>a</code>.
   * @param a {Array|jsx3.util.List}
   * @return {jsx3.util.List}
   * @throws {jsx3.IllegalArgumentException} if <code>a</code> is not a list or array.
   */
  List.wrap = function(a) {
    if (a instanceof List) {
      return a;
    } else if (a instanceof Array) {
      return new List(a, true);
    } else {
      throw new jsx3.IllegalArgumentException("a", a);
    }
  };

  /**
   * The instance initializer. Creates a new list. If <code>a</code> is a number, the list is initialized with
   * that size. If <code>a</code> is an array or list, the contents of <code>a</code> are copied into the new list.
   * @param a {int|Array|jsx3.util.List}
   * @param-private bLive {boolean}
   */
  List_prototype.init = function(a, bLive) {
    if (typeof(a) == "number") {
      this._src = new Array(a);
    } else if (a instanceof List) {
      this._src = a._src.concat();
    } else {
      a = List._convertArrayLikeToArray(a);
      if (a instanceof Array) {
        this._src = bLive ? a : a.concat();
      } else {
        /* @jsxobf-clobber-shared */
        this._src = [];
      }
    }

/* @JSC :: begin DEP */
    /* @jsxobf-clobber */
    this._iterator = -1;
/* @JSC :: end */
  };

  /**
   * @return {int}
   */
  List_prototype.size = function() {
    return this._src.length;
  };

  /**
   * @param intIndex {int}
   * @return {Object}
   */
  List_prototype.get = function(intIndex) {
    return this._src[intIndex];
  };

  /**
   * @param intIndex {int}
   * @param objElm {Object}
   */
  List_prototype.set = function(intIndex, objElm) {
    this._src[intIndex] = objElm;
  };

  /**
   * @return {jsx3.util.Iterator}
   */
  List_prototype.iterator = function() {
    return new List.Iterator(this);
  };

  /**
   * Removes all elements from this list.
   */
  List_prototype.clear = function() {
    this._src.splice(0, this._src.length);
  };

  /**
   * Returns the index of the first occurrence of <code>objElm</code> in this list. Comparisons are performed with
   * strict equals (===).
   * @param objElm {Object} the item to find
   * @param intStartAt {int}
   * @return {int} the index of the found object or <code>-1</code> if not found.
   */
  List_prototype.indexOf = function(objElm, intStartAt) {
    if (intStartAt == null) intStartAt = 0;
    var size = this.size();
    for (var i = intStartAt; i < size; i++) {
      if (this.get(i) === objElm)
        return i;
    }
    return -1;
  };

  /**
   * Returns the index of the last occurrence of <code>objElm</code> in this list. Comparisons are performed with
   * strict equals (===).
   * @param objElm {Object} the item to find
   * @param intStartAt {int}
   * @return {int} the index of the found object or -1 if not found
   */
  List_prototype.lastIndexOf = function(objElm, intStartAt) {
    if (intStartAt == null) intStartAt = this.size() - 1;
    for (var i = intStartAt; i >= 0; i--) {
      if (this.get(i) === objElm)
        return i;
    }
    return -1;
  };

  /**
   * @param objElm {Object} the item to find
   * @return {boolean}
   */
  List_prototype.contains = function(objElm) {
    return this.indexOf(objElm) >= 0;
  };

  /**
   * Removes the first occurrence of <code>objElm</code> in this list.
   * @param objElm {Object} the object to remove
   * @return  the removed object or null if no object was removed
   */
  List_prototype.remove = function(objElm) {
    var index = this.indexOf(objElm);
    if (index >= 0)
      return this._src.splice(index, 1)[0];
    return null;
  };

  /**
   * Removes a single or a range of elements from this list.
   * @param intStart {int}
   * @param intEnd {int}
   * @return {Object|jsx3.util.List<Object>} the removed object or null if no object was removed
   */
  List_prototype.removeAt = function(intStart, intEnd) {
    if (arguments.length == 2) {
      return List.wrap(this._src.splice(intStart, (intEnd - intStart)));
    } else {
      return this._src.splice(intStart, 1)[0];
    }
  };

  /**
   * Returns a copy of this list.
   * @return {jsx3.util.List}
   */
  List_prototype.clone = function() {
    return new List(this);
  };

  /**
   * @param objElm {Object}
   * @param intAt {int}
   */
  List_prototype.add = function(objElm, intAt) {
    var src = this._src;
    if (intAt == null)
      src[src.length] = objElm;
    else
      src.splice(intAt, 0, objElm);
  };

  /**
   * @param a {Array|jsx3.util.List}
   * @param intAt {int}
   * @throws {jsx3.IllegalArgumentException} if <code>a</code> is not a list or array.
   */
  List_prototype.addAll = function(a, intAt) {
    if (a instanceof List)
      a = a.toArray(true);
    else
      a = List._convertArrayLikeToArray(a);

    if (jsx3.$A.is(a)) {
      if (intAt == null)
        this._src.push.apply(this._src, a);
      else
        this._src = this._src.slice(0, intAt).concat(a, this._src.slice(intAt));
    } else {
      throw new jsx3.IllegalArgumentException("a", a);
    }
  };

  /** @private @jsxobf-clobber */
  List._convertArrayLikeToArray = function(a) {
    if (a == null || a instanceof Array) {
      return a;
    } else if (typeof(a.length) == "number") {
      var c = new Array(a.length);
      for (var i = 0; i < a.length; i++)
        c[i] = a[i];
      return c;
    } else {
      return a;
    }
  };

  /**
   * Returns a section of this list as another list. The returned section is a copy of this list and is not affected
   * by subsequent changes to this list.
   * @param intStart {int}
   * @param intEnd {int}
   * @return {List}
   */
  List_prototype.slice = function(intStart, intEnd) {
    // NOTE: Fx and IE behave differently even if null is sent as the second parameter
    return List.wrap(arguments.length > 1 ? this._src.slice(intStart, intEnd) : this._src.slice(intStart));
  };

  /**
   * Sorts this list.
   * @param fctComparator {Function}
   */
  List_prototype.sort = function(fctComparator) {
    // NOTE: Fx and IE behave differently even if null is sent as the first parameter
    if (fctComparator) this._src.sort(fctComparator);
    else this._src.sort();
  };

  /**
   * Returns a copy of this list as an array.
   * @param bLive {boolean} if true, then the returned array is the actual backing array of this list.
   * @return {Array}
   */
  List_prototype.toArray = function(bLive) {
    return bLive ? this._src : this._src.concat();
  };

  /**
   * Returns true if this list and <code>l</code> have the same length and <code>this.get(n) = l.get(n)</code>
   * for all n.
   * @param l {Object}
   * @return {boolean}
   */
  List_prototype.equals = function(l) {
    if (this === l) return true;
    if (!(l instanceof List)) return false;
    var size = this.size();
    if (size != l.size()) return false;
    for (var i = 0; i < size; i++) {
      if (this.get(i) !== l.get(i)) return false;
    }
    return true;
  };

  /**
   * Creates a new list with the filtered contents of this list. The <code>fctFilter</code> parameter defines
   * the filtering function.
   * @param fctFilter {Function} a function that is called once for each item in this array and returns true if the item
   *    should be included in the filtered list. The signature of this function is
   *    <code>function(item : Object) : boolean</code>.
   * @return {jsx3.util.List}
   */
  List_prototype.filter = function(fctFilter) {
    var filtered = [];
    var size = this.size();
    for (var i = 0; i < size; i++) {
      var item = this.get(i);
      if (fctFilter(item))
        filtered[filtered.length] = item;
    }
    return List.wrap(filtered);
  };

  /**
   * Creates a new list with the mapped contents of this array. The <code>fctMapper</code> parameter defines
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
   * @return {jsx3.util.List|Object} a list if the <code>bObject</code> parameter is <code>null</code> or
   *    <code>false</code>, otherwise an <code>Object</code>.
   */
  List_prototype.map = function(fctMapper, bExpand, bObject) {
    var size = this.size();
    if (bExpand) {
      if (bObject) {
        var mapped = {};
        for (var i = 0; i < size; i++) {
          var pairs = fctMapper(this.get(i));
          for (var j = 0; j < pairs.length; j+=2)
            mapped[pairs[j]] = pairs[j+1];
        }
        return mapped;
      } else {
        var mapped = [];
        for (var i = 0; i < size; i++) {
          var val = fctMapper(this.get(i));
          if (val instanceof Array)
            mapped.push.apply(mapped, val);
          else
            mapped[mapped.length] = val;
        }
        return List.wrap(mapped);
      }
    } else {
      if (bObject) {
        var mapped = {};
        for (var i = 0; i < size; i++) {
          var pair = fctMapper(this.get(i));
          mapped[pair[0]] = pair[1];
        }
        return mapped;
      } else {
        var mapped = new Array(size);
        for (var i = 0; i < size; i++)
          mapped[i] = fctMapper(this.get(i));
        return List.wrap(mapped);
      }
    }
  };

  List_prototype.toString = function() {
    return "[" + this._src + "]";
  };

/* @JSC :: begin DEP */

  /**
   * @deprecated  Use the <code>jsx3.util.Iterator</code> interface instead.
   */
  List_prototype.reset = function() {
    this._iterator = -1;
    return this;
  };

  /**
   * @deprecated  Use the <code>jsx3.util.Iterator</code> interface instead.
   */
  List_prototype.next = function() {
    return this.get(++this._iterator);
  };

  /**
   * @deprecated  Use the <code>jsx3.util.Iterator</code> interface instead.
   */
  List_prototype.move = function(intIndex) {
    this._iterator = intIndex;
    return this;
  };

  /**
   * @deprecated  Use the <code>jsx3.util.Iterator</code> interface instead.
   */
  List_prototype.hasNext = function() {
    return this._iterator < (this.size() - 1);
  };

  /**
   * @deprecated  Use the <code>jsx3.util.Iterator</code> interface instead.
   */
  List_prototype.getIndex = function() {
    return this._iterator;
  };

  /**
   * @deprecated  Use <code>get()</code> instead.
   */
  List_prototype.getItem = function(intIndex) {
    return this.get(intIndex);
  };

  /**
   * @deprecated  Use <code>size()</code> instead.
   */
  List_prototype.getLength = function() {
    return this.size();
  };

/* @JSC :: end */

});

/**
 * An interface that defines an object that can be iterated over.
 *
 * @since 3.2
 */
jsx3.Class.defineInterface('jsx3.util.Iterator', null, function(Iterator, Iterator_prototype) {

  /**
   * Returns the next element in this iterator.
   * @return {Object}
   */
  Iterator_prototype.next = jsx3.Method.newAbstract();

  /**
   * Returns whether there are more elements remaining in this iterator.
   * @return {boolean}
   */
  Iterator_prototype.hasNext = jsx3.Method.newAbstract();

  /**
   * Removes the last object returned by next() from the source backing this iterator.
   */
  Iterator_prototype.remove = jsx3.Method.newAbstract();

});

// @jsxobf-clobber-shared  _list _index _size

/**
 * @private
 */
jsx3.Class.defineClass('jsx3.util.List.Iterator', null, [jsx3.util.Iterator], function(Iterator, Iterator_prototype) {

  Iterator_prototype.init = function(objList) {
    this._list = objList;
    this._size = objList ? objList.size() : 0;
    this._index = 0;
  };

  Iterator_prototype.next = function() {
    return this._list.get(this._index++);
  };

  Iterator_prototype.hasNext = function() {
    return this._index < this._size;
  };

  Iterator_prototype.remove = function() {
    if (this._index > 0) {
      this._list.removeAt(--this._index);
      this._size--;
    }
  };

});
