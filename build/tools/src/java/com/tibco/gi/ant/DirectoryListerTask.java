/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import java.io.File;

import com.tibco.gi.tools.DirectoryLister;
import org.apache.tools.ant.BuildException;

/**
 * Ant interface for the {@link DirectoryLister} tool.
 *
 * @author Jesse Costello-Good
 */
public class DirectoryListerTask extends AbstractFileTask {

  private boolean recurse = false;

  public void execute() throws BuildException {
    DirectoryLister tool = new DirectoryLister();

    try {
      for (File file : getFileSet(true, true)) {
        if (file.isDirectory()) {
          tool.run(file, recurse);
        } else {
          getProject().log("File is not a directory: " + file);
        }
      }
    } catch (Exception e) {
      e.printStackTrace();
      throw new BuildException(e);
    }
  }

  public void setRecurse(boolean recurse) {
    this.recurse = recurse;
  }
}