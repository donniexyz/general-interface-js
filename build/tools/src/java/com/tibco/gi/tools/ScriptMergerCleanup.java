/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;
import java.util.logging.Level;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.jaxen.JaxenException;
import org.jaxen.dom.DOMXPath;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

/**
 * Performs clean-up on source files and directories that may be necessary after running the {@link ScriptMerger} tool.
 *
 * @author Jesse Costello-Good
 */
public class ScriptMergerCleanup {

  private static final Logger LOG = Logger.getLogger(ScriptMergerCleanup.class.getName());

  private boolean strict = false;

  public ScriptMergerCleanup() {
  }

  /**
   * Deletes any source files left over from the {@link ScriptMerger} tool that are no longer necessary. This method
   * requires the log file from the {@link ScriptMerger} tool to determine which files can be deleted. If the
   * <code>config</code> parameter is provided, this method also edits the configuration file to remove any references
   * to files that no longer exist after being merged by the script merger.
   *
   * @param dir the reference directory for the configuration file and log file.
   * @param config the optional GI configuration file to edit.
   * @param log the script merger log file.
   */
  public void cleanUpScripts(File dir, File config, File log) throws IOException {
    int deleted = 0;

    BufferedReader logReader = new BufferedReader(new FileReader(log));

    String line;
    Set<String> pathsToRemove = new HashSet<String>();

    while ((line = logReader.readLine()) != null) {
      String[] tokens = line.split("\\s+");
      String command = tokens[0];
      String path = tokens[1];
      String target = tokens.length > 2 ? tokens[2] : null;

      File scriptFile = new File(dir, path);
      if (command.startsWith("MERGE") || ("SKIP".equals(command) && target != null && target.length() > 0)) {
        if (!pathsToRemove.contains(path)) {
          if (scriptFile.isFile()) {
            if (!scriptFile.delete())
              log(Level.SEVERE, "Could not delete " + scriptFile);
            if (!(scriptFile.getParentFile().listFiles().length > 0 || scriptFile.getParentFile().delete()))
              log(Level.SEVERE, "Could not delete " + scriptFile.getParentFile());
            deleted++;
          } else {
            log(Level.SEVERE, "Not a file: " + scriptFile);
          }
          pathsToRemove.add(path);
        }
      }
    }

    logReader.close();
    
    LOG.info("Deleted " + deleted + " script files from " + dir + ".");

    if (config != null) {
      int removed = 0;

      try {
        Document configDoc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(config);
        List<Element> srcNodes = new DOMXPath("//record[@jsxid='includes']/record/record[@jsxid='src']").selectNodes(configDoc);

        for (Element node : srcNodes) {
          String value = node.getFirstChild().getNodeValue();
          if (pathsToRemove.contains(value)) {
            node.getParentNode().getParentNode().removeChild(node.getParentNode());
            removed++;
          }
        }

        Utils.serializeDocument(configDoc, config);
      } catch (ParserConfigurationException e) {
        throw new Error(e);
      } catch (JaxenException e) {
        throw new RuntimeException(e);
      } catch (SAXException e) {
        throw new IOException("Error parsing configuration file: " + e);
      }

      LOG.info("Removed " + removed + " includes from " + config + ".");
    }
  }

  /**
   * Adds an entry to a GI configuration file for a script file. This method is useful for adding the result of a script
   * merge to a configuration file.
   *
   * @param config the configuration file.
   * @param script the script file to add.
   * @param scripttarget the optional script target.
   * @throws IOException
   */
  public void addScriptToConfig(File config, File script, String scripttarget) throws IOException {
    Document configDoc = null;
    Element includesNode = null;
    try {
      configDoc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(config);
      includesNode = (Element) new DOMXPath("//record[@jsxid='includes']").selectSingleNode(configDoc);
    } catch (ParserConfigurationException e) {
      throw new Error(e);
    } catch (JaxenException e) {
      throw new RuntimeException(e);
    } catch (SAXException e) {
      throw new IOException("Error parsing configuration file: " + e);
    }
    
    if (includesNode == null) {
      includesNode = configDoc.createElement("record");
      includesNode.setAttribute("jsxid", "includes");
      configDoc.getDocumentElement().appendChild(includesNode);
    }

    Element record = configDoc.createElement("record");
    record.setAttribute("type", "map");
    includesNode.insertBefore(record, includesNode.getFirstChild());

    Element idNode = configDoc.createElement("record");
    idNode.setAttribute("jsxid", "id");
    idNode.setAttribute("type", "string");
    idNode.appendChild(configDoc.createTextNode(script.getName()));
    record.appendChild(idNode);

    Element typeNode = configDoc.createElement("record");
    typeNode.setAttribute("jsxid", "type");
    typeNode.setAttribute("type", "string");
    typeNode.appendChild(configDoc.createTextNode("script"));
    record.appendChild(typeNode);

    Element loadNode = configDoc.createElement("record");
    loadNode.setAttribute("jsxid", "load");
    loadNode.setAttribute("type", "number");
    loadNode.appendChild(configDoc.createTextNode("1"));
    record.appendChild(loadNode);

    if (scripttarget != null) {
      Element browserNode = configDoc.createElement("record");
      browserNode.setAttribute("jsxid", "browser");
      browserNode.setAttribute("type", "string");
      browserNode.appendChild(configDoc.createTextNode(scripttarget.toUpperCase()));
      record.appendChild(browserNode);
    }

    Element srcNode = configDoc.createElement("record");
    srcNode.setAttribute("jsxid", "src");
    srcNode.setAttribute("type", "string");
    srcNode.appendChild(configDoc.createTextNode(Utils.relativizeURI(config.getParentFile().toURI(), script.toURI()).toString()));
    record.appendChild(srcNode);

    Utils.serializeDocument(configDoc, config);
  }

  private void log(Level level, String msg) {
    if (strict)
      throw new RuntimeException(msg);
    LOG.log(level, msg);
  }

  /**
   * Sets whether to throw exceptions rather than log warning.
   * @param strict
   */
  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}
