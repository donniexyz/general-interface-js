/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.CartesianChart", "jsx3.chart.AreaSeries");

/**
 * An area chart.
 * <p/>
 * <b>Series</b>: AreaSeries only.<br/>
 * <b>Axes</b>: Y axis must be value axis, X axis can be value or category axis
 * <p/>
 * The 'type' my be 'overlay', 'stacked', or 'stacked100', which correspond to the basic Excel-like
 * variations of an area chart.
 */
jsx3.Class.defineClass("jsx3.chart.AreaChart", jsx3.chart.CartesianChart, null, function(AreaChart, AreaChart_prototype) {

  /**
   * {String}
   * @final @jsxobf-final
   */
  AreaChart.TYPE_OVERLAY = "overlay";

  /**
   * {String}
   * @final @jsxobf-final
   */
  AreaChart.TYPE_STACKED = "stacked";

  /**
   * {String}
   * @final @jsxobf-final
   */
  AreaChart.TYPE_STACKED100 = "stacked100";

  /** @private @jsxobf-clobber */
  AreaChart._ALLOWED_TYPES = {overlay: 1, stacked: 1, stacked100: 1};

  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param left {int} left position (in pixels) of the chart relative to its parent container
   * @param top {int} top position (in pixels) of the chart relative to its parent container
   * @param width {int} width (in pixels) of the chart
   * @param height {int} height (in pixels) of the chart
   */
  AreaChart_prototype.init = function(name, left, top, width, height) {
    //call constructor for super class
    this.jsxsuper(name, left, top, width, height);

    this.type = AreaChart.TYPE_OVERLAY;
  };

  /**
   * Returns the type field, corresponds to the variation of area chart, one of {'overlay','stacked','stacked100'}.
   * @return {String} type
   */
  AreaChart_prototype.getType = function() {
    return this.type;
  };

  /**
   * Sets the type field.
   * @param type {String} the new value for type, one of {'overlay','stacked','stacked100'}
   */
  AreaChart_prototype.setType = function( type ) {
    if (AreaChart._ALLOWED_TYPES[type]) {
      this.type = type;
    } else {
      throw new jsx3.IllegalArgumentException("type", type);
    }
  };

  /**
   * Returns the range of y values, considers chart type.
   */
  AreaChart_prototype.getYRange = function(series) {
    if (this.type == AreaChart.TYPE_OVERLAY) {
      return this.getRangeForField(series, "getYValue");
    } else if (this.type == AreaChart.TYPE_STACKED) {
      return this.getStackedRangeForField(series, "getYValue");
    } else if (this.type == AreaChart.TYPE_STACKED100) {
      return this.getStacked100RangeForField(series, "getYValue");
    } else {
      jsx3.chart.LOG.error("unsupported Line Chart type: " + this.type);
      return null;
    }
  };

  /**
   * Returns the range of x values, used when x axis is value axis.
   */
  AreaChart_prototype.getXRange = function(series) {
    return this.getRangeForField(series, "getXValue");
  };

  /**
   * Renders all vector elements and appends them to the render root.
   * @package
   */
  AreaChart_prototype.createVector = function() {
    this.jsxsuper();
    this._drawSeries();
  };

  /**
   * draws the series
   * @private
   * @jsxobf-clobber
   */
  AreaChart_prototype._drawSeries = function() {
    var root = this.getDataCanvas();
    var series = this.getDisplayedSeries();
    var dp = this.getDataProvider();
    
    var xAxis = this.getPrimaryXAxis();
    var yAxis = this.getPrimaryYAxis();

    if (xAxis == null || yAxis == null || series.length == 0 || dp == null)
      return;

    // validate axes
    if (! jsx3.chart.isValueAxis(yAxis)) {
      jsx3.chart.LOG.error("bad y axis type: " + yAxis.getClass());
      return;
    }
    
    // get totals for each category if stacked100, needed to normalize values
    var categoryTotals = null;
    if (this.type == AreaChart.TYPE_STACKED100)
      categoryTotals = this.getCategoryTotals(series, "getYValue");
    
    // if stacked, we'll need to keep track of category totals as we go
    var categoryPosSum = null, categoryNegSum = null;
    if (this.type == AreaChart.TYPE_STACKED || this.type == AreaChart.TYPE_STACKED100) {
      categoryPosSum = new Array(dp.length);
      categoryNegSum = new Array(dp.length);
      for (var j = 0; j < dp.length; j++) {
        categoryPosSum[j] = categoryNegSum[j] = 0;
      }
    }
    
    for (var i = 0; i < series.length; i++) {
      var ser = series[i];
      // clear the cached points
      ser.clearPoints();
      
      for (var j = 0; j < dp.length; j++) {
        var record = dp[j];
        
        var x = null, y = null, min = null;
        var yval = ser.getYValue(record);
        var minval = ser.getMinValue(record);
        
        // yval required! 
        if (yval == null) continue;
        
        // stack value if necessary
        if (this.type == AreaChart.TYPE_STACKED || this.type == AreaChart.TYPE_STACKED100) {
          if (yval >= 0) {
            minval = categoryPosSum[j];
            yval = categoryPosSum[j] + yval;
            categoryPosSum[j] = yval;
          } else {
            minval = categoryNegSum[j];
            yval = categoryNegSum[j] + yval;
            categoryNegSum[j] = yval;
          }
          
          if (this.type == AreaChart.TYPE_STACKED100) {
            yval = 100 * (yval / categoryTotals[j]);
            minval = 100 * (minval / categoryTotals[j]);
          }
        }
        
        if (minval == null)
          minval = 0;
        
        // area does NOT support clipping to the data area ... this would be very complicated
        y = yAxis.getCoordinateForNoClip(yval);
        // but we can easily clip the bottom of the area ... this won't render correctly if an 
        // area with a defined minimum line crosses over the clipping boundary
        min = yAxis.getCoordinateFor(minval);
        
        if (jsx3.chart.isValueAxis(xAxis)) {
          var xval = ser.getXValue(record);
          if (xval != null)
            x = xAxis.getCoordinateForNoClip(xval);
        } else if (jsx3.chart.isCategoryAxis(xAxis)) {
          x = xAxis.getPointForCategory(j);
        }
        
        if (x == null) continue;
        
        ser.addPoint(record, x, y, j);
        ser.addMinPoint(x, min);
      }
      
      ser.updateView();
      root.appendChild(ser.getCanvas());
    }
  };
  
  /**
   * Renders stacked series in reverse order, will look better.
   * @package
   */
  AreaChart_prototype.seriesZOrderReversed = function() {
    return this.type == AreaChart.TYPE_STACKED || 
        this.type == AreaChart.TYPE_STACKED100;
  };

  /**
   * allow AreaSeries only
   * @package
   */
  AreaChart_prototype.isValidSeries = function(series) {
    return series instanceof jsx3.chart.AreaSeries;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  AreaChart.getVersion = function() {
    return jsx3.chart.VERSION;
  };

/* @JSC :: end */

});
