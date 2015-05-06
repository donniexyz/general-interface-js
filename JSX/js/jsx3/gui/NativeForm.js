/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Block");

/**
 * The JSX version of a standard FORM element.
 *
 * @since 3.9
 */
jsx3.Class.defineClass("jsx3.gui.NativeForm", jsx3.gui.Block, null, function(NativeForm, NativeForm_prototype) {

  NativeForm.DEFAULTCLASSNAME = "jsx3nativeform";

  var LOG = jsx3.util.Logger.getLogger(NativeForm.jsxclass.getName());
  var Event = jsx3.gui.Event;

  /**
   * {string}
   * @final @jsxobf-final
   */
  NativeForm.GET = "get";
  
  /**
   * {string}
   * @final @jsxobf-final
   */
  NativeForm.POST = "post";
  
  /**
   * {int}
   * @final @jsxobf-final
   */
  NativeForm.IFRAME = 0;
  
  /**
   * {int}
   * @final @jsxobf-final
   */
  NativeForm.BLANK = 1;
  
  /**
   * {int}
   * @final @jsxobf-final
   */
  NativeForm.SELF = 2;

  /**
   * {int}
   * @final @jsxobf-final
   */
  NativeForm.TOP = 3;

  /** @private @jsxobf-clobber */
  NativeForm.TARGET_MAP = {1:"_blank",2:"_self",3:"_top"};

  /** @private @jsxobf-clobber */
  NativeForm.ENCTYPE_NORMAL = "application/x-www-form-urlencoded";
  /** @private @jsxobf-clobber */
  NativeForm.ENCTYPE_MULTIPART = "multipart/form-data";

  /**
   * Returns the method of this form. 
   * @return {String} <code>GET</code> or <code>POST</code>.
   */
  NativeForm_prototype.getMethod = function() {
    return this.jsxmethod;
  };

  /**
   * Sets the method of this form.
   * @param strMethod {String} <code>GET</code> or <code>POST</code>.
   */
  NativeForm_prototype.setMethod = function(strMethod) {
    strMethod = strMethod != null ? strMethod.toLowerCase() : NativeForm.GET;
    this.jsxmethod = strMethod;
    var objGUI = this._getRenderedForm();
    if (objGUI) objGUI.setAttribute("method", strMethod);
  };

  /**
   * Returns the action of this form, the URL that this form is submitted to.
   * @return {String} action
   */
  NativeForm_prototype.getAction = function() {
    return this.jsxaction;
  };

  /**
   * Sets the action of this form.
   * @param strAction {String}
   */
  NativeForm_prototype.setAction = function(strAction) {
    this.jsxaction = strAction;
    var objGUI = this._getRenderedForm();
    if (objGUI) objGUI.setAttribute("action", this.getUriResolver().resolveURI(strAction));
  };

  /**
   * Returns whether this form is multipart. Only multipart forms may upload files.
   * @return {boolean}
   */
  NativeForm_prototype.getMultipart = function() {
    return this.jsxmulti;
  };

  /**
   * Sets whether this form is multipart.
   * @param bMulti {boolean}
   */
  NativeForm_prototype.setMultipart = function(bMulti) {
    this.jsxmulti = bMulti;
    var objGUI = this._getRenderedForm();
    if (objGUI) objGUI.setAttribute("enctype", bMulti ? NativeForm.ENCTYPE_MULTIPART : NativeForm.ENCTYPE_NORMAL);
  };
  
  /**
   * Returns the target of this form.
   * @return {int} <code>IFRAME</code>, <code>BLANK</code>, <code>SELF</code> or <code>TOP</code>.
   */
  NativeForm_prototype.getTarget = function() {
    return this.jsxtarget;
  };

  /**
   * Sets the target of this form.
   * @param intTarget {int} <code>IFRAME</code>, <code>BLANK</code>, <code>SELF</code> or <code>TOP</code>.
   */
  NativeForm_prototype.setTarget = function(intTarget) {
    this.jsxtarget = intTarget;
    var objGUI = this._getRenderedForm();
    if (objGUI) objGUI.setAttribute("target", this._targetIntToString(intTarget));

    var iframe = this._getIframeElm();
    var bIframe = this._isIframe();

    if (iframe && !bIframe) {
      iframe.parentNode.removeChild(iframe);
    } else if (!iframe && bIframe) {
      jsx3.html.insertAdjacentHTML(objGUI, "beforeEnd", this._paintIframe());
    }
  };

  /**
   * Returns the <b>iframe</b> target.
   * @return {String}
   * @see #setIFrame()
   */
  NativeForm_prototype.getIFrame = function() {
    return this.jsxiframe;
  };

  /**
   * Sets the <code>iframe</code> target. The <code>iframe</code> target is the GI iframe that this form will target.
   * <code>strIframe</code> should be either the unique name of the target iframe in this application or a selection
   * expression that will uniquely select the target iframe in this application.
   *
   * @param strIframe {String} the new format.
   * @see jsx3.app.Model.selectDescendants()
   */
  NativeForm_prototype.setIFrame = function(strIframe) {
    this.jsxiframe = strIframe;
  };

  /**
   * Submits this form.
   */
  NativeForm_prototype.submit = function() {
    var objGUI = this._getRenderedForm();
    if (objGUI) {      
      this._ebSubmit();

      try {
        objGUI.submit();
      } catch (e) {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
        window.clearInterval(this._intervalId);
/* @JSC */ }        
        this.doEvent("jsxdata", {type:"error", message:jsx3.NativeError.wrap(e).toString()});
      }
    }
  };

  /**
   * Resets this form.
   */
  NativeForm_prototype.reset = function() {
    var objGUI = this._getRenderedForm();
    if (objGUI) objGUI.reset();
  };

  /** @private @jsxobf-clobber */
  NativeForm_prototype._getIframe = function() {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    try {
      return this.eval(this.getId() + "_iframe");
    } catch(e) {}
/* @JSC */ } else {
    return this._getIframeElm();
/* @JSC */ }
  };
  
  /** @private @jsxobf-clobber */
  NativeForm_prototype._getIframeElm = function() {
    return this.getDocument().getElementById(this.getId() + "_iframe");
  };

  /** @private @jsxobf-clobber */
  NativeForm_prototype._targetIntToString = function(intTarget) {
    var target;
    if (this.jsxiframe) {
      target = this._getNodeRefField(this.jsxiframe);
      if (target)
        target = target.getIFrameId();
    }

    return target || NativeForm.TARGET_MAP[intTarget] || this.getId() + "_iframe";
  };
  
  /** @private @jsxobf-clobber */
  NativeForm_prototype._getRenderedForm = function() {
    return this.getRendered();
  };

  /** @private @jsxobf-clobber */
  NativeForm_prototype._isIframe = function() {
    return this.jsxtarget == 0 || this.jsxtarget == null;
  };

  /** @private @jsxobf-clobber */
  NativeForm_prototype._paintIframe = function() {
    var id = this.getId() + '_iframe';
    return '<iframe id="' + id + '" name="' + id + '" src="about:blank"' +
        this.renderHandler(Event.LOAD, "_ebIframeLoad", 1) + '></iframe>';
  };

  /** @private @jsxobf-clobber */
  NativeForm_prototype._ebIframeLoad = function(objEvent, objGUI) {
    var iframe = this._getIframe();
    if (iframe && iframe.contentDocument && iframe.contentDocument.location.href != "about:blank") {
      this.doEvent("jsxdata", {type:"load"});
    }
  };

  /** @private @jsxobf-clobber */
  NativeForm_prototype._ebSubmit = function(objEvent, objGUI) {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
      var originalDoc = this._getIframe().document;

      /* @jsxobf-clobber */
      this._intervalId = window.setInterval(jsx3.$F(function() {
        try {
          var reloaded = (originalDoc !== this._getIframe().document);
          this._responsePoll(reloaded);
        } catch (e) {
          this._responsePoll(true);
        }
      }).bind(this), 250);
/* @JSC */ }
  };

  NativeForm_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 4);
  };

  NativeForm_prototype.createBoxProfile = function(objImplicit) {
    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if(this.getParent() && (objImplicit == null || ((isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if(objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //create outer box
    var bRelative = this.getRelativePosition() != 0;
    var pad, mar, bor;

    var intTop = (!bRelative && !jsx3.util.strEmpty(this.getTop())) ? this.getTop() : 0;
    var intLeft = (!bRelative && !jsx3.util.strEmpty(this.getLeft())) ? this.getLeft() : 0;
    if(objImplicit.left == null) objImplicit.left = 0;
    if(objImplicit.top == null) objImplicit.top = 0;
    if(objImplicit.width == null) objImplicit.width = "100%";
    if(objImplicit.height == null) objImplicit.height = "100%";
    objImplicit.tagname = "form";

    if (!objImplicit.boxtype) objImplicit.boxtype = bRelative ? "inline" : "box";

    return new jsx3.gui.Painted.Box(objImplicit);
  };

  NativeForm_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //initialize variables
    var strId = this.getId();

    var strProps = this.renderAttributes(null, true);

    var styles = this.paintFontName() + this.paintFontSize() + this.paintFontWeight() + this.paintVisibility() +
                   this.paintDisplay() + this.paintZIndex() + this.paintBackgroundColor() + this.paintBackground() +
                   this.paintColor() + this.paintTextAlign() + this.paintCSSOverride() + this.paintCursor();

    //generate and return final HTML
    var b1 = this.getBoxProfile(true);
    b1.setAttributes(' id="' + strId + '"' + this.renderHandler("submit", "_ebSubmit") +
        ' action="' + this.getUriResolver().resolveURI(this.jsxaction) + '" method="' + this.jsxmethod +
        '" enctype="' + (this.jsxmulti ? NativeForm.ENCTYPE_MULTIPART : NativeForm.ENCTYPE_NORMAL) +
        '" target="' + this._targetIntToString(this.jsxtarget) + '"' +
        this.paintIndex() + this.paintTip() + ' class="' + this.paintClassName() + '" ' + strProps);
    b1.setStyles(styles);

    return b1.paint().join((this._isIframe() ? this._paintIframe() : '') + this.paintChildren());
  };


/* @JSC */ if (jsx3.CLASS_LOADER.IE) {

  /* @jsxobf-clobber */
  NativeForm_prototype._responsePoll = function(bReloaded) {
    var iframe = this._getIframe();
    try {
      iframe.document.readyState == ""; // empty statement may trigger exception
    } catch (e) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
      this.doEvent("jsxdata", {type:"error"});
      return;
    }

    if (bReloaded && (iframe.document.readyState == "complete" || iframe.document.readyState == "loaded")) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
      this.doEvent("jsxdata", {type:"load"});
    }
  };

  /**
   * Returns the content of the response as a string.
   * @return {String}
   */
  NativeForm_prototype.getResponseText = function() {
    var iframe = this._getIframe();
    if (!iframe) return null;

    var dcmt = iframe.document;
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
  NativeForm_prototype.getResponseXML = function() {
    var iframe = this._getIframe();
    if (!iframe) return null;

    var dcmt = iframe.document;

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

  NativeForm_prototype.getResponseText = function() {
    var iframe = this._getIframe();
    if (!iframe) return null;

    try {
      if (window.netscape && netscape.security && netscape.security.hasOwnProperty())
        netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');
    } catch (e) {
    }

    var dcmt = iframe.contentDocument;

    if (dcmt instanceof HTMLDocument && dcmt.body && dcmt.body.childNodes[0]) {
      return dcmt.body.childNodes[0].innerHTML;
    } else if (dcmt.childNodes) {
      return (new XMLSerializer()).serializeToString(dcmt);
    } else {
      LOG.warn(jsx3._msg("htfrm.bad_dt", dcmt));
      return "";
    }
  };

  NativeForm_prototype.getResponseXML = function() {
    var iframe = this._getIframe();
    if (!iframe) return null;

    try {
      if (window.netscape && netscape.security && netscape.security.hasOwnProperty())
        netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');
    } catch (e) {
    }

    var dcmt = iframe.contentDocument;

    var doc = new jsx3.xml.Document();

    if (dcmt instanceof HTMLDocument) {
      doc.loadXML(jsx3.html.getOuterHTML(dcmt));
    } else if (dcmt.childNodes) {
      doc.loadXML((new XMLSerializer()).serializeToString(dcmt));
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

  NativeForm_prototype.paintClassName = function() {
    var cn = this.getClassName();
    return NativeForm.DEFAULTCLASSNAME + (cn ? " " + cn : "");
  };

});
