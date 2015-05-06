/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.xml.Cacheable", "jsx3.gui.Form", "jsx3.gui.Block");

/**
 * A lightweight control that displays CDF data in an HTML table.  Supports both single- and multi-selection
 * modes. Data can be sorted by clicking on column labels.  Output and output formatting can be customized using
 * a combination of XSLT, inline CSS properties, or named CSS rules.  The columns
 * for this control are defined within the object model and are not defined
 * in the DOM as child objects.
 * <p/>
 * The Table class by default supports the following CDF attributes:
 * <ul>
 * <li><code>jsxid</code></li>
 * <li><code>jsxselected</code></li>
 * <li><code>jsxstyle</code></li>
 * <li><code>jsxclass</code></li>
 * <li><code>jsximg</code></li>
 * <li><code>jsxtip</code></li>
 * <li><code>jsxunselectable</code></li>
 * <li><code>jsxexecute</code></li>
 * </ul>
 * This class publishes the following model events:
 * <ul>
 * <li><code>EXECUTE</code> &#8211;</li>
 * <li><code>MENU</code> &#8211;</li>
 * <li><code>CHANGE</code> &#8211;</li>
 * <li><code>SPYGLASS</code> &#8211;</li>
 * </ul>
 *
 * @since 3.5
 */
jsx3.Class.defineClass("jsx3.gui.Table", jsx3.gui.Block, [jsx3.gui.Form, jsx3.xml.Cacheable, jsx3.xml.CDF], function(Table, Table_prototype) {

  var LOG = jsx3.util.Logger.getLogger(Table.jsxclass.getName());

  //alias frequently-used classes
  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;
  var CDF = jsx3.xml.CDF;

  /**
   * {String}
   */
  Table.DEFAULTXSLURL = jsx3.resolveURI("jsx:///xsl/jsxtable.xsl");

  /* @jsxobf-clobber */
  /* @Embed(source='../../../xsl/jsxtable.xsl', type='xsl') */
  Table._XSLRSRC = new jsx3.xml.XslDocument().load(Table.DEFAULTXSLURL);

  /**
   * {String} text (default)
   * @final @jsxobf-final
   */
  Table.TYPE_TEXT = "text";

  /**
   * {String} number
   * @final @jsxobf-final
   */
  Table.TYPE_NUMBER = "number";

  /** @private @jsxobf-clobber */
  Table.SPYTIMEOUT = null;

  /**
   * {String} jsx:///images/table/select.gif
   */
  Table.SELECTION_BG = "jsx:///images/table/select.gif";

  /**
   * {int} Enum value for the <code>multiSelect</code> property indicating an unselectable table.
   * @final @jsxobf-final
   */
  Table.SELECTION_UNSELECTABLE = 0;

  /**
   * {int} Enum value for the <code>multiSelect</code> property indicating a multi-select table.
   * @final @jsxobf-final
   */
  Table.SELECTION_ROW = 1;

  /**
   * {int} Enum value for the <code>multiSelect</code> property indicating a single-select table.
   * @final @jsxobf-final
   */
  Table.SELECTION_MULTI_ROW = 2;

  /**
   * {String} ascending
   * @final @jsxobf-final
   */
  Table.SORT_ASCENDING = "ascending";

  /**
   * {String} descending
   * @final @jsxobf-final
   */
  Table.SORT_DESCENDING = "descending";

  /**
   * {String} jsx:///images/table/sort_desc.gif (default)
   */
  Table.SORT_DESCENDING_IMG = jsx3.resolveURI("jsx:///images/table/sort_desc.gif");

  /**
   * {String} jsx:///images/table/sort_asc.gif (default)
   */
  Table.SORT_ASCENDING_IMG = jsx3.resolveURI("jsx:///images/table/sort_asc.gif");

  /**
   * {int} 20
   */
  Table.DEFAULT_HEADER_HEIGHT = 20;

  /**
   * {jsx3.xml.Document} Default XSLT structure that will be bound as a child of the &lt;tr&gt; element. When processed during the transformation,
   *          This element calls out to the named template defined by <code>Table.DEFAULT_CELL_TEMPLATE</code>.
   * @private
   * @jsxobf-clobber
   */
  Table.DEFAULT_CELL_TEMPLATE = new jsx3.xml.Document().loadXML(
                                      '<td id="{$jsxid}_{@jsxid}jsx#ATTNAME#" class="jsx30table {$jsxcellclass}" unselectable="on" \n' +
                                      '  style="width:#WIDTH#;{$myselectionbg} {$jsxcellstyle} ">\n' +
                                      '  <xsl:apply-templates select="." xmlns:xsl="http://www.w3.org/1999/XSL/Transform">\n' +
                                      '    <xsl:with-param name="attname" select="\'#ATTNAME#\'"/>\n' +
                                      '  </xsl:apply-templates>\n' +
                                      '</td>');

  /**
   * {jsx3.xml.Document} Default XSL template for rendering the cell value for all cells. This template can be
   * replaced with a custom XSL template.  The template should <code>match</code> on a record element (match="record") and will
   * be used for all data cells in the body of the table. This template will be passed one named parameter (xsl:param) named
   * <code>attname</code>, the name of the attribute to which the column is mapped.
   * @see #setValueTemplate
   */
  Table.DEFAULT_CELL_VALUE_TEMPLATE = '<xsl:template match="*" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">\n' +
                                      ' <xsl:param name="attname"/>\n' +
                                      ' <div unselectable="on" class="{@jsxclass}" style="{@jsxstyle};{$jsxcellwrap}">\n' +
                                      '   <xsl:choose>\n' +
                                      '     <xsl:when test="$attname = $attrimg and @*[name() = $attrimg]">\n' +
                                      '       <xsl:variable name="jsximg_resolved">\n' +
                                      '         <xsl:apply-templates select="attribute::*[name()=$attname]" mode="uri-resolver"/>\n' +
                                      '       </xsl:variable>\n' +
                                      '       <img unselectable="on" src="{$jsximg_resolved}" alt="{@*[name() = $attrimgalt]}"/>\n' +
                                      '     </xsl:when>\n' +
                                      '     <xsl:otherwise>\n' +
                                      '       <xsl:value-of select="attribute::*[name()=$attname]"/>\n' +
                                      '       <xsl:if test="not(attribute::*[name()=$attname])">&#160;</xsl:if>\n' +
                                      '     </xsl:otherwise>\n' +
                                      '   </xsl:choose>\n' +
                                      ' </div>\n' +
                                      '</xsl:template>';

  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   */
  Table_prototype.init = function(strName) {
    //call constructor for super class
    this.jsxsuper(strName);
  };

  /**
   * validates the Table; if the Table is set to 'required', a selection must be made to pass validation. Otherwise, a Table will always pass validation
   * @return {int} one of: jsx3.gui.Form.STATEINVALID or jsx3.gui.Form.STATEVALID
   */
  Table_prototype.doValidate = function() {
    var ids = this.getSelectedIds();
    var valid = ids.length > 0 || this.getRequired() == jsx3.gui.Form.OPTIONAL;
    this.setValidationState(valid ? jsx3.gui.Form.STATEVALID : jsx3.gui.Form.STATEINVALID);
    return this.getValidationState();
  };

  /**
   * Returns an array of selected values (or empty array) if the selection model is <code>Table.SELECTION_MULTI_ROW</code>. Returns a string (or null)
   * for the other selection models
   * @return {String | Array<String>}
   */
  Table_prototype.getValue = function() {
    var sType = this.getSelectionModel();
    if (sType == Table.SELECTION_MULTI_ROW) {
      return this.getSelectedIds();
    } else {
      return this.getSelectedIds()[0];
    }
  };


  /**
    * Sets the value of this table. Deselects all existing selections. Scrolls the first record into view.
    * @param strId {String | Array<String>} jsxid attribute for the CDF record(s) to select
    * @return {jsx3.gui.Table}  this object.
    */
   Table_prototype.setValue = function(strId) {
     this.deselectAllRecords();
     if(strId) {
       if (jsx3.$A.is(strId)) {
         if (this.getSelectionModel() != Table.SELECTION_MULTI_ROW && strId.length > 1)
           throw new jsx3.IllegalArgumentException("strId", strId);
       } else {
         strId = [strId];
       }

       for(var i=0;i<strId.length;i++)
         this.selectRecord(strId[i]);
     }
     return this;
   };


  /**
   * Returns the on-screen row indentified by the CDF record id that generated it
   * @param strCdfId {String} jsxid property for CDF record to select in the view
   * @private
   * @jsxobf-clobber
   */
  Table_prototype._getRowById = function(strCdfId) {
    var objDoc = this.getDocument();
    return objDoc.getElementById(this.getId() + "_" + strCdfId);
  };

  /**
   * Returns the on-screen cell indentified by the CDF record id that generated it and the mapped attribute name
   * @param strCdfId {String} jsxid property for CDF record to select in the view
   * @param strAttName {String} attribute name on the CDF record. For example, <code>jsxtext</code>
   * @private
   * @jsxobf-clobber
   */
  Table_prototype._getCellById = function(strCdfId,strAttName) {
    var objDoc = this.getDocument();
    return objDoc.getElementById(this.getId() + "_" + strCdfId + "jsx" + strAttName);
  };

  /**
   * Returns the on-screen cell that represents the intersection of the row identified
   * by <code>strCdfId</code> and the first cell mapped to the named CDF attribute, <code>strAttName</code>.
   * @param strCdfId {String} jsxid property for CDF record
   * @param strAttName {String} attribute name on the CDF record. For example, <code>jsxtext</code>
   * @return {HTMLElement}
   */
  Table_prototype.getContentElement = function(strCdfId,strAttName) {
    var objGUI = this._getCellById(strCdfId,strAttName);
    if (objGUI)
      return objGUI;
  };

  /**
   * Applies focus to the on-screen row indentified by the CDF record id that generated it
   * @param strCdfId {String} jsxid property for the corresponding CDF record
   */
  Table_prototype.focusRowById = function(strCdfId) {
    var objGUI = this._getRowById(strCdfId);
    if(objGUI)
      jsx3.html.focus(objGUI);
  };

  /**
   * Called by scrolling the div that contains the body/data rows
   * @param objEvent {jsx3.gui.Event}
   * @param objGUI {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Table_prototype._ebScroll = function(objEvent,objGUI) {
    if(objGUI.parentNode.childNodes[1]) {
      var intLeft = objGUI.scrollLeft;
      objGUI.parentNode.childNodes[1].childNodes[0].style.left = "-" + intLeft + "px";
    }
  };




  // ***********************************************+
  // ************** SELECTION METHODS **************|
  // ***********************************************+




  /**
   * Returns the selection model. If no selection type is specified, the instance will employ single row selection (<code>SELECTION_ROW</code>)
   * @param-private strDefault {String} The default value to use if null
   * @return {int}
   */
  Table_prototype.getSelectionModel = function(strDefault) {
    return (this.jsxselectionmodel != null) ? ((this.jsxselectionmodel>Table.SELECTION_MULTI_ROW)?Table.SELECTION_UNSELECTABLE:this.jsxselectionmodel) : ((strDefault != null) ? strDefault : null);
  };

  /**
   * Sets the selection model
   * @param intType {int}  one of Table: .SELECTION_UNSELECTABLE, .SELECTION_ROW, .SELECTION_MULTI_ROW
   */
  Table_prototype.setSelectionModel = function(intType) {
    this.jsxselectionmodel = intType;
  };

  /**
   * default function that is called whenever a click event occurs within the table's on-screen view;
   * @param objGUI {Object} GUI object that received the click event
   * @private
   */
  Table_prototype._ebClick = function(objEvent, objGUI) {
    var objTargetRow = objEvent.srcElement();
    if (objTargetRow == null) return;
    var objThis = this.getRendered(objGUI);
    while (objTargetRow && objTargetRow != objThis && objTargetRow.tagName.search(/^tr/i) == -1)
      objTargetRow = objTargetRow.parentNode;
    if (objTargetRow == objThis) return;
    var strId = objTargetRow.getAttribute("jsxid");

    if (jsx3.gui.isMouseEventModKey(objEvent)) {
      //set this item as the anchor
      this._setSelectionAnchor(strId);

      //treat the ctrl key like a toggle enabler
      if (this.isRecordSelected(strId)) {
        this._doDeselect(objEvent, strId, null);
      } else {
        this._doSelect(objEvent, strId, null, true);
      }
    } else if (objEvent.shiftKey()) {
      //find the 'anchor': the last row clicked without shift or ctrl
      var strAnchorId = this._getSelectionAnchor();
      if (strAnchorId) {
        var objAnchorRow = this._getRowById(strAnchorId);
        if (objAnchorRow)
          this._doSelectRange(objEvent, objAnchorRow, objTargetRow);
      } else {
        //no existing anchor, even though the shift key is being depressed; set active item as the anchor
        this._setSelectionAnchor(strId);

        //process normally (basically a single selection)
        this._doSelect(objEvent, strId, null, false);
      }
    } else {
      //set this item as the anchor
      this._setSelectionAnchor(strId);

      //process normally (basically a single selection)
      if (!this.isRecordSelected(strId))
        this._doSelect(objEvent, strId, null, false);
    }
    this.focus();
  };


  /**
     * Gets cached/resolved version of the selection bg to avoid unnecessary cycles
     * @private
     * @jsxobf-clobber
     */
    Table_prototype._getSelectionBG = function() {
      if (!this._jsxselectionbg)
        /* @jsxobf-clobber */
        this._jsxselectionbg = {bg:this.getServer().resolveURI(this.getSelectionBG(Table.SELECTION_BG))};
      return this._jsxselectionbg.bg;
    };

    /**
     * Returns the CSS string to apply to a Row/Cell when it has focus
     * @param-private strDefault {String} The default value to use if null (Table.SELECTION_BG)
     * @return {String}
     */
    Table_prototype.getSelectionBG = function(strDefault) {
      return (this.jsxselectionbg) ? this.jsxselectionbg : ((strDefault) ? strDefault : null);
    };

    /**
     * Sets the URL for the image to use (as the repeating background image) to denote selection.
     * @param strURL {String}
     */
    Table_prototype.setSelectionBG = function(strURL) {
      delete this._jsxselectionbg;
      this.jsxselectionbg = strURL;
    };

    /**
     * Called by _handleSelectionEvent to persist the ID of the selected item to serve as an anchor/pivot (used with multi-row selection to create a range).
     * @param strId {String} jsxid property on the CDF
     * @private
     * @jsxobf-clobber
     */
    Table_prototype._setSelectionAnchor = function(strId) {
      //store the id for the item that was just selected (without the shift or ctrl keys being held down)
      /* @jsxobf-clobber */
      this._jsxselectionanchor = strId;
    };

    /**
     * Called by _handleSelectionEvent to get the ID of the last selected item (used with multi-row selection to create a range).
     * @private
     * @jsxobf-clobber
     */
    Table_prototype._getSelectionAnchor = function() {
      return this._jsxselectionanchor;
    };

    /**
     * Resolves the TR object that was last selected (the anchor)
     * @private
     * @jsxobf-clobber
     */
    Table_prototype._getSelectionAnchorObject = function() {
      return this.getDocument().getElementById(this._getSelectionAnchor());
    };


    /**
     * Returns the collection of selected records.
     * @return {jsx3.util.List<jsx3.xml.Entity>}
     */
    Table_prototype.getSelectedNodes = function() {
      //return collection of selected nodes
      return this.getXML().selectNodes("//" + this._cdfan("children") + "[@" + this._cdfan("selected") + "='1']");
    };

    /**
     * Returns the <b>jsxid(s)</b> for the selected record(s). Equivalent to <code>this.getValue()</code> except that the return value is always an Array.
     * @return {Array<String>} JavaScript array of stings
     */
    Table_prototype.getSelectedIds = function() {
      var ids = [];
      var i = this.getXML().selectNodeIterator("//" + this._cdfan("children") + "[@" + this._cdfan("selected") + "='1']");
      while (i.hasNext()) {
        var record = i.next();
        ids[ids.length] = this._cdfav(record, "id");
      }
      return ids;
    };

    /**
     * Returns true if the record can be selected
     * @return {boolean}
     * @package
     */
    Table_prototype.isRecordSelectable = function(strRecordId) {
      var rec = this.getRecordNode(strRecordId);
      return rec && this._cdfav(rec, "unselectable") != "1";
    };

    /**
     * Returns true if the record is selected
     * @return {boolean}
     * @package
     */
    Table_prototype.isRecordSelected = function(strRecordId) {
      var rec = this.getRecordNode(strRecordId);
      return rec && this._cdfav(rec, "selected") == "1";
    };

    /**
     * Selects a CDF record of this list. The item will be highlighted in the view and the CDF data will be updated
     * accordingly. If this list is a multi-select list then this selection will be added to any previous selection.
     * @param strRecordId {String} the jsxid of the record to select.
     */
    Table_prototype.selectRecord = function(strRecordId) {
      //can any record be selected
      if (this.getSelectionModel() == Table.SELECTION_UNSELECTABLE)
        return;

      //can this record be selected
      if (!this.isRecordSelectable(strRecordId))
        return;

      //call private method
      this._doSelect(false, strRecordId, null, this.getSelectionModel() == Table.SELECTION_MULTI_ROW);
    };

    /**
     * Deselects a CDF record within the Table. Both the view and the data model (CDF) will be updated
     * @param strRecordId {String} the jsxid of the record to deselect.
     */
    Table_prototype.deselectRecord = function(strRecordId) {
      this._doDeselect(false, strRecordId, null);
    };

    /**
     * Deselects all selected CDF records.
     */
    Table_prototype.deselectAllRecords = function() {
      var strRecordIds = this.getSelectedIds();
      var intLen = strRecordIds.length;
      for (var i=0; i<intLen; i++)
        this._doDeselect(false, strRecordIds[i]);
    };

    /** @private @jsxobf-clobber */
    Table_prototype._doSelect = function(objEvent, strRecordId, objTR, bUnion) {
      //check for already selected
      var intSelModel = this.getSelectionModel(Table.SELECTION_ROW);
      var recordNode = this.getRecordNode(strRecordId);

      //if objEvent exists and the instance supports dragging and the record is already selected, exit early
      var bDragUnion = (bUnion || (objEvent && this.getCanDrag() == 1));
      if (intSelModel == Table.SELECTION_UNSELECTABLE || !recordNode ||
           (this._cdfav(recordNode, "selected") == "1" && bDragUnion) ||
           this._cdfav(recordNode, "unselectable") == "1")
        return false;

      //check if any existing selections need to first be cleared
      var bMulti = bUnion && (intSelModel == Table.SELECTION_MULTI_ROW);
      if (!bMulti)
        this.deselectAllRecords();

      //update the record in the MODEL
      this._cdfav(recordNode, "selected", "1");

      // update VIEW
      objTR = objTR || this._getRowById(strRecordId);
      if (objTR != null) {
        //resolve the bg image to use to denote selection
        var strBGImage = "url(" + this._getSelectionBG() + ")";

        //update all cells in row or only selected cell depending upon selection model
        for (var i=0;i<objTR.childNodes.length;i++)
          objTR.childNodes[i].style.backgroundImage = strBGImage;
      }

      //evaluate the model event
      this._doSelectEvent(objEvent,strRecordId);
      return true;
    };

    /** @private @jsxobf-clobber */
    Table_prototype._doDeselect = function(objEvent, strRecordId, objTR) {
      // check for already selected
      var recordNode = this.getRecordNode(strRecordId);
      if (!recordNode || this._cdfav(recordNode, "selected") != "1")
        return false;

      //update the record in the model
      this._cdfav(recordNode, "selected", null);

      // update view
      objTR = objTR || this._getRowById(strRecordId);
      if (objTR != null && objTR.childNodes) {
        objTR.style.backgroundImage = "";
        for (var i=0;i<objTR.childNodes.length;i++)
          objTR.childNodes[i].style.backgroundImage = "";
      }

      //evaluate the model event
      this._doSelectEvent(objEvent);
      return true;
    };


    /**
     * Selects a range of contiguous rows (TR) in a List; will only be called by VIEW
     * @param objEvent {jsx3.gui.Event}
     * @param objAnchorRow {HTMLElement} on-screen element (TR) that represents the active end of a selection range
     * @param objTargetRow {HTMLElement} on-screen element (TR) that represents the passive end of a selection range
     * @private
     * @jsxobf-clobber
     */
    Table_prototype._doSelectRange = function(objEvent, objAnchorRow, objTargetRow) {
      //exit if null
      if (!objAnchorRow || !objTargetRow) return;

      //immidiately exit if either row involved in the selection range is disabled
      var strAnchorId = objAnchorRow.getAttribute("jsxid");
      var strTargetId = objTargetRow.getAttribute("jsxid");
      if (!this.isRecordSelectable(strAnchorId) || !this.isRecordSelectable(strTargetId))
        return;

      //get absolute row index
      var intAnchorIndex = objAnchorRow.getAttribute("jsxposition");
      var intTargetIndex = objTargetRow.getAttribute("jsxposition");
      var intRangeStart = Math.min(intAnchorIndex,intTargetIndex);
      var intRangeEnd = Math.max(intAnchorIndex,intTargetIndex);

      var strIds = this.getSelectedIds();
      var intIdLen = strIds.length;
      var objToBeIds = {};

      //optimization: deselect all selected records that fall outside the range
      for (var i = 0; i < intIdLen; i++) {
        var objTR = this._getRowById(strIds[i]);
        if (objTR.getAttribute("jsxposition") < intRangeStart || objTR.getAttribute("jsxposition") > intRangeEnd) {
          this._doDeselect(false, strIds[i], objTR);
        } else {
          //this row falls within the range AND is already selected. make note, since no need to reselect
          objToBeIds[strIds[i]] = 1;
        }
      }

      //select all records within the range not already selected
      var objPanel = objTargetRow.parentNode;
      for (var i = intRangeStart; i <= intRangeEnd; i++) {
        var strCdfId = objPanel.childNodes[i].getAttribute("jsxid");
        if (!objToBeIds[strCdfId])
          this._doSelect(false, strCdfId, objPanel.childNodes[i], true);
      }

      //evaluate the model event
      this._doSelectEvent(objEvent,strTargetId);
    };

    /** @private @jsxobf-clobber */
    Table_prototype._doSelectEvent = function(objEvent, strTargetId) {
      if (!this._jsxprevselection) {
        /* @jsxobf-clobber */
        this._jsxprevselection = [];
      }

      //called by various methods after selection has changed
      if (objEvent && objEvent instanceof Event) {
        var intIds = this.getValue();
        this.doEvent(Interactive.CHANGE, {objEVENT:objEvent,
                                          strRECORDID:strTargetId,
                                          strRECORDIDS:intIds,
                                          preVALUE:this._jsxprevselection, _gipp:1});
        this._jsxprevselection = intIds
      }
    };




  // ***********************************************+
  // *************** SORTING METHODS ***************|
  // ***********************************************+



  
  /**
   * Returns CDF record in the column profile document at the given index
   * @return {String}
   * @private
   * @jsxobf-clobber
   */
  Table_prototype._getRecordByIndex = function(intColumnIndex) {
    //due to IE indexing issue (and the fact that the oldest IE browsers don't properly support XPath) use iterator
    var iter = this.getColumnProfileDocument().selectNodeIterator("//" + this._cdfan("children"));
    var i = 0;
    while(iter.hasNext()) {
      var objNode = iter.next();
      if(i == intColumnIndex)
        return objNode;
      i++;
    }
  };

  /**
   * Called by the click event attached to a column header cell (TD). Sorts and repaints acording to the target column profile
   * @param objEvent {jsx3.gui.Event}
   * @param objGUI {DIV}
   * @private
   * @jsxobf-clobber
   */
  Table_prototype._doSort = function(objEvent,objGUI) {
    if (this.getCanSort() != jsx3.Boolean.FALSE) {
      //which column was clicked (zero-based)
      var intRealIndex = Number(objGUI.getAttribute("jsxindex"));

      //get the sort path, sort type
      var objRecord = this._getRecordByIndex(intRealIndex);
      var strSortPath = this._cdfav(objRecord, "path");
      var strSortType = this._cdfav(objRecord, "pathtype") || "text";
      this.setSortPath(strSortPath);
      this.setSortType(strSortType);

      //fire the 'before sort' event
      var vntReturn = this.doEvent(Interactive.BEFORE_SORT,
          {objEVENT:objEvent, intCOLUMNINDEX:intRealIndex, strSORTPATH:strSortPath, strSORTTYPE:strSortType});

      //proceed with the sort if not cancelled
      if (vntReturn !== false) {
        //developer can modify the sorth path and/or sort data type
        if (vntReturn != null && typeof(vntReturn) == "object") {
          if (vntReturn.strSORTPATH)
            this.setSortPath(vntReturn.strSORTPATH);
          if (vntReturn.strSORTTYPE)
            this.setSortType(vntReturn.strSORTTYPE);
        }
        this.doSort();

        //fire the 'after sort' event
        this.doEvent(Interactive.AFTER_SORT,
          {objEVENT:objEvent, intCOLUMNINDEX:intRealIndex, strSORTPATH:this.getSortPath(), strSORTTYPE:this.getSortType(), _gipp:1});
      }
    }
  };

  /**
   * Sorts according to the current sort path. If no sort direction is specified, the sort direction will be toggled.
   * @param intSortDir {String} <code>jsx3.gui.Table.SORT_ASCENDING</code> or <code>jsx3.gui.Table.SORT_DESCENDING</code>.
   * @see #SORT_ASCENDING
   * @see #SORT_DESCENDING
   */
  Table_prototype.doSort = function(intSortDir) {
    //update the sort direction
    if (intSortDir) {
      this.setSortDirection(intSortDir);
    } else {
      //toggle sort direction when the sorted column is re-clicked
      this.setSortDirection((this.getSortDirection() == Table.SORT_ASCENDING) ? Table.SORT_DESCENDING : Table.SORT_ASCENDING);
    }

    //toggle the sort designation icons for each column header
    if(this.getHeaderHeight() > 0) {
      var curSortPath = this.getSortPath();
      var objColumns = this.getColumnProfileDocument().selectNodeIterator("//" + this._cdfan("children"));
      var i=0;
      var objHeader = this.getRendered().childNodes[1].childNodes[0];
      while (objColumns.hasNext())
        this._applySortIcon(objHeader,(i++), this._cdfav(objColumns.next(), "path") == curSortPath);
    }

    //repaint only data
    this.repaintData();
  };

  /**
   * applies the sort icon after a sort event
   * @param objHeader {HTMLElement} contains the header cells
   * @param intCellIndex {int}
   * @param bApply {Boolean} either applies or removes
   * @private
   * @jsxobf-clobber
   */
  Table_prototype._applySortIcon = function(objHeader,intCellIndex,bApply) {
    objHeader.childNodes[intCellIndex].style.backgroundImage = (bApply) ? "url(" +
      ((this.getSortDirection() == Table.SORT_ASCENDING) ?
      Table.SORT_ASCENDING_IMG : Table.SORT_DESCENDING_IMG) +
      ")" : "";
  };

  /**
   * Returns the name of the CDF attribute to sort on. If no value is set an empty string is returned by default.
   * @return {String}
   */
  Table_prototype.getSortPath = function() {
    return (this.jsxsortpath == null) ? "" : this.jsxsortpath;
  };

  /**
   * Sets the name of the CDF attribute to sort on. The records in the data source of this table are sorted
   * on this attribute before being painted to screen.
   * @param strAttr {String}
   */
  Table_prototype.setSortPath = function(strAttr) {
    this.jsxsortpath = strAttr;
  };

  /**
   * Returns the data type to be used for sorting this list.
   * @return {String} <code>jsx3.gui.Table.TYPE_TEXT</code> or <code>jsx3.gui.Table.TYPE_NUMBER</code>
   */
  Table_prototype.getSortType = function() {
    return (this.jsxsorttype == null) ? Table.TYPE_TEXT : this.jsxsorttype;
  };

  /**
   * Sets the data type for the list.
   * @param DATATYPE {String} data type for this column's data. Valid types include: jsx3.gui.Table.TYPE_TEXT and jsx3.gui.Table.TYPE_NUMBER
   */
  Table_prototype.setSortType = function(DATATYPE) {
    this.jsxsorttype = DATATYPE;
  };

  /**
   * Returns the direction (jsx3.gui.Table.SORT_ASCENDING or jsx3.gui.Table.SORT_DESCENDING) for the sorted column; if no direction specified, ascending is returned
   * @return {String} one of: jsx3.gui.Table.SORT_ASCENDING or jsx3.gui.Table.SORT_DESCENDING
   */
  Table_prototype.getSortDirection = function() {
    return (this.jsxsortdirection == null) ? Table.SORT_ASCENDING : this.jsxsortdirection;
  };

  /**
   * Sets the direction (ascending or descending) for the sorted column.
   * @param intSortDir {String} one of: jsx3.gui.Table.SORT_ASCENDING or jsx3.gui.Table.SORT_DESCENDING
   */
  Table_prototype.setSortDirection = function(intSortDir) {
    this.jsxsortdirection  = intSortDir;
  };

  /**
   * Returns whether the table is sortable. If <code>null</code> or <code>jsx3.Boolean.TRUE</code>, the instance is sortable.
   * @return {int}
   */
  Table_prototype.getCanSort = function() {
    return this.jsxsort;
  };

  /**
   * Sets whether the table is sortable.
   * @param SORT {int} one of <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  Table_prototype.setCanSort = function(SORT) {
   this.jsxsort = SORT;
  };

  /**
   * This method implements redraw support by repainting the entire control.
   * @return {jsx3.gui.Table} this object
   */
  Table_prototype.redrawRecord = function(strRecordId, ACTION) {
    this.repaint();
    return this;
  };




  // ***********************************************+
  // ******* CONTEXT MENU AND SPYGLASS *************|
  // ***********************************************+


  

  /**
   * provides event handling for a context-sensitive menu
   * @private
   */
  Table_prototype._ebMouseUp = function(objEvent, objGUI) {
    //is this a context-menu event
    if (objEvent.rightButton() && this.getMenu()) {
      //resolve the TD that was clicked.  If it can't be found, exit early, the right-mouse-up is invalid and should be ignored
      var objSource = objEvent.srcElement();
      if (objSource == null) return;
      var objThis = this.getRendered(objGUI);
      while (objSource && objSource != objThis && objSource.tagName.search(/^td/i) == -1)
        objSource = objSource.parentNode;
      if (objSource == objThis) return;

      //persist the id of the CDF record that was the target (it's stored on the TR element)
      var strRecordId = objSource.parentNode.getAttribute("jsxid");

      //user right-moused-up over a node in the table; show the context menu if there is one...
      var objMenu = this._getNodeRefField(this.getMenu());
      if (objMenu != null && this.isRecordSelectable(strRecordId)) {
        var vntResult = this.doEvent(Interactive.MENU, {objEVENT:objEvent, objMENU:objMenu, strRECORDID:strRecordId,intCOLUMNINDEX:objSource.cellIndex});
        if (vntResult !== false) {
          if (vntResult instanceof Object && vntResult.objMENU instanceof jsx3.gui.Menu)
            objMenu = vntResult.objMENU;
          objMenu.showContextMenu(objEvent, this, strRecordId);
        }
      }
    }
  };

  /**
   * fires when user hovers over an element in the table; shows spyglass
   * @private
   */
  Table_prototype._ebMouseOver = function(objEvent, objTableGUI) {
    //get the source element (the to element when its a mouseover event)
    var objSource = objEvent.srcElement();
    if (objSource == null) return;
    var objThis = this.getRendered(objTableGUI);
    while(objSource && objSource != objThis && objSource.tagName.search(/^td/i) == -1)
      objSource = objSource.parentNode;
    if(objSource == objThis) return;

    if (this.hasEvent(Interactive.SPYGLASS)) {
      // objGUI will be the <div> for the record moused over
      var objGUI = objSource.parentNode;
      var strRecordId = objGUI.getAttribute("jsxid");

      //fire the spyglass
      //this.applySpyStyle(objGUI);

      var intLeft = objEvent.clientX() + jsx3.EventHelp.DEFAULTSPYLEFTOFFSET;
      var intTop = objEvent.clientY() + jsx3.EventHelp.DEFAULTSPYTOPOFFSET;

      objEvent.persistEvent(); // so that event properties are available after timeout
      var me = this;

      if (Table.SPYTIMEOUT)
        window.clearTimeout(Table.SPYTIMEOUT);

      Table.SPYTIMEOUT = window.setTimeout(function(){
        Table.SPYTIMEOUT = null;
        if (me.getParent() != null)
          me._doSpyDelay(objEvent, strRecordId, objGUI, objSource.cellIndex);
      }, jsx3.EventHelp.SPYDELAY);
    }
  };

  /**
   * called by 'window.setTimeout'; provides execution context for any spyglass event spawned within the '_ebMouseOver' method
   * @param objEvent {jsx3.gui.Event}
   * @param strRECORDID {String} id (CDF @jsxid property) for the record being spyglassed
   * @param objSource {Object} source element in the table (the text label) that was hovered over and stylized in the VIEW to denote an impending spy event
   * @param intColumnIndex {Object} index of column to spy
   * @private
   * @jsxobf-clobber
   */
  Table_prototype._doSpyDelay = function(objEvent, strRECORDID, objSource, intColumnIndex) {
    this.removeSpyStyle(objSource);
    // no objEVENT in spy events because of timeout
    var eventResult = this.doEvent(Interactive.SPYGLASS, {objEVENT:objEvent, strRECORDID:strRECORDID,intCOLUMNINDEX:intColumnIndex});

    if (eventResult)
      this.showSpy(eventResult, objEvent);
  };

  /**
   * called: cancels spyglass if one was set to fire on a delay
   * @private
   */
  Table_prototype._ebMouseOut = function(objEvent, objTableGUI) {
    var bFake = objEvent.isFakeOut(objTableGUI);

    var objSource = objEvent.fromElement();
    if (objSource == null) return;

    //is this a spy event that should be canceled
    if (this.hasEvent(Interactive.SPYGLASS)) {
      var eElement = objEvent.toElement();
      if (!eElement || eElement.id != "_jsxspy") {
        //reset the cursor; clear the spyglass delay to stop it from firing
        jsx3.sleep(jsx3.gui.Interactive.hideSpy);

        //this.removeSpyStyle(objSource);
        if (Table.SPYTIMEOUT)
          window.clearTimeout(Table.SPYTIMEOUT);
      }
    }
  };




  // ***********************************************+
  // ********** EXECUTE (DBL-CLICK) ****************|
  // ***********************************************+



  /**
   * Called when user keys down while the table's on-screen view has focus. Currently NO KEYS ARE BEING TRACKED
   * @private
   */
  Table_prototype._ebKeyDown = function(objEvent, objTableGUI) {
    // check for hot keys
    if (this.jsxsupermix(objEvent, objTableGUI)) return;
  };


  /** @private @jsxobf-clobber */
  Table_prototype._execRecord = function(objEvent, strRecordId) {
    var strRecordIds = null;
    if (strRecordId == null)
      strRecordIds = this.getSelectedIds();
    else if (!jsx3.$A.is(strRecordId))
      strRecordIds = [strRecordId];
    else
      strRecordIds = strRecordId;

    for (var i = 0; i < strRecordIds.length; i++) {
      var id = strRecordIds[i];
      if (id == null || ! this.isRecordSelectable(id))
        continue;

      var objRecord = this.getRecordNode(id);
      var strScript = this._cdfav(objRecord, "execute");
      if (strScript) {
        var context = {strRECORDID:id};
        if (objEvent instanceof Event)
          context.objEVENT = objEvent;

        this.eval(strScript, this._getEvtContext(context));
      }
    }

    if (objEvent)
      this.doEvent(Interactive.EXECUTE, {objEVENT: objEvent, strRECORDIDS:this.getSelectedIds(), strRECORDID:strRecordIds[0]});
  };

  /**
   * @private
   */
  Table_prototype._ebDoubleClick = function(objEvent, objGUI) {
    //get the source element (the to element when its a mouseover event)
    var objSource = objEvent.srcElement();
    if (objSource == null) return;
    var objThis = this.getRendered(objGUI);
    while(objSource && objSource != objThis && objSource.tagName.search(/^tr/i) == -1)
      objSource = objSource.parentNode;
    if(objSource == objThis) return;
    var strRecordId = objSource.getAttribute("jsxid");
    if (strRecordId)
      this._execRecord(objEvent,strRecordId);
  };

  Table.BRIDGE_EVENTS = {};
  Table.BRIDGE_EVENTS[Event.CLICK] = true;
  Table.BRIDGE_EVENTS[Event.DOUBLECLICK] = true;
  Table.BRIDGE_EVENTS[Event.MOUSEOVER] = true;
  Table.BRIDGE_EVENTS[Event.MOUSEOUT] = true;
  Table.BRIDGE_EVENTS[Event.MOUSEUP] = true;
  Table.BRIDGE_EVENTS[Event.MOUSEDOWN] = true;

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  Table_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 3);
    if (objGUI) jsx3.sleep(function() {this._sychronizeColumnWidths(this.getRendered());},this.getId() + "_syncheadtobody",this);
  };

  /**
   * Creates the box model/profile for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @private
   */
  Table_prototype.createBoxProfile = function(objImplicit) {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if(this.getParent() && (objImplicit == null || ((isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))))) {
      objImplicit = this.getParent().getClientDimensions(this);
    } else if(objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }


    //update/set layout properties
    objImplicit.boxtype = "relativebox";
    objImplicit.tagname = "div";
    if(objImplicit.left == null) objImplicit.left = 0;
    if(objImplicit.top == null) objImplicit.top = 0;
    if(objImplicit.width == null) objImplicit.width = "100%";
    if(objImplicit.height == null) objImplicit.height = "100%";
    var bor;
    if((bor = this.getBorder()) != null && bor != "") objImplicit.border = bor;

    //return the explicit object (e.g., the box profile)
    return new jsx3.gui.Painted.Box(objImplicit);
  };

  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  Table_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //save the id -- i'll need it a few times
    var strId = this.getId();

    //get table content via merge
    var strContent = this.doTransform();

    //if no data returned from the merge, insert the default message for the user
    if (! strContent) strContent = this.getNoDataMessage();

    //render the events for the table
    var strEvents = "";
    if (this.getEnabled() == 1)
      strEvents = this.renderHandlers(Table.BRIDGE_EVENTS, 0);

    //get custom 'VIEW' properties(custom props to add to the rended HTML tag)
    var strProps = this.renderAttributes(null, true);

    //render the outer-most box
    var b1 = this.getBoxProfile(true);
    b1.setAttributes(this.paintTip() + strEvents + ' id="' + strId + '"' + this.paintLabel() + ' class="jsx30table" ' + strProps);
    b1.setStyles(this.paintFontSize() + this.paintBackgroundColor() + this.paintColor() + this.paintFontName() + this.paintFontWeight() + this.paintCursor() + this.paintVisibility() + this.paintDisplay() + this.paintCSSOverride());

    return b1.paint().join('<div class="jsx30table_body" ' + this.renderHandler("scroll", "_ebScroll") + '>' + strContent + '</div>');
  };

  /** @package */
  Table_prototype.onAfterPaint = function(objGUI) {
    this._paintHead(objGUI);
  };

  /** @package */
  Table_prototype.onAfterRestoreView = function(objGUI) {
    this._sychronizeColumnWidths(objGUI);
  };

  /**
   * Paints the header row. Called after the data rows have painted, so that the header columns align with the data columns by
   * simply transferring the offset width of the data columns to the associated column in the header. Note that the header
   * will only be painted if there is data, since the header uses the data to render its width dimension
   * @private
   * @jsxobf-clobber
   */
  Table_prototype._paintHead = function(objGUI) {
    var sId = this.getId();
    var intHeaderHeight =  this.getHeaderHeight();
    if(intHeaderHeight) {
      var objTRBody = objGUI.childNodes[0];
      //is the table present
      if (objTRBody != null) {
        do {
          objTRBody = objTRBody.childNodes[0];
        } while (objTRBody && objTRBody.tagName && objTRBody.tagName.search(/^tr/i) == -1);
        //have any data rows been painted
        var arrHTML = [];
        arrHTML.push('<div class="jsx30table_head_port" style="height:' + intHeaderHeight + 'px;width:' + objGUI.childNodes[0].offsetWidth + 'px;">' +
                     '<div class="jsx30table_head_pane ' + this.getHeaderClass("") + '"' +
                     ' style="' + this.paintBackground() + ';' + this.getHeaderStyle("") + '">');
        //loop through the columns defined in the column profile document in order to generate the column labels
        var curSortPath = this.getSortPath();
        var curSortIcon = "background-image:url(" + ((this.getSortDirection() == Table.SORT_ASCENDING) ? Table.SORT_ASCENDING_IMG : Table.SORT_DESCENDING_IMG) + ");";
        var i = this.getColumnProfileDocument().selectNodeIterator("//" + this._cdfan("children"));
        var inc = 0;
        while (i.hasNext()) {
          var objColumn = i.next();
          var strSortIcon = (curSortPath && this._cdfav(objColumn, "path") == curSortPath) ? curSortIcon : "";
          var strText = this._cdfav(objColumn, "text") || "";
          arrHTML.push('<div jsxindex="' + inc++ + '" ' + this.renderHandler(Event.CLICK, "_doSort") + ' class="jsx30table_header_cell" style="width:100px;height:' + intHeaderHeight + 'px;' + strSortIcon + '">' + strText + '</div>');
        }
        arrHTML.push('</div></div>');
        if(objGUI.childNodes.length == 2) {
          jsx3.html.setOuterHTML(objGUI.childNodes[1],arrHTML.join(""));
        } else {
          jsx3.html.insertAdjacentHTML(objGUI,"beforeEnd",arrHTML.join(""));
        }
        this._sychronizeColumnWidths(objGUI);
      }
    }
  };

  /**
   * Updates the width of the painted header cells to reflect the true widths of the data columns
   * @private
   * @jsxobf-clobber
   */
  Table_prototype._sychronizeColumnWidths = function(objGUI) {
    // Check at entry point
    if (!this.getParent()) return;
    //locate the header row
    if (this.getHeaderHeight() > 0) {
      //locate the first table row in the body
      var objTRBody = objGUI.childNodes[0];
      //is the table present (no errors during painting the body (1) and head (2))
      if (objGUI.childNodes.length == 2) {
        //3.7: synch the scroll position (if content is scrolled out of view and then the tbale is resized, the content can get hidden)
        this._ebScroll(false,objGUI.childNodes[0]);
        do {
          objTRBody = objTRBody.childNodes[0];
        } while (objTRBody && objTRBody.tagName && objTRBody.tagName.search(/^tr/i) == -1);
        //have any data rows been painted in the table
        var objTRHead = objGUI.childNodes[1].childNodes[0];
        if (!objTRHead) return;
        var intTotal = 0;
        if (objTRBody) {
          //loop to update cell widths in the header, using the offsetWidths in the body
          objGUI.childNodes[1].style.width = objGUI.childNodes[0].clientWidth + "px";
          for (var i = 0; i < objTRBody.childNodes.length; i++) {
            //3.7: currently ignoring the size of the last column
            var offsetWidthB = false && i == objTRHead.childNodes.length - 1 ? objGUI.clientWidth - intTotal : objTRBody.childNodes[i].offsetWidth;
            var offsetWidthH = objTRHead.childNodes[i].offsetWidth;
            var intAmt = (offsetWidthB - offsetWidthH + window.parseInt(objTRHead.childNodes[i].style.width));
            intTotal += intAmt;
            objTRHead.childNodes[i].style.width = intAmt + "px";
          }
        } else {
          //loop to update cell widths in the header, using the same repeating width
          var intMax = objGUI.clientWidth;
          objGUI.childNodes[1].style.width = intMax + "px";
          var intCellMax = parseInt(intMax / objTRHead.childNodes.length);
          var intLast = intMax - (intCellMax * (objTRHead.childNodes.length-1));
          for (var i = 0; i < objTRHead.childNodes.length; i++) {
            var offsetWidthB = i == objTRHead.childNodes.length - 1 ? intLast : intCellMax;
            var offsetWidthH = objTRHead.childNodes[i].offsetWidth;
            var intAmt = (offsetWidthB - offsetWidthH + window.parseInt(objTRHead.childNodes[i].style.width));
            intTotal += intAmt;
            objTRHead.childNodes[i].style.width = intAmt + "px";
          }
        }
        objTRHead.style.width = intTotal + "px";
      }
    }
  };

  /**
   * Paints only the header row.  Call for quick repainting of the header row and not the data rows.
   */
  Table_prototype.repaintHead = function() {
    this._paintHead(this.getRendered());
  };

  /**
   * Paints only the data rows.  Call for quick repainting of the data rows when only the source data
   * has changed. Does not recalculate and reprofile the box profile and resulting XSLT. Retains scroll position when possible.
   */
  Table_prototype.repaintData = function() {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Table.jsxclass, this);
