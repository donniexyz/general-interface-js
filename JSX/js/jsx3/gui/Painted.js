/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _jsxdynamic _jsxtempdynamic _doLoad
// @jsxobf-clobber  _expl _children

/**
 * Abstract superclass of model objects that are painted to screen.
 *
 * @since 3.1
 */
jsx3.Class.defineClass("jsx3.gui.Painted", jsx3.app.Model, null, function(Painted, Painted_prototype) {

  var html = jsx3.html;

  /**
   * {Object<String, boolean>} {NN: false, EE: false, SS: false, WW: false, MM: false}
   * @private
   */
  Painted.MASK_NO_EDIT = {NN: false, EE: false, SS: false, WW: false, MM: false};

  /**
   * {Object<String, boolean>} {NN: true, EE: true, SS: true, WW: true, MM: true}
   * @private
   */
  Painted.MASK_ALL_EDIT = {NN: true, EE: true, SS: true, WW: true, MM: true};

  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   */
  Painted_prototype.init = function(strName) {
    //call constructor for super class (the super expects the name of the object and the function that it is an instance of)
    this.jsxsuper(strName);
  };

  /**
   * Returns the absolute positioning of the object's on-screen view in relation to JSXROOT (whose left/top is 0/0).
   *            Returns information as a JavaScript object with properties, L, T, W, H
   *            of @objRoot is null, the on-screen view for JSXROOT is used as the object reference
   * @param objRoot {HTMLElement} object reference to IE DOM object (i.e., div, span, etc); if null is passed, the first div child of JSXROOT's on-screen representation will be used
   * @param objGUI {HTMLElement} object reference to item to get absolute position for&#8212;as opposed to this instance (useful for determining placement of html objects contained by JSX objects, but not part of the actual JSX DOM)
   * @return {Object<String, int>} JScript object with properties: L, T, W, H (corresponding to left, top width, height)
   */
  Painted_prototype.getAbsolutePosition = function(objRoot, objGUI) {
    //make sure object has an on-screen view
    if (objGUI == null) objGUI = this.getRendered(objRoot);
    if (objGUI == null) return {L:0, T:0, W:0, H:0};
    if (objRoot == null) objRoot = this.getAncestorRootBlock().getRendered(objGUI);

    return html.getRelativePosition(objRoot, objGUI);
  };

  /**
   * Sets a property on the object that when the object is rendered on-screen, the HTML tag will be assigned the given name/value pair as a tag attribute
   * @param strName {String} the name of the property/attribute
   * @param strValue {String} the value for the property; may not contain double-quotes; escape via jsx3.util.strEscapeHTML if necessary or use combinations of single-quotes and escaped single-quotes
   * @return {jsx3.gui.Painted} this object (this)
   */
  Painted_prototype.setAttribute = function(strName, strValue) {
    //add the new event object to the events array for the object
    this.getAttributes()[strName] = strValue;

    //return reference to self to facilitate chaining
    return this;
  };

  /**
   * Returns the value for the custom attribute with the given name.
   * @param strName {String} the name of the attribute.
   * @return {String} the value of the attribute or <code>undefined</code> if no such attribute exists.
   */
  Painted_prototype.getAttribute = function(strName) {
    //return the entire array of events bound to this object instance
    return this.getAttributes()[strName];
  };

  /**
   * Returns handle to the JavaScript Object Array containing all events for the JSX GUI object;
   *            NOTE: This object will contain zero or more JavaScript Objects with the following Properties: script, type, system
   * @return {Object<String, String>}
   */
  Painted_prototype.getAttributes = function() {
    //return the entire array of events bound to this object instance
    if (this.jsxcustom == null) this.jsxcustom = {};
    return this.jsxcustom;
  };

  /**
   * Renders a concatenated string of all custom attribute names and values. Useful during paint(). The string starts
   * with a space.
   * @param objExclude {Array<String>|Object} array or map of all attributes (i.e., id, class, etc)
   *    that should not be rendered
   * @param bSkipEvents {boolean} if true will not render any attributes that are native event handlers. These
   *    attributes should be printed with Interactive.renderHandlers.
   * @return {String} e.g., <code>' class="fred" owner="jimbo"'</code>
   * @private
   */
  Painted_prototype.renderAttributes = function(objExclude, bSkipEvents) {
    //declare object if it doesn't exists
    var str = [];
    if (this.jsxcustom != null) {
      var Interactive = jsx3.gui.Interactive;
      var bInter = Interactive && this.instanceOf(Interactive);
      // loop to string together the properties
      for (var p in this.jsxcustom) {
        var bSkip =
            (objExclude != null &&
              ((jsx3.$A.is(objExclude) && jsx3.util.arrIndexOf(objExclude, p) >= 0) || (objExclude[p]))) ||
            (bSkipEvents && bInter && Interactive.isBridgeEventHandler(p));

        var attrValue = this.jsxcustom[p];
        if (!bSkip && attrValue != null)
          str[str.length] = ' ' + p + '="' + attrValue.replace(/"/g, "&quot;") + '"';
      }
    }
    return str.join("");
  };

  /**
   * removes the specific custom property bound to this object; returns a reference to self (this) to facilitate method chaining
   * @param strName {String} the name of the custom property to remove
   * @return {jsx3.gui.Painted} this object
   */
  Painted_prototype.removeAttribute = function(strName) {
    delete this.getAttributes()[strName];
    return this;
  };

  /**
   * removes all events bound to this object; NOTE: The object must still be painted/repainted for its corresponding on-screen view to be likewise updated; returns a reference to self (this) to facilitate method chaining
   * @return {jsx3.gui.Painted} this object
   */
  Painted_prototype.removeAttributes = function() {
    //reset the events array, so this object doesn't have any
    delete this.jsxcustom;

    //return reference to self
    return this;
  };

  /**
   * gives focus to the on-screen VIEW for the element; returns a handle to the html/dhtml element as exposed by the native browser
   * @return {HTMLElement}
   */
  Painted_prototype.focus = function() {
    //give focus to persistent on-screen anchor
    var objGUI = this.getRendered();
    // Mozilla (not Fx) seems to define focus() only on elements with a tabindex?
    if (objGUI) html.focus(objGUI);
    return objGUI;
  };

  /**
   * Returns resizeMask property as an object array, defining what actions are available
   *            to the resizeMask for the given control (resize horizontally/vertically; is moveable, etc.)
   * @return {Object<String, int>} object array with boolean values for the following properties: NN,SS,EE,WW,MM
   * @package
   */
  Painted_prototype.getMaskProperties = function() {
    return Painted.MASK_NO_EDIT;
  };

  /**
   * Returns handle/reference to the JSX GUI Object's on-screen counterpart&#8212;basically a handle to a DHTML object such as a DIV, SPAN, etc
   * @param objGUI {Object|jsx3.gui.Event} either the HTML document containing the rendered object or an HTML element in that document.
   *   This argument is optional but improves the efficiency of this method if provided.
   * @return {HTMLElement} IE DHTML object
   */
  Painted_prototype.getRendered = function(objGUI) {
    var doc = null;
    if (objGUI && objGUI instanceof jsx3.gui.Event) {
        if (objGUI.srcElement())
          doc = objGUI.srcElement().ownerDocument;
    } else if (objGUI && typeof(objGUI) == "object") {
      // NOTE: try ownerDocument first because SVGElement implements getElementById but throws an error
      doc = objGUI.ownerDocument || (objGUI.getElementById ? objGUI : null);
    }
    if (doc == null) doc = this.getDocument();
    return doc != null ? doc.getElementById(this.getId()) : null;
  };

  /**
   * @package
   */
  Painted_prototype.containsHtmlElement = function(objElement) {
    var r = this.getRendered(objElement);
    if (r) {
      while (objElement != null) {
        if (r == objElement)
          return true;
        objElement = objElement.parentNode;
      }
    }
    return false;
  };

  /**
   * @package
   */
  Painted_prototype.getDocument = function() {
    // most efficient way of getting document
    var parent = this;
    while (parent != null) {
      if (jsx3.gui.Window && parent instanceof jsx3.gui.Window)
        return parent.getDocument();
      else if (parent._jsxserver != null)
        return parent._jsxserver.getRootDocument();

      parent = parent.getParent();
    }
    return null;
  };

  /** @private @jsxobf-clobber */
  Painted_prototype.getAncestorRootBlock = function() {
    var parent = this;
    while (parent != null) {
      if (jsx3.gui.Window && parent instanceof jsx3.gui.Window)
        return parent.getRootBlock();
      else if (parent._jsxserver != null)
        return parent._jsxserver.getRootBlock();

      parent = parent.getParent();
    }
    return null;
  };

  /** @private @jsxobf-clobber */
  Painted.RECALC_TOID = null;

/* @JSC :: begin BENCH */
  Painted.REPAINT_MAP = new jsx3.util.WeakMap();
/* @JSC :: end */

  /**
   * Updates the view of this object by calling <code>paint()</code> and replacing the current view with the
   * returned HTML. This method has no effect if this object is not currently displayed.
   * @return {String} the result of calling <code>paint()</code> or <code>null</code> if this object is not displayed.
   * @see #paint()
   */
  Painted_prototype.repaint = function() {
/* @JSC :: begin BENCH */
    var queue = [this];
    while (queue.length > 0) {
      var node = queue.shift();
      var myId = node.getId();
      if (myId == null) continue;

      var paints = 1 + (Painted.REPAINT_MAP.get(myId) || Number(0));
      if (paints > 1) {
        jsx3.util.Logger.getLogger("bench." + Painted.jsxclass).warn(paints + " repaints of " + node);
      } else {
        var c = node.getChildren();
        if (c.length > 0) queue.push.apply(queue, c);
      }
      Painted.REPAINT_MAP.set(myId, paints);
    }
/* @JSC :: end */

    var objGUI = this.getRendered();

    if (this.isDomPaint()) {
      if (objGUI != null) {
        var prevSib = objGUI.previousSibling;
        var newGUI = this.paintDom();
        // paintDom may return a new DOM element, in which case replace the old one
        if (newGUI != objGUI)
          objGUI.parentNode.replaceChild(newGUI, objGUI);
        // paintDom may return the same DOM element but have removed it from the DOM, insert it again
        else if (newGUI.parentNode == null)
          prevSib.parentNode.insertBefore(newGUI, prevSib);
        // paintDom may return the same DOM element still attached to the DOM
      }

      return null;
    } else {
      var strHTML = null;

      if (objGUI != null) {
/* @JSC :: begin BENCH */
        var t1 = new jsx3.util.Timer(Painted.jsxclass, this);
/* @JSC :: end */

        strHTML = this.paint();
        // replace its outer HTML
        html.setOuterHTML(objGUI, strHTML);
        Painted._onAfterPaintCascade(this, objGUI);

/* @JSC :: begin BENCH */
        t1.log("repaint");
/* @JSC :: end */
      }

      //return the string to the calling function just in case it needs it
      return strHTML;
    }
  };

  /**
   * Returns the DHTML, used for this object's on-screen VIEW
   * @return {String} DHTML
   */
  Painted_prototype.paint = jsx3.Method.newAbstract();

  /**
   * A hook that subclasses of Painted may override in order to perform additional manipulation of the HTML DOM
   * created by the paint method. The order of steps follows. All steps occur in a single browser thread so that
   * the screen does not update between steps 2 and 3.
   * <ol>
   *   <li>The paint() method of this object is called.</li>
   *   <li>The result of the paint() method is inserted into the HTML DOM.</li>
   *   <li>The onAfterPaint() method of this object is called, passing in the newly inserted root HTML element.</li>
   * </ol>
   * <p/>
   *
   * @param objGUI {HTMLElement} the rendered HTML element representing this object.
   * @since 3.4
   * @protected
   */
  Painted_prototype.onAfterPaint = function(objGUI) {
  };

  /** @private @jsxobf-clobber-shared */
  Painted._onAfterPaintCascade = function(objRoot, objGUI) {
    var queue = [objRoot];
    while (queue.length > 0) {
      var node = queue.shift();
      if (node.onAfterPaint != Painted_prototype.onAfterPaint) {
        var objElm = node.getRendered(objGUI);
        if (objElm) node.onAfterPaint(objElm);
      }
      var arrChildren = node.getDescendantsOfType(Painted, true);
      if (arrChildren.length > 0)
        queue.unshift.apply(queue, arrChildren);
    }
  };

  /**
   * Subclass if restoring of the CSS display of the object necessitates any cleanup of the view. For example, restoring a Matrix
   * that was painted while it (or an ancestor) had a CSS display setting of 'none' results in the content height
   * being mistaken as 0 (null).
   *
   * @param objGUI {HTMLElement} the rendered HTML element representing this object.
   * @since 3.5
   * @protected
   */
  Painted_prototype.onAfterRestoreView = function(objGUI) {
  };

  /** @package */
  Painted._onAfterRestoreViewCascade = function(objRoot, objGUI) {
    var queue = [objRoot];
    while (queue.length > 0) {
      var node = queue.shift();
      if (node.onAfterRestoreView != Painted_prototype.onAfterRestoreView) {
        var objElm = node.getRendered(objGUI);
        if (objElm) node.onAfterRestoreView(objElm);
      }
      var arrChildren = node.getDescendantsOfType(Painted, true);
      if (arrChildren.length > 0)
        queue.unshift.apply(queue, arrChildren);
    }
  };

  /**
   * Subclasses of this class may return <code>true</code> from this method if the paint via DOM access.
   * If this method returns <code>true</code>, <code>paint()</code> will never be called; instead,
   * <code>paintDom()</code> will be called and must be implemented.
   * @return {boolean} <code>false</code>.
   * @see #paintDom()
   * @see #paint()
   * @package
   */
  Painted_prototype.isDomPaint = function() {
    return false;
  };

  /**
   * If <code>isDomPaint()</code> returns <code>true</code> for this instance, this method is called instead
   * of <code>paint()</code>. This method should construct an return a native browser DOM node.
   * @return {Object|HTMLElement}
   * @see #isDomPaint()
   * @see #paint()
   * @throws {jsx3.Exception} always. DOM-painted subclasses must implement this method.
   * @package
   */
  Painted_prototype.paintDom = function() {
    throw new jsx3.Exception();
  };

  /** @private @jsxobf-clobber */
  Painted_prototype.paintDomHolder = function() {
    return '<span id="' + this.getId() + '" style="display:none;" jsxdomholder="1"></span>';
  };

  /** @private @jsxobf-clobber */
  Painted.DOM_PAINT_QUEUE = [];

  /**
   * Adds <code>objJSX</code> to a queue of DOM-painted objects that are waiting to be painted. When an object
   * paints via serialization, it may include a DOM-painted child by including the HTML returned by calling
   * <code>paintDomHolder()</code> on the child and then adding the child to the paint queue.
   * @param objJSX {jsx3.gui.Painted}
   * @private
   * @jsxobf-clobber
   */
  Painted.addToDomPaintQueue = function(objJSX) {
    Painted.DOM_PAINT_QUEUE.push(objJSX);
    jsx3.sleep(Painted.onAfterPaintTimeout, "jsx3.gui.Painted.domPaint");
  };

  /** @private @jsxobf-clobber */
  Painted.onAfterPaintTimeout = function() {
    for (var i = 0; i < Painted.DOM_PAINT_QUEUE.length; i++) {
      var objJSX = Painted.DOM_PAINT_QUEUE[i];
      var container = objJSX.getRendered();
      if (container != null) {
        var dom = objJSX.paintDom();
        container.parentNode.replaceChild(dom, container);
      }
    }
    Painted.DOM_PAINT_QUEUE.splice(0, Painted.DOM_PAINT_QUEUE.length);
  };

  /**
   * Paints a child of this object without repainting this entire object. The child is inserted into the view of
   * this object as the last child object, regardless of its actual position relative to other children. This method
   * has no effect if this object is not currently painted.
   *
   * @param objChild {jsx3.gui.Painted} the child object to paint.
   * @param bGroup {boolean} <code>true</code> if this method is being called iteratively over a collection of
   *   children. This parameter will only be <code>false</code> on the final call in the iteration.
   * @param-package objGUI {HTMLElement}
   * @param-package bCascadeOnly {boolean}
   */
  Painted_prototype.paintChild = function(objChild, bGroup, objGUI, bCascadeOnly) {
    //allows runtime insert of html without requiring all other child objects to be repainted
    if (objGUI == null) objGUI = this.getRendered();
    if (objGUI != null && objChild instanceof Painted) {
      if (!bCascadeOnly) {
        if (objChild.isDomPaint()) {
          objGUI.appendChild(objChild.paintDom());
        } else {
/* @JSC :: begin BENCH */
          var t1 = new jsx3.util.Timer(Painted.jsxclass, this);
/* @JSC :: end */

          html.insertAdjacentHTML(objGUI, "beforeEnd", objChild.paint());

/* @JSC :: begin BENCH */
          t1.log("paint.insert");
/* @JSC :: end */
        }
      }

      Painted._onAfterPaintCascade(objChild, objGUI);
    }
  };

  /** @package @jsxobf-clobber-shared */
  Painted_prototype.viewUpdateHook = function(objChild, bGroup) {
    this.paintChild(objChild, bGroup);
  };

/* @JSC :: begin DEP */

  /**
   * Paints a child of this object without repainting this entire object. The child is inserted into the view of
   * this object as the last child object, regardless of its actual position relative to other children. This method
   * has no effect if this object is not currently painted.
   *
   * @param objChild {jsx3.gui.Painted} the child object to paint.
   * @return {jsx3.gui.Painted} this object.
   * @deprecated  Replaced with <code>paintChild()</code>.
   * @see #paintChild()
   */
  Painted_prototype.insertHTML = function(objChild) {
    this.paintChild(objChild);
    return this;
  };

/* @JSC :: end */

  //BOX MODEL SUPPORT FOR FIREFOX PORT **************************************************

  /**
   * Iterates through children and returns concatenation of paint() method for all children.
   * @param c {Array<jsx3.gui.Painted>} the children to paint. If not provided <code>this.getChildren()</code> is used.
   * @return {String} DHTML
   */
  Painted_prototype.paintChildren = function(c) {
    if (c == null) c = this.getChildren();
    var a = new Array(c.length);
    for (var i = 0; i < c.length; i++) {
      var child = c[i];
      if (!(child instanceof Painted)) continue;

      if (child.isDomPaint()) {
        a[i] = child.paintDomHolder();
        Painted.addToDomPaintQueue(child);
      } else {
        var intLoadType = child.getLoadType();
        if (intLoadType == jsx3.app.Model.LT_SLEEP_PAINT ||
            intLoadType == jsx3.app.Model.LT_SLEEP_DESER ||
            intLoadType == jsx3.app.Model.LT_SLEEP_PD) {
          a[i] = child.paintDomHolder();
          jsx3.sleep(jsx3.makeCallback("repaint", child), "jsx3.gui.Painted.repaint" + child.getId());
        } else if ((intLoadType == jsx3.app.Model.LT_SHOW_DESER ||
                    intLoadType == jsx3.app.Model.LT_SHOW_PAINT) && !child._getShowState()) {
          a[i] = child.paintDomHolder();
        } else {
          a[i] = child.paint();
        }
      }
    }
    return a.join("");
  };

  /**
   * Similar to <code>paintChildren</code>, but the target is the object, itself, NOT the children of the object
   * @return {String} HTML
   * @package
   */
  Painted_prototype._conditionalPaint = function() {
    var a;
    if (this.isDomPaint()) {
      a = this.paintDomHolder();
      Painted.addToDomPaintQueue(this);
    } else {
      var intLoadType = this.getLoadType();
      if (intLoadType == jsx3.app.Model.LT_SLEEP_PAINT ||
          intLoadType == jsx3.app.Model.LT_SLEEP_DESER ||
          intLoadType == jsx3.app.Model.LT_SLEEP_PD) {
        a = this.paintDomHolder();
        jsx3.sleep(jsx3.makeCallback("repaint", this), "jsx3.gui.Painted.repaint" + this.getId());
      } else if ((intLoadType == jsx3.app.Model.LT_SHOW_DESER ||
                  intLoadType == jsx3.app.Model.LT_SHOW_PAINT) && !this._getShowState()) {
        a = this.paintDomHolder();
      } else {
        a = this.paint();
      }
    }
    return a;
  };

  /**
   * Gets the box model/profile for the object;
   * @param bCreate {boolean} false if null. if true, a profile is created if none exists yet
   * @return {jsx3.gui.Painted.Box}
   * @package
   */
  Painted_prototype.getBoxProfile = function(bCreate, objDimension) {
    if (this._jsxboxprofiledirty) this.clearBoxProfile();

    if (this._jsxboxprofile == null && bCreate)
      /* @jsxobf-clobber */
      this._jsxboxprofile = this.createBoxProfile(objDimension);
    return this._jsxboxprofile;
  };

  /**
   * Sets the box model/profile for the object;
   * @param boxProfile {jsx3.gui.Painted.Box}
   * @package
   */
  Painted_prototype.setBoxProfile = function(boxProfile) {
    this._jsxboxprofile = boxProfile;
  };

  /**
   * @package
   */
  Painted_prototype.setBoxDirty = function() {
    /* @jsxobf-clobber */
    this._jsxboxprofiledirty = true;
  };

  /**
   * Deletes the existing boxprofile for the object; typically called by recalc.
   * @param bRecurse {Boolean} if true, the profile for all descendants is also deleted. Typically, a left/top adjustment would pass false for this param, while all other adjustments that affect descendant structures would pass true.
   * @package
   */
  Painted_prototype.clearBoxProfile = function(bRecurse) {
    var q = [this];
    while (q.length > 0) {
      var n = q.shift();
      
      delete n._jsxboxprofiledirty;
      delete n._jsxcachedclientdims;

      if (n._jsxboxprofile) {
        delete n._jsxboxprofile;
        if (bRecurse) {
          var c = n.getChildren();
          if (c.length > 0) q.push.apply(q, c);
        }
      }
    }
  };

  /**
   * applies a string of CSS style properties to a DOM element
   * @param objDOM {HTMLElement} native browser DOM element (a TR/TD)
   * @param strValue {String} string of CSS. For example,  left:10px;height:20px;width:100px;
   * @param csstype {String} one of: padding, margin, border. If strValue is empty, this value is used to resolve the css property to reset to null
   * @private
   */
  Painted.convertStyleToStyles = function(objDOM,strValue,csstype) {
    if (strValue) {
      //apply the style(s)
      var objStyles = jsx3.util.strTrim(strValue).split(/\s*;\s*/g);
      for (var i = 0; i < objStyles.length; i++) {
        var curStyle = objStyles[i];
        if (curStyle == "") continue;
        var objStyle = curStyle.split(/\s*:\s*/);
        if (objStyle && objStyle.length == 2) {
          var strStyleName = objStyle[0].replace(/(-\S)/gi,function($0,$1){ return $1.substring(1).toUpperCase(); });
          objDOM.style[strStyleName] = objStyle[1];
        }
      }
    } else if (csstype) {
      //remove the styles
      var a = ["Top","Right","Bottom","Left"];
      for (var i=0;i<4;i++) {
        var strStyleName = csstype + a[i];
        objDOM.style[strStyleName] = "";
      }
    }
  };

  /**
   * Removes the box model abstraction for a given object and its descendants. This effectively resets the box profiler, so dimensions can be recalculated as if the object was just broought into the visual DOM.
   * @param properties {Array} Will designate by name, those properties that should be updated on the object's VIEW (without requiring the MODEL to repaint), including one or more of the following: padding, margin, border
   */
  Painted_prototype.recalcBox = function(properties) {
    //remove the profiles
    this.findDescendants(function(objJSX) {
      objJSX.clearBoxProfile(false);
    },true,true,false,true);

    // call update box profile
    this.syncBoxProfileSync((this.getParent())?this.getParent().getClientDimensions(this):null, this.getRendered());

    //if any properties were passed
    if (properties) {
      var objGUI = this.getRendered();
      if (objGUI != null) {
        var objP = this.getBoxProfile(true);
        for (var i = 0; i < properties.length; i++) {
          if (properties[i] == "padding") {
            Painted.convertStyleToStyles(objGUI, objP.paintPadding(), "padding");
          } else if (properties[i] == "margin") {
            Painted.convertStyleToStyles(objGUI, objP.paintMargin(), "margin");
          } else if (properties[i] == "border") {
            Painted.convertStyleToStyles(objGUI, objP.paintBorder(), "border");
          }
        }
      }
    }
  };

  /**
   * gets the size of the canvas for a given child (the true drawspace)
   * @return {object} implicit map with named properties: parentwidth, parentheight
   * @package
   */
  Painted_prototype.getClientDimensions = function() {
    var contentProfile = this._jsxboxprofile;
    return contentProfile != null ?
            {parentwidth:contentProfile.getClientWidth(),parentheight:contentProfile.getClientHeight()} :
            {};
  };

  /** @package */
  Painted_prototype.getCachedClientDimensions = function(intIndex) {
    var dims = this._jsxcachedclientdims ? this._jsxcachedclientdims[intIndex] : null;
//    if (dims) jsx3.log("Cache hit! " + this.getClass());
    return dims;
  };

  /** @package */
  Painted_prototype.setCachedClientDimensions = function(intIndex, objDim) {
    if (! this._jsxcachedclientdims)
      /* @jsxobf-clobber */
      this._jsxcachedclientdims = [];
    this._jsxcachedclientdims[intIndex] = objDim;
    return objDim;
  };

  /** @package */
  Painted_prototype.flushCachedClientDimensions = function(strId) {
    //no-op -- used by new template engine;
  };

  /**
   * Creates the box model/profile for the object. Expects two parameters: the parentwidth and the parentheight
   * @param objDimension {object} Map containing named properties: L, T, W, H.  If not passed, the object will query its parent (can happen if paint is called on an object whose parent hasn't painted yet)
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @package
   */
  Painted_prototype.createBoxProfile = function(objDimension) {
    return new Painted.Box({});
  };

  /**
   * Updates the box model for the object.
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @param objGUI {object} native browser element representing the VIEW for the dialog instance
   * @package
   */
  Painted_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 1);
  };

  /**
   * @package
   */
  Painted_prototype.updateBoxProfileImpl = function(objImplicit, objGUI, objQueue, intType) {
    if (intType == 1) {
      this.setBoxDirty();
      if (objGUI != null) objQueue.addRepaint(this);
    } else if (intType == 2 || intType == 4) {
      var b1 = this.getBoxProfile(true, objImplicit);
      var recalcRst = b1.recalculate(objImplicit, objGUI, objQueue);
      if (recalcRst.w || recalcRst.h) {
        if (!Painted._RESIZE_EVENT && jsx3.gui.Interactive)
          Painted._RESIZE_EVENT = {subject:jsx3.gui.Interactive.AFTER_RESIZE_VIEW};
        if (Painted._RESIZE_EVENT) this.publish(Painted._RESIZE_EVENT);

        var c = this.getChildren();
        // Block puts arbitrary HTML before the children so we need to count backwards from the last childNode
        var nodeOffset = intType == 4 && objGUI ? Math.max(0, objGUI.childNodes.length - c.length) : 0;

        for (var i = c.length - 1; i >= 0; i--) {
          var child = c[i];
          //3.6 DM update: need to call the getter, not the property
          var box = child.getBoxProfile(false);//_jsxboxprofile;
          if (box && box._isParentIndependent()) continue;

          var index = i + nodeOffset;
          var gui = objGUI ? (objGUI.childNodes[index] ? objGUI.childNodes[index] : true) : null;
          objQueue.add(child, {parentwidth:b1.getClientWidth(), parentheight:b1.getClientHeight()}, gui, true);
        }
      } else {
//        jsx3.log("Escaped updating children: " + this.getChildren());
      }
    } else if (intType == 3) {
      var b1 = this.getBoxProfile(true, objImplicit);

      if (objGUI)
        b1.recalculate(objImplicit, objGUI, objQueue);
    }
  };

  /**
   * @package
   */
  Painted_prototype.syncBoxProfile = function(objImplicit, objGUI) {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Painted.jsxclass, this);
/* @JSC :: end */

    var queue = new Painted.Queue();
    queue.add(this, objImplicit, objGUI);

/* @JSC :: begin BENCH */
    queue.subscribe("done", function() { t1.log("box.async");});
/* @JSC :: end */

    queue.start();
  };

  /** @private @jsxobf-clobber */
  Painted._SYNCQ = {};
  Painted._SYNCQ.add = function(a, b, c) {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Painted.jsxclass, a);
