/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _jsxloadcontext _varNameIndex

jsx3.require("jsx3.gui.HotKey");



/**
 * Mixin interface. Provides functionality to subclasses of jsx3.gui.Painted that allows them to publish model
 * events.
 * <p/>
 * Note that this class requires that implementors of this class extends  the <code>jsx3.gui.Painted</code> class and
 * implement the jsx3.util.EventDispatcher interface
 */
jsx3.Class.defineInterface("jsx3.gui.Interactive", null, function(Interactive, Interactive_prototype) {

  var Event = jsx3.gui.Event;

  /*
    This class contains the following sections:

    1. event type constants for primitive event wrappers
    2. event type constants for model events
    3. default HTML->JSX bridge event handlers _ebClick(), _ebFocus(), etc.
    4. getters and setters for instance fields that this mixin injects, including the event map
    5. utility methods that provide some common event-related functionality: spy, drag, etc. These methods will
       eventually be moved to another class
    6. hot key-related functions and methods
  */

  // the following are JSX model events that wrap primitive JavaScript events
  /** {String}
   * @final @jsxobf-final */
  Interactive.JSXBLUR = "jsxblur";
  /** {String}
   * @final @jsxobf-final */
  Interactive.JSXCHANGE = "jsxchange";
  /** {String}
   * @final @jsxobf-final */
  Interactive.JSXCLICK = "jsxclick";
  /** {String}
   * @final @jsxobf-final */
  Interactive.JSXDOUBLECLICK = "jsxdblclick";
  /** {String}
   * @final @jsxobf-final */
  Interactive.JSXFOCUS = "jsxfocus";
  /** {String}
   * @final @jsxobf-final */
  Interactive.JSXKEYDOWN = "jsxkeydown";
  /** {String}
   * @final @jsxobf-final */
  Interactive.JSXKEYPRESS = "jsxkeypress";
  /** {String}
   * @final @jsxobf-final */
  Interactive.JSXKEYUP = "jsxkeyup";
  /** {String}
   * @final @jsxobf-final */
  Interactive.JSXLOAD = "jsxload";
  /** {String}
   * @final @jsxobf-final */
  Interactive.JSXMOUSEDOWN = "jsxmousedown";
  /** {String}
   * @final @jsxobf-final */
  Interactive.JSXMOUSEOUT = "jsxmouseout";
  /** {String}
   * @final @jsxobf-final */
  Interactive.JSXMOUSEOVER = "jsxmouseover";
  /** {String}
   * @final @jsxobf-final */
  Interactive.JSXMOUSEUP = "jsxmouseup";
  /** {String}
   * @final @jsxobf-final */
  Interactive.JSXMOUSEWHEEL = "jsxmousewheel";
  /** {String}
   * @final @jsxobf-final */
  Interactive.FOCUS_STYLE = "text-decoration:underline";

  // the following are JSX model events
  /** {String}
   * @final @jsxobf-final */
  Interactive.ADOPT = "jsxadopt";     // when a record is adopted from this CDF object
  /** {String}
   * @final @jsxobf-final */
  Interactive.AFTER_APPEND = "jsxafterappend";     //after a new CDF record and corresponding on-screen TR are added to a jsx3.gui.List instance or relevant subclass
  /** {String}
   * @final @jsxobf-final */
  Interactive.AFTER_COMMIT = "jsxaftercommit";
  /** {String}
   * @final @jsxobf-final */
  Interactive.AFTER_EDIT = "jsxafteredit";         //called after showing an edit mask
  /** {String}
   * @final @jsxobf-final */
  Interactive.AFTER_MOVE = "jsxaftermove";  //after a move event
  /** {String}
   * @final @jsxobf-final */
  Interactive.AFTER_REORDER = "jsxafterreorder";    //after children have been reordered
  /** {String}
   * @final @jsxobf-final */
  Interactive.AFTER_RESIZE = "jsxafterresize";  //after resize; typically a dialog or alert
  /** {String}
   * @final @jsxobf-final */
  Interactive.AFTER_RESIZE_VIEW = "jsxafterresizeview";  //after the on-screen VIEW for the jsx3.gui.Block instance has been updated by box model controller, an event will be published with the following named properties: <code>native</code>: the native browser HTML element that was just resized--this can be queried for all relevant information such as clientWidth/clientHeight, etc and <code>target</code>: the jsx3.gui.Block instance that was just resized by by box model controller
  /** {String}
   * @final @jsxobf-final */
  Interactive.AFTER_SORT = "jsxaftersort";  //after a sort event
  /** {String}
   * @final @jsxobf-final */
  Interactive.BEFORE_APPEND = "jsxbeforeappend";   //before a new CDF record and corresponding on-screen TR are added to a jsx3.gui.List instance or relevant subclass
  /** {String}
   * @final @jsxobf-final */
  Interactive.BEFORE_DROP = "jsxbeforedrop";  //before a drop event (a mouseover)
  /** {String}
   * @final @jsxobf-final */
  Interactive.BEFORE_EDIT = "jsxbeforeedit";       //called before showing an edit mask
  /** {String}
   * @final @jsxobf-final */
  Interactive.BEFORE_MOVE = "jsxbeforemove";  //before a move event (fired by mouse down for any object that has been made "moveable")
  /** {String}
   * @final @jsxobf-final */
  Interactive.BEFORE_RESIZE = "jsxbeforeresize";  //before a resize; typically a dialog or alert
  /** {String}
   * @final @jsxobf-final */
  Interactive.BEFORE_SELECT = "jsxbeforeselect"; // vetoable select before a non-vetoable select
  /** {String}
   * @final @jsxobf-final */
  Interactive.BEFORE_SORT = "jsxbeforesort";  //before a sort event
  /** {String}
   * @final @jsxobf-final */
  Interactive.CANCEL_DROP = "jsxcanceldrop";  //canceling a drop event (a mouseout)
  /** {String}
   * @final @jsxobf-final */
  Interactive.CHANGE = "jsxchange";               //form value changed, tab changed
  /** {String}
   * @final @jsxobf-final */
  Interactive.CTRL_DROP = "jsxctrldrop";    //after a ctrl drop event
  /** {String}
   * @final @jsxobf-final */
  Interactive.DESTROY = "jsxdestroy";    //when an object is removed from the JSX DOM
  /** {String}
   * @final @jsxobf-final */
  Interactive.DATA = "jsxdata";
  /** {String}
   * @final @jsxobf-final */
  Interactive.DRAG = "jsxdrag";      //before a drag
  /** {String}
   * @final @jsxobf-final */
  Interactive.DROP = "jsxdrop";      //after a drop event (one of: ondrop, canceldrop, beforedrop)
  /** {String}
   * @final @jsxobf-final */
  Interactive.EXECUTE = "jsxexecute";    //execute event as in a menu click or tree node click, or listview dbl-click; enter key; spacebar for button
  /** {String}
   * @final @jsxobf-final */
  Interactive.HIDE = "jsxhide";      //opposite of show
  /** {String}
   * @final @jsxobf-final */
  Interactive.INCR_CHANGE = "jsxincchange";               //incremental change in text area, slider, etc
  /** {String}
   * @final @jsxobf-final */
  Interactive.INPUT = "jsxinput";
  /** {String}
   * @final @jsxobf-final */
  Interactive.MENU = "jsxmenu";      //before a bound menu is shown
  /** {String}
   * @final @jsxobf-final */
  Interactive.SCROLL = "jsxscroll";    //fires during a scroll event
  /** {String}
   * @final @jsxobf-final */
  Interactive.SELECT = "jsxselect";    //select, menu, tree, listview
  /** {String}
   * @final @jsxobf-final */
  Interactive.SHOW = "jsxshow";      //when a menu or select or some other ephemeral VIEW element is about to be displayed
  /** {String}
   * @final @jsxobf-final */
  Interactive.SPYGLASS = "jsxspy";    //when the spyglass is about to show
  /** {String}
   * @final @jsxobf-final */
  Interactive.TOGGLE = "jsxtoggle";    //treeview node open/close

  // default HTML->JSX bridge event handlers

  Interactive_prototype._ebBlur = function(objEvent, objGUI) {
    this.doEvent(Interactive.JSXBLUR, {objEVENT:objEvent});
  };

  Interactive_prototype._ebChange = function(objEvent, objGUI) {
    this.doEvent(Interactive.JSXCHANGE, {objEVENT:objEvent});
  };

  Interactive_prototype._ebClick = function(objEvent, objGUI) {
    this.doEvent(Interactive.JSXCLICK, {objEVENT:objEvent});
  };

  Interactive_prototype._ebDoubleClick = function(objEvent, objGUI) {
    this.doEvent(Interactive.JSXDOUBLECLICK, {objEVENT:objEvent});
  };

  Interactive_prototype._ebFocus = function(objEvent, objGUI) {
    this.doEvent(Interactive.JSXFOCUS, {objEVENT:objEvent});
  };

  /**
   * @return {boolean} true if the event was handled by a hot key and should not be considered further
   * @package
   */
  Interactive_prototype._ebKeyDown = function(objEvent, objGUI) {
    var caught = false;
    if (this.hasHotKey())
      caught = this.checkHotKeys(objEvent);

    if (! caught)
      this.doEvent(Interactive.JSXKEYDOWN, {objEVENT:objEvent});

    return caught;
  };

  Interactive_prototype._ebKeyPress = function(objEvent, objGUI) {
    this.doEvent(Interactive.JSXKEYPRESS, {objEVENT:objEvent});
  };

  Interactive_prototype._ebKeyUp = function(objEvent, objGUI) {
    this.doEvent(Interactive.JSXKEYUP, {objEVENT:objEvent});
  };

  Interactive_prototype._ebMouseDown = function(objEvent, objGUI) {
    this.doEvent(Interactive.JSXMOUSEDOWN, {objEVENT:objEvent});
  };

  Interactive_prototype._ebMouseOut = function(objEvent, objGUI) {
    this.doEvent(Interactive.JSXMOUSEOUT, {objEVENT:objEvent});
  };

  Interactive_prototype._ebMouseOver = function(objEvent, objGUI) {
    this.doEvent(Interactive.JSXMOUSEOVER, {objEVENT:objEvent});
  };

  Interactive_prototype._ebMouseUp = function(objEvent, objGUI) {
    var strMenu = null;
    this.doEvent(Interactive.JSXMOUSEUP, {objEVENT:objEvent});

    if (objEvent.rightButton() && (strMenu = this.getMenu()) != null) {
      var objMenu = this._getNodeRefField(strMenu);
      if (objMenu != null) {
        var vntResult = this.doEvent(Interactive.MENU, {objEVENT:objEvent, objMENU:objMenu, _gipp:1});
        if (vntResult !== false) {
          if (vntResult instanceof Object && vntResult.objMENU instanceof jsx3.gui.Menu)
            objMenu = vntResult.objMENU;
          objMenu.showContextMenu(objEvent, this);
        }
      }
    }
  };

  Interactive_prototype._ebMouseWheel = function(objEvent, objGUI) {
    this.doEvent(Interactive.JSXMOUSEWHEEL, {objEVENT:objEvent});
  };

  // getters and setters

  /**
   * Programmatically sets an event of this instance. Sets the script that will execute when this object publishes
   * a model event. The script value will be saved in the serialization file of a component. Not all classes that
   * implement this interface will publish events of every type. Consult the documentation of a class for a
   * description of the events it publishes.
   * <p/>
   * For programmatic registering of event handlers when persistence in a serialization file is not required,
   * consider using <code>jsx3.util.EventDispatcher.subscribe()</code> instead of this method. Whenever a model
   * event is published, it is published using the <code>EventDispatcher</code> interface as well as by executing
   * any registered event script.
   *
   * @param strScript {String} the actual JavaScript code that will execute when the given event is published.
   *    For example: <code>obj.setEvent("alert('hello.');", jsx3.gui.Interactive.EXECUTE);</code>
   * @param strType {String} the event type. Must be one of the model event types defined as static fields in this class
   * @return {jsx3.gui.Interactive} reference to this
   *
   * @see jsx3.util.EventDispatcher#subscribe()
   */
  Interactive_prototype.setEvent = function(strScript, strType) {
    this.getEvents()[strType] = strScript;
    return this;
  };

  /**
   * Returns the associative array containing all the registered event script of this object. This method returns
   * the instance field itself and not a copy.
   * @return {Object<String, String>} an associative array mapping event type to event script
   */
  Interactive_prototype.getEvents = function() {
    if (this._jsxevents == null)
      /* @jsxobf-clobber-shared */
      this._jsxevents = {};
    return this._jsxevents;
  };

  /**
   * Returns the event script registered for the given event type. This script could have been set by the
   * <code>setEvent()</code> method or during component deserialization.
   * @param strType {String} the event type, one of the model event types defined as static fields in this class
   * @return {String} the JavaScript event script
   *
   * @see #setEvent()
   */
  Interactive_prototype.getEvent = function(strType) {
    if (this._jsxevents) return this._jsxevents[strType];
  };

  /**
   * Returns true if there is a event script registered for the given event type.
   * @param strType {String} the event type, one of the model event types defined as static fields in this class
   * @return {String} the JavaScript event script
   */
  Interactive_prototype.hasEvent = function(strType) {
    return this._jsxevents != null && this._jsxevents[strType] != null && this._jsxevents[strType].match(/\S/);
  };

  /**
   * Publishes a model event. This method both evaluates any registered event script for the given event type
   * <b>and</b> publishes the event through the <code>EventDispatcher</code> interface. This method ensures that any
   * registered event script is executed in isolation to prevent most side effects.
   *
   * @param strType {String} the event type, one of the model event types defined as static fields in this class
   * @param objContext {Object<String, Object>} JavaScript object array with name/value pairs that provide a local
   *    variable stack for the execution of the event script. This argument is also passed as the <code>context</code>
   *    property of the event object that is published through the <code>EventDispatcher</code> interface.
   * @return {Object} the result of evaluating the event script or <code>null</code> if not event script is registered
   */
  Interactive_prototype.doEvent = function(strType, objContext) {
    var script = this.getEvent(strType);
    if (typeof(this.publish) == "function")
      this.publish({subject:strType, context:objContext});

    return this.eval(script, this._getEvtContext(objContext));
//    return this.eval("(function " + strType + "(){return " + script + "})();", objContext);
  };

  Interactive_prototype._getEvtContext = function(objContext) {
    var loadContext = this._jsxloadcontext;
    if (loadContext)
      objContext = jsx3.$O(loadContext._varNameIndex).clone().extend(objContext);
    return objContext;
  };

  /**
   * Removes an event script registered for the given model event type.
   * @param strType {String} the event type, one of the model event types defined as static fields in this class
   * @return {jsx3.gui.Interactive} this object
   */
  Interactive_prototype.removeEvent = function(strType) {
    if (this._jsxevents != null)
      delete this._jsxevents[strType];
    return this;
  };

  /**
   * Removes all events scripts registered with this object.
   * @return {jsx3.gui.Interactive} this object
   */
  Interactive_prototype.removeEvents = function() {
    this._jsxevents = {};
    return this;
  };

  /**
   * Sets whether is object can be moved around the screen (this is not the same as drag/drop). Implementing classes
   * can decide whether to consult this value or ignore it.
   * @param bMovable {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   * @return {jsx3.gui.Interactive} this object
   */
  Interactive_prototype.setCanMove = function(bMovable) {
    this.jsxmove = bMovable;
    return this;
  };

  /**
   * Returns whether is object can be moved around the screen (this is not the same as drag/drop).
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  Interactive_prototype.getCanMove = function() {
    return this.jsxmove || jsx3.Boolean.FALSE;
  };

  /**
   * Sets whether is object supports programmatic drag, meanining it will allow any contained item to be dragged/dropped.
   * Implementing classes can decide whether to consult this value or ignore it.
   * @param bDrag {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   * @return {jsx3.gui.Interactive} this object
   */
  Interactive_prototype.setCanDrag = function(bDrag) {
    this.jsxdrag = bDrag;
    return this;
  };

  /**
   * Returns whether is object supports programmatic drag, meanining it will allow any contained item to be
   * dragged and dropped on another container supporting drop.
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  Interactive_prototype.getCanDrag = function() {
    return this.jsxdrag || jsx3.Boolean.FALSE;
  };

  /**
   * Sets whether this object can be the target of a drop event. Implementing classes can decide whether to consult
   * this value or ignore it.
   * @param bDrop {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   * @return {jsx3.gui.Interactive} this object
   */
  Interactive_prototype.setCanDrop = function(bDrop) {
    this.jsxdrop = bDrop;
    return this;
  };

  /**
   * Returns whether this object can be the target of a drop event.
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  Interactive_prototype.getCanDrop = function() {
    return this.jsxdrop || jsx3.Boolean.FALSE;
  };

  /**
   * Sets whether is object can be spyglassed. Implementing classes can decide whether to consult
   * this value or ignore it.
   * @param bSpy {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   * @return {jsx3.gui.Interactive} this object
   */
  Interactive_prototype.setCanSpy = function(bSpy) {
    this.jsxspy = bSpy;
    return this;
  };

  /**
   * Returns whether is object can be spyglassed.
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>
   */
  Interactive_prototype.getCanSpy = function() {
    return this.jsxspy || jsx3.Boolean.FALSE;
  };

  /**
   * Returns the name of the <code>jsx3.gui.Menu</code> instance to display (as a context menu) when a user
   * clicks on this object with the right button.
   * @return {String}
   */
  Interactive_prototype.getMenu = function() {
    return this.jsxmenu;
  };

  /**
   * Sets the name of the <code>jsx3.gui.Menu</code> instance to display when a user
   * clicks on this object with the right button. The name is a pointer by-name to a JSX object in the same server.
   * @param strMenu {String} name or id (jsxname or jsxid) of the context menu
   * @return {jsx3.gui.Interactive} this object
   */
  Interactive_prototype.setMenu = function(strMenu) {
    this.jsxmenu = strMenu;
    return this;
  };

  // fields and methods related to the HTML->JSX event bridge

  /** @package */
  Interactive.BRIDGE_EVENTS = [Event.BLUR, Event.CHANGE, Event.CLICK, Event.DOUBLECLICK,
      Event.FOCUS, Event.KEYDOWN, Event.KEYPRESS, Event.KEYUP, Event.MOUSEDOWN, Event.MOUSEMOVE,
      Event.MOUSEOUT, Event.MOUSEOVER, Event.MOUSEUP, Event.MOUSEWHEEL];

  /** @package */
  Interactive.BRIDGE_EVENTS_MAP = {};
  Interactive.BRIDGE_EVENTS_MAP[Event.BLUR] = "_ebBlur";
  Interactive.BRIDGE_EVENTS_MAP[Event.CHANGE] = "_ebChange";
  Interactive.BRIDGE_EVENTS_MAP[Event.CLICK] = "_ebClick";
  Interactive.BRIDGE_EVENTS_MAP[Event.DOUBLECLICK] = "_ebDoubleClick";
  Interactive.BRIDGE_EVENTS_MAP[Event.FOCUS] = "_ebFocus";
  Interactive.BRIDGE_EVENTS_MAP[Event.KEYDOWN] = "_ebKeyDown";
  Interactive.BRIDGE_EVENTS_MAP[Event.KEYPRESS] = "_ebKeyPress";
  Interactive.BRIDGE_EVENTS_MAP[Event.KEYUP] = "_ebKeyUp";
  Interactive.BRIDGE_EVENTS_MAP[Event.MOUSEDOWN] = "_ebMouseDown";
  Interactive.BRIDGE_EVENTS_MAP[Event.MOUSEMOVE] = "_ebMouseMove";
  Interactive.BRIDGE_EVENTS_MAP[Event.MOUSEOUT] = "_ebMouseOut";
  Interactive.BRIDGE_EVENTS_MAP[Event.MOUSEOVER] = "_ebMouseOver";
  Interactive.BRIDGE_EVENTS_MAP[Event.MOUSEUP] = "_ebMouseUp";
  Interactive.BRIDGE_EVENTS_MAP[Event.MOUSEWHEEL] = "_ebMouseWheel";

  /**
   * Used by jsx3.gui.Painted to render only the attributes that aren't rendered by renderHandlers().
   * @private
   */
  Interactive.isBridgeEventHandler = function(strHandler) {
    if (Interactive.BRIDGE_EVENT_HANDLER_MAP == null) {
      /* @jsxobf-clobber */
      Interactive.BRIDGE_EVENT_HANDLER_MAP = {};
      for (var i = 0; i < Interactive.BRIDGE_EVENTS.length; i++) {
        Interactive.BRIDGE_EVENT_HANDLER_MAP["on" + Interactive.BRIDGE_EVENTS[i]] = true;
      }
    }
    return Interactive.BRIDGE_EVENT_HANDLER_MAP[strHandler];
  };

  /** @package */
  Interactive._BRIDGE = "_bridge";
  /** @package */
  Interactive._EB = "_eb";

  /**
   * Renders all event bridge handlers. If the value of a property of <code>objMap</code> is true, the default name
   * for the bridge is used. However, this name is obfuscated so the class better be obfuscated with this class.
   * @package
   */
  Interactive_prototype.renderHandlers = function(objMap, useId) {
    // check for inherited behaviors:
    var inheritedMap = {};
    if ((objMap == null || ! objMap[Event.KEYDOWN]) && (this.hasHotKey() || this.getAlwaysCheckHotKeys()))
      inheritedMap[Event.KEYDOWN] = true;
    if ((objMap == null || ! objMap[Event.MOUSEUP]) && this.getMenu())
      inheritedMap[Event.MOUSEUP] = true;

    var strEvents = [];
    var bHasAttr = this.instanceOf(jsx3.gui.Painted);
    var strId = this.getId();

    for (var i = 0; i < Interactive.BRIDGE_EVENTS.length; i++) {
      var eventType = Interactive.BRIDGE_EVENTS[i];
      var eventHandler = "on" + eventType;
      var strEvent = [];

      var attrEvent = bHasAttr ? this.getAttribute(eventHandler) : null;
      if (attrEvent)
        strEvent[strEvent.length] = attrEvent.replace(/"/g, "&quot;") + ";";

      var bridgeMethod = (objMap && objMap[eventType]) || inheritedMap[eventType]/* || this.hasEvent("jsx" + eventType)*/;
      if (bridgeMethod) {
        if (typeof(bridgeMethod) != "string")
          bridgeMethod = Interactive.BRIDGE_EVENTS_MAP[eventType];

        if (useId != null)
          strEvent[strEvent.length] = "jsx3." + Interactive._EB + "(event,this,'" + bridgeMethod + "'," + useId + ");";
        else
          strEvent[strEvent.length] = "jsx3.GO('" + strId + "')." + Interactive._BRIDGE + "(event,this,'" + bridgeMethod + "');";
      }

      if (strEvent.length > 0)
        strEvents[strEvents.length] = ' ' + eventHandler + '="' + strEvent.join("") + '"';
    }

    return strEvents.join("");
  };

  /**
   * @package
   */
  Interactive_prototype.renderHandler = function(eventType, strMethod, useId) {
    var eventHandler = "on" + eventType;
    var strEvent = "";
    var bScript = false;

    if (bScript) {
      var attrEvent = this.getAttribute(eventHandler);
      if (attrEvent) {
        strEvent += attrEvent;
        if (! attrEvent.match(/;\s*$/))
          strEvent += ";";
      }
    }

    var bridgeEvent = useId != null ?
        "jsx3." + Interactive._EB + "(event,this,'" + strMethod + "'," + useId + ");" :
        "jsx3.GO('" + this.getId() + "')." + Interactive._BRIDGE + "(event,this,'" + strMethod + "');";

    return " " + eventHandler + '="' + strEvent + bridgeEvent + '"';
  };

  /**
   * @package
   * @jsxobf-clobber-shared
   */
  Interactive_prototype._bridge = function(objEvent, objElement, strMethod) {
    var win;
    // Refs GI-720: For some reason Matrix focus and blur events may not come through in IE.
    // It must be because of Matrix's HTML to DOM conversion. This is the workaround. 
    if (!objEvent && objElement && (win = objElement.ownerDocument.parentWindow))
      objEvent = win.event;

    if (objEvent) {
      var method = this[strMethod];
      var e = jsx3.gui.Event.wrap(objEvent);
      if (method) {
        method.call(this, e, objElement);
      } else {
        throw new jsx3.Exception(jsx3._msg("gui.int.br", strMethod, e.getType(), this));
      }
    }
  };

  /* @jsxobf-clobber-shared */
  jsx3._eb = function(objEvent, objGUI, strMethod, intUp) {
    var jsxGUI = objGUI;
    intUp = intUp || Number(0);
    for (var i = 0; i < intUp; i++)
      jsxGUI = jsxGUI.parentNode;

    var strId = jsxGUI.getAttribute("id");
    var objJSX = jsx3.GO(strId);
    if (objJSX != null)
      objJSX._bridge(objEvent, objGUI, strMethod);
    else if (jsx3.html.getElmUpByTagName(objGUI, "body") != null) // ignore only if objGUI has been detached from the HTML DOM
      throw new jsx3.Exception(jsx3._msg("gui.int.eb", strId, intUp, objGUI));
  };

/* @JSC :: begin DEP */
// only used by List

  /**
   * @package
   */
  Interactive._beginMove = function(objEvent, objGUI, bCX, bCY) {
    var doc = objGUI.ownerDocument;

    //class method used for simple move operation; simply pass in the basics
    jsx3.gui.Event.preventSelection(doc);
    var absX = objEvent.getTrueX();
    var objX = objGUI.offsetLeft;
    jsx3.EventHelp.constrainY = bCY;
    jsx3.EventHelp.xOff = objX - absX;
    var absY = objEvent.getTrueY();
    var objY = objGUI.offsetTop;
    jsx3.EventHelp.constrainX = bCX;
    jsx3.EventHelp.yOff = objY - absY;
    jsx3.EventHelp.curDragObject = objGUI;
    jsx3.EventHelp.FLAG = 1;
    jsx3.EventHelp.beginTrackMouse(objEvent);
    objEvent.setCapture(objGUI);
    objEvent.cancelReturn();
    objEvent.cancelBubble();
  };

/* @JSC :: end */

  /**
   * @package
   */
  Interactive._beginMoveConstrained = function(objEvent, objGUI, functRounder) {
    var doc = objGUI.ownerDocument;
    jsx3.gui.Event.preventSelection(doc);

    jsx3.EventHelp.startX = objEvent.getTrueX();
    jsx3.EventHelp.startY = objEvent.getTrueY();
    jsx3.EventHelp.xOff = objGUI.offsetLeft;
    jsx3.EventHelp.yOff = objGUI.offsetTop;
    jsx3.EventHelp.dragRounder = functRounder;

    jsx3.EventHelp.curDragObject = objGUI;

    jsx3.EventHelp.FLAG = 3;
    jsx3.EventHelp._dragging = false; // used for internal moving of parts like dialog resize and column reorder
    jsx3.EventHelp.beginTrackMouse(objEvent);
    objEvent.setCapture(objGUI);
    objEvent.cancelReturn();
    objEvent.cancelBubble();
  };


  Interactive_prototype.doBeginMove = function(objEvent, objGUI) {
    if (! objEvent.leftButton()) {
//      jsx3.log("cancelling move because button=" + objEvent.event().button);
      return;
    }

    //
    //? doBeginMove()    --any JSX Object that implements jsx3.gui.Interactive has access to this method. Binding this method to the mousedown event for the object allows the object to be dragged around the screen; mouseup must also reference the doEndMove function
    //! returns {null}
    //
    //initialize variables
    if (objGUI == null)
      objGUI = this.getRendered();
    var doc = objGUI.ownerDocument;

    var eventRet = this.doEvent(Interactive.BEFORE_MOVE, {objEVENT:objEvent});
    var bCancel = eventRet === false;

    //is the object painted and beforemove script didn't cancel?
    if (objGUI != null && !bCancel) {
      //update view for object--set its zindex higher in stack than all but system menus
      objGUI.style.zIndex = this.getServer().getNextZIndex(jsx3.app.Server.Z_DRAG);
      jsx3.gui.Event.preventSelection(doc);

      //set globals used to register the object's VIEW with the drag controller (with the following set, the drag controller will listen for mousemove)
      var absX = objEvent.getTrueX();
      var objX = objGUI.style.position == "absolute" ? (parseInt(objGUI.style.left) || 0) : objGUI.scrollLeft;

      if (eventRet && eventRet.bCONSTRAINY)
        jsx3.EventHelp.constrainY = true;

      jsx3.EventHelp.xOff = objX - absX;
      var absY = objEvent.getTrueY();
      var objY = objGUI.style.position == "absolute" ? (parseInt(objGUI.style.top) || 0) : objGUI.scrollTop;

      if (eventRet && eventRet.bCONSTRAINX)
        jsx3.EventHelp.constrainX = true;

      jsx3.EventHelp.yOff = objY - absY;
      jsx3.EventHelp.curDragObject = objGUI;
      jsx3.EventHelp.FLAG = 1;
      jsx3.EventHelp._dragging = false; // used for splitter move, dialog move
      jsx3.EventHelp.beginTrackMouse(objEvent);
      objEvent.setCapture(objGUI);
    }
  };

  Interactive_prototype.doEndMove = function(objEvent, objGUI) {
    //
    //? doEndMove()    --any JSX Object that implements jsx3.gui.Interactive has access to this method. Binding this method to the mouseup event for an object (e.g., "[object].doEndMove()") completes the drag and updates the object's model to reflect new positioning due to drag
    //! returns {null}
    //
    if (objGUI == null) objGUI = this.getRendered();

    if (objGUI != null) {
      objGUI.style.zIndex = this.getZIndex();
      objEvent.releaseCapture(objGUI);

      var newLeft = parseInt(objGUI.style.left);
      var newTop = parseInt(objGUI.style.top);
      //update MODEL to reflect where the object's on-screen VIEW has been positioned
      this.setLeft(newLeft);
      this.setTop(newTop);

      //execute the onaftermove code
      this.doEvent(Interactive.AFTER_MOVE, {objEVENT:objEvent, intL:newLeft, intT:newTop, _gipp:1});
    }
  };

  Interactive_prototype.doDrag = function(objEvent, objGUI, fctRenderer, objContext) {
    //
    //? doDrag()      --called when user mouses down on a draggable on-screen element
    //@ strCALLBACK {String} name of callback function that will return the HTML string that will represent the draggable icon that will move on-screen
    //@ objGUI {Object} on-screen, HTML object that was just 'moused down' on (what will be dragged); if null, it is assumed
    //            that this object can be derived by querying the system EVENT object for the 'srcElement' (objEvent.srcElement())
    //! returns {null}
    //
    //stop event bubbling in case parent object has mousedown event
    objEvent.cancelAll();

    //validate that objGUI (the item that was just moused down upon) is draggable
    if (objGUI == null) {
      objGUI = objEvent.srcElement();
      //loop up browser dom to find ancestor (or self) element that has a JSXDragId property, so we know what should be dragged
      while (objGUI != null && objGUI.getAttribute("JSXDragId") == null) {
        objGUI = objGUI.parentNode;
        if (objGUI = objGUI.ownerDocument.getElementsByTagName("body")[0])
          objGUI = null;
      }
      if (objGUI == null) return;
    }

    //declare contextual variables
    var strDRAGID = objGUI.getAttribute("JSXDragId");
    var strDRAGTYPE = objGUI.getAttribute("JSXDragType");

    if (objContext == null) objContext = {};
    objContext.strDRAGID = objGUI.getAttribute("JSXDragId");
    objContext.strDRAGTYPE = objGUI.getAttribute("JSXDragType");
    objContext.objGUI = objGUI;
    objContext.objEVENT = objEvent;

    //fire any bound drag handler code; this will allow the user to read/write necessary values as well as cancel the drag if they return explicit 'false'
    if (this.doEvent(Interactive.DRAG, objContext) === false) return;

    //extract the id from the element about to be dragged and persist (for use by drop zone objects); persist the name/id of the source object
    jsx3.EventHelp.DRAGTYPE = objContext.strDRAGTYPE;
    jsx3.EventHelp.DRAGID = objContext.strDRAGID;
    if(jsx3.$A.is(objContext.strDRAGIDS)) jsx3.EventHelp.DRAGIDS = objContext.strDRAGIDS;
    jsx3.EventHelp.JSXID = this;

    //use system default if no drag icon function supplied
    if (fctRenderer == null) fctRenderer = jsx3.EventHelp.drag;
    var strIcon = fctRenderer(objGUI, this, jsx3.EventHelp.DRAGTYPE, jsx3.EventHelp.DRAGID);

    //validate that the drag should still occur
    if (strIcon == null) {
      //if strIcon is null, it means that the user-specified callback cancelled the drag event by returning null
      return false;
    } else {
      //save html for drag icon
      jsx3.EventHelp.dragItemHTML = strIcon;

      //set flag used by mousemove listener; it will know to begin a drag if the user moves their mouse
      jsx3.EventHelp.FLAG = 2;
      jsx3.EventHelp._dragging = true; // used for CDF DnD
      jsx3.EventHelp.beginTrackMouse(objEvent);
    }

    //reset drag constraints (during drag/drop there is no constraint, but the same controller is used for 'move' as well as 'drag', so must reset just in case
    jsx3.EventHelp.constrainX = false;
    jsx3.EventHelp.constrainY = false;
  };

  Interactive_prototype.doDrop = function(objEvent, objGUI, DROPTYPE) {
    //
    //? doDrop()      --called when user is in the middle of a drag/drop operation and drags over/drags out/drops the given 'drag' object over a specified drop zone
    //@ DROPTYPE {String} value representing what is happening--mouseover, moueup, or mouseout
    //! returns {null}
    //
    if (jsx3.EventHelp.DRAGID != null) {
      //constants that can be referenced by any bound jsxondrop/jsxonctrldrop event handler code
      var objSOURCE = jsx3.EventHelp.JSXID;        //source jsx gui object; (i.e., another JSX object)
      var strDRAGID = jsx3.EventHelp.DRAGID;      //drag id for the element being dragged
      var strDRAGTYPE = jsx3.EventHelp.DRAGTYPE;      //drag type (equivalent to MIME) for the element being dragged
      var context = {objEVENT:objEvent, objSOURCE:objSOURCE, strDRAGID:strDRAGID, strDRAGTYPE:strDRAGTYPE};

      if (DROPTYPE == jsx3.EventHelp.ONDROP && jsx3.gui.isMouseEventModKey(objEvent)) {
        context.objGUI = objEvent.srcElement();
        this.doEvent(Interactive.CTRL_DROP, context);
        jsx3.EventHelp.reset();
      } else if (DROPTYPE == jsx3.EventHelp.ONDROP) {
        context.objGUI = objEvent.srcElement();
        this.doEvent(Interactive.DROP, context);
        jsx3.EventHelp.reset();
      } else if (DROPTYPE == jsx3.EventHelp.ONBEFOREDROP) {
        context.objGUI = objEvent.toElement();
        this.doEvent(Interactive.BEFORE_DROP, context);
      } else if (DROPTYPE == jsx3.EventHelp.ONCANCELDROP) {
        context.objGUI = objEvent.fromElement();
        this.doEvent(Interactive.CANCEL_DROP, context);
      }
    }
  };

  Interactive_prototype.doSpyOver = function(objEvent, objGUI, objContext) {
    //get the return of the jsxspy (a model event)
    var intX = objEvent.getTrueX();
    var intY = objEvent.getTrueY();

    if (this._jsxspytimeout) return;

    if (objContext == null) objContext = {};
    objEvent.persistEvent(); // so that event is still available after timeout
    objContext.objEVENT = objEvent;

    var me = this;
    this._jsxspytimeout = window.setTimeout(function() {
      if (me.getParent() == null) return;

      me._jsxspytimeout = null;
      var strSPYHTML = me.doEvent(Interactive.SPYGLASS, objContext);
      // if not empty...
      if (strSPYHTML)
        me.showSpy(strSPYHTML, objEvent);
    }, jsx3.EventHelp.SPYDELAY);
  };

  Interactive_prototype.doSpyOut = function(objEvent, objGUI) {
    // exit early if it's not really a mouse out event
    if (objEvent.isFakeOut(objGUI))
      return;

    if (!jsx3.gui.Heavyweight)
      return;
    
    // exit early if it was the spyglass itself that caused the mouseout event
    var hw = jsx3.gui.Heavyweight.GO("_jsxspy");
    if (hw) {
      var hwGUI = hw.getRendered();
      if (hwGUI && objEvent.isFakeOut(hwGUI))
        return;
    }
    
    //called when item implementing a spyglass is moused off
    window.clearTimeout(this._jsxspytimeout);
    this._jsxspytimeout = null;
    Interactive.hideSpy();
  };

  /**
   * called by 'window.setTimeout()' to display the spyglass hover for a given object;
   * @param strHTML {String} HTML/text to display in the spyglass; as the spyglass does not define a height/width, this content will
   *          have improved layout if it specifies a preferred width in its in-line-style or referenced-css rule.
   * @param intLeft {int | jsx3.gui.Event} use an integer to specify an on-screen location; otherwise, use a <code>jsx3.gui.Event</code> instance to have the system automatically calculate the x/y position.
   * @param intTop {int} use an integer if <code>intLeft</code> also uses an integer. Otherwise, use null.
   */
  Interactive_prototype.showSpy = function(strHTML,intLeft,intTop) {
    if (strHTML != null) {
      jsx3.require("jsx3.gui.Heavyweight");

      //make sure only one active spyglass at a time
      Interactive.hideSpy();

      //wrap the HTML that the user wants to display in the spy container (this provides the padding, bground (yellow), and mousemove logic to destroy the spyglass)
      strHTML = '<span class="jsx30spyglassbuffer"><div class="jsx30spyglass">' + strHTML + '</div></span>';

      //create the HW instance to hold the spy content
      var objHW = new jsx3.gui.Heavyweight("_jsxspy", this);
      objHW.setHTML(strHTML);
      objHW.setRatio(1.4);
      
      if(intLeft instanceof Event) {
        objHW.addXRule(intLeft,"W","W",12);
        objHW.addXRule(intLeft,"E","E",-12);
        objHW.addYRule(intLeft,"S","N",6);
        objHW.addYRule(intLeft,"N","S",-6);
      } else {
        objHW.addRule(intLeft,"W",-2,"X");
        objHW.addRule(intLeft,"E",12,"X");
        objHW.addRule(null,"W",-24,"X");
        objHW.addRule(intTop,"N",-2,"Y");
        objHW.addRule(intTop,"S",-6,"Y");
        objHW.setOverflow(jsx3.gui.Block.OVERFLOWEXPAND);
      }
      objHW.show();

      //ensures the spyglass content has the appropriate ratio, so that when painted, the heavyweight is in a readable dimension
      var objGUI = objHW.getRendered(); // may be null of somehow the hw anchor disappeared
      if (objGUI) {
        var body = objGUI.ownerDocument.getElementsByTagName("body")[0];
        //var myHeight = body.offsetHeight - (objGUI.childNodes[0].offsetHeight + parseInt(objGUI.style.top));
        //if (myHeight < 0)
        //  objGUI.style.top = parseInt(objGUI.style.top) + myHeight + "px";
        if (parseInt(objGUI.style.width) + parseInt(objGUI.style.left) > body.offsetWidth)
          objHW.applyRules("X");
      }


      // subscribe/unsubscribe as needed
      Event.subscribe(jsx3.gui.Event.MOUSEDOWN, jsx3.gui.Interactive.hideSpy);
    }
  };

  Interactive.hideSpy = function() {
    if (jsx3.gui.Heavyweight) {
      var objGUI = jsx3.gui.Heavyweight.GO("_jsxspy");
      if (objGUI) {
        objGUI.destroy();
        // subscribe/unsubscribe as needed
        Event.unsubscribe(jsx3.gui.Event.MOUSEDOWN, jsx3.gui.Interactive.hideSpy);
      }
    }
  };

  /**
   * Returns the CSS definition to apply to an HTML element when a spyglass is shown for that element.
   * @return {String}
   * @private
   */
  Interactive_prototype.getSpyStyles = function(strDefault) {
    return (this.jsxspystyle) ? this.jsxspystyle : ((strDefault) ? strDefault : null);
  };


  /**
   * Sets the CSS definition to apply to an HTML element when a spyglass is shown for that element
   * @param strCSS {String} valid CSS. For example, text-decoration:underline;color:red;
   */
  Interactive_prototype.setSpyStyles = function(strCSS) {
    //remove cached transient values used for the live session
    delete this._jsxcachedspystyles;
    delete this._jsxunspystyles;

    //remove values set using old syntax
    delete this.jsxspystylekeys;
    delete this.jsxspystylevalues;

    //set value using the new syntax
    this.jsxspystyle = strCSS;
  };


  /** @private @jsxobf-clobber */
  Interactive_prototype._resolveSpyStyle = function() {
    var map = {};
    if(jsx3.util.strEmpty(this.getSpyStyles()) && this.jsxspystylekeys != null) {
      //old serialization syntax is used get structure from the named properties: jsxspystylekeys and jsxspystylevalues
      var keys = (this.jsxspystylekeys || "").split(/ *; */);
      var values = (this.jsxspystylevalues || "").split(/ *; */);
      for (var i = 0; i < keys.length; i++)
        map[keys[i]] = values[i];
    } else {
      //new serialization syntax is used; get structure from the named property, jsxspystyle
      var strStyles = this.getSpyStyles(Interactive.FOCUS_STYLE);
      var re = /(-\S)/gi;
      var map = {};
      var objStyles = strStyles.split(";");
      for(var i=0;i<objStyles.length;i++) {
        var curStyle = objStyles[i] + "";
        var objStyle = curStyle.split(":");
        if(objStyle && objStyle.length == 2) {
          var strStyleName = objStyle[0].replace(re,function($0,$1) {
                                                      return $1.substring(1).toUpperCase();
                                                    });
          map[strStyleName] = objStyle[1];
        }
      }
    }
    return map;
  };


  /**
   * applies the style
   * @private
   */
  Interactive_prototype.applySpyStyle = function(objGUI) {
    if (this._jsxcachedspystyles == null)
      /* @jsxobf-clobber */
      this._jsxcachedspystyles = this._resolveSpyStyle();

    if (this._jsxunspystyles == null) {
      /* @jsxobf-clobber */
      this._jsxunspystyles = {};
      for (var f in this._jsxcachedspystyles)
        this._jsxunspystyles[f] = objGUI.style[f];
    }

    try {
      for (var f in this._jsxcachedspystyles)
        objGUI.style[f] = this._jsxcachedspystyles[f];
    } catch (e) {}
  };


  /**
   * removes the style
   * @private
   */
  Interactive_prototype.removeSpyStyle = function(objGUI) {
    try {
      for (var f in this._jsxunspystyles)
        objGUI.style[f] = this._jsxunspystyles[f];
    } catch (e) {}
  };


///////////////////////////// Methods for convenient handling of hot-key capturing /////////////////////////////////

  /**
   * check all registered hotkeys against the current event and capture the event if there is a match
   * @private
   */
  Interactive_prototype.checkHotKeys = function(objEvent) {
    if (this._jsxhotkeys == null) return false;
    if (objEvent.isModifierKey()) return false;

    var oneOrMore = false;
    var inModal = objEvent.getAttribute("jsxmodal");

    for (var f in this._jsxhotkeys) {
      var objKey = this._jsxhotkeys[f];
      if (objKey instanceof jsx3.gui.HotKey) {
        if (objKey.isDestroyed()) {
          delete this._jsxhotkeys[f];
          continue;
        } else if (! objKey.isEnabled()) {
          continue;
        }

        if (objKey.isMatch(objEvent)) {
          var capture = true;
          if (! inModal)
            capture = objKey.invoke(this, [objEvent]);
          if (capture !== false)
            oneOrMore = true;
        }
      }
    }

    if (oneOrMore)
      objEvent.cancelAll();

    return oneOrMore;
  };

  /**
   * Registers a hot key with this JSX model node. All <code>keydown</code> events that bubble up to this object
   * will be checked against the hot key. If an event matches, the callback function will execute and the event
   * bubble will be canceled.
   * <p/>
   * If the four parameters <code>vntKey</code>, <code>bShift</code>, <code>bControl</code>, and <code>bAlt</code>
   * match a previously registered hot key, the previous hot key is clobbered by the new one. Only one hot key callback
   * function (the most recently registered) will be executed by a single keydown event.
   *
   * @param vntCallback {String|Function|jsx3.gui.HotKey} either a function, or the name of a method bound to this object.
   *    When a keydown event bubbles up to this object that matches the hot key created by this method, this function
   *    is called on this object. If this function returns <code>false</code> then this hot key will not cancel the
   *    key event. This parameter can also be an instance of <code>HotKey</code>, in which case all
   *    other parameters are ignored.
   * @param vntKey {int|String} if this parameter is a String, the hot key matches that key (the keycode to match is
   *    determined by <code>HotKey.keyDownCharToCode()</code>). If it is an integer, the hot key will match that
   *    keycode value.
   * @param bShift {boolean} if not <code>null</code> the shift key state of the keydown event must match this value
   *    to invoke the hot key.
   * @param bControl {boolean} if not <code>null</code> the control key state of the keydown event must match this value
   *    to invoke the hot key.
   * @param bAlt {boolean} if not <code>null</code> the alt key state of the keydown event must match this value
   *    to invoke the hot key.
   * @return {jsx3.gui.HotKey} the registered hot key.
   *
   * @see jsx3.gui.HotKey#keyDownCharToCode()
   */
  Interactive_prototype.registerHotKey = function(vntCallback, vntKey, bShift, bControl, bAlt) {
    var objKey;
    if (vntCallback instanceof jsx3.gui.HotKey) {
      objKey = vntCallback;
    } else {
      var fntCallback = typeof(vntCallback) == 'function' ? vntCallback : this[vntCallback];

      if (!(typeof(fntCallback) == "function"))
        throw new jsx3.IllegalArgumentException("vntCallback", vntCallback);

      // will throw exception if vntKey is invalid
      objKey = new jsx3.gui.HotKey(fntCallback, vntKey, bShift, bControl, bAlt);
    }

    if (this._jsxhotkeys == null)
      this._jsxhotkeys = {length:0};

    var keyKey = objKey.getKey();
    // only increment length of hash if we aren't clobbering existing key
    this._jsxhotkeys.length += this._jsxhotkeys[keyKey] ? 0 : 1;

    // clobber existing key
    // QUESTION: should this print a warning?
    this._jsxhotkeys[keyKey] = objKey;

    return objKey;
  };

  /**
   * whether this object has at least one hot key bound to it
   * @private
   */
  Interactive_prototype.hasHotKey = function() {
    return this._jsxhotkeys != null && this._jsxhotkeys.length > 0;
  };

  /**
   * controls whether to paint the necessary event handlers to check for hotkeys whether or not hotkeys are registered at the time of paint; use for objects like JSXROOT that are painted only once or infrequently
   * @package
   */
  Interactive_prototype.setAlwaysCheckHotKeys = function(bCheck) {
    this.jsxalwayscheckhk = bCheck;
    return this;
  };

  /**
   * @package
   */
  Interactive_prototype.getAlwaysCheckHotKeys = function() {
    return this.jsxalwayscheckhk;
  };

  /**
   * remove all hotkeys bound to this object
   * @private
   */
  Interactive_prototype.clearHotKeys = function() {
    /* @jsxobf-clobber */
    this._jsxhotkeys = null;
  };

/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Interactive.getVersion = function() {
    return "3.00.00";
  };

/* @JSC :: end */

  /** @package */
  Interactive_prototype.isOldEventProtocol = function() {
    var server = this.getServer();
    return server && server.getEnv("EVENTSVERS") < 3.1;
  };

  /** @private @jsxobf-clobber */
  Interactive_prototype._onInterDestroy = function(objParent) {
    this.doEvent(Interactive.DESTROY, {objPARENT:objParent});
  };

  jsx3.app.Model.jsxclass.addMethodMixin("onDestroy", Interactive.jsxclass, "_onInterDestroy");

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.Interactive
 * @see jsx3.gui.Interactive
 * @jsxdoc-definition  jsx3.Class.defineInterface("jsx3.Event", -, function(){});
 */
jsx3.Event = jsx3.gui.Interactive;

/* @JSC :: end */

/**
 * @package
 */
jsx3.Class.defineClass("jsx3.EventHelp", null, null, function(EventHelp, EventHelp_prototype) {

  EventHelp.ONBEFOREDROP = 0;
  EventHelp.ONDROP = 1;
  EventHelp.ONCANCELDROP = 2;

  EventHelp.DRAGICONINDEX = 32000;
  EventHelp.DEFAULTSPYLEFTOFFSET = 5;
  EventHelp.DEFAULTSPYTOPOFFSET = 5;
  EventHelp.SPYDELAY = 300;
  EventHelp.FLAG = 0;
  /* @jsxobf-clobber */
  EventHelp._dragging = false;

  EventHelp.yOff = 0;
  EventHelp.xOff = 0;

  /* @jsxobf-clobber */
  EventHelp.curDragObject = null;

  EventHelp.beginTrackMouse = function(objEvent) {
    jsx3.gui.Event.subscribe(jsx3.gui.Event.MOUSEMOVE, EventHelp.mouseTracker);
    jsx3.gui.Event.subscribe(jsx3.gui.Event.MOUSEUP, EventHelp.mouseUpTracker);
    //LUKE: removed following to avoid drag icon appearing on a mouse down.  corrupts drag/drop
    //    EventHelp.doMouseMove(objEvent);
  };

  EventHelp.endTrackMouse = function() {
    jsx3.gui.Event.unsubscribe(jsx3.gui.Event.MOUSEMOVE, EventHelp.mouseTracker);
    jsx3.gui.Event.unsubscribe(jsx3.gui.Event.MOUSEUP, EventHelp.mouseUpTracker);
  };

  EventHelp.mouseTracker = function(objEvent) {
    EventHelp.doMouseMove(objEvent.event);
  };

  EventHelp.mouseUpTracker = function(objEvent) {
    EventHelp.reset();
  };

  /**
   * Returns a generic drag icon when a drag is about to occur on a JSX GUI object that does not implement a custom drag icon function of its own
   * @param objGUI {HTMLElement} HTML element that received the mousedown event that initiated the drag
   * @param objJSXTarget {jsx3.gui.Painted} JSX object that received the event
   * @param strDragType {String} JSX_GENERIC
   * @param strDragItemId {String} jsxid for <code>objJSXTarget</code>
   * @return {String} HTML content to follow the mouse pointer during the drag
   */
  EventHelp.drag = function(objGUI, objJSXTarget, strDragType, strDragItemId) {
    var strText = (objGUI && objGUI.innerHTML) ? jsx3.util.strTruncate((objGUI.innerHTML+"").replace(/<[^>]*>/gi," "),25,"...",.5) : "... ... ...";
    return "<span class='jsx30block_drag'>" + strText + "</span>";
  };

  /**
   * called when the user's mouse moves across the screen, but only executes its code if 'jsx3.EVENT.curDragObject' (an object pointer to some on-screen HTML object) != null
   * @param objEvent {jsx3.gui.Event}
   * @private
   */
  EventHelp.doMouseMove = function(objEvent) {
    //only move if drag flag is on (the  || is for legacy development)
    if (EventHelp.FLAG == 1 || EventHelp.FLAG == 3) {
      var doc = EventHelp.curDragObject.ownerDocument;

      if (EventHelp.FLAG == 1) {
        if (! EventHelp.constrainX)
          EventHelp.curDragObject.style.left = objEvent.getTrueX() + EventHelp.xOff + "px";
        if (! EventHelp.constrainY)
          EventHelp.curDragObject.style.top = objEvent.getTrueY() + EventHelp.yOff + "px";
      } else {
        var dX = objEvent.getTrueX() - EventHelp.startX;
        var dY = objEvent.getTrueY() - EventHelp.startY;
        var leftTop = EventHelp["dragRounder"](EventHelp.xOff + dX, EventHelp.yOff + dY, objEvent);

        if (leftTop[0] != EventHelp.offsetLeft || leftTop[1] != EventHelp.offsetTop) {
          if(!isNaN(leftTop[0])) EventHelp.curDragObject.style.left = leftTop[0] + "px";
          if(!isNaN(leftTop[1])) EventHelp.curDragObject.style.top = leftTop[1] + "px";
        }
      }

/*
      //When users drag DIV objects, stop cursor from 'highlighting' on-screen text by giving focus to a hidden image
      if (EventHelp.objMyRange != null && typeof(EventHelp.objMyRange.text) != 'undefined') {
        try {
          EventHelp.objMyRange.moveToElementText(doc.all.body);
          EventHelp.objMyRange.select();
          EventHelp.objMyRange.collapse();
        } catch(e) {
          //if user had cursor in a text box or textarea, this will stop range object selection errors
          try {
            if(jsx3.CLASS_LOADER.IE) doc.selection.empty();
          } catch (e){}
        } finally {
          EventHelp.objMyRange = null;
        }
      }
*/
    } else if (EventHelp.FLAG == 2) {
      var doc = EventHelp.JSXID.getDocument();

      // remove existing drag icon
      var drag = doc.getElementById("_jsxdrag");
      if (drag) jsx3.html.removeNode(drag);

      //get handle to the document body (we will need to reference this multiple times)
      var objBody = doc.getElementsByTagName("body")[0];

      //LUKE: increased due to lost mouse
      EventHelp.xOff = 10;
      EventHelp.yOff = 10;

      //set a selection range (NOTE: this is used by 'doMouseMove()' to stop drag operations from highlighting screen text)
      jsx3.gui.Event.preventSelection(doc);

      //insert this DIV into the document, so the user can see the item they're trying to drag
      var strHTML =  '<div id="_jsxdrag"' + jsx3.html._UNSEL + ' style="position:absolute;left:' +
          ((EventHelp.constrainX) ? parseInt(EventHelp.curDragObject.style.left) : objEvent.getTrueX() + EventHelp.xOff) + 'px;top:' +
          ((EventHelp.constrainY) ? parseInt(EventHelp.curDragObject.style.top) : objEvent.getTrueY() + EventHelp.yOff) +
          'px;min-width:10px;z-index:' + EventHelp.DRAGICONINDEX + ';">' + EventHelp.dragItemHTML + '</div>';
      jsx3.html.insertAdjacentHTML(objBody, 'beforeEnd', strHTML);

      //set 'curDragObject' equal to the drag icon that follows the mouse, then show to user
      EventHelp.curDragObject = doc.getElementById("_jsxdrag");

      //set flag to '1'; this tells the controller to mirror the position of curdragobject to match the deltas in the mouse position
      EventHelp.FLAG = 1;
    } else {
      EventHelp.endTrackMouse();
    }
  };

  /**
   * after a drag, drop, or move operation is complete, this function is called to reset the properties
   *      in this class to NO LONGER point to/reference the item that was just dragged and dropped
   */
  EventHelp.reset = function() {
    //reset values that point to the item being dragged
    EventHelp.DRAGTYPE = null;
    EventHelp.DRAGID = null;
    EventHelp.DRAGIDS = null;
    EventHelp.FLAG = 0;
    EventHelp.endTrackMouse();

    //reset the on-screen item being dragged--if it was a drag drop, destroy the on-screen item.  If a simple move (like dragging a window, just dereference pointer, but don't destroy)
    if (EventHelp.curDragObject) {
      //erase the object that was just dropped if it was a draggable div that should only persist for the life of the drag
      if (EventHelp.curDragObject.id == "_jsxdrag")
        jsx3.html.removeNode(EventHelp.curDragObject);

      //release mouse capture if it's been set and release the object reference
      if (jsx3.CLASS_LOADER.IE) EventHelp.curDragObject.releaseCapture();
      EventHelp.curDragObject = null;

      //remove x/y constraints if any in place
      EventHelp.constrainX = false;
      EventHelp.constrainY = false;
    }
  };

  /**
   * Returns true if a drag/drop operation is underway
   * @return {boolean}
   * @private
   */
  EventHelp.isDragging = function() {
    return EventHelp.curDragObject != null && EventHelp._dragging;
  };

  /**
   * Returns handle to the drag icon (native HTML element)
   * @return {Object}
   * @private
   */
  EventHelp.getDragIcon = function() {
    return EventHelp.curDragObject;
  };

  /**
   * Returns JSX object instance which initiated the drag
   * @return {jsx3.gui.Painted}
   * @private
   */
  EventHelp.getDragSource = function() {
    return EventHelp.JSXID;
  };

  /**
   * Returns the 'type' for the drag. Currently the system identifies any CDF-type drag as being, 'JSX_GENERIC'
   * @return {String}
   * @private
   */
  EventHelp.getDragType = function() {
    return EventHelp.DRAGTYPE;
  };

  /**
   * Returns jsxid for CDF record being dragged
   * @return {String}
   * @private
   */
  EventHelp.getDragId = function() {
    return EventHelp.DRAGID;
  };

  /**
   * Returns array of jsxid(s) for CDF record(s) being dragged.
   * @return {Array<String>}
   * @private
   */
  EventHelp.getDragIds = function() {
    return (jsx3.$A.is(EventHelp.DRAGIDS)) ? EventHelp.DRAGIDS : [EventHelp.DRAGID];
  };

});
