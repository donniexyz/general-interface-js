/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/* @JSC :: begin DEP */

jsx3.require("jsx3.xml.Cacheable", "jsx3.gui.Form", "jsx3.gui.Block", "jsx3.gui.Column");

/**
 * The jsx3.gui.List class supports sorting, resizing, reordering, selection, discontinuous selection, key and mouse navigation, etc. Its data is accessed via the CDF interface.
 *
 * @deprecated  Use <code>jsx3.gui.Matrix</code> instead.
 * @see jsx3.gui.Matrix
 */
jsx3.Class.defineClass("jsx3.gui.List", jsx3.gui.Block, [jsx3.gui.Form, jsx3.xml.Cacheable, jsx3.xml.CDF], function(List, List_prototype) {

  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;
  var CDF = jsx3.xml.CDF;
  var html = jsx3.html;

  var LOG = jsx3.util.Logger.getLogger(List.jsxclass.getName());

  /**
   * {String} JSX/xsl/[?fx]/jsx30list.xsl (default)
   * @deprecated
   */
  List.DEFAULTXSLURL = jsx3.resolveURI("jsx:///xsl/" + (jsx3.CLASS_LOADER.IE ? "ie" : "fx") + "/jsx30list.xsl");

  /**
   * {String} url(JSX/images/list/select.gif)
   */
  List.SELECTBGIMAGE = "url(" + jsx3.resolveURI("jsx:///images/list/select.gif") + ")";

  /**
   * {String} background-image:url(JSX/images/list/header.gif);
   */
  List.DEFAULTBACKGROUNDHEAD = "background-image:url(" + jsx3.resolveURI("jsx:///images/list/header.gif") + ");";

  /* @JSC */ if (jsx3.CLASS_LOADER.IE6) {
  html.loadImages("jsx:///images/list/select.gif", "jsx:///images/list/header.gif");
  /* @JSC */ }
  /**
   * {String} #F3F2F4
   */
  List.DEFAULTBACKGROUNDCOLOR = "#F3F2F4";

  /**
   * {String} #c8cfd8
   */
  List.DEFAULTBACKGROUNDCOLORHEAD = "#c8cfd8";

  /**
   * {String} ascending
   * @final @jsxobf-final
   */
  List.SORTASCENDING = "ascending";

  /**
   * {String} descending
   * @final @jsxobf-final
   */
  List.SORTDESCENDING = "descending";

  /**
   * {int} 20
   */
  List.DEFAULTHEADERHEIGHT = 20;

  /**
   * {int} 1
   * @final @jsxobf-final
   */
  List.MULTI = 1;

  /**
   * {int} 0
   * @final @jsxobf-final
   */
  List.SINGLE = 0;

  /**
   * {int} 2
   * @final @jsxobf-final
   */
  List.NOTSELECTABLE = 2;

  /**
   * {String} #2050df
   */
  List.RESIZEBARBGCOLOR = "#2050df";

  /**
   * {String} jsx30list_r1
   */
  List.DEFAULTROWCLASS = "jsx30list_r1";

  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   */
  List_prototype.init = function(strName) {
    //call constructor for super class
    this.jsxsuper(strName);

    //global ref to GUI objects in VIEW to support selection and focus events
    /* @jsxobf-clobber-shared */
    this._jsxcurfocus = null;  //the row (TR) in the list that has active cursor focus
    /* @jsxobf-clobber */
    this._jsxcur = null;       //the row (TR) in the list that was last selected by the user, but may or may not have cursor focus

    //global refs used to manage column resize events
    /* @jsxobf-clobber */
    this._jsxcurleft = null;
    /* @jsxobf-clobber */
    this._jsxcurindex = null;
  };

  /**
   * removes handle/reference to the child JSX GUI Object; removes the on-screen DHTML for the removed object; dereferences the object for cleanup/automatic garbage collection by the browser;
   *            returns a reference to self to facilitate method chaining.
   * @package
   */
  List_prototype.onRemoveChild = function(objChild, intIndex) {
    // call method in superclass
    this.jsxsuper(objChild, intIndex);

    // always destroy existing XSLT in cache as its now irrelevant
    this.resetXslCacheData();
    this.repaint();
  };

  List_prototype.paintChild = function(objJSX, bGroup) {
    if (! bGroup) {
      this.resetXslCacheData();
      this.repaint();
    }
  };

  /**
   * @package
   */
  List_prototype._getSharedXSL = function(strDefaultUrl) {
    var objXSL = this.jsxsupermix(strDefaultUrl);
    if (objXSL.getSourceURL() == strDefaultUrl)
      objXSL = objXSL.cloneDocument();
    this._configXSL(objXSL);
    return objXSL;
  };

  /**
   * Returns xslt for the List, prioritizing the acquisition in the following order: 1) check cache; 2) check jsxxsl; 3) check jsxxslurl; 4) use default
   * @return {jsx3.xml.Document} jsx3.xml.Document instance containing valid XSL stylesheet
   */
  List_prototype.getXSL = function() {
    return this._getSharedXSL(List.DEFAULTXSLURL);
  };

  List_prototype._configXSL = function(objXSL) {
    //query the xsl to see if its been configured
    var objNode = objXSL.selectSingleNode("//xsl:comment[.='JSXUNCONFIGURED']");
    if (objNode != null) {
      //the base template has NOT been extended to include the column-specific templates; configure here
      objNode.setValue("JSXCONFIGURED");
      var children = this.getDisplayedChildren();
      var maxLen = children.length;
      if (maxLen > 0) {
        for (var i = 0; i <= maxLen; i++) {
          var objXML = new jsx3.xml.Document();
          //if this is the final iteration, request the buffer column xslt
          var strXSL = (i == maxLen) ? children[maxLen - 1].paintXSLString(true) : children[i].paintXSLString();
          objXML.loadXML(strXSL);
          if (objXML.hasError()) {
            LOG.error("Error loading XSL for column #" + i + " of " + this + ": " + objXML.getError());
          } else {
            objNode.getParent().insertBefore(objXML.getRootNode(),objNode);
          }
        }
      }
    }
//    } else {
//      jsx3.util.Logger.doLog("XLST","No default stylesheet can be found for the List control, " + this.getId() + ".");
//    }
  };

  /**
   * List instances typically start with a baseline, system XSL file which is then extended at run-time to include the output markup specific to the child columns;
   *          calling this method will remove the document from the cache, effectively causing the template to reset; returns ref to self
   * @return {jsx3.gui.List} this object
   * @deprecated  use <code>resetXslCacheData()</code> instead.
   * @see  jsx3.xml.Cacheable#resetXslCacheData()
   */
  List_prototype.clearXSL = function() {
    this.resetXslCacheData();
    return this;
  };

  /** @private @jsxobf-clobber */
  List._displayedChildFilter = function(objColumn) {
    return objColumn && (objColumn.getDisplay() != jsx3.gui.Block.DISPLAYNONE);
  };

  /** @private @jsxobf-clobber-shared */
  List_prototype.getDisplayedChildren = function() {
    return this.getChildren().filter(List._displayedChildFilter);
  };

  /**
   * validates the list; if the list is set to 'required', a selection must be made to pass validation. Otherwise, a list will always pass validation
   * @return {int} one of: jsx3.gui.Form.STATEINVALID or jsx3.gui.Form.STATEVALID
   */
  List_prototype.doValidate = function() {
    var valid = this.getSelectedNodes().size() > 0 || this.getRequired() == jsx3.gui.Form.OPTIONAL;
    this.setValidationState(valid ? jsx3.gui.Form.STATEVALID : jsx3.gui.Form.STATEINVALID);
    return this.getValidationState();
  };

  /**
   * Returns whether columns in this list can be resized. The default value is <code>jsx3.Boolean.TRUE</code>.
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.TRUE</code>
   */
  List_prototype.getResizable = function() {
    return (this.jsxresize == null) ? jsx3.Boolean.TRUE : this.jsxresize;
  };

  /**
   * Sets whether columns in this list can be resized.
   * @param BOOLEAN {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.TRUE</code>
   * @return {jsx3.gui.List} this object
   */
  List_prototype.setResizable = function(BOOLEAN) {
    this.jsxresize = BOOLEAN;
    return this;
  };

  /**
   * called programmatically when user mouses down on the resize anchor for a column; preps the positioning and display for the resize bar
   * @param objGUI {HTMLElement} on-screen object reference to a resize anchor (an IMG tag that is the first child of a cell (TD) in the header row (TR)
   * @private
   * @jsxobf-clobber-shared
   */
  List_prototype.doResizeBegin = function(objEvent, objGUI) {
    if (! objEvent.leftButton()) return;

    //handle mousedown
    Event.publish(objEvent);

    //fire the event code
    if (this.getCanResize() != 0) {
      var objAnchor = objGUI;
      var objBar = this.getRendered().childNodes[1];

      //account for instances when the header is scrolled left to reflect the h-scroll bar
      var trueoffset = parseInt(objAnchor.parentNode.parentNode.parentNode.parentNode.parentNode.style.left);
      var trueleft = objAnchor.parentNode.parentNode.offsetLeft + trueoffset;
      objBar.style.left = trueleft + "px";
      this._jsxcurleft = trueleft;

      this._jsxcurindex = objAnchor.parentNode.parentNode.cellIndex;
      var intINDEX = this._jsxcurindex - 1;

      var bCancel = this.doEvent(Interactive.BEFORE_RESIZE,
          {objEVENT:objEvent, intINDEX:intINDEX /* DEPRECATED: */, intCOLUMNINDEX:intINDEX}) === false;

      //is the object painted and beforemove script didn't cancel
      if (!bCancel) {
        //position the col-reisize mask that will move around the screen to denote that we're resizing a column and call 'prepareDrag()' to configure the drag controller with the appropriate settings
        objBar.style.visibility = "visible";

        //subscribe to window-level mouseup, so we know when the drag is over
        jsx3.gui.Event.subscribe(jsx3.gui.Event.MOUSEUP,this,"doResizeEnd");

        //start moving
        jsx3.gui.Interactive._beginMove(objEvent, objBar, false, true);
      } else {
        //just hide the bar
        objBar.style.left = "-10px";
      }
    }

    objEvent.cancelReturn();
    objEvent.cancelBubble();
  };

  /**
   * called programmatically when user mouses up on a resize anchor (when the resize event is complete)
   * @param objGUIBar {HTMLElement} on-screen object reference to a vertical resize bar (a SPAN)
   * @private
   * @jsxobf-clobber-shared
   */
  List_prototype.doResizeEnd = function(objEvent, objGUIBar) {
    var objEvent = objEvent.event;
    jsx3.gui.Event.unsubscribe(jsx3.gui.Event.MOUSEUP,this,"doResizeEnd");
    if(objGUIBar == null) objGUIBar = this.getRendered().childNodes[1];

    objEvent.releaseCapture(objGUIBar);
    var intLeft = parseInt(objGUIBar.style.left);
    var intDIFF = intLeft - this._jsxcurleft;
    var intINDEX = this._jsxcurindex - 1;
    var children = this.getDisplayedChildren();

    var doc = this.getDocument();
    //               .SPAN
    var headGUI = doc.getElementById(this.getId() + "_jsxhead");
    //                       .TABLE        .TBODY        .TR           .TD
    var objCellBody = headGUI.childNodes[0].childNodes[0].childNodes[0].childNodes[intINDEX];
    var intOLDWIDTH = objCellBody.offsetWidth;

    //reset the width for this column to either a pixel or percent depending upon the existing value
    var vntWidth = children[intINDEX].getWidth() + "";
    var bPct;
    if (bPct = (vntWidth.indexOf("%") > -1)) {
      var intTotalWidth = this.getAbsolutePosition().W;
      var vntWIDTH = intOLDWIDTH + intDIFF;
      vntWIDTH = parseInt((vntWIDTH / intTotalWidth) * 1000) / 10;
      if (vntWIDTH < 2) vntWIDTH = 2;
      vntWIDTH += "%";
    } else {
      var vntWIDTH = intOLDWIDTH + intDIFF;
      if (vntWIDTH < 4) vntWIDTH = 4;
    }

    // just hide the bar
    objGUIBar.style.left = "-10px";

    // fire the 'afterresize' event code
    var objContext = {objEVENT:objEvent, intDIFF:intDIFF, intINDEX:intINDEX /* DEPRECATED: */, intOLDWIDTH:intOLDWIDTH,
        vntWIDTH:vntWIDTH, intCOLUMNINDEX:intINDEX};
    var bCancel = this.doEvent(Interactive.AFTER_RESIZE, objContext);

    //if bound 'afterresize' event returned false, cancel the resize
    if (!(bCancel === false)) {
      //determine if user wants to update the width
      var resultWidth = (bCancel instanceof Object && bCancel.vntWIDTH) ? bCancel.vntWIDTH : vntWIDTH;

      //reset the width for the child cell (add logic to deal with percentage based sizing)
      children[intINDEX].setWidth(resultWidth);

      //clear the XSLT, so it is regenerated next time a paint is called
      this.resetXslCacheData();

      //update the VIEW for the data rows
      this.repaintBody();
      this.repaintHead();
    }
  };

  /**
   * called when user mouses down on a header cell for a jsx3.gui.List instance
   * @param objGUI {HTMLElement} on-screen object reference to the header cell (TD) that was moused-down on
   * @private
   * @jsxobf-clobber-shared
   */
  List_prototype.doReorderBegin = function(objEvent, objGUI) {
    //only proceed if not a right button (since the column may have a context menu to display)
    if (!objEvent.leftButton()) return;

    //handle mousedown event (todo: handle the mouseup at the document level to deal with the setCapture issue
    Event.publish(objEvent);

    //configure the ghost cell to drag during a reorder event
    var objGhost = this.getDocument().getElementById(this.getId() + "_jsxghost");
    objGhost.innerHTML  = "";

    //create a box profile for the ghost cell to determine its browser-appropriate dimensions
    var trueoffset = parseInt(objGUI.parentNode.parentNode.parentNode.style.left);
    var oI = {};
    oI.boxtype = "box";
    oI.tagname = "div";
    oI.left = objGUI.offsetLeft + trueoffset;
    oI.top = 0;
    oI.parentheight = objGUI.offsetHeight;
    oI.parentwidth = parseInt(objGUI.offsetWidth);
    oI.width = "100%";
    oI.height = "100%";
    oI.border = "solid 1px #ffffff;solid 1px #9898a5;solid 1px #9898a5;solid 1px #ffffff";
    oI.padding = parseInt(objGUI.childNodes[0].offsetTop) + " " + ((objGUI.style.paddingRight) ? parseInt(objGUI.style.paddingRight) : 0) + " " + ((objGUI.style.paddingBottom) ? parseInt(objGUI.style.paddingBottom) : 0) + " " + ((objGUI.style.paddingLeft) ? parseInt(objGUI.style.paddingLeft) : 0);
    var oE = new jsx3.gui.Painted.Box(oI);

    //apply dimension styles
    objGhost.style.left = oE.getPaintedLeft() + "px";
    objGhost.style.top = oE.getPaintedTop() + "px";
    objGhost.style.width = oE.getPaintedWidth() + "px";
    objGhost.style.height = oE.getPaintedHeight() + "px";

    //apply simple/common styles
    objGhost.style.fontName = objGUI.style.fontName;
    objGhost.style.fontSize = objGUI.style.fontSize;
    objGhost.style.textAlign = objGUI.style.textAlign;
    objGhost.style.fontWeight = objGUI.style.fontWeight;
    objGhost.style.visibility = "visible";

    //apply padding style
    jsx3.gui.Painted.convertStyleToStyles(objGhost,oE.paintPadding(),"padding");

    //append the clone
    objGhost.innerHTML = html.getOuterHTML(objGUI.childNodes[0]);

    //state trackers, so we know which cell the user is planning on moving around
    this._jsxcurleft = objGUI.offsetLeft + trueoffset;
    this._jsxcurindex = objGUI.cellIndex;

    //subscribe to window-level mouseup, so we know when the drag is over
    jsx3.gui.Event.subscribe(jsx3.gui.Event.MOUSEUP,this,"doReorderEnd");

    //call class method to process a move
    jsx3.gui.Interactive._beginMove(objEvent, objGhost, false, true);
  };

  /** @private @jsxobf-clobber-shared */
  List_prototype.doCheckSort = function(objEvent, objGUI) {
    var colIndex = (objEvent.getType() == jsx3.gui.Event.CLICK) ? objGUI.cellIndex : this._jsxcurindex;
    var objColumn = this.getDisplayedChildren()[colIndex];
    var realIndex = this.getChildren().indexOf(objColumn);

    if (this.getCanSort() != 0 && objColumn != null && objColumn.getCanSort() != 0) {
      var objContext = {objEVENT:objEvent, intCOLUMNINDEX:realIndex};
      var vntReturn = this.doEvent(Interactive.BEFORE_SORT, objContext);

      if (vntReturn !== false) {
        var intSortColumn = vntReturn instanceof Object && vntReturn.intCOLUMNINDEX != null ?
            vntReturn.intCOLUMNINDEX : realIndex;
        this._setSortColumn(objEvent, intSortColumn);
      }
    }
  };

  /**
   * called when user mouses up on the ghost cell in the header row
   * @private
   * @jsxobf-clobber-shared
   */
  List_prototype.doReorderEnd = function(objEvent, objGUI) {
    //resolve the event dispatcher event to a jsx3 event (which in turn wraps the native browser event)
    var objEvent = objEvent.event;
    jsx3.gui.Event.unsubscribe(jsx3.gui.Event.MOUSEUP,this,"doReorderEnd");

    //relese capture and set the ghost cell to hidden
    var objGhost = this.getDocument().getElementById(this.getId() + "_jsxghost");
    if(objGUI == null) var objGUI = objGhost;
    objEvent.releaseCapture(objGhost);
    objGhost.style.visibility = "hidden";

    //determine if the ghost cell was dragged; if it wasn't, this is a click event
    if (this._jsxcurleft == parseInt(objGhost.style.left)) {
      this.doCheckSort(objEvent, objGUI);
    } else if (this.getCanReorder() != 0) {
      //rearrange the columns according to where the ghost cell was dropped
      var intDropLeft = parseInt(objGhost.style.left);

      var vChildren = this.getDisplayedChildren();
      var maxLen = this.getChildren().length;
      var objTR = vChildren[0].getRendered().parentNode;
      var trueIndex = this.getChildren().indexOf(vChildren[this._jsxcurindex]);

      var n = 0;
      for (var i = 0; i < maxLen; i++) {
        if (List._displayedChildFilter(this.getChild(i))) {
          var intLeft = objTR.childNodes[n].offsetLeft;
          if (intDropLeft < intLeft) {
            //call insert before to shuffle the columns; this always causes a hard refresh
            if (trueIndex != i)
              this.doRestack(trueIndex, i-1);
            jsx3.EventHelp.reset();
            return;
          }
          n++;
        }
      }
      if (trueIndex != maxLen-1)
        this.doRestack(trueIndex, maxLen-1);
    }
  };

  /**
   * Sets the zero-based index of column to sort on and executes the sort. This method fires the
   * <code>AFTER_SORT</code> only under the deprecated 3.0 model event protocol.
   * @param intColumnIndex {int} zero-based index of child column
   * @return {jsx3.gui.List} this object
   */
  List_prototype.setSortColumn = function(intColumnIndex) {
    // DEPRECATED: old model event protocol
    this._setSortColumn(this.isOldEventProtocol(), intColumnIndex);
  };

  /** @private @jsxobf-clobber */
  List_prototype._setSortColumn = function(objEvent, intColumnIndex) {
    this.jsxsortcolumn = intColumnIndex;
    this.doSort();

    if (objEvent) {
      this.doEvent(Interactive.AFTER_SORT,
          {objEVENT:(objEvent instanceof jsx3.gui.Event ? objEvent : null), intCOLUMNINDEX:intColumnIndex});
    }

    return this;
  };

  /**
   * Returns the zero-based index of column to sort on.
   * @return {int} zero-based index of child column
   */
  List_prototype.getSortColumn = function() {
    return this.jsxsortcolumn;
  };

  /**
   * Returns the path (e.g. 'jsxid') for the column that the list is sorted on (without the leading @).
   * @return {String} path or empty string
   * @private
   * @jsxobf-clobber-shared
   */
  List_prototype.getSortPathInc = function() {
    var path = this.jsxsortcolumn != null ? ((this.getChild(this.jsxsortcolumn) == null) ? null : this.getChild(this.jsxsortcolumn).getSortPath()) : this.getSortPath();
    return path ? path.substring(1) : "";
  };

  /**
   * called internally; returns the new, adjusted index of the 'sort' column and the 'index' column when columns are re-ordered
   * @param intMoveIndex {int} existing column index of column being moved (index before the move)
   * @param intPrecedeIndex {int} column index (zero-based) of column that will immediately precede where the column is being moved to
   * @private
   * @jsxobf-clobber-shared
   */
  List_prototype.doRestack = function(intMoveIndex,intPrecedeIndex) {
    //get handle array of child objects, this will modify children in place
    var objChildren = this.getChildren();
    var maxLen = objChildren.length;

    //get handle to child object that matches the column just moved
    var objMove = this.getChild(intMoveIndex);

    //restack the child array
    if (intPrecedeIndex < intMoveIndex) {
      for (var i=intMoveIndex;i>intPrecedeIndex;i--) {
        if (i>0) objChildren[i] = objChildren[i-1];
      }
      objChildren[intPrecedeIndex + 1] = objMove;
    } else {
      for (var i=intMoveIndex;i<=intPrecedeIndex;i++) {
        if (i <= maxLen - 2) objChildren[i] = objChildren[i+1];
      }
      objChildren[intPrecedeIndex] = objMove;
    }

    //clear the cached XSL, as its output order is now wrong and needs to be regenerated
    this.resetXslCacheData();

    //force repaint of entire control
    this.repaint();

    //reset the dom
    this.getServer().getDOM().onChange(jsx3.app.DOM.TYPEADD,this.getId(),this.getChild(0).getId());
  };

  /**
   * Sorts this list according to the current sort path. If no sort direction is specified, the value will be toggled.
   * @param intSortDir {String} <code>SORTASCENDING</code> or <code>SORTDESCENDING</code>.
   * @see #SORTASCENDING
   * @see #SORTDESCENDING
   */
  List_prototype.doSort = function(intSortDir) {
    //update the sort direction
    if (intSortDir != null) {
      this.setSortDirection(intSortDir);
    } else {
      //toggle sort direction when the sorted column is re-clicked
      this.setSortDirection((this.getSortDirection() == List.SORTASCENDING) ? List.SORTDESCENDING : List.SORTASCENDING);
    }

    //update the VIEW for the data rows
    this.repaintBody();
    this.repaintHead();
  };

  /**
   * Returns the selection path for XSLT to use when sorting output.  Typically this is simply the name of the attribute preceded by '@' (i.e., @jsxtext, @social, @phone, etc); if no value exists (e.g., null), an empty string is returned
   * @return {String} selection path (xpath / xsl query)
   */
  List_prototype.getSortPath = function() {
    return (this.jsxsortpath == null) ? "" : this.jsxsortpath;
  };

  /**
   * Sets the index for the column that the data will be sorted on;
   *            returns a ref to self;
   * @param strPath {String} selection path (xpath / xsl query)
   * @return {jsx3.gui.List} this object
   */
  List_prototype.setSortPath = function(strPath) {
    this.jsxsortpath  = strPath;
    return this;
  };

  /**
   * Returns the direction (jsx3.gui.List.SORTASCENDING or jsx3.gui.List.SORTDESCENDING) for the sorted column; if no direction specified, ascending is returned
   * @return {String} one of: jsx3.gui.List.SORTASCENDING or jsx3.gui.List.SORTDESCENDING
   */
  List_prototype.getSortDirection = function() {
    return (this.jsxsortdirection == null) ? List.SORTASCENDING : this.jsxsortdirection;
  };

  /**
   * Sets the direction (ascending or descending) for the sorted column.
   * @param intSortDir {String} one of: jsx3.gui.List.SORTASCENDING or jsx3.gui.List.SORTDESCENDING
   * @return {jsx3.gui.List} this object
   */
  List_prototype.setSortDirection = function(intSortDir) {
    this.jsxsortdirection  = intSortDir;
    return this;
  };

  /**
   * Returns the selection type of this list.
   * @return {int}  <code>MULTI</code>, <code>SINGLE</code>, or <code>NOTSELECTABLE</code>.
   */
  List_prototype.getMultiSelect = function() {
    return (this.jsxmultiselect == null) ? List.MULTI : this.jsxmultiselect;
  };

  /**
   * Sets the selection type of this list.
   * @param intMulti {int} <code>MULTI</code>, <code>SINGLE</code>, or <code>NOTSELECTABLE</code>.
   * @return {jsx3.gui.List} this object
   */
  List_prototype.setMultiSelect = function(intMulti) {
   this.jsxmultiselect = intMulti;

   if (intMulti == List.NOTSELECTABLE)
     this.deselectAllRecords();

   return this;
  };

  /**
   * Returns whether the columns in the list can be re-ordered via user interaction. The default value is
   * <code>jsx3.Boolean.TRUE</code>.
   * @return {int} one of: jsx3.Boolean.TRUE or jsx3.Boolean.FALSE
   */
  List_prototype.getCanReorder = function() {
    return (this.jsxreorder == null) ? 1 : this.jsxreorder;
  };

  /**
   * Sets whether the columns in the list can be re-ordered via user interaction with the VIEW
   * @param intReorder {int} one of: jsx3.Boolean.TRUE or jsx3.Boolean.FALSE
   * @return {jsx3.gui.List} this object
   */
  List_prototype.setCanReorder = function(intReorder) {
   this.jsxreorder = intReorder;
   return this;
  };

  /**
   * Returns whether the list will render with sortable columns.
   * @return {int} one of: jsx3.Boolean.TRUE or jsx3.Boolean.FALSE
   */
  List_prototype.getCanSort = function() {
    return (this.jsxsort == null) ? 1 : this.jsxsort;
  };

  /**
   * Sets whether the list will render with sortable columns.
   * @param SORT {int} one of: jsx3.Boolean.TRUE or jsx3.Boolean.FALSE
   * @return {jsx3.gui.List} this object
   */
  List_prototype.setCanSort = function(SORT) {
   this.jsxsort = SORT;
   return this;
  };

  /**
   * Returns the CSS color for the header row (for example, "#ffffff"). If this value is not set (<code>null</code>)
   * the list will render with the default value of <code>jsx3.gui.List.DEFAULTBACKGROUNDCOLORHEAD</code>.
   * @return {String} CSS color
   */
  List_prototype.getBackgroundColorHead = function() {
    return this.jsxbgcolorhead;
  };

  /**
   * Sets the CSS color for the header row (for example, #ffffff)
   * @param strBGColor {String} CSS color property
   * @return {jsx3.gui.List} this object
   */
  List_prototype.setBackgroundColorHead = function(strBGColor) {
    this.jsxbgcolorhead = strBGColor;
    return this;
  };

  /**
   * Returns the CSS background property for the header row (for example, "background-image:url(abc.gif)").
   * If this value is not set (<code>null</code>) the list will render with the default value of
   * <code>jsx3.gui.List.DEFAULTBACKGROUNDHEAD</code>.
   * @return {String} CSS background property
   */
  List_prototype.getBackgroundHead = function() {
    return this.jsxbghead;
  };

  /**
   * Sets the CSS background property (can be a composite of varoius CSS-related bg properties)
   * @param strBG {String} CSS background property
   * @return {jsx3.gui.List} this object
   */
  List_prototype.setBackgroundHead = function(strBG) {
    this.jsxbghead = strBG;
    return this;
  };

  /**
   * Returns the height of the header row in pixels. If this value is not set (<code>null</code>) the list will render with
   * the default value of <code>jsx3.gui.List.DEFAULTHEADERHEIGHT</code>.
   * @return {int}
   */
  List_prototype.getHeaderHeight = function() {
    return this.jsxheaderheight;
  };

  /**
   * Sets the height of the header row in pixels. Set to zero (0) to hide the header row and only render the body
   * rows for the list.
   * @param intHeight {int}
   * @return {jsx3.gui.List} this object
   */
  List_prototype.setHeaderHeight = function(intHeight) {
    this.jsxheaderheight =  intHeight;
    return this;
  };

  /**
   * generic callback that creates the drag item when dragging a record from the list
   * @param objGUI {HTMLElement} on-screen, HTML object that was just 'moused down' on by the user
   * @param strJSXName {String} JSX 'name' property (i.e., 'this.getName()') for the JSX object whose on-screen instance contains the HTML element about to be dragged
   * @param strDragType {String} the type of element being dragged. For example, a given JSXTable
   *             may contain any number of 'dragabble' elements. Each of these may have a type
   *             as well as an id to uniquely distinguish it from other elements in the given JSX item
   * @param strDragItemId {String} the id for the html element about to be dragged. If this parameter
   *              isn't blank/null/empty, it reflects the unique node id for the element
   *              as defined by the source xml
   * @return {String} HTML content that goes in the draggable icon that follows the mouse
   * @private
   * @jsxobf-clobber
   */
  List.getDragIcon = function(objGUI,strJSXName,strDragType,strDragItemId) {
    return "<span id='JSX' style='font-family:Verdana;font-size:10px;padding:0px;height:22px;width:200px;overflow:hidden;text-overflow:ellipsis;filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=1, StartColorStr=#eedfdfe8, EndColorStr=#00ffffff);'><table style='font-family:verdana;font-size:10px;color:#a8a8a8;' cellpadding='3' cellspacing='0'>" +
        html.getOuterHTML(objGUI).replace(/id=/g,"tempid=").replace(/BACKGROUND/g,"bg").replace(/class=/g,"jsxc=") +
        "</table></span>";
  };

  /**
   * called when an on-screen TR (the correspondeing VIEW element for a CDF 'record' node) loses focus (either because another TR was chosen or another on-screen control was selected)
   * @private
   * can't do this because of XSL template: jsxobf-clobber
   */
  List.doBlurItem = function(objTR) {
    var jsxid = objTR.getAttribute("JSXDragId");
    var id = objTR.id.substring(0, objTR.id.length - (jsxid.length + 1));
    var objList = jsx3.GO(id);

    //set text to normal and dereference
    objTR.style.fontWeight = "normal";
    if (objList != null)
      objList._jsxcurfocus = null;
  };

  /**
   * called when an on-screen TR (the correspondeing VIEW element for a CDF 'record' node) gains focus
   * @private
   * can't do this because of XSL template: jsxobf-clobber
   */
  List.doFocusItem = function(objTR) {
    var jsxid = objTR.getAttribute("JSXDragId");
    var id = objTR.id.substring(0, objTR.id.length - (jsxid.length + 1));
    var objList = jsx3.GO(id);

    if (objList == null) {
      LOG.warn("No list with id " + id + ".");
      return;
    }

    if (! objList.isRecordSelectable(jsxid))
      return;

    //give DOM focus (VIEW); set font to bold and persist a ref (this will also become the anchor cell when selecting ranges
    html.focus(objTR);
    objTR.style.fontWeight = "bold";
    objList._jsxcurfocus = objTR;
  };

  /**
   * handler for potential drag operation
   * @private
   */
  List_prototype._ebMouseDown = function(objEvent, objGUI) {
    if (this.getCanDrag() == 1 && objEvent.leftButton()) {
      var objTR = objEvent.srcElement();
      var rowCol = this.getRowAndColIds(objTR);
      //drag is turned on: get handle to source element

      //if the TR has a dragid property, assume its draggable, so prep the drag controller
      if (rowCol[0] != null) {
        if (! this.isRecordSelectable(rowCol[0]))
          return;

        //prep the drag controller; if we move, we'll start dragging (use '2', so no jerk)
        Event.publish(objEvent);
        this.doDrag(objEvent, rowCol[2], List.getDragIcon, {strRECORDID:rowCol[0], intCOLUMNINDEX:rowCol[1]});
      }
    }
  };

  /**
   * handler for potential drop operation or context-menu right click
   * @param objGUI {HTMLElement} ref to span container for the body table
   * @private
   */
  List_prototype._ebMouseUp = function(objEvent, objGUI) {
    var rowCol = this.getRowAndColIds(objEvent.srcElement());

    if (this.getCanDrop() == 1 && jsx3.EventHelp.isDragging() && jsx3.EventHelp.JSXID != this) {
      if (jsx3.EventHelp.DRAGTYPE == "JSX_GENERIC") {
        //constants that can be referenced by any bound
        var strJSXID = jsx3.EventHelp.JSXID.getId();
        var strDRAGID = jsx3.EventHelp.DRAGID;

        // allow source of CDF record to veto the adoption
        var objSource = jsx3.GO(strJSXID);
        if (objSource == null) return;

        var bCtrl = jsx3.gui.isMouseEventModKey(objEvent);
        var bAllowAdopt = objSource.doEvent(Interactive.ADOPT,
              {objEVENT:objEvent, strRECORDID:strDRAGID, strRECORDIDS:[strDRAGID], objTARGET:this, bCONTROL:bCtrl});

        var context = {objEVENT:objEvent, objSOURCE:objSource, strDRAGID:strDRAGID, strDRAGTYPE:jsx3.EventHelp.DRAGTYPE,
            strRECORDID:rowCol[0], intCOLUMNINDEX:rowCol[1], bALLOWADOPT:(bAllowAdopt !== false)};
        var bContinue = this.doEvent(bCtrl ? Interactive.CTRL_DROP : Interactive.DROP, context);

        if (bAllowAdopt !== false && bContinue !== false && objSource.instanceOf(jsx3.xml.CDF))
          this.adoptRecord(objSource, strDRAGID);
      }
    } else if (objEvent.rightButton()) {
      //user right-moused-up over a node in the tree; show the context menu if there is one...
      var strMenu;
      if ((strMenu = this.getMenu()) != null) {
        var objMENU = this._getNodeRefField(strMenu);
        if (objMENU != null) {
          var objContext = {objEVENT:objEvent, objMENU:objMENU, strRECORDID:rowCol[0], intCOLUMNINDEX:rowCol[1]};
          var vntResult = this.doEvent(Interactive.MENU, objContext);
          if (vntResult !== false) {
            if (vntResult instanceof Object && vntResult.objMENU instanceof jsx3.gui.Menu)
              objMENU = vntResult.objMENU;
            objMENU.showContextMenu(objEvent, this, rowCol[0]);
          }
        }
      }
    }
  };

  /** @private @jsxobf-clobber */
  List_prototype.getRowAndColIds = function(objGUI) {
    var row = null;
    var col = null;
    var tr = null;

    while (objGUI != null && row == null) {
      if (objGUI.tagName && objGUI.tagName.toLowerCase() == "td")
        col = objGUI.getAttribute("cellIndex");
      else if (objGUI.tagName && objGUI.tagName.toLowerCase() == "tr") {
        row = objGUI.getAttribute("JSXDragId");
        tr = objGUI;
      }
      objGUI = objGUI.parentNode;
    }

    return [row, row ? col : null, tr];
  };

  /**
   * selects a range of contiguous rows (TR) in a List; will only be called by VIEW
   * @param objRow1 {HTMLElement} on-screen element (TR) that represents the active end of a selection range
   * @param objRow2 {HTMLElement} on-screen element (TR) that represents the passive end of a selection range
   * @private
   * @jsxobf-clobber
   */
  List_prototype.doSelectRange = function(objEvent, objRow1, objRow2) {
    if (! this.isRecordSelectable(objRow1.getAttribute("JSXDragId")))
      return;
    if (! this.isRecordSelectable(objRow2.getAttribute("JSXDragId")))
      return;
    if (this.getMultiSelect() == List.NOTSELECTABLE)
      return;

    //loop to select all items in the shift selection range
    var intSelect = 0;
    var objParent = this.getDocument().getElementById(this.getId() + "_jsxbody").childNodes[0].childNodes[0];

    var ids = [], tds = [];

    for (var i = objParent.childNodes.length - 1; i >= 0; i--) {
      if (objParent.childNodes[i] == objRow2) intSelect++;
      if (objParent.childNodes[i] == objRow1) intSelect++;
      if (intSelect >= 1 && intSelect <= 2) {
        // get handle to the current TR for this iteration
        var objTR = objParent.childNodes[i];
        ids.push(objTR.getAttribute("JSXDragId"), objTR);
      }
      if (intSelect == 2) break;
    }

    //clear any selections for the list
    this._doSelects(objEvent, ids, tds, false);

    List.doFocusItem(objRow1);
  };

  /**
   * called by keydown event; performs appropriate: 'select', 'execute', or 'tab-out' option
   * @private
   */
  List_prototype._ebKeyDown = function(objEvent, objGUI) {
    // check for hot keys
    if (this.jsxsupermix(objEvent, objGUI)) return;

    //if no current context, escape
    if (this._jsxcurfocus == null) return;

    //get base id length for the List instance - we'll use this to parse out the ID of TR receiving the keydown events and get is corresponding record in the MODEL
    var intIdLength = this.getId().length;

    //persist the ref (we're about to cancel)
    var intKeyCode = objEvent.keyCode();

    var bMulti = this.getMultiSelect() == 1;
    var bCaptured = false;
    var bCtrl = jsx3.gui.isMouseEventModKey(objEvent);

    //branch depending upon up/down arrow, return, space, and tab key events
    if (intKeyCode == Event.KEY_ARROW_UP) {
      //don't listen to uparrow events if we don't have a previous sibling
      if (this._jsxcurfocus == this._jsxcurfocus.parentNode.firstChild) return;

      if (bMulti && bCtrl) {
        //user is navigating via ctrl key and arrows; don't select, just update the UI to reflect that the TR has focus (bold underline for now)
        List.doFocusItem(this._jsxcurfocus.previousSibling);
      } else if (bMulti && objEvent.shiftKey()) {
        //select an inclusive range between the row PRIOR to the active row and the passive row
        this.doSelectRange(objEvent, this._jsxcurfocus.previousSibling, this._jsxcur);
      } else {
        //single select: update MODEL and VIEW
        var objTR = this._jsxcurfocus.previousSibling;
        this._doSelect(objEvent, objTR.getAttribute("JSXDragId"), objTR, false);
      }
      bCaptured = true;
    } else if (intKeyCode == Event.KEY_ARROW_DOWN) {
      //don't listen to downarrow events if we don't have a next sibling
      if (this._jsxcurfocus == this._jsxcurfocus.parentNode.lastChild) return;

      if (bMulti && bCtrl) {
        //user is navigating via ctrl key and arrows; don't select, just update the UI to reflect that the TR has focus (bold underline for now)
        List.doFocusItem(this._jsxcurfocus.nextSibling);
      } else if (bMulti && objEvent.shiftKey()) {
        //select an inclusive range between the row FOLLOWING the active row and the passive row
        this.doSelectRange(objEvent, this._jsxcurfocus.nextSibling, this._jsxcur);
      } else {
        //single select: update MODEL and VIEW
        var objTR = this._jsxcurfocus.nextSibling;
        this._doSelect(objEvent, objTR.getAttribute("JSXDragId"), objTR, false);
      }
      bCaptured = true;
    } else if (intKeyCode == Event.KEY_ENTER) {
      //fire the execute event (the same as dblclicking)
      this._doExecute(objEvent);
      bCaptured = true;
    } else if (intKeyCode == Event.KEY_SPACE) {
      //fire the selection event for the item with focus
      if (bMulti && bCtrl) {
        //toggle the selection state for this item
        var strID = this._jsxcurfocus.getAttribute("JSXDragId");
        if (this.isSelected(strID)) {
          //toggle selection to off; user chose to deselect
          this._doDeselect(objEvent, strID, this._jsxcurfocus);
        } else {
          // add the additional item to the existing selection
          this._doSelect(objEvent, strID, this._jsxcurfocus, true);
        }
      } else if (bMulti && objEvent.shiftKey()) {
        //select an inclusive range between the row that just received the space key event and the passive row
        this.doSelectRange(objEvent, objEvent.srcElement(), this._jsxcur);
      } else {
        //single select: update MODEL and VIEW
        var objTR = this._jsxcurfocus;
        this._doSelect(objEvent, objTR.getAttribute("JSXDragId"), objTR, false);
      }
      bCaptured = true;
    } else if (intKeyCode == Event.KEY_TAB && objEvent.shiftKey()) {
        //go to previous control (escape the LV)
        this.focus();
        bCaptured = true;
    } else if (intKeyCode == Event.KEY_TAB) {
        //go to next control (escape the LV)
        html.focus(this.getRendered().lastChild);
        bCaptured = true;
    }

    if (bCaptured)
      objEvent.cancelAll();
  };

  /**
   * called by click event on a given row
   * @param objGUI {HTMLElement} ref to span container for the body table
   * @private
   */
  List_prototype._ebClick = function(objEvent, objGUI) {
    //cancel bubbling and return
    var bCaptured = false;

    //get handle to item that was clicked (exit early if the user clicked a range of rows (the TBODY))
    var objTR = objEvent.srcElement();
    if ((objTR.tagName && objTR.tagName.toLowerCase() == "tbody") || objTR == objGUI) {
      this._doDeselects(objEvent, this.getSelectedIds(), []);
      return;
    }

    var rootGUI = this.getRendered();
    while (jsx3.util.strEmpty(objTR.getAttribute("JSXDragId"))  && objTR != rootGUI)
      objTR = objTR.parentNode;

    if (! objTR || ! objTR.getAttribute("JSXDragId")) {
      this._doDeselects(objEvent, this.getSelectedIds(), []);
      return;
    }

    //get flag to see if this list supports multi-select (the default)
    var bMulti = (this.getMultiSelect() == List.MULTI);
    var bCtrl = jsx3.gui.isMouseEventModKey(objEvent);

    //process the click depending upon shift/ctrl keys
    if (bMulti && objEvent.shiftKey() && this._jsxcur != null) {
      //user performed a shift-click; select a range
      this.doSelectRange(objEvent, objTR, this._jsxcur);
      bCaptured = true;
    } else if (bMulti && bCtrl) {
      //toggle the selection state for this item
      var strID = objTR.getAttribute("JSXDragId");
      if (this.isSelected(strID)) {
        //toggle selection to off; user chose to deselect
        this._doDeselect(objEvent, strID, objTR);
      } else {
        //add the additional item to the existing selection
        this._doSelect(objEvent, strID, objTR, true);
        List.doFocusItem(objTR);
      }
      bCaptured = true;
    } else {
      //regular click; update MODEL and VIEW
      if (this.isSelected(objTR.getAttribute("JSXDragId"))) {
        if (bCtrl || objEvent.shiftKey()) {
          this._doDeselect(objEvent, objTR.getAttribute("JSXDragId"), objTR);
        }
      } else {
        this._doSelect(objEvent, objTR.getAttribute("JSXDragId"), objTR, false);
      }
      bCaptured = true;
    }

    if (bCaptured) {
      objEvent.cancelBubble();
      objEvent.cancelReturn();
    }
  };

  List_prototype._ebDoubleClick = function(objEvent, objGUI) {
    this._doExecute(objEvent);
  };

  /**
   * Evaluates the JavaScript code in the <code>jsxexecute</code> attribute of one CDF record of this list.
   * @param strRecordId {String} the jsxid of the CDF record to execute.
   */
  List_prototype.executeRecord = function(strRecordId) {
    var objNode = this.getRecordNode(strRecordId);
    if (objNode != null)
      this.eval(objNode.getAttribute("jsxexecute"), {strRECORDID:strRecordId});
  };

  /**
   * Executes any bound code for a record of this list specified by the <code>strRecordId</code> parameter. If this
   * parameter is omitted the code of any currently selected records is executed. Invokes the <code>EXECUTE</code>
   * model event only under the deprecated 3.0 model event protocol.
   *
   * @param strRecordId {String} 'jsxid' value for the record node (according to the CDF) to execute
   * @deprecated  use <code>executeRecord()</code> instead.
   * @see #executeRecord()
   */
  List_prototype.doExecute = function(strRecordId) {
    this._doExecute(this.isOldEventProtocol(), strRecordId != null ? [strRecordId] : null);
  };

  /** @private @jsxobf-clobber-shared */
  List_prototype._doExecute = function(objEvent, strRecordIds) {
    if (strRecordIds == null)
      strRecordIds = this.getSelectedIds();

    for (var i = 0; i < strRecordIds.length; i++) {
      var id = strRecordIds[i];

      var objNode = this.getRecordNode(id);

      if (objNode.getAttribute(CDF.ATTR_UNSELECTABLE) == "1")
        continue;

      this.eval(objNode.getAttribute("jsxexecute"), {strRECORDID:id});
    }

    if (strRecordIds.length > 0 && objEvent)
      this.doEvent(Interactive.EXECUTE, {objEVENT:(objEvent instanceof Event ? objEvent : null),
          strRECORDID:strRecordIds[0], strRECORDIDS:strRecordIds});
  };

  /**
   * Returns whether or not the given record is selected (true/false)
   * @param strRecordId {String} jsxid property for the record to check selection state for
   * @return {boolean}
   */
  List_prototype.isSelected = function(strRecordId) {
    return (this.getXML().selectSingleNode("//record[@jsxid='" + strRecordId + "' and @" + CDF.ATTR_SELECTED + "='1']") != null);
  };

  /**
   * Selects a given record for the list. Invokes the <code>SELECT</code> and <code>CHANGE</code> model events only
   * under the deprecated 3.0 model event protocol.
   *
   * @param strRecordId {String} 'jsxid' value for the record node (according to the CDF) to select in the DATA MODEL
   * @param bVIEW {boolean} true if null; if true, the selection state in the VIEW will be updated to reflect the selection within the MODEL
   * @param bNoEvent {boolean} if true, then don't invoke a selection event
   * @return {jsx3.gui.List} this object
   * @deprecated  use <code>setValue()</code> or <code>selectRecord()</code> instead.
   * @see  #setValue()
   * @see  #selectRecord()
   */
  List_prototype.doSelect = function(strRecordId, bVIEW, bNoEvent, bReveal) {
    this._doSelect(!bNoEvent && this.isOldEventProtocol(), strRecordId, null, true);

    if (strRecordId && bReveal)
      this.revealRecord(strRecordId);

    return this;
  };

  /**
   * Selects a CDF record of this list. The item will be highlighted in the view and the CDF data will be updated
   * accordingly. If this list is a multi-select list then this selection will be added to any previous selection.
   * @param strRecordId {String} the jsxid of the record to select.
   * @return {jsx3.gui.List} this object
   */
  List_prototype.selectRecord = function(strRecordId) {
    if (! this.isRecordSelectable(strRecordId))
      return;
    if (this.getMultiSelect() == List.NOTSELECTABLE)
      return;

    this._doSelect(false, strRecordId, null, true);

    return this;
  };

  /**
   * Deselects a CDF record of this list. The item will be un-highlighted in the view and the CDF data will be updated
   * accordingly.
   * @param strRecordId {String} the jsxid of the record to deselect.
   * @return {jsx3.gui.List} this object
   */
  List_prototype.deselectRecord = function(strRecordId) {
    this._doDeselect(false, strRecordId, null);
    return this;
  };

  /**
   * Deselects all selected CDF records of this list.
   * @return {jsx3.gui.List} this object
   */
  List_prototype.deselectAllRecords = function() {
    this._doDeselects(false, this.getSelectedIds(), []);
    return this;
  };

  /** @private @jsxobf-clobber */
  List_prototype._doSelect = function(objEvent, strRecordId, objTR, bUnion) {
    // check for already selected
    var recordNode = this.getRecordNode(strRecordId);
    if (!recordNode || recordNode.getAttribute(CDF.ATTR_SELECTED) == "1"
         || recordNode.getAttribute(CDF.ATTR_UNSELECTABLE) == "1" || this.getMultiSelect() == List.NOTSELECTABLE)
      return false;

    var bMulti = bUnion && (this.getMultiSelect() == List.MULTI);
    if (! bMulti)
      this.deselectAllRecords();

    //update the record in the MODEL (pass false, since we'll do our own, more-efficient update of the VIEW)
    recordNode.setAttribute(CDF.ATTR_SELECTED, "1");

    // update view
    objTR = objTR || this.getRowForRecord(strRecordId);
    if (objTR != null) {
      if (! bMulti) {
        this._jsxcur = objTR;
        List.doFocusItem(objTR);
      }
      objTR.style.backgroundImage = List.SELECTBGIMAGE;
    }

    //evaluate any bound selection code
    if (objEvent) {
      this.doEvent(Interactive.SELECT, {objEVENT:(objEvent instanceof Event ? objEvent : null),
          strRECORDID:strRecordId, strRECORDIDS:[strRecordId]});
      this.doEvent(Interactive.CHANGE, {objEVENT:(objEvent instanceof Event ? objEvent : null)});
    }

    return true;
  };

  /** @private @jsxobf-clobber */
  List_prototype._doSelects = function(objEvent, strRecordIds, objTRs, bUnion) {
    if (! bUnion)
      this.deselectAllRecords();

    for (var i = 0; i < strRecordIds.length; i++) {
      var success = this._doSelect(false, strRecordIds[i], objTRs[i], true);
      if (! success) {
        strRecordIds.splice(i, 1);
        objTRs.splice(i, 1);
        i--;
      }
    }

    if (objEvent && strRecordIds.length > 0) {
      this.doEvent(Interactive.SELECT, {objEVENT:objEvent, strRECORDID:strRecordIds[0], strRECORDIDS:strRecordIds});
      this.doEvent(Interactive.CHANGE, {objEVENT:objEvent});
    }
  };

  /** @private @jsxobf-clobber */
  List_prototype._doDeselect = function(objEvent, strRecordId, objTR) {
    // check for already selected
    var recordNode = this.getRecordNode(strRecordId);
    if (!recordNode || recordNode.getAttribute(CDF.ATTR_SELECTED) != "1")
      return false;

    //update the record in the MODEL (pass false, since we'll do our own, more-efficient update of the VIEW)
    recordNode.removeAttribute(CDF.ATTR_SELECTED);

    // update view
    objTR = objTR || this.getRowForRecord(strRecordId);
    if (objTR != null) {
      if (this._jsxcur == objTR) {
        delete this._jsxcur;
        List.doBlurItem(objTR);
      }
      objTR.style.backgroundImage = "";
    }

    //evaluate any bound selection code
    if (objEvent) {
      this.doEvent(Interactive.SELECT, {objEVENT:(objEvent instanceof Event ? objEvent : null),
          strRECORDID:null, strRECORDIDS:[]});
      this.doEvent(Interactive.CHANGE, {objEVENT:(objEvent instanceof Event ? objEvent : null)});
    }

    return true;
  };

  /** @private @jsxobf-clobber */
  List_prototype._doDeselects = function(objEvent, strRecordIds, objTRs) {
    for (var i = 0; i < strRecordIds.length; i++) {
      var success = this._doDeselect(false, strRecordIds[i], objTRs[i]);
      if (! success) {
        strRecordIds.splice(i, 1);
        objTRs.splice(i, 1);
        i--;
      }
    }

    if (objEvent && strRecordIds.length > 0) {
      this.doEvent(Interactive.SELECT, {objEVENT:objEvent, strRECORDID:strRecordIds[0], strRECORDIDS:strRecordIds});
      this.doEvent(Interactive.CHANGE, {objEVENT:objEvent});
    }
  };

  /**
   * Gives cursor focus to a row in the list.
   * @param strRecordId {String} the jsxid value for the record node (according to the CDF) to give focus to.
   * @return {jsx3.gui.List} this object
   */
  List_prototype.focusRecord = function(strRecordId) {
    var objTR = this.getRowForRecord(strRecordId);
    if (objTR != null)
      html.focus(objTR);
    return this;
  };

  /**
   * Deselects a given record for the list. Invokes the <code>SELECT</code> and <code>CHANGE</code> model events only
   * under the deprecated 3.0 model event protocol.
   * @param strRecordId {String} 'jsxid' value for the record node (according to the CDF) to select in the DATA MODEL
   * @param bVIEW {boolean} true if null; if true, the selection state in the VIEW will be updated to reflect the selection within the MODEL
   * @return {jsx3.gui.List} this object
   * @deprecated  use <code>setValue()</code> or <code>deselectRecord()</code> instead.
   * @see  #setValue()
   * @see  #deselectRecord()
   */
  List_prototype.doDeselect = function(strRecordId, bVIEW) {
    this._doDeselect(this.isOldEventProtocol(), strRecordId, null);
    return this;
  };

  /**
   * Returns a handle to the active TR for the list.
   * @return {HTMLElement} the JavaScript DOM object or <code>null</code> if no row is active.
   */
  List_prototype.getActiveRow = function() {
    return this._jsxcur;
  };

  /**
   * Reveals a record by scrolling any ancestor blocks as necessary.
   * @param strRecordId {String} the id of the record to reveal
   * @param objJSX {jsx3.gui.Block} if provided, reveal the record up to this visual block; useful if the list is set to overflow:expand and the containing block is set to overflow:scroll
   */
  List_prototype.revealRecord = function(strRecordId, objJSX) {
    var itemGUI = this.getRowForRecord(strRecordId);
    if (itemGUI) {
      var baseGUI = objJSX ? objJSX.getRendered() : this.getRendered();
      if (baseGUI)
        html.scrollIntoView(itemGUI, baseGUI, 0, 10);
    }
  };

  /** @private @jsxobf-clobber */
  List_prototype.getRowForRecord = function(strRecordId) {
    var doc = this.getDocument();
    return doc != null ? doc.getElementById(this.getId() + "_" + strRecordId) : null;
  };

  /**
   * List implementation.
   * @param strRecordId {String} <code>jsxid</code> value for the record node (according to the CDF) to redraw
   * @param intAction {int} <code>jsx3.xml.CDF.INSERT</code>, <code>jsx3.xml.CDF.DELETE</code>,
   *    or <code>jsx3.xml.CDF.UPDATE</code>.
   */
  List_prototype.redrawRecord = function(strRecordId, intAction) {
    if (intAction == jsx3.xml.CDF.INSERT) {
      this.appendRow(this.getRecord(strRecordId), strRecordId);
    } else if (strRecordId != null && intAction == jsx3.xml.CDF.DELETE) {
      var objGUI;
      if ((objGUI = this.getRowForRecord(strRecordId)) != null) {
        html.removeNode(objGUI);
      }
    } else if (strRecordId != null && intAction == jsx3.xml.CDF.UPDATE) {
      this.updateRow(strRecordId);
    }
  };

  /**
   * Returns the collection of selected records.
   * @return {jsx3.util.List<jsx3.xml.Entity>}
   */
  List_prototype.getSelectedNodes = function() {
    //return collection of selected nodes
    return this.getXML().selectNodes("//record[@" + CDF.ATTR_SELECTED + "='1']");
  };

  /**
   * Returns the ids of the selected records of this list.
   * @return {Array<String>} JavaScript array of stings
   */
  List_prototype.getSelectedIds = function() {
    return this.getSelectedNodes().map(function(x) { return x.getAttribute("jsxid"); }).toArray(true);
  };

  /**
   * Returns the jsxid of the selected record if this list is a single-select list or an array of the the jsxids
   * of the selected records if this list is a multi-select list.
   * @return {String|Array<String>}
   */
  List_prototype.getValue = function() {
    var ids = this.getSelectedIds();
    return this.getMultiSelect() == List.MULTI ? ids : ids[0];
  };

  /**
   * Sets the selected records for this list. This method clears any current selection state and updates both the
   * view and the model. The <code>strRecordId</code> parameter should be a single value for a single-select list
   * or a list of values for a multi-select list.
   * @param strRecordId {String|Array<String>}
   * @return {jsx3.gui.List} this object
   */
  List_prototype.setValue = function(strRecordId) {
    if (jsx3.$A.is(strRecordId)) {
      if (this.getMultiSelect() != List.MULTI)
        throw new jsx3.IllegalArgumentException("strRecordId", strRecordId);
    } else {
      strRecordId = strRecordId != null ? [strRecordId] : [];
    }

    this._doSelects(false, strRecordId, [], false);
    return this;
  };

  /**
   * fires when user hovers over an element in the tree; shows spyglass, toggles open/closed state, highlights drop zone
   * @private
   */
  List_prototype._ebMouseOver = function(objEvent, objGUI) {
    if (this.getCanSpy() == 1 && this.getEvent(Interactive.SPYGLASS)) {
      // get the source element (the to element when its a mouseover event)
      var rowCol = this.getRowAndColIds(objEvent.srcElement());

      if (rowCol[0]) {
        List._curSpyRow = rowCol[2];

        // apply style for the objec to show the hover
        this.applySpyStyle(rowCol[2]);
        var intLeft = objEvent.clientX() + jsx3.EventHelp.DEFAULTSPYLEFTOFFSET;
        var intTop = objEvent.clientY() + jsx3.EventHelp.DEFAULTSPYTOPOFFSET;

        var me = this;
        objEvent.persistEvent(); // for timeout
        /* @jsxobf-clobber */
        List._spytimeout = window.setTimeout(function(){
          // if list destroyed before timeout, then don't fire
          if (!this.getParent()) return;

          var context = {objEVENT:objEvent, strRECORDID:rowCol[0], intCOLUMNINDEX:rowCol[1]};
          var strSPYHTML = me.doEvent(Interactive.SPYGLASS, context);
          // account for cancel
          if (strSPYHTML) {
            // hide any existing spyglass
            jsx3.gui.Interactive.hideSpy();

            me.showSpy(strSPYHTML, objEvent);
          }
        }, jsx3.EventHelp.SPYDELAY);
      }
    }
  };

  /**
   * cancels any pending spyglass event
   * @private
   */
  List_prototype._ebMouseOut = function() {
    //get the source element (the to element when its a mouseover event)
    if (List._curSpyRow) {
      this.removeSpyStyle(List._curSpyRow);
        delete List._curSpyRow;
    }
    window.clearTimeout(List._spytimeout);
    jsx3.gui.Interactive.hideSpy();
  };

  List.BRIDGE_EVENTS = {};
  List.BRIDGE_EVENTS[Event.MOUSEOVER] = true;
  List.BRIDGE_EVENTS[Event.MOUSEOUT] = true;
  List.BRIDGE_EVENTS[Event.CLICK] = true;
  List.BRIDGE_EVENTS[Event.DOUBLECLICK] = true;
  List.BRIDGE_EVENTS[Event.KEYDOWN] = true;
  List.BRIDGE_EVENTS[Event.MOUSEDOWN] = true;
  List.BRIDGE_EVENTS[Event.MOUSEUP] = true;


  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  List_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    //update the VIEW for the data rows
    var doc = this.getDocument();
    if (doc != null) {
      var objBody = doc.getElementById(this.getId() + "_jsxbody");
      if (objBody != null) {
        var intHeaderHeight = (this.getHeaderHeight() != null) ? this.getHeaderHeight() : List.DEFAULTHEADERHEIGHT;
        objBody.style.height = Math.max(0, objImplicit.parentheight - intHeaderHeight) + "px";
      }
    }
  };


  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  List_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    // reset the pointer to the "current" TR
    this._jsxcur = null;

    //initialize runtime props
    var oDim = this.getParent().getClientDimensions(this);
    var strId = this.getId();
    var strScroll = '';
    var strResizeBar = '<span' + /*this.renderHandler(Event.MOUSEUP, "doResizeEnd") + */this.renderHandler(Event.MOUSEDOWN, "doResizeBegin", 1) + ' id="' + strId +
        '_jsxcolresize" style="background-color:' + List.RESIZEBARBGCOLOR + ';" class="jsx30list_colresize"></span>';
    var intHeaderHeight = (this.getHeaderHeight() != null) ? this.getHeaderHeight() : List.DEFAULTHEADERHEIGHT;

    //OUTER span: will hold MAIN table and resize bar
    var strHTML = '<div id="' + strId + '" class="jsx30list" ' + 'style="' + /*width:' + oDim.parentwidth + 'px;height:' + oDim.parentheight + 'px;*/ '' + this.paintDisplay() + this.paintVisibility() + this.paintOverflow() + this.paintBackgroundColor() + this.paintBackground() + '"' + this.paintLabel() + this.renderAttributes() + '>';

    //MAIN table: will hold HEADER table and BODY table
    strHTML += '<table class="jsx30list_table" border="0" cellpadding="0" cellspacing="0" style="' + /*width:' + oDim.parentwidth + 'px;height:' + oDim.parentheight + 'px;*/ '">';

    //HEADER ROW: will hold header cells and ghost cell for re-ordering columns
    if (intHeaderHeight > 0) {
      //build out header content
      strHTML += '<tr><td height="' + intHeaderHeight + '" style="position:relative;overflow:hidden;">';
      strHTML += '<div id="' + strId + '_jsxhead" class="jsx30list_headspan" style="' + this.paintBackgroundColorHead() + this.paintBackgroundHead() + '">';
      strHTML += this.paintHead();
      strHTML += '</div>';
      strHTML += '<div id="' + strId + '_jsxghost"' + /*this.renderHandler(Event.MOUSEUP, "doReorderEnd") +*/
          ' class="jsx30list_ghost">&#160;</div>';
      strHTML += '</td></tr>';
      //add the resize bar (lists with headers can be resized); also add the bound scroll logic so the header row and body rows scroll in synch
      //                      SPAN.TD        .TR        .TBODY     .TR           .TD           .SPAN
      strScroll = ' onscroll="this.parentNode.parentNode.parentNode.childNodes[0].childNodes[0].childNodes[0].childNodes[0].style.left = -this.scrollLeft + \'px\';" ';
    }

    var strEvents = this.renderHandlers(List.BRIDGE_EVENTS, 5);

    //BODY ROW: will hold data
    var trueHeight = oDim.parentheight - intHeaderHeight;
    strHTML += '<tr><td height="' + ((intHeaderHeight == 0) ? '100%' : trueHeight) + '" valign="top" style="position:relative;height:' + trueHeight + 'px' + '">';
    strHTML += '<div id="' + strId + '_jsxbody"' + strEvents + strScroll + ' style="' + this.paintBackgroundColor() + this.getBorder() + ';height:' + trueHeight + 'px' + '" class="jsx30list_bodyspan">';
    strHTML += this.paintBody();

    //if there are subclass extensions to add to the list's VIEW, insert here
    strHTML += this.paintExtras();
    strHTML += '</div>';
    strHTML += '</td></tr>';

    //close out MAIN table
    strHTML += '</table>';

    //add the vertical resize bar
    strHTML += strResizeBar;

    //close OUTER span;
    strHTML += '</div>';

    //return
    return strHTML;
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  List_prototype.paintBackgroundColor = function() {
    return "background-color:" + ((this.getBackgroundColor()) ? this.getBackgroundColor() : List.DEFAULTBACKGROUNDCOLOR) + ";";
  };

  /**
   * renders css background
   * @return {String} background-
   * @private
   */
  List_prototype.paintBackground = function() {
    return (this.getBackground()) ? (this.getBackground() + ";") : "";
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  List_prototype.paintBackgroundColorHead = function() {
    return "background-color:" + ((this.getBackgroundColorHead()) ? this.getBackgroundColorHead() : List.DEFAULTBACKGROUNDCOLORHEAD) + ";";
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  List_prototype.paintBackgroundHead = function() {
    return (this.getBackgroundHead()) ? (this.getBackgroundHead() + ";") : List.DEFAULTBACKGROUNDHEAD;
  };

  /**
   * Returns the css class name (CSS property name without the leading ".")
   * @return {String}
   * @private
   */
  List_prototype.paintClassName = function() {
    return (this.getClassName()) ? this.getClassName() : List.DEFAULTROWCLASS;
  };

  /**
   * Returns height of the header row in pixels. Default: jsx3.gui.List.DEFAULTHEADERHEIGHT
   * @return {int}
   * @private
   */
  List_prototype.paintHeaderHeight = function() {
    return "height:" + ((this.getHeaderHeight()) ? this.getHeaderHeight() : List.DEFAULTHEADERHEIGHT) + "px;";
  };

  /**
   * Returns html content for any 'extras'; this method can be overridden by subclasses of jsx3.gui.List to provide extensions to the body portion of the list;
   *         this would typically get used by subclasses implementing edit masks, although additional features could be provided
   * @return {String} empty string
   * @private
   */
  List_prototype.paintExtras = function() {
    return "";
  };

  /**
   * Returns html content just the content of the head section
   * @return {String} DHTML
   * @private
   */
  List_prototype.paintHead = function() {
    var strHTML = '<table cellspacing="0" cellpadding="3" border="0" style="position:absolute;left:0px;top:0px;table-layout:fixed;' + this.paintHeaderHeight() + '">';
    strHTML += '<tr style="' + this.paintHeaderHeight() + '" ' + this.paintTip() + '>';
    var vChildren = this.getDisplayedChildren();
    var children = this.getChildren();
    var maxLen = children.length;
    var j = 0;
    for (var i = 0; j <= vChildren.length; i++) {
      if (children[i] == null || List._displayedChildFilter(children[i])) {
        //if last iteration, paint the buffer column
        if (j == vChildren.length) {
          if (vChildren.length > 0)
            strHTML += vChildren[vChildren.length-1].paint(true);
        } else {
          if (i < children.length) {
            var sortOrder = (i == this.getSortColumn()) ? this.getSortDirection() : null;
            strHTML += children[i].paint(false, sortOrder);
          }
        }

        j++;
      }
    }
    strHTML += '</tr></table>';

    return strHTML;
  };

  /**
   * Returns html content just the content of the body section
   * @return {String} DHTML
   * @private
   */
  List_prototype.paintBody = function() {
    var strHTML = '<table jsxid="' + this.getId() + '" cellspacing="0" cellpadding="3" border="0" style="table-layout:fixed;' + this.paintBackground() + this.paintFontSize() + this.paintFontName() + this.paintFontWeight() + ';">';
    strHTML += this.doTransform();
    strHTML += '</table>';
    return strHTML;
  };

  /**
   * Repaints the body portion of the list (the data rows), retaining the scroll position in the list whereas
   * repainting the entire list would reset scroll position.
   */
  List_prototype.repaintBody = function() {
    //update the VIEW for the data rows
    var doc = this.getDocument();
    if (doc != null) {
      var objGUI = doc.getElementById(this.getId() + "_jsxbody");
      if (objGUI != null)
        html.setOuterHTML(objGUI.childNodes[0], this.paintBody());
    }
  };

  /**
   * Repaints the head portion of the list (the header row). <p/> Note that this method will not change the rendered
   * height of the header row. Therefore, after the header height is changed programmatically, <code>repaint()</code>
   * must be called for the list to render properly.
   */
  List_prototype.repaintHead = function() {
    var doc = this.getDocument();
    if (doc != null) {
      var objGUI = doc.getElementById(this.getId() + "_jsxhead");
      if (objGUI != null) {
        html.setOuterHTML(objGUI.childNodes[0], this.paintHead());
        this.scrollHead();
      }
    }
  };

  /**
   * Adjusts the left-scroll offset for the header row; called after a repaint of the head
   * @private
   */
  List_prototype.scrollHead = function() {
    var doc = this.getDocument();
    var bdy = doc.getElementById(this.getId() + "_jsxbody");
    if(bdy && bdy.scrollLeft != 0) {
      var objGUI = doc.getElementById(this.getId() + "_jsxhead");
      if(objGUI != null) objGUI.childNodes[0].style.left = -bdy.scrollLeft + "px";
    }
  };

  /**
   * typically called by the paint method for any JSX GUI object that gets its data via an XML feed.  This function
   *          gets the XML/XSL for the object; performs a merge to generate the DHTML content; checks for errors; and returns
   *          a DHTML string to be displayed as the object's content on-screen.  This method can also be called at anytime
   *          to simply generate a string of DHTML
   * @param strRecordId {String} jsxid for the single CDF record in the list to generate HTML for; if null, the entire list is painted
   * @return {String} DHTML; can be an empty string
   * @package
   */
  List_prototype.doTransform = function(strRecordId) {
    //create generic parameter object to pass to the parameterized template
    var objP = {};
    if (strRecordId) objP.jsxrowid = strRecordId;
    objP.jsxtabindex = (isNaN(this.getIndex())) ? 0 : this.getIndex();
    objP.jsxselectionbg = List.SELECTBGIMAGE;
    objP.jsxtransparentimage = jsx3.gui.Block.SPACE;
    objP.jsxid = this.getId();
    objP.jsxsortpath = this.getSortPathInc();
    objP.jsxsortdirection = this.getSortDirection();
    objP.jsxrowclass = this.paintClassName();
    objP.jsxsorttype = this.getSortType();

    //loop to override default parameter values with user's custom values as well as add additional paramters specified by the user
    var objParams = this.getXSLParams();
    for (var p in objParams) objP[p] = objParams[p];

    //merge and return (account for transofrmiix output errors)
    var strContent = this.jsxsupermix(objP);
    strContent = this._removeFxWrapper(strContent);
    return strContent;
  };

  /**
   * Static function that can be called from XSLT-generated content in a list cell to delete a row from the CDF of a
   * list instance.
   * @param strId {String} CDF record id (jsxid) for the row to delete.
   * @param objGUI {HTMLElement} browser element (the hyperlink was clicked) that is contained in the list instance.
   */
  List.onDelete = function(strId, objGUI) {
    //get parent that owns the checkbox
    var objJSX = html.getJSXParent(objGUI);
    if (objJSX instanceof List)
      objJSX.deleteRecord(strId);
  };

  /**
   * provides function that can be called from XSLT-generated content in a list cell. Allows update of CDF via persistent mask interface (checkbox)
   * @param strId {String} CDF record id (jsxid)
   * @param strPropName {String} CDF attribute name for attribute that stores the value of the checkbox
   * @param objGUI {HTMLElement} browser checkbox element (what was checked)
   * @param bToggle {boolean} if true, the checkbox will be toggled via this function and the result will be persisted. if false, the current state of the checkbox will be persisted.
   * @param objArray {Object} 2-element JavaScript array. First element contains the value to insert into the CDF for @strPropName if the checkbox is checked. Second element is for unchecked states.
   * @deprecated
   */
  List.onCheck = function(strId,strPropName,objGUI,bToggle,objArray) {
    // DEPRECATED: getCurrent()
    var objEvent = jsx3.gui.Event.getCurrent();

    //make sure the prop name doesn't use the leading '@'
    if (strPropName.substring(0,1) == "@") strPropName = strPropName.substring(1);

    //get parent that owns the checkbox
    var objJSX = html.getJSXParent(objGUI);

    //toggle the state of the checkbox if true
    if (bToggle) objGUI.checked = !objGUI.checked;
    var bState = objGUI.checked;

    //get CDF record in cache and update
    var strATTVALUE = (bState) ? objArray[0] : objArray[1];
    objJSX.insertRecordProperty(strId,strPropName,strATTVALUE,false);

    // fire the after-edit event here
    objJSX.doEvent(Interactive.AFTER_EDIT,{objEVENT:objEvent, strATTRIBUTENAME:strPropName,
        strATTRIBUTEVALUE:strATTVALUE, strRECORDID:strId, objGUI:objGUI, objMASK:null});

    // cancel the event return (stops unwanted interactions with the containing grid/list, since all we want to do is check something, nothing else)
    if (objEvent)
      objEvent.cancelReturn();
  };

  /**
   * provides function that can be called from XSLT-generated content in a list cell. Allows update of CDF via persistent mask interface (radio button); assumes that the nodes in the CDF document have jsxgroupname attributes to distinguish the radio groups
   * @param strId {String} CDF record id (jsxid)
   * @param strPropName {String} CDF attribute name for attribute that stores the value of the radio button
   * @param objGUI {HTMLElement} browser radio button element
   * @param bSelect {boolean} if true, the radio button will be forced to a 'selected' state and the result will be persisted. if false, the current state of the radio button will be persisted.
   * @param objArray {Object} 2-element JavaScript array. First element contains the value to insert into the CDF for @strPropName if the checkbox is checked. Second element is for unchecked states.
   */
  List.onRadio = function(strId,strPropName,objGUI,bSelect,objArray) {
    //make sure the prop name doesn't use the leading '@'
    if (strPropName.substring(0,1) == "@") strPropName = strPropName.substring(1);

    //force selection if applicable and then route call to onCheck handler
    if (bSelect) objGUI.checked = true;
    List.onCheck(strId,strPropName,objGUI,false,objArray);

    //code here to look for the group name in the CDF and then query to update other CDF records if @bSelect = true;
    if (bSelect) {
      //get parent that owns the checkbox
      var objJSX = html.getJSXParent(objGUI);

      var objNode = objJSX.getRecordNode(strId);
      var myGroupName;
      if (objNode != null && (myGroupName = objNode.getAttribute("jsxgroupname")) != null) {
        var objNodes = objJSX.getXML().selectNodes("//record[@jsxgroupname='" + myGroupName + "']");
        for (var i=0;i<objNodes.getLength();i++) {
          var node = objNodes.getItem(i);
          if (node.getAttribute('jsxid') != strId) objNodes.getItem(i).setAttribute(strPropName,objArray[1]);
        }
      }
    }
  };

  /**
   * Appends a new row to the end of the list and adds a corresponding record to the CDF source XML. This method
   * requires that at least one CDF record already be present to use as a master to clone from if the
   * <code>objMasterRecord</code> parameter is <code>null</code>.
   * @param objMasterRecord {Object} JavaScript object containing at least the field <code>jsxid</code>.
   * @param strID {String} if provided this id will be used as the id (jsxid) for <code>objMasterRecord</code>.
   *   If <code>null</code>, a unique, system-generated key will be used.
   */
  List_prototype.appendRow = function(objMasterRecord, strID) {
    var doc = this.getDocument();

    if (doc != null) {
      var strListId = this.getId();
      var objTBody = doc.getElementById(strListId + "_jsxbody").childNodes[0].childNodes[0];

      var bInModel = true;
      if (strID == null) {
        strID = jsx3.xml.CDF.getKey();
        bInModel = false;
      }

      //get handle to javascript object that will represent the prototypical record to append
      if (objMasterRecord == null)
        objMasterRecord = {jsxid:strID};

      //fire any event code (allows developer to modify the clone that is about to be appended)
      this.doEvent(Interactive.BEFORE_APPEND, {objMASTERRECORD:objMasterRecord});

      //add the record object to the CDF document
      if (bInModel == false) this.insertRecord(objMasterRecord, null, false);

      //generate the HTML for the new record via standard xml/xsl merge
      var strXHTML = List.HTML2XHTML(this.doTransform(strID));

      if (strXHTML != "") {
        var objDoc = new jsx3.xml.Document();
        objDoc.loadXML(strXHTML);
        if (! objDoc.hasError()) {
          //create the TR DOM element and apply all attributes from the XHTML source
          var objTR = doc.createElement("TR");
          var objEntity = objDoc.getRootNode();
          List.convertXMLToDOM(objEntity,objTR);

          //iterate through the record nodes; append innerText
          var objEntities = objEntity.selectNodes("td");
          for (var k=0;k<objEntities.getLength();k++) {
            objEntity = objEntities.getItem(k);
            var objTD = doc.createElement("TD");
            List.convertXMLToDOM(objEntity,objTD);
            objTR.appendChild(objTD);
            var objContent = objEntity.getChildNodes(true);
            var strContent = "";
            for (var j=0;j<objContent.getLength();j++) {
              strContent += objContent.getItem(j).toString();
            }
            objTD.innerHTML = strContent;
          }
          objTBody.appendChild(objTR);

          //fire any event code (allows developer to modify the clone that is about to be appended)
          this.doEvent(Interactive.AFTER_APPEND,{objMASTERRECORD:objMasterRecord,objTR:objTR});
        } else {
          LOG.warn("A new row could not be appended to " + this + " because of an XML error: " + objDoc.getError());
        }
      }
    }
  };

  /**
   * Updates the DHTML (VIEW) for an existing row within a list, circumventing a full table repaint by updating
   * the row directly.
   * @param strRecordId {String} id for the CDF record whose associated on-screen TR needs to be updated.
   */
  List_prototype.updateRow = function(strRecordId) {
    //get the TR in the VIEW
    var objTR;
    if (this.getRecordNode(strRecordId) != null && (objTR = this.getRowForRecord(strRecordId)) != null) {
      //generate the HTML for the TR via xml/xsl merge; convert to XHTML
      var strXHTML = List.HTML2XHTML(this.doTransform(strRecordId));
      if (strXHTML != "") {
        //if the XHTML is valid, proceed by applying its values to the existing TR and its given child elements
        var objDoc = new jsx3.xml.Document();
        objDoc.loadXML(strXHTML);
        if (! objDoc.hasError()) {
          //create the TR DOM element and apply all attributes from the XHTML source
          var objEntity = objDoc.getRootNode();
          List.convertXMLToDOM(objEntity,objTR);

          //iterate through the record nodes; append innerText
          var objEntities = objEntity.selectNodes("td");
          for (var i=0;i<objEntities.getLength();i++) {
            objEntity = objEntities.getItem(i); //use GI-wrapped DOM method
            var objTD = objTR.childNodes.item(i);   //use native DOM method (haven't had the time to wrap this yet...)
            List.convertXMLToDOM(objEntity,objTD);
            var objContent = objEntity.getChildNodes(true);
            var strContent = "";
            for (var j=0;j<objContent.getLength();j++) {
              strContent += objContent.getItem(j).toString().replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
            }
            objTD.innerHTML = strContent;
          }
        } else {
          jsx3.util.Logger.doLog("list.update.1","A row could not be updated, due to the following reasons(s): " + objDoc.getError(),3,false);
        }
      }
    }
  };

  /**
   * applies the attributes belonging to the XML entity, objEntity, and applies to the browser DOM element, objDOM
   * @param objEntity {jsx3.xml.Entity} jsx3.xml.Entity instance
   * @param objDOM {HTMLElement} native browser DOM element (a TR/TD)
   * @private
   * @jsxobf-clobber
   */
  List.convertXMLToDOM = function(objEntity,objDOM) {
    var objAtts = objEntity.getAttributes();
    for (var i=0;i<objAtts.getLength();i++) {
      var objAtt = objAtts.getItem(i);
      var strName = objAtt.getNodeName();
      var re = /(on(?:mousedown|click|focus|blur|mouseup|scroll|keydown|keypress))/gi;
      var strValue = objAtt.getValue();
      if (strName.match(re)) {
        //event; bind as a function
        objDOM[strName.toLowerCase()] = new Function(strValue);
      } else if (strName == "class") {
        objDOM.className = strValue;
      } else if (strName == "style") {
        jsx3.gui.Painted.convertStyleToStyles(objDOM,strValue);
      } else {
        objDOM.setAttribute(strName,strValue);
      }
    }
  };


  /**
   * applies the attributes belonging to a browser-native DOM element and applies to another browser DOM element
   * @param objDOMSource {jsx3.xml.Entity} jsx3.xml.Entity instance
   * @param objDOMDest {HTMLElement} native browser DOM element (a TR/TD)
   * @private
   * @jsxobf-clobber
   */
  List.convertDOMToDOM = function(objDOMSource,objDOMDest) {
    var objAtts = objDOMSource.getAttributes();
    for (var i=0;i<objAtts.getLength();i++) {
      var objAtt = objAtts.getItem(i);
      var strName = objAtt.getNodeName();
      var re = /(on(?:mousedown|click|focus|blur|mouseup|scroll|mouseup|keydown|keypress))/gi;
      var strValue = objAtt.getValue();
      if (strName.match(re)) {
        //event; bind as a function
        objDOMDest[strName] = new Function(strValue);
      } else if (strName != "class") {
        objDOMDest.setAttribute(strName,strValue);
      } else {
        objDOMDest.className = strValue;
      }
    }
    if (!objDOMDest.tagName || objDOMDest.tagName.toLowerCase() != "tr") objDOMDest.style.position = "relative";
  };

  /**
   * converts a string of HTML to XHTML by closing any 'input' and 'img' tags;
   * @param strHTML {String} HTML generated via xslt for a specific table row for the list/grid instance
   * @return {String} XHTML
   * @private
   * @jsxobf-clobber
   */
  List.HTML2XHTML = function(strHTML) {
    var re = /(<(?:img|input)[^>]*)(>)/gi;
    strHTML = strHTML.replace(re,function($0,$1,$2){ return $1 + "/>"; });
    strHTML = strHTML.replace(/&nbsp;/g,"&#160;").replace(/&/g,"&amp;");
    return strHTML;
  };

  /**
   * Returns whether or not a new row will be appended to the VIEW when a new record is added to the CDF document for the List.  In the case of a grid, a new row is also appended when the last row in the grid gets cursor focus.
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  List_prototype.getGrowBy = function() {
    return this.jsxgrowby;
  };

  /**
   * Sets whether or not a new row will be appended to the VIEW when a new record is added to the CDF document for the List.  In the case of a grid, a new row is also appended when the last row in the grid gets cursor focus.
   * @param intGrow {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   * @return {jsx3.gui.List} this object
   */
  List_prototype.setGrowBy = function(intGrow) {
    this.jsxgrowby = intGrow;
    return this;
  };

  /**
   * @deprecated  Replaced by <code>getGrowBy</code> which returns an integer argument rather than a boolean.
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   * @see #getGrowBy()
   */
  List_prototype.getAutoExpand = function() {
    return jsx3.Boolean.valueOf(this.getGrowBy());
  };

  /**
   * @deprecated  Replaced by <code>setGrowBy</code> which takes an integer argument rather than a boolean one.
   * @param bExpand {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>.
   * @see #setGrowBy()
   */
  List_prototype.setAutoExpand = function(bExpand) {
    return this.setGrowBy(bExpand ? 1 : 0);
  };

  /**
   * Returns the data type to be used for sorting this list. This value is either the one explicitly set with
   * <code>setSortType()</code> or the data type of the current sort.
   * @return {String} <code>jsx3.gui.Column.TYPETEXT</code> or <code>jsx3.gui.Column.TYPENUMBER</code>
   */
  List_prototype.getSortType = function() {
    if (this.jsxsorttype == null) {
      if (this.jsxsortcolumn != null)
        return (this.getChild(this.jsxsortcolumn) == null) ? jsx3.gui.Column.TYPETEXT : this.getChild(this.jsxsortcolumn).getDataType();

      //no sort type has been defined; derive by iterating through child nodes; finding a match on the sort path; if none found, assume string
      var strPath = this.getSortPath();
      for (var i = this.getChildren().length -1;i>=0;i--) {
        var child = this.getChild(i);
        if ((child instanceof jsx3.gui.Column) && child.getSortPath() == strPath)
          return this.getChild(i).getDataType();
      }
      //no match found; use 'text'
      return jsx3.gui.Column.TYPETEXT;
    } else {
      return this.jsxsorttype;
    }
  };

  /**
   * Sets the data type for the list. This explicit value will override any column data type if set. If it is not set
   * the data type specific to the sort column is used for sorting.
   * @param strDataType {String} <code>jsx3.gui.Column.TYPETEXT</code> or <code>jsx3.gui.Column.TYPENUMBER</code>
   * @return {jsx3.gui.List} this object
   */
  List_prototype.setSortType = function(strDataType) {
    this.jsxsorttype = strDataType;
    return this;
  };

  /**
   * Returns rules for the focus rectangle/bounding box. Used by Builder
   * @return {Object<String, boolean>} JavaScript object with named properties: NN, SS, EE, WW, MM
   * @package
   */
  List_prototype.getMaskProperties = function() {
    return jsx3.gui.Block.MASK_NO_EDIT;
  };

  /**
   * Returns whether or not the rows in the grid will support text-wrapping and expand to display their wrapped
   * content OR be a fixed height. The default value is <code>jsx3.Boolean.TRUE</code>.
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  List_prototype.getWrap = function() {
    return (this.jsxwrap == null) ? jsx3.Boolean.TRUE : this.jsxwrap;
  };

  /**
   * Sets whether or not the rows in the grid will support text-wrapping and expand to display their wrapped content
   * OR be a fixed height.
   * @param WRAP {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   * @return {jsx3.gui.List} this object
   */
  List_prototype.setWrap = function(WRAP) {
    //remove the existing xsl as it is no longer valid; on next repaint the wrapping update will be reflected
    this.resetXslCacheData();
    this.jsxwrap = WRAP;
    return this;
  };

  /**
   * ensures that lists only accept children of type jsx3.gui.Column; returns true if drop is valid
   * @return {boolean}
   * @package
   */
  List_prototype.onSetChild = function(child) {
    return child instanceof jsx3.gui.Column;
  };

  /**
   * Returns true if the record can be selected
   * @return {boolean}
   * @package
   */
  List_prototype.isRecordSelectable = function(strRecordId) {
    var record = this.getRecord(strRecordId);
    return record != null && (record[CDF.ATTR_UNSELECTABLE] == null || record[CDF.ATTR_UNSELECTABLE] != "1");
  };

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  List.getVersion = function() {
    //subclassed method
    return "3.0.00";
  };

});

/**
 * @deprecated  Renamed to getResizable.
 * @see  #getResizable()
 * @jsxdoc-definition  List.prototype.getResizeable = function(){}
 */
jsx3.gui.List.prototype.getResizeable = jsx3.gui.List.prototype.getResizable;

/**
 * @deprecated  Renamed to setResizable.
 * @see  #setResizable()
 * @jsxdoc-definition  List.prototype.setResizeable = function(){}
 */
jsx3.gui.List.prototype.setResizeable = jsx3.gui.List.prototype.setResizable;

/**
 * @deprecated  Renamed to getResizable.
 * @see  #getResizable()
 * @jsxdoc-definition  List.prototype.getCanResize = function(){}
 */
jsx3.gui.List.prototype.getCanResize = jsx3.gui.List.prototype.getResizable;

/**
 * @deprecated  Renamed to setResizable.
 * @see  #setResizable()
 * @jsxdoc-definition  List.prototype.setCanResize = function(){}
 */
jsx3.gui.List.prototype.setCanResize = jsx3.gui.List.prototype.setResizable;

/**
 * Deselects all selected records of this list. This method updates both the model and the view.
 * @deprecated  use setValue() or <code>deselectAllRecords()</code> instead.
 * @see #setValue()
 * @see #deselectAllRecords()
 * @jsxdoc-definition  List.prototype.doClearSelections = function(){}
 */
jsx3.gui.List.prototype.doClearSelections = jsx3.gui.List.prototype.deselectAllRecords;

/**
 * Deselects all selected records of this list. This method updates both the model and the view.
 * @deprecated  use setValue() or <code>deselectAllRecords()</code> instead.
 * @see #setValue()
 * @see #deselectAllRecords()
 * @jsxdoc-definition  List.prototype.deselectRecords = function(){}
 */
jsx3.gui.List.prototype.deselectRecords = jsx3.gui.List.prototype.deselectAllRecords;

/**
 * @deprecated  Renamed to jsx3.gui.List
 * @see jsx3.gui.List
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.List", -, null, function(){});
 */
jsx3.List = jsx3.gui.List;

/* @JSC :: end */ 
