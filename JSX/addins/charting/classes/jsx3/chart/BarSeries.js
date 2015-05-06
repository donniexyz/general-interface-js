/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.Series");

/**
 * Shared functionality between <code>BarSeries</code> and <code>ColumnSeries</code>.
 */
jsx3.Class.defineClass("jsx3.chart.BCSeries", jsx3.chart.Series, null, function(BCSeries, BCSeries_prototype) {
    
  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param seriesName {String} the name of the Series, will be displayed in the Legend for most chart types
   */
  BCSeries_prototype.init = function(name, seriesName) {
    //call constructor for super class
    this.jsxsuper(name, seriesName);

    this.xField = null;
    this.yField = null;
    this.minField = null;
  };
  
  /**
   * Returns the value parallel to the length of the bar or column.
   * @private
   * @jsxobf-clobber-shared
   */
  BCSeries_prototype._getParallelValue = jsx3.Method.newAbstract();

  /**
   * Returns the value perpendicular to the length of the bar or column.
   * @private
   * @jsxobf-clobber-shared
   */
  BCSeries_prototype._getNormalValue = jsx3.Method.newAbstract();

  /**
   * Returns the height of the bar or width of the column.
   * @private
   * @jsxobf-clobber-shared
   */
  BCSeries_prototype._getNormalWidth = jsx3.Method.newAbstract();

  /**
   * Returns the x-coordinate of a data point in this series for the given record.
   * @param record {jsx3.xml.Entity} the <record/> node
   * @return {Number}
   */
  BCSeries_prototype.getXValue = function( record ) {
    if (this.xField)
      return jsx3.chart.asNumber(record.getAttribute(this.xField));
    return null;
  };

  /**
   * Returns the y-coordinate of a data point in this series for the given record.
   * @param record {jsx3.xml.Entity} the <record/> node
   * @return {Number}
   */
  BCSeries_prototype.getYValue = function( record ) {
    if (this.yField)
      return jsx3.chart.asNumber(record.getAttribute(this.yField));
    return null;
  };

  /**
   * Returns the minimum value (x or y) of a data point in this series for the given record.
   * @param record {jsx3.xml.Entity} the <record/> node
   * @return {Number}
   */
  BCSeries_prototype.getMinValue = function( record ) {
    if (this.minField)
      return jsx3.chart.asNumber(record.getAttribute(this.minField));
    return null;
  };

  /**
   * fetch the cached bars/columns
   * @private
   */
  BCSeries_prototype._getShownAreas = function() {
    var areas = this.fetchTransient("trans_shownAreas");
    if (areas == null) {
      areas = [];
      this.storeTransient("trans_shownAreas", areas);
    }
    return areas;
  };

  /**
   * Renders the series.
   * @package
   */
  BCSeries_prototype.updateView = function() {
    this.jsxsuper();

    var fill = this.getDisplayedFill();
    var stroke = this.getDisplayedStroke(fill);
    this.storeTransient("trans_shownFill", fill);
    this.storeTransient("trans_shownStroke", stroke);
        
    var shownAreas = this._getShownAreas();
    for (var i = 0; i < shownAreas.length; i++) {
      var a = shownAreas[i];
      this.drawArea(a[0],a[1],a[2],a[3],a[4],a[5],true);
    }
  };
  
  /**
   * Renders a column or bar and add it to the render root.
   * @param record {jsx3.xml.Entity} the <record/> node
   * @param index {int} the index of the record in the data provider
   * @param x1 {int} the x coordinate of the left edge of the area, in the coordinate space of the series
   * @param y1 {int} the y coordinate of the top edge of the area, in the coordinate space of the series
   * @param x2 {int} the x coordinate of the right edge of the area, in the coordinate space of the series
   * @param y2 {int} the y coordinate of the bottom edge of the area, in the coordinate space of the series
   * @param internal {boolean} true if drawing a cached area so as not to cache it twice
   * @package
   */
  BCSeries_prototype.drawArea = function(record, index, x1, y1, x2, y2, internal) {
    if (! internal)
      this._getShownAreas().push([record,index,x1,y1,x2,y2]);
    
    var root = this.getCanvas();
    
    var w = this.getWidth();
    var h = this.getHeight();
    // make sure x1 is less than x2 and y1 is less than y2
    if (x1 > x2) { var temp = x1; x1 = x2; x2 = temp; }
    if (y1 > y2) { var temp = y1; y1 = y2; y2 = temp; }
    
    // if completely out of bounds, don't render
    if (x1 > w || x2 < 0) return;
    if (y1 > h || y2 < 0) return;
    
    // create the rectangle and clip it to the bounds of the series
    var rectangle = new jsx3.vector.Rectangle(x1,y1,x2-x1,y2-y1);
    rectangle.setId(this.getId() + "_r" + index);
    rectangle.clipTo(0, 0, w, h);
    var colorFunct = this.getColorFunction();
    var fill = colorFunct != null ? colorFunct.apply(this, [record, index]) : this.fetchTransient("trans_shownFill");
    rectangle.setFill(fill);
    rectangle.setStroke(this.fetchTransient("trans_shownStroke"));

    var funct = this.getTooltipFunction();
    if (funct != null)
      rectangle.setToolTip(funct.apply(this, [this, record]));
    
    this.setEventProperties(rectangle, index, record.getAttribute('jsxid'));
    
    root.appendChild(rectangle);
  };

  /**
   * clear all the cached bars/columns
   * @private
   */
  BCSeries_prototype.clearAreas = function() {
    var areas = this._getShownAreas();
    areas.splice(0, areas.length);
  };
  
  /**
   * Returns the xField field.
   * @return {String} xField
   */
  BCSeries_prototype.getXField = function() {
    return this.xField;
  };

  /**
   * Sets the xField field.
   * @param xField {String} the new value for xField
   */
  BCSeries_prototype.setXField = function( xField ) {
    this.xField = xField;
  };

  /**
   * Returns the yField field.
   * @return {String} yField
   */
  BCSeries_prototype.getYField = function() {
    return this.yField;
  };

  /**
   * Sets the yField field.
   * @param yField {String} the new value for yField
   */
  BCSeries_prototype.setYField = function( yField ) {
    this.yField = yField;
  };

  /**
   * Returns the minField field.
   * @return {String} minField
   */
  BCSeries_prototype.getMinField = function() {
    return this.minField;
  };

  /**
   * Sets the minField field.
   * @param minField {String} the new value for minField
   */
  BCSeries_prototype.setMinField = function( minField ) {
    this.minField = minField;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  BCSeries.getVersion = function() {
    return jsx3.chart.VERSION;
  };

/* @JSC :: end */

});

jsx3.chart.BCSeries.prototype.drawBar = jsx3.chart.BCSeries.prototype.drawArea;
jsx3.chart.BCSeries.prototype.drawColumn = jsx3.chart.BCSeries.prototype.drawArea;

/**
 * The data series type for a jsx3.chart.BarChart. Draws horizontal bars between the y axis and an x value determined
 * by the data provider, or between two x values determined by the data provider. A bar series has the 
 * following fields:
 * <dl>
 * <dt>xField</dt> <dd>the attribute of a record to use as the horizontal extent of the bar, required</dd>
 * <dt>yField</dt> <dd>the attribute of a record to use as the vertical midpoint of the bar, required if the y axis 
 *     of the chart is a value axis</dd>
 * <dt>minField</dt> <dd>the attribute of a record to use as the minimum horizontal extent of the bar, optional</dd>
 * </dl>
 */
jsx3.Class.defineClass("jsx3.chart.BarSeries", jsx3.chart.BCSeries, null, function(BarSeries, BarSeries_prototype) {
  
  /**
   * {int}
   */
  BarSeries.DEFAULT_BARHEIGHT = 10;
  
  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param seriesName {String} the name of the Series, will be displayed in the Legend for most chart types
   */
  BarSeries_prototype.init = function(name,seriesName) {
    this.jsxsuper(name,seriesName);

    this.barHeight = null;
    this.setTooltipFunction("jsx3.chart.BarSeries.tooltip");
  };
  
  BarSeries_prototype._getParallelValue = function( record ) {
    return this.getXValue(record);
  };

  BarSeries_prototype._getNormalValue = function( record ) {
    return this.getYValue(record);
  };

  BarSeries_prototype._getNormalWidth = function() {
    return this.getBarHeight();
  };

  /**
   * Returns the barHeight field.
   * @return {int} barHeight
   */
  BarSeries_prototype.getBarHeight = function() {
    return this.barHeight != null ? this.barHeight : BarSeries.DEFAULT_BARHEIGHT;
  };

  /**
   * Sets the barHeight field.
   * @param barHeight {int} the new value for barHeight
   */
  BarSeries_prototype.setBarHeight = function( barHeight ) {
    this.barHeight = barHeight;
  };

  /**
   * The default tooltip function for this type of series.
   * @param series {jsx3.chart.Series} 
   * @param record {jsx3.xml.Entity} 
   * @return {String}
   */
  BarSeries.tooltip = function(series, record) {
    var x = series.getXValue(record);
    var y = series.getYValue(record);
    var min = series.getMinValue(record);
    
    var tip = min != null ? "{" + min + "," + x + "}" : x;
    if (y != null) tip += ", y = " + y;
    return tip;
  };

});


/**
 * The data series type for a jsx3.chart.ColumnChart. Draws vertical columns between the x axis and a y value determined
 * by the data provider, or between two y values determined by the data provider. A column series has the 
 * following fields:
 * <dl>
 * <dt>yField</dt> <dd>the attribute of a record to use as the vertical extent of the column, required</dd>
 * <dt>xField</dt> <dd>the attribute of a record to use as the horizontal midpoint of the column, required if the x axis 
 *     of the chart is a value axis</dd>
 * <dt>minField</dt> <dd>the attribute of a record to use as the minimum vertical extent of the column, optional</dd>
 * </dl>
 */
jsx3.Class.defineClass("jsx3.chart.ColumnSeries", jsx3.chart.BCSeries, null, function(ColumnSeries, ColumnSeries_prototype) {
  
  /**
   * {int}
   */
  ColumnSeries.DEFAULT_COLUMNWIDTH = 10;
  
  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param seriesName {String} the name of the Series, will be displayed in the Legend for most chart types
   */
  ColumnSeries_prototype.init = function(name,seriesName) {
    this.jsxsuper(name,seriesName);

    this.columnWidth = null;
    this.setTooltipFunction("jsx3.chart.ColumnSeries.tooltip");
  };
  
  ColumnSeries_prototype._getParallelValue = function( record ) {
    return this.getYValue(record);
  };

  ColumnSeries_prototype._getNormalValue = function( record ) {
    return this.getXValue(record);
  };

  ColumnSeries_prototype._getNormalWidth = function() {
    return this.getColumnWidth();
  };

  /**
   * Returns the columnWidth field.
   * @return {int} columnWidth
   */
  ColumnSeries_prototype.getColumnWidth = function() {
    return this.columnWidth != null ? this.columnWidth : ColumnSeries.DEFAULT_COLUMNWIDTH;
  };

  /**
   * Sets the columnWidth field.
   * @param columnWidth {int} the new value for columnWidth
   */
  ColumnSeries_prototype.setColumnWidth = function( columnWidth ) {
    this.columnWidth = columnWidth;
  };

  ColumnSeries_prototype.toString = function() {
    return "[ColumnSeries '" + this.getName() + "']";
  };
  
  ColumnSeries_prototype.drawArea = function(record, index, p1, n1, p2, n2, internal) {
    if (internal)
      this.jsxsuper(record, index, p1, n1, p2, n2, internal);
    else
      this.jsxsuper(record, index, n1, p2, n2, p1, internal);
  };

  /** 
   * The default tooltip function for this type of series.
   * @param series {jsx3.chart.Series} 
   * @param record {jsx3.xml.Entity} 
   * @return {String}
   */
  ColumnSeries.tooltip = function(series, record) {
    var x = series.getXValue(record);
    var y = series.getYValue(record);
    var min = series.getMinValue(record);
    
    var tip = min != null ? "{" + min + "," + y + "}" : y;
    if (x != null) tip += ", x = " + x;
    return tip;
  };

});
