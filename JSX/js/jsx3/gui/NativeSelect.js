/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.xml.Cacheable", "jsx3.gui.Form", "jsx3.gui.Block");

/**
 * The JSX version of a standard GUI select box. XML drives the available options of the select box.
 * <p/>
 * This class requires a CDF data source. The supported CDF attributes are:
 * <ul>
 * <li>jsxid &#8211; the required unique record id.</li>
 * <li>jsxtext &#8211; the text to display on the select option.</li>
 * <li>jsxtip &#8211; the tip to show when the mouse hovers over the option.</li>
 * <li>jsxclass &#8211; the CSS class to apply to the option.</li>
 * <li>jsxstyle &#8211; the CSS style to apply to the option.</li>
 * <li>jsximg &#8211; a relative path to an image (16x16) to display on the option.</li>
 * <li>jsximgalt &#8211; the image alt text.</li>
 * <li>jsxdisabled &#8211; whether the option is disabled or enabled.</li>
 * </ul>
 *
 * @since 3.9
 */
jsx3.Class.defineClass("jsx3.gui.NativeSelect", jsx3.gui.Block, [jsx3.gui.Form, jsx3.xml.Cacheable, jsx3.xml.CDF], function(NativeSelect, NativeSelect_prototype) {

  var LOG = jsx3.util.Logger.getLogger(NativeSelect.jsxclass.getName());

  NativeSelect.DEFAULTCLASSNAME = "jsx3nativesel";

  /* @jsxobf-clobber */
  /* @Embed(source='../../../xsl/jsxnativeselect.xsl', type='xsl') */
  NativeSelect._XSLRSRC = new jsx3.xml.XslDocument().load(jsx3.resolveURI("jsx:///xsl/jsxnativeselect.xsl"));

  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;
  var html = jsx3.html;

  /**
   * The instance initializer.
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param vntLeft {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntTop {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntWidth {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntHeight {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param strSelectedValue {String} this value should correspond to the XML value for the node whose text should be preloaded in the select box when it is painted
   */
  NativeSelect_prototype.init = function(strName,vntLeft,vntTop,vntWidth,vntHeight,strSelectedValue) {
    //call constructor for super class
    this.jsxsuper(strName,vntLeft,vntTop,vntWidth,vntHeight);

    //set default initialization properties
    this.jsxvalue = strSelectedValue;
  };

  /**
   * Returns whether this controls allows multiple selection.
   * @return {int} <code>1</code> (<code>true</code>) or <code>0</code> (<code>false</code>).
   */
  NativeSelect_prototype.getMultiple = function() {
    return this.jsxmultiple;
  };

  /**
   * Sets whether this controls allows multiple selection.
   * @param bMultiple {int}
   */
  NativeSelect_prototype.setMultiple = function(bMultiple) {
    this.jsxmultiple = jsx3.Boolean.valueOf(bMultiple);
  };

  /**
   * Returns the number of options to show. The default is 1, which shows a drop down menu. Any number great than
   * one will show a scrolling list.
   * @return {int}
   */
  NativeSelect_prototype.getSize = function() {
    return this.jsxsize || 1;
  };

  /**
   * Sets the the number of options to show.
   * @param intSize {int}
   */
  NativeSelect_prototype.setSize = function(intSize) {
    this.jsxsize = Math.round(intSize);
  };

  /**
   * Returns the value of this select box. If this is a multi-select then the return value is an array. 
   * @return {String | Array<String>} 
   */
  NativeSelect_prototype.getValue = function() {
    var objGUI = this.getRendered();
    if (objGUI) {
      if (this.getMultiple()) {
        var v = [];
        for (var i = 0; i < objGUI.options.length; i++)
          if (objGUI.options[i].selected)
            v.push(objGUI.options[i].value)
        return v;
      } else {
        return objGUI.value;
      }
    } else {
      return this.jsxvalue;
    }
  };

  /**
   * Sets the value of this select box. If this is a multi-select then <b>strValue</b> may be an array.
   * @param strValue {String | Array<String>}
   */
  NativeSelect_prototype.setValue = function(strValue) {
    this.jsxvalue = strValue;
    var objGUI = this.getRendered();
    if (objGUI)
      this._setMultiValue(objGUI, strValue);
  };

  /** @private @jsxobf-clobber */
  NativeSelect_prototype._getMultiValue = function(objGUI) {
    if (this.getMultiple()) {
      var a = [];
      var o = objGUI.options;
      for (var i = 0; i < o.length; i++)
        if (o[i].selected)
          a.push(o[i].value);
      return a;
    } else {
      return objGUI.value;
    }
  };

  /** @private @jsxobf-clobber */
  NativeSelect_prototype._setMultiValue = function(objGUI, arr) {
    if (this.getMultiple()) {
      var h = jsx3.$H(jsx3.$A.is(arr) ? arr : (arr != null ? [arr] : null));
      var o = objGUI.options;
      for (var i = 0; i < o.length; i++)
        o[i].selected = h[o[i].value] != null;
    } else {
      objGUI.value = arr;
    }
  };

  NativeSelect_prototype.getXSL = function() {
    return NativeSelect._XSLRSRC;
  };

  /**
   * Returns <code>STATEVALID</code> if this select box is not required or if it is required and its value is not
   * empty. If this select is of type combo then any value other than an empty string is valid, otherwise only values
   * corresponding to an actual CDF record of this select are valid.
   *
   * @return {int} <code>jsx3.gui.Form.STATEVALID</code> or <code>jsx3.gui.Form.STATEINVALID</code>.
   */
  NativeSelect_prototype.doValidate = function() {
    var Form = jsx3.gui.Form;
    var b = this.getRequired() == Form.OPTIONAL || Boolean(this.jsxvalue);
    this.setValidationState(b ? Form.STATEVALID : Form.STATEINVALID);
    return this.getValidationState();
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  NativeSelect_prototype.paintBackgroundColor = function() {
    var bgc = this.getEnabled() != jsx3.gui.Form.STATEDISABLED ?
              this.getBackgroundColor() :
              this.getDisabledBackgroundColor() || jsx3.gui.Form.DEFAULTDISABLEDBACKGROUNDCOLOR;
    return bgc ? "background-color:" + bgc + ";" : "";
  };

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  NativeSelect_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 3);
  };

  /**
   * Creates the box model/profile for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @private
   */
  NativeSelect_prototype.createBoxProfile = function(objImplicit) {
    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if(this.getParent() && (objImplicit == null || ((isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if(objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //create outer box
    var bRelative = this.getRelativePosition() != 0;
    var pad, mar, bor;

    var intTop = (!bRelative && !jsx3.util.strEmpty(this.getTop())) ? this.getTop() : 0;
    var intLeft = (!bRelative && !jsx3.util.strEmpty(this.getLeft())) ? this.getLeft() : 0;
    if(objImplicit.left == null) objImplicit.left = intLeft;
    if(objImplicit.top == null) objImplicit.top = intTop;
    if(objImplicit.width == null) objImplicit.width = this.getWidth();
    if(objImplicit.height == null) objImplicit.height = this.getHeight();
    objImplicit.tagname = "select";

    if (!objImplicit.boxtype) objImplicit.boxtype = bRelative ? "inline" : "box";

    //add margin,border, and padding properties
    pad = this.getPadding();
    mar = this.getMargin();
    bor = this.getBorder();
    if (pad != null && pad != "")
      objImplicit.padding = pad;
    //textareas don't use a default left/right margin as textbox would as textboxes are inline elements
    if (bRelative && (mar = this.getMargin()) != null && mar != "")
      objImplicit.margin = mar;
    if (bor != null && bor != "")
      objImplicit.border = bor;

    return new jsx3.gui.Painted.Box(objImplicit);
  };

  /**
   * Returns the DHTML representation of this select box.
   * @return {String} DHTML
   */
  NativeSelect_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    if (this.getXmlAsync())
      var objXML = this.getXML();

    //initialize variables
    var strId = this.getId();

    var eventMap = {};
    eventMap[Event.CHANGE] = true;
    if (this.hasEvent(Interactive.JSXBLUR))
      eventMap[Event.BLUR] = true;
    if (this.hasEvent(Interactive.JSXFOCUS))
      eventMap[Event.FOCUS] = true;
    if (this.hasEvent(Interactive.JSXKEYDOWN))
      eventMap[Event.KEYDOWN] = true;

    //render custom atts
    var strImplementedEvents = this.renderHandlers(eventMap, 0);
    var strProps = this.renderAttributes(null, true);

    var styles = this.paintFontName() + this.paintFontSize() + this.paintFontWeight() + this.paintVisibility() +
                   this.paintDisplay() + this.paintZIndex() + this.paintBackgroundColor() + this.paintBackground() +
                   this.paintColor() + this.paintTextAlign() + this.paintCSSOverride() + this.paintCursor();

    //generate and return final HTML
    var b1 = this.getBoxProfile(true);
    b1.setAttributes(' id="' + strId + '"' + this.paintName() + this.paintEnabled() + this.paintIndex() +
                     this._paintMultiple() + this._paintSize() + 
                     this.paintTip() + strImplementedEvents + ' class="' + this.paintClassName() + '" ' + strProps);
    b1.setStyles(styles);

    return b1.paint().join(this._xmlOptionsHTML());
  };

  NativeSelect_prototype._ebChange = function(objEvent, objGUI) {
    var val = this._getMultiValue(objGUI);
    if (!jsx3.$A(this.jsxvalue).eq(jsx3.$A(val))) {
      var cont = this.doEvent(Interactive.BEFORE_SELECT, {objEVENT:objEvent, strRECORDID:val});

      if (cont === false) {
        this._setMultiValue(objGUI, this.jsxvalue);
      } else {
        this.jsxvalue = val;
        this.doEvent(Interactive.SELECT, {objEVENT:objEvent, strRECORDID:val, _gipp:1});
      }
    }
  };

  NativeSelect_prototype.onXmlBinding = function(objEvent) {
    this.jsxsupermix(objEvent);
    this._repaintOptions();
  };

  /** @private @jsxobf-clobber */
  NativeSelect_prototype._repaintOptions = function() {
    var objGUI = this.getRendered();
    if (objGUI)
      objGUI.innerHTML = this._xmlOptionsHTML();
  };

  /** @private @jsxobf-clobber */
  NativeSelect_prototype._xmlOptionsHTML = function() {
    var strContent = this.doTransform({_value:this.jsxvalue});
    strContent = this._removeFxWrapper(strContent);
    return strContent;
  };

  /** @private @jsxobf-clobber */
  NativeSelect_prototype._paintMultiple = function() {
    return this.getMultiple() ? ' multiple="multiple"' : '';
  };

  /** @private @jsxobf-clobber */
  NativeSelect_prototype._paintSize = function() {
    var intSize = this.getSize();
    return intSize > 1 ? ' size="' + intSize + '"' : '';
  };

  /**
   * A compliant but inefficient implementation. Don't call this in a loop.
   */
  NativeSelect_prototype.redrawRecord = function(strRecordId, intAction) {
    this._repaintOptions();
  };

  NativeSelect_prototype.paintClassName = function() {
    var cn = this.getClassName();
    return NativeSelect.DEFAULTCLASSNAME + (cn ? " " + cn : "");
  };
  
  NativeSelect_prototype.onSetChild = function(child) {
    return !(child instanceof jsx3.gui.Painted);
  };  

  NativeSelect_prototype.emInit = function(objColumn) {
    this.jsxsupermix(objColumn);
    this.subscribe(Interactive.SELECT, this, "_emOnSelect");

    var eType = Interactive.JSXKEYDOWN;
    if (! this.hasEvent(eType))
      this.setEvent("1;", eType); // so that event is published
    this.subscribe(eType, this, "_emKeyDown");
  };

  /** @private @jsxobf-clobber */
  NativeSelect_prototype._emOnSelect = function(objEvent) {
    this.commitEditMask(objEvent.context.objEVENT, true);
  };

  /** @private @jsxobf-clobber */
  NativeSelect_prototype._emKeyDown = function(objEvent) {
    var evt = objEvent.context.objEVENT;
    var kc = evt.keyCode();
    if (kc == Event.KEY_ARROW_DOWN || kc == Event.KEY_ARROW_UP) {
      if (!evt.ctrlKey()) {
        evt.cancelBubble();
      } else {
        this.commitEditMask(objEvent.context.objEVENT);        
      }
    }
  };

});