/* @JSC :: end */

    var objGUI = this.getRendered();
    if(objGUI)
      objGUI.childNodes[0].innerHTML = this.doTransform();

/* @JSC :: begin BENCH */
    t1.log("repaint.data");
/* @JSC :: end */
  };
  
  /**
   * Ensures that the superclass is passed the appropriate parameter object
   * @package
   */
  Table_prototype.doTransform = function() {
    var objP = {};
    objP.jsxshallowfrom = this.getRenderingContext("jsxroot");
    objP.jsxtabindex = (this.getIndex() == null) ? 0 : this.getIndex();
    objP.jsxid = this.getId();
    objP.jsxsortpath = this.getSortPath();
    objP.jsxsortdirection = this.getSortDirection();
    objP.jsxsorttype = this.getSortType();
    objP.jsxpath = jsx3.getEnv("jsxabspath");
    objP.jsxpathapps = jsx3.getEnv("jsxhomepath");
    objP.jsxpathprefix = this.getUriResolver().getUriPrefix();
    objP.jsxappprefix = this.getServer().getUriPrefix();
    objP.jsxselectionbgurl = this._getSelectionBG();
    objP.jsxheaderheight = this.getHeaderHeight(Table.DEFAULT_HEADER_HEIGHT);
    objP.jsxcellstyle = this.getCellStyle();
    objP.jsxcellclass = this.getCellClass();
    objP.jsxrowstyle1 = this.getRowStyle();
    objP.jsxrowclass1 = this.getRowClass();
    objP.jsxrowstyle2 = this.getAlternateRowStyle(objP.jsx_rowstyle1);
    objP.jsxrowclass2 = this.getAlternateRowClass(objP.jsx_rowclass1);
    //HTML tables do not inherit various font properties that otherwise cascade
    objP.jsxtablestyles = this.paintFontSize() + this.paintColor() + this.paintFontName() + this.paintFontWeight();
    //default is not to wrap text.  Consistent with Matrix defaults
    objP.jsxcellwrap = (this.getWrap(0)) ? "" : "white-space:nowrap;";

    //loop to override default parameter values with user's custom values applied via the XSL Parameters interface
    var objParams = this.getXSLParams();
    for (var p in objParams) objP[p] = objParams[p];

    return jsx3.html.emptyToClosed(this._removeFxWrapper(this.jsxsupermix(objP)));
  };

  /**
   * Returns the CSS style for the HTML row containing the column headers.
   * @param-private strDefault {String}
   * @return {String}
   */
  Table_prototype.getHeaderStyle = function(strDefault) {
    return (this.jsxheaderstyle) ? this.jsxheaderstyle : ((strDefault) ? strDefault : null);
  };

  /**
   * Sets the CSS style properties for the HTML row containing the column headers. Multiple properties are supported.
   * For example: <code>background-image:url(JSXAPPS/myproject/images/bg.gif);font-family:Arial;</code>.
   * The following CSS properties (those affecting layout and position) are not allowed: width, height,
   * left, top, position, overflow, border, padding, margin.
   * @param strCSS {String}
   */
  Table_prototype.setHeaderStyle = function(strCSS) {
    this.jsxheaderstyle = strCSS;
  };

  /**
   * Returns the CSS rule for the HTML row containing the column headers.
   * @param-private strDefault {String}
   * @return {String}
   */
  Table_prototype.getHeaderClass = function(strDefault) {
    return (this.jsxheaderclass) ? this.jsxheaderclass : ((strDefault) ? strDefault : "");     
  };

  /**
   * Sets the CSS rule for the HTML row containing the column headers.  Multiple rules are supported.
   * For example: <code>boldText titleText</code>.
   * The following CSS properties (those affecting layout and position) are not allowed for the rule: width, height,
   * left, top, position, overflow, border, padding, margin.
   * @param strRuleName {String}
   */
  Table_prototype.setHeaderClass = function(strRuleName) {
    this.jsxheaderclass = strRuleName;
  };

  /**
   * Returns the CSS properties for the HTML row elements(s) containing the table data.
   * @return {String}
   */
  Table_prototype.getRowStyle = function() {
    return this.jsxrowstyle;
  };

  /**
   * Sets the CSS properties for the HTML row element(s) containing the table data. Every row will
   * apply the properties defined by this value, unless an alternate row style is used, in which case, the properties are alternated
   * between this value and the value applied by <code>setAlternateRowStyle</code>.  Multiple properties are supported.
   * For example: <code>background-color:white;font-family:Arial;</code>.
   * @param strCSS {String}
   * @see #setAlternateRowStyle
   */
  Table_prototype.setRowStyle = function(strCSS) {
    this.jsxrowstyle = strCSS;
  };

  /**
   * Returns the CSS properties for the HTML row element(s) containing the <b>alternating</b> table data rows.
   * @param-private strDefault {String}
   * @return {String}
   */
  Table_prototype.getAlternateRowStyle = function(strDefault) {
    return (this.jsxaltrowstyle) ? this.jsxaltrowstyle : ((strDefault) ? strDefault : null);
  };

  /**
   * Sets the CSS properties for the HTML row element(s) containing the <b>alternating</b> table data rows. Multiple properties are supported.
   * For example: <code>background-color:red;font-family:Arial;</code>.
   * @param strCSS {String}
   */
  Table_prototype.setAlternateRowStyle = function(strCSS) {
    this.jsxaltrowstyle = strCSS;
  };

  /**
   * Returns the CSS properties that will be inlined on <b>every</b> HTML cell in the body of the table.
   * @return {String}
   */
  Table_prototype.getCellStyle = function() {
    return this.jsxcellstyle;
  };

  /**
   * Sets the CSS properties that will be inlined on <b>every</b> HTML cell in the body of the table. Multiple properties are supported.
   * For example: <code>text-align:right;background-color:#eeeeee;border-bottom:solid 1px #aeaeae;</code>.
   * @param strCSS {String}
   */
  Table_prototype.setCellStyle = function(strCSS) {
    this.jsxcellstyle = strCSS;
  };

  /**
   * Returns the CSS rule for the HTML row element(s) containing the table data.
   * @return {String}
   */
  Table_prototype.getRowClass = function() {
    return this.jsxrowclass;
  };

  /**
   * Sets the CSS rule for the HTML row element(s) containing the table data. Every row will
   * apply the rule defined by this value, unless an alternate row rule is used, in which case, the rule (classname) is alternated
   * between this value and the value applied by <code>setAlternateRowClass</code>.  Multiple rules are supported.
   * For example: <code>bodyText normalText</code>.
   * @param strRuleName {String}
   * @see #setAlternateRowClass
   */
  Table_prototype.setRowClass = function(strRuleName) {
    this.jsxrowclass = strRuleName;
  };

  /**
   * Returns the CSS rule for the HTML row element(s) containing the <b>alternating</b> table data rows.
   * @param-private strDefault {String}
   * @return {String}
   */
  Table_prototype.getAlternateRowClass = function(strDefault) {
    return (this.jsxaltrowclass) ? this.jsxaltrowclass : ((strDefault) ? strDefault : null);
  };

  /**
   * Sets the CSS rule for the HTML row element(s) containing the <b>alternating</b> table data rows. Multiple rules are supported.
   * For example: <code>bodyText, normalText</code>.
   * @param strRuleName {String}
   */
  Table_prototype.setAlternateRowClass = function(strRuleName) {
    this.jsxaltrowclass = strRuleName;
  };

  /**
   * Returns the CSS rule that will be applied to <b>every</b> HTML cell in the body of the table.
   * @return {String}
   */
  Table_prototype.getCellClass = function() {
    return this.jsxcellclass;
  };

  /**
   * Sets the CSS rule that will be applied to <b>every</b> HTML cell in the body of the table.
   * Multiple rules are supported.  For example: <code>boldText titleText</code>.
   * @param strRuleName {String}
   */
  Table_prototype.setCellClass = function(strRuleName) {
    this.jsxcellclass = strRuleName;
  };


  /**
   * Returns whether or not the table's data cells support text-wrapping and expand vertically to display their wrapped content. If this
   * property is not set, the cell content will not wrap.
   * @param-private strDefault {String}
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  Table_prototype.getWrap = function(strDefault) {
    return (this.jsxwrap != null) ? this.jsxwrap : ((strDefault != null) ? strDefault : null);
  };

  /**
   * Sets whether or not the table's data cells support text-wrapping and expand vertically to display their wrapped content.
   * @param WRAP {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  Table_prototype.setWrap = function(WRAP) {
    this.jsxwrap = WRAP;
  };

  Table_prototype.onXmlBinding = function(objEvent) {
    this.jsxsupermix(objEvent);
    this.repaint();
  };
  
  /**
   * Returns the text/HTML to display on-screen when the xml/xsl transformation for this object results in a null or empty result set
   * @return {String} text/HTML
   */
  Table_prototype.getNoDataMessage = function() {
    return (this.jsxnodata == null) ? this._getLocaleProp("noData", Table) : this.jsxnodata;
  };

  /**
   * no children allowed
   * @return {boolean}
   * @package
   */
  Table_prototype.onSetChild = function(child) {
    return !(child instanceof jsx3.gui.Painted);
  };





  // ***********************************************+
  // *************** XSLT METHODS ******************|
  // ***********************************************+




  /**
   * Returns XSLT for the Table, prioritizing the acquisition in the following order: 1) check cache; 2) check jsxxsl; 3) check jsxxslurl; 4) use default
   * @return {jsx3.xml.Document} jsx3.xml.Document instance containing valid XSL stylesheet
   */
  Table_prototype.getXSL = function() {
    return this._getXSL();
  };


  /**
   * Returns the instance XSLT
   * @private
   * @jsxobf-clobber
   */
  Table_prototype._getXSL = function() {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Table.jsxclass, this);
