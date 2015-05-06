/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
package com.tibco.gi.tools;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintStream;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.tibco.gi.tools.obfuscator.FileHandler;
import com.tibco.gi.tools.obfuscator.MetaDataParser;
import com.tibco.gi.tools.obfuscator.NodeTraverser;
import com.tibco.gi.tools.obfuscator.NodeWrapper;
import com.tibco.gi.tools.obfuscator.Scope;

/**
 * A configurable JavaScript obfuscator. The obfuscator works by parsing the JavaScript source with the open source
 * Rhino library, modifying the parse tree as necessary for the obfuscation, and re-serializing the parse tree to
 * JavaScript.
 * <p/>
 * The following input file types are supported:
 * <ul>
 *   <li>JavaScript - the file must be valid JavaScript v1.6 (parsable by Rhino 1.6) and named <code>*.js</code> or
 *       <code>*.js.*</code></li>
 *   <li>CDF - the file must be valid XML, have a root element <code>data</code>, and be named
 *       <code>*.(xml|jss|html|xhtml)</code>. Any attribute <code>jsxexecute</code> or <code>jsxselect</code> will
 *       be obfuscated.</li>
 *   <li>JSX Serialization - </li> the file must be valid XML, have a root element <code>serialization</code>, and be
 *       named <code>*.(xml|jss|html|xhtml)</code>. The value of the <code>onBeforeDeserialize</code> and
 *       <code>onAfterDeserialize</code> elements, any attribute of an <code>events</code> element, and any
 *       attributes of a <code>properties</code> element beginning with "on" with be obfuscated.
 *   <li>XHTML - </li> the file must be valid XML, have a root element <code>html</code>, and be named
 *       <code>*.(xml|jss|html|xhtml)</code>. The value of any <code>script</code> element will be obfuscated.
 *   <li>All other files will be copied to the destination without modification.</li>
 * </ul>
 * <p/>
 * How the JavaScript files are obfuscated depends on a number of inputs:
 * <ul>
 *   <li>Properties of this class - {@link #setObfuscateParameters} and {@link #setObfuscateVariables}</li>
 *   <li>Metadata inputs to the obfuscator - {@link #setBlessFile}, {@link #setClobberFile},
 *       and {@link #setMapInFile}</li>
 *   <li>Inline metadata in the JavaScript source files - <code>@jsxobf-clobber</code>,
 *       <code>@jsxobf-clobber-shared</code>, <code>@jsxobf-bless</code>, and <code>@jsxobf-final</code></li>
 * </ul>
 * <p/>
 * <b><code>@jsxobf-clobber</code>, <code>@jsxobf-clobber-shared</code>, <code>@jsxobf-bless</code></b>: these
 * metadata tags affect the JavaScript declaration that immediately follows the tag. The tag should be contained in
 * a JavaScript line or range comment. If any text follows the tag inside the comment on the same line, then this text
 * is taken as a white space-separated list of names to apply the command to. Otherwise,
 * immediately following the range comment should be a JavaScript statement setting the
 * target of the tag to some value. The name that is affected is the last JavaScript identifier before the equals sign.
 * That name will be clobber (or blessed if <code>@jsxobf-bless</code>) anywhere it appears in the script context in
 * which the tag appears. The name is also clobbered/blessed even if it is in a JavaScript string but only if is
 * equal to the entire string and not if it is only a subsequence of the string. If a name needs to be clobbered and
 * renamed to the same value in more than one script context, then the <code>-shared</code> version of the tag
 * should be used. <i>The current implementation of the obfuscator renames every name as though it were shared but
 * future versions may honor the difference between the shared and unshared names.</i>
 *
 * @author Jesse Costello-Good
 */
public class Obfuscator {

  private static final Logger LOG = Logger.getLogger(Obfuscator.class.getName());

  private boolean obfuscateParameters = false;
  private boolean obfuscateVariables = false;
  private boolean optimizeLiterals = false;
  private File blessFile;
  private File clobberFile;
  private File mapInFile;
  private File mapOutFile;
  private final Map<File, File> fileMap = new HashMap<File, File>();
  private boolean strict = false;

  public Obfuscator() {
  }

  /**
   * Sets whether to rename method parameters. If this property is set to <code>true</code> (the default is
   * <code>false</code>) then this obfuscator will rename all method parameters to short pseudo-random names.
   * @param obfuscateParameters
   */
  public void setObfuscateParameters(boolean obfuscateParameters) {
    this.obfuscateParameters = obfuscateParameters;
  }

  /**
   * Sets whether to rename locale variables. If this property is set to <code>true</code> (the default is
   * <code>false</code>) then this obfuscator will rename all local variables to short pseudo-random names.
   * @param obfuscateVariables
   */
  public void setObfuscateVariables(boolean obfuscateVariables) {
    this.obfuscateVariables = obfuscateVariables;
  }

  /**
   * Sets whether to optimize strings and regular expressions by moving string literals and regular expression literals
   * from non-static JavaScript code to static code. This generally improves performance significantly on Internet
   * Explorer 6.
   * @param optimizeLiterals
   */
  public void setOptimizeLiterals(boolean optimizeLiterals) {
    this.optimizeLiterals = optimizeLiterals;
  }

  /**
   * Adds an input/output file mapping. The file <code>from</code> will be parsed, obfuscated, and written to file
   * <code>to</code>. <code>from</code> and <code>to</code> may be equal.
   * @param from
   * @param to
   */
  public void addFileMap(File from, File to) {
    fileMap.put(from, to);
  }

  /**
   * Returns the number of files that this obfuscator will process or has processed.
   * @return
   */
  public int getFileCount() {
    return fileMap.size();
  }

