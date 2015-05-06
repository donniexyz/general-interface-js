/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * A preferences panel. Provided by the <code>jsx3.amp.util.prefspanel</code> plug-in.
 */
jsx3.Class.defineClass("jsx3.amp.util.Prefs", null, [jsx3.util.EventDispatcher], function(Prefs, Prefs_prototype) {

  var util = jsx3.amp.util;

  /** {String} Event subject published when a preferences panel is closed. */
  Prefs.UNLOAD = "unload";
  /** {String} Event subject published when the active pane of a preferences panel is changed. */
  Prefs.SWITCH = "switch";
  /** {String} Event subject published when a preferences panel is saved. */
  Prefs.SAVE = "save";

  /**
   * The instance initializer.
   */
  Prefs_prototype.init = function() {
    /* @jsxobf-clobber */
    this._panes = [];
    /* @jsxobf-clobber */
    this._parent = null;
    /* @jsxobf-clobber */
    this._root = null;
    /* @jsxobf-clobber */
    this._current = null;
    /* @jsxobf-clobber */
    this._collapse = false;
  };

  /**
   * Returns whether to collapse the left side pane list.
   * @return {boolean}
   */
  Prefs_prototype.getCollapse = function() {
    return this._collapse;
  };

  /**
   * Sets whether to collapse the left side pane list.
   * @param bCollapse {boolean}
   */
  Prefs_prototype.setCollapse = function(bCollapse) {
    this._collapse = bCollapse;
  };

  /**
   * Adds a prefs pane to this controller. This method may be called either before or after <code>renderIn()</code>
   * has been called.
   * @param objPane {jsx3.amp.util.PrefsPane} the pane to add.
   */
  Prefs_prototype.addPane = function(objPane) {
    util.PrefsPane.PLUGIN.getLog().debug("addPane " + objPane);

    this._panes.push(objPane);
    if (this._parent != null)
      this._addPaneToView(objPane);

    objPane.subscribe(util.PrefsPane.SAVED, this, "_onPaneSaved");
    objPane.subscribe(util.PrefsPane.DIRTIED, this, "_onPaneDirtied");
  };

  /**
   * Loads the preferences pane UI into <code>objParent</code>, without painting it.
   * @param objParent {jsx3.app.Model}
   * @return {jsx3.app.Model}
   * @package
   */
  Prefs_prototype.loadController = function(objParent) {
    return util.PrefsPane.PLUGIN.loadRsrcComponent("controller", objParent, false);
  };

  /**
   * Renders the preferences panel in <code>objParent</code>.
   * @param objParent {jsx3.gui.Model} the parent to load this panel into.
   * @param intPaneToShow {int | jsx3.amp.util.PrefsPane} optionally, the pane to reveal initially.
   */
  Prefs_prototype.renderIn = function(objParent, intPaneToShow) {
    this._parent = objParent;
    this._root = this.loadController(objParent);
    this._root.getController = jsx3.$F(function() { return this; }).bind(this);

    if (this.getCollapse() && this._panes.length < 2) {
      this._root.setCols("0,*");
      this._root.getChild(1).setBorder("");
    }

    for (var i = 0; i < this._panes.length; i++)
      this._addPaneToView(this._panes[i]);

    this._parent.paintChild(this._root);
    
    if (this._panes.length > 0) {
      jsx3.sleep(function() {
        if (this._root.getParent() != null)
          this.showPane(intPaneToShow || Number(0)); 
      }, null, this);
    }
  };

  /**
   * Removes this preferences panel from the view.
   * <p/>
   * The asynchronous return value is <code>true</code> only if the preferences panel was unloaded successfully.
   *
   * @param bForce {boolean} whether to force the removal even if there are unsaved changes.
   */
  Prefs_prototype.unload = jsx3.$Y(function(cb) {
    var bForce = cb.args()[0];

    var fctDone = jsx3.$F(function() {
      this._parent.removeChild(this._root);
      this.publish({subject:Prefs.UNLOAD});
      cb.done(true);
    }).bind(this);

    if (! bForce && this._current != null && this._current.isDirty()) {
      var alerter = this._root.getAncestorOfType(jsx3.gui.Dialog) || this._root.getServer();
      alerter.confirm(
          "Save Changes",
          "Save changes made to " + this._current.getTitle() + " before closing?",
          jsx3.$F(function(d){
            d.doClose(); 
            this._current.save().when(fctDone);
          }).bind(this),
          function(d) { d.doClose(); cb.done(false); },
          "Save", "Cancel", 1,
          function(d){ d.doClose(); fctDone(); },
          "Don't Save"
      );
    } else {
      fctDone();
    }
  });

  /** Saves the state of the current pane. */
  Prefs_prototype.apply = function() {
    this._current.save();
  };

  /** Saves the state of the current pane and closes this panel. */
  Prefs_prototype.save = function() {
    this._current.save().when(jsx3.$F(this.unload).bind(this));
  };

  /** @private @jsxobf-clobber */
  Prefs_prototype._onPaneSaved = function(objEvent) {
    var objPane = objEvent.target;
    if (this._current == objPane)
      this._root.setButtonsEnabled(false);
    this.publish({subject:Prefs.SAVE, pane:objPane});
  };

  /** @private @jsxobf-clobber */
  Prefs_prototype._onPaneDirtied = function(objEvent) {
    var objPane = objEvent.target;
    if (this._current == objPane)
      this._root.setButtonsEnabled(objEvent.dirty);
  };

  /**
   * Displays a prefs pane in the edit area. Unloads the current prefs pane if necessary. If the current prefs
   * pane is dirty, the user will be prompted to save or discard changes before the prefs pane is switched.
   * <p/>
   * The asynchronous return value is <code>true</code> only if the pane was shown successfully.
   *
   * @param objPane {jsx3.amp.util.PrefsPane|int} the pane to switch to.
   * @param bForce {boolean} if <code>true</code>, the current pane is unloaded without saving changes.
   */
  Prefs_prototype.showPane = jsx3.$Y(function(cb) {
    var objPane = cb.args()[0];
    var bForce = cb.args()[1];

    if (typeof(objPane) == "number")
      objPane = this._panes[objPane];

    if (objPane == null)
      throw new jsx3.IllegalArgumentException("objPane", arguments[0]);

    if (bForce)
      this._showPane2(objPane).when(cb, true);
    else
      this._onBeforeSwitch().when(jsx3.$F(function(rv) {
        if (rv) {
          this._showPane2(objPane).when(cb, true);
        } else {
          cb.done(false);
        }
      }).bind(this));
  });

  Prefs_prototype._showPane2 = jsx3.$Y(function(cb) {
    var objPane = cb.args()[0];

    var prevPane = this._current;
    var contentPane = this._root.getContentPane();
    contentPane.removeChildren();

    this._root.setButtonsEnabled(false);

    if (prevPane != null)
      this._getListBlockForPane(prevPane).setBackgroundColor("", true);
    this._getListBlockForPane(objPane).setBackgroundColor("#FFFF99", true);

    this._current = objPane;
    objPane._renderPaneIn(contentPane).when(jsx3.$F(function() {
      var firstResponder = objPane.getFirstResponder();
      if (firstResponder != null)
        firstResponder.focus();

      this.publish({subject:Prefs.SWITCH, from:prevPane, to:objPane});
      cb.done();
    }).bind(this));
  });

  /** @private @jsxobf-clobber */
  Prefs_prototype._getListBlockForPane = function(objPane) {
    return this._root.getListPane().getDescendantOfName("block" + objPane.getTitle(), false, true);
  };

  /** @private @jsxobf-clobber */
  Prefs_prototype._addPaneToView = function(objPane) {
    var listPane = this._root.getListPane();

    var block = new jsx3.gui.Block("block" + objPane.getTitle(), 0, 0, "100%", 60);
    block.setTagName("div");
    block.setBackground("background-image:url(" + objPane.getImage() + ");background-repeat:no-repeat;background-position:center 8px;");
    block.setOverflow(jsx3.gui.Block.OVERFLOWHIDDEN);
    block.setTextAlign(jsx3.gui.Block.ALIGNCENTER);
    block.setTip(objPane.getDescription());
    block.setPadding("0 0 0 0");
    block.setCursor("pointer");
    block.setEvent("1;", jsx3.gui.Interactive.JSXCLICK);
    block.subscribe(jsx3.gui.Interactive.JSXCLICK, this, function() { this.showPane(objPane); });
    listPane.setChild(block);

    var image = new jsx3.gui.Block("prefsImage", 0, 0, 95, 60);
    image.setTagName("div");
    image.setPadding("40 0 0 0");
    image.setText('<div style="position:relative;width:95px;text-align:center;">' + objPane.getTitle() + '</div>');
    image.setTextAlign(jsx3.gui.Block.ALIGNCENTER);
    block.setChild(image);

    listPane.paintChild(block);
  };

  /**
   * Called when a change of prefs pane is requested.
   * @param objPane {jsx3.amp.util.PrefsPane} the pane to switch to.
   * @return {boolean} <code>true</code> is the switch may procede.
   * @private
   * @jsxobf-clobber 
   */
  Prefs_prototype._onBeforeSwitch = jsx3.$Y(function(cb) {
    var objPane = cb.args()[0];

    if (this._current != null) {
      if (this._current == objPane) {
        cb.done(false);
      } else if (this._current.isDirty()) {
        var alerter = this._root.getAncestorOfType(jsx3.gui.Dialog) || this._root.getServer();
        alerter.confirm(
            "Save Changes",
            "Save changes made to " + this._current.getTitle() + " before switching?",
            jsx3.$F(function(d){
              d.doClose();
              this._current.save().when(cb, true);
            }).bind(this),
            function(d) { d.doClose(); cb.done(false); },
            "Save", "Cancel", 1,
            function(d){ d.doClose(); cb.done(true); },
            "Don't Save"
        );
      } else {
        cb.done(true);
      }
    } else {
      cb.done(true);
    }
  });

});

