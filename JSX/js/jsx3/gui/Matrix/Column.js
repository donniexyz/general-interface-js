/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Block");

// @jsxobf-clobber-shared  _getXSL _doStartReorder _reset _getDisplayedChildren _doSort
/**
 * Column control for use as a child of a jsx3.gui.Matrix class
 *
 * @since 3.2
 */
jsx3.Class.defineClass("jsx3.gui.Matrix.Column", jsx3.gui.Block, null, function(Column, Column_prototype) {

  var LOG = jsx3.util.Logger.getLogger(Column.jsxclass.getName());

  //resolve the event to make more concise
  var Event = jsx3.gui.Event;

  /**
   * {int} 100
   */
  Column.DEFAULT_WIDTH = 100;

  /**
   * {String} text (default)
   * @final @jsxobf-final
   */
  Column.TYPE_TEXT = "text";

  /**
   * {String} number
   * @final @jsxobf-final
   */
  Column.TYPE_NUMBER = "number";

  /**
   * {String} top
   * @final @jsxobf-final
   */
  Column.DEFAULT_VALIGN = "top";

  Column.TEMPLATES = {};

  /* can't document this, need to put it somewhere else
   * {String} Default XSLT Template (<code>xsl:template</code>) that outputs the actual cell value/content during a transformation. To override,
   *          call the method, setValueTemplate, passing an alternate XSL Template.
   * <br/>Wildcards are as follows:
   * <ul><li><b>{0}</b> this will be replaced with the result of <code>[instance].getId()</code>. This will be appended with '_value' (i.e., <code>name="{0}_value"</code>) and is required to identify the template</li>
   * <li><b>{1}</b> this will be replaced with the result of <code>[instance].getPath()</code>. For example: @jsxtext. It is not required to include this wildcard in any custom templates</li></ul>
   * @see #setValueTemplate()
   */
  Column.TEMPLATES["default"] =   '<xsl:template xmlns:xsl="http://www.w3.org/1999/XSL/Transform">\n' +
                                        '  <xsl:param name="jsx_row_number"/>\n' +
                                        '  <xsl:if test="@*[name() = $attrcellstyle]">\n' +
                                        '    <xsl:attribute name="style"><xsl:value-of select="@*[name() = $attrcellstyle]"/></xsl:attribute>\n' +
                                        '  </xsl:if>\n' +
                                        '  <xsl:value-of select="{0}"/>&#160;\n' +
                                        '</xsl:template>';
  Column.TEMPLATES["empty"] =     '<xsl:template xmlns:xsl="http://www.w3.org/1999/XSL/Transform"></xsl:template>';
  Column.TEMPLATES["unescape"] =  '<xsl:template xmlns:xsl="http://www.w3.org/1999/XSL/Transform">\n' +
                                        '  <xsl:param name="jsx_row_number"/>\n' +
                                        '  <xsl:if test="@*[name() = $attrcellstyle]">\n' +
                                        '    <xsl:attribute name="style"><xsl:value-of select="@*[name() = $attrcellstyle]"/></xsl:attribute>\n' +
                                        '  </xsl:if>\n' +
                                        '  <xsl:value-of select="{0}" disable-output-escaping="yes"/>&#160;\n' +
                                        '</xsl:template>';
  Column.TEMPLATES["image"] =     '<xsl:template xmlns:xsl="http://www.w3.org/1999/XSL/Transform">\n' +
                                        '  <xsl:if test="@*[name() = $attrcellstyle]">\n' +
                                        '    <xsl:attribute name="style"><xsl:value-of select="@*[name() = $attrcellstyle]"/></xsl:attribute>\n' +
                                        '  </xsl:if>\n' +
                                        '  <xsl:if test="{0} and not ({0} = \'\')"><img style="position:relative;"' + jsx3.html._UNSEL + ' alt="{{0}alt}">\n' +
                                        '    <xsl:attribute name="src"><xsl:apply-templates select="{0}" mode="uri-resolver"/></xsl:attribute>\n' +
                                        '  </img></xsl:if>\n' +
                                        '</xsl:template>';

  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   */
  Column_prototype.init = function(strName) {
    this.jsxsuper(strName);
  };


  /**
   * Gets the user-defined XSL template (xsl:template) that will override the defualt template defined by <code>Column.TEMPLATES.default</code>.
   * @param-private strDefault {String} xsl:template
   * @return {String}
   */
  Column_prototype.getValueTemplate = function(strDefault) {
    if(this.jsxvaluetemplate != null) {
      if(this.jsxvaluetemplate.charAt(0) == "@") {
        var strTemplate = Column.TEMPLATES[this.jsxvaluetemplate.substring(1)];
        if(strTemplate) {
          return strTemplate;
        } else {
          LOG.error("The following value template type is not supported: " + this.jsxvaluetemplate);
        }
      } else if(jsx3.util.strTrim(this.jsxvaluetemplate).indexOf("<xsl:template") == 0) {
        return this.jsxvaluetemplate;
      }
    }

    if(strDefault != null) return strDefault;
  };

  /**
   * Sets the user-defined XSL template (xsl:template) that will override the defualt template defined by <code>Column.DEFAULT_VALUE_TEMPLATE</code>.
   * <br/>The path wildcard is as follows:
   * <ul><li><b>{0}</b> this will be replaced with the result of <code>[instance].getPath()</code>. For example: jsxtext</li></ul>
   * @param TEMPLATE {String} Either a valid xsl:template or a named system template, including: @default, @empty, @unescape, and @image
   */
  Column_prototype.setValueTemplate = function(TEMPLATE) {
    this.jsxvaluetemplate = TEMPLATE;

    //reset parent, since the XSLT will now need to be regenerated
    this._resetColumn();
  };

  /**
   * Gets whether or not this column can be resized by the user. If not set, the column will be assumed resizable
   * @return {jsx3.Boolean}
   */
  Column_prototype.getResizable = function() {
    return this.jsxresize;
  };

  /**
   * Sets whether or not this column can be resized by the user. If not set, the column will be assumed resizable. Note that if the parent Matrix
   * is set as NOT resizable, this setting is ignored and no child columns can be resized. Note that the header row is immediately repainted to reflect the change.
   * @param RESIZE {jsx3.Boolean}
   */
  Column_prototype.setResizable = function(RESIZE) {
    this.jsxresize = RESIZE;
    this._repaintParentHead();
  };

  /**
   * Returns one or more named attributes. When one of these attributes is updated by another column's edit mask iterface,
   * this column will called to repaint to reflect the updated value
   * @return {String} Comma-delimited attribute list
   */
  Column_prototype.getTriggers = function() {
    return this.jsxtriggers;
  };

  /**
   * Sets one or more named attributes. When one of these attributes is updated by another column's edit mask iterface,
   * this column will called to repaint to reflect the updated value
   * @param strTriggers {String} Comma-delimited attribute list. For example: <code>jsxtext, ssn, phone</code>.
   */
  Column_prototype.setTriggers = function(strTriggers) {
    this.jsxtriggers = strTriggers;
  };

  /**
   * Returns the selection path for this column of data. Returns 'jsxid' if no path specified
   * @return {String} selection path
   */
  Column_prototype.getPath = function() {
    return (this.jsxpath == null) ? this.getParent()._cdfan("id") : this.jsxpath;
  };

  /**
   * Sets the selection path for this column of data.
   * @param strPath {String} The name of the attribute For example <code>jsxtext</code>
   * @param bSuppressRepaint {Boolean} Pass <code>true</code> to stop the default repaint from occurring.
   * Typically property updates that affect the XSLT (such as path) require that the XSLT be regenerated.
   * However, the repaint can be suppressed to avoid unnecessary reparsing of the XSLT during repeated property updates.
   */
  Column_prototype.setPath = function(strPath,bSuppressRepaint) {
    this.jsxpath = strPath;

    //update view-related
    this._resetColumn();

    if (!bSuppressRepaint && this.getParent())
      this.getParent().repaint();
  };

  /**
   * Returns the CDF attribute to use to sort on this column. If the sort path has not been set explicitly, this method
   * returns the value of <code>this.getPath()</code>. The data source of the matrix containing this column is
   * sorted on this attribute when the matrix is sorted on this column.
   * @return {String}
   * @see #getPath()
   */
  Column_prototype.getSortPath = function() {
    return this.jsxsortpath != null ? this.jsxsortpath : this.getPath();
  };

  /**
   * Sets the CDF attribute to use to sort on this column. 
   * @param strPath {String}
   */
  Column_prototype.setSortPath = function(strPath) {
    this.jsxsortpath = strPath;
  };

  /**
   * Returns the data type for this column of data (affects sorting if this column is used for sorting the data); valid types include: jsx3.gui.Matrix.Column.TYPE_TEXT and jsx3.gui.Matrix.Column.TYPE_NUMBER
   * @return {String} data type for this column's data
   */
  Column_prototype.getDataType = function() {
    return (this.jsxdatatype == null) ? Column.TYPE_TEXT : this.jsxdatatype;
  };

  /**
   * Sets the data type for this column of data (affects sorting if this column is used for sorting the data); returns ref to self
   * @param DATATYPE {String} one of: jsx3.gui.Matrix.Column.TYPE_TEXT, jsx3.gui.Matrix.Column.TYPE_NUMBER
   */
  Column_prototype.setDataType = function(DATATYPE) {
    this.jsxdatatype = DATATYPE;
  };

  /**
   * Returns the data type for this column of data (affects sorting if this column is used for sorting the data).
   * @return {String} one of: jsx3.gui.Matrix.Column.TYPE_TEXT, jsx3.gui.Matrix.Column.TYPE_NUMBER
   */
  Column_prototype.getSortDataType = function() {
    return (this.jsxsortdatatype == null) ? this.getDataType() : this.jsxsortdatatype;
  };

  /**
   * Sets the data type for this column of data (affects sorting if this column is used for sorting the data); returns ref to self
   * @param DATATYPE {String} data type for this column's data. valid types include: jsx3.gui.Matrix.Column.TYPE_TEXT and jsx3.gui.Matrix.Column.TYPE_NUMBER
   */
  Column_prototype.setSortDataType = function(DATATYPE) {
    this.jsxsortdatatype = DATATYPE;
  };

  /**
   * Returns whether the parent list/grid can be sorted on this column. If no value is provided, the column is assumed sortable unless
   * the parent control explicitly specifies that no column should sort.
   * @return {jsx3.Boolean}
   * @see jsx3.gui.Matrix#getCanSort()
   */
  Column_prototype.getCanSort = function() {
    return this.jsxsort;
  };

  /**
   * Sets whether the parnet list/grid can be sorted on this column. Note that the header row is immediately repainted to reflect the change.
   * @param SORT {jsx3.Boolean}
   */
  Column_prototype.setCanSort = function(SORT) {
   this.jsxsort = SORT;
    this._repaintParentHead();
  };

  /**
   * Sets the identifier for which of the default column formatters should be implemented. A function literal can also be passed.
   * @param handler {String|Function|jsx3.gui.Matrix.ColumnFormat} including @unescape, @lookup, @message,  @datetime, @date, @time, and @number. For example: <code>@unescape</code>.
   * <p><b>- or -</b></p>
   * Function literal with the signature, <code>function(element,cdfkey, matrix, column, rownumber,server)</code>. For example:
   * <p><pre>
   * function(element, cdfkey, matrix, column, rownumber, server) {
   *   var mf = new jsx3.util.MessageFormat("{0,number,currency}");
   *   element.innerHTML = mf.format(element.innerHTML);
   * };
   * </pre></p>
   * @see jsx3.gui.Matrix.ColumnFormat
   */
  Column_prototype.setFormatHandler = function(handler) {
    if (typeof(handler) == "function") {
      this._jsxformathandler = new jsx3.gui.Matrix.ColumnFormat();
      this._jsxformathandler.format = handler;
    } else if (handler && typeof(handler) == "object" && typeof(handler.format) == "function") {
      this._jsxformathandler = handler;
    } else {
      //force type conversion, so serialized.
      delete this._jsxformathandler;
      this.jsxformathandler = handler != null ? handler + "" : null;
    }
  };

  /**
   * Gets the <i>named</i> object that will handle the reformatting of a given column's data cells. This object should
   * implment the interface, <code>jsx3.gui.Matrix.ColumnFormat</code>, or adhere to its APIs.
   * Can also return the function literal
   * @return {String} named object or function literal
   * @see jsx3.gui.Matrix.ColumnFormat
   */
  Column_prototype.getFormatHandler = function() {
    return this.jsxformathandler;
  };

  /**
   * Gets the named method to call that will handle the reformatting of a given cell.
   * @return {Object}
   * @private
   * @jsxobf-clobber-shared
   */
  Column_prototype._getFormatHandler = function() {
    if (typeof(this._jsxformathandler) == "undefined") {
      if (this.jsxformathandler) {
        /* @jsxobf-clobber */
        this._jsxformathandler = jsx3.gui.Matrix.ColumnFormat.getInstance(this.jsxformathandler, this);

        if (this._jsxformathandler == null) {
          try {
            var myObj = this.eval("var fn = " + this.jsxformathandler + "; fn;");
            if (typeof(myObj) == "object" && typeof(myObj.format) == "function" && typeof(myObj.validate) == "function") {
              this._jsxformathandler = myObj;
            } else if (typeof(myObj) == "function") {
              this._jsxformathandler = new jsx3.gui.Matrix.ColumnFormat();
              this._jsxformathandler.format = myObj;
            } else {
              LOG.error("There is a signature/type error when evaluating the format handler: " + this.jsxformathandler);
            }
          } catch (e) {
            LOG.error("Error evaluating the format handler string: " + this.jsxformathandler, jsx3.NativeError.wrap(e));
          }
        }
      } else {
        this._jsxformathandler = null;
      }
    }

    return this._jsxformathandler;
  };

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  Column_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    var b1 = this.getBoxProfile(true, objImplicit);

    //NOTE: objGUI is never passed to the recalculate methods below, since the parent matrix control coordinates how dimensions are applied to all column children

    //recalculate header td
    var recalcRst = b1.recalculate(objImplicit, null, objQueue);

    var objParent = this.getParent();

    //recalculate header div
    var b1a = b1.getChildProfile(0);
    b1a.recalculate({height:b1.getClientHeight()},null, objQueue);

    //recalculate data cell td (implements width and optional height)
    var b1b = b1.getChildProfile(1);
    var iProfile = {parentwidth:objImplicit.parentwidth};
    if(this._heightIsFixed()) {
      //user may have made an error and specified paging mode and a zero height; fix here
      var intMyHeight = objParent.getRowHeight(jsx3.gui.Matrix.DEFAULT_ROW_HEIGHT);
      iProfile.height = (intMyHeight) ? intMyHeight : jsx3.gui.Matrix.DEFAULT_ROW_HEIGHT;
    }
    b1b.recalculate(iProfile,null, objQueue);

    //recalculate data cell div only if it implements optional height. (the div NEVER specifies width, only the TD)
    if(this._heightIsFixed()) {
      var b1c = b1b.getChildProfile(0);
      b1c.recalculate({height:b1b.getClientHeight()},null, objQueue);
    }

    //reset the xslt for parent; must be regenerated when the column widths change
    if (recalcRst.w)
      objParent.resetXslCacheData();

    return recalcRst;
  };

  /**
   * Creates the box model/profile for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @private
   */
  Column_prototype.createBoxProfile = function(objImplicit) {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();
    var objParent = this.getParent();

    //the implicit object must either provide a canvas dimension to live within (parentwidth/parentheight) or must explicitly define the size (width/height)
    if(objParent && (objImplicit == null || ((isNaN(objImplicit.parentwidth) || isNaN(objImplicit.parentheight))))) {
      objImplicit = objParent.getClientDimensions(this);
    } else if(objImplicit == null) {
      //this should never happen--maybe a fragment could cause???
      objImplicit = {};
    }

    //HEADER CELL
    //create the outer-most box
    objImplicit.width = "100%";
    objImplicit.height = "100%";
    objImplicit.boxtype = "inline";
    objImplicit.tagname = "td";
    var bor, pad;
    if((bor = this.getBorder()) != null && bor != "") objImplicit.border = bor;
    if((pad = this.getPadding()) != null && pad != "") objImplicit.padding = pad;
    var b1 = new jsx3.gui.Painted.Box(objImplicit);

    //create div
    var o1a = {};
    o1a.height = b1.getClientHeight();
    o1a.boxtype = "inline";
    o1a.tagname = "div";
    var b1a = new jsx3.gui.Painted.Box(o1a);
    b1.addChildProfile(b1a);

    //DATA CELL
    //create the outer-most box for the data row
    var o1b = {};
    if(this._heightIsFixed()) {
      //user may have made an error and specified paging mode and a zero height; fix here
      var intMyHeight = objParent.getRowHeight(jsx3.gui.Matrix.DEFAULT_ROW_HEIGHT);
      o1b.height = (intMyHeight) ? intMyHeight : jsx3.gui.Matrix.DEFAULT_ROW_HEIGHT;
    }
    o1b.width = "100%";
    o1b.boxtype = "inline";
    o1b.tagname = "td";
    o1b.parentwidth = objImplicit.parentwidth;

    if((bor = this.getCellBorder()) != null && bor != "") o1b.border = bor;
    if((pad = this.getCellPadding()) != null && pad != "") o1b.padding = pad;
    var b1b = new jsx3.gui.Painted.Box(o1b);
    //just add as a child here as a place holder. not reflective of actual on-screen dom
    b1.addChildProfile(b1b);

    //create div for the data row
    var o1c = {};
    if(this._heightIsFixed()) o1c.height = b1b.getClientHeight();
    o1c.boxtype = "inline";
    o1c.tagname = "div";
    var b1c = new jsx3.gui.Painted.Box(o1c);
    b1b.addChildProfile(b1c);

    //return the explicit object (e.g., the box profile)
    return b1;
  };

  /**
   * Determines if the parent matrix instance enforces fixed row height
   * @return {Boolean}
   * @private
   * @jsxobf-clobber
   */
  Column_prototype._heightIsFixed = function() {
    var objParent = this.getParent();
    if (objParent) {
      //paging force row heigh regardless
      if(objParent.getPagingModel() == jsx3.gui.Matrix.PAGING_PAGED) return true;

      //only a zero means a flex-height
      return objParent.getRowHeight() != 0;
    }

    return true;
  };


  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  Column_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();
    var objParent = this.getParent();

    //get box profile; persist the height and width of the viewport
    var b1 = this.getBoxProfile(true);
    b1.setAttributes('id="' + this.getId() + '"' + jsx3.html._UNSEL + this.paintTip() +
        objParent.renderHandler(jsx3.gui.Event.MOUSEDOWN, "_doStartReorder") +
        objParent.renderHandler(jsx3.gui.Event.CLICK, "_doSort"));
    b1.setStyles(this.paintCursor() + this.paintBackgroundColor() + this.paintBackground() + this.paintColor() +
                 this.paintFontWeight() + this.paintTextAlign() + this.paintVAlign());
    var b1a = b1.getChildProfile(0);
    b1a.setAttributes('class="jsx30matrixcolumn_value"' + jsx3.html._UNSEL);
    b1a.setStyles(this.paintWrap() + this.paintFontName() + this.paintFontSize() + this._paintSortIcon());

    //return
    return b1.paint().join(b1a.paint().join(this.paintText()));
  };


  /**
   * Updates the view of this object by calling <code>paint()</code> and replacing the current view with the
   * returned HTML. This method has no effect if this object is not currently displayed.
   * @return {String} the result of calling <code>paint()</code> or <code>null</code> if this object is not displayed.
   * @see #paint()
   */
  Column_prototype.repaint = function() {
    // always repaint headers in their entirety (not just a single item);
    this._repaintParentHead();
  };


  /**
   * paints the sort icon
   * @return {String} CSS appropriate for a bg image to designate sort direction
   * @private
   * @jsxobf-clobber
   */
  Column_prototype._paintSortIcon = function() {
    if(this.getSortPath() == this.getParent().getSortPath()) {
      return "background-image:url(" +
      ((this.getParent().getSortDirection() == jsx3.gui.Matrix.SORT_ASCENDING) ?
      jsx3.gui.Matrix.SORT_ASCENDING_IMG : jsx3.gui.Matrix.SORT_DESCENDING_IMG) +
      ");";
    }
    return "";
  };


  /**
   * applies the sort icon after a sort event
   * @param bApply {Boolean} either applies or removes
   * @package
   */
  Column_prototype._applySortIcon = function(bApply) {
    this.getRendered().childNodes[0].style.backgroundImage = (bApply) ? "url(" +
      ((this.getParent().getSortDirection() == jsx3.gui.Matrix.SORT_ASCENDING) ?
      jsx3.gui.Matrix.SORT_ASCENDING_IMG : jsx3.gui.Matrix.SORT_DESCENDING_IMG) +
      ")" : "";
  };


  /**
   * Gets the colgroup element in order to implement bgcolor and background to the rendered column.
   * @return {String} DHTML
   * @private
   * @jsxobf-clobber
   */
  Column_prototype._paintColumnProfile = function() {
//TO DO: is this necessary? seems like ff and ie don't give color precendence in the same manner. perhaps no need for columns??
    return '<colgroup style="' + this.paintCellBackgroundColor() + /*this.paintCellBackground() + */'"></colgroup>';
  };

  /**
   * Sets the Width on the column.  Immediately updates MODEL and VIEW. Note that if a wilcard is used without <b>Scale Width</b>, it will be replaced
   * with the value of <code>jsx3.gui.Matrix.Column.DEFAULT_WIDTH</code>
   * @param vntWidth {String | int} Can be a valid number (pixel units are implied), a Percent, or a Wildcard.  For example: 100, 25%, *
   * @param bRepaint {boolean} always treated as <code>true</code>.
   * @see jsx3.gui.Matrix#setScaleWidth()
   * @return {jsx3.gui.Matrix.Column}
   */
  Column_prototype.setWidth = function(vntWidth, bRepaint) {
    //update the model
    this.jsxwidth = vntWidth;

    //tell the parent to update; column width changes affect all sibling columns and the overall list
    //var b1 = this.getParent().getBoxProfile(true);
    var objParent = this.getParent();
    if (objParent)
      objParent.syncBoxProfile(objParent.getParent().getClientDimensions(objParent), true);
    
    return this;
  };


  /**
   * Sets the display for the object. Note that although the framework uses CSS to apply this setting,
   * the actual values that get set are determined by the system. Only those values listed for the parameter,
   * <b>DISPLAY</b>, are supported as inputs to this function. Calling this method will cause the underlying XSLT
   * for the Matrix parent to be regenerated.
   * @param DISPLAY {String} one of <code>jsx3.gui.Block.DISPLAYNONE</code> and <code>jsx3.gui.Block.DISPLAYBLOCK</code>
   * @param bRepaint {boolean} if <code>true</code>, the view of this object is immediately updated.
   * @return {jsx3.gui.Matrix.Column} this object
   */
  Column_prototype.setDisplay = function(DISPLAY, bRepaint) {
    this.jsxdisplay = DISPLAY;
    var p = this.getParent();
    if(p) {
      p._reset();
      if(bRepaint) p.repaint();
    }
    return this;
  };


  /**
   * Returns the zero-based index for ths column in relation to its siblings.  This is different from getChildIndex in that
   * it corresponds to the position of this column as rendered on-screen, meaning if a child of a lesser index is not
   * displayed (e.g., display = none), the value returned from this method will be less than what would be returned by getChildIndex.
   * Returns null if this object is not displayed.
   * @return {int}
   * @see jsx3.app.Model#getChildIndex()
   */
  Column_prototype.getDisplayIndex = function() {
    var p = this.getParent();
    if(p) {
      var oKids = p._getDisplayedChildren();
      for(var i=0;i<oKids.length;i++)
        if(oKids[i] == this)
          return i;
    }
  };


