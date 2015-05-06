/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  setError

/**
 * Wrapper of the native browser XSLT processor.
 *
 * @since 3.4
 */
jsx3.Class.defineClass("jsx3.xml.Template", null, null, function(Template, Template_prototype) {

  /**
   * {int}
   * @package
   * @final @jsxobf-final
   */
  Template.DISABLE_OUTPUT_ESCAPING = 1;

  /** @private @jsxobf-clobber */
  Template._SUPPORTS = {};

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
  Template._SUPPORTS[Template.DISABLE_OUTPUT_ESCAPING] = true;
/* @JSC */ } else {
/* @JSC */ }

  /**
   * @param strKey {String}
   * @return {boolean}
   * @package
   */
  Template.supports = function(strKey) {
    return Template._SUPPORTS[strKey] || Boolean(0);
  };

  /**
   * The instance initializer.
   * @param objXSL {jsx3.xml.Document}
   * @throws {jsx3.Exception} if <code>objXSL</code> is not a valid XML document.
   */
  Template_prototype.init = function(objXSL) {
    if (objXSL.hasError())
      throw new jsx3.Exception(jsx3._msg("temp.init_err", objXSL.getError()));

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {

    if (objXSL.getBaseName() == "stylesheet") {
      try {
        // HACK: there is no way to remove a parameter from an IE template ... who writes their APIs?!?
        // so just cache the default values here so we can set them all explicitly when reset() is called
        /* @jsxobf-clobber */
        this._pdef = {};
        for (var i = objXSL.selectNodeIterator("/xsl:stylesheet/xsl:param"); i.hasNext(); ) {
          var n = i.next();
          this._pdef[n.getAttribute("name")] = n.getValue();
        }

        //create the template (compiled XSLT store that facilitates parameter passing, improved performance)
        var msXSLT = jsx3.getXslInstance();
        msXSLT.stylesheet = objXSL.getNativeDocument();
        /* @jsxobf-clobber */
        this._processor = msXSLT.createProcessor();
      } catch (e) {
        this.setError(200, jsx3._msg("temp.nat_err", jsx3.NativeError.wrap(e)));
      }
    } else {
      this.setError(201, jsx3._msg("temp.root_elm"));
    }

/* @JSC */ } else {

    if (objXSL.getBaseName() == "stylesheet") {
      try {
        /* @jsxobf-clobber */
        this._processor = new XSLTProcessor();
        this._processor.importStylesheet(objXSL.getNativeDocument());
      } catch (e) {
        this.setError(202, jsx3._msg("temp.nat_err", jsx3.NativeError.wrap(e)));
      }
    } else {
      this.setError(201, jsx3._msg("temp.root_elm"));
    }

    this._src = objXSL.getSourceURL();
/* @JSC */ }
  };

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {

  /**
   * @param strName {String}
   * @param objValue {Object}
   */
  Template_prototype.setParam = function(strName, objValue) {
    if (! this._params) this._params = new jsx3.util.List();
    if (this._params.indexOf(strName) < 0) this._params.add(strName);
    this._processor.addParameter(strName, objValue != null ? objValue.toString() : "");
  };

  /** @private @jsxobf-clobber */
  Template_prototype._transform = function(objXML, bObject) {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Template.jsxclass, (objXML instanceof jsx3.xml.Document ? objXML.getSourceURL() : "") + " => " + this);
/* @JSC :: end */

    this._processor.input = objXML instanceof jsx3.xml.Document ? objXML.getNativeDocument() : objXML.getNative();
    //transform and get the output
    this._processor.transform();
    var retVal = bObject ? (new jsx3.xml.Document()).loadXML(this._processor.output) : this._processor.output;

    // clean up, needed?
    this._processor.input = null;

/* @JSC :: begin BENCH */
    t1.log("transform");
/* @JSC :: end */
    return retVal;
  };

  /**
   *
   */
  Template_prototype.reset = function() {
    for (var f in this._pdef)
      this._processor.addParameter(f, this._pdef[f]);
  };

/* @JSC */ } else {

  Template_prototype.setParam = function(strName, objValue) {
    if (! this._params) this._params = new jsx3.util.List();
    if (this._params.indexOf(strName) < 0) this._params.add(strName);
    this._processor.setParameter("", strName, objValue != null ? objValue.toString() : "");
  };

  /** @private @jsxobf-clobber */
  Template_prototype._transform = function(objXML, bObject) {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Template.jsxclass, (objXML instanceof jsx3.xml.Document ? objXML.getSourceURL() : "") + " => " + this);
/* @JSC :: end */

    var nativeNode = objXML instanceof jsx3.xml.Document ? objXML.getNativeDocument() : objXML.getNative();
    var objDoc = this._processor.transformToDocument(nativeNode);

    var retVal = null;
    if (objDoc && objDoc.documentElement) {
      retVal = bObject ? new jsx3.xml.Document(objDoc) : (new XMLSerializer()).serializeToString(objDoc);
    } else {
      this.setError(203, jsx3._msg("temp.empty"));
    }

/* @JSC :: begin BENCH */
    t1.log("transform");
/* @JSC :: end */
    return retVal;
  };

  Template_prototype.reset = function() {
    if (this._params) {
      for (var i = this._params.iterator(); i.hasNext(); )
        this._processor.removeParameter("", i.next());
      this._params.clear();
    }
  };

