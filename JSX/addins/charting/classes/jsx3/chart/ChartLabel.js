/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.ChartComponent");

/**
 * A chart component to render a text box. Used to render the titles of charts, legends, axes, and series.
 * Encapsulates all the font settings of the label so that the parent container does not experience 
 * property bloat.
 */
jsx3.Class.defineClass("jsx3.chart.ChartLabel", jsx3.chart.ChartComponent, null, function(ChartLabel, ChartLabel_prototype) {
  
  var vector = jsx3.vector;
  
  /**
   * {int} the default preferred width
   */
  ChartLabel.DEFAULT_WIDTH = 100;

  /**
   * {int} non-rotated angle
   * @final @jsxobf-final
   */
  ChartLabel.ROTATION_NORMAL = 0;

  /**
   * {int} angle for one-quarter clockwise rotation
   * @final @jsxobf-final
   */
  ChartLabel.ROTATION_CW = 90;

  /**
   * {int} angle for one-quarter counter-clockwise rotation
   * @final @jsxobf-final
   */
  ChartLabel.ROTATION_CCW = 270;

  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param text {String} text to display in the label
   */
  ChartLabel_prototype.init = function(name, text) {
    //call constructor for super class
    this.jsxsuper(name);

    this.jsxtext = text;
    this.alpha = null;
    this.borderStroke = null;
    this.preferredWidth = null;
    this.preferredHeight = null;
    this.labelRotation = ChartLabel.ROTATION_NORMAL;
  };

  /**
   * Returns the text field.
   * @return {String} text
   */
  ChartLabel_prototype.getText = function() {
    return this.jsxtext;
  };

  /**
   * Sets the text field.
   * @param text {String} the new value for text
   */
  ChartLabel_prototype.setText = function( text ) {
    this.jsxtext = text;
  };

  /**
   * Returns the preferredWidth field.
   * @return {int} preferredWidth
   */
  ChartLabel_prototype.getPreferredWidth = function() {
    if (this.preferredWidth != null) {
      return this.preferredWidth;
    } else if (this.isRotated()) {
      return this._getNormalDimension();
    } else {
      var padding = this.getPaddingDimensions();
      return ChartLabel.DEFAULT_WIDTH + padding[0] + padding[2];
    }
  };

  /**
   * Sets the preferredWidth field.
   * @param preferredWidth {int} the new value for preferredWidth
   */
  ChartLabel_prototype.setPreferredWidth = function( preferredWidth ) {
    this.preferredWidth = preferredWidth;
  };

  /**
   * Returns the preferredHeight field.
   * @return {int} preferredHeight
   */
  ChartLabel_prototype.getPreferredHeight = function() {
    if (this.preferredHeight != null) {
      return this.preferredHeight;
    } else if (this.isRotated()) {
      var padding = this.getPaddingDimensions();
      return ChartLabel.DEFAULT_WIDTH + padding[1] + padding[3];
    } else {
      return this._getNormalDimension();
    }
  };

  /**
   * Sets the preferredHeight field.
   * @param preferredHeight {int} the new value for preferredHeight
   */
  ChartLabel_prototype.setPreferredHeight = function( preferredHeight ) {
    this.preferredHeight = preferredHeight;
  };

  /**
   * crude estimate of the height of the font, plus padding above and below
   * @private
   * @jsxobf-clobber
   */
  ChartLabel_prototype._getNormalDimension = function() {
    var padding = this.getPaddingDimensions();
    var fontsize = this.getFontSize() != null ? this.getFontSize() : 10;
    return Math.round(fontsize * 1.5) + 
        (this.isRotated() ? padding[1] + padding[3] : padding[0] + padding[2]);
  };

  /**
   * Returns the alpha field, the opacity of the background fill.
   * @return {float} alpha
   */
  ChartLabel_prototype.getAlpha = function() {
    return this.alpha;
  };

  /**
   * Sets the alpha field.
   * @param alpha {float} the new value for alpha
   */
  ChartLabel_prototype.setAlpha = function( alpha ) {
    this.alpha = alpha != null ? vector.constrainAlpha(alpha) : null;
  };

  /**
   * Returns the borderStroke field, string representation of the VectorStroke used to outline the background.
   * @return {String} borderStroke
   */
  ChartLabel_prototype.getBorderStroke = function() {
    return this.borderStroke;
  };

  /**
   * Sets the borderStroke field.
   * @param borderStroke {String} the new value for borderStroke
   */
  ChartLabel_prototype.setBorderStroke = function( borderStroke ) {
    this.borderStroke = borderStroke;
  };

  /**
   * Returns the labelRotation field.
   * @return {int} labelRotation
   */
  ChartLabel_prototype.getLabelRotation = function() {
    return this.labelRotation;
  };

  /**
   * Sets the labelRotation field.
   * @param labelRotation {int} the new value for labelRotation, one of {0, 90, 270}
   */
  ChartLabel_prototype.setLabelRotation = function( labelRotation ) {
    this.labelRotation = labelRotation;
  };

  /**
   * whether this label is display at 90 or -90 degrees
   * @return {boolean}
   */
  ChartLabel_prototype.isRotated = function() {
    return this.labelRotation == ChartLabel.ROTATION_CW ||
        this.labelRotation == ChartLabel.ROTATION_CCW;
  };
  
  /**
   * Renders all vector elements and appends them to the render root.
   * @package
   */
  ChartLabel_prototype.updateView = function() {
    this.jsxsuper();
    var root = this.getCanvas();

    var w = this.getWidth();
    var h = this.getHeight();
    var padding = this.getPaddingDimensions();
    
    // model event hooks:
    this.setEventProperties();
            
    // background
    var bg = new vector.Rectangle(0, 0, w, h);
    root.appendChild(bg);

    jsx3.chart.copyBackgroundToFill(this, bg);
    var fill = bg.getFill();
    
    // bg stroke
    var stroke = vector.Stroke.valueOf(this.borderStroke);
    if (stroke != null) {
      bg.setStroke(stroke);
    } else if (fill != null && (this.alpha == null || this.alpha == 1)) {
      bg.setStroke(new vector.Stroke(fill.getColor()));
    }

    
    var y1 = 0, y2 = 0, x1 = 0, x2 = 0;
    if (this.isRotated()) {
      x1 = x2 = Math.round(padding[3] + (w-padding[1]-padding[3])/2);
      if (this.labelRotation == ChartLabel.ROTATION_CW) {
        y2 = h;
      } else {
        y1 = h;
      }
    } else {
      y1 = y2 = Math.round(h/2);
      x1 = 0;
      x2 = w;
    }
    
    var textElement = new vector.TextLine(x1, y1, x2, y2, this.jsxtext);
    textElement.setColor(this.getColor());
    textElement.setClassName(this.getClassName());
    textElement.setFontFamily(this.jsxfontname);
    textElement.setFontWeight(this.jsxfontweight);
    textElement.setFontSize(this.jsxfontsize);
    textElement.setTextAlign(this.jsxtextalign);

    root.appendChild(textElement);    
  };
  
  /**
   * No children allowed.
   * @package
   */
  ChartLabel_prototype.onSetChild = function() {
    return false;
  };
  
  ChartLabel_prototype.onSetParent = function(objParent) {
    return objParent instanceof jsx3.chart.ChartComponent || objParent instanceof jsx3.chart.Chart;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  ChartLabel.getVersion = function() {
    return jsx3.chart.VERSION;
  };

/* @JSC :: end */

});
