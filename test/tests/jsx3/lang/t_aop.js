/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.lang.AOP", function(t, jsunit) {

  jsunit.require("jsx3.lang.AOP");

  t.testDefined = function() {
    jsunit.assertNotNull(jsx3);
    jsunit.assertNotNull(jsx3.lang);
    jsunit.assertNotNull(jsx3.lang.AOP);
  };

  t.testBefore = function() {
    var c1 = false, c2 = false;

    jsx3.lang.Class.defineClass("test.C1", null, null, function(C, P){
      P.m = function(a, b, c) {
        jsunit.assertTrue(c2);
        jsunit.assertEquals(1, a);
        jsunit.assertEquals(2, b);
        jsunit.assertEquals(3, c);
        c1 = true;
      };
    });

    jsx3.lang.AOP.pc("testBefore", {classes:"test.C1", methods:"m"});
    jsx3.lang.AOP.before("testBefore", function(a, b, c) {
      jsunit.assertFalse(c1);
      jsunit.assertEquals(1, a);
      jsunit.assertEquals(2, b);
      jsunit.assertEquals(3, c);
      c2 = true;
    });

    (new test.C1()).m(1, 2, 3);

    jsunit.assertTrue(c1);
    jsunit.assertTrue(c2);
  };
  t.testBefore._tearDown = function() {
    jsx3.lang.AOP.pcrem("testBefore");
    delete test.C1;
  };

  t.testAfter = function() {
    var c1 = false, c2 = false;

    jsunit.assertUndefined(test.C1);

    jsx3.lang.Class.defineClass("test.C1", null, null, function(C, P){
      P.m = function(a, b) {
        jsunit.assertFalse(c2);
        jsunit.assertEquals(1, a);
        jsunit.assertEquals(2, b);
        c1 = true;
        return 10;
      };
    });

    jsx3.lang.AOP.pc("testAfter", {classes:"test.C1", methods:"m"});
    jsx3.lang.AOP.after("testAfter", function(rv, a, b) {
      jsunit.assertTrue("Method should run before advice", c1);
      jsunit.assertEquals(1, a);
      jsunit.assertEquals(2, b);
      jsunit.assertEquals(10, rv);
      c2 = true;
      return 20;
    });

    var v = (new test.C1()).m(1, 2);

    jsunit.assertTrue("Method should have run", c1);
    jsunit.assertTrue("Advice should have run", c2);
    jsunit.assertEquals(10, v);
  };
  t.testAfter._tearDown = function() {
    jsx3.lang.AOP.pcrem("testAfter");
    delete test.C1;
  };

  t.testAround = function() {
    jsx3.lang.Class.defineClass("test.C1", null, null, function(C, P){
      P.m = function(a, b) {
        jsunit.assertEquals(1, a);
        jsunit.assertEquals(5, b);
        return 10;
      };
    });

    jsx3.lang.AOP.pc("testAround", {classes:"test.C1", methods:"m"});
    jsx3.lang.AOP.around("testAround", function(aop, a, b) {
      jsunit.assertEquals(1, a);
      jsunit.assertEquals(2, b);

      var rv = aop.proceed(a, 5);
      jsunit.assertEquals(10, rv);

      return 20;
    });

    var v = (new test.C1()).m(1, 2);
    jsunit.assertEquals(20, v);
  };
  t.testAround._tearDown = function() {
    jsx3.lang.AOP.pcrem("testAround");
    delete test.C1;
  };

  // Bug GI-531
  t.testSubclass = function() {
    var c1 = false, c2 = false, c3 = false;
    
    jsx3.lang.Class.defineClass("test.C1", null, null, function(C, P){
      P.m = function() {
        c1 = true;
      };
    });

    jsx3.lang.Class.defineClass("test.C2", test.C1, null, function(C, P){
      P.m = function() {
        c2 = true;
      };
    });

    jsx3.lang.AOP.pc("testSubclass", {classes:"test.C2", methods:"m"});
    jsx3.lang.AOP.before("testSubclass", function() {
      c3 = true;
    });

    (new test.C2()).m();
    
    jsunit.assertFalse(c1);
    jsunit.assertTrue(c2);
    jsunit.assertTrue(c3);
  };
  t.testSubclass._tearDown = function() {
    jsx3.lang.AOP.pcrem("testSubclass");
    delete test.C1;
    delete test.C2;
  };

});
