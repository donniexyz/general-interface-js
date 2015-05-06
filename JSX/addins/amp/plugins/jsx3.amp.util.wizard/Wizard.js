/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * A wizard. Provided by the <code>jsx3.amp.util.wizard</code> plug-in.
 */
jsx3.Class.defineClass("jsx3.amp.util.Wizard", null, [jsx3.util.EventDispatcher], function(Wizard, Wizard_prototype) {

  var amp = jsx3.amp;

  /** {String} Event subject published when a wizard advances to the next pane. */
  Wizard.NEXT = "next";
  /** {String} Event subject published when a wizard advances to the previous pane. */
  Wizard.PREVIOUS = "previous";
  /** {String} Event subject published when a wizard is cancelled. */
  Wizard.CANCEL = "cancel";
  /** {String} Event subject published when a wizard is finished. */
  Wizard.FINISH = "finish";

jsx3.$O(Wizard_prototype).extend({

  /**
   * The instance initializer.
   */
  init: function() {
    /* @jsxobf-clobber */
    this._panes = jsx3.$A();
    /* @jsxobf-clobber */
    this._index = -1;
    /* @jsxobf-clobber */
    this._session = {};
  },

  /**
   * Returns the wizard session object. The session can be used by wizard panes to store arbitrary data for the
   * duration of the wizard.
   *
   * @return {Object}
   */
  getSession: function() {
    return this._session;
  },
  
  /**
   * @param objParent {jsx3.app.Model}
   * @return {jsx3.app.Model}
   * @package
   */
  loadController: function(objParent) {
    return Wizard.PLUGIN.loadRsrcComponent("controller", objParent);
  },

  /**
   * Renders the wizard UI as a child of <code>objContainer</code>.
   * @param objContainer {jsx3.app.Model}
   */
  renderIn: function(objContainer) {
    /* @jsxobf-clobber */
    this._ui = this.loadController(objContainer);
    this._ui.getWizard = jsx3.$F(function() { return this; }).bind(this);

    if (this._panes.length > 0) {
      this._index = 0;
      var p = this._panes[0];
      this._showOrRenderPane(p);
    }
  },

  /**
   * Updates the enabled button states of the four wizard buttons.
   * @param previous {boolean}
   * @param next {boolean}
   * @param finish {boolean}
   * @param cancel {boolean}
   */
  setButtonState: function(previous, next, finish, cancel) {
    this._ui.setButtonState(previous, next, finish, cancel);
  },

  /** @private @jsxobf-clobber */
  _showOrRenderPane: jsx3.$F(function(p) {
    this.setButtonState(p.mayPrevious(), p.mayNext(), p.mayFinish(), p.mayCancel());

    var ui = p.getUI();
    if (ui) {
      this._toggleVisible(ui);
      this._renderPaneCntd(p);
    } else {
      this._toggleVisible();
      p._renderIn(this._ui.getContentPane()).when(jsx3.$F(this._renderPaneCntd).bind(this, [p]));
    }
  }).slept(), // rendering issues when pane is allowed to render synchronously

  /** @private @jsxobf-clobber */
  _renderPaneCntd: function(p) {
    this._ui.setTitle(p.getTitle());
    p.onEnter(this._session);
    var firstResponder = p.getFirstResponder();
    if (firstResponder)
      firstResponder.focus();
  },

  /** @private @jsxobf-clobber */
  _toggleVisible: function(ui) {
    jsx3.$A(this._ui.getContentPane().getChildren()).each(function(e) {
      e.setDisplay(ui == e ? jsx3.gui.Block.DISPLAYBLOCK : jsx3.gui.Block.DISPLAYNONE, true);
    });
  },

  /**
   * Invokes the cancel button.
   */
  cancel: function() {
    var p = this._panes[this._index];
    if (!p || p.mayCancel())
      this.publish({subject:Wizard.CANCEL});
  },

  /**
   * Invokes the finish button.
   */
  finish: function() {
    var p = this._panes[this._index];
    if (p && p.mayFinish()) {
      var rv = p.onNext();
      this._checkNP(rv).when(jsx3.$F(function() {
        p.onExit(this._session);
        this.publish({subject:Wizard.FINISH});
      }).bind(this));
    }
  },

  /**
   * Invokes the next button.
   */
  next: function() {
    var p = this._panes[this._index];
    if (p && p.mayNext()) {
      var rv = p.onNext();
      this._checkNP(rv).when(jsx3.$F(function() {
        this._contdNP(p, rv, 1);
        this.publish({subject:Wizard.NEXT});
      }).bind(this));
    }
  },

  /**
   * Invokes the previous button.
   */
  previous: function() {
    var p = this._panes[this._index];
    if (p && p.mayPrevious()) {
      var rv = p.onPrevious();
      this._checkNP(rv).when(jsx3.$F(function() {
        this._contdNP(p, rv, -1);
        this.publish({subject:Wizard.PREVIOUS});
      }).bind(this));
    }
  },

  /** @private @jsxobf-clobber */
  _checkNP: jsx3.$Y(function(cb) {
    var rv = cb.args()[0];
    if (rv.alert) {
      var alerter = this._ui.getAncestorOfType(jsx3.gui.Dialog) || this._ui.getServer();
      alerter.alert(
          rv.title,
          rv.message,
          function(d){ d.doClose(); if (rv.ok) cb.done(); }
      );
    } else {
      if (rv.ok)
        cb.done();
    }
  }),

  /** @private @jsxobf-clobber */
  _contdNP: function(p, rv, inc) {
    var nextIndex = this._index + inc;
    var nextPane = this._panes[nextIndex];
    if (nextPane) {
      p.onExit(this._session);
      this._index = nextIndex;
      this._showOrRenderPane(nextPane);
    }
  },

  /**
   * Adds a pane to this wizard.
   * @param p {jsx3.amp.util.WizardPane}
   */
  addPane: function(p) {
    p._wizard = this;
    this._panes.push(p);
  },

  /**
   * Returns a pane of this wizard by its index.
   * @param index {int}
   * @return {jsx3.amp.util.WizardPane}
   */
  getPane: function(index) {
    return this._panes[index];
  },

  /**
   * Returns the number of panes in this wizard.
   * @return {int}
   */
  getPaneCount: function() {
    return this._panes.length;
  },

  /**
   * Returns the index of a pane of this wizard.
   * @param p {jsx3.amp.util.WizardPane}
   * @return {int}
   */
  getPaneIndex: function(p) {
    return this._panes.indexOf(p);
  },

  /**
   * Removes a pane from this wizard by its list index.
   * @param index {int}
   */
  removePane: function(index) {
    var ps = this._panes.splice(index, 1);
    if (ps[0])
      delete ps[0]._wizard;
  }

});

});

