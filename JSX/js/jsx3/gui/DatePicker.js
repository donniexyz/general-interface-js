/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Form", "jsx3.gui.Heavyweight", "jsx3.gui.Block", "jsx3.util.DateFormat");

/**
 * A form element that allows for the selection of an arbitrary date by showing a navigable calendar.
 * <p/>
 * This control is localized to the server locale. Users with computers set to other locales may see a version of the
 * control appropriate for their locale.
 * <p/>
 * This class uses the <code>jsx3.util.DateFormat</code> class to both format and parse dates. Dates are formatted
 * before they are displayed in the text box of the date picker. Dates are parsed after a user manually changes the
 * text in the text box. Parsing with <code>DateFormat</code> is fairly strict. If parsing fails, the value of
 * the date picker is unchanged and the displayed value refreshes.
 * <p/>
 * The calendar calculates dates in the time of the local machine, not UTC (Greenwich Mean Time). Date values chosen
 * with the calendar are always 0h:00m local time.
 * <p/>
 * Date pickers publish the following model events:
 * <ul>
 * <li><code>CHANGE</code> &#8212; when the value of the control is changed by the user selecting a date in the
 *   calendar or editing the formatted date in the text box.</li>
 * <li><code>SHOW</code> &#8212; whenever the calendar is shown.</li>
 * <li><code>HIDE</code> &#8212; whenever the calendar is hidden.</li>
 * </ul>
 *
 * @see jsx3.util.DateFormat
 * @see jsx3.app.Server#getLocale()
 * @since 3.0
 */
