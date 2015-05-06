/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.xml.Document", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.xml.Document", "jsx3.net.Request");
  var t = new _jasmine_test.App("jsx3.xml.Document");

  it("should check if plain javascript object/namespace 'jsx3.xml.Document' exists", function () {
    expect(jsx3.lang.Class.forName("jsx3.xml.Document")).not.toBeNull();
    expect(jsx3.lang.Class.forName("jsx3.xml.Document")).not.toBeUndefined();
  });

  it("should be able to create an instance of the jsx3.xml.Document class", function () {
    var d = new jsx3.xml.Document();
    expect(d.hasError()).toBeFalsy();
  });

  it("should be able to return an xml parser instance", function () {
    var d = new jsx3.xml.Document();
    expect(d.getNativeDocument()).not.toBeNull();
    expect(d.getNativeDocument()).not.toBeUndefined();
    d = new jsx3.xml.Document();
    d.loadXML("<data/>");
    expect(d.getNativeDocument()).not.toBeNull();
    expect(d.getNativeDocument()).not.toBeUndefined();
  });

  it("two XML DOM object instances should match", function () {
    var d = new jsx3.xml.Document();
    var retVal = d.load(t.resolveURI("data/test1.xml"));
    expect(d === retVal).toBeTruthy();
    expect(d.hasError()).toBeFalsy();
  });

  it("should get an error loading non existent XML source URL", function () {
    var d = new jsx3.xml.Document();
    d.load(t.resolveURI("data/testy1.xml"));
    expect(d.hasError()).toBeTruthy();
  });

  it("Should get an error loading a malformed XML", function () {
    var d = new jsx3.xml.Document();
    d.load(t.resolveURI("data/bad.xml"));
    expect(d.hasError()).toBeTruthy();
  });

  /*
   document.xmlEncoding Deprecated 	Returns the encoding as determined by the XML declaration.
   Firefox 10 and later don't implement it anymore.
   String 	DOM 3 Removed in DOM 4
   document. Obsolete since Gecko 10.0

   Returns true if the XML declaration specifies the document is standalone (e.g., An external part of the DTD affects the document's content), else false.
   Boolean 	DOM 3 Removed in DOM 4
   document.xmlVersion Obsolete since Gecko 10.0

   Returns the version number as specified in the XML declaration or "1.0" if the declaration is absent.
   String 	DOM 3 Removed in DOM 4
   */
  var doc = function() {
    var p;
    if (DOMParser) {
      p = new DOMParser();
      return  p.parseFromString('<?xml version="1.0" encoding="UTF-8"><data></data>', "text/xml");
    }
    return null;
  };

  if (!doc || (doc && doc.xmlVersion))
    it("should check the xml version of the loaded xml", function () {
      var d = new jsx3.xml.Document();
      d.load(t.resolveURI("data/test1.xml"));
      if (d._document.xmlVersion)
        expect(d.getXmlVersion()).toEqual("1.0");
    });

  if (!doc || (doc && doc.xmlEncoding))
    xit("should check the xml encoding of the loaded xml", function () {
      var d = new jsx3.xml.Document();
      d.load(t.resolveURI("data/test1.xml"));
      if (d._document.xmlEncoding) {
        expect(d.getXmlEncoding().toString()).toBeTypeOf("string");
        expect(d.getXmlEncoding().toUpperCase()).toEqual("UTF-8");
      }
    });

  if (!doc || (doc && doc.xmlStandalone))
    it("should test if document mode is standalone or not  in the doc declaration", function () {
      var d = new jsx3.xml.Document();
      d.load(t.resolveURI("data/test1.xml"));
      expect(d.hasError()).toBeFalsy();
      expect(d.getXmlStandalone()).toBeFalsy();

      d = new jsx3.xml.Document();
      d.load(t.resolveURI("data/test2.xml"));
      expect(d.hasError()).toBeFalsy();
      if (d._document.xmlStandalone)
        expect(d.getXmlStandalone()).toBeTruthy();
    });

  it("should not be able to get an asynchronously loaded document before it's actually loaded.", function () {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    d.load(t.resolveURI("data/test1.xml"));
    // should not be loaded yet
    //   expect(d.getNative()).toBeNull();
    expect(d.getNative()).toBeUndefined();
    expect(d.hasError()).toBeFalsy();
  });

  it("should load document asynchronously", function () {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    var evt = {};
    d.subscribe(jsx3.xml.Document.ON_RESPONSE, function (objEvent) {
      evt = objEvent;
    }, 500);
    runs(function () {
      d.load(t.resolveURI("data/test1.xml"));
    });
    waitsFor(function () {
      return evt.target != null;
    }, "wait until there's a real objevent.target", 5000);
    runs(function () {
      expect(evt.target).toEquals(d);
      expect(evt.target.hasError()).toBeFalsy();
      expect(d.getNodeName()).toEqual("data");
    });
  });

  it("should not be able to load non existent testy1.xml asynchronously", function () {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    d.load(t.resolveURI("data/testy1.xml"));
    // should not be loaded yet
    //  expect(d.getNative()).toBeNull();
    expect(d.getNative()).toBeUndefined();
    expect(d.hasError()).toBeFalsy();
  });

  it("should get error on attempt to load non existent testy1.xml asynchronously", function () {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    var target = null;
    d.subscribe(jsx3.xml.Document.ON_RESPONSE, function (objEvent) {
      expect(objEvent.target.hasError()).toBeFalsy();
      target = objEvent.target;
    }, 500);
    d.subscribe(jsx3.xml.Document.ON_ERROR, function (objEvent) {
      expect(objEvent.target.hasError()).toBeTruthy();
      target = objEvent.target;
    }, 500);
    runs(function () {
      d.load(t.resolveURI("data/testy1.xml"));
    });
    waitsFor(function () {
      return target != null;
    }, "target should be set by one of the Document.ON_RESPONSE or Document.ON_ERROR", 750);
    runs(function () {
      expect(target.hasError()).toBeTruthy();
    });
  });

  it("should get error when loading malformed xml file asynchronously", function () {
    var target = null, d = new jsx3.xml.Document();
    d.setAsync(true);
    d.subscribe(jsx3.xml.Document.ON_RESPONSE, function (objEvent) {
      expect(objEvent.target.hasError()).toBeFalsy();
      target = objEvent.target;
    }, 500);
    d.subscribe(jsx3.xml.Document.ON_ERROR, function (objEvent) {
      expect(objEvent.target.hasError()).toBeTruthy();
      target = objEvent.target;
    }, 500);
    runs(function () {
      d.load(t.resolveURI("data/bad.xml"));
    });
    waitsFor(function () {
      return target != null;
    }, "target should be set by one of the Document.ON_RESPONSE or Document.ON_ERROR", 750);
    runs(function () {
      expect(target).not.toBeNull();
      expect(target.hasError()).toBeTruthy();
    });
  });

  it("should receive no event object when Form.abort() is called before response is received", function () {
    var abort = null, objEvent = null;
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    var evtCount = 0;
    var evt = {};
    var onDone = function() {
      abort = "called";
    };
    d.subscribe(jsx3.xml.Document.ON_RESPONSE, function (objEvent) {
      evtCount++;
      evt = objEvent;
    }, 500);

    runs(function() {
      window.setTimeout(function () {
        abort = "called";
        d.abort();
      }, 100);
      window.setTimeout(function () {
        onDone();
      }, 300);
    });
    waitsFor(function () {
      return abort == "called";
    }, "The Value should be incremented", 750);
    runs(function () {
      expect(evtCount).toEqual(0);
      expect(d.hasError()).toBeFalsy();
    });
  });

  it("should correctly load the xml form a file synchronously", function () {
    var d = new jsx3.xml.Document();
    d.load(gi.test.jasmine.HTTP_BASE + "/data1.xml");
    // expect(d.hasError()).toBeFalsy();
    expect(d.getNodeName()).toEqual("data");
    expect(d.getChildNodes().get(0).getNodeName()).toEqual("record");
  });

  it("should test that xml was not loaded from a file scheme/test server because of bad url", function () {
    var d = new jsx3.xml.Document();
    d.load(gi.test.jasmine.HTTP_BASE + "/404.xml");
    expect(d.hasError()).toBeTruthy();
  });
  //t.testLoadRemoteBadUrl._skip_unless = "NETWORK";

  it("should test that xml was not loaded from a file scheme/test server because of bad url", function () {
    var d = new jsx3.xml.Document();
    d.load(gi.test.jasmine.HTTP_BASE + "/bad1.xml");
    expect(d.hasError()).toBeTruthy();
  });

  it("should test that xml was  loaded from a file scheme/test server asynchronously and also parsed correctly", function () {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    var evt = {};
    d.subscribe(jsx3.xml.Document.ON_RESPONSE, function (objEvent) {
      evt = objEvent;
    }, 500);
    d.subscribe([ jsx3.xml.Document.ON_ERROR, jsx3.xml.Document.ON_TIMEOUT ], function (objEvent) {
      evt = objEvent;
    }, 500);
    runs(function () {
      d.load(gi.test.jasmine.HTTP_BASE + "/data1.xml", 5000);
    });
    waitsFor(function () {
      return evt.target != null;
    }, "wait until there's a real objevent.target", 5000);
    runs(function () {
      expect(evt.target).toEquals(d);
      expect(evt.target.hasError()).toBeFalsy();
      expect(d.getNodeName()).toEqual("data");
    });
  });

  it("should get an error loading a non existent 404.xml file asynchronously", function () {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    var evt = {};
    runs(function () {
      d.load(gi.test.jasmine.HTTP_BASE + "/404.xml", 5000);
      d.subscribe([jsx3.xml.Document.ON_RESPONSE, jsx3.xml.Document.ON_ERROR, jsx3.xml.Document.ON_TIMEOUT], function (objEvent) {
        evt = objEvent;
      }, 500);
    });
    waitsFor(function () {
      return evt.target != null;
    }, "timeout in 600", 600);
    runs(function () {
      expect(evt.target.hasError()).toBeTruthy();
    })
  });
  //t.testLoadRemoteAsyncBadUrl._skip_unless = "NETWORK";

  it("should get an error loading malformed xml file asynchronously", function () {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    var objEvent = {};
    d.subscribe([jsx3.xml.Document.ON_RESPONSE, jsx3.xml.Document.ON_ERROR, jsx3.xml.Document.ON_TIMEOUT], function (evt) {
      objEvent = evt;
    }, 500);
    runs(function () {
      d.load(gi.test.jasmine.HTTP_BASE + "/bad1.xml", 5000);
    });
    waitsFor(function () {
      return objEvent.target != null;
    });
    runs(function () {
      expect(objEvent.target.hasError()).toBeTruthy();
    });
  });
  //t.testLoadRemoteAsyncBadXml._skip_unless = "NETWORK";

  it("should be able to obtain the source URL of a document when it is loaded from an URL.", function () {
    var url = t.resolveURI("data/test1.xml");
    var d = new jsx3.xml.Document();
    d.load(url);
    expect(d.getSourceURL()).toEqual(url);
    d.load("nowhere.xml");
    expect(d.getSourceURL()).toEqual("nowhere.xml");
    d.loadXML("<data/>");
    expect(d.getSourceURL()).toBeNull();
  });

  it("should be able to create a document using loadXML() from string literal.", function () {
    var d = new jsx3.xml.Document();
    var retVal = d.loadXML("<data><record/></data>");
    expect(d === retVal).toBeTruthy();
    expect(d.hasError()).toBeFalsy();
    expect(d.hasError()).toBeFalsy();
    expect(d.getNodeName()).toEqual("data");
  });

  it("should get error when loading from malformed xml string literal.", function () {
    var d = new jsx3.xml.Document();
    d.loadXML("<data><record/></data"); // malformed xml is intentional
    expect(d.hasError()).toBeTruthy();
    d.loadXML("<data><record/></data>");
    expect(d.hasError()).toBeFalsy();
  });

  it("should have an error description for the error when loading a malformed xml string literal.", function () {
    var d = new jsx3.xml.Document();
    var src = "<data><record/></data>";
    d.loadXML(src);
    expect(d.toString()).toEqual(src);
    d.loadXML("<data><record/></data"); // malformed xml is intentional
    expect(d.hasError()).toBeTruthy();
    expect(d.toString().indexOf(d.getError().description) >= 0).toBeTruthy();
  });

  it("should be able to create a clone from XML DOM ", function () {
    var d = new jsx3.xml.Document();
    var src = "<data><record/></data>";
    d.loadXML(src);
    var d2 = d.cloneDocument();
    expect(d.toString()).toEqual(src);
    expect(d).not.toEquals(d2);
    expect(d2.toString()).toEqual(src);
  });

  it("should be able to tell you if the document is going to be loaded asynchronously or not", function () {
    var d = new jsx3.xml.Document();
    expect(d.getAsync()).toBeFalsy();
    d.setAsync(true);
    expect(d.getAsync()).toBeTruthy();
    d.setAsync(false);
    expect(d.getAsync()).toBeFalsy();
  });

  it("should be able to serialize the xml document object model instance", function () {
    var d = new jsx3.xml.Document();
    d.loadXML("<data/>");
    expect(d.serialize()).toEqual('<data/>');
    expect(d.serialize("1.0", "utf-8")).toEqual('<?xml version="1.0" encoding="utf-8"?>\n<data/>');
    d.loadXML('<?xml version="1.0" encoding="utf-16"?><data/>');
    expect(d.serialize("1.0", "utf-8")).toEqual('<?xml version="1.0" encoding="utf-8"?>\n<data/>');
  });

  it("should be able to create a new document element", function () {
    var d = new jsx3.xml.Document();
    expect(d.getNative()).toBeUndefined();
    d.createDocumentElement("data");
    expect(d.getNodeName()).toEqual("data");
    expect(d.getChildNodes().size()).toEqual(0);
  });

  it("should be able to fetch first node in document that matches the xpath parameter ", function () {
    var d = new jsx3.xml.Document().loadXML('<data xmlns:ns="uri"><a><r a="1"/><ns:r a="2"/></a></data>');
    var n = d.selectSingleNode("//r");
    expect(n).not.toBeNull();
    expect(n).not.toBeUndefined();
    expect(n.getAttribute("a")).toEqual("1");
    n = d.getFirstChild().selectSingleNode("//ns:r");
    expect(n).not.toBeNull();
    expect(n).not.toBeUndefined();
    expect(n.getAttribute("a")).toEqual("2");
  });

  //
  it("should query elements that belong to different namespaces from an XML document", function () {
    var d = new jsx3.xml.Document().loadXML('<data xmlns:ns="uri"><a><r a="1"/><ns:r a="2"/></a></data>');
    d.setSelectionNamespaces('xmlns:foo="uri"');
    n = d.selectSingleNode("//foo:r");
    expect(n).not.toBeNull();
    expect(n).not.toBeUndefined();
    expect(n.getAttribute("a")).toEqual("2");
  });

//  t.testDeclaredNamespaces = function() {
//    // TODO: Luke
//  };
//
//  t.testNamespaceAxis = function() {
//    // TODO: Luke
//  };

  /**
   * Tests a bug revealed in IE. A synchronous request issued after an asynchronous document load will cause the
   * document's callback function to be executed in the same stack as the the native send() method. This was only
   * exposed when deployed over HTTP.  ... can't actually get this to fail on 3.3.0_v1.
   */

  it("should reveal an issue with synchronous request issued after an asynchronous document on IE.", function () {
    var order = [];
    var js = "";
    var d1 = new jsx3.xml.Document();
    d1.setAsync(true);
    d1.subscribe(jsx3.xml.Document.ON_RESPONSE, function (evt) {
      order.push("document");
    });
    d1.load(t.resolveURI("data/test1.xml"), 1000);
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/test.js"), false);
    r.send();
    js = r.getResponseText();
    order.push("request");
    waitsFor(function () {
      return order.length >= 2;
    });
    runs(function () {
      expect(js.indexOf("nothingSpecial") >= 0).toBeTruthy();
      expect(order.length).toEqual(2);
      expect(order[0]).toEqual("request");
      expect(order[1]).toEqual("document");
    });
  });
});

