/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.util", function() {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.util.jsxpackage");

  it("should be able to calculate number a mod b",function() {
    expect(jsx3.util.numMod(1, 4)).toEqual(1);
    expect(jsx3.util.numMod(5, 4)).toEqual(1);
    expect(jsx3.util.numMod(-3, 4)).toEqual(1);
    expect(jsx3.util.numMod(-1, 1)).toEqual(0);
    expect(jsx3.util.numMod(-4, 4)).toEqual(0);
  });

  it("should be return whether number a is null", function() {
    expect(jsx3.util.numIsNaN(Number.NaN)).toBeTruthy();
    expect(jsx3.util.numIsNaN(null)).toBeTruthy();
    expect(jsx3.util.numIsNaN(parseInt("abc"))).toBeTruthy();
    expect(jsx3.util.numIsNaN(1)).toBeFalsy();
    expect(jsx3.util.numIsNaN(Number.INFINITY)).toBeTruthy();
  });

  it("should be return v to the nearest value that can be divided by intUnit", function() {
    expect(jsx3.util.numRound(120, 100)).toEqual(100);
    expect(jsx3.util.numRound(0.99, 1)).toEqual(1);
    expect(jsx3.util.numRound(0.99, .1)).toEqual(1);
    expect(jsx3.util.numRound(0.99, .01)).toEqual(.99);
    expect(jsx3.util.numRound(5, 10)).toEqual(10);
    expect(jsx3.util.numRound(5.01, 10)).toEqual(10);
    expect(jsx3.util.numRound(4.99, 10)).toEqual(0);
    expect(jsx3.util.numRound(5.75, 2)).toEqual(6);
  });

  it("should return whether the parameter is null or an empty string", function() {
    expect(jsx3.util.strEmpty(null)).toBeTruthy();
    expect(jsx3.util.strEmpty("")).toBeTruthy();
    expect(jsx3.util.strEmpty(0)).toBeFalsy();
    expect(jsx3.util.strEmpty("0")).toBeFalsy();
    expect(jsx3.util.strEmpty(" ")).toBeFalsy();
    expect(jsx3.util.strEmpty("abc")).toBeFalsy();
  });

  it("should trimmed of trailing and leading space",function() {
    expect(jsx3.util.strTrim("abc")).toEqual("abc");
    expect(jsx3.util.strTrim(" bcd")).toEqual("bcd");
    expect(jsx3.util.strTrim("cde ")).toEqual("cde");
    expect(jsx3.util.strTrim(" def ")).toEqual("def");
    expect(jsx3.util.strTrim(" \t efg")).toEqual("efg");
    expect(jsx3.util.strTrim("\nfgh\n \n\n")).toEqual("fgh");
  });

  it("should return s with the following four characters replaced by their escaped equivalent: & < > .", function() {
    expect(jsx3.util.strEscapeHTML("abc")).toEqual("abc");
    expect(jsx3.util.strEscapeHTML('<t a="v"/>&#160;')).toEqual("&lt;t a=&quot;v&quot;/&gt;&amp;#160;");
  });

  it("should limit length by placing an ellipsis in values that are too long", function() {
    expect(jsx3.util.strTruncate("abc", 10)).toEqual("abc");
    expect(jsx3.util.strTruncate("abcdefghij", 10)).toEqual("abcdefghij");
    expect(jsx3.util.strTruncate("abcdefghij", 9)).toEqual("abcdef...");
    expect(jsx3.util.strTruncate("abcdefghij", 9, "..")).toEqual("abcdefg..");
    expect(jsx3.util.strTruncate("abcdefghij", 8, "..", .5)).toEqual("abc..hij");
    expect(jsx3.util.strTruncate("abcdefghij", 8, "..", 0)).toEqual("..efghij");
  });

  it("should return whether s ends with streTest: strEndsWith(s,strTest) ", function() {
    expect(jsx3.util.strEndsWith("abc", "c")).toBeTruthy();
    expect(jsx3.util.strEndsWith("abc", "bc")).toBeTruthy();
    expect(jsx3.util.strEndsWith("abc", "abc")).toBeTruthy();
    expect(jsx3.util.strEndsWith("abc/", "/")).toBeTruthy();
    expect(jsx3.util.strEndsWith("abc", "\\w")).toBeFalsy();
    expect(jsx3.util.strEndsWith("abc", "C")).toBeFalsy();
  });

  it("should return the result of encoding s to its base-64 equivalent", function() {
    expect(jsx3.util.strEncodeBase64("abcdefghijklmnopqrstuvwxyz")).toEqual("YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=");
    expect(jsx3.util.strEncodeBase64("1")).toEqual("MQ==");
    expect(jsx3.util.strEncodeBase64("12")).toEqual("MTI=");
    expect(jsx3.util.strEncodeBase64("123")).toEqual("MTIz");
  });

  it("should return the result of decoding s from its base-64 equivalent", function() {
    expect("abcdefghijklmnopqrstuvwxyz").toEqual(jsx3.util.strDecodeBase64("YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo="));
    expect(jsx3.util.strDecodeBase64("MQ==")).toEqual("1");
    expect(jsx3.util.strDecodeBase64("MTI=")).toEqual("12");
    expect(jsx3.util.strDecodeBase64("MTIz")).toEqual("123");
  });

  it("has method arrIndexOf() to get the content index in the array",  function() {
    var l = ["a", "b", "c", "c"];
    expect(jsx3.util.arrIndexOf(l, "c")).toEqual(2);
    expect(jsx3.util.arrIndexOf(l, "z")).toEqual(-1);

    l = [1, 2, 3, 4];
    expect(jsx3.util.arrIndexOf(l, 3)).toEqual(2);
    expect(jsx3.util.arrIndexOf(l, "3")).toEqual(-1);

    var o = new Object();
    l = [new Object(), new Object(), o, new Object()];
    expect(jsx3.util.arrIndexOf(l, o)).toEqual(2);
    expect(jsx3.util.arrIndexOf(l, new Object())).toEqual(-1);
  });

  it("has method compareVersions() that can compare two version strings", function() {
    expect(jsx3.util.compareVersions("1", "1")).toEqual(0);
    expect(jsx3.util.compareVersions("1.1", "1.1")).toEqual(0);
    expect(jsx3.util.compareVersions("1.1", "1.1.0")).toEqual(0);
    expect(jsx3.util.compareVersions("2", "1")).toEqual(1);
    expect(jsx3.util.compareVersions("1.2", "1.1")).toEqual(1);
    expect(jsx3.util.compareVersions("1", "2")).toEqual(-1);
    expect(jsx3.util.compareVersions("1.1", "1.2")).toEqual(-1);
    expect(jsx3.util.compareVersions("1a", "1")).toEqual(1);
    expect(jsx3.util.compareVersions("1a", "1b")).toEqual(-1);
    expect(jsx3.util.compareVersions("1.10", "1.9")).toEqual(1);
  });

});
