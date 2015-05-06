/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.xml.Cacheable", "jsx3.gui.Form", "jsx3.gui.Block", "jsx3.gui.Matrix.Column",
    "jsx3.util.MessageFormat");

// @jsxobf-clobber-shared  _getFormatHandler _getSelectionQuery
/**
 * The Matrix control is the standard visual interface for the Common Data Format (CDF), providing grid and tree-grid functionality that mirrors the
 * the record and attribute structures used by the CDF. Instances of this class can be used to create editable grids, selectable lists, trees, tables, etc.
 * In addtion to providing layout, selection, and editing schemes, the Matrix also provides various paging models to help optimize
 * how (and how much) data is rendered on-screen. The Matrix class is always used in conjunction with <b>jsx3.gui.Matrix.Column</b>, which describes
 * how data for a given series should be rendered on-screen. While the Matrix manages data and user interactions, Column
 * manages the on-screen format for how the data is presented.
 *
 * @since 3.2
 */
jsx3.Class.defineClass("jsx3.gui.Matrix", jsx3.gui.Block, [jsx3.gui.Form, jsx3.xml.Cacheable, jsx3.xml.CDF], function(Matrix, Matrix_prototype) {

  var LOG = jsx3.util.Logger.getLogger(Matrix.jsxclass.getName());

  //alias frequently-used classes
  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;
  var CDF = jsx3.xml.CDF;
  var Block = jsx3.gui.Block;
  var Painted = jsx3.gui.Painted;
  var Box = Painted.Box;
  var html = jsx3.html;

 /** @private @jsxobf-clobber */
  Matrix.TOGGLE_DELAY = 500;
 /** @private @jsxobf-clobber */
  Matrix.FORMAT_DELAY = 1;
  /** @private @jsxobf-clobber */
  Matrix._2PASS_INTERVAL = 150;

  /**
   * {int} 50
   */
  Matrix.AUTO_SCROLL_INTERVAL = 50;

  /**
   * {String} jsx:///images/matrix/select.gif
   */
  Matrix.SELECTION_BG = "jsx:///images/matrix/select.gif";

  /**
   * {String} jsx:///images/matrix/insert_before.gif
   */
  Matrix.INSERT_BEFORE_IMG = jsx3.resolveURI("jsx:///images/matrix/insert_before.gif");

  /**
   * {String} jsx:///images/matrix/append.gif
   */
  Matrix.APPEND_IMG = jsx3.resolveURI("jsx:///images/matrix/append.gif");

  /**
   * {String} font-weight:bold
   */
  Matrix.FOCUS_STYLE = "font-weight:bold";

  /**
   * {String} jsx:///images/matrix/minus.gif (default)
   */
  Matrix.ICON_MINUS = "jsx:///images/matrix/minus.gif";

  /**
   * {String} jsx:///images/matrix/plus.gif (default)
   */
  Matrix.ICON_PLUS = "jsx:///images/matrix/plus.gif";

  /**
   * {String} jsx:///images/matrix/file.gif (default)
   */
  Matrix.ICON = "jsx:///images/matrix/file.gif";

  /**
   * {String} ascending
   * @final @jsxobf-final
   */
  Matrix.SORT_ASCENDING = "ascending";

  /**
   * {String} descending
   * @final @jsxobf-final
   */
  Matrix.SORT_DESCENDING = "descending";

  /**
   * {String} jsx:///images/matrix/sort_desc.gif (default)
   */
  Matrix.SORT_DESCENDING_IMG = jsx3.resolveURI("jsx:///images/matrix/sort_desc.gif");

  /**
   * {String} jsx:///images/matrix/sort_asc.gif (default)
   */
  Matrix.SORT_ASCENDING_IMG = jsx3.resolveURI("jsx:///images/matrix/sort_asc.gif");

  /**
   * {String} 4. minimum width of a column when minimized (set Display to 'none' to completely hide a column)
   * @final @jsxobf-final
   */
  Matrix.MINIMUM_COLUMN_WIDTH = 8;

  /**
   * {int} 20
   */
  Matrix.DEFAULT_HEADER_HEIGHT = 20;

  /**
   * {int} 0
   * @final @jsxobf-final
   */
  Matrix.AUTOROW_NONE = 0;

  /**
   * {int} 1
   * @final @jsxobf-final
   */
  Matrix.AUTOROW_LAST_ROW = 1;

  /**
   * {int} 2
   * @final @jsxobf-final
   */
  Matrix.AUTOROW_FIRST_ROW = 2;

  /**
   * {jsx3.xml.Document} Default XSLT structure that will be bound as a child of the &lt;tr&gt; element. When processed during the transformation,
   *          This element calls out to the named template defined by <code>jsx3.gui.Matrix.DEFAULT_CELL_TEMPLATE</code>.
   * <br/>Wildcards are as follows:
   * <ul><li><b>{0}</b> this will be replaced with the jsxid for the jsx3.gui.Matrix instance in order to bind the <b>CALL CELL</b> template to the <b>CELL</b> template</li></ul>
   * @private
   * @jsxobf-clobber
   */
  Matrix.DEFAULT_CALL_CELL_TEMPLATE = new jsx3.xml.Document().loadXML(
                                      '<xsl:call-template xmlns:xsl="http://www.w3.org/1999/XSL/Transform" name="{0}">\n' +
                                      '  <xsl:with-param name="jsx_is_first_panel_row" select="$jsx_is_first_panel_row"/>\n' +
                                      '  <xsl:with-param name="jsx_row_number" select="$jsx_row_number"/>\n' +
                                      '  <xsl:with-param name="jsx_rowbg" select="$jsx_rowbg"/>\n' +
                                      '  <xsl:with-param name="jsx_cdfkey" select="$jsx_cdfkey"/>\n' +
                                      '  <xsl:with-param name="jsx_descendant_index" select="$jsx_descendant_index"/>\n' +
                                      '</xsl:call-template>');

  /**
   * {jsx3.xml.Document} Default <code>xsl:when</code> that is used to call an individual cell value template for a granular, cell-based update.
   * <br/>Wildcards are as follows:
   * <ul><li><b>{0}</b> this will be replaced with the <b>jsxid</b> for the jsx3.gui.Matrix.Column instance conctenated with <b>_value</b></li></ul>
   * @private
   * @jsxobf-clobber
   */
  Matrix.DEFAULT_UPDATE_CELL_VALUE_TEMPLATE = new jsx3.xml.Document().loadXML(
                                              '<xsl:when xmlns:xsl="http://www.w3.org/1999/XSL/Transform" test="$jsx_cell_value_template_id=\'\'{0}\'\'">\n' +
                                              '  <xsl:for-each select="//*[@*[name() = $attrid]=$jsx_record_context]">\n' +
                                              '    <xsl:call-template name="{0}">\n' +
                                              '    </xsl:call-template>\n' +
                                              '  </xsl:for-each>\n' +
                                              '</xsl:when>\n');

  /**
   * {jsx3.util.MessageFormat} Default XSLT structure that is called by the XSLT represented by <code>jsx3.gui.Matrix.DEFAULT_CALL_TEMPLATE</code>. Renders the TD/DIV
   * <br/>Wildcards are as follows:
   * <ul><li><b>{0}</b> this will be replaced with the jsxid for the jsx3.gui.Matrix instance in order to bind the <b>CELL</b> template to the <b>CALL CELL</b> template</li>
   * <li><b>{1}</b> this is replaced with the resolved version of call value template</ul>
   * @private
   * @jsxobf-clobber
   */
  Matrix.DEFAULT_CELL_TEMPLATE = new jsx3.util.MessageFormat(
                                   '<xsl:template xmlns:xsl="http://www.w3.org/1999/XSL/Transform" name="{0}">\n' +

                                   // this tracks the row number and whether first row in a panel/page.
                                   '  <xsl:param name="jsx_is_first_panel_row"/>\n' +
                                   '  <xsl:param name="jsx_row_number"/>\n' +
                                   '  <xsl:param name="jsx_rowbg"/>\n' +
                                   '  <xsl:param name="jsx_cdfkey"/>\n' +
                                   '  <xsl:param name="jsx_descendant_index"/>\n' +
                                   '  <xsl:param name="jsx_selection_bg"><xsl:choose>\n' +
                                   '     <xsl:when test="@*[name() = $attrselected]=1">background-image:url(<xsl:value-of select="$jsx_selection_bg_url"/>);</xsl:when>\n' +
                                   '   </xsl:choose></xsl:param>\n' +

                                   // use a parameter as the formal place-holder for the width. in production, the select value would contain a number that reflects the box model
                                   '  <xsl:param name="jsx_cell_width" select="\'\'{2}\'\'"/>\n' +

                                   // use a parameter as the formal place-holder for the width. in production, the select value would contain a number that reflects the box model
                                   '  <xsl:param name="jsx_true_width">\n' +
                                   '    <xsl:choose><xsl:when test="$jsx_use_categories!=\'\'0\'\' and not(@*[name() = $attrcategory]=\'\'0\'\') and (@*[name() = $attrcategory] or *[$attrchildren=\'*\' or name()=$attrchildren])">{3}</xsl:when><xsl:otherwise><xsl:value-of select="$jsx_cell_width"/></xsl:otherwise></xsl:choose>\n' +
                                   '  </xsl:param>\n' +

                                   // only those TDs in the first row get a width style. Otherwise, the list would need to be repainted when the column widths changed
                                   '  <xsl:param name="jsx_first_row_width_style">\n' +
                                   '    <xsl:choose><xsl:when test="$jsx_is_first_panel_row">width:<xsl:value-of select="$jsx_true_width"/>px;</xsl:when></xsl:choose>\n' +
                                   '  </xsl:param>\n' +

                                   // only those TDs in the first column, with the appropriate 'category' profile will implement a colspan
                                   '  <xsl:param name="jsx_colspan">\n' +
                                   '    <xsl:choose><xsl:when test="$jsx_use_categories!=\'\'0\'\' and not(@*[name() = $attrcategory]=\'\'0\'\') and (@*[name() = $attrcategory] or *[$attrchildren=\'*\' or name()=$attrchildren])"><xsl:value-of select="$jsx_column_count"/></xsl:when><xsl:otherwise>1</xsl:otherwise></xsl:choose>\n' +
                                   '  </xsl:param>\n' +

                                   // the actual template.  This is created by the box profiler and is not available to be edited
                                   '  {1}\n' +
                                   '</xsl:template>');

  /**
   * {jsx3.util.MessageFormat} This snippet is embedded within the td/div tagset, generated via the Box Profile abstraction.  It calls out to the cell value template managed by
   *          the child matrix column instance.
   * <br/>Wildcards are as follows:
   * <ul><li><b>{0}</b> this will be replaced with the jsxid for the jsx3.gui.Matrix instance in order to bind the <b>CALL VALUE</b> template to the <b>VALUE</b> template</li></ul>
   * @private
   * @jsxobf-clobber
   */
  Matrix.DEFAULT_CALL_VALUE_TEMPLATE = new jsx3.util.MessageFormat(
                                       '<xsl:call-template name="{0}">\n' +
                                       '  <xsl:with-param name="jsx_cell_width" select="$jsx_true_width"/>\n' +
                                       '  <xsl:with-param name="jsx_row_number" select="$jsx_row_number"/>\n' +
                                       '  <xsl:with-param name="jsx_descendant_index" select="$jsx_descendant_index"/>\n' +
                                       '</xsl:call-template>');

/* @JSC :: begin DEP */

  /**
   * {String} "Viewing rows {0} to {1} of {2}".
   * <br/>Wildcards are as follows:
   * <ul><li><b>{0}</b> The index position of the first visible on-screen row</li>
   * <li><b>{1}</b> The index position of the last visible on-screen row</li>
   * <li><b>{2}</b> Total count of all records in the list</li></ul>
   * @deprecated  This value is localized.
   */
  Matrix.DEFAULT_INFO_LABEL = "Viewing rows {0} to {1} of {2}";

/* @JSC :: end */

  /**
   * {String} jsxpaintpage. Event to subscribe to each time a page of content is about to be painted on-screen
   * @final @jsxobf-final
   */
  Matrix.ON_PAINT_PAGE = "jsxpaintpage";

  /**
   * {int} Default. All data is painted at once with the outer container.
   * @final @jsxobf-final
   */
  Matrix.PAGING_OFF = 0;

  /**
   * {int} The outer container is first painted and then the entirety of the data is painted during a second pass
   * @final @jsxobf-final
   */
  Matrix.PAGING_2PASS = 1;

  /**
   * {int} The outer container is first painted. Chunked sets of data are painted on-screen during repeated passes until
   *       all data is painted
   * @final @jsxobf-final
   */
  Matrix.PAGING_CHUNKED = 2;

  /**
   * {int} The outer container is first painted. The first and last panels are painted during a second pass. As the user
   *       scrolls, relevant panels are added and unused panels are collected. (NOTE: Requires that row height be fixed.)
   * @final @jsxobf-final
   */
  Matrix.PAGING_PAGED = 3;

  /**
   * {int} The outer container is painted along with any rows which are immediate children of the rendering context and those
   *       descendant rows that have an open path to the context node. All other rows will be fetched when the state for
   *       their on-screen parent row is toggled to open.
   * @final @jsxobf-final
   */
  Matrix.PAGING_STEPPED = 4;

  /**
   * {int} 0
   * @final @jsxobf-final
   */
  Matrix.SELECTION_UNSELECTABLE = 0;

  /**
   * {int} 1 (default)
   * @final @jsxobf-final
   */
  Matrix.SELECTION_ROW = 1;

  /**
   * {int} 2
   * @final @jsxobf-final
   */
  Matrix.SELECTION_MULTI_ROW = 2;

  Matrix.REND_DEEP = "deep";
  Matrix.REND_SHALLOW = "shallow";
  Matrix.REND_HIER = "hierarchical";

  /**
   * {int} 20
   */
  Matrix.DEFAULT_ROW_HEIGHT = 20;

  /**
   * {int} 18. number of panels allowed on-screen before destroying the panel most distant from the current panel index
   */
  Matrix.DEFAULT_PANEL_POOL_COUNT = 5;

  /**
   * {int} 50. number of rows in a given panel
   */
  Matrix.DEFAULT_ROWS_PER_PANEL = 50;

  /**
   * {int} 250. number of milliseconds between the time a new panel is added and the reaper checks for content exceeding <code>jsx3.gui.Matrix.DEFAULT_PANEL_POOL_COUNT</code>
   */
  Matrix.DEFAULT_REAPER_INTERVAL = 250;

  /**
   * {int} 3. number of panels in the paint queue. As new panels are added to the queue to be painted, older, less-relevant panels in the queue are removed
   */
  Matrix.DEFAULT_PANEL_QUEUE_SIZE = 3;

  /**
   * {String}
   */
  Matrix.DEFAULTXSLURL = jsx3.resolveURI("jsx:///xsl/jsxmatrix.xsl");

  /* @jsxobf-clobber */
  /* @Embed(source='../../../xsl/jsxmatrix.xsl', type='xsl') */
  Matrix._XSLRSRC = new jsx3.xml.XslDocument().load(Matrix.DEFAULTXSLURL);

/* @JSC :: begin DEP */

  /**
   * {String}
   * @deprecated  Renamed to <code>DEFAULTXSLURL</code>.
   */
  Matrix.DEFAULT_XSL_URL = Matrix.DEFAULTXSLURL;

/* @JSC :: end */

  /** @package */
  Matrix.SCROLL_INC = 36;

  /** @private @jsxobf-clobber */
  Matrix_prototype._jsxpaintqueue = [];

  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   */
  Matrix_prototype.init = function(strName) {
    this.jsxsuper(strName);
  };

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  Matrix_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    //get the existing box profile and native instance
    var b1 = this.getBoxProfile(true, objImplicit);

    //if the column widths were cached, delete here since about to be reset
    delete this._jsxtruecolumnwidths;

    //determine common values
    var SCROLLSIZE = Box.getScrollSize() + 1;
    var intViewPaneWidth = (this.getScaleWidth() == 1) ? objImplicit.parentwidth - SCROLLSIZE : this._getViewPaneWidth();
    var intHeaderHeight = this.getHeaderHeight(Matrix.DEFAULT_HEADER_HEIGHT);
    //get scrollbar size for the given browser. add 1 pixel to account for the long, 1px child image

    //recalculate outerbox
    b1.recalculate(objImplicit, objGUI, objQueue);

    //recalculate the header box
    var b1a = b1.getChildProfile(0);
    b1a.recalculate({parentwidth:this._getViewPortWidth(),parentheight:intHeaderHeight},(objGUI)?objGUI.childNodes[0]:null, objQueue);
    //don't recalc the div container (what moves), just the dimensions of the table
    var b1b = b1a.getChildProfile(0).getChildProfile(0);
    b1b.recalculate({parentwidth:intViewPaneWidth,parentheight:intHeaderHeight},(objGUI && objGUI.childNodes[0])?html.selectSingleElm(objGUI, 0, 0, 0):null, objQueue);

    //recalculate the body box
    var intBodyHeight = b1.getClientHeight() - intHeaderHeight;
    var b1d = b1.getChildProfile(1);
    b1d.recalculate({parentwidth:this._getViewPortWidth(),parentheight:intBodyHeight},(objGUI)?objGUI.childNodes[1]:null, objQueue);

    var b1dth = b1d.getClientTop() + b1d.getClientHeight();

    //recaluclate the vscroller
    intBodyHeight = b1.getClientHeight() - this.getHeaderHeight(Matrix.DEFAULT_HEADER_HEIGHT);
    var o1f = {};
    o1f.left = b1d.getOffsetWidth() -1;
    o1f.top = 0;
    o1f.height = (b1dth + this.getHeaderHeight(Matrix.DEFAULT_HEADER_HEIGHT)) - (SCROLLSIZE - Box.getScrollSizeOffset("scroll"));
    var b1f = b1.getChildProfile(2);
    b1f.recalculate(o1f,(objGUI)?objGUI.childNodes[2]:null, objQueue);

    //recaluclate the hscroller top-position and width
    var o1g = {};
    o1g.top = (b1dth + this.getHeaderHeight(Matrix.DEFAULT_HEADER_HEIGHT)) - SCROLLSIZE;
    o1g.width = b1d.getClientWidth();
    var b1g = b1.getChildProfile(3);
    b1g.recalculate(o1g,(objGUI)?objGUI.childNodes[3]:null, objQueue);
    var b1ga = b1g.getChildProfile(0);
    var newWidth = (this.getScaleWidth() || (intViewPaneWidth - SCROLLSIZE) <= b1.getClientWidth()) ? 0 : intViewPaneWidth;
    b1ga.recalculate({width:newWidth},(objGUI && objGUI.childNodes[3])?objGUI.childNodes[3].childNodes[0]:null, objQueue);

    //recalculate the hscroller scroll-position and display
    if (objGUI && objGUI.childNodes[3]) {
      if (this.getSuppressHScroller(0) == 1 || this.getScaleWidth() == 1 || b1ga.getClientWidth() <= b1g.getClientWidth()) {
        objGUI.childNodes[3].style.display = "none";
        //always set scroll position to the left origin if no scrollbar exists. Otherwise no way to view the left-most content
        this.setScrollLeft(0);
      } else {
        objGUI.childNodes[3].style.display = "block";
      }
    }

    //recaluclate the corner graphic
    var o1h = {};
    o1h.left = o1f.left + 1;
    o1h.top = (b1dth + this.getHeaderHeight(Matrix.DEFAULT_HEADER_HEIGHT)) - SCROLLSIZE;
    o1h.height = b1.getClientHeight() - o1h.top;
    var b1h = b1.getChildProfile(4);
    b1h.recalculate(o1h,(objGUI && objGUI.childNodes[4])?objGUI.childNodes[4]:null, objQueue);

    //update the box profiles managed by the column children
    var objChildren = this._getDisplayedChildren();
    var objOffsetWidthArray = this._getColumnWidths(b1d.getClientWidth());

    var bUpdateWidths = false;

    //update the widths of the Column children (NOTE: must be synchronous, since these widths will be used by the remainder of this function)
    for (var i = 0; i <objChildren.length; i++) {
      var recalcRst = objChildren[i].updateBoxProfile({parentwidth:objOffsetWidthArray[i],parentheight:intHeaderHeight},
          objGUI ? objChildren[i].getRendered() : null, objQueue);
      bUpdateWidths = bUpdateWidths || (recalcRst == null || recalcRst.w);
    }

    //if the content is actually painted, update...
    if (!bUpdateWidths) {
    } else if (objGUI && objGUI.childNodes[0]) {
      //1) update the header cells
      var objClientWidthArray = [];
      for (var i=0;i<objChildren.length;i++)
        objClientWidthArray.push(objChildren[i].getBoxProfile(true).getPaintedWidth());
      this._updateColumnWidths(objGUI.childNodes[0].childNodes[0],objClientWidthArray);

      //2) update the header cell anchors
      objOffsetWidthArray = [];
      for (var i=0;i<objChildren.length;i++)
        objOffsetWidthArray.push(objChildren[i].getBoxProfile(true).getOffsetWidth());
      this._updateAnchorPosition(objGUI.childNodes[0].childNodes[0],objOffsetWidthArray);

      //3) update the data column widths (when in hierarchical mode, every row gets updated, not just the first)
      objClientWidthArray = [];
      for (var i=0;i<objChildren.length;i++)
        objClientWidthArray.push(objChildren[i].getBoxProfile(true).getChildProfile(1).getPaintedWidth());

      if (this.getRenderingModel() == Matrix.REND_HIER) {
        var objRows = this._getIterableRows({contextnodes:objGUI.childNodes[1].childNodes[0].childNodes});
        this._updateHierarchicalColumnWidths(objRows,objClientWidthArray);
      } else {
        this._updateColumnWidths(objGUI.childNodes[1].childNodes[0],objClientWidthArray);
      }
    } else {
      //LUKE: I can't find where this could cause an infinite loop. set to trace if lockup during resize to track
      LOG.trace("Race condition with view...");
      jsx3.sleep(function() {
        if (this.getParent())
          this.syncBoxProfile(this.getParent().getClientDimensions(this),true);
      },null,this);
    }
    //update auto-scrollers to reflect how the height of the view pane may have changed due to width changes to the columns
    this._updateScrollHeight();
  };

  /**
   * Updates the on-screen left for the resize anchors to reflect updates to the box profile.
   * Note that the resize anchors don't use the box profile to render and update, because
   * their simple layouts are consistent across all browsers.
   * @param objSectionContainer {object} DIV element containing the anchors
   * @param objWidthArray {Array} array of column widths (specifically the 'offset width' of each column)
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._updateAnchorPosition = function(objSectionContainer,objWidthArray) {
    //get sum of column widths
    var intLeft = 0;

    //udpate the width of the section table(s) and contained cells of first row
    for (var i=1;i<objSectionContainer.childNodes.length;i++) {
      var objAnchor = objSectionContainer.childNodes[i];
      intLeft += objWidthArray[i-1];
      objAnchor.style.left = (intLeft - 4) + "px";
    }
  };

  /**
   * Updates the on-screen width for those table/td elements that control width in the instance
   * @param objSectionContainer {object} DIV element containing either the 'header' or 'body' table(s)
   * @param objWidthArray {Array} array of column widths (specifically the 'client width' of each column)
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._updateColumnWidths = function(objSectionContainer,objWidthArray) {
    //get sum of column widths
    var intViewPaneWidth = this._getViewPaneWidth();

    //udpate the width of the section table(s) and contained cells of first row
    for (var i=0;i<objSectionContainer.childNodes.length;i++) {
      //only adjust tables (ignore resize anchors, etc)
      var objTable = objSectionContainer.childNodes[i];
      if (objTable.tagName.toLowerCase() == "table") {
        objTable.style.width = intViewPaneWidth + "px";
        //adjust the TD children of the first TR Iskip if an empty table with no data)
        var objFirstRow = this._getFirstRow(objTable);
/* @JSC */ if (jsx3.CLASS_LOADER.FX3) {
        while(objFirstRow) {
          for (var j=0;j<objFirstRow.childNodes.length;j++) {
            objFirstRow.childNodes[j].style.width = objWidthArray[j] + "px";
          }
          objFirstRow = objFirstRow.nextSibling;
        }
/* @JSC */ } else {
        if (objFirstRow) {
          for (var j=0;j<objFirstRow.childNodes.length;j++) {
            objFirstRow.childNodes[j].style.width = objWidthArray[j] + "px";
          }
        }
/* @JSC */ }
      }
    }
  };

  /**
   * Updates the on-screen width for those table/td elements that control width in the instance
   * @param objWidthArray {Array} array of column widths (specifically the 'client width' of each column)
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._updateHierarchicalColumnWidths = function(objRows,objWidthArray) {
    //get sum of column widths
    var intViewPaneWidth = this._getViewPaneWidth(/*objWidthArray*/);
    var intSpannedWidth = intViewPaneWidth - this._getColumnWidths()[0] + objWidthArray[0];

    for (var i = 0; i < objRows.length; i++) {
      var objRow = objRows[i];
      if (!(objRow && objRow.childNodes)) continue;

      //since table layout is fixed, the table itself must be resized
      var objTable = objRow.parentNode;
      if (objTable.tagName.toLowerCase() != "table") objTable = objTable.parentNode;
      //var intDiff = intViewPaneWidth - parseInt(objTable.style.width);
      objTable.style.width = intViewPaneWidth + "px";

      for (var j=0;j<objRow.childNodes.length;j++) {
        //if this td uses a colspan, use the spanned width, not what the cell would take if its siblings were actually painted
        var intCurWidth = (j==0 && objRow.childNodes[0].getAttribute("jsxcolspan") > 1) ? intSpannedWidth : objWidthArray[j];

        //update the individual widths of each cell in this row
        objRow.childNodes[j].style.width = intCurWidth + "px";
        if (j==0 && this.getRenderNavigators(1) != 0) {
          //update the widths of the nav controller structure
          objTable = objRow.childNodes[j].childNodes[0].childNodes[0];
          var intAdjWidth = intCurWidth - objTable.getAttribute("jsxindent");
          objTable.style.width = Math.max(0, intAdjWidth) + "px";
        }
      }
    }
  };

  /**
   * Returns the true width (px) of the <b>View Pane</b> as shown on-screen--the sum of all column widths once resolved to their true, on-screen values.
   * @param objWidthArray {Array} Optional array containing integers that should be summed
   * @return {int}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getViewPaneWidth = function(objWidthArray) {
    if (!objWidthArray) objWidthArray = this._getColumnWidths();
    return eval(objWidthArray.join("0+")+"0")/10;
  };

  /**
   * Returns an array of the true column widths as integers (pixel units are assumed). If the instance implements the <b>Scale Width</b>
   * property (<code>jsxscalewidth</code>), the values returned from this method will be the adjusted width with specified widths.
   * for each respective column. Those columns with no width specification will be assigned a uniform portion of the remaining width not applied to columns
   * If the Scale Width property is not used, and a given column child does not expose a width property,
   * the default, <code>Column.DEFAULT_COLUMN_WIDTH</code>, will be used.
   * @param intViewPortWidth {int} if passed, this will be used as the port width to calculate from (more-efficiently accounts for borders during updates)
   * @return {Array}
   * @see #getScaleWidth()
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getColumnWidths = function(intViewPortWidth) {
    if (typeof(this._jsxtruecolumnwidths) == "object") {
      return this._jsxtruecolumnwidths.truewidths;
    } else {
      if (!intViewPortWidth) {
        intViewPortWidth = this._getViewPortWidth();
        //decrement the viewport's width according to the width of the body border
        var o1d = {width:1000,height:10};
        var bor = this.getBodyBorder();
        if (bor != null && bor != "") o1d.border = bor;
        intViewPortWidth-=(o1d.width - (new Box(o1d)).getClientWidth());
      }

      //get the width array
      var objWidthArray = [];

      var intTotal = 0;
      var myVal;
      var intWildcard = 0;

      //only assume existence of those children that have a visual display
      var objChildren = this._getDisplayedChildren();

      //the 'priority' array rank-orders columns according to which ones should be shaved first. this only applies when in scalewidth mode
      var objPriority = {percent:[],wildcard:[],pixel:[]};

      //1) get the developer-specified widths and store in an array. Resolve pixel, wildcard, and percentage values to real numbers
      for (var i = 0;i<objChildren.length;i++) {
        var vntWidth = objChildren[i].getWidth();
        if (jsx3.util.strTrim(String(vntWidth)).search(/\d*%/) == 0) {
          objPriority.percent.unshift(i);
          myVal = parseInt((parseInt(vntWidth) / 100) * intViewPortWidth);
        } else if (!isNaN(vntWidth)) {
          objPriority.pixel.unshift(i);
          myVal = Number(vntWidth);
        } else {
          objPriority.wildcard.unshift(i);
          if (this.getScaleWidth()) {
            intWildcard++;
            myVal = "*";
          } else {
            myVal = Matrix.Column.DEFAULT_WIDTH;
          }
        }
        if (!isNaN(myVal)) intTotal += myVal;
        objWidthArray.push(myVal);
      }
      LOG.trace("Matrix Width Recalc, Pass 1 (" + this.getName() + "): " +  objWidthArray);

      //2) adjust the developer-specified values if in  scalewidth mode
      if (this.getScaleWidth()) {

        //2a) evenly distribute what remains in the viewport's width among the wilcard columns
        var intRemaining = intViewPortWidth - intTotal;
        var intLastPortion;
        if (intWildcard && intRemaining >= 0 && parseInt(intRemaining / intWildcard) > Matrix.MINIMUM_COLUMN_WIDTH) {
          //there is sufficient width remaining to distribute among the wildcard columns
          var intTempCard = intWildcard;

          //divide the available space into even amounts
          var intMyPortion = intRemaining / intWildcard;
          if (intMyPortion > parseInt(intMyPortion)) {
            intMyPortion = parseInt(intMyPortion);
            intLastPortion = intRemaining - ((intWildcard - 1) * intMyPortion);
          } else {
            intLastPortion = intMyPortion;
          }

          //replace wildcards
          for (var i=0;i<objWidthArray.length;i++) {
            if (objWidthArray[i] == "*") {
              objWidthArray[i] = (intWildcard == 1) ? intLastPortion : intMyPortion;
              intWildcard--;
            }
          }

          intWildcard = intTempCard;
        } else if (intWildcard) {
          //there are wildcard columns, but no remaining width in the viewport. simply force each wildcard column to the minimum acceptable width
          for (var i=0;i<objWidthArray.length;i++)
            if (objWidthArray[i] == "*")
              objWidthArray[i] = Matrix.MINIMUM_COLUMN_WIDTH;
        }
        LOG.trace("Matrix Width Recalc, Pass 2a (" + this.getName() + "): " +  objWidthArray);

        //2b) if summed width of all columns is greater than what is available in the viewport, start shaving columns
        var intCurTtl = this._getViewPaneWidth(objWidthArray);
        var intExcessWidth = intCurTtl - intViewPortWidth;
        if (intExcessWidth > 0) {

          //2b.1) shave wildcard columns first
          var intShy = intExcessWidth;
          if (objPriority.wildcard.length)
            intShy = this._shaveScaledColumns(objWidthArray,objPriority.wildcard,intExcessWidth);

          //2b.2) shave percentage columns second
          if (objPriority.percent.length && intShy > 0)
            intShy = this._shaveScaledColumns(objWidthArray,objPriority.percent,intShy);

          //2b.3) shave pixel columns third
          if (objPriority.pixel.length && intShy > 0)
            intShy = this._shaveScaledColumns(objWidthArray,objPriority.pixel,intShy);

        }
        LOG.trace("Matrix Width Recalc, Pass 2b (" + this.getName() + "): " +  objWidthArray);
      }

      //3) ensure no column less than the mimimum allowed width (applies to both scalewidth and non-scalewidth modes)
      for (var i=0;i<objWidthArray.length;i++) {
        if (objWidthArray[i] < Matrix.MINIMUM_COLUMN_WIDTH)
          objWidthArray[i] = Matrix.MINIMUM_COLUMN_WIDTH;
      }
      LOG.trace("Matrix Width Recalc, Pass 3 (" + this.getName() + "): " +  objWidthArray);

      //4) make sure to at least fill the viewport by making last column larger (applies ot both scalewidth and non-scalewidth modes)
      var intCurTtl = this._getViewPaneWidth(objWidthArray);
      var intRemaining = intViewPortWidth - intCurTtl;
      if (intRemaining > 0)
        objWidthArray[objWidthArray.length - 1] += intRemaining;
      LOG.trace("Matrix Width Recalc, Pass 4 (" + this.getName() + "): " +  objWidthArray);

      /* @jsxobf-clobber */
      this._jsxtruecolumnwidths = {truewidths:objWidthArray};
      return objWidthArray;
    }
  };

  /**
   * When rendering in scalewidth mode, decrements the width of a set of columns to try and fit the columns into the visible viewport.Returns
   * how much is still left to decrement if it wasn't possible to make this set of columns fit.  A set of columns is defined
   * by the following categories: wildcard, percentage, and pixel.  Columns belonging to these categories are decremented in said order.
   * @param objWidthArray {Array}
   * @param objPriorityArray {Array}
   * @param intExcessWidth {int}
   * @return {int}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._shaveScaledColumns = function(objWidthArray,objPriorityArray,intExcessWidth) {
    //this tracks how much more will need to be shaved still after this pass
    var intShy = 0;

    //get the amount that each wildcard column should be decremented
    var intCurDec = parseInt(intExcessWidth / objPriorityArray.length);

    //loop to decrement each wildard-type column by the given amount
    for (var i=0;i<objPriorityArray.length;i++) {
      //resolve the index of the item in the width array to decrement from
      var intIndex = objPriorityArray[i];

      //make sure totals to 100pct (round last iteration)
      if (i == objPriorityArray.length-1) intCurDec = intExcessWidth - ((objPriorityArray.length - 1) * intCurDec);

      //decrement the column's width
      if ((objWidthArray[intIndex] - intCurDec)  < Matrix.MINIMUM_COLUMN_WIDTH) {
        //this column was already too small and can't be decremented further. track how much was not able to be shaved
        intShy += Matrix.MINIMUM_COLUMN_WIDTH - (objWidthArray[intIndex] - intCurDec);
        objWidthArray[intIndex] = Matrix.MINIMUM_COLUMN_WIDTH;
      } else {
       objWidthArray[intIndex] -= intCurDec;
      }
    }

    return intShy;
  };

  /**
   * Returns the true width of the View Port. Note that this value will be the same as <code>_getViewPaneWidth()</code> when <b>Scale Width</b> is used or
   * when the sum of the column widths resolves to be less than the View Port width.
   * @return {int}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getViewPortWidth = function() {
    var intDrawSpaceWidth = this.getParent().getClientDimensions(this).parentwidth;
    return (this.getSuppressVScroller(0) == 1) ? intDrawSpaceWidth : intDrawSpaceWidth - (Box.getScrollSize());
  };

  /**
   * Gets the implicit object to define the drawspace for a Column child
   * @param objChild {jsx3.app.Model}
   * @return {object} implicit map with named properties: parentwidth, parentheight
   * @private
   */
  Matrix_prototype.getClientDimensions = function(objChild) {
    //column width array only relates to the displayed children (not all model children)
    var intMyIndex = objChild.getDisplayIndex();
    return {parentwidth:(intMyIndex!=null)?this._getColumnWidths()[intMyIndex]:null,
            parentheight:this.getBoxProfile(true).getChildProfile(0).getClientHeight()};
  };

  /**
   * Creates the box model/profile for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @private
   */
  Matrix_prototype.createBoxProfile = function(objImplicit) {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if (this.getParent() && (objImplicit == null || ((isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))))) {
      objImplicit = this.getParent().getClientDimensions(this);

      //if no profile info was passed from the parent, destroy the existing box profile
      this._reset();
    } else if (objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    //get scrollbar size for the given browser. add 1 pixel to account for the long, 1px child image
    var SCROLLSIZE = Box.getScrollSize() + 1;

    //create the outer-most box
    objImplicit.left = 0;
    objImplicit.top = 0;
    objImplicit.width = "100%";
    objImplicit.height = "100%";
    objImplicit.boxtype = "relativebox";
    objImplicit.tagname = "div";
    var b1 = new Box(objImplicit);

    //determine the width to use (aggregate defined by the columns or adjusted to fit within the viewport)
    var intViewPaneWidth = (this.getScaleWidth() == jsx3.Boolean.TRUE) ? this._getViewPortWidth() : this._getViewPaneWidth();

    //create header (div)
    var o1a = {};
    o1a.left = 0;
    o1a.top = 0;
    o1a.height = this.getHeaderHeight(Matrix.DEFAULT_HEADER_HEIGHT);
    o1a.width = "100%";
    o1a.parentwidth = this._getViewPortWidth();
    o1a.boxtype = "box";
    o1a.tagname = "div";
    var bor;
    if ((bor = this.getHeaderBorder()) != null && bor != "") o1a.border = bor;
    var b1a = new Box(o1a);
    b1.addChildProfile(b1a);

    //create the moveable div that will contain the header table (this will be dragged)
    var o1aa = {};
    o1aa.tagname = "div";
    o1aa.boxtype = "box";
    o1aa.top = 0;
    o1aa.left = 0;
    var b1aa = new Box(o1aa);
    b1a.addChildProfile(b1aa);

    //create the header table (div/table)
    var o1b = {};
    o1b.left = 0;
    o1b.top = 0;
    o1b.width = "100%";
    o1b.parentwidth = b1a.getClientWidth();
    o1b.boxtype = "box";
    o1b.tagname = "table";
    var b1b = new Box(o1b);
    b1aa.addChildProfile(b1b);

    //create the header row (div/table/tr)
    var o1c = {};
    o1c.boxtype = "inline";
    o1c.tagname = "tr";
    var b1c = new Box(o1c);
    b1b.addChildProfile(b1c);

    //create the body (the view port)
    var intBodyHeight = b1.getClientHeight() - this.getHeaderHeight(Matrix.DEFAULT_HEADER_HEIGHT);
    var o1d = {};
    o1d.left = 0;
    o1d.top = this.getHeaderHeight(Matrix.DEFAULT_HEADER_HEIGHT);
    o1d.parentwidth = this._getViewPortWidth();
    o1d.width = "100%";
    o1d.parentheight = intBodyHeight;
    o1d.height = "100%";
    o1d.boxtype = "box";
    o1d.tagname = "div";
    if ((bor = this.getBodyBorder()) != null && bor != "") o1d.border = bor;
    var b1d = new Box(o1d);
    b1.addChildProfile(b1d);

    //warn user that the columns in their control may not align as expected since header and body borders are not the same width
    if (this.getHeaderHeight() != 0 && b1a.getBorderWidth() != b1d.getBorderWidth())
      LOG.warn("If the header border and body border do not share the same pixel width, the columns in the matrix may not align as expected (" + this.getName() + ")\nHeader Border (" + this.getHeaderBorder() + ") != Body Border (" + this.getBodyBorder() + ")");

    //create the moveable pane (the view pane). this holds the panels
    var o1e = {};
    o1e.tagname = "div";
    o1e.boxtype = "box";
    o1e.top = 0;
    o1e.left = 0;
    var b1e = new Box(o1e);
    b1d.addChildProfile(b1e);

    var b1dth = b1d.getClientTop() + b1d.getClientHeight();

    //VSCROLLER
    var o1f = {};
    o1f.boxtype = "box";
    o1f.tagname = "div";
    o1f.left = b1d.getOffsetWidth() -1;
    o1f.top = 0;
    o1f.width = SCROLLSIZE;
    o1f.height = (b1dth + this.getHeaderHeight(Matrix.DEFAULT_HEADER_HEIGHT)) - (SCROLLSIZE - Box.getScrollSizeOffset("scroll"));
    var b1f = new Box(o1f);
    b1.addChildProfile(b1f);

    //vscroller-image (long, 1px image that forces scrollbar to appear)
    var o1fa = {};
    o1fa.boxtype = "inline";
    o1fa.tagname = "img";
    o1fa.empty = true;
    o1fa.left = 0;
    o1fa.top = 0;
    o1fa.width = 1;
    o1fa.height = (this.getPagingModel() != Matrix.PAGING_PAGED) ? 0 : (this._getViewPaneHeight() + this.getHeaderHeight(Matrix.DEFAULT_HEADER_HEIGHT) + SCROLLSIZE);
    var b1fa = new Box(o1fa);
    b1f.addChildProfile(b1fa);

    //HSCROLLER
    var o1g = {};
    o1g.boxtype = "box";
    o1g.tagname = "div";
    o1g.left = b1d.getClientLeft();
    o1g.top = (b1dth + this.getHeaderHeight(Matrix.DEFAULT_HEADER_HEIGHT)) - SCROLLSIZE;
    o1g.height = SCROLLSIZE;
    o1g.width = b1d.getClientWidth();
    var b1g = new Box(o1g);
    b1.addChildProfile(b1g);

    //hscroller-image (long, 1px image that forces scrollbar to appear)
    var o1ga = {};
    o1ga.boxtype = "inline";
    o1ga.tagname = "img";
    o1ga.empty = true;
    o1ga.left = 0;
    o1ga.top = 0;
    o1ga.width = ((intViewPaneWidth - SCROLLSIZE) <= b1.getClientWidth()) ? 0 : intViewPaneWidth;
    o1ga.height = 1;
    var b1ga = new Box(o1ga);
    b1g.addChildProfile(b1ga);

    //CORNER GRAPHIC (makes the two scrollbars look like a unified set--also, is there a graphic I could use here???)
    var o1h = {};
    o1h.boxtype = "box";
    o1h.tagname = "div";
    o1h.left = o1f.left + 1;
    o1h.top = (b1dth + this.getHeaderHeight(Matrix.DEFAULT_HEADER_HEIGHT)) - SCROLLSIZE;
    o1h.width = SCROLLSIZE-1;
    o1h.height = b1.getClientHeight() - o1h.top;
    var b1h = new Box(o1h);
    b1.addChildProfile(b1h);

    //jsx3.log("cbp2: " + this.getId() + ":" + this.getName() + (new Date()).valueOf());
    //return the explicit object (e.g., the box profile)
    return b1;
  };

  Matrix.BRIDGE_EVENTS = {};
  Matrix.BRIDGE_EVENTS[Event.MOUSEOVER] = true;
  Matrix.BRIDGE_EVENTS[Event.MOUSEOUT] = true;
  Matrix.BRIDGE_EVENTS[Event.DOUBLECLICK] = true;
  Matrix.BRIDGE_EVENTS[Event.KEYDOWN] = true;
  Matrix.BRIDGE_EVENTS[Event.MOUSEDOWN] = true;
  Matrix.BRIDGE_EVENTS[Event.CLICK] = true;
  Matrix.BRIDGE_EVENTS[Event.MOUSEUP] = true;

  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  Matrix_prototype.paint = function() {
    //jsx3.log("paint1: " + this.getId() + ":" + this.getName() + (new Date()).valueOf());
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //control id (jsxid)
    var sId = this.getId();

    var cn = this.getClassName();

    //configure outermost box
    var b1 = this.getBoxProfile(true);
    b1.setAttributes('id="' + sId + '" class="jsx30matrix' + (cn ? " " + cn : "") + '" ' + this.paintLabel() + this.renderHandler("mouseup", "_onMouseUp"));

    //configure body
    var strEvents = this.renderHandlers(Matrix.BRIDGE_EVENTS, 1);
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    strEvents += this.renderHandler("selectstart", "_ebSelectStart", 1);
/* @JSC */ }

    var b1d = b1.getChildProfile(1);
    b1d.setAttributes('id="' + sId + '_body" class="jsx30matrix_body" ' + strEvents + this.paintIndex());
    var b1e = b1d.getChildProfile(0);
    b1e.setStyles(this.paintBackgroundColor() + this.paintBackground());
    b1e.setAttributes(this.renderHandler(Event.MOUSEWHEEL, "_ebMouseWheel", 2));

    //configure vscroller
    var b1f = b1.getChildProfile(2);
    b1f.setAttributes(this.renderHandler("scroll", "_ebScrollV") + this.renderHandler("mouseover", "_ebMouseOverVScroll") +
                      this.renderHandler("mouseout", "_ebMouseOutVScroll") + this.renderHandler("mousemove", "_ebMouseMoveVScroll") +
                      this.renderHandler("mousedown", "_ebMouseDownV") + html._UNSEL + ' class="jsx30matrix_scrollv" tabindex="-1"');
    //user can choose to not show the vscroller
    var strDis = (this.getSuppressVScroller(0) == 1) ? "display:none;" : "";
    b1f.setStyles("z-index:10;overflow:scroll;" + strDis);
    var b1fa = b1f.getChildProfile(0);
    b1fa.setAttributes('src="' + Block.SPACE + '" alt=""');

    //configure hscroller
    var b1g = b1.getChildProfile(3);
    b1g.setAttributes(this.renderHandler("scroll", "_ebScrollH") + this.renderHandler("mousedown", "_ebMouseDownH") + html._UNSEL + ' class="jsx30matrix_scrollh"');
    //user can choose to not show the hscroller
    strDis = (this.getSuppressHScroller(0) == 1 ||
              this.getScaleWidth() == 1 ||
              b1g.getChildProfile(0).getClientWidth() <= b1g.getClientWidth()) ? "display:none;" : "";
    b1g.setStyles("z-index:10;overflow:auto;" + strDis);
    var b1ga = b1g.getChildProfile(0);
    b1ga.setAttributes('src="' + Block.SPACE + '" alt=""');

    //configure v/h-corner overlay (only used for looks)
    var b1h = b1.getChildProfile(4);
    b1h.setStyles('overflow:hidden;background-color:#e8e8f5;z-index:11;');

    //depending upon the paging model, paint the data synchronously
    var strDataRows = '';
    var intPagingModel = this.getPagingModel(Matrix.PAGING_OFF);
    if (intPagingModel == Matrix.PAGING_OFF || intPagingModel == Matrix.PAGING_STEPPED) {
      if (this._getAutoRow() == 2)
        strDataRows += this._getPanelContent(-1);
      strDataRows += this._getPanelContent(0);
      if (this._getAutoRow() == 1)
        strDataRows += this._getPanelContent(-1);
    }

    //paint descendant masks: text mask, select mask, radio mask, check mask, tbb mask, date mask, time mask, textarea mask, etc)
    var strMasks = this._paintMasks(true);

    //return                //header
    var sEvent = this.renderHandler("mouseout", "_ebMouseOutDropIcon");
    var ss =  b1.paint().join( this._paintHead()  +
                            //body (data)
                            b1d.paint().join(b1e.paint().join(strDataRows + strMasks)) +
                            //v-scroller
                            b1f.paint().join(b1fa.paint().join('')) +
                            //h-scroller
                            b1g.paint().join(b1ga.paint().join('')) +
                            //corner graphic
                            b1h.paint().join('&#160;') +
                            //scroll info label
                            '<div class="jsx30matrix_scroll_info"><span class="jsx30matrix_scroll_info">&#160;</span></div>' +
                            //column resize bar
                            '<div class="jsx30matrix_resize_bar">&#160;</div>' +
                            //'ondrop' icon
                            '<div class="jsx30matrix_drop_icon" ' + sEvent + '>&#160;</div>');
    return ss;
  };

  Matrix_prototype.onAfterPaint = function(objGUI) {
    var intPagingModel = this.getPagingModel(Matrix.PAGING_OFF);
    if (intPagingModel == Matrix.PAGING_OFF || intPagingModel == Matrix.PAGING_STEPPED) {
      this._onPaint();
    } else if(this._getRowCount() || !this._jsxmatrixxmlbind){
      //3.6: added conditional above to not call onPaint unless there is actual data; xmlbinding callback will issue a call to _onPaint when data actually arrives
      jsx3.sleep(this._onPaint, "_onPaint" + this.getId(), this);
    }
  };

  /** @package */
  Matrix_prototype.onAfterRestoreView = function(objGUI) {
    this.synchronizeVScroller();
  };

  /**
   * Paints edit masks. Called by paint and _onPaint.
   * @param bBeforePaint {Boolean}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._paintMasks = function(bBeforePaint) {
    var intPagingModel = this.getPagingModel(Matrix.PAGING_OFF);
    var sync = intPagingModel == Matrix.PAGING_OFF || intPagingModel == Matrix.PAGING_STEPPED;
    if ((bBeforePaint && sync) || (!bBeforePaint && !sync)) {
/* @JSC :: begin BENCH */
      var t1 = new jsx3.util.Timer(Matrix.jsxclass, this);
