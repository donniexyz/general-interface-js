/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.util.EventDispatcher", function() {

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.util.EventDispatcher");

  var newED = function() {
    return jsx3.util.EventDispatcher.jsxclass.newInnerClass();
  };

  it("should be able to creat new", function() {
    var ed = newED();
    expect(ed).toBeInstanceOf(jsx3.util.EventDispatcher);
  });

  it("should be able to have object function", function() {
    var ed = newED();
    var o = new Object();
    var f = function() {
      this._called = true;
    };

    ed.subscribe("eventId", o, f);
    expect(o._called).not.toBeDefined();
    ed.publish({subject:"ignoredId"});
    expect(o._called).not.toBeDefined();
    ed.publish({subject:"eventId"});
    expect(o._called).toBeTruthy();
  });

  it("should be able to have object string",function() {
    var ed = newED();
    var o = new Object();
    o.f = function() {
      this._called = true;
    };

    ed.subscribe("eventId", o, "f");
    expect(o._called).not.toBeDefined();
    ed.publish({subject:"eventId"});
    expect(o._called).toBeTruthy();
  });

  it("should be able to publish an event to subscribed objects", function() {
    var ed = newED();
    var count = 0;
    var f = function() {
      count++;
    };

    ed.subscribe("eventId", f);
    expect(count).toEqual(0);
    ed.publish({subject:"eventId"});
    expect(count).toEqual(1);
  });

  it("should be able to subscribe to wild card subject '*' that includes all subjects", function() {
    var ed = newED();
    var count = 0;
    var f = function() {
      count++;
    };

    ed.subscribe("*", f);
    expect(count).toEqual(0);
    ed.publish({subject:"sub1"});
    expect(count).toEqual(1);
    ed.publish({subject:"sub2"});
    expect(count).toEqual(2);
  });

  it("should be unsubscribe an object or function form an event published by this object",function() {
    var ed = newED();
    var count1 = 0;
    var f1 = function() {
      count1++;
    };
    var count2 = 0;
    var f2 = function() {
      count2++;
    };

    ed.subscribe("eventId", f1);
    ed.subscribe("eventId", f2);

    ed.publish({subject:"eventId"});
    expect(count1).toEqual(1);
    expect(count2).toEqual(1);

    ed.unsubscribe("eventId", f1);
    ed.publish({subject:"eventId"});
    expect(count1).toEqual(1);
    expect(count2).toEqual(2);
  });

  it("should be able to unsubscribe all subscribed objects to a type of event published by this object", function() {
    var ed = newED();
    var count1 = 0;
    var f1 = function() {
      count1++;
    };
    var count2 = 0;
    var f2 = function() {
      count2++;
    };

    ed.subscribe("eventId", f1);
    ed.subscribe("eventId", f2);

    ed.publish({subject:"eventId"});
    expect(count1).toEqual(1);
    expect(count2).toEqual(1);

    ed.unsubscribeAll("eventId");
    ed.publish({subject:"eventId"});
    expect(count1).toEqual(1);
    expect(count2).toEqual(1);
  });

  it("should be able to unsubscribe all subscrible objects to type of event published by the object", function(){
    var ed = newED();
    var count1 = 0;
    var f1 = function() {
      count1++;
    };
    var count2 = 0;
    var f2 = function() {
      count2++;
    };

    ed.subscribe("eventId1", f1);
    ed.subscribe("eventId2", f2);

    ed.publish({subject:"eventId1"});
    ed.publish({subject:"eventId2"});
    expect(count1).toEqual(1);
    expect(count2).toEqual(1);

    ed.unsubscribeAllFromAll();
    ed.publish({subject:"eventId1"});
    ed.publish({subject:"eventId2"});
    expect(count1).toEqual(1);
    expect(count2).toEqual(1);
  });

  it("should be able to unsubscribe self",function() {
    var ed = newED();
    var count1 = 0;
    var f1 = function() {
      count1++;
      ed.unsubscribe("eventId", f1);
    };
    var count2 = 0;
    var f2 = function() {
      count2++;
    };

    ed.subscribe("eventId", f1);
    ed.subscribe("eventId", f2);

    ed.publish({subject:"eventId"});
    expect(count1).toEqual(1);
    expect(count2).toEqual(1);

    ed.publish({subject:"eventId"});
    expect(count1).toEqual(1);
    expect(count2).toEqual(2);
  });

  it("should has return value", function() {
    var ed = newED();
    var f1 = function() {};
    var f2 = function() {};

    ed.subscribe("eventId", f1);
    ed.subscribe("eventId", f2);

    var ct = ed.publish({subject:"eventId"});
    expect(ct).toEqual(2);

    ed.unsubscribe("eventId", f1);
    ct = ed.publish({subject:"eventId"});
    expect(ct).toEqual(1);
  });

  it("should has event object", function() {
    var ed = newED();
    var e = null;
    var f1 = function(objEvent) {
      e = objEvent;
    };

    ed.subscribe("eventId", f1);
    ed.publish({subject:"eventId", a1:"v1", a2:"v2"});

    expect(e).not.toBeNull();
    expect(e.subject).toEqual("eventId");
    expect(e.target).toEqual(ed);
    expect(e.a1).toEqual("v1");
    expect(e.a9).not.toBeDefined();
  });

});
