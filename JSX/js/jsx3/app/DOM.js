/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Registers all DOM nodes in an instance of <code>jsx3.app.Server</code> and publishes related events.
 * This class keeps all contained JSX objects indexed on id and name.
 */
jsx3.Class.defineClass("jsx3.app.DOM", null, [jsx3.util.EventDispatcher], function(DOM, DOM_prototype) {

  /**
   * {Object<String,int>} ID incrementers that ensures all system-assigned IDs are unique.
   * @private @jsxobf-clobber
   */
  DOM._INC = {};

  /**
   * {Object<String,String>} Maps long namespace string to short id strings.
   * @private @jsxobf-clobber
   */
  DOM._LOOKUP = {};

  /**
   * {Object<String,String>} Maps the short id strings to the long namespace string.
   * @private @jsxobf-clobber
   */
  DOM._LOOKUP_REVERSE = {};

  /**
   * {int} The number of keys in DOM._LOOKUP.
   * @private @jsxobf-clobber
   */
  DOM._LOOKUP_COUNT = 0;

  /**
   * {int} 0
   * @final @jsxobf-final
   */
  DOM.TYPEADD = 0;

  /**
   * {int} 1
   * @final @jsxobf-final
   */
  DOM.TYPEREMOVE = 1;

  /**
   * {int} 2
   * @final @jsxobf-final
   */
  DOM.TYPEREARRANGE = 2;

  /**
   * @package
   * @final @jsxobf-final
   */
  DOM.EVENT_CHANGE = "change";

  /**
   * Creates a new unique system id.
   * @param strNameSpace {String} the application namespace for which to generate the id.
   * @return {String}
   */
  DOM.newId = function(strNameSpace) {
    var nsKey = DOM._getNamespaceKey(strNameSpace);
    return "_jsx_" + nsKey + "_" + DOM._getNamespaceSerial(nsKey).toString(36);
  };

  /** @private @jsxobf-clobber */
  DOM._getNamespaceKey = function(strNS) {
    if (DOM._LOOKUP[strNS] == null) {
      var key = (DOM._LOOKUP_COUNT++).toString(36);
      DOM._LOOKUP[strNS] = key;
      DOM._LOOKUP_REVERSE[key] = strNS;
    }

    return DOM._LOOKUP[strNS];
  };

  /** @private @jsxobf-clobber */
  DOM._getNamespaceSerial = function(strNSKey) {
    if (DOM._INC[strNSKey] == null)
      DOM._INC[strNSKey] = 0;

    return ++DOM._INC[strNSKey];
  };

  /**
   * @package
   */
  DOM.getNamespaceForId = function(strId) {
    var key = strId.substring(5, strId.indexOf("_", 5));
    return DOM._LOOKUP_REVERSE[key];
  };

  /**
   * The instance initializer.
   */
  DOM_prototype.init = function() {
    // holds index of of all GUI objects for this server instance, indexed via their system-assigned ID
    /* @jsxobf-clobber */
    this.SYSTEMHASH = {};

    // holds index of all GUI objects for this server instance, indexed via the developer-assigned NAME
    /* @jsxobf-clobber */
    this.USERHASH = {};
  };

  /**
   * The instance finalizer.
   */
  DOM_prototype.destroy = function() {
    delete this.SYSTEMHASH;
    delete this.USERHASH;
  };

  /**
   * Looks up a DOM object contained in this DOM by id or name.
   * @param strId {String} either the id of the object to return or its name.
   * @return {jsx3.app.Model} the matching DOM object or <code>null</code> if none found.
   */
  DOM_prototype.get = function(strId) {
    return this.SYSTEMHASH[strId] || this.getByName(strId);
  };

  /**
   * Looks up a DOM object contained in this DOM by name. It is left to the developer to specify unique names for
   * all DOM nodes that must be accessed in this manner. If more than one DOM nodes exist with a name of
   * <code>strName</code> the behavior of this method is undefined.
   *
   * @param strName {String} the name of the object to return.
   * @return {jsx3.app.Model} the matching DOM object or <code>null</code> if none found.
   * @see #getAllByName()
   */
  DOM_prototype.getByName = function(strName) {
    var nameBucket = this.USERHASH[strName];
    return nameBucket != null ? nameBucket.get(0) : null;
  };

  /** @private @jsxobf-clobber */
  DOM.EMPTY_LIST = [];

  /**
   * Returns all the DOM nodes in this DOM with a name of <code>strName</code>. The name index keeps a bucket of
   * DOM nodes for each unique name. Therefore, this method performs efficiently.
   *
   * @param strName {String} the name of the objects to return.
   * @return {Array<jsx3.app.Model>} an array of the matching DOM nodes. This return value should not be mutated as
   *   that will effect the internal functioning of this DOM.
   * @see #getByName()
   * @since 3.2
   */
  DOM_prototype.getAllByName = function(strName) {
    var nameBucket = this.USERHASH[strName];
    return nameBucket != null ? nameBucket.toArray() : DOM.EMPTY_LIST;
  };

  /**
   * Looks up a DOM object contained in this DOM by id.
   * @param strId {String} the id of the object to return.
   * @return {jsx3.app.Model} the matching DOM object or <code>null</code> if none found.
   */
  DOM_prototype.getById = function(strId) {
    return this.SYSTEMHASH[strId];
  };

  /**
   * Adds a JSX object to this DOM and indexes it by its id and name.
   * @param objJSX {jsx3.app.Model}
   */
  DOM_prototype.add = function(objJSX) {
    this.SYSTEMHASH[objJSX.getId()] = objJSX;
    var name = objJSX.getName();
    if (name != null && name !== "") {
      if (this.USERHASH[name] == null)
        this.USERHASH[name] = jsx3.util.List.wrap([objJSX]);
      else
        this.USERHASH[name].add(objJSX, 0);
    }
  };

  /**
   * Removes a JSX object from this DOM and removes it from the indices.
   * @param objJSX {jsx3.app.Model}
   */
  DOM_prototype.remove = function(objJSX) {
    delete this.SYSTEMHASH[objJSX.getId()];

    var nameBucket = this.USERHASH[objJSX.getName()];
    if (nameBucket != null)
      nameBucket.remove(objJSX);
  };

  /**
   * A method that must be called after changing the name of a contained DOM node. This method updates the name
   * index appropriately.
   * @param objJSX {jsx3.app.Model}
   * @param oldName {String} the name before it was changed
   */
  DOM_prototype.onNameChange = function(objJSX, oldName) {
    var oldBucket = this.USERHASH[oldName];
    if (oldBucket != null)
      oldBucket.remove(objJSX);

    var name = objJSX.getName();
    if (name != null && name !== "") {
      if (this.USERHASH[name] == null)
        this.USERHASH[name] = jsx3.util.List.wrap([objJSX]);
      else
        this.USERHASH[name].add(objJSX, 0);
    }
  };

  /**
   * called when a change to the JSX DOM occurs for this server instance (adopt, load, delete, etc); publishes an event object (javascript object) with the following named properties: subject (jsx3.app.DOM.EVENT_CHANGE); type (jsx3.app.DOM.TYPEADD | jsx3.app.DOM.TYPEREMOVE); parentId (id of JSX parent); jsxId (id of element added or removed)
   * @param TYPE {int} one of: jsx3.app.DOM.TYPEADD, jsx3.app.DOM.TYPEREMOVE
   * @param JSXPARENTID {String} id of dom parent
   * @param JSXID {String} id of dom element either added or removed
   */
  DOM_prototype.onChange = function(TYPE, JSXPARENTID, JSXID) {
    this.publish({subject:DOM.EVENT_CHANGE, type:TYPE, parentId:JSXPARENTID, jsxId:JSXID});
  };

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.app.DOM
 * @see jsx3.app.DOM
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.DOM", -, null, function(){});
 */
jsx3.DOM = jsx3.app.DOM;

/* @JSC :: end */
