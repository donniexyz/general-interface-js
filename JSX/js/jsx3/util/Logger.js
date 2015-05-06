/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * A Logger is used to log messages about a particular component of an application. 
 * <p/>
 * Loggers are organized hierarchically according to name, descending from the root logger, "global." A period 
 * denotes levels in the hierarchy. For example, <code>global</code> is the parent of <code>com</code> is the parent 
 * of <code>com.tibco</code> is the parent of <code>com.tibco.gi</code>, etc. 
 * <p/>
 * A Logger has a level that determines what severity of messages will be handled. Messages with severity below the
 * level of the Logger will be ignored. If the level of a Logger is not explicitly defined, the level is inherited
 * from its parent.
 * <p/>
 * A Logger can have any number of handlers, each of which can output a log message to a different place. By default
 * a logger will also forward log messages to the handlers of its ancestors, although this can be disabled per Logger.
 * <p/>
 * A typical usage pattern is to create a Logger for each class, setting it as a private static field of that class, 
 * as in the following code example:
 * <pre>
 * jsx3.Class.defineClass('eg.Thing', null, null, function(Thing, Thing_prototype) {
 *   
 *   // import jsx3.util.Logger
 *   var Logger = jsx3.util.Logger;
 *
 *   // create Logger for this class
 *   Thing._LOG = Logger.getLogger(Thing.jsxclass.getName());
 *
 *   Thing.prototype.init = function(arg1, arg2, arg2) {
 *     Thing._LOG.debug("received args: " + arg1 + ", " + arg2 + ", " + arg3);
 *
 *     if (isNaN(arg1)) {
 *       Thing._LOG.warn("arg1 is not a number, setting to 0");
 *       this._one = 0;
 *     } else {
 *       this._one = arg1;
 *     }
 *   };
 * });
 * </pre>
 * If the creation of the log message is expensive (depending on the implementation, 
 * <code>toString()</code> can be expensive), <code>isLoggable()</code> can be used to check whether the log
 * statement will actually be handled before creating the log message:
 * <pre>
 * if (LOG.isLoggable(jsx3.util.Logger.INFO))
 *   LOG.info(anObject.toString());
 * </pre>
 *
 * @since 3.1
 */
