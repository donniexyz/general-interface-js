/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Form", "jsx3.gui.Block", "jsx3.util.NumberFormat");

// @jsxobf-clobber  _increment _decrement _format _set _get _next _previous _keydown _jsxfocusedfield _jsxblurtimeout
/**
 * A form element that allows for the selection of an arbitrary time of day. This control always shows hour and
 * minute values and can be configured to show second and millisecond values as well.
 * <p/>
 * This control is localized. The separators between the time fields are controlled by the server locale.
 * Additionally, whether a 24 hour clock is used is determined by the server locale, although this can be overridden
 * per instance by setting the <code>24hour</code> property explicitly.
 *
 * @see jsx3.gui.DatePicker
 * @see jsx3.app.Server#getLocale()
 * @since 3.2
 */
jsx3.Class.defineClass("jsx3.gui.TimePicker", jsx3.gui.Block, [jsx3.gui.Form], function(TimePicker, TimePicker_prototype) {

  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;

  /** @package */
  TimePicker.SPINNER_UP = jsx3.resolveURI("jsx:///images/jsxtimepicker/spin_up.gif");
  /** @package */
  TimePicker.SPINNER_DOWN = jsx3.resolveURI("jsx:///images/jsxtimepicker/spin_down.gif");

/* @JSC */ if (jsx3.CLASS_LOADER.IE6) {
  jsx3.html.loadImages(TimePicker.SPINNER_UP, TimePicker.SPINNER_DOWN);
/* @JSC */ }
    
  /** @private @jsxobf-clobber */
  TimePicker._PAD2 = new jsx3.util.NumberFormat("00");
  /** @private @jsxobf-clobber */
  TimePicker._PAD3 = new jsx3.util.NumberFormat("000");

  TimePicker_prototype.jsxshowsecs = jsx3.Boolean.FALSE;
  TimePicker_prototype.jsxshowmillis = jsx3.Boolean.FALSE;
  TimePicker_prototype.jsx24hour = null;

  /**
   * The instance initializer.
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param intLeft {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param intTop {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param intHeight {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   */
  TimePicker_prototype.init = function(strName, intLeft, intTop, intHeight) {
    //call constructor for super class
    this.jsxsuper(strName, intLeft, intTop, 0, intHeight);

    this.jsxhours = 0;
    this.jsxminutes = 0;
    this.jsxseconds = 0;
    this.jsxmillis = 0;
  };

  /**
   * Returns whether this time picker shows the second input field.
   * @return {int} 0 or 1.
   */
  TimePicker_prototype.getShowSeconds = function() {
    return this.jsxshowsecs != null ? this.jsxshowsecs : TimePicker_prototype.jsxshowsecs;
  };

  /**
   * Returns whether this time picker shows the millisecond input field. The millisecond input field will only
   * display if both this and <code>showSeconds</code> are <code>true</code>.
   * @return {int} 0 or 1.
   */
  TimePicker_prototype.getShowMillis = function() {
    return this.jsxshowmillis != null ? this.jsxshowmillis : TimePicker_prototype.jsxshowmillis;
  };

  /**
   * Returns whether this time picker displays with a 24-hour clock. The default value depends on the default
   * locale.
   * @return {int} 0 or 1.
   */
  TimePicker_prototype.is24Hour = function() {
    return this.jsx24hour != null ? this.jsx24hour : this._getLocaleProp("time.24hour");
  };

  /**
   * Sets the CSS font-size for the object;
   *            returns reference to self to facilitate method chaining;
   * @param intPixelSize {int} font-size (in pixels)
   * @return {jsx3.gui.TimePicker} this object
   */
  TimePicker_prototype.setFontSize = function(intPixelSize) {
    this.jsxsuper(intPixelSize);
    this.setBoxDirty();
    return this;
  };

  /**
   * Sets whether this time picker shows the second input field.
   * @param bShow {boolean}
   * @return {jsx3.gui.TimePicker} this object
   */
  TimePicker_prototype.setShowSeconds = function(bShow) {
    this.jsxshowsecs = jsx3.Boolean.valueOf(bShow);
    this.setBoxDirty();
    return this;
  };

  /**
   * Sets whether this time picker shows the millisecond input field.
   * @param bShow {boolean}
   * @return {jsx3.gui.TimePicker} this object
   */
  TimePicker_prototype.setShowMillis = function(bShow) {
    this.jsxshowmillis = jsx3.Boolean.valueOf(bShow);
    this.setBoxDirty();
    return this;
  };

  /**
   * Sets whether this time picker uses a 24-hour clock.
   * @param b24Hour {boolean} may be <code>null</code> to use the locale default value.
   * @return {jsx3.gui.TimePicker} this object
   */
  TimePicker_prototype.set24Hour = function(b24Hour) {
    this.jsx24hour = b24Hour != null ? jsx3.Boolean.valueOf(b24Hour) : null;
    this.setBoxDirty();
    return this;
  };

  /**
   * Returns the hour (0-23) of the time value of this time picker.
   * @return {int}
   */
  TimePicker_prototype.getHours = function() {
    return this.jsxhours || Number(0);
  };

  /**
   * Sets the hour value of this time picker. This method updates the view immediately.
   * @param intHours {int} 0-23.
   */
  TimePicker_prototype.setHours = function(intHours) {
    this.jsxhours = Math.max(0, Math.min(23, intHours));
    this.updateInputValues();
  };

  /**
   * Returns the minute (0-60) of the time value of this time picker.
   * @return {int}
   */
  TimePicker_prototype.getMinutes = function() {
    return this.jsxminutes || Number(0);
  };

  /**
   * Sets the minute value of this time picker. This method updates the view immediately.
   * @param intMinutes {int} 0-59.
   */
  TimePicker_prototype.setMinutes = function(intMinutes) {
    this.jsxminutes = Math.max(0, Math.min(59, intMinutes));
    this.updateInputValues();
  };

  /**
   * Returns the second (0-60) of the time value of this time picker.
   * @return {int}
   */
  TimePicker_prototype.getSeconds = function() {
    return this.jsxseconds || Number(0);
  };

  /**
   * Sets the second value of this time picker. This method updates the view immediately.
   * @param intSeconds {int} 0-59.
   */
  TimePicker_prototype.setSeconds = function(intSeconds) {
    this.jsxseconds = Math.max(0, Math.min(59, intSeconds));
    this.updateInputValues();
  };

  /**
   * Returns the millisecond (0-999) of the time value of this time picker.
   * @return {int}
   */
  TimePicker_prototype.getMilliseconds = function() {
    return this.jsxmillis || Number(0);
  };

  /**
   * Sets the millisecond value of this time picker. This method updates the view immediately.
   * @param intMillis {int} 0-999.
   */
  TimePicker_prototype.setMilliseconds = function(intMillis) {
    this.jsxmillis = Math.max(0, Math.min(999, intMillis));
    this.updateInputValues();
  };

  /**
   * Returns a date with the time of day set to the value of this time picker. This method either returns the
   * <code>objDate</code> parameter with the time of day set in local time or, if <code>objDate</code> is not provided,
   * it returns a new date (the current day) with the time of day set.
   *
   * @param objDate {Date} the date on which to set the time of day. This parameter is optional.
   * @return {Date}
   */
  TimePicker_prototype.getDate = function(objDate) {
    if (this.jsxhours == null && this.jsxminutes == null) return null;
    
    if (objDate == null) objDate = new Date();
    objDate.setHours(this.jsxhours);
    objDate.setMinutes(this.jsxminutes);
    objDate.setSeconds(this.jsxseconds || Number(0));
    objDate.setMilliseconds(this.jsxmillis || Number(0));
    return objDate;
  };

  /** @private @jsxobf-clobber */
  TimePicker_prototype._getDateArr = function(h, m, s, l) {
    if (h == null) h = this.jsxhours;
    if (m == null) m = this.jsxminutes;
    if (s == null) s = this.jsxseconds;
    if (l == null) l = this.jsxmillis;
    return [h, m, s, l];
  };

  /** @private @jsxobf-clobber */
  TimePicker_prototype._setDateArr = function(a) {
    this.jsxhours = a[0];
    this.jsxminutes = a[1];
    this.jsxseconds = a[2];
    this.jsxmillis = a[3];
  };

  TimePicker._dateArrToDate = function(a) {
    if (a[0] == null || a[1] == null) return null;
    var objDate = new Date();
    objDate.setHours(a[0]);
    objDate.setMinutes(a[1]);
    objDate.setSeconds(a[2] || Number(0));
    objDate.setMilliseconds(a[3] || Number(0));
    return objDate;
  };
  
  /**
   * Returns the value of this time picker as a formatted string matching the appearance of the control.
   * @return {String}
   */
  TimePicker_prototype.getValue = function() {
    var f = (this.is24Hour() ? "HH" : "h") + this._getLocaleProp("time.sep.hour-min") + "mm";
    if (this.getShowSeconds()) {
      f += this._getLocaleProp("time.sep.min-sec") + "ss";
      if (this.getShowMillis()) {
        f += this._getLocaleProp("time.sep.sec-milli") + "SSS";
      }
    }
    if (! this.is24Hour()) {
      f += this._getLocaleProp("time.sep.ampm") + "a";
    }

    return new jsx3.util.DateFormat(f).format(this.getDate());
  };

  /**
   * Sets the value of this time picker in local time. This method updates the view immediately.
   * @param vntValue {String|Date|int} the date whose time of day information to use for setting the value of this time picker.
   *   This parameter may be a number, in which case it is taken as epoch seconds. It may also be a string,
   *   in which case it is parsed as the time portion of a date with the built-in JavaScript data parsing.
   * @return {jsx3.gui.TimePicker} this object   
   */
  TimePicker_prototype.setValue = function(vntValue) {
    if (vntValue instanceof Date) {
      this.setDate(vntValue);
    } else if (typeof(vntValue) == "number") {
      var d = new Date();
      d.setTime(vntValue);
      this.setDate(d);
    } else if (vntValue && !jsx3.util.strEmpty(vntValue)) {
      this.setDate(new Date("1/1/1970 " + vntValue));
    } else {
      this.setDate(null);
    }
    return this;
  };

  /**
   * Sets the value of this time picker in local time. This method updates the view immediately.
   * @param objDate {Date} the date whose time of day information to use for setting the value of this time picker.
   *   If this parameter is null, the current time value is cleared.
   */
  TimePicker_prototype.setDate = function(objDate) {
    if (objDate == null) {
      this.jsxhours = this.jsxminutes = this.jsxseconds = this.jsxmillis = null;
    } else {
      this.jsxhours = objDate.getHours();
      this.jsxminutes = objDate.getMinutes();
      this.jsxseconds = objDate.getSeconds();
      this.jsxmillis = objDate.getMilliseconds();
    }
    this.updateInputValues();
  };

  /** @private @jsxobf-clobber */
  TimePicker_prototype.updateInputValues = function() {
    var objGUI = this.getRendered();
    if (objGUI != null) {
      var inputs = objGUI.childNodes[0].childNodes;
      for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        if (input.tagName && input.tagName.toLowerCase() == "input" && input.getAttribute("jsxfield")) {
          var field = TimePicker.FIELDS[input.getAttribute("jsxfield")];
          var value = field._get(this);
          input.value = value != null ? field._format(this, value) : "";
        }
      }
    }
  };

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  TimePicker_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    if (objGUI) {
      delete objImplicit.width;
      var b1 = this.getBoxProfile(true, objImplicit);

      //this object should not belong as a child of an object that needs to control
      //the width/height of its children (i.e., layout grid). It's dimensions
      //are based solely on two factors: width (as implied by font size) and height.
      //any variation will corrupt the box profile

      //recalc the outer box
      var recalcRst = b1.recalculate(objImplicit, objGUI, objQueue);
      if (!recalcRst.w && !recalcRst.h) return;

      //recalc the derived height for all contained boxes
      var b1a = b1.getChildProfile(0);
      var objDiv = objGUI.childNodes[0];
      b1a.recalculate({height:b1.getClientHeight()},objDiv,objQueue);

      //hour field
      var bHour = b1a.getChildProfile(0);
      bHour.recalculate({height:b1a.getClientHeight()},objDiv.childNodes[0],objQueue);

      //minute field
      var bMin = b1a.getChildProfile(1);
      bMin.recalculate({height:b1a.getClientHeight()},objDiv.childNodes[2],objQueue);
      var i = 2;

      //second field
      if (this.jsxshowsecs) {
        i+=2;
        var bSec = b1a.getChildProfile(2);
        bSec.recalculate({height:b1a.getClientHeight()},objDiv.childNodes[i],objQueue);

        if(this.jsxshowsecs && this.jsxshowmillis) {
          //milli field
          i += 2;
          var bMilli = b1a.getChildProfile(3);
          bMilli.recalculate({height:b1a.getClientHeight()},objDiv.childNodes[i],objQueue);
        }
      }

      //am/pm field
      if (!this.is24Hour()) {
        i+=2;
        var bAmPm = b1a.getChildProfile(4);
        bAmPm.recalculate({height:b1a.getClientHeight()},objDiv.childNodes[i],objQueue);
      }

      //spinner field
      var bSpin = b1a.getChildProfile(5);
      //no separator precedes the spinner box (!*2)
      i++;
      bSpin.recalculate({height:b1a.getClientHeight()},objDiv.childNodes[i],objQueue);
    }
  };

  /**
   * Creates the box model/profile for the object
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box}
   * @private
   */
  TimePicker_prototype.createBoxProfile = function(objImplicit) {
    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if (this.getParent() && (objImplicit == null || ((isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if (objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    var intCharWidth = Math.round((this.getFontSize() || jsx3.gui.Block.DEFAULTFONTSIZE) * 3/4);
    var strWidth1 = intCharWidth;
    var strWidth2 = intCharWidth * 2;
    var strWidth25 = Math.round(intCharWidth * 2.2);
    var strWidth3 = intCharWidth * 3;

    //determine relative position (this will affect left, top, and boxtype properties)
    var bRelative = (this.getRelativePosition() != 0 && (!this.getRelativePosition() || this.getRelativePosition() == jsx3.gui.Block.RELATIVE));
    var myLeft = (bRelative) ? null : this.getLeft();
    var myTop = (bRelative) ? null : this.getTop();

    //create outer box
    if (!objImplicit.boxtype)objImplicit.boxtype = (bRelative) ? "relativebox" : "box";
    objImplicit.tagname = "span";
    if (bRelative && this.getMargin()) objImplicit.margin = this.getMargin();
    if (objImplicit.left == null && myLeft != null) objImplicit.left = myLeft;
    if (objImplicit.top == null && myTop != null) objImplicit.top = myTop;
    if (objImplicit.height == null && this.getHeight())
      objImplicit.height = this.getHeight();
    var bor;
    if((bor = this.getBorder()) != null && bor != "") {
      objImplicit.border = bor;
    } else {
      objImplicit.border =  "solid 1px #9898a5;solid 1px #d8d8e5;solid 1px #d8d8e5;solid 1px #9898a5";
    }
    var pad;
    if((pad = this.getPadding()) != null && pad != "") objImplicit.padding = pad;
    var b1 = new jsx3.gui.Painted.Box(objImplicit);

    //create the insulating div
    var o = {};
    o.tagname = "div";
    o.boxtype = "inline";
    o.height = b1.getClientHeight();
    var b1a = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1a);

    //hour field
    var myLeft = 0;
    o = {tagname: "input[text]", empty: true, boxtype: "box", left:myLeft, top:0, padding:"1 1 0 0", width:strWidth2, height:b1a.getClientHeight() , border:"solid 0px;solid 0px;solid 0px;solid 0px"};
    b1a.addChildProfile(new jsx3.gui.Painted.Box(o));
    myLeft += strWidth2 + strWidth1;

    //minute field
    o = {tagname: "input[text]", empty: true, boxtype: "box", left:myLeft, top:0, padding:"1 1 0 0", width:strWidth2, height:b1a.getClientHeight() , border:"solid 0px;solid 0px;solid 0px;solid 0px"};
    b1a.addChildProfile(new jsx3.gui.Painted.Box(o));
    myLeft += strWidth2 + strWidth1;

    //second field
    o = {tagname: "input[text]", empty: true, boxtype: "box", left:myLeft, top:0, padding:"1 1 0 0",  width: strWidth2, height:b1a.getClientHeight() , border:"solid 0px;solid 0px;solid 0px;solid 0px"};
    b1a.addChildProfile(new jsx3.gui.Painted.Box(o));
    if(this.jsxshowsecs) myLeft += strWidth2 + strWidth1;

    //milli field
    o = {tagname: "input[text]", empty: true, boxtype: "box", left:myLeft, top:0, padding:"1 1 0 0", width:strWidth3, height:b1a.getClientHeight() , border:"solid 0px;solid 0px;solid 0px;solid 0px"};
    b1a.addChildProfile(new jsx3.gui.Painted.Box(o));
    if(this.jsxshowsecs && this.jsxshowmillis) myLeft += strWidth3 + strWidth1;

    //am/pm field
    var strApPm = this.jsxhours != null ? this._getLocaleProp("time.ampm")[this.jsxhours < 12 ? 0 : 1] : "";
    o = {tagname: "input[text]", empty: true, boxtype: "box", left:myLeft, top:0, padding:"1 1 0 0", width:strWidth1*strApPm.length, height:b1a.getClientHeight() , border:"solid 0px;solid 0px;solid 0px;solid 0px"};
    b1a.addChildProfile(new jsx3.gui.Painted.Box(o));
    if (!this.is24Hour()) myLeft += (strWidth1*strApPm.length);

    //spinner field
    o = {tagname: "span", boxtype: "box", left:myLeft, top:0, padding:"0", width: 12, height:b1a.getClientHeight(), border:"solid 0px;solid 0px;solid 0px;solid 1px #d8d8e5"};
    b1a.addChildProfile(new jsx3.gui.Painted.Box(o));
    myLeft += 12;

    //reset the width of the containing span/div to reflect the aggregate widths of the displayed child fields
    b1a.recalculate({width:myLeft});
    b1.recalculate({width:myLeft+b1.getBorderWidth()});

    return b1;
  };


  /**
   * @return {String}
   */
  TimePicker_prototype.paint = function() {
    this.applyDynamicProperties();

    var strBGColor = (this.getEnabled() == jsx3.gui.Form.STATEENABLED) ?
        this.getBackgroundColor() : this.getDisabledBackgroundColor();

    var inputAttrs = this.getEnabled() == jsx3.gui.Form.STATEENABLED ?
        this.renderHandler(Event.KEYDOWN, "doKeyDownField", 2) + this.renderHandler(Event.BLUR, "doBlurField", 2) +
        this.renderHandler(Event.FOCUS, "doFocusField", 2) + this.renderHandler(Event.MOUSEWHEEL, "doWheelField", 2) : "";
    inputAttrs += this.paintIndex() + this.paintEnabled();

    //paint the outer-most box
    var b1 = this.getBoxProfile(true);
    b1.setAttributes('id="' + this.getId() + '" class="jsx30timepicker" ' +
        this.paintTip() + this.paintLabel() + this.renderHandlers(null, 0) + this.renderAttributes(null, true));
    b1.setStyles(this.paintZIndex() + this.paintVisibility() + this.paintDisplay() + this.paintCSSOverride()
        + (strBGColor != null ? 'background-color:' + strBGColor + ';' : ""));

    //factor out common styles
    var strWidth1 = Math.round((this.getFontSize() || jsx3.gui.Block.DEFAULTFONTSIZE) * 3/4);
    var inputStyles = this.paintColor() + this.paintFontWeight() + this.paintFontName() + this.paintFontSize();
    var sepStyle = this.paintColor() + this.paintFontWeight() + this.paintFontName() + this.paintFontSize() + "text-align:right;width:" + strWidth1 + "px;top:0px;height:" + b1.getChildProfile(0).getChildProfile(0).getClientHeight() + "px;position:absolute;";
    var strHour = this.jsxhours != null ? TimePicker.FIELDS["hour"]._format(this, this.jsxhours) : "";
    var strMinute = this.jsxminutes != null ? TimePicker.FIELDS["minute"]._format(this, this.jsxminutes) : "";

    //paint the insulating div box
    var b1a = b1.getChildProfile(0);
    b1a.setAttributes(' class="fields"');
    var fieldsHTML = "";

    //hour field
    var myLeft = 0;
    var bHour = b1a.getChildProfile(0);
    bHour.setAttributes(inputAttrs + ' jsxfield="hour" size="2" maxlength="2" value="'+strHour+'"');
    bHour.setStyles(inputStyles);
    fieldsHTML += bHour.paint().join("");
    myLeft += bHour.getPaintedWidth();

    //minute field
    var bMinute = b1a.getChildProfile(1);
    bMinute.setAttributes(inputAttrs + ' jsxfield="minute" size="2" maxlength="2" value="'+strMinute+'"');
    bMinute.setStyles(inputStyles);
    fieldsHTML += '<div style="' + sepStyle + 'left:' + myLeft + 'px;">' + this._getLocaleProp("time.sep.hour-min") + '</div>';
    fieldsHTML += bMinute.paint().join("");
    myLeft += bMinute.getPaintedWidth() + strWidth1;

    //second field
    if(this.jsxshowsecs) {
      var strSecond = this.jsxseconds != null ? TimePicker.FIELDS["second"]._format(this, this.jsxseconds) : "";
      var bSecs = b1a.getChildProfile(2);
      bSecs.setAttributes(inputAttrs + ' jsxfield="second" size="2" maxlength="2" value="'+strSecond+'"');
      bSecs.setStyles(inputStyles);
      fieldsHTML += '<div style="' + sepStyle + 'left:' + myLeft + 'px;">' + this._getLocaleProp("time.sep.min-sec") + '</div>';
      fieldsHTML += bSecs.paint().join("");
      myLeft += bSecs.getPaintedWidth() + strWidth1;

      //milli field
      if(this.jsxshowmillis) {
        var strMilli = this.jsxmillis != null ? TimePicker.FIELDS["milli"]._format(this, this.jsxmillis) : "";
        var bMillis = b1a.getChildProfile(3);
        bMillis.setAttributes(inputAttrs + ' jsxfield="milli" size="3" maxlength="3" value="'+strMilli+'"');
        bMillis.setStyles(inputStyles);
        fieldsHTML += '<div style="' + sepStyle + 'left:' + myLeft + 'px;">' + this._getLocaleProp("time.sep.sec-milli") + '</div>';
        fieldsHTML += bMillis.paint().join("");
        myLeft += bMillis.getPaintedWidth() + strWidth1;
      }
    }

    //am/pm field
    if (! this.is24Hour()) {
      var strApPm = this.jsxhours != null ? this._getLocaleProp("time.ampm")[this.jsxhours < 12 ? 0 : 1] : "";
      var b24h = b1a.getChildProfile(4);
      b24h.setAttributes(inputAttrs + ' jsxfield="ampm" size="4" maxlength="4" value="'+strApPm+'"');
      b24h.setStyles(inputStyles);
      
      fieldsHTML += '<div style="' + sepStyle + 'position:absolute;left:' + myLeft + 'px;">' + this._getLocaleProp("time.sep.ampm") + '</div>';
      fieldsHTML += b24h.paint().join("");
    }

    //spinner field
    var bSpin = b1a.getChildProfile(5);
    var strImageCursor = this.getEnabled() == jsx3.gui.Form.STATEENABLED ? "cursor:pointer;" : "";
    bSpin.setAttributes(jsx3.html._UNSEL + ' class="spinner"');

    //up/down spinner images
    var imageHTML = '<img' + jsx3.html._UNSEL + ' style="top:0px;left:0px;position:absolute;'+strImageCursor+'" width="11" height="8" src="'+ TimePicker.SPINNER_UP + '" alt="' + this._getLocaleProp("up", TimePicker) + '"' +
                    this.renderHandler(Event.CLICK, "doSpinUp", 3) +
                    this.renderHandler(Event.MOUSEDOWN, "doSpinMD", 3)+'/>' +
                    '<img' + jsx3.html._UNSEL + ' style="top:8px;left:0px;position:absolute;'+strImageCursor+'" width="11" height="8" src="'+ TimePicker.SPINNER_DOWN + '" alt="' + this._getLocaleProp("down", TimePicker) + '"' +
                    this.renderHandler(Event.CLICK, "doSpinDown", 3) +
                    this.renderHandler(Event.MOUSEDOWN, "doSpinMD", 3)+'/>';

    //return final string of HTML
    return b1.paint().join(b1a.paint().join(fieldsHTML + bSpin.paint().join(imageHTML)  + "&#160;"));
  };


  /** @private @jsxobf-clobber */
  TimePicker.FIELDS = {
      hour: {
          _increment: function(picker, value) {
            if (isNaN(value)) value = picker.is24Hour() ? -1 : 0;
            else value = Number(value);
            return picker.is24Hour() ? (value + 1) % 24 : (value) % 12 + 1;
          },
          _decrement: function(picker, value) {
            if (isNaN(value)) value = picker.is24Hour() ? 23 : 12;
            else value = Number(value);
            return picker.is24Hour() ? jsx3.util.numMod(value - 1, 24) : jsx3.util.numMod((value - 2), 12) + 1;
          },
          _format: function(picker, value) {
            if (value == null) return "";
            return picker.is24Hour() ? TimePicker._PAD2.format(value) : (jsx3.util.numMod(value - 1, 12)+1).toString();
          },
          _set: function(picker, value) {
            var h = null;
            if (value == null || value === "") {
            } else if (isNaN(value)) {
              h = 0;
            } else if (picker.is24Hour() || value == null) {
              h = Number(value);
            } else {
              value = Number(value);
              var ampm = picker._getLocaleProp("time.ampm");
              var ampmField = picker.getFieldByType("ampm");
              if (ampmField != null && ampmField.value != null && ampmField.value.toLowerCase() == ampm[1].toLowerCase())
                h = value == 12 ? value : value + 12;
              else
                h = value == 12 ? 0 : value;
            }
            return picker._getDateArr(h);
          },
          _get: function(picker) {
            if (picker.is24Hour() || picker.jsxhours == null) {
              return picker.jsxhours;
            } else {
              return jsx3.util.numMod(picker.jsxhours - 1, 12) + 1;
            }
          },
          _next: function(picker) {
            return picker.getFieldByType("minute");
          },
          _previous: function(picker) {
            return null;
          },
          _keydown: function(picker, input, keycode, shift) {
            if (!(keycode >= Event.KEY_0 && keycode <= Event.KEY_9) || shift) return true;
            var val1 = input.value;
            jsx3.sleep(function() {
              if (picker.getParent() == null) return;
              var val2 = input.value;
              if (val1 == val2) input.value = val2 = String.fromCharCode(keycode);

              var valInt = Number(input.value);
              if (! isNaN(valInt)) {
                if (valInt > (picker.is24Hour() ? 23 : 12)) {
                  input.value = String.fromCharCode(keycode);
                  valInt = Number(input.value);
                }

                if (valInt > (picker.is24Hour() ? 2 : 1)) {
                  jsx3.html.focus(this._next(picker));
                }
              }
            }, null, this);
          }
      },
      minute: {
          _increment: function(picker, value) {
            return ((Number(value) || 0) + 1) % 60;
          },
          _decrement: function(picker, value) {
            return jsx3.util.numMod((isNaN(value) ? 60 : Number(value)) - 1, 60);
          },
          _format: function(picker, value) {
            return value == null ? "" : TimePicker._PAD2.format(value);
          },
          _set: function(picker, value) {
            return picker._getDateArr(null, Number(value) || 0);
          },
          _get: function(picker) {
            return picker.jsxminutes;
          },
          _next: function(picker) {
            return picker.getFieldByType(picker.jsxshowsecs ? "second" : "ampm");
          },
          _previous: function(picker) {
            return picker.getFieldByType("hour");
          },
          _keydown: function(picker, input, keycode, shift) {
            if (!(keycode >= Event.KEY_0 && keycode <= Event.KEY_9) || shift) return true;
            var val1 = input.value;
            jsx3.sleep(function() {
              if (picker.getParent() == null) return;
              var val2 = input.value;
              if (val1 == val2) input.value = val2 = String.fromCharCode(keycode);

              var valInt = Number(input.value);
              if (! isNaN(valInt)) {
                if (valInt >= 60) {
                  input.value = String.fromCharCode(keycode);
                  valInt = Number(input.value);
                }

                if (valInt >= 6) {
                  var next = this._next(picker);
                  if (next)
                    jsx3.html.focus(next);
                }
              }
            }, null, this);
          }
      },
      second: {
          _increment: function(picker, value) {
            return ((Number(value) || 0) + 1) % 60;
          },
          _decrement: function(picker, value) {
            return jsx3.util.numMod((isNaN(value) ? 60 : Number(value)) - 1, 60);
          },
          _format: function(picker, value) {
            return value == null ? "" : TimePicker._PAD2.format(value);
          },
          _set: function(picker, value) {
            return picker._getDateArr(null, null, Number(value) || 0);
          },
          _get: function(picker) {
            return picker.jsxseconds;
          },
          _next: function(picker) {
            return picker.getFieldByType(picker.jsxshowmillis ? "milli" : "ampm");
          },
          _previous: function(picker) {
            return picker.getFieldByType("minute");
          },
          _keydown: function(picker, input, keycode, shift) {
            return TimePicker.FIELDS["minute"]._keydown.call(this, picker, input, keycode, shift);
          }
      },
      milli:  {
          _increment: function(picker, value) {
            return ((Number(value) || 0) + 1) % 1000;
          },
          _decrement: function(picker, value) {
            return jsx3.util.numMod((isNaN(value) ? 1000 : Number(value)) - 1, 1000);
          },
          _format: function(picker, value) {
            return value == null ? "" : TimePicker._PAD3.format(value);
          },
          _set: function(picker, value) {
            return picker._getDateArr(null, null, null, Number(value) || 0);
          },
          _get: function(picker) {
            return picker.jsxmillis;
          },
          _next: function(picker) {
            return picker.getFieldByType("ampm");
          },
          _previous: function(picker) {
            return picker.getFieldByType("second");
          },
          _keydown: function(picker, input, keycode, shift) {
            if (!(keycode >= Event.KEY_0 && keycode <= Event.KEY_9) || shift) return true;
            var val1 = input.value;
            jsx3.sleep(function() {
              if (picker.getParent() == null) return;
              var val2 = input.value;
              if (val1 == val2) input.value = val2 = String.fromCharCode(keycode);

              var valInt = Number(input.value);
              if (! isNaN(valInt)) {
                if (val2.length == 3) {
                  var next = this._next(picker);
                  if (next)
                    jsx3.html.focus(next);
                }
              }
            }, null, this);
          }
      },
      ampm: {
          _increment: function(picker, value) {
            var ampm = picker._getLocaleProp("time.ampm");
            return value != null && value.toLowerCase() == ampm[0].toLowerCase() ? ampm[1] : ampm[0];
          },
          _decrement: function(picker, value) {
            var ampm = picker._getLocaleProp("time.ampm");
            return value != null && value.toLowerCase() == ampm[1].toLowerCase() ? ampm[0] : ampm[1];
          },
          _format: function(picker, value) {
            return value;
          },
          _set: function(picker, value) {
            var ampm = picker._getLocaleProp("time.ampm");
            var hourValue = Number(picker.getFieldByType("hour").value);
            var h = null;
            if (! isNaN(hourValue)) {
              if (value != null && value.toLowerCase() == ampm[1].toLowerCase())
                h = hourValue == 12 ? hourValue : hourValue + 12; // PM
              else
                h = hourValue == 12 ? 0 : hourValue; // AM
            }
            return picker._getDateArr(h);
          },
          _get: function(picker) {
            return picker._getLocaleProp("time.ampm")[picker.jsxhours < 12 ? 0 : 1];
          },
          _next: function(picker) {
            return null;
          },
          _previous: function(picker) {
            return picker.getFieldByType(picker.jsxshowsecs ? (picker.jsxshowmillis ? "milli" : "second") : "minute");
          },
          _keydown: function(picker, input, keycode, shift) {
            var letter = String.fromCharCode(keycode);
            var ampm = picker._getLocaleProp("time.ampm");
            for (var i = 0; i < ampm.length; i++) {
              if (letter == ampm[i].charAt(0).toUpperCase()) {
                input.value = ampm[i];
                break;
              }
            }
            return true;
          }
      }
  };

  /** @private @jsxobf-clobber */
  TimePicker_prototype.doKeyDownField = function(objEvent, objGUI) {
    if (objEvent.hasModifier(true) || objEvent.isModifierKey()) return;

    var fieldName = objGUI.getAttribute("jsxfield");
    var field = TimePicker.FIELDS[fieldName];
    var keyCode = objEvent.keyCode();
    // support for number pad keys also
    if (keyCode >= Event.KEY_NP0 && keyCode <= Event.KEY_NP9)
      keyCode += Event.KEY_0 - Event.KEY_NP0;

    if (keyCode == Event.KEY_ARROW_UP || keyCode == Event.KEY_ARROW_DOWN) {
      var inc = keyCode == Event.KEY_ARROW_UP ? "_increment" : "_decrement";
      var newValue = field[inc](this, objGUI.value);
      var dateArr = field._set(this, newValue);
      if (this.doEvent(Interactive.CHANGE, {objEVENT:objEvent, strFIELD:fieldName,
          newDATE:TimePicker._dateArrToDate(dateArr), _gipp:1}) !== false) {
        objGUI.value = field._format(this, newValue);
        this._setDateArr(dateArr);
      }
    } else if (keyCode == Event.KEY_TAB || keyCode == Event.KEY_ENTER) {
      var nextField = objEvent.shiftKey() ? field._previous(this) : field._next(this);
      if (nextField == null) return;
      jsx3.html.focus(nextField);
    } else if ((keyCode >= Event.KEY_0 && keyCode <= Event.KEY_9) ||
               (keyCode >= Event.KEY_A && keyCode <= Event.KEY_Z)) {
      var cancel = field._keydown(this, objGUI, keyCode, objEvent.shiftKey());
      if (! cancel) return;
    } else if (objEvent.isArrowKey() || objEvent.isFunctionKey() || objEvent.escapeKey() || 
        keyCode == Event.KEY_BACKSPACE || keyCode == Event.KEY_DELETE) {
      return;
    } else {
//      jsx3.log(keyCode + " " + String.fromCharCode(keyCode));
    }

    objEvent.cancelAll();
  };

  /** @private @jsxobf-clobber */
  TimePicker_prototype.doBlurField = function(objEvent, objGUI) {
    this.doEvent(Interactive.JSXBLUR, {objEVENT:objEvent});
    var fieldName = objGUI.getAttribute("jsxfield");
    var field = TimePicker.FIELDS[fieldName];

    var oldValue = field._get(this);
    var newValue = jsx3.util.numIsNaN(objGUI.value) ?
        (jsx3.util.strEmpty(objGUI.value) ? null : objGUI.value) : Number(objGUI.value);
    if (oldValue !== newValue) {
      var dateArr = field._set(this, newValue);
      if (this.doEvent(Interactive.CHANGE, {objEVENT:objEvent, strFIELD:fieldName,
          newDATE:TimePicker._dateArrToDate(dateArr), _gipp:1}) !== false) {
        this._setDateArr(dateArr);
        if (newValue != null)
          objGUI.value = field._format(this, field._get(this));
      } else {
        objGUI.value = field._format(this, oldValue);
      }
    } else {
      objGUI.value = field._format(this, oldValue);
    }

    var me = this;
    this._jsxblurtimeout = window.setTimeout(function() {
      delete me._jsxblurtimeout;
      delete me._jsxfocusedfield;
    }, 0);
  };

  /** @private @jsxobf-clobber */
  TimePicker_prototype.doFocusField = function(objEvent, objGUI) {
    this.doEvent(Interactive.JSXFOCUS, {objEVENT:objEvent});
    if (this._jsxblurtimeout) {
      window.clearTimeout(this._jsxblurtimeout);
      delete this._jsxblurtimeout;
    }

    this._jsxfocusedfield = objGUI.getAttribute("jsxfield");
  };

  /** @private @jsxobf-clobber */
  TimePicker_prototype.doWheelField = function(objEvent, objGUI) {
    var wd = objEvent.getWheelDelta();
    if (wd != 0) {
      var fieldName = objGUI.getAttribute("jsxfield");
      var field = TimePicker.FIELDS[fieldName];
      var inc = wd > 0 ? "_increment" : "_decrement";
      var newValue = field[inc](this, objGUI.value);

      var dateArr = field._set(this, newValue);
      if (this.doEvent(Interactive.CHANGE, {objEVENT:objEvent, strFIELD:fieldName,
          newDATE:TimePicker._dateArrToDate(dateArr), _gipp:1}) !== false) {
        objGUI.value = field._format(this, newValue);
        this._setDateArr(dateArr);
      }
    }
    objEvent.cancelAll();
  };

  /** @private @jsxobf-clobber */
  TimePicker_prototype.doSpinMD = function(objEvent, objGUI) {
    //ensures focus isn't transferred in fx (ie provides unselectable="on")
    Event.publish(objEvent);
    objEvent.cancelAll();
  };

  /** @private @jsxobf-clobber */
  TimePicker_prototype.doSpinUp = function(objEvent, objGUI) {
    this.doSpin(objEvent, objGUI, "_increment");
  };

  /** @private @jsxobf-clobber */
  TimePicker_prototype.doSpinDown = function(objEvent, objGUI) {
    this.doSpin(objEvent, objGUI, "_decrement");
  };

  /** @private @jsxobf-clobber */
  TimePicker_prototype.doSpin = function(objEvent, objGUI, strInc) {
    if (this.getEnabled() != jsx3.gui.Form.STATEENABLED) return;

    var fieldName = this._jsxfocusedfield || "hour";

    var input = this.getFieldByType(fieldName);
    var field = TimePicker.FIELDS[fieldName];
    var newValue = field[strInc](this, input.value);

    var dateArr = field._set(this, newValue);
    if (this.doEvent(Interactive.CHANGE, {objEVENT:objEvent, strFIELD:fieldName,
        newDATE:TimePicker._dateArrToDate(dateArr), _gipp:1}) !== false) {
      input.value = field._format(this, newValue);
      this._setDateArr(dateArr);

      if (this._jsxfocusedfield == null)
        jsx3.html.focus(input);
    }
  };

  /** @private @jsxobf-clobber */
  TimePicker_prototype.getFieldByType = function(strType) {
    var objGUI = this.getRendered();
    if (objGUI != null) {
      var inputs = objGUI.childNodes[0].childNodes;
      for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        if (input.getAttribute && input.getAttribute("jsxfield") == strType)
          return input;
      }
    }
    return null;
  };

  TimePicker_prototype.updateGUI = function(strCSSName, strCSSValue) {
    if (strCSSName.search(/^(?:display|margin|left|top|position|backgroundColor|visibility|zIndex)$/) == 0) {
      this.jsxsuper(strCSSName, strCSSValue);
    } else {
      this.repaint();
    }
  };

  TimePicker_prototype.onSetChild = function(objChild) {
    return false;
  };

  TimePicker_prototype.emSetValue = function(strValue) {
    var es = this.emGetSession();
    var date = null;

    if (jsx3.util.strEmpty(strValue)) {
      es.datetype = "int";
    } else if (!isNaN(strValue) && !isNaN(parseInt(strValue))) {
      date = new Date();
      date.setTime(parseInt(strValue));
      es.datetype = "int";
    } else {
      date = new Date(strValue);
      if (isNaN(date)) {
        date = null;
      } else {
        es.datetype = "native";
      }
    }

    es.olddate = date;
    this.setDate(date);
  };

  TimePicker_prototype.emGetValue = function() {
    var es = this.emGetSession();

    var date = this.getDate();
    var switchOn = this.emGetSession().datetype || "";

    if (date == null) return null;
    
    switch (switchOn) {
      case "native":
        return date.toString();
      default:
        return date.getTime().toString();
    }
  };

  TimePicker_prototype.emFocus = function() {
    var objGUI = this.getRendered();
    if (objGUI) {
      objGUI.childNodes[0].childNodes[0].focus(); // focus the hour field
    }
  };

  /**
   * Returns <code>STATEVALID</code> if this time picker is not required or if it is required and its value is not
   * <code>null</code>, otherwise returns <code>STATEINVALID</code>.
   *
   * @return {int}
   * @see jsx3.gui.Form#STATEVALID
   * @see jsx3.gui.Form#STATEINVALID
   */
  TimePicker_prototype.doValidate = function() {
    var state = this.getDate() != null || this.getRequired() == jsx3.gui.Form.OPTIONAL ?
          jsx3.gui.Form.STATEVALID : jsx3.gui.Form.STATEINVALID;
    this.setValidationState(state);
    return state;
  };

});
