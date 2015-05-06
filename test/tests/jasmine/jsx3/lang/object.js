/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.lang.Object", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.lang.Object", "jsx3.lang.Class");
  
  beforeEach(function(){
  
  });
  
  it("should be defined", function(){
    expect(jsx3).not.toBeNull();
    expect(jsx3.lang).not.toBeNull();
    expect(jsx3.lang.Object).not.toBeNull();
    expect(jsx3.lang.Object).toBeInstanceOf(Function);
  });
  
  it("has method equals() to return true those two objects are equals", function(){
    var o = new jsx3.lang.Object();
    expect(o.equals(o)).toBeTruthy();
    expect(o.equals(1)).toBeFalsy();
    expect(o.equals(true)).toBeFalsy();
    expect(o.equals(null)).toBeFalsy();
    expect(o.equals(new jsx3.lang.Object())).toBeFalsy();
    
    var o1 = new jsx3.lang.Object();
    o1.toString = function() { return "o"; };
    var o2 = new jsx3.lang.Object();
    o2.toString = function() { return "o"; };
    expect(o1.equals(o2)).toBeFalsy();
    expect(o1.equals("o")).toBeFalsy();
  });
  
  it("has method getClass() to return the class of the object", function(){
    var o = new jsx3.lang.Object();
    expect(o.getClass()).toEqual(jsx3.lang.Object.jsxclass);
  });
  
  it("has method clone() to return a shallow copy of the object", function(){
    var o = new jsx3.lang.Object();
    o.field = "value";
    var o2 = o.clone();
    expect(o.field).toEqual(o2.field);
    expect(o.equals(o2)).toBeFalsy();
    expect(o2).toBeInstanceOf(jsx3.lang.Object);
  });
  
  it("has method instanceOf() to determines whether the object is an instance of the parameter one", function(){
    var o = new jsx3.lang.Object();
    expect(o.instanceOf(jsx3.lang.Object)).toBeTruthy();
    expect(o.instanceOf("jsx3.lang.Object")).toBeTruthy();
    expect(o.instanceOf(jsx3.lang.Object.jsxclass)).toBeTruthy();
    expect(o.instanceOf(Object)).toBeTruthy();
    expect(o.instanceOf(jsx3.lang.Class)).toBeFalsy();
  });
  
  it("has method eval() to evalute a javascript expression in the context of the object with a controlled local variable context", function(){
    var o = new jsx3.lang.Object();
    o.field = "value";
    expect(o.eval("this.field")).toEqual(o.field);
    expect(o.eval("a", { a: 3 })).toEqual(3);
    expect(function(){
      o.eval("not.toBeDefined");
    }).toThrow();
  });
});
