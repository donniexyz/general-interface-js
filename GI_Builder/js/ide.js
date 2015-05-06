/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-global-rename-pattern  _jsx(\w+) _jsx$1
// @jsxobf-global-reserved  ui ide


//declare the ide controller (will manage the main logic to orchestrate all modules/components within the IDE)
if (jsx3.ide == null) jsx3.ide = {};
// make the jsx3.ide package an event dispatcher so that we can register for certain events before jsx3.IDE is created
jsx3.util.EventDispatcher.jsxclass.mixin(jsx3.ide);

jsx3.ide.RECENT_PROJECT_MAX = 10;
jsx3.ide.RECENT_FILES_MAX = 15;
jsx3.ide.LOG = jsx3.util.Logger.getLogger('jsx3.ide');

/*
 * single entry point on IDE startup
 */
jsx3.ide.onStartUp = function(fctPaint) {

  var Job = jsx3.util.Job;

  this._addJob(new Job(null, function() {
    jsx3.ide._loadFileSystem().when(jsx3.$F(this.finish).bind(this));
    return Job.WAIT;
  }));

  this._addJob(fctPaint);
  this._addJob(function() {
    jsx3.IDE.subscribe(jsx3.app.Server.HELP, jsx3.ide.onContextHelp);
    jsx3.IDE.getRootBlock().setHelpId("ide");
  });

  this._addJob(function() {
    if (! jsx3.ide.verifyUserHome()) {
      this._addJob(jsx3.ide.showLicenseAgreement);
      this._addJob(jsx3.ide.showNewUserHomeDialog);
    } else if (jsx3.STARTUP_EVENT && jsx3.STARTUP_EVENT.ctrlKey() && jsx3.STARTUP_EVENT.altKey()) {
      jsx3.ide.clearActiveProject();
      this._addJob(jsx3.ide.showWelcomeDialog);
      this._addJob(function() { jsx3.ide.publish({subject: "startup"}); });
      this._addJob(function() { jsx3.IDE.publish({subject: "startup"}); });
    } else {
      //FX3 has a race condition with the execqueue; don't start the queue until it is full
      this._addJob(jsx3.ide._onStartUp2);
    }
  });

  this._startJobs();
};

jsx3.ide._addJob = function(job) {
  var Job = jsx3.util.Job;
  var q = jsx3.ide.QUEUE;
  if (!q) {
    q = jsx3.ide.QUEUE = new jsx3.util.JobGraph();
    q.pause();
  }

  var aJob;
  if (job instanceof Function) {
    aJob = new Job(null, function() {
      job.apply(jsx3.ide);
      return Job.SLEEP;
    });
  } else {
    aJob = job;
  }

//  jsx3.ide.LOG.warn("Adding " + aJob + " to " + this._LAST_JOB);

  if (this._LAST_JOB && this._LAST_JOB.state() != Job.FINISHED)
    q.addJob(aJob, this._LAST_JOB)
//      jsx3.ide.LOG.error("Could not add job " + aJob + " to " + this._LAST_JOB);
  else
    q.addJob(aJob)
//      jsx3.ide.LOG.error("Could not add job " + aJob);

  this._LAST_JOB = aJob;
};

jsx3.ide._startJobs = function() {
  jsx3.ide.QUEUE.start();
};

jsx3.ide._pauseJobs = function() {
  jsx3.ide.QUEUE.pause();
};

jsx3.ide._loadFileSystem = jsx3.$Y(function(cb) {
  jsx3.ide.getPlugIn("jsx3.io").loadAvailableFileSystems().when(cb);
});

/* @jsxobf-clobber */
jsx3.ide._onStartUp2 = function() {
  this._addJob(new jsx3.util.Job(null, function() {
    var jobDone = jsx3.$F(this.finish).bind(this);

    jsx3.ide._initProject().when(function() {
      jsx3.ide._onStartUp3().when(jobDone);
    });
    
    return jsx3.util.Job.WAIT;
  }));
};

