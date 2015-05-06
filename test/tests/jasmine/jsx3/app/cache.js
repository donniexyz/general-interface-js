/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.app.Cache", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.app.Cache", "jsx3.xml.Document", "jsx3.xml.CDF", "jsx3.util.List");
  var t = new _jasmine_test.App("jsx3.app.Cache");

  it("should be able to instantiate new instance of jsx3.app.Cache", function () {
    var c = new jsx3.app.Cache();
    expect(c).toBeInstanceOf(jsx3.app.Cache);
  });

  it("should not be able to find XML document instance of non existent docId", function () {
    var c = new jsx3.app.Cache();
    expect(c.getDocument("docId")).toBe(null);
  });

  it("should store the document object in this cache under id 'docId'", function () {
    var c = new jsx3.app.Cache();
    var doc = new jsx3.xml.Document();
    expect(c.getDocument("docId")).toBe(null);
    c.setDocument("docId", doc);
    expect(c.getDocument("docId")).toEqual(doc);
    expect(c.getDocument("docId2")).toBe(null);
  });

  it("should return the timestamp from when the document stored under id 'docId' was stored in this cache", function () {
    var c = new jsx3.app.Cache();
    var doc = new jsx3.xml.Document();
    var t1 = new Date();
    c.setDocument("docId", doc);
    var t2 = new Date();
    var ts = c.getTimestamp("docId");
    expect(ts).toBeTypeOf("number");
    expect(ts >= t1.getTime()).toBeTruthy();
    expect(ts <= t2.getTime()).toBeTruthy();
    c.setDocument("docId", doc);
    var t3 = new Date();
    ts = c.getTimestamp("docId");
    expect(ts >= t2.getTime()).toBeTruthy();
    expect(ts <= t3.getTime()).toBeTruthy();
  });

  it("should be able to overwrite the document stored in this cache under id 'docId'", function () {
    var c = new jsx3.app.Cache();
    var doc1 = new jsx3.xml.Document();
    var doc2 = new jsx3.xml.Document();
    c.setDocument("docId", doc1);
    expect(c.getDocument("docId")).toEqual(doc1);
    c.setDocument("docId", doc2);
    expect(c.getDocument("docId")).toEqual(doc2);
    c.clearById("docId");
    expect(c.getDocument("docId")).toBe(null);
  });

  it("should be able to remove the document stored in this cache under id strId", function () {
    var c = new jsx3.app.Cache();
    var doc1 = new jsx3.xml.Document();
    c.setDocument("docId", doc1);
    expect(c.getDocument("docId")).toEqual(doc1);
    var retVal = c.clearById("docId");
    expect(doc1).toEqual(retVal);
    expect(c.getDocument("docId")).toBe(null);
  });

  it("should synchronously load the xml document, store it in this cache, and return the loaded document", function () {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.openDocument(url, "docId");
    expect(doc1).toBeInstanceOf(jsx3.xml.Document);
    expect(doc1.hasError()).toBeFalsy();
    expect(c.getDocument("docId")).toEqual(doc1);
  });

  it("should load documents synchronously from the same xml,store in cache objects and make sure that those document objects are not equal", function () {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.openDocument(url, "docId");
    var doc2 = c.openDocument(url, "docId");
    expect(doc1 === doc2).toBeFalsy();
  });

  it("should test if the document stored in this cache is equal to other document ", function () {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.openDocument(url);
    expect(c.getDocument(url)).toEqual(doc1);
  });

  it("should test if document stored in cache under id ''docid' is an instance of jsx3.xml.CDF.Document", function () {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.openDocument(url, "docId", jsx3.xml.CDF.Document.jsxclass);
    expect(doc1).toBeInstanceOf(jsx3.xml.CDF.Document);
    expect(c.getDocument("docId")).toBeInstanceOf(jsx3.xml.CDF.Document);
  });

  it("should asynchronously load document and return valid loading in progress document before actual loading is complete", function () {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc = c.getOrOpenAsync(url, "docId");
    // Document valid before async load is complete, with single node <loading>
    expect(doc).not.toBeUndefined();
    expect(doc).not.toEqual(null);
    expect(doc).toBeInstanceOf(jsx3.xml.Document);
    expect(doc.getNamespaceURI()).toEqual(jsx3.app.Cache.XSDNS);
    expect(doc.getNodeName()).toEqual("loading");
  });

  it("should asynchronously load an xml document and store it in Cache", function () {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    c.getOrOpenAsync(url, "docId");
    var evt = {};
    c.subscribe("docId", function (objEvent) {
      evt = objEvent;
    });
    waitsFor(function () {
      return evt.target != null;
    }, "waiting for Cache load event 'docId'", 750);
    runs(function () {
      expect(evt.subject).toEqual("docId");
      expect(evt.action).toEqual(jsx3.app.Cache.CHANGE);
      expect(evt.target).toEqual(c);
      var objDoc = evt.target.getDocument("docId");
      expect(objDoc).toBeInstanceOf(jsx3.xml.Document);
      expect(objDoc.getError().code).toEqual(0);
      expect(objDoc.hasError()).toBeFalsy();
      expect(objDoc.getNodeName()).toEqual("data");
    });
  });

  it("should be able to load one document asynchronously and another document synchronously", function () {
    var c = new jsx3.app.Cache();
    var url1 = t.resolveURI("data/props1.xml");
    var url2 = t.resolveURI("data/props2.xml");
    var d = c.openDocument(url1, "docId");
    c.getOrOpenAsync(url2, "docId");
    var doc = c.getDocument("docId");
    expect(doc).not.toBeUndefined();
    expect(doc).not.toEqual(null);
    expect(d).toEquals(doc);
  });

  it("should be able to return error document when asynchronously loading a malformed document", function () {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1_foo.xml");
    c.getOrOpenAsync(url, "docId");
    var evt = {};
    c.subscribe("docId", function (objEvent) {
      evt = objEvent;
    }, 500);
    waitsFor(function () {
      return evt.target != null;
    }, "waiting for Cache load event 'docId'", 750);
    runs(function () {
      expect(evt.subject).toEqual("docId");
      expect(evt.action).toEqual(jsx3.app.Cache.CHANGE);
      expect(evt.target).toEqual(c);
      var objDoc = evt.target.getDocument("docId");
      expect(objDoc).toBeInstanceOf(jsx3.xml.Document);
      expect(objDoc).not.toBeUndefined();
      expect(objDoc).not.toEqual(null);
      expect(objDoc.getNamespaceURI()).toEqual(jsx3.app.Cache.XSDNS);
      expect(objDoc.getNodeName()).toEqual("error");
    });
  });

  it("should return  a list of all the keys in this cache instance with the specified index", function () {
    var c = new jsx3.app.Cache();
    var keys = c.keys();
    var doc = new jsx3.xml.Document();
    expect(keys).toBeInstanceOf(Array);
    expect(keys.length).toEqual(0);
    c.setDocument("strId1", doc);
    c.setDocument("strId2", doc);
    keys = jsx3.util.List.wrap(c.keys());
    expect(keys.size()).toEqual(2);
    expect(keys.indexOf("strId1") >= 0).toBeTruthy();
    expect(keys.indexOf("strId2") >= 0).toBeTruthy();
    c.clearById("strId1");
    keys = jsx3.util.List.wrap(c.keys());
    expect(keys.size()).toEqual(1);
    expect(keys.indexOf("strId1") < 0).toBeTruthy();
    expect(keys.indexOf("strId2") >= 0).toBeTruthy();
  });


  it("should test the hierarchy of the documents stored in the cache with the specified ids after setting and clearing the same", function () {
    var c1 = new jsx3.app.Cache();
    var c2 = new jsx3.app.Cache();
    var doc1 = new jsx3.xml.Document();
    var doc2 = new jsx3.xml.Document();
    c1.addParent(c2);
    c1.setDocument("docId1", doc1);
    c2.setDocument("docId2", doc2);
    expect(c1.getDocument("docId1")).toEqual(doc1);
    expect(c1.getDocument("docId2")).toEqual(doc2);
    expect(c2.getDocument("docId2")).toEqual(doc2);
    expect(c2.getDocument("docId1")).toBeNull();
    c1.clearById("docId2");
    expect(c1.getDocument("docId2")).toEqual(doc2);
    c2.clearById("docId2");
    expect(c1.getDocument("docId2")).toBeNull();
  });

  it("should test the storing and removal of the document in this cache under id 'docId'", function () {
    var c = new jsx3.app.Cache();
    var eventCount = 0;
    c.subscribe(jsx3.app.Cache.CHANGE, function () {
      eventCount++;
    });
    var doc = new jsx3.xml.Document();
    c.setDocument("docId", doc);
    expect(eventCount).toEqual(1);
    c.setDocument("docId", doc);
    expect(eventCount).toEqual(2);
    c.clearById("docId");
    expect(eventCount).toEqual(3);
    doc = c.openDocument(t.resolveURI("data/props1.xml"), "docId");
    expect(eventCount).toEqual(4);
  });

  it("should retrieve a document from this cache or,if this cache contains no such document,load the document synchronously and return it", function () {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var doc1 = c.getOrOpenDocument(url, "docId");
    expect(doc1).toBeInstanceOf(jsx3.xml.Document);
    expect(doc1.hasError()).toBeFalsy();
    expect(c.getOrOpenDocument(url, "docId")).toBe(doc1);
    expect(c.getOrOpenDocument("nowhere", "docId")).toBe(doc1);
  });

  it("should remove all references to documents contained in this cache", function () {
    var c = new jsx3.app.Cache();
    var doc = new jsx3.xml.Document();
    c.setDocument("docId", doc);
    c.destroy();
    var func = function () {
      return c.getDocument("docId");
    };
    expect(func).toThrow();
  });

  it("should remove all documents placed in this cache before the timestamp specified", function () {
    var c = new jsx3.app.Cache();
    var doc = new jsx3.xml.Document();
    var t1 = new Date();
    c.setDocument("docId", doc);
    var t2 = new Date();
    c.clearByTimestamp(t1);
    expect(c.getDocument("docId")).toEqual(doc);
    c.clearByTimestamp(t2.getTime() + 1);
    expect(c.getDocument("docId")).toBeNull();
  });

  it("should have not loaded document into cache when aborted by clearById() call", function () {
    var c = new jsx3.app.Cache();
    var url = t.resolveURI("data/props1.xml");
    var abort = false,  evtCount = 0, evt = {};

    c.subscribe("docId", function (objEvent) {
      if (objEvent.action != "remove" && c.getDocument("docId").getNamespaceURI() != jsx3.app.Cache.XSDNS)
        evtCount++;
      evt = objEvent;
    });
    c.getOrOpenAsync(url, "docId");
    c.clearById("docId");
    runs(function () {
      window.setTimeout(function () {
        abort = true;
      }, 500);
    });
    waitsFor(function () {
      return abort; // waited 300 msec
    }, "waiting long enough to make sure 'docId' event has triggered or not", 750);

    runs(function () {
      expect(evtCount).toEqual(0);
    });
  });

  it("should still load a second document into cache when the first is aborted by clearById() call", function () {
    var c = new jsx3.app.Cache();
    var url1 = t.resolveURI("data/props1.xml");
    var url2 = t.resolveURI("data/props2.xml");
    var evtCount = 0;

    c.subscribe("docId", function (objEvent) {
      if (objEvent.action != "remove" && c.getDocument("docId").getNamespaceURI() != jsx3.app.Cache.XSDNS)
        evtCount++;
    });
    c.getOrOpenAsync(url1, "docId");
    c.clearById("docId");
    c.getOrOpenAsync(url2, "docId");
    // no need to use an abort timeout.
    waitsFor(function () {
      return evtCount > 0;
    }, "waiting for Cache 'docId' event to have triggered", 750);

    runs(function () {
      expect(evtCount).toEqual(1);
      expect(c.getDocument("docId").selectSingleNode("//record").getAttribute("jsxtext")).toEqual("valueA");
    });
  });
});


