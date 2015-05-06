/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Paints a vector rectangle.
 */
jsx3.Class.defineClass("jsx3.vector.Rectangle", jsx3.vector.BaseShape, null, function(Rectangle, Rectangle_prototype) {

  /**
   * The instance initializer.
   * @param left {int} left position (in pixels) of the object relative to its parent container
   * @param top {int} top position (in pixels) of the object relative to its parent container
   * @param width {int} width (in pixels) of the object
   * @param height {int} height (in pixels) of the object
   */
  Rectangle_prototype.init = function(left, top, width, height) {
    //call constructor for super class
    this.jsxsuper("rect", left, top, width, height);
  };

  /**
   * Clips this rectangle to the bounds of <code>obj</code>.
   * @param obj {jsx3.gui.Block|jsx3.html.BlockTag} any object that has <code>getLeft()</code>, etc methods.
   */
  Rectangle_prototype.clipToBox = function( obj ) {
    this.clipTo(obj.getLeft(), obj.getTop(), obj.getWidth(), obj.getHeight());
  };
  
  /**
   * Clips this rectangle to the bounds of {l1, t1, w1, h1}.
   * @param l1 {int}
   * @param t1 {int}
   * @param w1 {int}
   * @param h1 {int}
   */
  Rectangle_prototype.clipTo = function( l1, t1, w1, h1 ) {
    var l = Math.max(this.getLeft(), l1);
    var t = Math.max(this.getTop(), t1);
    var w = Math.min(this.getWidth() - (l-this.getLeft()), l1 + w1 - l);
    var h = Math.min(this.getHeight() - (t-this.getTop()), t1 + h1 - t);
    
    // TODO: rectangle's stroke will not clip correctly
    this.setDimensions(l, t, w, h);
  };

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  Rectangle_prototype.paintUpdate = function() {
    this.jsxsuper();
    
    this.removeProperty("coordsize"); // only needed by v:group
  };

/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {

  Rectangle_prototype.getWidth = function() {
    var s = this.getProperty("width");
    return s != null ? parseInt(s) : null;
  };

  Rectangle_prototype.setWidth = function( width ) {
    this.setProperty("width", typeof(width) == "number" ? width + "px" : width);
  };

  Rectangle_prototype.getHeight = function() {
    var s = this.getProperty("height");
    return s != null ? parseInt(s) : null;
  };

  Rectangle_prototype.setHeight = function( height ) {
    this.setProperty("height", typeof(height) == "number" ? height + "px" : height);
  };
  
/* @JSC */ }
  
});