jsx3.ide._initProject = jsx3.$Y(function(cb) {
  var p = jsx3.ide.getPlugIn("jsx3.ide.project");
  var projectPath = jsx3.ide.getActiveProject();

  if (projectPath) {
    p.load().when(function() {
      var dir = jsx3.ide.getHomeRelativeFile(projectPath);
      var type = p.getTypeForDir(dir);

      if (type) {
        type.getPlugIn().load().when(function() {
          var c = type.getClassObj();
          var p = jsx3.ide.PROJECT = c.newInstance(type, dir);
          p.initialize().when(cb);
        });
      } else {
        jsx3.IDE.alert(null,
          "Could not open the project <b>" + projectPath + "</b> because it is not a project directory.",
          function(d){ d.doClose(); cb.done(); });
      }
    });
  } else {
    p.load().when(cb);
  }
});

jsx3.ide._onStartUp3 = jsx3.$Y(function(cb) {
  //determine the project we'll be editing
  var myProject = jsx3.ide.PROJECT;

  jsx3.gui.Event.subscribe(jsx3.gui.Event.BEFOREUNLOAD, jsx3.ide._onBeforeShutdown);

  if (myProject) {
    //a project has been specified

    var settings = jsx3.ide.getIDESettings();
    settings.set('lastProject', jsx3.ide.getCurrentUserHome().toURI().relativize(myProject.getDirectory().toURI()).toString());
    jsx3.ide.addToRecentProjects(myProject);

    var windowDoc = jsx3.IDE.getRootDocument();
    windowDoc.title = myProject.getTitle() + " - " + windowDoc.title;

    var c1 = jsx3.ide._checkUpgradeProject(myProject);
    c1.when(function() {
      if (c1.rv()) {
        var c2 = jsx3.ide._addinStartup(myProject);
        c2.when(function() {
          var c3 = myProject.load();
          c3.when(function() {
            var c4 = jsx3.ide._onStartUp4();
            c4.when(cb);
          });
        });
      } else {
        jsx3.ide.PROJECT = null;
        jsx3.ide.showWelcomeDialog();
      }
    });
  } else {
    // handle case when no known project; show dialog that will give choice to open (ref any projects in the jsxapppath dir) or create new
    this._addJob(jsx3.ide.showWelcomeDialog);
    cb.done();
  }

  this._addJob(function() {
    jsx3.ide.publish({subject: "startup"});
    jsx3.IDE.publish({subject: "startup"});
  });
});

jsx3.ide._checkUpgradeProject = jsx3.$Y(function(cb) {
  var proj = cb.args()[0];

  var v = proj.getGIVersion();
  var cmp = jsx3.util.compareVersions(v, jsx3.ide.getProjectAuthorVersion());

  if (cmp < 0) {
    if (proj.isNeedsUpgrade()) {
      jsx3.IDE.confirm(null, "This project was created by an earlier version of General Interface Builder." +
          " Once this project has been opened by this version of General Interface Builder it may not be " +
          "compatible with prior versions. Continue?",
          function(d) {
            d.doClose();
            proj.upgrade();
            cb.done(true); },
          function(d) {
            d.doClose();
            cb.done(false); },
          "Continue", "Cancel");
    } else {
      cb.done(true);
    }
  } else {
    cmp = jsx3.util.compareVersions(v, jsx3.System.getVersion());

    if (cmp > 0) {
      jsx3.IDE.alert(null, "This project was created by a higher version of General Interface Builder (" +
              v + ") and cannot be opened by this version (" + jsx3.System.getVersion() + ").",
          function(d) {
            d.doClose();
            cb.done(false);
          });
    } else {
      cb.done(true);
    }
  }
});

jsx3.ide._onStartUp4 = jsx3.$Y(function(cb) {
  this._addJob(function() { jsx3.ide.getPlugIn("jsx3.ide.ui").getPaletteManager().startup(); });

  var settings = jsx3.ide.getIDESettings();
  
  var bShowWelcome = settings.get('prefs', 'builder', 'welcome_v', jsx3.getVersion());
  if ((bShowWelcome || bShowWelcome == null) && !jsx3.app.Browser.getLocation().getQueryParam("jsxnowelc"))
    this._addJob(jsx3.ide.showWelcomeDialog);

  // skip opening previous files if control key held down (may require restarting browser)
  if (jsx3.STARTUP_EVENT == null || ! jsx3.STARTUP_EVENT.ctrlKey())
    this._addJob(jsx3.ide._openPreviouslyOpenFiles);
  else
    // otherwise clear out the saved files
    this._addJob(function(){ jsx3.ide.syncPreviouslyOpenFiles(null,[]); });

  cb.done();
});

