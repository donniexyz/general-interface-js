/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.util.MessageFormat", function(t, jsunit) {

  jsunit.require("jsx3.util.MessageFormat", "jsx3.util.Locale", "jsx3.lang.System");

  t.testNew = function() {
    var mf = new jsx3.util.MessageFormat("");
    jsunit.assertInstanceOf(mf, jsx3.util.MessageFormat);
  };

  t.testNewNull = function() {
    jsunit.assertThrows(function(){
      return new jsx3.util.MessageFormat();
    });
  };

  t.testSimple = function() {
    var mf = new jsx3.util.MessageFormat("{0} {1}");
    jsunit.assertEquals("a bcd", mf.format("a", "bcd"));
    jsunit.assertEquals("xy z", mf.format("xy", "z"));
  };

  t.testOutOfOrder = function() {
    var mf = new jsx3.util.MessageFormat("{1} {0}");
    jsunit.assertEquals("bcd a", mf.format("a", "bcd"));
  };

  t.testEmpty = function() {
    var mf = new jsx3.util.MessageFormat("{0}");
    jsunit.assertEquals("{0}", mf.format());
  };

  t.testNull = function() {
    var mf = new jsx3.util.MessageFormat("{0}");
    jsunit.assertEquals("null", mf.format(null));
  };

  t.testObject = function() {
    var mf = new jsx3.util.MessageFormat("{0}");
    var o = new Object();
    o.toString = function() { return "foo"; };
    jsunit.assertEquals("foo", mf.format(o));
  };

  t.testUnQuote = function() {
    var mf = new jsx3.util.MessageFormat("Hello {0}!");
    jsunit.assertEquals("Hello foo!", mf.format("foo"));
  };

  t.testQuote = function() {
    var mf = new jsx3.util.MessageFormat("'{0}' is ''{0}''");
    jsunit.assertEquals("{0} is 'foo'", mf.format("foo"));
  };

  t.testBadFormat = function() {
    jsunit.assertThrows(function() {
      return new jsx3.util.MessageFormat("{x,y} is {0}");
    });
  };

  t.testBadFormat = function() {
    jsunit.assertThrows(function() {
      return new jsx3.util.MessageFormat("{a}");
    });
  };

  t.testLocale1 = function() {
    var l = new jsx3.util.Locale("es");
    var mf = new jsx3.util.MessageFormat("", l);
    jsunit.assertEquals(l, mf.getLocale());
  };

  t.testLocale2 = function() {
    var mf = new jsx3.util.MessageFormat("");
    var l = new jsx3.util.Locale("es");
    mf.setLocale(l);
    jsunit.assertEquals(l, mf.getLocale());
  };

  t.testLocale3 = function() {
    var mf = new jsx3.util.MessageFormat("");
    jsunit.assertEquals(jsx3.lang.System.getLocale(), mf.getLocale());
  };

  t.testDate = function() {
    var mf = null;
    mf = new jsx3.util.MessageFormat("{0,date,short}");
    mf = new jsx3.util.MessageFormat("{0,date,medium}");
    mf = new jsx3.util.MessageFormat("{0,date,long}");
    mf = new jsx3.util.MessageFormat("{0,date,full}");
    mf = new jsx3.util.MessageFormat("{0,date,MM-yyyy}");
    jsunit.assertEquals("01-2007", mf.format(new Date(2007, 0, 1)));
  };

  t.testTime = function() {
    var mf = null;
    mf = new jsx3.util.MessageFormat("{0,time,short}");
    mf = new jsx3.util.MessageFormat("{0,time,medium}");
    mf = new jsx3.util.MessageFormat("{0,time,long}");
    mf = new jsx3.util.MessageFormat("{0,time,full}");
    mf = new jsx3.util.MessageFormat("{0,time,HH:mm}");
    jsunit.assertEquals("08:15", mf.format(new Date(2007, 0, 1, 8, 15, 0)));
  };

  t.testNumber = function() {
    var mf = null;
    mf = new jsx3.util.MessageFormat("{0,number,integer}");
    mf = new jsx3.util.MessageFormat("{0,number,percent}");
    mf = new jsx3.util.MessageFormat("{0,number,currency}");
    mf = new jsx3.util.MessageFormat("{0,number,#0.0}");
    jsunit.assertEquals("10.0", mf.format(10));
  };

});
