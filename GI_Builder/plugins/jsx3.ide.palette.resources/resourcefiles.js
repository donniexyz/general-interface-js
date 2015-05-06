/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

(function (plugIn) {

  jsx3.ide.PROJECT.subscribe("resources", plugIn, "updateResources");

  jsx3.$O(plugIn).extend({

updateResources: jsx3.$F(function() {
  var objTree = this.getResourcesTree();
  
  if (objTree != null) {
    var oldValue = objTree.getValue();

    //repopulates the resources tree
    objTree.clearXmlData();
    objTree.insertRecord({jsxid:"_root_", jsxtext:jsx3.ide.PROJECT.getDirectory().getName(),
      jsximg:"jsxapp:/images/icon_7.gif", jsxopen:1});

    objTree.setDynamicProperty("jsxbgcolor","@Solid Light");
    var objXML = objTree.getXML();

    //get the settings file for the active project we've got loaded in builder
    var objSettings = jsx3.ide.getProjectSettings();
    var includes = jsx3.ide.PROJECT.getResources();
    var initialComponentUrl = jsx3.net.URI.decode(objSettings.get('objectseturl'));

    //iterate to populate
    for (var i = 0; i < includes.length; i++) {
      var include = includes[i];
      var src = jsx3.net.URI.decode(include.getPath());
      var type = include.getFileType();
      var load = include.getLoadType();
      var id = include.getId();

      var o = {jsxid: id, jsxtip: src, load: load ? 1 : 0};

      if (type.getId() == "component") {
        o.jsxclass = src == initialComponentUrl ?
            "jsx3ide_resource_initial" : "jsx3ide_resource_noninitial";
      } else {
        o.jsxclass = (o.load == jsx3.lang.ClassLoader.LOAD_ALWAYS) ?
            "jsx3ide_resource_autoload" : "jsx3ide_resource_noload";
      }

      o.jsximg = type.getExt().getPlugIn().resolveURI(type.getImage());
      o.supportsLoad = type.isReloadable() ? 1 : null;

      var tokens = src.split("/");
      var path = "", lastId = "_root_", dirNodeId = "_root_";
      for (var j = 0; j < tokens.length - 1; j++) {
        path += tokens[j];
        dirNodeId = "_dir_" + path;

        if (!objTree.getRecordNode(dirNodeId))
          objTree.insertRecord({jsxid:dirNodeId, jsxtext:tokens[j], jsximg:"jsxapp:/images/icon_7.gif",
              jsxopen:1, sorton:tokens[j].toLowerCase()}, lastId, false);
        
        lastId = dirNodeId;
      }

      o.jsxtext = tokens[tokens.length - 1];
      o.sorton = o.jsxtext.toLowerCase();

      objTree.insertRecord(o, dirNodeId, false);
    }

    //repaint the tree
    objTree.repaint();

    var newValue = objTree.getValue();
    if (!jsx3.util.List.wrap(oldValue).equals(jsx3.util.List.wrap(newValue))) {
      // Deleting a row from the tree will cause the tree value to update but will not publish
      // a model event in resourcefiles.xml
      //jsx3.log(oldValue + " => " + newValue)
      this.publish({subject:"selection", values:newValue});
    }

    this._fileScanResources(objTree, includes);
  }
}).throttled(),

setResourceProps: function(strId, strNewId, strSrc, strType, intLoad) {
  var includes = jsx3.ide.PROJECT.getResources();
  var oldInclude = includes.find(function(e) { return e.getId() == strId; });

  if (strNewId && strNewId != strId && includes.find(function(e) { return e.getId() == strNewId; })) {
    jsx3.ide.LOG.warn("Cannot change resource ID to an ID that is already in use: " + strNewId);
    return;
  }

  if (oldInclude) {
    if (strSrc != null && oldInclude.getPath() != strSrc && jsx3.ide.getResourceBySrc(strSrc) != null) {
      jsx3.ide.LOG.warn("Cannot change resource path to a path that is already in use: " + strSrc);
      return;
    }

    var newRsrc = new jsx3.ide.ProjectRsrc(
            strNewId != null ? strNewId : oldInclude.getId(),
            strType != null ? strType : oldInclude.getType(),
            intLoad != null ? intLoad : oldInclude.getLoadType(),
            strSrc != null ? strSrc : oldInclude.getPath()
            );

    var index = includes.indexOf(oldInclude);
    includes.splice(index, 1, newRsrc);

    jsx3.ide.PROJECT.setResources(includes);

    this.publish({subject:"changed"});
  } else {
    jsx3.ide.LOG.error("Cannot find resource with ID: " + strId);
  }
},

doToggleAutoload: function(record) {
  var strRecordId = record.jsxid;
  var bAutoload = record.onload == 1 || record.load == jsx3.lang.ClassLoader.LOAD_ALWAYS;
  this.setResourceProps(strRecordId, null, null, null,
      bAutoload ? jsx3.lang.ClassLoader.LOAD_AUTO : jsx3.lang.ClassLoader.LOAD_ALWAYS);
},

doReloadResource: function(strResourceIds) {
  strResourceIds = jsx3.$A(strResourceIds);
  var objResources = [];
  for (var i = 0; i < strResourceIds.length; i++)
    objResources[i] = jsx3.ide.getResourceById(strResourceIds[i]);

  jsx3.ide.doReloadResourceObj(objResources);
},

doShowResourceProps: function(rsrcId) {
  var server = this.getServer();
  var dialog = server.getJSXByName('jsx_ide_resourcesettings');
  var rsrc = jsx3.ide.getResourceById(rsrcId);
  if (!rsrc) return;

  if (!dialog) {
    this.getResource("container").load().when(jsx3.$F(function() {
      dialog = this.loadRsrcComponent("container", server.getRootBlock());

      var controller = new jsx3.amp.util.Prefs();

      var panes = this.getExtPoint("pane").processExts();
      panes.each(function(e) {
        e.resourceObj = rsrc;
        controller.addPane(e);
      });

      controller.setCollapse(panes.length == 1);
      dialog.getPrefs = function() { return controller; };

      dialog.openPrefs();

      var prefs = jsx3.ide.getIDESettings();
      var dims = prefs.get("resource-settings", "dims");
      if (jsx3.$A.is(dims))
        dialog.setDimensions(dims);

      dialog.focus();
    }).bind(this));
  } else {
    dialog.focus();
  }
},

doDereference: jsx3.$Y(function(cb) {
  var strRecordIds = cb.args()[0];

  var objFiles = [];
  for (var i = 0; i < strRecordIds.length; i++)
    objFiles[i] = jsx3.ide.getFileForResource(strRecordIds[i]);

  // check that we are confirmed if needed
  var settings = jsx3.ide.getIDESettings();
  if (settings.get('prefs', 'builder', 'dereferencewarn')) {
    var fileNames = [];
    for (var i = 0; i < objFiles.length; i++)
      fileNames[i] = objFiles[i].getName();

    jsx3.IDE.confirm(
      "Confirm Dereference",
      objFiles.length == 1 ? "Dereference the file <b>" + fileNames[0] + "</b> from the current project?" :
          "Dereference these files from the current project? <b>" + fileNames.join(", ") + "</b>.",
      jsx3.$F(function(d) {d.doClose(); this._doDereference2(objFiles).when(cb);}).bind(this),
      jsx3.$F(function(d) {d.doClose(); cb.done(false);}).bind(this),
      "Dereference",
      "Cancel"
    );
  } else {
    this._doDereference2(objFiles).when(cb);
  }
}),

_doDereference2: jsx3.$Y(function(cb) {
  var objFiles = cb.args()[0];
  
  var editor = null;
  for (var i = 0; i < objFiles.length && editor == null; i++)
    editor = jsx3.ide.getEditorForFile(objFiles[i]);

  if (editor) {
    jsx3.ide.close(editor).when(
        jsx3.$F(function(rv) {
          if (rv) this._doDereference2(objFiles);
          else cb.done(false);
        }).bind(this));
  } else {
    this._doDereference3(objFiles).when(cb);
  }
}),

_doDereference3: jsx3.$Y(function(cb) {
  var objFiles = cb.args()[0];
  var resources = jsx3.ide.PROJECT.getResources();

  jsx3.$A(objFiles).each(function(e) {
    var rsrc = jsx3.ide.getResourceByFile(e);
    resources.remove(rsrc);
  });

  jsx3.ide.PROJECT.setResources(resources);
}),

_fileScanResources: jsx3.$F(function(objTree, arrIncludes) {
  for (var i = 0; arrIncludes && i < arrIncludes.length; i++) {
    var include = arrIncludes[i];
    var exists = jsx3.ide.getSystemRelativeFile(jsx3.ide.PROJECT.resolveURI(include.src)).isFile();
    var record = objTree.getRecord(include.id);

    if (record == null) continue;

    if (exists && record.missing) {
      objTree.insertRecordProperty(record.jsxid, "missing", "0", false);
      objTree.insertRecordProperty(record.jsxid, "jsxclass",
          record.jsxclass.replace(/\s*jsx3ide_resource_missing/, ""));
    } else if (!exists && !record.missing) {
      objTree.insertRecordProperty(record.jsxid, "missing", "1", false);
      objTree.insertRecordProperty(record.jsxid, "jsxclass",
          record.jsxclass + " jsx3ide_resource_missing");
    }
  }
}).throttled()

})

})(this);
