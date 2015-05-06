/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import java.io.File;

import com.tibco.gi.tools.IdeDocCompiler;
import org.apache.tools.ant.BuildException;

/**
 * Ant interface for the {@link IdeDocCompiler} tool.
 *
 * @author Jesse Costello-Good
 */
public class IdeDocCompilerTask extends AbstractFileTask {

  private IdeDocCompiler.Type type;
  private File apidocpath;
  private File catalog;
  private String basepath;
  private File docdir;
  private boolean strict = false;

  public IdeDocCompilerTask() {
  }

  public void execute() throws BuildException {
    IdeDocCompiler compiler = new IdeDocCompiler();
    compiler.setApiDocPath(apidocpath.toURI());
    compiler.setStrict(strict);
    if (type != null)
      compiler.setType(type);
    compiler.setDestDir(this.getDestdir());
    compiler.setCatalogFile(catalog);
    if (basepath != null)
      compiler.setBasePath(this.getProject().getBaseDir().toURI().resolve(basepath));
    compiler.setDocDir(docdir);

    try {
      compiler.run();
    } catch (Throwable e) {
      e.printStackTrace();
      throw new BuildException(e);
    }
  }

  public void setType(String type) {
    this.type = IdeDocCompiler.Type.valueOf(type.toUpperCase());
    if (this.type == null && type.length() > 0)
      throw new IllegalArgumentException(type);
  }

  public void setApidocpath(File apidocpath) {
    this.apidocpath = apidocpath;
  }

  public void setCatalog(File catalog) {
    this.catalog = catalog;
  }

  public void setBasepath(String basepath) {
    this.basepath = basepath;
  }

  public void setDocdir(File docdir) {
    this.docdir = docdir;
  }

  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}
