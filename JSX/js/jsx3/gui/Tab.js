/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Block");

// @jsxobf-clobber-shared  _revealTab _getContentPaneDimensions _updateAutoScrollDisplay _getTabContainerElement _getTabOffsetWidths

/**
 * Renders a tab in a tabbed pane. An instance of this class must be child of an instance of
 * <code>jsx3.gui.TabbedPane</code>. A tab should have exactly one child, usually a <code>jsx3.gui.Block</code>,
 * which holds all of its content.
 *
 * @see jsx3.gui.TabbedPane
 */
jsx3.Class.defineClass("jsx3.gui.Tab", jsx3.gui.Block, null, function(Tab, Tab_prototype) {

  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;

  /**
   * {String}
   */
  Tab.DEFAULTBEVELIMAGE = jsx3.resolveURI("jsx:///images/tab/bevel.gif");

  /**
   * {String} #e8e8f5
   */
  Tab.DEFAULTACTIVECOLOR = "#e8e8f5";

  /**
   * {String} #d8d8e5
   */
  Tab.DEFAULTINACTIVECOLOR = "#d8d8e5";

/* @JSC :: begin DEP */

  /**
   * {String} #f6f6ff
   * @deprecated
   */
  Tab.DEFAULTHIGHLIGHT = "#f6f6ff";

  /**
   * {String} #a6a6af
   * @deprecated
   */
  Tab.DEFAULTSHADOW = "#a6a6af";

/* @JSC :: end */

  /**
   * {String}
   */
  Tab.ACTIVEBEVEL =jsx3.resolveURI("jsx:///images/tab/on.gif");

  /**
   * {String}
   */
  Tab.INACTIVEBEVEL = jsx3.resolveURI("jsx:///images/tab/off.gif");

/* @JSC */ if (jsx3.CLASS_LOADER.IE6) {
  jsx3.html.loadImages(Tab.DEFAULTBEVELIMAGE, Tab.ACTIVEBEVEL, Tab.INACTIVEBEVEL);
/* @JSC */ }
    
  /**
   * {String} #e8e8f5
   */
  Tab.CHILDBGCOLOR = "#e8e8f5";

  /**
   * {int} 0 : disabled
   * @final @jsxobf-final
   */
  Tab.STATEDISABLED = 0;

  /**
   * {int} 1 : enabled (default)
   * @final @jsxobf-final
   */
  Tab.STATEENABLED = 1;

  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param strText {String} text to display within the given tab; if null, jsx3.gui.Tab.DEFAULTTEXT is used
   * @param vntWidth {int|String} one of: 1) the width as an integer representing a fixed pixel width for the tab (e.g., 80) ; 2) the width as a percentage representing this tab's width as a percentage of how wide the entire tabbed pane should be (e.g., "25%"); 3) no value (null) to designate that this tab should be just large engough to contain the value of the parameter, @strText;
   * @param strHexActiveColor {String} valid css property for defining the color to use when the tab is active (i.e., red, #ff0000, etc)
   * @param strHexInactiveColor {String} valid css property for defining the color to use when the tab is inactive (i.e., red, #ff0000, etc)
   */
  Tab_prototype.init = function(strName,strText,vntWidth,strHexActiveColor,strHexInactiveColor) {
    //call constructor for super class
    this.jsxsuper(strName,null,null,vntWidth,null,strText);

    //set active/inactive colors for the tab
    if (strHexActiveColor != null) this.setActiveColor(strHexActiveColor);
    if (strHexInactiveColor != null) this.setInactiveColor(strHexInactiveColor);

    //add the block child (this will hold the content)
    var objChild = new jsx3.gui.Block(strName + "_content",null,null,"100%","100%");
    objChild.setOverflow(jsx3.gui.Block.OVERFLOWSCROLL);
    objChild.setRelativePosition(0);
    objChild.setBackgroundColor((strHexActiveColor == null)?Tab.CHILDBGCOLOR:strHexActiveColor);

    //bind the child block using persistent binding and the fragment ns
    this.setChild(objChild,jsx3.app.Model.PERSISTEMBED,null,jsx3.app.Model.FRAGMENTNS);
  };

  /**
   * Called when an item is about to be set; returns false if the parent is not of the appropriate type; in this case, the parent must be a jsx3.gui.TabbedPane or derivative class
   * @return {boolean} true to allow the set, false to veto
   */
  Tab_prototype.onSetParent = function(objParent) {
    return jsx3.gui.TabbedPane && objParent instanceof jsx3.gui.TabbedPane;
  };

  /**
   * Returns background image that will underlay each tab to provide an outset-type border. Default: jsx3.gui.Tab.DEFAULTBEVELIMAGE
   * @return {String} valid url (typically relative) to point to an image that can be used as a bacground image for the tab
   */
  Tab_prototype.getBevel = function() {
    return this.jsxbevel;
  };

  /**
   * Sets background image that will underlay each tab to provide an outset-type border; if this value is not set or null is passed, the default background image for the jsx3.gui.Tab class will be use the contant value, jsx3.gui.Tab.DEFAULTBEVELIMAGE;
   * @param strURL {String} valid url (typically relative) to point to an image that can be used as a bacground image for the tab
   * @return {jsx3.gui.Tab} this object
   */
  Tab_prototype.setBevel = function(strURL) {
    this.jsxbevel = strURL;
    return this;
  };

  /**
   * Returns rules for the focus rectangle/bounding box. Used by Builder
   * @return {Object<String, boolean>} JavaScript object with named properties: NN, SS, EE, WW, MM
   * @package
   */
  Tab_prototype.getMaskProperties = function() {
    return jsx3.gui.Block.MASK_EAST_ONLY;
  };

  /**
   * fires event to auto-click the tab (doShow) if a drag/drop event is in progress; sets bevel to active
   * @private
   */
  Tab_prototype._ebMouseOver = function(objEvent, objGUI) {
    objGUI.style.backgroundImage = "url(" + Tab.ACTIVEBEVEL + ")";
    if (jsx3.EventHelp.isDragging()) this._doClickTab(objEvent, false);
  };

  /**
   * sets bevel to inactive
   * @private
   */
  Tab_prototype._ebMouseOut = function(objEvent, objGUI) {
      objGUI.style.backgroundImage = "url(" + Tab.INACTIVEBEVEL + ")";
  };

  /** @private */
  Tab_prototype._ebClick = function(objEvent, objGUI) {
    jsx3.html.focus(objGUI); // needed in IE because click probably originates in unselectable div
    if (objEvent.leftButton())
      this._doClickTab(objEvent);
  };

/* @JSC :: begin DEP */

  /**
   * Brings this tab and its associated pane forward in the stack among all sibling tabs. This method invokes the
   * <code>EXECUTE</code> event only under the deprecated 3.0 event protocol.
   * @param bFocus {boolean} if null, assume true; if false, do not give focus to the tab's on-screen VIEW
   * @param bForce {boolean} false if null; to avoid updating the VIEW, tabs ignore click events if they're already the active tab; this will override and force the click to occur
   * @return {jsx3.gui.Tab} this object
   * @deprecated replaced with <code>doShow()</code>
   * @see #doShow()
   */
  Tab_prototype.doClickTab = function(bFocus, bForce) {
    this._doClickTab(this.isOldEventProtocol(), bForce);
  };

/* @JSC :: end */

  /**
   * Brings this tab and its associated pane forward in the stack among all sibling tabs. If the tab handle
   * is rendered but is scrolled out of view due to too many sibling tabs, the tab handle will be scrolled into view.
   * To apply cursor focus to the tab, follow this method with a call to <code>setFocus</code>.
   * @see setFocus
   */
  Tab_prototype.doShow = function() {
    this._doClickTab(false);

    //3.6: added logic to reveal the tab handle if its scrolled out of view
    var tp = this.getParent();
    var intTabWidths = tp._getTabOffsetWidths() ;
    var intAvailWidth = tp.getClientDimensions().parentwidth;
    if(intTabWidths > intAvailWidth) {
      var objGUI = tp._getTabContainerElement();
      var P = this.getAbsolutePosition(tp.getRendered());
      if(P.L + P.W > intAvailWidth && this.getChildIndex() > 0) {
        objGUI.style.left = parseInt(objGUI.style.left) - ((P.L + P.W) - intAvailWidth) + "px";
      } else if(P.L < 0) {
        objGUI.style.left = parseInt(objGUI.style.left) - P.L + "px";
      }
      tp._updateAutoScrollDisplay();
    }
  };

  /** @private @jsxobf-clobber */
  Tab_prototype._doClickTab = function(objEvent, bForce) {
    this.getParent()._revealTab(objEvent, this);
  };

  /**
   * Returns the CSS background-color property value, (i.e., red, #ffffff) to apply when the tab is active (front). If this value is not
   * set, it will use the default, <code>jsx3.gui.Tab.DEFAULTACTIVECOLOR</code>
   * @return {String}
   */
  Tab_prototype.getActiveColor = function() {
    return this.jsxactivecolor;
  };

  /**
   * Sets the CSS background-color property value, (i.e., red, #ffffff) to apply when the tab is active (front). If this value is not
   * set, it will use the default, <code>jsx3.gui.Tab.DEFAULTACTIVECOLOR</code>
   * @param strActiveColor {String}
   * @return {jsx3.gui.Tab} this object
   */
  Tab_prototype.setActiveColor = function(strActiveColor) {
    this.jsxactivecolor = strActiveColor;
    return this;
  };

  /**
   * Returns the CSS background-color property value, (i.e., red, #ffffff) to apply when the tab is inactive (not front). If this value is not
   * set, it will use the default, <code>jsx3.gui.Tab.DEFAULTINACTIVECOLOR</code>
   * @return {String}
   */
  Tab_prototype.getInactiveColor = function() {
    return this.jsxinactivecolor;
  };

  /**
   * Sets the CSS background-color property value, (i.e., red, #ffffff) to apply when the tab is inactive (not front). If this value is not
   * set, it will use the default, <code>jsx3.gui.Tab.DEFAULTINACTIVECOLOR</code>
   * @param strInactiveColor {String}
   * @return {jsx3.gui.Tab} this object
   */
  Tab_prototype.setInactiveColor = function(strInactiveColor) {
    this.jsxinactivecolor = strInactiveColor;
    return this;
  };

  /**
   * Returns the state for the tab control. Default: jsx3.gui.Tab.STATEENABLED
   * @return {int} one of: jsx3.gui.Tab.STATEDISABLED, jsx3.gui.Tab.STATEENABLED
   */
  Tab_prototype.getEnabled = function() {
    return (this.jsxenabled == null) ? Tab.STATEENABLED : this.jsxenabled;
  };

  /**
   * Sets the enabled state for the tab control; returns reference to self to facilitate method chaining
   * @param STATE {int} one of: <code>jsx3.gui.Tab.STATEDISABLED</code>, <code>jsx3.gui.Tab.STATEENABLED</code>
   * @return {jsx3.gui.Tab} this object
   */
  Tab_prototype.setEnabled = function(STATE) {
    this.jsxenabled = STATE;
    return this;
  };

  /**
   * Returns whether or not this stack is the active (expanded) stack
   * @return {boolean}
   */
  Tab_prototype.isFront = function() {
    var myIndex = this.getChildIndex();
    return myIndex >= 0 && this.getParent().getSelectedIndex() == myIndex;
  };

  /**
   * called when user keys down while the tab's on-screen view has focus
   * @private
   */
  Tab_prototype._ebKeyDown = function(objEvent, objGUI) {
    // check for hot keys
    if (this.jsxsupermix(objEvent, objGUI)) return;

    //get the key code for the item
    var myIndex = this.getChildIndex();
    var objParent = this.getParent();

    //navigate amongs sibling tabs based on which key was pressed
    if (objEvent.leftArrow() || objEvent.rightArrow()) {
      var numChl = objParent.getChildren().length;
      var inc = objEvent.leftArrow() ? -1 : 1;
      var intIndex = jsx3.util.numMod(myIndex + inc, numChl);
      var child = objParent.getChild(intIndex);
      
      while (child != this && (!child.getEnabled() || child.getDisplay() == jsx3.gui.Block.DISPLAYNONE)) {
        intIndex = jsx3.util.numMod(intIndex + inc, numChl);
        child = objParent.getChild(intIndex);
      }

      if (child != this)
      //navigate to next tab
        objParent._revealTab(objEvent, intIndex, null, true);
      //stop event bubbling for arrow keys which cause the app to scroll
      objEvent.cancelAll();
    } else if (objEvent.downArrow()) {
      objParent._revealTab(objEvent, myIndex, null, true);
      this.getContentChild().focus();
      objEvent.cancelAll();
    }
  };

  Tab.BRIDGE_EVENTS = {};
  Tab.BRIDGE_EVENTS[Event.CLICK] = true;
  Tab.BRIDGE_EVENTS[Event.KEYDOWN] = true;
  Tab.BRIDGE_EVENTS[Event.MOUSEOVER] = true;
  Tab.BRIDGE_EVENTS[Event.MOUSEOUT] = true;

  /**
   * gets the size of the drawspace for the child content pane
   * @param objChild {jsx3.app.Model} child pane instance
   * @return {object} implicit map
   * @package
   */
  Tab_prototype.getClientDimensions = function(objChild) {
    return this.getCachedClientDimensions(0) ||
           this.setCachedClientDimensions(0, this.getParent() ? this.getParent()._getContentPaneDimensions(this) : {});
  };

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @package
   */
  Tab_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 3);
  };

  /**
   * Creates the box model/profile for the object. Expects two parameters: the parentwidth and the parentheight
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @package
   */
  Tab_prototype.createBoxProfile = function(objImplicit) {
    //'pull' the implicit object if not passed
    if (objImplicit == null || isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight)) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if(objImplicit == null) {
      objImplicit = {};
    }

    var pad = this.getPadding();
    //create the outer box (tab height is 100% of provided drawspace)
    if (this.getWidth() != null && !isNaN(parseInt(this.getWidth()))) objImplicit.width = this.getWidth();
    objImplicit.height = "100%";
    objImplicit.tagname = "span";
    objImplicit.boxtype = "relativebox";
    objImplicit.padding = (pad != null && pad != "") ? pad : "3 4 1 4";
    objImplicit.border = this.getBorder() || "0px pseudo;2px pseudo;0px pseudo;1px pseudo";
    objImplicit.margin = this.getMargin();
    var b1 = new jsx3.gui.Painted.Box(objImplicit);

    //create the label box
    var o = {};
    o.parentwidth = b1.getClientWidth();
    o.parentheight = b1.getClientHeight();
    o.height = "100%";
    if(!(this.getWidth() == null  || isNaN(this.getWidth()))) {
      //tabs that use a fixed width need an inline div in order for the button's text to center
      o.width = "100%";
      o.tagname = "div";
      o.boxtype = "inline";
    } else {
      //buttons that dynamically grow, should use a standard relativebox
      o.tagname = "span";
      o.boxtype = "relativebox";
    }
    var b1a = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1a);

    return b1;
  };

  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  Tab_prototype.paint = function() {
    //validate correct parent
    if (!(this.getParent() instanceof jsx3.gui.TabbedPane)) {
      jsx3.util.Logger.doLog("t21","The jsx3.gui.Tab instance with the id, '" + this.getId() + "', could not be painted on-screen, because it does not belong to a jsx3.gui.TabbedPane parent.");
      return "";
    }

    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //render events if the tab is enabled
    var strEvents = this.getEnabled() == Tab.STATEENABLED ? this.renderHandlers(Tab.BRIDGE_EVENTS, 0) : "";
    var strAttributes = this.renderAttributes(null, true);

    //render the outer box
    var b1 = this.getBoxProfile(true);
    b1.setAttributes('id="' + this.getId() + '"' + this.paintLabel() + this.paintIndex() + this.paintTip() + strEvents + ' class="jsx30tab" ' + strAttributes);
    b1.setStyles(this.paintBevel() + this.paintCursor() + this.paintBackgroundColor() + this.paintColor() + this.paintFontName() + this.paintFontSize() + this.paintFontWeight() + this.paintTextAlign() + this.paintDisplay() + this.paintCSSOverride());

    //render the label box
    var b1a = b1.getChildProfile(0);
    b1a.setAttributes(' class="jsx30tab_text"' + jsx3.html._UNSEL);
    b1a.setStyles(this.paintTextAlign());

    //return final string of HTML
    return b1.paint().join(b1a.paint().join(this.paintText()));
  };

  Tab_prototype.setWidth = function(vntWidth, bRepaint) {
    this.jsxsuper(vntWidth);
    if (bRepaint) this.repaint(); // i think the relative layouts mess this up
  };

  /**
   * Sets the text/HTML for the control to be displayed on-screen;
   *            returns reference to self to facilitate method chaining;
   * @param strText {String} text/HTML
   * @param bRepaint {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.
   * @return {jsx3.gui.Tab}
   */
  Tab_prototype.setText = function(strText, bRepaint) {
    this.jsxsuper(strText,bRepaint);
    if(bRepaint && this.getParent())
      this.getParent()._updateAutoScrollDisplay();
  };

  /**
   * Returns background image that will underlay each tab to provide an outset-type border. Default: jsx3.gui.Tab.DEFAULTBEVELIMAGE
   * @return {String} valid url (typically relative) to point to an image that can be used as a bacground image for the tab
   * @private
   */
  Tab_prototype.paintBevel = function() {
    return "background-image:url(" + Tab.INACTIVEBEVEL + ");background-repeat:repeat-x;background-position:top left;";
  };

  /**
   * renders valid CSS property value, (e.g., default,wait,col-resize); if no value or an empty string, null is returned
   * @return {String} valid CSS property value, (e.g., default,wait,col-resize)
   * @private
   */
  Tab_prototype.paintCursor = function() {
    return (this.getEnabled() == Tab.STATEENABLED) ? "cursor:pointer;" : "";
  };

  /**
   * generates DHTML property value for tabIndex&#8212;called programmatically by paint methods for various GUI classes
   * @return {String} DHTML in form of tabIndex='n'
   * @private
   */
  Tab_prototype.paintIndex = function() {
    return this.jsxsuper(this.getIndex() || Number(0));
  };

  /**
   * paints valid CSS property value, (e.g., red, #ffffff) when tab is active. Default: jsx3.gui.Tab.DEFAULTACTIVECOLOR
   * @return {String} valid CSS property value, (e.g., red, #ffffff)
   * @private
   */
  Tab_prototype.paintActiveColor = function() {
    return (this.getActiveColor()) ? this.getActiveColor() : Tab.DEFAULTACTIVECOLOR;
  };

  /**
   * paints valid CSS property value, (e.g., red, #ffffff) when tab is inactive (not selected tab in the group). Default: jsx3.gui.Tab.DEFAULTINACTIVECOLOR
   * @return {String} valid CSS property value, (e.g., red, #ffffff)
   * @private
   */
  Tab_prototype.paintInactiveColor = function() {
    return (this.getInactiveColor()) ? this.getInactiveColor() : Tab.DEFAULTINACTIVECOLOR;
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  Tab_prototype.paintBackgroundColor = function() {
    var bgc = this.getChildIndex() != this.getParent().getSelectedIndex() ?
        this.paintInactiveColor() : this.paintActiveColor();
    return bgc ? "background-color:" + bgc + ";" : "";
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Tab.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

  /**
   * Returns the child of this tab that will be painted as the content of this tab. This implementation returns the
   * first child of this stack.
   * @return {jsx3.app.Model}
   */
  Tab_prototype.getContentChild = function() {
    return this.getChild(0);
  };

  // need to implement this because the HTML DOM hierarchy does not mirror the JSX DOM
  Tab_prototype.destroyView = function(objParent) {
    var contentPane = this.getContentChild();
    if (contentPane) contentPane.destroyView(objParent);
    this.jsxsuper(objParent);
  };

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.Tab
 * @see jsx3.gui.Tab
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Tab", -, null, function(){});
 */
jsx3.Tab = jsx3.gui.Tab;

/* @JSC :: end */
