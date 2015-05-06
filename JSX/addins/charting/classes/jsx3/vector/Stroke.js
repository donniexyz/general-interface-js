/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Represents a vector line style.
 */
jsx3.Class.defineClass("jsx3.vector.Stroke", jsx3.html.Tag, null, function(Stroke, Stroke_prototype) {

  var vector = jsx3.vector;

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {
  Stroke._TAGNAME = "stroke";
/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {
  Stroke._TAGNAME = null;
/* @JSC */ }

  /**
   * The instance initializer.
   * @param color {int|String} the color value, as a hex String or 24-bit integer value, defaults to 0x000000
   * @param width {int} the width of the stroke, in pixels, defaults to 1
   * @param alpha {float} the opacity value, valid values are between 0 and 1, defaults to 1
   */
  Stroke_prototype.init = function(color, width, alpha) {
    // call constructor for super class
    this.jsxsuper(vector.TAGNS, Stroke._TAGNAME);
    
    /* @jsxobf-clobber-shared */
    this._on = null;
    /* @jsxobf-clobber */
    this._color = color != null ? color : 0x000000;
    /* @jsxobf-clobber */
    this._width = width != null ? width : 1;
    /* @jsxobf-clobber */
    this._alpha = alpha != null ? vector.constrainAlpha(alpha) : 1;
  };

  /**
   * Returns the color field.
   * @return {int | String} color
   */
  Stroke_prototype.getColor = function() {
    return this._color;
  };

  /**
   * Returns the color field, as a CSS hex string.
   * @return {String}
   */
  Stroke_prototype.getColorHtml = function() {
    return vector.colorAsHtml(this._color);
  };
  
  /**
   * Sets the color field.
   * @param color {int | String} the new value for color
   */
  Stroke_prototype.setColor = function( color ) {
    this._color = color;
  };

  /**
   * Returns the width field.
   * @return {int} width
   */
  Stroke_prototype.getWidth = function() {
    return this._width;
  };

  /**
   * Sets the width field.
   * @param width {int} the new value for width
   */
  Stroke_prototype.setWidth = function( width ) {
    this._width = width;
  };

  /**
   * Returns the alpha field.
   * @return {float} alpha
   */
  Stroke_prototype.getAlpha = function() {
    return this._alpha;
  };

  /**
   * Sets the alpha field.
   * @param alpha {float} the new value for alpha
   */
  Stroke_prototype.setAlpha = function( alpha ) {
    this._alpha = alpha != null ? vector.constrainAlpha(alpha) : null;
  };

  /**
   * vetoes all child appends
   * @package
   */
  Stroke_prototype.onAppendChild = function( child ) {
    return false;
  };

  Stroke_prototype.toString = function() {
    return "<stroke " + this.getColorHtml() + " " + this._width + " " + this._alpha + "/>";
  };

  /**
   * override method in Tag base class for efficiency
   * @package
   */
  Stroke_prototype.paint = function() {
    var html = "<" + vector.TAGNS + ":" + this.getTagName();
    if (this.getId() != null) html += " id='" + this.getId() + "'";
    var color = this.getColorHtml();
    if (this._on != null) html += " on='" + this._on + "'";
    if (color != null) html += " color='" + color + "'";
    if (this._alpha != null && this._alpha < 1) html += " opacity='" + this._alpha + "'";
    if (this._width != null) html += " weight='" + vector.toUnit(this._width) + "'";
    html += "/>";
    return html;
  };  

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  Stroke_prototype.paintToBuffer = function(buffer, index) {
    buffer[index] = this.paint();
    return index + 1;
  };

/* @JSC */ }

  /**
   * true if all the information contained in this class can be reprented in VML by attributes of the parent <v:shape> tag. if false, a child <v:stroke> tag must be created in the parent's paint routine
   * @return {boolean} true if alpha is null or 1 (the default value) and there is no dashstyle
   * @package
   */
  Stroke_prototype.canInline = function() {
    return (this._alpha == 1 || this._alpha == null);
  };

  /**
   * parses a VectorStroke from a string representation, that format is "color width alpha"
   * @param v {String} the string representation
   * @return {VectorStroke} null if v is empty, v if v is already a VectorStroke, or otherwise a new VectorStroke created by parsing the string according to the format specified above
   */
  Stroke.valueOf = function( v ) {
    if (jsx3.util.strEmpty(v)) return null;
    if (v instanceof Stroke) return v;
    var tokens = v.toString().split(/\s+/);
    return new Stroke(tokens[0], tokens[1], tokens[2]);
  };

});
