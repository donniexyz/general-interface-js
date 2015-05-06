/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
jsx3.$O(this).extend({

_resolvers: {},

/** GET PROTOTYPE LIBRARIES **************************************/
/**
 * ? getSystemLibraries() -- returns a record set containing all the prototypes available to the IDE. This includes system prototypes, addin prototypes, and user prototypes.
 * ! returns --(XML) nested record set
 */
_getSystemLibraries: function() {
  var nodeImg = this.resolveURI('jsxapp:/images/icon_7.gif');
  var doc = jsx3.xml.CDF.Document.newDocument();
  var root = doc.insertRecord({jsxid:'components', jsxtext: "Components", jsxopen: "1"});

  var currentNode = null;

  // do system prototypes
  currentNode = doc.insertRecord({
    jsxid: 'system', jsxtext: 'System', jsxopen: '1', jsxunselectable: '1',
    jsximg: nodeImg, sorton: 'a'
  }, 'components');
  this._doPLDirectoryRead(doc, currentNode, jsx3.ide.getBuilderRelativeFile('prototypes'), this.getServer());
  this._resolvers['system'] = this.getServer();

  var addins = jsx3.System.getAddins();
  // do addin prototypes
  currentNode = doc.insertRecord({
    jsxid: 'addins', jsxtext: 'Addins', jsxopen: '1', jsxunselectable: '1',
    jsximg: nodeImg, sorton: 'b'
  }, 'components');

  jsx3.$A(addins).each(jsx3.$F(function(addin) {
    var prototypesDir = jsx3.ide.getSystemRelativeFile(addin.resolveURI(jsx3.app.AddIn.PROTOTYPES_DIR));
    if (prototypesDir.isDirectory()) {
      var addinNode = doc.insertRecord({
        jsxid: 'addins/' + addin.getKey(),
        jsxtext: addin.getName(), type: 'folder', jsxunselectable: '1',
        syspath: jsx3.ide.getSystemDirFile().relativePathTo(prototypesDir),
        jsximg: nodeImg, jsxlazy: '1'
      }, 'addins');
      this._resolvers[addinNode.getAttribute("jsxid")] = addin;
    }
  }).bind(this));
  if (currentNode.getChildNodes().size() == 0)
    currentNode.getParent().removeChild(currentNode);

  // Do programmatic folders
  if (this._otherFolders) {
    currentNode = doc.insertRecord({
      jsxid: 'other', jsxtext: 'Other', type: 'other', jsxopen: '1', jsxunselectable: '1',
      jsximg: nodeImg, sorton: 'd'
    }, 'components');

    var i = 0;
    this._otherFolders.each(jsx3.$F(function(o) {
      var path = o.path, resolver = o.resolver, label = o.label;

      var dir = jsx3.ide.getSystemRelativeFile(resolver.resolveURI(path));
      if (dir.isDirectory()) {
        var otherNode = doc.insertRecord({
          jsxid: 'other/' + (++i),
          jsxtext: label || dir.getName().replace(/_/g, " "), jsxunselectable: '1',
          syspath: jsx3.ide.getSystemDirFile().relativePathTo(dir),
          jsximg: nodeImg, jsxlazy: '1'
        }, 'other');
        this._resolvers[otherNode.getAttribute("jsxid")] = resolver;
      }
    }).bind(this));
  }

  return doc;
},



/** DO PL DIRECTORY READ **************************************/
_doPLDirectoryRead: function(doc, parent, file, objResolver) {
  var home = jsx3.ide.getSystemDirFile();
  var leafImg = this.resolveURI('jsxapp:/images/icon_46.gif');

  if (file.isDirectory()) {
    var list = file.listFiles();
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (jsx3.ide.isFileToIgnore(item)) continue;

      var name = item.getName();
      if (item.isDirectory()) {
        doc.insertRecord({
          jsxid: parent.getAttribute('jsxid') + '/' + name,
          jsxtext: name.replace(/_/g, " "), type: 'folder', jsxlazy: '1',
          jsximg: parent.getAttribute("jsximg"), sorton: 'a_' + (name.charAt(0) == "~" ? ("z" + name) : name),
          syspath: jsx3.ide.getSystemDirFile().relativePathTo(item)
        }, parent.getAttribute('jsxid'));
      } else if (item.getExtension() == 'xml') {
        var node = doc.insertRecord({
          jsxid: parent.getAttribute('jsxid') + '/' + name,
          jsxtext: name, type: 'component',
          path: objResolver != null && !this.getServer().equals(objResolver) ?
            objResolver.relativizeURI(home.relativePathTo(item)) :
            jsx3.ide.SERVER.relativizeURI(home.relativePathTo(item), true),
          jsximg: leafImg, sorton: 'b_' + name,
          syspath: jsx3.ide.getSystemDirFile().relativePathTo(item)
        }, parent.getAttribute('jsxid'));
        this._doPLRefineRecord(node, item, objResolver);
      }
    }
  } else {
    return false;
  }

  return true;
},


doPLDirData: function(objTree, objNode) {
  var doc = objTree.getXML();
  var objFile = jsx3.ide.getSystemRelativeFile(objNode.getAttribute("syspath"));

  var objResolver = null;
  var objRecord = objNode;
  while (objRecord != null && objResolver == null) {
    objResolver = this._resolvers[objRecord.getAttribute("jsxid")];
    objRecord = objRecord.getParent();
  }

  this._doPLDirectoryRead(doc, objNode, objFile, objResolver);
  return {bCLEAR:true};
},

/* @jsxobf-clobber */
_nameRE: new RegExp("<(?:meta name=\")?name(?:\")?>(<!\\[CDATA\\[)?(.*?)(\\]\\]>)?</"),
/* @jsxobf-clobber */
_iconRE: new RegExp("<(?:meta name=\")?icon(?:\")?>(<!\\[CDATA\\[)?(.*?)(\\]\\]>)?</"),
/* @jsxobf-clobber */
_descRE: new RegExp("<(?:meta name=\")?description(?:\")?>(<!\\[CDATA\\[)?([\\s\\S]*?)(\\]\\]>)?</"),
/* @jsxobf-clobber */
_typeRE: new RegExp("<object type=['\"]([\\.\\w]+)['\"]"),

/* @jsxobf-clobber */
_doPLRefineRecord: function(objNode, objFile, objResolver) {
  var name = null, icon = null, description = "";

  var content = objFile.read();

  var r1 = this._nameRE.exec(content);
  if (r1 && r1[0])
    name = r1[2];

  var r2 = this._iconRE.exec(content);
  if (r2 && r2[0])
    icon = r2[2];

  var r3 = this._descRE.exec(content);
  if (r3 && r3[0])
    description = r3[2].replace(/\s+/g, " ");

  var r4 = this._typeRE.exec(content);
  if (r4 && r4[0])
    description = "[" + r4[1] + "] " + description;

  if (name) {
    objNode.setAttribute('jsxtext', name);
    objNode.setAttribute('sorton', "b_" + name);
  }

  if (icon)
    objNode.setAttribute('jsximg', objResolver ? objResolver.resolveURI(icon) : icon);
  if (description)
    objNode.setAttribute('jsxtip', description);
},

reloadSystemLibraries: function(objTree) {
  var doc = this._getSystemLibraries();
  objTree.setSourceXML(doc);
  this.publish({subject: "reloaded"});
},

moveUserComponent: function(pathToMove, pathOfParent) {
  var file = jsx3.ide.getSystemRelativeFile(pathToMove);
  if (file.exists()) {
    var dir = jsx3.ide.getSystemRelativeFile(pathOfParent);
        
    if (dir.isDirectory()) {
      var destFile = jsx3.ide.getSystemRelativeFile(dir + "/" + file.getName())

      if (file.getParentFile().equals(dir)) {
        ; // ignore illegal move
      } else if (destFile.exists()) {
        this.getLog().error("File already exists: " + destFile);
      } else if (!dir.isDescendantOf(file)) {
        file.renameTo(destFile);
        return destFile;
      } else {
        ; // ignore illegal move
      }
    } else {
      this.getLog().error("Not a directory: " + dir);
    }
  } else {
    this.getLog().error("Not a file: " + file);
  }
  
  return false;
},

deleteUserComponent: function(path) {
  var file = jsx3.ide.getSystemRelativeFile(path);
  if (file.exists()) {
    file.deleteFile();
    return true;
  } else {
    this.getLog().error("Not a file: " + file);
  }
},
  
createUserFolder: function(basePath, name) {
  var dir = jsx3.ide.getSystemRelativeFile(basePath + "/" + name);
  if (!dir.exists()) {
    dir.mkdir();
    return dir.isDirectory();
  }
}
  
  
});
