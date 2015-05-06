/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _fill _stroke
/**
 * Renders text along an arbitrary line.
 */
jsx3.Class.defineClass("jsx3.vector.TextLine", jsx3.vector.BaseShape, [jsx3.html.FontTag], function(TextLine, TextLine_prototype) {

  var Tag = jsx3.html.Tag;
  var Browser = jsx3.app.Browser;
  var vector = jsx3.vector;
  
/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  /**
   * The instance initializer.
   * @param x1 {int}
   * @param y1 {int}
   * @param x2 {int}
   * @param y2 {int}
   * @param text {String} the text to display on the text path
   */
  TextLine_prototype.init = function(x1, y1, x2, y2, text) {
    var w = Math.max(1, Math.max(x1, x2) - Math.min(x1, x2));
    var h = Math.max(1, Math.max(y1, y2) - Math.min(y1, y2));
    //call constructor for super class
    this.jsxsuper(null, x1, y1, w, h);
    
    this.setProperty("path", "m 0 0 l " + (x2-x1) + " " + (y2-y1));
    
    /* @jsxobf-clobber */
    this._textpath = new Tag(vector.TAGNS, "textpath");
    this._textpath.setProperty("on", "true");
    
    /* @jsxobf-clobber */
    this._path = new Tag(vector.TAGNS, "path");
    this._path.setProperty("textpathok", "true");

    /* @jsxobf-clobber */
    this._textstroke = new Tag(vector.TAGNS, "stroke");
    this._textstroke.setProperty("on", "false");
    
    this.setText(text);
  };
  
  var _textpath = "_textpath";
  var fontTagMethods = jsx3.html.FontTag.jsxclass.getInstanceMethods();
  for (var i = 0; i < fontTagMethods.length; i++) {
    var method = fontTagMethods[i];
    TextLine_prototype[method.getName()] = 
        new Function('return jsx3.html.FontTag.prototype.' + method.getName() + '.apply(this.'+_textpath+', arguments);');
  }
  var tagMethods = ["getClassName", "setClassName", "setExtraStyles", "setExtraStyles"];
  for (var i = 0; i < tagMethods.length; i++) {
    TextLine_prototype[tagMethods[i]] = 
        new Function('return jsx3.html.Tag.prototype.' + tagMethods[i] + '.apply(this.'+_textpath+', arguments);');
  }
  
  TextLine_prototype.setColor = function(strColor) {
    if (strColor != null && strColor != "")
      this.setFill(new vector.Fill(strColor));
    this._textpath.setStyle("color", strColor);
  };

  TextLine_prototype.getTextAlign = function() {
    return this._textpath.getStyle("v-text-align");
  };

  TextLine_prototype.setTextAlign = function(strAlign) {
    this._textpath.setStyle("v-text-align", strAlign);
  };

  /**
   * Returns the text field.
   * @return {String} text
   */
  TextLine_prototype.getText = function() {
    return this._textpath.getProperty("string");
  };

  /**
   * Sets the text field, the text to display on the text path.
   * @param text {String} the new value for text
   */
  TextLine_prototype.setText = function( text ) {
    this._textpath.setProperty("string", text);
  };

  TextLine_prototype.onAppendChild = function( child ) {
    var tagName = child.getTagName();
    return this.jsxsuper(child) || tagName == "path" || tagName == "textpath" || tagName == "stroke";
  };
  
  /** 
   * custom paint logic needed to render a vector shape
   * @package
   */
  TextLine_prototype.paintUpdate = function() {
    // font color can't be set by css class or color, must be a fill    
    var style = null;
    if (this.getFill() == null) {
      var color = this.getColor();
      if (! color) {
        if (style == null)
          style = Browser.getStyleClass("." + this.getClassName()) || Number(0);
        if (style) color = style.color;
      }
      this.setFill(new vector.Fill(color || "#000000"));
    }
    
    // change text-align to v-text-align
    if (! this.getTextAlign()) {
      var textAlign = this._textpath.getStyle("textAlign");
      if (textAlign == null) {
        if (style == null)
          style = Browser.getStyleClass("." + this.getClassName()) || Number(0);
        if (style) textAlign = style.textAlign;
      }
      if (textAlign)
        this.setTextAlign(textAlign);
    }
    
    this.jsxsuper();

    // filled is on by VML default
    this.setProperty("filled", this.getFill() == null ? "false" : "true",
                     "stroked", this.getStroke() == null ? null : "true");
    
    if (this._textpath.getParent() == null)
      this.appendChild(this._textpath);
    if (this._path.getParent() == null)
      this.appendChild(this._path);
    
    // stroke needs to be explicitly off
    if (this.getStroke() == null) {
      if (this._textstroke.getParent() == null)
        this.appendChild(this._textstroke);
    } else {
      this.removeChild(this._textstroke);
    }    
  };
  
/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {

  TextLine_prototype.init = function(x1, y1, x2, y2, text) {
    /* @jsxobf-clobber */
    this._x1 = x1;
    /* @jsxobf-clobber */
    this._y1 = y1;
    /* @jsxobf-clobber */
    this._x2 = x2;
    /* @jsxobf-clobber */
    this._y2 = y2;
    
    var w = Math.max(1, Math.max(x1, x2) - Math.min(x1, x2));
    var h = Math.max(1, Math.max(y1, y2) - Math.min(y1, y2));
    //call constructor for super class
    this.jsxsuper("text", null, null, w, h);
    
    var angle = 0;
    var hypo = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
    if (y1 >= y2) {
      angle = 360 - Math.round(Math.acos((x2-x1)/hypo) * 180 / Math.PI);
    } else {
      angle = Math.round(Math.acos((x2-x1)/hypo) * 180 / Math.PI);
    }
    /* @jsxobf-clobber */
    this._angle = angle % 360;
    
    /* @jsxobf-clobber */
    this._text = new jsx3.html.Text(text);
  };

  TextLine_prototype.getText = function() {
    return this._text.getText();
  };

  TextLine_prototype.setText = function( text ) {
    this._text.setText(text);
  };
  
  TextLine_prototype.paintUpdate = function() {
    if (! this.getProperty("fill")) {
      if (this._fill) {
        this.setProperty("fill", this._fill.getColorHtml(),
                         "fill-opacity", this._fill.getAlpha());
      } else {
        var style = Browser.getStyleClass("." + this.getClassName()) || Number(0);
        if (style && style.color != null) {
          this.setProperty("fill", style.color);
        } else {
          this.removeProperty("fill", "fill-opacity");
        }
      }
    }

    if (this._stroke != null) {
      var width = this._stroke.getWidth();
      this.setProperty("stroke", this._stroke.getColorHtml(),
                       "stroke-width", width || Number(1));
    } else {
      this.removeProperty("stroke", "stroke-width");
    }
    
    // fix offset from line to match the VML implementation
    var fontSize = this.getFontSize();
    if (fontSize == null) {
      var style = Browser.getStyleClass("." + this.getClassName());
      if (style != null)
        fontSize = style.fontSize;
    }
    this.setProperty("dy", fontSize ? Math.floor(parseInt(fontSize)/2.5) : 0);
    
    // fix text alignment
    var textAlign = this.getTextAlign();
    if (! textAlign) {
      var style = Browser.getStyleClass("." + this.getClassName());
      if (style != null)
        textAlign = style.textAlign;
    }
    
    var x = null, y = null, anchor = null;
    if (textAlign == "left") {
      anchor = "start";
      x = this._x1;
      y = this._y1;
    } else if (textAlign == "right") {
      anchor = "end";
      x = this._x2;
      y = this._y2;      
    } else {
      anchor = "middle";
      x = Math.round((this._x2+this._x1)/2);
      y = Math.round((this._y2+this._y1)/2);
    } 
    this.setProperty("text-anchor", anchor,
                     "x", x,
                     "y", y);
    
    if (this._angle > 0)
      this.setProperty("transform", "rotate(" + this._angle + "," + x + "," + y + ")");
    else
      this.removeProperty("transform");
    
    if (this._text.getParent() == null)
      this.appendChild(this._text);
  };  
  
  TextLine_prototype.getFontFamily = function() { return this.getProperty("font-family"); };
  TextLine_prototype.setFontFamily = function( fontFamily ) { this.setProperty("font-family", fontFamily); };
  TextLine_prototype.getFontStyle = function() { return this.getProperty("font-style"); };
  TextLine_prototype.setFontStyle = function( fontStyle ) { this.setProperty("font-style", fontStyle); };
  TextLine_prototype.getFontWeight = function() { return this.getProperty("font-weight"); };
  TextLine_prototype.setFontWeight = function( fontWeight ) { this.setProperty("font-weight", fontWeight); };
  TextLine_prototype.getTextDecoration = function() { return this.getProperty("text-decoration"); };
  TextLine_prototype.setTextDecoration = function( textDecoration ) { this.setProperty("text-decoration", textDecoration); };
  TextLine_prototype.getColor = function() { return this.getProperty("fill"); };
  TextLine_prototype.setColor = function( color ) { this.setProperty("fill", color); };
  
  TextLine_prototype.onAppendChild = function( child ) {
    return child instanceof jsx3.html.Text;
  };
    
/* @JSC */ }

});
