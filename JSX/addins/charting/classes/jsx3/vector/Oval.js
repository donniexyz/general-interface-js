/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Paints a vector oval bounded by the box defined by its left, top, width, and height.
 */
jsx3.Class.defineClass("jsx3.vector.Oval", jsx3.vector.BaseShape, null, function(Oval, Oval_prototype) {

  /**
   * The instance initializer.
   * @param left {int} left position (in pixels) of the object relative to its parent container
   * @param top {int} top position (in pixels) of the object relative to its parent container
   * @param width {int} width (in pixels) of the object
   * @param height {int} height (in pixels) of the object
   */
  Oval_prototype.init = function(left, top, width, height) {
    //call constructor for super class
    this.jsxsuper(Oval._TAGNAME, left, top, width, height);
  };

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {
  
  Oval._TAGNAME = "oval";

  Oval_prototype.paintUpdate = function() {
    this.jsxsuper();
    
    this.removeProperty("coordsize"); // only needed by v:group
  };

/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {

  Oval._TAGNAME = "ellipse";

  Oval_prototype.getLeft = function() {
    var s = this.getProperty("cx");
    return s != null ? parseInt(s) : null;
  };

  Oval_prototype.setLeft = function( left ) {
    this.setProperty("cx", typeof(left) == "number" ? left + "px" : left);
  };

  Oval_prototype.getTop = function() {
    var s = this.getProperty("cy");
    return s != null ? parseInt(s) : null;
  };

  Oval_prototype.setTop = function( top ) {
    this.setProperty("cy", typeof(top) == "number" ? top + "px" : top);
  };

  Oval_prototype.getWidth = function() {
    var s = this.getProperty("rx");
    return s != null ? 2 * parseInt(s) : null;
  };

  Oval_prototype.setWidth = function( width ) {
    this.setProperty("rx", width != null ? (parseFloat(width) / 2) + "px" : null);
  };

  Oval_prototype.getHeight = function() {
    var s = this.getProperty("ry");
    return s != null ? 2 * parseInt(s) : null;
  };

  Oval_prototype.setHeight = function( height ) {
    this.setProperty("ry", height != null ? (parseFloat(height) / 2) + "px" : null);
  };

  Oval_prototype.paintUpdate = function() {    
    this.jsxsuper();
    
    this.setProperty("transform", "translate(" + (this.getWidth()/2) + "," + (this.getHeight()/2) + ")");
  };
  
/* @JSC */ }
  
});
