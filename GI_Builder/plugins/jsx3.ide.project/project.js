/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

(function (plugIn) {

  jsx3.$O(plugIn).extend({

    getProjectTypes: function() {
      if (!this._types)
        this._types = this.getExtPoint("project-type").processExts();

      return this._types;
    },

    getTypeById: function(id) {
      return this.getProjectTypes().find(function(e) { return e.getId() == id; });
    },

    /**
     *
     * @param dir {jsx3.io.File}
     */
    getTypeForDir: function(dir) {
      return jsx3.$A(this.getProjectTypes().reverse()).find(function(e) {
        return e.isProjectDir(dir);
      });
    },

    getTypeForProject: function(p) {

    }

  });

})(this);

jsx3.Class.defineClass("jsx3.ide.ProjectType", null, null, function(ProjectType, ProjectType_prototype) {

  ProjectType_prototype.init = function(objExt, objData) {
    /* @jsxobf-clobber */
    this._xml = objData;
    /* @jsxobf-clobber */
    this._ext = objExt;
  };

  ProjectType_prototype.getId = function() {
    return this._xml.attr("id");
  };

  ProjectType_prototype.getPanes = function() {
    return this._xml.attr("panes");
  };

  ProjectType_prototype.getPlugIn = function() {
    return this._ext.getPlugIn();
  };

  ProjectType_prototype.getLabel = function() {
    return this._xml.attr("label");
  };

  ProjectType_prototype.getDescription = function() {
    return this._xml.attr("description");
  };

  ProjectType_prototype.toString = function() {
    return this.getId();
  };

  ProjectType_prototype.getClassObj = function() {
    return jsx3.Class.forName(this._xml.attr("class"));
  };

  ProjectType_prototype.isProjectDir = function(dir) {
    return false;
  };

});

jsx3.Class.defineClass("jsx3.ide.Project", null, [jsx3.util.EventDispatcher], function(Project, Project_prototype) {

  Project.LOADED = "loaded";
  
  Project_prototype.init = function(type, dir) {
    /* @jsxobf-clobber */
    this._type = type;
    /* @jsxobf-clobber */
    this._dir = dir;
    /* @jsxobf-clobber */
    this._relpath = jsx3.ide.getCurrentUserHome().toURI().relativize(this._dir.toURI()).toString();
    if (jsx3.util.strEndsWith(this._relpath, "/"))
      this._relpath = this._relpath.substring(0, this._relpath.length - 1);
  };

  Project_prototype.initialize = jsx3.$Y(function(cb) {
    cb.done();
  });

  Project_prototype.getProjectType = function() {
    return this._type;
  };

  Project_prototype.getDirectory = function() {
    return this._dir;
  };

  Project_prototype.getPathFromHome = function() {
    return this._relpath;
  };

  Project_prototype.getRequiredAddins = function() {
    return [];
  };

  Project_prototype.getGIVersion = function() {
    return jsx3.ide.getProjectAuthorVersion();
  };

  Project_prototype.isNeedsUpgrade = function() {
    return false;
  };

  Project_prototype.upgrade = function() {
  };

  Project_prototype.load = jsx3.$Y(function(cb) {
    cb.done();
  });

  /**
   * @return {Array<jsx3.ide.ProjectRsrc>}
   */
  Project_prototype.getResources = function() {
    return jsx3.$A();
  };

  /**
   * @param r {Array<jsx3.ide.ProjectRsrc>}
   */
  Project_prototype.setResources = function(r) {
  };

  Project_prototype.getTitle = function() {
    return this.getDirectory().toURI().toString();
  };

  Project_prototype.getDefaultOpenFiles = function() {
    return [];
  };

});

jsx3.Class.defineClass("jsx3.ide.ProjectRsrc", null, [jsx3.util.EventDispatcher], function(ProjectRsrc, ProjectRsrc_prototype) {

  ProjectRsrc_prototype.init = function(id, type, loadType, path) {
    /* @jsxobf-clobber */
    this._id = id;
    /* @jsxobf-clobber */
    this._type = type;
    /* @jsxobf-clobber */
    this._load = loadType;
    /* @jsxobf-clobber */
    this._path = path;
  };

  ProjectRsrc_prototype.getId = function() { return this._id; }
  ProjectRsrc_prototype.getType = function() { return this._type; }
  ProjectRsrc_prototype.getLoadType = function() { return this._load; }
  ProjectRsrc_prototype.getPath = function() { return this._path; }

  ProjectRsrc_prototype.getFileType = function() {
    return jsx3.ide.getPlugIn("jsx3.ide").getFileType(this._type);
  };

  ProjectRsrc_prototype.toString = function() {
    return this._id + ":" + this._type + ":" + this._path;
  };
  
});
