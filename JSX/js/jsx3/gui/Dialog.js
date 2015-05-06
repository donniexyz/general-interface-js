/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Alerts", "jsx3.gui.Block");

// @jsxobf-clobber  _jsxmaxstate _jsxmoving _jsxcurgui _jsxcurintx _jsxcurinty
// @jsxobf-clobber-shared  repaintTaskBar
/**
 * Renders a dialog window. A dialog can contain other DOM objects; usually a dialog contains one child of type
 * <code>jsx3.gui.WindowBar</code> and one child of type <code>jsx3.gui.Block</code>.
 */
jsx3.Class.defineClass("jsx3.gui.Dialog", jsx3.gui.Block, [jsx3.gui.Alerts], function(Dialog, Dialog_prototype) {

  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;
  var LOG = jsx3.util.Logger.getLogger(Dialog.jsxclass.getName());

  /**
   * {int} Enum value for the <code>windowState</code> property of instances of this class indicating a minimized dialog.
   * @final @jsxobf-final
   */
  Dialog.MINIMIZED = 0;

  /**
   * {int} Enum value for the <code>windowState</code> property of instances of this class indicating a maximized dialog.
   * @final @jsxobf-final
   */
  Dialog.MAXIMIZED = 1;

  /**
   * {String} #e8e8f5 (default)
   */
  Dialog.DEFAULTBACKGROUNDCOLOR = "#e8e8f5";

  /**
   * {int} Enum value for the <code>resizable</code> property of instances of this class indicating a non-resizable dialog.
   * @final @jsxobf-final
   */
  Dialog.FIXED = 0;

/* @JSC :: begin DEP */

  /**
   * @deprecated  Renamed to RESIZABLE.
   * @see #RESIZABLE
   */
  Dialog.RESIZEABLE = 1;

/* @JSC :: end */

  /**
   * {int} Enum value for the <code>resizable</code> property of instances of this class indicating a resizable dialog.
   * @final @jsxobf-final
   */
  Dialog.RESIZABLE = 1;

  /** @private @jsxobf-clobber */
  Dialog.RESIZEICON = jsx3.resolveURI("jsx:///images/dialog/resize.gif");

  /**
   * {int} Enum value for the <code>modal</code> property of instances of this class indicating a modal dialog.
   * @final @jsxobf-final
   */
  Dialog.MODAL = 1;

  /**
   * {int} Enum value for the <code>modal</code> property of instances of this class indicating a non-modal dialog.
   * @final @jsxobf-final
   */
  Dialog.NONMODAL = 0;

  /**
   * {Array<int>} determines the minimum amount of the dialog to show after a move event as N,E,W,S; null means show all
   * @private
   * @jsxobf-clobber
   */
  Dialog.MINIMUM_SHOWING = [null,32,32,32];

  /**
   * {Array<int>} determines the minimum amount of padding to leave on each side when constrainPosition(true) is called
   * @private
   * @jsxobf-clobber
   */
  Dialog.CONSTRAIN_PADDING = [10,10,10,10];

  /** @private @jsxobf-clobber */
  Dialog._RESIZE_DIM = 10;

  /**
   * jsx3.gui.Dialog.TASKBAR_BUTTON_PREFIX {String} JSXTBB_
   * @private
   * @jsxobf-clobber
   */
  Dialog.TASKBAR_BUTTON_PREFIX = "JSXTBB_";

  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   * @param vntWidth {int|String} width in pixels
   * @param vntHeight {int|String} height in pixels
   * @param strTitle {String} if != null,  will be set as the text property on the child captionbar
   */
  Dialog_prototype.init = function(strName,vntWidth,vntHeight,strTitle) {
    //call constructor for super class
    this.jsxsuper(strName,null,null,vntWidth,vntHeight);

    jsx3.require("jsx3.gui.WindowBar", "jsx3.gui.ToolbarButton");

    //add a new toolbar as a child to this dialog - this will become the caption bar
    var jToolbar = new jsx3.gui.WindowBar(strName + "_cbar");
    if (strTitle != null) jToolbar.setText(strTitle);
    //whenever binding a fragment to a fragment, required to pass the fragment ns
    this.setChild(jToolbar,jsx3.app.Model.PERSISTEMBED,null,jsx3.app.Model.FRAGMENTNS);

    //create the toolbar buttons and bind as a children of the toolbar
    var jButton = new jsx3.gui.ToolbarButton(this.getName() + "_btn_min",null);
    jButton.setEvent("this.getParent().getParent().doToggleState();",Interactive.EXECUTE);
    jButton.setDynamicProperty("jsximage","@Min Icon");
    jButton.setDynamicProperty("jsxtip","jsx3.gui.Dialog.min");
    jToolbar.setChild(jButton,jsx3.app.Model.PERSISTEMBED,null,jsx3.app.Model.FRAGMENTNS);

    jButton = new jsx3.gui.ToolbarButton(this.getName() + "_btn_max",null);
    jButton.setEvent("this.getParent().getParent().doMaximize(this);",Interactive.EXECUTE);
    jButton.setDynamicProperty("jsximage","@Max Icon");
    jButton.setDynamicProperty("jsxtip","jsx3.gui.Dialog.max");
    jToolbar.setChild(jButton,jsx3.app.Model.PERSISTEMBED,null,jsx3.app.Model.FRAGMENTNS);

    jButton = new jsx3.gui.ToolbarButton(this.getName() + "_btn_close",null);
    jButton.setEvent("this.getParent().getParent().doClose();",Interactive.EXECUTE);
    jButton.setDynamicProperty("jsximage","@Close Icon");
    jButton.setDynamicProperty("jsxtip","jsx3.gui.Dialog.close");
    jToolbar.setChild(jButton,jsx3.app.Model.PERSISTEMBED,null,jsx3.app.Model.FRAGMENTNS);
  };

  Dialog_prototype.onAfterAssemble = function(objParent, objServer) {
    if (this.getWindowState() == Dialog.MAXIMIZED)
      this.setZIndex(objServer.getNextZIndex(jsx3.app.Server.Z_DIALOG));
  };

  /**
   * Returns rules for the focus rectangle/bounding box. Used by Builder
   * @return {Object<String, int>} JavaScript object with named properties: NN, SS, EE, WW, MM
   * @package
   */
  Dialog_prototype.getMaskProperties = function() {
    return this.getModal() == Dialog.NONMODAL ? jsx3.gui.Block.MASK_ALL_EDIT : jsx3.gui.Block.MASK_NO_EDIT;
  };

  /**
   * typically called by minimize/windowshade jsx3.gui.ToolbarButton in the dialog box's caption bar; toggles the window's state between full-size and window-shaded (where only the dialog's caption bar is visible); or fully minimized to the application task bar if one exists
   * @param STATE {int} if != null, window state is set to fullsize (jsx3.gui.Dialog.MAXIMIZED) and window-shade (jsx3.gui.Dialog.MINIMIZED); if no value is passed, the state is toggled
   */
  Dialog_prototype.doToggleState = function(STATE) {
    var state = STATE != null ? STATE : (this.getWindowState() == Dialog.MAXIMIZED ?  Dialog.MINIMIZED: Dialog.MAXIMIZED);
    var myButton;

    if ((myButton = this.getTaskButton()) != null) {
      this.setWindowState(state);
      var objToFocus = null;
      if (state == Dialog.MAXIMIZED) {
        //show the dialog and update state
        this.setDisplay(jsx3.gui.Block.DISPLAYBLOCK,true);
        this.setZIndex(this.getServer().getNextZIndex(jsx3.app.Server.Z_DIALOG) * this.getZMultiplier(),true);
        objToFocus = this;
      } else {
        //hide the dialog and update state
        this.setDisplay(jsx3.gui.Block.DISPLAYNONE,true);
        objToFocus = myButton;
      }

      //synchronize the tbb in the task bar with the state of the dialog
      myButton.setState(state == Dialog.MAXIMIZED ?
          jsx3.gui.ToolbarButton.STATEON : jsx3.gui.ToolbarButton.STATEOFF);

      //depending upon what was shown or hidden; select the correct item
      objToFocus.focus();
    } else {
      //get handle to the on-screen instance
      var objGUI = this._getRenderedDialog();

      //toggle the minimize/maximize state of the on-screen instance and reset object properties
      if (state == Dialog.MAXIMIZED) {
        objGUI.childNodes[1].style.display = "";
        //user chose to maximize the window, by clicking the toggle button OR 'STATE' parameter was used to force a maximize

        var b1 = this.getBoxProfile(true);
        b1.recalculate({height:this.getHeight()}, objGUI);
        var b1c = b1.getChildProfile(1);
        b1c.recalculate({height:this.getHeight()}, objGUI.childNodes[2]);

        if (this.getResize()) {
          objGUI.childNodes[3].style.display = "";
          objGUI.childNodes[4].style.display = "";
        }

        this.setZIndex(this.getServer().getNextZIndex(jsx3.app.Server.Z_DIALOG) * this.getZMultiplier(),true);
        this.setWindowState(Dialog.MAXIMIZED);
      } else {
        jsx3.html.persistScrollPosition(objGUI.childNodes[1]);
        objGUI.childNodes[1].style.display = "none";

        var b1 = this.getBoxProfile(true);
        myCaptionBar = this.getCaptionBar();
        var myHeight = b1.getBorderHeight() + (myCaptionBar != null ? myCaptionBar.getHeight() : 0) + (2 * this.getBuffer(2));
        b1.recalculate({height:myHeight}, objGUI);
        var b1c = b1.getChildProfile(1);
        b1c.recalculate({height:myHeight}, objGUI.childNodes[2]);

        //hide resizers
        if (this.getResize()) {
          objGUI.childNodes[3].style.display = "none";
          objGUI.childNodes[4].style.display = "none";
        }

        this.setWindowState(Dialog.MINIMIZED);
      }
    }
    // call method to tell any descendants that the view was restored
    if(this.getWindowState() == Dialog.MAXIMIZED) {
      //dialog sets display properties directly (bypasses jsx3.gui.Block); this necessitates that restoreView and restoreScrollPos be called manually
      jsx3.gui.Painted._onAfterRestoreViewCascade(this,this._getRenderedDialog());
      jsx3.html.restoreScrollPosition(this._getRenderedDialog());
    }
  };

  /**
   * Sets the display for the object. Note that although the framework uses CSS to apply this setting, the actual values that get set are determined by the system.
   * Only those parameters listed for @DISPLAY are supported as inputs to this function.
   * @param DISPLAY {String} one of jsx3.gui.Block.DISPLAYNONE (display:none;) and jsx3.gui.Block.DISPLAYBLOCK (display:;)
   * @param bRepaint {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.
   * @return {jsx3.gui.Dialog} this object
   * @package
   */
  Dialog_prototype.setDisplay = function(DISPLAY, bRepaint) {
    this.jsxdisplay = DISPLAY;
    if(bRepaint) {
      if(DISPLAY == jsx3.gui.Block.DISPLAYNONE)
        jsx3.html.persistScrollPosition(this._getRenderedDialog());
      this.updateGUI("display",DISPLAY);
    }
    return this;
  };

  Dialog_prototype._findGUI = function(strCSSName) {
     return this._getRenderedDialog();
   };

  /**
   * Applies focus to the caption bar if the dialog has one, otherwise the dialog is given focus. This method places
   * this dialog in front of all other dialogs. If this dialog is minimized in a task bar then this method will 
   * un-minimize it. 
   * 
   * @param-private bTimeout {boolean}
   */
  Dialog_prototype.focus = function(bTimeout) {
    // TODO: how to determine in IE if the object has just been painted?
    if (! bTimeout) {
      jsx3.sleep(function(){this.focus(true);}, "focus" + this.getId(), this);
      return;
    }

    var objGUI = this._getRenderedDialog();
    if (! objGUI) return;

    if (this.getWindowState() == Dialog.MINIMIZED) {
      if (this.getTaskButton())
        this.doToggleState(Dialog.MAXIMIZED);
      else
        jsx3.html.focus(this._getRenderedDialog());
    } else {
      var hide = jsx3.app.Browser.isTableMoveBroken();
      if (hide) {
        // hide content for IE bug
        objGUI.childNodes[1].style.display = "none";
      }

      // move dialog to front
      this.setZIndex(this.getServer().getNextZIndex(jsx3.app.Server.Z_DIALOG),true);
      //subclassed: from Block; gives focus to the captionbar for the dialog, not the dialog
      var bar = this.getCaptionBar();
      if (bar != null)
        bar.focus();
      else
        jsx3.html.focus(this._getRenderedDialog());

      if (hide) {
        // show content again
        objGUI.childNodes[1].style.display = "";
      }
    }
  };

  /**
   * Returns whether this dialog instance is the front-most dialog among all open dialogs
   * @return {boolean}
   */
  Dialog_prototype.isFront = function() {
    if (this.getWindowState() == Dialog.MINIMIZED)
      return false;

    var parent = this.getParent();
    var siblingDialogs = parent.getDescendantsOfType(Dialog, true);
    for (var i = 0; i < siblingDialogs.length; i++) {
      if (siblingDialogs[i] != this && siblingDialogs[i].getWindowState() == Dialog.MAXIMIZED &&
          siblingDialogs[i].getZIndex() > this.getZIndex())
        return false;
    }
    return true;
  };

  /**
   * Brings this dialog to the front of the dialog stack. package private for now.
   * @private
   * @jsxobf-clobber
   */
  Dialog_prototype._bringForward = function(objEvent, objGUI) {
    if (! this.isFront()) {
      var objContent = this._getDialogContent();
      var strDisplay = objContent.style.display;
      var hide = jsx3.app.Browser.isTableMoveBroken();

      if (strDisplay != "none" && hide)
        objContent.style.display = "none";

      this.setZIndex(this.getServer().getNextZIndex(jsx3.app.Server.Z_DIALOG),true);

      if (strDisplay != "none" && hide)
        objContent.style.display = strDisplay;
    }
  };

  /** @private @jsxobf-clobber */
  Dialog_prototype._getDialogContent = function() {
    var objGUI = this._getRenderedDialog();
    return objGUI != null ? objGUI.childNodes[1] : null;
  };

  /**
   * Returns object handle to the jsx3.gui.ToolbarButton instance that resides in the application (this.getServer()) task bar and is associated with this dialog instance; returns null if none found
   * @param objTaskBar {jsx3.gui.WindowBar} specify the task bar to search in
   * @return {jsx3.gui.ToolbarButton}  or null
   */
  Dialog_prototype.getTaskButton = function(objTaskBar) {
    if (objTaskBar == null) {
      var server = this.getServer();
      if (server != null)
        objTaskBar = server.getTaskBar();
    }

    if (objTaskBar != null) {
      return objTaskBar.getChild(Dialog.TASKBAR_BUTTON_PREFIX + this.getId());
    }

    return null;
  };

  /**
   * Ensures that HTML content is added to the correct VIEW element given the unique complexities of a the jsx3.gui.Dialog class
   * @param objJSX {jsx3.app.Model} JSX GUI object that is already part of the dialog's MODEL, but not yet a part of its VIEW
   */
  Dialog_prototype.paintChild = function(objJSX, bGroup) {
    var objGUI = this._getRenderedDialog();
    if (objGUI != null) {
      if (this.getCaptionBar() == objJSX) {
        this.repaint();
      } else {
        this.jsxsuper(objJSX, bGroup, objGUI.childNodes[1]);
      }
    }
  };

  /**
   * removes the dialog box from the JSX DOM and removes its on-screen VIEW from the browser DOM
   */
  Dialog_prototype.doClose = function() {
    this.getParent().removeChild(this);
  };

  Dialog_prototype.onSetParent = function(objNewParent) {
    var server = this.getServer();
    if (server != null && server != objNewParent.getServer())
      this._removeFromTaskBar(server);

    return true;
  };

  /**
   * Implementation for this class that repaints the dialog if the caption bar was removed.
   * @package
   */
  Dialog_prototype.onSetChild = function(objChild) {
    this.jsxsuper(objChild);

    if(!this.getCaptionBar() && Dialog._captionBarFinder(objChild)) this.clearBoxProfile(true);
    return true;
  };

  /** @private @jsxobf-clobber */
  Dialog_prototype._removeFromTaskBar = function(objServer) {
    if (objServer == null) objServer = this.getServer();

    var myButton = this.getTaskButton(objServer.getTaskBar());
    if (myButton != null)
      myButton.getParent().removeChild(myButton);
  };

  /**
   * fires any custom or system event code necessary for object cleanup (such as clearing the VIEW) when the item is removed from the DOM
   *              This method should be overridden by classes with an on-screen view represented by a TD object
   * @private
   */
  Dialog_prototype.onDestroy = function(objParent) {
    //look for the associated tbb in the taskbar and also remove
    this._removeFromTaskBar(objParent.getServer());

    //call standard destroy method for model (removes on-screen view if one exists)
    this.jsxsuper(objParent);
  };

  /**
   * Returns state of the window (full-size / window-shaded). Default: jsx3.gui.Dialog.MAXIMIZED
   * @return {int} one of: jsx3.gui.Dialog.MAXIMIZED or jsx3.gui.Dialog.MINIMIZED
   */
  Dialog_prototype.getWindowState = function() {
    //default to true for Selected state
    return (this.jsxwindowstate != null) ? this.jsxwindowstate : Dialog.MAXIMIZED;
  };

  /**
   * Sets state of the window (full-size / window-shaded); returns ref to self for method chaining
   * @param STATE {int} one of: jsx3.gui.Dialog.MAXIMIZED or jsx3.gui.Dialog.MINIMIZED
   * @return {jsx3.gui.Dialog} this object
   */
  Dialog_prototype.setWindowState = function(STATE) {
    //sets whether the dialog window is minimized or maximized
    this.jsxwindowstate = STATE;
    return this;
  };

  /**
   * Returns numeric multiplier for the dialog's z-index. If a dialog box needs to always be on top of other dialog box instances, this multiplier can be increased to assure the appropriate zIndex.  For example, a value of 5 would mean that this dialog box would be stacked on top of all dialog boxes with a alwaysOnTop multiplier less than 5. Default: 1
   * @return {int} integer
   */
  Dialog_prototype.getZMultiplier = function() {
    //return multiplier that will index this item at a z-index that is 10x higher if alwaysontop is true
    return (this.jsxzmultiplier != null) ? this.jsxzmultiplier : 1;
  };

  /**
   * Sets numeric multiplier for the dialog's z-index. If a dialog box needs to always be on top of other dialog box instances, this multiplier can be increased to assure the appropriate zIndex.  For example, a value of 5 would mean that this dialog box would be stacked on top of all dialog boxes with a alwaysOnTop multiplier less than 5
   * @param intMultiplier {int} integer; zero is allowed, but is not recommended; passing null is equivalent to passing 1
   * @return {jsx3.gui.Dialog} this object
   */
  Dialog_prototype.setZMultiplier = function(intMultiplier) {
    //intMultiplier will be multiplied by the highest z-index value to give this dlg box a higher/lower indexing range
    this.jsxzmultiplier = intMultiplier;
    return this;
  };

  /**
   * Returns whether a dialog displays as modal or not. Modal dialogs mask the rest of the container with an semi-transparent mask that blocks mouse interaction. Modal dialogs do not show up in the task bar. Default: jsx3.gui.Dialog.NONMODAL
   * @return {int} one of: jsx3.gui.Dialog.NONMODAL or jsx3.gui.Dialog.MODAL
   */
  Dialog_prototype.getModal = function() {
    return this.jsxmodal != null ? this.jsxmodal : Dialog.NONMODAL;
  };

  /**
   * Sets whether a dialog displays as modal or not. Modal dialogs mask the rest of the container with an semi-transparent mask that blocks mouse interaction. Modal dialogs do not show up in the task bar.
   * @param intModal {int} one of: jsx3.gui.Dialog.NONMODAL or jsx3.gui.Dialog.MODAL
   * @return {jsx3.gui.Dialog} this object
   */
  Dialog_prototype.setModal = function(intModal) {
    this.jsxmodal = intModal;
    return this;
  };

  /**
   * subclassed method: IE has a bug that will cause it to crash if nested tables are dragged across the screen; setting their display to 'none' fixes this
   * @private
   */
  Dialog_prototype.doBeginMove = function(objEvent, objGUI) {
    if (objEvent.leftButton()) {
      this._jsxmoving = true;
      var objDlg = this._getRenderedDialog();
      var objDragProxy = objDlg.childNodes[2];
      objDragProxy.style.visibility = "";
      jsx3.html.focus(objDlg.childNodes[0]);
      try {
        this.jsxsupermix(objEvent, objDragProxy);
        Event.subscribe(Event.MOUSEUP, this, "doEndMove");
        this.setZIndex(this.getServer().getNextZIndex(jsx3.app.Server.Z_DIALOG),true);
      } catch(e) {
        //always recover; error would most likely be due to the before move model event code applied by the developer
        var objError = jsx3.lang.NativeError.wrap(e);
        LOG.error("BeforeMove model event error for the control, " + this.getName() + ".\nDescription:\n" + objError);
        this._doResetMove(objDragProxy);
      }
    }
  };


  /**
   * Resets the state of the dialog after a move
   * @private
   * @jsxobf-clobber
   */
  Dialog_prototype._doResetMove = function(objDragProxy) {
    objDragProxy.style.visibility = "hidden";
    objDragProxy.style.left = "-1px";
    objDragProxy.style.top = "-1px";
    this._jsxmoving = false;
    Event.unsubscribe(Event.MOUSEUP,this,"doEndMove");
  };


  /**
   * override this method from Event in order to automatically prevent dragging out of view if no AFTERMOVE event is defined, to define an AFTERMOVE event and still constrain the position of the dialog, call this.constrainPosition() in the event. subclassed method: IE has a bug that will cause it to crash if nested tables are dragged across the screen; setting their display to 'none' during the drag fixes this
   * @private
   */
  Dialog_prototype.doEndMove = function(objEvent) {
    if (this._jsxmoving) {
      var objDlg = this._getRenderedDialog();
      var objDragProxy = objDlg.childNodes[2];
      objDlg.style.left = parseInt((parseInt(objDlg.style.left) + parseInt(objDragProxy.style.left) + 1)) + "px";
      objDlg.style.top = parseInt((parseInt(objDlg.style.top) + parseInt(objDragProxy.style.top) + 1)) + "px";
      this._doResetMove(objDragProxy);
      objEvent = objEvent.event;
      if (objDlg.ownerDocument.getElementsByTagName("body")[0]) {
        try {
          this.jsxsupermix(objEvent, objDlg);
        } catch(e) {
          var objError = jsx3.lang.NativeError.wrap(e);
          LOG.error("AfterMove model event error for the control, " + this.getName() + ".\nDescription:\n" + objError);
        }

        if (! this.getEvent(Interactive.AFTER_MOVE))
          this.constrainPosition();
      } else {
        LOG.error("doEndMove: " + jsx3.html.getOuterHTML(objEvent.srcElement()));
      }
    }
    //fx on windows pixelates the screen; currently the least intrusive way to avoid is to apply focus to the dialog
    this.focus(true);
  };

  /**
   * Returns object handle to browser native VIEW for the dialog. Call this instead of getRendered() to get a handle to the actual dialog. Calling getRendered() on a modal dialog returns a handle to the semi-transparent element that contains the dialog, not the dialog itself
   * @return {HTMLElement} Browser-native HTML element
   * @private
   * @jsxobf-clobber
   */
  Dialog_prototype._getRenderedDialog = function() {
    var objGUI = this.getRendered();
    if (objGUI != null && this.jsxmodal) {
      return objGUI.childNodes[1];
    } else {
      return objGUI;
    }
  };

  /**
   * Returns the absolute positioning of the object's on-screen view (specifically, the dialog box, not its modal container if there is one) in relation to JSXROOT (whose left/top is 0/0).
   *            Returns information as a JavaScript object with properties, L, T, W, H
   *            of @objRoot is null, the on-screen view for JSXROOT is used as the object reference
   * @param objRoot {HTMLElement} object reference to IE DOM object (i.e., div, span, etc); if null is passed, the first div child of JSXROOT's on-screen representation will be used
   * @return {Object<String, int>} JScript object with properties: L, T, W, H (corresponding to left, top width, height)
   */
  Dialog_prototype.getAbsolutePosition = function(objRoot) {
    return this.jsxsuper(objRoot, this._getRenderedDialog());
  };

  /**
   * Sets the CSS left property relative to the object's parent
   * @param intLeft {int} left in pixels; if no value is supplied, the dialog will be centered within its parent container
   * @param bRepaint {boolean} false if null; if true, the dialog VIEW will be updated to reflect the setting.
   * @return {jsx3.gui.Dialog} this
   * @package
   */
  Dialog_prototype.setLeft = function(intLeft,bRepaint) {
    //update the model
    this.jsxleft = intLeft;

    //update the view (calculate the true value if implied via a null)
    if(bRepaint) {
        this._updateDialogProfile({left:intLeft});
    } else {
      this.setBoxDirty();
    }

    return this;
  };

  /**
   * Sets the CSS top property relative to the object's parent
   * @param intTop {int} top in pixels; if no value is supplied, the dialog will be centered within its parent container
   * @param bRepaint {boolean} false if null; if true, the dialog VIEW will be updated to reflect the setting.
   * @return {jsx3.gui.Dialog} this
   * @package
   */
  Dialog_prototype.setTop = function(intTop, bRepaint) {
    this.jsxtop = intTop;

    //update the view (calculate the true value if implied via a null)
    if(bRepaint) {
      this._updateDialogProfile({top:intTop});
    } else {
      this.setBoxDirty();
    }

    return this;
  };

  /**
   * Sets the CSS width for the object
   * @param intWidth {int} width (in pixels)
   * @param bRepaint {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.. Note that as of 3.2 it is strongly recommended to update the VIEW every time the MODEL is updated.
   * @return {jsx3.gui.Dialog} this object
   * @package
   */
  Dialog_prototype.setWidth = function(intWidth,bRepaint) {
    this.jsxwidth = intWidth;
    if (bRepaint) {
      this._updateDialogProfile({width:this.jsxwidth});
    } else {
      //destroy the box profile abstraction for all descendants
      this.setBoxDirty();
    }
    return this;
  };

  /**
   * Sets the CSS height for the object;
   *            returns reference to self to facilitate method chaining;
   * @param intHeight {int} height (in pixels)
   * @param bRepaint {boolean} if <code>true</code>, the view of this object is immediately updated, obviating the need to call <code>repaint()</code>.. Note that as of 3.2 it is strongly recommended to update the VIEW every time the MODEL is updated.
   * @return {jsx3.gui.Dialog} this object
   * @package
   */
  Dialog_prototype.setHeight = function(intHeight,bRepaint) {
    this.jsxheight = intHeight;
    if (bRepaint) {
      this._updateDialogProfile({height:this.jsxheight});
    } else {
      //destroy the box profile abstraction for all descendants
      this.setBoxDirty();
    }
    return this;
  };

  /**
   * Toggles the state of the dialog between 'maximized' and its 'initial state'
   * @param objTBB {jsx3.gui.ToolbarButton} toolbarbutton instance on the dialog to toggle the image/tip text for
   */
  Dialog_prototype.doMaximize = function(objTBB) {
    if (this.getWindowState() == Dialog.MINIMIZED)
      this.doToggleState(Dialog.MAXIMIZED);

    if (this._jsxmaxstate != null) {
      var wh = this._constrainWidthHeight(this._jsxmaxstate.jsxwidth, this._jsxmaxstate.jsxheight);

      //update the model directly
      this._setLTWHDirect(this._jsxmaxstate.jsxleft, this._jsxmaxstate.jsxtop, wh[0], wh[1]);
      delete this._jsxmaxstate;

      //update the boxmodel
      var objImplicit = {left:this.getLeft(),top:this.getTop(),width:this.getWidth(),height:this.getHeight()};
      this._updateDialogProfile(objImplicit, true);

//      //update captionbar icon
      if (objTBB)  objTBB.setDynamicProperty("jsxtip","jsx3.gui.Dialog.max").setDynamicProperty("jsximage", "@Max Icon").repaint();
    } else {
      //update the model
      this._jsxmaxstate = {};
      this._jsxmaxstate.jsxwidth = this.getWidth();
      this._jsxmaxstate.jsxheight = this.getHeight();
      this._jsxmaxstate.jsxtop = this.getTop();
      this._jsxmaxstate.jsxleft = this.getLeft();
      var objP = this.getParent().getAbsolutePosition();

      var objGUI = this._getRenderedDialog();

      //update the model directly
      var wh = this._constrainWidthHeight(objP.W - Dialog.CONSTRAIN_PADDING[1] - Dialog.CONSTRAIN_PADDING[3],
          objP.H - Dialog.CONSTRAIN_PADDING[0] - Dialog.CONSTRAIN_PADDING[2]);

      this._setLTWHDirect(Math.min(parseInt(objGUI.style.left), objP.W - wh[0] - Dialog.CONSTRAIN_PADDING[1]),
          Math.min(parseInt(objGUI.style.top), objP.H - wh[1] - Dialog.CONSTRAIN_PADDING[2]),
          wh[0], wh[1]);

      //update the boxmodel
      var objImplicit = {left:this.getLeft(),top:this.getTop(),width:this.getWidth(),height:this.getHeight()};
      this._updateDialogProfile(objImplicit, true);

//      //update captionbar icon
      if (objTBB) objTBB.setDynamicProperty("jsxtip","jsx3.gui.Dialog.restore").setDynamicProperty("jsximage", "@Restore Icon").repaint();
    }
  };

  /**
   * Returns whether the dialog can be resized or not. Default: jsx3.gui.Dialog.RESIZABLE
   * @return {int} one of: jsx3.gui.Dialog.RESIZABLE jsx3.gui.Dialog.FIXED
   */
  Dialog_prototype.getResize = function() {
    return (this.jsxresize == null) ? Dialog.RESIZABLE : this.jsxresize;
  };

  /**
   * Sets whether the dialog box's on-screen view can be resized; returns reference to self to facilitate method chaining
   * @param RESIZE {int} one of: jsx3.gui.Dialog.RESIZABLE jsx3.gui.Dialog.FIXED
   * @return {jsx3.gui.Dialog} this object
   */
  Dialog_prototype.setResize = function(RESIZE) {
    this.jsxresize = RESIZE;
    this.setBoxDirty();
    return this;
  };

  /**
   * Sets resize parameters such as min width, max width, etc for the dialog; returns reference to self to facilitate method chaining
   * @param RESIZE {int} one of: jsx3.gui.Dialog.RESIZABLE jsx3.gui.Dialog.FIXED
   * @param intMinX {int} min width for the dialog when being resized
   * @param intMinY {int} min height for the dialog when being resized
   * @param intMaxX {int} max width for the dialog when being resized
   * @param intMaxY {int} max heightfor the dialog when being resized
   * @return {jsx3.gui.Dialog} this object
   */
  Dialog_prototype.setResizeParameters = function(RESIZE,intMinX,intMinY,intMaxX,intMaxY,strAfterResizeFunction) {
    this.jsxresize = RESIZE;
    this.jsxminx = intMinX;
    this.jsxminy = intMinY;
    this.jsxmaxx = intMaxX;
    this.jsxmaxy = intMaxY;
  };

  /** @private @jsxobf-clobber */
  Dialog_prototype._constrainWidthHeight = function(intWidth, intHeight) {
    intWidth = Math.max(intWidth, this._getMinWidth());
    intHeight = Math.max(intHeight, this._getMinHeight());
    if (typeof(this.jsxmaxx) == "number") intWidth = Math.min(intWidth, this.jsxmaxx);
    if (typeof(this.jsxmaxy) == "number") intHeight = Math.min(intHeight, this.jsxmaxy);
    return [intWidth, intHeight];
  };

  /**
   * Returns an object handle to the jsx3.gui.WindowBar instance associated with the jsx3.gui.Dialog instance
   * @return {jsx3.gui.WindowBar} jsx3.gui.WindowBar instance or null
   */
  Dialog_prototype.getCaptionBar = function() {
    return this.findDescendants(Dialog._captionBarFinder, false, false, true);
  };

  /** @private @jsxobf-clobber */
  Dialog._captionBarFinder = function(x) {
    return jsx3.gui.WindowBar &&
           x instanceof jsx3.gui.WindowBar &&
           x.getType() == jsx3.gui.WindowBar.TYPECAPTION;
  };

  /**
   * called on mouse down for the handle
   * @private
   * @jsxobf-clobber
   */
  Dialog_prototype._doBeginResize = function(objEvent, objGUI) {
    //exit early if right-button
    if (! objEvent.leftButton()) return;

    //eval the before -resize code
    var bCancel = this.doEvent(Interactive.BEFORE_RESIZE, {objEVENT:objEvent});

    //if not explicitly cancelled, proceed.
    if (bCancel !== false) {
      Dialog._jsxcurgui = objGUI.parentNode.childNodes[2];

      //bring resize div to front of stack, so user has a visual bounding box during the drag
      Dialog._jsxcurgui.style.visibility = "";
      Dialog._jsxcurgui.style.zIndex = 11;
      objGUI.style.zIndex = 12;

      //determine the offset between the left/top of the draghandle and the true width/height of the bounding box
      var xPro = this.getBoxProfile(true).getChildProfile(1);
      Dialog._jsxoffx = Dialog._RESIZE_DIM+2;// - (xPro.getOffsetWidth() - xPro.getPaintedWidth());
      Dialog._jsxoffy = Dialog._RESIZE_DIM+2;// - (xPro.getOffsetHeight() - xPro.getPaintedHeight());

      //register for the mouse move
      var me = this;
      jsx3.gui.Interactive._beginMoveConstrained(objEvent,objGUI,function(x,y) {return me._doResize(x,y);});
      Event.subscribe(Event.MOUSEUP, this, "_doEndResize");
    }
  };

  /**
   * called by subscription to jsx3.gui.Event.MOUSEMOVE (when the user attempts to resize a dialog by dragging its lower-right corner).
   * @private
   * @jsxobf-clobber
   */
  Dialog_prototype._doResize = function(x, y) {
    if (Dialog._jsxcurgui) {
      //this is how big the dialog's outer dimensions would be if no constraints are applied
      this._jsxcurintx = x + Dialog._jsxoffx;
      this._jsxcurinty = y + Dialog._jsxoffy;

      this._jsxcurintx = Math.max(this._jsxcurintx, this._getMinWidth());
      this._jsxcurinty = Math.max(this._jsxcurinty, this._getMinHeight());
      if (typeof(this.jsxmaxx) == "number") this._jsxcurintx = Math.min(this._jsxcurintx, this.jsxmaxx);
      if (typeof(this.jsxmaxy) == "number") this._jsxcurinty = Math.min(this._jsxcurinty, this.jsxmaxy);

      //set the size of the bounding rectangle (the dashed-blue box)
      var b1c = this.getBoxProfile().getChildProfile(1);
      b1c.recalculate({width:this._jsxcurintx, height:this._jsxcurinty}, Dialog._jsxcurgui);

      //return the calculated value with any applied adjustments
      return [this._jsxcurintx - Dialog._jsxoffx, this._jsxcurinty - Dialog._jsxoffy];
    }
    //echo the value, something wrong with DOM structure (should never happen)
    return [x,y];
  };

  /** @private @jsxobf-clobber */
  Dialog_prototype._getMinWidth = function() {
    var v = Number(this.jsxminx) || -1;
    return Math.max(25, v);
  };

  /** @private @jsxobf-clobber */
  Dialog_prototype._getMinHeight = function() {
    var v = Number(this.jsxminy) || -1;
    var min = 15;
    if (this.getCaptionBar() != null) min += 30;
    return Math.max(min, v);
  };

  /**
   * called by a mouseup event when the user has finished resizing a dialog by dragging its lower-right corner; the on-screen 'onMouseUp' code that calls this function is generated by the given dialog's paint() method; for this code to execute the dialog box's type must be set to 'true' via the function ,setResizeParameters()
   * @param objEvent {jsx3.gui.Event}
   * @private
   * @jsxobf-clobber
   */
  Dialog_prototype._doEndResize = function(objEvent) {
    objEvent = objEvent.event;
    //unsubscribe from the mouse move
    Event.unsubscribe(Event.MOUSEUP,this,"_doEndResize");

    //get dimensions to use when updating the view directly
    Event.publish(objEvent);

    if (!Dialog._jsxcurgui) return;

    var b1c = this.getBoxProfile().getChildProfile(1);
    var intWidth = b1c.getOffsetWidth();
    var intHeight = b1c.getOffsetHeight();

    Dialog._jsxcurgui.style.visibility = "hidden";
    Dialog._jsxcurgui.style.zIndex = 0;
    delete Dialog._jsxcurgui;

//    //cancel event bubbling (the mouse up was handled by the system, so no need)
//    objEvent.cancelBubble();
//
    //update the MODEL directly
    this._setLTWHDirect(intWidth, intHeight);

    //update the box model abstraction (the VIEW). the dialog never resizes with the native browser window, so it doesn't use updateBoxProfile; uses own method instead
    this._updateDialogProfile({width:intWidth, height:intHeight});

    //eval the after resize code
    this.doEvent(Interactive.AFTER_RESIZE, {objEVENT:objEvent, intW:this.getWidth(), intH:this.getHeight(), _gipp:1});
  };

  /** @private @jsxobf-clobber */
  Dialog_prototype._setLTWHDirect = function(l, t, w, h) {
    if (arguments.length == 4) {
      this.setDynamicProperty("jsxleft", null);
      this.jsxleft = l;
      this.setDynamicProperty("jsxtop", null);
      this.jsxtop = t;
    } else {
      w = l;
      h = t;
    }

    this.setDynamicProperty("jsxwidth", null);
    this.jsxwidth = w;
    this.setDynamicProperty("jsxheight", null);
    this.jsxheight = h;
  };

/* NEW BOX MODEL ABSTRACTION FOR DIALOG **********************************************/

  /**
   * Removes the box model abstraction for a given object and its descendants. This effectively resets the box profiler, so dimensions can be recalculated as if the object was just broought into the visual DOM.
   */
  Dialog_prototype.recalcBox = function() {
    //call the super; call the dialog equivalent to updateBoxProfile
    this.jsxsuper();
    this._updateDialogProfile();
  };

  /**
   * gets the size of the canvas for a given child (the true drawspace)
   * @param objChild {jsx3.app.Model} child instance (in case it matters)
   * @return {object} Map with named properties: W and H
   * @private
   */
  Dialog_prototype.getClientDimensions = function(objChild) {
    var contentProfile = (objChild == this.getCaptionBar()) ? this.getBoxProfile(true) : this.getBoxProfile(true).getChildProfile(0);
    return {parentwidth:contentProfile.getClientWidth(),parentheight:contentProfile.getClientHeight()};
  };

  /**
   * Updates the box model for the object
   * @param objImplicit {object} implicit map comprised of one or more of the following: left, top, width, height, boxtype, tagname, parentheight, parentwidth
   * @private
   * @jsxobf-clobber
   */
  Dialog_prototype._updateDialogProfile = function(objImplicit, bRebalance) {
    // re-center in parent if top or left is null
    if (bRebalance && (objImplicit.left == null || objImplicit.top == null)) {
      var objP = this.getParent().getAbsolutePosition();
      if (objImplicit.left == null)
        objImplicit.left = Math.max(0, parseInt((objP.W - objImplicit.width) / 2));
      if (objImplicit.top == null)
        objImplicit.top = Math.max(0, parseInt((objP.H - objImplicit.height) / 2));
    }
    this.syncBoxProfile(objImplicit, true);
  };

  /**
   * Creates the box model/profile for the object.
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance. By providing the parent profile, the true height/width can be ascertained when the child is a percent/factor-of the parent
   * @private
   */
  Dialog_prototype.createBoxProfile = function(objImplicit) {
    //is minimized (is windowshading used)
    var bMinimized = this.getWindowState() == Dialog.MINIMIZED && this.getServer().getTaskBar() == null;

    //get left and top properties for the dialog window (if the parent has no width dimension, assume not painted; use root;
    //if no root, just provide screen dimension equivalent to dialog which will cause a left/top position of 0/0
    var objP = this.getParent();
    if (objP == null) {
      objP = {H:this.getHeight(),W:this.getWidth()};
    } else {
      objP = objP.getAbsolutePosition();
      if (objP == null || objP.W == 0) objP = {H:this.getHeight(),W:this.getWidth()};
    }

    //derive top/left/zindex
    var intTop = jsx3.util.strEmpty(this.getTop()) ? Math.max(0, parseInt((objP.H - this.getHeight()) / 2)) : this.getTop();
    var intLeft = jsx3.util.strEmpty(this.getLeft()) ? Math.max(0, parseInt((objP.W - this.getWidth()) / 2)) : this.getLeft();

    //is there a caption bar?
    var myCaptionBar = this.getCaptionBar();

    //use own explicit width/height
    if(objImplicit == null) objImplicit = {};
    if(objImplicit.left == null) objImplicit.left = intLeft;
    if(objImplicit.top == null) objImplicit.top = intTop;
    if(objImplicit.width == null) objImplicit.width = this.getWidth();
    var strBorder = this.getBorder("1px pseudo");
    if(objImplicit.height == null) {
      if(bMinimized) {
        objImplicit.height = (new jsx3.gui.Painted.Box({border:strBorder}).getBorderHeight()) +  (myCaptionBar != null ? myCaptionBar.getHeight() : 0) + (2 * this.getBuffer(2));
      } else {
        objImplicit.height = this.getHeight();
      }
    }
    objImplicit.tagname = "div";
    objImplicit.boxtype = "box";
    objImplicit.padding = this.getBuffer(2);
    objImplicit.border = strBorder;
    var b1 = new jsx3.gui.Painted.Box(objImplicit);

    //add content box
    var o = {};
    o.parentwidth = b1.getClientWidth();
    o.parentheight = b1.getClientHeight();
    o.width = "100%";
    o.height = b1.getClientHeight() - (myCaptionBar != null ? (myCaptionBar.getHeight() + this.getBuffer(2)) : 0);
    o.top = myCaptionBar != null ? (myCaptionBar.getHeight() + (this.getBuffer(2) * 2)) : this.getBuffer(2);
    o.left = this.getBuffer(2);
    o.tagname = "div";
    o.boxtype = "box";
    o.border = this.getContentBorder("1px pseudo");
    var b1b = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1b);

    //add dashed-border box that resizes (provides animated interactions during the resize)
    o = {};
    o.left = -1;
    o.top = -1;
    o.width = this.getWidth();
    o.height = objImplicit.height;
    o.tagname = "div";
    o.boxtype = "box";
    o.padding = "0";
    o.border = "1px pseudo";
    var b1c = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1c);

    //add anchor/hot-spot in lower right that will listen for the resize
    o = {};
    o.left = this.getWidth() - (Dialog._RESIZE_DIM+2);
    o.top = this.getHeight() - (Dialog._RESIZE_DIM+2);
    o.width = Dialog._RESIZE_DIM+1;
    o.height = Dialog._RESIZE_DIM+1;
    o.tagname = "div";
    o.boxtype = "box";
    var b1d = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1d);

    //add drag image that will listen for the resize
    o = {};
    o.left = this.getWidth() - (Dialog._RESIZE_DIM+2);
    o.top = this.getHeight() - (Dialog._RESIZE_DIM+2);
    o.width = Dialog._RESIZE_DIM;
    o.height = Dialog._RESIZE_DIM;
    o.tagname = "div";
    o.boxtype = "box";
    var b1e = new jsx3.gui.Painted.Box(o);
    b1.addChildProfile(b1e);

    //return the newly-created box profile
    return b1;
  };

  /**
   * @package
   */
  Dialog_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    //get the existing box profile abstraction
    var b1 = this.getBoxProfile(true, objImplicit);

    //adjust the existing box model
    if (objGUI != null) objGUI = this._getRenderedDialog();
    if (objGUI != null) {
      //is there a caption bar?
      var myCaptionBar = this.getCaptionBar();

      //recalculate the boxes, passing the appropriate DOM element to resize
      var recalcRst = b1.recalculate(objImplicit,objGUI,objQueue);
      if (!recalcRst.w && !recalcRst.h) return;

      //update the content box
      var b1b = b1.getChildProfile(0);
      var myHeight = b1.getClientHeight() - (myCaptionBar != null ? (myCaptionBar.getHeight() + this.getBuffer(2)) : 0);
      b1b.recalculate({parentwidth:b1.getClientWidth(),parentheight:b1.getClientHeight(),width:"100%",height:myHeight},objGUI.childNodes[1],objQueue);

      var b1c = b1.getChildProfile(1);
      b1c.recalculate({width:this.getWidth(),height:this.getHeight()}, objGUI.childNodes[2], objQueue);
      if (this.getResize() == Dialog.RESIZABLE) {
        var b1d = b1.getChildProfile(2);
        b1d.recalculate({top:this.getHeight() - (Dialog._RESIZE_DIM+2),left:this.getWidth() - (Dialog._RESIZE_DIM+2)},
            objGUI.childNodes[3],objQueue);
        var b1e = b1.getChildProfile(3);
        b1e.recalculate({top:this.getHeight() - (Dialog._RESIZE_DIM+2),left:this.getWidth() - (Dialog._RESIZE_DIM+2)},
            objGUI.childNodes[4],objQueue);
      }

      //recalculate the captionbar
      if (myCaptionBar)
        objQueue.add(myCaptionBar, {width:"100%",parentwidth:b1.getClientWidth(),height:myCaptionBar.getHeight()},
            objGUI.childNodes[0], true);

      //recalculate the child objects
      var objChildren = this.getChildren();
      var dec = 0;
      var objContentBlock = objGUI.childNodes[myCaptionBar ? 1 : 0];
      if (objContentBlock) {
        var oCNodes = objContentBlock.childNodes;
        for (var i=0;i<objChildren.length;i++) {
          if (objChildren[i] != myCaptionBar) {
            objQueue.add(objChildren[i], {parentwidth:b1b.getClientWidth(),parentheight:b1b.getClientHeight()}, true, true);
          } else {
            dec = 1;
          }
        }
      }
    }
  };

  /**
   * Returns the HTML, used for this object's on-screen VIEW
   * @return {String}
   */
  Dialog_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //get common variables
    var strId = this.getId();

    //determine runtime profiles (minimized, zIndex, etc)
    var bMinimized = this.getWindowState() == Dialog.MINIMIZED && this.getServer().getTaskBar() == null;
    var displayStyle = bMinimized ? "display:none;" : "";
    var intZRange = (this.getServer() != null) ? this.getServer().getNextZIndex(jsx3.app.Server.Z_DIALOG) * this.getZMultiplier() : 5000;

    //bind hooks to standard model events that the dialog should implement. For now: keypress and keydown. mouseup is always required, so force here; scroll is used by a descendant
    var eventMap = {};
    if(this.getEvent("jsxkeypress") != null) eventMap[Event.KEYPRESS] = true;
    if(this.getModal() != Dialog.MODAL) eventMap[Event.MOUSEDOWN] = "_bringForward";

    //render custom atts
    var bModal = this.getModal() == Dialog.MODAL;
    var strImplementedEvents = this.renderHandlers(eventMap, bModal ? 1 : 0);
    var strProps = this.renderAttributes(null, true);

    //if there is a task bar that is part of the server, check if it contains a toolbar button that is bound to this dialog instance (one that will toggle its min/max state)
    this.repaintTaskBar();

    //get the outer-most box
    var b1 = this.getBoxProfile(true);

    //override height for the box profile for outer and bounding boxes if in a 'window-shade' minimized state
    if(bMinimized) {
      //determine the offset (ie/fx box model differences affect the width to apply)
      var diffY = b1.getOffsetHeight() - b1.getPaintedHeight();
      var strHeight = "height:" + (32 - diffY) + "px;";
    } else {
      var strHeight = "";
    }
    strHeight = "";

    //if this is a modal dialog, declare containing markup; adjust style and attribute info as appropriate
    if (bModal) {
      // render an outer container to hold the mask and dialog
      // modal dialogs will cancel bubble for key events that bubble up as far as the outer container, cancel return will be for any alt- or ctrl- key event
      var objModalWrapper = ['<div id="' + strId + '" ' + this.paintLabel() + this.paintIndex() + this.renderHandler(Event.KEYDOWN, "_doModalKeyDown", 0) +
                             ' style="width:100%;height:100%;position:absolute;left:0px;top:0px;z-index:' + intZRange + this.paintVisibility() + ';"' + '>' +
                             '<div class="jsx30dialog_modal"' + this.renderHandler(Event.MOUSEDOWN, "_doModalMaskMouseDown", 1) +
                              this.renderHandler(Event.MOUSEUP, "_doModalMaskMouseUp", 1) + '>&#160;</div>','<span ' + this.paintIndex() +
                              this.renderHandler(Event.KEYDOWN, "_doModalKeyDown", 1) + ' style="position:absolute;left:-1px;top:0px;width:1px;height:1px;overflow:hidden;"></span></div>'];
      b1.setAttributes(strImplementedEvents + this.paintIndex() + ' class="' + this.paintClassName() + '" ' + strProps);
      b1.setStyles('z-index:1;' + this.paintBackgroundColor() + this.paintBackground() + this.paintDisplay() + this.paintCSSOverride() + strHeight);
    } else {
      var objModalWrapper = ["",""];
      b1.setAttributes('id="' + strId + '"' + this.paintLabel() + strImplementedEvents + this.paintIndex() + ' class="' + this.paintClassName() + '" ' + strProps);
      b1.setStyles('z-index:' + intZRange + ';' + this.paintBackgroundColor() + this.paintBackground() + this.paintVisibility() + this.paintDisplay() + this.paintCSSOverride() + strHeight);
    }

    //render the caption bar (a jsx3.gui.WindowBar), if no caption bar render an invisible span so that DOM tree is predictable
    var myCaptionBar = this.getCaptionBar();
    var p1a = (myCaptionBar != null) ? myCaptionBar.paint() : "<span style='display:none;'>&#160;</span>";

    //render the main content box
    var b1b = b1.getChildProfile(0);
    b1b.setAttributes('class="jsx30dialog_content"');
    b1b.setStyles(this.paintTextAlign() + this.paintOverflow() + displayStyle);

    //paint the content
    var children = this.getChildren().filter( function(x) { return x != myCaptionBar; } );
    var p1b1 = this.paintChildren(children);

    //render the dashed box that follows when the resize happens
    var b1c = b1.getChildProfile(1);
    b1c.setAttributes('class="jsx30dialog_mask"');
    b1c.setStyles("overflow:hidden;visibility:hidden;" + strHeight);

    //add the resize box to the lower right corer if the dialog is resizeable
    if (this.getResize() == Dialog.RESIZABLE) {
      var b1d = b1.getChildProfile(2);
      b1d.setStyles("overflow:hidden;cursor:se-resize;z-index:12;background-image:url(" + jsx3.gui.Block.SPACE + ");" + displayStyle);
      b1d.setAttributes(this.renderHandler(Event.MOUSEDOWN, "_doBeginResize", bModal ? 2 : 1));
      var b1e = b1.getChildProfile(3);
      b1e.setStyles("overflow:hidden;z-index:1;background-image:url(" + Dialog.RESIZEICON + ");" + displayStyle);
      var p1d = b1d.paint().join("") + b1e.paint().join("");
    } else {
      var p1d = "";
    }

    return objModalWrapper[0] + b1.paint().join(p1a+b1b.paint().join(p1b1)+b1c.paint().join("&#160;")+p1d) + objModalWrapper[1];
  };

  /** @private @jsxobf-clobber */
  Dialog_prototype._doModalKeyDown = function(objEvent, objGUI) {
    if (objEvent.srcElement() == objGUI && objEvent.tabKey()) {
      objEvent.cancelReturn();
      (this.getCaptionBar() || this).focus();
    } else {
      objEvent.setAttribute("jsxmodal", 1);
    }
  };

  /** @private @jsxobf-clobber */
  Dialog_prototype._doModalMaskMouseDown = function(objEvent, objGUI) {
    this.beep().focus();
    objEvent.cancelBubble();
  };

  /** @private @jsxobf-clobber */
  Dialog_prototype._doModalMaskMouseUp = function(objEvent, objGUI) {
    this.focus();
    objEvent.cancelBubble();
  };

  /**
   * repaints the task bar for the server managing the dialog instance, allowing a persistent min/max anchor for the dialog to be added to the active task bar
   * @private
   */
  Dialog_prototype.repaintTaskBar = function() {
    //persist common variables
    var strId = this.getId();
    var myTaskBar;

    //if there is a task bar that is part of the server, check if it contains a toolbar button that is bound to this dialog instance (one that will toggle its min/max state)
    if (this.getServer() != null && (myTaskBar = this.getServer().getTaskBar()) != null && this.getModal() != Dialog.MODAL) {
      var myCaptionBar = this.getCaptionBar();
      var myTaskButton = this.getTaskButton();

      //check first if there is a corresponding toolbar button in the taskbar for this given dialog instance
      if (myCaptionBar != null) {
        //force the caption bar to appply its dynamic properties here in case its text property uses a dynamic property
        myCaptionBar.applyDynamicProperties();

        if (myTaskButton == null) {
          jsx3.require("jsx3.gui.ToolbarButton");
          //add the toggle button to the application task bar
          var objChild = new jsx3.gui.ToolbarButton(Dialog.TASKBAR_BUTTON_PREFIX + strId, jsx3.gui.ToolbarButton.TYPECHECK, myCaptionBar.getText());
          myTaskBar.setChild(objChild);

          // event returns false because the Dialog will set the button state
          objChild.setEvent("var d = jsx3.GO('" + strId + "'); d.doToggleState(d.isFront() ? jsx3.gui.Dialog.MINIMIZED : jsx3.gui.Dialog.MAXIMIZED); false;","jsxexecute");
          objChild.setState(this.getWindowState() == Dialog.MAXIMIZED ? jsx3.gui.ToolbarButton.STATEON : jsx3.gui.ToolbarButton.STATEOFF);
          objChild.setText(jsx3.util.strTruncate(myCaptionBar.getText() || "", 20));
          objChild.setDynamicProperty("jsximage", "@Task Icon");

          //if the task bar already has a VIEW, insert the toolbar icon; otherwise bind an onpaint event that will repaint the taskbar once the dialog is painted to screen
          if (myTaskBar.getRendered() == null) {
            jsx3.sleep(myTaskBar.repaint, "repaint" + myTaskBar.getId(), myTaskBar);
          } else {
            myTaskBar.paintChild(objChild);
          }
        } else {
          // the title of the dialog may have changed
          var caption = myCaptionBar.getText(); // is there actually a caption text?
          if (caption)
            myTaskButton.setText(jsx3.util.strTruncate(caption, 20)).setTip(caption).repaint();
        }
      } else if (myTaskButton != null) {
        // the title of the dialog disappeared ... weird
        myTaskButton.getParent().removeChild(myTaskButton);
      }
    }
  };

  Dialog_prototype.paintIndex = function() {
    return this.jsxsuper(this.getIndex() || Number(0));
  };

  /**
   * renders overflow css
   * @return {String} combined CSS property (i.e., overflow:auto;)
   * @private
   */
  Dialog_prototype.paintOverflow = function() {
    if (this.getOverflow() == jsx3.gui.Block.OVERFLOWHIDDEN) {
      return "overflow:hidden;";
    } else {
      return "overflow:auto;";
    }
  };

  Dialog_prototype.paintClassName = function() {
    var cn = this.getClassName();
    return "jsx30dialog" + (cn ? " " + cn : "");
  };

  /**
   * Implements necessary method for the <code>Alerts</code> interface.
   * @return {jsx3.gui.Block} this object.
   */
  Dialog_prototype.getAlertsParent = function() {
    return this;
  };

  /**
   * Modifies the top and left properties of this dialog in order to fit it within its parent container.
   * This method ensures that at least a certain amount of the dialog shows on the East, South, and West edges
   * of the server and that the entire dialog shows on the North edge.
   * <p/>
   * This method is called by default after the user moves a dialog with the mouse. If an <code>AFTER_MOVE</code>
   * model event is specified, then this method is not called automatically and must be called explicitly by the
   * model event.
   *
   * @param arg {boolean|Array<int>} if <code>true</code>, this dialog will be placed entirely within its container,
   *    with a certain amount of padding, and this dialog will be resized if necessary. If this argument is an array,
   *    it is taken as the N-E-S-W minimum pixels to show after constraining the position of the dialog. A
   *    <code>null</code> value for any dimension means that the entire dimension should be shown. A negative value
   *    means the number of pixels less than the size of the dialog in that dimension.
   */
  Dialog_prototype.constrainPosition = function(arg) {
    var objR = this.getRendered();
    var bLive = objR != null;
    var parentNode = null;

    if (objR) {
      parentNode = objR.parentNode;
    } else if (this.getParent()) {
      parentNode = this.getParent().getRendered();
    }

    if (parentNode == null) return;

    var pWidth = parseInt(parentNode.style.width);
    var pHeight = parseInt(parentNode.style.height);

    if (arg === true) {
      var maxWidth = pWidth - Dialog.CONSTRAIN_PADDING[1] - Dialog.CONSTRAIN_PADDING[3];
      var maxHeight = pHeight - Dialog.CONSTRAIN_PADDING[0] - Dialog.CONSTRAIN_PADDING[2];
      // constrain width and height
      if (this.getWidth() > maxWidth)
        this.setWidth(maxWidth, bLive);
      if (this.getHeight() > maxHeight)
        this.setHeight(maxHeight, bLive);

      var maxLeft = pWidth - this.getWidth() - Dialog.CONSTRAIN_PADDING[1];
      var maxTop = pHeight - this.getHeight() - Dialog.CONSTRAIN_PADDING[2];

      // constrain side-side
      if (this.getLeft() < Dialog.CONSTRAIN_PADDING[3])
        this.setLeft(Dialog.CONSTRAIN_PADDING[3], bLive);
      else if (this.getLeft() > maxLeft)
        this.setLeft(maxLeft, bLive);

      // constrain top-bottom
      if (this.getTop() < Dialog.CONSTRAIN_PADDING[0])
        this.setTop(Dialog.CONSTRAIN_PADDING[0], bLive);
      else if (this.getTop() > maxTop)
        this.setTop(maxTop, bLive);

    } else {
      var dim = this.getDimensions();

      if (! arg)
        arg = Dialog.MINIMUM_SHOWING;

      arg = arg.concat();

      if (arg[0] == null) arg[0] = dim[3];
      else if (arg[0] < 0) arg[0] = dim[3] + arg[0];
      if (arg[1] == null) arg[1] = dim[2];
      else if (arg[1] < 0) arg[1] = dim[2] + arg[1];
      if (arg[2] == null) arg[2] = dim[3];
      else if (arg[2] < 0) arg[2] = dim[3] + arg[2];
      if (arg[3] == null) arg[3] = dim[2];
      else if (arg[3] < 0) arg[3] = dim[2] + arg[3];

      // check side-side
      if (dim[0] < arg[3] - dim[2])
        this.setLeft(arg[3] - dim[2], bLive);
      else if (dim[0] > pWidth - arg[1])
        this.setLeft(pWidth - arg[1], bLive);

      // check top-bottom
      if (dim[1] < arg[0] - dim[3])
        this.setTop(arg[0] - dim[3], bLive);
      else if (dim[1] > pHeight - arg[2])
        this.setTop(pHeight - arg[2], bLive);
    }
  };

  /**
   * Implementation for this class that repaints the dialog if the caption bar was removed.
   * @package
   */
  Dialog_prototype.onRemoveChild = function(objChild, intIndex) {
    this.jsxsuper(objChild, intIndex);
    if (jsx3.$A.is(objChild)) {
      this.setBoxDirty();
      this.repaint();
    } else {
      if (Dialog._captionBarFinder(objChild)) {
        this.setBoxDirty();
        this.repaint();
      }
    }
  };

  /**
   * alerts the user's attention to the dialog box by making its caption bar 'flash' on-screen (as it typical with a windows modal dialog)
   * @return {jsx3.gui.Dialog} this object
   */
  Dialog_prototype.beep = function() {
    var myCaptionBar = this.getCaptionBar();
    if (myCaptionBar != null) {
      myCaptionBar.beep();
    } else {
      var objGUI = this._getRenderedDialog();
      jsx3.gui.shakeStyles(objGUI, {backgroundColor: '#FFFFFF'});
    }

    return this;
  };

  /**
   * Form elements might register hot keys with dialogs without repainting them.
   * @package
   */
  Dialog_prototype.getAlwaysCheckHotKeys = function() {
    return true;
  };

  /**
   * Returns the border that surrounds the dialog content.
   * @param-private strDefault {String} default border to use if none provided
   * @return {String}
   * @since 3.7
   */
  Dialog_prototype.getContentBorder = function(strDefault) {
    return jsx3.util.strEmpty(this.jsxcontentborder) && strDefault ? strDefault : this.jsxcontentborder;
  };

  /**
   * Sets the border that surrounds the dialog content. Only updates the model. Call <code>repaint</code> to update the view.
   * @param strCSS {String} valid CSS- or GI-border syntax
   * @returns {jsx3.gui.Template.Dialog} this
   * @since 3.7
   */
  Dialog_prototype.setContentBorder = function(strCSS) {
    this.jsxcontentborder = strCSS;
    this.clearBoxProfile(true);
    return this;
  };



  /**
   * Returns the outer border that surrounds the entire dialog.
   * @param-private strDefault {String} default border to use if none provided
   * @return {String}
   * @since 3.7
   */
  Dialog_prototype.getBorder = function(strDefault) {
    return jsx3.util.strEmpty(this.jsxborder) && strDefault ? strDefault : this.jsxborder;
  };

  /**
   * Sets the outer border that surrounds the entire dialog. Only updates the model. Call <code>repaint</code> to update the view.
   * @param strCSS {String} valid CSS- or GI-border syntax
   * @returns {jsx3.gui.Template.Dialog} this
   * @since 3.7
   */
  Dialog_prototype.setBorder = function(strCSS) {
    this.jsxborder = strCSS;
    this.clearBoxProfile(true);
    return this;
  };

  /**
   * Returns the uniform buffer that separates the dialog's content box, captionbar, and the outer dialog border. For example, if 2 is passed, all objects will be separated by a 2 pixel buffer
   * @param-private strDefault {String} default border to use if none provided
   * @return {int}
   * @since 3.7
   */
  Dialog_prototype.getBuffer = function(strDefault) {
    return jsx3.util.strEmpty(this.jsxbuffer) && strDefault != null ? strDefault : this.jsxbuffer - 0;
  };

  /**
   * Sets the uniform buffer that separates the dialog's content box, captionbar, and the outer dialog border. For example, if 2 is passed, all objects will be separated by a 2 pixel buffer.
   * Immediately updates both model and view.
   * @param intBuffer {int}
   * @since 3.7
   */
  Dialog_prototype.setBuffer = function(intBuffer) {
    this.jsxbuffer = !isNaN(intBuffer) ? parseInt(intBuffer) : intBuffer;
    this.clearBoxProfile(true);
    return this;
  };


/* @JSC :: begin DEP */

  /**
   * Returns the release/build for the class (i.e., "2.2.00")
   * @return {String}
   * @deprecated
   */
  Dialog.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.Dialog
 * @see jsx3.gui.Dialog
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Dialog", -, null, function(){});
 */
jsx3.Dialog = jsx3.gui.Dialog;

/* @JSC :: end */
