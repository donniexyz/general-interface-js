/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.CartesianChart", "jsx3.chart.PointSeries");

/**
 * An plot (scatter/point/bubble) chart.
 * <p/>
 * <b>Series</b>: PointSeries, BubbleSeries
 * <b>Axes</b>: both X and Y axis must be value axes
 */
jsx3.Class.defineClass("jsx3.chart.PlotChart", jsx3.chart.CartesianChart, null, function(PlotChart, PlotChart_prototype) {

  /**
   * {String}
   * @final @jsxobf-final
   */
  PlotChart.MAG_RADIUS = "radius";

  /**
   * {String}
   * @final @jsxobf-final
   */
  PlotChart.MAG_DIAMETER = "diameter";

  /**
   * {String}
   * @final @jsxobf-final
   */
  PlotChart.MAG_AREA = "area";

  /**
   * {String}
   */
  PlotChart.DEFAULT_MAX_POINT_RADIUS = 30;

  /** @private @jsxobf-clobber */
  PlotChart._ALLOWED_MAGNITUDE_METHODS = {radius: 1, diameter: 1, area: 1};
  
  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param left {int} left position (in pixels) of the chart relative to its parent container
   * @param top {int} top position (in pixels) of the chart relative to its parent container
   * @param width {int} width (in pixels) of the chart
   * @param height {int} height (in pixels) of the chart
   */
  PlotChart_prototype.init = function(name, left, top, width, height) {
    //call constructor for super class
    this.jsxsuper(name, left, top, width, height);

    this.maxPointRadius = PlotChart.DEFAULT_MAX_POINT_RADIUS;
    this.magnitudeMethod = PlotChart.MAG_RADIUS;
  };

  /**
   * Returns the maxPointRadius field, limit the radius of points on this chart to this value.
   * @return {int} maxPointRadius
   */
  PlotChart_prototype.getMaxPointRadius = function() {
    return this.maxPointRadius != null ? this.maxPointRadius : Number.POSITIVE_INFINITY;
  };

  /**
   * Sets the maxPointRadius field.
   * @param maxPointRadius {int} the new value for maxPointRadius
   */
  PlotChart_prototype.setMaxPointRadius = function( maxPointRadius ) {
    this.maxPointRadius = maxPointRadius;
  };

  /**
   * Returns the magnitudeMethod field; the magnitude method defines how the magnitude value of a record in a bubble series is converted to a radius for the rendered point; a value of "radius" means that the magnitude will equal the radius of the point, "diameter" means that the magnitude will equal the diameter (2 * radius), and "area" means that the area of the point will be proportional to the magnitude.
   * @return {String} magnitudeMethod, one of {"radius","diameter","area"}
   */
  PlotChart_prototype.getMagnitudeMethod = function() {
    return this.magnitudeMethod;
  };

  /**
   * Sets the magnitudeMethod field, one of {"radius","diameter","area"}.
   * @param magnitudeMethod {String} the new value for magnitudeMethod
   */
  PlotChart_prototype.setMagnitudeMethod = function( magnitudeMethod ) {
    if (PlotChart._ALLOWED_MAGNITUDE_METHODS[magnitudeMethod]) {
      this.magnitudeMethod = magnitudeMethod;
    } else {
      throw new jsx3.IllegalArgumentException("magnitudeMethod", magnitudeMethod);
    }
  };

  /**
   * Returns the range of x values.
   */
  PlotChart_prototype.getXRange = function(series) {
    return this.getRangeForField(series, "getXValue");
  };

  /**
   * Returns the range of y values.
   */
  PlotChart_prototype.getYRange = function(series) {
    return this.getRangeForField(series, "getYValue");
  };

  /**
   * Renders all vector elements and appends them to the render root.
   * @package
   */
  PlotChart_prototype.createVector = function() {
    this.jsxsuper();
    this._drawSeries();
  };

  /**
   * draws the series
   * @private
   * @jsxobf-clobber
   */
  PlotChart_prototype._drawSeries = function() {
    var root = this.getDataCanvas();
    var series = this.getDisplayedSeries();
    var dp = this.getDataProvider();
    
    var xAxis = this.getPrimaryXAxis();
    var yAxis = this.getPrimaryYAxis();
    
    if (xAxis == null || yAxis == null || series.length == 0 || dp == null)
      return;
    
    // validate axes
    if (! jsx3.chart.isValueAxis(xAxis)) {
      jsx3.chart.LOG.error("bad x axis type: " + xAxis.getClass());
      return;
    }

    if (! jsx3.chart.isValueAxis(yAxis)) {
      jsx3.chart.LOG.error("bad y axis type: " + yAxis.getClass());
      return;
    }
    
    for (var j = 0; j < series.length; j++) {
      var ser = series[j];
      ser.clearPoints();

      for (var i = 0; i < dp.length; i++) {
        var record = dp[i];      
        
        var x = ser.getXValue(record);
        var y = ser.getYValue(record);
        if (x == null || y == null) continue;

        // addPoint() will clip points if need be
        x = xAxis.getCoordinateForNoClip(x);
        y = yAxis.getCoordinateForNoClip(y);

        if (ser instanceof jsx3.chart.PointSeries) {
          ser.addPoint(record, i, x, y);
        } else {
          var mag = ser.getMagnitudeValue(record);
          if (mag != null)
            ser.addPoint(record, i, x, y, mag);
        }
      }
      
      ser.updateView();
      root.appendChild(ser.getCanvas());
    }
  };
  
  /**
   * allow PointSeries and PointSeries
   * @package
   */
  PlotChart_prototype.isValidSeries = function(series) {
    return series instanceof jsx3.chart.PlotSeries;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  PlotChart.getVersion = function() {
    return jsx3.chart.VERSION;
  };

/* @JSC :: end */

});
