/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.ide.newProject = function() {
  this.getPlugIn("jsx3.ide.project").showNew();
};

/** GET ACTIVE PROJECT *********************************************/
jsx3.ide.getActiveProject = function() {
  if (this._ACTIVEPROJCLEARED)
    return null;

  // try URL value
  var project = jsx3.app.Browser.getLocation().getQueryParam('jsxproject');

  // try last opened project from settings
  if (! project) {
    var settings = jsx3.ide.getIDESettings();
    if (settings.get("prefs", "builder", "openlastproject") !== false)
      project = settings.get('lastProject');
  }

  if (project) {
    if (jsx3.util.strEndsWith(project, "/"))
      project = project.substring(0, project.length - 1);
  }

  return project;
};

jsx3.ide.clearActiveProject = function() {
  jsx3.ide._ACTIVEPROJCLEARED = true;
};

jsx3.ide.getActiveProjectDirectory = function() {
  var project = jsx3.ide.PROJECT;
  return project ? project.getDirectory() : null;
};

jsx3.ide.getCurrentDirectory = function() {
  if (jsx3.ide._CURDIR != null)
    return jsx3.ide._CURDIR;
  else
    return jsx3.ide.getActiveProjectDirectory();
};

jsx3.ide.setCurrentDirectory = function(objFile) {
  /* @jsxobf-clobber */
  jsx3.ide._CURDIR = objFile;
};

jsx3.ide._PROJECT_PREFS = {};

jsx3.ide.getProjectSettings = function(bRW) {
  var objServer = jsx3.ide.SERVER;
  var settings = objServer.getSettings();
  
  if (bRW) {
    var strPath = objServer.getAppPath();
    
    if (!jsx3.ide._PROJECT_PREFS[strPath]) {
      var objFile = objServer.getDirectory().resolve(jsx3.CONFIG_FILE);
      jsx3.ide._PROJECT_PREFS[strPath] = new jsx3.ide.Preferences(objFile, settings);
    }
    
    return jsx3.ide._PROJECT_PREFS[strPath];
  } else {
    return settings;
  }
};

jsx3.ide.addToRecentProjects = function(proj) {
  var strPath = proj.getPathFromHome();
  
  var settings = jsx3.ide.getIDESettings();
  var recent = settings.get('recentProjects') || [];
  for (var i = 0; i < recent.length; i++) {
    if (recent[i] == strPath) {
      recent.splice(i, 1);
      break;
    }
  }

  recent.unshift(strPath);
  if (recent.length > jsx3.ide.RECENT_PROJECT_MAX) recent.pop();

  settings.set('recentProjects', recent);
};

jsx3.ide.getProjectDirectory = function() {
  return jsx3.ide.getCurrentUserHome().resolve(jsx3.APP_DIR_NAME + "/");
//  return this.getSystemRelativeFile(jsx3.APP_DIR_NAME);
};

jsx3.ide.isFileToIgnore = function(objFile) {
  return objFile.getName().indexOf(".") == 0;
};

jsx3.ide.getRecentProjects = function() {
  var settings = jsx3.ide.getIDESettings();
  return settings.get('recentProjects') || [];
};


/** RUN PROJECT ***************************************/
jsx3.ide.runProject = function(bHTTP, bConfirmed) {
  var httpBase = null, httpHome = null;

  if (bHTTP) {
    httpBase = jsx3.ide.getIDESettings().get("http", "base");
    if (! httpBase) {
      jsx3.IDE.confirm("Local HTTP Server Not Configured", 
          "The local HTTP server is not configured. You must configure an HTTP server in IDE Settings : Paths before running this project from a local HTTP server.",
          function (d) {
            d.doClose();
            jsx3.ide.doOpenSettings(2);
          }, null, "Configure", "Cancel", 2);
      return;
    }
    httpHome = jsx3.ide.getIDESettings().get("http", "home");
  }
  
  if (! bConfirmed && jsx3.ide.isAnyEditorDirty()) {
    jsx3.IDE.confirm(
      "Save Before Running?", 
      "There are unsaved changes to your project that will not be reflected in the running project. Save these changes before running project?", 
      function(d){
        d.doClose();
        jsx3.ide.saveAll().when(function() { jsx3.ide.runProject(bHTTP, true); });
      }, 
      null, "Save and Run", "Cancel", 3,
      function(d){ d.doClose(); jsx3.ide.runProject(bHTTP, true); },
      "Run Without Saving", {width:350}
    );
  } else {
    jsx3.sleep(function() { jsx3.ide._runProjectSleep(httpBase, httpHome); });
  }
};

/* @jsxobf-clobber */
jsx3.ide._runProjectSleep = function(httpBase, httpHome) {
  var xhtml = jsx3.util.strEndsWith(jsx3.app.Browser.getLocation().getPath(), ".xhtml");
  var shell = "shell" + (xhtml ? ".xhtml" : ".html");
  var projPath = jsx3.ide.getSystemDirFile().toURI().relativize(jsx3.ide.getActiveProjectDirectory().toURI()).toString();

  // adjust the project path if the WS Home setting was set in the IDE
  if (! jsx3.util.strEmpty(httpHome)) {
    var start = projPath.indexOf(jsx3.APP_DIR_NAME);
    if (start >= 0)
      projPath = httpHome + "/" + projPath.substring(start);
  }

  var uri = jsx3.net.URI.fromParts(null, null, null, null, shell, "jsxapppath=" + projPath, null);

  if (httpBase)
    uri = new jsx3.net.URI(httpBase).resolve(uri);

  var w = window.open(uri.toString());
  if (w)
    w.focus();
  else
    jsx3.ide.LOG.error("The application did not run properly. Check that no popup blockers are running.");
};



