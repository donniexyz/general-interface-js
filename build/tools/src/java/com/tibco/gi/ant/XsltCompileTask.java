/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import com.tibco.gi.tools.XsltCompiler;
import org.apache.tools.ant.BuildException;

import java.io.File;
import java.util.Set;

/**
 * Ant interface for the {@link XsltCompiler} tool.
 *
 * @author Jesse Costello-Good
 */
public class XsltCompileTask extends AbstractFileTask {

  public void execute() throws BuildException {
    Set<File> files = getFileSet();

    for (File file : files) {
      XsltCompiler compiler = new XsltCompiler(file);
      try {
        compiler.run();
      } catch (Exception e) {
        e.printStackTrace();
        throw new BuildException(e);
      }
    }
  }
}
