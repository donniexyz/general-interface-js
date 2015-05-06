/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import java.io.File;

import com.tibco.gi.tools.JsEncoder;
import org.apache.tools.ant.BuildException;

/**
 * Ant interface for the {@link com.tibco.gi.tools.JsEncoder} tool.
 *
 * @author Jesse Costello-Good
 */
public class JsEncodeTask extends AbstractFileTask {

  private File baseDir;
  private String basePath;
  private String function;

  public void execute() throws BuildException {
    JsEncoder jser = new JsEncoder();
    jser.setBaseDir(baseDir);
    jser.setBaseURI(basePath);
    jser.setFunctionName(function);

    for (File input : this.getFileSet())
      jser.addFileMapping(input, new File(input + ".js"));

    try {
      jser.run();
    } catch (Exception e) {
      e.printStackTrace();
      throw new BuildException(e);
    }
  }

  public void setBaseDir(File baseDir) {
    this.baseDir = baseDir;
  }

  public void setBasePath(String basePath) {
    this.basePath = basePath;
  }

  public void setFunction(String function) {
    this.function = function;
  }
}