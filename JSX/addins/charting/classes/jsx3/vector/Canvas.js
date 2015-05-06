/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Represents a vector canvas in which vector shapes are painted.
 */
jsx3.Class.defineClass("jsx3.vector.Canvas", jsx3.html.BlockTag, null, function(Canvas, Canvas_prototype) {

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  /**
   * The instance initializer.
   * @param left {int} left position (in pixels) of the object relative to its parent container
   * @param top {int} top position (in pixels) of the object relative to its parent container
   * @param width {int} width (in pixels) of the object
   * @param height {int} height (in pixels) of the object
   */
  Canvas_prototype.init = function(left, top, width, height) {
    this.jsxsuper(jsx3.vector.TAGNS, "group", left, top, width, height);
    this.setProperty("xmlns:v", "urn:schemas-microsoft-com:vml");
  };

  Canvas_prototype.paintUpdate = function() {
    this.jsxsuper();    
    
    if (this.getWidth() && this.getHeight()) {
      this.setProperty("coordsize", jsx3.vector.toVector2D(parseInt(this.getWidth()), parseInt(this.getHeight())));
    } else {
      this.setProperty("coordsize", jsx3.vector.toVector2D(100, 100));
    }

    // NOTE: this is not to the HTML spec, rather the GI spec
    if (this.getPosition() != "absolute") {
      this.setLeft(null);
      this.setTop(null);
    }
  };

/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {

  Canvas_prototype.init = function(left, top, width, height) {
    this.jsxsuper(jsx3.vector.TAGNS, "svg", left, top, width, height);
    this.setProperty("version", "1.1",
                     "baseProfile", "full",
                     "xmlns:xlink", "http://www.w3.org/1999/xlink");
  };

  Canvas_prototype.paintUpdate = function() {
    this.jsxsuper();    
    
    if (this._defs != null && this._defs.getParent() == null)
      this.appendChild(this._defs);

    // NOTE: this is not to the HTML spec, rather the GI spec
    if (this.getPosition() != "absolute") {
      this.setLeft(null);
      this.setTop(null);
    }
  };

  Canvas_prototype.getDefs = function() {
    if (this._defs == null) {
      /* @jsxobf-clobber */
      this._defs = new jsx3.html.Tag(jsx3.vector.TAGNS, "defs");
      this.appendChild(this._defs);
    }
    return this._defs;
  };

  Canvas_prototype.setWidth = function( width ) {
    this.jsxsuper(width);
    this.setProperty("width", typeof(width) == "number" ? width + "px" : width);
  };

  Canvas_prototype.setHeight = function( height ) {
    this.jsxsuper(height);
    this.setProperty("height", typeof(height) == "number" ? height + "px" : height);
  };

/* @JSC */ }

});
