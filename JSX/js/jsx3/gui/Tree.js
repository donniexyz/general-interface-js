/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.xml.Cacheable", "jsx3.gui.Form", "jsx3.gui.Block");

/**
 * Creates a DHTML-based navigational trees (similar to the tree structure used by Windows Explorer with folders
 * and files). This class expects XML source adhering to standards for version 3.0, the Common Data Format.
 * <p/>
 * The Tree class by default supports the following CDF attributes:
 * <ul>
 * <li><code>jsxid</code></li>
 * <li><code>jsxselected</code></li>
 * <li><code>jsxstyle</code></li>
 * <li><code>jsxclass</code></li>
 * <li><code>jsxopen</code></li>
 * <li><code>jsximg</code></li>
 * <li><code>jsxlazy</code> (see model event DATA)</li>
 * <li><code>jsxtip</code></li>
 * <li><code>jsxtext</code></li>
 * <li><code>jsxunselectable</code></li>
 * </ul>
 * This class publishes the following model events:
 * <ul>
 * <li><code>DATA</code> &#8211;</li>
 * <li><code>EXECUTE</code> &#8211;</li>
 * <li><code>SELECT</code> (deprecated) &#8211;</li>
 * <li><code>MENU</code> &#8211;</li>
 * <li><code>TOGGLE</code> &#8211;</li>
 * <li><code>CHANGE</code> &#8211;</li>
 * <li><code>SPYGLASS</code> &#8211;</li>
 * <li><code>ADOPT</code> &#8211;</li>
 * <li><code>DROP/CTRL_DROP/BEFORE_DROP/CANCEL_DROP</code> &#8211;</li>
 * </ul>
 */
