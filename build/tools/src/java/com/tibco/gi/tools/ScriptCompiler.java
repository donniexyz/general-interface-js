/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;
import java.util.Stack;
import java.util.TreeSet;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Pre-compiles JavaScript files based on metadata stored in inline JavaScript comments. This tool has two basic modes:
 * symbol compilation and target compilation.
 * <p/>
 * <b>Symbol Compilation</b>: In this mode, blocks of code are stripped from or left in the JavaScript source files. A
 * symbol block follows. The range comments must exist on single lines and be preceeded by only white space. Symbol
 * blocks may be contained without other symbols blocks. 
 * <pre>
 * /&#42; @JSC :: begin SYMBOL &#42;/
 * ...
 * /&#42; @JSC :: end &#42;/
 * </pre>
 * When the script compiler is run in symbol mode, the two range comments above are removed from the output. Whether the
 * intervening lines of code are removed or left in depends on whether the compiler is run with symbol
 * <code>SYMBOL</code> on or off. If <code>SYMBOL</code> is on, the code is left in; if it is off, the code is removed.
 * Any number of symbols may be used in a source file. A symbol may not contain any whitespace.
 * <p/>
 * Symbol compilation is useful for removing code from the compiled files that is not necessary in all situations. For
 * example, if all deprecated code is marked with a symbol, for example <code>DEP</code>, then it can easily be removed
 * in a build by running the script compiler with <code>DEP</code> turned off.
 * <p/>
 * <b>Target Compilation</b>: In this mode, only one branch of marked if/else blocks is output in a compiled file. The
 * compiler can be run with one or more targets and a compiled file is created for each target. A marked if/else block
 * looks like this:
 * <pre>
 * /&#42; @JSC &#42;/ if (SYM1) {
 * ...
 * /&#42; @JSC &#42;/ } else if (SYM2) {
 * ...
 * /&#42; @JSC &#42;/ } else {
 * ...
 * /&#42; @JSC &#42;/ }
 * </pre>
 * Each condition may be preceeded by a negative (<code>!</code>). Each condition may be an or statement (e.g.
 * <code>SYM1 || SYM2</code>) of positive targets or an and statement of negative targets (e.g. <code>!SYM1 &&
 * !SYM2</code>). A final else block is optional and not all targets must be accounted for in every marked block. Each
 * symbol can also be preceeded by an arbitrarily long namespace (example <code>jsx3.SYM1</code>).
 * <p/>
 * Additionally, aliases are supported. For example, <code>IE</code> can alias both <code>IE6</code> and
 * <code>IE7</code>. Then, if the compiler is run with targets <code>IE6</code> and <code>IE7</code>, and a conditional
 * statement is encountered with the target <code>IE</code>, that branch is written to the files of both targets.
 * <p/>
 * For each input file, a file is created for each target. In input file <code>file.js</code> is mapped to
 * <code>out/file.js</code> and run with targets <code>IE</code> and <code>FX</code>, then files
 * <code>out/file.IE.js</code> and <code>out/file.FX.js</code> are created.
 * <p/>
 * Target compilation is useful for creating compiled builds that are targeted to a particular platform. Since target
 * compilation affects actual JavaScript if/else statements, the uncompiled source files can include the logic for all
 * platforms. This may be more convenient for development but is inefficient because each platform loads the logic for
 * all other platforms. The script compiler can create a compiled JavaScript file that only contains the logic for one
 * platform.
 *
 * @author Jesse Costello-Good
 */
public class ScriptCompiler {

  private static final Logger LOG = Logger.getLogger(ScriptCompiler.class.getName());

  private final SortedSet<String> targets = new TreeSet<String>();
  private final Map<String, Boolean> symbols = new HashMap<String, Boolean>();
  private final Map<String, Collection<String>> aliases = new HashMap<String, Collection<String>>();
  private final Map<File, File> fileMap = new HashMap<File, File>();
  private boolean deleteSourceFiles = false;
  private boolean strict = false;

  public ScriptCompiler() {
  }

  /**
   * Adds a list of targets to this compiler.
   *
   * @param targets a comma-separated list of targets.
   * @see #addTarget
   */
  public void addTargetsString(String targets) {
    if (targets != null) {
      String[] t = targets.toUpperCase().split("[,;]");
      for (String s : t)
        this.targets.add(s);
    }
  }

  /**
   * Adds a target to this compiler. This compiler will run in target compilation mode.
   *
   * @param target
   */
  public void addTarget(String target) {
    this.targets.add(target);
  }

