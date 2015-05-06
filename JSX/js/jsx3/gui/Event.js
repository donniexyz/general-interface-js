/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber  _jsxfxcb _jsxclone

/**
 * Native browser event wrapper.
 *
 * @since 3.1
 */
jsx3.Class.defineClass("jsx3.gui.Event", null, null, function(Event, Event_prototype) {

  // the following are JavaScript native event types
  /** {String} The browser native event type <code>beforeunload</code>.
   * @final @jsxobf-final */
  Event.BEFOREUNLOAD = "beforeunload";
  /** {String} The browser native event type <code>blur</code>.
   * @final @jsxobf-final */
  Event.BLUR = "blur";
  /** {String} The browser native event type <code>change</code>.
   * @final @jsxobf-final */
  Event.CHANGE = "change";
  /** {String} The browser native event type <code>click</code>.
   * @final @jsxobf-final */
  Event.CLICK = "click";
  /** {String} The browser native event type <code>dblclick</code>.
   * @final @jsxobf-final */
  Event.DOUBLECLICK = "dblclick";
  /** {String} The browser native event type <code>error</code>.
   * @final @jsxobf-final */
  Event.ERROR = "error";
  /** {String} The browser native event type <code>focus</code>.
   * @final @jsxobf-final */
  Event.FOCUS = "focus";
  /** {String} The browser native event type <code>keydown</code>.
   * @final @jsxobf-final */
  Event.KEYDOWN = "keydown";
  /** {String} The browser native event type <code>keypress</code>.
   * @final @jsxobf-final */
  Event.KEYPRESS = "keypress";
  /** {String} The browser native event type <code>keyup</code>.
   * @final @jsxobf-final */
  Event.KEYUP = "keyup";
  /** {String} The browser native event type <code>load</code>.
   * @final @jsxobf-final */
  Event.LOAD = "load";
  /** {String} The browser native event type <code>mousedown</code>.
   * @final @jsxobf-final */
  Event.MOUSEDOWN = "mousedown";
  /** {String} The browser native event type <code>mousemove</code>.
   * @final @jsxobf-final */
  Event.MOUSEMOVE = "mousemove";
  /** {String} The browser native event type <code>mouseout</code>.
   * @final @jsxobf-final */
  Event.MOUSEOUT = "mouseout";
  /** {String} The browser native event type <code>mouseover</code>.
   * @final @jsxobf-final */
  Event.MOUSEOVER = "mouseover";
  /** {String} The browser native event type <code>mouseup</code>.
   * @final @jsxobf-final */
  Event.MOUSEUP = "mouseup";
  /** {String} The browser native event type <code>mousewheel</code>.
   * @final @jsxobf-final */
  Event.MOUSEWHEEL = "mousewheel";
  /** {String} The browser native event type <code>unload</code>.
   * @final @jsxobf-final */
  Event.UNLOAD = "unload";
  /** {String} The browser native event type <code>resize</code>.
   * @final @jsxobf-final */
  Event.RESIZE = "resize";

  /** {int} The browser native key code for the Alt key.
   * @final @jsxobf-final */
  Event.KEY_ALT = 18;
  /** {int} The browser native key code for the down arrow key.
   * @final @jsxobf-final */
  Event.KEY_ARROW_DOWN = 40;
  /** {int} The browser native key code for the left arrow key.
   * @final @jsxobf-final */
  Event.KEY_ARROW_LEFT = 37;
  /** {int} The browser native key code for the right arrow key.
   * @final @jsxobf-final */
  Event.KEY_ARROW_RIGHT = 39;
  /** {int} The browser native key code for the up arrow key.
   * @final @jsxobf-final */
  Event.KEY_ARROW_UP = 38;
  /** {int} The browser native key code for the Backspace key.
   * @final @jsxobf-final */
  Event.KEY_BACKSPACE = 8;
  /** {int} The browser native key code for the Ctrl key.
   * @final @jsxobf-final */
  Event.KEY_CONTROL = 17;
  /** {int} The browser native key code for the Delete key.
   * @final @jsxobf-final */
  Event.KEY_DELETE = 46;
  /** {int} The browser native key code for the End key.
   * @final @jsxobf-final */
  Event.KEY_END = 35;
  /** {int} The browser native key code for the Enter key.
   * @final @jsxobf-final */
  Event.KEY_ENTER = 13;
  /** {int} The browser native key code for the Esc key.
   * @final @jsxobf-final */
  Event.KEY_ESCAPE = 27;
  /** {int} The browser native key code for the Home key.
   * @final @jsxobf-final */
  Event.KEY_HOME = 36;
  /** {int} The browser native key code for the Insert key.
   * @final @jsxobf-final */
  Event.KEY_INSERT = 45;
  /** {int} The browser native key code for the Meta key.
   * @final @jsxobf-final */
  Event.KEY_META = 224;
  /** {int} The browser native key code for the Page Down key.
   * @final @jsxobf-final */
  Event.KEY_PAGE_DOWN = 34;
  /** {int} The browser native key code for the Page Up key.
   * @final @jsxobf-final */
  Event.KEY_PAGE_UP = 33;
  /** {int} The browser native key code for the Shift key.
   * @final @jsxobf-final */
  Event.KEY_SHIFT = 16;
  /** {int} The browser native key code for the space bar key.
   * @final @jsxobf-final */
  Event.KEY_SPACE = 32;
  /** {int} The browser native key code for the Tab key.
   * @final @jsxobf-final */
  Event.KEY_TAB = 9;
  /** {int} The browser native key code for the 0 key.
   * @final @jsxobf-final */
  Event.KEY_0 = 48;
  /** {int} The browser native key code for the 9 key.
   * @final @jsxobf-final */
  Event.KEY_9 = 57;
  /** {int} The browser native key code for the A key.
   * @final @jsxobf-final */
  Event.KEY_A = 65;
  /** {int} The browser native key code for the Z key.
   * @final @jsxobf-final */
  Event.KEY_Z = 90;
  /** {int} The browser native key code for the number pad 0 key.
   * @final @jsxobf-final */
  Event.KEY_NP0 = 96;
  /** {int} The browser native key code for the number pad 9 key.
   * @final @jsxobf-final */
  Event.KEY_NP9 = 105;
  /** {int} The browser native key code for the number pad division (/) key.
   * @final @jsxobf-final */
  Event.KEY_NPDIV = 111;
  /** {int} The browser native key code for the number pad multiply (*) key.
   * @final @jsxobf-final */
  Event.KEY_NPMUL = 106;
  /** {int} The browser native key code for the number pad subtract (-) key.
   * @final @jsxobf-final */
  Event.KEY_NPSUB = 109;
  /** {int} The browser native key code for the number pad addition (+) key.
   * @final @jsxobf-final */
  Event.KEY_NPADD = 107;
  /** {int} The browser native key code for the number pad decimal (.) key.
   * @final @jsxobf-final */
  Event.KEY_NPDEC = 110;
  /** {int} The browser native key code for the F1 key.
   * @final @jsxobf-final */
  Event.KEY_F1 = 112;
  /** {int} The browser native key code for the F15 key.
   * @final @jsxobf-final */
  Event.KEY_F15 = 126;

  /** @private @jsxobf-clobber */
  Event._WINDOWS = [];
  /** @private @jsxobf-clobber */
  Event._WINDOW_EVENTS = [];
  /** @private @jsxobf-clobber */
  Event._DISPATCHER = jsx3.util.EventDispatcher.jsxclass.newInnerClass();
  /** @private @jsxobf-clobber */
  Event._SUBSCRIBED = [];

  var Logger = null;

  /** @private @jsxobf-clobber */
  Event._getLog = function() {
    if (Event._LOG == null) {
      if (jsx3.Class.forName("jsx3.util.Logger") != null) {
        Logger = jsx3.util.Logger;
        Event._LOG = Logger.getLogger(Event.jsxclass.getName());
      }
    }
    return Event._LOG;
  };

  /** @package */
  Event._registerWindow = function(objWindow) {
    var log = Event._getLog();
    if (log != null && log.isLoggable(Logger.DEBUG))
      log.debug("registering window " + objWindow.name);

    Event._WINDOWS.push(objWindow);
    Event._WINDOW_EVENTS.push({});
    Event._SUBSCRIBED.push({});

    // TODO: need to add existing listeners to the new window
  };

  /** @package */
  Event._isWindowRegistered = function(objWindow) {
    return jsx3.util.arrIndexOf(Event._WINDOWS, objWindow) >= 0;
  };

  /** @package */
  Event._deregisterWindow = function(objWindow) {
    var index = jsx3.util.arrIndexOf(Event._WINDOWS, objWindow);
    if (index >= 0) {
      var log = Event._getLog();
      if (log != null && log.isLoggable(Logger.DEBUG))
        log.debug("deregistering window " + objWindow.name);

      Event._WINDOWS.splice(index, 1);
      Event._WINDOW_EVENTS.splice(index, 1);
      Event._SUBSCRIBED.splice(index, 1);

      // TODO: need to remove all listeners from window for GC reasons
    } else {
      throw new jsx3.Exception("Window " + objWindow + " not registered.");
    }
  };

  Event._registerWindow(window);

  /**
   * Subscribes an event handler to events of type <code>strEventId</code> that bubble all the way up to the browser window.
   * @param strEventId {String} the event type, e.g. <code>jsx3.gui.Event.CLICK</code>.
   * @param objHandler {object|String|function} if an object, the instance to notify of events (objFunction is required); if a string, the JSX id of the instance to notify of events (objFunction is required), must exist in the same Server; if a function, the function to call to notify of events (objFunction ignored)
   * @param objFunction {function|String} if objHandler is a string or object then the function to call on that instance. either a function or a string that is the name of a method of the instance
   * @see jsx3.util.EventDispatcher#subscribe()
   */
  Event.subscribe = function(strEventId, objHandler, objFunction) {
    Event._DISPATCHER.subscribe(strEventId, objHandler, objFunction);
    var handler = "on" + strEventId;
    var log = Event._getLog();

    if (log != null && log.isLoggable(Logger.DEBUG))
      log.debug("Subscribing to event " + strEventId + ": " + objHandler.toString().substring(0,50).replace(/\s+/g," "));

    //even though other application windows can subscribe to various events, unload and beforeunload are only listened for in the main application window.
    var arrTargetWindows = Event._isMainWindowEvent(strEventId) ? [window] : Event._WINDOWS;
    for (var i = 0; i < arrTargetWindows.length; i++) {
      try {
        var w = arrTargetWindows[i];
        var owner = Event._getHandlerOwner(w, strEventId);

        if (owner.attachEvent && Event._isAttachable(strEventId)) {
          // IE event subscription plays nice with other frameworks
          var wSubs = Event._SUBSCRIBED[i];
          if (! wSubs[strEventId]) {
            if (log != null && log.isLoggable(Logger.DEBUG))
              log.debug("attaching event listener " + strEventId + " to " + owner + ".");

            owner.attachEvent(handler, Event._eventHandler);
            wSubs[strEventId] = true;
          }
        } else if (owner.addEventListener && Event._isListenable(strEventId)) {
          // FX event subscription plays nice with other frameworks
          var wSubs = Event._SUBSCRIBED[i];
          if (! wSubs[strEventId]) {
            if (log != null && log.isLoggable(Logger.DEBUG))
              log.debug("adding event listener " + strEventId + " to " + owner + ".");

            owner.addEventListener(strEventId, Event._eventHandler, false);
            wSubs[strEventId] = true;
          }
        } else {
          // Backup event subscription plays nice-ish with other frameworks
          var wEvents = Event._WINDOW_EVENTS[i];
          if (owner[handler] != Event._eventHandler) {
            if (log != null && log.isLoggable(Logger.DEBUG))
              log.debug("setting event handler " + handler + " on " + owner + ".");

            if (owner[handler] != null)
              wEvents[handler] = owner[handler];
            owner[handler] = Event._eventHandler;
          }
        }
      } catch (e) {
        if (log != null && log.isLoggable(Logger.DEBUG))
          log.debug("error subscribing to event " + strEventId, jsx3.NativeError.wrap(e));
        Event._deregisterWindow(w); i--;
      }
    }
  };

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {

  /**
   * Subscribes a target to an event that causes the focus to leave a DOM branch. The event is published if a
   * DOM element that is not <code>objParentGUI</code> or a child of <code>objParentGUI</code> gains focus.
   * @param objHandler {Object} the subscriber of the event.
   * @param objParentGUI {jsx3.gui.Painted|HTMLElement} the HTML DOM node that is the root of the branch to monitor.
   * @param objFunction {Function|String} the function or name of the method to call on <code>objHandler</code>.
   * @package
   */
  Event.subscribeLoseFocus = function(objHandler, objParentGUI, objFunction) {
    this.subscribe("focusin", objHandler, function(objEvent) {
      var src = objEvent.event.srcElement();

      if (objParentGUI.containsHtmlElement) {
        if (objParentGUI.containsHtmlElement(src))
          return;
      } else {
        while (src != null) {
          if (src == objParentGUI)
            return;
          src = src.parentNode;
        }
      }

      if (typeof(objFunction) == "function")
        objFunction.call(objHandler, objEvent);
      else
        objHandler[objFunction](objEvent);
    });
  };

  /**
   * Unsubscribes a target subscribed with <code>subscribeLoseFocus()</code>.
   * @param objHandler {Object} the subscriber of the event.
   * @see #subscribeLoseFocus()
   * @package
   */
  Event.unsubscribeLoseFocus = function(objHandler) {
    this.unsubscribe("focusin", objHandler);
  };

  Event.preventSelection = function(objDocument) {
    objDocument.selection ? objDocument.selection.createRange() : "";
  };

/* @JSC */ } else {

  /* @jsxobf-clobber */
  Event._FOCUSREGS = [];

  /* @jsxobf-clobber */
  Event._focusHandler = function(e) {
    var objEvent = Event.wrap(e);
    var target = objEvent.srcElement();
    var reg = Event._FOCUSREGS.concat(); // defensive copy because handlers may remove themselves

    var log = Event._getLog();

    FOR: for (var i = 0; i < reg.length; i++) {
      var record = reg[i];
      var objHandler = record[0];
      var objParentGUI = record[1];
      var objFunction = record[2];
      var src = target;

      if (objParentGUI.containsHtmlElement) {
        if (objParentGUI.containsHtmlElement(target))
          continue;
      } else {
        while (src != null) {
          if (src == objParentGUI)
            continue FOR;
          src = src.parentNode;
        }
      }

      if (log != null && log.isLoggable(Logger.DEBUG))
        log.debug("_focusHandler  lost focus:" + objParentGUI + " (" + objHandler + ")");

      var edEvt = {target:Event, event:objEvent};
      if (typeof(objFunction) == "function")
        objFunction.call(objHandler, edEvt);
      else
        objHandler[objFunction](edEvt);
    }
  };

  Event.subscribeLoseFocus = function(objHandler, objParentGUI, objFunction) {
    var log = Event._getLog();
    if (log != null && log.isLoggable(Logger.DEBUG))
      log.debug("subscribeLoseFocus " + objHandler + " " + objParentGUI);

    Event._FOCUSREGS.push([objHandler, objParentGUI, objFunction]);
    if (Event._FOCUSREGS.length == 1) {
      var objDoc = objParentGUI.ownerDocument || objParentGUI.getDocument();
      if (log != null && log.isLoggable(Logger.DEBUG))
        log.debug("... adding event listener to " + objDoc);
      objDoc.addEventListener("focus", Event._focusHandler, true);
    }
  };

  Event.unsubscribeLoseFocus = function(objHandler) {
    var log = Event._getLog();
    if (log != null && log.isLoggable(Logger.DEBUG))
      log.debug("unsubscribeLoseFocus " + objHandler);

    var objDoc = null;
    for (var i = 0; i < Event._FOCUSREGS.length; i++) {
      if (Event._FOCUSREGS[i][0] == objHandler) {
        var objParentGUI = Event._FOCUSREGS[i][1];
        objDoc = objParentGUI.ownerDocument || objParentGUI.getDocument();
        Event._FOCUSREGS.splice(i--, 1);
      }
    }
    if (Event._FOCUSREGS.length == 0 && objDoc != null) {
      if (log != null && log.isLoggable(Logger.DEBUG))
        log.debug("... removing event listener from " + objDoc);
      objDoc.removeEventListener("focus", Event._focusHandler, true);
    }
  };

  Event.preventSelection = function(objDocument) {
  };

/* @JSC */ }

  /**
   * Unsubscribes an event handler from events of type <code>strEventId</code> that bubble all the way up to the browser window.
   * @param strEventId {String} the event type, e.g. <code>jsx3.gui.Event.CLICK</code>.
   *
   * @see jsx3.util.EventDispatcher#unsubscribe()
   */
  Event.unsubscribe = function(strEventId, objHandler) {
    var log = Event._getLog();
    if (log != null && log.isLoggable(Logger.DEBUG))
      log.debug("Unsubscribing from event " + strEventId + ": " + objHandler.toString().substring(0,50).replace(/\s+/g," "));

    Event._DISPATCHER.unsubscribe(strEventId, objHandler);

    if (Event._DISPATCHER.getSubscriberCount(strEventId) == 0)
      Event._restoreWindowEvent(strEventId);
  };

  /**
   * Unsubscribes all event handlers from a events of type <code>strEventId</code> that bubble all the way up to the browser window. 
   * @param strEventId {String} the event type, e.g. <code>jsx3.gui.Event.CLICK</code>.
   * @see jsx3.util.EventDispatcher#unsubscribeAll()
   */
  Event.unsubscribeAll = function(strEventId) {
    var log = Event._getLog();
    if (log != null && log.isLoggable(Logger.DEBUG))
      log.debug("Unsubscribing all from event " + strEventId + ".");

    Event._DISPATCHER.unsubscribeAll(strEventId);
    Event._restoreWindowEvent(strEventId);
  };

  /**
   * @see jsx3.util.EventDispatcher#publish()
   * @package
   */
  Event.publish = function(objEvent) {
    // QUESTION: should this method end up calling the default window handler (as it will through _publish()) ?
    var objEDEvent = {subject:objEvent.getType(), target:Event, event:objEvent};
    Event._publish(objEDEvent);
  };

  /** @private @jsxobf-clobber */
  Event._publish = function(objEDEvent) {
    var handler = "on" + objEDEvent.subject.toLowerCase();

    var log = Event._getLog();
    if (log != null && log.isLoggable(Logger.TRACE))
      log.trace("Publishing event: " + handler + ".");

    // just publish to the main window ... that will invoke all registered windows anyway
    var wEvents = Event._WINDOW_EVENTS[0];
    if (wEvents[handler] != null)
      wEvents[handler]();

    Event._DISPATCHER.publish(objEDEvent);
  };

  /** @private @jsxobf-clobber */
  Event._eventHandler = function(evt) {
    var e = new Event(evt != null ? evt : window.event);

    var log = Event._getLog();
    if (log != null && log.isLoggable(Logger.TRACE))
      log.trace("Handling event: " + e.getType() + ".");

    if (e.getType() == Event.RESIZE) {
      var w = document.body.offsetWidth,
          h = document.body.offsetHeight;

      if (w === Event._lastResizeW && h === Event._lastResizeH)
        return;

      /* @jsxobf-clobber */
      Event._lastResizeW = w;
      /* @jsxobf-clobber */
      Event._lastResizeH = h;
    }

    var objEDEvent = {subject:e.getType(), target:Event, event:e};
    Event._publish(objEDEvent);

    if (objEDEvent.returnValue)
      return objEDEvent.returnValue;
  };

  /** @private @jsxobf-clobber */
  Event._restoreWindowEvent = function(strEventId) {
    var handler = "on" + strEventId;
    var log = Event._getLog();

    var arrTargetWindows = Event._isMainWindowEvent(strEventId) ? [window] : Event._WINDOWS;
    for (var i = 0; i < arrTargetWindows.length; i++) {
      try {
        var w = arrTargetWindows[i];
        var owner = Event._getHandlerOwner(w, strEventId);

        if (owner.attachEvent && Event._isAttachable(strEventId)) {
          // IE event subscription plays nice with other frameworks
          var wSubs = Event._SUBSCRIBED[i];
          if (wSubs[strEventId]) {
            if (log != null && log.isLoggable(Logger.DEBUG))
              log.debug("detaching event listener " + strEventId + " from " + owner);

            owner.detachEvent(handler, Event._eventHandler);
            wSubs[strEventId] = false;
          }
        } else if (owner.removeEventListener && Event._isListenable(strEventId)) {
          // FX event subscription plays nice with other frameworks
          var wSubs = Event._SUBSCRIBED[i];
          if (wSubs[strEventId]) {
            if (log != null && log.isLoggable(Logger.DEBUG))
              log.debug("removing event listener " + strEventId + " from " + owner + ".");

            owner.removeEventListener(strEventId, Event._eventHandler, false);
            wSubs[strEventId] = false;
          }
        } else {
          var wEvents = Event._WINDOW_EVENTS[i];
          if (log != null && log.isLoggable(Logger.DEBUG))
            log.debug("unsetting event handler " + handler + " on " + owner + ".");

          if (wEvents[handler] != null) {
            owner[handler] = wEvents[handler];
            delete wEvents[handler];
          } else {
            owner[handler] = null;
          }
        }
      } catch (e) {
        if (log != null && log.isLoggable(Logger.DEBUG))
          log.debug("error subscribing to event " + strEventId, jsx3.NativeError.wrap(e));
        Event._deregisterWindow(w); i--;
      }
    }
  };

  /** @private @jsxobf-clobber */
  Event._getHandlerOwner = function(w, strEventId) {
    return (strEventId == Event.BEFOREUNLOAD || strEventId == Event.UNLOAD || strEventId == Event.RESIZE) ?
        w : w.document;
  };

  /** @private @jsxobf-clobber */
  Event._isAttachable = function(strEventId) {
    return strEventId != Event.BEFOREUNLOAD;
  };

  /** @private @jsxobf-clobber */
  Event._isListenable = function(strEventId) {
    return strEventId != Event.BEFOREUNLOAD;
  };

  /** @private @jsxobf-clobber */
  Event._isMainWindowEvent = function(strEventId) {
    //the system only listens for the unload and beforeunload events (by way of subscription via the Event class) on the main app window.
    return strEventId == Event.BEFOREUNLOAD || strEventId == Event.UNLOAD;
  };


  /**
   * Instance initializer.
   * <p/>
   * Internet Explorer: keeps a reference both to the event and a copy of the event's fields so that they can be
   * accessed after the event becomes invalid.
   *
   * @param e {Object} the native browser event object
   * @package
   */
  Event_prototype.init = function(e, bCopy) {
    /* @jsxobf-clobber */
    this._e = e;
    if (bCopy)
      this._clone = jsx3.clone(e);
  };

  Event_prototype.persistEvent = function() {
    if (this._clone == null)
      this._clone = jsx3.clone(this._e);
    this._clone._jsxclone = true;
  };

  /**
   * @package
   */
  Event.wrap = function(objEvent, bCopy) {
    return objEvent instanceof Event ? objEvent : new Event(objEvent, bCopy);
  };

  /**
   * @package
   * @deprecated  Static access to the current event is deprecated and is not guaranteed to work in platforms other
   *    than Internet Explorer.
   */
  Event.getCurrent = function(bCopy) {
    return window.event ? new Event(window.event, bCopy) : null;
  };

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {

  /** @private @jsxobf-clobber */
  Event_prototype._event = function() {
    // IE6 throws an error
    try {
      if (this._e == null)
        return this._clone;
      else if (typeof(this._e.type) == "string") // IE7 sets this to "unknown"
        return this._e;
    } catch (e) {;}

    this._e = null;
    return this._clone;
  };

/* @JSC */ } else if (jsx3.CLASS_LOADER.SAF) {

  Event_prototype._event = function() {
    if (this._e == null)
      return this._clone;
    else
      return this._e;
  };

/* @JSC */ } else {

  /** @private @jsxobf-clobber */
  Event_prototype._event = function() {
    // FX1.5 throws error
    try {
      if (this._e == null)
        return this._clone;
      else if (this._e.currentTarget != null) // FX2 sets this to null
        return this._e;
    } catch (e) {;}

    this._e = null;
    return this._clone;
  };

/* @JSC */ }


  /**
   * Returns a handle to the native browser event object, or the clone of the event.
   * @return {Object} event
   * @private
   */
  Event_prototype.event = function() {
    return this._event();
  };

  /**
   * Returns the type of event, e.g. mousedown, click, etc.
   * @return {String} event type
   */
  Event_prototype.getType = function(){ return this._event().type; };

  /**
   * Returns handle to the HTML element acted upon (click, mousedown, etc).
   * @return {HTMLElement} HTML object
   */
  Event_prototype.srcElement = function(){var e = this._event(); return e.target || e.srcElement;};

  /**
   * Returns handle to the HTML element that was moused over (onmouseover).
   * @return {HTMLElement} HTML object
   */
  Event_prototype.toElement = function(){
    var e = this._event();
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
   return e.toElement;
/* @JSC */ } else {
   return e.type == "mouseout" ? e.relatedTarget : e.target;
/* @JSC */ }
  };

  /**
   * Returns handle to the HTML element that was moused away from (onmouseout).
   * @return {HTMLElement} HTML object
   */
  Event_prototype.fromElement = function(){
    var e = this._event();
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
   return e.fromElement;
/* @JSC */ } else {
   return e.type == "mouseover" ? e.relatedTarget : e.target;
//   return e.relatedTarget;
/* @JSC */ }
  };

  Event_prototype.isMouseEvent = function() {
    var type = this.getType() || "";
    return type.indexOf("mouse") == 0 || type == Event.CLICK || type == Event.DOUBLECLICK;
  };

  Event_prototype.isKeyEvent = function() {
    return (this.getType() || "").indexOf("key") == 0;
  };

  /**
   * Sets event capture
   * @param objGUI {HTMLElement} HTML object for which to set event capture
   * @return {int} keycode
   * @package
   */
  Event_prototype.setCapture = function(objGUI){
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    objGUI.setCapture();
/* @JSC */ } else {
    //to do??
/* @JSC */ }
  };

  /**
   * Releases event capture
   * @param objGUI {HTMLElement} HTML object for which to release event capture
   * @return {int} keycode
   * @package
   */
  Event_prototype.releaseCapture = function(objGUI){
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    objGUI.releaseCapture();
/* @JSC */ } else {
    //to do??
/* @JSC */ }
  };

  /**
   * Returns integer representing the key code of the key just pressed/keyed-down.
   * @return {int} keycode
   */
  Event_prototype.keyCode = function(){var e = this._event(); return e.keyCode;};

  /**
   * Returns the clientX property for the event (where it occurred on-screen).
   * @return {int} pixel position
   */
  Event_prototype.clientX = function(){var e = this._event(); return e ? e.clientX : Number.NaN;};

  /**
   * Returns the clientY property for the event (where it occurred on-screen).
   * @return {int} pixel position
   */
  Event_prototype.clientY = function(){var e = this._event(); return e ? e.clientY : Number.NaN;};

  Event_prototype.getOffsetX = function() {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    return this._event().offsetX - this._event().srcElement.scrollLeft;
/* @JSC */ } else {
    var el = this._event().target;
    var iX = this._event().clientX;
    return iX - jsx3.html.getRelativePosition(el.ownerDocument.body,el).L;
/* @JSC */ }
  };

  Event_prototype.getOffsetY = function() {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    return this._event().offsetY - this._event().srcElement.scrollTop;
/* @JSC */ } else {
    var el = this._event().target;
    var iY = this._event().clientY;
    return iY - jsx3.html.getRelativePosition(el.ownerDocument.body,el).T;
/* @JSC */ }
  };

  Event_prototype.getScreenX = function() {return this._event().screenX;};

  Event_prototype.getScreenY = function() {return this._event().screenY;};

  /**
   * Returns the actual position in the browser from the left edge for where the event occurred.
   * @return {int} pixel position
   */
  Event_prototype.getTrueX = function() {return this._event().clientX;};//screenX - window.screenLeft;};

  /**
   * Returns the actual position in the browser from the top edge for where the event occurred.
   * @return {int} pixel position
   */
  Event_prototype.getTrueY = function() {return this._event().clientY;};//.screenY - window.screenTop;};

  Event_prototype.getWheelDelta = function() {
/* @JSC */ if (jsx3.CLASS_LOADER.IE || jsx3.CLASS_LOADER.SAF) {
    var d = this._event().wheelDelta;
    var wd = d > 0 ? Math.ceil(d / 120) : Math.floor(d / 120);
/* @JSC */ } else {
    var wd = -1 * Math.ceil(this._event().detail/3);
/* @JSC */ }
    return wd;
  };

  /**
   * Returns <code>true</code> if the shift key was pressed.
   * @return {boolean}
   */
  Event_prototype.shiftKey = function(){var e = this._event(); return e.shiftKey;};

  /**
   * Returns <code>true</code> the ctrl key was pressed.
   * @return {boolean}
   */
  Event_prototype.ctrlKey = function(){var e = this._event(); return e.ctrlKey;};

  /**
   * Returns <code>true</code> if the alt key was pressed.
   * @return {boolean}
   */
  Event_prototype.altKey = function(){var e = this._event(); return e.altKey;};

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
  Event_prototype.metaKey = function(){return false;};
