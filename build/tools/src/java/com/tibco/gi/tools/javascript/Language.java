/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools.javascript;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * @author Jesse Costello-Good
 */
public class Language {

  public static final Set<String> RESERVED_WORDS = Collections.unmodifiableSet(new HashSet<String>(Arrays.asList(
      "abstract", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger",
      "default", "delete", "do", "double", "else", "enum", "export", "extends", "false", "final", "finally", "float",
      "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "long",
      "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super",
      "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void",
      "volatile", "while", "with"
  )));

  public static final Set<String> GLOBALS = Collections.unmodifiableSet(new HashSet<String>(Arrays.asList(
      "Array", "Boolean", "Date", "Function", "Math", "Number", "Object", "RegExp", "String",
      "Error", "EvalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError",
      "ActiveXObject", "Enumerator",
      "Components", "netscape", "Element", "XPathEvaluator", "XMLSerializer", "XSLTProcessor", "HTMLElement",
      "SVGElement", "DOMParser", "XMLHttpRequest", "HTMLDocument", "XMLDocument",
      "window", "document", "navigator",
      "arguments", "escape", "eval", "Infinity", "isFinite", "isNaN", "NaN", "parseFloat", "parseInt", "undefined",
      "unescape"
  )));

  public static String escapeString(String s) {
    return escapeString(s, false);
  }

  /**
   * Escapes any string appropriate for JavaScript syntax.
   *
   * @param s
   * @return
   */
  public static String escapeString(String s, boolean singleQuoted) {
    // handle escaped unicode sequences
    StringBuffer buffer = new StringBuffer(s.length());
    for (int i = 0; i < s.length(); i++) {
      char c = s.charAt(i);
      if (c == '\n') {
        buffer.append("\\n");
      } else if (c == '\r') {
        buffer.append("\\r");
      } else if (c == '\t') {
        buffer.append("\\t");
      } else if (c == '\b') {
        buffer.append("\\b");
      } else if (!singleQuoted && c == '"') {
        buffer.append("\\\"");
      } else if (singleQuoted && c == '\'') {
        buffer.append("\\'");
      } else if (c == '\\') {
        buffer.append("\\\\");
      } else if (c >= 0x20 && c < 0x80) {
        buffer.append(c);
      } else {
        String hex = Integer.toString(0x10000 + c, 16).substring(1).toUpperCase();
        buffer.append("\\u").append(hex);
      }
    }

    return buffer.toString();
  }
}
