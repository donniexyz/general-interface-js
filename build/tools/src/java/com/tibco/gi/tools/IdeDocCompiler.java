/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools;

import java.io.File;
import java.io.FileFilter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Result;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import net.sf.saxon.TransformerFactoryImpl;
import org.jaxen.JaxenException;
import org.jaxen.dom.DOMXPath;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

/**
 * Compiles IDE metadata into HTML documentation. Specifically, this tool creates documentation for
 * GUI properties, GUI (model) events, and XSL parameters.
 * 
 * @author Jesse Costello-Good
 */
public class IdeDocCompiler {

  private static final Logger LOG = Logger.getLogger(IdeDocCompiler.class.getName());

  public static enum Type {PROPS, EVENTS, XSLPARAMS}

  private static final String PROPS_XSL = "idedoc_props.xsl";
  private static final String EVENTS_XSL = "idedoc_events.xsl";
  private static final String XSLPARAMS_XSL = "idedoc_xslparams.xsl";
  private static final String STYLES = "styles.css";
  private static final String INDEX = "index.html";
  private static final String INDEX_XSL = "index.xsl";
  private static final String CLASS_INDEX = "allclasses-frame.html";
  private static final String CLASS_INDEX_XSL = "allclasses-frame.xsl";

  private File destDir;
  private File catalogFile;
  private URI apiDocPath;
  private Type type = Type.PROPS;
  private URI basePath;
  private File docDir;
  private boolean strict = false;

  private final DocumentBuilder parser;
  private TransformerFactory factory;

  public IdeDocCompiler() {
    try {
      DocumentBuilderFactory dFactory = DocumentBuilderFactory.newInstance();
      dFactory.setNamespaceAware(true);
      parser = dFactory.newDocumentBuilder();

      factory = new TransformerFactoryImpl();
      factory.setAttribute("http://saxon.sf.net/feature/strip-whitespace", "none");
    } catch (ParserConfigurationException e) {
      throw new Error(e);
    }
  }

  public void run() throws IOException {
    if (destDir == null) throw new NullPointerException("Destination directory must be specified.");
    if (catalogFile == null) throw new IllegalStateException("The catalog file must be specified.");
    if (!catalogFile.isFile()) throw new IOException("The catalog file " + catalogFile + " does not exist.");
    if (basePath == null)
      basePath = catalogFile.getParentFile().toURI();
    if (docDir == null) throw new NullPointerException("Documentation directory must be specified.");
    if (!docDir.isDirectory()) throw new IOException("Documentation directory " + docDir + " does not exist.");

    destDir.mkdirs();

    Document catalogXML;
    try {
      catalogXML = parser.parse(catalogFile);
    } catch (SAXException e) {
      throw new IOException("Error parsing input file: " + e);
    }

    try {
      List<Element> recordNodes = new DOMXPath("//record").selectNodes(catalogXML);
      for (Element record : recordNodes) {
        String className = record.getAttribute("jsxid");
        String path = record.getAttribute("jsxtext");

        if (path == null || path.length() == 0)
          continue;

        URI inputURI = basePath.resolve(path);

        switch (type) {
          case PROPS:
            processPropsFile(className, inputURI);
            break;
          case EVENTS:
            processEventsFile(className, inputURI);
            break;
          case XSLPARAMS:
            processXslParamsFile(className, inputURI);
            break;
        }
      }
    } catch (JaxenException e) {
      throw new RuntimeException(e);
    }

    makeClassIndex();

    Utils.copyFile(new File(docDir, STYLES), new File(destDir, STYLES));

    makeIndexPage();
  }

  private void makeIndexPage() throws IOException {
    Transformer transformer = getTransformer(new File(docDir, INDEX_XSL));

    String title;
    switch (type) {
      case PROPS:
        title = "GUI Properties";
        break;
      case EVENTS:
        title = "GUI Events";
        break;
      default:
        title = "XSL Parameters";
    }

    transformer.setParameter("title", title);

    transformFile(parser.newDocument(), new File(destDir, INDEX), transformer);
  }

