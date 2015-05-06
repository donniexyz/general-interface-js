/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Mixin interface that provides methods for accessing and manipulating an XML document in CDF schema.
 * <p/>
 * Classes that implement this interface must also define a <code>getXML()</code> method. This interface uses
 * that method to access the XML document for which it provides a CDF interface.
 */
jsx3.Class.defineInterface("jsx3.xml.CDF", null, function(CDF, CDF_prototype) {

  /** @private @jsxobf-clobber */
  CDF._LOG = jsx3.util.Logger.getLogger(CDF.jsxclass.getName());

  /**
   * {int}
   * @final @jsxobf-final
   */
  CDF.DELETE = 0;

  /**
   * {int}
   * @final @jsxobf-final
   */
  CDF.INSERT = 1;

  /**
   * {int}
   * @final @jsxobf-final
   */
  CDF.UPDATE = 2;

  /**
   * {int}
   * @final @jsxobf-final
   */
  CDF.INSERTBEFORE = 3;

/* @JSC :: begin DEP */

  /**
   * {String}
   * @final @jsxobf-final
   * @deprecated
   */
  CDF.ELEM_ROOT = "data";

  /**
   * {String}
   * @final @jsxobf-final
   * @deprecated
   */
  CDF.ELEM_RECORD = "record";

  /**
   * {String}
   * @final @jsxobf-final
   * @deprecated
   */
  CDF.ATTR_ID = "jsxid";

  /**
   * {String}
   * @final @jsxobf-final
   * @deprecated
   */
  CDF.ATTR_TEXT = "jsxtext";

  /**
   * {String}
   * @final @jsxobf-final
   * @deprecated
   */
  CDF.ATTR_EXECUTE = "jsxexecute";

  /**
   * {String}
   * @final @jsxobf-final
   * @deprecated
   */
  CDF.ATTR_DISABLED = "jsxdisabled";

  /**
   * {String}
   * @final @jsxobf-final
   * @deprecated
   */
  CDF.ATTR_SELECTED = "jsxselected";

  /**
   * {String}
   * @final @jsxobf-final
   * @deprecated
   */
  CDF.ATTR_UNSELECTABLE = "jsxunselectable";

  /**
   * {String}
   * @final @jsxobf-final
   * @deprecated
   */
  CDF.ATTR_IMG = "jsximg";

  /**
   * {String}
   * @final @jsxobf-final
   * @deprecated
   */
  CDF.ATTR_TIP = "jsxtip";

  /**
   * {String}
   * @final @jsxobf-final
   * @deprecated
   */
  CDF.ATTR_KEYCODE = "jsxkeycode";

/* @JSC :: end */

  /** @private @jsxobf-clobber */
  CDF.PROPERTY_ATTR = ["jsxtext", "jsxtip", "jsximg", "jsxkeycode", "jsxstyle", "jsxclass"];

  /** @private @jsxobf-clobber */
  CDF._SERIAL = 1;

  CDF.DEFAULT_SCHEMA = new jsx3.xml.CDFSchema();

  /**
   * Sets the schema for this CDF control.
   * @param objSchema {jsx3.xml.CDFSchema}
   * @since 3.9
   */
  CDF_prototype.setSchema = function(objSchema) {
    /* @jsxobf-clobber */
    this.jsxschema = objSchema;
  };

  /**
   * Returns the schema for this CDF control as set by <code>setSchema()</code>, the first child of this object
   * of type <code>CDFSchema</code>, or the default CDF schema.
   * @return {jsx3.xml.CDFSchema}
   * @since 3.9
   */
  CDF_prototype.getSchema = function() {
    return this.jsxschema || this._jsxschema || CDF.DEFAULT_SCHEMA;
  };

  // CDF attribute name
  CDF_prototype._cdfan = function(name) {
    return this.getSchema().getProp(name);
  };

  // CDF attribute value
  CDF_prototype._cdfav = function(rec, name, val) {
    var attr = this._cdfan(name);
    if (arguments.length >= 3) {
      if (rec.setAttribute)
        rec.setAttribute(attr, val);
      else
        rec[attr] = val;
    } else if (rec)
      return rec.getAttribute ? rec.getAttribute(attr) : rec[attr];
  };

  CDF_prototype._onAfterAttach = function() {
    // cache the first child to speed the query up
    /* @jsxobf-clobber */
    this._jsxschema = this.getDescendantsOfType(jsx3.xml.CDFSchema, true)[0];
  };

  jsx3.app.Model.jsxclass.addMethodMixin("onAfterAttach", CDF.jsxclass, "_onAfterAttach");
  jsx3.app.Model.jsxclass.addMethodMixin("onChildAdded", CDF.jsxclass, "_onAfterAttach");
  jsx3.app.Model.jsxclass.addMethodMixin("onRemoveChild", CDF.jsxclass, "_onAfterAttach");

  /**
   * Inserts a new record into the XML data source of this object. If no XML data source exists
   * yet for this object, an empty one is created before adding the new record.
   * If a record already exists with an id equal to the <code>jsxid</code> property of <code>objRecord</code>,
   * the operation is treated as an update, meaning the existing record is completely removed and a new record with
   * the given jsxid is inserted.
   *
   * @param objRecord {Object<String, String>} a JavaScript object containing property/value pairs that define the
   *    attributes of the XML entity to create. Note that most classes that implement this interface require that all
   *    records have an attribute named <code>jsxid</code> that is unique across all records in the XML document.
   *    All property values will be treated as strings. Additionally, the following 3 characters are escaped:
   *    <code>" &gt; &lt;</code>.
   * @param strParentRecordId {String} the unique <code>jsxid</code> of an existing record. If this optional parameter
   *    is provided and a record exists with a matching <code>jsxid</code> attribute, the new record will be added as a child of
   *    this record. Otherwise, the new record will be added to the root <code>data</code> element. However, if a
   *    record already exists with a <code>jsxid</code> attribute equal to the <code>jsxid</code> property of
   *    <code>objRecord</code>, this parameter will be ignored. In this case <code>adoptRecord()</code> must be called
   *    to change the parent of the record.
   * @param bRedraw {boolean} if <code>true</code> or <code>null</code>, the on-screen view of this object is
   *    immediately updated to reflect the additional record.
   * @return {jsx3.xml.Entity} the newly created or updated entity.
   * @see #adoptRecord()
   */
  CDF_prototype.insertRecord = function(objRecord, strParentRecordId, bRedraw) {
    //exit early if no value hash supplied
    if (objRecord instanceof Object) {

      //get xml document that holds the data records
      var objXML = this.getXML();
      var action = CDF.INSERT;

      //check if a record with the same ID already exists
      var objRecordNode = objXML.selectSingleNode(this._getSelectionQuery(this._cdfav(objRecord, "id")));
      if (objRecordNode != null) {
        //update action
        action = CDF.UPDATE;
      } else {
        //create a new record object
        var elmName = this._cdfan("children");
        objRecordNode = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT, elmName == "*" ? "record" : elmName);

        //find out who should own the new record and append new record as a child
        var objParent = (strParentRecordId != null) ?
            objXML.selectSingleNode(this._getSelectionQuery(strParentRecordId)) : null;
        if (objParent == null) objParent = objXML.getRootNode();
        objParent.appendChild(objRecordNode);
      }

      //iterate through the named properties on the hash; assume values for each property are scalar (further assume string)
      for (var p in objRecord)
        if (objRecord[p] != null)
          objRecordNode.setAttribute(p, objRecord[p].toString());

      //if user chose to redraw, do so here (user must explicitly send false to stop a redraw)
      if (bRedraw !== false)
        this.redrawRecord(this._cdfav(objRecord, "id"), action);

      //return a handle to the new node
      return objRecordNode;
    } else {
      throw new jsx3.IllegalArgumentException("objRecord", objRecord);
    }
  };

  /**
   * Inserts a new record into the XML data source of this object. This method is the same as
   * <code>insertRecord()</code> except that its first parameter is of type <code>jsx3.xml.Entity</code> rather than
   * <code>Object</code>.
   *
   * @param objRecordNode {jsx3.xml.Entity} an XML element of name <code>record</code>. Note that most classes that
   *    implement this interface require that all records have an attribute named <code>jsxid</code> that is unique
   *    across all records in the XML document.
   * @param strParentRecordId {String} the unique <code>jsxid</code> of an existing record. If this optional parameter
   *    is provided and a record exists with a matching <code>jsxid</code> attribute, the new record will be added as a child of
   *    this record. Otherwise, the new record will be added to the root <code>data</code> element.
   * @param bRedraw {boolean} if <code>true</code> or <code>null</code>, the on-screen view of this object is
   *    immediately updated to reflect the additional record.
   * @see #insertRecord()
   */
  CDF_prototype.insertRecordNode = function(objRecordNode, strParentRecordId, bRedraw) {
    //exit early if no value hash supplied
    if (objRecordNode instanceof jsx3.xml.Entity) {

      //get xml document that holds the data records
      var objXML = this.getXML();

      // find out who should own the new record and append new record as a child
      var action = CDF.INSERT;

      //check if a record with the same ID already exists
      var objExistRecordNode = objXML.selectSingleNode(this._getSelectionQuery(this._cdfav(objRecordNode, "id")));
      if (objExistRecordNode != null) {
        //update action
        action = CDF.UPDATE;
        objExistRecordNode.getParent().replaceNode(objRecordNode,objExistRecordNode);
      } else {
        var objParent = (strParentRecordId != null) ?
            objXML.selectSingleNode(this._getSelectionQuery(strParentRecordId)) : null;
        if (objParent == null) objParent = objXML.getRootNode();
        objParent.appendChild(objRecordNode);
      }

      // if user chose to redraw, do so here (user must explicitly send false to stop a redraw)
      if (bRedraw !== false)
        this.redrawRecord(this._cdfav(objRecordNode, "id"), action);
    } else {
      throw new jsx3.IllegalArgumentException("objRecordNode", objRecordNode);
    }
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
  CDF_prototype.insertRecordProperty = function(strRecordId,strPropName,strPropValue,bRedraw) {
    //check if a record with the same ID already exists
    var objRecordNode = this.getRecordNode(strRecordId);
    if (objRecordNode != null) {
      //add an attribute to the XML-formatted record to persist
      objRecordNode.setAttribute(strPropName,strPropValue);

      //if user chose to redraw, do so here (user must explicitly send false to stop a redraw)
      if (bRedraw !== false)
        this.redrawRecord(strRecordId, CDF.UPDATE);
    } else {
      CDF._LOG.debug(jsx3._msg("cdf.prop_ins", strRecordId));
    }
    //return handle to self
    return this;
  };

  /**
   * Removes a specific property from a record. If no such record exists in the XML document, this method fails quietly.
   *
   * @param strRecordId {String} the <code>jsxid</code> attribute of the data record to modify.
   * @param strPropName {String} the name of the property to remove from the record.
   * @param bRedraw {boolean} if <code>true</code> or <code>null</code>, the on-screen view of this object is
   *    immediately updated to reflect the deleted property.
   */
  CDF_prototype.deleteRecordProperty = function(strRecordId,strPropName,bRedraw) {
    //get xml document that holds the data records
    var objXML = this.getXML();

    //check if a record with the same ID already exists
    var objRecordNode = objXML.selectSingleNode(this._getSelectionQuery(strRecordId));
    if (objRecordNode != null) {
      //add an attribute to the XML-formatted record to persist
      objRecordNode.removeAttribute(strPropName);

      //if user chose to redraw, do so here (user must explicitly send false to stop a redraw)
      if (bRedraw !== false)
        this.redrawRecord(strRecordId, CDF.UPDATE);
    } else {
      CDF._LOG.debug(jsx3._msg("cdf.prop_del", strRecordId));
    }
  };

  /**
   * An abstract method that must be implemented by any class that implements this interface. Implementations of this
   * method should redraw the specified record in the on-screen view.
   *
   * @param strRecordId {String} the <code>jsxid</code> attribute of the data record to redraw.
   * @param intAction {int} <code>INSERT</code>, <code>UPDATE</code>, or <code>DELETE</code>.
   * @see #INSERT
   * @see #UPDATE
   * @see #DELETE
   */
  CDF_prototype.redrawRecord = jsx3.Method.newAbstract("strRecordId", "intAction");

  /**
   * Transfers a CDF record from another object to this object. If no XML data source exists
   * yet for this object, an empty one is created before adding the new record. This method always updates the
   * on-screen view of both the source and destination objects.
   * <p/>
   * This method fails quietly if any of the following conditions apply:
   * <ul>
   * <li>there is no object with id equal to <code>strSourceId</code></li>
   * <li>there is no record in the source object with jsxid equal to <code>strRecordId</code></li>
   * <li><code>strParentRecordId</code> is specified and there is no record in this object with
   *    jsxid equal to <code>strParentRecordId</code></li>
   * <li>the this object already has a record with jsxid equal to the record to adopt</li>
   * </ul>
   *
   * @param strSourceId {String|jsx3.xml.CDF} <span style="text-decoration: line-through;">either the id of the source object or the</span> source object itself.
   * @param strRecordId {String} the <code>jsxid</code> attribute of the data record in the source object to transfer.
   * @param strParentRecordId {String} the unique <code>jsxid</code> of an existing record. If this optional parameter
   *    is provided, the adopted record will be added as a child of this record. Otherwise, the adopted record will
   *    be added to the root <code>data</code> element.
   * @param-private bRedraw {Boolean} forces suppression of the insert event
   * @return {jsx3.xml.Entity} the adopted record.
   */
  CDF_prototype.adoptRecord = function(strSourceId, strRecordId, strParentRecordId, bRedraw) {
    //get handle to existing parent
    var objJSX = strSourceId;
/* @JSC :: begin DEP */
    if (typeof(strSourceId) == "string") objJSX = jsx3.GO(strSourceId);
/* @JSC :: end */

/* @JSC :: begin DEP */
    if (objJSX != null) {
/* @JSC :: end */
      //make sure the record we're adopting isn't a direct ancestor (or self); that would cause infinite recursion
      var objRecord = objJSX.getRecordNode(strRecordId);
      if (objRecord != null) {
        //get handle to the node that will become the new parent for the adoptee; if no id passed for the parent, assume that the parent should simply be the root node
        var objParent = (strParentRecordId == null) ? this.getXML().getRootNode() : this.getRecordNode(strParentRecordId);

        //check for null
        if (objParent != null) {
          //loop up the dom for the XML source document to make sure a child isn't adopting a parent
          var objTemp = objParent;
          while (objTemp != null && !objTemp.equals(objRecord)) objTemp = objTemp.getParent();
          //check for null (a good thing, in this case)
          if (objTemp == null) {

            // check for a duplicate jsxid in adoption between JSX objects
            if (objJSX != this) {
              var dupCheck = this.getRecordNode(strRecordId);
              if (dupCheck != null) {
                CDF._LOG.debug(jsx3._msg("cdf.adopt_col", this, strRecordId));
                return;
              }
            }

            //no match found; allow the adoption (a combination of a delete + insert)
            var objRecordNode = objJSX.deleteRecord(strRecordId);
            this.insertRecordNode(objRecordNode,strParentRecordId,bRedraw);
            return this.getRecordNode(strRecordId);
          } else {
            //no need to send error as this is a common occurrence
            //jsx3.util.Logger.doLog("CDF9","Invalid adoption: the CDF record (" + strParentRecordId +") cannot be adopted by a direct descendant. The JSX Object, '" + this.getId() + "', was unable to adopt the record.");
          }
        } else {
          CDF._LOG.debug(jsx3._msg("cdf.adopt_dest", this, strRecordId, strParentRecordId));
        }
      } else {
        CDF._LOG.debug(jsx3._msg("cdf.adopt_src", this, strRecordId, objJSX));
      }
/* @JSC :: begin DEP */
    } else {
      CDF._LOG.debug("adoptRecord() no object with id: " + strSourceId);
    }
/* @JSC :: end */
  };

  /**
   * Creates a new CDF record and inserts it into the CDF data source of this object, <i>before</i> the record identified by <b>strSiblingRecordId</b>.
   * <p/>
   * This method fails quietly if any of the following conditions apply:
   * <ul>
   * <li>there is no existing record with a jsxid equal to <code>strSiblingRecordId</code></li>
   * <li>there is an existing record with jsxid equal to <code>objRecord.jsxid</code></li>
   * </ul>
   *
   * @param objRecord {Object<String, String>} a JavaScript object containing property/value pairs that define the
   *    attributes of the XML entity to create. Note that most classes that implement this interface require that all
   *    records have an attribute named <code>jsxid</code> that is unique across all records in the XML document.
   *    All property values will be treated as strings. Additionally, the following 3 characters are escaped:
   *    <code>" &gt; &lt;</code>.
   * @param strSiblingRecordId {String} the unique <code>jsxid</code> of an existing record before which the new record will be inserted.
   * @param bRedraw {boolean} if <code>true</code> or <code>null</code>, the on-screen view of this object is
   *    immediately updated to reflect the additional record.
   * @return {jsx3.xml.Entity} the newly created entity.
   * @see #adoptRecordBefore()
   */
  CDF_prototype.insertRecordBefore = function(objRecord, strSiblingRecordId, bRedraw) {
    //exit early if no value hash supplied
    var objXML = this.getXML();
    var objExistingNode = objXML.selectSingleNode(this._getSelectionQuery(this._cdfav(objRecord, "id")));
    if (objExistingNode) {
      CDF._LOG.debug(jsx3._msg("cdf.before_col", this._cdfav(objRecord, "id"), this));
    } else {
      var objSiblingNode = objXML.selectSingleNode(this._getSelectionQuery(strSiblingRecordId));
      if(objSiblingNode != null && objSiblingNode.getParent() != null) {
        var objNewNode = this.insertRecord(objRecord,this._cdfav(objSiblingNode.getParent(), "id"),false);
        if(objNewNode) {
          this.adoptRecordBefore(this,this._cdfav(objRecord, "id"),strSiblingRecordId,bRedraw);
          return objNewNode;
        }
      } else {
        CDF._LOG.debug(jsx3._msg("cdf.before_rec", strSiblingRecordId, this));
      }
    }
  };

  /**
   * Equivalent to adoptRecord, except that the to-be relationship is as a previousSibling to the CDF record identified by the parameter, <b>strSiblingRecordId</b>
   * <p/>
   * This method fails quietly if any of the following conditions apply:
   * <ul>
   * <li>there is no record with a jsxid equal to <code>strSourceId</code></li>
   * <li>there is no record in the source object with a jsxid equal to <code>strRecordId</code></li>
   * <li><code>strSiblingRecordId</code> is specified and there is no record in this object with a
   *    jsxid equal to <code>strParentRecordId</code></li>
   * <li>this object already has a record with jsxid equal to the record to adopt</li>
   * </ul>
   *
   * @param strSourceId {String|jsx3.xml.CDF} <span style="text-decoration: line-through;">either the id of the source object or the</span> source object itself.
   * @param strRecordId {String} the <code>jsxid</code> attribute of the data record in the source object to transfer.
   * @param strSiblingRecordId {String} the unique <code>jsxid</code> of an existing record in front of
   * which the record identified by strSourceId will be placed
   * @param bRedraw {boolean} if <code>true</code> or <code>null</code>, the on-screen view of this object is
   *    immediately updated to reflect the deleted record.
   * @return {jsx3.xml.Entity} the adopted record.
   */
  CDF_prototype.adoptRecordBefore = function(strSourceId, strRecordId, strSiblingRecordId, bRedraw) {
    //get handle to existing parent
    var objJSX = strSourceId;
/* @JSC :: begin DEP */
    if (typeof(strSourceId) == "string") objJSX = jsx3.GO(strSourceId);
/* @JSC :: end */

    if (objJSX == this && strRecordId == strSiblingRecordId) {
      ; // a record is already inserted before itself
    } else {
      //first resolve the parent id (who should actually adopt)
      var objParent = this.getRecordNode(strSiblingRecordId).getParent();
      var strTrueParentRecordId = this._cdfav(objParent, "jsx");

      //insert as child of actual parent and then do an insertBefore
      var objRecordNode = this.adoptRecord(strSourceId, strRecordId, strTrueParentRecordId,false);
      if (objRecordNode) {
        var objRef = this.getRecordNode(strSiblingRecordId);
        objParent.insertBefore(objRecordNode,objRef);

        //call redraw, passing insertbefore
        if (bRedraw !== false) {
          this.redrawRecord(this._cdfav(objRecordNode, "id"), CDF.INSERTBEFORE);
//          for (var i = objRecordNode.getChildIterator(); i.hasNext(); )
//            this.redrawRecord(this._cdfav(i.next(), "id"), CDF.INSERT);
        }

        return objRecordNode;
      }
    }
  };

  /**
   * Removes a record from the XML data source of this object.
   *
   * @param strRecordId {String} the <code>jsxid</code> attribute of the data record to remove.
   * @param bRedraw {boolean} if <code>true</code> or <code>null</code>, the on-screen view of this object is
   *    immediately updated to reflect the deleted record.
   * @return {jsx3.xml.Entity} the record removed from the data source or <code>null</code> if no such record found.
   */
  CDF_prototype.deleteRecord = function(strRecordId,bRedraw) {
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
//        for (var i = objNode.getChildIterator(); i.hasNext(); )
//          this.redrawRecord(this._cdfav(i.next(), "id"), CDF.DELETE);
      }

      //return the removed node
      return objNode;
    }

    return null;
  };

  /**
   * Returns an object containing the attributes of a particular CDF record as property/value pairs. The object returned by this
   * method is a copy of the underlying data. Therefore, updates to this object will not affect the underlying data.
   * <p/>
   * The following two lines of code evaluate to the same value:
   * <pre>
   * objCDF.getRecord(strId).propName;
   * objCDF.getRecordNode(strId).getAttribute("propName");</pre>
   *
   * @param strRecordId {String} the <code>jsxid</code> attribute of the data record to return.
   * @return {Object<String, String>} the object representation of a CDF node or <code>null</code> if no such record found.
   * @see #getRecordNode()
   */
  CDF_prototype.getRecord = function(strRecordId) {
    //get a handle to the record node object
    var objNode = this.getRecordNode(strRecordId);

    //if this object exists, create a JavaScript object clone and return
    if (objNode != null) {
      var o = {};
      var names = objNode.getAttributeNames();
      for (var i = 0; i < names.length; i++)
        o[names[i]] = objNode.getAttribute(names[i]);
      return o;
    }

    return null;
  };

 /**
   * Returns an array containing all CDF IDs (<code>jsxid</code>) of this CDF.
   *
   * @return  {Array<String>} the array of jsxid.
   */
   CDF_prototype.getRecordIds = function() {
    var arrayIds = [];
    var objXML = this.getXML();
    var itrNodes = objXML.selectNodeIterator("//" + this._cdfan("children"));
    while (itrNodes.hasNext()) {
      var node = itrNodes.next();
      arrayIds.push(this._cdfav(node, "id"));
    }
    return arrayIds;
  };

  /**
   * Returns a record from the XML data source of this object. This returned value is a handle to the record and
   * not a clone. Therefore, any updates made to the returned value with update the XML document of this object.
   * To reflect such changes in the on-screen view of this object, call
   * <code>redrawRecord(strRecordId, jsx3.xml.CDF.UPDATE);</code> on this object.
   *
   * @param strRecordId {String} the <code>jsxid</code> attribute of the data record to return.
   * @return {jsx3.xml.Entity} the record node or <code>null</code> if none exists with a <code>jsxid</code>
   *    attribute equal to <code>strRecordId</code>.
   * @see #redrawRecord()
   * @see #getRecord()
   */
  CDF_prototype.getRecordNode = function(strRecordId) {
    //get handle to xml document in cache
    var objXML = this.getXML();
    return objXML.selectSingleNode(this._getSelectionQuery(strRecordId));
  };

  /** @private @jsxobf-clobber-shared */
  CDF_prototype._getSelectionQuery = function(strRecordId) {
    //there appears to be a bug in how the W3C spec is implemented. Apostrophes cannot be escaped. TO DO: this has to be resolved...
    //see: http://www.w3.org/TR/2003/WD-xquery-20031112/#id-primary-expressions
    return ((strRecordId+"").indexOf("'") == -1) ?
      "//*[@" + this._cdfan("id") + "='" + strRecordId + "']" :
      '//*[@' + this._cdfan("id") + '="' + strRecordId + '"]';
  };