/* @JSC :: end */

    var baseDoc = Table._XSLRSRC ||
        jsx3.getSharedCache().getOrOpenDocument(Table.DEFAULTXSLURL, null, jsx3.xml.XslDocument.jsxclass);
    
    var cache = this.getServer().getCache();
    var objXSL = cache.getDocument(this.getXSLId());
    if (objXSL == null) {
      //clone the master document and place in the local cache (unlike xslt for most other controls, Table provides an instance-based XSLT)
      objXSL = baseDoc.cloneDocument();
      cache.setDocument(this.getXSLId(), objXSL);
      var objTR = objXSL.selectSingleNode("//xsl:template/tr");

      //create the value template (this renders the content for each cell and can be customized by the developer)
      var strValueTemplate = this.getValueTemplate(Table.DEFAULT_CELL_VALUE_TEMPLATE);
      var objXSLSnippet = new jsx3.xml.Document();
      objXSLSnippet.loadXML(strValueTemplate);
      if (!objXSLSnippet.hasError()) {
        objXSLSnippet.setAttribute("match",this._cdfan("children"));
        objXSL.appendChild(objXSLSnippet);
      } else {
        LOG.error("The column profile document has errors. A new, empty CDF Document will be used instead. (Description: " + objXSLSnippet.getError().description + ")");
        return;
      }

      //loop through the columns defined in the column profile document and update the XSLT appropriately
      var i = this.getColumnProfileDocument().selectNodeIterator("//" + this._cdfan("children"));
      while (i.hasNext()) {
        //resolve profile information for the current column
        var objColumn = i.next();
        var objColumnProfile = {jsxpath:this._cdfav(objColumn, "path"),jsxwidth:this._cdfav(objColumn, "width")};
        //make sure 'jsxwidth' resolves to one of three valid values: empty string, \dpx, or \d%
        if(jsx3.util.strEmpty(objColumnProfile.jsxwidth)) {
          objColumnProfile.jsxwidth = "";
        } else if(!isNaN(objColumnProfile.jsxwidth)) {
          objColumnProfile.jsxwidth += "px";
        }

        //create the xsl snippet that calls out to the 'cell value' template (NOTE: calls-out from the root template, not the cell template)
        objXSLSnippet = Table.DEFAULT_CELL_TEMPLATE.cloneDocument();
        objXSLSnippet.setAttribute("id", "{$jsxid}_{@jsxid}jsx" + objColumnProfile.jsxpath);
        objXSLSnippet.setAttribute("style", "width:" + objColumnProfile.jsxwidth + ";{$myselectionbg}{$jsxcellstyle}");
        objXSLSnippet.selectSingleNode("//xsl:with-param",'xmlns:xsl="http://www.w3.org/1999/XSL/Transform"').setAttribute("select","'" + objColumnProfile.jsxpath + "'");
        objTR.appendChild(objXSLSnippet);
      }
    }

