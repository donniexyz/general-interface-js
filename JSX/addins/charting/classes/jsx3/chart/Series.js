/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.ChartComponent");

/**
 * The base class for all data series classes. In general, a chart is made up of a fixed number of 
 * configured series and a variable number of categories. A series is essentially an addressing scheme
 * that defines how to get information out of each category. 
 */
jsx3.Class.defineClass("jsx3.chart.Series", jsx3.chart.ChartComponent, null, function(Series, Series_prototype) {

  var Interactive = jsx3.gui.Interactive;
  var vector = jsx3.vector;
  var chart = jsx3.chart;
  
  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param seriesName {String} the name of the Series, will be displayed in the Legend for most chart types
   */
  Series_prototype.init = function(name,seriesName) {
    //call constructor for super class
    this.jsxsuper(name);

    this.seriesName = seriesName;
    this.usePrimaryX = jsx3.Boolean.TRUE;
    this.usePrimaryY = jsx3.Boolean.TRUE;
  
    this.stroke = null;
    this.fill = null;
    this.fillGradient = null;  
    this.tooltipFunction = null;
  };

  /**
   * Returns the seriesName field.
   * @return {String} seriesName
   */
  Series_prototype.getSeriesName = function() {
    return this.seriesName;
  };

  /**
   * Sets the seriesName field, this name is usually displayed in a legend or as a label.
   * @param seriesName {String} the new value for seriesName
   */
  Series_prototype.setSeriesName = function( seriesName ) {
    this.seriesName = seriesName;
  };

  /**
   * Returns the usePrimaryX field.
   * @return {boolean} usePrimaryX
   * @package
   */
  Series_prototype.getUsePrimaryX = function() {
    return this.usePrimaryX;
  };

  /**
   * Sets the usePrimaryX field, whether this series uses the primary x axis or the secondary one (not yet supported).
   * @param usePrimaryX {boolean} the new value for usePrimaryX
   * @package
   */
  Series_prototype.setUsePrimaryX = function( usePrimaryX ) {
    this.usePrimaryX = usePrimaryX;
  };

  /**
   * Returns the usePrimaryY field.
   * @return {boolean} usePrimaryY
   * @package
   */
  Series_prototype.getUsePrimaryY = function() {
    return this.usePrimaryY;
  };

  /**
   * Sets the usePrimaryY field, whether this series uses the primary y axis or the secondary one (not yet supported).
   * @param usePrimaryY {boolean} the new value for usePrimaryY
   * @package
   */
  Series_prototype.setUsePrimaryY = function( usePrimaryY ) {
    this.usePrimaryY = usePrimaryY;
  };
  
  /**
   * Sets the function used to render tooltips for each area drawn by this series.
   * The function will be applied to this object when called.
   * Note that passing a function reference to this method will prevent the color
   * function from persisting if this object is serialized.
   * @param tooltipFunction {String | Function} a function with the signature
   *    <code>function(s : jsx3.chart.Series, record : jsx3.xml.Entity) : String</code>
   */
  Series_prototype.setTooltipFunction = function( tooltipFunction ) {
    chart.setReferenceField(this, "tooltipFunction", tooltipFunction);
  };
  
  /**
   * Returns the function used to render tooltips for each area drawn by this series.
   * @return {Function} function(series,record) : string
   */
  Series_prototype.getTooltipFunction = function() {
    return chart.getFunctionField(this, "tooltipFunction");
  };

  /**
   * Returns the index of this series in the list of chart's series.
   * @return {int} index, -1 if not found
   */
  Series_prototype.getIndex = function() {
    var myChart = this.getChart();
    return myChart != null ? myChart.getSeriesIndex(this) : -1;
  };

  /**
   * Returns the stroke field.
   * @return {String} stroke
   */
  Series_prototype.getStroke = function() {
    return this.stroke;
  };

  /**
   * Sets the stroke field, string representation of a VectorStroke.
   * @param stroke {String} the new value for stroke
   */
  Series_prototype.setStroke = function( stroke ) {
    this.stroke = stroke;
  };

  /**
   * Returns the fill field.
   * @return {String} fill
   */
  Series_prototype.getFill = function() {
    return this.fill;
  };

  /**
   * Sets the fill field, string representation of a vector fill.
   * @param fill {String} the new value for fill
   */
  Series_prototype.setFill = function( fill ) {
    this.fill = fill;
  };

  /**
   * Returns the fillGradient field.
   * @return {String} fillGradient
   */
  Series_prototype.getFillGradient = function() {
    return this.fillGradient;
  };

  /**
   * Sets the fillGradient field, string representation of a vector fill gradient.
   * @param fillGradient {String} the new value for fillGradient
   */
  Series_prototype.setFillGradient = function( fillGradient ) {
    this.fillGradient = fillGradient;
  };

  /**
   * Returns the x axis that this series is plotted against.
   * @return {jsx3.chart.Axis} the x axis
   */
  Series_prototype.getXAxis = function() {
    var myChart = this.getChart();
    if (myChart != null) {
      return this.usePrimaryX ? myChart.getPrimaryXAxis() : myChart.getSecondaryXAxis();
    }
    return null;
  };

  /**
   * Returns the y axis that this series is plotted against.
   * @return {jsx3.chart.Axis} the y axis
   */
  Series_prototype.getYAxis = function() {
    var myChart = this.getChart();
    if (myChart != null) {
      return this.usePrimaryY ? myChart.getPrimaryYAxis() : myChart.getSecondaryYAxis();
    }
    return null;
  };
  
  /**
   * Returns the fill for this series when no fill is explicitly set; looks in the global list of default fills, jsx3.chart.Chart.DEFAULT_FILLS.
   * @return {jsx3.vector.Fill}
   * @package
   */
  Series_prototype.getDefaultFill = function() {
    var index = Math.max(this.getIndex(), 0) % chart.Chart.DEFAULT_FILLS.length;
    return chart.Chart.DEFAULT_FILLS[index];
  };

  /**
   * Returns the stroke for this series when no fill or stroke is explicitly set; looks in the global list of default strokes, jsx3.chart.Chart.DEFAULT_STROKES, or creates a stroke with the same color as the default fill for this series.
   * @return {jsx3.vector.Stroke}
   * @package
   */
  Series_prototype.getDefaultStroke = function() {
    var index = Math.max(this.getIndex(), 0) % chart.Chart.DEFAULT_FILLS.length;
    // cache default strokes here
    if (chart.Chart.DEFAULT_STROKES[index] == null) {
      var fill = this.getDefaultFill();
      // create a stroke with the same hue as the default fill
      chart.Chart.DEFAULT_STROKES[index] = new vector.Stroke(fill.getColor(), 1, fill.getAlpha());
    }
    return chart.Chart.DEFAULT_STROKES[index];
  };
  
  /**
   * Returns the fill that this series should be painted with, using the values of the 'fill' and 'fillGradient' fields or the default fill if those are empty.
   * @return {jsx3.vector.Fill}
   * @package
   */
  Series_prototype.getDisplayedFill = function() {
    var fill = this.fill ? vector.Fill.valueOf(this.fill) : this.getDefaultFill();
    if (fill != null) {
      fill = chart.addGradient(fill, this.fillGradient);
    }
    return fill;
  };

  /**
   * Returns the stroke that this series should be painted with, using the value of the 'stroke' field, the fill parameter, or the default stroke if those are empty.
   * @param fill {jsx3.vector.Fill} the fill that this series will be painted with, if this.stroke is empty and fill is a solid hue, this method will return a new vector stroke with the same hue as fill (in order to avoid annoying anti-aliasing fuzziness
   * @return {jsx3.vector.Stroke}
   * @package
   */
  Series_prototype.getDisplayedStroke = function(fill) {
    if (this.stroke) {
      return vector.Stroke.valueOf(this.stroke);
    } else if (this.getColorFunction() != null) {
      return null;
    } else if (fill != null && fill.canInline()) {
      return new vector.Stroke(fill.getColor());
    } else {
      if (! this.fill)
        return this.getDefaultStroke(fill);
      else 
        return null;
    }
  };
  
  /**
   * Returns the colorFunction field.
   * @return {Function} colorFunction
   * @since 3.1
   */
  Series_prototype.getColorFunction = function() {
    return chart.getFunctionField(this, "colorFunction");
  };

  /**
   * Sets the colorFunction field. The function will be applied to this object when called.
   * Note that passing a function reference to this method will prevent the color
   * function from persisting if this object is serialized.
   * @param colorFunction {String | Function} the new value for colorFunction, a function with the signature
   *     <code>function(record : jsx3.xml.Entity, index : Number) : jsx3.vector.Fill</code>.
   * @since 3.1
   */
  Series_prototype.setColorFunction = function( colorFunction ) {
    chart.setReferenceField(this, "colorFunction", colorFunction);
  };

  /**
   * the renderer that will control how the legend will render the colored point next to the the series name
   * @return {jsx3.chart.PointRenderer} jsx3.chart.PointRenderer.BOX, can be overridden
   * @package
   */
  Series_prototype.getLegendRenderer = function() {
    return chart.PointRenderer.BOX;
  };

  /**
   * Returns the optional jsx3.chart.ChartLabel child of this series.
   * @return {jsx3.chart.ChartLabel}
   */
  Series_prototype.getLabel = function() {
    return chart.ChartLabel ? this.getFirstChildOfType(chart.ChartLabel) : null;
  };
  
  /**
   * Allows one jsx3.chart.ChartLabel child, which may or may not be rendered.
   * @package
   */
  Series_prototype.onSetChild = function(child) {
    return (chart.ChartLabel && child instanceof chart.ChartLabel) && this.getLabel() == null;
  };
  
  Series_prototype.onSetParent = function(objParent) {
    return chart.Chart && objParent instanceof chart.Chart;
  };

  Series_prototype.setEventProperties = function(objTag, intIndex, strRecordId) {
    if (objTag == null) 
      objTag = this.getCanvas();
    
    if (strRecordId != null)
      objTag.setProperty("strRecordId", strRecordId);
    if (intIndex != null)
      objTag.setProperty("recordIndex", intIndex);
    
    this.jsxsuper(objTag);
  };

  Series_prototype._ebClick = function(objEvent, objGUI) {
    var intIndex = objGUI.getAttribute("recordIndex");
    var strRecordId = objGUI.getAttribute("strRecordId");    
    this.doEvent(jsx3.gui.Interactive.SELECT, {objEVENT:objEvent, intINDEX:intIndex, strRECORDID:strRecordId});
  };
    
  Series_prototype._ebDoubleClick = function(objEvent, objGUI) {
    var intIndex = objGUI.getAttribute("recordIndex");
    var strRecordId = objGUI.getAttribute("strRecordId");    
    this.doEvent(jsx3.gui.Interactive.EXECUTE, {objEVENT:objEvent, intINDEX:intIndex, strRECORDID:strRecordId});
  };

  Series_prototype.doSpyOver = function(objEvent, objGUI) {
    var intIndex = objGUI.getAttribute("recordIndex");
    var strRecordId = objGUI.getAttribute("strRecordId");    
    // this calls doSpyOver in Event
    this.jsxsupermix(objEvent, objGUI, {objEVENT:objEvent, intINDEX:intIndex, strRECORDID:strRecordId});
  };

  Series_prototype._ebMouseUp = function(objEvent, objGUI) {
    var intIndex = objGUI.getAttribute("recordIndex");
    var strRecordId = objGUI.getAttribute("strRecordId");
    var strMenu;
    if (objEvent.rightButton() && (strMenu = this.getMenu()) != null) {
      var objMenu = this.getServer().getJSXByName(strMenu);
      if (objMenu != null) {
        var objContext = {objEVENT:objEvent, objMENU:objMenu, intINDEX:intIndex, strRECORDID:strRecordId};
        var vntResult = this.doEvent(Interactive.MENU, objContext);
        if (vntResult !== false) {
          if (vntResult instanceof Object && vntResult.objMENU instanceof jsx3.gui.Menu)
            objMenu = vntResult.objMENU;
          objMenu.showContextMenu(objEvent, this, intIndex);
        }
      }
    }
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  Series.getVersion = function() {
    return chart.VERSION;
  };

/* @JSC :: end */

});
