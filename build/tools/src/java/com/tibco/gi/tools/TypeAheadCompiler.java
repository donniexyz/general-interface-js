/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;
import java.util.logging.Level;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMResult;
import javax.xml.transform.dom.DOMSource;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

/**
 * Compiles any number of GI API documentation XML source files into a CDF file used in the IDE for JavaScript
 * type-ahead. The output file is a valid CDF document that can be used as the data source for a variety of GUI
 * controls. In particular, the IDE uses it as the data source to a menu, which is invoked by typing ctrl+space in a
 * JavaScript editor.
 *
 * @author Jesse Costello-Good
 */
public class TypeAheadCompiler {

  private static final Logger LOG = Logger.getLogger(TypeAheadCompiler.class.getName());

  private static final String XSL = "com/tibco/gi/tools/doc/typeahead.xsl";

  private File outFile;
  private Set<File> srcFiles = new HashSet<File>();
  private DocumentBuilder parser;
  private Transformer transformer;
  private boolean strict = false;

  /**
   * Runs the compilation.
   *
   * @throws Exception
   */
  public void run() throws IOException {
    if (outFile == null) throw new NullPointerException("Output file must be specified.");
    if (srcFiles.size() == 0) throw new IllegalStateException("Must specify at least one source file.");

    initXML();

    // Set up an empty CDF document.
    Document doc = parser.newDocument();
    Element root = (Element) doc.appendChild(doc.createElement("data"));
    root.setAttribute("jsxid", "jsxroot");
    root.setAttribute("jsxassignids", "1");

    // Load every source file.
    Collection<Document> documents = new ArrayList<Document>();
    for (File srcFile : Utils.getSortedCopy(srcFiles)) {
      try {
        documents.add(parser.parse(srcFile));
      } catch (SAXException e) {
        log(Level.SEVERE, "Error loading " + srcFile + ": " + e);
      } catch (IOException e) {
        log(Level.SEVERE, "Error loading " + srcFile + ": " + e);
      }
    }

    // Keep track of each CDF record associated with a particular JS package.
    Map<String, Element> packageMap = new HashMap<String, Element>();

    // First, do all packages.
    for (Document document : documents) {
      if ("package".equals(document.getDocumentElement().getNodeName())) {
        Element pkgNode = transformClassDoc(document);
        pkgNode = (Element) doc.importNode(pkgNode, true);
        root.appendChild(pkgNode);
        packageMap.put(pkgNode.getAttribute("jsxtext"), pkgNode);
      }
    }

    // Then, do all classes and interfaces.
    for (Document document : documents) {
      Element docElement = document.getDocumentElement();
      if (!"package".equals(docElement.getNodeName())) {
        Element classNode = transformClassDoc(document);
        if (classNode == null) continue;

        // Put global members into the "window" package.
        String packageName = docElement.getAttribute("package");
        if (packageName == null || packageName.length() == 0)
          packageName = "window";

        classNode = (Element) doc.importNode(classNode, true);
        Element pkgNode = packageMap.get(packageName);

        // We may have to create a CDF record for the package if the package was not documented.
        if (pkgNode == null) {
          pkgNode = doc.createElement("record");
          pkgNode.setAttribute("jsxtext", packageName);
          root.appendChild(pkgNode);
          packageMap.put(packageName, pkgNode);
        }

        pkgNode.appendChild(classNode);
      }
    }

    // Write the output file.
    Utils.serializeDocument(doc, outFile);
  }

  /**
   * This tool uses an XSLT template to do most of the work. This method loads the template.
   */
  private void initXML() throws IOException {
    try {
      if (parser != null) return;

      DocumentBuilderFactory dFactory = DocumentBuilderFactory.newInstance();
      dFactory.setNamespaceAware(true);
      parser = dFactory.newDocumentBuilder();

      InputStream xslInput = TypeAheadCompiler.class.getClassLoader().getResourceAsStream(XSL);
      Document xslDoc = parser.parse(xslInput);

      DOMSource xslDomSource = new DOMSource(xslDoc);
      xslDomSource.setSystemId(XSL);

      TransformerFactory tFactory = TransformerFactory.newInstance();
      transformer = tFactory.newTransformer(xslDomSource);
    } catch (ParserConfigurationException e) {
      throw new Error(e);
    } catch (SAXException e) {
      throw new IOException("Error parsing XSL template: " + e);
    } catch (TransformerConfigurationException e) {
      throw new Error(e);
    }
  }

  private Element transformClassDoc(Document document) {
    DOMSource xmlDomSource = new DOMSource(document);
    DOMResult domResult = new DOMResult();

    try {
      transformer.transform(xmlDomSource, domResult);
    } catch (TransformerException e) {
      throw new RuntimeException(e);
    }

    return ((Document) domResult.getNode()).getDocumentElement();
  }

  private void log(Level level, String msg) {
    if (strict)
      throw new RuntimeException(msg);
    LOG.log(level, msg);
  }

  /**
   * Sets the output file.
   *
   * @param outFile
   */
  public void setOutFile(File outFile) {
    this.outFile = outFile;
  }

  /**
   * Adds a source file to this compilation. The source file should be a valid XML file in the GI API documentation
   * schema. The {@link DocCompiler} tool generates files of this type.
   *
   * @param srcFile
   */
  public void addSrcFile(File srcFile) {
    this.srcFiles.add(srcFile);
  }

  /**
   * Sets whether to throw exceptions rather than log warning.
   * @param strict
   */
  public void setStrict(boolean strict) {
    this.strict = strict;
  }

}
