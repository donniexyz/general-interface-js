/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.Series");

/**
 * A data series for an area chart. An area series draws a solid polygon between the x-axis and a line
 * defined by the data provider, or between a minimum line and a maximum line both defined by the data
 * provider. An area series has the following properties:
 * <dl>
 * <dt>xField</dt> <dd>the attribute of a record to use as the x-coordinate of points defining the min and max line of 
 *     the area, required if the x-axis is a value axis</dd>
 * <dt>yField</dt> <dd>the attribute of a record to use as the y-coordinate of points defining the max line of 
 *     the area, required</dd>
 * <dt>minField</dt> <dd>the attribute of a record to use as the y-coordinate of points defining the min line of 
 *     the area, optional</dd>
 * <dt>form</dt> <dd>defines how the area is drawn, one of {'segment','step','reverseStep'}, defaults to 'segment'</dd>
 * </dl>
 * The area series can also be painted with points at each data point. See LineSeries for a description of
 * the relevant fields.
 */
jsx3.Class.defineClass("jsx3.chart.AreaSeries", jsx3.chart.Series, null, function(AreaSeries, AreaSeries_prototype) {
  
  var vector = jsx3.vector;
  var chart = jsx3.chart;
  
  /**
   * {String}
   * @final @jsxobf-final
   */
  AreaSeries.FORM_SEGMENT = "segment";

  /**
   * {String}
   * @final @jsxobf-final
   */
  AreaSeries.FORM_STEP = "step";

  /**
   * {String}
   * @final @jsxobf-final
   */
  AreaSeries.FORM_REVSTEP = "reverseStep";

  /**
   * The allowed values for the 'form' field.
   * @private
   * @jsxobf-clobber
   */
  AreaSeries._FORMS = {segment: 1, step: 1, reverseStep: 1};

  /**
   * The default point radius.
   * @private
   * @jsxobf-clobber
   */
  AreaSeries._DEFAULT_POINT_RADIUS = 4;

  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param seriesName {String} the name of the Series, will be displayed in the Legend for most chart types
   */
  AreaSeries_prototype.init = function(name, seriesName) {
    //call constructor for super class
    this.jsxsuper(name, seriesName);

    this.xField = null;
    this.yField = null;
    this.minField = null;
    this.form = AreaSeries.FORM_SEGMENT;
    this.pointRadius = null;
    this.pointRenderer = null;
    this.pointFill = null;
    this.pointStroke = null;
    this.pointGradient = null;
  
    this.setTooltipFunction("jsx3.chart.AreaSeries.tooltip");
  };

  /**
   * Returns the xField field.
   * @return {String} xField
   */
  AreaSeries_prototype.getXField = function() {
    return this.xField;
  };

  /**
   * Sets the xField field.
   * @param xField {String} the new value for xField
   */
  AreaSeries_prototype.setXField = function( xField ) {
    this.xField = xField;
  };

  /**
   * Returns the yField field.
   * @return {String} yField
   */
  AreaSeries_prototype.getYField = function() {
    return this.yField;
  };

  /**
   * Sets the yField field.
   * @param yField {String} the new value for yField
   */
  AreaSeries_prototype.setYField = function( yField ) {
    this.yField = yField;
  };

  /**
   * Returns the minField field.
   * @return {String} minField
   */
  AreaSeries_prototype.getMinField = function() {
    return this.minField;
  };

  /**
   * Sets the minField field.
   * @param minField {String} the new value for minField
   */
  AreaSeries_prototype.setMinField = function( minField ) {
    this.minField = minField;
  };

  /**
   * Returns the form field.
   * @return {String} form
   */
  AreaSeries_prototype.getForm = function() {
    return this.form;
  };

  /**
   * Sets the form field, checks for valid value.
   * @param form {String} the new value for form, one of {'segment','step','reverseStep'}
   */
  AreaSeries_prototype.setForm = function( form ) {
    if (AreaSeries._FORMS[form]) {
      this.form = form;
    } else {
      throw new jsx3.IllegalArgumentException("form", form);
    }
  };

  /**
   * Returns the pointRadius field.
   * @return {int} pointRadius
   */
  AreaSeries_prototype.getPointRadius = function() {
    return this.pointRadius != null ? this.pointRadius : AreaSeries._DEFAULT_POINT_RADIUS;
  };

  /**
   * Sets the pointRadius field.
   * @param pointRadius {int} the new value for pointRadius
   */
  AreaSeries_prototype.setPointRadius = function( pointRadius ) {
    this.pointRadius = pointRadius;
  };

  /**
   * Returns the pointRenderer field.
   * @return {jsx3.chart.PointRenderer} pointRenderer
   */
  AreaSeries_prototype.getPointRenderer = function() {
    return chart.getReferenceField(this, "pointRenderer");
  };

  /**
   * Sets the pointRenderer field.
   * @param pointRenderer {String} the new value for pointRenderer, should eval to an object that implements the renderer interface
   */
  AreaSeries_prototype.setPointRenderer = function( pointRenderer ) {
    chart.setReferenceField(this, "pointRenderer", pointRenderer);
  };

  /**
   * Returns the pointFill field.
   * @return {String} pointFill
   */
  AreaSeries_prototype.getPointFill = function() {
    return this.pointFill;
  };

  /**
   * Sets the pointFill field, string representation of vector fill.
   * @param pointFill {String} the new value for pointFill
   */
  AreaSeries_prototype.setPointFill = function( pointFill ) {
    this.pointFill = pointFill;
  };

  /**
   * Returns the pointStroke field.
   * @return {String} pointStroke
   */
  AreaSeries_prototype.getPointStroke = function() {
    return this.pointStroke;
  };

  /**
   * Sets the pointStroke field, string representation of VectorStroke.
   * @param pointStroke {String} the new value for pointStroke
   */
  AreaSeries_prototype.setPointStroke = function( pointStroke ) {
    this.pointStroke = pointStroke;
  };

  /**
   * Returns the pointGradient field.
   * @return {String} pointGradient
   */
  AreaSeries_prototype.getPointGradient = function() {
    return this.pointGradient;
  };

  /**
   * Sets the pointGradient field, string representation of vector fill gradient.
   * @param pointGradient {String} the new value for pointGradient
   */
  AreaSeries_prototype.setPointGradient = function( pointGradient ) {
    this.pointGradient = pointGradient;
  };

  /**
   * Returns the fill for the points.
   * @return {jsx3.vector.Fill}
   * @private
   */
  AreaSeries_prototype._getDisplayedPointFill = function() {
    var fill = this.fetchTransient("trans_pointFill");
    if (fill == null)
      this._storePointFillAndStroke();
    return this.fetchTransient("trans_pointFill");
  };

  /**
   * Returns the stroke for the points.
   * @return {jsx3.vector.Stroke}
   * @private
   */
  AreaSeries_prototype._getDisplayedPointStroke = function() {
    var fill = this.fetchTransient("trans_pointStroke");
    if (fill == null)
      this._storePointFillAndStroke();
    return this.fetchTransient("trans_pointStroke");
  };

  /**
   * figure out the fill and stroke for the points and store as transient fields
   * @private
   * @jsxobf-clobber
   */
  AreaSeries_prototype._storePointFillAndStroke = function() {
    var mainStroke = this.getDisplayedStroke();
    var fill = vector.Fill.valueOf(this.getPointFill());
    if (fill == null && mainStroke != null) 
      fill = new vector.Fill(mainStroke.getColor());
    if (fill != null)
      fill = chart.addGradient(fill, this.pointGradient);
    var stroke = vector.Stroke.valueOf(this.getPointStroke());
    this.storeTransient("trans_pointFill", fill);
    this.storeTransient("trans_pointStroke", stroke);
  };

  /**
   * Returns the x-coordinate of a data point in this series for the given record.
   * @param record {jsx3.xml.Entity} the <record/> node
   * @return {Number}
   */
  AreaSeries_prototype.getXValue = function( record ) {
    if (this.xField)
      return chart.asNumber(record.getAttribute(this.xField));
    return null;
  };

  /**
   * Returns the y-coordinate of a data point in this series for the given record.
   * @param record {jsx3.xml.Entity} the <record/> node
   * @return {Number}
   */
  AreaSeries_prototype.getYValue = function( record ) {
    if (this.yField)
      return chart.asNumber(record.getAttribute(this.yField));
    return null;
  };

  /**
   * Returns the minimum y-coordinate of a data point in this series for the given record.
   * @param record {jsx3.xml.Entity} the <record/> node
   * @return {Number}
   */
  AreaSeries_prototype.getMinValue = function( record ) {
    if (this.minField)
      return chart.asNumber(record.getAttribute(this.minField));
    return null;
  };

  /**
   * add a point to this data series
   * @param record {jsx3.xml.Entity} the <record/> node
   * @param x {int} the x coordinate in the coordinate space of the series
   * @param y {int} the y coordinate in the coordinate space of the series
   * @package
   */
  AreaSeries_prototype.addPoint = function( record, x, y, index ) {
    var points = this.fetchTransient("trans_points");
    if (points == null) {
      points = [];
      this.storeTransient("trans_points", points);
    }
    // caches the point so that repaint() can work correctly
    points.push([record, x, y, index]);
  };

  /**
   * add a point on the line defining the minimum bounds of the area
   * @param x {int} the x coordinate in the coordinate space of the series
   * @param y {int} the y coordinate in the coordinate space of the series
   * @package
   */
  AreaSeries_prototype.addMinPoint = function( x, y ) {
    var minPoints = this.fetchTransient("trans_minPoints");
    if (minPoints == null) {
      minPoints = [];
      this.storeTransient("trans_minPoints", minPoints);
    }
    // caches the point so that repaint() can work correctly
    minPoints.push([x, y]);
  };

  /**
   * clears all cached points before this series is drawn again by its chart
   * @package
   */
  AreaSeries_prototype.clearPoints = function() {
    var points = this.fetchTransient("trans_points");
    if (points != null) points.splice(0, points.length);
    var minPoints = this.fetchTransient("trans_minPoints");
    if (minPoints != null) minPoints.splice(0, minPoints.length);
  };

  /**
   * Renders all vector elements of the series and appends them to the render root.
   * @package
   */
  AreaSeries_prototype.updateView = function() {
    this.jsxsuper();
    var root = this.getCanvas();
    
    // we need to separate the fill from the stroke since the stroke only shows up on the top
    // boundary of the fill
    var shapeFill = null, shapeStroke = null;

    // create the fill shape if fill is not empty    
    var mainFill = this.getDisplayedFill();
    if (mainFill != null) {
      shapeFill = new vector.Shape(null, 0, 0, root.getWidth(), root.getHeight());
      shapeFill.setId(this.getId() + "_fill");
      root.appendChild(shapeFill);
      shapeFill.setFill(mainFill);
    }
    
    // create the stroke shape if stroke is not empty
    var mainStroke = this.getDisplayedStroke();
    if (mainStroke != null) {
      shapeStroke = new vector.Shape(null, 0, 0, root.getWidth(), root.getHeight());
      shapeStroke.setId(this.getId() + "_stroke");
      root.appendChild(shapeStroke);
      shapeStroke.setStroke(mainStroke);
    }
    
    this._storePointFillAndStroke();
    
    var points = this.fetchTransient("trans_points");
    var minPoints = this.fetchTransient("trans_minPoints");
    
    if (points == null || points.length == 0 || minPoints == null || minPoints.length == 0) 
      return;
    
    var renderer = this.getPointRenderer();
    var radius = this.getPointRadius();
    var funct = this.getTooltipFunction();
    var pointFill = this._getDisplayedPointFill();
    var pointStroke = this._getDisplayedPointStroke();
    var colorFunct = this.getColorFunction();

    this.setEventProperties(shapeFill);

    // iterate through cached points comprising the upper bounds
    for (var i = 0; i < points.length; i++) {
      var record = points[i][0];
      var x = points[i][1];
      var y = points[i][2];
      var index = points[i][3];
      
      if (i == 0) {
        // if this is the first point, just move to it, don't draw a line
        if (shapeFill != null) shapeFill.pathMoveTo(x, y);
        if (shapeStroke != null) shapeStroke.pathMoveTo(x, y);  
      } else {
        var lx = points[i-1][1];
        var ly = points[i-1][2];
        
        // draw a line from the last point to this point, according to the form
        if (this.form == AreaSeries.FORM_SEGMENT) {
          // straight line
          if (shapeFill != null) shapeFill.pathLineTo(x, y);
          if (shapeStroke != null) shapeStroke.pathLineTo(x, y);  
        } else if (this.form == AreaSeries.FORM_STEP) {
          // over, then up
          if (shapeFill != null) shapeFill.pathLineTo(x, ly).pathLineTo(x, y);
          if (shapeStroke != null) shapeStroke.pathLineTo(x, ly).pathLineTo(x, y);
        } else if (this.form == AreaSeries.FORM_REVSTEP) {
          // up, then over
          if (shapeFill != null) shapeFill.pathLineTo(lx, y).pathLineTo(x, y);
          if (shapeStroke != null) shapeStroke.pathLineTo(lx, y).pathLineTo(x, y);
        } else {
          chart.LOG.error("bad AreaSeries form: " + this.form);
        }
      }
      
      // render a point at the data point
      if (renderer != null) {
        var thisFill = colorFunct != null ? colorFunct.apply(this, [record, index]) : pointFill;
        
        var point = renderer.render(x - radius, y - radius, x + radius, y + radius, 
          thisFill, pointStroke);
        point.setId(this.getId() + "_p" + i);
        
        this.setEventProperties(point, i, record.getAttribute('jsxid'));

        root.appendChild(point);

        if (funct != null)
          point.setToolTip(funct.apply(this, [this, record]));
      }
    }
    
    // iterate through cached points comprising the lower bounds, in reverse order
    for (var i = minPoints.length - 1; i >= 0; i--) {
      var x = minPoints[i][0];
      var y = minPoints[i][1];

      if (i == minPoints.length - 1) {
        shapeFill.pathLineTo(x, y);
      } else {
        var lx = minPoints[i+1][0];
        var ly = minPoints[i+1][1];

        // same as above but only append to the fill shape, and step in reverse order
        if (this.form == AreaSeries.FORM_SEGMENT) {
          shapeFill.pathLineTo(x, y);
        } else if (this.form == AreaSeries.FORM_STEP) {
          shapeFill.pathLineTo(lx, y).pathLineTo(x, y);
        } else if (this.form == AreaSeries.FORM_REVSTEP) {
          shapeFill.pathLineTo(x, ly).pathLineTo(x, y);
        } else {
          chart.LOG.error("bad AreaSeries form: " + this.form);
        }        
      }
    }
    
    // close the fill shape
    shapeFill.pathClose();
  };

  /** 
   * The default tooltip function for this type of series.
   * @param series {jsx3.chart.Series} 
   * @param record {jsx3.xml.Entity} 
   * @return {String}
   */
  AreaSeries.tooltip = function(series, record) {
    var x = series.getXValue(record);
    var y = series.getYValue(record);
    var min = series.getMinValue(record);
    
    var tip = min != null ? "{" + min + "," + y + "}" : y;
    if (x != null) tip += ", x = " + x;
    return tip;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  AreaSeries.getVersion = function() {
    return chart.VERSION;
  };

/* @JSC :: end */

});
