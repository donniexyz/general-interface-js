/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.Axis");

// @jsxobf-clobber  trans_numCategories trans_numSeries

/**
 * Axis type that displays a set of discrete values (categories). Usually a category corresponds to a 
 * record in the chart's data provider.
 */
jsx3.Class.defineClass("jsx3.chart.CategoryAxis", jsx3.chart.Axis, null, function(CategoryAxis, CategoryAxis_prototype) {

  /**
   * {String}
   * @final @jsxobf-final
   */
  CategoryAxis.TICKS_ALIGNED = "aligned";

  /**
   * {String}
   * @final @jsxobf-final
   */
  CategoryAxis.TICKS_BETWEEN = "between";

  /**
   * The maximum number of major ticks allowed (to prevent locking up the machine by accident).
   * @package
   */
  CategoryAxis.MAX_TICKS = 200;

  /**
   * Valid values for tickAlignement, as a map.
   * @private
   * @jsxobf-clobber
   */
  CategoryAxis._VALID_TICKALIGNMENTS = {aligned: 1, between: 1};

  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param horizontal {boolean} whether this axis is horizontal (x), otherwise it's vertical (y)
   * @param primary {boolean} whether this axis is primary, otherwise it's secondary
   */
  CategoryAxis_prototype.init = function(name, horizontal, primary) {
    //call constructor for super class
    this.jsxsuper(name, horizontal, primary);

    this.tickAlignment = CategoryAxis.TICKS_BETWEEN;
    this.categoryField = null;
    this.paddingLow = null;
    this.paddingHigh = null;
  
    this.storeTransient("trans_numCategories", 0);
    this.storeTransient("trans_numSeries", 0);
  };

  /**
   * Returns the tickAlignment field, if 'between' then the midpoint of the category is between two major ticks, otherwise if 'aligned' then the midpoint of the category is aligned with a major tick.
   * @return {String} tickAlignment, one of {'aligned','between'}
   */
  CategoryAxis_prototype.getTickAlignment = function() {
    return this.tickAlignment;
  };

  /**
   * Sets the tickAlignment field.
   * @param tickAlignment {String} the new value for tickAlignment, one of {'aligned','between'}
   */
  CategoryAxis_prototype.setTickAlignment = function( tickAlignment ) {
    if (CategoryAxis._VALID_TICKALIGNMENTS[tickAlignment]) {
      this.tickAlignment = tickAlignment;
    } else {
      throw new jsx3.IllegalArgumentException("tickAlignment", tickAlignment);
    }
  };

  /**
   * Returns the categoryField field, the attribute of records from the data provider that contains the category name (this value can still be transformed by Axis's 'labelFunction' field).
   * @return {String} categoryField
   */
  CategoryAxis_prototype.getCategoryField = function() {
    return this.categoryField;
  };

  /**
   * Sets the categoryField field.
   * @param categoryField {String} the new value for categoryField
   */
  CategoryAxis_prototype.setCategoryField = function( categoryField ) {
    this.categoryField = categoryField;
  };

  /**
   * Returns the paddingLow field, the number of category widths to pad the beginning of the axis with.
   * @return {float} paddingLow
   */
  CategoryAxis_prototype.getPaddingLow = function() {
    return this.paddingLow != null ? this.paddingLow : 0;
  };

  /**
   * Sets the paddingLow field.
   * @param paddingLow {float} the new value for paddingLow
   */
  CategoryAxis_prototype.setPaddingLow = function( paddingLow ) {
    this.paddingLow = paddingLow;
  };

  /**
   * Returns the paddingHigh field, the number of category widths to pad the end of the axis with.
   * @return {float} paddingHigh
   */
  CategoryAxis_prototype.getPaddingHigh = function() {
    return this.paddingHigh != null ? this.paddingHigh : 0;
  };

  /**
   * Sets the paddingHigh field.
   * @param paddingHigh {float} the new value for paddingHigh
   */
  CategoryAxis_prototype.setPaddingHigh = function( paddingHigh ) {
    this.paddingHigh = paddingHigh;
  };

  /**
   * rendering an axis is 2-pass
   * @package
   */
  CategoryAxis_prototype.prePaintUpdate = function() {
    this.clearTransient("trans_majorTicks");

    var myChart = this.getChart();
    
    // just grab some info from the chart, not really necessary to take place in pass 1
    if (myChart == null) {
      this.storeTransient("trans_numCategories", 0);
      this.storeTransient("trans_numSeries", 0);
    } else {
      var series = myChart.getSeriesForAxis(this, true);
      var dp = myChart.getDataProvider();
      
      this.storeTransient("trans_numSeries", series.length);
      this.storeTransient("trans_numCategories", dp != null ? dp.length : 0);
    }
  };

  /**
   * Returns the coordinates of the major ticks.
   * @return {Array<int>} an array of the coordinates, evenly spaces ticks for each category and taking in to account high and low padding
   * @package
   */
  CategoryAxis_prototype.getMajorTicks = function() {
    // try cached ticks ... this method is called a lot
    var ticks = this.fetchTransient("trans_majorTicks");
    if (ticks != null) return ticks;
    
    var numCategories = this.fetchTransient("trans_numCategories");

    ticks = [];
    if (numCategories < 1) return ticks;
    
    var loPad = this.getPaddingLow();
    var hiPad = this.getPaddingHigh();
    
    // if aligned between, then we need an extra major tick
    var tickCount = this.tickAlignment == CategoryAxis.TICKS_BETWEEN 
        ? numCategories + 1 : numCategories;
    var rowCount = tickCount - 1;
    
    var rowsToFit = rowCount + loPad + hiPad;
    var rowWidth = this.length / rowsToFit;
    
    var offset = loPad * rowWidth;
    
    for (var i = 0; i < tickCount && i < CategoryAxis.MAX_TICKS; i++) {
      ticks.push(Math.round(offset + i * rowWidth));
    }

    // store this so that we can ask for it a lot
    this.storeTransient("trans_majorTicks", ticks);
    return ticks;
  };

  /**
   * override this method from Axis so that we can align labels to the space between major ticks if tickAlignment is 'between'
   * @return {Array<int>}
   * @package
   */  
  CategoryAxis_prototype._getLabelTicks = function() {
    var numCategories = this.fetchTransient("trans_numCategories");

    if (this.tickAlignment == CategoryAxis.TICKS_BETWEEN) {
      var majorTicks = this.getMajorTicks();
      var ticks = [];
      for (var i = 0; i < numCategories; i++) {
        ticks[i] = Math.round((majorTicks[i]+majorTicks[i+1])/2);
      }
      return ticks;
    } else {
      return this.getMajorTicks();
    }
  };

  /**
   * determine the value that should be displayed at a major tick
   * @param index {int} the index of the tick in the array returned by getMajorTicks()
   * @return {Number}
   * @package
   */
  CategoryAxis_prototype.getValueForTick = function(index) {
    // default value will be the record index
    var value = index;
    
    // we need to query the chart's data provider to figure this out
    var myChart = this.getChart();

    if (this.categoryField && myChart != null) {
      var dp = myChart.getDataProvider();
      if (dp != null) {
        var record = dp[index];
        if (record != null) 
          value = record.getAttribute([this.categoryField]);
      }
    }

    return value;
  };

  /**
   * false
   * @return {boolean} false
   * @package
   */
  CategoryAxis_prototype.isZeroInRange = function() {
    return false;
  };
  
  /**
   * Returns the coordinate range [low,high] along this axis where a category is displayed.
   * @param index {int} the index of the record in the data provider
   * @return {Array} [low,high]
   * @package
   */
  CategoryAxis_prototype.getRangeForCategory = function( index ) {
    var ticks = this.getMajorTicks();

    if (this.tickAlignment == CategoryAxis.TICKS_BETWEEN) {
      if (index < 0 || index >= ticks.length - 1) 
        return null;
      else 
        return [ticks[index], ticks[index+1]];
    } else {
      if (index < 0 || index >= ticks.length || ticks.length < 2) 
        return null;
      
      var width = index == 0 ? ticks[1] - ticks[0] : ticks[index] - ticks[index-1];
      return [Math.round(ticks[index] - width/2), Math.round(ticks[index] + width/2)];
    }
  };
  
  /**
   * Returns the coordinate along this axis of the midpoint of a category.
   * @param index {int} the index of the record in the data provider
   * @return {int}
   * @package
   */
  CategoryAxis_prototype.getPointForCategory = function( index ) {
    var ticks = this.getMajorTicks();
    
    if (this.tickAlignment == CategoryAxis.TICKS_BETWEEN) {
      if (index < 0 || index >= ticks.length - 1) 
        return null;
      else 
        return Math.round((ticks[index] + ticks[index+1])/2);
    } else {
      return ticks[index];
    }
  };
  
/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  CategoryAxis.getVersion = function() {
    return jsx3.chart.VERSION;
  };

/* @JSC :: end */

});
