/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.lang.Exception", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.lang.Exception", "jsx3.util.jsxpackage");
  
  it("should be able to return the cause of the exception", function(){
    var c = new jsx3.lang.Exception();
    var e = new jsx3.lang.Exception("test getCause", c);
    expect(e.getCause()).toEqual(c);
  });
  
  it("should be able to return the description of the exception", function(){
    var m = "test getMessage";
    var e = new jsx3.lang.Exception(m);
    expect(e.getMessage()).toEqual(m);
  });
  
  it("should be able to throw exception of this type", function(){
    expect(function(){
      throw new jsx3.lang.Exception("test exception");
    }).toThrowException(jsx3.lang.Exception);
    
    expect(function(){
      throw new jsx3.lang.Exception("test exception");
    }).toThrowException(jsx3.lang.Object);
    
    expect(function(){
      throw new jsx3.lang.Exception("test exception");
    }).toThrowException(Object);
    
  });
  
  var spec = it("should be able to return the complete call stack", function(){
    var a = function() { throw new jsx3.lang.Exception("test exception"); };
    var b = function() { a(); };
    var c = function() { b(); };
    var e = null;
    try {
      c();
      jsunit.assert(false);
    } catch (ex) {
      e = ex;
    }
    expect(e).toBeInstanceOf(jsx3.lang.Exception);
    var s = e.getStack();
    expect(s).toBeInstanceOf(Array);
    expect(s.length >= 4).toBeTruthy();
    expect(s[0]).toEqual(a);
    expect(s[1]).toEqual(b);
    expect(s[2]).toEqual(c);
    // The last stack element contains the function where this stack ends, but this causes infinite loop.
    //runs( function ()  {
    //  expect(s[4]).toEqual(spec);
    //});
  });
  
  it("should throw IllegalArguementException when the caller of a function doesn't pass arguments arrording to the method's contract", function(){
    var e = new jsx3.lang.IllegalArgumentException("arg1", null);
    expect(e).toBeInstanceOf(jsx3.lang.Exception);
  });
  
  it("should be able to return a string representation of the call stack", function(){
    var a = function(a,b,c) { throw new jsx3.lang.Exception("test exception"); };
    function b(y,z) { a(); }
    var c = function() { b(); };

    var e = null;
    try {
      c();
    } catch (ex) {
      e = ex;
    }
    var s = e.printStackTrace();
    
    expect(/at anonymous\(a, b, c\) {/.test(s)).toBeTruthy();    
    //Stack trace should include anonymous function:\n" + s
    expect(/at b\(y, z\) {/.test(s)).toBeTruthy();
    //Stack trace should include function b():\n" + s
  });
  
});
