/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Form", "jsx3.gui.Block");

/**
 * This class is a wrapper of the standard HTML checkbox.
 * <p/>
 * This class publishes the following model events:
 * <ul>
 * <li><code>TOGGLE</code> &#8211; when the state of a checkbox changes through user interaction or when
 *    <code>setState()</code> is called under the deprecated 3.0 model event protocol.</li>
 * <li><code>MENU</code> &#8211; on a mouseup event with the right button when the button has a bound context menu.</li>
 * </ul>
 */
jsx3.Class.defineClass("jsx3.gui.CheckBox", jsx3.gui.Block, [jsx3.gui.Form], function(CheckBox, CheckBox_prototype) {

  /**
   * {int} 0: unchecked (default)
   * @final @jsxobf-final
   */
  CheckBox.UNCHECKED = 0;

  /**
   * {int} 1: checked
   * @final @jsxobf-final
   */
  CheckBox.CHECKED = 1;

  /**
   * {int} 2: dashed
   * @final @jsxobf-final
   */
  CheckBox.PARTIAL = 2;

  /**
   * {String} jsx30checkbox
   */
  CheckBox.DEFAULTCLASSNAME = "jsx30checkbox";

  CheckBox_prototype.jsxdefaultchecked = CheckBox.UNCHECKED;

  var regFalse = /^false|0|null$/i;

  /**
   * The instance initializer.
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param vntLeft {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntTop {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntWidth {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntHeight {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param strText {String} text/HTML markup to display with the checkbox;
   * @param CHECKED {int} if jsx3.gui.CheckBox.CHECKED or null, checkbox is checked; if jsx3.gui.CheckBox.UNCHECKED checkbox is unchecked
   */
  CheckBox_prototype.init = function(strName,vntLeft,vntTop,vntWidth,vntHeight,strText,CHECKED) {
    //call constructor for super class
    this.jsxsuper(strName,vntLeft,vntTop,vntWidth,vntHeight,strText);

    //set checked and defaultchecked properties (default values are always set while actual values can be implied as checked via a null state (null = true and true = true)
    this.setDefaultChecked((CHECKED == null) ? CheckBox.CHECKED : CHECKED);

    this.jsxchecked = CHECKED;
  };

  /**
   * Returns state of checkbox when it was first initialized; to get the current state, use: getChecked();
   * @return {int} one of: jsx3.gui.CheckBox.CHECKED or jsx3.gui.CheckBox.UNCHECKED
   */
  CheckBox_prototype.getDefaultChecked = function() {
    return this.jsxdefaultchecked;
  };

  /**
   * Sets state of checkbox when it is first initialized; returns reference to self
   * @param CHECKED {int} one of: jsx3.gui.CheckBox.CHECKED or jsx3.gui.CheckBox.UNCHECKED
   * @return {jsx3.gui.CheckBox} this object
   */
  CheckBox_prototype.setDefaultChecked = function(CHECKED) {
    //default to true for Checked state
    this.jsxdefaultchecked = CHECKED;
    return this;
  };

  /**
   * Returns current state of checkbox; to get the state of the checkbox when it was first initialized, use: getDefaultChecked(). Default: jsx3.gui.CheckBox.CHECKED
   * @return {int} one of: jsx3.gui.CheckBox.CHECKED or jsx3.gui.CheckBox.UNCHECKED
   */
  CheckBox_prototype.getChecked = function() {
    //default to true for Checked state
    return (this.jsxchecked != null) ? this.jsxchecked : this.getDefaultChecked();
  };

  /**
   * Sets the state of this checkbox. This method will execute the <code>TOGGLE</code> model event only under the
   * deprecated 3.0 model event protocol.
   * @param intChecked {int} <code>CHECKED</code> or <code>UNCHECKED</code>
   * @return {jsx3.gui.CheckBox} this object
   * @see #CHECKED
   * @see #UNCHECKED
   */
  CheckBox_prototype.setChecked = function(intChecked) {
    if (this.jsxchecked != intChecked) {
      //called only by on-screen GUI element
      this.jsxchecked = intChecked;
      this._updateView();

/* @JSC :: begin DEP */ 
      if (this.isOldEventProtocol())
        this.doEvent(jsx3.gui.Interactive.TOGGLE, {intCHECKED:intChecked});
/* @JSC :: end */
    }

    return this;
  };

  /**
   * Returns current state of checkbox; to get the state of the checkbox when it was first initialized, use: getDefaultChecked(). Default: jsx3.gui.CheckBox.CHECKED
   * @return {int} one of: jsx3.gui.CheckBox.CHECKED or jsx3.gui.CheckBox.UNCHECKED
   */
   CheckBox_prototype.getValue = function() {
    return this.getChecked();
  };

  /**
   * Sets the state of this checkbox. This method calls setChecked.
   * @param vntValue {String} checkbox is not checked if value is "false" "0" or "null".
   * @return {jsx3.gui.CheckBox} this object
   */
   CheckBox_prototype.setValue = function(vntValue) {
    this.setChecked(!jsx3.util.strEmpty(vntValue) && (vntValue+"").search(regFalse) != 0 ? 1 : 0);
    return this;
  };

  /**
   * processes click event for use by system; add additional code for actual behaviors
   * @private
   */
  CheckBox_prototype._ebClick = function(objEvent, objGUI) {
    this.focus(objGUI);
    if (! objEvent.leftButton() && objEvent.isMouseEvent()) return;

    if (this.getEnabled() == jsx3.gui.Form.STATEENABLED) {
      var intChecked = (this.getChecked() == CheckBox.CHECKED ? CheckBox.UNCHECKED : CheckBox.CHECKED);
      this.jsxchecked = intChecked;
      this._updateView(objGUI);
      this.doEvent(jsx3.gui.Interactive.TOGGLE, {objEVENT:objEvent, intCHECKED:intChecked, _gipp:1});
    }
  };

  /** @private @jsxobf-clobber */
  CheckBox_prototype._updateView = function(objGUI) {
    if (objGUI == null) objGUI = this.getRendered();
    if (objGUI != null) {
      jsx3.html.selectSingleElm(objGUI, 0, 0, 0).checked = (this.jsxchecked == CheckBox.CHECKED);
      jsx3.html.selectSingleElm(objGUI, 0, 0, 1).style.visibility = (this.jsxchecked == CheckBox.PARTIAL) ? "visible" : "hidden";
    }
  };

  /**
   * subclassed method: original in jsx3.gui.Interactive; called when user presses a key while item has focus; by default if either the spacebar or return key are pressed, the checkbox's click event will be triggered
   * @private
   */
  CheckBox_prototype._ebKeyDown = function(objEvent, objGUI) {
    if (objEvent.enterKey()) {
      //run the code bound to the 'execute' event for the checkbox instance; depending upon a space or enter key, pass the appropriate object ref (this appears to be an IE bug or undocumented inconsistency)
      this._ebClick(objEvent, objGUI);

      //stop event bubbling; the space key also fires a scroll event
      objEvent.cancelAll();
    }
  };

  CheckBox_prototype._ebLabelClick = function(objEvent, objGUI) {
    objEvent.preventDefault();
  };

  CheckBox.BRIDGE_EVENTS = {};
  CheckBox.BRIDGE_EVENTS[jsx3.gui.Event.CLICK] = true;
  CheckBox.BRIDGE_EVENTS[jsx3.gui.Event.KEYDOWN] = true;

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  CheckBox_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 3);
  };

  /**
   * Creates the box model/profile for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @private
   */
  CheckBox_prototype.createBoxProfile = function(objImplicit) {
    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if (this.getParent() && (objImplicit == null || ((isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if (objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    //outer box
    var bRelative = (this.getRelativePosition() != 0 && (!this.getRelativePosition() || this.getRelativePosition() == jsx3.gui.Block.RELATIVE));
    var bor, mar, vHeight, vWidth;

    if (objImplicit.tagname == null) objImplicit.tagname = "span";
    if ((bor = this.getBorder()) != null && bor != "") objImplicit.border = bor;
    if (bRelative && (mar = this.getMargin()) != null && mar != "") objImplicit.margin = mar;
    if (!objImplicit.boxtype) objImplicit.boxtype = (bRelative) ? "relativebox" : "box";
    if (objImplicit.left == null) objImplicit.left = (!bRelative && !jsx3.util.strEmpty(this.getLeft())) ? this.getLeft() : 0;
    if (objImplicit.top == null) objImplicit.top = (!bRelative && !jsx3.util.strEmpty(this.getTop())) ? this.getTop() : 0;
    //padding???????
    if (objImplicit.height == null) objImplicit.height = ((vHeight = this.getHeight()) != null) ? vHeight : 18;
    //when width is defined, the control will also need to implement 'overflow-x:hidden' within the paintBox method for ff to respect the setting
    if (objImplicit.width == null)
      if ((vWidth = this.getWidth()) != null) objImplicit.width = vWidth;
    var b1 = new jsx3.gui.Painted.Box(objImplicit);

    //div wrapper to fix the layout bugs related to ff and the inline box. by inserting a div as the immediate child, the focus-related layout error goes away
    var o = {};
    o.tagname = "div";
    o.boxtype = "inline";
    var b1Div = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1Div);

    //check and tri-state container
    var o = {};
    o.tagname = "span";
    o.boxtype = "box";
    o.width = 16;
    o.parentheight = b1.getClientHeight();
    o.height = 18; //change to 100%
    o.left = 0;
    o.top = 0;
    var b1x = new jsx3.gui.Painted.Box(o);
    b1Div.addChildProfile(b1x);

    //checkbox
    var o = {};
    o.tagname = "input[checkbox]";
    o.empty = true;
    o.omitpos = true;
    var b1a = new jsx3.gui.Painted.Box(o);
    b1x.addChildProfile(b1a);

    //tri-state overlay
    var o = {};
    o.tagname = "span";
    o.boxtype = "box";
    o.left = 3;
    o.top = 7;
    o.width = 7;
    o.height = 2;
    var b1b = new jsx3.gui.Painted.Box(o);
    b1x.addChildProfile(b1b);

    //label
    var o = {};
    o.tagname = "label";
    o.boxtype = "inline";
    o.top = 2;
    o.left = 18;
    o.parentheight = b1.getClientHeight();
    o.height = 16; //change to 100%
    o.margin = "0 18 0 0";
    var b1c = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1c);

    return b1;
  };

  CheckBox_prototype.focus = function(objGUI) {
    if(!objGUI) objGUI = this.getRendered();
    if (objGUI)
      jsx3.html.focus(jsx3.html.selectSingleElm(objGUI, "0/0/0"));
  };

  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  CheckBox_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    // render custom attributes
    var bEnabled = this.getEnabled() == jsx3.gui.Form.STATEENABLED;
    var strEvents = bEnabled ? this.renderHandlers(CheckBox.BRIDGE_EVENTS, 0) : "";
    var strProps = this.renderAttributes(null, true);

    var strPartialHidden = this.getChecked() == CheckBox.PARTIAL ? "visible" : "hidden";
    var strPartialBG = bEnabled ? "" : "background-color:#999999;";

    //get the outer box
    var b1 = this.getBoxProfile(true);
    b1.setAttributes(' id="' + this.getId() + '"' + this.paintLabel() + ' class="' + this.paintClassName() + '"' + this.paintTip() + strEvents + strProps);
    b1.setStyles(((b1.getPaintedWidth())?"overflow-x:hidden;":"")+ this.paintCursor(true) + this.paintFontName() + this.paintFontSize() + this.paintFontWeight() + this.paintColor() + this.paintBackgroundColor() + this.paintVisibility() + this.paintDisplay() + this.paintZIndex() + this.paintCSSOverride());

    //get the check and tri-state container
    var b1Div = b1.getChildProfile(0);

    //get the check and tri-state container
    var b1x = b1Div.getChildProfile(0);
    b1x.setAttributes(' class="jsx30checkbox_tristate" ');

    //get the native checkbox element
    var b1a = b1x.getChildProfile(0);
    b1a.setAttributes(' id="' + this.getId() + '_input" type="checkbox"' + this.paintName() + this.paintEnabled() + this.paintChecked() + this.paintIndex());

    //get the tri-state overlay
    var b1b = b1x.getChildProfile(1);
    b1b.setAttributes(' class="jsx30checkbox_partial" ');
    b1b.setStyles('visibility:' + strPartialHidden + ';' + strPartialBG);

    //get the label
    var text = this.paintText();
    var b1c = b1.getChildProfile(1);
    b1c.setAttributes((text ? ' for="' + this.getId() + '_input"' : '') + jsx3.html._UNSEL +
                      this.renderHandler(jsx3.gui.Event.CLICK, "_ebLabelClick"));

    return b1.paint().join(b1Div.paint().join(b1x.paint().join(b1a.paint().join("")+b1b.paint().join("&#160;"))+b1c.paint().join(text)));
  };

  /**
   * renders current state of checkbox; to get the state of the checkbox when it was first initialized, use: getDefaultChecked(). Default: jsx3.gui.CheckBox.CHECKED
   * @return {String} checked attribute or empty
   * @private
   * @jsxobf-clobber
   */
  CheckBox_prototype.paintChecked = function() {
    return (this.getChecked() == CheckBox.CHECKED) ? ' checked="checked" ' : '';
  };

  /**
   * Paints the default control class and any user specified string of css class name(s)
   * @return {String}
   * @private
   */
  CheckBox_prototype.paintClassName = function() {
    var cn = this.getClassName();
    return CheckBox.DEFAULTCLASSNAME + (cn ? " " + cn : "");
  };

  /**
   * validates that the checkbox is checked if it is required (e.g., [object].setRequired()); returns (as well as sets as a property on the object) one of: jsx3.gui.Form.STATEVALID jsx3.gui.Form.INSTATEVALID
   * @return {int} one of: jsx3.gui.Form.STATEVALID jsx3.gui.Form.INSTATEVALID
   */
  CheckBox_prototype.doValidate = function() {
    this.setValidationState((this.getRequired() == jsx3.gui.Form.OPTIONAL || this.getChecked() == CheckBox.CHECKED) ?
        jsx3.gui.Form.STATEVALID : jsx3.gui.Form.STATEINVALID);
    return this.getValidationState();
  };

  CheckBox_prototype.getInputId = function() {
    return this.getId() + "_input";
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  CheckBox.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

  CheckBox_prototype.emGetType = function() {
    return jsx3.gui.Matrix.EditMask.FORMAT;
  };

  CheckBox_prototype.emInit = function(objColumn) {
    this.jsxsupermix(objColumn);
    this.subscribe(jsx3.gui.Interactive.TOGGLE, this, "_emOnToggle");
  };

  CheckBox_prototype.emSetValue = function(strValue) {
    this.jsxchecked = Number(strValue) == CheckBox.CHECKED ? CheckBox.CHECKED : CheckBox.UNCHECKED;
  };

  CheckBox_prototype.emGetValue = function() {
    var es = this.emGetSession();
    if (es)
      return es.column.getValueForRecord(es.recordId);
    return null;
  };

  CheckBox_prototype.emBeginEdit = function(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD) {
    var input = jsx3.html.selectSingleElm(objTD, 0, 0, 0, 0, 0);
    if (input && !input.getAttribute("disabled")) {
      this.jsxsupermix(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD);
      jsx3.html.focus(input);
    } else {
      return false;
    }
  };

  CheckBox_prototype.emPaintTemplate = function() {
    this.jsxchecked = CheckBox.UNCHECKED;
    this.setText("");

    this.setEnabled(jsx3.gui.Form.STATEDISABLED);
    var disabled = this.paint();
    this.setEnabled(jsx3.gui.Form.STATEENABLED);
    var enabled = this.paint();
    var strHTML = this.emGetTemplate(enabled, disabled);


    strHTML = strHTML.replace(/<(input .*?)\/>/g,
        '<$1><xsl:if test="{0}=\'1\'"><xsl:attribute name="checked">checked</xsl:attribute></xsl:if></input>');
    return strHTML;
  };

  /** @private @jsxobf-clobber */
  CheckBox_prototype._emOnToggle = function(objEvent) {
    var es = this.emGetSession();
    if (es) {
      var intChecked = objEvent.context.intCHECKED;
      this.jsxchecked = intChecked;
      es.column.setValueForRecord(es.recordId, intChecked.toString());
    }
  };

  CheckBox_prototype.onSetChild = function(objChild) {
    return false;
  };
  
});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.CheckBox
 * @see jsx3.gui.CheckBox
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.CheckBox", -, null, function(){});
 */
jsx3.CheckBox = jsx3.gui.CheckBox;

/* @JSC :: end */
