/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
package com.tibco.gi.tools.obfuscator;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Encapsulates a scope for obfuscation. Scopes are organized in a tree hierarchy. Child scopes inherit settings
 * from their parent scope.
 *
 * @author Jesse Costello-Good
 */
public abstract class Scope<E extends Scope, F extends Scope> {

  private static final Logger LOG = Logger.getLogger(Scope.class.getName());

  public static enum Rename {
    NONE, BLESSED, CLOBBERED, CLOBBERED_SHARED
  }

  public static final Object NULL = new Object();

  /**
   * The global scope for a run of the obfuscator.
   */
  public static class Global extends Scope<File, Scope> {

    public Global getGlobalScope() {
      return this;
    }

    public File getFileScope() {
      throw new UnsupportedOperationException();
    }

    public String toString() {
      return "Global Scope";
    }
  }

  /**
   * The scope of a single file processed with the obfuscator.
   */
  public static class File extends Scope<Script, Global> {

    private final java.io.File file;

    public File(java.io.File file) {
      this.file = file;
    }

    public java.io.File getFile() {
      return file;
    }

    public Global getGlobalScope() {
      return this.getParentScope();
    }

    public File getFileScope() {
      return this;
    }

    public String toString() {
      return "File Scope " + file;
    }
  }

  /**
   * The scope of a script within a file processed with the obfuscator. JavaScript files have only one script scope
   * but other types of files may have more than one script scope per file.
   */
  public static class Script extends Scope<Scope, File> {

    private final NodeWrapper script;

    public Script(NodeWrapper script) {
      this.script = script;
    }

    public NodeWrapper getScript() {
      return script;
    }

    public java.io.File getFile() {
      return this.getParentScope().getFile();
    }

    public Global getGlobalScope() {
      return this.getParentScope().getParentScope();
    }

    public File getFileScope() {
      return this.getParentScope();
    }

    public String toString() {
      return "Script Scope in " + getParentScope().getFile();
    }
  }

  private F parentScope;
  private final List<E> childrenScopes = new ArrayList<E>();

  private Boolean renameMethodParameters = null;
  private Boolean renameLocalVariables = null;
  private Boolean optimizeLiterals = null;
  private final Collection<Object> clobberProtectedNames = new ArrayList<Object>();
  private final Collection<Object> clobberPrivateNames = new ArrayList<Object>();
  private final Collection<Object> blessNames = new ArrayList<Object>();
  private final Map<String[], Object> finalMap = new HashMap<String[], Object>();
  private final Set<String> finalSet = new HashSet<String>(); // ok non-deterministic access, not iterated
  private final Set<String> finalLastTokenSet = new HashSet<String>(); // ok non-deterministic access, not iterated
  private final Map<Pattern, String> renamePatterns = new HashMap<Pattern, String>();
  private final Collection<String> globals = new ArrayList<String>();
  private final Collection<String> reservedNames = new HashSet<String>();

  public Scope() {
  }

  public F getParentScope() {
    return parentScope;
  }

  public Collection<E> getChildrenScopes() {
    return Collections.unmodifiableList(childrenScopes);
  }

  public void addChild(E s) {
    if (s.parentScope != null) throw new IllegalArgumentException();
    s.parentScope = this;
    childrenScopes.add(s);
  }

  /**
   * Traverses the tree hierarchy up until the global scope is encountered.
   * @return
   */
  public abstract Global getGlobalScope();

  /**
   * Traverses the tree hierarchy up until a file scope is encountered.
   * @return
   */
  public abstract File getFileScope();

  public void setRenameMethodParameters(boolean renameMethodParameters) {
    this.renameMethodParameters = renameMethodParameters;
  }

  public void setRenameLocalVariables(boolean renameLocalVariables) {
    this.renameLocalVariables = renameLocalVariables;
  }

  public void setOptimizeLiterals(boolean optimizeLiterals) {
    this.optimizeLiterals = optimizeLiterals;
  }

  public void addBlessedName(String name) {
    blessNames.add(name);
  }

  public void addClobberedName(String name) {
    clobberPrivateNames.add(name);
  }

  public void addClobberedSharedName(String name) {
    clobberProtectedNames.add(name);
  }