  /**
   * Adds a list of symbols to this compiler by parsing them from their string representation. The string representation
   * is a comma-separated list of targets, each one or which may be preceeded by a "!" or "+". "!" turns the symbol off
   * in this compiler. "+" (the default) turns the symbol on in this compiler.
   *
   * @param symbols
   * @see #addSymbol
   */
  public void setSymbolsString(String symbols) {
    this.symbols.clear();

    if (symbols != null) {
      String[] s = symbols.toUpperCase().split("[,;]");
      for (String symbol : s) {
        if (symbol.startsWith("!")) {
          this.symbols.put(symbol.substring(1), false);
        } else if (symbol.startsWith("+")) {
          this.symbols.put(symbol.substring(1), true);
        } else {
          this.symbols.put(symbol, true);
        }
      }
    }
  }

  /**
   * Adds a symbol to this compiler. This compiler will run in symbol compilation mode.
   *
   * @param symbol
   * @param on whether blocks marked by <code>symbol</code> should be included in the compiled file. By default all
   * symbols are on so they must be turned off explicitly.
   */
  public void addSymbol(String symbol, boolean on) {
    this.symbols.put(symbol, on);
  }

  /**
   * Adds a list of aliases to this compiler by parsing them from their string representation. The string representation
   * is <code>A1=S1+S2+... A2=S1+S3... ...</code>
   *
   * @param aliases
   */
  public void addAliasesString(String aliases) {
    if (aliases != null && aliases.length() > 0) {
      String[] groups = aliases.toUpperCase().split("[ ,;]+");
      for (String group : groups) {
        String[] parts = group.split("=", 2);
        String[] targets = parts[1].split("\\+");
        this.addAlias(parts[0], Utils.getSortedCopy(Arrays.asList(targets)));
      }
    }
  }

  /**
   * Adds a single alias to this compiler.
   *
   * @param alias the alias.
   * @param targets the set of targets that the alias aliases.
   */
  public void addAlias(String alias, Collection<String> targets) {
    aliases.put(alias, targets);
  }

  /**
   * Sets whether to delete the source files once they have been compiled. The default value is <code>false</code>.
   *
   * @param deleteSourceFiles
   */
  public void setDeleteSourceFiles(boolean deleteSourceFiles) {
    this.deleteSourceFiles = deleteSourceFiles;
  }

  /**
   * Add a file to process to this compiler. The file <code>from</code> will be compiled and the result will be written
   * to the file <code>to</code>. If this compiler runs in target mode, the actual files written will be derive from the
   * file <code>to</code> but their names will include the target name.
   *
   * @param from
   * @param to
   */
  public void addFileMap(File from, File to) {
    fileMap.put(from, to);
  }

  /**
   * Runs the compilation.
   *
   * @throws IOException
   */
  public void run() throws IOException {
    if (fileMap.size() == 0) throw new IllegalStateException("Must specify one or more files to compile.");

    if (symbols.size() == 0 && targets.size() == 0)
      throw new IllegalStateException("Must specify at least one symbol or one target.");

    if (symbols.size() > 0 && targets.size() > 0)
      throw new IllegalStateException("Cannot compile scripts with both symbols and targets defined.");

    LOG.info("Running script compiler on " + fileMap.size() + " scripts with targets " + targets +
        ", aliases " + aliases + ", and symbols " + symbols + ".");

    for (File scriptFile : Utils.getSortedCopy(fileMap.keySet())) {
      try {
        File outFile = fileMap.get(scriptFile);
        if (symbols.size() > 0)
          compileFileSymbols(scriptFile, outFile);
        if (targets.size() > 0)
          compileFileTargets(scriptFile, outFile);
      } catch (Exception e) {
        log(Level.WARNING, "Error compiling " + scriptFile + ": " + e, e);
      }
    }
  }

  private static Pattern LINE_MARKER =
      Pattern.compile("^[ \\t]*/\\*[ \\t]+@JSC[ \\t]+(?:\\:\\:\\s*(begin|end)(?:\\s+(\\S+))?\\s*)?\\*/[ \\t]*");

  private static Pattern COMMAND =
      Pattern.compile("^(\\}[ \\t]*)?(if|else[ \\t]+if|else)?[ \\t]*(?:\\((.*?)\\))?[ \\t]*(\\{)?");

