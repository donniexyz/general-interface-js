
/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.$O(this).extend({

getUI: function() {
  return this.getServer().getJSXByName("jsx_ide_recycling_bin");
},

doToggleRecycleBin: function() {
  var root = this.getServer().getRootBlock();
  var dialog = this.getUI();
  var settings = jsx3.ide.getIDESettings();

  if (dialog == null) {
    dialog = this.loadRsrcComponent("ui", root, false);
    var dialogDim = settings.get('recyclebin');
    if (dialogDim)
      dialog.setDimensions(dialogDim.left, dialogDim.top, dialogDim.width, dialogDim.height);
    root.paintChild(dialog);
    dialog.focus();
  } else {
    if (dialog.isFront())
      dialog.doClose();
    else
      dialog.focus();
  }
},

doRecycleRestore: function() {
  var objTree = this.getUI().getTree();
  var strId = objTree.getValue();
  var bin = jsx3.ide.getRecycleBin();

  var objJSX = bin.findDescendants(function(x) {return x.getId() == strId;}, false, false, true);

  if (objJSX) {
    // TODO: this logic is not correct for some reason (root v. nested)
    var parentInBinTop = false, parentInBin = false;

    // look for parent in the recycling bin
    var parent = bin.findDescendants(function(x) {return x.getId() == objJSX._jsxformerparentid;}, false, false, true);

    if (parent) {
      parentInBinTop = true;
    } else {
      parent = bin.findDescendants(function(x) {return x.getId() == objJSX._jsxformerparentid;});
      if (parent) {
        parentInBin = true;
      } else {
        parent = jsx3.GO(objJSX._jsxformerparentid);
      }
    }

    if (parent) {
      if (objJSX._jsxisfolder) {
        parent.adoptChildrenFrom(objJSX, null, !parentInBin, true);
        bin.removeChild(objJSX);
      } else {
        parent.adoptChild(objJSX, !parentInBin, true);
      }

      this.publish({subject:"restored", o:objJSX});
      this.fillRecycleBinTree();

      if (parentInBinTop) {
        jsx3.IDE.confirm(
          "Restore Parent",
          "The parent of the restored object(s) is a top-level object in the recycle bin. Restore the parent as well?",
          jsx3.$F(function(d) { objTree.setValue(parent.getId()); this.doRecycleRestore();  d.doClose(); }).bind(this),
          null,
          "Restore",
          "Don't Restore", 1
        );
      } else if (parentInBin) {
        var parentToRestore = parent;
        while (parentToRestore.getParent() != bin)
          parentToRestore = parentToRestore.getParent();

        jsx3.IDE.confirm(
          "Restore Ancestor",
          "The parent of the restored object(s) is a nested object in the recycle bin. Restore the top-level ancestor as well?",
          jsx3.$F(function(d) { objTree.setValue(parentToRestore.getId()); this.doRecycleRestore(); d.doClose(); }).bind(this),
          null,
          "Restore",
          "Don't Restore", 1
        );
      }
    } else {
      // can't find the parent so just restore to the root
      parent = jsx3.ide.getActiveServer().getBodyBlock();

      if (objJSX._jsxisfolder) {
        parent.adoptChildrenFrom(objJSX, null, true, true);
        bin.removeChild(objJSX);
      } else {
        parent.adoptChild(objJSX, true, true);
      }

      this.publish({subject:"restored", o:objJSX});
      this.fillRecycleBinTree();

      jsx3.ide.LOG.info("Object(s) restored from recycling bin to component root because the previous parent was not found.");
    }
  } else {
    jsx3.IDE.alert(null, "Could not find recycled object with id '" + strId + "'");
  }
},

/** EMPTY RECYCLE BIN *******************************/
emptyRecycleBin: function(objServer, bConfirmed) {
  var doIt = jsx3.$F(function() {
    var bin = jsx3.ide.getRecycleBin(objServer);
    bin.getParent().removeChild(bin);
    this.publish({subject:"emptied"});
    this.fillRecycleBinTree();
  }).bind(this);

  if (bConfirmed) {
    doIt();
  } else {
    jsx3.IDE.confirm(
      "Confirm",
      "Are you sure you want to empty the recycle bin. Deleted items cannot be recovered.",
      function(d){ d.doClose(); doIt(); },
      null, "Empty", "Cancel", 2
    );
  }
},

doSaveRecycleBinState: function(dialog) {
  var settings = jsx3.ide.getIDESettings();
  var dialogPos = {left: dialog.getLeft(), top: dialog.getTop(), width: dialog.getWidth(), height: dialog.getHeight()};
  settings.set('recyclebin', dialogPos);
},

fillRecycleBinTree: function() {
  var objTree = this.getUI().getTree();
  var bin = jsx3.ide.getRecycleBin();

  var strValue = objTree.getValue();
  objTree.clearXmlData();

  var rootRecord = {
    jsxid: '_jsxbin',
    jsxtext: 'Recycle Bin',
    jsxopen: '1',
    jsximg: 'jsxapp:/images/icon_42.gif',
    jsxunselectable: '1'
  };
  objTree.insertRecord(rootRecord, null, false);

  if (bin != null) {
    var children = bin.getChildren();
    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      var text = null, img = null;
      if (child._jsxisfolder) {
        var parent = jsx3.GO(child._jsxformerparentid);
        var count = child.getChildren().length;
        text = ((count == 1) ? "1 Descendant" : count + " Descendants") + " of ";
        text += parent != null ? (parent.getName() + " : " + parent.getClass().getName()) : child._jsxformerparentid;
        img = "jsxapp:/images/icon_7.gif";
      } else {
        text = child.getName() + " : " + child.getClass().getName();
        img = "jsxapp:/images/icon_46.gif";
      }

      var record = {
        jsxid: child.getId(),
        jsxtext: text,
        jsximg: img,
        mayrestore: '1',
        isfolder: child._jsxisfolder ? 1 : null
      };
      objTree.insertRecord(record, '_jsxbin', false);
      this._fillRecycleBinTreeRecurse(objTree, record.jsxid, child);
    }
  }

  objTree.setValue(strValue);
  objTree.repaint();
  return bin != null;
},

_fillRecycleBinTreeRecurse: function(objTree, parentId, objJSX) {
  var children = objJSX.getChildren();
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    var record = {
      jsxid: child.getId(),
      jsxtext: child.getName() + " : " + child.getClass().getName(),
      jsximg: "jsxapp:/images/icon_89.gif",
      jsxunselectable: '1'
    };
    objTree.insertRecord(record, parentId, false);
    this._fillRecycleBinTreeRecurse(objTree, record.jsxid, child);
  }
}

});
