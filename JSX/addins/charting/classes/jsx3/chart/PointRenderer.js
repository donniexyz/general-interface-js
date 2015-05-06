/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Objects that implement this interface may be used in Line/Area/Point/Bubble charts to render the points that appear
 * at each datapoint.
 * <p/>
 * Additionally, this interface contains several static fields that are implementors of this interface.
 */
jsx3.Class.defineInterface("jsx3.chart.PointRenderer", null, function(PointRenderer, PointRenderer_prototype) {
  
  var vector = jsx3.vector;
  
  /**
   * Renders the point in the bounds specified by {x1,y1} {x2,y2}.
   * @param x1 {int} 
   * @param y1 {int} 
   * @param x2 {int} 
   * @param y2 {int} 
   * @param fill {jsx3.vector.Fill} 
   * @param stroke {jsx3.vector.Stroke} 
   * @return {jsx3.vector.Tag}
   */
  PointRenderer_prototype.render = jsx3.Method.newAbstract('x1', 'y1', 'x2', 'y2', 'fill', 'stroke');
  
  /**
   * Converts the area of the point to display to the radius of the box that it should fill. Required
   *    if the point renderer will be used in a plot chart.
   * @param area {Number} 
   * @return {Number}
   */
  PointRenderer_prototype.areaToRadius = jsx3.Method.newAbstract('area');

  
  /**
   * {jsx3.chart.PointRenderer} Creates a circular point.
   */
  PointRenderer.CIRCLE = PointRenderer.jsxclass.newInnerClass();
  PointRenderer.CIRCLE.areaToRadius = function(area) {
    return Math.sqrt(area/Math.PI);
  };

  PointRenderer.CIRCLE.render = function(x1, y1, x2, y2, fill, stroke) {
    var shape = new vector.Oval(x1, y1, x2-x1, y2-y1);
    shape.setFill(fill);
    shape.setStroke(stroke);
    return shape;
  };

  /**
   * {jsx3.chart.PointRenderer} Creates a x-shaped cross point.
   */
  PointRenderer.CROSS = PointRenderer.jsxclass.newInnerClass();
  
  /* @jsxobf-clobber */
  PointRenderer.CROSS.INNER_RATIO = 0.60; //Math.SQRT1_2;
  
  PointRenderer.CROSS.areaToRadius = function(area) {
    return Math.sqrt(area/(1-this.INNER_RATIO/Math.SQRT2))/2;
  };

  PointRenderer.CROSS.render = function(x1, y1, x2, y2, fill, stroke) {
    var d = x2 - x1;
    var innerRatio = this.INNER_RATIO;
    var p1 = Math.round(d * (1 - innerRatio) / 2);
    var p2 = Math.round(d * innerRatio / 2);
    var p3 = Math.round(d - d * (1 - innerRatio) / 2);
    var p4 = Math.round(d / 2);
    var shape = new vector.Polygon(0, 0, 
      [x1, y1,   x1 + p1, y1,   x1 + p4, y1 + p2,   x1 + p3, y1,   x2, y1,
                 x2, y1 + p1,   x2 - p2, y1 + p4,   x2, y1 + p3,   x2, y2,
                 x2 - p1, y2,   x2 - p4, y2 - p2,   x2 - p3, y2,   x1, y2,
                 x1, y2 - p1,   x1 + p2, y2 - p4,   x1, y2 - p3,   x1, y1]);
    shape.setFill(fill);
    shape.setStroke(stroke);
    return shape;  
  };

  /**
   * {jsx3.chart.PointRenderer} Creates a diamond shaped point.
   */
  PointRenderer.DIAMOND = PointRenderer.jsxclass.newInnerClass();
  
  /* @jsxobf-clobber */
  PointRenderer.DIAMOND.FACTOR = 1.2;

  PointRenderer.DIAMOND.areaToRadius = function(area) {
    return Math.sqrt(area)/2;
  };

  PointRenderer.DIAMOND.render = function(x1, y1, x2, y2, fill, stroke) {
    var cx = (x1 + x2) / 2;
    var cy = (y1 + y2) / 2;
    var w = (x2-x1) / this.FACTOR;
    var h = (y2-y1) / this.FACTOR;
    var shape = new vector.Rectangle(Math.round(cx - w/2), Math.round(cy - h/2), 
        Math.round(w), Math.round(h));
    shape.setRotation(45);
    shape.setFill(fill);
    shape.setStroke(stroke);
    return shape;  
  };

  /**
   * {jsx3.chart.PointRenderer} Creates a square point.
   */
  PointRenderer.BOX = PointRenderer.jsxclass.newInnerClass();

  PointRenderer.BOX.areaToRadius = function(area) {
    return Math.sqrt(PointRenderer.DIAMOND.FACTOR * PointRenderer.DIAMOND.FACTOR * area)/2;
  };

  PointRenderer.BOX.render = function(x1, y1, x2, y2, fill, stroke) {
    var shape = new vector.Rectangle(x1, y1, x2-x1, y2-y1);
    shape.setFill(fill);
    shape.setStroke(stroke);
    return shape;  
  };

  /**
   * {jsx3.chart.PointRenderer} Creates an upward-pointing triangular point.
   */
  PointRenderer.TRIANGLE = PointRenderer.jsxclass.newInnerClass();

  PointRenderer.TRIANGLE.areaToRadius = function(area) {
    return Math.sqrt(2*area)/2;
  };

  PointRenderer.TRIANGLE.render = function(x1, y1, x2, y2, fill, stroke) {
    var xmid = Math.round((x1+x2)/2);
    var shape = new vector.Polygon(0, 0, [xmid, y1, x2, y2, x1, y2, xmid, y1]);
    shape.setFill(fill);
    shape.setStroke(stroke);
    return shape;  
  };
  
});

/* @JSC :: begin DEP */

// DEPRECATED: remove in next version
jsx3.chart.Renderers = jsx3.chart.PointRenderer;
jsx3.chart.Renderers.Circle = jsx3.chart.PointRenderer.CIRCLE;
jsx3.chart.Renderers.Cross = jsx3.chart.PointRenderer.CROSS;
jsx3.chart.Renderers.Diamond = jsx3.chart.PointRenderer.DIAMOND;
jsx3.chart.Renderers.Box = jsx3.chart.PointRenderer.BOX;
jsx3.chart.Renderers.Triangle = jsx3.chart.PointRenderer.TRIANGLE;

/* @JSC :: end */
