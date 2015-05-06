/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-global-rename-pattern  _jsx(\w+) _jsx$1

/**
 * Various Charting related constants and utility functions.
 *
 * @author Jesse Costello-Good
 * @version 1.1
 */
jsx3.Package.definePackage("jsx3.chart", function(chart){

  chart.VERSION = chart.ADDIN.getVersion();

  chart.LOG = jsx3.util.Logger.getLogger(chart.jsxpackage.getName());
  chart.LOG_BENCH = jsx3.util.Logger.getLogger(chart.jsxpackage.getName() + ".benchmark");

  /** @private @jsxobf-clobber */
  chart._BAD_REFERENCE = {};

  /**
   * {String} top/north quadrant
   * @final @jsxobf-final
   */
  chart.QTOP = "top";
  
  /**
   * {String} right/east quadrant
   * @final @jsxobf-final
   */
  chart.QRIGHT = "right";
  
  /**
   * {String} bottom/south quadrant
   * @final @jsxobf-final
   */
  chart.QBOTTOM = "bottom";
  
  /**
   * {String} left/west quadrant
   * @final @jsxobf-final
   */
  chart.QLEFT = "left";
  
  /**
   * Splits a rectangular box in two pieces.
   *
   * @param left {int} the left value of the box to split
   * @param top {int} the top value of the box to split
   * @param width {int} the width value of the box to split
   * @param height {int} the height value of the box to split
   * @param placement {String} {top,left,right,bottom} where to place the first sub-box
   * @param w {int} the desired width of the first sub-box
   * @param h {int} the desired height of the first sub-box
   * @return {Array} [[l1,t1,w1,h1],[l2,t2,w2,h2]]
   */
  chart.splitBox = function( left, top, width, height, placement, w, h ) {
    var box1 = null, box2 = null;
    if (placement == chart.QTOP) {
      box1 = [left, top, width, Math.min(h, height-1)];
      box2 = [left, top + box1[3], width, height - box1[3]];
    } else if (placement == chart.QRIGHT) {
      var w1 = Math.min(w, width-1);
      box1 = [left + width - w1, top, w1, height];
      box2 = [left, top, width - w1, height];
    } else if (placement == chart.QBOTTOM) {
      var h1 = Math.min(h, height-1);
      box1 = [left, top + height - h1, width, h1];
      box2 = [left, top, width, height - h1];
    } else if (placement == chart.QLEFT) {
      box1 = [left, top, Math.min(w, width-1), height];
      box2 = [left + box1[2], top, width - box1[2], height];
    }
    return [box1, box2];
  };
  
  /**
   * Tests whether an object is an Axis that displays a range of number values
   * @param obj {Object}
   * @return {boolean}
   */
  chart.isValueAxis = function( obj ) {
    return (chart.LinearAxis && obj instanceof chart.LinearAxis) || 
        (chart.LogarithmicAxis && obj instanceof chart.LogarithmicAxis);
  };
  
  /**
   * Tests whether an object is an Axis that displays set of discreet categories
   * @param obj {Object}
   * @return {boolean}
   */
  chart.isCategoryAxis = function( obj ) {
    return chart.CategoryAxis && obj instanceof chart.CategoryAxis;
  };
  
  /**
   * Utility function, splits a property value on comma or semicolon separators
   * @return {Array} the tokens
   * @package
   */
  chart.splitInputArray = function( s ) {
    if (s == null) return null;
    var tokens = s.split(/\s*[,;]\s*/);
    if (tokens[0] === "") tokens.shift();
    if (tokens.length > 0 && tokens[tokens.length-1] === "") tokens.pop();
    return tokens;
  };
  
  /**
   * Utility function, converts a value to a Number
   * @param v {Object}
   * @return {Number}
   */
  chart.asNumber = function( v ) {
    if (v == null) return null;
    if (typeof(v) == "number") return v;
    return new Number(v);
  };
  
  /**
   * Utility function, parses the property editor string format of a gradient into its constituent parts
   * @param value {String} the gradient in the form "color [angle [alpha [colors ...]]]"
   * @return {Array} [color,angle,alpha,colors]
   */
  chart.parseGradient = function( value ) {
    if (! value) return null;
    var tokens = value.split(/\s+/);
    if (tokens[0] === "") tokens.shift();
    if (tokens.length > 0 && tokens[tokens.length-1] === "") tokens.pop();
  
    if (tokens.length == 0) return null;
    if (tokens.length > 4) 
      return [tokens[0], tokens[1], tokens[2], tokens.slice(3).join(" ")];
    return tokens;
  };
  
  /**
   * Utility function, combines a vector fill and the property editor string format of a gradient
   * @param fill {jsx3.vector.Fill} the base fill
   * @param value {String} the gradient in the form "color [angle [alpha [colors ...]]]"
   * @return {jsx3.vector.Fill}
   */
  chart.addGradient = function( fill, value ) {
    var gradient = chart.parseGradient(value);
    if (fill != null && gradient != null) {
      var clone = new jsx3.vector.Fill(fill.getColor(), fill.getAlpha());
      clone.setType("gradient");
      clone.setColor2(gradient[0]);
      clone.setAngle(gradient[1]);
      clone.setAlpha2(gradient[2]);
      clone.setColors(gradient[3]);
      return clone;
    } else {
      return fill;
    }
  };

  /**
   * Sets the value of a reference field; a reference field is a string field that evals to some sort of object.
   * @param fieldName {String} the name of the reference field, this method will set this[fieldName]
   * @param asString {String} the value of the field as a string (before it's eval'ed)
   * @package
   */
  chart.setReferenceField = function( obj, fieldName, asString ) {
    obj[fieldName] = asString;
    // clear the cached result so that the next call to getReferenceField() will eval again
    obj["_" + fieldName + "_eval"] = null;
  };

  /**
   * fetches the eval'ed result of a reference field; caches the result (ok or invalid)
   * @param fieldName {String} the name of the reference field
   * @param type {String} the eval'ed result will be constrained to this javascript type, defaults to 'object'
   * @package
   */
  chart.getReferenceField = function( obj, fieldName, type ) {
    if (type == null) type = "object";
    // we store the cached results in this field
    var exField = "_" + fieldName + "_eval";

    // only eval if not cached
    if (! obj[exField] && obj[fieldName]) {
      try {
        // eval it
        var localFunct = obj.eval("var f = " + obj[fieldName] + "; f;");
        obj[exField] = localFunct;
        // constrain to type
        if (typeof(obj[exField]) != type) {
          chart.LOG.error("error evaluating '" + fieldName + "', " + obj[exField] + " is not of type " + type);
          obj[exField] = chart._BAD_REFERENCE;
        }
      } catch (e) {
        e = jsx3.NativeError.wrap(e);
        // remember that eval fails
        obj[exField] = chart._BAD_REFERENCE;
        chart.LOG.error("error evaluating " + type + " field '" + fieldName, e);
      }
    }

    // previous eval may have failed ... return null in this case
    return obj[exField] != chart._BAD_REFERENCE ? obj[exField] : null;
  };

  /**
   * calls getReferenceField() with the type parameter of 'function'
   * @param fieldName {String} the name of the reference field
   * @package
   */
  chart.getFunctionField = function( obj, fieldName ) {
    if (typeof(obj[fieldName]) == "function")
      return obj[fieldName];
    return chart.getReferenceField(obj, fieldName, "function");
  };

  /**
   * copies this instance's values of getBackgroundColor() and getAlpha() into a vector fill for the vector parameter
   * @param objShape {jsx3.vector.Shape} the vector whose fill to set
   * @package
   */
  chart.copyBackgroundToFill = function(obj, objShape) {
    var color = obj.getBackgroundColor();

    if (color != null && color.match(/\S/)) {
      var fill = objShape.getFirstChildOfType(jsx3.vector.Fill);
      if (fill == null) {
        fill = new jsx3.vector.Fill();
        objShape.setFill(fill);
      }
      fill.setColor(color);

      // this class does not define getAlpha()
      if (typeof(obj.getAlpha) == 'function')
        fill.setAlpha(obj.getAlpha());
    } else {
      objShape.setFill(null);
    }
  };

  /**
   * copies this instance's values of getBorderColor(), getBorderAlpha(), and getBorderWidth() into a VectorStroke for the vector parameter
   * @param objShape {jsx3.vector.Shape} the vector whose stroke to set
   * @package
   */
  chart.copyBorderToStroke = function(obj, objShape) {
    var color = obj.getBorderColor();

    if (color != null && color.match(/\S/)) {
      var stroke = objShape.getFirstChildOfType(jsx3.vector.Stroke);
      if (stroke == null) {
        stroke = new jsx3.vector.Stroke();
        objShape.setStroke(stroke);
      }
      stroke.setColor(color);

      // this class does not define getBorderAlpha() or getBorderWidth()
      if (typeof(obj.getBorderAlpha) == 'function')
        stroke.setAlpha(obj.getBorderAlpha());
      if (typeof(obj.getBorderWidth) == 'function')
        stroke.setWidth(obj.getBorderWidth());
    } else {
      objShape.setStroke(null);
    }
  };

  /**
   * @package
   */
  chart.setEventProperties = function(obj, objTag) {
    var Interactive = jsx3.gui.Interactive;
    var Event = jsx3.gui.Event;

    if (objTag == null)
      objTag = obj.getCanvas();

    var events = {};
    if (obj.getMenu() != null)
      events[Event.MOUSEUP] = true;
    if (obj.hasEvent(Interactive.SELECT))
      events[Event.CLICK] = true;
    if (obj.hasEvent(Interactive.EXECUTE))
      events[Event.DOUBLECLICK] = true;
    if (obj.hasEvent(Interactive.SPYGLASS)) {
      events[Event.MOUSEOVER] = "doSpyOver";
      events[Event.MOUSEOUT] = "doSpyOut";
    }

    for (var eventType in events) {
      var strMethod = events[eventType];
      if (typeof(strMethod) != "string")
        strMethod = Interactive.BRIDGE_EVENTS_MAP[eventType];
      jsx3.vector.paintEventHandler(obj, eventType, strMethod, objTag);
    }
  };

});
