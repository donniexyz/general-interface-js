/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Form", "jsx3.gui.Block");

/**
 * A GUI control that implements a draggable slider. The slider is draggable along a fixed-length line representing a linear
 * range of values. Events are provided for incremental drag events as well as the end drag (change) event.
 * <p/>
 * The range of values of a slider is always [0,100]. 0 is at the far left side of a horizontal slider and bottom
 * edge of a vertical slider. The value is available as a floating point number with the <code>getValue()</code>
 * method as well as the event handlers.
 *
 * @since 3.1
 */
jsx3.Class.defineClass("jsx3.gui.Slider", jsx3.gui.Block, [jsx3.gui.Form], function(Slider, Slider_prototype) {

  var Event = jsx3.gui.Event;

  /**
   * {int} Orientation value for a horizontal slider.
   * @final @jsxobf-final
   */
  Slider.HORIZONTAL = 0;

  /**
   * {int} Orientation value for a vertical slider.
   * @final @jsxobf-final
   */
  Slider.VERTICAL = 1;

  /** @private @jsxobf-clobber */
  Slider.DEFAULT_PARALLEL = 100;
  /** @private @jsxobf-clobber */
  Slider.DEFAULT_NORMAL = 15;
  /** @private @jsxobf-clobber */
  Slider.DEFAULT_TRACK = 7;
  /** @private @jsxobf-clobber */
  Slider.HANDLE_WIDTH = Slider.DEFAULT_NORMAL;
  /** @private @jsxobf-clobber */
  Slider.HANDLE_LENGTH = 15;
  /** @private @jsxobf-clobber */
  Slider.PERCENT = 100;

  // don't use jsx3.resolveURI() here because that is done when painting (to allow for relative user URI)
  /** @private @jsxobf-clobber */
  Slider.IMAGE_DOWNWARD = "jsx:///images/slider/top.gif";
  /** @private @jsxobf-clobber */
  Slider.IMAGE_UPWARD = "jsx:///images/slider/bottom.gif";
  /** @private @jsxobf-clobber */
  Slider.IMAGE_RIGHTWARD = "jsx:///images/slider/left.gif";
  /** @private @jsxobf-clobber */
  Slider.IMAGE_LEFTWARD = "jsx:///images/slider/right.gif";

  /** @private @jsxobf-clobber */
  Slider.DEFAULT_BACKGROUND_H = "filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr=#aaffffff, EndColorStr=#FF9090af);";
  /** @private @jsxobf-clobber */
  Slider.DEFAULT_BACKGROUND_V = "filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=1, StartColorStr=#aaffffff, EndColorStr=#FF9090af);";
  /** @private @jsxobf-clobber */
  Slider.DEFAULT_BORDER_H = "border:solid 1px #9898a5;border-right-color:#ffffff;border-bottom-color:#ffffff;";
  /** @private @jsxobf-clobber */
  Slider.DEFAULT_BORDER_V = "border:solid 1px #9898a5;border-right-color:#ffffff;border-top-color:#ffffff;";

  Slider_prototype.jsxlength = 100;
  Slider_prototype.jsxvalue = 0;
  Slider_prototype.jsxpainttrack = jsx3.Boolean.TRUE;
  Slider_prototype.jsxtrackclick = jsx3.Boolean.TRUE;
  Slider_prototype.jsximg = null;

  /**
   * The instance initializer.
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param vntLeft {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntTop {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntLength {int|String} the length of the control along the draggable axis
   */
  Slider_prototype.init = function(strName,vntLeft,vntTop,vntLength) {
    //call constructor for super class (when multiple super-classes, always derive from block)
    this.jsxsuper(strName,vntLeft,vntTop);

    this.jsxlength = vntLength;
  };

  /**
   * Returns the value of this slider.
   * @return {Number} between 0 and 100.
   */
  Slider_prototype.getValue = function() {
    return this.jsxvalue != null ? this.jsxvalue : 0;
  };

  /**
   * Sets the value of this slider and repositions the handle.
   * @param fpValue {Number} the new value, between 0 and 100.
   * @return {jsx3.gui.Slider} this object.
   */
  Slider_prototype.setValue = function(fpValue) {
    this.jsxvalue = fpValue == null ? null : Math.max(0, Math.min(Slider.PERCENT, Number(fpValue)));
    this._syncHandle();
    this.setBoxDirty(); // TODO: figure out a way of setting the value and then repainting without this step
    return this;
  };

  /**
   * Sets the validation state for this slider and returns the validation state.
   * @return {int} <code>jsx3.gui.Form.STATEVALID</code>.
   */
  Slider_prototype.doValidate = function() {
    return this.setValidationState(jsx3.gui.Form.STATEVALID).getValidationState();
  };

  /**
   * Returns the value of the length field, the size of the dimension along this slider axis.
   * @return {int|String} the length field
   */
  Slider_prototype.getLength = function() {
    return this.jsxlength != null ? this.jsxlength : Slider.DEFAULT_PARALLEL;
  };

  /**
   * Sets the length of this slider.
   * @param vntLength {int|String} e.g. 100[px] or "100%".
   * @param bRepaint {boolean} whether to repaint this slider immediately to reflect the change.
   * @return {jsx3.gui.Slider} this object.
   */
  Slider_prototype.setLength = function(vntLength, bRepaint) {
    this.jsxlength = vntLength;
    this.setBoxDirty();
    //repaint if designated
    if (bRepaint) this.repaint();
    return this;
  };

  // these methods provided for the stage focus rectangle to work properly

  Slider_prototype.setWidth = function(vntWidth, bRepaint) {
    if (this.getOrientation() == Slider.HORIZONTAL)
      this.setLength(vntWidth, bRepaint);
    return this;
  };

  Slider_prototype.setHeight = function(vntHeight, bRepaint) {
    if (this.getOrientation() == Slider.VERTICAL)
      this.setLength(vntHeight, bRepaint);
    return this;
  };

  /**
   * Returns the orientation of this slider.
   * @return {int} <code>HORIZONTAL</code> or <code>VERTICAL</code>.
   * @see #HORIZONTAL
   * @see #VERTICAL
   */
  Slider_prototype.getOrientation = function() {
    return this.jsxorientation != null ? this.jsxorientation : Slider.HORIZONTAL;
  };

  /**
   * Sets the orientation of this slider.
   * @param intValue {int} <code>HORIZONTAL</code> or <code>VERTICAL</code>.
   * @return {jsx3.gui.Slider} this object.
   */
  Slider_prototype.setOrientation = function(intValue) {
    this.jsxorientation = intValue;
    this.setBoxDirty();
    return this;
  };

  /**
   * Returns whether the track is painted.
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  Slider_prototype.getPaintTrack = function() {
    return this.jsxpainttrack != null ? this.jsxpainttrack : jsx3.Boolean.TRUE;
  };

  /**
   * Sets whether the track is painted.
   * @param bValue {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>.
   * @return {jsx3.gui.Slider} this object.
   */
  Slider_prototype.setPaintTrack = function(bValue) {
    this.jsxpainttrack = bValue;
    return this;
  };

  /**
   * Returns whether clicking the track moves the handle to that point.
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>.
   */
  Slider_prototype.getTrackClickable = function() {
    return this.jsxtrackclick != null ? this.jsxtrackclick : jsx3.Boolean.TRUE;
  };

  /**
   * Sets whether clicking the track moves the handle to that point.
   * @param bValue {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>.
   * @return {jsx3.gui.Slider} this object.
   */
  Slider_prototype.setTrackClickable = function(bValue) {
    this.jsxtrackclick = bValue;
    return this;
  };

  /**
   * Returns the URL of the image to use for the handle.
   * @return {String}
   */
  Slider_prototype.getHandleImage = function() {
    return this.jsximg;
  };

  /**
   * Sets the URL of the image to use for the handle. If no URL is set, a default image is used.
   * @param strUrl {String}
   * @return {jsx3.gui.Slider} this object.
   */
  Slider_prototype.setHandleImage = function(strUrl) {
    this.jsximg = strUrl;
    return this;
  };

  /**
   * moves the handle to the screen coordinate for the current value of this slider
   * @private
   * @jsxobf-clobber
   */
  Slider_prototype._syncHandle = function() {
    var objGUI = this.getRendered();

    if (objGUI != null) {
       var track = jsx3.html.selectSingleElm(objGUI, 0, 0);
       var handle = jsx3.html.selectSingleElm(objGUI, 0, 1);

       if (this.getOrientation() == Slider.HORIZONTAL) {
         var width = parseInt(track.offsetWidth) - parseInt(handle.offsetWidth);
         handle.style.left = Math.round(this.getValue() * width / Slider.PERCENT) + "px";
         handle.style.top = Math.round((Slider.DEFAULT_NORMAL - Slider.HANDLE_WIDTH) / 2) + "px";
       } else {
         var height = parseInt(track.offsetHeight) - parseInt(handle.offsetHeight);
         handle.style.left = Math.round((Slider.DEFAULT_NORMAL - Slider.HANDLE_WIDTH) / 2) + "px";
         handle.style.top = (height - Math.round(this.getValue() * height / Slider.PERCENT)) + "px";
       }
    }
  };

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  Slider_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    //get the existing box profile
    var b1 = this.getBoxProfile(true, objImplicit);

    if (objGUI) {
      //if width/height are about to be affected, synchronize the handle
      var bSubscribe = ((objImplicit.width != null && b1.implicit.width != objImplicit.width) ||
                       (objImplicit.parentwidth != b1.implicit.parentwidth && (typeof(b1.implicit.width) == "string" && b1.implicit.width.indexOf("%")>0)) ||
                       (objImplicit.height != null && b1.implicit.height != objImplicit.height) ||
                       (objImplicit.parentheight != b1.implicit.parentheight && (typeof(b1.implicit.height) == "string" && b1.implicit.height.indexOf("%")>0)));

      //recalculate the boxes
      var recalcRst = b1.recalculate(objImplicit,objGUI,objQueue);
      if (!recalcRst.w && !recalcRst.h) return;

      var b10 = b1.getChildProfile(0);
      b10.recalculate({width:b1.getClientWidth(),height:b1.getClientHeight()},objGUI?objGUI.childNodes[0]:null,objQueue);
      var b1a = b10.getChildProfile(0);
      b1a.recalculate({width:b10.getClientWidth(),height:b10.getClientHeight()},objGUI?objGUI.childNodes[0].childNodes[0]:null,objQueue);

      if (bSubscribe) this._syncHandle();
    }
  };

  /**
   * Creates the box model/profile for the object
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box}
   * @private
   */
  Slider_prototype.createBoxProfile = function(objImplicit) {
    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if (this.getParent() && (objImplicit == null || ((isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if(objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    //determine relative position (this will affect left, top, and boxtype properties)
    var bRelative = (this.getRelativePosition() != 0 && (!this.getRelativePosition() || this.getRelativePosition() == jsx3.gui.Block.RELATIVE));
    var myLeft = (bRelative) ? null : this.getLeft();
    var myTop = (bRelative) ? null : this.getTop();
    var bHoriz = this.getOrientation() == Slider.HORIZONTAL;

    //create outer box
    if (!objImplicit.boxtype)objImplicit.boxtype = (bRelative) ? "relativebox" : "box";
    objImplicit.tagname = "span";
    if(objImplicit.left == null && myLeft != null) objImplicit.left = myLeft;
    if(objImplicit.top == null && myTop != null) objImplicit.top = myTop;
    if(bHoriz) {
      objImplicit.height = Slider.DEFAULT_NORMAL;
      objImplicit.width = this.getLength();
    } else {
      objImplicit.height = this.getLength();
      objImplicit.width = Slider.DEFAULT_NORMAL;
    }
    var mar = this.getMargin();
    if(bRelative && mar != null && mar != "") objImplicit.margin = mar;
    var b1 = new jsx3.gui.Painted.Box(objImplicit);

    //create the insulating div (fixes the '-moz-inline-box' layout problem for ff, while behaving unobtrusively in ie)
    var o = {};
    o.tagname = "div";
    o.boxtype = "inline";
    o.width = b1.getClientWidth();
    o.height = b1.getClientHeight();
    var strPadSide = Math.round((Slider.DEFAULT_NORMAL - Slider.DEFAULT_TRACK) / 2) + " ";
    var strPadEdge = "0 ";
    o.padding = (bHoriz ?
        strPadSide + strPadEdge + strPadSide + strPadEdge :
        strPadEdge + strPadSide + strPadEdge + strPadSide);
    var b10 = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b10);

    //create the fixed bar box
    o = {};
    o.tagname = "div";
    o.boxtype = "inline";
    if(bHoriz) {
      o.height = Slider.DEFAULT_TRACK;
      o.width = b10.getClientWidth();
    } else {
      o.height = b10.getClientHeight();
      o.width = Slider.DEFAULT_TRACK;
    }
    o.border = (this.getBorder()) ?
         this.getBorder() :
         (this.getOrientation() == Slider.HORIZONTAL ?
         Slider.DEFAULT_BORDER_H :
         Slider.DEFAULT_BORDER_V);
    var b1a = new jsx3.gui.Painted.Box(o);
    b10.addChildProfile(b1a);

    //create the grab point container
    var intLeft = bHoriz ? Math.round(this.getValue()/Slider.PERCENT * (b10.getClientWidth()-Slider.HANDLE_LENGTH)) :
        Math.floor((Slider.DEFAULT_NORMAL-Slider.HANDLE_WIDTH)/2);
    var intTop = bHoriz ? Math.floor((Slider.DEFAULT_NORMAL-Slider.HANDLE_WIDTH)/2) :
        Math.round((b10.getClientHeight()-Slider.HANDLE_LENGTH) - this.getValue()/Slider.PERCENT * (b10.getClientHeight()-Slider.HANDLE_LENGTH));
    var intWidth = bHoriz ? Slider.HANDLE_LENGTH : Slider.HANDLE_WIDTH;
    var intHeight = bHoriz ? Slider.HANDLE_WIDTH : Slider.HANDLE_LENGTH;
    o = {};
    o.tagname = "div";
    o.boxtype = "box";
    o.left = intLeft;
    o.top = intTop;
    o.width = intWidth;
    o.height = intHeight;
    var b1b = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1b);

    // create the grab point
    o = {};
    o.tagname = "div";
    o.boxtype = "inline";
    o.width = intWidth;
    o.height = intHeight;
    var b1ba = new jsx3.gui.Painted.Box(o);
    b1b.addChildProfile(b1ba);

    return b1;
  };

  Slider_prototype._ebKeyDown = function(objEvent, objGUI) {
    if (! objEvent.hasModifier()) {
      if (objEvent.isArrowKey()) {
        if (objEvent.upArrow() || objEvent.rightArrow())
          this._incrementValue(objEvent, 1);
        else if (objEvent.downArrow() || objEvent.leftArrow())
          this._incrementValue(objEvent, -1);
        objEvent.cancelAll();
      }
    }
  };

  Slider_prototype._ebMouseWheel = function(objEvent, objGUI) {
    var delta = objEvent.getWheelDelta();
    if (delta != 0) {
      this._incrementValue(objEvent, delta > 0 ? 1 : -1);
    }
    objEvent.cancelBubble();
  };

  /** @private @jsxobf-clobber */
  Slider_prototype._incrementValue = function(objEvent, intBy) {
    var value;
    if (intBy > 0) {
      if (this.jsxvalue >= Slider.PERCENT) return;
      value = Math.floor(this.jsxvalue + intBy);
      while (value < Slider.PERCENT) {
        if (this.jsxvalue < this.constrainValue(value))
          break;
        value += intBy;
      }
    } else {
      if (this.jsxvalue <= 0) return;
      value = Math.ceil(this.jsxvalue + intBy);
      while (value > 0) {
        if (this.jsxvalue > this.constrainValue(value))
          break;
        value += intBy;
      }
    }

    value = this.constrainValue(value);
    if (value != this.jsxvalue) {
      var cancel = this.doEvent(jsx3.gui.Interactive.CHANGE,
          {objEVENT:objEvent, fpPREVIOUS:this.jsxvalue, fpVALUE:value});

      if (cancel !== false)
        this.setValue(value);
    }
  };

  Slider.BRIDGE_EVENTS = {};
  Slider.BRIDGE_EVENTS[Event.KEYDOWN] = true;
  Slider.BRIDGE_EVENTS[Event.MOUSEWHEEL] = true;

  /**
   * Paints this slider.
   * @return {String} the serialized HTML.
   */
  Slider_prototype.paint = function() {
    this.applyDynamicProperties();

    var bHoriz = this.getOrientation() == Slider.HORIZONTAL;
    var bEnabled = this.getEnabled() == jsx3.gui.Form.STATEENABLED;

    var strEvents = this.renderHandlers(bEnabled ? Slider.BRIDGE_EVENTS : null, 0);
    var strAttributes = this.renderAttributes(null, true);

    //paint the outer-most box
    var b1 = this.getBoxProfile(true);
    b1.setAttributes('id="' + this.getId() + '" class="jsx30slider" ' + 
                      this.paintIndex() + this.paintTip() + this.paintLabel() + strEvents + strAttributes);
    b1.setStyles(this.paintOverflow() + this.paintZIndex() + this.paintVisibility() + this.paintDisplay());

    //paint the grab-point box
    var b10 = b1.getChildProfile(0);

    //paint the fixed-bar box
    var strVis = (!this.getPaintTrack()) ? 'visibility:hidden;' : '';
    var strEvt = (this.getTrackClickable() && bEnabled) ? this.renderHandler(Event.CLICK, '_doTrackClick', 2) : '';
    var b1a = b10.getChildProfile(0);
    b1a.setStyles(this.paintBackgroundColor() + this.paintBackground() + strVis);
    b1a.setAttributes(' class="jsx30slider_track" ' + strEvt);

    //paint the grab-point container box
    var strHandleUrl = this.getHandleImage();
    if(strHandleUrl == null) strHandleUrl = bHoriz ? Slider.IMAGE_DOWNWARD : Slider.IMAGE_RIGHTWARD;
    var b1b = b1.getChildProfile(1);
    b1b.setAttributes('class="handle"' + (bEnabled ? this.renderHandler(Event.MOUSEDOWN, '_doStartDrag', 2) : ''));

    //paint the grab-point box
    var b1ba = b1b.getChildProfile(0);
    b1ba.setAttributes(' class="handle' + (bEnabled ? '' : '_disabled') + '"' + jsx3.html._UNSEL);
    b1ba.setStyles('background-image:url(' + this.getUriResolver().resolveURI(strHandleUrl) + ');');

    //return final string of HTML
    return b1.paint().join(b10.paint().join(b1a.paint().join("&#160;")+b1b.paint().join(b1ba.paint().join(""))));
  };

  /**
   * called on mouse down for the handle
   * @private
   * @jsxobf-clobber
   */
  Slider_prototype._doStartDrag = function(objEvent, objDraggerGUI) {
    if (! objEvent.leftButton()) return;

    objEvent.cancelBubble();
    objEvent.cancelReturn();

    var bHoriz = this.getOrientation() == Slider.HORIZONTAL;
    var me = this;
    jsx3.gui.Interactive._beginMoveConstrained(objEvent, objDraggerGUI,
        function(x,y,e) {return me._constrainDrag(e,x,y);});
    Event.subscribe(Event.MOUSEMOVE, this, "_onIncrementalDrag");
    Event.subscribe(Event.MOUSEUP, this, "_onDoneDrag");
  };

  /**
   * called on click the track
   * @private
   * @jsxobf-clobber
   */
  Slider_prototype._doTrackClick = function(objEvent, objGUI) {
    if (! objEvent.leftButton()) return;

    var bHoriz = this.getOrientation() == Slider.HORIZONTAL;
    var value = this._getValueFromPosition(bHoriz ? objEvent.getOffsetX() : objEvent.getOffsetY());
    value = this.constrainValue(value);

    if (this.jsxvalue != value) {
      var cancel = this.doEvent(jsx3.gui.Interactive.CHANGE, {objEVENT:objEvent, fpPREVIOUS: this.jsxvalue, fpVALUE:value, _gipp:1});
      if (cancel !== false)
        this.setValue(value);
    }
  };

  /**
   * constrains x and y drag coordinates to the allowed position for the handle
   * @private
   * @jsxobf-clobber
   */
  Slider_prototype._constrainDrag = function(objEvent, intX, intY) {
    var objGUI = this.getRendered(objEvent);
    var bHoriz = this.getOrientation() == Slider.HORIZONTAL;

    var x = 0, y = 0;

    if (objGUI != null) {
      var track = jsx3.html.selectSingleElm(objGUI, 0, 0);
      var handle = jsx3.html.selectSingleElm(objGUI, 0, 1);

      if (bHoriz) {
        y = handle.offsetY;
        var xVal = Slider.PERCENT * intX / (track.offsetWidth-handle.offsetWidth);
        xVal = this.constrainValue(xVal);
        x = Math.round(xVal * (track.offsetWidth-handle.offsetWidth) / Slider.PERCENT);
      } else {
        x = handle.offsetX;
        var yVal = Slider.PERCENT * intY / (track.offsetHeight-handle.offsetHeight);
        yVal = this.constrainValue(yVal);
        y = Math.round(yVal * (track.offsetHeight-handle.offsetHeight) / Slider.PERCENT);
      }
    }

    return [x,y];
  };

  /**
   * called for each mouse move while dragging the handle and after the drag coordinates have been constrained
   * @private
   * @jsxobf-clobber
   */
  Slider_prototype._onIncrementalDrag = function(objEvent) {
    var fpValue = this.constrainValue(this._getValueFromPosition());
    this.doEvent(jsx3.gui.Interactive.INCR_CHANGE, {objEVENT:objEvent.event, fpVALUE:fpValue});
  };

  /**
   * called when the drag completes (mouse up)
   * @private
   * @jsxobf-clobber
   */
  Slider_prototype._onDoneDrag = function(objEvent) {
    jsx3.EventHelp.reset();
    Event.unsubscribe(Event.MOUSEMOVE, this, "_onIncrementalDrag");
    Event.unsubscribe(Event.MOUSEUP, this, "_onDoneDrag");

    var fpValue = this.constrainValue(this._getValueFromPosition());
    var cancel = this.doEvent(jsx3.gui.Interactive.CHANGE, {objEVENT:objEvent.event, fpPREVIOUS:this.jsxvalue, fpVALUE:fpValue, _gipp:1});

    if (cancel === false) {
      this.setValue(this.jsxvalue);
    } else {
      this.jsxvalue = fpValue;
      this.setBoxDirty();
    }
  };

  /**
   * Returns the value represented by the current position of the handle
   * @param intOffset {int} if provided, use this as the handle offset instead of the actual offset
   * @private
   * @jsxobf-clobber
   */
  Slider_prototype._getValueFromPosition = function(intOffset) {
    var objGUI = this.getRendered();

    if (objGUI != null) {
      var bHoriz = this.getOrientation() == Slider.HORIZONTAL;
      var track = jsx3.html.selectSingleElm(objGUI, 0, 0);
      var handle = jsx3.html.selectSingleElm(objGUI, 0, 1);

      return bHoriz ?
          Slider.PERCENT * (intOffset != null ? intOffset : handle.offsetLeft) / (track.offsetWidth-handle.offsetWidth) :
          Slider.PERCENT * (1 - (intOffset != null ? intOffset : handle.offsetTop) / (track.offsetHeight-handle.offsetHeight));
    } else {
      return 0;
    }
  };

  /**
   * Constrains a possible slider value to a legal value. This implementation ensures that the resulting value is
   * within the legal range of [0,100].<p/>Override this method on an instance of <code>jsx3.gui.Slider</code> to
   * create a "notched" slider. The following code creates a slider that allows its handle to be in a location
   * corresponding to a value that is a multiple of 10:
   * <pre>
   * objSlider.constrainValue = function(fpValue) {
   *   return Math.max(0, Math.min(100, jsx3.util.numRound(fpValue, 10)));
   * }
   * </pre>
   * @param fpValue {Number} the value to validate, usually corresponds to a value along that slider that the handle is being dragged.
   * @return {Number} the validated value, usually the nearest value to <code>fpValue</code> that is legal for this slider.
   */
  Slider_prototype.constrainValue = function(fpValue) {
    return Math.max(0, Math.min(Slider.PERCENT, fpValue));
  };

  /** @private @jsxobf-clobber */
  Slider_prototype.paintBackground = function() {
    var bg = this.getBackground() || "";
    return (bg || this.paintBackgroundColor()) ? bg + ";" :
        (this.getOrientation() == Slider.HORIZONTAL ? Slider.DEFAULT_BACKGROUND_H : Slider.DEFAULT_BACKGROUND_V);
  };

  Slider_prototype.onSetChild = function(objChild) {
    return false;
  };
  
/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "3.0.00")
   * @return {String}
   * @deprecated
   */
  Slider.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.Slider
 * @see jsx3.gui.Slider
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Slider", -, null, function(){});
 */
jsx3.Slider = jsx3.gui.Slider;

/* @JSC :: end */