jsx3.Class.defineClass("jsx3.gui.Tree", jsx3.gui.Block, [jsx3.gui.Form, jsx3.xml.Cacheable, jsx3.xml.CDF], function(Tree, Tree_prototype) {

  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;
  var html = jsx3.html;

/* @JSC :: begin DEP */

  /**
   * {String} JSX_TREE_XSL (default)
   * @deprecated
   */
  Tree.DEFAULTXSLID = "JSX_TREE_XSL";

/* @JSC :: end */

  /**
   * {String}
   */
  Tree.DEFAULTXSLURL = jsx3.resolveURI("jsx:///xsl/jsxtree.xsl");

  /* @jsxobf-clobber */
  /* @Embed(source='../../../xsl/jsxtree.xsl', type='xsl') */
  Tree._XSLRSRC = new jsx3.xml.XslDocument().load(Tree.DEFAULTXSLURL);

  /**
   * {String} JSX/images/tree/minus.gif (default)
   */
  Tree.ICONMINUS = "jsx:///images/tree/minus.gif";

  /**
   * {String} JSX/images/tree/plus.gif (default)
   */
  Tree.ICONPLUS = "jsx:///images/tree/plus.gif";

  /**
   * {String} JSX/images/tree/file.gif (default)
   */
  Tree.ICON = "jsx:///images/tree/file.gif";

  /**
   * {String} JSX/images/tree/select.gif (default)
   */
  Tree.SELECTEDIMAGE = jsx3.resolveURI("jsx:///images/tree/select.gif");

  /**
   * {String} jsx:///images/matrix/insert_before.gif
   */
  Tree.INSERT_BEFORE_IMG = jsx3.resolveURI("jsx:///images/matrix/insert_before.gif");

  /**
   * {String} jsx:///images/matrix/append.gif
   */
  Tree.APPEND_IMG = jsx3.resolveURI("jsx:///images/matrix/append.gif");

/* @JSC :: begin DEP */

  /**
   * {String} url(JSX/images/tree/over.gif) (default)
   * @deprecated
   */
  Tree.ONDROPBGIMAGE = "url(" + jsx3.resolveURI("jsx:///images/tree/over.gif") + ")";

/* @JSC :: end */

  /* @JSC */ if (jsx3.CLASS_LOADER.IE6) {
  html.loadImages(Tree.ICONMINUS, Tree.ICONPLUS, Tree.ICON, Tree.SELECTEDIMAGE, "jsx:///images/tree/over.gif",
      Tree.INSERT_BEFORE_IMG, Tree.APPEND_IMG);
  /* @JSC */ }
    
  /**
   * {String} #8CAEDF (default)
   * @deprecated  Use CSS instead.
   */
  Tree.BORDERCOLOR = "#8CAEDF";

  /**
   * {String} #ffffff (default)
   */
  Tree.DEFAULTBACKGROUNDCOLOR = "#ffffff";

  /**
   * {String} &amp;nbsp; (default)
   */
  Tree.DEFAULTNODATAMSG = "&#160;";

  /** @private @jsxobf-clobber */
  Tree.TOGGLETIMEOUT = null;

  /** @private @jsxobf-clobber */
  Tree.TOGGLEDELAY = 500;

  /** @private @jsxobf-clobber */
  Tree.SPYTIMEOUT = null;

  /** @private @jsxobf-clobber */
  Tree._DRAGDELAY = 250;

  /** @private @jsxobf-clobber */
  Tree._DRAGTIMEOUT = null;

  /**
   * {int} Enum value for the <code>multiSelect</code> property indicating a multi-select tree.
   * @since 3.1
   * @final @jsxobf-final
   */
  Tree.MULTI = 1;

  /**
   * {int} Enum value for the <code>multiSelect</code> property indicating a single-select tree.
   * @since 3.1
   * @final @jsxobf-final
   */
  Tree.SINGLE = 0;

  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param strId {String} this value should correspond to the jsxid for the 'record' node is the selected node for the tree
   */
  Tree_prototype.init = function(strName, strId) {
    //call constructor for super class
    this.jsxsuper(strName);

    //set the value if passed
    if (strId != null)
      this.insertRecordProperty(strId, "jsxselected", "1", false);
  };

/* @JSC :: begin DEP */

  /**
   * @package
   */
  Tree_prototype.onAfterAttach = function() {
    this.jsxsuper();
    // DEPRECATED: this is just legacy support for jsxvalue
    if (this.jsxvalue != null && this.jsxvalue != "" && this.jsxvalue != "null")
      this.setValue(this.jsxvalue);
  };

/* @JSC :: end */

  /**
   * Returns XSLT for the Tree, prioritizing the acquisition in the following order: 1) check cache; 2) check jsxxsl; 3) check jsxxslurl; 4) use default
   * @return {jsx3.xml.Document} jsx3.xml.Document instance containing valid XSL stylesheet
   */
  Tree_prototype.getXSL = function() {
    return this._getSharedXSL(Tree.DEFAULTXSLURL, Tree._XSLRSRC);
  };

  /**
   * validates the Tree; if the Tree is set to 'required', a selection must be made to pass validation. Otherwise, a Tree will always pass validation
   * @return {int} one of: jsx3.gui.Form.STATEINVALID or jsx3.gui.Form.STATEVALID
   */
  Tree_prototype.doValidate = function() {
    var ids = this._getSelectedIds();
    var valid = ids.length > 0 || this.getRequired() == jsx3.gui.Form.OPTIONAL;
    this.setValidationState(valid ? jsx3.gui.Form.STATEVALID : jsx3.gui.Form.STATEINVALID);
    return this.getValidationState();
  };

  /**
   * renders bg css
   * @return {String} valid CSS property (background-color:red;)
   * @private
   */
  Tree_prototype.paintBackgroundColor = function() {
    return "background-color:" + ((this.getBackgroundColor()) ? this.getBackgroundColor() : Tree.DEFAULTBACKGROUNDCOLOR) + ";";
  };

  /**
   * Selects a record in the tree.  This method updates the model, datamodel, and view.
   * @param strRecordId {String|Array<String>} id for the record that will be the selected item, may be null to deselect all records
   * @param-package bReveal {boolean}
   * @return {jsx3.gui.Tree} this object
   */
  Tree_prototype.setValue = function(strRecordId, bReveal) {
/* @JSC :: begin DEP */
    var previousValue = this.getValue();
/* @JSC :: end */
    var bMulti = this.getMultiSelect() == Tree.MULTI;
    var bEvent = false;
/* @JSC :: begin DEP */
    // DEPRECATED: this should always be false
    bEvent = this.isOldEventProtocol();
/* @JSC :: end */

    if (jsx3.$A.is(strRecordId)) {
      if (! bMulti)
        throw new jsx3.IllegalArgumentException("strRecordId", strRecordId);
    } else if (bMulti) {
      strRecordId = [strRecordId];
    }

    if (bMulti) {
      this._mvDeselectAll();
      for (var i = 0; i < strRecordId.length; i++) {
        var id = strRecordId[i];
        if (id != null && ! this.isRecordSelectable(id)) continue;
        this._mvSelect(id);
      }

      if (bReveal && strRecordId.length > 0)
        this.revealRecord(strRecordId[0]);

/* @JSC :: begin DEP */
      if (bEvent)
        this.doEvent(Interactive.SELECT, {strRECORDID:strRecordId[0], strRECORDIDS:strRecordId});
/* @JSC :: end */
    } else {
      if (strRecordId != null && ! this.isRecordSelectable(strRecordId)) return this;

      // deselect any selected item in the GUI
      this._mvDeselectAll();

      if (strRecordId != null) {
        this._mvSelect(strRecordId);

        if (bReveal)
          this.revealRecord(strRecordId);
      }

/* @JSC :: begin DEP */
      if (bEvent)
        this.doEvent(Interactive.SELECT, {strRECORDID:strRecordId, strRECORDIDS:[strRecordId]});
/* @JSC :: end */
    }

/* @JSC :: begin DEP */
    if (bEvent)
      this.doEvent(Interactive.CHANGE, {objEVENT:null, preVALUE:previousValue, newVALUE:this.getValue(), _gipp:1});
/* @JSC :: end */

    return this;
  };

  /**
   * Internal GUI event-driven selection method.
   * @private
   * @jsxobf-clobber
   */
  Tree_prototype._selRecord = function(objEvent, strRecordId, bUnion, bDeselect, bNoEvent) {
    var previousValue = this.getValue();
    var bMulti = this.getMultiSelect() == Tree.MULTI;

    if (bMulti && bUnion) {
      if (strRecordId != null && ! this.isRecordSelectable(strRecordId)) return;

      var bSelect = false;
      if (this._isRecordSelected(strRecordId)) {
        if (bDeselect)
          this._mvDeselect(strRecordId);
      } else {
        this._mvSelect(strRecordId);
        bSelect = true;
      }

/* @JSC :: begin DEP */
      // only fire change event if union select added a new selection
      if (bSelect && !bNoEvent)
        this.doEvent(Interactive.SELECT, {objEVENT:objEvent, strRECORDID:strRecordId, strRECORDIDS:[strRecordId]});
/* @JSC :: end */
    } else {
      var bSameValue = this.getValue() == strRecordId;
      if (!bDeselect && bSameValue && !bUnion)
        return;

      // deselect any selected item in the GUI
      this._mvDeselectAll();

      if (strRecordId != null && ! this.isRecordSelectable(strRecordId))
        strRecordId = null;
      if (strRecordId != null) {
        if (bSameValue)
          this._mvDeselect(strRecordId);
        else
          this._mvSelect(strRecordId);
      }

/* @JSC :: begin DEP */
      if (!bNoEvent) {
        var id = bSameValue ? null : strRecordId;
        var ids = bSameValue ? [] : [id];
        this.doEvent(Interactive.SELECT, {objEVENT:objEvent, strRECORDID:id, strRECORDIDS:ids});
      }
/* @JSC :: end */
    }

    if (!bNoEvent)
      this.doEvent(Interactive.CHANGE, {objEVENT:objEvent, preVALUE:previousValue, newVALUE:this.getValue(), _gipp:1});
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._focusRecord = function(strRecordId) {
    var objGUI = typeof(strRecordId) == "string" ? this._getFocusItem(strRecordId) : strRecordId;
    if (objGUI != null && objGUI.getAttribute) {
      strRecordId = objGUI.getAttribute("jsxid");
      if (strRecordId) {
        try {
          html.focus(objGUI.childNodes[0].childNodes[2]);
          this._trackFocusedState(objGUI.getAttribute("jsxid"));
        } catch (e) {;}
      }
    } else {
      this._trackFocusedState(null);
    }
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._trackFocusedState = function(strRecordId) {
    if (strRecordId != null) {
      if (this._jsxfocusedrecordid == null)
        if (this.getMultiSelect() == Tree.MULTI)
          Event.subscribeLoseFocus(this, this.getRendered(), "_trackLoseFocus");
      /* @jsxobf-clobber */
      this._jsxfocusedrecordid = strRecordId;
    } else {
      if (this._jsxfocusedrecordid != null)
        Event.unsubscribeLoseFocus(this);
      this._jsxfocusedrecordid = null;
    }
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._trackLoseFocus = function(objEvent) {
    Event.unsubscribeLoseFocus(this);
    this._jsxfocusedrecordid = null;
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._addItemSelection = function(strRecordId) {
    var objGUI = this._getFocusItem(strRecordId);
    if (objGUI != null) {
      var elm = html.selectSingleElm(objGUI, 0, 2);
      jsx3.html.addClass(elm, "jsx30tree_texton");
      elm.style.backgroundImage = "url(" + Tree.SELECTEDIMAGE + ")";
    }
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._removeItemSelection = function(strRecordId) {
    var objGUI = this._getFocusItem(strRecordId);
    if (objGUI != null) {
      var elm = html.selectSingleElm(objGUI, 0, 2);
      jsx3.html.removeClass(elm, "jsx30tree_texton");
      elm.style.backgroundImage = "";
    }
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._mvDeselectAll = function() {
    for (var i = this._getSelectedIterator(); i.hasNext(); ) {
      var node = i.next();
      this._cdfav(node, "selected", null);
      this._removeItemSelection(this._cdfav(node, "id"));
    }
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._mvDeselect = function(strRecordId) {
    //persist the selected value (the id of the selected option) to the MODEL
    this.deleteRecordProperty(strRecordId, "jsxselected", false);

    // find item in the GUI
    this._removeItemSelection(strRecordId);
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._mvSelect = function(strRecordId) {
    //persist the selected value (the id of the selected option) to the MODEL
    this.insertRecordProperty(strRecordId, "jsxselected", "1", false);

    // find item in the GUI
    this._addItemSelection(strRecordId);
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._getSelectedIterator = function() {
    //return collection of selected nodes
    return this.getXML().selectNodeIterator("//" + this._cdfan("children") + "[@" + this._cdfan("selected") + "='1']");
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._getSelectedIds = function() {
    var i = this._getSelectedIterator();
    var ids = [];
    while (i.hasNext()) {
      var node = i.next();
      ids[ids.length] = this._cdfav(node, "id");
    }
    return ids;
  };

  /**
   * Reveals a record by toggling parent nodes as necessary and scrolling any containing blocks within the tree.
   * @param strRecordId {String} the id of the record to reveal
   * @param objJSX {jsx3.gui.Block} if provided, reveal the record up to this visual block; useful if the tree is set
   *    to <code>overflow:expand</code> and the containing block is set to <code>overflow:scroll</code>.
   */
  Tree_prototype.revealRecord = function(strRecordId, objJSX) {
    var recordNode = this.getRecordNode(strRecordId);
    var parentRecord = recordNode ? recordNode.getParent() : null;
    while (parentRecord != null) {
      this.toggleItem(this._cdfav(parentRecord, "id"), true);
      parentRecord = parentRecord.getParent();
    }

    var itemGUI = this._getFocusItem(strRecordId);
    if (itemGUI) {
      var baseGUI = objJSX ? objJSX.getRendered(itemGUI) : this.getRendered(itemGUI);
      if (baseGUI)
        html.scrollIntoView(itemGUI, baseGUI, 0, 10);
    }
  };

  /**
   * Returns the jsxid attribute for the selected CDF record/records.
   * @return {String|Array<String>} if single-select the jsxid of the selected record or <code>null</code> if none
   *    selected; if multi-select an array of the selected record ids.
   */
  Tree_prototype.getValue = function() {
    return this.getMultiSelect() == Tree.SINGLE ? this._getSelectedIds()[0] : this._getSelectedIds();
  };

/* @JSC :: begin DEP */

  /**
   * Returns whether or not the tree will listen for key events. Typically this is set jsx3.Boolean.FALSE when the tree is sorted. Default: jsx3.Boolean.TRUE
   * @return {int} one of: jsx3.Boolean.TRUE or jsx3.Boolean.FALSE
   * @deprecated  Key navigation now works with sorted trees.
   */
  Tree_prototype.getKeyListener = function() {
    return (this.jsxkeylistener == null) ? jsx3.Boolean.TRUE : this.jsxkeylistener;
  };

  /**
   * Sets whether or not the tree will listen for key events. Typically this is set jsx3.Boolean.FALSE when the tree is sorted
   * @param bBoolean {int} one of: jsx3.Boolean.TRUE or jsx3.Boolean.FALSE
   * @return {jsx3.gui.Tree} this object
   * @deprecated  Key navigation now works with sorted trees.
   */
  Tree_prototype.setKeyListener = function(bBoolean) {
    this.jsxkeylistener = bBoolean;
    return this;
  };

  /**
   * if 'getValue()' returns a non-null, this method will return the corresponding jsxtext property in the CDF
   * @return {String} text or null
   * @deprecated
   */
  Tree_prototype.getText = function() {
    var myNode = this._getSelectedIterator().next();
    return myNode != null ? this._cdfav(myNode, "text") : null;
  };

  /* @JSC :: end */

  /**
   * Returns whether this tree is multi- (<code>Tree.MULTI</code>) or single-select (<code>Tree.SINGLE</code>).
   * @return {int}
   * @see #MULTI
   * @see #SINGLE
   * @since 3.1
   */
  Tree_prototype.getMultiSelect = function() {
    return (this.jsxmultiselect == null) ? Tree.SINGLE : this.jsxmultiselect;
  };

  /**
   * Sets whether this tree is multi- (<code>Tree.MULTI</code>) or single-select (<code>Tree.SINGLE</code>).
   * @param intMulti {int} <code>Tree.MULTI</code> or <code>Tree.SINGLE</code>
   * @return {jsx3.gui.Tree} this object
   * @see #MULTI
   * @see #SINGLE
   * @since 3.1
   */
  Tree_prototype.setMultiSelect = function(intMulti) {
    this.jsxmultiselect = intMulti;
    return this;
  };

  /**
   * if @strRecordId equals the id of the selected option (this.getValue()), only the text property will update;
   *            returns a ref to self to facilitate method chaining
   * @param strRecordId {String} id for the record that will be 'redrawn' on-screen
   * @param ACTION {int} One of the following two values: jsx3.xml.CDF.INSERT, jsx3.xml.CDF.DELETE
   * @return {jsx3.gui.Tree} this object
   */
  Tree_prototype.redrawRecord = function(strRecordId, ACTION) {
    var objGUI = this._getFocusItem(strRecordId);

    if (ACTION == jsx3.xml.CDF.DELETE) {
      if (objGUI) {
        if (objGUI.parentNode.childNodes.length > 1) {
          var parentGUI = objGUI.parentNode.parentNode;
          parentGUI.style.position = "";
          html.removeNode(objGUI);
          parentGUI.style.position = "relative"; // IE removeNode causes layout shift, do this to reposition
        } else {
          var parentGUI = objGUI.parentNode.parentNode;
          var strParentId = parentGUI.getAttribute("jsxid");
          html.setOuterHTML(parentGUI, this.doTransform(strParentId));
        }
      }

      return this;
    }

    if (objGUI == null) {
      // display doesn't exist (insert?) so just redraw the parent record
      var objNode = this.getRecordNode(strRecordId);
      if (objNode != null) {
        //query the MODEL to determine the parent for this item
        if (this.getParent() != null) {
          objNode = objNode.getParent();
          var strParentId = this._cdfav(objNode, "id");
          var parentGUI = this._getFocusItem(strParentId);
          if (parentGUI != null) {
            // this is an insert, repainting the parent is the easiest thing to do
            html.setOuterHTML(parentGUI, this.doTransform(strParentId));
          }
        }
      }
    } else {
      //this item exists, so this is an update
      html.setOuterHTML(objGUI, this.doTransform(strRecordId));
    }

    return this;
  };

  /**
   * Returns whether or not the tree should paint its root node or paint the direct child nodes to the VIEW without rendering their containing root. Default: jsx3.Boolean.TRUE
   * @return {int} one of jsx3.Boolean.TRUE or jsx3.Boolean.FALSE
   */
  Tree_prototype.getRoot = function() {
    return (this.jsxuseroot != null) ? this.jsxuseroot : jsx3.Boolean.TRUE;
  };

  /**
   * Sets whether or not the tree should paint its root node or paint the direct child nodes to the VIEW without rendering their containing root;
   * @param bBoolean {int} one of jsx3.Boolean.TRUE or jsx3.Boolean.FALSE
   * @return {jsx3.gui.Tree} this object
   */
  Tree_prototype.setRoot = function(bBoolean) {
    this.jsxuseroot = bBoolean;
    return this;
  };

  /**
   * Returns the Icon to use for items in the tree. Default: jsx3.gui.Tree.ICON
   * @return {String}
   */
  Tree_prototype.getIcon = function() {
    return (this.jsxicon != null) ? this.jsxicon : Tree.ICON;
  };

  /**
   * Sets the Icon to use for items in the tree; returns a ref to self
   * @param strURL {String} URL for icon to use
   * @return {jsx3.gui.Tree} this object
   */
  Tree_prototype.setIcon = function(strURL) {
    this.jsxicon = strURL;
    return this;
  };

  /**
   * Returns the Icon to use when a node is in an open state. Default: jsx3.gui.Tree.ICONMINUS
   * @return {String} URL for icon to use when given tree node is toggled to closed; if null, value is reset to use URL referenced by jsx3.gui.Tree.ICONBOOKCLOSED
   */
  Tree_prototype.getIconMinus = function() {
    return (this.jsxiconminus != null) ? this.jsxiconminus : Tree.ICONMINUS;
  };

  /**
   * Sets the Icon to use when a node is in an open state.
   * @param strURL {String} URL for icon to use when given tree node is toggled to closed; if null, value is reset to use URL referenced by jsx3.gui.Tree.ICONBOOKCLOSED
   * @return {jsx3.gui.Tree} this object
   */
  Tree_prototype.setIconMinus = function(strURL) {
    this.jsxiconminus = strURL;
    return this;
  };

  /**
   * Returns the Icon to use when the given tree node is in an closed state. Default: jsx3.gui.Tree.ICONPLUS
   * @return {String} URL for icon to use
   */
  Tree_prototype.getIconPlus = function() {
    return (this.jsxiconplus != null) ? this.jsxiconplus : Tree.ICONPLUS;
  };

  /**
   * Sets the Icon to use when the given tree node is in an closed state
   * @param strURL {String} URL for icon to use when given tree node is toggled to open; if null, value is reset to use URL referenced by jsx3.gui.Tree.ICONBOOKOPEN
   * @return {jsx3.gui.Tree} this object
   */
  Tree_prototype.setIconPlus = function(strURL) {
    this.jsxiconplus = strURL;
    return this;
  };

  /**
   * Returns handle to on-screen HTML object
   * @param strId {String} unique id for node that is currently selected in source XML document
   * @return {object} currently selected div
   * @private
   * @jsxobf-clobber
   */
  Tree_prototype._getFocusItem = function(strId) {
    var doc = this.getDocument();
    return doc != null ? doc.getElementById(this.getId() + "_" + strId) : null;
  };

  /**
   * called when user tabs forward in the app and gives focus to the tree; finds item in tree to give focus to
   * @private
   */
  Tree_prototype._ebFocus = function(objEvent, objGUI) {
    if (objGUI != objEvent.srcElement())
      return;

    var value = this._getSelectedIds()[0];
    if (value) {
      this._focusRecord(value);
    } else {
      var firstRecord = this.getRendered(objGUI).childNodes[0];
      if (firstRecord != null)
        this._focusRecord(firstRecord);
    }
  };

  /**
   * default function that is called whenever a click event occurs within the tree's on-screen view;
   * @param objGUI {Object} GUI object that received the click event
   * @private
   */
  Tree_prototype._ebClick = function(objEvent, objGUI) {
    if (! objEvent.leftButton()) return;

    // get handle to on-screen element that began the click if not passed
    objGUI = objEvent.srcElement();
    var rootGUI = this.getRendered(objGUI);

    while (jsx3.util.strEmpty(objGUI.getAttribute("jsxtype")) && objGUI != rootGUI)
      objGUI = objGUI.parentNode;

    if (objGUI.getAttribute("jsxtype") != null) {
      if (objGUI.getAttribute("jsxtype") == "plusminus") {
        // toggle the item open/close
        this._togItem(objEvent, objGUI.parentNode.parentNode.getAttribute("jsxid"));
      } else if (objGUI.getAttribute("jsxtype") == "text" || objGUI.getAttribute("jsxtype") == "icon") {
        var id = objGUI.parentNode.parentNode.getAttribute("jsxid");

        var lastRecordId = this._getFocusedRecordId();
        // NOTE: do this before _selRecord() so that subscribeLoseFocus() bubbles before tree value changes
        this._focusRecord(objGUI.parentNode.parentNode);

        // HACK: IE can get confused and assume that objGUI is a fragment. If this occurs, re-resolve objGUI via standard lookup
        if (!objGUI.parentNode)
          objGUI = this._getFocusItem(id).childNodes[0].childNodes[2];

        if (this.isRecordSelectable(id)) {
          // fire the selection event for the given record matching the given id
          if (objEvent.shiftKey() && this.getMultiSelect() == Tree.MULTI) {
            // need to do range select from last (focus? selection?)
            if (lastRecordId) {
              this.revealRecord(lastRecordId);
              this._doRangeSelection(objEvent, lastRecordId, id);
            } else {
              this._selRecord(objEvent, id, false, true);
            }
          } else {
            var bCtrl = jsx3.gui.isMouseEventModKey(objEvent);
            if (bCtrl || ! this._isRecordSelected(id))
              this._selRecord(objEvent, id, bCtrl, bCtrl);
          }
        }
      } else {
        // user clicked on the tree, but not on an item; give focus back to the given item
        this._focusRecord(this._getSelectedIds()[0]);
      }
    } else {
      // user clicked on the tree, but not on an item; give focus back to the given item
      this._focusRecord(this._getSelectedIds()[0]);
    }
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._getFocusedRecordId = function() {
    if (this._jsxfocusedrecordid != null)
      return this._jsxfocusedrecordid;

    // If no focus but only one record is selected, then treat that as the focused record
    var ids = this._getSelectedIds();
    if (ids.length == 1) return ids[0];

    // Otherwise no focus state
    return null;
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._doRangeSelection = function(objEvent, strFromId, strToId) {
    var previousValue = this.getValue();

    var bFound = false;
    var bSelect = !jsx3.gui.isMouseEventModKey(objEvent) || ! this._isRecordSelected(strToId);
    var toSelect = [strFromId];

    var nextItem = strFromId;
    while ((nextItem = this._getNextVisibleRecordId(nextItem)) != null) {
      toSelect.push(nextItem);
      if (nextItem == strToId) {
        bFound = true;
        break;
      }
    }

    if (! bFound) {
      toSelect = [strFromId];
      nextItem = strFromId;
      while ((nextItem = this._getPreviousVisibleRecordId(nextItem)) != null) {
        toSelect.push(nextItem);
        if (nextItem == strToId) {
          bFound = true;
          break;
        }
      }

      if (! bFound) {
        return;
      }
    }

    // Track the ids that are being selected so that the event can report the proper new selection. This is
    // necessary because we take the short cut of clearing the entire selected in the next step.
    var newlySelected = [];
    for (var i = 0; i < toSelect.length; i++) {
      var bSelected = this._isRecordSelected(toSelect[i]);
      if (! bSelected)
        newlySelected.push(toSelect[i]);
    }

    if (! jsx3.gui.isMouseEventModKey(objEvent))
      this._mvDeselectAll();

    for (var i = 0; i < toSelect.length; i++) {
      var id = toSelect[i];
      var bSelected = this._isRecordSelected(id);
      if (bSelect || bSelected) {
        this._selRecord(null, id, true, (!bSelect && bSelected), true);
      }
    }

/* @JSC :: begin DEP */
    if (bSelect)
      this.doEvent(Interactive.SELECT, {objEVENT:objEvent, strRECORDID:newlySelected[0], strRECORDIDS:newlySelected});
/* @JSC :: end */

    this.doEvent(Interactive.CHANGE, {objEVENT:objEvent, preVALUE: previousValue, newVALUE:this.getValue(), _gipp:1});
  };

  /**
   * Returns whether or not the given record can be selected in the VIEW
   * @param strRecordId {String} jsxid for CDF item
   * @return {boolean}
   * @private
   */
  Tree_prototype.isRecordSelectable = function(strRecordId) {
    return this._cdfav(this.getRecordNode(strRecordId), "unselectable") != "1";
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._isRecordSelected = function(strRecordId) {
    return this._cdfav(this.getRecordNode(strRecordId), "selected") == "1";
  };

  /**
   * generic callback that can be used to create a less-generic drag item when dragging from a control
   * @param objGUI {Object} on-screen, HTML object that was just 'moused down' on by the
   *          user
   * @param strJSXName {String} JSX 'name' property (i.e., 'this.getName()') for the JSX object
   *          whose on-screen instance contains the HTML element about to be dragged
   * @param strDragType {String} the type of element being dragged. For example, a given JSXTable
   *          may contain any number of 'dragabble' elements. Each of these may have a type
   *          as well as an id to uniquely distinguish it from other elements in the given JSX item
   * @param strDragItemId {String} the id for the html element about to be dragged. If this parameter
   *          isn't blank/null/empty, it reflects the unique node id for the element
   *          as defined by the source xml
   * @return {String} HTML content that goes in the draggable icon that follows the mouse
   * @package
   */
  Tree.getDragIcon = function(objGUI, strJSXName, strDragType, strDragItemId) {
    return  "<div id='JSX' class='jsx30tree_dragicon' style='" +
            html.getCSSOpacity(.75) + "'>" +
            html.getOuterHTML(objGUI.parentNode.childNodes[1]) +
            html.getOuterHTML(objGUI)  + "</div>";
  };

  /**
   * toggles the open/closed state for a node on the tree; updates both MODEL and VIEW; if the tree is not yet
   *          painted and the open state for a node needs to be set, call: [tree instance].insertRecordProperty(@strId,@strPropName,@strPropValue,false);
   *          if there is a VIEW for the item, the 'ontoggle' event will be fired; if the developer has bound an ontoggle script
   *          (e.g., [treeinstance].setEvent("var a=1;",jsx3.gui.Interactive.TOGGLE);), this script will have contextual access to the variables:
   *          objGUI: object reference to the on-screen DHTML object for the node just toggled; objRECORD: object reference for the node
   *          in the XML Cache; strID: The jsxid property(as a string) for the node object; bOPEN: whether to item was toggled open (true) or closed (false).
   *          Returns a reference to self to facilitate method chaining
   * @param strRecordId {String} unique id for the given record (the 'jsxid' attribute on the given record node)
   * @param bOpen {boolean} if null, the open state will be toggled; otherwise, true will expand the node to display its childre; false, vice versa
   * @return {jsx3.gui.Tree} this object
   */
  Tree_prototype.toggleItem = function(strRecordId, bOpen) {
    var objRecord = this.getRecordNode(strRecordId);
    var objGUI = this._getFocusItem(strRecordId);
    if (objGUI != null) {
      this._showHideBranch(objRecord, objGUI, bOpen);
    }
    return this;
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._togItem = function(objEvent, strRecordId, bOpen, fctOnDone) {
    var objRecord = this.getRecordNode(strRecordId);
    var objGUI = this._getFocusItem(strRecordId);

    if (objGUI != null) {
      var newState = null;
      if (objRecord.getAttribute("jsxlazy") == "1" && this._cdfav(objRecord, "open") != "1" &&
          (bOpen == null || bOpen === true)) {

        html.updateCSSOpacity(objGUI.childNodes[0].childNodes[0], 0.50);

        jsx3.sleep(function() {
          if (this.getParent() == null) return;

          var evtRet = this.doEvent(Interactive.DATA, {objXML:this.getXML(), objNODE:objRecord});

          if (evtRet && typeof(evtRet) == "object") {
            if (evtRet.bCLEAR)
              this._cdfav(objRecord, "lazy", null);

            if (evtRet.arrNODES != null) {
              objRecord.removeChildren();
              for (var i = 0; i < evtRet.arrNODES.length; i++)
                objRecord.appendChild(evtRet.arrNODES[i]);
            }
          } else {
            this._cdfav(objRecord, "lazy", null);
          }

          this.redrawRecord(strRecordId, jsx3.xml.CDF.UPDATE);

          if (fctOnDone != null)
            fctOnDone();
        }, null, this);

        this._cdfav(objRecord, "open", "1");
        newState = true;
      } else {
        var doAll = jsx3.gui.isMouseEventModKey(objEvent);
        newState = this._showHideBranch(objRecord, objGUI, bOpen, doAll);
      }

      // fire the jsxtoggle event for the tree; the user will have contextual handles to
      this.doEvent(Interactive.TOGGLE, {objEVENT:objEvent, strRECORDID:strRecordId, objRECORD:objRecord, bOPEN:newState, _gipp:1});
    }
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._showHideBranch = function(objRecord, objGUI, bOpen, bDoAll) {
    var bOpenNow = this._cdfav(objRecord, "open") == "1";
    if (bOpen == null) bOpen = !bOpenNow;
    if (bOpenNow == bOpen) return bOpen;

    if (bOpen) {
      objGUI.childNodes[0].childNodes[0].src = this.getUriResolver().resolveURI(this.getIconMinus());
      objGUI.childNodes[1].style.display = "block";
      this._cdfav(objRecord, "open", "1");
    } else {
      objGUI.childNodes[0].childNodes[0].src = this.getUriResolver().resolveURI(this.getIconPlus());
      objGUI.childNodes[1].style.display = "none";
      this._cdfav(objRecord, "open", null);
    }

    if (bDoAll) {
      for (var i = objRecord.selectNodeIterator(this._cdfan("children")); i.hasNext(); ) {
        var n = i.next();
        if (n.getChildIterator().hasNext()) {
          var g = this._getFocusItem(this._cdfav(n, "id"));
          if (g)
            this._showHideBranch(n, g, bOpen, true);
        }
      }
    }

    //return the open state to the calling method (in case it was unknown)
    return bOpen;
  };

  /**
   * starts the drag for the tree control. v3.0 assumes all trees implement this; user merely calls: [object].setCanDrag(1)
   * @private
   */
  Tree_prototype._ebMouseDown = function(objEvent, objGUI) {
    if (this.getCanDrag() == 1 && !objEvent.rightButton()) {
      var objSource = objEvent.srcElement();
      if (objSource == null) return;

      var bSwallow = false;

      if (jsx3.util.strEmpty(objSource.getAttribute("jsxtype")))
        objSource = objSource.parentNode;

      //only the text span has the correct JSXDragId
      if (objSource.getAttribute("jsxtype") == "icon") {
        bSwallow = true;
        objSource = objSource.parentNode.childNodes[2];
      }

      if (objSource.getAttribute("jsxtype") == "text") {
        if (! this.isRecordSelectable(objSource.getAttribute("JSXDragId"))) return;

        var me = this;
        objEvent.persistEvent();
        Tree._DRAGTIMEOUT = window.setTimeout(function() {
          //call interface method used by common classes to generate the drag icon and begin the drag
          Tree._DRAGTIMEOUT = null;
          Event.unsubscribe(Event.MOUSEUP, me, "_abortDrag");
          if (me.getParent() != null) {
            me._ebClick(objEvent, objGUI);
            me.doDrag(objEvent, objSource, Tree.getDragIcon, {strDRAGIDS:me._getSelectedIds()});
          }
        }, Tree._DRAGDELAY);
        Event.subscribe(Event.MOUSEUP, this, "_abortDrag");

        if (bSwallow) {
          Event.publish(objEvent);
          objEvent.cancelAll(); // Fx doesn't like drag originating from an image
        }
      }
    }
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._abortDrag = function(objEvent) {
    Event.unsubscribe(Event.MOUSEUP, this, "_abortDrag");
    if (Tree._DRAGTIMEOUT) window.clearTimeout(Tree._DRAGTIMEOUT);
  };

  /**
   * accepts a possible drop event for the control as well as context-sensitive menu
   * @private
   */
  Tree_prototype._ebMouseUp = function(objEvent, objGUI) {
    //get the source element (what was moused up on)
    var objSource = objEvent.srcElement();
    if (objSource == null) return;

    var strType = objSource.getAttribute("jsxtype");
    if (jsx3.util.strEmpty(strType)) objSource = objSource.parentNode;
    strType = objSource.getAttribute("jsxtype");

    //is this a spyglass or context-menu event
    if (this.getCanDrop() == 1 && jsx3.EventHelp.isDragging()) {
      var objArrow = this._getDropIcon(objEvent);
      var bInsertBefore = objArrow.getAttribute("dropverb") == "insertbefore";
      var strRecordId = objArrow.getAttribute("rowcontext");

      if (strRecordId != null) {
        //TO DO: GREP all instances of "JSX_GENERIC"; replace with "JSX_CDF"; this is the designation that lets all classes know the data format for the item being dragged/dropped
        //constants that can be referenced by any bound jsxondrop/jsxonctrldrop event handler code
        var objDragSource = jsx3.EventHelp.JSXID;      //source jsx gui object; (i.e., another jsx3.gui.Tree instance)
        var strDragId = jsx3.EventHelp.getDragId();      //drag id for the element being dragged
        var strDragIds = jsx3.EventHelp.getDragIds();
        var strDRAGTYPE = jsx3.EventHelp.DRAGTYPE;      //drag type (equivalent to MIME) for the element being dragged
        var bCtrl = jsx3.gui.isMouseEventModKey(objEvent);

        if (objDragSource == null) return;

        var bAllowAdopt = objDragSource.doEvent(Interactive.ADOPT,
            {objEVENT:objEvent, strRECORDID:strDragId, strRECORDIDS:strDragIds, objTARGET:this, bCONTROL:bCtrl});

        // force user to turn off drag/drop?
        var context = {objEVENT:objEvent, strRECORDID:strRecordId, objSOURCE:objDragSource, strDRAGID:strDragId,
            strDRAGIDS:strDragIds, strDRAGTYPE:strDRAGTYPE, bINSERTBEFORE:bInsertBefore, bALLOWADOPT:(bAllowAdopt !== false)};
        var bContinue = this.doEvent(bCtrl ? Interactive.CTRL_DROP : Interactive.DROP, context);

        // do an automatic adoption of the record, but only if the record is of the CDF type as any other format would cause an error
        if (bAllowAdopt != false && bContinue !== false && objDragSource.instanceOf(jsx3.xml.CDF)) {
          for (var i = 0; i < strDragIds.length; i++) {
            if (bInsertBefore)
              this.adoptRecordBefore(objDragSource, strDragIds[i], strRecordId);
            else
              this.adoptRecord(objDragSource, strDragIds[i], strRecordId);
          }

          this.revealRecord(strDragIds[0]);
        }
      }
    } else if ((strType == "text" || strType == "icon") && objEvent.rightButton() && this.getMenu()) {
      //persist the id of the CDF record that will become the new parent (the adopter id)
      var strRecordId = objSource.parentNode.parentNode.getAttribute("jsxid");

      //user right-moused-up over a node in the tree; show the context menu if there is one...
      var objMenu = this._getNodeRefField(this.getMenu());
      if (objMenu != null && this.isRecordSelectable(strRecordId)) {
        var vntResult = this.doEvent(Interactive.MENU, {objEVENT:objEvent, objMENU:objMenu, strRECORDID:strRecordId});
        if (vntResult !== false) {
          if (vntResult instanceof Object && vntResult.objMENU instanceof jsx3.gui.Menu)
            objMenu = vntResult.objMENU;
          // select record, i guess mouseup will somehow prevent click from happening
          var bUnion = objEvent.shiftKey() || jsx3.gui.isMouseEventModKey(objEvent);

          // Only select this record if it is not already selected. Otherwise, keep previous selection (possible
          // multi selection) and focus this record.
          if (this._isRecordSelected(strRecordId))
            this._focusRecord(strRecordId);
          else
            this._selRecord(objEvent, strRecordId, bUnion, bUnion);

          objMenu.showContextMenu(objEvent, this, strRecordId);
        }
      }
    }

    this._resetDropIcon(objEvent);
  };

  /**
   * fires when user hovers over an element in the tree; shows spyglass, toggles open/closed state, highlights drop zone
   * @private
   */
  Tree_prototype._ebMouseOver = function(objEvent, objTreeGUI) {
    //get the source element (the to element when its a mouseover event)
    var objSource = objEvent.toElement();
    if (objSource == null) return;

    var strType = objSource.getAttribute("jsxtype");

    if (strType == "text" && this.hasEvent(Interactive.SPYGLASS)) {
      // objGUI will be the <div> for the record moused over
      var objGUI = objSource;
      while (objGUI.getAttribute("jsxid") == null && objGUI != objTreeGUI)
        objGUI = objGUI.parentNode;

      if (objGUI == objTreeGUI) return;

      var strRecordId = objGUI.getAttribute("jsxid");

      //fire the spyglass
      this.applySpyStyle(objSource);

      var intLeft = objEvent.clientX() + jsx3.EventHelp.DEFAULTSPYLEFTOFFSET;
      var intTop = objEvent.clientY() + jsx3.EventHelp.DEFAULTSPYTOPOFFSET;

      objEvent.persistEvent(); // so that event properties are available after timeout
      var me = this;

      if (Tree.SPYTIMEOUT)
        window.clearTimeout(Tree.SPYTIMEOUT);

      Tree.SPYTIMEOUT = window.setTimeout(function(){
        Tree.SPYTIMEOUT = null;
        if (me.getParent() != null)
          me._doSpyDelay(objEvent, strRecordId, objSource, objGUI);
      }, jsx3.EventHelp.SPYDELAY);
    }
  };

  Tree_prototype._ebMouseMove = function(objEvent, objTreeGUI) {
    if (jsx3.EventHelp.isDragging() && this.getCanDrop() == 1) {
      var objSource = objEvent.srcElement();
      if (objSource == null) return;

      var strType = objSource.getAttribute("jsxtype");

      // objGUI will be the <div> for the record moused over
      var objGUI = objSource;
      while (objGUI.getAttribute("jsxid") == null && objGUI != objTreeGUI)
        objGUI = objGUI.parentNode;

      if (objGUI == objTreeGUI) return;

      var strRecordId = objGUI.getAttribute("jsxid");

      if (strType == "plusminus") {
        var isOpen = this._cdfav(this.getRecordNode(strRecordId), "open") == "1";
        if (! isOpen && ! Tree.TOGGLETIMEOUT) {
          var me = this;
          objEvent.persistEvent(); // for timeout
          Tree.TOGGLETIMEOUT = window.setTimeout(function(){
            delete Tree.TOGGLETIMEOUT;
            if (me.getParent() != null)
              me._togItem(objEvent, strRecordId);
          }, Tree.TOGGLEDELAY);
        }
      } else if (strType == "text") {
        //initialize variables used by drop
        var objDragSource = jsx3.EventHelp.getDragSource();      //source jsx gui object; (i.e., another jsx3.gui.Tree instance)
        var strDragType = jsx3.EventHelp.getDragType();      //drag type (equivalent to MIME) for the element being dragged

        var objPRow = this.getAbsolutePosition(objTreeGUI, objGUI.childNodes[0]);
        var bInsert = objPRow.H/3 > objEvent.getOffsetY();
        
        //this is the before drop event; fire for the user and cancel if the user explicitly said to
        var bContinue = this.doEvent(Interactive.BEFORE_DROP,
            {objEVENT:objEvent, strRECORDID:strRecordId, objSOURCE:objDragSource, strDRAGID:jsx3.EventHelp.getDragId(),
             strDRAGIDS: jsx3.EventHelp.getDragIds(), strDRAGTYPE:strDragType, objGUI:objGUI, bINSERTBEFORE:bInsert});

        if (bContinue === false) {
          this._resetDropIcon(objGUI);
          return;
        }

        var objP = this.getAbsolutePosition(objTreeGUI, objGUI);
        var objArrow = this._getDropIcon(objTreeGUI);
        var objStyle = objArrow.style;

        //get how far the drop designator should indent
        var intIndent = objP.L;

        if (bInsert) {
          var objThisP = this.getAbsolutePosition(objTreeGUI, objTreeGUI);
          //this is an insertBefore
          objStyle.top = (objPRow.T - 4) + "px";
          objStyle.width = Math.max(0, objThisP.W - intIndent - 8) + "px";
          objStyle.height = "7px";
          objStyle.backgroundImage = "url(" + Tree.INSERT_BEFORE_IMG + ")";
          objArrow.setAttribute("dropverb", "insertbefore");
        } else {
          //this is an append
          intIndent += 26;
          objStyle.width = "12px";
          objStyle.height = "12px";
          objStyle.top = (objPRow.T - 10 + objPRow.H) + "px";
          objStyle.backgroundImage = "url(" + Tree.APPEND_IMG + ")";
          objArrow.setAttribute("dropverb", "append");
        }

//        jsx3.log("id:" + strRecordId + " rowH:" + objP.H + " evtY:" + objEvent.getOffsetY() + ", left:" + intIndent +
//            " verb:" + objArrow.getAttribute("dropverb"));

        objStyle.left = intIndent + "px";
        objArrow.setAttribute("rowcontext", strRecordId);
        objStyle.display = "block";
      }
    }
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._getDropIcon = function(objGUI) {
    return this.getRendered(objGUI).lastChild;
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._resetDropIcon = function(objGUI) {
    var objIcon = this._getDropIcon(objGUI);
    objIcon.style.display = "none";
    objIcon.removeAttribute("dropverb");
    objIcon.removeAttribute("rowcontext");
  };

  /**
   * called by 'window.setTimeout'; provides execution context for any spyglass event spawned within the '_ebMouseOver' method
   * @param objEvent {jsx3.gui.Event}
   * @param strRECORDID {String} id (CDF @jsxid property) for the record being spyglassed
   * @param objSource {Object} source element in the tree (the text label) that was hovered over and stylized in the VIEW to denote an impending spy event
   * @param objGUI {Object} view element corresponding to strRECORDID
   * @private
   * @jsxobf-clobber
   */
  Tree_prototype._doSpyDelay = function(objEvent, strRECORDID, objSource, objGUI) {
    this.removeSpyStyle(objSource);
    // no objEVENT in spy events because of timeout
    var eventResult = this.doEvent(Interactive.SPYGLASS, {objEVENT:objEvent, strRECORDID:strRECORDID});

    if (eventResult)
      this.showSpy(eventResult, objEvent);
  };

  /**
   * called: 1) during drag/drop: stops time-delayed toggle event from firing; calls canceldrop; 2) cancels spyglass if one was set to fire on a delay
   * @private
   */
  Tree_prototype._ebMouseOut = function(objEvent, objTreeGUI) {
    var bFake = objEvent.isFakeOut(objTreeGUI);

    var objSource = objEvent.fromElement();
    if (objSource == null) return;

    var strType = objSource.getAttribute("jsxtype");

    //is this a drop or spy event that we should cancel?
    if (!bFake && jsx3.EventHelp.isDragging() && this.getCanDrop() == 1) {
      this._resetDropIcon(objEvent);
      
      window.clearTimeout(Tree.TOGGLETIMEOUT);

      //constants that can be referenced by any bound
      var objSOURCE = jsx3.EventHelp.JSXID;      //source jsx gui object; (i.e., another jsx3.gui.Tree instance)
      var strDRAGTYPE = jsx3.EventHelp.DRAGTYPE;      //drag type for the element being dragged
      var strRECORDID = objSource.parentNode.parentNode.getAttribute("jsxid");
      var objGUI = objSource.parentNode.parentNode;  //view element corresponding to strRECORDID

      //this is the before drop event; fire for the user
      var bContinue = this.doEvent(Interactive.CANCEL_DROP,
          {objEVENT:objEvent, strRECORDID:strRECORDID, objSOURCE:objSOURCE, strDRAGID:jsx3.EventHelp.getDragId(),
           strDRAGIDS: jsx3.EventHelp.getDragIds(), strDRAGTYPE:strDRAGTYPE, objGUI:objGUI});
      
    } else if (strType == "text" && this.hasEvent(Interactive.SPYGLASS)) {
      var eElement = objEvent.toElement();
      if (!eElement || eElement.id != "_jsxspy") {
        //reset the cursor; clear the spyglass delay to stop it from firing
        jsx3.sleep(jsx3.gui.Interactive.hideSpy);

        this.removeSpyStyle(objSource);
        if (Tree.SPYTIMEOUT)
          window.clearTimeout(Tree.SPYTIMEOUT);
      }
    }
  };

  /**
   * called when user keys down while the tree's on-screen view has focus; called programmtically by the system; must be fired by a key down event in the tree
   * @private
   */
  Tree_prototype._ebKeyDown = function(objEvent, objTreeGUI) {
    // check for hot keys
    if (this.jsxsupermix(objEvent, objTreeGUI)) return;

    //initialize variables
    var intKeyCode = objEvent.keyCode();

    //get handle to the on-scren element that received the keydown event (this is the text label for the tree item)
    //item/caption/text (three levels)
    var objGUI = objEvent.srcElement().parentNode.parentNode;

    if (objGUI != null && objGUI.getAttribute("jsxid") != null) {
      //set the id for the item in the tree being acted upon
      var strId = objGUI.getAttribute("jsxid");

      if (intKeyCode >= Event.KEY_ARROW_LEFT && intKeyCode <= Event.KEY_ARROW_DOWN) {
        //get handle to the node in the source xml with focus
        var objNode = this.getRecordNode(strId);

        var bLazy = objNode.getAttribute("jsxlazy") == "1";
        //determine if a book and if the book is open
        if (bLazy || objNode.selectSingleNode(this._cdfan("children")) != null) {
          var bBook = true;
          var isOpen = this._cdfav(objNode, "open") == "1";
        } else {
          var bBook = false;
        }

        //navigate based on which key was pressed
        if (intKeyCode == Event.KEY_ARROW_LEFT) {
          //left arrow
          if (bBook && isOpen) {
            //just zip-close this item in the VIEW and in the DATAMODEL
            this._togItem(objEvent, strId, false);
          } else {
            this._doKeyDownPreviousRelative(objNode);
          }
        } else if (intKeyCode == Event.KEY_ARROW_UP) {
          //traverse the tree to find the first cousin, ancestor, etc that is available for selection
          this._doKeyDownPreviousRelative(objNode);
        } else if (intKeyCode == Event.KEY_ARROW_RIGHT) {
          //right arrow
          if (bLazy && !isOpen) {
            var me = this;
            this._togItem(objEvent, strId, true, function() {
              me._focusRecord(strId);
            });
          } else if (bBook && !isOpen) {
            //just zip-open this item in the VIEW and in the DATAMODEL
            this._togItem(objEvent, strId, true);
          } else {
            this._doKeyDownNextRelative(objNode);
          }
        } else if (intKeyCode == Event.KEY_ARROW_DOWN) {
          this._doKeyDownNextRelative(objNode);
        }

        //stop event bubbling
        objEvent.cancelAll();
      } else if (intKeyCode == Event.KEY_TAB) {
        if (objEvent.shiftKey()) {
          html.focusPrevious(this.getRendered(objTreeGUI), objEvent);
        } else {
          html.focusNext(this.getRendered(objTreeGUI), objEvent);
        }
      } else if (objEvent.spaceKey() || objEvent.enterKey()) {
        var bSel = this._isRecordSelected(strId);
        if (bSel && objEvent.enterKey()) {
          //if user enter-keys on an already-selected record, assume an execute event
          this._execRecord(objEvent/*, strId*/);
        } else {
          this._selRecord(objEvent, strId, jsx3.gui.isMouseEventModKey(objEvent) || objEvent.shiftKey(), true);
        }
        objEvent.cancelAll();
      }
    }
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._doKeyDownPreviousRelative = function(objNode) {
    var prevId = this._getPreviousVisibleRecordId(this._cdfav(objNode, "id"));
    if (prevId != null)
      this._focusRecord(prevId);
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._doKeyDownNextRelative = function(objNode) {
    var nextId = this._getNextVisibleRecordId(this._cdfav(objNode, "id"));
    if (nextId != null)
      this._focusRecord(nextId);
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._getPreviousVisibleRecordId = function(strRecordId) {
    var thisGUI = this._getFocusItem(strRecordId);

    if (thisGUI != null) {
      var prev = thisGUI.previousSibling;
      if (prev != null) {
        while (prev.childNodes[1].style.display == "block") {
          var newPrev = prev.childNodes[1].lastChild;
          if (newPrev == null) break;
          prev = newPrev;
        }
        return prev.getAttribute("jsxid");
      } else {
        return thisGUI.parentNode.parentNode.getAttribute("jsxid");
      }
    }
    return null;
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._getNextVisibleRecordId = function(strRecordId) {
    var thisGUI = this._getFocusItem(strRecordId);

    if (thisGUI != null) {
      if (thisGUI.childNodes[1].style.display == "block") {
        var firstChild = thisGUI.childNodes[1].firstChild;
        if (firstChild != null)
          return firstChild.getAttribute("jsxid");
      }
      var nextSib = thisGUI.nextSibling;
      if (nextSib != null) {
        return nextSib.getAttribute("jsxid");
      } else {
        var id = this.getId();
        var parent = thisGUI.parentNode.parentNode;
        while (parent != null && parent.id && parent.id.indexOf(id) == 0) {
          if (parent.nextSibling != null)
            return parent.nextSibling.getAttribute("jsxid");
          parent = parent.parentNode.parentNode;
        }
      }
    }
    return null;
  };

  /**
   * Executes any bound code for the record with id <code>strRecordId</code>. This method only invokes the
   * <code>EXECUTE</code> model event for this tree under the deprecated 3.0 model event protocol.
   * @param strRecordId {String} <code>jsxid</code> value for the record node (according to the CDF) to execute
   */
  Tree_prototype.executeRecord = function(strRecordId) {
    var objEvent = null;
/* @JSC :: begin DEP */
    // DEPRECATED: 3.0 event protocol
    objEvent = this.isOldEventProtocol();
/* @JSC :: end */
    this._execRecord(objEvent, strRecordId);
  };

  /** @private @jsxobf-clobber */
  Tree_prototype._execRecord = function(objEvent, strRecordId) {
    var strRecordIds = null;
    if (strRecordId == null)
      strRecordIds = this._getSelectedIds();
    else if (!jsx3.$A.is(strRecordId))
      strRecordIds = [strRecordId];
    else
      strRecordIds = strRecordId;

    for (var i = 0; i < strRecordIds.length; i++) {
      var id = strRecordIds[i];
      if (id == null || ! this.isRecordSelectable(id))
        continue;

      var objRecord = this.getRecordNode(id);
      var strScript = objRecord.getAttribute("jsxexecute");
      if (strScript) {
        var context = {strRECORDID:id};
/* @JSC :: begin DEP */
        context.objRECORD = objRecord;
/* @JSC :: end */
        if (objEvent instanceof jsx3.gui.Event)
          context.objEVENT = objEvent;

        this.eval(strScript, this._getEvtContext(context));
      }
    }

    if (objEvent)
      this.doEvent(Interactive.EXECUTE, {objEVENT: objEvent, objRECORD: this.getRecordNode(strRecordIds[0]),
          strRECORDIDS:strRecordIds, strRECORDID:strRecordIds[0]});
  };

  /**
   * @private
   */
  Tree_prototype._ebDoubleClick = function(objEvent, objGUI) {
    var strRecordId = null;
    var objTarget = objEvent.srcElement();

    if (objTarget != null && jsx3.util.strEmpty(objTarget.getAttribute("jsxtype")))
      objTarget = objTarget.parentNode;

    if (objTarget != null && objTarget.getAttribute("jsxtype") != null &&
        (objTarget.getAttribute("jsxtype") == "text" || objTarget.getAttribute("jsxtype") == "icon"))
      strRecordId = objTarget.parentNode.parentNode.getAttribute("jsxid");

    if (strRecordId)
      this._execRecord(objEvent/*, strRecordId*/);
  };

  Tree.BRIDGE_EVENTS = {};
  Tree.BRIDGE_EVENTS[Event.CLICK] = true;
  Tree.BRIDGE_EVENTS[Event.DOUBLECLICK] = true;
  Tree.BRIDGE_EVENTS[Event.MOUSEOVER] = true;
  Tree.BRIDGE_EVENTS[Event.MOUSEOUT] = true;
  Tree.BRIDGE_EVENTS[Event.MOUSEUP] = true;
  Tree.BRIDGE_EVENTS[Event.MOUSEDOWN] = true;
  Tree.BRIDGE_EVENTS[Event.MOUSEMOVE] = true;
  Tree.BRIDGE_EVENTS[Event.KEYDOWN] = true;
  Tree.BRIDGE_EVENTS[Event.FOCUS] = true;

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @private
   */
  Tree_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 3);
  };

  /**
   * Creates the box model/profile for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @private
   */
  Tree_prototype.createBoxProfile = function(objImplicit) {
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
    var bor, pad;
    if((bor = this.getBorder()) != null && bor != "") objImplicit.border = bor;
    if((pad = this.getPadding()) != null && pad != "") objImplicit.padding = pad;

    //return the explicit object (e.g., the box profile)
    return new jsx3.gui.Painted.Box(objImplicit);
  };

  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  Tree_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered (this will be recalled, but is necessary for doTransform as xml/xsl resources can be stored as dynamic properties
    this.applyDynamicProperties();

    //save the id -- i'll need it a few times
    var strId = this.getId();

    //get tree content via merge
    var strContent = this.doTransform();

    //if no data returned from the merge, insert the default message for the user
    if (! strContent) strContent = this.getNoDataMessage();

    //append a 1x1 gif to the end of the rendered content; this will always have a tabindex, so it can capture focus events for the tree and route to the appropriate node in the tree whenever the tree recieves focus
    strContent += '<img alt="" src="' + jsx3.gui.Block.SPACE + '"' + this.renderHandler(Event.FOCUS, "_ebFocus") +
        ' style="position:absolute;left:0px;top:0px;width:1px;height:1px;" ' + this.paintIndex() +
        '/>';

    //render the events for the tree
    var strEvents = "";
    if (this.getEnabled() == 1)
      strEvents = this.renderHandlers(Tree.BRIDGE_EVENTS, 0);

    //get custom 'VIEW' properties(custom props to add to the rended HTML tag)
    var strProps = this.renderAttributes(null, true);

    //render the outer-most box
    var b1 = this.getBoxProfile(true);
    b1.setAttributes(this.paintTip() + strEvents + ' id="' + strId + '"' + this.paintLabel() + ' class="jsx30tree" ' + strProps);
    b1.setStyles(this.paintFontSize() + this.paintBackgroundColor() + this.paintBackground() + this.paintColor() + this.paintOverflow() + this.paintFontName() + this.paintFontWeight() + this.paintCursor() + this.paintVisibility() + this.paintDisplay() + this.paintCSSOverride());

    return b1.paint().join(strContent + '<div class="jsx30tree_drop_icon">&#160;</div>');
  };

  /**
   * ensures that the superclass method is passed the appropriate parameter object
   * @param strFragmentId {String} if != null, only generate the html for the matching node
   * @package
   */
  Tree_prototype.doTransform = function(strFragmentId) {
    //create parameter object (a name/value hash) to pass to the XSL for transformation
    var objP = {};
    var bFrag = strFragmentId != null;
    if (!bFrag) {
      var root = this.getXML();
      if (root) {
        var myKids = root.getChildIterator();
        if (myKids.hasNext()) strFragmentId = this._cdfav(myKids.next(), "id");
      }
    }

    var objResolver = this.getUriResolver();

    var icon = this.getIcon(), iconMinus = this.getIconMinus(), iconPlus = this.getIconPlus();
    
    if (strFragmentId != null) objP.jsxrootid = strFragmentId;
    objP.jsxtabindex = (this.getIndex() == null) ? 0 : this.getIndex();
    objP.jsxselectedimage = Tree.SELECTEDIMAGE;
    objP.jsxicon = icon ? objResolver.resolveURI(icon) : "";
    objP.jsxiconminus = iconMinus ? objResolver.resolveURI(iconMinus) : "";
    objP.jsxiconplus = iconPlus ? objResolver.resolveURI(iconPlus) : "";
    objP.jsxiconminusalt = this._getLocaleProp("col", Tree);
    objP.jsxiconplusalt = this._getLocaleProp("exp", Tree);
    objP.jsxtransparentimage = jsx3.gui.Block.SPACE;
    objP.jsxdragtype = "JSX_GENERIC";
    objP.jsxid = this.getId();
    objP.jsxuseroot = (bFrag) ? 1 : this.getRoot();
    objP.jsxfragment = (bFrag) ? 1 : 0;
    objP.jsxpath = jsx3.getEnv("jsxabspath");
    objP.jsxpathapps = jsx3.getEnv("jsxhomepath");
    objP.jsxpathprefix = this.getUriResolver().getUriPrefix();
    objP.jsxappprefix = this.getServer().getUriPrefix();

    //loop to override default parameter values with user's custom values as well as add additional paramters specified by the user
    var objParams = this.getXSLParams();
    for (var p in objParams) objP[p] = objParams[p];

    return this._removeFxWrapper(this.jsxsupermix(objP));
  };

  Tree_prototype.onXmlBinding = function(objEvent) {
    this.jsxsupermix(objEvent);
    this.repaint();
  };
  
  /**
   * Returns the text/HTML to display on-screen when the xml/xsl transformation for this object results in a null or empty result set
   * @return {String} text/HTML
   */
  Tree_prototype.getNoDataMessage = function() {
    return (this.jsxnodata == null) ? Tree.DEFAULTNODATAMSG : this.jsxnodata;
  };

  /**
   * no children allowed
   * @return {boolean}
   * @package
   */
  Tree_prototype.onSetChild = function(child) {
    return !(child instanceof jsx3.gui.Painted);
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Tree.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.Tree
 * @see jsx3.gui.Tree
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Tree", -, null, function(){});
 */
jsx3.Tree = jsx3.gui.Tree;

/* @JSC :: end */
