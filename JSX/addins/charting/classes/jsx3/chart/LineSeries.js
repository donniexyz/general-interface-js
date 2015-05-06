/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.Series", "jsx3.chart.PointRenderer");

/**
 * A data series for a line chart. An line series draws a set of points connected by a line.
 * A line series has the following properties:
 * <dl>
 * <dt>xField</dt> <dd>the attribute of a record to use as the x-coordinate of points in the series, required if
 *     the x-axis is a value axis</dd>
 * <dt>yField</dt> <dd>the attribute of a record to use as the y-coordinate of points in the series, required</dd>
 * <dt>form</dt> <dd>defines how the area is drawn, one of {'segment','step','reverseStep','horizontal','vertical'},
 *     defaults to 'segment'</dd>
 * <dt>interpolateValues</dt> <dd>if true the the line will be continuous even over missing data points, if false the
 *     the line will break over missing data points</dd>
 * <dt>pointRadius</dt> <dd>the radius of the points to render at each data point on the line, optional</dd>
 * <dt>pointRenderer</dt> <dd>string that evals to an object that implements the renderer interface, optional</dd>
 * <dt>pointFill</dt> <dd>string representation of a vector fill for the points</dd>
 * <dt>pointStroke</dt> <dd>string representation of a VectorStroke for the points</dd>
 * <dt>pointGradient</dt> <dd>string representation of a vector fill gradient for the points</dd>
 * </dl>
 */
