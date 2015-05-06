/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Form", "jsx3.gui.Block");

/**
 * Renders a toolbar button.
 * Normal, check, and radio type buttons are supported. All buttons support 16x16 pixel icons.
 * When rendered, buttons are 22 pixels wide by 22 pixels high (unless a text label is used or a menu is bound,
 * in which case the button is wider).
 * <p/>
 * This class publishes the following model events:
 * <ul>
 * <li><code>EXECUTE</code> &#8211; when the user clicks on the enabled button, when the button has focus and the user presses the
 *    space or enter key, or when <code>doExecute()</code> is called on the button.</li>
 * <li><code>CHANGE</code> &#8211; when the state of a check or radio type button changes through user interaction or when
 *    <code>setState()</code> is called under the deprecated 3.0 model event protocol.</li>
 * <li><code>MENU</code> &#8211; on a mouseup event with the right button when the button has a bound context menu.</li>
 * </ul>
 */
jsx3.Class.defineClass("jsx3.gui.ToolbarButton", jsx3.gui.Block, [jsx3.gui.Form], function(ToolbarButton, ToolbarButton_prototype) {

  var Form = jsx3.gui.Form;
  var Interactive = jsx3.gui.Interactive;
  var Event = jsx3.gui.Event;

  /**
   * {int} Value of the type field indicating a normal (stateless) button.
   * @final @jsxobf-final
   */
  ToolbarButton.TYPENORMAL = 0;

  /**
   * {int} Value of the type field indicating a check button. A check button is a two-state button with
   *   a down state (on) and an up state (off).
   * @final @jsxobf-final
   */
  ToolbarButton.TYPECHECK = 1;

  /**
   * {int} Value of the type field indicating a radio button. A radio button is a two-state button that exists as
   *   a member of a set of radio buttons. Only one radio button is a set may be in a down state at one time.
   * @final @jsxobf-final
   */
  ToolbarButton.TYPERADIO = 2;

  /**
   * {int} Value of the state field indicating the up/off state. A normal button is always off.
   * @final @jsxobf-final
   */
  ToolbarButton.STATEOFF = 0;

  /**
   * {int} Value of the state field indicating the down/on state. Check and radio buttons may be on.
   * @final @jsxobf-final
   */
  ToolbarButton.STATEON = 1;

  /** @private @jxsobf-clobber */
  ToolbarButton.IMAGEDOWN = jsx3.resolveURI("jsx:///images/tbb/down.gif");
  /** @private @jxsobf-clobber */
  ToolbarButton.IMAGEON = jsx3.resolveURI("jsx:///images/tbb/on.gif");
  /** @private @jxsobf-clobber */
  ToolbarButton.IMAGEOVER = jsx3.resolveURI("jsx:///images/tbb/over.gif");
  /** @private @jxsobf-clobber */
  ToolbarButton.DEFAULTIMAGE = jsx3.resolveURI("jsx:///images/tbb/default.gif");
  /** @private @jxsobf-clobber */
  ToolbarButton.BORDERCOLOR = "#9B9BB7";

/* @JSC */ if (jsx3.CLASS_LOADER.IE6) {
  jsx3.html.loadImages(ToolbarButton.IMAGEDOWN, ToolbarButton.IMAGEON, ToolbarButton.IMAGEOVER,
      ToolbarButton.DEFAULTIMAGE);
/* @JSC */ }
    
  /** {jsx3.gui.HotKey} @private @jsxobf-clobber */
  ToolbarButton_prototype._jsxhotkey = null;

  /**
   * The instance initializer.
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param intType {int} the type of button to create: <code>TYPENORMAL</code>, or <code>TYPECHECK</code>,
   *   <code>TYPERADIO</code>.
   * @param strTip {String} the tooltip text for the button.
   */
  ToolbarButton_prototype.init = function(strName, intType, strTip) {
    //call constructor for super class
    this.jsxsuper(strName,null,null,null,null);

    //update properties unique to the jsx3.gui.ToolbarButton class
    if (intType != null) this.setType(intType);
    if (strTip != null) this.setTip(strTip);
  };

  /**
   * Returns the URL of the image to use when this button is disabled.
   * @return {String}
   */
  ToolbarButton_prototype.getDisabledImage = function() {
    return (this.jsxdisabledimage != null && jsx3.util.strTrim(this.jsxdisabledimage) != "") ?
        this.jsxdisabledimage : this.getImage();
  };

  /**
   * Sets the URL of the image to use when this button is disabled. If no disabled image is set the normal image is
   * used instead.
   * @param strURL {String} the URL of an image file, 16px by 16px.
   * @return {jsx3.gui.ToolbarButton} this object.
   */
  ToolbarButton_prototype.setDisabledImage = function(strURL) {
    this.jsxdisabledimage = strURL;
    return this;
  };

  /**
   * Validates this button based on the type of button and whether this control is required. Normal buttons are always
   * valid because they have no state. Radio and check buttons are valid if they are on or if they are not required.
   *
   * @return {int} <code>jsx3.gui.Form.STATEVALID</code> or <code>jsx3.gui.Form.STATEINVALID</code>.
   * @see jsx3.gui.Form#STATEVALID
   * @see jsx3.gui.Form#STATEINVALID
   */
  ToolbarButton_prototype.doValidate = function() {
    var bValid = this.getType == ToolbarButton.TYPENORMAL || this.getRequired() == Form.OPTIONAL
        || this.getState() == ToolbarButton.STATEON;
    return this.setValidationState(bValid ? Form.STATEVALID : Form.STATEINVALID).getValidationState();
  };

  /**
   * Returns the URL of the image to use to render this button.
   * @return {String}
   */
  ToolbarButton_prototype.getImage = function() {
    return (this.jsximage != null && jsx3.util.strTrim(this.jsximage) != "") ? this.jsximage : null;
  };

  /**
   * Sets the URL of the image to use to render this button. The URL is resolved by the URI resolver of this button
   * before it is rendered to HTML.
   *
   * @param strURL {String} the URL of an image file, 16px by 16px.
   * @return {jsx3.gui.ToolbarButton} this object.
   */
  ToolbarButton_prototype.setImage = function(strURL) {
    this.jsximage = strURL;
    return this;
  };

  /**
   * Returns the type of this button.
   * @return {int} <code>TYPENORMAL</code>, or <code>TYPECHECK</code>, or <code>TYPERADIO</code>.
   */
  ToolbarButton_prototype.getType = function() {
    return (this.jsxtype == null) ? ToolbarButton.TYPENORMAL : this.jsxtype;
  };

  /**
   * Sets the type of this button.
   * @param TYPE {int} <code>TYPENORMAL</code>, or <code>TYPECHECK</code>, <code>TYPERADIO</code>.
   * @return {jsx3.gui.ToolbarButton} this object.
   * @see #TYPENORMAL
   * @see #TYPECHECK
   * @see #TYPERADIO
   */
  ToolbarButton_prototype.setType = function(TYPE) {
    this.jsxtype = TYPE;
    return this;
  };

  /** @private */
  ToolbarButton_prototype._ebKeyDown = function(objEvent, objGUI) {
    if (objEvent.spaceKey() || objEvent.enterKey()) {
      //run the code bound to the 'execute' event for the button instance
      this._doClick(objEvent, objGUI);
      //stop event bubbling; the space key also fires a scroll event
      objEvent.cancelAll();
    }
  };

  /** @package */
  ToolbarButton_prototype.getMaskProperties = function() {
    return jsx3.gui.Block.MASK_NO_EDIT;
  };

  /** @private */
  ToolbarButton_prototype._ebMouseDown = function(objEvent, objGUI) {
    if (! objEvent.leftButton()) return;

    objGUI.style.backgroundImage = "url(" + ToolbarButton.IMAGEDOWN + ")";
    objGUI.childNodes[3].style.backgroundColor = ToolbarButton.BORDERCOLOR;
    if (this.getEvent(Interactive.MENU) != null)
      objGUI.childNodes[2].style.backgroundImage = "url(" + ToolbarButton.IMAGEDOWNMENU + ")";
  };

  /** @private */
  ToolbarButton_prototype._ebMouseUp = function(objEvent, objGUI) {
    if (objEvent.leftButton()) {
      var bOn = this.jsxstate == ToolbarButton.STATEON;
      objGUI.style.backgroundImage = bOn ? "url(" + ToolbarButton.IMAGEON + ")" : "";
      objGUI.childNodes[3].style.backgroundColor = bOn ? ToolbarButton.BORDERCOLOR : "";
    } else if (objEvent.rightButton()) {
      this.jsxsupermix(objEvent, objGUI);
    }
  };

  /** @private */
  ToolbarButton_prototype._ebMouseOver = function(objEvent, objGUI) {
    if (this.getState() == ToolbarButton.STATEOFF) {
      objGUI.style.backgroundImage = "url(" + ToolbarButton.IMAGEOVER + ")";
      objGUI.childNodes[3].style.backgroundColor = "#808080";
    }
  };

  /** @private */
  ToolbarButton_prototype._ebMouseOut = function(objEvent, objGUI) {
    // only swap out the image if button isn't in the on state
    if (this.getState() == ToolbarButton.STATEOFF) {
      objGUI.style.backgroundImage = "";
      objGUI.childNodes[3].style.backgroundColor = "";
    }
  };

  /**
   * Invokes the <code>EXECUTE</code> model event of this toolbar button. Note that because the model event is invoked
   * programmatically rather than by user interaction the <code>objEVENT</code> event parameter will be
   * <code>null</code> if the <b>objEvent</b> parameter is undefined. If this is a radio button its state is
   * set to on. If this is a check button, its state is toggled.
   *
   * @param objEvent {jsx3.gui.Event} the browser event that caused the execution of this button. This argument is
   *    optional and should only be provided if the execution of this button is the result of a browser event. This
   *    parameter will be passed along to the model event as <code>objEVENT</code>.
   */
  ToolbarButton_prototype.doExecute = function(objEvent) {
    if (objEvent == null) objEvent = true;
    this._doClick(objEvent, this.getRendered(objEvent instanceof Event ? objEvent : null));
  };

/* @JSC :: begin DEP */

  /**
   * Invokes the <code>EXECUTE</code> model event of this toolbar button.
   * @deprecated  Use <code>doExecute()</code> to invoke the <code>EXECUTE</code> model event programmatically.
   * @see #doExecute()
   */
  ToolbarButton_prototype.doClick = function() {
    this._doClick(true, this.getRendered());
  };

/* @JSC :: end */

  /**
   * @param objEvent {jsx3.gui.Event|boolean} optional, <code>true</code> to invoke model event with <code>objEVENT=null</code>
   * @private
   * @jsxobf-clobber
   */
  ToolbarButton_prototype._doClick = function(objEvent, objGUI) {
    // the jsxexecute event can eval to false to veto and state change in the button
    var toggle = this.doEvent(Interactive.EXECUTE, {objEVENT:(objEvent instanceof Event ? objEvent : null)});

    if (toggle !== false) {
      //set state now that click event has occurred
      if (this.getType() == ToolbarButton.TYPERADIO) {
        //set state to true for this button to "ON"; "OFF" for all siblings
        this._setState(ToolbarButton.STATEON, objEvent, objGUI);
      } else if (this.getType() == ToolbarButton.TYPECHECK) {
        //toggle state for this button
        this._setState((this.getState() == ToolbarButton.STATEON) ?
            ToolbarButton.STATEOFF : ToolbarButton.STATEON, objEvent, objGUI);
      }
    }
  };

  /**
   * Returns the name of the group to which this radio button belongs. This method returns <code>null</code> if this
   * button is not a radio button.
   * @return {String}
   * @see #TYPERADIO
   */
  ToolbarButton_prototype.getGroupName = function() {
    return (this.jsxgroupname != null && this.getType() == ToolbarButton.TYPERADIO) ? this.jsxgroupname : null;
  };

  /**
   * Sets the name of the group to which this radio button belongs. This method only applies to radio buttons.
   * @param strGroupName {String} the name of button group.
   * @return {jsx3.gui.ToolbarButton} this object.
   * @see #TYPERADIO
   */
  ToolbarButton_prototype.setGroupName = function(strGroupName) {
    if (this.getType() == ToolbarButton.TYPERADIO)
      this.jsxgroupname = strGroupName;
    return this;
  };

  /**
   * Returns whether this toolbar button renders a visual divider on its left side.
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>.
   */
  ToolbarButton_prototype.getDivider = function() {
    return (this.jsxdivider != null) ? this.jsxdivider : 0;
  };

  /**
   * Sets whether this toolbar button renders a visual divider on its left side. The divider is useful for
   * visually separating this toolbar button from the next toolbar button to the left.
   * @param intDivider {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>.
   * @return {jsx3.gui.ToolbarButton} this object.
   */
  ToolbarButton_prototype.setDivider = function(intDivider, bRecalc) {
    this.jsxdivider = intDivider;
    if (bRecalc)
      this.recalcBox(["border","padding"]);
    else
      this.setBoxDirty();

    return this;
  };

  /**
   * Returns the state of this button. A normal button always returns <code>STATEOFF</code>. Radio and check
   * buttons may return <code>STATEOFF</code> or <code>STATEON</code>.
   * @return {int} <code>STATEON</code> or <code>STATEOFF</code>.
   * @see #STATEON
   * @see #STATEOFF
   */
  ToolbarButton_prototype.getState = function() {
    return (this.getType() == ToolbarButton.TYPENORMAL) ? ToolbarButton.STATEOFF :
        ((this.jsxstate == null) ? ToolbarButton.STATEOFF : this.jsxstate);
  };

  /**
   * Sets the state of this button. This method effects both the model and the view immediately. <b>This method invokes
   * the <code>CHANGE</code> model event only under the deprecated 3.0 model event protocol.</b>
   *
   * @param intState {int} <code>STATEON</code> or <code>STATEOFF</code>.
   * @return {jsx3.gui.ToolbarButton} this object.
   * @see #STATEON
   * @see #STATEOFF
   */
  ToolbarButton_prototype.setState = function(intState) {
    var objEvent = null;

/* @JSC :: begin DEP */
    // DEPRECATED: sending true for event
    objEvent = this.isOldEventProtocol();
/* @JSC :: end */

    this._setState(intState, objEvent, this.getRendered());
    return this;
  };

  /**
   * @param STATE {int}
   * @param objEvent {jsx3.gui.Event|boolean} optional, <code>true</code> to invoke model event with <code>objEVENT=null</code>
   * @private
   * @jsxobf-clobber
   */
  ToolbarButton_prototype._setState = function(STATE, objEvent, objGUI) {
    var bChanged = false;

    if (this.getType() == ToolbarButton.TYPERADIO && STATE == ToolbarButton.STATEON) {
      //radio buttons are unique in that

      var myGroupName = this.getGroupName();
      var objSiblings = this.getParent().findDescendants(
      function(x){ return (x instanceof ToolbarButton) && (x.getGroupName() == myGroupName); },
          false, true, true);

      for (var i=objSiblings.length-1;i>=0;i--) {
        if (objSiblings[i] != this && objSiblings[i].getType() == ToolbarButton.TYPERADIO) {
          //turn this sibling button off
          objSiblings[i].jsxstate = ToolbarButton.STATEOFF;
          var objGUITemp = objSiblings[i].getRendered(objGUI);
          if (objGUITemp != null) {
            objGUITemp.style.backgroundImage = "";
            objGUITemp.childNodes[3].style.backgroundColor = "";
            if (objSiblings[i].getEvent(Interactive.MENU) != null) objGUITemp.childNodes[2].style.backgroundImage = "url(" + ToolbarButton.IMAGEOFFMENU + ")";
          }
        } else if (objSiblings[i] == this) {
          //turn this button on
          if (objGUI != null) {
            objGUI.style.backgroundImage = "url(" + ToolbarButton.IMAGEON + ")";
            objGUI.childNodes[3].style.backgroundColor = ToolbarButton.BORDERCOLOR;
            if (this.getEvent(Interactive.MENU) != null) objGUI.childNodes[2].style.backgroundImage = "url(" + ToolbarButton.IMAGEONMENU + ")";
          }
        }
      }

      bChanged = true;
    } else if (this.getType() == ToolbarButton.TYPERADIO) {
      //turn it off -- but no way to turn a sibling on,
      if (objGUI != null) {
        objGUI.style.backgroundImage = "";
        objGUI.childNodes[3].style.backgroundColor = "";
        if (this.getEvent(Interactive.MENU) != null) objGUI.childNodes[2].style.backgroundImage = "url(" + ToolbarButton.IMAGEOFFMENU + ")";
      }

      bChanged = true;
    } else if (this.getType() == ToolbarButton.TYPECHECK) {
      //toggle state for this button
      if (objGUI != null) {
        if (STATE == ToolbarButton.STATEON) {
          objGUI.style.backgroundImage = "url(" + ToolbarButton.IMAGEON + ")";
          objGUI.childNodes[3].style.backgroundColor = ToolbarButton.BORDERCOLOR;
          if (this.getEvent(Interactive.MENU) != null) objGUI.childNodes[2].style.backgroundImage = "url(" + ToolbarButton.IMAGEONMENU + ")";
        } else {
          objGUI.style.backgroundImage = "";
          objGUI.childNodes[3].style.backgroundColor = "";
          if (this.getEvent(Interactive.MENU) != null) objGUI.childNodes[2].style.backgroundImage = "url(" + ToolbarButton.IMAGEOFFMENU + ")";
        }
      }

      bChanged = true;
    }
    this.jsxstate = STATE;

    if (bChanged && objEvent) {
      var context = null;
      if (objEvent instanceof Event)
        context = {objEVENT:objEvent, _gipp:1};
      this.doEvent(Interactive.CHANGE, context);
    }

    return this;
  };

  /**
   * @package no need to document
   */
  ToolbarButton_prototype.setEnabled = function(ENABLED, bRepaint) {
    if (this._jsxhotkey != null)
      this._jsxhotkey.setEnabled(ENABLED == Form.STATEENABLED);
    return this.jsxsupermix(ENABLED, bRepaint);
  };

  ToolbarButton.BRIDGE_EVENTS = {};
  ToolbarButton.BRIDGE_EVENTS[Event.CLICK] = "_doClick";
  ToolbarButton.BRIDGE_EVENTS[Event.KEYDOWN] = true;
  ToolbarButton.BRIDGE_EVENTS[Event.MOUSEDOWN] = true;
  ToolbarButton.BRIDGE_EVENTS[Event.MOUSEUP] = true;
  ToolbarButton.BRIDGE_EVENTS[Event.MOUSEOUT] = true;
  ToolbarButton.BRIDGE_EVENTS[Event.MOUSEOVER] = true;
  ToolbarButton.BRIDGE_EVENTS[Event.BLUR] = "_ebMouseOut";
  ToolbarButton.BRIDGE_EVENTS[Event.FOCUS] = "_ebMouseOver";

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  ToolbarButton_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 3);
  };


  /**
   * Creates the box model/profile for the object
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance.
   * @private
   */
  ToolbarButton_prototype.createBoxProfile = function() {
    //determine relative position (this will affect left, top, and boxtype properties)
    var bRelative = this.getRelativePosition() != 0;
    var mar, myLeft, myTop;

    //create outer box
    var o = {};
    o.height = 22;
    if(bRelative) {
      o.margin = ((mar = this.getMargin()) != null && mar != "") ? mar : "1 4 1 0";
      o.tagname = "span";
      o.boxtype =  "relativebox";
    } else {
      o.left = ((myLeft = this.getLeft()) != null && myLeft != "") ? myLeft : 0;
      o.top = ((myTop = this.getTop()) != null && myTop != "") ? myTop : 0;
      o.tagname = "div";
      o.boxtype = "box";
    }

    if (this.getDivider() == 1) {
      o.padding = "0 0 0 4";
      o.border = "0px;0px;0px;solid 1px " + ToolbarButton.BORDERCOLOR;
    }

    var b1 = new jsx3.gui.Painted.Box(o);

    //create the image box
    o = {};
    o.width = (this.getImage() != null && this.getImage() != "") ? 22 : 3;
    o.height = 22;
    o.tagname = "span";
    o.boxtype = "relativebox";
    var b1a = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1a);

    //create the label box
    o = {};
    if (jsx3.util.strEmpty(this.getText())) {
      //collapse the box if no content
      o.width = 1;
    } else {
      //only pad if no text
      o.padding = "5 4 5 0";
    }
    o.height = 22;
    o.tagname = "span";
    o.boxtype = "relativebox";
    var b1b = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1b);

    //paint the arrow box (essentially an empty span--actually implemented in the menu subclass)
    o = {};
    o.width = 1;
    o.height = 22;
    o.tagname = "span";
    o.boxtype = "relativebox";
    var b1c = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1c);

    //create the endcap box that will display the right-border when the TBB is active
    o = {};
    o.width = 1;
    o.height = 22;
    o.tagname = "span";
    o.boxtype = "relativebox";
    var b1d = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1d);

    return b1;
  };

  /**
   * Returns this toolbar button serialized to HTML.
   * @return {String}
   */
  ToolbarButton_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //register any accelerator bindings
    var myKeyBinding;
    if ((myKeyBinding = this.getKeyBinding()) != null) {
      var me = this;
      if (this._jsxhotkey != null)
        this._jsxhotkey.destroy();
      this._jsxhotkey = this.doKeyBinding(function(e){ me._doClick(e, me.getRendered()); }, myKeyBinding);
      if (this._jsxhotkey) this._jsxhotkey.setEnabled(this.getEnabled() != Form.STATEDISABLED);
    }

    var strBGImage = (this.getState() == ToolbarButton.STATEON) ? "background-image:url(" + ToolbarButton.IMAGEON + ");" : "";
    var strVisibility = this.paintVisibility();
    var strDisplay = this.paintDisplay();

    //render the relevant events (add other interfaces later for user-defined events)
    var strEvents = null, strImage = null, strFilter = null;
    if (this.getEnabled() == Form.STATEENABLED) {
      //get the list of all events that the system (this class) needs to handle to process events appropriately
      strEvents = this.renderHandlers(ToolbarButton.BRIDGE_EVENTS, 0);
      strImage = this.getUriResolver().resolveURI(this.getImage());
      strFilter = "";
    } else {
      strEvents = "";
      strImage = this.getUriResolver().resolveURI(this.getDisabledImage());
      strFilter = jsx3.html.getCSSOpacity(.4);
    }

    //render custom attributes
    var strAttributes = this.renderAttributes(null, true);

    //paint the outer-most box
    var b1 = this.getBoxProfile(true);
    b1.setAttributes("id='" + this.getId() + "' " + this.paintIndex() + this.paintTip() + this.paintLabel() + strEvents + " class='jsx30toolbarbutton'" + strAttributes);
    b1.setStyles(this.paintCursor(true) + strBGImage + strVisibility + strDisplay + this.paintZIndex() + this.paintCSSOverride());

    //paint the image/icon box
    var b1a = b1.getChildProfile(0);
    b1a.setStyles(((strImage != null) ? "background-image:url(" + strImage + ");" + strFilter : ""));
    b1a.setAttributes("class='jsx30toolbarbutton_img'" + jsx3.html._UNSEL);

    //paint the label/caption box
    var b1b = b1.getChildProfile(1);
    b1b.setAttributes("class='jsx30toolbarbutton_lbl'" + jsx3.html._UNSEL);
    var myLabel;
    if((myLabel = this.getText()) != null && myLabel != "") {
      b1b.setStyles(this.paintColor() + this.paintFontName() + this.paintFontSize() + this.paintFontWeight());
    } else {
      //at least one of the child boxes within the outer box must have text content, otherwise will cause unknown layout issues. put a space in the label box if no text
      myLabel = "&#160;";
      b1b.setStyles(jsx3.html._CLPSE);
    }

    //paint the arrow box (just a placeholder on a tbb; acutally implemented in menus as a down arrow image)
    var b1c = b1.getChildProfile(2);
    b1c.setAttributes("class='jsx30toolbarbutton_cap'");

    //paint the endcap box (appears as a right border when the tbb is active)
    var b1d = b1.getChildProfile(3);
    b1d.setAttributes("class='jsx30toolbarbutton_cap'");
    b1d.setStyles("overflow:hidden;" + ((this.getState() == ToolbarButton.STATEON) ? "background-color:" + ToolbarButton.BORDERCOLOR + ";" : ""));

    //return final string of HTML
    return b1.paint().join(b1a.paint().join("&#160;") + b1b.paint().join(myLabel) + b1c.paint().join("&#160;") + b1d.paint().join("&#160;"));
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  ToolbarButton.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

  ToolbarButton_prototype.emGetType = function() {
    return jsx3.gui.Matrix.EditMask.FORMAT;
  };

  ToolbarButton_prototype.emInit = function(objColumn) {
    this.jsxsupermix(objColumn);
    if (this.getType() == ToolbarButton.TYPERADIO)
      this.setType(ToolbarButton.TYPENORMAL);

    this.subscribe(Interactive.EXECUTE, this, "_emOnExecute");
  };

  ToolbarButton_prototype.emSetValue = function(strValue) {
  };

  ToolbarButton_prototype.emGetValue = function() {
    return null;
  };

  ToolbarButton_prototype.emBeginEdit = function(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD) {
    var toFocus = objTD.childNodes[0].childNodes[0];
    if (toFocus) {
      this.jsxsupermix(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD);
      jsx3.html.focus(toFocus);
    } else {
      return false;
    }
  };

  ToolbarButton_prototype.emPaintTemplate = function() {
    this.setEnabled(Form.STATEDISABLED);
    var disabled = this.paint();
    this.setEnabled(Form.STATEENABLED);
    var enabled = this.paint();
    return this.emGetTemplate(enabled, disabled);
  };

  /** @private @jsxobf-clobber */
  ToolbarButton_prototype._emOnExecute = function(objEvent) {
    var es = this.emGetSession();
    if (es) {
//      jsx3.log("execute for record id " + es.recordId);
    }
  };
  
  ToolbarButton_prototype.onDestroy = function(objParent) {
    if (this._jsxhotkey) 
      this._jsxhotkey.destroy();
    this.jsxsuper(objParent);
  };

  ToolbarButton_prototype.onSetChild = function(objChild) {
    return false;
  };

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.ToolbarButton
 * @see jsx3.gui.ToolbarButton
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.ToolbarButton", -, null, function(){});
 */
jsx3.ToolbarButton = jsx3.gui.ToolbarButton;

/* @JSC :: end */
