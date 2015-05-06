/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.app.Settings", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.app.Settings");
  var t = new _jasmine_test.App("jsx3.app.Settings");

  it("should be able to instantiate new instance of jsx3.app.Settings", function () {
    var s = new jsx3.app.Settings();
    expect(s).toBeInstanceOf(jsx3.app.Settings);
  });

  it("should return undefined for a non stored setting value", function () {
    var s = new jsx3.app.Settings();
    expect(s.get("foo")).toBeUndefined();
  });

  it("should return a stored setting value of type number from the loaded xml", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("number");
    expect(v).toBeTypeOf("number");
    expect(v).toEqual(123);
  });

  it("should return a stored setting value of type number and value illegal number from the loaded xml", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("numberNaN");
    expect(v).toBeTypeOf("number");
    expect(isNaN(v)).toBeTruthy();
  });

  it("should return a stored setting value of type string from the loaded xml", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("string");
    expect(v).toBeTypeOf("string");
    expect(v).toEqual("aString");
  });

  it("should return a stored setting value of type boolean from the loaded xml", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("boolean");
    expect(v).toBeTypeOf("boolean");
    expect(v).toEqual(true);
    v = s.get("booleanFalse");
    expect(v).toBeTypeOf("boolean");
    expect(v).toEqual(false);
  });

  it("should return a stored setting value of type null from the loaded xml", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("null");
    expect(v).toBeNull();
  });

  it("should return a stored setting value of type array from the loaded xml", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("anArray");
    expect(v).toBeInstanceOf(Array);
    expect(v.length).toEqual(3);
    expect(v[0]).toEqual("one");
    expect(v[1]).toEqual("two");
    expect(v[2]).toEqual("three");
  });

  it("should return an object.property map", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("anObject");
    expect(v).not.toBeUndefined();
    expect(v).not.toEqual(null);
    expect(v).toBeTypeOf("object");
    expect(v.string1).toEqual("one");
    expect(v.string2).toEqual("two");
    expect(v.string3).toEqual("three");

  });

  it("should return a property of an object.property map", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("anObject", "string1");
    expect(v).toBeTypeOf("string");
    expect(v).toEqual("one");
    v = s.get("anObject", "stringx");
    expect(v).toBeUndefined();
  });

  it("should remove a property from a map object.property", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    s.remove("number");
    expect(s.get("number")).toBeUndefined();

    s.remove("anObject", "string2");
    var v = s.get("anObject");
    expect(v).not.toBeNull();
    expect(v).toBeTypeOf("object");
    expect(v.string1).toEqual("one");
    expect(v.string2).toBeUndefined();
  });

  it("should remove a property from a map object.property cache", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    s.get("number");
    s.remove("number");

    expect(s.get("number")).toBeUndefined();
    s.get("anObject");
    s.remove("anObject", "string2");
    var v = s.get("anObject");

    expect(v).not.toBeUndefined();
    expect(v).not.toEqual(null);
    expect(v).toBeTypeOf("object");
    expect(v.string1).toEqual("one");
    expect(v.string2).toBeUndefined();
  });

  it("should set a setting value of type Number", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));

    s.set("newNumber", 1979);
    var v = s.get("newNumber");

    expect(v).toBeTypeOf("number");
    expect(v).toEqual(1979);
  });

  it("should set a setting value cache of type Number", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));

    s.get("newNumber");
    s.set("newNumber", 1979);
    var v = s.get("newNumber");

    expect(v).toBeTypeOf("number");
    expect(v).toEqual(1979);
  });

  it("should set a setting value of type String", function () {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    s.set("newString", "2010");
    var v = s.get("newString");

    expect(v).toBeTypeOf("string");
    expect(v).toEqual("2010")
  });

});


