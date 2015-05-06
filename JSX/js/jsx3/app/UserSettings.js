/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Read-Write per-User settings for a particular GI application (server).
 * <p/>
 * This implementation stores settings in a browser cookie.
 *
 * @since 3.0
 */
jsx3.Class.defineClass("jsx3.app.UserSettings", null, null, function(UserSettings, UserSettings_prototype) {
  
  var Entity = jsx3.xml.Entity;
  var LOG = jsx3.util.Logger.getLogger(UserSettings.jsxclass.getName());
  
  /**
   * {int} 
   * @final @jsxobf-final
   */
  UserSettings.PERSIST_SESSION = 1;

  /**
   * {int} 
   * @final @jsxobf-final
   */
  UserSettings.PERSIST_INDEFINITE = 2;
  
  /** @private @jsxobf-clobber */
  UserSettings_prototype.server = null;
  /** @private @jsxobf-clobber */
  UserSettings_prototype.persist = null;
  /** @private @jsxobf-clobber */
  UserSettings_prototype.value = null;
  
  /**
   * The instance initializer.
   * @param objServer {jsx3.app.Server} the app server.
   * @param intPersistence {int} the persistence code, defaults to <code>PERSIST_INDEFINITE</code>.
   */
  UserSettings_prototype.init = function(objServer, intPersistence) {
    if (intPersistence == null)
      intPersistence = UserSettings.PERSIST_INDEFINITE;
    
    this.server = objServer;
    this.persist = intPersistence;
    
    var cookie = this.getCookieValue();
    this.value = UserSettings.deserialize(cookie);
  };
  
  /**
   * Returns a stored setting value.
   * @param strKey {String...} the setting key.
   * @return {String|Number|boolean|Array|Object} the stored value.
   */
  UserSettings_prototype.get = function(strKey) {
    var obj = this.value;
    
    for (var i = 0; i < arguments.length; i++) {
      if (typeof(obj) != 'object' || (jsx3.$A.is(obj)))
        return null;
      
      obj = obj[arguments[i]];
    }
    
    return obj;
  };
  
  /**
   * Sets a stored setting value.
   * @param strKey {String...} the setting key.
   * @param value {String|Number|boolean|Array|Object} the value to store.
   */
  UserSettings_prototype.set = function(strKey, value) {
    var obj = this.value;
    
    for (var i = 0; i < arguments.length - 2; i++) {
      var child = obj[arguments[i]];
      
      if (typeof(child) != 'object' || (jsx3.$A.is(child))) {
        child = obj[arguments[i]] = null;
      }
      
      if (child == null) {
        child = obj[arguments[i]] = {};
      }
      
      obj = child;
    }
    
    obj[arguments[arguments.length - 2]] = arguments[arguments.length - 1];
    
    return obj;
  };
  
  /**
   * Removes a stored setting value.
   * @param strKey {String...} the key of the setting to remove.
   */
  UserSettings_prototype.remove = function(strKey) {
    var obj = this.value;
    
    for (var i = 0; i < arguments.length - 1; i++) {
      var child = obj[arguments[i]];
      
      if (child == null || typeof(child) != 'object' || (jsx3.$A.is(child)))
        return;
        
      obj = child;
    }
    
    delete obj[arguments[arguments.length - 1]];
  };
  
  /**
   * Clears all settings of this user settings instance. This implementation deletes the cookie.
   */
  UserSettings_prototype.clear = function() {
    this.value = {};
    var name = this.getCookieName();
    var settings = this.server.getSettings();
    var domain = settings.get('user-settings','domain');
    var path = settings.get('user-settings','path');
    this.server.deleteCookie(name, path, domain);
  };

  /**
   * Persists the user settings. Any modifications to this user settings instance will be lost if this method 
   * is not called.
   */
  UserSettings_prototype.save = function() {
    var value = UserSettings.serialize(this.value);
        
    // change '<' to '*' and '>' to '+'
    value = value.replace(/\*/g, '%2A');
    value = value.replace(/\+/g, '%2B');
    value = value.replace(/</g, '*');
    value = value.replace(/>/g, '+');
    value = escape(value);
    
    var bytes = value.length;
    if (bytes > 4096)
      LOG.warn(jsx3._msg("usrset.large", bytes));
    
    this.setCookieValue(value);
  };
  
  /**
   * @private
   * @jsxobf-clobber
   */
  UserSettings_prototype.getCookieName = function() {
    return this.server.getEnv('NAMESPACE') + 
        (this.persist == UserSettings.PERSIST_SESSION ? "_ses" : "_ind");
  };
  
  /**
   * @private
   * @jsxobf-clobber
   */
  UserSettings_prototype.getCookieValue = function() {
    var name = this.getCookieName();
    var value = this.server.getCookie(name, true);
    
    if (value) {
      // undo custom escaping
      value = value.replace(/\*/g, '<');
      value = value.replace(/\+/g, '>');
      value = unescape(value);
    }
    
    return value;
  };
  
  /**
   * @private
   * @jsxobf-clobber
   */
  UserSettings_prototype.setCookieValue = function(strValue) {
    var name = this.getCookieName();
    var settings = this.server.getSettings();
    var domain = settings.get('user-settings','domain');
    var path = settings.get('user-settings','path');
    var today = new Date();
    var expires = (this.persist == UserSettings.PERSIST_SESSION) ? null : 
        new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
      
    this.server.setCookie(name, strValue, expires, path, domain, null, true);
  };
  
  /**
   * @private
   * @jsxobf-clobber
   */
  UserSettings.deserialize = function(strValue) {
    if (! strValue) 
      return {};
    
    var doc = new jsx3.xml.Document();
    doc.loadXML(strValue);
    return UserSettings.deserializeValue(doc.getRootNode());
  };

  /**
   * @private
   * @jsxobf-clobber
   */
  UserSettings.deserializeValue = function(objNode) {
    var name = objNode.getNodeName();
    
    if (name == 's') {
      return objNode.getValue();
    } else if (name == 'n') {
      return Number(objNode.getValue());
    } else if (name == 'm') {
      return objNode.getChildNodes().map(function(x){
        return [x.getAttribute('n'), UserSettings.deserializeValue(x)];
      }, false, true);
    } else if (name == 'a') {
      return objNode.getChildNodes().map(function(x){
        return UserSettings.deserializeValue(x);
      }).toArray(true);
    } else if (name == 'b') {
      return objNode.getValue() == "1";
    } else if (name == 'u') {
      return null;
    } else {
      LOG.warn(jsx3._msg("usrset.deser", name));
      return null;
    }
  };
  
  /**
   * @private
   * @jsxobf-clobber
   */
  UserSettings.serialize = function(objValue) {
    var doc = new jsx3.xml.Document();
    doc.loadXML('<m/>');
    var node = doc.getRootNode();
    
    for (var f in objValue)
      UserSettings.serializeValue(objValue[f], f, node);

    return node.getXML();
  };
    
  /**
   * @private
   * @jsxobf-clobber
   */
  UserSettings.serializeValue = function(objValue, strName, objParent) {
    var node = null;
    var type = typeof(objValue);
    
    if (objValue == null || type == "undefined") {
      node = objParent.createNode(Entity.TYPEELEMENT, "u");
    } else if (type == "string") {
      node = objParent.createNode(Entity.TYPEELEMENT, "s");
      node.setValue(objValue);
    } else if (type == "number") {
      node = objParent.createNode(Entity.TYPEELEMENT, "n");
      node.setValue(objValue);
    } else if (type == "boolean") {
      node = objParent.createNode(Entity.TYPEELEMENT, "b");
      node.setValue(objValue ? "1" : "0");
    } else if (type == "object") {
      if (jsx3.$A.is(objValue)) {
        node = objParent.createNode(Entity.TYPEELEMENT, "a");
        for (var i = 0; i < objValue.length; i++) {
          UserSettings.serializeValue(objValue[i], i.toString(), node);
        }
      } else {
        node = objParent.createNode(Entity.TYPEELEMENT, "m");
        for (var f in objValue)
          UserSettings.serializeValue(objValue[f], f, node);
      }
    } else if (type == "function") {
      ;
    } else {
      throw new jsx3.Exception(jsx3._msg("usrset.persist", type));
    }
    
    node.setAttribute('n', strName);
    objParent.appendChild(node);
  };

  UserSettings_prototype.toString = function() {
    return this.jsxsuper() + this.server.getAppPath();
  };

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.app.UserSettings
 * @see jsx3.app.UserSettings
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.UserSettings", -, null, function(){});
 */
jsx3.UserSettings = jsx3.app.UserSettings;

/* @JSC :: end */