/* @JSC :: begin DEP */

  /**
   * Resets the XML of this control to the value returned by <code>CDF.newDocument()</code> and places the document
   * in the server cache.
   *
   * @param bRepaint {boolean} if <code>true</code> or <code>null</code>, the on-screen view of this object is
   *    immediately updated to reflect the inserted property.
   * @deprecated  Use <code>jsx3.xml.Cacheable.clearXmlData()</code> instead.
   * @see #newDocument()
   * @see jsx3.xml.Cacheable#clearXmlData()
   */
  CDF_prototype.resetData = function(bRepaint) {
    if (jsx3.xml.Cacheable && this.instanceOf(jsx3.xml.Cacheable)) {
      this.clearXmlData();
      if (bRepaint)
        this.repaint();
    }
  };

  /**
   * Removes this object's existing document from the cache and reloads the document from its original source.
   * This method is different from the method <code>resetData()</code> in that this method does not reset the XML
   * document of this object to an empty CDF document.
   *
   * @param-private bSystem {boolean} if true, the document will be removed even if this is a system-owned document
   * @return {jsx3.xml.Document} jsx3.xml.Document instance
   * @deprecated  use <code>jsx3.xml.Cacheable.resetXmlCacheData()</code> instead
   * @see #resetData()
   * @see jsx3.xml.Cacheable#resetXmlCacheData()
   */
  CDF_prototype.reloadFromSource = function(bSystem) {
    if (jsx3.xml.Cacheable && this.instanceOf(jsx3.xml.Cacheable))
      this.resetXmlCacheData();
  };

  /* @JSC :: end */

  /**
   * @package
   */
  CDF_prototype.assignIds = function() {
    var xml = this.getXML();
    for (var i = xml.selectNodeIterator("//" + this._cdfan("children") + "[not(@"+this._cdfan("id")+")]"); i.hasNext(); ) {
      var node = i.next();
      node.setAttribute(this._cdfan("id"), CDF.getKey());
    }
  };

  /** @private @jsxobf-clobber */
  CDF._INDEXEDPROP_REGEX = /\[(\w+)\]$/;

  /**
   * Converts all attributes in this CDF document that are property keys of the form <code>{key}</code> to
   * the value of the property.
   * @param objProps {jsx3.app.Properties} the properties repository to query.
   * @param arrProps {Array<String>} if provided, these attributes are converted rather than the default set of
   *    attributes.
   * @param bUnion {boolean} if <code>true</code>, <code>arrProps</code> is combined with the default set of
   *    attributes and those attributes are converted.
   */
  CDF_prototype.convertProperties = function(objProps, arrProps, bUnion) {
    if (arrProps == null)
      arrProps = CDF.PROPERTY_ATTR;
    else if (bUnion)
      arrProps.push.apply(arrProps, CDF.PROPERTY_ATTR);

    // the fast way requires MSXML 4, Safari does not seem to be supported
    if (jsx3.getXmlVersion() > 3 && !jsx3.CLASS_LOADER.SAF) {
      var nameTokens = new Array(arrProps.length);
      for (var i = 0; i < arrProps.length; i++)
        nameTokens[i] = "name()='" + arrProps[i] + "'";

      var nameQuery = nameTokens.join(" or ");
      var valueQuery = "substring(.,1,1)='{' and substring(.,string-length(.),1)='}'";
      var strQuery = "//@*[("+nameQuery+") and ("+valueQuery+")]";

      for (var i = this.getXML().selectNodeIterator(strQuery); i.hasNext(); ) {
        var node = i.next();
        var value = node.getValue();
        var key = value.substring(1, value.length-1);
        var indexKey = null;
        if (key.match(CDF._INDEXEDPROP_REGEX)) {
          key = RegExp.leftContext;
          indexKey = RegExp.$1;
        }

        var propValue = objProps.get(key);
        if (typeof(propValue) != "undefined") {
          if (indexKey != null && propValue instanceof Object)
            node.setValue(propValue[indexKey]);
          else
            node.setValue(propValue);
        }
      }
    }
    // the slow way
    else {
      var strQuery = "//@" + arrProps.join(" | //@");
      for (var j = this.getXML().selectNodeIterator(strQuery); j.hasNext(); ) {
        var node = j.next();
        var value = node.getValue();
        if (value.indexOf("{") == 0 && jsx3.util.strEndsWith(value, "}")) {
          var key = value.substring(1, value.length-1);
          var indexKey = null;
          if (key.match(CDF._INDEXEDPROP_REGEX)) {
            key = RegExp.leftContext;
            indexKey = RegExp.$1;
          }

          var propValue = objProps.get(key);
          if (typeof(propValue) != "undefined") {
            if (indexKey != null && propValue instanceof Object)
              node.setValue(propValue[indexKey]);
            else
              node.setValue(propValue);
          }
        }
      }
    }
  };

  /**
   * Creates a new XML document that represents an empty CDF document. The XML source of the new document
   * is <code>&lt;data jsxid="jsxroot"/&gt;</code>.
   *
   * @return {jsx3.xml.Document} the newly created document.
   */
  CDF.newDocument = function() {
    var objXML = new jsx3.xml.Document();
    objXML.loadXML('<data jsxid="jsxroot"/>');
    return objXML;
  };

  /**
   * Generates a unique <code>jsxid</code> attribute for a CDF record. This method can be used for new CDF records
   * when there is no natural unique key to assign to them.
   * @return {String}
   */
  CDF.getKey = function() {
    return "jsx_" + (CDF._SERIAL++).toString(36);
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00").
   * @return {String}
   * @deprecated
   */
  CDF.getVersion = function() {
    return "3.00.00";
  };

/* @JSC :: end */

});

