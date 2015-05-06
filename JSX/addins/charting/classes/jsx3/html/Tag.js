/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _parent _native _children
/**
 * Represents an HTML element. Provides an object oriented way of painting to screen.
 * <p/>
 * This class is available only when the Charting add-in is enabled.
 */
jsx3.Class.defineClass("jsx3.html.Tag", null, null, function(Tag, Tag_prototype) {

  var Exception = jsx3.Exception;
  
  /** @private @jsxobf-clobber */
  Tag._NO_CHILDREN = [];

  /** @private @jsxobf-clobber */
  Tag_prototype._tagname = null;
  /** @private @jsxobf-clobber */
  Tag_prototype._tagns = null;

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  /**
   * The instance initializer.
   * @param strTagNS {String}
   * @param strTagName {String}
   */
  Tag_prototype.init = function(strTagNS, strTagName) {
    this._tagname = strTagName;
    this._tagns = strTagNS;

    this._native = document.createElement(strTagNS ? strTagNS + ":" + strTagName : strTagName);
    this._parent = null;
    this._children = null;
  };

  /**
   * Sdds a child to the list of this tag's children; may be vetoed by <code>onAppendChild().</code>
   * @param child {jsx3.html.Tag} the child to add, must not already have a parent
   */
  Tag_prototype.appendChild = function( child ) {
    if (this.onAppendChild(child)) {
      if (child instanceof Tag && child.getParent() != null) {
        throw new Exception("can't append " + child + " to " + this +
            ", already has parent " + child._parent);
      }

      if (this._children == null)
        this._children = [];

      this._children.push(child);
      child._parent = this;
    } else {
      throw new Exception("Illegal to append child " + child + " to parent " + this + ".");
    }
  };

  /**
   * Removes a child from the list of this tag's children; may be vetoed by <code>onRemoveChild()</code>.
   * @param child {jsx3.html.Tag} the child to remove, must exist in the list of children
   */
  Tag_prototype.removeChild = function( child ) {
    if (this._children) {
      var indexOf = jsx3.util.arrIndexOf(this._children, child);
      if (indexOf >= 0) {
        this._children[indexOf]._parent = null;
        this._children.splice(indexOf, 1);
      }
    }
  };

  /**
   * Replaces a child of this tag.
   * @param child {jsx3.html.Tag} the new child.
   * @param oldChild {jsx3.html.Tag} the child to replace.
   */
  Tag_prototype.replaceChild = function( child, oldChild ) {
    if (this._children) {
      var indexOf = jsx3.util.arrIndexOf(this._children, oldChild);
      if (indexOf >= 0) {
        this._children[indexOf]._parent = null;
        this._children[indexOf] = child;
        child._parent = this;
      }
    }
  };


  /**
   * Removes all the children of this tag.
   */
  Tag_prototype.removeChildren = function() {
    if (this._children)
      this._children.splice(0, this._children.length);
  };

  /**
   * Returns the cssClass field.
   * @return {String} cssClass
   */
  Tag_prototype.getClassName = function() {
    return this._native.className;
  };

  /**
   * Sets the cssClass field, the HTML 'class' attribute.
   * @param cssClass {String} the new value for cssClass
   */
  Tag_prototype.setClassName = function( cssClass ) {
    this._native.className = cssClass;
  };

/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {

  Tag_prototype.init = function(strTagNS, strTagName) {
    this._tagname = strTagName;
    this._tagns = strTagNS;

    if (strTagName)
      this._native = strTagNS ? document.createElementNS(strTagNS, strTagName) : document.createElement(strTagName);
    this._parent = null;
    this._children = null;
  };

  Tag_prototype.appendChild = function( child ) {
    if (this.onAppendChild(child)) {
      if (child instanceof Tag && child.getParent() != null) {
        throw new Exception("can't append " + child + " to " + this +
            ", already has parent " + child._parent);
      }

      if (this._children == null)
        this._children = [];

      this._children.push(child);
      child._parent = this;

      this._native.appendChild(child._native);
    } else {
      throw new Exception("Illegal to append child " + child + " to parent " + this + ".");
    }
  };

  Tag_prototype.removeChild = function( child ) {
    if (this._children) {
      var indexOf = jsx3.util.arrIndexOf(this._children, child);
      if (indexOf >= 0) {
        this._children[indexOf]._parent = null;
        this._children.splice(indexOf, 1);
      }
    }

    this._native.removeChild(child._native);
  };

  Tag_prototype.replaceChild = function( child, oldChild ) {
    if (this._children) {
      var indexOf = jsx3.util.arrIndexOf(this._children, oldChild);
      if (indexOf >= 0) {
        this._children[indexOf]._parent = null;
        this._children[indexOf] = child;
        child._parent = this;
      }
    }

    this._native.replaceChild(child._native, oldChild._native);
  };

  Tag_prototype.removeChildren = function() {
    if (this._children)
      this._children.splice(0, this._children.length);

    var nodes = this._native.childNodes;
    for (var i = nodes.length - 1; i >= 0; i--)
      this._native.removeChild(nodes[i]);
  };

  /**
   * Returns the cssClass field.
   * @return {String} cssClass
   */
  Tag_prototype.getClassName = function() {
    return this.getProperty("class");
  };

  /**
   * Sets the cssClass field, the HTML 'class' attribute.
   * @param cssClass {String} the new value for cssClass
   */
  Tag_prototype.setClassName = function( cssClass ) {
    this.setProperty("class", cssClass);
  };

/* @JSC */ }

  /**
   * Returns the parent tag.
   * @return {jsx3.html.Tag} parent
   */
  Tag_prototype.getParent = function() {
    return this._parent;
  };

  /**
   * Returns the children tags.
   * @return {Array<jsx3.html.Tag>} children
   */
  Tag_prototype.getChildren = function() {
    return this._children == null ? Tag._NO_CHILDREN : this._children;
  };

  /**
   * Returns the id field.
   * @return {String} id
   */
  Tag_prototype.getId = function() {
    return this._native.id;
  };

  /**
   * Sets the id field.
   * @param id {String} the new value for id
   */
  Tag_prototype.setId = function( id ) {
    this.setProperty("id", id);
  };

  /**
   * Sets the extraStyles field, this string is prepended as-is to the generated value for the style attribute of the tag.
   * @param extraStyles {String} the new value for extraStyles
   */
  Tag_prototype.setExtraStyles = function( extraStyles ) {
    try {
      this._native.style.cssText += ";" + extraStyles;
    } catch (e) {
      throw new Exception("Error appending '" + extraStyles + "' to 'cssText': " + jsx3.NativeError.wrap(e));
    }
  };

  /**
   * Releases all bi-directional references between this instance and its children.
   */
  Tag_prototype.release = function() {
    delete this._parent;
    if (this._children) {
      for (var i = this._children.length - 1; i >= 0; i--)
        if (this._children[i].release)
          this._children[i].release();
//      delete this._native;
      delete this._children;
    }
  };

  /**
   * Called before appending a child.
   * @return {boolean} <code>true</code> to allow the append, <code>false</code> to veto.
   * @param child {jsx3.html.Tag}
   * @protected
   */
  Tag_prototype.onAppendChild = function( child ) {
    return true;
  };

  /**
   * Called before removing a child.
   * @return {boolean} <code>true</code> to allow the removal, <code>false</code> to veto.
   * @param child {jsx3.html.Tag}
   * @protected
   */
  Tag_prototype.onRemoveChild = function( child ) {
    return true;
  };

  /**
   * Sets an attribute of this HTML element. This method may be called with a variable number of arguments, which are
   * interpreted as name/value pairs, i.e.: <code>tag.setProperty(n1, p1, n2, p2);</code>.
   * @param strName {String} the name of the attribute.
   * @param strValue {String} the value of the attribute. If <code>null</code>, the attribute is removed.
   */
  Tag_prototype.setProperty = function( strName, strValue ) {
    var a = arguments;
    for (var i = 0; i < a.length; i+=2) {
      strName = a[i]; strValue = a[i+1];
      if (strValue != null)
        this._native.setAttribute(strName, strValue);
      else
        this._native.removeAttribute(strName);
    }
  };

/* @JSC */ if (jsx3.CLASS_LOADER.SVG) {

  Tag_prototype.setPropertyNS = function( strNS, strName, strValue ) {
    if (strValue != null)
      this._native.setAttributeNS(strNS, strName, strValue);
    else
      this._native.removeAttributeNS(strNS, strName);
  };

/* @JSC */ }

  /**
   * Returns an attribute of this HTML element.
   * @param strName {String} the name of the attribute.
   * @return {String} the value of the attribute.
   */
  Tag_prototype.getProperty = function( strName ) {
    return this._native.getAttribute(strName);
  };

  /**
   * Removes any number of properties from this HTML element.
   * @param strName {String...} the names of the attributes.
   */
  Tag_prototype.removeProperty = function( strName ) {
    var a = arguments;
    for (var i = 0; i < a.length; i++)
      this._native.removeAttribute(a[i]);
  };

  /**
   * Sets a style of this HTML element. This method may be called with a variable number of arguments, which are
   * interpreted as name/value pairs, i.e.: <code>tag.setStyle(n1, s1, n2, s2);</code>.
   *
   * @param strName {String} the name of the style.
   * @param strValue {String} the value of the style.
   */
  Tag_prototype.setStyle = function( strName, strValue ) {
    var a = arguments;
    for (var i = 0; i < a.length; i+=2) {
      strName = a[i]; strValue = a[i+1];
      try {
        this._native.style[strName] = strValue == null ? "" : strValue;
      } catch (e) {
        throw new Exception("Error setting style '" + strName + "' to '" + strValue + "': " + jsx3.NativeError.wrap(e));
      }
    }
  };

  /**
   * Returns a style of this HTML element.
   * @param strName {String} the name of the style.
   * @return {String} the value of the style.
   */
  Tag_prototype.getStyle = function( strName ) {
    return this._native.style[strName];
  };

  /**
   * Removes any number of styles from this HTML element.
   * @param strName {String...} the names of the styles.
   */
  Tag_prototype.removeStyle = function( strName ) {
    var a = arguments;
    for (var i = 0; i < a.length; i++)
      this._native.style[a[i]] = "";
  };

  /**
   * Returns the name of this HTML element, such as "table" or "div".
   * @return {String} the tag name
   */
  Tag_prototype.getTagName = function() {
    return this._tagname;
  };

  /**
   * Returns the namespace of this HTML element.
   * @return {String} the tag name
   */
  Tag_prototype.getTagNS = function() {
    return this._tagns;
  };

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  /**
   * Serializes this HTML element to an HTML string using various overridable methods in this class.
   * <b>This method is only available in the VML version of this class.</b>
   *
   * @return {String} this tag serialized to HTML.
   */
  Tag_prototype.paint = function() {
    this.paintUpdate();
    var buffer = [];
    var index = this.paintToBuffer(buffer, 0);
    return buffer.slice(0, index).join("");
  };

  /**
   * @package
   */
  Tag_prototype.paintToBuffer = function(buffer, index) {
    var children = this._children;
    var outer = jsx3.html.getOuterHTML(this._native);
    var nodeName = "";
    
    if (jsx3.vector._IE8) {
      outer = outer.replace(/^<\?import .*?\/>/, "");
      nodeName = jsx3.vector.TAGNS + ":" + this._native.nodeName;
    } else {
      outer = outer.replace(/^<(\w+(\:\w+)?)\b/, function(m, $1) { nodeName = $1; return "<" + nodeName.toLowerCase(); });
      // BUG: this may mess up some attributes with "=" characters in them
      outer = outer.replace(/\b([_a-zA-Z]\w*)=([^\s"]+) /g, '$1="$2" '); // put quotes around all attributes!
    }

    var closeIndex = outer.lastIndexOf("</");
    if (closeIndex >= 0 && outer.substring(closeIndex).indexOf(nodeName) != 2)
      closeIndex = -1;

    if (children != null && children.length > 0) {
      var open = null, close = null;
      if (closeIndex >= 0) {
        open = outer.substring(0, closeIndex);
        close = outer.substring(closeIndex);
      } else {
        open = outer;
        close = "</" + nodeName.toLowerCase() + ">";
      }

      buffer[index++] = open;

      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (typeof(child) == "string")
          buffer[index++] = child;
        else
          index = child.paintToBuffer(buffer, index);
      }

      buffer[index++] = close;
    } else {
      if (closeIndex >= 0)
        buffer[index++] = outer.substring(0, closeIndex-1);
      else
        buffer[index++] = outer.substring(0, outer.length - 1);
      buffer[index++] = "/>";
    }

    return index;
  };

/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {

  /**
   * Prepares this HTML element for insertion into the live browser DOM and returns the underlying native HTML element.
   * <b>This method is only available in the SVG version of this class.</b>
   *
   * @return {HTMLElement} the native browser html element.
   */
  Tag_prototype.paintDom = function() {
    this.paintUpdate();
    return this._native;
  };

/* @JSC */ }

  /**
   * This method is called on each HTML tag before it is painted to screen. Methods in subclasses of this class that
   * override this method should begin with a call to <code>jsxsuper()</code>.
   * @protected
   */
  Tag_prototype.paintUpdate = function() {
    var children = this._children;
    if (children) {
      for (var i = 0; i < children.length; i++)
        children[i].paintUpdate();
    }
  };

  /**
   * @return {String}
   */
  Tag_prototype.toString = function() {
    return "<" + this.getTagName() + "#" + this.getId() + "/>";
  };

  /**
   * Returns the first child tag of type <code>type</code>.
   * @param type {String|Function} the fully-qualified class name or the class constructor function.
   * @return {jsx3.html.Tag}
   */
  Tag_prototype.getFirstChildOfType = function( type ) {
    if (typeof(type) == "string")
      type = jsx3.Class.forName(type).getConstructor();

    if (this._children) {
      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        if (children[i] instanceof type)
          return children[i];
      }
    }

    return null;
  };

});
