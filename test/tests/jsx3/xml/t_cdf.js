/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.xml.CDF", function(t, jsunit) {

  jsunit.require("jsx3.xml.CDF", "jsx3.xml.CDF.Document", "jsx3.app.Properties");

  var newCDF = function(strURL) {
    return (new jsx3.xml.CDF.Document()).load(t.resolveURI(strURL));
  };

  t.testNew = function() {
    var cdf = newCDF("data/cdf1.xml");
    jsunit.assertTrue(cdf.instanceOf(jsx3.xml.CDF));
  };

  t.testGetXml = function() {
    var cdf = newCDF("data/cdf1.xml");
    var xml = cdf.getXML();
    jsunit.assertInstanceOf(xml, jsx3.xml.Document);
    jsunit.assertFalse("Should not have error: " + xml.getError(), xml.hasError());
    jsunit.assert(xml.selectNodes("//record").size() >= 5);
  };

  t.testAssignIds = function() {
    var cdf = newCDF("data/cdf1.xml");
    cdf.assignIds();

    var xml = cdf.getXML();
    jsunit.assertEquals("2", xml.selectSingleNode("//record[@jsxtext='B']").getAttribute("jsxid"));
    jsunit.assertEquals("jsxroot", xml.selectSingleNode("//data").getAttribute("jsxid"));
    jsunit.assertNotNullOrUndef(xml.selectSingleNode("//record[@jsxtext='C']").getAttribute("jsxid"));
  };

  t.testGetRecord = function() {
    var cdf = newCDF("data/cdf1.xml");
    var r = cdf.getRecord("5");

    jsunit.assertInstanceOf(r, Object);
    jsunit.assertEquals("5", r.jsxid);
    jsunit.assertEquals("E", r.jsxtext);
    jsunit.assertEquals("v1", r.a1);
    jsunit.assertUndefined(r.n1);

    jsunit.assertNullOrUndef(cdf.getRecord("-1"));
  };

  t.testGetRecordNode = function() {
    var cdf = newCDF("data/cdf1.xml");
    var r = cdf.getRecordNode("5");

    jsunit.assertInstanceOf(r, jsx3.xml.Entity);
    jsunit.assertEquals("5", r.getAttribute("jsxid"));
    jsunit.assertEquals("E", r.getAttribute("jsxtext"));
    jsunit.assertEquals("v1", r.getAttribute("a1"));
    jsunit.assertNull(r.getAttribute("n1"));

    jsunit.assertNullOrUndef(cdf.getRecordNode("-1"));
  };

  t.testGetRecordNodeMutable = function() {
    var cdf = newCDF("data/cdf1.xml");
    var r = cdf.getRecordNode("5");
    r.setAttribute("n1", "v1");

    r = cdf.getRecord("5");
    jsunit.assertEquals("v1", r.n1);
  };

  t.testInsertRecord1 = function() {
    var cdf = newCDF("data/cdf1.xml");
    cdf.insertRecord({jsxid:"6", jsxtext:"F"});

    var r = cdf.getRootNode().getLastChild();
    jsunit.assertEquals("6", r.getAttribute("jsxid"));
    jsunit.assertEquals("F", r.getAttribute("jsxtext"));
  };

  t.testInsertRecord2 = function() {
    var cdf = newCDF("data/cdf1.xml");
    cdf.insertRecord({jsxid:"5a", jsxtext:"E - a"}, "5");

    var r = cdf.selectSingleNode("/data/record[@jsxid='5']/record");
    jsunit.assertNotNullOrUndef("Could not find a record nested in the record with jsxid=5: " + cdf, r);
    jsunit.assertEquals("5a", r.getAttribute("jsxid"));
    jsunit.assertEquals("E - a", r.getAttribute("jsxtext"));
  };

  t.testInsertRecord3 = function() {
    var cdf = newCDF("data/cdf1.xml");
    cdf.insertRecord({jsxid:"5", jsxtext:"E'"});

    var r = cdf.selectNodes("/data/record[@jsxid='5']");
    jsunit.assertEquals(1, r.size());
    jsunit.assertEquals("E'", r.get(0).getAttribute("jsxtext"));
  };

  t.testInsertRecordBefore1 = function() {
    var cdf = newCDF("data/cdf1.xml");
    cdf.insertRecordBefore({jsxid:"4.1", jsxtext:"D.1"}, "5");

    var r = cdf.selectSingleNode("//record[@jsxid='5']").getPreviousSibling();
    jsunit.assertEquals("4.1", r.getAttribute("jsxid"));
    jsunit.assertEquals("D.1", r.getAttribute("jsxtext"));
  };

  t.testInsertRecordBefore2 = function() {
    var cdf = newCDF("data/cdf1.xml");
    cdf.insertRecordBefore({jsxid:"4.1", jsxtext:"D.1"}, "_5_");

    var r = cdf.selectSingleNode("//record[@jsxid='4.1']");
    jsunit.assertNull(r);
  };

  t.testInsertRecordNode1 = function() {
    var cdf = newCDF("data/cdf1.xml");
    var e = cdf.createNode(jsx3.xml.Entity.TYPEELEMENT, "record");
    e.setAttribute("jsxid", "6");
    e.setAttribute("jsxtext", "F");
    cdf.insertRecordNode(e);

    var r = cdf.getRootNode().getLastChild();
    jsunit.assertEquals("6", r.getAttribute("jsxid"));
    jsunit.assertEquals("F", r.getAttribute("jsxtext"));
  };

  t.testInsertRecordNode2 = function() {
    var cdf = newCDF("data/cdf1.xml");
    jsunit.assertThrows(function() {
      cdf.insertRecordNode({jsxid:"6", jsxtext:"F"});
    });
  };

  t.testInsertRecordProperty = function() {
    var cdf = newCDF("data/cdf1.xml");
    jsunit.assertNullOrUndef(cdf.getRecord("2").prop1);
    cdf.insertRecordProperty("2", "prop1", "val1");
    jsunit.assertEquals("val1", cdf.getRecord("2").prop1);

    cdf.insertRecordProperty("2a", "prop1a", "val1a");
    jsunit.assertNullOrUndef(cdf.getRecordNode("2a"));
  };

  t.testDeleteRecord = function() {
    var cdf = newCDF("data/cdf1.xml");
    jsunit.assertNotNullOrUndef(cdf.selectSingleNode("//record[@jsxid='5']"));

    var r = cdf.deleteRecord("5");
    jsunit.assertInstanceOf(r, jsx3.xml.Entity);
    jsunit.assertEquals("5", r.getAttribute("jsxid"));
    jsunit.assertEquals("E", r.getAttribute("jsxtext"));
    jsunit.assertNullOrUndef(cdf.selectSingleNode("//record[@jsxid='5']"));

    r = cdf.deleteRecord("5a");
    jsunit.assertNull(r);
  };

  t.testDeleteRecordProperty = function() {
    var cdf = newCDF("data/cdf1.xml");
    jsunit.assertEquals("B", cdf.getRecord("2").jsxtext);
    cdf.deleteRecordProperty("2", "jsxtext");
    jsunit.assertNullOrUndef(cdf.getRecord("2").jsxtext);

    cdf.deleteRecordProperty("2", "jsx_text");
    cdf.deleteRecordProperty("2a", "jsxtext");
  };

  t.testGetKey = function() {
    var k1 = jsx3.xml.CDF.getKey();
    jsunit.assertTypeOf(k1, "string");
    var k2 = jsx3.xml.CDF.getKey();
    jsunit.assertNotEquals(k1, k2);
  };

  t.testNewDocument = function() {
    var doc = jsx3.xml.CDF.newDocument();
    jsunit.assertInstanceOf(doc, jsx3.xml.Document);
    jsunit.assertNotNullOrUndef(doc.selectSingleNode("//data"));
  };

  t.testAdoptRecord = function() {
    var cdf1 = newCDF("data/cdf1.xml");
    var cdf2 = jsx3.xml.CDF.Document.newDocument();
    var e = cdf2.adoptRecord(cdf1, "4");

    jsunit.assertInstanceOf(e, jsx3.xml.Entity);
    jsunit.assertEquals("4", e.getAttribute("jsxid"));
    jsunit.assertNullOrUndef(cdf1.getRecord("4"));
    jsunit.assertInstanceOf(cdf2.getRecord("4"), Object);
    jsunit.assertEquals("4", cdf2.getRecord("4").jsxid);
  };

  t.testAdoptRecordBefore = function() {
    var cdf1 = newCDF("data/cdf1.xml");
    var cdf2 = jsx3.xml.CDF.Document.newDocument();
    cdf2.adoptRecord(cdf1, "4");
    var e = cdf2.adoptRecordBefore(cdf1, "5", "4");

    jsunit.assertNullOrUndef(cdf1.getRecord("4"));
    jsunit.assertNullOrUndef(cdf1.getRecord("5"));

    var r = cdf2.selectNodes("//record");
    jsunit.assertEquals("Should have only two records: " + cdf2, 2, r.size());
    jsunit.assertEquals("5", r.get(0).getAttribute("jsxid"));
    jsunit.assertEquals("4", r.get(1).getAttribute("jsxid"));
  };

  t.testConvertProperties1 = function() {
    var cdf = newCDF("data/cdf1.xml");
    var props = new jsx3.app.Properties();
    props.set("prop1", "dvalue1");
    props.set("prop3", "dvalue3");

    cdf.convertProperties(props);
    var r = cdf.getRecord("4");

    jsunit.assertEquals("dvalue3", r.jsxtip);
    jsunit.assertEquals("{prop1}", r.a1);
  };

  t.testConvertProperties2 = function() {
    var cdf = newCDF("data/cdf1.xml");
    var props = new jsx3.app.Properties();
    props.set("prop1", "dvalue1");
    props.set("prop3", "dvalue3");
    props.set("prop4", "dvalue4");

    cdf.convertProperties(props, ["a1", "a2", "a4"], true);
    var r = cdf.getRecord("4");

    jsunit.assertEquals("dvalue1", r.a1);
    jsunit.assertEquals("{prop2}", r.a2);
    jsunit.assertEquals("dvalue3", r.jsxtip);
    jsunit.assertEquals("{prop4", r.a4);
  };

