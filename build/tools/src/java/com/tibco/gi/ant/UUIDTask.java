package com.tibco.gi.ant;

import java.util.UUID;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;

/**
 * @author Jesse Costello-Good
 */
public class UUIDTask extends Task {

  private String property;

  public void execute() throws BuildException {
    if (property == null || property.length() == 0)
      throw new BuildException("Must set attribute property.");

    this.getProject().setProperty(property, UUID.randomUUID().toString());
  }

  public void setProperty(String property) {
    this.property = property;
  }
}
