/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Form", "jsx3.gui.Block");

/**
 * A GUI control that implements a single radio button.
 * <p/>
 * Several radio buttons may be organized into a group ("radio group") with the <code>groupName</code> property.
 * No more than one radio button of the set of radio buttons sharing a single <code>groupName</code> value may be
 * selected at one time.
 */
jsx3.Class.defineClass("jsx3.gui.RadioButton", jsx3.gui.Block, [jsx3.gui.Form], function(RadioButton, RadioButton_prototype) {

  /**
   * {int} Value for the selected field indicating an unselected radio button.
   * @final @jsxobf-final
   */
  RadioButton.UNSELECTED = 0;

  /**
   * {int} Value for the selected field indicating a selected radio button.
   * @final @jsxobf-final
   */
  RadioButton.SELECTED = 1;

  /**
   * {String} jsx30radio
   */
  RadioButton.DEFAULTCLASSNAME = "jsx30radio";

  /**
   * The instance initializer.
   * @param strName {String} a unique name distinguishing this object from all other JSX GUI objects in the JSX application.
   * @param vntLeft {int|String} the left offset of this object from the parent container as a number (in pixels) or a string css value.
   * @param vntTop {int|String} the top offset of this object from the parent container as a number (in pixels) or a string css value.
   * @param vntWidth {int|String} the width of this object as a number (in pixels) or a string css value.
   * @param vntHeight {int|String} the height of this object as a number (in pixels) or a string css value.
   * @param strText {String} the text/HTML markup to display with the radio button.
   * @param strValue {String} the value of the radio button (equivalent to the <code>value</code> property on a standard HTML radio button).
   * @param strGroupName {String} the group name of the radio button (equivalent to the <code>name</code> property on a standard HTML radio button).
   * @param intSelected {int} the default selection state of the radio button. <code>SELECTED</code> or
   *    <code>UNSELECTED</code>. <code>null</code> is equivalent to <code>SELECTED</code>.
   */
  RadioButton_prototype.init = function(strName,vntLeft,vntTop,vntWidth,vntHeight,strText,strValue,strGroupName,intSelected) {
    //call constructor for super class
    this.jsxsuper(strName,vntLeft,vntTop,vntWidth,vntHeight,strText);

    //set properties unique to this class and required by its MODEL
    this.setGroupName(strGroupName);  //this must be set first before other methods
    this.setValue(strValue);

    //set selected and defaultselected properties (default values are always set while actual values can be implied as checked via a null state (null = true and true = true)
    this.setDefaultSelected((intSelected == null) ? RadioButton.SELECTED : intSelected);
    if (intSelected != null) this.setSelected(intSelected);
  };

  /**
   * Returns the group name of this radio button, which is equivalent to the <code>name</code> property on a
   * standard HTML radio button.
   * @return {String}
   */
  RadioButton_prototype.getGroupName = function() {
    return this.jsxgroupname;
  };

  /**
   * Sets the group name of this radio button. If this property is set, this radio button will be a member of the set
   * of radio buttons sharing the same value for this property. No more than one member of this set may be selected
   * at one time.
   * @param strGroupName {String} the new group name.
   */
  RadioButton_prototype.setGroupName = function(strGroupName) {
    this.jsxgroupname = strGroupName;
  };

  /** @private */
  RadioButton_prototype._ebClick = function(objEvent, objGUI) {
    this.focus(objGUI);
    if (! objEvent.leftButton() && objEvent.isMouseEvent()) return;

    //radio buttons don't toggle state; they ALWAYS become selected when clicked; just set the value
    if (this.getSelected() != RadioButton.SELECTED) {
      var cancel = this.doEvent(jsx3.gui.Interactive.SELECT, {objEVENT:objEvent, _gipp:1});
      if (cancel !== false)
        this.setSelected(RadioButton.SELECTED, objGUI);
    }
  };

  /** @private */
  RadioButton_prototype._ebKeyDown = function(objEvent, objGUI) {
    if (objEvent.enterKey()) {
      //run the code bound to the 'execute' event for the RadioButton instance; depending upon a space or enter key, pass the appropriate object ref (this appears to be an IE bug or undocumented inconsistency)
      this._ebClick(objEvent, objGUI);
      objEvent.cancelAll();
    }
  };

  /**
   * Returns the default selection state of this radio button. To get the current state use <code>getSelected()</code>.
   * @return {int} <code>SELECTED</code> or <code>UNSELECTED</code>.
   * @see #getSelected()
   */
  RadioButton_prototype.getDefaultSelected = function() {
    return this.jsxdefaultselected;
  };

  /**
   * Sets the default selection state of this radio button.
   * @param intSelected {int} <code>SELECTED</code> or <code>UNSELECTED</code>.
   * @return {jsx3.gui.RadioButton} this object.
   */
  RadioButton_prototype.setDefaultSelected = function(intSelected) {
    this.jsxdefaultselected = intSelected;
    return this;
  };

  /**
   * Returns the current selection state of this radio button.
   * @return {int} <code>SELECTED</code> or <code>UNSELECTED</code>.
   * @see #SELECTED
   * @see #UNSELECTED
   */
  RadioButton_prototype.getSelected = function() {
    //default to true for Selected state
    return (this.jsxselected != null) ? this.jsxselected : this.getDefaultSelected();
  };

  /**
   * Sets the current selection state of this radio button. This method immediately updates the view of this
   * object if it is currently rendered on the screen. If <code>intSelected</code> is equal to <code>SELECTED</code>
   * any other radio buttons in the radio group of this object will be unselected.
   * @param intSelected {int} if <code>SELECTED</code> or <code>null</code>, this object is selected, otherwise it
   *    is unselected.
   * @param-private objGUI {Object}
   * @return {jsx3.gui.RadioButton} this object.
   */
  RadioButton_prototype.setSelected = function(intSelected, objGUI) {
    intSelected = intSelected != null ? intSelected : RadioButton.SELECTED;

    this.jsxselected = intSelected;

    if (objGUI == null) objGUI = this.getRendered();
    if (objGUI) {
      jsx3.html.selectSingleElm(objGUI, 0, 0, 0).checked = (intSelected == RadioButton.SELECTED);

      if (intSelected == RadioButton.SELECTED) {
        var sibs = this.getSiblings();
        for (var i = 0; i < sibs.length; i++)
          sibs[i].jsxselected = RadioButton.UNSELECTED;
      }
    }

    return this;
  };

  /**
   * Returns the list of sibling radio buttons. This list is comprised of the radio buttons whose groupName property
   * is equal to the groupName property of this radio button. The return value does not include this radio button.
   * This method will only return siblings if this radio button is rendered and will only return sibling radio
   * buttons that are also rendered on screen.
   * @param-private bRendered {boolean}
   * @return {Array<jsx3.gui.RadioButton>}
   */
  RadioButton_prototype.getSiblings = function(bRendered) {
    var sibs = [];
    var doc = this.getDocument();
    if (doc == null) return sibs;

    var myId = this.getId();
    var elements = doc.getElementsByName(this.getGroupName());
    for (var i = 0; i < elements.length; i++) {
      var elm = elements[i];
      if (elm.nodeName.toLowerCase() == "input" && elm.type.toLowerCase() == "radio") {
        var rend = elm.parentNode.parentNode.parentNode;
        if (rend.id != myId)
          sibs.push(bRendered ? [jsx3.GO(rend.id), rend] : jsx3.GO(rend.id));
      }
    }

    return sibs;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the value of the selected radio button in a given radio group. If no radio button in the group is
   * selected, <code>null</code> is returned. This method only queries radio groups that are currently rendered
   * on screen.
   * @param strGroupName {String} the name of the radio group to search.
   * @return {String} the value of the selected radio button in the radio group.
   * @deprecated Use <code>getGroupValue()</code> instead.
   * @see #getGroupValue()
   */
  RadioButton.getValue = function(strGroupName) {
    var doc = document; // static access to document is deprecated
    if (doc != null) {
      var objGroup = doc.getElementsByName(strGroupName);
      if (objGroup != null) {
        var maxLen = objGroup.length;
        for (var i=0;i<maxLen;i++) {
          if (objGroup[i].checked) return objGroup[i].value;
        }
      }
    }
  };

  /**
   * Sets the selected radio button in a given radio group.
   * @param strGroupName {String} the name of the radio group to search.
   * @param strValue {String} the value of the radio button in the radio group to select.
   * @return {jsx3.gui.RadioButton} the selected radio button.
   * @deprecated Use <code>setGroupValue()</code> instead.
   * @see #setGroupValue()
   */
  RadioButton.setValue = function(strGroupName, strValue) {
    var doc = document; // static access to document is deprecated
    if (doc == null) return null;

    //get group that this radio button belongs to
    var objGroup = doc.getElementsByName(strGroupName);

    //loop to set matching button
    if (objGroup != null) {
      var maxLen = objGroup.length;
      for (var i=0;i<maxLen;i++) {
        if (objGroup[i].value == strValue) {
          //force selection and return
          var objJSX = jsx3.GO(objGroup[i].parentNode.parentNode.parentNode.id);
          objJSX.setSelected(RadioButton.SELECTED);
          return objJSX;
        }
      }
    }

    return null;
  };

/* @JSC :: end */

  /**
   * Returns the value of this radio button. When this radio button is selected, the value of its radio group is
   * equal to the value of this radio button.
   * @return {String} the value of this radio button.
   */
  RadioButton_prototype.getValue = function() {
    return this.jsxvalue;
  };

  /**
   * Sets the value of this radio button.
   * @param strValue {String} the value of this radiobutton. In general, each radio button is a radio group has
   *    a unique value.
   * @return {jsx3.gui.RadioButton} this object.
   */
  RadioButton_prototype.setValue = function(strValue) {
    this.jsxvalue = strValue;
    return this;
  };

  /**
   * Returns the value of the selected radio button in the radio group of this radio button.
   * @return {String} the value of the selected radio button or <code>null</code> if no button is selected.
   */
  RadioButton_prototype.getGroupValue = function() {
    if (this.getSelected() == RadioButton.SELECTED) return this.getValue();
    var sibs = this.getSiblings();
    for (var i = 0; i < sibs.length; i++) {
      var sib = sibs[i];
      if (sib.getSelected() == RadioButton.SELECTED) return sib.getValue();
    }
    return null;
  };

  /**
   * Sets the selected radio button of the radio group of this radio button by value.
   * @param strValue {String} the value of the radio button of the radio group of this radio button to select.
   */
  RadioButton_prototype.setGroupValue = function(strValue) {
    if (this.getValue() == strValue) {
      if (this.getSelected() != RadioButton.SELECTED)
        this.setSelected(RadioButton.SELECTED);
    } else {
      this.jsxselected = RadioButton.UNSELECTED;
      var sibs = this.getSiblings(true);

      for (var i = 0; i < sibs.length; i++) {
        var sib = sibs[i][0];
        var rend = sibs[i][1];
        var checked = sib.getValue() == strValue;
        sib.jsxselected = checked ? RadioButton.SELECTED : RadioButton.UNSELECTED;
        jsx3.html.selectSingleElm(rend, 0, 0, 0).checked = checked;
      }
    }
  };

  /**
   * Validates that this radio button is selected if it is required. A radiobutton will pass validation if it is
   * optional or if it is required and it or one of its sibling radio buttons is selected.
   * @return {int} <code>jsx3.gui.Form.STATEVALID</code> or <code>jsx3.gui.Form.INSTATEVALID</code>.
   */
  RadioButton_prototype.doValidate = function() {
    this.setValidationState(
        (this.getRequired() == jsx3.gui.Form.OPTIONAL || this.getGroupValue() != null) ?
          jsx3.gui.Form.STATEVALID : jsx3.gui.Form.STATEINVALID);
    return this.getValidationState();
  };

  RadioButton.BRIDGE_EVENTS = {};
  RadioButton.BRIDGE_EVENTS[jsx3.gui.Event.CLICK] = true;
  RadioButton.BRIDGE_EVENTS[jsx3.gui.Event.KEYDOWN] = true;

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @package
   */
  RadioButton_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 3);
  };

  /**
   * Creates the box model/profile for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @package
   */
  RadioButton_prototype.createBoxProfile = function(objImplicit) {
    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if (this.getParent() && (objImplicit == null || ((isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if (objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    //outer box
    var bRelative = (this.getRelativePosition() != 0 && (!this.getRelativePosition() || this.getRelativePosition() == jsx3.gui.Block.RELATIVE));
    var bor, mar, vHeight, vWidth;;

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

    //radio container
    o = {};
    o.tagname = "span";
    o.boxtype = "box";
    o.width = 16;
    o.parentheight = b1.getClientHeight();
    o.height = 18; //change to 100%
    var b1x = new jsx3.gui.Painted.Box(o);
    b1Div.addChildProfile(b1x);

    //radio
    o = {};
    o.tagname = "input[radio]";
    o.empty = true;
    o.omitpos = true;
    var b1a = new jsx3.gui.Painted.Box(o);
    b1x.addChildProfile(b1a);

    //label
    o = {};
    o.tagname = "label";
    o.boxtype = "inline";
    o.top = 2;
    o.parentheight = b1.getClientHeight();
    o.height = "100%";
    o.padding = "0 0 0 18";
    var b1c = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1c);

    return b1;
  };

  /**
   * Returns the serialized DHTML representation of this object.
   * @return {String}
   */
  RadioButton_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    // render custom attributes
    var bEnabled = this.getEnabled() == jsx3.gui.Form.STATEENABLED;
    var strEvents = bEnabled ? this.renderHandlers(RadioButton.BRIDGE_EVENTS, 0) : "";
    var strProps = this.renderAttributes(null, true);

    //get the outer box
    var b1 = this.getBoxProfile(true);
    b1.setAttributes(' id="' + this.getId() + '"' + this.paintLabel() + ' class="' + this.paintClassName() + '"' + this.paintTip() + strEvents + strProps);
    b1.setStyles(((b1.getPaintedWidth())?"overflow-x:hidden;":"")+ this.paintCursor(true) + this.paintFontName() + this.paintFontSize() + this.paintFontWeight() + this.paintColor() + this.paintBackgroundColor() + this.paintVisibility() + this.paintDisplay() + this.paintZIndex() + this.paintCSSOverride());

    //get the check and tri-state container
    var b1Div = b1.getChildProfile(0);

    //get the check and tri-state container
    var b1x = b1Div.getChildProfile(0);
    b1x.setAttributes(' class="jsx30radio_tristate" ');

    //get the native radio element
    var b1a = b1x.getChildProfile(0);
    b1a.setAttributes(' id="' + this.getId() + '_input" type="radio" ' + this.renderHandler(jsx3.gui.Event.FOCUS, "_ebFocus", 3) + this.renderHandler(jsx3.gui.Event.BLUR, "_ebBlur", 3) + ' name="' + this.getGroupName() + '" value="' + this.getValue() + '" ' + this.paintEnabled() + this.paintSelected() + this.paintIndex());

    //get the label
    var text = this.paintText();
    var b1c = b1.getChildProfile(1);
    b1c.setAttributes((text ? ' for="' + this.getId() + '_input"' : '') + jsx3.html._UNSEL);

    return b1.paint().join(b1Div.paint().join(b1x.paint().join(b1a.paint().join(""))+b1c.paint().join(text)));
  };

  RadioButton_prototype.focus = function(objGUI) {
    if(!objGUI) objGUI = this.getRendered();
    if (objGUI)
      jsx3.html.focus(jsx3.html.selectSingleElm(objGUI, "0/0/0"));
  };

  /**
   * renders current state of radio; to get the state of the radiobutton when it was first initialized, use: getDefaultSelected(). Default: jsx3.Radio.Selected
   * @return {String} CHECKED attribute or empty
   * @private
   */
  RadioButton_prototype.paintSelected = function() {
    return (this.getSelected() == RadioButton.SELECTED) ? ' checked="checked" ' : '';
  };

  /**
   * Paints the default control class and any user specified string of css class name(s)
   * @return {String}
   * @private
   */
  RadioButton_prototype.paintClassName = function() {
    var cn = this.getClassName();
    return RadioButton.DEFAULTCLASSNAME + (cn ? " " + cn : "");
  };

  RadioButton_prototype.getInputId = function() {
    return this.getId() + "_input";
  };

  RadioButton_prototype.onSetChild = function(objChild) {
    return false;
  };
  
/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  RadioButton.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

  RadioButton_prototype.emGetType = function() {
    return jsx3.gui.Matrix.EditMask.FORMAT;
  };

  RadioButton_prototype.emInit = function(objColumn) {
    this.jsxsupermix(objColumn);
    this.subscribe(jsx3.gui.Interactive.SELECT, this, "_emOnSelect");
  };

  RadioButton_prototype.emSetValue = function(strValue) {
    this.jsxselected = Number(strValue) == RadioButton.SELECTED ? RadioButton.SELECTED : RadioButton.UNSELECTED;
  };

  RadioButton_prototype.emGetValue = function() {
    var es = this.emGetSession();
    if (es)
      return es.column.getValueForRecord(es.recordId);
    return null;
  };

  RadioButton_prototype.emBeginEdit = function(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD) {
    var input = jsx3.html.selectSingleElm(objTD, 0, 0, 0, 0, 0);
    if (input && !input.getAttribute("disabled")) {
      this.jsxsupermix(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD);
      jsx3.html.focus(input);
    } else {
      return false;
    }
  };

  RadioButton_prototype.emPaintTemplate = function() {
    this.jsxselected = RadioButton.UNSELECTED;
    this.setText("");

    this.setEnabled(jsx3.gui.Form.STATEDISABLED);
    var disabled = this.paint();
    this.setEnabled(jsx3.gui.Form.STATEENABLED);
    var enabled = this.paint();
    var strHTML = this.emGetTemplate(enabled, disabled);

    strHTML = strHTML.replace(/<(input .*?)\/>/g,
        '<$1><xsl:if test="{0}=\'1\'"><xsl:attribute name="checked">checked</xsl:attribute></xsl:if>' +
            '<xsl:if test="@jsxdisabled=\'1\'"><xsl:attribute name="disabled">disabled</xsl:attribute></xsl:if></input>');
    return strHTML;
  };

  /** @private @jsxobf-clobber */
  RadioButton_prototype._emOnSelect = function(objEvent) {
    var es = this.emGetSession();
    if (es) {
      var path = es.column.getPath();
      var i = es.matrix.getXML().selectNodeIterator("//record[@" + path + "='1']");
      while (i.hasNext()) {
        var node = i.next();
        node.removeAttribute(path);
      }

      es.column.setValueForRecord(es.recordId, "1");
    }
  };

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.RadioButton
 * @see jsx3.gui.RadioButton
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.RadioButton", -, null, function(){});
 */
jsx3.RadioButton = jsx3.gui.RadioButton;

/* @JSC :: end */
