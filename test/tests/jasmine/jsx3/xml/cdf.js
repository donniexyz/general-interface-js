/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.xml.CDF", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.xml.CDF", "jsx3.xml.CDF.Document", "jsx3.app.Properties");
  var t = new _jasmine_test.App("jsx3.xml.CDF");
  var newCDF = function (strURL) {
    return (new jsx3.xml.CDF.Document()).load(t.resolveURI(strURL));
  };

  it("should be able to instantiate new instance of jsx3.xml.CDF", function () {
    var cdf = newCDF("data/cdf1.xml");
    expect(cdf.instanceOf(jsx3.xml.CDF)).toBeTruthy();
  });

  it("should return this document to conform to the contract of the jsx3.xml.CDF interface", function () {
    var cdf = newCDF("data/cdf1.xml");
    var xml = cdf.getXML();
    expect(xml).toBeInstanceOf(jsx3.xml.Document);
    // expect(xml.getError()).toBeFalsy();
    expect(xml.hasError()).toBeFalsy();
    expect(xml.selectNodes("//record").size() >= 5).toBeTruthy();
  });

  it("has method assignIds that will apply unique jsxid attribute to all record nodes", function () {
    var cdf = newCDF("data/cdf1.xml");
    cdf.assignIds();
    var xml = cdf.getXML();
    expect(xml.selectSingleNode("//record[@jsxtext='B']").getAttribute("jsxid")).toEqual("2");
    expect(xml.selectSingleNode("//data").getAttribute("jsxid")).toEqual("jsxroot");
    expect(xml.selectSingleNode("//record[@jsxtext='C']").getAttribute("jsxid")).not.toBeNull();
    expect(xml.selectSingleNode("//record[@jsxtext='C']").getAttribute("jsxid")).not.toBeUndefined();
  });

  it("should return an object containing the attributes of a particular CDF record as property/value pairs", function () {
    var cdf = newCDF("data/cdf1.xml");
    var r = cdf.getRecord("5");
    expect(r).toBeInstanceOf(Object);
    expect(r.jsxid).toEqual("5");
    expect(r.jsxtext).toEqual("E");
    expect(r.a1).toEqual("v1");
    expect(r.n1).toBeUndefined();
    expect(cdf.getRecord("-1")).toBeNull();
  });

  it("should return a record from the XML data source of this object", function () {
    var cdf = newCDF("data/cdf1.xml");
    var r = cdf.getRecordNode("5");
    expect(r).toBeInstanceOf(jsx3.xml.Entity);
    expect(r.getAttribute("jsxid")).toEqual("5");
    expect(r.getAttribute("jsxtext")).toEqual("E");
    expect(r.getAttribute("a1")).toEqual("v1");
    expect(r.getAttribute("n1")).toBeNull();
    expect(cdf.getRecord("-1")).toBeNull();
  });

  it("should return a record from the XML data source of this object", function () {
    var cdf = newCDF("data/cdf1.xml");
    var r = cdf.getRecordNode("5");
    r.setAttribute("n1", "v1");
    r = cdf.getRecord("5");
    expect("v1").toEqual(r.n1);
  });

  it("should create a new CDF record and insert it into the CDF data source of this object", function () {
    var cdf = newCDF("data/cdf1.xml");
    cdf.insertRecord({jsxid: "6", jsxtext: "F"});
    var r = cdf.getRootNode().getLastChild();
    expect(r.getAttribute("jsxid")).toEqual("6");
    expect(r.getAttribute("jsxtext")).toEqual("F");
  });

  it("should insert a new record into the XML data source of this object that contains property/value pairs that define the attributes of the XML entity to create and a unique jsxid", function () {
    var cdf = newCDF("data/cdf1.xml");
    cdf.insertRecord({jsxid: "5a", jsxtext: "E - a"}, "5");
    var r = cdf.selectSingleNode("/data/record[@jsxid='5']/record");
    expect(r).not.toBeNull();
    expect(r).not.toBeUndefined();
    expect(r.getAttribute("jsxid")).toEqual("5a");
    expect(r.getAttribute("jsxtext")).toEqual("E - a");
  });

  it("should insert a new record into the XML data source of this object that contains property/value pairs that define the attributes of the XML entity to create", function () {
    var cdf = newCDF("data/cdf1.xml");
    cdf.insertRecord({jsxid: "5", jsxtext: "E'"});
    var r = cdf.selectNodes("/data/record[@jsxid='5']");
    expect(r.size()).toEqual(1);
    expect(r.get(0).getAttribute("jsxtext")).toEqual("E'");
  });

  it("Creates a new CDF record and inserts it into the CDF data source of this object, before the record identified by '5'", function () {
    var cdf = newCDF("data/cdf1.xml");
    cdf.insertRecordBefore({jsxid: "4.1", jsxtext: "D.1"}, "5");
    var r = cdf.selectSingleNode("//record[@jsxid='5']").getPreviousSibling();
    expect(r.getAttribute("jsxid")).toEqual("4.1");
    expect(r.getAttribute("jsxtext")).toEqual("D.1");
  });

  it("Creates a new CDF record and inserts it into the CDF data source of this object, before the record identified by '_5_'", function () {
    var cdf = newCDF("data/cdf1.xml");
    cdf.insertRecordBefore({jsxid: "4.1", jsxtext: "D.1"}, "_5_");
    var r = cdf.selectSingleNode("//record[@jsxid='4.1']");
    expect(r).toBeNull();
  });

  it("should insert a new record node using a XML node object", function () {
    var cdf = newCDF("data/cdf1.xml");
    var e = cdf.createNode(jsx3.xml.Entity.TYPEELEMENT, "record");
    e.setAttribute("jsxid", "6");
    e.setAttribute("jsxtext", "F");
    cdf.insertRecordNode(e);
    var r = cdf.getRootNode().getLastChild();
    expect(r.getAttribute("jsxid")).toEqual("6");
    expect(r.getAttribute("jsxtext")).toEqual("F");
  });

  it("should fail to insert a new record node using a regular object", function () {
    var cdf = newCDF("data/cdf1.xml");
    var func = function () {
      cdf.insertRecordNode({jsxid: "6", jsxtext: "F"});
    };
    expect(func).toThrow();
  });

  it("should insert a new property into an existing record with jsxid equal to '2'", function () {
    var cdf = newCDF("data/cdf1.xml");
    expect(cdf.getRecord("2").prop1).toBeUndefined();
    cdf.insertRecordProperty("2", "prop1", "val1");
    expect(cdf.getRecord("2").prop1).toEqual("val1");
    cdf.insertRecordProperty("2a", "prop1a", "val1a");
  });

  it("should remove a record from the XML data source of this object", function () {
    var cdf = newCDF("data/cdf1.xml");
    expect(cdf.selectSingleNode("//record[@jsxid='5']")).not.toBeNull();
    expect(cdf.selectSingleNode("//record[@jsxid='5']")).not.toBeUndefined();
    var r = cdf.deleteRecord("5");
    expect(r).toBeInstanceOf(jsx3.xml.Entity);
    expect(r.getAttribute("jsxid")).toEqual("5");
    expect(r.getAttribute("jsxtext")).toEqual("E");
    expect(cdf.selectSingleNode("//record[@jsxid='5']")).toBeNull();
    // expect(cdf.selectSingleNode("//record[@jsxid='5']")).toBeUndefined();
    r = cdf.deleteRecord("5a");
    expect(r).toBeNull();
  });

  it("should remove a specific property from a record", function () {
    var cdf = newCDF("data/cdf1.xml");
    expect(cdf.getRecord("2").jsxtext).toEqual("B");
    cdf.deleteRecordProperty("2", "jsxtext");
    expect(cdf.getRecord("2").jsxtext).toBeUndefined();
    cdf.deleteRecordProperty("2", "jsx_text");
    cdf.deleteRecordProperty("2a", "jsxtext");
  });

  it("has method getKey() that generates a unique key value", function () {
    var k1 = jsx3.xml.CDF.getKey();
    expect(k1).toBeTypeOf("string");
    var k2 = jsx3.xml.CDF.getKey();
    expect(k1).not.toEqual(k2);
  });

  it("should be able to instantiate new instance of jsx3.xml.Document", function () {
    var doc = jsx3.xml.CDF.newDocument();
    expect(doc).toBeInstanceOf(jsx3.xml.Document);
    //expect(doc.selectSingleNode("//data")).toBeNull();
    //expect(doc.selectSingleNode("//data")).toBeUndefined();
  });

  it("should transfer a CDF record from another object to this object", function () {
    var cdf1 = newCDF("data/cdf1.xml");
    var cdf2 = jsx3.xml.CDF.Document.newDocument();
    var e = cdf2.adoptRecord(cdf1, "4");
    expect(e).toBeInstanceOf(jsx3.xml.Entity);
    expect(e.getAttribute("jsxid")).toEqual("4");
    expect(cdf1.getRecord("4")).toBeNull();
    expect(cdf2.getRecord("4")).toBeInstanceOf(Object);
    expect(cdf2.getRecord("4").jsxid).toEqual("4");
  });

  it("should transfer a CDF record from another object to this object", function () {
    var cdf1 = newCDF("data/cdf1.xml");
    var cdf2 = jsx3.xml.CDF.Document.newDocument();
    cdf2.adoptRecord(cdf1, "4");
    var e = cdf2.adoptRecordBefore(cdf1, "5", "4");
    expect(cdf1.getRecord("4")).toBeNull();
    //expect(cdf1.getRecord("5")).toBeUndefined();
    var r = cdf2.selectNodes("//record");
    expect(r.size()).toEqual(2);
    expect(r.get(0).getAttribute("jsxid")).toEqual("5");
    expect(r.get(1).getAttribute("jsxid")).toEqual("4");
  });

  it("should convert all attributes in this CDF document that are property keys of the form {key} to the value of the property", function () {
    var cdf = newCDF("data/cdf1.xml");
    var props = new jsx3.app.Properties();
    props.set("prop1", "dvalue1");
    props.set("prop3", "dvalue3");
    cdf.convertProperties(props);
    var r = cdf.getRecord("4");
    expect(r.jsxtip).toEqual("dvalue3");
    expect(r.a1).toEqual("{prop1}");
  });

  it("should convert all attributes in this CDF document that are property keys of the form {key} to the value of the property 2", function () {
    var cdf = newCDF("data/cdf1.xml");
    var props = new jsx3.app.Properties();
    props.set("prop1", "dvalue1");
    props.set("prop3", "dvalue3");
    props.set("prop4", "dvalue4");
    cdf.convertProperties(props, ["a1", "a2", "a4"], true);
    var r = cdf.getRecord("4");
    expect(r.a1).toEqual("dvalue1");
    expect(r.a2).toEqual("{prop2}");
    expect(r.jsxtip).toEqual("dvalue3");
    expect(r.a4).toEqual("{prop4");
  });

