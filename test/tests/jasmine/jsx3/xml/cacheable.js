/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.xml.Cacheable", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.xml.Cacheable", "jsx3.app.Server", "jsx3.app.Model");
  var t = new _jasmine_test.App("jsx3.xml.Cacheable");

  beforeEach(function () {
    jsx3.Class.defineClass("gi.test.CacheTest", jsx3.app.Model, [jsx3.xml.Cacheable], function (CacheTest, CacheTest_prototype) {
    });
    jsx3.Class.defineClass("gi.test.CacheCDFTest", jsx3.app.Model, [jsx3.xml.Cacheable, jsx3.xml.CDF],
      function (CacheCDFTest, CacheCDFTest_prototype) {
      });
    t._server = t.newServer(null, "JSXAPPS/testCacheableServer", false, {namespace: "testCacheableServer"});
  });

  it("should have an instance of testCacheableServer initialized", function () {
    var s = t._server;
    expect(s).toBeInstanceOf(jsx3.app.Server);
    expect(s.getEnv("namespace")).toEqual("testCacheableServer");
  });

  it("should have the gi.test.CacheTest Class defined", function () {
    expect(gi.test.CacheTest).not.toBeUndefined();
    expect(gi.test.CacheTest.jsxclass).toBeInstanceOf(jsx3.lang.Class);
    expect(jsx3.xml.Cacheable.jsxclass.isAssignableFrom(gi.test.CacheTest.jsxclass)).toBeTruthy()
  });

  it("should set the xml id of the cache object and also return the same", function () {
    var c = new gi.test.CacheTest();
    var id = c.getXMLId();
    expect(id).toBeTypeOf("string");
    expect(id.length > 0).toBeTruthy();
    c.setXMLId("myxmlid");
    expect(c.getXMLId()).toEqual("myxmlid")
  });

  it("should set the xml string of the cache object and also return the same", function () {
    var c = new gi.test.CacheTest();
    expect(c.getXMLString()).toBeUndefined();
    c.setXMLString("<xml/>");
    expect(c.getXMLString()).toEqual("<xml/>");
  });

  it("should set the xml url of the cache object and also return the same", function () {
    var c = new gi.test.CacheTest();
    expect(c.getXMLURL()).toBeUndefined();
    c.setXMLURL("doc.xml");
    expect(c.getXMLURL()).toEqual("doc.xml")
  });

  it("XML source document of the cache object should be an instance of the jsx3.xml._document", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    var x = c.getXML();
    expect(x).toBeInstanceOf(jsx3.xml.Document);
    expect(x.getNodeName()).toEqual("data");
    expect(x.getChildNodes().size()).toEqual(0);
  });

  it("should be able to retrieve XML document using Cache.setXMLId() and Cache.getXML()", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXMLId("myxmlid");
    var cache = c.getServer().getCache();
    var x = new jsx3.xml.Document().loadXML("<data><record/></data>");
    cache.setDocument("myxmlid", x);
    expect(c.getXML()).toEqual(x);
  });

  it("should be able to create and cache a XML document from a string literal of XML", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXMLString('<data><record jsxid="1"/><record jsxid="2"/></data>');
    var x = c.getXML();
    expect(x.getNodeName()).toEqual("data");
    expect(x.getChildNodes().size()).toEqual(2);
    expect(x.selectSingleNode("//record[@jsxid='2']")).not.toBeNull();
    expect(x.selectSingleNode("//record[@jsxid='2']")).not.toBeUndefined()
  });

  it("should be able to load and cache XML document from an URL", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXMLURL(t.resolveURI("data/cdf1.xml"));
    var x = c.getXML();
    expect(x.getNodeName()).toEqual("data");
    expect(x.getChildNodes().size()).toEqual(5);
    expect(x.selectSingleNode("//record[@jsxid='4']")).not.toBeNull();
    expect(x.selectSingleNode("//record[@jsxid='4']")).not.toBeUndefined()
  });

  it("Should fail to create and cache a XML document from a malformed XML string", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXMLString('<data>');
    var x = c.getXML();
    expect(x).toBeInstanceOf(jsx3.xml.Document);
    expect(x.hasError()).toBeTruthy()
  });

  it("Should create XML document from URL, setXMLURL() overrides setXMLString()", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXMLId("myxmlid");
    c.setXMLString('<data><record jsxid="1"/></data>');
    c.setXMLURL(t.resolveURI("data/cdf1.xml"));
    var cache = c.getServer().getCache();
    var x = new jsx3.xml.Document().loadXML("<data><record/></data>");
    cache.setDocument("myxmlid", x);
    expect(c.getXML()).toEqual(x);
  });

  it("Should create XML document from XML URL instead of XML String", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXMLString('<data><record jsxid="1"/></data>');
    c.setXMLURL(t.resolveURI("data/cdf1.xml"));
    var x = c.getXML();
    expect(x.getChildNodes().size()).toEqual(1);
  });

  it("should keep the shared resource XML and XSL document in cache even when the jsx3.app.Server is destroyed", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setShareResources(jsx3.xml.Cacheable.SHARERESOURCES);
    var x = c.getXML();
    var id = c.getXMLId();
    t._server.getBodyBlock().removeChild(c);
    var cache = t._server.getCache();
    expect(t._server.getCache().getDocument(id)).toEqual(x);
  });

  it("should keep the shared resource XML and XSL document in cache even when the jsx3.app.Server is destroyed", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setShareResources(jsx3.xml.Cacheable.CLEANUPRESOURCES);
    var x = c.getXML();
    var id = c.getXMLId();
    t._server.getBodyBlock().removeChild(c);
    var cache = t._server.getCache();
    expect(c.getParent()).toBeNull();
    expect(c.getServer()).toBeNull();
    expect(cache.getDocument(id)).toBeNull();
  });

  it("should transform the cache document using the XSL specified by the URL.", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXMLString("<object><field/></object>");
    c.setXMLTransformers(t.resolveURI("data/trans.xsl"));
    var x = c.getXML();
    expect(x.getNodeName()).toEqual("data");
    expect(x.getChildNodes().get(0).getNodeName()).toEqual("record");
  });

  it("should transform the cache document using the XSL specified by its ID.", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXMLString("<object><field/></object>");
    c.setXMLTransformers("trans1");
    var trans = new jsx3.xml.Document().load(t.resolveURI("data/trans.xsl"));
    t._server.getCache().setDocument("trans1", trans);
    var x = c.getXML();
    expect(x.getNodeName()).toEqual("data");
    expect(x.getChildNodes().get(0).getNodeName()).toEqual("record");
  });

  it("should generate an 'xmlbind' event when a document is loaded into cache.", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXmlBind(1);
    var event = 0;
    c.subscribe("xmlbind", function () {
      event++;
    });
    var doc = new jsx3.xml.Document().loadXML("<object><field/></object>");
    t._server.getCache().setDocument(c.getXMLId(), doc);
    expect(event).toEqual(1);
  });

  it("should not find the document transformed right after setting the cache document.", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXmlBind(1);
    c.setXMLTransformers(t.resolveURI("data/trans.xsl"));
    var doc = new jsx3.xml.Document().loadXML("<object><field/></object>");
    t._server.getCache().setDocument(c.getXMLId(), doc);
    var x = c.getXML();
    expect(x.getNodeName()).toEqual("object");
    expect(x.getChildNodes().get(0).getNodeName()).toEqual("field");
  });

  it("XML binding of Cache document does not trigger property replacement", function () {
    var c = new gi.test.CacheCDFTest();
    t._server.getBodyBlock().setChild(c);
    c.setXmlBind(1);
    var props = c.getServer().JSS;
    props.set("k1", "dv1");
    props.set("k2", "dv2");
    var doc = new jsx3.xml.Document().loadXML('<data><record jsxtext="{k1}" jsxtip="{k2}"/></data>');
    t._server.getCache().setDocument(c.getXMLId(), doc);
    var x = c.getXML();
    var r = x.selectSingleNode("//record");
    expect(r).not.toBeNull();
    expect(r).not.toBeUndefined();
    expect(r.getAttribute("jsxtext")).toEqual("{k1}");
    expect(r.getAttribute("jsxtip")).toEqual("{k2}")
  });

  it("should be able apply XSLT transform on Asynchronously loaded XML", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXmlAsync(1);
    c.setXMLURL(t.resolveURI("data/noncdf.xml"));
    c.setXMLTransformers("trans1");
    var trans = new jsx3.xml.Document().load(t.resolveURI("data/trans.xsl"));
    t._server.getCache().setDocument("trans1", trans);
    c.subscribe("xmlbind", function () {
    }, 500);
    c.doTransform();
    waitsFor(function () {
      return c.getXML().getNodeName() != "loading";   //wait until Transformation is complete
    }, "The Transformation is complete", 750);
    runs(function () {
      var x = c.getXML();
      expect(x.getNodeName()).toEqual("data");
      expect(x.getChildNodes().get(0).getNodeName()).toEqual("record");
    });
  });


  it("should be able apply XSLT transform on Asynchronously loaded XML and XSLT", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXmlAsync(1);
    c.setXMLURL(t.resolveURI("data/noncdf.xml"));
    c.setXMLTransformers(t.resolveURI("data/trans.xsl"));
    c.subscribe("xmlbind", function () {
    }, 500);
    c.doTransform();
    waitsFor(function () {
      return c.getXML().getNodeName() != "loading";   //wait until Transformation is complete
    }, "The Transformation is complete", 750);
    runs(function () {
      var x = c.getXML();
      expect(x.getNodeName()).toEqual("data");
      expect(x.getChildNodes().get(0).getNodeName()).toEqual("record");
    });
  });

  it("Should apply the XSLT transform and the XSL parameter properties", function () {
    var c = new gi.test.CacheCDFTest();
    t._server.getBodyBlock().setChild(c);
    c.setXMLURL(t.resolveURI("data/test3.xml"));
    var props = c.getServer().JSS;
    props.set("k1", "dv1");
    props.set("k2", "dv2");
    var x = c.getXML();
    var r = x.selectSingleNode("//record");
    expect(r).not.toBeNull();
    expect(r).not.toBeUndefined();
    expect(r.getAttribute("jsxtext")).toEqual("dv1");
    expect(r.getAttribute("jsxtip")).toEqual("dv2")
  });

  it("Should apply the XSLT transform and the XSL parameter properties on Asynchronously load XML", function () {
    var c = new gi.test.CacheCDFTest();
    t._server.getBodyBlock().setChild(c);
    c.setXmlAsync(1);
    c.setXMLURL(t.resolveURI("data/test3.xml"));
    var props = t._server.JSS;
    props.set("k1", "dv1");
    props.set("k2", "dv2");
    c.subscribe("xmlbind", function () {
    }, 500);
    c.doTransform();
    waitsFor(function () {
      return c.getXML().getNodeName() != "loading";   //wait until Transformation is complete
    }, "The Transformation is complete", 750);
    runs(function () {
      var x = c.getXML();
      var r = x.selectSingleNode("//record");
      expect(r).not.toBeNull();
      expect(r).not.toBeUndefined();
      expect(r.getAttribute("jsxtext")).toEqual("dv1");
      expect(r.getAttribute("jsxtip")).toEqual("dv2")
    });
  });

  it("should add a name/value pair to the list of parameters to pass to the XSL stylesheet during transformation", function () {
    var c = new gi.test.CacheTest();
    var o = c.getXSLParams();
    expect(o.xslparam1).toBeUndefined();
    c.setXSLParam("xslparam1", "value1");
    o = c.getXSLParams();
    expect(o.xslparam1).toEqual("value1");
  });

  it("should remove a parameter from the list of parameters to pass to the XSL stylesheet during transformation", function () {
    var c = new gi.test.CacheTest();
    c.setXSLParam("xslparam1", "value1");
    c.setXSLParam("xslparam2", "value2");
    var o = c.getXSLParams();
    expect(o.xslparam1).toEqual("value1");
    expect(o.xslparam2).toEqual("value2");
    c.removeXSLParam("xslparam1");
    o = c.getXSLParams();
    expect(o.xslparam1).toBeUndefined();
    // expect(o.xslparam2).toBeNull();
    // expect(o.xslparam2).toBeUndefined();
    c.removeXSLParams();
    o = c.getXSLParams();
    expect(o.xslparam2).toBeUndefined();
  });

  it("should set the XML string,XML transformers and add a name/value pair to the list of parameters to pass to the XSL stylesheet during transformation ", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    c.setXMLString("<object><field/></object>");
    c.setXMLTransformers(t.resolveURI("data/trans.xsl"));
    c.setXSLParam("xslparam1", "value1");
    var x = c.getXML();
    expect(x.getNodeName()).toEqual("data");
    expect(x.getAttribute("param")).toEqual("value1");
  });

  it("the XSL source document of the cache object should be an instance of the Document class", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    var x = c.getXSL();
    expect(x).toBeInstanceOf(jsx3.xml.Document);
    expect(x.hasError()).toBeFalsy();
  });

  it("should remove  the XML and XSL source documents from the server cache", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    var cache = t._server.getCache();
    expect(cache.getDocument(c.getXMLId())).toBeNull();
    expect(cache.getDocument(c.getXSLId())).toBeNull();
    var xml = c.getXML();
    expect(cache.getDocument(c.getXMLId())).not.toBeNull();
    expect(cache.getDocument(c.getXMLId())).not.toBeUndefined();
    var xsl = c.getXSL();
    expect(cache.getDocument(c.getXSLId())).not.toBeNull();
    expect(cache.getDocument(c.getXSLId())).not.toBeUndefined();
    c.resetCacheData();
    expect(cache.getDocument(c.getXMLId())).toBeNull();
    expect(cache.getDocument(c.getXSLId())).toBeNull();
  });

  it("should remove the XML source document stored under the XML ID of this object from the server cache.", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    var cache = t._server.getCache();
    var xml = c.getXML();
    var xsl = c.getXSL();
    c.resetXmlCacheData();
    expect(cache.getDocument(c.getXMLId())).toBeNull();
  });

  it("should remove the XSL source document stored under the XSL ID of this object from the server cache", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    var cache = t._server.getCache();
    var xml = c.getXML();
    var xsl = c.getXSL();
    c.resetXslCacheData();
    // expect(cache.getDocument(c.getXMLId())).toBeNull();
    // expect(cache.getDocument(c.getXMLId())).toBeUndefined();
    expect(cache.getDocument(cache.getDocument(c.getXSLId()))).toBeNull();
  });

  it("should apply a new XML source document using Cacheable.setSourceXML() method", function () {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    var x = new jsx3.xml.Document().loadXML("<object><field/></object>");
    c.setXMLTransformers(t.resolveURI("data/trans.xsl"));
    x = c.setSourceXML(x);
    expect(x.getNodeName()).toEqual("data");
    expect(x.getChildNodes().get(0).getNodeName()).toEqual("record")
  });

  afterEach(function () {
    if (t._server) {
      t._server.destroy();
      delete t._server;
    }
  });
});

