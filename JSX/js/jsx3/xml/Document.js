/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  setError _jsxselectionns _jsxselectionnsobj
// @jsxobf-clobber  _document _jsx_sn_hash

/**
 * Wrapper of the native browser XML document class. Developers wishing to create/modify XML documents should use
 * this class to access common XML parser methods (adding attributes and nodes, transformations, etc).
 * <p/>
 * When querying an instance of this class (with e.g. <code>selectSingleNode</code>, <code>selectNodes</code>,
 * <code>getChildNodes</code>, etc.), the node context will always be the root node (documentElement) and
 * <b>not</b> the parser instance (ownerDocument). Therefore, all queries are assumed to begin at the root, meaning
 * querying an instance of this class for the root node (assuming its name is "Price") would require a query such
 * as <code>"."</code> or <code>"/Price"</code>, not <code>"Price"</code>.
 * <p/>
 * Note that several methods of this class fail quietly when an error occurs with the wrapped native browser XML
 * classes. Methods that are documented as failing quietly should always be followed by a call to
 * <code>hasError()</code> to ensure that no error has occurred.
 *
 * @see #hasError()
 */
jsx3.Class.defineClass("jsx3.xml.Document", jsx3.xml.Entity, [jsx3.util.EventDispatcher], function(Document, Document_prototype) {

  var Entity = jsx3.xml.Entity;

  /**
   * {String} Event type published when an asynchronous load operation has completed successfully.
   * @final @jsxobf-final
   */
  Document.ON_RESPONSE = "response";

  /**
   * {String} Event type published when an error occurs during the asynchronous loading of a document.
   * @final @jsxobf-final
   */
  Document.ON_ERROR = "error";

  /**
   * {String} Event type published when an asynchronous load times out before loading.
   * @final @jsxobf-final
   */
  Document.ON_TIMEOUT = "timeout";

  /**
   * {String} Namespace to use when querying against the namespace axis in firefox
   * @final
   */
  Document.SEARCHABLE_NAMESPACE = "http://xsd.tns.tibco.com/gi/cxf/2006";

  /**
   * {String} Prefix to use when querying against the namespace axis in firefox
   * @final @jsxobf-final
   */
  Document.SEARCHABLE_PREFIX = "jsx_xmlns";

  /* @jsxobf-clobber */
  Document.SEARCHABLE_REGEXP = /xmlns:([^=]*)=['"]([^"^']*)['"]/g;

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
  try {
    // HACK: turns out that calling this once and then cloning the document is 3x faster on IE6
    /* @jsxobf-clobber */
    var p = Document._PROTO = jsx3.getXmlInstance();
    p.setProperty("SelectionLanguage", "XPath");
    p.async = false;
    p.validateOnParse = false;
    p.resolveExternals = false;
    p.preserveWhiteSpace = true;
    p.setProperty("ForcedResync", false); // Lets IE use cached version of file.
  } catch (e) {
    window.alert(jsx3.NativeError.wrap(e));
  }
/* @JSC */ }

  /**
   * The instance initializer. If an error occurs while instantiating the native browser XML document class,
   * this method sets the error property of this document and returns quietly.
   * @param-package objDoc {Object|jsx3.xml.Entity} if an <code>Entity</code> then clone the node as a new document.
   *     Otherwise, the native browser document object (optional).
   */
  Document_prototype.init = function(objDoc) {
    var bEnt = objDoc instanceof Entity;
    if (!objDoc || bEnt) {
      try {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
        if (Document._PROTO == null) {
          this.setError(100, jsx3._msg("xml.parser", null));
          return;
        }

        this._document = Document._PROTO.cloneNode(true);
        
        //3.2 update: as of the 4.0 version of the msxml parser, the following settings were defaulted to 'true' (as opposed to false for the 3.0 version).
        //this is being explicitly set to provide consistency
/* @JSC */ } else {
        //TODO: need to see if Safari has a setting or call to use here that won't create a document that defaults to the xhtml namespace (or the namespace of the browser document)
        this._document = window.document.implementation.createDocument("", "", null);
/* @JSC */ }
      } catch (e) {
        this.setError(101, jsx3._msg("xml.parser", jsx3.NativeError.wrap(e)));
        delete this._document;
      }

      if (objDoc) {
        this._document.appendChild(objDoc.getNative().cloneNode(true));
        this.jsxsuper(this._document.documentElement);
      }
    } else {
      this._document = objDoc;
      this.jsxsuper(objDoc.documentElement);
    }
  };

  /**
   * Loads an XML document at the URL specified by the <code>strURL</code> parameter. If an error occurs while
   * loading the XML document, this method sets the error property of this document and returns quietly. If this
   * document loads synchronously, the results of the load will be available immediately after the call to this
   * method. Otherwise, this document publishes events through the <code>EventDispatcher</code> interface to notify
   * the client that loading has completed.
   *
   * @param strURL {String|jsx3.net.URI} either a relative or absolute URL pointing to an XML document to load.
   * @param intTimeout {int} the number of milliseconds to wait before timing out. This parameter is only relevant
   *   if this document is loading XML asynchronously. A zero or <code>null</code> value will cause this operation
   *   to wait forever.
   * @return {jsx3.xml.Document} this object.
   * @see jsx3.util.EventDispatcher
   */
  Document_prototype.load = function(strURL, intTimeout) {
    var net = jsx3.net;
    var Request = net.Request;

    /* @jsxobf-clobber */
    this._url = strURL.toString();

    //reset error state (used by hasError)
    this.abort();

    //set whether or not the doc should load synchronously; if an error is thrown and mode is firefox, probably due to document.domain issue
    var bAsync = Boolean(this.getAsync());

    var req = Request.open("GET", strURL, bAsync);

    if (req.getStatus() != Request.STATUS_ERROR) {
      if (bAsync) {
        /* @jsxobf-clobber */
        this._req = req;
        req.subscribe("*", this, "_onRequestEvent");
      }

      req.send(null, intTimeout);
    } else if (bAsync) {
      jsx3.sleep(function() {
        this._initFromReq(req);
      }, null, this);
    }

    if (!bAsync)
      this._initFromReq(req);

    return this;
  };

  /**
   * If this is a document that is currently loading asynchronously, this method will abort the request. This method
   * also resets the error state of this document.
   * 
   * @since 3.9
   */
  Document_prototype.abort = function() {
    this.setError(0);
    if (this._req) {
      this._req.unsubscribe("*", this);
      this._req.abort();
      delete this._req;
    }
  };
  
  /** @private @jsxobf-clobber-shared */
  Document_prototype._initFromReq = function(objReq) {
    var url = this._url;
    this._initFromReq2(objReq);
    this._url = url;

    if (this.hasError())
      this.publish({subject:Document.ON_ERROR});
    else
      this.publish({subject:Document.ON_RESPONSE});
  };
  
  /** @private @jsxobf-clobber */
  Document_prototype._initFromReq2 = function(objReq) {
    var s = objReq.getStatus();
    var okStatus = s >= 200 && s < 400;

    //LUKE (3.6.2/3.7): the following is an attempt to determine if an XML document should even be loaded via getResponseXML
    //Since the document class now uses the request class to load content, missing documents are returned as XHTML 404 Web pages.
    //This causes a regression where an HTML document is returned instead of null. To bypass, the HTTP status and the content-type
    //can be used to better limit if an XML was actually located.  Since NOT returning a document is a restrictive
    //act, the conditional below attempts to load the document if any one of three conditions is met:
    // 1) running from the file system, 2) content-type contains the string, 'xml', or 3) the status code is 200-299

    var contentType = "";
    if (!okStatus) {
      try {
        contentType = objReq.getResponseHeader("content-type");
      } catch (e) {}
    }

    if (okStatus || jsx3.util.strEmpty(contentType) || /xml|xsl/i.test(contentType)) {
      this.loadXML(objReq.getResponseText());
    } else {
      //TODO: I want a different error message here
      this.setError(102, jsx3._msg("xml.doc_status", this._url, s));
    }
  };
  
  /** @private @jsxobf-clobber */
  Document_prototype._onRequestEvent = function(objEvent) {
    var Request = jsx3.net.Request;
    var req = objEvent.target;
    var strSubject = objEvent.subject;

    delete this._req;
    req.unsubscribe("*", this);
    
    if (strSubject == Request.EVENT_ON_RESPONSE) {
      this._initFromReq(req);
    } else if (strSubject == Request.EVENT_ON_TIMEOUT) {
      this.setError(111, jsx3._msg("xml.timeout"));
      this.publish({subject:Document.ON_TIMEOUT});      
    } else {
      Document._log();
    }
  };

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {

  /* @jsxobf-clobber */
  Document_prototype._initEntity = function(objElm) {
    Entity.prototype.init.call(this, objElm);

    var ns = [];
    var attr = this.getAttributeNames();
    for (var i = 0; i < attr.length; i++) {
      var a = attr[i];
      if (a.indexOf("xmlns:") == 0)
        ns[ns.length] = a + '="' + this.getAttribute(a) + '"';
    }
    this.setSelectionNamespaces(ns.join(" "));
  };
  
  /**
   * Loads an XML document from a string containing the XML source. If an error occurs while
   * loading the XML document, this method sets the error property of this document and returns quietly. Loading
   * an XML document from a string always happens synchronously regardless of the value of the <code>async</code>
   * property of this document.
   *
   * @param strXML {String} an XML document as string. Note that if this document contains an encoding attribute in
   *    its initial declaration (such as encoding="UTF-8") it must correspond to the encoding of the actual string,
   *    <code>strXML</code>. If, for example, <code>strXML</code> is in unicode format, explicitly passing the UTF-8
   *    encoding attribute will cause the load to fail, as the byte order will cause the parser to look for the
   *    UTF-16 attribute.
   * @return {jsx3.xml.Document} this object.
   */
  Document_prototype.loadXML = function(strXML) {
    this._url = null;
    this.setError(0);

    try {
/* @JSC :: begin BENCH */
      var t1 = new jsx3.util.Timer(Document.jsxclass, strXML != null ? jsx3.util.strTruncate(strXML, 30) : "", 5);
/* @JSC :: end */

      this._document.loadXML(strXML);

      if (! this._setErrorFromParser(this._document))
        this._initEntity(this._document.documentElement);

/* @JSC :: begin BENCH */
      t1.log("parse");
/* @JSC :: end */
    } catch (e) {
      this._setErrorFromParser(this._document, jsx3.NativeError.wrap(e));
    }
    return this;
  };

/* @JSC */ } else if (jsx3.CLASS_LOADER.SAF) {

  /* @jsxobf-clobber */
  Document_prototype._initEntity = function(objElm) {
    Entity.prototype.init.call(this, objElm);
  };

  Document_prototype.loadXML = function(strXML) {
    this._url = null;
    this.setError(0);

    try {
/* @JSC :: begin BENCH */
      var t1 = new jsx3.util.Timer(Document.jsxclass, strXML != null ? jsx3.util.strTruncate(strXML, 30) : "", 5);
/* @JSC :: end */

      this._document = (new DOMParser()).parseFromString(strXML, "text/xml");

      if (! this._setErrorFromParser(this._document))
        this._initEntity(this._document.documentElement);

/* @JSC :: begin BENCH */
      t1.log("parse");
/* @JSC :: end */
    } catch (e) {
      this._setErrorFromParser(this._document, jsx3.NativeError.wrap(e));
    }

    return this;
  };

/* @JSC */ } else if (jsx3.CLASS_LOADER.FX) {

  /* @jsxobf-clobber */
  Document_prototype._initEntity = function(objElm) {
    Entity.prototype.init.call(this, objElm);
  };

  Document_prototype.loadXML = function(strXML) {
    this._url = null;
    this.abort();

    try {
/* @JSC :: begin BENCH */
      var t1 = new jsx3.util.Timer(Document.jsxclass, strXML != null ? jsx3.util.strTruncate(strXML, 30) : "", 5);
/* @JSC :: end */

      this._document = (new DOMParser()).parseFromString(strXML, "text/xml");

      if (! this._setErrorFromParser(this._document))
        this._initEntity(this._document.documentElement);

/* @JSC :: begin BENCH */
      t1.log("parse");
/* @JSC :: end */
    } catch (e) {
      this._setErrorFromParser(this._document, jsx3.NativeError.wrap(e));
    }

    return this;
  };

/* @JSC */ }

  /**
   * @return {String}
   * @since 3.2
   */
  Document_prototype.getSourceURL = function() {
    return this._url;
  };

  /** @private @jsxobf-clobber */
  Document_prototype._setErrorFromParser = function(parser, ex) {
    if (parser != null) {
      // QUESTION: I have no idea if this applies to Fx
      var parseError = parser.parseError;
      if (parseError != null && parseError.errorCode != "0") {
        var strMessage = jsx3._msg("xml.err_fmt", parseError.errorCode, parseError.line, parseError.linepos,
            jsx3.util.strTrim(String(parseError.reason)), jsx3.util.strTruncate(parseError.srcText), parseError.url);
        this.setError(parseError.errorCode, strMessage);
        return true;
      }
/* @JSC */ if (jsx3.CLASS_LOADER.SAF) {
      var docElement = parser.documentElement;
      if (docElement == null) {
        if (ex)
          this.setError(156, jsx3._msg("xml.doc_bad_ex", ex));
        else
          this.setError(106, jsx3._msg("xml.doc_bad"));
        return true;
      } else {
        var xpe = new XPathEvaluator();
        var nsr = jsx3.CLASS_LOADER.GOG ?
                xpe.createNSResolver((new DOMParser()).parseFromString('<x xmlns:x="http://www.w3.org/1999/xhtml"/>', "text/xml")) :
                function(prefix) {
                  if (prefix == "x") return "http://www.w3.org/1999/xhtml";
                  return null;
                };

        var objResult = xpe.evaluate("//x:parsererror//x:div", parser, nsr);
        var descNode = objResult.iterateNext();
        if (descNode) {
          this.setError(107, descNode.textContent.replace(/[\n\r]/g, " "));
          return true;
        }
      }
/* @JSC */ } else if (! jsx3.CLASS_LOADER.IE) {
      var docElement = parser.documentElement;
      if (docElement == null) {
        if (ex)
          this.setError(158, jsx3._msg("xml.doc_bad_ex", ex));
        else
          this.setError(108, jsx3._msg("xml.doc_bad"));
        return true;
      } else if (docElement.tagName == "parsererror" && docElement.namespaceURI &&
          docElement.namespaceURI.match(/^http:\/\/www\.mozilla\.org\/(.+\/)?parsererror.xml/i)) {
        this.setError(109, docElement.textContent.replace(/[\n\r]/g, " "));
        return true;
      }
/* @JSC */ }
    }

    if (ex != null) {
      this.setError(110, jsx3._msg("xml.unknown", jsx3.NativeError.wrap(ex)));
      return true;
    }

    return false;
  };

