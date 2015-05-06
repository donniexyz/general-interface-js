/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

(function(plugIn) {

jsx3.$O(plugIn).extend({

isOpen: function() {
  var current = this._getSystemOutLocation();
  if (current == 'closed') return false;
  if (current == 'bottom') {
    var out = this._getSystemOut();
    var splitter = out.getAncestorOfType(jsx3.gui.Splitter);
    return splitter && (parseInt(splitter.getSubcontainer1Pct()) < 100);
  }
  return true;
},

/**
 * ? toggleSystemOut() -- corresponds to selecting system out from the palettes menu, toggles the system out through the various states (similar to recycle bin).
 */
toggleSystemOut: function() {
  try {
    var current = this._getSystemOutLocation();
    var out = this._getSystemOut();
    
    if (current == 'closed') {
      var settings = jsx3.ide.getIDESettings();
      var location = settings.set('systemout', 'closed', false);
      this._systemOutStartup(true);
    } else if (current == 'window') {
      // BUG: will only unminimize minimized windows (won't bring them to the front)
      var w = this.getServer().getAppWindow('system_out');
      if (w != null && w.isOpen())
        w.focus();
    } else if (current == 'dialog') {
      if (out.isFront())
        out.doToggleState(jsx3.gui.Dialog.MINIMIZED);
      else
        out.focus();
    } else if (current == 'bottom') {
      var splitter = out.getAncestorOfType(jsx3.gui.Splitter);
      if (splitter && (parseInt(splitter.getSubcontainer1Pct()) > 95))
        splitter.setSubcontainer1Pct(splitter.jsxdefault1pct, true);
      else
        splitter.setSubcontainer1Pct("100%", true);
    }
  } catch (e) {
    window.alert(e.message);
  }
},

onLogMenu: function(id) {
  if (id == "clear")
    this._clearSystemOut();
},

setDocking: function(id) {
  if (id == "close")
    this._closeSystemOut();
  else if (id == "pane")
    this._setSystemOutLocation("bottom");
  else
    this._setSystemOutLocation(id);
},

/**
 * ? _setSystemOutLocation() -- set the system out to appear in one of the supported locations, ['bottom','dialog','window']
 */
_setSystemOutLocation: function(strLocation) {
  var current = this._getSystemOutLocation();
  
  var out = this._getSystemOut();
  if (strLocation == current) return;
  
  var bRemove = false;
  if (strLocation == "window") {
    this._openSystemOutWindow();
  } else if (strLocation == "dialog") {
    var parent = this.getServer().getRootBlock();
    /* @jsxobf-clobber */
    this.getResource("as_dialog").load().when(jsx3.$F(function() {
      this._sysout = this.loadRsrcComponent("as_dialog", parent);
      out.getBlock().transfer(this._sysout.getBlock());
      this._restoreSystemOutFloatState(this._sysout);
      this._destroySystemOut(current, out);
    }).bind(this));
  } else if (strLocation == "bottom") {
    this._openSystemOutBottom(out);
    this._destroySystemOut(current, out);
  }

  var settings = jsx3.ide.getIDESettings();
  settings.set('systemout', 'location', strLocation);
},

_destroySystemOut: function(strLocation, out) {
  this.getLog().debug("_destroySystemOut " + strLocation + " " + (out ? out.getId() : out));
  
  if (strLocation == "window") {
    var w = this.getServer().getAppWindow('system_out');
    if (w != null && w.isOpen())
      w.close();
  } else if (strLocation == "bottom") {
      this._closeSystemOutBottom(out);
  } else if (strLocation == "dialog") {
    // timeout so that menu doesn't get disembodied
    jsx3.sleep(function(){out.getParent().removeChild(out);});
  }
},

_getSystemOutLocation: function() {
  var out = this._getSystemOut();
  if (out != null) {
    return out.getName();
  }
  return "closed";
},

onLoaded: function() {
  this._systemOutStartup();
},

/**
 * ? _systemOutStartup() -- on startup place the system out where it was previously
 */
_systemOutStartup: function(bRestart) {
  var settings = jsx3.ide.getIDESettings();
  var location = settings.get('systemout', 'location');
  
  if (bRestart || ! settings.get('systemout', 'closed')) {
    if (location == "window") {
      this._openSystemOutWindow();
    } else if (location == "dialog") {
      var parent = this.getServer().getRootBlock();
      this.getResource("as_dialog").load().when(jsx3.$F(function() {
        this._sysout = this.loadRsrcComponent("as_dialog", parent);
        this._restoreSystemOutFloatState(this._sysout, settings);
        this._sysout.focus();
      }).bind(this));
    } else {
      this._openSystemOutBottom();
    }
    
    this._copyFromMemoryToOut();
  }
},

_openSystemOutWindow: function() {
  var w = this.getServer().getAppWindow("system_out");
  if (w == null) {
    this.getResource("as_window").load().when(jsx3.$F(function() {
      w = this.getServer().loadAppWindow(this.getResource("as_window").getData(), this);
      w.getPlugIn = jsx3.$F(function() { return this; }).bind(this);
      if (w.onRsrcLoad)
        w.onRsrcLoad();
      
      w.subscribe(jsx3.gui.Window.DID_OPEN, this, this._systemOutDidOpen);
      w.subscribe(jsx3.gui.Window.WILL_CLOSE, this, this._systemOutWillClose);
      w.subscribe(jsx3.gui.Window.DID_FOCUS, this, this._systemOutDidFocus);

      if (! w.isOpen())
        w.open();
    }).bind(this));
  } else if (!w.isOpen()) {
    w.open();
  }
},

_systemOutDidOpen: function(objEvent) {
  this.getLog().debug("_systemOutDidOpen " + objEvent.target.getName());
  var w = objEvent.target;
  var oldOut = this._getSystemOut();

  var newOut = w.getRootBlock();
  if (oldOut != null) {
    oldOut.getBlock().transfer(newOut.getBlock());
    this._destroySystemOut(this._getSystemOutLocation(), oldOut);
  } else {
    newOut.getBlock().clear();
  }
  
  this._restoreSystemOutWindowState(w);
  w.focus();
  
  this._sysout = newOut;
},

_systemOutWillClose: function(objEvent) {
  this._saveSystemOutWindowState(objEvent.target);
  
  // clear out the pointer to system out, only if this window was closed and not replaced with another system out
  if (this._getSystemOutLocation() == "window")
    this._sysout = null;
},

_systemOutDidFocus: function(objEvent) {
  this._saveSystemOutWindowState(objEvent.target);
},

/**
 * ? _getSystemOut() -- get a handle to the system out server
 */
_getSystemOut: function() {
  var out = null;
  try {
    out = this._sysout;
    if (out != null && out.getName() == "window") {
      var w = this.getServer().getAppWindow("system_out");
      if (w == null || !w.isOpen())
        out = this._sysout = null;
    }
  } catch (e) {
    out = this._sysout = null;
  }
  return out;
},

_clearSystemOut: function() {
  var out = this._getSystemOut();
  if (out != null)
    out.getBlock().clear();
},

_closeSystemOut: function(bSettingsOnly) {
  if (!bSettingsOnly) {
    var out = this._getSystemOut();
    var current = this._getSystemOutLocation();
  
    if (current == "window")
      jsx3.sleep(jsx3.$F(function(){
        var w = this.getServer().getAppWindow('system_out');
        if (w != null && w.isOpen())
          w.close();
      }).bind(this));
    else if (current == "bottom")
      this._closeSystemOutBottom(out);
    else
      jsx3.sleep(function(){out.getParent().removeChild(out);});
  
    this._sysout = null;
  }
  
  var settings = jsx3.ide.getIDESettings();
  settings.set('systemout', 'closed', true);
},

_openSystemOutBottom: function(out) {
  var parent = this.getServer().getJSXByName('jsx_ide_quadrant_q5');
  this.getResource("as_pane").load().when(jsx3.$F(function() {
    this._sysout = this.loadRsrcComponent("as_pane", parent);

    if (out) {
      out.getBlock();
      this._sysout.getBlock();
      out.getBlock().transfer(this._sysout.getBlock());
    }

    var splitter = parent.getAncestorOfType(jsx3.gui.Splitter);
    if (splitter && (parseInt(splitter.getSubcontainer1Pct()) > 95))
      splitter.setSubcontainer1Pct(splitter.jsxdefault1pct, true);
  }).bind(this));
},

_copyFromMemoryToOut: function() {
  var manager = jsx3.util.Logger.Manager.getManager();
  var memoryHandler = manager.getHandler("memory");
  var ideHandler = manager.getHandler("ide");
  if (memoryHandler && ideHandler) {
    var records = memoryHandler.getRecords();
    for (var i = 0; i < records.length; i++) {
      ideHandler.handle(records[i]);
    }
  };
},

_closeSystemOutBottom: function(objOut) {
  var splitter = objOut.getAncestorOfType(jsx3.gui.Splitter);
  if (splitter)
    splitter.setSubcontainer1Pct('100%', true);
  
  jsx3.sleep(function(){objOut.getParent().removeChild(objOut);});
},

saveSystemOutFloatState: function(objDialog) {
  var settings = jsx3.ide.getIDESettings();
  var dialogPos = {left: objDialog.getLeft(), top: objDialog.getTop(), width: objDialog.getWidth(), height: objDialog.getHeight()};
  settings.set('systemout', 'dialog', dialogPos);
},

_saveSystemOutWindowState: function(objWindow) {
  var pos = null;
  
  if (arguments.length >= 4)    
    pos = {left: arguments[0], top: arguments[1], width: arguments[2], height: arguments[3]};
  else if (objWindow.isOpen())
    pos = {
      left: objWindow.getOffsetLeft(), 
      top: objWindow.getOffsetTop(), 
      width: objWindow.getWidth(), 
      height: objWindow.getHeight()
    };
  
  if (pos) {
    var settings = jsx3.ide.getIDESettings();
    settings.set('systemout', 'window', pos);
  }
},

_restoreSystemOutFloatState: function(objDialog, settings) {
  if (settings == null)
    settings = jsx3.ide.getIDESettings();
  
  var pos = settings.get('systemout', 'dialog');
  if (pos && pos.left) {
    objDialog.setDimensions(pos.left, pos.top, pos.width, pos.height, true);
    objDialog.constrainPosition();
  }
},

_restoreSystemOutWindowState: function(objWindow, settings) {
  if (settings == null)
    settings = jsx3.ide.getIDESettings();
  
  var pos = settings.get('systemout', 'window');
  if (pos && pos.left) {
    objWindow.moveTo(pos.left, pos.top);
    objWindow.setWidth(pos.width);
    objWindow.setHeight(pos.height);
    objWindow.constrainToScreen();
  }
},

updateLoggerMenu: function(objMenu) {
  var handler = jsx3.util.Logger.Manager.getManager().getHandler('ide');
  if (handler)
    objMenu.selectItem(handler.getLevel(), true);
},

updateLoggerLevelOnMenu: function(intLevel) {
  var handler = jsx3.util.Logger.Manager.getManager().getHandler('ide');
  if (handler) handler.setLevel(intLevel);
}

});

jsx3.Class.defineClass('jsx3.ide.SystemLogHandler', jsx3.util.Logger.FormatHandler, null, function(SystemLogHandler, SystemLogHandler_prototype) {

  SystemLogHandler_prototype._bufferSize = 1000;

  SystemLogHandler_prototype.init = function(strName) {
    this.jsxsuper(strName);
    /* @jsxobf-clobber */
    this._bufferSize = null;
    /* @jsxobf-clobber */
    this._beeplevel = jsx3.util.Logger.OFF;
    
    jsx3.ide.registerSound("beep", plugIn.getServer().resolveURI("sounds/beep4.wav"));
  };
  
  SystemLogHandler_prototype.handle = function(objRecord) {
    // find system out
    if (plugIn.isLoaded()) {
      var out = plugIn._getSystemOut();
      if (out) {
        var block = out.getBlock();
        if (block == null)
          return;

        var output = jsx3.util.strEscapeHTML(this.format(objRecord));

        if (this._bufferSize) {
          var maxSize = this._bufferSize - 1;
          if (block.getSize() > maxSize)
            out.shift(block.getSize() - maxSize);
        }

        block.log(output, objRecord.getLevel());

        if (objRecord.getLevel() <= this._beeplevel)
          jsx3.ide.playSound("beep");
      }
    }
  };
  
  SystemLogHandler_prototype.getBufferSize = function() {
    return this._bufferSize;
  };
  
  SystemLogHandler_prototype.setBufferSize = function(intBufferSize) {
    if (jsx3.util.numIsNaN(intBufferSize))
      this._bufferSize = 0;
    else
      this._bufferSize = Math.max(0, intBufferSize);
  };
  
  SystemLogHandler_prototype.getBeepLevel = function() {
    return this._beeplevel;
  };
  
  SystemLogHandler_prototype.setBeepLevel = function(intLevel) {
    this._beeplevel = intLevel;
  };
  
});

jsx3.util.Logger.Handler.registerHandlerClass(jsx3.ide.SystemLogHandler.jsxclass);

// disable jsx3.app.Monitor handlers
if (jsx3.app.Monitor)
  jsx3.app.Monitor.ideDidLoad();

})(this);
