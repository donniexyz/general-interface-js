/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.lang.NativeError", function(t, jsunit) {

  jsunit.require("jsx3.lang.NativeError", "jsx3.util.jsxpackage");

  t.testLineNumber = function() {
    var ex = null;
    try {
      var a = jsunit.not.defined.at.all;
    } catch (e) {
      ex = jsx3.lang.NativeError.wrap(e);
    }

    if (ex != null) {
      jsunit.assertEquals(13, ex.getLineNumber()); // depends on line number above
    } else {
      jsunit.assert("Invalid statement did not raise exception.", false);
    }
  };
  // NOTE: Internet Explorer (6?) doesn't provide line number unless the error bubbles all the way to window.onerror
  t.testLineNumber._unless = "GOG IE";

  t.testWrap = function() {
    var ex = null;
    try {
      var a = jsunit.not.defined.at.all;
    } catch (e) {
      ex = jsx3.lang.NativeError.wrap(e);
    }

    if (ex != null) {
      jsunit.assertInstanceOf(ex, jsx3.lang.Exception);
      jsunit.assertInstanceOf(ex, jsx3.lang.NativeError);
    } else {
      jsunit.assert("Invalid statement did not raise exception.", false);
    }

    var e = new jsx3.lang.Exception();
    var wrapped = jsx3.lang.NativeError.wrap(e);
    jsunit.assertEquals(e, wrapped);

    var o = {};
    o.toString = function() { return "an object"; };
    wrapped = jsx3.lang.NativeError.wrap(o);
    jsunit.assertEquals(o.toString(), wrapped.getMessage());

    wrapped = jsx3.lang.NativeError.wrap(123);
    jsunit.assertEquals("123", wrapped.getMessage());
  };

  t.testNew = function() {
    jsunit.assertThrows(function() {
      var e = new jsx3.lang.NativeError({});
    }, jsx3.lang.IllegalArgumentException);
  };

  t.testFileName = function() {
    var ex = null;
    try {
      var a = jsunit.not.defined.at.all;
    } catch (e) {
      ex = jsx3.lang.NativeError.wrap(e);
    }

    if (ex != null) {
      jsunit.assertNotNullOrUndef(ex.getFileName());
      jsunit.assertNotNull(ex.getFileName().match("t_error.js"));
    } else {
      jsunit.assert("Invalid statement did not raise exception.", false);
    }
  };
  // NOTE: Internet Explorer (6?) always reports the host HTML page, not the JS URL.
  t.testFileName._unless = "GOG IE";

  t.testInitCapture = function() {
    // not sure this is going to be possible since we need to get an exception to bubble all the way to the top
    // of the call stack. we could use a timeout but i'm not sure that there is a way to guarantee that the timeout
    // will execute before the next test function is executed.
    // TODO: figure out how to test this
  };
  t.testInitCapture._unless = "SAF";

});