/* @JSC :: end */

      //only paint during correct phase/per paging model
      var objDChildren = this._getDisplayedChildren();
      var masksToPaint = [];
      for (var i = 0; i < objDChildren.length; i++) {
        var objChild = objDChildren[i];
        var objMasks = objChild.getEditMasks();

        for (var j = 0; j < objMasks.length; j++) {
          var objMask = objMasks[j];
          if (Matrix._initEditMask(objMask, objChild))
            if (objMask.emGetType() == Matrix.EditMask.NORMAL || objMask.emGetType() == Matrix.EditMask.DIALOG)
              masksToPaint.push(objMask);
        }
      }
      var strHTML = '<div id="' + this.getId() + '_masks" class="jsx30matrix_masks">' + this.paintChildren(masksToPaint) + "</div>";
/* @JSC :: begin BENCH */
      t1.log("paint.masks");
/* @JSC :: end */
      return strHTML;
    }

    return "";
  };

  /**
   * Ends any existing edit session and hides the active mask. This is a carryover method from grid.
   */
  Matrix_prototype.resetMask = function() {
    this.endEditSession();
  };

  /**
   * Paints only the data rows.  Call for quick repainting of the data rows when only the source data
   * has changed. Does not recalculate and reprofile the box profile and resulting XSLT. Retains scroll position when possible.
   */
  Matrix_prototype.repaintData = function() {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Matrix.jsxclass, this);
/* @JSC :: end */

    var objVP = this._getViewPane();
    if (objVP) {
      //repaintData always retains scroll position where possible
      var intTop = this.getScrollTop();
      var intLeft = this.getScrollLeft();

      //depending upon the paging model, paint the data and the masks
      var strDataRows = '';
      var intPagingModel = this.getPagingModel(Matrix.PAGING_OFF);
      if (intPagingModel == Matrix.PAGING_OFF || intPagingModel == Matrix.PAGING_STEPPED) {
        this._configurePanelArray();
        if (this._getAutoRow() == 2)
          strDataRows += this._getPanelContent(-1);
        strDataRows += this._getPanelContent(0);
        if (this._getAutoRow() == 1)
          strDataRows += this._getPanelContent(-1);
//
//        strDataRows += this._paintMasks(true);
      }

      // Cache mask element so as not to repaint it
      var objDoc = this.getDocument(objVP);
      var objMasks = objDoc.getElementById(this.getId() + '_masks');
      // QUESTION: Not sure if this will expose IE bug described here: http://support.microsoft.com/kb/925014
      if (objMasks) {
        objMasks.style.display = "none";
        objVP.parentNode.appendChild(objMasks);
      }

      objVP.innerHTML = strDataRows;

      //call _onpaint to configure, format, fetch data (if necessary), etc
      this._onPaint(false, true);

      // Restore mask element
      if (objMasks) {
        objMasks.style.display = "";
        objVP.appendChild(objMasks);
      }

      //reposition the scrollbar based on the new data that will have been painted
      jsx3.sleep(function() {this._updateScrollOnPaint(intTop,intLeft);},null,this);
    }

/* @JSC :: begin BENCH */
    t1.log("repaint.data");
/* @JSC :: end */
  };

  /**
   * Called by repaint/repaintData.  Ensures vertical scroller reflects the record count and is in the correct scrolltop position
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._updateScrollOnPaint = function(intTop,intLeft) {
    //always recalculate the scrollbars (they're only explicit when in paging mode)
    var objViewPane = this._getViewPane();
    if (intTop == null) intTop = this.getScrollTop();
    var intVPHeight = objViewPane ? objViewPane.offsetHeight : 0;
    if (intVPHeight < intTop) {
      this.setScrollTop(intVPHeight);
    } else {
      this.setScrollTop(intTop);
    }
    this.setScrollLeft(intLeft ? intLeft : 0);
    this._updateScrollHeight(objViewPane);
  };

  /**
   * Paints the header row for improved runtime efficiency. For example, a minor text change to a label in a header row
   * shouldn't force the entire table to repaint.
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._paintHead = function() {
    var sId = this.getId();
    var b1 = this.getBoxProfile(true);
    var intHeaderHeight = this.getBoxProfile(true).getChildProfile(0).getClientHeight();

    //<div
    var b1a = b1.getChildProfile(0);
    b1a.setAttributes('id="' + sId + '_head" class="jsx30matrix_head"');

   //<div (scrolls in sync with the H-Scroller)
    var b1aa = b1a.getChildProfile(0);

    //<table
    var b1b = b1aa.getChildProfile(0);
    b1b.setAttributes('cellspacing="0" cellpadding="0" class="jsx30matrix_head_table"');

    //<tr
    var b1c = b1b.getChildProfile(0);

    //<td[]
    var cells = [];
    var objWidthArray = this._getColumnWidths();
    var objChildren = this._getDisplayedChildren();
    for (var i = 0; i < objChildren.length; i++) {
      //update the box profile for the header cell. this is how the true VIEW height is set while jsxwidth holds the MODEL value
      //pass token that says this is positional (left/top).  since width/height are ctually being passed, it will stop any unnecessary recalculations
      objChildren[i].syncBoxProfileSync({parentwidth:objWidthArray[i],parentheight:intHeaderHeight}, null);
      cells.push(objChildren[i].paint());
    }

    //final composite
    var strHTML = b1a.paint().join(b1aa.paint().join(b1b.paint().join(b1c.paint().join(cells.join(''))) + this._paintResizeAnchors(objChildren)));
    return strHTML;
  };

  /**
   * Repaints the header row for improved runtime efficiency. For example, a minor text change to a label in a header row shouldn't repaint the entirety of the instance
   */
  Matrix_prototype.repaintHead = function() {
    //TO DO: make sure to account for scrollleft position of existing head
    var objDoc = this.getDocument();
    var objHeader = objDoc.getElementById(this.getId() + '_head');
    if (objHeader) {
    var strHTML = this._paintHead();
      html.setOuterHTML(objHeader, strHTML);
    }
  };


  /**
   * Returns the HTML required to draw the on-screen resize anchors
   * @private
   * @jsxobf-clobber-shared
   */
  Matrix_prototype._doStartReorder = function(objEvent,objGUI) {
    var objColumnChild = this.getServer().getJSXById(objGUI.id);
    var intDisplayIndex = objColumnChild.getDisplayIndex();
    this._setActiveColumnIndex(intDisplayIndex);

    if (objEvent.leftButton() && intDisplayIndex >= this.getFixedColumnIndex(0) && this.getCanReorder() != jsx3.Boolean.FALSE) {
      //this is a reorder event
      Event.publish(objEvent);

      //create a ghost cell that is a copy of the header just moused down on; bind this to the mousemove listener to simulate a reorder
      var strGhost = '<table id="' + this.getId() + '_ghost" cellspacing="0" cellpadding="0" class="jsx30matrix_ghost" style="width:' + parseInt(objGUI.offsetWidth) + 'px;"><tr>' + html.getOuterHTML(objGUI) + '</tr></table>';
      var objDiv = this.getRendered(objEvent).childNodes[0].childNodes[0];
      html.insertAdjacentHTML(objDiv,"BeforeEnd",strGhost);
      var objGhost = objDiv.lastChild;

      //set the left position for the ghost cell
      var objWidthArray = this._getColumnWidths();
      var intLeft = 0;
      for (var i=0;i<this._getActiveColumnIndex();i++)
        intLeft += objWidthArray[i];
      objGhost.style.left = intLeft + "px";
      /* @jsxobf-clobber */
      this._jsxstartleft = intLeft;

      //the resize needs to be constrained (top:0)
      var viewPortWidth = this._getViewPortWidth();
      var viewPaneWidth = this._getViewPaneWidth();
      var objMtx = this;
      var hScroll = objMtx.getRendered().childNodes[3];
      var hasHScroll = (hScroll.style.display != "none");
      var intScrollLeft = this.getScrollLeft();
      var xMax = hScroll.scrollWidth - hScroll.clientWidth;
      Interactive._beginMoveConstrained(objEvent,objGhost,function(x,y) {
        if(viewPaneWidth > 0 && hasHScroll) {
          //use a multiplier (the ratio of the full width per the visible width) to amplify the horizontal scroll position
          var addX = parseInt(((x - intScrollLeft) / viewPortWidth) * viewPaneWidth);
          // addX should never be bigger than max scroll left
          addX = (addX > xMax) ? xMax : addX;
          objMtx.setScrollLeft(addX);
          x = x + addX - intScrollLeft;
        }
        return [x,0];
      });
      Event.subscribe(Event.MOUSEUP, this, "_onDoneReorder");
    } else if (objEvent.rightButton()) {
      //user right-moused-up on the list. show context menu if relevant
      var strMenu = objColumnChild.getMenu();
      if (strMenu) {
        //resolve the menu (must be owned by same server)
        var objMENU = objColumnChild._getNodeRefField(strMenu);
        if (objMENU != null) {
          //persist the cdf id and column instance and fire menu event
          var objContext = {objEVENT:objEvent, objMENU:objMENU};
          var vntResult = objColumnChild.doEvent(Interactive.MENU, objContext);
          if (vntResult !== false) {
            //if the context menu object was resolved to a different menu instance replace here
            if (vntResult instanceof Object && vntResult.objMENU instanceof jsx3.gui.Menu)
              objMENU = vntResult.objMENU;
            objMENU.showContextMenu(objEvent,objColumnChild);
          }
        }
      }
    }
  };

// ***********************************************+
// ************** COLUMN SORT LOGIC **************|
// ***********************************************+

  /**
   * called when the drag completes (mouse up)
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._onDoneReorder = function(objEvent) {
    //end the event and unsubscribe
    jsx3.EventHelp.reset();
    Event.unsubscribe(Event.MOUSEUP, this, "_onDoneReorder");

    //get the left position and remove the ghost object
    var objGhost = this.getRendered(objEvent.event).childNodes[0].childNodes[0].lastChild;
    var intGhostLeft = parseInt(objGhost.style.left);
    html.removeNode(objGhost);

    //get the index of the column being moved (resolve the display index (view) to the dom index (model))
    //var objChildren = this.getDescendantsOfType(Painted, true);
    var objDisplayedChildren = this._getDisplayedChildren();
    var objMovedChild = objDisplayedChildren[this._getActiveColumnIndex()];
    //var objMoveIndex = jsx3.util.arrIndexOf(objChildren, objMovedChild);

    if (intGhostLeft == this._jsxstartleft) {
      //first validate that the matrix instance even supports sorting at all
      if (this.getCanSort() != jsx3.Boolean.FALSE)
        this._doSort(objEvent.event);
    } else {
      //reorder event
      if (this.getCanReorder() != jsx3.Boolean.FALSE) {
        var objWidthArray = this._getColumnWidths();
        var intLeft = 0;
        for (var i=0;i<objDisplayedChildren.length;i++) {
          if (intLeft >= intGhostLeft) {
            var objPrecededChild = objDisplayedChildren[i];
            //var objPrecedeIndex = jsx3.util.arrIndexOf(objChildren, objPrecededChild);
            this._reorderColumns(objEvent.event,objMovedChild,objPrecededChild);
            return;
          }
          intLeft += objWidthArray[i];
        }
        this._reorderColumns(objEvent.event,objMovedChild,objDisplayedChildren[objDisplayedChildren.length-1],true);
      }
    }
  };

  /**
   * Called by _doSort. Determines the sort path for the column that initiated the sort event
   * @param objColumn {jsx3.gui.Matrix.Column} column to get sort path for
   * @return {String} path
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getSortPath = function(objColumn) {
    return objColumn.getSortPath();
  };

  /**
   * Called by _doSort. Determines the data type for the column that initiated the sort event
   * @param objColumn {jsx3.gui.Matrix.Column} column to get sort path for
   * @return {String} one of: jsx3.gui.Matrix.Column.TYPE_TEXT or jsx3.gui.Matrix.Column.TYPE_NUMBER
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getSortType = function(objColumn) {
    return objColumn.getSortDataType();
  };

  /**
   * Called once it is determined that this is a sort, not a reorder. Gets the index of the column
   * that would be the new 'sort column', fires the 'before sort' event, sets the new index, and then sorts
   * @param objEvent {jsx3.gui.Event}
   * @private
   * @jsxobf-clobber-shared
   */
  Matrix_prototype._doSort = function(objEvent) {
    var objDisplayedChildren = this._getDisplayedChildren();
    var objSortChild = objDisplayedChildren[this._getActiveColumnIndex()];

    //make sure the specific child supports sorting
    if (objSortChild && objSortChild.getCanSort() != jsx3.Boolean.FALSE && this.getCanSort() != jsx3.Boolean.FALSE) {
      //stop any pending paint events from happening by resetting paint queue
      this._resetPaintQueue();

      //get the proposed sort path, sort type, and sort direction
      //var intRealIndex = jsx3.util.arrIndexOf(this.getDescendantsOfType(Painted, true), objSortChild);
      var strSortPath = this._getSortPath(objSortChild);
      var strSortType = this._getSortType(objSortChild);

      //fire the 'before sort' event
      var vntReturn = this.doEvent(Interactive.BEFORE_SORT,
          {objEVENT:objEvent, objCOLUMN:objSortChild, strSORTPATH:strSortPath, strSORTTYPE:strSortType});

      //TO DO: allow user to edit values for type and path
      //TO DO: how to handle all possible sort variants??? (nested sorts, etc)

      //proceed with the actual sorting if not cancelled
      if (vntReturn !== false) {
        if (vntReturn != null && typeof(vntReturn) == "object") {
          if (vntReturn.objCOLUMN != null) {
            objSortChild = vntReturn.objCOLUMN;
            strSortPath = this._getSortPath(objSortChild);
            strSortType = this._getSortType(objSortChild);
          }
        }

        //set the sort type and path and then sort
        this.setSortPath(strSortPath);
        this.setSortType(strSortType);
        this.doSort();

        //fire the aftersort event
        this.doEvent(Interactive.AFTER_SORT,
          {objEVENT:objEvent, objCOLUMN:objSortChild, strSORTPATH:strSortPath, strSORTTYPE:strSortType,
              strDIRECTION:this.getSortDirection(), _gipp:1});
      }
    }
  };

  /**
   * Sorts according to the current sort path. If no sort direction is specified, the value will be toggled.
   * @param intSortDir {String} <code>jsx3.gui.Matrix.SORT_ASCENDING</code> or <code>jsx3.gui.Matrix.SORT_DESCENDING</code>.
   * @see #SORT_ASCENDING
   * @see #SORT_DESCENDING
   */
  Matrix_prototype.doSort = function(intSortDir) {
    //update the sort direction
    if (intSortDir) {
      this.setSortDirection(intSortDir);
    } else {
      //toggle sort direction when the sorted column is re-clicked
      this.setSortDirection((this.getSortDirection() == Matrix.SORT_ASCENDING) ? Matrix.SORT_DESCENDING : Matrix.SORT_ASCENDING);
    }

    //toggle the sort designation icons for each column
    var curSortPath = this.getSortPath();
    var objDisplayedChildren = this._getDisplayedChildren();
    for (var i=0;i<objDisplayedChildren.length;i++)
      objDisplayedChildren[i]._applySortIcon(objDisplayedChildren[i].getSortPath() == curSortPath);

    //repaint to reflect the change; reset scroll, since sort makes irrelevant
    delete this._jsxcurscrolltop;
    this.repaintData();
  };

  /**
   * Returns the name of the CDF attribute to sort on. If no value is set an empty string is returned by default.
   * @return {String}
   * @see jsx3.gui.Matrix.Column#getSortPath()
   */
  Matrix_prototype.getSortPath = function() {
    return (this.jsxsortpath == null) ? "" : this.jsxsortpath;
  };

  /**
   * Sets the name of the CDF attribute to sort on. The records in the data source of this matrix are sorted
   * on this attribute before being painted to screen.
   * @param strAttr {String}
   * @see jsx3.gui.Matrix.Column#setSortPath()
   */
  Matrix_prototype.setSortPath = function(strAttr) {
    this.jsxsortpath = strAttr;
  };

  /**
   * Returns the data type to be used for sorting this list. This value is either the one explicitly set with
   * <code>setSortType()</code> or the data type of the current sort.
   * @return {String} <code>jsx3.gui.Matrix.Column.TYPE_TEXT</code> or <code>jsx3.gui.Matrix.Column.TYPE_NUMBER</code>
   */
  Matrix_prototype.getSortType = function() {
    return (this.jsxsorttype == null) ? Matrix.Column.TYPE_TEXT : this.jsxsorttype;
  };

  /**
   * Sets the data type for the list. This explicit value will override any column data type if set. If it is not set
   * the data type specific to the sort column is used for sorting.
   * @param DATATYPE {String} data type for this column's data; ; valid types include: jsx3.gui.Matrix.Column.TYPE_TEXT and jsx3.gui.Matrix.Column.TYPE_NUMBER
   */
  Matrix_prototype.setSortType = function(DATATYPE) {
    this.jsxsorttype = DATATYPE;
  };

  /**
   * Returns the direction (jsx3.gui.Matrix.SORT_ASCENDING or jsx3.gui.Matrix.SORT_DESCENDING) for the sorted column; if no direction specified, ascending is returned
   * @return {String} one of: jsx3.gui.Matrix.SORT_ASCENDING or jsx3.gui.Matrix.SORT_DESCENDING
   */
  Matrix_prototype.getSortDirection = function() {
    return (this.jsxsortdirection == null) ? Matrix.SORT_ASCENDING : this.jsxsortdirection;
  };

  /**
   * Sets the direction (ascending or descending) for the sorted column.
   * @param intSortDir {String} one of: jsx3.gui.Matrix.SORT_ASCENDING or jsx3.gui.Matrix.SORT_DESCENDING
   */
  Matrix_prototype.setSortDirection = function(intSortDir) {
    this.jsxsortdirection  = intSortDir;
  };

  /**
   * Returns whether the list will render with sortable columns. If <code>null</code> or <code>jsx3.Boolean.TRUE</code>, the instance is sortable.
   * @return {int}
   */
  Matrix_prototype.getCanSort = function() {
    return this.jsxsort;
  };

  /**
   * Sets whether the list will render with sortable columns.
   * @param SORT {int} one of <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  Matrix_prototype.setCanSort = function(SORT) {
   this.jsxsort = SORT;
  };

// ***********************************************+
// ************* COLUMN REORDER LOGIC ************|
// ***********************************************+

  /**
   * Rearranges the column children at the end of a reorder event.
   * @param objEvent {jsx3.gui.Event}
   * @param objMoveChild {jsx3.app.Model} the one being moved
   * @param objPrecedeChild {jsx3.app.Model} the one to insert before
   * @param bAppend {Boolean} is append
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._reorderColumns = function(objEvent,objMoveChild,objPrecedeChild,bAppend) {
    //cancel if there are frozen columns on the left that will be involved
    var displayedChildren = this._getDisplayedChildren();
    var intOldIndex = jsx3.util.arrIndexOf(displayedChildren, objMoveChild);
    var intPIndex = jsx3.util.arrIndexOf(displayedChildren, objPrecedeChild);
    var intFIndex = this.getFixedColumnIndex(-1);
    var intOriginalIndex = objMoveChild.getChildIndex();

    //exit if a frozen column was moved
    if (intOldIndex <= intFIndex) return;
    //adjust where the drop occurred if the precede column was in the frozen range
    if (intPIndex < intFIndex) objPrecedeChild = this._getDisplayedChildren()[intFIndex];
    if (!objPrecedeChild) return;

    var intTop = this.getScrollTop();
    var intLeft = this.getScrollLeft();

    //attempt the insertBefore
    var bSuccess = bAppend ?
                   (this.adoptChild(objMoveChild,true) || 1) :
                   this.insertBefore(objMoveChild,objPrecedeChild,true);

    //reposition the scrollbar based on the new data that will have been painted
    jsx3.sleep(function() {this._updateScrollOnPaint(intTop,intLeft);},null,this);

    //fire the reorder event
    if (bSuccess) {
      var intNewIndex = objMoveChild.getChildIndex();
      //fire the aftersort event
      this.doEvent(Interactive.AFTER_REORDER, {objEVENT:objEvent, intOLDINDEX:intOriginalIndex, intNEWINDEX:intNewIndex, _gipp:1});
    }
  };

  /**
   * Instance override
   * @param objChild {jsx3.app.Model} the child to adopt
   * @param bRepaint {boolean} if <code>true</code> or <code>null</code>, the object being adopted will be added to
   *    the parent's view via the parent's <code>paintChild()</code> method.
   *    This parameter is made available for those situations where a loop is executing and multiple
   *    objects are being adopted.  As view operations are the most CPU intensive, passing <code>false</code>
   *    while looping through a collection of child objects to adopt will improve performance. After the
   *    last child is adopted, simply call <code>repaint()</code> on the parent to immediately synchronize the view.
   * @param-private bForce {boolean} if true, the adoption is forced, even if the parent/child don't accept such adoptions (<code>onSetChild()</code> and <code>onSetParent()</code> will still be called)
   *
   * @see #setChild()
   */
  Matrix_prototype.adoptChild = function(objChild, bRepaint, bForce) {
    this.jsxsuper(objChild, false, bForce);
    this._reset();
    if (bRepaint !== false) this.repaint();
  };

  /**
   * Assigns objMoveChild as the previousSibling of objPrecedeChild
   * @param objMoveChild {jsx3.app.Model} the one being moved
   * @param objPrecedeChild {jsx3.app.Model} the one to insert before
   * @param bRepaint {boolean} if <code>false</code> the repaint will be suppressed
   */
  Matrix_prototype.insertBefore = function(objMoveChild,objPrecedeChild,bRepaint) {
    //pass false to ensure no repaint yet
    var bSuccess = this.jsxsuper(objMoveChild,objPrecedeChild,false);
    if (bSuccess) {
      this._reset();
      //force repaint here now that the xslt is reset
      if (bRepaint != false) this.repaint();
    }
    return bSuccess;
  };

  /**
   * Returns whether the column children can be reordered via user interaction. If no value is supplied
   * the isntance will allow child columns to be reordered.
   * @return {int} one of: jsx3.Boolean.TRUE or jsx3.Boolean.FALSE
   */
  Matrix_prototype.getCanReorder = function() {
    return this.jsxreorder;
  };

  /**
   * Sets whether the columns in the list can be re-ordered via user interaction with the VIEW
   * @param REORDER {int} one of: jsx3.Boolean.TRUE or jsx3.Boolean.FALSE
   */
  Matrix_prototype.setCanReorder = function(REORDER) {
   this.jsxreorder = REORDER;
  };

