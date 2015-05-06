/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.Class.defineClass("jsx3.ide.ui.PlugIn", jsx3.amp.PlugIn, null, function(PlugIn, PlugIn_prototype) {

  var ui = jsx3.ide.ui;
  var amp = jsx3.amp;
  
  ui.CONTENT = {
  };

  PlugIn_prototype.onLoaded = function() {
    this._menuManager = new amp.util.MenuManager();
    this._paletteManager = new ui.PaletteManager();
    this._paletteManager.setMenuManager(this._menuManager);
    this._paletteManager.setPlugIn(this);
  };

  PlugIn_prototype.getMenuManager = function() {
    return this._menuManager;
  };
 
  PlugIn_prototype.getPaletteManager = function() {
    return this._paletteManager;
  };

  PlugIn_prototype.getPalette = function(objOwner, strId) {
    return this._paletteManager ? this._paletteManager.getPalette(objOwner.getId() + "." + strId) : null;
  };

  /* Extension point: jsx3.amp.main.layout */
  PlugIn_prototype.paintLayout = function(objContainer) {
    jsx3.ide.onStartUp(jsx3.$F(function() { this._paintLayout(objContainer); }).bind(this));
  };

  PlugIn_prototype.paintIDELayout = function(objContainer) {
    this.getResource("mainContent").load().when(jsx3.$F(function() {
      this.loadRsrcComponent("mainContent", objContainer);
    }).bind(this));
  };

  PlugIn_prototype._paintLayout = function(objContainer) {
    this.getServer().paint();

    var layout = this.loadRsrcComponent("layout", objContainer, false);
    var mainMenu = layout.getDescendantOfName("mainMenu");
    var mainTaskBar = layout.getDescendantOfName("mainTaskBar");

    // Insert any extensions to the menubar.
    this.getExtPoint("menubar-ext").processExts().each(function(e) {
      e.setCSSOverride("float:right;");
      mainMenu.setChild(e);
    });

    // Insert any extensions to the taskbar.
    this.getExtPoint("taskbar-ext").processExts().each(function(e) {
      mainTaskBar.setChild(e);
    });

    objContainer.paintChild(layout);

    jsx3.sleep(jsx3.$F(this._paintLayout2).bind(this, [layout]));
  };

  PlugIn_prototype._paintLayout2 = function(layout) {
    var mainMenu = layout.getDescendantOfName("mainMenu");
    var mainContent = layout.getDescendantOfName("mainContent");

    // Process menus and menu items.
    var menuManager = this.getMenuManager();
    menuManager.addMenuBar("/", mainMenu);
    this.getExtPoint("menu").processExts().each(function(e) {
      menuManager.addMenu(e);
    });
    this.getExtPoint("action").processExts().each(function(e) {
      menuManager.addItem(e);
    });

    var paletteManager = this.getPaletteManager();
    this.getExtPoint("palette").processExts().each(function(e) {
      paletteManager.addPalette(e);
    });

    // Insert the main content area between the menu bar and task bar.
    // Question: what about the loading of the extension's plug-in?
    var layouts = this.getExtPoint("layout").processExts();
    if (layouts.length > 0)
      layouts[0](mainContent);

    try {
      menuManager.finishInit();
    } catch (e) {
      this.getLog().error("Error initializing the menu manager.", jsx3.NativeError.wrap(e));
    }
//    objContainer.paintChild(layout);

    this.getExtPoint("ready").processExts();

    jsx3.ide._addJob(function() { var p = this.getPlugIn("jsx3.ide.log"); if (p) p.load(); });
    jsx3.ide._addJob(jsx3.ide._adjustSplittersOnStartup);    
  };

  PlugIn_prototype.createAmpProgress = function() {
    var i = this._progimage = new jsx3.gui.Image();
    i.setSrc("images/progress_off.gif");
    i.setHeight(16);
    i.setWidth(16);
    i.setMargin("5 0 0 4");
    i.setCSSOverride("vertical-align:top;");
    i.setTip("Indicates when AMP plug-in resources are loading");
    return i;
  };

  PlugIn_prototype.setProgress = function() {
    if (this._progimage && !this._progimage._progon) {
      this._progimage._progon = true;
      this._progimage.setSrc("images/progress_on.gif");
      this._progimage.repaint();
    }
  };

  PlugIn_prototype.onComplete = function() {
    if (this._progimage && this._progimage._progon) {
      this._progimage._progon = false;
      this._progimage.setSrc("images/progress_off.gif");
      this._progimage.repaint();
      jsx3.html.updateCSSOpacity(this._progimage.getRendered(), .25);
    }
  };

  PlugIn_prototype.createProjectPathExt = function() {
    var b = this._projectpath = new jsx3.gui.Block();
    b.setText();
    b.setPadding("6 16 1 8");
    b.setHeight("100%");
    b.setBorder("0px;2px dotted #9898a5;0px;0px");
    b.setMenu("jsxmenu_apppath");

    if (jsx3.ide.PROJECT)
      this._setProjectPath();
    else
      jsx3.IDE.subscribe("startup", this, "_setProjectPath");
    
    return b;
  };
  
  PlugIn_prototype._setProjectPath = function() {
    var dir = jsx3.ide.getActiveProjectDirectory();
    if (dir) {
      this._projectpath.setText('<nobr><a target="_new" style="color:darkblue;" href="' + 
            dir.toURI() + '">' + jsx3.ide.PROJECT.getPathFromHome() + '</a></nobr>', true);
    }
  };
  
  PlugIn_prototype.createSnapBtnsExt = function() {
    var b = new jsx3.gui.Block();
    b.setPadding("0 1 0 5");
    b.setMargin("0 4 0 0");
    b.setHeight("100%");
    b.setBorder("0px;2px dotted #9898a5;0px;0px");
    b.setCSSOverride("vertical-align:top;");

    var btn1 = new jsx3.gui.ToolbarButton();
    btn1.setImage("jsxapp:/images/icon_48.gif");
    btn1.setEvent("jsx3.ide.toggleStageOnly(true);", "jsxexecute");
    btn1.setDynamicProperty("jsxtip", "_palettes_toggle_on");
    b.setChild(btn1);
    
    var btn2 = new jsx3.gui.ToolbarButton();
    btn2.setImage("jsxapp:/images/icon_49.gif");
    btn2.setEvent("jsx3.ide.toggleStageOnly(false);", "jsxexecute");
    btn2.setDynamicProperty("jsxtip", "_palettes_toggle_off");
    b.setChild(btn2);
    
    return b;
  };
  
  PlugIn_prototype.createMenuLogo = function() {
    var img = new jsx3.gui.Image();
    img.setSrc("jsx:/images/icons/logo_234_18.gif");
    img.setPadding("3");
    return img;
  };

  PlugIn_prototype.searchForums = function() {
    var s = this.getServer();
    var d = s.getJSXByName("forumSearchDialog");
    if (d) {
      d.focus();
    } else {
      var rsrc = this.getResource("search-forums");
      rsrc.load().when(jsx3.$F(function() {
        this.loadRsrcComponent(rsrc, s.getRootBlock(), true);
      }).bind(this));
    }
  };
  
});