/* **************************************************************+
|**************** DATA/HEADER CELL PAINTERS *********************|
+****************************************************************/


  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  Column_prototype.paintCellBackgroundColor = function() {
    //TO DO: research more:::??? :::return pointer to the alternate row colors. IE doesn't like overflow and will bleed through if not bg color present
    return (this.getCellBackgroundColor()) ? ("background-color:" + this.getCellBackgroundColor()) + ";" : "{$jsx_rowbg}";
  };

  /**
   * renders CSS property value(s) for a border (border: solid 1px #000000)
   * @return {String}
   * @private
   */
  Column_prototype.paintCellBorder = function() {
    return (this.getCellBorder()) ? this.getCellBorder() + ";" : "";
  };

  /**
   * renders valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @return {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   * @private
   */
  Column_prototype.paintCellColor = function() {
    return (this.getCellColor()) ? ("color:" + this.getCellColor() + ";") : ";";
  };

  /**
   * renders valid CSS property value, (e.g., default,wait,col-resize); if no value or an empty string, null is returned
   * @return {String} valid CSS property value, (e.g., default,wait,col-resize)
   * @private
   */
  Column_prototype.paintCellCursor = function() {
    return (this.getCellCursor()) ? ("cursor:" + this.getCellCursor() + ";") : "";
  };

  /**
   * renders the CSS font-family for the object
   * @return {String} valid CSS font-family property value
   * @private
   */
  Column_prototype.paintCellFontName = function() {
    //no defaults!! -- allow parent Matrix to specify these values without the cell enforcing a default
    if(!this.getCellFontName()) return "";
    return "font-family:" + ((this.getCellFontName()) ? this.getCellFontName() : jsx3.gui.Block.DEFAULTFONTNAME) + ";";
  };

  /**
   * renders the CSS font-size for the object
   * @private
   */
  Column_prototype.paintCellFontSize = function() {
    if(!this.getCellFontSize()) return "";
    return "font-size:" + ((this.getCellFontSize()) ? this.getCellFontSize() : jsx3.gui.Block.DEFAULTFONTSIZE) + "px;";
  };

  /**
   * renders the CSS font-weight for the object ("bold" or "normal")
   * @return {String}
   * @private
   */
  Column_prototype.paintCellFontWeight = function() {
    return (this.getCellFontWeight()) ? ("font-weight:" + this.getCellFontWeight() + ";") : "";
  };

  /**
   * renders the CSS to generate/suppress word wrapping in the header cell. default is not to wrap if not specified
   * @return {String}
   * @private
   */
  Column_prototype.paintWrap = function() {
    return (this.getWrap(jsx3.Boolean.FALSE) == jsx3.Boolean.FALSE) ? "white-space:nowrap;overflow:hidden;" : "";
  };

  /**
   * renders the CSS to generate/suppress word wrapping in the data cells. default is not to wrap if not specified
   * @return {String}
   * @private
   */
  Column_prototype.paintCellWrap = function() {
    return (this.getCellWrap(jsx3.Boolean.FALSE) == jsx3.Boolean.FALSE) ? "white-space:nowrap;overflow:hidden;" : "";
  };

  /**
   * renders the CSS text-align property for the object; if no property value exists, jsx3.gui.Block.ALIGNLEFT is returned by default
   * @return {String}
   * @private
   */
  Column_prototype.paintCellTextAlign = function() {
    return "text-align:" + ((this.getCellTextAlign()) ? this.getCellTextAlign() : jsx3.gui.Block.ALIGNLEFT) + ";";
  };

  /**
   * renders the CSS vertical-align property for the object; if no property value exists, jsx3.gui.Block.ALIGNLEFT is returned by default
   * @return {String}
   * @private
   */
  Column_prototype.paintVAlign = function() {
    return "vertical-align:" + ((this.getVAlign()) ? this.getVAlign() : Column.DEFAULT_VALIGN) + ";";
  };

  /**
   * renders the CSS text-align property for the object; if no property value exists, jsx3.gui.Block.ALIGNLEFT is returned by default
   * @return {String}
   * @private
   */
  Column_prototype.paintCellVAlign = function() {
    return "vertical-align:" + ((this.getCellVAlign()) ? this.getCellVAlign() : Column.DEFAULT_VALIGN) + ";";
  };

