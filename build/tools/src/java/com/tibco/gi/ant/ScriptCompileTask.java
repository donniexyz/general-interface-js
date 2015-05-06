/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import java.io.File;
import java.util.Map;

import com.tibco.gi.tools.ScriptCompiler;
import org.apache.tools.ant.BuildException;

/**
 * Ant interface for the {@link ScriptCompiler} tool.
 *
 * @author Jesse Costello-Good
 */
public class ScriptCompileTask extends AbstractFileTask {

  private String targets;
  private String symbols;
  private String aliases;
  private boolean delete = false;
  private boolean strict = false;

  public ScriptCompileTask() {
  }

  public void execute() {
    ScriptCompiler compiler = new ScriptCompiler();
    compiler.setSymbolsString(symbols);
    compiler.addTargetsString(targets);
    compiler.setDeleteSourceFiles(delete);
    compiler.addAliasesString(aliases);
    compiler.setStrict(strict);

    Map<File, File> fileMap = this.getFileMap();
    for (File inFile : fileMap.keySet()) // ok non-deterministic access
      compiler.addFileMap(inFile, fileMap.get(inFile));

    try {
      compiler.run();
    } catch (Exception e) {
      e.printStackTrace();
      throw new BuildException(e);
    }
  }

  /**
   * Ant setter method for the target platforms for the script compilation.
   *
   * @param targets a comma-separated list of targets.
   * @see ScriptCompiler#addTargetsString
   */
  public void setTargets(String targets) {
    this.targets = targets;
  }

  /**
   * Ant setter method for the symbols to include in the script compilation.
   *
   * @param symbols a comma-separated list of symbols.
   * @see ScriptCompiler#setSymbolsString
   */
  public void setSymbols(String symbols) {
    this.symbols = symbols;
  }

  /**
   * Ant setter method for whether to delete the source files after compiling them.
   *
   * @param delete
   * @see ScriptCompiler#setDeleteSourceFiles
   */
  public void setDelete(boolean delete) {
    this.delete = delete;
  }

  /**
   * Ant setter method for the aliases of this script compilation.
   *
   * @param aliases
   * @see ScriptCompiler#addAliasesString
   */
  public void setAliases(String aliases) {
    this.aliases = aliases;
  }

  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}
