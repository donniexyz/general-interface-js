/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.RadialChart", "jsx3.chart.PieSeries");

/**
 * A pie chart.
 * <p/>
 * <b>Series</b>: PieSeries only. <br/>
 * <b>Axes</b>: No axes, it's a radial chart.
 */
jsx3.Class.defineClass("jsx3.chart.PieChart", jsx3.chart.RadialChart, null, function(PieChart, PieChart_prototype) {
  
  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param left {int} left position (in pixels) of the chart relative to its parent container
   * @param top {int} top position (in pixels) of the chart relative to its parent container
   * @param width {int} width (in pixels) of the chart
   * @param height {int} height (in pixels) of the chart
   */
  PieChart_prototype.init = function(name, left, top, width, height) {
    //call constructor for super class
    this.jsxsuper(name, left, top, width, height);

    this.innerRadius = 0;
    this.seriesPadding = 0.1;
    this.totalAngle = 360;
    this.startAngle = 0; // top
    this.categoryField = null;
    this.colors = null;
    this.colorFunction = "jsx3.chart.PieChart.defaultColoring";
    this.seriesStroke = null;
  };

  /**
   * Returns the innerRadius field, the radius as the hole in the middle of the pie as a ratio of the entire radius.
   * @return {float} innerRadius
   */
  PieChart_prototype.getInnerRadius = function() {
    return this.innerRadius != null ? this.innerRadius : 0;
  };

  /**
   * Sets the innerRadius field.
   * @param innerRadius {float} the new value for innerRadius, between 0.0 and 1.0
   */
  PieChart_prototype.setInnerRadius = function( innerRadius ) {
    this.innerRadius = innerRadius == null ? null : Math.max(0, Math.min(1, innerRadius));
  };

  /**
   * Returns the seriesPadding field, the amount of padding between rings in a doughnut chart as a ratio of the width of a ring.
   * @return {float} seriesPadding
   */
  PieChart_prototype.getSeriesPadding = function() {
    return this.seriesPadding != null ? this.seriesPadding : 0.1;
  };

  /**
   * Sets the seriesPadding field.
   * @param seriesPadding {float} the new value for seriesPadding, positive value, not too big
   */
  PieChart_prototype.setSeriesPadding = function( seriesPadding ) {
    this.seriesPadding = seriesPadding;
  };

  /**
   * Returns the totalAngle field, the total angle used for each series; may be overridden on a series-by-series basis by jsx3.chart.PieSeries.totalAngle.
   * @return {int} totalAngle
   */
  PieChart_prototype.getTotalAngle = function() {
    return this.totalAngle != null ? this.totalAngle : 360;
  };

  /**
   * Sets the totalAngle field.
   * @param totalAngle {int} the new value for totalAngle, between 0 and 360
   */
  PieChart_prototype.setTotalAngle = function( totalAngle ) {
    this.totalAngle = totalAngle == null ? null : Math.max(0, Math.min(360, totalAngle));
  };

  /**
   * Returns the startAngle field, the start angle of the first slice in each series; 0 points upwards and increasing values go clockwise; may be overridden on a series-by-series basis by jsx3.chart.PieSeries.startAngle.
   * @return {int} startAngle
   */
  PieChart_prototype.getStartAngle = function() {
    return this.startAngle != null ? this.startAngle : 0;
  };

  /**
   * Sets the startAngle field.
   * @param startAngle {int} the new value for startAngle, between 0 and 360
   */
  PieChart_prototype.setStartAngle = function( startAngle ) {
    this.startAngle = startAngle;
  };

  /**
   * Returns the categoryField field, the attribute of a record that contains the category name value; necessary because there is no CategoryAxis to define this in a radial chart.
   * @return {String} categoryField
   */
  PieChart_prototype.getCategoryField = function() {
    return this.categoryField;
  };

  /**
   * Sets the categoryField field.
   * @param categoryField {String} the new value for categoryField
   */
  PieChart_prototype.setCategoryField = function( categoryField ) {
    this.categoryField = categoryField;
  };

  /**
   * Returns the colors field, an array of string representations of a vector fill, to color in the slices of all the data series; may be overridden by jsx3.chart.PieSeries.colors for an individual series..
   * @return {Array<String|int>} colors
   */
  PieChart_prototype.getColors = function() {
    return this.colors;
  };

  /**
   * Sets the colors field.
   * @param colors {Array<String|int>} the new value for colors
   */
  PieChart_prototype.setColors = function( colors ) {
    this.colors = colors;
  };

  /**
   * Returns the colorFunction field, a function that defines how to color in the slices of each data series in this chart, with the signature function(record, index) : jsx3.vector.Fill; may be overridden by jsx3.chart.PieSeries.colorFunction for an individual series..
   * @return {Function} colorFunction
   */
  PieChart_prototype.getColorFunction = function() {
    return jsx3.chart.getFunctionField(this, "colorFunction");
  };

  /**
   * Sets the colorFunction field. Note that passing a function reference to this method will prevent the color
   * function from persisting if this object is serialized. The function will be applied to this object when called.
   * @param colorFunction {String | Function} the new value for colorFunction, a function with the signature
   *     <code>function(record : jsx3.xml.Entity, index : Number) : jsx3.vector.Fill</code>.
   */
  PieChart_prototype.setColorFunction = function( colorFunction ) {
    jsx3.chart.setReferenceField(this, "colorFunction", colorFunction);
  };

  /**
   * Returns the seriesStroke field, string representation of a VectorStroke to outline the slices of all the series with; may be overridden by jsx3.chart.PieSeries.stroke for an individual series..
   * @return {String} seriesStroke
   */
  PieChart_prototype.getSeriesStroke = function() {
    return this.seriesStroke;
  };

  /**
   * Sets the seriesStroke field.
   * @param seriesStroke {String} the new value for seriesStroke
   */
  PieChart_prototype.setSeriesStroke = function( seriesStroke ) {
    this.seriesStroke = seriesStroke;
  };

  /**
   * determine the fill for a category (record) in a data series. this result of this method will be used in the legend and in each data series in the chart whose colors have not been specified individually
   * @param record {jsx3.xml.Entity} 
   * @param index {int} the index of the record in the data provider
   * @return {jsx3.vector.Fill}
   * @package
   */
  PieChart_prototype.getFillForIndex = function( record, index ) {
    // first consult jsx3.chart.PieChart.colors
    var colors = this.getColors();
    if (colors != null && colors.length > 0)
      return jsx3.vector.Fill.valueOf(colors[index % colors.length]);
    
    // second try jsx3.chart.PieChart.colorFunction
    var funct = this.getColorFunction();
    if (funct != null)
      return funct.apply(this, [record, index]);

    // third return black
    return new jsx3.vector.Fill();
  };

  /**
   * Renders all vector elements and appends them to the render root.
   * @package
   */
  PieChart_prototype.createVector = function() {
    this.jsxsuper();
    var root = this.getDataCanvas();
    var series = this.getDisplayedSeries();
    var dp = this.getDataProvider();
    
    if (series.length < 1) return;
    if (dp == null || dp.length < 1) return;
    
    var w = series[0].getWidth();
    var h = series[0].getHeight();
    var cx = Math.round(w/2);
    var cy = Math.round(h/2);
    var radius = Math.floor(Math.min(w,h) / 2);
    
    // like stacked100 bar and column, a pie chart is always "normalized" against the sum of the values
    var totals = this.getSeriesTotals(series, "getValue", true);
    
    var seriesRadius = radius * (1 - this.getInnerRadius()) / 
        (series.length + (series.length - 1) * this.getSeriesPadding());
        
    var innerRadius = radius * this.getInnerRadius();

    for (var i = 0; i < series.length; i++) {
      var ser = series[i];
      ser.clearSlices();
      
      // get start angle from series, or from chart
      var startAngle = ser.getStartAngle();
      if (startAngle == null) startAngle = this.getStartAngle();
      
      // get total angle from series, or from chart
      var totalAngle = ser.getTotalAngle();
      if (totalAngle == null) totalAngle = this.getTotalAngle();
      
      var outerRadius = innerRadius + seriesRadius;
      
      for (var j = 0; j < dp.length; j++) {
        var record = dp[j];
        
        var value = ser.getValue(record);
        
        if (value == null || value <= 0) {
          ser.addEmptySlice();
          continue;
        }
        
        var angle = totalAngle * value / totals[i];
        
        ser.addSlice(record, cx, cy, startAngle, startAngle+angle, 
            Math.round(innerRadius), Math.round(outerRadius), 100 * value / totals[i]);
        
        startAngle += angle;
      }
      
      ser.updateView();
      root.appendChild(ser.getCanvas());
      
      innerRadius += seriesRadius * (1 + this.getSeriesPadding());
    }
  };
  
  /**
   * will look better and make series labels display better if reversed
   * @return {boolean} true
   * @package
   */
  PieChart_prototype.seriesZOrderReversed = function() {
    return true;
  };

  /**
   * allows PieSeries only
   * @return {boolean}
   * @package
   */
  PieChart_prototype.isValidSeries = function(series) {
    return series instanceof jsx3.chart.PieSeries;
  };

  /**
   * pie charts show categories in the legend
   * @return {int} jsx3.chart.Legend.SHOW_CATEGORIES
   * @package
   */
  PieChart_prototype.getLegendEntryType = function() {
    jsx3.require("jsx3.chart.Legend");
    return jsx3.chart.Legend.SHOW_CATEGORIES;
  };

  /**
   * default coloring scheme for pie series, simply converts the default coloring scheme for series into a coloring scheme for categories
   * @param record {jsx3.xml.Entity} 
   * @param index {int} the index of the record in the data provider
   * @return {jsx3.vector.Fill}
   */
  PieChart.defaultColoring = function( record, index ) {
    return jsx3.chart.Chart.DEFAULT_FILLS[index % jsx3.chart.Chart.DEFAULT_FILLS.length];
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  PieChart.getVersion = function() {
    return jsx3.chart.VERSION;
  };

/* @JSC :: end */

});