/* **************************************************************+
|************** DATA CELL GETTERS/SETTERS ***********************|
+****************************************************************/

  /*
   * Returns valid CSS property value for the background such as:  background-image:url(x.gif);  or background-image:url(x.gif);background-repeat:no-repeat;
   * @return {String} valid CSS property for the background such as:  background-image:url(x.gif);  or background-image:url(x.gif);background-repeat:no-repeat;
   *
  Column_prototype.getCellBackground = function() {
    return this.jsxcellbg;
  }; */

  /*
   * Sets valid CSS property value for the background such as:  background-image:url(x.gif);  or background-image:url(x.gif);background-repeat:no-repeat;
   * @param strBG {String} valid CSS property value for the background such as:  background-image:url(x.gif);  or background-image:url(x.gif);background-repeat:no-repeat;
   *
  Column_prototype.setCellBackground = function(strBG) {
    this.jsxcellbg = strBG;
  }; */

  /**
   * Returns CSS property value for the data cell background-color.
   * @return {String}
   */
  Column_prototype.getCellBackgroundColor = function() {
    return this.jsxcellbgcolor;
  };

  /**
   * Sets CSS property value for the data cell background-color. Call <code>repaint</code> on the parent instance to update the view.
   * @param strColor {String} valid CSS property value, (e.g., red, #ff0000, rgb(255,0,0))
   */
  Column_prototype.setCellBackgroundColor = function(strColor) {
    this.jsxcellbgcolor = strColor;
    this._resetColumn();
  };

  /**
   * Returns CSS property value for the data cell border.
   * @return {String}
   */
  Column_prototype.getCellBorder = function() {
    return this.jsxcellborder;
  };

  /**
   * Sets CSS property value(s) for a border for the data cells. Updates MODEL and VIEW (unless repaint is suppressed).
   * @param strCSS {String} valid CSS property value for border. For example: <code>solid 1px red;solid 0px;solid 0px;solid 1px white</code>
   * @param bSuppressRepaint {Boolean} Pass <code>true</code> to stop the default repaint from occurring.
   * Typically property updates that affect the browser-specific box model (such as borders) are repainted
   * immediately to keep the box model abstraction in synch with the native view. However, the repaint can be
   * suppressed to avoid unnecessary reparsing of the XSLT during repeated property updates.
   */
  Column_prototype.setCellBorder = function(strCSS,bSuppressRepaint) {
    //update model
    this.jsxcellborder = strCSS;

    //update view-related
    this._resetColumn();

    if (!bSuppressRepaint && this.getParent())
      this.getParent().repaint();
  };

  /**
   * Returns CSS property value for the data cell color.
   * @return {String}
   */
  Column_prototype.getCellColor = function() {
    return this.jsxcellcolor;
  };

  /**
   * Sets CSS property value for the data cell color. Call <code>repaint</code> on the parent instance to update the view.
   * @param strColor {String} valid CSS property value, (e.g., red, #ffffff, rgb(255,0,0))
   */
  Column_prototype.setCellColor = function(strColor) {
    this.jsxcellcolor = strColor;
    this._resetColumn();
  };

  /**
   * Returns CSS property value for the data cell cursor.
   * @return {String}
   */
  Column_prototype.getCellCursor = function() {
    return this.jsxcellcursor;
  };

  /**
   * Sets CSS property value for the data cell cursor. Call <code>repaint</code> on the parent instance to update the view.
   * @param strCursor {String} CSS property value, (e.g., default, wait, col-resize)
   */
  Column_prototype.setCellCursor = function(strCursor) {
    this.jsxcellcursor = strCursor;
    this._resetColumn();
  };

  /**
   * Returns the CSS property value for the data cell font-family.
   * @return {String}
   */
  Column_prototype.getCellFontName = function() {
    return this.jsxcellfontname;
  };

  /**
   * Sets the CSS property value for the data cell font-family. Call <code>repaint</code> on the parent instance to update the view.
   * @param strFontName {String} valid CSS font-family property value (e.g., Arial, Courier)
   */
  Column_prototype.setCellFontName = function(strFontName) {
    this.jsxcellfontname = strFontName;
    this._resetColumn();
  };

  /**
   * Returns the CSS property value for the data cell font-size.
   * @return {int}
   */
  Column_prototype.getCellFontSize = function() {
    return this.jsxcellfontsize;
  };

  /**
   * Sets the CSS property value for the data cell font-size. Call <code>repaint</code> on the parent instance to update the view.
   * @param intPixelSize {int} font-size (in pixels)
   */
  Column_prototype.setCellFontSize = function(intPixelSize) {
    this.jsxcellfontsize = intPixelSize;
    this._resetColumn();
  };

  /**
   * Returns the CSS property value for the data cell font-weight.
   * @return {String}
   */
  Column_prototype.getCellFontWeight = function() {
    return this.jsxcellfontweight;
  };

  /**
   * Sets the CSS property value for the data cell font-weight. Call <code>repaint</code> on the parent instance to update the view.
   * @param FONTWEIGHT {String} one of: <code>jsx3.gui.Block.FONTBOLD</code>, <code>jsx3.gui.Block.FONTNORMAL</code>
   */
  Column_prototype.setCellFontWeight = function(FONTWEIGHT) {
    this.jsxcellfontweight = FONTWEIGHT;
    this._resetColumn();
  };

  /**
   * Returns the CSS property value for the data cell padding.
   * @return {String}
   */
  Column_prototype.getCellPadding = function() {
    return this.jsxcellpadding;
  };

  /**
   * Sets the CSS property value for the data cell padding. Updates MODEL and VIEW (unless repaint is suppressed).
   * @param strCSS {String} valid CSS property value for padding. For example: <code>8 4 8 4</code>
   * @param bSuppressRepaint {Boolean} Pass <code>true</code> to stop the default repaint from occurring.
   * Typically property updates that affect the browser-specific box model (such as padding) are repainted
   * immediately to keep the box model abstraction in synch with the native view. However, the repaint can be
   * suppressed to avoid unnecessary reparsing of the XSLT during repeated property updates.
   */
  Column_prototype.setCellPadding = function(strCSS,bSuppressRepaint) {
    //update the mdoel
    this.jsxcellpadding = strCSS;

    //update view-related
    this._resetColumn();

    if (!bSuppressRepaint && this.getParent())
      this.getParent().repaint();
  };

  /**
   * Returns the CSS property value for the data cell text-align.
   * @return {String}
   */
  Column_prototype.getCellTextAlign = function() {
    return this.jsxcelltextalign;
  };

  /**
   * Sets the CSS property value for the data cell text-align. Call <code>repaint</code> on the parent instance to update the view.
   * @param ALIGN {String} one of: <code>jsx3.gui.Block.ALIGNLEFT</code>, <code>jsx3.gui.Block.ALIGNRIGHT</code>, <code>jsx3.gui.Block.ALIGNCENTER</code>
   */
  Column_prototype.setCellTextAlign = function(ALIGN) {
    this.jsxcelltextalign = ALIGN;
    this._resetColumn();
  };

  /**
   * Returns the CSS property value for the data cell vertical-align. If no value is provided, the data cells render top-aligned.
   * @return {String}
   */
  Column_prototype.getCellVAlign = function() {
    return this.jsxcellvalign;
  };

  /**
   * Sets  the CSS property value for the data cell vertical-align. Call <code>repaint</code> on the parent instance to update the view.
   * @param VALIGN {String} valid CSS value for vertical-align style.
   */
  Column_prototype.setCellVAlign = function(VALIGN) {
    this.jsxcellvalign = VALIGN;
    this._resetColumn();
  };

  /**
   * Returns whether or not the data cellc will support text-wrapping. If no value is specified, the text will not wrap
   * @param-private strDefault {String} The default value to use if null
   * @return {int}
   */
  Column_prototype.getCellWrap = function(strDefault) {
    return (this.jsxcellwrap != null) ? this.jsxcellwrap : ((strDefault != null) ? strDefault : null);
  };

  /**
   * Sets whether or not the data cellc will support text-wrapping. If no value is
   * specified, the text will not wrap. Call <code>repaint</code> to update the VIEW
   * @param WRAP {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  Column_prototype.setCellWrap = function(WRAP) {
    this.jsxcellwrap = WRAP;

    //remove any view-related models (wrap setting necessitates a repaint)
    this._resetColumn();
  };

/* **************************************************************+
|************** HEADER CELL GETTERS/SETTERS *********************|
+****************************************************************/

  /**
   * Sets property value(s) for a border for the header cell (<code>solid 1px #000000</code>). Updates are applied immediately
   * @param strCSS {String} valid CSS property value for a border (border: solid 1px #000000) or GI shorthand notation for border
   */
  Column_prototype.setBorder = function(strCSS) {
    this.jsxborder = strCSS;
    this.clearBoxProfile();
    this._repaintParentHead();
  };

  /**
   * Sets CSS property value(s) for a padding for the header cell. Updates are applied immediately.
   * @param strCSS {String} valid CSS property value for padding. For example: <code>8 4 8 4</code>
   */
  Column_prototype.setPadding = function(strCSS) {
    this.jsxpadding = strCSS;
    this.clearBoxProfile();
    this._repaintParentHead();
  };

  /**
   * Gets whether or not the header cell will support text-wrapping. If not specified, the cell will be painted with no wrapping.
   * @param-private strDefault {String} The default value to use if null
   * @return {jsx3.Boolean}
   */
  Column_prototype.getWrap = function(strDefault) {
    return (this.jsxwrap != null) ? this.jsxwrap : ((strDefault != null) ? strDefault : null);
  };

  /**
   * Sets whether or not the header cell will support text-wrapping. Repaints the header to immediately reflect this change.
   * @param WRAP {jsx3.Boolean}
   */
  Column_prototype.setWrap = function(WRAP) {
    this.jsxwrap = WRAP;

    //an update to the wrapping of a header cell has not layout affects. just repaint the header
    this._repaintParentHead();
  };

  /**
   * Returns the CSS property value for the header cell vertical-align. If no value is provided, the header cell render top-aligned.
   * @return {String}
   */
  Column_prototype.getVAlign = function() {
    return this.jsxvalign;
  };

  /**
   * Sets the CSS property value for the header cell vertical-align. Repaints the header to immediately reflect this change.
   * @param VALIGN {String} valid CSS value for vertical-align style.
   */
  Column_prototype.setVAlign = function(VALIGN) {
    this.jsxvalign = VALIGN;
    this._repaintParentHead();
  };

  /**
   * Sets the text/HTML for the control to be displayed on-screen.
   * @param strText {String} text/HTML
   * @param bRepaint {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.
   * @return {jsx3.gui.Matrix.Column}
   */
  Column_prototype.setText = function(strText,bRepaint) {
    this.jsxtext = strText;
    var objGUI;
    if (bRepaint && (objGUI = this.getRendered()) != null) objGUI.childNodes[0].innerHTML = strText;
    return this;
  };

  Column_prototype.getEditMask = function() {
    // TODO: look for child of specific type
    return this.getChild(0);
  };

  Column_prototype.getEditMasks = function() {
    // TODO: look for child of specific type
    return this.getChildren();
  };

  Column_prototype.getValueForRecord = function(strRecordId) {
    var objNode = this.getParent().getRecordNode(strRecordId);
    if(objNode)
      return objNode.getAttribute(this.getPath());
    else if(strRecordId == "jsxautorow")
     return this.getParent().getAutoRowSession()[this.getPath()];
  };

  Column_prototype.setValueForRecord = function(strRecordId, strValue) {
    var objNode = this.getParent().getRecordNode(strRecordId);
    if(objNode)
      objNode.setAttribute(this.getPath(), strValue);
    else if(strRecordId == "jsxautorow")
     this.getParent().getAutoRowSession()[this.getPath()] = strValue;
  };

  Column_prototype.onSetParent = function(objParent) {
    return jsx3.gui.Matrix && objParent instanceof jsx3.gui.Matrix;
  };

  /** @private @jsxobf-clobber */
  Column_prototype._resetColumn = function() {
    var p = this.getParent();
    if (p) p._reset();
  };

  /** @private @jsxobf-clobber */
  Column_prototype._repaintParentHead = function() {
    var p = this.getParent();
    if (p) p.repaintHead();
  };

});

// Deprecated: bridge code
jsx3.gui.MatrixColumn = jsx3.gui.Matrix.Column;
