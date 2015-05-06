/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.util.MessageFormat", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.util.MessageFormat", "jsx3.util.Locale", "jsx3.lang.System");

  beforeEach(function(){
    var mf = new jsx3.util.MessageFormat("");
    expect(mf).toBeInstanceOf(jsx3.util.MessageFormat);
  });

  it("should test new a null message Format", function(){
    expect(function(){
      return new jsx3.util.MessageFormat();
    }).toThrow();
  });

  it("should be able to format a simple message", function(){
    var mf = new jsx3.util.MessageFormat("{0} {1}");
    expect(mf.format("a","bcd")).toEqual("a bcd");
    expect(mf.format("xy","c")).toEqual("xy c");
  });

  it("should format the message which out of order",function(){
    var mf = new jsx3.util.MessageFormat("{2} {0}");
    expect(mf.format("a", "bc","def")).toEqual("def a");
  });

  it("should be empty when the message is null",function(){
    var mf = new jsx3.util.MessageFormat("{0}");
    expect(mf.format()).toEqual("{0}");
    expect(mf.format(null)).toEqual("null");
  });

  it("shoud be able to format object when the message is object", function(){
    var mf = new jsx3.util.MessageFormat("{0}");
    var o = new Object();
    o.toString = function(){return "foo";};
    expect(mf.format(o)).toEqual("foo");
  });

  it("should be able to format unquote", function(){
    var mf = new jsx3.util.MessageFormat("Hello {0}!");
    expect(mf.format("world")).toEqual("Hello world!");
  });

  it("shoud be able to format quote", function(){
    var mf = new jsx3.util.MessageFormat("'{0}' is ''{0}''");
    expect(mf.format("world")).toEqual("{0} is 'world'");
  });

  it("should be throw error when it is a bad format", function(){
    expect(function(){
      return new jsx3.util.MessageFormat("{x,y} is {0}");
    }).toThrow();
    expect(function(){
      return new jsx3.util.MessageFormat("{a}");
    }).toThrow();
  });

  it("should return the locale of this message format: 1", function(){
    var l = new jsx3.util.Locale("es");
    var mf = new jsx3.util.MessageFormat("",l);
    expect(mf.getLocale()).toEqual(l);
  });

  it("shoud return the locale of this message format: 2", function(){
    var l = new jsx3.util.Locale("es");
    var mf = new jsx3.util.MessageFormat("");
    mf.setLocale(l);
    expect(mf.getLocale()).toEqual(l);
  });

  it("should return the locale of this message format: 3", function(){
    var mf = new jsx3.util.MessageFormat("");
    expect(mf.getLocale()).toEqual(jsx3.lang.System.getLocale());
  });

  it("shoud be able to formate date", function(){
    var mf = null;
    mf = new jsx3.util.MessageFormat("{0,date,short}");
    expect(mf.format(new Date(2008,0,1))).toEqual("1/1/08");
    mf = new jsx3.util.MessageFormat("{0,date,medium}");
    expect(mf.format(new Date(2008,0,1))).toEqual("Jan 1, 2008");
    mf = new jsx3.util.MessageFormat("{0,date,long}");
    expect(mf.format(new Date(2008,0,1))).toEqual("January 1, 2008");
    mf = new jsx3.util.MessageFormat("{0,date,full}");
    expect(mf.format(new Date(2008,0,1))).toEqual("Tuesday, January 1, 2008");
    mf = new jsx3.util.MessageFormat("{0,date,MM-yyyy}");
    expect(mf.format(new Date(2008,0,1))).toEqual("01-2008");
  });

  it("should be able to formate time", function(){
    var mf = null;
    mf = new jsx3.util.MessageFormat("{0,time,short}");
    mf = new jsx3.util.MessageFormat("{0,time,medium}");
    mf = new jsx3.util.MessageFormat("{0,time,long}");
    mf = new jsx3.util.MessageFormat("{0,time,full}");
    mf = new jsx3.util.MessageFormat("{0,time,HH:mm}");
    expect(mf.format(new Date(2007, 0, 1, 8, 15, 0))).toEqual("08:15");
  });

  it("should be able to format number", function(){
    var mf = null;
    mf = new jsx3.util.MessageFormat("{0,number,integer}");
    mf = new jsx3.util.MessageFormat("{0,number,percent}");
    mf = new jsx3.util.MessageFormat("{0,number,currency}");
    mf = new jsx3.util.MessageFormat("{0,number,#0.0}");
    expect(mf.format(10)).toEqual("10.0");
  });

});