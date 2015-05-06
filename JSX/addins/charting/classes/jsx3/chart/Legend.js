/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.chart.ChartComponent", "jsx3.chart.PointRenderer");

/**
 * Chart component that renders a simple legend. A legend may contain a list of series or a list of
 * categories, depending on the type of chart. 
 */
jsx3.Class.defineClass("jsx3.chart.Legend", jsx3.chart.ChartComponent, null, function(Legend, Legend_prototype) {
  
  var vector = jsx3.vector;
  var chart = jsx3.chart;
  
  /**
   * {int} the default width
   */
  Legend.DEFAULT_WIDTH = 100;

  /**
   * {int} the default height
   */
  Legend.DEFAULT_HEIGHT = 100;

  /** @private @jsxobf-clobber @jsxobf-final */
  Legend._ZINDEX_BG = 1;
  /** @private @jsxobf-clobber @jsxobf-final */
  Legend._ZINDEX_TITLE = 3;
  /** @private @jsxobf-clobber @jsxobf-final */
  Legend._ZINDEX_CONTENT = 2;

  /**
   * Value that jsx3.chart.Chart.getLegendEntryType() may return to indicate that series should be displayed in the legend.
   * @package
   * @final @jsxobf-final
   */
  Legend.SHOW_SERIES = 1;

  /**
   * Value that jsx3.chart.Chart.getLegendEntryType() may return to indicate that categories should be displayed in the legend. Chart must implement these methods if it returns this value: getSeriesStroke(), getFillForIndex(), getCategoryField()
   * @package
   * @final @jsxobf-final
   */
  Legend.SHOW_CATEGORIES = 2;

  /** @private @jsxobf-clobber @jsxobf-final */
  Legend._TITLE_SPACE = 8;
  /** @private @jsxobf-clobber @jsxobf-final */
  Legend._BOX_SPACE = 6;
  
  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   */
  Legend_prototype.init = function(name) {
    //call constructor for super class
    this.jsxsuper(name);

    this.boxHeight = 10; // the diameter of a color box
    this.lineHeight = 22; // the line height of each entry
    
    this.labelClass = null;
    this.labelStyle = null;
    this.backgroundFill = null;
    this.backgroundStroke = null;
    this.preferredWidth = null;
    this.preferredHeight = null;
  
    // margin is the space between the container and the border
    this.setMargin("10 10 10 4");
    // padding is the space between the border and the content
    this.setPadding("4 4 0 4");
  };
  
  /**
   * Returns the boxHeight field, the diameter of the box that shows the fill of each series or category.
   * @return {int} boxHeight
   */
  Legend_prototype.getBoxHeight = function() {
    return this.boxHeight;
  };

  /**
   * Sets the boxHeight field.
   * @param boxHeight {int} the new value for boxHeight
   */
  Legend_prototype.setBoxHeight = function( boxHeight ) {
    this.boxHeight = boxHeight;
  };

  /**
   * Returns the lineHeight field, the vertical space taken for each legend entry.
   * @return {int} lineHeight
   */
  Legend_prototype.getLineHeight = function() {
    return this.lineHeight;
  };

  /**
   * Sets the lineHeight field.
   * @param lineHeight {int} the new value for lineHeight
   */
  Legend_prototype.setLineHeight = function( lineHeight ) {
    this.lineHeight = lineHeight;
  };

  /**
   * Returns the labelClass field, the CSS class name applied to the name of each series or category.
   * @return {String} labelClass
   */
  Legend_prototype.getLabelClass = function() {
    return this.labelClass;
  };

  /**
   * Sets the labelClass field.
   * @param labelClass {String} the new value for labelClass
   */
  Legend_prototype.setLabelClass = function( labelClass ) {
    this.labelClass = labelClass;
  };

  /**
   * Returns the labelStyle field, a CSS style attribute applied to the name of each series or category, ie "font-family: Arial; font-size: 10px;".
   * @return {String} labelStyle
   */
  Legend_prototype.getLabelStyle = function() {
    return this.labelStyle;
  };

  /**
   * Sets the labelStyle field.
   * @param labelStyle {String} the new value for labelStyle
   */
  Legend_prototype.setLabelStyle = function( labelStyle ) {
    this.labelStyle = labelStyle;
  };

  /**
   * Returns the backgroundFill field, a string representation of the vector fill used to color in the background of the legend.
   * @return {String} backgroundFill
   */
  Legend_prototype.getBackgroundFill = function() {
    return this.backgroundFill;
  };

  /**
   * Sets the backgroundFill field.
   * @param backgroundFill {String} the new value for backgroundFill
   */
  Legend_prototype.setBackgroundFill = function( backgroundFill ) {
    this.backgroundFill = backgroundFill;
  };

  /**
   * Returns the backgroundStroke field, a string representation of the VectorStroke used to outline the legend.
   * @return {String} backgroundStroke
   */
  Legend_prototype.getBackgroundStroke = function() {
    return this.backgroundStroke;
  };

  /**
   * Sets the backgroundStroke field.
   * @param backgroundStroke {String} the new value for backgroundStroke
   */
  Legend_prototype.setBackgroundStroke = function( backgroundStroke ) {
    this.backgroundStroke = backgroundStroke;
  };

  /**
   * Returns the preferredWidth field, the width that this component would like to have, though its true size is dictated by the container component.
   * @return {int} preferredWidth
   */
  Legend_prototype.getPreferredWidth = function() {
    return this.preferredWidth != null ? this.preferredWidth : Legend.DEFAULT_WIDTH;
  };

  /**
   * Sets the preferredWidth field.
   * @param preferredWidth {int} the new value for preferredWidth
   */
  Legend_prototype.setPreferredWidth = function( preferredWidth ) {
    this.preferredWidth = preferredWidth;
  };

  /**
   * Returns the preferredHeight field, the height that this component would like to have, though its true size is dictated by the container component.
   * @return {int} preferredHeight
   */
  Legend_prototype.getPreferredHeight = function() {
    return this.preferredHeight != null ? this.preferredHeight : Legend.DEFAULT_HEIGHT;
  };

  /**
   * Sets the preferredHeight field.
   * @param preferredHeight {int} the new value for preferredHeight
   */
  Legend_prototype.setPreferredHeight = function( preferredHeight ) {
    this.preferredHeight = preferredHeight;
  };

  /**
   * Renders all vector elements and appends them to the render root.
   * @package
   */
  Legend_prototype.updateView = function() {
    this.jsxsuper();
    var root = this.getCanvas();
    
    // model event hooks:
    this.setEventProperties();
            
    var myChart = this.getChart();
    var entryType = myChart.getLegendEntryType();
    
    // determine the number of entries, either series or categories
    var numEntries = 0;
    if (entryType == Legend.SHOW_SERIES) {
      numEntries = myChart.getDisplayedSeries().length;
    } else if (entryType == Legend.SHOW_CATEGORIES) {
      var dp = myChart.getDataProvider();
      if (dp != null)
        numEntries = dp.length;
    }
    
    var title = this.getLegendTitle();
    var titleHeight = (title != null && title.getDisplay() != jsx3.gui.Block.DISPLAYNONE) ?
        title.getPreferredHeight() + Legend._TITLE_SPACE : 0;
    
    // figure out main padding and margins
    var margins = jsx3.html.BlockTag.getDimensionsFromCss(this.getMargin());
    var padding = jsx3.html.BlockTag.getDimensionsFromCss(this.getPadding());
    var w = this.getWidth() - margins[1] - margins[3];
    var h = Math.min(this.getHeight() - margins[0] - margins[2], 
        titleHeight + this.lineHeight * numEntries + padding[0] + padding[2]);
    var l = margins[3];
    var t = Math.max(margins[0], Math.round((this.getHeight() - h)/2));

    var contentsView = new vector.Group(l, t, w, h);
    root.appendChild(contentsView);
    contentsView.setZIndex(Legend._ZINDEX_CONTENT);
    
    // paint the background
    if (this.backgroundFill || this.backgroundStroke) {
      // only if entries or title to display
      if (numEntries > 0 || (title != null && title.getDisplay() != jsx3.gui.Block.DISPLAYNONE)) {
        var bgRect = new vector.Rectangle(l, t, w, h);
        bgRect.setZIndex(Legend._ZINDEX_BG);
        root.appendChild(bgRect);
  
        var fill = vector.Fill.valueOf(this.backgroundFill);
        var stroke = vector.Stroke.valueOf(this.backgroundStroke);
        bgRect.setFill(fill);
        bgRect.setStroke(stroke);
      }
    }
    
    var top = t + padding[0];
    var insideW = w - padding[1] - padding[3];
    
    // paint the title
    if (title != null && title.getDisplay() != jsx3.gui.Block.DISPLAYNONE) {
      title.setDimensions(l + padding[3], top, insideW, title.getPreferredHeight());
      title.setZIndex(Legend._ZINDEX_TITLE);
      
      title.updateView();
      root.appendChild(title.getCanvas());
      
      top += titleHeight;
    }
    
    top -= t;
    
    var labelL = l + padding[3] + this.boxHeight + Legend._BOX_SPACE;
    var labelW = insideW - this.boxHeight - Legend._BOX_SPACE;
    
    // paint the entries
    if (entryType == Legend.SHOW_SERIES && numEntries > 0) {
      // the entries are series
      var series = myChart.getDisplayedSeries();
      
      for (var i = 0; i < series.length; i++) {
        series[i].applyDynamicProperties();
        var renderer = series[i].getLegendRenderer();
            
        var x1 = l + padding[3];
        var fill = series[i].getDisplayedFill();
        var stroke = series[i].getDisplayedStroke(fill);
        var shape = renderer.render(x1, top, x1 + this.boxHeight, top + this.boxHeight, 
            fill, stroke);
        shape.setId(this.getId() + "_b" + i);
        contentsView.appendChild(shape);
        
        var box = this._attachTextBox(contentsView, series[i].getSeriesName(), this.labelClass, this.labelStyle,
            labelL, Math.round(top + this.boxHeight/2), labelW);
        top += this.lineHeight;
        
        this.setEventProperties(shape, series[i], null);
        this.setEventProperties(box, series[i], null);
      }
    } else if (entryType == Legend.SHOW_CATEGORIES && numEntries > 0) {
      // the entries are categories
      var dp = myChart.getDataProvider();
      var renderer = chart.PointRenderer.BOX;
      var stroke = vector.Stroke.valueOf(myChart.getSeriesStroke());
      
      for (var i = 0; i < dp.length; i++) {
        var x1 = l + padding[3];
        var fill = myChart.getFillForIndex(dp[i], i);
        var thisStroke = (stroke == null && fill.canInline()) ?
            new vector.Stroke(fill.getColor()) : stroke;
        var shape = renderer.render(x1, top, x1 + this.boxHeight, top + this.boxHeight, 
            fill, thisStroke);
        shape.setId(this.getId() + "_b" + i);
        contentsView.appendChild(shape);
        
        var nameField = myChart.getCategoryField();
        var name = nameField ? dp[i].getAttribute(nameField) : "";
        
        var box = this._attachTextBox(contentsView, name, this.labelClass, this.labelStyle,
            labelL, Math.round(top + this.boxHeight/2), labelW);
        top += this.lineHeight;

        this.setEventProperties(shape, null, i);
        this.setEventProperties(box, null, i);
      }      
    }
  };
  
  /**
   * updateView helper, renders a text box
   * @param group {jsx3.vector.Group} 
   * @param text {String} 
   * @param cssClass {String} 
   * @param cssStyle {String} 
   * @param left {int} 
   * @param top {int} 
   * @param width {int} 
   * @private
   * @jsxobf-clobber
   */
  Legend_prototype._attachTextBox = function( group, text, cssClass, cssStyle, left, top, width) {
    var textBox = new vector.TextLine(left, top, width, top, text);
    
    textBox.setClassName(cssClass);
    textBox.setExtraStyles(cssStyle);
    if (!textBox.getTextAlign())
      textBox.setTextAlign("left");
    
    group.appendChild(textBox);
    return textBox;
  };

  /**
   * Find the first jsx3.chart.ChartLabel child
   * @return {jsx3.chart.ChartLabel}
   */
  Legend_prototype.getLegendTitle = function() {
    return chart.ChartLabel ? this.getFirstChildOfType(chart.ChartLabel) : null;
  };

  /**
   * Allow one jsx3.chart.ChartLabel child.
   * @package
   */
  Legend_prototype.onSetChild = function(child) {
    return (chart.ChartLabel && child instanceof chart.ChartLabel) && this.getLegendTitle() == null;
  };

  Legend_prototype.onSetParent = function(objParent) {
    return chart.Chart && objParent instanceof chart.Chart;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  Legend.getVersion = function() {
    return chart.VERSION;
  };

/* @JSC :: end */

  Legend_prototype.setEventProperties = function(objTag, objSeries, intIndex) {
    if (objTag == null) 
      objTag = this.getCanvas();
    
    if (objSeries != null)
      objTag.setProperty("seriesId", objSeries.getId());
    if (intIndex != null)
      objTag.setProperty("recordIndex", intIndex);
    
    this.jsxsuper(objTag);
  };

  Legend_prototype._ebClick = function(objEvent, objGUI) {
    var strSeriesId = objGUI.getAttribute("seriesId");
    var intRecordIndex = objGUI.getAttribute("recordIndex");    
    this.doEvent(jsx3.gui.Interactive.SELECT, this._getEventContext(objEvent, strSeriesId, intRecordIndex));
  };
    
  Legend_prototype._ebDoubleClick = function(objEvent, objGUI) {
    var strSeriesId = objGUI.getAttribute("seriesId");
    var intRecordIndex = objGUI.getAttribute("recordIndex");    
    this.doEvent(jsx3.gui.Interactive.EXECUTE, this._getEventContext(objEvent, strSeriesId, intRecordIndex));
  };

  Legend_prototype.doSpyOver = function(objEvent, objGUI) {
    var strSeriesId = objGUI.getAttribute("seriesId");
    var intRecordIndex = objGUI.getAttribute("recordIndex");    
    // this calls doSpyOver in Event
    this.jsxsupermix(objEvent, objGUI, this._getEventContext(objEvent, strSeriesId, intRecordIndex));
  };

  Legend_prototype._ebMouseUp = function(objEvent, objGUI) {
    var strSeriesId = objGUI.getAttribute("seriesId");
    var intRecordIndex = objGUI.getAttribute("recordIndex");
    var strMenu;
    if (objEvent.rightButton() && (strMenu = this.getMenu()) != null) {
      var objMenu = this.getServer().getJSXByName(strMenu);
      if (objMenu != null) {
        var objContext = this._getEventContext(objEvent, strSeriesId, intRecordIndex);
        objContext.objMENU = objMenu;
        var vntResult = this.doEvent(jsx3.gui.Interactive.MENU, objContext);
        if (vntResult !== false) {
          if (vntResult instanceof Object && vntResult.objMENU instanceof jsx3.gui.Menu)
            objMenu = vntResult.objMENU;
          objMenu.showContextMenu(objEvent, this);
        }
      }
    }
  };

  /** @private @jsxobf-clobber */
  Legend_prototype._getEventContext = function(objEvent, strSeriesId, intRecordIndex) {
    var context = {objEVENT:objEvent};
    context.objSERIES = strSeriesId != null ? 
        this.getServer().getJSXById(strSeriesId) : null;
        
    if (intRecordIndex != null) {
      context.intINDEX = intRecordIndex;
      var node = this.getChart().getDataProvider()[intRecordIndex];
      context.strRECORDID = node ? node.getAttribute('jsxid') : null;
    } else {
      context.intINDEX = context.strRECORDID = null;
    }
    
    return context;
  };
  
});
