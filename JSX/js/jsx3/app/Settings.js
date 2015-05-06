/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber  _jsxtodo

/**
 * An object oriented interface onto the XML system settings format. Note that this class has no ability to save
 * preferences to disk or other medium. However, the source XML data is returned by calling <code>getNode()</code>
 * with no parameters. 
 *
 * @since 3.0
 */
jsx3.Class.defineClass("jsx3.app.Settings", null, null, function(Settings, Settings_prototype) {
    
  /**
   * The instance initializer. Creates a view onto the settings persisted on disk. All identical instances of this
   * class are backed by the same XML source document.
   *
   * @param objXML {jsx3.xml.Document} the underlying XML datasource. 
   */
  Settings_prototype.init = function(objXML) {
    /* @jsxobf-clobber-shared */
    this._doc = objXML || jsx3.xml.CDF.newDocument();
    /* @jsxobf-clobber-shared */
    this._root = this._doc.getRootNode();
  };

  /**
   * Returns a stored setting value.
   * @param strKey {String...} the setting key.
   * @return {String|Number|boolean|Array|Object} the stored value.
   */
  Settings_prototype.get = function(strKey) {
    var value = this._getCachedValue(arguments);
    if (typeof(value) == "undefined") {
      var node = this.getNode.apply(this, arguments);
      if (node == null) return Settings.UNDEF;
      value = Settings._getRecordValue(node);
      this._cacheValue(value, arguments);
    }
    return value;
  };
  
  /**
   * Returns a stored setting value as the raw XML node.
   * @param strKey {String...} the setting key.
   * @return {jsx3.xml.Entity}
   */
  Settings_prototype.getNode = function(strKey) {
    var node = this._root;
    
    var query = "/data";
    for (var i = 0; node && i < arguments.length; i++) {
      query += "/record[@jsxid='" + arguments[i] + "']";
    }
    
    return node.selectSingleNode(query);
  };

  /**
   * Caches a value retrieved from the XML source. If this settings is read from and never written to eventually the
   * entire source will exist in memory as a nested object.
   * @param objValue {Object}
   * @param arrPath {Array<String>}
   * @private 
   * @jsxobf-clobber 
   */
  Settings_prototype._cacheValue = function(objValue, arrPath) {
    if (arrPath.length == 0) {
      /* @jsxobf-clobber */
      this._cache = objValue;
    } else {
      if (!this._cache) this._cache = {_jsxtodo:true};
      var node = this._cache;
      for (var i = 0; i < arrPath.length - 1; i++) {
        var path = arrPath[i];
        if (node[path] == null) {
          node[path] = {_jsxtodo:true};
        }
        node = node[path];
      }
      node[arrPath[arrPath.length-1]] = objValue;
    }
  };
  
  /**
   * Retrieves a cached value.
   * @param arrPath {Array<String>}
   * @return {Object|undefined}
   * @private 
   * @jsxobf-clobber 
   */
  Settings_prototype._getCachedValue = function(arrPath) {
    var node = this._cache;
    for (var i = 0; node && i < arrPath.length; i++) {
      node = node[arrPath[i]];
    }
    return (node && node._jsxtodo) ? Settings.UNDEF : node;
  };
  
  /**
   * Resets the cache. This method should be called any time this settings is written to.
   * @private
   * @jsxobf-clobber 
   */
  Settings_prototype._resetCache = function() {
    delete this._cache;
  };
  
  /** @private @jsxobf-clobber */
  Settings._VALUE_GETTERS = {
    array: function(record) {
      var i = record.selectNodeIterator("./record");
      var a = [];
      while (i.hasNext()) {
        var x = i.next();
        var getter = Settings._VALUE_GETTERS[x.getAttribute("type")];
        a[a.length] = getter ? getter(x) : x.getValue();
      }
      return a;
    },
    map: function(record) {
      var i = record.selectNodeIterator("./record");
      var o = {};
      while (i.hasNext()) {
        var x = i.next();
        var getter = Settings._VALUE_GETTERS[x.getAttribute("type")];
        o[x.getAttribute('jsxid')] = getter ? getter(x) : x.getValue();
      }
      return o;
    },
    "number": function(record) { return Number(record.getValue()); },
    "boolean": function(record) { return record.getValue() === "true"; },
    "null": function(record) { return null; },
    "string": function(record) { return record.getValue(); },
    "eval": function(record) {
      try {
        return jsx3.eval(record.getValue());
      } catch (e) {
        return null;
      } 
    }
  };

  /**
   * @private
   * @jsxobf-clobber
   */
  Settings._getRecordValue = function(record) {
    var type = record.getNodeName() == "data" ? "map" : record.getAttribute("type");
    var getter = Settings._VALUE_GETTERS[type];
    return getter ? getter(record) : record.getValue();
  };

  /**
   * Sets a stored setting value.
   * @param strKey {String...}
   * @param value {String|Number|boolean|Array|Object} the value to store, map be string, number, boolean,
   *   array, or object (map)
   * @since 3.6
   */
  Settings_prototype.set = function(strKey, value) {
    var node = this._root;
    for (var i = 0; i < arguments.length - 2; i++) {
      var child = node.selectSingleNode("./record[@jsxid='" + arguments[i] + "']");

      if (child && child.getAttribute('type') != 'map') {
        node.removeChild(child);
        child = null;
      }

      if (! child) {
        child = node.createNode(jsx3.xml.Entity.TYPEELEMENT, "record");
        child.setAttribute("jsxid", arguments[i]);
        child.setAttribute("type", 'map');
        node.appendChild(child);
      }
      node = child;
    }

    Settings._setRecord(node, arguments[arguments.length - 2], arguments[arguments.length - 1]);
    this._resetCache();
  };

  /**
   * Removes a stored setting value.
   * @param strKey {String...}
   * @since 3.6
   */
  Settings_prototype.remove = function(strKey) {
    var parent = null;
    var node = this._root;

    for (var i = 0; node && i < arguments.length; i++) {
      parent = node;
      node = node.selectSingleNode("./record[@jsxid='" + arguments[i] + "']");
    }

    if (node && parent) {
      parent.removeChild(node);
      this._resetCache();
    }
  };
  
  /**
   * @private
   * @jsxobf-clobber
   */
  Settings._setRecord = function(parent, strKey, value) {
    var record = Settings._getOrCreateRecord(strKey, parent);
    record.removeChildren();
    var type = typeof(value);

    if (value == null || type == "undefined") {
      record.setAttribute("type", "null");
      record.setValue(null);
    } else if (type == "string" || type == "number") {
      record.setAttribute("type", type);
      record.setValue(value);
    } else if (type == "boolean") {
      record.setAttribute("type", "boolean");
      record.setValue(value ? "true" : "false");
    } else if (type == "object") {
      if (jsx3.$A.is(value)) {
        record.setAttribute("type", "array");
        for (var i = 0; i < value.length; i++) {
          Settings._setRecord(record, i.toString(), value[i]);
        }
      } else {
        record.setAttribute("type", "map");
        for (var f in value) {
          Settings._setRecord(record, f, value[f]);
        }
      }
    } else if (type == "function") {
      ;
    } else {
      jsx3.ERROR.doLog("idPR02", "Cannot persist object of type " + type, 5);
    }
  };
  
  /**
   * @private
   * @jsxobf-clobber
   */
  Settings._getOrCreateRecord = function(strKey, parent) {
    var node = parent.selectSingleNode("./record[@jsxid='" + strKey + "']");
    if (!node) {
      node = parent.createNode(jsx3.xml.Entity.TYPEELEMENT, "record");
      node.setAttribute("jsxid", strKey);
      parent.appendChild(node);
    }
    return node;
  };
  
});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.app.Settings
 * @see jsx3.app.Settings
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Settings", -, null, function(){});
 */
jsx3.Settings = jsx3.app.Settings;

/* @JSC :: end */
