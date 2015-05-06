/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.ChartComponent");

/**
 * A chart component that renders a grid of lines and fills aligned with an x and y axis.
 */
jsx3.Class.defineClass("jsx3.chart.GridLines", jsx3.chart.ChartComponent, null, function(GridLines, GridLines_prototype) {

  var vector = jsx3.vector;
  var Stroke = vector.Stroke;
  
  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param left {int} left position (in pixels) of the object relative to its parent container
   * @param top {int} top position (in pixels) of the object relative to its parent container
   * @param width {int} width (in pixels) of the chart
   * @param height {int} height (in pixels) of the chart
   */
  GridLines_prototype.init = function(name, left, top, width, height) {
    //call constructor for super class
    this.jsxsuper(name);
    this.setDimensions(left, top, width, height);

    this.useXPrimary = jsx3.Boolean.TRUE;
    this.useYPrimary = jsx3.Boolean.TRUE;

    this.horizontalAbove = jsx3.Boolean.TRUE;
    this.inForeground = jsx3.Boolean.FALSE;
  
    this.borderStroke = null;
    this.fillV = null;
    this.strokeMajorV = null;
    this.strokeMinorV = null;
    this.fillH = null;
    this.strokeMajorH = null;
    this.strokeMinorH = null;
  };

  /**
   * Returns the useXPrimary field, whether to use the primary (or secondary) x axis.
   * @return {boolean} useXPrimary
   * @package
   */
  GridLines_prototype.getUseXPrimary = function() {
    return this.useXPrimary;
  };

  /**
   * Sets the useXPrimary field.
   * @param useXPrimary {boolean} the new value for useXPrimary
   * @package
   */
  GridLines_prototype.setUseXPrimary = function( useXPrimary ) {
    this.useXPrimary = useXPrimary;
  };

  /**
   * Returns the useYPrimary field, whether to use the primary (or secondary) y axis.
   * @return {boolean} useYPrimary
   * @package
   */
  GridLines_prototype.getUseYPrimary = function() {
    return this.useYPrimary;
  };

  /**
   * Sets the useYPrimary field.
   * @param useYPrimary {boolean} the new value for useYPrimary
   * @package
   */
  GridLines_prototype.setUseYPrimary = function( useYPrimary ) {
    this.useYPrimary = useYPrimary;
  };
  
  /**
   * Returns the horizontalAbove field, whether to draw the horizontal lines and fills above the vertical ones.
   * @return {boolean} horizontalAbove
   */
  GridLines_prototype.getHorizontalAbove = function() {
    return this.horizontalAbove;
  };

  /**
   * Sets the horizontalAbove field.
   * @param horizontalAbove {boolean} the new value for horizontalAbove
   */
  GridLines_prototype.setHorizontalAbove = function( horizontalAbove ) {
    this.horizontalAbove = horizontalAbove;
  };

  /**
   * Returns the inForeground field, whether to draw this legend on top of the data series (or below).
   * @return {boolean} inForeground
   */
  GridLines_prototype.getInForeground = function() {
    return this.inForeground;
  };

  /**
   * Sets the inForeground field.
   * @param inForeground {boolean} the new value for inForeground
   */
  GridLines_prototype.setInForeground = function( inForeground ) {
    this.inForeground = inForeground;
  };

  /**
   * Returns the borderStroke field, string representation of the stroke used to outline the grid lines.
   * @return {String} borderStroke
   */
  GridLines_prototype.getBorderStroke = function() {
    return this.borderStroke;
  };

  /**
   * Sets the borderStroke field.
   * @param borderStroke {String} the new value for borderStroke
   */
  GridLines_prototype.setBorderStroke = function( borderStroke ) {
    this.borderStroke = borderStroke;
  };

  /**
   * Returns the fillV field, array of string representations of vector fills used to fill in areas between vertical major ticks; if the length of the array is greater than one, the areas alternate through the list of fills.
   * @return {Array<String>} fillV
   */
  GridLines_prototype.getFillV = function() {
    return this.fillV;
  };

  /**
   * Sets the fillV field.
   * @param fillV {Array<String>} the new value for fillV
   */
  GridLines_prototype.setFillV = function( fillV ) {
    this.fillV = fillV;
  };

  /**
   * Returns the strokeMajorV field, array of string representations of VectorStroke's used to draw the vertical major ticks; if the length of the array is greater than one, the ticks alternate through the list of strokes.
   * @return {Array<String>} strokeMajorV
   */
  GridLines_prototype.getStrokeMajorV = function() {
    return this.strokeMajorV;
  };

  /**
   * Sets the strokeMajorV field.
   * @param strokeMajorV {Array<String>} the new value for strokeMajorV
   */
  GridLines_prototype.setStrokeMajorV = function( strokeMajorV ) {
    this.strokeMajorV = strokeMajorV;
  };

  /**
   * Returns the strokeMinorV field, array of string representations of VectorStroke's used to draw the vertical minor ticks; if the length of the array is greater than one, the ticks alternate through the list of strokes.
   * @return {Array<String>} strokeMinorV
   */
  GridLines_prototype.getStrokeMinorV = function() {
    return this.strokeMinorV;
  };

  /**
   * Sets the strokeMinorV field.
   * @param strokeMinorV {Array<String>} the new value for strokeMinorV
   */
  GridLines_prototype.setStrokeMinorV = function( strokeMinorV ) {
    this.strokeMinorV = strokeMinorV;
  };

  /**
   * Returns the fillH field, array of string representations of vector fills used to fill in areas between horizontal major ticks; if the length of the array is greater than one, the areas alternate through the list of fills.
   * @return {Array<String>} fillH
   */
  GridLines_prototype.getFillH = function() {
    return this.fillH;
  };

  /**
   * Sets the fillH field.
   * @param fillH {Array<String>} the new value for fillH
   */
  GridLines_prototype.setFillH = function( fillH ) {
    this.fillH = fillH;
  };

  /**
   * Returns the strokeMajorH field, array of string representations of VectorStroke's used to draw the horizontal major ticks; if the length of the array is greater than one, the ticks alternate through the list of strokes.
   * @return {Array<String>} strokeMajorH
   */
  GridLines_prototype.getStrokeMajorH = function() {
    return this.strokeMajorH;
  };

  /**
   * Sets the strokeMajorH field.
   * @param strokeMajorH {Array<String>} the new value for strokeMajorH
   */
  GridLines_prototype.setStrokeMajorH = function( strokeMajorH ) {
    this.strokeMajorH = strokeMajorH;
  };

  /**
   * Returns the strokeMinorH field, array of string representations of VectorStroke's used to draw the horizontal minor ticks; if the length of the array is greater than one, the ticks alternate through the list of strokes.
   * @return {Array<String>} strokeMinorH
   */
  GridLines_prototype.getStrokeMinorH = function() {
    return this.strokeMinorH;
  };

  /**
   * Sets the strokeMinorH field.
   * @param strokeMinorH {Array<String>} the new value for strokeMinorH
   */
  GridLines_prototype.setStrokeMinorH = function( strokeMinorH ) {
    this.strokeMinorH = strokeMinorH;
  };

  /**
   * Returns the x (horizontal) axis used to determine where to draw tick lines.
   * @return {jsx3.chart.Axis}
   */
  GridLines_prototype.getXAxis = function() {
    var myChart = this.getChart();
    if (myChart == null) return null;
    return this.useXPrimary ? myChart.getPrimaryXAxis() : myChart.getSecondaryXAxis();
  };

  /**
   * Returns the y (vertical) axis used to determine where to draw tick lines.
   * @return {jsx3.chart.Axis}
   */
  GridLines_prototype.getYAxis = function() {
    var myChart = this.getChart();
    if (myChart == null) return null;
    return this.useYPrimary ? myChart.getPrimaryYAxis() : myChart.getSecondaryYAxis();
  };
  
  /**
   * Renders all vector elements and appends them to the render root.
   * @package
   */
  GridLines_prototype.updateView = function() {
    this.jsxsuper();
    var root = this.getCanvas();

    // model event hooks:
    this.setEventProperties();
            
    // create horizontal and vertical groups, set correct z ordering
    var xLines = new vector.Group();
    xLines.setZIndex(2);
    root.appendChild(xLines);
    var yLines = new vector.Group();
    yLines.setZIndex(this.horizontalAbove ? 3 : 1);
    root.appendChild(yLines);

    var w = this.getWidth();
    var h = this.getHeight();
    
    // render the border, if any
    if (this.borderStroke) {
      var stroke = Stroke.valueOf(this.borderStroke);
      var bgBorder = new vector.Rectangle(0, 0, w, h);
      bgBorder.setZIndex(10);
      bgBorder.setStroke(stroke);
      root.appendChild(bgBorder);
    }
    
    // render the vertical lines
    this._updateViewDirection(xLines, w, h, this.getXAxis(), this.fillV,
      this.strokeMajorV, this.strokeMinorV, false);
    // render the horizontal lines
    this._updateViewDirection(yLines, w, h, this.getYAxis(), this.fillH,
      this.strokeMajorH, this.strokeMinorH, true);
  };

  /**
   * Renders one direction of lines and fills.
   * @private
   * @jsxobf-clobber
   */
  GridLines_prototype._updateViewDirection = function(group, w, h, axis, fills, majorStrokes, minorStrokes, vert) {
    group.setDimensions(0, 0, w, h);
    
    var numFills = this._getArrayLength(fills);
    
    if (axis != null) {
      var ticks = axis.getMajorTicks();
      
      // if no ticks or only one fill color, draw one big fill
      if (ticks.length == 0 || numFills == 1) {
        this._attachRectangle(group, 0, 0, w, h, this._getFillFromArray(fills, 0));
      } 
      
      if (ticks.length > 0) {
        if (numFills > 1)
          this._attachFills(group, axis, ticks, fills, null, vert);
        this._attachTicks(group, axis, ticks, majorStrokes, null, vert);
        this._attachMinorTicks(group, axis, ticks, minorStrokes, vert);
      }
    } else {
      // draw one big fill if no axis
      this._attachRectangle(group, 0, 0, w, h, this._getFillFromArray(fills, 0));
    }
  };
  
  /**
   * Renders fills for one direction, we render all fills that have the same fill in a rectangle group to reduce the number of objects and vector tags needed to render.
   * @private
   * @jsxobf-clobber
   */
  GridLines_prototype._attachFills = function( group, axis, ticks, fills, shapes, vert ) {
    if (shapes == null)
      shapes = new Array(this._getArrayLength(fills));
    
    if (shapes.length == 0) return;
    var h = group.getHeight();
    var w = group.getWidth();
    var maxLength = vert ? h : w;
    var crossLength = vert ? w : h;
    
    for (var i = 0; i <= ticks.length; i++) {
      // get or create the RectangleGroup with the appropriate fill
      var shape = shapes[i % shapes.length];
      if (shape == null) {
        shape = shapes[i % shapes.length] = new vector.RectangleGroup(0, 0, w, h);
        shape.setFill(this._getFillFromArray(fills, i));
        group.appendChild(shape);
      }
          
      if (i == ticks.length) {
        // do last fill
        if (ticks[i-1] < maxLength)
          this._addRectangle(shape, ticks[i-1], 0, maxLength, crossLength, vert);
      } else if (i == 0) {
        // do first fill
        if (ticks[i] > 0)
          this._addRectangle(shape, 0, 0, ticks[i], crossLength, vert);
      } else {
        // do middle fill
        this._addRectangle(shape, ticks[i-1], 0, ticks[i], crossLength, vert);
      }
    }
  };
  
  /**
   * make a rectangle 
   * @private
   * @jsxobf-clobber
   */
  GridLines_prototype._addRectangle = function( shape, x1, y1, x2, y2, vert ) {
    if (vert)
      shape.addRectangle(y1, x1, y2, x2);
    else
      shape.addRectangle(x1, y1, x2, y2);
  };
  
  /**
   * Renders ticks (major or minor) for a direction, we render all strokes that have the same stroke in a line group to reduce the number of objects and vector tags needed to render.
   * @private
   * @jsxobf-clobber
   */
  GridLines_prototype._attachTicks = function( group, axis, ticks, strokes, shapes, vert ) {
    if (shapes == null)
      shapes = new Array(this._getArrayLength(strokes));
    
    if (shapes.length == 0) return;
    var h = group.getHeight();
    var w = group.getWidth();
    
    for (var i = 0; i < ticks.length; i++) {
      // get or create the LineGroup with the appropriate stroke
      var shape = shapes[i % shapes.length];
      if (shape == null) {
        shape = shapes[i % shapes.length] = new vector.LineGroup(0, 0, w, h);
        shape.setStroke(this._getStrokeFromArray(strokes, i));
        group.appendChild(shape);
      }
      
      if (vert)
        shape.addRelativeLine(0, ticks[i], w, 0);
      else
        shape.addRelativeLine(ticks[i], 0, 0, h);
    }
  };

  /**
   * Renders minor ticks for a direction.
   * @private
   * @jsxobf-clobber
   */
  GridLines_prototype._attachMinorTicks = function( group, axis, ticks, strokes, vert ) {
    var numShapes = this._getArrayLength(strokes);
    if (numShapes == 0) return;
    
    var shapes = new Array(numShapes);
    
    for (var i = 0; i < ticks.length; i++) {
      var minorTicks = axis._getMinorTicks(ticks, i);
      this._attachTicks(group, axis, minorTicks, strokes, shapes, vert);
    }
  };

  /**
   * Renders a rectangle, not part of a jsx3.vector.RectangleGroup.
   * @private
   * @jsxobf-clobber
   */
  GridLines_prototype._attachRectangle = function(group, l, t, w, h, fill, zIndex) {
    if (fill != null) {
      var rect = new vector.Rectangle(l, t, w, h);
      if (zIndex != null) rect.setZIndex(zIndex);
      rect.setFill(fill);
      group.appendChild(rect);
    }
  };
  
  /**
   * create a vector fill from a string representation contained in an array
   * @param a {string/Array} the array of fills, or just one as a string
   * @param index {int} the index of the fill to return, will be mod'ed by the length of the array
   * @return {jsx3.vector.Fill}
   * @private
   * @jsxobf-clobber
   */
  GridLines_prototype._getFillFromArray = function( a, index ) {
    if (a == null) return null;
    
    if (jsx3.$A.is(a)) {
      if (a.length > 0) {
        return vector.Fill.valueOf(a[index % a.length]);
      } else {
        return null;
      }
    } else {
      return vector.Fill.valueOf(a);
    }
  };
  
  /**
   * create a VectorStroke from a string representation contained in an array
   * @param a {string/Array} the array of strokes, or just one as a string
   * @param index {int} the index of the stroke to return, will be mod'ed by the length of the array
   * @return {jsx3.vector.Stroke}
   * @private
   * @jsxobf-clobber
   */
  GridLines_prototype._getStrokeFromArray = function( a, index ) {
    if (a == null) return null;
    
    if (jsx3.$A.is(a)) {
      if (a.length > 0) {
        return Stroke.valueOf(a[index % a.length]);
      } else {
        return null;
      }
    } else {
      return Stroke.valueOf(a);
    }
  };
  
  /**
   * determines the length of an array, which may be null or just a plain object
   * @param a {object/Array} an array or a plain object
   * @return {int} the length of the array, 0 if null, or 1 if not an array
   * @private
   * @jsxobf-clobber
   */
  GridLines_prototype._getArrayLength = function( a ) {
    if (a == null) return 0;
    return (jsx3.$A.is(a)) ? a.length : 1;
  };
  
  /**
   * No children allowed.
   * @package
   */
  GridLines_prototype.onSetChild = function() {
    return false;
  };
  
  GridLines_prototype.onSetParent = function(objParent) {
    return jsx3.chart.Chart && objParent instanceof jsx3.chart.Chart;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  GridLines.getVersion = function() {
    return jsx3.chart.VERSION;
  };

/* @JSC :: end */

});