/* @jsxobf-clobber */
jsx3.ide._addinStartup = jsx3.$Y(function(cb) {
  var proj = cb.args()[0];

  var alert = jsx3.IDE.alert("Loading Addins", "Loading addins, please wait.",
      null, false, {nonModal:true});

  jsx3.sleep(function() {
    var rv = jsx3.ide.loadBuilderAndProjectAddins(proj.getRequiredAddins());
    rv.when(function() {
      alert.doClose();
      cb.done();
    });
  });
});

jsx3.ide.getIDESettings = function() {
  if (jsx3.ide._SETTINGS == null) {
    var settingsFile = null;
    var strPath = "settings/builder.xml";
    var homeDir = jsx3.ide.getCurrentUserHome();

    if (homeDir) {
      settingsFile = homeDir.resolve(strPath);

      // make sure that builder prefs file exists
      if (! settingsFile.exists()) {
        var templateDir = jsx3.ide.getBuilderRelativeFile(jsx3.ide.HOME_TEMPLATE_DIR);
        var templateFile = templateDir.resolve(strPath);
        settingsFile.getParentFile().mkdirs();
        templateFile.copyTo(settingsFile);
        settingsFile.setReadOnly(false);
      }
    }

    /* @jsxobf-clobber */
    jsx3.ide._SETTINGS = new jsx3.ide.Preferences(settingsFile);
  }
  return jsx3.ide._SETTINGS;
};

jsx3.ide._onBeforeShutdown = function(objEvent) {
  jsx3.ide._persistSplittersOnShutdown();
  var settings = jsx3.ide.getIDESettings();
  settings.save();

  if (jsx3.ide.PROJECT) {
    if (jsx3.ide.isAnyEditorDirty())
      objEvent.returnValue = "WARNING: You have unsaved changes in your project. Click on Cancel to go back to General Interface Builder to save your changes.";
    else
      objEvent.returnValue = "Unloading the current page will close General Interface Builder and end your session.";
  }
};

jsx3.ide.onShutdown = function(objEvent) {
  jsx3.IDE.publish({subject: "shutdown"});
};

jsx3.ide._openPreviouslyOpenFiles = function() {
  var objFiles = jsx3.ide.getPreviouslyOpenFiles();
  if (objFiles == null)
    objFiles = jsx3.ide.PROJECT.getDefaultOpenFiles();

  if (objFiles.length == 0) return;

  var alert = jsx3.IDE.alert(
    "Opening Project",
    "Opening component files for project " + jsx3.ide.PROJECT.getPathFromHome() + " ...",
    jsx3.ide._cancelPreviouslyOpenFiles,
    "Cancel"
  );

  this._pauseJobs();
  this._addJob(function(){ alert.doClose(); }, 0);

  /* break stack after each file load ... */
  this._addJob(new jsx3.util.Job(null, function() {
    var c = null;

    jsx3.$A(objFiles).each(function(e) {
      var rsrc = jsx3.ide.getResourceByFile(e);
      if (rsrc) {
        c = jsx3.ide.doOpenForEdit(e, rsrc.type, false, c); // last arg for temporal ordering only
      }
    });

    if (c) {
      c.when(jsx3.$F(this.finish).bind(this));
      return jsx3.util.Job.WAIT;
    }
  }));

  this._startJobs();
};

jsx3.ide._cancelPreviouslyOpenFiles = function(d) {
  this._pauseJobs();
  d.doClose();
  jsx3.ide.closeAll().when(function() {
    jsx3.ide.QUEUE.clear();
    jsx3.ide._startJobs();
  });
};

jsx3.ide._getSystemURI = function() {
  return jsx3.app.Browser.getLocation();
};

jsx3.ide.getSystemDirFile = function() {
  // cache result since it never changes
  if (!jsx3.ide._SYSTEM_DIRFILE) {
    jsx3.ide._SYSTEM_DIRFILE = jsx3.ide.getPlugIn("jsx3.io").getFileForURI(jsx3.ide._getSystemURI()).resolve(".");
  }
  return jsx3.ide._SYSTEM_DIRFILE;
};