/* @JSC */ } else {
  Event_prototype.metaKey = function(){var e = this._event(); return e.metaKey;};
/* @JSC */ }

  /**
   * Returns <code>true</code> if the enter key was pressed.
   * @return {boolean}
   */
  Event_prototype.enterKey = function(){return this._event().keyCode == Event.KEY_ENTER;};

  /**
   * Returns <code>true</code> if the space bar was pressed.
   * @return {boolean}
   */
  Event_prototype.spaceKey = function(){return this._event().keyCode == Event.KEY_SPACE;};

  /**
   * Returns <code>true</code> if the tab key was pressed.
   * @return {boolean}
   */
  Event_prototype.tabKey = function(){return this._event().keyCode == Event.KEY_TAB;};

  /**
   * Returns true if the right-arrow key was pressed
   * @return {boolean}
   */
  Event_prototype.rightArrow = function(){return this._event().keyCode == Event.KEY_ARROW_RIGHT;};

  /**
   * Returns <code>true</code> if the left-arrow key was pressed.
   * @return {boolean}
   */
  Event_prototype.leftArrow = function(){return this._event().keyCode == Event.KEY_ARROW_LEFT;};

  /**
   * Returns <code>true</code> if the up-arrow key was pressed.
   * @return {boolean}
   */
  Event_prototype.upArrow = function(){return this._event().keyCode == Event.KEY_ARROW_UP;};

  /**
   * Returns <code>true</code> if the down-arrow key was pressed.
   * @return {boolean}
   */
  Event_prototype.downArrow = function(){return this._event().keyCode == Event.KEY_ARROW_DOWN;};

  /**
   * Returns <code>true</code> if the delete key was pressed.
   * @return {boolean}
   */
  Event_prototype.deleteKey = function(){return this._event().keyCode == Event.KEY_DELETE;};

  /**
   * Returns <code>true</code> if the backspace key was pressed.
   * @return {boolean}
   */
  Event_prototype.backspaceKey = function(){return this._event().keyCode == Event.KEY_BACKSPACE;};

  /**
   * Returns <code>true</code> if the insert key was pressed.
   * @return {boolean}
   */
  Event_prototype.insertKey = function(){return this._event().keyCode == Event.KEY_INSERT;};

  /**
   * Returns <code>true</code> if the home key was pressed.
   * @return {boolean}
   */
  Event_prototype.homeKey = function(){return this._event().keyCode == Event.KEY_HOME;};

  /**
   * Returns <code>true</code> if the end key was pressed.
   * @return {boolean}
   */
  Event_prototype.endKey = function(){return this._event().keyCode == Event.KEY_END;};

  /**
   * Returns <code>true</code> if the page-up key was pressed.
   * @return {boolean}
   */
  Event_prototype.pageUpKey = function(){return this._event().keyCode == Event.KEY_PAGE_UP;};

  /**
   * Returns <code>true</code> if the page-down key was pressed.
   * @return {boolean}
   */
  Event_prototype.pageDownKey = function(){return this._event().keyCode == Event.KEY_PAGE_DOWN;};

  /**
   * Returns <code>true</code> if the escape key was pressed.
   * @return {boolean}
   */
  Event_prototype.escapeKey = function(){return this._event().keyCode == Event.KEY_ESCAPE;};