// ***********************************************+
// ****************** FOCUS LOGIC ****************|
// ***********************************************+

  /**
   * Applies focus to the on-screen row that corresponds to the element in the CDF source document identified by
   * <code>strCdfId</code>. Note that since only cells can receive focus, this method will apply focus to the
   * first cell child in the row.
   * @param strCdfId {String} jsxid property for CDF record
   * @see #focusCellByIndex()
   */
  Matrix_prototype.focusRowById = function(strCdfId) {
    this.focusCellByIndex(strCdfId,0);
  };

  /**
   * Applies focus to the on-screen cell that corresponds to the intersection of the element in the CDF source
   * document identified by <code>strCdfId</code>, and the first column mapped to <code>strAttName</code>.
   * @param strCdfId {String} jsxid property for CDF record
   * @param strAttName {String} attribute name on the CDF record. For example, <code>jsxtext</code>
   */
  Matrix_prototype.focusCellById = function(strCdfId,strAttName) {
    if(this.getRenderingModel() == Matrix.REND_HIER)
      this.revealRecord(strCdfId);

    var objCell = this._getCellById(strCdfId,strAttName);
    if (objCell) {
        html.focus(objCell);
    } else {
      //handle if the cell is missing due to pagination
      if(this._loadPagedCell(strCdfId))
        jsx3.sleep(function() {
          jsx3.sleep(function() {
          this.focusCellById(strCdfId,strAttName);
          },"focusdelay",this);
        },"focusdelay",this);
    }
  };


  /**
   * Applies focus to the on-screen cell that corresponds to the intersection of
   * the element in the CDF source document identified by <code>strCdfId</code>, and the cell at the given index.
   * @param strCdfId {String} jsxid property for CDF record
   * @param intCellIndex {int} zero-based index of cell (on-screen).
   */
  Matrix_prototype.focusCellByIndex = function(strCdfId,intCellIndex) {
    if(this.getRenderingModel() == Matrix.REND_HIER)
      this.revealRecord(strCdfId);

    var objCell = this._getCellByIndex(strCdfId,intCellIndex);
    if (objCell) {
        html.focus(objCell);
    } else {
      //handle if the cell is missing due to pagination
      if(this._loadPagedCell(strCdfId))
        jsx3.sleep(function() {
          jsx3.sleep(function() {
            this.focusCellByIndex(strCdfId,intCellIndex);
          },"focusdelay",this);
        },"focusdelay",this);
    }
 };

  /**
   * Scrolls the matrix to the correct scroll position to reveal a record not visible due to pagination
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._loadPagedCell = function(strCdfId) {
    if(this.getPagingModel() == Matrix.PAGING_PAGED) {
      var objIds = this.getSortedIds();
      var maxLen = objIds.length;
      for(var i =0;i<maxLen;i++) {
        if(objIds[i] == strCdfId) {
          this.setScrollTop(this.getRowHeight(Matrix.DEFAULT_ROW_HEIGHT) * i);
          this._jsxcurscrolltop = this.getRowHeight(Matrix.DEFAULT_ROW_HEIGHT) * i;
          this._getPaintQueue().unshift({index:this._getActivePanelIndex()});
          this._paintQueuedPanels();
          return true;
        }
      }
    }
    return false;
  };

  /**
   * Called by focus event on TD
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._ebonfocus = function(objEvent, objGUI) {
    this._handleFocusEvent(objEvent,objGUI,true);
    this._scrollIntoView(objGUI);
  };

  /**
   * Called by blur event on TD
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._ebonblur = function(objEvent, objGUI) {
    ;
  };

  /**
   * Returns the CSS string to apply to a Row/Cell when it has focus
   * @param-private strDefault {String} The default value to use if null (Matrix.FOCUS_STYLE)
   * @return {String}
   */
  Matrix_prototype.getFocusStyle = function(strDefault) {
    return (this.jsxfocusstyle) ? this.jsxfocusstyle : ((strDefault) ? strDefault : null);
  };

  /**
   * Sets the CSS string to apply to a Row/Cell when it has focus. NOTE: Passing
   * styles that affect position, left, top, width, height, border, background-image, padding, and margin
   * (those reserved by the class) can have undesired effects.
   * @param strCSS {String} Valid CSS. For example: font-weight:bold;color:orange;
   */
  Matrix_prototype.setFocusStyle = function(strCSS) {
    delete this._jsxfocusstyle;
    this.jsxfocusstyle = strCSS;
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._applyFocusStyle = function(objGUI,bApply) {
    //applies the resolved styles; caches for performance
    if (typeof(this._jsxfocusstyle) != "object")
      /* @jsxobf-clobber */
      this._jsxfocusstyle = this._resolveStyle(this.getFocusStyle(Matrix.FOCUS_STYLE));
    this._applyStyle(objGUI,this._jsxfocusstyle,bApply);
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._resolveStyle = function(strStyles) {
    //converts a string of styles to a resolved object
    var re = /(-\S)/gi;
    var objResolved = {};
    var objStyles = strStyles.split(";");
    for (var i=0;i<objStyles.length;i++) {
      var curStyle = objStyles[i] + "";
      var objStyle = curStyle.split(":");
      if (objStyle && objStyle.length == 2) {
        var strStyleName = objStyle[0].replace(re,function($0,$1) {
                                                    return $1.substring(1).toUpperCase();
                                                  });
        objResolved[strStyleName] = objStyle[1];
      }
    }
    return objResolved;
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._applyStyle = function(objGUI,objStyles,bApply) {
    //toggles the application of a set of one or more styles
    if (bApply)
      for (var p in objStyles) objGUI.style[p] = objStyles[p];
    else
      for (var p in objStyles) objGUI.style[p] = "";
  };

  /**
   * Returns ID of the TD that has focus
   * @return {String}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getFocusContext = function() {
    return this._jsxfocuscontext;
  };

  /**
   * Sets ID of the TD that has active focus
   * @param strId {String}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._setFocusContext = function(strId) {
    //apply any custom styles to denote the event
    if (this._jsxfocuscontext != strId) {
      var objGUI = this._getFocusObject();
      if (objGUI)
        this._applyFocusStyle(objGUI,false);
    }

    /* @jsxobf-clobber */
    this._jsxfocuscontext = strId;
  };

  /**
   * Removes the focus style from whichever cell is designated to have focus context. Once focus context
   * is applied to the active cell in a matrix, the focus style will continue to be applied to
   * the active cell until another cell is set as the active cell or the Matrix is repainted via
   * a call to repaint or repaintData.
   */
  Matrix_prototype.resetFocusContext = function(strId) {
    this._setFocusContext();
  };

  /**
   * Returns instance of the TR or TD that has focus
   * @return {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getFocusObject = function() {
    return this.getDocument().getElementById(this._getFocusContext());
  };

  /**
   * Called by the onFocus bridge handler. updates the focus context and then processes the impact on the selection state
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._handleFocusEvent = function(objEvent,objGUI,bWasFocus) {
    this._cleanUpEditSession(objEvent);

    //explicitly give focus to the cell, but only if it doesn't have a persistent edit mask like a checkbox or button
    var bApply = true;
    var objDChildren = this._getDisplayedChildren();
    var objChild = objDChildren[objGUI.cellIndex];
    var objMasks = objChild.getEditMasks();
    for (var j = 0; j < objMasks.length; j++) {
      var objMask = objMasks[j];
      if (Matrix._initEditMask(objMask, objChild)) {
        if (objMask.emGetType() != Matrix.EditMask.NORMAL) {
          bApply = false;
          break;
        }
      }
    }
    if (!bWasFocus && bApply) html.focus(objGUI);

    //store the id for the item that just got focus; do not store obj ref to the gui element
    this._setFocusContext(objGUI.id);

    //apply any custom styles to denote the event
    this._applyFocusStyle(objGUI,true);

//    //when a focus event happens, process its impact on selection state
    this._handleSelectionEvent(objEvent,objGUI);
  };

// ***********************************************+
// ****************** EXECUTE LOGIC **************|
// ***********************************************+

  Matrix_prototype._ebDoubleClick = function(objEvent, objGUI) {
    this._doExecute(objEvent);
  };

  /**
   * Called by dbl-click or enter event
   * @param objEvent {jsx3.gui.Event}
   * @param strRecordIds {Array<String>}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._doExecute = function(objEvent, strRecordIds) {
    if (strRecordIds == null) strRecordIds = this.getSelectedIds();

    for (var i=0; i < strRecordIds.length; i++) {
      var id = strRecordIds[i];
      var objNode = this.getRecordNode(id);
      if (this._cdfav(objNode, "unselectable") == "1") continue;
      this.eval(this._cdfav(objNode, "execute"), this._getEvtContext({strRECORDID:id}));
    }

    if (strRecordIds.length)
      this.doEvent(Interactive.EXECUTE, {objEVENT:objEvent, strRECORDID:strRecordIds[0], strRECORDIDS:strRecordIds});
  };

  /**
   * Evaluates the JavaScript code in the <code>jsxexecute</code> attribute of one CDF record of this list.
   * @param strRecordId {String} the jsxid of the CDF record to execute.
   */
  Matrix_prototype.executeRecord = function(strRecordId) {
    var objNode = this.getRecordNode(strRecordId);
    if (objNode)
      this.eval(this._cdfav(objNode, "execute"), this._getEvtContext({strRECORDID:strRecordId}));
  };

// ***********************************************+
// ************** SELECTION LOGIC ****************|
// ***********************************************+

  /**
   * Called by _handleFocusEvent
   * @param objEvent {jsx3.gui.Event}
   * @param objGUI {HTMLElement} TD
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._handleSelectionEvent = function(objEvent,objGUI) {
    var intSelectionType = this.getSelectionModel(Matrix.SELECTION_ROW);
    var objContext = this._getRowCellContext(objGUI);
    var objTD = objContext.cell;
    var intIndex = (objTD) ? objTD.cellIndex : null;
    var objTargetRow = objContext.row;
    var strId = objTargetRow.getAttribute("jsxid");
    var bAuto = this._getAutoRow() && this._isAutoRow(objTargetRow);

    //the autoappend row does not support the selection event
    if (!bAuto) {
      if (this._getCtrlKeys().ctrl) {
        //set this item as the anchor
        this._setSelectionAnchor(strId);

        //treat the ctrl key like a toggle enabler
        if (this.isRecordSelected(strId)) {
          this._doDeselect(objEvent, strId, null);
        } else {
          this._doSelect(objEvent, strId, objTargetRow, true, intIndex);
        }
      } else if (this._getCtrlKeys().shift) {
        //find the 'anchor': the last row clicked without shift or ctrl
        var strAnchorId = this._getSelectionAnchor();
        if (strAnchorId) {
            this._doSelectRange(objEvent, objTargetRow, intIndex);
        } else {
          //no existing anchor, even though the shift key is being depressed; set active item as the anchor
          this._setSelectionAnchor(strId);

          //process normally (basically a single selection)
          this._doSelect(objEvent, strId, null, false, intIndex);
        }
      } else {
        //set this item as the anchor
        this._setSelectionAnchor(strId);

        //process normally (basically a single selection)
        if (!this.isRecordSelected(strId))
          this._doSelect(objEvent, strId, null,false, intIndex);
      }
    }

    //conclude the selection event by applying a given edit mask for the given cell
    this._handleEditEvent(objEvent, objTD, this._getDisplayedChildren()[intIndex], bAuto);

    //remove cached ctrl-key state; cached state is used due to delays used in focus > select > edit flow.  Since the evnet
    //that spawns the flow is lost by the time step 2 is reached caching the ctrl-key state allows for the user's original
    //intent to be persisted.
    delete this._jsxeventclone;
  };

  /**
   * Gets cached/resolved version of the selection bg to avoid unnecessary cycles
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getSelectionBG = function() {
    if (!this._jsxselectionbg)
      /* @jsxobf-clobber */
      this._jsxselectionbg = {bg:this.getServer().resolveURI(this.getSelectionBG(Matrix.SELECTION_BG))};
    return this._jsxselectionbg.bg;
  };

  /**
   * Returns the CSS string to apply to a Row/Cell when it has focus
   * @param-private strDefault {String} The default value to use if null (Matrix.SELECTION_BG)
   * @return {String}
   */
  Matrix_prototype.getSelectionBG = function(strDefault) {
    return (this.jsxselectionbg) ? this.jsxselectionbg : ((strDefault) ? strDefault : null);
  };

  /**
   * Sets the URL for the image to use (as the repeating background image) to denote selection.
   * @param strURL {String}
   */
  Matrix_prototype.setSelectionBG = function(strURL) {
    delete this._jsxselectionbg;
    this.jsxselectionbg = strURL;
  };

  /**
   * Called by _handleSelectionEvent to persist the ID of the selected item to serve as an anchor/pivot (used with multi-row selection to create a range).
   * @param strId {String} jsxid property on the CDF
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._setSelectionAnchor = function(strId) {
    //store the id for the item that was just selected (without the shift or ctrl keys being held down)
    /* @jsxobf-clobber */
    this._jsxselectionanchor = strId;
  };

  /**
   * Called by _handleSelectionEvent to get the ID of the last selected item (used with multi-row selection to create a range).
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getSelectionAnchor = function() {
    return this._jsxselectionanchor;
  };

  /**
   * Resolves the TR object that was last selected (the anchor)
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getSelectionAnchorObject = function() {
    return this.getDocument().getElementById(this._getSelectionAnchor());
  };

  /**
   * Returns the collection of selected records.
   * @param objContext {jsx3.xml.Entity}
   * @param objRoot {jsx3.xml.Entity}
   * @param objArray {Array}
   * @return {Array}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getAncestorNodes = function(objContext,objRoot,objArray) {
    objArray.push(objContext);
    var objParent = objContext.getParent();
    return (!objParent.equals(objRoot)) ? this._getAncestorNodes(objParent,objRoot,objArray) : objArray;
  };

  /**
   * Returns the collection of selected records.
   * @return {jsx3.util.List<jsx3.xml.Entity>}
   */
  Matrix_prototype.getSelectedNodes = function() {
    //return collection of selected nodes
    return this.getXML().selectNodes("//" + this._cdfan("children") + "[@" + this._cdfan("selected") + "='1']");
  };

  /**
   * Returns the <b>jsxid(s)</b> for the selected record(s). Equivalent to <code>this.getValue()</code> except that the return value is always an Array.
   * @return {Array<String>} JavaScript array of stings
   */
  Matrix_prototype.getSelectedIds = function() {
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
  Matrix_prototype.isRecordSelectable = function(strRecordId) {
    var rec = this.getRecordNode(strRecordId);
    return rec && this._cdfav(rec, "unselectable") != "1";
  };

  /**
   * Returns true if the record is selected
   * @return {boolean}
   * @package
   */
  Matrix_prototype.isRecordSelected = function(strRecordId) {
    var rec = this.getRecordNode(strRecordId);
    return rec && this._cdfav(rec, "selected") == "1";
  };

  /**
   * Selects a CDF record of this list. The item will be highlighted in the view and the CDF data will be updated
   * accordingly. If this list is a multi-select list then this selection will be added to any previous selection.
   * @param strRecordId {String} the jsxid of the record to select.
   */
  Matrix_prototype.selectRecord = function(strRecordId) {
    //can any record be selected
    if (this.getSelectionModel() == Matrix.SELECTION_UNSELECTABLE)
      return;

    //can this record be selected
    if (!this.isRecordSelectable(strRecordId))
      return;

    //call private method
    this._doSelect(false, strRecordId, null, this.getSelectionModel() == Matrix.SELECTION_MULTI_ROW);
  };

  /**
   * Deselects a CDF record within the Matrix. Both the view and the data model (CDF) will be updated
   * @param strRecordId {String} the jsxid of the record to deselect.
   */
  Matrix_prototype.deselectRecord = function(strRecordId) {
    this._doDeselect(false, strRecordId, null);
  };

  /**
   * Deselects all selected CDF records.
   */
  Matrix_prototype.deselectAllRecords = function() {
    var strRecordIds = this.getSelectedIds();
    var intLen = strRecordIds.length;
    for (var i=0; i<intLen; i++)
      this._doDeselect(false, strRecordIds[i]);
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._doSelect = function(objEvent, strRecordId, objTR, bUnion, intCellIndex) {
    //check for already selected
    var intSelModel = this.getSelectionModel(Matrix.SELECTION_ROW);
    var recordNode = this.getRecordNode(strRecordId);

    //if objEvent exists and the instance supports dragging and the record is already selected, exit early
    var bDragUnion = (bUnion || (objEvent && this.getCanDrag() == 1));
    if (intSelModel == Matrix.SELECTION_UNSELECTABLE || !recordNode ||
         (this._cdfav(recordNode, "selected") == "1" && bDragUnion) ||
         this._cdfav(recordNode, "unselectable") == "1")
      return false;

    //check if any existing selections need to first be cleared
    var bMulti = bUnion && (intSelModel == Matrix.SELECTION_MULTI_ROW);
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
    this._doSelectEvent(objEvent,strRecordId,intCellIndex);
    return true;
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._doDeselect = function(objEvent, strRecordId, objTR) {
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
   * @param objTargetRow {HTMLElement} on-screen element (TR) that represents the passive end of a selection range
   * @param intCellIndex {int} index of cell that was affected
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._doSelectRange = function(objEvent, objTargetRow, intCellIndex) {
    //exit if null
    if (!objTargetRow) return;

    //immediately exit if either row involved in the selection range is not selectable
    var strAnchorId = this._getSelectionAnchor();
    var strTargetId = objTargetRow.getAttribute("jsxid");
    if (!this.isRecordSelectable(strAnchorId) || !this.isRecordSelectable(strTargetId))
      return;

    //deselect previously-selected rows
    var strIds = this.getSelectedIds();
    var intIdLen = strIds.length;
    for (var i = 0; i < intIdLen; i++)
      this._doDeselect(false, strIds[i], this._getRowById(strIds[i]));

    //select new
    strIds = this.getSortedIds();
    var allIds = new jsx3.util.List(strIds);
    var intAnchorIndex = allIds.indexOf(strAnchorId);
    var intTargetIndex = allIds.indexOf(strTargetId);
    var intRangeStart = Math.min(intAnchorIndex, intTargetIndex);
    var intRangeEnd = Math.max(intAnchorIndex, intTargetIndex);

    var maxLen = strIds.length;
    var iFlag = 0;
    for (var i = intRangeStart; i <= intRangeEnd; i++)
      this._doSelect(false, strIds[i], this._getRowById(strIds[i]), true, intCellIndex);

    //evaluate the model event
    this._doSelectEvent(objEvent, strTargetId, intCellIndex);
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._doSelectEvent = function(objEvent, strTargetId,intCellIndex) {
    //called by various methods after selection has changed
    if (objEvent && objEvent instanceof Event) {
      this.doEvent(Interactive.SELECT, {objEVENT:objEvent,
                                        strRECORDID:strTargetId,
                                        strRECORDIDS:this.getSelectedIds(),
                                        objCOLUMN:(intCellIndex != null)?this._getDisplayedChildren()[intCellIndex]:null, _gipp:1});
      this.doEvent(Interactive.CHANGE, {objEVENT:objEvent});
    }
  };

// ***********************************************+
// ************** SELECTION LOGIC ****************|
// ***********************************************+

  /**
   * Called by _handleSelectionEvent. Applies edit mask logic, etc.
   * @param objEvent {jsx3.gui.Event}
   * @param objTD {HTMLElement} TD
   * @param objColumn {jsx3.gui.Matrix.Column}
   * @param bInsert {Boolean} if true, the event occurred on the 'autoappend' row
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._handleEditEvent = function(objEvent, objTD, objColumn, bInsert) {
    var objMask = objColumn.getEditMask();
    if (objMask != null) {

      //is the edit happening on the 'autoappend' row or a concrete row
      var recordId, strValue;
      if (bInsert) {
        //if bInsert and no insert session exists, create it. profile as necessary
        var jis = this._getAutoRowSession();
        strValue = jis[objColumn.getPath()];
        recordId = "jsxautorow";
      } else {
        //this is a concrete row; resolve to the MODEL
        recordId = objTD.parentNode.getAttribute("jsxid");
        strValue = objColumn.getValueForRecord(recordId);
      }

      var rend = this.getRendered(objTD);
      var viewPane = this._getViewPane();
      var bNormal = objMask.emGetType() == Matrix.EditMask.NORMAL || objMask.emGetType() == Matrix.EditMask.DIALOG;

      if (bNormal) {
        var eventRet = this.doEvent(Interactive.BEFORE_EDIT,
            {objEVENT:objEvent, strRECORDID:recordId, objCOLUMN:objColumn});
        if (eventRet === false) return;

        // BEFORE_EDIT event can specify the edit mask
        if (eventRet != null && typeof(eventRet) == "object") {
          if (typeof(eventRet.objMASK) != "undefined")
            objMask = eventRet.objMASK;
        }
      }

      var tdDim = html.getRelativePosition(viewPane, objTD);
      var paneDim = html.getRelativePosition(rend, rend);
      paneDim.W -= parseInt(viewPane.style.left);
      paneDim.H -= parseInt(viewPane.style.top);

      // 1. Clean up any straggling edit session
      var es = this._jsxeditsession;
      if (es && es.mask && es.mask.emGetSession())
        this.endEditSession();

      // 2. Tell the mask to initialize with the proper value and dimensions ...
      if (objMask._emBeginEdit(strValue, tdDim, paneDim, this, objColumn, recordId, objTD)) {

        // 3. Start an "edit session" in this control so that when an event bubbles up to this matrix,
        //    the matrix knows to clean up the session.
        /* @jsxobf-clobber */
        this._jsxeditsession = {mask:objMask, column:objColumn, recordId:recordId, value:strValue};

        // 4. Subscribe to if this entire control loses focus so we can end the edit session then as well.
        Event.subscribeLoseFocus(this, this.getRendered(objTD).childNodes[1], "_loseFocusWhileEditing");
      }
    }
  };

  /**
   * Returns an object array of name/value pairs representing the current auto row session. When the session is committed, this
   * object will be converted into a CDF Record for the instance.
   * @return {Object}
   */
  Matrix_prototype.getAutoRowSession = function() {
    return this._getAutoRowSession();
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._getAutoRowSession = function() {
    //returns the autorow session. Begins the session if it doesn't exist.
    if (!this._jsxautorowsession) {
      /* @jsxobf-clobber */
      this._jsxautorowsession = {jsxid:jsx3.xml.CDF.getKey()};
      /* @jsxobf-clobber */
      this._jsxautorowbaseline = {jsxid:this._jsxautorowsession.jsxid};
    }
    return this._jsxautorowsession;
  };

    /** @private @jsxobf-clobber */
    Matrix_prototype._isAutoRowSessionDirty = function() {
      if (this._jsxautorowsession) {
        for (var p in this._jsxautorowsession) {
          if (this._jsxautorowbaseline[p] != this._jsxautorowsession[p] && !(jsx3.util.strEmpty(this._jsxautorowsession[p]) && jsx3.util.strEmpty(this._jsxautorowbaseline[p])))
            return true;
        }
      }
      return false;
    };

  /** @private @jsxobf-clobber */
  Matrix_prototype._updateAutoRowSession = function(objEditSession) {
    //called by '_cleanUpEditSession'. Updates the object array (this object will ultimatey be committed as an actual record, but only when the enter key is pressed)
    var jis = this._getAutoRowSession();
    jis[objEditSession.column.getPath()] = objEditSession.newvalue;
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._cleanUpAutoRowSession = function(objEvent,bCleanUpEditSession) {
    //default: commit any value in the active mask, unless explicitly told not to
    if (bCleanUpEditSession !== false)
        this._cleanUpEditSession(objEvent);

    //create a new CDF record, using the JavaScript object that was created during this autorow session
    var jis = this._getAutoRowSession();
    if (jis != null && !jsx3.util.strEmpty(jis.jsxid)) {
      //end the session
      delete this._jsxautorowsession;

      //fire 'before append' event; pass the JavaScript object that will become the new record node
      var eventRet;
      if (objEvent)
        eventRet = this.doEvent(Interactive.BEFORE_APPEND, {objEVENT:objEvent, objRECORD:jis});

      if (eventRet !== false) {
        //commit the user values
        var objNode = this.insertRecord(jis,this.getRenderingContext("jsxroot"),true);

        //fire the 'after append' event; pass the newly added record node
        if (objEvent)
          this.doEvent(Interactive.AFTER_APPEND, {objEVENT:objEvent, objRECORDNODE:objNode, _gipp:1});
      }

      //reset the autoappend row back to its null state
      var _jis = {jsxid:"jsxautorow"};
      this.insertRecord(_jis,null,false);
      this.redrawRecord("jsxautorow", jsx3.xml.CDF.UPDATE);
      this.deleteRecord("jsxautorow",false);
    }
  };

  /**
   * Commits any active autorow session.
   * @param objEvent {jsx3.gui.Event} If passed, Allows Model Event to fire.
   * @param intCellIndex {int} Focus will be applied to the autorow cell at this index (zero-based)
   */
  Matrix_prototype.commitAutoRowSession = function(objEvent, intCellIndex) {
    this._cleanUpAutoRowSession(objEvent,false);

    //if user repaints the control, need to account for NPE when referencing objTR
    if (!isNaN(intCellIndex)) {
      var objTR = this._getRowById("jsxautorow");
      if (objTR && objTR.childNodes[intCellIndex-0])
        html.focus(objTR.childNodes[intCellIndex-0]);
    }
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._cancelAutoRowSession = function() {
    //called whenever an event occurs that would repaint the data rows
    delete this._jsxautorowsession;
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._isAutoRow = function(objTR) {
    //returns true if the given table row (@TR) is the autorow for the instance (ensures that concrete data rows don't get confused with the system autorow even if they implement jsxautorow as their jsxid)
    if (!objTR) return false;
    if (objTR.getAttribute("jsxid") != "jsxautorow") return false;
    var objParent = objTR.parentNode;
    if (objParent.tagName.toLowerCase() != "table") objParent = objParent.parentNode;
    return objParent.getAttribute("jsxautorow") == "true";
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._cleanUpEditSession = function(objEvent, bKeepOpen) {
    var es = this._jsxeditsession;
    if (es != null) {
      if (!bKeepOpen) {
        delete this._jsxeditsession;
        Event.unsubscribeLoseFocus(this);
      }

      //get the updated value returned by the mask
      var newValue = bKeepOpen ? es.mask.emGetValue() : es.mask._emEndEdit();

      //was the edit happening to a cell in the autorow?
      var bAutoCellWasEdited = es.recordId == "jsxautorow" && this._getAutoRow() && this._isAutoRow(this._getRowById("jsxautorow"));

      //did the user completely leave the autorow?
      var bAutoRowWasExited = true;
      if (objEvent && bAutoCellWasEdited) {
        var objAutoRow = this._getRowById("jsxautorow");
        bAutoRowWasExited = html.findElementUp(objEvent.srcElement(), function(x) { return x == objAutoRow;},true) == null;
      }

      //exit early if no delta was made; but do NOT exit if:
      //a) user completely exited the autorow (TR element)
      //b) there is a valid autorow session that is active
      //c) there are deltas for the active autorow session
      if (!(bAutoRowWasExited && bAutoCellWasEdited && this._isAutoRowSessionDirty()))
        if (es.value === newValue)
          return;

      var bNormal = es.mask.emGetType() == Matrix.EditMask.NORMAL || es.mask.emGetType() == Matrix.EditMask.DIALOG;
      var eventRet = true;

      if (bNormal) {
        if (objEvent != null)
          eventRet = this.doEvent(Interactive.AFTER_EDIT,
            {objEVENT:objEvent, strRECORDID:es.recordId, objCOLUMN:es.column, strNEWVALUE:newValue});

        if (eventRet != null && typeof(eventRet) == "object") {
          if (typeof(eventRet.strNEWVALUE) != "undefined")
            newValue = eventRet.strNEWVALUE;
        }

        // disallow setting the value of a jsxid column to the jsxid of another row
        var bKeyCol = es.column.getPath() == "jsxid";
        if (bKeyCol && this.getRecordNode(newValue))
          eventRet = false;

        if (eventRet !== false) {
          //stop double-updates; reset the edit session initial value to the latest value
          if (bKeepOpen)
            es.value = newValue;
          if (bAutoCellWasEdited) {
            //a valid edit was made to a cell in the autoappend row. update here; pass the new value as part of the edit session object
            es.newvalue = newValue;
            this._updateAutoRowSession(es);

            //1) create a temp record in the data model, using the object that's part of the insert session
            var jis = this._getAutoRowSession();
            var _jis = {};
            for (var p in jis) _jis[p] = jis[p];
            _jis.jsxid = "jsxautorow";
            this.insertRecord(_jis,null,false);

            //2) call redraw cell on the record
            this.redrawCell("jsxautorow", es.column);

            //3) remove the temp record
            this.deleteRecord("jsxautorow",false);

            //4) Commit the autorow session
            //   a) if exited the autorow TR completely
            //   b) and not because of an edit-sesion event related to an edit mask
            //   c) and if the autorow session object has at least one delta
            if (bAutoRowWasExited && !bKeepOpen && this._isAutoRowSessionDirty())
                this._cleanUpAutoRowSession(objEvent,false);
          } else if (bKeyCol) {
            //call insertRecordProperty when jsxid (primary key) is updated, due to the number of updates that need to happen to the VIEW
            this.insertRecordProperty(es.recordId,"jsxid",newValue,false);
            this.redrawCell(newValue, es.column);
          } else {
            es.column.setValueForRecord(es.recordId, newValue);
            this.redrawCell(es.recordId, es.column);
          }
        }
      }

      if (objEvent != null && eventRet !== false)
        this.doEvent(Interactive.AFTER_COMMIT,
          {objEVENT:objEvent, strRECORDID:es.recordId, objCOLUMN:es.column, strVALUE:newValue, _gipp:1});
    }
  };

  Matrix_prototype.endEditSession = function(objEvent) {

    this._cleanUpEditSession(objEvent);
  };

  Matrix_prototype.collapseEditSession = function(objEvent,objGUI) {
    var es = this._jsxeditsession;
    if (es != null) {
      //those masks that use the heavyweight class to display their ephemeral selection interface need to also be explicitly told to collapse the heavyweight
      es.mask.emCollapseEdit(objEvent);

      //this makes sure to end the session, since the cell that the user was editing may have been scrolled outside the viewport
      this.endEditSession(objEvent);

      //give focus to the scroller (what the user moused down on). Don't give focus back to the cell, since it can undermine the user's scroll action
      html.focus(objGUI);
    }
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._loseFocusWhileEditing = function(objEvent) {
    var focusedElm = objEvent.event.srcElement();
    var es = this._jsxeditsession;

    if (es && !es._suspended && !es.mask.containsHtmlElement(focusedElm)) {
      this._cleanUpEditSession(objEvent.event);
    }
  };

  /** @private @jsxobf-clobber */
  Matrix._initEditMask = function(objMask, objColumn) {
    if (objMask._jsxeminited) return true;

    if (objMask.instanceOf(jsx3.gui.Form)) {
      Matrix.EditMask.jsxclass.mixin(objMask, true);
    } else if (jsx3.gui.Dialog && objMask instanceof jsx3.gui.Dialog) {
      Matrix.DialogMask.jsxclass.mixin(objMask, false);
      Matrix.BlockMask.jsxclass.mixin(objMask, true);
      Matrix.EditMask.jsxclass.mixin(objMask, true);
    } else if (objMask instanceof Block) {
      Matrix.BlockMask.jsxclass.mixin(objMask, true);
      Matrix.EditMask.jsxclass.mixin(objMask, true);
    } else {
      return false;
    }

    objMask.emInit(objColumn);
    /* @jsxobf-clobber */
    objMask._jsxeminited = true;
    return true;
  };

// ***********************************************+
// ******* USER EVENT/ MODEL EVENT LOGIC *********|
// ***********************************************+

  /**
   * called by click event. either toggles a tree node open/closed OR selects a given row
   * @private
   */
  Matrix_prototype._ebClick = function(objEvent, objGUI) {
    objEvent.cancelBubble();
    Event.publish(objEvent);

    var objSource = objEvent.srcElement();
    var objContext = this._getRowCellContext(objSource);
    var strType = objSource.getAttribute("jsxtype");
    if (strType == "plusminus" || strType == "paged") {
      //toggle event
      this._showHideContainer(objEvent,objSource);
    } else {
      //if user clicked on a row
      while (objSource && objSource != objGUI) {
        if (objSource.getAttribute("jsxtype") == "record") {
          if (!jsx3.gui.isMouseEventModKey(objEvent) && !objEvent.shiftKey()) {
            var strId = objContext.row.getAttribute("jsxid");
            var strIds = this.getSelectedIds();
            var isEvent = (strIds.length == 1 && strId == strIds[0]) ? false : objEvent;
            this.deselectAllRecords();
            this._doSelect(isEvent, strId, objContext.row, false, objContext.cell?objContext.cell.cellIndex:null);
            return;
          }
        }
        objSource = objSource.parentNode;
      }
    }
  };

  /**
   * Called by ebClick. Determines the DIV that holds the content associated with the node whose open/close state was just toggled
   * @param objEvent {jsx3.gui.Event}
   * @param objGUI {HTMLElement} TD element containing toggle icon
   * @param-private bOpen {Boolean} if passed, will force state (otherwise will be toggled)
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._showHideContainer = function(objEvent,objGUI,bOpen) {
    //get the div that holds the children for the node being toggled
    var objContent = this._resolveChildContainer(objGUI);

    //get cdf record object corresponding to the row being toggled
    var strCdfId = this._getFirstRow(objContent.previousSibling).getAttribute("jsxid");
    var objNode = this.getRecordNode(strCdfId);

    //if the item being toggled doesn't have child records, exit early. the toggle event only applies to records with child records
    //TO DO: should still be possible to fetch content dynamically and add to an empty record
    if (! objNode.selectSingleNode("./" + this._cdfan("children"))) return;

    //toggle the state, updating model and view
    if (bOpen == null) bOpen = false;

    //get the jsxtype (this attribute identifies elements in the UI that are important to the structure)
    if (objGUI.nodeType == 3) objGUI = objGUI.parentNode;
    var strType = objGUI.getAttribute("jsxtype");

    if (objContent.style.display == "none" || bOpen) {
      bOpen = true;
      this._cdfav(objNode,"open","1");
      objContent.style.display = "";

      if (this.getRenderNavigators(1) != 0)
        objGUI.style.backgroundImage = "url(" + this.getUriResolver().resolveURI(this.getIconMinus(Matrix.ICON_MINUS)) + ")";

      if (this._hasNoEntityContent(objContent)) {
        LOG.trace("Fetch the content belonging to: " + strCdfId);

        //create the parameter object to pass to the XSLT Processor
        var objParams = {};
        objParams.jsx_panel_css = "position:relative;";
        objParams.jsx_column_widths = this._getViewPaneWidth();
        objParams.jsx_rendering_context = strCdfId;
        objParams.jsx_context_index = objContent.getAttribute("jsxcontextindex");

        //update the on-screen html
        objContent.innerHTML = this.doTransform(objParams);

        //update the attribute on this view element so it's no longer 'paged'
        if (this.getRenderNavigators(1) != 0) objGUI.setAttribute("jsxtype","plusminus");

        //apply the 2-pass formatters to the newly added content
        var myToken = {painted:1,token:Matrix.getToken(),contextnodes:objContent.childNodes};
        this._getPanelArray()[0] = myToken;
        this._applyFormatHandlers(myToken);
      }
    } else {
      this._cdfav(objNode, "open", null);
      objContent.style.display = "none";
      if (this.getRenderNavigators(1) != 0)
        objGUI.style.backgroundImage = "url(" + this.getUriResolver().resolveURI(this.getIconPlus(Matrix.ICON_PLUS)) + ")";
    }

    //always recalculate the scrollbars (they're only explicit when in paging mode)
    this._updateScrollHeight();

    // fire the jsxtoggle event for the tree; the user will have contextual handles to
    if (objEvent) this.doEvent(Interactive.TOGGLE, {objEVENT:objEvent, strRECORDID:strCdfId, objRECORD:objNode, bOPEN:bOpen, _gipp:1});
  };

  /**
   * Toggles the open/closed state for a node in the Matrix
   * @param strRecordId {String} the 'jsxid' attribute on the given CDF record to toggle
   * @param bOpen {boolean} if null, the open state will be toggled
   */
  Matrix_prototype.toggleItem = function(strRecordId, bOpen) {
    //TO DO: look getting rid of plus minus via the third param.  Allow setting to force create a book-state and forc create a leaf-state
    var objGUI = this._getCellByIndex(strRecordId,0);
    if (objGUI != null) {
      //descend to find the toggle icon (objGUI(td)/div/table/tbody/td)
      while (objGUI && objGUI.getAttribute && objGUI.getAttribute("jsxtype") != "plusminus" && objGUI.getAttribute("jsxtype") != "paged") objGUI = objGUI.childNodes[0];
      this._showHideContainer(false,objGUI,bOpen);
    }
  };

  /**
   * Reveals a record by toggling parent nodes open (if rendering hierarcally) and scrolling the record into view.
   * @param strRecordId {String} the id of the record to reveal
   */
  Matrix_prototype.revealRecord = function(strRecordId) {
    var recordNode = this.getRecordNode(strRecordId);
    if(recordNode) {
      if (this.getRenderingModel() == Matrix.REND_HIER) {
        //3.4.1 had to remove xpath to be backwards compat with old msxml versions that defaulted to XSLquery
        var a = [];
        do {
          a.push(this._cdfav(recordNode, "id"))
        } while((recordNode = recordNode.getParent()) != null && recordNode.getParent());
        for(var i=a.length-1;i>=0;i--)
          this.toggleItem(a[i], true);
      }
      //make sure the scroller is synchronized with the contenta
      this.synchronizeVScroller();

      //scroll the on-screen row into view
      var objCellToReveal = this._getCellByIndex(strRecordId,0);
      if(objCellToReveal) {
        this._scrollIntoView(objCellToReveal);
      } else {
        //handle if the cell is missing due to pagination
        if(this._loadPagedCell(strRecordId)) {
          jsx3.sleep(function() {
            jsx3.sleep(function() {
              var objCellToReveal = this._getCellByIndex(strRecordId,0);
              if(objCellToReveal)
                this._scrollIntoView(objCellToReveal);
            },"pagedfocusdelay",this);
          },"pagedfocusdelay",this);
        }
      }
    }
  };


  /**
   * Determines the DIV that holds the content associated with the node whose open/close state was just toggled
   * @param objGUI {HTMLElement} any GUI element. DOM traversal begins with this object and continues until a valid table is found
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._resolveChildContainer = function(objGUI) {
    //resolve TABLE that owns the toggle icon
    //TO DO: use jsxtype flag on the table to identify it (do in XSLT)
    while (!objGUI.tagName || (objGUI && (objGUI.tagName && objGUI.tagName.toLowerCase() != "table")) || objGUI.id == "") objGUI = objGUI.parentNode;

    //get the next sibling (this is the content-holding div)
    return objGUI.nextSibling;
  };

  /**
   * Returns the drag icon when a drag is about to occur. Override this method and replace with one adhering to the same signature to customize
   * the drag icon. Note that this method is executed in context of the HTML <b>window</b> object, meaning the parameter, <code>this</code>, should not be used
   * to resolve the Matrix instance. Instead, use the second parameter, <b>objJSXTarget</b>.
   * @param objGUI {HTMLElement} on-screen HTML element (TR) being dragged
   * @param objJSXTarget {jsx3.gui.Matrix}
   * @param strDragType {String} JSX_GENERIC
   * @param strDragItemId {String} jsxid for the CDF record in the MODEL corresponding to the TR element in the VIEW
   * @return {String} HTML content to follow the mouse pointer during the drag
   * @package
   */
  Matrix_prototype.getDragIcon = function(objGUI, objJSXTarget, strDragType, strDragItemId) {
    var ids = jsx3.EventHelp.DRAGIDS;
    var strHTML = "";
    var strTargetId = objGUI.id;
    var opacity = .4;
    //a race can possibly occur, meaning not all selected ids may actually be accounted for when the drag icon is generated.  add the id for objGUI if necessary
    var strCdfId = objGUI.getAttribute("jsxid");
    if (objJSXTarget.isRecordSelectable(strCdfId) && jsx3.util.arrIndexOf(ids, strCdfId) == -1) ids.push(strCdfId);
    for (var i=0;i<ids.length && i < 4;i++) {
      var objRow = objJSXTarget._getRowById(ids[i]);
      if (objRow)
        strHTML += objJSXTarget._getDragIcon(objRow,opacity);
      opacity -= .1;
    }
    return strHTML;
  };

  /**
   * Returns the drag icon for a specific row
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getDragIcon = function(objTR,opacity) {
    //resolve the table
    var objTable = objTR;
    while (objTable.tagName.toLowerCase() != "table")
      objTable = objTable.parentNode;

    return  "<div id='JSX' class='jsx30matrix_dragicon' style='" +
            html.getCSSOpacity(opacity) + "'>" +
            "<table class='" + objTable.getAttribute("class") + "' style='" + objTable.getAttribute("style") + "'>" +
            "<tr class='" + objTR.getAttribute("class") + "' style='" + objTR.getAttribute("style") + "'>" +
            objTR.innerHTML + "</tr></table></div>";
  };

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {

  /**
   * called by onselectstart event (IE only); cancels text selection if the selection model is single or multiselect.
   * @private @jsxobf-clobber
   */
  Matrix_prototype._ebSelectStart = function(objEvent, objGUI) {
    var objSource = objEvent.srcElement();
    var bCancel = this.getSelectionModel() != Matrix.SELECTION_UNSELECTABLE;

    //3.5 fix: allow text selection if the target element is input
    //3.7 fix: include textarea
    if (bCancel && !(objSource && objSource.tagName.search(/input|textarea/i) == 0))
      objEvent.cancelAll();
  };

/* @JSC */ }

  /**
   * called by mosuedown event; tries to apply focus to the relevant target
   * @private
   */
  Matrix_prototype._ebMouseDown = function(objEvent, objGUI) {
    var bCancel = true;

    //persist ctrl, alt, and shift key states as they were when the event actually fired
    this._setCtrlKeys(objEvent);

    if (objEvent.leftButton()) {
      //what was moused down on?
      var objSource = objEvent.srcElement();

      //resolve the context row and cell
      var objContext = this._getRowCellContext(objSource);
      if (objContext == null) return;

      //handle focus event
      if (objContext) {
        //if selection model is row-based, resolve to the cell parent, not the cell
        objGUI = objContext.cell;
        if (this._getFocusContext() != objGUI.id) {
          html.focus(objGUI);
        } else {
          //reset the cached index (this is used by the colspan to resume n/s nav at the appropriate cell index if a colspan row is encountered)
          this._setCachedIndex();
          this._handleFocusEvent(objEvent,objGUI);
        }

        //begin prep work for the drag event
        if (this.getCanDrag() == 1 && this.getSelectionModel(Matrix.SELECTION_ROW) > Matrix.SELECTION_UNSELECTABLE) {
          //get collection of selected ids (an array);
          var ids = this.getSelectedIds();
          //append the latest item to be moused down upon to the collection of selected items
          var strCdfId = objContext.row.getAttribute("jsxid");
          var myArrayList = jsx3.util.List.wrap(ids);
          if (myArrayList.indexOf(strCdfId) == -1)
            ids = [strCdfId];
          if (this.isRecordSelectable(strCdfId) && jsx3.util.arrIndexOf(ids, strCdfId) == -1) ids.push(strCdfId);
          //call super method that handles the remaining prep and execution of the 'onbeforedrag' event
          this.doDrag(objEvent, objContext.row, this.getDragIcon, {strDRAGIDS:ids});

          bCancel = true;
        } else {
          bCancel = this._jsxeditsession != null;
        }
      }
    }

    if (bCancel) {
      //handle mousedown event, since about to cancel
      Event.publish(objEvent);

      //cancel the mousedown to stop default focus bubbling in FF on a right-click
      objEvent.cancelAll();
    }
  };

  /**
   * fires when user hovers over an element in the tree; shows spyglass, toggles open/closed state, highlights drop zone
   * @private
   */
  Matrix_prototype._ebMouseOver = function(objEvent, objGUI) {
    //get the source element (the to element when its a mouseover event)
    var objSource = objEvent.toElement();
    if (!objSource) return;

    //resolve if the native element being hovered over is one of the system 'special types' as designated by the attribute, jsxtype
    var strType = objSource.getAttribute("jsxtype");

    //resolve the context row and cell
    var objContext = this._getRowCellContext(objSource);
    if (!objContext) return;

    //initialize variables common to both drop and spyglass
    var strRECORDID = objContext.row.getAttribute("jsxid");

    //resolve root view element corresponding to the cdf model element
    objGUI = this._getResolvedView(objContext.row);

    if (jsx3.EventHelp.isDragging() && this.getCanDrop() == 1 && jsx3.EventHelp.getDragIds()[0] != null) {

      //handle drop-related event
      if ((strType == "plusminus" && this._cdfav(this.getRecordNode(strRECORDID), "open") != "1")
          || strType == "paged") {
        var me = this;
        objEvent.persistEvent(); // for timeout
        Matrix.TOGGLETIMEOUT = window.setTimeout(function(){
          if (me.getParent() != null) {
            me._showHideContainer(objEvent,objSource);
          }
        },Matrix.TOGGLE_DELAY);
      }

      //this is the before drop event; fire for the user and cancel if the user explicitly said to
      var bContinue = this.doEvent(Interactive.BEFORE_DROP,
          {objEVENT:objEvent, strRECORDID:strRECORDID, objSOURCE:jsx3.EventHelp.getDragSource(), strDRAGIDS:jsx3.EventHelp.getDragIds(),
           strDRAGTYPE:jsx3.EventHelp.getDragType(), objGUI:objGUI});

      if (!(bContinue===false)) {
        var objThis = this.getRendered(objEvent);
        var objP = this.getAbsolutePosition(objThis,objContext.row);
        var objArrow = this._getDropIcon(objThis);

        //get how far the drop designator should indent
        var intIndent = (this.getRenderingModel() == Matrix.REND_HIER && this.getRenderNavigators(1) != 0) ?
          parseInt(objContext.row.childNodes[0].childNodes[0].childNodes[0].getAttribute("jsxindent")) :
          4;

        if (this.getRenderingModel() != Matrix.REND_HIER || objP.H/3 > objEvent.getOffsetY()) {
          //this is an insertBefore
          objArrow.style.top = (objP.T - 4) + "px";
          objArrow.style.width = (this._getViewPortWidth() - intIndent - 8) + "px";
          objArrow.style.height = "7px";
          objArrow.style.backgroundImage = "url(" + Matrix.INSERT_BEFORE_IMG + ")";
          objArrow.setAttribute("dropverb","insertbefore");
        } else {
          //this is an append
          intIndent += 26;
          objArrow.style.width = "12px";
          objArrow.style.height = "12px";
          objArrow.style.top = (objP.T - 10 + objP.H) + "px";
          objArrow.style.backgroundImage = "url(" + Matrix.APPEND_IMG + ")";
          objArrow.setAttribute("dropverb","append");
        }
        objArrow.style.left = intIndent + "px";
        objArrow.setAttribute("rowcontext",strRECORDID);
        objArrow.style.display = "block";
      }
    } else if (this.getEvent(Interactive.SPYGLASS)) {
      //handle spy-related event
      this.applySpyStyle(objSource);

      var intLeft = objEvent.clientX() + jsx3.EventHelp.DEFAULTSPYLEFTOFFSET;
      var intTop = objEvent.clientY() + jsx3.EventHelp.DEFAULTSPYTOPOFFSET;
      objEvent.persistEvent(); // so that event properties are available after timeout
      var me = this;
      var objColumn = this._getDisplayedChildren()[objContext.cell.cellIndex];

      if (Matrix.SPYTIMEOUT) window.clearTimeout(Matrix.SPYTIMEOUT);
      Matrix.SPYTIMEOUT = window.setTimeout(function(){
        Matrix.SPYTIMEOUT = null;
        if (me.getParent() != null)
          me._doSpyDelay(objEvent, strRECORDID, objColumn, objSource);
      }, jsx3.EventHelp.SPYDELAY);
    }
  };

  /**
   * called by 'window.setTimeout'; provides execution context for any spyglass event spawned within the '_ebMouseOver' method
   * @param objEvent {jsx3.gui.Event}
   * @param strRecordId {String} id (CDF <code>jsxid</code> attribute) for the record being spyglassed
   * @param objSource {HTMLElement} source element in the tree (the text label) that was hovered over and stylized in the VIEW to denote an impending spy event
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._doSpyDelay = function(objEvent, strRecordId, objColumn, objSource) {
    this.removeSpyStyle(objSource);
    //no objEVENT in spy events because of timeout
    var eventResult = this.doEvent(Interactive.SPYGLASS,
        {objEVENT:objEvent, objCOLUMN:objColumn, strRECORDID:strRecordId});
    if (eventResult)
      this.showSpy(eventResult, objEvent);
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._ebMouseOverVScroll = function(objEvent, objGUI) {
    //the vertical scrollbar may be swallowing events. need to look further...
    this._resetDropIcon(objGUI.parentNode);

    //if drag/drop is happening and this instance supports a drop, auto scroll up/down
    if (jsx3.EventHelp.isDragging() && this.getCanDrop() == 1 && jsx3.EventHelp.getDragIds()[0] != null) {
      var my = this;
      /* @jsxobf-clobber */
      this._jsxvscrollinterval = {offsety:objEvent.getOffsetY(),offsetheight:objGUI.offsetHeight,scrollheight:objGUI.scrollHeight};
      this._jsxvscrollinterval.interval = window.setInterval(function() {  my._doAutoScroll(); },Matrix.AUTO_SCROLL_INTERVAL);
    }
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._doAutoScroll = function() {
    if (this._jsxvscrollinterval.offsety < (this._jsxvscrollinterval.offsetheight / 2)) {
      //scroll up
      if (this.getScrollTop() > 0)
        this.setScrollTop(this.getScrollTop() - 20);
    } else {
      if (this.getScrollTop() < this._jsxvscrollinterval.scrollheight)
        this.setScrollTop(this.getScrollTop() + 20);
    }
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._ebMouseOutVScroll = function(objEvent, objGUI) {
    if (this._jsxvscrollinterval) {
      window.clearInterval(this._jsxvscrollinterval.interval);
      delete this._jsxvscrollinterval;
    }
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._ebMouseMoveVScroll = function(objEvent, objGUI) {
    //if true drag/drop is happening and this instance supports a drop, auto scroll up/down
    if (jsx3.EventHelp.isDragging() && this.getCanDrop() == 1 && jsx3.EventHelp.getDragIds()[0] != null && this._jsxvscrollinterval) {
      this._jsxvscrollinterval.offsety = objEvent.getOffsetY();
      this._jsxvscrollinterval.offsetheight = objGUI.offsetHeight;
      this._jsxvscrollinterval.scrollheight = objGUI.scrollHeight;
    }
  };

  /**
   * called by mouseout event on the drop designation icon. hides the icon if the object that was moved to is not a direct descendant of the viewport
   * @private
   */
  Matrix_prototype._ebMouseOutDropIcon = function(objEvent, objGUI) {
    if (!objEvent.isFakeOut(objGUI.parentNode.childNodes[1])) {
      this._resetDropIcon(objGUI.parentNode);
    }
  };

  /**
   * called: 1) during drag/drop: stops time-delayed toggle event from firing; calls canceldrop;
             2) cancels spyglass if one was set to fire on a delay
   * @private
   */
  Matrix_prototype._ebMouseOut = function(objEvent, objGUI) {
    var objSource = objEvent.fromElement();

    //hide the drop designation icon if the to element is not a child of the viewport
    if (objEvent.isFakeOut(objGUI))
      this._resetDropIcon(objGUI.parentNode);

    //hide the spyglass if the object moved to is not the spyglassbuffer
    if (!jsx3.EventHelp.isDragging() && this.getEvent(Interactive.SPYGLASS)) {
      var eElement = objEvent.toElement();

      var bCancelSpy = false;
      try {
        //fx race can lead to a NPE that cannot be trapped with a simple null check
        bCancelSpy = (!eElement || eElement.className != "jsx30spyglassbuffer");
      } catch(e) {
        bCancelSpy = true;
      }
      if (bCancelSpy) {

        //reset the cursor; clear the spyglass delay to stop it from firing
        jsx3.sleep(Interactive.hideSpy);

        this.removeSpyStyle(objSource);

        if (Matrix.SPYTIMEOUT) window.clearTimeout(Matrix.SPYTIMEOUT);
      }
    }

    //exit early if can't resolve the object we left
    if (objSource == null || (objEvent.isFakeOut(objGUI.parentNode) && objSource.getAttribute("jsxtype") != "plusminus")) return;

    //resolve if the native element being hovered over is one of the system 'special types' as designated by the attribute, jsxtype
    var strType = objSource.getAttribute("jsxtype");

    //resolve the context row and cell
    var objContext = this._getRowCellContext(objSource);
    if (!objContext) return;

    //initialize variables common to both drop and spyglass
    var strRECORDID = objContext.row.getAttribute("jsxid");

    //resolve root view element corresponding to the cdf model element
    objGUI = this._getResolvedView(objContext.row);

    //is this a drop or spy event that should be cancelled
    if (jsx3.EventHelp.isDragging() && this.getCanDrop() == 1) {

      //cancel the auto-toggler from firing
      if (strType == "plusminus") window.clearTimeout(Matrix.TOGGLETIMEOUT);

      //this is the before drop event; fire for the user
      var bContinue = this.doEvent(Interactive.CANCEL_DROP,
          {objEVENT:objEvent, strRECORDID:strRECORDID, objSOURCE:jsx3.EventHelp.getDragSource(), strDRAGIDS:jsx3.EventHelp.getDragIds(),
           strDRAGTYPE:jsx3.EventHelp.getDragType(), objGUI:objGUI});

      this._resetDropIcon(this.getRendered(objEvent));
    }// else
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._getRowCellContext = function(objGUI) {
    var objNode = objGUI;
    var objLast = null;

    while (objNode && objNode.getAttribute("jsxtype") != "record") {
      objLast = objNode;
      objNode = objNode.parentNode;

      if (!objNode || !objNode.tagName || objNode.tagName.toLowerCase() == "body" || objNode.id == this.getId())
        return null;
    }

    return {row:objNode, cell:objLast};
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._getResolvedView = function(objGUI) {
    //gets the true on-screen object corresponding to the cdf record that if removed from the view would entirely remove all trace of the record
    if (this.getRenderingModel() == "hierachical") {
      objGUI = this._resolveChildContainer(objGUI).parentNode;
    } else if (this.getPagingModel(Matrix.PAGING_OFF) != Matrix.PAGING_PAGED) {
      while (objGUI.tagName.toLowerCase() != "table") objGUI = objGUI.parentNode;
    }
    return objGUI;
  };

  /**
   * stops super from executing (causes menu error)
   * @private
   */
  Matrix_prototype._ebMouseUp = function(objEvent, objGUI) {
    ;
  };

  Matrix_prototype._ebMouseWheel = function(objEvent, objGUI) {
//    jsx3.log("wheel: " + objEvent);
    var delta = objEvent.getWheelDelta();

    //always recalculate the scrollbars (they're only explicit when in paging mode)
    var objViewPane = this._getViewPane();
    var intTop = this.getScrollTop();
    intTop = Math.max(0, Math.min(intTop - delta * Matrix.SCROLL_INC, objViewPane.offsetHeight));

    //collapse the edit session in case any ephemeral selectors are open (the heavywheight)
    this.collapseEditSession(objEvent,objGUI);
    this.setScrollTop(intTop, objGUI);

    objEvent.cancelAll();
  };

  /**
   * Returns true if obj1 is a descendant of obj2 or is equal to obj2
   * @private
   */
  Matrix_prototype._isDescendantOrSelf = function(obj1, obj2) {
    while (obj1 && obj2) {
      if (obj1.equals(obj2)) return true;
      obj1 = obj1.getParent();
    }
    return false;
  };

  /**
   * called by mouseup event; either processes a drop event or displays a bound context menu
   * @private
   */
  Matrix_prototype._onMouseUp = function(objEvent, objGUI) {
    //resolve the context row and cell context
    var objEvtSource = (objEvent.srcElement() && objEvent.srcElement().className == "jsx30matrix_drop_icon") ?
      this._getRowById(objEvent.srcElement().getAttribute("rowcontext")).childNodes[0] :
      objEvent.srcElement();
    var objContext = this._getRowCellContext(objEvtSource);

    //either mouseupped on a record, or there are no records, either way process as if a drop
    if (this.getCanDrop() == 1 && jsx3.EventHelp.isDragging()) {
      if (jsx3.EventHelp.getDragType() == "JSX_GENERIC") {

        //hide the insert/append arrow; use delay...still need its state for the remainder of this function
        jsx3.sleep(function() { this._resetDropIcon(); }, null, this);

        var objSource = jsx3.EventHelp.getDragSource();
        if (objSource && objSource.instanceOf(jsx3.xml.CDF)) {
          var bCtrl = jsx3.gui.isMouseEventModKey(objEvent);

          //allow owner of CDF record to veto the adoption
          var bAllowAdopt = objSource.doEvent(Interactive.ADOPT,
                {objEVENT:objEvent, strRECORDID:jsx3.EventHelp.getDragId(), strRECORDIDS:jsx3.EventHelp.getDragIds(), objTARGET:this, bCONTROL:bCtrl});

          var objArrow = this._getDropIcon(this.getRendered(objEvent));
          var bInsertBefore = objArrow.getAttribute("dropverb") == "insertbefore";
          var targetRecordId = objContext ? objContext.row.getAttribute("jsxid") : null;

          //execute any 'drop' event handler; check for user-initiated cancel (will also let the instance know whether the source has vetoed the adoption)
          var context = {objEVENT:objEvent, objSOURCE:objSource, strDRAGIDS:jsx3.EventHelp.getDragIds(),
              strDRAGTYPE:jsx3.EventHelp.getDragType(), strDRAGID:jsx3.EventHelp.getDragId(),
              strRECORDID:targetRecordId, bINSERTBEFORE: bInsertBefore,
              objCOLUMN:(objContext != null)?this._getDisplayedChildren()[objContext.cell.cellIndex]:null,
              bALLOWADOPT:(bAllowAdopt !== false)};
          var bContinue = this.doEvent(bCtrl ? Interactive.CTRL_DROP : Interactive.DROP, context);

          if (bAllowAdopt !== false && bContinue !== false) {
            //get properties from the drop icon that designate if this is an insert or append
            var strIds = jsx3.EventHelp.getDragIds();
            var objTheTarget = objContext ? this.getRecordNode(objContext.row.getAttribute("jsxid")) : null;
            for (var i=0;i<strIds.length;i++) {
              //only allow drop not dropping in front of self or on top of self or on a descendant of self
              var objTheMoved = objSource.getRecordNode(strIds[i]);
              if (objTheTarget && objTheTarget.equals(objTheMoved) && bInsertBefore && objTheTarget.getNextSibling()) {
                //shift the target to the next sibling if the record being dropped is the same as the target
                objTheTarget = objTheTarget.getNextSibling();
                targetRecordId = this._cdfav(objTheTarget, "id");
              }
              if (!(this == objSource && objContext && this._isDescendantOrSelf(objTheTarget,objTheMoved))) {
                //remove the selection flag from the involved record
                objSource.deleteRecordProperty(strIds[i], "jsxselected", false);

                //add the new record, but do as an insert before or append
                var bDidRedraw;
                if (bInsertBefore) {
                  bDidRedraw = true;
                  var objRecord = this.adoptRecordBefore(objSource, strIds[i], targetRecordId);
                } else {
                  bDidRedraw = objContext != null;
                  var strTargetId;
                  if(this.getRenderingModel() == Matrix.REND_HIER && objContext) {
                    strTargetId = objContext.row.getAttribute("jsxid");
                  } else {
                    strTargetId = this.getRenderingContext();
                  }
                  var objRecord = this.adoptRecord(objSource,strIds[i],strTargetId,objContext != null);
                }
              }
            }

            //repaint the entire list if the insert/append did not result in redrawRecord getting called
            if (!bDidRedraw && !objContext) this.repaint();
          }
        }
      }

      //this is required if a repaint occurs on a drop
      jsx3.EventHelp.reset();
    } else if (objEvent.rightButton()) {
      //user right-moused-up on the list. show context menu if relevant
      var strMenu = this.getMenu();
      if (strMenu) {
        //resolve the menu (must be owned by same server)
        var objMENU = this._getNodeRefField(strMenu);
        if (objMENU != null) {
          //persist the cdf id and column instance if applicable
          var objColumn, strRecordId;
          if (objContext) {
            objColumn = this._getDisplayedChildren()[objContext.cell.cellIndex];
            strRecordId = objContext.row.getAttribute("jsxid");
          }

          //fire event code and display
          var objEventContext = {objEVENT:objEvent, objMENU:objMENU, strRECORDID:strRecordId, objCOLUMN:objColumn};
          var vntResult = this.doEvent(Interactive.MENU, objEventContext);
          if (vntResult !== false) {
            //if the context menu object was resolved to a different menu instance replace here
            if (vntResult instanceof Object && vntResult.objMENU instanceof jsx3.gui.Menu)
              objMENU = vntResult.objMENU;
            objMENU.showContextMenu(objEvent, this, strRecordId);
          }
        }
      }
    }
  };

  /**
   * Called by keydown/mousedown events. persists the state of the ctrl,alt,and shift keys
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._setCtrlKeys = function(objEvent) {
    /* @jsxobf-clobber */
    this._jsxeventclone = {ctrl:jsx3.gui.isMouseEventModKey(objEvent),shift:objEvent.shiftKey(),alt:objEvent.altKey()};
  };

  /**
   * Called by keydown/mousedown events. Persists the state of the ctrl,alt,and shift keys
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getCtrlKeys = function() {
    return (this._jsxeventclone != null) ? this._jsxeventclone : {};
  };

  /**
   * called by keydown event; performs appropriate: 'select', 'execute', or 'tab-out' option
   * @private
   */
  Matrix_prototype._ebKeyDown = function(objEvent, objGUI) {
    // check for hot keys
    if (this.jsxsupermix(objEvent, objGUI)) return;
    var intKeyCode = objEvent.keyCode();
    var bMod = objEvent.hasModifier(true);
    var bTab = intKeyCode == Event.KEY_TAB && !bMod;

    //get the selection model
    var intSelectionModel = this.getSelectionModel(Matrix.SELECTION_ROW);

    //persist ctrl, alt, and shift key states (need to be persisted in case the call stack is broken)
    this._setCtrlKeys(objEvent);

    //resolve the focus object
    if (this._getFocusContext() == null) {
      //if at least one cell exists, set context on the appropriate object (the cell or its parent row)
      var objElm = this._getFirstCell();
      if (objElm) {
        this._setFocusContext(objElm.id);
      } else {
        return;
      }
    }

    var objEventTarget = this._getFocusObject();
    var src = objEvent.srcElement();
    var bBodyFocused = src && src.id == this.getId() + "_body";

    var bAuto = this._getAutoRow() && objEventTarget && this._isAutoRow(objEventTarget.parentNode);
    var bCaptured = false;
    if (bAuto && (intKeyCode == Event.KEY_ENTER || intKeyCode == Event.KEY_ARROW_DOWN || intKeyCode == Event.KEY_ARROW_UP ||
      (objEventTarget.parentNode.lastChild == objEventTarget && ((bTab && !objEvent.shiftKey()) || intKeyCode == Event.KEY_ARROW_RIGHT)) ||
      (objEventTarget.parentNode.firstChild == objEventTarget && ((bTab && objEvent.shiftKey()) || intKeyCode == Event.KEY_ARROW_LEFT)))) {

      //when keying around in the auto row, user cannot escape without explicitly entering down or up arrow.
      var intIndex = objEventTarget.cellIndex;
      if (intKeyCode == Event.KEY_ENTER) {
        //commit the new row if enter key was pressed
        this._cleanUpEditSession(objEvent);
        //give focus back to the target cell (what fired this event); because user action may result in the autorow pointer becoming null, re-resolve if necessary
        var objTR = objEventTarget.parentNode;
        if (!objTR) objTR = this._getRowById("jsxautorow");
        if (objTR && objTR.childNodes[intIndex])
          html.focus(objTR.childNodes[intIndex]);
      } else if (this._getAutoRow() == 2 && intKeyCode == Event.KEY_ARROW_DOWN) {
        //give focus to first row in first panel if top orientation and down arrow
        var objPanel = this._getFirstPanel();
        if (objPanel) {
          var objRow = this._getFirstRow(objPanel);
          if (objRow) html.focus(objRow.childNodes[intIndex]);
        }
      } else if (this._getAutoRow() == 1 && intKeyCode == Event.KEY_ARROW_UP) {
        //give focus to last row in last panel if bottom orientation and up arrow
        var objPanel = this._getLastPanel();
        if (objPanel) {
          var objRow = this._getLastRow(objPanel);
          if (objRow) html.focus(objRow.childNodes[intIndex]);
        }
      } else if (objEventTarget.parentNode.lastChild == objEventTarget && ((bTab && !objEvent.shiftKey()) || intKeyCode == Event.KEY_ARROW_RIGHT)) {
        html.focus(objEventTarget.parentNode.firstChild);
      } else if (objEventTarget.parentNode.firstChild == objEventTarget && ((bTab && objEvent.shiftKey()) || intKeyCode == Event.KEY_ARROW_LEFT)) {
        html.focus(objEventTarget.parentNode.lastChild);
      }
      bCaptured = true;
    } else if (objEventTarget) {
      //navigate, execute, etc if the proper key sequence
      var intIndex = objEventTarget.cellIndex;
      var strId = objEventTarget.parentNode.getAttribute("jsxid");

      //branch depending upon key type
      if (intKeyCode == Event.KEY_ARROW_UP || (intKeyCode == Event.KEY_ENTER && objEvent.shiftKey())) {
        var objToElement = this._getNavToCell("N",objEventTarget,true,intIndex);
        bCaptured = this._focusOnDelay(objToElement);
      } else if (intKeyCode == Event.KEY_ARROW_DOWN || (intKeyCode == Event.KEY_ENTER && !objEvent.shiftKey() && intSelectionModel == Matrix.SELECTION_UNSELECTABLE)) {
        var objToElement = this._getNavToCell("S",objEventTarget,true,intIndex);
        bCaptured = this._focusOnDelay(objToElement);
      } else if (intKeyCode == Event.KEY_ARROW_LEFT || (bTab && objEvent.shiftKey())) {
        //on left arrow when in first cell of the tree, close (or nav up)
        if (this.getRenderingModel() == Matrix.REND_HIER && intIndex == 0 && this.getSuppressVScroller() != 1) {
          var strCdfId = objEventTarget.parentNode.getAttribute("jsxid");
          var objRNode = this.getRecordNode(strCdfId);
          var intOpen = this._cdfav(objRNode, "open");
          if (intOpen == 1 && objRNode.selectSingleNode(this._cdfan("children"))) {
            //close it and exit
            var objTIGUI = this._getToggler(objEventTarget);
            this._showHideContainer(objEvent, objTIGUI, false);
            bCaptured = true;
          } else {
            //it's closed, so act as if it was an up arrow
            var objToElement = this._getNavToCell("W",objEventTarget,true,intIndex);
            bCaptured = this._focusOnDelay(objToElement);
          }
        }

        if (!bCaptured && !bBodyFocused) {
          var objToElement = this._getNavToCell("W",objEventTarget,true,intIndex);
          if (objToElement != objEventTarget)
            bCaptured = this._focusOnDelay(objToElement);
        }
      } else if (intKeyCode == Event.KEY_ARROW_RIGHT || (bTab && !objEvent.shiftKey())) {
        //on right arrow when in first cell of the tree, open (or nav down)
        if (this.getRenderingModel() == Matrix.REND_HIER && intIndex == 0 && this.getSuppressVScroller() != 1) {
          var strCdfId = objEventTarget.parentNode.getAttribute("jsxid");
          var objRNode = this.getRecordNode(strCdfId);
          var intOpen = this._cdfav(objRNode, "open");
          //only assume this tree can be opened if it has a lazy attribute (yet to be implemented) or a child record
          //TO DO: implement 'lazy' interface as in jsx3.gui.Tree
          if (intOpen != 1 && (this._cdfav(objRNode, "lazy") == "1" || objRNode.selectSingleNode(this._cdfan("children")))) {
            //open it and exit
            var objTIGUI = this._getToggler(objEventTarget);
            this._showHideContainer(objEvent, objTIGUI, true);
            bCaptured = true;
          } else {
            //it's closed, so act as if it was an right arrow
            var objToElement = this._getNavToCell("E",objEventTarget,true,intIndex);
            bCaptured = this._focusOnDelay(objToElement);
          }
        }

        if (!bCaptured && !bBodyFocused) {
          var objToElement = this._getNavToCell("E",objEventTarget,true,intIndex);
          if (objToElement != objEventTarget)
            bCaptured = this._focusOnDelay(objToElement);
        }
      } else if (intKeyCode == Event.KEY_ENTER) {
        //fire the execute event (the same as dblclicking)
        this._doExecute(objEvent);
        bCaptured = true;
      } else if (intKeyCode == Event.KEY_ESCAPE) {
        jsx3.log("escape key " + this);
        this.collapseEditSession(objEvent, objGUI);
        this.focus();
        bCaptured = true;
      }
    }

    if (!bCaptured && bTab) {
      html[objEvent.shiftKey() ? "focusPrevious" : "focusNext"](this.getRendered(objEvent), objEvent);
    }

    //if the key event was handled, cancel here
    if (bCaptured) objEvent.cancelAll();
  };

  Matrix_prototype.focus = function() {
    var r = this.getRendered();
    if (r)
      jsx3.html.focus(r.ownerDocument.getElementById(this.getId() + "_body"));
  };

  /**
   * Gives focus to the given element, but via delay for better responsiveness
   * @param objToElement {HTMLElement} TD
   * @return {Boolean} true if objToElement exists
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._focusOnDelay = function(objToElement) {
    if (objToElement) {
      //TO DO: Seems that the delay might no longer needed. Validate and remove when possible...ok for now, however.
      jsx3.sleep(function() {
        try {
          html.focus(objToElement);
        } catch (e) {;}
      });
      return true;
    }
  };

  /**
   * Returns the native TD element containing the plus/minus icon when rendering hierarchical mode
   * @param objReference {HTMLElement} TD
   * @return {HTMLElement} TD
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getToggler = function(objReference) {
    var objTable = objReference.childNodes[0].childNodes[0];
    var objRow = this._getFirstRow(objTable);
    if (objRow) return objRow.childNodes[0];
  };

  /**
   * Returns the index of the active column when navigating with keys
   * @return {int}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getCachedIndex = function() {
    return this._jsxcachedindex;
  };

  /**
   * Sets the index of the active column when a 'spanned' category row is encountered.  When the spanned row is exited, the appriate index will be reassigned
   * @param intIndex {int} index according to <code>this._getDisplayedChildren</code>
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._setCachedIndex = function(intIndex) {
    /* @jsxobf-clobber */
    this._jsxcachedindex = intIndex;
  };

  /**
   * Returns the 'to' cell when navigating rows and cells
   * @param DIRECTION {String} one of: N, S, E, W
   * @param objReference {HTMLElement} TD
   * @param bFetch {Boolean} if true, load the appropriate panel if not loaded
   * @param intIndex {int} if not null, the index of a specific cell
   * @return {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getNavToCell = function(DIRECTION,objReference,bFetch,intIndex) {
    var strType = this.getSelectionModel(Matrix.SELECTION_ROW);
    if (DIRECTION == "E") {
      this._setCachedIndex();
      if (objReference.parentNode.lastChild != objReference) {
        return objReference.nextSibling;
      } else if (objReference.parentNode.lastChild == objReference && strType > Matrix.SELECTION_UNSELECTABLE) {
        //row-based selection, simply loop back to the first cell in the row. do not traverse down the dom
        return objReference.parentNode.firstChild;
      } else {
        //modify the input parameters to leverage N/S row navigators
        DIRECTION = "S";
        objReference = objReference.parentNode.firstChild;
        intIndex = 0;
      }
    } else if (DIRECTION == "W") {
      this._setCachedIndex();
      if (objReference.parentNode.firstChild != objReference) {
        return objReference.previousSibling;
      } else if (objReference.parentNode.firstChild == objReference && strType > Matrix.SELECTION_UNSELECTABLE) {
        //row-based selection, simply loop back to the last cell in the row. do not traverse up the dom
        return objReference.parentNode.lastChild;
      } else {
        //modify the input parameters to leverage N/S row navigators
        DIRECTION = "N";
        objReference = objReference.parentNode.lastChild;
        intIndex = objReference.cellIndex;
      }
    }

    //use the row navigation logic to find the correct row to navigate to
    var objNavTo = this._getNavToRow(DIRECTION,objReference.parentNode,bFetch);

    //resolve the row back to the cell at the appropriate index
    if (objNavTo) {
      if (this._getCachedIndex() && (DIRECTION=="N" || DIRECTION == "S") && objNavTo.childNodes.length > 1) {
        intIndex = this._getCachedIndex();
        this._setCachedIndex();
      }

      var objCell = objNavTo.childNodes[intIndex];
      if (objCell) {
        return objCell;
      } else {
        //remember the cell index. when the colspan row is next exited north or south, use the cached value as opposed to intIndex
        this._setCachedIndex(intIndex);
        return objNavTo.childNodes[0];
      }
    } else {
      return null;
    }
  };

  /**
   * Returns the 'to' row when navigating in row mode
   * @param DIRECTION {String} one of: N, S, E, W (E will be resolved to S; W will be resolved to N)
   * @param objReference {HTMLElement} TR
   * @param bFetch {Boolean} if true, load the appropriate panel if not loaded
   * @return {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getNavToRow = function(DIRECTION,objReference,bFetch) {
    //resolve left and right arrows
    if (DIRECTION == "W")
      DIRECTION = "N";
    else if (DIRECTION == "E")
      DIRECTION = "S";

    if (this.getRenderingModel() == Matrix.REND_HIER)
      return this._getHierarchicalNavToRow(DIRECTION,objReference);

    if (DIRECTION == "N" && objReference.previousSibling && objReference.previousSibling.tagName.toLowerCase() != "colgroup") {
      return objReference.previousSibling;
    } else if (DIRECTION == "S" && objReference.nextSibling){
      return objReference.nextSibling;
    } else {
      //the reference row may be contained by another panel
      var intCurrentPanelIndex = this._getIndexForPanel(this._getPanelForRow(objReference));
      var objPanel;
      var intMaxPossiblePanels = (this.getRenderingModel() == Matrix.REND_HIER) ? this._getRowCount() : this._getPanelArray().length;
      if ((DIRECTION == "N" && intCurrentPanelIndex == 0) || (DIRECTION == "S" && intCurrentPanelIndex == intMaxPossiblePanels - 1)) {
        //if there are no more concrete panels to navigate to, see if user if the autorow panel exists and is appropriately positioned
        if ((DIRECTION == "N" && this._getAutoRow() == 2) || (DIRECTION == "S" && this._getAutoRow() == 1))
          return this._getFirstRow(this._getAutoRowPanel());
        else
          return null;
      } else if (DIRECTION == "N" && (objPanel = this._getPanelByIndex(intCurrentPanelIndex-1)) != null) {
        //return the last row (TR) of the preceding panel
        var intRowCount = (this.getRenderingModel() == Matrix.REND_HIER) ? 1 : this.getRowsPerPanel(Matrix.DEFAULT_ROWS_PER_PANEL);
        return this._getLastRow(objPanel);
      } else if (DIRECTION == "S" && (objPanel = this._getPanelByIndex(intCurrentPanelIndex+1)) != null) {
        //return the first row of the following panel
        return this._getFirstRow(objPanel);
      }
    }

    return null;
  };

  /**
   * Returns the appropriate row object (TR) when using the heirarchical rendering model
   * @param DIRECTION {String} one of: N, S
   * @param objReference {HTMLElement} TR
   * @return {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getHierarchicalNavToRow = function(DIRECTION,objReference) {
    var objGUI = objReference;
    if (DIRECTION == "N") {
      //resolve the TABLE that owns the reference row
      while (objGUI.tagName.toLowerCase() != "table") objGUI = objGUI.parentNode;

      //attempts 1,2: recursively get 'previous sibling structure's last visible child structure'; or the 'previous sibling'
      var objStructure = this._getHierarchicalNavToRowPrev(objGUI.parentNode.previousSibling);
      if (objStructure) return objStructure;

      //atempt 3: get 'parent' structure
      var objParentTable = objGUI.parentNode.parentNode.previousSibling;
      return this._getFirstRow(objParentTable);
    } else if (DIRECTION == "S") {
      //resolve TABLE that owns the reference row
      while (objGUI.tagName.toLowerCase() != "table") objGUI = objGUI.parentNode;

      //attempt 1: get the 'first child' structure (if children are displayed)
      var objContentDiv = objGUI.nextSibling;
      //are the child(ren) visible?
      if (objContentDiv && objContentDiv.style.display.toLowerCase() != "none") {
        //resolve TABLE that depicts the first child (the first table belonging to the first rendered div)
        var objChildTable = objContentDiv.childNodes[0].childNodes[0];
        return this._getFirstRow(objChildTable);
      }

      //attempt 2: get 'next sibling' structure
      objContentDiv = objGUI.parentNode.nextSibling;
      if (objContentDiv) {
        //resolve TABLE that depicts the first child (the first table belonging to the first rendered div)
        var objChildTable = objContentDiv.childNodes[0];
        return this._getFirstRow(objChildTable);
      }

      //attempt 3: recursively get 'parent structure's next sibling'
      return this._getHierarchicalNavToRowNext(objGUI.parentNode);
    }

    return null;
  };

  /**
   * Returns the last child of the parent's previous sibling, recursing until a null is reached.
   * @param objStructure {HTMLElement} DIV that contains the controller table and child content div (div[div | table])
   * @return {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getHierarchicalNavToRowPrev = function(objStructure) {
    if (objStructure) {
      //get the 'children' container
      var objContentDiv = objStructure.childNodes[1];

      //if container is visible and has content, get the last child structure
      if (objContentDiv && objContentDiv.style.display.toLowerCase() != "none" && objContentDiv.childNodes.length) {
        var objLastStructure = objContentDiv.lastChild;

        //if the last child structure has visible children, recurse; otherwise return LastStructure
        objContentDiv = objLastStructure.childNodes[1];
        if (objContentDiv && objContentDiv.style.display.toLowerCase() != "none" && objContentDiv.childNodes.length) {
          return this._getHierarchicalNavToRowPrev(objLastStructure);
        } else {
          return this._getFirstRow(objLastStructure.childNodes[0]);
        }
      }

      //return the structure's row (this is the context row to select)
      return this._getFirstRow(objStructure.childNodes[0]);
    }

    return null;
  };

  /**
   * Returns the next sibling of the parent structure of <code>objStructure</code>, recursing until a null is reached
   * @param objStructure {HTMLElement} DIV that contains the controller table and child content div (div[div | table])
   * @return {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getHierarchicalNavToRowNext = function(objStructure) {
    //get next sibling structure structure
    var objParentNext = objStructure.parentNode.parentNode.nextSibling;

    if (objParentNext) {
      return this._getFirstRow(objParentNext.childNodes[0]);
    } else {
      //get next sibling structure structure
      var objParentStructure = objStructure.parentNode.parentNode;
      if (objParentStructure)
        return this._getHierarchicalNavToRowNext(objParentStructure);
    }

    return null;
  };

  /**
   * Moves the H/V scrollers such that the given reference object is scrolled into view
   * @param objReference {HTMLElement} TD to move within the viewport
   * @private
   */
  Matrix_prototype._scrollIntoView = function(objReference) {
    var objGUI = this.getRendered(objReference);
    if(objGUI) {
      var objP = html.getRelativePosition(this._getViewPane(objGUI),objReference);
      var intScrollTop = this.getScrollTop();
      var intRefTop = objP.T;
      var intScrollSize = Box.getScrollSize();
      var intDec = (objGUI.childNodes[3].style.display == "none") ? 0 : intScrollSize;
      var intVPHeight = parseInt(this.getBoxProfile(true).getChildProfile(1).getClientHeight() - intDec + 1);
      //jsx3.log(this.getId() + ":" + intScrollTop + " < " + intRefTop  + " < " + (intScrollTop + (intVPHeight )));
      if (!(intRefTop > intScrollTop && (intRefTop + objP.H) < (intScrollTop + intVPHeight))) {
        //the given object is not visible within the viewpane. determine if top or bottom is closest
        var intTopOffset = Math.abs(intRefTop - intScrollTop);
        var intBottomOffset = Math.abs(intRefTop - (intScrollTop + intVPHeight) + objP.H + 1);
        //jsx3.log(intBottomOffset + " < " + intTopOffset + "::" + intRefTop + ":" + intScrollTop + ":" + intVPHeight);
        if (intBottomOffset < intTopOffset) {
          if (intBottomOffset == 0) intBottomOffset = objP.H;
            //closer to bottom
            this.setScrollTop(intScrollTop + intBottomOffset);
        } else {
          this.setScrollTop(intRefTop - (intScrollSize + 1));
        }
      }

      //only adjust left scroll if NOT in scalewidth mode.
      if (this.getScaleWidth() != 1) {
        var intScrollLeft = this.getScrollLeft();
        var intRefLeft = objP.L;
        var intVPWidth = parseInt(this.getBoxProfile(true).getChildProfile(1).getClientWidth() - intScrollSize + 1);
        //jsx3.log(intScrollLeft + " < " + (intRefLeft + objP.W)  + " < " + (intScrollLeft + (intVPWidth -  (intScrollSize + 1))));
        if (!(intRefLeft > intScrollLeft && (intRefLeft + objP.W) < (intScrollLeft + (intVPWidth -  (intScrollSize + 1))))) {
          //the given object is not visible within the viewpane. determine if top or bottom is closest
          var intLeftOffset = Math.abs(intRefLeft - intScrollLeft);
          var intRightOffset = Math.abs(intRefLeft - (intScrollLeft + intVPWidth));
          if (intRightOffset < intLeftOffset) {
            //closer to bottom
            //LUKE: commented this out.  setting the scroll position should be adequate to cascade the necessary position, without explicitly setting here
            //this._getViewPane().style.left = -(intScrollLeft + (intVPWidth)) + "px";
            this.setScrollLeft(intRefLeft);
          } else {
            this.setScrollLeft(intRefLeft - (intScrollSize + 1));
          }
        }
      }
    }
  };

// ***********************************************+
// ********* COLUMN RESIZE LOGIC *****************|
// ***********************************************+

  /**
   * Returns the HTML required to draw the on-screen resize anchors
   * @param objChildren {Array} child columns to render on-screen
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._paintResizeAnchors = function(objChildren) {
    var a = [];
    var intLeft = 0;

    var ob1 = this.getBoxProfile().getChildProfile(0);
    var intHeight = ob1.getClientHeight();

    var objWidthArray = this._getColumnWidths();

    for (var i=0;i<objChildren.length;i++) {
      var b1 = objChildren[i].getBoxProfile();
      intLeft += b1.getOffsetWidth();

      //only cells according to the following can be resized
      var bEnabled = (this.getResizable() != 0 && i < objChildren.length -1 && objChildren[i].getResizable() != 0);

      if (bEnabled) {
        var strEvents = this.renderHandler(Event.MOUSEDOWN, '_doStartResize', 3) + this.renderHandler(Event.DOUBLECLICK, '_doStartAutoResize', 3);
        var strStyles = "";
      } else {
        var strEvents = "";
        var strStyles = "visibility:hidden;";
      }

      a.push('<div class="jsx30matrix_resize_anchor" jsxindex="' + i + '" style="left:' + (intLeft - 4) + 'px;' +
           strStyles + 'width:' + 4 + 'px;background-image:url(' + Block.SPACE + ');height:' + intHeight + 'px;" ' +
           strEvents + '>&#160;</div>');
    }
    return a.join('');
  };

  /**
   * Called by mouse down on resize anchor in header row (the anchors are floating divs that are positioned over the right edge of any column)
   * @param objEvent {jsx3.gui.Event}
   * @param objAnchor {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._doStartResize = function(objEvent, objAnchor) {
    if (!objEvent.leftButton()) return;

    //handle mousedown
    Event.publish(objEvent);

    //end the edit session
    //this.endEditSession();
    this.collapseEditSession(objEvent, objAnchor);

    //resolve the index (pass the model index, not the display index)
    var intIndex = jsx3.util.arrIndexOf(this.getDescendantsOfType(Painted, true),
        this._getDisplayedChildren()[Number(objAnchor.getAttribute("jsxindex"))]);
    this._setActiveColumnIndex(intIndex);

    //exit early if the user clicked quickly in succession. if the resize bar were to be painted, the dbl-click would never fire.
    if (typeof(this._jsxdblclick) == "object" && (new Date()).valueOf() - this._jsxdblclick.timestamp < 200) return;

    //fire the before resize event (cancelable)
    var bContinue = this.doEvent(Interactive.BEFORE_RESIZE,
          {objEVENT:objEvent, intCOLUMNINDEX:intIndex});

    //continue if user didn't return false
    if (!(bContinue === false)) {
      //position the resize bar
      var objBar = this._getResizeBar();
      var intOrigin = parseInt(objAnchor.style.left) - this.getScrollLeft();
      this._jsxresizeorigin = {origin:intOrigin};
      objBar.style.left = intOrigin + "px";

      //the resize needs to be constrained (top:0)
      Interactive._beginMoveConstrained(objEvent,objBar,function(x,y) {return [x,0];});
      Event.subscribe(Event.MOUSEUP, this, "_onDoneResize");
    }

    //persist time of the mousedown event. if called again within 200ms, signifies a dblclick (which signifies an auto-resize)
    /* @jsxobf-clobber */
    this._jsxdblclick = {timestamp:(new Date()).valueOf()};

    //cancel the event
    objEvent.cancelAll();
  };

  /**
   * Called by dbl-click on resize anchor in header row. Signifies an adjusted resize that will find the true content width and auto-adjust
   * @param objEvent {jsx3.gui.Event}
   * @param objAnchor {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._doStartAutoResize = function(objEvent, objAnchor) {
    if (!objEvent.leftButton()) return;

    //handle mousedown
    Event.publish(objEvent);

    //resolve the index (pass the model index, not the display index)
    var intIndex = this._getActiveColumnIndex(intIndex);

    //LOG.trace('...still need logic here to find the widest cell and make the column exactly as wide, ' + intIndex);
    // Add resizing logic -dhwang
    var charWidth = Math.round((this.getFontSize() || jsx3.gui.Block.DEFAULTFONTSIZE) * 3/4);
    var col = this.getChild(this._getActiveColumnIndex());
    var att = col.getPath();

    var maxLength = 0;
    var objXML = this.getXML();
    var itrNodes = objXML.selectNodeIterator("//" + this._cdfan("children"));
    while (itrNodes.hasNext()) {
      var node = itrNodes.next();
      maxLength = Math.max(node.getAttribute(att).length, maxLength) ;
    }

    var intNewWidth = charWidth * maxLength;

    this.getChild(this._getActiveColumnIndex()).setWidth(intNewWidth, true);
    this._updateScrollOnPaint();
    //cancel the event
    objEvent.cancelAll();
  };

  /**
   * Returns the index of the active column (the one being resized, moved, sorted, etc). This is the 'displayed column' index
   * @return {int}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getActiveColumnIndex = function() {
    return this._jsxdraghandleindex;
  };

  /**
   * Sets the index of the active column (the one being resized, moved, sorted, etc). This is the 'displayed column' index
   * @param intIndex {int} index according to <code>this._getDisplayedChildren</code>
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._setActiveColumnIndex = function(intIndex) {
    /* @jsxobf-clobber */
    this._jsxdraghandleindex = intIndex;
  };

  /**
   * Returns resize bar that moves during the resize
   * @return {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getResizeBar = function() {
    return this.getRendered().childNodes[6];
  };

  /**
   * Returns insert arrow object that is positioned during a drop event to designate to the user
   * whether or not it is an insertbefore or appendchild
   * @param objGUI {jsx3.gui.Matrix}
   * @return {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getDropIcon = function(objGUI) {
    if (!objGUI) objGUI = this.getRendered();
    return objGUI.childNodes[7];
  };

  /**
   * Resets the drop icon to its initial state; hides it
   * @param objGUI {jsx3.gui.Matrix}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._resetDropIcon = function(objGUI) {
    var objIcon = this._getDropIcon(objGUI);
    objIcon.style.display = "none";
    objIcon.removeAttribute("dropverb");
    objIcon.removeAttribute("rowcontext");
  };

  /**
   * called when the drag completes (mouse up)
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._onDoneResize = function(objEvent) {
    //end the event and unsubscribe
    jsx3.EventHelp.reset();
    Event.unsubscribe(Event.MOUSEUP, this, "_onDoneResize");

    //only proceed if the resize bar actually moved
    if (parseInt(this._getResizeBar().style.left) != this._jsxresizeorigin.origin) {
      //get the value (where is the bar)
      var intNewWidth = this._getConstrainedWidth();

      //resolve the 'model' index against the 'displayed child' index (only expose the model)
      var intIndex = this._getActiveColumnIndex();

      // fire the 'afterresize' event code
      var bContinue = this.doEvent(Interactive.AFTER_RESIZE,
                                   {objEVENT:objEvent.event, vntWIDTH:intNewWidth, intCOLUMNINDEX:intIndex, _gipp:1});

      //if bound 'afterresize' event returned false, cancel the resize
      if (!(bContinue === false))
        this.getChild(this._getActiveColumnIndex()).setWidth(intNewWidth, true);

      this._updateScrollOnPaint();
    }
    //hide the resize bar
    this._getResizeBar().style.left = -6 + "px";
  };

  /**
   * Returns the value represented by the current position of the column resize bar. Called by afterresize to determine the true size (what will be set via setWidth)
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getConstrainedWidth = function() {
    //get actual
    var objBar = this._getResizeBar();
    var intLeft = parseInt(objBar.style.left);

    //decrement the left (less the sum of the preceding widths); this is the new width
    var objChildren = this._getDisplayedChildren();
    var objWidthArray = this._getColumnWidths();
    var intDisplayIndex = this.getChild(this._getActiveColumnIndex()).getDisplayIndex();
    for (var i=0;i<intDisplayIndex;i++)
      intLeft -= objWidthArray[i];

    //add scrollleft for final true width
    intLeft += this.getScrollLeft();

    //now reset scrollleft
    //TO DO: do not reset scrollleft position
    //this.setScrollLeft(0);

    //return (all columns must be at least 4 pixels wide)
    return (intLeft < Matrix.MINIMUM_COLUMN_WIDTH) ? Matrix.MINIMUM_COLUMN_WIDTH : intLeft;
  };

  /**
   * Returns whether or not this column can be resized by the user. If not set, the column will be assumed resizable
   * @return {int}
   */
  Matrix_prototype.getResizable = function() {
    return this.jsxresize;
  };

  /**
   * Sets whether or not this column can be resized by the user. If not set, the column will be assumed resizable. Note that if the parent Matrix
   * is set as NOT resizable, this setting is ignored and no child columns can be resized
   * @param RESIZE {int}
   */
  Matrix_prototype.setResizable = function(RESIZE) {
    this.jsxresize = RESIZE;
  };

  /**
   * Called by _onPaint event. Determines the number of panels needed for the paging mechanism and then resets the panel array to reflect this number
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._configurePanelArray = function() {
    //reset paint queue whenever the panel array is reconfigured as they are directly linked
    this._resetPaintQueue();

    //this callout refreshes the count (passes true to getrowcount)
    var intPanelCount = Math.max(1, Math.ceil(
        this._getRowCount(true) / this.getRowsPerPanel(Matrix.DEFAULT_ROWS_PER_PANEL)));
    this._setPanelArray(new Array(intPanelCount));
  };

  /**
   * Callback to the paint event
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._onPaint = function(bUpdateScroll, bNoMasks) {
    // JCG: timeout entry point
    if (this.getParent() == null) return;

    //end any autorow session
    this._cancelAutoRowSession();

    //end any edit session
    this.endEditSession();

    //reset any selection, navigation index, and focus tracking variables
    this._setCachedIndex();
    this._setSelectionAnchor();
    this._setFocusContext();

    //determine number of panels needed by the paging mechanism
    this._configurePanelArray();
    var intPanelLength = this._getPanelArray().length;

    //reset the viewpane if paging used (possible left over content during sort, reorder, lost timeout, etc)
    var intModel = this.getPagingModel(Matrix.PAGING_OFF);
    if (intModel == Matrix.PAGING_OFF || intModel == Matrix.PAGING_STEPPED) {
      //the data is already painted; apply the 2-pass formatters
      var myToken = {painted:1,token:Matrix.getToken(),index:0};
      if (this.getRenderingModel() == Matrix.REND_HIER) myToken.contextnodes = this._getViewPane().childNodes;
      this._getPanelArray()[0] = myToken;
      this._applyFormatHandlers(myToken, true);

      //apply the formathandler to the autorow
      if (this._getAutoRow()) {
        var myAutoToken = {painted:1,token:Matrix.getToken(),index:-1};
        this._applyFormatHandlers(myAutoToken, true);
      }
    } else {
      //paint data rows depending upon the paging model
      this._getViewPane().innerHTML = "";
      if (intModel == Matrix.PAGING_PAGED) {
        //must add an explicit height to the viewpane
        this._getViewPane().style.height = this._getViewPaneHeight() + "px";

    //request the two panels that most closely anticipate where the user is at and headed to
    var intPanelIndex = this._getActivePanelIndex() ? this._getActivePanelIndex() : 0;

      //loop three times to fetch content. self and two adjacent panels
      var bQueued;

      //by half...etc
      var intPaintQueueSize = this.getPanelQueueSize(Matrix.DEFAULT_PANEL_QUEUE_SIZE);
      var intPaintQueueSize1 = parseInt(intPaintQueueSize / 2);
      var intPaintQueueSize2 = intPaintQueueSize - intPaintQueueSize1;

      for (var i = intPanelIndex + intPaintQueueSize2;i>=intPanelIndex - intPaintQueueSize1;i--) {
        //first look for the deprioritized panel (by adding via an unshift, it will be added second to the actual panel)
        if (i >= 0 && this._isValidPanel(i)) {
          //always prioritize the content for the active panel over any content that may be waiting to paint (unshift)
          this._getPaintQueue().unshift({index:i});

        }
      }

        //call to start painting queued items
        this._paintQueuedPanels();
      } else if (intModel == Matrix.PAGING_CHUNKED) {
        //loop to load content
        for (var i=0;i<intPanelLength;i++)
          this._getPaintQueue().push({index:i});

        //add the auto-append row
        if (this._getAutoRow() == 2) {
          this._getPaintQueue().unshift({index:-1});
        } else if (this._getAutoRow() == 1) {
          this._getPaintQueue().push({index:-1});
        }

        //call to start painting queued items
        this._paintQueuedPanels();
      } else if (intModel == Matrix.PAGING_2PASS) {
        this._getPaintQueue().unshift({index:0});

        //add the auto-append row
        if (this._getAutoRow() == 2) {
          this._getPaintQueue().unshift({index:-1});
        } else if (this._getAutoRow() == 1) {
          this._getPaintQueue().push({index:-1});
        }

        //call to start painting queued panels
        this._paintQueuedPanels();
      }

      //paint any navigational/input masks
      if (! bNoMasks) {
        var strMaskHTML = this._paintMasks(false);
        if (strMaskHTML) {
          var viewPane = this._getViewPane();
          if (viewPane.lastChild)
            html.insertAdjacentHTML(viewPane.lastChild, "BeforeEnd", strMaskHTML);
          else
            viewPane.innerHTML = strMaskHTML;
        }
      }
    }

    //recalculate the scrollbars, unless called by repaintData which will calculate on its own
    if (bUpdateScroll !== false) this._updateScrollOnPaint();
  };

  /**
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getAutoRow = function() {
    return (this.getPagingModel() == Matrix.PAGING_PAGED || this.getRenderingModel() == Matrix.REND_HIER) ? 0 : this.getAutoRow();
  };

  /**
   * Returns whether or not an 'auto append' row will be rendered, allowing the user to automatically add new rows to the instance.
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  Matrix_prototype.getAutoRow = function() {
    return this.jsxautorow;
  };

  /**
   * Sets whether or not an 'auto append' row will be rendered, allowing the user to automatically add new rows to the instance. Note
   * that if the rendering model is hierarchical or the paging model is <code>jsx3.gui.Matrix.PAGING_PAGED</code>, the auto row
   * feature is disabled.  The CSS style for the auto row (a TR element) can be modified via the XSL Parameters palette, via the XSL
   * parameter, <code>jsx_autorow_style</code>
   * @param intBoolean {int} jsx3.Boolean.TRUE if the column widths should be adjusted to fully fit within the viewport
   */
  Matrix_prototype.setAutoRow = function(intBoolean) {
    this.jsxautorow = intBoolean;
  };

  /**
   * Called whenever a new panel is painted on screen to make sure that the panel pool is not exceeded
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._reap = function() {
    //only reap panels when using paging
    if (this.getPagingModel() == Matrix.PAGING_PAGED) {
      //how many total panels are active
      var objPaintedPanels = this._getPanelArray();
      var intPanelCount = this._getViewPane().childNodes.length;
      var intPanelPoolSize = this.getPanelPoolSize(Matrix.DEFAULT_PANEL_POOL_COUNT);
      var intDifference = intPanelCount - intPanelPoolSize;

      //if too many panels are on screen remove most distant ones
      if (intDifference > 0) {
        LOG.trace("Panel pool max (" + intPanelPoolSize + ") exceeded by: " + intDifference);
        //what is the current visible panel (what's showing in the viewport)
        var intIndex = this._getActivePanelIndex();
        //which panels are furthest away?
        var aLen = objPaintedPanels.length;
        if ((aLen / 2) > intIndex) {
          //scroll position is closer to the top. reap the bottom panels first
          intDifference = this._reapRange(objPaintedPanels, aLen-1, intIndex+1, intDifference,-1);
          if (intDifference<=0) return;
          intDifference = this._reapRange(objPaintedPanels, 0, intIndex-1, intDifference,1);
          if (intDifference<=0) return;
        } else {
          //scroll position is closer to the bottom. reap the upper panels first
          intDifference = this._reapRange(objPaintedPanels, 0, intIndex-1, intDifference,1);
          if (intDifference<=0) return;
          intDifference = this._reapRange(objPaintedPanels, aLen-1, intIndex+1, intDifference,-1);
          if (intDifference<=0) return;
        }
      }
    }
  };

  /**
   * Destroys those on-screen panels furthest from the active panel until the panel pool count is reduced to the specified size
   * @param objArray {Array}
   * @param intStart {int}
   * @param intEnd {int}
   * @param intDifference {int}
   * @param intDirection {int}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._reapRange = function(objArray, intStart, intEnd, intDifference,intDirection) {
    //work backwards from last panel (less 1) to intIndex. (Never destroy the last or first panels)
    for (var i=intStart;((intDirection==-1 && i>intEnd) || (intDirection==1 && i<intEnd));i+=intDirection) {
      if (objArray[i] != null) {
        //optimization: when removing a panel, also clear out any format handlers that are in the format-handler-queue
        if(this._jsx2pass && this._jsx2pass.length) {
          var myToken = objArray[i].token;
          var myList = new jsx3.util.List(this._jsx2pass);
          this._jsx2pass = myList.filter(function(objFormat) {   return myToken != objFormat[5].token;   }).toArray();
        }
        //has content. destroy
        objArray[i] = null;
        intDifference--;
        LOG.trace('reaping panel: ' + i);
        var objGUI = this._getPanelByIndex(i);
        if (objGUI) html.removeNode(objGUI);
      }
      if (intDifference<=0) return 0;
    }
    return intDifference;
  };

  /**
   * Returns the first on-screen GUI object (TABLE) representing a given panel.
   * Applies to all rendering models
   * @return {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getFirstPanel = function() {
    var objVP = this._getViewPane();
    var objKids = objVP.childNodes;
    for (var i=0;i<objKids.length;i++)
      if ((objKids[i].tagName.toLowerCase() == "table" && objKids[i].getAttribute("jsxautorow") != "true") ||
        (this.getRenderingModel() == Matrix.REND_HIER && objKids[i].getAttribute("jsxtype") == "structure"))
        return (this.getRenderingModel() == Matrix.REND_HIER) ? objKids[i].firstChild : objKids[i];
  };

  /**
   * Returns the last on-screen GUI object (TABLE) representing a given panel.
   * Applies to all rendering models
   * @return {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getLastPanel = function() {
    var objVP = this._getViewPane();
    var objKids = objVP.childNodes;
    for (var i=objKids.length-1;i>=0;i--)
      if ((objKids[i].tagName.toLowerCase() == "table" && objKids[i].getAttribute("jsxautorow") != "true") ||
        (this.getRenderingModel() == Matrix.REND_HIER && objKids[i].getAttribute("jsxtype") == "structure"))
        return (this.getRenderingModel() == Matrix.REND_HIER) ? objKids[i].firstChild : objKids[i];
  };

  /**
   * Returns the autorow panel (TABLE) if it exists
   * @return {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getAutoRowPanel = function() {
    return this._getPanelByIndex(-1);
  };

  /**
   * Returns the on-screen GUI object (TABLE) representing a given panel. Does not apply to hierarchical rendering,
   * as panels are not indexed when in that mode
   * @param intIndex {int}
   * @return {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getPanelByIndex = function(intIndex) {
    var objDoc = this.getDocument();
    return objDoc.getElementById(this.getId() + "jsx_" + intIndex);
  };

  /**
   * Returns the paging index for a given on-screen panel
   * @param objPanel {HTMLElement} HTML TABLE element
   * @return {int}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getIndexForPanel = function(objPanel) {
    return parseInt((objPanel.id + "").replace(this.getId() + "jsx_",""));
  };

  /**
   * Returns the on-screen panel containing the given row
   * @param objRow {HTMLElement} HTML TR element
   * @return {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getPanelForRow = function(objRow) {
    if (objRow.parentNode.tagName.toLowerCase() == "table") return objRow.parentNode;
    return objRow.parentNode.parentNode;
  };

  /**
   * Returns the on-screen GUI object (TR) at the given panel index
   * @param vntPanel {Object | int} index of panel to get the row for or the panel instance (or panel (TABLE) instance)
   * @param intRowIndex {int} zero-based index of row
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getRowByIndex = function(vntPanel,intRowIndex) {
    if (!isNaN(vntPanel)) vntPanel = this._getPanelByIndex(vntPanel);

    if (vntPanel) {
      var cg = 0;
      for (var j=0;j<vntPanel.childNodes.length;j++) {
        //account for tbody
        if (vntPanel.childNodes[j].tagName.toLowerCase() == "tbody") {
          return vntPanel.childNodes[j].childNodes[intRowIndex];
        } else if (vntPanel.childNodes[j].tagName.toLowerCase() == "tr") {
          return vntPanel.childNodes[intRowIndex+cg];
        } else {
          //account for column group offset
          cg++;
        }
      }
    }

    return null;
  };

  /**
   * Returns the on-screen GUI object (TR) indentified by the CDF record id that generated it
   * @param strCdfId {String} jsxid property for CDF record to select in the view
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getRowById = function(strCdfId) {
    var strId = this.getId() + "_jsx_" + strCdfId;
    var objDoc = this.getDocument();
    return objDoc.getElementById(strId);
  };

  /**
   * Returns the on-screen GUI object (DIV) indentified by the CDF record id that generated it.
   * Use when rendering in hierarchical mode and needing a handle to the entire structure (self and descendants), not
   * just the row itself representing the singular element (TR)
   * @param strCdfId {String} jsxid property for CDF record to select in the view
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getStructureById = function(strCdfId) {
    var objRow = this._getRowById(strCdfId);
    return (objRow) ? this._getPanelForRow(this._getRowById(strCdfId)).parentNode : null;
  };

  /**
   * Returns the on-screen GUI object (TD) indentified by the CDF record id that generated it and the
   * first mapped column whose path (getPath) is mapped to the given CDF attribute.
   * @param strCdfId {String} jsxid property for CDF record to select in the view
   * @param strAttName {String} attribute name on the CDF record. For example, <code>jsxtext</code>
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getCellById = function(strCdfId,strAttName) {
    var objDChildren = this._getDisplayedChildren();
    for (var i=0;i<objDChildren.length;i++) {
      if (objDChildren[i].getPath() == strAttName) {
        var strId = this.getId() + "_jsx_" + strCdfId + "_jsx_" + i;
        var objDoc = this.getDocument();
        return objDoc.getElementById(strId);
      }
    }

    return null;
  };

  /**
   * Returns the on-screen GUI object (TD) at the given index
   * @param strCdfId {String} jsxid property for CDF record to select in the view
   * @param intCellIndex {int} zero-based index of cell (on-screen) -- this is a
   * view method, so the indexing maps to the displayed children
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getCellByIndex = function(strCdfId,intCellIndex) {
    var objRow = this._getRowById(strCdfId);
    return objRow ? objRow.childNodes[intCellIndex] : null;
  };

  /**
   * Returns the first data cell in the viewpane (0,0,0)
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getFirstCell = function() {
    var objRow = this._getRowByIndex(0,0);
    return objRow ? objRow.childNodes[0] : null;
  };

  /**
   * Returns the first table row (TR) appropriate to the browser and given existence of columngroup
   * tags, etc (makes less brittle)
   * @pram objTable {HTMLElement} HTML TABLE Object (a 'panel')
   * @return {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getFirstRow = function(objTable) {
    return this._getRowByIndex(objTable,0);
  };

  /**
   * Returns the last table row (TR) appropriate to the browser and given existence of columngroup
   * tags, etc (makes less brittle)
   * @pram objTable {HTMLElement} HTML TABLE Object (a 'panel')
   * @return {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getLastRow = function(objTable) {
    var objRow = this._getRowByIndex(objTable,0);
    return objRow ? objRow.parentNode.lastChild : null;
  };

  /**
   * Called by mousing down on the h scrollbar. Ends the edit session, collapses the heavyweight, and gives focus to the scroller
   * @param objEvent {jsx3.gui.Event}
   * @param objGUI {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._ebMouseDownH = function(objEvent,objGUI) {
    this.collapseEditSession(objEvent,objGUI);
  };

  /**
   * Called by mousing down on the v scrollbar. Ends the edit session and collapses any heavyweight used by the given mask
   * @param objEvent {jsx3.gui.Event}
   * @param objGUI {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._ebMouseDownV = function(objEvent,objGUI) {
    this.collapseEditSession(objEvent,objGUI);
  };

  /**
   * Called by scrolling left right
   * @param objEvent {jsx3.gui.Event}
   * @param objGUI {HTMLElement} the horizontal scroller
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._ebScrollH = function(objEvent,objGUI) {
    var my = objGUI.parentNode;
    var objHeadPane = my.childNodes[0].childNodes[0];
    var objViewPane = my.childNodes[1].childNodes[0];
    var intLeft = objGUI.scrollLeft;

    //the browser's own 'scrollintoview' feature can corrupt the attempt to move objects onscreen while also giving them focus; cancel here by manually setting to 0
    my.childNodes[1].scrollLeft = 0;

    //update left CSS to an absolute location to reflect the position of the scrollers
    objHeadPane.style.left = "-" + intLeft + "px";
    objViewPane.style.left = "-" + intLeft + "px";

    //fire the jsxscroll event
    if (objEvent)
      this.doEvent(Interactive.SCROLL, {objEVENT:objEvent, strDIRECTION:"horizontal", intPOSITION:intLeft});
  };

  /**
   * Called by scrolling up/down
   * @param objEvent {jsx3.gui.Event}
   * @param objGUI {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._ebScrollV = function(objEvent,objGUI) {
    //get the view pane (the moveable box that lives within the view port)
    var objViewPane = this._getViewPane(objGUI.parentNode);

    //the browser's own 'scrollintoview' feature can corrupt the attempt to move objects onscreen while also giving them focus; cancel here by manually setting to 0
    objViewPane.parentNode.scrollTop = 0;

    //persist the current scroll position
    /* @jsxobf-clobber */
    this._jsxcurscrolltop = objGUI.scrollTop;

    //move the viewpane to the correct position
    objViewPane.style.top = "-" + this._jsxcurscrolltop + "px";

    //request the two panels that most closely anticipate where the user is headed
    var intPanelIndex = this._getActivePanelIndex();

    //only the 'paged' model fetches content based on scroll position. otherwise, content model is pretty simple for other models: do nothing
    if (this.getPagingModel(Matrix.PAGING_OFF) == Matrix.PAGING_PAGED) {
      //show the scroll info label if not empty string
      var strLabel = this.getScrollInfoLabel(this._getLocaleProp("seek", Matrix));
      if (strLabel != "") {
        this._getScrollInfoObject(objGUI.parentNode).style.display = "block";

        //have setting to show the predicted range
        window.clearTimeout(this._jsxtime);
        var my = this;

        //timeout to hide the position spyglass
        /* @jsxobf-clobber */
        this._jsxtime = window.setTimeout(function() {
          if (objGUI && objGUI.parentNode)
            my._getScrollInfoObject(objGUI.parentNode).style.display = "none";
        },1000);

        //use a timeout to update the display of the scroll-info-label
        jsx3.sleep(function() {
          if (this.getParent() == null) return;

          if (objGUI && objGUI.parentNode) {
            var intRowHeight = this.getRowHeight(Matrix.DEFAULT_ROW_HEIGHT);
            var intFirstVisible = parseInt(this._jsxcurscrolltop / intRowHeight) + 1;
            var intCHeight = this.getBoxProfile(true).getClientHeight();
            var intRowCount = this._getRowCount();
            var intLastVisible = intFirstVisible + parseInt(intCHeight  / intRowHeight) -1;
            if (intLastVisible > intRowCount) intLastVisible = intRowCount;
            var strInfoLabel = new jsx3.util.MessageFormat(strLabel);
            this._getScrollInfoObject(objGUI.parentNode).childNodes[0].innerHTML = strInfoLabel.format(intFirstVisible, intLastVisible, intRowCount);
          }
        }, "Matrix_timeout" + this.getId(), this);
      }

      //loop three times to fetch content. self and two adjacent panels
      var bQueued;

      //by half...etc
      var intPaintQueueSize = this.getPanelQueueSize(Matrix.DEFAULT_PANEL_QUEUE_SIZE);
      var intPaintQueueSize1 = parseInt(intPaintQueueSize / 2);
      var intPaintQueueSize2 = intPaintQueueSize - intPaintQueueSize1;

      for (var i = intPanelIndex + intPaintQueueSize2;i>=intPanelIndex - intPaintQueueSize1;i--) {
        //first look for the deprioritized panel (by adding via an unshift, it will be added second to the actual panel)
        if (i >= 0 && this._isValidPanel(i)) {
          //always prioritize the content for the active panel over any content that may be waiting to paint (unshift)
          this._getPaintQueue().unshift({index:i});

          //if too many items are back-logged in the queue, remove the last item
          if (this._getPaintQueue().length > intPaintQueueSize)
            var objQueueItem = this._getPaintQueue().pop();

          //set flag that items are in the queue
          bQueued = true;
        }
      }

      //if any content was added to the paint queue, paint it here
      if (bQueued) this._paintQueuedPanels(objViewPane);
    }

    //fire the jsxscroll event
    this.doEvent(Interactive.SCROLL, {objEVENT:objEvent, strDIRECTION:"vertical", intPOSITION:this._jsxcurscrolltop});
  };

  /**
   * Returns the scroll info object
   * @param objGUI {HTMLElement}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getScrollInfoObject = function(objGUI) {
    return objGUI.childNodes[5];
  };

  /**
   * Returns the index of the active panel that is displayed within the confines of the view port
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getActivePanelIndex = function() {
    return parseInt(this._jsxcurscrolltop / (this.getRowsPerPanel(Matrix.DEFAULT_ROWS_PER_PANEL) * this.getRowHeight(Matrix.DEFAULT_ROW_HEIGHT)));
  };

  /**
   * Paints the first item in the onpaint queue by calling _paintPanel.  If more items are in the queue, paints them, too
   * @param objViewPane {Object | null} The native browser element to put content into (the view pane)
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._paintQueuedPanels = function(objViewPane) {
    jsx3.sleep(function() {
      if (this.getParent() == null) return;

      if (this._getPaintQueue().length) {
        //get the  first item in the queue
        var objQueueItem = this._getPaintQueue().shift();

        //call to paint the actual content to the screen
        if (this._isValidPanel(objQueueItem.index))
          this._paintPanel(this._getPanelContent(objQueueItem.index),objViewPane,objQueueItem.index);

        //if more items are in the queue, call this method again
        if (this._getPaintQueue().length) this._paintQueuedPanels(objViewPane);
      }
    }, "_paintQueuedPanels" + this.getId(), this);
  };

  /**
   * Returns the paint queue array
   * @return {Array}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getPaintQueue = function() {
    //holds a prioritized list (array index first to last) of all panel indexes of panels that should paint.
    //this array is dynamically adjusted to ensure only the most relevant panels are painted.
    return this._jsxpaintqueue;
  };

  /**
   * Resets the paint queue array; called whenever the panel array is configured/reconfigured
   * @return {Array}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._resetPaintQueue = function() {
    this._jsxpaintqueue = [];
  };

  /**
   * Paint the given panel (a panel is a table segment containing, by default, 50 rows (can be adjusted)
   * @param strHTML {String} Panel content to paint (an HTML TABLE)
   * @param objViewPane {Object | null} The native browser element to put content into (the view pane)
   * @param intPanelIndex {int}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._paintPanel = function(strHTML,objViewPane,intPanelIndex) {
    if (!objViewPane) objViewPane = this._getViewPane();

    if (objViewPane) {
      //about to paint. Set flag that designates this panel as "painted". set its index and its paint token. since the 2pass painter executes asynchnously,
      //it is possible that an on-screen cell  may be assumed to exist, when in fact it has been reaped.
      var myToken = {index:intPanelIndex,painted:1,token:Matrix.getToken()};
      this._getPanelArray()[intPanelIndex] = myToken;
      LOG.trace('fetching panel: ' + intPanelIndex);

      //insert
      html.insertAdjacentHTML(objViewPane,"BeforeEnd",strHTML);

      //on-screen content has been added. query the affected children (those displayed) for any 2-pass (format) handlers
      this._applyFormatHandlers(myToken);

      //whenever new content is added, the viewpane must be queried for its new offsetheight (if paged, the following method has no effect)
      this._updateScrollHeight(objViewPane);

      //call the reaper to clear out the most distant panels if the panel pool is exceeded
      var my = this;
      window.setTimeout(function() {
        if (my.getParent() == null) return;
        my._reap();
      },this.getReaperInterval(Matrix.DEFAULT_REAPER_INTERVAL));
    }
  };

  /**
   * Used for GITAK.  Returns an array of all TR elements used for by the instance. Each TR will correspond to a record in the CDF source document
   * @return {Array}
   * @private
   */
  Matrix_prototype.getIterableRows = function() {
    var myToken, objGUI;
    var objRows = [];
    objGUI = this.getRendered();
    if (objGUI) {
      if (this.getRenderingModel() == Matrix.REND_HIER) {
        var strRenderingContext = this.getRenderingContext("jsxroot");
        var objRenderingContext = this.getRecordNode(strRenderingContext);
        var objRootStructures = [];
        for (var i = objRenderingContext.selectNodeIterator("./" + this._cdfan("children")); i.hasNext(); ) {
          var node = i.next();
          var strJsxId = this._cdfav(node, "id");
          objRootStructures.push(this._getStructureById(strJsxId));
        }
        objRows = this._getIterableRows({contextnodes:objRootStructures});
      } else {
        var objPanels = objGUI.childNodes[1].childNodes[0].childNodes;
        var objRowParent;
        for (var i=0;i<objPanels.length;i++) {
          objRowParent = objPanels[i];
          objRowParent = this._getFirstRow(objRowParent);
          if (objRowParent) {
            objRowParent = objRowParent.parentNode;
            var intRowCount = objRowParent.childNodes.length;
            for (var j=0;j<intRowCount;j++) {
              var objRow = objRowParent.childNodes[j];
              if (objRow.tagName.toLowerCase() == "tr") objRows.push(objRow);
            }
          }

        }
      }
    }
    return objRows;
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._getIterableRows = function(objToken) {
    var objArray = [];
    if (objToken.contextnodes) {
      //this is a hierachical update with multiple possible roots; iterate and recurse
      for (var i = 0; i < objToken.contextnodes.length; i++) {
        //do not iterate over the edit masks. only inspect specific DIV elements that have been tagged: jsxtype="structure" (this is done in the XSLT)
        if (objToken.contextnodes[i].getAttribute("jsxtype") == "structure")
          objArray.push.apply(objArray, this._getIterableHierarchicalRows(objToken.contextnodes[i]));
      }
    } else {
      //this is a panel-based update; loop
      var intPanelIndex = objToken.index;
      var objRowParent = this._getPanelByIndex(intPanelIndex);
      if (objRowParent) {
        objRowParent = this._getFirstRow(objRowParent);
        if (objRowParent) {
          objRowParent = objRowParent.parentNode;
          var intRowCount = objRowParent.childNodes.length;
          for (var j=0;j<intRowCount;j++) {
            var objRow = objRowParent.childNodes[j];
            if (objRow.tagName.toLowerCase() == "tr") objArray.push(objRow);
          }
        }
      }
    }
    return objArray;
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._getIterableHierarchicalRows = function(objStructure,objArray) {
    if (objArray == null) objArray = [];
    objArray.push(this._getFirstRow(objStructure.firstChild));
    if (objStructure.lastChild) {
      var objChildren = objStructure.lastChild.childNodes;
      for (var i=0;i<objChildren.length;i++) {
        if (objChildren[i].tagName) this._getIterableHierarchicalRows(objChildren[i],objArray);
      }
    }
    return objArray;
  };

  /** @private @jsxobf-clobber */
  Matrix.TOKEN = 0;

  /**
   * Creates token that serially tracks the 2-pass reformatting. Since it is an anynch process
   * objects can be destroyed before they are reformatted, leading to an NPE
   * @return {int} unique key value
   * @private
   */
  Matrix.getToken = function() {
    Matrix.TOKEN += 1;
    return Matrix.TOKEN;
  };

  /**
   * Returns the HTML element that represents the intersection of the row identified
   * by <code>strCdfId</code> and the first column mapped to the named CDF attribute, <code>strAttName</code>.
   * @param strCdfId {String} jsxid property for CDF record
   * @param strAttName {String} attribute name on the CDF record. For example, <code>jsxtext</code>
   * @return {HTMLElement}
   */
  Matrix_prototype.getContentElement = function(strCdfId,strAttName) {
    var obj = this._getCellById(strCdfId,strAttName);
    if (obj) {
      if (obj.cellIndex == 0 && this.getRenderingModel() == Matrix.REND_HIER && this.getRenderNavigators(1) != 0) {
        var objTbl = obj.childNodes[0].childNodes[0];
        while (objTbl && objTbl.tagName.toLowerCase() != "tr") objTbl = objTbl.childNodes[0];
        if (objTbl)
          return objTbl.lastChild.firstChild;
      } else {
        return obj.childNodes[0];
      }
    }
  };

  /**
   * Called to run the 2-pass formatters
   * @param objToken {Object} Map describing the painted state of a given panel (token, index, painted)
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._applyFormatHandlers = function(objToken, bSync) {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Matrix.jsxclass, this);
/* @JSC :: end */

    if(!jsx3.$A.is(this._jsx2pass))
      /* @jsxobf-clobber */
      this._jsx2pass = [];
    var twoP = this._jsx2pass;

    //exit early if xslt knows that no rows will ever be found (faster than iterating)
    if (this._getRowCount() == 0 && !this._getAutoRow()) return;

    //get all displayed column children (this is a view process)
    var objServer = this.getServer();

    var objChildren = this._getDisplayedChildren();
    var fmtHandlers = new Array(objChildren.length);
    var bHasFmt = false;

    for (var i = 0; i < objChildren.length; i++) {
      //resolve the format handler for the given child and loop to update each iterable row
      var objFormatHandler = objChildren[i]._getFormatHandler();
      if (objFormatHandler) {
        fmtHandlers[i] = objFormatHandler;
        bHasFmt = true;
      }
    }

    if (! bHasFmt) return;

    //only attempt to get all rows that should be updated if a formathandler is encountered
    var objRows = this._getIterableRows(objToken);
    if (objToken.contextnodes) {
      //object cleanup
      objToken.index = true;
      delete objToken.contextnodes;
    }

    //exit early if no iterable rows exist
    var intRowCount = objRows.length;
    var bHier = this.getRenderingModel() == Matrix.REND_HIER && this.getRenderNavigators(1) != 0;

    var h = [];
    for (var i = 0; i < objChildren.length; i++) {
      var objFormatHandler = fmtHandlers[i];
      if (objFormatHandler)
        h.push([i, objFormatHandler, objChildren[i]]);
    }

    for (var j = 0; j < intRowCount; j++) {
      var objRow = objRows[j];
      var jsxid = objRow.getAttribute("jsxid");
      var rowindex = objRow.getAttribute("jsxrownumber");

      for (var k = 0; k < h.length; k++) {
        var objCell = null;
        var i = h[k][0];
        var objFormatHandler = h[k][1];
        var objColumn = h[k][2];

        //if rendering in hierarchical mode, the first column's editable content (what the developer can own/control) is nested more deeply
        if (bHier && i == 0) {
          var objTbl = objRow.childNodes[0].childNodes[0].childNodes[0];
          while (objTbl && objTbl.tagName.toLowerCase() != "tr")
            objTbl = objTbl.childNodes[0];

          if (objTbl)
            objCell = objTbl.lastChild.firstChild;
        } else if (objRow.childNodes[i]) {
          objCell = objRow.childNodes[i].childNodes[0];
        }

        if (objCell) {
          if (bSync) {
            objFormatHandler.format(objCell, jsxid, this, objColumn, rowindex, objServer);
          } else {
            twoP[twoP.length] = [objFormatHandler, objCell, jsxid, objColumn, rowindex, objToken];
          }
        }
      }
    }

    if (h.length > 0 && objRows.length > 0)
      jsx3.sleep(this._2passqueueChunk, "Matrix2pass" + this.getId(), this);

/* @JSC :: begin BENCH */
    t1.log("format.sync");
/* @JSC :: end */
  };

  /** @private @jsxobf-clobber */
  Matrix_prototype._2passqueueChunk = function() {
    if (this.getParent() == null) {
      this._jsx2pass = [];
      return;
    }

/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Matrix.jsxclass, this);
/* @JSC :: end */

    var objServer = this.getServer();
    var tStart = (new Date()).getTime();
    var t2 = tStart;

    while (this._jsx2pass.length > 0 && (t2 - tStart < Matrix._2PASS_INTERVAL)) {
      var r = this._jsx2pass.shift();
      var myToken = r[5];

      var bFormat = myToken.index;
      if (! bFormat) {
        var panel = this._getPanelArray()[myToken.index];
        bFormat = panel != null && panel.token == myToken.token;
      }

      if (bFormat) {
        r[0].format(r[1], r[2], this, r[3], r[4], objServer);
        t2 = (new Date()).getTime();
      }
    }

    if (this._jsx2pass.length > 0)
      jsx3.sleep(this._2passqueueChunk, "Matrix2pass" + this.getId(), this);

/* @JSC :: begin BENCH */
    t1.log("format.async");
/* @JSC :: end */
  };

  /**
   * Returns handle to the view pane (the moveable div that is dragged inside the fixed viewport)
   * @param objGUI {HTMLElement} the native HTML instance of the control (for faster lookup)
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getViewPane = function(objGUI) {
    if (!objGUI) objGUI = this.getRendered();
    return objGUI ? objGUI.childNodes[1].childNodes[0] : null;
  };

  /**
   * Returns the height of the View Pane appropriate to the paging model. If paged, uses the rowcount determined by user or data.  If not, height is determined by
   * querying the native HTML object for its offsetheight
   * @return {String} DHTML
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getViewPaneHeight = function() {
    var intModel = this.getPagingModel(Matrix.PAGING_OFF);
    var myHeight = null;
    if (intModel == Matrix.PAGING_PAGED) {
      myHeight = this._getRowCount() * this.getRowHeight(Matrix.DEFAULT_ROW_HEIGHT);
    } else {
      var objVP = this._getViewPane();
      myHeight = (objVP) ? parseInt(objVP.offsetHeight) : 0;
    }
    return myHeight;
  };

  /**
   * Determines whether the given panel should be painted (does it already exist, is it within a valid range, etc)
   * @param intIndex {int}
   * @return {Boolean}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._isValidPanel = function(intIndex) {
    if (intIndex == -1 || (intIndex >=0 && intIndex < this._getPanelArray().length && this._getPanelArray()[intIndex] == null)) {
      var objDoc = this.getDocument();
      var objGUI = objDoc.getElementById(this.getId() + "jsx_" + intIndex);
      return !objGUI;
    }
    return false;
  };

  /**
   * Paint the given panel (a panel is a table segment containing, by default, 50 rows (can be adjusted))
   * @param intIndex {int}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getPanelContent = function(intIndex) {
    //common vars
    var b1 = this.getBoxProfile(true);
    var intRowsPerPanel = this.getRowsPerPanel(Matrix.DEFAULT_ROWS_PER_PANEL);

    //determine the paging model
    var intModel = this.getPagingModel(Matrix.PAGING_OFF);
    if (intModel == Matrix.PAGING_PAGED) {
      var intRowHeight = this.getRowHeight(Matrix.DEFAULT_ROW_HEIGHT);
      var strPosition = 'position:absolute;left:0px;top:' + (intRowsPerPanel*intRowHeight*intIndex) + 'px;';

      //get start and end rows
      var intStart = intRowsPerPanel * intIndex;
      var intEnd = intStart + intRowsPerPanel + 1;
    } else {
      var strPosition = 'position:relative;';
      var strHeight = '';
      if (intModel == Matrix.PAGING_CHUNKED) {
        //still use paging, it just happens to get painted relatively and in order (allows for flex height, otherwise, chunked is similar to paged)
        var intStart = intRowsPerPanel * intIndex;
        var intEnd = intStart + intRowsPerPanel + 1;
      } else {
        //either delayed or none. just get everything
        var intMaxRows = this._getRowCount();
        var intStart = 0;
        var intEnd = intMaxRows + 1;
      }
    }

    //create the parameter object to pass to the XSLT Processor
    var objParams = {};
    objParams.jsx_min_exclusive = intStart;
    objParams.jsx_max_exclusive = intEnd;
    objParams.jsx_panel_index = intIndex;
    objParams.jsx_panel_css = strPosition;
    objParams.jsx_column_widths = this._getViewPaneWidth();

    objParams.jsx_rendering_context = this.getRenderingContext("jsxroot"); //when other methods call doTransform, this will be different
    //TO DO: this static value needs to be updated to reflect what is being updated as row and cell-based updates are turned on
    objParams.jsx_mode = (intIndex == -1) ? "autorow" : "panel";

    //get data rows via xslt transform
    LOG.trace("Fetching records: " + intStart + " - to - " + intEnd);
    return this.doTransform(objParams);
  };

  /**
   * Removes the XML source document stored under the XML ID of this object from the server cache.
   * @param objServer {jsx3.app.Server} the server owning the cache to modify. This is a required argument only if
   *    <code>this.getServer()</code> does not returns a server instance.
   */
  Matrix_prototype.resetXmlCacheData = function(objServer) {
    if (this.getPagingModel() == Matrix.PAGING_PAGED)
      this.setScrollTop(0);
     //delete cached rowcount
    this._reset(true);
    this.jsxsupermix(objServer);
  };

  /**
   * Removes the XML source document stored under the XML ID of this object from the server cache.
   * @param objServer {jsx3.app.Server} the server owning the cache to modify. This is a required argument only if
   *    <code>this.getServer()</code> does not returns a server instance.
   */
  Matrix_prototype.resetCacheData = function(objServer) {
    if (this.getPagingModel() == Matrix.PAGING_PAGED)
      this.setScrollTop(0);
    //delete cached rowcount
    this._reset(true);
    this.jsxsupermix(objServer);
  };

  /**
   * Sets the XML ID of this object. This value is the key under which the XML source document of this object is
   * saved in the cache of the server owning this object. The developer may specify either a unique or shared value.
   * If no value is specified, a unique id is generated.
   * @param strXMLId {String}
   * @return {jsx3.xml.Cacheable} this object.
   * @see #getXML()
   */
  Matrix_prototype.setXMLId = function(strXMLId) {
    //delete cached rowcount
    this._reset(true);
    return this.jsxsupermix(strXMLId);
  };

  /**
   * Updates the view of this object by calling <code>paint()</code> and replacing the current view with the
   * returned HTML. This method has no effect if this object is not currently displayed.
   * @return {String} the result of calling <code>paint()</code> or <code>null</code> if this object is not displayed.
   * @see #paint()
   */
  Matrix_prototype.repaint = function() {
    //delete cached rowcount any time a repaint is called, just in case the xml source was updated via lower-level APIs (not CDF) and the control was not notified
    this._reset(true);
    return this.jsxsuper();
  };

  /**
   * Sets the XML string of this object. Setting this value to the string serialization of an XML document is one
   * way of specifying the source XML document of this object.
   * @param strXML {String} <code>null</code> or a well-formed serialized XML element.
   * @return {jsx3.xml.Cacheable} this object.
   * @see #getXML()
   */
  Matrix_prototype.setXMLString = function(strXML) {
    //delete cached rowcount
    this._reset(true);
    return this.jsxsupermix(strXML);
  };

  /**
   * Sets the XML URL of this object. Settings this value to the URI of an XML document is one way of specifying the
   * source XML document of this object.
   * @param strXMLURL {String} <code>null</code> or a URI that when resolved against the server owning this object
   *   specifies a valid XML document.
   * @return {jsx3.xml.Cacheable} this object.
   * @see #getXML()
   */
  Matrix_prototype.setXMLURL = function(strXMLURL) {
    //delete cached rowcount
    this._reset(true);
    return this.jsxsupermix(strXMLURL);
  };

  /**
   * Returns XSLT, prioritizing the acquisition in the following order: 1) check cache; 2) check jsxxsl; 3) check jsxxslurl; 4) use default
   * @return {jsx3.xml.Document} jsx3.xml.Document instance containing valid XSL stylesheet
   * @deprecated  Per-instance control of the XSL template is deprecated
   */
   Matrix_prototype.getXSL = function() {
     return this._getXSL();
   };

  /**
   * Returns the XSLT
   * @param bShell {Boolean} If true, only return the shell template. Do not configure the template.
   * @private
   * @jsxobf-clobber-shared
   */
  Matrix_prototype._getXSL = function(bShell) {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Matrix.jsxclass, this);
/* @JSC :: end */

    var baseDoc = Matrix._XSLRSRC ||
        jsx3.getSharedCache().getOrOpenDocument(Matrix.DEFAULTXSLURL, null, jsx3.xml.XslDocument.jsxclass);

    if (bShell) return baseDoc;

    var cache = this.getServer().getCache();
    var objXSL = cache.getDocument(this.getXSLId());
    if (objXSL == null) {
      objXSL = baseDoc.cloneDocument();
      cache.setDocument(this.getXSLId(), objXSL);

      //when handling a view process such as XSLT, only 'displayed' children are considered are considered relevant
      var intRenderingModel = this.getRenderingModel(Matrix.REND_DEEP);
      var objChildren = this._getDisplayedChildren();
      var objTR = objXSL.selectSingleNode("//xsl:template[@name='row_template']//tr");
      var objTRWhen = objXSL.selectSingleNode("//xsl:template[@name='row_template']//tr/xsl:choose/xsl:when");
      var objChoose = objXSL.selectSingleNode("//xsl:choose/xsl:when/xsl:choose");
      //the entire width of the summed columns (the actual css width property that would be applied to the table element)
      var intAllWidths = this._getViewPaneWidth();

      var strFocusHandlers = ' tabindex="-1"' +
                             this.renderHandler(Event.FOCUS, "_ebonfocus") +
                             this.renderHandler(Event.BLUR, "_ebonblur");

      for (var i = 0; i < objChildren.length; i++) {
        var objColumn = objChildren[i];
        var colId = objColumn.getId();
        //paint box profiles and append to the stylesheet (allows the xslt to be browser-independent and leverage the box profile)
        var b1a = objColumn.getBoxProfile(true).getChildProfile(1);
        var b1b = b1a.getChildProfile(0);

        //configure the TD
        //the colspan attributes provide support for category colspans. Only the first column using hierarchical rendering can implement.
        var strColSpan = (i==0 && intRenderingModel == Matrix.REND_HIER) ? ' colspan="{$jsx_colspan}" jsxcolspan="{$jsx_colspan}" ' : '';
        b1a.setAttributes(strFocusHandlers + strColSpan + ' jsxtype="cell" class="jsx30matrixcolumn_cell" id="{$jsx_id}_jsx_{$jsx_cdfkey}_jsx_' + i + '"');
        b1a.setStyles(objColumn.paintCellVAlign() + objColumn.paintCellBackgroundColor() +
                      objColumn.paintCellFontSize() + objColumn.paintCellFontName() + objColumn.paintCellFontWeight() +
                      objColumn.paintCellColor() + objColumn.paintCellCursor() + "{$jsx_selection_bg}{$jsx_rowbg}");

        //configure the DIV
        b1b.setAttributes('class="jsx30matrixcolumn_cell_value"');
        b1b.setStyles(objColumn.paintCellWrap() + objColumn.paintCellTextAlign());

        //create the xsl snippet that calls out to the 'cell value' template (NOTE: calls-out from the root template, not the cell template)
        var objXSLSnippet = Matrix.DEFAULT_UPDATE_CELL_VALUE_TEMPLATE.cloneDocument();
        objXSLSnippet.setAttribute("test", "$jsx_cell_value_template_id='" + colId + "_value'");
        objXSLSnippet.selectSingleNode("//xsl:call-template").setAttribute("name", colId + "_value");
        objChoose.appendChild(objXSLSnippet);

        //create the xsl snippet that calls out to the 'cell value' template; replace wildcard with jsxid for column instance (creates: xsl:call-template)
        if (intRenderingModel == Matrix.REND_HIER && i==0 && this.getRenderNavigators(1) != 0) {
          //call the intermediary template first (not the value template); this creates the toggle controllers necessary for navigation
          var strCallValueTemplate = Matrix.DEFAULT_CALL_VALUE_TEMPLATE.format("ui_controller");
          //update existing XSL template (hard coded in original XSLT) to call the value template
          var objNode = objXSL.selectSingleNode("//xsl:template[@name='ui_controller']//xsl:call-template");
          objNode.setAttribute("name", colId + "_value");
          var strDiv = b1b.paint().join('');
          objXSLSnippet.loadXML(strDiv);
          if(!objXSLSnippet.hasError()) {
            objNode.getParent().appendChild(objXSLSnippet);
            objXSLSnippet.appendChild(objNode);
          } else {
            LOG.error("Error with column " + objColumn + ": " + objXSLSnippet.getError());
          }
        } else {
          //either deep or shallow. no need for the intermediary template to create the hierarchical controllers
          var strCallValueTemplate = Matrix.DEFAULT_CALL_VALUE_TEMPLATE.format(colId + "_value");
        }


        //generate the callvaluetemplate (td/div combo); factor out the width; and replace with xslt variable (param)
        var strCallValueTemplate = b1a.paint().join(b1b.paint().join(strCallValueTemplate)).replace(/width:\d*px;/,'{$jsx_first_row_width_style}');

        var ii = b1a.getPaintedWidth();
        //the following provides the width to apply to the first td in the tr if the first td is a category td and will be implementing the 'colspan' attribute
        var iii = (i==0) ? (intAllWidths - this._getColumnWidths()[0] + ii) : ii;

        //create the cell template and merge with existing snippets (creates: xsl:template/td/div/xsl:call-template)
        var strCellTemplate = Matrix.DEFAULT_CELL_TEMPLATE.format(colId, strCallValueTemplate, String(ii), String(iii)); //replace wildcard with wildcard to support a double-replace (happens further down)

        objXSLSnippet.loadXML(strCellTemplate);
        if (!objXSLSnippet.hasError()) {
          objXSL.appendChild(objXSLSnippet);
        } else {
          LOG.error("Error with column " + objColumn + ": " + objXSLSnippet.getError());
        }

        //create the value template (the actual cell content) -- this will be the one the user can manage
        var strValueTemplate = objColumn.getValueTemplate(Matrix.Column.TEMPLATES["default"]).replace(/\{0\}/g,"@" + objColumn.getPath());
        //everything needs to go inside the value template's div, including edit masks
        // Get the XSL of certain kinds of edit masks
        var objMask = objColumn.getEditMask();
        if (objMask != null && Matrix._initEditMask(objMask) && objMask.emGetType() == Matrix.EditMask.FORMAT) {
          var objXslDiv = new jsx3.xml.Document();
          strValueTemplate = strValueTemplate.replace(/<\/xsl:template>\s*$/,
              objMask.emPaintTemplate().replace(/\{0\}/g, "@" + objColumn.getPath()) + "</xsl:template>");
        }

        objXSLSnippet.loadXML(strValueTemplate);
        if (!objXSLSnippet.hasError()) {
          //set name on template so the value caller can locate it
          objXSLSnippet.setAttribute("name", colId + "_value");
          objXSL.appendChild(objXSLSnippet);
        }

        //add the caller to the tr element (this calls the cell template from within the tr (row) template)
        //note that the first cell caller goes before the when statement, while the remainder go inside. this is to support colspan for categories
        objXSLSnippet = Matrix.DEFAULT_CALL_CELL_TEMPLATE.cloneNode(true);
        objXSLSnippet.setAttribute("name", colId);
        if (i==0)
          objTR.insertBefore(objXSLSnippet, objTRWhen.getParent());
        else
          objTRWhen.appendChild(objXSLSnippet);
      }
    }

/* @JSC :: begin BENCH */
    t1.log("xsl");
/* @JSC :: end */

    return objXSL;
  };

  /** @private @jsxobf-clobber */
  Matrix._displayedChildFilter = function(objColumn) {
    return objColumn && (objColumn.getDisplay() != Block.DISPLAYNONE);
  };

  /** @private @jsxobf-clobber-shared */
  Matrix_prototype._getDisplayedChildren = function() {
    return this.getDescendantsOfType(Painted, true).filter(Matrix._displayedChildFilter);
  };

  /**
   * typically called by the paint method for any JSX GUI object that gets its data via an XML feed.  This function
   *          gets the XML/XSL for the object; performs a merge to generate the DHTML content; checks for errors; and returns
   *          a DHTML string to be displayed as the object's content on-screen.  This method can also be called at anytime
   *          to simply generate a string of DHTML
   * @param objParams {Object} JavaScript map containing one of the named parameters found in the stylesheet
   * @return {String} DHTML; can be an empty string
   * @package
   */
  Matrix_prototype.doTransform = function(objParams) {
    //parameterize the stylesheet
    if (!objParams) objParams = {};

    //control id (the matrix instance)
    objParams.jsx_id = this.getId();

    //rendering model
    objParams.jsx_rendering_model = this.getRenderingModel(Matrix.REND_DEEP);

    //paging model
    objParams.jsx_paging_model = this.getPagingModel(Matrix.PAGING_OFF) ;

    var resolver = this.getUriResolver();
    //icons (used when the rendering model is 'hierarchical')
    if (objParams.jsx_rendering_model == 'hierarchical') {
      var icon = this.getIcon(Matrix.ICON), iconMinus = this.getIconMinus(Matrix.ICON_MINUS),
          iconPlus = this.getIconPlus(Matrix.ICON_PLUS);

      if (objParams.jsx_icon == null)
        objParams.jsx_icon = icon ? resolver.resolveURI(icon) : "";
      if (objParams.jsx_icon_minus == null)
       objParams.jsx_icon_minus = iconMinus ? resolver.resolveURI(iconMinus) : "";
      if (objParams.jsx_icon_plus == null)
        objParams.jsx_icon_plus = iconPlus ? resolver.resolveURI(iconPlus) : "";
      objParams.jsx_transparent_image = Block.SPACE;
    }

    //sorting
    objParams.jsx_sort_path = this.getSortPath();
    objParams.jsx_sort_direction = this.getSortDirection();
    objParams.jsx_sort_type = this.getSortType();

    //selection
    objParams.jsx_selection_model = this.getSelectionModel(Matrix.SELECTION_ROW);
    objParams.jsx_selection_bg_url = this._getSelectionBG();

    //loop to override default parameter values with user's custom values
    var objCustomParams = this.getXSLParams();
    for (var p in objCustomParams) objParams[p] = objCustomParams[p];

    //now override thos user values that they can't control
    if (objParams.jsx_use_categories && this.getRenderingModel() != Matrix.REND_HIER) delete objParams.jsx_use_categories;
    objParams.jsx_column_count = this._getDisplayedChildren().length;

    // for uri-resolution
    objParams.jsxpath = jsx3.getEnv("jsxabspath");
    objParams.jsxpathapps = jsx3.getEnv("jsxhomepath");
    objParams.jsxpathprefix = this.getUriResolver().getUriPrefix();
    objParams.jsxappprefix = this.getServer().getUriPrefix();

    //merge and return (account for transofrmiix well-formedness errors)
    var strContent = this.jsxsupermix(objParams);
    strContent = this._removeFxWrapper(strContent);

    /* TODO: IMPROVE HOW to check for empty content. The jsx_mode provides for situations where no TR is a problem and other times when it isn't (as is the case with the cellvaue mode)*/
    return (!objParams.jsx_return_at_all_costs && strContent.indexOf("<tr") == -1) ? "" : strContent;
  };

  Matrix_prototype.onXmlBinding = function(objEvent) {
    this.jsxsupermix(objEvent);
    this.repaintData();
  };

  // Need to override this method to register for when an asynchronous resource loads. The matrix may store state
  // which becomes inaccurate when the XML loads.
  Matrix_prototype.getXML = function() {
    var x = this.jsxsupermix();
    if (! this._jsxmatrixxmlbind) {
      var bBind = !x.hasError() &&
              x.getNamespaceURI() == jsx3.app.Cache.XSDNS &&
              x.getNodeName() == "loading";

      if (bBind) {
        var s = this.getServer();
        if (s) {
          /* @jsxobf-clobber */
          this._jsxmatrixxmlbind = true;
          s.getCache().subscribe(this.getXMLId(), this, "_onMatrixXmlLoad");
        }
      }
    }
    return x;
  };

  /* @jsxobf-clobber */
  Matrix_prototype._onMatrixXmlLoad = function(objEvent) {
    objEvent.target.unsubscribe(objEvent.subject, this);
    this._jsxmatrixxmlbind = false;
    //3.6 mod: since only data is being loaded, no need for full reset; also calling _onPaint, since it is no longer called when data is present, meaning
    //this is now the entry point for painting data
    this._reset(true);
    jsx3.sleep(this._onPaint, "_onPaint" + this.getId(), this);
  };

  /**
   * Call when a major structural change occurs (rendering, paging, or selection?)
   * @param bSimple {Boolean} if true, this is a non-structural change. only rowcount is affected for now
   * @private
   * @jsxobf-clobber-shared
   */
  Matrix_prototype._reset = function(bSimple) {
    if (!this.getServer()) return;
    //delete cached rowcount
    delete this._jsxrowcount;

    if (!bSimple) {
      //remove profile and xslt
      this.resetXslCacheData();
      this.clearBoxProfile(true);

      //remove cached column widths (adjusted)
      delete this._jsxtruecolumnwidths;
    }
  };

  /**
   * Returns an array of all jsxid attributes in the source CDF in the order they would appear if painted on-screen
   * @return {Array}
   */
  Matrix_prototype.getSortedIds = function() {
    var result = this.doTransform({jsx_mode:"sort",jsx_rendering_context:this.getRenderingContext("jsxroot"),jsx_return_at_all_costs:true});
    return (result.search(/<ids>([\s\S]*)\s*,\s*<\/ids>/) > -1) ? window.eval("[" + RegExp.$1 + "]") : [];
  };

  /**
   * Returns the number or rows that would paint on-screen if all data were painted in its entirety. Always returns a value
   * @param bReset {Boolean}
   * @return {Array}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getRowCount = function(bReset) {
    //delete cached value
    if (bReset) delete this._jsxrowcount;

    if (this._jsxrowcount) {
      //use cached value where possible.
      return this._jsxrowcount.maxlen;
    } else {
      // transform() below will throw an exception if xml has error
      if (this.getXML().hasError()) return 0;

      //call standard template in 'count' mode. pass the starting context and the rendering model
      var objParams = {};
      objParams.jsx_mode = "count";
      objParams.jsx_rendering_model = this.getRenderingModel(Matrix.REND_DEEP);
      objParams.jsx_rendering_context = this.getRenderingContext("jsxroot");
      jsx3.$H(this.getSchema().getProps()).each(function(k, v) {
        objParams["attr" + k] = v;
      });

      var oProcessor = this._getXSL(true);
      oProcessor.reset();
      oProcessor.setParams(objParams);
      var result = oProcessor.transform(this.getXML());

      var intLength =  (result.search(/(\d+)/) > -1) ? parseInt(RegExp.$1) : 0;
      LOG.trace("Getting Record Count: " + intLength);
      /* @jsxobf-clobber */
      this._jsxrowcount = {maxlen:intLength};

      //if this is a paginated list, the total row height needs to be recalculated to reflect the possible change in row count
      if (this.getPagingModel() == Matrix.PAGING_PAGED) {
        var bp = this.getBoxProfile();
        var objGUI = this.getRendered();
        if (bp && objGUI) {
          //reset the height 1px-wide image that makes the v-scroller appear
          bp = bp.getChildProfile(2).getChildProfile(0);
          var intTrueHeight = this.getRowHeight(Matrix.DEFAULT_ROW_HEIGHT) * intLength;
          bp.recalculate({height:intTrueHeight + this.getHeaderHeight(Matrix.DEFAULT_HEADER_HEIGHT)},objGUI.childNodes[2].childNodes[0],null);
        }
      }

      return intLength;
    }
  };

  /**
   * Returns an array with length equal to the number of panels required to render the data
   * @return {Array}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getPanelArray = function() {
    return this._jsxpanelarray || [];
  };

  /**
   * Sets an array with length equal to the number of panels required to render the data
   * @param a {Array}
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._setPanelArray = function(a) {
    /* @jsxobf-clobber */
    this._jsxpanelarray = a;
  };

  /**
   * Returns the selection model. If no selection type is specified, the instance will employ single row selection (<code>jsx3.gui.Matrix.SELECTION_ROW</code>)
   * @param-private strDefault {String} The default value to use if null
   * @return {int}
   */
  Matrix_prototype.getSelectionModel = function(strDefault) {
    return (this.jsxselectionmodel != null) ? ((this.jsxselectionmodel>Matrix.SELECTION_MULTI_ROW)?Matrix.SELECTION_UNSELECTABLE:this.jsxselectionmodel) : ((strDefault != null) ? strDefault : null);
  };

  /**
   * Sets the selection model
   * @param intType {int}  one of: jsx3.gui.Matrix.SELECTION_UNSELECTABLE, jsx3.gui.Matrix.SELECTION_ROW, jsx3.gui.Matrix.SELECTION_MULTI_ROW
   */
  Matrix_prototype.setSelectionModel = function(intType) {
    this.jsxselectionmodel = intType;
  };

  /**
   * Returns the row height
   * @param-private strDefault {String} The default value to use if null
   * @return {int}
   */
  Matrix_prototype.getRowHeight = function(strDefault) {
    return (this.jsxrowheight != null) ? this.jsxrowheight : ((strDefault != null) ? strDefault : null);
  };

  /**
   * Sets the on-screen row height. If row height is null, the default row height will be used (<code>jsx3.gui.Matrix.DEFAULT_ROW_HEIGHT</code>).
   * If row height is <code>0</code>, the row height is flexible and the row's height will expand to fit the content.
   * @param intHeight {int} height in pixels
   * @param bSuppressRepaint {Boolean} Pass <code>true</code> to stop the default repaint from occurring.
   * Typically property updates that affect the browser-specific box model (such as padding) are repainted
   * immediately to keep the box model abstraction in synch with the native view. However, the repaint can be
   * suppressed to avoid unnecessary reparsing of the XSLT during repeated property updates.
   */
  Matrix_prototype.setRowHeight = function(intHeight,bSuppressRepaint) {
    this.jsxrowheight = intHeight;
    this._reset();
    if (!bSuppressRepaint) this.repaint();
  };

  /**
   * Returns the number of rows each panel should contain.  If null, the default value will be used: <code>jsx3.gui.Matrix.DEFAULT_ROWS_PER_PANEL</code>
   * @param-private strDefault {String} The default value to use if null
   * @return {int}
   */
  Matrix_prototype.getRowsPerPanel = function(strDefault) {
    return (this.jsxrowsperpanel) ? this.jsxrowsperpanel : ((strDefault) ? strDefault : null);
  };

  /**
   * Sets the number of rows each panel should contain.
   * @param intCount {int}
   * @param bSuppressRepaint {Boolean} Pass <code>true</code> to stop the default repaint from occurring.
   */
  Matrix_prototype.setRowsPerPanel = function(intCount,bSuppressRepaint) {
    this.jsxrowsperpanel = intCount;
    this._reset(true);

    if (!bSuppressRepaint) this.repaint();
  };

  /**
   * Sets the number of panels that are allowed in the queue waiting to be painted. If null, the default value will be used: <code>jsx3.gui.Matrix.DEFAULT_PANEL_QUEUE_SIZE</code>
   * Note that this is different from the number of painted panels allowed on screen (e.g., <code>getPanelPoolSize()</code>).
   * @param-private strDefault {String} The default value to use if null
   * @return {int}
   */
  Matrix_prototype.getPanelQueueSize = function(strDefault) {
    return (this.jsxpaintqueuesize) ? this.jsxpaintqueuesize : ((strDefault) ? strDefault : null);
  };

  /**
   * Sets the number of panels that are allowed in the queue waiting to be painted. Can be tuned up or down to optimize performance given the amount of data, connection speed, etc
   * @param intCount {int}
   */
  Matrix_prototype.setPanelQueueSize = function(intCount) {
    this.jsxpaintqueuesize = intCount;
  };

  /**
   * Returns the the number of milliseconds to wait before checking for inactive panels to garbage collect.  If null, the default value will be used: <code>jsx3.gui.Matrix.DEFAULT_REAPER_INTERVAL</code>
   * @param-private strDefault {String} The default value to use if null
   * @return {int}
   */
  Matrix_prototype.getReaperInterval = function(strDefault) {
    return (this.jsxreaperinterval) ? this.jsxreaperinterval : ((strDefault) ? strDefault : null);
  };

  /**
   * Sets the the number of milliseconds to wait before checking for inactive panels to garbage collect.
   * @param intInterval {int} number of milliseconds
   */
  Matrix_prototype.setReaperInterval = function(intInterval) {
    this.jsxreaperinterval = intInterval;
  };

  /**
   * Returns the number panels (a panel contains a collection of rows--<code>getRowsPerPanel()</code>) that should be part of the pool.  If a panel count greater
   * than this value exists, the panels furthest away (as calculated by the scroll position) from the active panel will be destroyed. If this value is null,
   * the value defined by the constant, <code>jsx3.gui.Matrix.DEFAULT_PANEL_POOL_COUNT</code>, will be used.
   * @param-private strDefault {String} The default value to use if null
   * @return {int}
   */
  Matrix_prototype.getPanelPoolSize = function(strDefault) {
    return (this.jsxpanelpoolsize) ? this.jsxpanelpoolsize : ((strDefault) ? strDefault : null);
  };

  /**
   * Sets the number panels (a panel contains a collection of rows--<code>getRowsPerPanel()</code>) that should be part of the pool.
   * @param intCount {int}
   */
  Matrix_prototype.setPanelPoolSize = function(intCount) {
    this.jsxpanelpoolsize = intCount;
    this._reset(true);
  };

  /**
   * Returns how data should be painted on-screen.  If no value is specified, <code>jsx3.gui.Matrix.PAGING_OFF</code> will be applied. Note that the rendering model limits the available paging models:
   * <ul><li>Matrix.PAGING_OFF: Paint everthing to screen at once (container and data) <i>(rendering model: all)</i></li>
   * <li>Matrix.PAGING_2PASS: Paint outer container and then perform a second pass to paint the data.  <i>(rendering model: deep, shallow)</i></li>
   * <li>Matrix.PAGING_CHUNKED: Paint outer container and then perform repeated paints until all data has been painted, regardless of scroll position.  <i>(rendering model: deep, shallow)</i></li>
   * <li>Matrix.PAGING_PAGED: Paint outer container. Paint First and last panels during second pass.  Paint relevant panels when user scrolls to a given position. Discard excess panels. <i>(rendering model: deep, shallow)</i></li>
   * <li>Matrix.PAGING_STEPPED: Paint root nodes and any open descendants. Paint others as they are toggled open. <i>(rendering model: hierarchical)</i></li></ul>
   * @param-private strDefault {String} The default value to use if null
   * @return {int}
   * @see #getRenderingModel()
   */
  Matrix_prototype.getPagingModel = function(strDefault) {
    //the rendering model supercedes the paging model. validate here first
    if (this.getRenderingModel() == Matrix.REND_HIER && this.jsxpagingmodel != Matrix.PAGING_STEPPED) {
      LOG.trace("The paging model was overridden (disabled) because the rendering mode is hierarchical and stepped paging was not explicitly set.");
      return Matrix.PAGING_OFF;
    }
    return (!isNaN(this.jsxpagingmodel)) ? this.jsxpagingmodel : ((!isNaN(strDefault)) ? strDefault : null);
  };

  /**
   * Sets how data should be painted on-screen.  If no value is specified, <code>jsx3.gui.Matrix.PAGING_OFF</code> will be applied.
   * @param intModel {int} one of: Matrix. PAGING_OFF, PAGING_2PASS, PAGING_CHUNKED, PAGING_PAGED, PAGING_STEPPED
   */
  Matrix_prototype.setPagingModel = function(intModel) {
    this.jsxpagingmodel = intModel;
    this._reset();
  };

  /**
   * Returns the height of the header row in pixels. If this value is not set (<code>null</code>), the list will render with
   * the default value of <code>jsx3.gui.Matrix.DEFAULT_HEADER_HEIGHT</code>.
   * @param-private strDefault {String} The default value to use if null
   * @return {int}
   */
  Matrix_prototype.getHeaderHeight = function(strDefault) {
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
  Matrix_prototype.setHeaderHeight = function(intHeight,bSuppressRepaint) {
    this.jsxheaderheight =  intHeight;

    //all boxes need to be reset to reflect this change globally.
    this.clearBoxProfile(true);

    if (!bSuppressRepaint) this.repaint();
  };

  /**
   * Returns the <i>info label</i> to display when scrolling a paged instance, in order to show the scroll position.
   * @param-private strDefault {String} The default value to use if null
   * @return {int}
   */
  Matrix_prototype.getScrollInfoLabel = function(strDefault) {
    return (this.jsxscrollinfolabel != null) ? this.jsxscrollinfolabel : ((strDefault) ? strDefault : null);
  };

  /**
   * Sets the standard info label to display when scrolling to show the scroll position.  If no label is supplied
   * an appropriate localized value will be used. Set to an empty string to suppress any label from displaying.
   * @param strLabel {String} valid HTML/Text.  Set to an empty string to suppress any label from displaying.
   * <br/>Wildcards are as follows:
   * <ul><li><b>{0}</b> The index position of the first visible on-screen row</li>
   * <li><b>{1}</b> The index position of the last visible on-screen row</li>
   * <li><b>{2}</b> Total count of all records in the list</li></ul>
   */
  Matrix_prototype.setScrollInfoLabel = function(strLabel) {
    this.jsxscrollinfolabel =  strLabel;
  };

  /**
   * Returns the horizontal scroll position of the list.
   * @return {int} a non-negative number
   */
  Matrix_prototype.getScrollLeft = function() {
    var objGUI = this.getRendered();
    return (objGUI) ? objGUI.childNodes[3].scrollLeft : 0;
  };

  /**
   * Sets the horizontal scroll position.
   * @param intScrollLeft {int} a non-negative number
   */
  Matrix_prototype.setScrollLeft = function(intScrollLeft) {
    //move the hscroller to the given position
    var objGUI = this.getRendered();
    if (objGUI && objGUI.childNodes[3]) {
      //update the horiz-autoscroller.  This will fire the browser's onscroll event which will then cause the viewpane to move to a corresponding position
      objGUI.childNodes[3].scrollLeft = intScrollLeft;

      //if the horiz-autoscroller is not displayed, the system event will never fire. manually do so here.
      if (objGUI.childNodes[3].style.display == "none")
        this._ebScrollH(false,objGUI.childNodes[3]);
    }
  };

  /**
   * Returns the vertical scroll position.
   * @return {int} a non-negative number
   */
  Matrix_prototype.getScrollTop = function() {
    return (this._jsxcurscrolltop) ? this._jsxcurscrolltop : 0;
  };

  /**
   * Returns the vertical scroll position as reported by the view
   * @return {int} a non-negative number
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._getScrollTop = function() {
    //move the hscroller to the given position
    var objGUI = this.getRendered();
    return (objGUI && objGUI.childNodes[2]) ? objGUI.childNodes[2].scrollTop : this.getScrollTop();
  };

  /**
   * Sets the vertical scroll position.
   * @param intScrollTop {int} a non-negative number
   * @param-private objGUI {HTMLElement}
   */
  Matrix_prototype.setScrollTop = function(intScrollTop, objGUI) {
    if(intScrollTop < 0)
      intScrollTop = 0;
    //move the vscroller to the given position
    objGUI = this.getRendered(objGUI);
    if (objGUI && objGUI.childNodes[2]) {
      //the scroll trigger will never happen when zero;
      if(objGUI.childNodes[2].scrollTop == 0 && intScrollTop == 0)
        objGUI.childNodes[2].scrollTop = 1;
      objGUI.childNodes[2].scrollTop = intScrollTop;
    }
  };


  /**
   * Updates the scroll height and scroll position of the vertical scrollbar. When a Matrix instance has
   * a display property of <b>none</b> (or is contained by an ancestor with a display of none) and the Matrix is repainted (repaint/repaintData),
   * the browser will misreport how large the content actually is.  When the Matrix is then restored the scrollbars will be disabled.
   * By calling this method after the view has been restored (i.e., when display is set to <b>block</b>), the scrollbars will reflect the accurate height.
   */
  Matrix_prototype.synchronizeVScroller = function() {
    this._updateScrollHeight();
  };

  /**
   * Updates the scrollheight of the on-screen auto-scroller. Note that _updateScrollWidth doesn't exist as a correlary method, because the
   * system always controls width, but only sometimes controls height
   * Call whenever content is added/removed to the View Pane in order to keep the scroller and the viewpane in synch. Also call when a tree node is
   * toggled.
   * @param objViewPane {Object | null} The native browser element to put content into (the view pane)
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._updateScrollHeight = function(objViewPane) {
    if (!objViewPane) objViewPane = this._getViewPane();
    if (!objViewPane) return;

    //adjust scrolltop if not in pagin mode
    if (this.getPagingModel() != Matrix.PAGING_PAGED) {
      var b1fa = this.getBoxProfile(true).getChildProfile(2).getChildProfile(0);
      b1fa.recalculate({height:objViewPane.offsetHeight + this.getHeaderHeight(Matrix.DEFAULT_HEADER_HEIGHT)},objViewPane.parentNode.parentNode.childNodes[2].childNodes[0],null);

      //when adjusting scroll position the model and view can get out of synch.  check here.  If so, use the view (which is accurate) to update the model.
      var intST = this._getScrollTop();
      if (this.getScrollTop() != intST) {
        this.setScrollTop(intST);
        objViewPane.style.top = "-" + intST + "px";
      }
    } else {
      //if the stated scroll top does not equal the known scroll top, reset
      if(this.getScrollTop() != this._getScrollTop())
        this.setScrollTop(this._getScrollTop()-1);
    }

    //adjust scrollLeft
    if (objViewPane.parentNode.parentNode.childNodes[3].style.display == "none") {
      this.setScrollLeft(0);
    } else if(this.getScaleWidth() != 1) {
      var intLeft = this.getScrollLeft();
      // objViewPane could have no dimension when matrix has no data.
      var intDiff = (!objViewPane.offsetWidth) ? intLeft : objViewPane.offsetWidth - objViewPane.parentNode.parentNode.offsetWidth;
      if(intLeft > intDiff)
        this.setScrollLeft(intDiff);
    }

    //call method to hide the corner graphic if scrollers aren't visible
    this._toggleScrollBoxDisplay();
  };

  /**
   * Displays or hides the corner graphic (the one that makes the 2 scrollers look like a unified set) based on whether or not at least one scrollbar is visible
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._toggleScrollBoxDisplay = function() {
    var objGUI = this.getRendered();
    if (objGUI)
      objGUI.childNodes[4].style.display = (this.getSuppressVScroller(0) == 1) ? "none" : "";
  };

  /**
   * Returns whether or not the column widths should be adjusted (decremented) such that all columns fit within the viewport.
   * If <code>null</code> or <code>jsx3.Boolean.FALSE</code>, scale width will <b>not</b> be used and the column widths will render
   * fully, displaying a horizontal scrollbar when necessary. In such a case, all wildcard columns (e.g., *) will be resolved to the value,
   * <code>jsx3.gui.Matrix.Column.DEFAULT_WIDTH</code>.
   * @return {int}
   */
  Matrix_prototype.getScaleWidth = function() {
    return this.jsxscalewidth;
  };

  /**
   * Sets whether or not the column widths should be adjusted such that all columns visually display within the viewport.
   * Defaults to <code>jsx3.Boolean.FALSE</code> if not set, meaning a horizontal scrollbar will appear if the aggregate column widths
   * exceed the available width of the viewport.
   * @param intBoolean {int} One of: <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  Matrix_prototype.setScaleWidth = function(intBoolean) {
    this.jsxscalewidth = intBoolean;
    this.setBoxDirty();
    return this;
  };

  /**
   * Ensures that only children of type jsx3.gui.Matrix.Column are accepted; returns true if valid
   * @return {boolean}
   * @package
   */
  Matrix_prototype.onSetChild = function(child) {
    if (child instanceof Matrix.Column || !(child instanceof jsx3.gui.Painted)) {
      this._reset();
      return true;
    }
    return false;
  };

  /**
   * inserts DHTML (as string) into IE's on-screen DOM as a child of the object's on-screen VIEW
   * @param objJSX {jsx3.app.Model} direct child whose generated VIEW will be directly inserted into the DOM to provide more efficient screen updates as repaint is costly for large applications
   */
  Matrix_prototype.paintChild = function(objJSX, bGroup) {
    if (! bGroup)
      this.repaint();
  };

  /**
   * Instance implementation
   *
   * @param objChild {jsx3.app.Model|Array<jsx3.app.Model>} the child that was removed
   * @param intIndex {int} the index of the removed child
   * @package  for now
   */
  Matrix_prototype.onRemoveChild = function(objChild, intIndex) {
    this.jsxsuper(objChild, intIndex);
    this._reset();
    //TO DO: how is this affected by a loop? what about runtime??
    this.repaint();
  };

  /**
   * Returns CSS property value(s) for a border (border: solid 1px #000000)
   * @return {String}
   */
  Matrix_prototype.getHeaderBorder = function() {
    return this.jsxheaderborder;
  };

  /**
   * Sets CSS property value(s) for a border on the header row (<code>border: solid 1px #000000</code>). Updates both model and view.
   * @param strCSS {String} valid CSS property value for a border (border: solid 1px #000000)
   */
  Matrix_prototype.setHeaderBorder = function(strCSS) {
    this.jsxheaderborder = strCSS;
    this.clearBoxProfile(true);
    this.repaintHead();
  };

  /**
   * Returns CSS property value(s) for a border (border: solid 1px #000000)
   * @return {String}
   */
  Matrix_prototype.getBodyBorder = function() {
    return this.jsxbodyborder;
  };

  /**
   * Sets CSS property value(s) for a border (<code>border: solid 1px #000000</code>). Updates MODEL and VIEW (unless repaint is suppressed).
   * @param strCSS {String} valid CSS property value for a border (border: solid 1px #000000)
   * @param bSuppressRepaint {Boolean} Pass <code>true</code> to stop the default repaint from occurring.
   * Typically property updates that affect the browser-specific box model (such as borders) are repainted
   * immediately to keep the box model abstraction in synch with the native view. However, the repaint can be
   * suppressed to avoid unnecessary reparsing of the XSLT during repeated property updates.
   * @return {jsx3.gui.Block} this object
   */
  Matrix_prototype.setBodyBorder = function(strCSS,bSuppressRepaint) {
    this.jsxbodyborder = strCSS;
    this._reset();
    if (!bSuppressRepaint) this.repaint();
  };

  /**
   * Returns an array of selected values (or empty array) if the selection model is <code>jsx3.gui.Matrix.SELECTION_MULTI_ROW</code>. Returns a string (or null)
   * for the other selection models
   * @return {String | Array<String>}
   */
  Matrix_prototype.getValue = function() {
    var sType = this.getSelectionModel();
    if (sType == Matrix.SELECTION_MULTI_ROW) {
      return this.getSelectedIds();
    } else {
      return this.getSelectedIds()[0];
    }
  };

  /**
   * <code>STATEINVALID</code> is returned if the <code>required</code> property of this control is
   * <code>true</code> and no selection is made.
   * @return {int} <code>jsx3.gui.Form.STATEINVALID</code> or <code>jsx3.gui.Form.STATEVALID</code>.
   */
  Matrix_prototype.doValidate = function() {
    var valid = this.getSelectedNodes().size() > 0 || this.getRequired() == jsx3.gui.Form.OPTIONAL;
    this.setValidationState(valid ? jsx3.gui.Form.STATEVALID : jsx3.gui.Form.STATEINVALID);
    return this.getValidationState();
  };

  /**
   * Returns the rendering model (how rows will be painted on-screen). If not set, the instance will render <b>deep</b>, meaning all descendants
   * of the <b>rendering context</b> will be painted on-screen.
   * @param-private strDefault {String} The default value to use if null
   * @return {String}
   */
  Matrix_prototype.getRenderingModel = function(strDefault) {
    return (this.jsxrenderingmodel) ? this.jsxrenderingmodel : ((strDefault) ? strDefault : null);
  };

  /**
   * Sets the rendering model (how rows will be painted on-screen).
   * @param MODEL {String} one of: shallow, deep, or hierarchical
   * @param bSuppressRepaint {Boolean} Pass <code>true</code> to stop the default repaint from occurring.
   */
  Matrix_prototype.setRenderingModel = function(MODEL,bSuppressRepaint) {
    this.jsxrenderingmodel = MODEL;
    //TO DO: the reset command may be simple.  perhaps pass true.  test to see, since it's much more efficient
    this._reset();
    if (!bSuppressRepaint) this.repaint();
  };

  /**
   * Returns the jsxid of the CDF record that will serve as the <b>origin</b> when rendering the data on-screen. If not set, the
   * id, <b>jsxroot</b>, (which is the id for the root node, &lt;data&gt;) will be used.
   * @param-private strDefault {String} The default value to use if null
   * @return {String}
   */
  Matrix_prototype.getRenderingContext = function(strDefault) {
    return (this.jsxrenderingcontext != null && this.jsxrenderingcontext != "") ? this.jsxrenderingcontext : ((strDefault != null) ? strDefault : null);
  };

  /**
   * Sets the jsxid of the CDF record that will serve as the <b>origin</b> when rendering the data on-screen.
   * @param strJsxId {String} jsxid property for the CDF record to use as the contextual root when rendering data on-screen.
   * @param bSuppressRepaint {Boolean} Pass <code>true</code> to stop the default repaint from occurring.
   */
  Matrix_prototype.setRenderingContext = function(strJsxId,bSuppressRepaint) {
    this.jsxrenderingcontext = strJsxId;
    this._reset(true);
    if (!bSuppressRepaint) this.repaint();
  };

// ***********************************************+
// ****************** TREE ICONS *****************|
// ***********************************************+

  /**
   * Returns whether or not to supress display of the horizontal scrollbar. When not set, the scrollbar will display as needed.
   * @param-private strDefault {String} The default value to use if null
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  Matrix_prototype.getSuppressHScroller = function(strDefault) {
    return (this.jsxsuppresshscroll != null) ? this.jsxsuppresshscroll : ((strDefault != null) ? strDefault : null);
  };

  /**
   * Sets whether or not to supress display of the horizontal scrollbar. Updates both model and view
   * @param intTrueFalse {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  Matrix_prototype.setSuppressHScroller = function(intTrueFalse) {
    this.jsxsuppresshscroll = intTrueFalse;
    var objGUI = this.getRendered();
    if (objGUI && objGUI.childNodes[3]) {
      objGUI.childNodes[3].style.display = (intTrueFalse != 1) ? "block" : "none";
      this._toggleScrollBoxDisplay();
    }
  };

  /**
   * Returns whether or not to supress display of the vertical scrollbar. When not set, the scrollbar will display as needed.
   * @param-private strDefault {String} The default value to use if null
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  Matrix_prototype.getSuppressVScroller = function(strDefault) {
    return (this.jsxsuppressvscroll != null) ? this.jsxsuppressvscroll : ((strDefault != null) ? strDefault : null);
  };

  /**
   * Sets whether or not to supress display of the vertical scrollbar. Updates both model and view.
   * @param intTrueFalse {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   * @param bSuppressRepaint {Boolean} Pass <code>true</code> to stop the default repaint from occurring.
   * Typically property updates that affect the browser-specific box model (such as rendering the vertical scrollbar) are repainted
   * immediately to keep the box model abstraction in synch with the native view. However, the repaint can be
   * suppressed to avoid unnecessary reparsing of the XSLT during repeated property updates.
   */
  Matrix_prototype.setSuppressVScroller = function(intTrueFalse,bSuppressRepaint) {
    this.jsxsuppressvscroll = intTrueFalse;

    this._reset();
    if (bSuppressRepaint) {
      //user chose to suppress the repaint.  provide immmediate feedback in the interim
      var objGUI = this.getRendered();
      if (objGUI && objGUI.childNodes[2]) {
        objGUI.childNodes[2].style.display = (intTrueFalse != 1) ? "block" : "none";
        this._toggleScrollBoxDisplay();
      }
    } else {
      //force the repaint
      this.repaint();
    }
  };

  /**
   * Returns the zero-based index of the on-screen column(s), to the left of which will be fixed and cannot be reordered.  For example, if this value
   * is set to <code>1</code>, the first column can never be reordered and will always remain the first column.  If this value is set to <code>2</code>,
   * the first two columns will be fixed.  Setting this value to <code>0</code> is effectively the same as setting it to <code>null</code>
   * @param-private strDefault {String} The default value to use if null
   * @return {int} positive integer
   */
  Matrix_prototype.getFixedColumnIndex = function(strDefault) {
    return (this.jsxfixedcolumnindex != null) ? this.jsxfixedcolumnindex : ((strDefault != null) ? strDefault : null);
  };

  /**
   * Sets the zero-based index of the on-screen column(s), to the left of which will be fixed and cannot be reordered.
   * @param intIndex {int} positive integer
   */
  Matrix_prototype.setFixedColumnIndex = function(intIndex) {
    this.jsxfixedcolumnindex = intIndex;
  };

  /**
   * Returns whether or not to render the navigation controls that are applied to the first column when rendering model is <b>hierarchical</b>.  When not set the navigators are rendered.
   * @param-private strDefault {String} The default value to use if null
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  Matrix_prototype.getRenderNavigators = function(strDefault) {
    return (this.jsxrendernavigators != null) ? this.jsxrendernavigators : ((strDefault != null) ? strDefault : null);
  };

  /**
   * Sets whether or not to render the navigation controls on the first column when being rendered in <b>hierarchical</b> mode.
   * @param intTrueFalse {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   * @param bSuppressRepaint {Boolean} Pass <code>true</code> to stop the default repaint from occurring.
   * Typically property updates that affect the browser-specific box model (such as rendering the navigational controls) are repainted
   * immediately to keep the box model abstraction in synch with the native view. However, the repaint can be
   * suppressed to avoid unnecessary reparsing of the XSLT during repeated property updates.
   */
  Matrix_prototype.setRenderNavigators = function(intTrueFalse,bSuppressRepaint) {
    this.jsxrendernavigators = intTrueFalse;
    this._reset();
    if (!bSuppressRepaint) this.repaint();
  };

  /**
   * Returns the icon to use for those CDF records that do not explicitly specify an icon via the <b>jsximg</b> attribute
   * @param-private strDefault {String} The default value to use if null
   * @return {String} URL for icon to use. If null, <code>jsx3.gui.Matrix.ICON</code> will be applied when rendered.
   */
  Matrix_prototype.getIcon = function(strDefault) {
    return (this.jsxicon != null && this.jsxicon != "") ? this.jsxicon : ((strDefault) ? strDefault : null);
  };

  /**
   * Sets the icon to use for those CDF records that do not explicitly specify an icon via the <b>jsximg</b> attribute
   * @param strURL {String} URL for icon to use
   */
  Matrix_prototype.setIcon = function(strURL) {
    this.jsxicon = strURL;
  };

  /**
   * Returns the icon to use when the given tree node is in an open state.
   * @param-private strDefault {String} The default value to use if null
   * @return {String} URL for icon. If null, <code>jsx3.gui.Matrix.ICON_MINUS</code> will be applied when rendered.
   */
  Matrix_prototype.getIconMinus = function(strDefault) {
    return (this.jsxiconminus != null && this.jsxiconminus != "") ? this.jsxiconminus : ((strDefault) ? strDefault : null);
  };

  /**
   * Sets the icon to use when the given tree node is in an open state.
   * @param strURL {String} URL (preferably relative)
   */
  Matrix_prototype.setIconMinus = function(strURL) {
    this.jsxiconminus = strURL;
  };

  /**
   * Returns the icon to use when the given tree node is in a closed state.
   * @param-private strDefault {String} The default value to use if null
   * @return {String} URL for icon to use. If null, <code>jsx3.gui.Matrix.ICON_PLUS</code> will be applied when rendered.
   */
  Matrix_prototype.getIconPlus = function(strDefault) {
    return (this.jsxiconplus != null && this.jsxiconplus != "") ? this.jsxiconplus : ((strDefault) ? strDefault : null);
  };

  /**
   * Sets the icon to use when the given tree node is in a closed state.
   * @param strURL {String} URL (preferably relative)
   */
  Matrix_prototype.setIconPlus = function(strURL) {
    this.jsxiconplus = strURL;
  };

// ***********************************************+
// ***************** REDRAW LOGIC ****************|
// ***********************************************+

  /**
   * Removes a record from the XML data source of this object.
   *
   * @param strRecordId {String} the <code>jsxid</code> attribute of the data record to remove.
   * @param bRedraw {boolean} if <code>true</code> or <code>null</code>, the on-screen view of this object is
   *    immediately updated to reflect the deleted record.
   * @return {jsx3.xml.Entity} the record removed from the data source or <code>null</code> if no such record found.
   */
  Matrix_prototype.deleteRecord = function(strRecordId,bRedraw) {
    //NOTE:  Once a record is deleted, the context is lost that is necessary to remove the child descendants in the view.
    //       The analog to this method when inserting is: _insertFlattenedDescendants
    //get handle to xml document in cache
    var objXML = this.getXML();

    //get node to remove
    var objNode = objXML.selectSingleNode(this._getSelectionQuery(strRecordId));
    if (objNode != null) {
      //remove the node
      objNode = objNode.getParent().removeChild(objNode);

      //remove item from on-screen VIEW if relevant
      if (bRedraw !== false) {
        this.redrawRecord(strRecordId, CDF.DELETE);

        //when rendering flat, rows may exist in the view that belong to the model record that was just deleted
        //this means the cleanup of the view will require manually removing on-screen TR elements
        if (this.getRenderingModel() != Matrix.REND_HIER) {
          var objRecords = objNode.selectNodes(".//" + this._cdfan("children"));
          for (var j = objRecords.size()-1;j>=0;j--) {
            var objRecord = objRecords.get(j);
            this.redrawRecord(this._cdfav(objRecord, "id"), CDF.DELETE);
          }
        }
      }

      //return the removed node
      return objNode;
    }

    return null;
  };


  /**
   * Inserts a new property into an existing record with <code>jsxid</code> equal to <code>strRecordId</code>.
   * If the property already exists, the existing property value will be updated. If no such record exists
   * in the XML document, this method fails quietly.
   *
   * @param strRecordId {String} the <code>jsxid</code> attribute of the data record to modify.
   * @param strPropName {String} the name of the property to insert into the record.
   * @param strPropValue {String} the value of the property to insert.
   * @param bRedraw {boolean} if <code>true</code> or <code>null</code>, the on-screen view of this object is
   *    immediately updated to reflect the inserted property.
   * @return {jsx3.xml.CDF} this object.
   */
  Matrix_prototype.insertRecordProperty = function(strRecordId,strPropName,strPropValue,bRedraw) {
    //if user is updating the jsxid (the primary key), update the on-screen structures that should be resolved
    if (strPropName == "jsxid") {
      //update the property, but suppress the redraw
      var objNode = this.jsxsupermix(strRecordId,strPropName,strPropValue,false);

      //update the GUI
      var objTR = this._getRowById(strRecordId);
      if (objTR) {
        //update VIEW-related attributes that relate to the jsxid
        objTR.setAttribute("jsxid",strPropValue);
        objTR.setAttribute("JSXDRAGID",strPropValue);
        var strBase = this.getId() + "_jsx_" + strPropValue;
        objTR.setAttribute("id",strBase);
        var objKids = objTR.childNodes;
        strBase += "_jsx_";
        for (var i=0;i<objKids.length;i++)
          objKids[i].setAttribute("id",strBase + i);

        //with on-screen structures now updated, see if user wants to also update the actual cell content in those structures
        if (bRedraw != false) this.redrawRecord(strPropValue,jsx3.xml.CDF.UPDATE);
        return objNode;
      }
    } else {
      return this.jsxsupermix(strRecordId,strPropName,strPropValue,bRedraw);
    }
  };

  /**
   * Updates the on-screen cell to reflect the value in the CDF document to which the cell is mapped.
   * @param strRecordId {String} <code>jsxid</code> value for the record node (according to the CDF) corresponding to the on-screen row to update
   * @param objColumn {jsx3.gui.Matrix.Column} Column instance to update. Any sibling Columns that map to the same named attribute as <b>objColumn</b>
   * (e.g., <code>[objColumn].getPath()</code>) as well as all sibling Columns that are triggered by the named attribute
   * (e.g., <code>[objColumn].getTriggers()</code>) will also be redrawn.
   * @param bSuppressTriggers {Boolean} if true, no other sibling Columns will be updated, even if they share a common path or designate the path as one of their triggers.
   * @param-private objTRXML {jsx3.xml.Entity} if present, use instead of generating the row XHTML via XSLT
   * @see jsx3.gui.Matrix.Column#setPath()
   * @see jsx3.gui.Matrix.Column#setTriggers()
   */
  Matrix_prototype.redrawCell = function(strRecordId,objColumn,bSuppressTriggers,objTRXML) {
    //this is an update to the cell value. Call the cellvalue template (xslt) directly for the content; then call the formatHandler (all synchronous)
    var intCellIndex = objColumn.getDisplayIndex();
    var objCell = this._getCellByIndex(strRecordId,intCellIndex);
    if (objCell) {
      var objDiv;
      if(this.getRenderingModel() == Matrix.REND_HIER) {
        var objMyGUI = this._getStructureById(strRecordId);
        var objContent = objMyGUI.parentNode;
        var strXHTML = this._drawStructure(strRecordId,objContent.getAttribute("jsxcontextindex"));
        var objDoc = new jsx3.xml.Document();
        if(!objTRXML) {
          objTRXML = objDoc.loadXML(strXHTML);
          while(objTRXML && objTRXML.getBaseName() != "tr")
            objTRXML = objTRXML.getFirstChild();
          if(!objTRXML)
            return;
        }
        if(objColumn.getChildIndex() == 0  && this.getRenderNavigators(1) != 0) {
          var objtrxml = objTRXML.getFirstChild();
          while(objtrxml && objtrxml.getBaseName() != "tr")
            objtrxml = objtrxml.getFirstChild();
          var objTR=objCell.childNodes[0]; // cell content
          while (objTR && objTR.tagName.toLowerCase() != "tr")
            objTR = objTR.childNodes[0];
          if(!objtrxml || !objTR)
            return;
          objDiv = this._updateTD(objtrxml,objTR,2);
        } else {
          objDiv = this._updateTD(objTRXML,objCell.parentNode,intCellIndex);
        }
      } else {
        var objTR = objCell.parentNode;
        if(!objTRXML)
          objTRXML = this._getTR(strRecordId);
        if(this.getRenderingModel() == Matrix.REND_HIER) {
          while(objTRXML && objTRXML.getBaseName() != "tr")
            objTRXML = objTRXML.getFirstChild();
          if(!objTRXML)
            return;
        }
        objDiv = this._updateTD(objTRXML,objTR,intCellIndex);
      }
      objDiv = objDiv.childNodes[0];

      //perform the 2-pass, using the formthandler (if it exists)
      var objFormatHandler = objColumn._getFormatHandler();
      if (objFormatHandler) {
        var objRow = objCell.parentNode;
        objFormatHandler.format(objDiv, objRow.getAttribute("jsxid"), this, objColumn,
            objRow.getAttribute("jsxrownumber") ,this.getServer());
      }

      //call any sibling cells in this row that specify a trigger equal to the column's path
      if (!bSuppressTriggers) {
        var oKids = this._getDisplayedChildren();
        var re = new RegExp("\\b(" + objColumn.getPath() + ")\\b");
        for (var i=0;i<oKids.length;i++) {
          var strTriggers = oKids[i].getTriggers() + "";
          if (oKids[i] != objColumn && (oKids[i].getPath() == objColumn.getPath() || strTriggers.search(re) >= 0))
            this.redrawCell(strRecordId,oKids[i],true,objTRXML);
        }
      }
    }
  };

  /**
   * Updates the on-screen cell to reflect the value in the CDF document to which the cell is mapped.
   * @param strRecordId {String} The <code>jsxid</code> value for the record node (according to the CDF) corresponding to the on-screen row to update
   * @param strAttName {String} Named attribute on the CDF record. All Column children that map to this named attribute
   * (e.g., <code>[objColumn].getPath()</code>) as well as all Column children that are triggered by the named attribute
   * (e.g., <code>[objColumn].getTriggers()</code>) will be redrawn.
   * @see jsx3.gui.Matrix.Column#setPath()
   * @see jsx3.gui.Matrix.Column#setTriggers()
   */
  Matrix_prototype.redrawMappedCells = function(strRecordId,strAttName) {
    var oKids = this._getDisplayedChildren();
    for (var i=0;i<oKids.length;i++) {
      if (oKids[i].getPath() == strAttName) {
        this.redrawCell(strRecordId,oKids[i],false);
        return;
      }
    }
  };

  /**
   * Generates the HTML for a structure (a structure is what is generated when rendering
   * in hierarchical mode) and any descendant structures per the paging model (stepped or none/2pass)
   * @param strRecordId {String} <code>jsxid</code> value for the record node (according to the CDF) to draw
   * @param intContentIndex {int} positive integer representing the descendant depth of the structure (1 is root)
   * @private
   * @jsxobf-clobber
   */
  Matrix_prototype._drawStructure = function(strRecordId,intContentIndex) {
    return this.doTransform({jsx_mode:"record",jsx_panel_css:"position:relative;",
                             jsx_column_widths:this._getViewPaneWidth(),
                             jsx_context_index:intContentIndex?intContentIndex:1,
                             jsx_rendering_context:this._cdfav(this.getRecordNode(strRecordId).getParent(), "id"),
                             jsx_rendering_context_child:strRecordId});
  };

  /**
   * Matrix implementation.
   * @param strRecordId {String} <code>jsxid</code> value for the record node (according to the CDF) to redraw
   * @param intAction {int} <code>jsx3.xml.CDF.INSERT</code>, <code>jsx3.xml.CDF.INSERTBEFORE</code>, <code>jsx3.xml.CDF.DELETE</code>, or <code>jsx3.xml.CDF.UPDATE</code>.
   * @param-private bRecurse {Boolean} if != false, any necessary recursion for flattened inserts will be automatically handled
   */
  Matrix_prototype.redrawRecord = function(strRecordId,intAction,bRecurse) {
    var objViewPane = this._getViewPane();

    //first resolve the verb type (insert, update, etc)
    if (strRecordId != null && intAction == jsx3.xml.CDF.UPDATE) {
      if (this.getRenderingModel() == Matrix.REND_HIER) {
        //get the onscreen structure that represents this node in it entirety (including its child structures)
        var objMyGUI = this._getStructureById(strRecordId);
        var objContent = objMyGUI.parentNode;
        var strHTML = this._drawStructure(strRecordId,objContent.getAttribute("jsxcontextindex"));
        html.setOuterHTML(objMyGUI, strHTML);

        //apply the formathandlers to the newly added content
        objMyGUI = this._getStructureById(strRecordId);
        var myToken = {painted:1,token:Matrix.getToken(),contextnodes:[objMyGUI]};
        this._getPanelArray()[0] = myToken;
        this._applyFormatHandlers(myToken);
      } else {
        //update the content for each child cell in this row (NOTE: the called method will also apply the formathandlers)
        var objTR = this._updateTR(this._getRowById(strRecordId),strRecordId);
        this._doFormatRow(objTR,strRecordId);
      }
    } else if (strRecordId != null && intAction == jsx3.xml.CDF.DELETE) {
      if (this.getRenderingModel() == Matrix.REND_HIER) {
        //delete the structure
        var objGUI = this._getStructureById(strRecordId);
        if (objGUI) {
          var objPGUI = objGUI.parentNode;
          html.removeNode(objGUI);

          //if the parent of the deleted structure n longer has kids, close it...
          if (objPGUI.childNodes.length == 0) {
            var objTable = objPGUI.previousSibling;
            var objFirstRow = this._getFirstRow(objTable);
            if (objFirstRow) {
              var strPId = objFirstRow.getAttribute("jsxid");
              this.redrawRecord(strPId, jsx3.xml.CDF.UPDATE);
            }
          }

          this._updateScrollHeight();
        }
      } else if (this.getPagingModel(Matrix.PAGING_OFF) != Matrix.PAGING_PAGED) {
        var objGUI = this._getRowById(strRecordId);
        if (objGUI) {
          var objPanel = objGUI.parentNode;
          if (objPanel.childNodes.length == 1) {
            //this is the last row in the panel, remove the entire panel
            if (objPanel.tagName.toLowerCase() != "table") objPanel = objPanel.parentNode;
            html.removeNode(objPanel);
          } else {
            //if this is the first row in the panel, must first transfer cell widths to next sibling before removing
            var objNext = objGUI.nextSibling;
            if (objGUI.parentNode.firstChild == objGUI && objNext) {
              for (var i=0;i<objGUI.childNodes.length;i++)
                objNext.childNodes[i].style.width = objGUI.childNodes[i].style.width;
            }
            html.removeNode(objGUI);

            //whenever content length changes when not in paged mode, query content to adjust the scrollers
            this._updateScrollHeight();
          }
        }
      } else {
        //deletes break paginated layouts; must repaint
        this.repaint();
      }
    } else if (strRecordId != null && intAction == jsx3.xml.CDF.INSERTBEFORE) {
      if (this.getPagingModel(Matrix.PAGING_OFF) != Matrix.PAGING_PAGED) {
        //resolve the ID of the sibling to 'insertbefore'
        var objNode = this.getRecordNode(strRecordId);
        var objRef = objNode.getNextSibling();
        var strRefId = this._cdfav(objRef, "id");

        if (this.getRenderingModel() == Matrix.REND_HIER) {
          //get the onscreen structure that represents this node in it entirety (including its child structures)
          var objSiblingContext = this._getStructureById(strRefId);
          var strHTML = this._drawStructure(strRecordId,objSiblingContext.parentNode.getAttribute("jsxcontextindex"));
          html.insertAdjacentHTML(objSiblingContext,"BeforeBegin",strHTML);

          //apply the formathandlers to the newly added content
          var myToken = {painted:1,token:Matrix.getToken(),contextnodes:[objSiblingContext.previousSibling]};
          this._getPanelArray()[0] = myToken;
          this._applyFormatHandlers(myToken);

          //update the scrollheight
          this._updateScrollHeight(objViewPane);
        } else {
          //query the data model to locate the 'next sibling'
          //TO DO: handle NPE if no objRefGUI -- may need to generate the entire table here if no content on-screeen yet.
          var objRefGUI = this._getRowById(strRefId);
          var objTBody = objRefGUI.parentNode;
          var objTR = this._createNewTR(objTBody,strRecordId);
          objTBody.insertBefore(objTR,objRefGUI);

          //if the newly-inserted row is now the first row in the panel, apply CSS 'width' to the new row (the first row always defines the width for all rows)
          if (objTBody.firstChild == objTR) {
            for (var i=0;i<objTR.childNodes.length;i++) {
              //apply width to new row
              objTR.childNodes[i].style.width = objRefGUI.childNodes[i].style.width;

              //remove width from old row (only the first row in a panel defines the width
              objRefGUI.childNodes[i].style.width = "";
            }
          }

          //call format handler for all cells in this row
          this._doFormatRow(objTR,strRecordId);

          //update the scrollheight
          this._updateScrollHeight(objViewPane);
          if(bRecurse !== false)
            this._insertFlattenedDescendants(objNode);
        }
      } else {
        //insertbefore breaks paginated layouts; must repaint
        this.repaint();
      }
    } else if (strRecordId != null && intAction == jsx3.xml.CDF.INSERT) {
      if (this.getPagingModel(Matrix.PAGING_OFF) != Matrix.PAGING_PAGED) {
        if (this.getRenderingModel() == Matrix.REND_HIER) {
          //does the object already have content?
          var strCdfParentId = this._cdfav(this.getRecordNode(strRecordId).getParent(), "id");
          var objMyGUI = this._getStructureById(strCdfParentId);
          var objContent = objMyGUI.lastChild;
          if (this._hasNoEntityContent(objContent)) {
            //the object has no content. toggling open will have the same effect
            this.toggleItem(strCdfParentId, true);
          } else {
            var strHTML = this._drawStructure(strRecordId,objContent.getAttribute("jsxcontextindex"));
            html.insertAdjacentHTML(objContent,"BeforeEnd",strHTML);

            //apply the formathandlers to the newly added content
            var myToken = {painted:1,token:Matrix.getToken(),contextnodes:[objContent.lastChild]};
            this._getPanelArray()[0] = myToken;
            this._applyFormatHandlers(myToken);

            //update the scrollheight
            this._updateScrollHeight(objViewPane);
          }
        } else {
          //add the new row as an append to the last panel
          var objTBody = this._getLastPanel();
          if (objTBody == null || objTBody.firstChild == null) {
            //just repaint the grid.  No records yet
            this.repaintData();
          } else {
            //see if the first child is the tbody, if so, grab its first child (actually looking for the TR, nothing else)
            if (objTBody.firstChild.tagName.toLowerCase() == "tbody") objTBody = objTBody.firstChild;
            var objTR = this._createNewTR(objTBody,strRecordId);
            objTBody.appendChild(objTR);

            //call format handler for all cells in this row
            this._doFormatRow(objTR,strRecordId);

            //update the scrollheight
            this._updateScrollHeight(objViewPane);

            if(bRecurse !== false)
              this._insertFlattenedDescendants(this.getRecordNode(strRecordId));
          }
        }
      } else {
        //inserts break paginated layouts; must repaint
        this.repaint();
      }
    }
  };



  /* @jsxobf-clobber */
  Matrix_prototype._insertFlattenedDescendants = function(objRecord) {
    //when a record with child records is inserted into a matrix with a paging model of deep, ensures that all
    //descendants are painted on-screen as they would have been had the record been part of the data model
    //when the view was first painted
    if (this.getRenderingModel(Matrix.REND_DEEP) == Matrix.REND_DEEP) {
      var i = objRecord.selectNodeIterator(".//" + this._cdfan("children"));
      while (i.hasNext()) {
        objRecord = i.next();
        this.redrawRecord(this._cdfav(objRecord, "id"), CDF.INSERT, false);
      }
    }
  };


  /* @jsxobf-clobber */
  Matrix_prototype._hasNoEntityContent = function(objGUI) {
    //returns true if objGUI has no entity content
    return objGUI.childNodes.length == 0 || (objGUI.childNodes.length == 1 && objGUI.childNodes[0].nodeType != 1);
  };

  /* @jsxobf-clobber */
  Matrix_prototype._doFormatRow = function(objTR,strRecordId) {
    if (!objTR) return;
    //perform the 2-pass, using the formthandler (if it exists)
    var objKids = this._getDisplayedChildren();
    for (var i=0;i<objKids.length;i++) {
      var objColumn = objKids[i];
      var objFormatHandler = objColumn._getFormatHandler();
      if (objFormatHandler) {
        var objDiv = objTR.childNodes[i].childNodes[0];
        objFormatHandler.format(objDiv, strRecordId, this, objColumn,
            objTR.getAttribute("jsxrownumber") ,this.getServer());
      }
    }
  };

  /* @jsxobf-clobber */
  Matrix_prototype._createNewTR = function(objTBody,strRecordId) {
    //get the HTML for this table row (TR) via XSLT
    var myDoc = this.getDocument();
    var objEntity = this._getTR(strRecordId);
    var objTR = myDoc.createElement("tr");
    Matrix.convertXMLToDOM(objEntity,objTR,true);
    for (var i = objEntity.getChildIterator(); i.hasNext(); ) {
      objEntity = i.next();
      var objTD = myDoc.createElement("td");
      Matrix.convertXMLToDOM(objEntity,objTD,true);
      objTR.appendChild(objTD);
      objTD.innerHTML = objEntity.getFirstChild().getXML();
    }
    return objTR;
  };

  /* @jsxobf-clobber */
  Matrix_prototype._getTR = function(strRecordId) {
    //generate a TR XML Node using XSLT
    var objParams = {};
    objParams.jsx_column_widths = this._getViewPaneWidth();
    objParams.jsx_rendering_context = this._cdfav(this.getRecordNode(strRecordId).getParent(), "id");
    objParams.jsx_rendering_context_child = strRecordId;
    objParams.jsx_mode = "record";
    var strXHTML = this.doTransform(objParams);
    var objDoc = new jsx3.xml.Document();
    objDoc.loadXML(strXHTML);
    return objDoc.getRootNode();
  };

  /* @jsxobf-clobber */
  Matrix_prototype._updateTR = function(objTR,strRecordId) {
    if (!objTR) return;
    //update a TR and all TD children with generated XHTML
    var objEntity = this._getTR(strRecordId);
    Matrix.convertXMLToDOM(objEntity,objTR,false);
    var j = 0;
    for (var i = objEntity.getChildIterator(); i.hasNext(); ) {
      objEntity = i.next();
      var objTD = objTR.childNodes[j];
      Matrix.convertXMLToDOM(objEntity,objTD,false);
      objTD.innerHTML = objEntity.getFirstChild().getXML();
      j++;
    }
    return objTR;
  };

  /* @jsxobf-clobber */
  Matrix_prototype._updateTD = function(objTRXML,objTR,intCellIndex) {
    //update a single TD with the generated XHTML
    var objTDXML = objTRXML.selectSingleNode("*[" + (intCellIndex+1) + "]");
    var objTD = objTR.childNodes[intCellIndex];
    Matrix.convertXMLToDOM(objTDXML,objTD,false);
    objTD.innerHTML = objTDXML.getFirstChild().getXML();
    return objTD;
  };

   /**
   * applies the attributes belonging to the XML entity, objEntity, and applies to the browser DOM element, objDOM
   * @param objEntity {jsx3.xml.Entity} jsx3.xml.Entity instance
   * @param objDOM {HTMLElement} native browser DOM element (a TR/TD)
   * @param bBox {Boolean} if true, transfer box-type styles to the target
   * @private
   * @jsxobf-clobber
   */
  Matrix.convertXMLToDOM = function(objEntity,objDOM,bBox) {
    var names = objEntity.getAttributeNames();
    var re = /^(on(?:mousedown|click|focus|blur|mouseup|mouseover|mouseout|dblclick|scroll|keydown|keypress))/i;
    var re_style = /(?:border:|border-top|border-left|border-bottom|border-right|padding|height|width|background-color)[^;]*;/gi;
    for (var i = 0; i < names.length; i++) {
      var strName = names[i];
      var strValue = objEntity.getAttribute(strName);

      //note that these are not all events, but rather those events that are/may be implemented by the matrix control
      if (strName.match(re)) {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
          html.addEventListener(objDOM, strName.toLowerCase(), strValue);
/* @JSC */ } else {
          objDOM.setAttribute(strName.toLowerCase(), strValue);
/* @JSC */ }
      } else if (strName == "class") {
        objDOM.className = strValue;
      } else if (strName == "style") {
        jsx3.gui.Painted.convertStyleToStyles(objDOM, bBox ? strValue : strValue.replace(re_style,""));
      } else {
        objDOM.setAttribute(strName,strValue);
      }
    }
  };

// ***********************************************+
// ***************** IDE RELATED *****************|
// ***********************************************+

  /**
   * Sets the value of this matrix. Deselects all existing selections. Scrolls the first record into view.
   * @param strId {String | Array<String>} jsxid attribute for the CDF record(s) to select
   * @return {jsx3.gui.Matrix}  this object.
   */
  Matrix_prototype.setValue = function(strId) {
    this.deselectAllRecords();
    if(strId) {
      if (jsx3.$A.is(strId)) {
        if (this.getSelectionModel() != Matrix.SELECTION_MULTI_ROW && strId.length > 1)
          throw new jsx3.IllegalArgumentException("strId", strId);
      } else {
        strId = [strId];
      }

      for(var i=0;i<strId.length;i++)
        this.selectRecord(strId[i]);
      this.revealRecord(strId[0]);
    } else {
      //make sure the scroller is synchronized with the content;set to top
      this.synchronizeVScroller();
      this.setScrollTop(0);
    }
    return this;
  };


  /**
   * Returns rules for the focus rectangle/bounding box. Used by Builder
   * @return {Object<String, boolean>} JavaScript object with named properties: NN, SS, EE, WW, MM
   * @package
   */
  Matrix_prototype.getMaskProperties = function() {
    return Block.MASK_NO_EDIT;
  };

});

