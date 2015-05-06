/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.lang.Package; The Package class provides an introspectable API for JavaScript/JSX packages.", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.util.jsxpackage", "jsx3.lang.Package", "jsx3.util.List");
  
  beforeEach(function(){
  
    jsx3.lang.Package.definePackage("test.pckg", function(P){
      P.aField = 1;
      //P.sMethod = function(){return "static Method";}
      P.aMethod = function(){
      };
    });
    jsx3.lang.Class.defineClass("test.pckg.Class", null, null, function(C, P){
    });
  });
  
  it("should return the defined package with name equal to the given name using forName()", function(){
    expect(jsx3.lang.Package.forName("test.pckg")).toEqual(test.pckg.jsxpackage);
    expect(jsx3.lang.Package.forName("test.pckg.foo")).toBeNull();
  });
  
  it("should return a list of all defined packages using getPackages()", function(){
    var p = jsx3.lang.Package.getPackages();
    expect(p).toBeInstanceOf(Array);
    expect(p.length >= 1).toBeTruthy();
    
    var l = new jsx3.util.List(p);
    expect(l.contains(test.pckg.jsxpackage));
  });
  
  it("should return an array of all the classes defined in the package using getClasses()", function(){
    var p = jsx3.lang.Package.forName("test.pckg");
    var c = p.getClasses();
    expect(c.length).toEqual(1);
    expect(c[0]).toEqual(test.pckg.Class.jsxclass);
  });
  
  it("should return the fully-qualified name of the class using getName()", function(){
    var p = jsx3.lang.Package.forName("test.pckg");
    expect(p.getName()).toEqual("test.pckg");
  });
  
  it("should return the namespace of the package using getNamespace()", function(){
    var p = jsx3.lang.Package.forName("test.pckg");
    expect(p.getNamespace()).not.toBeNull();
    expect(p.getNamespace()).toBeDefined();
    expect(p.getNamespace()).toEqual(test.pckg);
  });
  
  it("should return the array of static fields defined for the package using getStaticFieldNames()", function(){
    var p = jsx3.lang.Package.forName("test.pckg");
    var f = p.getStaticFieldNames();
    expect(f.length).toEqual(1);
    expect(f[0]).toEqual("aField");
  });
  
  it("should return the static method defined in the package with name using getStaticMethod()", function(){
    var p = jsx3.lang.Package.forName("test.pckg");
    var f = p.getStaticMethod("aMethod");
    expect(f).toBeInstanceOf(jsx3.lang.Method);
  });
  
  it("should return the array of static methods defined for the package using getStaticMethods()", function(){
    var p = jsx3.lang.Package.forName("test.pckg");
    var f = p.getStaticMethods();
    expect(f.length).toEqual(2);
    expect(f[0]).toEqual(test.pckg.aMethod.jsxmethod)
  });
});
