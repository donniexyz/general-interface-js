jsx3.$O(this).extend({
  _getUserLibraries: function() {
    var nodeImg = this.resolveURI('jsxapp:/images/icon_7.gif');
    var doc = jsx3.xml.CDF.Document.newDocument();
    
    var protoDir = jsx3.ide.getHomeRelativeFile('prototypes');
    var root = doc.insertRecord({
      jsxid: 'user', jsxtext: 'Workspace', jsxopen: '1', jsximg: nodeImg, type: "folder",
      syspath: jsx3.ide.getSystemDirFile().relativePathTo(protoDir)
    });

    this._resolvers['user'] = null;

    this._doPLDirectoryRead(doc, root, protoDir, jsx3.net.URIResolver.USER);
    this._resolvers['user'] = jsx3.net.URIResolver.USER;

    return doc;
  },

  reloadUserLibraries: function(objTree) {
    var doc = this._getUserLibraries();
    objTree.setSourceXML(doc);
    this.publish({subject: "user_reloaded"});
  },

  uploadUserPrototype: function(objPalette, objTree) {
    var s = jsx3.ide.getIDESettings();
    var id = this.getId();

    if (s.get(id, 'username')) {
      var objRecord = objTree.getRecord(objTree.getValue());
      var objXML = this._loadComponentForUpload(objRecord.path);
      if (objXML) {
        objPalette.setUploadDetail(objXML, objRecord);
      }
    } else {
      objPalette.setUserView('login');
    }
  },

  _loadComponentForUpload: function(strPath) {
    var Document = jsx3.xml.Document;
    var doc = new Document();

    var strPath = jsx3.net.URIResolver.getResolver(strPath).resolveURI(strPath);

    var objXML = doc.load(strPath);
    if (objXML.hasError()) {
      return null;
    }

    return objXML;
  },

  _onAgreeLabelClick: function(objEvent, objCheckbox, objButton) {
      var target = objEvent.srcElement();
      if (target.tagName.toLowerCase() != 'a') {
        var intChecked = objCheckbox.getChecked();
        objCheckbox.setChecked(!intChecked);
        objButton.setEnabled(!intChecked, true);
      }
  }
});