  /**
   * Sets the file containing the list of all names to bless (never obfuscate). This property is optional. These
   * names appear one per line and must be valid JavaScript identifiers. The part of a line coming after a "#" character
   * is considered a comment.
   * @param blessFile
   */
  public void setBlessFile(File blessFile) {
    this.blessFile = blessFile;
  }

  /**
   * Sets the file containing the list of all names to clobber (always obfuscate). This property is optional. These
   * names appear one per line and must be valid JavaScript identifiers. The part of a line coming after a "#" character
   * is considered a comment.
   * @param clobberFile
   */
  public void setClobberFile(File clobberFile) {
    this.clobberFile = clobberFile;
  }

  /**
   * Sets the file containing a list of names mapped to their obfuscated value. If this property is set, this file
   * is read and when the obfuscator renames any name contained in the file, it renames it to the mapped value in the
   * file. This property is useful for chained obfuscation jobs in which names in a later job must be obfuscated in
   * the same manner as files in an early job.
   *
   * @param mapInFile
   */
  public void setMapInFile(File mapInFile) {
    this.mapInFile = mapInFile;
  }

  /**
   * Sets the file where list of names obfuscated during the run of this obfuscator is written. Each line of the
   * file contains the unobfuscated name followed by a space and the obfuscated name. Methor parameter and local
   * variable rename mappings are not constant across an obfuscator and are not included in this file.
   *
   * @param mapOutFile
   */
  public void setMapOutFile(File mapOutFile) {
    this.mapOutFile = mapOutFile;
  }

  /**
   * Runs this obfuscator.
   * @throws IOException
   */
  public void run() throws IOException {
    if (fileMap.size() == 0) throw new IllegalStateException("At least one source file must be specified.");

    NodeTraverser obfuscator = new NodeTraverser();
    obfuscator.addNameMappings(getNameMappings());

    Scope.Global scope = new Scope.Global();
    scope.setRenameMethodParameters(obfuscateParameters);
    scope.setRenameLocalVariables(obfuscateVariables);
    scope.setOptimizeLiterals(optimizeLiterals);
    for (String s : getBlessMethods())
      scope.addBlessedName(s);
    for (String s : getClobberMethods())
      scope.addClobberedSharedName(s);

    Collection<FileHandler> handlers = new ArrayList<FileHandler>();
    MetaDataParser mdp = new MetaDataParser(strict);

    for (File inputFile : Utils.getSortedCopy(fileMap.keySet())) {
      File outputFile = fileMap.get(inputFile);

      FileHandler handler = FileHandler.getHandler(inputFile, strict);
      handler.setOutputFile(outputFile);

      try {
        Collection<NodeWrapper> scripts = handler.getScripts();
        if (scripts.size() > 0) {
          Scope.File fileScope = new Scope.File(inputFile);
          scope.addChild(fileScope);

          for (NodeWrapper script : scripts)
            fileScope.addChild(new Scope.Script(script));

          for (Reader reader : handler.getScriptBlocks()) {
            mdp.parse(reader, fileScope);
            reader.close();
          }
        }
      } catch (IOException e) {
        log(Level.SEVERE, "Error processing file: " + inputFile, e);
      }

      handlers.add(handler);
    }

    obfuscator.obfuscate(scope);

    for (FileHandler handler : handlers) {
      try {
//        LOG.info("Writing " + handler.getOutputFile());
        handler.writeToOutput();
      } catch (Exception e) {
        log(Level.SEVERE, "Error serializing script " + handler.getInputFile() + ": " + e, e);
      }
    }

    Map<String, String> fullMap = new HashMap<String, String>(obfuscator.getNameMap());
    writeMethodMapOutput(fullMap);
  }

  private void writeMethodMapOutput(Map<String, String> mappings) throws IOException {
    if (mapOutFile != null) {
      if (!mapOutFile.isFile()) mapOutFile.createNewFile();

      PrintStream printer = new PrintStream(new FileOutputStream(mapOutFile));
      for (String key : Utils.sortedKeys(mappings)) {
        printer.println(key + " " + mappings.get(key));
      }

      printer.close();
    }
  }

  private Map<String, String> getNameMappings() throws IOException {
    Map<String, String> mappings = new HashMap<String, String>();

    if (mapInFile != null && mapInFile.isFile()) {
      BufferedReader reader = new BufferedReader(new FileReader(mapInFile));

      String line;
      while ((line = reader.readLine()) != null) {
        line = line.replaceAll("#.*$", "");

        String[] tokens = line.split("[\\s,;]+");
        if (tokens.length >= 2)
          mappings.put(tokens[0], tokens[1]);
      }

      reader.close();
    }

    return mappings;
  }

  private Collection<String> getBlessMethods() throws IOException {
    return getListFromPath(blessFile);
  }

  private Collection<String> getClobberMethods() throws IOException {
    return getListFromPath(clobberFile);
  }

  private Collection<String> getListFromPath(File file) throws IOException {
    Collection<String> list = new ArrayList<String>();
    if (file == null || !file.isFile())
      return list;

    BufferedReader reader = new BufferedReader(new FileReader(file));

    String line;
    while ((line = reader.readLine()) != null) {
      line = line.replaceAll("#.*$", "");

      String[] tokens = line.split("[\\s,;]+");
      list.addAll(Arrays.asList(tokens));
    }

    reader.close();
    return list;
  }

  private void log(Level level, String msg) {
    if (strict)
      throw new RuntimeException(msg);
    LOG.log(level, msg);
  }

  private void log(Level level, String msg, Throwable t) {
    if (strict)
      throw new RuntimeException(msg, t);
    LOG.log(level, msg, t);
  }

  /**
   * Sets whether to throw exceptions rather than log warning.
   * @param strict
   */
  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}
