/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
package com.tibco.gi.tools;

import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintStream;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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
 * Merges source files together into a single file. The merged file is the result of including all source files needed
 * to satisfy a set of required symbols. A dependency graph is a required input so that the tool knows what files to
 * merge to satisfy the symbols.
 * <p/>
 * The DTD of the dependency graph file is:
 * <pre>
 * &lt;!ELEMENT gi-merger (file | alias)* &gt;
 * &lt;!ELEMENT file &gt;
 * &lt;!ATTLIST file path CDATA #REQUIRED      &lt;!-- the relative path to the file --&gt;
 *                provides CDATA #REQUIRED  &lt;!-- whitespace-delimited list of provided symbols --&gt;
 *                requires CDATA ""&gt;        &lt;!-- whitespace-delimited list of required symbols --&gt;
 * &lt;!ELEMENT alias &gt;
 * &lt;!ATTLIST alias provides CDATA #REQUIRED &lt;!-- whitespace-delimited list of provided symbols --&gt;
 *                 requires CDATA ""&gt;       &lt;!-- whitespace-delimited list of required symbols --&gt;
 * </pre>
 * It is an error for more than one <code>file</code> or <code>alias</code> element to provide the same symbol.
 *
 * @author Jesse Costello-Good
 */
public class ScriptMerger {

  private static final Logger LOG = Logger.getLogger(ScriptMerger.class.getName());

  /**
   * Provides an object-oriented interface onto a dependency graph file.
   */
  private static class DependencyGraph {

    private static class Record {
      private String path;
      private Set<String> provides = new HashSet<String>();
      private Set<String> requires = new HashSet<String>();

      public Record(String path, String provides, String requires) {
        this.path = path;
        this.provides.addAll(Arrays.asList(provides.split("[ ,;]+")));
        this.requires.addAll(Arrays.asList(requires.split("[ ,;]+")));
      }

      public String toString() {
        return this.path + " provides:" + provides + " requires:" + requires;
      }
    }

    private List<Record> files = new ArrayList<Record>();
    private List<Record> aliases = new ArrayList<Record>();

    /**
     * Index graph records by what symbol(s) they provide.
     */
    private Map<String, Record> byProvides = new HashMap<String, Record>(); // ok non-deterministic access, no iteration over values

    public DependencyGraph(File graph) throws IOException {
      try {
        Document configDoc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(graph);
        List<Element> fileNodes = new DOMXPath("//file").selectNodes(configDoc);
        for (Element node : fileNodes) {
          Record r = new Record(node.getAttribute("path"), node.getAttribute("provides"), node.getAttribute("requires"));
          files.add(r);
          for (String symbol : r.provides) { // ok non-deterministic access, added to map
            if (byProvides.containsKey(symbol))
              throw new RuntimeException("Two records provide the same symbol " + symbol + ": " + byProvides.get(symbol) + " and " + r);
            byProvides.put(symbol, r);
          }
        }
        List<Element> aliasNodes = new DOMXPath("//alias").selectNodes(configDoc);
        for (Element node : aliasNodes) {
          Record r = new Record("", node.getAttribute("provides"), node.getAttribute("requires"));
          aliases.add(r);
          for (String symbol : r.provides) { // ok non-deterministic access, added to map
            if (byProvides.containsKey(symbol))
              throw new RuntimeException("Two records provide the same symbol " + symbol + ": " + byProvides.get(symbol) + " and " + r);
            byProvides.put(symbol, r);
          }
        }
      } catch (ParserConfigurationException e) {
        throw new Error(e);
      } catch (JaxenException e) {
        throw new RuntimeException(e);
      } catch (SAXException e) {
        throw new IOException("Error parsing dependency graph file: " + e);
      }
    }

    /**
     * Returns the list of file paths in all &lt;file&gt; elements in the graph file.
     */
    public List<String> getPaths() {
      List<String> paths = new ArrayList<String>(files.size());
      for (Record file : files)
        paths.add(file.path);
      return paths;
    }

    /**
     * Returns true if <code>path</code> is required by one of the symbols in <code>includes</code>.
     */
    public boolean isIncluded(String path, Collection<String> includes) {
      Set<String> symbols = expand(includes);
      for (String symbol : symbols) {
        Record r = byProvides.get(symbol);
        if (r != null) {
          if (r.path.equals(path)) return true;
        }
      }
      return false;
    }

    private Set<String> expand(Collection<String> symbols) {
      List<String> queue = new ArrayList<String>(symbols);
      Set<String> set = new HashSet<String>();

      while (queue.size() > 0) {
        String s = queue.remove(queue.size() - 1);
        if (!set.contains(s)) {
          set.add(s);
          Record r = byProvides.get(s);
          if (r != null)
            queue.addAll(r.requires);
        }
      }

      return set;
    }
  }

