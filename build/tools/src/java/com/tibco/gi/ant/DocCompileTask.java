/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import java.io.File;

import com.tibco.gi.tools.DocCompiler;
import com.tibco.gi.tools.doc.JsMember;
import org.apache.tools.ant.BuildException;

/**
 * Ant interface for the {@link DocCompiler} tool.
 *
 * @author Jesse Costello-Good
 */
public class DocCompileTask extends AbstractFileTask {

  private JsMember.Access access;
  private boolean strict = false;

  public DocCompileTask() {
  }

  public void execute() throws BuildException {
    DocCompiler compiler = new DocCompiler();
    compiler.setDestDir(this.getDestdir());
    compiler.setStrict(strict);

    if (access != null)
      compiler.setAccess(access);

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
   * Ant setter method for the access level for which the documentation will be compiled.
   *
   * @param access <code>public</code>, <code>protected</code>, <code>package</code>, or <code>private</code>.
   * @see DocCompiler#setAccess
   */
  public void setAccess(String access) {
    this.access = JsMember.Access.valueOf(access.toUpperCase());
    if (this.access == null && access.length() > 0)
      throw new IllegalArgumentException(access);
  }

  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}