jsx3.ide.getSystemRelativeFile = function(strURI) {
  var uri = jsx3.net.URI.valueOf(strURI);
  if (uri.isAbsolute())
    return jsx3.ide.getPlugIn("jsx3.io").getFileForURI(uri);
  else
    return this.getSystemDirFile().resolve(strURI);
};

jsx3.ide.getBuilderRelativeFile = function(strURI) {
  return this.getSystemRelativeFile(jsx3.IDE.resolveURI(strURI));
};

jsx3.ide.relativePathTo = function(objFile) {
  return jsx3.ide.getSystemDirFile().relativePathTo(objFile);
};

jsx3.ide.open = function() {
  var dialog = jsx3.IDE.getJSXByName("jsxdialog");
  if (dialog) {
    dialog.focus();
    return;
  }

  var home = jsx3.ide.getCurrentUserHome();
  jsx3.ide.getPlugIn("jsx3.io.browser").chooseFiles(jsx3.IDE.getRootBlock(), {
      name:"jsxdialog", modal:false,
      folder: jsx3.ide.getCurrentDirectory(), baseFolder: home,
      onChoose: function(objFiles) {
        for (var i = 0; i < objFiles.length; i++) {
          jsx3.ide.doOpenForEdit(objFiles[i]);
        }

        if (objFiles.length > 0)
          jsx3.ide.setCurrentDirectory(objFiles[0].getParentFile());
      }
  });
};

jsx3.ide.doOpenResources = function(strResourceIds) {
  var notFound = [];
  for (var i = 0; i < strResourceIds.length; i++) {
    var objFile = jsx3.ide.getFileForResource(strResourceIds[i]);
    if (objFile != null && objFile.isFile()) {
      var rsrc = jsx3.ide.getResourceById(strResourceIds[i]);
      jsx3.ide.doOpenForEdit(objFile, rsrc.getType(), false);
    }
    else
      notFound.push(strResourceIds[i]);
  }
  if (notFound.length > 0) {
    var message = (notFound.length == 1) ?
        "The file for resource <code>" + notFound[0] + "</code> was not found. Right-click the file in the Project Files palette, select Edit Profile, and confirm that the resource URI corresponds to a file on disk." :
        "The files for resources {<code>" + notFound.join(", ") + "</code>} were not found. Right-click each file in the Project Files palette, select Edit Profile, and confirm that its resource URI corresponds to a file on disk.";
    jsx3.IDE.alert("File" + (notFound.length == 1 ? "" : "s") + " Not Found", message);
  }
};

jsx3.ide.saveAndReload = function(editor) {
  editor = editor || jsx3.ide.getActiveEditor();
  // a GUI component will actually be reverted since it doesn't support the idea of reload
  if (editor != null && jsx3.ide.ComponentEditor && editor instanceof jsx3.ide.ComponentEditor)
    jsx3.ide.save(editor).when(function(rv) {if (rv) jsx3.ide.revert(editor, true);});
  // all others are saved and then reloaded
  else
    jsx3.ide.save(editor).when(function(rv) {if (rv) jsx3.ide.reload(editor);});
};

jsx3.ide.saveAll = jsx3.$Y(function(cb) {
  var intStartAt = cb.args()[0];

  var editors = jsx3.ide.getAllEditors();
  if (intStartAt == null)
    intStartAt = 0;

  if (intStartAt < editors.length) {
    var editor = editors[intStartAt];
    jsx3.ide.save(editor).when(function(rv) {
      if (rv) jsx3.ide.saveAll(intStartAt+1).when(cb);
    });
  } else {
    cb.done();
  }
});

jsx3.ide.save = jsx3.$Y(function(cb) {
  var editor = cb.args()[0] || jsx3.ide.getActiveEditor();

  if (!editor) {
    cb.done(false);
  } else if (editor.isUnsaved()) {
    jsx3.ide.saveAs(editor).when(cb);
  } else {
    editor.preSaveCheck().when(function(rv) {
      if (rv) {
        cb.done(false);
      } else {
        if (editor.save()) {
          cb.done(true);
        } else {
          var objFile = editor.getOpenFile();
          var strPath = objFile != null ? jsx3.ide.getActiveProjectDirectory().relativePathTo(objFile) : editor.getTitle();
          jsx3.IDE.alert(
            "Save Failed",
            "The file <b>" + jsx3.net.URI.decode(strPath) +
              "</b> was not saved because of an error. Check that you have permission to write to the file, that it is " +
              "not locked, and that the path is valid for this operating system.<br/><br/>" +
              "Consult the System Log for a more detailed error report.",
            jsx3.$F(function(d) { d.doClose(); cb.done(false); }).bind(this), 
            null, {width: 300, height: 175}
          );
        }
      }
    });
  }
});

