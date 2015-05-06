/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _addClassPathOf

jsx3.Class.defineClass("jsx3.ide.project.AppProject", jsx3.ide.Project, null, function(AppProject, AppProject_prototype) {

  /**
   * @param objSession {Object} the wizard session from the creation of this application. Each wizard pane can
   *    store arbitrary data on the session object, which is passed to the component onReveal and onConceal methods.
   * @return {Object} {ok:boolean, message:string}
   */
  AppProject.create = function(objSession) {
    var template = objSession.templateType;
    var path = objSession.projectPath;

    var projectsFolder = jsx3.ide.getProjectDirectory();
    var newFolder = projectsFolder.resolve(path);

    if (newFolder.exists()) {
      return {ok:false, message: "The project folder already exists. Please choose another project name."};
    } else if (! newFolder.isDescendantOf(projectsFolder)) {
      return {ok:false, message: "<b>" + path + "</b> is an illegal project path. Please choose another project path."};
    }

/*
    var bProjectOpen = jsx3.ide.SERVER != null;

    // close down existing project
    if (!bConfirmed && bProjectOpen) {
      jsx3.ide._closeDownProject(
        function() { jsx3.ide.doNewProject(objDialog, strName, true); }
      );
      return;
    }
*/

    var templateFolder = jsx3.ide.getSystemRelativeFile(template.getBasePath());

    if (! templateFolder.isDirectory()) {
      jsx3.util.Logger.getLogger(this.getClass().getName()).error(
          'Project template folder should exist: ' + templateFolder);
      return {ok:false};
    }

    newFolder.mkdirs();

    // Collection source and destination files in two lists.
    var srcFiles = jsx3.$A(), newFiles = jsx3.$A();
    var pathsToCopy = template.getFilePaths();

    if (pathsToCopy != null) {
      // The template may specify exactly which paths to include
      jsx3.$A(pathsToCopy).each(function(e) {
        var dest = newFolder.resolve(pathsToCopy);
        srcFiles.push(e);
        newFiles.push(dest);
      });
    } else {
      // Otherwise we do a directory scan
      var projFiles = templateFolder.find(function(f) {
        if (f.getName().indexOf(".") != 0) {
          return f.isFile() ? jsx3.io.File.FIND_INCLUDE : jsx3.io.File.FIND_RECURSE;
        }
      }, true);

      jsx3.$A(projFiles).each(function(e) {
        var dest = newFolder.resolve(templateFolder.toURI().relativize(e.toURI()));
        srcFiles.push(e);
        newFiles.push(dest);
      });
    }

    // find all included files
    var strNameSpace = path.replace(/\//g, ".").replace(/[^A-Za-z0-9\.]/g, "");

    for (var i = 0; i < srcFiles.length; i++) {
      var src = srcFiles[i];
      var dest = newFiles[i];

      var contents = src.read();
      if (contents) {
        contents = contents.replace(/@name@/g, path);
        contents = contents.replace(/@namespace@/g, strNameSpace);
      }

      dest.getParentFile().mkdirs();
      jsx3.ide.writeUserFile(dest, contents);
    }

    var relUrl = jsx3.ide.getCurrentUserHome().toURI().relativize(newFolder.toURI());

    return {ok:true, project:relUrl};
/*
    objDialog.doClose();
    jsx3.ide.doOpenProject(relUrl.toString(), false, true);
    // execution shouldn't go beyond this point

    return true;
*/
  };

  AppProject_prototype.getSettings = function(bRW) {
    var settings = this._server.getSettings();

    if (bRW) {
      if (!this._settingsrw) {
        var strPath = this._server.getAppPath();
        var objFile = this._server.getDirectory().resolve(jsx3.CONFIG_FILE);
        this._settingsrw = new jsx3.ide.Preferences(objFile, settings);
      }
      return this._settingsrw;
    } else {
      return settings;
    }
  };

  AppProject_prototype.initialize = jsx3.$Y(function(cb) {
    this._server = jsx3.ide.SERVER = new jsx3.ide.Server(this.getDirectory().toURI());
    cb.done();
  });

  AppProject_prototype.getServer = function() {
    return this._server;
  };

  AppProject_prototype.resolveURI = function(u) {
    return this._server.resolveURI(u);
  };

  AppProject_prototype.getRequiredAddins = function() {
    var a = this.getSettings().get("addins");
    return jsx3.$A(a).map(function(e) { return new jsx3.app.AddIn(e); });
  };

  AppProject_prototype.getGIVersion = function() {
    return jsx3.ide.getProjectAuthorVersion();
  };

  AppProject_prototype.isNeedsUpgrade = function() {
    return false;
  };

  AppProject_prototype.upgrade = function() {
    var settings = this.getSettings(true);

    var jsxvers = settings.get("jsxversion");
    if (jsxvers < 3.2) {
      var includes = settings.get("includes") || [];
      for (var i = 0; i < includes.length; i++) {
        var u = new jsx3.net.URI(includes[i].src);
        if (! u.isAbsolute()) {
          includes[i].src = this._server.relativizeURI(jsx3.resolveURI(u)).getPath().substring(1);
        }
      }
      settings.set("includes", includes);
    }

    settings.set("jsxversion", jsx3.ide.getProjectAuthorVersion());
    settings.save();
    this._server.ENVIRONMENT.jsxversion = jsx3.ide.getProjectAuthorVersion();
  };

  AppProject_prototype.getTitle = function() {
    var s = this._server;
    return s.getEnv("caption") || s.getEnv("namespace") || this.getPathFromHome();
  };

  AppProject_prototype.load = jsx3.$Y(function(cb) {
    this._loadProjectResources().when(cb);
  });

  AppProject_prototype._loadProjectResources = jsx3.$Y(function(cb) {
    var server = this._server;
    jsx3.CLASS_LOADER._addClassPathOf(server);

    var settings = server.getSettings();
    var includes = settings.get('includes');

    for (var i = 0; includes && i < includes.length; i++) {
      try {
        var include = includes[i];
        if (jsx3.CLASS_LOADER.passesLoad(include.onLoad || include.load))
          server.loadInclude(server.resolveURI(include.src), include.id, include.type);
      } catch (e) {
        jsx3.ide.LOG.warn("Error loading project resource " + include.src + ": " + jsx3.NativeError.wrap(e));
      }
    }

    // TODO: make this async?
    cb.done();
  });

  AppProject_prototype.getResources = function() {
    if (!this._rsrc) {
      this._rsrc = jsx3.$A(this.getSettings().get("includes")).map(function(e) {
        return new jsx3.ide.ProjectRsrc(e.id, e.type, (e.onLoad === true || e.load == 1) ? 1 : 0, e.src);
      });
    }
    return this._rsrc;
  };

  AppProject_prototype.setResources = function(r) {
    var temp = this._rsrc;
    this._rsrc = jsx3.$A(r);
    var beans = this._rsrc.map(function(e) {
      return {
        id: e.getId(), type: e.getType(), load: e.getLoadType(), src: e.getPath()
      };
    });
    var s = this.getSettings(true);
    s.set("includes", beans);
    s.save();

    this.publish({subject:"resources", value:this._rsrc, oldValue:temp});
  };

  AppProject._DEFAULT_PROJECT_FILES = ["js/logic.js", "components/appCanvas.xml"];

  AppProject_prototype.getDefaultOpenFiles = function() {
    var files = [];

    for (var i = 0; i < AppProject._DEFAULT_PROJECT_FILES.length; i++) {
      var path = AppProject._DEFAULT_PROJECT_FILES[i];
      var objFile = jsx3.ide.getSystemRelativeFile(this._server.resolveURI(path));
      if (objFile.isFile())
        files.push(objFile);
    }

    return files;
  };

/*
  checkProjectAddins: function() {
    var addins = jsx3.ide.SERVER.getSettings().get("addins");
    var notLoaded = [];
    if (addins)
      for (var i = 0; i < addins.length; i++)
        if (jsx3.System.getAddin([addins[i]]) == null)
          notLoaded.push(addins[i]);

    if (notLoaded.length > 0) {
      jsx3.IDE.alert("Add-ins Not Loaded",
          "The current project requires the following add-ins that are not installed: <b>" +
            notLoaded.join("</b>, <b>") + "</b>.",
          function(d){ d.doClose(); jsx3.ide._startJobs(); });
      jsx3.ide._pauseJobs();
    }
  };
*/

});

jsx3.Class.defineClass("jsx3.ide.project.Template", null, null, function(Template, Template_prototype) {

  Template_prototype.init = function(objExt, objData) {
    /* @jsxobf-clobber */
    this._xml = objData;
    /* @jsxobf-clobber */
    this._ext = objExt;
  };

  Template_prototype.getId = function() {
    return this._ext.getId() + "." + this._xml.attr("id");
  };

  Template_prototype.getPlugIn = function() {
    return this._ext.getPlugIn();
  };

  Template_prototype.getLabel = function() {
    return this._xml.attr("label");
  };

  Template_prototype.getDescription = function() {
    return this._xml.attr("description");
  };

  Template_prototype.getBasePath = function() {
    return this.getPlugIn().resolveURI(this._xml.attr("path")).toString();
  };

  Template_prototype.getFilePaths = function() {
    var files = this._xml.attr("files");
    return files ? files.split(/\s*,\s*/g) : null;
  };

});
