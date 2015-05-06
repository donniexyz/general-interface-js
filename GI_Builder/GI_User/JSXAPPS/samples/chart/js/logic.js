/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Licensed under TIBCO BSD license, see license.txt under directory samples/
 */

/**
 * Package defining the logic of sample application chart.
 */
jsx3.Package.definePackage("eg.chart", function(chart) {

  /**
   * {Array<String>} the first letters of the days of the week, Sunday to Saturday.
   */
  chart.DAYS = ['S','M','T','W','R','F','S'];
  
  /**
   * Returns the first letter of the day of week of a date in May 2005.
   * @param x {int} a day (0-31) in May 2005.
   * @return {String}
   */
  chart.dayOfWeek = function(x) {
    var date = new Date(2005,4,x);
    var day = date.getUTCDay();
    return chart.DAYS[day];
  };
  
  /**
   * Formats a number as a dollar amount.
   * @param x {Number} the floating point dollar amount.
   * @return {String} the formatted dollar, <code>$d.dd</code>.
   */
  chart.dollarAmount = function(x) {
    if (x == 0) return "";
    var nudge = (x + 0.0001).toString();
    var index = nudge.indexOf(".");
    return "$" + nudge.substring(0, index+3);
  };
  
  /**
   * A series coloring function that uses the color attribute of a CDF record to create an RGB color.
   * @param record {jsx3.xml.Entity} the CDF record.
   * @param intIndex {int}
   * @return {jsx3.vector.Fill}
   */
  chart.pieColoring = function(record, intIndex) { 
    return new jsx3.vector.Fill(record.getAttribute('color'));
  };
  
  /**
   * Model event handler, fills in the data in the minorCategory chart depending on what was clicked in the
   * majorCategory chart.
   * @param objChart {jsx3.chart.Chart} the majorCategory chart (target of the model event).
   * @param strRecordId {String} the record id of the clicked record.
   */
  chart.doDrillDown = function(objChart, strRecordId) {
    if (strRecordId == null) return;
    
    var objMinorChart = objChart.getServer().getJSXByName('minorCategories');
    objMinorChart.clearXmlData();
  
    var objNode = objChart.getRecordNode(strRecordId);
    for (var i = objNode.getChildNodes().iterator(); i.hasNext(); )
      objMinorChart.insertRecordNode(i.next().cloneNode(), 'jsxroot', false);

    objMinorChart.repaint();
  };
  
  /**
   * Model event handler, creates a spy glass span for a pie slice in either the majorCategory or
   * minorCategory charts.
   * @param objChart {jsx3.chart.Chart} the chart that was spied.
   * @param strRecordId {String} the record id of the spied record.
   */
  chart.pieSpy = function(objChart, strRecordId) {
    var objNode = objChart.getRecordNode(strRecordId);
    var siblings = objNode.getParent().getChildNodes();
    
    var sum = 0;
    for (var i = siblings.iterator(); i.hasNext(); ) {
      sum += parseFloat(i.next().getAttribute('jsxvalue'));
    }
    
    return "<b>" + objNode.getAttribute('jsxtext') + "</b>: " + 
        parseFloat(jsx3.util.numRound(100 * objNode.getAttribute('jsxvalue') / sum, 0.1).toString().substring(0,5)) + "%";
  };
  
  /**
   * Model event handler, creates a spy glass span for a legend entry in either the majorCategory or
   * minorCategory charts.
   * @param objChart {jsx3.chart.Chart} the chart containing the legend that was spied.
   * @param strRecordId {String} the record id of the spied record.
   */
  chart.legendSpy = function(objChart, strRecordId) {
    if (strRecordId == null) return;
    
    var objNode = objChart.getRecordNode(strRecordId);
    var strHTML = "Including: ";
    
    for (var i = objNode.getChildIterator(); i.hasNext(); ) {
      var child = i.next();
      strHTML += "<b><span style='color:" + child.getAttribute('color') + ";'>" + child.getAttribute('jsxtext') + "</span></b>";
      if (i.hasNext()) strHTML += ", ";
    }

    return strHTML;
  };

  /**
   * A series coloring function that creates a color between yellow and red and a opacity between 0 and 100 
   * based on the x and y attributes.
   * @param record {jsx3.xml.Entity} the CDF record.
   * @param intIndex {int}
   * @return {jsx3.vector.Fill}
   */
  chart.pointColoring = function(record, intIndex) {
    var parentRecord = record.getParent();
    var xratio = record.getAttribute('x') / parentRecord.getAttribute('xmax');
    var yratio = record.getAttribute('y') / parentRecord.getAttribute('ymax');
    var rgb = (255 << 16) + (Math.round(255 * (1 - yratio)) << 8);

    // the undocumented signature of the constructor of jsx3.vector.Fill is:
    //   init( rgb : {int|String}, opacity : Number[0.0-1.0] )
    return new jsx3.vector.Fill(rgb, xratio);
  };
  
  /**
   * Model event handler, changes the point renderer of the target data series when the point renderer selection
   * menu executes.
   * @param objChart {jsx3.gui.Menu} the point renderer selection menu.
   * @param strRecordId {String} the record id of the executed record, the name of the static field of PointRenderer
   *    to use as a point renderer.
   */
  chart.pointTypeSelect = function(objMenu, strRecordId) {
    var objSeries = objMenu.getContextParent();
    var objChart = objSeries.getChart();
    objSeries.setRenderer("jsx3.chart.PointRenderer." + strRecordId);
    objSeries.repaint();
    objChart.getLegend().repaint(); // repaint legend because legend uses the point renderer
    objMenu.selectItem(strRecordId, true); // so the executed record will show up as selected next time the menu shows
  };

  /**
   * Clear work area
   *
   * @param workArea {jsx3.app.Model} the JSX object to be cleared.
   * @param objJSX {jsx3.app.Server}  (target of the model event).
   */
  chart.clearWorkArea = function(objJSX) {
       objJSX.getServer().getJSXByName("workArea").removeChildren();
  };

 /**                                       
  * Launches stock price chart. 
  * @param objJSX {jsx3.app.Model} target of the model event.
  */
  chart.launchStockPrice = function(objJSX) {
    chart.clearWorkArea(objJSX);
    objJSX.getServer().getJSXByName("workArea").load("components/stockPrice.xml");  
  };

 /**                                       
  * Launches a event chart.
  * @param objJSX {jsx3.app.Model} target of the model event.
  */
 chart.launchChartEvent = function(objJSX) {
    chart.clearWorkArea(objJSX);
    objJSX.getServer().getJSXByName("workArea").load("components/chartEvents.xml");  
  };

 /**                                       
  * Launches bubble chart.
  * @param objJSX {jsx3.app.Model} target of the model event.
  */
  chart.launchBubble = function(objJSX) {
    chart.clearWorkArea(objJSX);
    objJSX.getServer().getJSXByName("workArea").load("components/pointColoring.xml");  
  };
  
});