// testRedrawRecord = function() {
//    // TODO: spoof redraw record and test that is is called correctly
// };

  it("should create a new XML document that represents an empty CDF document", function () {
    var cdf = jsx3.xml.CDF.Document.newDocument();
    expect(cdf).toBeInstanceOf(jsx3.xml.CDF.Document);
    expect(cdf.hasError()).toBeFalsy();
  });

  it("should create a new node that is an exact clone of this node", function () {
    var cdf = (new jsx3.xml.CDF.Document()).load(t.resolveURI("data/cdf1.xml"));
    var clone = cdf.cloneDocument();
    expect(cdf).toBeInstanceOf(jsx3.xml.CDF.Document);
    expect(clone).toBeInstanceOf(jsx3.xml.CDF.Document);
    expect(cdf.getRootNode().toString()).toEqual(clone.getRootNode().toString());
  });

  it("should be able to wrap a Document as a CDF.Document", function () {
    var doc = (new jsx3.xml.Document()).load(t.resolveURI("data/cdf1.xml"));
    var cdf = jsx3.xml.CDF.Document.wrap(doc);
    expect(cdf).toBeInstanceOf(jsx3.xml.CDF.Document);
    expect(doc.toString()).toEqual(cdf.toString());
  });

  it("should be able to mutate the wrapped CDF.Document nodes", function () {
    var doc = (new jsx3.xml.Document()).load(t.resolveURI("data/cdf1.xml"));
    var cdf = jsx3.xml.CDF.Document.wrap(doc);
    doc.selectSingleNode("//record[@jsxid='5']").setAttribute("n1", "v1");
    expect(cdf.getRecord("5").n1).toEqual("v1");
  });

  it("should return an array containing all CDF IDs (jsxid) of this CDF", function () {
    var cdf = newCDF("data/cdf1.xml");
    var expIds = [null, '2', null, '4', '5'];
    var ids = cdf.getRecordIds();
    expect(expIds[1]).toEqual(ids[1]);
    expect(expIds[3]).toEqual(ids[3]);
    expect(expIds[4]).toEqual(ids[4]);
    expect(ids).toEqual(expIds);
  });
});

