/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.lang.Method", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.lang.Class", "jsx3.lang.Exception", "jsx3.util.jsxpackage");
  
  beforeEach(function(){
    jsx3.lang.Class.defineClass("test.jsx3Method", null, null, function(C, P){
      P.init = function() {};
      P.function1 = function(arg1, arg2, arg3) { return this.getValue() + arg1 + arg2; };
      P.getValue = function() { return this.value; };
      P.abstractFunction = jsx3.lang.Method.newAbstract("arg1", "arg2");
      C.staticFunction = function(arg1) { return arg1 * 2; };
    });
  });
  
  it("should be defined", function(){
    expect(jsx3).not.toBeNull();
    expect(jsx3.lang).not.toBeNull();
    expect(jsx3.lang.Method).not.toBeNull();
  });
  
  it("should fail to instantiate a method when instantiating empty method", function(){
    expect(function(){
      return new jsx3.lang.Method();
    }).toThrow();
  });
  
  it("should be able to get method meta data", function(){
    expect(test.jsx3Method.prototype.function1.jsxmethod).toBeInstanceOf(jsx3.lang.Method);
  });
  
  it("has method getName() that return the name of the method", function(){
    expect(test.jsx3Method.prototype.function1.jsxmethod.getName()).toEqual("function1");
  });
  
  it("has method getParametersNames() that return the name of a paramether that the method takes", function(){
    var m = test.jsx3Method.prototype.function1.jsxmethod;
    expect(m.getArity()).toEqual(3);
    var params = m.getParameterNames();
    expect(params.length).toEqual(3);
    expect(params[0]).toEqual("arg1");
    expect(params[1]).toEqual("arg2");
    expect(params[2]).toEqual("arg3");
  });
  
  it("has method getDeclaringClass() that return the class that defined given method", function(){
    var m = test.jsx3Method.prototype.function1.jsxmethod;
    var jclass = m.getDeclaringClass();
    expect(jclass).toEqual(test.jsx3Method.jsxclass);
    expect(m.isPackageMethod()).toBeFalsy();
  });
  
  it("has method isStatic()that tells if the method is static", function(){
    var m1 = test.jsx3Method.prototype.function1.jsxmethod;
    var m2 = test.jsx3Method.staticFunction.jsxmethod;
    expect(m1.isStatic()).toBeFalsy();
    expect(m2.isStatic()).toBeTruthy();
  });
  
  it("has method isAbstract() that return whether the method is abstract", function(){
    var m = test.jsx3Method.prototype.abstractFunction.jsxmethod;
    expect(test.jsx3Method.prototype.function1.jsxmethod.isAbstract()).toBeFalsy();
    expect(test.jsx3Method.staticFunction.jsxmethod.isAbstract()).toBeFalsy();
    expect(m.isAbstract()).toBeTruthy();
    var params = m.getParameterNames();
    expect(params.length).toEqual(2);
    expect(params[0]).toEqual("arg1");
    expect(params[1]).toEqual("arg2");
    expect(params[1]).toMatch(/arg2/); // Chrome returns "arg2 /**/" for some reason.
    var o = new test.jsx3Method();
    expect(function(){
      o.abstractFunction();
    }).toThrow();
  });
  
  it("should be able to return the native javascript function of the menthod", function(){
    expect(test.jsx3Method.prototype.function1.jsxmethod.getFunction()).toEqual(test.jsx3Method.prototype.function1);
    expect(test.jsx3Method.staticFunction.jsxmethod.getFunction()).toEqual(test.jsx3Method.staticFunction);
  });
  
  it("should be able call on the native function", function(){
    var o = new test.jsx3Method();
    o.value = 10;
    var m = test.jsx3Method.prototype.function1.jsxmethod;
    expect(m.apply(o, [7, 11, 3])).toEqual(28);
    expect(m.call(o, 7, 11, 3)).toEqual(28);
    expect(function(){
      m.apply(null, [7, 11, 3]);
    }).toThrow();
    expect(function(){
      m.call(null, 7, 11, 3);
    }).toThrow();
    
  });
  
  afterEach(function(){
    delete test.jsx3Method.jsxclass;
    delete test.jsx3Method;
  });
});
