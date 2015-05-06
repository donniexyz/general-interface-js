/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.xml.Entity", function(t, jsunit) {

  jsunit.require("jsx3.xml.Entity", "jsx3.xml.Document");

  t.testDefined = function() {
    jsunit.assertNotNull(jsx3.lang.Class.forName("jsx3.xml.Entity"));
  };

  t.testConstructor = function() {
    jsunit.assertThrows(function(){
      return new jsx3.xml.Entity();
    });
  };

  t.testDocumentElementEquivalence = function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    jsunit.assertEquals("data", d.getNodeName());
  };

  t.testRootNode = function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var n = d.getRootNode();
    jsunit.assertTrue(n instanceof jsx3.xml.Entity);
    jsunit.assertFalse(n instanceof jsx3.xml.Document);
    jsunit.assertEquals("data", n.getNodeName());
  };

  t.testCreateNodeElement = function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "element");
    jsunit.assertEquals("element", ne.getNodeName());
  };

  t.testCreateNodeElementNs = function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "el:element","http://namespace");
    jsunit.assertEquals("element", ne.getBaseName());
    jsunit.assertEquals("el", ne.getPrefix());
    jsunit.assertEquals("http://namespace", ne.getNamespaceURI());
  };

  t.testCreateNodeAttribute = function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var na = d.createNode(jsx3.xml.Entity.TYPEATTRIBUTE, "attribute");
    jsunit.assertEquals("attribute", na.getNodeName());
  };

  t.testCreateNodeAttributeNs = function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEATTRIBUTE, "at:attribute","http://namespace");
    jsunit.assertEquals("attribute", ne.getBaseName());
    jsunit.assertEquals("at", ne.getPrefix());
    jsunit.assertEquals("http://namespace", ne.getNamespaceURI());
  };

  t.testGetXml = function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "element");
    jsunit.assertEquals("<element/>", ne.getXML());
  };

  t.testGetXmlNs = function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "el:element","http://namespace");
    jsunit.assertEquals("<el:element xmlns:el=\"http://namespace\"/>", ne.getXML());
  };

  t.testCreateNodeText = function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nt = d.createNode(jsx3.xml.Entity.TYPETEXT, "text");
    jsunit.assertEquals("text", nt.getValue());
  };

  t.testCreateNodeCdata = function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nd = d.createNode(jsx3.xml.Entity.TYPECDATA, "cdata");
    jsunit.assertEquals("cdata", nd.getValue());
  };

  t.testCreateNodeComment = function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nc = d.createNode(jsx3.xml.Entity.TYPECOMMENT, "comment");
    jsunit.assertEquals("comment", nc.getValue());
  };

  t.testGetNodeType = function() {
    var d = new jsx3.xml.Document().loadXML('<data att="val">poo</data>');
    jsunit.assertEquals(jsx3.xml.Entity.TYPEELEMENT, d.getNodeType());
    jsunit.assertEquals(jsx3.xml.Entity.TYPETEXT, d.getChildNodes(true).get(0).getNodeType());
    jsunit.assertEquals(jsx3.xml.Entity.TYPEATTRIBUTE, d.getAttributeNode("att").getNodeType());
  };

  t.testGetNodeName = function() {
    var d = new jsx3.xml.Document().loadXML('<data att="val"/>');
    jsunit.assertEquals("data", d.getNodeName());
    d = new jsx3.xml.Document().loadXML('<foo:data xmlns:foo="http://foo.example.com"/>');
    jsunit.assertEquals("foo:data", d.getNodeName());
  };

  t.testGetNamespaceUri1 = function() {
    var ns = "http://foo.example.com";
    var d = new jsx3.xml.Document().loadXML('<foo:data xmlns:foo="' + ns + '"><foo:record/><record/></foo:data>');
    jsunit.assertEquals(ns, d.getNamespaceURI());
    jsunit.assertEquals(ns, d.getChildNodes().get(0).getNamespaceURI());
    jsunit.assertEquals("", d.getChildNodes().get(1).getNamespaceURI());
  };

  t.testGetNamespaceUri2 = function() {
    var ns = "http://foo.example.com";
    var d = new jsx3.xml.Document().loadXML('<data xmlns="' + ns + '"><record/></data>');
    jsunit.assertEquals(ns, d.getNamespaceURI());
    jsunit.assertEquals(ns, d.getChildNodes().get(0).getNamespaceURI());
  };

  t.testGetBaseName = function() {
    var d = new jsx3.xml.Document().loadXML('<foo:data xmlns:foo="http://foo.example.com"/>');
    jsunit.assertEquals("data", d.getBaseName());
  };

  t.testGetPrefix = function() {
    var d = new jsx3.xml.Document().loadXML('<data att="val"/>');
    jsunit.assertEquals("", d.getPrefix());
    d = new jsx3.xml.Document().loadXML('<foo:data xmlns:foo="http://foo.example.com"/>');
    jsunit.assertEquals("foo", d.getPrefix());
    d = new jsx3.xml.Document().loadXML('<data xmlns="http://foo.example.com"/>');
    jsunit.assertEquals("", d.getPrefix());
  };

  t.testAppendChild = function() {
    var d = new jsx3.xml.Document().loadXML('<data/>');
    var n1 = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "r1");
    var n2 = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "r2");
    d.appendChild(n1);
    d.appendChild(n2);

    jsunit.assertEquals(n1, d.getChildNodes().get(0));
    jsunit.assertEquals(n2, d.getChildNodes().get(1));
  };

  t.testInsertBefore = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r2/></data>');
    var n1 = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "r1");
    var n2 = d.getChildNodes().get(0);
    d.insertBefore(n1, n2);

    jsunit.assertEquals(n1, d.getChildNodes().get(0));
    jsunit.assertEquals(n2, d.getChildNodes().get(1));
  };

  t.testReplaceNode = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r2/></data>');
    var n1 = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "r1");
    var n2 = d.getChildNodes().get(0);
    d.replaceNode(n1, n2);

    jsunit.assertEquals(n1, d.getChildNodes().get(0));
    jsunit.assertEquals(1, d.getChildNodes().size());
  };

  t.testRemoveChild = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/></data>');
    var n1 = d.getChildNodes().get(0);
    var n2 = d.getChildNodes().get(1);
    d.removeChild(n1);

    jsunit.assertEquals(n2, d.getChildNodes().get(0));
    jsunit.assertEquals(1, d.getChildNodes().size());
  };

  t.testRemoveChildren = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/></data>');
    d.removeChildren();
    jsunit.assertEquals(0, d.getChildNodes().size());
  };

  t.testGetAttribute = function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1" a2="v2"/>');
    jsunit.assertEquals("v1", d.getAttribute("a1"));
    jsunit.assertNull(d.getAttribute("n1"));

    d = new jsx3.xml.Document().loadXML('<foo:data xmlns:foo="http://foo.example.com" foo:a1="v1"/>');
    jsunit.assertNull(d.getAttribute("a1"));
    jsunit.assertEquals("v1", d.getAttribute("foo:a1"));
  };

  t.testSetAttribute = function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1" a2="v2"/>');
    jsunit.assertEquals("v1", d.getAttribute("a1"));
    d.setAttribute("a1", "v1d");
    jsunit.assertEquals("v1d", d.getAttribute("a1"));

    d.setAttribute("a1", null);
    jsunit.assertNull(d.getAttribute("a1"));
  };

  t.testGetAttributeNode = function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1" a2="v2"/>');
    var n = d.getAttributeNode("a1");

    jsunit.assertInstanceOf(n, jsx3.xml.Entity);
    jsunit.assertEquals(jsx3.xml.Entity.TYPEATTRIBUTE, n.getNodeType());
    jsunit.assertEquals("a1", n.getNodeName());
    jsunit.assertEquals("v1", n.getValue());

    jsunit.assertNullOrUndef(d.getAttributeNode("n1"));
  };

  t.testSetAttributeNode = function() {
    var d = new jsx3.xml.Document().loadXML('<data/>');
    var n = d.createNode(jsx3.xml.Entity.TYPEATTRIBUTE, "a1");
    n.setValue("v1");
    d.setAttributeNode(n);
    jsunit.assertEquals("v1", d.getAttribute("a1"));
  };

  t.testGetAttributes = function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1" a2="v2"/>');
    var a = d.getAttributes();
    jsunit.assertInstanceOf(a, jsx3.util.List);
    jsunit.assertEquals(2, a.size());
    jsunit.assertEquals("a1", a.get(0).getNodeName());
    jsunit.assertEquals("a2", a.get(1).getNodeName());
    jsunit.assertEquals(jsx3.xml.Entity.TYPEATTRIBUTE, a.get(0).getNodeType());
  };

  t.testGetAttributeNames = function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1" a2="v2"/>');
    var a = d.getAttributeNames();
    jsunit.assertEquals(2, a.length);
    jsunit.assertEquals("a1", a[0]);
    jsunit.assertEquals("a2", a[1]);
  };

  t.testRemoveAttribute = function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1"/>');
    jsunit.assertEquals("v1", d.getAttribute("a1"));

    d.removeAttribute("a1");
    jsunit.assertNull(d.getAttribute("a1"));
  };

  t.testRemoveAttributeNode = function() {
    var d = new jsx3.xml.Document().loadXML('<data a1="v1"/>');
    jsunit.assertEquals("v1", d.getAttribute("a1"));

    d.removeAttributeNode(d.getAttributeNode("a1"));
    jsunit.assertNull(d.getAttribute("a1"));
  };

  t.testGetParent = function() {
    var d = new jsx3.xml.Document().loadXML('<data><record/></data>');
    jsunit.assertNull(d.getParent());
    jsunit.assertEquals(d, d.getChildNodes().get(0).getParent());
  };

  t.testOwnerDocument = function() {
    var d = new jsx3.xml.Document().loadXML('<data><record/></data>');
    var n = d.getChildNodes().get(0);
    jsunit.assertEquals(d, d.getOwnerDocument());
    jsunit.assertEquals(d, n.getOwnerDocument());
  };

  t.testGetChildNodes = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
    var c = d.getChildNodes();
    jsunit.assertInstanceOf(c, jsx3.util.List);
    jsunit.assertEquals(3, c.size());
    jsunit.assertEquals("r1", c.get(0).getNodeName());
    jsunit.assertEquals("r2", c.get(1).getNodeName());
    jsunit.assertEquals("r3", c.get(2).getNodeName());
  };

  t.testGetChildNodesText = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/>   <r2/></data>');
    var c = d.getChildNodes();
    jsunit.assertEquals(2, c.size());
    jsunit.assertEquals("r2", c.get(1).getNodeName());

    d = new jsx3.xml.Document().loadXML('<data><r1/>   <r2/></data>');
    c = d.getChildNodes(true);
    jsunit.assertEquals(3, c.size());
    jsunit.assertEquals(jsx3.xml.Entity.TYPETEXT, c.get(1).getNodeType());
    jsunit.assertEquals("r2", c.get(2).getNodeName());
  };

  t.testChildIterator = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
    var i = d.getChildIterator();
    jsunit.assertTrue(i.hasNext());
    jsunit.assertEquals("r1", i.next().getNodeName());
    jsunit.assertTrue(i.hasNext());
    jsunit.assertEquals("r2", i.next().getNodeName());
    jsunit.assertTrue(i.hasNext());
    jsunit.assertEquals("r3", i.next().getNodeName());
    jsunit.assertFalse(i.hasNext());
  };

  t.testChildIteratorRomain = function() {
    var d = new jsx3.xml.Document().loadXML('<record jsxid="1" jsxtext="Service 1" serviceProvider="Svc Prov 1" identification="TO_FILL" status="INACTIVE" ad=" xcxcxc"><record jsxid="jsx_lf" interactID="1" jsxtext="Interact1" interactivity="Interact1"><record jsxid="jsx_lg" text="ddfd" url="fdff" advertising=" xcxcxc"/></record><record jsxid="jsx_lh" interactID="6" jsxtext="gg" interactivity="gg"/><record jsxid="jsx_li" constraintTypeID="4" jsxtext="contentType" constraintsType="contentType"><record jsxid="jsx_lj" constraintID="7" jsxtext="movies" value="movies"/><record jsxid="jsx_lk" constraintID="6" jsxtext="news" value="news"/><record jsxid="jsx_ll" constraintID="5" jsxtext="sport" value="sport"/></record><record jsxid="jsx_lm" constraintTypeID="3" jsxtext="Channel" constraintsType="Channel"><record jsxid="jsx_ln" constraintID="4" jsxtext="fr2" value="fr2"/><record jsxid="jsx_lo" constraintID="3" jsxtext="tf1" value="tf1"/></record></record>');
    var i = d.getChildIterator();
    jsunit.assertTrue(i.hasNext());
    jsunit.assertEquals("jsx_lf", i.next().getAttribute('jsxid'));
    jsunit.assertTrue(i.hasNext());
    jsunit.assertEquals("jsx_lh", i.next().getAttribute('jsxid'));
    jsunit.assertTrue(i.hasNext());
    jsunit.assertEquals("jsx_li", i.next().getAttribute('jsxid'));
    jsunit.assertTrue(i.hasNext());
    jsunit.assertEquals("jsx_lm", i.next().getAttribute('jsxid'));
    jsunit.assertFalse(i.hasNext());
  };
  
  t.testFirstChild = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
    jsunit.assertEquals("r1", d.getFirstChild().getNodeName());
    jsunit.assertNull(d.getFirstChild().getFirstChild());
  };

  t.testLastChild = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
    jsunit.assertEquals("r3", d.getLastChild().getNodeName());
    jsunit.assertNull(d.getLastChild().getLastChild());
  };

  t.testPreviousSibling = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
    var r1 = d.getChildNodes().get(0);
    var r2 = d.getChildNodes().get(1);
    jsunit.assertNull(r1.getPreviousSibling());
    jsunit.assertEquals(r1, r2.getPreviousSibling());
  };

  t.testNextSibling = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/><r2/><r3/></data>');
    var r2 = d.getChildNodes().get(1);
    var r3 = d.getChildNodes().get(2);
    jsunit.assertNull(r3.getNextSibling());
    jsunit.assertEquals(r3, r2.getNextSibling());
  };

  t.testEquals = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r1/></data>');
    jsunit.assertTrue(d.getFirstChild().equals(d.getChildNodes().get(0)));
    jsunit.assertFalse(d.getFirstChild().equals(null));
  };

  t.testSelectSingleNode = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r a="1"/><r a="2"/><r a="3"/></data>');
    var n = d.selectSingleNode("//r");
    jsunit.assertInstanceOf(n, jsx3.xml.Entity);
    jsunit.assertEquals("1", n.getAttribute("a")); // get first one
  };

  t.testSelectNodes = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r a="1"/><r a="2"/><r a="3"/></data>');
    var n = d.selectNodes("//r");
    jsunit.assertInstanceOf(n, jsx3.util.List);
    jsunit.assertEquals(3, n.size());
    jsunit.assertEquals("1", n.get(0).getAttribute("a"));
    jsunit.assertEquals("2", n.get(1).getAttribute("a"));
    jsunit.assertEquals("3", n.get(2).getAttribute("a"));
  };

  t.testSelectNamespace = function() {
    var d = new jsx3.xml.Document().loadXML('<data xmlns:ns="uri"><r a="1"/><ns:r a="2"/></data>');

    var n = d.selectSingleNode("//r");
    jsunit.assertNotNullOrUndef(n);
    jsunit.assertEquals("1", n.getAttribute("a"));

    n = d.selectSingleNode("//foo:r", 'xmlns:foo="uri"');
    jsunit.assertNotNullOrUndef(n);
    jsunit.assertEquals("2", n.getAttribute("a"));

    n = d.selectSingleNode("//r");
    jsunit.assertNotNullOrUndef(n);
    jsunit.assertEquals("1", n.getAttribute("a"));
  };

  t.testSelectNamespaceObject = function() {
    var d = new jsx3.xml.Document().loadXML('<data xmlns:ns="uri"><r a="1"/><ns:r a="2"/></data>');

    var n = d.selectSingleNode("//r");
    jsunit.assertNotNullOrUndef(n);
    jsunit.assertEquals("1", n.getAttribute("a"));

    n = d.selectSingleNode("//foo:r", {"uri":"foo"});
    jsunit.assertNotNullOrUndef(n);
    jsunit.assertEquals("2", n.getAttribute("a"));
  };

  t.testSelectNamespaceImplicit = function() {
    var d = new jsx3.xml.Document().loadXML('<data xmlns:ns="uri"><r a="1"/><ns:r a="2"/></data>');

    var n = d.selectSingleNode("//ns:r");
    jsunit.assertNotNullOrUndef(n);
    jsunit.assertEquals("2", n.getAttribute("a"));
  };

  t.testSelectNamespaceError = function() {
    var d = new jsx3.xml.Document().loadXML('<data xmlns:ns="uri"><r a="1"/><ns:r a="2"/></data>');

    var n = d.selectSingleNode("//foo:r");
    jsunit.assertNullOrUndef(n);
  };

  t.testSelectNodeIterator = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r a="1"/><r a="2"/><r a="3"/></data>');
    var i = d.selectNodeIterator("//r");
    jsunit.assertInstanceOf(i, jsx3.util.Iterator);
    jsunit.assertTrue(i.hasNext());
    jsunit.assertEquals("1", i.next().getAttribute("a"));
    jsunit.assertTrue(i.hasNext());
    jsunit.assertEquals("2", i.next().getAttribute("a"));
    jsunit.assertTrue(i.hasNext());
    jsunit.assertEquals("3", i.next().getAttribute("a"));
    jsunit.assertFalse(i.hasNext());
  };

  t.testSelectNodesContext = function() {
    var d = new jsx3.xml.Document().loadXML('<a><b><c/></b></a>');
    var b = d.getChildNodes().get(0);

    jsunit.assertNull(d.selectSingleNode("c"));
    jsunit.assertNotNullOrUndef(b.selectSingleNode("c"));

    jsunit.assertNotNullOrUndef(d.selectSingleNode("b"));
    jsunit.assertNull(b.selectSingleNode("b"));

    jsunit.assertNotNullOrUndef(d.selectSingleNode("/a"));
    jsunit.assertNotNullOrUndef(b.selectSingleNode("/a"));

    jsunit.assertNotNullOrUndef(d.selectSingleNode("//b"));
    jsunit.assertNotNullOrUndef(b.selectSingleNode("//b"));
  };

  t.testSelectIterator = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r a="1"/><r a="2"/><r a="3"/></data>');
    var n = d.selectNodes("//r");

    var i = n.iterator();
    jsunit.assertTrue(i.hasNext());
    i.next();
    jsunit.assertTrue(i.hasNext());
    i.next();
    jsunit.assertTrue(i.hasNext());
    i.next();
    jsunit.assertFalse(i.hasNext());
  };

  t.testTransformNode = function() {
    var d = new jsx3.xml.Document().loadXML('<data><r a="1"><r a="1a"/><r a="1b"/></r></data>');
    var n = d.getFirstChild();
    var xsl = new jsx3.xml.Document().loadXML(
        '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
        '<xsl:output method="xml" omit-xml-declaration="yes"/>' +
        '<xsl:template match="//r"><doc/></xsl:template>' +
        '</xsl:stylesheet>');
    var s = n.transformNode(xsl);
    jsunit.assertMatches(/^<doc\s*\/>$/, s);
  };

  t.testToString = function() {
    var d = new jsx3.xml.Document();
    var n = d.createDocumentElement("data");
    n.appendChild(d.createNode(jsx3.xml.Entity.TYPEELEMENT, "record"));
    n.appendChild(d.createNode(jsx3.xml.Entity.TYPETEXT, " -- a record "));
    jsunit.assertMatches(/^<data><record\s*\/> \-\- a record <\/data>$/, d.toString());
  };

  t.testToStringElement = function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var ne = d.createNode(jsx3.xml.Entity.TYPEELEMENT, "e");
    jsunit.assertMatches(/^<e\s*\/>$/, ne.toString());
  };

  t.testToStringAttribute = function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var na = d.createNode(jsx3.xml.Entity.TYPEATTRIBUTE, "a");
    na.setValue("v");
    jsunit.assertEquals('a="v"', na.toString());
  };

  t.testToStringText = function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nt = d.createNode(jsx3.xml.Entity.TYPETEXT, "text");
    jsunit.assertEquals("text", nt.toString());
  };

  t.testToStringCdata = function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nd = d.createNode(jsx3.xml.Entity.TYPECDATA, "cdata");
    jsunit.assertEquals("<![CDATA[cdata]]>", nd.toString());
  };

  t.testToStringComment = function() {
    var d = new jsx3.xml.Document().loadXML("<data/>");
    var nc = d.createNode(jsx3.xml.Entity.TYPECOMMENT, " comment ");
    jsunit.assertEquals("<!-- comment -->", nc.toString());
  };

  t.testSetValue = function() {
    //test entity
    var d = new jsx3.xml.Document().loadXML("<abc><a>b</a></abc>");
    d.setValue("b");
    jsunit.assertEquals("<abc>b</abc>",d.toString());

    // TODO: need to test attribute, cdata, comment and text types
  };

  // -1#INF ... 1-7XM18V
  t.testInfinity = function() {
    var x = new jsx3.xml.Document().loadXML("<r/>");
    x.setAttribute("v", Number.POSITIVE_INFINITY);

    var s = x.getAttribute("v");
    jsunit.assertEquals("Infinity", s);
    jsunit.assertTrue(! isFinite(eval(s)));
  };

  t.testInterDoc1 = function() {
    var d1 = new jsx3.xml.Document().loadXML("<data><a/></data>");
    var d2 = new jsx3.xml.Document().loadXML("<data></data>");

    jsunit.assertEquals(1, d1.getChildNodes().size());
    jsunit.assertEquals(0, d2.getChildNodes().size());

    d2.appendChild(d1.getChildNodes().get(0));

    jsunit.assertEquals(0, d1.getChildNodes().size());
    jsunit.assertEquals(1, d2.getChildNodes().size());
  };

  t.testInterDoc2 = function() {
    var d1 = new jsx3.xml.Document().loadXML("<data><a/></data>");
    var d2 = new jsx3.xml.Document().loadXML("<data></data>");

    d2.appendChild(d1.getChildNodes().get(0).cloneNode(true));

    jsunit.assertEquals(1, d1.getChildNodes().size());
    jsunit.assertEquals(1, d2.getChildNodes().size());
  };

  t.testInterDoc3 = function() {
    var d1 = new jsx3.xml.Document().loadXML("<data><a/></data>");
    var d2 = new jsx3.xml.Document().loadXML("<data><b/></data>");

    jsunit.assertEquals(1, d1.getChildNodes().size());
    jsunit.assertEquals(1, d2.getChildNodes().size());

    d2.insertBefore(d1.getChildNodes().get(0), d2.getChildNodes().get(0));

    jsunit.assertEquals(0, d1.getChildNodes().size());
    jsunit.assertEquals(2, d2.getChildNodes().size());
    jsunit.assertEquals("a", d2.getChildNodes().get(0).getNodeName());
    jsunit.assertEquals("b", d2.getChildNodes().get(1).getNodeName());
  };

  t.testInterDoc4 = function() {
    var d1 = new jsx3.xml.Document().loadXML("<data><a/></data>");
    var d2 = new jsx3.xml.Document().loadXML("<data><b/></data>");

    d2.replaceNode(d1.getChildNodes().get(0), d2.getChildNodes().get(0));

    jsunit.assertEquals(0, d1.getChildNodes().size());
    jsunit.assertEquals(1, d2.getChildNodes().size());
    jsunit.assertEquals("a", d2.getChildNodes().get(0).getNodeName());
  };

  t.testInterDoc5 = function() {
    var d1 = new jsx3.xml.Document().loadXML('<data a="v"/>');
    var d2 = new jsx3.xml.Document().loadXML("<data/>");

    jsunit.assertEquals("Attribute should be set from load.", "v", d1.getAttribute("a"));
    jsunit.assertNullOrUndef(d2.getAttribute("a"));

    var attr = d1.getAttributeNode("a");
    d1.removeAttributeNode(attr);
    d2.setAttributeNode(attr);

    jsunit.assertNullOrUndef(d1.getAttribute("a"));
    jsunit.assertEquals("Attribute should be set after setAttributeNode() " + d2, "v", d2.getAttribute("a"));
  };

  t.testInterDoc6 = function() {
    var d1 = new jsx3.xml.Document().loadXML('<data><record/></data>');
    var d2 = new jsx3.xml.Document().loadXML("<data/>");

    var n = d1.getChildNodes().get(0);
    d2.appendChild(n);

    n.setAttribute("a", "v");
    n.appendChild(n.createNode(1, "record"));

    n = d2.getChildNodes().get(0);
    jsunit.assertEquals("v", n.getAttribute("a"));
    jsunit.assertNotNullOrUndef(n.getChildNodes().get(0));
    jsunit.assertEquals("record", n.getChildNodes().get(0).getNodeName());
  };

  t.testInterDoc7 = function() {
    var d1 = new jsx3.xml.Document().loadXML('<data/>');
    var d2 = new jsx3.xml.Document().loadXML('<data><r1/></data>');
    d1.appendChild(d2.selectSingleNode("//r1"));

    //make sure append happened as well as the delete from source
    jsunit.assertNotNull(d1.selectSingleNode("//r1"));
    jsunit.assertNull(d2.selectSingleNode("//r1"));
  };

  // SEE: http://www.generalinterface.org/bugs/browse/GI-536
  t.testEmptyNamespace = function() {
    var d, l;

    d = (new jsx3.xml.Document()).loadXML("<data/>");
    d.getRootNode().appendChild(d.createNode(jsx3.xml.Entity.TYPEELEMENT, 'record', ''));
    l = d.selectNodes("//record");
    jsunit.assertEquals("Empty string without root NS failed", 1, l.size());

    d = (new jsx3.xml.Document()).loadXML('<data xmlns="http://www.tibco.com"/>');
    d.getRootNode().appendChild(d.createNode(jsx3.xml.Entity.TYPEELEMENT, 'record', ''));
    l = d.selectNodes("//record");
    jsunit.assertEquals("Empty string with root NS failed", 1, l.size());

    d = (new jsx3.xml.Document()).loadXML("<data/>");
    d.getRootNode().appendChild(d.createNode(jsx3.xml.Entity.TYPEELEMENT, 'record'));
    l = d.selectNodes("//record");
    jsunit.assertEquals("Undefined without root NS failed", 1, l.size());

    d = (new jsx3.xml.Document()).loadXML('<data xmlns="http://www.tibco.com"/>');
    d.getRootNode().appendChild(d.createNode(jsx3.xml.Entity.TYPEELEMENT, 'record'));
    l = d.selectNodes("//record");
    jsunit.assertEquals("Undefined with root NS failed", 1, l.size());
    l = d.selectNodes("//tb:record", {"http://www.tibco.com":"tb"});
    jsunit.assertEquals("Undefined with root NS failed selection with namespace", 0, l.size());
  };
  
});
