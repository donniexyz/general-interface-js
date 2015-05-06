/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Manages a set of menus. Provided by the <code>jsx3.amp.util.menumgr</code> plug-in.
 */
jsx3.Class.defineClass("jsx3.amp.util.MenuManager", null, null, function(MenuManager, MenuManager_prototype) {

  var amp = jsx3.amp;
  var LOG = jsx3.util.Logger.getLogger(MenuManager.jsxclass.getName());

  /**
   * The instance initializer.
   */
  MenuManager_prototype.init = function() {
    /* @jsxobf-clobber */
    this._menubars = {};
    /* @jsxobf-clobber */
    this._bypath = {};
  };

  /**
   * Adds a menu bar to this manager. Any menu encountered at <code>strPath</code> will be inserted into the menu bar.
   * @param strPath {String} the menu bar path.
   * @param objContainer {jsx3.app.Model} the menu bar GUI object.
   */
  MenuManager_prototype.addMenuBar = function(strPath, objContainer) {
    this._menubars[strPath] = objContainer;
  };

  /**
   * Returns the menu with full path <code>strPath</code>.
   * @param strPath {String}
   */
  MenuManager_prototype.getMenu = function(strPath) {
    return this._bypath[strPath];
  };

  /**
   * Returns all the menus in this manager.
   * @return {jsx3.$Array<jsx3.amp.util.Menu>}
   */
  MenuManager_prototype.getMenus = function() {
    var a = jsx3.$A();
    for (var f in this._bypath)
      a.push(this._bypath[f]);
    return a;
  };

  /**
   * Paints all the menus in this manager into their respective menu bars.
   */
  MenuManager_prototype.finishInit = function() {
    for (var f in this._bypath) {
      var objMenu = this._bypath[f];
      var menuBar = this._menubars[objMenu.getPath()];
      if (menuBar) {
        menuBar.setChild(objMenu.getNativeMenu());
        objMenu.getNativeMenu().setSourceXML(objMenu.getXML());
        menuBar.paintChild(objMenu.getNativeMenu());
      }
    }
  };

  /**
   * Adds a menu to this manager.
   * @param objMenu {jsx3.amp.util.Menu}
   */
  MenuManager_prototype.addMenu = function(objMenu) {
    var menuBar = this._menubars[objMenu.getPath()];
    var path_sec = this._getPathAndSection(objMenu.getPath());

    if (menuBar) {
      ;
    } else {
      var parentMenu = this._bypath[path_sec[0]];

      if (parentMenu) {
        parentMenu.addItem(objMenu, path_sec[1]);
      } else {
        LOG.warn("No menu bar or parent menu for menu: " + path_sec[0]);
      }
    }

    var fullPath = path_sec[0] + objMenu.getId() + "/";

//    jsx3.log("Indexing menu on path:" + fullPath + " menu:" + objMenu);
    this._bypath[fullPath] = objMenu;
  };

  /**
   * Adds a menu item to this manager.
   * @param objItem {jsx3.amp.util.MenuItem}
   */
  MenuManager_prototype.addItem = function(objItem) {
    var path_sec = this._getPathAndSection(objItem.getPath());
    var menu = this._bypath[path_sec[0]];
    
    if (menu) {
      menu.addItem(objItem, path_sec[1]);
    } else {
      LOG.warn("Invalid menu path for action: " + path_sec[0]);
    }
  };

  /** @private @jsxobf-clobber */
  MenuManager_prototype._getPathAndSection = function(p) {
    var tokens = p.split("/");
    var section = tokens[tokens.length - 1];
    var menuPath = tokens.slice(0, tokens.length - 1).join("/") + "/";
    return [menuPath, section];
  };

});

/**
 * A managed menu item. Provided by the <code>jsx3.amp.util.menumgr</code> plug-in.
 *
 * @see jsx3.amp.util.MenuManager
 */
