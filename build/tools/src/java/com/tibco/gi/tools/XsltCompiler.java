/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools;

import org.apache.xml.serializer.Serializer;
import org.apache.xml.serializer.SerializerFactory;
import org.jaxen.JaxenException;
import org.jaxen.NamespaceContext;
import org.jaxen.dom.DOMXPath;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Properties;
import java.util.logging.Logger;

/**
 * Compiles an XSLT file into an optimized form. The following operations are performed: <ul> <li>Any
 * <code>&lt;xsl:import&gt;</code> elements are resolved and the contents of any <code>&lt;xsl:param&gt;</code> or
 * <code>&lt;xsl:template&gt;</code> elements are copied into the source document. This is advantageous because the XSL
 * engines of some browsers do not consult the browser cache when retrieving documents referenced by
 * <code>&lt;xsl:import&gt;</code> elements.</li> </ul>
 *
 * @author Jesse Costello-Good
 */
public class XsltCompiler {

  private static final Logger LOG = Logger.getLogger(XsltCompiler.class.getName());

  private File inFile;
  private File outFile;

  /**
   * Creates a new instance of this class. The output is written to the input file.
   *
   * @param inFile the input and output XSLT file.
   */
  public XsltCompiler(File inFile) {
    this(inFile, inFile);
  }

  /**
   * Creates a new instance of this class.
   *
   * @param inFile the input XSLT file.
   * @param outFile the output XSLT file.
   */
  public XsltCompiler(File inFile, File outFile) {
    this.inFile = inFile;
    this.outFile = outFile;
  }

  /**
   * Compiles the input file and writes it to the output file. If the input file equals the output file and no changes
   * are made by the compilation, no action is taken.
   *
   * @throws Exception
   */
  public void run() throws IOException {
    if (inFile == null) throw new NullPointerException("Input file must be specified.");
    if (outFile == null) throw new NullPointerException("Output file must be specified.");

    try {
      DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
      factory.setNamespaceAware(true);
      factory.setIgnoringComments(false);
      DocumentBuilder parser = factory.newDocumentBuilder();
      Document xslDoc = null;
      try {
        xslDoc = parser.parse(inFile);
      } catch (SAXException e) {
        throw new IOException("Error parsing input file: " + e);
      }
      boolean changed = false;

      Element xslRoot = xslDoc.getDocumentElement();
      Node insertParent = xslDoc.getDocumentElement();
      Element insertPoint = (Element) makeXPath("/xsl:stylesheet/xsl:template").selectSingleNode(xslDoc);

      // Find all <xsl:import> elements.
      List<Element> includes = makeXPath("/xsl:stylesheet/xsl:import").selectNodes(xslDoc);

      for (Element include : includes) {
        // Resolve the imported template.
        String path = include.getAttribute("href");
        URI includeURI = inFile.toURI().resolve(path);

        // Parse the imported template.
        Document includeDoc = null;
        try {
          includeDoc = parser.parse(includeURI.toURL().openStream());
        } catch (SAXException e) {
          throw new IOException("Error parsing include " + includeURI + ": " + e);
        }

        // 0. Add any missing namespace declarations.
        NamedNodeMap attrs = includeDoc.getDocumentElement().getAttributes();
        for (int i = 0; i < attrs.getLength(); i++) {
          Node attr = attrs.item(i);
          if ("xmlns".equals(attr.getPrefix())) {
            if (xslRoot.getAttributeNode(attr.getNodeName()) == null)
              xslRoot.setAttributeNodeNS((Attr) xslDoc.importNode(attr, true));
          }
        }

        // 1. Copy any <xsl:param> elements that do not already exist in the source document.
        List<Element> params = makeXPath("/xsl:stylesheet/xsl:param").selectNodes(includeDoc);
        Element paramInsertPoint = (Element) makeXPath("/xsl:stylesheet/xsl:template").selectSingleNode(xslDoc);
        for (Element param : params) {
          String paramId = param.getAttribute("name");
          if (makeXPath("/xsl:stylesheet/xsl:param[@name='" + paramId + "']").selectSingleNode(xslDoc) == null)
            insertParent.insertBefore(xslDoc.importNode(param, true), paramInsertPoint);
        }

        // 2. Copy any <xsl:template> elements.
        List<Element> templates = makeXPath("/xsl:stylesheet/xsl:template").selectNodes(includeDoc);

        // Insert a comment before the template inserts marking the merge point.
        insertXmlLine(insertParent, insertPoint);
        insertParent.insertBefore(xslDoc.createComment(" Begin merge from " + path + " "), insertPoint);
        insertXmlLine(insertParent, insertPoint);

        for (Element template : templates) {
          Element clone = (Element) xslDoc.importNode(template, true);
          insertParent.insertBefore(clone, insertPoint);
          insertXmlLine(insertParent, insertPoint);
        }

        // Insert a comment after the template inserts marking the end of the merge point.
        insertParent.insertBefore(xslDoc.createComment(" End merge from " + path + " "), insertPoint);
        insertXmlLine(insertParent, insertPoint);

        // Remove the original <xsl:import> node.
        include.getParentNode().removeChild(include);
        changed = true;
      }

      // Write the output but only if the contents have changed or if an output file must be written.
      if (changed || !inFile.equals(outFile)) {
        Utils.serializeDocument(xslDoc, outFile);
      }
    } catch (ParserConfigurationException e) {
      throw new Error(e);
    } catch (JaxenException e) {
      throw new RuntimeException(e);
    }
  }

  private void insertXmlLine(Node parent, Node insertPoint) {
    parent.insertBefore(parent.getOwnerDocument().createTextNode("\n"), insertPoint);
  }

  private DOMXPath makeXPath(String query) throws JaxenException {
    DOMXPath xpath = new DOMXPath(query);
    xpath.setNamespaceContext(new NamespaceContext() {
      public String translateNamespacePrefixToUri(String s) {
        if ("xsl".equals(s)) return "http://www.w3.org/1999/XSL/Transform";
        throw new IllegalArgumentException();
      }
    });
    return xpath;
  }

}
