/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Block");

// @jsxobf-clobber-shared  repaintTaskBar

/**
 * jsx3.gui.WindowBar instances are used as the captionbar for JSXDialog and JSXAlert instances. They can contain any object type supported by the JSXBlock class. Developers will not instantiate this class (although it is possible); instead, when a new dialog is instanced, it will bind an instance of this class as a child for use as a captionbar container.
 */
jsx3.Class.defineClass("jsx3.gui.WindowBar", jsx3.gui.Block, null, function(WindowBar, WindowBar_prototype) {

  var Block = jsx3.gui.Block;

  /**
   * {int} 26 (default)
   */
  WindowBar.DEFAULTHEIGHT = 26;

  /**
   * {String} The default background pattern
   */
  WindowBar.DEFAULTBACKGROUND = jsx3.html.getCSSFade(false);

  /**
   * {String} #c8c8d5 (default)
   */
  WindowBar.DEFAULTBG = "#c8c8d5";

  /**
   * {String} #ffffff (default)
   */
  WindowBar.DEFAULTBGCAPTION = "#aaaacb";

  /**
   * {String} solid 1px #e8e8f5;solid 0px;solid 1px #a8a8b5;solid 0px; (default)
   */
  WindowBar.DEFAULTBORDER = "solid 1px #e8e8f5;solid 0px;solid 1px #a8a8b5;solid 0px;";

  /**
   * {String} solid 1px #9898a5;solid 1px #9898a5;solid 1px #9898a5;solid 1px #9898a5; (default)
   */
  WindowBar.DEFAULTBORDERCAPTION = "solid 1px #9898a5";

  /**
   * {String} jsx3.gui.Block.FONTBOLD (default)
   */
  WindowBar.DEFAULTFONTWEIGHT = Block.FONTBOLD;

  /**
   * {int} 11 (default)
   */
  WindowBar.DEFAULTFONTSIZE = 11;

  /**
   * {int} 0 (default)
   * @final @jsxobf-final
   */
  WindowBar.TYPECAPTION = 0;

  /**
   * {int} 1
   * @final @jsxobf-final
   */
  WindowBar.TYPETOOL = 1;

  /**
   * {int} 2
   * @final @jsxobf-final
   */
  WindowBar.TYPEMENU = 2;

  /**
   * {int} 3
   * @final @jsxobf-final
   */
  WindowBar.TYPETASK = 3;

  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param TYPE {int} one of: jsx3.gui.WindowBar.TYPECAPTION, jsx3.gui.WindowBar.TYPETOOL, jsx3.gui.WindowBar.TYPEMENU, jsx3.gui.WindowBar.TYPETASK
   */
  WindowBar_prototype.init = function(strName,TYPE) {
    //call constructor for super class
    this.jsxsuper(strName);

    //set property values unique to the jsx3.gui.WindowBar class
    this.setRelativePosition(Block.RELATIVE);
    if (TYPE != null) this.setType(TYPE);
  };

  /**
   * Returns resizeMask property as an object array, defining what actions are available
   *          to the resizeMask for the given control (resize horizontally/vertically; is moveable, etc.)
   * @return {Object<String, boolean>} object array with boolean values for the following properties: NN,SS,EE,WW,MM
   * @private
   */
  WindowBar_prototype.getMaskProperties = function() {
    return this.getRelativePosition() == Block.ABSOLUTE ? Block.MASK_MOVE_ONLY : Block.MASK_NO_EDIT;
  };

  /**
   * Returns the type of the window bar; one of: jsx3.gui.WindowBar.TYPECAPTION, jsx3.gui.WindowBar.TYPETOOL, jsx3.gui.WindowBar.TYPEMENU, jsx3.gui.WindowBar.TYPETASK
   * @return {int} one of: jsx3.gui.WindowBar.TYPECAPTION, jsx3.gui.WindowBar.TYPETOOL, jsx3.gui.WindowBar.TYPEMENU, jsx3.gui.WindowBar.TYPETASK
   */
  WindowBar_prototype.getType = function() {
    return (this.jsxbartype == null) ? WindowBar.TYPECAPTION : this.jsxbartype;
  };

  /**
   * Returns the type of the window bar;
   *            returns reference to self to facilitate method chaining;
   * @param TYPE {int} one of: jsx3.gui.WindowBar.TYPECAPTION, jsx3.gui.WindowBar.TYPETOOL, jsx3.gui.WindowBar.TYPEMENU, jsx3.gui.WindowBar.TYPETASK
   * @return {jsx3.gui.WindowBar} this object
   */
  WindowBar_prototype.setType = function(TYPE) {
    this.jsxbartype = TYPE;
    this.setBoxDirty();
    return this;
  };

  /**
   * calls super method in Block but if bRepaint is true, then also repaints task bar
   * @param strText {String} text/HTML
   * @param bRepaint {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.
   * @return {jsx3.gui.WindowBar}
   */
  WindowBar_prototype.setText = function(strText, bRepaint) {
    this.jsxsuper(strText, bRepaint);
    if (bRepaint) {
      if (this.getType() == WindowBar.TYPECAPTION) {
        var parent = this.getParent();
        if (parent instanceof jsx3.gui.Dialog && parent.getRendered() != null) {
          parent.repaintTaskBar();
        }
      }
    }
    return this;
  };

  WindowBar_prototype.doBeginMove = function(objEvent, objGUI) {
    //3.7: WindowBar should not cancel a move unless the object being dragged is an implementation of jsx3.gui.Form (typcically a button)
    if (!jsx3.html.getJSXParent(objEvent.srcElement()).instanceOf("jsx3.gui.Form"))
      this.getParent().doBeginMove(objEvent, objGUI);
  };

  WindowBar.BRIDGE_EVENTS = {};
  WindowBar.BRIDGE_EVENTS[jsx3.gui.Event.MOUSEDOWN] = "doBeginMove";

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  WindowBar_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    //3.7: added conditional to change the mode to '4' when a caption bar, since caption bars inject text at child position 0 (like Block)
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, this.getType() == WindowBar.TYPECAPTION ? 4 : 2);
  };

  /**
   * Creates the box model/profile for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @private
   */
  WindowBar_prototype.createBoxProfile = function(objImplicit) {
    //apply any dynamic properties that this instance has registered (borders can be dynamic, so it must be udpate here)
    this.applyDynamicProperties();

    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if(this.getParent() && (objImplicit == null || ((!isNaN(objImplicit.parentwidth) && !isNaN(objImplicit.parentheight))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if(objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    var bor = this.getBorder();

    //create the outer box
    var bRelative = this.getRelativePosition() !== 0;
    if(objImplicit.left == null && (!bRelative && !jsx3.util.strEmpty(this.getLeft()))) objImplicit.left = this.getLeft();
    if(objImplicit.top == null && (!bRelative && !jsx3.util.strEmpty(this.getTop()))) objImplicit.top = this.getTop();
    if(objImplicit.width == null) objImplicit.width = "100%";
    if(objImplicit.height == null) objImplicit.height = this.getHeight() || WindowBar.DEFAULTHEIGHT;
    if (!objImplicit.boxtype)objImplicit.boxtype = bRelative ? "inline" : "box";
    objImplicit.tagname = "div";
    objImplicit.padding = this.getPadding() || "0 0 0 4";
    objImplicit.border = (bor != null) ? bor : ((this.getType() == WindowBar.TYPECAPTION) ? WindowBar.DEFAULTBORDERCAPTION : WindowBar.DEFAULTBORDER);
    var b1 = new jsx3.gui.Painted.Box(objImplicit);

    //caption bars (on dialog boxes) have labels
    if (this.getType() == WindowBar.TYPECAPTION) {
      //create the label box
      var o = {};
      o.left = 6;
      o.top = 6;
      o.tagname = "span";
      o.boxtype = "box";
      var b1a = new jsx3.gui.Painted.Box(o);
      b1.addChildProfile(b1a);
    }

    return b1;
  };

  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  WindowBar_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //get the box profile (the lines and boxes to paint)
    var b1 = this.getBoxProfile(true);

    //branch based on bar type (dialog captionbars are unique)
    var strCursor = null, strEvents = null, strText = null;
    if (this.getType() == WindowBar.TYPECAPTION) {
      //render the label box
      var b1a = b1.getChildProfile(0);
      b1a.setAttributes('class="jsx30windowbar_lbl"');
      b1a.setStyles(this.paintColor() + this.paintFontWeight() + this.paintFontName() + this.paintFontSize());
      strText = b1a.paint().join(this.paintText());
      strCursor = "cursor:move;";
      strEvents = this.renderHandlers(WindowBar.BRIDGE_EVENTS, 0);
    } else {
      strCursor = "cursor:default;";
      strEvents = "";
      strText = "";
    }

    //render custom atts
    var strAttributes = this.renderAttributes(null, true);

    //render the outer box
    b1.setAttributes('id="' + this.getId() + '"' + this.paintLabel() + this.paintTip() + this.paintIndex() + strEvents + ' class="jsx30windowbar"' + strAttributes);
    b1.setStyles(strCursor + this.paintTextAlign() + this.paintBackgroundColor() + this.paintZIndex() + this.paintBackground() + this.paintCSSOverride());

    //return final string of HTML
    return b1.paint().join(strText + this.paintChildren());
  };

  /**
   * generates DHTML property value for tabIndex--called programmatically by paint methods for various GUI classes
   * @return {String} DHTML in form of tabIndex='n'
   * @private
   */
  WindowBar_prototype.paintIndex = function() {
    return this.jsxsuper(this.getIndex() || Number(0));
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  WindowBar_prototype.paintBackgroundColor = function() {
    //caption bars (used for dialogs) have a different default bgcolor than all other window bar types.  don't know why...just part of the L&F
    var bg = this.getBackgroundColor();
    return (bg == null || bg != "") ? ("background-color:" + (bg ? bg :
        ((this.getType() == WindowBar.TYPECAPTION) ? WindowBar.DEFAULTBGCAPTION : WindowBar.DEFAULTBG)) + ";") : "";
  };

  /**
   * renders valid CSS bg property
   * @return {String}
   * @private
   */
  WindowBar_prototype.paintBackground = function() {
    //menus have no settable 'bg' and either inherit their 'bgcolor' from an ancestor or set a 'bgcolor' of their own
    if(this.getType() == WindowBar.TYPEMENU) return "";

    //all other types get the default faded bg if not specified.
    var bg = this.getBackground();
    return (bg == null) ? WindowBar.DEFAULTBACKGROUND : bg;

    //3.2: removed following
    //return (bg == null || bg != "") ? ((this.getType() != WindowBar.TYPEMENU) ? WindowBar.DEFAULTBACKGROUND : "") : "";
  };

  WindowBar_prototype.getHeight = function() {
    var height = this.jsxsuper();
    if (height == null || isNaN(height)) height = WindowBar.DEFAULTHEIGHT;
    return height;
  };

  /**
   * renders the CSS font-weight for the object ("bold" or "normal")
   * @return {String}
   * @private
   */
  WindowBar_prototype.paintFontWeight = function() {
    return (this.getFontWeight()) ? ("font-weight:" + this.getFontWeight() + ";") : ("font-weight:" + Block.FONTBOLD + ";");
  };

  /**
   * renders the CSS font-size for the object
   * @return {int} font-size (in pixels)
   * @private
   */
  WindowBar_prototype.paintFontSize = function() {
    return "font-size:" + ((this.getFontSize()) ? this.getFontSize() : WindowBar.DEFAULTFONTSIZE) + "px;";
  };

  /**
   * renders the CSS text-align property for the object; if no property value exists, jsx3.gui.Block.ALIGNLEFT is returned by default
   * @return {String}
   * @private
   */
  WindowBar_prototype.paintTextAlign = function() {
    return "text-align:" + ((this.getTextAlign()) ? this.getTextAlign() : ((this.getType()==WindowBar.TYPECAPTION)?Block.ALIGNRIGHT:Block.ALIGNLEFT)) + ";";
  };

  /**
   * renders the text/HTML for the control to be displayed on-screen; returns an empty string if null; since the text is rendered on-screen as browser-native HTML, the equivalent of an empty tag (e.g., <span\>) would be an enclosing tag with an empty string (no content): <span></span>.  To return null would be equivalent to <span>null</span>, which is not the same as <span\>
   * @return {String}
   * @private
   */
  WindowBar_prototype.paintText = function() {
    return (this.getText()) ? this.getText() : "";
  };

  /**
   * alerts the user's attention to the windowbar by making its caption bar 'flash' on-screen (as it typical with a windows modal dialog)
   * @private
   */
  WindowBar_prototype.beep = function() {
    jsx3.gui.shakeStyles(this.getRendered(), {filter:'none', backgroundColor: "#FFFFFF", backgroundImage:''});
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  WindowBar.getVersion = function() {
    return "2.4.00";
  };

/* @JSC :: end */

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.WindowBar
 * @see jsx3.gui.WindowBar
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.WindowBar", -, null, function(){});
 */
jsx3.WindowBar = jsx3.gui.WindowBar;

/* @JSC :: end */
