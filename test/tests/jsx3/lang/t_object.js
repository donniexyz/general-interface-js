/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.lang.Object", function(t, jsunit) {

  jsunit.require("jsx3.lang.Class");

  t.testDefined = function() {
    jsunit.assertNotNull(jsx3);
    jsunit.assertNotNull(jsx3.lang);
    jsunit.assertNotNull(jsx3.lang.Object);
    jsunit.assertInstanceOf(jsx3.lang.Object, Function);
  };

  t.testEquals = function() {
    var o = new jsx3.lang.Object();
    jsunit.assertTrue("An object should equal itself.", o.equals(o));
    jsunit.assertFalse(o.equals(1));
    jsunit.assertFalse(o.equals(true));
    jsunit.assertFalse("An object should not equal null.", o.equals(null));
    jsunit.assertFalse("An object should not equal another object.", o.equals(new jsx3.lang.Object()));

    var o1 = new jsx3.lang.Object();
    o1.toString = function() { return "o"; };
    var o2 = new jsx3.lang.Object();
    o2.toString = function() { return "o"; };
    jsunit.assertFalse(o1.equals(o2));
    jsunit.assertFalse(o1.equals("o"));
  };

  t.testGetClass = function() {
    var o = new jsx3.lang.Object();
    jsunit.assertEquals(o.getClass(), jsx3.lang.Object.jsxclass);
  };

  t.testClone = function() {
    var o = new jsx3.lang.Object();
    o.field = "value";
    var o2 = o.clone();

    jsunit.assertEquals(o.field, o2.field);
    jsunit.assertFalse(o.equals(o2));
    jsunit.assertInstanceOf(o2, jsx3.lang.Object);
  };

  t.testInstanceOf = function() {
    var o = new jsx3.lang.Object();
    jsunit.assertTrue(o.instanceOf(jsx3.lang.Object));
    jsunit.assertTrue(o.instanceOf("jsx3.lang.Object"));
    jsunit.assertTrue(o.instanceOf(jsx3.lang.Object.jsxclass));
    jsunit.assertTrue(o.instanceOf(Object));

    jsunit.assertFalse(o.instanceOf(jsx3.lang.Class));
  };

  t.testEval = function() {
    var o = new jsx3.lang.Object();
    o.field = "value";
    jsunit.assertEquals(o.field, o.eval("this.field"));

    var n = 2;
    jsunit.assertEquals(n, o.eval("aVar", {aVar:n}));

    jsunit.assertThrows(function() {
      o.eval("not.defined.at.all");
    });
  };

});