jsx3.Class.defineClass("jsx3.ide.ui.DialogToolPlugIn", jsx3.amp.PlugIn, null, function(DialogToolPlugIn, DialogToolPlugIn_prototype) {

  DialogToolPlugIn_prototype._compname = null;

  DialogToolPlugIn_prototype.openTool = function() {
    var dialog = this.isMultiInstance() ? null : this.getSingleInstance();
    if (!dialog) {
      dialog = this.loadRsrcComponent(this.getToolResource(), this.getToolContainer());
      dialog.getPlugIn = jsx3.$F(function() { return this; }).bind(this);
      if (dialog.initTool)
        dialog.initTool();
      this._compname = dialog.getName();
      jsx3.sleep(function(){
        if (dialog.getFirstResponder)
          dialog.getFirstResponder().focus();
        else
          dialog.focus(); 
      });
    } else {
      dialog.focus();
      if (dialog.toolRefocus)
        dialog.toolRefocus();
    }
  };

  DialogToolPlugIn_prototype.getSingleInstance = function() {
    return this.getServer().getJSXByName(this._compname);
  };

  DialogToolPlugIn_prototype.getToolResource = function() {
    return this.getResource('ui');
  };

  DialogToolPlugIn_prototype.getToolContainer = function() {
    return this.getServer().getRootBlock();
  };

  DialogToolPlugIn_prototype.isMultiInstance = function() {
    return false;
  };

});