/* @JSC :: begin BENCH */
    t1.log("xsl");
/* @JSC :: end */

    return objXSL;
  };

  /**
   * Gets the user-defined XSL template (xsl:template) that will override the defualt template defined by <code>Table.DEFAULT_CELL_VALUE_TEMPLATE</code>.
   * @param-private strDefault {String} xsl:template
   * @return {String}
   */
  Table_prototype.getValueTemplate = function(strDefault) {
    if(this.jsxvaluetemplate != null && jsx3.util.strTrim(this.jsxvaluetemplate).indexOf("<xsl:template") == 0)
        return this.jsxvaluetemplate;
    if(strDefault != null) return strDefault;
  };

  /**
   * Sets the user-defined XSL template that will override the defualt template defined by <code>Table.DEFAULT_CELL_VALUE_TEMPLATE</code>.
   * The template must resolve to a valid XSL Template when parsed.  The template should match on a record (match="record").  The template
   * will be passed a single XSL param (xsl:param) named <code>attname</code>.
   * @param TEMPLATE {String} valid xsl:template
   */
  Table_prototype.setValueTemplate = function(TEMPLATE) {
    this.jsxvaluetemplate = TEMPLATE;
    this._reset();
  };

  /**
   * Call when a major structural change occurs that causes the XSL to be invalid
   * @private
   * @jsxobf-clobber
   */
  Table_prototype._reset = function(bSimple) {
    this.resetXslCacheData();
  };

  /**
   * Returns a clone of the CDF document used internally to define the Columns (text, order, mapped attributes, etc).
   * The order of the records in this document reflects the order of the columns in the Table.  If the column profile document defined
   * by <code>getColumnProfile</code> is not a valid XML document, an empty CDF Document will be returned instead.
   * Note that if you make changes to the Document returned by this method, those
   * changes will only be reflected by calling  <code>setColumnProfile</code> (to update the model),
   * followed by a call to <code>repaint</code> (to update the view).
   * @return {jsx3.xml.CDF.Document}
   * @see #setColumnProfile
   */
  Table_prototype.getColumnProfileDocument = function() {
    if (!this._jsxcolumnprofile) {
      /* @jsxobf-clobber */
      this._jsxcolumnprofile = CDF.Document.newDocument();
      if (!jsx3.util.strEmpty(this.jsxcolumnprofile)) {
        this._jsxcolumnprofile.loadXML(this.jsxcolumnprofile);
        if (this._jsxcolumnprofile.hasError()) {
          LOG.error("The column profile document has errors. A new, empty CDF Document will be used instead. (Description: " + this._jsxcolumnprofile.getError().description + ")");
          this._jsxcolumnprofile = CDF.Document.newDocument();
        } else {
          this._jsxcolumnprofile.convertProperties(this.getServer().getProperties());
        }
      }
    }
    return this._jsxcolumnprofile.cloneDocument();
  };

  /**
   * Returns the string of XML in CDF format representing the Column Profile Document.
   * @return {String}
   */
  Table_prototype.getColumnProfile = function() {
    return this.jsxcolumnprofile;
  };

  /**
   * Sets a string of XML (in CDF format) or an actual jsx3.xml.CDF.Document instance representing the Column Profile Document.
   * Each record in this document defines the profile for a column in the Table.  The following attributes are supported on each record:<br/>
   * <ul>
   *   <li>jsxid: The unique ID for the record (REQUIRED).</li>
   *   <li>jsxtext: HTML or text content to use as the column label.</li>
   *   <li>jsxwidth: The width of the column (pixel units are implied). For example: <code>300</code>, or <code>25%</code>.</li>
   *   <li>jsxpath: The name of the attribute to which this column maps (REQUIRED).</li>
   *   <li>jsxpathtype: The data type for the attribute. One of: <code>text</code> (default) or <code>number</code>.</li>
   * </ul>
   * <br/><br/>For example:<br/>
   * <pre>
   *   &lt;data jsxid="jsxroot"&gt;
   *     &lt;record jsxid="a1" jsxtext="&amp;lt;b&amp;gt;Column 1&amp;lt;/b&amp;gt;" jsxpath="jsxtext"/&gt;
   *     &lt;record jsxid="a2" jsxtext="Column 2" jsxwidth="100" jsxpath="value" jsxpathtype="number"/&gt;
   *   &lt;/data&gt;
   * </pre>
   * @param objCDF {String | jsx3.xml.CDF.Document}
   */
  Table_prototype.setColumnProfile = function(objCDF) {
    this.jsxcolumnprofile = objCDF + "";
    //cache the parsed instance as well to save time the next time; reset the XSLT, since it no longer adheres to the column profile
    delete this._jsxcolumnprofile;
    this._reset();
  };

  /**
   * Returns the jsxid of the CDF record that will serve as the <b>origin</b> when rendering the data on-screen. If not set, the
   * id, <b>jsxroot</b>, (which is the id for the root node, &lt;data&gt;) will be used.
   * @param-private strDefault {String} The default value to use if null
   * @return {String}
   */
  Table_prototype.getRenderingContext = function(strDefault) {
    return (this.jsxrenderingcontext != null && this.jsxrenderingcontext != "") ? this.jsxrenderingcontext : ((strDefault != null) ? strDefault : null);
  };

  /**
   * Sets the jsxid of the CDF record that will serve as the <b>origin</b> when rendering the data on-screen.
   * @param strJsxId {String} jsxid property for the CDF record to use as the contextual root when rendering data on-screen.
   * @param bSuppressRepaint {Boolean} Pass <code>true</code> to stop the default repaint from occurring.
   */
  Table_prototype.setRenderingContext = function(strJsxId,bSuppressRepaint) {
    this.jsxrenderingcontext = strJsxId;
    this._reset(true);
    if (!bSuppressRepaint) this.repaint();
  };

  /**
   * Returns the height of the header row in pixels. If this value is not set (<code>null</code>), the list will render with
   * the default value of <code>jsx3.gui.Table.DEFAULT_HEADER_HEIGHT</code>.
   * @param-private strDefault {String} The default value to use if null
   * @return {int}
   */
  Table_prototype.getHeaderHeight = function(strDefault) {
    return (this.jsxheaderheight != null) ? Number(this.jsxheaderheight) : ((strDefault) ? strDefault : null);
  };

  /**
   * Sets the height of the header row in pixels. Set to zero (0) to hide the header row and only render the body rows.
   * @param intHeight {int}
   * @param bSuppressRepaint {Boolean} Pass <code>true</code> to stop the default repaint from occurring.
   * Typically property updates that affect the browser-specific box model (such as height) are repainted
   * immediately to keep the box model abstraction in sync with the native view. However, the repaint can be
   * suppressed to avoid unnecessary reparsing of the XSLT during repeated property updates.
   */
  Table_prototype.setHeaderHeight = function(intHeight,bSuppressRepaint) {
    this.jsxheaderheight =  intHeight;
    if (!bSuppressRepaint) this.repaint();
  };



});
