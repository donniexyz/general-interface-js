/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools;

import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
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
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Result;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.URIResolver;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import net.sf.saxon.TransformerFactoryImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

/**
 * Compiles XML documentation files created with the {@link DocCompiler} into javadoc-like HTML documentation files.
 * <p/>
 * One of the inputs to this tool is the <code>docDir</code>, which is a directory containing the following files:
 * <ul>
 *   <li>index.html &ndash; the HTML documentation index frameset</li>
 *   <li>styles.css &ndash; the CSS styles for the documentation</li>
 *   <li>styles-print.css &ndash; the CSS styles for the documentation when printed</li>
 *   <li>allclasses-frame.xsl &ndash; transforms index.xml into the HTML frame that shows all classes</li>
 *   <li>class-summary.xsl &ndash; transforms each class XML file into the class summary HTML file</li>
 *   <li>deprecated.xsl &ndash; transforms a concatenation of all class XML files into the deprecated HTML file</li>
 *   <li>overview-frame.xsl &ndash; transforms index.xml into the HTML frame showing all packages</li>
 *   <li>overview-summary.xsl &ndash; transforms index.xml into the default main content frame</li>
 *   <li>package-frame.xsl &ndash; transforms each package-summary.xml into the frame showing the classes in that package</li>
 *   <li>package-summary.xsl &ndash; transforms each package-summary.xml into the package summary HTML file</li>
 *   <li>single.xsl &ndash; transforms a concatenation of all class XML files into the single HTML file</li>
 * </ul>
 * If the <code>docDir</code> is not specified then these resources are retrieved from the jsx-tools.jar.
 *
 * @author Jesse Costello-Good
 */
public class HtmlDocCompiler {

  private static final Logger LOG = Logger.getLogger(HtmlDocCompiler.class.getName());

  private final static String ALL_CLASSES_FRAME = "allclasses-frame.xsl";
  private final static String CLASS_SUMMARY = "class-summary.xsl";
  private final static String DEPRECATED = "deprecated.xsl";
  private final static String INDEX = "index.xsl";
  private final static String OVERVIEW_FRAME = "overview-frame.xsl";
  private final static String OVERVIEW_SUMMARY = "overview-summary.xsl";
  private final static String PACKAGE_FRAME = "package-frame.xsl";
  private final static String PACKAGE_SUMMARY = "package-summary.xsl";
  private final static String SINGLE = "single.xsl";
  private final static String STYLES_PRINT = "styles-print.css";
  private final static String STYLES = "styles.css";

  private File docDir;
  private File srcDir;
  private File destDir;
  private String title;
  private String copyright;
  private boolean strict = false;

  private DocumentBuilder parser;
  private TransformerFactory factory;

  private static class Resource {
    public final InputStream stream;
    public final URL url;

    private Resource(InputStream stream, URL url) {
      this.stream = stream;
      this.url = url;
    }
  }

  /**
   * Runs the compilation.
   */
  public void run() throws IOException, TransformerConfigurationException, SAXException {
    if (docDir != null && !docDir.isDirectory())
      throw new IOException("Documentation directory " + docDir + " does not exist.");
    if (srcDir == null) throw new NullPointerException("Source directory must be specified.");
    if (!srcDir.isDirectory()) throw new IOException("Source directory " + srcDir + " does not exist.");
    if (destDir == null) throw new NullPointerException("Destination directory must be specified.");

    if (!destDir.isDirectory() && !destDir.mkdirs())
      throw new IOException("Could not create destination directory " + destDir);

    this.initXML();

    String[] toCopy = new String[]{STYLES, STYLES_PRINT};
    for (String s : toCopy) {
      Resource sourceFile = null;
      try {
        sourceFile = getDocResource(s);
      } catch (IOException e) {
        throw new RuntimeException("File " + sourceFile + " does not exist.", e);
      }

      File destFile = new File(destDir, s);

      Utils.copyFile(sourceFile.stream, destFile);
    }

    transformFile("index.xml", "index.html", getDocResource(INDEX));
    transformFile("index.xml", "overview-frame.html", getDocResource(OVERVIEW_FRAME));
    transformFile("index.xml", "allclasses-frame.html", getDocResource(ALL_CLASSES_FRAME));
    transformFile("index.xml", "overview-summary.html", getDocResource(OVERVIEW_SUMMARY));

    Transformer pkgTrans = getTransformer(getDocResource(PACKAGE_FRAME));
    Collection<File> pkgSum = Utils.findAllRecursive(srcDir, new FileFilter() {
      public boolean accept(File file) {
        return "package-summary.xml".equals(file.getName());
      }
    });
    for (File file : pkgSum) {
      String path = file.getAbsolutePath().substring(srcDir.getAbsolutePath().length());
      path = path.substring(0, path.length() - "package-summary.xml".length()) + "package-frame.html";
      File dest = new File(destDir, path);
      transformFile(file, dest, pkgTrans);
    }

    Transformer pkgSumTrans = getTransformer(getDocResource(PACKAGE_SUMMARY));
    for (File file : pkgSum) {
      String path = file.getAbsolutePath().substring(srcDir.getAbsolutePath().length());
      path = path.substring(0, path.length() - "package-summary.xml".length()) + "package-summary.html";
      File dest = new File(destDir, path);
      transformFile(file, dest, pkgSumTrans);
    }

    Transformer classTrans = getTransformer(getDocResource(CLASS_SUMMARY));
    Collection<File> classSum = Utils.findAllRecursive(srcDir, new FileFilter() {
      public boolean accept(File file) {
        return file.getName().endsWith(".xml") &&
            !"package-summary.xml".equals(file.getName()) &&
            !"index.xml".equals(file.getName());
      }
    });

    for (File file : classSum) {
      String path = file.getAbsolutePath().substring(srcDir.getAbsolutePath().length());
      path = path.substring(0, path.length() - ".xml".length()) + ".html";
      File dest = new File(destDir, path);
      transformFile(file, dest, classTrans);
    }

    // create the document which is a merge of all source files
    Document doc = parser.newDocument();
    Element api = doc.createElement("api");
    doc.appendChild(api);
    Collection<File> allFiles = Utils.findAllRecursive(srcDir, new FileFilter() {
      public boolean accept(File file) {
        return file.getName().endsWith(".xml");
      }
    });
    // Order of findAllRecursive can depend on the platform. Sort the files in case.
    List<File> allFilesSorted = new ArrayList<File>(allFiles);
    Collections.sort(allFilesSorted, new Comparator<File>() {
      public int compare(File f1, File f2) {
        return f1.getAbsolutePath().compareTo(f2.getAbsolutePath());
      }
    });
    for (File file : allFilesSorted) {
      Document srcDoc = parser.parse(file);
      api.appendChild(doc.importNode(srcDoc.getDocumentElement(), true));
    }

    transformFile(doc, "single.html", getDocResource(SINGLE));
    transformFile(doc, "deprecated.html", getDocResource(DEPRECATED));
  }

