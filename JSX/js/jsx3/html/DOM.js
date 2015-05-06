
/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */


/**
 * Handles Provides methods to manipulate browser DOM nodes.
 * @since 3.6
 */
jsx3.Class.defineClass("jsx3.html.DOM", null, null, function(DOM, DOM_prototype) {

  //alias frequently-used classes
  var LOG = jsx3.util.Logger.getLogger(DOM.jsxclass.getName());
  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;

  //used to convert regular css property syntax to its scriptable (camelcase) equivalent
  DOM.REGEXP_CAMEL = /(-\S)/gi;

  
  /**
   * instance initializer
   */
  DOM_prototype.init = function() {
    this.jsxsuper();
  };


  /**
   * Applies a single CSS style to a DOM node
   * @param objNode {HTMLElement} native browser DOM node
   * @param strCSSName {String} Either the CSS property name (i.e., background-color) or its scriptable property name (i.e., backgroundColor)
   * @param strValue {String} For example, red
   */
  DOM.setStyle = function(objNode, strCSSName, strValue) {
    objNode.style[strCSSName.replace(DOM.REGEXP_CAMEL, function($0, $1) { return $1.substring(1).toUpperCase(); })] = strValue;
  };


  /**
   * Applies a string of multiple CSS style properties to a DOM element
   * @param objNode {HTMLElement} native browser DOM node
   * @param strCSS {String} string of CSS. For example,  left:10px;height:20px;width:100px;
   */
  DOM.setStyles = function(objNode, strCSS) {
    var objStyles = jsx3.util.strTrim(strCSS).split(/\s*;\s*/g);
    for (var i = 0; i < objStyles.length; i++) {
      var curStyle = objStyles[i];
      if (curStyle == "") continue;
      var objStyle = curStyle.split(/\s*:\s*/);
      if (objStyle && objStyle.length == 2)
        DOM.setStyle(objNode,objStyle[0],objStyle[1]);
    }
  };


  /**
   * Gets the true offset width for the element including: margin, padding, border, and content
   * @param objNode {HTMLElement} native browser DOM node of type 'Element' that supports layout
   * @return {int}
   */
  DOM.getExtendedOffsetWidth = function(objNode) {
    return parseInt(objNode.offsetWidth) + (objNode.nodeType == 1 ? parseInt(objNode.style.marginLeft) + parseInt(objNode.style.marginRight) : 0);
  };


  /**
   * Gets the true offset height for the element including: margin, padding, border, and content
   * @param objNode {HTMLElement} native browser DOM node of type 'Element' that supports layout
   * @return {int}
   */
  DOM.getExtendedOffsetHeight = function(objNode) {
    return parseInt(objNode.offsetHeight) + parseInt(objNode.style.marginTop) + parseInt(objNode.style.marginBottom);
  };


  /**
   * Clears a string of multiple CSS style properties to a DOM element; Provides a way for a string of CSS to be removed from the node
   * @param objNode {HTMLElement} native browser DOM node
   * @param strCSS {String} string of CSS. One of two variants are supported:  <code>left:10px;height:20px;width:100px;</code> or  <code>left:;height:;width:;</code>
   */
  DOM.clearStyles = function(objNode, strCSS) {
    var objStyles = jsx3.util.strTrim(strCSS).split(/\s*;\s*/g);
    for (var i = 0; i < objStyles.length; i++) {
      var curStyle = objStyles[i];
      if (curStyle == "") continue;
      var objStyle = curStyle.split(/\s*:\s*/);
      if (objStyle && (objStyle.length == 1 || objStyle.length == 2))
        DOM.setStyle(objNode,objStyle[0],"");
    }
  };

  /**
   * Locates a node in relation to an ancestor, using each generation's child index as the path.
   * @param objNode {HTMLElement} native browser DOM node (the ancestor)
   * @param args {String} The node path to access this node in relation to the parent box of the box group that this box belongs to. For example, 0/1/4/
   * @package
   */
  DOM.selectSingleElm = function(objNode, args) {
    var index = 1, arrArgs = arguments;
    if (arguments.length == 2) {
      if (typeof(args) == "string") {
        index = 0;
        arrArgs = args.split(/\//g);
      } else if (jsx3.$A.is(args)) {
        index = 0;
        arrArgs = args;
      }
    }

    var node = objNode;
    for (var i = index; node != null && i < arrArgs.length; i++) {
      var token = arrArgs[i];
      if (!(isNaN(token))) {
        var n = Number(token);
        var ct = node.childNodes.length;
        var realIndex = 0, elmFound = 0;
        for (; realIndex < ct && elmFound < n; realIndex++) {
          if (node.childNodes[realIndex].nodeType == 1)
            elmFound++;
        }
        node = node.childNodes[realIndex];
      } else {
        throw new jsx3.Exception();
      }
    }

    return node;
  };

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {

  /**
   * Binds the event to the given DOM object.
   * @param objNode {HTMLElement} native browser DOM node
   * @param strName {String} Event name. For example, onclick, onfocus
   * @param objFn {Object} function, function literal
   * @package
   */
  DOM.addEventListener = function(objNode, strName, objFn) {
    objNode[strName] = typeof(objFn) == "function" ? objFn : new Function(objFn);
    // NOTE: attachEvent doesn't work because "this" does not resolve in functions that it executes ... lame
    // objDOM.attachEvent(strName, typeof(objFn) == "function" ? objFn : new Function(objFn));
  };

  /**
   * Removes the function, objFn, as the event handler for the given DOM node.
   * @param objNode {HTMLElement} native browser DOM node
   * @param strName {String} Event name. For example, onclick, onfocus
   * @param objFn {Object} function, function literal
   */
  DOM.removeEventListener = function(objNode, strName, objFn) {
    objNode[strName] = null;
    // NOTE: attachEvent doesn't work because "this" does not resolve in functions that it executes ... lame
    // objDOM.detachEvent(strName, objFn);
  };

  DOM.addBridgedEvent = function(objNode, strName, objFn) {
    DOM.addEventListener(objNode,strName,objFn);
  };

  DOM.removeBridgedEvent = function(objNode,strName,objFn) {
    DOM.removeEventListener(objNode,strName,objFn);
  };


/* @JSC */ } else {


  DOM.addEventListener = function(objNode, strName, objFn) {
    strName = strName.replace(/^on/,"");
    objNode.addEventListener(strName, typeof(objFn) == "function" ? objFn : new Function("event", objFn), false);
  };

  DOM.removeEventListener = function(objNode,strName,objFn) {
    strName = strName.replace(/^on/,"");
    objNode.removeEventListener(strName, objFn, false);
  };

  DOM.addBridgedEvent = function(objNode, strName, objFn) {
    //this is different from addEventListener in that only a single event is ever attached; this pattern is more appropriate to the event bridge
    objNode[strName] = typeof(objFn) == "function" ? objFn : new Function("event", objFn);
  };

  DOM.removeBridgedEvent = function(objNode,strName) {
    //this is different from removeEventListener in that only removes events that are part of the original HTML markup for the control
    //this is more appropriate to how GI renders the HTML (as a single string, not as DOM objects), because only a single event exists
    objNode[strName] = null;
  };


/* @JSC */ }

});
