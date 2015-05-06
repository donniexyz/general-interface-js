/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.xml.Cacheable", "jsx3.gui.Form", "jsx3.gui.Heavyweight", "jsx3.gui.Block",
    "jsx3.util.MessageFormat");

/**
 * The JSX version of a standard GUI select box. XML drives the contents of the select box.
 * <p/>
 * This class requires a CDF data source. The supported CDF attributes are:
 * <ul>
 * <li>jsxid &#8211; the required unique record id.</li>
 * <li>jsxtext &#8211; the text to display in the select box for the record.</li>
 * <li>jsxtip &#8211; the tip to show when the mouse hovers over the record.</li>
 * <li>jsxstyle &#8211; the CSS style to apply to the record.</li>
 * <li>jsximg &#8211; a relative path to an image (16x16) to display to the left of @jsxtext.</li>
 * </ul>
 */
jsx3.Class.defineClass("jsx3.gui.Select", jsx3.gui.Block, [jsx3.gui.Form, jsx3.xml.Cacheable, jsx3.xml.CDF], function(Select, Select_prototype) {

  var LOG = jsx3.util.Logger.getLogger(Select.jsxclass.getName());

  var Interactive = jsx3.gui.Interactive;
  var Event = jsx3.gui.Event;
  var html = jsx3.html;

/* @JSC :: begin DEP */

  /**
   * {String} The default background color of a select box.
   * @deprecated
   */
  Select.DEFAULTBACKGROUNDCOLOR = "#ffffff";

  /**
   * {String} The text label of the null record when no record is selected.
   * @deprecated  This value is now localized.
   */
  Select.DEFAULTTEXT = "- Select -";

/* @JSC :: end */

  /**
   * {String} The URL of the default XSL template of a normal select box.
   */
  Select.DEFAULTXSLURL = jsx3.resolveURI("jsx:///xsl/jsxselect.xsl");

  /* @jsxobf-clobber */
  /* @Embed(source='../../../xsl/jsxselect.xsl', type='xsl') */
  Select._XSLRSRC = new jsx3.xml.XslDocument().load(Select.DEFAULTXSLURL);

/* @JSC :: begin DEP */

  /**
   * {String}
   * @deprecated  Renamed to <code>DEFAULTXSLURL</code>.
   */
  Select.SELECTXSLURL = Select.DEFAULTXSLURL;

  /**
   * {String} The default XSL id of a normal select box.
   * @deprecated
   */
  Select.SELECTXSLID = "JSX_SELECT_XSL";

  /**
   * {String} The URL of the default XSL template of a combo select box.
   * @deprecated  Renamed to <code>DEFAULTXSLURL</code>.
   */
  Select.COMBOXSLURL = Select.DEFAULTXSLURL;

  /**
   * {String} The default XSL id of a combo select box.
   * @deprecated
   */
  Select.COMBOXSLID = "JSX_COMBO_XSL";

/* @JSC :: end */

  /**
   * {String} The URL of the arrow image.
   */
  Select.ARROWICON = jsx3.resolveURI("jsx:///images/select/arrow.gif");

  /**
   * {String} The URL of the mouse over background image.
   */
  Select.OVERIMAGE = jsx3.resolveURI("jsx:///images/select/selectover.gif");

  /**
   * {String} The URL of the selected background image.
   */
  Select.SELECTEDIMAGE = jsx3.resolveURI("jsx:///images/select/selected.gif");

  /* @JSC */ if (jsx3.CLASS_LOADER.IE6) {
  html.loadImages(Select.ARROWICON, Select.OVERIMAGE, Select.SELECTEDIMAGE);
  /* @JSC */}
    
/* @JSC :: begin DEP */

  /**
   * {String}
   * @deprecated  This value is now localized.
   */
  Select.NODATAMESSAGE = "<div tabIndex='0' class='jsx30select_option' onmousedown='var e = jsx3.gui.Event.wrap(event); jsx3.gui.Event.publish(e); e.cancelBubble();'>- data unavailable -</div>";

  /**
   * {String}
   * @deprecated  This value is now localized.
   */
  Select.NOMATCHMESSAGE  = "<div tabIndex='0' class='jsx30select_option' onmousedown='var e = jsx3.gui.Event.wrap(event); jsx3.gui.Event.publish(e); e.cancelBubble();'>- no match found -</div>";

/* @JSC :: end */

  /**
   * {jsx3.util.MessageFormat}
   * @private
   * @jsxobf-clobber
   */
  Select._OPTION_FORMAT = new jsx3.util.MessageFormat('<div tabIndex="0" class="jsx30select_option jsx30select_none" onmousedown="var e=jsx3.gui.Event.wrap(event); jsx3.gui.Event.publish(e); e.cancelBubble();"><span style="left:0px;">{0}</span></div>');

  /**
   * {int} Value of the type field indicating a normal select box.
   * @final @jsxobf-final
   */
  Select.TYPESELECT = 0;

  /**
   * {int} Value of the type field indicating a combo select box.
   * @final @jsxobf-final
   */
  Select.TYPECOMBO = 1;

  /**
   * {int} The number of milliseconds of delay for the combo typeahead function.
   */
  Select.TYPEAHEADDELAY = 250;

  /** @private @jsxobf-clobber */
  Select._ACTIVE = null;

  /** @private @jsxobf-clobber */
  Select._OPTION_TO = null;

  /** @private @jsxobf-clobber */
  Select._HW_ID = "jsx30curvisibleoptions";

  /**
   * {String} jsx30select_select
   */
  Select.DEFAULTCLASSNAME = "jsx30select_select";

  /**
   * The instance initializer.
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param vntLeft {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntTop {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntWidth {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntHeight {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param strSelectedValue {String} this value should correspond to the XML value for the node whose text should be preloaded in the select box when it is painted
   */
  Select_prototype.init = function(strName,vntLeft,vntTop,vntWidth,vntHeight,strSelectedValue) {
    //call constructor for super class
    this.jsxsuper(strName,vntLeft,vntTop,vntWidth,vntHeight);

    //set default initialization properties
    this.jsxvalue = strSelectedValue;
  };

  /**
   * Returns the XSL appropriate to the select type (either combo or select) if no custom XSLT is specified.
   * @return {jsx3.xml.Document} jsx3.xml.Document instance
   */
  Select_prototype.getXSL = function() {
    return this._getSharedXSL(Select.DEFAULTXSLURL, Select._XSLRSRC);
  };

  /**
   * Returns <code>STATEVALID</code> if this select box is not required or if it is required and its value is not
   * empty. If this select is of type combo then any value other than an empty string is valid, otherwise only values
   * corresponding to an actual CDF record of this select are valid.
   *
   * @return {int} <code>jsx3.gui.Form.STATEVALID</code> or <code>jsx3.gui.Form.STATEINVALID</code>.
   */
  Select_prototype.doValidate = function() {
    var Form = jsx3.gui.Form;
    var b = this.getRequired() == Form.OPTIONAL;
    if (!b) {
      var v = this.getValue();
      if (this.getType() == Select.TYPESELECT) {
        b = this.getRecordNode(v) != null;
      } else {
        b = v != null && v.length > 0;
      }
    }
    this.setValidationState(b ? Form.STATEVALID : Form.STATEINVALID);
    return this.getValidationState();
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  Select_prototype.paintBackgroundColor = function() {
    var bgc = this.getEnabled() != jsx3.gui.Form.STATEDISABLED ?
              this.getBackgroundColor() :
              this.getDisabledBackgroundColor() || jsx3.gui.Form.DEFAULTDISABLEDBACKGROUNDCOLOR;
    return bgc ? "background-color:" + bgc + ";" : "";
  };

  /**
   * Returns the type of this select box.
   * @return {int} <code>TYPESELECT</code> or <code>TYPECOMBO</code>.
   * @see #TYPESELECT
   * @see #TYPECOMBO
   */
  Select_prototype.getType = function() {
    return (this.jsxtype == null) ? Select.TYPESELECT : this.jsxtype;
  };

  /**
   * Sets the type of this select box.
   * @param TYPE {int} <code>TYPESELECT</code> or <code>TYPECOMBO</code>.
   * @return {jsx3.gui.Select} this object.
   * @see #TYPESELECT
   * @see #TYPECOMBO
   */
  Select_prototype.setType = function(TYPE) {
    this.jsxtype = TYPE;
    this.setBoxDirty();
    return this;
  };

  /**
   * Returns the text to display in this select box if the value of this select box is <code>null</code>.
   * If no value has been explicitly set with <code>setDefaultText()</code> a value appropriate to the server locale
   * is returned.
   * @return {String}
   */
  Select_prototype.getDefaultText = function() {
    return (this.jsxdefaulttext != null && this.jsxdefaulttext != null) ?
        this.jsxdefaulttext : this._getLocaleProp("defaultText", Select);
  };

  /**
   * Sets the text to display in this select box if the value of this select box is <code>null</code>.
   * @param strDefaultText {String} any valid string. HTML markup is allowed, but may cause unpredicatable effects.
   * @return {jsx3.gui.Select} this object.
   */
  Select_prototype.setDefaultText = function(strDefaultText) {
    this.jsxdefaulttext = strDefaultText;
    return this;
  };

  /** @private @jsxobf-clobber */
  Select_prototype._ebKeyDownSelect = function(objEvent, objGUI) {
    // check for hot keys
    if (this._ebKeyDown(objEvent, objGUI)) return;

    var srcElm = objEvent.srcElement();
    var jsxtype = srcElm.getAttribute("jsxtype");
    var jsxid = srcElm.getAttribute("jsxid");
    var bMod = objEvent.hasModifier();

    if ((objEvent.spaceKey() || objEvent.enterKey()) && jsxid != null) {
      //an option item had focus and user space bar to select it
      this._doSelectRecord(objEvent, srcElm.getAttribute("jsxid"));
      this.hide(true);
    } else if (jsxtype == "Display" || jsxtype == "Text" || jsxtype == "Select") {
      if (objEvent.downArrow() && !bMod) {
        //down-arrow triggers option list to show
        this._show();
      } else {
        //exit early; let natural key behavior occur
        return;
      }
    } else if (objEvent.leftArrow() || objEvent.escapeKey()) {
      //if we are navigating the options list and user left-arrows, close options list and give focus back to persistent selectbox
      this.hide(true);
    } else if (objEvent.downArrow()) {
      if (bMod) return;
      if (srcElm == objGUI.lastChild || jsxid == null) {
        this._focusItem(objGUI.firstChild.nextSibling); // beware the space at #0
      } else {
        this._focusItem(srcElm.nextSibling);
      }
    } else if (objEvent.upArrow()) {
      if (bMod) return;
      if (srcElm == objGUI.firstChild.nextSibling || jsxid == null) {
        this._focusItem(objGUI.lastChild);
      } else {
        this._focusItem(srcElm.previousSibling);
      }
    } else if (objEvent.tabKey()) {
      if (objEvent.hasModifier(true)) return;
      this._doSelectRecord(objEvent, srcElm.getAttribute("jsxid"));
      html[objEvent.shiftKey() ? "focusPrevious" : "focusNext"](this.getRendered(objEvent), objEvent);
      this.hide(false);
      return;
    } else {
      return;
    }

    objEvent.cancelAll();
  };

  /** @private @jsxobf-clobber */
  Select_prototype._isOpen = function(objEvent) {
    var hw = jsx3.gui.Heavyweight.GO(Select._HW_ID);
    var content = hw ? hw.getRendered(objEvent).childNodes[0].childNodes[0] : null;
    // The drop down list is there only if there is a match
    var bOpen = content && content.getAttribute("jsxselid") == this.getId();
    return bOpen ? [bOpen, content.childNodes[1].getAttribute("jsxid"), content] : false;
  };
  
  /** @private @jsxobf-clobber */
  Select_prototype._ebKeyDownCombo = function(objEvent, objGUI) {
    // check for hot keys
    if (this._ebKeyDown(objEvent, objGUI)) return;
    var bMod = objEvent.hasModifier();

    if (!bMod && (objEvent.downArrow() || objEvent.enterKey())) {
      var bOpen = this._isOpen(objEvent);
      // The drop down list is there only if there is a match
      if (bOpen) {
        if (objEvent.downArrow()) { // arrow down focus on first match item
          // only do the focus if we have an actual item
          if (bOpen[1])
            this._focusItem(bOpen[2].childNodes[1]);
        } else { // enter key must be, select the first/top match
          this.hide(false);
          this._doBlurCombo(objEvent, this._getInputElement(objGUI)); // commit the typed edit on enter key
        }
      } else { // no drop down list yet, show it on enter or arrow key down
        var filter = objEvent.enterKey() ? "" : this.getText();
        this._show(filter);
      }
      objEvent.cancelAll();
    } else if (objEvent.tabKey() && objEvent.shiftKey() && !objEvent.hasModifier(true)) {
      html.focusPrevious(this.getRendered(objEvent), objEvent);
    } else if (!bMod && (objEvent.rightArrow() || objEvent.leftArrow())) {
      // This logic allows Combo to be used as edit mask. Matrix will only see key events that should cause
      // focus to move to a new cell, to the left or right.
      var bPre = objEvent.leftArrow();
      var input = this._getInputElement();
      var value = input.value;
      var sel = html.getSelection(input);
      if ((bPre && (sel.getStartIndex() > 0 || sel.getEndIndex() > 0)) ||
          (!bPre && (sel.getStartIndex() < value.length || sel.getEndIndex() < value.length)))
        objEvent.cancelBubble();
    } else {
      var inputElm = this._getInputElement();
      var val1 = inputElm.value;

      jsx3.sleep(function() {
        if (this.getParent() == null) return;

        var val2 = inputElm.value;
        if (val1 != val2) {
          if (Select._OPTION_TO)
            window.clearTimeout(Select._OPTION_TO);

          var me = this;
          Select._OPTION_TO = window.setTimeout(function() {
            if (me.getParent() == null) return;

            Select._OPTION_TO = null;
            me._show(val2);
          }, Select.TYPEAHEADDELAY);
        }
      }, null, this);
    }
  };

  /** @private @jsxobf-clobber */
  Select_prototype._doKeyDownItem = function(objEvent, objGUI) {
    this._ebKeyDownSelect(objEvent, objGUI);
  };

  /**
   * Returns handle to on-screen element that contains the display text for the select/combo. Either a span or input
   * @return {HTMLElement} HTML element (either a span or input)
   * @private
   * @jsxobf-clobber
   */
  Select_prototype._getInputElement = function(objGUI) {
    objGUI = this.getRendered(objGUI);
    return (objGUI) ? ((this.getType() == Select.TYPECOMBO) ? objGUI.childNodes[0].childNodes[0].childNodes[0] : objGUI.childNodes[0].childNodes[0] ) : null;
  };

  /**
   * Displays the list of options for this select box.
   */
  Select_prototype.show = function() {
    var objGUI = this.getRendered();
    if (objGUI) this._show();
  };

  /**
   * called when an option is clicked (selected) by the user
   * @param objGUI {HTMLElement} on-screen HTML element that was clicked
   * @private
   * @jsxobf-clobber
   */
  Select_prototype._doClickItem = function(objEvent, objGUI) {
    var optionGUI = objEvent.srcElement();

    //locate the jsxid property for the option (an HTML element) that was clicked by the user
    while (optionGUI != null && (!optionGUI.getAttribute || optionGUI.getAttribute("jsxid") == null)) {
      optionGUI = optionGUI.parentNode;
      if (optionGUI == objGUI) optionGUI = null;
    }

    //a valid click event occurred; update the id of the selected item/deref the old item
    if (optionGUI != null) this._doSelectRecord(objEvent, optionGUI.getAttribute("jsxid"));

    //hide options group and give focus to the persistent sel box
    this.hide(true);
  };

  /** @private @jsxobf-clobber */
  Select_prototype._focusItem = function(objGUI) {
    if (this._jsxfocusedgui) {
      try {
        this._jsxfocusedgui.style.backgroundImage = "url(" + jsx3.gui.Block.SPACE + ")";
      } catch (e) {;}
      this._jsxfocusedgui = null;
    }

    if (objGUI) {
      html.focus(objGUI);
      objGUI.style.backgroundImage = "url(" + Select.OVERIMAGE + ")";
      /* @jsxobf-clobber */
      this._jsxfocusedgui = objGUI;

      var objH = jsx3.gui.Heavyweight.GO(Select._HW_ID);
      objH.scrollTo(objGUI);
    }
  };

  /**
   * when the type for the select is "Combo", this is called when the text entry portion of the combo loses
   *             focus, resulting in a lookup to see if a match was found and if the selected id needs to update for the combo
   * @private
   * @jsxobf-clobber
   */
  Select_prototype._doBlurCombo = function(objEvent, objGUI) {
    var strText = objGUI.value;
    //In xpath selection expression string, Quote and Apostrophes cannot be escaped at same time.
    //TODO: this has to be resolved...

    var record = this._cdfan("children");
    var jsxtext = this._cdfan("text");
    var jsxid = this._cdfan("id");

    var xpr = (strText.indexOf("'") == -1) ?
    ["//"+record+"[@"+jsxtext+"='", strText,"' or (not(@"+jsxtext+") and @"+jsxid+"='", strText, "')]"].join("") :
    ["//"+record+"[@"+jsxtext+'="', strText,'" or (not(@'+jsxtext+') and @'+jsxid+'="', strText, '")]'].join('');
    
    //locate a match; if found, update the selected value for the instance
    var objNode = this.getXML().selectSingleNode(xpr);
    var bOpen = this._isOpen(objEvent);
    
    if (!bOpen) {
      delete this._jsxcheckonblur;

      if (objNode != null) {
          this._doSelectRecord(objEvent, this._cdfav(objNode, "id"));
      } else if (strText != this.jsxvalue) {
        var cont = this.doEvent(Interactive.CHANGE, {objEVENT:objEvent, strVALUE:strText});
        if (cont !== false) {
          //no match was found in the datamodel, so assume that the value will be made equal to the current value of the textbox
          this.jsxvalue = strText;
        } else {
          this.redrawRecord(this.jsxvalue);
        }
      }
    } else {
      // In the case that the combo drop down is open, we don't do a change event here because focus may be going
      // to the drop down. But, we need to make sure that when the drop down closes, we come back here and possibly
      // fire a change event. 
      /* @jsxobf-clobber */
      this._jsxcheckonblur = 1;
    }
  };

  /**
   * Hides the drop-down portion of this select control.
   * @param bFocus {boolean} if <code>true</code>, the form control will be focused after hiding the drop-down.
   */
  Select_prototype.hide = function(bFocus) {
    if (Select._ACTIVE == this) {
      var objH = jsx3.gui.Heavyweight.GO(Select._HW_ID);
      //destroy the heavyweight container that holds the ephemeral option list
      if (objH) objH.destroy();

      // give focus back to persistent handle for select
      if (bFocus) {
        try {
          this.focus();
        } catch (e) {;}
      }

      Event.unsubscribeLoseFocus(this);
      Select._ACTIVE = null;
    }

    if (Select._OPTION_TO) {
      Select._OPTION_TO = null;
      window.clearTimeout(Select._OPTION_TO);
    }
  };

/* @JSC :: begin DEP */

  /**
   * @package
   * @deprecated
   */
  Select.hideOptions = function() {
    if (Select._ACTIVE != null)
      Select._ACTIVE.hide();
  };

/* @JSC :: end */

  /** @private @jsxobf-clobber */
  Select._getMode = function() {
    var intMode = html.getMode();
    if (intMode == html.MODE_IE_STRICT && jsx3.CLASS_LOADER.getVersion() >= 7)
      intMode += "x";
    return intMode;
  };

  /**
   * displays a list of options to user; it has no effect on the model and only exists to provide interactivity
   * @private
   * @jsxobf-clobber
   */
  Select_prototype._show = function(strFilter) {
    if (this._jsxopening) return;

    var objGUI = this.getRendered();

    //updates VIEW; has no effect on MODEL; exists to provide user interactions
    if (objGUI != null) {
      //since this is a static method, derive instance of select by using its id
      var TYPE = this.getType();
      var doc = objGUI.ownerDocument;

      if (Select._ACTIVE != null)
        Select._ACTIVE.hide(false);
      Select._ACTIVE = this;

      //get absolute screen (view) position for the select (we need its real, on-screen width)
      var objAbs = this.getAbsolutePosition(doc.getElementsByTagName("body")[0]);
      var intTrueWidth = objAbs.W;
      var bCombo = this.getType() == Select.TYPECOMBO;

      //create parameter object (a name/value hash) to pass to the XSL for transformation
      var objP = {};
      objP.jsxtabindex = (this.getIndex()) ? this.getIndex() : 0;
      objP.jsxselectedimage = Select.SELECTEDIMAGE;
      objP.jsxselectedimagealt = this._getLocaleProp("sel", Select);
      objP.lc = this._getLocaleProp("jsx3.lc");
      objP.uc = this._getLocaleProp("jsx3.uc");
      objP.jsxtransparentimage = jsx3.gui.Block.SPACE;
      objP.jsxdragtype = "JSX_GENERIC";
      objP.jsxid = this.getId();
      objP.jsxselectedid = (this.getValue() == null) ? "null" : this.getValue();
      objP.jsxpath = jsx3.getEnv("jsxabspath");
      objP.jsxpathapps = jsx3.getEnv("jsxhomepath");
      objP.jsxpathprefix = this.getUriResolver().getUriPrefix();
      objP.jsxappprefix = this.getServer().getUriPrefix();
      objP.jsxmode = Select._getMode();

      if (bCombo) {
        objP.jsxsortpath = "jsxtext";
        objP.jsx_type = "combo";
      }

      //if this is a combo, get the value for the textbox
      if (strFilter != null) objP.jsxtext = strFilter;

      //loop to override default parameter values with user's custom values as well as add additional paramters specified by the user
      var objParams = this.getXSLParams();
      for (var p in objParams) objP[p] = objParams[p];

      //perform the merge/transformation; since combo boxes often result in empty transformations (no match found), pass 'true' to cancel any system errors
      var strContent = this.doTransform(objP);
      if (! jsx3.xml.Template.supports(jsx3.xml.Template.DISABLE_OUTPUT_ESCAPING))
        strContent = html.removeOutputEscapingSpan(strContent);
      //LUKE: 3.2
              //appears the mozilla requires well-formed output (unless text is specified); since I force my own well-formed-ness with the following tag, I know how to remove it
      strContent = this._removeFxWrapper(strContent);

      if (! strContent.match(/\<div/i)) {
        strContent = Select._OPTION_FORMAT.format(
            this._getLocaleProp(TYPE == Select.TYPESELECT ? "dataUnavailable" : "noMatch", Select));
      }

      var box1 = new jsx3.gui.Painted.Box({width: intTrueWidth, height:1, border:"0px;1px;0px;1px"});
      box1.calculate();
      var spacerWidth = box1.getClientWidth();

      // makes sure the dropdown portion is not narrower than the control
      var spacer = '<div style="height:1px;width:'+spacerWidth+'px;position:relative;left:0px;top:0px;' +
          'padding:0px;margin:0px 0px -1px 0px;overflow:hidden;">&#160;</div>';

      //generate DHTML for child option group
      var strHTML = '<div tabindex="0" jsxselid="' + this.getId() + '"' +
          this.renderHandler(Event.KEYDOWN, "_doKeyDownItem") +
          this.renderHandler(Event.CLICK, "_doClickItem") +
          this.renderHandler(Event.MOUSEDOWN, "_doMouseDownItem") +
          this.renderHandler(Event.MOUSEOVER, "_doMouseOverItem") +
          ' jsxtype="Options" class="jsx30select_optionlist" style="' + this.paintBackgroundColor() +
          'min-width:' + spacerWidth + 'px;' + this.paintFontName() + this.paintFontSize() + this.paintFontWeight() +
          this.paintTextAlign() + '">' + spacer + strContent + '</div>';

      //create and configure a HW instance to contain the option list for the select
      var objHW = new jsx3.gui.Heavyweight(Select._HW_ID, this);
      objHW.setHTML(strHTML);
      objHW.setScrolling(true);
      objHW.setClassName("jsx30shadow");

      objHW.addXRule(objGUI,"W","W",0);
      objHW.addXRule(objGUI,"E","E",0);
      objHW.addYRule(objGUI,"S","N",0);
      objHW.addYRule(objGUI,"N","S",0);
      objHW.show();

      var hwGUI = objHW.getRendered();
      var divContent = hwGUI.childNodes[0].childNodes[0];
      var contentWidth = Math.max(divContent.offsetWidth - 2, divContent.clientWidth) + "px";

/* @JSC */ if (jsx3.CLASS_LOADER.IE && html.getMode() == 2 ) {
      // HACK: size content and all item divs (needed for IE XHTML mode)
      for (var i = 0; i < divContent.childNodes.length; i++) {
        var c = divContent.childNodes[i];
        if (c.nodeName && c.nodeName.toLowerCase() == "div" && c.getAttribute("jsxid"))
          divContent.childNodes[i].style.width = contentWidth;
      }
/* @JSC */ }

      //show the options list and give focus to the first element if this is a select (combos keep focus, so user can keep typing)
      if (TYPE == Select.TYPESELECT || strFilter == null) {
        this._jsxopening = true;
        jsx3.sleep(function() {
          if (this.getParent() == null) return;

          delete this._jsxopening;

          var myNode = this.getRecordNode(this.getValue());
          var objItem = myNode ? this.getDocument().getElementById(this.getId() + "_" + this.getValue()) : null;

          try {
            if (objItem)
              this._focusItem(objItem);
            else
              html.focus(divContent);
          } catch (e) { LOG.info("Error focusing first object: " + jsx3.NativeError.wrap(e)); }
        }, null, this);
      } else {
        html.focus(this._getInputElement());
      }

      // subscribe/unsubscribe as needed
      Event.subscribeLoseFocus(this, objGUI, "_checkLoseFocus");
    }
  };

  /** @private @jsxobf-clobber */
  Select_prototype._checkLoseFocus = function(objEvent) {
    var focusedElm = objEvent.event.srcElement();
    if (! this.containsHtmlElement(focusedElm)) {
      this.hide(false);

      // force the doBlur event handler if the combo box was NOT focused
      if (this._jsxcheckonblur || (this._jsxfocusedgui && this.getType() == Select.TYPECOMBO)) {
        var objGUI = this._getInputElement();
        if (objGUI)
          this._doBlurCombo(objEvent, objGUI);
      }
    }
  };

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  Select_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    var b1 = this.getBoxProfile(true, objImplicit);

    if (objGUI) {
      //recalculate the boxes
      var recalcRst = b1.recalculate(objImplicit, objGUI, objQueue);
      if (!recalcRst.w && !recalcRst.h) return;

      var b1a = b1.getChildProfile(0);
      b1a.recalculate({parentwidth:b1.getClientWidth(),parentheight:b1.getClientHeight()},(objGUI)?objGUI.childNodes[0]:null,objQueue);
      var b1b = b1a.getChildProfile(0);

      //combos have an extra textbox child
      if (this.getType() != Select.TYPESELECT) {
        var b1c = b1b.getChildProfile(0);
        b1c.recalculate({parentwidth:b1a.getClientWidth()-1,parentheight:b1a.getClientHeight()},
            (objGUI)?html.selectSingleElm(objGUI, 0, 0, 0):null, objQueue);
      } else {
        b1b.recalculate({parentwidth:b1a.getClientWidth(),parentheight:b1a.getClientHeight()},(objGUI)?objGUI.childNodes[0].childNodes[0]:null,objQueue);
      }
    }
  };

  /**
   * Creates the box model/profile for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @private
   */
  Select_prototype.createBoxProfile = function(objImplicit) {
    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if(this.getParent() && (objImplicit == null || ((isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if(objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    var bRelative = (this.getRelativePosition() != 0 && (!this.getRelativePosition() || this.getRelativePosition() == jsx3.gui.Block.RELATIVE));
    var bor, mar, pad, vWidth, vHeight;

    objImplicit.tagname = "span";
    objImplicit.border = ((bor = this.getBorder()) != null && bor != "") ? bor : "solid 1px #a6a6af;solid 1px #e6e6e6;solid 1px #e6e6e6;solid 1px #a6a6af";
    objImplicit.margin = (bRelative && (mar = this.getMargin()) != null && mar != "") ? mar : null;
    if (!objImplicit.boxtype)objImplicit.boxtype = (bRelative) ? "relativebox" : "box";
    if(objImplicit.left == null) objImplicit.left = (!bRelative && !jsx3.util.strEmpty(this.getLeft())) ? this.getLeft() : 0;
    if(objImplicit.top == null) objImplicit.top = (!bRelative && !jsx3.util.strEmpty(this.getTop())) ? this.getTop() : 0;
    if(objImplicit.width == null) objImplicit.width = ((vWidth = this.getWidth()) != null) ? vWidth : 100;
    if(objImplicit.height == null) objImplicit.height = ((vHeight = this.getHeight()) != null) ? vHeight : 18;
    objImplicit.padding = "0 0 0 0";
    var b1 = new jsx3.gui.Painted.Box(objImplicit);

    var o = {};
    o.tagname = "div";
    o.boxtype = "relativebox";
    if((pad = this.getPadding()) != null && pad != "") {
      o.padding = pad;
    } else {
      o.padding = "0 19 0 0";
    }
    o.parentwidth = b1.getClientWidth();
    o.parentheight = b1.getClientHeight();
    o.left = 0;
    o.top = 0;
    o.width = "100%";
    o.height = "100%";
    var b1a = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1a);

    if (this.getType() == Select.TYPESELECT) {
      o = {};
      o.tagname = "div";
      o.boxtype = "relativebox";
      o.padding = "2 0 0 3";
      o.parentwidth = b1a.getClientWidth();
      o.parentheight = b1a.getClientHeight();
      o.width = "100%";
      o.height = "100%";
      var b1b = new jsx3.gui.Painted.Box(o);
      b1a.addChildProfile(b1b);
    } else {
      o = {};
      o.tagname = "div";
      o.boxtype = "inline";
      var b1b = new jsx3.gui.Painted.Box(o);
      b1a.addChildProfile(b1b);

      o = {};
      o.tagname = "input[text]";
      o.boxtype = "relativebox";
      o.parentwidth = b1a.getClientWidth() -1;
      o.parentheight = b1a.getClientHeight();
      o.width = "100%";
      o.height = "100%";
      o.padding = "0 0 0 4";
      o.empty = true;
      o.border = "solid 0px;solid 1px #c8c8d5;solid 0px;solid 0px";
      var b1c = new jsx3.gui.Painted.Box(o);
      b1b.addChildProfile(b1c);
    }

    return b1;
  };


  /**
   * Returns the DHTML representation of this select box.
   * @return {String} DHTML
   */
  Select_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    // If requesting the XML data source asyncronously, request it now so it's ready by the time the user opens this menu.
    if (this.getXmlAsync())
      var objXML = this.getXML();
    
    //set vars
    var strId = this.getId();
    var bEnabled = this.getEnabled() == jsx3.gui.Form.STATEENABLED;

    //add combo-specific events if applicable
    var eventMap = {};

    if (bEnabled) {
      eventMap[Event.MOUSEDOWN] = true;

      if (this.hasEvent(Interactive.JSXKEYUP))
        eventMap[Event.KEYUP] = true;

      //selects and combos listen to different keyboard events; combos listen for user entries, so they map to keyup; selects listen for navigation keys (right arrow), so they listen for keydown
      if (this.getType() == Select.TYPECOMBO) {
        eventMap[Event.KEYDOWN] = "_ebKeyDownCombo";
        eventMap[Event.FOCUS] = true;
      } else {
        eventMap[Event.KEYDOWN] = "_ebKeyDownSelect";
      }
    }

    //render custom atts and bridged events
    var strImplementedEvents = this.renderHandlers(eventMap, 0);
    var strProps = this.renderAttributes(null, true);

    //create the outer box with border and background arrow
    var b1 = this.getBoxProfile(true);
    b1.setAttributes(' id="' + strId + '"' + this.paintLabel() + ' class="' + this.paintClassName() + '" jsxtype="Select" ' +
        strProps + strImplementedEvents + this.paintIndex());
    //3.2 temporarily added a few styles from the css file back in.  the css is specific to the jsxid jsxwindow_.  when this isn't present, the css for the select fails
    b1.setStyles(this.paintColor() + this.paintBackgroundColor() + 'background-image:url(' + this.getIcon(Select.ARROWICON) +
        ');background-repeat:no-repeat;background-position:right 0px;' + this.paintZIndex() + this.paintVisibility() +
        this.paintDisplay() + this.paintCSSOverride() + this.paintCursor(1));

    //create padded innerbox
    var b1a = b1.getChildProfile(0);
    b1a.setAttributes(' class="jsx30select_display" jsxtype="Display" ' + this.paintTip());
    b1a.setStyles('');

    //branch according to type
    if(this.getType() == Select.TYPESELECT) {
      var b1b = b1a.getChildProfile(0);
      b1b.setAttributes(' jsxtype="Text" class="jsx30select_text"' + html._UNSEL);
      b1b.setStyles(this.paintFontName() + this.paintFontSize() + this.paintFontWeight() + this.paintColor() + this.paintTextAlign());
      var strHTML = b1.paint().join(b1a.paint().join(b1b.paint().join(jsx3.util.strEscapeHTML(this.paintText()))));
    } else {
      //paint box that holds text input box
      var b1b = b1a.getChildProfile(0);
      b1b.setAttributes('class="jsx30combo"');

      //paint text input box
      var b1c = b1b.getChildProfile(0);
      b1c.setAttributes(this.paintIndex() + this.paintMaxLength() + this.paintEnabled() + ' class="jsx30combo_text" value="' +
          jsx3.util.strEscapeHTML(this.paintText()) + '" jsxtype="Text" ' +
          this.renderHandler(Event.BLUR, "_doBlurCombo", 3));
      b1c.setStyles(this.paintFontName() + this.paintFontSize() + this.paintFontWeight() + this.paintColor() + this.paintTextAlign() + this.paintBackgroundColor());
      var strHTML = b1.paint().join(b1a.paint().join(b1b.paint().join(b1c.paint().join(""))));
    }

    return strHTML;
  };

  Select_prototype.onXmlBinding = function(objEvent) {
    this.jsxsupermix(objEvent);

    // call redraw to reflect an update to the selected text
    this.redrawRecord(this.getValue(), jsx3.xml.CDF.UPDATE);

    // refresh the drop down window if it is open
    if (Select._ACTIVE == this) {
      this.hide();
      this._show(this.getValue());
    }
  };
  
  Select_prototype._ebMouseDown = function(objEvent, objGUI) {
    if (! objEvent.leftButton()) return;

    if (objEvent.srcElement().tagName.toLowerCase() != "input") {
      if (Select._ACTIVE == this) {
        this.hide(true);
      } else {
        this._show();
      }
    } else {
      this._focusItem();
    }
  };

  Select_prototype._ebFocus = function(objEvent, objGUI) {
    html.focus(this._getInputElement(objGUI));
    this._focusItem();
  };

  /** @private @jsxobf-clobber */
  Select_prototype._doMouseDownItem = function(objEvent, objGUI) {
    objEvent.cancelBubble();
  };

  /** @private @jsxobf-clobber */
  Select_prototype._doMouseOverItem = function(objEvent, objGUI) {
    var itemGUI = Select._getItemGUI(objEvent, objGUI);
    if (itemGUI) {
      if (objEvent.isFakeOver(itemGUI)) return;
      this._focusItem(itemGUI);
    }
  };

  /** @private @jsxobf-clobber */
  Select._getItemGUI = function(objEvent, objGUI) {
    var itemGUI = objEvent.srcElement();
    while (itemGUI != null && itemGUI.getAttribute("jsxid") == null) {
      itemGUI = itemGUI.parentNode;
      if (itemGUI == objGUI || itemGUI == objGUI.ownerDocument) itemGUI = null;
    }
    return itemGUI;
  };

/* @JSC :: begin DEP */

  /**
   * Sets the text to display in this select box while it is closed. This method does not affect the value of this
   * select box, it simply affects the current view. This method does not affect the value returned by
   * <code>getText()</code> either.
   *
   * @param strText {String} the text to display.
   * @return {jsx3.gui.Select} this object.
   * @see #getText()
   * @deprecated
   */
  Select_prototype.setText = function(strText) {
    this._setText(strText);
    return this;
  };

/* @JSC :: end */

  /** @private @jsxobf-clobber */
  Select_prototype._setText = function(strText) {
    var objGUI = this._getInputElement();
    if (objGUI) {
      if (this.getType() == Select.TYPECOMBO)
        objGUI.value = strText;
      else
        objGUI.innerHTML = jsx3.util.strEscapeHTML(strText);
    }
  };

  /**
   * Gives focus to this select box. If this is a combo select, this method gives focus to the text edit box.
   * @return {HTMLElement} the on-screen HTML element that was just given focus.
   */
  Select_prototype.focus = function() {
    //give focus to persistent on-screen anchor
    var objGUI = this.getType() == Select.TYPECOMBO ? this._getInputElement() : this.getRendered();
    if (objGUI)
      html.focus(objGUI);

    return objGUI;
  };

  /**
   * Sets the selected record of this select control. Fires the <code>SELECT</code> event only under the deprecated
   * 3.0 model event protocol.
   * @param strRecordId {String} id for the record that will be the selected item.
   * @return {jsx3.gui.Select} this object.
   */
  Select_prototype.setValue = function(strRecordId) {
    this._doSelectRecord(this.isOldEventProtocol(), strRecordId);
    return this;
  };

  /**
   * selects the record and fires the SELECT event; updates the MODEL, DATAMODEL, and VIEW. returns a ref to self to facilitate method chaining
   * @param strRecordId {String} id for the record that will be the 'selected' item
   * @private
   * @jsxobf-clobber
   */
  Select_prototype._doSelectRecord = function(objEvent, strRecordId) {
    //proceed if unique (if a change)
    if (strRecordId != this.getValue()) {
      var cont = true;

      // fire the before select event
      if (objEvent instanceof Event)
        cont = this.doEvent(Interactive.BEFORE_SELECT, {objEVENT:objEvent, strRECORDID:strRecordId});

      if (cont === false) return;
      
      //persist the selected value (the id of the selected option) to the MODEL
      this.jsxvalue = strRecordId;

      //call redraw to reflect an update to the selected text
      this.redrawRecord(strRecordId, jsx3.xml.CDF.UPDATE);

      // fire the onselect event
      if (objEvent)
        this.doEvent(Interactive.SELECT,
            {objEVENT:(objEvent instanceof Event ? objEvent : null), strRECORDID:strRecordId, _gipp:1});
    }
  };

  /**
   * Returns the URL to use for the dropdown image. If not provided, the default system image will be used.
   * @param-private strDefault {String}
   * @return {String}
   * @since 3.7
   */
  Select_prototype.getIcon = function(strDefault) {
    return !jsx3.util.strEmpty(this.jsxicon) ? this.getServer().resolveURI(this.jsxicon) : strDefault;
  };
  
  /**
   * Sets the URL to use for the dropdown image (16x16).
   * @param strPath {String} This URL will be resolved relative to the project path.
   * @since 3.7
   */
  Select_prototype.setIcon = function(strPath) {
    this.jsxicon = strPath;
  };

  /**
   * Returns the value of this select box. The value is the <code>jsxid</code> attribute of the selected CDF record.
   * @return {String} the value or <code>null</code> if no record is selected.
   */
  Select_prototype.getValue = function() {
    return this.jsxvalue != null ? this.jsxvalue : null;
  };

  /**
   * If this is a normal select box returns the value of the <code>jsxtext</code> attribute of the selected CDF record,
   * or if this is a combo select box returns the current value.
   * @return {String}
   */
  Select_prototype.getText = function() {
    var bCombo = this.getType() == Select.TYPECOMBO;
    if (bCombo) {
      var input = this._getInputElement();
      if (input) return input.value;
    }
    
    var myNode = this.getRecordNode(this.getValue());
    if (myNode != null) {
      var attr = this._cdfav(myNode, "text");
      return attr != null ? attr : this._cdfav(myNode, "id");
    } else {
      return (bCombo || this.getValue() != null) ? this.getValue() : this.getDefaultText();
    }
  };

  /**
   * Redraws one record from the CDF data source of this select box. If <code>strRecordId</code> is equal to the
   * selected record id, the text of this select box is set to the value of the record's <code>jsxtext</code> attribute.
   * @param strRecordId {String} the id of the record that will be redrawn.
   * @param intAction {int} <code>INSERT</code>, <code>UPDATE</code>, or <code>DELETE</code>.
   * @return {jsx3.gui.Select} this object.
   */
  Select_prototype.redrawRecord = function(strRecordId, intAction) {
    //update the on-screen text value anytime this call is triggerd; in the case of a select, this typically happens when an option is selected or an item removed from the list of options
    if (this.getValue() == strRecordId) {
      var myNode = this.getRecordNode(strRecordId);
      if (myNode != null) {
        var attr = this._cdfav(myNode, "text");
        this._setText(attr != null ? attr : this._cdfav(myNode, "id"));
      } else {
        this._setText(this.getType() == Select.TYPESELECT ? this.getDefaultText() :
                      (strRecordId != null ? strRecordId : ""));
      }
    }
    return this;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Select.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

  Select_prototype.containsHtmlElement = function(objElement) {
    var hw = jsx3.gui.Heavyweight.GO(Select._HW_ID);
    return this.jsxsuper(objElement) || (hw != null && hw.containsHtmlElement(objElement));
  };

  /**
   * Returns the maximum length allowed for the input field of this combo control. This setting only has meaning if
   * this control is of type <code>TYPECOMBO</code>.
   * @return {int}
   */
  Select_prototype.getMaxLength = function() {
    return (this.jsxmaxlength != null) ? this.jsxmaxlength : null;
  };

  /**
   * Sets the maximum length allowed for the input field of this combo control.
   * @param intMaxLength {int}
   * @return {jsx3.gui.Select} this object.
   */
  Select_prototype.setMaxLength = function(intMaxLength) {
    intMaxLength = parseInt(intMaxLength);
    this.jsxmaxlength = intMaxLength > 0 ? intMaxLength : null;
    return this;
  };

  Select_prototype.paintMaxLength = function(intMaxLength) {
    return (this.getMaxLength() != null) ? (' maxlength="' + this.getMaxLength() + '" ') : '';
  };

  /**
   * Paints the default control class and any user specified string of css class name(s)
   * @return {String}
   * @private
   */
  Select_prototype.paintClassName = function() {
    var cn = this.getClassName();
    return Select.DEFAULTCLASSNAME + (cn ? " " + cn : "");
  };

  Select_prototype.updateGUI = function(strCSSName, strCSSValue) {
    if (strCSSName.search(/^(?:display|margin|left|top|position|backgroundColor|color|visibility|zIndex)$/) == 0)
      this.jsxsuper(strCSSName, strCSSValue);
    if (strCSSName.search(/^(?:backgroundColor|color)$/) == 0) {
      var objInput = this._getInputElement();
      if (objInput) {
        try {
          objInput.style[strCSSName] = strCSSValue;
        } catch(e) {;}
      }
    }
  };

  Select_prototype.emInit = function(objColumn) {
    this.jsxsupermix(objColumn);
    this.subscribe(Interactive.SELECT, this, "_emOnSelect");
  };

  Select_prototype.emCollapseEdit = function(objEvent) {
    //collapses the ephemeral selector associated with a given edit mask
    //jsx3.log('collapsing select box of name, ' + this.getName());
    this.hide(false);
  };

  /** @private @jsxobf-clobber */
  Select_prototype._emOnSelect = function(objEvent) {
    this.commitEditMask(objEvent.context.objEVENT, true);
  };

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.Select
 * @see jsx3.gui.Select
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Select", -, null, function(){});
 */
jsx3.Select = jsx3.gui.Select;

/* @JSC :: end */
