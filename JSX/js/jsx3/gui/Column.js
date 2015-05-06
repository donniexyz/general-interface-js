/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/* @JSC :: begin DEP */

jsx3.require("jsx3.gui.Block");

// @jsxobf-clobber-shared  doResizeBegin doReorderBegin doCheckSort getDisplayedChildren
/**
 * Provides a way to generate a column of data for a <code>jsx3.gui.List</code> instance (or compatible subclass).
 * It allows the developer to specify custom XSLT for more-complex output, custom edit masks for editable grids, sort
 * types and sort paths and other series-related activities.
 *
 * @deprecated  Use <code>jsx3.gui.Matrix.Column</code> instead.
 * @see jsx3.gui.Matrix.Column
 */
jsx3.Class.defineClass("jsx3.gui.Column", jsx3.gui.Block, null, function(Column, Column_prototype) {

  /**
   * {int} 100
   */
  Column.DEFAULTWIDTH = 100;

  /**
   * {String} jsx30column_c1
   */
  Column.DEFAULTCELLCLASSLIST = "jsx30column_c1";

  /**
   * {String} jsx30column_c3
   */
  Column.DEFAULTCELLCLASSGRID = "jsx30column_c3";

  /**
   * {String} text (default)
   * @final @jsxobf-final
   */
  Column.TYPETEXT = "text";

  /**
   * {String} number
   * @final @jsxobf-final
   */
  Column.TYPENUMBER = "number";

  /**
   * {int} 0
   * @final @jsxobf-final
   */
  Column.FIXED = 0;

  /**
   * @deprecated  Renamed to RESIZABLE.
   */
  Column.RESIZEABLE = 1;

  /**
   * {int} 1 (default)
   * @final @jsxobf-final
   */
  Column.RESIZABLE = 1;

  /**
   * {String} JSX/images/tab/bevel.gif
   * @private
   * @jsxobf-clobber
   */
  Column.DEFAULT_XSL = '<xsl:choose><xsl:when test="@path@ and not(@path@=\'\')"><xsl:value-of select="@path@"/></xsl:when><xsl:otherwise>&#160;</xsl:otherwise></xsl:choose>';

  /**
   * {String} JSX/images/list/sort_asc.gif
   * @private
   * @jsxobf-clobber
   */
  Column.IMG_ASCENDING = jsx3.resolveURI("jsx:///images/list/sort_asc.gif");

  /**
   * {String} JSX/images/list/sort_desc.gif
   * @private
   * @jsxobf-clobber
   */
  Column.IMG_DESCENDING = jsx3.resolveURI("jsx:///images/list/sort_desc.gif");

  /* @JSC */ if (jsx3.CLASS_LOADER.IE6) {
        jsx3.html.loadImages(Column.IMG_ASCENDING, Column.IMG_DESCENDING);
  /* @JSC */  }

  /** @private @jsxobf-clobber */
  Column.DEFAULTTEXT = "&#160;";

  /**
   * {String} top (default)
   */
  Column.VALIGNTOP = "top";

  /**
   * {String} middle
   */
  Column.VALIGNMIDDLE = "middle";

  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param strText {String} label to appear in column header; can be valid DHTML
   * @param intWidth {int} width (in pixels) of the object;
   * @param strPath {String} the selection path for this column of data. Typically this is simply the name of the attribute preceded by '@' (i.e., @jsxtext, @social, @phone, etc);
   */
  Column_prototype.init = function(strName,strText,intWidth,strPath) {
    //call constructor for super class
    this.jsxsuper(strName,null,null,intWidth,null,strText);

    //if a path was supplied; set it
    if (strPath != null) this.setPath(strPath);
  };

  /**
   * is called when an item is about to be set; returns false if the parent is not of the appropriate type; in this case, the parent must be a jsx3.gui.List or derivative class
   * @return {boolean} true to allow the set, false to veto
   * @package
   */
  Column_prototype.onSetParent = function(objParent) {
    return jsx3.gui.List && objParent instanceof jsx3.gui.List;
  };

  /**
   * Returns the data type for this column of data (affects sorting if this column is used for sorting the data); valid types include: jsx3.gui.Column.TYPETEXT and jsx3.gui.Column.TYPENUMBER
   * @return {String} data type for this column's data
   */
  Column_prototype.getDataType = function() {
    return (this.jsxdatatype == null) ? Column.TYPETEXT : this.jsxdatatype;
  };

  /**
   * Sets the data type for this column of data (affects sorting if this column is used for sorting the data); returns ref to self
   * @param DATATYPE {String} data type for this column's data; ; valid types include: jsx3.gui.Column.TYPETEXT and jsx3.gui.Column.TYPENUMBER
   * @return {jsx3.gui.Column} this object
   */
  Column_prototype.setDataType = function(DATATYPE) {
    this.jsxdatatype = DATATYPE;
    return this;
  };

  /**
   * Returns name of JSX GUI object to use as the edit mask
   * @return {String} name of the control
   */
  Column_prototype.getEditMask = function() {
    return (this.jsxmask == null) ? null : this.jsxmask;
  };

  /**
   * Sets name of JSX GUI object to use as the edit mask; can also can be the system-generated id assigned at object initialization; returns ref to self
   * @param strJSXName {String} JSX name property for the control to use as the edit/input mask; also can be the system-generated id assigned at object initialization
   * @return {jsx3.gui.Column} this object
   */
  Column_prototype.setEditMask = function(strJSXName) {
    this.jsxmask = strJSXName;
    return this;
  };

  /**
   * Returns flag (jsx3.gui.Column.RESIZABLE or jsx3.gui.Column.FIXED) denoting whether or not the given column can be resized. Default: jsx3.gui.Column.RESIZABLE
   * @return {int}
   */
  Column_prototype.getResizable = function() {
    return (this.jsxresize == null) ? jsx3.Boolean.TRUE : this.jsxresize;
  };

  /**
   * Sets flag (jsx3.gui.Column.RESIZABLE or jsx3.gui.Column.FIXED) denoting whether or not the given column can be resized. Default: jsx3.gui.Column.RESIZABLE
   * @param RESIZE {int} one of: jsx3.gui.Column.RESIZABLE or jsx3.gui.Column.FIXED
   * @return {jsx3.gui.Column} this object
   */
  Column_prototype.setResizable = function(RESIZE) {
    this.jsxresize = RESIZE;
    return this;
  };

  /**
   * Returns the selection path for this column of data. Typically this is simply the name of the attribute preceded by '@' (i.e., @jsxtext, @social, @phone, etc); returns '@jsxid' if no path specified
   * @return {String} selection path (xpath / xsl query)
   */
  Column_prototype.getPath = function() {
    return (this.jsxpath == null) ? "@jsxid" : this.jsxpath;
  };

  /**
   * Sets the selection path for this column of data. Typically this is simply the name of the attribute preceded by '@' (i.e., @jsxtext, @social, @phone, etc);
   *            returns a ref to self;
   * @param strPath {String} selection path (xpath / xsl query)
   * @return {jsx3.gui.Column} this object
   */
  Column_prototype.setPath = function(strPath) {
    this.jsxpath = strPath;
    return this;
  };

  /**
   * Returns the selection path to use to sort this column. If the sort path has not been set explicitly, this method
   * returns the value of <code>this.getPath()</code>.
   * @return {String}
   * @see #getPath()
   */
  Column_prototype.getSortPath = function() {
    return this.jsxsortpath != null ? this.jsxsortpath : this.getPath();
  };

  /**
   * Sets the selection path to use to sort this column. By setting the sort path property, a column may cause its
   * list to be sorted according to data that is not necessarily the string displayed in the column.
   * @param strPath {String}
   * @return {jsx3.gui.Column}
   */
  Column_prototype.setSortPath = function(strPath) {
    this.jsxsortpath = strPath;
    return this;
  };

  /**
   * Gets whether or not the header cell for this column should wrap its text when the column is too narrow to display truncate with an ellipsis. Default: jsx3.Boolean.FALSE
   * @return {int} one of: jsx3.Boolean.TRUE or jsx3.Boolean.FALSE
   */
  Column_prototype.getWrap = function() {
    return (this.jsxwrap == null) ? jsx3.Boolean.FALSE : this.jsxwrap;
  };

  /**
   * Sets whether or not the header cell for this column should wrap its text when the column is too narrow to display truncate with an ellipsis.
   * @param WRAP {int} one of: jsx3.Boolean.TRUE or jsx3.Boolean.FALSE
   * @return {jsx3.gui.Column} this object
   */
  Column_prototype.setWrap = function(WRAP) {
    this.jsxwrap = WRAP;
    return this;
  };

  /**
   * Gets the vertical alignment for the header cell text. Default: jsx3.gui.Column.VALIGNTOP;
   * @return {String} one of: jsx3.gui.Column.VALIGNTOP  or jsx3.gui.Column.VALIGNMIDDLE
   */
  Column_prototype.getVAlign = function() {
    return (this.jsxvalign == null) ? Column.VALIGNTOP : this.jsxvalign;
  };

  /**
   * Sets the vertical alignment for the header cell text. This does not affect the vertical alignment for the data rows.
   * @param VALIGN {String} one of: jsx3.gui.Column.VALIGNTOP or jsx3.gui.Column.VALIGNMIDDLE
   * @return {jsx3.gui.Column} this object
   */
  Column_prototype.setVAlign = function(VALIGN) {
    this.jsxvalign = VALIGN;
    return this;
  };

  /**
   * override
   * @private
   */
  Column_prototype.updateBoxProfile = function() {};


  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @param-private bBufferColumn {boolean} false if null; if true, the default xsl template for a buffer column cell is returned
   * @param-private SORT_DIRECTION {String} one of: jsx3.gui.List.SORTASCENDING or jsx3.gui.List.SORTDESCENDING
   * @return {String} DHTML
   */
  Column_prototype.paint = function(bBufferColumn, SORT_DIRECTION) {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //initialize variables
    var objParent = this.getParent();
    var strAnchor = "";

    //first columns don't get a resize anchor and have a 4 pixel pad to take the place of the anchor
    if (objParent.getResizable()) {
      var vChildren = objParent.getDisplayedChildren();
      var intIndex = vChildren.indexOf(this);
      if (((intIndex != 0) && vChildren[intIndex-1].getResizable()) ||
          (bBufferColumn && vChildren[vChildren.length-1].getResizable()))
        strAnchor = '<span ' + objParent.renderHandler(jsx3.gui.Event.MOUSEDOWN, "doResizeBegin") + ' style="" class="jsx30column_anchor">&#160;</span>';
    }

    // build out the header cell HTML
    if (bBufferColumn) {
      //don't use most of the style information in the buffer column (really just a space-holder)
      return '<td ' + jsx3.html._UNSEL + ' class="jsx30column_cell" style="position:relative;padding:0px;" width="*" ' + '><div style="white-space:nowrap;position:relative;height:100%;width:100%;padding:0px;">' + strAnchor + '&#160;</div></td>';
    } else {
      // always allow menu event
      var strReorder = this.renderHandler(jsx3.gui.Event.MOUSEUP, "_ebMouseUp", 0);
      if (objParent.getCanReorder())
        strReorder += objParent.renderHandler(jsx3.gui.Event.MOUSEDOWN, "doReorderBegin");
      else if (objParent.getCanSort() != 0 && this.getCanSort() != 0)
        strReorder += objParent.renderHandler(jsx3.gui.Event.CLICK, "doCheckSort");

      var strImg = (SORT_DIRECTION == null) ? '' : 'background-image:url(' + (SORT_DIRECTION == jsx3.gui.List.SORTASCENDING ? Column.IMG_ASCENDING : Column.IMG_DESCENDING) + ');background-repeat:no-repeat;background-position:99% center;';
      var strCSSWrap = (this.getWrap()) ? "" : "overflow-x:hidden;white-space:nowrap;text-overflow:ellipsis;";
      var strCSSVAlign = (this.getVAlign() == Column.VALIGNTOP) ? objParent.paintHeaderHeight() : "";
      return '<td cellindex="'+this.getChildIndex()+'" id="' + this.getId() + '"' + jsx3.html._UNSEL + strReorder + this.paintWidth() +
          ' class="jsx30column_cell" style="padding-left:0px;position:relative;' + this.paintCursor(bBufferColumn) +
          this.paintBackgroundColor() + this.paintColor() + this.paintFontName() + this.paintFontWeight() +
          this.paintTextAlign() + this.paintCSSWidth() + this.paintFontSize() + strImg + this.paintCSSOverride() + '" ' +
          this.paintTip() + this.paintLabel() + '><div style="' + strCSSVAlign + strCSSWrap +
          'position:relative;height:100%;width:100%;padding-left:4px;vertical-align:middle;">' + strAnchor + '<div>' +
          this.paintText() + '</div>' + '</div></td>';
    }
  };

  /**
   * updates the on-screen VIEW for the object. repaints both the head and body for the list/grid containing the column (colunns are composed of HTML TD elements that cannot be repainted individually)
   * @return {String} DHTML
   */
  Column_prototype.repaint = function() {
    this.getParent().resetXslCacheData();
    this.getParent().repaintHead();
    this.getParent().repaintBody();
  };

  /**
   * renders valid CSS property value, (e.g., default,wait,col-resize); if no value or an empty string, null is returned
   * @param bBufferColumn {boolean} false if null; if true, the default xsl template for a buffer column cell is returned
   * @return {String} valid CSS property value, (e.g., default,wait,col-resize)
   * @private
   */
  Column_prototype.paintCursor = function(bBufferColumn) {
    return (!this.getCursor() || bBufferColumn) ? "cursor:default;" : "cursor:" + this.getCursor() + ";";
  };

  /**
   * renders the text/HTML for the control to be displayed on-screen; returns an empty string if null; since the text is rendered on-screen as browser-native HTML, the equivalent of an empty tag (e.g., <span\>) would be an enclosing tag with an empty string (no content): <span></span>.  To return null would be equivalent to <span>null</span>, which is not the same as <span\>
   * @return {String}
   * @private
   */
  Column_prototype.paintText = function() {
    return (this.getText()) ? this.getText() : Column.DEFAULTTEXT;
  };

  /**
   * called by the paint method for a given class; determines how to generate the given CSS property
   * @param bBufferColumn {boolean} false if null; if true, the default xsl template for a buffer column cell is returned
   * @return {String} combined CSS property (i.e., width:2px;  or  width:25%;)
   * @private
   */
  Column_prototype.paintWidth = function(bBufferColumn) {
    if (bBufferColumn) return ' width="*"';
    return ' width="' + ((this.getWidth()) ? this.getWidth() : Column.DEFAULTWIDTH) + '"';
  };

  /**
   * called by the paint method for a given class; determines how to generate the given CSS property
   * @param bBufferColumn {boolean} false if null; if true, the default xsl template for a buffer column cell is returned
   * @return {String} combined CSS property (i.e., width:2px;  or  width:25%;)
   * @private
   */
  Column_prototype.paintCSSWidth = function(bBufferColumn) {
    if(bBufferColumn) return '';
    var myWidth = ((this.getWidth()) ? this.getWidth() : Column.DEFAULTWIDTH);
    if(!isNaN(myWidth)) myWidth += "px";
    return 'width:' + myWidth + ";";
  };

  /**
   * Returns the css class name (CSS property name without the leading ".")
   * @return {String}
   * @private
   */
  Column_prototype.paintClassName = function() {
    return this.getClassName() ? this.getClassName() :
           ((jsx3.gui.Grid && this.getParent() instanceof jsx3.gui.Grid) ? Column.DEFAULTCELLCLASSGRID : Column.DEFAULTCELLCLASSLIST);
  };

  /**
   * Returns XSLT fragment for any custom template to render the cells for this column.
   * @return {String} valid XSLT document fragment to be inserted into the overall XSLT document for the list/grid parent
   */
  Column_prototype.getXSLString = function(strXSL) {
    return this.jsxxsl;
  };

  /**
   * binds an XSL document fragment (as string) as a property on the object, so that when the object is serialized
   *            the XSL is contained within.  When this object is live, the XSL will be parsed and used to generate the on-screen VIEW for the object
   * @param strXSL {String} if null or empty string is passed, any existing value is removed. Otherwise, must be XSLT fragment that will generate the content for a given TD (cell)
   * @return {jsx3.gui.Column} this object
   */
  Column_prototype.setXSLString = function(strXSL) {
    if (jsx3.util.strEmpty(strXSL)) {
      delete this.jsxxsl;
    } else {
      this.jsxxsl = strXSL;
    }
    return this;
  };

  /**
   * Returns an XSL nodeset (as string). Used by the object to create its on-screen (VIEW) content via an XSL/XSL transformation
   * @param-private bBufferColumn {boolean} false if null; if true, the default xsl template for a buffer column cell is returned
   * @return {String} well-formed XSL document
   * @private
   */
  Column_prototype.paintXSLString = function(bBufferColumn) {
    var valueOf = this.getPath() ? '<xsl:value-of select="' + this.getPath() + '"/>' : "";

    //does the list support wrapping?
    if (this.getParent().getWrap() == jsx3.Boolean.TRUE) {
      var strN1 = "";
      var strN2 = "";
    } else {
      var strN1 = "<nobr>";
      var strN2 = "</nobr>";
    }

    if (bBufferColumn) {
      //use default template for a buffer cell
      return '<td style="position:relative;" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"' + jsx3.html._UNSEL + ' width="*" class="' + this.paintClassName() + '">&#160;</td>';
    } else if (jsx3.gui.Grid && this.getParent() instanceof jsx3.gui.Grid) {
      //PARENT IS A GRID: use configurable template (class/width/text/content)
      var myMask;
      var strEditFlag = ((myMask = this.getEditMask()) == null) ? "" : ' jsxmask="' + myMask + '" ';
      return '<td valign="top" ' + this.getParent().paintIndex() + strEditFlag + this.paintWidth() +
          this.renderHandler(jsx3.gui.Event.FOCUS, "_ebFocus") +
          this.getParent().renderHandler(jsx3.gui.Event.BLUR, "doBlurItem") + ' style="position:relative;' +
          this.paintTextAlign() + ';" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"' + jsx3.html._UNSEL +
          ' class="' + this.paintClassName() + '">' + strN1 + this.getXSLStringVal() + strN2 + '</td>';
    } else {
      //PARENT IS A LIST: use configurable template (class/width/text/content)
      return '<td' + this.paintWidth() + ' style="position:relative;' + this.paintTextAlign() +
          '" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"' + jsx3.html._UNSEL +
          ' class="' + this.paintClassName() + '">' + strN1 +  this.getXSLStringVal() + strN2 + '</td>';
    }
  };

  Column_prototype._ebFocus = function(objEvent, objGUI) {
    this.getParent().doFocusItem(objGUI);
  };

  /**
   * Returns the XSLT fragment returned by getXSLString and replaces the wildcard, @path@, with the path, this.getPath()
   * @return {String} valid XSLT fragment with wildcards replaced
   * @private
   * @jsxobf-clobber
   */
  Column_prototype.getXSLStringVal = function() {
    if (this.getXSLString()) {
      var path = this.getPath();
      if (path)
        return this.getXSLString().doReplace('@path@', path);
      else
        return this.getXSLString();
    } else {
      var path = this.getPath();
      if (path)
        return Column.DEFAULT_XSL.doReplace('@path@', path);
      else
        return "";
    }
  };

  /**
   * Returns whether the parent list/grid can be sorted on this column
   * @return {int} one of: jsx3.Boolean.TRUE or jsx3.Boolean.FALSE
   */
  Column_prototype.getCanSort = function() {
    return (this.jsxsort == null) ? 1 : this.jsxsort;
  };

  /**
   * Sets whether the parnet list/grid can be sorted on this column. Default: jsx3.Boolean.TRUE
   * @param SORT {int} one of: jsx3.Boolean.TRUE or jsx3.Boolean.FALSE
   * @return {jsx3.gui.Column} this object
   */
  Column_prototype.setCanSort = function(SORT) {
   this.jsxsort = SORT;
   return this;
  };

  /**
   * Returns resizeMask property as an object array, defining what actions are available
   *            to the resizeMask for the given control (resize horizontally/vertically; is moveable, etc.)
   * @return {Object<String, boolean>} object array with boolean values for the following properties: NN,SS,EE,WW,MM
   * @private
   */
  Column_prototype.getMaskProperties = function() {
    return jsx3.gui.Block.MASK_NO_EDIT;
  };

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Column.getVersion = function() {
    return "3.0.00";
  };

});

/**
 * @deprecated  Renamed to getResizable.
 * @jsxdoc-definition  Column.prototype.getResizeable = function(){}
 */
jsx3.gui.Column.prototype.getResizeable = jsx3.gui.Column.prototype.getResizable;

/**
 * @deprecated  Renamed to setResizable.
 * @jsxdoc-definition  Column.prototype.setResizeable = function(){}
 */
jsx3.gui.Column.prototype.setResizeable = jsx3.gui.Column.prototype.setResizable;

/**
 * @deprecated  Renamed to jsx3.gui.Column
 * @see jsx3.gui.Column
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Column", -, null, function(){});
 */
jsx3.Column = jsx3.gui.Column;

/* @JSC :: end */
