/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.lang.Class", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.lang.Class","jsx3.lang.Exception", "jsx3.util.jsxpackage", "jsx3.lang.Package");

  //setup
  beforeEach( function() {
    jsx3.lang.Class.defineClass("test.jsx3ClassSuper", null,
      null, function(C, P){
        P.init = function(){};
        P.getValue = function(){
          return C.getDefaultValue();
        };
        C.getDefaultValue = function() { return 10; };
        P.getX = function(){
          return "x1";
        };
        P.getY = function(){
          return "y1";
        }
      });

    jsx3.lang.Class.defineInterface("test.jsx3ClassInterface", null, 	function(C, P){
      P.init = function() {};
      P.setValue = function(value) { this.value = value; };
      P.getX = function() { return "x2"; };
      P.getY = function() { return "y2"; };
    });

    jsx3.lang.Class.defineClass("test.jsx3Class", test.jsx3ClassSuper, [test.jsx3ClassInterface], function(C, P){
      C.sField = 1;
      P.iField = 2;
      P.init = function(value) { this.value = value; this.inited = true; };
      P.getValue = function() { return this.value; };
      P.isOn = function() { return this.on; };
      P.setOn = function(on) { this.on = on; };
      P.getX = function() { return this.jsxsuper(); };
      P.getY = function() { return this.jsxsupermix(); };
    });

    jsx3.lang.Class.defineClass("test.jsx3Class.Inner", null, null, function(C, P){
      P.init = function() {};
    });
  });
  // end setup

  it("should be defined", function(){
    expect(jsx3).not.toBeNull();
    expect(jsx3.lang).not.toBeNull();
    expect(jsx3.lang.Class).not.toBeNull();
  });

  it("should be able to retrieve an instance of jsx3.Class for a fully-qualified class name", function(){
    expect(jsx3.lang.Class.forName("test.jsx3Class")).toEqual(test.jsx3Class.jsxclass);
    expect(jsx3.lang.Class.forName("test.jsx3Class.foo")).toBeNull();
  });

  it("should be able to return the fully-qualified name using getName()", function(){
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    expect(c.getName()).toEqual("test.jsx3Class")
  });

  it("should be able to return a package using getPackage()", function() {
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    expect(c.getPackage()).toBeNull();
    expect(c.getPackageName()).toEqual("test");

    jsx3.lang.Package.definePackage("test", function() {});
    expect(c.getPackage()).not.toBeNull();
    expect(jsx3.lang.Package.forName("test")).toEqual(c.getPackage());
  });

  it("should be able to return the constructor function", function(){
    var o = new  test.jsx3Class(22);
    expect(o).not.toBeNull();
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    expect(c.getConstructor()).not.toBeNull();
    expect(c.getConstructor()).toEqual(test.jsx3Class);
  });

  it("should be able return this class was defined as an interface", function(){
    expect(jsx3.lang.Class.forName("test.jsx3Class").isInterface()).toBeFalsy();
    expect(jsx3.lang.Class.forName("test.jsx3ClassSuper").isInterface()).toBeFalsy();
    expect(jsx3.lang.Class.forName("test.jsx3ClassInterface").isInterface()).toBeTruthy();
  });

  it("should be able to create a interface", function(){
    expect(function(){
      var o= new test.jsx3ClassInterface();
    }).toThrow();
    var c = jsx3.lang.Class.forName("test.jsx3ClassInterface");
    expect(function(){
      var o = c.newInstance();
    }).toThrow();
  });

  it("should be able to create a new instance of this class by invoking the class constructor", function(){
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    var o = c.newInstance(5);
    expect(o).not.toBeNull();
    expect(o).toBeInstanceOf(test.jsx3Class);
    expect(o.getValue()).toEqual(5);
  });

  it("has method isInstance() that determines whether an object is an instance of this class", function(){
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    var o = new test.jsx3Class(22);
    expect(c.isInstance(o)).toBeTruthy();
    expect(function(){
      return c.isInstance(null);
    }).toThrow();
    expect(c.isInstance(1)).toBeFalsy();
    expect(c.isInstance(new Object())).toBeFalsy();
    expect(test.jsx3ClassSuper.jsxclass.isInstance(o)).toBeTruthy();
    expect(test.jsx3ClassInterface.jsxclass.isInstance(o)).toBeTruthy();
  });

  it("has method isAssignableFrom(objClass) that dermine whether this class is the same as or is a superclass or superinterface of parameter objClass", function(){
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    expect(c.isAssignableFrom(c));
    expect(function(){
      return c.isAssignableFrom(null);
    }).toThrow();
    expect(c.isAssignableFrom(test.jsx3ClassSuper.jsxclass)).toBeFalsy();
    expect(c.isAssignableFrom(test.jsx3ClassInterface.jsxclass)).toBeFalsy();

    expect(test.jsx3ClassSuper.jsxclass.isAssignableFrom(c)).toBeTruthy();
    expect(test.jsx3ClassInterface.jsxclass.isAssignableFrom(c)).toBeTruthy();

    expect(test.jsx3ClassSuper.jsxclass.isAssignableFrom(test.jsx3ClassInterface.jsxclass)).toBeFalsy();
    expect(test.jsx3ClassInterface.jsxclass.isAssignableFrom(test.jsx3ClassSuper.jsxclass)).toBeFalsy();
  });

  it("has method mixin() that copy all the instance methods in this class into another instance", function(){
    var o = new Object();
    expect(o.getValue).not.toBeDefined();
    var c = test.jsx3Class.jsxclass;
    c.mixin(o);
    expect(o.getValue).toBeInstanceOf(Function);
    o.value = 79;
    expect(o.value).toEqual(o.getValue());

    var getVal = function(){};
    o = new Object();
    o.getValue = getVal;
    c.mixin(o, true);
    expect(getVal).toEqual(o.getValue);
    c.mixin(o);
    expect(getVal).not.toEqual(o.getValue);

  });

  it("has method bless(obj) that creates a new instance of the class and populates its properties with the properties of the obj parameter", function(){
    var c = test.jsx3Class.jsxclass;
    var m ={f1:"v1", f2:"v2", fct:function(){}};
    var o = c.bless(m);
    expect(o).toBeInstanceOf(test.jsx3Class);
    expect(o.f1).toEqual("v1");
    expect(o.f2).toEqual("v2");
    expect(o.fct).not.toBeDefined();
    expect(o.inited).not.toBeDefined();
  });

  it("has method newInnerClass() that create a new instance of this class and extending this class", function(){
    var c =jsx3.lang.Class.forName("test.jsx3Class");
    var o = c.newInnerClass(15);
    expect(o).toBeInstanceOf(test.jsx3Class);
    expect(o.getValue()).toEqual(15);

    c = jsx3.lang.Class.forName("test.jsx3ClassInterface");
    o = c.newInnerClass();
    expect(o).toBeInstanceOf(test.jsx3ClassInterface);
    o.setValue(20);
    expect(o.getValue).not.toBeDefined();
    expect(o.value).toEqual(20);
  });

  it("has method getStaticMethods() that return the array of static methods defined for given class", function(){
    var c = jsx3.lang.Class.forName("test.jsx3ClassSuper");
    var m = c.getStaticMethods();
    expect(m.length).toEqual(1);
    expect(test.jsx3ClassSuper.getDefaultValue.jsxmethod).toEqual(m[0]);
    expect(test.jsx3ClassSuper.getDefaultValue.jsxmethod).toEqual(c.getStaticMethod("getDefaultValue"));
    expect(c.getStaticMethod("setDefaultValue")).toBeNull();
    c = jsx3.lang.Class.forName("test.jsx3Class");
    m = c.getStaticMethods();
    expect(m.length).toEqual(0);
  });

  it("has method getInstanceMethods() that reutrn the instance methods defined for given class", function() {
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    var m = c.getInstanceMethods();

    expect(m.length).toEqual(6);
    expect(c.getInstanceMethod("isOn")).toBeInstanceOf(jsx3.lang.Method);
    expect(c.getInstanceMethod("setOn")).toBeInstanceOf(jsx3.lang.Method);
    expect(c.getInstanceMethod("foo")).toBeNull();
    expect(c.getInstanceMethod("setValue")).toBeNull(); // not inherited
  });


  it("has method getStaticFieldNames() that return the array of static fields defined for given class", function(){
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    var f = c.getStaticFieldNames();
    expect(f.length).toEqual(1);
    expect(f[0]).toEqual("sField");
  });

  it("has method getInstanceFieldNames() that return the array of instance fields defined for this class", function(){
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    var f = c.getInstanceFieldNames();
    expect(f.length).toEqual(1);
    expect(f[0]).toEqual("iField");
  });

  it("has getGetter() and getSetter() that return a given mutator method of this class", function(){
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    expect(test.jsx3Class.prototype.getValue.jsxmethod).toEqual(c.getGetter("value"));
    expect(test.jsx3Class.prototype.setValue.jsxmethod).toEqual(c.getSetter("value"));
    expect(test.jsx3Class.prototype.isOn.jsxmethod).toEqual(c.getGetter("on"));
    expect(test.jsx3Class.prototype.setOn.jsxmethod).toEqual(c.getSetter("on"));
    expect(c.getGetter("foo")).toBeNull();
    expect(c.getSetter("foo")).toBeNull();
  });

  it("has method getInterfaces() to get the array of interfaces that this class was defined to implement", function(){
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    try{
      var o1 = new test.jsx3Class();
      jsx3.Class.defineInterface(
        "test.jsx3ClassInterface2", null, function(C,P){
          P.newMethod = function(){};
        });
      expect(test.jsx3ClassInterface2).not.toBeNull();
      c.addInterface(test.jsx3ClassInterface2.jsxclass);

      var o2 = new test.jsx3Class();

      expect(o1.instanceOf("test.jsx3ClassInterface2")).toBeTruthy();
      expect(o1.newMethod).toBeInstanceOf(Function);
      expect(o2.instanceOf("test.jsx3ClassInterface2")).toBeTruthy();
      expect(o2.newMethod).toBeInstanceOf(Function);

      var interfaces = c.getInterfaces();
      expect(interfaces[0]).toEqual(test.jsx3ClassInterface2.jsxclass);
    }catch(e){
      //
    }
    finally{
      delete test.jsx3ClassInterface2;
    }
  });

  it("has method getClasses() that return an array of all the sub classes of given class", function(){
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    var classes = c.getClasses();

    expect(classes.length).toEqual(1);
    expect(test.jsx3Class.Inner.jsxclass).toEqual(classes[0]);
  });

  it("has method getSuperClass() to get the super class of given class", function(){
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    expect(test.jsx3ClassSuper.jsxclass).toEqual(c.getSuperClass());

    var interfaces = c.getInterfaces();
    expect(interfaces.length).toEqual(1);

    expect(test.jsx3ClassInterface.jsxclass).toEqual(interfaces[0]);
    expect(test.jsx3ClassInterface.jsxclass.getSuperClass()).not.toBeDefined();
    expect(test.jsx3ClassSuper.jsxclass.getSuperClass()).toEqual(jsx3.lang.Object.jsxclass);
  });

  /* jsx3Class -
   getX = function() { return this.jsxsuper(); };
   getY = function() { return this.jsxsupermix(); };
   */
  it("should call jsxsuper or jsxsupermix implmentation of given method", function(){
    var o = new test.jsx3Class();
    expect(o.getX()).toEqual("x1");
    expect(o.getY()).toEqual("y2");
  });

  afterEach(function () {
    delete test.jsx3Class.Inner.jsxclass;
    delete test.jsx3Class.Inner;
    delete test.jsx3ClassSuper.jsxclass;
    delete test.jsx3ClassSuper;
    delete test.jsx3ClassInterface.jsxclass;
    delete test.jsx3ClassInterface;
    delete test.jsx3Class.jsxclass;
    delete test.jsx3Class;
    delete test.jsxpackage;
  });

});