/**
 * A class that defines the methods required for an object to be used by <code>jsx3.gui.Matrix.Column</code> instances to
 * format cells of data.
 *
 * @since 3.2
 */
jsx3.Class.defineClass("jsx3.gui.Matrix.ColumnFormat", null, null, function(ColumnFormat, ColumnFormat_prototype) {

  var Matrix = jsx3.gui.Matrix;

  /** @private @jsxobf-clobber */
  ColumnFormat._DATETIME_TYPES = {medium:2, full:4};
  ColumnFormat._DATETIME_TYPES["short"] = 1;
  ColumnFormat._DATETIME_TYPES["long"] = 3;

  /** @private @jsxobf-clobber */
  ColumnFormat._NUMBER_TYPES = {integer:1, percent:1, currency:1};
  /** @private @jsxobf-clobber */
  ColumnFormat._FORMAT_LOOKUP = {unescape:"_formatUnescape", unescape_all:"_formatUnescapeIf", lookup:"_formatLookup"};

  /**
   * Returns a column formatter for a string key. The key may be one of the following:
   * <ul>
   * <li><code>@unescape</code> &#8211; </li>
   * <li><code>@unescape_all</code> &#8211; </li>
   * <li><code>@lookup</code> &#8211; </li>
   * <li><code>@datetime[,(short|medium|long|full,<i>format</i>)]</code> &#8211; </li>
   * <li><code>@date[,(short|medium|long|full,<i>format</i>)]</code> &#8211; </li>
   * <li><code>@time[,(short|medium|long|full,<i>format</i>)]</code> &#8211; </li>
   * <li><code>@number[,(integer|percent|currency,<i>format</i>)]</code> &#8211; </li>
   * <li><code>@message,<i>format</i></code> &#8211; </li>
   * </ul>
   * @param strKey {String}
   * @param objColumn {jsx3.gui.Matrix.Column}
   * @return {jsx3.gui.Matrix.ColumnFormat}
   */
  ColumnFormat.getInstance = function(strKey, objColumn) {
    var cf = null;

    var formatFnctName = null;
    if (strKey.charAt(0) == "@" && (formatFnctName = ColumnFormat._FORMAT_LOOKUP[strKey.substring(1)]) != null) {
      cf = new ColumnFormat();
      cf.format = ColumnFormat[formatFnctName];
    } else if (strKey.match(/^@(datetime|date|time|number)\b/)) {
      cf = new Matrix.MessageFormat(objColumn, "{0," + strKey.substring(1) + "}");
    } else if (strKey.indexOf("@message") == 0) {
      cf = new Matrix.MessageFormat(objColumn, strKey.substring(9));
    }

    return cf;
  };

  ColumnFormat_prototype.init = function() {
  };

  /**
   * Classes that implement this interface must provide this method to allow for browser-specific or similar type 'switch'. If
   * false is returned, the formatter will not even attempt to iterate
   * @return {Boolean} true if the formatter should be called to iterate and format
   */
  ColumnFormat_prototype.validate = function() {
    return true;
  };

  /**
   * Formats the Matrix cell, a native DIV element.
   * @param objDiv {HTMLElement} on-screen DIV element to be formatted. Note that this DIV is contained within a TD
   * @param strCDFKey {String} CDF record id for the record in the data model bound to the affected on-screen row
   * @param objMatrix {jsx3.gui.Matrix} matrix instance
   * @param objMatrixColumn {jsx3.gui.Matrix.Column} matrix column instance
   * @param intRowNumber {int} row number for row containing this cell (1-based)
   * @param objServer {jsx3.app.Server} server instance. Useful for querying locale (for localized output)
   */
  ColumnFormat_prototype.format = jsx3.Method.newAbstract(
      'objDiv', 'strCDFKey', 'objMatrix', 'objMatrixColumn', 'intRowNumber','objServer');

  /** @private @jsxobf-clobber */
  ColumnFormat._formatUnescape = function(objDiv, strCDFKey, objMatrix, objMatrixColumn, intRowNumber, objServer) {
    ColumnFormat._formatUnescapeIf(objDiv, strCDFKey, objMatrix, objMatrixColumn, intRowNumber, objServer,
        jsx3.xml.Template.supports(jsx3.xml.Template.DISABLE_OUTPUT_ESCAPING));
  };

  /** @private @jsxobf-clobber */
  ColumnFormat._formatUnescapeIf = function(objDiv, strCDFKey, objMatrix, objMatrixColumn, intRowNumber, objServer, bSkip) {
    if (!bSkip)
      objDiv.innerHTML = objDiv.innerHTML.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  };

  /** @private @jsxobf-clobber */
  ColumnFormat._formatLookup = function(objDiv, strCDFKey, objMatrix, objMatrixColumn, intRowNumber, objServer) {
    var objMask = objMatrixColumn.getEditMask();
    //use the actual Form child belonging to the mask to resolve the lookup
    if(objMask && objMask._emGetFormElm)
      objMask = objMask._emGetFormElm();
    if (objMask != null && typeof(objMask.getRecordNode) == "function") {
      var objNode = objMatrix.getRecordNode(strCDFKey);
      if (objNode) {
        var strValue = objMatrixColumn.getValueForRecord(strCDFKey);
        var lookupNode = objMask.getRecordNode(strValue);
        objDiv.innerHTML = jsx3.util.strEscapeHTML(
            lookupNode ? objMatrix._cdfav(lookupNode, "text") : (strValue != null ? strValue : ""));
      }
    }
  };

});

