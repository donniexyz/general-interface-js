/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * An Event Dispatcher mixin interface, adds the ability to register event listeners and dispatch events
 * to those listeners.
 * <p/>
 * (Deprecated) Classes that implement this mixin must also implement a method getServer(), which returns the server in
 * which to look for JSX ids.
 *
 * @since 3.0
 */
jsx3.Class.defineInterface("jsx3.util.EventDispatcher", null, function(EventDispatcher, EventDispatcher_prototype) {
  
  /** @private @jsxobf-clobber */
  EventDispatcher._OBJ_FUNCT = 1;

  /** @private @jsxobf-clobber */
  EventDispatcher._OBJ_STRING = 2;

/* @JSC :: begin DEP */
  /** @private @jsxobf-clobber */
  EventDispatcher._STRING_FUNCT = 3;

  /** @private @jsxobf-clobber */
  EventDispatcher._STRING_STRING = 4;
/* @JSC :: end */

  /** @private @jsxobf-clobber */
  EventDispatcher._FUNCT = 5;
  
  /** @final @jsxobf-final */
  EventDispatcher.SUBJECT_ALL = "*";

  /**
   * Subscribes an object or function to a type of event published by this object.
   * <p/>
   * As of version 3.4 a string value for <code>objHandler</code> is deprecated.
   *
   * @param strEventId {String|Array<String>} the event type(s).
   * @param objHandler {object/string/function} if an object, the instance to notify of events (objFunction is required); if a string, the JSX id of the instance to notify of events (objFunction is required), must exist in the same Server; if a function, the function to call to notify of events (objFunction ignored)
   * @param objFunction {function/string} if objHandler is a string or object then the function to call on that instance. either a function or a string that is the name of a method of the instance
   * @throws {jsx3.IllegalArgumentException} if objHandler/objFunction are not a valid combination of types
   */
  EventDispatcher_prototype.subscribe = function(strEventId, objHandler, objFunction) {
    var type1 = typeof(objHandler);
    var type2 = typeof(objFunction);
    
    var toAdd = null;
    if (type1 == "object" || type1 == "function") {
      if (type2 == "function") {
        toAdd = [EventDispatcher._OBJ_FUNCT, objHandler, objFunction];
      } else if (type2 == "string") {
        toAdd = [EventDispatcher._OBJ_STRING, objHandler, objFunction];
      } else if (type1 == "function") {
        toAdd = [EventDispatcher._FUNCT, objHandler];
      }
/* @JSC :: begin DEP */
    } else if (type1 == "string") {
      if (type2 == "function") {
        toAdd = [EventDispatcher._STRING_FUNCT, objHandler, objFunction];
      } else if (type2 == "string") {
        toAdd = [EventDispatcher._STRING_STRING, objHandler, objFunction];
      }
/* @JSC :: end */
    }
    
    // HACK: function subscriptions coming from other browser windows will be reported as type "object" in IE
    if (toAdd == null && (type1 == "object" && objHandler.call && objHandler.apply))
      toAdd = [EventDispatcher._FUNCT, objHandler];
    
    if (toAdd == null) {
      throw new jsx3.IllegalArgumentException("objHandler, objFunction",
          "{" + typeof(objHandler) + "}, {" + typeof(objFunction) + "}");
    }
    
    if (!jsx3.$A.is(strEventId)) strEventId = [strEventId];
    
    for (var i = 0; i < strEventId.length; i++) {
      var registry = this._getEventRegistry();
      var eventId = strEventId[i];
      
      if (!registry[eventId])
        registry[eventId] = [toAdd];
      else
        registry[eventId].push(toAdd);
    }
  };

  /**
   * Unsubscribe an object or function from an event published by this object.
   * <p/>
   * As of version 3.4 a string value for <code>objHandler</code> is deprecated.
   *
   * @param strEventId {String|Array<String>} the event type(s).
   * @param objHandler {object|string|function} the value of objHandler passed to subscribe
   */
  EventDispatcher_prototype.unsubscribe = function(strEventId, objHandler) {
    if (!jsx3.$A.is(strEventId)) strEventId = [strEventId];
    
    for (var i = 0; i < strEventId.length; i++) {
      var queue = this._getEventRegistry()[strEventId[i]];
      if (queue) {
        for (var j = 0; j < queue.length; j++) {
          if (queue[j][1] === objHandler)
            queue.splice(j--, 1);
        }
      }
    }
  };

  /**
   * Unsubscribes all subscribed objects to a type of event published by this object.
   * @param strEventId {String} the event type
   */
  EventDispatcher_prototype.unsubscribeAll = function(strEventId) {
    if (this._jsxeventreg)
      delete this._jsxeventreg[strEventId];
  };

  EventDispatcher_prototype.unsubscribeAllFromAll = function() {
    this._jsxeventreg = {};
  };
  
  /**
   * Publishes an event to all subscribed objects.
   * @param objEvent {object} the event, should have at least a field 'subject' that is the event id, another common field is 'target' (target will default to this instance)
   * @return {int} the number of listeners to which the event was broadcast
   * @throws {jsx3.IllegalArgumentException} objEvent is not an object with a <code>subject</code> property
   */
  EventDispatcher_prototype.publish = function(objEvent) {
    // always set the event target
    if (objEvent.target == null)
      objEvent.target = this;
    
    var strEventId = objEvent.subject;
    if (strEventId == null)
      throw new jsx3.IllegalArgumentException("objEvent", objEvent);
    
    var reg = this._jsxeventreg;

    if (!reg) return;

    var q1 = reg[strEventId];
    var q2 = reg[EventDispatcher.SUBJECT_ALL];

    if (!q1 && !q2) return;

    // defensive copy: subscribers may unsubscribe themselves
    var queue = [];
    if (q1) queue.push.apply(queue, q1);
    if (q2) queue.push.apply(queue, q2);

    for (var i = 0; i < queue.length; i++) {
      var item = queue[i];
      var type = item[0];
      var target = item[1];
      var method = item[2];

      if (type == EventDispatcher._OBJ_FUNCT) {
        method.call(target, objEvent);
      } else if (type == EventDispatcher._OBJ_STRING) {
        target[method](objEvent);
/* @JSC :: begin DEP */
      } else if (type == EventDispatcher._STRING_FUNCT) {
        var objJSX = this.getServer().getJSX(target);
        if (objJSX)
          method.call(objJSX, objEvent);
      } else if (type == EventDispatcher._STRING_STRING) {
        var objJSX = this.getServer().getJSX(target);
        if (objJSX)
          objJSX[method](objEvent);
/* @JSC :: end */
      } else if (type == EventDispatcher._FUNCT) {
        target.call(null, objEvent);
      } else {
        // assert false
      }
    }
    
    return queue.length;
  };
  
  EventDispatcher_prototype.getSubscriberCount = function(strEventId) {
    var list = this._getEventRegistry()[strEventId];
    return list ? list.length : 0;
  };
  
  /** @private @jsxobf-clobber */
  EventDispatcher_prototype._getEventRegistry = function() {
    if (this._jsxeventreg == null)
      this._jsxeventreg = {};
    return this._jsxeventreg;
  };

});

jsx3.util.EventDispatcher.jsxclass.mixin(jsx3);

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.util.EventDispatcher
 * @see jsx3.util.EventDispatcher
 * @jsxdoc-definition  jsx3.Class.defineInterface("jsx3.EventDispatcher", -, function(){});
 */
jsx3.EventDispatcher = jsx3.util.EventDispatcher;

/* @JSC :: end */
