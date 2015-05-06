/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.lang.Exception", function(t, jsunit) {

  jsunit.require("jsx3.lang.Exception", "jsx3.util.jsxpackage");

  t.testMessage = function() {
    var m = "test exception";
    var e = new jsx3.lang.Exception(m);
    jsunit.assertEquals(m, e.getMessage());
  };

  t.testCause = function() {
    var cause = new jsx3.lang.Exception();
    var e = new jsx3.lang.Exception("test exception", cause);
    jsunit.assertEquals(cause, e.getCause());
  };

  t.testThrows = function() {
    jsunit.assertThrows(function(){
      throw new jsx3.lang.Exception("test exception");
    }, jsx3.lang.Exception);

    jsunit.assertThrows(function(){
      throw new jsx3.lang.Exception("test exception");
    }, jsx3.lang.Object);

    jsunit.assertThrows(function(){
      throw new jsx3.lang.Exception("test exception");
    }, Object);

    jsunit.assertThrows(function(){
      jsunit.assertThrows(function(){
        throw "test exception";
      }, jsx3.lang.Exception);
    }, JsUnitException);
  };

  t.testStack = function() {
    var a = function() { throw new jsx3.lang.Exception("test exception"); };
    var b = function() { a(); };
    var c = function() { b(); };
    var e = null;
    try {
      c();
      jsunit.assert(false);
    } catch (ex) {
      e = ex;
    }

    jsunit.assertInstanceOf(e, jsx3.lang.Exception);
    var s = e.getStack();
    jsunit.assertInstanceOf(s, Array);
    jsunit.assertTrue("Stack should be at least 4 high but is only " + s.length, s.length >= 4);
    jsunit.assertEquals(a, s[0]);
    jsunit.assertEquals(b, s[1]);
    jsunit.assertEquals(c, s[2]);
    jsunit.assertEquals(t.testStack, s[3]);
  };

  t.testIllegalArgument = function() {
    var e = new jsx3.lang.IllegalArgumentException("arg1", null);
    jsunit.assertInstanceOf(e, jsx3.lang.Exception);
  };

  t.testPrintStack = function() {
    var a = function(a,b,c) { throw new jsx3.lang.Exception("test exception"); };
    function b(y,z) { a(); }
    var c = function() { b(); };

    var e = null;
    try {
      c();
      jsunit.assert(false);
    } catch (ex) {
      e = ex;
    }

    var s = e.printStackTrace();
    jsunit.assertTrue("Stack trace should include anonymous function:\n" + s, /at anonymous\(a, b, c\) {/.test(s));
    jsunit.assertTrue("Stack trace should include function b():\n" + s, /at b\(y, z\) {/.test(s));
  };

});
