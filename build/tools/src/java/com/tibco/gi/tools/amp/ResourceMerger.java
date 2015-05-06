/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools.amp;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;
import java.util.logging.Level;
import java.util.regex.Pattern;

import com.tibco.gi.tools.Utils;
import org.jaxen.JaxenException;
import org.jaxen.dom.DOMXPath;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * Merges plug-in resources into a plugin.xml plug-in descriptor file.
 *
 * @author Jesse Costello-Good
 */
public class ResourceMerger {

  private static final Logger LOG = Logger.getLogger(ResourceMerger.class.getName());

  private Set<File> configFiles = new HashSet<File>();
  private Set<Pattern> idsToMerge = new HashSet<Pattern>();
  private Set<File> filesToDelete = new HashSet<File>();
  private boolean strict = false;

  public ResourceMerger() {
  }

  /**
   * Inlines any matching JavaScript, XML, and XSL resources into the plugin.xml file that references them. A single
   * run of this tool may process more than one plugin.xml file. Resources to merge are specified as ID patterns.
   *
   * @throws java.io.IOException
   */
  public void run() throws IOException {
    if (configFiles.size() == 0) throw new IllegalStateException("No configuration files specified.");
    if (idsToMerge.size() == 0) throw new IllegalStateException("No ID patterns specified.");

    filesToDelete.clear();

    try {
      for (File file : configFiles) { // ok non-deterministic access, independent
        Document doc = Utils.parseXML(file);
        Element docElm = doc.getDocumentElement();

        if ("plugins".equals(docElm.getNodeName())) {
          List<Element> pluginNodes = new DOMXPath("plugin").selectNodes(docElm);
          for (Element pluginNode : pluginNodes) {
            String id = pluginNode.getAttribute("id");
            File pluginDir = new File(file.toURI().resolve(id));

            List<Element> rsrcNodes = new DOMXPath("resources/*").selectNodes(pluginNode);
            for (Element rsrcNode : rsrcNodes) {
              String path = rsrcNode.getAttribute("path");
              if (path != null && path.length() > 0) {
                doResource(pluginNode, rsrcNode, pluginDir);
              }
            }
          }
        } else if ("plugin".equals(docElm.getNodeName())) {
          File pluginDir = file.getParentFile();
          List<Element> rsrcNodes = new DOMXPath("resources/*").selectNodes(docElm);
          for (Element rsrcNode : rsrcNodes) {
            String path = rsrcNode.getAttribute("path");
            if (path != null && path.length() > 0) {
              doResource(docElm, rsrcNode, pluginDir);
            }
          }
        } else {
          log(Level.WARNING, "Unknown root element: " + docElm.getNodeName());
        }

        Utils.serializeDocument(doc, file);
      }
    } catch (JaxenException e) {
      throw new IOException(e.toString());
    }

    for (File file : filesToDelete) { // ok non-deterministic access, independent
      file.delete();
    }
  }

  private void doResource(Element pluginNode, Element rsrcNode, File pluginDir) {
    String rsrcId = pluginNode.getAttribute("id") + "." + rsrcNode.getAttribute("id");

    if (idMatches(rsrcId)) {
      if (!pluginDir.isDirectory()) {
        log(Level.WARNING, "No plug-in directory for plug-in " + pluginNode.getAttribute("id"));
        return;
      }

      File rsrcFile = new File(pluginDir.toURI().resolve(rsrcNode.getAttribute("path")));

      if (rsrcFile.isFile()) {
        String rsrcType = rsrcNode.getNodeName();
        if ("xml".equals(rsrcType) || "xsl".equals(rsrcType) || "jss".equals(rsrcType) || "propsbundle".equals(rsrcType)) {
          try {
            Document rsrcDoc = Utils.parseXML(rsrcFile);
            // Need to copy the namespace over explicitly because an empty NS will turn into an AMP NS otherwise.
            String namespace = rsrcDoc.getDocumentElement().getAttribute("xmlns");
            Element dataNode = rsrcNode.getOwnerDocument().createElement("data");
            Element copiedNode = (Element) dataNode.getOwnerDocument().importNode(rsrcDoc.getDocumentElement(), true);
            copiedNode.setAttribute("xmlns", namespace);
            dataNode.appendChild(copiedNode);
            rsrcNode.appendChild(dataNode);

            if ("propsbundle".equals(rsrcType))
              dataNode.setAttribute("path", rsrcNode.getAttribute("path"));

            rsrcNode.removeAttribute("path");

            filesToDelete.add(rsrcFile);
          } catch (IOException e) {
            log(Level.WARNING, "Error parsing " + rsrcFile + ": " + e);
          }
        } else if ("script".equals(rsrcType) || "css".equals(rsrcType)) {
          try {
            StringWriter js = new StringWriter();
            Utils.appendFromReader(js, rsrcFile);
            Element dataNode = rsrcNode.getOwnerDocument().createElement("data");
            dataNode.appendChild(rsrcNode.getOwnerDocument().createCDATASection(js.toString()));
            rsrcNode.appendChild(dataNode);
            rsrcNode.removeAttribute("path");
            filesToDelete.add(rsrcFile);
          } catch (IOException e) {
            log(Level.WARNING, "Error reading " + rsrcFile + ": " + e);
          }
        } else {
          log(Level.WARNING, "Resource type " + rsrcType + " not supported: " + rsrcId);
        }
      } else {
        log(Level.WARNING, "Resource " + rsrcId + " does not exist: " + rsrcFile);
      }
    }
  }

  private boolean idMatches(String id) {
    for (Pattern p : idsToMerge) { // ok non-deterministic access, should only match one
      if (p.matcher(id).matches())
        return true;
    }
    return false;
  }

  private void log(Level level, String msg) {
    if (strict)
      throw new RuntimeException(msg);
    LOG.log(level, msg);
  }

  /**
   * Adds a plugin.xml file to merge.
   * @param f
   */
  public void addFile(File f) {
    configFiles.add(f);
  }

  /**
   * Adds an ID pattern for merging. Only resource IDs that match one of these patterns will be merged into
   * a plugin.xml file. "*" characters are expanded to [\w\-\$]+. The resource ID is the id attribute of the
   * resource declaration appended to the ID of its plug-in, separated with a ".".
   * @param s
   */
  public void addIdPattern(String s) {
    addIdPattern(Pattern.compile(s.replace(".", "\\.").replace("*", "[\\w\\-\\$]+")));
  }

  /**
   * Adds an ID pattern for merging.
   * @param p
   * @see #addIdPattern(String)
   */
  public void addIdPattern(Pattern p) {
    idsToMerge.add(p);
  }

  /**
   * Sets whether to throw exceptions rather than log warning.
   * @param strict
   */
  public void setStrict(boolean strict) {
    this.strict = strict;
  }

}