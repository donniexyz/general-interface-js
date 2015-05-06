/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.util", function(t, jsunit) {

  jsunit.require("jsx3.util.jsxpackage");

  t.testNumMod = function() {
    jsunit.assertEquals(1, jsx3.util.numMod(1, 4));
    jsunit.assertEquals(1, jsx3.util.numMod(5, 4));
    jsunit.assertEquals(1, jsx3.util.numMod(-3, 4));
    jsunit.assertEquals(0, jsx3.util.numMod(-1, 1));
    jsunit.assertEquals(0, jsx3.util.numMod(-4, 4));
  };

  t.testNumIsNan = function() {
    jsunit.assertTrue(jsx3.util.numIsNaN(Number.NaN));
    jsunit.assertTrue(jsx3.util.numIsNaN(null));
    jsunit.assertTrue(jsx3.util.numIsNaN(parseInt("abc")));
    jsunit.assertFalse(jsx3.util.numIsNaN(1));
    jsunit.assertTrue(jsx3.util.numIsNaN(Number.INFINITY));
  };

  t.testNumRound = function() {
    jsunit.assertEquals(100, jsx3.util.numRound(120, 100));
    jsunit.assertEquals(1, jsx3.util.numRound(0.99, 1));
    jsunit.assertEquals(1, jsx3.util.numRound(0.99, .1));
    jsunit.assertEquals(.99, jsx3.util.numRound(0.99, .01));
    jsunit.assertEquals(10, jsx3.util.numRound(5, 10));
    jsunit.assertEquals(10, jsx3.util.numRound(5.01, 10));
    jsunit.assertEquals(0, jsx3.util.numRound(4.99, 10));
    jsunit.assertEquals(6, jsx3.util.numRound(5.75, 2));
  };

  t.testStrEmpty = function() {
    jsunit.assertTrue(jsx3.util.strEmpty(null));
    jsunit.assertTrue(jsx3.util.strEmpty(""));
    jsunit.assertFalse(jsx3.util.strEmpty(0));
    jsunit.assertFalse(jsx3.util.strEmpty("0"));
    jsunit.assertFalse(jsx3.util.strEmpty(" "));
    jsunit.assertFalse(jsx3.util.strEmpty("abc"));
  };

  t.testStrTrim = function() {
    jsunit.assertEquals("abc", jsx3.util.strTrim("abc"));
    jsunit.assertEquals("bcd", jsx3.util.strTrim(" bcd"));
    jsunit.assertEquals("cde", jsx3.util.strTrim("cde "));
    jsunit.assertEquals("def", jsx3.util.strTrim(" def "));
    jsunit.assertEquals("efg", jsx3.util.strTrim(" \t efg"));
    jsunit.assertEquals("fgh", jsx3.util.strTrim("\nfgh\n \n\n"));
  };

  t.testStrEscapeHtml = function() {
    jsunit.assertEquals("abc", jsx3.util.strEscapeHTML("abc"));
    jsunit.assertEquals("&lt;t a=&quot;v&quot;/&gt;&amp;#160;", jsx3.util.strEscapeHTML('<t a="v"/>&#160;'));
  };

  t.testStrTruncate = function() {
    jsunit.assertEquals("abc", jsx3.util.strTruncate("abc", 10));
    jsunit.assertEquals("abcdefghij", jsx3.util.strTruncate("abcdefghij", 10));
    jsunit.assertEquals("abcdef...", jsx3.util.strTruncate("abcdefghij", 9));
    jsunit.assertEquals("abcdefg..", jsx3.util.strTruncate("abcdefghij", 9, ".."));
    jsunit.assertEquals("abc..hij", jsx3.util.strTruncate("abcdefghij", 8, "..", .5));
    jsunit.assertEquals("..efghij", jsx3.util.strTruncate("abcdefghij", 8, "..", 0));
  };

  t.testStrEndsWith = function() {
    jsunit.assertTrue(jsx3.util.strEndsWith("abc", "c"));
    jsunit.assertTrue(jsx3.util.strEndsWith("abc", "bc"));
    jsunit.assertTrue(jsx3.util.strEndsWith("abc", "abc"));
    jsunit.assertTrue(jsx3.util.strEndsWith("abc/", "/"));
    jsunit.assertFalse(jsx3.util.strEndsWith("abc", "\\w"));
    jsunit.assertFalse(jsx3.util.strEndsWith("abc", "C"));
  };

  t.testStrEncodeBase64 = function() {
    jsunit.assertEquals("YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=", jsx3.util.strEncodeBase64("abcdefghijklmnopqrstuvwxyz"));
    jsunit.assertEquals("MQ==", jsx3.util.strEncodeBase64("1"));
    jsunit.assertEquals("MTI=", jsx3.util.strEncodeBase64("12"));
    jsunit.assertEquals("MTIz", jsx3.util.strEncodeBase64("123"));
  };

  t.testStrDecodeBase64 = function() {
    jsunit.assertEquals("abcdefghijklmnopqrstuvwxyz", jsx3.util.strDecodeBase64("YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo="));
    jsunit.assertEquals("1", jsx3.util.strDecodeBase64("MQ=="));
    jsunit.assertEquals("12", jsx3.util.strDecodeBase64("MTI="));
    jsunit.assertEquals("123", jsx3.util.strDecodeBase64("MTIz"));
  };

  t.testArrIndexOf = function() {
    var l = ["a", "b", "c", "c"];
    jsunit.assertEquals(2, jsx3.util.arrIndexOf(l, "c"));
    jsunit.assertEquals(-1, jsx3.util.arrIndexOf(l, "z"));

    l = [1, 2, 3, 4];
    jsunit.assertEquals(2, jsx3.util.arrIndexOf(l, 3));
    jsunit.assertEquals(-1, jsx3.util.arrIndexOf(l, "3"));

    var o = new Object();
    l = [new Object(), new Object(), o, new Object()];
    jsunit.assertEquals(2, jsx3.util.arrIndexOf(l, o));
    jsunit.assertEquals(-1, jsx3.util.arrIndexOf(l, new Object()));
  };

  t.testCompareVersions = function() {
    jsunit.assertEquals("1 <=> 1", 0, jsx3.util.compareVersions("1", "1"));
    jsunit.assertEquals("1.1 <=> 1.1", 0, jsx3.util.compareVersions("1.1", "1.1"));
    jsunit.assertEquals("1.1 <=> 1.1.0", 0, jsx3.util.compareVersions("1.1", "1.1.0"));
    jsunit.assertEquals("2 <=> 1", 1, jsx3.util.compareVersions("2", "1"));
    jsunit.assertEquals("1.2 <=> 1.1", 1, jsx3.util.compareVersions("1.2", "1.1"));
    jsunit.assertEquals("1 <=> 2", -1, jsx3.util.compareVersions("1", "2"));
    jsunit.assertEquals("1.1 <=> 1.2", -1, jsx3.util.compareVersions("1.1", "1.2"));
    jsunit.assertEquals("1a <=> 1", 1, jsx3.util.compareVersions("1a", "1"));
    jsunit.assertEquals("1a <=> 1b", -1, jsx3.util.compareVersions("1a", "1b"));
    jsunit.assertEquals("1.10 <=> 1.9", 1, jsx3.util.compareVersions("1.10", "1.9"));
  };

});
