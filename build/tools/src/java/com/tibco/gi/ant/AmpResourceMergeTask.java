/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import java.io.File;

import com.tibco.gi.tools.amp.ResourceMerger;
import org.apache.tools.ant.BuildException;

/**
 * Ant interface for the {@link ResourceMerger} tool.
 *
 * @author Jesse Costello-Good
 */
public class AmpResourceMergeTask extends AbstractFileTask {

  private String ids;
  private boolean strict = false;

  public void execute() throws BuildException {
    ResourceMerger merger = new ResourceMerger();
    merger.setStrict(strict);

    for (File file : getFileSet())
      merger.addFile(file);

    if (ids != null) {
      for (String pattern : ids.split("\\s+")) {
        if (pattern.length() > 0)
          merger.addIdPattern(pattern);
      }
    }

    try {
      merger.run();
    } catch (Exception e) {
      e.printStackTrace();
      throw new BuildException(e);
    }
  }

  /**
   * Ant setter method for the ID patterns to process. A "*" character is expanded to any token [\w\-\$]+.
   * @param ids  a whitespace-separated list of ID patterns to process.
   */
  public void setIds(String ids) {
    this.ids = ids;
  }

  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}