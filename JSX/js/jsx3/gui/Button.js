/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Form", "jsx3.gui.Block");

/**
 * Provides a object-oriented interface for a standard command button.
 * <p/>
 * This class publishes the following model events:
 * <ul>
 * <li><code>EXECUTE</code> &#8211; when the user clicks on the enabled button, when the button has focus and the user presses the
 *    space or enter key, or when <code>doExecute()</code> is called on the button.</li>
 * <li><code>MENU</code> &#8211; on a mouseup event with the right button when the button has a bound context menu.</li>
 * </ul>
 */
jsx3.Class.defineClass("jsx3.gui.Button", jsx3.gui.Block, [jsx3.gui.Form], function(Button, Button_prototype) {

  var Event = jsx3.gui.Event;
  var Form = jsx3.gui.Form;

  /**
   * {String} #e8e8f5
   */
  Button.DEFAULTBACKGROUNDCOLOR = "#e8e8f5";
  /**
   * {String} #f6f6ff
   */
  Button.DEFAULTHIGHLIGHT = "#f6f6ff";
  /**
   * {String} #a6a6af
   */
  Button.DEFAULTSHADOW = "#a6a6af";
  /**
   * {int} 18
   */
  Button.DEFAULTHEIGHT = 17;

  /** {jsx3.gui.HotKey} @private @jsxobf-clobber */
  Button_prototype._jsxhotkey = null;

  /**
   * {String} jsx30button
   */
  Button.DEFAULTCLASSNAME = "jsx30button";

  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param intLeft {int} left position (in pixels) of the object relative to its parent container; not required if button is one of: jsx3.gui.Button.SYSTEMOPEN, jsx3.gui.Button.DIALOGCLOSE, jsx3.gui.Button.DIALOGALPHA, jsx3.gui.Button.DIALOGSHADE
   * @param intTop {int} top position (in pixels) of the object relative to its parent container; not required if button is one of: jsx3.gui.Button.SYSTEMOPEN, jsx3.gui.Button.DIALOGCLOSE, jsx3.gui.Button.DIALOGALPHA, jsx3.gui.Button.DIALOGSHADE
   * @param intWidth {int} width (in pixels) of the object; not required if button is one of: jsx3.gui.Button.SYSTEMOPEN, jsx3.gui.Button.DIALOGCLOSE, jsx3.gui.Button.DIALOGALPHA, jsx3.gui.Button.DIALOGSHADE
   * @param strText {String} text to display in the given button; if null JSXTABLEHEADERCELL.DEFAULTTEXT is used
   */
  Button_prototype.init = function(strName,intLeft,intTop,intWidth,strText) {
    //call constructor for super class
    this.jsxsuper(strName,intLeft,intTop,intWidth);

    //update properties unique to the jsx3.gui.Button class
    this.setText(strText);
  };

  /**
   * Sets the validation state for the button and returns the validation state; always returns jsx3.gui.Form.STATEVALID (as buttons can only be valid)
   * @return {int} jsx3.gui.Form.STATEVALID
   */
  Button_prototype.doValidate = function() {
    return this.setValidationState(jsx3.gui.Form.STATEVALID).getValidationState();
  };

  /**
   * called when user presses a key while button has focus; by default if either the spacebar or return key are pressed, the button's click event will be triggered
   * @private
   */
  Button_prototype._ebKeyDown = function(objEvent, objGUI) {
    if (objEvent.spaceKey() || objEvent.enterKey()) {
      this._doClick(objEvent, objGUI);
      objEvent.cancelAll();
    }
  };

/* @JSC :: begin DEP */

  /**
   * call to fire the execute event for the button; fires any bound 'jsxexecute' event (jsx3.gui.Interactive.EXECUTE)
   * @deprecated  use <code>doExecute()</code> instead
   * @see #doExecute()
   */
  Button_prototype.doClick = function() {
    var objEvent = Event.getCurrent();
    this._doClick(objEvent);
  };

/* @JSC :: end */

  Button_prototype.focus = function() {
    //give focus to persistent on-screen anchor
    var objGUI = this.getRendered();
    if (objGUI) {
      objGUI = objGUI.childNodes[0];
      jsx3.html.focus(objGUI);
      return objGUI;
    }
  };

  /**
   * Invokes the <code>EXECUTE</code> model event of this button. Note that because the model event is invoked
   * programmatically rather than by user interaction the <code>objEVENT</code> event parameter will be
   * <code>null</code> if the <b>objEvent</b> parameter is undefined.
   * @param objEvent {jsx3.gui.Event} the browser event that caused the execution of this button. This argument is
   *    optional and should only be provided if the execute of this button is the result of a browser event. This
   *    parameter will be passed along to the model event as <code>objEVENT</code>.
   */
  Button_prototype.doExecute = function(objEvent) {
    this._doClick(objEvent);
  };

  /** @private @jsxobf-clobber */
  Button_prototype._doClick = function(objEvent, objGUI) {
    if (objEvent == null || objEvent.leftButton() || !objEvent.isMouseEvent())
      this.doEvent(jsx3.gui.Interactive.EXECUTE, {objEVENT:objEvent});
  };

  /**
   * when jsx3.gui.Buttons are first instanced, a mousedown event is bound to the button that facilitates mouse capture, allowing the button (which is essentially an HTML DIV) to behave like a windows system button.
   * @private
   */
  Button_prototype._ebMouseDown = function(objEvent, objGUI) {
    if (! objEvent.leftButton()) return;

    if (! this.getBorder()) {
      objGUI.style.border = 'solid 1px ' + Button.DEFAULTSHADOW;
      objGUI.style.borderRightColor = Button.DEFAULTHIGHLIGHT;
      objGUI.style.borderBottomColor = Button.DEFAULTHIGHLIGHT;
    }

    jsx3.html.focus(objGUI.childNodes[0]);
  };

  /**
   * when jsx3.gui.Buttons are first instanced, a mouseup event is bound to the button that releases mouse capture that was set on mouse down, allowing the button (which is essentially an HTML DIV) to behave like a windows system button.
   * @private
   */
  Button_prototype._ebMouseUp = function(objEvent, objGUI) {
    if (objEvent.leftButton()) {
//      objEvent.releaseCapture(objGUI);

      if (! this.getBorder()) {
        objGUI.style.border = 'solid 1px ' + Button.DEFAULTHIGHLIGHT;
        objGUI.style.borderRightColor = Button.DEFAULTSHADOW;
        objGUI.style.borderBottomColor = Button.DEFAULTSHADOW;
      }
    }
    this.jsxsupermix(objEvent, objGUI);
  };

  Button_prototype._ebMouseOut = function(objEvent, objGUI) {
    if (! this.getBorder()) {
      objGUI.style.border = 'solid 1px ' + Button.DEFAULTHIGHLIGHT;
      objGUI.style.borderRightColor = Button.DEFAULTSHADOW;
      objGUI.style.borderBottomColor = Button.DEFAULTSHADOW;
    }
  };

  /**
   * Because it implements the jsx3.gui.Form class, the jsx3.gui.Button class implements various form-related methods (validate, getValue, disable, etc); in the case of 'getValue', this method will return the button's text (caption)
   * @return {String}
   */
  Button_prototype.getValue = function() {
    return this.getText();
  };

  Button_prototype.setEnabled = function(intEnabled, bRepaint) {
    if (this._jsxhotkey != null)
      this._jsxhotkey.setEnabled(intEnabled == Form.STATEENABLED);
    return this.jsxsupermix(intEnabled, bRepaint);
  };

  Button.BRIDGE_EVENTS = {};
  Button.BRIDGE_EVENTS[Event.CLICK] = "_doClick";
  Button.BRIDGE_EVENTS[Event.KEYDOWN] = true;
  Button.BRIDGE_EVENTS[Event.MOUSEDOWN] = true;
  Button.BRIDGE_EVENTS[Event.MOUSEUP] = true;
  Button.BRIDGE_EVENTS[Event.MOUSEOUT] = true;

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  Button_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    // get the existing box profile
    var b1 = this.getBoxProfile(true, objImplicit);

    if (objGUI) {
      // recalculate the box
      var recalcRst = b1.recalculate(objImplicit, objGUI, objQueue);
      if (recalcRst.w || recalcRst.h) {
        var b1a = b1.getChildProfile(0);
        b1a.recalculate({parentwidth:b1.getClientWidth(), parentheight:b1.getClientHeight()}, objGUI.childNodes[0], objQueue);
      }
    }
  };

  /**
   * Creates the box model/profile for the object
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @private
   */
  Button_prototype.createBoxProfile = function(objImplicit) {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if(this.getParent() && (objImplicit == null || ((isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if(objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    var bRelative = this.getRelativePosition() != 0;
    if (!objImplicit.boxtype) objImplicit.boxtype = (bRelative) ? "relativebox" : "box";

    //create the outer box
    objImplicit.tagname = "span";
    if(objImplicit.width == null && !jsx3.util.strEmpty(this.getWidth()))
      objImplicit.width = this.getWidth();
    objImplicit.height = (this.getHeight() == null) ? Button.DEFAULTHEIGHT : this.getHeight();
    if(bRelative) {
      if(!jsx3.util.strEmpty(this.getMargin()))
        objImplicit.margin = this.getMargin();
    } else {
      objImplicit.left = !jsx3.util.strEmpty(this.getLeft()) ? this.getLeft() : 0;
      objImplicit.top = !jsx3.util.strEmpty(this.getTop()) ? this.getTop() : 0;
    }
    objImplicit.padding = (!jsx3.util.strEmpty(this.getPadding())) ? this.getPadding() : "2";
    objImplicit.border = this.getBorder() || "solid 1px " + Button.DEFAULTHIGHLIGHT + ";solid 1px " + Button.DEFAULTSHADOW +
        ";solid 1px " + Button.DEFAULTSHADOW + ";solid 1px " + Button.DEFAULTHIGHLIGHT;
    var b1 = new jsx3.gui.Painted.Box(objImplicit);


    //create the label box
    var o = {};
    o.parentwidth = b1.getClientWidth();
    o.parentheight = b1.getClientHeight();
    o.height = "100%";
    if(objImplicit.width) {
      //buttons that use a fixed width need an inline div in order for the button's text to center
      o.width = "100%";
      o.tagname = "div";
      o.boxtype = "inline";
    } else {
      //buttons that dynamically grow, should use a standard relativebox
      o.tagname = "span";
      o.boxtype = "relativebox";
    }
    var b1b = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1b);

    return b1;
  };

  /**
   * Returns the DHTML, used for this object's on-screen view.
   * @return {String} DHTML
   */
  Button_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //register any accelerator bindings
    var myKeyBinding;
    if((myKeyBinding = this.getKeyBinding()) != null) {
      var me = this;
      if (this._jsxhotkey != null) this._jsxhotkey.destroy();
      this._jsxhotkey = this.doKeyBinding(function(e){ me._doClick(e); }, myKeyBinding);
      if (this._jsxhotkey) this._jsxhotkey.setEnabled(this.getEnabled() != jsx3.gui.Form.STATEDISABLED);
    }

    //render the relevant events and attributes
    var strEvents = this.renderHandlers(this.getEnabled() == jsx3.gui.Form.STATEENABLED ? Button.BRIDGE_EVENTS : null, 0);
    var strAttributes = this.renderAttributes(null, true);

    //render the outer box
    var b1 = this.getBoxProfile(true);
    b1.setAttributes('id="' + this.getId() + '"' + this.paintLabel() + this.paintTip() + strEvents + ' class="' + this.paintClassName() + '"' /*+ jsx3.html._UNSEL*/ + strAttributes);
    b1.setStyles(this.paintVisibility() + this.paintDisplay() + this.paintCursor(true) + this.paintFontSize() + this.paintFontName() + this.paintFontWeight() + this.paintColor() + this.paintBackgroundColor() + this.paintZIndex() + this.paintTextAlign() + this.paintCSSOverride());

    //render the label box
    var b1a = b1.getChildProfile(0);
    b1a.setAttributes(this.paintIndex() + ' class="jsx30button_text"' /*+ jsx3.html._UNSEL*/);
    b1a.setStyles(this.paintTextAlign() + this.paintOverflow());

    //return final string of HTML
    return b1.paint().join(b1a.paint().join(this.paintText()) + this.paintChildren());
  };

  Button_prototype.setRelativePosition = function(intRelative, bUpdateView) {
    if (this.jsxrelativeposition != intRelative) {
      this.jsxrelativeposition = intRelative;
      this.setBoxDirty();
      if (bUpdateView)
        this.repaint();
    }
    return this;
  };

  Button_prototype.setWidth = function(vntWidth, bUpdateView) {
    //update the model
    this.jsxwidth = vntWidth;
    //destroy the box abstraction
    this.setBoxDirty();
    //update the view
    if(bUpdateView)
      this.repaint();
    return this;
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   * @jsxobf-clobber
   */
  Button_prototype.paintBackgroundColor = function() {
    var bgc = this.getEnabled() != Form.STATEDISABLED ?
              this.getBackgroundColor() || Button.DEFAULTBACKGROUNDCOLOR :
              this.getDisabledBackgroundColor() || Form.DEFAULTDISABLEDBACKGROUNDCOLOR;
    return "background-color:" + bgc + ";";
  };

  /**
   * Paints the default control class and any user specified string of css class name(s)
   * @return {String}
   * @private
   */
  Button_prototype.paintClassName = function() {
    var cn = this.getClassName();
    return Button.DEFAULTCLASSNAME + (cn ? " " + cn : "");
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Button.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

  Button_prototype.emGetType = function() {
    return jsx3.gui.Matrix.EditMask.FORMAT;
  };

  Button_prototype.emInit = function(objColumn) {
    this.jsxsupermix(objColumn);
    this.subscribe(jsx3.gui.Interactive.EXECUTE, this, "_emOnExecute");
  };

  Button_prototype.emSetValue = function(strValue) {
  };

  Button_prototype.emGetValue = function() {
    return null;
  };

  Button_prototype.emBeginEdit = function(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD) {
    var toFocus = jsx3.html.selectSingleElm(objTD, 0, 0, 0);
    if (toFocus) {
      this.jsxsupermix(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD);
      jsx3.html.focus(toFocus);
    } else {
      return false;
    }
  };

  Button_prototype.emPaintTemplate = function() {
    this.setEnabled(Form.STATEDISABLED);
    var disabled = this.paint();
    this.setEnabled(Form.STATEENABLED);
    var enabled = this.paint();
    return this.emGetTemplate(enabled, disabled);
  };

  /** @private @jsxobf-clobber */
  Button_prototype._emOnExecute = function(objEvent) {
    var es = this.emGetSession();
    if (es) {
//      jsx3.log("execute for record id " + es.recordId);
    }
  };
  
  Button_prototype.onDestroy = function(objParent) {
    if (this._jsxhotkey) 
      this._jsxhotkey.destroy();
    this.jsxsuper(objParent);
  };

  Button_prototype.onSetChild = function(objChild) {
    return false;
  };
  
});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.Button
 * @see jsx3.gui.Button
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Button", -, null, function(){});
 */
jsx3.Button = jsx3.gui.Button;

/* @JSC :: end */
