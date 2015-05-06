/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Block");

/**
 * Defines a base class for GUI controls that implement both the cross-platform box profile painting introduced in
 * 3.2 and the cross-platform (VML/SVG) vector painting, also introduced in 3.2.
 * <p/>
 * This class should be extended by custom GUI classes that will display vector elements.
 *
 * @since 3.5
 */
jsx3.Class.defineClass("jsx3.vector.Block", jsx3.gui.Block, null, function(Block, Block_prototype) {

  /**
   * Returns the vector canvas on which this control paints itself. If no canvas has already been created, then
   * <code>createVector()</code> is called to create it.
   * @return {jsx3.vector.Tag}
   */
  Block_prototype.getCanvas = function() {
    if (this._canvas == null)
      this.createVector();
    return this._canvas;
  };

  /**
   * Creates the vector tag tree that will render this GUI control. Subclasses of this class should override this
   * method to specify the manner in which they render.
   * <p/>
   * The basic template for a method overriding this method is:
   * <pre>
   * CustomVector.prototype.createVector = function() {
   *   var objCanvas = this.jsxsuper();
   *   // modify objCanvas, add children, etc.
   *   return objCanvas;
   * };
   * </pre>
   * This method should do the work of creating and updating the vector tree to the state when it is ready to be
   * rendered on screen, but without calling <code>updateVector()</code> directly.
   *
   * @return {jsx3.vector.Tag}
   * @see #updateVector()
   */
  Block_prototype.createVector = function() {
    this.applyDynamicProperties();

    // refresh the render root by release the old one
    var oldroot = this._canvas;

    // create the new render root
    var objVector = this.createCanvas();
    objVector.setId(this.getId());
    objVector.setZIndex(this.getZIndex());
    objVector.setPosition(this.getRelativePosition() ? "relative" : "absolute");

    this._updateVector(objVector);

    // set attributes from jsx3.gui.Painted interface
    var attr = this.getAttributes();
    for (var f in attr)
      objVector.setProperty(f, attr[f]);

    if (oldroot != null)
      oldroot.release();

    /* @jsxobf-clobber */
    this._canvas = objVector;
    return objVector;
  };

  /**
   * Updates the pre-existing vector tree of this control on, for example, a resize or repaint event. Methods
   * overriding this method should return <code>true</code> if the update is successful or <code>false</code> to
   * force the vector tree to be completely recreated with <code>createVector()</code>.
   * <p/>
   * The basic template for a method overriding this method is:
   * <pre>
   * CustomVector.prototype.updateVector = function(objVector) {
   *   this.jsxsuper(objVector);
   *   // modify objCanvas, modify children, etc.
   *   return true;
   * };
   * </pre>
   *
   * @param objVector {jsx3.vector.Tag} the root of the vector render tree.
   * @return {boolean} <code>true</code> if the tree could be updated inline or <code>false</code> if it must be
   *    recreated by calling <code>createVector()</code>.
   * @see #createVector()
   */
  Block_prototype.updateVector = function(objVector) {
    this.applyDynamicProperties();
    this._updateVector(objVector);
    return true;
  };

  /** @private @jsxobf-clobber */
  Block_prototype._updateVector = function(objVector) {
    var box = this.getBoxProfile(true);
    objVector.setLeft(box.getPaintedLeft());
    objVector.setTop(box.getPaintedTop());
    objVector.setWidth(box.getPaintedWidth());
    objVector.setHeight(box.getPaintedHeight());
  };

  /**
   * Instantiates and returns a new instance of <code>jsx3.vector.Canvas</code>. The implementation of
   * <code>createVector()</code> in this class calls this method to create the base vector tag. This method may be
   * overridden to provide a base tag of another type that <code>Canvas</code>.
   * @return {jsx3.vector.Tag}
   */
  Block_prototype.createCanvas = function() {
    return new jsx3.vector.Canvas();
  };

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  /** @package */
  Block_prototype.paint = function() {
    if (this._canvas == null)
      this.createVector();

    return this._canvas.paint();
  };

/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {

  /** @package */
  Block_prototype.isDomPaint = function() {
    return true;
  };

  /** @package */
  Block_prototype.paint = function() {
    throw new jsx3.Exception();
  };

  /** @package */
  Block_prototype.paintDom = function() {
    if (this._canvas == null)
      this.createVector();
    return this._canvas.paintDom();
  };

/* @JSC */ }

/** @package */
  Block_prototype.repaint = function() {
    if (!this._canvas || !this.updateVector(this._canvas))
      this.createVector();
    return this.jsxsuper();
  };

  /**
   * Renders a cross-platform vector event handler. When an event of type <code>strEvtType</code> bubbles up to the
   * HTML element rendered by <code>objElm</code>, the instance method of this object whose name is
   * <code>strMethod</code> will be called with two parameters: the browser event wrapped in an instance of
   * <code>jsx3.gui.Event</code>, and the native <code>HTMLElement</code> that defined the event handler.
   *
   * @param strEvtType {String} the event type, one of <code>jsx3.gui.Event.CLICK</code>, etc.
   * @param strMethod {String} the instance method to call on this object when the event is received.
   * @param objElm {jsx3.vector.Tag} the HTML element to which to add the event handler.
   *
   * @see jsx3.vector#paintEventHandler()
   */
  Block_prototype.paintEventHandler = function(strEvtType, strMethod, objElm) {
    if (objElm == null) objElm = this.getCanvas();
    jsx3.vector.paintEventHandler(this, strEvtType, strMethod, objElm);
  };

  /** @package */
  Block_prototype.createBoxProfile = function(objImplicit) {
    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if (this.getParent() && (objImplicit == null || ((isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if (objImplicit == null) {
      objImplicit = {};
    }

    var bRelative = this.getRelativePosition() != jsx3.gui.Block.ABSOLUTE;
    var myLeft = (bRelative) ? null : this.getLeft();
    var myTop = (bRelative) ? null : this.getTop();

    if (!objImplicit.boxtype) objImplicit.boxtype = (bRelative) ? "relativebox" : "box";
    objImplicit.tagname = "span";
    if (objImplicit.left == null && myLeft != null) objImplicit.left = myLeft;
    if (objImplicit.top == null && myTop != null) objImplicit.top = myTop;
    objImplicit.width = this.getWidth();
    objImplicit.height = this.getHeight();

    return new jsx3.gui.Painted.Box(objImplicit);
  };

  /** @package */
  Block_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    if (objGUI) {
      var b1 = this.getBoxProfile(true, objImplicit);
      var val = b1.recalculate(objImplicit, objGUI, objQueue);
      if (val.w || val.h) this.repaint();
    }
  };

  /** @package */
  Block_prototype.doClone = function(objCloneParent) {
    this._canvas = null;
    return this.jsxsuper(objCloneParent);
  };

  /** @package */
  Block_prototype.getCanSpy = function() {
    return true;
  };

});
