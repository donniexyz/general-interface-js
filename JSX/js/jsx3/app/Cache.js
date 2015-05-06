/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Provides cached access to XML and XSL data.
 *
 * <h4>Events</h4>
 * Cache instances publish two types of events for every operation that modifies the contents of the cache. The
 * schemas of the two event types are
 * <ul>
 *   <li><code>subject</code> - <code>Cache.CHANGE</code></li>
 *   <li><code>id</code> or <code>ids</code> - the ID or array of IDs of the modified documents</li>
 *   <li><code>action</code> - <code>Cache.ADD</code>, <code>Cache.CHANGE</code> or <code>Cache.REMOVE</code></li>
 * </ul>
 * and
 * <ul>
 *   <li><code>subject</code> - the cache ID of the modified document</li>
 *   <li><code>action</code> - <code>Cache.ADD</code>, <code>Cache.CHANGE</code> or <code>Cache.REMOVE</code></li>
 * </ul>
 *
 * <h4>Asynchronous Loading</h4>
 * Cache documents can be loaded asychronously with the <code>getOrOpenAsync()</code> method. This method returns
 * the corresponding document synchronously if it already exists in the cache. If the document does not exist in the
 * cache, then it is loaded asynchronously and the method returns a placeholder document. The namespace URI of this
 * placeholder document is <code>Cache.XSDNS</code> and its root node name is <code>"loading"</code>.
 * <p/>
 * Since the cache stores this placeholder document until the document finishes loading, subsequent calls to
 * synchronous APIs (<code>getDocument()</code>, <code>getOrOpenDocument()</code>, etc) may also return the
 * placeholder document. It is therefore important to check the namespace of the returned document when any code
 * uses the asynchronous APIs.
 * <p/>
 * Once a document finishes loading asynchronously the placeholder document is replaced with the loaded document.
 * This change in value causes the cache to publish a pair of events of action <code>Cache.CHANGE</code>. If
 * loading the document fails or times out the placeholder document is instead replaced with another placeholder
 * document. This document also has a URI namespace of <code>Cache.XSDNS</code>. Its root node name may be either
 * <code>"error"</code> or <code>"timeout"</code>. If the root node name is <code>"error"</code> then the root node
 * has an attribute, also named <code>"error"</code>, which contains the XML error message.
 */