/**
 * A pane in a preferences panel. Provided by the <code>jsx3.amp.util.prefspanel</code> plug-in.
 */
jsx3.Class.defineClass("jsx3.amp.util.PrefsPane", null, [jsx3.util.EventDispatcher], function(PrefsPane, PrefsPane_prototype) {

  /** {String} Event subject published when a preference pane is saved. */
  PrefsPane.SAVED = "save";
  /** {String} Event subject published when the state of a preference pane is dirtied. */
  PrefsPane.DIRTIED = "dirtied";

  /**
   * The instance initializer. The <code>obj</code> parameter must define an attribute, <code>resource</code>, which
   * is the name of an XML resource of <code>ext</code>. This resource will be loaded as the UI component of this
   * pane. The root object of this component file may define the following methods:
   * <ul>
   *   <li>getFirstResponder() : jsx3.app.Model &#8212; returns the object that should be focused when the pane is
   *       revealed.</li>
   *   <li>loadPrefs() : void &#8212; restores the state of the pane before it is revealed.</li>
   *   <li>savePrefs() : void | Object{title, message} &#8212; saves the state of the pane and optionally returns
   *       a title and message to be shown in an alert dialog.</li> 
   * </ul>
   *
   * @param ext {jsx3.amp.Ext} the AMP extension declaring this pane.
   * @param obj {jsx3.amp.XML} the XML declaration of the extension.
   */
  PrefsPane_prototype.init = function(ext, obj) {
    /* @jsxobf-clobber */
    this._ext = ext;
    /* @jsxobf-clobber */
    this._data = obj;
    /* @jsxobf-clobber */
    this._dirty = false;
    /* @jsxobf-clobber */
    this._props = {};
  };

  /**
   * Returns the title of this pane.
   * @return {String}
   */
  PrefsPane_prototype.getTitle = function() {
    return this._data.attr("label");
  };

  /**
   * Returns the description of this pane.
   * @return {String}
   */
  PrefsPane_prototype.getDescription = function() {
    return this._data.attr("tip");
  };

  /**
   * Returns the resolved path of the image of this pane.
   * @return {String}
   */
  PrefsPane_prototype.getImage = function() {
    return this._ext.getPlugIn().resolveURI(this._data.attr("img"));
  };

  /** @private @jsxobf-clobber */
  PrefsPane_prototype._renderPaneIn = jsx3.$Y(function(cb) {
    var objParent = cb.args()[0];
    var rsrc = this._ext.getPlugIn().getResource(this._data.attr("resource"));
    rsrc.load().when(jsx3.$F(function() {
      /* @jsxobf-clobber */
      this._root = this._ext.getPlugIn().loadRsrcComponent(rsrc, objParent, false);
      this._root.getPane = jsx3.$F(function() {return this;}).bind(this);
      this._dirty = false;
      if (this._root.loadPrefs)
        this._root.loadPrefs();
      objParent.paintChild(this._root);

      cb.done();
    }).bind(this));
  });

  /**
   * Returns the root component of this pane once it is rendered.
   * @return {jsx3.app.Model}
   */
  PrefsPane_prototype.getUI = function() {
    return this._root;
  };

  /**
   * Returns the object in the UI of this pane that should get focus when this pane is first revealed.
   * This method delegates to the method <code>getFirstResponder()</code> of the root UI component for this pane,
   * if that method is defined.
   * @return {jsx3.app.Model}
   */
  PrefsPane_prototype.getFirstResponder = function() {
    if (this._root.getFirstResponder)
      return this._root.getFirstResponder();
    return null;
  };

  /**
   * Sets whether this pane has unsaved changes.
   * @param bDirty {boolean}
   */
  PrefsPane_prototype.setDirty = function(bDirty) {
    if (this._dirty != bDirty)
      this.publish({subject:PrefsPane.DIRTIED, dirty:bDirty});
    this._dirty = bDirty;
  };

  /**
   * Returns whether this pane has unsaved changes.
   * @return {boolean}
   */
  PrefsPane_prototype.isDirty = function() {
    return this._dirty;
  };

  /**
   * Saves the state of this pane. This method delegates to the <code>savePrefs()</code> method of the root
   * UI component of this pane.
   */
  PrefsPane_prototype.save = jsx3.$Y(function(cb) {
    var saveRet = this._root.savePrefs ? this._root.savePrefs() : null;
    if (saveRet) {
      this._dirty = false;
      this.publish({subject:PrefsPane.SAVED});

      if (typeof(saveRet) == "object") {
        var alerter = this._root.getAncestorOfType(jsx3.gui.Dialog) || this._root.getServer();
        alerter.alert(
            saveRet.title,
            saveRet.message,
            function(d){ d.doClose(); cb.done(); }
        );
      } else {
        cb.done();
      }
    } else {
      cb.done();
    }
  });

  /**
   * Returns an arbitrary property of this pane.
   * @param strId {String}
   * @return {Object}
   */
  PrefsPane_prototype.getProperty = function(strId) {
    return this._props[strId];
  };

  /**
   * Sets an arbitrary property of this pane. This method may be used for saving state.
   * @param strId {String}
   * @param objValue {Object}
   */
  PrefsPane_prototype.setProperty = function(strId, objValue) {
    this._props[strId] = objValue;
  };

});