jsx3.Class.defineClass('jsx3.util.Logger', null, null, function(Logger, Logger_prototype) {
  
  var Method = jsx3.Method;
  var Exception = jsx3.Exception;
  
  /**
   * {int} Set the level of a Logger or Handler to this value to ignore all messages.
   * @final @jsxobf-final
   */
  Logger.OFF = 0;
  
  /**
   * {int} Level indicating fatal error.
   * @final @jsxobf-final
   */
  Logger.FATAL = 1;
  
  /**
   * {int} Level indicating error.
   * @final @jsxobf-final
   */
  Logger.ERROR = 2;
  
  /**
   * {int} Level indicating warning.
   * @final @jsxobf-final
   */
  Logger.WARN = 3;
  
  /**
   * {int} Level indicating informational message.
   * @final @jsxobf-final
   */
  Logger.INFO = 4;
  
  /**
   * {int} Level indicating debug message.
   * @final @jsxobf-final
   */
  Logger.DEBUG = 5;
  
  /**
   * {int} Level indicating trace message.
   * @final @jsxobf-final
   */
  Logger.TRACE = 6;

  /** @private @jsxobf-clobber */
  Logger.MAX_LEVEL = Logger.FATAL;
  /** @private @jsxobf-clobber */
  Logger.MIN_LEVEL = Logger.TRACE;
  
  /**
   * {jsx3.util.Logger} Convenient access to <code>jsx3.util.Logger.getLogger('global')</code>.
   */
  Logger.GLOBAL = null;
  
  /**
   * Returns an Logger instance. Either creates a new logger or returns a pre-existing logger of the same name.
   * This class is a factory class so instances of Logger may not be instantiated
   * directly. Use this method to get a handle to a logger.
   *
   * @param strName {String} the name of the logger to return
   * @return {jsx3.util.Logger}
   */
  Logger.getLogger = function(strName) {
    var manager = Logger.Manager.getManager();
    if (manager == null) return null;

    var logger = manager.getLogger(strName);
    if (logger == null) {
      logger = new Logger(strName);
      manager.addLogger(logger);
    }
    return logger;
  };
  
  /** @private @jsxobf-clobber */
  Logger._LEVELS = [null, "FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];
  
  /**
   * Returns the string (English) representation of a level value.
   *
   * @param intLevel {int} a level value between FATAL and TRACE
   * @return {String} a string representation of the level value
   */
  Logger.levelAsString = function(intLevel) {
    return Logger._LEVELS[intLevel] || "";
  };
  
  /** @private @jsxobf-clobber */
  Logger_prototype._name = null;
  /** @private @jsxobf-clobber */
  Logger_prototype._handlers = null;
  /** @private @jsxobf-clobber */
  Logger_prototype._mylevel = null;
  /** @private @jsxobf-clobber */
  Logger_prototype._level = Logger.INFO;
  /** @private @jsxobf-clobber */
  Logger_prototype._parent = null;
  /** @private @jsxobf-clobber */
  Logger_prototype._useParent = true;
  /** @private @jsxobf-clobber */
  Logger_prototype._children = null;
  
  /**
   * @private
   */
  Logger_prototype.init = function(strName) {
    this._name = strName;
  };
  
  // bean methods
  
  /**
   * Returns the name of this Logger.
   * @return {String}
   */
  Logger_prototype.getName = function() {
    return this._name;
  };
  
  /**
   * Add a handler to this Logger.
   * @param objHandler {jsx3.util.Logger.Handler}
   */
  Logger_prototype.addHandler = function(objHandler) {
    if (!this._handlers)
      this._handlers = jsx3.$A();
    this._handlers.push(objHandler);
  };
  
  /**
   * Remove a handler from this Logger.
   * @param objHandler {jsx3.util.Logger.Handler}
   */
  Logger_prototype.removeHandler = function(objHandler) {
    if (this._handlers)
      this._handlers.remove(objHandler);
  };

  /**
   * Returns the level of this Logger. This method will return null unless the level of this Logger has been
   * explicitly set either in the configuration file or with a call to setLevel().
   * @return {int}
   */
  Logger_prototype.getLevel = function() {
    return this._mylevel;
  };
  
  /**
   * Returns the effective level of this Logger, which is either the explicitly set value of this Logger or the 
   * effective level of this Logger's parent Logger. 
   * @return {int}
   */
  Logger_prototype.getEffectiveLevel = function() {
    return this._level;
  };
  
  /**
   * Sets the level of this Logger.
   * @param intLevel {int}
   */
  Logger_prototype.setLevel = function(intLevel) {
    intLevel = Math.max(Logger.OFF, Math.min(Logger.MIN_LEVEL, intLevel));
    this._mylevel = intLevel;
    this._updateLevel();
  };

  /** @private @jsxobf-clobber */
  Logger_prototype._updateLevel = function() {
    var newValue = null;
    
    if (this._mylevel != null) {
      newValue = this._mylevel;
    } else if (this._parent != null) {
      newValue = this._parent._level;
    } else {
      newValue = Logger_prototype._level;
    }
    
    if (newValue != this._level) {
      this._level = newValue;
      if (this._children) {
        for (var i = 0; i < this._children.length; i++)
          this._children[i]._updateLevel();
      }
    }
  };
  
  /**
   * Returns the parent Logger of this Logger. The global logger will return null from this method.
   * @return {jsx3.util.Logger}
   */
  Logger_prototype.getParent = function() {
    return this._parent;
  };
  
  /**
   * Sets the parent Logger of this Logger.
   * @param objParent {jsx3.util.Logger}
   */
  Logger_prototype.setParent = function(objParent) {
    // remove from old parent's children
    if (this._parent != null)
      this._parent._children.remove(this);
    
    this._parent = objParent;
    // add to new parent's children
    if (this._parent != null) {
      if (!this._parent._children)
        this._parent._children = jsx3.$A();
      this._parent._children.push(this);
    }
    
    this._updateLevel();
  };
  
  /**
   * Returns whether this Logger will publish log messages to the handlers of its parent Logger.
   * @return {boolean}
   */
  Logger_prototype.getUseParentHandlers = function() {
    return this._useParent;
  };
  
  /**
   * Sets whether this Logger will publish log messages to the handlers of its parent Logger.
   * @param bUseParent {boolean}
   */
  Logger_prototype.setUseParentHandlers = function(bUseParent) {
    this._useParent = bUseParent;
  };
    
  // log methods

  /** @private @jsxobf-clobber */
  Logger_prototype._dispatch = function(objRecord) {
    var logger = this;
    var recordLevel = objRecord.getLevel();
    
    while (logger) {
      var handlers = logger._handlers;
      if (handlers) {
        for (var i = 0; i < handlers.length; i++) {
          // check handler level here instead of in Handler.handle() method
          var handler = handlers[i];
          if (handler.isLoggable(recordLevel)) {
            try {
              handler.handle(objRecord);
            } catch (e) {
              e = jsx3.NativeError.wrap(e);
              Logger.getLogger(Logger.jsxclass.getName()).error(jsx3._msg("logr.err_hand", handler.getName(), e), e);
            }
          }
        }
      }
      
      if (! logger.getUseParentHandlers())
        break;
      logger = logger.getParent();
    }
  };
  
  /**
   * Log a message.
   * @param intLevel {int} the level of the message
   * @param strMessage {String} the message to log
   * @param strArgs {Array<String> | String...} either an array of or variable argument message parameters, optional argument
   */
  Logger_prototype.log = function(intLevel, strMessage, strArgs) {
    intLevel = Math.max(intLevel, Logger.MAX_LEVEL);
    if (this._level < intLevel) return;
    
    var arrParams = jsx3.$A.is(strArgs) ? strArgs : Method.argsAsArray(arguments, 2);
    var record = new Logger.Record(strMessage, arrParams, intLevel, this.getName(), jsx3.lang.getCaller(1), null);
    this._dispatch(record);
  };
  
  /**
   * Log an exception.
   * @param intLevel {int} the level of the message
   * @param strMessage {String} the message to log with the exception, may be null
   * @param objError {jsx3.Exception} the exception to log 
   */
  Logger_prototype.logError = function(intLevel, strMessage, objError) {
    intLevel = Math.max(intLevel, Logger.MAX_LEVEL);
    if (this._level < intLevel) return;

    var record = new Logger.Record(strMessage, null, intLevel, this.getName(), jsx3.lang.getCaller(1), objError);
    this._dispatch(record);
  };
  
  /**
   * Log the current stack with a message.
   * @param intLevel {int} the level of the message
   * @param strMessage {String} the message to log, optional argument
   * @param-package intSkip {int}
   */
  Logger_prototype.logStack = function(intLevel, strMessage, intSkip) {
    intLevel = Math.max(intLevel, Logger.MAX_LEVEL);
    if (this._level < intLevel) return;
    
    var record = new Logger.Record(strMessage, null, intLevel, this.getName(), 
        jsx3.lang.getStack(intSkip != null ? intSkip : 0), null);
    this._dispatch(record);
  };
  
  /**
   * Returns true if a log message sent to this logger at level <code>intLevel</code> will be forwarded on to the
   * handlers of this logger.
   * @param intLevel {int} the level to test
   * @return {boolean}
   */
  Logger_prototype.isLoggable = function(intLevel) {
    intLevel = Math.max(intLevel, Logger.MAX_LEVEL);
    return this._level >= intLevel;
  };
  
  /**
   * Log a message at level FATAL. Polymorphic method honors the signature of either <code>log()</code> or 
   * <code>logError()</code> (without the first <code>intLevel</code> parameter).
   * @param strMessage {String} the message to log
   * @param strArgs {Array<String> | String... | jsx3.Exception} either an array of message parameters, variable 
   *   argument message parameters, or an exception; optional argument
   */
  Logger_prototype.fatal = function(strMessage, strArgs) {
    if (strArgs == null || jsx3.$A.is(strArgs))
      this.log(Logger.FATAL, strMessage, strArgs);
    else if (strArgs instanceof Exception)
      this.logError(Logger.FATAL, strMessage, strArgs);
    else if (this._level >= Logger.FATAL)
      this.log(Logger.FATAL, strMessage, Method.argsAsArray(arguments, 1));
  };
  
  /**
   * Log a message at level ERROR. Polymorphic method honors the signature of either <code>log()</code> or
   * <code>logError()</code> (without the first <code>intLevel</code> parameter).
   * @param strMessage {String} the message to log
   * @param strArgs {Array<String> | String... | jsx3.Exception} either an array of message parameters, variable
   *   argument message parameters, or an exception; optional argument
   */
  Logger_prototype.error = function(strMessage, strArgs) {
    if (strArgs == null || jsx3.$A.is(strArgs))
      this.log(Logger.ERROR, strMessage, strArgs);
    else if (strArgs instanceof Exception)
      this.logError(Logger.ERROR, strMessage, strArgs);
    else if (this._level >= Logger.ERROR)
      this.log(Logger.ERROR, strMessage, Method.argsAsArray(arguments, 1));
  };
  
  /**
   * Log a message at level WARN. Polymorphic method honors the signature of either <code>log()</code> or
   * <code>logError()</code> (without the first <code>intLevel</code> parameter).
   * @param strMessage {String} the message to log
   * @param strArgs {Array<String> | String... | jsx3.Exception} either an array of message parameters, variable
   *   argument message parameters, or an exception; optional argument
   */
  Logger_prototype.warn = function(strMessage, strArgs) {
    if (strArgs == null || jsx3.$A.is(strArgs))
      this.log(Logger.WARN, strMessage, strArgs);
    else if (strArgs instanceof Exception)
      this.logError(Logger.WARN, strMessage, strArgs);
    else if (this._level >= Logger.WARN)
      this.log(Logger.WARN, strMessage, Method.argsAsArray(arguments, 1));
  };
  
  /**
   * Log a message at level INFO. Polymorphic method honors the signature of either <code>log()</code> or
   * <code>logError()</code> (without the first <code>intLevel</code> parameter).
   * @param strMessage {String} the message to log
   * @param strArgs {Array<String> | String... | jsx3.Exception} either an array of message parameters, variable
   *   argument message parameters, or an exception; optional argument
   */
  Logger_prototype.info = function(strMessage, strArgs) {
    if (strArgs == null || jsx3.$A.is(strArgs))
      this.log(Logger.INFO, strMessage, strArgs);
    else if (strArgs instanceof Exception)
      this.logError(Logger.INFO, strMessage, strArgs);
    else if (this._level >= Logger.INFO)
      this.log(Logger.INFO, strMessage, Method.argsAsArray(arguments, 1));
  };
  
  /**
   * Log a message at level DEBUG. Polymorphic method honors the signature of either <code>log()</code> or
   * <code>logError()</code> (without the first <code>intLevel</code> parameter).
   * @param strMessage {String} the message to log
   * @param strArgs {Array<String> | String... | jsx3.Exception} either an array of message parameters, variable
   *   argument message parameters, or an exception; optional argument
   */
  Logger_prototype.debug = function(strMessage, strArgs) {
    if (strArgs == null || jsx3.$A.is(strArgs))
      this.log(Logger.DEBUG, strMessage, strArgs);
    else if (strArgs instanceof Exception)
      this.logError(Logger.DEBUG, strMessage, strArgs);
    else if (this._level >= Logger.DEBUG)
      this.log(Logger.DEBUG, strMessage, Method.argsAsArray(arguments, 1));
  };
  
  /**
   * Log a message at level TRACE. Polymorphic method honors the signature of either <code>log()</code> or
   * <code>logError()</code> (without the first <code>intLevel</code> parameter).
   * @param strMessage {String} the message to log
   * @param strArgs {Array<String> | String... | jsx3.Exception} either an array of message parameters, variable
   *   argument message parameters, or an exception; optional argument
   */
  Logger_prototype.trace = function(strMessage, strArgs) {
    if (strArgs == null || jsx3.$A.is(strArgs))
      this.log(Logger.TRACE, strMessage, strArgs);
    else if (strArgs instanceof Exception)
      this.logError(Logger.TRACE, strMessage, strArgs);
    else if (this._level >= Logger.TRACE)
      this.log(Logger.TRACE, strMessage, Method.argsAsArray(arguments, 1));
  };

  Logger_prototype.toString = function() {
    return this.jsxsuper() + " " + this.getName();
  };
 
/* @JSC :: begin DEP */

  // DEPRECATED: remove later

  /**
   * Resets the system out; publishes event to the jsx3.util.Logger.ON_MESSAGE subject.
   * @deprecated no effect
   */
  Logger.reset = function() {
  };

  /**
   * <span style="text-decoration:line-through;">
   * Called by several foundation classes when non-critical errors occur. Basically allows the error to be saved to
   * memory and be queried by the application developer for more-specific information about why a given request may
   * have failed.</span> Sends a log message to the global Logger. Attempts to convert the <code>PRIORITY</code>
   * argument to a valid value for Logger, defaults to INFO.
   *
   * @param strErrorNumber {String} arbitrary identifier passed by the calling function to track the specific location of the error
   * @param strMessage {String} message to describe the error
   * @param PRIORITY {int} one of 1, 2 or 3, with 1 being most serious (red..orange..yellow)
   * @param bTrace {boolean} true if null; if true, the stack trace is printed, displaying the order of the call stack
   * @deprecated  use either <code>jsx3.log</code> or <code>Logger.log()</code>
   * @see jsx3#log()
   * @see #log()
   */
  Logger.doLog = function(strErrorNumber, strMessage, PRIORITY, bTrace) {
    //if no priority is set, make this a low priority
    if (PRIORITY == null) PRIORITY = Logger.INFO;
    else if (PRIORITY < Logger.INFO) PRIORITY = Logger.INFO;
    else PRIORITY = Logger.DEBUG;

    // QUESTION: should we somehow notify that the message has not gone to out?
    if (Logger.GLOBAL) {
      var message = strMessage != null ? "(" + strErrorNumber + ") " + strMessage : strErrorNumber;
      if (bTrace || bTrace == null)
        Logger.GLOBAL.logStack(PRIORITY, message, 1);
      else
        Logger.GLOBAL.log(PRIORITY, message);
    }
  };

  /**
   * Log all properties of an exception to the system log.
   * @param e {object} the exception object to log
   * @param PRIORITY {int} priority of error
   * @deprecated  use instance method <code>Logger.logError()</code>
   */
  Logger.logError = function(e, PRIORITY) {
    var message = "";
    for (var f in e) {
      if (message) message += " ";
      message += f + ":" + e[f];
    }
    Logger.doLog("ERRO01", message, PRIORITY, false);
  };

  /**
   * No errors will be published with priority level less than (integer greater than) this value.
   * @deprecated  use <code>Logger.isLoggable()</code>
   */
  Logger.getMinPriority = function() {
    return 3;
  };

  /**
   * returns the JavaScript Array containing all non-fatal app errors trapped by various foundation classes;
   *            as a developer, you can access a specific error by simply referencing its ordinal index.  This will give
   *            you a handle to the individual error object (a JavaScript object).  You can then query this object for
   *            a specific property, including:  code, description, priority, timestamp.
   *            So, for example, to get the timestamp for the oldest error in the log you would call:   jsx3.util.Logger.getLog[0]["timestamp"]
   * @return {Object} JavaScript Array
   * @deprecated  returns an empty array
   */
  Logger.getLog = function() {
    return [];
  };

  /**
   * returns a text-based version of the error log object.  This is helpful when debugging a JSX application that
   *            doesn't fully initialize. In practice, if you are viewing a web page with an embedded JSX application,
   *            you can type (ctrl + o) to show the browser's 'open' dialog.  From there, enter the following bit of Javascript
   *            to call this function:  javascript:alert(jsx3.util.Logger.toString());
   * @return {String}
   * @deprecated
   */
  Logger.errorToString = function(error) {
    var s = "";
    s+= "TIME: " + new Date(error.timestamp) + "\n";
    s+= "CODE: " + error.code + "\n";
    s+= "DESC: " + error.description + "\n";
    return s;
  };

  /**
   * returns a text-based version of the error log object.  This is helpful when debugging a JSX application that
   *            doesn't fully initialize. In practice, if you are viewing a web page with an embedded JSX application,
   *            you can type (ctrl + o) to show the browser's 'open' dialog.  From there, enter the following bit of Javascript
   *            to call this function:  javascript:alert(jsx3.util.Logger.toString());
   * @return {Object} JavaScript Array
   * @deprecated  Returns empty string.
   */
  Logger.toString = function() {
    return "";
  };

/* @JSC :: end */
  
});

/**
 * Manager class for the logging system. The singleton instance of this class is configured with the logger 
 * configuration file specified by the system environment variable <code>jsx_logger_config</code>, 
 * or if that is not provided, by the default configuration file located at <code>$GI/logger.xml</code>. 
 * <p/>
 * The DTD of that configuration file is as follows:
 * <pre>
 * &lt;!ELEMENT configuration (handler | logger)* &gt;
 * &lt;!ELEMENT handler (property)* &gt;
 * &lt;!ATTLIST handler name CDATA #REQUIRED
 *                   class CDATA #REQUIRED
 *                   lazy (true|false) "false"
 *                   require (true|false) "false"
 *                   level (OFF|FATAL|ERROR|WARN|INFO|DEBUG|TRACE) #IMPLIED&gt;
 * &lt;!ELEMENT logger (property | handler-ref)* &gt;
 * &lt;!ATTLIST logger name CDATA #REQUIRED
 *                  useParent (true|false) "true"
 *                  level (OFF|FATAL|ERROR|WARN|INFO|DEBUG|TRACE) #IMPLIED&gt;
 * &lt;!-- Properties allow for bean-style configuration of handlers and loggers.
 *      The class should have a setter method corresponding to the name of the 
 *      property. --&gt;
 * &lt;!ELEMENT property (EMPTY)&gt;
 * &lt;!ATTLIST property name CDATA #REQUIRED
 *                    value CDATA #REQUIRED
 *                    eval (true|false) "false"&gt;
 * &lt;!ELEMENT handler-ref (EMPTY)&gt;
 * &lt;!ATTLIST handler-ref name CDATA #REQUIRED&gt;
 * </pre>
 */
jsx3.Class.defineClass('jsx3.util.Logger.Manager', null, null, function(Manager, Manager_prototype) {

  var Exception = jsx3.Exception;
  var Logger = jsx3.util.Logger;
  
  /** @private @jsxobf-clobber */
  Manager.DEFAULT_CONFIG_FILE = "jsx:/../logger.xml";
  /** @private @jsxobf-clobber */
  Manager.ROOT_KEY = "global";
  /** @private @jsxobf-clobber */
  Manager.INSTANCE = null;
  /** @private @jsxobf-clobber @jsxobf-final */
  Manager.LAZY_HANDLER = -1;
  /** @private @jsxobf-clobber */
  Manager.DEFAULT_CONFIG = '<configuration><handler name="console" class="jsx3.util.Logger.ConsoleHandler"/><logger name="global" level="INFO"><handler-ref name="console"/></logger></configuration>';

  /**
   * @param objXML {boolean|jsx3.xml.Document} the logger configuration document. If not provided, the document is loaded
   *    from the expected location. If false, then the default logger configuration is loaded without requesting
   *    the configuration file.
   * @package
   */
  Manager_prototype.initialize = function(objXML) {
    if (objXML === false) {
    } else if (!objXML) {
      var env = jsx3.getEnv("jsx_logger_config");
      if (env == null)
        env = Manager.DEFAULT_CONFIG_FILE;

      if (env)
        objXML = new jsx3.xml.Document().load(env);
    }

    // check error, causes a window.alert() but lets the program continue
    if (objXML && objXML.hasError()) {
      window.alert(jsx3._msg("logr.err_conf", objXML.getError(), jsx3.resolveURI(objXML.getSourceURL())));
      objXML = null;
    }

    if (!objXML)
      objXML = new jsx3.xml.Document().loadXML(Manager.DEFAULT_CONFIG);

    this._config = objXML;

    this._initHandlers();

    for (var f in this._loggers)
      this.addLogger(this._loggers[f]);
  };
  
  /**
   * Singleton accessor method.
   * @return {jsx3.util.Logger.Manager}
   */
  Manager.getManager = function() {
    if (Manager.INSTANCE == null) {
      Manager.INSTANCE = new Manager();
      Logger.GLOBAL = new Logger(Manager.ROOT_KEY);
      Manager.INSTANCE.addLogger(Logger.GLOBAL);
    }
    return Manager.INSTANCE;
  };
  
  /** @private @jsxobf-clobber */
  Manager_prototype._config = null;
  /** @private @jsxobf-clobber */
  Manager_prototype._loggers = null;
  /** @private @jsxobf-clobber */
  Manager_prototype._handlers = null;
  
  /**
   * @private
   */
  Manager_prototype.init = function(objXML) {
    this._loggers = {};
    this._handlers = {};
  };

  /** @private @jsxobf-clobber */
  Manager_prototype._handlerClassDidLoad = function(objClass) {
    var loaded = this._initHandlers("[@lazy='true' and @class='" + objClass.getName() + "']");
    this._wireNewHandlers(loaded);
  };

  /** @private @jsxobf-clobber */
  Manager_prototype._wireNewHandlers = function(handlerNames) {
    for (var i = 0; i < handlerNames.length; i++) {
      var handlerName = handlerNames[i];
      var handler = this.getHandler(handlerName);

      var j = this._config.selectNodeIterator("/configuration/logger[handler-ref/@name='" + handlerName + "']");
      while (j.hasNext()) {
        var node = j.next();
        var loggerName = node.getAttribute('name');
        var logger = this.getLogger(loggerName);
        if (logger != null) {
          logger.addHandler(handler);
        }
      }
    }
  };
 
  /** @private @jsxobf-clobber */
  Manager_prototype._initHandlers = function(strClause) {
    var initedNames = [];
    if (! this._config) return initedNames;

    var i = this._config.selectNodeIterator("/configuration/handler" + (strClause != null ? strClause : ""));

    var bNeedsJob = this._classesToLoad == null;

    while (i.hasNext()) {
      var node = i.next();
      var strName = node.getAttribute("name");
      if (this.getHandler(strName) != null) continue;
      
      var strClass = node.getAttribute("class");
      var bLazy = node.getAttribute("lazy") == "true";
      var bRequire = node.getAttribute("require") == "true";
      
      var objClass = jsx3.Class.forName(strClass);
      if (objClass == null && bRequire) {
        if (this._classesToLoad == null) {
          /* @jsxobf-clobber */
          this._classesToLoad = [];
        }
        this._classesToLoad.push(strClass);
        this._handlers[strName] = Manager.LAZY_HANDLER;
        continue;
      }
      
      if (objClass) {
        var handler = objClass.newInstance(strName);
        this._initBean(handler, node);
        handler.onAfterInit();
        
        var strLevel = node.getAttribute('level');
        if (strLevel && typeof(Logger[strLevel]) == "number")
          handler.setLevel(Logger[strLevel]);
        
        this.addHandler(handler);
        initedNames[initedNames.length] = strName;
      } else if (!bLazy && !bRequire) {
        window.alert(jsx3._msg("logr.no_class", strClass));
      } else {
        this._handlers[strName] = Manager.LAZY_HANDLER;
      }
    }

    if (bNeedsJob && this._classesToLoad != null) {
      var me = this;
      var job = new jsx3.util.Job("logger.require");
      job.run = function() {
        // make this asynchronous to prevent race conditions from causing double-registration of required handlers
        jsx3.sleep(function() {this._onClassLoaderRest();}, null, me);
      };
      jsx3.CLASS_LOADER.addJob(job, "jsx.js");
    }
    
    return initedNames;
  };
  
  /** @private @jsxobf-clobber */
  Manager_prototype._onClassLoaderRest = function(objEvent) {
    jsx3.requireAsync.apply(jsx3, this._classesToLoad).when(jsx3.$F(function() {
      delete this._classesToLoad;

      var loaded = this._initHandlers("[@require='true']");
      this._wireNewHandlers(loaded);
    }).bind(this));    
  };
  
  /** @private @jsxobf-clobber */
  Manager_prototype._initBean = function(obj, objNode) {
    var objClass = obj.getClass();

    for (var i = objNode.selectNodeIterator("./property"); i.hasNext(); ) {
      var child = i.next();

      var strName = child.getAttribute("name");
      var strValue = child.getAttribute("value");
      var bEval = child.getAttribute("eval") == "true";

      var objSetter = objClass.getSetter(strName);
      if (objSetter != null) {
        if (bEval) {
          try {
            strValue = isNaN(strValue) ? obj.eval(strValue) : Number(strValue);
          } catch (e) {
            throw new Exception(jsx3._msg("logr.bn_eval", strName, strValue, obj), jsx3.NativeError.wrap(e));
          }
        }
        objSetter.apply(obj, [strValue]);
      } else {
        throw new Exception(jsx3._msg("logr.bn_setr", strName, objClass));
      }
    }
  };
  
  /**
   * Add a Logger instance to the manager's registry.
   * @param objLogger {jsx3.util.Logger}
   */  
  Manager_prototype.addLogger = function(objLogger) {
    var strName = objLogger.getName();
    this._loggers[strName] = objLogger;

    if (this._config) {
      var loggerNode = this._config.selectSingleNode("/configuration/logger[@name='" + strName + "']");

      // configure new logger from its own node
      if (loggerNode != null) {
        var strLevel = loggerNode.getAttribute('level');
        if (strLevel && typeof(Logger[strLevel]) == "number")
          objLogger.setLevel(Logger[strLevel]);

        var bUseParent = loggerNode.getAttribute('useParent') != "false";
        objLogger.setUseParentHandlers(bUseParent);

        var i = loggerNode.selectNodeIterator("./handler-ref");
        while (i.hasNext()) {
          var handlerNode = i.next();
          var strId = handlerNode.getAttribute('name');
          var handler = this.getHandler(strId);
          if (handler != null) {
            objLogger.addHandler(handler);
          } else if (this._handlers[strId] != Manager.LAZY_HANDLER) {
            throw new Exception(jsx3._msg("logr.no_hand", strName, strId));
          }
        }

        this._initBean(objLogger, loggerNode);
      }
    }
    
    // find its parent
    if (strName != Manager.ROOT_KEY) {
      var index = strName.lastIndexOf(".");
      var parentName = index >= 0 ? strName.substring(0, index) : Manager.ROOT_KEY;
      // recursive call to create the parent
      objLogger.setParent(Logger.getLogger(parentName));
    }
    
    // no need to find children among existing loggers, because parents are always initialized with children
  };
  
  /**
   * Add a Handler instance to this manager's registry.
   * @param objHandler {jsx3.util.Logger.Handler}
   */
  Manager_prototype.addHandler = function(objHandler) {
    this._handlers[objHandler.getName()] = objHandler;
  };

  /**
   * Returns a Logger from this manager's registry by name, or null if no such Logger is registered.
   * @return {jsx3.util.Logger}
   */
  Manager_prototype.getLogger = function(strName) {
    return this._loggers[strName];
  };
  
  /**
   * Returns a Handler from the manager's registry by name, or null if no such Handler is registered.
   * @return {jsx3.util.Logger.Handler}
   */
  Manager_prototype.getHandler = function(strName) {
    var handler = this._handlers[strName];
    return handler == Manager.LAZY_HANDLER ? null : handler;
  };
  
  /**
   * Returns a list containing the names of all the handlers registered with this manager.
   * @return {Array<String>}
   */
  Manager_prototype.getHandlerNames = function() {
    var keys = [];
    for (var f in this._handlers)
      keys[keys.length] = f;
    return keys;
  };
  
});

/**
 * Record bean that stores information about a logging message.
 */
jsx3.Class.defineClass('jsx3.util.Logger.Record', null, null, function(Record, Record_prototype) {

  /** @private @jsxobf-clobber */
  Record.SERIAL = 1;
  
  /** @private @jsxobf-clobber */
  Record_prototype._serial = null;
  /** @private @jsxobf-clobber */
  Record_prototype._date = null;
  /** @private @jsxobf-clobber */
  Record_prototype._message = null;
  /** @private @jsxobf-clobber */
  Record_prototype._params = null;
  /** @private @jsxobf-clobber */
  Record_prototype._level = null;
  /** @private @jsxobf-clobber */
  Record_prototype._logger = null;
  /** @private @jsxobf-clobber */
  Record_prototype._stack = null;
  /** @private @jsxobf-clobber */
  Record_prototype._error = null;

  /**
   * Instance initializer.
   * @param strMessage {String}
   * @param arrParams {Array<Object>}
   * @param intLevel {int}
   * @param strLogger {String}
   * @param arrStack {Function | Array<Function>}
   * @param objError {jsx3.Exception}
   */
  Record_prototype.init = function(strMessage, arrParams, intLevel, strLogger, arrStack, objError) {
    this._serial = Record.SERIAL++;
    this._date = new Date();
    this._message = strMessage;
    this._params = arrParams;
    this._level = intLevel;
    this._logger = strLogger;
    this._stack = arrStack;
    this._error = objError;
  };
  
  /**
   * Returns this record's serial number. Every record that is created is assigned a serial number, beginning with 1.
   * @return {int}
   */
  Record_prototype.getSerial = function() {
    return this._serial;
  };
  
  /**
   * Returns the current date when this record was created.
   * @return {Date}
   */
  Record_prototype.getDate = function() {
    return this._date;
  };
  
  /**
   * Returns the raw message of this record.
   * @return {String}
   */
  Record_prototype.getMessage = function() {
    return this._message;
  };
  
  /**
   * Returns the message parameters of this record.
   * @return {Array<Object>}
   */
  Record_prototype.getParameters = function() {
    return this._params;
  };
  
  /**
   * Returns the logging level that this record was created with.
   * @return {int}
   */
  Record_prototype.getLevel = function() {
    return this._level;
  };
  
  /**
   * Returns the name of the logger that created this record.
   * @return {String}
   */
  Record_prototype.getLoggerName = function() {
    return this._logger;
  };
  
  /**
   * Returns the JavaScript function that called the Logger message that created this record.
   * @return {Function}
   */
  Record_prototype.getFunction = function() {
    return typeof(this._stack) == "function" ? this._stack : null;
  };
  
  /**
   * Returns the complete JavaScript stack from when this record was created. May be null or empty if the record
   * was not specified to store the stack.
   * @return {Array<Function>}
   */
  Record_prototype.getStack = function() {
    return jsx3.$A.is(this._stack) ? this._stack : null;
  };
  
  /**
   * Returns the exception that this record was created with. Will only be defined if this record was created through
   * a call to <code>Logger.logError()</code> or similar.
   * @return {jsx3.Exception}
   */
  Record_prototype.getError = function() {
    return this._error;
  };
  
});

/**
 * The base logging handler class. Handlers receive log records from loggers and output (or ignore) them in some way.
 * <p/>
 * Concrete subclasses of this class must implement the <code>handle()</code> method. This method defines what
 * to do to "handle" the logging record. This method does not need to check the handler's level against the level
 * of the record. The the logger does this before calling <code>handle()</code> and will not call 
 * <code>handle()</code> if the record's level is not severe enough.
 */
jsx3.Class.defineClass('jsx3.util.Logger.Handler', null, null, function(Handler, Handler_prototype) {

  var Logger = jsx3.util.Logger;
  var Manager = jsx3.util.Logger.Manager;
  
  /**
   * Call this method to let the logging system know that a new subclass of Handler has been defined. Handlers may
   * be defined in the configuration file to be lazy. The class of a lazy handler is not required to exist when the 
   * logging system initializes. However, for the lazy handler to be instantiated, this method must be called to let
   * the logging system know that the necessary class has loaded.
   * 
   * @param objClass {jsx3.Class} the subclass of Handler that was defined
   */
  Handler.registerHandlerClass = function(objClass) {
    Manager.getManager()._handlerClassDidLoad(objClass);
  };
  
  /** @private @jsxobf-clobber */
  Handler_prototype._name = "";
  /** @private @jsxobf-clobber */
  Handler_prototype._level = null;
  
  /**
   * @param strName {String} the name to assign this handler
   */
  Handler_prototype.init = function(strName) {
    this._name = strName;
  };

  Handler_prototype.onAfterInit = function() {};
  
  /**
   * Returns the name of this Handler.
   * @return {String}
   */
  Handler_prototype.getName = function() {
    return this._name;
  };
  
  /**
   * Returns the level of this handler. May be <code>null</code> if no level has been specified.
   * @return {int}
   */
  Handler_prototype.getLevel = function() {
    return this._level;
  };
  
  /**
   * Sets the level of this handler. 
   * @return {int} one of FATAL to TRACE, OFF, or null
   */
  Handler_prototype.setLevel = function(intLevel) {
    intLevel = Math.max(Logger.OFF, Math.min(Logger.MIN_LEVEL, intLevel));
    this._level = intLevel;
  };
    
  /**
   * Returns true if a log message sent to this handler at level <code>intLevel</code> will be processed rather than
   * ignored.
   * @param intLevel {int} the level to test
   * @return {boolean}
   */
  Handler_prototype.isLoggable = function(intLevel) {
    return this._level == null || this._level >= intLevel;
  };
  
  /**
   * Concrete subclasses of this class must implement this method, which defines how a log record is handled.
   * @param objRecord {jsx3.util.Logger.Record}
   */
  Handler_prototype.handle = jsx3.Method.newAbstract('objRecord');
  
});

/**
 * A simple Handler class that stores a rotating cache of log records in memory.
 * <p/>
 * May be configured with the <code>bufferSize</code> property (default 100).
 */
jsx3.Class.defineClass('jsx3.util.Logger.MemoryHandler', jsx3.util.Logger.Handler, null, function(MemoryHandler, MemoryHandler_prototype) {

  /** @private @jsxobf-clobber */
  MemoryHandler_prototype._buffer = null;
  /** @private @jsxobf-clobber */
  MemoryHandler_prototype._bufferSize = 100;

  /**
   * Instance initializer.
   */
  MemoryHandler_prototype.init = function(strName) {
    this.jsxsuper(strName);
    this._buffer = [];
  };
  
  /**
   * Stores the log record in memory. Removes the oldest record if the buffer is full.
   * @param objRecord {jsx3.util.Logger.Record}
   */
  MemoryHandler_prototype.handle = function(objRecord) {
    // TODO: make more efficient, is Array implementation a linked list? probably not
    this._buffer[this._buffer.length] = objRecord;
    
    if (this._buffer.length > this._bufferSize)
      this._buffer.shift();
  };
  
  /**
   * Clears the contents of the buffer.
   */
  MemoryHandler_prototype.clearBuffer = function() {
    this._buffer = [];
  };
  
  /**
   * Returns the size of the buffer. This handler will store at most this many log records before discarding old ones.
   * @return {int}
   */
  MemoryHandler_prototype.getBufferSize = function() {
    return this._bufferSize;
  };
  
  /**
   * Sets the size of the buffer. If this operation decreases the size of the buffer, log records may be discarded.
   * @param intBufferSize {int}
   */
  MemoryHandler_prototype.setBufferSize = function(intBufferSize) {
    this._bufferSize = Math.max(1, intBufferSize);
    
    if (this._buffer.length > this._bufferSize)
      this._buffer.splice(0, this._buffer.length - this._bufferSize);
  };
  
  /**
   * Returns the contents of the record buffer.
   * @param intCount {int} the number of records to return, the most recently added records will be returned. Pass <code>null</code> to get all records.
   * @return {Array<jsx3.util.Logger.Record>}
   */
  MemoryHandler_prototype.getRecords = function(intCount) {
    if (intCount == null) intCount = this._buffer.length;
    return this._buffer.slice(this._buffer.length - intCount);
  };
  
});

/**
 * A subclass of <code>Handler</code> that includes functionality for formatting logging records as human-readable
 * strings.
 * <p/>
 * The following tokens are supported in the format:
 * <ul>
 * <li>%s or {0} &#8211; record serial number</li>
 * <li>%n or {1}  &#8211; logger name</li>
 * <li>%l or {2}  &#8211; record level as string</li>
 * <li>%M or {3}  &#8211; record message</li>
 * <li>%f or {4}  &#8211; record calling function</li>
 * <li>%d or {5,date}  &#8211; record date as yyyy-MM-dd</li>
 * <li>%t or {5,time} &#8211; record time as HH:mm:ss.mmm</li>
 * </ul>
 */
jsx3.Class.defineClass('jsx3.util.Logger.FormatHandler', jsx3.util.Logger.Handler, null, function(FormatHandler, FormatHandler_prototype) {

  /** @private @jsxobf-clobber */
  FormatHandler_prototype._format = "%d %t %n (%l) - %M";
  /** @private @jsxobf-clobber */
  FormatHandler_prototype._dynaPropUrls = "";

  FormatHandler_prototype.init = function(strName) {
    this.jsxsuper(strName);
  };
  
  FormatHandler_prototype.format = function(objRecord) {
    var date = objRecord.getDate();
    var funct = objRecord.getFunction();
    var message = objRecord.getMessage() || ""; // TODO: need to do message format

    var mf = this._getMessageFormat();
    var levelString = jsx3.util.Logger.levelAsString(objRecord.getLevel());
    // mf may be null if the MessageFormat class is not available
    var output = mf ? mf.format(
        objRecord.getSerial(),
        objRecord.getLoggerName(),
        levelString,
        message,
        funct != null ? (funct.jsxmethod != null ? funct.jsxmethod.toString() : funct.toString()) : "",
        date
      ) : date + " " + objRecord.getLoggerName() + " (" + levelString + ") " + message;
    var error = objRecord.getError();
    var stack = objRecord.getStack();
    
    if (error != null) {
      output += "\n" + error.printStackTrace();
    } else if (stack != null) {
      output += "\n" + jsx3.Exception.formatStack(stack);
    }
    
    return output;
  };
  
  /**
   * Returns the format to use for formatting logging records.
   * @return {String}
   */
  FormatHandler_prototype.getFormat = function() {
    return this._format;
  };
  
  /**
   * Sets the format to use for formatting logging records.
   * @param strFormat {String}
   */
  FormatHandler_prototype.setFormat = function(strFormat) {
    this._format = strFormat;
    this._messageformat = null;
  };
  
  /** @private @jsxobf-clobber */
  FormatHandler_prototype._getMessageFormat = function() {
    // jsx3.util.MessageFormat class is optional, should work without it
    if (this._messageformat == null && jsx3.util.MessageFormat) {
      var f = this._format || "";
      f = f.replace(/\%s/g, "{0}");
      f = f.replace(/\%n/g, "{1}");
      f = f.replace(/\%l/g, "{2}");
      f = f.replace(/\%M/g, "{3}");
      f = f.replace(/\%f/g, "{4}");
      f = f.replace(/\%d/g, "{5,date,yyyy-MM-dd}");
      f = f.replace(/\%t/g, "{5,date,HH:mm:ss.SSS}");
      /* @jsxobf-clobber */
      this._messageformat = new jsx3.util.MessageFormat(f);
    }
    return this._messageformat;
  };

  FormatHandler_prototype.getResourceUrls = function() {
    return this._dynaPropUrls;
  };
  
  /**
   * Sets the URLs where dynamic properties files reside. These files specify the message resources to use
   * for this handler. If a log record is passed to this handler whose message matches a key in one of the jss files,
   * the value of that resource is formatted in place of the message key.
   *
   * @param strURLs {String} space-delimited list of URLs
   * @private  not yet implemented
   */
  FormatHandler_prototype.setResourceUrls = function(strURLs) {
    this._dynaPropUrls = strURLs;
  };
  
});

/**
 * Handles a logging record by sending it to the Firebug console.
 */
jsx3.Class.defineClass('jsx3.util.Logger.ConsoleHandler', jsx3.util.Logger.FormatHandler, null,
    function(ConsoleHandler, ConsoleHandler_prototype) {

  // maps logger levels to console method names
  var methods = [null, "error", "error", "warn", "info", "debug", "debug"];

  ConsoleHandler_prototype.handle = function(objRecord) {
    if (window.console) {
      var method = methods[objRecord.getLevel()];
      if (method) {
        try {
          // GI-808: IE8 doesn't define the console.debug() method, so default to console.log()
          (!console[method]) ? console.log(this.format(objRecord)) : console[method](this.format(objRecord));
        } catch (e) {}
      }
    }
  };

});

/**
 * Handles a logging record by sending it to a JavaScript alert.
 */
jsx3.Class.defineClass('jsx3.util.Logger.AlertHandler', jsx3.util.Logger.FormatHandler, null,
    function(AlertHandler, AlertHandler_prototype) {

  /** @private @jsxobf-clobber */
  AlertHandler_prototype._interval = 5;
  /** @private @jsxobf-clobber */
  AlertHandler_prototype._counter = 0;
  /** @private @jsxobf-clobber */
  AlertHandler_prototype._disabled = false;

  AlertHandler_prototype.handle = function(objRecord) {
    if (this._disabled) return;
    this._counter++;

    try {
      if (this._interval > 0 && (this._counter % this._interval) == 0) {
        if (! window.confirm(jsx3._msg("logr.alrt_ctd", this.getName()))) {
          this._disabled = true;
          return;
        }
      }

      window.alert(this.format(objRecord));
    } catch (e) {
      window.alert(jsx3._msg("logr.alrt_err", jsx3.NativeError.wrap(e)));
    }
  };

  /**
   * Returns the message interval at which the user has the opportunity to disable this handler.
   * @return {int}
   */
  AlertHandler_prototype.getConfirmInterval = function() {
    return this._interval;
  };

  /**
   * Sets the message interval at which the user has the opportunity to disable this handler.
   * @param intInterval {int}
   */
  AlertHandler_prototype.setConfirmInterval = function(intInterval) {
    this._interval = intInterval;
  };

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.util.Logger
 * @see jsx3.util.Logger
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.ERROR", -, null, function(){});
 */
jsx3.ERROR = jsx3.util.Logger;

/* @JSC :: end */