/* @JSC :: end */

    a._updateBoxFromQueue(this, b, c);

/* @JSC :: begin BENCH */
    t1.log("box.sync");
/* @JSC :: end */
  };
  Painted._SYNCQ.addRepaint = function(a) {
    a.repaint();
  };

  /**
   * @package
   */
  Painted_prototype.syncBoxProfileSync = function(objImplicit, objGUI) {
    Painted._SYNCQ.add(this, objImplicit, objGUI);
  };

/* @JSC :: begin BENCH */
  Painted.UPDATE_MAP = new jsx3.util.WeakMap();
/* @JSC :: end */

  /** @private @jsxobf-clobber */
  Painted_prototype._updateBoxFromQueue = function(objQueue, objImplicit, objGUI) {
/* @JSC :: begin BENCH */
    var paints = 1 + (Painted.UPDATE_MAP.get(this.getId()) || Number(0));
    if (paints > 1)
      jsx3.util.Logger.getLogger("bench." + Painted.jsxclass).warn(paints + " box updates of " + this);
    Painted.UPDATE_MAP.set(this.getId(), paints);
/* @JSC :: end */

    // TODO: only update relevant properties, like width, height, etc.
    this.applyDynamicProperties();

    delete this._jsxcachedclientdims;
    this.updateBoxProfile(objImplicit, objGUI, objQueue);
  };

  /** @package */
  Painted_prototype._getShowState = function() {
    return this._jsxshowstate;
  };

  /** @package */
  Painted_prototype._setShowState = function(bShow) {
    if (this._jsxshowstate != bShow) {
      this._jsxshowstate = bShow;
      if (bShow) {
        var objGUI = this.getRendered();
        //3.6: added the following to repaint the domholder object if it is in fact the domholder (don't just check content existence)
        if (objGUI && (!objGUI.firstChild || objGUI.getAttribute("jsxdomholder") == "1"))
          this.repaint();
      }
    }
  };

  Painted_prototype.destroyView = function(objParent) {
    var s = objParent.getServer();
    if (s) {
      var objGUI = objParent.getServer().getRenderedOf(this);
      if (objGUI)
        jsx3.html.removeNode(objGUI);
    }
  };

});