  /**
   * Runs target compilation on one source file.
   *
   * @param scriptFile
   * @param outFile
   * @throws IOException
   */
  private void compileFileTargets(File scriptFile, File outFile) throws IOException {
    // Each target will have a state ... whether we are currently writing to that target
    Map<String, Boolean> states = new HashMap<String, Boolean>(targets.size());
    // Whether we are currently in a marked if/else statement
    boolean inBranch = false;
    // Keeps track of the targets seen in each if/else statement, so we can calculate which targets are on in
    // the final else block.
    Set<String> seenThisBlock = new HashSet<String>(targets.size()); // ok non-deterministic access, no iteration over values

    // We'll have a writer open for each target
    Map<String, Writer> writers = new HashMap<String, Writer>(targets.size());
    // Open a writer for each target
    for (String target : targets) {
      File outFileTarget = getFileWithTarget(outFile, target);
      writers.put(target, new FileWriter(outFileTarget));
      states.put(target, false);
    }

    // Open the input source file.
    BufferedReader scriptReader = new BufferedReader(new FileReader(scriptFile));

    String line;
    int lineNum = 0;

    while ((line = scriptReader.readLine()) != null) {
      lineNum++;
      Matcher m1 = LINE_MARKER.matcher(line);

      if (m1.find()) {
        Matcher m2 = COMMAND.matcher(line.substring(m1.end()));
        if (m2.find()) {
          String branchType = m2.group(2);
          String targetsString = m2.group(3);
          boolean closeBracket = m2.group(1) != null && m2.group(1).length() > 0;
          boolean openBracket = m2.group(4) != null && m2.group(4).length() > 0;
          if (branchType != null)
            branchType = branchType.replaceAll("\\s", "");

          // Begin if block ...
          if ("if".equals(branchType)) {
            if (!(openBracket && !closeBracket))
              throw new RuntimeException("Bad bracket type: " + openBracket + "/" + closeBracket + " " + scriptFile + " @ line " + lineNum);
            if (inBranch) throw new RuntimeException("Encountered if{ while in branch: " +
                scriptFile + " @ line " + lineNum);

            Set<String> theseTargets = getTargetsFromCondition(targetsString, seenThisBlock);
            for (String target : theseTargets) {
              if (!writers.containsKey(target) && !aliases.containsKey(target)) {
                log(Level.WARNING, "Bad target: " + target + " " + scriptFile + " @ line " + lineNum);
              } else {
                states.put(target, true);
                seenThisBlock.add(target);
              }
            }
            inBranch = true;
          }
          // Begin else if block ...
          else if ("elseif".equals(branchType)) {
            if (!(openBracket && closeBracket))
              throw new RuntimeException("Bad bracket type: " + openBracket + "/" + closeBracket + " " + scriptFile + " @ line " + lineNum);
            if (!inBranch) throw new RuntimeException("Encountered else if{ while not in branch: " +
                scriptFile + " @ line " + lineNum);

            Set<String> theseTargets = getTargetsFromCondition(targetsString, seenThisBlock);

            for (String target : theseTargets) {
              if (!writers.containsKey(target) && !aliases.containsKey(target))
                log(Level.WARNING, "Bad target: " + target + " " + scriptFile + " @ line " + lineNum);
            }

            for (String target : targets) {
              boolean turnOn = theseTargets.contains(target);

              if (turnOn && seenThisBlock.contains(target)) {
                throw new RuntimeException("Already saw target in block: " + target + " " + scriptFile + " @ line " + lineNum);
              }

              states.put(target, turnOn);

              if (turnOn)
                seenThisBlock.add(target);
            }
          }
          // Begin else block ...
          else if (branchType != null && branchType.length() > 0) {
            if (!(openBracket && closeBracket))
              throw new RuntimeException("Bad bracket type: " + openBracket + "/" + closeBracket + " " + scriptFile + " @ line " + lineNum);
            if (!inBranch) throw new RuntimeException("Encountered else{ while not in branch: " +
                scriptFile + " @ line " + lineNum);

            for (String target : targets) {
              states.put(target, !seenThisBlock.contains(target));
              seenThisBlock.add(target);
            }
          }
          // End if/else statement ...
          else {
            if (!(!openBracket && closeBracket))
              throw new RuntimeException("Bad bracket type: " + openBracket + "/" + closeBracket + " " + scriptFile + " @ line " + lineNum);
            if (!inBranch) throw new RuntimeException("Encountered } while not in branch: " +
                scriptFile + " @ line " + lineNum);

            for (String target : targets)
              states.put(target, false);
            seenThisBlock.clear();
            inBranch = false;
          }
        } else {
          throw new RuntimeException("Line starting with @JSC marker has invalid command: " +
              scriptFile + " @ line " + lineNum);
        }
      } else {
        for (String target : targets) {
          if (!inBranch || states.get(target)) {
            Writer writer = writers.get(target);
            writer.write(line);
            writer.write("\n");
          }
        }
      }
    }

    // Close the input.
    scriptReader.close();

    // Close each target writer.
    for (Writer writer : writers.values())
      writer.close();

    // Delete the input file if necessary.
    if (deleteSourceFiles)
      if (!scriptFile.delete())
        log(Level.SEVERE, "Could not delete " + scriptFile);
  }