  private void makeClassIndex() throws IOException {
    final URI destURI = destDir.toURI();

    Collection<File> files = Utils.findAllRecursive(destDir, new FileFilter() {
      public boolean accept(File file) {
        return file.getName().endsWith(".html") && !INDEX.equals(file.getName()) && !CLASS_INDEX.equals(file.getName());
      }
    });

    Document doc = parser.newDocument();
    Element data = (Element) doc.appendChild(doc.createElement("data"));

    // Order of findAllRecursive can depend on the platform. Sort the files in case. 
    List<File> sortedFiles = new ArrayList<File>(files);
    Collections.sort(sortedFiles, new Comparator<File>() {
      public int compare(File f1, File f2) {
        return getClassNameForFile(destURI, f1).compareTo(getClassNameForFile(destURI, f2));
      }
    });

    for (File file : sortedFiles) {
      Element record = (Element) data.appendChild(doc.createElement("record"));

      String className = getClassNameForFile(destURI, file);
      String packageName = getNamePrefix(className);
      String shortName = getShortName(className);

      record.setAttribute("path", packageName.replaceAll("\\.", "/") + "/" + shortName + ".html");
      record.setAttribute("jsxid", className);
      record.setAttribute("package", packageName);
      record.setAttribute("class", shortName);
    }

    Transformer transformer = getTransformer(new File(docDir, CLASS_INDEX_XSL));
    transformFile(doc, new File(destDir, CLASS_INDEX), transformer);
  }

  private static String getClassNameForFile(URI destURI, File file) {
    String path = Utils.relativizeURI(destURI, file.toURI()).toString();
    return path.substring(0, path.length() - 5).replaceAll("/", ".");
  }

  private static String getShortName(String name) {
    int length = getNamePrefix(name).length();
    return name.substring(length == 0 ? 0 : length + 1);
  }

  public static String getNamePrefix(String name) {
    Pattern p = Pattern.compile("^([a-z0-9]+(\\.[a-z0-9]+)*)\\.");
    Matcher m = p.matcher(name);
    if (m.find()) {
      return m.group(1);
    } else {
      return "";
    }
  }

  private void processPropsFile(String className, URI path) throws IOException {
    Document srcDoc;
    DOMXPath query;

    try {
      srcDoc = parser.parse(new File(path));
    } catch (SAXException e) {
      throw new IOException("Error parsing " + path + ": " + e);
    }

    try {
      query = new DOMXPath("//record[@include]");

      List<Element> includes = query.selectNodes(srcDoc);
      while (includes.size() > 0) {
        for (Element include : includes) {
          Node parentNode = include.getParentNode();

          String includePath = include.getAttribute("include");
          String group = include.getAttribute("group");
          boolean children = "1".equals(include.getAttribute("children"));
          String select = include.getAttribute("path");

          Node anElm = include;
          String _uri = "";
          while (anElm instanceof Element && _uri.length() == 0) {
            _uri = ((Element) anElm).getAttribute("_uri");
            anElm = anElm.getParentNode();
          }
          URI resolveAgainst = _uri.length() > 0 ? new URI(_uri) : path;

          URI includeURI = resolveAgainst.resolve(includePath);
          Document includeDoc = parser.parse(new File(includeURI));
          
          if (group != null && !"".equals(group)) {
            DOMXPath groupQuery = new DOMXPath("//record[@jsxid='" + group + "']" + (children ? "/record" : ""));

            List<Element> replaceWith = groupQuery.selectNodes(includeDoc);
            if (replaceWith.size() > 0) {
              for (Element e : replaceWith) {
                if (e instanceof Element) {
                   e.setAttribute("_uri", includeURI.toString());
                  parentNode.insertBefore(include.getOwnerDocument().importNode(e, true), include);
                }
              }
            } else {
              log(Level.WARNING, "Group query " + groupQuery + " yeilded no result in file " + path.resolve(includePath) + " (" + resolveAgainst + ")");
            }
          } else if (select != null && !"".equals(select)) {
            DOMXPath selectQuery = new DOMXPath(select);
            List<Element> replaceWith = selectQuery.selectNodes(includeDoc);
            if (replaceWith.size() > 0) {
              for (Element e : replaceWith) {
                if (e instanceof Element) {
                  e.setAttribute("_uri", includeURI.toString());
                  parentNode.insertBefore(include.getOwnerDocument().importNode(e, true), include);
                }
              }
            } else {
              log(Level.WARNING, "Select query " + selectQuery + " yeilded no result in file " + path.resolve(includePath) + " (" + resolveAgainst + ")");
            }
          } else {
            log(Level.WARNING, "Include " + include + " does not specify group or select attributes.");
          }

          parentNode.removeChild(include);
        }

        includes = query.selectNodes(srcDoc);
      }

      Transformer transformer = getTransformer(new File(docDir, PROPS_XSL));
      URI outURI = classNameToURI(className);

      transformer.setParameter("apidocpath", Utils.relativizeURI(outURI, apiDocPath));
      transformer.setParameter("classname", className);
      transformer.setParameter("packagename", getNamePrefix(className));

      transformFile(srcDoc, new File(outURI), transformer);

    } catch (JaxenException e) {
      throw new RuntimeException(e);
    } catch (SAXException e) {
      throw new IOException("Error parsing document: " + e);
    } catch (URISyntaxException e) {
      throw new RuntimeException(e);
    }
  }