jsx3.Class.defineClass("jsx3.amp.util.MenuItem", null, null, function(MenuItem, MenuItem_prototype) {

  var amp = jsx3.amp;

  /**
   * The instance initializer.
   * @param objExt {jsx3.amp.Ext}
   * @param objData {jsx3.amp.XML}
   */
  MenuItem_prototype.init = function(objExt, objData) {
    /* @jsxobf-clobber */
    this._ext = objExt;
    /* @jsxobf-clobber */
    this._elm = objData;
  };

  /**
   * Returns an attribute of the XML declaration of this menu item.
   * @param strKey {String} 
   * @return {String}
   */
  MenuItem_prototype.attr = function(strKey) { return this._elm.attr(strKey); }

  /**
   * Returns the full ID of this menu item.
   * @return {String}
   */
  MenuItem_prototype.getId = function() {
    return this._ext.getId() + "." + this.attr("id");
  };

  /**
   * Returns the label of this menu item.
   * @return {String}
   */
  MenuItem_prototype.getLabel = function() {
    return this.attr("label");
  };

  /**
   * Returns the resolved image path of this item.
   * @return {String}
   */
  MenuItem_prototype.getImg = function() {
    var i = this.attr("img");
    return i ? jsx3.net.URIResolver.JSX.relativizeURI(this._ext.getPlugIn().resolveURI(i)) : null;
  };

  /**
   * Returns the tip of this menu item.
   * @return {String}
   */
  MenuItem_prototype.getTip = function() {
    return this.attr("tip");
  };

  /**
   * Returns the path of this menu item.
   * @return {String}
   */
  MenuItem_prototype.getPath = function() {
    return this.attr("menupath");
  };

  /** @private @jsxobf-clobber */
  MenuItem_prototype._getFullPath = function() {
    var p = this.getPath();
    if (p.lastIndexOf("/") != p.length - 1)
      p += "/";
    return p + this.getId();
  };

  /**
   * Executes this menu item. If the <code>execute</code> attribute is not empty then the plug-in that
   * declared this menu item is loaded. Once the plug-in loads the contents of the <code>execute</code> attribute
   * are execute in the context of the extension that defined this menu item.
   */
  MenuItem_prototype.execute = function() {
    var script = this.attr("execute");

    if (script) {
      var menu = this.getRootMenu().getNativeMenu();
      this._ext.getPlugIn().load().when(jsx3.$F(function() {
        try {
          this.eval(script, {menu:menu});
        } catch (e) {
          amp.LOG.error(jsx3.NativeError.wrap(e));
        }
      }).bind(this._ext));
    }
  };

  MenuItem_prototype.toString = function() {
    return this.getId();
  };

  /**
   * Returns whether this menu item is enabled. This implementation interprets bind expressions in
   * the <code>enabled</code> attribute of the item definition. Otherwise this method returns <code>true</code>.
   * @return {boolean}
   */
  MenuItem_prototype.isEnabled = function() {
    var expr = this._elm.attr('enabled');
    if (expr && amp.PlugIn.isBindExpr(expr))
      return Boolean(this._ext.getPlugIn().eval("with(this){" + expr.substring(1, expr.length - 1) + "}"));
    return true;
  };

  /**
   * Returns whether this menu item is selected. This implementation interprets bind expressions in
   * the <code>selected</code> attribute of the item definition. Otherwise this method returns <code>false</code>.
   * @return {boolean}
   */
  MenuItem_prototype.isSelected = function() {
    var expr = this._elm.attr('selected');
    if (expr && amp.PlugIn.isBindExpr(expr))
      return Boolean(this._ext.getPlugIn().eval("with(this){" + expr.substring(1, expr.length - 1) + "}"));
    return false;
  };

  /**
   * Returns the accelerator key code of this menu item.
   * @return {String}
   */
  MenuItem_prototype.getHotKey = function() {
    return this.attr("hotkey");
  };

  /**
   * Returns the menu that contains this menu item.
   * @return {jsx3.amp.util.Menu}
   */
  MenuItem_prototype.getMenu = function() {
    return this._parent;
  };

  /**
   * @return {jsx3.amp.util.Menu}
   */
  MenuItem_prototype.getRootMenu = function() {
    var p = this;
    while (p._parent) {
      p = p._parent;
    }
    return p;
  };

  /**
   * Returns the extension that defined this menu item.
   * @return {jsx3.amp.Ext}
   */
  MenuItem_prototype.getExt = function() {
    return this._ext;
  };

});