jsx3.Class.defineClass("jsx3.app.Cache", null, [jsx3.util.EventDispatcher], function(Cache, Cache_prototype) {

  var Document = jsx3.xml.Document;

  /**
   * {String} Event action.
   * @since 3.5
   * @final @jsxobf-final
   */
  Cache.REMOVE = "remove";

  /**
   * {String} Event action.
   * @since 3.5
   * @final @jsxobf-final
   */
  Cache.ADD = "add";

  /**
   * {String} Event subject and action.
   * @since 3.5
   * @final @jsxobf-final
   */
  Cache.CHANGE = "change";

  /**
   * {int} The number of milliseconds before asynchronous document loads time out.
   * @since 3.5
   */
  Cache.ASYNC_TIMEOUT = 60000;

  /**
   * {String}
   * @since 3.5
   */
  Cache.XSDNS = "http://xsd.tns.tibco.com/gi/cache";

  /** @private @jsxobf-clobber */
  Cache._LOADING_DOC = new Document().loadXML('<loading xmlns="' + Cache.XSDNS + '"/>');
  /** @private @jsxobf-clobber */
  Cache._TIMEOUT_DOC = new Document().loadXML('<timeout xmlns="' + Cache.XSDNS + '"/>');
  /** @private @jsxobf-clobber */
  Cache._ERROR_DOC = new Document().loadXML('<error xmlns="' + Cache.XSDNS + '"/>');

  /**
   * Creates a new instance of this class.
   */
  Cache_prototype.init = function() {
    // declare an object array to hold all cache documents
    /* @jsxobf-clobber */
    this._index = {};
    /* @jsxobf-clobber */
    this._parents = [];
  };
  
  Cache_prototype.addParent = function(objParent) {
    this._parents.push(objParent);
  };

  /**
   * Removes the document stored in this cache under id <code>strId</code>.
   * @param strId {String}
   * @return {jsx3.xml.Document} the remove document, if any.
   */
  Cache_prototype.clearById = function(strId) {
    var objRecord = this._index[strId];
    if (objRecord) {
      delete this._index[strId];
      this._cleanUpRecord(objRecord);
      this.publish({subject:strId, action:Cache.REMOVE});
      this.publish({subject:Cache.CHANGE, id:strId, action:Cache.REMOVE});
      return objRecord.jsxdocument;
    }
  };

/* @JSC :: begin DEP */

  /**
   * returns whether or not the given document in the cache is owned by the system. If no document by the given ID exists, false is returned.
   * @param strId {String} unique identifier for the jsx3.xml.DocumentInstance instance when it was placed in the cache
   * @return {boolean} <code>false</code>.
   * @deprecated
   */
  Cache_prototype.isSystem = function(strId) {
    return false;
//    return this._index[strId] != null && this._index[strId].jsxsystem;
  };

/* @JSC :: end */

  /**
   * Removes all documents placed in this cache before <code>intTimestamp</code>.
   * @param intTimestamp {int|Date} epoch seconds or a date object.
   * @return {Array<String>} the ids of the removed documents.
   */
  Cache_prototype.clearByTimestamp = function(intTimestamp) {
    if (intTimestamp instanceof Date) intTimestamp = intTimestamp.getTime();

    var ids = [];

    for (var p in this._index) {
      var record = this._index[p];
      if (record.jsxtimestamp < intTimestamp) {
        delete this._index[p];
        this._cleanUpRecord(record);
        this.publish({subject:p, action:Cache.REMOVE});
        ids.push(p);
      }
    }

    if (ids.length > 0)
      this.publish({subject:Cache.CHANGE, ids:ids, action:Cache.REMOVE});

    return ids;
  };

  /**
   * Returns the document stored in this cache under id <code>strId</code>.
   * @param strId {String}
   * @return {jsx3.xml.Document} the stored document or <code>null</code> if none exists.
   */
  Cache_prototype.getDocument = function(strId) {
    if (this._index[strId] != null)
      return this._index[strId].jsxdocument;
    
    for (var i = 0; i < this._parents.length; i++) {
      var doc = this._parents[i].getDocument(strId);
      if (doc != null) return doc;
    }

    return null;
  };
  
  /**
   * Retrieves a document from this cache or, if this cache contains no such document, loads the document
   * synchronously and returns it.
   * @param strURL {String|jsx3.net.URI} the URI of the document.
   * @param strId {String} the id under which the document is/will be stored. If this parameter is not provided, the
   *    <code>strURL</code> parameter is used as the id.
   * @param objClass {jsx3.lang.Class} <code>jsx3.xml.Document</code> (default value) or one of its subclasses. The
   *    class with which to instantiate the new document instance if a new document is opened.
   * @return {jsx3.xml.Document} the document retrieved from the cache or loaded.
   */
  Cache_prototype.getOrOpenDocument = function(strURL, strId, objClass) {
    if (strId == null) strId = strURL.toString();
    return this.getDocument(strId) || this._openDocument(strURL, strId, objClass, false);
  };

  /**
   * Synchronously loads an xml document, stores it in this cache, and returns the loaded document.
   * @param strURL {String|jsx3.net.URI} url (relative or absolute) the URI of the document to open.
   * @param strId {String} the id under which to store the document. If this parameter is not provided, the
   *    <code>strURL</code> parameter is used as the id.
   * @param objClass {jsx3.lang.Class} <code>jsx3.xml.Document</code> (default value) or one of its subclasses. The
   *    class with which to instantiate the new document instance.
   * @return {jsx3.xml.Document} the loaded document object.
   */
  Cache_prototype.openDocument = function(strURL, strId, objClass) {
    return this._openDocument(strURL, strId, objClass, false);
  };

  /**
   * Asynchronously loads an xml document and stores it in this cache.
   *
   * @param strURL {String|jsx3.net.URI} url (relative or absolute) the URI of the document to open.
   * @param strId {String} the id under which to store the document. If this parameter is not provided, the
   *    <code>strURL</code> parameter is used as the id.
   * @param objClass {jsx3.lang.Class} <code>jsx3.xml.Document</code> (default value) or one of its subclasses. The
   *    class with which to instantiate the new document instance.
   * @return {jsx3.xml.Document} the document retrieved from the cache or a placeholder document if the document
   *    is in the process of loading asynchronously.
   * @since 3.5
   */
  Cache_prototype.getOrOpenAsync = function(strURL, strId, objClass) {
    if (strId == null) strId = strURL.toString();
    return this.getDocument(strId) || this._openDocument(strURL, strId, objClass, true);
  };

  /** @private @jsxobf-clobber */
  Cache_prototype._openDocument = function(strURL, strId, objClass, bAsync) {
    if (objClass == null) objClass = Document.jsxclass;
    if (strId == null) strId = strURL.toString();

    var objXML = objClass.newInstance();
    objXML.setAsync(bAsync);

    if (bAsync) {
      var loadingDoc = objXML;
      loadingDoc.subscribe("*", this, "_onAsyncDone");
      /* @jsxobf-clobber */
      loadingDoc._jsxcacheid = strId;
      loadingDoc.load(strURL, Cache.ASYNC_TIMEOUT);
      
      objXML = Cache._LOADING_DOC.cloneDocument();
      /* @jsxobf-clobber */
      objXML._loadingDoc = loadingDoc; // Store a reference to the original loading document
    } else {
      objXML.load(strURL);
    }

    this.setDocument(strId, objXML);
    return objXML;
  };

  /** @package @jsxobf-clobber-shared */
  Cache_prototype._replaceDocument = function(strId, objDoc) {
    if (this._index[strId])
      this._index[strId].jsxdocument = objDoc;
    else
      this._index[strId] = {jsxdocument:objDoc, jsxtimestamp:(new Date()).getTime()};
  };

  /** @private @jsxobf-clobber */
  Cache_prototype._cleanUpRecord = function(r) {
    // unsubscribe to asynchronous loading
    var doc = r.jsxdocument._loadingDoc;
    if (doc) {
      doc.unsubscribe("*", this);
      doc.abort();
    }
  };

  /** @private @jsxobf-clobber */
  Cache_prototype._onAsyncDone = function(objEvent) {
    var objXML = objEvent.target;
    var strEvtType = objEvent.subject;
    var strId = objXML._jsxcacheid;

    delete objXML._jsxcacheid;
    objXML.unsubscribe("*", this);

    if (this._index) {
      var d;

      if (strEvtType == Document.ON_RESPONSE) {
        d = objXML;
      } else if (strEvtType == Document.ON_TIMEOUT) {
        d = Cache._TIMEOUT_DOC.cloneDocument();
      } else if (strEvtType == Document.ON_ERROR) {
        d = Cache._ERROR_DOC.cloneDocument();
        d.setAttribute("error", objXML.getError().toString());
      } else {
        return;
      }

      this.setDocument(strId, d);
      // lets Cacheable determine whether change event is due to load or setDocument
      this.publish({subject:"load." + strId, action:"load", response:strEvtType, id:strId});
    }
  };

  /**
   * Stores the document <code>objDocument</code> in this cache under id <code>strId</code>. If a document already
   * exists in this cache under <code>strId</code> then that document is removed from the cache.
   *
   * @param strId {String} the id under which to store <code>objDocument</code>.
   * @param objDocument {jsx3.xml.Document} 
   */
  Cache_prototype.setDocument = function(strId, objDocument) {
    if (strId == null) throw new jsx3.IllegalArgumentException("strId", strId);
    if (objDocument == null) throw new jsx3.IllegalArgumentException("objDocument", objDocument);
    
    //create a new cache object
    var record = {};
    /* @jsxobf-clobber */
    record.jsxtimestamp = (new Date()).getTime();
    /* @jsxobf-clobber */
    record.jsxdocument = objDocument;

    var evtAction = Cache.ADD;

    // check whether a document already exists in the cache
    var oldRecord = this._index[strId];
    if (oldRecord) {
      evtAction = Cache.CHANGE;
      this._cleanUpRecord(oldRecord);
    }

    //persist to cache
    this._index[strId] = record;

    this.publish({subject:strId, action:evtAction, id:strId});
    this.publish({subject:Cache.CHANGE, action:evtAction, id:strId});
  };

  /**
   * Returns the timestamp from when the document stored under id <code>strId</code> was stored in this cache.
   * @param strId {String} the id under which the document is stored.
   * @return {int} the timestamp as an integer (epoch seconds) or <code>null</code> if no such document exists
   *    in this cache.
   */
  Cache_prototype.getTimestamp = function(strId) {
    var record = this._index[strId];
    return record != null ? record.jsxtimestamp : null;
  };

  /**
   * Returns a list of all the keys in this cache instance.
   * @return {Array<String>}
   */
  Cache_prototype.keys = function() {
    var keys = [];
    for (var f in this._index)
      keys[keys.length] = f;
    return keys;
  };
  
  /**
   * Removes all references to documents contained in this cache. This cache is no longer usable after calling this
   * method.
   */
  Cache_prototype.destroy = function() {
    delete this._index;
    delete this._parents;
  };
  
});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.app.Cache
 * @see jsx3.app.Cache
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Cache", -, null, function(){});
 */
jsx3.Cache = jsx3.app.Cache;

/* @JSC :: end */
