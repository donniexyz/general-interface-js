/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.$O(jsx3.ide).extend({

addResourceToProject: function(objFile, strType, bAutoLoad) {
  var path = jsx3.net.URI.decode(this.PROJECT.getDirectory().relativePathTo(objFile));

  var insert = this.getResourceByFile(objFile) == null;

  if (insert) {
    this.LOG.debug("Adding resource to project: " + path);
  
    var includes = this.PROJECT.getResources();

    // ensure unique new id (could be improved!)
    var newId = objFile.getName().replace(/\./g,"_");
    while (this.getResourceById(newId) != null)
      newId += "_";

    var include = new jsx3.ide.ProjectRsrc(newId, strType, bAutoLoad ? 1 : 0, path);
    includes.push(include);
    this.PROJECT.setResources(includes);
  }
},

getResourceBySrc: function(strUri) {
  var objFile = this.getSystemRelativeFile(strUri);
  return this.getResourceByFile(objFile);
},

getResourceByFile: function(objFile) {
  var includes = this.PROJECT.getResources();
  var path = this.getSystemDirFile().toURI().relativize(objFile.toURI());
  return includes.find(function(e) {
    return jsx3.ide.PROJECT.resolveURI(e.getPath()).equals(path);
  });
},

getResourceById: function(strResourceId) {
  return this.PROJECT.getResources().find(function(e) {
    return e.getId() == strResourceId;
  });
},

getFileForResource: function(strResourceId) {
  var resource = this.getResourceById(strResourceId);
  return resource && this.getSystemRelativeFile(this.PROJECT.resolveURI(resource.getPath()));
},

doOpenUrlForEdit: function(strUrl, strType) {
  var objFile = this.getSystemRelativeFile(strUrl);
  this.doOpenForEdit(objFile, strType);
},

/** DO OPEN FOR EDIT ****************************************************/
doOpenForEdit: jsx3.$Y(function(cb) {
  var args = cb.args();
  var objFile = args[0], strType = args[1], bNew = args[2];
  if (strType == null)
    strType = jsx3.ide.getFileType(objFile);

  var manager = this.getPlugIn("jsx3.ide.editor");
  manager.load().when(function() {
    if (bNew !== false)
      jsx3.ide.addResourceToProject(objFile, strType, false);

    var editor = manager.getOpenEditor(objFile);
    //check if given component is already open (only one instance at a time in the editor)
    if (editor) {
      manager.reveal(editor);
      cb.done(editor);
      //this item is already being edited; just click the tab to activate
    } else {
      if (objFile.toURI)
        jsx3.ide._addToRecentFiles(objFile);

      manager.openEditor(objFile, strType).when(cb);
    }
  });
}),

_addToRecentFiles: function(objFile) {
  var settings = this.getIDESettings();
  var project = this.PROJECT;
  var strPath = project.getDirectory().relativePathTo(objFile);

  var recent = settings.get('projects', project.getPathFromHome(), 'recentFiles') || [];
  for (var i = 0; i < recent.length; i++) {
    if (recent[i] == strPath) {
      recent.splice(i, 1);
      break;
    }
  }

  recent.unshift(strPath);
  if (recent.length > this.RECENT_FILES_MAX) recent.pop();

  settings.set('projects', project.getPathFromHome(), 'recentFiles', recent);
},

getRecentFiles: function() {
  var project = this.PROJECT;
  if (!project)
    return [];

  var settings = this.getIDESettings();
  return settings.get('projects', project.getPathFromHome(), 'recentFiles') || [];
},

getFileType: function(objFile) {
  var t = this.getPlugIn("jsx3.ide").getTypeForFile(objFile);
  return t ? t.getId() : objFile.getExtension();
},

doReloadResourceObj: jsx3.$Y(function(cb) {
  var objResources = cb.args()[0];
  objResources = jsx3.$A(objResources);

  var needConfirm = objResources.find(function(e) {
    return jsx3.ide.getPlugIn("jsx3.ide").getFileType(e.getType()).isSlowReload(); }) != null;

  var doneFct = function() {
    objResources.each(function(e) {
      jsx3.ide.SERVER.loadInclude(
        jsx3.ide.PROJECT.resolveURI(e.getPath()), e.getId(), e.getType(), true);
      jsx3.ide.getPlugIn("jsx3.ide").publish({subject:"resourceReloaded", resource:e});
    });
    cb.done(true);
  }

  if (needConfirm) {
    jsx3.IDE.confirm(
      "Confirm Reload",
      "Reloading this type of file can be very slow. Reload?",
      function(d){d.doClose(); doneFct(); },
      function(d) { d.doClose(); cb.done(false); },
      "Reload", "Cancel");
  } else {
    doneFct();
  }
})

});
