/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.CDF", function() {

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.CDF", "jsx3.xml.CDF", "jsx3.xml.CDF.Document", "jsx3.app.Properties");
  var t = new _jasmine_test.App("jsx3.gui.CDF");
  // TODO - not used?
  var newCDF = function(strURL) {
    return jsx3.xml.CDF.Document.newDocument().load(t.resolveURI(strURL));
  };

  var cdf, app;

  var _jsxname = function(jsxname) {
    return app.getJSXByName(jsxname);
  };

  var getCDF = function(s) {
    var root = s.getBodyBlock().load("data/cdf.xml");
    return root.getServer().getJSXByName('cdf');
  };

  beforeEach(function() {
    t._server = (!t._server) ? t.newServer("data/server_cdf.xml", ".", true) : t._server;
    cdf = getCDF(t._server);
    app = cdf.getServer();
  });

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });

  it("should be able to create instance", function() {
    expect(cdf).toBeInstanceOf(jsx3.gui.CDF);
  });

  it("should be able to paint", function() {
    expect(cdf.getRendered()).not.toBeNull();
    expect(cdf.getRendered().nodeName.toLowerCase()).toEqual("div");
  });

  it('should get record to map to specified CDF ID', function() {
    var cdfId = cdf.getCDFId();
    expect(cdfId).toBeUndefined();
    cdf.setCDFId('2');
    cdfId = cdf.getCDFId();
    expect(cdfId).toEqual('2');

    expect(_jsxname('firstName').getValue()).toEqual('Tom');
    expect(_jsxname('middleInitial').getValue()).toEqual('R');
    expect(_jsxname('lastName').getValue()).toEqual('Pink');
    cdf.setCDFId('3');
    expect(_jsxname('firstName').getValue()).toEqual('Zelda');
    expect(_jsxname('middleInitial').getValue()).toEqual('P');
    expect(_jsxname('lastName').getValue()).toEqual('Bingo');
  });

  it('should able to update the named attribute that the GUI object is mapped', function() {
    cdf.setCDFId('2');

    var cdfAttr = _jsxname('firstName').getCDFAttribute();
    expect(cdfAttr).toEqual('first');

    _jsxname('firstName').setCDFAttribute('middle');
    cdfAttr = _jsxname('firstName').getCDFAttribute();
    expect(cdfAttr).toEqual('middle');
    expect(_jsxname('firstName').getValue()).toEqual('R');

  });

  it("should be able to map between form value to XML", function() {
    var cdfXML = cdf.getXML();
    var record2 = cdfXML.selectSingleNode("//record[@jsxid='2']");
    cdf.setCDFId('2');

    expect(_jsxname('firstName').getValue()).toEqual(record2.getAttribute('first'));
    expect(_jsxname('middleInitial').getValue()).toEqual(record2.getAttribute('middle'));
    expect(_jsxname('lastName').getValue()).toEqual(record2.getAttribute('last'));
  });

  it("should be able to change form CDF xml when form value changes", function() {
    var text = cdf.getRecord('1').first;
    expect(text).toEqual('Bob');
    var firstName = _jsxname('firstName');
    var matrix = _jsxname('matrix1');
    cdf.setCDFId('1');
    firstName.setValue('summer');
    matrix.insertRecordProperty(cdf.getCDFId(), firstName.getCDFAttribute(), firstName.getValue(), true);
    text = cdf.getRecord('1').first;
    expect(text).toEqual('summer');
  });

  it("should be able to update the source CDF document with values returned from mapped descendants", function() {
    cdf.setCDFId('2');
    _jsxname('firstName').setValue("Summer");
    var cdfXML = cdf.getXML();
    var record2 = cdfXML.selectSingleNode("//record[@jsxid='2']");
    expect(record2.getAttribute('first')).toEqual('Tom');
    cdf.write();
    expect(record2.getAttribute('first')).toEqual('Summer');
  });

  // it("should be able to update all mapped descendants with values from the source CDF Document", function() {
  //   var cdfXML = cdf.getXML();
  //   var record2 = cdfXML.selectSingleNode("//record[@jsxid='2']");
  //   record2.setAttribute('first', 'Summer');
  //   // cdf.read(true, '1');
  //   cdf.setCDFId('2');
  //   expect(_jsxname('firstName').getValue()).toEqual();
  //   // var text = cdf.getRecord('2').first;
  //   // expect(text).toEqual(); 
  // });

  // should have more form type, to test the read/write method in each gui class
  // it("should be able to read/write from datepicker", function() {
  //   var cdfXML = cdf.getXML();
  //   var record2 = cdfXML.selectSingleNode("//record[@jsxid='2']");
  //   cdf.setCDFId('2');
  //   var datepicker = getServer().getJSXByName('datePicker');
  //   var d = new Date('January 6, 2013');
  //   datePicker.setDate(d);
  //   cdf.write();
  //   expect(record2.getAttribute('date')).toEqual();
  // });

  // it("should be able to read/write from timepicker", function() {
  //   expect().toBeDefined();
  // });

  // it("should be able to read/write from slider", function() {
  //   expect().toBeDefined();
  // });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});