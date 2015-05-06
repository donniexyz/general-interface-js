/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 *
 */
jsx3.Class.defineClass("jsx3.ide.ui.PaletteManager", null, null, function(PaletteManager, PaletteManager_prototype) {

  var ui = jsx3.ide.ui;

  PaletteManager_prototype.init = function() {
    this._palettes = {};
    this._loading = 0;
  };

  // TODO: better way of getting menu manager
  PaletteManager_prototype.setMenuManager = function(objMM) {
    this._menuManager = objMM;
  };

  // TODO: better way of getting plugin
  PaletteManager_prototype.setPlugIn = function(objPlugIn) {
    this._plugin = objPlugIn;
  };

  PaletteManager_prototype.getPalette = function(strId) {
    return this._palettes[strId];
  };

  PaletteManager_prototype.addPalette = function(p) {
    this._palettes[p.getId()] = p;
    p._manager = this;

    if (this._menuManager) {
      var menu = this._menuManager.getMenu("/jsx3.ide.palettes/");
      if (menu) {
        menu.addItem(new ui.PaletteMenuItem(p), p._xml && p._xml.attr("idegroup"));
      }
    }
  };

  PaletteManager_prototype.startup = function() {
    this._loading = jsx3.$H(this._palettes).keys().length;

    jsx3.$H(this._palettes).each(jsx3.$F(function (k, v) {
      var settings = v.getSettings();
      var c = settings.closed;
      if (!c) {
        if (settings["float"])
          this.openInDialog(v);
        else if (c === false || v._xml.attr("default-closed") != "true")
          this.openInStack(v, settings.quadrant);
      } else {
        this._loading--;
      }
    }).bind(this));
  };

  PaletteManager_prototype.openInDialog = function(p) {
    var rsrc = this._plugin.getResource("palette-dialog");
    rsrc.load().when(jsx3.$F(function() {
      this._loadPaletteIn(p, this._plugin.getServer().getRootBlock(), rsrc.getData());
    }).bind(this));
  };

  PaletteManager_prototype.openInStack = function(p, quadrant) {
    if (!quadrant)
      quadrant = p._xml.attr("default-position");
    var parent = this._getQuadrant(quadrant);

    if (parent) {
      var rsrc = this._plugin.getResource("palette-stack");
      rsrc.load().when(jsx3.$F(function() {
        this._loadPaletteIn(p, parent, rsrc.getData());
      }).bind(this));
    }
  };

  PaletteManager_prototype._getQuadrant = function(quadrant) {
    return  this._plugin.getServer().getJSXByName("jsx_ide_quadrant_" + quadrant);
  };

  PaletteManager_prototype._loadPaletteIn = function(p, parent, containerXML) {
    var oldParent = null;
    var container = parent.loadXML(containerXML, null, this._plugin);
    container.setPaletteLabel(p.getLabel());
    container.getPalette = jsx3.$F(function() { return this; }).bind(p);
    container.getManager = jsx3.$F(function() { return this; }).bind(this);
    container.onContainerOpened();

    this._restorePosition(p, container);

    p._ext.getPlugIn().load().when(jsx3.$F(function() {
      var rsrc = p.getUIResource();

      if (!rsrc) {
        this._plugin.getLog().error("No UI resource for palette: " + p);
        return;
      }

      rsrc.load().when(jsx3.$F(function() {
        var content = p.getUIObject();
        if (content) {
          // inactive stack pane is display none or undefined; change to block.
          content.setDisplay(jsx3.gui.Block.DISPLAYBLOCK); 
          container.getPaletteContentHolder().adoptChild(content);

          var oldContainer = content.getContainer();
          oldParent = oldContainer.getParent();
          oldParent.removeChild(oldContainer);
        } else {
          content = p.loadUI(container.getPaletteContentHolder());
          content.getPalette = jsx3.$F(function() { return this; }).bind(p);
          content.getManager = jsx3.$F(function() { return this; }).bind(this);

          if (content.onPaletteLoaded)
            content.onPaletteLoaded();
        }

        content.getContainer = jsx3.$F(function() { return this; }).bind(container);

        this._loading--;
        if (this._loading <= 0)
          this._plugin.publish({subject:"paletteMoved", container:container, previousParent:oldParent});
      }).bind(this));
    }).bind(this));
  };

  PaletteManager_prototype._onPositionMenu = function(objContainer, objPalette, strMenuId) {
    var settings = objPalette.getSettings();

    if (strMenuId == "close") {
      this.closePalette(objPalette);
    } else if (strMenuId == "float") {
      if (!(jsx3.gui.Dialog && objContainer instanceof jsx3.gui.Dialog)) {
        this.openInDialog(objPalette);
        settings["float"] = true;
      }
    } else {
      var newQuadrant = this._getQuadrant(strMenuId);
      if (newQuadrant && newQuadrant != objContainer) {
        this.openInStack(objPalette, strMenuId);

        settings["float"] = false;
        settings.quadrant = strMenuId;
      }
    }

    objPalette.setSettings(settings);
  };

  PaletteManager_prototype.openPalette = function(objPalette) {
    var settings = objPalette.getSettings();
    if (settings["float"])
      this.openInDialog(objPalette);
    else
      this.openInStack(objPalette, settings.quadrant);

    settings.closed = false;
    objPalette.setSettings(settings);
  };

  PaletteManager_prototype.closePalette = function(objPalette) {
    var content = objPalette.getUIObject();
    if (content.onPaletteUnloaded)
      content.onPaletteUnloaded();

    var oldContainer = content.getContainer();
    var oldParent = oldContainer.getParent();
    oldParent.removeChild(oldContainer);

    var settings = objPalette.getSettings();
    settings.closed = true;
    objPalette.setSettings(settings);

    this._plugin.publish({subject:"paletteMoved", container:null, previousParent:oldParent});
  };

  PaletteManager_prototype._restorePosition = function(p, container) {
    if (jsx3.gui.Dialog && container instanceof jsx3.gui.Dialog) {
      var settings = p.getSettings();
      var dialogDim = settings.dialog;
      if (dialogDim)
        container.setDimensions(dialogDim.left, dialogDim.top, dialogDim.width, dialogDim.height, true);
    }
  };

  PaletteManager_prototype.togglePalette = function(p) {
    var ui = p.getUIObject();
    if (ui) {
      var container = ui.getContainer();
      if (container.isFront && container.isFront())
        this.closePalette(p);
      else
        container.focus();
    } else {
      this.openPalette(p);
    }
  };

  PaletteManager_prototype._afterDialogMove = function(objContainer) {
    var palette = objContainer.getPalette();
    var settings = palette.getSettings();
    settings.dialog = {left: objContainer.getLeft(), top: objContainer.getTop(),
        width: objContainer.getWidth(), height: objContainer.getHeight()};
    palette.setSettings(settings);
  };

});