  public void addBlessedName(Pattern name) {
    blessNames.add(name);
  }

  public void addClobberedName(Pattern name) {
    clobberPrivateNames.add(name);
  }

  public void addClobberedSharedName(Pattern name) {
    clobberProtectedNames.add(name);
  }

  public void addGlobal(String name) {
    globals.add(name);
  }

  public void addReservedName(String name) {
    reservedNames.add(name);
  }

  public void addRenamePattern(String match, String replace) {
    // _jsx(\w+) -> _jsx$1
    renamePatterns.put(Pattern.compile(match), replace.replaceAll("\\$1", "*"));
  }

  private static final Pattern INTEGER = Pattern.compile("^\\-?\\d+$");
  private static final Pattern FLOAT = Pattern.compile("^\\-?(\\.\\d+|\\d+\\.\\d*)$");

  public void addFinal(String path, String replace) {
    if (finalSet.contains(path)) return;
    finalSet.add(path);

    String[] tokens = path.split("\\.");

    if (replace.startsWith("\"") && replace.endsWith("\""))
      finalMap.put(tokens, replace.substring(1, replace.length() - 1));
    else if (INTEGER.matcher(replace).matches())
      finalMap.put(tokens, Integer.valueOf(replace));
    else if (FLOAT.matcher(replace).matches())
      finalMap.put(tokens, Double.valueOf(replace));
    else if ("null".equals(replace))
      finalMap.put(tokens, NULL);
    else
      throw new IllegalArgumentException("Illegal final value: " + replace);

    finalLastTokenSet.add(tokens[tokens.length - 1]);
  }

  public boolean isRenameMethodParameters() {
    return renameMethodParameters != null ? renameMethodParameters :
        (parentScope != null && parentScope.isRenameMethodParameters());
  }

  public boolean isRenameLocalVariables() {
    return renameLocalVariables != null ? renameLocalVariables :
        (parentScope != null && parentScope.isRenameLocalVariables());
  }

  public boolean isOptimizeLiterals() {
    return optimizeLiterals != null ? optimizeLiterals :
        (parentScope != null && parentScope.isOptimizeLiterals());
  }

  public boolean isAllowedGlobal(String name) {
    return nameMatches(name, globals) || parentScope != null && parentScope.isAllowedGlobal(name);
  }

  public Rename getRename(String name) {
    if (nameMatches(name, blessNames)) return Rename.BLESSED;
    if (nameMatches(name, clobberProtectedNames)) return Rename.CLOBBERED_SHARED;
    if (nameMatches(name, clobberPrivateNames)) return Rename.CLOBBERED;
    if (parentScope != null) return parentScope.getRename(name);
    return Rename.NONE;
  }

  public String getPatternedRename(String original, String renamed) {
    for (Pattern pattern : renamePatterns.keySet()) { // ok non-deterministic access, should only match one
      Matcher m = pattern.matcher(original);
      if (m.matches())
        return renamePatterns.get(pattern).replaceAll("\\*", renamed);
    }

    if (parentScope != null)
      return parentScope.getPatternedRename(original, renamed);

    return renamed;
  }

  public Object getFinalReplacement(String... names) {
    OUTER:
    for (String[] matches : finalMap.keySet()) { // ok non-deterministic access, should only match one
      for (int i = matches.length - 1, j = names.length - 1; i >= 0 && j >= 0; i--, j--) {
        if (!matches[i].equals(names[j])) continue OUTER;
      }
      return finalMap.get(matches);
    }

    if (parentScope != null)
      return parentScope.getFinalReplacement(names);

    return null;
  }

  public boolean isFinalLastNameMatch(String name) {
    return finalLastTokenSet.contains(name) || (parentScope != null && parentScope.isFinalLastNameMatch(name));
  }

  public boolean isReservedName(String name) {
    return reservedNames.contains(name) || (parentScope != null && parentScope.isReservedName(name));
  }

  private boolean nameMatches(String name, Collection matches) {
    for (Object pattern : matches) {
      if (pattern instanceof String) {
        if (pattern.equals(name)) return true;
      } else {
        if (((Pattern) pattern).matcher(name).matches())
          return true;
      }
    }
    return false;
  }
}
