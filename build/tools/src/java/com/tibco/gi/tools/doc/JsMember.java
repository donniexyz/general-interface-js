/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools.doc;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Models a JavaScript member extended by the metadata provided by inline JSX documentation.
 *
 * @author Jesse Costello-Good
 */
public class JsMember {

  public static enum Access {
    PRIVATE, PACKAGE, PROTECTED, PUBLIC
  }

  public static enum Type {
    CLASS(true), INTERFACE(true), PACKAGE(true), CONSTRUCTOR(false, true), METHOD(false, true), FIELD, UNKNOWN;

    private final boolean isClassType;
    private final boolean isMethodType;

    Type() {
      this(false, false);
    }

    Type(boolean isClassType) {
      this(isClassType, false);
    }

    Type(boolean isClassType, boolean isMethodType) {
      this.isClassType = isClassType;
      this.isMethodType = isMethodType;
    }

    public boolean isClassType() {
      return isClassType;
    }

    public boolean isMethodType() {
      return isMethodType;
    }
  }
  
  public static final Comparator<JsMember> BY_NAME = new Comparator<JsMember>() {
    public int compare(JsMember o1, JsMember o2) {
      return o1.name.compareToIgnoreCase(o2.name);
    }
  };

  private Type type;
  private String name = "";
  private Access access = Access.PUBLIC;
  private String description;
  private String constantValue;
  private boolean deprecated;
  private String depDescription;
  private boolean _abstract;
  private boolean async;
  private boolean _final;
  private boolean _native;
  private boolean _static;
  private String version;
  private String since;
  private JsMember parent;
  private Collection<JsMember> children;
  private String superClass;
  private List<String> authors;
  private List<String> interfaces;
  private List<JsParam> params;
  private JsType returnType;
  private String returnText;
  private List<JsType> throwsTypes;
  private List<String> throwsTexts;
  private List<String> see;

  public Type getType() {
    return type;
  }

  public void setType(Type type) {
    this.type = type;
  }

  public String getName() {
    return name;
  }

  private String getShortName() {
    int index = name.lastIndexOf(".");
    return index >= 0 ? name.substring(index + 1) : name;
  }

  public String getNamePrefix() {
    int index = name.lastIndexOf(".");
    return index >= 0 ? name.substring(0, index) : "";
  }

  public String getPackageName() {
    JsMember pkg = getPackage();
    return pkg != null ? pkg.getName() : getNamePrefix();
  }

  public String getMemberName() {
    JsMember pkg = getPackage();
    return pkg != null && !"window".equals(pkg.getName()) ?
        getName().substring(pkg.getName().length() + 1) : getShortName();
  }

  public void setName(String name) {
    this.name = name;
  }

  public Access getAccess() {
    return access;
  }

  public void setAccess(Access access) {
    this.access = access;
  }

  public String getDescription() {
    return description;
  }

