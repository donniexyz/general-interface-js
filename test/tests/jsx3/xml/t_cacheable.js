/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.xml.Cacheable", function(t, jsunit) {

  jsunit.require("jsx3.xml.Cacheable", "jsx3.app.Server", "jsx3.app.Model");

  t._setUp = function() {
    jsx3.Class.defineClass("gi.test.CacheTest", jsx3.app.Model, [jsx3.xml.Cacheable], function(CacheTest, CacheTest_prototype) {
    });

    jsx3.Class.defineClass("gi.test.CacheCDFTest", jsx3.app.Model, [jsx3.xml.Cacheable, jsx3.xml.CDF],
        function(CacheCDFTest, CacheCDFTest_prototype) {
    });

    t._server = t.newServer(null, "JSXAPPS/testCacheableServer", false, {namespace:"testCacheableServer"});
  };

  t._tearDown = function() {
    if (t._server) {
      t._server.destroy();
      delete t._server;
    }

    delete gi.test.CacheTest;
  };

  t.testServer = function() {
    var s = t._server;
    jsunit.assertInstanceOf(s, jsx3.app.Server);
    jsunit.assertEquals("testCacheableServer", s.getEnv("namespace"));
  };
  
  t.testClass = function() {
    jsunit.assertNotUndefined(gi.test.CacheTest);
    jsunit.assertInstanceOf(gi.test.CacheTest.jsxclass, jsx3.lang.Class);
    jsunit.assertTrue(jsx3.xml.Cacheable.jsxclass.isAssignableFrom(gi.test.CacheTest.jsxclass));
  };

  t.testXmlId = function() {
    var c = new gi.test.CacheTest();
    var id = c.getXMLId();
    jsunit.assertTypeOf(id, "string");
    jsunit.assert(id.length > 0);
    c.setXMLId("myxmlid");
    jsunit.assertEquals("myxmlid", c.getXMLId());
  };

  t.testXmlString = function() {
    var c = new gi.test.CacheTest();
    jsunit.assertNullOrUndef(c.getXMLString());
    c.setXMLString("<xml/>");
    jsunit.assertEquals("<xml/>", c.getXMLString());
  };

  t.testXmlUrl = function() {
    var c = new gi.test.CacheTest();
    jsunit.assertNullOrUndef(c.getXMLURL());
    c.setXMLURL("doc.xml");
    jsunit.assertEquals("doc.xml", c.getXMLURL());
  };

  t.testXmlFromDefault = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    var x = c.getXML();

    jsunit.assertInstanceOf(x, jsx3.xml.Document);
    jsunit.assertEquals("data", x.getNodeName());
    jsunit.assertEquals(0, x.getChildNodes().size());
  };

  t.testXmlFromId = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXMLId("myxmlid");
    var cache = c.getServer().getCache();
    var x = new jsx3.xml.Document().loadXML("<data><record/></data>");
    cache.setDocument("myxmlid", x);

    jsunit.assertEquals(x, c.getXML());
  };

  t.testXmlFromString = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXMLString('<data><record jsxid="1"/><record jsxid="2"/></data>');
    var x = c.getXML();
    jsunit.assertEquals("data", x.getNodeName());
    jsunit.assertEquals(2, x.getChildNodes().size());
    jsunit.assertNotNullOrUndef(x.selectSingleNode("//record[@jsxid='2']"));
  };

  t.testXmlFromUrl = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXMLURL(t.resolveURI("data/cdf1.xml"));
    var x = c.getXML();
    jsunit.assertEquals("data", x.getNodeName());
    jsunit.assertEquals(5, x.getChildNodes().size());
    jsunit.assertNotNullOrUndef(x.selectSingleNode("//record[@jsxid='4']"));
  };

  t.testXmlFromError = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXMLString('<data>');
    var x = c.getXML();
    jsunit.assertInstanceOf(x, jsx3.xml.Document);
    jsunit.assertTrue(x.hasError());
  };

  t.testXmlFromPrecidence1 = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXMLId("myxmlid");
    c.setXMLString('<data><record jsxid="1"/></data>');
    c.setXMLURL(t.resolveURI("data/cdf1.xml"));

    var cache = c.getServer().getCache();
    var x = new jsx3.xml.Document().loadXML("<data><record/></data>");
    cache.setDocument("myxmlid", x);

    jsunit.assertEquals(x, c.getXML());
  };

  t.testXmlFromPrecidence2 = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXMLString('<data><record jsxid="1"/></data>');
    c.setXMLURL(t.resolveURI("data/cdf1.xml"));

    var x = c.getXML();
    jsunit.assertEquals(1, x.getChildNodes().size());
  };

  t.testShareShare = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setShareResources(jsx3.xml.Cacheable.SHARERESOURCES);
    var x = c.getXML();
    var id = c.getXMLId();

    t._server.getBodyBlock().removeChild(c);

    var cache = t._server.getCache();
    jsunit.assertEquals(x, t._server.getCache().getDocument(id));
  };

  t.testShareCleanup = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setShareResources(jsx3.xml.Cacheable.CLEANUPRESOURCES);
    var x = c.getXML();
    var id = c.getXMLId();

    t._server.getBodyBlock().removeChild(c);

    var cache = t._server.getCache();
    jsunit.assertNullOrUndef(c.getParent());
    jsunit.assertNullOrUndef(c.getServer());
    jsunit.assertNullOrUndef(cache.getDocument(id));
  };

  t.testTransformerUrl = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXMLString("<object><field/></object>");
    c.setXMLTransformers(t.resolveURI("data/trans.xsl"));

    var x = c.getXML();
    jsunit.assertEquals("data", x.getNodeName());
    jsunit.assertEquals("record", x.getChildNodes().get(0).getNodeName());
  };

  t.testTransformerId = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXMLString("<object><field/></object>");
    c.setXMLTransformers("trans1");

    var trans = new jsx3.xml.Document().load(t.resolveURI("data/trans.xsl"));
    t._server.getCache().setDocument("trans1", trans);
    
    var x = c.getXML();
    jsunit.assertEquals("data", x.getNodeName());
    jsunit.assertEquals("record", x.getChildNodes().get(0).getNodeName());
  };

  t.testXmlBindEvent = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXmlBind(1);

    var event = 0;

    c.subscribe("xmlbind", function() {
      event++;
    });

    var doc = new jsx3.xml.Document().loadXML("<object><field/></object>");
    t._server.getCache().setDocument(c.getXMLId(), doc);

    jsunit.assertEquals(1, event);
  };

  t.testXmlBindNoTrans = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXmlBind(1);
    c.setXMLTransformers(t.resolveURI("data/trans.xsl"));

    var doc = new jsx3.xml.Document().loadXML("<object><field/></object>");
    t._server.getCache().setDocument(c.getXMLId(), doc);

    var x = c.getXML();
    jsunit.assertEquals("object", x.getNodeName());
    jsunit.assertEquals("field", x.getChildNodes().get(0).getNodeName());
  };

  t.testXmlBindNoPropReplace = function() {
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

    jsunit.assertNotNullOrUndef(r);
    jsunit.assertEquals("{k1}", r.getAttribute("jsxtext"));
    jsunit.assertEquals("{k2}", r.getAttribute("jsxtip"));
  };

  t.testTransformerAsync = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXmlAsync(1);
    c.setXMLURL(t.resolveURI("data/noncdf.xml"));
    c.setXMLTransformers("trans1");

    var trans = new jsx3.xml.Document().load(t.resolveURI("data/trans.xsl"));
    t._server.getCache().setDocument("trans1", trans);

    c.subscribe("xmlbind", t.asyncCallback(function() {
      var x = c.getXML();
      jsunit.assertEquals("data", x.getNodeName());
      jsunit.assertEquals("record", x.getChildNodes().get(0).getNodeName());
    }));

    c.doTransform();
  };
  t.testTransformerAsync._async = true;

  t.testTransformerAsyncURL = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXmlAsync(1);
    c.setXMLURL(t.resolveURI("data/noncdf.xml"));
    c.setXMLTransformers(t.resolveURI("data/trans.xsl"));

    c.subscribe("xmlbind", t.asyncCallback(function() {
      var x = c.getXML();
      jsunit.assertEquals("data", x.getNodeName());
      jsunit.assertEquals("record", x.getChildNodes().get(0).getNodeName());
    }));

    c.doTransform();
  };
  t.testTransformerAsyncURL._async = true;

  t.testPropReplace = function() {
    var c = new gi.test.CacheCDFTest();
    t._server.getBodyBlock().setChild(c);

    c.setXMLURL(t.resolveURI("data/test3.xml"));

    var props = c.getServer().JSS;
    props.set("k1", "dv1");
    props.set("k2", "dv2");
    
    var x = c.getXML();
    var r = x.selectSingleNode("//record");

    jsunit.assertNotNullOrUndef(r);
    jsunit.assertEquals("dv1", r.getAttribute("jsxtext"));
    jsunit.assertEquals("dv2", r.getAttribute("jsxtip"));
  };

  t.testPropReplaceAsync = function() {
    var c = new gi.test.CacheCDFTest();
    t._server.getBodyBlock().setChild(c);

    c.setXmlAsync(1);
    c.setXMLURL(t.resolveURI("data/test3.xml"));

    var props = t._server.JSS;
    props.set("k1", "dv1");
    props.set("k2", "dv2");

    c.subscribe("xmlbind", t.asyncCallback(function() {
      var x = c.getXML();
      var r = x.selectSingleNode("//record");

      jsunit.assertNotNullOrUndef(r);
      jsunit.assertEquals("dv1", r.getAttribute("jsxtext"));
      jsunit.assertEquals("dv2", r.getAttribute("jsxtip"));
    }));

    c.doTransform();
  };
  t.testPropReplaceAsync._async = true;

  t.testSetParam = function() {
    var c = new gi.test.CacheTest();

    var o = c.getXSLParams();
    jsunit.assertNullOrUndef(o.xslparam1);

    c.setXSLParam("xslparam1", "value1");
    o = c.getXSLParams();
    jsunit.assertEquals("value1", o.xslparam1);
  };

  t.testRemoveParams = function() {
    var c = new gi.test.CacheTest();

    c.setXSLParam("xslparam1", "value1");
    c.setXSLParam("xslparam2", "value2");

    var o = c.getXSLParams();
    jsunit.assertEquals("value1", o.xslparam1);
    jsunit.assertEquals("value2", o.xslparam2);

    c.removeXSLParam("xslparam1");

    o = c.getXSLParams();
    jsunit.assertNullOrUndef(o.xslparam1);
    jsunit.assertEquals("value2", o.xslparam2);

    c.removeXSLParams();
    o = c.getXSLParams();
    jsunit.assertNullOrUndef(o.xslparam2);
  };

  t.testParams = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    c.setXMLString("<object><field/></object>");
    c.setXMLTransformers(t.resolveURI("data/trans.xsl"));
    c.setXSLParam("xslparam1", "value1");

    var x = c.getXML();
    jsunit.assertEquals("data", x.getNodeName());
    jsunit.assertEquals("value1", x.getAttribute("param"));
  };

  t.testGetXsl = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    var x = c.getXSL();
    jsunit.assertInstanceOf(x, jsx3.xml.Document);
    jsunit.assertFalse("XSL should not have error: " + x.getError(), x.hasError());
  };

  t.testResetCache = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    var cache = t._server.getCache();

    jsunit.assertNullOrUndef(cache.getDocument(c.getXMLId()));
    jsunit.assertNullOrUndef(cache.getDocument(c.getXSLId()));
    var xml = c.getXML();
    jsunit.assertNotNullOrUndef(cache.getDocument(c.getXMLId()));
    var xsl = c.getXSL();
    jsunit.assertNotNullOrUndef(cache.getDocument(c.getXSLId()));

    c.resetCacheData();
    jsunit.assertNullOrUndef(cache.getDocument(c.getXMLId()));
    jsunit.assertNullOrUndef(cache.getDocument(c.getXSLId()));
  };

  t.testResetCacheXml = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    var cache = t._server.getCache();

    var xml = c.getXML();
    var xsl = c.getXSL();

    c.resetXmlCacheData();
    jsunit.assertNullOrUndef(cache.getDocument(c.getXMLId()));
    jsunit.assertNotNullOrUndef(cache.getDocument(c.getXSLId()));
  };

  t.testResetCacheXsl = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);
    var cache = t._server.getCache();

    var xml = c.getXML();
    var xsl = c.getXSL();

    c.resetXslCacheData();
    jsunit.assertNotNullOrUndef(cache.getDocument(c.getXMLId()));
    jsunit.assertNullOrUndef(cache.getDocument(c.getXSLId()));
  };

  t.testSetSourceXml = function() {
    var c = new gi.test.CacheTest();
    t._server.getBodyBlock().setChild(c);

    var x = new jsx3.xml.Document().loadXML("<object><field/></object>");
    c.setXMLTransformers(t.resolveURI("data/trans.xsl"));

    x = c.setSourceXML(x);
    jsunit.assertEquals("data", x.getNodeName());
    jsunit.assertEquals("record", x.getChildNodes().get(0).getNodeName());
  };

});
