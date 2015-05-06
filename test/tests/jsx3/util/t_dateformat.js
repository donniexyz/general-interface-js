/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.util.DateFormat", function(t, jsunit) {

  jsunit.require("jsx3.util.DateFormat", "jsx3.util.Locale", "jsx3.lang.System");

  t.testDateInstance = function() {
    var l = new jsx3.util.Locale("xx");
    var df = jsx3.util.DateFormat.getDateInstance(null, l);
    jsunit.assertInstanceOf(df, jsx3.util.DateFormat);
    jsunit.assertEquals(l, df.getLocale());
    jsunit.assert("Date instance should include 'y'", df.getFormat().indexOf("y") >= 0);
    jsunit.assert("Date instance should include 'M'", df.getFormat().indexOf("M") >= 0);
  };

  t.testTimeInstance = function() {
    var l = new jsx3.util.Locale("xx");
    var df = jsx3.util.DateFormat.getTimeInstance(null, l);
    jsunit.assertInstanceOf(df, jsx3.util.DateFormat);
    jsunit.assertEquals(l, df.getLocale());
    jsunit.assert("Time instance should include 'H' or 'h'", df.getFormat().indexOf("H") >= 0 || df.getFormat().indexOf("h") >= 0);
    jsunit.assert("Time instance should include 'mm'", df.getFormat().indexOf("mm") >= 0);
  };

  t.testDateTimeInstance = function() {
    var l = new jsx3.util.Locale("xx");
    var df = jsx3.util.DateFormat.getDateTimeInstance(null, null, l);
    jsunit.assertInstanceOf(df, jsx3.util.DateFormat);
    jsunit.assertEquals(l, df.getLocale());
    jsunit.assert(df.getFormat().indexOf("y") >= 0);
    jsunit.assert(df.getFormat().indexOf("H") >= 0 || df.getFormat().indexOf("h") >= 0);
    jsunit.assert(df.getFormat().indexOf("mm") >= 0);
  };

  t.testNew = function() {
    var mf = new jsx3.util.DateFormat("");
    jsunit.assertInstanceOf(mf, jsx3.util.DateFormat);
  };

  t.testNewNull = function() {
    jsunit.assertThrows(function(){
      return new jsx3.util.DateFormat();
    });
  };

  t.testLocale1 = function() {
    var l = new jsx3.util.Locale("es");
    var mf = new jsx3.util.DateFormat("", l);
    jsunit.assertEquals(l, mf.getLocale());
  };

  t.testLocale2 = function() {
    var mf = new jsx3.util.DateFormat("");
    var l = new jsx3.util.Locale("es");
    mf.setLocale(l);
    jsunit.assertEquals(l, mf.getLocale());
  };

  t.testLocale3 = function() {
    var mf = new jsx3.util.DateFormat("");
    jsunit.assertEquals(jsx3.lang.System.getLocale(), mf.getLocale());
  };

  t.testGetFormat = function() {
    var f = "MM-yyyy";
    var mf = new jsx3.util.DateFormat(f);
    jsunit.assertEquals(f, mf.getFormat());
  };

  t.testFormatYear = function() {
    var mf;
    mf = new jsx3.util.DateFormat("yyyy");
    jsunit.assertEquals("2000", mf.format(new Date(2000, 0, 1)));
    jsunit.assertEquals("0200", mf.format(new Date(200, 0, 1)));
    jsunit.assertEquals("20000", mf.format(new Date(20000, 0, 1)));
    mf = new jsx3.util.DateFormat("yy");
    jsunit.assertEquals("00", mf.format(new Date(2000, 0, 1)));
    jsunit.assertEquals("99", mf.format(new Date(1999, 0, 1)));
    mf = new jsx3.util.DateFormat("y");
    jsunit.assertEquals("2000", mf.format(new Date(2000, 0, 1)));
    jsunit.assertEquals("200", mf.format(new Date(200, 0, 1)));
  };

  t.testFormatMonth = function() {
    var l = new jsx3.util.Locale("en", "US");
    var mf;
    mf = new jsx3.util.DateFormat("M", l);
    jsunit.assertEquals("1", mf.format(new Date(2000, 0, 1)));
    jsunit.assertEquals("10", mf.format(new Date(2000, 9, 1)));
    mf = new jsx3.util.DateFormat("MM", l);
    jsunit.assertEquals("01", mf.format(new Date(2000, 0, 1)));
    mf = new jsx3.util.DateFormat("MMM", l);
    jsunit.assertEquals("Jan", mf.format(new Date(2000, 0, 1)));
    mf = new jsx3.util.DateFormat("MMMM", l);
    jsunit.assertEquals("January", mf.format(new Date(2000, 0, 1)));
    mf = new jsx3.util.DateFormat("MMMMMMMMMMMMMMMMMMMMMMMMM", l);
    jsunit.assertEquals("January", mf.format(new Date(2000, 0, 1)));
  };

  t.testFormatDate = function() {
    var mf;
    mf = new jsx3.util.DateFormat("d");
    jsunit.assertEquals("1", mf.format(new Date(2000, 0, 1)));
    jsunit.assertEquals("15", mf.format(new Date(2000, 0, 15)));
    mf = new jsx3.util.DateFormat("dd");
    jsunit.assertEquals("01", mf.format(new Date(2000, 0, 1)));
    jsunit.assertEquals("15", mf.format(new Date(2000, 0, 15)));
  };

  t.testFormatDayOfWeek = function() {
    var l = new jsx3.util.Locale("en", "US");
    var mf;
    mf = new jsx3.util.DateFormat("E", l);
    jsunit.assertEquals("S", mf.format(new Date(2000, 0, 1)));
    jsunit.assertEquals("M", mf.format(new Date(2000, 0, 3)));
    mf = new jsx3.util.DateFormat("EE", l);
    jsunit.assertEquals("S", mf.format(new Date(2000, 0, 1)));
    mf = new jsx3.util.DateFormat("EEE", l);
    jsunit.assertEquals("Sat", mf.format(new Date(2000, 0, 1)));
    mf = new jsx3.util.DateFormat("EEEE", l);
    jsunit.assertEquals("Saturday", mf.format(new Date(2000, 0, 1)));
  };

  t.testFormatHour = function() {
    var mf;
    mf = new jsx3.util.DateFormat("HH");
    jsunit.assertEquals("08", mf.format(new Date(2000, 0, 1, 8, 0, 0)));
    jsunit.assertEquals("14", mf.format(new Date(2000, 0, 1, 14, 0, 0)));
    mf = new jsx3.util.DateFormat("hh");
    jsunit.assertEquals("08", mf.format(new Date(2000, 0, 1, 8, 0, 0)));
    jsunit.assertEquals("02", mf.format(new Date(2000, 0, 1, 14, 0, 0)));
  };

  t.testFormatMsm = function() {
    var mf;
    mf = new jsx3.util.DateFormat("mm:ss:SSS");
    jsunit.assertEquals("09:15:097", mf.format(new Date(2000, 0, 1, 0, 9, 15, 97)));
  };

  t.testFormatAmPm = function() {
    var l = new jsx3.util.Locale("en", "US");
    var mf;

    mf = new jsx3.util.DateFormat("a", l);
    jsunit.assertEquals("AM", mf.format(new Date(2000, 0, 1, 0)));
    jsunit.assertEquals("PM", mf.format(new Date(2000, 0, 1, 12)));

    mf = new jsx3.util.DateFormat("aa", l);
    jsunit.assertEquals("AM", mf.format(new Date(2000, 0, 1, 0)));
    jsunit.assertEquals("PM", mf.format(new Date(2000, 0, 1, 12)));
  };

  t.testFormatBcAd = function() {
    var l = new jsx3.util.Locale("en", "US");
    var mf;
    mf = new jsx3.util.DateFormat("y GG", l);
    jsunit.assertEquals("2000 AD", mf.format(new Date(2000, 0, 1)));
    var d = new Date(0, 0, 1); // actually 1900
    d.setFullYear(0);
    jsunit.assertEquals("1 BC", mf.format(d));
    jsunit.assertEquals("2 BC", mf.format(new Date(-1, 0, 1)));
  };

  t.testFormatTimeZone = function() {
    var mf;
    mf = new jsx3.util.DateFormat("zzz");
    mf.setTimeZoneOffset(-8 * 60);
    jsunit.assertEquals("GMT-08:00", mf.format(new Date()));
    mf = new jsx3.util.DateFormat("ZZZ");
    mf.setTimeZoneOffset(1 * 60);
    jsunit.assertEquals("+0100", mf.format(new Date()));
  };

  t.testQuote1 = function() {
    var mf = new jsx3.util.DateFormat("'The year is' y");
    jsunit.assertEquals("The year is 2000", mf.format(new Date(2000, 0, 1)));
  };

  t.testQuote2 = function() {
    var mf = new jsx3.util.DateFormat("''d''");
    jsunit.assertEquals("'1'", mf.format(new Date(2000, 0, 1)));
  };

  t.testQuote3 = function() {
    var mf = new jsx3.util.DateFormat("!@#$% y ^&*()-=_+ y <>,./?;");
    jsunit.assertEquals("!@#$% 2000 ^&*()-=_+ 2000 <>,./?;", mf.format(new Date(2000, 0, 1)));
  };

  t.testUnQuote = function() {
    jsunit.assertThrows("Invalid characters should throw error", function(){
      return new jsx3.util.DateFormat("The year is: y");
    });
    jsunit.assertThrows("Unclosed single quote should throw error", function(){
      return new jsx3.util.DateFormat("'The year is: y");
    });
  };

  t.testParseDefault = function() {
    var mf = new jsx3.util.DateFormat("HH:mm");
    var d = mf.parse("09:15");
    jsunit.assertEquals(1970, d.getFullYear());
    jsunit.assertEquals(0, d.getMonth());
    jsunit.assertEquals(1, d.getDate());
  };

  t.testParseInt1 = function() {
    var mf = new jsx3.util.DateFormat("HH:mm:ss");
    var d = mf.parse("09:15:30");
    jsunit.assertInstanceOf(d, Date);
    jsunit.assertEquals(9, d.getHours());
    jsunit.assertEquals(15, d.getMinutes());
    jsunit.assertEquals(30, d.getSeconds());
  };

  t.testParseInt2 = function() {
    var mf = new jsx3.util.DateFormat("HHmmss");
    var d = mf.parse("063015");
    jsunit.assertInstanceOf(d, Date);
    jsunit.assertEquals(6, d.getHours());
    jsunit.assertEquals(30, d.getMinutes());
    jsunit.assertEquals(15, d.getSeconds());
  };

  t.testParseInt3 = function() {
    var mf = new jsx3.util.DateFormat("HH mm ss");
    var d = mf.parse("12 00015 0");
    jsunit.assertInstanceOf(d, Date);
    jsunit.assertEquals(12, d.getHours());
    jsunit.assertEquals(15, d.getMinutes());
    jsunit.assertEquals(0, d.getSeconds());
  };

  t.testParseInt4 = function() {
    var mf = new jsx3.util.DateFormat("HHHmmmsss");
    var d = mf.parse("015025030");
    jsunit.assertEquals(15, d.getHours());
    jsunit.assertEquals(25, d.getMinutes());
    jsunit.assertEquals(30, d.getSeconds());
    d = mf.parse("01502503010");
    jsunit.assertEquals(10, d.getSeconds());
  };

  t.testParseEnum = function() {
    var l = new jsx3.util.Locale("en", "US");
    var mf = new jsx3.util.DateFormat("MMM-y", l);
    var d;
    d = mf.parse("F-2000");
    jsunit.assertEquals(1, d.getMonth());
    d = mf.parse("J-2000");
    jsunit.assertEquals(0, d.getMonth());
    d = mf.parse("Ja-2000");
    jsunit.assertEquals(0, d.getMonth());
    d = mf.parse("Ju-2000");
    jsunit.assertEquals(5, d.getMonth());
    d = mf.parse("Sep-2000");
    jsunit.assertEquals(8, d.getMonth());
    d = mf.parse("December-2000");
    jsunit.assertEquals(11, d.getMonth());
  };

  t.testParseAmPm = function() {
    var l = new jsx3.util.Locale("en", "US");
    var mf = new jsx3.util.DateFormat("hh aa", l);
    var d;
    d = mf.parse("9 AM");
    jsunit.assertEquals(9, d.getHours());
    d = mf.parse("9 PM");
    jsunit.assertEquals(21, d.getHours());
  };

  t.testParseError = function() {
    var mf = new jsx3.util.DateFormat("HH mm ss");
    jsunit.assertThrows(function(){
      return mf.parse("09:15:00");
    });
  };

  // For 1-8CYQC9
  t.testParseLeapYear = function() {
    var mf = new jsx3.util.DateFormat("MM d yyyy");
    var d, s = "02 29 2008";

    d = mf.parse(s);
    jsunit.assertEquals("Month of " + s + " parsed by " + mf, 1, d.getMonth());
    jsunit.assertEquals("Date of " + s + " parsed by " + mf, 29, d.getDate());
    jsunit.assertEquals("Year of " + s + " parsed by " + mf, 2008, d.getFullYear());

    s = "02 29 2007";
    d = mf.parse(s);
    jsunit.assertEquals("Month of " + s + " parsed by " + mf, 2, d.getMonth());
    jsunit.assertEquals("Date of " + s + " parsed by " + mf, 1, d.getDate());
    jsunit.assertEquals("Year of " + s + " parsed by " + mf, 2007, d.getFullYear());

    mf = new jsx3.util.DateFormat("yyyy MM d");

    s = "2008 02 29";
    d = mf.parse(s);
    jsunit.assertEquals("Month of " + s + " parsed by " + mf, 1, d.getMonth());
    jsunit.assertEquals("Date of " + s + " parsed by " + mf, 29, d.getDate());
    jsunit.assertEquals("Year of " + s + " parsed by " + mf, 2008, d.getFullYear());

    s = "2007 02 29";
    d = mf.parse(s);
    jsunit.assertEquals("Month of " + s + " parsed by " + mf, 2, d.getMonth());
    jsunit.assertEquals("Date of " + s + " parsed by " + mf, 1, d.getDate());
    jsunit.assertEquals("Year of " + s + " parsed by " + mf, 2007, d.getFullYear());
  };

  // http://power.tibco.com/forums/thread.jspa?threadID=7607&tstart=0
  t.testLongYear = function() {
    var mf = new jsx3.util.DateFormat("d/M/yyyy");

    jsunit.assertEquals(2008, mf.parse("02/02/2008").getFullYear());

    jsunit.assertThrows(function(){
      return mf.parse("02/02/20080000");
    });
  };

});
