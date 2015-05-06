/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.Class.defineClass("jsx3.ide.ui.IdeMenuItem", jsx3.amp.util.MenuItem, null, function(IdeMenuItem, IdeMenuItem_prototype) {

  IdeMenuItem_prototype.isEnabled = function() {
    var strRules = this.attr("enabled");
    if (strRules) {
      var a = strRules.split(/\W+/g);
      var map = {};
      for (var i = 0; i < a.length; i++)
        map[a[i]] = 1;

      if (map["project"] && !jsx3.ide.PROJECT)
        return false;

      if (map["editor"] && !jsx3.ide.getActiveEditor())
        return false;

      if (map["reload"] && !jsx3.ide.getActiveEditor().supportsReload())
        return false;

      if (map["home"] && !jsx3.ide.getCurrentUserHome())
        return false;

      if (map["file"] && !jsx3.ide.getBuilderRelativeFile(this.attr("enabled-file")).exists())
        return false;

      if (map["eval"] && !this.getExt().eval(this.attr("enabled-eval"), {menu:this.getMenu().getNativeMenu()}))
        return false;

    }

    return true;
  };

  IdeMenuItem_prototype.isSelected = function() {
    var strRules = this.attr("selected");

    if (strRules) {
      var a = strRules.split(/\W+/g);
      var map = {};
      for (var i = 0; i < a.length; i++)
        map[a[i]] = 1;

      if (map["jsx"] && this.getExt().getPlugIn().getServer().getJSXByName(this.attr("selected-jsx")))
        return true;

      if (map["eval"] && this.getExt().eval(this.attr("selected-eval"), {menu:this.getMenu().getNativeMenu()}))
        return true;
    }

    return false;
  };

  IdeMenuItem_prototype.getHotKeyId = function() {
    return this.attr("hkconfig") ? this.attr("id") : null;
  };

  IdeMenuItem_prototype.getHotKey = function() {
    var id = this.getHotKeyId();
    if (id) {
      var prefs = jsx3.ide.getIDESettings().get("hotkeys") || {};
      if (prefs[id])
        return prefs[id];
    }

    return this.getDefaultHotKey();
  };

  IdeMenuItem_prototype.getDefaultHotKey = function() {
    var val = this.attr("hotkey");
    if (val && val.indexOf("{") == 0 && jsx3.util.strEndsWith(val, "}"))
        val = this.getExt().getPlugIn().getServer().getDynamicProperty(val.substring(1, val.length - 1));
    return val;
  };

  IdeMenuItem_prototype.getLabel = function() {
    var l = this.attr("label");
    if (l.indexOf("{") == 0 && jsx3.$S(l).endsWith("}")) {
      var p = this.getExt().getPlugIn().getServer().getDynamicProperty(l.substring(1, l.length - 1));
      if (typeof(p) != "undefined")
        return p;
    }
    return l;
  };

});

jsx3.Class.defineClass("jsx3.ide.ui.IdeMenu", jsx3.amp.util.Menu, null, function(IdeMenu, IdeMenu_prototype) {
});
jsx3.ide.ui.IdeMenu.prototype.isEnabled = jsx3.ide.ui.IdeMenuItem.prototype.isEnabled;

jsx3.Class.defineClass("jsx3.ide.ui.RecentProjMenu", jsx3.ide.ui.IdeMenu, null, function(RecentProjMenu, RecentProjMenu_prototype) {

  RecentProjMenu_prototype.getXML = function() {
    var xml = new jsx3.xml.Document();
    xml.loadXML('<data jsxid="jsxroot"><record/></data>');
    return xml;
  };

  RecentProjMenu_prototype.onShow = function(objMenu, objElm) {
    var projects = jsx3.ide.getRecentProjects();
    if (projects.length == 0)
      return;

    objElm.removeChildren();
    var strMenuId = objElm.getAttribute("jsxid");

    var doOpenProject = "doOpenProject"; // obfuscator
    for (var i = 0; i < projects.length; i++) {
      var path = projects[i];
      var record = {jsxid: "recent:" + path, jsxtext: path,
          jsxexecute: "jsx3.ide." + doOpenProject + "(objRECORD.getAttribute('jsxtext'));"};
      objMenu.insertRecord(record, strMenuId, false);
    }
  };

});

