/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.app.DOM", function(t, jsunit) {

  jsunit.require("jsx3.app.DOM", "jsx3.app.Model", "jsx3.util.List");

  t.testNewId = function() {
    var id1 = jsx3.app.DOM.newId("ns1");
    var id2 = jsx3.app.DOM.newId("ns1");
    var id3 = jsx3.app.DOM.newId("ns2");

    jsunit.assertTypeOf(id1, "string");
    jsunit.assertNotEquals(id1, id2);
    jsunit.assertNotEquals(id1, id3);
  };

  t.testGetNamespaceForId = function() {
    var ns = "nsx";
    var id = jsx3.app.DOM.newId(ns);
    jsunit.assertEquals(ns, jsx3.app.DOM.getNamespaceForId(id));
  };

  t.testDestroy = function() {
    var d = new jsx3.app.DOM();
    var m = new jsx3.app.Model("name");
    m._jsxid = jsx3.app.DOM.newId("ns1");

    d.destroy();
    jsunit.assertThrows(function(){
      d.add(m);
    });
  };

  t.testGetById = function() {
    var d = new jsx3.app.DOM();
    var m = new jsx3.app.Model("name");
    m._jsxid = jsx3.app.DOM.newId("ns1");
    d.add(m);

    jsunit.assertEquals(m, d.get(m._jsxid));
    jsunit.assertEquals(m, d.getById(m._jsxid));
    jsunit.assertNullOrUndef(d.get(jsx3.app.DOM.newId("ns1")));
    jsunit.assertNullOrUndef(d.getById("anyOldId"));
  };

  t.testGetByName = function() {
    var d = new jsx3.app.DOM();
    var m = new jsx3.app.Model("name");
    m._jsxid = jsx3.app.DOM.newId("ns1");
    d.add(m);

    jsunit.assertEquals(m, d.get("name"));
    jsunit.assertEquals(m, d.getByName("name"));
    jsunit.assertNullOrUndef(d.get("aname"));
    jsunit.assertNullOrUndef(d.getByName("aname"));
  };

  t.testGetAllByName = function() {
    var d = new jsx3.app.DOM();
    var m1 = new jsx3.app.Model("name");
    m1._jsxid = jsx3.app.DOM.newId("ns1");
    var m2 = new jsx3.app.Model("name");
    m2._jsxid = jsx3.app.DOM.newId("ns1");
    d.add(m1);
    d.add(m2);

    var m = d.getAllByName("name");
    jsunit.assertInstanceOf(m, Array);
    jsunit.assertEquals(2, m.length);

    var l = jsx3.util.List.wrap(m);
    jsunit.assertTrue(l.contains(m1));
    jsunit.assertTrue(l.contains(m2));
  };

  t.testRemove1 = function() {
    var d = new jsx3.app.DOM();
    var m = new jsx3.app.Model("name");
    m._jsxid = jsx3.app.DOM.newId("ns1");

    d.add(m);
    jsunit.assertEquals(m, d.get(m._jsxid));

    d.remove(m);
    jsunit.assertNullOrUndef(d.get(m._jsxid));
  };

  t.testCollision = function() {
    var d = new jsx3.app.DOM();
    var m1 = new jsx3.app.Model("name");
    m1._jsxid = jsx3.app.DOM.newId("ns1");
    var m2 = new jsx3.app.Model("name");
    m2._jsxid = jsx3.app.DOM.newId("ns1");
    d.add(m1);
    d.add(m2);

    var m = d.get("name");
    jsunit.assertTrue(m1.equals(m) || m2.equals(m));

    d.remove(m1);
    jsunit.assertEquals(m2, d.get("name"));
  };

  t.testNameChange = function() {
    var d = new jsx3.app.DOM();
    var m1 = new jsx3.app.Model("name");
    m1._jsxid = jsx3.app.DOM.newId("ns1");

    d.add(m1);
    jsunit.assertEquals(m1, d.get("name"));

    m1.setName("name2");
    d.onNameChange(m1, "name");

    jsunit.assertNullOrUndef(d.get("name"));
    jsunit.assertEquals(m1, d.get("name2"));
  };

  t.testOnChange = function() {
    var d = new jsx3.app.DOM();

    var eventCount = 0;
    var eventType = null;
    d.subscribe(jsx3.app.DOM.EVENT_CHANGE, function(objEvent) {
      eventCount++;
      eventType = objEvent.type;
    });

    d.onChange(jsx3.app.DOM.TYPEADD);
    jsunit.assertEquals(1, eventCount);
    jsunit.assertEquals(jsx3.app.DOM.TYPEADD, eventType);

    d.onChange(jsx3.app.DOM.TYPEREMOVE);
    jsunit.assertEquals(2, eventCount);
    jsunit.assertEquals(jsx3.app.DOM.TYPEREMOVE, eventType);
  };

});
