/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.app.DOM - Registers all DOM nodes in an instance of jsx3.app.Server and publishes related event", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.app.DOM", "jsx3.app.Model", "jsx3.util.List");

  it("should be able to create new unique system id using static method newId()", function () {
    var id1 = jsx3.app.DOM.newId("ns1");
    var id2 = jsx3.app.DOM.newId("ns1");
    var id3 = jsx3.app.DOM.newId("ns2");
    expect(id1).toBeTypeOf("string");
    expect(id1).not.toEqual(id2);
    expect(id1).not.toEqual(id3);
  });

  it("has method getNamespaceForId() that returns the app namespace from given DOM ID", function () {
    var ns = "nsx";
    var id = jsx3.app.DOM.newId(ns);
    expect(jsx3.app.DOM.getNamespaceForId(id)).toEqual(ns);
  });

  it("has method destroy() that finalizes/deletes the DOM instance itself", function () {
    var d = new jsx3.app.DOM();
    var m = new jsx3.app.Model("name");
    m._jsxid = jsx3.app.DOM.newId("ns1");
    d.destroy();
    var func = function () {
      d.add(m);
    };
    expect(func).toThrow();
  });

  it("has method getById() that returns a DOM node contained in this DOM by id", function () {
    var d = new jsx3.app.DOM();
    var m = new jsx3.app.Model("name");
    m._jsxid = jsx3.app.DOM.newId("ns1");
    d.add(m);
    expect(d.get(m._jsxid)).toEquals(m);
    expect(d.getById(m._jsxid)).toEquals(m);
    expect(d.get(jsx3.app.DOM.newId("ns1"))).toBeNull();
    expect(d.getById("anyOldId")).toBeUndefined();
  });

  it("has method getByName() that returns a DOM node contained in this DOM by name", function () {
    var d = new jsx3.app.DOM();
    var m = new jsx3.app.Model("name");
    m._jsxid = jsx3.app.DOM.newId("ns1");
    d.add(m);
    expect(d.get("name")).toEquals(m);
    expect(d.getByName("name")).toEquals(m);
    expect(d.get("aname")).toBeNull();
    expect(d.getByName("aname")).toBeNull();
  });

  it("has method getAllByName() that returns all DOM nodes in this DOM with given name", function () {
    var d = new jsx3.app.DOM();
    var m1 = new jsx3.app.Model("name");
    m1._jsxid = jsx3.app.DOM.newId("ns1");
    var m2 = new jsx3.app.Model("name");
    m2._jsxid = jsx3.app.DOM.newId("ns1");
    d.add(m1);
    d.add(m2);
    var m = d.getAllByName("name");
    expect(m).toBeInstanceOf(Array);
    expect(m.length).toEqual(2);
    var l = jsx3.util.List.wrap(m);
    expect(l.contains(m1)).toBeTruthy();
    expect(l.contains(m2)).toBeTruthy();
  });

  it("has method remove() that will remove a Model node from a DOM registry", function () {
    var d = new jsx3.app.DOM();
    var m = new jsx3.app.Model("name");
    m._jsxid = jsx3.app.DOM.newId("ns1");
    d.add(m);
    expect(d.get(m._jsxid)).toEquals(m);
    d.remove(m);
    expect(d.get(m._jsxid)).toBeNull();
  });

  it("should be able add and resolve DOM name collision", function () {
    var d = new jsx3.app.DOM();
    var m1 = new jsx3.app.Model("name");
    m1._jsxid = jsx3.app.DOM.newId("ns1");
    var m2 = new jsx3.app.Model("name");
    m2._jsxid = jsx3.app.DOM.newId("ns1");
    d.add(m1);
    d.add(m2);
    var m = d.get("name");
    expect(m1.equals(m) || m2.equals(m)).toBeTruthy();
    d.remove(m1);
    expect(d.get("name")).toEquals(m2);
  });

  //Using Spy
  it("should trigger onNameChange() to be called after changing the name of a contained DOM node", function () {
    var d = new jsx3.app.DOM();
    var m1 = new jsx3.app.Model("name");
    m1._jsxid = jsx3.app.DOM.newId("ns1");
    d.add(m1);
    expect(d.get("name")).toEquals(m1);
    m1.setName("name2");
    spyOn(d, "onNameChange").andCallThrough();
    d.onNameChange(m1, "name");
    expect(d.onNameChange).toHaveBeenCalled();
    expect(d.get("name")).toBeUndefined();
    expect(d.get("name2")).toEquals(m1);
  });

  it("should be able to subscribe to the DOM change event", function () {
    var d = new jsx3.app.DOM();
    var eventCount = 0;
    var eventType = null;
    d.subscribe(jsx3.app.DOM.EVENT_CHANGE, function (objEvent) {
      eventCount++;
      eventType = objEvent.type;
    });
    d.onChange(jsx3.app.DOM.TYPEADD); // manually trigger TYPEADD change
    expect(eventCount).toEqual(1);
    expect(jsx3.app.DOM.TYPEADD).toEqual(eventType);

    d.onChange(jsx3.app.DOM.TYPEREMOVE); // manually trigger TYPEREMOVE change
    expect(eventCount).toEqual(2);
    expect(jsx3.app.DOM.TYPEREMOVE).toEqual(eventType);
  });
});
