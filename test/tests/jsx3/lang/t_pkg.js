/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.lang", function(t, jsunit) {

  jsunit.require("jsx3.lang.getCaller");

  t.testGetCaller = function() {
    var a = function() {
      return jsx3.lang.getCaller();
    };
    var b = function() { return a(); };
    var c = function() { return a(); };

    jsunit.assertEquals(b, b());
    jsunit.assertEquals(c, c());
  };

  t.testGetCallerUp = function() {
    var a = function() {
      return jsx3.lang.getCaller(1);
    };
    var x = function() { return a(); };
    var b = function() { return x(); };
    var c = function() { return x(); };

    jsunit.assertEquals(b, b());
    jsunit.assertEquals(c, c());
  };

  t.testStack = function() {
    var a = function() {
      return jsx3.lang.getStack();
    };
    var b = function() { return a(); };
    var c = function() { return b(); };

    var stack = c();
    jsunit.assertInstanceOf(stack, Array);
    jsunit.assert("Stack length should be at least 2", stack.length >= 2);
    jsunit.assertEquals(b, stack[0]);
    jsunit.assertEquals(c, stack[1]);
  };

  t.testStackUp = function() {
    var a = function() {
      return jsx3.lang.getStack(-1);
    };
    var b = function() { return a(); };
    var c = function() { return b(); };

    var stack = c();
    jsunit.assertInstanceOf(stack, Array);
    jsunit.assert("Stack length should be at least 3", stack.length >= 3);
    jsunit.assertEquals(a, stack[0]);
    jsunit.assertEquals(b, stack[1]);
    jsunit.assertEquals(c, stack[2]);
  };

});
