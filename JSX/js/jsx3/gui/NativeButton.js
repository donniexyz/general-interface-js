/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Form", "jsx3.gui.Block");

/**
 * The JSX version of a standard HTML input button.
 *
 * @since 3.9
 */
jsx3.Class.defineClass("jsx3.gui.NativeButton", jsx3.gui.Block, [jsx3.gui.Form], function(NativeButton, NativeButton_prototype) {

  NativeButton.DEFAULTCLASSNAME = "jsx3nativebtn";

  var Event = jsx3.gui.Event;
  var Form = jsx3.gui.Form;
  var Interactive = jsx3.gui.Interactive;

  /**
   * {int} Value of the type field indicating a normal button.
   * @final @jsxobf-final
   */
  NativeButton.BUTTON = 0;

  /**
   * {int} Value of the type field indicating a submit button.
   * @final @jsxobf-final
   */
  NativeButton.SUBMIT = 1;

  /**
   * {int} Value of the type field indicating a reset button.
   * @final @jsxobf-final
   */
  NativeButton.RESET = 2;

  /**
   * Returns the type of this button.
   * @return {int} <code>BUTTON</code>, <code>SUBMIT</code> or <code>RESET</code>.
   */
  NativeButton_prototype.getType = function() {
    return this.jsxtype;
  };

  /**
   * Sets the type of this button.
   * @param intType {int} <code>BUTTON</code>, <code>SUBMIT</code> or <code>RESET</code>.
   */
  NativeButton_prototype.setType = function(intType) {
    this.jsxtype = intType;
  };

  /** @private @jsxobf-clobber */
  NativeButton_prototype._getInputType = function() {
    switch (this.getType()) {
      case NativeButton.SUBMIT: return "submit";
      case NativeButton.RESET: return "reset";
      default: return "button";
    }
  };

  /**
   * Returns <code>STATEVALID</code>.
   *
   * @return {int} <code>jsx3.gui.Form.STATEVALID</code>.
   */
  NativeButton_prototype.doValidate = function() {
    this.setValidationState(Form.STATEVALID);
    return this.getValidationState();
  };

  NativeButton_prototype.paintBackgroundColor = function() {
    var bgc = this.getEnabled() != Form.STATEDISABLED ?
              this.getBackgroundColor() :
              this.getDisabledBackgroundColor() || Form.DEFAULTDISABLEDBACKGROUNDCOLOR;
    return bgc ? "background-color:" + bgc + ";" : "";
  };

  NativeButton_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 3);
  };

  NativeButton_prototype.createBoxProfile = function(objImplicit) {
    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if(this.getParent() && (objImplicit == null || ((isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if(objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //create outer box
    var bRelative = this.getRelativePosition() != 0;
    var pad, mar, bor;

    var intTop = (!bRelative && !jsx3.util.strEmpty(this.getTop())) ? this.getTop() : 0;
    var intLeft = (!bRelative && !jsx3.util.strEmpty(this.getLeft())) ? this.getLeft() : 0;
    if(objImplicit.left == null) objImplicit.left = intLeft;
    if(objImplicit.top == null) objImplicit.top = intTop;
    if(objImplicit.width == null) objImplicit.width = this.getWidth();
    if(objImplicit.height == null) objImplicit.height = this.getHeight();
    objImplicit.tagname = "input";

    if (!objImplicit.boxtype) objImplicit.boxtype = bRelative ? "inline" : "box";

    //add margin,border, and padding properties
    pad = this.getPadding();
    mar = this.getMargin();
    bor = this.getBorder();
    if (pad != null && pad != "")
      objImplicit.padding = pad;
    //textareas don't use a default left/right margin as textbox would as textboxes are inline elements
    if (bRelative && (mar = this.getMargin()) != null && mar != "")
      objImplicit.margin = mar;
    if (bor != null && bor != "")
      objImplicit.border = bor;

    return new jsx3.gui.Painted.Box(objImplicit);
  };

  NativeButton_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //initialize variables
    var strId = this.getId();

    var eventMap = {};
    eventMap[Event.CLICK] = true;
    if (this.hasEvent(Interactive.JSXBLUR))
      eventMap[Event.BLUR] = true;
    if (this.hasEvent(Interactive.JSXFOCUS))
      eventMap[Event.FOCUS] = true;

    //render custom atts
    var strImplementedEvents = this.renderHandlers(eventMap, 0);
    var strProps = this.renderAttributes(null, true);

    var styles = this.paintFontName() + this.paintFontSize() + this.paintFontWeight() + this.paintVisibility() +
                   this.paintDisplay() + this.paintZIndex() + this.paintBackgroundColor() + this.paintBackground() +
                   this.paintColor() + this.paintTextAlign() + this.paintCSSOverride() + this.paintCursor();

    //generate and return final HTML
    var b1 = this.getBoxProfile(true);
    b1.setAttributes(' type="' + this._getInputType() + '" id="' + strId + '"' + this.paintName() + this.paintEnabled() +
        this.paintIndex() + this.paintValue() + this.paintTip() + strImplementedEvents + ' class="' +
        this.paintClassName() + '" ' + strProps);
    b1.setStyles(styles);

    return b1.paint().join("");
  };

  NativeButton_prototype._ebClick = function(objEvent, objGUI) {
    this.doEvent(Interactive.EXECUTE, {objEVENT:objEvent});
  };

  NativeButton_prototype.paintClassName = function() {
    var cn = this.getClassName();
    return NativeButton.DEFAULTCLASSNAME + (cn ? " " + cn : "");
  };

  NativeButton_prototype.paintValue = function() {
    var v = this.getValue();
    return v != null ? ' value="' + jsx3.util.strEscapeHTML(v) + '"' : '';
  };

  NativeButton_prototype.setValue = function(strValue) {
    this.jsxvalue = strValue;

    var objGUI = this.getRendered();
    if (objGUI != null)
      objGUI.value = strValue;
    return this;
  };

  NativeButton_prototype.emGetType = function() {
    return jsx3.gui.Matrix.EditMask.FORMAT;
  };

  NativeButton_prototype.emInit = function(objColumn) {
    this.jsxsupermix(objColumn);
    this.subscribe(Interactive.EXECUTE, this, "_emOnExecute");
  };

  NativeButton_prototype.emSetValue = function(strValue) {
  };

  NativeButton_prototype.emGetValue = function() {
    return null;
  };

  NativeButton_prototype.emBeginEdit = function(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD) {
    var toFocus = jsx3.html.selectSingleElm(objTD, 0, 0, 0);
    if (toFocus) {
      this.jsxsupermix(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD);
      jsx3.html.focus(toFocus);
    } else {
      return false;
    }
  };

  NativeButton_prototype.emPaintTemplate = function() {
    this.setEnabled(Form.STATEDISABLED);
    var disabled = this.paint();
    this.setEnabled(Form.STATEENABLED);
    var enabled = this.paint();
    return this.emGetTemplate(enabled, disabled);
  };

  /** @private @jsxobf-clobber */
  NativeButton_prototype._emOnExecute = function(objEvent) {
  };

  NativeButton_prototype.onSetChild = function(objChild) {
    return false;
  };
  
});
