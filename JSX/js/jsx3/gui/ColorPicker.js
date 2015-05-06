/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Block", "jsx3.gui.Form");

/**
 * A GUI class that allows the user to pick a color using an HSB (hue-saturation-brightness) picker.
 *
 * @since 3.2
 */
jsx3.Class.defineClass("jsx3.gui.ColorPicker", jsx3.gui.Block, [jsx3.gui.Form],
    function(ColorPicker, ColorPicker_prototype) {

  var Interactive = jsx3.gui.Interactive;
  var Block = jsx3.gui.Block;
  var Event = jsx3.gui.Event;
  var html = jsx3.html;
  var selectSingleElm = html.selectSingleElm;

  /** {int} The default rendered width of this control if no width is specified. */
  ColorPicker.DEFAULT_WIDTH = 324;
  /** {int} The default rendered height of this control if no height is specified. */
  ColorPicker.DEFAULT_HEIGHT = 300;

  /**
   * {int} Value for the axis property indicating a hue axis.
   * @final @jsxobf-final
   */
  ColorPicker.HUE = 1;

  /** 
   * {int} Value for the axis property indicating a saturation axis.
   * @final @jsxobf-final
   */
  ColorPicker.SATURATION = 2;

  /**
   * {int} Value for the axis property indicating a brightness axis.
   * @final @jsxobf-final
   */
  ColorPicker.BRIGHTNESS = 3;

  /** @private @jsxobf-clobber */
  ColorPicker._AXIS_WIDTH = 16;
  /** @private @jsxobf-clobber */
  ColorPicker._AXIS_PADDING = 8;
  /** @private @jsxobf-clobber */
  ColorPicker._1D_H = 9;
  /** @private @jsxobf-clobber */
  ColorPicker._2D_D = 9;

  var imagePrefix = "jsx:///images/colorpicker/";
  /** @private @jsxobf-clobber */
  ColorPicker._IMAGES = {
    _drag: jsx3.resolveURI(imagePrefix + "d1arrow.gif"),
    _1_v: jsx3.resolveURI(imagePrefix + "hue-v.png"),
    _1_h: jsx3.resolveURI(imagePrefix + "hue-h.png"),
    _2_v: jsx3.resolveURI(imagePrefix + "saturation-v.png"),
    _2_h: jsx3.resolveURI(imagePrefix + "saturation-h.png"),
    _3_v: jsx3.resolveURI(imagePrefix + "brightness-v.png")
  };

/* @JSC */ if (jsx3.CLASS_LOADER.IE6) {        
  for (var f in ColorPicker._IMAGES)
    html.loadImages(ColorPicker._IMAGES[f]);
/* @JSC */ }
  /**
   * The instance initializer.
   * @param strName {String} 
   * @param vntLeft {int|String} 
   * @param vntTop {int|String} 
   * @param vntWidth {int} 
   * @param vntHeight {int} 
   */
  ColorPicker_prototype.init = function(strName, vntLeft, vntTop, vntWidth, vntHeight) {
    this.jsxsuper(strName, vntLeft, vntTop, vntWidth, vntHeight);
    this.jsxrgb = 0xFF0000; // red
    this.jsxaxis = ColorPicker.HUE;
  };

  /**
   * Returns the RGB value of the currently selected color as an integer. The return value is
   * a 24-bit number of the form <code>0xRRGGBB</code>.
   * @return {int}
   */
  ColorPicker_prototype.getValue = function() {
    return this.jsxrgb;
  };

  /**
   * Sets the RGB value of this color picker.
   * @param strValue {int|String} the supported formats are: RGB integer value as number or string and HTML hex
   *    code, <code>"#000000"</code>.
   */
  ColorPicker_prototype.setValue = function(strValue) {
    var intValue = parseInt(strValue);
    if (!isNaN(intValue)) {
      this.setRGB(intValue);
    } else if (typeof(strValue) == "string") {
      if (strValue.indexOf("#") == 0)
        strValue = strValue.substring(1);
      intValue = parseInt("0x" + strValue);
      if (!isNaN(intValue))
        this.setRGB(intValue);
      else
        this.setRGB(0);
    } else {
      this.setRGB(0);
    }
  };

  /**
   * @return {int} always <code>jsx3.gui.Form.STATEVALID</code>.
   */
  ColorPicker_prototype.doValidate = function() {
    var state = jsx3.gui.Form.STATEVALID;
    this.setValidationState(state);
    return state;
  };

  /**
   * Returns the RGB value of the currently selected color as an integer. The return value is 
   * a 24-bit number of the form <code>0xRRGGBB</code>.
   * @return {int}
   */
  ColorPicker_prototype.getRGB = function() {
    return this.jsxrgb;
  };
  
  // only used by the Properties palette in Builder (the grid does not support property formatters).
  ColorPicker_prototype.getRgbAsHex = function() {
    return "0x" + (0x1000000 + (this.jsxrgb || Number(0))).toString(16).substring(1).toUpperCase();
  };

  /**
   * Sets the currently selected color by RGB. The view is updated to reflect the change in value.
   * @param rgb {int} a 24-bit integer of the form <code>0xRRGGBB</code>.
   */
  ColorPicker_prototype.setRGB = function(rgb) {
    this.jsxrgb = Math.max(0, Math.min(rgb, 0xFFFFFF));
    this._updateDisplayedColor(true, true);
  };

  /**
   * @return {int} <code>HUE</code>, <code>SATURATION</code>, or <code>BRIGHTNESS</code>.
   */
  ColorPicker_prototype.getAxis = function() {
    return this.jsxaxis || ColorPicker.HUE;
  };

  /**
   * Sets the color axis shown on the right side of the control. The other two axes are displayed in a box on the
   * left side.
   * @param intAxis {int} <code>HUE</code>, <code>SATURATION</code>, or <code>BRIGHTNESS</code>.
   * @return {jsx3.gui.ColorPicker}
   * @see #HUE
   * @see #SATURATION
   * @see #BRIGHTNESS
   */
  ColorPicker_prototype.setAxis = function(intAxis) {
    this.jsxaxis = intAxis;
    this.setBoxDirty();
    return this;
  };

  /**
   * Sets the currently selected color by HSB components.
   * @param h {float} The hue component, <code>[0.0, 1.0]</code>.
   * @param s {float} The saturation component, <code>[0.0, 1.0]</code>.
   * @param b {float} The brightness component, <code>[0.0, 1.0]</code>.
   */
  ColorPicker_prototype.setHSB = function(h, s, b) {
    var rgb = ColorPicker.HSBtoRGB(h, s, b);
    this.jsxrgb = (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
    this._updateDisplayedColor(true, true, [h, s, b]);
  };

  /**
   * Returns the HTML to render this control.
   * @return {String}
   */
  ColorPicker_prototype.paint = function() {
    this.applyDynamicProperties();

    var hsb = ColorPicker.RGBtoHSB(this.jsxrgb);
    var hueRGB = ColorPicker.HSBtoRGB(hsb[0], 1, 1);
    var hueBGColor = "#" + ColorPicker.RGBtoHex(hueRGB[0], hueRGB[1], hueRGB[2]);
    var strAttributes = this.renderAttributes(null, false);
    var axis = this.getAxis();

    var b1 = this.getBoxProfile(true);
    b1.setAttributes('id="' + this.getId() + '" class="jsx30colorpicker" ' +
                      this.paintIndex() + this.paintTip() + this.paintLabel() + strAttributes + html._UNSEL);
    b1.setStyles(this.paintZIndex() + this.paintVisibility() + this.paintDisplay());

    var b1i = b1.getChildProfile(0);

    // get the 2D and 1D selector boxes
    var b1a = b1i.getChildProfile(0);
    b1a.setAttributes(this.renderHandler(Event.MOUSEDOWN, "_eb2DMouseDown", 2) + html._UNSEL);
    var b1b = b1i.getChildProfile(1);
    b1b.setAttributes(this.renderHandler(Event.MOUSEDOWN, "_eb1DMouseDown", 2) + html._UNSEL);

    var d2html = "", d1html = "";

    var d1w = b1b.getClientWidth(), d1h = b1b.getClientHeight();
    var d2w = b1a.getClientWidth(), d2h = b1a.getClientHeight();

    var spanStart = '<span' + html._UNSEL + ' class="gradient" style="width:';

    // 1. paint hue
    if (axis == ColorPicker.HUE) {
      d2html += spanStart + d2w + 'px;height:' + d2h + 'px;background-color:' + hueBGColor + ';"></span>';
      d1html += this._paintGradientImage(ColorPicker._IMAGES["_1_v"], d1w, d1h);
    } else {
      d2html += this._paintGradientImage(ColorPicker._IMAGES["_1_h"], d2w, d2h);
      d1html += spanStart + d1w + 'px;height:' + d1h + 'px;background-color:' + hueBGColor + ';"></span>';
    }
    // 2. paint saturation
    if (axis == ColorPicker.SATURATION) {
      d2html += spanStart + d2w + 'px;height:' + d2h + 'px;background-color:#FFFFFF;' +
              html.getCSSOpacity(1 - hsb[1]) + '"></span>';
      d1html += this._paintGradientImage(ColorPicker._IMAGES["_2_v"], d1w, d1h);
    } else {
      d2html += this._paintGradientImage(ColorPicker._IMAGES[axis == ColorPicker.HUE ? "_2_h" : "_2_v"],
          d2w, d2h);
      d1html += spanStart + d1w + 'px;height:' + d1h + 'px;background-color:#FFFFFF;' +
              html.getCSSOpacity(1 - hsb[1]) + '"></span>';
    }
    // 3. paint brightness
    if (axis == ColorPicker.BRIGHTNESS) {
      d2html += spanStart + d2w + 'px;height:' + d2h + 'px;background-color:#000000;' +
              html.getCSSOpacity(1 - hsb[2]) + '"></span>';
      d1html += this._paintGradientImage(ColorPicker._IMAGES["_3_v"], d1w, d1h);
    } else {
      d2html += this._paintGradientImage(ColorPicker._IMAGES["_3_v"], d2w, d2h);
      d1html += spanStart + d1w + 'px;height:' + d1h + 'px;background-color:#000000;' +
              html.getCSSOpacity(1 - hsb[2]) + '"></span>';
    }

    // HACK: for Fx unselectable to work ...
    d2html += spanStart + d2w + 'px;height:' + d2h + 'px;">&#160;</span>';
    d1html += spanStart + d1w + 'px;height:' + d1h + 'px;">&#160;</span>';

    var b1a1 = b1a.getChildProfile(0);
    d2html += b1a1.paint().join(b1a1.getChildProfile(0).paint().join(""));

    var b1c = b1i.getChildProfile(2);
    b1c.setAttributes(this.renderHandler(Event.MOUSEDOWN, "_eb1DMouseDownPt", 2) + html._UNSEL);

    return b1.paint().join(b1i.paint().join(b1a.paint().join(d2html) + b1b.paint().join(d1html) +
        b1c.paint().join('<img src="' + ColorPicker._IMAGES["_drag"] + '" width="6" height="9" alt="' + this._getLocaleProp("handle", ColorPicker) + '"/>' +
                spanStart + '6px;height:9px;">&#160;</span>') + "&#160;"));
  };

  ColorPicker_prototype.createBoxProfile = function(objImplicit) {
    var Box = jsx3.gui.Painted.Box;

    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if (this.getParent() && (objImplicit == null || ((isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if(objImplicit == null) {
      objImplicit = {};
    }

    var bRelative = this.getRelativePosition() != jsx3.gui.Block.ABSOLUTE;
    var myLeft = (bRelative) ? null : this.getLeft();
    var myTop = (bRelative) ? null : this.getTop();

    var hsb = ColorPicker.RGBtoHSB(this.jsxrgb);
    var axisValues = this._transformAxisValues(hsb);

    // 1. create outer box
    if (!objImplicit.boxtype)objImplicit.boxtype = (bRelative) ? "relativebox" : "box";
    objImplicit.tagname = "span";
    if (objImplicit.left == null && myLeft != null) objImplicit.left = myLeft;
    if (objImplicit.top == null && myTop != null) objImplicit.top = myTop;
    objImplicit.width = this.getWidth() || ColorPicker.DEFAULT_WIDTH;
    objImplicit.height = this.getHeight() || ColorPicker.DEFAULT_HEIGHT;
    var b1 = new Box(objImplicit);

    var w = b1.getClientWidth();
    var h = b1.getClientHeight();

    var b1i = new Box({tagname:"div", boxtype:"inline", height:h, width:w});
    b1.addChildProfile(b1i);

    // 2. create the 2-dimensional selector
    var o = {tagname:"span", boxtype:"box", left:0, top:0, width:(w-ColorPicker._AXIS_WIDTH-ColorPicker._AXIS_PADDING),
        height: "100%", border:this.getBorder(), parentwidth: w, parentheight: h};
    var b1a = new Box(o);
    b1a.setStyles("cursor:pointer;overflow:hidden;");
    b1i.addChildProfile(b1a);

    // 3. create the 1-dimensional (axis) selector
    o = {tagname:"span", boxtype:"box", left:w-ColorPicker._AXIS_WIDTH, top:0, width:ColorPicker._AXIS_WIDTH,
        height: "100%", border:this.getBorder(), parentwidth: w, parentheight: h};
    var b1b = new Box(o);
    b1b.setStyles("cursor:pointer;");
    b1i.addChildProfile(b1b);

    // 4. create 2D indicator
    var left = Math.round(axisValues[1] * (b1a.getClientWidth() - 1)) - Math.floor(ColorPicker._2D_D/2);
    var top = Math.round(axisValues[2] * (b1a.getClientHeight() - 1)) - Math.floor(ColorPicker._2D_D/2);
    o = {tagname:"span", boxtype:"box", left:left, top:top, width:ColorPicker._2D_D, height: ColorPicker._2D_D,
        border:"1px solid #CCCCCC;"};
    var b1a1 = new Box(o);
    b1a1.setStyles("overflow:hidden;");
    var b1a1a = new Box({tagname:"span", boxtype:"box", left:0, top:0,
        width:ColorPicker._2D_D-2, height: ColorPicker._2D_D-2, border:"1px solid #333333;"});
    b1a1a.setStyles("overflow:hidden;");
    b1a1.addChildProfile(b1a1a);
    b1a.addChildProfile(b1a1);

    // 5. create 1D indicator
    top = Math.round(axisValues[0] * (b1b.getClientHeight() - 1)) - Math.floor(ColorPicker._1D_H/2) + b1b.getClientTop();
    o = {tagname:"span", boxtype:"box", left:w-ColorPicker._AXIS_WIDTH-5, top:top, width:6, height: ColorPicker._1D_H};
    var b1c = new Box(o);
    b1c.setStyles("cursor:pointer;");
    b1i.addChildProfile(b1c);

    return b1;
  };

  ColorPicker_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 1);
  };

  /** @private @jsxobf-clobber */
  ColorPicker_prototype._untransformAxisValues = function(hsb) {
    switch (this.getAxis()) {
      case ColorPicker.HUE:
        return [1 - hsb[0], hsb[1], 1 - hsb[2]];
      case ColorPicker.SATURATION:
        return [1 - hsb[1], 1 - hsb[0], 1 - hsb[2]];
      case ColorPicker.BRIGHTNESS:
        return [1 - hsb[1], 1 - hsb[2], 1 - hsb[0]];
      default:
        throw new jsx3.Exception();
    }
  };
  
  /** @private @jsxobf-clobber */
  ColorPicker_prototype._transformAxisValues = function(hsb) {
    switch (this.getAxis()) {
      case ColorPicker.HUE:
        return [1 - hsb[0], hsb[1], 1 - hsb[2]];
      case ColorPicker.SATURATION:
        return [1 - hsb[1], 1 - hsb[0], 1 - hsb[2]];
      case ColorPicker.BRIGHTNESS:
        return [1 - hsb[2], 1 - hsb[0], 1 - hsb[1]];
      default:
        throw new jsx3.Exception();
    }
  };
  
  /** @private @jsxobf-clobber */
  ColorPicker_prototype._paintGradientImage = function(strURL, intW, intH) {
    if (jsx3.CLASS_LOADER.IE6) {
      return '<span' + html._UNSEL + ' class="gradient" style="width:' + intW + 'px;height:' + intH + 'px;' +
          html.getCSSPNG(strURL) + '"></span>';
    } else {
      return '<img src="' + strURL + '"' + html._UNSEL + ' class="gradient" style="width:' + intW + 'px;height:' + intH + 'px;" alt=""/>';
    }
  };

  /**
   * The event bridge method invoked when the user clicks on the hue selector.
   * @private
   * @jsxobf-clobber 
   */
  ColorPicker_prototype.__eb1DMouseDown = function(objEvent, objGUI) {
    Event.unsubscribe(Event.MOUSEMOVE, this);
    Event.subscribe(Event.MOUSEMOVE, this, "_eb1DMouseMove");
    Event.subscribe(Event.MOUSEUP, this, "_ebMouseUp");
  };

  ColorPicker_prototype._eb1DMouseDownPt = function(objEvent, objGUI) {
    var dim = html.getRelativePosition(objGUI.parentNode, objGUI);
    this._jsxoffsety = objEvent.getTrueY() - objEvent.getOffsetY() - Math.max(-3, dim.T);
    this.__eb1DMouseDown(objEvent, objGUI);
  };

  ColorPicker_prototype._eb1DMouseDown = function(objEvent, objGUI) {
    var dim = html.getRelativePosition(objGUI, objEvent.srcElement());
    this._jsxoffsety = objEvent.getTrueY() - objEvent.getOffsetY() - Math.max(0, dim.T);
    this.__eb1DMouseDown(objEvent, objGUI);
    this._updateAxes(objEvent, (objEvent.getOffsetY() + dim.T) / (objGUI.offsetHeight - 1), null, null);
  };

  /**
   * The event bridge method invoked when the user clicks on the saturation/brightness selector.
   * @private
   * @jsxobf-clobber 
   */
  ColorPicker_prototype._eb2DMouseDown = function(objEvent, objGUI) {
    Event.unsubscribe(Event.MOUSEMOVE, this);
    Event.subscribe(Event.MOUSEMOVE, this, "_eb2DMouseMove");
    Event.subscribe(Event.MOUSEUP, this, "_ebMouseUp");
    var dim = html.getRelativePosition(objGUI, objEvent.srcElement());
    this._jsxoffsetx = objEvent.getTrueX() - objEvent.getOffsetX() - Math.max(0,dim.L);
    this._jsxoffsety = objEvent.getTrueY() - objEvent.getOffsetY() - Math.max(0,dim.T);
    this._updateAxes(objEvent, null, (objEvent.getOffsetX() + dim.L) / (objGUI.offsetWidth - 1),
        (objEvent.getOffsetY() + dim.T) / (objGUI.offsetHeight - 1));
  };

  /** @private @jsxobf-clobber */
  ColorPicker_prototype._eb1DMouseMove = function(objEvent) {
    objEvent = objEvent.event;
    var y = objEvent.getTrueY() - this._jsxoffsety;
    var objGUI = selectSingleElm(this.getRendered(objEvent), 0, 1);
    y = Math.max(0, Math.min(objGUI.offsetHeight - 1, y));
    this._updateAxes(objEvent, y / (objGUI.offsetHeight - 1), null, null);
  };

  /** @private @jsxobf-clobber */
  ColorPicker_prototype._eb2DMouseMove = function(objEvent) {
    objEvent = objEvent.event;
    var x = objEvent.getTrueX() - this._jsxoffsetx;
    var y = objEvent.getTrueY() - this._jsxoffsety;
    var objGUI = selectSingleElm(this.getRendered(objEvent), 0, 0);
    x = Math.max(0, Math.min(objGUI.offsetWidth - 1, x));
    y = Math.max(0, Math.min(objGUI.offsetHeight - 1, y));
    this._updateAxes(objEvent, null, x / (objGUI.offsetWidth - 1), y / (objGUI.offsetHeight - 1));
  };

  /** @private @jsxobf-clobber */
  ColorPicker_prototype._ebMouseUp = function(objEvent) {
    Event.unsubscribe(Event.MOUSEMOVE, this);
    Event.unsubscribe(Event.MOUSEUP, this);
    delete this._jsxoffsetx;
    delete this._jsxoffsety;
  };

  /** @private @jsxobf-clobber */
  ColorPicker_prototype._updateAxes = function(objEvent, a0, a1, a2) {
    var axisValues = this._transformAxisValues(ColorPicker.RGBtoHSB(this.jsxrgb));
    if (a0 != null) axisValues[0] = a0;
    if (a1 != null) axisValues[1] = a1;
    if (a2 != null) axisValues[2] = a2;
    var hsb = this._untransformAxisValues(axisValues);

    // calculate new RGB values from existing saturation and brightness and new hue
    var rgb = ColorPicker.HSBtoRGB(hsb[0], hsb[1], hsb[2]);

    // store the new RGB value
    this.jsxrgb = (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
    // update the SB selector accordingly
    this._updateDisplayedColor(a0 != null, a1 != null || a2 != null, hsb);

    // fire model event for color changed
    this.doEvent(Interactive.CHANGE, {objEVENT:objEvent, intRGB:this.jsxrgb, _gipp:1});
  };

  /**
   * Updates this rendered color picker according to a change to the selected color. 
   * @param b1D {boolean} <code>true</code> if the hue component has changed.
   * @param b2D {boolean} <code>true</code> if the saturation/brightness component has changed.
   * @param hsb {Array<float>} an optional parameter specifying the new HSB values. If this parameter is not
   *   provided, the RGB value of this control is converted to HSB and those values are used. Use this parameter
   *   to avoid jumping of the SB indicator due to RGB rounding.
   * @private
   * @jsxobf-clobber 
   */
  ColorPicker_prototype._updateDisplayedColor = function(b1D, b2D, hsb) {
    var objGUI = this.getRendered();
    // only do anything if this control is currently rendered
    if (objGUI != null) {
      if (hsb == null)
        hsb = ColorPicker.RGBtoHSB(this.jsxrgb);

      var hueRGB = ColorPicker.HSBtoRGB(hsb[0], 1, 1);
      var axis = this.getAxis();
      var axisValues = this._transformAxisValues(hsb);

      if (b1D) {
        switch (axis) {
          case ColorPicker.HUE:
            selectSingleElm(objGUI, 0, 0, 0).style.backgroundColor = "#" + ColorPicker.RGBtoHex(hueRGB[0], hueRGB[1], hueRGB[2]);
            break;
          case ColorPicker.SATURATION:
            html.updateCSSOpacity(selectSingleElm(objGUI, 0, 0, 1), 1 - hsb[1]);
            break;
          case ColorPicker.BRIGHTNESS:
            html.updateCSSOpacity(selectSingleElm(objGUI, 0, 0, 2), 1 - hsb[2]);
            break;
          default:
            throw new jsx3.Exception();
        }

        // move the 1D indicator to reflect the new color value
        var hTrack = selectSingleElm(objGUI, 0, 2);
        var box = this.getBoxProfile(true).getChildProfile(0).getChildProfile(1);
        hTrack.style.top = (Math.round(axisValues[0] * (box.getClientHeight()-1)) - Math.floor(ColorPicker._1D_H/2)
            + box.getClientTop()) + "px";
      }

      if (b2D) {
        switch (axis) {
          case ColorPicker.HUE:
            html.updateCSSOpacity(selectSingleElm(objGUI, 0, 1, 1), 1 - hsb[1]);
            html.updateCSSOpacity(selectSingleElm(objGUI, 0, 1, 2), 1 - hsb[2]);
            break;
          case ColorPicker.SATURATION:
            selectSingleElm(objGUI, 0, 1, 0).style.backgroundColor = "#" + ColorPicker.RGBtoHex(hueRGB[0], hueRGB[1], hueRGB[2]);
            html.updateCSSOpacity(selectSingleElm(objGUI, 0, 1, 2), 1 - hsb[2]);
            break;
          case ColorPicker.BRIGHTNESS:
            selectSingleElm(objGUI, 0, 1, 0).style.backgroundColor = "#" + ColorPicker.RGBtoHex(hueRGB[0], hueRGB[1], hueRGB[2]);
            html.updateCSSOpacity(selectSingleElm(objGUI, 0, 1, 1), 1 - hsb[1]);
            break;
          default:
            throw new jsx3.Exception();
        }

        // move the 2D indicator to reflect the new color value
        var sbTrack = selectSingleElm(objGUI, 0, 0, 4);
        var box = this.getBoxProfile(true).getChildProfile(0).getChildProfile(0);
        sbTrack.style.left = (Math.round(axisValues[1] * (box.getClientWidth() - 1)) - Math.floor(ColorPicker._2D_D/2)) + "px";
        sbTrack.style.top = (Math.round(axisValues[2] * (box.getClientHeight() - 1)) - Math.floor(ColorPicker._2D_D/2)) + "px";
      }
    }
  };
  
  ColorPicker_prototype.onSetChild = function(objChild) {
    return false;
  };
      
  /**
   * Converts HSB color components to RGB components.
   * @param h {float} The hue component, [0.0, 1.0].
   * @param s {float} The saturation component, [0.0, 1.0].
   * @param l {float} The brightness component, [0.0, 1.0].
   * @return {Array<int>} <code>[r, g, b]</code>. Each component is an integer [0, 255].
   */
  ColorPicker.HSBtoRGB = function(h, s, l) {
    var r = 0, g = 0, b = 0, temp;
    
    h = 360 * (h - Math.floor(h));
    var max = 255 * l;
    var delta = max * s;
    var min = max - delta;
    
    if (h >= 300 || h < 60) {
      if (h >= 300)
        h -= 360;
      r = max;
      temp = (h) * delta / 60;
      if (temp < 0) {
        g = min;
        b = g-temp;
      } else {
        b = min;
        g = b+temp;
      }
    } else if (h >= 60 && h < 180) {
      g = max;
      temp = (h - 120) * delta / 60;
      if (temp < 0) {
        b = min;
        r = b-temp;
      } else {
        r = min;
        b = r+temp;
      }
    } else if (h >= 180 && h < 300) {
      b = max;
      temp = (h - 240) * delta / 60;
      if (temp < 0) {
        r = min;
        g = r-temp;
      } else {
        g = min;
        r = g+temp;
      }
    }
    
    return [Math.round(r), Math.round(g), Math.round(b)];    
  };
  
  /**
   * Converts RGB color components to HSB components.
   * @param r {int} The red component, <code>[0, 255]</code>. If only one parameter is passed, this parameter
   *   may be a 24-bit integer of the form <code>0xRRGGBB</code>.
   * @param g {int} The green component, <code>[0, 255]</code>.
   * @param b {int} The blue component, <code>[0, 255]</code>.
   * @return {Array<int>} <code>[h, s, b]</code>. Each component is a float <code>[0.0, 1.0]</code>.
   */
  ColorPicker.RGBtoHSB = function(r, g, b) {
    // based on java.awt.Color#RGBtoHSB
    if (arguments.length == 1) {
      b = r & 0xFF;
      g = (r & 0xFF00) >> 8;
      r = (r & 0xFF0000) >> 16;
    }
    
    var h = 0, s = 1, l = 1;
    
    var cmax = (r > g) ? r : g;
    if (b > cmax) cmax = b;
    var cmin = (r < g) ? r : g;
    if (b < cmin) cmin = b;

    l = cmax / 255;
    if (cmax != 0)
      s = (cmax - cmin) / cmax;
    else
      s = 0;
    
    if (s == 0) {
      h = 0;
    } else {
      var redc = (cmax - r) / (cmax - cmin);
      var greenc = (cmax - g) / (cmax - cmin);
      var bluec = (cmax - b) / (cmax - cmin);
      if (r == cmax)
        h = bluec - greenc;
      else if (g == cmax)
        h = 2 + redc - bluec;
      else
        h = 4 + greenc - redc;

      h /= 6;
      if (h < 0)
        h += 1;
    }
    
    return [h, s, l];
  };
  
  /**
   * Converts RGB color components to a string representing the the 24-bit hex value.
   * @param r {int|Array<int>} The red component, [0, 255].
   * @param g {int} The green component, [0, 255].
   * @param b {int} The blue component, [0, 255].
   * @return {String}
   * @private
   * @jsxobf-clobber 
   */
  ColorPicker.RGBtoHex = function(r, g, b) {
    return (0x1000000 + (r << 16) + (g << 8) + b).toString(16).substring(1);
  };

});
