/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Block", "jsx3.gui.Tab");

// @jsxobf-clobber-shared  _revealTab _getContentPaneDimensions _updateAutoScrollDisplay _getTabContainerElement _getTabOffsetWidths

/**
 * Renders a tabbed pane, which consists of a set of tabs, only one of which is visible at a time.
 *
 * @see jsx3.gui.Tab
 */
jsx3.Class.defineClass("jsx3.gui.TabbedPane", jsx3.gui.Block, null, function(TabbedPane, TabbedPane_prototype) {

  var Tab = jsx3.gui.Tab;
  var Event = jsx3.gui.Event;
  var Block = jsx3.gui.Block;
  var Interactive = jsx3.gui.Interactive;

  /**
   * {int} 50
   */
  TabbedPane.AUTO_SCROLL_INTERVAL = 50;

  /**
   * {String} jsx:///images/tab/l.png
   */
  TabbedPane.LSCROLLER = jsx3.html.getCSSPNG(jsx3.resolveURI("jsx:///images/tab/l.png"));

  /**
   * {String} jsx:///images/tab/r.png
   */
  TabbedPane.RSCROLLER = jsx3.html.getCSSPNG(jsx3.resolveURI("jsx:///images/tab/r.png"));

  /**
   * {int} 20 (default)
   */
  TabbedPane.DEFAULTTABHEIGHT = 20;

  /**
   * {String} The default border to put around the content area of child tabs if no borde is specified for
   * a tabbed pane.
   */
  TabbedPane.CONTENTBORDER = "solid 1px #f6f6ff;solid 1px #a6a6af;solid 1px #a6a6af;solid 1px #f6f6ff";
  
  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   */
  TabbedPane_prototype.init = function(strName) {
    //call constructor for super class
    this.jsxsuper(strName);
  };

  /**
   * @package
   */
  TabbedPane_prototype.paintChild = function(objJSX, bLoop) {
    var objGUI = this.getRendered();
    if (objGUI != null) {
      //insert the tab
      if (this.getShowTabs())
        jsx3.html.insertAdjacentHTML(objGUI.childNodes[0].childNodes[0], "beforeEnd", objJSX.paint());

      //insert the content pane
      var contentPane = objJSX.getContentChild();
      var bFirst = this.getChildren().length == 1;
      contentPane = this._setContentDisplay(contentPane, bFirst);

      jsx3.html.insertAdjacentHTML(objGUI, "beforeEnd", objJSX.paintChildren([contentPane]));
      this.jsxsuper(contentPane, bLoop, objGUI, true);

      if (bFirst)
        this._revealTab(null, objJSX);
    }
    this._updateAutoScrollDisplay();
  };

  /**
   * is called before appending a child to the children list
   * @return {boolean} true to allow the set, false to veto
   * @package
   */
  TabbedPane_prototype.onSetChild = function(objChild) {
    if (!(objChild instanceof Tab)) return false;

    // show/hide was previously implemented with visibility so fix serialization files here
    var contentPane = objChild.getContentChild();
    if (contentPane && contentPane instanceof Block)
      contentPane.setVisibility(Block.VISIBILITYVISIBLE);

    //will ensure that an CHANGE event is broadcast on adding the first tab
    if (this.getChildren().length == 0) this.jsxselectedindex = -1;
    return true;
  };

  /** @private @jsxobf-clobber */
  TabbedPane_prototype._setContentDisplay = function(objContent, bActive) {
    objContent = objContent._setShowState(bActive) || objContent;
    if (objContent instanceof Block)
      objContent.setDisplay(bActive ? Block.DISPLAYBLOCK : Block.DISPLAYNONE, true);
    return objContent;
  };

  /**
   * @package
   */
  TabbedPane_prototype.onRemoveChild = function(objChild, intIndex) {
    this.jsxsuper(objChild, intIndex);

    if (jsx3.$A.is(objChild)) {
      var oneTab = objChild[this.getSelectedIndex()];
      if (oneTab)
        oneTab.doEvent(Interactive.HIDE);
      this.doEvent(Interactive.CHANGE);

      this.setSelectedIndex(-1);
      this.setBoxDirty();
      this.repaint();
    } else {
      var oldIndex = this.getSelectedIndex();
      var newIndex = Math.min(this.getChildren().length - 1, oldIndex);

      if (oldIndex == intIndex)
        objChild.doEvent(Interactive.HIDE);

      if (newIndex >= 0)
        this._revealTab(false, newIndex, true);
      else
        this.doEvent(Interactive.CHANGE);
        
      this._updateAutoScrollDisplay();
    }
  };

  /**
   * Returns the zero-based child index of the active child tab.
   * @return {int}
   */
  TabbedPane_prototype.getSelectedIndex = function() {
    return (this.jsxselectedindex == null) ?
        (this.getChildren().length > 0 ? 0 : -1) : this.jsxselectedindex;
  };

  /**
   * Sets the active tab of this tabbed pane. Pass either the zero-based child index of the tab to activate or
   * the tab itself.
   * @param intIndex {int|jsx3.gui.Tab}
   * @param bRepaint {boolean} if <code>true</code>, immediately updates the view to reflect the new active tab.
   * @return {jsx3.gui.TabbedPane} this object.
   */
  TabbedPane_prototype.setSelectedIndex = function(intIndex, bRepaint) {
    if (bRepaint) {
      this._revealTab(false, intIndex);
    } else {
      this.jsxselectedindex = intIndex instanceof Tab ? intIndex.getChildIndex() : intIndex;
    }
    return this;
  };

  TabbedPane_prototype._ebMouseUp = function(objEvent, objGUI) {
    this.doDrop(objEvent, objGUI, jsx3.EventHelp.ONDROP);
  };

  /**
   * gets the implicit object to define the drawspace for a tab child
   * @return {object} implicit map with named properties: parentwidth, parentheight
   * @package
   */
  TabbedPane_prototype.getClientDimensions = function(objChild) {
    //3.6 udpate: caching of client dimensions corrupted layouts for fixed-width tabs and also appeared when reordering tabs
    if (this.getParent()) {
      var myDimensions = this.getParent().getClientDimensions(this);
      var myWidth = (myDimensions.width) ? myDimensions.width : myDimensions.parentwidth;
      var intTabSize = (this.getShowTabs()) ? this.paintTabSize() + 1 : 0;
      return {parentwidth:myWidth,parentheight:intTabSize};
    } else {
      return {};
    }
  };

  /**
   * gets the implicit object to define the dimensions for content pane grandchild
   * @return {object} implicit map with the named properties: left, top, width, height
   * @private
   */
  TabbedPane_prototype._getContentPaneDimensions = function() {
    if (this.getParent()) {
      var myDimensions = this.getParent().getClientDimensions(this);
      var myWidth = (myDimensions.width != null && !isNaN(myDimensions.width)) ? myDimensions.width : myDimensions.parentwidth;
      var intTabSize = (this.getShowTabs()) ? this.paintTabSize() : 0;
      var myHeight = ((myDimensions.height != null && !isNaN(myDimensions.height)) ? myDimensions.height : myDimensions.parentheight) - intTabSize;
      var o = {left:0,top:intTabSize,width:myWidth,height:myHeight,parentwidth:myWidth,parentheight:myHeight,
        boxtype:"box",tagname:"div",border:this.getBorder()};
      if (this.getShowTabs() && o.border == null && o.border != "")
        o.border = TabbedPane.CONTENTBORDER;
      return o;
    }
    return {};
  };

  /**
   * Updates the box model for the object
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @package
   */
  TabbedPane_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    var b1 = this.getBoxProfile(true, objImplicit);

    if(objGUI) {
      //recalculate the box
      b1.recalculate(objImplicit,objGUI,objQueue);

      //update profile for box that holds the tab handles (height is forced, width is 100% of parent drawspace)
      var b1a = b1.getChildProfile(0);
      b1a.recalculate({parentwidth:b1.getClientWidth(), height:this.paintTabSize()+1},
          ((objGUI!=null) ? objGUI.childNodes[0] : null), objQueue);

      var b1b = b1a.getChildProfile(0);
      b1b.recalculate({parentwidth:b1.getClientWidth(), height:this.paintTabSize()+1},
          ((objGUI!=null) ? objGUI.childNodes[0].childNodes[0] : null), objQueue);

      var b1d = b1a.getChildProfile(2);
      b1d.recalculate({left:b1a.getClientWidth() - 22},
          ((objGUI!=null) ? objGUI.childNodes[0].childNodes[2] : null), objQueue);

      //update the tab children and the associated content panes
      var oKids = this.getChildren();
      var objImplicitT = this.getClientDimensions();
      for (var i = 0; i < oKids.length; i++) {
        //update the box profile for the tab
        var objTab = oKids[i];
        objQueue.add(objTab, this.getClientDimensions(), objGUI != null, true);

        var objCChild = objTab.getContentChild();
        //adjust the box profile for the child pane
        if (objCChild != null) {
          var bActive = this.getSelectedIndex() == i;
          objCChild = this._setContentDisplay(objCChild, bActive);
          // only active tab updated. this makes switching tabs is more complicated
          if (bActive)
            objQueue.add(objCChild, this._getContentPaneDimensions(), objCChild.getRendered(objGUI), true);
        }
      }
      this._updateAutoScrollDisplay();
    }
  };

  /**
   * Creates the box model/profile for the object. Expects two parameters: the parentwidth and the parentheight
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @package
   */
  TabbedPane_prototype.createBoxProfile = function(objImplicit) {
    //determine implicit dimensions if not passed
    if (this.getParent() && (objImplicit == null || ((!isNaN(objImplicit.parentwidth) && !isNaN(objImplicit.parentheight)) || (!isNaN(objImplicit.width) && !isNaN(objImplicit.height))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if(objImplicit == null) {
      objImplicit = {};
    }

    //create the outerbox
    if(objImplicit.left == null) objImplicit.left = 0;
    if(objImplicit.top == null) objImplicit.top = 0;
    if(objImplicit.width == null) objImplicit.width = "100%";
    if(objImplicit.height == null) objImplicit.height = "100%";
    if(objImplicit.tagname == null) objImplicit.tagname = "div";
    if (!objImplicit.boxtype)objImplicit.boxtype = "relativebox";
    var b1 = new jsx3.gui.Painted.Box(objImplicit);

    //add box (holds tab handles)
    var o = {};
    o.parentwidth = objImplicit.parentwidth;
    o.width = "100%";
    o.height = this.paintTabSize() + 1;
    o.left = 0;
    o.top = 0;
    o.tagname = "div";
    o.boxtype = "box";
    var b1a = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1a);

    //add sliding box
    o = {};
    o.parentwidth = objImplicit.parentwidth;
    o.width = "100%";
    o.height = this.paintTabSize() + 1;
    o.left = 0;
    o.top = 0;
    o.tagname = "div";
    o.boxtype = "box";
    var b1b = new jsx3.gui.Painted.Box(o);
    b1b.setStyles("white-space:nowrap;");
    b1a.addChildProfile(b1b);

    //add left scroller
    o = {};
    o.width = 14;
    o.height = 14;
    o.left = 2;
    o.top = 2;
    o.tagname = "div";
    o.boxtype = "box";
    var b1c = new jsx3.gui.Painted.Box(o);
    b1a.addChildProfile(b1c);

    //add right scroller
    o = {};
    o.width = 14;
    o.height = 14;
    o.left = b1a.getClientWidth() - 16;
    o.top = 2;
    o.tagname = "div";
    o.boxtype = "box";
    var b1d = new jsx3.gui.Painted.Box(o);
    b1a.addChildProfile(b1d);

    //return box definition (the explicit object)
    return b1;
  };

  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  TabbedPane_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //get common values
    var strId = this.getId();
    var bShowTabs = this.getShowTabs();

    //confirm the selected index; adjust as required
    var intSelectedIndex = this.getSelectedIndex();
    if (intSelectedIndex < 0 || intSelectedIndex >= this.getChildren().length) {
      intSelectedIndex = 0;
      this.setSelectedIndex(intSelectedIndex);
    }

    //render implemented events here; for now only 'drop' is supported for a tabbed pane
    var eventMap = {};
    if (this.hasEvent(Interactive.DROP) || this.hasEvent(Interactive.CTRL_DROP))
      eventMap[Event.MOUSEUP] = true;

    //render the attributes (these are custom attributes to bind the TAG in the VIEW (allows user finer-grain control over the expression of the MODEL)
    var strImplementedEvents = this.renderHandlers(eventMap, 0);
    var strAttributes = this.renderAttributes(null, true);

    //render the outer-most box
    var b1 = this.getBoxProfile(true);
    b1.setAttributes('id="' + strId + '" class="jsx30tabbedpane"' + this.paintLabel() + this.paintIndex() + this.paintTip() + strImplementedEvents + strAttributes);
    b1.setStyles(this.paintZIndex() + this.paintBackgroundColor() + this.paintBackground() + this.paintVisibility() + this.paintDisplay() + this.paintCSSOverride());

    //render the box that holds the tab children
    var b1a = b1.getChildProfile(0);

    if (bShowTabs) {
      //get active tab and determine if it's enabled or not--if not, make first enabled tab in stack the active one
      var objActiveTab = this.getChild(intSelectedIndex);
      objActiveTab = (objActiveTab == null) ? this.getChild(0) : objActiveTab;
      if (objActiveTab != null) {
        if (!objActiveTab.getEnabled()) {
          var maxLen = this.getChildren().length - 1;
          //locate first enabled tab in the set and make it the active tab
          for (var i=0;i<=maxLen;i++) {
            if (this.getChild(i).getEnabled()) {
              this.setSelectedIndex(i);
              break;
            }
          }
        }
      }
      var strChildTabs = this.paintChildren();
      b1a.setStyles(this.paintTextAlign());
    } else {
      var strChildTabs = "&#160;";
      b1a.setStyles('visibility:hidden;');
    }
    b1a.setAttributes('class="jsx30tabbedpane_controlbox"');

    //paint the content panes (telling the tab handles to paint doesn't deal with their actual content boxes, just their clickable labels)
    var children = this.getChildren();
    var kidsToPaint = [];

    for (var i = 0; i < children.length; i++) {
      var bActive = this.getSelectedIndex() == i;
      var objKid = children[i].getContentChild();
      if (objKid != null) {
        objKid = this._setContentDisplay(objKid, bActive);
        objKid.syncBoxProfileSync(this._getContentPaneDimensions());
        kidsToPaint.push(objKid);
      }
    }

    //reposition the scrollbar based on the new data that will have been painted
    jsx3.sleep(function() {this._updateAutoScrollDisplay();},null,this);

    var b1b = b1a.getChildProfile(0);
    var b1c = b1a.getChildProfile(1);
    b1c.setStyles("display:none;"+TabbedPane.LSCROLLER);
    b1c.setAttributes('class="jsx30tabbedpane_autoscroller_l" jsxscrolltype="left" ' +this.renderHandler("mouseover", "_ebMouseOverAutoScroll") +
                      this.renderHandler("mouseout", "_ebMouseOutAutoScroll"));
    var b1d = b1a.getChildProfile(2);
    b1d.setStyles("display:none;"+TabbedPane.RSCROLLER);
    b1d.setAttributes('class="jsx30tabbedpane_autoscroller_r" jsxscrolltype="right" ' +this.renderHandler("mouseover", "_ebMouseOverAutoScroll") +
                      this.renderHandler("mouseout", "_ebMouseOutAutoScroll"));
     return b1.paint().join(b1a.paint().join(b1b.paint().join(strChildTabs) + b1c.paint().join("&#160;") + b1d.paint().join("&#160;")) + this.paintChildren(kidsToPaint));
  };

  /** @private @jsxobf-clobber */
  TabbedPane_prototype._updateAutoScrollDisplay = function() {
    var intTabWidths = this._getTabOffsetWidths() ;
    var intAvailWidth = this.getClientDimensions().parentwidth;
    var objGUI = this._getTabContainerElement();
    if(objGUI) {
      if(intAvailWidth < intTabWidths) {
        objGUI.nextSibling.style.display = (parseInt(objGUI.style.left) < 0) ? "" : "none";
        objGUI.nextSibling.nextSibling.style.display = "";
      } else {
        objGUI.nextSibling.style.display = "none";
        objGUI.nextSibling.nextSibling.style.display = "none";
        objGUI.style.left = "0px";
      }
    }
  };

  /** @private @jsxobf-clobber */
  TabbedPane_prototype._getTabOffsetWidths = function() {
    var objGUI = this._getTabContainerElement();
    if (objGUI) {
      var objKids = objGUI.childNodes;
      var i = objKids.length - 1, lastKid = null;
      while (i >= 0 && !lastKid) {
        if (objKids[i].nodeType == 1)
          lastKid = objKids[i];
        i--;
      }
      
      if (lastKid) {
        var pos = jsx3.html.getRelativePosition(objGUI, lastKid);
        return pos.L + pos.W;
      }
    }
  };

  /** @private @jsxobf-clobber */
  TabbedPane_prototype._ebMouseOverAutoScroll = function(objEvent, objGUI) {
   //TO DO: move any motion code to an move handler (need to extend jsx3.html/jsx3.html.style/jsx3.html.dom)
   var my = this;
   /* @jsxobf-clobber */
   this._jsxautoscrollinterval = {direction:objGUI.getAttribute("jsxscrolltype"),totalwidth:this._getTabOffsetWidths() - this.getClientDimensions().parentwidth};
   this._jsxautoscrollinterval.interval = window.setInterval(function() {  my._doAutoScroll(); },TabbedPane.AUTO_SCROLL_INTERVAL);
  };

  /** @private @jsxobf-clobber */
  TabbedPane_prototype._getTabContainerElement = function() {
    var objGUI = this.getRendered();
    return objGUI ? objGUI.childNodes[0].childNodes[0] : null;
  };

  /** @private @jsxobf-clobber */
  TabbedPane_prototype._doAutoScroll = function() {
    var objVP = this._getTabContainerElement();
    var intLeft = parseInt(objVP.style.left);
    if(this._jsxautoscrollinterval.direction == "left") {
      //reveal tabs to the left
      if(intLeft -5 < 0) {
        objVP.style.left = (intLeft + 5) + "px";
        objVP.nextSibling.nextSibling.style.display = "";
       } else {
        objVP.style.left = "0px";
        objVP.nextSibling.style.display = "none";
        this._ebMouseOutAutoScroll();
      }
    } else {
      //reveal tabs to the right
      if(Math.abs(intLeft) + 5 <= this._jsxautoscrollinterval.totalwidth) {
        objVP.style.left = (intLeft - 5) + "px";
        objVP.nextSibling.style.display = "";
      } else {
        objVP.style.left = "-" + this._jsxautoscrollinterval.totalwidth + "px";
        objVP.nextSibling.nextSibling.style.display = "none";
        this._ebMouseOutAutoScroll();
      }
    }
  };

  /** @private @jsxobf-clobber */
  TabbedPane_prototype._ebMouseOutAutoScroll = function(objEvent, objGUI) {
    if(this._jsxautoscrollinterval) {
      window.clearInterval(this._jsxautoscrollinterval.interval);
      delete this._jsxautoscrollinterval;
    }
  };

  /**
   * generates DHTML property value for tabIndex&#8212;called programmatically by paint methods for various GUI classes
   * @return {String} DHTML in form of tabIndex='n'
   * @private
   */
  TabbedPane_prototype.paintIndex = function() {
    return this.jsxsuper(this.getIndex() || Number(0));
  };

  /**
   * Returns the HTML height prop (height="")
   * @return {int} height (in pixels)
   * @private
   */
  TabbedPane_prototype.paintTabSize = function() {
    return (this.getTabHeight() != null && !isNaN(this.getTabHeight())) ? this.getTabHeight() : TabbedPane.DEFAULTTABHEIGHT;
  };

  /**
   * Returns the CSS height property (in pixels) for child tabs
   * @return {int} height (in pixels)
   */
  TabbedPane_prototype.getTabHeight = function() {
    return this.jsxtabheight;
  };

  /**
   * Sets the CSS height property for the object (in pixels) for child tabs;
   *            returns reference to self to facilitate method chaining
   * @param intTabHeight {int} height (in pixels)
   * @return {jsx3.gui.TabbedPane} this object
   */
  TabbedPane_prototype.setTabHeight = function(intTabHeight) {
    this.jsxtabheight = intTabHeight;
    this.clearBoxProfile(true);
    return this;
  };

  /**
   * whether or not to show the tabs of the tabbed pane. if false then only the content of each tab is drawn.
   */
  TabbedPane_prototype.getShowTabs = function() {
    return (this.jsxshowtabs == null || this.jsxshowtabs === '') ? 1 : this.jsxshowtabs;
  };

  /**
   * whether or not to show the tabs of the tabbed pane. if false then only the content of each tab is drawn.
   */
  TabbedPane_prototype.setShowTabs = function(intShowTabs) {
    this.jsxshowtabs = intShowTabs;
    this.clearBoxProfile(true);
    return this;
  };

  /**
   * @param objEvent {jsx3.gui.Event}
   * @param objTab {jsx3.gui.Tab|int}
   * @param bShowOnly {boolean}
   * @param bFocus {boolean}
   * @private
   */
  TabbedPane_prototype._revealTab = function(objEvent, objTab, bShowOnly, bFocus) {
    if (!(objTab instanceof Tab)) objTab = this.getChild(objTab);

    if (objTab) {
      var bShowTabs = this.getShowTabs();
      var intIndex = objTab.getChildIndex();

      //only exectute if the user clicked a tab that isn't already active
      var curIndex = this.getSelectedIndex();
      if (bShowOnly || curIndex != intIndex) {
        this.setSelectedIndex(intIndex);

        var maxLen = this.getChildren().length;

        //loop to update view for all sibling tabs to make them appear as inactive
        for (var i = 0; i < maxLen; i++) {
          var child = this.getChild(i);
          var contentPane = child.getContentChild();
          var bActive = i == intIndex;

          if (contentPane)
            contentPane = this._setContentDisplay(contentPane, bActive);

          if (bShowTabs)
            child.setBackgroundColor(bActive ? child.paintActiveColor() : child.paintInactiveColor(), true);

          if (bActive)
            // update box profile is lazy and only does the active tab, so when we switch we need to update that profile
            contentPane.syncBoxProfile(this._getContentPaneDimensions(), true);
        }
      }

      //run the code bound to the 'execute' event for the tab instance
      if (objEvent)
        objTab.doEvent(Interactive.EXECUTE, {objEVENT:(objEvent instanceof Event ? objEvent : null)});

      if (! bShowOnly) {
        var lastTab = this.getChild(curIndex);
        if (lastTab)
          lastTab.doEvent(Interactive.HIDE);
      }

      if (bFocus) objTab.focus();

      objTab.doEvent(Interactive.SHOW, {_gipp:1});
      this.doEvent(Interactive.CHANGE);
    }
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "3.0.00")
   * @return {String}
   * @deprecated
   */
  TabbedPane.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.TabbedPane
 * @see jsx3.gui.TabbedPane
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.TabbedPane", -, null, function(){});
 */
jsx3.TabbedPane = jsx3.gui.TabbedPane;

/* @JSC :: end */
