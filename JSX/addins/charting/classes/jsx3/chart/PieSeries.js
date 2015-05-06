/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.Series");

/**
 * A data series for a pie chart. Draws a complete pie or ring of a doughnut. A pie series is slightly
 * different from all the other series because it gets colored in by category instead of all one color.
 * A pie series has the following fields:
 * <dl>
 * <dt>xField</dt> <dd>the attribute of a record to use as the relative size of each slice of the pie, required</dd>
 * <dt>totalAngle</dt> <dd>the total angle for the series, if not set use the value from the chart</dd>
 * <dt>startAngle</dt> <dd>the angle of the start of the first slice, 0 is top and increasing values go clockwise, 
 *     if not set use the value from the chart</dd>
 * <dt>colors</dt> <dd>an array of string representations of vector fills to color in the slices, if not set use
 *     the value from the chart</dd>
 * <dt>colorFunction</dt> <dd>a function that determines the color of each slice, with the signature 
 *     function(record, index) : jsx3.vector.Fill, if not set use the value from the chart</dd>
 * <dt>stroke</dt> <dd>string representation of a VectorStroke to outline the slices with, if not set use the value 
 *     from the chart</dd>
 * <dt>labelPlacement</dt> <dd>where to place a label with the name of the series, relative to the series, one of
 *     {'top','right','bottom','left'}</dd>
 * <dt>labelOffset</dt> <dd>the padding (may be negative) between the outer edge of the series and the close edge of
 *     the label</dd>
 * </dl>
 */
