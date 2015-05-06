/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.app.Properties", function(t, jsunit) {

  jsunit.require("jsx3.app.Properties", "jsx3.util.List",
      "jsx3.app.PropsBundle", "jsx3.util.Locale", "jsx3.app.Cache");

  t.testNew = function() {
    var p = new jsx3.app.Properties();
    jsunit.assertInstanceOf(p, jsx3.app.Properties);
  };

  t.testGetSet = function() {
    var p = new jsx3.app.Properties();
    jsunit.assertUndefined(p.get("key"));
    p.set("key", "value");
    jsunit.assertEquals("value", p.get("key"));
    p.remove("key");
    jsunit.assertUndefined(p.get("key"));
  };

  t.testNull = function() {
    var p = new jsx3.app.Properties();
    jsunit.assertUndefined(p.get("key"));
    p.set("key", null);
    jsunit.assertNull(p.get("key"));

    jsunit.assertThrows(function(){
      return p.set("key", t._undefined);
    });
    
    p.remove("key");
    jsunit.assertUndefined(p.get("key"));
  };

  t.testKeys = function() {
    var p = new jsx3.app.Properties();
    p.set("key1", "value1");
    p.set("key2", "value2");
    var p2 = new jsx3.app.Properties();
    p2.set("key3", "value3");
    p.addParent(p2);

    var keys = p.getKeys();
    jsunit.assertInstanceOf(keys, Array);
    jsunit.assertEquals(2, keys.length);

    var l = jsx3.util.List.wrap(keys);
    jsunit.assertTrue(l.contains("key1"));
    jsunit.assertTrue(l.contains("key2"));
    jsunit.assertFalse(l.contains("key3"));
  };

  t.testContainsKey = function() {
    var p = new jsx3.app.Properties();
    p.set("key1", "value1");
    p.set("key2", "value2");
    var p2 = new jsx3.app.Properties();
    p2.set("key3", "value3");
    p.addParent(p2);

    jsunit.assertTrue(p.containsKey("key1"));
    jsunit.assertTrue(p.containsKey("key2"));
    jsunit.assertFalse(p.containsKey("key3"));
    jsunit.assertTrue(p2.containsKey("key3"));
  };

  t.testParentsGet = function() {
    var p = new jsx3.app.Properties();
    p.set("key1", "value1");
    var p2 = new jsx3.app.Properties();
    p2.set("key2", "value2");
    p.addParent(p2);

    jsunit.assertEquals("value1", p.get("key1"));
    jsunit.assertEquals("value2", p.get("key2"));
  };

  t.testParentsSet = function() {
    var p = new jsx3.app.Properties();
    var p2 = new jsx3.app.Properties();
    p2.set("key2", "value2");
    p.addParent(p2);

    jsunit.assertEquals("value2", p.get("key2"));
    jsunit.assertEquals("value2", p2.get("key2"));

    p2.set("key2", "value3");
    jsunit.assertEquals("value3", p.get("key2"));
    jsunit.assertEquals("value3", p2.get("key2"));

    p.set("key2", "value4");
    jsunit.assertEquals("value4", p.get("key2"));
    jsunit.assertEquals("value3", p2.get("key2"));
  };

  t.testParentsRemove = function() {
    var p = new jsx3.app.Properties();
    var p2 = new jsx3.app.Properties();
    p2.set("key2", "value2");
    p.addParent(p2);

    jsunit.assertEquals("value2", p.get("key2"));

    p.removeParent(p2);

    jsunit.assertUndefined(p.get("key2"));
  };

  t.testGrandparentSet = function() {
    var p1 = new jsx3.app.Properties();
    var p2 = new jsx3.app.Properties();
    var p3 = new jsx3.app.Properties();
    p1.addParent(p2);
    p2.addParent(p3);

    p3.set("key2", "value2");
    jsunit.assertEquals("value2", p1.get("key2"));
    jsunit.assertEquals("value2", p2.get("key2"));

    p3.set("key2", "value3");
    jsunit.assertEquals("value3", p1.get("key2"));
    jsunit.assertEquals("value3", p2.get("key2"));

    p3.remove("key2");
    jsunit.assertUndefined(p1.get("key2"));
    jsunit.assertUndefined(p2.get("key2"));

    p1.set("key2", "value4");
    jsunit.assertEquals("value4", p1.get("key2"));
  };

  t.testGrandparentSetPrec = function() {
    var p1 = new jsx3.app.Properties();
    var p2 = new jsx3.app.Properties();
    var p3 = new jsx3.app.Properties();
    p1.addParent(p2);
    p2.addParent(p3);

    p3.set("key1", "value1");
    jsunit.assertEquals("value1", p3.get("key1"));
    jsunit.assertEquals("value1", p2.get("key1"));
    jsunit.assertEquals("value1", p1.get("key1"));

    p2.set("key1", "value2");
    jsunit.assertEquals("value1", p3.get("key1"));
    jsunit.assertEquals("value2", p2.get("key1"));
    jsunit.assertEquals("value2", p1.get("key1"));

    p1.set("key1", "value3");
    jsunit.assertEquals("value1", p3.get("key1"));
    jsunit.assertEquals("value2", p2.get("key1"));
    jsunit.assertEquals("value3", p1.get("key1"));

    p1.remove("key1");
    jsunit.assertEquals("value1", p3.get("key1"));
    jsunit.assertEquals("value2", p2.get("key1"));
    jsunit.assertEquals("value2", p1.get("key1"));

    p2.remove("key1");
    jsunit.assertEquals("value1", p3.get("key1"));
    jsunit.assertEquals("value1", p2.get("key1"));
    jsunit.assertEquals("value1", p1.get("key1"));

    p3.remove("key1");
    jsunit.assertNullOrUndef("grandparent 1", p3.get("key1"));
    jsunit.assertNullOrUndef("parent 1", p2.get("key1"));
    jsunit.assertNullOrUndef("child 1", p1.get("key1"));

    // reverse check order
    p3.set("key1", "value1");
    jsunit.assertEquals("value1", p1.get("key1"));
    jsunit.assertEquals("value1", p2.get("key1"));
    jsunit.assertEquals("value1", p3.get("key1"));

    p3.remove("key1");
    jsunit.assertNullOrUndef("child 2", p1.get("key1"));
    jsunit.assertNullOrUndef("parent 2", p2.get("key1"));
    jsunit.assertNullOrUndef("grandparent 2", p3.get("key1"));
  };

  t.testGrandparentRemove = function() {
    var p1 = new jsx3.app.Properties();
    var p2 = new jsx3.app.Properties();
    var p3 = new jsx3.app.Properties();
    p1.addParent(p2);
    p2.addParent(p3);

    p3.set("key2", "value2");
    jsunit.assertEquals("value2", p1.get("key2"));

    p2.removeParent(p3);
    jsunit.assertUndefined(p1.get("key2"));
  };

  t.testGrandparentRemoveAll = function() {
    var p1 = new jsx3.app.Properties();
    var p2 = new jsx3.app.Properties();
    var p3 = new jsx3.app.Properties();
    p1.addParent(p2);
    p2.addParent(p3);

    p3.set("key", "value1");
    jsunit.assertEquals("value1", p1.get("key"));

    p2.removeAllParents();
    jsunit.assertUndefined(p1.get("value1"));

    p3 = new jsx3.app.Properties();
    p2.addParent(p3);

    p3.set("key", "value2");
    jsunit.assertEquals("value2", p1.get("key"));

    // try without the interim check for undefined
    p2.removeAllParents();
    p3 = new jsx3.app.Properties();
    p2.addParent(p3);
    p3.set("key", "value3");
    jsunit.assertEquals("value3", p1.get("key"));
  };

  t.testParentsPrecedence = function() {
    var p = new jsx3.app.Properties();
    var p1 = new jsx3.app.Properties();
    p1.set("key1", "value1");
    var p2 = new jsx3.app.Properties();
    p2.set("key1", "value2");

    jsunit.assertUndefined(p.get("key1"));
    p.addParent(p1);
    jsunit.assertEquals("value1", p.get("key1"));
    p.addParent(p2);
    jsunit.assertEquals("value2", p.get("key1"));
    p.removeParent(p2);
    jsunit.assertEquals("value1", p.get("key1"));
  };

  t.testLoadXml = function() {
    var d = (new jsx3.xml.Document()).load(t.resolveURI("data/props1.xml"));
    var p = new jsx3.app.Properties();
    p.loadXML(d);
    jsunit.assertEquals("value1", p.get("key1"));
    jsunit.assertEquals("value2", p.get("key2"));
    jsunit.assertEquals("value3", p.get("key3"));
    jsunit.assertUndefined(p.get("key4"));
  };

  t.testLoadEval = function() {
    var d = (new jsx3.xml.Document()).load(t.resolveURI("data/props1.xml"));
    var p = new jsx3.app.Properties();
    p.loadXML(d);
    jsunit.assertEquals(18, p.get("eval1"));
    jsunit.assertEquals("2n * 9", p.get("eval2"));
  };

  t.testSpaces1 = function() {
    var d1 = (new jsx3.xml.Document()).load(t.resolveURI("data/props1.xml"));
    var d2 = (new jsx3.xml.Document()).load(t.resolveURI("data/props2.xml"));
    var p = new jsx3.app.Properties();
    p.loadXML(d1);
    jsunit.assertEquals("value1", p.get("key1"));
    p.loadXML(d2);
    jsunit.assertEquals("valueA", p.get("key1"));
    p.loadXML(d1);
    jsunit.assertEquals("value1", p.get("key1"));
  };

  t.testSpaces2 = function() {
    var d1 = (new jsx3.xml.Document()).load(t.resolveURI("data/props1.xml"));
    var d2 = (new jsx3.xml.Document()).load(t.resolveURI("data/props2.xml"));
    var p = new jsx3.app.Properties();
    p.loadXML(d1);
    jsunit.assertEquals("value1", p.get("key1"));
    p.loadXML(d2, "space2");
    jsunit.assertEquals("value1", p.get("key1"));
    p.loadXML(d1);
    jsunit.assertEquals("value1", p.get("key1"));
    jsunit.assertEquals("value2", p.get("key2"));
    p.loadXML(d2);
    jsunit.assertEquals("valueA", p.get("key1"));
    jsunit.assertEquals("value2", p.get("key2"));
  };

  t.testSpaces2 = function() {
    var d1 = (new jsx3.xml.Document()).load(t.resolveURI("data/props1.xml"));
    var d2 = (new jsx3.xml.Document()).load(t.resolveURI("data/props2.xml"));
    var p = new jsx3.app.Properties();

    p.loadXML(d1, "space1");
    jsunit.assertEquals("value1", p.get("key1"));
    p.loadXML(d2, "space2");
    jsunit.assertEquals("valueA", p.get("key1"));
    p.loadXML(d1, "space1");
    jsunit.assertEquals("valueA", p.get("key1"));
    p.loadXML(d1, "space2");
    jsunit.assertEquals("value1", p.get("key1"));
  };

  t.testLocaleLocale = function() {
    jsx3.app.PropsBundle.clearCache();

    var l1 = new jsx3.util.Locale();
    var l2 = new jsx3.util.Locale("en");

    var p1 = jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), l1);
    var p2 = jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), l2);

    jsunit.assertNotEquals(p1, p2);
    jsunit.assertEquals(l1, p1.getLocale());
    jsunit.assertEquals(l2, p2.getLocale());
  };

  t.testLocaleDefault = function() {
    jsx3.app.PropsBundle.clearCache();

    var p = jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), new jsx3.util.Locale());
    jsunit.assertInstanceOf(p, jsx3.app.Properties);
    jsunit.assertEquals("key1_default", p.get("key1"));
    jsunit.assertEquals("key2_default", p.get("key2"));
    jsunit.assertEquals("key3_default", p.get("key3"));
  };

  t.testLocaleUnavailable = function() {
    jsx3.app.PropsBundle.clearCache();

    var p = jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), new jsx3.util.Locale("es"));
    jsunit.assertInstanceOf(p, jsx3.app.Properties);
    jsunit.assertEquals("key1_default", p.get("key1"));
    jsunit.assertEquals("key2_default", p.get("key2"));
    jsunit.assertEquals("key3_default", p.get("key3"));
  };

  t.testLocaleFallThrough1 = function() {
    jsx3.app.PropsBundle.clearCache();

    var p = jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), new jsx3.util.Locale("en"));
    jsunit.assertInstanceOf(p, jsx3.app.Properties);
    jsunit.assertEquals("key1_en", p.get("key1"));
    jsunit.assertEquals("key2_en", p.get("key2"));
    jsunit.assertEquals("key3_default", p.get("key3"));
    jsunit.assertEquals("key4_default", p.get("key4"));
  };

  t.testLocaleFallThrough2 = function() {
    jsx3.app.PropsBundle.clearCache();

    var p = jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), new jsx3.util.Locale("en", "US"));
    jsunit.assertInstanceOf(p, jsx3.app.Properties);
    jsunit.assertEquals("key1_en", p.get("key1"));
    jsunit.assertEquals("key2_en_US", p.get("key2"));
    jsunit.assertEquals("key3_en_US", p.get("key3"));
    jsunit.assertEquals("key4_default", p.get("key4"));
  };

  t.testLocaleCache1 = function() {
    jsx3.app.PropsBundle.clearCache();

    var p1 = jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), new jsx3.util.Locale("en"));
    var p2 = jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), new jsx3.util.Locale("en"));
    jsunit.assertEquals(p1, p2);
  };

  t.testLocaleCache2 = function() {
    jsx3.app.PropsBundle.clearCache();

    var cache = new jsx3.app.Cache();
    var url = t.resolveURI("data/lprops.xml");
    var p1 = jsx3.app.PropsBundle.getProps(url, new jsx3.util.Locale("en"), cache);

    var doc = cache.getDocument(url);
    jsunit.assertNotNull(doc);
    jsunit.assertInstanceOf(doc, jsx3.xml.Document);
  };

  t.testSingleFile = function() {
    jsx3.app.PropsBundle.clearCache();

    var uri = t.resolveURI("data/lprops2.xml");
    var p = null;

    p = jsx3.app.PropsBundle.getProps(uri, new jsx3.util.Locale());
    jsunit.assertEquals("value_default", p.get("key1"));

    p = jsx3.app.PropsBundle.getProps(uri, new jsx3.util.Locale("en"));
    jsunit.assertEquals("value_default", p.get("key1"));

    p = jsx3.app.PropsBundle.getProps(uri, new jsx3.util.Locale("en", "US"));
    jsunit.assertEquals("value_en_US", p.get("key1"));

    p = jsx3.app.PropsBundle.getProps(uri, new jsx3.util.Locale("en", "UK"));
    jsunit.assertEquals("value_en_UK", p.get("key1"));

    p = jsx3.app.PropsBundle.getProps(uri, new jsx3.util.Locale("es"));
    jsunit.assertEquals("value_es", p.get("key1"));

    p = jsx3.app.PropsBundle.getProps(uri, new jsx3.util.Locale("es", "ES"));
    jsunit.assertEquals("value_es_ES", p.get("key1"));
  };

  t.testLocaleError = function() {
    jsx3.app.PropsBundle.clearCache();

    jsunit.assertThrows(function() {
      jsx3.app.PropsBundle.getProps(t.resolveURI("data/lprops.xml"), new jsx3.util.Locale("de"));
    });
  };

  t.testLocalegetPropsFT = function() {
    jsx3.app.PropsBundle.clearCache();

    var p = jsx3.app.PropsBundle.getPropsFT(t.resolveURI("data/lprops.xml"), new jsx3.util.Locale("de"));
    jsunit.assertEquals("key1_default", p.get("key1"));
    jsunit.assertEquals("key2_default", p.get("key2"));
    jsunit.assertEquals("key3_default", p.get("key3"));
  };

});
