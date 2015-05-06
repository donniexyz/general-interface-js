/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/* @JSC :: begin DEP */

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
/**
 * This class is the static event controller for the GI framework. It abstracts the browser-specific implementations
 * of the event object while providing extensions of its own (i.e., drag/drop, event binding, etc).
 *
 * @deprecated  Use class <code>jsx3.gui.Event</code> instead.
 * @see jsx3.gui.Event
 */
jsx3.Class.defineClass("jsx3.EVT", null, [jsx3.util.EventDispatcher], function(EVT, EVT_prototype) {

  /**
   * Use this instance initializer for wrapped access to the current event object <code>event</code> at a later point in time.
   */
  EVT_prototype.init = function(e) {
    // clone the event object because keeping a JS reference to it is not enough to make it available after subsequent events
    if (e)
      this.e = jsx3.clone(e);
  };

  /**
   * the JSXEVENT class maintains an object array indexed via the EVENTTYPE constant for the given event.  When the event bubbles up the IE DOM, or when this function is called directly, the JScript code bound to the given event is exectued via the JScript 'eval()' function
   * @param strType {String} the event type to handle
   * @param bReturn {boolean}
   * @return {object} the result of the event eval, but only if parameter <code>bReturn</code> is true, otherwise no return statement
   * @deprecated  use jsx3.gui.Event.publish() instead
   */
  EVT_prototype.handleEvent = function(strType, bReturn) {
    var objEvent = jsx3.gui.Event.getCurrent();

    if (objEvent == null) {
      jsx3.util.Logger.getLogger(EVT.jsxclass.getName()).warn("handleEvent called when current event null: " + strType);
      return;
    }

    if (objEvent.getType() != strType.substring(2))
      jsx3.util.Logger.getLogger(EVT.jsxclass.getName()).warn("handleEvent called for type that does not match the current event's type: " + objEvent.getType() + " " + strType);

    jsx3.gui.Event.publish(objEvent);
  };

  /**
   * typically called by a JSX GUI foundation class (such as the JSXMenu class).
   *          Allows the given class to be notified when a given event occurs.  For example in the case
   *          of the JSXMenu class, it must be notified to hide any visible menu when the user mouses down
   *          in the document.
   * @param EVENTTYPE {String} the type of event to handle such as mousedown, mouseup, etc
   * @param strCode {String} JScript code (passed as string) that will be evaluated via the JScript eval() function when the given event fires.  Note: it is important that the code contain a trailing semicolon ';', in case a subsequent function binds its own callback code
   * @deprecated use jsx3.gui.Event.subscribe instead
   * @see jsx3.gui.Event#subscribe()
   */
  EVT_prototype.registerEvent = function(EVENTTYPE, strCode) {
    if (EVENTTYPE.indexOf("on") == 0)
      EVENTTYPE = EVENTTYPE.substring(2);

    jsx3.gui.Event.subscribe(EVENTTYPE, function(){ jsx3.eval(strCode); } );
  };

  /**
   * Returns handle to the native browser event object (window.event)
   * @return {Object} event
   */
  EVT_prototype.event = function(){return this.e || window.event;};
  /** @private @jsxobf-clobber */
  EVT_prototype._event = function(){return this.e || window.event;};

  /**
   * Returns handle to the HTML element acted upon (click, mousedown, etc)
   * @return {HTMLElement} HTML object
   */
  EVT_prototype.srcElement = function(){var e = this._event(); return e && e.srcElement;};
  /**
   * Returns handle to the HTML element that was moused over (onmouseover)
   * @return {HTMLElement} HTML object
   */
  EVT_prototype.toElement = function(){var e = this._event(); return e && e.toElement;};
  /**
   * Returns handle to the HTML element that was moused away from (onmouseout)
   * @return {HTMLElement} HTML object
   */
  EVT_prototype.fromElement = function(){var e = this._event(); return e && e.fromElement;};
  /**
   * Returns integer representing the key code of the key just pressed/keyed-down
   * @return {int} keycode
   */
  EVT_prototype.keyCode = function(){var e = this._event(); return e && e.keyCode;};
  /**
   * Returns the clientX property for the event (where it occurred on-screen)
   * @return {int} pixel position
   */
  EVT_prototype.clientX = function(){var e = this._event(); return e ? e.clientX : Number.NaN;};
  /**
   * Returns the clientY property for the event (where it occurred on-screen)
   * @return {int} pixel position
   */
  EVT_prototype.clientY = function(){var e = this._event(); return e ? e.clientY : Number.NaN;};
  /**
   * Returns the actual position in the browser from the left edge for where the event occurred;
   * @return {int} pixel position
   */
  EVT_prototype.getTrueX = function() {return this._event().screenX - window.screenLeft;};
  /**
   * Returns the actual position in the browser from the top edge for where the event occurred;
   * @return {int} pixel position
   */
  EVT_prototype.getTrueY = function() {return this._event().screenY - window.screenTop;};
  /**
   * Returns true if the shift key was pressed
   * @return {boolean}
   */
  EVT_prototype.shiftKey = function(){var e = this._event(); return e && e.shiftKey;};
  /**
   * Returns true if the ctrl key was pressed
   * @return {boolean}
   */
  EVT_prototype.ctrlKey = function(){var e = this._event(); return e && e.ctrlKey;};
  /**
   * Returns true if the alt key was pressed
   * @return {boolean}
   */
  EVT_prototype.altKey = function(){var e = this._event(); return e && e.altKey;};
  /**
   * Returns true if the enter key was pressed
   * @return {boolean}
   */
  EVT_prototype.enterKey = function(){return this._event().keyCode == 13;};
  /**
   * Returns true if the space bar was pressed
   * @return {boolean}
   */
  EVT_prototype.spaceKey = function(){return this._event().keyCode == 32;};
  /**
   * Returns true if the tab key was pressed
   * @return {boolean}
   */
  EVT_prototype.tabKey = function(){return this._event().keyCode == 9;};
  /**
   * Returns true if the right-arrow key was pressed
   * @return {boolean}
   */
  EVT_prototype.rightArrow = function(){return this._event().keyCode == 39;};
  /**
   * Returns true if the left-arrow key was pressed
   * @return {boolean}
   */
  EVT_prototype.leftArrow = function(){return this._event().keyCode == 37;};
  /**
   * Returns true if the up-arrow key was pressed
   * @return {boolean}
   */
  EVT_prototype.upArrow = function(){return this._event().keyCode == 38;};
  /**
   * Returns true if the down-arrow key was pressed
   * @return {boolean}
   */
  EVT_prototype.downArrow = function(){return this._event().keyCode == 40;};
  /**
   * Returns true if the delete key was pressed
   * @return {boolean}
   */
  EVT_prototype.deleteKey = function(){return this._event().keyCode == 46;};
  /**
   * Returns true if the backspace key was pressed
   * @return {boolean}
   */
  EVT_prototype.backspaceKey = function(){return this._event().keyCode == 8;};
  /**
   * Returns true if the insert key was pressed
   * @return {boolean}
   */
  EVT_prototype.insertKey = function(){return this._event().keyCode == 45;};
  /**
   * Returns true if the home key was pressed
   * @return {boolean}
   */
  EVT_prototype.homeKey = function(){return this._event().keyCode == 36;};
  /**
   * Returns true if the end key was pressed
   * @return {boolean}
   */
  EVT_prototype.endKey = function(){return this._event().keyCode == 35;};
  /**
   * Returns true if the page-up key was pressed
   * @return {boolean}
   */
  EVT_prototype.pageUpKey = function(){return this._event().keyCode == 33;};
  /**
   * Returns true if the page-down key was pressed
   * @return {boolean}
   */
  EVT_prototype.pageDownKey = function(){return this._event().keyCode == 34;};
  /**
   * Returns true if the escape key was pressed
   * @return {boolean}
   */
  EVT_prototype.escapeKey = function(){return this._event().keyCode == 27;};
  /**
   * Returns true if the native event object is present (if an event of any type actualy occurred)
   * @return {boolean}
   */
  EVT_prototype.exists = function(){return this._event() != null;};
  /**
   * cancels event bubbling for the event
   */
  EVT_prototype.cancelBubble = function(){this._event().cancelBubble = true;};
  /**
   * cancels the returnValue for the event
   */
  EVT_prototype.cancelReturn = function(){this._event().returnValue = false;};
  /**
   * cancels the key from firing by setting the keyCode to 0 (zero) for the event
   */
  EVT_prototype.cancelKey = function(){this._event().keyCode = 0;};
  /**
   * Returns true if the left-mouse-button was clicked
   * @return {boolean}
   */
  EVT_prototype.leftButton = function(){var e = this._event(); return e && e.button == 0;};
  /**
   * Returns true if the right-mouse-button was clicked
   * @return {boolean}
   */
  EVT_prototype.rightButton = function(){var e = this._event(); return e && e.button == 2;};
  /**
   * Returns integer designating the mouse button clicked/moused-down/moused-up; 1 (left), 2 (right), and as supported
   * @return {int}
   */
  EVT_prototype.button = function(){var e = this._event(); return (e) ? e.button : null;};
  /**
   * sets string message to set on the returnValue for the event
   * @param RETURN {String} string message to set on the returnValue for the event
   */
  EVT_prototype.setReturn = function(RETURN){this._event().returnValue = RETURN;};
  /**
   * sets/updates the keycode for the event
   * @param intKeyCode {int} keycode
   */
  EVT_prototype.setKeyCode = function(intKeyCode){this._event().keyCode = intKeyCode;};

  EVT_prototype.isModifierKey = function(){
    var e = this._event();
    return e.keyCode == 16 || e.keyCode == 17 || e.keyCode == 18;
  };

  EVT_prototype.toString = function() {
    var s = "";
    var e = this._event();
    if (e == null) return "jsx3.EVT <empty>";

    var fields = [];
    for (var f in e)
      fields.push(f);
    fields.sort();

    for (var i=0; i < fields.length; i++)
      s += fields[i] + ":" + e[fields[i]] + " ";

    return s;
  };

});


