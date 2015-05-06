/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Block");

/**
 * A base class for every logical component of a chart. A chart component exists in the DOM tree and 
 * is selectable with ctrl-click in a component editor in General Interface Builder.
 */
jsx3.Class.defineClass("jsx3.chart.ChartComponent", jsx3.gui.Block, null, function(ChartComponent, ChartComponent_prototype) {

  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;
  var vector = jsx3.vector;
  var chart = jsx3.chart;
  
  ChartComponent.MASK_PROPS_NOEDIT = {NN: false, SS: false, EE: false, WW: false, MM: false};

  /**
   * The instance initializer.
   * @param name {String} the GI name of the instance
   */
  ChartComponent_prototype.init = function(name) {
    //call constructor for super class
    this.jsxsuper(name);
    
    /* @jsxobf-clobber */
    this.trans = null;
  };
  
  /**
   * Returns the chart of which this component is a part.
   * @return {jsx3.chart.Chart} this if this is a chart, or the first ancestor that is a chart
   */
  ChartComponent_prototype.getChart = function() {
    return this.findAncestor(function(x){return chart.Chart && x instanceof chart.Chart;}, true);
  };
  
  /**
   * Override to clear out transient object references.
   * @package
   */
  ChartComponent_prototype.doClone = function(objCloneParent) {
    this.trans = null;
    return this.jsxsuper(objCloneParent);
  };

  /**
   * This class defines the idiom in which all chart components are painted. Each component has a render
   * root, which is a VectorGroup. During the updateView() method, the component should add to the root
   * the vector paint helpers that are necessary to render the component. The component should assume that
   * the render root has been cleared before each call to updateView(). updateView() must always call its
   * super method.
   * <p/>
   * refreshes the render root and copies some basic HTML attributes and CSS styles from the component into the render root
   * @package
   */
  ChartComponent_prototype.updateView = function() {
    this.applyDynamicProperties();

    var parent = null, oldroot = this._canvas;
    
    // refresh the render root by release the old one
    if (oldroot != null) {
      // if this render root is attached to a parent, we'll keep track of that and attach the
      // new render root to the old parent
      parent = oldroot.getParent();
    }

    // create the new render root
    /* @jsxobf-clobber */
    var canvas = new vector.Group();

    // copy attributes set in the component into the render root
    canvas.setId(this.getId());
    canvas.setDimensions(this.getDimensions());
    canvas.setZIndex(this.getZIndex());
    canvas.setPosition(this.getRelativePosition() ? "relative" : "absolute");

    // set attributes from jsx3.gui.Painted interface
    var attr = this.getAttributes();
    for (var f in attr)
      canvas.setProperty(f, attr[f]);

    if (oldroot != null)
      oldroot.release();

    // attach new root to old parent
    if (parent != null)
      parent.replaceChild(canvas, oldroot);

    this._canvas = canvas;
  };

  /**
   * Gets the current render root. The current render root is thrown away after each call to updateView() so it is not safe to hold onto it across calls to updateView()
   * @return {jsx3.vector.Group}
   * @package
   */
  ChartComponent_prototype.getCanvas = function() {
    if (this._canvas == null)
      this.updateView();
    return this._canvas;
  };
  
  ChartComponent_prototype.setEventProperties = function(objTag) {
    jsx3.chart.setEventProperties(this, objTag);
  };

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  ChartComponent_prototype.paint = function() {
    if (this._canvas == null)
      this.updateView();
    return this._canvas.paint();
  };

/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {

  ChartComponent_prototype.isDomPaint = function() {
    return true;
  };

  ChartComponent_prototype.paint = function() {
    throw new jsx3.Exception();
  };

  ChartComponent_prototype.paintDom = function() {
    if (this._canvas == null)
      this.updateView();
    return this._canvas.paintDom();
  };

/* @JSC */ }

  ChartComponent_prototype.repaint = function() {
    this.updateView();
    return this.jsxsuper();
  };

  /**
   * store a local field that will never be serialized; uses a separate namespace than normal instance fields
   * @param name {String} the name of the field
   * @param value {Object} the value of the field
   * @package
   */
  ChartComponent_prototype.storeTransient = function( name, value ) {
    // since this.trans is regular javascript object, it won't be serialized
    if (this.trans == null) this.trans = {};
    this.trans[name] = value;
  };

  /**
   * fetches the value of a field set with storeTransient()
   * @param name {String} the name of the field
   * @return {Object} the value of the field
   * @package
   */
  ChartComponent_prototype.fetchTransient = function( name ) {
    return (this.trans != null) ? this.trans[name] : null;
  };

  /**
   * removes a field set with storeTransient()
   * @param name {String} the name of the field
   * @package
   */
  ChartComponent_prototype.clearTransient = function( name ) {
    if (this.trans != null)
      delete this.trans[name];
  };

  ChartComponent_prototype.getMaskProperties = function() {
    return ChartComponent.MASK_PROPS_NOEDIT;
  };

  /**
   * parses the padding field into an array of four int values 
   * @return {Array<int>} [top,right,bottom,left]
   * @package
   */
  ChartComponent_prototype.getPaddingDimensions = function() {
    return jsx3.html.BlockTag.getDimensionsFromCss(this.getPadding());
  };

  ChartComponent_prototype.getCanSpy = function() {
    return true;
  };
  
/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  ChartComponent.getVersion = function() {
    return chart.VERSION;
  };

/* @JSC :: end */

});
