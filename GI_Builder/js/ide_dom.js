/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.$O(jsx3.ide).extend({

ROOT_DOM_NODE_ID: "_jsxdomroot",

getForIdOrSelected: function(strRecordId, bIncludeBody) {
  if (strRecordId == this.ROOT_DOM_NODE_ID) {
    if (bIncludeBody)
      return [this.getActiveServer().getBodyBlock()];
  } else if (jsx3.$A.is(strRecordId)) {
    var obj = [];
    for (var i = 0; i < strRecordId.length; i++) {
      if (strRecordId[i] == this.ROOT_DOM_NODE_ID) {
        if (bIncludeBody)
          obj.push(this.getActiveServer().getBodyBlock());
      } else {
        var o = jsx3.GO(strRecordId[i]);
        if (o) obj.push(o);
      }
    }
    return obj;
  } else if (strRecordId) {
    var obj = jsx3.GO(strRecordId);
    if (obj) return [obj];
  } else {
    return this.getSelected(bIncludeBody);
  }
  return [];
},

/** GET SELECTED *********************************************/
getSelected: function(bIncludeBody) {
  var editor = this.getActiveEditor();
  if (editor) {
    var s = editor.getSelection();
    if (!bIncludeBody)
      s = s.filter(function(e) { return e != e.getServer().getBodyBlock(); });
    return s;
  } else {
    return jsx3.$A();
  }
},

getRecycleBin: function(objServer) {
  if (objServer == null) {
    objServer = this.getActiveServer();
    if (objServer == null) return null;
  }

  // dumpster (recycling bins for each server) is child of invisible root
  if (this._TRASH == null) {
    var invisible = jsx3.IDE.getInvisibleRoot();
    this._TRASH = new jsx3.gui.Block("recycling",null,null,0,0);
    invisible.setChild(this._TRASH);
  }

  // specific bin for server is child of dumpster
  var serverKey = objServer.getEnv('COMPONENTURL');
  var bin = this._TRASH.getChild(serverKey);
  if (bin == null) {
    bin = new jsx3.gui.Block(serverKey, null, null, 0, 0);
    this._TRASH.setChild(bin);
  }

  return bin;
},

maybeSelectNewDom: function(objChilds, objTree) {
  var settings = this.getIDESettings();

  if (settings.get('prefs', 'builder', 'domfocus'))
    this.setDomValue(objChilds);
},

setDomValue: jsx3.$F(function(objJSXs) {
  this.getActiveEditor().setSelection(objJSXs);
}).throttled()

});
