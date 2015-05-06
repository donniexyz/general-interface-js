/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Paints a vector polygon defined by a set of points.
 */
jsx3.Class.defineClass("jsx3.vector.Polygon", jsx3.vector.BaseShape, null, function(Polygon, Polygon_prototype) {

  /**
   * The instance initializer.
   * @param left {int} left position (in pixels) of the object relative to its parent container
   * @param top {int} top position (in pixels) of the object relative to its parent container
   * @param points {string/array} the list of points comprising the polygon
   */
  Polygon_prototype.init = function(left, top, points) {
    //call constructor for super class
    this.jsxsuper("polyline", left, top);
    this.setPoints(points);
  };

  /**
   * Sets the polygon points as an array of point objects or strings.
   * @param points {Array<String>} an array of strings or objects that stringify as <code>"x y"</code>.
   */
  Polygon_prototype.setPoints = function( points ) {
    this.setProperty("points", points ? points.join(" ") : null);
  };
  
  /**
   * Sets the polygon points as an array of coordinates.
   * @param points {Array<int>} an array of alternating x and y coordinates.
   */
  Polygon_prototype.setPointsAsNumberArray = function( points ) {
    this.setProperty("points", points ? points.join(" ") : null);
  };
  
  /**
   * Sets the points as a string.
   * @param points {String} a string in the form "x1 y1 x2 y2 ..."
   */
  Polygon_prototype.setPointsAsString = function( points ) {
    this.setProperty("points", points);
  };
  
});
