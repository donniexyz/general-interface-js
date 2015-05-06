/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.util.Locale", function(t, jsunit) {

  jsunit.require("jsx3.util.Locale", "jsx3.lang.System");

  t.testGetLanguage = function() {
    var l = new jsx3.util.Locale("en", "US");
    jsunit.assertEquals("en", l.getLanguage());
    l = new jsx3.util.Locale("es");
    jsunit.assertEquals("es", l.getLanguage());
    l = new jsx3.util.Locale();
    jsunit.assertEquals("", l.getLanguage());
  };

  t.testGetCountry = function() {
    var l = new jsx3.util.Locale("en", "US");
    jsunit.assertEquals("US", l.getCountry());
    l = new jsx3.util.Locale("es");
    jsunit.assertEquals("", l.getCountry());
    l = new jsx3.util.Locale();
    jsunit.assertEquals("", l.getCountry());
  };

  t.testDisplayLanguage = function() {
    var l = new jsx3.util.Locale("en", "US");
    jsunit.assertEquals("English", l.getDisplayLanguage(jsx3.util.Locale.US));
    l = new jsx3.util.Locale("en");
    jsunit.assertEquals("English", l.getDisplayLanguage(jsx3.util.Locale.US));
    l = new jsx3.util.Locale();
    jsunit.assertEquals("", l.getDisplayLanguage(jsx3.util.Locale.US));
  };

  t.testDisplayCountry = function() {
    var l = new jsx3.util.Locale("en", "US");
    jsunit.assertEquals("United States", l.getDisplayCountry(jsx3.util.Locale.US));
    l = new jsx3.util.Locale("en");
    jsunit.assertEquals("", l.getDisplayCountry(jsx3.util.Locale.US));
    l = new jsx3.util.Locale();
    jsunit.assertEquals("", l.getDisplayCountry(jsx3.util.Locale.US));
  };

  t.testDisplayName = function() {
    var l = new jsx3.util.Locale("en", "US");
    jsunit.assertEquals("English (United States)", l.getDisplayName(jsx3.util.Locale.US));
    l = new jsx3.util.Locale("en");
    jsunit.assertEquals("English", l.getDisplayName(jsx3.util.Locale.US));
    l = new jsx3.util.Locale();
    jsunit.assertEquals("", l.getDisplayName(jsx3.util.Locale.US));
  };

  t.testToString = function() {
    var l = new jsx3.util.Locale("en", "US");
    jsunit.assertEquals("en_US", l.toString());
    l = new jsx3.util.Locale("en", "us");
    jsunit.assertEquals("en_US", l.toString());
    l = new jsx3.util.Locale("EN", "us");
    jsunit.assertEquals("en_US", l.toString());
    l = new jsx3.util.Locale("en");
    jsunit.assertEquals("en", l.toString());
    l = new jsx3.util.Locale("en", "");
    jsunit.assertEquals("en", l.toString());
    l = new jsx3.util.Locale();
    jsunit.assertEquals("", l.toString());
  };

  t.testEquals = function() {
    var l = new jsx3.util.Locale("en", "US");
    jsunit.assertTrue(l.equals(l));
    jsunit.assertTrue(l.equals(new jsx3.util.Locale("en", "US")));
    jsunit.assertTrue(l.equals(new jsx3.util.Locale("en", "us")));
    jsunit.assertFalse(l.equals("en_US"));
    jsunit.assertFalse(l.equals(new jsx3.util.Locale("en")));
    jsunit.assertFalse(l.equals(new jsx3.util.Locale("en", "GB")));
    jsunit.assertFalse(l.equals(new jsx3.util.Locale()));
  };

  t.testSearchPath = function() {
    var l = new jsx3.util.Locale("en", "US");
    var p = l.getSearchPath();
    jsunit.assertInstanceOf(p, Array);
    jsunit.assertEquals(3, p.length);
    jsunit.assertEquals(l, p[0]);
    jsunit.assertEquals(new jsx3.util.Locale("en"), p[1]);
    jsunit.assertEquals(new jsx3.util.Locale(), p[2]);

    l = new jsx3.util.Locale("en");
    p = l.getSearchPath();
    jsunit.assertEquals(2, p.length);
    jsunit.assertEquals(l, p[0]);
    jsunit.assertEquals(new jsx3.util.Locale(), p[1]);
  };

});
