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
jsx3.Class.defineClass("jsx3.gui.NativeFileUpload", jsx3.gui.Block, [jsx3.gui.Form], function(NativeFileUpload, NativeFileUpload_prototype) {

  NativeFileUpload.DEFAULTCLASSNAME = "jsx3nativefile";

  var Event = jsx3.gui.Event;
  var Form = jsx3.gui.Form;
  var Interactive = jsx3.gui.Interactive;

  /**
   * Returns <code>STATEVALID</code>.
   *
   * @return {int} <code>jsx3.gui.Form.STATEVALID</code>.
   */
  NativeFileUpload_prototype.doValidate = function() {
    this.setValidationState(Form.STATEVALID);
    return this.getValidationState();
  };

  NativeFileUpload_prototype.paintBackgroundColor = function() {
    var bgc = this.getEnabled() != Form.STATEDISABLED ?
              this.getBackgroundColor() :
              this.getDisabledBackgroundColor() || Form.DEFAULTDISABLEDBACKGROUNDCOLOR;
    return bgc ? "background-color:" + bgc + ";" : "";
  };

  NativeFileUpload_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 3);
  };

  NativeFileUpload_prototype.createBoxProfile = function(objImplicit) {
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

  NativeFileUpload_prototype.paint = function() {
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
    b1.setAttributes(' type="file" id="' + strId + '"' + this.paintName() + this.paintEnabled() +
        this.paintIndex() + this.paintTip() + strImplementedEvents + ' class="' +
        this.paintClassName() + '" ' + strProps);
    b1.setStyles(styles);

    return b1.paint().join("");
  };

  NativeFileUpload_prototype._ebClick = function(objEvent, objGUI) {
    this.doEvent(Interactive.EXECUTE, {objEVENT:objEvent});
  };

  NativeFileUpload_prototype.paintClassName = function() {
    var cn = this.getClassName();
    return NativeFileUpload.DEFAULTCLASSNAME + (cn ? " " + cn : "");
  };

  /**
   * Returns the value of the rendered file upload field.
   */
  NativeFileUpload_prototype.getValue = function() {
    var objGUI = this.getRendered();
    return objGUI ? objGUI.value : null;
  };

  /**
   * No-op. 
   * @param strValue
   */
  NativeFileUpload_prototype.setValue = function(strValue) {
    // no-op security
  };

  NativeFileUpload_prototype.onSetChild = function(objChild) {
    return false;
  };

});
