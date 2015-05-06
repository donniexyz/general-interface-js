/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * A more efficient way of painting many vector rectangles of the same fill and stroke.
 */
jsx3.Class.defineClass("jsx3.vector.RectangleGroup", jsx3.vector.Shape, null, function(RectangleGroup, RectangleGroup_prototype) {

  /**
   * The instance initializer.
   * @param left {int} left position (in pixels) of the object relative to its parent container
   * @param top {int} top position (in pixels) of the object relative to its parent container
   * @param width {int} width (in pixels) of the object
   * @param height {int} height (in pixels) of the object
   */
  RectangleGroup_prototype.init = function(left, top, width, height) {
    //call constructor for super class
    this.jsxsuper(null, left, top, width, height);
  };

  /**
   * add a rectangle to this group
   * @param x1 {int} the x-coordinate of the left edge of the rectangle
   * @param y1 {int} the y-coordinate of the top edge of the rectangle
   * @param x2 {int} the x-coordinate of the right edge of the rectangle
   * @param y2 {int} the y-coordinate of the bottom edge of the rectangle
   */
  RectangleGroup_prototype.addRectangle = function( x1, y1, x2, y2 ) {
    this.pathMoveTo(x1, y1).pathLineTo(x2, y1).pathLineTo(x2, y2).pathLineTo(x1, y2).pathClose();
  };

  /**
   * add a rectangle to this group
   * @param x1 {int} the x-coordinate of the left edge of the rectangle
   * @param y1 {int} the y-coordinate of the top edge of the rectangle
   * @param w {int} the width of the rectangle
   * @param h {int} the height of the rectangle
   */
  RectangleGroup_prototype.addRelativeRectangle = function( x1, y1, w, h ) {
    this.pathMoveTo(x1, y1).pathLineTo(w, 0, true).pathLineTo(0, h, true).pathLineTo((-1 * w), 0, true).pathClose();
  };

  /**
   * clear all rectangles out of the group
   */
  RectangleGroup_prototype.clearRectangles = function() {
    this.setPath("");
  };

});
