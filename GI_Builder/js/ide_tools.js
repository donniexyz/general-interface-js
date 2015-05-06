/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.$O(jsx3.ide).extend({

/*
 * % openConsoleWindow()  --alias for the JavaScript method, window.open
 */
openConsoleWindow: function(strURL, strPopupName, intWidth, intHeight, yesnoScrollbar,
    yesnoMenuBar, yesnoStatus, yesnoLocation, yesnoToolbar, intLeft, intTop) {

  if (this.CONSOLES == null) this.CONSOLES = {};

  if (strPopupName) {
    try {
      var console = this.CONSOLES[strPopupName];
      if (console && ! console.closed) {
        // timeout because closing a menu focuses the GI app again
        jsx3.sleep(function(){console.focus();});
        return;
      }
    } catch (e) {}
  }

  var strScrollbar = yesnoScrollbar ? "scrollbars=" + yesnoScrollbar + "," : "";
  var strMenuBar = yesnoMenuBar ? "menubar=" + yesnoMenuBar + "," : "";
  var strStatus = yesnoStatus ? "status=" + yesnoStatus + "," : "";
  var strLocation = yesnoLocation ? "location=" + yesnoLocation + "," : "";
  var strToolbar = yesnoToolbar ? "toolbar=" + yesnoToolbar + "," : "";
  var strWidth = intWidth ? "width=" + intWidth + "," : "";
  var strHeight = intHeight ? "height=" + intHeight + "," : "";
  var strLeft = intLeft ? "left=" + intLeft + "," : "";
  var strTop = intTop ? "top=" + intTop + "," : "";

  this.CONSOLES[strPopupName] = window.open(strURL, strPopupName, "directories=no,resizable=yes," +
      strScrollbar +  strMenuBar + strStatus + strLocation + strToolbar + strWidth + strHeight + strLeft + strTop);
  jsx3.sleep(function(){jsx3.ide.CONSOLES[strPopupName].focus();});
  return this.CONSOLES[strPopupName];
},

/*
scriptTypeAheadSpy: function(objMenu, strRecordId) {
  // UGH: it's too difficult to get this spy to work in Fx
  if (! jsx3.xml.Template.supports(jsx3.xml.Template.DISABLE_OUTPUT_ESCAPING))
    return false;
  
  var objNode = objMenu.getRecordNode(strRecordId);
  var type = objNode.getAttribute("type");

  if (type) {
    var jsxidfk = objNode.getAttribute("jsxidfk");
    if (jsxidfk == null)
      jsxidfk = objNode.getAttribute("oldid");

    var src = null;
    while (objNode != null && src == null) {
      src = objNode.getAttribute('src');
      objNode = objNode.getParent();
    }

    if (src != null) {
      var blockX = jsx3.IDE.getJSXByName("jsxblockx_typeaheadscriptspy");
      var strURL = src;
      if (blockX.getXMLURL() != strURL) {
        blockX.setXMLURL(strURL);
        blockX.getServer().getCache().clearById(blockX.getXMLId());
      }

      var objMemberNode = blockX.getXML().selectSingleNode("//record[@jsxid='"+jsxidfk+"']");

      if (objMemberNode) {
        blockX.setXSLParam("membertype", type);
        blockX.setXSLParam("memberid", jsxidfk);
        return blockX.repaint();
      }
    }
  }
  return false;
},
*/

/* @jsxobf-clobber */
_SOUNDS: {},

registerSound: function(strName, strURI) {
  jsx3.require("jsx3.gui.Sound");
  if (this._SOUNDS[strName] == null) {
    this._SOUNDS[strName] = new jsx3.gui.Sound("idesound_" + strName, strURI);
  }
},

playSound: function(strName, intVolume) {
  var sound = this._SOUNDS[strName];
  if (sound) {
    sound.setVolume(intVolume != null ? intVolume : 100);

    if (sound.getParent() == null) {
      var body = jsx3.IDE.getBodyBlock();
      body.setChild(sound);
      body.paintChild(sound);
      window.setTimeout(function() { sound.play(); }, 1000); // timeout seems to work in IE, not Fx
    } else {
      sound.play();
    }
  }
},

onContextHelp: function(objEvent) {
  jsx3.ide.LOG.debug("Open context sensitive help: " + objEvent.helpid);

  var path = "http://www.generalinterface.org/alias/search/" + jsx3.getVersion() + "/" + objEvent.helpid;
  var w = window.open(path, "jsxidectxhelp");
  if (! w) jsx3.ide.LOG.warn("A pop-up blocker may have prevented context help from opening.");
},

openUserGuides: function() {
  var path = "http://www.generalinterface.org/alias/userguide/" + jsx3.getVersion();
  var w = window.open(path, "jsxideguides");
  if (! w) jsx3.ide.LOG.warn("A pop-up blocker may have prevented the site from opening.");
},

doOpenSettings: function(intPane) {
  var plugin = jsx3.ide.getPlugIn("jsx3.ide.settings.ide");
  if (plugin)
    plugin.load().when(function() {
      plugin.showPane(intPane);
    });
},

doOpenProjectSettings: function(intPane) {
  var plugin = jsx3.ide.getPlugIn("jsx3.ide.settings.project");
  if (plugin)
    plugin.load().when(function() {
      plugin.showPane(intPane);
    });
}

});
