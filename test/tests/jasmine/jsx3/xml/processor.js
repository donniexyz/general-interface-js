/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.xml.Processor", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.xml.Document", "jsx3.xml.Processor");

  var xslPrefix = '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
    '<xsl:output method="xml" omit-xml-declaration="yes"/>';
  var xslSuffix = '</xsl:stylesheet>';
  var src1 = '<data jsxid="root"><record jsxid="r1"/></data>';
  var trans1 = xslPrefix + '<xsl:template match="/data"><doc><xsl:attribute name="id">' +
    '<xsl:value-of select="record/@jsxid"/>' +
    '</xsl:attribute></doc></xsl:template>' + xslSuffix;
  var trans2 = xslPrefix + '<xsl:param name="p1">1</xsl:param>' +
    '<xsl:template match="/data"><doc><xsl:attribute name="id">' +
    '<xsl:value-of select="$p1"/>' +
    '</xsl:attribute></doc></xsl:template>' + xslSuffix;
  var trans3 = xslPrefix + '<xsl:param name="p1"></xsl:param>' +
    '<xsl:template match="/*"><doc>' +
    '<xsl:value-of disable-output-escaping="yes" select="$p1"/>' +
    '</doc></xsl:template>' + xslSuffix;
  var trans4 = xslPrefix + '<xsl:param name="p1"></xsl:param>' +
    '<xsl:template match="*"><doc><xsl:attribute name="id">' +
    '<xsl:value-of select="@jsxid"/>' +
    '</xsl:attribute></doc></xsl:template>' + xslSuffix;
  //t._unless = "NODEP";

  it("should be loaded and defined", function () {
    expect(jsx3.lang.Class.forName("jsx3.xml.Processor")).not.toBeNull();
  });

  it("should test if a new instance of jsx3.app.Processor is created", function () {
    var p = new jsx3.xml.Processor();
    expect(p.hasError()).toBeFalsy();
  });

  it("should throw error while performing empty processing", function () {
    var p = new jsx3.xml.Processor();
    var func = function () {
      p.transform();
    };
    expect(func).toThrow();
  });

  it("should be able to perform XSLT transform of document node", function () {
    var p = new jsx3.xml.Processor((new jsx3.xml.Document()).loadXML(src1), (new jsx3.xml.Document()).loadXML(trans1));
    var d = p.transform();
    expect(p.hasError()).toBeFalsy();
    expect(d).toBeTypeOf("string");
    // IE10 adds a space before />
    expect(d).toMatch(/^<doc id="r1"\s*\/>$/);
  });

  it("should be able to perform XSLT transform an entity node", function () {
    var xml = (new jsx3.xml.Document()).loadXML(src1);
    var p = new jsx3.xml.Processor(xml.selectSingleNode("//record"), (new jsx3.xml.Document()).loadXML(trans4));
    var d = p.transform();
    expect(p.hasError()).toBeFalsy();
    expect(d).toBeTypeOf("string");
    expect(d).toMatch(/^<doc id="r1"\s*\/>$/);
  });

  it("should be able to perform XSLT transform of document node into a new document object", function () {
    var p = new jsx3.xml.Processor((new jsx3.xml.Document()).loadXML(src1), (new jsx3.xml.Document()).loadXML(trans1));
    var d = p.transformToObject();
    expect(p.hasError()).toBeFalsy();
    expect(d).toBeInstanceOf(jsx3.xml.Document);
    expect(d.getNodeName()).toEqual("doc");
    expect(d).toMatch(/^<doc id="r1"\s*\/>$/);
  });

  it("has method setXML and setXSL to set the XML and XSL to be used in the transform", function () {
    var p = new jsx3.xml.Processor();
    p.setXML((new jsx3.xml.Document()).loadXML(src1));
    p.setXSL((new jsx3.xml.Document()).loadXML(trans1));
    var d = p.transform();
    expect(p.hasError()).toBeFalsy();
    expect(d).toBeTypeOf("string");
    expect(d).toMatch(/^<doc id="r1"\s*\/>$/);
  });

  it("has method hasError() that will tell if the XSL/XML set is valid", function () {
    var p = new jsx3.xml.Processor();
    p.setXML((new jsx3.xml.Document()).loadXML(src1));
    p.setXSL((new jsx3.xml.Document()).loadXML("<html/>"));
    var d = p.transform();
    expect(p.hasError()).toBeTruthy();
    expect(d).toBeNull();
  });

  it("has method setParams that sets Params to be used in the transform", function () {
    var p = new jsx3.xml.Processor();
    p.setXML((new jsx3.xml.Document()).loadXML(src1));
    p.setXSL((new jsx3.xml.Document()).loadXML(trans2));
    p.setParams({p1: "2"});
    var d = p.transform();
    expect(p.hasError()).toBeFalsy();
    expect(d).toMatch(/^<doc id="2"\s*\/>$/);
  });

  it("should use the default Params specified in the XSL for the transform", function () {
    var p = new jsx3.xml.Processor();
    p.setXML((new jsx3.xml.Document()).loadXML(src1));
    p.setXSL((new jsx3.xml.Document()).loadXML(trans2));
    var d = p.transform();
    expect(p.hasError()).toBeFalsy();
    expect(d).toMatch(/^<doc id="1"\s*\/>$/);
  });

  it("should be able to specify the Params to be used as part of the constructor", function () {
    var xml = (new jsx3.xml.Document()).loadXML(src1);
    var xsl = (new jsx3.xml.Document()).loadXML(trans2);
    var p = new jsx3.xml.Processor(xml, xsl, {p1: 3});
    var d = p.transform();
    expect(p.hasError()).toBeFalsy();
    expect(d).toMatch(/^<doc id="3"\s*\/>$/);
  });

  it("should be able to tell if DISABLE_OUTPUT_ESCAPING is supported", function () {
    var xml = (new jsx3.xml.Document()).loadXML(src1);
    var xsl = (new jsx3.xml.Document()).loadXML(trans3);
    var p = new jsx3.xml.Processor(xml, xsl, {p1: "&amp;"});
    var d = p.transform();
    if (jsx3.xml.Processor.supports(jsx3.xml.Processor.DISABLE_OUTPUT_ESCAPING))
    expect(d).toEqual('<doc>&amp;</doc>');
  });

  if (!_jasmine_test.IE)
  it("should be able to tell if XSL modification is allowed", function () {
    var xsl = new jsx3.xml.Document().loadXML(trans1);
    var xml = new jsx3.xml.Document().loadXML(src1);
    var d = xml.transformNode(xsl, null, true);
    expect(d.selectSingleNode("//doc").getAttribute("id")).toEqual("r1");
    expect(d.selectSingleNode("//doc").getAttribute("a1")).toBeNull();
    var node = xsl.selectSingleNode("//doc");
    node.setAttribute("a1", "v1");
    d = xml.transformNode(xsl, null, true);
    expect(d.selectSingleNode("//doc").getAttribute("id")).toEqual("r1");
    expect(d.selectSingleNode("//doc").getAttribute("a1")).toEqual("v1");
  });
});