  private File baseDir;
  private File graphFile;
  private String target;
  private File outFile;
  private Set<String> requires = new HashSet<String>();
  private File logFile;
  private boolean strict = false;

  public ScriptMerger() {
  }

  /**
   * Performs the script merge.
   *
   * @throws IOException
   */
  public void run() throws IOException {
    if (baseDir == null) throw new NullPointerException("Base directory must be specified.");
    if (logFile == null) throw new NullPointerException("Log file must be specified.");
    if (graphFile == null) throw new NullPointerException("Dependency graph file must be specified.");
    if (outFile == null) throw new NullPointerException("Output file must be specified.");

    LOG.info("Running script merger with target " + target + " and includes " + requires + ".");

    DependencyGraph graph = new DependencyGraph(graphFile);
    File tempFile = File.createTempFile("ScriptMerger", ".js");
    Writer out = new FileWriter(tempFile);

    if (!logFile.isFile()) logFile.createNewFile();
    PrintStream log = new PrintStream(new FileOutputStream(logFile, true));
    int merged = 0;

    List<String> paths = graph.getPaths();
    for (String path : paths) {
      File scriptFile = new File(baseDir, path);
      File scriptFileTargeted = null;
      String targetedPath = null;
      if (target != null) {
        int index = path.lastIndexOf(".");
        targetedPath = path.substring(0, index) + "." + target + path.substring(index);
        scriptFileTargeted = new File(baseDir, targetedPath);
      }

      if (graph.isIncluded(path, requires)) {
        if (scriptFileTargeted != null && scriptFileTargeted.isFile()) {
          Utils.appendFromReader(out, scriptFileTargeted);
          log.println("MERGE " + targetedPath + " " + target);
          log.println("MERGECOMP " + path);
          merged++;
        } else {
          if (scriptFile.isFile()) {
            Utils.appendFromReader(out, scriptFile);
            log.println("MERGENOCOMP " + path);
            merged++;
          } else {
            log(Level.WARNING, "Input file " + scriptFile + " was not found.");
          }
        }
      } else {
        if (scriptFileTargeted != null && scriptFileTargeted.isFile()) {
          log.println("SKIP " + targetedPath + " " + target);
        }
        log.println("SKIP " + path);
      }
    }

    out.close();
    log.close();

    if (outFile.exists())
      if (!outFile.delete())
        log(Level.SEVERE, "Could not delete " + outFile);
    if (!(outFile.getParentFile().isDirectory() || outFile.getParentFile().mkdirs()))
      log(Level.SEVERE, "Could not make directory for " + outFile);
    if (!Utils.moveFile(tempFile, outFile))
      log(Level.SEVERE, "Could not overwrite " + outFile);

    LOG.info("Merged " + merged + " script files to " + outFile);
  }

  private void log(Level level, String msg) {
    if (strict)
      throw new RuntimeException(msg);
    LOG.log(level, msg);
  }

  /**
   * Sets the base directory of the script merge. The paths of the files in the dependency graph file should be relative
   * to this directory.
   *
   * @param baseDir
   */
  public void setBaseDir(File baseDir) {
    this.baseDir = baseDir;
  }

  /**
   * Sets the dependency graph file.
   *
   * @param graphFile
   */
  public void setGraphFile(File graphFile) {
    this.graphFile = graphFile;
  }

  /**
   * Sets the target for the script merge. If this property is set, this script merge looks for input files specific to
   * the target. For example, if <code>file.js</code> is an source file and the target is <code>IE</code> and the file
   * <code>file.IE.js</code> exists, this target specific file is merged instead of <code>file.js</code>. Setting the
   * target helps to integrate this tool with the {@link ScriptCompiler} tool.
   *
   * @param target
   */
  public void setTarget(String target) {
    this.target = target != null ? target.toUpperCase() : null;
  }

  /**
   * Sets the output file, which is the destination of the merged source files.
   *
   * @param outFile
   */
  public void setOutFile(File outFile) {
    this.outFile = outFile;
  }

  /**
   * Adds a required symbol to this merger.
   *
   * @param symbol
   */
  public void addRequire(String symbol) {
    requires.add(symbol);
  }

  /**
   * Sets the log file. The log file helps to integrate this tool with the {@link ScriptMergerCleanup} tool.
   *
   * @param logFile
   */
  public void setLogFile(File logFile) {
    this.logFile = logFile;
  }

  /**
   * Sets whether to throw exceptions rather than log warning.
   * @param strict
   */
  public void setStrict(boolean strict) {
    this.strict = strict;
  }

}
