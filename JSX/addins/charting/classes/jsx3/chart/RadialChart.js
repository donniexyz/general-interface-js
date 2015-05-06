/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.Chart");

/**
 * Base class for radial charts (pie chart is only example so far).
 */
jsx3.Class.defineClass("jsx3.chart.RadialChart", jsx3.chart.Chart, null, function(RadialChart, RadialChart_prototype) {

  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param left {int} left position (in pixels) of the chart relative to its parent container
   * @param top {int} top position (in pixels) of the chart relative to its parent container
   * @param width {int} width (in pixels) of the chart
   * @param height {int} height (in pixels) of the chart
   */
  RadialChart_prototype.init = function(name, left, top, width, height) {
    //call constructor for super class
    this.jsxsuper(name, left, top, width, height);
  };

  RadialChart_prototype.createVector = function() {
    this.jsxsuper();
    var root = this.getDataCanvas();
    
    var w = root.getWidth();
    var h = root.getHeight();
    var padding = root.getPaddingDimensions();
    
    var dataDim = [padding[3], padding[0], w-(padding[3]+padding[1]), h-(padding[0]+padding[2])];
    
    var series = this.getDisplayedSeries();
    for (var i = 0; i < series.length; i++) {
      series[i].setDimensions(dataDim);
    }
  };

/* @JSC :: begin DEP */

  /**
   * convert degrees (0 at top, clockwise) to radians (0 at right, counterclockwise)
   * @param degrees {Number} a degree value; 0 points upwards, increasing values go clockwise
   * @return {Number} a radian value, between 0 and 2*pi; 0 points rightwards, increasing values go counterclockwise
   * @deprecated Use <code>jsx3.vector.degreesToRadians()</code> instead.
   */
  RadialChart.degreesToRadians = function(degrees) {
    return jsx3.util.numMod((2 * Math.PI / 360 * (-1 * degrees + 90)), (2 * Math.PI));
  };

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  RadialChart.getVersion = function() {
    return jsx3.chart.VERSION;
  };

  /* @JSC :: end */

});
