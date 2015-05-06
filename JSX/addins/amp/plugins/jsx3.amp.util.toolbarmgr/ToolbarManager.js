/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Manages a toolbar. Provided by the <code>jsx3.amp.util.toolbarmgr</code> plug-in.
 */
jsx3.Class.defineClass("jsx3.amp.util.ToolbarManager", null, null, function(ToolbarManager, ToolbarManager_prototype) {

  var amp = jsx3.amp;

  /**
   * The instance initializer.
   * @param objToolbar {jsx3.gui.WindowBar}
   */
  ToolbarManager_prototype.init = function(objToolbar) {
    this._bar = objToolbar;
    this._items = jsx3.$A();
    this._sections = jsx3.$A();
    this._lastInSection = {};
  };

  /**
   * 
   * @param strName {String}
   * @param bDivider {boolean}
   */
  ToolbarManager_prototype.addSection = function(strName, bDivider) {
    this._sections.push({name:strName, div:bDivider});
  };

  /**
   *
   * @param objItem {jsx3.amp.util.ToolbarItem}
   */
  ToolbarManager_prototype.addItem = function(objItem) {
    var section = objItem.getSection();
    var sectionIndex = -1;
    var sectionObject = this._sections.find(function(e) { sectionIndex++; return e.name == section; });

    var bDivider = false,
        insertBefore = null;

    if (sectionObject) {
      var last = this._lastInSection[section];
      if (last) {
        insertBefore = last.getNextSibling();
      } else {
        bDivider = sectionObject.div;

        for (var i = sectionIndex - 1; i >= 0; i--) {
          var s = this._sections[i].name;
          if (this._lastInSection[s]) {
            insertBefore = this._lastInSection[s].getNextSibling();
            break;
          }
        }
      }
    }

    var jsx = objItem.paint(bDivider);
    this._bar.insertBefore(jsx, insertBefore);

    this._lastInSection[section] = jsx;
  };

});

/**
 * Manages a toolbar. Provided by the <code>jsx3.amp.util.toolbarmgr</code> plug-in.
 */
jsx3.Class.defineClass("jsx3.amp.util.ToolbarItem", null, null, function(ToolbarItem, ToolbarItem_prototype) {

  var amp = jsx3.amp;
  var Bindable = amp.Bindable;

  /**
   * The instance initializer.
   * @param ext {jsx3.amp.Ext}
   * @param xml {jsx3.amp.Xml}
   */
  ToolbarItem_prototype.init = function(ext, xml) {
    this._ext = ext;
    this._xml = xml;
  };

  ToolbarItem_prototype.getId = function() {
    return this._ext.getId() + "." + this._xml.attr("id");
  };

  ToolbarItem_prototype.getType = function() {
    return this._xml.nname();
  };

  /**
   * Returns the resolved image path of this toolbar item.
   * @return {String}
   */
  ToolbarItem_prototype.getImg = function() {
    var i = this._xml.attr("img");
    return i ? jsx3.net.URIResolver.JSX.relativizeURI(this._ext.getPlugIn().resolveURI(i)) : null;
  };

  /**
   * Returns the tip of this toolbar item.
   * @return {String}
   */
  ToolbarItem_prototype.getTip = function() {
    return this._xml.attr("tip");
  };

  /**
   * Returns the section of this toolbar item.
   * @return {String}
   */
  ToolbarItem_prototype.getSection = function() {
    return this._xml.attr("section");
  };

  ToolbarItem_prototype.paint = function(bDivider) {
    var jsx = null;
    var type = this.getType();

    if (type == "button") {
      jsx3.require("jsx3.gui.ToolbarButton");
      jsx = new jsx3.gui.ToolbarButton(this.getId());
      jsx.setImage(this.getImg().toString());
      jsx.setTip(this.getTip());
      jsx.setDivider(bDivider);
      jsx.setEvent("false;", jsx3.gui.Interactive.EXECUTE);
      jsx.subscribe(jsx3.gui.Interactive.EXECUTE, this, this._execute);

      var enabled = this._xml.attr("enabled");
      if (enabled) {
        if (amp.PlugIn.isBindExpr(enabled)) {
          this._ext.getPlugIn().regBindExpr(enabled, function(v) {
            jsx.setEnabled(v, true);
          });
        } else if (enabled == "false")
          jsx.setEnabled(false);
        else if (enabled == "true")
          jsx.setEnabled(true);
        else
          jsx.setEnabled(this._ext.eval(enabled));
      }

      var state = this._xml.attr("state");
      if (state) {
        jsx.setType(jsx3.gui.ToolbarButton.TYPECHECK);
        
        if (amp.PlugIn.isBindExpr(state)) {
          this._ext.getPlugIn().regBindExpr(state, function(v) {
            jsx.setState(v, true);
          });
        }
        else
          jsx.setState(this._ext.eval(state));
      }
    } else if (type == "native") {
      var xml = this._xml.toNative().getFirstChild();
      jsx = this._ext.getPlugIn().getServer().getRootBlock().loadXML(xml, false, this._ext.getPlugIn());
      if (jsx.setDivider)
        jsx.setDivider(bDivider);
    } else {
      throw new jsx3.Exception();
    }

    return jsx;
  };

  ToolbarItem_prototype._execute = function(e) {
    this._ext.eval(this._xml.attr("execute"), {item:e.target});
  };

});