jsx3.Class.defineClass("jsx3.gui.DatePicker", jsx3.gui.Block, [jsx3.gui.Form], function(DatePicker, DatePicker_prototype) {

  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;
  var DateFormat = jsx3.util.DateFormat;

/* @JSC :: begin DEP */

  /**
   * {String} The default date format when none is specified for an instance of this class.
   * @deprecated  This value is now localized.
   */
  DatePicker.DEFAULT_FORMAT = "M/d/yyyy";

/* @JSC :: end */

/* @JSC :: begin DEP */

  /**
   * {int} The default day of the start of a week when none is specified for an instance of this class. Sunday.
   * @deprecated  This value is now localized.
   */
  DatePicker.DEFAULT_WEEK_START = 0;

/* @JSC :: end */

  /** @package */
  DatePicker.IMAGE_NEXT = jsx3.resolveURI("jsx:///images/jsxdatepicker/next.gif");
  /** @package */
  DatePicker.IMAGE_PREVIOUS = jsx3.resolveURI("jsx:///images/jsxdatepicker/previous.gif");
  /** @private @jsxobf-clobber */
  DatePicker.IMAGE_OPEN = jsx3.resolveURI("jsx:///images/jsxdatepicker/open.gif");

  /* @JSC */ if (jsx3.CLASS_LOADER.IE6) {
  jsx3.html.loadImages(DatePicker.IMAGE_NEXT, DatePicker.IMAGE_PREVIOUS, DatePicker.IMAGE_OPEN);
  /* @JSC */ }
    
  /** {String} @private */
  DatePicker_prototype.jsxformat = null;
  /** {int} @private */
  DatePicker_prototype.jsxfirstweekday = null;

  // transient state information
  /** @private @jsxobf-clobber */
  DatePicker_prototype._jsxShownYear = null;
  /** @private @jsxobf-clobber */
  DatePicker_prototype._jsxShownMonth = null;
  /** @private @jsxobf-clobber */
  DatePicker_prototype._jsxfocused = false;
  /** @private @jsxobf-clobber */
  DatePicker_prototype._jsxdateformat = null;

  /**
   * The instance initializer.
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param intLeft {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param intTop {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param intWidth {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param intHeight {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   */
  DatePicker_prototype.init = function(strName,intLeft,intTop,intWidth,intHeight) {
    //call constructor for super class
    this.jsxsuper(strName,intLeft,intTop,intWidth,intHeight);

    // allowed to be null in serialization so don't set in prototype
    this.jsxyear = 1970;
    this.jsxmonth = 0;
    this.jsxdate = 1;
  };

  /**
   * Shows the calendar for this date picker and places focus within the calendar as though the user had clicked
   * on the show calendar button. The calendar hides automatically when focus leaves the calendar.
   */
  DatePicker_prototype.focusCalendar = function() {
    this._doOpen();
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._showCalendar = function() {
    var heavy = this._getHeavyweight(true);
    this._repaintCalendar();
    heavy.show();

    var evtRet = this.doEvent(Interactive.SHOW);
    if (evtRet && typeof(evtRet) == "object" && typeof(evtRet.objDATE) != "undefined") {
      var date = evtRet.objDATE;
      this._jsxShownYear = date.getFullYear();
      this._jsxShownMonth = date.getMonth();
      this._repaintCalendar();
    }

    var gui = heavy.getRendered();
    jsx3.html.focus(gui.childNodes[0]);
    this._jsxfocused = true;

    Event.subscribeLoseFocus(this, gui, "_hideCalendar");
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._hideCalendar = function(objEvent, bRefocus) {
    var heavy = this._getHeavyweight();

    if (heavy != null) {
      heavy.destroy();
      this.doEvent(Interactive.HIDE);
      Event.unsubscribeLoseFocus(this);
    }

    this._jsxfocused = false;

    if (bRefocus) {
      var objGUI = this._getInput();
      if (objGUI) jsx3.html.focus(objGUI);
    }
  };

  /**
   * Returns the jsxformat field
   * @return {String|int} jsxformat
   */
  DatePicker_prototype.getFormat = function() {
    return this.jsxformat != null ? this.jsxformat : 0;
  };

  /**
   * Sets the format of this date picker. The format should conform to the syntax of <code>jsx3.util.DateFormat</code>.
   * The provided format may also be an integer, in which case it is intepreted as one of of the fields of
   * <code>DateFormat</code> - <code>SHORT</code>, <code>MEDIUM</code>, <code>LONG</code>, or <code>FULL</code> - and
   * the displayed format will be localized accordingly.
   *
   * @param jsxformat {String|int} the new format.
   * @see jsx3.util.DateFormat
   * @see jsx3.util.DateFormat#SHORT
   * @see jsx3.util.DateFormat#MEDIUM
   * @see jsx3.util.DateFormat#LONG
   * @see jsx3.util.DateFormat#FULL
   */
  DatePicker_prototype.setFormat = function( jsxformat ) {
    this.jsxformat = jsxformat;
    delete this._jsxdateformat;
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._getDateFormat = function() {
    if (this._jsxdateformat == null || !this._jsxdateformat.getLocale().equals(this._getLocale())) {
      try {
        var format = this.getFormat();
        if (typeof(format) == "number")
          this._jsxdateformat = DateFormat.getDateInstance(format, this._getLocale());
        else
          this._jsxdateformat = new DateFormat(format, this._getLocale());
      } catch (e) {
        jsx3.util.Logger.getLogger("jsx3.gui").warn(
            jsx3._msg("gui.dp.fmt", this.getFormat(), this), jsx3.NativeError.wrap(e));
        this._jsxdateformat = DateFormat.getDateInstance(null, this._getLocale());
      }
    }

    return this._jsxdateformat;
  };

  /**
   * Returns the jsxfirstweekday field
   * @return {int} jsxfirstweekday
   */
  DatePicker_prototype.getFirstDayOfWeek = function() {
    return this.jsxfirstweekday != null ? this.jsxfirstweekday : this._getLocaleProp("date.firstWeekDay");
  };

  /**
   * Sets the jsxfirstweekday field
   * @param jsxfirstweekday {int} the new value for jsxfirstweekday
   */
  DatePicker_prototype.setFirstDayOfWeek = function( jsxfirstweekday ) {
    if (jsxfirstweekday >= 0 && jsxfirstweekday <= 6) {
      this.jsxfirstweekday = jsxfirstweekday;
    } else {
      throw new jsx3.IllegalArgumentException("jsxfirstweekday", jsxfirstweekday);
    }
  };

  /**
   * Returns the current value of this form field as a JavaScript <code>Date</code> object.
   * @return {Date}
   */
  DatePicker_prototype.getDate = function() {
    if (this.jsxyear != null)
      return DatePicker._newDate(this.jsxyear, this.jsxmonth, this.jsxdate);
    else
      return null;
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._getFormattedDate = function() {
    var date = this.getDate();
    if (date != null) {
      return this._getDateFormat().format(date);
    } else {
      var label = this.getDefaultText();
      return label != null ? label : this._getDateFormat().toString();
    }
  };

  /**
   * Returns the text label to show in this date picker when no date is selected. If this method returns null then 
   * the string representation of the date format is used by default.
   * @return {String}
   * @since 3.9.1
   */
  DatePicker_prototype.getDefaultText = function() {
    return this.jsxnulllabel;
  };

  /**
   * Sets the text label to show in this date picker when no date is selected. This label should not be parsable by
   * the date format of this control. 
   * @param label {String}
   */
  DatePicker_prototype.setDefaultText = function(label) {
    this.jsxnulllabel = label;
  };

  /**
   * Returns the value of this form field (the string displayed in the text box).
   * @return {String}
   */
  DatePicker_prototype.getValue = function() {
    var objGUI = this._getInput();
    return objGUI != null ? objGUI.value : null;
  };


  /**
   * Sets the value of this date picker. This method updates the view immediately.
   * @param vntValue {String|Date|int}
   * @return {jsx3.gui.DatePicker} this object   
   */
  DatePicker_prototype.setValue = function(vntValue) {
    if (vntValue instanceof Date) {
      this.setDate(vntValue);
    } else if (typeof(vntValue) == "number") {
      var d = new Date();
      d.setTime(vntValue);
      this.setDate(d);
    } else if (vntValue && !jsx3.util.strEmpty(vntValue)) {
      this.setDate(this._getDateFormat().parse(vntValue));
    } else {
      this.setDate(null);
    }
    return this;
  };

  /**
   * Set the date value of this form field
   * @param date {Date} may be null to clear the value of the form field
   */
  DatePicker_prototype.setDate = function(date) {
    if (date != null) {
      this.jsxyear = date.getFullYear();
      this.jsxmonth = date.getMonth();
      this.jsxdate = date.getDate();
    } else {
      this.jsxyear = this.jsxmonth = this.jsxdate = null;
    }

    this._setLiveValue(this._getFormattedDate());
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._setLiveValue = jsx3.$F(function(v) {
    var elm = this._getInput();
    if (elm)
      elm.value = v;
  }).slept();

  /** @private @jsxobf-clobber */
  DatePicker_prototype._incrementYear = function(nudge) {
    var date = DatePicker._newDate(this._jsxShownYear+nudge, this._jsxShownMonth, 1);
    this._increment(date, true, nudge > 0);
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._incrementMonth = function(nudge) {
    var date = DatePicker._newDate(this._jsxShownYear, this._jsxShownMonth+nudge, 1);
    this._increment(date, false, nudge > 0);
  };
  
  /** @private @jsxobf-clobber */
  DatePicker_prototype._increment = function(objNewDate, bYear, bUp) {
    var oldDate = DatePicker._newDate(this._jsxShownYear, this._jsxShownMonth, 1);
    if (this.doEvent("jsxchangemonth", {oldDATE:oldDate, newDATE:objNewDate}) !== false) {
      this._jsxShownYear = objNewDate.getFullYear();
      this._jsxShownMonth = objNewDate.getMonth();
      this._repaintCalendar();
      this._focusIncrementor(false, bUp);
    }
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._focusIncrementor = function(bYear, bUp) {
    var heavy = this._getHeavyweight();
    if (heavy != null) {
      var heavyGUI = heavy.getRendered();
      if (heavyGUI != null) {
        // get by id because some browsers don't have TBODY
        var td = jsx3.html.getElementById(heavyGUI, this.getId() + "_" + (bUp ? "u" : "d") + (bYear ? "y" : "m"), true);
        jsx3.html.focus(td);
      }
    }
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._onDateSelected = function(objEvent, objGUI) {
    var ymd = objGUI.id.substring(objGUI.id.lastIndexOf("_")+1).split("-");

    var oldDate = this.getDate();
    var newDate = DatePicker._newDate(ymd[0], ymd[1], ymd[2]);

    if (oldDate == null || newDate.getTime() != oldDate.getTime()) {
      if (this.doEvent(Interactive.CHANGE, {objEVENT:objEvent, oldDATE:oldDate, newDATE:newDate, _gipp:1}) !== false) {
        this.setDate(newDate);
      }
    }

    this._hideCalendar(null, true);
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._repaintCalendar = function() {
    var heavy = this._getHeavyweight();
    if (heavy != null)
      heavy.setHTML(this._paintCalendar(this._jsxShownYear, this._jsxShownMonth), true);
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._doOpen = function(objEvent, objGUI) {
    if (this._jsxfocused) return;
    if (this.getEnabled() != jsx3.gui.Form.STATEENABLED) return;

    var date = this.getDate();
    if (this.jsxyear != null) {
      this._jsxShownYear = this.jsxyear;
      this._jsxShownMonth = this.jsxmonth;
    } else {
      date = new Date();
      this._jsxShownYear = date.getFullYear();
      this._jsxShownMonth = date.getMonth();
    }

    this._showCalendar();
  };

  /** @private */
  DatePicker_prototype._ebChange = function(objEvent, objGUI) {
    if (objGUI.value == "") {
      var currentDate = this.getDate();
      // text input change vetoable also
      if (!currentDate || this.doEvent(Interactive.CHANGE, {objEVENT:objEvent, oldDATE:currentDate, newDATE:null, _gipp:1}) !== false)
        this.setDate(null);
    } else {
      var inputValue = objGUI.value;
      var evtRet = this.doEvent(Interactive.INPUT, {objEVENT:objEvent, strINPUT:inputValue});

      var newDate = null, bParse = true;

      if (evtRet && typeof(evtRet) == "object") {
        if (typeof(evtRet.objDATE) != "undefined") {
          newDate = evtRet.objDATE;
          bParse = false;
        } else if (typeof(evtRet.strINPUT) != "undefined") {
          inputValue = evtRet.strINPUT;
        }
      } else if (evtRet === false) {
        return;
      }

      if (bParse) {
        try {
          newDate = this._getDateFormat().parse(inputValue);
        } catch (e) {
          this._setLiveValue(this._getFormattedDate());
          return;
        }
      }
      
      var oldVal = this.getDate();
      var noChange = (oldVal == newDate || (oldVal && newDate && oldVal.getTime() == newDate.getTime()));

      // text input change vetoable also
      if (noChange || this.doEvent(Interactive.CHANGE, {objEVENT:objEvent, oldDATE:oldVal, newDATE:newDate, _gipp:1}) !== false)
        this.setDate(newDate);
    }
  };

  DatePicker_prototype._ebMouseWheel = function(objEvent, objGUI) {
    var wd = objEvent.getWheelDelta();

    if (wd != 0) {
      var d = this.getDate(), newD = null;
      if (d != null) {
        newD = DatePicker._newDate(d.getFullYear(), d.getMonth(), d.getDate() + (wd > 0 ? 1 : -1));
      } else {
        d = new Date();
        newD = DatePicker._newDate(d.getFullYear(), d.getMonth(), d.getDate());
      }

      if (this.doEvent(Interactive.CHANGE, {objEVENT:objEvent, oldDATE:d, newDATE:newD, _gipp:1}) !== false)
        this.setDate(newD);
    }

    objEvent.cancelAll();
  };

  /** @private */
  DatePicker_prototype._ebMouseUp = function(objEvent, objGUI) {
    if (objEvent.rightButton()) {
      this._hideCalendar();
      this.jsxsupermix(objEvent, objGUI);
    }
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._ebKeyDown = function(objEvent, objGUI) {
    if (!objEvent.hasModifier() && (objEvent.downArrow() || objEvent.upArrow() || objEvent.enterKey())) {
      this._doOpen(objEvent, objGUI);
      objEvent.cancelAll();
    }
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._ebKeyDownOpen = function(objEvent, objGUI) {
    if (objEvent.enterKey() || objEvent.spaceKey())
      this._doOpen(objEvent, objGUI);
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._ebKeyDownCalendar = function(objEvent, objGUI) {
    var bPress = objEvent.getType() == "keypress";

    if (!bPress && objEvent.escapeKey()) {
      this._hideCalendar(null, true);
    } else if (!bPress && objEvent.enterKey()) {
      var target = objEvent.srcElement();
      Event.dispatchMouseEvent(target, Event.CLICK);
    } else if (objEvent.tabKey()) {
      if (objEvent.srcElement() == objGUI) {
        if (objEvent.shiftKey()) {
          objEvent.cancelAll();
          this._hideCalendar(null, true);
        }
      } else if (objEvent.srcElement().getAttribute("tabreturn")) {
        objEvent.cancelAll();
        this._focusIncrementor(true, false);
      }
    }
  };

  DatePicker_prototype.focus = function() {
    var objGUI = this._getInput();
    if (objGUI)
      jsx3.html.focus(objGUI);
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._getInput = function(objGUI) {
    if (objGUI == null) objGUI = this.getRendered();

    if (objGUI)
      return objGUI.childNodes[0].childNodes[0];
  };

  DatePicker_prototype.repaint = function() {
    delete this._jsxdateformat;
    return this.jsxsuper();
  };

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  DatePicker_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    //get the existing box profile
    var b1 = this.getBoxProfile(true, objImplicit);

    if (objGUI) {
      //outer box
      var recalcRst = b1.recalculate(objImplicit, objGUI, objQueue);
      if (!recalcRst.w && !recalcRst.h) return;

      //insulating div
      var b1a = b1.getChildProfile(0);
      b1a.recalculate({width:b1.getClientWidth(),height:b1.getClientHeight()},objGUI?objGUI.childNodes[0]:null, objQueue);

      //textbox input
      var b1a1 = b1a.getChildProfile(0);
      b1a1.recalculate({width:b1a.getClientWidth()-16,height:b1a.getClientHeight()},objGUI?this._getInput(objGUI):null, objQueue);

      //clickable span with bgimage
      var b1a2 = b1a.getChildProfile(1);
      b1a2.recalculate({left:b1a.getClientWidth()-16},objGUI?objGUI.childNodes[0].childNodes[1]:null, objQueue);
    }
  };

  /**
   * Creates the box model/profile for the object
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box}
   * @private
   */
  DatePicker_prototype.createBoxProfile = function(objImplicit) {
    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if (this.getParent() && (objImplicit == null || ((isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if(objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    //determine relative position (this will affect left, top, and boxtype properties)
    var bRelative = (this.getRelativePosition() != 0 && (!this.getRelativePosition() || this.getRelativePosition() == jsx3.gui.Block.RELATIVE));
    var myLeft = (bRelative) ? null : this.getLeft();
    var myTop = (bRelative) ? null : this.getTop();

    var pad, bor, mar, myWidth, myHeight;

    //create outer box
    if (!objImplicit.boxtype)objImplicit.boxtype = (bRelative) ? "relativebox" : "box";
    objImplicit.tagname = "span";
    //NOTE: border and padding will be applied to the insulating div. Only margin is applied to the outer span
    if(bRelative && (mar = this.getMargin()) != null && mar != "") objImplicit.margin = mar;
    if(objImplicit.left == null && myLeft != null) objImplicit.left = myLeft;
    if(objImplicit.top == null && myTop != null) objImplicit.top = myTop;
    //TO DO: move the default height and width to constant
    if(objImplicit.width == null) objImplicit.width = ((myWidth = this.getWidth()) != null && myWidth != "") ? myWidth : 100;
    if(objImplicit.height == null) objImplicit.height = ((myHeight = this.getHeight()) != null && myHeight != "") ? myHeight : 18;
    var b1 = new jsx3.gui.Painted.Box(objImplicit);

    //create the insulating div (fixes the '-moz-inline-box' layout problem for ff, while behaving unobtrusively in ie)
    var o = {};
    o.tagname = "div";
    o.boxtype = "inline";
    o.width = b1.getClientWidth();
    o.height = b1.getClientHeight();
    if((pad = this.getPadding()) != null && pad != "") o.padding = pad;
//    if((bor = this.getBorder()) != null && bor != "") o.border = bor;
    var b1a = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1a);

    //create the textbox input
    o = {};
    o.tagname = "input[text]";
    o.empty = true;
    o.boxtype = "box";
    o.left = 0;
    o.top = 0;
    o.width = b1a.getClientWidth() - 16;
    o.height = b1a.getClientHeight();
    o.padding = "0 0 0 2";
    if((bor = this.getBorder()) != null && bor != "")
      o.border = bor;
    else
      o.border = "1px pseudo";
    var b1a1 = new jsx3.gui.Painted.Box(o);
    b1a.addChildProfile(b1a1);

    //create the clickable graphic
    o = {};
    o.tagname = "span";
    o.boxtype = "box";
    o.left = b1a.getClientWidth() - 16;
    o.top = 0;
    o.width = 13;
    o.height = 18;
    o.padding = "1 1 1 1";
    var b1a2 = new jsx3.gui.Painted.Box(o);
    b1a.addChildProfile(b1a2);

    return b1;
  };

  /**
   * @return {String}
   */
  DatePicker_prototype.paint = function() {
    this.applyDynamicProperties();

    var getMe = "jsx3.GO('" + this.getId() + "')";
    var strBGColor = (this.getEnabled() == jsx3.gui.Form.STATEENABLED) ? this.getBackgroundColor() : this.getDisabledBackgroundColor();

    var eventsMap = {};
    eventsMap[Event.CHANGE] = true;
    eventsMap[Event.MOUSEWHEEL] = true;
    eventsMap[Event.KEYDOWN] = "_ebKeyDown";
    eventsMap[Event.FOCUS] = true;
    eventsMap[Event.BLUR] = true;

    //render attributes and events to bind to the native tag
    var strEvents = this.renderHandlers(eventsMap, 2);
    var strAttributes = this.renderAttributes(null, true);

    //paint the outer-most box
    var b1 = this.getBoxProfile(true);
    b1.setAttributes('id="' + this.getId() + '" class="jsx30datepicker" ' + strAttributes + ' tabindex="-1"');
    b1.setStyles(this.paintZIndex() + this.paintVisibility() + this.paintDisplay() + this.paintCSSOverride());

    //paint the insulating div box
    var b1a = b1.getChildProfile(0);

    //paint the input box
    var b1a1 = b1a.getChildProfile(0);
    b1a1.setAttributes(this.paintName() + ' type="text" value="' + this._getFormattedDate() + '" ' + this.paintIndex() + this.paintTip() + this.paintLabel() + this.paintEnabled() + strEvents);
    b1a1.setStyles(this.paintFontName() + this.paintColor() + this.paintFontWeight() + this.paintTextAlign() + this.paintFontSize() +
                  ((strBGColor != null)?'background-color:' + strBGColor + ';':'') +
                  ((this.getBackground() != null) ? this.getBackground() + ';':''));

    //paint clickable graphic
    var b1a2 = b1a.getChildProfile(1);
    b1a2.setAttributes(' class="open" ' + this.renderHandler(Event.CLICK, "_doOpen", 2));
    b1a2.setStyles('background-image:url(' + this.getIcon(DatePicker.IMAGE_OPEN) + ');');

    //return final string of HTML
    return b1.paint().join(b1a.paint().join(b1a1.paint().join("")+b1a2.paint().join("&#160;")+"&#160;"));
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._paintCalendar = function(year, month) {
    var id = this.getId();
    var getMe = "jsx3.GO('" + id + "')";

    // for obfuscation
    var incrementYear = "_incrementYear";
    var incrementMonth = "_incrementMonth";
    var index = this.paintIndex();

    return '<span class="jsx3_dp_cal"' + index +
          ' style="z-index:5000;position:absolute;left:0px;top:0px;"' + this.renderHandler(Event.KEYDOWN, "_ebKeyDownCalendar") +
          this.renderHandler(Event.KEYPRESS, "_ebKeyDownCalendar") + '>' +
        '<table cellspacing="0" class="jsx3_dp_cal">' +
         '<tr class="year">' +
          '<td class="prev"' + index + ' id="' + id + '_dy" onclick="' + getMe + '.'+incrementYear+'(-1);"><img src="' + DatePicker.IMAGE_PREVIOUS + '" alt="' + this._getLocaleProp("prevy", DatePicker) + '"/></td>' +
          '<td class="title">' + year + '</td>' +
          '<td class="next"' + index + ' id="' + id + '_uy" onclick="' + getMe + '.'+incrementYear+'(1);"><img src="' + DatePicker.IMAGE_NEXT + '" alt="' + this._getLocaleProp("nexty", DatePicker) + '"/></td>' +
         '</tr>' +
         '<tr class="month">' +
          '<td class="prev"' + index + ' id="' + id + '_dm" onclick="' + getMe + '.'+incrementMonth+'(-1);"><img src="' + DatePicker.IMAGE_PREVIOUS + '" alt="' + this._getLocaleProp("prevm", DatePicker) + '"/></td>' +
          '<td class="title">' + this._getMonthName(month) + '</td>' +
          '<td class="next"' + index + ' id="' + id + '_um" onclick="' + getMe + '.'+incrementMonth+'(1);"><img src="' + DatePicker.IMAGE_NEXT + '" alt="' + this._getLocaleProp("nextm", DatePicker) + '"/></td>' +
         '</tr>' +
         '<tr class="days"><td class="cal" colspan="3">' +
          this._paintMonth(year, month) +
         '</td></tr></table>' +
        '</span>';
  };

  /**
   * Returns the URL to use for the clickable image that triggers the calendar to display.
   * @param-private strDefault {String}
   * @return {String}
   * @since 3.7
   */
  DatePicker_prototype.getIcon = function(strDefault) {
    return !jsx3.util.strEmpty(this.jsxicon) ? this.getServer().resolveURI(this.jsxicon) : strDefault;
  };

  /**
   * Sets the URL to use for the clickable image that triggers the calendar to display. If not provided, the default system image will be used.
   * The recommended image size is 13 x 18 pixels.
   * @param strPath {String} This URL will be resolved relative to the project path.
   * @since 3.7
   */
  DatePicker_prototype.setIcon = function(strPath) {
    this.jsxicon = strPath;
  };

  /** @private @jsxobf-clobber */
  DatePicker._getLastDateOfMonth = function(objDate) {
    var month = objDate.getMonth();

    return DatePicker._LAST_DATE_ARRAY[month] ||
        ((DatePicker._newDate(objDate.getFullYear(), month, 29)).getMonth() == month ? 29 : 28);
  };

  /** @private @jsxobf-clobber */
  DatePicker._LAST_DATE_ARRAY = [31,null,31,30,31,30,31,31,30,31,30,31];

  /** @private @jsxobf-clobber */
  DatePicker._newDate = function(y, m, d) {
    var date = new Date(y, m, d);
    if (y >= 0 && y < 100)
      date.setFullYear(date.getFullYear() - 1900);
    return date;
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._paintMonth = function(year, month) {
    var server = this.getServer();

    var firstDay = DatePicker._newDate(year, month, 1);
    var firstWeekDay = this.getFirstDayOfWeek();
    var dayOfFirst = firstDay.getDay();
    var lastDate = DatePicker._getLastDateOfMonth(firstDay);

    var id = this.getId();
    var getMe = "jsx3.GO('" + id + "')";
    // for obfuscation

    var strHTML = [];

    strHTML.push('<table cellspacing="0" class="jsx3_dp_month">');
    // do day of week header
    strHTML.push('<tr>');
    for (var i = firstWeekDay; i < firstWeekDay + 7; i++) {
      strHTML.push('<th>' + this._getDayAbbreviation(i % 7, server) + '</th>');
    }
    strHTML.push('</tr>');

    var firstShownDate = DatePicker._newDate(year, month, 1 - ((dayOfFirst-firstWeekDay+7)%7));
    var lastMonthDate = firstShownDate.getDate();
    var nextMonth = DatePicker._newDate(year, month+1, 1);
    var nextMonthDate = nextMonth.getDate();
    var today = new Date();
    var index = this.paintIndex();
    var normalClickEvent = this.renderHandler(Event.CLICK, "_onDateSelected");

    var i = 0;
    while (i <= lastDate) {
      strHTML.push('<tr>');
      for (var j = 0; j < 7; j++) {

        var tdYear = year;
        var tdMonth = month;
        var tdDate = null;
        var tdClass = null;
        var tdOverClass = "over";

        if (i == 0) {
          if (((j + firstWeekDay) % 7) == dayOfFirst) {
            i = 1;
          } else {
            tdYear = firstShownDate.getFullYear();
            tdMonth = firstShownDate.getMonth();
            tdClass = "prev";
            tdDate = lastMonthDate;
            lastMonthDate++;
          }
        }

        if (i > 0) {
          if (i <= lastDate) {
            tdClass = "normal";
            tdDate = i;
            i++;
          } else {
            tdYear = nextMonth.getFullYear();
            tdMonth = nextMonth.getMonth();
            tdClass = "next";
            tdDate = nextMonthDate;
            nextMonthDate++;
          }
        }

        var bLastDay = j == 6 && i > lastDate, 
            bAllow = this.allowDate(tdYear, tdMonth, tdDate);

        if (this.jsxyear == tdYear && this.jsxmonth == tdMonth && this.jsxdate == tdDate)
          tdClass = "selected";

        var tdToday = (tdDate == today.getDate() &&
            tdMonth == today.getMonth() && tdYear == today.getFullYear());

        if (tdToday) {
          tdClass += " today";
          tdOverClass += " today";
        }

        var overEvt = "", clickEvent = "";
        if (bAllow) {
          clickEvent = normalClickEvent;
          overEvt = ' onmouseover="this.className=\'' + tdOverClass + '\'" onmouseout="this.className=\'' + tdClass + '\'"';
        } else {
          tdClass += " disallowed";
        }
        
        strHTML.push('<td id="' + id + '_' + tdYear + '-' + tdMonth + '-' + tdDate + '"' +
            (bLastDay ? ' tabreturn="true"' : '') +
            index + ' class="' + tdClass + '"' + overEvt + clickEvent + '>' +
            tdDate + '</td>');
      }
      strHTML.push('</tr>');
    }

    strHTML.push('</table>');
    return strHTML.join("");
  };

  /**
   * This method can be overridden on an instance of a DatePicker to control which dates are selectable in the
   * calendar popup. Any dates for which this method returns false will not be selectable in the popup. This default
   * implementation always returns <code>true</code>.
   * 
   * @param y {int} the full year
   * @param m {int} the month (0-11)
   * @param d {int} the day of the month
   * @return {boolean}
   * @since 3.9.1
   */
  DatePicker_prototype.allowDate = function(y, m, d) {
    return true;
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._getDayAbbreviation = function(day, objServer) {
    if (objServer == null) objServer = this.getServer();
    return this._getLocaleProp("date.day.narrow")[day % 7];
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._getMonthName = function(month, objServer) {
    if (objServer == null) objServer = this.getServer();
    return this._getLocaleProp("date.month")[month % 12];
  };

  /** @private @jsxobf-clobber */
  DatePicker_prototype._getHeavyweight = function(bRefresh) {
    var id = "jsxDatePicker" + this.getId();
    var heavy = jsx3.gui.Heavyweight.GO(id);

    if (bRefresh) {
      if (heavy != null)
        heavy.destroy();

      var anchor = this._getInput();
      heavy = new jsx3.gui.Heavyweight(id, this);
      heavy.addXRule(anchor, "E", "W", 0);
      heavy.addXRule(anchor, "W", "E", 0);
      heavy.addYRule(anchor, "N", "N", 0);
      heavy.addYRule(anchor, "S", "S", 0);
    }

    return heavy;
  };

  /**
   * Returns <code>STATEVALID</code> if this date picker is not required or if it is required and its value is not
   * <code>null</code>, otherwise returns <code>STATEINVALID</code>.
   *
   * @return {int}
   * @see jsx3.gui.Form#STATEVALID
   * @see jsx3.gui.Form#STATEINVALID
   */
  DatePicker_prototype.doValidate = function() {
    var state = this.getDate() != null || this.getRequired() == jsx3.gui.Form.OPTIONAL ?
          jsx3.gui.Form.STATEVALID : jsx3.gui.Form.STATEINVALID;
    this.setValidationState(state);
    return state;
  };

  DatePicker_prototype.containsHtmlElement = function(objElement) {
    var hw = this._getHeavyweight();
    return this.jsxsuper(objElement) || (hw != null && hw.containsHtmlElement(objElement));
  };

 DatePicker_prototype._findGUI = function(strCSSName) {
    return (strCSSName.search(/^(?:backgroundColor|color)$/) == 0) ?
            this._getInput() :
            this.getRendered();
  };

  DatePicker_prototype.emSetValue = function(strValue) {
    var es = this.emGetSession();
    var date = null;

    if (strValue == null) {
      es.datetype = "int";
    } else if (!isNaN(strValue) && !isNaN(parseInt(strValue))) {
      date = new Date();
      date.setTime(parseInt(strValue));
      es.datetype = "int";
    } else {
      var df = this._getDateFormat();
      try {
        date = df.parse(strValue);
        es.datetype = "format";
      } catch (e) {
        date = new Date(strValue);
        if (isNaN(date)) {
          date = null;
        } else {
          es.datetype = "native";
        }
      }
    }

    this.setDate(date);
  };

  DatePicker_prototype.emGetValue = function() {
    var date = this.getDate();
    if (date == null) return null;
    var switchOn = this.emGetSession().datetype || "";

    switch (switchOn) {
      case "format":
        return this._getDateFormat().format(date);
      case "native":
        return date.toString();
      default:
        return date.getTime().toString();
    }
  };

  DatePicker_prototype.emCollapseEdit = function(objEvent) {
    //collapses the ephemeral selector associated with a given edit mask
    //jsx3.log('collapsing select box of name, ' + this.getName());
    this._hideCalendar(objEvent,false);
  };

  DatePicker_prototype.onSetChild = function(objChild) {
    return false;
  };
  
});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.DatePicker
 * @see jsx3.gui.DatePicker
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.DatePicker", -, null, function(){});
 */
jsx3.DatePicker = jsx3.gui.DatePicker;

/* @JSC :: end */
