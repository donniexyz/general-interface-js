/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _url _unsaved _server _mode _openNewTab _setTabName _selection

jsx3.Class.defineClass("jsx3.ide.Editor", null, [jsx3.util.EventDispatcher], function(Editor, Editor_prototype) {

  Editor_prototype.init = function() {
    this._selection = jsx3.$A();
  };

  Editor_prototype.open = function(objContainer, objFile, strType) {
    this._file = objFile;
    this._type = strType;

    if (!this._content) {
      this._content = this.render(objContainer);
      this._content.getEditor = jsx3.$F(function() { return this; }).bind(this);
    }
    
    this.loadFromFile();
  };

  Editor_prototype.loadFromFile = jsx3.Method.newAbstract();
  Editor_prototype.render = jsx3.Method.newAbstract("objContainer");
  Editor_prototype.save = jsx3.Method.newAbstract();

  Editor_prototype.getContent = function() {
    return this._content;
  };

  Editor_prototype.getOpenFile = function() {
    return this._file;
  };

  Editor_prototype.getFileType = function() {
    return this._type;
  };

  Editor_prototype.activate = function() {
  };

  Editor_prototype.deactivate = function() {
  };

  Editor_prototype.preSaveCheck = jsx3.$Y(function(cb) {
    cb.done(false);
  });

  Editor_prototype.saveAs = function(objFile) {
    var oldFile = this._file;
    this._file = objFile;

    if (this.save()) {
      this.publish({subject:"renamed", v: objFile, p:oldFile});
      return true;
    } else {
      this._file = oldFile;
      return false;
    }
  };

  Editor_prototype.revert = function() {
    this.loadFromFile();
    this.setDirty(false);
    this.publish({subject:"reverted"});
  };

  Editor_prototype.getMode = function() {
    return this._mode;
  };

  Editor_prototype.isDirty = function() {
    return this._dirty;
  };

  Editor_prototype.setDirty = function(bDirty) {
    if (this._dirty != bDirty) {
      /* @jsxobf-clobber */
      this._dirty = bDirty;
      this.publish({subject:"dirty", v:bDirty, p:!bDirty});
    }
  };

  Editor_prototype.isReadOnly = function() {
    var file = this.getOpenFile();
    return file && file.isReadOnly() && !this.isUnsaved();
  };

  Editor_prototype.setReadOnly = function(bReadOnly) {
    var file = this.getOpenFile();
    if (file != null) {
      file.setReadOnly(bReadOnly);
      this._setTabName();
    }
  };

  Editor_prototype.isUnsaved = function() {
    return this.getOpenFile() == null;
  };

  Editor_prototype.supportsReload = function() {
    return false;
  };

  Editor_prototype.getTitle = function() {
    var file = this.getOpenFile();
    if (file) {
      var url = file.toURI().toString();
      return url.substring(url.lastIndexOf("/") + 1);
    } else {
      return "[unsaved]";
    }
  };

  Editor_prototype.getServer = function() {
    return null;
  };
  
  Editor_prototype.getPlugIn = function() {
    return null;
  };

  Editor_prototype.setMode = function(strMode) {
    if (this._mode == strMode) return;

    if (this.onBeforeSetMode(strMode) === false)
      return false;

    var oldMode = this._mode;
    this._mode = strMode;

    var objContent = this.getContent();
    if (objContent.getModePane) {
      var pane = objContent.getModePane();

      if (pane) {
        var btn = objContent.getDescendantOfName("btn" + strMode);
        if (btn)
          btn.setState(jsx3.gui.ToolbarButton.STATEON, true);

        var content = pane.getChild("mode_" + strMode);
        if (!content) {
          var plugin = this.getPlugIn();
          var rsrc = plugin.getResource("mode_" + strMode);
          rsrc.load().when(jsx3.$F(function() {
            content = plugin.loadRsrcComponent(rsrc, pane);
            this.onSetMode(content, oldMode);
            this.publish({subject:"mode", value: strMode, oldValue:oldMode});
          }).bind(this));
        } else {
          this.publish({subject:"mode", value: strMode, oldValue:oldMode});
          this.onSetMode(content, oldMode);
        }

        return true;
      }
    }

    return false;
  };

  Editor_prototype.onBeforeSetMode = function(strMode) {
    ;
  };

  Editor_prototype.onBeforeClose = function() {
    ;
  };

  Editor_prototype.onSetMode = function(objContent, strOldMode) {
    ;
  };

  Editor_prototype.getSelection = function() {
    return this._selection;
  };

  Editor_prototype.setSelection = function(s) {
    if (this._selection != s) {
      var temp = this._selection;
      this._selection = jsx3.$A(s);
      this.publish({subject:"selection", value:s, oldValue:temp});
    }
  };

  Editor_prototype.canSearch = function() {
    var c = this.getContent();
    return c.getVisibleCodeEditor && c.getVisibleCodeEditor() != null;
  };

  Editor_prototype.doIncrSearch = function(strFind, strReplace, bCase, bReg) {
    var c = this.getContent();
    var editor = c.getVisibleCodeEditor();
    if (editor)
      return editor.doIncrSearch(strFind, strReplace, bCase, bReg);
  };

});
