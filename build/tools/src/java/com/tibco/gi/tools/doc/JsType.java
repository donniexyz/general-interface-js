/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools.doc;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * @author Jesse Costello-Good
 */
public class JsType {

  private static Map<String, String> TYPES_CLEANUP = new HashMap<String, String>();

  static {
    TYPES_CLEANUP.put("array", "Array");
    TYPES_CLEANUP.put("object", "Object");
    TYPES_CLEANUP.put("string", "String");
    TYPES_CLEANUP.put("number", "Number");
    TYPES_CLEANUP.put("int", "int");
    TYPES_CLEANUP.put("float", "float");
    TYPES_CLEANUP.put("boolean", "boolean");
    TYPES_CLEANUP.put("regex", "RegExp");
    TYPES_CLEANUP.put("regexp", "RegExp");
    TYPES_CLEANUP.put("null", "null");
    TYPES_CLEANUP.put("undefined", "undefined");
  }

  private String type;
  private boolean varargs;
  private List<JsType> or;
  private List<JsType> generics;

  public JsType() {
  }

  public JsType(String type) {
    this.type = type;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    if (type != null) {
      String lc = type.toLowerCase();
      if (TYPES_CLEANUP.containsKey(lc))
        type = TYPES_CLEANUP.get(lc);
    }
    this.type = type;
  }

  public boolean isVarargs() {
    return varargs;
  }

  public void setVarargs(boolean varargs) {
    this.varargs = varargs;
  }

  public List<JsType> getOr() {
    if (or == null) return Collections.emptyList();
    return or;
  }

  public void addOr(JsType t) {
    if (or == null) or = new ArrayList<JsType>();
    or.add(t);
  }

  public List<JsType> getGenerics() {
    if (generics == null) return Collections.emptyList();
    return generics;
  }

  public void addGeneric(JsType t) {
    if (generics == null) generics = new ArrayList<JsType>();
    generics.add(t);
  }

  public String toString() {
    StringBuilder sb = new StringBuilder();
    toString(sb);
    return sb.toString();
  }

  public void toString(StringBuilder sb) {
    sb.append(type);
    if (generics != null && generics.size() > 0) {
      sb.append("<");
      for (Iterator<JsType> i = generics.iterator(); i.hasNext();) {
        JsType generic = i.next();
        generic.toString(sb);
        if (i.hasNext()) sb.append(", ");
      }
      sb.append(">");
    }

    if (varargs)
      sb.append("...");

    if (or != null) {
      for (JsType jsType : or) {
        sb.append(" | ");
        jsType.toString(sb);
      }
    }
  }
}