  private void processEventsFile(String className, URI path) throws IOException {
    Transformer transformer = getTransformer(new File(docDir, EVENTS_XSL));
    URI outURI = classNameToURI(className);

    transformer.setParameter("apidocpath", Utils.relativizeURI(outURI, apiDocPath));
    transformer.setParameter("classname", className);
    transformer.setParameter("packagename", getNamePrefix(className));

    transformFile(new File(path), new File(outURI), transformer);
  }

  private void processXslParamsFile(String className, URI path) throws IOException {
    Transformer transformer = getTransformer(new File(docDir, XSLPARAMS_XSL));
    URI outURI = classNameToURI(className);

    transformer.setParameter("apidocpath", Utils.relativizeURI(outURI, apiDocPath));
    transformer.setParameter("classname", className);
    transformer.setParameter("packagename", getNamePrefix(className));

    transformFile(new File(path), new File(outURI), transformer);
  }

  private void transformFile(File src, File dest, Transformer transformer) throws IOException {
    try {
      transformFile(parser.parse(src), dest, transformer);
    } catch (SAXException e) {
      throw new IOException("Error parsing " + src + ": " + e);
    }
  }

  private void transformFile(Document src, File dest, Transformer transformer) throws IOException {
    DOMSource xmlDomSource = new DOMSource(src);

    dest.getParentFile().mkdirs();
    FileOutputStream outputStream = new FileOutputStream(dest);
    Result result = new StreamResult(outputStream);

    try {
      transformer.transform(xmlDomSource, result);
    } catch (TransformerException e) {
      throw new RuntimeException(e);
    }

    outputStream.close();
  }

  private Transformer getTransformer(File file) throws IOException {
    try {
      return getTransformer(parser.parse(file), file.toURL().toString());
    } catch (TransformerConfigurationException e) {
      throw new Error(e);
    } catch (SAXException e) {
      throw new IOException("Error parsing " + file + ": " + e);
    }
  }

  private Transformer getTransformer(URL file) throws IOException {
    try {
      return getTransformer(parser.parse(file.openStream()), file.toString());
    } catch (TransformerConfigurationException e) {
      throw new Error(e);
    } catch (SAXException e) {
      throw new IOException("Error parsing " + file + ": " + e);
    }
  }

  private Transformer getTransformer(Document doc, String id) throws IOException, TransformerConfigurationException {
    DOMSource xslDomSource = new DOMSource(doc);
    xslDomSource.setSystemId(id);
    return factory.newTransformer(xslDomSource);
  }

  private URI classNameToURI(String className) {
    String pkg = getNamePrefix(className);
    String cls = getShortName(className);
    return destDir.toURI().resolve(pkg.replaceAll("\\.", "/") + "/" + cls + ".html");
  }

  private void log(Level level, String msg) {
    if (strict)
      throw new RuntimeException(msg);
    LOG.log(level, msg);
  }

  public void setDestDir(File destDir) {
    this.destDir = destDir;
  }

  public void setCatalogFile(File catalogFile) {
    this.catalogFile = catalogFile;
  }

  public void setBasePath(URI basePath) {
    this.basePath = basePath;
  }

  public void setApiDocPath(URI apiDocPath) {
    this.apiDocPath = apiDocPath;
  }

  public void setType(Type type) {
    this.type = type;
  }

  public void setDocDir(File docDir) {
    this.docDir = docDir;
  }

  /**
   * Sets whether to throw exceptions rather than log warning.
   * @param strict
   */
  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}