/**
 * A managed menu. Provided by the <code>jsx3.amp.util.menumgr</code> plug-in.
 *
 * @see jsx3.amp.util.MenuManager
 */
jsx3.Class.defineClass("jsx3.amp.util.Menu", jsx3.amp.util.MenuItem, null, function(Menu, Menu_prototype) {

  var amp = jsx3.amp;
  var LOG = jsx3.util.Logger.getLogger("jsx3.amp.util.MenuManager");
  
  /**
   * The instance initializer.
   * @param objExt {jsx3.amp.Ext}
   * @param objElm {jsx3.amp.XML}
   */
  Menu_prototype.init = function(objExt, objElm) {
    this.jsxsuper(objExt, objElm);

    /* @jsxobf-clobber */
    this._sections = [];
    /* @jsxobf-clobber */
    this._sectionbyid = {};
    /* @jsxobf-clobber */
    this._itembyid = {};

    objElm.children().each(jsx3.$F(function(e) {
      if (e.nname() == "divider")
        this.addSection(e.attr("id"), true);
      else if (e.nname() == "section")
        this.addSection(e.attr("id"), false);
    }).bind(this));
  };

  /**
   * Returns the item in this menu whose ID is equal to <code>id</code>.
   * @param id {String}
   * @return {jsx3.amp.util.MenuItem}
   */
  Menu_prototype.getItem = function(id) {
    var item = this._itembyid[id];
    if (!item) {
      for (var f in this._itembyid) {
        if (this._itembyid[f] instanceof Menu) {
          item = this._itembyid[f].getItem(id);
          if (item)
            break;
        }
      }
    }
    return item;
  };
  
  /** @private @jsxobf-clobber */
  Menu_prototype._onOpenMenu = function(objEvent) {
    var id = objEvent.context.strPARENTID;
    if (id == null) id = "jsxroot";
    var objXML = this._menu.getXML();

    var rootElm = objXML.selectSingleNode("//*[@jsxid='" + id + "']");
    if (!rootElm) rootElm = objXML;

    var menu = null, node = rootElm;
    while (! menu) {
      menu = this.getItem(node.getAttribute("jsxid"));
      node = node.getParent();

      if (node == null)
        menu = this;
    }

//    jsx3.log("_onOpenMenu " + menu);

    menu.onShow(this._menu, rootElm);
  };

  /**
   * Returns the CDF data source for this menu. If this is a nested menu then this XML will be inserted into the
   * XML document of the base GI Menu.
   * <p/>
   * This method is the bridge between the object-oriented AMP definition of a menu and the XML-based GI definition
   * of a menu.
   *
   * @return {jsx3.xml.Document}
   */
  Menu_prototype.getXML = function() {
    var xml = jsx3.xml.CDF.Document.newDocument();

    for (var i = 0; i < this._sections.length; i++) {
      var sec = this._sections[i];
      for (var j = 0; j < sec._items.length; j++) {
        var item = sec._items[j];
        var objElm = xml.insertRecord({
          jsxid: item.getId(),
          jsxtext: item.getLabel(),
          jsximg: item.getImg(),
          jsxtip: item.getTip(),
          jsxkeycode: item.getHotKey(),
          jsxdivider:(j == 0 && sec._divider) ? "1" : "0"
        });

        if (item instanceof Menu) {
          var nestedXml = item.getXML();
          for (var k = nestedXml.selectNodeIterator("record"); k.hasNext(); ) {
            objElm.appendChild(k.next().cloneNode(true));
          }
        }
      }
    }

    return xml;
  };

  /**
   * Called just before this menu is expanded. This method may modify any of the XML inside <code>objElm</code>,
   * for example by enabling or selecting menu items or generating menu items on the fly.
   *
   * @param objMenu {jsx3.gui.Menu}
   * @param objElm {jsx3.xml.Entity}
   */
  Menu_prototype.onShow = function(objMenu, objElm) {
    for (var i = objElm.selectNodeIterator("record | record/record"); i.hasNext(); ) {
      var recordId = i.next().getAttribute("jsxid");
      if (recordId) {
        var item = this._itembyid[recordId];
        if (item) {
          objMenu.enableItem(recordId, item.isEnabled());
          objMenu.selectItem(recordId, item.isSelected());
        } else {
          // Need to calculate nested items for enabled to show menus implicitly disabled
          item = this.getItem(recordId);
          if (item)
            objMenu.enableItem(recordId, item.isEnabled());
          else
            LOG.warn("Error: no item with ID " + recordId);
        }
      }
    }
  };
  
  /** @private @jsxobf-clobber */
  Menu_prototype._onMenuExe = function(objEvent) {
    var id = objEvent.context.strRECORDID;
    var item = this.getItem(id);
    if (item)
      item.execute();
  };

  /**
   * Returns the ID of this menu.
   * @return {String}
   */
  Menu_prototype.getId = function() {
    return this.attr("id");
  };
  
  /**
   * Returns the path of this menu.
   * @return {String}
   */
  Menu_prototype.getPath = function() {
    return this.attr("path");
  };
  
  /**
   * Returns the native GI menu that was rendered for this AMP menu.
   * @return {jsx3.gui.Menu}
   */
  Menu_prototype.getNativeMenu = function() {
    if (this._menu == null) {
      jsx3.require("jsx3.gui.Menu"); // Should be unnecessary because of plug-in dependencies
      this._menu = new jsx3.gui.Menu(this.getId(), this.getLabel());
      this._menu.setEvent("1;", jsx3.gui.Interactive.MENU);
      this._menu.subscribe(jsx3.gui.Interactive.MENU, this, "_onOpenMenu");
      this._menu.subscribe(jsx3.gui.Interactive.EXECUTE, this, "_onMenuExe");
      this._menu.setXSLParam("jsxdisableescape", "yes");
    }
    return this._menu;
  };
  
  /**
   * Adds a logical section to this menu.
   * @param strId {String} the section ID.
   * @param bDivider {boolean} whether the section begins with a visual dividing line.
   */
  Menu_prototype.addSection = function(strId, bDivider) {
    var section = {_id:strId, _divider:bDivider, _items:[]};
    this._sections.push(section);
    this._sectionbyid[strId] = section;
  };
  
  /**
   * Adds an item to this menu.
   * @param objItem {jsx3.amp.util.MenuItem} the item to add.
   * @param strSection {String} the section ID.
   */
  Menu_prototype.addItem = function(objItem, strSection) {
//    jsx3.log("addItem to " + this + "/" + strSection + ": " + objItem);
    
    var section = this._sectionbyid[strSection] || this._sectionbyid[""];
    if (!section) {
      this.addSection("", false);
      section = this._sectionbyid[""];
    }

    this._itembyid[objItem.getId()] = objItem;
    section._items.push(objItem);

    objItem._parent = this;
  };

  /**
   * Returns all items in this menu.
   * @return {jsx3.$Array<jsx3.amp.util.MenuItem>}
   */
  Menu_prototype.getItems = function() {
    var a = jsx3.$A();
    for (var i = 0; i < this._sections.length; i++) {
      var sec = this._sections[i];
      for (var j = 0; j < sec._items.length; j++) {
        a.push(sec._items[j]);
      }
    }
    return a;
  };
    
});
