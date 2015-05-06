/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * A logging handler that can be instantiated per JSX application and displays logging messages in a separate
 * browser window while an application is running.
 * <p/>
 * This class uses the file <code>JSX/html/jsx3.app.Monitor.html</code> to display logging messages. If for
 * some reason this file cannot be loaded from this path, e.g. JSX/ is located on a different server than the
 * application launch page, you can copy the file elsewhere and use the <code>jsx_monitor_path</code> deployment
 * parameter to set the expected path of this file. 
 *
 * @since 3.1
 */
jsx3.Class.defineClass('jsx3.app.Monitor', jsx3.util.Logger.FormatHandler, null, function(Monitor, Monitor_prototype) {

  var Server = jsx3.app.Server;
  
  /** @private @jsxobf-clobber */
  Monitor._IDE_LOADED = false;
  /** @private @jsxobf-clobber */
  Monitor._URL = jsx3.net.URIResolver.DEFAULT.resolveURI(jsx3.getEnv("jsx_monitor_path") || "jsx:///html/jsx3.app.Monitor.html");
  
  /**
   * @package
   */
  Monitor.ideDidLoad = function() {
    Monitor._IDE_LOADED = true;
  };
          
  /** @private @jsxobf-clobber */
  Monitor_prototype._on = false;
  /** @private @jsxobf-clobber */
  Monitor_prototype._disableInIDE = true;
  /** @private @jsxobf-clobber */
  Monitor_prototype._serverNamespace = null;
  /** @private @jsxobf-clobber */
  Monitor_prototype._activateOnHotKey = false;
  /** @private @jsxobf-clobber */
  Monitor_prototype._server = null;
  /** @private @jsxobf-clobber */
  Monitor_prototype._window = null;

  /**
   * The instance initializer.
   * @param strName {String}
   */
  Monitor_prototype.init = function(strName) {
    this.jsxsuper(strName);
  };

  Monitor_prototype.onAfterInit = function() {
    if (this._serverNamespace != null) {
      var app = null;
      if (jsx3.Class.forName("jsx3.lang.System"))
        app = jsx3.System.getApp(this._serverNamespace);

      if (app != null) {
        this._initServer(app);
      } else {
        // register for when servers are created so we know if "our" server is created
        Server.subscribe(Server.INITED, this, "serverDidLoad");
      }
    } else {
      this._disableInIDE = false;
      this._activateOnHotKey = false;
      this._on = true;
      this._openWindow();
    }
  };
  
  /** @private @jsxobf-clobber */
  Monitor_prototype._initServer = function(objServer) {
    this._on = true;
    this._server = objServer;
    
    if (this._activateOnHotKey) {
      // register for ctrl+alt+m if we only activate on hot key
      var me = this;
      objServer.registerHotKey(function(objEvent){ me.onHotKey(); }, "m", false, true, true);
    } else {
      this._openWindow();
    }
  };
  
  /** @private @jsxobf-clobber */
  Monitor_prototype.serverDidLoad = function(objEvent) {
    var objServer = objEvent.target;

    if (objServer.getEnv("namespace") == this._serverNamespace) {
      if (!Monitor._IDE_LOADED || !this._disableInIDE)
        this._initServer(objServer);
      
      // unsubscribe: only one server per monitor is allowed
      Server.unsubscribe(Server.INITED, this);
    }
  };

  /**
   * Writes the formatted logging message to a separate browser window if all relevant conditions are met.
   * @param objRecord {jsx3.util.Logger.Record}
   */
  Monitor_prototype.handle = function(objRecord) {
    if (this._on && (!Monitor._IDE_LOADED || !this._disableInIDE)) {
      var w = this._window;

      if (w) {
        if (w.closed) {
          if (!this._activateOnHotKey)
            this._openWindow();
        }

        try {
          if (!w.closed && w.appendMessage) {
            // When first opening the app monitor, push all in-memory records to the output...
            if (w.isFirstTime()) {
              var manager = jsx3.util.Logger.Manager.getManager();
              var memoryHandler = manager.getHandler("memory");
              if (memoryHandler) {
                jsx3.$A(memoryHandler.getRecords()).each(jsx3.$F(function(e) {
                  if (e !== objRecord)
                    w.appendMessage(this.format(e), jsx3.util.Logger.levelAsString(e.getLevel()));
                }).bind(this));
              }
            }

            w.appendMessage(this.format(objRecord), jsx3.util.Logger.levelAsString(objRecord.getLevel()));
          }
        } catch (e) {}
      }
    }
  };
  
  /** @private @jsxobf-clobber */
  Monitor_prototype.onHotKey = function() {
    if (this._window == null || this._window.closed)
      this._openWindow();
  };
  
  /** @private @jsxobf-clobber */
  Monitor_prototype._openWindow = function() {
    this._window = window.open(Monitor._URL, "Monitor_" + this.getName(),
          "directories=no," + 
          "location=no," + 
          "menubar=no," + 
          "status=yes," + 
          "personalbar=no," + 
          "titlebar=yes," + 
          "toolbar=no," +
          "resizable=yes," +
          "scrollbars=no," + 
          "width=500," + 
          "height=400");

    if (this._window) {
      if (this._server) {
        if (typeof(this._window.setName) == "function")
          this._window.setName(this._server.getEnv('namespace'));
        else
          this._window._jsxname = this._server.getEnv('namespace');
      }

      window.focus();
    }
  };
  
  /**
   * Returns whether this monitor is disabled when its application is running inside the IDE.
   * @return {boolean}
   */
  Monitor_prototype.getDisableInIDE = function() {
    return this._disableInIDE;
  };
  
  /**
   * Sets whether this monitor is disabled when its application is running inside the IDE.
   * @param disableInIDE {boolean}
   */
  Monitor_prototype.setDisableInIDE = function(disableInIDE) {
    this._disableInIDE = disableInIDE;
  };
  
  /**
   * Returns the server namespace of this monitor. When an application is created with a namespace equal to this value
   * that application is attached to this monitor and the monitor becomes live.
   * @return {String}
   */
  Monitor_prototype.getServerNamespace = function() {
    return this._serverNamespace;
  };
  
  /**
   * Sets the server namespace of this monitor.
   * @param serverNamespace {String}
   */
  Monitor_prototype.setServerNamespace = function(serverNamespace) {
    this._serverNamespace = serverNamespace;
  };
  
  /**
   * Returns whether this monitor remains invisible until the user types the hotkey <code>ctrl+alt+m</code> in the attached
   * application. If <code>false</code> this monitor will appear when the application is loaded and anytime the 
   * monitor is closed and a logging message is received.
   * @return {boolean}
   */
  Monitor_prototype.getActivateOnHotKey = function() {
    return this._activateOnHotKey;
  };
  
  /**
   * Sets whether this monitor waits for the hotkey <code>ctrl+alt+m</code> before becoming visible.
   * @param activateOnHotKey {boolean}
   */
  Monitor_prototype.setActivateOnHotKey = function(activateOnHotKey) {
    this._activateOnHotKey = activateOnHotKey;
  };
  
});

jsx3.util.Logger.Handler.registerHandlerClass(jsx3.app.Monitor.jsxclass);