  public String getSummary() {
    if (description == null) return "";

    Pattern p = Pattern.compile("\\.[\\s\\r\\n\\W]|[\\s\\S]<(ul|ol|pre|p|br|div)\\/?>", Pattern.CASE_INSENSITIVE);
    Matcher m = p.matcher(description);
    if (m.find()) {
      return description.substring(0, m.start() + 1);
    } else {
      return description;
    }
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getConstantValue() {
    return constantValue;
  }

  public void setConstantValue(String constantValue) {
    this.constantValue = constantValue;
  }

  public boolean isDeprecated() {
    return deprecated;
  }

  public void setDeprecated(boolean deprecated) {
    this.deprecated = deprecated;
  }

  public String getDepDescription() {
    return depDescription;
  }

  public void setDepDescription(String depDescription) {
    this.depDescription = depDescription;
  }

  public boolean isAsync() {
    return async;
  }

  public void setAsync(boolean async) {
    this.async = async;
  }

  public boolean isAbstract() {
    return _abstract;
  }

  public void setAbstract(boolean abs) {
    this._abstract = abs;
  }

  public boolean isFinal() {
    return _final;
  }

  public void setFinal(boolean fin) {
    this._final = fin;
  }

  public boolean isNative() {
    return _native;
  }

  public void setNative(boolean nat) {
    this._native = nat;
  }

  public boolean isStatic() {
    return _static;
  }

  public void setStatic(boolean stat) {
    this._static = stat;
  }

  public String getVersion() {
    return version;
  }

  public void setVersion(String version) {
    this.version = version;
  }

  public String getSince() {
    return since;
  }

  public void setSince(String since) {
    this.since = since;
  }

  public void addMember(JsMember member) {
    if (member.parent != null)
      member.parent.children.remove(member);
    member.parent = this;

    if (children == null) children = new ArrayList<JsMember>();
    children.add(member);
  }

  public void removeMember(JsMember member) {
    if (this.equals(member.parent)) {
      member.parent = null;
      children.remove(member);
    }
  }

  public Collection<JsMember> getMembers() {
    if (children == null) return Collections.emptyList();
    return children;
  }

  public JsMember getStaticMember(String name) {
    if (children != null)
      for (JsMember child : children) {
        if (child.isStatic() && name.equals(child.getName()))
          return child;
      }
    return null;
  }

  public JsMember getInstanceMember(String name) {
    if (children != null)
      for (JsMember child : children) {
        if (!child.isStatic() && name.equals(child.getName()))
          return child;
      }
    return null;
  }

  public void addAuthor(String author) {
    if (authors == null) authors = new ArrayList<String>();
    authors.add(author);
  }

  public List<String> getAuthors() {
    if (authors == null) return Collections.emptyList();
    return authors;
  }

  public void addSee(String see) {
    if (this.see == null) this.see = new ArrayList<String>();
    this.see.add(see);
  }

  public List<String> getSee() {
    if (see == null) return Collections.emptyList();
    return see;
  }

  public JsMember getParent() {
    return parent;
  }

  public String getSuperClass() {
    return superClass;
  }

  public void setSuperClass(String superClass) {
    this.superClass = superClass;
  }

  public List<String> getInterfaces() {
    if (interfaces == null) return Collections.emptyList();
    return interfaces;
  }

  public void addInterface(String inter) {
    if (interfaces == null) interfaces = new ArrayList<String>();
    interfaces.add(inter);
  }

  public JsParam addParam(String param) {
    if (params == null) params = new ArrayList<JsParam>();

    JsParam p = new JsParam();
    p.setName(param);
    params.add(p);
    return p;
  }

  public List<JsParam> setParamOrder(List<String> order) {
    ArrayList<JsParam> newOrder = new ArrayList<JsParam>();
    for (String s : order) {
      JsParam p = getParam(s);
      if (p == null) {
        p = new JsParam();
        p.setName(s);
      }
      newOrder.add(p);
    }

    if (params != null)
      params.removeAll(newOrder);
    List<JsParam> tmp = params;

    params = newOrder;
    return (List<JsParam>) (tmp != null ? tmp : Collections.emptyList());
  }

  public JsParam getParam(String param) {
    if (params == null) return null;
    for (JsParam p : params) {
      if (param.equals(p.getName())) return p;
    }
    return null;
  }

  public List<JsParam> getParams() {
    if (params == null) return Collections.emptyList();
    return params;
  }

  public void removeParam(JsParam p) {
    if (params != null)
      params.remove(p);
  }

  public void merge(JsMember member) {
    Collection<JsMember> members = new ArrayList<JsMember>(member.getMembers());
    for (JsMember jsMember : members) {
      this.addMember(jsMember);
    }

    if (type == Type.UNKNOWN) type = member.type;
  }

  public JsMember getPackage() {
    JsMember up = parent;
    while (up != null && up.getType() != Type.PACKAGE)
      up = up.parent;
    return up;
  }

  public JsMember getJsClass() {
    JsMember up = this;
    while (up != null && (up.getType() == null || !up.getType().isClassType()))
      up = up.parent;
    return up;
  }

  public JsType getReturnType() {
    return returnType;
  }

  public void setReturnType(JsType returnType) {
    this.returnType = returnType;
  }

  public String getReturnText() {
    return returnText;
  }

  public void setReturnText(String returnText) {
    this.returnText = returnText;
  }

  public void setReturn(JsType type, String text) {
    this.returnType = type;
    this.returnText = text;
  }

  public void addThrows(JsType type, String text) {
    if (throwsTypes == null) throwsTypes = new ArrayList<JsType>();
    if (throwsTexts == null) throwsTexts = new ArrayList<String>();

    throwsTypes.add(type);
    throwsTexts.add(text);
  }

  public List<JsType> getThrowsTypes() {
    if (throwsTypes == null) return Collections.emptyList();
    return throwsTypes;
  }

  public List<String> getThrowsTexts() {
    if (throwsTexts == null) return Collections.emptyList();
    return throwsTexts;
  }

  public String toString() {
    StringBuilder sb = new StringBuilder();
    if (_static) sb.append("static ");
    if (_abstract) sb.append("abstract ");
    if (type == Type.CLASS) {
      sb.append("class ").append(name);
      if (superClass != null)
        sb.append(" extends ").append(superClass);
      if (interfaces != null && interfaces.size() > 0) {
        sb.append(" implements ");
        for (Iterator<String> i = interfaces.iterator(); i.hasNext();) {
          String inter = i.next();
          sb.append(inter);
          if (i.hasNext()) sb.append(", ");
        }
      }
    } else if (type == Type.INTERFACE) {
      sb.append("interface ").append(name);
      if (superClass != null)
        sb.append(" extends ").append(superClass);
    } else if (type == Type.PACKAGE) {
      sb.append("package ").append(name);
    } else if (type.isMethodType()) {
      sb.append("method ").append(name).append("(");
      if (params != null && params.size() > 0) {
        for (Iterator<JsParam> i = params.iterator(); i.hasNext();) {
          JsParam param = i.next();
          sb.append(param.getName());
          if (i.hasNext()) sb.append(", ");
        }
      }
      sb.append(")");
    } else if (type == Type.FIELD) {
      sb.append("field ").append(name);
    }

    return sb.toString();
  }
}
