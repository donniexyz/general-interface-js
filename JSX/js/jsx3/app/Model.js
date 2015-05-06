/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _jsxevents _jsxtempdynamic _jsxdynamic _jsxloading _applyId _varNameIndex
/**
 * The abstract base class that defines the JSX DOM. Instances of this class exist as nodes in a tree, each with
 * a single parent and multiple children. This class includes all the methods for querying and manipulating the DOM's
 * tree structure, such as <code>getChild()</code>, <code>adoptChild()</code>, <code>getParent()</code>, etc.
 *
 * @abstract
 */
jsx3.Class.defineClass("jsx3.app.Model", null, [jsx3.util.EventDispatcher], function(Model, Model_prototype) {

  var Entity = jsx3.xml.Entity;
  var Document = jsx3.xml.Document;
  var IllegalArgumentException = jsx3.IllegalArgumentException;

   /**
   * {int} Persistance value fora child that is temporarily part of the DOM tree and will not be persisted.
   * @final @jsxobf-final
   */
  Model.PERSISTNONE = 0;

  /**
   * {int} Normal persistance value for a child that will be persisted.
   * @final @jsxobf-final
   */
  Model.PERSISTEMBED = 1;

  /**
   * {int} Persistance value for a child that exists in an external serialization file and is referenced by URI.
   * @final @jsxobf-final
   */
  Model.PERSISTREF = 2;

  /**
   * {int} Persistance value for a child that exists in an external serialization file and is referenced by URI. The
   *   loading of a child with this persistence value will happen asynchronously after the file that references it is
   *   loaded.
   * @final @jsxobf-final
   */
  Model.PERSISTREFASYNC = 3;

  /**
   * {int} The normal load type for a DOM branch. The DOM branch deserializes and paints with its parent.
   * @final @jsxobf-final
   */
  Model.LT_NORMAL = 0;

  /**
   * {int} Load type indicating that the DOM branch will paint after its parent paints and the call stack resets.
   * @final @jsxobf-final
   * @since 3.5
   */
  Model.LT_SLEEP_PAINT = 1;

  /**
   * {int} Load type indicating that the DOM branch will deserialize and paint after its parent deserializes and the
   *    call stack resets.
   * @final @jsxobf-final
   * @since 3.5
   */
  Model.LT_SLEEP_DESER = 2;

  /**
   * {int} Load type indicating that the DOM branch will deserialize after its parent deserializes and the call stack
   *    resets and will paint after its parent paints and the call stack resets.
   * @final @jsxobf-final
   * @since 3.5
   */
  Model.LT_SLEEP_PD = 3;

  /**
   * {int} Load type indicating that the DOM branch will paint as needed when it becomes visible. It is left to
   *    subclasses of Model to implement this functionality.
   * @final @jsxobf-final
   * @since 3.5
   */
  Model.LT_SHOW_PAINT = 4;

  /**
   * {int} Load type indicating that the DOM branch will deserialize and paint as needed when it becomes visible.
   *    It is left to subclasses of Model to implement this functionality.
   * @final @jsxobf-final
   * @since 3.5
   */
  Model.LT_SHOW_DESER = 5;

  /**
   * {String} Minimum supported version for serialization files
   */
  Model.CURRENT_VERSION = "urn:tibco.com/v3.0";
  /**
   * {String} Minimum supported version CIF formatted serialization files
   * @since 3.2
   */
  Model.CIF_VERSION =  "http://xsd.tns.tibco.com/gi/cif/2006";

  /**
   * @package
   * @final @jsxobf-final
   */
  Model.FRAGMENTNS = "JSXFRAG";

  /**
   * {int} The number of milliseconds before asynchronous component loads time out.
   * @since 3.4
   */
  Model.ASYNC_LOAD_TIMEOUT = 60000;

  /** {String} @private @jsxobf-clobber */
  Model._CIFPROCESSORURL = jsx3.resolveURI("jsx:///xsl/cif_resolver.xsl");

  // TODO: eventually it would be nice to be able to clobber all of the following
  /** {String} @private */
  Model_prototype._jsxid = null;
  /** {jsx3.app.Model} @private @jsxobf-clobber */
  Model_prototype._jsxparent = null;
  /** {Array<jsx3.app.Model>} @private @jsxobf-clobber */
  Model_prototype._jsxchildren = null;
  /** {String} @private @jsxobf-clobber-shared */
  Model_prototype._jsxns = null;
  /** {jsx3.app.Server} @private */
  Model_prototype._jsxserver = null;
  /** {boolean} @private @jsxobf-clobber */
  Model_prototype._jsxfragment = null;
  /** {int} @private @jsxobf-clobber */
  Model_prototype._jsxpersistence = null;
  /** {Object<String,String>} @private @jsxobf-clobber */
  Model_prototype._jsxmeta = null;
  /** {boolean} @private @jsxobf-clobber */
  Model_prototype._jsxshowstate = true;

  /**
   * The instance initializer.
   * @param strName {String} a unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param-private strInstanceOf
   */
  Model_prototype.init = function(strName, strInstanceOf) {
    //call constructor for super class just in case a global mod needs to be communicated on down from the top-most jsx class, inheritance
    this.jsxsuper();

    //initialize and define common properties shared by all subclasses of jsx3.app.Model
/* @JSC :: begin DEP */
    // DEPRECATED: remove strInstanceOf parameter and references
    this._jsxinstanceof = (strInstanceOf == null) ? "jsx3.app.Model" : strInstanceOf;
/* @JSC :: end */
    this.jsxname = strName;
  };

  /**
   * Returns the child DOM node of this node at the given index or with the given name. If a name is supplied, the
   * children are searched in order and the first matching child is returned.
   *
   * @param vntIndexOrName {int|String} either the integer index or the string name of the child.
   * @return {jsx3.app.Model} the child at the given index or with the given name, or <code>null</code> if no such
   *     child exists.
   */
  Model_prototype.getChild = function(vntIndexOrName) {
    var intIndex = null;

    if (this._jsxchildren != null) {
      if (typeof(vntIndexOrName) == "string" || isNaN(vntIndexOrName)) {
        var index = -1;
        var childArray = this.getChildren();
        var maxLen = childArray.length;
        for (var i = 0; i < maxLen; i++) {
          if (vntIndexOrName == childArray[i].getName()) {
            intIndex = i;
            break;
          }
        }
      } else {
        //calling function passed an index (integer), so just set to local variable
        intIndex = vntIndexOrName;
      }

      if (intIndex >= 0 && intIndex < this._jsxchildren.length)
        return this._jsxchildren[intIndex];
    }

    return null;
  };

  /**
   * Returns the first child.
   * @return {jsx3.app.Model}
   */
  Model_prototype.getFirstChild = function() {
    return this.getChild(0);
  };

  /**
   * Returns the last child.
   * @return {jsx3.app.Model}
   */
  Model_prototype.getLastChild = function() {
    return this.getChild(this.getChildren().length-1);
  };

  /**
   * Returns the next sibling.
   * @return {jsx3.app.Model}
   */
  Model_prototype.getNextSibling = function() {
    if (! this._jsxparent) return null;
    return this._jsxparent.getChild(this.getChildIndex() + 1);
  };

  /**
   * Returns the previous sibling.
   * @return {jsx3.app.Model}
   */
  Model_prototype.getPreviousSibling = function() {
    if (! this._jsxparent) return null;
    return this._jsxparent.getChild(this.getChildIndex() - 1);
  };

  /**
   * Returns an array containing all the child DOM nodes of this object. The return value is the original array rather
   * than a copy and should not be modified.
   * @return {Array<jsx3.app.Model>}
   */
  Model_prototype.getChildren = function() {
    if (this._jsxchildren == null) this._jsxchildren = [];
    return this._jsxchildren;
  };

  /**
   * Returns the persistence bit for this model object.
   * @return {int} one of <code>PERSISTNONE</code>, <code>PERSISTEMBED</code>, <code>PERSISTREF</code>,
   *    <code>PERSISTREFASYNC</code>.
   * @see #PERSISTNONE
   * @see #PERSISTEMBED
   * @see #PERSISTREF
   * @see #PERSISTREFASYNC
   */
  Model_prototype.getPersistence = function() {
    return this._jsxpersistence;
  };

  /** @package */
  Model_prototype.getPersistenceUrl = function() {
    return this.getMetaValue("url");
  };

  /**
   * Sets the persistence bit for this model object.
   * @param intPersist {int} one of <code>PERSISTNONE</code>, <code>PERSISTEMBED</code>, <code>PERSISTREF</code>,
   *    <code>PERSISTREFASYNC</code>.
   * @return {jsx3.app.Model} this object
   * @see #PERSISTNONE
   * @see #PERSISTEMBED
   * @see #PERSISTREF
   * @see #PERSISTREFASYNC
   */
  Model_prototype.setPersistence = function(intPersist) {
    this._jsxpersistence = intPersist;
    return this;
  };

  /**
   * Appends a child DOM node to this parent DOM node. If the child already has a parent, <code>adoptChild()</code>
   * should be used instead to ensure that the child is removed from its current parent.
   *
   * @param objChild {jsx3.app.Model} the root node of a DOM fragment.
   * @param intPersist {int} defines how the child will be persisted/serialized. The valid values are the four
   *    persistence values defined as static fields in this class.
   * @param strSourceURL {String|jsx3.net.URI} the path to the serialization file where the child exists. This parameter is only
   *    relevant if the given <code>intPersist</code> is <code>PERSISTREF</code> or <code>PERSISTREFASYNC</code>.
   * @param strNS {String} the namespace of the child to append. This parameter is normally not required but is useful
   *    when sharing DOM nodes between servers with different namespaces.
   * @return {jsx3.app.Model|boolean} this object or <code>false</code> if the set was vetoed
   * @throws {jsx3.Exception} if this object is part of a DOM fragment (the namespace is null) and the
   *    <code>strNS</code> parameter is not specified.
   *
   * @see #adoptChild()
   * @see #PERSISTNONE
   * @see #PERSISTEMBED
   * @see #PERSISTREF
   * @see #PERSISTREFASYNC
   */
  Model_prototype.setChild = function(objChild, intPersist, strSourceURL, strNS) {
    if (!this.onSetChild(objChild) || !objChild.onSetParent(this)) return false;

    //find out the server that will own this object instance
    var bFragment = false;
    if (strNS == null && this._jsxns == null) {
      strNS = Model.FRAGMENTNS;
    } else if (strNS != null) {
      bFragment = true;
    } else {
      strNS = this._jsxns;
    }

    var objServer = this.getServer();

    //only add this item to a server instance if not part of the 'fragment' ns
    if (strNS != Model.FRAGMENTNS && objServer && this._jsxns == strNS) {
      //all items are fragments until added to a valid DOM.  Some fragments already have nested descendants that also need to be bound and registered
      this._bindFragment(objChild, strNS, objChild._jsxfragment != null, objServer);
    } else {
      //the parent ('this') does not yet belong to a DOM (its a fragment); set a flag that lets us know, so when it is finally added to a DOM, its descendant _jsxns props are updated and name/id are applied
      this._jsxfragment = 1;
    }

    //create an array to hold child if not yet created
    var children = this._jsxchildren;
    if (!children) children = this._jsxchildren = [];

    //increment the array and reference the new object
    children[children.length] = objChild;
    objChild._jsxparent = this;

    //set persistent type and urls if applicable
    if (intPersist == null) intPersist = Model.PERSISTNONE;
    objChild._jsxpersistence = intPersist;
    if (strSourceURL && (intPersist == Model.PERSISTREF || intPersist == Model.PERSISTREFASYNC))
      objChild.setMetaValue("url", strSourceURL.toString());

    this.onChildAdded(objChild);

    //issue a DOM onChange call to reflect the update; pass the id of this object as well as the newly-added child;
    if (!bFragment && strNS != Model.FRAGMENTNS)
      objServer.getDOM().onChange(jsx3.app.DOM.TYPEADD, this.getId(), objChild.getId());

    return this;
  };

  /**
   * Hook that allows for a prospective parent DOM node to veto the adoption of a child.
   * @return {boolean} true to allow the set, false to veto
   * @protected
   */
  Model_prototype.onSetChild = function(objChild) {
    return true;
  };

  /**
   * Hook that allows for a prospective child DOM node to veto its adoption by a parent. This method is only called if
   * the prospective parent has not already vetoed the adoption in the <code>onSetChild()</code> method.
   * @return {boolean} true to allow the set, false to veto
   * @protected
   */
  Model_prototype.onSetParent = function(objParent) {
    return true;
  };

  /**
   * Hook that notifies this model object that one of its children has been removed. This hook exists simply to allow
   * this object to perform cleanup/re-render, and does not provide a veto mechanism. This method is called after
   * the child has been removed from the model (<code>this.getChildren()</code> does not contain <code>objChild</code>)
   * and after the child has been removed from the view (<code>objChild.getRendered()</code> is also null).
   * <p/>
   * This method is only called if the child is being removed from the DOM but this object (the parent) is not
   * being removed. Therefore, this hook cannot be relied upon for garbage collection.
   * <p/>
   * If <code>removeChildren()</code> is called on this object, this hook is called exactly once after all children
   * have been removed. In that case, the first parameter to this method will be the array of children and the
   * second parameter will be <code>null</code>.
   * <p/>
   * In general a method overriding this method should begin by calling <code>jsxsuper</code>.
   *
   * @param objChild {jsx3.app.Model|Array<jsx3.app.Model>} the child that was removed
   * @param intIndex {int} the index of the removed child
   * @protected
   */
  Model_prototype.onRemoveChild = function(objChild, intIndex) {
  };

  /**
   * Hook that notifies the model object that a child has been added to it.
   * @param objChild {jsx3.gui.Model} the added child.
   * @since 3.7
   */
  Model_prototype.onChildAdded = function(objChild) {
  };

  /**
   * called by setChild; recurses through the descenants and ensures that they share the common namespace and
   *             are assigned system IDs; if @objChild has descendants (if @bDeep == true), they are also added
   * @param objChild {jsx3.app.Model} the namespace to assign
   * @param strNS {String} the namespace to assign
   * @param bDeep {boolean} if true, the child being added has descendants that need to also be added
   * @private
   * @jsxobf-clobber
   */
  Model_prototype._bindFragment = function(objChild, strNS, bDeep, objServer) {
    //update the namespace property for the child to match that of the parent objChild._jsxns = strNS;
    objChild._jsxns = strNS;
    objChild._applyId(strNS);

    //assign the system Id to @objChild and add a pointer to @objChild to the systemhash
    objServer.getDOM().add(objChild);

    //recurse through descendant of @objChild if @objChild is a 'deep' fragment -- one with descendants
    if (bDeep) {
      //remove the fragment flag, since now a valid DOM object
      delete objChild._jsxfragment;
      //iterate through descendants
      var objKids = objChild.getChildren();
      var maxLen = objKids.length;
      for (var i = 0; i < maxLen; i++)
        objChild._bindFragment(objKids[i], strNS, true, objServer);
    }
  };

  /** @private @jsxobf-clobber-shared */
  Model_prototype._applyId = function(strNS) {
    this._jsxid = jsx3.app.DOM.newId(strNS);
  };

  /**
   * Removes a DOM child from this object. This method removes the on-screen DHTML of the removed object. The removed
   * child will be completely derefenced from the DOM and will be prepped for garbage collection. If a DOM child must
   * continue to exist after removing it from this parent, <code>adoptChild()</code> should be used instead of this
   * method.
   *
   * @param vntItem {int|jsx3.app.Model} either the index of the child to remove or the child itself.
   * @return {jsx3.app.Model} this object
   *
   * @see #adoptChild()
   */
  Model_prototype.removeChild = function(vntItem) {
    //this function can accept an object or integer, convert to integer if an object
    var intIndex = -1;

    if (!(isNaN(vntItem))) {
      // calling function passed an index (integer), so just set to local variable
      intIndex = Number(vntItem);
    } else if (vntItem instanceof jsx3.app.Model) {
      intIndex = vntItem._jsxparent == this ? vntItem.getChildIndex() : -1;
    } else {
      throw new IllegalArgumentException("vntItem", vntItem);
    }

    var objChild = this.getChild(intIndex);
    if (objChild != null) {
      var objServer = this.getServer();
      this._removeChildRecurse(intIndex, objServer);
      this.onRemoveChild(objChild, intIndex);

      // 6) trigger the DOM change event now that the item has been removed
      if (objServer)
        objServer.getDOM().onChange(jsx3.app.DOM.TYPEREMOVE, this.getId(), objChild.getId());
    }
  };

  /** @private @jsxobf-clobber */
  Model_prototype._removeChildRecurse = function(intIndex, objServer, bAll) {
    //if a valid index was found, proceed
    if (intIndex >= 0 && intIndex < this.getChildren().length) {
      // get handle to the child
      var objChild = this.getChild(intIndex);

      if (! bAll)
        objChild.destroyView(this);

      // 0) recursively remove any children/descendants belonging to the child (this allows for more inclusive dereferencing and resource cleanup)
      var maxLen = objChild.getChildren().length;
      //loop through the collection of children, calling 'removeChild()' to remove each, one-by-one
      for (var i = (maxLen-1); i >= 0; i--)
        objChild._removeChildRecurse(i, objServer, true);

      // 1) dereference the object by removing it from the global arrays that point to the object
      if (objServer)
        objServer.getDOM().remove(objChild);

      // 2) remove circular reference from child (objChild) back to the parent (this)
      delete objChild._jsxparent;

      // 3) restack the child array to remove a reference to the now-obsolete item
      if (! bAll)
        this._jsxchildren.splice(intIndex, 1);
      else if (intIndex == 0)
        this._jsxchildren.splice(0, this._jsxchildren.length);

      // 5) pass ref to parent, since the binding is broken, but the child may still need to have ref to parent
      objChild.onDestroy(this);
    } else {
      throw new IllegalArgumentException("intIndex", intIndex);
    }
  };

  /**
   * Removes some or all children of this object.
   * @param arrChildren {Array<int|jsx3.app.Model>} the children to remove. If this parameter is not provided then all
   *   children are removed.
   * @return {jsx3.app.Model} this object.
   *
   * @see #removeChild()
   */
  Model_prototype.removeChildren = function(arrChildren) {
    var objServer = this.getServer();

    if (arrChildren == null) {
      arrChildren = this.getChildren().concat();
      for (var i = arrChildren.length - 1; i >= 0; i--) {
        arrChildren[i].destroyView(this);
        this._removeChildRecurse(i, objServer, true);
      }
    } else {
      var index = null;
      arrChildren = arrChildren.concat();

      for (var i = arrChildren.length - 1; i >= 0; i--) {
        var c = arrChildren[i];
        if (typeof(c) == "number") {
          index = c;
          arrChildren[i] = this.getChild(index);
        } else {
          index = c.getChildIndex();
        }

        this._removeChildRecurse(index, objServer, false);
      }
    }

    if (arrChildren.length > 0)
      this.onRemoveChild(arrChildren, null);

    return this;
  };

  /**
   * Returns an object reference to the server that owns this object. This method returns <code>null</code> if this
   * object is part of a DOM fragment. Until an object is added to a DOM tree by passing it as the parameter to
   * <code>setChild()</code>, the object will be a DOM fragment.
   * @return {jsx3.app.Server}
   */
  Model_prototype.getServer = function() {
    var node = this;
    while (node) {
      if (node._jsxserver) return node._jsxserver;
      node = node._jsxparent;
    }
    return null;
  };

  /** @package */
  Model_prototype._getLocale = function() {
    var objServer = this.getServer();
    return objServer != null ? objServer.getLocale() : jsx3.System.getLocale();
  };

  /** @package */
  Model_prototype._getLocaleProp = function(strProp, fctClass) {
    if (fctClass) strProp = fctClass.jsxclass.getName() + "." + strProp;
    return jsx3.System.getLocaleProperties(this._getLocale()).get(strProp);
  };

  /**
   * Appends a DOM node to this object after removing the node from its former parent reference. If the node to append
   * does not already have a DOM parent, <code>setChild()</code> should be used instead of this method.
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
  Model_prototype.adoptChild = function(objChild, bRepaint, bForce) {
    this._adoptChild(objChild.getChildIndex(), objChild, bRepaint, bForce, false);
  };

  /**
   * @package
   */
  Model_prototype.adoptChildrenFrom = function(objParent, arrChildren, bRepaint, bForce) {
    if (!arrChildren) arrChildren = objParent.getChildren().concat();
    if (arrChildren.length > 0) {
      for (var i = 0; i < arrChildren.length; i++)
        this._adoptChild(arrChildren[i].getChildIndex(), arrChildren[i], bRepaint, bForce, true);
      objParent.onRemoveChild(arrChildren, null);
      for (var i = 0; i < arrChildren.length; i++)
        this.onChildAdded(arrChildren[i]);
    }
  };

  /**
   * Rearranges two siblings, placing the sibling at intMoveIndex before the sibling at intPrecedeIndex
   * @private
   * @jsxobf-clobber
   */
  Model_prototype._insertBefore = function(intMoveIndex,intPrecedeIndex) {
    //exit early if the move wouldn't occur
    if(intMoveIndex == intPrecedeIndex || intMoveIndex == intPrecedeIndex-1) return false;

    //reassemble the child array
    var objChildren = this.getChildren();
    var intAdjustedP = (intMoveIndex < intPrecedeIndex) ? intPrecedeIndex - 1 : intPrecedeIndex;
    var objMove = objChildren.splice(intMoveIndex, 1);
    var objStart = objChildren.splice(0, intAdjustedP);
    this._jsxchildren = objStart.concat(objMove,objChildren);

    this.onChildAdded(objMove[0]);
    //fire the DOM onchange event since we affected the MODEL directly
    var s = this.getServer();
    if (s)
      s.getDOM().onChange(jsx3.app.DOM.TYPEREARRANGE,this.getId(),intPrecedeIndex);

    return true;
  };

  /**
   * Assigns objMoveChild as the previousSibling of objPrecedeChild
   * @param objMoveChild {jsx3.app.Model} the one being moved. Can belong to this object, another object, or can be a GUI fragment
   * @param objPrecedeChild {jsx3.app.Model} the one to insert before
   * @param bRepaint {boolean} if <code>false</code> the repaint will be suppressed (useful for multiple obejct updates
   *    that would lead to unnecessary updates to the VIEW)
   * @return {Boolean} true if successful
   */
  Model_prototype.insertBefore = function(objMoveChild,objPrecedeChild,bRepaint) {
    //adopt first if not common parent
    var bSuccess = true;
    if (!objMoveChild._jsxparent || !objPrecedeChild) {
      //user is inserting a fragment
      bSuccess = this.setChild(objMoveChild);
    } else if(objMoveChild._jsxparent != this) {
      //user is adopting
      bSuccess = this._adoptChild(objMoveChild.getChildIndex(),objMoveChild,false,true,true);
    }

    if (bSuccess) {
      //now do the reorder
      if (objPrecedeChild)
        bSuccess = this._insertBefore(objMoveChild.getChildIndex(), objPrecedeChild.getChildIndex());

      //check for suppress and return
      if (bRepaint !== false)
        this.repaint();
    }

    return bSuccess;
  };

  /** @private @jsxobf-clobber */
  Model_prototype._adoptChild = function(intIndex, objChild, bRepaint, bForce, bMulti) {
    //make sure the adoption is allowed
    if (bForce) {
      this.onSetChild(objChild);
      objChild.onSetParent(this);
    } else {
      if (!this.onSetChild(objChild) || !objChild.onSetParent(this))
        return false;
    }

    //1) get handle to parent, since we're about to lose the ref
    var objParent = objChild._jsxparent;

// JCG: I don't think that this is necessary ... was causing box model reconstruction before the adoption
//    //destroy the box profile. the new parent will determine it (this is a MODEL method for the Box profile)
//    objChild.recalc();

    //2) remove circular reference from child (objChild) to the former parent(this)
    delete objChild._jsxparent;

    //2b) remove box profile (allow it to be reconstructed in context of the new parent)
    // HACK: superclass referencing subclass
    if (objChild.clearBoxProfile)
      objChild.clearBoxProfile(true);

    //3) restack the former parent's child array to remove a reference to the now-obsolete item
    if (objParent._jsxchildren != null) objParent._jsxchildren.splice(intIndex, 1);

    //4) destroy the existing view for the child (the user has no choice in this; they can choose to not paint the new, but the old has to be removed)
    objChild.destroyView(objParent);

    // send old parent onRemove message
    if (! bMulti)
      objParent.onRemoveChild(objChild, intIndex);

    //persist ref to servers involved
    var curServer = objParent.getServer();
    var newServer = this.getServer();
    var bServerChange = curServer != newServer;

    //5) call recursive fn for child if the new parent belongs to a different server (they can't access the cache where they once stored their data, etc, and other server-specific resources that may no longer be accessible)

    if (bServerChange)
      this._adoptChildRecurse(objChild, objParent, curServer, newServer);

    //fire the onChange for the old server (we just removed a child)
    if (curServer)
      curServer.getDOM().onChange(jsx3.app.DOM.TYPEREMOVE, objParent.getId(), objChild.getId());

    //INSERT OBJCHILD INTO THE CHILD ARRAY FOR THE NEW PARENT
    var children = this._jsxchildren;
    if (!children) children = this._jsxchildren = [];
    children[children.length] = objChild;
    objChild._jsxparent = this;

    if (! bMulti)
      this.onChildAdded(objChild);

    //update the VIEW immediately to match the model unless explicitly told to wait
    if (bRepaint !== false) this.viewUpdateHook(objChild, bMulti && objParent._jsxchildren.length > 0);

    //fire the onChange for the new server (we just added a child)
    if (newServer)
      newServer.getDOM().onChange(jsx3.app.DOM.TYPEADD, this.getId(), objChild.getId());

    //return a handle to this
    return this;
  };

  /** @package @jsxobf-clobber-shared */
  Model_prototype.viewUpdateHook = function(objChild, bGroup) {
  };

  /**
   * destroys VIEW for the object; typically called by adoptChild and onDestroy events; subclass to handle more-complex cleanup (such as a TD/TR)
   * @package
   */
  Model_prototype.destroyView = function(objParent) {
  };

  /**
   * called when an adoption occurs that span servers; when this occurs, the item is further cleaned up to ensure proper behaviors
   * @param objChild {jsx3.app.Model} JSX object being moved between servers
   * @private
   * @jsxobf-clobber
   */
  Model_prototype._adoptChildRecurse = function(objChild, objFormerParent, curServer, newServer) {
    //dereference the object by removing it from the global arrays that point to the object
    curServer.getDOM().remove(objChild);
    // reset the child's server namespace
    objChild._jsxns = this._jsxns;
    // insert pointers into the new server's hash to ref the child
    newServer.getDOM().add(objChild);

    objChild.onChangeServer(newServer, curServer);

    var children = objChild.getChildren();
    for (var i = 0; i < children.length; i++)
      objChild._adoptChildRecurse(children[i], null, curServer, newServer);
  };

  /**
   * Called when the server owning this DOM node changes.
   * @param objNewServer {jsx3.app.Server}
   * @param objOldServer {jsx3.app.Server}
   * @protected
   * @since 3.5
   */
  Model_prototype.onChangeServer = function(objNewServer, objOldServer) {
  };

  /**
   * Creates and returns an exact replica of the object. The clone will be appended as a new child node of this
   * object's parent node.
   * @param intPersist {int} the persistance value of the clone.
   * @param intMode {int} <code>0</code> for insert as the last child of the parent of this object and paint,
   *     <code>1</code> for insert as the last child of this parent of this object and do not paint, or <code>2</code>
   *     for load as a fragment.
   * @return {jsx3.app.Model} the clone.
   * @throws {jsx3.Exception} if this object has no parent DOM node.
   */
  Model_prototype.doClone = function(intPersist, intMode) {
    var objLoadInto = intMode == 2 ? this.getServer().getRootBlock() : this._jsxparent;

    if (objLoadInto) {
      // Clone by serializing to XML and then deserializing, which ensures only valid structures get cloned
      var objJSXClone = objLoadInto._loadObject(
          this.toXMLDoc(), intMode < 1, intPersist, null, null, intMode == 2 ? Model.FRAGMENTNS : null);
      return objJSXClone ? objJSXClone[0] : null;
    } else {
      throw new jsx3.Exception(jsx3._msg("model.clone_frag", this));
    }
  };

  /**
   * Finds the first descendant of this DOM node with a the given name.
   * @param strName {String} the name to query on.
   * @param bDepthFirst {boolean} specifies whether to do a depth first or breadth first search.
   * @param bChildOnly {boolean} if <code>true</code>, only search the children of this DOM node.
   * @return {jsx3.app.Model} the descendant with the given name or <code>null</code> if none found.
   */
  Model_prototype.getDescendantOfName = function(strName, bDepthFirst, bChildOnly) {
    return this.findDescendants(function(x){ return x.getName() == strName; },
        bDepthFirst, false, bChildOnly, false);
  };

  /**
   * Finds the first child of the given type.
   * @param strType {String|Function|jsx3.Class} the fully-qualified class name, class constructor function,
   *    or <code>jsx3.Class</code> instance.
   * @param bExact {boolean} if <code>true</code> then only return objects whose class is exactly <code>strType</code>
   *    (rather than returning subclasses too).
   * @return {jsx3.app.Model} the child of the given type or <code>null</code> if none found.
   */
  Model_prototype.getFirstChildOfType = function(strType, bExact) {
    if (bExact) {
      var objClass = null;
      if (typeof(strType) == "string") objClass = jsx3.Class.forName(strType);
      else if (typeof(strType) == "function" && strType.jsxclass instanceof jsx3.Class) objClass = strType.jsxclass;
      else if (strType instanceof jsx3.Class) objClass = strType;

      return this.findDescendants(function(x){ return x.getClass().equals(objClass); },
          false, false, true, false);
    } else {
      return this.findDescendants(function(x){ return x.instanceOf(strType); },
          false, false, true, false);
    }
  };

  /**
   * Finds all descendants of the given type.
   * @param strType {String|Function|jsx3.Class} the fully-qualified class name, class constructor function,
   *    or <code>jsx3.Class</code> instance.
   * @param bShallow {boolean} if <code>true</code>, only search direct children, not all descendants.
   * @return {Array<jsx3.app.Model>} an array of matching descendants
   */
  Model_prototype.getDescendantsOfType = function(strType, bShallow) {
    return this.findDescendants(function(x){ return x.instanceOf(strType); },
        false, true, bShallow, false);
  };

  /**
   * Finds all DOM nodes descending from this DOM node that pass the given test function. Results are guaranteed to be
   * returned in order according to the search order used.
   *
   * @param fctTest {Function} test function, takes a single <code>jsx3.app.Model</code> parameter and returns
   *    <code>true</code> if the node matches.
   * @param bDepthFirst {boolean} specifies whether to do a depth first or breadth first search.
   * @param bMultiple {boolean} if <code>true</code>, return an array of matches, otherwise just the first match.
   * @param bShallow {boolean} if <code>true</code>, only search direct children.
   * @param bIncludeSelf {boolean} if <code>true</code>, include this node in the search.
   * @return {jsx3.app.Model|Array<jsx3.app.Model>} the match (bMultiple = false) or matches (bMultiple = true).
   */
  Model_prototype.findDescendants = function(fctTest, bDepthFirst, bMultiple, bShallow, bIncludeSelf) {
    var fctPush = bDepthFirst ? 'unshift' : 'push';
    var matches = bMultiple ? [] : null;
    var list = bIncludeSelf ? [this] : this.getChildren().concat();

    while (list.length > 0) {
      var node = list.shift();

      if (fctTest.call(null, node)) {
        if (bMultiple)
          matches[matches.length] = node;
        else
          return node;
      }

      if (! bShallow)
        list[fctPush].apply(list, node.getChildren());
    }

    return matches;
  };

  /**
   * Select objects from the DOM using a CSS3-like selection syntax. This method considers the DOM tree whose
   * root is this object. The following constructs are supported:
   * <ul>
   *   <li><code>jsx3_gui_ClassName</code> - matches objects by their exact class. Replace "." with "_" in the selector.</li>
   *   <li><code>*</code> - matches any object</li>
   *   <li><code>#id</code> - matches objects whose name equals <code>id</code></li>
   *   <li><code>.class-name</code> - matches objects for which <code>getClassName()</code> is defined and returns a
   *      string that contains the token <code>class-name</code></li>
   *   <li><code>:first</code> and <code>:last</code> - matches objects that are their parents' first and last children</li>
   *   <li><code>:nth(n)</code> and <code>nth-child(n)</code> - matches objects whose child index is equal to <code>n</code></li>
   *   <li><code>:instanceof(ClassName)</code> - matches objects that are instances of the class or interface <code>ClassName</code></li>
   *   <li><code>[prop="value"]</code> and <code>[prop*="value"]</code> - matches objects whose value for field
   *      <code>prop</code> equals <code>value</code></li> or, with "*", contains <code>value</code>. The quotes around <code>value</code> are optional.
   *   <li><code>[getter()="value"]</code> and <code>[getter()*="value"]</code> - matches objects whose return value for
   *      method <code>getter</code> equals <code>value</code></li> or, with "*", contains <code>value</code>. The quotes around <code>value</code> are optional.
   *   <li><code>AB</code> - matches objects that match both A and B</li>
   *   <li><code>A B</code> - matches descendants of objects matching A that match B</li>
   *   <li><code>A &gt; B</code> - matches immediate children of objects matching A that match B</li>
   * </ul>
   * 
   * @param strExpr {String} the selection query
   * @param bSingle {Boolean} if <code>true</code>, return only the first match.
   * @return {Array<jsx3.app.Model> | jsx3.app.Model}
   * @throws {jsx3.lang.IllegalArgumentException} if <code>strExpr</code> is an invalid selection query.
   * @since 3.8
   */
  Model_prototype.selectDescendants = function(strExpr, bSingle) {
    // #id
    // .jsx3_gui_Block
    // :nth(0)
    // A B
    // a > B
    var rx = /(\b\w+\b)|(\#[a-zA-Z_]\w*)|(\.[\w\-]+)|(\:[\w\-]+(?:\([^\)]*\))?)|(\[\w+(?:\(\))?\*?=[^\]]*\])|(\*)|( *> *)|( +)/g;

    var parents = jsx3.$A([this]);
    var considering = null;
    var deep = true;
    var considerSelf = true;
    var isRoot = this.getServer().getRootBlock() == this;
    var bEscape = false;

    rx.lastIndex = 0;

    var lastEnding = 0, a = null;
    while ((a = rx.exec(strExpr)) && !bEscape) {
      if (lastEnding != a.index)
        throw new IllegalArgumentException("strExpr", strExpr);

      var fct = null;

      if (a[1]) {
        // entity type must be first token in generation
        if (considering)
          throw new IllegalArgumentException("strExpr", strExpr);

        var className = a[1].replace(/_/g, ".");
        fct = function(x) { return x.getClass().getName() == className; };
      } else if (a[2]) {
        var id = a[2].substring(1);
        if (isRoot) {
          // a small optimization when starting with "#id" from the root node
          considering = jsx3.$A(this.getServer().getDOM().getAllByName(id));
        } else {
          fct = function(x) { return x.getName() == id; };
        }
      } else if (a[3]) {
        var className = a[3].substring(1);
        fct = function(x) { return typeof(x.getClassName) == "function" &&
            jsx3.$A((x.getClassName() || "").split(/\s+/)).contains(className); };
      } else if (a[4]) {
        if (a[4] == ":first") {
          fct = function(x) { return x.getChildIndex() == 0; };
        } else if (a[4] == ":last") {
          fct = function(x) { var c = x.getParent().getChildren(); return x === c[c.length - 1]; };
        } else if (/:nth(?:\-child)?\( *(\d+) *\)/.test(a[4])) {
          var index = parseInt(RegExp.$1);
          fct = function(x) { return x.getChildIndex() == index; };
        } else if (/:instanceof\( *(\S+?) *\)/.test(a[4])) {
          var c = jsx3.Class.forName(RegExp.$1);
          fct = function(x) { return c && x.instanceOf(c); };
        } else {
          throw new IllegalArgumentException("strExpr", strExpr);
        }
      } else if (a[5]) {
        /^\[(\w+)(\(\))?(\*)?="?(.*?)"?\]$/.test(a[5]);
        var prop = RegExp.$1, useGetter = RegExp.$2, useSearch = RegExp.$3, value = RegExp.$4;

        fct = function(x) {
          var s = useGetter ? x[prop]() : x[prop];
          s = s == null ? "" : String(s);
          return useSearch ? value.length > 0 && s.indexOf(value) >= 0 : s === value;
        };
      } else if (a[6]) {
        fct = function(x) { return true; };
      } else {
        if (!considering)
          throw new IllegalArgumentException("strExpr", strExpr); // should never happen
        else if (considering.length == 0)
          bEscape = true; // escape the loop when a subselection has yielded no objects
        else {
          parents = considering;
          considering = null;
          deep = Boolean(a[8]);
          considerSelf = isRoot = false;
        }
      }

      if (fct) {
        if (considering)
          considering = considering.filter(fct);
        else {
          considering = jsx3.$A();
          parents.each(function(p) {
            considering.addAll(p.findDescendants(fct, false, true, !deep, considerSelf));
          });

          considering = considering.unique();
        }
      }

      lastEnding = rx.lastIndex;
    }

    if (!bEscape && lastEnding != strExpr.length)
      throw new IllegalArgumentException("strExpr", strExpr);

    return bSingle ? considering[0] : considering;
  };

  /**
   * The finalizer method. This method provides a hook for subclasses of this class to perform custom logic
   * when an instance of this class is removed from the DOM. Methods that override this method should begin with
   * a call to <code>jsxsuper()</code>.
   * <p/>
   * Note that this method is called after this object has been removed from the DOM tree. Therefore
   * <code>this.getParent()</code> and <code>this.getServer()</code> will return <code>null</code>. Use the
   * <code>objParent</code> parameter for access to the DOM tree.
   *
   * @param objParent {jsx3.app.Model} reference to the former parent
   * @protected
   */
  Model_prototype.onDestroy = function(objParent) {
    // This method should be overridden by classes with an on-screen view represented by a TD object.
    //always remove the on-screen instance for this object (assuming it's been painted already)
    this._removeFromLoadContext();
  };
  
  /** @private @jsxobf-clobber */
  Model_prototype._removeFromLoadContext = function() {
    var name = this.getName();
    var loadContext = this._jsxloadcontext;
    if (loadContext && loadContext._varNameIndex[name] == this)
      delete loadContext._varNameIndex[name];
  };

  /**
   * Returns the custom JSX-generated id for the object (i.e., _jsx2384098324509823049).
   * @return {String} JSX id
   */
  Model_prototype.getId = function() {
    return this._jsxid;
  };

  /**
   * Returns the zero-based index for this DOM node in relation to its siblings.
   * @return {int} the index or <code>-1</code> if this object does not have a parent.
   */
  Model_prototype.getChildIndex = function() {
    var objParent = this._jsxparent;
    if (objParent != null)
      return jsx3.util.arrIndexOf(objParent.getChildren(), this);
    return -1;
  };

  /**
   * Returns the custom developer-defined name of this object.
   * @return {String}
   */
  Model_prototype.getName = function() {
    return this.jsxname;
  };

  /**
   * Sets the custom developer-defined name of this object.
   * @param strName {String} a name unique among all DOM nodes currently loaded in the application.
   */
  Model_prototype.setName = function(strName) {
    if (strName != null) {
      // update name and add object reference via new name
      var oldName = this.jsxname;
      this.jsxname = strName;

      var objServer = this.getServer();
      if (objServer) objServer.getDOM().onNameChange(this, oldName);
    }
    return this;
  };

  /**
   * Returns the help ID of this object.
   * @return {String}
   * @since 3.5
   * @see jsx3.app.Server#HELP
   */
  Model_prototype.getHelpId = function() {
    return this.jsxhelpid;
  };

  /**
   * Sets the help ID of this object.
   * @param strId {String}
   * @since 3.5
   * @see jsx3.app.Server#HELP
   */
  Model_prototype.setHelpId = function(strId) {
    this.jsxhelpid = strId;
  };

  /**
   * Returns the load type of this DOM node and the descending branch. The load type determines how this DOM branch
   * deserializes and paints in relation to its parent DOM node.
   *
   * @return {int} <code>LT_NORMAL</code>, <code>LT_SLEEP_PAINT</code>, <code>LT_SLEEP_DESER</code>,
   *    <code>LT_SLEEP_PD</code>, <code>LT_SHOW_PAINT</code>, or <code>LT_SHOW_DESER</code>.
   * @see #LT_NORMAL
   * @see #LT_SLEEP_PAINT
   * @see #LT_SLEEP_DESER
   * @see #LT_SLEEP_PD
   * @see #LT_SHOW_PAINT
   * @see #LT_SHOW_DESER
   * @since 3.5
   */
  Model_prototype.getLoadType = function() {
    return this.jsxloadtype || Model.LT_NORMAL;
  };

  /**
   * Sets the load type of this DOM node and the descending branch.
   *
   * @param intLoadType {int} <code>LT_NORMAL</code>, <code>LT_SLEEP_PAINT</code>, <code>LT_SLEEP_DESER</code>,
   *    <code>LT_SLEEP_PD</code>, <code>LT_SHOW_PAINT</code>, or <code>LT_SHOW_DESER</code>.
   * @see #getLoadType()
   * @since 3.5
   */
  Model_prototype.setLoadType = function(intLoadType) {
    this.jsxloadtype = intLoadType;
  };

  /**
   * Returns the parent DOM node of this object.
   * @return {jsx3.app.Model}
   * @final
   */
  Model_prototype.getParent = function() {
    return this._jsxparent;
  };

  /**
   * Returns the first ancestor of the given type.
   * @param strType {String|Function|jsx3.Class} the fully-qualified class name, class constructor function,
   *    or <code>jsx3.Class</code> instance.
   * @return {jsx3.app.Model} the first ancestor of the given type or <code>null</code> if none found.
   */
   Model_prototype.getAncestorOfType = function(strType) {
     return this.findAncestor(function(x){ return x.instanceOf(strType); }, false);
   };

  /**
   * Returns the first ancestor with the given name.
   * @param strName {String} the name to query on.
   * @return {jsx3.app.Model} the first ancestor with the given name or <code>null</code> if none found.
   */
   Model_prototype.getAncestorOfName = function(strName) {
     return this.findAncestor(function(x){ return x.getName() == strName; }, false);
   };

  /**
   * Returns the first ancestor passing the given test function.
   * @param fctTest {Function} test function, takes a single <code>jsx3.app.Model</code> parameter and returns
   *    <code>true</code> if the node matches.
   * @param bIncludeSelf {boolean} if <code>true</code>, include this object in the search
   * @return {jsx3.app.Model}
   */
  Model_prototype.findAncestor = function(fctTest, bIncludeSelf) {
    var parent = bIncludeSelf ? this : this._jsxparent;
    while (parent != null) {
      if (fctTest.call(null, parent))
        return parent;
      parent = parent._jsxparent;
    }
    return null;
  };

  /**
   * Returns this object serialized as XML by calling <code>toString()</code> on the result of <code>toXMLDoc()</code>
   * called on this object.
   * @param objProperties {Object<String, String>} name-value pairs that affect the serialization. See
   *   <code>toXMLDoc()</code> for a description.
   * @return {String} this object serialized as an XML string.
   * @see #toXMLDoc()
   */
  Model_prototype.toXML = function(objProperties) {
    return this.toXMLDoc(objProperties).serialize(true, objProperties != null ? objProperties.charset : null);
  };

  /**
   * Serializes this object as an XML document.
   * <p/>
   * The <code>objProperties</code> parameter may include the following keys:
   * <ul>
   *   <li>onafter {String} - the value of the <code>onAfterDeserialize</code> element</li>
   *   <li>onbefore {String} - the value of the <code>onBeforeDeserialize</code> element</li>
   *   <li>name {String} - the value of the <code>name</code> element</li>
   *   <li>icon {String} - the value of the <code>icon</code> element</li>
   *   <li>description {String} - the value of the <code>description</code> element</li>
   *   <li>children {boolean} - if <code>true</code> the children of this object, rather than this object, are
   *          serialized</li>
   *   <li>persistall {boolean} - if <code>true</code> all descendants with persistence PERSISTNONE are included in the
   *          serialization</li>
   * </ul>
   *
   * @param objProperties {Object<String, String>} name-value pairs that affect the serialization. See above for
   *   valid names and how they affect serialization.
   * @return {jsx3.xml.Document} this object serialized as an XML document.
   */
  Model_prototype.toXMLDoc = function(objProperties) {
    if (objProperties == null) {
      objProperties = this._jsxmeta;
      if (objProperties == null) objProperties = {};
    } else {
      if (this._jsxmeta != null) {
        objProperties = jsx3.clone(objProperties);
        for (var f in this._jsxmeta) {
          if (typeof(objProperties[f]) == "undefined")
            objProperties[f] = this._jsxmeta[f];
        }
      }
    }

    var ns = Model.CURRENT_VERSION;
    var objXML = new jsx3.xml.Document();
    var objRoot = objXML.createDocumentElement("serialization", ns);
    objRoot.setAttribute("jsxversion", Model._getComponentAuthorVersion());

    for (var f in Model._META_MAP) {
      if (typeof(objProperties[f]) != "undefined") {
        var nodeName = Model._META_MAP[f];
        var elem = objXML.createNode(Entity.TYPEELEMENT, nodeName, ns);
        elem.appendChild(objXML.createNode(Entity.TYPECDATA, objProperties[f], ns));
        objRoot.appendChild(elem);
      }
    }

    if (objProperties.children) {
      var maxLen = this.getChildren().length;
      for (var i = 0; i < maxLen; i++) {
        objRoot.appendChild(this.getChild(i).toXMLElm(objXML, objProperties));
      }
    } else {
      objRoot.appendChild(this.toXMLElm(objXML, objProperties));
    }

    return objXML;
  };

  /** @private @jsxobf-clobber */
  Model._getComponentAuthorVersion = function() {
    var tokens = jsx3.System.getVersion().split(".");
    return tokens[0] + "." + tokens[1];
  };

  /** @private @jsxobf-clobber */
  Model._OBJ_ARRAYS =
      {_jsxdynamic:"dynamics", jsxcustom:"properties", _jsxevents:"events", jsxxslparams:"xslparameters"};
  /** @private @jsxobf-clobber */
  Model._boolnumber = {"boolean":1, "number":1};

  /**
   * Serializes this object as an XML node in the XML document <code>objXML</code>. This method can be
   * overridden by subclasses of <code>Model</code> that want to provide their own serialized form. However,
   * this method should at least return the node &lt;object type="pkg.Class"/&gt; in order to be compatible with
   * deserialization. 
   *
   * @param objXML {jsx3.xml.Document}
   * @param objProperties {Object} the same object passed to <code>toXMLDoc()</code>.
   * @return {jsx3.xml.Entity}
   * @see #toXMLDoc()
   * @since 3.9
   */
  Model_prototype.toXMLElm = function(objXML, objProperties) {
    // create <object>
    var ns = objXML.getNamespaceURI();
    var objNode = objXML.createNode(Entity.TYPEELEMENT, "object", ns);

    // set the object type
    var objClass = this.getClass();
    var strType = objClass != null ? objClass.getName() : null;
/* @JSC :: begin DEP */
    // DEPRECATED: should eventually only consult getClass()
    if (strType == null)
      strType = this._jsxinstanceof;
/* @JSC :: end */
    objNode.setAttribute("type", strType);

    // declare variable to persist string and number/booleam properties
    var objVars = objXML.createNode(Entity.TYPEELEMENT, "variants", ns);
    var objStrings = objXML.createNode(Entity.TYPEELEMENT, "strings", ns);
    objNode.appendChild(objVars);
    objNode.appendChild(objStrings);

    // serialize events, dynamic properties, and attributes
    for (var f in Model._OBJ_ARRAYS) {
      var a = this[f];
      if (a != null && typeof(a) == "object") {
        var objDynNode = Model._serializeObjectArray(objXML, Model._OBJ_ARRAYS[f], a);
        if (objDynNode != null) {
          objNode.appendChild(objDynNode);
          //3.7: added the following to remove any temporary dynamic properties
          if(Model._OBJ_ARRAYS[f] == "dynamics" && this._jsxtempdynamic)
            for(var p in this._jsxtempdynamic)
              objDynNode.removeAttribute(p);
        }
      }
    }

    // serialize the children
    var children = this._jsxchildren;
    if (children) {
      if (jsx3.$A.is(children)) {
        var numChildren = children.length;
        if (numChildren > 0) {
          for (var i = 0; i < numChildren; i++) {
            //recurse through descendants
            var child = children[i];
            var intPersist = child._jsxpersistence;

            if (intPersist == Model.PERSISTREF || intPersist == Model.PERSISTREFASYNC) {
              if (intPersist == Model.PERSISTREFASYNC && (i != numChildren-1)) {
                jsx3.util.Logger.GLOBAL.warn(jsx3._msg("model.async_convt", this));
                intPersist = child._jsxpersistence = Model.PERSISTREF;
              }

              var objInclude = objXML.createNode(Entity.TYPEELEMENT, "include", ns);
              objInclude.setAttribute("src", child.getPersistenceUrl());
              objInclude.setAttribute("async", intPersist == Model.PERSISTREFASYNC ? "true" : "false");
              objNode.appendChild(objInclude);
            } else if (intPersist == Model.PERSISTEMBED || objProperties.persistall) {
              objNode.appendChild(child.toXMLElm(objXML, objProperties));
            }
          }
        }
      } else {
        jsx3.util.Logger.GLOBAL.error(jsx3._msg("model.child_notarr", this, this[p]));
      }
    }

    // NOTE: this is pretty slow in IE6, since jsx3.gui.Block has >250 fields to iterate over
    // serialize all arrays, string, boolean, and number properties
    for (var p in this) {
      var val = this[p];
      var type = typeof(val);

      // only act upon properties/attributes of the object, not its functions
      if (type == "function" || p.indexOf("_jsx") == 0 || val == null) {
        ;
      } else if (jsx3.$A.is(val)) {
        var asString = new Array(val.length);
        for (var i = 0; i < val.length; i++) {
          var aval = val[i];
          asString[i] = Model._boolnumber[typeof(aval)] ? aval : "'" + aval + "'";
        }
        objVars.setAttribute(p, "[" + asString.join(",") + "]");
      } else if (type == "object") {
        if (val instanceof Date) {
          objVars.setAttribute(p, "new Date(" + val.getTime() + ")");
        }
      } else {
        if (this._jsxdynamic == null || this._jsxdynamic[p] == null) {
          //ensure that this property gets evaluated during deserialization if it is a number or boolean
          if (Model._boolnumber[type]) {
            objVars.setAttribute(p, String(val));
          } else {
            objStrings.setAttribute(p, val);
          }
        }
      }
    }

    return objNode;
  };

  /** @private @jsxobf-clobber */
  Model._serializeObjectArray = function(objXML, strTagName, objArray) {
    var objNode = null;
    for (var f in objArray) {
      if (objNode == null)
        objNode = objXML.createNode(Entity.TYPEELEMENT, strTagName, Model.CURRENT_VERSION);
      objNode.setAttribute(f, String(objArray[f]));
    }
    return objNode;
  };

  /**
   * Returns the namespace that distinguishes this object's server (owner) from other server instances. The namespace
   * is set when this object is bound to a DOM tree.
   * @return {String} the namespace of the server that owns this object instance.
   */
  Model_prototype.getNS = function() {
    return this._jsxns;
  };

  /**
   * Returns the URI resolver for this DOM node. This method returns the server of this object unless this node
   * or its ancestor was loaded into the DOM with an explicit URI resolver.
   *
   * @return {jsx3.net.URIResolver}
   */
  Model_prototype.getUriResolver = function() {
    var node = this;
    while (node != null) {
      if (node._jsxloadcontext && node._jsxloadcontext.resolver) return node._jsxloadcontext.resolver;
      if (node._jsxserver != null) return node._jsxserver;
      node = node._jsxparent;
    }
    return null;
  };

  /**
   * Deserializes a JSX serialization file and appends the deserialized objects as children of this DOM node.
   * @param strURL {String|jsx3.net.URI} URL (either relative or absolute) of the serialization file to deserialize.
   *    This URL is resolved relative to <code>objResolver</code>, if provided, or the URI resolver of this DOM node.
   * @param bRepaint {boolean} if <code>true</code> or <code>null</code> the deserialized objects will be
   *    added to the parent's view via the parent object's <code>paintChild()</code> method.
   * @param objResolver {jsx3.net.URIResolver} If this parameter is provided, <code>strURL</code> is resolved
   *    relative to it. Additionally, this resolver is stored as the URI resolver for this DOM node and its descendants.
   * @return {jsx3.app.Model} the deserialized object. A serialization file may specify more than one root
   *    object, in which case this method returns the first deserialized object.
   * @throws {jsx3.Exception} if <code>strURL</code> is not the URL of a valid XML document.
   * @see #getUriResolver()
   */
  Model_prototype.load = function(strURL, bRepaint, objResolver) {
    //parse xml and pass to common handler
    var rsURL = (objResolver || this.getUriResolver()).resolveURI(strURL);
    var objXML = (new Document()).load(rsURL);

    if (objXML.hasError())
      throw new jsx3.Exception(jsx3._msg("model.bad_comp", rsURL, objXML.getError()));

    return this._loadObject(objXML, bRepaint, null, rsURL, strURL, null, null, objResolver, null)[0];
  };

  /**
   * Deserializes a JSX serialization file and appends the deserialized objects as children of this DOM node.
   * @param strXML {String|jsx3.xml.Document} the XML content of a JSX serialization file.
   * @param bRepaint {boolean} if <code>true</code> or <code>null</code> the deserialized objects will be
   *    added to the parent's view via the parent object's <code>paintChild()</code> method.
   * @param objResolver {jsx3.net.URIResolver}
   * @return {jsx3.app.Model} the deserialized object. A serialization file may specify more than one root
   *    object, in which case this method returns the first deserialized object.
   * @throws {jsx3.Exception} if <code>strXML</code> is not a valid XML document.
   */
  Model_prototype.loadXML = function(strXML, bRepaint, objResolver) {
    //parse xml and pass to common handler
    var objXML = strXML instanceof Document ? strXML : (new Document()).loadXML(strXML);

    if (objXML.hasError()) {
      var strSourceURL = objXML.getSourceURL();
      var msgId = strSourceURL ? "model.bad_comp" : "model.bad_compobj";
      throw new jsx3.Exception(jsx3._msg(msgId, strSourceURL, objXML.getError()));
    }

    return this._loadObject(objXML, bRepaint, null, objXML.getSourceURL(), objXML.getSourceURL(), null, null, objResolver, null)[0];
  };

  /**
   * Loads a component file and caches the document in an XML cache. If the component file already exists in the cache
   * then it is loaded from the cache. All component files loaded as a result of this call (referenced files) are also
   * cached. This method is a useful replacement for <code>load()</code> when the same URL will be loaded multiple
   * times in one application.
   *
   * @param strURL {String|jsx3.net.URI} URL (either relative or absolute) of the serialization file to deserialize.
   *    This URL is resolved relative to <code>objResolver</code>, if provided, or the URI resolver of this DOM node.
   * @param bRepaint {boolean} if <code>true</code> or <code>null</code> the deserialized objects will be
   *    added to the parent's view via the parent object's <code>paintChild()</code> method.
   * @param objCache {jsx3.app.Cache} the cache to store the component XML documents in. If not provided, the cache
   *    of the server of this model object is used.
   * @param objResolver {jsx3.net.URIResolver} If this parameter is provided, <code>strURL</code> is resolved
   *    relative to it. Additionally, this resolver is stored as the URI resolver for this DOM node and its descendants.
   * @return {jsx3.app.Model} the deserialized object. A serialization file may specify more than one root
   *    object, in which case this method returns the first deserialized object.
   * @see #load()
   * @see #getUriResolver()
   * @throws {jsx3.Exception} if <code>strURL</code> is not the URL of a valid XML document.
   */
  Model_prototype.loadAndCache = function(strURL, bRepaint, objCache, objResolver) {
    if (objCache == null) objCache = this.getServer().getCache();
    var rsURL = (objResolver || this.getUriResolver()).resolveURI(strURL);
    var objXML = objCache.getOrOpenDocument(rsURL);

    if (objXML.hasError())
      throw new jsx3.Exception(jsx3._msg("model.bad_comp", rsURL, objXML.getError()));

    return this._loadObject(objXML, bRepaint, null, rsURL, strURL, null, objCache, objResolver, null)[0];
  };

  /**
   * Converts a serialization document formatted according to the CIF document format to the standard format
   * @param objXML {jsx3.xml.Document} serialization document adhering to the format, Model.CIF_VERSION
   * @return {jsx3.xml.Document} serialization document adhering to the format, Model.CURRENT_VERSION
   * @private
   * @jsxobf-clobber
   */
  Model._formatCIF = function(objXML) {
    jsx3.require("jsx3.xml.Template");
    var doc = jsx3.getSystemCache().getOrOpenDocument(Model._CIFPROCESSORURL, null, jsx3.xml.XslDocument.jsxclass);
    return doc.transformToObject(objXML);
  };

  /** @private @jsxobf-clobber */
  Model._META_MAP = {name:"name", icon:"icon", description:"description", onbefore:"onBeforeDeserialize",
    onafter:"onAfterDeserialize"};

  /**
   * Deserializes a valid JSX serialization file (stored as XML) into live JSX objects.
   * @param objXML {jsx3.xml.Document} the serialized component file.
   * @param bRepaint {boolean} if true or null the component will be painted to screen immediately.
   * @param intPersist {int} the persistence type.
   * @param strSourceURL {String|jsx3.net.URI} the system relative URI to the component file.
   * @param strRawURL {String|jsx3.net.URI} the original URI sent to the load() function, may be null.
   * @param strNS {String} the explicit namespace, may be null.
   * @param objCache {jsx3.app.Cache} if provided, all included documents will be fetched from/stored in the cache.
   * @param objResolver {jsx3.net.URIResolver} the URI resolver passed to the load function.
   * @return {Array<jsx3.app.Model>|boolean} false if the load was vetoed
   * @private
   * @jsxobf-clobber
   */
  Model_prototype._loadObject = function(objXML, bRepaint, intPersist, strSourceURL, strRawURL, strNS,
                                        objCache, objResolver, objServer) {
/* @JSC :: begin BENCH */
    if (! objServer || intPersist == Model.PERSISTREFASYNC)
      var t1 = new jsx3.util.Timer(Model.jsxclass, strSourceURL);
/* @JSC :: end */

    if (objXML == null)
      throw new IllegalArgumentException("objXML", objXML);

    // determine which deserialization routine to use based upon the xmlns attribute for the serialization file
    if (objXML.getRootNode().getNamespaceURI().indexOf(Model.CIF_VERSION) == 0) {

      //convert the CIF document format (Model.CIF_VERSION) to the standard serializer (Model.CURRENT_VERSION)
      objXML = Model._formatCIF(objXML);

      //throw error if xml is now invalid
      if (objXML == null)
        throw new IllegalArgumentException("objXML", objXML);
    }

    // determine which deserialization routine to use based upon the xmlns attribute for the serialization file
    if (objXML.getRootNode().getNamespaceURI().indexOf(Model.CURRENT_VERSION) != 0) {
      throw new jsx3.Exception(jsx3._msg("model.bad_vers", strSourceURL, objXML.getRootNode().getAttribute("xmlns")));
    } else {
      var v = objXML.getRootNode().getAttribute("jsxversion");
      if (v && jsx3.util.compareVersions(v, jsx3.System.getVersion()) > 0)
        throw new jsx3.Exception(jsx3._msg("model.future_vers", strSourceURL, v));
    }

    var bFragment = strNS == Model.FRAGMENTNS;
    var serPath = "/jsx1:serialization/";

    objXML.setSelectionNamespaces("xmlns:jsx1='" + Model.CURRENT_VERSION + "'");
    var strOnBeforeDeserializeNode = objXML.selectSingleNode(serPath + "jsx1:onBeforeDeserialize");
    if (strOnBeforeDeserializeNode != null) {
      var strOnBeforeDeserialize = strOnBeforeDeserializeNode.getValue();
      if (strOnBeforeDeserialize && !objXML._jsxdidbeforedsrlz) {
        try {
          jsx3.eval(strOnBeforeDeserialize, {objPARENT:this, objXML:objXML});
          /* @jsxobf-clobber-shared */
          objXML._jsxdidbeforedsrlz = true;
        } catch (e) {
          jsx3.util.Logger.GLOBAL.error(jsx3._msg("model.onbefore", strSourceURL), jsx3.NativeError.wrap(e));
        }
      }
    }

    //derive the namespace that should be used (infer if not explicitly passed)
    if (strNS == null) strNS = this._jsxns;

    var previousResolver = this.getUriResolver() || objServer;

    if (objResolver == null) {
      // if the resolver is not explicitly provided and the raw URI implies a resolver, we need to store that
      // resolver at this point in the DOM
      objResolver = jsx3.net.URIResolver.getResolver(strRawURL);
    } else if (strRawURL) {
      if (objResolver.getUriPrefix() != previousResolver.getUriPrefix()) {
        // if the resolver is provided and the raw URI is relative to that resolver, we need to store the absolute
        // URI relative to that resolver.
        strRawURL = jsx3.net.URI.valueOf(strRawURL);
        if (! jsx3.net.URIResolver.isAbsoluteURI(strRawURL))
          strRawURL = objResolver.relativizeURI(strRawURL);
      }
    }

    var attachedServer = this.getServer();

    // this resolver will be used for any includes found from this point down
    if (objServer == null)
      objServer = attachedServer;
    var branchResolver = objResolver || previousResolver;

    //deserialize and bind new component as a child this instance
    var i = objXML.selectNodeIterator(serPath + "jsx1:object | " + serPath + "jsx1:objects/jsx1:object | /jsx1:object");
    var objToInsert = [];

    var loadContext = {uri:strSourceURL, resolver:objResolver, _varNameIndex:{}};

    while (i.hasNext()) {
      //get node descriptor in the XML serializatoin file and deserialize the node as a child of 'this' object
      var objNode = i.next();
      var objJSX = this._doLoad(objNode, strSourceURL, strNS, objServer, objCache, branchResolver, loadContext);

      //if a valid child resulted (was the serialzation file valid and the referenced GUI object type a valid class?
      if (objJSX != null) {
        //this item is a valid JSX GUI object will be added as a child to the MODEL; track it so it can auto-inserted (as DHTML) into the VIEW
        objToInsert[objToInsert.length] = objJSX;

        //set the current child
        if (!bFragment)
          var success = this.setChild(objJSX, intPersist, strSourceURL, strNS);
        if (success === false) return false;

        //profile the current child with information about where it came from
        if (objToInsert.length == 1) {
          if (strRawURL)
            objJSX.setMetaValue("url", strRawURL.toString());
          for (var f in Model._META_MAP) {
            var node = objXML.selectSingleNode(serPath + "jsx1:" + Model._META_MAP[f]);
            if (node != null)
              objJSX.setMetaValue(f, node.getValue());
          }
        }

        if (attachedServer != null)
          objJSX.onAfterAttach();
      }
    }

    //fire the onChange event for the dom controller managing this server (setChild would have fired this, but due to fragment ns this is the safer method)
    if (!bFragment && objToInsert.length > 0 && attachedServer)
      attachedServer.getDOM().onChange(jsx3.app.DOM.TYPEADD, this.getId(), objToInsert[0].getId());

/* @JSC :: begin BENCH */
    if (t1) t1.log("load", true);
/* @JSC :: end */

    //update the view by iterating through all GUI objects that were just added to the model by adding their DHTML directly into the view
    if (bRepaint !== false) {
      for (var j = 0; j < objToInsert.length; j++)
        this.viewUpdateHook(objToInsert[j], j < objToInsert.length - 1);
/* @JSC :: begin BENCH */
      if (t1) t1.log("paint");
/* @JSC :: end */
    }

    //return handle to last item deserialized
    return objToInsert;
  };

  /**
   * {Object<String,boolean>} The allowed meta data fields. See getMetaValue() and setMetaValue().
   */
  Model.META_FIELDS = {url: 1, name: 1, icon: 1, description: 1, onafter: 1, onattach: 1, onbefore: 1, unicode: 1};

  /**
   * Returns one of the meta data values stored at the top of the serialization file that this object was loaded from.
   * @param strKey {String} the name of the meta data field, one of the keys in <code>META_FIELDS</code>.
   * @return {String} the meta data value or empty string.
   * @see #META_FIELDS
   */
  Model_prototype.getMetaValue = function(strKey) {
    if (Model.META_FIELDS[strKey])
      return this._jsxmeta ? this._jsxmeta[strKey] : "";
    else
      throw new IllegalArgumentException("strKey", strKey);
  };

  /**
   * setS one of the meta data values stored at the top of a component's serialization file.
   * @param strKey {String} the name of the meta data field, one of the keys in <code>META_FIELDS</code>
   * @param strValue {String} the new value of the meta data field.
   * @see #META_FIELDS
   */
  Model_prototype.setMetaValue = function(strKey, strValue) {
    if (Model.META_FIELDS[strKey]) {
      if (this._jsxmeta == null) this._jsxmeta = {};
      this._jsxmeta[strKey] = strValue;
    } else {
      throw new IllegalArgumentException("strKey", strKey);
    }
  };

  /**
   * @param objXML {jsx3.xml.Entity} the XML &lt;object/&gt; entity.
   * @param strSourceURL {String} the URI from which the component is being loaded, for communicating with the user only.
   * @param strNS {String} the namespace of the objects to load.
   * @param objServer {jsx3.app.Server} the server into which the objects will load.
   * @param objCache {jsx3.app.Cache} if provided, all referenced components are loaded from and stored in this cache.
   * @param objResolver {jsx3.net.URIResolver} the URI resolver to resolve any referenced components against.
   * @return {jsx3.app.Model} the loaded object with any descendant objects also loaded and attached.
   * @private
   * @jsxobf-clobber-shared
   */
  Model_prototype._doLoad = function(objXML, strSourceURL, strNS, objServer, objCache, objResolver, loadContext) {
    if (objXML == null) return null;

    // Check the load type
    if (! objXML._jsxloading) {
      var loadType = objXML.selectSingleNode("jsx1:variants/@jsxloadtype");
      loadType = loadType ? parseInt(loadType.getValue()) : Model.LT_NORMAL;
      if (loadType == Model.LT_SLEEP_DESER || loadType == Model.LT_SLEEP_PD || loadType == Model.LT_SHOW_DESER) {
        jsx3.require("jsx3.gui.Painted"); // this class defines jsx3.app.Model.Loading
        var objInstance = new Model.Loading(objXML, loadType, [strSourceURL, strNS, objServer, objCache, objResolver, loadContext]);
        objInstance._jsxns = strNS;
        return objInstance;
      }
    }

    //get the JSX foundation class that the object will be an instance of
    var strType = objXML.getAttribute("type");
    var objClass = jsx3.Class.forName(strType);
/* @JSC :: begin DEP */
    // DEPRECATED: check for un-registered class
    if (objClass == null)
      objClass = jsx3.getClass(strType);
/* @JSC :: end */

    // support for loading classes as needed
    if (objClass == null) {
      try {
        objClass = jsx3.CLASS_LOADER.loadClass(strType);
      } catch (e) {
        jsx3.util.Logger.GLOBAL.error(jsx3._msg("model.load_cls", strType), jsx3.NativeError.wrap(e));
      }
    }

    //log error if the class isn't supported
    if (objClass == null) {
      //errors occur if class definition file doesn't exist for the object
      jsx3.util.Logger.GLOBAL.error(jsx3._msg("model.bad_type", strSourceURL, strType));
      return null;
    }

    //create the object instance of the given class and set its 'jsxtype' property
    var objInstance = null;
    if (objClass instanceof jsx3.Class) {
      objInstance = objClass.bless();
    } else {
/* @JSC :: begin DEP */
      // DEPRECATED: old style instantiation
      objInstance = new objClass(jsx3.DESERIALIZE);
      objInstance._jsxinstanceof = strType;
/* @JSC :: end */
    }

    // attach the URI resolver to this DOM node
    /* @jsxobf-clobber-shared */
    objInstance._jsxloadcontext = loadContext;

    objInstance._jsxns = strNS;
    objInstance.onBeforeAssemble(this, objServer);

    var bDoChildren = objInstance.assembleFromXML(objXML);

    var strName = objInstance.getName();
    if (strName) {
      if (jsx3.util.isName(strName)) // only put names that are valid variable names into this index
        loadContext._varNameIndex[strName] = objInstance;
    }

    //recurse to bind children
    if (bDoChildren) {
      var i = objXML.selectNodeIterator("jsx1:object | jsx1:include | jsx1:children/jsx1:object | jsx1:children/jsx1:include");

      while (i.hasNext()) {
        var objItem = i.next();

        if (objItem.getBaseName() == "object") {
          //during recursion all descendants are embedded, since this is how they exist in the serialization file
          var objNewChild = objInstance._doLoad(objItem, strSourceURL, strNS, objServer, objCache, objResolver, loadContext);
          if (objNewChild) objInstance.setChild(objNewChild, Model.PERSISTEMBED, null, strNS);
        } else if (objItem.getBaseName() == "include") {
          // resolver the referenced component file relative to this DOM node
          var rawURL = objItem.getAttribute("src");
          var strMyURL = objResolver.resolveURI(rawURL);
          var refSync = true;

          //branch based on async or not
          if (objItem.getAttribute("async") == "true") {
            refSync = false;

            if (i.hasNext()) {
              jsx3.util.Logger.GLOBAL.warn(jsx3._msg("model.async_convt", objInstance));
              refSync = true;
            }
          }

          if (refSync) {
            //this is a synchronouns load; just request the resource
            var objRefXML = objCache != null ? objCache.getOrOpenDocument(strMyURL) : (new Document()).load(strMyURL);

            if (objRefXML.hasError())
              throw new jsx3.Exception(jsx3._msg("model.bad_comp", strMyURL, objXML.getError()));

            objInstance._loadObject(objRefXML, false, Model.PERSISTREF, strMyURL, rawURL, strNS, objCache, null, objServer);
          } else {
            objInstance._doLoadAsync(strMyURL, rawURL, strNS, objCache, objServer);
          }
        } else {
          throw new jsx3.Exception();
        }
      }
    }

    objInstance.onAfterAssemble(this, objServer);
    //return the object instance
    return objInstance;
  };

  /**
   * Builds this object from its serialized XML representation. Subclasses of Model may override this method
   * along with <code>toXMLElm()</code> to control their own serialized form.
   * <p/>
   * When this method is called this object has already been instantiated but none of its properties have been set.
   * This method sets all of its properties. Any children of this object are automatically deserialized after this
   * method returns. 
   *
   * @param objElm {jsx3.xml.Entity} the serialized representation of this object.
   * @return {boolean} <code>true</code> to deserialize any child objects or <code>false</code> to ignore them
   *    (for example if this method performs a custom child deserialization).
   *
   * @since 3.9
   * @see #toXMLElm()
   */
  Model_prototype.assembleFromXML = function(objElm) {
    var names = objElm.getAttributeNames();
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (name != "type") {
        var val = objElm.getAttribute(name);
        if (val.indexOf("@{") == 0 && val.lastIndexOf("}") == val.length - 1)
          this.setDynamicProperty(name, val.substring(2, val.length - 1));
        else
          this[name] = isNaN(val) ? val : Number(val);
      }
    }

    //call functions that will extract variant, dynamic, and string data types and apply to the object instance
    for (var i = objElm.selectNodeIterator("jsx1:strings | jsx1:variants | jsx1:dynamics | jsx1:properties | jsx1:events | jsx1:xslparameters"); i.hasNext(); ) {
      var n = i.next();
      var name = n.getBaseName();
      if (name == "strings")
        Model._applyStringAttributes(this, n);
      else if (name == "variants")
        Model._applyVariantAttributes(this, n);
      else if (name == "dynamics")
        Model._bindObjectProperty(this, n, "_jsxdynamic");
      else if (name == "properties")
        Model._bindObjectProperty(this, n, "jsxcustom");
      else if (name == "events")
        Model._bindObjectProperty(this, n, "_jsxevents");
      else if (name == "xslparameters")
        Model._bindObjectProperty(this, n, "jsxxslparams");
    }

    return true;
  };

  /**
   * Called during deserialization of this object. This method provides a hook for initializing
   * an object during deserialization since init() is not called. Called after this object has been instantiated but
   * before its fields and children have been assembled. This method is called before this object is attached to the
   * DOM, therefore <code>getParent()</code>, <code>getServer()</code>, <code>getXML()</code>, etc. return <code>null</code>.
   * @param objParent {jsx3.app.Model} the parent of this object once it is attached to the DOM.
   * @param objServer {jsx3.app.Server} the server that this DOM object will attach to.
   * @protected
   */
  Model_prototype.onBeforeAssemble = function(objParent, objServer) {
  };

  /**
   * Called during deserialization of this object. This method provides a hook for initializing
   * an object during deserialization since init() is not called. Called after this object has been instantiated and
   * after its fields and children have been assembled.This method is called before this object is attached to the
   * DOM, therefore <code>getParent()</code>, <code>getServer()</code>, <code>getXML()</code>, etc. return <code>null</code>.
   * @param objParent {jsx3.app.Model} the parent of this object once it is attached to the DOM.
   * @param objServer {jsx3.app.Server} the server that this DOM object will attach to.
   * @protected
   */
  Model_prototype.onAfterAssemble = function(objParent, objServer) {
  };

  /**
   * Called during deserialization of this object. This method provides a hook for initializing
   * an object during deserialization since <code>init()</code> is not called. Called after this object has been
   * instantiated and after it has been attached to the DOM. Methods overriding this method should usually begin
   * with a call to <code>jsxsuper()</code>.
   * <p/>
   * When a new branch is attached to the DOM, this method is executed on each node in the branch. The order is
   * reverse-breadth-first meaning that child nodes are notified from oldest to youngest and before the parent node.
   * <p/>
   * This implementation of this method executes the on-after-deserialize script of this object.
   *
   * @protected
   */
  Model_prototype.onAfterAttach = function() {
    // NOTE: DOM nodes are notified of attachment from the deepest to the root
    // defensive backup prevents double execution of this method per node if the DOM is modified by the onafter script
    var children = this.getChildren().concat();
    for (var i = children.length - 1; i >= 0; i--) {
      if (children[i]._jsxparent == this)
        children[i].onAfterAttach();
    }

    this.applyDynamicProperties();

    var onAfter = this.getMetaValue("onafter");
    if (onAfter) {
      try {
        var loadContext = this._jsxloadcontext;
        var objContext = loadContext ? jsx3.$O(loadContext._varNameIndex).clone() : {};
        objContext.objJSX = this;
        this.eval(onAfter, objContext);
      } catch (e) {
        var strSourceUrl = this.getMetaValue("url");
        jsx3.util.Logger.GLOBAL.error(jsx3._msg("model.onafter", strSourceUrl), jsx3.NativeError.wrap(e));
      }
    }
  };

  /**
   * Assigns a dynamic property to one of this object's instance properties.
   * @param strName {String} property on this GUI object that will now use a dynamic property (e.g., 'jsxleft','jsxtop','jsxheight',etc.);
   * @param strValue {String} name of a dynamic style, whose value will be used
   * @param bNoSave {Boolean} When <code>true</code>, this dynamic property will not be serialized with the object.
   * @return {jsx3.gui.Painted} this object
   */
  Model_prototype.setDynamicProperty = function(strName, strValue, bNoSave) {
    //declare object if it doesn't exists
    if (this._jsxdynamic == null) this._jsxdynamic = {};
    if (this._jsxtempdynamic == null) this._jsxtempdynamic = {};

    //set the property  -- assume delete request if null value passed for existing item
    if (strValue == null) {
      delete this._jsxdynamic[strName];
      delete this._jsxtempdynamic[strName];
    } else {
      this._jsxdynamic[strName] = strValue;
      if(bNoSave)
        this._jsxtempdynamic[strName] = strValue;
      else
        delete this._jsxtempdynamic[strName];
    }

    return this;
  };

  /**
   * Returns the value of the dynamic property @strPropName; if not found, returns null
   * @param strName {String} property on this GUI object that will now use a dynamic property (e.g., 'jsxleft','jsxtop','jsxheight',etc.);
   * @return {String} value of the property
   */
  Model_prototype.getDynamicProperty = function(strName) {
    if (this._jsxdynamic) return this._jsxdynamic[strName];
  };

  /**
   * system call typically made by the paint routine for the object; updates all properties for the object with any dynamic properties it may reference
   * @private
   */
  Model_prototype.applyDynamicProperties = function() {
    //declare object if it doesn't exists
    if (this._jsxdynamic != null) {
      //get handle to the server that owns this object
      var objMyServer = this.getServer();
      if (objMyServer == null) return;

      //loop to update the values in this object with their corresponding value managed by the given server instance
      var jss = objMyServer.getProperties();
      for (var p in this._jsxdynamic)
        this[p] = jss.get(this._jsxdynamic[p]);
    }
  };

  /** @private @jsxobf-clobber */
  Model_prototype._doLoadAsync = function(strURL, rawURL, strNS, objCache, objServer) {
    var me = this;

    if (objCache != null && objCache.getDocument(strURL.toString()) != null) {
      var objXML = objCache.getDocument(strURL.toString());
      jsx3.sleep(function() {
        this._loadObject(objXML, true, Model.PERSISTREFASYNC, strURL, rawURL, strNS, objCache, null, objServer);
      }, null, this);
    } else {
      var objXML = new Document();
      objXML.setAsync(true);

      objXML.subscribe(Document.ON_RESPONSE, function(objEvent) {
        if (objCache != null)
          objCache.setDocument(strURL, objEvent.target);

        me._loadObject(objEvent.target, true, Model.PERSISTREFASYNC, strURL, rawURL, strNS, objCache, null, objServer);
      });
      objXML.subscribe([Document.ON_ERROR, Document.ON_TIMEOUT], function(objEvent) {
        throw new jsx3.Exception(jsx3._msg("model.bad_comp", strURL, objEvent.target.getError()));
      });

      objXML.load(strURL, Model.ASYNC_LOAD_TIMEOUT);
    }
  };

  /** @private @jsxobf-clobber */
  Model._applyStringAttributes = function(objInstance, objXML) {
    var names = objXML.getAttributeNames();
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      objInstance[name] = objXML.getAttribute(name);
    }
  };

  /** @private @jsxobf-clobber */
  Model._applyVariantAttributes = function(objInstance, objXML) {
    var names = objXML.getAttributeNames();
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      var strValue = objXML.getAttribute(name);
      // Checking isNaN is a 100x speedup on Fx and a 25x speedup on IE6 for all numbers
      objInstance[name] = isNaN(strValue) ? objInstance.eval(strValue) : Number(strValue);
    }
  };

  /** @private @jsxobf-clobber */
  Model._bindObjectProperty = function(objInstance,objXML,strObjName) {
    //able to convert a given node in a serializattion file to a javascript object with name/value pairs
    var objTemp = objInstance[strObjName] = {};

    var names = objXML.getAttributeNames();
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      objTemp[name] = objXML.getAttribute(name);
    }
  };

  /** @package */
  Model_prototype._getNodeRefField = function(strAddress) {
    try {
      var s = this.getServer();
      return s.getJSX(strAddress) || s.getRootBlock().selectDescendants(strAddress, true);
    } catch (e) { return null; }
  };

  /**
   * Returns a string representation of this object.
   * @return {String}
   */
  Model_prototype.toString = function() {
    return "@" + this.getClass().getName() + " " + this.getId() + "/" + this.getName();
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "3.0.00")
   * @return {String}
   * @deprecated
   */
  Model.getVersion = function() {
    return "3.00.00";
  };

/* @JSC :: end */

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.app.Model
 * @see jsx3.app.Model
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Model", -, null, function(){});
 */
jsx3.Model = jsx3.app.Model;

/* @JSC :: end */