/* @JSC :: begin DEP */

  /**
   * Returns whether or not the parser should validate the XML content during the initial parse. The default setting is false;
   * @return {Boolean}
   * @since 3.2
   * @deprecated  IE-only.
   */
  Document_prototype.getValidateOnParse = function() {
    //TO DO: validate the analagous method for fx
    return this._document.validateOnParse;
  };

  /**
   * Sets whether or not the parser should validate the XML content during the initial parse.
   * @param bValidate {Boolean}
   * @since 3.2
   * @deprecated  IE-only.
   */
  Document_prototype.setValidateOnParse = function(bValidate) {
    this._document.validateOnParse = bValidate;
  };

  /**
   * Returns whether or not the parser should resolve externally referenced entities. The default setting is false;
   * @return {Boolean}
   * @since 3.2
   * @deprecated  IE-only.
   */
  Document_prototype.getResolveExternals = function() {
    //TO DO: validate the analagous method for fx
    return this._document.resolveExternals;
  };

  /**
   * Sets whether or not the parser should resolve externally referenced entities.
   * @param bResolve {Boolean}
   * @since 3.2
   * @deprecated  IE-only.
   */
  Document_prototype.setResolveExternals = function(bResolve) {
    this._document.resolveExternals = bResolve;
  };

/* @JSC :: end */

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {

  Document_prototype.toString = function() {
    if (this._document != null && !this.hasError()) {
      var s = this._document.xml;
      // HACK: remove trailing line break to match Fx behavior
      if (s.charCodeAt(s.length - 1) == 10 && s.charCodeAt(s.length - 2) == 13)
        s = s.substring(0, s.length - 2);
      return s;
    } else {
      return this.jsxsuper();
    }
  };

  /**
   * @deprecated Removed from DOM4
   * @return {String}
   */
  Document_prototype.getXmlVersion = function() {
    return this._getXmlDeclAttr("version");
  };

  /**
   * @deprecated Removed from DOM4
   * @return {String}
   */
  Document_prototype.getXmlEncoding = function() {
    return this._getXmlDeclAttr("encoding");
  };

  /**
   * @deprecated Removed from DOM4
   * @return {boolean}
   */
  Document_prototype.getXmlStandalone = function() {
    return this._getXmlDeclAttr("standalone") == "yes";
  };

  /* @jsxobf-clobber */
  Document_prototype._getXmlDeclAttr = function(strAttr) {
    var pi = this._document.childNodes[0];
    if (pi.nodeType == 7 && pi.nodeName == "xml") {
      var regexp = new RegExp("\\b" + strAttr + '="(.*?)"', "i");
      if (pi.nodeValue.match(regexp))
        return RegExp.$1;
    }
    return null;
  };

  /**
   * Creates a new node that is an exact clone of this node; returns the newly cloned node wrapped in a jsx3.xml.Entity instance
   * @return {jsx3.xml.Document} newly cloned MSXML Node object wrapped in a jsx3.xml.Document instance
   */
  Document_prototype.cloneDocument = function() {
    return new Document(this._document.cloneNode(true));
  };

/* @JSC */ } else if (jsx3.CLASS_LOADER.SAF) {

  Document_prototype.cloneDocument = function() {
    var clone = new Document();
    clone.loadXML(this.getXML());
    return clone;
  };

/* @JSC */ } else {

  Document_prototype.cloneDocument = function() {
    try {
     if (window.netscape && netscape.security && netscape.security.hasOwnProperty())
      netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    } catch (e) {;}

    //I cannot track down why a synchronously loaded xsl doc with document.domain set in fx is throwing error
    try {
      var objDoc = new Document(this._document.cloneNode(true));
    } catch(e) {
      var objDoc = new Document();
      objDoc.loadXML(this.getXML());
    }
    return objDoc;
  };

/* @JSC */ }