/* @JSC */ }

  /**
   * @param objParams {Object<String,Object>} JavaScript object array of name/value pairs. If this parameter is
   *    not empty, the transformation will use a paramaterized stylesheet to perform the transformation.
   */
  Template_prototype.setParams = function(objParams) {
    for (var f in objParams)
      this.setParam(f, objParams[f]);
  };

  /**
   * Performs an XSLT merge. If an error occurs while performing the transform, this method sets the error
   * property of this processor and returns <code>null</code>.
   * @param objXML {jsx3.xml.Entity}
   * @param-private bObject {boolean}
   * @return {String} the result of the transformation
   */
  Template_prototype.transform = function(objXML, bObject) {
    if (this.hasError())
      throw new jsx3.Exception(jsx3._msg("temp.temp_err", this.getError()));
    if (objXML.hasError())
      throw new jsx3.Exception(jsx3._msg("temp.doc_err", objXML.getError()));

    try {
      return this._transform(objXML, bObject);
    } catch (e) {
      this.setError(204, jsx3._msg("temp.err", jsx3.NativeError.wrap(e)));
      return null;
    }
  };

  /**
   * Performs an XSLT merge. If an error occurs while performing the transform, this method sets the error
   * property of this processor and returns <code>null</code>.
   * @param objXML {jsx3.xml.Entity}
   * @return {jsx3.xml.Document} if a valid result tree is formed as a result of the transformation
   */
  Template_prototype.transformToObject = function(objXML) {
    return this.transform(objXML, true);
  };

  /**
   * Returns an error object (a plain JavaScript object) with two properties that the developer can query for:
   * <ul>
   * <li>code &#8211; an integer error code, 0 for no error.</li>
   * <li>description &#8211; a text description of the error that occurred.</li>
   * </ul>
   * @return {Object}
   * @jsxdoc-definition Template_prototype.getError = function() {}
   */

  /**
   * Returns <code>true</code> if the last operation on this XML entity caused an error.
   * @return {boolean}
   * @jsxdoc-definition Template_prototype.hasError = function() {}
   */

  Template_prototype.toString = function() {
    return this._src;
  };

});

jsx3.xml.Entity.jsxclass.mixin(jsx3.xml.Template.prototype, true, ["getError", "hasError", "setError"]);

/**
 * An extension of <code>jsx3.xml.Document</code> that encapsulates a compiled XSL template.
 */
jsx3.Class.defineClass("jsx3.xml.XslDocument", jsx3.xml.Document, null, function(XslDocument, XslDocument_prototype) {

  /**
   * @param strName {String}
   * @param objValue {Object}
   * @see jsx3.xml.Template#setParam()
   */
  XslDocument_prototype.setParam = function(strName, objValue) {
    this._getTemplate().setParam(strName, objValue);
  };

  /**
   * @param objParams {Object<String,Object>}
   * @see jsx3.xml.Template#setParams()
   */
  XslDocument_prototype.setParams = function(objParams) {
    this._getTemplate().setParams(objParams);
  };

  /**
   * @see jsx3.xml.Template#reset()
   */
  XslDocument_prototype.reset = function() {
    if (this._template) this._template.reset();
  };

  /**
   * @param objXML {jsx3.xml.Entity}
   * @see jsx3.xml.Template#transform()
   */
  XslDocument_prototype.transform = function(objXML) {
    return this._getTemplate().transform(objXML);
  };

  /**
   * @param objXML {jsx3.xml.Entity}
   * @see jsx3.xml.Template#transformToObject()
   */
  XslDocument_prototype.transformToObject = function(objXML) {
    return this._getTemplate().transformToObject(objXML);
  };

  /** @private @jsxobf-clobber */
  XslDocument_prototype._getTemplate = function() {
    if (this._template == null) {
      // will throw error if this has error
      /* @jsxobf-clobber */
      this._template = new jsx3.xml.Template(this);
      if (this._template.hasError())
        throw new jsx3.Exception(jsx3._msg("temp.parse", this.getSourceURL(), this._template.getError()));
    }
    return this._template;
  };

  XslDocument_prototype.load = function(strURL) {
    delete this._template;
    return this.jsxsuper(strURL);
  };

  XslDocument_prototype.loadXML = function(strXML) {
    delete this._template;
    return this.jsxsuper(strXML);
  };
  
  XslDocument_prototype.hasError = function() {
    return this.jsxsuper() || (this._template != null && this._template.hasError());
  };

  XslDocument_prototype.getError = function() {
    var objError = null;
    if (this._template) objError = this._template.getError();
    if (! objError) objError = this.jsxsuper();
    return objError;
  };

  /**
   * @param objXML {jsx3.xml.Document}
   * @return {jsx3.xml.XslDocument}
   */
  XslDocument.wrap = function(objXML) {
    return new XslDocument(objXML.getNativeDocument());
  };

  XslDocument_prototype.cloneDocument = function() {
    return XslDocument.wrap(this.jsxsuper());
  };

  XslDocument_prototype.isMutable = function() {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
   return this._template == null;
/* @JSC */ } else {
   return true;
/* @JSC */ }
  };

});