jsx3.Class.defineClass("jsx3.chart.PieSeries", jsx3.chart.Series, null, function(PieSeries, PieSeries_prototype) {
  
  var vector = jsx3.vector;
  
  /**
   * Valid values for the 'labelPlacement' field, as a map.
   * @private
   * @jsxobf-clobber
   */
  PieSeries._LABEL_PLACEMENTS = {top: 1, right: 1, bottom: 1, left: 1};

  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param seriesName {String} the name of the Series, will be displayed in the Legend for most chart types
   */
  PieSeries_prototype.init = function(name, seriesName) {
    //call constructor for super class
    this.jsxsuper(name, seriesName);

    this.field = null;
    this.totalAngle = null; // use chart setting
    this.startAngle = null; // use chart setting
    this.colors = null; // use chart setting
    this.colorFunction = null; // use chart setting
    this.stroke = null; // use chart setting
    this.labelPlacement = jsx3.chart.QBOTTOM;
    this.labelOffset = 10;
  
    this.setTooltipFunction("jsx3.chart.PieSeries.tooltip");
  };

  /**
   * Returns the totalAngle field, overrides per-chart setting in PieChart.
   * @return {int} totalAngle
   */
  PieSeries_prototype.getTotalAngle = function() {
    return this.totalAngle;
  };

  /**
   * Sets the totalAngle field.
   * @param totalAngle {int} the new value for totalAngle
   */
  PieSeries_prototype.setTotalAngle = function( totalAngle ) {
    this.totalAngle = totalAngle == null ? null : Math.max(0, Math.min(360, totalAngle));
  };

  /**
   * Returns the startAngle field, overrides per-chart setting in PieChart.
   * @return {int} startAngle
   */
  PieSeries_prototype.getStartAngle = function() {
    return this.startAngle;
  };

  /**
   * Sets the startAngle field.
   * @param startAngle {int} the new value for startAngle
   */
  PieSeries_prototype.setStartAngle = function( startAngle ) {
    this.startAngle = startAngle == null ? null : jsx3.util.numMod(startAngle, 360);
  };

  /**
   * Returns the field field, the attribute of the data provider to use as values for this series.
   * @return {String} field
   */
  PieSeries_prototype.getField = function() {
    return this.field;
  };

  /**
   * Sets the field field.
   * @param field {String} the new value for field
   */
  PieSeries_prototype.setField = function( field ) {
    this.field = field;
  };

  /**
   * Returns the value of a data point in this series for the given record.
   * @param record {jsx3.xml.Entity} the <record/> node
   * @return {Number}
   */
  PieSeries_prototype.getValue = function( record ) {
    if (this.field)
      return jsx3.chart.asNumber(record.getAttribute(this.field));
    return null;
  };
  
  /**
   * Returns the colors field, overrides per-chart setting in PieChart.
   * @return {Array<String|int>} colors
   */
  PieSeries_prototype.getColors = function() {
    return this.colors;
  };

  /**
   * Sets the colors field.
   * @param colors {Array<String|int>} the new value for colors
   */
  PieSeries_prototype.setColors = function( colors ) {
    this.colors = colors;
  };

  /**
   * Returns the labelPlacement field, where to place the optional ChartLabel child.
   * @return {String} labelPlacement
   */
  PieSeries_prototype.getLabelPlacement = function() {
    return this.labelPlacement != null ? this.labelPlacement : jsx3.chart.QBOTTOM;
  };

  /**
   * Sets the labelPlacement field.
   * @param labelPlacement {String} the new value for labelPlacement
   */
  PieSeries_prototype.setLabelPlacement = function( labelPlacement ) {
    if (PieSeries._LABEL_PLACEMENTS[labelPlacement]) {
      this.labelPlacement = labelPlacement;
    } else {
      throw new jsx3.IllegalArgumentException("labelPlacement", labelPlacement);
    }
  };

  /**
   * Returns the labelOffset field, the pixel offset of the optional ChartLabel child.
   * @return {int} labelOffset
   */
  PieSeries_prototype.getLabelOffset = function() {
    return this.labelOffset != null ? this.labelOffset : 0;
  };

  /**
   * Sets the labelOffset field.
   * @param labelOffset {int} the new value for labelOffset
   */
  PieSeries_prototype.setLabelOffset = function( labelOffset ) {
    this.labelOffset = Math.round(labelOffset);
  };

  /**
   * Returns a vector fill for a category (record).
   * @param record {jsx3.xml.Entity} the <record/> node
   * @param index {int} the index of the record in the data provider
   * @return {jsx3.vector.Fill}
   * @package
   */
  PieSeries_prototype.getFillForIndex = function( record, index ) {
    // try a color from the explicitly set 'colors' field
    var colors = this.getColors();
    if (colors != null && colors.length > 0)
      return vector.Fill.valueOf(colors[index % colors.length]);
    
    // try this series' color function
    var funct = this.getColorFunction();
    if (funct != null)
      return funct.apply(this, [record, index]);
    
    // try delegating to the chart
    var myChart = this.getChart();
    if (myChart != null)
      return myChart.getFillForIndex(record, index);
    
    // return black
    return new vector.Fill();
  };
  
  /**
   * Returns a VectorStroke for a category (record).
   * @param index {int} the index of the record in the data provider
   * @return {jsx3.vector.Stroke}
   * @private
   * @jsxobf-clobber
   */
  PieSeries_prototype._getStrokeForIndex = function( index ) {
    // try the explicitly set 'stroke' field
    if (this.stroke)
      return vector.Stroke.valueOf(this.stroke);
    
    // try delegating to the chart
    var myChart = this.getChart();
    if (myChart != null) {
      var stroke = myChart.getSeriesStroke();
      if (stroke)
        return vector.Stroke.valueOf(stroke);
    }
    
    // return no stroke
    return null;
  };
  
  /**
   * add a slice to the series
   * @param record {jsx3.xml.Entity} the <record/> node
   * @param cx {int} the x-coordinate of the center of the series
   * @param cy {int} the y-coordinate of the center of the series
   * @param startAngle {float} the starting angle of the slice
   * @param endAngle {float} the ending angle of the slice
   * @param innerRadius {int} the inner radius of the doughnut slice, 0 for pie slice
   * @param outerRadius {int} the outer radius of the slice
   * @param percent {float} the percent of the total value of the series
   * @package
   */
  PieSeries_prototype.addSlice = function(record, cx, cy, startAngle, endAngle, innerRadius, outerRadius, percent) {
    var slices = this.fetchTransient("trans_slices");
    if (slices == null) {
      slices = [];
      this.storeTransient("trans_slices", slices);
    }
    // cache slice, will draw in updateView()
    slices.push([record, cx, cy, startAngle, endAngle, innerRadius, outerRadius, percent]);
  };
  
  PieSeries_prototype.addEmptySlice = function() {
    this.addSlice(null);
  };
  
  /**
   * clear all the caches slices
   * @package
   */
  PieSeries_prototype.clearSlices = function() {
    var slices = this.fetchTransient("trans_slices");
    if (slices != null) 
      slices.splice(0, slices.length);
  };
  
  /**
   * Renders all vector elements of the series and appends them to the render root.
   * @package
   */
  PieSeries_prototype.updateView = function() {
    this.jsxsuper();
    var root = this.getCanvas();
    var w = root.getWidth();
    var h = root.getHeight();
    
    var slices = this.fetchTransient("trans_slices");
    if (slices == null) return;
    
    var funct = this.getTooltipFunction();

    // draw the saved slices
    for (var i = 0; i < slices.length; i++) {
      var record = slices[i][0];
      if (record == null) continue;
      
      var cx = slices[i][1];
      var cy = slices[i][2];
      var startAngle = slices[i][3];
      var endAngle = slices[i][4];
      var innerRadius = slices[i][5];
      var outerRadius = slices[i][6];
      var percent = slices[i][7];
      
      var shape = new vector.Shape(null, 0, 0, w, h);
      shape.setId(this.getId() + "_s" + i);
      root.appendChild(shape);
      shape.setFill(this.getFillForIndex(record, i));
      shape.setStroke(this._getStrokeForIndex(i));
      
      this.setEventProperties(shape, i, record.getAttribute('jsxid'));
      
      // convert degrees (0 at top, clockwise) to radians (0 at right, counterclockwise)
      var t1 = vector.degreesToRadians(endAngle);
      var t2 = vector.degreesToRadians(startAngle);
      
      // calculate {x,y} for the start and end of the outer arc
      var x1 = Math.round(outerRadius * Math.cos(t1)) + cx;
      var y1 = Math.round(-1 * outerRadius * Math.sin(t1)) + cy;
      var x2 = Math.round(outerRadius * Math.cos(t2)) + cx;
      var y2 = Math.round(-1 * outerRadius * Math.sin(t2)) + cy;
      
      var bFullCircle = x1 == x2 && y1 == y2 && (endAngle-startAngle > 180);
      
      shape.pathMoveTo(x1, y1);        
      
      if (bFullCircle || x1 != x2 || y1 != y2) {
        shape.pathArcTo(cx, cy, outerRadius, outerRadius, x1, y1, x2, y2, false);
      }
      
      if (innerRadius > 0) {
        // calculate {x,y} for the start and end of the inner arc
        var x3 = Math.round(innerRadius * Math.cos(t1)) + cx;
        var y3 = Math.round(-1 * innerRadius * Math.sin(t1)) + cy;
        var x4 = Math.round(innerRadius * Math.cos(t2)) + cx;
        var y4 = Math.round(-1 * innerRadius * Math.sin(t2)) + cy;
        
        // line and arc
        shape.pathLineTo(x4, y4);
        
        if (bFullCircle || x3 != x4 || y3 != y4) {
          // for whatever reason a ccw arc does not draw 360deg if start and end are the same 
          // though a cw arc does
          shape.pathArcTo(cx, cy, innerRadius, innerRadius, x4, y4, x3, y3, true);
        }
      } else if (!bFullCircle) {
        shape.pathLineTo(cx, cy);
      }
      
      // close 
      shape.pathClose();

      if (funct != null)
        shape.setToolTip(funct.apply(this, [this, record, percent]));
    }
    
    // place the label just outside the series
    var label = this.getLabel();
    if (label != null && label.getDisplay() != jsx3.gui.Block.DISPLAYNONE) {
      var bounds = [0,0,w,h];
      if (slices.length > 0) {
        bounds = [slices[0][1]-slices[0][6], slices[0][2]-slices[0][6], 
            slices[0][1]+slices[0][6], slices[0][2]+slices[0][6]];
      }

      var lw = label.getPreferredWidth();
      var lh = label.getPreferredHeight();
      
      var ll = 0, lt = 0;
      if (this.labelPlacement == jsx3.chart.QTOP) {
        ll = Math.round(w/2 - lw/2);
        lt = bounds[1] - this.getLabelOffset() - lh;
      } else if (this.labelPlacement == jsx3.chart.QRIGHT) {
        ll = bounds[2] + this.getLabelOffset();
        lt = Math.round(h/2 - lh/2);
      } else if (this.labelPlacement == jsx3.chart.QLEFT) {
        ll = bounds[0] - this.getLabelOffset() - lw;
        lt = Math.round(h/2 - lh/2);
      } else {
        ll = Math.round(w/2 - lw/2);
        lt = bounds[3] + this.getLabelOffset();
      }
      
      label.setDimensions(ll, lt, lw, lh);
      label.setText(this.getSeriesName());
      label.updateView();
      root.appendChild(label.getCanvas());
    }
  };

  /**
   * The default tooltip function for this type of series.
   * @param series {jsx3.chart.Series} 
   * @param record {jsx3.xml.Entity} 
   * @return {String}
   */
  PieSeries.tooltip = function(series, record, percent) {
    var v = series.getValue(record);
    return v + ", " + (Math.round(percent * 10)/10) + "%";
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  PieSeries.getVersion = function() {
    return jsx3.chart.VERSION;
  };

/* @JSC :: end */

});
