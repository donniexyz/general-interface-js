/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.util.DateFormat", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.util.DateFormat", "jsx3.util.Locale", "jsx3.lang.System");

  it("should instantiate DateFormat object using factory method getDateInstance() and default locale", function(){
    var lo = new jsx3.util.Locale("xx");
    var df = jsx3.util.DateFormat.getDateInstance(null,lo);
    expect(df).toBeInstanceOf(jsx3.util.DateFormat);
    expect(df.getLocale()).toEqual(lo);
    expect(df.getFormat().indexOf("y")>=0).toBeTruthy();
    expect(df.getFormat().indexOf("M")>=0).toBeTruthy();
  });

  it("should instantiate a DateTime formatter using getDateTimeInstance factory method and default locale", function(){
    var lo = new jsx3.util.Locale("xx");
    var df = jsx3.util.DateFormat.getDateTimeInstance(null, null, lo);
    expect(df).toBeInstanceOf(jsx3.util.DateFormat);
    expect(df.getLocale()).toEqual(lo);
    expect(df.getFormat().indexOf("y")>=0).toBeTruthy();
    expect(df.getFormat().indexOf("H")>=0||df.getFormat().indexOf("h") >= 0).toBeTruthy();
    expect(df.getFormat().indexOf("mm")>=0).toBeTruthy();
  });

  it("should instantiate a time formatter using getTimeInstance() and default locale", function(){
    var lo = new jsx3.util.Locale("xx");
    var df = jsx3.util.DateFormat.getTimeInstance(null, lo);
    expect(df).toBeInstanceOf(jsx3.util.DateFormat);
    expect(df.getLocale()).toEqual(lo);
    expect(df.getFormat().indexOf("H")>=0||df.getFormat().indexOf("h") >= 0).toBeTruthy();
    expect(df.getFormat().indexOf("mm")>=0).toBeTruthy();
  });
  it("should be able to instantiate a Date Formatter using the constructor", function(){
    var mf = new jsx3.util.DateFormat("");
    expect(mf).toBeInstanceOf(jsx3.util.DateFormat);
  });

  it("should fail to instantiate a DateFormat without specifying a format string", function(){
    expect(function(){
      return new jsx3.util.DateFormat();
    }).toThrow();
  });

  it("should be able to get the locale of a DateFormat specified on constructor parameter", function(){
    var lo = new jsx3.util.Locale("zh");
    var mf = new jsx3.util.DateFormat("", lo);
    expect(mf.getLocale()).toEqual(lo);
  });

  it("should be able to get the locale of a Dateformat specified by setLocale()", function(){
    var lo = new jsx3.util.Locale("zh");
    var mf = new jsx3.util.DateFormat("");
    mf.setLocale(lo);
    expect(mf.getLocale()).toEqual(lo);
  });

  it("should be Locale: 3", function(){
    var lo = new jsx3.util.Locale("en","US");
    var mf = new jsx3.util.DateFormat("", lo);
    expect(mf.getLocale()).toEqual(jsx3.lang.System.getLocale());
  });

  it("should be able to return the format passed to the constructor", function(){
    var f ="MM-yyyy";
    var mf = new jsx3.util.DateFormat(f);
    expect(mf.getFormat()).toEqual(f);
  });

  it("should get the correctly formatted year using date format 'yyyy', 'yy' and 'y'", function(){
    var mf1 = new jsx3.util.DateFormat("yyyy");
    expect(mf1.format(new Date(1999,0,1))).toEqual("1999");
    expect(mf1.format(new Date(8,0,1))).toEqual("1908");
    expect(mf1.format(new Date(12299,0,1))).toEqual("12299");
    expect(mf1.format(new Date(2000, 0, 1))).toEqual("2000");
    expect(mf1.format(new Date(200, 0, 1))).toEqual("0200");
    expect(mf1.format(new Date(20000, 0, 1))).toEqual("20000");

    var mf2 = new jsx3.util.DateFormat("yy");
    expect(mf2.format(new Date(1999,0,1))).toEqual("99");
    expect(mf2.format(new Date(2000, 0, 1))).toEqual("00");
    expect(mf2.format(new Date(2030, 0, 1))).toEqual("30");

    var mf3 = new jsx3.util.DateFormat("y");
    expect(mf3.format(new Date(2,0,1))).toEqual("1902");
    expect(mf3.format(new Date(2000, 0, 1))).toEqual("2000");
    expect(mf3.format(new Date(200, 0, 1))).toEqual("200");
  });

  it("should get the correctly formatted month using date format 'MMMM','MMM','MM' and 'M' ",function() {
    var l = new jsx3.util.Locale("en", "US");
    var mf;
    mf = new jsx3.util.DateFormat("M", l);
    expect(mf.format(new Date(2000, 0, 1))).toEqual("1");
    expect(mf.format(new Date(2000, 9, 1))).toEqual("10");
    mf = new jsx3.util.DateFormat("MM", l);
    expect(mf.format(new Date(2000, 0, 1))).toEqual("01");
    mf = new jsx3.util.DateFormat("MMM", l);
    expect(mf.format(new Date(2000, 0, 1))).toEqual("Jan");
    mf = new jsx3.util.DateFormat("MMMM", l);
    expect(mf.format(new Date(2000, 0, 1))).toEqual("January");
    mf = new jsx3.util.DateFormat("MMMMMMMMMMMMMMMMMMMMMMMMM", l);
    expect(mf.format(new Date(2000, 0, 1))).toEqual("January");
  });

  it("should get the correctly formatted day using date format 'dd' and 'd'",function() {
    var mf;
    mf = new jsx3.util.DateFormat("d");
    expect(mf.format(new Date(2000, 0, 1))).toEqual("1");
    expect(mf.format(new Date(2000, 0, 15))).toEqual("15");
    mf = new jsx3.util.DateFormat("dd");
    expect(mf.format(new Date(2000, 0, 1))).toEqual("01");
    expect(mf.format(new Date(2000, 0, 15))).toEqual("15");
  });

  it("should get the correctly formatted time zone using date format 'zzz'", function(){
    var mf = new jsx3.util.DateFormat("zzz");
    mf.setTimeZoneOffset(8 * 60);
    expect(mf.format(new Date())).toEqual("GMT+08:00");
    var mf1 =new jsx3.util.DateFormat("zzz");
    mf1.setTimeZoneOffset(-2 * 60);
    expect(mf1.format(new Date())).toEqual("GMT-02:00");
  });

  it("should get the correctly formatted day of week using date format 'EEEE', 'EE' and 'E'", function() {
    var l = new jsx3.util.Locale("en", "US");
    var mf;
    mf = new jsx3.util.DateFormat("E", l);
    expect(mf.format(new Date(2000, 0, 1))).toEqual("S");
    expect(mf.format(new Date(2000, 0, 3))).toEqual("M");
    mf = new jsx3.util.DateFormat("EE", l);
    expect(mf.format(new Date(2000, 0, 1))).toEqual("S");
    mf = new jsx3.util.DateFormat("EEE", l);
    expect(mf.format(new Date(2000, 0, 1))).toEqual("Sat");
    mf = new jsx3.util.DateFormat("EEEE", l);
    expect(mf.format(new Date(2000, 0, 1))).toEqual("Saturday");
  });

  it("should get the correctly formatted hours using date format 24hours'HH' and 12hours'hh'", function() {
    var mf;
    mf = new jsx3.util.DateFormat("HH");
    expect(mf.format(new Date(2000, 0, 1, 8, 0, 0))).toEqual("08");
    expect(mf.format(new Date(2000, 0, 1, 14, 0, 0))).toEqual("14");
    mf = new jsx3.util.DateFormat("hh");
    expect(mf.format(new Date(2000, 0, 1, 8, 0, 0))).toEqual("08");
    expect(mf.format(new Date(2000, 0, 1, 14, 0, 0))).toEqual("02");
  });

  it("should get the correctly formatted miute: seconds: microSeconds using date format 'mm', 'ss' and 'SSS'", function() {
    var mf;
    mf = new jsx3.util.DateFormat("mm:ss:SSS");
    expect(mf.format(new Date(2000, 0, 1, 0, 9, 15, 97))).toEqual("09:15:097");
  });

  it("format in 12 hours format with AM and PM", function() {
    var l = new jsx3.util.Locale("en", "US");
    var mf;

    mf = new jsx3.util.DateFormat("a", l);
    expect(mf.format(new Date(2000, 0, 1, 0))).toEqual("AM");
    expect(mf.format(new Date(2000, 0, 1, 12))).toEqual("PM");

    mf = new jsx3.util.DateFormat("aa", l);
    expect(mf.format(new Date(2000, 0, 1, 0))).toEqual("AM");
    expect(mf.format(new Date(2000, 0, 1, 12))).toEqual("PM");
  });

  it("should be format BC and AD",  function() {
    var l = new jsx3.util.Locale("en", "US");
    var mf;
    mf = new jsx3.util.DateFormat("y GG", l);
    expect(mf.format(new Date(2000, 0, 1))).toEqual("2000 AD");
    var d = new Date(0, 0, 1); // actually 1900
    d.setFullYear(0);
    expect(mf.format(d)).toEqual("1 BC");
    expect(mf.format(new Date(-1, 0, 1))).toEqual("2 BC");
  });

  it("should be set the timezone offset of this date format.",function() {
    var mf;
    mf = new jsx3.util.DateFormat("zzz");
    mf.setTimeZoneOffset(-8 * 60);
    expect(mf.format(new Date())).toEqual("GMT-08:00");
    mf = new jsx3.util.DateFormat("ZZZ");
    mf.setTimeZoneOffset(1 * 60);
    expect(mf.format(new Date())).toEqual("+0100");
  });

  it("should handle single quote by removing them.", function() {
    var mf = new jsx3.util.DateFormat("'The year is' y");
    expect(mf.format(new Date(2000, 0, 1))).toEqual("The year is 2000");
  });

  it("should be able to escape single quote by double single quote", function() {
    var mf = new jsx3.util.DateFormat("''d''");
    expect(mf.format(new Date(2000, 0, 1))).toEqual("'1'");
  });

  it("should ignore all other ascii symbols that's not a single quote.", function() {
    var mf = new jsx3.util.DateFormat("!@#$% y ^&*()-=_+ y <>,./?;");
    expect(mf.format(new Date(2000, 0, 1))).toEqual('!@#$% 2000 ^&*()-=_+ 2000 <>,./?;');
  });

  it("should throw exception when using alpha characters not meant to be date format.", function() {
    expect(function(){
      return new jsx3.util.DateFormat("The year is: y");
    }).toThrow();
    expect(function(){
      return new jsx3.util.DateFormat("'The year is: y");
    }).toThrow();
  });

  it("should set the date to default date of 1970-0-1 when parsing a time only format.", function() {
    var mf = new jsx3.util.DateFormat("HH:mm");
    var d = mf.parse("09:15");
    expect(d.getFullYear()).toEqual(1970);
    expect(d.getMonth()).toEqual(0);
    expect(d.getDate()).toEqual(1);
  });

  it("should parse Hour,Min,Sec to interger when parsing a time format HH:mm:ss", function() {
    var mf = new jsx3.util.DateFormat("HH:mm:ss");
    var d = mf.parse("09:15:30");
    expect(d).toBeInstanceOf(Date);
    expect(d.getHours()).toEqual(9);
    expect(d.getMinutes()).toEqual(15);
    expect(d.getSeconds()).toEqual(30);
  });

  it("should parse hour,min,sec to interget  when parsing a time format HHmmss", function() {
    var mf = new jsx3.util.DateFormat("HHmmss");
    var d = mf.parse("063015");
    expect(d).toBeInstanceOf(Date);
    expect(6).toEqual(d.getHours());
    expect(30).toEqual(d.getMinutes());
    expect(15).toEqual(d.getSeconds());
  });

  it("should parse hour,min,sec to interget  when parsing a time format HH mm ss", function() {
    var mf = new jsx3.util.DateFormat("HH mm ss");
    var d = mf.parse("12 00015 0");
    expect(d).toBeInstanceOf(Date);
    expect(d.getHours()).toEqual(12);
    expect(d.getMinutes()).toEqual(15);
    expect(d.getSeconds()).toEqual(0);
  });

  it("should parse hour,min,sec to interget  when parsing a time format HHHmmmsss", function() {
    var mf = new jsx3.util.DateFormat("HHHmmmsss");
    var d = mf.parse("015025030");
    expect(d.getHours()).toEqual(15);
    expect(d.getMinutes()).toEqual(25);
    expect(d.getSeconds()).toEqual(30);
    d = mf.parse("01502503010");
    expect(d.getSeconds()).toEqual(10);
  });

  it("should parse month to interger when parse Enum", function() {
    var l = new jsx3.util.Locale("en", "US");
    var mf = new jsx3.util.DateFormat("MMM-y", l);
    var d;
    d = mf.parse("F-2000");
    expect(d.getMonth()).toEqual(1);
    d = mf.parse("J-2000");
    expect(d.getMonth()).toEqual(0);
    d = mf.parse("Ja-2000");
    expect(d.getMonth()).toEqual(0);
    d = mf.parse("Ju-2000");
    expect(d.getMonth()).toEqual(5);
    d = mf.parse("Sep-2000");
    expect(d.getMonth()).toEqual(8);
    d = mf.parse("December-2000");
    expect(d.getMonth()).toEqual(11);
  });

  it("should parse hour with format Am and Pm", function() {
    var l = new jsx3.util.Locale("en", "US");
    var mf = new jsx3.util.DateFormat("hh aa", l);
    var d;
    d = mf.parse("9 AM");
    expect(d.getHours()).toEqual(9);
    d = mf.parse("9 PM");
    expect(d.getHours()).toEqual(21);
  });

  it("should throw a exception when parse error format", function() {
    var mf = new jsx3.util.DateFormat("HH mm ss");
    expect(function(){
      return mf.parse("09:15:00");
    }).toThrow();
  });

  // For 1-8CYQC9
  it("should be able to parse leap year", function() {
    var mf = new jsx3.util.DateFormat("MM d yyyy");
    var d, s = "02 29 2008";

    d = mf.parse(s);
    expect(d.getMonth()).toEqual(1);
    expect(d.getDate()).toEqual(29);
    expect(d.getFullYear()).toEqual(2008);

    s = "02 29 2007";
    d = mf.parse(s);
    expect(d.getMonth()).toEqual(2);// month 0 is Jan, month 2 is march. This date is March 1,2007
    expect(d.getDate()).toEqual(1);
    expect(d.getFullYear()).toEqual(2007);

    mf = new jsx3.util.DateFormat("yyyy MM d");

    s = "2008 02 29";
    d = mf.parse(s);
    expect(d.getMonth()).toEqual(1);
    expect(d.getDate()).toEqual(29);
    expect(d.getFullYear()).toEqual(2008);

    s = "2007 02 29";
    d = mf.parse(s);
    expect(d.getMonth()).toEqual(2);
    expect(d.getDate()).toEqual(1);
    expect(d.getFullYear()).toEqual(2007);
  });

  // http://power.tibco.com/forums/thread.jspa?threadID=7607&tstart=0
  it("should be throw error when the year is a long Year", function() {
    var mf = new jsx3.util.DateFormat("d/M/yyyy");
    expect(mf.parse("02/02/2008").getFullYear()).toEqual(2008);
    expect(function(){
      return mf.parse("02/02/20080000");
    }).toThrow();
  });

});