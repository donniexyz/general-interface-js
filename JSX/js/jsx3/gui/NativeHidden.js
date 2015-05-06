/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Form", "jsx3.gui.Painted");

/**
 * The JSX version of a standard HTML hidden input field.
 *
 * @since 3.9
 */
jsx3.Class.defineClass("jsx3.gui.NativeHidden", jsx3.gui.Painted, [jsx3.gui.Form], function(NativeHidden, NativeHidden_prototype) {

  /**
   * Returns <code>STATEVALID</code>.
   *
   * @return {int} <code>jsx3.gui.Form.STATEVALID</code>.
   */
  NativeHidden_prototype.doValidate = function() {
    this.setValidationState(jsx3.gui.Form.STATEVALID);
    return this.getValidationState();
  };

  NativeHidden_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
  };

  NativeHidden_prototype.createBoxProfile = function(objImplicit) {
    return new jsx3.gui.Painted.Box(objImplicit);
  };

  NativeHidden_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    var strProps = this.renderAttributes(null, true);
    return '<input type="hidden" id="' + this.getId() + '"' + this.paintName() + this.paintValue() + strProps + '/>';
  };

  NativeHidden_prototype.paintValue = function() {
    var v = this.getValue();
    return v != null ? ' value="' + jsx3.util.strEscapeHTML(v) + '"' : '';
  };

  NativeHidden_prototype.setValue = function(strValue) {
    this.jsxvalue = strValue;

    var objGUI = this.getRendered();
    if (objGUI != null)
      objGUI.value = strValue;
    return this;
  };

  NativeHidden_prototype.onSetChild = function(objChild) {
    return false;
  };

});