/**
 * @private
 */
jsx3.Class.defineClass("jsx3.gui.Matrix.MessageFormat", jsx3.gui.Matrix.ColumnFormat, null,
        function(MessageFormat, MessageFormat_prototype) {

  MessageFormat_prototype.init = function(objColumn, strFormat) {
    /* @jsxobf-clobber */
    this._format = new jsx3.util.MessageFormat(strFormat, objColumn.getServer().getLocale());
  };

  MessageFormat_prototype.format = function(objDiv, strCDFKey, objMatrix, objMatrixColumn, intRowNumber, objServer) {
    //var objNode = objMatrix.getRecordNode(strCDFKey);
    var strValue = objMatrixColumn.getValueForRecord(strCDFKey);

    if (strValue) {
      try {
        var loc = objServer.getLocale(); // setLocale should publish locale change event.
        if (loc != this._format._locale) // Need to pick up new locale if it changed since this instance was created.
          this._format.setLocale(loc);
          
        try { strValue = this._format.format(strValue); } catch (e) {}

        objDiv.innerHTML = strValue;
      } catch (e) {
        jsx3.util.Logger.GLOBAL.error(this._format, jsx3.NativeError.wrap(e));
      }
    }
  };
});

/**
 * The interface defining the methods that affect the behavior of an object used as an edit mask in a matrix column.
 * <p/>
 * If an object is placed in the DOM as a child of a matrix column, it will be used as an edit mask. Any methods
 * in this interface that the object does not implement will be inserted into the object. This interface is a "loose"
 * interface because the class of an edit mask does not need to implement it in its class declaration. The class
 * simply needs to define any methods whose default behavior it wishes to override.
 * <p/>
 * Any edit mask that implements the <code>jsx3.gui.Form</code> interface will have the methods in this interface
 * inserted into it. If the edit mask does not implement <code>jsx3.gui.Form</code> but extends
 * <code>jsx3.gui.Block</code>, the methods in the <code>jsx3.gui.Matrix.BlockMask</code> interface are inserted
 * instead.
 *
 * @see jsx3.gui.Matrix.BlockMask
 * @since 3.2
 */
