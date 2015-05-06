/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Matrix");

/**
 *
 */
jsx3.Class.defineClass("jsx3.io.FileDialog", jsx3.gui.Dialog, null, function(FileDialog, FileDialog_prototype) {
  
  var File = jsx3.io.File;
  var Form = jsx3.gui.Form;
  var Matrix = jsx3.gui.Matrix;
  var URI = jsx3.net.URI;
  
  /** @private @jsxobf-clobber */
  FileDialog.MODE_OPEN = 1;
  /** @private @jsxobf-clobber */
  FileDialog.MODE_SAVE = 2;

  FileDialog.CHOOSE_FILE = 4;
  FileDialog.CHOOSE_FILES = 8;
  FileDialog.CHOOSE_FOLDER = 16;

  FileDialog.TYPE_OPEN_FILE = FileDialog.MODE_OPEN | FileDialog.CHOOSE_FILE;
  FileDialog.TYPE_OPEN_FILES = FileDialog.MODE_OPEN | FileDialog.CHOOSE_FILES;
  FileDialog.TYPE_OPEN_FOLDER = FileDialog.MODE_OPEN | FileDialog.CHOOSE_FOLDER;
  FileDialog.TYPE_SAVE_FILE = FileDialog.MODE_SAVE | FileDialog.CHOOSE_FILE;

  FileDialog._TITLES = {5:"Open File", 9:"Open Files", 17:"Choose Folder", 6:"Save File"};
  
  /** 
   * Files with these extensions will not be selectable in the file dialog.
   * @private 
   * @jsxobf-clobber 
   */
  FileDialog.BINARY_EXT = {doc:1, zip:1, bin:1, exe:1};

  /**
   * <ul>
   *   <li>name</li>
   *   <li>folder</li>
   *   <li>baseFolder</li>
   *   <li>modal</li>
   *   <li>fileFilter</li>
   *   <li>title</li>
   *   <li>okLabel</li>
   *   <li>onChoose</li>
   *   <li>onCancel</li>
   * </ul>
   * @param intType
   * @param objParam
   */
  FileDialog_prototype.showFileDialog = function(intType, objParam) {
    /* @jsxobf-clobber */
    this._type = intType || FileDialog.TYPE_OPEN_FILE;

    var openFolder, baseFolder;
    if (objParam) {
      if (objParam.name)
        this.setName(objParam.name);

      if (objParam.modal)
        this.setModal(jsx3.gui.Dialog.MODAL);

      /* @jsxobf-clobber */
      this._title = objParam.title;
      /* @jsxobf-clobber */
      this._btnlabel = objParam.okLabel;

      /* @jsxobf-clobber */
      this._filter = objParam.fileFilter;

      openFolder = objParam.folder;
      baseFolder = objParam.baseFolder;

      this._fctchoose = objParam.onChoose;
      this._fctcancel = objParam.onCancel;
    }

    if (!(openFolder && openFolder.isDirectory()))
      throw new jsx3.Exception("The 'folder' parameter is not an existing directory: " + openFolder);

    /* @jsxobf-clobber */
    this._fs = openFolder.getFileSystem();

    this._openForX(openFolder, baseFolder);

    this.getParent().paintChild(this);
  };

  /** @private @jsxobf-clobber */
  FileDialog_prototype._openForX = function(objCurrent, strBase) {
    this._current = objCurrent;

    /* @jsxobf-clobber */
    this._base = strBase;
    if (this._base == null)
      this.roots = this._fs.getRoots();
    
    // prevent UI lock out
    if (this._base != null && ! this._current.isDescendantOf(this._base))
      this._base = this._current;
    
    var bOpen = this._type & FileDialog.MODE_OPEN;
    var bMultiple = bOpen && (this._type & FileDialog.CHOOSE_FILES);
    var bNewDir = this._type != FileDialog.TYPE_OPEN_FILE && this._type != FileDialog.TYPE_OPEN_FILES;

    this._getFileList().setSelectionModel(bMultiple ? Matrix.SELECTION_MULTI_ROW : Matrix.SELECTION_ROW);
    this._getFileTextField().setEnabled(bOpen ? Form.STATEDISABLED : Form.STATEENABLED, true);
    this._getCachedDescendantOfName('jsxbutton_newFolder').setEnabled(bNewDir ? Form.STATEENABLED : Form.STATEDISABLED, true);
    this._updateExecuteButton();

    var strTitle = this._title || FileDialog._TITLES[this._type];
    this.setDialogTitle(strTitle);

    this._fixPath();
    
    // timeout for slightly improved responsiveness
    jsx3.sleep(function() {
      if (this._type & FileDialog.MODE_OPEN)
        this._getFileList().focus();
      else
        this._getFileTextField().focus();

      this._currentDidChange();
    }, null, this);
  };

  /** @package */
  FileDialog_prototype.setDialogTitle = function(strTitle) {
    this.getCaptionBar().setText(strTitle, true);
  };

  /** @package */
  FileDialog_prototype.setExecButtonLabel = function(strLabel) {
    this._getCachedDescendantOfName('btn_execute').setText(strLabel, true);
  };

  /** @private @jsxobf-clobber */
  FileDialog_prototype._redrawFileList = function() {
    var file = this._current;

    var list = this._getFileList();
    list.clearXmlData();

    if (! file.exists()) {
      list.repaintData();
      return;
    }

    var files = file.listFiles();

    for (var i = 0; i < files.length; i++) {
      file = files[i];
      if (file.isHidden() || !file.exists()) continue;

      var stat = file.getStat();
      var date = stat.mtime;
      var disabled = (this._filter && !this._filter(file)) ? 1 : Number(0);

      var bFolder = file.isDirectory();
      var record = {
        jsxid: file.toURI().toString(),
        folder: bFolder ? 'true' : 'false',
        jsximg: file.isReadOnly() ? (bFolder ? "jsxapp:/images/icon_7l.gif" : "jsxapp:/images/icon_29l.gif") : (bFolder ? "jsxapp:/images/icon_7.gif" : "jsxapp:/images/icon_29.gif"),
        name: file.getName(),
        bytes: stat.size != null ? stat.size : "",
        size: stat.size != null ? FileDialog.formatFileSize(stat.size) : "",
        mtime: date ? date.getTime() : null,
        type: file.getType(),
        jsxunselectable: disabled,
        jsxstyle: disabled ? "color:#999999;" : ""
      };

      list.insertRecord(record, null, false);
    }

    list.repaintData();
  };

if (jsx3.app.Browser.macosx) {

  /** @private @jsxobf-clobber */
  FileDialog_prototype._redrawPathSelect = function() {
    var file = this._current;
    var select = this._getPathSelect();
    select.clearXmlData();

    var firstId = null;
    var objXML = select.getXML();

    while (file != null && this._checkSecurity(file)) {
      var record = this._getRecordFromFile(objXML, file);

      if (firstId == null)
        firstId = record.getAttribute("jsxid");

      file = file.exists() ? file.getParentFile() : null;
      record.setAttribute("jsximg", file != null ? "jsxapp:/images/icon_7.gif" : "jsxapp:/images/icon_103.gif");

      objXML.appendChild(record);
    }

    select.setValue(firstId);
  };

} else {

  FileDialog_prototype._redrawPathSelect = function() {
    var file = this._current;
    var select = this._getPathSelect();
    select.clearXmlData();

    var firstId = null;
    var objXML = select.getXML();

    var stack = [];
    while (file != null && this._checkSecurity(file)) {
      var record = this._getRecordFromFile(objXML, file);

      if (firstId == null)
        firstId = record.getAttribute("jsxid");

      file = file.exists() ? file.getParentFile() : null;
      record.setAttribute("jsximg", file != null ? "jsxapp:/images/icon_7.gif" : "jsxapp:/images/icon_102.gif");

      objXML.appendChild(record);
      stack.push(record);
    }

    for (var i = 0; i < stack.length; i++)
      stack[i].setAttribute("jsxstyle", "padding-left:" + (4 + 12 * (stack.length - i - 1)) + "px;");

    if (this.roots != null) {
      var currentRoot = this._current.getRootDirectory() || this._current;
      for (var i = 0; i < this.roots.length; i++) {
        var root = this.roots[i];
        if (! currentRoot.equals(root)) {
          var node = this._getRecordFromFile(objXML, root);
          node.setAttribute("jsximg", "jsxapp:/images/icon_102.gif");
          node.setAttribute("jsxstyle", "color:#999999;");
          objXML.appendChild(node);
        }
      }
    }

    select.setValue(firstId);
    select.setXSLParam("jsxsortpath", "jsxid");
  };

}

  /** @private @jsxobf-clobber */
  FileDialog_prototype._getRecordFromFile = function(objXML, file) {
    var text = null;
    if (file.isRoot() || ! file.exists()) {
      text = file.getAbsolutePath();
      if (text.length > 1 && (jsx3.util.strEndsWith(text, "\\") || jsx3.util.strEndsWith(text, "/")))
        text = text.substring(0, text.length - 1);
    } else {
      text = file.getName();
    }
    var node = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT, "record");
    node.setAttribute("jsxid", file.toURI().toString());
    node.setAttribute("jsxtext", text);
    return node;
  };

  /** @private */
  FileDialog_prototype.doGoUp = function() {
    if (this._current == null) this._fixPath();

    var parent = this._current.getParentFile();

    if (parent != null && this._checkSecurity(parent)) {
      this._current = parent;
      this._currentDidChange();
    } else {
      this.beep();
    }
  };

  /** @private */
  FileDialog_prototype.doPathSelect = function(strRecordId) {
//    window.alert("doPathSelect " + strRecordId);
    var select = this._getPathSelect();
    var record = select.getRecordNode(strRecordId);

    if (record != null) {
      this._current = this._fs.getFile(new URI(record.getAttribute("jsxid")));
      this._currentDidChange();
    }
  };

  /** @private */
  FileDialog_prototype.doFileSelect = function(strRecordId) {
    var list = this._getFileList();

    var names = "";
    for (var i = list.getSelectedNodes().iterator(); i.hasNext(); ) {
      var path = i.next().getAttribute("jsxid");
      if (path) {
        var file = this._fs.getFile(new URI(path));
        if (names) names += ", ";
        names += file.getName();
      }
    }

    var fileName = this._getFileTextField();
    fileName.setValue(names, true);

    this._updateExecuteButton(true);
  };

  /** @private */
  FileDialog_prototype.doFileExecute = function(strRecordId) {
    this.doExecute();
  };

  /** @private */
  FileDialog_prototype.doPathEdit = function(objEvent) {
    var list = this._getFileList();
    var nodes = list.getSelectedNodes();

    if (nodes.size() > 0) {
      list.deselectAllRecords();
    }

    var value = this._getFileTextField().getValue();
    if (!value || objEvent.deleteKey() || objEvent.backspaceKey()) {
      // wait until after the event has bubbled up
      jsx3.sleep(function(){this._updateExecuteButton(true);}, null, this);
    }
  };

  /** @private @jsxobf-clobber */
  FileDialog_prototype._fixPath = function() {
    if (this._current == null || !this._current.isDirectory())
      this._current = jsx3.ide.getSystemDirFile();

    if (! this._current.isDirectory()) {
      // TODO: big error!
      jsx3.ide.LOG.error(this._current + " is not a folder, cannot recover");
      this._current = null;

    }
  };

  /** @private */
  FileDialog_prototype.doReload = function() {
    this._fixPath();
    this._currentDidChange();
  };

  /** @private @jsxobf-clobber */
  FileDialog_prototype._currentDidChange = function() {
    this._redrawPathSelect();
    this._redrawFileList();
    var fileName = this._getFileTextField();
    fileName.setValue("", true);

    var isUp = this._current.exists() && this._current.getParentFile() != null &&
        (this._base == null || ! this._current.equals(this._base));
    this._getCachedDescendantOfName('jsxbutton_goUp').setEnabled(isUp, true);

    this._updateExecuteButton(true);
  };

  /** @private @jsxobf-clobber */
  FileDialog_prototype._updateExecuteButton = function(bEnabledOnly) {
    var pathValue = this._getFileTextField().getValue();
    var execBtn = this._getCachedDescendantOfName('btn_execute');

    var strName = "", bEnabled = false;
    switch (this._type) {
      case FileDialog.TYPE_OPEN_FILE:
        strName = "Open";
        bEnabled = pathValue;
        break;
      case FileDialog.TYPE_OPEN_FILES:
        strName = "Open";
        bEnabled = pathValue;
        break;
      case FileDialog.TYPE_OPEN_FOLDER:
        strName = pathValue ? "Open" : "Choose";
        bEnabled = true;
        break;
      case FileDialog.TYPE_SAVE_FILE:
        strName = "Save";
        bEnabled = pathValue;
        break;
      case FileDialog.TYPE_SAVE_FOLDER:
        strName = pathValue ? "Open" : "Choose";
        bEnabled = true;
        break;
    }

    if (!bEnabledOnly)
      execBtn.setText(this._btnlabel || strName);
    execBtn.setEnabled(bEnabled ? Form.STATEENABLED : Form.STATEDISABLED, true);
  };

  /** @private */
  FileDialog_prototype.doNewFolder = function() {
    var me = this;
    this.prompt(
      "New Folder",
      "Name of new folder:",
      function(objDialog, strFolder) {
        if (me.doNfCreate(strFolder))
          objDialog.doClose();
        else
          me.alert(null, 'Could not create folder "' + strFolder + '".');
      },
      null,
      "Create",
      "Cancel",
      {noTitle: true, width: 225, height: 90}
    );
  };

  /** @private */
  FileDialog_prototype.doNfCreate = function(folderName) {
    var newFolder = this._current.resolve(URI.encode(folderName));

    if (! this._checkIsChild(newFolder)) {
      this.alert(null, '"' + folderName + '" is not a valid folder name.');
      return false;
    } else if (newFolder.exists()) {
      this.alert(null, '"' + folderName + '" already exists.');
      return false;
    } else if (this._checkSecurity(newFolder)) {
      try {
        newFolder.mkdir();
        var ok = newFolder.isDirectory();
        if (ok) this._redrawFileList();
        return ok;
      } catch (e) {
        jsx3.ide.LOG.warn("Error creating folder '" + folderName + "'.", jsx3.NativeError.wrap(e));
        return false;
      }
    }
  };

  /** @private */
  FileDialog_prototype.doCancel = function() {
    this.doClose();
    if (this._fctcancel)
      this._fctcancel.apply();
  };

  /** @private */
  FileDialog_prototype.doExecute = function(bConfirmed) {
    var list = this._getFileList();

    var files = [];
    for (var i = list.getSelectedNodes().iterator(); i.hasNext(); )
      files.push(this._fs.getFile(new URI(i.next().getAttribute("jsxid"))));

    if (files.length == 0) {
      var fileName = this._getFileTextField().getValue();
      if (fileName) {
        files[0] = this._current.resolve(URI.encode(fileName));
      } else {
        files[0] = this._current;
      }
    }

    var bSave = (this._type & FileDialog.MODE_SAVE) > 0;
    var toMoveTo = null, toExec = null, needsConfirm = false;

    if (this._type == FileDialog.TYPE_OPEN_FILE ||
        this._type == FileDialog.TYPE_SAVE_FILE) {
      if (files[0].isDirectory())
        toMoveTo = files[0];
      else if (files[0].isFile() || this._type == FileDialog.TYPE_SAVE_FILE)
        toExec = files[0];
    } else if (this._type == FileDialog.TYPE_OPEN_FILES) {
      var realFiles = [];
      for (var i = 0; i < files.length; i++) {
        if (files[i].isFile())
          realFiles.push(files[i]);
      }
      if (realFiles.length > 0) {
        toExec = realFiles;
      } else if (files.length == 1 && files[0].isDirectory()) {
        toMoveTo = files[0];
      } else {
        list.deselectAllRecords();
        this.doFileSelect();
      }
    } else if (this._type == FileDialog.TYPE_OPEN_FOLDER ||
        this._type == FileDialog.TYPE_SAVE_FOLDER) {
      if (this._current == files[0])
        toExec = files[0];
      else {
        if (files[0].isDirectory()) {
          toMoveTo = files[0];
        } else {
          list.deselectAllRecords();
          this.doFileSelect();
        }
      }
    }

    if (this._type == FileDialog.TYPE_SAVE_FILE && toExec != null) {
      if (!this._checkIsChild(toExec)) {
        this.alert(null, '"' + this._getFileTextField().getValue() + '" is not a valid file name.' + toExec);
        return;
      }
    }

    if (toExec != null && this._type == FileDialog.TYPE_SAVE_FILE)
      needsConfirm = !bConfirmed && toExec.exists();

    files = null;

    if ((toMoveTo != null && !this._checkSecurity(toMoveTo)) ||
        (toExec != null && !this._checkSecurity(toExec))) {
      this._getFileTextField().setValue("", true);
      list.deselectAllRecords();
      return;
    }

    if (toMoveTo != null) {
      this._current = toMoveTo;
      this._currentDidChange();
    } else if (toExec != null) {
      // confirm save over
      if (needsConfirm) {
        var me = this;
        this.confirm(
          null,
          "The file " + toExec.getName() + " already exists. Overwrite?",
          function(objDialog) {objDialog.doClose(); me.doExecute(true);},
          null,
          "Overwrite",
          "Cancel",
          2, null, null, {noTitle:true, width: 225, height: 85}
        );
      } else {
        this.doClose();
        if (this._fctchoose)
          this._fctchoose.apply(null, [toExec]);
      }
    }
  };

  /** @private @jsxobf-clobber */
  FileDialog_prototype._getFileList = function() {
    return this._getCachedDescendantOfName('file_list');
  };

  /** @private @jsxobf-clobber */
  FileDialog_prototype._getPathSelect = function() {
    return this._getCachedDescendantOfName('path_select');
  };

  /** @private @jsxobf-clobber */
  FileDialog_prototype._getFileTextField = function() {
    return this._getCachedDescendantOfName('file_name');
  };

  /** @private @jsxobf-clobber */
  FileDialog_prototype._checkSecurity = function(files) {
    if (this._base == null) return true;
    var ok = true;
    if (jsx3.$A.is(files)) {
      for (var i = 0; ok && i < files.length; i++) {
        ok = files[i].equals(this._base) || files[i].isDescendantOf(this._base);
      }
    } else {
      ok = files.equals(this._base) || files.isDescendantOf(this._base);
    }
    return ok;
  };

  /** @private @jsxobf-clobber */
  FileDialog_prototype._checkIsChild = function(objFile) {
    if (jsx3.$A.is(objFile)) return true;

    var parent = objFile.getParentFile();
    return parent.exists() && this._current.equals(parent);
  };

  /** @private @jsxobf-clobber */
  FileDialog_prototype._getCachedDescendantOfName = function(strName) {
    var fieldName = "_" + strName;
    if (this[fieldName] == null)
      this[fieldName] = this.getDescendantOfName(strName);
    return this[fieldName];
  };

  /** @private @jsxobf-clobber */
  FileDialog.formatFileSize = function(bytes) {
    if (bytes < 1024)
      return bytes + "";
    bytes = Math.ceil(bytes/1024);
    if (bytes < 1024)
      return bytes + "K";
    bytes /= 1024;
    if (bytes < 1024)
      return (Math.round(bytes*10)/10) + "M";
    bytes = Math.ceil(bytes/1024);

    return (Math.round(bytes*10)/10) + "G";
  };

});
