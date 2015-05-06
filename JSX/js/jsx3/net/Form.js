/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Provides support for legacy HTML GET and POST forms. Allows the submission of forms with arbitrary
 * key-value pairs as well as file upload.
 * <p/>
 * <b>Prompting the user for a file upload field (<code>promptForFile()</code>) is only supported in
 * Microsoft Internet Explorer.</b>
 *
 * @since 3.0
 */
jsx3.Class.defineClass("jsx3.net.Form", null, [jsx3.util.EventDispatcher], function(Form, Form_prototype) {

  var LOG = jsx3.util.Logger.getLogger(Form.jsxclass.getName());
  
  /** @private @jsxobf-clobber */
  Form.SERIAL = 0;
  /** @private @jsxobf-clobber */
  Form.DEFAULT_POLL = 250;
  /** @private @jsxobf-clobber */
  Form.DEFAULT_TIMEOUT = 30000;

  /**
   * {String}
   * @final @jsxobf-final
   */
  Form.METHOD_GET = "get";

  /**
   * {String}
   * @final @jsxobf-final
   */
  Form.METHOD_POST = "post";

  /** @private @jsxobf-clobber */
  Form.ENCTYPE_NORMAL = "application/x-www-form-urlencoded";
  /** @private @jsxobf-clobber */
  Form.ENCTYPE_MULTIPART = "multipart/form-data";

  /**
   * {String} Event type published when a file has been chosen through user interaction. The event has properties field and value.
   * @final @jsxobf-final
   */
  Form.EVENT_FILE_SELECTED = "file";

  /**
   * {String} Event type published when the response has loaded.
   * @final @jsxobf-final
   */
  Form.EVENT_ON_RESPONSE = "response";

  /**
   * {String} Event type published when a security error occurs trying to access the response.
   * @final @jsxobf-final
   */
  Form.EVENT_ON_ERROR = "error";

  /**
   * {String} Event type published when the response is still not ready after the specified timeout period.
   * @final @jsxobf-final
   */
  Form.EVENT_ON_TIMEOUT = "timeout";

  /**
   * instance initializer
   * @param strMethod {String} form method, METHOD_GET (default) or METHOD_POST
   * @param strAction {String} the URL to submit to
   * @param bMultipart {boolean} if true the form can support file upload
   */
  Form_prototype.init = function(strMethod, strAction, bMultipart) {
    /* @jsxobf-clobber */
    this._id = "jsx_httpform_" + (Form.SERIAL++);

    // overload this method, but in a private way
    if (strMethod == -1) {
      this.initIFrame(strAction);
    } else {
      this.initIFrame();
      this.setMethod(strMethod != null ? strMethod : Form.METHOD_GET);
      this.setAction(strAction);
      this.setMultipart(bMultipart);
    }
  };

  /**
   * Creates a new form and initialize it from the HTML representation of a form.
   * @param strFragment {String} the html fragment containing a <form/> tag.
   * @throws an error if the fragment was not well-formed or did not contain a form tag.
   * @return {jsx3.net.Form}
   */
  Form.newFromFragment = function(strFragment) {
    return new Form(-1, strFragment);
  };

  /**
   * Creates the invisible IFRAME that will contain the form and the response.
   * @private
   * @jsxobf-clobber
   */
  Form_prototype.initIFrame = function(strFormHtml) {
    var theForm = strFormHtml;
    if (! theForm)
      theForm = '<form method="get" action=""></form>';

    var docHTML = '<html><body class="jsx30form">' + theForm + '</body></html>';

    jsx3.html.insertAdjacentHTML(document.body, "beforeEnd", "<span id='" + this._id + 
        "_ispan' style='border:2px solid black;position:absolute;left:-50px;top:0px;width:10px;height:10px;overflow:hidden;'><iframe id='" +
        this._id + "_frame' style='width:100%;height:100%;'></iframe></span>");

    /* @jsxobf-clobber */
    this._span = document.getElementById(this._id + "_ispan");
    /* @jsxobf-clobber */
    this._iframe = this.eval(this._id + "_frame");

    // Mozilla HTML mode uses contentDocument instead of document
    var doc = this._iframe.document || this._iframe.contentDocument;

    if (doc == null)
      throw new jsx3.Exception(jsx3._msg("htfrm.no_ifr", this));

    doc.open();
    doc.write(docHTML);
    doc.close();

    this._form = doc.getElementsByTagName("form")[0];

    if (strFormHtml) {
      if (this._form == null)
        throw new jsx3.Exception(jsx3._msg("htfrm.bad_frag", strFormHtml));

      // cache these attributes of the form in this instance so that getters work
      if (!this._form.method)
        this._form.method = Form.METHOD_GET;

      this._action = this._form.action;
      this._method = this._form.method.toLowerCase();
      this._multipart = Boolean(this._form.encoding) &&
          this._form.encoding.toLowerCase() == Form.ENCTYPE_MULTIPART;
    }
  };

  /**
   * Returns the method of this form. 
   * @return {String} <code>METHOD_GET</code> or <code>METHOD_POST</code>.
   */
  Form_prototype.getMethod = function() {
    return this._method;
  };

  /**
   * Sets the method of this form.
   * @param method {String} <code>METHOD_GET</code> or <code>METHOD_POST</code>.
   */
  Form_prototype.setMethod = function( method ) {
    method = method != null ? method.toLowerCase() : Form.METHOD_GET;
    /* @jsxobf-clobber */
    this._method = method;
    this.getRenderedForm().setAttribute("method", method);
  };

  /**
   * Returns the action of this form, the URL that this form is submitted to.
   * @return {String} action
   */
  Form_prototype.getAction = function() {
    return this._action;
  };

  /**
   * Sets the action of this form.
   * @param action {String}
   */
  Form_prototype.setAction = function( action ) {
/* @JSC */ if (! jsx3.CLASS_LOADER.IE) {
    action = jsx3.app.Browser.getLocation().resolve(action).toString();
/* @JSC */ }
    /* @jsxobf-clobber */
    this._action = action;
    this.getRenderedForm().setAttribute("action", action);
  };

  /**
   * Returns whether this form is multipart. Only multipart forms may upload files.
   * @return {boolean}
   */
  Form_prototype.getMultipart = function() {
    return this._multipart;
  };

  /**
   * Sets whether this form is multipart.
   * @param multipart {boolean} 
   */
  Form_prototype.setMultipart = function( multipart ) {
    /* @jsxobf-clobber */
    this._multipart = multipart;
    this.getRenderedForm().setAttribute("encoding", multipart ?
        Form.ENCTYPE_MULTIPART : Form.ENCTYPE_NORMAL);
  };

  /** @private @jsxobf-clobber */
  Form_prototype.getRenderedSpan = function() {
    return this._span;
  };

  /** @private @jsxobf-clobber */
  Form_prototype.getRenderedIFrame = function() {
    return this._iframe;
  };

  /** @private @jsxobf-clobber */
  Form_prototype.getRenderedForm = function() {
    return this._form;
  };

  /**
   * Returns the value of a field in this form.
   * @param strName {String} the name of the form field to query.
   * @return {String} the field value or <code>null</code> if no such field exists.
   */
  Form_prototype.getField = function(strName) {
    var input = this.getRenderedForm().elements[strName];
    return (input != null && typeof(input) == "object") ? input.value : null;
  };

  /**
   * Returns the names of all fields in this form.
   * @return {Array<String>}
   */
  Form_prototype.getFields = function() {
    var names = [];
    var e = this.getRenderedForm().elements;
    for (var i = 0; i < e.length; i++) {
      names.push(e[i].name);
    }
    return names;
  };

  /**
   * Sets the value of a field in this form. Line breaks and whitespace are honored although any line breaks
   * will be converted to either <code>\r\n</code> or <code>\n</code> depending on the platform.
   * Setting the value to <code>null</code> will set it to the empty string.
   * 
   * @param strName {String} the name of the form field to set.
   * @param strValue {String} the new value of form field.
   * @param bConcat {boolean} if true, will append <code>" " + strValue</code> to the existing value. The space is
   *   only inserted if the existing value is not empty.
   */
  Form_prototype.setField = function(strName, strValue, bConcat) {
    var form = this.getRenderedForm();
    var input = form.elements[strName];

    if (input == null || typeof(input) != "object") {
      jsx3.html.insertAdjacentHTML(form, "beforeEnd", "<div>" + strName + ": <textarea name='" + strName + "'></textarea></div>");
      input = form.elements[strName];
    }

    if (strValue == null)
      strValue = "";

    if (bConcat && input.value) {
      input.value = input.value + " " + strValue;
    } else {
      input.value = strValue;
    }
  };

  /**
   * Removes a field from this form.
   * @param strName {String} the name of the form field to remove.
   */
  Form_prototype.removeField = function(strName) {
    var form = this.getRenderedForm();
    var input = form.elements[strName];
    if (input != null && input.parentNode)
      jsx3.html.removeNode(input.parentNode);
  };

  /**
   * Adds a file upload field to this form.
   * @param strName {String} the name of the new field.
   */
  Form_prototype.addFileUploadField = function(strName) {
    var form = this.getRenderedForm();
    var input = form.elements[strName];

    if (input == null || typeof(input) != "object") {
      jsx3.html.insertAdjacentHTML(form, "beforeEnd", "<div>" + strName + ": <input type='file' name='" + strName + "'/></div>");
      input = form.elements[strName];
      var me = this;
      input.onchange = function() {me.onFileFieldChanged(strName, input.value);};
    } else {
      throw new jsx3.Exception(jsx3._msg("htfrm.dup", this, strName));
    }
  };

  /**
   * Invokes the operating system file browser to choose a file for a file upload field. <b>This method is not
   * supported in browsers other than Microsoft Internet Explorer.</b>
   *
   * @param strFieldName {String} the name of the file upload field.
   */
  Form_prototype.promptForFile = function(strFieldName) {
    var form = this.getRenderedForm();
    var input = form.elements[strFieldName];

    if (input != null && input.type == "file") {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
      input.click();
/* @JSC */ } else {
      LOG.warn(jsx3._msg("htfrm.prompt"));
      input.click();
/* @JSC */ }
    } else {
      throw new jsx3.Exception(jsx3._msg("htfrm.no_file", this, strFieldName));
    }
  };

  /** @private @jsxobf-clobber */
  Form_prototype.onFileFieldChanged = function(strField, strValue) {
    this.publish({subject:Form.EVENT_FILE_SELECTED, field:strField, value:strValue});
  };

  /** @private @jsxobf-clobber */
  Form_prototype.onResponseLoad = function() {
    this._form = null;
    this.publish({subject:Form.EVENT_ON_RESPONSE});
  };

/* @JSC */ if (jsx3.CLASS_LOADER.IE || jsx3.CLASS_LOADER.SAF) {

  /**
   * Sends the form. Sending the form is always asynchronous. Once a form has been sent it may not be reused.
   * @param intPollInterval {int} milliseconds between checking for a response. If not provided, the default value is 1/4 sec.
   * @param intTimeout {int} total milliseconds before timeout. If not provided, the default value is 30 sec.
   */
  Form_prototype.send = function(intPollInterval, intTimeout) {
    if (intPollInterval == null) intPollInterval = Form.DEFAULT_POLL;
    if (intTimeout == null) intTimeout = Form.DEFAULT_TIMEOUT;

    var originalDoc = this._iframe.document;
    this._form.submit();

    var count = 0;
    var max = intTimeout <= 0 ? Number.MAX_VALUE : Math.ceil(intTimeout/intPollInterval);

    var me = this;
    /* @jsxobf-clobber */
    var tid = this._intervalId = window.setInterval(function() {
      try {
        var reloaded = (originalDoc !== me._iframe.document);
        me.responsePoll(++count < max, reloaded);
      } catch(e) {
        me.responsePoll(++count < max, true);
      }
    }, intPollInterval);
  };

  /* @jsxobf-clobber */
  Form_prototype.responsePoll = function(bContinue, bReloaded) {
    try {
      this._iframe.document.readyState == ""; // empty statement may trigger exception
    } catch (e) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
      this.onResponseError(jsx3._msg("htfrm.sec", this, jsx3.NativeError.wrap(e)));
      return;
    }

    if (bReloaded && (this._iframe.document.readyState == "complete" || this._iframe.document.readyState == "loaded")) {
//    if (this._iframe.contentDocument && (this._iframe.contentDocument.readyState == "complete" || this._iframe.contentDocument.readyState == "loaded")) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
      this.onResponseLoad();
    } else if (! bContinue) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
      this.destroy();
      this.publish({subject:Form.EVENT_ON_TIMEOUT});
    }
  };

  /** @private @jsxobf-clobber */
  Form_prototype.onResponseError = function(strMessage) {
    this._form = null;
    this.publish({subject:Form.EVENT_ON_ERROR, message:strMessage});
  };

  /**
   * Stops polling for a response.
   */
  Form_prototype.abort = function() {
    window.clearInterval(this._intervalId);
  };

  /**
   * Returns the content of the response as a string.
   * @return {String}
   */
  Form_prototype.getResponseText = function() {
    var dcmt = this._iframe.document;
    var docElm = dcmt ? dcmt.documentElement : null;

    //first check form invalid header info returned from the server (mimeType fails in these cases)
    if (docElm && docElm.textContent) {
      return docElm.textContent;
    } else if (dcmt.body && dcmt.body.childNodes[0]) {
      return dcmt.body.childNodes[0].innerHTML;
    }

    return null;
  };
  
  /**
   * Returns the content of the response as an XML document.
   * @return {jsx3.xml.Document}
   */
  Form_prototype.getResponseXML = function() {
    var dcmt = this._iframe.document;

    var doc = new jsx3.xml.Document();

    if (dcmt.XMLDocument && dcmt.XMLDocument.documentElement) {
      doc.loadXML(dcmt.XMLDocument.documentElement.xml);
    } else {
      var source = null;
      if (dcmt.documentElement) {
        source = window.XMLSerializer ? (new XMLSerializer()).serializeToString(dcmt) : dcmt.xml;
      } else if (dcmt.body) {
        source = dcmt.body.innerHTML;
      }

      doc.loadXML(source);

      if (doc.hasError()) {
        LOG.error(jsx3._msg("htfrm.bad_xml", doc.getError()));
        doc = null;
      }
    }

    return doc;
  };
  
