/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.ide.showLicenseAgreement = function() {
  jsx3.ide._pauseJobs();

  var plugin = jsx3.ide.getPlugIn("jsx3.ide.ui.license");
  plugin.load().when(function() {
    plugin.openTool();
  });
};

// for better stack traces
jsx3.Package.definePackage("jsx3.ide", function(){});

if (! jsx3.app.Browser.win32) {
  jsx3.ide.LOG.warn("@gi.ide.notsupported@");
}
