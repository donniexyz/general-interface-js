/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Paints a vector line defined by two end points.
 */
jsx3.Class.defineClass("jsx3.vector.Line", jsx3.vector.BaseShape, null, function(Line, Line_prototype) {

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {
    
  /**
   * The instance initializer.
   * @param left {int} left position (in pixels) of the object relative to its parent container
   * @param top {int} top position (in pixels) of the object relative to its parent container
   * @param x1 {int} the x coordinate of the starting point
   * @param y1 {int} the y coordinate of the starting point
   * @param x2 {int} the x coordinate of the ending point
   * @param y2 {int} the y coordinate of the ending point
   */
  Line_prototype.init = function(left, top, x1, y1, x2, y2) {
    //call constructor for super class
    var w = Math.max(left, Math.max(x1, x2)) - Math.min(left, Math.min(x1, x2));
    var h = Math.max(top, Math.max(y1, y2)) - Math.min(top, Math.min(y1, y2));
    this.jsxsuper("line", left, top, Math.max(w,16), Math.max(h,16));

    /* @jsxobf-clobber */
    this._x1 = x1;
    /* @jsxobf-clobber */
    this._y1 = y1;
    /* @jsxobf-clobber */
    this._x2 = x2;
    /* @jsxobf-clobber */
    this._y2 = y2;
  };
  
  /**
   * Sets all the coordinates at once.
   * @param x1 {int} the x coordinate of the starting point
   * @param y1 {int} the y coordinate of the starting point
   * @param x2 {int} the x coordinate of the ending point
   * @param y2 {int} the y coordinate of the ending point
   */
  Line_prototype.setPoints = function( x1, y1, x2, y2 ) {
    this._x1 = x1;
    this._y1 = y1;
    this._x2 = x2;
    this._y2 = y2;

    var left = this.getLeft();
    var top = this.getTop();
    var w = Math.max(left, Math.max(x1, x2)) - Math.min(left, Math.min(x1, x2));
    var h = Math.max(top, Math.max(y1, y2)) - Math.min(top, Math.min(y1, y2));
    this.setWidth(w);
    this.setHeight(h);
  };

  /**
   * Returns the x1 field.
   * @return {int} x1
   */
  Line_prototype.getX1 = function() {
    return this._x1;
  };

  /**
   * Sets the x1 field.
   * @param x1 {int} the new value for x1
   */
  Line_prototype.setX1 = function( x1 ) {
    this._x1 = x1;
  };

  /**
   * Returns the y1 field.
   * @return {int} y1
   */
  Line_prototype.getY1 = function() {
    return this._y1;
  };

  /**
   * Sets the y1 field.
   * @param y1 {int} the new value for y1
   */
  Line_prototype.setY1 = function( y1 ) {
    this._y1 = y1;
  };

  /**
   * Returns the x2 field.
   * @return {int} x2
   */
  Line_prototype.getX2 = function() {
    return this._x2;
  };

  /**
   * Sets the x2 field.
   * @param x2 {int} the new value for x2
   */
  Line_prototype.setX2 = function( x2 ) {
    this._x2 = x2;
  };

  /**
   * Returns the y2 field.
   * @return {int} y2
   */
  Line_prototype.getY2 = function() {
    return this._y2;
  };

  /**
   * Sets the y2 field.
   * @param y2 {int} the new value for y2
   */
  Line_prototype.setY2 = function( y2 ) {
    this._y2 = y2;
  };

  Line_prototype.paintUpdate = function() {    
    this.jsxsuper();

    this.removeProperty("coordsize"); // for some reason this messes up <v:line>
    this.setProperty("from", jsx3.vector.toVector2D(this._x1, this._y1),
                     "to", jsx3.vector.toVector2D(this._x2, this._y2));
  };

/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {
  
  Line_prototype.init = function(left, top, x1, y1, x2, y2) {
    this.jsxsuper("line", left, top);
    this.setPoints(x1, y1, x2, y2);
  };
  
  Line_prototype.setPoints = function( x1, y1, x2, y2 ) {
    this.setX1(x1);
    this.setY1(y1);
    this.setX2(x2);
    this.setY2(y2);
  };

  Line_prototype.getX1 = function() { return this.getProperty("x1"); };
  Line_prototype.setX1 = function(x1) { this.setProperty("x1", x1); };
  Line_prototype.getY1 = function() { return this.getProperty("y1"); };
  Line_prototype.setY1 = function(y1) { this.setProperty("y1", y1); };
  Line_prototype.getX2 = function() { return this.getProperty("x2"); };
  Line_prototype.setX2 = function( x2 ) {this.setProperty("x2", x2); };
  Line_prototype.getY2 = function() { return this.getProperty("y2"); };
  Line_prototype.setY2 = function( y2 ) { this.setProperty("y2", y2); };
  
/* @JSC */ }
  
  Line_prototype.toString = function() {
    return "<line " + this.getId() + " {" + this.getX1() + "," + this.getY1() +
        "} {" + this.getX2() + "," + this.getY2() + "}/>";
  };

});
