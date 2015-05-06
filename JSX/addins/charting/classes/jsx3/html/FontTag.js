/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Represents an HTML element that defines font styles.
 * <p/>
 * This class is available only when the Charting add-in is enabled.
 */
jsx3.Class.defineInterface("jsx3.html.FontTag", null, function(FontTag, FontTag_prototype) {

  /**
   * Returns the fontFamily field.
   * @return {String} fontFamily
   */
  FontTag_prototype.getFontFamily = function() {
    return this.getStyle("fontFamily");
  };

  /**
   * Sets the fontFamily field.
   * @param fontFamily {String} the new value for fontFamily
   */
  FontTag_prototype.setFontFamily = function( fontFamily ) {
    this.setStyle("fontFamily", fontFamily);
  };

  /**
   * Returns the fontsize field.
   * @return {String} fontsize
   */
  FontTag_prototype.getFontSize = function() {
    return this.getStyle("fontSize");
  };

  /**
   * Sets the fontsize field.
   * @param fontSize {int|String} the new value for fontsize
   */
  FontTag_prototype.setFontSize = function( fontSize ) {
    this.setStyle("fontSize", isNaN(fontSize) ? fontSize : fontSize + "px");
  };

  /**
   * Returns the fontStyle field.
   * @return {String} fontStyle
   */
  FontTag_prototype.getFontStyle = function() {
    return this.getStyle("fontStyle");
  };

  /**
   * Sets the fontStyle field.
   * @param fontStyle {String} the new value for fontStyle
   */
  FontTag_prototype.setFontStyle = function( fontStyle ) {
    this.setStyle("fontStyle", fontStyle);
  };

  /**
   * Returns the fontWeight field.
   * @return {String} fontWeight
   */
  FontTag_prototype.getFontWeight = function() {
    return this.getStyle("fontWeight");
  };

  /**
   * Sets the fontWeight field.
   * @param fontWeight {String} the new value for fontWeight
   */
  FontTag_prototype.setFontWeight = function( fontWeight ) {
    this.setStyle("fontWeight", fontWeight);
  };

  /**
   * Returns the textAlign field.
   * @return {String} textAlign
   */
  FontTag_prototype.getTextAlign = function() {
    return this.getStyle("textAlign");
  };

  /**
   * Sets the textAlign field.
   * @param textAlign {String} the new value for textAlign
   */
  FontTag_prototype.setTextAlign = function( textAlign ) {
    this.setStyle("textAlign", textAlign);
  };

  /**
   * Returns the textDecoration field.
   * @return {String} textDecoration
   */
  FontTag_prototype.getTextDecoration = function() {
    return this.getStyle("textDecoration");
  };

  /**
   * Sets the textDecoration field.
   * @param textDecoration {String} the new value for textDecoration
   */
  FontTag_prototype.setTextDecoration = function( textDecoration ) {
    this.setStyle("textDecoration", textDecoration);
  };

  /**
   * Returns the color field.
   * @return {String} color
   */
  FontTag_prototype.getColor = function() {
    return this.getStyle("color");
  };

  /**
   * Sets the color field.
   * @param color {String} the new value for color
   */
  FontTag_prototype.setColor = function( color ) {
    this.setStyle("color", color);
  };

});