jsx3.Class.defineInterface("jsx3.gui.Matrix.EditMask", null, function(EditMask, EditMask_prototype) {

  var Matrix = jsx3.gui.Matrix;

  /**
   * @package
   */
  EditMask.NORMAL = 1;

  /**
   * @package
   */
  EditMask.FORMAT = 2;

  /**
   * @package
   */
  EditMask.DIALOG = 3;

  /**
   * This method is called once when the edit mask is discovered by the matrix column to give it an opportunity
   * to initialize itself.
   * @param objColumn {jsx3.gui.Matrix.Column} the matrix column parent.
   */
  EditMask_prototype.emInit = function(objColumn) {};

  /**
   * @package
   */
  EditMask_prototype.emGetType = function() {
    return EditMask.NORMAL;
  };

  /**
   * @package
   */
  EditMask_prototype.emPaintTemplate = function() { return this.paint(); };

  /** @private @jsxobf-clobber */
  EditMask_prototype._emBeginEdit = function(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD) {
    /* @jsxobf-clobber */
    this._jsxmaskeditsession = {matrix:objMatrix, column:objColumn, recordId:strRecordId, td:objTD, value:strValue};
    var ok = this.emBeginEdit(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD) !== false;

    // A new event that allows the test recorder to re-populate emGetSession(). When emGetSession() returns a defined
    // value, custom events on the edit mask have a better chance of working correctly.
    if (ok)
      this.doEvent("jsxbeginmask", {objMATRIX:objMatrix, objCOLUMN:objColumn, strRECORDID:strRecordId,
          strVALUE:strValue, _gipp:1});

    return ok;
  };

  /**
   * Used by GIPP and GITAK to replay the <code>jsxbeginmask</code> event.
   * @package
   */
  EditMask_prototype.replayMask = function(evt) {
    this._jsxmaskeditsession = {matrix:evt.objMATRIX, column:evt.objCOLUMN, recordId:evt.strRECORDID, td:null, value:evt.strVALUE};
  };

  /**
   * Called whenever an edit session begins.
   * @param strValue {String}
   * @param objTdDim {Object<String,int>}
   * @param objPaneDim {Object<String,int>}
   * @param objMatrix {jsx3.gui.Matrix}
   * @param objColumn {jsx3.gui.Matrix.Column}
   * @param strRecordId {String}
   * @param objTD {HTMLElement}
   * @return {boolean} <code>false</code> to cancel the edit session.
   */
  EditMask_prototype.emBeginEdit = function(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD) {};

  /** @private @jsxobf-clobber */
  EditMask_prototype._emEndEdit = function() {
    var val = this.emEndEdit();
    delete this._jsxmaskeditsession;
    return val;
  };

  /**
   * Called when the current edit session ends. This method should return the edited value.
   * @return {String} the edited value.
   */
  EditMask_prototype.emEndEdit = function() { return this.emGetValue(); };

  /**
   * Returns the current value stored in the edit mask.
   * @return {String} the current value of the edit mask.
   */
  EditMask_prototype.emGetValue = function() { return null; };

  /**
   * Suspends an edit session so that if this mask loses focus, the edit session does not close.
   * @final
   */
  EditMask_prototype.suspendEditSession = function() {
    /* @jsxobf-clobber */
    this.getAncestorOfType(Matrix)._jsxeditsession._suspended = true;
  };

  /**
   * Resumes an edit session so that the edit session will close the next time this mask loses focus.
   * @final
   */
  EditMask_prototype.resumeEditSession = function() {
    this.getAncestorOfType(Matrix)._jsxeditsession._suspended = false;
  };

  /**
   * Returns the state of the current edit session if this object is involved in a <code>jsx3.gui.Matrix</code>
   * edit mask session. The state has the following keys:
   * <ul>
   * <li>matrix {jsx3.gui.Matrix}</li>
   * <li>column {jsx3.gui.Matrix.Column}</li>
   * <li>recordId {String}</li>
   * <li>td {HTMLElement}</li>
   * <li>value {String} may be <code>null</code></li>
   * </ul>
   *
   * @return {Object<String,Object>} the edit session.
   * @final
   */
  EditMask_prototype.emGetSession = function() {
    return this._jsxmaskeditsession;
  };

  /**
   * Commits the current edit session of this edit mask.
   * @param objEvent {jsx3.gui.Event} the wrapped browser event that logically caused this commit to occur. If this
   *    parameter is provided then all the model events related to committing an edit session are triggered.
   * @param bKeepOpen {boolean} if <code>true</code> then the current value of this edit mask is committed without
   *    closing the current edit session.
   */
  EditMask_prototype.commitEditMask = function(objEvent, bKeepOpen) {
    if (this._jsxmaskeditsession)
      this._jsxmaskeditsession.matrix._cleanUpEditSession(objEvent, bKeepOpen);
  };

  EditMask_prototype.emCollapseEdit = function(objEvent) {};

});