/**
 *
 */
jsx3.Class.defineClass("jsx3.ide.ui.Palette", null, null, function(Palette, Palette_prototype) {

  var ui = jsx3.ide.ui;

  Palette_prototype.init = function(objExt, objElm) {
    /* @jsxobf-clobber */
    this._ext = objExt;
    /* @jsxobf-clobber */
    this._xml = objElm;
  };

  Palette_prototype.getId = function() {
    return this._ext.getId();
  };

  Palette_prototype.getLabel = function() {
    return this._xml.attr("label");
  };

  Palette_prototype.getUIResource = function() {
    return this._ext.getPlugIn().getResource(this._xml.attr("resource"));
  };

  Palette_prototype.getUIObject = function() {
    return this._ext.getPlugIn().getServer().getJSXByName(this._rootname);
  };

  Palette_prototype.getUIRootName = function() {
    return this._rootname;
  };

  Palette_prototype.getSettings = function() {
    var settings = jsx3.ide.getIDESettings();
    if (!settings) return {};

    var s = settings.get('palettes', this.getId());
    if (!s) {
      s = {};
      settings.set('palettes', this.getId(), s);
    }

    return s;
  };

  Palette_prototype.setSettings = function(s) {
    var settings = jsx3.ide.getIDESettings();
    settings.set('palettes', this.getId(), s);
  };

  Palette_prototype.loadUI = function(parent) {
    var p = this._ext.getPlugIn();
    var ui = p.loadRsrcComponent(this._xml.attr("resource"), parent);
    this._rootname = ui.getName();
    return ui;
  };

  Palette_prototype.toString = function() {
    return "Palette." + this.getId();
  };

});


/**
 *
 */
jsx3.Class.defineClass("jsx3.ide.ui.PaletteMenuItem", jsx3.ide.ui.IdeMenuItem, null, function(PaletteMenuItem, PaletteMenuItem_prototype) {

  var ui = jsx3.ide.ui;

  PaletteMenuItem_prototype.init = function(p) {
    this.jsxsuper(null, p._xml);
    this._palette = p;
  };

  PaletteMenuItem_prototype.getId = function() {
    return this._palette.getId();
  };

  PaletteMenuItem_prototype.getLabel = function() {
    return this._palette.getLabel();
  };

  PaletteMenuItem_prototype.isEnabled = function() {
    var p = this._palette;
    return (p._xml && p._xml.attr("idegroup") == "per-ide") || jsx3.ide.PROJECT != null;
  };

  PaletteMenuItem_prototype.isSelected = function() {
    return this._palette.getUIObject() != null;
  };

  PaletteMenuItem_prototype.getHotKeyId = function() {
    return this.getId();
  };

  PaletteMenuItem_prototype.execute = function() {
    this._palette._manager.togglePalette(this._palette);
  };

});
