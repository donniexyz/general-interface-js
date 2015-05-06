/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

(function(plugIn) {

  plugIn.CacheFile = function(cache, id) {
    this.cache = cache;
    this.cacheid = id;
  };

  jsx3.$O(plugIn.CacheFile.prototype).extend({
    equals: function(o) {
      return o && this.cache == o.cache && this.cacheid == o.cacheid;
    }
  });

jsx3.$O(plugIn).extend({

_getServerId: function(objServer) {
  return objServer.getRootBlock().getId();
},

_getServerForId: function(strServerId) {
  var objRoot = jsx3.GO(strServerId);
  if (objRoot)
    return objRoot.getServer();
  return null;
},

/** CONFIG CACHE MENU *********************************************/
configCacheMenu: function(objTree, objMenu) {
  var arrVal = objTree.getValue();
  var bMulti = arrVal.length > 1;

  for (var i = objMenu.getXML().selectNodeIterator("/data/record"); i.hasNext(); ) {
    var record = i.next();
    objMenu.enableItem(record.getAttribute('jsxid'), !(bMulti && record.getAttribute("single") == "1"));
  }
},


getCacheDocByTreeId: function(objTree, strRecordId) {
  var objRecord = objTree.getRecord(strRecordId);

  if (objRecord) {
    var objServer = this._getServerForId(objRecord.serverId) || jsx3.ide.SERVER;
    if (objServer)
      return objServer.getCache().getDocument(objRecord.jsxid);
  }
  return null;
},

/* @jsxobf-clobber */
_getServerForCacheId: function(strId) {
  var views = jsx3.ide.SERVER.getViews();
  for (var i = views.iterator(); i.hasNext(); ) {
    var view = i.next();
    if (view.getCache().isMyDocument(strId))
      return view;
  }
  return jsx3.ide.SERVER;
},

_doOpenCacheDocument: jsx3.$Y(function(cb) {
  var strRecordId = cb.args()[0];
  var cache = this._getServerForCacheId(strRecordId).getCache();
  var file = new this.CacheFile(cache, strRecordId);
  return jsx3.ide.doOpenForEdit(file, "cache", false);
}),

/** EDIT SELECTED CACHE DOC **********************************/
editSelectedCacheDoc: jsx3.$Y(function(cb) {
  var ids = cb.args()[0];
  var editors = jsx3.$A();
  var allDone = null;

  for (var i = 0; i < ids.length; i++) {
    var rv = this._doOpenCacheDocument(ids[i]);
    editors[i] = rv;
    allDone = allDone ? allDone.and(rv) : rv;

    rv.when(function(editor) {
      editors[editors.indexOf(rv)] = editor;
    });
  }

  if (allDone)
    allDone.when(function() { cb.done(editors); });
  else
    cb.done(editors);
}),

viewSelectedCacheDoc: function(ids) {
  this.editSelectedCacheDoc(ids).when(function(editors) {
    for (var i = 0; i < editors.length; i++) {
      editors[i].setMode('readonly');
    }
  });
},

/** DELETE SELECTED CACHE DOC **********************************/
deleteCacheDocument: function(strDocIds, bConfirmed) {
  var objTree = this._getTree();
  if (strDocIds == null)
    strDocIds = objTree.getValue();

  if (!bConfirmed) {
    var dirtyIds = [];
    for (var i = 0; i < strDocIds.length; i++) {
      var strDocId = strDocIds[i];
      var objEditor = this._getEditorForCacheId(strDocId);

      if (objEditor && objEditor.isDirty())
        dirtyIds.push(strDocId);
    }

    if (dirtyIds.length > 0) {
      jsx3.IDE.confirm(
        "Confirm Delete",
        "You have made unsaved changes to the following cache document(s): <b>" + dirtyIds.join("</b>, <b>") +
            "</b>. Procede with delete?",
        jsx3.$F(function(d) {d.doClose(); this.deleteCacheDocument(strDocIds, true);}).bind(this),
        null,
        "Delete",
        "Cancel"
      );
      return;
    }
  }

  if (strDocIds.length > 0) {
    // check that we are confirmed if necessary
    var settings = jsx3.ide.getIDESettings();
    if (settings.get('prefs', 'builder', 'cachewarn') && !bConfirmed) {
      jsx3.IDE.confirm(
        "Confirm Delete",
        "Delete the following cache document(s): <b>" + strDocIds.join("</b>, <b>") + "</b>?",
        jsx3.$F(function(d) {d.doClose(); this.deleteCacheDocument(strDocIds, true);}).bind(this),
        null,
        "Delete",
        "Cancel"
      );
      return;
    }

    for (var i = 0; i < strDocIds.length; i++) {
      var strDocId = strDocIds[i];

      var objEditor = this._getEditorForCacheId(strDocId);
      if (objEditor != null)
        jsx3.IDE.EDITOR_MGR.close(objEditor);

      jsx3.ide.SERVER.getCache().clearById(strDocId);
    }

    this.updateCache();
  }
},

_getTree: function() {
  var ui = this.getPalette().getUIObject();
  return ui && ui.getCacheTree();
},

/** UPDATE CACHE ****************************************************/
updateCache: jsx3.$F(function() {
  //make sure the cache palette is loaded
  var objTree = this._getTree();
  if (objTree) {
    // remember the open nodes
    var openIdMap = {};
    for (var i = objTree.getXML().selectNodeIterator("//record[record]"); i.hasNext(); ) {
      var record = i.next();
      openIdMap[record.getAttribute("jsxid")] = record.getAttribute("jsxopen") == "1" ? "1" : "0";
    }
    
    // reset the XML used by the IDE to display the contents of the cache for the component being edited
    var xml = (new jsx3.xml.CDF.Document()).loadXML('<data jsxid="jsxroot"><record jsxid="jsx30xmlcache"/></data>');
    var rootId = xml.getChildIterator().next().getAttribute("jsxid");

    var activeEditor = jsx3.ide.getActiveEditor();
    var activeServer = activeEditor && jsx3.ide.ComponentEditor && activeEditor instanceof jsx3.ide.ComponentEditor ?
        activeEditor.getServer() : null;

    var serverCache = jsx3.ide.SERVER.getCache();
    var cacheKeys = serverCache.keys();
    var editors = jsx3.ide.getAllEditors();

    var nsRecord = {
      jsxid: "_server", 
      jsxtext: jsx3.ide.SERVER.getEnv("namespace"),
      jsximg: "jsxapp:/images/icon_46.gif",
      jsxopen: openIdMap["_server"] != null ? openIdMap["_server"] : "1",
      jsxunselectable: "1"
    };
    xml.insertRecord(nsRecord, rootId, false);
    
    for (var i = 0; i < editors.length; i++) {
      var editor = editors[i];
      if (editor.getServer() == null) continue;
      
      var view = editor.getServer();
      var cache = view.getCache();
      var serverId = this._getServerId(view);
      var bActive = view == activeServer;

      for (var j = 0; j < cacheKeys.length; j++) {
        var key = cacheKeys[j];
        if (cache.isMyDocument(key)) {
          var branchId = rootId;

          // create folder node for document
          if (xml.getRecordNode(serverId) == null) {
            var serverRecord = {
              jsxid: serverId, 
              jsxtext: editor.getTitle(),
              jsxstyle: bActive ? "font-weight:bold;" : "",
              jsximg: "jsxapp:/images/icon_46.gif",
              jsxopen: openIdMap[serverId] != null ? openIdMap[serverId] : "1",
              jsxunselectable: "1"
            };
            xml.insertRecord(serverRecord, branchId, false);
          }

          var docRecord = {
            jsxid: key, jsxtext: key,
            serverId: serverId,
            jsxstyle: bActive ? "font-weight:bold;" : "",
            jsximg: (jsx3.ide.getDocumentType(cache.getDocument(key)) == "xsl") ?
                "jsxapp:/images/icon_80.gif" : "jsxapp:/images/icon_79.gif"
          };
          xml.insertRecord(docRecord, serverId, false);
          
          cacheKeys.splice(j--, 1);
        }
      }
    }
    
    for (var j = 0; j < cacheKeys.length; j++) {
      var key = cacheKeys[j];

      var docRecord = {
        jsxid: key, jsxtext: key,
        jsximg: (jsx3.ide.getDocumentType(serverCache.getDocument(key)) == "xsl") ?
            "jsxapp:/images/icon_80.gif" : "jsxapp:/images/icon_79.gif"
      };
      xml.insertRecord(docRecord, "_server", false);
    }

    //repaint the tree
    objTree.setSourceXML(xml);
    objTree.repaint();
  }
}).throttled(),

updateCacheForActive: function() {
  var objTree = this._getTree();

  if (objTree) {
    var activeEditor = jsx3.ide.getActiveEditor();
    var activeServer = activeEditor && jsx3.ide.ComponentEditor && activeEditor instanceof jsx3.ide.ComponentEditor
        ? activeEditor.getServer() : null;
    var activeServerId = activeServer ? this._getServerId(activeServer) : null;

    for (var i = objTree.getXML().selectNodeIterator("/data/record/record"); i.hasNext(); ) {
      var record = i.next();
      var style = (record.getAttribute("jsxid") == activeServerId) ? "font-weight:bold;" : "";
      record.setAttribute("jsxstyle", style);
      for (var j = record.getChildIterator(); j.hasNext(); )
        j.next().setAttribute("jsxstyle", style);
    }

    objTree.repaint();
  }
},

// TODO: event wire
cleanUpOrphanedCacheEditors: function(objEditor) {
  if (jsx3.ide.ComponentEditor && objEditor instanceof jsx3.ide.ComponentEditor && objEditor.getServer()) {
    var objServer = objEditor.getServer();
    var cacheKeys = objServer.getCache().keys();
    for (var i = 0; i < cacheKeys.length; i++) {
      var key = cacheKeys[i];
      var cacheEditor = this._getEditorForCacheId(key);

      if (cacheEditor != null) {
        if (cacheEditor.isDirty()) {
          // TODO: something friendlier?
          jsx3.IDE.EDITOR_MGR.close(cacheEditor);
        } else {
          jsx3.IDE.EDITOR_MGR.close(cacheEditor);
        }
      }
    }
  }
},

_getEditorForCacheId: function(strCacheId) {
  return jsx3.ide.getAllEditors().find(function(e) {
    return jsx3.ide.CacheEditor && e instanceof jsx3.ide.CacheEditor &&
           e.getCacheId() == strCacheId;
  });
}

});

})(this);