/** @package */
jsx3.Class.defineClass("jsx3.gui.Painted.Queue", jsx3.lang.Object, [jsx3.util.EventDispatcher], function(Queue, Queue_prototype) {

  /** @private @jsxobf-clobber */
  Queue.CHUNK_MAX = 250;

  /** @private @jsxobf-clobber */
  Queue._SERIAL = 0;
  /** @private @jsxobf-clobber */
  Queue._ACTIVE = new jsx3.util.List();
  /** @private @jsxobf-clobber */
  Queue._CHUNK = true;
  /** @private @jsxobf-clobber */
  Queue._LOCK = false;

  /**
   * @package
   */
  Queue.enableChunking = function(bEnable) {
    Queue._CHUNK = bEnable;
  };

  /** @private @jsxobf-clobber */
  Queue._start = function() {
    Queue.doChunk();
  };

  Queue.doChunk = function() {
    if (Queue._CHUNK) {
      if (Queue._LOCK) return;
      Queue._LOCK = true;

//      if (Queue._TS == null) Queue._TS = new Date().getTime();

      var tdone = new Date().getTime() + Queue.CHUNK_MAX;
      var t2 = new Date().getTime();

      var q = Queue._ACTIVE.removeAt(0);

      while (q != null && t2 < tdone) {
        if (q._queue.length > 0) {
          var entry = q._queue.shift();
          if (jsx3.$A.is(entry))
            entry[0]._updateBoxFromQueue(q, entry[1], entry[2]);
          else
            entry.repaint();
          t2 = new Date().getTime();
        } else {
          q.destroy();
          q = Queue._ACTIVE.removeAt(0);
        }
      }

      if (q != null) {
        Queue._ACTIVE.add(q, 0);
        jsx3.sleep(Queue.doChunk, "jsx3.gui.Painted.queue");
      }

      Queue._LOCK = false;
    } else {
      while (Queue._ACTIVE.size() > 0) {
        var q = Queue._ACTIVE.removeAt(0);
        while (q._queue.length > 0) {
          var entry = q._queue.shift();
          if (jsx3.$A.is(entry))
            entry[0]._updateBoxFromQueue(q, entry[1], entry[2]);
          else
            entry.repaint();
        }
      }
    }
  };

  Queue_prototype.init = function() {
    /* @jsxobf-clobber */
    this._serial = ++Queue._SERIAL;
    /* @jsxobf-clobber */
    this._queue = [];
    Queue._ACTIVE.add(this);
  };

  Queue_prototype.add = function(objJSX, objImplicit, objGUI, bStack) {
    // TODO: benchmark push/unshift
    if (objGUI === true) objGUI = objJSX.getRendered();
    this._queue[bStack ? "unshift" : "push"]([objJSX, objImplicit, objGUI]);
  };

  Queue_prototype.addRepaint = function(objJSX, bStack) {
    this._queue[bStack ? "unshift" : "push"](objJSX);
  };

  Queue_prototype.start = function() {
    Queue._start();
  };

  Queue_prototype.destroy = function() {
    this.publish({subject:"done"});
    delete this._queue;
    Queue._ACTIVE.remove(this);
  };

  Queue_prototype.toString = function() {
    return "{Painted.Queue " + this._serial + " " + (this._queue != null ? this._queue.length : "-") + "}";
  };

});

