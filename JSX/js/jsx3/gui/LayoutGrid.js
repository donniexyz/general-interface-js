/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Block");

/**
 * This class provides a way to organize a set of GUI objects in a grid. The dimensions of each cell in the grid
 * are determined by the row heights and column widths. The height of each row and width of each column may be defined
 * either as a percent, an integer pixel value, or as "*". Each dimension may specify one or more divisions as "*",
 * in which case these rows/columns share the remaining space in that dimension equally once the other rows/columns
 * are fitted.
 * <p/>
 * GUI objects that are children of this DOM node are rendered in the cells. The first child is rendered in the
 * top-left corner. Subsequent children are rendered in rows from left to right and top to bottom.
 */
jsx3.Class.defineClass("jsx3.gui.LayoutGrid", jsx3.gui.Block, null, function(LayoutGrid, LayoutGrid_prototype) {

/* @JSC :: begin DEP */

  /**
   * {int} 0 :  top-over (--) layout
   * @deprecated
   */
  LayoutGrid.ORIENTATIONCOL = 0;

  /**
   * {int} 1 : side-by-side (|) layout
   * @deprecated
   */
  LayoutGrid.ORIENTATIONROW = 1;

  /**
   * {int} 0 : top-over (--) layout (default)
   * @deprecated
   */
  LayoutGrid.DEFAULTORIENTATION = 0;

  /**
   * {int} 3 (default)
   * @deprecated
   */
  LayoutGrid.DEFAULTREPEAT = 3;

  /**
   * {Array<String>} ["33%","33%","34%"] (default)
   * @deprecated
   */
  LayoutGrid.DEFAULTDIMENSIONS = ["33%","33%","34%"];

  /**
   * {int} 0
   * @deprecated
   */
  LayoutGrid.ABSOLUTE = 0;

  /**
   * {int} 1
   * @deprecated
   */
  LayoutGrid.ADAPTIVE = 1;

/* @JSC :: end */

  /**
   * The instance initializer.
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   */
  LayoutGrid_prototype.init = function(strName) {
    //call constructor for super class
    this.jsxsuper(strName);

    //assign properties required by the model (those that cannot be implied)
    this.setCols("*");
    this.setRows("50%,50%");
  };

/* @JSC :: begin DEP */

  LayoutGrid_prototype.onAfterAttach = function() {
    this.jsxsuper();
    // DEPRECATED: this is just legacy support for jsxsizearray
    if (this.jsxsizearray && !(this.jsxrows || this.jsxcols))
      this.setDimensionArray(this.jsxsizearray, false);
  };

/* @JSC :: end */

  /**
   * when a child is removed; recalcs box profile
   * @param objChild {jsx3.app.Model|Array<jsx3.app.Model>} the child that was removed
   * @param intIndex {int} the index of the removed child
   * @package
   */
  LayoutGrid_prototype.onRemoveChild = function(objChild, intIndex) {
    this.jsxsuper(objChild, intIndex);
    this._bRepaint();
  };

  /**
   * routes call to repaint() as layoutgrid cannot insert directly into the DOM
   * @param objJSXChild {jsx3.app.Model} direct child whose generated VIEW will be directly inserted into the DOM to provide more efficient screen updates as repaint is costly for large applications
   * @return {jsx3.gui.LayoutGrid} this object
   * @package
   */
  LayoutGrid_prototype.paintChild = function(objJSXChild, bGroup) {
    if (! bGroup)  {
      this.recalcBox();
      this.repaint();
    }
  };

/* @JSC :: begin DEP */

  /**
   * Returns whether the layout grid will render items top-over (--) or side-by-side (|); returns jsx3.gui.LayoutGrid.ORIENTATIONCOL or  jsx3.gui.LayoutGrid.ORIENTATIONROW
   * @return {int}
   * @deprecated  Use <code>getRows()</code> and <code>getCols()</code> instead.
   */
  LayoutGrid_prototype.getOrientation = function() {
    return (this.jsxorientation == null) ? LayoutGrid.DEFAULTORIENTATION : this.jsxorientation;
  };

  /**
   * Sets whether the layout grid will render items top-over (--) or side-by-side (|);
   * returns reference to self to facilitate method chaining
   * @param ORIENTATION {int} if null, jsx3.gui.LayoutGrid.DEFAULTORIENTATION will be used; otherwise, one of: jsx3.gui.LayoutGrid.ORIENTATIONROW or jsx3.gui.LayoutGrid.ORIENTATIONCOL
   * @return {jsx3.gui.LayoutGrid} this object
   * @deprecated  Use <code>setRows()</code> and <code>setCols()</code> instead.
   */
  LayoutGrid_prototype.setOrientation = function(ORIENTATION) {
    this.jsxorientation = ORIENTATION;
    return this;
  };

  /**
   * The LayoutGrid leverages an HTML Table for its on-screen VIEW; this table can use the browser's own adaptive
   *            layouts to best adjust to the size of its content; returns one of: jsx3.gui.LayoutGrid.ABSOLUTE, jsx3.gui.LayoutGrid.ADAPTIVE
   * @return {int} one of: jsx3.gui.LayoutGrid.ABSOLUTE, jsx3.gui.LayoutGrid.ADAPTIVE
   * @deprecated
   */
  LayoutGrid_prototype.getBestGuess = function() {
    return this.jsxbestguess;
  };

  /**
   * The LayoutGrid leverages an HTML Table for its on-screen VIEW; this table can use the browser's own adaptive
   *            layouts to best adjust to the size of its content; returns one of: jsx3.gui.LayoutGrid.ABSOLUTE, jsx3.gui.LayoutGrid.ADAPTIVE;
   *            returns reference to self to facilitate method chaining
   * @param LAYOUT {int} jsx3.gui.LayoutGrid.ABSOLUTE if null; one of: jsx3.gui.LayoutGrid.ABSOLUTE, jsx3.gui.LayoutGrid.ADAPTIVE
   * @return {jsx3.gui.LayoutGrid} this object
   * @deprecated
   */
  LayoutGrid_prototype.setBestGuess = function(LAYOUT) {
    this.jsxbestguess = LAYOUT;
    return this;
  };

  /**
   * Returns the number of cells to draw before starting a new row/column of cells
   * @return {int} number of cells to draw before starting a new row/column of cells
   * @deprecated
   */
  LayoutGrid_prototype.getRepeat = function() {
    return this.jsxrepeat;
  };

  /**
   * Sets the number of cells to draw before starting a new row/column of cells;
   *            returns reference to self to facilitate method chaining
   * @param intCellCount {int} number of cells to draw before starting a new row/column of cells; since null is not allowed, pass 0 if you don't want any child elements to render to the on-screen VIEW
   * @return {jsx3.gui.LayoutGrid} this object
   * @deprecated
   */
  LayoutGrid_prototype.setRepeat = function(intCellCount) {
    this.jsxrepeat = intCellCount;
    return this;
  };

  /**
   * Returns dimensions for cells in the layoutgrid as a JavaScript array
   * @return {Array<int|String>} JavaScript array
   * @deprecated  Use <code>getRows()</code> and <code>getCols()</code> instead.
   */
  LayoutGrid_prototype.getDimensionArray = function() {
    var str = this.getOrientation() == LayoutGrid.ORIENTATIONCOL ? this.getRows() : this.getCols();
    return str != null ? str.split(/\s*,\s*/g) : [];
  };

  /**
   * Sets dimensions for cells in the layoutgrid;
   *          returns reference to self to facilitate method chaining
   * @param objArray {Array<int|String>} if null, no sizing information will be applied to the cells; otherwise: valid JavaScript array with number of items equal to the value of this.getRepeat();
   * @param bRepaint {boolean} false if null; if true, the new dimensions will be applied to the on-screen view without a repaint, allowing for faster performance than by following this call with a repaint() call
   * @return {jsx3.gui.LayoutGrid} this object
   * @deprecated  Use <code>setRows()</code> and <code>setCols()</code> instead.
   */
  LayoutGrid_prototype.setDimensionArray = function(objArray, bRepaint) {
    return this.getOrientation() == LayoutGrid.ORIENTATIONCOL ?
        this.setRows(objArray.join(","), bRepaint) : this.setCols(objArray.join(","), bRepaint);
  };

/* @JSC :: end */

  /**
   * @return {String}
   * @since 3.4
   */
  LayoutGrid_prototype.getCols = function() {
    return this.jsxcols || "*";
  };

  /**
   * @param strCols {String|Array}
   * @return {jsx3.gui.LayoutGrid} this object.
   * @since 3.4
   */
  LayoutGrid_prototype.setCols = function(strCols, bRepaint) {
    this.jsxcols = jsx3.$A.is(strCols) ? strCols.join(",") : strCols;
    if (bRepaint) this._bRepaint();
    return this;
  };

  /**
   * @return {String}
   * @since 3.4
   */
  LayoutGrid_prototype.getRows = function() {
    return this.jsxrows || "*";
  };

  /**
   * @param strRows {String|Array}
   * @return {jsx3.gui.LayoutGrid} this object.
   * @since 3.4
   */
  LayoutGrid_prototype.setRows = function(strRows, bRepaint) {
    this.jsxrows = jsx3.$A.is(strRows) ? strRows.join(",") : strRows;
    if (bRepaint) this._bRepaint();
    return this;
  };

  /** @private @jsxobf-clobber */
  LayoutGrid_prototype._bRepaint = function() {
    this._clearCaches();
    var objGUI = this.getRendered();
    if (objGUI != null)
      this.syncBoxProfile({}, objGUI);
  };

  /**
   * Returns array of true sizes (not what the developer specified in code, but what it evaluates to according to the browser)
   * @return {Array}
   * @private
   * @jsxobf-clobber
   */
  LayoutGrid_prototype._getTrueSizeArray = function(bRow, intSize) {
    var cachedField = bRow ? "_jsxcachedrows" : "_jsxcachedcols";

    //get the box profile for this layout grid (basically a simple box, inherited from jsx3.gui.Block)
    var objProfile = this.getBoxProfile(true);

    //used cached dimension for repeated access (comes via pull-based request to getClientDimensions)
    if (objProfile[cachedField] instanceof Array) return objProfile[cachedField];

    //get the clientHeight (which is also the same as height, since layout grids don't implement padding, borders, and margins)
    if (intSize == null || isNaN(intSize))
      intSize = bRow ? objProfile.getClientHeight() : objProfile.getClientWidth();
    if (isNaN(intSize)) return [];
    
    var intTotal = 0;
    var intWild = 0;

    var divs = (bRow ? this.getRows() : this.getCols());
    if (!jsx3.$A.is(divs))
      divs = divs != null  ? divs.split(/\s*,\s*/g) : [];
    var objNew = new Array(divs.length);

    //loop through implicit dimensions to create exlicit version
    for (var i = 0; i < divs.length; i++) {
      var div = divs[i];
      if (div == "*") {
        objNew[i] = "*";
      } else if (typeof(div) == "string" && div.indexOf("%") >= 0) {
        var intVal = parseInt(div);
        objNew[i] = isNaN(intVal) ? "*" : (intVal / 100) * intSize;
      } else {
        var intVal = parseInt(div);
        objNew[i] = isNaN(intVal) ? "*" : intVal;
      }

      if (objNew[i] == "*") intWild++;
      else intTotal += objNew[i];
    }

    if (intWild > 0) {
      var wildSize = Math.max(0, intSize - intTotal) / intWild;

      for (var i = 0; i < objNew.length; i++)
        if (objNew[i] == "*") objNew[i] = wildSize;
    }

    // Round each row/col to an integer and distribute the remainder as full pixels among the rows/cols.
    // This algorithm will not necessarily distribute pixels to the most "deserving" rows/cols.
    //     (e.g. [10.9, 1.1] will give the extra pixel to the 1.1).
    var decimal = 0;
    for (var i = 0; i < objNew.length; i++) {
      decimal += objNew[i] % 1;
      objNew[i] = Math.floor(objNew[i]);
      if (decimal >= 1 || (i == objNew.length - 1 && decimal > 0.5)) {
        objNew[i]++;
        decimal--;
      }
    }

    objProfile[cachedField] = objNew;
    return objNew;
  };

  /**
   * gets the size of the canvas for a given child (the true drawspace)
   * @param objChild {jsx3.app.Model} child instance (in case it matters)
   * @return {object} Map with named properties: W and H
   * @package
   */
  LayoutGrid_prototype.getClientDimensions = function(objChild, intIndex) {
    if (intIndex == null) intIndex = objChild.getChildIndex();
    var cachedDims = this.getCachedClientDimensions(intIndex);
    if (! cachedDims) this._cacheAllClientDims();
    return this.getCachedClientDimensions(intIndex) ||
           {boxtype:"box", left:0, top:0, width:0, height:0, parentwidth:0, parentheight:0};
  };

  /** @private @jsxobf-clobber */
  LayoutGrid_prototype._cacheAllClientDims = function() {
    // TODO: adjust following to use the explicit box profile for the lg, so that border size is accounted for (layoutgrids can implement borders)
    //find out the dimension for the splitter's parent container
    var myImplicit = this.getParent().getClientDimensions(this);

    //get the recommended (parent-width/height) or explicit (width/height) and convert to recommended
    var myWidth = (myImplicit.width) ? myImplicit.width : myImplicit.parentwidth;
    var myHeight = (myImplicit.height) ? myImplicit.height : myImplicit.parentheight;

    // get true dimensions for the children
    var rows = this._getTrueSizeArray(true, myHeight);
    var cols = this._getTrueSizeArray(false, myWidth);

    var numCells = rows.length * cols.length;
    var numChildren = this.getChildren().length;
    var numCalcs = Math.min(numCells, numChildren);

    var n = 0;
    var t = 0;
    for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      var l = 0;

      for (var colIndex = 0; colIndex < cols.length && n < numCalcs; colIndex++) {
        this.setCachedClientDimensions(n++,
            {boxtype:"box", left:l, top:t, width:"100%", height:"100%",
              parentwidth:cols[colIndex], parentheight:rows[rowIndex]});

        l += cols[colIndex];
      }

      t += rows[rowIndex];
    }
  };

  /**
   * Updates the box model for the object. Expects two parameters: the parentWidth and the parentHeight
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @package
   */
  LayoutGrid_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    if (! objGUI) {
      this.clearBoxProfile(true);
      return;
    }

    // the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if (this.getParent() && ((!isNaN(objImplicit.parentwidth) && !isNaN(objImplicit.parentheight)) || (objImplicit.width == null && objImplicit.height == null))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if(objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    //get the existing box profile and native instance
    var b1 = this.getBoxProfile(true, objImplicit);
    var noUpdate = b1._jsxcachedrows != null && b1._jsxcachedcols != null;

    //recalculate the box
    noUpdate = noUpdate && !b1.recalculate(objImplicit, objGUI, objQueue);

    if (noUpdate) return;

    this._clearCaches(b1);

    var objKids = this.getChildren();
    for (var i = 0; i < objKids.length; i++)
      objQueue.add(objKids[i], this.getClientDimensions(objKids[i], i), (objGUI) ? objGUI.childNodes[i] : null, true);
  };

  /** @private @jsxobf-clobber */
  LayoutGrid_prototype._clearCaches = function(objBox) {
    if (! objBox) objBox = this.getBoxProfile(false);
    if (objBox) {
      delete objBox._jsxcachedrows;
      delete objBox._jsxcachedcols;
    }
  };

  /**
   * Creates the box model/profile for the object. Expects two parameters: the parentwidth and the parentheight
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @private
   */
  LayoutGrid_prototype.createBoxProfile = function(objImplicit) {
    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if (this.getParent() && (objImplicit == null || ((!isNaN(objImplicit.parentwidth) && !isNaN(objImplicit.parentheight)) || (!isNaN(objImplicit.width) && !isNaN(objImplicit.height))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if (objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    //get properties that affect layout
    var bRelative = ((this.getRelativePosition() != 0 &&
                      (!this.getRelativePosition() || this.getRelativePosition() == jsx3.gui.Block.RELATIVE)));

    //create the box
    if (!objImplicit.boxtype)objImplicit.boxtype = (bRelative || objImplicit.left == null || objImplicit.top == null) ? "relativebox" : "box";
    if(objImplicit.boxtype == "relativebox") {
      if(objImplicit.left == null) objImplicit.left = 0;
      if(objImplicit.top == null) objImplicit.top = 0;
    }
    if(objImplicit.width == null) objImplicit.width = "100%";
    if(objImplicit.height == null) objImplicit.height = "100%";
    objImplicit.tagname = "div";
    objImplicit.container = "true";
    var bor;
    if((bor = this.getBorder()) != null && bor != "") objImplicit.border = bor;
    return new jsx3.gui.Painted.Box(objImplicit);
  };

  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  LayoutGrid_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //[3.2] TODO: overflow needs to be part of the core box model abstraction.  It affects layouts and might affect future ports, flexibility...
    //also: removed this: since the LG manages the dimensions of its children, it will not pick up scroll bars.  Thie
    //      issue has to do with firefox not honoring the 'hidden' declaration
    this.setOverflow(jsx3.gui.Block.OVERFLOWHIDDEN);

    var objKids = this.getChildren();
    for (var i = 0; i < objKids.length; i++) 
      objKids[i].syncBoxProfileSync(this.getClientDimensions(objKids[i], i));

    //use the super to paint
    return this.jsxsuper();
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  LayoutGrid.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.LayoutGrid
 * @see jsx3.gui.LayoutGrid
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.LayoutGrid", -, null, function(){});
 */
jsx3.LayoutGrid = jsx3.gui.LayoutGrid;

/* @JSC :: end */