jsx3.ide.saveAndClose = jsx3.$Y(function(cb) {
  var editor = cb.args()[0] || jsx3.ide.getActiveEditor();

  if (editor) {
    jsx3.ide.save(editor).when(function(rv) {
      if (rv)
        jsx3.IDE.EDITOR_MGR.close(editor);
      cb.done(rv);
    });
  } else {
    cb.done(false);
  }
});

jsx3.ide.saveAs = jsx3.$Y(function(cb) {
  var editor = cb.args()[0] || jsx3.ide.getActiveEditor();

  if (!editor == null) {
    cb.done(false);
  } else {
    var home = jsx3.ide.getCurrentUserHome();
    jsx3.ide.getPlugIn("jsx3.io.browser").saveFile(jsx3.IDE.getRootBlock(), {
        name:"jsx_ide_file_dialog", modal:true,
        folder: jsx3.ide.getCurrentDirectory(), baseFolder: home,
        onChoose: jsx3.$F(function(objFile) {
          jsx3.ide._saveAsChoose(objFile, editor).when(cb);
        }).bind(this)
    });
  }
});

jsx3.ide._saveAsChoose = jsx3.$Y(function(cb) {
  var objFile = cb.args()[0], editor = cb.args()[1];

  var existingEditor = jsx3.ide.getEditorForFile(objFile);

  editor.preSaveCheck().when(function(rv){
    if (rv) {
      cb.done(false);
    } else {
      if (existingEditor != null) {
        jsx3.ide.close(existingEditor).when(
            function(){jsx3.ide._saveAsChoose(objFile, editor).when(cb);});
      } else if (editor.saveAs(objFile)) {
        var type = editor.getFileType();
        if (type == null) type = jsx3.ide.getFileType(objFile);
        jsx3.ide.addResourceToProject(objFile, type);
        jsx3.ide.setCurrentDirectory(objFile.getParentFile());
        cb.done(true);
      } else {
        jsx3.IDE.alert(
          "Save Failed",
          "The file <b>" + jsx3.net.URI.decode(jsx3.ide.getActiveProjectDirectory().relativePathTo(objFile)) +
            "</b> was not saved because of an error. Check that you have permission to write to the file, that it is " +
            "not locked, and that the path is valid for this operating system.<br/><br/>" +
            "Consult the System Log for a more detailed error report.",
          function(d) { d.doClose(); cb.done(false); }, 
          null, {width: 300, height: 175}
        );
      }
    }
  });
});

jsx3.ide.saveCopyToLib = jsx3.$Y(function(cb) {
  var editor = cb.args()[0] || jsx3.ide.getActiveEditor();

  if (!editor == null) {
    cb.done(false);
  } else {
    var protoDir = jsx3.ide.getHomeRelativeFile('prototypes');
    jsx3.ide.getPlugIn("jsx3.io.browser").saveFile(jsx3.IDE.getRootBlock(), {
        name:"jsx_ide_file_dialog", modal:true,
        folder: protoDir, baseFolder: protoDir,
        onChoose: jsx3.$F(function(objFile) {
          editor.save(objFile);
          cb.done();
        }).bind(this)
    });
  }
});

jsx3.ide.close = jsx3.$Y(function(cb) {
  var editor = cb.args()[0] || jsx3.ide.getActiveEditor();

  if (!editor) {
    cb.done(false);
  } else if (!editor.isDirty()) {
    jsx3.IDE.EDITOR_MGR.close(editor);
    cb.done(true);
  } else {
    jsx3.IDE.confirm(
      "Confirm Close",
      "Save file " + editor.getTitle() + " before closing? Otherwise changes will be lost.",
      function(d){ d.doClose(); jsx3.ide.saveAndClose(editor).when(cb);},
      function(d){ d.doClose(); cb.done(false); },
      "Save", "Cancel", 1,
      function(d){ d.doClose(); jsx3.IDE.EDITOR_MGR.close(editor); cb.done(true);},
      "Don't Save"
    );
  }
});