  private void transformFile(String src, String dest, Resource transformer) throws IOException, SAXException, TransformerConfigurationException {
    transformFile(new File(srcDir, src), new File(destDir, dest), getTransformer(transformer));
  }

  private void transformFile(File src, File dest, Transformer transformer) throws IOException, SAXException {
    transformFile(parser.parse(src), dest, transformer);
  }

  private void transformFile(Document src, String dest, Resource transformer) throws IOException, SAXException, TransformerConfigurationException {
    transformFile(src, new File(destDir, dest), getTransformer(transformer));
  }

  private void transformFile(Document src, File dest, Transformer transformer) throws IOException {
    DOMSource xmlDomSource = new DOMSource(src);

    dest.getParentFile().mkdirs();
    FileOutputStream outputStream = new FileOutputStream(dest);
    Result result = new StreamResult(outputStream);

    try {
      if (title != null)
        transformer.setParameter("title", title);
      if (copyright != null)
        transformer.setParameter("copyright", copyright);

      transformer.transform(xmlDomSource, result);
    } catch (TransformerException e) {
      throw new RuntimeException(e);
    }

    outputStream.close();
  }

  private void initXML() throws IOException {
    try {
      if (parser != null) return;

      DocumentBuilderFactory dFactory = DocumentBuilderFactory.newInstance();
      dFactory.setNamespaceAware(true);
      parser = dFactory.newDocumentBuilder();

      factory = new TransformerFactoryImpl();
      factory.setURIResolver(new URIResolver() {
        public Source resolve(String href, String base) throws TransformerException {
          try {
            URL url;
            URI uri = new URI(href);
            if (uri.isAbsolute()) {
              url = new URL(uri.toString());
            } else {
              url = new URL(base.substring(0, base.lastIndexOf("/") + 1) + href);
            }

            return new StreamSource(url.openStream(), url.toString());
          } catch (URISyntaxException e) {
            throw new RuntimeException(e);
          } catch (IOException e) {
            throw new RuntimeException(e);
          }
        }
      });
      
      factory.setAttribute("http://saxon.sf.net/feature/strip-whitespace", "none");
    } catch (ParserConfigurationException e) {
      throw new Error(e);
    }
  }

  private Resource getDocResource(String path) throws IOException {
    if (docDir != null) {
      File f = new File(docDir, path);
      return new Resource(new FileInputStream(f), f.toURL());
    } else {
      URL url = HtmlDocCompiler.class.getClassLoader().getResource("com/tibco/gi/tools/doc/" + path);

      if (url != null) {
        return new Resource(url.openStream(), url);
      }

      throw new RuntimeException("Could not open resource '" + path + "'.");
    }
  }

  private Transformer getTransformer(Resource file) throws IOException, SAXException, TransformerConfigurationException {
    return getTransformer(parser.parse(file.stream), file.url.toString());
  }

  private Transformer getTransformer(Document doc, String id) throws IOException, TransformerConfigurationException {
    DOMSource xslDomSource = new DOMSource(doc);
    xslDomSource.setSystemId(id);
    return factory.newTransformer(xslDomSource);
  }

  private void log(Level level, String msg) {
    if (strict)
      throw new RuntimeException(msg);
    LOG.log(level, msg);
  }

  /**
   * Sets the directory containing the compiler resources. See {@link HtmlDocCompiler} for more information.
   * @param docDir
   */
  public void setDocDir(File docDir) {
    this.docDir = docDir;
  }

  /**
   * Sets the directory containing the source XML documentation files.
   * @param srcDir
   */
  public void setSrcDir(File srcDir) {
    this.srcDir = srcDir;
  }

  /**
   * Sets the destination directory for the compiled HTML documentation files.
   * @param destDir
   */
  public void setDestDir(File destDir) {
    this.destDir = destDir;
  }

  /**
   * Sets the title of the compiled documentation.
   * @param title
   */
  public void setTitle(String title) {
    this.title = title;
  }

  /**
   * Sets the copyright notice in the compiled documentation.
   * @param copyright
   */
  public void setCopyright(String copyright) {
    this.copyright = copyright;
  }

  /**
   * Sets whether to throw exceptions rather than log warning.
   * @param strict
   */
  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}
