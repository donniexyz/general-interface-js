/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * A vector shape element. The path field can contain an EPS-like path defining a complex vector shape.
 */
jsx3.Class.defineClass("jsx3.vector.Shape", jsx3.vector.BaseShape, null, function(Shape, Shape_prototype) {

  var vector = jsx3.vector;

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {
  
  /**
   * Returns the path field. Note that the value returned by this method depends on the vector implementation.
   * VML (Internet Explorer) and SVG (Firefox, Safari) specify different path syntaxes.
   * @return {String} path
   */
  Shape_prototype.getPath = function() {
    this._savePath();
    return this.getProperty("path");
  };

  /**
   * Sets the path field. Note that the argument accepted by this method depends on the vector implementation. 
   * VML (Internet Explorer) and SVG (Firefox, Safari) specify different path syntaxes. <code>pathMoveTo</code>,
   * The methods <code>pathLineTo</code>, <code>pathArcTo</code>, and <code>pathClose</code> are
   * implementation-independent and should be used instead.
   * 
   * @param path {String} the new value for path
   */
  Shape_prototype.setPath = function( path ) {
    this._pathtokens = [path];
    this.setProperty("path", path);
  };

  /**
   * Appends a path segment that moves the shape to <code>{x, y}</code> without drawing a line segment.
   * @param x {int}
   * @param y {int}
   * @param bRel {boolean} if <code>true</code>, <code>x</code> and <code>y</code> are the offsets from the current
   *     position of the path. Otherwise they are the absolute coordinates.
   * @return {jsx3.vector.Shape} this object.
   */
  Shape_prototype.pathMoveTo = function(x, y, bRel) {
    this._appendPath((bRel ? "t" : "m") + " " + x + " " + y);
    return this;
  };
  
  /**
   * Appends a line segment to <code>{x, y}</code>.
   * @param x {int}
   * @param y {int}
   * @param bRel {boolean} if <code>true</code>, <code>x</code> and <code>y</code> are the offsets from the current
   *     position of the path. Otherwise they are the absolute coordinates.
   * @return {jsx3.vector.Shape} this object.
   */
  Shape_prototype.pathLineTo = function(x, y, bRel) {
    this._appendPath((bRel ? "r" : "l") + " " + x + " " + y);
    return this;
  };
  
  /**
   * Adds an arc segment on this shape.
   * @param cx {int} the center x coordinate.
   * @param cy {int} the center y coordinate.
   * @param rx {int} the x radius.
   * @param ry {int} the y radius.
   * @param x1 {int} the starting point x coordinate.
   * @param y1 {int} the starting point y coordinate.
   * @param x2 {int} the ending point x coordinate.
   * @param y2 {int} the ending point y coordinate.
   * @param bCW {boolean}
   * @return {jsx3.vector.Shape} this object.
   */
  Shape_prototype.pathArcTo = function(cx, cy, rx, ry, x1, y1, x2, y2, bCW) {
    this._appendPath((bCW ? "wa" : "at") + " " + (cx-rx) + " " + (cy-ry) + " " + (cx+rx) + " " + (cy+ry) + " " +
        x1 + " " + y1 + " " + x2 + " " + y2);
    return this;
  };
  
  /**
   * Appends a close segment to this shape.
   * @return {jsx3.vector.Shape} this object.
   */
  Shape_prototype.pathClose = function() {
    this._appendPath("x");
    return this;
  };
    
/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {

  Shape_prototype.getPath = function() {
    this._savePath();
    return this.getProperty("d");
  };

  Shape_prototype.setPath = function( path ) {
    this._pathtokens = [path];
    this.setProperty("d", path);
  };

  Shape_prototype.pathMoveTo = function(x, y, bRel) {
    this._appendPath((bRel ? "m" : "M") + " " + x + " " + y);
    return this;
  };
  
  Shape_prototype.pathLineTo = function(x, y, bRel) {
    this._appendPath((bRel ? "l" : "L") + " " + x + " " + y);
    return this;
  };
  
  Shape_prototype.pathArcTo = function(cx, cy, rx, ry, x1, y1, x2, y2, bCW) {
    var h1 = Math.sqrt(Math.pow((x1-cx), 2) + Math.pow((y1-cy), 2));
    var h2 = Math.sqrt(Math.pow((x2-cx), 2) + Math.pow((y2-cy), 2));
    var th1 = Math.asin((cy-y1) / h1); // y dimension is reversed compared with standard math diagram
    if (x1 - cx < 0) th1 = (th1 > 0 ? Math.PI : -Math.PI) - th1;
    var th2 = Math.asin((cy-y2) / h2);
    if (x2 - cx < 0) th2 = (th2 > 0 ? Math.PI : -Math.PI) - th2;
    
    var thDelta = bCW ? th1 - th2 : th2 - th1;
    var gt180 = (thDelta > -1 * Math.PI && thDelta < 0) || thDelta > Math.PI;
//    jsx3.log("circle {" + cx + "," + cy + "," + rx + "} from {" + x1 + "," + y1 + "} to {" + x2 + "," + y2 + "} " + 
//        "bCW:" + bCW + " th1:" + th1 + " th2:" + th2 + " gt180:" + gt180);
    
    this.pathLineTo(x1, y1)._appendPath(
        "A " + rx + " " + ry + " 0 " + (gt180 ? "1" : "0") + " " + (bCW ? "1" : "0") + " " + x2 + " " + y2);
    return this;    
  };
  
  Shape_prototype.pathClose = function() {
    this._appendPath("z");
    return this;
  };
  
/* @JSC */ }
  
  /**
   * appends text to the end of the current path field
   * @param pathSegment {String} the text to append
   * @private 
   * @jsxobf-clobber
   */
  Shape_prototype._appendPath = function( pathSegment ) {
    if (!this._pathtokens)
      /* @jsxobf-clobber */
      this._pathtokens = [];
    this._pathtokens.push(pathSegment);
  };

  /**
   * @private
   * @jsxobf-clobber
   */
  Shape_prototype._savePath = function() {
    if (this._pathtokens && this._pathtokens.length > 1) {
      var path = this._pathtokens.join(" ");
      this.setPath(path);
    }
  };

  /** 
   * custom paint logic needed to render a vector shape
   * @package
   */
  Shape_prototype.paintUpdate = function() {
    this._savePath();
    this.jsxsuper();
  };

});
