/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.lang", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.lang.getCaller");
  
  it("should be able to getCaller", function(){
    var a = function() {
      return jsx3.lang.getCaller();
    };
    var b = function() { return a(); };
    var c = function() { return a(); };
    expect(b).toEqual(b());
    expect(c).toEqual(c());
  });
  
  it("should be able to getCallerUp", function(){
    var a = function() {
      return jsx3.lang.getCaller(1);
    };
    var x = function() { return a(); };
    var b = function() { return x(); };
    var c = function() { return x(); };
    expect(b).toEqual(b());
    expect(c).toEqual(c());
  });
  
  it("should be able to getStack", function(){
    var a = function() {
      return jsx3.lang.getStack();
    };
    var b = function() { return a(); };
    var c = function() { return b(); };
    
    var stack = c();
    expect(stack).toBeInstanceOf(Array);
    expect(stack.length >= 2).toBeTruthy();
    expect(stack[0]).toEqual(b);
    expect(stack[1]).toEqual(c);
  });
  
  it("should be able to getStackUp", function(){
    var a = function() {
      return jsx3.lang.getStack(-1);
    };
    var b = function() { return a(); };
    var c = function() { return b(); };

    var stack = c();
    expect(stack).toBeInstanceOf(Array);
    expect(stack.length >= 3).toBeTruthy();
    expect(a).toEqual(stack[0]);
    expect(b).toEqual(stack[1]);
    expect(c).toEqual(stack[2]);
  });
  
});