jsx3.ide.closeAll = jsx3.$Y(function(cb) {
  var editors = jsx3.ide.getAllEditors().concat();
  for (var i = 0; i < editors.length; i++) {
    var editor = editors[i];
    if (editor.isDirty()) {
      jsx3.ide.close(editor).when(function() {jsx3.ide.closeAll().when(cb);});
      return;
    } else {
      jsx3.IDE.EDITOR_MGR.close(editor);
    }
  }

  cb.done();
});

jsx3.ide.revert = jsx3.$Y(function(cb) {
  var editor = cb.args()[0] || jsx3.ide.getActiveEditor();
  var bConfirmed = cb.args()[1];

  if (bConfirmed) {
    editor.revert();
    cb.done();
  } else {
    jsx3.IDE.confirm(
      "Confirm Revert",
      "Are you sure you want to revert the file <b>" + editor.getTitle() + "</b> to its last saved state? All changes will be lost.",
      function(d){
        d.doClose();
        editor.revert();
        cb.done();
      },
      null, "Revert", "Cancel", 2);
  }
});

jsx3.ide.revertAll = function(bConfirmed) {
  if (bConfirmed) {
    var editors = jsx3.ide.getAllEditors();
    for (var i = 0; i < editors.length; i++) {
      editors[i].revert();
    }
  } else {
    jsx3.IDE.confirm(
      "Confirm Revert All",
      "Are you sure you want to revert each open file to its last saved state? All changes will be lost.", function(d){d.doClose(); jsx3.ide.revertAll(true);},
      null, "Revert All", "Cancel", 2);
  }
};

jsx3.ide.reload = function(editor) {
  editor = editor || jsx3.ide.getActiveEditor();
  if (editor) {
    var objFile = editor.getOpenFile();
    var resource = jsx3.ide.getResourceByFile(objFile);
    if (resource) {
      // BUG: reloading JavaScript seems to cause problems without a delay?
      window.setTimeout(function(){jsx3.ide.doReloadResourceObj(resource);}, 100);
    } else {
      jsx3.ide.LOG.error("Could not reload resource " + objFile + " because no resource was found with that path. " +
          "Make sure that the config.xml file is updated to the 3.2+ format.");
    }
  }
};

jsx3.ide.doTextEditorKeyDown = function(objEvent, objTextBox, objTab) {
  var objTextBoxGUI = objTextBox.getRendered();

  //processes key down events for the text editor in the IDE; forces 'dirty' state so user knows it needs to be saved
  if (objEvent.ctrlKey() && objEvent.spaceKey() && !objEvent.shiftKey() && !objEvent.altKey()) {
    // determine which context menu should be displayed
    var strMenuId = null;
    if (objTab == null) {
      strMenuId = "jsxmenu_typeaheadscript";
    } else {
      var objEditor = jsx3.ide.getEditorForTab(objTab);
      if ((jsx3.ide.TextEditor && objEditor instanceof jsx3.ide.TextEditor) ||
          (jsx3.ide.CacheEditor && objEditor instanceof jsx3.ide.CacheEditor)) {
        var type = objEditor.getFileType();
        strMenuId = "jsxmenu_typeahead" + type;
      }
    }

    var objMenu = jsx3.IDE.getJSXByName(strMenuId);

    // this typeahead menu is loaded lazily since it's so large
    if (strMenuId == "jsxmenu_typeaheadscript" && objMenu == null) {
      var f = jsx3.ide.getBuilderRelativeFile("language/eng/typeahead_script.xml");
      if (f.isFile()) {
        var objParent = jsx3.IDE.getJSXByName("jsxmenu_typeaheadcss").getParent();
        objMenu = objParent.load("xml/menu-typeahead-script.xml");
      } else {
        jsx3.ide.LOG.warn("The JavaScript editor type-ahead menu is disabled because the data file does not exist.");
      }
    }

    if (objMenu) {
      objTextBoxGUI._jsxsel = jsx3.html.getSelection(objTextBoxGUI);

      // cancel the keys and show the context menu
      objEvent.cancelBubble();
      objEvent.cancelReturn();
      objMenu.showContextMenu(objEvent, objTextBox, null,
          {L: objTextBoxGUI._jsxsel.getOffsetLeft(), T:objTextBoxGUI._jsxsel.getOffsetTop()});
//      objMenu.subscribe(jsx3.gui.Interactive.HIDE, jsx3.ide.onTypeAheadClosed);
    }
  } else if (objTab != null) {
    var editor = jsx3.ide.getEditorForTab(objTab);
    if (! editor.isDirty()) {
      var preText = editor.getEditorText();
      // wait until the event bubbles up and maybe changes the text in the field
      jsx3.sleep(function(){
        if (editor.isOpen() && preText != editor.getEditorText())
          editor.setDirty(true);
      });
    }
  }
};

