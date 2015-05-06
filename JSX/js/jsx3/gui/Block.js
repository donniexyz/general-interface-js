/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Painted", "jsx3.gui.Interactive");

/**
 * This class provides a container-based, object-oriented approach to creating static html objects (basically this class creates "DIV" objects).  This class is useful for creating objects as simple as 'labels' that can be placed anywhere on the screen.  The advantage to using this class instead of trying to insert static html in the html window is that it allows the given HTML string to be managed by the 'container-management' strategy employed by the JSX Architecture
 */
jsx3.Class.defineClass("jsx3.gui.Block", jsx3.gui.Painted, [jsx3.gui.Interactive], function(Block, Block_prototype) {

  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;

/* @JSC :: begin DEP */

  /**
   * {int} 16
   * @deprecated
   */
  Block.SCROLLSIZE = 16;

/* @JSC :: end */

  /**
   * {int} 1
   * @final @jsxobf-final
   */
  Block.OVERFLOWSCROLL = 1;

  /**
   * {int} 2
   * @final @jsxobf-final
   */
  Block.OVERFLOWHIDDEN = 2;

  /**
   * {int} 3 (default)
   * @final @jsxobf-final
   */
  Block.OVERFLOWEXPAND = 3;

  /**
   * {String} Verdana
   */
 Block.DEFAULTFONTNAME = "Verdana";

  /**
   * {int} 10
   */
  Block.DEFAULTFONTSIZE = 10;

  /**
   * {String} #000000
   */
  Block.DEFAULTCOLOR = "#000000";

  /**
   * {String} &amp;#160;
   */
  Block.DEFAULTTEXT = "&#160;";

  /**
   * {String} jsx30block
   */
  Block.DEFAULTCLASSNAME = "jsx30block";

  /**
   * {String} span
   */
  Block.DEFAULTTAGNAME = "span";

  /**
   * {String} bold
   * @final @jsxobf-final
   */
  Block.FONTBOLD = "bold";

  /**
   * {String} normal (default)
   * @final @jsxobf-final
   */
  Block.FONTNORMAL = "normal";

  /**
   * {String} [empty string] (default)
   * @final @jsxobf-final
   */
  Block.DISPLAYBLOCK = "";

  /**
   * {String} none
   * @final @jsxobf-final
   */
  Block.DISPLAYNONE = "none";

  /**
   * {String}
   * @final @jsxobf-final
   */
  Block.VISIBILITYVISIBLE = "visible";

  /**
   * {String}
   * @final @jsxobf-final
   */
  Block.VISIBILITYHIDDEN = "hidden";

  /**
   * {int} -1
   * @deprecated
   */
  Block.NULLSTYLE = -1;

  /**
   * {String} left (default)
   * @final @jsxobf-final
   */
  Block.ALIGNLEFT = "left";

  /**
   * {String} center
   * @final @jsxobf-final
   */
  Block.ALIGNCENTER = "center";

  /**
   * {String} right
   * @final @jsxobf-final
   */
  Block.ALIGNRIGHT = "right";

  /**
   * {int} 0
   * @final @jsxobf-final
   */
  Block.ABSOLUTE = 0;

  /**
   * {int} 1 (default)
   * @final @jsxobf-final
   */
  Block.RELATIVE = 1;

  /**
   * {Object<String, boolean>} {NN: false, EE: false, SS: false, WW: false, MM: false}
   * @private
   */
  Block.MASK_NO_EDIT = jsx3.gui.Painted.MASK_NO_EDIT;

  /**
   * {Object<String, boolean>} {NN: true, EE: true, SS: true, WW: true, MM: true}
   * @private
   */
  Block.MASK_ALL_EDIT = jsx3.gui.Painted.MASK_ALL_EDIT;

  /**
   * {Object<String, boolean>} {MM: true}
   * @private
   */
  Block.MASK_MOVE_ONLY = {MM: true};

  /**
   * {Object<String, boolean>} edit mask for only East edit
   * @private
   */
  Block.MASK_EAST_ONLY = {NN: false, EE: true, SS: false, WW: false, MM: false};

  /**
   * {String} JSX/images/spc.gif
   */
  Block.SPACE = jsx3.resolveURI("jsx:///images/spc.gif");

  /* @JSC */ if (jsx3.CLASS_LOADER.IE6) {
    jsx3.html.loadImages(Block.SPACE);
  /* @JSC */ }
  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param vntLeft {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntTop {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntWidth {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntHeight {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param strHTML {String} Text/HTML markup to place in the jsx3.gui.Block instance
   */
   Block_prototype.init = function(strName,vntLeft,vntTop,vntWidth,vntHeight,strHTML) {
    //call constructor for super class (the super expects the name of the object and the function that it is an instance of)
    this.jsxsuper(strName);

    //set position,dimension, and text values
    if (vntLeft != null) this.setLeft(vntLeft);
    if (vntTop != null) this.setTop(vntTop);
    if (vntWidth != null) this.setWidth(vntWidth);
    if (vntHeight != null) this.setHeight(vntHeight);
    if (strHTML != null) this.setText(strHTML);
  };

  /**
   * Returns valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   */
  Block_prototype.getBackgroundColor = function() {
    return this.jsxbgcolor;
  };

  /**
   * Sets valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0));
   *            returns reference to self to facilitate method chaining;
   * @param strColor {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @param bUpdateView {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.
   * @return {jsx3.gui.Block} this object
   */
  Block_prototype.setBackgroundColor = function(strColor,bUpdateView) {
    this.jsxbgcolor = strColor;

    //immediately upate view if user passed true for repaint
    if (bUpdateView) this.updateGUI("backgroundColor",(strColor==Block.NULLSTYLE) ? "" : strColor);
    return this;
  };

  /**
   * Returns valid CSS property value for the background such as:  background-image:url(x.gif);  or background-image:url(x.gif);background-repeat:no-repeat;
   * @return {String} valid CSS property for the background such as:  background-image:url(x.gif);  or background-image:url(x.gif);background-repeat:no-repeat;
   */
  Block_prototype.getBackground = function() {
    return this.jsxbg;
  };

  /**
   * Sets valid CSS property value for the background such as:  background-image:url(x.gif);  or background-image:url(x.gif);background-repeat:no-repeat;
   *            returns reference to self to facilitate method chaining;
   * @param strBG {String} valid CSS property value for the background such as:  background-image:url(x.gif);  or background-image:url(x.gif);background-repeat:no-repeat;
   * @return {jsx3.gui.Block} this object
   */
  Block_prototype.setBackground = function(strBG) {
    this.jsxbg = strBG;
    return this;
  };

  /**
   * Returns CSS property value(s) for a border (border: solid 1px #000000)
   * @return {String}
   */
  Block_prototype.getBorder = function() {
    return this.jsxborder;
  };

  /**
   * Sets CSS property value(s) for a border (<code>border: solid 1px #000000</code>). Properties can be strung
   * together as in: <code>border:solid 1px #989885;border-left-width:0px;</code>
   * @param strCSS {String} valid CSS property value for a border (border: solid 1px #000000)
   * @param bUpdateView {Boolean} if true, the view will be updated with requiring a repaint
   * @return {jsx3.gui.Block} this object
   */
  Block_prototype.setBorder = function(strCSS,bUpdateView) {
    this.jsxborder = strCSS;
    if (bUpdateView)
      this.recalcBox(["border"]);
    else
      this.setBoxDirty();

    return this;
  };

  /**
   * Returns valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   */
  Block_prototype.getColor = function() {
    return this.jsxcolor;
  };

  /**
   * Sets valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0));
   *            returns reference to self to facilitate method chaining;
   * @param strColor {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @param bUpdateView {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.
   * @return {jsx3.gui.Block} this object
   */
  Block_prototype.setColor = function(strColor,bUpdateView) {
    this.jsxcolor = strColor;

    //immediately upate view if user passed true for repaint
    if (bUpdateView) this.updateGUI("color",(strColor==Block.NULLSTYLE) ? "" : strColor);
    return this;
  };

  /**
   * Returns valid CSS property value, (e.g., default,wait,col-resize); if no value or an empty string, null is returned
   * @return {String} valid CSS property value, (e.g., default,wait,col-resize)
   */
  Block_prototype.getCursor = function() {
    return this.jsxcursor;
  };

  /**
   * Sets valid CSS property value, (e.g., default,wait,col-resize)
   * @param strCursor {String} valid CSS property value, (e.g., default,wait,col-resize)
   * @param bUpdateView {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.
   */
  Block_prototype.setCursor = function(strCursor,bUpdateView) {
    this.jsxcursor = strCursor;

    //immediately upate view if user passed true for repaint
    if (bUpdateView) this.updateGUI("cursor",strCursor);
    return this;
  };

  /**
   * Returns CSS text to override the standard instance properties on the painted object.
   * @return {String} CSS text
   */
  Block_prototype.getCSSOverride = function() {
    return this.jsxstyleoverride;
  };

  /**
   * Sets CSS text to override the standard instance properties on the painted object. Convenience method for extending this object. CSS properties affecting layout, including <code>border-width, padding, margin, width, and height</code>
   * are strongly discouraged, as they may interfere with the framework's internal box models.
   * Since some controls are composited from multiple HTML elements, some styles may not cascade to nested elements.
   * <b>Instance Properties</b> are the preferred method for applying styles.
   * @param strCSS {String} CSS text.  For example, <code>color:red;background-color:orange;</code>
   * @return {jsx3.gui.Block} this object
   */
  Block_prototype.setCSSOverride = function(strCSS) {
    this.jsxstyleoverride = strCSS;
    return this;
  };

  /**
   * Returns the named CSS rule(s) to apply to the painted object.
   * @return {String}
   */
  Block_prototype.getClassName = function() {
    return this.jsxclassname;
  };

  /**
   * Sets the named CSS rule(s) to apply to the painted object. Rules that specify <code>border-width, padding, margin, width, and height</code> are strongly discouraged.
   * Multiple rules may be specified, delimited with a space.  For example, <code>label emphasis</code>.
   * Since some controls are composited from multiple HTML elements, some rule styles may not cascade to nested elements.
   * <b>Dynamic Properties</b> are the preferred method for applying global styles.
   * @param strClassName {String} CSS property name without the leading "."
   * @return {jsx3.gui.Block} this object
   */
  Block_prototype.setClassName = function(strClassName) {
    this.jsxclassname = strClassName;
    return this;
  };

  /**
   * Returns the CSS display for the object; one of jsx3.gui.Block.DISPLAYNONE (display:none;) and jsx3.gui.Block.DISPLAYBLOCK (display:;)
   * @return {String}
   */
  Block_prototype.getDisplay = function() {
    return this.jsxdisplay;
  };

  /**
   * Sets the display for the object. Note that although the framework uses CSS to apply this setting, the actual values that get set are determined by the system.
   * Only those parameters listed for @DISPLAY are supported as inputs to this function.
   * @param DISPLAY {String} one of <code>jsx3.gui.Block.DISPLAYNONE</code> or <code>jsx3.gui.Block.DISPLAYBLOCK</code>
   * @param bUpdateView {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.
   * @return {jsx3.gui.Block} this object
   */
  Block_prototype.setDisplay = function(DISPLAY, bUpdateView) {
    if (this.jsxdisplay != DISPLAY) {
      //update the model
      this.jsxdisplay = DISPLAY;

      //immediately update the view if user passed true for bUpdateView
      if (bUpdateView) {
        //unfortunately the 'display' property is NOT ONLY used as a way to show/hide content.
        //it also serves as a way to make spans behave consistently across the various browser modes (strict, quirks, xhtml, etc)
        if (DISPLAY != Block.DISPLAYNONE) {
          var b1 = this.getBoxProfile();
          if(!(this.getRelativePosition() == Block.ABSOLUTE || (b1 && b1.getBoxType() != "relativebox"))) {
            //3.6: fixed bug in fx 3 exposed by a trailing semicolon in the property value -- it's always been a bug, but FX3 chokes on it
            var oX = jsx3.gui.Painted.Box.getCssFix().replace(/display:([^;]*);?/i,"$1");
            if(!jsx3.util.strEmpty(oX)) DISPLAY = oX;
          }
        }
        if(DISPLAY == Block.DISPLAYNONE)
          jsx3.html.persistScrollPosition(this.getRendered());
        this.updateGUI("display",DISPLAY);
        if(DISPLAY != Block.DISPLAYNONE) {
          // call method to tell any descendants that the view was restored
          jsx3.gui.Painted._onAfterRestoreViewCascade(this,this.getRendered());
          jsx3.html.restoreScrollPosition(this.getRendered());
        }
      }
    }
    return this;
  };


  /**
   * Returns the CSS font-family for the object
   * @return {String} valid CSS font-family property value
   */
  Block_prototype.getFontName = function() {
    return this.jsxfontname;
  };

  /**
   * Sets the CSS font-family for the object;
   *            returns reference to self to facilitate method chaining;
   * @param strFontName {String} valid CSS font-family property value
   * @return {jsx3.gui.Block} this object
   */
  Block_prototype.setFontName = function(strFontName) {
    this.jsxfontname = strFontName;
    return this;
  };

  /**
   * Returns the CSS font-size for the object
   * @return {int} font-size (in pixels)
   */
  Block_prototype.getFontSize = function() {
    return this.jsxfontsize;
  };

  /**
   * Sets the CSS font-size for the object;
   *            returns reference to self to facilitate method chaining;
   * @param intPixelSize {int} font-size (in pixels)
   * @return {jsx3.gui.Block} this object
   */
  Block_prototype.setFontSize = function(intPixelSize) {
    this.jsxfontsize = intPixelSize;
    return this;
  };

  /**
   * Returns the CSS font-weight for the object ("bold" or "normal")
   * @return {String} [jsx3.gui.Block.FONTBOLD. jsx3.gui.Block.FONTNORMAL]
   */
  Block_prototype.getFontWeight = function() {
    return this.jsxfontweight;
  };

  /**
   * Sets the CSS font-weight for the object ("bold" or "normal");
   *            returns reference to self to facilitate method chaining;
   * @param FONTWEIGHT {String} [jsx3.gui.Block.FONTBOLD. jsx3.gui.Block.FONTNORMAL]
   * @return {jsx3.gui.Block} this object
   */
  Block_prototype.setFontWeight = function(FONTWEIGHT) {
    this.jsxfontweight = FONTWEIGHT;
    return this;
  };

  /**
   * Returns the height property of this object.
   * @return {int | String} height.
   */
  Block_prototype.getHeight = function() {
    return this.jsxheight;
  };

  /**
   * Sets the height property of this object.
   * @param vntHeight {int | String} the height as a non-negative integer or non-negative percentage. For example: 45%, 12.
   * @param bUpdateView {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.
   * @return {jsx3.gui.Block} this object.
   */
  Block_prototype.setHeight = function(vntHeight,bUpdateView) {
    //update the model
    this.jsxheight = vntHeight;

    //update the boxprofile
    if (bUpdateView) {
      this.syncBoxProfile({height:vntHeight}, true);
    } else {
      this.setBoxDirty();
    }

    return this;
  };

  /**
   * Returns IE tab index for setting the tabIndex property for the on-screen DHTML for the object
   * @return {int}
   */
  Block_prototype.getIndex = function() {
    return this.jsxindex;
  };

  /**
   * Sets IE tab index for setting the tabIndex property for the on-screen DHTML for the object;
   *            returns reference to self to facilitate method chaining;
   * @param intIndex {int} any value in the valid range of -32767 to 32767
   * @param bUpdateView {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.
   * @return {jsx3.gui.Block} this object
   */
  Block_prototype.setIndex = function(intIndex,bUpdateView) {
    this.jsxindex = intIndex;
    if (bUpdateView) {
      var objGUI = this.getRendered();
      if (objGUI != null) objGUI.tabIndex = intIndex;
    }
    return this;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the first JSX parent (as a JSX instance in the model) of @objGUI (an HTML element in the view); returns null if no jsx parent could be found
   * @param objGUI {HTMLElement} HTML element in the view from which to begin looking for the first containing JSX parent in the model
   * @return {jsx3.gui.Block} JSX object
   * @deprecated  Use <code>jsx3.html.getJSXParent()</code> instead.
   */
  Block.getJSXParent = function(objGUI) {
    return jsx3.html.getJSXParent(objGUI);
  };

/* @JSC :: end */

  /**
   * Returns the left property of this object.
   * @return {int|String} left.
   */
  Block_prototype.getLeft = function() {
    return this.jsxleft;
  };

  /**
   * Sets the left property of this object. The left property specifies the horizontal offset of this object
   * from its parent and only applies if this object is absolutely positioned.
   * @param vntLeft {int|String} the left value. Only numeric values and percentages are supported. For example: 25, -10, 20%.
   * @param bUpdateView {boolean} if @vntLeft is in integer (a number with no modifier) and @bUpdateView is true, the object's on-screen view is immediately updated to match its model, obviating the need to call '[object].repaint()'
   * @return {jsx3.gui.Block} this object.
   */
  Block_prototype.setLeft = function(vntLeft,bUpdateView) {
    //update the model
    this.jsxleft = vntLeft;

    if (bUpdateView) {
      if (isNaN(vntLeft)) vntLeft = 0;
      this.syncBoxProfile({left:vntLeft}, true);
    } else {
      this.clearBoxProfile(false);
    }

    return this;
  };

  /**
   * Set one to four dimensions at once. This operation is more efficient than calling more than one of
   * <code>setLeft</code>, <code>setTop</code>, etc. Any argument can be <code>null</code> to indicate not to update it.
   *
   * @param left {int|String|Array<int|String>} the new left value or an array containing all four new values
   * @param top {int|String} the new top value
   * @param width {int|String} the new width value
   * @param height {int|String} the new height value
   * @param bUpdateView {boolean} whether to update the display of this object immediately. If <code>left</code> is
   *    an <code>Array</code> then this parameter is the second parameter passed to this method.
   */
  Block_prototype.setDimensions = function(left, top, width, height, bUpdateView) {
    if (jsx3.$A.is(left)) {
      bUpdateView = top;
      height = left[3];
      width = left[2];
      top = left[1];
      left = left[0];
    }

    if (left   != null) this.jsxleft   = left;
    if (top    != null) this.jsxtop    = top;
    if (width  != null) this.jsxwidth  = width;
    if (height != null) this.jsxheight = height;

    if (bUpdateView) {
      this.syncBoxProfile({left:this.jsxleft, top:this.jsxtop, width:this.jsxwidth, height:this.jsxheight}, true);
    } else {
      this.setBoxDirty();
    }
  };

  /**
   * Returns the dimensions in an array of four int values
   * @return {Array<int>} [left,top,width,height]
   */
  Block_prototype.getDimensions = function() {
    return [this.getLeft(), this.getTop(), this.getWidth(), this.getHeight()];
  };

  /**
   * Returns CSS property value(s) for a margin (margin:4px;)
   * @return {String}
   */
  Block_prototype.getMargin = function() {
    return this.jsxmargin;
  };

  /**
   * Sets CSS property value for margin.
   * @param strCSS {String} The preferred method to set margin is by moving clockwise, beginning with the <b>north</b>
   * compass position, <b>without</b> the pixel designation.  For example, to specify a top margin of 8 pixels, use <code>8 0 0 0</code>. CSS syntax is
   * supported, but requires that pixels be designated.  For example, using <code>margin:5px;margin-left:10px;</code>, is equivalent to
   * <code>5 5 5 10</code>.
   * @param bUpdateView {Boolean} if true, the view will be updated with requiring a repaint
   * @return {jsx3.gui.Block} this object
   */
  Block_prototype.setMargin = function(strCSS,bUpdateView) {
    this.jsxmargin = strCSS;
    if (bUpdateView)
      this.recalcBox(["margin"]);
    else
      this.setBoxDirty();

    return this;
  };

  /**
   * Returns resizeMask property as an object array, defining what actions are available
   *            to the resizeMask for the given control (resize horizontally/vertically; is moveable, etc.)
   * @return {Object<String, int>} object array with boolean values for the following properties: NN,SS,EE,WW,MM
   * @private
   */
  Block_prototype.getMaskProperties = function() {
    var objProps = {};
    objProps.NN = true;
    objProps.SS = true;
    objProps.EE = true;
    objProps.WW = true;
    objProps.MM = this.getRelativePosition() == Block.ABSOLUTE;
    return objProps;
  };

  Block_prototype.doBeginMove = function(objEvent, objGUI) {
    if (objEvent.leftButton()) {
      this.jsxsupermix(objEvent, objGUI);
      Event.subscribe(Event.MOUSEUP,this,"doEndMove");
      objEvent.cancelAll(); // could by mouse down on image element
    }
  };

  Block_prototype.doEndMove = function(objEvent) {
    objEvent = objEvent.event;
    var objGUI = this.getRendered(objEvent);
    if (objEvent.leftButton()) {
      Event.unsubscribe(Event.MOUSEUP,this,"doEndMove");
      this.jsxsupermix(objEvent, objGUI);
    } else {
      this._ebMouseUp(objEvent, objGUI);
    }
  };

  /**
   * Returns the drag icon when a drag is about to occur. Override this method and replace with one adhering to the same signature to customize
   * the drag icon that will follow the cursor during a drag/drop operation.
   * @param objGUI {HTMLElement} HTML element that received the mousedown event that initiated the drag
   * @param objJSXTarget {jsx3.gui.Block} JSX object that received the event
   * @param strDragType {String} JSX_GENERIC
   * @param strDragItemId {String} jsxid for <code>objJSXTarget</code>
   * @return {String} HTML content to follow the mouse pointer during the drag
   * @package
   */
  Block_prototype.getDragIcon = function(objGUI, objJSXTarget, strDragType, strDragItemId) {
    var strText = (objGUI && objGUI.innerHTML) ? jsx3.util.strTruncate((objGUI.innerHTML+"").replace(/<[^>]*>/gi," "),25,"...",.5) : "... ... ...";
    return "<span class='jsx30block_drag'>" + strText + "</span>";
  };

  Block_prototype.doBeginDrag = function(objEvent, objGUI) {
    // no drag with right button
    if (objEvent.leftButton())
      this.doDrag(objEvent, objGUI, this.getDragIcon);
  };

  /**
   * Returns the overflow property for the object, that defines how its on-screen view will behave when its contents are larger than its specified width and/or height
   * @return {int} [jsx3.gui.Block.OVERFLOWSCROLL, jsx3.gui.Block.OVERFLOWHIDDEN, jsx3.gui.Block.OVERFLOWEXPAND]
   */
  Block_prototype.getOverflow = function() {
    return this.jsxoverflow;
  };

  /**
   * Sets the overflow property for the object, that defines how its on-screen view will behave when its contents are larger than its specified width and/or height;
   *            returns reference to self to facilitate method chaining;
   * @param OVERFLOW {int} [jsx3.gui.Block.OVERFLOWSCROLL, jsx3.gui.Block.OVERFLOWHIDDEN, jsx3.gui.Block.OVERFLOWEXPAND]
   * @return {jsx3.gui.Block} this object
   */
  Block_prototype.setOverflow = function(OVERFLOW) {
    this.jsxoverflow = OVERFLOW;
    return this;
  };

  /**
   * Returns CSS property value(s) for a padding (padding:4px;)
   * @return {String}
   */
  Block_prototype.getPadding = function() {
    return this.jsxpadding;
  };

  /**
   * Sets the CSS property value for padding an object.
   * @param strCSS {String} The preferred method to set padding is by moving clockwise, beginning with the <b>north</b>
   * compass position, <b>without</b> the pixel designation.  For example, to specify a top padding of 8 pixels, use <code>8 0 0 0</code>. CSS syntax is
   * supported, but requires that pixels be designated.  For example, using <code>padding:5px;padding-left:10px;</code>, is equivalent to
   * <code>5 5 5 10</code>.
   * @param bUpdateView {Boolean} if <code>true</code>, the view will be updated without requiring a repaint.
   * @return {jsx3.gui.Block} this object.
   */
  Block_prototype.setPadding = function(strCSS,bUpdateView) {
    this.jsxpadding = strCSS;
    if (bUpdateView)
      this.recalcBox(["padding"]);
    else
      this.setBoxDirty();

    return this;
  };

/* @JSC :: begin DEP */

  /**
   * Returns URL pointing to XML file used for GI BUILDER, defining what properties are available for edit for this object and what their possible values can be
   * @return {String} relative URL
   * @private
   * @deprecated
   */
  Block_prototype.getPropertiesPath = function() {
    return null;
  };

  /**
   * Returns URL pointing to XML file used for GI BUILDER, defining what model events are available for edit for this object and what their possible values can be
   * @return {String} relative URL
   * @private
   * @deprecated
   */
  Block_prototype.getModelEventsPath = function() {
    return null;
  };

/* @JSC :: end */

  /**
   * Returns if the instance is relatively positioned on-screen; returns one of: jsx3.gui.Block.ABSOLUTE jsx3.gui.Block.RELATIVE
   * @return {int}
   */
  Block_prototype.getRelativePosition = function() {
    return this.jsxrelativeposition;
  };

  /**
   * Sets if the jsx3.gui.Block instance is relatively positioned on-screen;
   *            returns reference to self to facilitate method chaining;
   * @param intRelative {int} jsx3.gui.Block.RELATIVE will be applied to the view if null. One of: jsx3.gui.Block.RELATIVE jsx3.gui.Block.ABSOLUTE
   * @param bUpdateView {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.
   * @return {jsx3.gui.Block} this object
   */
  Block_prototype.setRelativePosition = function(intRelative, bUpdateView) {
    if (this.jsxrelativeposition != intRelative) {
      this.setBoxDirty();
      this.jsxrelativeposition = intRelative;

      if (bUpdateView) {
        // SPEC: left/top only honored if absolute, margin only honored if relative
        if (intRelative == Block.ABSOLUTE) {
          this.setDimensions(this.getLeft() || Number(0), this.getTop() || Number(0), null, null, true);
          this.updateGUI("margin", "0px");
        } else {
          this.updateGUI("left", "0px");
          this.updateGUI("top", "0px");
          if (this.getMargin()) this.setMargin(this.getMargin(), true);
        }

        this.updateGUI("position", (intRelative == Block.RELATIVE) ? "relative" : "absolute");

        //relatively positioned blocks need to be styled as an 'inline box' for appropriate x-browser consistency. apply this property (a display property) here.
        if (this.getDisplay() != Block.DISPLAYNONE)
          this.setDisplay(Block.DISPLAYBLOCK, true);
      }
    }

    return this;
  };

  /**
   * Returns HTML tag name to use when rendering the object on-screen (span is the default); if the property is null,
   *          jsx3.gui.Block.DEFAULTTAGNAME is used;
   * @return {String} valid HTML tag name
   */
  Block_prototype.getTagName = function() {
    return this.jsxtagname;
  };

  /**
   * Sets HTML tag name to use when rendering the object on-screen (jsx3.gui.Block.DEFAULTTAGNAME is the default);
   *            returns reference to self to facilitate method chaining;
   * @param strTagName {String} valid HTML tag name (span, div, form, ol, ul, li, etc); if null is passed, the getter will use jsx3.gui.Block.DEFAULTTAGNAME
   * @return {jsx3.gui.Block} this object
   */
  Block_prototype.setTagName = function(strTagName) {
    this.jsxtagname = strTagName;
    this.setBoxDirty();
    return this;
  };

  /**
   * Returns the text/HTML for the control to be displayed on-screen; returns an empty string if null; since the text
   * is rendered on-screen as browser-native HTML, the equivalent of an empty tag (e.g., &lt;span\&gt;) would be an
   * enclosing tag with an empty string (no content): &lt;span&gt;&lt;/span&gt;.  To return null would be equivalent to
   * &lt;span&gt;null&lt;/span&gt;, which is not the same as &lt;span/&gt;
   * @return {String}
   */
  Block_prototype.getText = function() {
    return this.jsxtext;
  };

  /**
   * Sets the text/HTML for the control to be displayed on-screen;
   *            returns reference to self to facilitate method chaining;
   * @param strText {String} text/HTML
   * @param bRepaint {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.
   * @return {jsx3.gui.Block}
   */
  Block_prototype.setText = function(strText, bRepaint) {
    this.jsxtext = strText;
    if (bRepaint) {
      if (this.getChild(0) != null || this.getBoxProfile(true).getChildProfile(0) != null) {
        this.repaint();
      } else {
        var objGUI = this.getRendered();
        if (objGUI != null) objGUI.innerHTML = strText;
      }
    }
    return this;
  };

  /**
   * Returns the CSS text-align property for the object; if no property value exists, jsx3.gui.Block.ALIGNLEFT is returned by default
   * @return {String} one of: jsx3.gui.Block.ALIGNLEFT, jsx3.gui.Block.ALIGNRIGHT, jsx3.gui.Block.ALIGNCENTER
   */
  Block_prototype.getTextAlign = function() {
    return this.jsxtextalign;
  };

  /**
   * Sets the CSS text-align property for the object;
   *            returns reference to self to facilitate method chaining;
   * @param ALIGN {String} one of: jsx3.gui.Block.ALIGNLEFT, jsx3.gui.Block.ALIGNRIGHT, jsx3.gui.Block.ALIGNCENTER
   * @return {jsx3.gui.Block}
   */
  Block_prototype.setTextAlign = function(ALIGN) {
    this.jsxtextalign = ALIGN;
    return this;
  };

  /**
   * Returns the tooltip text to display when the object is hovered over.
   * @return {String}
   */
  Block_prototype.getTip = function() {
    return this.jsxtip;
  };

  /**
   * Sets the tooltip text to display when the object is hovered over; updates the model and the view
   * immediately. Note that the tip text is rendered natively by the browser and that the behavior may vary
   * between browsers. Some browsers may honor line breaks in the text and some may have a maximum length that
   * then show before truncating the tip. For more consistent rendering across browsers use the <code>SPYGLASS</code>
   * event instead.
   *
   * @param strTip {String} the tip text.
   * @return {jsx3.gui.Block} this object.
   */
  Block_prototype.setTip = function(strTip) {
    this.jsxtip = strTip;
    var objGUI;
    if(objGUI = this.getRendered()) objGUI.title = strTip;
    return this;
  };

  /**
   * Returns the top property of this object.
   * @return {int | String} top.
   */
  Block_prototype.getTop = function() {
    return this.jsxtop;
  };

  /**
   * Sets the top property of this object. The top property specifies the vertical offset of this object
   * from its parent and only applies if this object is absolutely positioned.
   * @param vntTop {int|String} the top value. Only numeric values and percentages are supported. For example: 25, -10, 20%.
   * @param bUpdateView {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.
   * @return {jsx3.gui.Block} this object.
   */
  Block_prototype.setTop = function(vntTop,bUpdateView) {
    //update the model
    this.jsxtop = vntTop;

    if (bUpdateView) {
      if (isNaN(vntTop)) vntTop = 0;
      this.syncBoxProfile({top:vntTop}, true);
    } else {
      this.clearBoxProfile(false);
    }

    return this;
  };

  /**
   * tries to find an on-screen reference for the given object, appropriate to the css property being applied
   * Subclasses of Block should return the appropriate object where necessary
   * @param strCSSName {String} CSS property name
   * @private
   */
  Block_prototype._findGUI = function(strCSSName) {
    return this.getRendered();
  };

  /**
   * tries to find an on-screen reference for the given object and update its CSS without forcing a repaint
   * @param strCSSName {String} CSS property name
   * @param strCSSValue {String} CSS property value
   * @private
   */
  Block_prototype.updateGUI = function(strCSSName,strCSSValue) {
    var objGUI = this._findGUI(strCSSName);
    if (objGUI != null) {
      try {
        objGUI.style[strCSSName] = strCSSValue;
      } catch(e) {;}
    }
  };

  /**
   * Returns the visibility property for the object
   * @return {String} [jsx3.gui.Block.VISIBILITYVISIBLE, jsx3.gui.Block.VISIBILITYHIDDEN]
   */
  Block_prototype.getVisibility = function() {
    return this.jsxvisibility;
  };

  /**
   * Sets the CSS visibility property the object
   * @param VISIBILITY {String} [jsx3.gui.Block.VISIBILITYVISIBLE, jsx3.gui.Block.VISIBILITYHIDDEN]
   * @param bUpdateView {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.
   */
  Block_prototype.setVisibility = function(VISIBILITY,bUpdateView) {
    if (VISIBILITY != Block.VISIBILITYHIDDEN)
      VISIBILITY = Block.VISIBILITYVISIBLE;
      
    //update the model
    this.jsxvisibility = VISIBILITY;

    //immediately upate view if user passed true for repaint
    if (bUpdateView) this.updateGUI("visibility",VISIBILITY);
    return this;
  };

  /**
   * Returns the width property of this object.
   * @return {int|String} width.
   */
  Block_prototype.getWidth = function() {
    return this.jsxwidth;
  };

  /**
   * Sets the width property of this object.
   * @param vntWidth {int | String} the width as non-negative integer or non-negative percentage. For example: 45%, 12.
   * @param bUpdateView {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.
   * @return {jsx3.gui.Block} this object.
   */
  Block_prototype.setWidth = function(vntWidth, bUpdateView) {
    //update the model
    this.jsxwidth = vntWidth;

    //update the boxprofile
    if (bUpdateView) {
      this.syncBoxProfile({width:vntWidth}, true);
    } else {
      this.setBoxDirty();
    }

    return this;
  };

  /**
   * Returns the CSS z-index property
   * @return {int}
   */
  Block_prototype.getZIndex = function() {
    return this.jsxzindex;
  };

  /**
   * Sets the CSS z-index for the object
   * @param intZIndex {int} z-index value
   * @param bUpdateView {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.
   */
  Block_prototype.setZIndex = function(intZIndex, bUpdateView) {
    //update the model
    this.jsxzindex = intZIndex;

    //immediately upate view if user passed true for repaint
    if(bUpdateView) this.updateGUI("zIndex",intZIndex);
    return this;
  };

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the view for the dialog instance
   * @private
   */
  Block_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
//    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 2);
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 4);
  };

  /**
   * Creates the box model/profile for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @private
   */
  Block_prototype.createBoxProfile = function(objImplicit) {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if (this.getParent() && (objImplicit == null || ((isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if(objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    //determine properties that affect position (relative/abs)
    var bRelative = ((objImplicit.boxtype && objImplicit.boxtype != "box") || this.getRelativePosition() != 0);
    var myLeft = (bRelative) ? null : ((objImplicit.left) ? objImplicit.left : this.getLeft());
    var myTop = (bRelative) ? null : ((objImplicit.top) ? objImplicit.top : this.getTop());
    if(!bRelative && !myLeft) myLeft = 0;
    if(!bRelative && !myTop) myTop = 0;
    var tag, pad, mar, bor;

    //update/set layout properties
    if(!objImplicit.boxtype) objImplicit.boxtype = (bRelative) ? "relativebox" : "box";
    if(objImplicit.tagname == null) objImplicit.tagname = ((tag = this.getTagName())) ? tag.toLowerCase() : jsx3.gui.Block.DEFAULTTAGNAME;
    if(objImplicit.left == null && objImplicit.boxtype == "box") objImplicit.left = myLeft;
    if(objImplicit.top == null && objImplicit.boxtype == "box") objImplicit.top = myTop;
    if(objImplicit.width == null) objImplicit.width = (objImplicit.width) ? objImplicit.width : this.getWidth();
    if(objImplicit.height == null) objImplicit.height = (objImplicit.height) ? objImplicit.height : this.getHeight();

    //set this block as a container if it is 100% wide
    if(objImplicit.width == "100%" || (objImplicit.tagname == "div" && this.paintText() == "")) {
      if (objImplicit.tagname == "span")
        objImplicit.tagname = "div";
      objImplicit.container = true;
    }

    //add margin,border, and padding properties to the implicit object (parents do not pass these, so don't check for null)
    if((pad = this.getPadding()) != null && pad != "") objImplicit.padding = pad;
    if(bRelative && (mar = this.getMargin()) != null && mar != "") objImplicit.margin = mar;
    if((bor = this.getBorder()) != null && bor != "") objImplicit.border = bor;

    //return the explicit object (e.g., the box profile)
    return new jsx3.gui.Painted.Box(objImplicit);
  };

  /**
   * Sets the CDF ID of the record to map to. Updates to show the new mapped value
   * @param strCDFId {String} If not set, the CDF Id used by the nearest ancestor of type <code>jsx3.gui.CDF</code> will be used.
   */
  Block_prototype.setCDFId = function(strCDFId) {
    this.jsxcdfid = strCDFId;
    var objCDF = this.getAncestorOfType("jsx3.gui.CDF");
    if(objCDF)
      objCDF.read();
  };


  /**
   * Returns the CDF ID of the record to map to.
   * @returns {String}
   */
  Block_prototype.getCDFId = function() {
    return this.jsxcdfid;
  };


  /**
   * Sets the named attribute on the CDF record to which this object is mapped. Updates to show the new mapped value
   * @param strAttName {String}
   */
  Block_prototype.setCDFAttribute = function(strAttName) {
    this.jsxcdfattribute = strAttName;
    var objCDF = this.getAncestorOfType("jsx3.gui.CDF");
    if(objCDF)
      objCDF.read();
  };


  /**
   * Returns the named attribute on the CDF record to which this object is mapped.
   * @returns {String}
   */
  Block_prototype.getCDFAttribute = function() {
    return this.jsxcdfattribute;
  };


  /**
   * Returns the DHTML, used for this object's on-screen view
   * @param strData {String} Text/HTML markup that will replace value of getText() during paint&#8212;typically passed by subclass, JSXBlockX after it performs an XML/XSL merge to acquire its data; for memory management purposes, the data is not set via setText() and, instead, is passed as a temporary input parameter, as the object's model would contain the text for no reason
   * @return {String} DHTML
   */
  Block_prototype.paint = function(strData) {
    //apply any dynamic properties that this instance has registered
//apply twice?  what to do with dp types that affect layout that should be applied during box profiling and those that apply to the "skinning/surfacing" of an object
    this.applyDynamicProperties();

    //if paint method called by subclass instance--an instance of JSXBlockX, use strData, not this.getText();
    strData = (strData == null) ? this.paintText() : strData;

    //determine CSS style attributes unique to this JSXBlock instance
    var strId = this.getId();

    //bind programmatic listeners for drag, drop, spy, key, and move operations; either or; not both due to incompatibilities (some of these share the mousedown and therefore can collide--hence the if statement)
    //rules:  (Spyglass && (Move || Menu || Drag/Drop) && keydown)
    var eventMap = {};
    if (this.hasEvent(Interactive.JSXDOUBLECLICK))
      eventMap[Event.DOUBLECLICK] = true;
    if (this.hasEvent(Interactive.JSXCLICK))
      eventMap[Event.CLICK] = true;
    if (this.hasEvent(Interactive.JSXKEYDOWN))
      eventMap[Event.KEYDOWN] = true;

    var strSuppl = "";

    if (this.getCanSpy() == 1) {
      eventMap[Event.MOUSEOVER] = true;
      eventMap[Event.MOUSEOUT] = true;
    }

    if (this.getCanMove() == 1) {
      if (this.getCanMove() == 1) {
        eventMap[Event.MOUSEDOWN] = "doBeginMove";
      }
    } else if (this.getMenu() != null) {
      eventMap[Event.MOUSEUP] = true;
    } else if (this.getCanDrop() == 1) {
      eventMap[Event.MOUSEUP] = true;
    }

    if (eventMap[Event.MOUSEDOWN] == null && this.getCanDrag() == 1) {
      eventMap[Event.MOUSEDOWN] = "doBeginDrag";
      strSuppl += ' JSXDragId="' + strId + '" JSXDragType="JSX_GENERIC"';
    }

    //get custom 'view' properties(custom props to add to the rended HTML tag)
    var strEvents = this.renderHandlers(eventMap, 0) + strSuppl;
    var strAttributes = this.renderAttributes(null, true);

    //render the outer-most box
    var b1 = this.getBoxProfile(true);
    b1.setAttributes(this.paintIndex() + this.paintTip() + strEvents + ' id="' + strId + '"' + this.paintLabel() + ' class="' + this.paintClassName() + '" ' + strAttributes);
    b1.setStyles(this.paintFontSize() + this.paintBackgroundColor() + this.paintBackground() + this.paintColor() + this.paintOverflow() + this.paintFontName() + this.paintZIndex() + this.paintFontWeight() + this.paintTextAlign() + this.paintCursor() + this.paintVisibility() + this.paintBlockDisplay() + this.paintCSSOverride());

    return b1.paint().join(strData + this.paintChildren());
  };

  Block_prototype._ebMouseOver = function(objEvent, objGUI) {
    if (this.getCanSpy() == 1)
      this.doSpyOver(objEvent, objGUI);
    if (this.getCanDrop() == 1)
      this.doDrop(objEvent, objGUI, jsx3.EventHelp.ONBEFOREDROP);
  };

  Block_prototype._ebMouseOut = function(objEvent, objGUI) {
    if (this.getCanSpy() == 1)
      this.doSpyOut(objEvent, objGUI);
    if (this.getCanDrop() == 1)
      this.doDrop(objEvent, objGUI, jsx3.EventHelp.ONCANCELDROP);
  };

  Block_prototype._ebMouseUp = function(objEvent, objGUI) {
    if (this.getCanDrop() == 1)
      this.doDrop(objEvent, objGUI, jsx3.EventHelp.ONDROP);
    else
      this.jsxsupermix(objEvent, objGUI);
  };

  Block_prototype.paintLabel = function() {
    var name = this.getName();
    return name != null ? ' label="' + name + '"' : "";
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  Block_prototype.paintBackgroundColor = function() {
    var bgc = this.getBackgroundColor();
    return bgc ? "background-color:" + bgc + ";" : "";
  };

  /**
   * renders valid CSS property value for the background such as:  background-image:url(x.gif);  or background-image:url(x.gif);background-repeat:no-repeat;
   * @return {String} valid CSS property for the background such as:  background-image:url(x.gif);  or background-image:url(x.gif);background-repeat:no-repeat;
   * @private
   */
  Block_prototype.paintBackground = function() {
    return (this.getBackground()) ? this.getBackground() + ";" : "";
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  Block_prototype.paintColor = function() {
//    return "color:" + ((this.getColor()) ? this.getColor() : Block.DEFAULTCOLOR)  + ";";
    var c = this.getColor();
    return c ? "color:" + c + ";" : "";
  };

  /**
   * renders valid CSS property value, (e.g., default,wait,col-resize); if no value or an empty string, null is returned
   * @return {String} valid CSS property value, (e.g., default,wait,col-resize)
   * @private
   */
  Block_prototype.paintCursor = function() {
    var c = this.getCursor();
    return c ? "cursor:" + c + ";" : "";
  };

  /**
   * renders CSS name/value properties specific to this object to override standard library of properties provided via the standard JSX getters/setters
   * @return {String} CSS property(s) (e.g., border:solid 1px;)
   * @private
   */
  Block_prototype.paintCSSOverride = function() {
    return (this.getCSSOverride()) ? this.getCSSOverride() : "";
  };

  /**
   * Returns the css class name (CSS property name without the leading ".")
   * @return {String}
   * @private
   */
  Block_prototype.paintClassName = function() {
    var cn = this.getClassName();
    return Block.DEFAULTCLASSNAME + (cn ? " " + cn : "");
  };

  /**
   * called by the paint method for a given class; determines how to generate the given CSS property
   * @return {String} combined CSS property (i.e., display:none;)
   * @private
   */
  Block_prototype.paintBlockDisplay = function() {
    //treat blocks more like containers and other controls as inline elements. if a width is defined, treat as a true block not, inline block
    if (jsx3.util.strEmpty(this.getDisplay()) || this.getDisplay() == "block") {
      if(this.getWidth() == "100%") {
        return "display:block;";
      } else {
        return "";
      }
    } else if(this.getDisplay() == "none") {
      return "display:none;";
    }
    return "";
  };

  /**
   * called by the paint method for a given class; determines how to generate the given CSS property
   * @return {String} combined CSS property (i.e., display:none;)
   * @private
   */
  Block_prototype.paintDisplay = function() {
    //TO DO: the following logic is wrong...change force explicit none???
    var d = this.getDisplay();
    return (jsx3.util.strEmpty(d) || d == Block.DISPLAYBLOCK) ? "" : "display:none;";
  };

  /**
   * renders the CSS font-family for the object
   * @return {String} valid CSS font-family property value
   * @private
   */
  Block_prototype.paintFontName = function() {
    var fn = this.getFontName();
    return fn ? "font-family:" + fn + ";" : "";
  };

  /**
   * renders the CSS font-size for the object
   * @private
   */
  Block_prototype.paintFontSize = function() {
    var fs = parseInt(this.getFontSize());
    return isNaN(fs) ? "" : "font-size:" + fs + "px;";
  };

  /**
   * renders the CSS font-weight for the object ("bold" or "normal")
   * @return {String}
   * @private
   */
  Block_prototype.paintFontWeight = function() {
    var fw = this.getFontWeight();
    return fw ? "font-weight:" + fw + ";" : "";
  };

  /**
   * generates DHTML property value for tabIndex&#8212;called programmatically by paint methods for various GUI classes
   * @return {String} DHTML in form of tabIndex='n'
   * @private
   */
  Block_prototype.paintIndex = function(intIndex) {
    if (intIndex == null) intIndex = this.getIndex();
    // HACK: see IE's jsx3.html.isFocusable()
    return (intIndex != null && this.jsxenabled != 0) ? ' tabindex="' + intIndex + '" jsxtabindex="' + intIndex + '"' : '';
  };

  /**
   * renders overflow css
   * @return {String} combined CSS property (i.e., overflow:auto;)
   * @private
   */
  Block_prototype.paintOverflow = function() {
    if (this.getOverflow() == Block.OVERFLOWSCROLL) {
      return "overflow:auto;";
    } else if (this.getOverflow() == Block.OVERFLOWHIDDEN) {
      return "overflow:hidden;";
    } else {
      return "";
    }
  };

  /**
   * renders the text/HTML for the control to be displayed on-screen; returns an empty string if null; since the text is rendered on-screen as browser-native HTML, the equivalent of an empty tag (e.g., <span\>) would be an enclosing tag with an empty string (no content): <span></span>.  To return null would be equivalent to <span>null</span>, which is not the same as <span\>
   * @return {String}
   * @private
   */
  Block_prototype.paintText = function() {
    return (this.getText()) ? this.getText() : ""; //jsx3.gui.Block.DEFAULTTEXT;
  };

  /**
   * renders the CSS text-align property for the object; if no property value exists, jsx3.gui.Block.ALIGNLEFT is returned by default
   * @return {String}
   * @private
   */
  Block_prototype.paintTextAlign = function() {
    var ta = this.getTextAlign();
    return ta ? "text-align:" + ta + ";" : "";
  };

  /**
   * generates DHTML property value for a 'title', including the keycode accelerator if applicable
   * @return {String} DHTML in form of tabTip='n'
   * @private
   */
  Block_prototype.paintTip = function() {
    var myTip = this.getTip();
    if (myTip != null) {
      //escape any apostrophes and return if not null; typically, it would be strings that aren't allowed, but I like the rsquo symbol for cosmetic reasons
      myTip = myTip.replace(/"/g, "&quot;");
      return myTip ? ' title="' + myTip + '" ' : "";
    } else if (jsx3.gui.Form && this.instanceOf(jsx3.gui.Form)) { // TODO: remove dependency on subclass
      var myBinding = this.getKeyBinding();
      return myBinding ? ' title="' + myBinding.replace(/"/g, "&quot;") + '" ' : ""; // TODO: format key binding
    } else {
      return "";
    }
  };

  /**
   * called by the paint method for a given class; determines how to generate the given CSS property
   * @return {String} combined CSS property (i.e., visibility:hidden;)
   * @private
   */
  Block_prototype.paintVisibility = function() {
    return this.getVisibility() == Block.VISIBILITYHIDDEN ? "visibility:hidden;" : "";
  };

  /**
   * renders the CSS z-index property. Default: 1
   * @private
   */
  Block_prototype.paintZIndex = function() {
    var z = this.getZIndex();
    return isNaN(z) ? "" : "z-index:" + z + ";";
  };


  /**
   * Displays a "blocking mask" inside the block to stop user interactions with content within the block. Applies only to Blocks. Use only on blocks with no padding and with overflow set to hidden.
   * @param strMessage {String} text/message to display in the blocking mask to tell the user it is disabled
   */
  Block_prototype.showMask = function(strMessage) {
    //delete any existing mask
    if (this._jsxmaskid) this.hideMask();

    //is there an onscreen instance
    var objGUI;
    if(objGUI = this.getRendered()) {
      //get the true height of the block to mask
      var intHeight = this.getAbsolutePosition().H;

      //add/replace "onfocus" method for view (this way there is no problem when serializing the model)
      if (objGUI.onfocus)
      /* @jsxobf-clobber */
        objGUI._jsxonfocus = objGUI.onfocus;

      jsx3.html.addEventListener(objGUI,"onfocus",Block._focusMask);

      //add/replace "tabIndex" setting (also for view)
      if (objGUI.tabIndex) objGUI._jsxtabindex = objGUI.tabIndex;
      objGUI.tabIndex = 0;

      //create the mask child (a jsx3.gui.Block instance) and insert directly into the view
      /* @jsxobf-clobber */
      this._jsxmaskid  = this.getId() + "_mask";
      var objMask = (new Block(this._jsxmaskid,0,0,"100%","100%",strMessage)).setOverflow(Block.OVERFLOWHIDDEN).setFontWeight(Block.FONTBOLD).setTextAlign(Block.ALIGNCENTER).setIndex(0).setRelativePosition(0).setZIndex(32000).setDynamicProperty("jsxbgcolor","@Solid Shadow").setDynamicProperty("jsxbg","@Mask 70%").setDynamicProperty("jsxcursor","@Wait");
      objMask.setWidth("100%");
      objMask.setHeight("100%");
      objMask.setPadding(parseInt(intHeight / 2));
      objMask.setEvent("if (objEVENT.tabKey() && objEVENT.shiftKey()) { this.getParent().focus(); }",Interactive.JSXKEYDOWN);
      objMask.setAttribute("onfocus", "var objEVENT = jsx3.gui.Event.wrap(event); if (objEVENT.shiftKey()) { jsx3.GO(this.id).getParent().focus(); }");
      this.setChild(objMask);
      this.paintChild(objMask);
      objMask.focus(); // In case focus is still on one of the masked form control.
    }
  };

  /**
   * handles the focus event for a masked block. Routes focus to the last child (a temporary child in the JSX DOM)
   * @private
   * @jsxobf-clobber
   */
  Block._focusMask = function(evt) {
    var me = jsx3.GO(this.id);
    if (me) {
      var objEvent = Event.wrap(evt || window.event); // evt for Fx, window.event for IE
      if (! objEvent.shiftKey()) {
        if (me.getChildren().length)
          me.getLastChild().focus();
      }
    }
  };

  /**
   * Removes the "blocking" mask inside the block to stop user interactions with existing content
   */
  Block_prototype.hideMask = function() {
    var objMask;
    if(objMask = this.getChild(this._jsxmaskid)) {
      //update model
      this.removeChild(objMask);
      delete this._jsxmaskid;

      //update view
      var objGUI;
      if(objGUI = this.getRendered()) {
        //remove/replace tabIndex setting used to support masking
        if (objGUI._jsxtabindex) {
          objGUI.tabIndex = objGUI._jsxtabindex;
        } else {
          objGUI.removeAttribute("tabIndex");
        }

        //remove/replace onfocus method used to support masking
        jsx3.html.removeEventListener(objGUI,"onfocus",Block._focusMask);
        if(objGUI._jsxonfocus) {
          objGUI.onfocus = objGUI._jsxonfocus;
          delete objGUI._jsxonfocus;
        } else {
          //objGUI.onfocus = null;
        }
      }
    }
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Block.getVersion = function() {
    return "3.00.00";
  };

/* @JSC :: end */

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.Block
 * @see jsx3.gui.Block
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Block", -, null, function(){});
 */
jsx3.Block = jsx3.gui.Block;

/* @JSC :: end */