//  t.testRedrawRecord = function() {
//    // TODO: spoof redraw record and test that is is called correctly
//  };

  t.testDocNewDocument = function() {
    var cdf = jsx3.xml.CDF.Document.newDocument();
    jsunit.assertInstanceOf(cdf, jsx3.xml.CDF.Document);
    jsunit.assertFalse(cdf.hasError());
  };

  t.testCloneDoc = function() {
    var cdf = (new jsx3.xml.CDF.Document()).load(t.resolveURI("data/cdf1.xml"));
    var clone = cdf.cloneDocument();

    jsunit.assertInstanceOf("Source should be CDF document: " + cdf.getClass(), cdf, jsx3.xml.CDF.Document);
    jsunit.assertInstanceOf("Clone should be CDF document: " + clone.getClass(), clone, jsx3.xml.CDF.Document);
    jsunit.assertEquals(cdf.getRootNode().toString(), clone.getRootNode().toString());
  };

  t.testWrapDoc = function() {
    var doc = (new jsx3.xml.Document()).load(t.resolveURI("data/cdf1.xml"));
    var cdf = jsx3.xml.CDF.Document.wrap(doc);

    jsunit.assertInstanceOf(cdf, jsx3.xml.CDF.Document);
    jsunit.assertEquals(doc.toString(), cdf.toString());
  };

  t.testWrapDocMutable = function() {
    var doc = (new jsx3.xml.Document()).load(t.resolveURI("data/cdf1.xml"));
    var cdf = jsx3.xml.CDF.Document.wrap(doc);

    doc.selectSingleNode("//record[@jsxid='5']").setAttribute("n1", "v1");
    jsunit.assertEquals("v1", cdf.getRecord("5").n1);
  };
  
  t.testGetCdfIds = function () {
    var cdf = newCDF("data/cdf1.xml");
    var expIds = ['','2','','4','5'];
    var ids = cdf.getRecordIds();

    jsunit.assertEquals(expIds[1], ids[1]);
    jsunit.assertEquals(expIds[3], ids[3]);
    jsunit.assertEquals(expIds[4], ids[4]);
    jsunit.assertArrayEquals(expIds, ids);
  };

});
