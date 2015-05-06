/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Block");

/**
 * Renders an image. 
 *
 * @since 3.2
 */
jsx3.Class.defineClass("jsx3.gui.Image", jsx3.gui.Block, [], function(Image, Image_prototype) {

  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  Image_prototype.paint = function() {
    this.applyDynamicProperties();

    var b1 = this.getBoxProfile(true);
    var src = this.getUriResolver().resolveURI(this.jsxsrc);
    var width = this.getWidth() != null ? ' width="' + b1.getClientWidth() + '"' : "";
    var height = this.getHeight() != null ? ' height="' + b1.getClientHeight() + '"' : "";

    return this.jsxsuper('<img' + jsx3.html._UNSEL + ' class="jsx30image" src="' + src + '"' +
        width + height + this.paintTip() + this.paintText() + '/>');
  };

  Image_prototype.onSetChild = function(objChild) {
    return false;
  };

  Image_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 1);
  };

  /**
   * @return {int}
   */
  Image_prototype.getRenderedWidth = function() {
    var objGUI = this.getRendered();
    return objGUI && objGUI.childNodes[0] ? objGUI.childNodes[0].width : null;
  };

  /**
   * @return {int}
   */
  Image_prototype.getRenderedHeight = function() {
    var objGUI = this.getRendered();
    return objGUI && objGUI.childNodes[0] ? objGUI.childNodes[0].height : null;
  };

  /**
   * Returns the URI of this image.
   * @return {String}
   */
  Image_prototype.getSrc = function() { return this.jsxsrc; };

  /**
   * Sets the URI of this image. The URI can be absolute or relative from the content base of the server that
   * owns this object.
   * @param srcSrc {String}
   * @return {jsx3.gui.Image} this object
   */
  Image_prototype.setSrc = function(srcSrc) { this.jsxsrc = srcSrc; return this; };

  Image_prototype.paintText = function() {
    var myTip = this.getText();
    return myTip ? ' alt="' + myTip.replace(/"/g, "&quot;") + '" ' :  ' alt=""';
  };

});
