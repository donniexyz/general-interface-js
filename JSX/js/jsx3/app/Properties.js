/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Represents a repository of dynamic properties. Dynamic properties are simply name-value pairs. Dynamic properties
 * can be loaded from an XML file in the CDF dynamic property format.
 *
 * @since 3.2
 */
jsx3.Class.defineClass("jsx3.app.Properties", null, null, function(Properties, Properties_prototype) {

  var LOG = jsx3.util.Logger.getLogger(Properties.jsxclass.getName());

  /** @private @jsxobf-clobber */
  Properties.GLOBAL_KEY = "_global";

  /**
   * The instance initializer.
   */
  Properties_prototype.init = function() {
    /* @jsxobf-clobber */
    this._parents = [];
    /* @jsxobf-clobber */
    this._children = [];
    /* @jsxobf-clobber */
    this._order = [Properties.GLOBAL_KEY];
    /* @jsxobf-clobber */
    this._docs = {};
    this._docs[Properties.GLOBAL_KEY] = {};
    /* @jsxobf-clobber */
    this._master = {};
    /* @jsxobf-clobber */
    this._masterDirty = false;
    /* @jsxobf-clobber */
    this._parentsMaster = {};
    /* @jsxobf-clobber */
    this._parentsDirty = false;
  };

  /**
   * Loads a set of dynamic properties from an XML document into this repository. The document should be a shallow
   * CDF document with any number of <code>record</code> elements defined under the root <code>data</code> element.
   * <p/>
   * The following CDF attributes are supported:
   * <ul>
   * <li><code>jsxid</code> &#8211; the property key, required.</li>
   * <li><code>jsxtext</code> &#8211; the property value, required.</li>
   * <li><code>eval</code> &#8211; if <code>"1"</code> or <code>"true"</code> the <code>jsxtext</code> attribute
   *    is evaluated with JavaScript, optional.</li>
   * </ul>
   *
   * @param objXML {jsx3.xml.Entity}
   * @param strId {String} specifies the id to store the document under. If none is provided, the default space is
   *    used.
   */
  Properties_prototype.loadXML = function(objXML, strId) {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Properties.jsxclass, strId ||
        (objXML instanceof jsx3.xml.Document ? objXML.getSourceURL() : objXML.getNodeName()));
/* @JSC :: end */

    if (strId == null) {
      strId = Properties.GLOBAL_KEY;
    } else if (jsx3.util.arrIndexOf(this._order, strId) < 0) {
      this._order.splice(1, 0, strId);
    }

    var doc = this._docs[strId];
    if (doc == null)
      doc = this._docs[strId] = {};

    for (var i = objXML.selectNodeIterator("./record"); i.hasNext(); ) {
      var next = i.next();

      var id = next.getAttribute("jsxid");
      var eval = next.getAttribute("eval");
      var text = next.getAttribute("jsxtext");

      if (eval == "1" || eval == "true") {
        try {
          text = isNaN(text) ? jsx3.eval(text) : Number(text);
        } catch (e) {
          LOG.warn(jsx3._msg("props.eval", id, text), jsx3.NativeError.wrap(e));
        }
      }
      doc[id] = text;
    }

    // The cache and the parent cache of each child are dirty
    this._masterDirty = true;

/* @JSC :: begin BENCH */
    t1.log("load");
/* @JSC :: end */
  };

  /**
   * Adds a parent property repository to this repository. <code>get()</code> consults all parents before returning
   * <code>undefined</code>.
   * @param objParent {jsx3.app.Properties}
   * @see #get()
   */
  Properties_prototype.addParent = function(objParent) {
    this._parents.splice(0, 0, objParent);
    objParent._children.push(this);

    // Parent cache is dirty
    this._setChildrenDirty(true);
  };

  /**
   * Removes a property repository from the set of parent repositories.
   * @param objParent {jsx3.app.Properties} the parent repository to remove.
   */
  Properties_prototype.removeParent = function(objParent) {
    var index = jsx3.util.arrIndexOf(this._parents, objParent);
    if (index >= 0) {
      this._parents.splice(index, 1);
      objParent._removeChild(this);

      // Parent cache is dirty
      this._setChildrenDirty(true);
    }
  };

  /** @private @jsxobf-clobber */
  Properties_prototype._removeChild = function(objChild) {
    var index = jsx3.util.arrIndexOf(this._children, objChild);
    if (index >= 0)
      this._children.splice(index, 1);
  };

  /**
   * Removes all parent property repositories.
   */
  Properties_prototype.removeAllParents = function() {
    if (this._parents.length > 0) {
      for (var i = 0; i < this._parents.length; i++)
        this._parents[i]._removeChild(this);
      this._parents = [];

      this._parentsDirty = false;
      this._parentsMaster = {};
    }
  };

  /**
   * Returns the list of parent repositories of this repository.
   * @return {Array<jsx3.app.Properties>}
   */
  Properties_prototype.getParents = function() {
    return this._parents.concat();
  };

  /**
   * Returns whether this property repository contains a particular property. Parent repositories are not consulted.
   * @param strKey {String} the property key to query for.
   * @return {boolean} <code>true</code> if this repository contains a property with the given key.
   */
  Properties_prototype.containsKey = function(strKey) {
    if (this._masterDirty)
      this._reconstructMaster();

    return typeof(this._master[strKey]) != "undefined";
  };

  /**
   * Returns a list of all the property keys contained in this repository. Parent repositories are not consulted.
   * @return {Array<String>}
   */
  Properties_prototype.getKeys = function() {
    if (this._masterDirty)
      this._reconstructMaster();

    var keys = [];
    for (var f in this._master) keys[keys.length] = f;
    return keys;
  };

  /**
   * Returns the value of a property for a particular key. This method consults the parent repositories as necessary
   * until a property is found. If no property is found, <code>undefined</code> is returned.
   * @param strKey {String} the property key to query for.
   * @return {Object|undefined}
   */
  Properties_prototype.get = function(strKey) {
    if (this._masterDirty)
      this._reconstructMaster();

    if (typeof(this._master[strKey]) != "undefined")
      return this._master[strKey];

    if (this._parentsDirty)
      this._reconstructParentsMaster();

    return this._parentsMaster[strKey];
  };

  /**
   * Sets a property in this repository in the global space.
   * @param strKey {String} the key of the property to set.
   * @param strValue {Object} the value of the property. This value may be <code>null</code>, in which case
   *   <code>null</code> will be stored as the property value. This value may not be <code>undefined</code>; use
   *   <code>remove()</code> to remove a property value.
   * @see #remove()
   */
  Properties_prototype.set = function(strKey, strValue) {
    if (typeof(strValue) == "undefined") throw new jsx3.IllegalArgumentException("strValue", strValue);
    // 1. set the value in the memory space
    this._docs[Properties.GLOBAL_KEY][strKey] = strValue;

    // 2. update the cache
    this._master[strKey] = strValue;

    // 3. tell children that a parent cache is dirty
    this._setChildrenDirty();
  };

  /**
   * Removes a property from this repository. The property is removed from all spaces.
   * @param strKey {String} the key of the property to remove.
   */
  Properties_prototype.remove = function(strKey) {
    // 1. remove the value from all memory spaces
    for (var key in this._docs)
      delete this._docs[key][strKey];

    // 2. update the cache
    delete this._master[strKey];

    // 3. tell children that a parent cache is dirty
    this._setChildrenDirty();
  };

  /** @private @jsxobf-clobber */
  Properties_prototype._reconstructMaster = function() {
    this._masterDirty = false;
    var master = this._master = {};

    for (var i = this._order.length - 1; i >= 0; i--) {
      var doc = this._docs[this._order[i]];
      for (var f in doc)
        master[f] = doc[f];
    }
  };

  /** @private @jsxobf-clobber */
  Properties_prototype._reconstructParentsMaster = function() {
    this._parentsDirty = false;
    var master = this._parentsMaster = {};

    for (var i = this._parents.length - 1; i >= 0; i--) {
      var p = this._parents[i];
      if (p._masterDirty)
        p._reconstructMaster();
      if (p._parentsDirty)
        p._reconstructParentsMaster();

      var m1 = p._master;
      var m2 = p._parentsMaster;

      for (var f in m2)
        master[f] = m2[f];
      for (var f in m1)
        master[f] = m1[f];
    }
  };

  /** @private @jsxobf-clobber */
  Properties_prototype._setChildrenDirty = function(bMe) {
    var stack = bMe ? [this] : this._children.concat();

    while (stack.length > 0) {
      var p = stack.shift();
      if (!p._parentsDirty) {
        p._parentsDirty = true;
        stack.push.apply(stack, p._children);
      }
    }
  };

});
