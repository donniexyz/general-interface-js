/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Block");

/**
 * Renders an IFrame.
 *
 * @since 3.4
 */
jsx3.Class.defineClass("jsx3.gui.IFrame", jsx3.gui.Block, null, function(IFrame, IFrame_prototype) {

  /**
   * {int}
   * @final @jsxobf-final
   */
  IFrame.SCROLLYES = 1;

  /**
   * {int}
   * @final @jsxobf-final
   */
  IFrame.SCROLLNO = 2;

  /**
   * {int}
   * @final @jsxobf-final
   */
  IFrame.SCROLLAUTO = 3;

  /** @private @jsxobf-clobber */
  IFrame._SCROLL_MAP = {1: "yes", 2: "no", 3: "auto"};

  /**
   * Serializes this object to HTML.
   * @return {String}
   */
  IFrame_prototype.paint = function() {
    this.applyDynamicProperties();

    var src = this.getSrc();
    var id = this.getId();
    var name = this.getIFrameId();
    src = (src) ? ' src="' + this.getUriResolver().resolveURI(src) + '"' : '';

    return '<span id="' + id + '" class="jsx30iframe" style="' +
           this.paintVisibility() + this.paintDisplay() + this.paintCSSOverride() + '"' +
           this.renderAttributes() + '>' +
          '<iframe id="' + name + '" name="' + name + '" class="jsx30iframe" frameborder="0"' + src +
             this._paintScrolling() + this.renderHandler(jsx3.gui.Event.LOAD, '_ebLoad', 1) + '></iframe>' +
        '</span>';
  };

  /**
   * Returns the name attribute of the rendered IFRAME element.
   * @return {String}
   * @since 3.9
   */
  IFrame_prototype.getIFrameId = function() {
    return this.getId() + "_iframe";
  };

  /**
   * Returns the native iframe object of this iframe. Depending on browser security settings and the URL of this
   * iframe, the native iframe object may not be available. In this case, this method returns <code>null</code>.
   * @return {HTMLElement}
   */
  IFrame_prototype.getIFrame = function() {
    try {
      return this.eval(this.getIFrameId());
    } catch (e) {
      return null;
    }
  };

  /**
   * Returns the native document object of this iframe. Depending on browser security settings and the URL of this
   * iframe, the native document object may not be available. In this case, this method returns <code>null</code>.
   * @return {HTMLDocument}
   */
  IFrame_prototype.getContentDocument = function() {
    try {
      var iframe = this.getIFrame();
      if (iframe) {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
        return iframe.document;
/* @JSC */ } else {
        return iframe.contentDocument;
/* @JSC */ }
      }
    } catch (e) {;}

    return null;
  };

  /** @private @jsxobf-clobber */
  IFrame_prototype._ebLoad = function(objEvent, objGUI) {
    this.doEvent(jsx3.gui.Interactive.JSXLOAD, {objEVENT:objEvent});
  };

  /**
   * Returns the URI of this iframe.
   * @return {String}
   */
  IFrame_prototype.getSrc = function() { return this.jsxsrc; };

  /**
   * Sets the URI of this iframe. The URI can be absolute or relative from the content base of the server that
   * owns this object. If this iframe is rendered on screen, its location is updated immediately.
   * @param srcSrc {String}
   * @return {jsx3.gui.IFrame} this object.
   */
  IFrame_prototype.setSrc = function(srcSrc) {
    this.jsxsrc = srcSrc;
    if (srcSrc == null || srcSrc == "") srcSrc = "about:blank";

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    var doc = this.getContentDocument();
    if (doc)
      doc.location.href = this.getUriResolver().resolveURI(srcSrc).toString();
/* @JSC */ } else {
    var iframe = this.getIFrame();
    if (iframe && iframe.setAttribute)
      iframe.setAttribute("src", this.getUriResolver().resolveURI(srcSrc));
    else
      this.repaint();
/* @JSC */ }

    return this;
  };

  /**
   * Returns the scroll mode of this iframe.
   * @return {int}
   */
  IFrame_prototype.getScrolling = function() { return this.jsxscroll; };

  /**
   * Sets the scroll mode of this iframe.
   * @param intScrolling {int} one of <code>SCROLLYES</code>, <code>SCROLLNO</code>, or <code>SCROLLAUTO</code>.
   * @return {jsx3.gui.IFrame} this object.
   */
  IFrame_prototype.setScrolling = function(intScrolling) { this.jsxscroll = intScrolling; return this; };

  /** @private @jsxobf-clobber */
  IFrame_prototype._paintScrolling = function() {
    var strVal = IFrame._SCROLL_MAP[this.jsxscroll];
    return strVal ? ' scrolling="' + strVal + '"' : '';
  };

  // no children allowed
  IFrame_prototype.onSetChild = function(objChild) {
    return false;
  };

  IFrame_prototype.createBoxProfile = function(objImplicit) {
    return null;
  };

  IFrame_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
  };

});
