/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * A more efficient way of painting many vector lines of the same color and thickness.
 */
jsx3.Class.defineClass("jsx3.vector.LineGroup", jsx3.vector.Shape, null, function(LineGroup, LineGroup_prototype) {

  /**
   * The instance initializer.
   * @param left {int} left position (in pixels) of the object relative to its parent container
   * @param top {int} top position (in pixels) of the object relative to its parent container
   * @param width {int} width (in pixels) of the object
   * @param height {int} height (in pixels) of the object
   */
  LineGroup_prototype.init = function(left, top, width, height) {
    //call constructor for super class
    this.jsxsuper(null, left, top, width, height);
  };

  /**
   * add a line to the group
   * @param x1 {int} the x-coordinate of the start point of the line
   * @param y1 {int} the y-coordinate of the start point of the line
   * @param x2 {int} the x-coordinate of the end point of the line
   * @param y2 {int} the y-coordinate of the end point of the line
   */
  LineGroup_prototype.addLine = function( x1, y1, x2, y2 ) {
    this.pathMoveTo(x1, y1).pathLineTo(x2, y2);
  };

  /**
   * add a line to the group
   * @param x1 {int} the x-coordinate of the start point of the line
   * @param y1 {int} the y-coordinate of the start point of the line
   * @param dx {int} the horizontal change from the start to the end point of the line
   * @param dy {int} the vertical change from the start to the end point of the line
   */
  LineGroup_prototype.addRelativeLine = function( x1, y1, dx, dy ) {
    this.pathMoveTo(x1, y1).pathLineTo(dx, dy, true);
  };

  /**
   * clear all lines out of the group
   */
  LineGroup_prototype.clearLines = function() {
    this.setPath("");
  };

});