jsx3.Class.defineClass("jsx3.ide.ui.UserProjMenu", jsx3.ide.ui.IdeMenu, null, function(UserProjMenu, UserProjMenu_prototype) {

  UserProjMenu_prototype.getXML = function() {
    var xml = new jsx3.xml.Document();
    xml.loadXML('<data jsxid="jsxroot"><record/></data>');
    return xml;
  };

  UserProjMenu_prototype.onShow = function(objMenu, objElm) {
    var projDir = jsx3.ide.getProjectDirectory();
    if (!projDir) return;

    var dir = projDir.resolve(objElm.getAttribute("relpath"));
    var strRecordId = objElm.getAttribute("jsxid");

    objElm.removeChildren();
    var projPlugIn = jsx3.ide.getPlugIn("jsx3.ide.project");

    var children = 0;
    if (dir.isDirectory()) {
      var files = dir.listFiles();
      var doOpenProject = "doOpenProject"; // obfuscator

      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (jsx3.ide.isFileToIgnore(file)) continue;

        if (file.isDirectory()) {
          children++;

          var homeRelPath = jsx3.ide.getCurrentUserHome().toURI().relativize(file.toURI()).toString();
          var projRelPath = projDir.toURI().relativize(file.toURI()).toString();

          if (projPlugIn.getTypeForDir(file) != null) {
            var record = {jsxid: "user:" + projRelPath, jsxtext: file.getName(), relpath: projRelPath, homepath: homeRelPath,
                jsxexecute: "jsx3.ide." + doOpenProject + "(objRECORD.getAttribute('homepath'));"};
            objMenu.insertRecord(record, strRecordId, false);
          } else {
            var id = "userproj:" + projRelPath;
            var record = {jsxid: id, jsxtext: file.getName(), relpath: projRelPath};
            objMenu.insertRecord(record, strRecordId, false);
            objMenu.insertRecord({}, id, false); // insert empty child so we can see it's a nested menu item
          }
        }
      }
    }

    // create one empty child if no other children
    if (children == 0)
      objMenu.insertRecord({}, strRecordId, false);
  };

});

jsx3.Class.defineClass("jsx3.ide.ui.RecentFilesMenu", jsx3.ide.ui.IdeMenu, null, function(RecentFilesMenu, RecentFilesMenu_prototype) {

  RecentFilesMenu_prototype.getXML = function() {
    var xml = new jsx3.xml.Document();
    xml.loadXML('<data jsxid="jsxroot"><record/></data>');
    return xml;
  };

  RecentFilesMenu_prototype.onShow = function(objMenu, objElm) {
    var files = jsx3.ide.getRecentFiles();
    if (files.length == 0)
      return;

    objElm.removeChildren();
    var strRecordId = objElm.getAttribute("jsxid");

    var doOpenUrlForEdit = "doOpenUrlForEdit";
    for (var i = 0; i < files.length; i++) {
      var path = files[i];
      var record = {jsxid: "recent:" + path, jsxtext: path,
          jsxexecute: "jsx3.ide." + doOpenUrlForEdit + "(jsx3.ide.PROJECT.resolveURI(objRECORD.getAttribute('jsxtext')));"};
      objMenu.insertRecord(record, strRecordId, false);
    }
  };

});

jsx3.Class.defineClass("jsx3.ide.ui.NewFileMenu", jsx3.ide.ui.IdeMenu, null, function(NewFileMenu, NewFileMenu_prototype) {

  var amp = jsx3.amp;
  
  NewFileMenu_prototype._initItems = function() {
    var mainPlugIn = this.getExt().getPlugIn().getEngine().getPlugIn("jsx3.ide");
    var i = 0;

    mainPlugIn.getFileTypes().each(jsx3.$F(function(e) {
      var data = {"@id":e.getId(), "@label":e.getLabel(), "@img":e.getImage(), "@enabled":"project"};
      if (i++ == 0)
        data["@hotkey"] = "{hk.new}";

      var item = new jsx3.ide.ui.IdeMenuItem(e.getExt(), new amp.XML(data));
      item.execute = function() {
        jsx3.ide.doNewEditor(e.getId());
      };

      this.addItem(item);
    }).bind(this));
  };

  NewFileMenu_prototype.getXML = function() {
    this._initItems();
    return this.jsxsuper();
  };

});

