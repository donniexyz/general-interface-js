/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Form", "jsx3.gui.Block");

/**
 * This jsx3.gui.TextBox class allows integration of a standard HTML text input into the JSX DOM. This allows the text box to be treated like a JSX object, including positioning, serialization, updates, and data mapping/binding, etc.
 */
jsx3.Class.defineClass("jsx3.gui.TextBox", jsx3.gui.Block, [jsx3.gui.Form], function(TextBox, TextBox_prototype) {

  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;
  var html = jsx3.html;

  /**
   * {int} texbox type 0
   * @final @jsxobf-final
   */
  TextBox.TYPETEXT = 0;

  /**
   * {int} text area type 1
   * @final @jsxobf-final
   */
  TextBox.TYPETEXTAREA = 1;

  /**
   * {int} password type 2
   * @final @jsxobf-final
   */
  TextBox.TYPEPASSWORD = 2;

  /**
   * {int} wrap text (default)
   * @final @jsxobf-final
   */
  TextBox.WRAPYES = 1;

  /**
   * {int} no wrap
   * @final @jsxobf-final
   */
  TextBox.WRAPNO = 0;

  /**
   * {String} none
   */
  TextBox.OVERFLOWNORMAL = "";

  /**
   * {String} as needed by content
   */
  TextBox.OVERFLOWAUTO = "auto";

  /**
   * {String} persistent scrollbars
   */
  TextBox.OVERFLOWSCROLL = "scroll";

  /**
   * {String} CSS color property
   */
  jsx3.gui.TextBox.DEFAULTBACKGROUNDCOLOR = "#ffffff";

  /**
   * {String} none
   * @final @jsxobf-final
   */
  TextBox.VALIDATIONNONE = "none";

  /**
   * {String} us ssn
   * @final @jsxobf-final
   */
  TextBox.VALIDATIONSSN = "ssn";

  /**
   * {String} telephone
   * @final @jsxobf-final
   */
  TextBox.VALIDATIONPHONE = "phone";

  /**
   * {String} email
   * @final @jsxobf-final
   */
  TextBox.VALIDATIONEMAIL = "email";

  /**
   * {String} numbers only
   * @final @jsxobf-final
   */
  TextBox.VALIDATIONNUMBER = "number";

  /**
   * {String} letter
   * @final @jsxobf-final
   */
  TextBox.VALIDATIONLETTER = "letter";

  /**
   * {String} uszip
   * @final @jsxobf-final
   */
  TextBox.VALIDATIONUSZIP = "uszip";

  /**
   * {String} jsx30textbox
   */
  TextBox.DEFAULTCLASSNAME = "jsx30textbox";

  /** @private @jsxobf-clobber */
  TextBox.VALIDATION = {};
  TextBox.VALIDATION[TextBox.VALIDATIONNONE] = /[\s\S]*/;
  TextBox.VALIDATION[TextBox.VALIDATIONSSN] = /^\d{3}-\d{2}-\d{4}$/;
  TextBox.VALIDATION[TextBox.VALIDATIONPHONE] = /^[0-9\-\(\) ]+$/;
  TextBox.VALIDATION[TextBox.VALIDATIONEMAIL] = /^([a-zA-Z0-9_~\-\.]+)@([a-zA-Z0-9\-]+\.){1,}[a-zA-Z0-9]{2,}$/;
  TextBox.VALIDATION[TextBox.VALIDATIONNUMBER] = /^\d+$/;
  TextBox.VALIDATION[TextBox.VALIDATIONLETTER] = /^[a-zA-Z ,-\.]+$/;
  TextBox.VALIDATION[TextBox.VALIDATIONUSZIP] = /^\d{5}(-\d{4})?$/;

  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param vntLeft {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntTop {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntWidth {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntHeight {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param strValue {String} this value to appear in the textbox/textarea. This value will be set as the defaultValue for the text box when it is initialized; if edits are made by the user, these edits can be accessed via [object].getValue(); if the initial value is needed, use [object].getDefaultValue();
   * @param TYPE {String} one of two valid types: jsx3.gui.TextBox.TYPETEXT, jsx3.gui.TextBox.TYPETEXTAREA. If null is passed, jsx3.gui.TextBox.DEFAULTTYPE is used
   */
  TextBox_prototype.init = function(strName,vntLeft,vntTop,vntWidth,vntHeight,strValue,TYPE) {
    //call constructor for super class (when multiple super-classes, always derive from block)
    this.jsxsuper(strName,vntLeft,vntTop,vntWidth,vntHeight);

    //set properties unique to this class
    if (strValue != null) {
      this.setDefaultValue(strValue);
      this.setValue(strValue);
    }
    if (TYPE != null) this.setType(TYPE);
  };

  /**
   * subclassed method (original in jsx3.gui.Interactive): processes 'enter key' event for the textbox; fires any bound 'jsxececute' (Interactive.EXECUTE) script belonging to the textbox; or
   *           executes any bound keypress code in model context
   * @param objGUI {Object} VIEW instance of the textbox
   * @private
   */
  TextBox_prototype._ebKeyPress = function(objEvent, objGUI) {
    if (objEvent.enterKey() && this.getEvent(Interactive.EXECUTE)) {
      //run the code bound to the 'execute' event for the button instance
      this.doEvent(Interactive.EXECUTE, {objEVENT:objEvent});
    } else {
      //execute the given code
      this.doEvent(Interactive.JSXKEYPRESS, {objEVENT:objEvent});
    }
  };

  /** @private */
  TextBox_prototype._ebBlur = function(objEvent, objGUI) {
    this.jsxsupermix(objEvent, objGUI);

    var v = this.parseValue(objGUI.value);
    if (this.jsxvalue !== v) {
      var veto = this.doEvent(Interactive.CHANGE, {objEVENT:objEvent, strPREVIOUS:this.jsxvalue, strVALUE:v, _gipp:1});
      if (veto === false) {
        objGUI.value = this.formatValue(this.jsxvalue);
        return;
      } else {
        this.jsxvalue = v;
      }
    }

    var fmt = this.formatValue(v);
    if (fmt != objGUI.value)
      objGUI.value = fmt;
  };

  /**
   * Formats the value of this text box before displaying it in the onscreen input box. This implementation
   * returns the value converted to a string. A <code>null</code> value returns the empty string.
   * @param value {Object}
   * @return {String}
   * @protected
   * @since 3.7
   */
  TextBox_prototype.formatValue = function(value) {
    if (value == null) return "";
    return "" + value;
  };

  /**
   * Parses the value of the onscreen input box before it is used as the value of the text box. This
   * implementation returns the input without transforming it.
   * @param input {String}
   * @return {Object}
   * @protected
   * @since 3.7
   */
  TextBox_prototype.parseValue = function(input) {
    return input;
  };

  /** @private */
  TextBox_prototype._ebKeyUp = function(objEvent, objGUI) {
    this.doEvent(Interactive.JSXKEYUP, {objEVENT:objEvent});

    // enforce max length on a text area
    if (this.getType() == TextBox.TYPETEXTAREA) {
      var maxLength = this.getMaxLength();
      if (maxLength > 0) {
        var value = objGUI.value;
        if (value && value.length > maxLength)
          objGUI.value = value.substring(0, maxLength);
      }
    }

    if (this.hasEvent(Interactive.INCR_CHANGE)) {
      var newValue = this.parseValue(objGUI.value);

      if (this._jsxprevvalue != newValue) {
        var veto = this.doEvent(Interactive.INCR_CHANGE,
            {objEVENT:objEvent, strPREVIOUS:this._jsxprevvalue, strVALUE:newValue});
        if (veto === false) {
          objGUI.value = this._jsxprevvalue != null ? this._jsxprevvalue : "";
        } else {
          /* @jsxobf-clobber */
          this._jsxprevvalue = objGUI.value;
        }
      }
    }
  };

  /**
   * if TYPE for the object is jsx3.gui.TextBox.TYPETEXT, and this returns a positive integer, the maxlen property for the textbox will be set to this value; returns null if no value found
   * @return {int} positive integer
   */
  TextBox_prototype.getMaxLength = function() {
    return (this.jsxmaxlength != null) ? this.jsxmaxlength : null;
  };

  /**
   * if TYPE for the object is jsx3.gui.TextBox.TYPETEXT, setting this to a positive integer affects the maxlen property for the textbox;
   *          returns a reference to self to facilitate method chaining
   * @param intMaxLength {int} positive integer, maxlen for the number of characters accepted by the textbox
   * @return {jsx3.gui.TextBox} this object
   */
  TextBox_prototype.setMaxLength = function(intMaxLength) {
    this.jsxmaxlength = intMaxLength;
    return this;
  };

  /**
   * Sets the overflow property of this object, which defines how its on-screen view will behave when its contents
   * are larger than its specified width and/or height. Overflow only applies to text boxes of type
   * <code>TYPETEXTAREA</code>.
   *
   * @param OVERFLOW {String} <code>OVERFLOWNORMAL</code>, <code>OVERFLOWAUTO</code>, or <code>OVERFLOWSCROLL</code>.
   * @return {jsx3.gui.TextBox} this object.
   * @see #OVERFLOWNORMAL
   * @see #OVERFLOWAUTO
   * @see #OVERFLOWSCROLL
   *
   * @jsxdoc-definition  TextBox_prototype.setOverflow = function(OVERFLOW) {}
   */

  /**
   * Returns the type of TextBox. Default: jsx3.gui.TextBox.TYPETEXT
   * @return {int} one of: jsx3.gui.TextBox.TYPETEXT, jsx3.gui.TextBox.TYPETEXTAREA, jsx3.gui.TextBox.TYPEPASSWORD
   */
  TextBox_prototype.getType = function() {
    return (this.jsxtype == null) ? TextBox.TYPETEXT : this.jsxtype;
  };

  /**
   * Sets the type of jsx3.gui.TextBox
   *          returns a reference to self to facilitate method chaining
   * @param TYPE {int} one of: jsx3.gui.TextBox.TYPETEXT, jsx3.gui.TextBox.TYPETEXTAREA, jsx3.gui.TextBox.TYPEPASSWORD
   * @return {jsx3.gui.TextBox} this object
   */
  TextBox_prototype.setType = function(TYPE) {
    this.jsxtype = TYPE;
    this.setBoxDirty();
    return this;
  };

  /**
   * logically tries to determine the value for the text box by 1) checking for value of on-screen VIEW; 2) checking for 'value' property for in-memory MODEL 3) checking getDefaultValue() for value when object was first initialized. Default: [empty string]
   * @return {String} value for object
   */
  TextBox_prototype.getValue = function() {
    //override of the
    var objGUI = this.getRendered();
    if (objGUI != null) {
      return this.parseValue(objGUI.value);
    } else {
      return (this.jsxvalue != null) ? this.jsxvalue : this.getDefaultValue();
    }
  };

  /**
   * @private
   * @jsxobf-clobber
   */
  TextBox_prototype._syncValue = function() {
    var objGUI = this.getRendered();
    if (objGUI)
      this.jsxvalue = this.parseValue(objGUI.value);
  };

  /**
   * @private
   * @jsxobf-clobber
   */
  TextBox_prototype._getScreenValue = function() {
    return jsx3.util.strEscapeHTML(this.formatValue(this.jsxvalue));
  };

  /**
   * string of text
   * @return {String}
   * @private
   */
  TextBox_prototype.paintText = function() {
    return (this.getText()) ? this.getText() : "";
  };

  /**
   * Returns value of textbox object when it was first initialized. Default: [empty string]
   * @return {String} default value for object
   */
  TextBox_prototype.getDefaultValue = function() {
    //default value uses the text property to store the default object value
    return this.paintText();
  };

  /**
   * updates value property for both on-screen VIEW (if object is painted) and in-memory MODEL;
   *            returns a reference to self to facilitate method chaining
   * @param strValue {String} value for the textbox/textarea
   * @return {jsx3.gui.TextBox} this object
   */
  TextBox_prototype.setValue = function(strValue) {
    this.jsxvalue = strValue;
    this._jsxprevvalue = strValue;

    var objGUI = this.getRendered();
    if (objGUI != null)
      objGUI.value = this.formatValue(strValue);
    return this;
  };

  /**
   * set during object initialization; useful for tracking edits/updates to an object by doing a string comparison between getValue() and getDefaultValue();
   *            returns a reference to self to facilitate method chaining
   * @param strValue {String} default value for the textbox/textarea
   * @return {jsx3.gui.TextBox} this object
   */
  TextBox_prototype.setDefaultValue = function(strValue) {
    //default value uses the text property to store the default object value
    this.setText(strValue);
    return this;
  };

  /**
   * Returns the text-wrapping/ word-breaking property for object if object type is jsx3.gui.TextBox.TYPETEXTAREA. Default: jsx3.gui.TextBox.WRAPYES
   * @return {String} one of: jsx3.gui.TextBox.WRAPYES jsx3.gui.TextBox.WRAPNO
   */
  TextBox_prototype.getWrap = function() {
    return (this.jsxwrap == null) ? TextBox.WRAPYES : this.jsxwrap;
  };

  /**
   * Sets the text-wrapping/ word-breaking property for object if object type is jsx3.gui.TextBox.TYPETEXTAREA.
   * @param bWrap {boolean} one of: jsx3.gui.TextBox.WRAPYES jsx3.gui.TextBox.WRAPNO
   * @return {jsx3.gui.TextBox} this object.
   */
  TextBox_prototype.setWrap = function(bWrap) {
    this.jsxwrap = bWrap;
    return this;
  };

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  TextBox_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 3);
  };

  /**
   * Creates the box model/profile for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @private
   */
  TextBox_prototype.createBoxProfile = function(objImplicit) {
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
    var pad, mar, bor, vWidth, vHeight;

    var intTop = (!bRelative && !jsx3.util.strEmpty(this.getTop())) ? this.getTop() : 0;
    var intLeft = (!bRelative && !jsx3.util.strEmpty(this.getLeft())) ? this.getLeft() : 0;
    if(objImplicit.left == null) objImplicit.left = intLeft;
    if(objImplicit.top == null) objImplicit.top = intTop;
    if(objImplicit.width == null) objImplicit.width = this.getWidth();
    if(objImplicit.height == null) objImplicit.height = this.getHeight();
    var strType = this.getType();
    if(strType == TextBox.TYPETEXT) {
      objImplicit.tagname = "input[text]";
      objImplicit.empty = true;
    } else if(strType == TextBox.TYPEPASSWORD) {
      objImplicit.tagname = "input[password]";
      objImplicit.empty = true;
    } else {
      objImplicit.tagname = "textarea";
    }
    if (!objImplicit.boxtype)objImplicit.boxtype = (bRelative) ? "inline" : "box";

    //add margin,border, and padding properties
    objImplicit.padding = ((pad = this.getPadding()) != null && pad != "") ? pad : "2 0 0 2";
    //textareas don't use a default left/right margin as textbox would as textboxes are inline elements
    if(objImplicit.tagname != "textarea") objImplicit.margin = (bRelative && (mar = this.getMargin()) != null && mar != "") ? mar : null;
    objImplicit.border = ((bor = this.getBorder()) != null && bor != "") ? bor : "solid 1px #a6a6af;solid 1px #e6e6e6;solid 1px #e6e6e6;solid 1px #a6a6af";
    var b1 = new jsx3.gui.Painted.Box(objImplicit);

    return b1;
  };

  /**
   * Returns the DHTML, used for this object's on-screen view.
   * @return {String} DHTML
   */
  TextBox_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();
    this._syncValue();

    //initialize variables
    var strId = this.getId();
    var strType = this.getType();

    var eventMap = {};
    if (this.hasEvent(Interactive.EXECUTE) || this.hasEvent(Interactive.JSXKEYPRESS))
      eventMap[Event.KEYPRESS] = true;
    if (this.hasEvent(Interactive.JSXKEYDOWN))
      eventMap[Event.KEYDOWN] = true;
    if (this.hasEvent(Interactive.JSXKEYUP) || this.hasEvent(Interactive.INCR_CHANGE) ||
        (this.getType() == TextBox.TYPETEXTAREA && this.getMaxLength() > 0)) {
      eventMap[Event.KEYUP] = true;
      this._jsxprevvalue = this.getValue();
    }
    eventMap[Event.BLUR] = true;
    if (this.hasEvent(Interactive.JSXFOCUS))
      eventMap[Event.FOCUS] = true;
    if (this.hasEvent(Interactive.JSXDOUBLECLICK))
      eventMap[Event.DOUBLECLICK] = true;
    if (this.hasEvent(Interactive.JSXCLICK))
      eventMap[Event.CLICK] = true;
    if (this.hasEvent(Interactive.JSXMOUSEDOWN))
      eventMap[Event.MOUSEDOWN] = true;
    if (this.hasEvent(Interactive.JSXMOUSEWHEEL))
      eventMap[Event.MOUSEWHEEL] = true;

    //render custom atts
    var strImplementedEvents = this.renderHandlers(eventMap, 0);
    var strProps = this.renderAttributes(null, true);

    var styles = this.paintFontName() + this.paintFontSize() + this.paintFontWeight() + this.paintVisibility() +
                   this.paintDisplay() + this.paintZIndex() + this.paintBackgroundColor() + this.paintBackground() +
                   this.paintColor() + this.paintTextAlign() + this.paintCSSOverride() + this.paintCursor();

    //generate and return final HTML
    var b1 = this.getBoxProfile(true);
    if (strType == TextBox.TYPETEXT || strType == TextBox.TYPEPASSWORD) {
      b1.setAttributes(this.paintType() + ' id="' + strId + '"' + this.paintName() + this.paintEnabled() + this._paintReadonly() +
                       this.paintMaxLength() + this.paintIndex() + this.paintTip() + strImplementedEvents +
                       ' value="' + this._getScreenValue() + '" class="' + this.paintClassName() + '" ' + strProps);
      b1.setStyles(styles);
      var strContent = "";
    } else {
      b1.setAttributes(' id="' + strId + '"' + this.paintName() + this.paintEnabled() + this._paintReadonly() + this.paintIndex() +
                       this.paintTip() + strImplementedEvents + ' class="' + this.paintClassName() + '" ' +
                       this.renderAttributes() + this.paintWrap());
      b1.setStyles(styles + this.paintOverflow());
      var strContent = this._getScreenValue();
    }

    return b1.paint().join(strContent);
  };

  /**
   * overflow
   * @return {String}
   * @private
   */
  TextBox_prototype.paintOverflow = function() {
    return "overflow:" + ((this.getOverflow()) ? this.getOverflow() : "") + ";";
  };

  /**
   * text-wrap
   * @return {String}
   * @private
   * @jsxobf-clobber
   */
  TextBox_prototype.paintWrap = function() {
    return ' wrap="' + (this.getWrap() == TextBox.WRAPYES ? "virtual" : "off") + '"';
  };

  /**
   * background-color
   * @return {String}
   * @private
   */
  TextBox_prototype.paintBackgroundColor = function() {
    var bgc = this.getEnabled() != jsx3.gui.Form.STATEDISABLED ?
              this.getBackgroundColor() || TextBox.DEFAULTBACKGROUNDCOLOR :
              this.getDisabledBackgroundColor() || jsx3.gui.Form.DEFAULTDISABLEDBACKGROUNDCOLOR;
    return "background-color:" + bgc + ";";
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   * @jsxobf-clobber
   */
  TextBox_prototype.paintType = function() {
    return ' type="' + ((this.getType() == TextBox.TYPETEXT) ? 'text' : 'password') + '"';
  };

  /**
   * if TYPE for the object is jsx3.gui.TextBox.TYPETEXT, paintting this to a positive integer affects the maxlen property for the textbox;
   *          returns a reference to self to facilitate method chaining
   * @return {String}
   * @private
   * @jsxobf-clobber
   */
  TextBox_prototype.paintMaxLength = function(intMaxLength) {
    return (this.getMaxLength() != null) ? (' maxlength="' + parseInt(this.getMaxLength()) + '" ') : '';
  };

  /**
   * Paints the default control class and any user specified string of css class name(s)
   * @return {String}
   * @private
   */
  TextBox_prototype.paintClassName = function() {
    var cn = this.getClassName();
    return TextBox.DEFAULTCLASSNAME + (cn ? " " + cn : "");
  };

  /**
   * Returns whether this text box is read only.
   * @return {int} 1 (<code>true</code>) or 0.
   */
  TextBox_prototype.getReadonly = function() {
    return this.jsxreadonly;
  };

  /**
   * Sets whether this text box is read only.
   * @param val {int} 1 (<code>true</code>) or 0.
   */
  TextBox_prototype.setReadonly = function(val) {
    this.jsxreadonly = val ? 1 : 0;
  };

  /** @private @jsxobf-clobber */
  TextBox_prototype._paintReadonly = function() {
    return this.getReadonly() ? ' readonly="readonly" ' : '';
  };

  /**
   * Returns the ID (CONSTANT) for one of the pre-canned regular expression filters that can be used to validate the user's response. Default: jsx3.gui.TextBox.VALIDATIONNONE
   * @return {String} one of: jsx3.gui.TextBox.VALIDATIONNONE, jsx3.gui.TextBox.VALIDATIONSSN, jsx3.gui.TextBox.VALIDATIONPHONE, jsx3.gui.TextBox.VALIDATIONEMAIL, jsx3.gui.TextBox.VALIDATIONNUMBER, jsx3.gui.TextBox.VALIDATIONLETTER, jsx3.gui.TextBox.VALIDATIONUSZIP
   */
  TextBox_prototype.getValidationType = function() {
    return jsx3.util.strEmpty(this.jsxvalidationtype) ? TextBox.VALIDATIONNONE : this.jsxvalidationtype;
  };

  /**
   * when set, applies one of the pre-canned regular expression filters that can be used to validate the user's response;
   *            returns a reference to self to facilitate method chaining.
   * @param VALIDATIONTYPE {String} one of: jsx3.gui.TextBox.VALIDATIONNONE, jsx3.gui.TextBox.VALIDATIONSSN, jsx3.gui.TextBox.VALIDATIONPHONE, jsx3.gui.TextBox.VALIDATIONEMAIL, jsx3.gui.TextBox.VALIDATIONNUMBER, jsx3.gui.TextBox.VALIDATIONLETTER, jsx3.gui.TextBox.VALIDATIONUSZIP
   * @return {jsx3.gui.TextBox} this object
   */
  TextBox_prototype.setValidationType = function(VALIDATIONTYPE) {
    this.jsxvalidationtype = VALIDATIONTYPE;
    return this;
  };

  /**
   * Returns the custom validation expression (a regular expression pattern to match). If this method returns
   * a valid regular expression (as a string), it will be applied <b>instead</b> of the pre-canned regular expression. Default: null
   * returned by the method, getValidationType; null is returned if the expression is not found
   * @return {String} valid regular expression such as ^\d{3}-\d{2}-\d{4}$
   */
  TextBox_prototype.getValidationExpression = function() {
    return jsx3.util.strEmpty(this.jsxvalidationexpression) ? null : this.jsxvalidationexpression;
  };

  /**
   * Sets the custom validation expression (a regular expression pattern to match).
   *              returns a reference to self to facilitate method chaining.
   * @param strValidationExpression {String} valid regular expression such as ^\d{3}-\d{2}-\d{4}$
   *              If null is passed custom value is removed and [object].getValidationType() is used instead
   * @return {jsx3.gui.TextBox} this object
   */
  TextBox_prototype.setValidationExpression = function(strValidationExpression) {
    this.jsxvalidationexpression = strValidationExpression;
    return this;
  };

  /**
   * Validates the text box against its validation type.
   * <p/>
   * Note that for this text box to pass validation for a regular expression, <code>re</code>, the following
   * expression must evaluate to <code>true</code>: <code>this.getValue().search(re) == 0</code>.
   * <code>String.search()</code> may behave differently than <code>RegExp.test()</code>; consult the JavaScript
   * documentation for more information.
   * 
   * @return {boolean} true if field contains a valid value given @VALIDATIONTYPE
   */
  TextBox_prototype.doValidate = function() {
    //always assume that an object's state begins as valid
    this.setValidationState(jsx3.gui.Form.STATEVALID);

    //first check if the text field can be null and whether or not it is null
    var vntValue = this.getValue();
    if (vntValue != null) vntValue = String(vntValue);
    
    var re = null;
    if (vntValue == null || jsx3.util.strTrim(vntValue) == "") {
      if (this.getRequired() == jsx3.gui.Form.REQUIRED)
        // this is a required field that is either returning null or an empty string
        this.setValidationState(jsx3.gui.Form.STATEINVALID);
    } else {
      //check if the developer has chosen to use a custom regular expression of their own
      var sre = this.getValidationExpression();

      //if no expression can be found, see if the user chose one of our pre-canned types
      if (sre == null) {
        //use a pre-canned expression
        re = TextBox.VALIDATION[this.getValidationType()];
      } else {
        //initialize the user's custom reg exp
        re = new RegExp(sre);
      }

      //perist whether or not this object passed its validation test
      this.setValidationState((vntValue.search(re) == 0) ? jsx3.gui.Form.STATEVALID : jsx3.gui.Form.STATEINVALID);
    }

    //return true/false for whether this item passed validation
    return this.getValidationState();
  };

  TextBox_prototype.onSetChild = function(objChild) {
    return false;
  };

  /**
   * call to designate an error or alert the user's attention to the textbox on-screen. Causes the textbox to 'flash/blink'
   */
  TextBox_prototype.beep = function() {
    jsx3.gui.shakeStyles(this.getRendered(), {backgroundColor: "#FFFF66"});
  };

  /**
   * Returns the current selection of this text box.
   * @return {Array<int>} <code>[startIndex, endIndex]</code>
   * @since 3.9.1
   */
  TextBox_prototype.getSelection = function() {
    var objGUI = this.getRendered();
    if (objGUI) {
      var sel = html.getSelection(objGUI);
      return [sel.getStartIndex(), sel.getEndIndex()];
    }
    return [0, 0];
  };

  /**
   * Sets the current selection of this text box. Pass no parameters to select the entire text.
   * @param intStart {int} the start index
   * @param intEnd {int} the end index
   * @since 3.9.1
   */
  TextBox_prototype.setSelection = function(intStart, intEnd) {
    var objGUI = this.getRendered();
    if (objGUI) {
      if (arguments.length == 0) {
        intStart = 0;
        intEnd = objGUI.value.length;
      }
      
      var sel = html.getSelection(objGUI);
      sel.setRange(intStart, intEnd)
    }
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  TextBox.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

  TextBox_prototype.emInit = function(objColumn) {
    this.jsxsupermix(objColumn);

    var eType = Interactive.JSXKEYDOWN;
    if (! this.hasEvent(eType))
      this.setEvent("1;", eType); // so that event is published
    this.subscribe(eType, this, "_emKeyDown");
  };

// @jsxobf-clobber-shared  _jsxformemwidth _jsxformemheight

  TextBox_prototype.emUpdateDisplay = function(objTdDim, objPaneDim) {
    if (this.getType() == TextBox.TYPETEXTAREA) {
      var width = isNaN(this._jsxformemwidth) ? objTdDim.W : Math.min(parseInt(this._jsxformemwidth), objTdDim.W);
      var height = isNaN(this._jsxformemheight) ? objTdDim.H : Math.min(parseInt(this._jsxformemheight), objPaneDim.H - objTdDim.T);
      this.setDimensions(objTdDim.L, objTdDim.T, width, height, true);
    } else {
      this.jsxsupermix(objTdDim, objPaneDim);
    }
  };

  TextBox_prototype.emGetValue = function() {
    var v1 = this.emGetSession().value;
    var v2 = this.getValue();
    // The textbox mask has the unique behavior of not causing a value to be committed if the value of the mask
    // is an empty string and the starting value was null.
    return (v1 === null && v2 === "") ? v1 : v2;
  };

  /** @private @jsxobf-clobber */
  TextBox_prototype._emKeyDown = function(objEvent) {
    var e = objEvent.context.objEVENT;
    var bCancel = false;
    if (!(e.hasModifier(true))) {
      var kc = e.keyCode();
      var bArrow = false;

      if (this.getType() == TextBox.TYPETEXTAREA) {
        bCancel = !e.shiftKey() && kc == Event.KEY_ENTER;
        bArrow = e.isArrowKey();
      } else {
        bArrow = kc == Event.KEY_ARROW_LEFT || kc == Event.KEY_ARROW_RIGHT;
      }

      if (!bCancel && bArrow) {
        var input = this.getRendered(e);
        var sel = html.getSelection(input);
        var value = input.value;
        var bPre = kc == Event.KEY_ARROW_LEFT || kc == Event.KEY_ARROW_UP;

        bCancel = (bPre && (sel.getStartIndex() > 0 || sel.getEndIndex() > 0)) ||
            (!bPre && (sel.getStartIndex() < value.length || sel.getEndIndex() < value.length));
      }
    }

    if (bCancel)
      e.cancelBubble();
  };

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.TextBox
 * @see jsx3.gui.TextBox
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.TextBox", -, null, function(){});
 */
jsx3.TextBox = jsx3.gui.TextBox;

/* @JSC :: end */