jsx3.ide.onTypeAheadClosed = function(objEvent) {
  var objMenu = objEvent.target;
//  objMenu.unsubscribe(jsx3.gui.Interactive.HIDE, jsx3.ide.onTypeAheadClosed);
  jsx3.ide.doInsertCode(null, objMenu.getContextParent());
};

jsx3.ide.doInsertCode = function(objRecord, objJSXText, TYPE) {
  var objTextBoxGUI = objJSXText.getRendered();
  var caretPos = objTextBoxGUI._jsxsel;

  if (caretPos != null) {
    objTextBoxGUI._jsxsel = null;

    // new JS typeahead syntax
    var strCode = objRecord ? objRecord.getAttribute("syntax") : null;
    // older XML, etc syntax
    if (strCode == null) {
      var syntaxNode = objRecord.selectSingleNode("syntax");
      if (syntaxNode) strCode = syntaxNode.getValue();
    }

    if (strCode != null) {
      var selText = caretPos.getText();
      caretPos.setText(selText.charAt(selText.length - 1) == ' ' ? strCode + ' ' : strCode);

      var objTab = objJSXText.getAncestorOfType(jsx3.gui.Tab);
      if (objTab) {
        objTab = objTab.getAncestorOfType(jsx3.gui.Tab);
        if (objTab) {
          var objEditor = jsx3.ide.getEditorForTab(objTab);
          if (objEditor) objEditor.setDirty(true);
        }
      }
    }

    caretPos.insertCaret("end");
  }
};

jsx3.ide.getDocumentType = function(objDocument) {
  if (objDocument.hasError()) return "xml";
  //determines by the root namespace uri, whether or not the documet is xml or xsl
  var strNSURI = objDocument.getRootNode().getNamespaceURI();
  //TO DO: get all versions of XSL we support--if we miss one, no big deal, it will be opened as an xml doc
  return (strNSURI == "http://www.w3.org/1999/XSL/Transform" || strNSURI == "http://www.w3.org/TR/WD-xsl") ? "xsl" : "xml";
};

// HANDLING PALETTE PLACEMENT

jsx3.ide._adjustSplittersOnStartup = function() {
  var settings = jsx3.ide.getIDESettings();

  for (var i = 5; i > 0; i--) {
    var splitter = jsx3.IDE.getJSXByName("jsx_ide_splitter" + i);
    var pct = settings.get('window', 'splitters', splitter.getName());
    if (pct != null)
      splitter.setSubcontainer1Pct(pct, true);
    else if (splitter.jsxdefault1pct != null)
      splitter.setSubcontainer1Pct(splitter.jsxdefault1pct, true);
  }
};

jsx3.ide._persistSplittersOnShutdown = function() {
  var splitters = jsx3.IDE.getBodyBlock().findDescendants(
      function(x){ return x instanceof jsx3.gui.Splitter; }, false, true);
  var settings = jsx3.ide.getIDESettings();

  for (var i = 0; i < splitters.length; i++) {
    var splitter = splitters[i];
    var pct = settings.set('window', 'splitters', splitter.getName(), splitter.getSubcontainer1Pct());
  }
};

jsx3.ide.writeUserFile = function(objFile, strContent) {
  var settings = jsx3.ide.getIDESettings();
  var prefs = settings.get('prefs', 'builder') || {};
  return objFile.write(strContent,
      {charset: prefs.outputcharset, linebreakmode:prefs.outputlinesep, charsetfailover:true});
};

