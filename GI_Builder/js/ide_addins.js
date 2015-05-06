/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.$O(jsx3.ide).extend({

getJsxAddins: function() {
  var addins = [];
  
  var jsxFolder = jsx3.ide.getSystemRelativeFile(jsx3.ADDINSPATH);
  if (jsxFolder.isDirectory()) {
    var folders = jsxFolder.listFiles();
    for (var i = 0; i < folders.length; i++) {
      var addinDir = folders[i];
      if (jsx3.ide.isFileToIgnore(addinDir)) continue;

      if (jsx3.ide._isAddinDirectory(addinDir))
        addins.push(new jsx3.app.AddIn(addinDir.getName()));
    }
  }

  var userFolder = jsx3.ide.getHomeRelativeFile("addins");
  if (userFolder.isDirectory()) {
    var folders = userFolder.listFiles();
    for (var i = 0; i < folders.length; i++) {
      var addinDir = folders[i];
      if (jsx3.ide.isFileToIgnore(addinDir)) continue;

      if (jsx3.ide._isAddinDirectory(addinDir))
        addins.push(new jsx3.app.AddIn("user:" + addinDir.getName()));
    }
  }
  
  return addins;
},

/* @jsxobf-clobber */
_isAddinDirectory: function(objFile) {
  if (objFile.isDirectory()) {
    var configFile = objFile.resolve(jsx3.CONFIG_FILE);
    if (configFile.isFile()) return true;
  }
  return false;
},

loadBuilderAndProjectAddins: jsx3.$Y(function(cb) {
  var addins = cb.args()[0];

  var jobs = [];
  for (var i = 0; i < addins.length; i++) {
    if (jsx3.util.compareVersions(addins[i].getJsxVersion(), jsx3.System.getVersion()) <= 0) {
      var job = jsx3.CLASS_LOADER.loadAddin(addins[i]);
      if (job) jobs.push(job);
    } else {
      jsx3.ide.LOG.error("Addin " + addins[i] + " requires JSX version " +
          addins[i].getJsxVersion() + " or greater.");
    }
  }

  var graph = null;
  for (var i = 0; i < jobs.length && graph == null; i++)
    graph = jobs[i].graph();

  if (graph) {
    graph.addJob(new jsx3.util.Job("jsx3.ide.addins", function() { cb.done(); }), jobs);
  } else {
    cb.done();
  }
})

});
