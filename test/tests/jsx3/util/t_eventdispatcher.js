/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.util.EventDispatcher", function(t, jsunit) {

  jsunit.require("jsx3.util.EventDispatcher");

  var newED = function() {
    return jsx3.util.EventDispatcher.jsxclass.newInnerClass();
  };

  t.testNew = function() {
    var ed = newED();
    jsunit.assertInstanceOf(ed, jsx3.util.EventDispatcher);
  };

  t.testObjectFunction = function() {
    var ed = newED();
    var o = new Object();
    var f = function() {
      this._called = true;
    };

    ed.subscribe("eventId", o, f);
    jsunit.assertUndefined(o._called);
    ed.publish({subject:"ignoredId"});
    jsunit.assertUndefined(o._called);
    ed.publish({subject:"eventId"});
    jsunit.assertTrue(o._called);
  };

  t.testObjectString = function() {
    var ed = newED();
    var o = new Object();
    o.f = function() {
      this._called = true;
    };

    ed.subscribe("eventId", o, "f");
    jsunit.assertUndefined(o._called);
    ed.publish({subject:"eventId"});
    jsunit.assertTrue(o._called);
  };

  t.testFunction = function() {
    var ed = newED();
    var count = 0;
    var f = function() {
      count++;
    };

    ed.subscribe("eventId", f);
    jsunit.assertEquals(0, count);
    ed.publish({subject:"eventId"});
    jsunit.assertEquals(1, count);
  };

  t.testStar = function() {
    var ed = newED();
    var count = 0;
    var f = function() {
      count++;
    };

    ed.subscribe("*", f);
    jsunit.assertEquals(0, count);
    ed.publish({subject:"sub1"});
    jsunit.assertEquals(1, count);
    ed.publish({subject:"sub2"});
    jsunit.assertEquals(2, count);
  };

  t.testUnsubscribe = function() {
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
    jsunit.assertEquals(1, count1);
    jsunit.assertEquals(1, count2);

    ed.unsubscribe("eventId", f1);
    ed.publish({subject:"eventId"});
    jsunit.assertEquals(1, count1);
    jsunit.assertEquals(2, count2);
  };

  t.testUnsubscribeAll = function() {
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
    jsunit.assertEquals(1, count1);
    jsunit.assertEquals(1, count2);

    ed.unsubscribeAll("eventId");
    ed.publish({subject:"eventId"});
    jsunit.assertEquals(1, count1);
    jsunit.assertEquals(1, count2);
  };

  t.testUnsubscribeAllFromAll = function() {
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
    jsunit.assertEquals(1, count1);
    jsunit.assertEquals(1, count2);

    ed.unsubscribeAllFromAll();
    ed.publish({subject:"eventId1"});
    ed.publish({subject:"eventId2"});
    jsunit.assertEquals(1, count1);
    jsunit.assertEquals(1, count2);
  };

  t.testUnsubscribeSelf = function() {
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
    jsunit.assertEquals(1, count1);
    jsunit.assertEquals(1, count2);

    ed.publish({subject:"eventId"});
    jsunit.assertEquals(1, count1);
    jsunit.assertEquals(2, count2);
  };

  t.testReturnValue = function() {
    var ed = newED();
    var f1 = function() {};
    var f2 = function() {};

    ed.subscribe("eventId", f1);
    ed.subscribe("eventId", f2);

    var ct = ed.publish({subject:"eventId"});
    jsunit.assertEquals(2, ct);

    ed.unsubscribe("eventId", f1);
    ct = ed.publish({subject:"eventId"});
    jsunit.assertEquals(1, ct);
  };

  t.testEventObject = function() {
    var ed = newED();
    var e = null;
    var f1 = function(objEvent) {
      e = objEvent;
    };

    ed.subscribe("eventId", f1);
    ed.publish({subject:"eventId", a1:"v1", a2:"v2"});

    jsunit.assertNotNull(e);
    jsunit.assertEquals("eventId", e.subject);
    jsunit.assertEquals(ed, e.target);
    jsunit.assertEquals("v1", e.a1);
    jsunit.assertUndefined(e.a9);
  };

});
