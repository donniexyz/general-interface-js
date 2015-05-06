/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.$O(jsx3.ide).extend({

DEFAULT_USER_HOME: "TibcoGI",
HOME_TEMPLATE_DIR: "GI_User",

/**
 * @return {boolean}
 */
verifyUserHome: function() {
  var file = jsx3.ide.getCurrentUserHome();
  if (file != null) {
    if (! jsx3.ide.isValidUserHome(file)) {
      jsx3.ide.LOG.error("When running in Internet Explorer, your workspace must be on the same drive as the General Interface installation.");
      return false;
    }

    // set JSX environment variable according to user directory location
    jsx3.setEnv("jsxhomepath", jsx3.ide.getSystemDirFile().toURI().relativize(file.toURI()));
    // make sure that all major directories exist
    jsx3.ide.createUserHome(file);

    return true;
  } else {
    return false;
  }
},

/** @private @jsxobf-clobber */
isValidUserHome: function(file) {
  if (jsx3.CLASS_LOADER.IE) {
    var dir1 = jsx3.ide.getSystemDirFile().getAbsolutePath();
    var dir2 = file.getAbsolutePath();
    var index1 = dir1.indexOf(":");
    var index2 = dir1.indexOf(":");
    if (index1 >= 0 && index2 >= 0) {
      var drive1 = dir1.substring(dir1.lastIndexOf("/", index1), index1).toUpperCase();
      var drive2 = dir2.substring(dir2.lastIndexOf("/", index2), index2).toUpperCase();
      return drive1 == drive2;
    } else {
      return index1 < 0 && index2 < 0;
    }
  }
  return true;
},

/**
 *
 */
showNewUserHomeDialog: function() {
  var plugin = jsx3.ide.getPlugIn("jsx3.ide.newhome");
  plugin.load().when(function() {
    plugin.openTool();
  });
},

onSelectNewUserHome: function(objDir, objAlerter) {
  var currentHome = jsx3.ide.getSavedUserHome();

  if (! objDir.equals(currentHome) || ! objDir.isDirectory()) {
    if (objDir.getFileSystem().hasWrite()) {
      if (objDir.exists() && !objDir.isDirectory()) {
        objAlerter.alert(null, "File " + objDir + " already exists and is not a directory.");
        return false;
      }

      if (! jsx3.ide.isValidUserHome(objDir)) {
        objAlerter.alert(null, "When running in Internet Explorer, your workspace must be on the same drive as the General Interface installation.");
        return false;
      }

      var rv;
      jsx3.tcf(function() {
          objDir.mkdirs();
          jsx3.ide.createUserHome(objDir);
        }, function(e) {
          e = jsx3.NativeError.wrap(e);
          objAlerter.alert(null, "Error creating workspace: " + e);
          jsx3.ide.LOG.error("Error creating user directory " + objDir + ".", e);
          rv = false;
        });

      if (rv != null)
        return rv;
    }

    jsx3.ide._setCurrentUserHome(objDir);
  }

  return true;
},

/**
 * @param objDir {jsx3.io.File}
 */
createUserHome: function(objDir) {
  var templateDir = jsx3.ide.getBuilderRelativeFile(jsx3.ide.HOME_TEMPLATE_DIR);
  if (templateDir.isDirectory()) {
    if (templateDir.equals(objDir) || objDir.isDescendantOf(templateDir))
      throw new jsx3.Exception("Illegal workspace: " + objDir);

    var subItems = templateDir.listFiles();

    for (var i = 0; i < subItems.length; i++) {
      var source = subItems[i];
      if (jsx3.ide.isFileToIgnore(source)) continue;

      var dest = objDir.resolve(source.getName());
      if (! dest.exists()) {
        jsx3.ide.LOG.debug("Creating " + dest + ".");
        this.copyDirectory(source, dest);
      } else {
        jsx3.ide.LOG.debug("Skipping " + dest + ".");
      }
    }

    // specifically create and modify the launcher.html and launcher_ide.html files.
    var files = ["JSXAPPS/launcher.html", "JSXAPPS/launcher_ide.html"];
    var shellPath = jsx3.ide.getSystemRelativeFile("shell.html").toURI();
    var builderPath = jsx3.ide.getSystemRelativeFile("GI_Builder.html").toURI();
    for (var i = 0; i < files.length; i++) {
      var path = files[i];
      var source = templateDir.resolve(path);
      var dest = objDir.resolve(path);
      
      var contents = source.read();
      if (contents) {
        contents = contents.replace(/@SHELLPATH@/g, shellPath).replace(/@BUILDERPATH@/g, builderPath);
      }
      jsx3.ide.writeBuilderFile(dest, contents);
    }
  } else {
    throw new jsx3.Exception("GI_USER template directory not found: " + templateDir);
  }
},

copyDirectory: function(fromDir, toDir) {
  toDir.mkdirs();
  fromDir.listFiles().each(function (e) {
    if (!jsx3.ide.isFileToIgnore(e)) {
      var dest = toDir.resolve(e.getName());

      if (e.isFile()) {
        e.copyTo(dest);
      } else if (e.isDirectory()) {
        jsx3.ide.copyDirectory(e, dest);
      }
    }
  });
},

getHomeRelativeFile: function(strURI) {
  return this.getCurrentUserHome().resolve(strURI);
},

getSavedUserHome: function() {
  var provider = jsx3.ide.getPlugIn("jsx3.amp.persist").getFirstProvider();
  if (provider) {
    var path = provider.get("workspace");
    if (path) {
      var file = jsx3.ide.getPlugIn("jsx3.io").getFileForURI(jsx3.net.URI.valueOf(path));
      if (file && file.isDirectory())
        return file;
    }
  } else {
    jsx3.ide.LOG.error("No provider is available for persisting data between browser sessions.");
  }

  return null;
},

/**
 * @return {jsx3.io.File}
 */
getCurrentUserHome: function() {
  if (!jsx3.ide._CURRENT_USER_HOME) {
    // can 
    var home = jsx3.app.Browser.getLocation().getQueryParam('jsxhome');
    if (home) {
      var homeDir = jsx3.ide.getSystemRelativeFile(home);
      if (homeDir.isDirectory())
        jsx3.ide._CURRENT_USER_HOME = homeDir;
    }

    if (!jsx3.ide._CURRENT_USER_HOME)
      jsx3.ide._CURRENT_USER_HOME = jsx3.ide.getSavedUserHome();
  }
  return jsx3.ide._CURRENT_USER_HOME;
},

_setCurrentUserHome: function(objDir) {
  var provider = jsx3.ide.getPlugIn("jsx3.amp.persist").getFirstProvider();
  if (provider) {
    if (objDir)
      provider.put("workspace", objDir.toURI().toString());
    else
      provider.remove("workspace");
  } else {
    jsx3.ide.LOG.error("No provider is available for persisting data between browser sessions.");
  }
}

});
