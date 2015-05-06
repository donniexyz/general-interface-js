/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Block");

/**
 * This class manages layouts by providing a container that will paint its first two child GUI objects separated
 * by a 'splitter' (either vertical or horizontal). Split panes can contain any number of object types, but most
 * commonly contain JSXBlock elements to aid in layout feautures such as padding, borders, etc.
 */
jsx3.Class.defineClass("jsx3.gui.Splitter", jsx3.gui.Block, null, function(Splitter, Splitter_prototype) {

  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;

  /**
   * {int}
   * @final @jsxobf-final
   */
  Splitter.ORIENTATIONH = 0;

  /**
   * {int}
   * @final @jsxobf-final
   */
  Splitter.ORIENTATIONV = 1;

  /** @private @jsxobf-clobber */
  Splitter.VSPLITIMAGE = "jsx:///images/splitter/v.gif";

  /** @private @jsxobf-clobber */
  Splitter.HSPLITIMAGE = "jsx:///images/splitter/h.gif";

  /* @JSC */ if (jsx3.CLASS_LOADER.IE6) {
  jsx3.html.loadImages(Splitter.VSPLITIMAGE, Splitter.HSPLITIMAGE);
  /* @JSC */ }
    
  /** @private @jsxobf-clobber */
  Splitter.DRAGCOLOR = "#2050df";

  /** @private @jsxobf-clobber */
  Splitter.DEFAULTBGCOLOR = "#c8c8d5";

  /** @private @jsxobf-clobber */
  Splitter.DEFAULTCHILDBGCOLOR = "#ffffff";

  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param ORIENTATION {int} constant; either jsx3.gui.Splitter.ORIENTATIONH or jsx3.gui.Splitter.ORIENTATIONV; if none provided the default (horizontal layout) or vertical (stacked) layout)
   */
  Splitter_prototype.init = function(strName,ORIENTATION) {
    //call constructor for super class
    this.jsxsuper(strName);

    if (ORIENTATION != null) this.setOrientation(ORIENTATION);

    //add two Block children to contain split content
    for (var i=1;i<=2;i++) {
      var jBlock = new jsx3.gui.Block(strName+"_"+i,null,null,"100%","100%","");
      jBlock.setRelativePosition(jsx3.gui.Block.RELATIVE);
      jBlock.setBackgroundColor(Splitter.DEFAULTCHILDBGCOLOR);
      //when setting as child, embed as the splitter is being created to
      this.setChild(jBlock,jsx3.app.Model.PERSISTEMBED,null,jsx3.app.Model.FRAGMENTNS);
    }
  };

  /**
   * subclassed method. routes call to repaint() as splitters cannot insert directly into the DOM
   * @param objJSXChild {jsx3.app.Model} direct child whose generated VIEW will be directly inserted into the DOM to provide more efficient screen updates as repaint is costly for large applications
   * @return {jsx3.gui.Splitter} this object
   */
  Splitter_prototype.paintChild = function(objJSXChild, bGroup) {
    if (! bGroup)
      this.repaint();
  };

  /**
   * Sets whether the user can resize this control.
   * @param intEnabled {int} <code>0</code> or <code>1</code>. Note: <code>null</code> is
   *    equivalent to <code>1</code>.
   */
  Splitter_prototype.setEnabled = function(intEnabled) {
    if (this.jsxenabled != intEnabled) {
      this.jsxenabled = intEnabled;
      var objGUI = this.getRendered();
      if(objGUI)
        objGUI.firstChild.style.cursor = this._isEnabled() ? "" : "default";
    }
  };

  /**
   * Returns whether the user can resize this control
   * @return {int} 0, 1, or null
   */
  Splitter_prototype.getEnabled = function() {
    return this.jsxenabled;
  };


  Splitter_prototype._isEnabled = function() {
    return this.jsxenabled !== 0 && this.jsxenabled !== false;
  };

  /**
   * gets the size of the canvas for a given child (the true drawspace)
   * @param objChild {jsx3.app.Model} child instance (in case it matters)
   * @return {object} Map with named properties: W and H
   * @private
   */
  Splitter_prototype.getClientDimensions = function(objChild) {
    var intIndex = objChild.getChildIndex();
    var cachedDims = this.getCachedClientDimensions(intIndex);
    if (cachedDims) return cachedDims;

    //find out the dimension for the splitter's parent container
    var myImplicit = this.getParent().getClientDimensions(this);

    //get the recommended (parent-width/height) or explicit (width/height) and convert to recommended
    var myWidth = myImplicit.parentwidth;
    var myHeight = myImplicit.parentheight;

    //get the percent multiplier
    var dblPct1 = this._getPanelMultiplier();

    var bHor = this.getOrientation() == Splitter.ORIENTATIONH;
    var span = bHor ? myWidth : myHeight;

    var min1 = this.getSubcontainer1Min();
    var min2 = this.getSubcontainer2Min();

    // bias the 1st container's min span over the second's
    var firstSpan = Math.round(span * dblPct1);
    if (firstSpan < min1 || min1 + min2 > span) firstSpan = min1;
    else if (span - firstSpan < min2) firstSpan = span - min2;

    var thisSpan, thisOffset = 0;

    //depending upon the child (0 or 1), return the appropriate sizing;
    if (intIndex == 0) {
      thisSpan = firstSpan;
    } else {
      thisOffset = firstSpan + 8;
      thisSpan = span - thisOffset;
    }

    var l, t, w, h;
    if (bHor) {
      l = thisOffset; t = 0; w = thisSpan; h = myHeight;
    } else {
      l = 0; t = thisOffset; w = myWidth; h = thisSpan;
    }

    return this.setCachedClientDimensions(intIndex,
        {boxtype:"box", tagname:"div", left:l, top:t, width:w, height:h, parentwidth:w, parentheight:h});
  };

  /**
   * Updates the box model for the object. Expects two parameters: the parentWidth and the parentHeight
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  Splitter_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    //get the existing box profile and native instance
    var b1 = this.getBoxProfile(true, objImplicit);

    if (objGUI) {
      //recalculate the box
      b1.recalculate(objImplicit, objGUI, objQueue);

      var bHor = this.getOrientation() == Splitter.ORIENTATIONH;
      //get kids (Any children additional to the two supported blocks won't be procesed.  They're part of the in-memory model, but not the VIEW)
      var oKids = this.getChildren();
      var maxLen = Math.min(2, oKids.length);
      var child1Size = 0;
      var myWidth, myHeight;
      
      for (var i = 0; i < maxLen; i++) {
        var objChildDimension = this.getClientDimensions(oKids[i]);
        //update the top or left for the second child to reflect the percentage offset
        if (i == 1) {
          //get the profile for the draggable divider
          var b1a = b1.getChildProfile(0);

          //update the position of the splitter handle
          if (bHor) {
            //( | )
            b1a.recalculate({left:child1Size,parentheight:myHeight},((objGUI)?objGUI.childNodes[0]:null),objQueue);
          } else {
            //( -- )
            b1a.recalculate({top:child1Size,parentwidth:myWidth},((objGUI)?objGUI.childNodes[0]:null),objQueue);
          }
        }

        //update the given child block
        objQueue.add(oKids[i], objChildDimension, (objGUI) ? objGUI.childNodes[i+1] : null, true);

        //save size of child 0, to use to offset the left/top of child; TO DO: factor out barsize as a constant
        myWidth = objChildDimension.width;
        myHeight = objChildDimension.height;

        child1Size = bHor ? myWidth : myHeight;
      }
    }
  };

  /**
   * Creates the box model/profile for the object
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance.
   * @private
   */
  Splitter_prototype.createBoxProfile = function(objImplicit) {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if(this.getParent() && (objImplicit == null || ((!isNaN(objImplicit.parentwidth) && !isNaN(objImplicit.parentheight)) || (!isNaN(objImplicit.width) && !isNaN(objImplicit.height))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if(objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    //determine relative position (this will affect left, top, and boxtype properties)
    var bRelative = this.getRelativePosition() != 0;

    //create the outer box (this will contain the draggable splitter handle and the two block children)
    if(objImplicit.left == null || (!bRelative && !jsx3.util.strEmpty(this.getLeft()))) objImplicit.left = this.getLeft();
    if(objImplicit.top == null || (!bRelative && !jsx3.util.strEmpty(this.getTop()))) objImplicit.top = this.getTop();
    if(objImplicit.width == null) objImplicit.width = "100%";
    if(objImplicit.height == null) objImplicit.height = "100%";
    objImplicit.tagname = "div";
    if (!objImplicit.boxtype)objImplicit.boxtype = "relativebox";
    var b1 = new jsx3.gui.Painted.Box(objImplicit);

    //create the draggable splitter handle box
    var o = {};
    o.tagname = "div";
    o.boxtype = "box";
    var dblPct1 = this._getPanelMultiplier();
    o.parentwidth = b1.getClientWidth();
    o.parentheight = b1.getClientHeight();

    var objChildDimension = this.getClientDimensions(this.getChild(0));
    var child1Size = ((this.getOrientation() == Splitter.ORIENTATIONH) ? objChildDimension.width : objChildDimension.height);

    if(this.getOrientation() == Splitter.ORIENTATIONH) {
      o.left = child1Size;
      o.top = 0;
      o.width = 8;
      o.height = "100%";
    } else {
      o.left = 0;
      o.top = child1Size;
      o.width = "100%";
      o.height = 8;
    }
    var b1a = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1a);

    return b1;
  };

  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  Splitter_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //render the relevant events and attributes
    var strEvents = this.renderHandler(Event.MOUSEDOWN, "doBeginMove", 1);
    var strAttributes = this.renderAttributes(null, true);

    //render the outer box
    var b1 = this.getBoxProfile(true);

    b1.setAttributes(this.paintIndex() + this.paintTip() + ' id="' + this.getId() + '" class="jsx30splitter"' + this.paintLabel() + strAttributes);
    b1.setStyles(this.paintBackgroundColor() + this.paintVisibility() + this.paintDisplay() + this.paintCSSOverride());

    //render the splitter handle
    var b1a = b1.getChildProfile(0);
    b1a.setAttributes(strEvents + ' class="jsx30splitter_' + ((this.getOrientation() == Splitter.ORIENTATIONH)?"h":"v") + 'bar"');
    var strCursor = this._isEnabled() ? "" :  "cursor:default;";
    b1a.setStyles(strCursor + this.paintBackgroundColor() + ((this.getOrientation() == Splitter.ORIENTATIONH)?this.paintHSplitImage():this.paintVSplitImage()));

    //preconfigure the children to adhere to the layout standards defined by this splitter container
    var child1, child2;
    if((child1 = this.getChild(0)) != null) child1.syncBoxProfileSync(this.getClientDimensions(child1));
    if((child2 = this.getChild(1)) != null) child2.syncBoxProfileSync(this.getClientDimensions(child2));

    //return final string of HTML (including children)
    return b1.paint().join(b1a.paint().join("&#160;") + this.paintChildren());
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  Splitter_prototype.paintBackgroundColor = function() {
    return "background-color:" + ((this.getBackgroundColor()) ? this.getBackgroundColor() : Splitter.DEFAULTBGCOLOR) + ";";
  };

  /**
   * subclassed method: IE has a bug that will cause it to crash if nested tables are dragged across the screen; setting their display to 'none' fixes this
   * @private
   */
  Splitter_prototype.doBeginMove = function(objEvent, objGUI) {
    if (! objEvent.leftButton() || !this._isEnabled()) return;

    if (this.doEvent(Interactive.BEFORE_RESIZE, {objEVENT:objEvent, objGUI:objGUI}) === false)
      return;

    objGUI.style.backgroundColor = Splitter.DRAGCOLOR;
    // IE matrix mask does not loose focus when splitter is moved, explicitly focus on splitter. --dhwang
    this.focus();
    this._jsxmoving = true;
    if(this.getOrientation() == Splitter.ORIENTATIONH) {
      jsx3.EventHelp.constrainY = true;
    } else {
      jsx3.EventHelp.constrainX = true;
    }
    this.jsxsupermix(objEvent, objGUI);

    Event.subscribe(Event.MOUSEUP,this,"_doResizeEnd");
  };

  /**
   * called when resize bar is moused up on by the user. Used internally; if an 'afterresize' (e.g., jsx3.gui.Interactive.AFTER_RESIZE) script is bound to the splitter
   *            instance, this will fire after the resize is over; contextual access to the splitter can be referenced in the script via the object's self reference, 'this'
   * @private
   */
  Splitter_prototype._doResizeEnd = function(objEvent) {
    objEvent = objEvent.event;
    var objGUI = this.getRendered(objEvent).childNodes[0];
    Event.unsubscribe(Event.MOUSEUP,this,"_doResizeEnd");

    // since this gets called on every mouseup event, we need to track state
    if (! this._jsxmoving) return;
    this._jsxmoving = false;

    //release the mouse
    objEvent.releaseCapture(objGUI);

    //reset color of bar back to original bground
    var bg = this.getBackgroundColor();   
    objGUI.style.backgroundColor = (bg == -1) ? '' : bg || Splitter.DEFAULTBGCOLOR;
    
    //process resize according to the orientation of the splitter
    var offset, space;
    if (this.getOrientation() == Splitter.ORIENTATIONH) {
      offset = parseInt(objGUI.style.left);
      space = objGUI.parentNode.offsetWidth;
    } else {
      offset = parseInt(objGUI.style.top);
      space = objGUI.parentNode.offsetHeight;
    }

    // reset z-index of handle to the default specified in the CSS
    jsx3.html.removeStyle(objGUI, "z-index");
    
    var min1 = this.getSubcontainer1Min();
    var min2 = this.getSubcontainer2Min();
    
    if (offset < min1) offset = min1;
    else if (space - offset < min2) offset = space - min2;

    var b1 = this.getBoxProfile();
    if (b1) b1.getChildProfile(0).reset();

    //set the value (when using new box model, old method is skipped)
    this.setDynamicProperty("jsxsubcontainer1pct", null);
    var strPct = this.getSubcontainer1Pct();
    var numValue = (offset / space) * 100;
    if(strPct.indexOf(",") > -1) {
      var objPct = strPct.split(/\s*,\s*/g);
      if(objPct.length == 2) {
        numValue = objPct[0] == "*" ? "*," + (space - offset) : offset + ",*";
      } else {
        jsx3.log("Error setting container 1 as an integer: Name contains an errant comma: " + strPct);
      }
    }
    this.setSubcontainer1Pct(numValue, true);

    //execute any onAfterDrag code associated with the splitter
    this.doEvent(Interactive.AFTER_RESIZE, {objEVENT:objEvent, objGUI:objGUI, fpPCT1:numValue, _gipp:1});
  };

  /** @private @jsxobf-clobber */
  Splitter_prototype._getPanelMultiplier = function() {
    var strPct = this.getSubcontainer1Pct();
    var dblPct1;
    if(strPct.indexOf(",") > -1) {
      var objPct = strPct.split(/\s*,\s*/g);
      if(objPct.length == 2) {
        var objChildDimension = this.getParent().getClientDimensions(this);
        var child1Size = ((this.getOrientation() == Splitter.ORIENTATIONH) ? objChildDimension.parentwidth : objChildDimension.parentheight);
        dblPct1 = objPct[0] == "*" ? (child1Size - objPct[1]) / child1Size : objPct[0] / child1Size;
      } else {
        jsx3.log("Error: Name contains an errant comma: " + strPct);
        dblPct1 = .5;
      }
    } else
      dblPct1 = parseFloat(strPct) / 100;
    return dblPct1;
  };

  /**
   * Returns a valid percentage (e.g., 100.00%  23.567%) that will be applied to the on-screen element as its CSS width/height percentage
   * @return {String}
   */
  Splitter_prototype.getSubcontainer1Pct = function() {
    return (this.jsxsubcontainer1pct == null) ? "50%" : this.jsxsubcontainer1pct;
  };


  /**
   * Sets a valid percentage (e.g., 100%  23.567%) that will be applied to the on-screen element as its CSS width/height percentage.
   * If pixels are the preferred unit, you may use an integer and a wild card (*) to apply the value to either container.  For example,
   * <code>100,*</code> or <code>*,250</code>.
   * @param strSubcontainerPct {String} valid CSS width property as a percentage (e.g., 34.56%) or as an integer/wildcard pair (e.g., 100,*)
   * @param bView {boolean} false if null; if true the view is updated automatically without a repaint
   * @return {jsx3.gui.Splitter} this object
   */
  Splitter_prototype.setSubcontainer1Pct = function(strSubcontainerPct,bView) {
    //update MODEL
    if (typeof(strSubcontainerPct) == 'number') strSubcontainerPct += "%";
    this.jsxsubcontainer1pct = strSubcontainerPct;

    //update VIEW if applicable
    if (bView) {
      var objGUI = this.getRendered();
      if (objGUI != null)
        this.syncBoxProfile({parentwidth:objGUI.offsetWidth,parentheight:objGUI.offsetHeight}, objGUI);
    }

    return this;
  };

/* @JSC :: begin DEP */

  /**
   * Returns a valid percentage (e.g., 100.00%  23.567%) that will be applied to the on-screen element as its CSS width/height percentage
   * @return {String}
   * @deprecated
   * @private
   */
  Splitter_prototype.getSubcontainer2Pct = function() {
    return (this.jsxsubcontainer2pct == null) ? "49.999%" : this.jsxsubcontainer2pct;
  };

/* @JSC :: end */

/* @JSC :: begin DEP */

  /**
   * Sets a valid percentage (e.g., 100.00%  23.567%) that will be applied to the on-screen element as its CSS width/height percentage;
   *            returns reference to self to facilitate method chaining
   * @param strSubcontainerPct {String} valid CSS width property as a percentage (e.g., 34.56%)
   * @return {jsx3.gui.Splitter} this object
   * @deprecated
   * @private
   */
  Splitter_prototype.setSubcontainer2Pct = function(strSubcontainerPct) {
    this.jsxsubcontainer2pct = strSubcontainerPct;
    return this;
  };

/* @JSC :: end */

  /**
   * Returns a valid integer representing the minimum size in pixels for the container; the default minimum is 1
   * @return {int}
   */
  Splitter_prototype.getSubcontainer1Min = function() {
    return (this.jsxsubcontainer1min == null) ? 1 : this.jsxsubcontainer1min;
  };

  /**
   * Sets the minimum size in pixels for the container; the default minimum is 1;
   *            returns reference to self to facilitate method chaining
   * @param intMin {int} integer value represnting the minimum size in pixels for the container
   * @return {jsx3.gui.Splitter} this object
   */
  Splitter_prototype.setSubcontainer1Min = function(intMin) {
    this.jsxsubcontainer1min = intMin;
    return this;
  };

  /**
   * Returns a valid integer representing the minimum size in pixels for the container; the default minimum is 8
   * @return {int}
   */
  Splitter_prototype.getSubcontainer2Min = function() {
    return (this.jsxsubcontainer2min == null) ? 8 : this.jsxsubcontainer2min;
  };

  /**
   * Sets the minimum size in pixels for the container; the default minimum is 8;
   *            returns reference to self to facilitate method chaining
   * @param intMin {int} integer value represnting the minimum size in pixels for the container
   * @return {jsx3.gui.Splitter} this object
   */
  Splitter_prototype.setSubcontainer2Min = function(intMin) {
    this.jsxsubcontainer2min = intMin;
    return this;
  };

  /**
   *Returns whether the splitter layout is top-over (--) or side-by-side (|).
   * @return {int}
   */
  Splitter_prototype.getOrientation = function() {
    return (this.jsxorientation == null) ? Splitter.ORIENTATIONH : this.jsxorientation;
  };

  /**
   * Returns whether the splitter layout is top-over (--) or side-by-side (|);
   *          returns reference to self to facilitate method chaining
   * @param ORIENTATION {int} constant; either jsx3.gui.Splitter.ORIENTATIONH or jsx3.gui.Splitter.ORIENTATIONV
   * @return {jsx3.gui.Splitter} this object
   */
  Splitter_prototype.setOrientation = function(ORIENTATION) {
    //3.2 to do:  must clear the box profile when this is set
    this.jsxorientation = ORIENTATION;
    this.setBoxDirty();
    //3.2 to do: straggling resize handle not being udpated by recalc command fix as part of final QA
    return this;
  };

  /**
   * Returns the URL for the image to use for the splitter handle when the splitter is rendered top over bottom (--).  When not set, <code>Splitter.VSPLITIMAGE</code> will be used when painted on-screen.
   * @return {String}
   */
  Splitter_prototype.getVSplitImage = function() {
    return (this.jsxvsplitimage == null) ? Splitter.VSPLITIMAGE : this.jsxvsplitimage;
  };

  /**
   * Sets the URL for the image to use for the splitter handle when the splitter is rendered top over bottom (--).
   * @param strURL {String} valid URL. If no background image is wanted, pass an empty string. The resize bar for a top-over-bottom orientation is 8 pixels hight with a variable width; the image will be placed at background position, 'center center', and will not repeat.
   * @return {jsx3.gui.Splitter} this object
   */
  Splitter_prototype.setVSplitImage = function(strURL) {
    this.jsxvsplitimage = strURL;
    return this;
  };

  /**
   * Returns the URL for the image to use for the splitter handle when the splitter is rendered side by side ( | ). When not set, <code>Splitter.HSPLITIMAGE</code> will be used when painted on-screen.
   * @return {String}
   */
  Splitter_prototype.getHSplitImage = function() {
    return (this.jsxhsplitimage == null) ? Splitter.HSPLITIMAGE : this.jsxhsplitimage;
  };


  /**
   * Sets the URL for the image to use for the splitter handle when the splitter is rendered side by side ( | ).
   * @param strURL {String} valid URL. If no background image is wanted, pass an empty string. The resize bar for a side-by-side orientation is 8 pixels wide with a variable height; the image will be placed at background position, 'center center', and will not repeat.
   * @return {jsx3.gui.Splitter} this object
   */
  Splitter_prototype.setHSplitImage = function(strURL) {
    this.jsxhsplitimage = strURL;
    return this;
  };


  /** @private @jsxobf-clobber */
  Splitter_prototype.paintVSplitImage = function() {
    //3.2: the signature on the method has changed to only accept a URL, so it can be resolved by the URL Resolver. Check for old syntax here in order to support
    var strURL = this.getVSplitImage();
    return (strURL.search(/background-image\s*:\s*url\(/) != -1) ?
      strURL : "background-image:url(" + jsx3.resolveURI(strURL) + ");";
  };


  /** @private @jsxobf-clobber */
  Splitter_prototype.paintHSplitImage = function() {
    var strURL = this.getHSplitImage();
    return (strURL.search(/background-image\s*:\s*url\(/) != -1) ?
      strURL : "background-image:url(" + jsx3.resolveURI(strURL) + ");";
  };


  /**
   * Disallows more than two children.
   *
   * @return {boolean} <code>true</code> if the child count is zero or one.
   * @package
   */
  Splitter_prototype.onSetChild = function(child) {
    return this.getChildren().length < 2;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Splitter.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.Splitter
 * @see jsx3.gui.Splitter
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Splitter", -, null, function(){});
 */
jsx3.Splitter = jsx3.gui.Splitter;

/* @JSC :: end */
