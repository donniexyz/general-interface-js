/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.LayoutGrid", "jsx3.gui.Stack");

/**
 * similar to how a tabbed pane manages a collection of tabs, the stack group is a parent container that manages JSXStack instances
 */
jsx3.Class.defineClass("jsx3.gui.StackGroup", jsx3.gui.LayoutGrid, null, function(StackGroup, StackGroup_prototype) {

  var LayoutGrid = jsx3.gui.LayoutGrid;

  /**
   * {int} 0 : top-over (--) layout (default)
   * @final @jsxobf-final
   */
  StackGroup.ORIENTATIONV = 0;

  /**
   * {int} 1 : side-by-side (|) layout
   * @final @jsxobf-final
   */
  StackGroup.ORIENTATIONH = 1;

/* @JSC :: begin DEP */

  /**
   * {int} 2 (default)
   * @deprecated
   */
  StackGroup.DEFAULTSTACKCOUNT = 2;

  /**
   * {Array<String>} ["27","*"] (default)
   * @deprecated
   */
  StackGroup.DEFAULTDIMENSIONS = ["27","*"];

/* @JSC :: end */

  /**
   * {int} 27 (default)
   */
  StackGroup.DEFAULTBARSIZE = 27;

  /**
   * The instance initializer.
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   */
  StackGroup_prototype.init = function(strName) {
    //call constructor for super class
    this.jsxsuper(strName);
  };

  /**
   * Returns the size of the handle common to all child stack instances (in pixels). Default: jsx3.gui.StackGroup.DEFAULTBARSIZE
   * @return {int} size in pixels
   */
  StackGroup_prototype.getBarSize = function() {
    return this.jsxbarsize;
  };

  /**
   * Sets the size of the handle for the child stack instances;
   *            returns reference to self to facilitate method chaining
   * @param intBarSize {int} size (in pixels)
   * @return {jsx3.gui.StackGroup} this object
   */
  StackGroup_prototype.setBarSize = function(intBarSize) {
    this.jsxbarsize = intBarSize;
    return this;
  };

  /**
   * gets the size of the canvas for a given child (the drawspace)
   * @param objChild {jsx3.gui.Stack} child instance fow which to get the drawspace
   * @return {object} implicit map
   * @private
   */
  StackGroup_prototype.getClientDimensions = function(objChild, intIndex) {
    if (intIndex == null) intIndex = objChild.getChildIndex();
    var cachedDims = this.getCachedClientDimensions(intIndex);
    if (cachedDims) return cachedDims;

    //query the parent for the drawspace
    var myImplicit = this.getParent().getClientDimensions(this);
    var bVert = this.getOrientation() == jsx3.gui.StackGroup.ORIENTATIONV;

    //get the recommended (parent-width/height) or explicit (width/height) and convert to recommended
    var myWidth = (myImplicit.width) ? myImplicit.width : myImplicit.parentwidth;
    var myHeight = (myImplicit.height) ? myImplicit.height : myImplicit.parentheight;

    //get calculated values for bar size and content pane
    var intBarSize = this.paintBarSize();
    var intTotal = bVert ? myHeight : myWidth;
    var intOrigin = (intIndex * intBarSize) + (((this.getSelectedIndex() < intIndex) ? 1 : 0) * ((intTotal - ((this.getChildren().length - 1) * intBarSize)) - intBarSize));

    var l = 0, w = myWidth, h = myHeight, t = 0;
    if (bVert) {
      t = intOrigin;
      h = objChild.isFront() ? myHeight - intBarSize * (this.getChildren().length - 1) : intBarSize;
    } else {
      l = intOrigin;
      w = objChild.isFront() ? myWidth - intBarSize * (this.getChildren().length - 1) : intBarSize;
    }

    return this.setCachedClientDimensions(intIndex,
        {boxtype:"box", left:l, top:t, width:"100%", height:"100%", parentwidth:w, parentheight:h});
  };

  /**
   * Updates the box model for the object. Expects two parameters: the parentWidth and the parentHeight
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  StackGroup_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    //get the existing box profile and native instance
    var b1 = this.getBoxProfile(true, objImplicit);

    if (objGUI) {
      //recalculate the box
      b1.recalculate(objImplicit,objGUI,objQueue);

      //3.2 hack for ff; TO DO: is this necessary to stop the ff bleedthrough???
      objGUI.style.overflow = "auto";
    }

    //track the left/right origin for the given child stack (this is incremented as each stack is updated
    var intOrigin = 0;

    var maxLen = this.getChildren().length;
    for (var i = 0; i < maxLen; i++) {
      //get the 'implicit' object that will define the layout/position for the given stack child, @objChild
      var objChild = this.getChild(i);
      var objImplicitChild = this.getClientDimensions(objChild, i);
      objQueue.add(objChild, objImplicitChild, objGUI != null, true);
    }
  };

  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  StackGroup_prototype.paint = function() {
    //determine which child is the active stack to show; reset dimension array to execute this
    var objActiveTab = this.getChild(this.getSelectedIndex());
    if (objActiveTab == null) {
      objActiveTab = this.getChild(0);
      this.setSelectedIndex(0);
    }

    if (objActiveTab != null) {
      //reset the dimension array; since this class is a subclass of JSXLayoutGrid, it borrows this method to size its children
      var maxLen = this.getChildren().length;
      var a = [];
      var intBarSize = this.paintBarSize();
      var intIndex = this.getSelectedIndex();
      for (var i = 0; i < maxLen; i++) {
        if (intIndex != i) {
          a[i] = intBarSize;
        } else {
          a[i] = "*";
        }
      }

      if (this.getOrientation() == StackGroup.ORIENTATIONV)
        this.setRows(a.join(","));
      else
        this.setCols(a.join(","));
    }

    //set overflow to hidden
//    this.setOverflow(jsx3.gui.Block.OVERFLOWHIDDEN);
//    this.setOverflow(jsx3.gui.Block.OVERFLOWSCROLL);

    //call paint method for superclass, now that we've configure MODEL in a way the the superclass paint routine will render the layout we need
    return this.jsxsuper();
  };

  /**
   * renders the size of the handle common to all child stack instances (in pixels). Default: jsx3.gui.StackGroup.DEFAULTBARSIZE
   * @return {int} size in pixels
   * @private
   */
  StackGroup_prototype.paintBarSize = function(intBarSize) {
    return (this.getBarSize()) ? this.getBarSize() : StackGroup.DEFAULTBARSIZE;
  };

  /**
   * Returns zero-based index for the tab that is active per its placement in the child JScript array
   * @return {int}
   */
  StackGroup_prototype.getSelectedIndex = function() {
    return (this.jsxselectedindex == null) ? 0 : ((this.jsxselectedindex > this.getChildren().length - 1) ? this.getChildren().length - 1 : this.jsxselectedindex);
  };

  /**
   * Sets zero-based index for the stack child to make 'active' (expanded); typically called by the 'doShow' function (which is commonly called with the VIEW for the given stack child is clicked)
   * @param intIndex {int} zero-based index for the tab according to its placement in the child JavaScript array
   * @return {jsx3.gui.StackGroup} this object
   * @private
   */
  StackGroup_prototype.setSelectedIndex = function(intIndex) {
    //persist which tab is currently selected/active
    this.jsxselectedindex = intIndex;
  };

  /**
   * Allows dynamic content to be added without requiring a full repaint of the stack group and all its children.
   * @package
   */
  StackGroup_prototype.paintChild = function(objJSX, bLoop) {
    var objGUI = this.getRendered();

    if (objGUI != null) {
      jsx3.html.insertAdjacentHTML(objGUI, "beforeEnd", objJSX.paint());
      // HACK: incompatible super-method from LayoutGrid is in the way :-(
      jsx3.gui.Painted.prototype.paintChild.call(this, objJSX, bLoop, objGUI, true);
    }

    if (!bLoop)
      this._updateDimensionArray(true);
  };

  StackGroup_prototype.onSetChild = function(objChild) {
    return objChild instanceof jsx3.gui.Stack;
  };

  /**
   * Implementation for this class that restores the appearance of the control after a stack has been removed.
   * @package
   */
  StackGroup_prototype.onRemoveChild = function(objChild, intIndex) {
    this.jsxsuper(objChild, intIndex);

    if (jsx3.$A.is(objChild)) {
      this.repaint();
    } else {
      var numChildren = this.getChildren().length;
      var bRemovedActive = intIndex == this.jsxselectedindex;
      if (intIndex <= this.jsxselectedindex && (this.jsxselectedindex > 0 || numChildren == 0))
        this.jsxselectedindex--;

      if (bRemovedActive && this.jsxselectedindex >= 0) {
        this._updateDimensionArray();
        this.getChild(this.jsxselectedindex).doShow();
      } else {
        this._updateDimensionArray(true);
      }
    }
  };

  /**
   * @private
   * @jsxobf-clobber
   */
  StackGroup_prototype._updateDimensionArray = function(bRepaint) {
    var a = [];

    var intBarSize = this.paintBarSize();
    var intIndex = this.getSelectedIndex();
    var maxLen = this.getChildren().length;

    for (var i=0; i < maxLen; i++) {
      a[i] = intIndex != i ? intBarSize : "*";
    }

    if (this.getOrientation() == StackGroup.ORIENTATIONV)
      this.setRows(a.join(","), bRepaint);
    else
      this.setCols(a.join(","), bRepaint);
  };

  /**
   * @return {int}
   */
  StackGroup_prototype.getOrientation = function() {
    return (this.jsxorientation == null) ? StackGroup.ORIENTATIONV : this.jsxorientation;
  };

  /**
   * @param intOrientation {int}
   * @return {jsx3.gui.StackGroup} this object.
   */
  StackGroup_prototype.setOrientation = function(intOrientation) {
    this.jsxorientation = intOrientation;
    return this;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  StackGroup.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.StackGroup
 * @see jsx3.gui.StackGroup
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.StackGroup", -, null, function(){});
 */
jsx3.StackGroup = jsx3.gui.StackGroup;

/* @JSC :: end */