/** OPEN PROJECT **********************************/
jsx3.ide.openProject = function() {
  jsx3.ide.getPlugIn("jsx3.io.browser").chooseFolder(jsx3.IDE.getRootBlock(), {
      name:"openproject", modal:true, title:"Choose Project Folder", okLabel:"Choose",
      folder: jsx3.ide.getProjectDirectory(),
      onChoose: jsx3.$F(function(objFile) {
        var projTypes = jsx3.ide.getPlugIn("jsx3.ide.project").getProjectTypes();
        if (projTypes.find(function(e) { return e.isProjectDir(objFile); })) {
          var path = jsx3.ide.getCurrentUserHome().relativePathTo(objFile);
          jsx3.ide.doOpenProject(path, false, true);
        } else {
          jsx3.IDE.alert(null, objFile.getAbsolutePath() + " is not a valid project directory.");
        }
      }).bind(this)
  });
};


jsx3.ide.doOpenProject = function(strPath, bNewWindow, bConfirmed) {
  var objDir = jsx3.ide.getHomeRelativeFile(strPath);

  if (! jsx3.ide.checkProjectExists(objDir)) {
    jsx3.IDE.alert(null,
        "Could not open project <b>" + strPath + "</b> because the configuration file could not be found.",
        function(d){ d.doClose(); jsx3.ide._startJobs(); });
    jsx3.ide._pauseJobs();
    return false;
  }

  var bProjectOpen = jsx3.ide.PROJECT != null;
  
  if (bConfirmed || !bProjectOpen) {
    var loc = jsx3.app.Browser.getLocation();
    var uri = jsx3.net.URI.fromParts(loc.getScheme(), loc.getUserInfo(), loc.getHost(), loc.getPort(), loc.getPath(), 
        "jsxproject=" + strPath + "&jsxnowelc=true", null);

    if (bNewWindow) {
      var w = window.open(uri.toString());
      if (! w)
        jsx3.ide.LOG.error("The project " + strPath + " did not open properly. Check that no pop-up blockers are running.");
    } else {
      // if user vetos location change an error will be thrown
      try {
        window.location.href = uri.toString();
      } catch (e) {
        jsx3.ide.LOG.warn("The opening of project " + strPath + " was cancelled. " + jsx3.NativeError.wrap(e));
      }
    }
  } else {
    // closing all on shutdown should not mess up previously opened files
    jsx3.ide._closeDownProject().when(
      function() { jsx3.ide.doOpenProject(strPath, bNewWindow, true); }
    );
  }
};


jsx3.ide._closeDownProject = jsx3.$Y(function(cb) {
  var backup = jsx3.ide.getPreviouslyOpenFiles() || [];
  jsx3.ide.closeAll().when(function(){
    jsx3.ide.syncPreviouslyOpenFiles(null, backup);
    cb.done();
  });
});


jsx3.ide.checkProjectExists = function(objFile) {
  var projTypes = jsx3.ide.getPlugIn("jsx3.ide.project").getProjectTypes();
  return projTypes.find(function(e) { return e.isProjectDir(objFile); }) != null;
};


/** SHOW DEPLOYMENT OPTIONS ********************************/
jsx3.ide.showDeploymentOptions = function() {
  var plugin = jsx3.ide.getPlugIn("jsx3.ide.deploytool");
  plugin.load().when(function() {
    plugin.openTool();
  })
};


jsx3.ide.syncPreviouslyOpenFiles = function(objEvent, objFiles) {
  var objSettings = jsx3.ide.getIDESettings();
  var project = jsx3.ide.PROJECT;
  var openFiles = [];

  if (jsx3.$A.is(objFiles)) {
    for (var i = 0; i < objFiles.length; i++) {
      openFiles.push(project.getDirectory().relativePathTo(objFiles[i]));
    }
  } else {
    var editors = jsx3.ide.getAllEditors();
    for (var i = 0; i < editors.length; i++) {
      if (! editors[i].isUnsaved()) {
        var file = editors[i].getOpenFile();
        // not all editors will correspond to an actual file on the file system
        if (file && file.toURI)
          openFiles.push(project.getDirectory().relativePathTo(file));
      }
    }
  }

  objSettings.set('projects', project.getPathFromHome(), 'openFiles', openFiles);
};


/**
 * ? getPreviouslyOpenFiles() -- may return null to signify no previous setting
 */
jsx3.ide.getPreviouslyOpenFiles = function() {
  var objSettings = jsx3.ide.getIDESettings();
  var project = jsx3.ide.PROJECT;
  var paths = objSettings.get('projects', project.getPathFromHome(), 'openFiles');
  if (paths != null) {
    var openFiles = [];
    for (var i = 0; i < paths.length; i++) {
      var objFile = jsx3.ide.getSystemRelativeFile(project.resolveURI(paths[i]));
      if (objFile.isFile())
        openFiles.push(objFile);
    }
    return openFiles;
  }
  return null;
};

jsx3.ide.showWelcomeDialog = function() {
  var p = jsx3.ide.getPlugIn("jsx3.ide.welcome");
  if (p)
    p.load().when(function() {
      p.openTool();
    });
};

jsx3.ide.getProjectAuthorVersion = function() {
  return "3.2"; // update as needed
};
