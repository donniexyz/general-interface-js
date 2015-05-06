/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.Axis");

// @jsxobf-clobber  shownMin shownMax shownInterval
/**
 * Type of axis that displays a linear range of values.
 */
jsx3.Class.defineClass("jsx3.chart.LinearAxis", jsx3.chart.Axis, null, function(LinearAxis, LinearAxis_prototype) {
  
  /**
   * {int} The minimum number of intervals to show when calculating by auto adjust.
   */
  LinearAxis.MIN_INTERVALS = 5;

  /**
   * {int} The maximum number of intervals to show when calculating by auto adjust.
   */
  LinearAxis.MAX_INTERVALS = 11;

  /**
   * The maximum number of major ticks allowed (to prevent locking up the machine by accident).
   * @package
   */
  LinearAxis.MAX_TICKS = 200;

  /**
   * The default padding factor when calculating by auto adjust.
   * @private
   * @jsxobf-clobber
   * @jsxobf-final
   */
  LinearAxis._PADDING_FACTOR = 1.1;

  // Use these values if there is no data range.
  /** @private @jsxobf-clobber @jsxobf-final */
  LinearAxis._DEFAULT_MIN = 0;
  /** @private @jsxobf-clobber @jsxobf-final */
  LinearAxis._DEFAULT_MAX = 100;
  /** @private @jsxobf-clobber @jsxobf-final */
  LinearAxis._DEFAULT_INTERVAL = 20;
  
  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param horizontal {boolean} whether this axis is horizontal (x), otherwise it's vertical (y)
   * @param primary {boolean} whether this axis is primary, otherwise it's secondary
   */
  LinearAxis_prototype.init = function(name, horizontal, primary) {
    //call constructor for super class
    this.jsxsuper(name, horizontal, primary);

    this.autoAdjust = jsx3.Boolean.TRUE;
    this.baseAtZero = jsx3.Boolean.TRUE;
    this.min = null;
    this.max = null;
    this.interval = null;
  
    this.storeTransient("trans_shownMin", LinearAxis._DEFAULT_MIN);
    this.storeTransient("trans_shownMax", LinearAxis._DEFAULT_MAX);
    this.storeTransient("trans_shownInterval", LinearAxis._DEFAULT_INTERVAL);
  };

  /**
   * Returns the autoAdjust field, whether to adjust the max/min/interval to the range of the data.
   * @return {boolean} autoAdjust
   */
  LinearAxis_prototype.getAutoAdjust = function() {
    return this.autoAdjust;
  };

  /**
   * Sets the autoAdjust field.
   * @param autoAdjust {boolean} the new value for autoAdjust
   */
  LinearAxis_prototype.setAutoAdjust = function( autoAdjust ) {
    this.autoAdjust = autoAdjust;
  };

  /**
   * Returns the baseAtZero field, whether to set either the min or max value of this axis to 0 if applicable and if autoAdjust is true.
   * @return {boolean} baseAtZero
   */
  LinearAxis_prototype.getBaseAtZero = function() {
    return this.baseAtZero;
  };

  /**
   * Sets the baseAtZero field.
   * @param baseAtZero {boolean} the new value for baseAtZero
   */
  LinearAxis_prototype.setBaseAtZero = function( baseAtZero ) {
    this.baseAtZero = baseAtZero;
  };

  /**
   * Returns the min field, the minimum value displayed by this axis, overrides autoAdjust.
   * @return {int} min
   */
  LinearAxis_prototype.getMin = function() {
    return this.min;
  };

  /**
   * Sets the min field.
   * @param min {int} the new value for min
   */
  LinearAxis_prototype.setMin = function( min ) {
    this.min = min;
  };

  /**
   * Returns the max field, the maximum value displayed by this axis, overrides autoAdjust.
   * @return {int} max
   */
  LinearAxis_prototype.getMax = function() {
    return this.max;
  };

  /**
   * Sets the max field.
   * @param max {int} the new value for max
   */
  LinearAxis_prototype.setMax = function( max ) {
    this.max = max;
  };

  /**
   * Returns the interval field, the interval between major ticks, overrides autoAdjust.
   * @return {int} interval
   */
  LinearAxis_prototype.getInterval = function() {
    return this.interval;
  };

  /**
   * Sets the interval field.
   * @param interval {int} the new value for interval
   */
  LinearAxis_prototype.setInterval = function( interval ) {
    this.interval = interval;
  };
  
  /**
   * rendering an axis is 2-pass, do auto adjust if applicable
   * @package
   */
  LinearAxis_prototype.prePaintUpdate = function() {
    var success = false;
    if (this.autoAdjust)
      success = this._adjustForRange();
    
    if (! success) {
      this.storeTransient("trans_shownMin", 
          this.min != null ? this.min : LinearAxis._DEFAULT_MIN);
      this.storeTransient("trans_shownMax", 
          this.max != null ? this.max : LinearAxis._DEFAULT_MAX);
      this.storeTransient("trans_shownInterval", 
          this.interval != null ? this.interval : LinearAxis._DEFAULT_INTERVAL);
    }
  };
  
  /**
   * calculate shownMin/shownMax/shownInterval based on min/max/interval/baseAtZero
   * @private
   * @jsxobf-clobber
   */
  LinearAxis_prototype._adjustForRange = function() {
    var myChart = this.getChart();
    if (myChart == null) return false;
    
    // get the range
    var range = myChart.getRangeForAxis(this);
    var rangeMin, rangeMax;
    if (range == null) {
      jsx3.chart.LOG.debug("no range for axis " + this + " in chart " + myChart);
      if (this.min != null || this.max != null) {
        // must give this method a chance to set the interval appropriate to the manual min/max
        rangeMin = this.min || LinearAxis._DEFAULT_MIN;
        rangeMax = this.max || rangeMin + LinearAxis._DEFAULT_MAX;
      } else {
        return false;
      }
    } else {
      rangeMin = range[0];
      rangeMax = range[1];
    }
    
    // the result holders
    var min = null, max = null, itv = null;
    
    // check min, or 0
    if (this.min != null)
      min = this.min;
    else if (rangeMin >= 0 && this.baseAtZero)
      min = 0;
      
    // check max, or 0
    if (this.max != null)
      max = this.max;
    else if (rangeMax <= 0 && this.baseAtZero)
      max = 0;
      
    itv = this.interval;

    // calculate interval, will be {1,2,5} * 10^x
    if (itv == null) {
      var paddingFactor = 1;
      // padded range should be at least this
      var rmin = null, rmax = null;
      
      if (min != null) {
        rmin = min;
      } else {
        rmin = rangeMin;
        paddingFactor *= LinearAxis._PADDING_FACTOR;
      }
  
      if (max != null) {
        rmax = max;
      } else {
        rmax = rangeMax;
        paddingFactor *= LinearAxis._PADDING_FACTOR;
      }
      
      var fullRange = rmax - rmin;
      var paddedRange = fullRange * paddingFactor;
      
      itv = 1;
      
      if (paddedRange > 0) {
        paddedRange /= LinearAxis.MIN_INTERVALS;
      
        // TODO: reimplement with Math.log
        while (paddedRange < 1) {
          itv /= 10;
          paddedRange *= 10;
        }
        
        while (paddedRange > 10) {
          itv *= 10;
          paddedRange /= 10;
        }
        
        if (paddedRange > 5) {
          itv *= 5;
        } else if (paddedRange > 2) {
          itv *= 2;
        }
      }
    }

    // calculate min based on interval, if necessary    
    if (min == null) {
      var minPadded = rangeMin - (LinearAxis._PADDING_FACTOR-1) *
        (rangeMax - rangeMin) / 2;
      min = itv * Math.floor(minPadded/itv);
      
      if (max != null) {
        min -= max % itv;
      }
    }
    
    // calculate max based on interval, if necessary    
    if (max == null) {
      var maxPadded = rangeMax + (LinearAxis._PADDING_FACTOR-1) *
        (rangeMax - rangeMin) / 2;
      max = itv * Math.ceil(maxPadded/itv);
      
      if (min != null) {
        max += min % itv;
      }
    }

    /*
    var success = true;
    
    if (isNaN(min)) {
      jsx3.chart.LOG.debug("error computing minimum, range:" + range + " rangeMin:" + rangeMin + " rangeMax:" + rangeMax + " max:" + max + " itv:" + itv);
      success = false;
    } else {
      this.storeTransient("trans_shownMin", min);
    }
    
    if (isNaN(max)) {
      jsx3.chart.LOG.debug("error computing maximum, range:" + range + " rangeMin:" + rangeMin + " rangeMax:" + rangeMax + " min:" + min + " itv:" + itv);
      success = false;
    } else {
      this.storeTransient("trans_shownMax", max);
    }
    
    if (isNaN(itv) || itv < 0) {
      jsx3.chart.LOG.debug("error computing interval, range:" + range + " rangeMin:" + rangeMin + " rangeMax:" + rangeMax + " max:" + max + " min:" + min);
      success = false;
    } else {
      this.storeTransient("trans_shownInterval", itv);
    }
    
    return success;
    */
    
    this.storeTransient("trans_shownMin", min);
    this.storeTransient("trans_shownMax", max);
    this.storeTransient("trans_shownInterval", itv);
    
    return true;
  };
  
  /**
   * determine the value that should be displayed at a major tick
   * @param index {int} the index of the tick in the array returned by getMajorTicks()
   * @return {Number}
   * @package
   */
  LinearAxis_prototype.getValueForTick = function(index) {
    return this.fetchTransient("trans_shownMin") + index * this.fetchTransient("trans_shownInterval");
  };

  /**
   * Returns the coordinates of the major ticks.
   * @return {Array} an array of the coordinates, from shownMin incrementing by shownInterval
   * @package
   */
  LinearAxis_prototype.getMajorTicks = function() {
    var shownMax = this.fetchTransient("trans_shownMax");
    var shownMin = this.fetchTransient("trans_shownMin");
    var shownInterval = this.fetchTransient("trans_shownInterval");
    
    var ticks = [];
    var i = shownMin;
    while (i <= shownMax && ticks.length < LinearAxis.MAX_TICKS) {
      ticks.push(this.getCoordinateFor(i));
      i += shownInterval;
    }
    return ticks;
  };

  /**
   * whether or not the value of 0 is displayed between (non-inclusive) the minimum and maximum value of this axis
   * @return {boolean}
   * @package
   */
  LinearAxis_prototype.isZeroInRange = function() {
    return this.fetchTransient("trans_shownMin") < 0 && this.fetchTransient("trans_shownMax") > 0;
  };
  
  /**
   * convert a number value to a coordinate between 0 and this.length, if the value is outside of the range of the axis, return the closest value in the range
   * @param value {Number} a value displayed along the axis
   * @return {int} coordinate along the axis
   */
  LinearAxis_prototype.getCoordinateFor = function( value ) {
    var shownMax = this.fetchTransient("trans_shownMax");
    var shownMin = this.fetchTransient("trans_shownMin");

    if (value < shownMin) return this.horizontal ? 0 : this.length;
    if (value > shownMax) return this.horizontal ? this.length : 0;
    var c = Math.round(this.length * (value - shownMin) / (shownMax - shownMin));
    return this.horizontal ? c : this.length - c;
  };
  
  /**
   * same as getCoordinateFor(), but does not clip to bounds of the axis
   */
  LinearAxis_prototype.getCoordinateForNoClip = function( value ) {
    var shownMax = this.fetchTransient("trans_shownMax");
    var shownMin = this.fetchTransient("trans_shownMin");

    var rounded = Math.round(value*1000) / 1000;
    var c = this.length * ((rounded - shownMin) / (shownMax - shownMin));
    return Math.round(this.horizontal ? c : (this.length - c));
  };
  
/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  LinearAxis.getVersion = function() {
    return jsx3.chart.VERSION;
  };

/* @JSC :: end */

});
