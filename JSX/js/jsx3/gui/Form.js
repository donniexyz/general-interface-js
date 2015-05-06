/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Mixin interface. Contains methods and constants encapsulating the functionality of an HTML form control.
 */
jsx3.Class.defineInterface("jsx3.gui.Form", null, function(Form, Form_prototype) {

  var Event = jsx3.gui.Event;

  /**
   * {String} #a8a8b5 (default)
   */
  Form.DEFAULTDISABLEDCOLOR = "#a8a8b5";

  /**
   * {String} #d8d8e5 (default)
   */
  Form.DEFAULTDISABLEDBACKGROUNDCOLOR = "#d8d8e5";

  /**
   * {int} Value for the validation state field indicating that the value of the form field is invalid.
   * @final @jsxobf-final
   */
  Form.STATEINVALID = 0;

  /**
   * {int} Value for the validation state field indicating that the value of the form field is valid.
   * @final @jsxobf-final
   */
  Form.STATEVALID = 1;

  /**
   * {int} Value for the enabled field indicating that the form field is disabled.
   * @final @jsxobf-final
   */
  Form.STATEDISABLED = 0;

  /**
   * {int} Value for the enabled field indicating that the form field is enabled.
   * @final @jsxobf-final
   */
  Form.STATEENABLED = 1;

  /**
   * {int} Value for the required field indicating that the form field is optional.
   * @final @jsxobf-final
   */
  Form.OPTIONAL = 0;

  /**
   * {int} Value for the required field indicating that the form field is required.
   * @final @jsxobf-final
   */
  Form.REQUIRED = 1;

  /**
   * Binds the given key sequence to a callback function. Any object that has a key binding (specified with
   * <code>setKeyBinding()</code>) will call this method when painted to register the key sequence with an appropriate
   * ancestor of this form control. Any key down event that bubbles up to the ancestor without being intercepted
   * and matches the given key sequence will invoke the given callback function.
   * <p/>
   * <b>As of 3.2:</b> The hot key will be registered with the first ancestor found that is either a
   * <code>jsx3.gui.Window</code>, <code>a jsx3.gui.Dialog</code>, or the root block of a <code>jsx3.app.Server</code>.
   *
   * @param fctCallback {Function} JavaScript function to execute when the given sequence is keyed by the user.
   * @param strKeys {String} a plus-delimited ('+') key sequence such as <code>ctrl+s</code> or
   *   <code>ctrl+shift+alt+h</code> or <code>shift+a</code>, etc. Any combination of shift, ctrl, and alt are
   *   supported, including none. Also supported as the final token are <code>enter</code>, <code>esc</code>,
   *   <code>tab</code>, <code>del</code>, and <code>space</code>. To specify the final token as a key code, the
   *   last token can be the key code contained in brackets, <code>[13]</code>.
   * @return {jsx3.gui.HotKey} the registered hot key or <code>null</code> if <code>strKeys</code> is an invalid key 
   *   combination.
   * @see #setKeyBinding()
   */
  Form_prototype.doKeyBinding = function(fctCallback, strKeys) {
    //convert to an array for easier searching
    try {
      var objKey = jsx3.gui.HotKey.valueOf(strKeys, fctCallback);
      return this.getHotKeyContext().registerHotKey(objKey);
    } catch (e) {
      jsx3.util.Logger.getLogger(Form.jsxclass.getName()).error("Error binding key '" + strKeys + "' to " + 
          this + ": " + jsx3.NativeError.wrap(e));
      return null;
    }
  };

  /**
   * Returns the object that should register the hot key of this form control.
   * @private
   * @jsxobf-clobber
   */
  Form_prototype.getHotKeyContext = function() {
    var bWindow = jsx3.gui.Window != null;
    var bDialog = jsx3.gui.Dialog != null;

    var node = this;
    while (node != null) {
      // 1. hot keys register with an ancestor Window
      if (bWindow && node instanceof jsx3.gui.Window)
        return node.getRootBlock();

      // 2. hot keys register with an ancestor Dialog
      if (bDialog && node instanceof jsx3.gui.Dialog)
        return node;

      // 3. hot keys register with the Server
      var parent = node.getParent();
      if (parent == null)
        return node.getServer();

      node = parent;
    }

    return null;
  };

  /**
   * Returns the key binding that when keyed will fire the execute event for this control.
   * @return {String} plus-delimited (e.g.,'+') key sequence such as ctrl+s or ctrl+shift+alt+h or shift+a, etc
   * @see #doKeyBinding()
   */
  Form_prototype.getKeyBinding = function() {
    return (this.jsxkeycode == null) ? null : this.jsxkeycode;
  };

  /**
   * Sets the key binding that when keyed will fire the bound execute (<code>jsx3.gui.Interactive.EXECUTE</code>)
   * event for this control.
   * @param strSequence {String} plus-delimited (e.g.,'+') key sequence such as ctrl+s or ctrl+shift+alt+h or shift+a, etc
   * @return {jsx3.gui.Form} this object.
   * @see #doKeyBinding()
   */
  Form_prototype.setKeyBinding = function(strSequence) {
    this.jsxkeycode = strSequence;
    return this;
  };

  /**
   * Returns the background color of this control when it is disabled.
   * @return {String} valid CSS property value, (i.e., red, #ff0000)
   */
  Form_prototype.getDisabledBackgroundColor = function() {
    return this.jsxdisabledbgcolor;
  };

  /**
   * Sets the background color of this form control when it is disabled.
   * @param strColor {String} valid CSS property value, (i.e., red, #ff0000)
   * @return {jsx3.gui.Form} this object.
   */
  Form_prototype.setDisabledBackgroundColor = function(strColor) {
    this.jsxdisabledbgcolor = strColor;
    return this;
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  Form_prototype.paintBackgroundColor = function() {
    var bgc = this.getEnabled() != Form.STATEDISABLED ? this.getBackgroundColor() : this.getDisabledBackgroundColor();
    return bgc ? "background-color:" + bgc + ";" : "";
  };

  /**
   * Returns the font color to use when this control is disabled.
   * @return {String} valid CSS property value, (i.e., red, #ff0000)
   */
  Form_prototype.getDisabledColor = function() {
    return this.jsxdisabledcolor;
  };

  /**
   * Sets the font color to use when this control is disabled.
   * @param strColor {String} valid CSS property value, (i.e., red, #ff0000)
   * @return {jsx3.gui.Form} this object.
   */
  Form_prototype.setDisabledColor = function(strColor) {
    this.jsxdisabledcolor = strColor;
    return this;
  };

  /**
   * Returns the state for the form field control. If no enabled state is set, this method returns
   * <code>STATEENABLED</code>.
   * @return {int} <code>STATEDISABLED</code> or <code>STATEENABLED</code>.
   * @see #STATEDISABLED
   * @see #STATEENABLED
   */
  Form_prototype.getEnabled = function() {
    return (this.jsxenabled == null) ? Form.STATEENABLED : this.jsxenabled;
  };

  /**
   * Returns the value of this control.
   * @return  {Number|String}
   */
  Form_prototype.getValue = function() {
    return this.jsxvalue;
  };

  /**
   * Sets the value of this control.
   * @param vntValue {Number|String} string/int value for the component
   * @return {jsx3.gui.Form} this object.
   */
  Form_prototype.setValue = function(vntValue) {
    this.jsxvalue = vntValue;
    return this;
  };

  /**
   * Sets whether this control is enabled. Disabled controls do not respond to user interaction.
   * @param intEnabled {int} <code>STATEDISABLED</code> or <code>STATEENABLED</code>. <code>null</code> is
   *    equivalent to <code>STATEENABLED</code>.
   * @param bRepaint {boolean} if <code>true</code> this control is immediately repainted to reflect the new setting.
   */
  Form_prototype.setEnabled = function(intEnabled, bRepaint) {
    // repaint was causing flickering on ToolbarButton when setting a disabled button to disabled
    if (this.jsxenabled != intEnabled) {
      this.jsxenabled = intEnabled;
      if (bRepaint) this.repaint();
    }
    return this;
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  Form_prototype.paintColor = function() {
    if (this.getEnabled() != Form.STATEDISABLED) {
      var c = this.getColor();
      return c ? "color:" + c + ";" : "";
    } else {
      return "color:" + ((this.getDisabledColor()) ? this.getDisabledColor() : Form.DEFAULTDISABLEDCOLOR) + ";";
    }
  };

  /**
   * renders current enabled state for the check
   * @return {String} disabled='disabled' or ''
   * @private
   */
  Form_prototype.paintEnabled = function() {
    //3.2: updated to make xhtml compliant.  should still work in non-xhtml mode (as per current tests). should still be QA'd extensively, though
    return (this.getEnabled() == Form.STATEENABLED) ? '' : ' disabled="disabled" ';
  };

  /**
   * generates DHTML property value for tabIndex&#8212;called programmatically by paint methods for various GUI classes
   * @return {String} DHTML in form of tabIndex='n'
   * @private
   */
  Form_prototype.paintIndex = function() {
    return jsx3.gui.Block.prototype.paintIndex.call(this, this.getIndex() || Number(0));
  };

  Form_prototype.paintCursor = function(bForm) {
    var c = this.getCursor();

    if (!c && bForm)
      c = this.getEnabled() == jsx3.gui.Form.STATEENABLED ? "pointer" : "default";

    return c ? "cursor:" + c + ";" : "";
  };

  Form_prototype.paintName = function() {
    var n = this.getName();
    return n ? ' name="' + n + '"' : '';
  };

  /**
   * Returns whether or not this control is required. If the required property has never been set, this method returns
   * <code>OPTIONAL</code>.
   * @return {int} <code>REQUIRED</code> or <code>OPTIONAL</code>.
   * @see #REQUIRED
   * @see #OPTIONAL
   */
  Form_prototype.getRequired = function() {
    return (this.jsxrequired == null) ? Form.OPTIONAL : this.jsxrequired;
  };

  /**
   * Sets whether or not this control is required.
   * @param required {int} {int} <code>REQUIRED</code> or <code>OPTIONAL</code>.
   * @return {jsx3.gui.Form} this object.
   */
  Form_prototype.setRequired = function(required) {
    this.jsxrequired = required;
    return this;
  };

  /**
   * Returns the validation state of this control. If the validationState property has never been set, this method returns
   * <code>STATEVALID</code>.
   * @return {int} <code>STATEINVALID</code> or <code>STATEVALID</code>.
   * @see #STATEINVALID
   * @see #STATEVALID
   */
  Form_prototype.getValidationState = function() {
    return (this._jsxvalidationstate == null) ? Form.STATEVALID : this._jsxvalidationstate;
  };

  /**
   * Sets the validation state of this control. The validation state of a control is not serialized.
   * @param intState {int} <code>STATEINVALID</code> or <code>STATEVALID</code>.
   * @return {jsx3.gui.Form} this object.
   */
  Form_prototype.setValidationState = function(intState) {
    /* @jsxobf-clobber */
    this._jsxvalidationstate = intState;
    return this;
  };

  /**
   * Abstract method that must be implemented by any class that implements the Form interface.
   * @return {int} <code>STATEINVALID</code> or <code>STATEVALID</code>.
   */
  Form_prototype.doValidate = jsx3.Method.newAbstract();

  /**
   * Resets the validation state of this control.
   * @return {jsx3.gui.Form} this object.
   */
  Form_prototype.doReset = function() {
    this.setValidationState(Form.STATEVALID);
    return this;
  };

  /**
   * Returns the HTML ID of the native HTML input element contained in this control. Used for <label for="">.
   * @package
   */
  Form_prototype.getInputId = function() {
    return this.getId();
  };

  /**
   * Traverses the DOM branch starting at <code>objJSXContainer</code> and calls <code>doValidate()</code> on all nodes
   * of type <code>jsx3.gui.Form</code>. A custom function handler, <code>objHandler</code>, can be passed that will
   * be called once for each encountered form control.
   * @param objJSXContainer {jsx3.app.Model} JSX GUI object containing all form fields that need to be validated (recursive validation will start with this item and be applied to all descendants, not just direct children)
   * @param objHandler {Function} a JavaScript function (as object). This function will be passed two parameters: the object reference to the JSX Form object (textbox, selectbox, checkbox, etc) being validated as well as a constant denoting whether or not it validated (0 or 1)&#8212;1 meaning true
   * @return {int} <code>STATEINVALID</code> or <code>STATEVALID</code>.
   */
  Form.validate = function(objJSXContainer, objHandler) {
    var fields = objJSXContainer.getDescendantsOfType(jsx3.gui.Form);
    if (objJSXContainer.instanceOf(jsx3.gui.Form))
      fields.unshift(objJSXContainer);

    var state = Form.STATEVALID;
    for (var i = 0; i < fields.length; i++) {
      var aState = fields[i].doValidate();
      if (objHandler) objHandler(fields[i], aState);

      if (aState != Form.STATEVALID)
        state = aState;
    }

    return state;
  };

  /**
   * Traverses the DOM branch starting at <code>objJSXContainer</code> and calls <code>doReset()</code> on all nodes
   * of type <code>jsx3.gui.Form</code>.
   * @param objJSXContainer {jsx3.app.Model} JSX GUI object containing all form fields that need to be reset (the 'reset' process will start with this item and be applied to all descendants, not just direct children)
   * @see #doReset()
   */
  Form.reset = function(objJSXContainer) {
    var fields = objJSXContainer.getDescendantsOfType(jsx3.gui.Form);
    if (objJSXContainer.instanceOf(jsx3.gui.Form))
      fields.unshift(objJSXContainer);

    for (var i = 0; i < fields.length; i++)
      fields[i].doReset();
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Form.getVersion = function() {
    return "3.00.00";
  };

/* @JSC :: end */

  Form_prototype.emInit = function(objColumn) {
    if (this.emGetType() == jsx3.gui.Matrix.EditMask.NORMAL) {
      this.setRelativePosition(jsx3.gui.Block.ABSOLUTE, true);
      this.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
    }

    /* @jsxobf-clobber-shared */
    this._jsxformemwidth = this.getWidth();
    /* @jsxobf-clobber-shared */
    this._jsxformemheight = this.getHeight();
  };

  Form_prototype.emGetType = function() {
    return jsx3.gui.Matrix.EditMask.NORMAL;
  };

  Form_prototype.emPaintTemplate = function() {
    throw new jsx3.Exception("Not implemented.");
  };

  /** @package */
  Form_prototype.emGetTemplate = function(strEnabled, strDisabled) {
    // escape curly braces so that they are not evaluated as xpath
    strEnabled = strEnabled.replace(/\{/g, "{{").replace(/\}/g, "}}");
    strDisabled = strDisabled.replace(/\{/g, "{{").replace(/\}/g, "}}");

    return '<xsl:choose xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
        '<xsl:when test="@jsxnomask=\'1\'"></xsl:when>' +
        '<xsl:when test="@jsxdisabled=\'1\'">' + strDisabled + '</xsl:when>' +
        '<xsl:otherwise>' + strEnabled + '</xsl:otherwise>' +
        '</xsl:choose>';
  };

  Form_prototype.emBeginEdit = function(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD) {
    if (this.emGetType() == jsx3.gui.Matrix.EditMask.NORMAL) {
      this.setRelativePosition(jsx3.gui.Block.ABSOLUTE, true);
      this.emUpdateDisplay(objTdDim, objPaneDim);
      this.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
      this.setZIndex(10, true);
      this.focus();
      this.emFocus();
    }

    this.emSetValue(strValue);
  };

  Form_prototype.emEndEdit = function() {
    if (this.emGetType() == jsx3.gui.Matrix.EditMask.NORMAL) {
      this.emRestoreDisplay();
    }

    return this.emGetValue();
  };

  Form_prototype.emSetValue = function(strValue) {
    this.setValue(strValue);
  };

  Form_prototype.emGetValue = function() {
    var v = this.getValue();
    return v != null ? v.toString() : null;
  };

  Form_prototype.emUpdateDisplay = function(objTdDim, objPaneDim) {
    var width = isNaN(this._jsxformemwidth) ? objTdDim.W : Math.min(parseInt(this._jsxformemwidth), objTdDim.W);
    var height = isNaN(this._jsxformemheight) ? objTdDim.H : Math.min(parseInt(this._jsxformemheight), objTdDim.H);
    this.setDimensions(objTdDim.L, objTdDim.T, width, height, true);
  };

  Form_prototype.emRestoreDisplay = function() {
    this.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
//    var es = this.emGetSession();
//    this.setDimensions(null, null, es.width, es.height, false);
  };

  Form_prototype.emFocus = function() {
  };

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.Form
 * @see jsx3.gui.Form
 * @jsxdoc-definition  jsx3.Class.defineInterface("jsx3.Form", -, function(){});
 */
jsx3.Form = jsx3.gui.Form;

/* @JSC :: end */
