/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.xml.Cacheable", "jsx3.gui.Form", "jsx3.gui.Heavyweight", "jsx3.gui.Block",
    "jsx3.gui.ToolbarButton", "jsx3.util.MessageFormat");

// @jsxobf-clobber-shared  _getDisplayedChildren

/**
 * Create GUI menus, similar in functionality to system menus (File, Edit, etc) created by the host OS.
 * <p/>
 * This class implements the CDF interface. Each record represents an item in the rendered menu.
 * The following CDF attributes are supported by default:
 * <ul>
 *   <li>jsxid &#8211; the required CDF record id</li>
 *   <li>jsxtext &#8211; the text displayed in the menu option</li>
 *   <li>jsxtip &#8211; the tip displayed when the mouse hovers over the menu option</li>
 *   <li>jsximg &#8211; the optional image to display at the far left of the option</li>
 *   <li>jsxexecute &#8211; arbitrary JavaScript code to execute when the record is selected</li>
 *   <li>jsxkeycode &#8211; the optional key code to use as the hot key for the record. The format of this
 *          attribute is according to the method <code>Form.doKeyBinding()</code>. If this attribute is of the
 *          form <code>{.*}</code>, then the text between the curly brackets is interpreted as the key of a
 *          dynamic property.</li>
 *   <li>jsxdisabled &#8211; if "1" the option is disabled, the hot key is disabled and the option may not be
 *          selected with the mouse</li>
 *   <li>jsxdivider &#8211; if "1" a visual separator is rendered above the option</li>
 *   <li>jsxgroupname &#8211; if not empty, the option is grouped with other options with the same value for this
 *          attribute. Only one member of the group can be selected at one time.</li>
 *   <li>jsxselected &#8211; if "1" a the option is selected and check mark appears on the left side</li>
 *   <li>jsxstyle &#8211; additional CSS styles to apply to the option text</li>
 * </ul>
 */