jsx3.EVENT = new jsx3.EVT();

//primitives; all on <properties> tag
jsx3.EVENT.MOUSEOVER = "onmouseover";
jsx3.EVENT.MOUSEOUT = "onmouseout";
jsx3.EVENT.MOUSEDOWN = "onmousedown";
jsx3.EVENT.MOUSEUP = "onmouseup";
jsx3.EVENT.MOUSEMOVE = "onmousemove";
jsx3.EVENT.CLICK = "onclick";
jsx3.EVENT.DOUBLECLICK = "ondblclick";
jsx3.EVENT.KEYPRESS = "onkeypress";
jsx3.EVENT.KEYUP = "onkeyup";
jsx3.EVENT.KEYDOWN = "onkeydown";
jsx3.EVENT.FOCUS = "onfocus";
jsx3.EVENT.ACTIVATE = "onactivate";
jsx3.EVENT.BLUR = "onblur";
jsx3.EVENT.SCROLL = "onscroll";
jsx3.EVENT.UNLOAD = "onunload";
jsx3.EVENT.BEFOREUNLOAD = "onbeforeunload";

//view events handled in model context as well as system events; all on <events> tag
jsx3.EVENT.JSXKEYUP = "jsxkeyup";
jsx3.EVENT.JSXKEYDOWN = "jsxkeydown";
jsx3.EVENT.JSXKEYUP = "jsxkeyup";
jsx3.EVENT.JSXKEYPRESS = "jsxkeypress";
jsx3.EVENT.JSXBLUR = "jsxblur";
jsx3.EVENT.JSXCLICK = "jsxclick";
jsx3.EVENT.JSXDOUBLECLICK = "jsxdblclick";
jsx3.EVENT.JSXMOUSEDOWN = "jsxmousedown";