/* @JSC :: begin DEP */

  /**
   * Returns <code>true</code> if the native event object is present (if an event of any type actualy occurred).
   * @return {boolean}
   * @deprecated
   */
  Event_prototype.exists = function(){ return this._event() != null;};

/* @JSC :: end */

  /**
   * Cancels event bubbling for the event.
   */
  Event_prototype.cancelBubble = function() {
    var e = this._event();
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    e.cancelBubble = true;
/* @JSC */ } else {
    // HACK: needed for the onmousewheel Fx hack so that each element can cancel bubbling for this type of event
    e._jsxfxcb = true;
    if (! e._jsxclone) e.stopPropagation();
/* @JSC */ }
  };

  /**
   * Cancels the return value for the event.
   */
  Event_prototype.cancelReturn = function(){this._event().returnValue = false;};

  Event_prototype.preventDefault = function(){
    var e = this._event();
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    try {
      e.keyCode = 0;
      e.returnValue = false;
    } catch (e) {}
/* @JSC */ } else {
    if (! e._jsxclone)
      e.preventDefault();
/* @JSC */ }
  };

  /**
   * Cancels the key from firing by setting the keyCode to 0 (zero) for the event.
   */
  Event_prototype.cancelKey = function(){
    var e = this._event();
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    try {
      e.keyCode = 0;
      e.returnValue = false;
    } catch (e) {
      var log = Event._getLog();
      if (log) log.debug("Error canceling key: " + jsx3.NativeError.wrap(e));
    }
/* @JSC */ } else {
    if (! e._jsxclone) {
      e.stopPropagation();
      e.preventDefault();
    }
/* @JSC */ }
  };

  Event_prototype.cancelAll = function() {
    this.cancelBubble();
    this.cancelKey();
    this.cancelReturn();
  };

  /**
   * Returns <code>true</code> if the left-mouse-button was clicked.
   * @return {boolean}
   */
  Event_prototype.leftButton = function() {
    var e = this._event();

    // QUESTION: tricky ... leftButton() and ctrlKey() can't both be true. Is this OK?
    if (jsx3.app.Browser.macosx && e.ctrlKey) return false;

    var type = this.getType();
    if (type == Event.MOUSEDOWN || type == Event.MOUSEUP) {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
      return e.button == (document.documentMode >= 9 ? 0 : 1);
/* @JSC */ } else {
      return e.button == 0;
/* @JSC */ }
    } else if (type == Event.CLICK || type == Event.DOUBLECLICK) {
      return e.button == 0;
    }

    return false;
  };

  /**
   * Returns <code>true</code> if the right-mouse-button was clicked.
   * @return {boolean}
   */
  Event_prototype.rightButton = function() {
    var e = this._event();
    var type = this.getType();
    if (type == Event.MOUSEDOWN || type == Event.MOUSEUP)
      return e.button == 2 || (jsx3.app.Browser.macosx && e.ctrlKey);
    else
      return false;
  };

  /**
   * Returns integer designating the mouse button clicked/moused-down/moused-up; 1 (left), 2 (right), and as supported.
   * @return {int}
   */
  Event_prototype.button = function(){var e = this._event(); return e.button;};

  /**
   * Sets the the return value for the event.
   * @param strReturn {String} string message to set on the returnValue for the event
   */
  Event_prototype.setReturn = function(strReturn){this._event().returnValue = strReturn;};

  /**
   * Sets/updates the keycode for the event.
   * @param intKeyCode {int} keycode
   * @package
   */
  Event_prototype.setKeyCode = function(intKeyCode){
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    this._event().keyCode = intKeyCode;
/* @JSC */ } else {
    var oldEvent = this._event();

    // transmogrify a user-entered key
    if (oldEvent.charCode == Event.KEY_ENTER) {
      var newEvent = this.getDocument().createEvent("KeyEvents");
      newEvent.initKeyEvent("keypress", true, true, this.getDocument().defaultView,
                            oldEvent.ctrlKey(), oldEvent.altKey(), oldEvent.shiftKey(),
                            /*event.metaKey*/false, 0, intKeyCode);
      //cancel the old and fire the new
      oldEvent.preventDefault();
      oldEvent.target.dispatchEvent(newEvent);
    }
/* @JSC */ }
  };

  Event_prototype.isModifierKey = function(){
    var e = this._event();
    return e.keyCode == Event.KEY_SHIFT || e.keyCode == Event.KEY_CONTROL ||
           e.keyCode == Event.KEY_ALT   || e.keyCode == Event.KEY_META;
  };

  Event_prototype.hasModifier = function(bIgnoreShift) {
    return (!bIgnoreShift && this.shiftKey()) || this.ctrlKey() || this.altKey() || this.metaKey();
  };

  /**
   * Whether one of the four arrow keys was pressed.
   * @return {boolean}
   */
  Event_prototype.isArrowKey = function() {
    var kc = this.keyCode();
    return kc >= Event.KEY_ARROW_LEFT && kc <= Event.KEY_ARROW_DOWN;
  };

  /**
   * Whether one of the 15 function keys was pressed.
   * @return {boolean}
   */
  Event_prototype.isFunctionKey = function() {
    var kc = this.keyCode();
    return kc >= Event.KEY_F1 && kc <= Event.KEY_F15;
  };

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {

  Event_prototype.getAttribute = function(strName) {
    return Event.CURRENT_ATTRIBS != null ? Event.CURRENT_ATTRIBS[strName] : null;
  };

  Event_prototype.setAttribute = function(strName, strValue) {
    if (Event.CURRENT_ATTRIBS == null) {
      /* @jsxobf-clobber */
      Event.CURRENT_ATTRIBS = {};
      jsx3.sleep(function() {
        delete Event.CURRENT_ATTRIBS;
      }, "jsx3.gui.Event.setAttribute");
    }
    Event.CURRENT_ATTRIBS[strName] = strValue;
  };

  Event_prototype.removeAttribute = function(strName) {
    if (Event.CURRENT_ATTRIBS != null)
      delete Event.CURRENT_ATTRIBS[strName];
  };

  Event.dispatchMouseEvent = function(objTarget, strType, objParams) {
    var e = objTarget.ownerDocument.createEventObject();
    if (objParams)
      for (var f in objParams)
        e[f] = objParams[f];
    objTarget.fireEvent("on" + strType, e);
  };

  Event.dispatchKeyEvent = function(objTarget, strType, intKey, bShift, bCtrl, bAlt, objParams) {
    var e = objTarget.ownerDocument.createEventObject();
    if (objParams)
      for (var f in objParams)
        e[f] = objParams[f];
    e.keyCode = intKey;
    e.shiftKey = e.shiftLeft = bShift;
    e.ctrlKey = bCtrl;
    e.altKey = bAlt;
    objTarget.fireEvent("on" + strType, e);
  };

/* @JSC */ } else {

  Event_prototype.getAttribute = function(strName) {
    return this._event()[strName];
  };

  Event_prototype.setAttribute = function(strName, strValue) {
    this._event()[strName] = strValue;
  };

  Event_prototype.removeAttribute = function(strName) {
    this._event()[strName] = null;
  };

  Event.dispatchMouseEvent = function(objTarget, strType, objParams) {
    var e = document.createEvent("MouseEvent");
    e.initMouseEvent(strType, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, objTarget);
    if (objParams)
      for (var f in objParams)
        e[f] = objParams[f];
    objTarget.dispatchEvent(e);
  };

  Event.dispatchKeyEvent = function(objTarget, strType, intKey, bShift, bCtrl, bAlt, objParams) {
    var e = document.createEvent("KeyEvent");
    e.initMouseEvent(strType, true, true, window, 0, 0, 0, 0, 0, false, bCtrl, bAlt, bShift, 0, objTarget);
    e.keyCode = intKey;
    if (objParams)
      for (var f in objParams)
        e[f] = objParams[f];
    objTarget.dispatchEvent(e);
  };

/* @JSC */ }
/* @JSC */ if (jsx3.CLASS_LOADER.FX) {

  // HACK: to get onmousewheel to work with Fx
  window.addEventListener("DOMMouseScroll", function(e) {
    var src = e.target || e.srcElement;
    while (src != null && !e._jsxfxcb) {
      if (src.getAttribute) {
        var handler = src.getAttribute("onmousewheel");
        if (handler)
          jsx3.eval.call(src, handler, {event:e});
      }
      src = src.parentNode;
    }
  }, false);

/* @JSC */ }
/* @JSC */ if (jsx3.CLASS_LOADER.SAF) {

  // HACK: to focus to work on div and span, etc
  // Should be fixed in some future (to 3.1) version of Safari since it's fixed in WebKit as of 4/08.
  if (jsx3.CLASS_LOADER.SAF3) {
    Event.subscribe(Event.CLICK, function(e) {
      var src = e.event.srcElement();
      while (src) {
        if (src.getAttribute) {
          var index = src.getAttribute("tabindex");
          if (parseInt(index) >= 0) {
            jsx3.html.focus(src);
            break;
          }

          // This is tricky, but assume that an element that defines a click handler will not need the focus
          // to bubble up. Without something like this, clicking the DatePicker open icon closes it immediately.
          if (src.getAttribute("onclick"))
            break;
        }
        
        src = src.parentNode;
      }
    });
  }

/* @JSC */ }

  /**
   * Returns true if this event is a mouseout event and the destination of the roll out is a descendant of objRoot.
   * @param objRoot {HTMLElement}
   * @return {boolean}
   * @package
   */
  Event_prototype.isFakeOut = function(objRoot) {
    if (this.getType() == "mouseout") {
      var dest = this.toElement();
      // BUG: Fx "Permission denied to get property HTMLDivElement.parentNode"
      try {
        while (dest != null) {
          if (dest == objRoot) return true;
          dest = dest.parentNode;
        }
      } catch (e) {
        return false;
      }
    }

    return false;
  };

  /**
   * Returns true if this event is a mouseover event and the origination of the roll over is a descendant of objRoot.
   * @param objRoot {HTMLElement}
   * @return {boolean}
   * @package
   */
  Event_prototype.isFakeOver = function(objRoot) {
    if (this.getType() == "mouseover") {
      var orig = this.fromElement();
      // BUG: preemptive fix for isFakeOut bug
      try {
        while (orig != null) {
          if (orig == objRoot) return true;
          orig = orig.parentNode;
        }
      } catch (e) {
        return false;
      }
    }

    return false;
  };

  Event_prototype.toString = function() {
    var e = this._event();
    if (e == null) return "@jsx3.gui.Event <empty>";

    var fields = [];
    for (var f in e)
      if (typeof(e[f]) != "function")
        fields[fields.length] = f;
    fields.sort();

    var s = ["@jsx3.gui.Event "];
    for (var i=0; i < fields.length; i++)
      s[s.length] = fields[i] + ":" + e[fields[i]] + " ";

    return s.join("");
  };

});

jsx3.gui.Event.subscribe(jsx3.gui.Event.UNLOAD, jsx3.destroy);