/* @JSC :: begin DEP */

/**
 * Wrapper of the native browser XSLT processor.
 * @deprecated  Use <code>jsx3.xml.Template</code> instead.
 * @see jsx3.xml.Template
 */
jsx3.Class.defineClass("jsx3.xml.Processor", null, null, function(Processor, Processor_prototype) {

  var Template = jsx3.xml.Template;

  Processor.DISABLE_OUTPUT_ESCAPING = 1;

  Processor.supports = function(strKey) {
    return Template.supports(strKey);
  };

  /**
   * The instance initializer.
   * @param objXML {jsx3.xml.Entity} the source document to transform
   * @param objXSL {jsx3.xml.Document} a valid XSL Stylesheet (version 1.0 of "http://www.w3.org/1999/XSL/Transform")
   * @param objParams {Object<String,String>} JavaScript associative array of name/value pairs. If this parameter
   *    if provided the transformation will use a paramaterized stylesheet to perform the transformation.
   */
  Processor_prototype.init = function(objXML, objXSL, objParams) {
    /* @jsxobf-clobber */
    this._xml = objXML;
    /* @jsxobf-clobber */
    this._xsl = objXSL;
    /* @jsxobf-clobber */
    this._params = objParams;
  };

  /**
   * Sets the XML that should be transformed.
   * @param objXML {jsx3.xml.Entity}
   * @return {Object} this object.
   */
  Processor_prototype.setXML = function(objXML) {
    this._xml = objXML;
    return this;
  };

  /**
   * Sets reference to XSL that should be transformed.
   * @param objXSL {jsx3.xml.Document} instance containing a valid XSL Stylesheet (version 1.0 of "http://www.w3.org/1999/XSL/Transform")
   * @return {jsx3.xml.Processor} reference to self
   */
  Processor_prototype.setXSL = function(objXSL) {
    this._xsl = objXSL;
    return this;
  };

  /**
   * Sets reference to Params that should be passed to the processor.
   * @param objParams {Object<String,String>} JavaScript object array of name/value pairs. If this parameter is
   *    not empty, the transformation will use a paramaterized stylesheet to perform the transformation.
   * @return {jsx3.xml.Processor} reference to self
   */
  Processor_prototype.setParams = function(objParams) {
    this._params = objParams;
    return this;
  };

  /**
   * Performs an XSLT merge. If an error occurs while performing the transform, this method sets the error
   * property of this processor and returns <code>null</code>.
   * @return {jsx3.xml.Document} if a valid result tree is formed as a result of the transformation
   */
  Processor_prototype.transformToObject = function() {
    return this.transform(true);
  };

  /**
   * Performs an XSLT merge. If an error occurs while performing the transform, this method sets the error
   * property of this processor and returns <code>null</code>.
   * @param-private bObject {Boolean} if true, a jsx3.xml.Document instance is returned (not the string)
   * @return {String} the result of the transformation
   */
  Processor_prototype.transform = function(bObject) {
    var t = new Template(this._xsl);
    if (! t.hasError()) {
      if (this._params)
        t.setParams(this._params);

      var retVal = t.transform(this._xml, bObject);
      if (! t.hasError())
        return retVal;
    }

    var e = t.getError();
    this.setError(e.code, e.description);
    return null;
  };

  /**
   * Returns an error object (a plain JavaScript object) with two properties that the developer can query for:
   * <ul>
   * <li>code &#8211; an integer error code, 0 for no error.</li>
   * <li>description &#8211; a text description of the error that occurred.</li>
   * </ul>
   * @return {Object}
   * @jsxdoc-definition Processor_prototype.getError = function() {}
   */

  /**
   * Returns <code>true</code> if the last operation on this XML entity caused an error.
   * @return {boolean}
   * @jsxdoc-definition Processor_prototype.hasError = function() {}
   */

});

jsx3.xml.Entity.jsxclass.mixin(jsx3.xml.Processor.prototype, true, ["getError", "hasError", "setError"]);

/* @JSC :: end */
