/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.app.Cache", function(t, jsunit) {

  jsunit.require("jsx3.app.Cache", "jsx3.xml.Document", "jsx3.xml.CDF", "jsx3.util.List");

  t.testNew = function() {
    var c = new jsx3.app.Cache();
    jsunit.assertInstanceOf(c, jsx3.app.Cache);
  };

  t.testNoDoc = function() {
    var c = new jsx3.app.Cache();
    jsunit.assertNull(c.getDocument("docId"));
  };

  t.testSetRetrieve = function() {
    var c = new jsx3.app.Cache();
    var doc = new jsx3.xml.Document();
    jsunit.assertNull(c.getDocument("docId"));
    c.setDocument("docId", doc);
    jsunit.assertEquals(doc, c.getDocument("docId"));
    jsunit.assertNull(c.getDocument("docId2"));
  };

  t.testGetTimestamp = function() {
    var c = new jsx3.app.Cache();
    var doc = new jsx3.xml.Document();
    var t1 = new Date();
    c.setDocument("docId", doc);
    var t2 = new Date();
    var ts = c.getTimestamp("docId");

    jsunit.assertTypeOf(ts, "number");
    jsunit.assert(ts >= t1.getTime());
    jsunit.assert(ts <= t2.getTime());

    c.setDocument("docId", doc);
    var t3 = new Date();
    ts = c.getTimestamp("docId");
    jsunit.assert(ts >= t2.getTime());
    jsunit.assert(ts <= t3.getTime());
  };

  t.testOverwrite = function() {
    var c = new jsx3.app.Cache();
    var doc1 = new jsx3.xml.Document();
    var doc2 = new jsx3.xml.Document();

    c.setDocument("docId", doc1);
    jsunit.assertEquals(doc1, c.getDocument("docId"));

    c.setDocument("docId", doc2);
    jsunit.assertEquals(doc2, c.getDocument("docId"));

    c.clearById("docId");
    jsunit.assertNull(c.getDocument("docId"));
  };

  t.testClearById = function() {
    var c = new jsx3.app.Cache();
    var doc1 = new jsx3.xml.Document();

    c.setDocument("docId", doc1);
    jsunit.assertEquals(doc1, c.getDocument("docId"));

    var retVal = c.clearById("docId");
    jsunit.assertEquals(doc1, retVal);
    jsunit.assertNull(c.getDocument("docId"));
  };

  t.testOpenDocument1 = function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.openDocument(url, "docId");

    jsunit.assertInstanceOf(doc1, jsx3.xml.Document);
    jsunit.assertFalse(doc1.hasError());
    jsunit.assert(doc1 === c.getDocument("docId"));
  };

  t.testOpenDocument2 = function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.openDocument(url, "docId");
    var doc2 = c.openDocument(url, "docId");
    jsunit.assertFalse(doc1 === doc2);
  };

  t.testOpenDocument3 = function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.openDocument(url);
    jsunit.assertEquals(doc1, c.getDocument(url));
  };

  t.testOpenDocument4 = function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.openDocument(url, "docId", jsx3.xml.CDF.Document.jsxclass);
    jsunit.assertInstanceOf(doc1, jsx3.xml.CDF.Document);
    jsunit.assertInstanceOf(c.getDocument("docId"), jsx3.xml.CDF.Document);
  };

  t.testOpenAsync1 = function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc = c.getOrOpenAsync(url, "docId");

    jsunit.assertNotNullOrUndef(doc);
    jsunit.assertInstanceOf(doc, jsx3.xml.Document);
    jsunit.assertEquals(jsx3.app.Cache.XSDNS, doc.getNamespaceURI());
    jsunit.assertEquals("loading", doc.getNodeName());
  };

  t.testOpenAsync2 = function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");

    c.getOrOpenAsync(url, "docId");
    c.subscribe("docId", t.asyncCallback(function(objEvent) {
      jsunit.assertEquals("docId", objEvent.subject);
      jsunit.assertEquals(jsx3.app.Cache.CHANGE, objEvent.action);
      jsunit.assertEquals(c, objEvent.target);

      var objDoc = objEvent.target.getDocument("docId");
      jsunit.assertInstanceOf(objDoc, jsx3.xml.Document);
      jsunit.assertFalse("Shouldn't have error: " + objDoc.getError(), objDoc.hasError());
      jsunit.assertEquals("data", objDoc.getNodeName());
    }));
  };
  t.testOpenAsync2._async = true;

  t.testOpenAsync3 = function() {
    var c = new jsx3.app.Cache();
    var url1 = t.resolveURI("data/props1.xml");
    var url2 = t.resolveURI("data/props2.xml");

    var d = c.openDocument(url1, "docId");
    c.getOrOpenAsync(url2, "docId");

    var doc = c.getDocument("docId");
    jsunit.assertNotNullOrUndef(doc);
    jsunit.assertEquals(d, doc);
  };

  t.testOpenAsync4 = function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1_foo.xml");

    c.getOrOpenAsync(url, "docId");
    c.subscribe("docId", t.asyncCallback(function(objEvent) {
      jsunit.assertEquals("docId", objEvent.subject);
      jsunit.assertEquals(jsx3.app.Cache.CHANGE, objEvent.action);
      jsunit.assertEquals(c, objEvent.target);

      var objDoc = objEvent.target.getDocument("docId");
      jsunit.assertNotNullOrUndef(objDoc);
      jsunit.assertInstanceOf(objDoc, jsx3.xml.Document);
      jsunit.assertEquals(jsx3.app.Cache.XSDNS, objDoc.getNamespaceURI());
      jsunit.assertEquals("error", objDoc.getNodeName());
    }));
  };
  t.testOpenAsync4._async = true;

  t.testKeys = function() {
    var c = new jsx3.app.Cache();
    var keys = c.keys();
    var doc = new jsx3.xml.Document();

    jsunit.assertInstanceOf(keys, Array);
    jsunit.assertEquals(0, keys.length);

    c.setDocument("strId1", doc);
    c.setDocument("strId2", doc);

    keys = jsx3.util.List.wrap(c.keys());
    jsunit.assertEquals(2, keys.size());
    jsunit.assert(keys.indexOf("strId1") >= 0);
    jsunit.assert(keys.indexOf("strId2") >= 0);

    c.clearById("strId1");
    keys = jsx3.util.List.wrap(c.keys());
    jsunit.assertEquals(1, keys.size());
    jsunit.assert(keys.indexOf("strId1") < 0);
    jsunit.assert(keys.indexOf("strId2") >= 0);
  };

  t.testHierarchy = function() {
    var c1 = new jsx3.app.Cache();
    var c2 = new jsx3.app.Cache();
    var doc1 = new jsx3.xml.Document();
    var doc2 = new jsx3.xml.Document();

    c1.addParent(c2);
    c1.setDocument("docId1", doc1);
    c2.setDocument("docId2", doc2);

    jsunit.assertEquals(doc1, c1.getDocument("docId1"));
    jsunit.assertEquals(doc2, c1.getDocument("docId2"));
    jsunit.assertEquals(doc2, c2.getDocument("docId2"));
    jsunit.assertNull(c2.getDocument("docId1"));

    c1.clearById("docId2");
    jsunit.assertEquals(doc2, c1.getDocument("docId2"));
    c2.clearById("docId2");
    jsunit.assertNull(c1.getDocument("docId2"));
  };

  t.testEvents = function() {
    var c = new jsx3.app.Cache();
    var eventCount = 0;
    c.subscribe(jsx3.app.Cache.CHANGE, function() { eventCount++; });

    var doc = new jsx3.xml.Document();
    c.setDocument("docId", doc);
    jsunit.assertEquals(1, eventCount);

    c.setDocument("docId", doc);
    jsunit.assertEquals(2, eventCount);

    c.clearById("docId");
    jsunit.assertEquals(3, eventCount);

    doc = c.openDocument(t.resolveURI("data/props1.xml"), "docId");
    jsunit.assertEquals(4, eventCount);
  };

  t.testGetOrOpen = function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.getOrOpenDocument(url, "docId");

    jsunit.assertInstanceOf(doc1, jsx3.xml.Document);
    jsunit.assertFalse(doc1.hasError());
    jsunit.assert(doc1 === c.getOrOpenDocument(url, "docId"));
    jsunit.assert(doc1 === c.getOrOpenDocument("nowhere", "docId"));
  };

  t.testDestroy = function() {
    var c = new jsx3.app.Cache();
    var doc = new jsx3.xml.Document();
    c.setDocument("docId", doc);

    c.destroy();
    jsunit.assertThrows(function(){
      return c.getDocument("docId");
    });
  };

  t.testClearByTimestamp = function() {
    var c = new jsx3.app.Cache();
    var doc = new jsx3.xml.Document();

    var t1 = new Date();
    c.setDocument("docId", doc);
    var t2 = new Date();

    c.clearByTimestamp(t1);
    jsunit.assertEquals(doc, c.getDocument("docId"));

    c.clearByTimestamp(t2.getTime() + 1);
    jsunit.assertNull(c.getDocument("docId"));
  };

  t.testAsyncAbortClear = function() {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");

    var evtCount = 0;

    c.subscribe("docId", function(objEvent) {
      if (objEvent.action != "remove" && c.getDocument("docId").getNamespaceURI() != jsx3.app.Cache.XSDNS)
        evtCount++;
    });

    c.getOrOpenAsync(url, "docId");
    c.clearById("docId");

    window.setTimeout(t.asyncCallback(function() {
      jsunit.assertEquals("Cache should not have published an event.", 0, evtCount);
    }), 2000);
  };
  t.testAsyncAbortClear._async = true;

  t.testAsyncAbortClobber = function() {
    var c = new jsx3.app.Cache();
    var url1 = t.resolveURI("data/props1.xml");
    var url2 = t.resolveURI("data/props2.xml");

    var evtCount = 0;

    c.subscribe("docId", function(objEvent) {
      if (objEvent.action != "remove" && c.getDocument("docId").getNamespaceURI() != jsx3.app.Cache.XSDNS)
        evtCount++;
    });

    c.getOrOpenAsync(url1, "docId");
    c.clearById("docId");
    c.getOrOpenAsync(url2, "docId");

    window.setTimeout(t.asyncCallback(function() {
      jsunit.assertEquals("Cache should have published one event.", 1, evtCount);
      jsunit.assertEquals("valueA", c.getDocument("docId").selectSingleNode("//record").getAttribute("jsxtext"));      
    }), 2000);
  };
  t.testAsyncAbortClobber._async = true;

});
