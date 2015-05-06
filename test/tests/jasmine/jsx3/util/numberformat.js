/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.util.NumberFormat", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.util.NumberFormat");

  it("should be able to create a number format", function(){
    var f = jsx3.util.NumberFormat.getIntegerInstance();
    expect(f).toBeInstanceOf(jsx3.util.NumberFormat);
    f = jsx3.util.NumberFormat.getNumberInstance();
    expect(f).toBeInstanceOf(jsx3.util.NumberFormat);
    f = jsx3.util.NumberFormat.getCurrencyInstance();
    expect(f).toBeInstanceOf(jsx3.util.NumberFormat);
    f = jsx3.util.NumberFormat.getPercentInstance();
    expect(f).toBeInstanceOf(jsx3.util.NumberFormat);
  });

  it("should format NaN number as NaN", function(){
    var f = jsx3.util.NumberFormat.getNumberInstance(jsx3.util.Locale.US);
    expect(f.format(Number.NaN)).toEqual("NaN");
  });

  it("should be able to format infinity into the infinity sign", function(){
    var f = jsx3.util.NumberFormat.getNumberInstance(jsx3.util.Locale.US);
    expect(f.format(Number.POSITIVE_INFINITY)).toEqual("\u221E");
    expect(f.format(Number.NEGATIVE_INFINITY)).toEqual("-\u221E");
  });

  it("should has max int digit", function(){
    var f = new jsx3.util.NumberFormat("###0",jsx3.util.Locale.US);
    expect(f.format(1)).toEqual("1");
    expect(f.format(10)).toEqual("10");
    expect(f.format(100)).toEqual("100");
    expect(f.format(999)).toEqual("999");
    expect(f.format(10000)).toEqual("10000");
  });

  it("format 0000 will keep number padded to 4 digit with 0.", function(){
    var f = new jsx3.util.NumberFormat("0000", jsx3.util.Locale.US);
    expect(f.format(1)).toEqual("0001");
    expect(f.format(20)).toEqual("0020");
    expect(f.format(300)).toEqual("0300");
    expect(f.format(4000)).toEqual("4000");
    expect(f.format(50000)).toEqual("50000");
  });

  it("floating point number will have at least 1 digit before and after the decimal with format 0.0## ", function(){
    var f = new jsx3.util.NumberFormat("0.0##",jsx3.util.Locale.US);
    expect(f.format(1)).toEqual("1.0");
    expect(f.format(1.1)).toEqual("1.1");
    expect(f.format(2.200)).toEqual("2.2");
    expect(f.format(3.33)).toEqual("3.33");
    expect(f.format(4.444)).toEqual("4.444");
    expect(f.format(5.5555)).toEqual("5.556");
  });

  it("format 0.00## will format number to at least 2 digits after decimal", function(){
    var f = new jsx3.util.NumberFormat("0.00##", jsx3.util.Locale.US);
    expect(f.format(1)).toEqual("1.00");
    expect(f.format(2.2)).toEqual("2.20");
    expect(f.format(3.333)).toEqual("3.333");
    expect(f.format(4.4444)).toEqual("4.4444");
    expect(f.format(5.55555)).toEqual("5.5556");

  });

  it("should be able to format percent.", function(){
    var f =new jsx3.util.NumberFormat("0%", jsx3.util.Locale.US);
    expect(f.format(0.01)).toEqual("1%");
    expect(f.format(.015)).toEqual("2%");
    expect(f.format(0.15)).toEqual("15%");
    expect(f.format(.998)).toEqual("100%");
    expect(f.format(11)).toEqual("1100%");
  });

  it("should be able to format currency", function(){
    var f = new jsx3.util.NumberFormat("$0.00", jsx3.util.Locale.US);
    expect(f.format(1)).toEqual("$1.00");
    expect(f.format(1.22)).toEqual("$1.22");
    expect(f.format(2.5)).toEqual("$2.50");
  });

  it("should be able to add an arbitrary prefix character to a number format", function(){
    var f = new jsx3.util.NumberFormat("'#'0",jsx3.util.Locale.US);
    expect(f.format(0)).toEqual("#0");
    expect(f.format(-2)).toEqual("-#2");
    f = new jsx3.util.NumberFormat("-'#'0", jsx3.util.Locale.US);
    expect(f.format(-1)).toEqual("--#1");
    f = new jsx3.util.NumberFormat("''00", jsx3.util.Locale.US);
    expect(f.format(2)).toEqual("'02");
  });

  it("should be able to format suffix", function(){
    var f = new jsx3.util.NumberFormat("0'.#'", jsx3.util.Locale.US);
    expect(f.format(1)).toEqual("1.#");
    f = new jsx3.util.NumberFormat("0a000", jsx3.util.Locale.US);
    expect(f.format(1)).toEqual("1a000");
    f = new jsx3.util.NumberFormat("'-'0'-'", jsx3.util.Locale.US);
    expect(f.format(2)).toEqual("-2-");
  });

  it("should be able to format negative",function() {
    var f = new jsx3.util.NumberFormat("0;(0)", jsx3.util.Locale.US);
    expect("1").toEqual(f.format(1));
    expect("(1)").toEqual(f.format(-1));
    f = new jsx3.util.NumberFormat("-0", jsx3.util.Locale.US);
    expect("-1").toEqual(f.format(1));
    expect("--1").toEqual(f.format(-1));
    f = new jsx3.util.NumberFormat("-0;0", jsx3.util.Locale.US);
    expect("-1").toEqual(f.format(1));
    expect("1").toEqual(f.format(-1));
  });

  it("should be able to add grouping character with #,### ",function() {
    var f = new jsx3.util.NumberFormat("#,###", jsx3.util.Locale.US);
    expect("1").toEqual(f.format(1));
    expect("10").toEqual(f.format(10));
    expect("100").toEqual(f.format(100));
    expect("1,000").toEqual( f.format(1000));
    expect("10,000").toEqual(f.format(10000));
    expect("1,000,000").toEqual(f.format(1000000));
    f = new jsx3.util.NumberFormat("##,##.000", jsx3.util.Locale.US);
    expect("1,00.000").toEqual(f.format(100));
  });

  it("should be able to format decimal place",function() {
    var f = new jsx3.util.NumberFormat("0", jsx3.util.Locale.US);
    expect("1").toEqual(f.format(1));
    expect("1").toEqual(f.format(1.4));
    f = new jsx3.util.NumberFormat("0.", jsx3.util.Locale.US);
    expect("2.").toEqual(f.format(2));
    expect("2.").toEqual(f.format(2.4));
    f = new jsx3.util.NumberFormat("0.#", jsx3.util.Locale.US);
    expect("3").toEqual(f.format(3));
    expect("3.4").toEqual(f.format(3.4));
  });

  it("should be able to format grouping Es",function() {
    var f = new jsx3.util.NumberFormat("#,###", jsx3.util.Locale.valueOf("es"));
    expect("100").toEqual(f.format(100));
    expect("1.000").toEqual(f.format(1000));
    expect("1.000.000").toEqual(f.format(1000000));
    expect("1.001").toEqual(f.format(1000.5));
  });

  it("should be able to format decimal place Es",function() {
    var f = new jsx3.util.NumberFormat("#,##0.#", jsx3.util.Locale.valueOf("es"));
    expect("3").toEqual(f.format(3));
    expect("3,4").toEqual(f.format(3.4));
    expect("3.000,4").toEqual(f.format(3000.4));
  });

  it("should be able to format decimal ",function() {
    var nf = new jsx3.util.NumberFormat ('0.00');
    expect("99999.10").toEqual(nf.format(99999.10));
    expect("99991.10").toEqual(nf.format(99991.1));
    expect("9999.10").toEqual(nf.format(9999.1));
    expect("89999999.10").toEqual(nf.format(89999999.10));
  });

  it("should throw errors",function() {
    expect(function(){
      return new jsx3.util.NumberFormat();
    }).toThrow();
    expect(function(){
      return new jsx3.util.NumberFormat("");
    }).toThrow();
    expect(function(){
      return new jsx3.util.NumberFormat("-%");
    }).toThrow();
    expect(function(){
      return new jsx3.util.NumberFormat("0.000,000");
    }).toThrow();
  });

  it("should be able to parse NaN", function() {
    var f = jsx3.util.NumberFormat.getNumberInstance(jsx3.util.Locale.US);
    expect(f.parse("NaN"));
  });

  it("should be able to parse infinity", function(){
    var f = jsx3.util.NumberFormat.getNumberInstance(jsx3.util.Locale.US);
    expect(f.parse("\u221E")).toEqual(Number.POSITIVE_INFINITY);
    expect(!isNaN(f.parse("\u221E"))).toBeTruthy();
    expect(!isFinite(f.parse("\u221E"))).toBeTruthy();
    expect(f.parse("\u221E") > 0).toBeTruthy();
    expect(!isNaN(f.parse("-\u221E"))).toBeTruthy();
    expect(!isFinite(f.parse("-\u221E"))).toBeTruthy();
    expect(f.parse("-\u221E") < 0).toBeTruthy();
  });

  it("should be able to parse negative", function(){
    var f = jsx3.util.NumberFormat.getNumberInstance(jsx3.util.Locale.US);
    expect(f.parse("-1")).toEqual(-1);
    expect(f.parse("-0")).toEqual(-0);
    expect(f.parse("1")).toEqual(1);
  });


  it("should be able to parse percent",function() {
    var f = new jsx3.util.NumberFormat("0%", jsx3.util.Locale.US);
    expect(f.parse("1%")).toEqual(.01);
    expect(f.parse("10.5%")).toEqual(.105);
    expect(f.parse("100%")).toEqual(1);
    expect(f.parse("1005%")).toEqual(10.05);
  });

  it("should be able to parse mille", function() {
    var f = new jsx3.util.NumberFormat("0\u2030", jsx3.util.Locale.US);
    expect(f.parse("1\u2030")).toEqual(.001);
    expect(f.parse("10.5\u2030")).toEqual(.0105);
    expect(f.parse("100\u2030")).toEqual(.1);
    expect(f.parse("1005\u2030")).toEqual(1.005);
  });

  it("should be able to parse group", function() {
    var f = jsx3.util.NumberFormat.getNumberInstance(jsx3.util.Locale.US);
    expect(f.parse("1,000")).toEqual(1000);
    expect(f.parse("1000")).toEqual(1000);
    expect(f.parse("1,00")).toEqual(100);
    expect(f.parse("1,000,000")).toEqual(1000000);
  });

  it("should be able to parse decimal",function() {
    var f = jsx3.util.NumberFormat.getNumberInstance(jsx3.util.Locale.US);
    expect(f.parse("1.05")).toEqual(1.05);
    expect(f.parse("105.")).toEqual(105);
  });

  it("should be able to parse group Es",function() {
    var f = jsx3.util.NumberFormat.getNumberInstance(jsx3.util.Locale.valueOf("es"));
    expect(f.parse("1.000")).toEqual(1000);
    expect(f.parse("1000")).toEqual(1000);
    expect(f.parse("1.00")).toEqual(100);
    expect(f.parse("1.000.000")).toEqual(1000000);
  });

  it("should be able to parse decimal Es",function() {
    var f = jsx3.util.NumberFormat.getNumberInstance(jsx3.util.Locale.valueOf("es"));
    expect(f.parse("1,05")).toEqual(1.05);
    expect(f.parse("105,")).toEqual(105);
    expect(f.parse("1.005,5")).toEqual(1005.5);
  });

  it("should be able to parse scientific", function() {
    var f = jsx3.util.NumberFormat.getNumberInstance(jsx3.util.Locale.US);
    expect(5).toEqual(f.parse("5e0"));
    expect(500000).toEqual(f.parse("5e5"));
    expect(0.05).toEqual(f.parse("5e-2"));
  });

  it("should be able to parse currency",function() {
    var f = jsx3.util.NumberFormat.getCurrencyInstance(jsx3.util.Locale.US);
    expect(1).toEqual(f.parse("$1"));
    expect(-10).toEqual(f.parse("$-10"));
    expect(1.25).toEqual(f.parse("$1.25"));
  });

  it("should be able to parse negFormat",function() {
    var f = new jsx3.util.NumberFormat("0;(0)");
    expect(f.parse("100")).toEqual(100);
    expect(f.parse("(100)")).toEqual(-100);
    expect(f.parse("(-100)")).toEqual(100);
    f = new jsx3.util.NumberFormat("0;(-0)");
    expect(f.parse("(-100)")).toEqual(-100);
  });

  // http://www.generalinterface.org/bugs/browse/GI-882
  it("should be able to space equivalence",function() {
    var f = new jsx3.util.NumberFormat("#,##0.##", jsx3.util.Locale.valueOf("fr"));
    expect(f.parse("1 234,55")).toEqual(1234.55);
  });

  // http://www.generalinterface.org/bugs/browse/GI-920
  it("should be able to number format zero", function() {
    var f = jsx3.util.NumberFormat.getNumberInstance();
    expect(f.format(0)).toEqual("0");
  });

})