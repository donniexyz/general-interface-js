/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import java.io.File;
import java.util.Map;

import com.tibco.gi.tools.Obfuscator;
import org.apache.tools.ant.BuildException;

/**
 * Ant interface for the {@link Obfuscator} tool.
 *
 * @author Jesse Costello-Good
 */
public class ObfuscateTask extends AbstractFileTask {

  private boolean params = true, vars = true, optimizeLiterals = false;
  private File blessfile, clobberfile;
  private File inmap, outmap;
  private boolean strict = false;

  public ObfuscateTask() {
  }

  public void execute() throws BuildException {
    Obfuscator obfuscator = new Obfuscator();
    obfuscator.setObfuscateParameters(params);
    obfuscator.setObfuscateVariables(vars);
    obfuscator.setOptimizeLiterals(optimizeLiterals);
    obfuscator.setBlessFile(blessfile);
    obfuscator.setClobberFile(clobberfile);
    obfuscator.setMapInFile(inmap);
    obfuscator.setMapOutFile(outmap);
    obfuscator.setStrict(strict);

    Map<File, File> fileMap = this.getFileMap();
    for (File inFile : fileMap.keySet()) // ok non-deterministic access
      obfuscator.addFileMap(inFile, fileMap.get(inFile));

    try {
      obfuscator.run();
    } catch (Exception e) {
      e.printStackTrace();
      throw new BuildException(e);
    }
  }

  /**
   * Ant setter method for whether method parameters are renamed. The default is <code>true</code>.
   *
   * @param params
   * @see Obfuscator#setObfuscateParameters
   */
  public void setParams(boolean params) {
    this.params = params;
  }

  /**
   * Ant setter method for whether local variables are renamed. The default is <code>true</code>.
   *
   * @param vars
   * @see Obfuscator#setObfuscateVariables
   */
  public void setVars(boolean vars) {
    this.vars = vars;
  }

  /**
   * Ant setter method for the file containing names to bless (never obfuscate).
   *
   * @param blessfile
   * @see Obfuscator#setBlessFile
   */
  public void setBlessfile(File blessfile) {
    this.blessfile = blessfile;
  }

  /**
   * Ant setter method for the file containing names to clobber (always obfuscate).
   *
   * @param clobberfile
   * @see Obfuscator#setClobberFile
   */
  public void setClobberfile(File clobberfile) {
    this.clobberfile = clobberfile;
  }

  /**
   * Ant setter method for the file containing a mapping from names to obfuscated names. This file is read into the
   * obfuscator and any names it contains that are obfuscated during this operation are renames using the value in the
   * map.
   *
   * @param inmap
   * @see Obfuscator#setMapInFile
   */
  public void setInmap(File inmap) {
    this.inmap = inmap;
  }

  /**
   * Ant setter method for the file to which to write a mapping from names to obfuscated names. Any name (besides method
   * parameters and local variables) renamed by this operation will be written to this file.
   *
   * @param outmap
   * @see Obfuscator#setMapOutFile
   */
  public void setOutmap(File outmap) {
    this.outmap = outmap;
  }

  /**
   * Ant setter method for whether string and regular epxression literals are extracted and defined statically in
   * JavaScript code.
   * @param optimizeStrings
   * @see Obfuscator#setOptimizeLiterals
   */
  public void setOptliterals(boolean optimizeStrings) {
    this.optimizeLiterals = optimizeStrings;
  }

  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}