  private static File getFileWithTarget(File scriptFile, String target) {
    File dir = scriptFile.getParentFile();
    String name = scriptFile.getName();
    int index = name.lastIndexOf(".");
    if (index >= 0) {
      return new File(dir, name.substring(0, index) + "." + target + name.substring(index));
    } else {
      return new File(dir, name + "." + target);
    }
  }

  private static final Pattern NONSPACE = Pattern.compile("\\S");
  private static final Pattern COMMENT = Pattern.compile("^\\s*(\\*|/\\*|//)");

  /**
   * Runs symbol compilation on one source file.
   *
   * @param scriptFile
   * @param outFile
   * @throws IOException
   */
  private void compileFileSymbols(File scriptFile, File outFile) throws IOException {
    File tmpFile = File.createTempFile("ScriptCompiler", "js");
    Writer writer = new FileWriter(tmpFile);

    // Open the input file.
    BufferedReader scriptReader = new BufferedReader(new FileReader(scriptFile));

    String line;
    Stack<Boolean> symbolOn = new Stack<Boolean>();
    boolean wroteAnything = false;

    while ((line = scriptReader.readLine()) != null) {
      Matcher m1 = LINE_MARKER.matcher(line);

      if (m1.find()) {
        if ("begin".equals(m1.group(1))) {
          String expr = m1.group(2);

          // When symbols overlap, if the enclosing symbol is off, the enclosed one must be as well.
          if (symbolOn.size() > 0 && !symbolOn.peek())
            symbolOn.push(false);
          else
            symbolOn.push(this.passesSymbolExpression(expr));
          continue;
        } else if ("end".equals(m1.group(1))) {
          symbolOn.pop();
          continue;
        } else if (symbolOn.size() > 0 && !symbolOn.peek()) {
          continue;
        }
      } else if (symbolOn.size() > 0 && !symbolOn.peek()) {
        continue;
      }

      boolean matchNonSpace = NONSPACE.matcher(line).find();
      boolean matchComment = COMMENT.matcher(line).find();
      wroteAnything = wroteAnything || (matchNonSpace && !matchComment);

      writer.write(line);
      writer.write("\n");
    }

    // Close the input file.
    scriptReader.close();
    // Close the output file.
    writer.close();

    // Rename the temporary file to the output file.
    if (outFile.exists() && !outFile.delete())
      log(Level.SEVERE, "could not delete " + scriptFile);
    if (wroteAnything) {
      if (!Utils.moveFile(tmpFile, outFile))
        log(Level.SEVERE, "could not rename " + tmpFile + " to " + outFile);
    } else {
      LOG.fine("Deleting file " + outFile + " because it was empty.");
      if (!tmpFile.delete())
        log(Level.SEVERE, "could not delete " + tmpFile);
    }
  }

  private boolean passesSymbolExpression(String expr) {
    if (expr.startsWith("!")) {
      String s = expr.substring(1);
      return symbols.get(s) != null && !symbols.get(s);
    } else {
      return symbols.get(expr) == null || symbols.get(expr);
    }
  }

  private static Pattern TARGET_FINDER = Pattern.compile("^\\s*(!\\s*)?(?:[\\w\\.]+\\.)?(\\w+)\\s*$");

  /**
   * Parses a boolean expression and returns the set of targets that are "on" for the following code block.
   *
   * @param cond the boolean expression.
   * @param already the targets that have already been seen in this if/else block.
   * @return the set of targets.
   */
  private Set<String> getTargetsFromCondition(String cond, Set<String> already) {
    Boolean inverse = null;

    Set<String> targets = new HashSet<String>(1);
    String[] ors = cond.split("\\s*(\\|\\||&&)\\s*");

    for (String or : ors) {
      Matcher m = TARGET_FINDER.matcher(or);
      if (!m.find()) throw new IllegalArgumentException("Bad condition '" + or + "' in '" + cond + "'.");

      String not = m.group(1);
      boolean thisInverse = not != null && not.length() > 0;

      if (inverse != null && !inverse.equals(thisInverse))
        throw new RuntimeException("Condition has inverse and non-inverse conditions: " + cond);

      String target = m.group(2);
      Collection<String> expanded = aliases.containsKey(target) ? aliases.get(target) : Collections.singleton(target);

      if (thisInverse) {
        if (inverse == null) {
          targets.addAll(this.targets);
          targets.removeAll(already);
        }

        for (String t : expanded)
          targets.remove(t);
      } else {
        for (String t : expanded)
          if (!already.contains(t))
            targets.add(t);
      }

      inverse = Boolean.valueOf(thisInverse);
    }

    return targets;
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