/* @JSC */ if (! jsx3.CLASS_LOADER.IE) {

  Document_prototype.toString = function() {
    if (this._document != null && !this.hasError()) {
      return (new XMLSerializer()).serializeToString(this._document);
    } else {
      return this.jsxsuper();
    }
  };

  Document_prototype.getXmlVersion = function() {
    return this._document.xmlVersion;
  };

  Document_prototype.getXmlEncoding = function() {
    return this._document.xmlEncoding;
  };

  Document_prototype.getXmlStandalone = function() {
    return this._document.xmlStandalone;
  };

/* @JSC */ }

  /**
   * @param strVersion {boolean|String}
   * @param strEncoding {boolean|String}
   * @param bStandalone {boolean}
   */
  Document_prototype.serialize = function(strVersion, strEncoding, bStandalone) {
    if (strVersion === true) strVersion = this.getXmlVersion() || "1.0";
    if (strEncoding === true) strEncoding = this.getXmlEncoding() || "UTF-8";

    var clobberPI = strVersion || strEncoding || bStandalone;

    if (clobberPI) {
      var pi = '<?xml';
      if (strVersion) pi += ' version="' + strVersion + '"';
      if (strEncoding) pi += ' encoding="' + strEncoding + '"';
      if (bStandalone != null) pi += ' standalone="' + (bStandalone ? "yes" : "no") + '"';
      pi += '?>\n';

      var tokens = new Array(this._document.childNodes.length + 1);
      tokens[0] = pi;

      for (var i = 0; i < this._document.childNodes.length; i++) {
        var node = this._document.childNodes[i];
        if (node.nodeType != 7 || node.nodeName != "xml") {
          var wrapped = new Entity(node);
          tokens[i+1] = wrapped.hasError() ? "<!-- " + wrapped + " -->" : wrapped.toString();
        }
      }
    } else {
      var tokens = new Array(this._document.childNodes.length);

      for (var i = 0; i < this._document.childNodes.length; i++) {
        var node = this._document.childNodes[i];
        var wrapped = new Entity(node);
        tokens[i] = wrapped.hasError() ? "<!-- " + wrapped + " -->" : wrapped.toString();
        if (node.nodeType == 7 || node.nodeName == "xml")
          tokens[i] += "\n";
      }
    }

    return tokens.join("");
  };

  /**
   * Creates a new root node on an empty document.
   * <p>Usage:</p>
   * <pre>
   * var objDoc = new jsx3.xml.Document();
   * objDoc.createDocumentElement("myRoot");
   * </pre>
   * @param strNodeName {String} node name for the root node
   * @param strNSURI {String} namespace (optional). For example, "http:/someURN.com/". Note that if this parameter is used, @strNodeName can be optionally prefixed (i.e., abc:myRoot) to create an explicit namespace prefix.
   * @return {jsx3.xml.Entity} reference to the new node wrapped in a jsx3.xml.Entity instance
   */
  Document_prototype.createDocumentElement = function(strNodeName, strNSURI) {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    if (strNSURI) {
      var objRoot = this._document.createNode(jsx3.xml.Entity.TYPEELEMENT,strNodeName,strNSURI);
    } else {
      var objRoot = this._document.createElement(strNodeName);
    }
/* @JSC */ } else {
    // NOTE: see http://bugs.webkit.org/show_bug.cgi?id=14835
    if (strNSURI == null) strNSURI = null;
    var objRoot = this._document.createElementNS(strNSURI, strNodeName);
/* @JSC */ }

    if (this._document.documentElement != null)
      this._document.replaceChild(objRoot, this._document.documentElement);
    else
      this._document.appendChild(objRoot);

    //bind expected references to the root node as the jsx3.xml.Document class implements the methods of the jsx3.xml.Entity class, meaning all methods that one can expect from the jsx3.xml.Entity class should apply to this class as well
    this._initEntity(this._document.documentElement);

    //return wrapped node
    return (new jsx3.xml.Entity(objRoot));
  };

  /**
   * Creates a processing instruction node that containing the target and data information. Note that you cannot specify a namespace with this method.
   * <p>Usage:</p>
   * <pre>
   * [document].createProcessingInstruction("xml","version=\"1.0\" encoding=\"UTF-8\"");
   * [document].createDocumentElement("myRoot");
   * </pre>
   * @param strTarget {String} String that specifies the target part of the processing instruction. This supplies the nodeName property of the new object.
   * @param strData   {String} String that specifies the rest of the processing instruction preceding the closing ?> characters. This supplies the nodeValue property for the new object.
   */
  Document_prototype.createProcessingInstruction = function(strTarget, strData) {
    // TODO: Mozilla
    //create, append, and wrap
    var objRoot = this._document.createProcessingInstruction(strTarget, strData);
    this._document.appendChild(objRoot);
  };

  /**
   * Sets whether this document loads asynchronously. The default is to load synchronously. If this document loads
   * asynchronously, it publishes the events <code>ON_RESPONSE</code>, <code>ON_ERROR</code>, and
   * <code>ON_TIMEOUT</code> to notify the client that loading has finished.
   *
   * @param bAsync {boolean} if <code>true</code> the document loads asynchronously.
   * @return {jsx3.xml.Document} this object.
   * @see #ON_RESPONSE
   * @see #ON_ERROR
   * @see #ON_TIMEOUT
   */
  Document_prototype.setAsync = function(bAsync) {
    /* @jsxobf-clobber */
    this._jsxasync = bAsync;
    return this;
  };

  /**
   * Returns whether this document loads asynchronously.
   * @return {boolean}
   */
  Document_prototype.getAsync = function(strName) {
    return Boolean(this._jsxasync);
  };

