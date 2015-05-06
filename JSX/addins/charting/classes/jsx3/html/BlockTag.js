/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Represents an HTML element that occupies a rectangle of the screen.
 * <p/>
 * This class is available only when the Charting add-in is enabled.
 */
jsx3.Class.defineClass("jsx3.html.BlockTag", jsx3.html.Tag, null, function(BlockTag, BlockTag_prototype) {

  /**
   * The instance initializer.
   * @param strTagNS {String}
   * @param strTagName {String}
   * @param left {int} left position (in pixels) of the object relative to its parent container
   * @param top {int} top position (in pixels) of the object relative to its parent container
   * @param width {int} width (in pixels) of the object
   * @param height {int} height (in pixels) of the object
   */
  BlockTag_prototype.init = function(strTagNS, strTagName, left, top, width, height) {
    this.jsxsuper(strTagNS, strTagName);
    this.setDimensions(left, top, width, height);
  };

  /**
   * Returns the left field.
   * @return {int} left
   */
  BlockTag_prototype.getLeft = function() {
    var s = this.getStyle("left");
    return s != null ? parseInt(s) : null;
  };

  /** @private @jsxobf-clobber */
  BlockTag_prototype._setADimension = function( dim, value ) {
    if (value == null) {
      this.setStyle(dim, null);
    } else {
      var intValue = parseInt(value);
      if (isNaN(intValue))
        jsx3.chart.LOG.debug("trying to set " + dim + " of " + this + " to " + value);
      else
        this.setStyle(dim, intValue + "px");
    }
  };

  /**
   * Sets the left field.
   * @param left {int} the new value for left
   */
  BlockTag_prototype.setLeft = function( left ) {
    this._setADimension("left", left);
  };

  /**
   * Returns the top field.
   * @return {int} top
   */
  BlockTag_prototype.getTop = function() {
    var s = this.getStyle("top");
    return s != null ? parseInt(s) : null;
  };

  /**
   * Sets the top field.
   * @param top {int} the new value for top
   */
  BlockTag_prototype.setTop = function( top ) {
    this._setADimension("top", top);
  };

  /**
   * Returns the width field.
   * @return {int} width
   */
  BlockTag_prototype.getWidth = function() {
    var s = this.getStyle("width");
    return s != null ? parseInt(s) : null;
  };

  /**
   * Sets the width field.
   * @param width {int} the new value for width
   */
  BlockTag_prototype.setWidth = function( width ) {
    this._setADimension("width", width);
  };

  /**
   * Returns the height field.
   * @return {int} height
   */
  BlockTag_prototype.getHeight = function() {
    var s = this.getStyle("height");
    return s != null ? parseInt(s) : null;
  };

  /**
   * Sets the height field.
   * @param height {int} the new value for height
   */
  BlockTag_prototype.setHeight = function( height ) {
    this._setADimension("height", height);
  };

  /**
   * Returns the margin field, as set by setMargin().
   * @return {String} margin
   */
  BlockTag_prototype.getMargin = function() {
    return this.getStyle("margin");
  };

  /**
   * Sets the margin field, can be a single value or four values separated by space that correspond to top, right, bottom, and left.
   * @param margin {String} the new value for margin
   */
  BlockTag_prototype.setMargin = function( margin ) {
    this.setStyle("margin", margin);
  };

  /**
   * Returns the padding field, as set by setPadding().
   * @return {String} padding
   */
  BlockTag_prototype.getPadding = function() {
    return this.getStyle("padding");
  };

  /**
   * Sets the padding field, can be a single value or four values separated by space that correspond to top, right, bottom, and left.
   * @param padding {String} the new value for padding
   */
  BlockTag_prototype.setPadding = function( padding ) {
    this.setStyle("padding", padding);
  };

  /**
   * Returns the position field.
   * @return {String} position
   */
  BlockTag_prototype.getPosition = function() {
    return this.getStyle("position");
  };

  /**
   * Sets the position field, can be 'absolute' or 'relative'.
   * @param position {String} the new value for position
   */
  BlockTag_prototype.setPosition = function( position ) {
    this.setStyle("position", position);
  };

  /**
   * Returns the zIndex field.
   * @return {int} zIndex
   */
  BlockTag_prototype.getZIndex = function() {
    return this.getStyle("zIndex");
  };

  /**
   * Sets the zIndex field.
   * @param zIndex {int} the new value for zIndex
   */
  BlockTag_prototype.setZIndex = function( zIndex ) {
    this.setStyle("zIndex", zIndex);
  };

  /**
   * Returns the bgcolor field.
   * @return {String} bgcolor
   */
  BlockTag_prototype.getBackgroundColor = function() {
    return this.getStyle("backgroundColor");
  };

  /**
   * Sets the bgcolor field.
   * @param bgcolor {String} the new value for bgcolor
   */
  BlockTag_prototype.setBackgroundColor = function( bgcolor ) {
    this.setStyle("backgroundColor", bgcolor);
  };

  /**
   * parses the margin field into an array of four int values 
   * @return {Array} [top,right,bottom,left]
   */
  BlockTag_prototype.getMarginDimensions = function() {
    return BlockTag.getDimensionsFromCss(this.getMargin());
  };
  
  /**
   * parses the padding field into an array of four int values 
   * @return {Array} [top,right,bottom,left]
   */
  BlockTag_prototype.getPaddingDimensions = function() {
    return BlockTag.getDimensionsFromCss(this.getPadding());
  };

  /**
   * parses any CSS value into an array of four int values 
   * @return {Array} [top,right,bottom,left]
   * @package
   */
  BlockTag.getDimensionsFromCss = function(css) {
    if (css) {
      if (typeof(css) == "number") {
        return [css,css,css,css];
      } else {
        var tokens = ("" + css).split(/[^\d\-]+/);
        if (tokens[0] === "") tokens.shift();
        if (tokens.length > 0 && tokens[tokens.length] === "") tokens.pop();
        if (tokens.length >= 4) {
          return [parseInt(tokens[0]),parseInt(tokens[1]),parseInt(tokens[2]),parseInt(tokens[3])];
        } else if (tokens.length >= 1) {
          var p = parseInt(tokens[0]);
          return [p,p,p,p];
        }
      }
    }
    
    return [0,0,0,0];  
  };

  /**
   * Returns the dimensions in an array of four int values
   * @return {Array<int>} [left,top,width,height]
   */
  BlockTag_prototype.getDimensions = function() {
    return [this.getLeft(), this.getTop(), this.getWidth(), this.getHeight()];
  };

  /**
   * Sets all four dimensions at once.
   * @param left {int/Array<int>} the new left value or an array containing all four new values
   * @param top {int} the new top value
   * @param width {int} the new width value
   * @param height {int} the new height value
   */
  BlockTag_prototype.setDimensions = function(left, top, width, height) {
    if (jsx3.$A.is(left)) {
      this.setLeft(left[0]);
      this.setTop(left[1]);
      this.setWidth(left[2]);
      this.setHeight(left[3]);
    } else {
      this.setLeft(left);
      this.setTop(top);
      this.setWidth(width);
      this.setHeight(height);
    }
  };

});
