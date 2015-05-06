/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools.doc;

/**
 * @author Jesse Costello-Good
 */
public class JsParam {

  private String name;
  private JsType type;
  private String description;
  private JsMember.Access access = JsMember.Access.PUBLIC;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public JsType getType() {
    return type;
  }

  public void setType(JsType type) {
    this.type = type;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public JsMember.Access getAccess() {
    return access;
  }

  public void setAccess(JsMember.Access access) {
    this.access = access;
  }

  public String toString() {
    return "@" + name;
  }
}