/* @JSC :: begin DEP */
  
  /**
   * Sets the selection language to use for selection queries (i.e., selectSingleNode/selectNodes); The default is XSLPattern;
   * @param strLanguage {String} one of the strings: <code>XSLPattern</code>, <code>XPath</code>
   * @return {jsx3.xml.Document} reference to this
   * @deprecated  This method is only implemented on Internet Explorer. <code>XPath</code> is the only supported value.
   */
  Document_prototype.setSelectionLanguage = function(strLanguage) {
    return this;
  };

  /**
   * Gets the selection language to use for selection queries (i.e., selectSingleNode/selectNodes); The default is XSLPattern;
   * @return {String}
   * @deprecated  This method is only implemented on Internet Explorer. <code>XPath</code> is the only supported value.
   */
  Document_prototype.getSelectionLanguage = function() {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    return this._document.getProperty("SelectionLanguage");
/* @JSC */ } else {
    return "XPath";
/* @JSC */ }
  };

/* @JSC :: end */
  
  /**
   * returns a string of the namespaces map appropriately formatted for input into <code>setSelectionNamespaces</code>.
   * @param map {Object} should follow the format: {some_uri:"jsx1",some_other_uri,"jsx2"}
   * @return {String} will adhere to the format: "xmlns:jsx1='some_uri' xmlns:jsx2='some_other_uri'"
   * @private
   * @jsxobf-clobber-shared
   */
  Document.serializeNamespacesMap = function(map) {
    var a = [];
    for (var p in map)
      a[a.length] = "xmlns:" + map[p] + "='" + p + "'";
    return a.join(" ");
  };

  /**
   * Sets a list of namespace prefixes and their associated URIs. This allows any code to generically prefix name-space qualified nodes and still get the correct selection result
   * @param declaration {Object | String} Relevant selection namespace(s) in Object format. For example: <code>{some_uri:"jsx1",some_other_uri,"jsx2"}</code>
   *                              or in String format. For example: <code>"xmlns:jsx1='some_uri' xmlns:jsx2='some_other_uri'"</code>
   * @return {jsx3.xml.Document} reference to this
   */
  Document_prototype.setSelectionNamespaces = function(declaration) {
    //convert object to string (per IE format constraints)
    if(typeof(declaration) == "object") declaration = Document.serializeNamespacesMap(declaration);

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    try {
      this._document.setProperty("SelectionNamespaces", declaration);
    } catch (e) {
      this.setError(113, jsx3._msg("xml.selns", declaration, jsx3.NativeError.wrap(e)));
    }
/* @JSC */ } else {
    this._document._jsxselectionns = declaration;
    this._document._jsxselectionnsobj = null;
/* @JSC */ }
    return this;
  };

  /**
   * Gets a list of namespace prefixes and their associated URIs. This allows any code to generically prefix name-space qualified nodes and still get the correct selection result
   * @return {String}
   */
  Document_prototype.getSelectionNamespaces = function(strName) {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    return this._document.getProperty("SelectionNamespaces");
/* @JSC */ } else {
    //3.2 fix: updated signature to return empty string in FF as would be returned in IE
    return (this._document._jsxselectionns) ? this._document._jsxselectionns : "";
/* @JSC */ }
  };

  /**
   * The Firefox implementation of the XSLT specification does not implement a searchable <b>namespace</b> axis. To overcome this limitation,
   * this method can be called to create a searchable equivalent that is part of the <b>attribute</b> axis. After XML content has been loaded, call this method before
   * calling any other methods on the Document instance in order to ensure proper functioning of subsequent calls. The document
   * can then be queried, using valid XPath syntax to discover the declared namespaces. However, instead of using <b>namespace::xsd</b>, the
   * relevant query would be <b>attribute::jsx_xmlns:xsd</b>, where jsx_xmlns:xsd would resolve to the
   * universal name, <b>{http://xsd.tns.tibco.com/gi/cxf/2006}:xsd</b>. Following this call with <code>getDeclaredNamespaces</code>
   * is useful to resolve the prefix actually used, providing a reverse-lookup to resolve the actual prefix being used.
   * For example, assume <b>objMap</b> is the return object when calling getDeclaredNamespaces. In such a case, the following
   * query can be used to locate the URI for a given namespace prefix, even though Firefox does not support such a construct:
   *
   * <p/>
   * <pre>
   * var objMap = someDoc.getDeclaredNamespaces();
   * var myXpathQuery = "ancestor-or-self::*[attribute::" +
   *   objMap[jsx3.xml.Document.SEARCHABLE_NAMESPACE] +  ":xsd]/attribute::" +
   *   objMap[jsx3.xml.Document.SEARCHABLE_NAMESPACE] + ":xsd";
   * var objNode = someNode.selectSingleNode(myXpathQuery,objMap);
   * </pre>
   *
   * @return {String} prefix used to represent the xmlns.  By default the return will be <b>jsx_xmlns</b>. However, if this prefix is
   * already being used by the document instance (i.e., <code>xmlns:jsx_xmlns="?"</code>), the prefix will be
   * incremented as follows: jsx_xmlns0, jsx_xmlns1, jsx_xmlns2, etc, until a unique prefix is found.
   * @see getDeclaredNamespaces
   */
  Document_prototype.createNamespaceAxis = function() {
    var objNode = this.getRootNode();
    var strXML = objNode.toString();
    var intIncr = "";
    do {
      var re = new RegExp("xmlns:" + Document.SEARCHABLE_PREFIX + intIncr + "([^=]*)=['\"]([^\"^']*)['\"]","g");
      var intPos = strXML.search(re);
      if(intPos >= 0) intIncr = (intIncr == "") ? 0 : intIncr + 1;
    } while(intPos >= 0);

    this._createNamespaceAxis(objNode,Document.SEARCHABLE_PREFIX + intIncr);

/* @JSC */ if (! jsx3.CLASS_LOADER.IE) {
    //how to add a new namespace???? reparse to commit...
    this.loadXML(this.getXML());
/* @JSC */ }

    return Document.SEARCHABLE_PREFIX + intIncr;
  };

  /** @private @jsxobf-clobber */
  Document_prototype._createNamespaceAxis = function(objElement,strPre) {
    //get the entity as string without descendants
    var strXML = objElement.cloneNode(false).getXML();

    //parse out all instances of the 'namespace' (xmlns) axis, and create a searchable equivalent belonging to the 'attribute' namespace
    var myArr;
    while(myArr = Document.SEARCHABLE_REGEXP.exec(strXML)) {
      if(RegExp.$1 != strPre && RegExp.$1 != "xml") {
        var objAtt = objElement.createNode( jsx3.xml.Entity.TYPEATTRIBUTE, (strPre + ":" + RegExp.$1), Document.SEARCHABLE_NAMESPACE);
        objAtt.setValue(RegExp.$2);
        objElement.setAttributeNode(objAtt);
      } else if( RegExp.$1 == "xml") {
        jsx3.log(strXML);
      }
    }

    //recurse to locate other xmlns declarations among descendant elements
    for (var i = objElement.getChildIterator(); i.hasNext(); )
      this._createNamespaceAxis(i.next(), strPre);
  };

  /**
   * Returns a map of all implemented namespaces in the following format: {some_uri:"jsx1",some_other_uri,"jsx2",another_uri:"jsx3"}.
   * <br/>
   * The returned object map can then be used to resolve the qualified name (QName) for the nodes in a given query via a reverse lookup.
   * For example:
   * <pre>
   *
   * //open an XML Document (just use one of the sample prototypes that ships with Builder)
   * var objXML = new jsx3.xml.Document();
   * objXML.load("GI_Builder/prototypes/Block/Text.xml");
   *
   * //get an object map of all known selection namespaces
   * var objMap = objXML.getDeclaredNamespaces();
   *
   * //construct a qualified query (Note that all nodes in a GI serialization file belong to the namespace, 'urn:tibco.com/v3.0')
   * var myQualifiedQuery = "//" + objMap["urn:tibco.com/v3.0"] + ":object";
   *
   * //query the document for the given node.
   * var objNode = objXML.selectSingleNode(myQualifiedQuery,objMap);
   *
   * //alert the return
   * alert(objNode);
   *
   * </pre>
   * @param objMap {Object} Optional. should follow the format <code>{prefix1:1,prefix2:1}</code>. If passed, the returned Object will resolve to any matched prefix, while using arbitrary sequential prefixes (jsx1, jsx2, etc) for all other uris.
   * @return {Object}
   */
  Document_prototype.getDeclaredNamespaces = function(objMap) {
    //reset the hash
    this._jsx_sn_hash = {};

    //get the root (start point)
    var objNode = this.getRootNode();
    if(objNode) this._getDeclaredNamespaces(objNode,{index:0},objMap);

    //return the final map (user can use to resolve namespaces with--effectively creates a QName)
    return this._jsx_sn_hash;
  };

  /**
   * Recurses to locate all known namespaces to derive the namespace map
   * @param objNode {jsx3.xml.Entity}
   * @param oCounter {Object}
   * @private
   * @jsxobf-clobber
   */
  Document_prototype._getDeclaredNamespaces = function(objNode,oCounter,objMap) {
    //add a new namespace if unique
    var sQ = objNode.getNamespaceURI();
    if(sQ != "" && sQ != "http://www.w3.org/XML/1998/namespace") {
      var mypfx;
      if(!this._jsx_sn_hash[sQ] || (objMap && (mypfx = objNode.getPrefix()) != "" && typeof(objMap[mypfx]) != "undefined")) {
        if(mypfx) {
          this._jsx_sn_hash[sQ] = mypfx;
        } else {
          oCounter.index += 1;
          this._jsx_sn_hash[sQ] = "jsx" + oCounter.index;
        }
      }
    }

    //recurse if objNode is an element
    if (objNode.getNodeType() == jsx3.xml.Entity.TYPEELEMENT) {
      for (var i = objNode.selectNodeIterator("attribute::* | child::*"); i.hasNext(); ) {
        var objChild = i.next();
        if (objChild.getNodeType() == jsx3.xml.Entity.TYPEELEMENT ||
            objChild.getNodeType() == jsx3.xml.Entity.TYPEATTRIBUTE)
          this._getDeclaredNamespaces(objChild, oCounter, objMap);
      }
    }
  };

  /**
   * Returns the native XML parser
   * @return {Object}
   */
  Document_prototype.getNativeDocument = function() {
    //returns the xml parser instance
    return this._document;
  };

  /** @private @jsxobf-clobber */
  Document._log = function(intLevel, strMessage) {
    if (Document._LOG == null) {
      if (jsx3.util.Logger) {
        /* @jsxobf-clobber */
        Document._LOG = jsx3.util.Logger.getLogger(Document.jsxclass.getName());
        if (Document._LOG == null) return;
      } else {
        return;
      }
    }
    Document._LOG.log(intLevel, strMessage);
  };

/* @JSC :: begin DEP */

  /**
   * gets the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Document.getVersion = function() {
    return "3.0.0";
  };

/* @JSC :: end */

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.xml.Document
 * @see jsx3.xml.Document
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Document", -, null, function(){});
 */
jsx3.Document = jsx3.xml.Document;

/* @JSC :: end */
