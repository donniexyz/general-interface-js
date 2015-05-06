/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.CartesianChart", "jsx3.chart.BarSeries");

// @jsxobf-clobber-shared  _getParallelValue _getNormalValue _getNormalWidth

/**
 * Superclass of bar and column chart. Contains all the common functionality, provides template methods
 * to the subclasses so that they can render horizontal bars or vertical columns.
 * <p/>
 * Basically abstracts a bar/column chart into a chart with a parallel dimension and a normal dimension.
 * The parallel dimension is the dimension in which the rows/columns extend.
 */
jsx3.Class.defineClass("jsx3.chart.BCChart", jsx3.chart.CartesianChart, null, function(BCChart, BCChart_prototype) {

  /**
   * {String}
   * @final @jsxobf-final
   */
  BCChart.TYPE_CLUSTERED = "clustered";

  /**
   * {String}
   * @final @jsxobf-final
   */
  BCChart.TYPE_STACKED = "stacked";

  /**
   * {String}
   * @final @jsxobf-final
   */
  BCChart.TYPE_STACKED100 = "stacked100";

  /** @private @jsxobf-clobber */
  BCChart._ALLOWED_TYPES = {clustered: 1, stacked: 1, stacked100: 1};

  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param left {int} left position (in pixels) of the chart relative to its parent container
   * @param top {int} top position (in pixels) of the chart relative to its parent container
   * @param width {int} width (in pixels) of the chart
   * @param height {int} height (in pixels) of the chart
   */
  BCChart_prototype.init = function(name, left, top, width, height) {
    //call constructor for super class
    this.jsxsuper(name, left, top, width, height);

    this.type = BCChart.TYPE_CLUSTERED;
    this.seriesOverlap = 0;
    this.categoryCoverage = 0.65;
  };

  /**
   * Returns the type field, corresponds to the variation of chart, one of {'clustered','stacked','stacked100'}.
   * @return {String} type
   */
  BCChart_prototype.getType = function() {
    return this.type;
  };

  /**
   * Sets the type field.
   * @param type {String} the new value for type, one of {'clustered','stacked','stacked100'}
   */
  BCChart_prototype.setType = function( type ) {
    if (BCChart._ALLOWED_TYPES[type])
      this.type = type;
    else
      throw new jsx3.IllegalArgumentException("type", type);
  };

  /**
   * Returns the seriesOverlap field, the ratio of a column width/row height that a column/row overlaps with the adjacent column/row.
   * @return {float} seriesOverlap
   */
  BCChart_prototype.getSeriesOverlap = function() {
    return !isNaN(this.seriesOverlap) ? this.seriesOverlap : 0;
  };

  /**
   * Sets the seriesOverlap field.
   * @param seriesOverlap {float} the new value for seriesOverlap, usually between -0.5 and 0.5
   */
  BCChart_prototype.setSeriesOverlap = function( seriesOverlap ) {
    this.seriesOverlap = seriesOverlap;
  };

  /**
   * Returns the categoryCoverage field, the ratio of the range of a category that is covered by bars/columns.
   * @return {float} categoryCoverage
   */
  BCChart_prototype.getCategoryCoverage = function() {
    return !isNaN(this.categoryCoverage) ? this.categoryCoverage : 1;
  };

  /**
   * Sets the categoryCoverage field.
   * @param categoryCoverage {float} the new value for categoryCoverage, between 0 and 1
   */
  BCChart_prototype.setCategoryCoverage = function( categoryCoverage ) {
    this.categoryCoverage = categoryCoverage;
  };
  
  /**
   * the axis parallel to the length of the bars or columns.
   * @return {jsx3.chart.Axis}
   * @private
   * @jsxobf-clobber
   */
  BCChart_prototype._getParallelAxis = jsx3.Method.newAbstract();

  /**
   * the axis normal (perpendicular) to the length of the bars or columns.
   * @return {jsx3.chart.Axis}
   * @private
   * @jsxobf-clobber
   */
  BCChart_prototype._getNormalAxis = jsx3.Method.newAbstract();

  /**
   * calculate the bounds of clustered columns or bars within the bounds of a category
   * @param x1 {int} the min bound of the category
   * @param x2 {int} the max bound of the category
   * @param index {int} the index of the bar/column out of all the bars/columns
   * @param total {int} the total number of bars/columns
   * @param overlap {float} the seriesOverlap value
   * @param coverage {float} the categoryCoverage value
   * @return {Array<int>} [min,max]
   * @package
   * @jsxobf-clobber
   */
  BCChart_prototype.getBoundsOfClustered = function( x1, x2, index, total, overlap, coverage ) {
    if (this.type == BCChart.TYPE_STACKED || this.type == BCChart.TYPE_STACKED100) {
      index = 0; total = 1;
    }
    
    var height = x2 - x1;
    var usedHeight = height * coverage;
    var mid = (x1+x2)/2;
    
    var boundsHeight = usedHeight / (total - total * overlap + overlap);
    var boundsOffset = boundsHeight * (index - (total-1)/2) * (1 - overlap);
  
    // make sure we don't get unintended overlap through rounding ...
    var min = null;
    if (index > 0 && overlap == 0) {
      var lastOffset = boundsHeight * ((index-1) - (total-1)/2) * (1 - overlap);
      min = Math.round(mid + lastOffset + boundsHeight/2);
    } else {
      min = Math.round(mid + boundsOffset - boundsHeight/2);
    }
    
    var max = Math.round(mid + boundsOffset + boundsHeight/2) - 1;
    
    return [min,max];
  };

  /**
   * the range along the parallel axis
   * @return {Array<int>} [min,max]
   * @package
   * @jsxobf-clobber
   */
  BCChart_prototype.getParallelRange = function(series) {
    if (this.type == BCChart.TYPE_CLUSTERED) {
      var r1 = this.getRangeForField(series, "_getParallelValue");
      var r2 = this.getRangeForField(series, "getMinValue");
      return this.getCombinedRange([r1, r2]);
    } else if (this.type == BCChart.TYPE_STACKED) {
      return this.getStackedRangeForField(series, "_getParallelValue");
    } else if (this.type == BCChart.TYPE_STACKED100) {
      return this.getStacked100RangeForField(series, "_getParallelValue");
    } else {
      jsx3.chart.LOG.error("unsupported Bar/Column Chart type: " + this.type);
      return null;
    }
  };

  /**
   * the range along the normal axis
   * @return {Array<int>} [min,max]
   * @package
   * @jsxobf-clobber
   */
  BCChart_prototype.getNormalRange = function(series) {
    return this.getRangeForField(series, "_getNormalValue");
  };

  /**
   * Renders all vector elements and appends them to the render root.
   * @package
   */
  BCChart_prototype.createVector = function() {
    this.jsxsuper();
    this._drawSeries();
  };

  /**
   * draws the series
   * @package
   */
  BCChart_prototype._drawSeries = function() {
    var root = this.getDataCanvas();
    
    var series = this.getDisplayedSeries();
    var numSeries = series.length;
    if (numSeries == 0) return;
    
    var dp = this.getDataProvider();
    
    var pAxis = this._getParallelAxis();
    var nAxis = this._getNormalAxis();
    
    if (dp == null || pAxis == null || nAxis == null) return;
    
    // check for valid axes
    if (! jsx3.chart.isValueAxis(pAxis)) {
      jsx3.chart.LOG.error("bad parallel axis type: " + pAxis.getClass());
      return;
    }
    
    var seriesOverlap = this.getSeriesOverlap();
    var categoryCoverage = this.getCategoryCoverage();
    
    // need to collect totals to normalize 100%
    var categoryTotals = null;
    if (this.type == BCChart.TYPE_STACKED100)
      categoryTotals = this.getCategoryTotals(series, "_getParallelValue");

    // if stacked, we'll need to keep track of category totals as we go
    var categoryPosSum = null, categoryNegSum = null;
    if (this.type == BCChart.TYPE_STACKED || this.type == BCChart.TYPE_STACKED100) {
      categoryPosSum = new Array(dp.length);
      categoryNegSum = new Array(dp.length);
      for (var j = 0; j < dp.length; j++) {
        categoryPosSum[j] = categoryNegSum[j] = 0;
      }
    }

    for (var j = 0; j < numSeries; j++) {
      var ser = series[j];
      ser.clearAreas();
      
      for (var i = 0; i < dp.length; i++) {
        var record = dp[i];

        // get X bounds of the box        
        var pmin = null, pmax = null;
        
        if (jsx3.chart.isValueAxis(pAxis)) {
          var pValue = ser._getParallelValue(record);
          
          if (this.type == BCChart.TYPE_CLUSTERED) {
            pmin = ser.getMinValue(record);
            if (pmin == null) pmin = 0;
            pmax = pValue;
            
            if (pmax == null) {
              continue;
            }
          } else if (this.type == BCChart.TYPE_STACKED || this.type == BCChart.TYPE_STACKED100) {
            var value = this.type == BCChart.TYPE_STACKED ? 
                pValue :
                100 * (pValue / categoryTotals[i]);
              
            if (value >= 0) {
              pmin = categoryPosSum[i];
              pmax = categoryPosSum[i] + value;
              categoryPosSum[i] = pmax;
            } else {
              pmin = categoryNegSum[i] + value;
              pmax = categoryNegSum[i];
              categoryNegSum[i] = pmin;
            }
          }
        }

        var p1 = pAxis.getCoordinateForNoClip(pmin);
        // nudge min up one pixel so no overlap
        if (pmin != 0)
          p1 += (pAxis.getHorizontal() ? 1 : -1);
        var p2 = pAxis.getCoordinateForNoClip(pmax);
        
        // get Y bounds of the box
        var n1 = null, n2 = null;
        
        if (jsx3.chart.isValueAxis(nAxis)) {
          var nValue = ser._getNormalValue(record);
          if (nValue == null) continue;
          var nmid = nAxis.getCoordinateForNoClip(nValue);
          var nWidth = ser._getNormalWidth();
          n1 = nmid - Math.ceil(nWidth/2);
          n2 = nmid + Math.floor(nWidth/2);
        } else if (jsx3.chart.isCategoryAxis(nAxis)) {
          var nRange = nAxis.getRangeForCategory(i);
          var bounds = this.getBoundsOfClustered(nRange[0], nRange[1], j, 
            numSeries, seriesOverlap, categoryCoverage);
          n1 = bounds[0];
          n2 = bounds[1];
        }
        
        ser.drawArea(record, i, p1, n1, p2, n2);
      }
      
      ser.updateView();
      root.appendChild(ser.getCanvas());
    }
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  BCChart.getVersion = function() {
    return jsx3.chart.VERSION;
  };

/* @JSC :: end */

});


/**
 * A bar chart.
 * <p/>
 * <b>Series</b>: BarSeries only. <br/>
 * <b>Axes</b>: X axis must be value axis, Y axis can be value or category axis
 * <p/>
 * The 'type' my be 'clustered', 'stacked', or 'stacked100', which correspond to the basic Excel-like
 * variations of a bar chart.
 */
jsx3.Class.defineClass("jsx3.chart.BarChart", jsx3.chart.BCChart, null, function(BarChart, BarChart_prototype) {

  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param left {int} left position (in pixels) of the chart relative to its parent container
   * @param top {int} top position (in pixels) of the chart relative to its parent container
   * @param width {int} width (in pixels) of the chart
   * @param height {int} height (in pixels) of the chart
   */
  BarChart_prototype.init = function(name, left, top, width, height) {
    this.jsxsuper(name, left, top, width, height);
  };
  
  /**
   * allow BarSeries only
   * @package
   */
  BarChart_prototype.isValidSeries = function(series) {
    return series instanceof jsx3.chart.BarSeries;
  };

  /**
   * @return {Array<Number>} <code>[min, max]</code>.
   */
  BarChart_prototype.getXRange = function(series) {
    return this.getParallelRange(series);
  };

  /**
   * @return {Array<Number>} <code>[min, max]</code>.
   */
  BarChart_prototype.getYRange = function(series) {
    return this.getNormalRange(series);
  };

  BarChart_prototype._getParallelAxis = function() {
    return this.getPrimaryXAxis();
  };

  BarChart_prototype._getNormalAxis = function() {
    return this.getPrimaryYAxis();
  };

});


/**
 * A column chart.
 * <p/>
 * <b>Series</b>: ColumnSeries only. <br/>
 * <b>Axes</b>: Y axis must be value axis, X axis can be value or category axis
 * <p/>
 * The 'type' my be 'clustered', 'stacked', or 'stacked100', which correspond to the basic Excel-like
 * variations of a column chart.
 */
jsx3.Class.defineClass("jsx3.chart.ColumnChart", jsx3.chart.BCChart, null, function(ColumnChart, ColumnChart_prototype) {
  
  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param left {int} left position (in pixels) of the chart relative to its parent container
   * @param top {int} top position (in pixels) of the chart relative to its parent container
   * @param width {int} width (in pixels) of the chart
   * @param height {int} height (in pixels) of the chart
   */
  ColumnChart_prototype.init = function(name, left, top, width, height) {
    this.jsxsuper(name, left, top, width, height);
  };

  /**
   * allow ColumnSeries only
   * @package
   */
  ColumnChart_prototype.isValidSeries = function(series) {
    return series instanceof jsx3.chart.ColumnSeries;
  };

  /**
   * @return {Array<Number>} <code>[min, max]</code>.
   */
  ColumnChart_prototype.getXRange = function(series) {
    return this.getNormalRange(series);
  };

  /**
   * @return {Array<Number>} <code>[min, max]</code>.
   */
  ColumnChart_prototype.getYRange = function(series) {
    return this.getParallelRange(series);
  };

  ColumnChart_prototype._getParallelAxis = function() {
    return this.getPrimaryYAxis();
  };

  ColumnChart_prototype._getNormalAxis = function() {
    return this.getPrimaryXAxis();
  };

});
