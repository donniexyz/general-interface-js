/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * An XML wrapper that can be backed either by a real XML node or by a nested object structure.
 * <p/>
 * To wrap a nested object structure, pass an object to the constructor with the following format:
 * <ul>
 *   <li>Every element has a <code>name()</code> property equal to the base node name</li>
 *   <li>Every element has a <code>children()</code> property that is an array of nested objects</li>
 *   <li>Every attribute of an element corresponds to a property whose name is "@" prepended to the attribute name</li>
 *   <li>Every nested child element is stored in the children() property and is also referended by another
 *       property whose name is "/" prepended to the base node name of the child element.</li>
 * </ul>
 */
jsx3.lang.Class.defineClass("jsx3.amp.XML", null, null, function(XML, XML_prototype) {

/*
  XML._marshall = function(objElm) {
    var o = {"name()": objElm.getBaseName(), "children()":[]};

    var attr = objElm.getAttributeNames();
    for (var i = 0; i < attr.length; i++)
      o["@" + attr[i]] = objElm.getAttribute(attr[i]);

    for (var i = objElm.getChildIterator(); i.hasNext(); ) {
      var child = this._marshall(i.next());
      o["children()"].push(child);
      o["/" + child["name()"]] = child;
    }

    if (o["children()"].length == 0)
      o["value()"] = objElm.getValue();

    return o;
  };
*/

  /**
   * @param elm {jsx3.xml.Entity | Object}
   */
  XML_prototype.init = function(elm) {
    if (elm instanceof jsx3.xml.Entity) {
      this._native = true;
    }
    this._xml = elm;
  };

  /**
   * Returns an attribute of this element.
   * @param a {String} the name of the attribute.
   * @return {String} the value of the attribute.
   */
  XML_prototype.attr = function(a) {
    return this._native ? this._xml.getAttribute(a) : this._xml["@" + a];
  };

  /**
   * Returns the base name of this element.
   * @return {String} the base name.
   */
  XML_prototype.nname = function() {
    return this._native ? this._xml.getBaseName() : this._xml["name()"];
  };

  /**
   * Returns a child element of this element whose base name is equal to <code>name</code>.
   * @param name {String}
   * @return {jsx3.amp.XML}
   */
  XML_prototype.child = function(name) {
    if (this._native) {
      for (var i = this._xml.getChildIterator(); i.hasNext(); ) {
        var c = i.next();
        if (c.getBaseName() == name)
          return new XML(c);
      }
      return null;
    } else {
      var e = this._xml["/" + name];
      return e ? new XML(e) : null;
    }
  };

  /**
   * Returns this child elements of this element.
   * @return {jsx3.$Array<jsx3.amp.XML>}
   */
  XML_prototype.children = function() {
    if (this._native)
      return jsx3.$A(this._xml.getChildNodes().toArray()).map(function(e) { return new XML(e); });
    else
      return jsx3.$A(this._xml["children()"]).map(function(e) { return new XML(e); });
  };

  /**
   * Returns the node value of this element.
   * @return {String}
   */
  XML_prototype.value = function() {
    if (this._native)
      return this._xml.getValue();
    else
      return this._xml["value()"];
  };

  XML_prototype.toNative = function() {
    if (this._native)
      return this._xml;
  };

  XML_prototype.toString = function() {
    if (this._native)
      return this._xml.toString();
    else
      return "";
  };

});