/**
 * Provides an abstraction layer for the native browser Box model. Instances of this class represent an abstract view of the boxes used by a GUI object to render the native VIEW.
 *
 * @since 3.2
 * @package
 */
jsx3.Class.defineClass("jsx3.gui.Painted.Box", jsx3.lang.Object, null, function(Box, Box_prototype) {

  var html = jsx3.html;
  
  //used to convert/parse a CSS string defining border, padding, and margin to a four-element array
  /** @private @jsxobf-clobber */
  Box.REGEX =  /[^\d-]*([-]*[\d]*)[^\d-]*([-]*[\d]*)[^\d-]*([-]*[\d]*)[^\d-]*([-]*[\d]*)/;
  /** @private @jsxobf-clobber */
  Box.BREGEX = /\b(\d*)px/g;
  //list of all properties on the implicit object that will be converted to an explicit equivalent
  /** @private @jsxobf-clobber */
  Box._PROPERTIES = ['boxtype','tagname','margin','padding','border','left','top','width','height','empty','container'];
  /** @private @jsxobf-clobber */
  Box._RECALC_FIELDS = ['boxtype','left','top','width','height'];
  /** @private @jsxobf-clobber */
  Box._PROPS_SETTER = {width: "_addPropWidth", height: "_addPropHeight", top: "_addPropTop", left: "_addPropLeft",
      padding: "_addPropPadding", border: "_addPropBorder", margin: "_addPropMargin", tagname: "_addPropTagname"};

  //order (clockwise) of css position (border-left, padding-left, margin-left, *-left, etc)
  /** @private @jsxobf-clobber */
  Box.COMPASS = ["top","right","bottom","left"];
  /** @private @jsxobf-clobber */
  Box.SCROLL_SIZE = null;

  //standards-compliant browsers do not like to give structure (l,t,w,h) to relative boxes (spans, etc); this fixes to allow for GIs layout system

/* @JSC */ if (jsx3.CLASS_LOADER.SAF) {
  /** @private @jsxobf-clobber */
  Box._CSS_FIXES = ["", "display:inline-block;", "", "display:inline-block;"];
/* @JSC */ } else if (jsx3.CLASS_LOADER.IE) {
    if (html.getMode() == html.MODE_FF_QUIRKS) // IE10 quirks (not IE10 in IE5 quirks) simulates Firefox quirks
    /** @private @jsxobf-clobber */
      Box._CSS_FIXES = ["", "display:inline-block;", "display:inline-block;", ""];
    else
    /** @private @jsxobf-clobber */
      Box._CSS_FIXES = ["", "", "display:inline-block;", ""];
/* @JSC */ } else {
  if (jsx3.CLASS_LOADER.FX && jsx3.CLASS_LOADER.getVersion() >= 3)
    /** @private @jsxobf-clobber */
    Box._CSS_FIXES = ["", "display:inline-block;", "", "display:inline-block;"];
  else
    Box._CSS_FIXES = ["", "display:-moz-inline-box;", "", "display:-moz-inline-box;"];
/* @JSC */ }

  // These static strings improve performance on IE6. The obfuscator currently would make these string literals static
  // anyway. However, leaving them here improves painting performance in the uncompiled build.
  /** @private @jsxobf-clobber */
  Box._str = {pad:"padding", mar:"margin", e:"", box:"box", zpx:"0px", str:"string", num:"number", obj:"object",
      pct:"%", semi:";", px:"px", pxs:"px;", pxc:"px ", c:":", rbox:"relativebox", bor:"border"};
  /** @private @jsxobf-clobber */
  Box._stm = {hph:{height:1, parentheight:1}, wpw:{width:1, parentwidth:1}};
  /** @private @jsxobf-clobber */
  Box._pa = ['<', ' ', 'width:', 'height:', '"/>', '">', 'left:0px', 'left:', 'top:0px', 'top:', 'position:absolute;',
      ' style="', 'position:relative;', '</', '>', ''];

  /** @package */
  Box.getCssFix = function() {
    return Box._CSS_FIXES[html.getMode()];
  };

  /* @jsxobf-clobber */
  Box_prototype._lastbordervalue = "";
  /* @jsxobf-clobber */
  Box_prototype._lastmarginvalue = "";
  /* @jsxobf-clobber */
  Box_prototype._lastpaddingvalue = "";
  /* @jsxobf-clobber */
  Box_prototype._new = true;

  Box_prototype.styles = "";
  Box_prototype.attributes = "";

  /**
   * instance initializer
   * @param profile {Object} Implicit map that will be used to create the true profile object. Relevant properties include:
   * <ul>
   * <li><b>boxtype</b>: box, relativebox, or inline (native)</li>
   * <li><b>tagname</b>: div, span, input[text], input[password], textarea, etc</li>
   * <li><b>parentwidth</b>: true drawspace that this object must live within.</li>
   * <li><b>parentheight</b>: true drawspace that this object must live within.</li>
   * <li><b>left</b>: Pixel or percentage</li>
   * <li><b>top</b>: Pixel or percentage</li>
   * <li><b>width</b>: pixel or percentage</li>
   * <li><b>height</b>: pixel or percentage</li>
   * <li><b>border</b>: To use, this value must provide four compass positions in clockwise order (top, right, bottom, left)</li>
   * <li><b>padding</b>: To use, this value must provide four compass positions in clockwise order (top, right, bottom, left)</li>
   * <li><b>margin</b>: To use, this value applies to inline, rightfloatbox and leftfloatbox. must provide four compass positions in clockwise order (top, right, bottom, left)</li>
   * <li><b>empty</b>: Boolean, if true, the generated tag will be empty. For example, &lt;br/&gt; instead of &lt;br&gt;&lt;/br&gt;</li>
   * <li><b>container</b>: Boolean, if true, the object is a 100%x100% HTML element (preferably a div), used to contain other objects, but not used for textual display.</li>
   * </ul>
   */
  Box_prototype.init = function(profile) {
    this.implicit = profile || {};
    this.calculate();
  };

  Box_prototype.reset = function() {
    this._new = true;
  };
  
  /**
   * Renders the box as an HTML box appropriate to the native browser environment and returns the DHTML
   * @return {Array} 2-item array with the beginning/ending tags, representing the literal HTML element to send to the Browser for rendering
   */
  Box_prototype.paint = function() {
    this._new = false;
    //declare array to hold return structure (a start tag and an end tag)
    var a = new Array(2);

    //create the common prefix
    var commonPrefix = Box._pa[0] + this._expl.tagname + Box._pa[1] + this.attributes;

    //only output width/height if explicitly set; don't allow for negative values as they imply a null dimension, causing liquid constraints to break
    var myWidth = this.getPaintedWidth();
    myWidth = myWidth != null ? Box._pa[2] + Math.max(0, myWidth) + Box._str.pxs : Box._str.e;
    var myHeight = this.getPaintedHeight();
    myHeight = myHeight != null ? Box._pa[3] + Math.max(0, myHeight) + Box._str.pxs : Box._str.e;

    var endTag = (this._expl.empty) ? Box._pa[4] : Box._pa[5];

    if (this._expl.boxtype == Box._str.box) {
      var myLeft = this._expl.left;
      myLeft = myLeft == null ? Box._pa[6] : Box._pa[7] + myLeft + Box._str.pxs;
      var myTop = this._expl.top;
      myTop = myTop == null ? Box._pa[8] : Box._pa[9] + myTop + Box._str.pxs;
      var position = this.implicit.omitpos ? Box._str.e : Box._pa[10];

      a[0] = commonPrefix + Box._pa[11] + position + myWidth + myHeight + myLeft + myTop + this.paintPadding() +
          this.paintMargin() + this.paintBorder() + this.styles + endTag;
    } else if (this._expl.boxtype == Box._str.rbox) {
      var position = this.implicit.omitpos ? Box._str.e : Box._pa[12];
      a[0] = commonPrefix + Box._pa[11] + position + this._getCSSFix() + myWidth + myHeight + this.paintPadding() +
          this.paintMargin() + this.paintBorder() + this.styles + endTag;
    } else {
      //resolve nulls
      var myLeft = this._expl.left;
      myLeft = myLeft == null ? Box._str.e : Box._pa[7] + myLeft + Box._str.pxs;
      var myTop = this._expl.top;
      myTop = myTop == null ? Box._str.e : Box._pa[9] + myTop + Box._str.pxs;
      var position = this.implicit.omitpos ? Box._str.e : Box._pa[12];

      a[0] = commonPrefix + Box._pa[11] + position + myWidth + myHeight + myLeft + myTop + this.paintPadding() +
          this.paintMargin() + this.paintBorder() + this.styles + endTag;
    }

    a[1] = (this._expl.empty) ? Box._pa[15] : Box._pa[13] + this._expl.tagname + Box._pa[14];
    return a;
  };

  /**
   * Sets ths CSS style declaration on an element. The following properties are not supported and MAY NOT be included in the declaration: position, left, top, width, height, padding, margin, border, float, clear
   * @param styles {String} valid style declaration containing one or more name/value pairs. For example, <code>color:red;background-color:yellow;font-size:12px;</code>
   * @return {jsx3.gui.Painted.Box} this object
   */
  Box_prototype.setStyles = function(styles) {
    this.styles = styles;
    return this;
  };

  /**
   * Sets the named attribute (attributes appear on the native HTML tag as a name/value pair)
   * @param atts {String} a string of attributes to place on the native HTML tag.  For example: <code>id="25" type="RADIO" class="abc def ghi"</code>
   * @return {jsx3.gui.Painted.Box} this object
   */
  Box_prototype.setAttributes = function(atts) {
    this.attributes = atts;
    return this;
  };

  /**
   * Returns the declaration for the css <b>display</b> property appropriate to the given browser mode.  For example: <code>display:-moz-inline-box;</code>
   * @return {String}
   * @private
   * @jsxobf-clobber
   */
  Box_prototype._getCSSFix = function() {
    //when a 100%x100% html element is relatively positioned in firefox, it corrupts the -moz-inline display setting. In such cases, remove it, since it is really only needed to give structure to a span and/or relatively positioned object
    return (this._expl.container &&
        (html.getMode() == html.MODE_FF_STRICT || html.getMode() == html.MODE_FF_QUIRKS)) ?
           Box._str.e : Box.getCssFix();
  };

  /** @private @jsxobf-clobber */
  Box_prototype._isParentIndependent = function() {
    var i = this.implicit;
    return (typeof(i.width) != Box._str.str || i.width.indexOf(Box._str.pct) < 0) &&
           (typeof(i.height) != Box._str.str || i.height.indexOf(Box._str.pct) < 0) &&
           (typeof(i.left) != Box._str.str || i.left.indexOf(Box._str.pct) < 0) &&
           (typeof(i.top) != Box._str.str || i.top.indexOf(Box._str.pct) < 0);
  };

  Box._RECALC_VALS = [[[[{n:1},{h:1}],[{w:1},{w:1,h:1}]],[[{t:1},{t:1,h:1}],[{t:1,w:1},{t:1,w:1,h:1}]]],
      [[[{l:1},{l:1,h:1}],[{l:1,w:1},{l:1,w:1,h:1}]],[[{l:1,t:1},{l:1,t:1,h:1}],[{l:1,t:1,w:1},{l:1,t:1,w:1,h:1,a:1}]]]];

  /**
   * Recalculates the explicit object based upon the implicit profile. Persists both on the object
   * @param profile {Object} Implicit map that will be used to create the explicit profile object. Since this is an update to an existing profile, only those properties that have changed need to be passed:
   * <ul>
   * <li><b>boxtype</b>: box, relativebox, or inline</li>
   * <li><b>tagname</b>: div, span, input[text], input[password], textarea, etc</li>
   * <li><b>parentwidth</b>: clientWidth of box within which this profile will render its box.</li>
   * <li><b>parentheight</b>: clientHeight of box within which this profile will render its box.</li>
   * <li><b>left</b>: Pixel or percentage</li>
   * <li><b>top</b>: Pixel or percentage</li>
   * <li><b>width</b>: pixel or percentage</li>
   * <li><b>height</b>: pixel or percentage</li>
   * <li><b>border</b>: To use, this value must provide four compass positions in clockwise order (top, right, bottom, left)</li>
   * <li><b>padding</b>: To use, this value must provide four compass positions in clockwise order (top, right, bottom, left)</li>
   * <li><b>margin</b>: To use, this value applies to inline, rightfloatbox and leftfloatbox. must provide four compass positions in clockwise order (top, right, bottom, left)</li>
   * <li><b>empty</b>: Boolean, if true, the generated tag will be empty. For example, &lt;br/&gt; instead of &lt;br&gt;&lt;/br&gt;</li>
   * <li><b>container</b>: Boolean, if true, the object is a 100%x100% HTML element (preferably a div), used to contain other objects, but not used for textual display.</li>
   * </ul>
   * @return {Boolean} true if a delta to the calculated box's dimensions
   * @param objGUI {HTMLElement} on-screen element
   * @package
   */
  Box_prototype.recalculate = function(profile, objGUI) {
    var bUpdate = this._new;
    var l = 0, t = 0, w = 0, h = 0;

    // apply deltas to the implicit object
    for (var p in profile) {
      if (this.implicit[p] != profile[p]) {
        this.implicit[p] = profile[p];
        bUpdate = true;

        if (!w && Box._stm.wpw[p]) w = 1;
        if (!h && Box._stm.hph[p]) h = 1;
      }
    }

    if (bUpdate) {
      // recalculate (convert implicit to explicit)
      this.calculate(Box._RECALC_FIELDS);

      if (objGUI && objGUI.style) {
        var objStyle = objGUI.style;

        // left and top can be negative, but not null
        if (this._expl.boxtype == Box._str.box && this._expl.left != null && this._expl.top != null) {
          if (parseInt(objStyle.left) != this._expl.left) {
            objStyle.left = this._expl.left + Box._str.px; // NOTE: Fx XHTML mode requires "px"
            l = 1;
          }
          if (parseInt(objStyle.top) != this._expl.top) {
            objStyle.top = this._expl.top + Box._str.px;
            t = 1;
          }
        }

        // if the token says this is a positional move, then only left/top is affected. skip width/height
        if (profile.parentheight != null || profile.parentwidth != null ||
            profile.width != null || profile.height != null) {
          var myWidth = this.getPaintedWidth();
          var myHeight = this.getPaintedHeight();

          if (myWidth != null && parseInt(objStyle.width) != myWidth) {
            objStyle.width = Math.max(0, myWidth) + Box._str.px;
            w = 1;
          } else {
            w = 0;
          }

          if (myHeight != null && parseInt(objStyle.height) != myHeight) {
            objStyle.height = Math.max(0, myHeight) + Box._str.px;
            h = 1;
          } else {
            h = 0;
          }
        }
      }
    }

//    jsx3.log("recalculate " + bUpdate + " " + (objGUI ? (objGUI.id + " " + jsx3.GO(objGUI.id)) : "-") + " " + [l,t,w,h].join(","));
    this._new = false;

    // return information on what was changed
    return Box._RECALC_VALS[l][t][w][h];
  };

  /* @jsxobf-clobber */
  Box._LT_PROPS = {left:1, top:1};

  /* @jsxobf-clobber */
  Box._Expl = function() {};
  Box._Expl.prototype = {padding:"", margin:"", border:"", bwidth:0, bheight:0, btop:0, bleft:0,
      pwidth:0, pheight:0, ptop:0, pleft:0};

  /**
   * Loops through the properties in the implicit object to convert to explicit values
   * @private
   */
  Box_prototype.calculate = function(arrFields) {
    if (!arrFields) arrFields = Box._PROPERTIES;

    //recreate the explicit value object (the true dimensions--not the abstraction(implied) provided by the developer)
    if (! this._expl) this._expl = new Box._Expl();
    var newBox = this._expl;

    //convert user-implied vlaues to explicit values used by the painter/resizer
    for (var i = 0; i < arrFields.length; i++) {
      var pname = arrFields[i];
      var pvalue = this.implicit[pname];

      if (Box._LT_PROPS[pname] && (pvalue == null || pvalue == Box._str.e) && this.implicit.boxtype == Box._str.box) {
        newBox[pname] = 0;
      } else {
        var setter = Box._PROPS_SETTER[pname];
        if (setter) {
          if (pvalue === Box._str.e) pvalue = null;
          this[setter](pvalue);
        } else {
          this._expl[pname] = pvalue;
        }
      }
    }
  };

  /**
   * Registers a server instance with the box profiler, allowing sizing information and, if applicable, resize subscriptions
   * @param server {jsx3.app.Server} server instance to register
   * @param bLiquid {Boolean} if true, the server will be subscribed to the window resize event
   * @package
   */
  Box.registerServer = function(server,bLiquid) {
    if (bLiquid)
      jsx3.gui.Event.subscribe(jsx3.gui.Event.RESIZE, server, "onResize");
  };

  /**
   * Unsubscribes the server from the window.onresize event (if applicable)
   * @param server {jsx3.app.Server} server instance to register
   * @param bLiquid {Boolean} if true, the server will be unsubscribed to the window resize event
   * @package
   */
  Box.unregisterServer = function(server, bLiquid) {
    if (bLiquid)
      jsx3.gui.Event.unsubscribe(jsx3.gui.Event.RESIZE, server, "onResize");
  };

  /** @private @jsxobf-clobber */
  Box_prototype._addPropWidth = function(value) {
    if (value == null) {
      this._expl.width = this._expl.clientwidth = null;
    } else {
      if (typeof(value) == Box._str.str && value.indexOf(Box._str.pct) >= 0)
        value = Math.round(this.implicit.parentwidth * parseInt(value) / 100);
      else
        value = Number(value);
      this._expl.width = value;
      this._expl.clientwidth = Math.max(0, value - this._expl.pwidth - this._expl.bwidth);
    }
  };

  /** @private @jsxobf-clobber */
  Box_prototype._addPropHeight = function(value) {
    if (value == null) {
      this._expl.height = this._expl.clientheight = null;
    } else {
      if (typeof(value) == Box._str.str && value.indexOf(Box._str.pct) >= 0)
        value = Math.round(this.implicit.parentheight * parseInt(value) / 100);
      else
        value = Number(value);
      this._expl.height = value;
      this._expl.clientheight = Math.max(0, value - this._expl.pheight - this._expl.bheight);
    }
  };

  /** @private @jsxobf-clobber */
  Box_prototype._addPropLeft = function(value) {
    this._expl.left = typeof(value) == Box._str.str && value.indexOf(Box._str.pct) >= 0 ?
        Math.round(this.implicit.parentwidth * parseInt(value) / 100) : (value == null ? value : Number(value));
  };

  /** @private @jsxobf-clobber */
  Box_prototype._addPropTop = function(value) {
    this._expl.top = typeof(value) == Box._str.str && value.indexOf(Box._str.pct) >= 0 ?
        Math.round(this.implicit.parentheight * parseInt(value) / 100) : (value == null ? value : Number(value));
  };

  /** @private @jsxobf-clobber */
  Box_prototype._addPropTagname = function(value) {
    if (value == null) {
      this._expl.tagname = value;
      this._expl.type = value;
    } else if (value.search(/input\[(\S*)\]/i) > -1) {
      //derive password and textbox types
      this._expl.tagname = "input";
      this._expl.type = RegExp.$1.toLowerCase();
    } else {
      this._expl.tagname = value;
    }
  };

  /** @private @jsxobf-clobber */
  Box_prototype._addPropBorder = function(value) {
    if (value == null) value = Box._str.e;

    // this is expensive, so cache the value
    if (this._lastbordervalue === value)
      return;
    this._lastbordervalue = value;

    var arrBorder = null, arrWidth = null;

/* @JSC :: begin DEP */
    if (typeof(value) == Box._str.str && value.indexOf(":") >= 0) {
      var cssFix = Box.cssBorderToJsx(value);
      if (typeof(cssFix) != Box._str.obj) // error condition
        arrBorder = cssFix.split(Box._str.semi);
    } else {
/* @JSC :: end */
      value = value.replace(/(^[;\s]*)|([;\s]*$)/g, Box._str.e);
      if (value !== Box._str.e)
        arrBorder = value.split(Box._str.semi);
/* @JSC :: begin DEP */
    }
/* @JSC :: end */

    if (arrBorder && arrBorder.length > 1) {
      var bSame = true;
      for (var i = 0; bSame && i < arrBorder.length - 1 && i < 3; i++) {
        if (arrBorder[i] != arrBorder[i+1])
          bSame = false;
      }
      if (bSame) arrBorder.splice(1, arrBorder.length);
    }

    if (!arrBorder) {
      arrWidth = [0, 0, 0, 0];
    } else if (arrBorder.length == 1) {
      var match = arrBorder[0].match(Box.BREGEX);
      var width = match ? parseInt(match[0]) : 0;
      if (isNaN(width)) width = 0;
      arrWidth = [width, width, width, width];
    } else {
      arrWidth = [];
      for (var i = 0; i < 4; i++) {
        var match = arrBorder[i].match(Box.BREGEX);
        var width = match ? parseInt(match[0]) : 0;
        if (isNaN(width)) width = 0;
        arrWidth[i] = width;
      }
    }

    this._expl.bwidth = arrWidth[1] + arrWidth[3];
    this._expl.bheight = arrWidth[0] + arrWidth[2];
    this._expl.bleft = arrWidth[3];
    this._expl.btop = arrWidth[0];

    if (arrBorder) {
      for (var i = 0; i < arrBorder.length; i++) {
        if (arrBorder[i].indexOf("pseudo") >= 0)
          arrBorder[i] = Box._str.e;
      }
    }

    if (arrBorder == null) {
      this._expl.border = Box._str.e;
    } else if (arrBorder.length == 1) {
      this._expl.border = arrBorder[0] ? Box._str.bor + Box._str.c + (arrWidth[0] > 0 ? arrBorder[0] : Box._str.zpx) + Box._str.semi : Box._str.e;
    } else if (arrBorder.length == 4) {
      this._expl.border =
          (arrBorder[0] ? "border-top:" + (arrWidth[0] > 0 ? arrBorder[0] : Box._str.zpx) + Box._str.semi : Box._str.e) +
          (arrBorder[1] ? "border-right:" + (arrWidth[1] > 0 ? arrBorder[1] : Box._str.zpx) + Box._str.semi : Box._str.e) +
          (arrBorder[2] ? "border-bottom:" + (arrWidth[2] > 0 ? arrBorder[2] : Box._str.zpx) + Box._str.semi : Box._str.e) +
          (arrBorder[3] ? "border-left:" + (arrWidth[3] > 0 ? arrBorder[3] : Box._str.zpx) + Box._str.semi : Box._str.e);
    }

//    jsx3.log("_addPropBorder  " + value + " -> " + this._expl.border);
  };

  /** @private @jsxobf-clobber */
  Box_prototype._addPropMargin = function(value) {
    if (value == null) value = Box._str.e;

    // this is expensive, so cache the value
    if (this._lastmarginvalue === value)
      return;
    this._lastmarginvalue = value;

    var arrWidth = null;

/* @JSC :: begin DEP */
    if (typeof(value) == Box._str.str && value.indexOf(":") > -1) {
      //old css syntax is probably being used; convert
      var cssFix = Box.cssToJsx(value, Box._str.mar);
      if (typeof(cssFix) != Box._str.obj) // error condition
        //convert the implied string to a parsed equivalent (creates a 5 element array)
        arrWidth = cssFix.match(Box.REGEX);
    } else {
/* @JSC :: end */
      if (typeof(value) == Box._str.num) {
        arrWidth = [value];
      } else {
        value = jsx3.util.strTrim(String(value));

        if (value !== Box._str.e) {
          if (isNaN(value))
            arrWidth = value.match(Box.REGEX);
          else
            arrWidth = [Number(value)];
        }
      }
/* @JSC :: begin DEP */
    }
/* @JSC :: end */

    if (arrWidth == null)
      this._expl.margin = Box._str.e;
    else if (arrWidth.length == 1)
      this._expl.margin = Box._str.mar + Box._str.c + arrWidth[0] + Box._str.pxs;
    else
      this._expl.margin = Box._str.mar + Box._str.c + arrWidth[1] + Box._str.pxc + arrWidth[2] + Box._str.pxc +
                                                      arrWidth[3] + Box._str.pxc + arrWidth[4] + Box._str.pxs;

//    jsx3.log("_addPropMargin  " + value + " -> " + arrWidth + " -> " + this._expl.margin);
  };

  /** @private @jsxobf-clobber */
  Box_prototype._addPropPadding = function(value) {
    if (value == null) value = Box._str.e;

    // this is expensive, so cache the value
    if (this._lastpaddingvalue === value)
      return;
    this._lastpaddingvalue = value;

    var arrWidth = null;

/* @JSC :: begin DEP */
    if (typeof(value) == Box._str.str && value.indexOf(":") > -1) {
      //old css syntax is probably being used; convert
      var cssFix = Box.cssToJsx(value, Box._str.pad);
      if (typeof(cssFix) != Box._str.obj) // error condition
        //convert the implied string to a parsed equivalent (creates a 5 element array)
        arrWidth = cssFix.match(Box.REGEX);
    } else {
/* @JSC :: end */
      if (typeof(value) == Box._str.num) {
        arrWidth = [value];
      } else {
        value = jsx3.util.strTrim(String(value));

        if (value !== Box._str.e) {
          if (isNaN(value))
            arrWidth = value.match(Box.REGEX);
          else
            arrWidth = [Number(value)];
        }
      }
/* @JSC :: begin DEP */
    }
/* @JSC :: end */

    var arrInt = null;

    if (arrWidth == null) {
      arrInt = [0, 0, 0, 0];
      this._expl.padding = Box._str.e;
    } else if (arrWidth.length == 1) {
      var w = arrWidth[0];
      arrInt = [w, w, w, w];
      this._expl.padding = Box._str.pad + Box._str.c + w + Box._str.pxs;
    } else {
      arrInt = [];
      for (var i = 1; i < 5; i++) {
        var w = parseInt(arrWidth[i]);
        if (isNaN(w)) w = 0;
        arrInt[i - 1] = w;
      }
      this._expl.padding = Box._str.pad + Box._str.c + arrInt[0] + Box._str.pxc + arrInt[1] + Box._str.pxc +
                                                       arrInt[2] + Box._str.pxc + arrInt[3] + Box._str.pxs;
    }

    this._expl.pwidth = arrInt[1] + arrInt[3];
    this._expl.pheight = arrInt[0] + arrInt[2];
    this._expl.ptop = arrInt[0];
    this._expl.pleft = arrInt[3];
  };

  /**
   * Returns an inline box that floats inline with existing content. This box can specify a width and height.
   * @param objProfile {Object} JavaScript object representing a class in a pseudo-compiled state that can be used by the box painter
   */
  Box_prototype.addChildProfile = function(objProfile) {
    var c = this._children;
    if (!c) c = this._children = [];
    c[c.length] = objProfile;
  };

  /**
   * Returns the child profile instance
   * @param intIndex {Number} index of child profile to return (zero-based array)
   * @return {String} DHTML
   */
  Box_prototype.getChildProfile = function(intIndex) {
    return this._children ? this._children[intIndex] : null;
  };

  /**
   * Returns the pixel offset between the inner edge of the parent and the outer edge of the client. (Accounts for border and padding)
   * @return {int}
   */
  Box_prototype.getClientLeft = function() {
    return this._expl.bleft + this._expl.pleft;
  };

  /**
   * Returns the pixel offset between the inner edge of the parent and the outer edge of the client. (Accounts for border and padding)
   * @return {int}
   */
  Box_prototype.getClientTop = function() {
    return this._expl.btop + this._expl.ptop;
  };

  /**
   * Returns the true client width (where content will reside) for the control. When creating a child profile, call this method to get the value for the 'parentwidth' property for the new child
   * @return {int}
   */
  Box_prototype.getClientWidth = function() {
    return this._expl.clientwidth;
  };

  /**
   * Returns the true client height (where content will reside) for the control. When creating a child profile, call this method to get the value for the 'parentheight' property for the new child
   * @return {int}
   */
  Box_prototype.getClientHeight = function() {
    return this._expl.clientheight;
  };

  /**
   * Returns the offset width for the profile.
   * @return {int}
   */
  Box_prototype.getOffsetWidth = function() {
    return this._expl.width;
  };

  /**
   * Returns the offset height for the profile.
   * @return {int}
   */
  Box_prototype.getOffsetHeight = function() {
    return this._expl.height;
  };

  Box_prototype.getBorderWidth = function() {
    return this._expl.bwidth;
  };

  Box_prototype.getBorderHeight = function() {
    return this._expl.bheight;
  };

  /**
   * Returns the width required by the boxpainter specific to the browser (IE/FFX) and mode (quirks/strict)
   * NOTE:  getPaintedWidth and getPaintedHeight have extra logic to factor out various form-field inputs. However, getClientHeight/getClientWidth are the
   *        recommended methods for getting the true drawspace (the box less padding, margin, border) per a given environment
   * @return {int}
   * @private
   */
  Box_prototype.getPaintedWidth = function() {
    var type = this._expl.type;
    var mode = html.getMode();
/* @JSC */ if (jsx3.CLASS_LOADER.SAF) {
    var val = ((type == "text" || type == "password" || this._expl.tagname == "textarea"  ) && mode == html.MODE_FF_QUIRKS) ?
        this._expl.width : this._expl.clientwidth;
/* @JSC */ } else {
    var val = mode == html.MODE_IE_QUIRKS ||
        ((type == "text" || type == "password" || this._expl.tagname == "textarea") && mode == html.MODE_FF_QUIRKS) ?
        this._expl.width : this._expl.clientwidth;
/* @JSC */ }
    return val === Box._str.e || isNaN(val) ? null : val;
  };

  /**
   * Returns the height required by the boxpainter specific to the browser (IE/FFX) and mode (quirks/strict)
   * @return {int}
   * @private
   */
  Box_prototype.getPaintedHeight = function() {
    var type = this._expl.type;
    var mode = html.getMode();
    var val = mode == html.MODE_IE_QUIRKS ||
        ((type == "text" || type == "password" || this._expl.tagname == "textarea") && mode == html.MODE_FF_QUIRKS) ?
        this._expl.height : this._expl.clientheight;
    return val === Box._str.e || isNaN(val) ? null : val;
  };

  /**
   * Returns the left required by the boxpainter specific to the browser (IE/FFX) and mode (quirks/strict)
   * @return {int}
   * @private
   */
  Box_prototype.getPaintedLeft = function() {
    return this._expl.left;
  };

  /**
   * Returns the top required by the boxpainter specific to the browser (IE/FFX) and mode (quirks/strict)
   * @return {int}
   * @private
   */
  Box_prototype.getPaintedTop = function() {
    return this._expl.top;
  };

  /**
   * Returns the boxtype.
   * @return {String} One of: box, relativebox, inline
   * @private
   */
  Box_prototype.getBoxType = function() {
    return this._expl.boxtype;
  };

  /**
   * Returns the CSS string for the margin
   * @return {int}
   * @private
   */
  Box_prototype.paintMargin = function() {
    return this._expl.margin || Box._str.e;
  };

  /**
   * Returns the top required by the boxpainter specific to the browser (IE/FFX) and mode (quirks/strict)
   * @return {int}
   * @private
   */
  Box_prototype.paintPadding = function() {
    return this._expl.padding || Box._str.e;
  };

  /**
   * Returns the top required by the boxpainter specific to the browser (IE/FFX) and mode (quirks/strict)
   * @return {int}
   * @private
   */
  Box_prototype.paintBorder = function() {
    return this._expl.border || Box._str.e;
  };

  /**
   * Returns the first document body in the document
   * @return {HTMLElement} first document body in the document
   * @private
   */
  Box.getBody = function() {
    return document.getElementsByTagName("body")[0];
  };

  /**
   * Returns the size of a standard scrollbar
   * @param objServerContainer {HTMLElement} HTML element that will contain a given GI server instance
   * @return {int}
   * @private
   */
  Box.getScrollSize = function(objServerContainer) {
    if (Box.SCROLL_SIZE == null) {
      //use the server container to paint the mode-test objects
      var objBody = objServerContainer || Box.getBody();

      //create div in order to determine scrollsize
      var test0 = '<div id="_jsx3_html_scr" class="jsx30block" style="padding:0px;margin:0px;border-width:0px;position:absolute;width:100px;height:100px;left:-100px;top:-100px;overflow:scroll;">&#160;</div>';
      html.insertAdjacentHTML(objBody, "beforeEnd", test0);
      var box0 = document.getElementById("_jsx3_html_scr");
      Box.SCROLL_SIZE = 100 - parseInt(box0.clientWidth);
      objBody.removeChild(box0);
    }
    return Box.SCROLL_SIZE;
  };

  /**
   * When overflow is set to 'scroll' or 'auto', accounts for the scrollbar structure itself,
   * @param strCSS {String} one of: scroll, auto
   * @return {int}
   * @private
   */
  Box.getScrollSizeOffset = function(strCSS) {
    var intSize = Box.getScrollSize();
    return html.getScrollSizeOffset(intSize,strCSS);
  };

/* @JSC :: begin DEP */

  /** @private @jsxobf-clobber */
  Box.cssToJsx = function(strInput,cssEl) {
    var output = "not matched";
    var top = "0";
    var right = "0";
    var bottom = "0";
    var left = "0";
    var rePadding = /(\s*(padding|padding-top|padding-right|padding-bottom|padding-left)\s*:\s*(\d+)(px)?\s*((\d+)(px)?)?\s*((\d+)(px)?)?\s*((\d+)(px)?)?\s*;)+/ig;
    var  reMargin = /(\s*(margin|margin-top|margin-right|margin-bottom|margin-left)\s*:\s*(-*\d+)(px)?\s*((-*\d+)(px)?)?\s*((-*\d+)(px)?)?\s*((-*\d+)(px)?)?\s*;)+/ig;
    var re = (cssEl==Box._str.pad)? rePadding : reMargin;
    var splited = strInput.split(Box._str.semi);

    if (splited) {
      for (var i = 0  ; i < splited.length ; i++) {
        // By spliting the rule semicolon is removed, also add it again
        var singlematched = splited[i]+Box._str.semi;
        // the index of matching should begin at index 0
        var searched = singlematched.search(re);
        if (searched > 0) {
          return {desc: "Missing Semicolon", cause: splited[i]};
        } else if (searched==-1){
          // String dose not matche the regular expression
          if (splited[i].search(/[^\s*]/i)>=0){
            return {desc: "Mismatch Rule", cause: splited[i]};
          }
        } else {
          output =  singlematched.replace(re,
          function($1 , $2 , $3 , $4 , $5 , $6 , $7, $8, $9 , $10 , $11 , $12 ,$13){
            if ($3.match(/-top/)){
              top = ($4==null)?"0":$4;
            }
            else if ($3.match(/-right/)){
              right = ($4==null)?"0":$4;
            }
            else if ($3.match(/-bottom/)){
              bottom = ($4==null)?"0":$4;
            }
            else if ($3.match(/-left/)){
              left = ($4==null)?"0":$4;
            }
            else {
              top = jsx3.util.strEmpty($4) ? "0" : $4;
              right = jsx3.util.strEmpty($7) ? top : $7;
              bottom = jsx3.util.strEmpty($10) ? top : $10;
              left = jsx3.util.strEmpty($13) ? right : $13;
            }
            return top+" "+right+" "+bottom+" "+left;
          });
          output = top+" "+right+" "+bottom+" "+left;
        }
      }
    }//if
    return output;
  };

  //regexp used to convert a css border definition to the format used by GI. This allows GI to calculate the border width
  var myRegBTW = /border(?:(?:-top(?:-width)?)|(?:-width))?:[^0-9]*([0-9]*)px/gi;
  var myRegBTC = /border(?:(?:-top(?:-color)?)|(?:-color))?:[^;]*((?:#[a-zA-Z0-9]{6})|(?:rgb\s*\(\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\))|(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenrod|DarkGray|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGray|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGray|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|Goldenrod|Gray|Green|GreenYellow|Honeydew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCora|LightCyan|LightGoldenrodYellow|LightGreen|LightGrey|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGray|LightSteelBlu|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquamarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenrod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|Seashell|Sienna|Silver|SkyBlue|SlateBlue|SlateGray|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen))/gi;
  var myRegBTS = /border(?:(?:-top(?:-style)?)|(?:-style))?:[^;]*(dashed|dotted|double|groove|hidden|inset|none|outset|ridge|solid)/gi;
  var myRegBRW = /border(?:(?:-right(?:-width)?)|(?:-width))?:[^0-9]*([0-9]*)px/gi;
  var myRegBRC = /border(?:(?:-right(?:-color)?)|(?:-color))?:[^;]*((?:#[a-zA-Z0-9]{6})|(?:rgb\s*\(\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\))|(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenrod|DarkGray|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGray|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGray|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|Goldenrod|Gray|Green|GreenYellow|Honeydew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCora|LightCyan|LightGoldenrodYellow|LightGreen|LightGrey|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGray|LightSteelBlu|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquamarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenrod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|Seashell|Sienna|Silver|SkyBlue|SlateBlue|SlateGray|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen))/gi;
  var myRegBRS = /border(?:(?:-right(?:-style)?)|(?:-style))?:[^;]*(dashed|dotted|double|groove|hidden|inset|none|outset|ridge|solid)/gi;
  var myRegBBW = /border(?:(?:-bottom(?:-width)?)|(?:-width))?:[^0-9]*([0-9]*)px/gi;
  var myRegBBC = /border(?:(?:-bottom(?:-color)?)|(?:-color))?:[^;]*((?:#[a-zA-Z0-9]{6})|(?:rgb\s*\(\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\))|(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenrod|DarkGray|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGray|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGray|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|Goldenrod|Gray|Green|GreenYellow|Honeydew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCora|LightCyan|LightGoldenrodYellow|LightGreen|LightGrey|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGray|LightSteelBlu|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquamarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenrod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|Seashell|Sienna|Silver|SkyBlue|SlateBlue|SlateGray|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen))/gi;
  var myRegBBS = /border(?:(?:-bottom(?:-style)?)|(?:-style))?:[^;]*(dashed|dotted|double|groove|hidden|inset|none|outset|ridge|solid)/gi;
  var myRegBLW = /border(?:(?:-left(?:-width)?)|(?:-width))?:[^0-9]*([0-9]*)px/gi;
  var myRegBLC = /border(?:(?:-left(?:-color)?)|(?:-color))?:[^;]*((?:#[a-zA-Z0-9]{6})|(?:rgb\s*\(\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\))|(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenrod|DarkGray|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGray|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGray|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|Goldenrod|Gray|Green|GreenYellow|Honeydew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCora|LightCyan|LightGoldenrodYellow|LightGreen|LightGrey|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGray|LightSteelBlu|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquamarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenrod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|Seashell|Sienna|Silver|SkyBlue|SlateBlue|SlateGray|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen))/gi;
  var myRegBLS = /border(?:(?:-left(?:-style)?)|(?:-style))?:[^;]*(dashed|dotted|double|groove|hidden|inset|none|outset|ridge|solid)/gi;

  /** @private @jsxobf-clobber */
  Box.cssBorderToJsx = function(myCSS) {
    var objBorder = {top:{width:0,color:"",style:""},right:{width:0,color:"",style:""},bottom:{width:0,color:"",style:""},left:{width:0,color:"",style:""}};

    //top
    while(myRegBTW.exec(myCSS))
      objBorder.top.width = RegExp.$1;
    while(myRegBTC.exec(myCSS))
      objBorder.top.color = RegExp.$1;
    while(myRegBTS.exec(myCSS))
      objBorder.top.style = RegExp.$1;

    //right
    while(myRegBRW.exec(myCSS))
      objBorder.right.width = RegExp.$1;
    while(myRegBRC.exec(myCSS))
      objBorder.right.color = RegExp.$1;
    while(myRegBRS.exec(myCSS))
      objBorder.right.style = RegExp.$1;

    //bottom
    while(myRegBBW.exec(myCSS))
      objBorder.bottom.width = RegExp.$1;
    while(myRegBBC.exec(myCSS))
      objBorder.bottom.color = RegExp.$1;
    while(myRegBBS.exec(myCSS))
      objBorder.bottom.style = RegExp.$1;

    //left
    while(myRegBLW.exec(myCSS))
      objBorder.left.width = RegExp.$1;
    while(myRegBLC.exec(myCSS))
      objBorder.left.color = RegExp.$1;
    while(myRegBLS.exec(myCSS))
      objBorder.left.style = RegExp.$1;


    return objBorder.top.width + Box._str.pxc + objBorder.top.style + " " + objBorder.top.color + Box._str.semi +
           objBorder.right.width + Box._str.pxc + objBorder.right.style + " " + objBorder.right.color + Box._str.semi +
           objBorder.bottom.width + Box._str.pxc + objBorder.bottom.style + " " + objBorder.bottom.color + Box._str.semi +
           objBorder.left.width + Box._str.pxc + objBorder.left.style + " " + objBorder.left.color;
  };

/* @JSC :: end */

  /**
   * toString
   * @return {int}
   */
  Box_prototype.toString = function() {
    var s = "IMPLICIT:\n";
    for (var p in this.implicit) s+= p + ": " + this.implicit[p] + "\n";
    s+= "\nEXPLICIT:\n";
    for (var p in this._expl) s+= p + ": " + this._expl[p] + "\n";
    return s;
  };

});

/**
 * @package
 */
jsx3.Class.defineClass("jsx3.app.Model.Loading", jsx3.gui.Painted, null, function(Loading, Loading_prototype) {

  Loading_prototype.init = function(objXML, intLoadType, arrParams) {
    /* @jsxobf-clobber */
    this._jsxxml = objXML;
    /* @jsxobf-clobber-shared */
    objXML._jsxloading = true;
    /* @jsxobf-clobber */
    this._jsxloadtype = intLoadType;
    /* @jsxobf-clobber */
    this._jsxparams = arrParams;

    if (intLoadType == jsx3.app.Model.LT_SLEEP_DESER || intLoadType == jsx3.app.Model.LT_SLEEP_PD) {
      jsx3.sleep(function() {
        var obj = this._deserialize();
        if (intLoadType == jsx3.app.Model.LT_SLEEP_DESER)
          this._repaint();
        else
          jsx3.sleep(function() {this._repaint();}, null, this);
      }, null, this);
    }
  };

  /** @private @jsxobf-clobber */
  Loading_prototype._deserialize = function() {
    var objParent = this.getParent();
    var newObj = objParent._doLoad.apply(this, [this._jsxxml].concat(this._jsxparams));
    objParent.setChild(newObj, jsx3.app.Model.PERSISTEMBED, null, this._jsxparams[1]);
    objParent.insertBefore(newObj, this, false);

    var objDoc = objParent.getDocument();
    if (objDoc) {
      var elm = objDoc.getElementById(this._jsxid);
      if (elm) {
        elm.id = newObj._jsxid;
      }
    }

    objParent.removeChild(this);

    /* @jsxobf-clobber */
    this._jsxdelegate = newObj;

    if (this._jsxloadtype == jsx3.app.Model.LT_SHOW_DESER)
      this._repaint();

    return newObj;
  };
  
  Loading_prototype.getName = function() {
    if (typeof(this._jsxname) == "undefined") {
      var node = this._jsxxml.selectSingleNode("jsx1:strings/@jsxname");
      /* @jsxobf-clobber */
      this._jsxname = node ? node.getValue() : null;
    }
    return this._jsxname;
  };
  
  Loading_prototype.getType = function() {
    return this._jsxloadtype;
  };
  
  /** @private @jsxobf-clobber-shared */
  Loading_prototype.toXMLElm = function(objXML, objProperties) {
    return this._jsxxml.cloneNode(true);
  };

  /** @private @jsxobf-clobber */
  Loading_prototype._repaint = function() {
    this._jsxdelegate.repaint();
  };

  Loading_prototype.paint = function() {
    return this.paintDomHolder();
  };

  Loading_prototype.getRendered = function() {
    return null;
  };

  Loading_prototype._setShowState = function(bShow) {
    if (bShow && this._jsxloadtype == jsx3.app.Model.LT_SHOW_DESER)
      this._deserialize();
    this.jsxsuper(bShow);
    return this._jsxdelegate;
  };

});