jsx3.Class.defineClass("jsx3.chart.LineSeries", jsx3.chart.Series, null, function(LineSeries, LineSeries_prototype) {

  var vector = jsx3.vector;
  
  /**
   * {String}
   * @final @jsxobf-final
   */
  LineSeries.FORM_SEGMENT = "segment";

  /**
   * {String}
   * @final @jsxobf-final
   */
  LineSeries.FORM_STEP = "step";

  /**
   * {String}
   * @final @jsxobf-final
   */
  LineSeries.FORM_REVSTEP = "reverseStep";

  /**
   * {String}
   * @final @jsxobf-final
   */
  LineSeries.FORM_HORIZONTAL = "horizontal";

  /**
   * {String}
   * @final @jsxobf-final
   */
  LineSeries.FORM_VERTICAL = "vertical";

  /**
   * Allowed values for the 'form' field, in a map.
   * @private
   * @jsxobf-clobber
   */
  LineSeries._FORMS = {segment: 1, step: 1, reverseStep: 1, horizontal: 1, vertical: 1};
  
  /** 
   * @private
   * @jsxobf-clobber
   * @final @jsxobf-final
   */
  LineSeries._DEFAULT_POINT_RADIUS = 4;

  /**
   * Legend renderer class for jsx3.chart.LineSeries.
   * @private
   * @jsxobf-clobber
   */
  LineSeries._LegendRenderer = function(series) {
    this.series = series;
  };

  LineSeries._LegendRenderer.prototype.render = function(x1, y1, x2, y2, fill, stroke) {
    var w = x2 - x1; 
    var h = y2 - y1;
    var shape = new vector.Group(x1, y1, w, h);
    var lineStroke = this.series.getDisplayedStroke();
    var line = new vector.Line(0, 0, 0, Math.round(h/2), w, Math.round(h/2));
    line.setStroke(lineStroke);
    shape.appendChild(line);
  
    var renderer = this.series.getPointRenderer();
    if (renderer != null) {
      var padding = Math.round(w/4);
      var pointFill = this.series._getDisplayedPointFill();
      var pointStroke = this.series._getDisplayedPointStroke();
      var point = renderer.render(padding, padding, w-padding, h-padding, pointFill, pointStroke);
      shape.appendChild(point);
    }
  
    return shape;
  };

  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param seriesName {String} the name of the Series, will be displayed in the Legend for most chart types
   */
  LineSeries_prototype.init = function(name, seriesName) {
    //call constructor for super class
    this.jsxsuper(name, seriesName);

    this.xField = null;
    this.yField = null;
    this.form = LineSeries.FORM_SEGMENT;
    this.interpolateValues = jsx3.Boolean.FALSE;
    this.pointRadius = null;
    this.pointRenderer = null;
    this.pointFill = null;
    this.pointStroke = null;
    this.pointGradient = null;
  
    this.setTooltipFunction("jsx3.chart.LineSeries.tooltip");
  };

  /**
   * Returns the xField field.
   * @return {String} xField
   */
  LineSeries_prototype.getXField = function() {
    return this.xField;
  };

  /**
   * Sets the xField field.
   * @param xField {String} the new value for xField
   */
  LineSeries_prototype.setXField = function( xField ) {
    this.xField = xField;
  };

  /**
   * Returns the yField field.
   * @return {String} yField
   */
  LineSeries_prototype.getYField = function() {
    return this.yField;
  };

  /**
   * Sets the yField field.
   * @param yField {String} the new value for yField
   */
  LineSeries_prototype.setYField = function( yField ) {
    this.yField = yField;
  };

  /**
   * Returns the form field.
   * @return {String} form
   */
  LineSeries_prototype.getForm = function() {
    return this.form;
  };

  /**
   * Sets the form field, checks for valid value.
   * @param form {String} the new value for form, one of {'segment','step','reverseStep','horizontal','vertical'}
   */
  LineSeries_prototype.setForm = function( form ) {
    if (LineSeries._FORMS[form]) {
      this.form = form;
    } else {
      throw new jsx3.IllegalArgumentException("form", form);
    }
  };

  /**
   * Returns the interpolateValues field.
   * @return {boolean} interpolateValues
   */
  LineSeries_prototype.getInterpolateValues = function() {
    return this.interpolateValues;
  };

  /**
   * Sets the interpolateValues field.
   * @param interpolateValues {boolean} the new value for interpolateValues
   */
  LineSeries_prototype.setInterpolateValues = function( interpolateValues ) {
    this.interpolateValues = interpolateValues;
  };

  /**
   * Returns the pointRadius field.
   * @return {int} pointRadius
   */
  LineSeries_prototype.getPointRadius = function() {
    return this.pointRadius != null ? this.pointRadius : LineSeries._DEFAULT_POINT_RADIUS;
  };

  /**
   * Sets the pointRadius field.
   * @param pointRadius {int} the new value for pointRadius
   */
  LineSeries_prototype.setPointRadius = function( pointRadius ) {
    this.pointRadius = pointRadius;
  };

  /**
   * Returns the pointRenderer field.
   * @return {jsx3.chart.PointRenderer} pointRenderer
   */
  LineSeries_prototype.getPointRenderer = function() {
    return jsx3.chart.getReferenceField(this, "pointRenderer");
  };

  /**
   * Sets the pointRenderer field, should eval to an object that implements the renderer interface.
   * @param pointRenderer {String} the new value for pointRenderer, as a string
   */
  LineSeries_prototype.setPointRenderer = function( pointRenderer ) {
    jsx3.chart.setReferenceField(this, "pointRenderer", pointRenderer);
  };

  /**
   * Returns the pointFill field.
   * @return {String} pointFill
   */
  LineSeries_prototype.getPointFill = function() {
    return this.pointFill;
  };

  /**
   * Sets the pointFill field.
   * @param pointFill {String} the new value for pointFill
   */
  LineSeries_prototype.setPointFill = function( pointFill ) {
    this.pointFill = pointFill;
  };

  /**
   * Returns the pointStroke field.
   * @return {String} pointStroke
   */
  LineSeries_prototype.getPointStroke = function() {
    return this.pointStroke;
  };

  /**
   * Sets the pointStroke field.
   * @param pointStroke {String} the new value for pointStroke
   */
  LineSeries_prototype.setPointStroke = function( pointStroke ) {
    this.pointStroke = pointStroke;
  };
  
  /**
   * Returns the pointGradient field.
   * @return {String} pointGradient
   */
  LineSeries_prototype.getPointGradient = function() {
    return this.pointGradient;
  };

  /**
   * Sets the pointGradient field.
   * @param pointGradient {String} the new value for pointGradient
   */
  LineSeries_prototype.setPointGradient = function( pointGradient ) {
    this.pointGradient = pointGradient;
  };
  
  /**
   * Returns the fill for the points.
   * @return {jsx3.vector.Fill}
   * @private
   * @jsxobf-clobber
   */
  LineSeries_prototype._getDisplayedPointFill = function() {
    var fill = this.fetchTransient("trans_pointFill");
    if (fill == null)
      this._storePointFillAndStroke();
    return this.fetchTransient("trans_pointFill");
  };

  /**
   * Returns the stroke for the points.
   * @return {jsx3.vector.Stroke}
   * @private
   * @jsxobf-clobber
   */
  LineSeries_prototype._getDisplayedPointStroke = function() {
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
  LineSeries_prototype._storePointFillAndStroke = function() {
    var mainStroke = this.getDisplayedStroke();
    var fill = vector.Fill.valueOf(this.getPointFill());
    if (fill == null && mainStroke != null) 
      fill = new vector.Fill(mainStroke.getColor());
    if (fill != null)
      fill = jsx3.chart.addGradient(fill, this.pointGradient);
    var stroke = vector.Stroke.valueOf(this.getPointStroke());
    this.storeTransient("trans_pointFill", fill);
    this.storeTransient("trans_pointStroke", stroke);
  };
  
  /**
   * Renders all vector elements of the series and appends them to the render root.
   * @package
   */
  LineSeries_prototype.updateView = function() {
    this.jsxsuper();
    var root = this.getCanvas();
    
    // create the shape that will contain the line
    this.shape = new vector.Shape(null, 0, 0, root.getWidth(), root.getHeight());
    this.shape.setId(this.getId() + "_line");
    root.appendChild(this.shape);
    var mainStroke = this.getDisplayedStroke();
    this.shape.setStroke(mainStroke);
    
    this.setEventProperties(this.shape);
    
    this._storePointFillAndStroke();
    
    // paint the stored points
    var lastPoint = null, lastIndex = null;
    var points = this._getShownPoints();
    for (var i = 0; i < points.length; i++) {
      var point = points[i];
      if (point == null) continue;
      
      var lx = null, ly = null, continuous = false;
      // figure out the last point to render and whether this segment is continuous
      if (lastPoint != null) {
        lx = lastPoint[1];
        ly = lastPoint[2];
        continuous = (lastIndex == (i - 1));
      }
      this._paintPoint(i, continuous, point[0], point[1], point[2], point[3], lx, ly, lastIndex == null);
      
      lastPoint = point;
      lastIndex = i;
    }
  };
  
  /**
   * add a point to the line series
   * @param i {int} the index of the point (index of <record> in data provider)
   * @param continuous {boolean} whether this point is continuous with the previous point painted with a call to this method
   * @param record {jsx3.xml.Entity} 
   * @param x {int} the x coordinate of this point
   * @param y {int} the y coordinate of this point
   * @param lx {int} the x coordinate of the last point
   * @param ly {int} the y coordinate of the last point
   * @private
   * @jsxobf-clobber
   */
  LineSeries_prototype._paintPoint = function(i, continuous, record, x, y, index, lx, ly, bFirst) {
    var root = this.getCanvas();
    var shape = this.shape;
    
    // render the point if there is a renderer
    var renderer = this.getPointRenderer();
    if (renderer != null) {
      var radius = this.getPointRadius();
      
      var colorFunct = this.getColorFunction();
      var thisFill = colorFunct != null ? colorFunct.apply(this, [record, index]) : this._getDisplayedPointFill();
      
      var point = renderer.render(x - radius, y - radius, x + radius, y + radius, 
          thisFill, this._getDisplayedPointStroke());
      point.setId(this.getId() + "_p" + i);
      
      this.setEventProperties(point, i, record.getAttribute('jsxid'));
      
      root.appendChild(point);

      var funct = this.getTooltipFunction();
      if (funct != null)
        point.setToolTip(funct.apply(this, [this, record]));
    }
    
    // figure out if this is the start of a new line segment
    var startSegment = bFirst ||
      (!continuous && !this.interpolateValues);
    
    if (startSegment) {
      shape.pathMoveTo(x, y);
    } else {
      if (this.form == LineSeries.FORM_SEGMENT) {
        // draw straight line
        shape.pathLineTo(x, y);
      } else if (this.form == LineSeries.FORM_HORIZONTAL) {
        // move up, then draw over
        shape.pathMoveTo(lx, y).pathLineTo(x, y);
      } else if (this.form == LineSeries.FORM_VERTICAL) {
        // move over, then draw up
        shape.pathMoveTo(x, ly).pathLineTo(x, y);
      } else if (this.form == LineSeries.FORM_STEP) {
        // draw over, then up
        shape.pathLineTo(x, ly).pathLineTo(x, y);
      } else if (this.form == LineSeries.FORM_REVSTEP) {
        // draw up, then over
        shape.pathLineTo(lx, y).pathLineTo(x, y);
      } else {
        jsx3.chart.LOG.error("bad LineSeries form: " + this.form);
      }
    }
  };

  /**
   * Returns the cached points.
   * @return {Array}
   * @private
   * @jsxobf-clobber
   */
  LineSeries_prototype._getShownPoints = function() {
    var points = this.fetchTransient("trans_shownPoints");
    if (points == null) {
      points = [];
      this.storeTransient("trans_shownPoints", points);
    }
    return points;
  };

  /**
   * add a point to the line
   * @param record {jsx3.xml.Entity} the <record/> node
   * @param x {int} the x coordinate of the point, in the coordinate space of the series
   * @param y {int} the y coordinate of the point, in the coordinate space of the series
   * @package
   */
  LineSeries_prototype.addPoint = function(record, x, y, index) {
    this._getShownPoints().push([record, x, y, index]);
  };

  /**
   * add a missing point to the line
   * @param record {jsx3.xml.Entity} the <record/> node
   * @param x {int} the x coordinate of the point, if any, in the coordinate space of the series
   * @param y {int} the y coordinate of the point, if any, in the coordinate space of the series
   * @package
   */
  LineSeries_prototype.addEmptyPoint = function(record, x, y, index) {
    this._getShownPoints().push(null);
  };

  /**
   * clear the caches points for the series
   * @package
   */
  LineSeries_prototype.clear = function() {
    var points = this._getShownPoints();
    points.splice(0, points.length);
  };

  /**
   * Returns the x-coordinate of a data point in this series for the given record.
   * @param record {jsx3.xml.Entity} the <record/> node
   * @return {Number}
   * @package
   */
  LineSeries_prototype.getXValue = function( record ) {
    if (this.xField)
      return jsx3.chart.asNumber(record.getAttribute(this.xField));
    return null;
  };

  /**
   * Returns the y-coordinate of a data point in this series for the given record.
   * @param record {jsx3.xml.Entity} the <record/> node
   * @return {Number}
   * @package
   */
  LineSeries_prototype.getYValue = function( record ) {
    if (this.yField)
      return jsx3.chart.asNumber(record.getAttribute(this.yField));
    return null;
  };

  /**
   * this class provides a custom legend renderer so that the line and point can be shown in the legend
   * @return {jsx3.chart.PointRenderer}
   * @package
   */
  LineSeries_prototype.getLegendRenderer = function() {
    return new LineSeries._LegendRenderer(this);
  };

  /** 
   * The default tooltip function for this type of series.
   * @param series {jsx3.chart.Series} 
   * @param record {jsx3.xml.Entity} 
   * @return {String}
   */
  LineSeries.tooltip = function(series, record) {
    var x = series.getXValue(record);
    var y = series.getYValue(record);
    return x != null ? "{" + x + "," + y + "}" : y;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  LineSeries.getVersion = function() {
    return jsx3.chart.VERSION;
  };

/* @JSC :: end */

});
