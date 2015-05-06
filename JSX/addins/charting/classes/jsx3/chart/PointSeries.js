/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.Series", "jsx3.chart.PointRenderer");

/**
 * Class encapsulating behavior shared by PointSeries and BubbleSeries
 */
jsx3.Class.defineClass("jsx3.chart.PlotSeries", jsx3.chart.Series, null, function(PlotSeries, PlotSeries_prototype) {
  
  /** @private @jsxobf-clobber @jsxobf-final */
  PlotSeries._DEFAULT_AREA_MULTIPLIER = 25;
  
  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param seriesName {String} the name of the Series, will be displayed in the Legend for most chart types
   */
  PlotSeries_prototype.init = function(name,seriesName) {
    //call constructor for super class
    this.jsxsuper(name,seriesName);

    this.xField = null;
    this.yField = null;
    this.magnitude = null;
    
    this.renderer = "jsx3.chart.PointRenderer.CIRCLE";
  };
  
  /**
   * Gets the cached points.
   * @return {Array}
   * @private
   * @jsxobf-clobber
   */
  PlotSeries_prototype._getShownPoints = function() {
    var points = this.fetchTransient("trans_shownPoints");
    if (points == null) {
      points = [];
      this.storeTransient("trans_shownPoints", points);
    }
    return points;
  };

  /**
   * Renders all vector elements of the series and appends them to the render root.
   * @package
   */
  PlotSeries_prototype.updateView = function() {
    this.jsxsuper();

    var fill = this.getDisplayedFill();
    var stroke = this.getDisplayedStroke(fill);
    this.storeTransient("trans_shownFill", fill);
    this.storeTransient("trans_shownStroke", stroke);
        
    var shownPoints = this._getShownPoints();
    for (var i = 0; i < shownPoints.length; i++) {
      this._drawSavedPoint(shownPoints[i]);
    }
  };
  
  /**
   * Renders a single point.
   * @param record {jsx3.xml.Entity} the <record/> node
   * @param index {int} the index of the record in the data provider
   * @param x {int} the x coordinate of the center of the point to render
   * @param y {int} the y coordinate of the center of the point to render
   * @param magnitude {Number} the magnitude of the point to render
   * @private
   * @jsxobf-clobber
   */
  PlotSeries_prototype.drawPoint = function(record, index, x, y, magnitude) {
    var root = this.getCanvas();
    var myChart = this.getChart();
    if (myChart == null) return;
    
    var maxRadius = myChart.getMaxPointRadius();
    
    var w = this.getWidth();
    var h = this.getHeight();

    // don't render if point is outside of the bounds of the series
    if (x > w || x < 0) return;
    if (y > h || y < 0) return;
    
    // get the renderer, default to Circle
    var renderer = this.getRenderer();
    if (renderer == null) renderer = jsx3.chart.PointRenderer.CIRCLE;

    // determine the x,y bounds of the point to render    
    var x1 = null, y1 = null, x2 = null, y2 = null;
    var magMethod = myChart.getMagnitudeMethod();
    if (magMethod == jsx3.chart.PlotChart.MAG_DIAMETER) {
      magnitude = Math.min(maxRadius * 2, magnitude);
      x1 = x - Math.round(magnitude/2);
      y1 = y - Math.round(magnitude/2);
      x2 = x1 + magnitude;
      y2 = y1 + magnitude;
    } else {
      var radius = magMethod == jsx3.chart.PlotChart.MAG_AREA ? 
          renderer.areaToRadius(magnitude * PlotSeries._DEFAULT_AREA_MULTIPLIER) : magnitude;
      radius = Math.min(maxRadius, radius);
      x1 = x - Math.round(radius);
      y1 = y - Math.round(radius);
      x2 = x1 + Math.round(2 * radius);
      y2 = y1 + Math.round(2 * radius);
    }
    
    // get the fill
    var colorFunct = this.getColorFunction();
    var fill = colorFunct != null ? colorFunct.apply(this, [record, index]) : this.fetchTransient("trans_shownFill");
    
    // render the point
    var shape = renderer.render(x1, y1, x2, y2, 
        fill, this.fetchTransient("trans_shownStroke"));
    shape.setId(this.getId() + "_p" + index);
    
    this.setEventProperties(shape, index, record.getAttribute('jsxid'));
    
    root.appendChild(shape);

    var funct = this.getTooltipFunction();
    if (funct != null)
      shape.setToolTip(funct.apply(this, [this, record]));
  };

  /**
   * clear the caches points for the series
   * @package
   */
  PlotSeries_prototype.clearPoints = function() {
    var points = this._getShownPoints();
    points.splice(0, points.length);
  };
  
  /**
   * Returns the x-coordinate of a data point in this series for the given record.
   * @param record {jsx3.xml.Entity} the <record/> node
   * @return {Number}
   */
  PlotSeries_prototype.getXValue = function( record ) {
    if (this.xField)
      return jsx3.chart.asNumber(record.getAttribute(this.xField));
    return null;
  };

  /**
   * Returns the y-coordinate of a data point in this series for the given record.
   * @param record {jsx3.xml.Entity} the <record/> node
   * @return {Number}
   */
  PlotSeries_prototype.getYValue = function( record ) {
    if (this.yField)
      return jsx3.chart.asNumber(record.getAttribute(this.yField));
    return null;
  };

  /**
   * Returns the xField field.
   * @return {String} xField
   */
  PlotSeries_prototype.getXField = function() {
    return this.xField;
  };

  /**
   * Sets the xField field.
   * @param xField {String} the new value for xField
   */
  PlotSeries_prototype.setXField = function( xField ) {
    this.xField = xField;
  };

  /**
   * Returns the yField field.
   * @return {String} yField
   */
  PlotSeries_prototype.getYField = function() {
    return this.yField;
  };

  /**
   * Sets the yField field.
   * @param yField {String} the new value for yField
   */
  PlotSeries_prototype.setYField = function( yField ) {
    this.yField = yField;
  };

  /**
   * Returns the renderer field.
   * @return {jsx3.chart.PointRenderer} renderer
   */
  PlotSeries_prototype.getRenderer = function() {
    return jsx3.chart.getReferenceField(this, "renderer");
  };

  /**
   * Sets the renderer field.
   * @param renderer {String} the new value for renderer
   */
  PlotSeries_prototype.setRenderer = function( renderer ) {
    jsx3.chart.setReferenceField(this, "renderer", renderer);
  };

  /**
   * Returns the renderer used for the legend.
   * @return {jsx3.chart.PointRenderer} the same renderer as used to draw the points
   */
  PlotSeries_prototype.getLegendRenderer = function() {
    var renderer = this.getRenderer();
    return renderer != null ? renderer : this.jsxsuper();
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  PlotSeries.getVersion = function() {
    return jsx3.chart.VERSION;
  };

/* @JSC :: end */
  
});


/**
 * A data series used for a jsx3.chart.PointChart. A point series has the following fields:
 *
 * xField - the attribute of a record to use as the x-coordinate of points in the series, required 
 * yField - the attribute of a record to use as the y-coordinate of points in the series, required
 * magnitude - the magnitude of all the points in the series
 * pointRenderer - string that evals to an object that implements the renderer interface, optional
 */
jsx3.Class.defineClass("jsx3.chart.PointSeries", jsx3.chart.PlotSeries, null, function(PointSeries, PointSeries_prototype) {

  /**
   * {int} 
   */
  PointSeries.DEFAULT_MAGNITUDE = 4;
  
  
  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param seriesName {String} the name of the Series, will be displayed in the Legend for most chart types
   */
  PointSeries_prototype.init = function(name,seriesName) {
    //call constructor for super class
    this.jsxsuper(name,seriesName);

    this.magnitude = null;
    this.setTooltipFunction("jsx3.chart.PointSeries.tooltip");
  };

  PointSeries_prototype.addPoint = function(record, index, x, y) {
    this._getShownPoints().push([record, index, x, y]);
  };
  
  /** @private @jsxobf-clobber */
  PointSeries_prototype._drawSavedPoint = function(point) {
    this.drawPoint(point[0], point[1], point[2], point[3], this.getMagnitude());
  };
  
  /**
   * Returns the magnitude field, the magnitude value to use for each data point in this series.
   * @return {int} magnitude
   */
  PointSeries_prototype.getMagnitude = function() {
    return this.magnitude != null ? this.magnitude : PointSeries.DEFAULT_MAGNITUDE;
  };

  /**
   * Sets the magnitude field.
   * @param magnitude {int} the new value for magnitude
   */
  PointSeries_prototype.setMagnitude = function( magnitude ) {
    this.magnitude = magnitude;
  };

  /**
   * The default tooltip function for this type of series.
   * @param series {jsx3.chart.Series} 
   * @param record {jsx3.xml.Entity} 
   * @return {String}
   */
  PointSeries.tooltip = function(series, record) {
    var x = series.getXValue(record);
    var y = series.getYValue(record);  
    return "{" + x + "," + y + "}";
  };

});


/**
 * A data series used for a jsx3.chart.BubbleChart. A bubble series has the following fields:
 *
 * xField - the attribute of a record to use as the x-coordinate of points in the series, required 
 * yField - the attribute of a record to use as the y-coordinate of points in the series, required
 * magnitudeField - the attribute of a record to use as the magnitude of points in the series, required
 * pointRenderer - string that evals to an object that implements the renderer interface, optional
 */
jsx3.Class.defineClass("jsx3.chart.BubbleSeries", jsx3.chart.PlotSeries, null, function(BubbleSeries, BubbleSeries_prototype) {
  
  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param seriesName {String} the name of the Series, will be displayed in the Legend for most chart types
   */
  BubbleSeries_prototype.init = function(name,seriesName) {
    //call constructor for super class
    this.jsxsuper(name,seriesName);

    this.magnitudeField = null;
    this.setTooltipFunction("jsx3.chart.BubbleSeries.tooltip");
  };

  BubbleSeries_prototype.addPoint = function(record, index, x, y, magnitude) {
    this._getShownPoints().push([record, index, x, y, magnitude]);
  };
    
  /** @private @jsxobf-clobber */
  BubbleSeries_prototype._drawSavedPoint = function(point) {
    this.drawPoint(point[0], point[1], point[2], point[3], point[4]);
  };
  
  /** 
   * The default tooltip function for this type of series.
   * @param series {jsx3.chart.Series} 
   * @param record {jsx3.xml.Entity} 
   * @return {String}
   */
  BubbleSeries.tooltip = function(series, record) {
    var x = series.getXValue(record);
    var y = series.getYValue(record);  
    var mag = series.getMagnitudeValue(record);  
    return "{" + x + "," + y + "," + mag + "}";
  };

  /**
   * Returns the magnitudeField field.
   * @return {String} magnitudeField
   */
  BubbleSeries_prototype.getMagnitudeField = function() {
    return this.magnitudeField;
  };

  /**
   * Sets the magnitudeField field.
   * @param magnitudeField {String} the new value for magnitudeField
   */
  BubbleSeries_prototype.setMagnitudeField = function( magnitudeField ) {
    this.magnitudeField = magnitudeField;
  };

  /**
   * Returns the magnitude of a data point in this series for the given record.
   * @param record {jsx3.xml.Entity} the <record/> node
   * @return {Number}
   */
  BubbleSeries_prototype.getMagnitudeValue = function( record ) {
    if (this.magnitudeField)
      return jsx3.chart.asNumber(record.getAttribute(this.magnitudeField));
    return null;
  };

});
