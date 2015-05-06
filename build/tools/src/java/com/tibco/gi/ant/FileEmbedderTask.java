/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import java.io.File;
import java.util.Map;

import com.tibco.gi.tools.FileEmbedder;
import org.apache.tools.ant.BuildException;

/**
 * Ant interface for the {@link com.tibco.gi.tools.FileEmbedder} tool.
 *
 * @author Jesse Costello-Good
 */
public class FileEmbedderTask extends AbstractFileTask {

  private File baseDir;
  private boolean strict = false;

  public FileEmbedderTask() {
  }

  public void execute() {
    FileEmbedder embedder = new FileEmbedder();
    embedder.setBaseDir(baseDir);
    embedder.setStrict(strict);

    Map<File, File> fileMap = this.getFileMap();

    try {
      for (File inFile : fileMap.keySet()) { // ok non-deterministic access
        embedder.setFile(inFile);
        embedder.setOutFile(fileMap.get(inFile));
        embedder.run();
      }
    } catch (Exception e) {
      e.printStackTrace();
      throw new BuildException(e);
    }
  }

  /**
   * Sets the base directory against which absolute @Embed source paths are resolved.
   * @param baseDir
   */
  public void setBaseDir(File baseDir) {
    this.baseDir = baseDir;
  }

  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}