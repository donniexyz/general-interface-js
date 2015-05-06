/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Block");

/**
 * Allows for rendering a branch of the DOM of an application in a separate browser window.
 * <p/>
 * Access instances of this class with the following methods in the <code>jsx3.app.Server</code> class:
 * <ul>
 *   <li>createAppWindow()</li>
 *   <li>getAppWindow()</li>
 *   <li>loadAppWindow()</li>
 * </ul>
 *
 * @see jsx3.app.Server#createAppWindow()
 * @see jsx3.app.Server#getAppWindow()
 * @see jsx3.app.Server#loadAppWindow()
 * @since 3.2
 */
jsx3.Class.defineClass('jsx3.gui.Window', jsx3.app.Model, null, function(Window, Window_prototype) {

  var Exception = jsx3.Exception;
  var Logger = jsx3.util.Logger;
  
  var LOG = Logger.getLogger(Window.jsxclass.getName());
  
  /** @private @jsxobf-clobber */
  Window.HTML_URI = jsx3.resolveURI("jsx:///../jsx3.gui.window.html");
  /** @private @jsxobf-clobber */
  Window.HTML_URI_XHTML = jsx3.resolveURI("jsx:///../jsx3.gui.window.xhtml");

  // TODO: put this in a Browser utility class
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
  /** @private @jsxobf-clobber */
  Window._SCREENX = "screenLeft";
  /** @private @jsxobf-clobber */
  Window._SCREENY = "screenTop";
/* @JSC */ } else {
  Window._SCREENX = "screenX";
  Window._SCREENY = "screenY";
/* @JSC */ }

  /**
   * {String} Event subject: published after this window has successfully opened.
   * @final @jsxobf-final
   */
  Window.DID_OPEN = "open";

  /**
   * {String} Event subject: published just before this window will close.
   * @final @jsxobf-final
   */
  Window.WILL_CLOSE = "close";

  /**
   * {String} Event subject: published after this window has received focus.
   * @final @jsxobf-final
   */
  Window.DID_FOCUS = "focus";

  /**
   * {String} Event subject: published after this window has been resized via user interaction.
   * @final @jsxobf-final
   */
  Window.DID_RESIZE = "resize";

  /**
   * {String} Event subject: published after this window's parent has closed.
   * @final @jsxobf-final
   */
  Window.PARENT_DID_CLOSE = "pclose";

  /**
   * {int} The inner width of the window (width of viewable space).
   * @private
   */
  Window_prototype.jsxwidth = 400;

  /**
   * {int} The inner height of the window (height of viewable space).
   * @private
   */
  Window_prototype.jsxheight = 300;

  /**
   * {int} Whether the window is resizable.
   * @private
   */
  Window_prototype.jsxresizable = jsx3.Boolean.FALSE;

  /**
   * {int} Whether the window content will scroll if it outgrows the window.
   * @private
   */
  Window_prototype.jsxscrollable = jsx3.Boolean.FALSE;

  /**
   * {int} Whether the window is dependent on the main application window. Dependent windows close when their
   *   parent window closes.
   * @private
   */
  Window_prototype.jsxdependent = jsx3.Boolean.TRUE;

  /**
   * {String} The title of the window, which will display in the title bar of the OS window.
   * @private
   */
  Window_prototype.jsxtitle = "";

  /**
   * {Object} The browser window object where this JSX window renders.
   * @private  must do global clobber because this field used in jsx3.gui.window.html
   */
  Window_prototype._jsxwindow = null;

  /**
   * {Object} The browser window object where the main application renders.
   * @private
   * @jsxobf-clobber
   */
  Window_prototype._jsxopener = null;

  // window manipulation

  /**
   * The instance initializer.
   * @param strName {String} a unique name for this window.
   */
  Window_prototype.init = function(strName) {
    this.jsxsuper(strName);
  };

  /**
   * Opens the browser window of this window instance. Depending on security settings and popup blockers, 
   * this method may or may not actually open a window. The only safe way to determine whether the window 
   * successfully opened is to register for the <code>DID_OPEN</code> event.
   * @return {boolean} <code>true</code> if the window successfully opened (probably).
   * @throws {jsx3.Exception} if the window is already open.
   */
  Window_prototype.open = function() {
    if (this._jsxwindow != null && !this._jsxwindow.closed) {
      throw new Exception(jsx3._msg("gui.win.op", this));
    } else {
      // open the window
      // apparently IE doesn't like this name to contain a period
      var uri = jsx3.util.strEndsWith(jsx3.app.Browser.getLocation().getPath().toLowerCase(), ".xhtml") ?
          Window.HTML_URI_XHTML : Window.HTML_URI;
      var w = window.open(uri, this.getId().replace(/\./g,""),
          "directories=no," +
          "location=no," +
          "menubar=no," +
          "status=yes," +
          "personalbar=no," +
          "titlebar=yes," +
          "toolbar=no," +
          "width=" + this.getWidth() + "," +
          "height=" + this.getHeight() + "," +
//          "dependent=" + (this.isDependent() ? "yes" : "no") + "," +
          "resizable=" + (this.isResizable() ? "yes" : "no") + "," +
          "scrollbars=" + (this.isScrollable() ? "yes" : "no")
      );

      if (w != null) {
        var me = this;
        /* @JSC */ if (jsx3.CLASS_LOADER.IE) {
          window._getjsxwindow = function(){
          w["_jsxwindow"] = me;
          };
        /* @JSC */ }//IE specific code
        w["_jsxwindow"] = this;
        this._jsxwindow = w;
        this._jsxopener = window;
        return true;
      } else {
        return false;
      }
    }
  };




  /**
   * Closes the browser window of this window instance. Call to properly close the window and perform all necessary resource cleanup.
   * Note: due to differences across the various browsers, calling this method to close the browser window is preferable to allowing the user
   * to close the window via the native browser close button in the window's caption bar.
   * @return {boolean} <code>true</code> if the window successfully closed or <code>false</code> if it didn't close
   *    because of JavaScript security constraints or user interaction.
   * @throws {jsx3.Exception} if the window is already closed.
   */
  Window_prototype.close = function() {
    if (this._jsxwindow != null && !this._jsxwindow.closed) {
      var objWindow = this._jsxwindow;
      objWindow.location = "about:blank";
      var me = this;
      window.setTimeout(function() {
        try {
           objWindow.close();
         } catch(e) {
           var strMsg = jsx3._msg("gui.win.rm", me, jsx3.lang.NativeError.wrap(e).getMessage());
           LOG.warn(strMsg);
         }
      },500);
      return true;
    } else {
      throw new Exception(jsx3._msg("gui.win.cl", this));
    }
  };

  /**
   * Closes the native browser window bound to this window instance AND removes this instance and its descendants from the GI DOM. Note
   * that this method will remove this instance and its descendants (the model), regardless of whether or not the
   * browser window (the view) was able to be successfully closed. If you need greater control in case of errors affecting the native window, call close
   * (e.g., <code>this.close();</code>), followed by a call to removeChild (e.g., <code>this.getParent().removeChild(this);</code>).
   * @since 3.7
   */
  Window_prototype.doClose = function() {
    //decrease the total number of HTML nodes on the page by removing all child content (this seems to help with GC)
    this.getRootBlock().removeChildren();

    //try to close the native window; report the error if thrown
    try {
      this.close();
    } catch(e) {
      var strMsg = jsx3._msg("gui.win.rm", this, jsx3.lang.NativeError.wrap(e).getMessage());
      LOG.warn(strMsg);
    }
    //conclude by removing the DOM branch (this)
    if(this.getParent())
      this.getParent().removeChild(this);
  };

  /**
   * Focuses the browser window of this window instance.
   * @throws {jsx3.Exception} if the window is not open.
   */
  Window_prototype.focus = function() {
    if (this._jsxwindow != null && !this._jsxwindow.closed) {
      this._jsxwindow.focus();
    } else {
      throw new Exception(jsx3._msg("gui.win.cl", this));
    }
  };

  /**
   * Returns whether the browser window of this window instance is open.
   * @return {boolean} <code>true</code> if the window is open.
   */
  Window_prototype.isOpen = function() {
    return this._jsxwindow != null && !this._jsxwindow.closed;
  };

  /**
   * Returns whether the parent application window of this window instance is open.
   * @return {boolean} <code>true</code> if the parent window is open.
   */
  Window_prototype.isParentOpen = function() {
    return this._jsxopener != null && !this._jsxopener.closed;
  };

  /**
   * Moves the browser window of this window instance to a position on the screen. The arguments specify the 
   * offset from the parent application window. If the parent window is no longer open, this window will be moved 
   * relative to the upper-left corner of the screen.
   * @param intOffsetLeft {int} the left offset from the parent window.
   * @param intOffsetTop {int} the top offset from the parent window.
   * @throws {jsx3.Exception} if the window is not open.
   */
  Window_prototype.moveTo = function(intOffsetLeft, intOffsetTop) {
    if (this._jsxwindow != null && !this._jsxwindow.closed) {
      if (this._jsxopener != null && !this._jsxopener.closed)
        this._jsxwindow.moveBy(intOffsetLeft - this._jsxwindow[Window._SCREENX] + this._jsxopener[Window._SCREENX],
            intOffsetTop - this._jsxwindow[Window._SCREENY] + this._jsxopener[Window._SCREENY]);
      else
        this._jsxwindow.moveBy(intOffsetLeft - this._jsxwindow[Window._SCREENX], intOffsetTop - this._jsxwindow[Window._SCREENY]);
    } else {
      throw new Exception(jsx3._msg("gui.win.cl", this));
    }
  };

  /**
   * Ensures that this window is at least partially visible on the computer screen.
   */
  Window_prototype.constrainToScreen = function() {
    if (this._jsxwindow != null && !this._jsxwindow.closed) {
      var w = this._jsxwindow;
      // TODO: check for partial visibility rather than just upper-left corner visibility
      if (w[Window._SCREENX] < 0 || w[Window._SCREENX] > window.screen.width 
              || w[Window._SCREENY] < 0 || w[Window._SCREENY] > window.screen.height)
        w.moveTo(0,0);
    }
  };

  /**
   * Returns the current x-coordinate screen position of this browser window relative to the parent application window.
   * If the parent window is no longer open, this method returns the position relative to the upper-left
   * corner of the screen.
   * @return {int}
   * @throws {jsx3.Exception} if the window is not open.
   */
  Window_prototype.getOffsetLeft = function() {
    if (this._jsxwindow != null && !this._jsxwindow.closed) {
      if (this._jsxopener != null && !this._jsxopener.closed)
        return this._jsxwindow[Window._SCREENX] - this._jsxopener[Window._SCREENX];
      else
        return this._jsxwindow[Window._SCREENX];
    } else {
      throw new Exception(jsx3._msg("gui.win.cl", this));
    }
  };

  /**
   * Returns the current y-coordinate screen position of this browser window relative to the parent application window.
   * If the parent window is no longer open, this method returns the position relative to the upper-left
   * corner of the screen.
   * @return {int}
   * @throws {jsx3.Exception} if the window is not open.
   */
  Window_prototype.getOffsetTop = function() {
    if (this._jsxwindow != null && !this._jsxwindow.closed) {
      if (this._jsxopener != null && !this._jsxopener.closed)
        return this._jsxwindow[Window._SCREENY] - this._jsxopener[Window._SCREENY];
      else
        return this._jsxwindow[Window._SCREENY];
    } else {
      throw new Exception(jsx3._msg("gui.win.cl", this));
    }
  };

  // event handlers
  /** @package */
  Window_prototype.onunload = function() {
    //this method is subscribed to the unload event of the parent opener. If this window is dependent it will be closed
    //when the parent opener closes
    if (this.isDependent() && this._jsxwindow && this._jsxwindow.close) {
      try {
        this._jsxwindow.close();
      } catch(e) {
      }
    }
  };

  /** @private */
  Window_prototype.onLoad = function(w) {
    if (LOG.isLoggable(Logger.DEBUG))
      LOG.debug("onLoad " + this);

    //subscribe to the unload event for the main/parent window, so the popup can be closed if it is dependent
    jsx3.gui.Event.subscribe(jsx3.gui.Event.UNLOAD, this, "onunload");

    // ensure that events that bubble up to this window eventually bubble up to the parent window
    jsx3.gui.Event._registerWindow(w);

    var doc = w.document;
    var mainWindow = w.opener;
    var body = doc.getElementsByTagName("body")[0];
    var head = doc.getElementsByTagName("head")[0];

    // copy css links to new window
    var mainDoc = this.getServer().getRootDocument();
    var links = mainDoc.getElementsByTagName("link");
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link.rel == "stylesheet") {
        var href = link.getAttribute("href");
//        if (LOG.isLoggable(Logger.TRACE))
//          LOG.trace("appending stylesheet " + href + " to window " + this);
        var element = doc.createElement("link");
        element.setAttribute("id", link.getAttribute("id"));
        element.setAttribute("href", href);
        element.setAttribute("rel", link.getAttribute("rel"));
        element.setAttribute("type", link.getAttribute("type"));
        head.appendChild(element);
      }
    }

    // paint main span
    body.innerHTML = '<span id="' + this.getRootBlock().getId() + '"></span>';
    this.getRootBlock().repaint();

    // set up code to run in the window
    // TODO: how to alias user code?
    w["jsx3"] = mainWindow.jsx3;
    
    // reset pointers to window and opener, just in case
    this._jsxwindow = w;
    this._jsxopener = mainWindow;
    this.setTitle(this.getTitle());
    
    this.publish({subject:Window.DID_OPEN});
  };

  /** @private */
  Window_prototype.onFocus = function() {
    if (LOG.isLoggable(Logger.DEBUG))
      LOG.debug("onFocus " + this);
    this.publish({subject:Window.DID_FOCUS});
  };

  /** @private */
  Window_prototype.onBeforeUnload = function() {
    if (LOG.isLoggable(Logger.DEBUG))
      LOG.debug("onBeforeUnload " + this);

    try {
      jsx3.gui.Event.unsubscribe(jsx3.gui.Event.UNLOAD, this, "onunload");
    } catch(e) {};

    if (jsx3.gui.Event._isWindowRegistered(this._jsxwindow)) {
      jsx3.gui.Event._deregisterWindow(this._jsxwindow);

      // garbage collection
      this._jsxwindow.document.onkeydown = null;
      /* @JSC */ if (!jsx3.CLASS_LOADER.IE){// IE specific code
        for (var f in this._jsxwindow) {
          try {
            if(typeof(this._jsxwindow[f]) == "function" || typeof(this._jsxwindow[f]) == "object")
              this._jsxwindow[f] = null;
          } catch (e) {}
        }
      /* @JSC */ }
      if (this._jsxopener != null && !this._jsxopener.closed)
        this._jsxopener.focus();

      this._jsxwindow = null;
      this._jsxopener = null;

      this.publish({subject:Window.WILL_CLOSE});
    }
  };

  /** @private */
  Window_prototype.onResize = function() {
    if (LOG.isLoggable(Logger.TRACE))
      LOG.trace("onResize " + this);
    this.jsxwidth = this._jsxwindow.document.body.clientWidth;
    this.jsxheight = this._jsxwindow.document.body.clientHeight;

    // update the root block element. note that the box model updates will be handled synchronously, since the browser already manages updates to an
    // external browser window in a threaded fashion, meaning additional timeout delays risk crashing the browser due to race condition
    // HACK: use delay in IE to stop CPU thrashing
    if (this._jsxresizeto != null)
      this._jsxwindow.clearTimeout(this._jsxresizeto);

    var me = this;
    /* @jsxobf-clobber */
    this._jsxresizeto = this._jsxwindow.setTimeout(function() {
      me._jsxresizeto = null;
      jsx3.gui.Painted.Queue.enableChunking(false);
      me.getRootBlock().syncBoxProfile({parentwidth:me.getWidth(), parentheight:me.getHeight()}, true);
      jsx3.gui.Painted.Queue.enableChunking(true);
    }, 250);

    this.publish({subject:Window.DID_RESIZE});
  };

  /** @private */
  Window_prototype.onParentUnload = function() {
    if (LOG.isLoggable(Logger.DEBUG))
      LOG.debug("onParentUnload");
    this.publish({subject:Window.DID_PARENT_CLOSE});
  };

  /**
   * Returns the first DOM child of this window object. If no child exists, this method creates a root block, adds it
   * to the DOM, and returns it. A window will only render its first DOM child.
   * @return {jsx3.gui.Block}
   */
  Window_prototype.getRootBlock = function() {
    var root = this.getChild(0);

    if (root == null) {
      // create root block of window
      root = new jsx3.gui.Block(this.getName() + "_JSXROOT", 0, 0, "100%", "100%", "");
      root.setDynamicProperty("jsxbgcolor", "@Solid Light");
      root.setRelativePosition(jsx3.gui.Block.ABSOLUTE);
      root.setOverflow(jsx3.gui.Block.OVERFLOWHIDDEN);
      root.setIndex(0);

      this.setChild(root);
    }

    return root;
  };

  Window_prototype.getWindow = function() {
    if (this._jsxwindow != null && !this._jsxwindow.closed)
      return this._jsxwindow;
    return null;
  };

  Window_prototype.getParentWindow = function() {
    if (this._jsxopener != null && !this._jsxopener.closed)
      return this._jsxopener;
    return null;
  };

  Window_prototype.getDocument = function() {
    if (this._jsxwindow != null && !this._jsxwindow.closed)
      return this._jsxwindow.document;
    return null;
  };

  /**
   * Returns the size of the canvas for a given child (the true drawspace).
   * @return {object} implicit map with named properties: parentwidth, parentheight
   * @package
   */
  Window_prototype.getClientDimensions = function() {
    return {parentwidth:this.getWidth(),parentheight:this.getHeight()};
  };

  /**
   * Repaints the root block of this window.
   * @return {String}
   */
  Window_prototype.repaint = function() {
    return this.getRootBlock().repaint();
  };

  // getters and setters

  /**
   * Returns the inner (visible) width of this window. This does not include the border and padding that the
   * browser may render around the window content.
   * @return {int}
   */
  Window_prototype.getWidth = function() {
    return this.jsxwidth;
  };

  /**
   * Sets the inner (visible) width of this window. If the window is currently open, the window will be resized
   * immediately.
   * @param intWidth {int} the inner width of the window in pixels.
   */
  Window_prototype.setWidth = function(intWidth) {
    if (this._jsxwindow != null && !this._jsxwindow.closed) {
      this._jsxwindow.resizeBy(intWidth - this.jsxwidth, 0);
    }
    this.jsxwidth = intWidth;
  };

  /**
   * Returns the inner (visible) height of this window. This does not include the border and padding that the
   * browser may render around the window content.
   * @return {int}
   */
  Window_prototype.getHeight = function() {
    return this.jsxheight;
  };

  /**
   * Sets the inner (visible) height of this window. If the window is currently open, the window will be resized
   * immediately.
   * @param intHeight {int} the inner height of the window in pixels.
   */
  Window_prototype.setHeight = function(intHeight) {
    if (this._jsxwindow != null && !this._jsxwindow.closed) {
      this._jsxwindow.resizeBy(0, intHeight - this.jsxheight);
    }
    this.jsxheight = intHeight;
  };

  /**
   * Returns whether this window is resizable via user interaction. The value returned by this method will reflect
   * the last value passed to <code>setResizable()</code> and therefore may not truly reflect the current state of the
   * browser window.
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>.
   */
  Window_prototype.isResizable = function() {
    return this.jsxresizable;
  };

  /**
   * Sets whether this window is resizable via user interaction. This method will not affect a currently-open window.
   * @param bResizable {boolean}
   */
  Window_prototype.setResizable = function(bResizable) {
    this.jsxresizable = jsx3.Boolean.valueOf(bResizable);
  };

  /**
   * Returns whether this window will show scroll bars if the content outgrows the window. The value returned by
   * this method will reflect the last value passed to <code>setScrollable()</code> and therefore may not truly
   * reflect the current state of the browser window.
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>.
   */
  Window_prototype.isScrollable = function() {
    return this.jsxscrollable;
  };

  /**
   * Sets whether this window will show scroll bars if the content outgrows the window. This method will not affect a
   * currently-open window.
   * @param bScrollable {boolean}
   */
  Window_prototype.setScrollable = function(bScrollable) {
    this.jsxscrollable = jsx3.Boolean.valueOf(bScrollable);
  };

  /**
   * Returns whether this window is "dependent." Dependent windows close automatically when their parents close. If
   * a window is not dependent, it will stay open after the parent window closes. Note that the parent window contains
   * all the JavaScript code and so it is very likely that interacting with a window after the parent has closed
   * will raise errors.
   * @return {int} <code>jsx3.Boolean.TRUE</code> or <code>jsx3.Boolean.FALSE</code>.
   */
  Window_prototype.isDependent = function() {
    return this.jsxdependent;
  };

  /**
   * Sets whether this window is "dependent." This method not affect a currently-open window.
   * @param bDependent {boolean}
   * @see #isDependent()
   */
  Window_prototype.setDependent = function(bDependent) {
    this.jsxdependent = jsx3.Boolean.valueOf(bDependent);
  };

  /**
   * Returns the title of this window.
   * @return {String}
   */
  Window_prototype.getTitle = function() {
    return this.jsxtitle;
  };

  /**
   * Sets the title of the window. The title is displayed in the title bar of the browser window. If the window is
   * currently open, the title will be updated immediately.
   * @param strTitle {String} the title of the window.
   */
  Window_prototype.setTitle = function(strTitle) {
    this.jsxtitle = strTitle;
    if (this._jsxwindow != null && !this._jsxwindow.closed)
      this._jsxwindow.document.title = strTitle;
  };

  /**
   * @return {String}
   */
  Window_prototype.toString = function(strTitle) {
    return this.jsxsuper() + " " + this.getName();
  };

});
