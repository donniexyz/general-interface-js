/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _EP _PERM _jsxselectionns _jsxselectionnsobj serializeNamespacesMap

/**
 * Wrapper of the native browser XML node class. This class provides methods for querying, traversing, and creating
 * XML entities.
 * <p/>
 * This class is never instantiated by the developer, rather instances are returned from various methods in this
 * class and the <code>jsx3.xml.Document</code> class.
 * <p/>
 * Note that several methods of this class fail quietly when an error occurs with the wrapped native browser XML
 * classes. Methods that are documented as failing quietly should always be followed by a call to
 * <code>hasError()</code> to ensure that no error has occurred.
 */
jsx3.Class.defineClass("jsx3.xml.Entity", null, null, function(Entity, Entity_prototype) {

  /**
   * {int} The node type for an element node.
   * @final @jsxobf-final
   */
  Entity.TYPEELEMENT = 1;

  /**
   * {int} The node type for an attribute node. 
   * @final @jsxobf-final
   */
  Entity.TYPEATTRIBUTE = 2;

  /**
   * {int} The node type for a text node.
   * @final @jsxobf-final
   */
  Entity.TYPETEXT = 3;

  /**
   * {int} The node type for a character data node.
   * @final @jsxobf-final
   */
  Entity.TYPECDATA = 4;

  /**
   * {int} The node type for a comment node.
   * @final @jsxobf-final
   */
  Entity.TYPECOMMENT = 8;

  /* @jsxobf-clobber */
  Entity._SUPPORTED = {1:true, 2:true, 3:true, 4:true, 7:true, 8:true};

  /**
   * The instance initializer. If an error occurs while instantiating this entity, this method sets the error
   * property of this entity and returns quietly.
   *
   * @param objEntity {Object} the browser native entity instance to wrap.
   */
  Entity_prototype.init = function(objEntity) {
    //bind reference to the MSXML parser node that this classes APIs will wrap
    /* @jsxobf-clobber */
    this._entity = objEntity;

    //for now only types 1 - 4 are supported
    /* @jsxobf-clobber */
    this._nodeType = objEntity.nodeType;

    //check the type of entity - if not valid modify the error object
    if (!(Entity._SUPPORTED[this._nodeType])) {
      this.setError(300, jsx3._msg("xml.wrap_type", this._nodeType));
    } else if (this._error) {
      this.setError(0);
    }
  };

  /**
   * Creates a new node and returns as jsx3.xml.Entity instance
   * @param intType {int} Four types are supported: jsx3.xml.Entity.TYPEELEMENT, jsx3.xml.Entity.TYPEATTRIBUTE, jsx3.xml.Entity.TYPETEXT, jsx3.xml.Entity.TYPECDATA. Note: only nodes of TYPEELEMENT and TYPEATTRIBUTE will pay attention to the @strNodeName property; if not of this TYPE, pass an empty string
   * @param strNodeName {String} node name for the node to add as a child
   * @param strNS {String} namespace URI for the node being created, if it is preceded by a URI.
   *            So, for example, if 'strName' is "xsi:string", then the 'strNS'
   *            value should be the namespace associated with the xsi prefix
   * @return {jsx3.xml.Entity} reference to the new node wrapped in a jsx3.xml.Entity instance
   */
  Entity_prototype.createNode = function(intType, strNodeName, strNS) {
    //get handle to the document object (this has the ability to create nodes)
    var objDoc = this._getNativeDoc();
    var objNode = null;

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    if (strNS == null) strNS = "";
    if (intType == 3) {
      objNode = objDoc.createTextNode(strNodeName);
    } else if (intType == 4) {
      objNode = objDoc.createCDATASection(strNodeName);
    } else if (intType == 8) {
      objNode = objDoc.createComment(strNodeName);
    } else {
      objNode = objDoc.createNode(intType, strNodeName, strNS);
    }
/* @JSC */ } else {
    // NOTE: see http://bugs.webkit.org/show_bug.cgi?id=14835
    if (strNS == null || strNS == "") strNS = null;
    if (intType == 2) {
      objNode = objDoc.createAttributeNS(strNS, strNodeName);
    } else if (intType == 3) {
      objNode = objDoc.createTextNode(strNodeName);
    } else if (intType == 4) {
      objNode = objDoc.createCDATASection(strNodeName);
    } else if (intType == 8) {
      objNode = objDoc.createComment(strNodeName);
    } else {
      objNode = objDoc.createElementNS(strNS, strNodeName);
    }
/* @JSC */ }

    //return wrapped node
    return new Entity(objNode);
  };

  /**
   * Creates a new node that is an exact clone of this node. If an error occurs while
   * cloning this XML entity, this method sets the error property of this entity and returns quietly.
   *
   * @param bDeep {boolean} if true, all descendants of this object will also be cloned and returned
   * @return {jsx3.xml.Entity} newly cloned MSXML Node object wrapped in a jsx3.xml.Entity instance
   */
  Entity_prototype.cloneNode = function(bDeep) {
    //make sure our wrapped node isn't null and user is passing the correct object type
    if (this._nodeType == 1) {
      var objMSXMLNode = this._entity.cloneNode(bDeep);
      return (new Entity(objMSXMLNode));
    } else {
      this.setError(301, jsx3._msg("xml.clone_tp", this._nodeType));
    }
  };

  /**
   * Appends the <code>objEntity</code> parameter as a child of this entity. If an error occurs while
   * appending to this XML entity, this method sets the error property of this entity and returns quietly.
   *
   * @param objEntity {jsx3.xml.Entity} jsx3.xml.Entity instance that will be bound as a child to this jsx3.xml.Entity instance
   * @return {jsx3.xml.Entity} reference to self
   */
  Entity_prototype.appendChild = function(objEntity) {
    var e = objEntity._entity;
/* @JSC */ if (jsx3.CLASS_LOADER.SAF || jsx3.CLASS_LOADER.FX) {
    var docChange = e.ownerDocument != this._entity.ownerDocument;
    if (docChange) e = this._entity.ownerDocument.importNode(e, true);
/* @JSC */ }

    //make sure our wrapped node isn't null and user is passing the correct object type
    if (this._entity != null && e != null && this._nodeType == 1) {
      this._entity.appendChild(e);

/* @JSC */ if (jsx3.CLASS_LOADER.SAF || jsx3.CLASS_LOADER.FX) {
      if (docChange && objEntity._entity.parentNode)
        objEntity._entity.parentNode.removeChild(objEntity._entity);
      objEntity._entity = e;
/* @JSC */ }
    } else {
      this.setError(302, jsx3._msg("xml.err_append", objEntity));
    }
    return this;
  };

  /**
   * inserts the jsx3.xml.Entity instance, @objEntityNew immediately before the existing child @objEntityRef and returns a handle to @objEntityNew; requires that both parameters be of type jsx3.xml.Entity.TYPEELEMENT; requires that this object also be of TYPEELEMENT; returns null if all conditions are not met
   * @param objEntityNew {jsx3.xml.Entity} jsx3.xml.Entity object (the new one to add)
   * @param objEntityRef {jsx3.xml.Entity} jsx3.xml.Entity object (the reference node in front of which to insert the new node)
   * @return {jsx3.xml.Entity} jsx3.xml.Entity instance or null
   */
  Entity_prototype.insertBefore = function(objEntityNew, objEntityRef) {
    if (objEntityRef == null) {
      if (this._nodeType == 1) {
        this.appendChild(objEntityNew);
        return objEntityNew;
      }
    } else {
      var e = objEntityNew._entity;
/* @JSC */ if (jsx3.CLASS_LOADER.SAF || jsx3.CLASS_LOADER.FX) {
      var docChange = e.ownerDocument != this._entity.ownerDocument;
      if (docChange) e = this._entity.ownerDocument.importNode(e, true);
/* @JSC */ }

      if (this._nodeType == 1 && objEntityRef._nodeType != 2 && objEntityNew._nodeType != 2) {
        if (objEntityRef.getParent() != null && objEntityRef.getParent().equals(this)) {
          var retVal = (new Entity(this._entity.insertBefore(e, objEntityRef._entity)));

/* @JSC */ if (jsx3.CLASS_LOADER.SAF || jsx3.CLASS_LOADER.FX) {
          if (docChange && objEntityNew._entity.parentNode) {
            objEntityNew._entity.parentNode.removeChild(objEntityNew._entity);
          }
          objEntityNew._entity = e;
/* @JSC */ }

          return retVal;
        }
      }
      return null;
    }
  };

  /**
   * Replaces a child element of this element, <code>objEntityOld</code> with another element, <code>objEntityNew</code> 
   * and returns <code>objEntityOld</code>. Both children must be XML element nodes. <code>objEntityOld</code> must
   * be an existing child node of this node. 
   * 
   * @param objEntityNew {jsx3.xml.Entity} the element to add.
   * @param objEntityOld {jsx3.xml.Entity} the child element to replace.
   * @return {jsx3.xml.Entity} the replaced element or <code>null</code> if the replacement did not occur because one
   *    or more of the parameters was invalid. 
   */
  Entity_prototype.replaceNode = function(objEntityNew, objEntityOld) {
    var e = objEntityNew._entity;
/* @JSC */ if (jsx3.CLASS_LOADER.SAF || jsx3.CLASS_LOADER.FX) {
    var docChange = e.ownerDocument != this._entity.ownerDocument;
    if (docChange) e = this._entity.ownerDocument.importNode(e, true);
/* @JSC */ }

    if (this._nodeType == 1 && objEntityOld._nodeType == 1 && objEntityNew._nodeType == 1 && 
          this.equals(objEntityOld.getParent())) {
      var retVal = (new Entity(this._entity.replaceChild(e, objEntityOld._entity)));

/* @JSC */ if (jsx3.CLASS_LOADER.SAF || jsx3.CLASS_LOADER.FX) {
      if (docChange && objEntityNew._entity.parentNode)
        objEntityNew._entity.parentNode.removeChild(objEntityNew._entity);
      objEntityNew._entity = e;
/* @JSC */ }

      return retVal;
    }
    
    return null;
  };

  /**
   * Sets the @strValue of the named @strAttribute and binds as child of this
   * @param strName {String} name of the attribute
   * @param strValue {String} value of the attribute, if null then remove the attribute
   * @return {jsx3.xml.Entity} reference to this
   */
  Entity_prototype.setAttribute = function(strName, strValue) {
    //make sure our wrapped node isn't null and user is passing the correct object type
    if (strValue != null)
      // HACK: IE's XML conversion to String is incompatible with JavaScript, so explicit String conversion
      this._entity.setAttribute(strName, String(strValue));
    else
      this.removeAttribute(strName);
    return this;
  };

  /**
   * Returns the value for the named attribute <code>strName</code>.
   * @param strName {String} the name of the attribute.
   * @return {String} the attribute value or <code>null</code> if the attribute does not exist.
   */
  Entity_prototype.getAttribute = function(strName) {
    //return as simple string; no need to wrap
    return this._entity ? this._entity.getAttribute(strName) : null;
  };

  /**
   * Returns an object reference (a jsx3.xml.Entity instance) to the child attribute with the name, @strName.
   * This method should only be called on an instance of type <code>TYPEELEMENT</code>.
   *
   * @param strName {String} name of the attribute
   * @return {jsx3.xml.Entity} jsx3.xml.Entity instance referencing a single attribute node object
   */
  Entity_prototype.getAttributeNode = function(strName) {
    //make sure our wrapped node isn't null and user is passing the correct object type
    if (this._entity != null && this._nodeType == 1) {
      var objAtt = this._entity.getAttributeNode(strName);
      if (objAtt != null) return (new Entity(objAtt));
    }
  };

  /**
   * Sets the attribute object as a child of the element; if transferring an attribute from one element to another, this call must be preceded with removeAttributeNode on the previous owner
   * @param objAtt {jsx3.xml.Entity} jsx3.xml.Entity instance of type jsx3.xml.Entity.TYPEATTRIBUTE;
   * @return {jsx3.xml.Entity} reference to this
   */
  Entity_prototype.setAttributeNode = function(objAtt) {
    var e = objAtt._entity;
/* @JSC */ if (jsx3.CLASS_LOADER.SAF) {
    //3.6:  LUKE:  Removed FX from the conditional above:   (|| jsx3.CLASS_LOADER.FX)
    //             This same code worked in Fx 1.5 and 2.  I believe the transformiix processor was updated in all versions
    //             Validate against Fx release notes for both hot fixes and major releases to see if this should be changed or additional
    //             Firefox exceptions need to be noted per version, release, etc
    //I cannot find public DOM methods for setting the namespace as an axis (not attribute); there has to be something (or is this a bug to file for them)
    if(!jsx3.util.strEmpty(objAtt.getPrefix()))
      this.setAttribute("xmlns:" + objAtt.getPrefix(),objAtt.getNamespaceURI());
/* @JSC */ }

  /* @JSC */ if (jsx3.CLASS_LOADER.SAF  || jsx3.CLASS_LOADER.FX) {
     var docChange = e.ownerDocument != this._entity.ownerDocument;
    if (docChange) {
      e = this._entity.ownerDocument.createAttribute(e.nodeName);
      e.nodeValue = objAtt._entity.nodeValue;
      objAtt._entity = e;
    }
/* @JSC */ }

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    this._entity.setAttributeNode(e);
/* @JSC */ } else {
    this._entity.setAttributeNodeNS(e);
/* @JSC */ }
    return this;
  };

  /**
   * Returns handle to a jsx3.util.List instance of all children; note that this collection will always be empty (length = 0) for all types except for jsx3.xml.Entity.TYPEELEMENT
   * @return {jsx3.util.List<jsx3.xml.Entity>}
   * @see #getAttributeNames()
   */
  Entity_prototype.getAttributes = function() {
    //make sure our wrapped node isn't null and user is passing the correct object type
    if (this._entity != null && this._nodeType == 1)
      return new Entity.List(this._entity.attributes);
    else
      return null;
  };

  /**
   * Returns the names of all the attributes of this node. Iterating over the attribute names is more performant than
   * using the <code>getAttributes()</code> method.
   * @return {Array<String>}
   * @see #getAttributes()
   * @since 3.4
   */
  Entity_prototype.getAttributeNames = function() {
    var att = this._entity.attributes;
    var names = new Array(att.length);
    for (var i = 0; i < names.length; i++)
      names[i] = att[i].nodeName;
    return names;
  };

  /**
   * Returns reference to the document element (root) wrapped in jsx3.xml.Entity instance
   * @return {jsx3.xml.Entity} jsx3.xml.Entity instance
   */
  Entity_prototype.getRootNode = function() {
    return this._entity ? (new Entity(this._getNativeDoc(1))) : null;
  };

  /**
   * Returns the parent node of the context node. If the context node is the root node of the document, null is returned.
   * @return {jsx3.xml.Entity} parent node or null
   */
  Entity_prototype.getParent = function() {
    //return the parent ref; return null if na
    return (this._entity != this._getNativeDoc(1)) ? (new Entity(this._entity.parentNode)) : null;
  };

  /**
   * Returns an iterator that iterates over the child nodes of this node. Note that the iterator grants access to
   * only one child node at a time; once <code>next()</code> is called, the value returned by the previous call to
   * <code>next()</code> is no longer valid. This method is more performant than <code>getChildNodes()</code>.
   * <p/>
   * Note also that the iterator is a pointer into the children node list so removing or adding children to this node
   * while iterating may cause unexpected behavior.
   *
   * @param bIncludeText {boolean} if <code>true</code> then the returned iterator will include the child text nodes
   *   of this node.
   * @return {jsx3.util.Iterator<jsx3.xml.Entity>}
   * @see #getChildNodes()
   * @since 3.4
   */
  Entity_prototype.getChildIterator = function(bIncludeText) {
    return new Entity.ChildIterator(this._entity ? this._entity.childNodes : [], bIncludeText);
  };

  /**
   * Returns the child nodes of this entity. By default this method only returns the child nodes that are elements.
   * Text and CDATA children will be returned if <code>bIncludeText</code> is <code>true</code>.
   *
   * @param bIncludeText {boolean} if <code>true</code>, text and cdata children are returned with element children.
   * @return {jsx3.util.List<jsx3.xml.Entity>}
   * @see #getChildIterator()
   */
  Entity_prototype.getChildNodes = function(bIncludeText) {
    if (! this._entity) return new Entity.List([]);
    var nodes = this._entity.childNodes;
    var children = [];
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.nodeType == 1 ||
          (bIncludeText && (node.nodeType == 3 || node.nodeType == 4)))
        children[children.length] = node;
    }
    return new Entity.List(children);
  };

  /**
   * Removes the specified child (@objChildEntity) from the list of children and returns it; returns null if @objChildEntity is not actually a child
   * @param objChildEntity {jsx3.xml.Entity} jsx3.xml.Entity object that is a direct child of this jsx3.xml.Entity instance
   * @return {jsx3.xml.Entity} jsx3.xml.Entity instance or null
   */
  Entity_prototype.removeChild = function(objChildEntity) {
    //make sure acutal parent according to native relationships
    var p = objChildEntity.getParent();
    return p != null && p.equals(this) ?
        new Entity(this._entity.removeChild(objChildEntity._entity)) : null;
  };

  /**
   * Removes all descendant entities of this node
   */
  Entity_prototype.removeChildren = function() {
    var children = this._entity.childNodes;
    for (var i = children.length - 1; i >= 0; i--) {
      this._entity.removeChild(children[i]);
    }
  };

  /**
   * Removes the specified attribute by the given name (can only be called for nodes of type jsx3.xml.Entity.TYPELEMENT)
   * @param strAttName {String} the name of the attribute to remove
   */
  Entity_prototype.removeAttribute = function(strAttName) {
    //make sure acutal parent according to native relationships
    if (this._nodeType == 1) this._entity.removeAttribute(strAttName);
  };

  /**
   * removes the attribute object as a child of the element;
   * @param objAtt {jsx3.xml.Entity} jsx3.xml.Entity instance of type jsx3.xml.Entity.TYPEATTRIBUTE;
   * @return {jsx3.xml.Entity} reference to this
   */
  Entity_prototype.removeAttributeNode = function(objAtt) {
    this._entity.removeAttributeNode(objAtt._entity);
    return this;
  };

  /**
   * Tests the equivalency of two jsx3.xml.Entity instances as they wrap and can therefore point to the same native entity, causing a standard "==" comparison to fail
   * @param objEntity {jsx3.xml.Entity} jsx3.xml.Entity object
   * @return {boolean} true or false
   */
  Entity_prototype.equals = function(objEntity) {
    //make sure acutal parent according to native relationships
    return objEntity != null && objEntity._entity == this._entity;
  };

  /**
   * Returns one of: jsx3.xml.Entity.TYPEELEMENT, jsx3.xml.Entity.TYPEATTRIBUTE, jsx3.xml.Entity.TYPETEXT, jsx3.xml.Entity.TYPECDATA
   * @return {int}
   */
  Entity_prototype.getNodeType = function() {
    //nodeType was set at instantiation and can be referenced as a property on this JS class directly
    return this._nodeType;
  };

  /**
   * Returns the name of the node as string (assuming this jsx3.xml.Entity instance is of type jsx3.xml.Entity.TYPEELEMENT or jsx3.xml.Entity.TYPEATTRIBUTE). The other TYPES return "#cdata-section" and "#text" respectively
   * @return {String}
   */
  Entity_prototype.getNodeName = function() {
    return this._entity.nodeName;
  };

  /**
   * Returns the value (as string) for URI (universal resource identifier) of the namespace for the given node; returns an empty string if no namespace exists
   * @return {String}
   */
  Entity_prototype.getNamespaceURI = function() {
    //return as simple string; no need to wrap
    //TO DO: there seeems to be an inconsistency with the signature in firefox (bugzilla). make sure an empty string is returned
    var sns = this._entity.namespaceURI;
    if(sns == null) sns = "";
    return sns;
  };

  /**
   * Returns a single node selected by an XPath query executed on this node, or <code>null</code> if none is selected.
   * <p/>
   * Note that the XPath query is executed in the context of this node so relative paths are relative to this node.
   * However, this node may be nested in a larger XML document, in which case absolute paths are relative to the
   * root document of this node. This behavior matches the XPath specification.
   *
   * @param strQuery {String} an XPath query such as: <code>//somenode[@id='12']/somechild</code>.
   * @param strNS {String|Object} the selection namespace to use just for this query. This parameter is an optional
   *    shortcut for calling <code>setSelectionNamespaces()</code> on the owning document. The format of this parameter
   *    as a string is <code>"xmlns:ns1='uri1' xmlns:ns2='uri2'"</code> or as an object is <code>{'uri1':'ns1',
   *    'uri2':'ns2'}</code>.
   * @return {jsx3.xml.Entity} jsx3.xml.Entity instance or null
   */
  Entity_prototype.selectSingleNode = function(strQuery, strNS) {
    if (! this._entity) return null;
    return this._selectNodeOrNodes(strQuery, strNS, 0);
  };

  /**
   * Returns a list of nodes selected by an XPath query executed on this node.
   *
   * @param strQuery {String} an XPath query such as: <code>//somenode[@id='12']/somechild</code>.
   * @param strNS {String|Object} the selection namespace to use just for this query. This parameter is an optional
   *    shortcut for calling <code>setSelectionNamespaces()</code> on the owning document. The format of this parameter
   *    as a string is <code>"xmlns:ns1='uri1' xmlns:ns2='uri2'"</code> or as an object is <code>{'uri1':'ns1',
   *    'uri2':'ns2'}</code>.
   * @return {jsx3.util.List<jsx3.xml.Entity>}
   * @see #selectNodeIterator()
   * @see #selectSingleNode()  See selectSingleNode() for more information
   */
  Entity_prototype.selectNodes = function(strQuery, strNS) {
    if (! this._entity) return new Entity.List([]);
    return this._selectNodeOrNodes(strQuery, strNS, 1);
  };

  /**
   * Returns an iterator that iterates over the the result of an XPath query. Note that the iterator grants access to
   * only one child node at a time; once <code>next()</code> is called, the value returned by the previous call to
   * <code>next()</code> is no longer valid. This method is more performant than <code>selectNodes()</code>.
   *
   * @param strQuery {String} an XPath query such as: <code>//somenode[@id='12']/somechild</code>.
   * @param strNS {String|Object} the selection namespace to use just for this query. This parameter is an optional
   *    shortcut for calling <code>setSelectionNamespaces()</code> on the owning document. The format of this parameter
   *    as a string is <code>"xmlns:ns1='uri1' xmlns:ns2='uri2'"</code> or as an object is <code>{'uri1':'ns1',
   *    'uri2':'ns2'}</code>.
   * @return {jsx3.util.Iterator<jsx3.xml.Entity>}
   * @see #selectNodes()
   * @since 3.4
   */
  Entity_prototype.selectNodeIterator = function(strQuery, strNS) {
    if (! this._entity) return new Entity.SelectIterator();
    return this._selectNodeOrNodes(strQuery, strNS, 2);
  };

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {

  /**
   * Returns the right-hand side of a namespace qualified name. For example, "Price" will be returned for the
   * element &lt;USD:Price&gt;
   * @return {String}
   */
  Entity_prototype.getBaseName = function() {
    //return as simple string; no need to wrap
    return this._entity.baseName;
  };

  /**
   * Returns the left-hand side of a namespace qualified name. For example, "USD" will be returned for the
   * element &lt;USD:Price&gt;
   * @return {String}
   */
  Entity_prototype.getPrefix = function() {
    //return as simple string; no need to wrap
    return this._entity.prefix;
  };

  /**
   * Returns the XML (as String) for this node and any descendants. For an attribute this would be the
   *          attribute name and value (i.e., name="value")
   * @return {String}
   * @deprecated  Use <code>toString()</code> instead.
   * @see #toString()
   */
  Entity_prototype.getXML = function() {
    return this._entity.xml;
  };

  /**
   * Returns the XML (as String) for this node and any descendants. For an attribute this would be the
   *          attribute name and value (i.e., name="value")
   * @return {String}
   */
  Entity_prototype.toString = function() {
    var typeToken = "@" + this.getClass().getName();
    if (this._entity != null && !this.hasError()) {
      return (this._entity.xml) ? this._entity.xml :
          (this._entity.outerHTML ? this._entity.outerHTML : jsx3._msg("xml.str_unk", typeToken));
    } else {
      return this.hasError() ?
          jsx3._msg("xml.str_err", typeToken, this.getError()) :
          jsx3._msg("xml.str_empty", typeToken);
    }
  };

  /**
   * Contains the text content of the node, including the concatenated text contained by all descendant entities
   * @return {String}
   */
  Entity_prototype.getValue = function() {
    return (this._nodeType == 1) ? this._entity.text : this._entity.nodeValue;
  };

  /**
   * sets the text value for this entity; returns a handle to this jsx3.xml.Entity instance
   * @param strValue {String} value to set for this entity
   * @return {jsx3.xml.Entity} self
   */
  Entity_prototype.setValue = function(strValue) {
    if (strValue == null) strValue = "";
    else strValue = String(strValue);
    
    if (this._nodeType == 1) {
      this._entity.text = strValue;
    } else {
      this._entity.nodeValue = strValue;
    }
    return this;
  };

  /* @jsxobf-clobber-shared */
  Entity_prototype._selectNodeOrNodes = function(strQuery, strNS, intMode) {
    if (typeof(strNS) == "object") strNS = jsx3.xml.Document.serializeNamespacesMap(strNS);

    //resolve the declaration as a selection namespace
    var strPrevNS, objDoc = null;
    if (strNS != null) {
      objDoc = this._entity.ownerDocument;
      strPrevNS = objDoc.getProperty("SelectionNamespaces");
      objDoc.setProperty("SelectionNamespaces", strNS);
    }

    var retVal = null, objNodes;
    if (intMode) {
      try {
        objNodes = this._entity.selectNodes(strQuery);
      } catch (e) {
        objNodes = [];
      }
      retVal = intMode == 2 ? new Entity.SelectIterator(objNodes) : new Entity.List(objNodes);
    } else {
      try {
        var objNode = this._entity.selectSingleNode(strQuery);
      } catch (e) {;}
      retVal = objNode ? new Entity(objNode) : null;
    }

    if (objDoc) objDoc.setProperty("SelectionNamespaces", strPrevNS);
    
    return retVal;
  };

/* @JSC */ } else {

  Entity_prototype.getBaseName = function() {
    //return as simple string; no need to wrap
    var strNodeName = this.getNodeName();
    var index = strNodeName.indexOf(":");
    return index >= 0 ? strNodeName.substring(index+1) : strNodeName;
  };

  Entity_prototype.getPrefix = function() {
    //return as simple string; no need to wrap
    var strNodeName = this.getNodeName();
    var index = strNodeName.indexOf(":");
    return index >= 0 ? strNodeName.substring(0, index) : "";
  };

  Entity_prototype.getXML = function() {
    return this.toString();
  };

  Entity_prototype.toString = function() {
    var typeToken = "@" + this.getClass().getName();

    if (this._entity != null && !this.hasError()) {
      if (this.getNodeType() == 2) {
        return this.getNodeName() + '="' + this.getValue() + '"';
      } else {
        return (new XMLSerializer()).serializeToString(this._entity);
      }
    } else {
      return this.hasError() ?
          jsx3._msg("xml.str_err", typeToken, this.getError()) :
          jsx3._msg("xml.str_empty", typeToken);
    }
  };

  Entity_prototype.getValue = function() {
    if (this._nodeType == 1) {
      var tokens = new Array(this._entity.childNodes.length);
      for (var i = 0; i < this._entity.childNodes.length; i++) {
        var child = this._entity.childNodes[i];
        if (child.nodeType == Entity.TYPETEXT || child.nodeType == Entity.TYPECDATA)
          tokens[i] = child.nodeValue;
        else
          tokens[i] = child.textContent;
      }
      return tokens.join("");
    } else {
      return this._entity.nodeValue;
    }
  };

  Entity_prototype.setValue = function(strValue) {
    if (strValue == null) strValue = "";
    if (this._nodeType == 1) {
      this.removeChildren();
      this.appendChild(this.createNode(3, strValue));
    } else {
      this._entity.nodeValue = strValue;
    }
    return this;
  };

  /* @jsxobf-clobber */
  Entity._XPE = new XPathEvaluator();
  /* @jsxobf-clobber */
  Entity._RESULT_TYPES = [XPathResult.FIRST_ORDERED_NODE_TYPE,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE];

  /* @jsxobf-clobber */
  Entity_prototype._selectNodeOrNodes = function(strQuery, strNS, intMode) {
    if (typeof(strNS) == "object") strNS = jsx3.xml.Document.serializeNamespacesMap(strNS);

    var doc = this._entity.ownerDocument;
    var root = doc.documentElement;
    var nsResolver = strNS ? Entity._createNSResolver(strNS, root) :
        (Entity._getDocNSResolver(doc) || Entity._XPE.createNSResolver(root));

    var objResult = null;
    try {
      objResult = Entity._XPE.evaluate(strQuery, this._entity, nsResolver, Entity._RESULT_TYPES[intMode], null);
    } catch (e) {
      ; // QUESTION: what if this is a real error?
    }

    if (intMode == 1) {
      var itm = null;
      var objNodes = [];
      if (objResult)
        while (itm = objResult.iterateNext()) objNodes[objNodes.length] = itm;

      return new Entity.List(objNodes);
    } else if (intMode == 2) {
      return new Entity.SelectIterator(objResult);
    } else {
      return objResult && objResult.singleNodeValue ? new Entity(objResult.singleNodeValue) : null;
    }
  };

  /* @jsxobf-clobber */
  Entity._getDocNSResolver = function(doc) {
    if (! doc._jsxselectionnsobj) {
      if (doc._jsxselectionns)
        doc._jsxselectionnsobj = Entity._createNSResolver(doc._jsxselectionns);
    }
    return doc._jsxselectionnsobj;
  };

  /* @jsxobf-clobber */
  Entity._nsResCache = {}; // TODO: limit the size of this cache

  /* @jsxobf-clobber */
  Entity._createNSResolver = function(ns) {
    var resolver = Entity._nsResCache[ns];
    if (!resolver) {
      var nsDoc = (new DOMParser()).parseFromString('<foo ' + ns + '/>', "text/xml");
      resolver = Entity._nsResCache[ns] = Entity._XPE.createNSResolver(nsDoc.documentElement);
    }
    return resolver;
  };

/* @JSC */ }

  /** @private @jsxobf-clobber */
  Entity_prototype._getNativeDoc = function(intType) {
    if (intType == null) {
      return this._entity.ownerDocument;
    } else if (intType == 1) {
      var doc = this._entity.ownerDocument;
      return doc != null ? doc.documentElement : null;
    } else if (intType == 2) {
      return this._entity.documentElement;
    }
  };

  /**
   * Returns the native browser XML node wrapped by this entity.
   * @return {Object}
   */
  Entity_prototype.getNative = function() {
    //returns the entire MSXML instance
    return this._entity;
  };

  /**
   * Returns the first child element of type jsx3.xml.Entity.TYPEELEMENT; requires that this object also be of TYPEELEMENT; returns null if both conditions are not met
   * @return {jsx3.xml.Entity} jsx3.xml.Entity instance or null
   */
  Entity_prototype.getFirstChild = function() {
    if (this._nodeType == 1) {
      var objNode = this._entity.firstChild;

      // only return elements
      while (objNode != null && objNode.nodeType != 1)
        objNode = objNode.nextSibling;

      if (objNode != null) return (new Entity(objNode));
    }
    return null;
  };

  /**
   * Returns the last child element of type jsx3.xml.Entity.TYPEELEMENT; requires that this object also be of TYPEELEMENT; returns null if both conditions are not met
   * @return {jsx3.xml.Entity} jsx3.xml.Entity instance or null
   */
  Entity_prototype.getLastChild = function() {
    if (this._nodeType == 1) {
      var objNode = this._entity.lastChild;

      // only return elements
      while (objNode != null && objNode.nodeType != 1)
        objNode = objNode.previousSibling;

      if (objNode != null) return (new Entity(objNode));
    }
    return null;
  };

  /**
   * Returns the previous sibling if this node and the referenced sibling are of type jsx3.xml.Entity.TYPEELEMENT; returns null if condition is not met
   * @return {jsx3.xml.Entity} jsx3.xml.Entity instance or null
   */
  Entity_prototype.getPreviousSibling = function() {
    if (this._nodeType == 1) {
      var objNode = this._entity.previousSibling;

      // only return elements
      while (objNode != null && objNode.nodeType != 1)
        objNode = objNode.previousSibling;

      if (objNode != null) return (new Entity(objNode));
    }
    return null;
  };

  /**
   * Returns the next sibling if this node and the referenced sibling are of type jsx3.xml.Entity.TYPEELEMENT; returns null if condition is not met
   * @return {jsx3.xml.Entity} jsx3.xml.Entity instance or null
   */
  Entity_prototype.getNextSibling = function() {
    if (this._nodeType == 1) {
      var objNode = this._entity.nextSibling;

      // only return elements
      while (objNode != null && objNode.nodeType != 1)
        objNode = objNode.nextSibling;

      if (objNode != null) return (new Entity(objNode));
    }
    return null;
  };

  /**
   * performs an XSLT transformation, using @objEntityFilter as the XSLT filter for the transformation; returns
   *          results of the transformation as a string (of text/html/xml/etc)
   * @param objEntityFilter {jsx3.xml.Entity} jsx3.xml.Entity instance containing the XSLT document to transform 'this' jsx3.xml.Entity instance with
   * @param objParams {Object<String, String>} JavaScript object array of name/value pairs; if passed, the transformation will use a
   *          paramaterized stylesheet to perform the transformation
   * @param bObject {boolean} if <code>true</code> this method returns a document instead of a string.
   * @return {String|jsx3.xml.Document} the result of the transformation
   */
  Entity_prototype.transformNode = function(objEntityFilter, objParams, bObject) {
    jsx3.require("jsx3.xml.Template");
    var t = new jsx3.xml.Template(objEntityFilter);
    if (objParams) t.setParams(objParams);
    return t[bObject ? "transformToObject" : "transform"](this);
  };

  /** @private @jsxobf-clobber */
  Entity._Error = function() {};
  Entity._Error.prototype.toString = function() {
    return "[" + this.code + "]" + (typeof(this.description) != "undefined" ? " " + this.description : "");
  };

  /**
   * Used internally by the system to communicate errors that the developer can query for more-specific information when a given method returns null and the developer wants more specific information
   * @param strCode {String} unique id for the error
   * @param strDescription {String} description associated with @strCode
   * @private
   * @jsxobf-clobber-shared
   */
  Entity_prototype.setError = function(strCode, strDescription) {
    if (this._error == null) {
      /* @jsxobf-clobber */
      this._error = new Entity._Error();
    }
    this._error.code = strCode;
    this._error.description = strDescription;
  };

  /**
   * Returns an error object (a plain JavaScript object) with two properties that the developer can query for:
   * <ul>
   * <li>code &#8211; an integer error code, 0 for no error.</li>
   * <li>description &#8211; a text description of the error that occurred.</li>
   * </ul>
   * @return {Object}
   */
  Entity_prototype.getError = function() {
    if (!this._error) this.setError(0);
    return this._error;
  };

  /**
   * Returns <code>true</code> if the last operation on this XML entity caused an error.
   * @return {boolean}
   */
  Entity_prototype.hasError = function() {
    return this._error != null && this._error.code != 0;
  };

  /**
   * Returns the document that owns this entity.
   * @return {jsx3.xml.Document}
   */
  Entity_prototype.getOwnerDocument = function() {
    return this._entity ? new jsx3.xml.Document(this._getNativeDoc()) : null;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Entity.getVersion = function() {
    return "3.0.0";
  };

/* @JSC :: end */

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.xml.Entity
 * @see jsx3.xml.Entity
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Entity", -, null, function(){});
 */
jsx3.Entity = jsx3.xml.Entity;

/* @JSC :: end */

/**
 * @private
 */
jsx3.Class.defineClass("jsx3.xml.Entity.List", jsx3.util.List, null, function(List, List_prototype) {

  var Exception = jsx3.Exception;

  List_prototype.init = function(arrSrc) {
    this.jsxsuper(null, true);
    /* @jsxobf-clobber-shared */
    this._src = arrSrc; // some node lists are not instanceof Array
  };

  List_prototype.get = function(intIndex) {
    var o = this._src[intIndex];
    return o != null ? new jsx3.xml.Entity(o) : o;
  };

  var exMessage = "Not implemented";
  List_prototype.add = function() { throw new Exception(exMessage); };
  List_prototype.addAll = function() { throw new Exception(exMessage); };
  List_prototype.set = function() { throw new Exception(exMessage); };
  List_prototype.remove = function() { throw new Exception(exMessage); };
  List_prototype.removeAt = function() { throw new Exception(exMessage); };
  List_prototype.sort = function() { throw new Exception(exMessage); };

  List_prototype.slice = function(intStart, intEnd) {
    return new List(arguments.length > 1 ? this._src.slice(intStart, intEnd) : this._src.slice(intStart));
  };

  List_prototype.toString = function() {
    return "[" + this.toArray() + "]";
  };

  List_prototype.clone = function() {
    return new List(this._src.concat());
  };

  List_prototype.toArray = function() {
    var size = this.size();
    var a = new Array(size);
    for (var i = 0; i < size; i++)
      a[i] = this.get(i);
    return a;
  };

});

// @jsxobf-clobber  _nodes _index _text _prepNext _entity

/**
 * @private
 */
jsx3.Class.defineClass("jsx3.xml.Entity.ChildIterator", null, [jsx3.util.Iterator], function(Iterator, Iterator_prototype) {

  Iterator_prototype.init = function(arrChildren, bText) {
    this._nodes = arrChildren;
    this._index = 0;
    this._text = bText;
    this._prepNext();
    this._entity = null;
  };

  Iterator_prototype.next = function() {
    if (!this._next) return null;

    if (this._entity) {
      this._entity.init(this._next);
    } else {
      this._entity = new jsx3.xml.Entity(this._next);
    }
    this._prepNext();
    return this._entity;
  };

  Iterator_prototype.hasNext = function() {
    return this._next != null;
  };

  Iterator_prototype._prepNext = function() {
    this._next = null;
    var nodes = this._nodes;
    var max = nodes.length;
    while (this._next == null && this._index < max) {
      var node = nodes[this._index];
      if (node.nodeType == 1 || (this._text && (node.nodeType == 3 || node.nodeType == 4)))
        this._next = node;
      this._index++;
    }
  };

});

// @jsxobf-clobber  _i _n _entity

/**
 * @private
 */
jsx3.Class.defineClass("jsx3.xml.Entity.SelectIterator", null, [jsx3.util.Iterator], function(Iterator, Iterator_prototype) {

  Iterator_prototype.init = function(i) {
    this._i = i;
    this._n = 0;
    this._entity = null;
  };

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {

  Iterator_prototype.next = function() {
    var next = this._i[this._n++];
    if (!next) return null;

    if (this._entity) {
      this._entity.init(next);
    } else {
      this._entity = new jsx3.xml.Entity(next);
    }

    return this._entity;
  };

  Iterator_prototype.hasNext = function() {
    return this._i && this._n < this._i.length;
  };

/* @JSC */ } else {

  Iterator_prototype.next = function() {
    var next = this._i.snapshotItem(this._n++);
    if (!next) return null;
    
    if (this._entity) {
      this._entity.init(next);
    } else {
      this._entity = new jsx3.xml.Entity(next);
    }

    return this._entity;
  };

  Iterator_prototype.hasNext = function() {
    return this._i && this._n < this._i.snapshotLength;
  };

/* @JSC */ }

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Subsumed by <code>jsx3.util.List</code>.
 * @see jsx3.util.List
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Collection", -, null, function(){});
 */
jsx3.Collection = jsx3.xml.Entity.List;

/**
 * @deprecated  Subsumed by <code>jsx3.util.List</code>.
 * @see jsx3.util.List
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.util.Collection", -, null, function(){});
 */
jsx3.util.Collection = jsx3.Collection;

/* @JSC :: end */
