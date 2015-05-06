/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.vector.Block", "jsx3.xml.Cacheable", "jsx3.chart.Series");

/**
 * The base class for all charts in this package. Encapsulates common functionality shared by all charts.
 * <p/>
 * In general, a chart is responsible for managing its children components and handling any coordination
 * between them. A chart always manages the layout of its children.
 * <p/>
 * All charts can have the following children:
 * <ul>
 *   <li>{0,1} jsx3.chart.ChartLabel, will render as the chart's title</li>
 *   <li>{0,1} Legend, will render as the chart's legend</li>
 *   <li>{0,n} Series, will render the chart's data series; in general a subclass of Chart will only allow a certain subclass of Series</li>
 * </ul>
 */
jsx3.Class.defineClass("jsx3.chart.Chart", jsx3.vector.Block, [jsx3.xml.Cacheable, jsx3.xml.CDF], function(Chart, Chart_prototype) {

  var vector = jsx3.vector;
  var Fill = vector.Fill;
  var chart = jsx3.chart;
  
  /** @private @jsxobf-clobber @jsxobf-final */
  Chart.ZINDEX_BACKGROUND = 1;
  /** @private @jsxobf-clobber @jsxobf-final */
  Chart.ZINDEX_CONTENT = 2;
  /** @private */
  Chart.ZINDEX_DATA = 10;
  /** @private @jsxobf-clobber @jsxobf-final */
  Chart.ZINDEX_LEGEND = 990;
  /** @private @jsxobf-clobber @jsxobf-final */
  Chart.ZINDEX_TITLE = 1000;
  /** @private @jsxobf-clobber @jsxobf-final */
  Chart.ZINDEX_SERIES = 20;

  /**
   * {Array<jsx3.vector.Fill>} The default fill colors for series and categories whose fills are not specified.
   */
  Chart.DEFAULT_FILLS = [
    new Fill(0x3399CC, 1),
    new Fill(0xFFCC00, 1),
    new Fill(0x99CC66, 1),
    new Fill(0xCC9933, 1),
    new Fill(0xCCCCCC, 1),
    new Fill(0xCC3366, 1),
    new Fill(0xFF99FF, 1),
    new Fill(0x666666, 1)
  ];

  /**
   * Default stroke cache.
   * @package
   */
  Chart.DEFAULT_STROKES = [];

  Chart.PART_LEGEND = 1 << 0;

  /** @private @jsxobf-clobber */
  Chart._QUADRANTS = {top: 1, right: 1, bottom: 1, left: 1};
  
  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   * @param left {int} left position (in pixels) of the chart relative to its parent container
   * @param top {int} top position (in pixels) of the chart relative to its parent container
   * @param width {int} width (in pixels) of the chart
   * @param height {int} height (in pixels) of the chart
   */
  Chart_prototype.init = function(name, left, top, width, height) {
    //call constructor for super class
    this.jsxsuper(name);
    this.setDimensions(left, top, width, height);

    this.titlePlacement = chart.QTOP;
    this.legendPlacement = chart.QRIGHT;
  
    // style properties
    this.dataPadding = 10;
    this.borderColor = "#999999";
    this.borderWidth = 1;
    this.borderAlpha = 1;
    this.alpha = 1;
    this.setRelativePosition(jsx3.gui.Block.RELATIVE);
  };
  
  /**
   * Returns the titlePlacement field, the quadrant in which to place the title.
   * @return {String} titlePlacement, one of {'top','right','bottom','left'}
   */
  Chart_prototype.getTitlePlacement = function() {
    return this.titlePlacement;
  };

  /**
   * Sets the titlePlacement field.
   * @param titlePlacement {String} the new value for titlePlacement, one of {'top','right','bottom','left'}
   */
  Chart_prototype.setTitlePlacement = function( titlePlacement ) {
    if (Chart._QUADRANTS[titlePlacement]) {
      this.titlePlacement = titlePlacement;
    } else {
      throw new jsx3.IllegalArgumentException("titlePlacement", titlePlacement);
    }
  };

  /**
   * Returns the legendPlacement field, the quadrant in which to place the legend.
   * @return {String} legendPlacement, one of {'top','right','bottom','left'}
   */
  Chart_prototype.getLegendPlacement = function() {
    return this.legendPlacement;
  };

  /**
   * Sets the legendPlacement field.
   * @param legendPlacement {String} the new value for legendPlacement, one of {'top','right','bottom','left'}
   */
  Chart_prototype.setLegendPlacement = function( legendPlacement ) {
    if (Chart._QUADRANTS[legendPlacement]) {
      this.legendPlacement = legendPlacement;
    } else {
      throw new jsx3.IllegalArgumentException("legendPlacement", legendPlacement);
    }
  };

  /**
   * Returns the dataPadding field, the CSS padding value that determines the padding around the data area, ie "10" or "5 0 5 0".
   * @return {String} dataPadding
   */
  Chart_prototype.getDataPadding = function() {
    return this.dataPadding;
  };

  /**
   * Sets the dataPadding field.
   * @param dataPadding {String} the new value for dataPadding
   */
  Chart_prototype.setDataPadding = function( dataPadding ) {
    this.dataPadding = dataPadding;
  };

  /**
   * Returns the borderColor field, the RGB color to render the chart's border.
   * @return {string/number} borderColor
   */
  Chart_prototype.getBorderColor = function() {
    return this.borderColor;
  };

  /**
   * Sets the borderColor field.
   * @param borderColor {string/number} the new value for borderColor
   */
  Chart_prototype.setBorderColor = function( borderColor ) {
    this.borderColor = borderColor;
  };

  /**
   * Returns the borderWidth field, the pixel width of the chart's border.
   * @return {int} borderWidth
   */
  Chart_prototype.getBorderWidth = function() {
    return this.borderWidth;
  };

  /**
   * Sets the borderWidth field.
   * @param borderWidth {int} the new value for borderWidth
   */
  Chart_prototype.setBorderWidth = function( borderWidth ) {
    this.borderWidth = borderWidth;
  };

  /**
   * Returns the borderAlpha field, the opacity to render the chart's border.
   * @return {float} borderAlpha
   */
  Chart_prototype.getBorderAlpha = function() {
    return this.borderAlpha;
  };

  /**
   * Sets the borderAlpha field.
   * @param borderAlpha {float} the new value for borderAlpha
   */
  Chart_prototype.setBorderAlpha = function( borderAlpha ) {
    this.borderAlpha = borderAlpha;
  };

  /**
   * Returns the alpha field, the opacity to render the chart's background.
   * @return {float} alpha
   */
  Chart_prototype.getAlpha = function() {
    return this.alpha;
  };

  /**
   * Sets the alpha field.
   * @param alpha {float} the new value for alpha
   */
  Chart_prototype.setAlpha = function( alpha ) {
    this.alpha = alpha != null ? vector.constrainAlpha(alpha) : null;
  };

  /**
   * This class determines the layout of title, legend, and data area of the chart during updateView(). At the end it creates a VectorGroup that should form the render root for subclass of Chart since they are only charged with rendering the data area of the chart. 
   * @return {jsx3.vector.Group}
   * @package
   */
  Chart_prototype.getDataCanvas = function() {
    return this._jsxdc;
  };
  
  /**
   * Returns the dataProvider field, an array of <record> XML nodes.
   * @return {Array<jsx3.xml.Entity>} dataProvider
   * @package
   */
  Chart_prototype.getDataProvider = function() {
    return this._jsxdp;
  };
  
  /**
   * update the cached data provider from an XML document
   * @param xml {jsx3.xml.Entity} the <records> document
   * @private
   * @jsxobf-clobber
   */
  Chart_prototype._updateDataProvider = function(xml) {
    if (xml != null) {
      this._jsxdp = xml.selectNodes("/data/record").toArray();
    } else {
      delete this._jsxdp;
    }
  };

  /**
   * Returns the list of Series children.
   * @return {Array<jsx3.chart.Series>}
   */
  Chart_prototype.getSeries = function() {
    return this.getDescendantsOfType(chart.Series);
  };

  /**
   * Returns the list of Series children whose display is not 'none'.
   * @return {Array<jsx3.chart.Series>}
   * @package
   */
  Chart_prototype.getDisplayedSeries = function() {
    return this.findDescendants(function(x){ 
        return (x instanceof chart.Series) && x.getDisplay() != jsx3.gui.Block.DISPLAYNONE; }, 
        false, true, false, false);
  };
  
  /**
   * Returns the index of a series in the list of series children.
   * @param s {jsx3.chart.Series} 
   * @return {int} the index or -1 if not found
   */
  Chart_prototype.getSeriesIndex = function( s ) {
    var series = this.getSeries();
    for (var i = 0; i < series.length; i++) {
      if (s == series[i]) 
        return i;
    }
    return -1;
  };

  /**
   * Find the first jsx3.chart.ChartLabel child
   * @return {jsx3.chart.ChartLabel}
   */
  Chart_prototype.getChartTitle = function() {
    return chart.ChartLabel ? this.getFirstChildOfType(chart.ChartLabel) : null;
  };

  /**
   * Find the first Legend child
   * @return {jsx3.chart.Legend}
   */
  Chart_prototype.getLegend = function() {
    return chart.Legend ? this.getFirstChildOfType(chart.Legend) : null;
  };

  /**
   * in general series are rendered in order and have increasing z-index values; this method may be overridden to render series in reverse order to have decreasing z-index values
   * @return {boolean} false
   * @package
   */
  Chart_prototype.seriesZOrderReversed = function() {
    return false;
  };

  /**
   * whether series is allowed to be a series in this type of chart
   * @param series {jsx3.chart.Series} candidate series
   * @return {boolean}
   * @package
   */
  Chart_prototype.isValidSeries = jsx3.Method.newAbstract('series');
  
  /**
   * in general the chart legend renders one entry for every series in the chart, override this method to show categories in the legend
   * @return {int} <code>jsx3.chart.Legend.SHOW_SERIES</code>
   */
  Chart_prototype.getLegendEntryType = function() {
    jsx3.require("jsx3.chart.Legend");
    return chart.Legend.SHOW_SERIES;
  };
  
  /**
   * calculates the sum of values for each category over all series; sum is actually the sum of the absolute value of each value since that is what is useful to stacked100 charts
   * @param series {Array<jsx3.chart.Series>} all series
   * @param functName {String} the function on each series that returns the value to sum
   * @return {Array} an array with length equal to the length of the data provider
   * @package
   */
  Chart_prototype.getCategoryTotals = function(series, functName) {
    var dp = this.getDataProvider();
    if (dp == null) return null;
    
    var totals = new Array(dp.length);
    
    for (var i = 0; i < dp.length; i++) {
      totals[i] = 0;
      for (var j = 0; j < series.length; j++) {
        var value = series[j][functName](dp[i]);
        if (value != null)
          totals[i] += Math.abs(value);
      }
    }
    
    return totals;
  };
  
  /**
   * calculates the sum of values for each series over all categories; sum is actually the sum of the absolute value of each value since that is what is useful to stacked100 charts
   * @param series {Array<jsx3.chart.Series>} all series
   * @param functName {String} the function on each series that returns the value to sum
   * @param positiveOnly {boolean} if true then ignore any values less that 0; useful for pie charts
   * @return {Array} an array with length equal to the number of series
   * @package
   */
  Chart_prototype.getSeriesTotals = function(series, functName, positiveOnly) {
    var dp = this.getDataProvider();
    if (dp == null) return null;
    
    var totals = new Array(series.length);
    
    for (var i = 0; i < series.length; i++) {
      totals[i] = 0;
      for (var j = 0; j < dp.length; j++) {
        var value = series[i][functName](dp[j]);
        if (value != null && (value >= 0 || !positiveOnly))
          totals[i] += Math.abs(value);
      }
    }
    
    return totals;
  };
  
  Chart_prototype.createCanvas = function() {
    return new jsx3.vector.Canvas();
  };
    
  /**
   * Renders all vector elements and appends them to the render root, prepares the dataCanvas for subclasses of Chart.
   * @package
   */
  Chart_prototype.createVector = function() {
    var root = this.jsxsuper();

    var left = root.getLeft();
    var top = root.getTop();
    var width = root.getWidth();
    var height = root.getHeight();
    
    // update the data provider from the xml
    var xml = this.getXML();
    this._updateDataProvider(xml);
    
    // update background size and stroke/fill
    var bg = new vector.Rectangle(0, 0, width, height);
    root.appendChild(bg);
    bg.setZIndex(Chart.ZINDEX_BACKGROUND);
    chart.copyBackgroundToFill(this, bg);
    chart.copyBorderToStroke(this, bg);
    
    // update content size (the total size minus the border and padding size)
    var padding = jsx3.html.BlockTag.getDimensionsFromCss(this.getPadding());
    var borderWidth = this.borderWidth != null ? this.borderWidth : 1;
    width = width - padding[1] - padding[3] - 2 * borderWidth;
    height = height - padding[0] - padding[2] - 2 * borderWidth;
    
    // create root for legend, title, and dataCanvas
    var contentCanvas = new vector.Group(padding[3]+borderWidth, padding[0]+borderWidth, width, height);
    root.appendChild(contentCanvas);
    contentCanvas.setZIndex(Chart.ZINDEX_CONTENT);

    // render title
    var chartTitle = this.getChartTitle();
    if (chartTitle != null && chartTitle.getDisplay() != jsx3.gui.Block.DISPLAYNONE) {
      var boxes = chart.splitBox(0, 0, width, height, this.titlePlacement,
        chartTitle.getPreferredWidth(), chartTitle.getPreferredHeight());
      chartTitle.setDimensions(boxes[0][0], boxes[0][1], boxes[0][2], boxes[0][3]);
      chartTitle.setZIndex(Chart.ZINDEX_TITLE);

      chartTitle.updateView();
      contentCanvas.appendChild(chartTitle.getCanvas());
      
      top = boxes[1][0];
      left = boxes[1][1];
      width = boxes[1][2];
      height = boxes[1][3];
    } else {
      top = 0;
      left = 0;
    }
    
    // create the data canvas for subclasses of Chart to use as their root
    var dataCanvas = new vector.Group();
    this._jsxdc = dataCanvas;
    contentCanvas.appendChild(dataCanvas);
    
    // render legend
    var legend = this.getLegend();
    if (legend != null && legend.getDisplay() != jsx3.gui.Block.DISPLAYNONE) {
      var boxes = chart.splitBox(top, left, width, height, this.legendPlacement,
        legend.getPreferredWidth(), legend.getPreferredHeight());
      legend.setDimensions(boxes[0][0], boxes[0][1], boxes[0][2], boxes[0][3]);
      legend.setZIndex(Chart.ZINDEX_LEGEND);
      
      legend.updateView();
      contentCanvas.appendChild(legend.getCanvas());
    
      dataCanvas.setDimensions(boxes[1][0], boxes[1][1], boxes[1][2], boxes[1][3]);
    } else {
      dataCanvas.setDimensions(top, left, width, height);
    }
    
    var canPad = jsx3.html.BlockTag.getDimensionsFromCss(this.dataPadding);
    var dim = dataCanvas.getDimensions();
    dataCanvas.setDimensions(dim[0] + canPad[3], dim[1] + canPad[0], 
        dim[2] - canPad[1] - canPad[3], dim[3] - canPad[0] - canPad[2]);

    // model event hooks:
    chart.setEventProperties(this);
        
    // set z-index of each series
    var series = this.getDisplayedSeries();
    for (var i = 0; i < series.length; i++) {
      var offset = this.seriesZOrderReversed() ? series.length - i : i;
      series[i].setZIndex(Chart.ZINDEX_SERIES + offset);
    }

    return root;
  };

  Chart_prototype.updateVector = function(objVector) {
    return false;
  };

  /**
   * the beginning of a more efficient repaint method
   * @param mask {int} a bit mask that determines which sub parts of the chart are repainted
   * @package
   */
  Chart_prototype.repaintParts = function( mask ) {
    if (mask & Chart.PART_LEGEND) {
      var legend = this.getLegend();
      if (legend != null) legend.repaint();
    }
  };
  
  /**
   * enforce only one Legend, only one jsx3.chart.ChartLabel, and only allowed Series
   * @package
   */
  Chart_prototype.onSetChild = function( child ) {
    if (chart.Legend && child instanceof chart.Legend) {
      if (this.getLegend() != null) {
        chart.LOG.info("can't add legend " + child + " because chart already has a legend");
        return false;
      }
    } else if (chart.ChartLabel && child instanceof chart.ChartLabel) {
      if (this.getChartTitle() != null) {
        chart.LOG.info("can't add title " + child + " because chart already has a title");
        return false;
      }
    } else if (chart.Series && child instanceof chart.Series) {
      if (! this.isValidSeries(child)) {
        chart.LOG.info("can't add series " + child + " because it isn't of valid type for " + this);
        return false;
      }
    } else {
      return false;
    }
    
    return true;
  };
  
  /**
   * Note that this method is very expensive because it causes the entire chart to be redrawn. It is recommended that
   * the methods in the CDF interface which cause this method to be called, be passed bRedraw=false to prevent this
   * method from being called.
   */
  Chart_prototype.redrawRecord = function() {
    this.repaint();
  };

  Chart_prototype.onXmlBinding = function(objEvent) {
    this.jsxsupermix(objEvent);
    this.repaint();
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  Chart.getVersion = function() {
    return chart.VERSION;
  };

/* @JSC :: end */

});