/**
 * The interface that defines the methods that affect the behavior of a composite object used as an edit mask of a
 * matrix column. Any object used as an edit mask that extends <code>jsx3.gui.Block</code> but does not implement
 * <code>jsx3.gui.Form</code> will have these methods inserted into it. Such an object only has to define the methods
 * whose default behavior it wishes to override.
 *
 * @since 3.2
 */
jsx3.Class.defineInterface("jsx3.gui.Matrix.BlockMask", jsx3.gui.Matrix.EditMask, function(BlockMask, BlockMask_prototype) {

  var Matrix = jsx3.gui.Matrix;
  var Block = jsx3.gui.Block;
  var html = jsx3.html;

  /**
   * @final
   */
  BlockMask_prototype.emInit = function(objColumn) {
    this.setDisplay(Block.DISPLAYNONE,true);
    this.setDimensions(0,0,null,null,true);
    this.setRelativePosition(Block.ABSOLUTE,true);

    /* @jsxobf-clobber */
    this._jsxformemwidth = this.getWidth();
    /* @jsxobf-clobber */
    this._jsxformemheight = this.getHeight();

    var formElm = this._emGetFormElm();
    if (formElm) {
      var bRel = formElm.getRelativePosition();
      var strDisp = formElm.getDisplay();
      Matrix._initEditMask(formElm, objColumn);
      formElm.setRelativePosition(bRel, true);
      formElm.setDisplay(strDisp, true);
    }
  };

  BlockMask_prototype.emGetType = function() {
    return Matrix.EditMask.NORMAL;
  };

  /**
   * @final
   */
  BlockMask_prototype.emBeginEdit = function(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD) {
    var width = isNaN(this._jsxformemwidth) ? objTdDim.W : parseInt(this._jsxformemwidth);
    var height = isNaN(this._jsxformemheight) ? objTdDim.H : parseInt(this._jsxformemheight);

    this.setMaskValue(strValue);
    this.setDimensions(objTdDim.L, objTdDim.T, width, height, true);
    this.setDisplay(Block.DISPLAYBLOCK, true);

    var firstResponder = this.getMaskFirstResponder() || this;
    html.focus(firstResponder);
  };

  /**
   * @final
   */
  BlockMask_prototype.emGetValue = function() {
    return this.getMaskValue();
  };

  /**
   * Returns the DOM node that should be focused when the edit session begins. The default behavior is to return
   * the first descendant (breadth-first) that implements <code>jsx3.gui.Form</code>.
   * @return {jsx3.gui.Painted}
   */
  BlockMask_prototype.getMaskFirstResponder = function() {
    return this._emGetFormElm();
  };

  /**
   * Returns the value currently stored in this edit mask. The default behavior is to return the value of
   * the first descendant (breadth-first) that implements <code>jsx3.gui.Form</code>.
   * @return {String}
   */
  BlockMask_prototype.getMaskValue = function() {
    var form = this._emGetFormElm();
    return form != null ? form.getValue() : null;
  };

  /**
   * Sets the value currently stored in this edit mask. The default behavior is to set the value of
   * the first descendant (breadth-first) that implements <code>jsx3.gui.Form</code>.
   * @param strValue {String}
   */
  BlockMask_prototype.setMaskValue = function(strValue) {
    var form = this._emGetFormElm();
    if (form != null) form.setValue(strValue);
  };

  /** @private @jsxobf-clobber */
  BlockMask_prototype._emGetFormElm = function() {
    return this.getDescendantsOfType(jsx3.gui.Form)[0];
  };

  /**
   * @final
   */
  BlockMask_prototype.emEndEdit = function() {
    var value = this.getMaskValue();
    this.setDisplay(Block.DISPLAYNONE, true);
    return value;
  };

});

