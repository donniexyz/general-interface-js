/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Block");

/**
 * This class is equivalent to a tab, but uses the stack metaphor; like a tab, it has one child&#8212;a block for its content; a jsx3.gui.Stack instance should only be contained by a jsx3.gui.StackGroup instance for proper rendering.
 */
jsx3.Class.defineClass("jsx3.gui.Stack", jsx3.gui.Block, null, function(Stack, Stack_prototype) {

  var gui = jsx3.gui;
  var Event = gui.Event;
  var Block = gui.Block;

  /**
   * {int} 0 (default)
   * @final @jsxobf-final
   */
  Stack.ORIENTATIONV = 0;

  /**
   * {int} 1
   * @final @jsxobf-final
   */
  Stack.ORIENTATIONH = 1;

  /**
   * {String} #aaccff
   */
  Stack.ACTIVECOLOR = "#aaaafe";

  /**
   * {String} #e8e8f5
   */
  Stack.INACTIVECOLOR = "#aaaacb";

  /**
   * {String} #ffffff
   */
  Stack.CHILDBGCOLOR = "#ffffff";

  /**
   * {String} border:solid 1px #9898a5;border-left-color:#ffffff;border-top-color:#ffffff;
   */
  Stack.BORDER = "solid 1px #ffffff;solid 1px #9898a5;solid 1px #9898a5;solid 1px #ffffff";
  Stack.CAPTION_BORDER = "solid 1px #c8c8d5;solid 1px #9898a5;solid 1px #9898a5;solid 1px #c8c8d5";

  /**
   * {String}
   */
  Stack.BACKGROUND = jsx3.html.getCSSFade(false);
  Stack.BACKGROUNDH = jsx3.html.getCSSFade(true);

  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param strCaption {String} if != null,  will be set as the text property (label) for the stack
   */
  Stack_prototype.init = function(strName,strCaption) {
    //call constructor for super class
    this.jsxsuper(strName,null,null,null,null,strCaption);

    //add the block child (this will hold the content)
    var objChild = new Block(strName + "_content",0,0,"100%","100%");
    objChild.setOverflow(Block.OVERFLOWSCROLL);
    objChild.setBorder(Stack.BORDER);
    objChild.setBackgroundColor(Stack.CHILDBGCOLOR);

    //bind the child block using persistent binding and the fragment ns
    this.setChild(objChild,jsx3.app.Model.PERSISTEMBED,null,jsx3.app.Model.FRAGMENTNS);
  };

  /**
   * is called when an item is about to be set; returns false if the parent is not of the appropriate type; in this case, the parent must be a jsx3.gui.List or derivative class
   * @return {boolean} true to allow the set, false to veto
   */
  Stack_prototype.onSetParent = function(objParent) {
    return gui.StackGroup && objParent instanceof gui.StackGroup;
  };

/* @JSC :: begin DEP */

  /**
   * Makes this stack the visible (expanded) stack in the parent stack group. Invokes the <code>EXECUTE</code>
   * model event only under the deprecated 3.0 model event protocol. Invokes the <code>SHOW</code> model event.
   * @deprecated  use <code>doShow()</code> instead.
   * @see #doShow()
   */
  Stack_prototype.doShowStack = function() {
    this._doShowStack(this.isOldEventProtocol());
  };

/* @JSC :: end */

  /**
   * Makes this stack the visible (expanded) stack in the parent stack group.
   */
  Stack_prototype.doShow = function() {
    this._doShowStack(false);
  };

  /** @private @jsxobf-clobber */
  Stack_prototype._doShowStack = function(objEvent, objGUI) {
    var objParent = this.getParent();

    // don't respond to clicks on child objects
    if (objEvent instanceof Event) {
      var objTarget = jsx3.html.getJSXParent(objEvent.srcElement());
      if (objTarget != null && objTarget != this) return;
    }

    // don't show already shown
    if (this == objParent.getChild(objParent.getSelectedIndex()))
      return;

    objParent.setSelectedIndex(this.getChildIndex());

    var bp = objParent.getBoxProfile();
    //update the parent stack (easiest way to propogate a resize); echo the explicit width to the parent, so no pixels aren't repeatedly shaved
    objParent.syncBoxProfile({left:0,top:0,parentwidth:bp.getOffsetWidth(),parentheight:bp.getOffsetHeight()}, true);

    //run the code bound to the 'execute' event for the stack instance
    if (objEvent)
      this.doEvent(gui.Interactive.EXECUTE, {objEVENT:(objEvent instanceof Event ? objEvent : null)});

    this.doEvent(gui.Interactive.SHOW, {_gipp:1});

    if (objGUI)
      jsx3.html.focus(objGUI);
  };

  /**
   * called programmatically by system when caption bar for stack is moused over; updates the background-color CSS property for the bar to apply the color accesssed via [object].getActiveColor()
   * @param objGUI {Object} on-screen element moused over
   * @private
   */
  Stack_prototype._ebMouseOver = function(objEvent, objGUI) {
    objGUI.style.backgroundColor = this.getActiveColor();
return;
    if(jsx3.EventHelp.isDragging()) this._doShowStack(objEvent);
    //3.2: apply the animation, using a simple opacity filter;
    var myOpacityCSS = jsx3.html.getCSSOpacity(.75);
    gui.Painted.convertStyleToStyles(objGUI,myOpacityCSS);
  };

  /**
   * called programmatically by system when caption bar for stack is moused out of; updates the background-color CSS property for the bar to apply the color accesssed via [object].getInactiveColor()
   * @param objGUI {Object} on-screen element moused out from
   * @private
   */
  Stack_prototype._ebMouseOut = function(objEvent, objGUI) {
    objGUI.style.backgroundColor = this.getInactiveColor();
return;
    //3.2: apply the animation, using a simple opacity filter;
    var myOpacityCSS = jsx3.html.getCSSOpacity(1);
    gui.Painted.convertStyleToStyles(objGUI,myOpacityCSS);
  };

  /**
   * Returns the child of this stack that will be painted as the content of this stack. This implementation
   * returns the first child that is not a menu or a toolbar button.
   * @return {jsx3.app.Model}
   */
  Stack_prototype.getContentChild = function() {
    var maxLen = this.getChildren().length;
    for (var i=0; i<maxLen; i++) {
      var child = this.getChild(i);
      if (!(gui.Menu && child instanceof gui.Menu) &&
          !(gui.ToolbarButton && child instanceof gui.ToolbarButton)) return child;
    }
    return null;
  };

  Stack_prototype._ebKeyDown = function(objEvent, objGUI) {
    // check for hot keys
    if (this.jsxsupermix(objEvent, objGUI)) return;

    if (objEvent.enterKey() || objEvent.spaceKey()) {
      this._doShowStack(objEvent);
      objEvent.cancelAll();
    }
  };

  Stack.BRIDGE_EVENTS = {};
  Stack.BRIDGE_EVENTS[Event.CLICK] = "_doShowStack";
  Stack.BRIDGE_EVENTS[Event.KEYPRESS] = true;
  Stack.BRIDGE_EVENTS[Event.MOUSEOVER] = true;
  Stack.BRIDGE_EVENTS[Event.MOUSEOUT] = true;

  /**
   * gets the size of the canvas for a given child (the true drawspace)
   * @param objChild {jsx3.gui.Block} child instance
   * @return {object} Map with named properties: W and H
   * @private
   */
  Stack_prototype.getClientDimensions = function(objChild) {
    var cachedDims = this.getCachedClientDimensions(0);
    if (cachedDims) return cachedDims;

    var dims = {};
    //find out the dimension for the splitter's parent container
    if (this.getParent()) {
      var myImplicit = this.getParent().getClientDimensions(this);
      var intBarSize = this.getParent().paintBarSize();

      var l = 0, t = 0, w = myImplicit.parentwidth, h = myImplicit.parentheight;
      if (this.getOrientation() == gui.StackGroup.ORIENTATIONV) {
        t = intBarSize;
        h -= intBarSize;
      } else {
        l = intBarSize;
        w -= intBarSize;
      }

      dims = {boxtype:"box", left:l, top:t, width:w, height:h, parentwidth:w, parentheight:h};
    }
    
    return this.setCachedClientDimensions(0, dims);
  };

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  Stack_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    //recalculate/initialize the outermost box (this stack itself)
    var b1 = this.getBoxProfile(true, objImplicit);

    if (objGUI) {
      //update the box model profile, but not the view
      var recalcRst = b1.recalculate(objImplicit,objGUI,objQueue);
      if (!recalcRst.w && !recalcRst.h) return;

      //derive new settings
      var intBarSize = this.getParent().paintBarSize();
      var myWidth = b1.getClientWidth();
      var myHeight = b1.getClientHeight();

      //update the stack handle
      var objUpdate = {};
      if(this.getOrientation() == gui.StackGroup.ORIENTATIONV) {
        // ( -- ) use percent, so system can account for any borders that may implemented on the parent box
        objUpdate.height = intBarSize;
        objUpdate.parentwidth = objImplicit.parentwidth;
      } else {
        objUpdate.width = intBarSize;
        objUpdate.parentheight = objImplicit.parentheight;
      }
      var b1b = b1.getChildProfile(0);
      b1b.recalculate(objUpdate,(objGUI)?objGUI.childNodes[0]:null,objQueue);

      //update the child pane
      var objCChild = this.getContentChild();
      if (objCChild != null) {
        objCChild = this._setContentDisplay(objCChild, this.isFront());

        if (this.isFront()) {
          //only propogate layout changes if this is an active stack; otherwise, it's too resource intensive
          var objImplictChild = (this.getOrientation() == gui.StackGroup.ORIENTATIONV) ? {boxtype:"box",left:0,top:intBarSize,width:myWidth,height:(myHeight - intBarSize),parentwidth:myWidth,parentheight:(myHeight - intBarSize)} : {boxtype:"box",left:intBarSize,top:0,width:(myWidth - intBarSize),height:myHeight,parentwidth:(myWidth - intBarSize),parentheight:myHeight};
          objQueue.add(objCChild, objImplictChild, objCChild.getRendered(objGUI), true);
        }
      }
    }
  };

  /**
   * Creates the box model/profile for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @private
   */
  Stack_prototype.createBoxProfile = function(objImplicit) {
    //the owning stack is expected to pass the parentwidth/parentheight drawspace. requery if unavailable
    if (this.getParent() && (objImplicit == null || isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if(objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    var bHorText = this.getOrientation() == gui.StackGroup.ORIENTATIONV;

    //create the outer box (holds banner box and block content child)
    objImplicit.width = "100%";
    objImplicit.height = "100%";
    objImplicit.tagname = "div";
    objImplicit.boxtype = "box";
    var b1 = new gui.Painted.Box(objImplicit);

    //add banner box (holds text label box and any menu children)
    var intBarSize = this.getParent().paintBarSize();
    var o = {};
    o.parentwidth = b1.getClientWidth();
    o.parentheight = b1.getClientHeight();
    if(bHorText) {
      //( -- )
      o.width = "100%";
      o.height = intBarSize;
    } else {
      //( | )
      o.width = intBarSize;
      o.height = "100%";
    }
    o.left = 0;
    o.top = 0;
    o.tagname = "div";
    o.boxtype = "box";
    o.border = Stack.CAPTION_BORDER;
    o.padding = "0 0 0 4";
    var b1a = new gui.Painted.Box(o);
    b1.addChildProfile(b1a);

    //create the text label box
    o = {};
    if (bHorText) {
      o.tagname = "div";
      o.boxtype = "box";
      o.left = o.top = 0;
    } else {
      o.tagname = "span";
      o.boxtype = "relativebox";
    }
    o.padding = this.getPadding();
    var b1b = new gui.Painted.Box(o);
    b1a.addChildProfile(b1b);

    //return the newly-created box profile
    return b1;
  };

  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  Stack_prototype.paint = function() {
    //stacks cannot render properly unless they are children of a stackgroup. Exit early (?? log an error--pretty rare ??)
    if(!(this.getParent() instanceof gui.StackGroup)) return "";

    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //render the outer-most box
    var b1 = this.getBoxProfile(true);
    b1.setAttributes('id="' + this.getId() + '"' + this.paintLabel() + ' class="' + this.paintClassName() + '"');
    b1.setStyles("overflow:hidden;");

    //get events tags and styles common to both orientations
    var strEvents = this.renderHandlers(Stack.BRIDGE_EVENTS, 1);
    var strAttributes = this.renderAttributes(null, true);

    //render the main content box
    var b1a = b1.getChildProfile(0);
    b1a.setAttributes(this.paintIndex() + this.paintTip() + strEvents + strAttributes + ' class="jsx30stack_handle"');
    b1a.setStyles(this.paintBackgroundColor() + this.paintBackground() + this.paintColor() + this.paintFontName() + this.paintFontSize() + this.paintFontWeight() + this.paintTextAlign() + this.paintCSSOverride());

    //paint the content of the main navigation handle and the main content block.  Only menus are allowed in the handle for now
    //further: only menus and the first block child will ever paint. all other children are treated as non visual components
    var children = this.getChildren();
    var mainToPaint = [], handleToPaint = [];

    for (var i = 0; i < children.length; i++) {
      if ((gui.Menu && children[i] instanceof gui.Menu) ||
          (gui.ToolbarButton && children[i] instanceof gui.ToolbarButton)) {
        handleToPaint.push(children[i]);
      } else if (mainToPaint.length == 0) {
        children[i] = this._setContentDisplay(children[i], this.isFront());
        mainToPaint.push(children[i]);
      }
    }

    var strHandleContent = this.paintChildren(handleToPaint);
    var strMainContent = this.paintChildren(mainToPaint);

    //render the label box
    var b1b = b1a.getChildProfile(0);
    var textClass = this.getOrientation() == gui.StackGroup.ORIENTATIONV ? "jsx30stack_textv" : "jsx30stack_texth";
    b1b.setAttributes(' class="' + textClass + '"' + jsx3.html._UNSEL);
    var strText = b1b.paint().join(this.paintText());

    //return final DHTML string
    return b1.paint().join(b1a.paint().join(strText + strHandleContent) + strMainContent);
  };

  /** @private @jsxobf-clobber */
  Stack_prototype._setContentDisplay = function(objContent, bActive) {
    var objReplacement = objContent._setShowState(bActive);
    objContent = objReplacement || objContent;
    if (objContent instanceof Block) {
      objContent.setDisplay(bActive ? Block.DISPLAYBLOCK : Block.DISPLAYNONE, true);
      //3.5.1:  clear legacy setting from model. Visibility was inappropriately used to hide inactive stacks. Display will be used
      objContent.setVisibility(Block.VISIBILITYVISIBLE);
    }
    return objContent;
  };

  /**
   * renders the CSS text-align property for the object; if no property value exists, jsx3.gui.Block.ALIGNLEFT is returned by default
   * @return {String}
   * @private
   */
  Stack_prototype.paintTextAlign = function() {
    var s;
    if (this.getTextAlign()) {
      s = this.getTextAlign();
    } else {
      if (this.getParent() && this.getOrientation() == gui.StackGroup.ORIENTATIONV) {
        // ( -- ) top over bottom
        s = Block.ALIGNRIGHT;
      } else {
        s = Block.ALIGNLEFT;
      }
    }
    return "text-align:" + s + ";";
  };

  /**
   * Implementation for this class that supports the <code>bRepaint</code> parameter.
   * @package
   */
  Stack_prototype.setText = function(strText, bRepaint) {
    this.jsxsuper(strText, false);
    var objGUI;
    if(bRepaint && (objGUI = this.getRendered()) != null)
      objGUI.firstChild.firstChild.innerHTML = strText;
    return this;
  };

  /**
   * renders CSS property value(s) for a padding (padding:4px;)
   * @return {String}
   * @private
   */
  Stack_prototype.getPadding = function() {
    var p = this.jsxsuper();
    return (p != null && p != "") ? p : "5 5 5 5";
  };

  /**
   * renders the CSS font-weight for the object ("bold" or "normal")
   * @return {String} e.g., 'font-weight:bold;'
   * @private
   */
  Stack_prototype.getFontWeight = function() {
    return this.jsxsuper() || Block.FONTBOLD;
  };

  /**
   * renders valid CSS property value for the background such as:  background-image:url(x.gif);  or background-image:url(x.gif);background-repeat:no-repeat;
   * @return {String} valid CSS property for the background such as:  background-image:url(x.gif);  or background-image:url(x.gif);background-repeat:no-repeat;
   * @private
   */
  Stack_prototype.paintBackground = function() {
    return ((this.getBackground()) ? this.getBackground() : ((this.getOrientation() == Stack.ORIENTATIONH) ? Stack.BACKGROUNDH : Stack.BACKGROUND)) + ";";
  };

  /**
   * generates DHTML property value for tabIndex&#8212;called programmatically by paint methods for various GUI classes
   * @return {String} DHTML in form of tabIndex='n'
   * @private
   */
  Stack_prototype.paintIndex = function() {
    return this.jsxsuper(this.getIndex() || Number(0));
  };

  /**
   * Returns valid CSS property value, (i.e., red, #ffffff) when caption bar for stack is moused over. Default: jsx3.gui.Stack.ACTIVECOLOR
   * @return {String} valid CSS property value, (i.e., red, #ffffff)
   */
  Stack_prototype.getActiveColor = function() {
    return (this.jsxactivecolor == null) ? Stack.ACTIVECOLOR : this.jsxactivecolor;
  };

  /**
   * Sets valid CSS property value, (i.e., red, #ffffff) when caption bar for stack is moused over;
   *            returns reference to self to facilitate method chaining
   * @param strActiveColor {String} valid CSS property value, (i.e., red, #ffffff)
   * @return {jsx3.gui.Stack} this object
   */
  Stack_prototype.setActiveColor = function(strActiveColor) {
    this.jsxactivecolor = strActiveColor;
    return this;
  };

  /**
   * Returns valid CSS property value, (i.e., red, #ffffff) when caption bar for stack is moused out. Default: jsx3.gui.Stack.INACTIVECOLOR
   * @return {String} valid CSS property value, (i.e., red, #ffffff)
   */
  Stack_prototype.getInactiveColor = function() {
    return (this.jsxinactivecolor == null) ? Stack.INACTIVECOLOR : this.jsxinactivecolor;
  };

  /**
   * Sets valid CSS property value, (i.e., red, #ffffff) when caption bar for stack is moused out;
   *            returns reference to self to facilitate method chaining
   * @param strInactiveColor {String} valid CSS property value, (i.e., red, #ffffff)
   * @return {jsx3.gui.Stack} this object
   */
  Stack_prototype.setInactiveColor = function(strInactiveColor) {
    this.jsxinactivecolor = strInactiveColor;
    return this;
  };

  /**
   * Returns orientation for the stack (as defined by the parent stackgroup)
   * @return {int} one of: jsx3.gui.Stack.ORIENTATIONV (0)  or jsx3.gui.Stack.ORIENTATIONH (1)
   * @private
   */
  Stack_prototype.getOrientation = function() {
    return this.getParent() != null ? this.getParent().getOrientation() : Stack.ORIENTATIONV;
  };

  /**
   * overrides method is superclass; ensures the stack is expanded before giving focus
   */
  Stack_prototype.focus = function() {
    //subclassed method; ensure the statck is shown/expanded and then given focus
    this.doShow();
    this.jsxsuper();
  };

  /**
   * Returns whether or not this stack is the active (expanded) stack
   * @return {boolean}
   */
  Stack_prototype.isFront = function() {
    var myIndex = this.getChildIndex();
    return myIndex >= 0 && this.getParent().getSelectedIndex() == myIndex;
  };

  Stack_prototype.getMaskProperties = function() {
    return Block.MASK_NO_EDIT;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Stack.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

  // need to implement this because the HTML DOM hierarchy does not mirror the JSX DOM
  Stack_prototype.destroyView = function(objParent) {
    var contentPane = this.getContentChild();
    if (contentPane) contentPane.destroyView(objParent);
    this.jsxsuper(objParent);
  };

});

/**
 * overrides the method in the super; in context of the jsx3.gui.Stack class, the inactive state is the default state; therefore get/set inactive color is synonymous for get/set backgroundColor. This method is merely an alias for getInactiveColor
 * @return {strCSSColor} any valid CSS color designation (#ffffff, red, etc)
 * @package
 * @jsxdoc-definition  Stack.prototype.getBackgroundColor = function(){}
 */
jsx3.gui.Stack.prototype.getBackgroundColor = jsx3.gui.Stack.prototype.getInactiveColor;

/*
 * overrides the method in the super; in context of the jsx3.gui.Stack class, the inactive state is the default state; therefore get/set inactive color is synonymous for get/set backgroundColor. This method is merely an alias for setInactiveColor
 * @return {strCSSColor} any valid CSS color designation (#ffffff, red, etc)
 * @package
 * @jsxdoc-definition  Stack.prototype.setBackgroundColor = function(){}
 */
jsx3.gui.Stack.prototype.setBackgroundColor = jsx3.gui.Stack.prototype.setInactiveColor;

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.Stack
 * @see jsx3.gui.Stack
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Stack", -, null, function(){});
 */
jsx3.Stack = jsx3.gui.Stack;

/* @JSC :: end */