/* @JSC */ } else {

  Form_prototype.send = function(intPollInterval, intTimeout) {
    if (intPollInterval == null) intPollInterval = Form.DEFAULT_POLL;
    if (intTimeout == null) intTimeout = Form.DEFAULT_TIMEOUT;

    var me = this;
    this._iframe.onload = function() { me._onIFrameLoad(); };

    try {
      this._form.submit();
    } catch (e) {
      this.onResponseError(jsx3.NativeError.wrap(e).toString());
      return;
    }

    /* @jsxobf-clobber */
    this._intervalId = window.setTimeout(function() {me.onIFrameTimeout();}, intTimeout);
  };

  Form_prototype.abort = function() {
    this._iframe.onload = null;
    window.clearTimeout(this._intervalId);
  };

  /** @private @jsxobf-clobber */
  Form_prototype.onResponseError = function(strMessage) {
    this._iframe.onload = null;
    window.clearTimeout(this._intervalId);
    this.publish({subject:Form.EVENT_ON_ERROR, message:strMessage});
  };

  /* @jsxobf-clobber */
  Form_prototype._onIFrameLoad = function() {
    this._iframe.onload = null;
    if (this._intervalId) {
      window.clearTimeout(this._intervalId);
      this._intervalId = null;
    }

    try {
      try {
        if (window.netscape && netscape.security && netscape.security.hasOwnProperty())
          netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');
      } catch (e) {
      }

      var dcmt = this._iframe.contentDocument;
      var a = " " + dcmt.childNodes[0];
    } catch (e) {
      this.publish({subject:Form.EVENT_ON_ERROR, message:jsx3.NativeError.wrap(e).toString()});
      return;
    }

    this.onResponseLoad();
  };

  /* @jsxobf-clobber */
  Form_prototype.onIFrameTimeout = function() {
    this._iframe.onload = null;
    this._intervalId = null;
    this.destroy();
    this.publish({subject:Form.EVENT_ON_TIMEOUT});
  };

  Form_prototype.getResponseText = function() {
    var dcmt = this._iframe.contentDocument;

    if (dcmt instanceof XMLDocument) {
      return (new XMLSerializer()).serializeToString(dcmt);
    } else if (dcmt instanceof HTMLDocument) {
      return dcmt.body.childNodes[0].innerHTML;
    } else {
      LOG.warn(jsx3._msg("htfrm.bad_dt", dcmt));
      return "";
    }
  };

  Form_prototype.getResponseXML = function() {
    var dcmt = this._iframe.contentDocument;

    var doc = new jsx3.xml.Document();

    if (dcmt instanceof XMLDocument) {
      doc.loadXML((new XMLSerializer()).serializeToString(dcmt));
    } else if (dcmt instanceof HTMLDocument) {
      doc.loadXML(jsx3.html.getOuterHTML(dcmt));
    } else {
      LOG.warn(jsx3._msg("htfrm.bad_dt", dcmt));
      doc = null;
    }

    if (doc.hasError()) {
      LOG.error(jsx3._msg("htfrm.bad_xml", doc.getError()));
      doc = null;
    }

    return doc;
  };

/* @JSC */ }
  
  /**
   * Destroys the form and the hidden IFRAME. This method should be called after receiving an onResponse, onError, or 
   * onTimeout event for proper garbage collection.
   */
  Form_prototype.destroy = function() {
    var span = this.getRenderedSpan();

    if (span != null) {
      jsx3.html.removeNode(span);
      this._span = null;
      this._iframe = null;
      this._form = null;
    } else {
      LOG.warn(jsx3._msg("htfrm.destr", this));
    }
  };
  
  /**
   * Reveals the IFRAME containing this form for debugging purposes. Dimensions of the revealed form may be provided
   * or a default position and dimensions will be used.
   * @param l {int} pixels from the left side of the HTML page that the IFRAME will be displayed.
   * @param t {int} pixels from the top of the HTML page that the IFRAME will be displayed.
   * @param w {int} width of the revealed IFRAME, in pixels.
   * @param h {int} height of the revealed IFRAME, in pixels.
   * @since 3.2
   * @see #conceal()
   */
  Form_prototype.reveal = function(l, t, w, h) {
    if (l == null) l = 10;
    if (t == null) t = 10;
    if (w == null) w = Math.round(this._span.parentNode.offsetWidth / 3);
    if (h == null) h = Math.round(this._span.parentNode.offsetHeight / 3);
    
    var style = this._span.style;
    style.left = l + "px";
    style.top = t + "px";
    style.width = w + "px";
    style.height = h + "px";
    style.zIndex = 30000;
  };

  /**
   * Hides the IFRAME containing this form after it has been shown by calling <code>reveal()</code>.
   * @since 3.2
   * @see #reveal()
   */
  Form_prototype.conceal = function() {
    var style = this._span.style;
    style.left = "-50px";
    style.top = "0px";
    style.width = "10px";
    style.height = "10px";
    style.zIndex = 0;
  };

  Form_prototype.toString = function() {
    return "@Form " + this.getAction();
  };

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.net.Form
 * @see jsx3.net.Form
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.HttpForm", -, null, function(){});
 */
jsx3.HttpForm = jsx3.net.Form;

/* @JSC :: end */
