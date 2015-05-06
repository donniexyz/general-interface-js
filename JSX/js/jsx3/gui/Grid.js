/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/* @JSC :: begin DEP */

jsx3.require("jsx3.gui.List");

// @jsxobf-clobber-shared  getDisplayedChildren
/**
 * The jsx3.gui.Grid class is a subclass of the jsx3.gui.List class. It inherits all its features except that its selection model is cell-based, not row-based.  Grids also support 'edit-masks' for complex real-time edits to the grid's values.
 *
 * @deprecated  Use <code>jsx3.gui.Matrix</code> instead.
 * @see jsx3.gui.Matrix
 */
jsx3.Class.defineClass("jsx3.gui.Grid", jsx3.gui.List, null, function(Grid, Grid_prototype) {

  var LOG = jsx3.util.Logger.getLogger(Grid.jsxclass.getName());

  var Event = jsx3.gui.Event;

  /**
   * {String}
   */
  Grid.DEFAULTXSLURL = jsx3.resolveURI("jsx:///xsl/" + (jsx3.CLASS_LOADER.IE ? "ie" : "fx") + "/jsx30grid.xsl");

  /**
   * {String} url(JSX/images/grid/select.gif)
   */
  Grid.SELECTBGIMAGE = "url(" + jsx3.resolveURI("jsx:///images/grid/select.gif") + ")";

  /**
   * {String} background-image:url(JSX/images/list/grid.gif);
   */
  Grid.DEFAULTBACKGROUND = "background-image:url(" + jsx3.resolveURI("jsx:///images/list/grid.gif") + ");";

  /**
   * {String} background-image:url(JSX/images/list/header.gif);
   */
  Grid.DEFAULTBACKGROUNDHEAD = "background-image:url(" + jsx3.resolveURI("jsx:///images/list/header.gif") + ");";

  /* @JSC */ if (jsx3.CLASS_LOADER.IE6) {
    jsx3.html.loadImages("jsx:///images/grid/select.gif", "jsx:///images/list/grid.gif", "jsx:///images/list/header.gif");
  /* @jSC */ }
  /**
   * {String} #c8cfd8
   */
  Grid.DEFAULTBACKGROUNDCOLOR = "#c8cfd8";

  /**
   * {String} #c8cfd8
   */
  Grid.DEFAULTBACKGROUNDCOLORHEAD = "#c8cfd8";

  /**
   * {String} jsx30list_r2
   */
  Grid.DEFAULTROWCLASS = "jsx30list_r2";

  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   */
  Grid_prototype.init = function(strName) {
    //call constructor for super class
    this.jsxsuper(strName);
  };

  /** @private @jsxobf-clobber */
  Grid_prototype._resetSelectionState = function() {
    /* @jsxobf-clobber-shared */
    this._jsxcurfocus = null;
    /* rediculous that we can't clobber the next two */
    this._jsxcellindex = null;
    this._jsxrowid = null;
  };

  /**
   * Returns whether the grid will listen (true) for the tab key and advance cursor focus to the next cell in the grid
   * @return {boolean} one of: jsx3.Boolean.TRUE or jsx3.Boolean.FALSE
   */
  Grid_prototype.getTabListener = function() {
    return this.jsxtablistener;
  };

  /**
   * ets whether the grid will listen (true) for the tab key and advance cursor focus to the next cell in the grid. Default: True
   * @param bBOOLEAN {boolean} one of: jsx3.Boolean.TRUE or jsx3.Boolean.FALSE
   * @return {jsx3.gui.Grid} this object
   */
  Grid_prototype.setTabListener = function(bBOOLEAN) {
    this.jsxtablistener = bBOOLEAN;
    return this;
  };

  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  Grid_prototype.paint = function() {
    //reset any mask as a repaint can affect its display
    this.resetMask();
    this._resetSelectionState();

    //call paint method for superclass, passing results of interface method from _JSXXML class, 'doCall()'
    return this.jsxsuper();
  };

  /**
   * Returns CSS class to use for each repeating TR in the Grid. Default: jsx3.gui.Grid.DEFAULTROWCLASS. (Using the default class generates a
   *          fixed-height row (20px) that overlays the default background (an alternating row color defined by the jsxbg default, jsx3.gui.Grid.DEFAULTBACKGROUND).)
   * @return {String} valid CSS class to apply to an HTML TR element
   */
  Grid_prototype.getClassName = function() {
    //subclassed method; ensures a data cell for a given column is appropriately styled per the specifics of the column
    return (this.jsxclassname == null) ? Grid.DEFAULTROWCLASS : this.jsxclassname;
  };

  /**
   * Returns XSLT for the Grid, prioritizing the acquisition in the following order: 1) check cache; 2) check jsxxsl; 3) check jsxxslurl; 4) use default
   * @return {jsx3.xml.Document} jsx3.xml.Document instance containing valid XSL stylesheet
   */
  Grid_prototype.getXSL = function() {
    return this._getSharedXSL(Grid.DEFAULTXSLURL);
  };

  /**
   * validates the Grid; if the Grid is set to 'required', a selection must be made to pass validation. Otherwise, a Grid will always pass validation
   * @return {int} one of: jsx3.gui.Form.STATEINVALID or jsx3.gui.Form.STATEVALID
   */
  Grid_prototype.doValidate = function() {
    //subclassed; always return true; Grid instances don't pay attention to the 'selection' state as they are typically used for editing structure grids of data
    return this.setValidationState(jsx3.gui.Form.STATEVALID).getValidationState();
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  Grid_prototype.paintBackgroundColor = function() {
    return "background-color:" + ((this.getBackgroundColor()) ? this.getBackgroundColor() : Grid.DEFAULTBACKGROUNDCOLOR) + ";";
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  Grid_prototype.paintBackground = function() {
    return (this.getBackground()) ? (this.getBackground() + ";") : Grid.DEFAULTBACKGROUND;
  };

  /**
   * called programmatically when user mouses down on the resize anchor for a column; preps the positioning and display for the resize bar
   * @private
   * @jsxobf-clobber-shared
   */
  Grid_prototype.doResizeBegin = function(objEvent, objGUI) {
    this.resetMask();
    this.jsxsuper(objEvent, objGUI);
  };

  /**
   * takes the active mask and puts at 0,0; sets visibility to hidden
   * @param objMask {jsx3.app.Model} JSX GUI object to reset; if not passed, the class will try determine the active mask and, if found, reset it
   */
  Grid_prototype.resetMask = function(objMask) {
    if (objMask || ((objMask = this.getActiveMask()) != null))
      objMask.setVisibility(jsx3.gui.Block.VISIBILITYHIDDEN,true).setLeft(0,true).setTop(0,true);
  };

  /**
   * sorts the Grid according to the CDF attribute name specified by setSortPath. If no sort direction is specified, the value will be toggled. Hides any active (resets) edit mask
   * @param SORTDIRECTION {String} one of: jsx3.gui.List.SORTASCENDING or jsx3.gui.List.SORTDESCENDING
   * @package
   */
  Grid_prototype.doSort = function(SORTDIRECTION) {
    //commit any in-process edits before sorting; sort outpaces the blur, so must be called explicitly
    var objMask;
    if (objMask = this.getActiveMask()) this.onAfterEdit(null,objMask);
    this.resetMask();
    this.jsxsuper(SORTDIRECTION);
  };

  /**
   * repaints the body portion of the Grid (the data rows); retains scroll position in the Grid whereas repainting the entire Grid would reset scroll position
   * @package
   */
  Grid_prototype.repaintBody = function() {
    //update the VIEW for the data rows
    this.resetMask();
    this.jsxsuper();
  };

  /**
   * called when an on-screen TD (the correspondeing VIEW element for a CDF 'record' node) loses focus (either because another TD was chosen or another on-screen control was selected)
   * @private
   */
  Grid_prototype.doBlurItem = function(objTD) {
  };

  /**
   * gives cursor focus to a given cell in the grid; makes sure previous cell's edits are saved; highlights the cell; displays the relevant edit mask
   * @param objTD {HTMLElement} on-screen TD element that should be given focus
   * @param bInternal {boolean} true if this method called internally by 'doKeyDown' and not by the TD's focus event
   * @private
   * @deprecated  requires static access to current event
   */
  Grid_prototype.doFocusItem = function(objTD, bInternal) {
    // DEPRECATED: fix this
    var objEvent = Event.getCurrent();

    var doc = objTD.ownerDocument;
    var strRecordId = objTD.parentNode.id.substring(this.getId().length + 1);
    if (! this.isRecordSelectable(strRecordId)) return;

    var bFocusChanged = objTD != this._jsxcurfocus || bInternal;

    //give DOM focus (VIEW); set font to bold and persist a ref (this will also become the anchor cell when selecting ranges
    if (bFocusChanged && this._jsxcurmask != null && ((bInternal == true) || (bInternal != true && !(this._jsxcurmask instanceof jsx3.gui.TextBox)))) {
      //this needs to be more generic, but for now addresses the blur event for text mask (blur is unique to text boxes and needs this exception)
      this.onAfterEdit(this._jsxcurfocus,this._jsxcurmask);
    } else if (bFocusChanged && this._jsxcurmask != null) {
       this.resetMask();
    }

    try {
      //give explicit focus to the cell in the grid (if it already has focus, it's OK)
      jsx3.html.focus(objTD);

      //remove the bg image from any prior selection
      if (this._jsxcurfocus != null) this._jsxcurfocus.style.backgroundImage = (this._jsxcurfocus.prevBG != null) ? this._jsxcurfocus.prevBG : "";

      //if the grid is set to grow and the user just gave focus to the last row, append the relevant row count
      if (this.getGrowBy() > 0 && objTD.parentNode == objTD.parentNode.parentNode.lastChild) this.appendRow();
    } catch(e) {
      //tried to remove the style for the previously selected cell, but it failed; try to grab its ref via id/child position combo
      var objTR = doc.getElementById(this._jsxrowid);
      if (objTR != null) objTR.childNodes[this._jsxcellindex].style.backgroundImage = "";
      return false;
    }

    //save any existing bg property, so it can be restored once the cell loses focus; set standard 'highlight' bg image to denote selection
    objTD.prevBG = objTD.style.backgroundImage;
    objTD.style.backgroundImage = Grid.SELECTBGIMAGE;

    //persist contants to keep track of the
    this._jsxcurfocus = objTD;
    this._jsxcellindex = objTD.cellIndex;
    this._jsxrowid = objTD.parentNode.id;

    var objColumn = this.getDisplayedChildren()[this._jsxcellindex];

    //show the edit mask for the cell if this method wasn't called internally by 'doKeyDown'. If this function is called by 'doKeyDown',
    //it will only give focus to the on-screen element, @objTD, and then end. When objTD receives focus, it has its own 'focus' event
    //which will then call this event one more time, displaying the mask
    if (bInternal == null) {
      var maskAttr = objTD.getAttribute("jsxmask");
      if (!jsx3.util.strEmpty(maskAttr) && maskAttr != "jsxnull") {
        var objMask = objColumn.getDescendantOfName(maskAttr) || this.getDescendantOfName(maskAttr);
        this.onBeforeEdit(objEvent, objTD, objMask);
      } else {
        this.doEvent(jsx3.gui.Interactive.SELECT, {objEVENT:objEvent, strRECORDID:strRecordId,
            intCOLUMNINDEX:this._jsxcellindex});
      }
    }
  };

  /**
   * called when an EDITABLE cell (TD) in the  grid gets focus
   * @param objGUI {HTMLElement} on-screen TD element representing attribute on active CDF record being edited
   * @param objMASK {jsx3.app.Model} JSX GUI object as edit mask (i.e., jsx3.gui.TextBox, jsx3.gui.Menu, etc)
   * @private
   * @jsxobf-clobber
   */
  Grid_prototype.onBeforeEdit = function(objEvent, objGUI, objMASK) {
    //hide any existing mask and reset ref to the new mask, @objMASK
    this.resetMask();
    this._jsxcurmask = objMASK;

    //initialize variables that any custom scripts can access for contextual information
    var strATTRIBUTENAME = this.getDisplayedChildren()[this._jsxcellindex].getPath().replace(/@/g,"");
    var strRecordId = this.getSelectedId();

    //preset the value for the mask before firing the 'beforeedit' event
    objMASK.setValue();

    //execute any handler code
    var bContinue = this.doEvent(jsx3.gui.Interactive.BEFORE_EDIT,
        {objEVENT:objEvent, strATTRIBUTENAME:strATTRIBUTENAME, strRECORDID:strRecordId, objMASK:objMASK,
         intCOLUMNINDEX:this._jsxcellindex});

    //continue modifying the edit mask if it is the system default (text box)
    if (bContinue !== false && objGUI != null && objMASK != null) {
      var doc = objGUI.ownerDocument;
      //get the header height to know how to offset the mask
      var intHeaderHeight = (this.getHeaderHeight() === 0 || this.getHeaderHeight()) ? this.getHeaderHeight() : jsx3.gui.List.DEFAULTHEADERHEIGHT;

      // keep track of the row for which the mask is valid:
      objMASK._jsxvalidrow = objGUI.parentNode.id;

      //get handle to the body of the grid (grids have header and body sections)
      var objBody = doc.getElementById(this.getId() + "_jsxbody");

      //get common vars (those that would be used by all masks)
      var objRecord = this.getRecord(strRecordId);
      var vntValue = objRecord[strATTRIBUTENAME];
      if (vntValue == null) vntValue = "";
      var objP = this.getAbsolutePosition(this.getRendered(),objGUI);

      //branch generic configuration based on mask type
      if (objMASK instanceof jsx3.gui.TextBox) {
        objMASK.setLeft(objP.L+objBody.scrollLeft,true);
        objMASK.setTop(objP.T-intHeaderHeight+objBody.scrollTop,true);
        objMASK.setWidth(objP.W-1,true);
        objMASK.setHeight(objP.H-1,true);
        objMASK.setValue(vntValue);
        objMASK._jsxprevmaskvalue = vntValue;
        objMASK.setVisibility(jsx3.gui.Block.VISIBILITYVISIBLE,true);

        //if content is too large and causes scrolling, update the height
        if ((objGUI = objMASK.getRendered()) && objGUI.scrollHeight > objGUI.offsetHeight) objMASK.setHeight(objP.H-1+objP.H,true);

        //pre-select any text for the mask (text areas do selection differently)
        if (objMASK.getType() == 1) {
          //focus to scroll into view and select to highlight the text (this is a textarea)
          objMASK.focus();
          objMASK.getRendered().select();
        } else {
          objMASK.focus();
          if(doc.selection) {
            var oRange = doc.selection.createRange();
            oRange.move("sentence",-1);
            oRange.moveEnd("character",vntValue.length);
            oRange.select();
          }
        }
      } else if (objMASK instanceof jsx3.gui.ToolbarButton || objMASK instanceof jsx3.gui.Menu) {
        //both menus and tbbs use the same anchor object
        objMASK.setLeft(objP.L+objP.W-objMASK.getAbsolutePosition().W+objBody.scrollLeft+((objMASK instanceof jsx3.gui.Menu)?2:0),true);
        objMASK.setTop(objP.T-intHeaderHeight+objBody.scrollTop-2,true);
        objMASK.setVisibility(jsx3.gui.Block.VISIBILITYVISIBLE,true);
        objMASK._jsxvalue = (vntValue == "") ? null : vntValue;
        objMASK._jsxprevmaskvalue = vntValue;
        if (objEvent.ctrlKey()) {
          if (objMASK instanceof jsx3.gui.Menu) {
            //display the menu list
            objMASK.showMenu(objEvent, objMASK.getRendered(), 1);
          } else {
            objMASK.focus();
          }
        }
      } else if (objMASK instanceof jsx3.gui.Select) {
        //update the value for the mask; this also causes any corresponding text to display; if a combo, force the text to display in case no corresonding value (happens when user types a value not part of the CDF sourc)

        if (objMASK.getValue() == null) {
          objMASK.setValue((vntValue == "") ? null : vntValue);
          objMASK.setText((vntValue == null) ? "" : vntValue);
        }

        //update position info
        objMASK.setLeft(objP.L+objBody.scrollLeft,true);
        objMASK.setTop(objP.T-intHeaderHeight+objBody.scrollTop,true);
        objMASK.setWidth(objP.W-1,true);
        objMASK.setHeight(objP.H-1,true);

        //persist the value to check for deltas and show, giving focus where appropriate
        objMASK._jsxprevmaskvalue = objMASK.getValue();
        objMASK.setVisibility(jsx3.gui.Block.VISIBILITYVISIBLE,true);
        if (objEvent.ctrlKey()) {
          objMASK.show();
        } else {
          objMASK.focus();
        }
      }

      //remove flag that stops double-save of edits (results from needing a blur event to deal with lost focus for a text edit mask (as happens with a click), while trying to commit those same edits using key nav-generate events)
      delete this._jsxisblur;
    }
  };

  /**
   * called when an edit mask (typically a textbox) receives a key event; handles appropriately before routing the keyhandling to the grid
   * @private
   * @deprecated  requires static access to current event
   */
  Grid_prototype.doMaskKeyDown = function(objGUI,objEvent) {
    // DEPRECATED: static access to event object is deprecated
    if(objEvent == null) objEvent = Event.getCurrent();

    var bCaptured = false;

    //get handle to the current on-screen TD having its contents edited
    var strCode = objEvent.keyCode();
    var bIsArrow = strCode > 36 && strCode < 41;

    if (((objEvent.enterKey() || objEvent.tabKey()) && !objEvent.ctrlKey()) ||  (bIsArrow && (objEvent.ctrlKey() || objEvent.altKey()))) {
      //morph the key code, to re-use standard arrow-based navigation for the grid
      if ((objEvent.enterKey() && objEvent.shiftKey()) || strCode == Event.KEY_ARROW_UP) {
        //up arrow
        objEvent.setKeyCode(Event.KEY_ARROW_UP);
      } else if (objEvent.enterKey() || strCode == Event.KEY_ARROW_DOWN) {
        //down arrow
        objEvent.setKeyCode(Event.KEY_ARROW_DOWN);
      } else if (objEvent.tabKey() && objEvent.shiftKey() && !(!this.getTabListener() || this.getTabListener() == jsx3.Boolean.TRUE)) {
        try {
          this.focus();
          return;
        } catch(e) {}
      } else if (objEvent.tabKey() && !(!this.getTabListener() || this.getTabListener() == jsx3.Boolean.TRUE)) {
        try {
          jsx3.html.focus(this.getRendered().lastChild);
          return;
        } catch(e) {}
      }
      //set flag that tells the blur for a text-type edit mask
      this._jsxisblur = (this.getActiveMask() && (this.getActiveMask() instanceof jsx3.gui.TextBox));

      //call keydown function to handle all navigation logic (whether or not to navigate forward or back)
      this._ebKeyDown(objEvent, objGUI);
      bCaptured = true;
    } else if (objEvent.ctrlKey() && objEvent.enterKey()) {
      //when user presses ctrl+enter on an input mask, assume we want to type an enter key (branch for other mask types -- only do following on a textarea
      var objSelRange = this.getDocument().selection.createRange();
      objSelRange.text = "\n";
      objSelRange.select();
      bCaptured = true;
    } else if (bIsArrow) {
      bCaptured = true;
    }

    if (bCaptured) objEvent.cancelBubble();
  };

  /**
   * Returns jsxid attribute for the CDF record selected in the view.
   * @return {String} jsxid or null
   */
  Grid_prototype.getSelectedId = function() {
    if (this._jsxrowid != null) {
      var objGUI = this.getRendered();
      if (objGUI) {
        var row = objGUI.ownerDocument.getElementById(this._jsxrowid);
        if (row != null)
          return this._jsxrowid.substring(this.getId().length + 1);
      }

      this._resetSelectionState();
    }

    return null;
  };

  /**
   * Returns a handle to the active Mask for the grid.
   * @return {jsx3.app.Model}
   */
  Grid_prototype.getActiveMask = function() {
    return  this._jsxcurmask;
  };

  /**
   * Returns a handle to the active TD for the grid.
   * @return {HTMLElement}
   */
  Grid_prototype.getActiveCell = function() {
    return  this._jsxcurfocus;
  };

  /**
   * Returns a handle to the active TR for the grid.
   * @return {HTMLElement}
   */
  Grid_prototype.getActiveRow = function() {
    var objCell;
    return (objCell = this.getActiveCell()) ? objCell.parentNode : null;
  };

  /**
   * Returns name of attribute that is mapped to the cell being edited (as defined by jsxpath property for the column containing the cell).
   * @return {String} name of attribute or null
   */
  Grid_prototype.getActiveAttribute = function() {
    if (this._jsxcellindex) {
      var child = this.getDisplayedChildren()[this._jsxcellindex];
      if (child)
        return child.getPath().replace(/@/g,"");
    }
    return null;
  };

  /**
   * called when the edit mask loses focus and immediately before any edits are commited
   * @param objGUI {HTMLElement} on-screen TD element representing attribute on active CDF record being edited
   * @param objMASK {jsx3.app.Model} JSX GUI object as edit mask (i.e., jsx3.gui.TextBox, jsx3.gui.Menu, etc)
   * @param bFocus {boolean} false if null; if true, @objGUI will be given focus after the update (for menus, tbb, etc)
   * @param bKeepMask {boolean} false if null; if true, the reference to the mask will not be removed as well as the mask's ref to the row its editing
   * @private
   * @deprecated  requires static access to current event
   */
  Grid_prototype.onAfterEdit = function(objGUI,objMASK,bFocus,bKeepMask) {
    // DEPRECATED: fix this
    var objEvent = Event.getCurrent();

    var strATTRIBUTENAME = this.getDisplayedChildren()[this._jsxcellindex].getPath().replace(/@/g,"");
    var strRecordId = this.getSelectedId();
    if (objGUI == null) objGUI = this._jsxcurfocus;

    var rowId = objGUI && objGUI.parentNode ? objGUI.parentNode.id : null;
    if (objMASK._jsxvalidrow == null || objMASK._jsxvalidrow != rowId) {
      LOG.warn("onAfterEdit called for invalid row " + rowId);
      return;
    }

    if (!(jsx3.util.strEmpty(objGUI.getAttribute("jsxmask")) || objGUI.getAttribute("jsxmask") == "jsxnull")) {
      // JCG: don't send event if the value hasn't changed
      if (objMASK == null ||
          (typeof(objMASK.getValue) == "function" && objMASK.getValue() != objMASK._jsxprevmaskvalue)) {

        //first allow any custom code to execute; code can return false (either because of an error/wrong value or because the custom code did all processing/handling already)
        var bContinue = this.doEvent(jsx3.gui.Interactive.AFTER_EDIT,
            {objEVENT:objEvent, strATTRIBUTENAME:strATTRIBUTENAME, strRECORDID:strRecordId, objMASK:objMASK,
             objGUI:objGUI, intCOLUMNINDEX:this._jsxcellindex});

        if (bContinue !== false && objMASK != null) {
          this.updateCell(strATTRIBUTENAME,strRecordId,objGUI,objMASK);
          if (bFocus && (objMASK instanceof jsx3.gui.Menu))
            jsx3.html.focus(this.getActiveCell());
        }
      }
    }

    // remove ref to the edit mask; as long as ref exists, system will try to commit its value
    // hide the mask; regardless of whether or not we persist the value, the mask should be hidden
    if (objMASK != null && bKeepMask !== true) {
      this.resetMask(objMASK);
      delete this._jsxcurmask;
      delete objMASK._jsxvalidrow;
    }
  };

  /**
   * updates the CDF attribute with the value of the mask; this MODEL update is then routed to 'updateRow' where the VIEW is then regenerated via an XSLT merge
   * @param strATTRIBUTENAME {boolean} false if null; if true, @objGUI will be given focus after the update (for menus, tbb, etc)
   * @param strRecordId {boolean} false if null; if true, the reference to the mask will not be removed as well as the mask's ref to the row its editing
   * @param objGUI {HTMLElement} on-screen TD element representing attribute on active CDF record being edited
   * @param objMASK {jsx3.app.Model} JSX GUI object as edit mask (i.e., jsx3.gui.TextBox, jsx3.gui.Menu, etc)
   * @package
   */
  Grid_prototype.updateCell = function(strATTRIBUTENAME,strRecordId,objGUI,objMASK) {
    if (objMASK == null) objMASK = this.getActiveMask();
    if (objGUI == null) objGUI = this._jsxcurfocus;
    if (objMASK && objGUI) {
      if (strATTRIBUTENAME == null) strATTRIBUTENAME = this.getDisplayedChildren()[this._jsxcellindex].getPath().replace(/@/g,"");
      if (strRecordId == null) strRecordId = this.getSelectedId();

      var vntValue = typeof(objMASK.getMaskValue) == 'function' ?
          objMASK.getMaskValue() : objMASK.getValue();
      if (vntValue == null) vntValue = "";

      //update the CDF; pass true, so the on-screen view is automatically updated, too
      this.insertRecordProperty(strRecordId,strATTRIBUTENAME,vntValue,true);
    }
  };

  /**
   * called by keydown event; performs appropriate: 'select', 'execute', or 'tab-out' option; provides cell-based navigation (as opposed to the row-based for the list superclass)
   * @private
   */
  Grid_prototype._ebKeyDown = function(objEvent, objGUI) {
    // check for hot keys
    if (this.jsxsupermix(objEvent, objGUI)) return;
//jsx3.log("a");
    //if no current context, escape
    if (this._jsxcurfocus == null || this._jsxcurfocus.parentNode == null) return;

    var curfocus = this._jsxcurfocus;
    var columnCount = this.getDisplayedChildren().length;
//jsx3.log(columnCount);
    //persist the ref (we're about to cancel)
    var intKeyCode = objEvent.keyCode();
//jsx3.log("KC: " + intKeyCode);
    //switch
    var bIsArrow = (intKeyCode >= Event.KEY_ARROW_LEFT && intKeyCode <= Event.KEY_ARROW_DOWN) || (intKeyCode == Event.KEY_TAB && (!this.getTabListener() || this.getTabListener() == jsx3.Boolean.TRUE));
    var bCaptured = bIsArrow;

    //branch depending upon up/down arrow, return, space, and tab key events
    if (bIsArrow) {
      var objTD = null;
      var bFirstColumn = curfocus == curfocus.parentNode.firstChild;
      var bLastColumn = curfocus.cellIndex >= columnCount - 1;
      var bFirstRow = curfocus.parentNode == curfocus.parentNode.parentNode.firstChild;
      var bLastRow = curfocus.parentNode == curfocus.parentNode.parentNode.lastChild;

      if (intKeyCode == Event.KEY_ARROW_LEFT || (objEvent.shiftKey() && intKeyCode == Event.KEY_TAB)) { // left
        if (intKeyCode == Event.KEY_TAB) intKeyCode = Event.KEY_ARROW_LEFT;
        if (bFirstColumn) {
          if (bFirstRow)
            objTD = curfocus;
          else
            objTD = curfocus.parentNode.previousSibling.childNodes[columnCount - 1];
        } else {
          objTD = curfocus.previousSibling;
        }
      } else if (intKeyCode == Event.KEY_ARROW_UP) { // up
        if (bFirstRow)
          objTD = curfocus;
        else
          objTD = curfocus.parentNode.previousSibling.childNodes[curfocus.cellIndex];
      } else if (intKeyCode == Event.KEY_ARROW_RIGHT || intKeyCode == Event.KEY_TAB) { // right
        if (intKeyCode == Event.KEY_TAB) intKeyCode = Event.KEY_ARROW_RIGHT;
        if (bLastColumn) {
          if (bLastRow)
            objTD = curfocus;
          else
            objTD = curfocus.parentNode.nextSibling.childNodes[0];
        } else {
          objTD = curfocus.nextSibling;
        }
      } else if (intKeyCode == Event.KEY_ARROW_DOWN) { // down
        if (bLastRow)
          objTD = curfocus;
        else
          objTD = curfocus.parentNode.nextSibling.childNodes[curfocus.cellIndex];
      }

      this.doFocusItem(objTD, true);
    } else if (intKeyCode == Event.KEY_ENTER) {
      //grid doesn't support execute on enter key press for now...modify is less common (if needed)
    } else if (intKeyCode == Event.KEY_TAB && objEvent.shiftKey()) {
      //go to previous control (escape the LV)
      this.focus();
      bCaptured = true;
    } else if (intKeyCode == Event.KEY_TAB) {
      //go to next control (escape the LV)
      jsx3.html.focus(this.getRendered().lastChild);
      bCaptured = true;
    }

    if (bCaptured) {
      //reset the key code to stop unwanted behaviors
      objEvent.cancelBubble();
      objEvent.cancelReturn();
    }
  };

  /**
   * executes any bound code for the record, @strRecordId (assuming an @strRecordId is passed); follows this execution event specific to the given record with the execution event bound to the List instance
   *            called by the system when the data rows receive a dblclick or enter key event; otherwise can be called by
   *            the developer to exectue the code specific to @strRecordId followed by the execute event for the list in general
   *            If this method is called by an 'enterkey' event or if no record id is passed, it is assumed that all elements
   *            that are selected in the list will have their execution events run
   * @param strRecordId {String} 'jsxid' value for the record node (according to the CDF) to execute
   * @deprecated
   */
  Grid_prototype.doExecute = function(strRecordId, intColumnIndex) {
    this._doExecute(this.isOldEventProtocol(), strRecordId, intColumnIndex);
  };

  /** @private @jsxobf-clobber-shared */
  Grid_prototype._doExecute = function(objEvent, strRecordId, intColumnIndex) {
    if (strRecordId == null && this._jsxrowid)
      strRecordId = this._jsxrowid.substring(this.getId().length + 1);

    if (intColumnIndex == null)
      intColumnIndex = this._jsxcellindex;

    if (strRecordId == null) return;

    if (! this.isRecordSelectable(strRecordId))
      return;

    //TO DO: continue to customize
    //execute code specific to the record
      //fire the specific event for this item
    var objRecord = this.getRecordNode(strRecordId);

    if (objRecord != null)
      this.eval(objRecord.getAttribute("jsxexecute"), {strRECORDID:strRecordId, intCOLUMNINDEX:intColumnIndex});

    // execute execution code for the ListView
    if (objEvent)
      this.doEvent(jsx3.gui.Interactive.EXECUTE, {objEVENT:(objEvent instanceof Event ? objEvent : null),
          strRECORDID:strRecordId, intCOLUMNINDEX:intColumnIndex});
  };

  /**
   * called by click event on the grid; makes sure a valid item was clicked and then provides the appropriate focus
   * @private
   */
  Grid_prototype._ebClick = function(objEvent, objGUI) {
    // get handle to item that was clicked (exit early if the user clicked a range of cells (the TBODY or the TR))
    var objCell = objEvent.srcElement();
    if (objCell.tagName == "TBODY" || objCell.tagName == "TR") return;

    var rootGUI = this.getRendered();
    while (objCell.tagName != "TD" && objCell != rootGUI)
      objCell = objCell.parentNode;

    if (objCell.tagName == "TD") {
      // check that this is a TD in the data, rather than some other TD
      if (objCell.parentNode.getAttribute("JSXDragId") == null) return;

      // don't listen to click events if user clicked a cell in the buffer column
      if (objCell.cellIndex == this.getDisplayedChildren().length) return;

      // give focus to the cell to fire the appropriate event (is it editable, is it focusable, etc)
      jsx3.html.focus(objCell);

      // cancel bubbling and return
      objEvent.cancelBubble();
      objEvent.cancelReturn();
    }
  };

  /**
   * subclass of interface to provide extensions to the body of the core list; in the case of the jsx.Grid class, the edit masks
   *           associated (bound as a direct child) with a given Column can be generated here
   * @private
   */
  Grid_prototype.paintExtras = function() {
    var strHTML = '';
    var vChildren = this.getDisplayedChildren();
    var maxLen = vChildren.length;
    for (var i=0; i < maxLen; i++) {
      //if last iteration, paint the buffer column
      var objChild = vChildren[i];
      var grandChildren = objChild.getChildren();
      for (var j = 0; j < grandChildren.length; j++) {
        strHTML += grandChildren[j].paint();
      }
    }
    return strHTML;
  };

  /**
   * reset the mask if necessary before repainting the given row
   * @param strRecordId {String} 'jsxid' value for the record node (according to the CDF) to redraw
   * @param ACTION {int} One of the following values: jsx3.xml.CDF.INSERT, jsx3.xml.CDF.DELETE, jsx3.xml.CDF.UPDATE
   */
  Grid_prototype.redrawRecord = function(strRecordId, ACTION) {
    if (ACTION == jsx3.xml.CDF.DELETE) {
      this.resetMask();
    }

    this.jsxsuper(strRecordId, ACTION);
  };

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Grid.getVersion = function() {
    //subclassed method
    return "3.0.00";
  };

});

/**
 * @deprecated  Renamed to jsx3.gui.Grid
 * @see jsx3.gui.Grid
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Grid", -, null, function(){});
 */
jsx3.Grid = jsx3.gui.Grid;

/* @JSC :: end */
