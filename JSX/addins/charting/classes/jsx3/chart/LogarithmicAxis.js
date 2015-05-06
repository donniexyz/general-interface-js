/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.Axis");

// @jsxobf-clobber  shownMinExp shownMaxExp
/**
 * An axis that displays a range of values logarithmically (base^n and base^(n+1) occupy same visual space).
 */
jsx3.Class.defineClass("jsx3.chart.LogarithmicAxis", jsx3.chart.Axis, null, function(LogarithmicAxis, LogarithmicAxis_prototype) {
  
  /** @package */
  LogarithmicAxis.MAX_TICKS = 200;

  /**
   * The default padding factor when calculating by auto adjust.
   * @private
   * @jsxobf-clobber
   * @final @jsxobf-final
   */
  LogarithmicAxis._PADDING_FACTOR = 1.0;

  // Use these values if there is no data range.
  /** @private @jsxobf-clobber @jsxobf-final */
  LogarithmicAxis._DEFAULT_MIN_EXPONENT = 0;
  /** @private @jsxobf-clobber @jsxobf-final */
  LogarithmicAxis._DEFAULT_MAX_EXPONENT = 2;

  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param horizontal {boolean} whether this axis is horizontal (x), otherwise it's vertical (y)
   * @param primary {boolean} whether this axis is primary, otherwise it's secondary
   */
  LogarithmicAxis_prototype.init = function(name, horizontal, primary) {
    //call constructor for super class
    this.jsxsuper(name, horizontal, primary);

    this.autoAdjust = jsx3.Boolean.TRUE;
    this.baseAtZero = jsx3.Boolean.TRUE;
    this.showNegativeValues = jsx3.Boolean.FALSE;
    this.minExponent = null;
    this.maxExponent = null;
    this.base = 10;
    this.majorDivisions = 1;
  
    this.storeTransient("trans_shownMinExp", LogarithmicAxis._DEFAULT_MIN_EXPONENT);
    this.storeTransient("trans_shownMaxExp", LogarithmicAxis._DEFAULT_MAX_EXPONENT);
  };

  /**
   * Returns the autoAdjust field.
   * @return {boolean} autoAdjust
   */
  LogarithmicAxis_prototype.getAutoAdjust = function() {
    return this.autoAdjust;
  };

  /**
   * Sets the autoAdjust field.
   * @param autoAdjust {boolean} the new value for autoAdjust
   */
  LogarithmicAxis_prototype.setAutoAdjust = function( autoAdjust ) {
    this.autoAdjust = autoAdjust;
  };

  /**
   * Returns the baseAtZero field, whether or not to set the minimum value to base^0, otherwise will choose an appropriate value for the data range.
   * @return {boolean} baseAtZero
   */
  LogarithmicAxis_prototype.getBaseAtZero = function() {
    return this.baseAtZero;
  };

  /**
   * Sets the baseAtZero field.
   * @param baseAtZero {boolean} the new value for baseAtZero
   */
  LogarithmicAxis_prototype.setBaseAtZero = function( baseAtZero ) {
    this.baseAtZero = baseAtZero;
  };

  /**
   * Returns the showNegativeValues field.
   * @return {boolean} showNegativeValues
   */
  LogarithmicAxis_prototype.getShowNegativeValues = function() {
    return this.showNegativeValues;
  };

  /**
   * Sets the showNegativeValues field.
   * @param showNegativeValues {boolean} the new value for showNegativeValues
   */
  LogarithmicAxis_prototype.setShowNegativeValues = function( showNegativeValues ) {
    this.showNegativeValues = showNegativeValues;
  };

  /**
   * Returns the minExponent field, the range of values displayed will begin at base^minExpronent.
   * @return {int} minExponent
   */
  LogarithmicAxis_prototype.getMinExponent = function() {
    return this.minExponent;
  };

  /**
   * Sets the minExponent field.
   * @param minExponent {int} the new value for minExponent
   */
  LogarithmicAxis_prototype.setMinExponent = function( minExponent ) {
    this.minExponent = minExponent;
  };

  /**
   * Returns the maxExponent field, the range of values displayed will end at base^maxExponent.
   * @return {int} maxExponent
   */
  LogarithmicAxis_prototype.getMaxExponent = function() {
    return this.maxExponent;
  };

  /**
   * Sets the maxExponent field.
   * @param maxExponent {int} the new value for maxExponent
   */
  LogarithmicAxis_prototype.setMaxExponent = function( maxExponent ) {
    this.maxExponent = maxExponent;
  };

  /**
   * Returns the base field.
   * @return {int} base
   */
  LogarithmicAxis_prototype.getBase = function() {
    return this.base;
  };

  /**
   * Sets the base field.
   * @param base {int} the new value for base
   */
  LogarithmicAxis_prototype.setBase = function( base ) {
    this.base = base;
  };

  /**
   * Returns the majorDivisions field, the number of major tick line divisions to place between the values base^n and base^(n+1). A good value can be base-1, though the default value is 1..
   * @return {int} majorDivisions
   */
  LogarithmicAxis_prototype.getMajorDivisions = function() {
    return this.majorDivisions;
  };

  /**
   * Sets the majorDivisions field.
   * @param majorDivisions {int} the new value for majorDivisions
   */
  LogarithmicAxis_prototype.setMajorDivisions = function( majorDivisions ) {
    this.majorDivisions = majorDivisions;
  };

  /**
   * rendering an axis is 2-pass, do auto adjust if applicable
   * @package
   */
  LogarithmicAxis_prototype.prePaintUpdate = function() {
    var success = false;
    if (this.autoAdjust)
      success = this._adjustForRange();
    
    if (! success) {
      this.storeTransient("trans_shownMinExp", 
          this.minExponent != null ? this.minExponent : LogarithmicAxis._DEFAULT_MIN_EXPONENT);
      this.storeTransient("trans_shownMaxExp", 
          this.maxExponent != null ? this.maxExponent : LogarithmicAxis._DEFAULT_MAX_EXPONENT);
    }
  };
  
  /**
   * calculate shownMin/shownMax/shownInterval based on min/max/interval/baseAtZero
   * @private
   * @jsxobf-clobber 
   */
  LogarithmicAxis_prototype._adjustForRange = function() {
    var myChart = this.getChart();
    if (myChart == null) return false;
    
    // get the range
    var range = myChart.getRangeForAxis(this);
    if (range == null) {
      jsx3.chart.LOG.debug("no range for axis " + this + " in chart " + myChart);
      return false;
    }
    
    var rangeMin = Math.max(0, range[0]);
    var rangeMax = Math.max(0, range[1]);
    
    if (rangeMax == 0) {
      jsx3.chart.LOG.debug("range of axis " + this + " is all negative " + myChart);
      return false;
    }
    
    var min = null, max = null;
    
    if (this.minExponent != null) {
      min = this.minExponent;
    } else if (this.baseAtZero) {
      min = 0;
    }
    
    if (this.maxExponent != null) {
      max = this.maxExponent;
    }
    
    rangeMin *= LogarithmicAxis._PADDING_FACTOR;
    rangeMax *= LogarithmicAxis._PADDING_FACTOR;
    
    if (min == null) {
      if (rangeMin == 0)
        min = 0;
      else
        min = Math.floor(Math.log(rangeMin) / Math.log(this.base));
    }
    
    if (max == null) {
      max = Math.ceil(Math.log(rangeMax) / Math.log(this.base));
    }
    
    this.storeTransient("trans_shownMinExp", min);
    this.storeTransient("trans_shownMaxExp", max);
    
    return true;
  };
  
  /**
   * determine the value that should be displayed at a major tick
   * @param index {int} the index of the tick in the array returned by getMajorTicks()
   * @return {Number}
   * @package
   */
  LogarithmicAxis_prototype.getValueForTick = function(index) {
    var min = this.fetchTransient("trans_shownMinExp");
    var exp = Math.floor(min + index/this.majorDivisions);
    
    var mod = index % this.majorDivisions;
    if (mod == 0) {
      return Math.pow(this.base, exp);
    } else {
      var val1 = Math.pow(this.base, exp);
      var val2 = Math.pow(this.base, exp+1);
      return val1 + (mod * (val2-val1) / this.majorDivisions);
    }
  };

  /**
   * Returns the coordinates of the major ticks.
   * @return {Array} an array of the coordinates, from shownMin incrementing by shownInterval
   * @package
   */
  LogarithmicAxis_prototype.getMajorTicks = function() {
    var shownMin = this.fetchTransient("trans_shownMinExp");
    var shownMax = this.fetchTransient("trans_shownMaxExp");
    
    var ticks = [];
    var tickCount = 0;
    for (var i = shownMin; i <= shownMax && tickCount < LogarithmicAxis.MAX_TICKS; i++) {
      var tickValue = Math.pow(this.base, i);
            
      if (i > shownMin) {
        var lastTickValue = Math.pow(this.base, i-1);
        for (var j = 1; j < this.majorDivisions; j++) {
          var midValue = lastTickValue + (j * (tickValue-lastTickValue) / this.majorDivisions);
          ticks.push(this.getCoordinateFor(midValue));
          tickCount++;
        }
      }

      ticks.push(this.getCoordinateFor(tickValue));
      tickCount++;
    }
    return ticks;
  };

  /**
   * Returns the coordinates of minor tick lines for one span between major ticks.
   * @param majorTicks {Array} result of this.getMajorTicks()
   * @param index {int} the index of the major tick that is the end of the segment for which to determine minor ticks, between 0 and majorTicks.length (inclusive!)
   * @return {Array}
   * @package
   */
  LogarithmicAxis_prototype._getMinorTicks = function(majorTicks, index) {
    var ticks = [];
    if (index == 0) {
      // TODO: minor tick lines before the first major tick
      return [];
    } else if (index == majorTicks.length) {
      // TODO: minor tick lines after the last major tick
      return [];
    } else {
      var min = this.getValueForTick(index-1);
      var max = this.getValueForTick(index);

      for (var i = 1; i < this.minorTickDivisions; i++) {
        var midValue = min + (i * (max-min) / this.minorTickDivisions);
        ticks.push(this.getCoordinateFor(midValue));
      }
    }
    return ticks;
  };

  /**
   * whether or not the value of 0 is displayed between (non-inclusive) the minimum and maximum value of this axis
   * @return {boolean} false
   * @package
   */
  LogarithmicAxis_prototype.isZeroInRange = function() {
    return false;
  };
  
  /**
   * convert a number value to a coordinate between 0 and this.length, if the value is outside of the range of the axis, return the closest value in the range
   * @param value {Number} a value displayed along the axis
   * @return {int} coordinate along the axis
   */
  LogarithmicAxis_prototype.getCoordinateFor = function( value ) {
    var shownMin = this.fetchTransient("trans_shownMinExp");
    var shownMax = this.fetchTransient("trans_shownMaxExp");

    var coord = null;

    if (value <= 0) {
      coord = 0;
    } else {
      var exp = Math.log(value) / Math.log(this.base);    
      
      if (exp < shownMin) {
        coord = 0;
      } else if (exp > shownMax) {
        coord = this.length;
      } else {
        coord = Math.round(this.length * (exp - shownMin) / (shownMax - shownMin));
      }
    }
    
    return this.horizontal ? coord : this.length - coord;
  };
  
  /**
   * same as getCoordinateFor(), but does not clip to bounds of the axis
   */
  LogarithmicAxis_prototype.getCoordinateForNoClip = function( value ) {
    var shownMin = this.fetchTransient("trans_shownMinExp");
    var shownMax = this.fetchTransient("trans_shownMaxExp");

    var coord = null;

    if (value <= 0) {
      coord = -1;
    } else {
      var exp = Math.log(value) / Math.log(this.base);    
      coord = Math.round(this.length * (exp - shownMin) / (shownMax - shownMin));
    }
    
    return this.horizontal ? coord : this.length - coord;
  };
  
/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  LogarithmicAxis.getVersion = function() {
    return jsx3.chart.VERSION;
  };

/* @JSC :: end */

});