jsx3.ide.writeUserXmlFile = function(objFile, objDoc) {
  var tmpFile = objFile.getFileSystem().createTempFile("gi-ide.xml");
  var settings = jsx3.ide.getIDESettings();
  var prefs = settings.get('prefs', 'builder') || {};

  var encodeCharset = prefs.xmlencodeas ? prefs.xmloutputcharset : prefs.outputcharset;
  var ok = false;

  if (prefs.addcharset) {
    if (encodeCharset && tmpFile.write(this._makeXmlCloseTags(objDoc.serialize(true, encodeCharset)),
            {charset:encodeCharset, linebreakmode:prefs.outputlinesep}))
      ok = true;
    else
      ok = tmpFile.write(this._makeXmlCloseTags(objDoc.serialize()),
          {linebreakmode:prefs.outputlinesep, charsetfailover:true});
  } else {
    ok = tmpFile.write(this._makeXmlCloseTags(objDoc.serialize()),
          {charset:encodeCharset, linebreakmode:prefs.outputlinesep, charsetfailover:true});
  }

  if (ok) {
    var doc = new jsx3.xml.Document().load(tmpFile.toURI());
    ok = ! doc.hasError();

    if (ok) {
      tmpFile.renameTo(objFile);
    } else {
      jsx3.ide.LOG.error("The XML file " + objFile + " was not saved because parsing the written file produced the following error: " + doc.getError());
      tmpFile.deleteFile();
    }
  }

  return ok;
};

jsx3.ide.writeBuilderFile = function(objFile, strContent) {
  return objFile.write(strContent, {charset:"utf-8", linebreakmode:"unix", charsetfailover:true, quiet:true});
};

jsx3.ide.writeBuilderXmlFile = function(objFile, objDoc) {
  if (objFile.write(this._makeXmlCloseTags(objDoc.serialize(true, "utf-8")),
        {charset:"utf-8", linebreakmode:"unix", quiet:true}))
    return true;
  else
    return objFile.write(this._makeXmlCloseTags(objDoc.serialize(true)),
        {linebreakmode:"unix", charsetfailover:true});
};

/** @private @jsxobf-clobber */
jsx3.ide._PRETTY_TEMPLATE_URI = jsx3.IDE.resolveURI("xml/xmlpretty.xsl");

jsx3.ide.makeXmlPretty = function(objXML, bDoc) {
  var objTemplate = jsx3.getSystemCache().getOrOpenDocument(this._PRETTY_TEMPLATE_URI, null, jsx3.xml.XslDocument.jsxclass);
  return bDoc ? objTemplate.transformToObject(objXML) :
         jsx3.ide._makeXmlCloseTags(objTemplate.transform(objXML));
};

/** @private @jsxobf-clobber */
jsx3.ide._PRETTY_EMPTY_TAG_COLLAPSER = /<([\w\:]+)( [^<>]*)?(?!\/)><\/([\w\:]+)>/g;

/* @jsxobf-clobber */
jsx3.ide._makeXmlCloseTags = function(strXML) {
  if (jsx3.getXmlVersion() <= 3) {
    var tokens = strXML.split("<![CDATA[");
    for (var i = 0; i < tokens.length; i++) {
      if (i == 0) {
        tokens[i] = tokens[i].replace(jsx3.ide._PRETTY_EMPTY_TAG_COLLAPSER, jsx3.ide._makeXmlCloseTagsRep);
      } else {
        var bits = tokens[i].split("]]>", 2);
        bits[1] = bits[1].replace(jsx3.ide._PRETTY_EMPTY_TAG_COLLAPSER, jsx3.ide._makeXmlCloseTagsRep);
        tokens[i] = bits.join("]]>");
      }
    }
    return tokens.join("<![CDATA[");
  } else {
    return strXML;
  }
};

/* @jsxobf-clobber */
jsx3.ide._makeXmlCloseTagsRep = function(m, _1, _2, _3) {
  if (_1 == _3) {
    return "<" + _1 + (_2 != null ? _2 : "") + "/>";
  } else {
    return m;
  }
};

jsx3.ide.getPlugIn = function(strId) {
  return jsx3.amp.Engine.getEngine(jsx3.IDE).getPlugIn(strId);
};
