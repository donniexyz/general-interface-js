/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.Chart", "jsx3.chart.Axis", "jsx3.chart.GridLines");

/**
 * Base chart class for charts that render on a cartesian plane with x and y axes. Currently only supports
 * primary x and y axes, even though there are methods pertaining to secondary axes.
 * <p/>
 * Cartesian charts can have the following additional children:
 * <ol>
 *   <li>{0,n} GridLines, will render lines aligned with the axes below or above the data series</li>
 *   <li>{2,n} Axis, required to define the coordinate space of the cartesian plane</li>
 * </ol>
 */
jsx3.Class.defineClass("jsx3.chart.CartesianChart", jsx3.chart.Chart, null, function(CartesianChart, CartesianChart_prototype) {
  
  var chart = jsx3.chart;
  var Chart = chart.Chart;
  var GridLines = chart.GridLines;
  var Axis = chart.Axis;
  
  /**
   * Filter function finds primary x axis.
   * @private
   * @jsxobf-clobber
   */
  CartesianChart._XPRIMARY_FILTER = function(c) {
    return (c instanceof Axis) && c.getPrimary() && c.getHorizontal(); 
  };

  /**
   * Filter function finds secondary x axis.
   * @private
   * @jsxobf-clobber
   */
  CartesianChart._XSECONDARY_FILTER = function(c) {
    return (c instanceof Axis) && !c.getPrimary() && c.getHorizontal(); 
  };

  /**
   * Filter function finds primary y axis.
   * @private
   * @jsxobf-clobber
   */
  CartesianChart._YPRIMARY_FILTER = function(c) {
    return (c instanceof Axis) && c.getPrimary() && !c.getHorizontal(); 
  };

  /**
   * Filter function finds secondary y axis.
   * @private
   * @jsxobf-clobber
   */
  CartesianChart._YSECONDARY_FILTER = function(c) {
    return (c instanceof Axis) && !c.getPrimary() && !c.getHorizontal(); 
  };

  // Z-Index values for the various components.
  /** @private @jsxobf-clobber */
  CartesianChart._ZINDEX_GRIDLINES = Chart.ZINDEX_DATA + 1;
  /** @private @jsxobf-clobber */
  CartesianChart._ZINDEX_GRIDLINES_FOREGROUND = Chart.ZINDEX_DATA + 90;
  /** @private @jsxobf-clobber */
  CartesianChart._ZINDEX_AXIS = Chart.ZINDEX_DATA + 100;

  CartesianChart.PART_GRIDLINES = 1 << 8;
  
  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param left {int} left position (in pixels) of the chart relative to its parent container
   * @param top {int} top position (in pixels) of the chart relative to its parent container
   * @param width {int} width (in pixels) of the chart
   * @param height {int} height (in pixels) of the chart
   */
  CartesianChart_prototype.init = function(name, left, top, width, height) {
    //call constructor for super class
    this.jsxsuper(name, left, top, width, height);
  };

  /**
   * Returns the array of children GridLines instances.
   * @return {Array<jsx3.chart.GridLines>} gridLines
   */
  CartesianChart_prototype.getGridLines = function() {
    return GridLines ? this.getDescendantsOfType(GridLines) : [];
  };

  /**
   * Returns a list of series children that should be drawn against axis.
   * @param axis {jsx3.chart.Axis} 
   * @return {Array<jsx3.chart.Series>}
   * @package
   */
  CartesianChart_prototype.getSeriesForAxis = function( axis, bDisplayedOnly ) {
    var matches = [];
    var series = bDisplayedOnly ? this.getDisplayedSeries() : this.getSeries();
    for (var i = 0; i < series.length; i++) {
      if ((axis.getHorizontal() && axis.getPrimary() == series[i].getUsePrimaryX()) ||
          (!axis.getHorizontal() && axis.getPrimary() == series[i].getUsePrimaryY()))
        matches.push(series[i]);
    }
    return matches;
  };
  
  /**
   * Returns the primary x axis, if any.
   * @return {jsx3.chart.Axis} primaryXAxis
   */
  CartesianChart_prototype.getPrimaryXAxis = function() {
    return this.findDescendants(CartesianChart._XPRIMARY_FILTER, false, false, true);
  };

  /**
   * Returns the secondary x axis, if any.
   * @return {jsx3.chart.Axis} secondaryXAxis
   * @package
   */
  CartesianChart_prototype.getSecondaryXAxis = function() {
    return this.findDescendants(CartesianChart._XSECONDARY_FILTER, false, false, true);
  };

  /**
   * Returns the primary y axis, if any.
   * @return {jsx3.chart.Axis} primaryYAxis
   */
  CartesianChart_prototype.getPrimaryYAxis = function() {
    return this.findDescendants(CartesianChart._YPRIMARY_FILTER, false, false, true);
  };

  /**
   * Returns the secondary y axis, if any.
   * @return {jsx3.chart.Axis} secondaryYAxis
   * @package
   */
  CartesianChart_prototype.getSecondaryYAxis = function() {
    return this.findDescendants(CartesianChart._YSECONDARY_FILTER, false, false, true);
  };

  /**
   * Returns the range for axis, delegates to getXRange() or getYRange().
   * @param axis {jsx3.chart.Axis} 
   * @return {Array<Number>} [min,max] or null if no range can be found
   */
  CartesianChart_prototype.getRangeForAxis = function( axis ) {
    var series = this.getSeriesForAxis(axis, true);
    return axis.getHorizontal() ? this.getXRange(series) : this.getYRange(series);
  };
  
  /**
   * Returns the range of x values in the data provider, subclasses must implement.
   * @param series {Array<jsx3.chart.Series>} the series to consider
   * @return {Array<Number>} [min,max] or null if no range can be found
   */
  CartesianChart_prototype.getXRange = jsx3.Method.newAbstract('series');
  
  /**
   * Returns the range of y values in the data provider, subclasses must implement.
   * @param series {Array<jsx3.chart.Series>} the series to consider
   * @return {Array<Number>} [min,max] or null if no range can be found
   */
  CartesianChart_prototype.getYRange = jsx3.Method.newAbstract('series');
  
  /**
   * Returns the range of the return values of a function when applied over a number of series and all the categories.
   * @param series {Array<jsx3.chart.Series>} the series to consider
   * @param functName {String} the name of the value function to call on each series
   * @return {Array<Number>} [min,max] or null if no range can be found
   * @package
   */
  CartesianChart_prototype.getRangeForField = function(series, functName) {
    var dp = this.getDataProvider();
    if (dp == null) {
      chart.LOG.debug("no data provider for chart: " + this);
      return null;
    }
    
    var max = Number.NEGATIVE_INFINITY;
    var min = Number.POSITIVE_INFINITY;
    
    for (var i = 0; i < dp.length; i++) {
      var record = dp[i];
      
      for (var j = 0; j < series.length; j++) {
        var ser = series[j];
        var value = ser[functName](record);
        if (value != null) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      }
    }
    
    if (max == Number.NEGATIVE_INFINITY || min == Number.POSITIVE_INFINITY) return null;
    return [min, max];
  };

  /**
   * calculates the stack of the return values of a function applied to every series for each category, and then returns the range of the stacks; a stack is like a sum but divided into negative and positive sums
   * @param series {Array<jsx3.chart.Series>} the series to consider
   * @param functName {String} the name of the value function to call on each series
   * @return {Array<Number>} [min,max] or null if no range can be found
   * @package
   */
  CartesianChart_prototype.getStackedRangeForField = function(series, functName) {
    var dp = this.getDataProvider();
    if (dp == null) {
      chart.LOG.debug("no data provider for chart: " + this);
      return null;
    }

    var max = Number.NEGATIVE_INFINITY;
    var min = Number.POSITIVE_INFINITY;
    
    for (var i = 0; i < dp.length; i++) {
      var record = dp[i];
      
      // calculate the stack for this record
      var pos = 0, neg = 0;
      
      for (var j = 0; j < series.length; j++) {
        var ser = series[j];
        var value = ser[functName](record);
        if (value == null) continue;
        
        if (value >= 0) pos += value;
        else neg += value;
      }
      
      // expand range to this stack's range
      min = Math.min(min, neg);
      max = Math.max(max, pos);
    } 
    
    if (max == Number.NEGATIVE_INFINITY || min == Number.POSITIVE_INFINITY) return null;
    return [min, max];
  };

  /**
   * like getStackedRangeForField() but each stack is normalized to 100%; will always return [0,100] if all values are positive, otherwise [n,n+100] where -100 <= n < 0
   * @param series {Array<jsx3.chart.Series>} the series to consider
   * @param functName {String} the name of the value function to call on each series
   * @return {Array<Number>} [min,max] or null if no range can be found
   * @package
   */
  CartesianChart_prototype.getStacked100RangeForField = function(series, functName) {
    var dp = this.getDataProvider();
    if (dp == null) {
      chart.LOG.debug("no data provider for chart: " + this);
      return null;
    }

    var max = Number.NEGATIVE_INFINITY;
    var min = Number.POSITIVE_INFINITY;
    
    for (var i = 0; i < dp.length; i++) {
      var record = dp[i];
      
      var pos = 0, neg = 0, tot = 0;
      
      for (var j = 0; j < series.length; j++) {
        var ser = series[j];
        var value = ser[functName](record);
        if (value == null) continue;
        
        tot += Math.abs(value);
        if (value >= 0) pos += value;
        else neg += value;
      }
      
      var x1 = tot == 0 ? 0 : (100 * neg / tot);
      var x2 = tot == 0 ? 0 : (100 * pos / tot);
      min = Math.min(min, x1);
      max = Math.max(max, x2);
    } 
    
    if (max == Number.NEGATIVE_INFINITY || min == Number.POSITIVE_INFINITY) return null;
    return [min, max];
  };

  /**
   * combine two or more ranges into one union
   * @param ranges {Array<Array<Number>>} the ranges to combine, may contain null values
   * @return {Array<Number>} [min,max]
   * @package
   */
  CartesianChart_prototype.getCombinedRange = function(ranges) {
    var max = Number.NEGATIVE_INFINITY;
    var min = Number.POSITIVE_INFINITY;
    
    for (var i = 0; i < ranges.length; i++) {
      if (ranges[i] != null) {
        min = Math.min(min, ranges[i][0]);
        max = Math.max(max, ranges[i][1]);
      }
    }
    
    if (max == Number.NEGATIVE_INFINITY || min == Number.POSITIVE_INFINITY) return null;
    return [min, max];
  };
  
  /**
   * Renders all vector elements and appends them to the render root.
   * @package
   */
  CartesianChart_prototype.createVector = function() {
    this.jsxsuper();
    var root = this.getDataCanvas();
    
    var pxAxis = this.getPrimaryXAxis();
    var pyAxis = this.getPrimaryYAxis();
    var sxAxis = this.getSecondaryXAxis();
    var syAxis = this.getSecondaryYAxis();
    
    var w = root.getWidth();
    var h = root.getHeight();
    var padding = root.getPaddingDimensions();
    
    var dataDim = null;
    
    // two passes on the axes, i suppose that this could actually be insufficient to render well in
    // all cases but it seems to work well in general. basically an axis needs to know where it and its
    // opposing axis will render before it know how much room the axis and the labels/ticks/title will
    // take up, but then adjusting for that changes the inputs that went into the adjustments ...
    for (var i = 1; i <= 2; i++) {
      var axisWidth = null;
      if (i == 1) {
        // first pass uses rough estimate of axis gutter based on default or user supplied value
        // of getDisplayWidth()
        axisWidth = [
          sxAxis != null ? sxAxis.getDisplayWidth() : 0,
          syAxis != null ? syAxis.getDisplayWidth() : 0,
          pxAxis != null ? pxAxis.getDisplayWidth() : 0,
          pyAxis != null ? pyAxis.getDisplayWidth() : 0
        ];
      } else {
        // second pass refines values set in first pass but trying to calculate how much the 
        // label/ticks/title extrude from the data area
        axisWidth = this._getAxisMetrics(sxAxis, syAxis, pxAxis, pyAxis);
      }

      dataDim = [padding[3]+axisWidth[3], padding[0]+axisWidth[0], 
        w-(padding[3]+axisWidth[3]+padding[1]+axisWidth[1]), 
        h-(padding[0]+axisWidth[0]+padding[2]+axisWidth[2])];
    
      this._prepareAxis(pxAxis, dataDim[2]);
      this._prepareAxis(pyAxis, dataDim[3]);
      this._prepareAxis(sxAxis, dataDim[2]);
      this._prepareAxis(syAxis, dataDim[3]);
    }
    
    // render grid lines
    var grids = this.getGridLines();
    for (var i = 0; i < grids.length; i++) {
      var gridLines = grids[i];
      if (gridLines.getDisplay() == jsx3.gui.Block.DISPLAYNONE) continue;

      gridLines.setDimensions(dataDim);
      gridLines.setZIndex(gridLines.getInForeground() ? 
          CartesianChart._ZINDEX_GRIDLINES_FOREGROUND : CartesianChart._ZINDEX_GRIDLINES);
          
      gridLines.updateView();
      root.appendChild(gridLines.getCanvas());
    }
    
    this._updateAxisView(pxAxis, dataDim[0], dataDim[1]);
    this._updateAxisView(pyAxis, dataDim[0], dataDim[1]);
    this._updateAxisView(sxAxis, dataDim[0], dataDim[1]);
    this._updateAxisView(syAxis, dataDim[0], dataDim[1]);
    
    // define bounds of each series
    var series = this.getDisplayedSeries();
    for (var i = 0; i < series.length; i++) {
      series[i].setDimensions(dataDim);
    }
  };

  /**
   * updates axis length and calls prePaintUpdate()
   * @private
   * @jsxobf-clobber
   */
  CartesianChart_prototype._prepareAxis = function( axis, length ) {
    if (axis != null) {
      axis.setLength(length);
      axis.prePaintUpdate();
    }
  };
  
  /**
   * Renders the axis, appends it to the render root.
   * @param axis {jsx3.chart.Axis} the axis
   * @param offsetX {int} horizontal offset of the upper-left corner of the axis from the upper-left corner of the data canvas
   * @param offsetY {int} vertical offset of the upper-left corner of the axis from the upper-left corner of the data canvas
   * @private
   * @jsxobf-clobber
   */
  CartesianChart_prototype._updateAxisView = function( axis, offsetX, offsetY ) {
    var root = this.getDataCanvas();
    if (axis != null) {
      // not sure if we couldn't just make the axis dimensions smaller and cut the offset since
      // VML tags never clip
      axis.setDimensions(offsetX, offsetY, root.getWidth(), root.getHeight());
      axis.setZIndex(CartesianChart._ZINDEX_AXIS);
      
      axis.updateView();
      root.appendChild(axis.getCanvas());
    }
  };

  /**
   * calculate the total gutter space needed for all the axes
   * @return {Array<int>} [top,right,bottom,left]
   * @private
   * @jsxobf-clobber
   */
  CartesianChart_prototype._getAxisMetrics = function( sxAxis, syAxis, pxAxis, pyAxis ) {
    var l = 0, t = 0, r = 0, b = 0;
    
    if (sxAxis != null) {
      var gutter = sxAxis._getGutterWidths();
      t = gutter[1];
      b = gutter[0];
    }
    if (syAxis != null) {
      var gutter = syAxis._getGutterWidths();
      r += gutter[0];
      l += gutter[1];
    }
    if (pxAxis != null) {
      var gutter = pxAxis._getGutterWidths();
      b = Math.max(b, gutter[1]);
      t = Math.max(t, gutter[0]);
    }
    if (pyAxis != null) {
      var gutter = pyAxis._getGutterWidths();
      l = Math.max(l, gutter[0]);
      r = Math.max(r, gutter[1]);
    }
    
    return [t,r,b,l];
  };
  
  /**
   * the beginning of a more efficient repaint method
   * @param mask {int} a bit mask that determines which sub parts of the chart are repainted
   * @package
   */
  CartesianChart_prototype.repaintParts = function( mask ) {
    if (mask & CartesianChart.PART_GRIDLINES) {
      var grids = this.getGridLines();
      for (var i = 0; i < grids.length; i++) {
        var gridLines = grids[i];
        if (gridLines.getDisplay() == jsx3.gui.Block.DISPLAYNONE) continue;
        
        gridLines.setZIndex(gridLines.getInForeground() ? 
            CartesianChart._ZINDEX_GRIDLINES_FOREGROUND : CartesianChart._ZINDEX_GRIDLINES);
        gridLines.repaint();
      }
    }
    
    this.jsxsuper(mask);
  };
  
  /**
   * allow children of type GridLines and Axis
   * @return {boolean}
   * @package
   */
  CartesianChart_prototype.onSetChild = function( child ) {
    if (GridLines && child instanceof GridLines) {
      return true;
    } else if (Axis && child instanceof Axis) {
      return true;
    } else {
      return this.jsxsuper(child);
    }
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  CartesianChart.getVersion = function() {
    return chart.VERSION;
  };

/* @JSC :: end */

});
