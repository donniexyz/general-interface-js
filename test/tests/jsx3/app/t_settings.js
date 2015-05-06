/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.app.Settings", function(t, jsunit) {

  jsunit.require("jsx3.app.Settings");

  t.testNew = function() {
    var s = new jsx3.app.Settings();
    jsunit.assertInstanceOf(s, jsx3.app.Settings);
  };
  
  t.testEmpty = function() {
    var s = new jsx3.app.Settings();
    jsunit.assertUndefined(s.get("foo"));
  };
  
  t.testGetNumber = function() {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("number");
    jsunit.assertTypeOf(v, "number");
    jsunit.assertEquals(123, v);
  };
  
  t.testGetNaN = function() {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("numberNaN");
    jsunit.assertTypeOf(v, "number");
    jsunit.assert(isNaN(v));
  };
  
  t.testGetString = function() {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));
    var v = s.get("string");
    jsunit.assertTypeOf(v, "string");
    jsunit.assertEquals("aString", v);
  };
  
  t.testGetBoolean = function() {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));

    var v = s.get("boolean");
    jsunit.assertTypeOf(v, "boolean");
    jsunit.assertEquals(true, v);
    
    v = s.get("booleanFalse");
    jsunit.assertTypeOf(v, "boolean");
    jsunit.assertEquals(false, v);
  };
  
  t.testGetNull = function() {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));

    var v = s.get("null");
    jsunit.assertNull(v);
  };
  
  t.testGetArray = function() {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));

    var v = s.get("anArray");
    jsunit.assertInstanceOf(v, Array);
    jsunit.assertEquals(3, v.length);
    jsunit.assertEquals("one", v[0]);
    jsunit.assertEquals("two", v[1]);
    jsunit.assertEquals("three", v[2]);
  };
    
  t.testGetMap = function() {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));

    var v = s.get("anObject");
    jsunit.assertNotNullOrUndef(v);
    jsunit.assertTypeOf(v, "object");
    jsunit.assertEquals("one", v.string1);
    jsunit.assertEquals("two", v.string2);
    jsunit.assertEquals("three", v.string3);
  };

  t.testGetMapProp = function() {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));

    var v = s.get("anObject", "string1");
    jsunit.assertTypeOf(v, "string");
    jsunit.assertEquals("one", v);
    
    v = s.get("anObject", "stringx");
    jsunit.assertUndefined(v);
  };

  t.testRemove = function() {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));

    s.remove("number");
    jsunit.assertUndefined(s.get("number"));

    s.remove("anObject", "string2");
    var v = s.get("anObject");
    jsunit.assertNotNullOrUndef(v);
    jsunit.assertTypeOf(v, "object");
    jsunit.assertEquals("one", v.string1);
    jsunit.assertUndefined(v.string2);
  };

  t.testRemoveCache = function() {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));

    s.get("number");
    s.remove("number");
    jsunit.assertUndefined(s.get("number"));

    s.get("anObject");
    s.remove("anObject", "string2");
    var v = s.get("anObject");
    jsunit.assertNotNullOrUndef(v);
    jsunit.assertTypeOf(v, "object");
    jsunit.assertEquals("one", v.string1);
    jsunit.assertUndefined(v.string2);
  };

  t.testSetNumber = function() {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));

    s.set("newNumber", 1979);

    var v = s.get("newNumber");
    jsunit.assertTypeOf(s.getNode().toString(), v, "number");
    jsunit.assertEquals(s.getNode().toString(), 1979, v);
  };

  t.testSetNumberCache = function() {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));

    s.get("newNumber");
    s.set("newNumber", 1979);

    var v = s.get("newNumber");
    jsunit.assertTypeOf(s.getNode().toString(), v, "number");
    jsunit.assertEquals(s.getNode().toString(), 1979, v);
  };

  t.testSetString = function() {
    var s = new jsx3.app.Settings(new jsx3.xml.Document().load(t.resolveURI("data/settings1.xml")));

    s.set("newString", "2010");

    var v = s.get("newString");
    jsunit.assertTypeOf(s.getNode().toString(), v, "string");
    jsunit.assertEquals(s.getNode().toString(), "2010", v);
  };

});
