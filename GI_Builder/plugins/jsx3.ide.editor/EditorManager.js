/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 *
 */
jsx3.Class.defineClass("jsx3.ide.ui.EditorManager", jsx3.amp.PlugIn, null, function(EditorManager, EditorManager_prototype) {

  var ui = jsx3.ide.ui;

  EditorManager_prototype.init = function() {
    jsx3.amp.PlugIn.prototype.init.apply(this, arguments);
    this._defaultType = null;
    this._editors = jsx3.$A();
    this._dialogEditors = jsx3.$A();
  }

  EditorManager_prototype.onLoaded = function() {
    var containerExt = this.getExtPoint("container").getExts()[0];
    if (containerExt)
      this._container = this.getServer().getJSXByName(containerExt.getData()[0].attr("id"));

    this._types = this.getExtPoint("type").processExts();
    this._defaultType = this._types.find(function (e) { return e.isDefault(); });
  };

  EditorManager_prototype.getEditors = function() {
    return this._editors;
  };

  EditorManager_prototype.getActiveEditor = function() {
    if (this._tabcontainer) {
      var tp = this._tabcontainer;
      var tab = tp.getChild(tp.getSelectedIndex());
      if (tab) return tab.getEditor();
    }
    return null;
  };

  EditorManager_prototype.focusOrOpen = function(objFile, strType) {
    var e = this.getOpenEditor(objFile);
    if (e)
      this.reveal(e);
    else
      this.openEditor(objFile, strType);
  };

  EditorManager_prototype.getOpenEditor = function(objFile) {
    var finder = function(e) {
      return objFile.equals(e.getOpenFile());
    };

    return this._editors.find(finder) || this._dialogEditors.find(finder);
  };

  EditorManager_prototype.newEditor = function(strType) {
    this.openEditor(null, strType);
  };

  EditorManager_prototype.openEditor = jsx3.$Y(function(cb) {
    var objFile = cb.args()[0], strType = cb.args()[1];

    var t = this.getTypeForFileType(strType);
    t._ext.getPlugIn().load().when(jsx3.$F(function() {

      var objContainer, editorList;
      if (t.isDialog()) {
        if (!t.isMultiInstance()) {
          var existingEditor = this._dialogEditors.find(function(e) { return e.getClass().getName() == t.getEditorClass(); });
          if (existingEditor) {
            existingEditor.open(null, objFile, strType);
            existingEditor.getContent().focus();
            cb.done(existingEditor);
            return;
          }
        }

        objContainer = this.getServer().getRootBlock();
        editorList = this._dialogEditors;
      } else {
        var pane = this._getTabPane();
        objContainer = this.loadRsrcComponent("container_tab", pane, false);
        editorList = this._editors;
      }

      var editor = jsx3.Class.forName(t.getEditorClass()).newInstance();
      editor._editortype = t;
      editorList.push(editor);

      editor.subscribe("selection", this, this._onSelectionChanged);
      editor.subscribe("reverted", this, function() { this.publish({subject:"reverted", editor:editor}); });
      editor.subscribe("saved", this, function() { this.publish({subject:"saved", editor:editor}); });
      editor.subscribe("renamed", this, function() { this.publish({subject:"renamed", editor:editor}); });
      editor.subscribe("mode", this, function() { this.publish({subject:"modeChanged", editor:editor}); });

      editor.open(objContainer, objFile, strType);

      if (!t.isDialog()) {
        objContainer.getManager = jsx3.$F(function() { return this; }).bind(this);
        objContainer.getEditor = jsx3.$F(function() { return this; }).bind(editor);

        editor.subscribe("renamed", this, function(e) {
          objContainer.setText(this._getTabTitleHTML(editor), true);
        });

        editor.subscribe("dirty", this, function(e) {
          objContainer.setColor(e.v ? "red" : "", true);
        });

        objContainer.setText(this._getTabTitleHTML(editor));
        pane.paintChild(objContainer);
        objContainer.doShow();
      }

      this.publish({subject:"opened", editor:editor});
      cb.done(editor);
    }).bind(this));
  });

  EditorManager_prototype.onShowEditor = function(objEditor) {
    objEditor.activate();
  };

  EditorManager_prototype.onHideEditor = function(objEditor) {
    objEditor.deactivate();
  };

  EditorManager_prototype._onSelectionChanged = function(objEvent) {
    this.publish({subject:"selectionChanged", editor:objEvent.target,
        active:objEvent.target == jsx3.ide.getActiveEditor()});
  };

  // TODO: remove hard link to tabbed pane
  EditorManager_prototype._getTabPane = function() {
    if (!this._tabcontainer) {
      var contentArea = this.getServer().getJSXByName("jsx_ide_quadrant_qmain");
      this._tabcontainer = this.loadRsrcComponent("tabbedpane", contentArea);
    }
    return this._tabcontainer;
  };

  EditorManager_prototype._onTabChanged = function(pane) {
    var tab = pane.getChild(pane.getSelectedIndex());
    var editor = tab ? tab.getEditor() : null;

    if (this._activeEditor != editor) {
      this.publish({subject:"activeChanged", editor:editor, previous:this._activeEditor});
      this._activeEditor = editor;
    }
  };

  EditorManager_prototype._getContentForEditor = function(e) {
    return e.getContent().getParent();
  };

  EditorManager_prototype._getEditorForContent = function(e) {

  };

  EditorManager_prototype._getTabTitleHTML = function(editor) {
    var readonly = "";
    if (editor.isReadOnly()) {
      // TODO:
      var setTabReadWrite = 'setTabReadWrite'; // obfuscation
      var getTab = 'jsx3.IDE.getJSXById(\'' + /*this._tab.getId()*/"" + '\')';
      readonly = '<span style="width:12px;height:11px;padding:1px 0px 0px 4px;position:relative;overflow:hidden;"' +
          ' alt="double-click to unlock" ondblclick="jsx3.ide.' + setTabReadWrite + '(' + getTab + ');">' +
          '<img src="' + this.resolveURI("jsxapp:/images/icon_91.gif") + '" width="8" height="10" alt="Locked"/></span>';
    }

    return editor.getTitle() + readonly;
  };

  EditorManager_prototype.close = function(editor) {
    editor.onBeforeClose();

    if (editor._editortype.isDialog()) {
      editor.getContent().doClose();
      this._dialogEditors.remove(editor);
    } else {
      var tab = this._getContentForEditor(editor);
      if (tab)
        tab.getParent().removeChild(tab);
      this._editors.remove(editor);
    }

    this.publish({subject:"closed", editor:editor});
  };

  EditorManager_prototype.isOpen = function(editor) {
    return this._editors.indexOf(editor) >= 0;
  };

  EditorManager_prototype.reveal = function(editor) {
    var content = editor.getContent();
    if (jsx3.gui.Dialog && content instanceof jsx3.gui.Dialog) {
      content.focus();
    } else {
      content.getParent().doShow();
    }
  };

  EditorManager_prototype.getTypeForFileType = function(strType) {
    var t = this._types.find(function(t) { return t.handlesType(strType); });
    return t || this._defaultType;
  };

  EditorManager_prototype.onComponentTabMenu = function(objMenu, objEditor) {
    if (objEditor == null) return false;

    for (var i = objMenu.getXML().selectNodeIterator('//record'); i.hasNext(); ) {
      var node = i.next();
      if (node.getAttribute('reload') == "1")
        objMenu.enableItem(node.getAttribute('jsxid'), objEditor.supportsReload());

      // check for text specific to type of editor
      var editorText = objEditor ? node.getAttribute(objEditor.getClass().getName().replace(/^.*\./, "")) : null;
      if (editorText) {
        // store default text
        if (node.getAttribute("_jsxtext") == null)
          node.setAttribute("_jsxtext", node.getAttribute("jsxtext"));
        // set custom text
        node.setAttribute("jsxtext", editorText);
      } else {
        var defaultText = node.getAttribute("_jsxtext");
        if (defaultText != null) {
          // restore default text
          node.setAttribute("jsxtext", defaultText);
          node.removeAttribute("_jsxtext");
        }
      }
    }
  };

});

/**
 *
 */
jsx3.Class.defineClass("jsx3.ide.ui.EditorType", null, null, function(EditorType, EditorType_prototype) {

  EditorType_prototype.init = function(objExt, objData) {
    /* @jsxobf-clobber */
    this._xml = objData;
    /* @jsxobf-clobber */
    this._ext = objExt;

    /* @jsxobf-clobber */
    this._types = {};
    objData.children().each(jsx3.$F(function(e) {
      if (e.nname() == "filetype")
        this._types[e.attr("id")] = true;
    }).bind(this));
  };

  EditorType_prototype.getEditorClass = function() {
    return this._xml.attr("class");
  };

  EditorType_prototype.handlesType = function(strType) {
    return this._types[strType];
  };

  EditorType_prototype.isDefault = function() {
    return "true" == this._xml.attr("default");
  };

  EditorType_prototype.isDialog = function() {
    return "true" == this._xml.attr("dialog");
  };

  EditorType_prototype.isMultiInstance = function() {
    return "true" == this._xml.attr("multi");
  };

  EditorType_prototype.toString = function() {
    return this.getEditorClass();
  };

});
