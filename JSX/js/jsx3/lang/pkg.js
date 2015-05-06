/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/** @jsxdoc-category  jsx3.lang */

if (jsx3.lang == null) jsx3.lang = {};

(function(lang) {
  
  lang.STACK_MAX = 50;

  /**
   * @param intUp {int}
   * @return {Function}
   */
  lang.getCaller = function(intUp) {
    var skip = (intUp != null ? intUp : 0) + 1;
    var a = arguments;
    
    if (a.callee) {
      for (a = a.callee; a != null; a = a.caller) {
        if (--skip >= 0) continue;
        return a.caller;
      }      
    } else {
      for (a = a.caller; a != null; a = a.caller) {
        if (--skip >= 0) continue;
        return a.callee;
      }
    }
    
    return null;
  };
  
  /**
   * @param intUp {int}
   * @return {Array<Function>}
   */
  lang.getStack = function(intUp) {
    var stack = [];
    var skip = (intUp != null ? intUp : 0) + 1;
    var a = arguments;
    
    if (a.callee) {
      for (a = a.callee; a && a.caller && stack.length < jsx3.lang.STACK_MAX; a = a.caller) {
        if (--skip >= 0) continue;
        stack[stack.length] = a.caller;
      }
    } else {
      for (a = a.caller; a && a.callee; a = a.caller) {
        if (--skip >= 0) continue;
        stack[stack.length] = a.callee;
      }
    }
    
    return stack;
  };
  
  lang.setVar = function(strPath, objValue) {
    var tokens = strPath.split(".");
    var parent = window;
    for (var i = 0; i < tokens.length - 1; i++) {
      var token = tokens[i];
      if (!parent[token]) parent[token] = {};
      parent = parent[token];
    }    
    parent[tokens[tokens.length-1]] = objValue;
  };
  
  lang.getVar = function(strPath) {
    var tokens = strPath.split(".");
    var parent = window;
    for (var i = 0; i < tokens.length; i++) {
      if (parent == null) return;
      parent = parent[tokens[i]];
    }
    return parent;
  };
  
})(jsx3.lang);
