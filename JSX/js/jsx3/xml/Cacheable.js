/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _replaceDocument

jsx3.require("jsx3.xml.Template", "jsx3.xml.CDF");

/**
 * A mixin interface that provides the following capabilities to implementing classes:
 * <ul>
 *   <li>fetching and caching of an XML document from an XML string, URL, or cache id</li>
 *   <li>fetching and caching of an XSL document from an XSL string, URL, or cache id</li>
 *   <li>transformation of the XML document by the XSL document</li>
 *   <li>XSL parameterization via setXSLParam/getXSLParams</li>
 *   <li>management of cached resources</li>
 * </ul>
 * A class that implement this interface should usually be a subclass of <code>jsx3.app.Model</code> since this
 * interface assumes that its instances have methods in that class (in particular <code>getId()</code> and
 * <code>getServer()</code>).
 * <p/>
 * As of version 3.2 using custom XSL templates for built-in GUI classes implementing this interface is deprecated.
 * Therefore, several methods related to storing per-instance XSL documents are deprecated.
 *
 * @since 3.1
 */
jsx3.Class.defineInterface("jsx3.xml.Cacheable", null, function(Cacheable, Cacheable_prototype) {

  var Document = jsx3.xml.Document;
  var CDF = jsx3.xml.CDF;
  
  var LOG = jsx3.util.Logger.getLogger(Cacheable.jsxclass.getName());
  
  /**
   * {String} JSX/xsl/xml.xsl
   */
  Cacheable.DEFAULTSTYLESHEET = jsx3.resolveURI("jsx:///xsl/xml.xsl");
  
/* @JSC :: begin DEP */

  /**
   * {String} JSX_XML_XSL
   * @deprecated
   */
  Cacheable.DEFAULTXSLCACHEID = "JSX_XML_XSL";

/* @JSC :: end */
  
  /**
   * {int} Value of the <code>shareResources</code> property for an object that removes its XML and XSL
   *   documents from the server XML cache when it is destroyed.
   * @final @jsxobf-final
   */
  Cacheable.CLEANUPRESOURCES = 0;
  
  /**
   * {int} Value of the <code>shareResources</code> property for an object that leaves its XML and XSL
   *   documents in the server XML cache when it is destroyed.
   * @final @jsxobf-final
   */
  Cacheable.SHARERESOURCES = 1;

  /**
   * typically called by the paint method for any JSX GUI object that gets its data via an XML feed. Can also be used to simply test the xml/xsl merge for an item, independent of painting its containing JSX object
   * @param objParams {Object<String, String>} JavaScript object array of name/value pairs; if passed, the transformation will use a
   *          paramaterized stylesheet to perform the transformation; Typically passed by the paint method owned by the jsx system
   * @return {String} DHTML; can be an empty string
   * @package
   */
  Cacheable_prototype.doTransform = function(objParams) {
    var objXML = this.getXML();
/* @JSC :: begin DEP */
    if (this.getNodeSet()) objXML = this.getNodeSet();
/* @JSC :: end */

    var objXSL = this.getXSL();

    // If either XSL or XML is in error state, just return an empty string. Message should already have been
    // sent to the logger.
    if (objXML.hasError() || objXSL.hasError()) return "";
    
    //if a parameter object wasn't passed, query for it internally (assuming it exists)
    if (!objParams)
      objParams = this.jsxxslparams || {};

    if (this.getSchema) {
      jsx3.$H(this.getSchema().getProps()).each(function(k, v) {
        objParams["attr" + k] = v;
      });
    }

    var strHTML = "";
    var p = null;

    if (objXSL instanceof jsx3.xml.XslDocument) {
      p = objXSL;
      p.reset();
    } else {
      p = new jsx3.xml.Template(objXSL);
    }

    if (! p.hasError()) {
      p.setParams(objParams);

      if (objXML.getNamespaceURI() == jsx3.app.Cache.XSDNS) {
        var objServer = this.getServer();
        p.setParam("jsxasyncmessage",
            objServer.getDynamicProperty("jsx3.xml.Cacheable." + objXML.getNodeName(),
                objParams.jsxtitle || objServer.getDynamicProperty("jsx3.xml.Cacheable.data")));
      }

      strHTML = p.transform(objXML);

      if (p.hasError()) {
        LOG.error(jsx3._msg("xml.err_trans", this, p.getError()));
        strHTML = "";
      }
    } else {
      LOG.error(jsx3._msg("xml.err_trans", this, p.getError()));
    }

    return strHTML;
  };

  /**
   * @package
   */
  Cacheable_prototype._removeFxWrapper = function(strXML) {
    return strXML.replace(/\s*<\/?JSX_FF_WELLFORMED_WRAPPER( [^>]*)?\/?>\s*/g,"");
  };

  /**
   * Returns a map containing all the parameters to pass to the XSL stylesheet during transformation.
   * @return {Object<String, String>}
   */
  Cacheable_prototype.getXSLParams = function() {
    //return the entire array of events bound to this object instance
    if (this.jsxxslparams == null) this.jsxxslparams = {};
    return this.jsxxslparams;
  };

  /**
   * Adds a name/value pair to the list of parameters to pass to the XSL stylesheet during transformation. If
   * <code>strValue</code> is <code>null</code> the parameter is removed.
   * @param strName {String} the name of the XSL parameter to add.
   * @param strValue {String} the value of the XSL parameter to add.
   * @return {jsx3.xml.Cacheable} this object.
   */
  Cacheable_prototype.setXSLParam = function(strName, strValue) {
    //add the new event object to the events array for the object
    if (strValue != null)
      this.getXSLParams()[strName] = strValue;
    else
      delete this.getXSLParams()[strName];

    return this;
  };

  /**
   * Removes a parameter from the list of parameters to pass to the XSL stylesheet during transformation.
   * @param strName {String} the name of the XSL parameter to remove.
   * @return {jsx3.xml.Cacheable} this object.
   */
  Cacheable_prototype.removeXSLParam = function(strName) {
    delete this.getXSLParams()[strName];
    return this;
  };

  /**
   * Removes all parameters from the list of parameters to pass to the XSL stylesheet during transformation.
   * @return {jsx3.xml.Cacheable} this object.
   */
  Cacheable_prototype.removeXSLParams = function() {
    //reset the events array, so this object doesn't have any
    delete this.jsxxslparams;
    return this;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the node set of this object.
   * @return {jsx3.xml.Entity}
   * @deprecated
   */
  Cacheable_prototype.getNodeSet = function() {
    return this._jsxnodeset;
  };

  /**
   * Sets the node set of this object. If the node set of this object is set by calling this method,
   * the default XSL transformation will use this node set instead of the return value of <code>getXML()</code> as
   * the XML document to transform.
   * @param objNodeSet {jsx3.xml.Entity}
   * @deprecated
   */
  Cacheable_prototype.setNodeSet = function(objNodeSet) {
    /* @jsxobf-clobber */
    this._jsxnodeset = objNodeSet;
  };

/* @JSC :: end */

  /**
   * Removes the XML and XSL source documents from the server cache.
   * @param objServer {jsx3.app.Server} the server owning the cache to modify. This is a required argument only if
   *    <code>this.getServer()</code> does not returns a server instance.
   */
  Cacheable_prototype.resetCacheData = function(objServer) {
    var cache = (objServer || this.getServer()).getCache();
    cache.clearById(this.getXSLId());
    cache.clearById(this.getXMLId());
  };
  
  /**
   * Removes the XML source document stored under the XML ID of this object from the server cache.
   * @param objServer {jsx3.app.Server} the server owning the cache to modify. This is a required argument only if
   *    <code>this.getServer()</code> does not returns a server instance.
   */
  Cacheable_prototype.resetXmlCacheData = function(objServer) {
    var cache = (objServer || this.getServer()).getCache();
    cache.clearById(this.getXMLId());
  };
  
  /**
   * Removes the XSL source document stored under the XSL ID of this object from the server cache.
   * @param objServer {jsx3.app.Server} the server owning the cache to modify. This is a required argument only if
   *    <code>this.getServer()</code> does not returns a server instance.
   * @deprecated  Per-instance control of the XSL template is deprecated. Consider using the XML transformers
   *    functionality instead.
   * @see #setXMLTransformers()
   */
  Cacheable_prototype.resetXslCacheData = function(objServer) {
    var cache = (objServer || this.getServer()).getCache();
    cache.clearById(this.getXSLId());
  };
  
  /**
   * Resets the XML source document stored in the server cache under the XML ID of this object to an empty CDF
   * document.
   * @see jsx3.xml.CDF#newDocument()
   */
  Cacheable_prototype.clearXmlData = function() {
    //persist the xml to the cache
    this.getServer().getCache().setDocument(this.getXMLId(), CDF.newDocument());
  };
  
  /**
   * Returns whether this object removes its XML and XSL source documents from the cache of its server when it
   * is destroyed.
   * @return {int} <code>CLEANUPRESOURCES</code> or <code>SHARERESOURCES</code>.
   */
  Cacheable_prototype.getShareResources = function() {
    return (this.jsxshare == null) ? Cacheable.CLEANUPRESOURCES : this.jsxshare;
  };

  /**
   * Sets whether this object removes its XML and XSL source documents from the cache of its server when it
   * is destroyed.
   * @param intShare {int} <code>CLEANUPRESOURCES</code> or <code>SHARERESOURCES</code>. <code>CLEANUPRESOURCES</code>
   *   is the default value if the property is <code>null</code>.
   * @return {jsx3.xml.Cacheable} this object.
   * @see #CLEANUPRESOURCES
   * @see #SHARERESOURCES
   */
  Cacheable_prototype.setShareResources = function(intShare) {
    this.jsxshare = intShare;
    return this;
  };

  /**
   * Returns the XML source document of this object. The XML document is determined by the following steps:
   * <ol>
   *   <li>If an XML document exists in the server cache under an ID equal to the XML ID of this object, that
   *     document is returned.</li>
   *   <li>If the XML string of this object is not empty, a new document is created by parsing this string.</li>
   *   <li>If the XML URL of this object is not empty, a new document is created by parsing the file at the location
   *     specified by the URL resolved against the server owning this object.</li>
   *   <li>Otherwise, an empty CDF document is returned.</li>
   * </ol>
   * If a new document is created for this object (any of the steps listed above except for the first one), the
   * following actions are also taken:
   * <ol>
   *   <li>If creating the document resulted in an error (XML parsing error, file not found error, etc) the offending
   *     document is returned immediately.</li>
   *   <li>Otherwise, <code>setSourceXML</code> is called on this object, passing in the created document.</li>
   * </ol>
   *
   * @see #setSourceXML()
   *
   * @return {jsx3.xml.Document}
   */
  Cacheable_prototype.getXML = function() {
    var server = this.getServer();
    if (server == null) return CDF.newDocument();
    
    // look internally for data (either an embedded string of XML or a URL reference)
    var objCache = server.getCache();
    var strId = this.getXMLId();
    var objXML = objCache.getDocument(strId);
    var bInCache = false;

    if (objXML == null) {
      var xmlString = this.getXMLString();
      //check if xml is an internal string or external ref
      if (! jsx3.util.strEmpty(xmlString)) {
        //xml contained internally as a string
        objXML = new Document();
        objXML.loadXML(xmlString);
      } else {
        var xmlUrl = this.getXMLURL();
        if (! jsx3.util.strEmpty(xmlUrl)) {
          xmlUrl = this.getUriResolver().resolveURI(xmlUrl);
          
          if (this.jsxxmlasync) {
            objXML = objCache.getOrOpenAsync(xmlUrl, strId);
            bInCache = true;
            this._registerForXML(0, objXML);
          } else {
            //xml located at given url (convert to absolute URI for portal and similar implementations)
            objXML = new Document().load(xmlUrl);
          }
        } else {
          //no string, no url, Just return an empty structure that will hold yet-to-be-added records
          objXML = CDF.newDocument();
        }
      }

      //check the jsxdocument instance for any parsing errors
      if (objXML.hasError()) {
        LOG.error(jsx3._msg("xml.err_load", this, objXML.getError()));
        return objXML;
      }

      objXML = this.setSourceXML(objXML, objCache, bInCache);
    }
    
    return objXML;
  };

  /**
   * Sets the source document of this object as though <code>objDoc</code> were retrieved from the XML URL or XML
   * string of this object. This method executes the following steps:
   * <ol>
   *   <li>The document is transformed serially by each XML transformers of this object.</li>
   *   <li>The XML document is saved in the server cache under the XML ID of this object.</li>
   *   <li>If this object is an instance of <code>jsx3.xml.CDF</code> and the root node is a &lt;data&gt; element
   *     and its <code>jsxassignids</code> attribute is equal to 1, all &lt;record&gt; elements without a
   *     <code>jsxid</code> attribute are assigned a unique jsxid.</li>
   *   <li>If this object is an instance of <code>jsx3.xml.CDF</code>, <code>convertProperties()</code> is called
   *     on this object.</li>
   * </ol>
   *
   * @param objDoc {jsx3.xml.Document}
   * @param-private objCache {jsx3.app.Cache}
   * @param-private bNoCache {boolean}
   * @return {jsx3.xml.Document} the document stored in the server cache as the data source of this object. If
   *   transformers were run, this value will not be equal to the <code>objDoc</code> parameter.
   * @see jsx3.xml.CDF
   * @see jsx3.xml.CDF#convertProperties()
   * @see #setXMLTransformers()
   */
  Cacheable_prototype.setSourceXML = function(objDoc, objCache, bNoCache) {
    if (!objCache) objCache = this.getServer().getCache();

    var objDocTrans = this._runTransformers(objDoc);
    var strId = this.getXMLId();

    // persist the xml to the cache
    if (!bNoCache)
      objCache.setDocument(strId, objDocTrans);
    else if (objDocTrans != objDoc)
      objCache._replaceDocument(strId, objDocTrans);

    this._convertProperties(objDocTrans);

    return objDocTrans;
  };

  /**
   * @private
   * @jsxobf-clobber
   */
  Cacheable_prototype._convertProperties = function(d) {
    if (this.instanceOf(CDF)) {
      if (!d._jsxconv) {
        /* @jsxobf-clobber */
        d._jsxconv = true;

        if (d.getNodeName() == "data" && d.getAttribute("jsxassignids") == "1")
          this.assignIds();
        this.convertProperties(this.getServer().getProperties());
      }
    }
  };

  /**
   * Returns the XML ID of this object.
   * @return {String} the XML ID.
   */
  Cacheable_prototype.getXMLId = function() {
    return this.jsxxmlid || (this.getId() + "_XML");
  };

  /**
   * Sets the XML ID of this object. This value is the key under which the XML source document of this object is
   * saved in the cache of the server owning this object. The developer may specify either a unique or shared value.
   * If no value is specified, a unique id is generated.
   * @param strXMLId {String}
   * @return {jsx3.xml.Cacheable} this object.
   * @see #getXML()
   */
  Cacheable_prototype.setXMLId = function(strXMLId) {
    this.jsxxmlid = strXMLId;
    return this;
  };

  /**
   * Returns the XML string of this object.
   * @return {String}
   * @see #getXML()
   */
  Cacheable_prototype.getXMLString = function() {
    return this.jsxxml;
  };

  /**
   * Sets the XML string of this object. Setting this value to the string serialization of an XML document is one
   * way of specifying the source XML document of this object.
   * @param strXML {String} <code>null</code> or a well-formed serialized XML element.
   * @return {jsx3.xml.Cacheable} this object.
   * @see #getXML()
   */
  Cacheable_prototype.setXMLString = function(strXML) {
    this.jsxxml = strXML;
    return this;
  };

  /**
   * Returns the XML URL of this object.
   * @return {String}
   */
  Cacheable_prototype.getXMLURL = function() {
    return this.jsxxmlurl;
  };

  /**
   * Sets the XML URL of this object. Settings this value to the URI of an XML document is one way of specifying the
   * source XML document of this object.
   * @param strXMLURL {String} <code>null</code> or a URI that when resolved against the server owning this object
   *   specifies a valid XML document.
   * @return {jsx3.xml.Cacheable} this object.
   * @see #getXML()
   */
  Cacheable_prototype.setXMLURL = function(strXMLURL) {
    this.jsxxmlurl = strXMLURL;
    return this;
  };

  /**
   * Returns whether the XML data source of this object is loaded asynchronously.
   * @return {int} <code>0</code> or <code>1</code>.
   * @since 3.5
   */
  Cacheable_prototype.getXmlAsync = function() {
    return this.jsxxmlasync;
  };

  /**
   * Sets whether the XML data source of this object is loaded asynchronously. This setting only applies to
   * data sources loaded from an XML URL.
   * @param bAsync {boolean}
   * @return {jsx3.xml.Cacheable} this object.
   * @since 3.5
   */
  Cacheable_prototype.setXmlAsync = function(bAsync) {
    this.jsxxmlasync = jsx3.Boolean.valueOf(bAsync);
    return this;
  };

  /**
   * Returns whether this object is bound to the XML document stored in the data cache.
   * @return {int} <code>0</code> or <code>1</code>.
   * @since 3.5
   */
  Cacheable_prototype.getXmlBind = function() {
    return this.jsxxmlbind;
  };

  /**
   * Sets whether this object is bound to the XML document stored in the data cache. If this object is bound to the
   * cache, then the <code>onXmlBinding()</code> method of this object is called any time the document stored in
   * the cache under the XML Id of this object changes.
   * @return {jsx3.xml.Cacheable} this object.
   * @since 3.5
   */
  Cacheable_prototype.setXmlBind = function(bBind) {
    this.jsxxmlbind = jsx3.Boolean.valueOf(bBind);
    this._registerForXML(this.jsxxmlbind);
    return this;
  };

  /**
   * This method is called in two situations:
   * <ol>
   *   <li>When the datasource of this object finishes loading (success, error, or timeout), if the
   *       <code>xmlAsync</code> property of this object is <code>true</code>, its datasource is specified as an
   *        XML URL, and the first time <code>doTransform()</code> was called the datasource was still loading.</li>
   *   <li>Any time the value stored in the server XML cache under the key equal to the XML Id of this object
   *       changes, if the <code>xmlBind</code> property of this object is <code>true</code>.</li>
   * </ol>
   * Any methods overriding this method should begin with a call to <code>jsxsupermix()</code>.
   *
   * @param objEvent {Object} the event published by the cache.
   * @since 3.5
   * @protected
   */
  Cacheable_prototype.onXmlBinding = function(objEvent) {
    var doc = objEvent.target.getDocument(objEvent.id);
    if (this.publish)
      this.publish({subject:"xmlbind", xml:doc});
  };

  /** @private @jsxobf-clobber */
  Cacheable_prototype._onXmlBinding = function(objEvent) {
    var bLoad = objEvent.action == "load";
    if ((this.jsxxmlbind && !bLoad) || (!this.jsxxmlbind && bLoad)) {
      var doc = objEvent.target.getDocument(objEvent.id);
      this._registerForXML(0, doc);

      if (bLoad)
        this.setSourceXML(doc, null, true);

      this.onXmlBinding(objEvent);
    }
  };

  /** @private @jsxobf-clobber */
  Cacheable_prototype._onCacheableServerChange = function(objNewServer, objOldServer) {
    var oldCache = objOldServer.getCache(), newCache = objNewServer.getCache();
    var xmlId = this.getXMLId(), xslId = this.getXSLId();

    //get the xml/xsl docs (if they exist) for the child
    var objXML = oldCache.getDocument(xmlId);
    var objXSL = oldCache.getDocument(xslId);

    //remove the docs from the former server
    if (this.getShareResources() != Cacheable.SHARERESOURCES)
      this.resetCacheData(objOldServer);

    //move the docs to the new server if possible/applicable
    if (objXML) newCache.setDocument(xmlId, objXML);
    if (objXSL) newCache.setDocument(xslId, objXSL);

    this._registerForXML(false, 0, objOldServer);
    this._registerForXML(this.jsxxmlbind, 0, objNewServer);
  };
  jsx3.app.Model.jsxclass.addMethodMixin("onChangeServer", Cacheable.jsxclass, "_onCacheableServerChange");

  /** @private @jsxobf-clobber */
  Cacheable_prototype._onCacheableAttach = function() {
    this._registerForXML(this.jsxxmlbind);
  };
  jsx3.app.Model.jsxclass.addMethodMixin("onAfterAttach", Cacheable.jsxclass, "_onCacheableAttach");

  /**
   * This method must be called by the <code>onDestroy()</code> method of classes implementing this interface. This
   * method removes source documents from the server cache if the <code>shareResources</code> property is equal to
   * <code>CLEANUPRESOURCES</code>.
   * @param objParent {jsx3.app.Model} the former parent DOM node.
   * @private
   * @jsxobf-clobber
   */
  Cacheable_prototype._onDestroyCached = function(objParent) {
    var objServer = objParent.getServer();

    this._registerForXML(false, 0, objServer);

    // based on user settings, remove resources in the cache referencd by this instance
    if (this.getShareResources() == Cacheable.CLEANUPRESOURCES)
      this.resetCacheData(objServer);

/* @JSC :: begin DEP */
    // remove any reference to a nodeset
    delete this._jsxnodeset;
/* @JSC :: end */
  };
  jsx3.app.Model.jsxclass.addMethodMixin("onDestroy", Cacheable.jsxclass, "_onDestroyCached");

  /** @private @jsxobf-clobber */
  Cacheable_prototype._registerForXML = function(bReg, objXML, objServer) {
    if (!objServer) objServer = this.getServer();

    if (objServer) {
      var objCache = objServer.getCache();
      var strId = this.getXMLId();
      var bBind = null;

      if (objXML) {
        if (! this.jsxxmlbind) {
          bBind = !objXML.hasError() &&
                  objXML.getNamespaceURI() == jsx3.app.Cache.XSDNS &&
                  objXML.getNodeName() == "loading";
        }
      } else {
        bBind = bReg;
      }

      if (bBind != null && Boolean(this._jsxxmlbound) != bBind) {
        if (bBind) {
          objCache.subscribe(strId, this, "_onXmlBinding");
          objCache.subscribe("load." + strId, this, "_onXmlBinding");
        } else {
          objCache.unsubscribe(strId, this);
          objCache.unsubscribe("load." + strId, this);
        }

        /* @jsxobf-clobber */
        this._jsxxmlbound = bBind;
      }
    }
  };

  /**
   * Returns the XSL source document of this object. The XSL document is determined by the following steps:
   * <ol>
   *   <li>If an XSL document exists in the server cache under an ID equal to the XSL ID of this object, that
   *     document is returned.</li>
   *   <li>(Deprecated) If the XSL string of this object is not <code>null</code>, a new document is created by parsing this string.</li>
   *   <li>(Deprecated) If the XSL URL of this object is not <code>null</code>, a new document is created by parsing the file at the location
   *     specified by the URL resolved against the server owning this object.</li>
   *   <li>Otherwise, the default stylesheet (<code>Cacheable.DEFAULTSTYLESHEET</code>) is returned.</li>
   * </ol>
   *
   * @return {jsx3.xml.Document} the XSL source document.
   */
  Cacheable_prototype.getXSL = function() {
    return this._getSharedXSL(Cacheable.DEFAULTSTYLESHEET);
  };

  /**
   * @package
   * @param strDefaultContent {String | jsx3.xml.Document}
   */
  Cacheable_prototype._getSharedXSL = function(strDefaultUrl, strDefaultContent) {
    var XslDocument = jsx3.xml.XslDocument;
    var strXSLId = this.getXSLId();
    var objCache = this.getServer().getCache();

    //look internally for data (either an embedded string of XSL or a URL reference)
    var objXSL = objCache.getDocument(strXSLId);
    if (objXSL == null) {
/* @JSC :: begin DEP */
      //check if xml is an internal string or external ref
      if (this.getXSLString() != null) {
        //xsl contained internally as a string
        objXSL = (new XslDocument()).loadXML(this.getXSLString());
      } else if (this.getXSLURL() != null) {
        //xsl located at given url
        objXSL = (new XslDocument()).load(this.getUriResolver().resolveURI(this.getXSLURL()));
      } else {
/* @JSC :: end */
        var sharedCache = jsx3.getSharedCache();
        if (strDefaultContent) {
          objXSL = sharedCache.getDocument(strDefaultUrl);
          if (!objXSL) {
            objXSL = typeof(strDefaultContent) == "string" ?
                (new XslDocument()).loadXML(strDefaultContent) : strDefaultContent;
            sharedCache.setDocument(strDefaultUrl, objXSL);
          }
        } else
          objXSL = sharedCache.getOrOpenDocument(strDefaultUrl, null, XslDocument.jsxclass);
/* @JSC :: begin DEP */
      }
/* @JSC :: end */

      //check the jsxdocument instance for any parsing errors
      if (objXSL.hasError()) {
        LOG.error(jsx3._msg("xml.err_load_xsl", this, objXSL.getError()));
        return objXSL;
      }

      //persist the xsl to the cache
      objCache.setDocument(strXSLId, objXSL);
    }

    return objXSL;
  };

  /**
   * Returns the XSL ID of this object.
   * @return {String}
   * @see #setXMLTransformers()
   */
  Cacheable_prototype.getXSLId = function() {
    var id = null;
/* @JSC :: begin DEP */
    id = this.jsxxslid;
/* @JSC :: end */
    return id || (this.getId() + "_XSL");
  };

/* @JSC :: begin DEP */

  /**
   * Sets the XSL ID of this object.
   * @param strXSLId {String}
   * @return {jsx3.xml.Cacheable} this object.
   * @deprecated  Per-instance control of the XSL template is deprecated. Consider using the XML transformers
   *    functionality instead.
   * @see #getXSL()
   * @see #setXMLTransformers()
   */
  Cacheable_prototype.setXSLId = function(strXSLId) {
    this.jsxxslid = strXSLId;
    return this;
  };

  /**
   * Returns the XSL string of this object.
   * @return {String}
   * @deprecated  Per-instance control of the XSL template is deprecated. Consider using the XML transformers
   *    functionality instead.
   * @see #setXMLTransformers()
   */
  Cacheable_prototype.getXSLString = function() {
    return this.jsxxsl;
  };

  /**
   * Sets the XSL string of this object.
   * @param strXSL {String}
   * @return {jsx3.xml.Cacheable} this object.
   * @deprecated  Per-instance control of the XSL template is deprecated. Consider using the XML transformers
   *    functionality instead.
   * @see #getXSL()
   * @see #setXMLTransformers()
   */
  Cacheable_prototype.setXSLString = function(strXSL) {
    this.jsxxsl = strXSL;
    return this;
  };

  /**
   * Returns the XSL URL of this object.
   * @return {String}
   * @deprecated  Per-instance control of the XSL template is deprecated. Consider using the XML transformers
   *    functionality instead.
   * @see #setXMLTransformers()
   */
  Cacheable_prototype.getXSLURL = function() {
    return this.jsxxslurl;
  };

  /**
   * Sets the XSL URL of this object.
   * @param strXSLURL {String}
   * @return {jsx3.xml.Cacheable} this object.
   * @deprecated  Per-instance control of the XSL template is deprecated. Consider using the XML transformers
   *    functionality instead.
   * @see #getXSL()
   * @see #setXMLTransformers()
   */
  Cacheable_prototype.setXSLURL = function(strXSLURL) {
    this.jsxxslurl = strXSLURL;
    return this;
  };

/* @JSC :: end */

  /**
   * Returns the list of XML transformers of this object.
   * @return {Array<String>}
   * @see #setXMLTransformers()
   * @since 3.2
   */
  Cacheable_prototype.getXMLTransformers = function() {
    return this.jsxxmltrans != null ? this.jsxxmltrans.split(/\s*,\s*/g) : [];
  };

  /**
   * Sets the list of XML transformers of this object. The XML source document of this object is transformed
   * serially by each of these transformers before it is placed in the XML cache.
   * <p/>
   * Each transformer is either the URI of an XSLT document (which will be resolved against the
   * the server of this object) or the cache id of a XSLT document in the XML cache of the server
   * of this object. When any transformer is loaded from a URI it is placed in the server cache under the id
   * equal to its resolved URI. Any transformer that does not correspond to a valid XSLT document will be skipped
   * without throwing an error.
   *
   * @param arrTrans {Array<String>}
   * @since 3.2
   */
  Cacheable_prototype.setXMLTransformers = function(arrTrans) {
    this.jsxxmltrans = arrTrans != null ? (jsx3.$A.is(arrTrans) ? arrTrans.join(",") : arrTrans) : null;
  };

  /**
   * Transforms <code>objXML</code> serially with each XML transformer of this object and returns the resulting
   * XML document.
   * @param objXML {jsx3.xml.Entity}
   * @return {jsx3.xml.Document}
   * @private
   * @jsxobf-clobber
   */
  Cacheable_prototype._runTransformers = function(objXML) {
    var trans = this.getXMLTransformers();
    if (trans.length > 0) {
      var server = this.getServer();
      var cache = server.getCache();
      var objXMLTrans = objXML;
      for (var i = 0; i < trans.length; i++) {
        var tran = trans[i];
        var objXSL = cache.getDocument(tran);
        if (objXSL == null) {
          // place each transformer XSLT in the server cache with an id equal to its URI
          tran = this.getUriResolver().resolveURI(tran);
          objXSL = cache.openDocument(tran, tran);
        }

        if (objXSL == null || objXSL.hasError()) {
          LOG.warn(jsx3._msg("xml.trans_bad", tran, this, objXSL.getError()));
          cache.clearById(tran);
          continue;
        }

        var t = new jsx3.xml.Template(objXSL);
        t.setParams(this.getXSLParams());
        objXMLTrans = t.transformToObject(objXMLTrans);

        if (t.hasError())
          throw new jsx3.Exception(jsx3._msg("xml.trans_err", tran, this, t.getError()));
        if (objXMLTrans.hasError())
          throw new jsx3.Exception(jsx3._msg("xml.trans_err", tran, this, objXMLTrans.getError()));
      }
      return objXMLTrans;
    } else {
      return objXML;
    }
  };

/* @JSC :: begin DEP */

  /**
   * gets the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Cacheable.getVersion = function() {
    return "3.00.00";
  };

/* @JSC :: end */

});

/* @JSC :: begin DEP */

/**
 * @deprecated  renamed to clearXmlData()
 *
 * @jsxdoc-definition  Cacheable.prototype.resetData = function(){}
 */
jsx3.xml.Cacheable.prototype.resetData = jsx3.xml.Cacheable.prototype.clearXmlData;

/* @JSC :: end */
