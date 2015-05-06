/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import java.io.File;

import com.tibco.gi.tools.TypeAheadCompiler;
import org.apache.tools.ant.BuildException;

/**
 * Ant interface for the {@link TypeAheadCompiler} tool.
 *
 * @author Jesse Costello-Good
 */
public class TypeAheadTask extends AbstractFileTask {

  private File outfile;
  private boolean strict = false;

  public TypeAheadTask() {
  }

  public void execute() throws BuildException {
    TypeAheadCompiler compiler = new TypeAheadCompiler();
    compiler.setOutFile(outfile);
    compiler.setStrict(strict);

    for (File inFile : this.getFileSet())
      compiler.addSrcFile(inFile);

    try {
      compiler.run();
    } catch (Throwable e) {
      e.printStackTrace();
      throw new BuildException(e);
    }
  }

  /**
   * Ant setter method for the compilation output file.
   *
   * @param outfile
   * @see TypeAheadCompiler#setOutFile
   */
  public void setOutfile(File outfile) {
    this.outfile = outfile;
  }

  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}