jsx3.Class.defineClass("jsx3.gui.Menu", jsx3.gui.Block, [jsx3.xml.Cacheable, jsx3.xml.CDF, jsx3.gui.Form], function(Menu, Menu_prototype) {

  var LOG = jsx3.util.Logger.getLogger(Menu.jsxclass.getName());

  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;
  var html = jsx3.html;

  /**
   * {String} background-image:url(JSX/images/menu/bg.gif);backround-repeat:repeat-y; (default)
   */
  Menu.DEFAULTBACKGROUND = "background-image:url(" + jsx3.resolveURI("jsx:///images/menu/bg.gif") + ");background-repeat:repeat-y;";

  /**
   * {String} #ffffff (default)
   */
  Menu.DEFAULTBACKGROUNDCOLOR = "#ffffff";

  /**
   * {String}
   */
  Menu.DEFAULTXSLURL = jsx3.resolveURI("jsx:///xsl/jsxmenu.xsl");

  /* @jsxobf-clobber */
  /* @Embed(source='../../../xsl/jsxmenu.xsl', type='xsl') */
  Menu._XSLRSRC = new jsx3.xml.XslDocument().load(Menu.DEFAULTXSLURL);

/* @JSC :: begin DEP */

  /**
   * {String} JSX_MENU_XSL (default)
   * @deprecated
   */
  Menu.DEFAULTXSLCACHEID = "JSX_MENU_XSL";

/* @JSC :: end */

  /**
   * {int}
   */
  Menu.DEFAULTCONTEXTLEFTOFFSET = 10;

/* @JSC :: begin DEP */

  /**
   * {String}
   * @deprecated
   */
  Menu.NODATAMESSAGE = "<div tabIndex='0' class='jsx30menu_0_list' onmousedown='var e = jsx3.gui.Event.wrap(event); jsx3.gui.Event.publish(e); e.cancelBubble(); e.cancelReturn();'>- no data -</div>";

/* @JSC :: end */

  /** @private @jsxobf-clobber */
  Menu._NODATAFORMAT = new jsx3.util.MessageFormat('<div tabIndex="0" class="jsx30menu_{0}_item"' +
      ' onmousedown="var e = jsx3.gui.Event.wrap(event); jsx3.gui.Event.publish(e); e.cancelBubble(); e.cancelReturn();">' +
      '<div class="jsx30menu_{0}_kc"><table class="jsx30menu_{0}_kct"><tr><td class="name">{1}</td>' +
      '<td class="keycode"></td></tr></table></div></div>');

  /** @private @jsxobf-clobber */
  Menu._STATEOFF = 0;
  /** @private @jsxobf-clobber */
  Menu._STATEON = 1;

  /** @private @jsxobf-clobber */
  Menu.DEFAULTCONTEXTTOPOFFSET = 12;

  /** @private @jsxobf-clobber */
  Menu._IMAGESUBMENU = jsx3.resolveURI("jsx:///images/menu/submenuarrow.gif");
  /** @private @jsxobf-clobber */
  Menu._IMAGEOVER = jsx3.resolveURI("jsx:///images/menu/selectover.gif");
  /** @private @jsxobf-clobber */
  Menu._IMAGESELECTED = jsx3.resolveURI("jsx:///images/menu/selected.gif");
  /** @private @jsxobf-clobber */
  Menu._IMAGEDOWNMENU = jsx3.resolveURI("jsx:///images/menu/down_menu.gif");
  /** @private @jsxobf-clobber */
  Menu._IMAGEOFFMENU = jsx3.resolveURI("jsx:///images/menu/off_menu.gif");
  /** @private @jsxobf-clobber */
  Menu._IMAGEONMENU = jsx3.resolveURI("jsx:///images/menu/on_menu.gif");
  /** @private @jsxobf-clobber */
  Menu._IMAGEOVERMENU = jsx3.resolveURI("jsx:///images/menu/over_menu.gif");
  /** @private @jsxobf-clobber */
  Menu._IMAGEDOWN = jsx3.resolveURI("jsx:///images/tbb/down.gif");
  /** @private @jsxobf-clobber */
  Menu._IMAGEON = jsx3.resolveURI("jsx:///images/tbb/on.gif");

/* @JSC */ if (jsx3.CLASS_LOADER.IE6) {
  html.loadImages("jsx:///images/menu/bg.gif", Menu._IMAGEDOWNMENU, Menu._IMAGEOFFMENU, Menu._IMAGEONMENU,
      Menu._IMAGEOVERMENU, Menu._IMAGESELECTED, Menu._IMAGEOVER, Menu._IMAGESUBMENU, Menu._IMAGEDOWN, Menu._IMAGEON);
/* JSC */ }
    
  /** @private @jsxobf-clobber */
  Menu.BORDERCOLOR = "#9B9BB7";

  /**
   * {jsx3.gui.Menu} the single GI menu instance that is expanded.
   * @private @jsxobf-clobber
   */
  Menu._ACTIVE_MENU = null;
  /** @private @jsxobf-clobber */
  Menu._ACTIVE_HWS = [];
  /** @private @jsxobf-clobber */
  Menu._ACTIVE_ITEMS = [];
  /**
   * {jsx3.gui.Menu} the single GI menu instance that is on.
   * @private @jsxobf-clobber
   */
  Menu._ON_MENU = null;

  /** @private @jsxobf-clobber */
  Menu._SHOWID = null;
  /** @private @jsxobf-clobber */
  Menu._BLURID = null;
  /** @private @jsxobf-clobber */
  Menu.SHOW_DELAY = 250;
  /** @private @jsxobf-clobber */
  Menu.BLUR_DELAY = 150;
  /** @private @jsxobf-clobber */
  Menu.HW_ID_PREFIX = "jsx30curvisiblemenu_";
  /** @private @jsxobf-clobber */
  Menu.SPYDELAY = 1000;

  /**
   * The instance initializer.
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param strText {String} text for the menu (the persistent on-screen anchor that one would click to expand the menu); if the menu is only used as a context menu, this can be left null and the display property for the menu should be set to null
   */
  Menu_prototype.init = function(strName, strText) {
    //call constructor for super class - in this case its a toolbabutton whose type is radio (because if a menu has siblings only one is active at a time)
    this.jsxsuper(strName);

    //set the text if passed
    if (strText != null) this.setText(strText);
  };

  /**
   * Returns url for 16x16 pixel image (preferably a gif with a transparent background); returns null if no image specified or an empty string
   * @return {String} valid URL
   */
  Menu_prototype.getImage = function() {
    return (this.jsximage != null && jsx3.util.strTrim(this.jsximage) != "") ? this.jsximage : null;
  };

  /**
   * Sets url for 16x16 pixel image (preferably a gif with a transparent background);
   *          returns a reference to self to facilitate method chaining
   * @param strURL {String} valid URL
   * @return {jsx3.gui.Menu} this object
   */
  Menu_prototype.setImage = function(strURL) {
    this.jsximage = strURL;
    return this;
  };

  Menu_prototype.getXSL = function() {
    return this._getSharedXSL(Menu.DEFAULTXSLURL, Menu._XSLRSRC);
  };

  /**
   * disables a menu item with the given id; this ID is the jsxid attribute on the record adhereing to the JSX Common Data Format (CDF);
   * @param strRecordId {String} the jsxid property on the record node corresponding to the menu item to be disabled
   * @return {jsx3.gui.Menu} this object.
   */
  Menu_prototype.disableItem = function(strRecordId) {
    return this.enableItem(strRecordId, false);
  };

  /**
   * enables a menu item with the given id by removing its 'jsxdisabled'; this ID is the jsxid attribute on the record adhereing to the JSX Common Data Format (CDF);
   * @param strRecordId {String} the jsxid property on the record node corresponding to the menu item to be enabled
   * @param bEnabled {boolean} if false then disable the item
   * @return {jsx3.gui.Menu} this object.
   */
  Menu_prototype.enableItem = function(strRecordId, bEnabled) {
    // update the flag that says this item should be rendered disabled
    if (bEnabled || (bEnabled == null))
      this.deleteRecordProperty(strRecordId, "jsxdisabled", false);
    else
      this.insertRecordProperty(strRecordId, "jsxdisabled", "1", false);

    return this;
  };

  /**
   * Returns whether a record is enabled.
   * @param strRecordId {String} the jsxid property on the record node to query
   * @return {boolean}
   */
  Menu_prototype.isItemEnabled = function(strRecordId) {
    var record = this.getRecordNode(strRecordId);
    return record && this._cdfav(record, "disabled") != "1";
  };

  /**
   * flags a a menu item as being selected; if the menu item is part of a group (e.g., when the record node has an attribute called 'jsxgroupname'), all other menu
   *            items belonging to that group will be deselected
   * @param strRecordId {String} the jsxid property on the record node corresponding to the menu item to be selected
   * @param bSelected {boolean} if false then deselect the item
   * @return {jsx3.gui.Menu} this object.
   */
  Menu_prototype.selectItem = function(strRecordId, bSelected) {
    if (bSelected || (bSelected == null)) {
      var objNode = this.getRecordNode(strRecordId);

      if (objNode != null) {
        var myGroupName = this._cdfav(objNode, "groupname");
        if (myGroupName) {
          for (var i = this.getXML().selectNodeIterator("//record[@jsxgroupname='" + myGroupName + "']"); i.hasNext(); ) {
            var node = i.next();
            if (this._cdfav(node, 'id') != strRecordId)
              this._cdfav(node, "selected", null);
          }
        }
      }

      //update the flag that says this item should be rendered disabled
      this.insertRecordProperty(strRecordId, "jsxselected", 1, false);
    } else {
      this.deleteRecordProperty(strRecordId, "jsxselected", false);
    }

    return this;
  };

  /**
   * flags a a menu item as being unselected (the default state)
   * @param strRecordId {String} the jsxid property on the record node corresponding to the menu item to be deselected
   * @return {jsx3.gui.Menu} this object.
   */
  Menu_prototype.deselectItem = function(strRecordId) {
    return this.selectItem(strRecordId, false);
  };

  /**
   * Returns whether a record is selected.
   * @param strRecordId {String} the jsxid property on the record node to query.
   * @return {boolean}
   */
  Menu_prototype.isItemSelected = function(strRecordId) {
    var record = this.getRecordNode(strRecordId);
    return record != null && this._cdfav(record, "selected") == "1";
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._focusItem = function(objEvent, itemGUI, intLevel) {
    if (intLevel == null) intLevel = parseInt(itemGUI.parentNode.parentNode.getAttribute("jsxindex"));

    var existingDown = Menu._ACTIVE_ITEMS[intLevel];
    if (existingDown && existingDown != itemGUI) {
      try {
        existingDown.style.backgroundImage = "url(" + jsx3.gui.Block.SPACE + ")";
      } catch (e) {;}
      Menu._ACTIVE_ITEMS[intLevel] = null;
    }

    var bActive = false;
    if (itemGUI.getAttribute("jsxdisabled") != "1") {
      var recordId = itemGUI.getAttribute("jsxid");
      bActive = this._isActiveRecord(recordId);

      itemGUI.style.backgroundImage = "url(" + Menu._IMAGEOVER + ")";
      Menu._ACTIVE_ITEMS[intLevel] = itemGUI;

      html.focus(itemGUI);

      var hw = Menu._ACTIVE_HWS[intLevel-1];
      if (hw) hw.scrollTo(itemGUI);
    } else {
      html.focus(itemGUI.parentNode.parentNode);
    }

    this._limitToMenuLevel(bActive ? intLevel + 1 : intLevel);
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._limitToMenuLevel = function(intLevel, bNow) {
    if (Menu._ACTIVE_HWS.length > intLevel && (Menu._BLURING_TO == null || Menu._BLURING_TO > intLevel)) {
      if (Menu._BLURID)
        window.clearTimeout(Menu._BLURID);

      this._pushActiveRecord(intLevel, null);

      /* @jsxobf-clobber */
      Menu._BLURING_TO = intLevel;

      var me = this;
      Menu._BLURID = window.setTimeout(function(){
        if (me.getParent() == null) return;
        Menu._BLURID = null;
        Menu._BLURING_TO = null;
        me._hideMenu(intLevel+1, true);
      }, bNow ? 0 : Menu.BLUR_DELAY);
    }
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._isActiveRecord = function(strRecordId) {
    if (this._jsxactiverecordids)
      return jsx3.util.arrIndexOf(this._jsxactiverecordids, strRecordId) >= 0;
    return false;
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._pushActiveRecord = function(intLevel, strRecordId) {
    if (intLevel < 1) return;

    if (this._jsxactiverecordids == null)
      /* @jsxobf-clobber */
      this._jsxactiverecordids = [];

    if (strRecordId == null) {
      this._jsxactiverecordids.splice(intLevel-1, this._jsxactiverecordids.length);
    } else {
      this._jsxactiverecordids.splice(intLevel-1, this._jsxactiverecordids.length, strRecordId);
    }
  };

  Menu_prototype._ebKeyDown = function(objEvent, objGUI) {
    // check for hot keys
    if (this.jsxsupermix(objEvent, objGUI)) return;

    var intKey = objEvent.keyCode();

    if ((intKey == Event.KEY_ARROW_DOWN || intKey == Event.KEY_ENTER || intKey == Event.KEY_SPACE) && !objEvent.hasModifier()) {
      this.showMenu(objEvent, objGUI, 1);
      objEvent.cancelAll();
    } else if (intKey == Event.KEY_ARROW_RIGHT) {
      this._focusSiblingMenu(true);
    } else if (intKey == Event.KEY_ARROW_LEFT) {
      this._focusSiblingMenu(false);
    }
  };

  Menu_prototype._ebMouseDown = function(objEvent, objGUI) {
    if (! objEvent.leftButton()) return;

    //call super; super sets the capture and applies the mousedown images and border colors
    this._tbbDoMouseDown(objEvent, objGUI);
    //we only need to updata the portion we own here
    objGUI.childNodes[2].style.backgroundImage = "url(" + Menu._IMAGEDOWNMENU + ")";

    if (this.getState() == Menu._STATEON) {
      if (!this._jsxopening)
        this._hideMenu();
    } else {
      //display the menu list
      this.showMenu(objEvent, objGUI, 1);
    }
  };

  Menu_prototype._ebMouseOver = function(objEvent, objGUI) {
    if (objEvent.isFakeOver(objGUI)) return;

    // we are going to show another menu, so cancel any pending show
    if (Menu._SHOWID)
      window.clearTimeout(Menu._SHOWID);

    //call super; super applies the mouseover bgimages and border colors
    this._tbbDoMouseOver(objEvent, objGUI);

    //if the state of this button id down
    if (this.getState() == Menu._STATEOFF) {
      //display the 'over' bg image to denote that we're hovering over this menu anchor and it is clickable
      objGUI.childNodes[2].style.backgroundImage = "url(" + Menu._IMAGEOVERMENU + ")";
    }

    //fire the 'showmenu' event if a menu is already open in the system or if a drag operation is occurring (flag = 1)
    if ((Menu._ACTIVE_MENU != null && this != Menu._ACTIVE_MENU && Menu._ACTIVE_MENU.getParent() == this.getParent()) ||
        (jsx3.EventHelp.FLAG == 1 && this.getCanDrop() == 1))
      this.showMenu(objEvent, objGUI, 1);
  };

  Menu_prototype._ebMouseOut = function(objEvent, objGUI) {
    if (objEvent.isFakeOut(objGUI)) return;

    if (Menu._SHOWID)
      window.clearTimeout(Menu._SHOWID);

    //only swap out the image if button isn't in the on state
    if (this.getState() == Menu._STATEOFF || objGUI != this._jsxactiveanchor[0]) {
      //call super; resets VIEW to null/unselected state if object isn't in a selected state (the anchor for the active menu)
      this._tbbDoMouseOut(objEvent, objGUI);
      objGUI.childNodes[2].style.backgroundImage = "url(" + Menu._IMAGEOFFMENU + ")";
    }
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._doKeyDownItem = function(objEvent, objGUI) {
    if (objEvent.hasModifier(true)) return;

    var itemGUI = Menu._getItemGUI(objEvent, objGUI);

    var intIndex = parseInt(objGUI.getAttribute("jsxindex"));
    var strId = itemGUI ? itemGUI.getAttribute("jsxid") : null;
    var bDisabled = itemGUI && itemGUI.getAttribute("jsxdisabled") == "1";
    var intKey = objEvent.keyCode();

    if ((intKey == Event.KEY_SPACE || intKey == Event.KEY_ENTER) && !bDisabled) {
      //an option item had focus and user space bar to select it or the enter key
      this._executeRecord(objEvent, strId);
      this._hideMenu();
    } else if (intKey == Event.KEY_ARROW_RIGHT) {
      if (itemGUI && itemGUI.getAttribute("jsxtype") == "Book" && !bDisabled) {
        //right-arrow and mouse-down events trigger submenus to expand
        this.showMenu(objEvent, itemGUI, intIndex+1, strId);
      } else {
        this._focusSiblingMenu(true);
      }
    } else if (intKey == Event.KEY_ARROW_LEFT) {
      if (intIndex > 1)
        this._hideMenu(intIndex);
      else
        this._focusSiblingMenu(false);
    } else if (intKey == Event.KEY_ESCAPE) {
      this._hideMenu();
    } else if (intKey == Event.KEY_ARROW_DOWN) {
      if (!itemGUI) itemGUI = objGUI.lastChild;
      for (var nextItem = itemGUI; true; ) {
        if (nextItem == nextItem.parentNode.lastChild) {
          nextItem = nextItem.parentNode.firstChild;
        } else {
          nextItem = nextItem.nextSibling;
        }

        if (nextItem == itemGUI) break;
        if (nextItem.getAttribute("jsxdisabled") != "1") {
          this._focusItem(objEvent, nextItem, intIndex);
          break;
        }
      }
    } else if (intKey == Event.KEY_ARROW_UP) {
      if (!itemGUI) itemGUI = objGUI.firstChild;
      for (var nextItem = itemGUI; true; ) {
        if (nextItem == nextItem.parentNode.firstChild) {
          nextItem = nextItem.parentNode.lastChild;
        } else {
          nextItem = nextItem.previousSibling;
        }

        if (nextItem == itemGUI) break;
        if (nextItem.getAttribute("jsxdisabled") != "1") {
          this._focusItem(objEvent, nextItem, intIndex);
          break;
        }
      }
    } else if (intKey == Event.KEY_TAB) {
      html[objEvent.shiftKey() ? "focusPrevious" : "focusNext"](this.getRendered(objEvent), objEvent);
      return;
    } else {
      return;
    }

    objEvent.cancelAll();
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._focusSiblingMenu = function(bNext) {
    var c = this.getParent().getChildren();
    var index = this.getChildIndex();
    var inc = bNext ? 1 : -1;

    for (var i = index; true; ) {
      i = jsx3.util.numMod(i + inc, c.length);
      if (i == index) break;
      var sib = c[i];

      if (sib instanceof Menu && sib.getDisplay() != jsx3.gui.Block.DISPLAYNONE) {
        try {
          sib.focus();
        } catch (e) {;}
        break;
      }
    }
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._doMouseDownItem = function(objEvent, objGUI) {
    if (! objEvent.leftButton()) {
      objEvent.cancelBubble();
      return;
    }

    var intIndex = parseInt(objGUI.getAttribute("jsxindex"));
    var itemGUI = Menu._getItemGUI(objEvent, objGUI);

    if (itemGUI && itemGUI.getAttribute("jsxtype") == "Book")
      this.showMenu(objEvent, itemGUI, intIndex+1, itemGUI.getAttribute("jsxid"));

    //stop the bubble since a mousdown event if sent to the document body will close any open menu
    objEvent.cancelBubble();
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._doMouseUpItem = function(objEvent, objGUI) {
    if (! objEvent.leftButton()) {
      objEvent.cancelBubble();
    }
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._doMouseOverItem = function(objEvent, objGUI) {
    var itemGUI = Menu._getItemGUI(objEvent, objGUI);
    if (itemGUI && objEvent.isFakeOver(itemGUI)) return;

    // delays the load of a submenu if hovering over a book
    if (Menu._SHOWID)
      window.clearTimeout(Menu._SHOWID);

    Menu._hideMenuSpy();

    var intIndex = parseInt(objGUI.getAttribute("jsxindex"));

    if (itemGUI) {
      var type = itemGUI.getAttribute("jsxtype");
      var bDisabled = itemGUI.getAttribute("jsxdisabled") == "1";
      var strRecordId = itemGUI.getAttribute("jsxid");

      this._focusItem(objEvent, itemGUI, intIndex);

      if (type == "Book") {
        if (! this._isActiveRecord(strRecordId)) {
          var me = this;
          objEvent.persistEvent(); // needed in order to use event after timeout

          Menu._SHOWID = window.setTimeout(function(){
            if (me.getParent() == null) return;
            Menu._SHOWID = null;
            me.showMenu(objEvent, itemGUI, intIndex+1, strRecordId);
          }, Menu.SHOW_DELAY);
        }
      }

      if (strRecordId != null)
        this._showMenuSpy(objEvent, strRecordId, type == "Book");
    }
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._showMenuSpy = function(objEvent, strRecordId, bHasMenu) {
    if (this.hasEvent(Interactive.SPYGLASS)) {
      objEvent.persistEvent(); // so that event is still available after timeout

      var me = this;
      /* @jsxobf-clobber */
      Menu._spytimeout = window.setTimeout(function(){
        if (me.getParent() == null) return;

        Menu._spytimeout = null;
        var strSPYHTML = me.doEvent(Interactive.SPYGLASS, {objEVENT:objEvent, strRECORDID:strRecordId});
        // account for cancel
        if (strSPYHTML) {
          // hide any existing spyglass
          jsx3.gui.Interactive.hideSpy();
          me.showSpy(strSPYHTML, objEvent);
        }
      }, bHasMenu ? Menu.SPYDELAY : jsx3.EventHelp.SPYDELAY);
    }
  };

  /** @private @jsxobf-clobber */
  Menu._hideMenuSpy = function() {
    if (Menu._spytimeout) {
      window.clearTimeout(Menu._spytimeout);
      Menu._spytimeout = null;
    }
    jsx3.gui.Interactive.hideSpy();
  };

  /** @private @jsxobf-clobber */
  Menu._getItemGUI = function(objEvent, objGUI) {
    var itemGUI = objEvent.srcElement();
    while (itemGUI != null && itemGUI.getAttribute("jsxtype") == null) {
      itemGUI = itemGUI.parentNode;
      if (itemGUI == objGUI || itemGUI == objGUI.ownerDocument) itemGUI = null;
    }
    return itemGUI;
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._doClickItem = function(objEvent, objGUI) {
    if (! objEvent.leftButton()) {
      objEvent.cancelBubble();
      return;
    }

    var itemGUI = Menu._getItemGUI(objEvent, objGUI);

    //a click event occurred; ignore if of type 'book' or if disabled; these don't fire execute events, just show the submenu
    if (itemGUI) {
      var strType = itemGUI.getAttribute("jsxtype");
      var bDisabled = itemGUI.getAttribute("jsxdisabled");

      if (strType != "Book" && !bDisabled) {
        this._executeRecord(objEvent, itemGUI.getAttribute("jsxid"));
        //hide options group and give focus to the persistent menu anchor
        this._hideMenu();
      }
    }
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._onLoseFocus = function(objEvent) {
    this._hideMenu(1, true);
  };

  /**
   * can be called to hide any open menu
   * @param intIndex {int} level in the hierarchy for the menu to destroy (0 = context; 1 = regular menu root; 2+ = additional generations)
   * @private
   * @jsxobf-clobber
   */
  Menu_prototype._hideMenu = function(intIndex, bNoFocus) {
    if (this != Menu._ACTIVE_MENU)
      return;

    if (intIndex == null) intIndex = 1;

    // subscribe/unsubscribe as needed
    if (intIndex == 1)
      Event.unsubscribeLoseFocus(this, this);
    
    if (Menu._BLURID)
      window.clearTimeout(Menu._BLURID);

    // hide possible spy
    Menu._hideMenuSpy();

    this._pushActiveRecord(intIndex-1, null);

    // call method to clear any menus from the VIEW greater than or equal to the level, @intIndex
    for (var i = Menu._ACTIVE_HWS.length - 1; i >= intIndex - 1; i--) {
      var hw = Menu._ACTIVE_HWS[i];
      if (hw) hw.destroy();
    }
    Menu._ACTIVE_HWS.splice(intIndex - 1, Menu._ACTIVE_HWS.length);
    Menu._ACTIVE_ITEMS.splice(intIndex, Menu._ACTIVE_ITEMS.length);

    // subscribe/unsubscribe as needed
    if (intIndex == 1) {
      this._setState(Menu._STATEOFF);
      this.doEvent(Interactive.HIDE);

      //reset the id for the active menu to null
      Menu._ACTIVE_MENU = null;

      // set flag that even context menus are no longer open
      /* @jsxobf-clobber */
      Menu._CONTEXTOPEN = false;
    }

    if (!bNoFocus) {
      // may be destroyed on screen
      try {
        if (this._jsxactiveanchor[intIndex-1])
          this._jsxactiveanchor[intIndex - 1].focus();
        else if (intIndex == 1)
          this.focus();
      } catch (e) {;}
    }

    this._jsxactiveanchor.splice(intIndex-1, this._jsxactiveanchor.length);
  };

  /**
   * displays a context menu; this menu will be positioned according to the x/y of the event. Typically this event is a right-click, but can also be the cursor position during a key press
   * @param objParent {jsx3.app.Model} the JSX GUI object that owns (contains) the context item (a CDF record) being acted upon
   * @param strRecordId {String} the CDF record ID for the context item being acted upon
   * @package
   */
  Menu_prototype.showContextMenu = function(objEvent, objParent, strRecordId, objOffset) {
    //set flag that we're in contextmenu mode
    Menu._CONTEXTOPEN = true;
    //make call to show menu, passing left/top for where to position the context menu
    /* @jsxobf-clobber */
    this._jsxcontextparent = objParent;
    /* @jsxobf-clobber */
    this._jsxcontextrecordid = strRecordId;
    this.showMenu(objEvent, null, 1, null, objOffset);
  };

  /**
   * Returns the JSX GUI object that owns (contains) the context item (a CDF record) being acted upon.  For example, when a context menu is shown by right-clicking on a list tree, a ref to the tree/list is persisted as this value.
   */
  Menu_prototype.getContextParent = function() {
    return this._jsxcontextparent;
  };

  /**
   * Returns the CDF record ID for the context item being acted upon.  For example, when a context menu is shown by right-clicking on a row in a list or a node in a tree, the CDF record ID corresponding to the clicked item is persisted as this value.
   */
  Menu_prototype.getContextRecordId = function() {
    return this._jsxcontextrecordid;
  };

  /**
   * exists to display a list of options to user; it has no effect on the model and only exists to provide interactivity
   * @param objAnchor {Object} on-screen anchor (a toolbarbutton or a menu item) to position the menu from (the origin in the VIEW)
   * @param intIndex {int} 1-based index for what level the current menu is in the submenu hierarchy (0 is the root)
   * @param strParentId {String} id of alternate to root to use when generating the menu list
   * @private
   */
  Menu_prototype.showMenu = function(objEvent, objAnchor, intIndex, strParentId, objOffset) {
    // fire handler code
    var bContinue = this.doEvent(Interactive.MENU,
        {objEVENT:objEvent, objANCHOR:objAnchor, intINDEX:intIndex, strPARENTID:strParentId, _gipp:1});
    if (bContinue === false) return;

    //the anchor gets lost in some situations (perhaps when the bound jsxmenu event-handler code fires a repaint event). for now, solve by re-refrencing menus
    if (objAnchor == null && strParentId != null) {
      objAnchor = this.getRendered(objEvent);
    }

    //anytime a new root menu is displayed, persist the reference to that menu, so we can know where to give focus back to when blur
    if (intIndex == 1) {
      //if there is an active menu that previously was displayed, set the state of its toolbar anchor back to unhighlighted/unselected
      // note that if this is a context menu, it may be opening in one place and closing in another
      if (Menu._ACTIVE_MENU)
        Menu._ACTIVE_MENU._hideMenu(1, true);

      //reset the reference to the active menu to this one
      Menu._ACTIVE_MENU = this;

      /* @jsxobf-clobber */
      this._jsxopening = true; // so that click immediately after mouse over doesn't close menu
    }

    objEvent.persistEvent();
    jsx3.sleep(function() {
      this._showMenu2(objEvent, objAnchor, intIndex, strParentId, objOffset);
    }, "Menu.showTopMenu", this, true);

    if (this._jsxactiveanchor == null)
      /* @jsxobf-clobber */
      this._jsxactiveanchor = [];
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._showMenu2 = function(objEvent, objAnchor, intIndex, strParentId, objOffset) {
    if (intIndex > 1 && !Menu._ACTIVE_HWS[intIndex-2])
      return;

    this._jsxactiveanchor[intIndex-1] = objAnchor;
    this._pushActiveRecord(intIndex, strParentId);

    //name the menu using a numeric append where the number is related to its level; since only max of one menu per level, easy to garbage collect
    var myMenuId = Menu.HW_ID_PREFIX + intIndex;

    //get menu items; 'doGetCachedContent' will always look to the temporary cache for the HTML; otherwise will regen; a forced regen always happens during paint
    var strContent = this._getMenuContent(strParentId, intIndex);

    //generate container that will hold the the menu items
    var myClass = "jsx30menu_" + Menu._getMode() + "_list";

    var strHTML = '<div tabindex="0" jsxindex="' + intIndex + '"' +
        this.renderHandler(Event.MOUSEOVER, "_doMouseOverItem") +
        this.renderHandler(Event.KEYDOWN, "_doKeyDownItem") +
        this.renderHandler(Event.CLICK, "_doClickItem") +
        this.renderHandler(Event.MOUSEDOWN, "_doMouseDownItem") +
        this.renderHandler(Event.MOUSEUP, "_doMouseUpItem") +
        ' class="' + myClass + '" style="' + this.paintBackgroundColor() +
        this.paintBackground() + '">' + strContent + '</div>';

    // on double clicks this could lead to a race condition here, so make sure that an pre-existing one doesn't already exist
    var objOldHW = Menu._ACTIVE_HWS[intIndex-1];
    if (objOldHW) objOldHW.destroy();

    //create and configure a Heavyweight (HW) instance to contain the menu items
    var objHW = Menu._ACTIVE_HWS[intIndex-1] = new jsx3.gui.Heavyweight(myMenuId, this);
    objHW.setHTML(strHTML);
    objHW.setScrolling(true);
    objHW.setClassName("jsx30shadow");

    //set positioning rules based on one of three menu types
    if (objAnchor && strParentId != null) {
      //submenu
      objHW.addXRule(objAnchor,"E","W",-4);
      objHW.addXRule(objAnchor,"W","E",8);
      objHW.addYRule(objAnchor,"N","N",0);
      objHW.addYRule(objAnchor,"N","S",24);
      objHW.addRule(null,"N",0,"Y");
    } else if (objAnchor) {
      //menu
      objHW.addXRule(objAnchor,"W","W",0);
      objHW.addXRule(objAnchor,"E","E",0);
      objHW.addYRule(objAnchor,"S","N",0);
      objHW.addYRule(objAnchor,"N","S",0);
    } else {
      //context menu
      objHW.addXRule(objOffset ? objOffset.L : objEvent, null, "W", Menu.DEFAULTCONTEXTLEFTOFFSET);
      objHW.addXRule(objOffset ? objOffset.L : objEvent, null, "E", -Menu.DEFAULTCONTEXTLEFTOFFSET);
      objHW.addYRule(objOffset ? objOffset.T : objEvent, null, "N", Menu.DEFAULTCONTEXTTOPOFFSET);
      objHW.addYRule(objOffset ? objOffset.T : objEvent, null, "S", -Menu.DEFAULTCONTEXTTOPOFFSET);
      objHW.addRule(null,"N",0,"Y");
    }

    //since a menu is now being shown on-screen set the state of its anchor (a check-type toolbarbutton) to active if not in context menu mode
    if (intIndex == 1 && !Menu._CONTEXTOPEN)
      this._setState(Menu._STATEON, objAnchor);

    //show the menu list and give focus to the first menu item in the list
    objHW.show();
    var hwGUI = objHW.getRendered(objAnchor);

    var divContent = hwGUI.childNodes[0].childNodes[0];

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    var contentWidth = Math.max(divContent.offsetWidth - 2, divContent.clientWidth);

    // HACK: size content and all item divs (needed for IE XHTML mode)
    for (var i = 0; i < divContent.childNodes.length; i++) {
      var c = divContent.childNodes[i];
      if (c.nodeName && c.nodeName.toLowerCase() == "div") {
        if (c.getAttribute("jsxid"))
          divContent.childNodes[i].style.width = contentWidth + "px";
        else if (c.getAttribute("jsxtype") == "Divider" && c.offsetWidth < 30)
          divContent.childNodes[i].style.width = Math.max(0, contentWidth - (c.offsetWidth - 1)) + "px";
      }
    }
/* @JSC */ }

    // Focus the first item in the list if
    if (intIndex > 1 && objEvent.getType().indexOf("key") == 0) {
      this._focusItem(objEvent, divContent.childNodes[0], intIndex);
    } else {
      html.focus(divContent);
    }

    // subscribe/unsubscribe as needed
    if (intIndex == 1) {
      Event.subscribeLoseFocus(this, this, "_onLoseFocus");
      jsx3.sleep(function() { this._jsxopening = false; }, null, this);
    }
  };

  Menu_prototype.repaint = function() {
    this._hideMenu();
    return this.jsxsuper();
  };

  /** @private @jsxobf-clobber */
  Menu._getMode = function() {
    var intMode = html.getMode();
    if (intMode == html.MODE_IE_STRICT && jsx3.CLASS_LOADER.getVersion() >= 7)
      intMode += "x";
    return intMode;
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._getMenuContent = function(strParentId, intIndex) {
    //
    //called by paint and showMenu; caches the transformed dhtml content for later re-use for more-efficient on-going generation of menu content
    //although menus nest to any arbitrary depth, only the first/root level is cached as it is the most commonly generated and gains the most via this efficiency
    //
    //create parameter object (a name/value hash) to pass to the XSL for transformation
    var objP = {
      jsxtabindex: (this.getIndex()) ? this.getIndex() : 0,
      jsxselectedimage: Menu._IMAGESELECTED,
      jsxselectedimagealt: this._getLocaleProp("sel", Menu),
      jsxtransparentimage: jsx3.gui.Block.SPACE,
      jsxdragtype: "JSX_GENERIC",
      jsxid: this.getId(),
      jsxsubmenuimage: Menu._IMAGESUBMENU,
      jsxmode: Menu._getMode(),
      jsxpath: jsx3.getEnv("jsxabspath"),
      jsxpathapps: jsx3.getEnv("jsxhomepath"),
      jsxpathprefix: this.getUriResolver().getUriPrefix(),
      jsxappprefix: this.getServer().getUriPrefix(),
      jsxkeycodes: this._getFormattedKeycodes(strParentId)
    };

    //if this is a submenu, pass the parent to it
    if (strParentId != null) objP.jsxrootid = strParentId;

    //loop to override default parameter values with user's custom values as well as add additional paramters specified by the user
    var objParams = this.getXSLParams();
    for (var p in objParams) objP[p] = objParams[p];

    //perform the merge/transformation; if no data was returned from the transform, use the statndard 'NODATA' message; persist as ephemeral system property
    var strContent = this.doTransform(objP);
    if (! jsx3.xml.Template.supports(jsx3.xml.Template.DISABLE_OUTPUT_ESCAPING))
      strContent = html.removeOutputEscapingSpan(strContent);

    //3.2 FF support. xslt engine causes issue by inserting own wrapper tag
    strContent = this._removeFxWrapper(strContent);
    if (jsx3.util.strTrim(strContent) == "")
      strContent = Menu._NODATAFORMAT.format(Menu._getMode().toString(), this._getLocaleProp("noData", Menu));

    return strContent;
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._getFormattedKeycodes = function(strRootId) {
    if (this._jsxhotkeys == null) return "";

    var tokens = [];
    for (var f in this._jsxhotkeys)
      tokens[tokens.length] = f + ":" + this._jsxhotkeys[f].getFormatted();

    tokens[tokens.length] = "";
    return tokens.join("|");
  };

/* @JSC :: begin DEP */

  /**
   * @deprecated  No-op.
   */
  Menu_prototype.clearCachedContent = function() {
  };

/* @JSC :: end */

  /**
   * @private
   */
  Menu_prototype.getState = function() {
    return this._jsxstate != null ? this._jsxstate : Menu._STATEOFF;
  };

  /**
   * @private
   * @jsxobf-clobber
   */
  Menu_prototype._setState = function(STATE, objGUI) {
    //subclassed method; ensures that button is toggled on/off appropriately for the menu; menus only implement toolbarbuttons of type check, so simpler than superclass method
    //toggle state for this button
    if (objGUI == null)
      objGUI = this.getRendered(objGUI);

    if (objGUI != null) {
      if (STATE == Menu._STATEON) {
        if (Menu._ON_MENU == this) return this;
        if (Menu._ON_MENU != null) Menu._ON_MENU._setState(Menu._STATEOFF);

        objGUI.style.backgroundImage = "url(" + Menu._IMAGEON + ")";
        objGUI.childNodes[3].style.backgroundColor = Menu.BORDERCOLOR;
        objGUI.childNodes[2].style.backgroundImage = "url(" + Menu._IMAGEONMENU + ")";

        Menu._ON_MENU = this;
      } else {
        objGUI.style.backgroundImage = "";
        objGUI.childNodes[3].style.backgroundColor = "";
        objGUI.childNodes[2].style.backgroundImage = "url(" + Menu._IMAGEOFFMENU + ")";

        if (Menu._ON_MENU == this) {
          Menu._ON_MENU = null;
        }
      }
    }

    /* @jsxobf-clobber */
    this._jsxstate = STATE;
    return this;
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._doKeyBindings = function() {
    // destroy old hot keys
    if (this._jsxhotkeys != null)
      for (var f in this._jsxhotkeys)
        this._jsxhotkeys[f].destroy();

    /* @jsxobf-clobber */
    this._jsxhotkeys = {};

    var strId = this.getId();
    var objXML = this.getXML();

    //proceed if has data
    if (objXML != null) {
      //query for any records that implement a keycode group
      for (var i = objXML.selectNodeIterator("//record[@jsxkeycode]"); i.hasNext(); ) {
        var objNode = i.next();
        //get the key code (a '+'-delimited string like:  ctrl+alt+a
        var strKeys = this._cdfav(objNode, "keycode").toLowerCase();
        var jsxid = this._cdfav(objNode, "id");

        var callback = jsx3.makeCallback(function(strId, oEvt){
            this._executeRecordHotKey(oEvt, strId); }, this, jsxid);

        // store hot keys locally
        var hk = this.doKeyBinding(callback, strKeys);
        if (hk) this._jsxhotkeys[jsxid] = hk;
      }
    }
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._executeRecordHotKey = function(objEvent, strRecordId) {
    var recordNode = this.getRecordNode(strRecordId);
    if (recordNode == null) return;
    var parentNode = recordNode.getParent();
    var parentId = parentNode != null && parentNode.getNodeName() == "record" ?
        parentNode.getAttribute('jsxid') : null;

    // must call MENU event in order to update the state of the menu to see if an item is enabled
    var bContinue = this.doEvent(Interactive.MENU,
        {objEVENT: objEvent, objANCHOR:null, intINDEX:null, strPARENTID:parentId});
    if (bContinue === false) return;

    // only execute record if the item is enabled
    if (this.isItemEnabled(strRecordId))
      this._executeRecord(objEvent, strRecordId);
  };

  Menu.BRIDGE_EVENTS = {};
  Menu.BRIDGE_EVENTS[Event.KEYDOWN] = true;
  Menu.BRIDGE_EVENTS[Event.MOUSEDOWN] = true;
  Menu.BRIDGE_EVENTS[Event.MOUSEOUT] = true;
  Menu.BRIDGE_EVENTS[Event.MOUSEOVER] = true;
  Menu.BRIDGE_EVENTS[Event.BLUR] = "_ebMouseOut";
  Menu.BRIDGE_EVENTS[Event.FOCUS] = "_ebMouseOver";

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  Menu_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 3);
  };

  /**
   * Creates the box model/profile for the object
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance.
   * @private
   */
  Menu_prototype.createBoxProfile = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //determine relative position (this will affect left, top, and boxtype properties)
    var bRelative = this.getRelativePosition() != 0;

    //create outer box
    var o = {height: 22};
    if (bRelative) {
      var mar = this.getMargin();
      o.margin = (mar != null && mar != "") ? mar : "1 4 1 0";
      o.tagname = "span";
      o.boxtype =  "relativebox";
    } else {
      var myLeft = this.getLeft();
      var myTop = this.getTop();
      o.left = (myLeft != null && myLeft != "") ? myLeft : 0;
      o.top = (myTop != null && myTop != "") ? myTop : 0;
      o.tagname = "div";
      o.boxtype = "box";
    }

    if (this.getDivider() == 1) {
      o.padding = "0 0 0 4";
      o.border = "0px;0px;0px;solid 1px " + Menu.BORDERCOLOR;
    }

    var b1 = new jsx3.gui.Painted.Box(o);

    //create the image box
    o = {height: 22, tagname: "span", boxtype: "relativebox"};
    o.width = (this.getImage() != null && this.getImage() != "") ? 22 : 3;
    var b1a = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1a);

    //create the label box
    o = {height: 22, tagname: "span", boxtype: "relativebox"};
    if (jsx3.util.strEmpty(this.getText())) {
      //collapse the box if no content
      o.width = 1;
    } else {
      //only pad if no text
      o.padding = "5 4 5 0";
    }
    var b1b = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1b);

    //paint the down-arrow-icon box
    var b1c = new jsx3.gui.Painted.Box({width: 11, height: 22, tagname: "span", boxtype: "relativebox"});
    b1.addChildProfile(b1c);

    //create the endcap box that will display the right-border when the menu anchor is active
    var b1d = new jsx3.gui.Painted.Box({width: 1, height: 22, tagname: "span", boxtype: "relativebox"});
    b1.addChildProfile(b1d);

    return b1;
  };

  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  Menu_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    if (this.getXmlAsync())
      var objXML = this.getXML();

    this._doKeyBindings();

    //call dogetcachedcontent to reset/refresh the cache; 3.2: delay call for faster initial load
    var me = this;

    //determine runtime properties
    var strBGImage = (this.getState() == Menu._STATEON) ? "background-image:url(" + Menu._IMAGEON + ");" : "";
    var strVisibility = this.paintVisibility();
    var strDisplay = this.paintDisplay();

    //render the relevant events (add other interfaces later for user-defined events)
    var strEvents = null, strImage = null, strFilter = null;
    if (this.getEnabled() == jsx3.gui.Form.STATEENABLED) {
      //get the list of all events that the system (this class) needs to handle to process events appropriately
      strEvents = this.renderHandlers(Menu.BRIDGE_EVENTS, 0);
      strFilter = "";
    } else {
      strEvents = "";
      strFilter = html.getCSSOpacity(.4);
    }

    if (this.getImage() != null)
      strImage = this.getUriResolver().resolveURI(this.getImage());

    //render custom attributes
    var strAttributes = this.renderAttributes(null, true);

    //paint the outer-most box
    var b1 = this.getBoxProfile(true);
    b1.setAttributes("id='" + this.getId() + "' " + this.paintIndex() + this.paintTip() + this.paintLabel() + strEvents + " class='jsx30toolbarbutton'" + strAttributes);
    b1.setStyles(this.paintCursor(true) + strBGImage + strVisibility + strDisplay + strFilter + this.paintZIndex() + this.paintCSSOverride());

    //paint the image/icon box
    var b1a = b1.getChildProfile(0);
    b1a.setStyles(((strImage != null) ? "background-image:url(" + strImage + ");" : ""));
    b1a.setAttributes("class='jsx30toolbarbutton_img'" + html._UNSEL);

    //paint the label/caption box
    var b1b = b1.getChildProfile(1);
    b1b.setAttributes("class='jsx30toolbarbutton_lbl'" + html._UNSEL);

    var myLabel = this.getText();
    if (myLabel != null && myLabel != "") {
      b1b.setStyles(this.paintColor() + this.paintFontName() + this.paintFontSize() + this.paintFontWeight());
    } else {
      //at least one of the child boxes within the outer box must have text content, otherwise will cause unknown layout issues. put a space in the label box if no text
      myLabel = "&#160;";
      b1b.setStyles(html._CLPSE);
    }

    //paint the arrow box (just a placeholder on a tbb; acutally implemented in menus as a down arrow image)
    var b1c = b1.getChildProfile(2);
    b1c.setStyles("background-image:url(" + ((this.getState() == Menu._STATEON) ? Menu._IMAGEONMENU : Menu._IMAGEOFFMENU) + ");");
    b1c.setAttributes("class='jsx30toolbarbutton_mnu'");

    //paint the endcap box (appears as a right border when the tbb is active)
    var b1d = b1.getChildProfile(3);
    b1d.setStyles("overflow:hidden;" + ((this.getState() == Menu._STATEON) ? "background-color:" + Menu.BORDERCOLOR + ";" : ""));
    b1d.setAttributes("class='jsx30toolbarbutton_cap'");

    //return final string of HTML
    return b1.paint().join(b1a.paint().join("&#160;") + b1b.paint().join(myLabel) + b1c.paint().join("&#160;") + b1d.paint().join("&#160;"));
  };

  Menu_prototype.onXmlBinding = function(objEvent) {
    this.jsxsupermix(objEvent);
    this._doKeyBindings();
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  Menu_prototype.paintBackgroundColor = function() {
    return "background-color:" + ((this.getBackgroundColor()) ? this.getBackgroundColor() : Menu.DEFAULTBACKGROUNDCOLOR) + ";";
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  Menu_prototype.paintBackground = function() {
    return (this.getBackground()) ? (this.getBackground() + ";") : Menu.DEFAULTBACKGROUND;
  };

  /**
   * Executes the specific <code>jsxexecute</code> code for the menu record. This method also fires
   * <code>EXECUTE</code> event for this menu but only under the deprecated 3.0 model event protocol.
   * @param strRecordId {String} id for the record whose code will be fire/execute
   * @return {jsx3.gui.Menu} this object
   */
  Menu_prototype.executeRecord = function(strRecordId) {
    this._executeRecord(this.isOldEventProtocol(), strRecordId);
    return this;
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._executeRecord = function(objEvent, strRecordId) {
    //get handle to the corresponding record in the data model
    var objRecordNode = null;
    if ((objRecordNode = this.getRecordNode(strRecordId)) != null) {
      /* can't because not private in Grid! jsxobf-clobber */
      this._jsxvalue = strRecordId;
      //get handle to the jsxexecute attribute
      var myScript = this._cdfav(objRecordNode, "execute");
      var bContinue = true;
      var context = {strRECORDID:strRecordId, objRECORD:objRecordNode, _gipp:1};
      if (objEvent instanceof jsx3.gui.Event)
        context.objEVENT = objEvent;

      // evaluate/execute the custom code for the item if it exists
      bContinue = jsx3.util.strEmpty(myScript) ? true :
          this.eval(myScript, this._getEvtContext(context));

      // fire the execute event if an explicit false was not returned
      if (bContinue !== false && objEvent)
        this.doEvent(Interactive.EXECUTE, context);
    }
  };

  /**
   * resets the cached DHTML content; hides any open menu; when the menu is next expanded (repainted), the update will be relected
   * @return {jsx3.gui.Menu} this object
   */
  Menu_prototype.redrawRecord = function() {
    //remove any cached HTML, since we'll need to regenerate due to datamodel change; hide any visible menu
    if (this == Menu._ACTIVE_MENU)
      this._hideMenu();
    return this;
  };

  /**
   * Returns the jsxid value in the CDF for the menu item last executed; returns null if unavailable
   * @return {String}
   */
  Menu_prototype.getValue = function() {
    //this value is set by execute record; it merely tracks the jsxid value in the CDF for the menu item last executed
    return this._jsxvalue;
  };

  /**
   * Sets the validation state for the menu and returns the validation state.
   * @return {int} jsx3.gui.Form.STATEVALID
   */
  Menu_prototype.doValidate = function() {
    return this.setValidationState(jsx3.gui.Form.STATEVALID).getValidationState();
  };

  /**
   * "beep" this menu by shaking the background appearance
   * @package
   */
  Menu_prototype.beep = function() {
    var objGUI = this.getRendered();
    jsx3.gui.shakeStyles(objGUI.childNodes[2], {backgroundImage: "url(" + Menu._IMAGEDOWNMENU + ")"});
    jsx3.gui.shakeStyles(objGUI, {backgroundImage: "url(" + Menu._IMAGEDOWN + ")"});
    jsx3.gui.shakeStyles(objGUI.childNodes[3], {backgroundColor: "#808080"});
    return this;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Menu.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

  Menu_prototype.emGetSession = function(objEvent) {
    //the mousedown event for the menu will trigger its display BEFORE the matrix parent is notified, causing the edit
    //session to throw a NPE or provide errant state info.  Override by allowing the edit session to be resolved locally by passing an instance of jsx3.gui.Event
    if(!objEvent) {
      return jsx3.gui.Matrix.EditMask.prototype.emGetSession.call(this);
    } else {
      var objTD = objEvent.srcElement();
      while(objTD && objTD.tagName.toLowerCase() != "td")
        objTD = objTD.parentNode;
      var recordId = objTD.parentNode.getAttribute("jsxid");
      var objMatrix = this.getAncestorOfType("jsx3.gui.Matrix");
      var objColumn = objMatrix._getDisplayedChildren()[objTD.cellIndex];
      var strValue = objColumn.getValueForRecord(recordId);
      return {matrix:objMatrix, column:objColumn, recordId:recordId, td:objTD, value:strValue};
    }
  };

  Menu_prototype.emGetType = function() {
    return jsx3.gui.Matrix.EditMask.FORMAT;
  };

  Menu_prototype.emInit = function(objColumn) {
    this.jsxsupermix(objColumn);
    this.subscribe(Interactive.EXECUTE, this, "_emOnExecute");
  };

  Menu_prototype.emSetValue = function(strValue) {
  };

  Menu_prototype.emGetValue = function() {
    return null;
  };

  Menu_prototype.emBeginEdit = function(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD) {
    var toFocus = objTD.childNodes[0].childNodes[0];
    if (toFocus) {
      this.jsxsupermix(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD);
      html.focus(toFocus);
    } else {
      return false;
    }
  };

  Menu_prototype.emPaintTemplate = function() {
    this.setEnabled(jsx3.gui.Form.STATEDISABLED);
    var disabled = this.paint();
    this.setEnabled(jsx3.gui.Form.STATEENABLED);
    var enabled = this.paint();
    return this.emGetTemplate(enabled, disabled);
  };

  /** @private @jsxobf-clobber */
  Menu_prototype._emOnExecute = function(objEvent) {
    var es = this.emGetSession();
    if (es) {
      html.focus(es.td);
      this._hideMenu(1, true);
//      jsx3.log("execute menu item " + objEvent.context.strRECORDID + " for matrix record id " + es.recordId);
    }
  };

  Menu_prototype.containsHtmlElement = function(objElement) {
    var b = this.jsxsuper(objElement);
    if (!b && this == Menu._ACTIVE_MENU) {
      for (var i = 0; i < Menu._ACTIVE_HWS.length && !b; i++) {
        var hw = Menu._ACTIVE_HWS[i];
        if (hw) b = hw.containsHtmlElement(objElement);
      }
    }
    return b;
  };

  /**
   * Returns whether this menu renders a visual divider on its left side.
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>.
   */
  Menu_prototype.getDivider = function() {
    return (this.jsxdivider != null) ? this.jsxdivider : 0;
  };

  /**
   * Sets whether this menu renders a visual divider on its left side. The divider is useful for
   * visually separating this menu from the next menu to the left.
   * @param intDivider {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>.
   * @param bRecalc {Boolean} if <code>true</code>, the view will be updated without requiring a repaint.
   * @return {jsx3.gui.Menu} this object.
   */
  Menu_prototype.setDivider = function(intDivider, bRecalc) {
    this.jsxdivider = intDivider;
    if (bRecalc)
      this.recalcBox(["border","padding"]);
    else
      this.setBoxDirty();

    return this;
  };

  Menu_prototype.emCollapseEdit = function(objEvent) {
    //collapses the ephemeral selector associated with a given edit mask
    //jsx3.log('collapsing select box of name, ' + this.getName());
    this._hideMenu(1, true);
  };

});

// import ToolbarButton methods for brevity
/* @jsxobf-clobber */
jsx3.gui.Menu.prototype._tbbDoMouseDown = jsx3.gui.ToolbarButton.prototype._ebMouseDown;
/* @jsxobf-clobber */
jsx3.gui.Menu.prototype._tbbDoMouseOver = jsx3.gui.ToolbarButton.prototype._ebMouseOver;
/* @jsxobf-clobber */
jsx3.gui.Menu.prototype._tbbDoMouseOut = jsx3.gui.ToolbarButton.prototype._ebMouseOut;

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.Menu
 * @see jsx3.gui.Menu
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Menu", -, null, function(){});
 */
jsx3.Menu = jsx3.gui.Menu;

/* @JSC :: end */
