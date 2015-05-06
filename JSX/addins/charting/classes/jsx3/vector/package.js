/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _bridge

/**
 * This package and all contained classes are available only when the Charting add-in is enabled.
 */
jsx3.Package.definePackage("jsx3.vector", function(vector){

  /* @jsxobf-final */
  vector.DEFAULT_UNIT = "px";

  /* @jsxobf-clobber */
  vector._BRIDGE = "_bridge";

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  try {
    // Ref: http://ajaxian.com/archives/the-vml-changes-in-ie-8
    if (document.documentMode >= 8) {
      document.namespaces.add('v', 'urn:schemas-microsoft-com:vml', "#default#VML");
      vector._IE8 = 1;
    }
  } catch (e) {}
    
  vector.TAGNS = "v";
  /* @jsxobf-clobber */
  vector._EVT = "event";

/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {

  vector.TAGNS = "http://www.w3.org/2000/svg";
  /* @jsxobf-clobber */
  vector._EVT = "evt";

/* @JSC */ }

  /**
   * Converts an integer color to a CSS hex string color. If the color parameter is not a number, this function
   * returns the argument as a string.
   * @param color {int|String} The number to convert to hex.
   * @return {String} The CSS hex string.
   */
  vector.colorAsHtml = function( color ) {
    return typeof(color) == "number" ?
      "#" + (color + 0x1000000).toString(16).substring(1):
      "" + color;
  };
  
  /**
   * Converts a number value to a CSS unit.
   * @param value {int|String} The number value as a number or string, defaults to 0
   * @param unit {String} The unit to append to the number, defaults to vector.DEFAULT_UNIT
   * @param killUnit {boolean} If true, remove any unit that may have been included with the param value. Otherwise,
   *    the unit will only be appended if no unit was included.
   * @return {String} The CSS value.
   * @package
   */
  vector.toUnit = function(value, unit, killUnit) {
    if (value == null) value = 0;
    if (unit == null) unit = vector.DEFAULT_UNIT;
    
    if (typeof(value) == "number") {
      return value + "" + unit;
    } else {
      value = value.toString();
      value = value.replace(/^\s*(.*?)\s*$/, "$1");
      if (killUnit) 
        value = value.replace(/[^\d\.]/g, "");
      return value.match(/[^\d\.]/) ? value : (value + "" + unit);
    }
  };

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {

  /**
   * Creates a VML Vector2D datatype.
   * @param x {int} The x coordinate.
   * @param y {int} The y coordinate.
   * @return {String} The Vector2D as a string.
   * @package
   */
  vector.toVector2D = function( x, y ) {
    return vector.toUnit(x,"",true) + " " + vector.toUnit(y,"",true);
  };

/* @JSC */ }

  /**
   * Returns alpha constrained between 0 and 1.
   * @param alpha {number} an alpha value (usually a user input)
   * @return {float} [0.0, 1.0]
   * @package
   */
  vector.constrainAlpha = function( alpha ) {
    return Math.max(0, Math.min(1, alpha));
  };
  
  /**
   * Converts degrees (0 at North, clockwise) to radians (0 at East, counterclockwise).
   * @param degrees {Number} a degree value; 0 points North, increasing values go clockwise.
   * @return {Number} a radian value, between 0 and 2*pi; 0 points East, increasing values go counterclockwise.
   */
  vector.degreesToRadians = function(degrees) {
    return jsx3.util.numMod((2 * Math.PI / 360 * (-1 * degrees + 90)), (2 * Math.PI));
  };  

  /**
   * Renders a cross-platform vector event handler.
   * 
   * @param obj {jsx3.app.Model}
   * @param strEvtType {String} the event type, one of <code>jsx3.gui.Event.CLICK</code>, etc.
   * @param strMethod {String} the instance method to call on <code>obj</code> when the event is received.
   * @param objElm {jsx3.vector.Tag} the HTML element to which to add the event handler.
   */
  vector.paintEventHandler = function(obj, strEvtType, strMethod, objElm) {
    var eventHandler = "on" + strEvtType;
    var strEvent = "";

/* @JSC */ if (jsx3.CLASS_LOADER.SVG) {

    // Note: this code allows SVG to support the dblclick event. It causes the onclick HTML attribute to be
    // clobbered.
    if (strEvtType == jsx3.gui.Event.DOUBLECLICK || strEvtType == jsx3.gui.Event.CLICK) {
      objElm.setProperty("_" + strEvtType, strMethod);

      var onclick = objElm.getProperty("onclick");
      if (onclick) {

      }

      if (jsx3.CLASS_LOADER.IE && jsx3.CLASS_LOADER.getVersion() > 10) {
      // IE11 returns no value in evt.detail, cannot simulate double click
        objElm.setProperty("onclick", "if(this.getAttribute('_click')) { jsx3.GO('" + obj.getId() + "')."+vector._BRIDGE+"(evt,this,this.getAttribute('_click')); }");
      } else {
        objElm.setProperty("onclick", "if(evt.detail%2==0){if(this.getAttribute('_dblclick'))" +
                 "jsx3.GO('" + obj.getId() + "')."+vector._BRIDGE+"(evt,this,this.getAttribute('_dblclick'));}" +
                 "else{if(this.getAttribute('_click'))" +
                 "jsx3.GO('" + obj.getId() + "')."+vector._BRIDGE+"(evt,this,this.getAttribute('_click'));}");
      }


      return;
    }

/* @JSC */ }

    var attrEvent = objElm.getProperty(eventHandler);
    if (attrEvent) {
      strEvent = attrEvent.replace(/"/g, "&quot;");
      if (! attrEvent.match(/;\s*$/))
        strEvent += ";";
    }

    strEvent += "jsx3.GO('" + obj.getId() + "')." + vector._BRIDGE + "(" + vector._EVT + ",this,'" + strMethod + "');";

    if (strEvent.length > 0)
      objElm.setProperty(eventHandler, strEvent);
  };

  /**
   * Updates a rendered vector HTML element, <code>objExisting</code>, with an in-memory vector tag,
   * <code>objNew</code>. For example,
   * <pre>
   * var objElm = document.getElementById("vectorId");
   * var objVector = new jsx3.vector.Oval(0, 0, 100, 100);
   * objVector.setFill(new jsx3.vector.Fill(0xFFFF00));
   * jsx3.vector.updateVector(objVector, objElm);
   * </pre>
   *
   * @param objNew {jsx3.html.Tag}
   * @param objExisting {HTMLElement}
   */
  vector.updateVector = function(objNew, objExisting) {
/* @JSC */ if (jsx3.CLASS_LOADER.VML) {
    objExisting.outerHTML = objNew.paint();
/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {
    var newVector = objNew.paintDom();
    if (newVector != objExisting && objExisting.parentNode)
      objExisting.parentNode.replaceChild(newVector, objExisting);
/* @JSC */ }
  };

});