/**
 * An extension of the edit mask mix-in for block that accommadates a composite objects whose root node is a dialog.
 * @package
 */
jsx3.Class.defineInterface("jsx3.gui.Matrix.DialogMask", jsx3.gui.Matrix.BlockMask,
    function(DialogMask, DialogMask_prototype) {

  var Matrix = jsx3.gui.Matrix;
  var html = jsx3.html;

  DialogMask_prototype.emInit = function(objColumn) {
    Matrix.BlockMask.prototype.emInit.call(this, objColumn);

    var parent = this.getParent();
    while (parent != null) {
      // 1. hot keys register with an ancestor Window
      if (jsx3.gui.Window && parent instanceof jsx3.gui.Window) {
        parent = parent.getRootBlock();
        break;
      } else if (jsx3.gui.Dialog && parent instanceof jsx3.gui.Dialog) {
        break;
      }
      parent = parent.getParent();
    }

    if (parent == null)
      parent = this.getServer().getRootBlock();

    parent.paintChild(this);
  };

  DialogMask_prototype.emGetType = function() {
    return Matrix.EditMask.DIALOG;
  };

  DialogMask_prototype.emBeginEdit = function(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD) {
    this._jsxmaskeditsession = {matrix:objMatrix, column:objColumn, recordId:strRecordId, td:objTD};

    var containerDiv = this.getRendered(objTD).parentNode.parentNode;
    var panePos = html.getRelativePosition(containerDiv, containerDiv);
    var offsetPos = html.getRelativePosition(containerDiv, objTD);

    var width = this._jsxformemwidth;
    var height = this._jsxformemheight;

    var spaceHor = [panePos.W - offsetPos.L - objTdDim.W, offsetPos.L, objTdDim.W];
    var horWinner = -1;
    for (var i = 0; i < spaceHor.length && horWinner < 0; i++) {
      if (width <= spaceHor[i])
        horWinner = i;
    }
    if (horWinner < 0) {
      OUTER: for (var i = 0; i < spaceHor.length && horWinner < 0; i++) {
        for (var j = 0; j < spaceHor.length; j++) {
          if (spaceHor[i] < spaceHor[j]) continue OUTER;
        }
        horWinner = i;
      }
    }

    var bCenter = horWinner == 2;
    var spaceVer = [panePos.H - offsetPos.T - (bCenter ? objTdDim.H : 0), offsetPos.T + (bCenter ? 0 : objTdDim.H)];
    var verWinner = -1;
    for (var i = 0; i < spaceVer.length && verWinner < 0; i++) {
      if (height <= spaceVer[i])
        verWinner = i;
    }
    if (verWinner < 0) {
      OUTER: for (var i = 0; i < spaceVer.length && verWinner < 0; i++) {
        for (var j = 0; j < spaceVer.length; j++) {
          if (spaceVer[i] < spaceVer[j]) continue OUTER;
        }
        verWinner = i;
      }
    }

    width = Math.min(width, spaceHor[horWinner]);
    height = Math.min(height, spaceVer[verWinner]);
    var left = ([offsetPos.L + objTdDim.W, offsetPos.L - width, offsetPos.L])[horWinner];
    var top = ([offsetPos.T + (bCenter ? objTdDim.H : 0), offsetPos.T - height + (bCenter ? 0 : objTdDim.H)])[verWinner];

    this.setMaskValue(strValue);
    this.setDimensions(left, top, width, height, true);
    this.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
    html.updateCSSOpacity(this.getRendered(), 0.90);

    var firstResponder = this.getMaskFirstResponder() || this;
    html.focus(firstResponder);
  };

  DialogMask_prototype._emGetFormElm = function() {
    var content = (this.getChild(0) == this.getCaptionBar()) ?
        this.getChild(1) : this.getChild(0);
    return content != null ? content.getDescendantsOfType(jsx3.gui.Form)[0] : null;
  };

  DialogMask_prototype.emCollapseEdit = function(objEvent) {
    this.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
  };

  /** @jsxobf-clobber-shared */
  DialogMask_prototype.repaintTaskBar = function() {};

});
