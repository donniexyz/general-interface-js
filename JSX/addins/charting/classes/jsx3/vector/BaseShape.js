/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _on
/**
 * A vector tag that can have fill and stroke. The base class for several other vector classes.
 *
 * @abstract
 */
jsx3.Class.defineClass("jsx3.vector.BaseShape", jsx3.vector.Tag, null, function(Shape, Shape_prototype) {

  var Tag = jsx3.html.Tag;
  var vector = jsx3.vector;
  
  /**
   * The instance initializer.
   * @param strTagName {String}
   * @param left {int} left position (in pixels) of the object relative to its parent container
   * @param top {int} top position (in pixels) of the object relative to its parent container
   * @param width {int} width (in pixels) of the object
   * @param height {int} height (in pixels) of the object
   */
  Shape_prototype.init = function(strTagName, left, top, width, height) {
    //call constructor for super class
    this.jsxsuper(strTagName != null ? strTagName : Shape._TAGNAME, left, top, width, height);

    // not quite children, we'll store these as properties so that rendering can be as efficient
    // as possible
    /* @jsxobf-clobber-shared */
    this._fill = null;
    /* @jsxobf-clobber-shared */
    this._stroke = null;
  };

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  Shape._TAGNAME = "shape";

  /**
   * custom paint logic needed to render a vector shape
   * @package
   */
  Shape_prototype.paintUpdate = function() {
    var children = this.getChildren().concat();
    for (var i = 0; i < children.length; i++)
      if (typeof(children[i]) == "string")
        this.removeChild(children[i]);

    this.jsxsuper();

    // filled is on by VML default
    this.setProperty("filled", this.getFill() == null ? "false" : null,
    // stroked is on by VML default
                     "stroked", this.getStroke() == null ? "false" : null);

    // inline the fill if possible
    if (this._fill != null) {
      if (this._fill.canInline()) {
        this.setProperty("filled", this._fill._on != null ? (this._fill._on ? "true" : "false") : null,
                         "fillcolor", this._fill.getColorHtml());
      } else {
        this.removeProperty("filled", "fillcolor");
        this.appendChild(this._fill.paint());
      }
    }

    // inline the stroke if possible
    if (this._stroke != null) {
      if (this._stroke.canInline()) {
        var width = this._stroke.getWidth();
        this.setProperty("stroked", this._stroke._on != null ? (this._stroke._on ? "true" : "false") : null,
                         "strokecolor", this._stroke.getColorHtml(),
                         "strokeweight", width != null ? vector.toUnit(width) : null);
      } else {
        this.removeProperty("stroked", "strokecolor", "strokeweight");
        this.appendChild(this._stroke.paint());
      }
    }
  };

/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {

  Shape._TAGNAME = "path";

  Shape_prototype.paintUpdate = function() {
    this.jsxsuper();

    if (this._fill != null) {
      if (this._fill.hasGradient()) {
        // get the first explicit id
        var node = this;
        var id;
        while (!(id = node.getId()))
          node = node.getParent();
        var gradientId = "grad_" + id;

        // remove gradient from DOM if already part of it
        if (this._gradient != null && this._gradient.getParent() != null)
          this._gradient.getParent().removeChild(this._gradient);

        this.setProperty("fill", "url(#" + gradientId + ")");
        this.removeProperty("fill-opacity");

        /* @jsxobf-clobber */
        this._gradient = new Tag(vector.TAGNS, "linearGradient");
        this._gradient.setId(gradientId);

        // figure out gradient vector according to VML angle
        var degrees = this._fill.getAngle() || Number(0);
        var radians = jsx3.util.numMod((2 * Math.PI / 360 * (-1 * degrees - 90)), (2 * Math.PI));
        var cos = Math.cos(radians);
        var sin = Math.sin(radians);
        var max = Math.max(Math.abs(cos), Math.abs(sin));
        sin /= max; cos /= max; // normalize so larger one is 1 or -1
        this._gradient.setProperty("x1", jsx3.util.numRound(0.5 - cos/2, 0.0001),
                                   "y1", jsx3.util.numRound(0.5 - sin/2, 0.0001),
                                   "x2", jsx3.util.numRound(0.5 + cos/2, 0.0001),
                                   "y2", jsx3.util.numRound(0.5 + sin/2, 0.0001));
        // reverse rotation transform to be compatible with VML
        var rotation = this.getRotation();
        if (rotation)
          this._gradient.setProperty("gradientTransform", "rotate(" + (-rotation) + ")");

        var c1 = new Tag(vector.TAGNS, "stop");
        c1.setProperty("offset", "0%",
                       "stop-color", this._fill.getColorHtml(),
                       "stop-opacity", this._fill.getAlpha());
        this._gradient.appendChild(c1);

        var colors = this._fill.getColors();
        if (colors) {
          var stops = colors.split(/\s*,\s*/);
          for (var i = 0; i < stops.length; i++) {
            var tokens = jsx3.util.strTrim(stops[i]).split(/\s+/, 2);
            if (tokens.length == 2) {
              var percent = parseInt(tokens[0]);
              if (! isNaN(percent)) {
                var cn = new Tag(vector.TAGNS, "stop");
                cn.setProperty("offset", percent + "%",
                               "stop-color", tokens[1]);
                this._gradient.appendChild(cn);
              }
            }
          }
        }
        var cx = new Tag(vector.TAGNS, "stop");
        cx.setProperty("offset", "100%",
                       "stop-color", this._fill.getColor2Html(),
                       "stop-opacity", this._fill.getAlpha2() != null ? this._fill.getAlpha2() : 1);
        this._gradient.appendChild(cx);

        this.getDefs().appendChild(this._gradient);
      } else {
        this.setProperty("fill", this._fill.getColorHtml(),
                         "fill-opacity", this._fill.getAlpha());
      }
    } else {
      this.setProperty("fill", "none");
      this.removeProperty("fill-opacity");

      if (this._gradient != null && this._gradient.getParent() != null)
        this._gradient.getParent().removeChild(this._gradient);
    }

    if (this._stroke != null) {
      var width = this._stroke.getWidth();
      this.setProperty("stroke", this._stroke.getColorHtml(),
                       "stroke-width", width || Number(1),
                       "stroke-opacity", this._stroke.getAlpha());
    } else {
      this.setProperty("stroke", "none");
      this.removeProperty("stroke-width", "stroke-opacity");
    }

    var transform = [];
    var l = this.getLeft() || Number(0);
    var t = this.getTop() || Number(0);
    if (l || t) transform.push("translate(" + l + "," + t + ")");
    var rotation = this.getRotation();
    if (rotation) transform.push("rotate(" + rotation + "," + Math.round(this.getWidth()/2) + "," +
        Math.round(this.getHeight()/2)  + ")");

    this.setProperty("transform", transform.length > 0 ? transform.join(" ") : null);
  };

/* @JSC */ }

  // veto invalid children of this tag
  Shape_prototype.onAppendChild = function( child ) {
    return child instanceof vector.TextLine ||
           child instanceof vector.Fill ||
           child instanceof vector.Stroke || typeof(child) == "string";
  };

  /**
   * Sets the fill of this shape, other fills may be present as children of this instance.
   * @param fill {jsx3.vector.Fill} the fill value.
   */
  Shape_prototype.setFill = function( fill ) {
    this._fill = fill;
  };

  /**
   * Sets the stroke of this shape, other strokes may be present as children of this instance.
   * @param stroke {jsx3.vector.Stroke} the stroke value.
   */
  Shape_prototype.setStroke = function( stroke ) {
    this._stroke = stroke;
  };

  /**
   * Returns the fill of this shape.
   */
  Shape_prototype.getFill = function() {
    return this._fill;
  };

  /**
   * Returns the stroke of this shape.
   */
  Shape_prototype.getStroke = function() {
    return this._stroke;
  };

});
