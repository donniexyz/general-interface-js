/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _editor

jsx3.ide.getActiveServer = function() {
  var editor = jsx3.ide.getActiveEditor();
  return editor ? editor.getServer() : null;
};

jsx3.ide.getActiveEditor = function() {
  var manager = jsx3.ide.getPlugIn("jsx3.ide.editor");
  return manager.getActiveEditor();
};

jsx3.ide.getEditorForTab = function(objTab) {
  return objTab.getEditor();
};

jsx3.ide.getEditorForJSX = function(objJSX) {
  var server = objJSX.getServer();
  return jsx3.ide.getAllEditors().find(function(e) { return e.getServer() == server; });
};

jsx3.ide.setTabReadWrite = function(objTab) {
  var editor = jsx3.ide.getEditorForTab(objTab);
  if (editor)
    editor.setReadOnly(false);
};

jsx3.ide.getEditorForFile = function(objFile) {
  return jsx3.ide.getAllEditors().find(function(e) {
    return objFile.equals(e.getOpenFile());
  });
};

jsx3.ide.getAllEditors = function() {
  var manager = jsx3.ide.getPlugIn("jsx3.ide.editor");
  return manager ? manager.getEditors() : jsx3.$A();
};

jsx3.ide.doNewEditor = function(strType) {
  var manager = jsx3.ide.getPlugIn("jsx3.ide.editor");
  manager.load().when(function() {
    manager.newEditor(strType);
  });
};

jsx3.ide.isAnyEditorDirty = function() {
  return jsx3.ide.getAllEditors().find(function(e) { return e.isDirty(); }) != null;
};
