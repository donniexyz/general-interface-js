/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Represents a vector fill, the color and gradient that fills a solid vector shape.
 */
jsx3.Class.defineClass("jsx3.vector.Fill", jsx3.html.Tag, null, function(Fill, Fill_prototype) {

  var vector = jsx3.vector;

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {
  Fill._TAGNAME = "fill";
/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {
  Fill._TAGNAME = null;
/* @JSC */ }

  /**
   * The instance initializer.
   * @param color {int|String} the color value, as a hex String or 24-bit integer value, defaults to 0x000000
   * @param alpha {float} the opacity value, valid values are between 0 and 1, defaults to 1
   */
  Fill_prototype.init = function(color, alpha) {
    //call constructor for super class
    this.jsxsuper(vector.TAGNS, Fill._TAGNAME);
    
    /* @jsxobf-clobber-shared */
    this._on = null;
    /* @jsxobf-clobber */
    this._color = color != null ? color : 0x000000;
    /* @jsxobf-clobber */
    this._alpha = alpha != null ? vector.constrainAlpha(alpha) : 1;
    /* @jsxobf-clobber */
    this._type = null;
    // all these are ignored unless type is 'gradient' or 'gradientradial'
    /* @jsxobf-clobber */
    this._color2 = null;
    /* @jsxobf-clobber */
    this._alpha2 = null;
    /* @jsxobf-clobber */
    this._angle = null;
    /* @jsxobf-clobber */
    this._colors = null;
  };

  /**
   * Returns the color field, as previously set in the constructor or with setColor().
   */
  Fill_prototype.getColor = function() {
    return this._color;
  };

  /**
   * Returns the color field, as a CSS hex string.
   * @return {String}
   */
  Fill_prototype.getColorHtml = function() {
    return vector.colorAsHtml(this._color);
  };
  
  /**
   * Sets the color field.
   * @param color {string/number} the new value for color
   */
  Fill_prototype.setColor = function( color ) {
    this._color = color;
  };

  /**
   * Returns the alpha field, as previously set in the constructor or with setAlpha().
   * @return {float} alpha
   */
  Fill_prototype.getAlpha = function() {
    return this._alpha;
  };

  /**
   * Sets the alpha field, valid values are between 0 (transparent) and 1 (opaque)..
   * @param alpha {float} the new value for alpha
   */
  Fill_prototype.setAlpha = function( alpha ) {
    this._alpha = alpha != null ? vector.constrainAlpha(alpha) : null;
  };

  /**
   * Returns the type field, as set with setType().
   * @return {String} type
   */
  Fill_prototype.getType = function() {
    return this._type;
  };

  /**
   * Sets the type field, valid values are enumerated in the VML specification, though only 'solid', 'gradient', and 'gradientradial' are truly supported by this class.
   * @param type {String} the new value for type
   */
  Fill_prototype.setType = function( type ) {
    this._type = type;
  };

  /**
   * Returns the color2 field, as set with setColor2().
   */
  Fill_prototype.getColor2 = function() {
    return this._color2;
  };

  /**
   * ? getColor2Html() {String} gets the color2 field, as a CSS hex string
   */
  Fill_prototype.getColor2Html = function() {
    return vector.colorAsHtml(this._color2);
  };
  
  /**
   * Sets the color2 field.
   * @param color2 {string/number} the new value for color2
   */
  Fill_prototype.setColor2 = function( color2 ) {
    this._color2 = color2;
  };

  /**
   * Returns the alpha2 field, as set with setAlpha2().
   * @return {float} alpha2
   */
  Fill_prototype.getAlpha2 = function() {
    return this._alpha2;
  };

  /**
   * Sets the alpha2 field, valid values are between 0 (transparent) and 1 (opaque)..
   * @param alpha2 {float} the new value for alpha2
   */
  Fill_prototype.setAlpha2 = function( alpha2 ) {
    this._alpha2 = alpha2;
  };

  /**
   * Returns the angle field (the angle along which the gradient goes), as set with setAngle().
   * @return {int} angle
   */
  Fill_prototype.getAngle = function() {
    return this._angle;
  };

  /**
   * Sets the angle field, valid values are between 0 and 360. 0 is the vector pointing rightward.
   * @param angle {int} the new value for angle
   */
  Fill_prototype.setAngle = function( angle ) {
    this._angle = angle;
  };

  /**
   * Returns the colors field, as set with setColors().
   * @return {String} colors
   */
  Fill_prototype.getColors = function() {
    return this._colors;
  };

  /**
   * Sets the colors field, see the documentation for &lt;fill&gt; in the VML documentation.
   * @param colors {String} the new value for colors
   */
  Fill_prototype.setColors = function( colors ) {
    this._colors = colors;
  };

  Fill_prototype.toString = function() {
    return "<fill " + this.getColorHtml() + " " + this.getAlpha() + "/>";
  };

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {
  
  // override method in Tag base class for efficiency
  Fill_prototype.paint = function() {
    var html = "<" + vector.TAGNS + ":" + this.getTagName();
    if (this.getId() != null) html += " id='" + this.getId() + "'";
    var color = this.getColorHtml();
    if (this._on != null) html += " on='" + this._on + "'";
    if (color != null) html += " color='" + color + "'";
    if (this._alpha != null && this._alpha < 1) html += " opacity='" + this._alpha + "'";
    
    if (this._type && this._type != "solid") {
      html += " type='" + this._type + "'";
      var color2 = this.getColor2Html();
      if (color2 != null) html += " color2='" + color2 + "'";
      if (this._colors != null) html += " colors='" + this._colors + "'";
      if (this._angle != null) html += " angle='" + this._angle + "'";
      if (this._alpha2 != null) html += " o:opacity2='" + this._alpha2 + "'";
    }
    
    html += "/>";
    return html;
  };
  
  Fill_prototype.paintToBuffer = function(buffer, index) {
    buffer[index] = this.paint();
    return index + 1;
  };

  /**
   * true if all the information contained in this class can be reprented in VML by attributes of the parent <v:shape> tag. if false, a child <v:fill> tag must be created in the parent's paint routine
   * @return {boolean} true if alpha is null or 1 (the default value) and this is not a gradient fill
   * @package
   */
  Fill_prototype.canInline = function() {
    return (this._alpha == 1 || this._alpha == null) && 
        (! this._type || this._type == "solid");
  };
    
/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {
  
  Fill_prototype.hasGradient = function() {
    return this._type && this._type != "solid";
  };
  
  Fill_prototype.canInline = function() {
    return (this._alpha == 1 || this._alpha == null) && ! this.hasGradient();
  };
    
/* @JSC */ }

  /**
   * Parses a vector fill from its string representation. The format is <code>"color alpha"</code>.
   * @param v {String|jsx3.vector.Fill} the string representation of a fill.
   * @return {jsx3.vector.Fill} <code>null</code> if <code>v</code> is empty, <code>v</code> if <code>v</code>
   *     is already a vector fill, or otherwise a new vector fill created by parsing the string according to the
   *     format specified above.
   */
  Fill.valueOf = function( v ) {
    if (jsx3.util.strEmpty(v)) return null;
    if (v instanceof Fill) return v;
    var tokens = v.toString().split(/\s+/);
    return new Fill(tokens[0], tokens[1]);
  };
    
  /**
   * vetoes all child appends
   * @package
   */
  Fill_prototype.onAppendChild = function( child ) {
    return false;
  };

});
