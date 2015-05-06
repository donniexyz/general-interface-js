/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.ChartComponent");

/**
 * A base class for all types of axis. Provides all the common properties as well as all rendering
 * logic. Rendering relies on template methods implemented in concrete subclasses.
 * <p/>
 * An axis renders in the following location based on its horizontal and primary properties:
 * <pre>
 *   horizontal x primary   -> bottom
 *   vertical x primary     -> left
 *   horizontal x secondary -> top
 *   vertical x secondary   -> right</pre>
 */
jsx3.Class.defineClass("jsx3.chart.Axis", jsx3.chart.ChartComponent, null, function(Axis, Axis_prototype) {
  
  var vector = jsx3.vector;
  var Stroke = vector.Stroke;
  var chart = jsx3.chart;
  
  /**
   * {String}
   * @final @jsxobf-final
   */
  Axis.TICK_INSIDE = "inside";

  /**
   * {String}
   * @final @jsxobf-final
   */
  Axis.TICK_OUTSIDE = "outside";

  /**
   * {String}
   * @final @jsxobf-final
   */
  Axis.TICK_CROSS = "cross";

  /**
   * {String}
   * @final @jsxobf-final
   */
  Axis.TICK_NONE = "none";


  /**
   * {String}
   * @final @jsxobf-final
   */
  Axis.LABEL_HIGH = "high";

  /**
   * {String}
   * @final @jsxobf-final
   */
  Axis.LABEL_LOW = "low";

  /**
   * {String}
   * @final @jsxobf-final
   */
  Axis.LABEL_AXIS = "axis";

  /**
   * Values for the 'tickPlacement' and 'minorTickPlacement' fields that result in tick display.
   * @private
   * @jsxobf-clobber
   */
  Axis._TICK_ALIGNMENTS = {inside: 1, outside: 1, cross: 1};

  /**
   * Valid values for the 'labelPlacement' field.
   * @private
   * @jsxobf-clobber
   */
  Axis._LABEL_PLACEMENTS = {axis: 1, high: 1, low: 1};

  // label placement enumeration
  /** @private @jsxobf-clobber @jsxobf-final */
  Axis._LP_TOP = 1;
  /** @private @jsxobf-clobber @jsxobf-final */
  Axis._LP_RIGHT = 2;
  /** @private @jsxobf-clobber @jsxobf-final */
  Axis._LP_BOTTOM = 4;
  /** @private @jsxobf-clobber @jsxobf-final */
  Axis._LP_LEFT = 3;
  /** @private @jsxobf-clobber @jsxobf-final */
  Axis._LP_LEFTOFAXIS = 7;
  /** @private @jsxobf-clobber @jsxobf-final */
  Axis._LP_RIGHTOFAXIS = 8;
  /** @private @jsxobf-clobber @jsxobf-final */
  Axis._LP_ABOVEAXIS = 6;
  /** @private @jsxobf-clobber @jsxobf-final */
  Axis._LP_BELOWAXIS = 5;

  // figured this out with boolean decision matrix
  /** @private @jsxobf-clobber */
  Axis._PLACEMENT_MATRIX = [
    Axis._LP_LEFT, Axis._LP_BOTTOM, Axis._LP_RIGHT, Axis._LP_TOP,
    Axis._LP_RIGHT, Axis._LP_TOP, Axis._LP_LEFT, Axis._LP_BOTTOM,
    Axis._LP_RIGHTOFAXIS, Axis._LP_ABOVEAXIS, Axis._LP_LEFTOFAXIS, Axis._LP_BELOWAXIS
  ];
  
  /** @private @jsxobf-clobber @jsxobf-final */
  Axis._LABEL_LINEHEIGHT = 10;
  /** @private @jsxobf-clobber @jsxobf-final */
  Axis._DEFAULT_VERTICAL_WIDTH = 50;
  /** @private @jsxobf-clobber @jsxobf-final */
  Axis._DEFAULT_HORIZONTAL_WIDTH = 12;

  /**
   * formats labels as a percent, ie "50%"
   * @param v {Number}
   * @return {String}
   */
  Axis.percent = function(v) {
    return v + "%";
  };

  /**
   * formats labels in scientific notation, ie "5e2"
   * @param v {Number}
   * @param signif {int}
   * @return {String}
   */
  Axis.scientific = function(v, signif) {
    if (v == 0) return "0";
    if (signif == null) signif = 2;
    var neg = v < 0;
    v = Math.abs(v);
    var log = Math.floor(Math.log(v) / Math.LN10);
    var c = log != 0 ? v/Math.pow(10,log) : v;
    c = c.toString();
    var point = c.indexOf(".");
    if (point >= 0)
      if (c.length - point - 1 > signif) c = c.substring(0, point + 1 + signif);
    return (neg ? "-" : "") + c + "e" + log;
  };

  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param horizontal {boolean} whether this axis is horizontal (x), otherwise it's vertical (y)
   * @param primary {boolean} whether this axis is primary, otherwise it's secondary
   */
  Axis_prototype.init = function(name, horizontal, primary) {
    //call constructor for super class
    this.jsxsuper(name);

    this.horizontal = horizontal != null ? jsx3.Boolean.valueOf(horizontal) : null;
    this.primary = primary != null ? jsx3.Boolean.valueOf(primary) : null;

    this.length = 100;
    this.showAxis = jsx3.Boolean.TRUE;
    this.axisStroke = "#000000";
    this.showLabels = jsx3.Boolean.TRUE;
    this.labelGap = 3;
    this.labelRotation = 0;
    this.labelPlacement = Axis.LABEL_AXIS;
    this.tickLength = 3;
    this.tickPlacement = Axis.TICK_OUTSIDE;
    this.tickStroke = "#000000";
    this.minorTickDivisions = 4;
    this.minorTickLength = 3;
    this.minorTickPlacement = Axis.TICK_NONE;
    this.minorTickStroke = null;
    this.labelFunction = null;
    
    this.labelClass = null;
    this.labelStyle = null;
    this.labelColor = null;
    
    this.displayWidth = null;
  };
  
  /**
   * determine the value that should be displayed at a major tick, either the number value or the string category name
   * @param index {int} the index of the tick in the array returned by getMajorTicks()
   * @return {Number|String}
   * @package
   */
  Axis_prototype.getValueForTick = jsx3.Method.newAbstract('index');

  /**
   * Returns the coordinates of the major ticks.
   * @return {Array} an array of the coordinates (in order, between 0 and this.length) of the major ticks of this axis
   * @package
   */
  Axis_prototype.getMajorTicks = jsx3.Method.newAbstract();

  /**
   * whether or not the value of 0 is displayed between (non-inclusive) the minimum and maximum value of this axis
   * @return {boolean}
   * @package
   */
  Axis_prototype.isZeroInRange = jsx3.Method.newAbstract();

  /**
   * rendering an axis is 2-pass, this is the first pass called before updateView()
   * @package
   */
  Axis_prototype.prePaintUpdate = jsx3.Method.newAbstract();

  /**
   * Returns the horizontal field, whether this is an x axis, otherwise it is a y axis.
   * @return {boolean} horizontal
   */
  Axis_prototype.getHorizontal = function() {
    return this.horizontal;
  };

  /**
   * Sets the horizontal field.
   * @param horizontal {boolean} the new value for horizontal
   */
  Axis_prototype.setHorizontal = function( horizontal ) {
    this.horizontal = horizontal;
  };

  /**
   * Returns the primary field, whether this is a primary axis, otherwise it is a secondary axis.
   * @return {boolean} primary
   * @package
   */
  Axis_prototype.getPrimary = function() {
    return this.primary;
  };

  /**
   * Sets the primary field.
   * @param primary {boolean} the new value for primary
   * @package
   */
  Axis_prototype.setPrimary = function( primary ) {
    this.primary = primary;
  };

  /**
   * Returns the length field, the length of the axis in the coordinates space of this component; note that the axis should not rely on its actual dimensions for this information.
   * @return {int} length
   * @package
   */
  Axis_prototype.getLength = function() {
    return this.length;
  };

  /**
   * Sets the length field, an axis must know its length before it can render properly.
   * @param length {int} the new value for length
   * @package
   */
  Axis_prototype.setLength = function( length ) {
    this.length = length;
  };

  /**
   * Returns the showAxis field, whether to show the line along the axis.
   * @return {boolean} showAxis
   */
  Axis_prototype.getShowAxis = function() {
    return this.showAxis;
  };

  /**
   * Sets the showAxis field.
   * @param showAxis {boolean} the new value for showAxis
   */
  Axis_prototype.setShowAxis = function( showAxis ) {
    this.showAxis = showAxis;
  };

  /**
   * Returns the labelFunction field.
   * @return {Function} labelFunction
   */
  Axis_prototype.getLabelFunction = function() {
    return chart.getFunctionField(this, "labelFunction");
  };

  /**
   * Sets the labelFunction field, allows for formatting and transformation of a major tick label.
   * The function will be applied to this object when called. 
   * Note that passing a function reference to this method will prevent the value from being persisted if this
   * object is serialized.
   * @param labelFunction {String | Function} the new value for labelFunction, a function with the signature
   *     <code>function(value : Number|String, index : int) : String</code>.
   */
  Axis_prototype.setLabelFunction = function( labelFunction ) {
    chart.setReferenceField(this, "labelFunction", labelFunction);
  };

  /**
   * Returns the axisStroke field, string representation of the VectorStroke used to draw the line of the axis.
   * @return {String} axisStroke
   */
  Axis_prototype.getAxisStroke = function() {
    return this.axisStroke;
  };

  /**
   * Sets the axisStroke field.
   * @param axisStroke {String} the new value for axisStroke
   */
  Axis_prototype.setAxisStroke = function( axisStroke ) {
    this.axisStroke = axisStroke;
  };

  /**
   * Returns the showLabels field, whether to show major tick labels.
   * @return {boolean} showLabels
   */
  Axis_prototype.getShowLabels = function() {
    return this.showLabels;
  };

  /**
   * Sets the showLabels field.
   * @param showLabels {boolean} the new value for showLabels
   */
  Axis_prototype.setShowLabels = function( showLabels ) {
    this.showLabels = showLabels;
  };

  /**
   * Returns the labelGap field, the pixel gap between the tick lines and the labels.
   * @return {int} labelGap
   */
  Axis_prototype.getLabelGap = function() {
    return this.labelGap;
  };

  /**
   * Sets the labelGap field.
   * @param labelGap {int} the new value for labelGap
   */
  Axis_prototype.setLabelGap = function( labelGap ) {
    this.labelGap = labelGap;
  };

  /**
   * Returns the labelRotation field, the rotation angle of each label.
   * @return {int} labelRotation
   * @package  Not yet implemented.
   */
  Axis_prototype.getLabelRotation = function() {
    return this.labelRotation;
  };

  /**
   * Sets the labelRotation field.
   * @param labelRotation {int} the new value for labelRotation
   * @package  Not yet implemented.
   */
  Axis_prototype.setLabelRotation = function( labelRotation ) {
    this.labelRotation = labelRotation;
  };

  /**
   * Returns the labelPlacement field, where to place the labels relative to the axis and chart.
   * @return {String} labelPlacement, one of {'axis','high','low'}
   * @package  Not yet implemented.
   */
  Axis_prototype.getLabelPlacement = function() {
    return this.labelPlacement;
  };

  /**
   * Sets the labelPlacement field, checks for invalid values.
   * @param labelPlacement {String} the new value for labelPlacement, one of {'axis','high','low'}
   */
  Axis_prototype.setLabelPlacement = function( labelPlacement ) {
    if (Axis._LABEL_PLACEMENTS[labelPlacement]) {
      this.labelPlacement = labelPlacement;
    } else {
      throw new jsx3.IllegalArgumentException("labelPlacement", labelPlacement);
    }
  };

  /**
   * Returns the tickLength field, the length in pixels of the major tick (if tickPlacement is "cross" the length will actually be twice this.
   * @return {int} tickLength
   */
  Axis_prototype.getTickLength = function() {
    return this.tickLength;
  };

  /**
   * Sets the tickLength field.
   * @param tickLength {int} the new value for tickLength
   */
  Axis_prototype.setTickLength = function( tickLength ) {
    this.tickLength = tickLength;
  };

  /**
   * Returns the tickPlacement field, where to place the major ticks.
   * @return {String} tickPlacement, one of {'none','inside','outside','cross'}
   */
  Axis_prototype.getTickPlacement = function() {
    return this.tickPlacement;
  };

  /**
   * Sets the tickPlacement field.
   * @param tickPlacement {String} the new value for tickPlacement, one of {'none','inside','outside','cross'}
   */
  Axis_prototype.setTickPlacement = function( tickPlacement ) {
    if (Axis._TICK_ALIGNMENTS[tickPlacement] || tickPlacement == Axis.TICK_NONE) {
      this.tickPlacement = tickPlacement;
    } else {
      throw new jsx3.IllegalArgumentException("tickPlacement", tickPlacement);
    }
  };

  /**
   * Returns the tickStroke field, string representation of VectorStroke used to draw major ticks.
   * @return {String} tickStroke
   */
  Axis_prototype.getTickStroke = function() {
    return this.tickStroke;
  };

  /**
   * Sets the tickStroke field.
   * @param tickStroke {String} the new value for tickStroke
   */
  Axis_prototype.setTickStroke = function( tickStroke ) {
    this.tickStroke = tickStroke;
  };

  /**
   * Returns the minorTickDivisions field, number of minor tick divisions between major ticks; the number of minor ticks drawn will be this number minus 1.
   * @return {int} minorTickDivisions
   */
  Axis_prototype.getMinorTickDivisions = function() {
    return this.minorTickDivisions;
  };

  /**
   * Sets the minorTickDivisions field.
   * @param minorTickDivisions {int} the new value for minorTickDivisions
   */
  Axis_prototype.setMinorTickDivisions = function( minorTickDivisions ) {
    this.minorTickDivisions = minorTickDivisions;
  };

  /**
   * Returns the minorTickLength field, the length in pixels of the minor tick (if tickPlacement is "cross" the length will actually be twice this.
   * @return {int} minorTickLength
   */
  Axis_prototype.getMinorTickLength = function() {
    return this.minorTickLength;
  };

  /**
   * Sets the minorTickLength field.
   * @param minorTickLength {int} the new value for minorTickLength
   */
  Axis_prototype.setMinorTickLength = function( minorTickLength ) {
    this.minorTickLength = minorTickLength;
  };

  /**
   * Returns the minorTickPlacement field, where to place the minor ticks.
   * @return {String} minorTickPlacement, one of {'none','inside','outside','cross'}
   */
  Axis_prototype.getMinorTickPlacement = function() {
    return this.minorTickPlacement;
  };

  /**
   * Sets the minorTickPlacement field.
   * @param minorTickPlacement {String} the new value for minorTickPlacement, one of {'none','inside','outside','cross'}
   */
  Axis_prototype.setMinorTickPlacement = function( minorTickPlacement ) {
    if (Axis._TICK_ALIGNMENTS[minorTickPlacement] || minorTickPlacement == Axis.TICK_NONE) {
      this.minorTickPlacement = minorTickPlacement;
    } else {
      throw new jsx3.IllegalArgumentException("minorTickPlacement", minorTickPlacement);
    }
  };

  /**
   * Returns the minorTickStroke field, string representation of VectorStroke used to draw minor ticks.
   * @return {String} minorTickStroke
   */
  Axis_prototype.getMinorTickStroke = function() {
    return this.minorTickStroke;
  };

  /**
   * Sets the minorTickStroke field.
   * @param minorTickStroke {String} the new value for minorTickStroke
   */
  Axis_prototype.setMinorTickStroke = function( minorTickStroke ) {
    this.minorTickStroke = minorTickStroke;
  };

  /**
   * Returns the labelClass field, the CSS class used to render major tick labels.
   * @return {String} labelClass
   */
  Axis_prototype.getLabelClass = function() {
    return this.labelClass;
  };

  /**
   * Sets the labelClass field.
   * @param labelClass {String} the new value for labelClass
   */
  Axis_prototype.setLabelClass = function( labelClass ) {
    this.labelClass = labelClass;
  };

  /**
   * Returns the labelStyle field, the CSS style attribute used to render major tick labels.
   * @return {String} labelStyle
   */
  Axis_prototype.getLabelStyle = function() {
    return this.labelStyle;
  };

  /**
   * Sets the labelStyle field.
   * @param labelStyle {String} the new value for labelStyle
   */
  Axis_prototype.setLabelStyle = function( labelStyle ) {
    this.labelStyle = labelStyle;
  };

  /**
   * Returns the labelColor field, the RGB color value of the label font; note that this is the only way to set the color of the text, using a CSS style attribute will have no effect.
   * @return {string/number} labelColor
   */
  Axis_prototype.getLabelColor = function() {
    return this.labelColor;
  };

  /**
   * Sets the labelColor field.
   * @param labelColor {string/number} the new value for labelColor
   */
  Axis_prototype.setLabelColor = function( labelColor ) {
    this.labelColor = labelColor;
  };

  /**
   * Returns the display width, the maximum amount of space perpendicular to the axis and outside of the data area that the ticks and labels may occupy (doesn't include area given to axis title).
   * @return {int} displayWidth
   */
  Axis_prototype.getDisplayWidth = function() {
    if (this.displayWidth != null) {
      return this.displayWidth;
    } else {
      return this.horizontal ? Axis._DEFAULT_HORIZONTAL_WIDTH : Axis._DEFAULT_VERTICAL_WIDTH;
    }
  };

  /**
   * Sets the displayWidth field.
   * @param displayWidth {int} the new value for displayWidth
   */
  Axis_prototype.setDisplayWidth = function( displayWidth ) {
    this.displayWidth = displayWidth;
  };

  /**
   * Renders all vector elements and appends them to the render root.
   * @package
   */
  Axis_prototype.updateView = function() {
    this.jsxsuper();
    var root = this.getCanvas();

    // this is a monster sized method
    
    var w = this.getWidth();
    var h = this.getHeight();
    
    var oAxis = this.getOpposingAxis();
    if (oAxis == null) return; // can't render without it!
    
    // coordinate along the length of this axis where the opposing axis crosses
    var axisAt = this._getAxisCrossPoint(oAxis);
    
    // model event hooks:
    this.setEventProperties();
            
    // draw axis
    if (this.showAxis) {
      var axisLineView = new vector.Line(0, 0, 0, 0, 0, 0);
      root.appendChild(axisLineView);
      
      var stroke = Stroke.valueOf(this.axisStroke);
      if (stroke == null) stroke = new Stroke();
      axisLineView.setStroke(stroke);
      
      if (this.horizontal)
        axisLineView.setPoints(0, axisAt, this.length, axisAt);
      else
        axisLineView.setPoints(axisAt, 0, axisAt, this.length);
    }
    
    // draw major ticks
    var ticks = this.getMajorTicks();
    if (Axis._TICK_ALIGNMENTS[this.tickPlacement] && this.tickLength > 0) {
      // use a LineGroup to reduce VML tag and object count
      var majorTicksView = new vector.LineGroup(0, 0, w, h);
      root.appendChild(majorTicksView);
      
      var stroke = Stroke.valueOf(this.tickStroke);
      majorTicksView.setStroke(stroke);
      
      var metrics = this._getTickMetrics(this.tickPlacement, this.tickLength);
      var length = metrics[0];
      var start = axisAt + metrics[1];
      
      this._attachTicks(majorTicksView, ticks, start, length);
    }
    
    // draw minor ticks
    if (Axis._TICK_ALIGNMENTS[this.minorTickPlacement] && this.minorTickLength > 0) {
      // use a LineGroup to reduce VML tag and object count
      var minorTicksView = new vector.LineGroup(0, 0, w, h);
      root.appendChild(minorTicksView);

      var stroke = Stroke.valueOf(this.minorTickStroke);
      minorTicksView.setStroke(stroke);
      
      var metrics = this._getTickMetrics(this.minorTickPlacement, this.minorTickLength);
      var length = metrics[0];
      var start = axisAt + metrics[1];
      
      var last = 0;
      for (var i = 0; i < ticks.length; i++) {
        var minorTicks = this._getMinorTicks(ticks, i);
        this._attachTicks(minorTicksView, minorTicks, start, length);
        last = ticks[i];
      }
      
      // display minor ticks between the last major tick and the end of the axis
      // only relevant if the min/max/interval are set manually since otherwise the axis is always
      // a multiple of the interval
      if (last < this.length) {
        var minorTicks = this._getMinorTicks(ticks, ticks.length);
        this._attachTicks(minorTicksView, minorTicks, start, length);
      }
    }
    
    var labelMetrics = this._getLabelMetrics(axisAt);
    
    // draw title
    var title = this.getAxisTitle();
    if (title != null && title.getDisplay() != jsx3.gui.Block.DISPLAYNONE) {
      var titleEdge = labelMetrics[5];
      var transform = (this.horizontal && this.primary) || (!this.horizontal && !this.primary) ?
        0 : -1;

      if (this.horizontal) {
        var t = titleEdge + transform * title.getPreferredHeight();
        title.setDimensions(0, t, this.length, title.getPreferredHeight());
      } else {
        var l = titleEdge + transform * title.getPreferredWidth();
        title.setDimensions(l, 0, title.getPreferredWidth(), this.length);
      }
      
      title.updateView();
      root.appendChild(title.getCanvas());
    }

    // draw labels
    if (this.showLabels) {
      var labelTicks = this._getLabelTicks();
      var labelsView = new vector.Group(0, 0, w, h);
      root.appendChild(labelsView);
      
      var placement = labelMetrics[0];
      var edge = labelMetrics[1];
      var transform = labelMetrics[2];
      
      /* @jsxobf-clobber */
      this._jsxlabelfill = null;
      
      for (var i = 0; i < labelTicks.length; i++) {
        var midpoint = labelTicks[i]; // the parallel point of the center of the label
        
        var width = null; // the horizontal width of the label
        if (this.horizontal) {
          var min = i > 0 ? (labelTicks[i-1] + labelTicks[i])/2 : null;
          var max = i < labelTicks.length-1 ? (labelTicks[i+1] + labelTicks[i])/2 : null;
          if (max == null && min != null) max = 2 * labelTicks[i] - min;
          else if (min == null && max != null) min = 2 * labelTicks[i] - max;
          if (max == null) {
            min = labelTicks[i] - 50;
            max = labelTicks[i] + 50;
          }
          width = Math.round(max - min);
        } else {
          width = this.getDisplayWidth() - this._getTickWidth() - this.labelGap;
        }
        
        if (this.horizontal) {
          var x1 = Math.round(midpoint-(width/2));
          var y = edge + transform * Math.round(Axis._LABEL_LINEHEIGHT/2);
          this._attachLabel(labelsView, x1, y, x1+width, y, this._getLabelForTick(i));
        } else {
          var x1 = (transform == 1) ? edge : edge - width;
          this._attachLabel(labelsView, x1, midpoint, x1+width, midpoint, this._getLabelForTick(i));
        }
      }
    }
  };
  
  /**
   * paint helper to attach a major tick label
   * @param group {jsx3.vector.Group} parent group
   * @param x1 {int} x coordinate of the start of the line forming the text path
   * @param y1 {int} y coordinate of the start of the line forming the text path
   * @param x2 {int} x coordinate of the end of the line forming the text path
   * @param y2 {int} y coordinate of the end of the line forming the text path
   * @param label {String} the text of the label
   * @private
   * @jsxobf-clobber
   */
  Axis_prototype._attachLabel = function(group, x1, y1, x2, y2, label) {
    if (!(label && label.toString().match(/\S/))) return;
    
    var text = new vector.TextLine(x1, y1, x2, y2, label);
    text.setClassName(this.labelClass);
    text.setExtraStyles(this.labelStyle);
    text.setColor(this.labelColor);
    
    // TODO: figure out math to support label rotation
//    var angle = this.getLabelRotation();
//    if (angle)
//      text.setRotation(angle);
    
    group.appendChild(text);
  };

  /**
   * determine the label that should be displayed at a major tick, simply applies the value of getValueForTick(index) to the label function, if any
   * @param index {int} the index of the tick in the array returned by getMajorTicks()
   * @return {String}
   * @private
   * @jsxobf-clobber
   */
  Axis_prototype._getLabelForTick = function(index) {
    var value = this.getValueForTick(index);
    var funct = this.getLabelFunction();
    return funct != null ? funct.apply(this, [value, index]) : (value != null ? value.toString() : "");
  };

  /**
   * the total distance that the major and minor ticks extrude from the axis
   * @return (int)
   * @private
   * @jsxobf-clobber
   */
  Axis_prototype._getTickWidth = function() {
    var major = (this.tickPlacement == Axis.TICK_OUTSIDE || this.tickPlacement == Axis.TICK_CROSS)
        ? this.tickLength : 0;
    var minor = (this.minorTickPlacement == Axis.TICK_OUTSIDE || this.minorTickPlacement == Axis.TICK_CROSS)
        ? this.minorTickLength : 0;
    return Math.max(major, minor);
  };
  
  /**
   * Returns the coordinate along the length of this axis where the opposing axis crosses.
   * @param oAxis {jsx3.chart.Axis} the opposing axis
   * @return {int}
   * @private
   * @jsxobf-clobber
   */
  Axis_prototype._getAxisCrossPoint = function(oAxis) {
    if (oAxis == null) {
      oAxis = this.getOpposingAxis();
      if (oAxis == null) return 0;
    }
    
    if (oAxis.isZeroInRange())
      return oAxis.getCoordinateFor(0);
    else if (this.primary)
      return this.horizontal ? oAxis.getLength() : 0;
    else
      return this.horizontal ? 0 : oAxis.getLength();
  };
  
  /**
   * paint helper to determine metrics related to drawing ticks
   * @param placement {String} one of {'inside','outside','cross'}
   * @param length {int} the length of the tick
   * @return {Array} [length, offset], length is the total length of the tick to draw, offset is the offset from the line of the axis where the tick should begin
   * @private
   * @jsxobf-clobber
   */
  Axis_prototype._getTickMetrics = function(placement, length) {
    var offset = 0;
    if (placement == Axis.TICK_CROSS) {
      offset = -1 * length;
      length *= 2;
    } else {
      // offset may be -length or 0 depending on which quadrant the axis is rendered in
      // figured this out with boolean decision matrix
      var condMet = 0;
      if (this.horizontal) condMet++;
      if (this.primary) condMet++;
      if (placement == Axis.TICK_INSIDE) condMet++;
      
      if (condMet % 2 == 1)
        offset = -1 * length;
    }
    return [length,offset];
  };
  
  /**
   * paint helper to determine metrics related to drawing labels
   * @param axisAt {int} value of this._getAxisCrossPoint()
   * @return {Array} :
   *      placement {int} one of jsx3.chart.Axis._LP_... depending on where the labels should be placed
   *      edge {int} inside edge of the label box, as pixels away from the line of the axis
   *      transform {int} 1 if labels are placed to the right or below something (increasing coordinate values), -1 otherwise
   *      outsideTickWidth {int} the width of the ticks extending on the outside of the axis
   *      insideTickWidth {int} the width of the ticks extending on the inside of the axis
   *      titleEdge {int} inside edge of the title box, as pixels away from the line of the axis
   * @private
   * @jsxobf-clobber
   */
  Axis_prototype._getLabelMetrics = function(axisAt) {
    var oAxis = this.getOpposingAxis();
    if (axisAt == null) axisAt = this._getAxisCrossPoint(oAxis);
    
    // crazy boolean decision matrix logic to avoid a gigantic if-else statement
    // determine row number in my decision matrix
    var placementIndex = 0;
    if (this.horizontal) placementIndex |= 1;
    if (this.primary) placementIndex |= 2;
    if (this.labelPlacement == Axis.LABEL_LOW) placementIndex |= 4;
    else if (this.labelPlacement == Axis.LABEL_AXIS) placementIndex |= 8;
    // lookup placement value by row number
    var placement = Axis._PLACEMENT_MATRIX[placementIndex];
    
    // determine inside and outside tick lengths
    var outsideTickWidth = 0;
    var insideTickWidth = 0;
    if (this.tickPlacement == Axis.TICK_OUTSIDE || this.tickPlacement == Axis.TICK_CROSS)
      outsideTickWidth = this.tickLength;
    if (this.tickPlacement == Axis.TICK_INSIDE || this.tickPlacement == Axis.TICK_CROSS)
      insideTickWidth = this.tickLength;
    if (this.minorTickPlacement == Axis.TICK_OUTSIDE || this.minorTickPlacement == Axis.TICK_CROSS)
      outsideTickWidth = Math.max(outsideTickWidth, this.minorTickLength);
    if (this.minorTickPlacement == Axis.TICK_INSIDE || this.minorTickPlacement == Axis.TICK_CROSS)
      insideTickWidth = Math.max(insideTickWidth, this.minorTickLength);

    var edge = null, transform = null, titleEdge = null;
    
    // determine edge and transform according to placement
    switch (placement) {
      case Axis._LP_TOP :
      case Axis._LP_LEFT :
        transform = -1;
        edge = 0 - this.labelGap;
        edge -= Math.max(0, outsideTickWidth - axisAt);
        break;
      case Axis._LP_RIGHT :
      case Axis._LP_BOTTOM :
        transform = 1;
        edge = oAxis.getLength() + this.labelGap;
        edge += Math.max(0, outsideTickWidth + axisAt - oAxis.getLength());
        break;
      case Axis._LP_LEFTOFAXIS :
      case Axis._LP_ABOVEAXIS :
        transform = -1;
        edge = axisAt - this.labelGap - outsideTickWidth;
        break;
      case Axis._LP_RIGHTOFAXIS :
      case Axis._LP_BELOWAXIS :
        transform = 1;
        edge = axisAt + this.labelGap + outsideTickWidth;
        break;
      default :
        chart.LOG.error("bad placement value: " + placement);
    }
    
    // do titleEdge, unlike label placement, titles are always displayed in the quadrant according
    // to the axis' horizontal and primary properties
    if (this.showLabels) {
      if (this.horizontal)
        titleEdge = edge + transform * Axis._LABEL_LINEHEIGHT;
      else
        titleEdge = edge + transform * this.getDisplayWidth();
    } else {
      titleEdge = edge;
    }
    
    if ((this.horizontal && this.primary) || (!this.horizontal && !this.primary)) {
      titleEdge = Math.max(titleEdge, oAxis.getLength());
    } else {
      titleEdge = Math.min(titleEdge, 0);
    }
    
    return [placement, edge, transform, outsideTickWidth, insideTickWidth, titleEdge];
  };
  
  /**
   * determine the high and low gutter widths, this is the amount of space that the axis occupies outside of the data area
   * @return {Array} :
   *      low {int} the gutter width in the quadrant of the axis
   *      high {int} the gutter width in the quadrant opposite the quadrant of the axis
   * @private
   */
  Axis_prototype._getGutterWidths = function() {
    var low = 0, high = 0;
    var oAxis = this.getOpposingAxis();
    if (oAxis == null) return [0,0];
    var axisAt = this._getAxisCrossPoint(oAxis);
    var metrics = this._getLabelMetrics(axisAt);
    var title = this.getAxisTitle();
    
    var edge = metrics[1];
    var transform = metrics[2];
    var outsideTickWidth = metrics[3];
    var insideTickWidth = metrics[4];
    
    // add the label line height to the label edge
    if (this.showLabels) {
      if (this.horizontal)
        edge += (transform * Axis._LABEL_LINEHEIGHT);
      else
        edge += (transform * this.getDisplayWidth());
    }
    
    // only count the outside edge of the label if it falls outside of the bounds of the data area
    if (edge < 0) {
      low = 0 - edge;
    } else if (edge > oAxis.getLength()) {
      high = edge - oAxis.getLength();
    }

    // determine whether the ticks extrude from the data area
    if (insideTickWidth > this.length - axisAt) 
      high = Math.max(high, insideTickWidth + this.length - axisAt);
    if (outsideTickWidth > 0 - axisAt) 
      low = Math.max(low, outsideTickWidth - axisAt);
    
    // add on the space needed for the title, if any
    if (title != null && title.getDisplay() != jsx3.gui.Block.DISPLAYNONE) {
      if (this.horizontal)
        high += title.getPreferredHeight();
      else
        low += title.getPreferredWidth();
    }

    return [low, high];
  };

  /**
   * paint helper, draws some ticks
   * @param group {jsx3.vector.Group} parent
   * @param ticks {Array} coordinates of the ticks
   * @param start {int} offset of the start of the tick from the axis
   * @param length {int} length of the ticks
   * @private
   * @jsxobf-clobber
   */
  Axis_prototype._attachTicks = function(group, ticks, start, length) {
    if (this.horizontal) {
      for (var i = 0; i < ticks.length; i++)
        group.addRelativeLine(ticks[i], start, 0, length);
    } else {
      for (var i = 0; i < ticks.length; i++)
        group.addRelativeLine(start, ticks[i], length, 0);      
    }
  };
  
  /**
   * Returns coordinates of the midpoints of major tick labels, defaults to exactly where the major tick lines are, but can be overridden in subclasses (CategoryAxis).
   * @return {Array}
   * @private
   */
  Axis_prototype._getLabelTicks = function() {
    return this.getMajorTicks();
  };

  /**
   * Returns the coordinates of minor tick lines for one span between major ticks.
   * @param majorTicks {Array} result of this.getMajorTicks()
   * @param index {int} the index of the major tick that is the end of the segment for which to determine minor ticks, between 0 and majorTicks.length (inclusive!)
   * @return {Array}
   * @private
   */
  Axis_prototype._getMinorTicks = function(majorTicks, index) {
    var ticks = [];
    if (index == 0) {
      // TODO: minor tick lines before the first major tick
      return [];
    } else if (index == majorTicks.length) {
      // TODO: minor tick lines after the last major tick
      return [];
    } else {
      var start = majorTicks[index-1];
      var end = majorTicks[index];
      for (var i = 1; i < this.minorTickDivisions; i++) {
        ticks.push(Math.round(start + (i/this.minorTickDivisions) * (end-start)));
      }
    }
    return ticks;
  };

  /**
   * Returns the optional jsx3.chart.ChartLabel child.
   * @return {jsx3.chart.ChartLabel}
   */
  Axis_prototype.getAxisTitle = function() {
    return chart.ChartLabel ? this.getFirstChildOfType(chart.ChartLabel) : null;
  };

  /**
   * Returns the opposing axis.
   * @return {jsx3.chart.Axis}
   */
  Axis_prototype.getOpposingAxis = function() {
    var myChart = this.getChart();
    if (myChart == null) return null;
    if (this.horizontal) {
      if (this.primary) {
        return myChart.getPrimaryYAxis();
      } else {
        return myChart.getSecondaryYAxis();
      }
    } else {
      if (this.primary) {
        return myChart.getPrimaryXAxis();
      } else {
        return myChart.getSecondaryXAxis();
      }
    }
  };
  
  /**
   * No children allowed except one title.
   * @package
   */
  Axis_prototype.onSetChild = function(child) {
    if ((chart.ChartLabel && child instanceof chart.ChartLabel) && this.getAxisTitle() == null) {
      child.setLabelRotation(this.horizontal ? chart.ChartLabel.ROTATION_NORMAL : chart.ChartLabel.ROTATION_CCW);
      return true;
    }
    return false;
  };

  Axis_prototype.onSetParent = function(objParent) {
    return chart.Chart && objParent instanceof chart.Chart;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  Axis.getVersion = function() {
    return chart.VERSION;
  };

/* @JSC :: end */

});
