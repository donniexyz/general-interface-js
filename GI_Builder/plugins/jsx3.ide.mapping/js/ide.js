/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// this file should only be loaded by the IDE

jsx3.Class.defineClass("jsx3.ide.mapper.Editor", jsx3.ide.Editor, null, function(Editor, Editor_prototype) {

  Editor_prototype.render = function(objContainer) {
    var obj = objContainer.load('components/Mapper.xml', null, this.getPlugIn());
    return obj;
  };

  Editor_prototype.getPlugIn = function() {
    return jsx3.IDE.MappingPlugin;
  };

  Editor_prototype.loadFromFile = function() {
    var objFile = this.getOpenFile();

    if (objFile) {
      var content = this.getContent();
      if (!content.getDirty())
        this._doOpenServiceEditorDelay(objFile, content);
    }
  };

  Editor_prototype._doOpenServiceEditorDelay = function(objFile, objEditor) {
    //the editor loads asynchronously, composited from multiple objects; don't tell
    //the editor to load objFile until the mapper managed by the editor has been initialized
    //and is ready for commands
    if (objEditor.getMapper() != null && objEditor.getMapper().INITIALIZED) {
      objEditor.doNewRulesFile(objFile);
    } else {
      window.setTimeout(jsx3.$F(this._doOpenServiceEditorDelay).bind(this, [objFile, objEditor]), 200);
    }
  };

});

jsx3.ide.mapper.openUtility = function() {
  jsx3.ide.doNewEditor("services");
};

jsx3.Class.defineClass("jsx3.ide.mapper.FileType", jsx3.ide.FileType, null, function(FileType, FileType_prototype) {

  FileType_prototype.isTypeOf = function(objFile, objXML) {
    if (objXML) {
      return (objXML.selectSingleNode("/data/record[@jsxid='jsxwsdlroot']") ||
              objXML.selectSingleNode("/data[@jsxnamespace='jsx3.ide.mapper.Mapper']") ||
              objXML.selectSingleNode("/data[@jsxnamespace='jsx3.xml.Mapper']")) != null;

    }
    return false;
  };

});