/**
 * A pane of a wizard. Provided by the <code>jsx3.amp.util.wizard</code> plug-in.
 */
jsx3.Class.defineClass("jsx3.amp.util.WizardPane", null, [jsx3.util.EventDispatcher], function(WizardPane, WizardPane_prototype) {

  var amp = jsx3.amp;

  /**
   * The instance initializer.
   * @param data {jsx3.xml.Entity | jsx3.amp.Resource} the UI component that renders this pane.
   * @param resolver {jsx3.amp.PlugIn} the plug-in against which to resolve paths in the UI component.
   * @return {jsx3.app.Model}
   */
  WizardPane_prototype.init = function(data, resolver) {
    /* @jsxobf-clobber */
    this._data = data;
    // Actually may be jsx3.net.URIResolver also...
    /* @jsxobf-clobber */
    this._resolver = resolver;
  };

  /** @private @jsxobf-clobber */
  WizardPane_prototype._renderIn = jsx3.$Y(function(cb) {
    var objContainer = cb.args()[0];

    if (this._data instanceof amp.Resource) {
      this._data.load().when(jsx3.$F(function() {
        if (this._resolver instanceof amp.PlugIn) {
          /* @jsxobf-clobber */
          this._ui = this._resolver.loadRsrcComponent(this._data, objContainer);
        } else {
          this._ui = objContainer.loadXML(this._data.getData(), null, this._resolver);
        }
        this._ui.getPane = jsx3.$F(function() { return this; }).bind(this);
        cb.done();
      }).bind(this));
    } else if (this._data instanceof jsx3.xml.Entity) {
      this._ui = objContainer.loadXML(this._data, null, this._resolver);
      this._ui.getPane = jsx3.$F(function() { return this; }).bind(this);
      if (this._resolver instanceof amp.PlugIn)
        this._ui.getPlugIn = jsx3.$F(function() { return this; }).bind(this._resolver);
      cb.done();
    } else {
      throw new jsx3.Exception();
    }
  });

  /**
   * Returns the title of this pane.
   * @return {String}
   */
  WizardPane_prototype.getTitle = function() {
    return this._ui.getTitle ? this._ui.getTitle() : null;
  };

  /**
   * Returns the root UI component of this pane once it has been rendered.
   * @return {jsx3.app.Model}
   */
  WizardPane_prototype.getUI = function() {
    return this._ui;
  };

  /**
   * Returns the object in the UI of this pane that should be focused when the pane is revealed. This method
   * delegates to the <code>getFirstResponder()</code> method of the UI component, if that method is defined.
   * @return {jsx3.app.Model}
   */
  WizardPane_prototype.getFirstResponder = function() {
    return this._ui.getFirstResponder ? this._ui.getFirstResponder() : null;
  };

  /**
   * Returns the wizard owning this pane.
   * @return {jsx3.amp.util.Wizard}
   */
  WizardPane_prototype.getWizard = function() {
    return this._wizard;
  };

  /**
   * Called when the UI requests continuing to the next pane.  This pane may veto such a change by returning
   * an object with the <code>ok</code> field equal to <code>false</code>.
   * @return  <code>{ok:Boolean, alert:Boolean, title:String, message:String}</code>
   */
  WizardPane_prototype.onNext = function() {
    if (this._ui.onTryNext) {
      var rv = this._ui.onTryNext();
      if (rv) return rv;
    }

    return {ok:true};
  };

  /**
   * Called when the UI requests backtracking to the previous pane. This pane may veto such a change by returning
   * an object with the <code>ok</code> field equal to <code>false</code>.
   * @return  <code>{ok:Boolean, alert:Boolean, title:String, message:String}</code>
   */
  WizardPane_prototype.onPrevious = function() {
    if (this._ui.onTryPrevious) {
      var rv = this._ui.onTryPrevious();
      if (rv) return rv;
    }

    return {ok:true};
  };

  /**
   * Called when this pane is revealed. Calls the <code>onReveal()</code> method of the root UI component, if that
   * method is defined.
   * @param objSession {Object}
   */
  WizardPane_prototype.onEnter = function(objSession) {
    if (this._ui.onReveal)
      this._ui.onReveal(objSession);
  };

  /**
   * Called when this pane is hidden. Calls the <code>onConceal()</code> method of the root UI component, if that
   * method is defined.
   * @param objSession {Object}
   */
  WizardPane_prototype.onExit = function(objSession) {
    if (this._ui.onConceal)
      this._ui.onConceal(objSession);
  };

  /**
   * Returns <code>true</code> if the previous button should be enabled.
   * @return {boolean}
   */
  WizardPane_prototype.mayPrevious = function() {
    var i = this.getWizard().getPaneIndex(this);
    return i > 0;
  };

  /**
   * Returns <code>true</code> if the cancel button should be enabled.
   * @return {boolean}
   */
  WizardPane_prototype.mayCancel = function() {
    return true;
  };

  /**
   * Returns <code>true</code> if the next button should be enabled.
   * @return {boolean}
   */
  WizardPane_prototype.mayNext = function() {
    var i = this.getWizard().getPaneIndex(this);
    return i < this.getWizard().getPaneCount() - 1;
  };

  /**
   * Returns <code>true</code> if the finish button should be enabled.
   * @return {boolean}
   */
  WizardPane_prototype.mayFinish = function() {
    var i = this.getWizard().getPaneIndex(this);
    return i == this.getWizard().getPaneCount() - 1;
  };

});
