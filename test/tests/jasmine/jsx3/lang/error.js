/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.lang.NativeError - wraps the browser-native exception", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.lang.NativeError", "jsx3.util.jsxpackage");

  it("should throw an exception when constructor argument is not an Error", function() {
    expect(function() {
      var e = new jsx3.lang.NativeError({});
    }).toThrowException(jsx3.lang.IllegalArgumentException);
  });

  it("should be able to initialize error trapping mechanism", function(){
    var ex = null;
    jsx3.lang.NativeError.initErrorCapture();
  });

  it("should be able to wraps a native browser exception in an instance of NativeError", function(){
    var ex = null;
    try{
      var b = jasmine.not.defined.at.all;
    }catch(e){
      ex = jsx3.lang.NativeError.wrap(e);
    }
    if(ex != null){
      expect(ex).toBeInstanceOf(jsx3.lang.Exception);
      expect(ex).toBeInstanceOf(jsx3.lang.NativeError);
    }
    var e = new jsx3.lang.Exception();
    var wrapped = jsx3.lang.NativeError.wrap(e);
    expect(e).toEqual(wrapped);

    var o = {};
    o.toString = function() { return "an object"; };
    wrapped = jsx3.lang.NativeError.wrap(o);
    expect(o.toString()).toEqual(wrapped.getMessage());

    wrapped = jsx3.lang.NativeError.wrap(123);
    expect(wrapped.getMessage()).toEqual("123");
  });

  if (_jasmine_test.IE10 || !_jasmine_test.IE) // only IE10 or other non-IE
  it("should be able to return filename where this error was raised", function(){
    var ex = null;
    try {
      var b = jasmine.not.defined.at.all;
    }catch (e) {
      ex = new jsx3.lang.NativeError.wrap(e);
      expect(ex).toBeInstanceOf(jsx3.lang.Exception);
    }
    if (ex != null) {
      expect(ex.getFileName()).not.toBeNull();
      expect(ex.getFileName()).toMatch("error.js");
    }
  });

  if (_jasmine_test.IE10 || !_jasmine_test.IE)
  it("should be able to return the line number in the javascript include where this error was raised", function(){
    var ex = null;
    try {
      var b = jasmine.fun();
    }catch (e) {
      ex = jsx3.lang.NativeError.wrap(e);
    }
    if(ex){
      expect(ex.getLineNumber()).not.toBeNull();
      expect(ex.getLineNumber()).toEqual(64);
      this.log(ex.printStackTrace());
    }
  });

});