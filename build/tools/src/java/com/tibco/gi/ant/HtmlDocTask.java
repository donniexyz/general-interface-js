/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import java.io.File;

import com.tibco.gi.tools.HtmlDocCompiler;
import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;

/**
 * Ant interface for the {@link HtmlDocCompiler} tool.
 *
 * @author Jesse Costello-Good
 */
public class HtmlDocTask extends Task {

  private File srcdir;
  private File destdir;
  private File docdir;
  private String title;
  private String copyright;
  private boolean strict = false;

  public void execute() throws BuildException {
    HtmlDocCompiler compiler = new HtmlDocCompiler();
    compiler.setSrcDir(srcdir);
    compiler.setDestDir(destdir);
    compiler.setDocDir(docdir);
    compiler.setTitle(title);
    compiler.setCopyright(copyright);
    compiler.setStrict(strict);

    try {
      compiler.run();
    } catch (Exception e) {
      e.printStackTrace();
      throw new BuildException(e);
    }
  }

  public void setSrcdir(File srcdir) {
    this.srcdir = srcdir;
  }

  public void setDestdir(File destdir) {
    this.destdir = destdir;
  }

  public void setDocdir(File docdir) {
    this.docdir = docdir;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public void setCopyright(String copyright) {
    this.copyright = copyright;
  }

  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}
