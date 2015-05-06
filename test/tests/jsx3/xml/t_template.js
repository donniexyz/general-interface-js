/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.xml.Template", function(t, jsunit) {

  jsunit.require("jsx3.xml.Template");

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

  t.testDefined = function() {
    jsunit.assertNotNull(jsx3.lang.Class.forName("jsx3.xml.Template"));
  };

  t.testTransform = function() {
    var p = new jsx3.xml.Template((new jsx3.xml.Document()).loadXML(trans1));
    var d = p.transform((new jsx3.xml.Document()).loadXML(src1));
    jsunit.assertFalse("Should not have error: " + p.getError(), p.hasError());
    jsunit.assertTypeOf(d, "string");
    jsunit.assertMatches(/<doc id="r1"\s*\/>/, d);
  };

  t.testReset = function() {
    var p = new jsx3.xml.Template((new jsx3.xml.Document()).loadXML(trans2));
    p.setParam("p1", "2");

    var xml = (new jsx3.xml.Document()).loadXML(src1);
    var d = p.transformToObject(xml);
    jsunit.assertFalse("Should not have error: " + p.getError(), p.hasError());
    jsunit.assertEquals("2", d.selectSingleNode("//doc/@id").getValue());

    d = p.transformToObject(xml);
    jsunit.assertEquals("2", d.selectSingleNode("//doc/@id").getValue());

    p.reset();
    d = p.transformToObject(xml);
    jsunit.assertEquals("1", d.selectSingleNode("//doc/@id").getValue());
  };

  t.testEmptyConstructor = function() {
    jsunit.assertThrows(function() {
      return new jsx3.xml.Template();
    });
  };

  t.testBadTemplate = function() {
    var template = new jsx3.xml.Document().loadXML("<unclosed");
    jsunit.assertThrows(function() {
      return new jsx3.xml.Template(template);
    });
  };

  t.testTransformEntity = function() {
    var xml = (new jsx3.xml.Document()).loadXML(src1);
    var p = new jsx3.xml.Template((new jsx3.xml.Document()).loadXML(trans4));
    var d = p.transform(xml.selectSingleNode("//record"));
    jsunit.assertFalse("Should not have error: " + p.getError(), p.hasError());
    jsunit.assertTypeOf(d, "string");
    jsunit.assertMatches(/^<doc id="r1"\s*\/>$/, d);
  };

  t.testTransformObject = function() {
    var p = new jsx3.xml.Template((new jsx3.xml.Document()).loadXML(trans1));
    var d = p.transformToObject((new jsx3.xml.Document()).loadXML(src1));
    jsunit.assertFalse("Should not have error: " + p.getError(), p.hasError());
    jsunit.assertInstanceOf(d, jsx3.xml.Document);
    jsunit.assertEquals("doc", d.getNodeName());
    jsunit.assertMatches(/^<doc id="r1"\s*\/>$/, d);
  };

  t.testErrorNoTrans = function() {
    var p = new jsx3.xml.Template((new jsx3.xml.Document()).loadXML("<html/>"));
    jsunit.assertTrue(p.hasError());
  };

  t.testParam = function() {
    var p = new jsx3.xml.Template((new jsx3.xml.Document()).loadXML(trans2));
    p.setParams({p1: "2"});
    var d = p.transform((new jsx3.xml.Document()).loadXML(src1));
    jsunit.assertFalse("Should not have error: " + p.getError(), p.hasError());
    jsunit.assertMatches(/^<doc id="2"\s*\/>$/, d);
  };

  t.testParamDefault = function() {
    var p = new jsx3.xml.Template((new jsx3.xml.Document()).loadXML(trans2));
    var d = p.transform((new jsx3.xml.Document()).loadXML(src1));
    jsunit.assertFalse("Should not have error: " + p.getError(), p.hasError());
    jsunit.assertMatches(/^<doc id="1"\s*\/>$/, d);
  };

  t.testOutputEscaping = function() {
    var p = new jsx3.xml.Template((new jsx3.xml.Document()).loadXML(trans3));

    p.setParams({p1:"&amp;"});
    var d = p.transform((new jsx3.xml.Document()).loadXML(src1));
    if (jsx3.xml.Template.supports(jsx3.xml.Template.DISABLE_OUTPUT_ESCAPING))
      jsunit.assertEquals('<doc>&amp;</doc>', d);
//    else
//      jsunit.assertEquals('<doc>&amp;amp;</doc>', d);
  };

  t.testModifyXsl = function() {
    var xsl = new jsx3.xml.Document().loadXML(trans1);
    var temp = new jsx3.xml.Template(xsl);
    var xml = new jsx3.xml.Document().loadXML(src1);

    var d = temp.transformToObject(xml);
    jsunit.assertEquals("r1", d.selectSingleNode("//doc").getAttribute("id"));
    jsunit.assertNullOrUndef(d.selectSingleNode("//doc").getAttribute("a1"));

    var node = xsl.selectSingleNode("//doc");
    node.setAttribute("a1", "v1");
    d = temp.transformToObject(xml);
    jsunit.assertEquals("r1", d.selectSingleNode("//doc").getAttribute("id"));
    jsunit.assertEquals("v1", d.selectSingleNode("//doc").getAttribute("a1"));
  };
  t.testModifyXsl._unless = "IE"; // NOTE: IE doesn't support this ...

});
