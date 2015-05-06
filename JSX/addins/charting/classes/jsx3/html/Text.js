/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Represents an HTML text node.
 * <p/>
 * This class is available only when the Charting add-in is enabled.
 */
jsx3.Class.defineClass("jsx3.html.Text", jsx3.html.Tag, null, function(Text, Text_prototype) {

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  /**
   * The instance initializer.
   * @param strText {String}
   */
  Text_prototype.init = function(strText) {
    /* @jsxobf-clobber */
    this._text = strText;
  };

  Text_prototype.paintToBuffer = function(buffer, index) {
    buffer[index] = this._text;
    return index + 1;
  };

  Text_prototype.getText = function() {
    return this._text;
  };

  Text_prototype.setText = function(strText) {
    this._text = strText;
  };

  Text_prototype.paint = function() {
    return this._text;
  };

/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {

  Text_prototype.init = function(strText) {
    /* @jsxobf-clobber-shared */
    this._native = document.createTextNode(strText != null ? strText : "");
  };

  Text_prototype.getText = function() {
    return this._native.nodeValue;
  };

  Text_prototype.setText = function(strText) {
    this._native.nodeValue = strText;
  };

/* @JSC */ }

  Text_prototype.onAppendChild = function( child ) {
    return false;
  };

  Text_prototype.toString = function() {
    return "[jsx3.html.Text \"" + this.getText() + "\"]";
  };

});
