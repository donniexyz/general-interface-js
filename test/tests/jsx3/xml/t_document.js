/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.xml.Document", function(t, jsunit) {

  jsunit.require("jsx3.xml.Document", "jsx3.net.Request");

  t.testDefined = function() {
    jsunit.assertNotNullOrUndef(jsx3.lang.Class.forName("jsx3.xml.Document"));
  };

  t.testNew = function() {
    var d = new jsx3.xml.Document();
    jsunit.assertFalse("Shouldn't have error: " + d.getError(), d.hasError());
  };

  t.testNativeDocument = function() {
    var d = new jsx3.xml.Document();
    jsunit.assertNotNullOrUndef(d.getNativeDocument());
    d = new jsx3.xml.Document();
    d.loadXML("<data/>");
    jsunit.assertNotNullOrUndef(d.getNativeDocument());
  };

  t.testLoad = function() {
    var d = new jsx3.xml.Document();
    var retVal = d.load(t.resolveURI("data/test1.xml"));

    jsunit.assertTrue(d === retVal); // load should return this
    jsunit.assertFalse("Shouldn't have error: " + d.getError(), d.hasError());
  };

  t.testLoadBadUrl = function() {
    var d = new jsx3.xml.Document();
    d.load(t.resolveURI("data/testy1.xml"));

    jsunit.assertTrue(d.hasError());
  };

  t.testLoadBadXml = function() {
    var d = new jsx3.xml.Document();
    d.load(t.resolveURI("data/bad.xml"));

    jsunit.assertTrue(d.hasError());
  };

  t.testVersion = function() {
    var d = new jsx3.xml.Document();
    d.load(t.resolveURI("data/test1.xml"));
    jsunit.assertEquals("1.0", d.getXmlVersion());
  };

  t.testEncoding = function() {
    var d = new jsx3.xml.Document();
    d.load(t.resolveURI("data/test1.xml"));
    jsunit.assertTypeOf(d.getXmlEncoding(), "string");
    jsunit.assertEquals("UTF-8", d.getXmlEncoding().toUpperCase());
  };

  t.testStandalone = function() {
    var d = new jsx3.xml.Document();
    d.load(t.resolveURI("data/test1.xml"));
    jsunit.assertFalse("Shouldn't have error: " + d.getError(), d.hasError());
    jsunit.assertFalse(d.getXmlStandalone());

    d = new jsx3.xml.Document();
    d.load(t.resolveURI("data/test2.xml"));
    jsunit.assertFalse("Shouldn't have error: " + d.getError(), d.hasError());
    jsunit.assertTrue(d.getXmlStandalone());
  };

  t.testLoadAsync1 = function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    d.load(t.resolveURI("data/test1.xml"));

    // should not be loaded yet
    jsunit.assertNullOrUndef(d.getNative());
    jsunit.assertFalse("Shouldn't have error: " + d.getError(), d.hasError());
  };

  t.testLoadAsync2 = function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    d.subscribe(jsx3.xml.Document.ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assertEquals(d, objEvent.target);
      jsunit.assertFalse("Shouldn't have error: " + objEvent.target.getError(), objEvent.target.hasError());
      jsunit.assertEquals("data", d.getNodeName());
    }));
    d.subscribe(jsx3.xml.Document.ON_ERROR, t.asyncCallback(function(objEvent) {
      jsunit.assert("Error loading document: " + objEvent.target.getError(), false);
    }));

    d.load(t.resolveURI("data/test1.xml"));
  };
  t.testLoadAsync2._async = true;

  t.testLoadAsyncError1 = function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    d.load(t.resolveURI("data/testy1.xml"));

    // should not be loaded yet
    jsunit.assertNullOrUndef(d.getNative());
    jsunit.assertFalse("Shouldn't have error: " + d.getError(), d.hasError());
  };

  t.testLoadAsyncError2 = function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    d.subscribe(jsx3.xml.Document.ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assert("Should be error loading document: " + objEvent.target, false);
    }));
    d.subscribe(jsx3.xml.Document.ON_ERROR, t.asyncCallback(function(objEvent) {
      jsunit.assertTrue("Should have error in document: " + objEvent.target, objEvent.target.hasError());
    }));

    d.load(t.resolveURI("data/testy1.xml"));
  };
  t.testLoadAsyncError2._async = true;

  t.testLoadBadXmlAsync = function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    d.subscribe(jsx3.xml.Document.ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assert("Should be error loading document: " + objEvent.target, false);
    }));
    d.subscribe(jsx3.xml.Document.ON_ERROR, t.asyncCallback(function(objEvent) {
      jsunit.assertTrue("Should have error in document: " + objEvent.target, objEvent.target.hasError());
    }));

    d.load(t.resolveURI("data/bad.xml"));
  };
  t.testLoadBadXmlAsync._async = true;

  t.testAbort = function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);

    var evtCount = 0;

    d.subscribe(jsx3.xml.Document.ON_RESPONSE, function(objEvent) {
      evtCount++;
    });

    d.load(t.resolveURI("data/test1.xml"));
    d.abort();
    
    window.setTimeout(t.asyncCallback(function() {
      jsunit.assertEquals("Document should not have published an event.", 0, evtCount);
      jsunit.assertFalse(d.hasError());
    }), 2000);
  };
  t.testAbort._async = true;

  t.testLoadRemote = function() {
    var d = new jsx3.xml.Document();
    d.load(jsunit.HTTP_BASE + "/data1.xml");

    jsunit.assertFalse(d.hasError());
    jsunit.assertEquals("data", d.getNodeName());
    jsunit.assertEquals("record", d.getChildNodes().get(0).getNodeName());
  };
  t.testLoadRemote._skip_unless = "NETWORK";

  t.testLoadRemoteBadUrl = function() {
    var d = new jsx3.xml.Document();
    d.load(jsunit.HTTP_BASE + "/404.xml");

    jsunit.assertTrue(d.hasError());
  };
  t.testLoadRemoteBadUrl._skip_unless = "NETWORK";

  t.testLoadRemoteBadXml = function() {
    var d = new jsx3.xml.Document();
    d.load(jsunit.HTTP_BASE + "/bad1.xml");

    jsunit.assertTrue(d.hasError());
  };
  t.testLoadRemoteBadXml._skip_unless = "NETWORK";

  t.testLoadRemoteAsync = function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    d.subscribe(jsx3.xml.Document.ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assertEquals(d, objEvent.target);
      jsunit.assertFalse("Shouldn't have error: " + objEvent.target.getError(), objEvent.target.hasError());
      jsunit.assertEquals("data", d.getNodeName());
    }));
    d.subscribe([jsx3.xml.Document.ON_ERROR, jsx3.xml.Document.ON_TIMEOUT], t.asyncCallback(function(objEvent) {
      jsunit.assert("Error loading document: " + objEvent.target.getError(), false);
    }));

    d.load(jsunit.HTTP_BASE + "/data1.xml", 5000);
  };
  t.testLoadRemoteAsync._async = true;
  t.testLoadRemoteAsync._skip_unless = "NETWORK";

  t.testLoadRemoteAsyncBadUrl = function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    d.subscribe(jsx3.xml.Document.ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assert("Should be error loading document: " + objEvent.target, false);
    }));
    d.subscribe(jsx3.xml.Document.ON_ERROR, t.asyncCallback(function(objEvent) {
      jsunit.assertTrue("Should have error in document: " + objEvent.target, objEvent.target.hasError());
    }));
    d.subscribe(jsx3.xml.Document.ON_TIMEOUT, t.asyncCallback(function(objEvent) {
      jsunit.assert("Should not time out: " + objEvent.target, false);
    }));

    d.load(jsunit.HTTP_BASE + "/404.xml", 5000);
  };
  t.testLoadRemoteAsyncBadUrl._async = true;
  t.testLoadRemoteAsyncBadUrl._skip_unless = "NETWORK";

  t.testLoadRemoteAsyncBadXml = function() {
    var d = new jsx3.xml.Document();
    d.setAsync(true);
    d.subscribe(jsx3.xml.Document.ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assert("Should be error loading document: " + objEvent.target, false);
    }));
    d.subscribe(jsx3.xml.Document.ON_ERROR, t.asyncCallback(function(objEvent) {
      jsunit.assertTrue("Should have error in document: " + objEvent.target, objEvent.target.hasError());
    }));
    d.subscribe(jsx3.xml.Document.ON_TIMEOUT, t.asyncCallback(function(objEvent) {
      jsunit.assert("Should not time out: " + objEvent.target, false);
    }));

    d.load(jsunit.HTTP_BASE + "/bad1.xml", 5000);
  };
  t.testLoadRemoteAsyncBadXml._async = true;
  t.testLoadRemoteAsyncBadXml._skip_unless = "NETWORK";

  t.testSourceUrl = function() {
    var url = t.resolveURI("data/test1.xml");
    var d = new jsx3.xml.Document();
    d.load(url);

    jsunit.assertEquals(url, d.getSourceURL());

    d.load("nowhere.xml");
    jsunit.assertEquals("nowhere.xml", d.getSourceURL());

    d.loadXML("<data/>");
    jsunit.assertNullOrUndef(d.getSourceURL());
  };

  t.testLoadXml = function() {
    var d = new jsx3.xml.Document();
    var retVal = d.loadXML("<data><record/></data>");
    jsunit.assertTrue(d === retVal); // loadXML should return this
    jsunit.assertFalse(d.hasError());
    jsunit.assertEquals("data", d.getNodeName());
  };

  t.testLoadXmlError = function() {
    var d = new jsx3.xml.Document();
    d.loadXML("<data><record/></data");
    jsunit.assertTrue(d.hasError());
    d.loadXML("<data><record/></data>");
    jsunit.assertFalse(d.hasError());
  };

  t.testToString = function() {
    var d = new jsx3.xml.Document();
    var src = "<data><record/></data>";
    d.loadXML(src);
    jsunit.assertEquals(src, d.toString());

    d.loadXML("<data><record/></data");
    jsunit.assertTrue(d.hasError());
    jsunit.assertTrue('Error "' + d.getError().description + "' should be in toString() '" + d.toString() + "'",
        d.toString().indexOf(d.getError().description) >= 0);
  };

  t.testCloneDocument = function() {
    var d = new jsx3.xml.Document();
    var src = "<data><record/></data>";
    d.loadXML(src);
    var d2 = d.cloneDocument();

    jsunit.assertEquals(src, d.toString());
    jsunit.assertNotEquals(d, d2);
    jsunit.assertEquals(src, d2.toString());
  };

  t.testAsync = function() {
    var d = new jsx3.xml.Document();
    jsunit.assertFalse(d.getAsync());
    d.setAsync(true);
    jsunit.assertTrue(d.getAsync());
    d.setAsync(false);
    jsunit.assertFalse(d.getAsync());
  };

  t.testSerialize = function() {
    var d = new jsx3.xml.Document();
    d.loadXML("<data/>");
    jsunit.assertEquals('<data/>', d.serialize());
    jsunit.assertEquals('<?xml version="1.0" encoding="utf-8"?>\n<data/>', d.serialize("1.0", "utf-8"));
    d.loadXML('<?xml version="1.0" encoding="utf-16"?><data/>');
    jsunit.assertEquals('<?xml version="1.0" encoding="utf-8"?>\n<data/>', d.serialize("1.0", "utf-8"));
  };

  t.testCreateDocumentElm = function() {
    var d = new jsx3.xml.Document();
    jsunit.assertNullOrUndef(d.getNative());
    d.createDocumentElement("data");
    jsunit.assertEquals("data", d.getNodeName());
    jsunit.assertEquals(0, d.getChildNodes().size());
  };

  t.testSelectionNamespaces = function() {
    var d = new jsx3.xml.Document().loadXML('<data xmlns:ns="uri"><a><r a="1"/><ns:r a="2"/></a></data>');

    var n = d.selectSingleNode("//r");
    jsunit.assertNotNullOrUndef(n);
    jsunit.assertEquals("1", n.getAttribute("a"));

    d.setSelectionNamespaces('xmlns:foo="uri"');
    n = d.selectSingleNode("//foo:r");
    jsunit.assertNotNullOrUndef(n);
    jsunit.assertEquals("2", n.getAttribute("a"));

    n = d.getFirstChild().selectSingleNode("//foo:r");
    jsunit.assertNotNullOrUndef(n);
    jsunit.assertEquals("2", n.getAttribute("a"));
  };

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
  t.testAsyncOrdering = function() {
    var order = [];
    var js = "";

    var callback = t.asyncCallback(function() {
      jsunit.assert(js.indexOf("nothingSpecial") >= 0);
      jsunit.assertEquals(2, order.length);
      jsunit.assertEquals("request", order[0]);
      jsunit.assertEquals("document", order[1]);
    });

    var d1 = new jsx3.xml.Document();
    d1.setAsync(true);
    d1.subscribe(jsx3.xml.Document.ON_RESPONSE, function(objEvent) {
      order.push("document");
      if (order.length == 2) callback();
    });
    d1.load(t.resolveURI("data/test1.xml"), 1000);

    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/test.js"), false);
    r.send();
    js = r.getResponseText();
    order.push("request");

    if (order.length == 2) callback();
  };
  t.testAsyncOrdering._async = true;

});