jsx3.EVENT.SPYGLASS = "jsxspy";    //when the spyglass is about to show
jsx3.EVENT.DROP = "jsxdrop";      //after a drop event (one of: ondrop, canceldrop, beforedrop)
jsx3.EVENT.BEFOREDROP = "jsxbeforedrop";  //before a drop event (a mouseover)
jsx3.EVENT.CANCELDROP = "jsxcanceldrop";  //canceling a drop event (a mouseout)
jsx3.EVENT.CTRLDROP = "jsxctrldrop";    //after a ctrl drop event
jsx3.EVENT.DRAG = "jsxdrag";      //before a drag
jsx3.EVENT.ADOPT = "jsxadopt";     // when a record is adopted from this CDF object
jsx3.EVENT.SHOW = "jsxshow";      //when a menu or select or some other ephemeral VIEW element is about to be displayed
jsx3.EVENT.HIDE = "jsxhide";      //opposite of show
jsx3.EVENT.MENU = "jsxmenu";      //before a bound menu is shown
jsx3.EVENT.SELECT = "jsxselect";    //select, menu, tree, listview
jsx3.EVENT.TOGGLE = "jsxtoggle";    //treeview node open/close
jsx3.EVENT.EXECUTE = "jsxexecute";    //execute event as in a menu click or tree node click, or listview dbl-click; enter key; spacebar for button
jsx3.EVENT.BEFORERESIZE = "jsxbeforeresize";  //before a resize; typically a dialog or alert
jsx3.EVENT.AFTERRESIZE = "jsxafterresize";  //after resize; typically a dialog or alert
jsx3.EVENT.BEFOREMOVE = "jsxbeforemove";  //before a move event (fired by mouse down for any object that has been made "moveable")
jsx3.EVENT.AFTERMOVE = "jsxaftermove";  //after a move event
jsx3.EVENT.DESTROY = "jsxdestroy";    //when an object is removed from the JSX DOM
jsx3.EVENT.SORT = "jsxsort";      //NOT IMPLEMENTED: on a sort event
jsx3.EVENT.BEFORESORT = "jsxbeforesort";  //before a sort event
jsx3.EVENT.AFTERSORT = "jsxaftersort";  //after a sort event
jsx3.EVENT.PAINT = "jsxpaint";    //after repaint/insertHTML have been called
jsx3.EVENT.PAGE = "jsxpage";      //equivalent to 'onscroll'; superset category that also includes lazy fetch (paging) through large collections
jsx3.EVENT.INTERVAL = "jsxinterval";    //wraps "window.setInterval"; allows a timed event to fire every 'n' milliseconds; has a corresponding prop called 'jsxinterval' (interval)
jsx3.EVENT.DRAW = "jsxdraw";      //after 'redraw' has been called for a data client
jsx3.EVENT.DATA = "jsxdata";      //called when a data object (D.O.) has just acquired data; the D.O. will call this method to allow it to do any pre-processing or actual handling of the data
jsx3.EVENT.BEFOREEDIT = "jsxbeforeedit";       //called before showing an edit mask
jsx3.EVENT.AFTEREDIT = "jsxafteredit";         //called after showing an edit mask
jsx3.EVENT.CHANGE = "jsxchange";               //form value changed, tab changed
jsx3.EVENT.INCCHANGE = "jsxincchange";               //incremental change in text area, slider, etc
jsx3.EVENT.BEFOREAPPEND = "jsxbeforeappend";   //before a new CDF record and corresponding on-screen TR are added to a jsx3.gui.List instance or relevant subclass
jsx3.EVENT.AFTERAPPEND = "jsxafterappend";     //after a new CDF record and corresponding on-screen TR are added to a jsx3.gui.List instance or relevant subclass

/* @JSC */ }

/* @JSC :: end */
