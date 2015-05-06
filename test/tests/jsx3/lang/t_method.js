/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.lang.Method", function(t, jsunit) {

  jsunit.require("jsx3.lang.Class", "jsx3.lang.Exception", "jsx3.util.jsxpackage");

  t._setUp = function() {
    jsx3.lang.Class.defineClass("test.jsx3Method", null, null, function(C, P){
      P.init = function() {};
      P.function1 = function(arg1, arg2, arg3) { return this.getValue() + arg1 + arg2; };
      P.getValue = function() { return this.value; };
      P.abstractFunction = jsx3.lang.Method.newAbstract("arg1", "arg2");
      C.staticFunction = function(arg1) { return arg1 * 2; };
    });
  };

  t._tearDown = function() {
    delete test.jsx3Method.jsxclass;
    delete test.jsx3Method;
  };

  t.testDefined = function() {
    jsunit.assertNotNull(jsx3);
    jsunit.assertNotNull(jsx3.lang);
    jsunit.assertNotNull(jsx3.lang.Method);
  };

  t.testNew = function() {
    jsunit.assertThrows(function() {
      return new jsx3.lang.Method();
    });
  };

  t.testMetaData = function() {
    jsunit.assertInstanceOf(test.jsx3Method.prototype.function1.jsxmethod, jsx3.lang.Method);
  };

  t.testName = function() {
    jsunit.assertEquals(test.jsx3Method.prototype.function1.jsxmethod.getName(), "function1");
  };

  t.testParams = function() {
    var m = test.jsx3Method.prototype.function1.jsxmethod;
    jsunit.assertEquals(m.getArity(), 3);
    var params = m.getParameterNames();
    jsunit.assertEquals(params.length, 3);
    jsunit.assertEquals(params[0], "arg1");
    jsunit.assertEquals(params[1], "arg2");
    jsunit.assertEquals(params[2], "arg3");
    jsunit.assertEquals(m.getParameterName(1), "arg2");
  };

  t.testClass = function() {
    var m = test.jsx3Method.prototype.function1.jsxmethod;
    jsunit.assertEquals(m.getDeclaringClass(), test.jsx3Method.jsxclass);
    jsunit.assertFalse(m.isPackageMethod());
  };

  t.testStatic = function() {
    var m1 = test.jsx3Method.prototype.function1.jsxmethod;
    var m2 = test.jsx3Method.staticFunction.jsxmethod;

    jsunit.assertFalse(m1.isStatic());
    jsunit.assertTrue(m2.isStatic());
  };

  t.testAbstract = function() {
    var m = test.jsx3Method.prototype.abstractFunction.jsxmethod;

    jsunit.assertFalse(test.jsx3Method.prototype.function1.jsxmethod.isAbstract());
    jsunit.assertFalse(test.jsx3Method.staticFunction.jsxmethod.isAbstract());
    jsunit.assertTrue(m.isAbstract());

    var params = m.getParameterNames();
    jsunit.assertEquals(params.length, 2);
    jsunit.assertEquals(params[0], "arg1");
    jsunit.assertEquals(params[1], "arg2");

    var o = new test.jsx3Method();
    jsunit.assertThrows(function() {
      o.abstractFunction();
    });
  };

  t.testNative = function() {
    jsunit.assertEquals(test.jsx3Method.prototype.function1.jsxmethod.getFunction(), test.jsx3Method.prototype.function1);
    jsunit.assertEquals(test.jsx3Method.staticFunction.jsxmethod.getFunction(), test.jsx3Method.staticFunction);
  };

  t.testCall = function() {
    var o = new test.jsx3Method();
    o.value = 10;

    var m = test.jsx3Method.prototype.function1.jsxmethod;
    jsunit.assertEquals(m.apply(o, [7,11,3]), 28);
    jsunit.assertEquals(m.call(o, 7, 11, 3), 28);

    jsunit.assertThrows(function() {
      m.apply(null, [7,11,3]);
    });

    jsunit.assertThrows(function() {
      m.call(null, 7, 11, 3);
    });
  };

});
