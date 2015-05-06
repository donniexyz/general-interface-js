/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Represents a grouping of vector shapes.
 */
jsx3.Class.defineClass("jsx3.vector.Group", jsx3.vector.Tag, null, function(Group, Group_prototype) {

  /**
   * The instance initializer.
   * @param left {int} left position (in pixels) of the object relative to its parent container
   * @param top {int} top position (in pixels) of the object relative to its parent container
   * @param width {int} width (in pixels) of the object
   * @param height {int} height (in pixels) of the object
   */
  Group_prototype.init = function(left, top, width, height) {
    //call constructor for super class
    this.jsxsuper(Group._TAGNAME, left, top, width, height);
  };
  
/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  Group._TAGNAME = "group";

/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {
  
  Group._TAGNAME = "g";

  Group_prototype.paintUpdate = function() {    
    this.jsxsuper();
    
    var l = this.getLeft() || Number(0);
    var t = this.getTop() || Number(0);
    if (l || t)
      this.setProperty("transform", "translate(" + l + "," + t + ")");
  };
  
/* @JSC */ }

  /**
   * veto anything that is not a valid vector group child
   * @package
   */
  Group_prototype.onAppendChild = function( child ) {
    return child instanceof Group || child instanceof jsx3.vector.BaseShape;
  };

});