/**
 * A subclass of <code>jsx3.xml.Document</code> that implements the CDF interface. This class simply exposes the CDF
 * convenience methods on an XML document.
 */
jsx3.Class.defineClass("jsx3.xml.CDF.Document", jsx3.xml.Document, [jsx3.xml.CDF], function(Document, Document_prototype) {

  /**
   * Returns this document to conform to the contract of the <code>jsx3.xml.CDF</code> interface.
   * @return {jsx3.xml.Document} this object.
   */
  Document_prototype.getXML = function() {
    return this;
  };

  /**
   * No-op.
   * @param strRecordId {String} the <code>jsxid</code> attribute of the data record to redraw.
   * @param intAction {int} <code>INSERT</code>, <code>UPDATE</code>, or <code>DELETE</code>.
   */
  Document_prototype.redrawRecord = function(strRecordId, intAction) {
  };

  Document_prototype.cloneDocument = function() {
    return Document.wrap(this.jsxsuper());
  };

  /**
   * Creates a new XML document that represents an empty CDF document. The XML source of the new document
   * is <code>&lt;data jsxid="jsxroot"/&gt;</code>.
   *
   * @return {jsx3.xml.CDF.Document} the newly created document.
   */
  Document.newDocument = function() {
    var objXML = new Document();
    objXML.loadXML('<data jsxid="jsxroot"/>');
    return objXML;
  };

  /**
   * @param objXML {jsx3.xml.Document}
   * @return {jsx3.xml.CDF.Document}
   */
  Document.wrap = function(objXML) {
    return new Document(objXML.getNativeDocument());
  };

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.xml.CDF
 * @see jsx3.xml.CDF
 * @jsxdoc-definition  jsx3.Class.defineInterface("jsx3.CDF", -, function(){});
 */
jsx3.CDF = jsx3.xml.CDF;

/* @JSC :: end */
