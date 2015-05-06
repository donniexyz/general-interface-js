/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.$O(this).extend({

openApiHelp: function(bAsWindow) {
  var settings = jsx3.ide.getIDESettings();

  if (bAsWindow == null) {
    bAsWindow = settings.get("apihelp", "aswindow");
    if (bAsWindow == null) bAsWindow = false;
  } else {
    settings.set("apihelp", "aswindow", bAsWindow);
  }

  this.getLog().debug("doOpenApiHelp window:" + bAsWindow);

  var w = this.getServer().getAppWindow("api_help");
  var success = false;
  if (bAsWindow) {
    if (w == null) {
      this.getResource("as_window").load().when(jsx3.$F(function() {
        w = this.getServer().loadAppWindow(this.getResource("as_window").getData(), this);
        w.getPlugIn = jsx3.$F(function() { return this; }).bind(this);
        w.subscribe(jsx3.gui.Window.DID_OPEN, this, this._onWindowOpen);
        w.subscribe(jsx3.gui.Window.WILL_CLOSE, this, this._saveWindowState);
        w.subscribe(jsx3.gui.Window.DID_FOCUS, this, this._saveWindowState);
        this._openWindow2(w, bAsWindow);
      }).bind(this));
      return;
    } else {
      this._openWindow2(w, bAsWindow);
    }
  } else {
    this._openWindow2(w, bAsWindow);
  }
},

_openWindow2: function(w, bAsWindow) {
  var success = false;

  if (bAsWindow && w) {
    if (w.isOpen())
      w.focus();
    else
      w.open();

    success = w.isOpen();
  }

  if (! success) {
    var dialog = this.getServer().getRootBlock().getChild('jsx_ide_api_dialog');
    this.getLog().debug("switching to dialog: " + dialog);

    if (dialog == null) {
      this.getLog().debug("doOpenApiHelp loading dialog component");
      this.getResource("as_dialog").load().when(jsx3.$F(function() {
        dialog = this.loadRsrcComponent("as_dialog", this.getServer().getRootBlock());
        this._openDialog2(dialog, w);
      }).bind(this));
    } else {
      this._openDialog2(dialog, w);
    }
  }
},

_openDialog2: function(dialog, win) {
  if (!dialog.getHelpBlock()) {
    if (win && win.getHelpBlock()) {
      this.getLog().debug("doOpenApiHelp adopting API help content");
      dialog.getHelpBlockParent().adoptChild(win.getHelpBlock());
    } else {
      this.getLog().debug("doOpenApiHelp loading API help content component");
      jsx3.sleep(function(){
        this.loadRsrcComponent("ui", dialog.getHelpBlockParent());
      }, null, this);
    }
  }

  if (win && win.isOpen())
    win.close();

  jsx3.sleep(function(){ dialog.focus(); });
},

_onWindowOpen: function(objEvent) {
  this.getLog().debug("_onWindowOpen " + objEvent.target.getName());

  var w = objEvent.target;
  if (w.getHelpBlock() == null) {
    var dialog = this.getServer().getRootBlock().getChild('jsx_ide_api_dialog');
    if (dialog && dialog.getHelpBlock()) {
      this.getLog().debug("_onWindowOpen adopting");
      w.getHelpBlockParent().adoptChild(dialog.getHelpBlock());
    } else {
      this.getLog().debug("_onWindowOpen loading");
      this.loadRsrcComponent("ui", w.getHelpBlockParent());
    }

    if (dialog)
      dialog.getParent().removeChild(dialog);
  }

  var settings = jsx3.ide.getIDESettings();
  var windowPos = settings.get('apihelp', 'wposition');
  if (windowPos && windowPos.left) {
    w.moveTo(windowPos.left, windowPos.top);
    w.setWidth(windowPos.width);
    w.setHeight(windowPos.height);
    w.constrainToScreen();
  }
},

_saveWindowState: function(objEvent) {
  var w = objEvent.target;
  if (w.isOpen()) {
    var settings = jsx3.ide.getIDESettings();
    var windowPos = {left: w.getOffsetLeft(), top: w.getOffsetTop(),  width: w.getWidth(), height: w.getHeight()};
    settings.set('apihelp', 'wposition', windowPos);
  }
},

onApiHelpMenu: function(objMenu) {
  var settings = jsx3.ide.getIDESettings();
  var apisets = settings.get('apihelp', 'settings');

  if (apisets) {
    for (var i = objMenu.getXML().selectNodeIterator("/data/record"); i.hasNext(); ) {
      var id = i.next().getAttribute('jsxid');
      if (apisets[id] != null)
        objMenu.selectItem(id, apisets[id]);
    }
  }
},

onApiHelpSettingsSet: function(objMenu, strRecordId) {
  var enabled = objMenu.isItemSelected(strRecordId);
  var settings = jsx3.ide.getIDESettings();
  settings.set("apihelp", "settings", strRecordId, !enabled);

  var parent = objMenu;
  while (parent && parent.getHelpBlock == null)
    parent = parent.getParent();

  if (parent)
    parent.getHelpBlock().onSettingsChange(strRecordId, !enabled);
}

});
